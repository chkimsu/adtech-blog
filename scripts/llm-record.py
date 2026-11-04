#!/usr/bin/env python3
"""LLM 글에 붙일 출력을 Ollama 로 한 번 기록하고, 글의 파이썬 블록에 옮길 상수로 뽑는다. 설계: docs/superpowers/specs/2026-11-03-llm-tracks-design.md 5절

  python3 scripts/llm-record.py --slug <slug>                    기록: prompts/<slug>.json 을 보내 <slug>.json 을 쓴다 (있으면 덮어쓴다.
                                                                 다만 --limit 이거나 error 가 남은 새 기록은 임시 폴더에 쓰고, --force 면 덮어쓴다)
  python3 scripts/llm-record.py --slug <slug> --export-constant  상수 뽑기: 기록의 출력을 RECORD = {...} 한 줄로 찍는다
  python3 scripts/llm-record.py --slug <slug> --export-constant --with-usage
                                                                 RECORD 줄 아래에 USAGE = {...} 한 줄을 더 찍는다.
                                                                 키는 RECORD 와 같은 차례이고 값은 [prompt_tokens, output_tokens, elapsed_ms, thinking_chars] 다
  python3 scripts/llm-record.py --selftest                       자체 점검: 서버 버전을 묻고 한 줄짜리 요청 하나로 기록 형식을 본다

Ollama 는 `ollama serve` 로 먼저 띄운다.
기록할 때 --model(기본 qwen3.5:27b), --host(기본 http://localhost:11434), --limit N(프롬프트 항목 앞 N개만, 시험용), --force 를 줄 수 있다.
기록을 시작하기 전에 서버 버전과 모델이 있는지를 묻고, 답이 잘려 온 항목(done_reason 이 stop 이 아님)은 다시 보내지 않고 error 로 남긴다.
두 파일은 data/llm-records/ 에 있고 형식은 그 폴더의 README.md 에 있다. 표준 라이브러리만 쓴다.
"""
import argparse
import datetime
import json
import os
import tempfile
import time
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RECORDS = os.path.join(ROOT, 'data', 'llm-records')
MODEL = 'qwen3.5:27b'
HOST = 'http://localhost:11434'
OPTIONS = {'temperature': 0, 'seed': 7}   # 기본값. 프롬프트 파일의 options 가 그 위에 얹힌다
TIMEOUT = 600        # thinking 을 켠 항목은 몇 분이 걸리기도 한다
ATTEMPTS = 3         # 한 항목을 보내 보는 횟수. 다 실패하면 그 항목에 error 를 남기고 다음 항목으로 간다
RETRY_SLEEP = 2
THINK = {'off': [False], 'on': [True], 'both': [False, True]}
PROMPT_KEYS = {'system', 'items', 'think', 'repeat', 'repeat_subset', 'think_subset', 'options'}
# 기록 항목의 필드와 자료형. 자체 점검이 이 목록으로 응답을 본다.
ITEM_FIELDS = [('id', str), ('think', bool), ('run', int), ('system', str), ('user', str), ('output', str),
               ('thinking_chars', int), ('prompt_tokens', int), ('output_tokens', int), ('elapsed_ms', int),
               ('options', dict)]
SELFTEST = {'system': 'Reply with JSON only.', 'user': 'Return {"ok": true}.'}
# --with-usage 가 키마다 찍는 네 값의 차례
USAGE_FIELDS = ('prompt_tokens', 'output_tokens', 'elapsed_ms', 'thinking_chars')


def fail(msg):
    """알릴 말을 stderr 에 쓰고 1 로 끝낸다."""
    raise SystemExit('✗ ' + msg)


def rel(path):
    return os.path.relpath(path, ROOT)


def read_json(path, hint):
    try:
        with open(path, encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        fail('%s 가 없습니다. %s' % (rel(path), hint))
    except ValueError as e:
        fail('%s 를 JSON 으로 읽지 못했습니다: %s' % (rel(path), e))


def is_type(value, kind):
    """자료형을 본다. bool 은 int 의 하위형이라 int 자리에서는 따로 막는다."""
    return isinstance(value, kind) and (kind is bool or not isinstance(value, bool))


def is_count(value):
    return is_type(value, int) and value >= 1


def is_think(value):
    return is_type(value, str) and value in THINK


def think_name(think):
    return 'on' if think else 'off'


def options_problems(where, opts):
    """options 하나를 본다. temperature 와 seed 만 보고 나머지 키는 Ollama 에 그대로 넘긴다."""
    if not isinstance(opts, dict):
        return ['%s 가 객체가 아닙니다' % where]
    out = []
    if 'temperature' in opts and not (is_type(opts['temperature'], (int, float)) and opts['temperature'] >= 0):
        out.append('%s 의 temperature 가 0 이상의 수가 아닙니다' % where)
    if 'seed' in opts and not is_type(opts['seed'], int):
        out.append('%s 의 seed 가 정수가 아닙니다' % where)
    return out


def subset_problems(spec, key, field, ok, rule, ids):
    """repeat_subset, think_subset 하나를 본다. 그 안의 options 는 있어도 되고 없어도 된다."""
    sub = spec[key]
    if not (isinstance(sub, dict) and set(sub) - {'options'} == {'ids', field} and isinstance(sub['ids'], list)):
        return ['%s 필드가 {"ids": [...], "%s": ...} 꼴이 아닙니다 (options 는 더해도 됩니다)' % (key, field)]
    out = [] if ok(sub[field]) else ['%s 의 %s 값이 %s 가 아닙니다' % (key, field, rule)]
    if 'options' in sub:
        out += options_problems('%s 의 options' % key, sub['options'])
    stray = [str(i) for i in sub['ids'] if i not in ids]
    if stray:
        out.append('%s 의 ids 에 items 에 없는 id 가 있습니다: %s' % (key, ', '.join(stray)))
    return out


def prompt_problems(spec):
    """프롬프트 파일에서 형식이 틀린 곳을 모은다. 맞으면 빈 목록이다."""
    if not isinstance(spec, dict):
        return ['맨 위가 객체가 아닙니다']
    out = ['모르는 필드가 있습니다: %s' % k for k in sorted(set(spec) - PROMPT_KEYS)]
    if not is_type(spec.get('system'), str):
        out.append('system 필드가 문자열이 아닙니다')
    items = spec.get('items')
    if not (isinstance(items, list) and items):
        out.append('items 필드가 비어 있거나 목록이 아닙니다')
        items = []
    ids = []
    for n, it in enumerate(items, 1):
        if isinstance(it, dict) and set(it) == {'id', 'user'} and is_type(it['id'], str) and is_type(it['user'], str):
            ids.append(it['id'])
        else:
            out.append('items 의 %d번째가 {"id": 문자열, "user": 문자열} 꼴이 아닙니다' % n)
    dup = sorted({i for i in ids if ids.count(i) > 1})
    if dup:
        out.append('id 가 겹칩니다: ' + ', '.join(dup))
    if not is_think(spec.get('think')):
        out.append('think 필드가 "off", "on", "both" 가운데 하나가 아닙니다')
    if not is_count(spec.get('repeat')):
        out.append('repeat 필드가 1 이상의 정수가 아닙니다')
    if 'options' in spec:
        out += options_problems('맨 위의 options', spec['options'])
    if 'repeat_subset' in spec:
        out += subset_problems(spec, 'repeat_subset', 'repeat', is_count, '1 이상의 정수', ids)
    if 'think_subset' in spec:
        out += subset_problems(spec, 'think_subset', 'think', is_think, '"off", "on", "both" 가운데 하나', ids)
    return out


def load_prompts(slug):
    """프롬프트 파일을 읽는다. 형식이 틀리면 틀린 곳을 모두 알리고 멈춘다."""
    path = os.path.join(RECORDS, 'prompts', slug + '.json')
    spec = read_json(path, '형식은 data/llm-records/README.md 에 있습니다')
    problems = prompt_problems(spec)
    if problems:
        fail('%s 의 형식이 틀렸습니다\n  %s' % (rel(path), '\n  '.join(problems)))
    return spec


def request_options(given, run):
    """한 요청에 보낼 options. 기본값 위에 프롬프트 파일이 적은 값을 얹는다.
    seed 를 적지 않았는데 temperature 가 0 보다 크면 seed 를 7 + run 으로 둔다.
    그러면 run 마다 다른 seed 로 뽑는다. temperature 0 은 다시 기록해도 같은 답이 나왔다.
    temperature 0.7 은 seed 를 고정해도 다시 기록할 때 답이 달라질 수 있다(자연어 오디언스 편에서 확인)."""
    opts = dict(OPTIONS)
    opts.update(given)
    if 'seed' not in given and opts['temperature'] > 0:
        opts['seed'] = OPTIONS['seed'] + run
    return opts


def plan_requests(spec, limit):
    """보낼 요청을 차례대로 늘어놓는다. run 은 같은 id 와 think 로 보내는 몇 번째인지다."""
    users = {it['id']: it['user'] for it in spec['items'][:limit]}
    top = spec.get('options', {})
    sent, plan = {}, []

    def send(ids, thinks, times, given):
        for i in ids:
            if i not in users:        # --limit 밖의 id 다
                continue
            for think in thinks:
                for _ in range(times):
                    sent[i, think] = sent.get((i, think), 0) + 1
                    run = sent[i, think]
                    plan.append({'id': i, 'think': think, 'run': run, 'system': spec['system'],
                                 'user': users[i], 'options': request_options(given, run)})

    # 모든 항목을 repeat 번 보낸 뒤, repeat_subset 은 run 을 이어 붙이고 think_subset 은 그 think 로 한 번 더 보낸다.
    # 묶음 안의 options 는 맨 위 options 위에 얹혀 그 묶음에만 쓰인다.
    send(list(users), THINK[spec['think']], spec['repeat'], top)
    if 'repeat_subset' in spec:
        sub = spec['repeat_subset']
        send(sub['ids'], THINK[spec['think']], sub['repeat'], {**top, **sub.get('options', {})})
    if 'think_subset' in spec:
        sub = spec['think_subset']
        send(sub['ids'], THINK[sub['think']], 1, {**top, **sub.get('options', {})})
    return plan


def api(host, path):
    return host.rstrip('/') + '/api/' + path


def server_version(host):
    """서버 버전을 묻는다. 닿지 않으면 띄우는 법을 알리고 멈춘다."""
    try:
        with urllib.request.urlopen(api(host, 'version'), timeout=10) as r:
            return json.load(r)['version']
    except Exception as e:
        fail('Ollama 서버 %s 에 닿지 않습니다 (%s: %s). `ollama serve` 로 먼저 띄웁니다' % (host, type(e).__name__, e))


def check_model(host, model):
    """모델이 서버에 있는지 /api/show 로 묻는다. 없으면 항목마다 다시 보내며 늦게 실패하지 않게 첫 요청 전에 멈춘다."""
    req = urllib.request.Request(api(host, 'show'), data=json.dumps({'model': model, 'name': model}).encode('utf-8'),
                                 headers={'Content-Type': 'application/json'}, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=30):
            return
    except urllib.error.HTTPError as e:
        if e.code == 404:
            fail('Ollama 서버에 모델 %s 가 없습니다. `ollama pull %s` 로 먼저 받습니다' % (model, model))
        fail('모델 %s 를 확인하지 못했습니다 (HTTP %d %s)' % (model, e.code, e.read().decode('utf-8', 'replace').strip()))
    except Exception as e:
        fail('모델 %s 를 확인하지 못했습니다 (%s: %s)' % (model, type(e).__name__, e))


class NoRetry(RuntimeError):
    """다시 보내도 같은 결과가 나오는 실패. 기록은 temperature 와 seed 를 고정해 보내서 잘린 답은 다시 보내도 잘린다."""


def chat_once(host, model, system, user, think, options):
    """/api/chat 에 한 번 보내고 기록할 다섯 값을 돌려준다. 응답에 필드가 빠지면 KeyError 가 난다.
    done_reason 이 stop 이 아니면(length 는 출력 길이 한도에 닿아 잘린 것이다) 잘린 답을 남기지 않고 NoRetry 를 낸다."""
    body = {'model': model,
            'messages': [{'role': 'system', 'content': system}, {'role': 'user', 'content': user}],
            'stream': False, 'think': think, 'options': options}
    req = urllib.request.Request(api(host, 'chat'), data=json.dumps(body).encode('utf-8'),
                                 headers={'Content-Type': 'application/json'}, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            resp = json.load(r)
    except urllib.error.HTTPError as e:
        # 서버가 돌려준 오류 문장을 남긴다. 모델이 없으면 404 와 model '...' not found 가 온다.
        raise RuntimeError('HTTP %d %s' % (e.code, e.read().decode('utf-8', 'replace').strip())) from None
    reason = resp.get('done_reason')   # 이 필드가 없는 옛 서버는 보지 않는다
    if reason not in (None, 'stop'):
        raise NoRetry('done_reason %s: 답이 끝까지 오지 않았습니다' % reason)
    msg = resp['message']
    return {'output': msg['content'],
            'thinking_chars': len(msg.get('thinking') or ''),
            'prompt_tokens': resp['prompt_eval_count'],
            'output_tokens': resp['eval_count'],
            'elapsed_ms': round(resp['total_duration'] / 1e6)}


def chat_with_retry(host, model, job):
    """한 요청을 ATTEMPTS 번까지 보낸다. 다 실패하면 마지막 오류를 error 필드로 돌려준다."""
    for attempt in range(ATTEMPTS):
        if attempt:
            time.sleep(RETRY_SLEEP)
        try:
            return chat_once(host, model, job['system'], job['user'], job['think'], job['options'])
        except NoRetry as e:          # 잘린 답은 다시 보내도 같아서 바로 error 로 남긴다
            return {'error': '%s: %s' % (type(e).__name__, e)}
        except Exception as e:        # 시간 초과, 끊긴 연결, HTTP 오류, 응답에 빠진 필드를 모두 다시 보낸다
            error = '%s: %s' % (type(e).__name__, e)
    return {'error': error}


def make_item(job, result):
    """기록 항목 하나. 필드 차례는 README 의 형식과 같고 실제로 보낸 options 가 맨 끝에 온다.
    실패한 항목은 output 부터 elapsed_ms 까지 대신 error 를 갖는다."""
    item = {k: job[k] for k in ('id', 'think', 'run', 'system', 'user')}
    item.update(result)
    item['options'] = job['options']
    return item


def record(slug, model, host, limit, force=False):
    """프롬프트 파일의 요청을 차례로 보내 기록 파일을 통째로 새로 쓴다. error 가 남으면 1 을 돌려준다.
    기록 파일이 이미 있으면 --limit 으로 시험한 기록이나 error 가 남은 기록으로는 덮어쓰지 않고 임시 폴더에 쓴다."""
    spec = load_prompts(slug)
    version = server_version(host)    # 서버가 없으면 요청을 하나도 보내지 않고 멈춘다
    check_model(host, model)          # 모델이 없어도 요청을 하나도 보내지 않고 멈춘다
    plan = plan_requests(spec, limit)
    recorded_at = datetime.date.today().isoformat()
    # 진행 줄은 바로 내보낸다. 파일로 받아 지켜볼 때도 끝날 때까지 비어 있지 않다
    print('Ollama %s 의 %s 에 요청 %d개를 보냅니다' % (version, model, len(plan)), flush=True)
    start = shown = time.time()
    items, errors = [], 0
    for n, job in enumerate(plan, 1):
        item = make_item(job, chat_with_retry(host, model, job))
        items.append(item)
        if 'error' in item:
            errors += 1
            print('  %s think %s run %d 실패: %s' % (item['id'], think_name(item['think']), item['run'], item['error']),
                  flush=True)
        # 빠른 항목은 20개마다, 느린 항목(thinking)은 1분마다 한 줄씩 알린다
        if n == len(plan) or n % 20 == 0 or time.time() - shown >= 60:
            print('  %d/%d 보냄, %d초, error %d개' % (n, len(plan), time.time() - start, errors), flush=True)
            shown = time.time()
    path = os.path.join(RECORDS, slug + '.json')
    # 맨 위 options 는 파일의 기본값이다. 요청마다 실제로 보낸 값은 항목의 options 에 있다.
    # seed 를 적지 않았는데 temperature 가 0 보다 크면 요청마다 7 + run 을 보냈으니, 맨 위에는 seed 를 적지 않는다
    given = spec.get('options', {})
    top = {**OPTIONS, **given}
    if 'seed' not in given and top['temperature'] > 0:
        del top['seed']
    out = path
    if os.path.exists(path) and not force and (limit is not None or errors):
        fd, out = tempfile.mkstemp(prefix='llm-record-%s-' % slug, suffix='.json')
        os.close(fd)
        print('  이미 있는 %s 는 그대로 둡니다. %s 기록이라 임시 폴더에 쓰고, 덮어쓰려면 --force 를 더합니다' % (
            rel(path), '--limit 으로 시험한' if limit is not None else 'error 가 남은'))
    with open(out, 'w', encoding='utf-8') as f:
        json.dump({'model': model, 'recorded_at': recorded_at, 'host': host, 'options': top, 'items': items},
                  f, ensure_ascii=False, indent=2)
        f.write('\n')
    # 끝 줄은 늘 이 줄이다. 가이드가 기록 뒤에 이 줄의 error 수를 보라고 적었다
    print('%s %s 에 항목 %d개를 썼습니다. error %d개, %d초' % (
        '✗' if errors else '✓', rel(out) if out == path else out, len(items), errors, time.time() - start))
    return 1 if errors else 0


def key_of(item):
    """상수의 키. think 를 끈 첫 회차는 id 그대로, 그 밖은 a001|on|1, a001|off|2 꼴이다."""
    if not item['think'] and item['run'] == 1:
        return item['id']
    return '%s|%s|%d' % (item['id'], think_name(item['think']), item['run'])


def constant_lines(items, with_usage=False):
    """상수 줄. RECORD = {...} 한 줄이고, with_usage 면 같은 키 차례의 USAGE = {...} 한 줄이 뒤에 붙는다.
    id 는 기록에 처음 나온 차례로, 같은 id 안에서는 think 끈 것부터 run 차례로 둔다."""
    first = {}
    for it in items:
        first.setdefault(it['id'], len(first))
    items = sorted(items, key=lambda it: (first[it['id']], it['think'], it['run']))
    lines = ['RECORD = ' + json.dumps({key_of(it): it['output'] for it in items}, ensure_ascii=False)]
    if with_usage:
        lines.append('USAGE = ' + json.dumps({key_of(it): [it[f] for f in USAGE_FIELDS] for it in items}))
    return lines


def record_problems(data, with_usage=False):
    """기록 파일에서 상수를 뽑는 데 쓰는 필드의 모양을 본다. 맞으면 빈 목록이다.
    error 항목은 키를 만들 id, think, run 만 보고, 나머지 항목은 output 과 --with-usage 의 네 값까지 본다."""
    if not (isinstance(data, dict) and isinstance(data.get('items'), list)):
        return ['맨 위가 {"items": [...]} 꼴이 아닙니다']
    out = []
    for n, it in enumerate(data['items'], 1):
        if not isinstance(it, dict):
            out.append('items 의 %d번째가 객체가 아닙니다' % n)
            continue
        fields = [('id', str), ('think', bool), ('run', int)]
        if 'error' not in it:
            fields += [('output', str)] + ([(f, int) for f in USAGE_FIELDS] if with_usage else [])
        bad = [name for name, kind in fields if not is_type(it.get(name), kind)]
        if bad:
            out.append('items 의 %d번째에 %s 가 없거나 자료형이 틀렸습니다' % (n, ', '.join(bad)))
    return out


def export_constant(slug, with_usage=False):
    """기록의 출력을 RECORD = {...} 한 줄로 찍는다. id 는 기록에 처음 나온 차례다. 모양이 틀리거나 error 가 남은 기록에서는 뽑지 않는다."""
    path = os.path.join(RECORDS, slug + '.json')
    data = read_json(path, '먼저 python3 scripts/llm-record.py --slug %s 로 기록합니다' % slug)
    problems = record_problems(data, with_usage)
    if problems:
        fail('%s 의 모양이 틀렸습니다\n  %s' % (rel(path), '\n  '.join(problems[:10] + (['…'] if len(problems) > 10 else []))))
    items = data['items']
    broken = [key_of(it) for it in items if 'error' in it]
    if broken:
        fail('error 가 남은 항목이 %d개 있어 상수를 뽑지 않습니다 (%s). 다시 기록합니다' % (
            len(broken), ', '.join(broken[:5]) + (', …' if len(broken) > 5 else '')))
    for line in constant_lines(items, with_usage):
        print(line)
    return 0


def usage_problems(item):
    """--with-usage 시험. 기록 항목 하나로 think 켠 짝을 만들어 차례를 뒤집어 넘기고, USAGE 줄이
    RECORD 와 같은 키 차례이고 값이 항목의 네 필드와 같은지 본다. 맞으면 빈 목록이다."""
    on = dict(item, think=True, thinking_chars=item['thinking_chars'] + 1)
    lines = constant_lines([on, item], with_usage=True)
    if len(lines) != 2 or not lines[0].startswith('RECORD = ') or not lines[1].startswith('USAGE = '):
        return ['RECORD 줄과 USAGE 줄 두 줄이 아닙니다']
    record = json.loads(lines[0][len('RECORD = '):])
    usage = json.loads(lines[1][len('USAGE = '):])
    out = []
    if list(record) != [key_of(item), key_of(on)] or list(usage) != list(record):
        out.append('USAGE 의 키 차례가 RECORD 와 다릅니다: %s 대 %s' % (list(usage), list(record)))
    elif [usage[key_of(it)] for it in (item, on)] != [[it[f] for f in USAGE_FIELDS] for it in (item, on)]:
        out.append('USAGE 의 값이 항목의 %s 와 다릅니다' % ', '.join(USAGE_FIELDS))
    return out


def selftest(model, host):
    """서버 버전을 묻고 한 줄짜리 요청 하나를 보내, 기록 항목의 필드가 다 있고 자료형이 맞는지 본다."""
    server_version(host)
    job = {'id': 'selftest', 'think': False, 'run': 1, 'system': SELFTEST['system'], 'user': SELFTEST['user'],
           'options': request_options({}, 1)}
    try:
        item = make_item(job, chat_once(host, model, job['system'], job['user'], job['think'], job['options']))
    except Exception as e:
        fail('요청 하나가 실패했습니다 — %s: %s' % (type(e).__name__, e))
    bad = [name for name, kind in ITEM_FIELDS if not is_type(item.get(name), kind)]
    if not bad and not item['output'].strip():
        bad = ['output']
    if bad:
        fail('응답으로 만든 기록 항목에서 필드가 빠지거나 자료형이 틀렸습니다: ' + ', '.join(bad))
    usage = usage_problems(item)      # 요청을 더 보내지 않고 이 항목으로 --with-usage 의 두 줄을 본다
    if usage:
        fail('--with-usage 시험이 틀렸습니다: ' + '; '.join(usage))
    print('selftest ok: model=%s prompt_tokens=%d output_tokens=%d elapsed_ms=%d with_usage=ok' % (
        model, item['prompt_tokens'], item['output_tokens'], item['elapsed_ms']))
    return 0


def main():
    ap = argparse.ArgumentParser(description='Ollama 로 LLM 출력을 기록하고 글의 파이썬 블록에 옮길 상수로 뽑는다')
    ap.add_argument('--slug', help='글 id. data/llm-records/prompts/<slug>.json 을 보내 data/llm-records/<slug>.json 을 쓴다')
    ap.add_argument('--model', default=MODEL, help='모델 (기본 %(default)s, 설계가 고정한 값이다)')
    ap.add_argument('--host', default=HOST, help='Ollama 주소 (기본 %(default)s)')
    ap.add_argument('--limit', type=int, metavar='N',
                    help='프롬프트 항목 앞 N개만 보낸다 (시험용. 기록 파일이 이미 있으면 덮어쓰지 않고 임시 폴더에 쓴다)')
    ap.add_argument('--force', action='store_true',
                    help='이미 있는 기록 파일을 --limit 이나 error 가 남은 새 기록으로도 덮어쓴다')
    mode = ap.add_mutually_exclusive_group()
    mode.add_argument('--export-constant', action='store_true', help='기록의 출력을 RECORD = {...} 파이썬 상수로 찍는다')
    mode.add_argument('--selftest', action='store_true', help='서버 버전과 한 줄짜리 요청 하나로 기록 형식을 확인한다')
    ap.add_argument('--with-usage', action='store_true',
                    help='--export-constant 와 같이 쓴다. RECORD 아래에 USAGE = {키: [%s]} 한 줄을 더 찍는다' % ', '.join(USAGE_FIELDS))
    args = ap.parse_args()
    if args.with_usage and not args.export_constant:
        ap.error('--with-usage 는 --export-constant 와 같이 씁니다')
    if args.force and (args.export_constant or args.selftest):
        ap.error('--force 는 기록할 때만 씁니다')
    if args.selftest:
        raise SystemExit(selftest(args.model, args.host))
    if not args.slug:
        ap.error('--selftest 가 아니면 --slug 가 필요합니다')
    if args.limit is not None and args.limit < 1:
        ap.error('--limit 은 1 이상입니다')
    if args.export_constant:
        raise SystemExit(export_constant(args.slug, args.with_usage))
    raise SystemExit(record(args.slug, args.model, args.host, args.limit, args.force))


if __name__ == '__main__':
    main()
