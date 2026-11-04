#!/usr/bin/env python3
"""LLM 기초 트랙의 세 글이 같이 쓰는 광고 운영 숫자 문제 20개. 세 글의 파이썬 블록과 프롬프트 파일이 이 파일의 리터럴을 그대로 가져간다.

  python3 scripts/gen-llm-problems.py             문제 20개를 한 줄씩 찍는다 (id, 난이도, 답, 문제)
  python3 scripts/gen-llm-problems.py --json      문제 20개를 JSON 목록으로 찍는다. 프롬프트 파일 항목의 user 는 「문제: 」 뒤에 question 을 붙여 만든다
  python3 scripts/gen-llm-problems.py --selftest  문제마다 문제 글에 나온 수로 답을 다시 계산해 answer 와 견준다
  python3 scripts/gen-llm-problems.py --check     먼저 --selftest 와 같은 점검을 하고, 아래 두 가지를 본다. 없는 파일은 건너뛰고 몇 건을 대조했는지 찍는다
                                                  1) 프롬프트 파일 다섯의 items 에서 user 가 그 id 의 question 으로 끝나는가
                                                     (llm-model-selection, prompting-chain-of-thought-plain, -fewshot, -steps, llm-cost-cache-nondeterminism)
                                                  2) 글 셋의 파이썬 블록에 아래 PROBLEMS 리터럴이 글자까지 그대로 들어 있는가
                                                     (llm-model-selection, prompting-chain-of-thought, llm-cost-cache-nondeterminism)

리터럴은 「PROBLEMS = [」 줄부터 닫는 「]」 줄까지다. 그 사이를 고치면 글 셋의 파이썬 블록도 똑같이 고치고,
프롬프트 파일을 다시 만들어 python3 scripts/llm-record.py --slug <슬러그> 로 다시 기록한다. 문제 글의 수 순서가 바뀌면 SOLUTIONS 의 식도 맞춘다.
문제 20개는 easy 10개(p01~p10, 한 단계 계산)와 hard 10개(p11~p20, 두세 단계)다. 값은 모두 가상이고 answer 는 단위 없는 정수다.
표준 라이브러리만 쓴다.
"""
import json
import os
import re
import sys
from fractions import Fraction

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROMPTS_DIR = os.path.join(ROOT, 'data', 'llm-records', 'prompts')
POSTS_DIR = os.path.join(ROOT, 'posts')
# 대조 목록. 파일이 없으면 건너뛴다.
PROMPT_SLUGS = ['llm-model-selection', 'prompting-chain-of-thought-plain', 'prompting-chain-of-thought-fewshot',
                'prompting-chain-of-thought-steps', 'llm-cost-cache-nondeterminism']
POST_SLUGS = ['llm-model-selection', 'prompting-chain-of-thought', 'llm-cost-cache-nondeterminism']

# 문제 20개. 이 리터럴이 글의 파이썬 블록에 글자까지 그대로 들어간다.
PROBLEMS = [
    {"id": "p01", "question": "노출 120,000건에서 클릭이 3,600건이면 클릭률은 몇 %입니까?", "answer": 3, "level": "easy"},
    {"id": "p02", "question": "노출 120,000건에서 클릭률이 1.2%이면 클릭은 몇 건입니까?", "answer": 1440, "level": "easy"},
    {"id": "p03", "question": "클릭 2,500건에서 전환이 100건이면 전환율은 몇 %입니까?", "answer": 4, "level": "easy"},
    {"id": "p04", "question": "광고비 600,000원으로 클릭 2,400건을 얻었다면 클릭당 비용은 몇 원입니까?", "answer": 250, "level": "easy"},
    {"id": "p05", "question": "클릭 4,000건에서 전환율이 2.5%이면 전환은 몇 건입니까?", "answer": 100, "level": "easy"},
    {"id": "p06", "question": "노출 1,000건당 비용(CPM)이 4,000원이면 노출 50,000건의 광고비는 몇 원입니까?", "answer": 200000, "level": "easy"},
    {"id": "p07", "question": "하루 예산 300만 원 중 120만 원을 썼다면 소진율은 몇 %입니까?", "answer": 40, "level": "easy"},
    {"id": "p08", "question": "하루 예산이 300만 원이고 구매 건당 2만 원을 쓴다면 하루 구매는 최대 몇 건입니까?", "answer": 150, "level": "easy"},
    {"id": "p09", "question": "광고비 500,000원으로 매출 2,000,000원이 났다면 ROAS(광고비 대비 매출 비율)는 몇 %입니까?", "answer": 400, "level": "easy"},
    {"id": "p10", "question": "노출 1,000건당 클릭이 12건이고 클릭당 입찰가가 250원이면 노출 1,000건당 기대 수익은 몇 원입니까?", "answer": 3000, "level": "easy"},
    {"id": "p11", "question": "하루 예산 300만 원을 클릭당 250원으로 모두 쓰고 전환율이 2%이면 하루 전환은 몇 건입니까?", "answer": 240, "level": "hard"},
    {"id": "p12", "question": "노출 384,000건에서 클릭률이 0.75%이고 클릭당 비용이 320원이면 광고비는 몇 원입니까?", "answer": 921600, "level": "hard"},
    {"id": "p13", "question": "광고비 1,260,000원으로 클릭 4,200건을 얻었고 전환율이 2.5%이면 전환 건당 비용은 몇 원입니까?", "answer": 12000, "level": "hard"},
    {"id": "p14", "question": "하루 예산 300만 원 중 오전에 1,375,000원을 썼습니다. 남은 예산을 클릭당 325원에 모두 쓰면 클릭을 몇 건 더 얻습니까?", "answer": 5000, "level": "hard"},
    {"id": "p15", "question": "노출 1,000,000건이 있고 pCTR(노출 대비 클릭 확률)은 1.2%, pCVR(클릭 대비 전환 확률)은 3.0%입니다. 예상 전환은 몇 건입니까?", "answer": 360, "level": "hard"},
    {"id": "p16", "question": "하루 예산 300만 원을 CPM(노출 1,000건당 비용) 6,250원으로 모두 씁니다. 클릭률이 1.2%, 전환율이 2.5%이면 하루 전환은 몇 건입니까?", "answer": 144, "level": "hard"},
    {"id": "p17", "question": "하루 예산 300만 원 중 62%를 오후에 씁니다. 오후 클릭당 비용이 310원, 전환율이 1.5%이면 오후 전환은 몇 건입니까?", "answer": 90, "level": "hard"},
    {"id": "p18", "question": "pCTR(노출 대비 클릭 확률)은 1.2%, pCVR(클릭 대비 전환 확률)은 3.0%입니다. 구매 건당 입찰가가 2만 원이면 노출 1,000건당 기대 수익(eCPM)은 몇 원입니까?", "answer": 7200, "level": "hard"},
    {"id": "p19", "question": "회원 72,000명에게 평균 4.5건씩 노출했습니다. 클릭률이 0.8%, 클릭당 비용이 210원이면 광고비는 몇 원입니까?", "answer": 544320, "level": "hard"},
    {"id": "p20", "question": "구매 건당 매출이 12만 원이고 전환율이 3.0%입니다. 목표 ROAS 가 400%이면 클릭당 비용의 상한은 몇 원입니까?", "answer": 900, "level": "hard"}
]

# 문제 글에 나온 수 n[0], n[1], ... 로 답을 다시 계산하는 식. answer 와 따로 적은 값이라 둘이 맞아야 한다.
# 「300만 원」의 수는 300 이라 만 원 단위는 식에서 10000 을 곱한다. 백분율은 100 으로 나눈다.
SOLUTIONS = {
    'p01': lambda n: n[1] / n[0] * 100,                                   # 3,600 / 120,000 × 100 = 3
    'p02': lambda n: n[0] * n[1] / 100,                                   # 120,000 × 1.2% = 1,440
    'p03': lambda n: n[1] / n[0] * 100,                                   # 100 / 2,500 × 100 = 4
    'p04': lambda n: n[0] / n[1],                                         # 600,000 / 2,400 = 250
    'p05': lambda n: n[0] * n[1] / 100,                                   # 4,000 × 2.5% = 100
    'p06': lambda n: n[2] / n[0] * n[1],                                  # 50,000 / 1,000 × 4,000 = 200,000
    'p07': lambda n: n[1] / n[0] * 100,                                   # 120 / 300 × 100 = 40
    'p08': lambda n: n[0] / n[1],                                         # 300만 / 2만 = 150
    'p09': lambda n: n[1] / n[0] * 100,                                   # 2,000,000 / 500,000 × 100 = 400
    'p10': lambda n: n[1] * n[2],                                         # 12 × 250 = 3,000
    'p11': lambda n: n[0] * 10000 / n[1] * n[2] / 100,                    # 3,000,000 / 250 = 12,000 클릭, × 2% = 240
    'p12': lambda n: n[0] * n[1] / 100 * n[2],                            # 384,000 × 0.75% = 2,880 클릭, × 320 = 921,600
    'p13': lambda n: n[0] / (n[1] * n[2] / 100),                          # 4,200 × 2.5% = 105 전환, 1,260,000 / 105 = 12,000
    'p14': lambda n: (n[0] * 10000 - n[1]) / n[2],                        # (3,000,000 - 1,375,000) / 325 = 5,000
    'p15': lambda n: n[0] * n[1] / 100 * n[2] / 100,                      # 1,000,000 × 1.2% = 12,000 클릭, × 3.0% = 360
    'p16': lambda n: n[0] * 10000 / n[2] * n[1] * n[3] / 100 * n[4] / 100,  # 3,000,000 / 6,250 × 1,000 = 480,000 노출, × 1.2% = 5,760 클릭, × 2.5% = 144
    'p17': lambda n: n[0] * 10000 * n[1] / 100 / n[2] * n[3] / 100,       # 3,000,000 × 62% = 1,860,000, / 310 = 6,000 클릭, × 1.5% = 90
    'p18': lambda n: n[3] * n[0] / 100 * n[1] / 100 * n[2] * 10000,       # 1,000 × 1.2% × 3.0% × 20,000 = 7,200
    'p19': lambda n: n[0] * n[1] * n[2] / 100 * n[3],                     # 72,000 × 4.5 = 324,000 노출, × 0.8% = 2,592 클릭, × 210 = 544,320
    'p20': lambda n: n[0] * 10000 * n[1] / 100 / (n[2] / 100),            # 120,000 × 3.0% = 3,600, / 400% = 900
}

NUMBER = re.compile(r'\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?')
SENTENCE_MAX = 80


def numbers_in(text):
    """문제 글에 나온 수를 나온 차례대로 Fraction 으로 돌려준다. 쉼표는 천 단위 구분이다."""
    return [Fraction(t.replace(',', '')) for t in NUMBER.findall(text)]


def literal_source():
    """이 파일에서 「PROBLEMS = [」 줄부터 닫는 「]」 줄까지의 글. 글의 파이썬 블록에 이 글이 그대로 들어 있어야 한다."""
    with open(os.path.abspath(__file__), encoding='utf-8') as f:
        src = f.read()
    found = re.search(r'^PROBLEMS = \[\n.*?^\]$', src, re.M | re.S)
    if not found:
        raise SystemExit('✗ 이 파일에서 「PROBLEMS = [」 줄부터 닫는 「]」 줄까지의 리터럴을 찾지 못했습니다')
    return found.group(0)


def problem_errors():
    """PROBLEMS 의 꼴과 답을 본다. 틀린 곳을 적은 문장 목록을 돌려주고, 맞으면 빈 목록이다."""
    out = []
    if [p.get('id') for p in PROBLEMS] != ['p%02d' % i for i in range(1, 21)]:
        out.append('문제 id 가 p01 부터 p20 까지 차례대로가 아닙니다')
    if set(SOLUTIONS) != {p.get('id') for p in PROBLEMS}:
        out.append('SOLUTIONS 의 id 가 PROBLEMS 의 id 와 같지 않습니다')
    for i, p in enumerate(PROBLEMS):
        pid = p.get('id')
        if list(p) != ['id', 'question', 'answer', 'level']:
            out.append('%s: 키가 id, question, answer, level 차례가 아닙니다' % pid)
            continue
        if p['level'] != ('easy' if i < 10 else 'hard'):
            out.append('%s: p01~p10 은 easy, p11~p20 은 hard 여야 합니다 (지금 %s)' % (pid, p['level']))
        if type(p['answer']) is not int:
            out.append('%s: answer 가 정수가 아닙니다 (%r)' % (pid, p['answer']))
        question = p['question']
        if not (isinstance(question, str) and question.endswith('?')):
            out.append('%s: question 이 물음표로 끝나는 글이 아닙니다' % pid)
            continue
        if '·' in question:
            out.append('%s: question 에 가운뎃점이 있습니다' % pid)
        for sentence in re.split(r'(?<=[.?])\s+', question):
            if len(sentence) > SENTENCE_MAX:
                out.append('%s: 문장이 %d자입니다. %d자 이하로 씁니다' % (pid, len(sentence), SENTENCE_MAX))
        if pid not in SOLUTIONS:
            continue
        try:
            value = SOLUTIONS[pid](numbers_in(question))
        except (IndexError, ZeroDivisionError):
            out.append('%s: 문제 글에서 읽은 수로 식을 계산하지 못했습니다 (수 %d개)' % (pid, len(numbers_in(question))))
            continue
        if value != p['answer']:
            out.append('%s: 문제 글의 수로 다시 계산하면 %s 인데 answer 는 %s 입니다' % (pid, value, p['answer']))
    if len({p.get('question') for p in PROBLEMS}) != len(PROBLEMS):
        out.append('같은 question 이 둘 이상 있습니다')
    return out


def prompt_errors(path, by_id):
    """프롬프트 파일 하나의 items 를 본다. 항목의 user 는 그 id 의 question 으로 끝나야 한다."""
    name = os.path.relpath(path, ROOT)
    try:
        with open(path, encoding='utf-8') as f:
            spec = json.load(f)
    except ValueError as e:
        return ['%s: JSON 으로 읽지 못했습니다 (%s)' % (name, e)]
    items = spec.get('items') if isinstance(spec, dict) else None
    if not (isinstance(items, list) and items):
        return ['%s: items 목록이 없습니다' % name]
    out = []
    for item in items:
        pid, user = (item.get('id'), item.get('user')) if isinstance(item, dict) else (None, None)
        if not (isinstance(pid, str) and pid in by_id):
            out.append('%s: 항목 id %r 가 PROBLEMS 에 없습니다' % (name, pid))
        elif not (isinstance(user, str) and user.endswith(by_id[pid]['question'])):
            out.append('%s: 항목 %s 의 user 가 그 문제의 question 으로 끝나지 않습니다' % (name, pid))
    return out


def check():
    errors = problem_errors()
    by_id = {p['id']: p for p in PROBLEMS}
    prompt_files = posts = 0
    for slug in PROMPT_SLUGS:
        path = os.path.join(PROMPTS_DIR, slug + '.json')
        if os.path.exists(path):
            prompt_files += 1
            errors += prompt_errors(path, by_id)
    literal = literal_source()
    for slug in POST_SLUGS:
        path = os.path.join(POSTS_DIR, slug + '.md')
        if os.path.exists(path):
            posts += 1
            with open(path, encoding='utf-8') as f:
                if literal not in f.read():
                    errors.append('%s: 글의 파이썬 블록에 이 파일의 PROBLEMS 리터럴이 글자까지 그대로 들어 있지 않습니다'
                                  % os.path.relpath(path, ROOT))
    for e in errors:
        print('✗ ' + e)
    if not errors:
        print('✓ 문제 %d개의 답이 맞고 대조한 파일이 이 파일과 같습니다 (대조 %d건: 프롬프트 파일 %d개, 글 %d개)'
              % (len(PROBLEMS), prompt_files + posts, prompt_files, posts))
    return 1 if errors else 0


def selftest():
    errors = problem_errors()
    for p in PROBLEMS:
        shown = [str(n) if n.denominator == 1 else repr(float(n)) for n in numbers_in(p['question'])]
        print('%s  %-4s  답 %8s  문제 글의 수 %s' % (p['id'], p['level'], p['answer'], ', '.join(shown)))
    for e in errors:
        print('✗ ' + e)
    if not errors:
        hard = sum(1 for p in PROBLEMS if p['level'] == 'hard')
        print('selftest ok: 문제 %d개(easy %d, hard %d), 답 %d개가 문제 글의 수로 다시 센 값과 같습니다'
              % (len(PROBLEMS), len(PROBLEMS) - hard, hard, len(PROBLEMS)))
    return 1 if errors else 0


def main():
    args = sys.argv[1:]
    if args == ['--json']:
        print('[\n' + ',\n'.join(' ' + json.dumps(p, ensure_ascii=False) for p in PROBLEMS) + '\n]')
        return 0
    if args == ['--check']:
        return check()
    if args == ['--selftest']:
        return selftest()
    if args:
        print(__doc__)
        return 2
    for p in PROBLEMS:
        print('%s  %-4s  %8d  %s' % (p['id'], p['level'], p['answer'], p['question']))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
