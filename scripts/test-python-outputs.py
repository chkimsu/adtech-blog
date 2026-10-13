#!/usr/bin/env python3
"""실행 검사(scripts/check-python-outputs.py) 시험. 임시 폴더에 작은 글을 만들어 돌려 본다.

  python3 scripts/test-python-outputs.py
"""
import os
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
CHECK = os.path.join(HERE, 'check-python-outputs.py')
FENCE = '`' * 3

POSTS = {
    'ok': [
        '# 하는 일: 두 단계가 한 줄씩 찍는다.',
        '# 1단계: 하나를 찍는다',
        'print("하나")',
        '# 2단계: 둘을 찍는다',
        'print("둘")',
        '',
        '# 출력:',
        '# 1단계 뜻: 첫 줄이다.',
        '# 하나',
        '# 2단계 뜻: 둘째 줄이다.',
        '# 둘',
    ],
    'bad-line': [
        '# 하는 일: 한 줄을 찍는다.',
        'print("하나")',
        '',
        '# 출력:',
        '# 뜻: 첫 줄이다.',
        '# 둘',
    ],
    'bad-step': [
        '# 하는 일: 두 단계가 한 줄씩 찍는다.',
        '# 1단계: 하나를 찍는다',
        'print("하나")',
        '# 2단계: 둘을 찍는다',
        'print("둘")',
        '',
        '# 출력:',
        '# 1단계 뜻: 두 줄을 1단계가 찍었다고 잘못 적었다.',
        '# 하나',
        '# 둘',
    ],
    'fn': [
        '# 하는 일: 1단계의 함수를 2단계가 부른다.',
        '# 1단계: 함수를 만든다',
        'def show():',
        '    print("안에서 찍는다")',
        '# 2단계: 부른다',
        'show()',
        '',
        '# 출력:',
        '# 2단계 뜻: 함수 안의 print 는 부른 단계가 찍은 것이다.',
        '# 안에서 찍는다',
    ],
    'vary': [
        '# 하는 일: 길이를 잰다.',
        'print("걸린 시간", len("abc"), "ms")',
        '',
        '# 출력 (시간은 돌릴 때마다 다르다):',
        '# 뜻: 숫자는 비교하지 않는다.',
        '# 걸린 시간   7 ms',
    ],
    'stderr': [
        '# 하는 일: stdout 과 stderr 에 차례로 쓴다.',
        'import sys',
        'print("앞")',
        'print("가운데", file=sys.stderr)',
        'print("뒤")',
        '',
        '# 출력:',
        '# 뜻: 쓴 순서대로 모은다.',
        '# 앞',
        '# 가운데',
        '# 뒤',
    ],
    'no-output': [
        '# 하는 일: 찍기만 하고 출력을 안 적었다.',
        'print("하나")',
    ],
    'missing': [
        '# 하는 일: 없는 라이브러리를 쓴다.',
        'import no_such_module_for_test',
        'print(1)',
        '',
        '# 출력:',
        '# 뜻: 하나.',
        '# 1',
    ],
    'norun': [
        '# (발췌 — 그대로 실행되지 않습니다.)',
        '# 하는 일: 조각이다.',
        '    return x',
    ],
}
# 이어지는 블록 — 두 블록을 한 글에 둔다
CONT = [
    ['x = 41'],
    ['# (앞 블록에 이어서 돌린다.)', '# 하는 일: 앞 블록의 x 를 쓴다.', 'print(x + 1)', '', '# 출력:', '# 뜻: 앞 블록이 x 를 만들었다.', '# 42'],
]

pass_, fail = 0, 0


def eq(name, got, want):
    global pass_, fail
    ok = got == want
    pass_, fail = pass_ + ok, fail + (not ok)
    print('   %s %s%s' % ('✓' if ok else '✗', name, '' if ok else '\n       기대 %r\n       실제 %r' % (want, got)))


def write_post(root, pid, blocks):
    body = '\n\n'.join(FENCE + 'python\n' + '\n'.join(b) + '\n' + FENCE for b in blocks)
    with open(os.path.join(root, 'posts', pid + '.md'), 'w', encoding='utf-8') as f:
        f.write('# 시험\n\n' + body + '\n')


def run(root, pid):
    r = subprocess.run([sys.executable, CHECK, '--root', root, '--post', pid], capture_output=True, text=True)
    return r.returncode, r.stdout


root = tempfile.mkdtemp(prefix='pyout-test-')
os.makedirs(os.path.join(root, 'posts'))
for pid, lines in POSTS.items():
    write_post(root, pid, [lines])
write_post(root, 'cont', CONT)

print('맞게 적은 블록은 통과한다')
eq('두 단계', run(root, 'ok')[0], 0)
eq('함수 안의 print 는 부른 단계', run(root, 'fn')[0], 0)
eq('「돌릴 때마다」 는 숫자와 공백 폭을 빼고 비교', run(root, 'vary')[0], 0)
eq('stderr 도 쓴 순서대로', run(root, 'stderr')[0], 0)
eq('앞 블록에 이어서', run(root, 'cont')[0], 0)

print('\n틀리게 적은 블록은 실패한다')
code, out = run(root, 'bad-line')
eq('찍힌 줄이 다르면', (code, '1번째 찍힌 줄이 다릅니다' in out), (1, True))
code, out = run(root, 'bad-step')
eq('뜻 줄의 단계가 다르면', (code, '2번째 찍힌 줄은 2단계가 찍었는데 뜻 줄은 1단계입니다' in out), (1, True))
code, out = run(root, 'no-output')
eq('찍는데 출력 영역이 없으면', (code, '출력 영역이 없습니다' in out), (1, True))

print('\n돌릴 수 없는 블록은 건너뛴다')
code, out = run(root, 'missing')
eq('없는 라이브러리', (code, 'no_such_module_for_test 없음' in out), (0, True))
code, out = run(root, 'norun')
eq('그대로 실행되지 않는 블록', (code, '실행 안 됨 1' in out), (0, True))

print('\n%d 통과, %d 실패' % (pass_, fail))
sys.exit(1 if fail else 0)
