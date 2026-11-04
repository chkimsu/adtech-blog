#!/usr/bin/env python3
"""글에 붙인 LLM 기록 상수가 기록 파일에서 지금 뽑은 줄과 글자까지 같은지 본다. 설계: docs/superpowers/specs/2026-11-03-llm-tracks-design.md 5절

  python3 scripts/check-llm-constants.py    posts/ 의 글을 모두 본다 (CI)

`# 기록 data/llm-records/<slug>.json 에서 옮김` 주석이 있는 코드 블록마다, 그 블록의 `RECORD = ` 줄을
`python3 scripts/llm-record.py --export-constant --slug <slug>` 가 찍는 줄과 견준다. 블록에 `USAGE = ` 줄이 있으면
`--export-constant --with-usage` 가 찍는 USAGE 줄과도 견준다. 다시 기록하고 글을 고치지 않은 줄과 손으로 고친 줄을 잡는다.
다르면 글과 줄 번호를 알리고 1 로 끝난다. 상수 뽑기는 기록 파일만 읽어서 Ollama 없이 돈다. 표준 라이브러리만 쓴다.
"""
import argparse
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS = os.path.join(ROOT, 'posts')
TOOL = os.path.join(ROOT, 'scripts', 'llm-record.py')
# 울타리 하나. scripts/check-code-blocks.js 의 FENCE 와 같은 꼴이다
FENCE = re.compile(r'^```([^\n`]*)\n(.*?)^```[ \t]*$', re.M | re.S)
MARK = '# 기록 data/llm-records/'
COMMENT = re.compile(r'^# 기록 data/llm-records/([A-Za-z0-9_-]+)\.json 에서 옮김$')
SHOW = 40            # 다른 자리 앞뒤로 보일 글자 수


def blocks(name):
    """글의 코드 블록마다 (블록 안 첫 줄의 줄 번호, 블록 안 줄 목록)."""
    with open(os.path.join(POSTS, name), encoding='utf-8') as f:
        text = f.read()
    for m in FENCE.finditer(text):
        yield text.count('\n', 0, m.start(2)) + 1, m.group(2).split('\n')


def export(slug, with_usage, cache):
    """llm-record.py 가 찍는 상수 줄을 {'RECORD': 줄, 'USAGE': 줄} 로 돌려준다. 뽑지 못하면 그 까닭을 문자열로 돌려준다."""
    key = (slug, with_usage)
    if key not in cache:
        cmd = [sys.executable, TOOL, '--export-constant', '--slug', slug] + (['--with-usage'] if with_usage else [])
        r = subprocess.run(cmd, capture_output=True, env=dict(os.environ, PYTHONIOENCODING='utf-8'))
        if r.returncode:
            cache[key] = r.stderr.decode('utf-8', 'replace').strip() or '종료 코드 %d' % r.returncode
        else:
            # splitlines 는 U+2028 같은 글자에서도 줄을 나눈다. 도구는 print 로 찍으니 \n 으로만 나눈다
            lines = r.stdout.decode('utf-8').split('\n')
            cache[key] = {name: l for l in lines for name in ('RECORD', 'USAGE') if l.startswith(name + ' = ')}
    return cache[key]


def around(s, i):
    """i 번째 글자(0부터) 앞뒤를 조금 보인다. 줄이 i 번째 글자 앞에서 끝나면 (끝) 을 붙인다."""
    lo = max(0, i - SHOW // 2)
    tail = '…' if lo + SHOW < len(s) else '(끝)' if i >= len(s) else ''
    return ('…' if lo else '') + s[lo:lo + SHOW] + tail


def compare(where, name, got, slug, with_usage, cache):
    """글의 상수 줄 하나를 뽑은 줄과 견준다. 다르면 알릴 말을 돌려준다."""
    cmd = 'python3 scripts/llm-record.py --export-constant%s --slug %s' % (' --with-usage' if with_usage else '', slug)
    want = export(slug, with_usage, cache)
    if isinstance(want, str):
        return '%s — %s 줄을 견줄 기록 상수를 뽑지 못했습니다 (%s)\n    %s' % (where, name, cmd, want)
    if name not in want:
        return '%s — %s 의 출력에 %s 줄이 없습니다' % (where, cmd, name)
    if got == want[name]:
        return None
    n = min(len(got), len(want[name]))
    i = next((k for k in range(n) if got[k] != want[name][k]), n)
    return ('%s — %s 줄이 기록에서 뽑은 줄과 %d번째 글자부터 다릅니다\n'
            '    글의 줄: %s\n    뽑은 줄: %s\n    고치는 법: %s 의 출력에서 %s 줄을 그대로 옮깁니다') % (
        where, name, i + 1, around(got, i), around(want[name], i), cmd, name)


def check_block(name, start, lines, cache):
    """기록 주석이 있는 블록 하나를 본다. 알릴 말 목록을 돌려준다."""
    where = lambda k: 'posts/%s:%d' % (name, start + k)
    marks = [(k, COMMENT.match(l)) for k, l in enumerate(lines) if l.startswith(MARK)]
    bad = [where(k) for k, m in marks if not m]
    if bad:
        return ['%s — 기록 주석이 `# 기록 data/llm-records/<slug>.json 에서 옮김` 꼴이 아닙니다' % w for w in bad]
    slugs = sorted({m.group(1) for _, m in marks})
    if len(slugs) > 1:
        return ['%s — 한 블록에 기록 주석의 기록이 둘 이상입니다: %s' % (where(marks[0][0]), ', '.join(slugs))]
    slug = slugs[0]
    found = [(k, l) for k, l in enumerate(lines) if l.startswith('RECORD = ') or l.startswith('USAGE = ')]
    out = []
    if not any(l.startswith('RECORD = ') for _, l in found):
        out.append('%s — 기록 주석이 있는데 블록에 `RECORD = ` 로 시작하는 줄이 없습니다' % where(marks[0][0]))
    for k, l in found:
        usage = l.startswith('USAGE = ')
        err = compare(where(k), 'USAGE' if usage else 'RECORD', l, slug, usage, cache)
        if err:
            out.append(err)
    return out


def main():
    argparse.ArgumentParser(description='글에 붙인 LLM 기록 상수(RECORD, USAGE 줄)가 기록 파일에서 뽑은 줄과 같은지 본다').parse_args()
    if not os.path.isdir(POSTS):
        print('✗ posts/ 폴더가 없습니다: %s' % POSTS)
        return 2
    cache, problems, posts = {}, [], 0
    for name in sorted(f for f in os.listdir(POSTS) if f.endswith('.md')):
        mine = [check_block(name, start, lines, cache)
                for start, lines in blocks(name) if any(l.startswith(MARK) for l in lines)]
        if mine:
            posts += 1
            problems += [p for found in mine for p in found]
    for p in problems:
        print('✗ ' + p)
    if problems:
        print('✗ 기록 상수 %d개 글을 보았고, 고칠 곳이 %d개 있습니다' % (posts, len(problems)))
        return 1
    print('✓ 기록 상수 %d개 글 일치' % posts)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
