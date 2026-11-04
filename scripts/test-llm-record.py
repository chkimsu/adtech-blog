#!/usr/bin/env python3
"""기록 도구(scripts/llm-record.py) 시험. Ollama 없이 돈다.

  python3 scripts/test-llm-record.py

순수 함수는 모듈을 불러 바로 본다. HTTP 를 쓰는 함수는 이 파일이 127.0.0.1 의 빈 포트에 띄우는 가짜 Ollama 서버에 보낸다.
기록 파일을 쓰는 시험은 임시 폴더에 도구를 복사해 돌린다. 저장소의 기록 파일과 프롬프트 파일은 읽기만 한다.
"""
import hashlib
import importlib.util
import json
import os
import shutil
import socket
import subprocess
import sys
import tempfile
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
TOOL = os.path.join(HERE, 'llm-record.py')
RECORDS = os.path.join(ROOT, 'data', 'llm-records')
SLUGS = ('interest-classification', 'contextual-targeting', 'natural-language-audience')

sys.dont_write_bytecode = True   # 도구를 불러도 scripts/__pycache__ 가 생기지 않게 한다
# 가짜 서버는 127.0.0.1 에 있다. 셸에 http_proxy 가 있어도 요청이 프록시로 새지 않게 한다(하위 프로세스도 물려받는다).
for _k in ('no_proxy', 'NO_PROXY'):
    _v = os.environ.get(_k, '')
    os.environ[_k] = ','.join(x for x in ('127.0.0.1', 'localhost', _v) if x)
spec = importlib.util.spec_from_file_location('llm_record', TOOL)
L = importlib.util.module_from_spec(spec)
spec.loader.exec_module(L)
L.RETRY_SLEEP = 0          # 다시 보내는 시험이 기다리지 않게 한다


def fingerprint():
    """저장소의 기록 파일과 프롬프트 파일의 해시. 시험 앞뒤로 견준다."""
    out = {}
    for sub in ('', 'prompts'):
        folder = os.path.join(RECORDS, sub)
        for name in sorted(os.listdir(folder)):
            path = os.path.join(folder, name)
            if os.path.isfile(path):
                with open(path, 'rb') as f:
                    out[os.path.join(sub, name)] = hashlib.sha256(f.read()).hexdigest()
    return out


REPO_BEFORE = fingerprint()

pass_ = fail = 0


def eq(name, got, want):
    global pass_, fail
    ok = got == want
    if ok:
        pass_ += 1
    else:
        fail += 1
    print('   %s %s%s' % ('✓' if ok else '✗', name, '' if ok else '\n       기대 %r\n       실제 %r' % (want, got)))


def read(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def stops(fn, *args):
    """fn 이 fail() 로 멈추면 그 말을, 멈추지 않으면 None 을 돌려준다."""
    try:
        fn(*args)
    except SystemExit as e:
        return str(e.code)
    return None


# ---------- 가짜 Ollama 서버 ----------
# 사용자 메시지에 trunc 가 있으면 done_reason length, noreason 이 있으면 done_reason 없이, boom 이 있으면 HTTP 500 을 돌려준다.
# 모델은 good 만 있다. 요청 수를 경로마다 센다.
CALLS = {'chat': 0, 'show': 0}


class Fake(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def reply(self, code, obj):
        body = json.dumps(obj).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == '/api/version':
            return self.reply(200, {'version': '0.0-test'})
        self.reply(404, {'error': 'not found'})

    def do_POST(self):
        req = json.loads(self.rfile.read(int(self.headers.get('Content-Length', 0))) or b'{}')
        if self.path == '/api/show':
            CALLS['show'] += 1
            if req.get('model') == 'good':
                return self.reply(200, {'modelfile': ''})
            return self.reply(404, {'error': "model '%s' not found" % req.get('model')})
        if self.path != '/api/chat':
            return self.reply(404, {'error': 'not found'})
        CALLS['chat'] += 1
        user = req['messages'][1]['content']
        if 'boom' in user:
            return self.reply(500, {'error': 'boom'})
        resp = {'message': {'role': 'assistant', 'content': '{"ok": true}'},
                'prompt_eval_count': 5, 'eval_count': 3, 'total_duration': 12000000}
        if 'noreason' not in user:
            resp['done_reason'] = 'length' if 'trunc' in user else 'stop'
        self.reply(200, resp)


server = HTTPServer(('127.0.0.1', 0), Fake)
threading.Thread(target=server.serve_forever, daemon=True).start()
HOST = 'http://127.0.0.1:%d' % server.server_address[1]


def closed_port():
    """아무도 듣지 않는 포트. 잡았다가 바로 놓는다."""
    s = socket.socket()
    s.bind(('127.0.0.1', 0))
    port = s.getsockname()[1]
    s.close()
    return port


# ---------- 임시 폴더의 도구 사본 ----------
# 도구는 자기 파일 자리에서 저장소 뿌리를 찾으므로, 사본은 work/data/llm-records 에 쓴다. 임시 파일은 TMPDIR 인 work/tmp 에 생긴다.
work = tempfile.mkdtemp(prefix='llm-record-test-')
os.makedirs(os.path.join(work, 'scripts'))
shutil.copy(TOOL, os.path.join(work, 'scripts', 'llm-record.py'))
recs = os.path.join(work, 'data', 'llm-records')
os.makedirs(os.path.join(recs, 'prompts'))
tmpfiles = os.path.join(work, 'tmp')
os.makedirs(tmpfiles)


def prompt(slug, spec_):
    with open(os.path.join(recs, 'prompts', slug + '.json'), 'w', encoding='utf-8') as f:
        json.dump(spec_, f, ensure_ascii=False)


def run_tool(*args):
    env = dict(os.environ, TMPDIR=tmpfiles)
    return subprocess.run([sys.executable, '-I', os.path.join(work, 'scripts', 'llm-record.py')] + list(args),
                          capture_output=True, text=True, env=env)


def temp_records(slug):
    return sorted(f for f in os.listdir(tmpfiles) if f.startswith('llm-record-%s-' % slug))


def raw(path):
    with open(path, 'rb') as f:
        return f.read()


try:
    print('key_of — 상수의 키')
    eq('기준 키', L.key_of({'id': 'a001', 'think': False, 'run': 1}), 'a001')
    eq('반복 키', L.key_of({'id': 'a001', 'think': False, 'run': 2}), 'a001|off|2')
    eq('think 켠 키', L.key_of({'id': 'p001', 'think': True, 'run': 1}), 'p001|on|1')

    print('\nconstant_lines — 키의 차례는 id 가 기록에 처음 나온 차례, 같은 id 안에서는 think 끈 것부터 run 차례')
    base = {'output': 'x', 'thinking_chars': 0, 'prompt_tokens': 1, 'output_tokens': 1, 'elapsed_ms': 1}
    items = [dict(base, id='b', think=False, run=1), dict(base, id='a', think=False, run=1),
             dict(base, id='b', think=True, run=1), dict(base, id='b', think=False, run=2)]
    lines = L.constant_lines(items, with_usage=True)
    eq('RECORD 키 차례', list(json.loads(lines[0][len('RECORD = '):])), ['b', 'b|off|2', 'b|on|1', 'a'])
    eq('USAGE 는 RECORD 와 같은 차례', list(json.loads(lines[1][len('USAGE = '):])), ['b', 'b|off|2', 'b|on|1', 'a'])

    print('\nplan_requests — 보낼 요청과 seed')
    nl = read(os.path.join(RECORDS, 'prompts', 'natural-language-audience.json'))
    plan = L.plan_requests(nl, None)
    keys = [L.key_of(j) for j in plan]
    eq('자연어 오디언스: 기준 3, 반복 3 × 5, think 1 로 19건', (len(plan), keys[:3], keys[-1]), (19, ['r1', 'r2', 'r3'], 'r2|on|1'))
    eq('반복 묶음의 키는 run 2 부터 6', [k for k in keys if k.startswith('r1|off|')], ['r1|off|%d' % r for r in range(2, 7)])
    eq('맨 위에 seed 가 없으면 기준 답과 think 항목은 seed 7',
       sorted({j['options']['seed'] for j in plan if j['run'] == 1}), [7])
    eq('맨 위에 seed 가 없으면 반복은 7 + run (9~13)',
       [j['options']['seed'] for j in plan if j['id'] == 'r1' and j['run'] >= 2], [9, 10, 11, 12, 13])
    eq('반복 묶음의 temperature 는 묶음의 0.7, 기준 답은 맨 위의 0',
       ({j['options']['temperature'] for j in plan if j['run'] >= 2}, {j['options']['temperature'] for j in plan if j['run'] == 1}),
       ({0.7}, {0}))
    seeded = dict(nl, options={'temperature': 0, 'seed': 7})
    eq('맨 위 options 에 seed 7 이 있으면 반복 묶음도 물려받아 모두 seed 7',
       sorted({j['options']['seed'] for j in L.plan_requests(seeded, None)}), [7])
    limited = L.plan_requests(nl, 2)
    eq('--limit 2 는 앞 두 id 와 그 반복, think 묶음만 보낸다',
       (len(limited), sorted({j['id'] for j in limited})), (13, ['r1', 'r2']))
    ic = L.plan_requests(read(os.path.join(RECORDS, 'prompts', 'interest-classification.json')), None)
    eq('관심사 분류: 200 + repeat_subset 40 × 3 = 320, 반복 seed 9, 10, 11',
       (len(ic), sum('|off|' in L.key_of(j) for j in ic), sorted({j['options']['seed'] for j in ic if j['run'] >= 2})),
       (320, 120, [9, 10, 11]))
    ct = L.plan_requests(read(os.path.join(RECORDS, 'prompts', 'contextual-targeting.json')), None)
    eq('컨텍스추얼: 50 + think_subset 10 = 60, think 켠 키 10개, 모두 seed 7',
       (len(ct), sum(L.key_of(j).endswith('|on|1') for j in ct), sorted({j['options']['seed'] for j in ct})), (60, 10, [7]))
    for slug in SLUGS:
        sent = [(j['id'], j['think'], j['run'], j['options'])
                for j in L.plan_requests(read(os.path.join(RECORDS, 'prompts', slug + '.json')), None)]
        got = [(it['id'], it['think'], it['run'], it['options']) for it in read(os.path.join(RECORDS, slug + '.json'))['items']]
        eq('%s: 지금 기록의 항목이 계획과 같은 차례, 같은 options' % slug, got, sent)

    print('\nprompt_problems — 프롬프트 파일의 꼴')
    for slug in SLUGS:
        eq('%s 프롬프트는 문제 없음' % slug, L.prompt_problems(read(os.path.join(RECORDS, 'prompts', slug + '.json'))), [])
    good = {'system': 's', 'items': [{'id': 'a', 'user': 'u'}, {'id': 'b', 'user': 'v'}], 'think': 'off', 'repeat': 1}
    eq('작은 좋은 프롬프트', L.prompt_problems(good), [])

    def has(spec_, text):
        return any(text in p for p in L.prompt_problems(spec_))

    eq('맨 위가 객체가 아니면', L.prompt_problems([]), ['맨 위가 객체가 아닙니다'])
    eq('items 가 없으면', has({k: v for k, v in good.items() if k != 'items'}, 'items 필드가 비어 있거나 목록이 아닙니다'), True)
    eq('id 가 겹치면', has(dict(good, items=[{'id': 'a', 'user': 'u'}, {'id': 'a', 'user': 'v'}]), 'id 가 겹칩니다: a'), True)
    eq('items 의 항목 꼴이 틀리면', has(dict(good, items=[{'id': 'a'}]), 'items 의 1번째가'), True)
    eq('options 가 객체가 아니면', has(dict(good, options=[1]), '맨 위의 options 가 객체가 아닙니다'), True)
    eq('temperature 가 음수면', has(dict(good, options={'temperature': -1}), 'temperature 가 0 이상의 수가 아닙니다'), True)
    eq('seed 가 정수가 아니면', has(dict(good, options={'seed': 1.5}), 'seed 가 정수가 아닙니다'), True)
    eq('모르는 필드가 있으면', has(dict(good, extra=1), '모르는 필드가 있습니다: extra'), True)
    eq('think 값이 틀리면', has(dict(good, think='maybe'), 'think 필드가'), True)
    eq('repeat 이 0 이면', has(dict(good, repeat=0), 'repeat 필드가 1 이상의 정수가 아닙니다'), True)
    eq('repeat 이 True 면(bool 은 정수로 받지 않는다)', has(dict(good, repeat=True), 'repeat 필드가 1 이상의 정수가 아닙니다'), True)
    eq('repeat_subset 의 ids 가 items 에 없으면',
       has(dict(good, repeat_subset={'ids': ['z'], 'repeat': 2}), 'repeat_subset 의 ids 에 items 에 없는 id'), True)
    eq('think_subset 의 꼴이 틀리면', has(dict(good, think_subset={'ids': ['a']}), 'think_subset 필드가'), True)

    print('\nrecord_problems — 기록 파일의 꼴')
    for slug in SLUGS:
        data = read(os.path.join(RECORDS, slug + '.json'))
        eq('%s 기록은 --with-usage 로도 문제 없음' % slug, (L.record_problems(data), L.record_problems(data, True)), ([], []))
    item = dict(base, id='a', think=False, run=1)

    def rec(*its):
        return {'items': list(its)}

    def names(data, with_usage=False):
        return ' '.join(L.record_problems(data, with_usage))

    eq('맨 위가 객체가 아니면', L.record_problems([1, 2]), ['맨 위가 {"items": [...]} 꼴이 아닙니다'])
    eq('items 가 목록이 아니면', L.record_problems({'items': {}}), ['맨 위가 {"items": [...]} 꼴이 아닙니다'])
    eq('객체가 아닌 항목', L.record_problems(rec(1)), ['items 의 1번째가 객체가 아닙니다'])
    eq('id 가 문자열이 아니면', 'id' in names(rec(dict(item, id=1))), True)
    eq('think 가 bool 이 아니면', 'think' in names(rec(dict(item, think=0))), True)
    eq('run 이 문자열이면', 'run' in names(rec(dict(item, run='1'))), True)
    eq('run 이 True 면(bool 은 정수로 받지 않는다)', 'run' in names(rec(dict(item, run=True))), True)
    eq('output 이 없으면', 'output' in names(rec({k: v for k, v in item.items() if k != 'output'})), True)
    eq('--with-usage 면 USAGE 네 값도 본다', ('prompt_tokens' in names(rec(dict(item, prompt_tokens=True)), True),
                                               names(rec(dict(item, prompt_tokens=True)))), (True, ''))
    err = {'id': 'a', 'think': False, 'run': 1, 'error': 'RuntimeError: x'}
    eq('error 항목은 키를 만드는 id, think, run 만 본다', L.record_problems(rec(err), True), [])
    eq('error 항목에 run 이 없으면', 'run' in names(rec({k: v for k, v in err.items() if k != 'run'})), True)

    print('\ncheck_model — 첫 요청 전에 모델을 묻는다')
    before = dict(CALLS)
    msg = stops(L.check_model, HOST, 'missing')
    eq('모델이 없으면(404) 멈추고 /api/chat 은 0건',
       (msg is not None and '모델 missing 가 없습니다' in msg, CALLS['show'] - before['show'], CALLS['chat'] - before['chat']), (True, 1, 0))
    msg = stops(L.check_model, 'http://127.0.0.1:%d' % closed_port(), 'good')
    eq('서버에 닿지 않아도 멈춘다', msg is not None and '확인하지 못했습니다' in msg, True)
    eq('모델이 있으면 지나간다', stops(L.check_model, HOST, 'good'), None)

    print('\ndone_reason — 잘린 답은 다시 보내지 않는다')

    def job(user):
        return {'id': 'a', 'think': False, 'run': 1, 'system': 's', 'user': user, 'options': {'temperature': 0, 'seed': 7}}

    for user, want in (('trunc me', (True, 'NoRetry: done_reason length', 1)), ('noreason', (False, '', 1)),
                       ('hello', (False, '', 1)), ('boom', (True, 'RuntimeError: HTTP 500', L.ATTEMPTS))):
        before = CALLS['chat']
        res = L.chat_with_retry(HOST, 'good', job(user))
        error = res.get('error', '')
        eq({'trunc me': 'done_reason 이 stop 이 아니면 error, 요청 1건', 'noreason': 'done_reason 이 없으면 지나간다, 요청 1건',
            'hello': 'stop 이면 지나간다, 요청 1건', 'boom': 'HTTP 오류는 ATTEMPTS 번 다시 보낸다'}[user],
           ('error' in res, error[:len(want[1])], CALLS['chat'] - before), want)

    print('\n기록 쓰기 — 덮어쓰기 가드와 맨 위 options (임시 폴더의 사본)')
    prompt('t', {'system': 's', 'items': [{'id': 'a1', 'user': 'hello'}, {'id': 'a2', 'user': 'world'}], 'think': 'off', 'repeat': 1})
    prompt('tr', {'system': 's', 'items': [{'id': 'a1', 'user': 'hello'}, {'id': 'a2', 'user': 'trunc me'}], 'think': 'off', 'repeat': 1})
    prompt('new', {'system': 's', 'items': [{'id': 'a1', 'user': 'hello'}, {'id': 'a2', 'user': 'world'}], 'think': 'off', 'repeat': 1})
    prompt('hot', {'system': 's', 'items': [{'id': 'a1', 'user': 'hello'}], 'think': 'off', 'repeat': 2, 'options': {'temperature': 0.7}})
    prompt('hotseed', {'system': 's', 'items': [{'id': 'a1', 'user': 'hello'}], 'think': 'off', 'repeat': 2,
                       'options': {'temperature': 0.7, 'seed': 3}})
    r = run_tool('--slug', 't', '--host', HOST, '--model', 'good')
    t_path = os.path.join(recs, 't.json')
    eq('파일이 없으면 제자리에 쓴다', (r.returncode, len(read(t_path)['items']), temp_records('t')), (0, 2, []))
    eq('temperature 0 이면 맨 위 options 는 기본값 그대로', read(t_path)['options'], {'temperature': 0, 'seed': 7})
    good_bytes = raw(t_path)
    r = run_tool('--slug', 't', '--host', HOST, '--model', 'good', '--limit', '1')
    tmp_t = temp_records('t')
    eq('파일이 있고 --limit 이면 임시 파일에 쓰고 원본은 그대로, 종료 코드 0',
       (r.returncode, raw(t_path) == good_bytes, len(tmp_t), len(read(os.path.join(tmpfiles, tmp_t[0]))['items']) if tmp_t else None,
        '그대로 둡니다' in r.stdout), (0, True, 1, 1, True))
    eq('요약 줄이 늘 끝 줄이다', r.stdout.strip().splitlines()[-1].startswith('✓ '), True)
    tr_path = os.path.join(recs, 'tr.json')
    shutil.copy(t_path, tr_path)
    r = run_tool('--slug', 'tr', '--host', HOST, '--model', 'good')
    tmp_tr = temp_records('tr')
    eq('파일이 있고 error 가 남으면 임시 파일에 쓰고 원본은 그대로, 종료 코드 1',
       (r.returncode, raw(tr_path) == good_bytes, len(tmp_tr),
        ['error' in it for it in read(os.path.join(tmpfiles, tmp_tr[0]))['items']] if tmp_tr else None),
       (1, True, 1, [False, True]))
    r = run_tool('--slug', 'tr', '--host', HOST, '--model', 'good', '--force')
    eq('--force 면 error 가 남아도 덮어쓴다(종료 코드는 1)',
       (r.returncode, ['error' in it for it in read(tr_path)['items']], len(temp_records('tr'))), (1, [False, True], 1))
    r = run_tool('--slug', 't', '--host', HOST, '--model', 'good', '--limit', '1', '--force')
    eq('--limit 에 --force 면 덮어쓴다', (r.returncode, len(read(t_path)['items']), len(temp_records('t'))), (0, 1, 1))
    r = run_tool('--slug', 'new', '--host', HOST, '--model', 'good', '--limit', '1')
    eq('파일이 없으면 --limit 이어도 제자리에 쓴다',
       (r.returncode, len(read(os.path.join(recs, 'new.json'))['items']), temp_records('new')), (0, 1, []))
    run_tool('--slug', 'hot', '--host', HOST, '--model', 'good')
    hot = read(os.path.join(recs, 'hot.json'))
    eq('seed 없이 temperature 0.7 이면 맨 위에 seed 를 적지 않고, 항목은 7 + run',
       (hot['options'], [it['options']['seed'] for it in hot['items']]), ({'temperature': 0.7}, [8, 9]))
    run_tool('--slug', 'hotseed', '--host', HOST, '--model', 'good')
    hotseed = read(os.path.join(recs, 'hotseed.json'))
    eq('seed 를 적었으면 맨 위에도 항목에도 그 seed',
       (hotseed['options'], [it['options']['seed'] for it in hotseed['items']]), ({'temperature': 0.7, 'seed': 3}, [3, 3]))
    before = dict(CALLS)
    r = run_tool('--slug', 'new', '--host', HOST, '--model', 'missing')
    eq('없는 모델로 기록하면 /api/chat 0건으로 멈춘다(종료 코드 1)',
       (r.returncode, '모델 missing 가 없습니다' in r.stderr, CALLS['chat'] - before['chat']), (1, True, 0))

    print('\n인자 — --force 는 기록할 때만')
    r = run_tool('--slug', 't', '--export-constant', '--force')
    eq('--force 와 --export-constant 는 같이 주면 거부', (r.returncode, '--force 는 기록할 때만 씁니다' in r.stderr), (2, True))
    r = run_tool('--selftest', '--force', '--host', HOST, '--model', 'good')
    eq('--force 와 --selftest 도 거부', (r.returncode, '--force 는 기록할 때만 씁니다' in r.stderr), (2, True))
    r = run_tool('--slug', 't', '--export-constant')
    eq('--export-constant 만 주면 상수를 찍는다', (r.returncode, r.stdout.startswith('RECORD = {"a1": ')), (0, True))
    with open(os.path.join(recs, 'bad.json'), 'w', encoding='utf-8') as f:
        json.dump({'items': [{'id': 'a1', 'think': False, 'run': 1}]}, f)
    r = run_tool('--slug', 'bad', '--export-constant')
    eq('꼴이 틀린 기록은 traceback 없이 틀린 자리를 알린다',
       (r.returncode, '모양이 틀렸습니다' in r.stderr, 'Traceback' in r.stderr), (1, True, False))

    print('\n저장소')
    eq('저장소의 기록 파일과 프롬프트 파일은 시험 앞뒤로 바이트까지 같다', fingerprint(), REPO_BEFORE)
finally:
    server.shutdown()
    shutil.rmtree(work, ignore_errors=True)

if fail:
    print('\n✗ 기록 도구 시험 %d건 실패, %d건 통과' % (fail, pass_))
    sys.exit(1)
print('\n✓ 기록 도구 시험 %d건 통과' % pass_)
