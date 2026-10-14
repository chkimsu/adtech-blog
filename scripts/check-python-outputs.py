#!/usr/bin/env python3
"""파이썬 블록을 실제로 돌려 적힌 출력과 같은지 본다. 설계: docs/superpowers/specs/2026-10-13-python-code-blocks-design.md

  python3 scripts/check-python-outputs.py              새 형식 블록을 돌린다 (CI)
  python3 scripts/check-python-outputs.py --legacy     옛 형식 블록도 돌린다 (옮길 때 로컬에서)
  python3 scripts/check-python-outputs.py --post <글>   글 하나만 돌린다 (posts/ 의 파일 이름, .md 는 뺀다)
  python3 scripts/check-python-outputs.py --jobs <n>   동시에 돌릴 수 (기본 4)
  python3 scripts/check-python-outputs.py --root <폴더> posts/ 를 그 폴더에서 찾는다 (시험용)
  python3 scripts/check-python-outputs.py --show       블록마다 찍힌 줄을 뜻 줄 자리와 함께 보여 준다 (옮길 때 붙여 쓴다)

블록 읽기는 js/code-steps.js 한 곳에 있다. node scripts/check-code-blocks.js --json 으로 받아 쓴다.
표준 라이브러리만 쓴다. import 할 수 없는 라이브러리를 쓰는 블록은 실패로 치지 않고 건너뛴다.
찍힌 줄마다 그 줄을 쓸 때 실행 중이던 모듈 최상위 문장을 찾아, 그 문장이 속한 단계와 뜻 줄의 번호를 견준다.
"""
import argparse
import concurrent.futures as cf
import json
import os
import re
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TIMEOUT = 120
OUT_MARK = re.compile(r'^# 출력(?=[\s(:]|$)')
NUM = re.compile(r'\d+(?:[.,]\d+)*')

# 블록마다 새 프로세스에서 돈다. stdin 으로 {prefix: [앞 코드...], code: 블록 코드} 를 받는다.
HARNESS = r'''
import io, json, sys, types
job = json.load(sys.stdin)
real = sys.stdout
class W(io.TextIOBase):
    def __init__(self):
        self.lines, self.buf, self.at = [], '', None
    def writable(self):
        return True
    def write(self, s):
        f, top = sys._getframe(1), None
        while f is not None:
            if f.f_code.co_filename == '<block>':
                top = f.f_lineno
            f = f.f_back
        parts = s.split('\n')
        for p in parts[:-1]:
            if not self.buf:
                self.at = top
            self.lines.append([self.buf + p, self.at])
            self.buf, self.at = '', None
        if parts[-1]:
            if not self.buf:
                self.at = top
            self.buf += parts[-1]
        return len(s)
mod = types.ModuleType('__main__')
sys.modules['__main__'] = mod
g = mod.__dict__
res = {'lines': [], 'err': None, 'missing': None}
sys.stdout = sys.stderr = io.StringIO()
try:
    for i, code in enumerate(job['prefix']):
        exec(compile(code, '<prefix-%d>' % i, 'exec'), g)
except ModuleNotFoundError as e:
    res['missing'] = e.name
except BaseException as e:
    res['err'] = ('앞 블록에서 %s: %s' % (type(e).__name__, e))[:300]
if res['missing'] is None and res['err'] is None:
    w = W()
    sys.stdout = sys.stderr = w
    try:
        exec(compile(job['code'], '<block>', 'exec'), g)
    except SystemExit:
        pass
    except ModuleNotFoundError as e:
        res['missing'] = e.name
    except BaseException as e:
        res['err'] = ('%s: %s' % (type(e).__name__, e))[:300]
    if w.buf:
        w.lines.append([w.buf, w.at])
    res['lines'] = w.lines
sys.stdout, sys.stderr = real, sys.__stderr__
print(json.dumps(res, ensure_ascii=False))
'''


def load_blocks(root):
    js = os.path.join(ROOT, 'scripts', 'check-code-blocks.js')
    cmd = ['node', js, '--json'] + (['--root', root] if root else [])
    return json.loads(subprocess.run(cmd, capture_output=True, text=True, check=True).stdout)


def code_of(b):
    lines = b['src'].split('\n')
    end = b['codeEnd'] if b['format'] == 'steps' else next((i for i, l in enumerate(lines) if OUT_MARK.match(l)), len(lines))
    return '\n'.join(lines[:end]) + '\n'


def declared_of(b):
    """[(뜻 줄 번호 또는 None, 찍힌 줄)] — 출력 영역이 없으면 None."""
    if b['format'] == 'steps':
        if not b['out']:
            return None
        return [(g['n'], t) for g in b['out']['groups'] for t in g['lines']]
    lines = b['src'].split('\n')
    k = next((i for i, l in enumerate(lines) if OUT_MARK.match(l)), None)
    if k is None:
        return None
    return [(None, (l[2:] if l.startswith('# ') else l[1:] if l.startswith('#') else l).rstrip()) for l in lines[k + 1:]]


def labelled(b, kind):
    return any(l['kind'] == kind for l in b['labels'])


def norun(b):
    if b['format'] == 'legacy':
        return any('의사코드' in l for l in b['src'].split('\n')[:2])
    return labelled(b, 'norun')


def prefix_of(b, by_post):
    """이어지는 블록 앞에 먼저 돌릴 코드. 다른 글의 블록들, 그다음 이 글의 앞 블록들 차례."""
    if not (labelled(b, 'cont') or labelled(b, 'cont-post')):
        return []
    mine = by_post[b['post']]
    other = []
    for x in mine[:b['index'] + 1]:
        for l in x['labels']:
            if l['kind'] == 'cont-post':
                # 글 id 에 맞는 파일 이름은 형식 검사가 file 에 넣어 준다 (mab-summary 는 mab.md)
                other += by_post.get(l.get('file') or l['post'], [])
    seen, codes = set(), []
    for x in other + mine[:b['index']]:
        key = (x['post'], x['index'])
        if key not in seen and not norun(x):
            seen.add(key)
            codes.append(code_of(x))
    return codes


def step_of(b, lineno):
    if lineno is None:
        return None
    step = 0
    for s in b['stepLines']:
        if s['from'] <= lineno - 1:
            step = s['n']
    return step


def trim(xs, text):
    while xs and not text(xs[-1]).strip():
        xs = xs[:-1]
    return xs


def check(b, res):
    varying = bool(b['format'] == 'steps' and b['out'] and b['out']['varying'])
    norm = (lambda s: ' '.join(NUM.sub('0', s).split())) if varying else (lambda s: s.rstrip())
    actual = trim(res['lines'], lambda x: x[0])
    declared = declared_of(b)
    if declared is None:
        if actual and b['format'] == 'steps':
            return ['찍힌 줄이 %d줄 있는데 출력 영역이 없습니다' % len(actual)]
        return []
    declared = trim(declared, lambda x: x[1])
    a = [norm(x[0]) for x in actual]
    d = [norm(t) for _, t in declared]
    if a != d:
        i = next((k for k, (x, y) in enumerate(zip(a, d)) if x != y), min(len(a), len(d)))
        return ['%d번째 찍힌 줄이 다릅니다\n      적힌 줄: %s\n      찍힌 줄: %s' % (
            i + 1, d[i] if i < len(d) else '(없음)', a[i] if i < len(a) else '(없음)')]
    if b['format'] == 'steps' and b['stepLines']:
        for k, ((n, _), (_, lineno)) in enumerate(zip(declared, actual)):
            got, want = step_of(b, lineno), (n if n is not None else 0)
            if got != want:
                name = lambda s: '첫 단계 앞 코드' if s == 0 else '알 수 없는 곳' if s is None else '%d단계' % s
                return ['%d번째 찍힌 줄은 %s가 찍었는데 뜻 줄은 %s입니다' % (k + 1, name(got), name(want))]
    return []


def show_lines(b, res):
    """찍힌 줄을 그 줄을 찍은 단계마다 묶어 출력 영역에 붙일 꼴로 돌려준다. 뜻은 … 자리에 쓴다."""
    out, last = [], object()
    steps = b['format'] == 'steps' and bool(b['stepLines'])
    for text, lineno in trim(res['lines'], lambda x: x[0]):
        s = step_of(b, lineno) if steps else 0
        if s != last:
            out.append('# %d단계 뜻: …' % s if s else '# 뜻: …')
            last = s
        out.append('# ' + text if text else '#')
    return out


def main():
    ap = argparse.ArgumentParser(description='파이썬 블록을 돌려 적힌 출력과 견준다')
    ap.add_argument('--legacy', action='store_true', help='옛 형식 블록도 돌린다')
    ap.add_argument('--post', help='글 하나만 (posts/ 의 파일 이름, .md 는 뺀다)')
    ap.add_argument('--jobs', type=int, default=4, help='동시에 돌릴 수')
    ap.add_argument('--root', help='posts/ 가 있는 폴더 (시험용)')
    ap.add_argument('--show', action='store_true', help='블록마다 찍힌 줄을 뜻 줄 자리와 함께 보여 준다')
    args = ap.parse_args()

    # 없는 글을 주면 아무것도 안 돌리고 통과로 끝나던 것을 막는다
    if args.post is not None and not os.path.exists(os.path.join(args.root or ROOT, 'posts', args.post + '.md')):
        print('✗ posts/%s.md 가 없습니다. --post 에는 posts/ 의 파일 이름을 .md 없이 씁니다' % args.post)
        sys.exit(2)

    blocks = load_blocks(args.root)
    by_post = {}
    for b in blocks:
        by_post.setdefault(b['post'], []).append(b)
    todo = [b for b in blocks
            if (args.post is None or b['post'] == args.post)
            and ((b['format'] == 'steps' and b['ok']) or (args.legacy and b['format'] == 'legacy'))]
    # 형식 오류가 있는 새 형식 블록은 돌리지 않는다. 통과로 세지 않고 실패로 알린다
    broken = [b for b in blocks
              if (args.post is None or b['post'] == args.post) and b['format'] == 'steps' and not b['ok']]
    env = dict(os.environ, PYTHONHASHSEED='0', PYTHONIOENCODING='utf-8', MPLBACKEND='Agg')

    # 실행기와 블록마다 쓰는 작업 폴더는 끝나면 지운다
    with tempfile.TemporaryDirectory(prefix='pyblocks-') as work:
        harness = os.path.join(work, 'harness.py')
        with open(harness, 'w', encoding='utf-8') as f:
            f.write(HARNESS)

        def run(b):
            if norun(b):
                return b, 'norun', None, None
            job = json.dumps({'prefix': prefix_of(b, by_post), 'code': code_of(b)})
            try:
                r = subprocess.run([sys.executable, harness], input=job, cwd=tempfile.mkdtemp(dir=work),
                                   capture_output=True, text=True, timeout=TIMEOUT, env=env)
            except subprocess.TimeoutExpired:
                return b, 'fail', ['%d초 안에 끝나지 않았습니다' % TIMEOUT], None
            try:
                res = json.loads(r.stdout.strip().splitlines()[-1])
            except (ValueError, IndexError):
                return b, 'fail', ['실행기가 결과를 내지 못했습니다: ' + r.stderr[-300:]], None
            if res['missing']:
                return b, 'missing', res['missing'], None
            if res['err']:
                return b, 'fail', [res['err']], res
            errs = check(b, res)
            return b, ('fail' if errs else 'pass'), errs, res

        with cf.ThreadPoolExecutor(max(1, args.jobs)) as ex:
            results = list(ex.map(run, todo))

    count = {'pass': 0, 'fail': 0, 'missing': 0, 'norun': 0}
    for b in broken:
        count['fail'] += 1
        print('✗ posts/%s.md 의 %d번째 파이썬 블록 — 형식 오류가 있어 돌리지 않았습니다. '
              'node scripts/check-code-blocks.js 로 먼저 고칩니다' % (b['post'], b['index'] + 1))
    for b, status, detail, res in results:
        count[status] += 1
        where = 'posts/%s.md 의 %d번째 파이썬 블록' % (b['post'], b['index'] + 1)
        if status == 'fail':
            for e in detail:
                print('✗ %s — %s' % (where, e))
        elif status == 'missing':
            print('  건너뜀 %s (%s 없음)' % (where, detail))
        if args.show and res is not None:
            print('── %s — 찍힌 줄' % where)
            for line in show_lines(b, res):
                print(line)
    skipped = count['missing'] + count['norun']
    print('%s 통과 %d, 건너뜀 %d (라이브러리 없음 %d, 실행 안 됨 %d), 실패 %d' % (
        '✗' if count['fail'] else '✓', count['pass'], skipped, count['missing'], count['norun'], count['fail']))
    sys.exit(1 if count['fail'] else 0)


if __name__ == '__main__':
    main()
