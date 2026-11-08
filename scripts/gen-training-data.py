#!/usr/bin/env python3
"""LLM 학습 트랙의 가상 카피 후보 12개와 선호 쌍 20개. SFT 와 DPO 편과 보상 모델 편의 파이썬 블록이 COPY_POOL 과 PREF_PAIRS
리터럴을 글자 그대로 가져가고, DPO 놀이터는 이 파일이 쓴 js/training-dpo-pairs.js 를 읽는다.

  python3 scripts/gen-training-data.py           후보 12줄(id, 글자 수, 숫자 일치, 근거 없는 최상급, 통과, 참조, 정책)과
                                                 쌍 20줄(id, 출처, chosen>rejected, β 0.1 의 margin), 요약을 찍는다
  python3 scripts/gen-training-data.py --write   DATA_FILES 의 놀이터 데이터(js/training-dpo-pairs.js)를 다시 쓴다
  python3 scripts/gen-training-data.py --check   0) 리터럴과 등록 목록의 꼴을 먼저 본다. 세 갈래 모두 이 꼴 검사를 맨 먼저 돌리고, 꼴이 틀리면
                                                    틀린 곳만 찍고 1 로 끝난다. 보는 것은 리터럴의 글(한 줄에 튜플 하나, 들여쓰기 4칸, 큰따옴표,
                                                    로그 확률은 소수 한 자리), id 차례(c01~c12, d01~d20), 글자 수와 숫자 일치와 최상급을 아래
                                                    정의로 다시 센 값, 로그 확률이 음수인가, chosen 과 rejected 가 다르고 둘 다 후보에 있는가,
                                                    출처 수 6/8/6, gate 와 edit 의 chosen 은 통과하고 rejected 는 숫자나 최상급에 걸리는가,
                                                    judge 는 둘 다 통과하고 chosen 이 더 긴가, c06 과 c07 이 쌍에 없는가다.
                                                    꼴이 맞으면 아래 1~5 를 대조하고 몇 건 대조했는지 찍는다
                                                 1) DATA_FILES 의 파일마다 있고, 지금 생성한 글 전체와 바이트까지 같은가
                                                 2) POSTS 의 글마다 있고, python 블록에 「COPY_POOL = [」 줄부터 닫는 「]」 줄까지와
                                                    「PREF_PAIRS = [」 줄부터 닫는 「]」 줄까지의 리터럴이 들어 있는가. 글 안의 두 머리 줄은
                                                    모두 그 자리부터 이 파일의 리터럴과 바이트까지 같아야 한다
                                                 3) js/ 에서 training- 으로 시작하는 파일이 모두 DATA_FILES 에 있는가
                                                 4) posts/ 에서 「COPY_POOL = [」 나 「PREF_PAIRS = [」 로 시작하는 줄이 있는 글이 모두 POSTS 에 있는가
                                                 5) POSTS 의 글의 python 블록이 COPY_POOL, PREF_PAIRS, BETA 를 리터럴 밖에서 다시 대입하거나
                                                    고치지 않는가. 리터럴 뒤에서 값을 바꾸면 글자 대조만으로는 통과하기 때문이다. 블록을 구문
                                                    트리로 읽어 =, +=, :=, 꼴 표시가 붙은 대입, for 와 with 와 컴프리헨션이 묶는 이름, def,
                                                    class, import, del, except 의 이름, 함수 인자, 첨자와 속성 대입, list 메서드와 shuffle
                                                    부르기를 센다. 줄 맨 앞에서 시작해 끝 공백을 뗀 글이 「COPY_POOL = [」 나 「PREF_PAIRS = [」 인
                                                    머리 줄과, 이 파일의 BETA 줄과 바이트까지 같은 줄만 넘긴다
                                                 없는 파일, 다른 글자, 등록하지 않은 파일과 글은 모두 실패이고 처음 다른 자리를 찍는다

후보 하나는 (id, 카피, 글자 수, 숫자 일치 0|1, 근거 없는 최상급 0|1, 참조 로그 확률, 정책 로그 확률) 이다. 카피는 서연 씨 러닝화의
자산 텍스트(scripts/gen-ads-data.py 의 ASSET_RUNNING) 하나에 쓴 가상 카피이고, 브랜드는 그 자산의 가상 이름 런솔 라이트뿐이다.
글자 수는 공백과 문장 부호를 포함한 len(), 숫자 일치는 numbers(카피) <= numbers(ASSET_RUNNING), 근거 없는 최상급은
not gate_superlative(카피, ASSET_RUNNING) 이다. 게이트와 그 도우미는 scripts/gen-copy-data.py 의 것을 읽어 쓴다(옮겨 적지 않는다).
통과는 게이트 셋(40자 이하, 숫자 일치 1, 최상급 0)을 모두 지난 것이다. 참조 열은 「글자 수 × 0.2 + 13.5」를 뺀 값에 후보마다
작은 차이를 둔 가상 값이고, 정책 열은 참조 열에 후보마다 정한 변화를 더한 가상 값이다(DPO 를 조금 돌린 정책을 흉내 낸다).
쌍 하나는 (id, chosen id, rejected id, 출처) 이다. 출처 셋은 게이트(gate: chosen 은 통과, rejected 는 숫자나 최상급에 걸림),
판정자 짝비교(judge: 둘 다 통과하고 긴 카피가 이김), 광고주 편집(edit: 고친 카피가 chosen, 원래 카피가 rejected)을 흉내 낸
가상 쌍이고, 광고 카피 생성 편의 기록에서 뽑은 것이 아니다. 길이에만 걸리는 c06, c07 은 어느 쌍에도 넣지 않는다.
리터럴이나 BETA 를 고치면 POSTS 의 글 블록도 똑같이 고치고, --write 로 놀이터 데이터를 다시 쓴다. 표준 라이브러리만 쓴다.
"""
import ast
import importlib.util
import json
import os
import re
import sys
import unicodedata
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS_DIR = os.path.join(ROOT, 'posts')
JS_DIR = os.path.join(ROOT, 'js')
ADS_TOOL = os.path.join(ROOT, 'scripts', 'gen-ads-data.py')
COPY_TOOL = os.path.join(ROOT, 'scripts', 'gen-copy-data.py')


def load_script(path, name):
    """scripts/ 의 파이썬 파일 하나를 모듈로 불러온다. 불러올 때 scripts/__pycache__ 가 생기지 않게 바이트코드를 쓰지 않는다."""
    loader = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(loader)
    keep, sys.dont_write_bytecode = sys.dont_write_bytecode, True
    try:
        loader.loader.exec_module(module)
    finally:
        sys.dont_write_bytecode = keep
    return module


# 서연 씨 러닝화의 자산 텍스트. 공용 생성기의 값을 그대로 읽는다.
ASSET_RUNNING = load_script(ADS_TOOL, 'gen_ads_data').ASSET_RUNNING
# 카피 게이트와 그 도우미. 광고 카피 생성 편의 생성기에서 그대로 읽는다(옮겨 적지 않는다).
_copy_tool = load_script(COPY_TOOL, 'gen_copy_data')
SUPERLATIVES, NUMBER, numbers = _copy_tool.SUPERLATIVES, _copy_tool.NUMBER, _copy_tool.numbers
gate_length, gate_superlative = _copy_tool.gate_length, _copy_tool.gate_superlative


def own_source():
    """이 파일의 글. 바이트까지 대조하므로 줄바꿈을 바꾸지 않고 읽는다."""
    with open(os.path.abspath(__file__), encoding='utf-8', newline='') as f:
        return f.read()


def literal_text(name):
    """이 파일에서 「name = [」 줄부터 닫는 「]」 줄까지의 글. 글의 python 블록에 이 글이 그대로 들어 있어야 한다. 없으면 None 이다."""
    found = re.search(r'^%s = \[\n.*?^\]$' % name, own_source(), re.M | re.S)
    return found.group(0) if found else None


# ---------- 리터럴 앞의 관문이다. 글에는 옮기지 않는다. ----------
# 아래 두 리터럴은 이 파일을 불러올 때 바로 값이 된다. 튜플 줄 끝의 쉼표가 빠지면 파이썬이 다음 줄과 이어 함수 부르기로 읽어
# 그때 TypeError 가 나고, 꼴 검사가 안내를 찍지 못한다. 그래서 이 파일을 직접 돌릴 때는 리터럴의 글을 먼저 읽어 본다.
def unreadable(name):
    """리터럴 name 의 글을 값으로 읽을 수 없는 까닭. 줄마다 값만 적은 튜플(ast.literal_eval 로 읽히는 글)이면 빈 목록이다."""
    text = literal_text(name)
    if text is None:
        return ['이 파일에서 「%s = [」 줄부터 닫는 「]」 줄까지의 리터럴을 찾지 못했습니다. 두 줄은 줄 맨 앞에 둡니다' % name]
    source = own_source()
    top = source.count('\n', 0, source.index(text))
    try:
        rows = ast.parse(text).body[0].value.elts
    except (SyntaxError, AttributeError, IndexError):
        return ['%s 리터럴(이 파일 %d번째 줄부터)을 파이썬으로 읽지 못했습니다' % (name, top + 1)]
    out = []
    for row in rows:
        try:
            ast.literal_eval(row)
        except (ValueError, TypeError):
            out.append('%s 리터럴의 %d번째 줄(이 파일 %d번째 줄)을 값으로 읽지 못했습니다. 줄 끝의 쉼표가 빠졌거나, '
                       '이름이나 식처럼 값이 아닌 글이 있습니다' % (name, row.lineno - 1, top + row.lineno))
    return out


if __name__ == '__main__':
    _unreadable = unreadable('COPY_POOL') + unreadable('PREF_PAIRS')
    if _unreadable:
        for _line in _unreadable:
            print('✗ ' + _line)
        print('✗ 리터럴을 값으로 읽지 못해 아무것도 하지 않았습니다. 위를 고친 뒤 다시 돌립니다')
        raise SystemExit(1)

# 서연 씨 러닝화 자산에 쓴 가상 카피 후보 12개. (id, 카피, 글자 수, 숫자 일치 0|1, 근거 없는 최상급 0|1, 참조 로그 확률, 정책 로그 확률).
# 이 리터럴이 글의 python 블록에 글자 그대로 들어간다. 글자 수, 숫자 일치, 최상급은 --check 가 게이트로 다시 센다.
COPY_POOL = [
    ("c01", "입문자용 러닝화 런솔 라이트", 15, 1, 0, -18.1, -16.7),
    ("c02", "한 짝 240g, 처음 달리는 사람을 위한 러닝화", 27, 1, 0, -19.2, -16.6),
    ("c03", "밑창 전체에 쿠션 폼을 깐 입문자용 러닝화", 23, 1, 0, -18.3, -16.4),
    ("c04", "한 짝 240g 에 쿠션 폼을 깐, 처음 달리는 사람을 위한 러닝화", 37, 1, 0, -20.5, -17.4),
    ("c05", "240g 으로 가볍고 앞코가 넉넉한 러닝화, 30일 안에 한 번 교환", 38, 1, 0, -20.8, -18.5),
    ("c06", "한 짝 240g 으로 가볍고 밑창 전체에 쿠션 폼을 깐, 처음 달리는 사람을 위한 러닝화", 49, 1, 0, -23.3, -20.5),
    ("c07", "한 짝 240g 에 앞코가 넉넉하고 밑창 전체에 쿠션 폼을 깐 입문자용 러닝화", 43, 1, 0, -22.7, -21.5),
    ("c08", "한 짝 220g, 처음 달리는 사람을 위한 러닝화", 27, 0, 0, -18.0, -19.6),
    ("c09", "가장 가벼운 입문자용 러닝화 런솔 라이트", 22, 1, 1, -16.7, -14.0),
    ("c10", "입문 러너 1위 러닝화, 쿠션 폼을 깐 런솔 라이트", 28, 0, 1, -18.7, -20.8),
    ("c11", "한 짝 200g, 쿠션 폼을 깐 입문자용 러닝화", 26, 0, 0, -18.1, -19.0),
    ("c12", "가장 편한 쿠션 폼 러닝화, 한 짝 240g 으로 처음 달리는 사람을 위해 만들었습니다", 48, 1, 1, -22.9, -22.3)
]

# 후보 사이의 가상 선호 쌍 20개. (id, chosen id, rejected id, 출처). 출처는 gate 6개, judge 8개, edit 6개다.
# 이 리터럴도 글의 python 블록에 글자 그대로 들어간다.
PREF_PAIRS = [
    ("d01", "c02", "c08", "gate"),
    ("d02", "c03", "c09", "gate"),
    ("d03", "c03", "c11", "gate"),
    ("d04", "c04", "c10", "gate"),
    ("d05", "c01", "c09", "gate"),
    ("d06", "c02", "c11", "gate"),
    ("d07", "c04", "c01", "judge"),
    ("d08", "c05", "c02", "judge"),
    ("d09", "c04", "c03", "judge"),
    ("d10", "c05", "c03", "judge"),
    ("d11", "c02", "c01", "judge"),
    ("d12", "c05", "c01", "judge"),
    ("d13", "c03", "c01", "judge"),
    ("d14", "c04", "c02", "judge"),
    ("d15", "c05", "c12", "edit"),
    ("d16", "c02", "c10", "edit"),
    ("d17", "c04", "c12", "edit"),
    ("d18", "c01", "c10", "edit"),
    ("d19", "c03", "c08", "edit"),
    ("d20", "c05", "c09", "edit")
]

# DPO 의 β. 글의 python 블록은 BETA 를 이 줄과 바이트까지 같은 줄로만 정의한다. 다른 β 는 다른 이름(beta 같은 것)으로 둔다.
BETA = 0.1
# 놀이터를 처음 열 때 고르는 쌍. 그때의 margin, 손실, 무게는 SFT 와 DPO 편이 찍는 이 쌍의 값과 같아야 한다.
DEFAULT_PAIR = 'd02'
# 이 생성기가 쓰는 놀이터 데이터. --write 가 쓰고 --check 가 바이트까지 대조한다. js/ 의 training- 파일은 모두 여기 있어야 한다.
DATA_FILES = ['js/training-dpo-pairs.js']
# 두 리터럴을 글자 그대로 옮긴 글(posts/<슬러그>.md). 「COPY_POOL = [」 나 「PREF_PAIRS = [」 로 시작하는 줄이 있는 글은 모두
# 여기 있어야 한다. --check 가 그 글의 리터럴을 대조하고 리터럴 밖에서 세 이름을 바꾸는 줄을 찾는다. 글을 쓸 때 그 글을 더한다.
POSTS = ['posts/sft-and-dpo.md']

# ---------- 여기부터는 꼴 검사, 대조, 출력이다. 글에는 옮기지 않는다. ----------

SOURCES = ('gate', 'judge', 'edit')
WANT_SOURCES = {'gate': 6, 'judge': 8, 'edit': 6}
# 길이 게이트에만 걸리는 후보. 판정자 쌍이 40자 안에서만 「길수록 낫다」를 가르치고, 정책이 40자 밖으로 넘어가는 자리를
# 두 글이 보이므로 어느 쌍에도 넣지 않는다.
LENGTH_ONLY = ('c06', 'c07')
GATE_NAMES = ('길이', '숫자', '최상급')
# 리터럴 한 줄의 꼴. 들여쓰기 4칸, 큰따옴표 문자열, 로그 확률은 소수 한 자리이고, 마지막 줄만 끝에 쉼표가 없다.
POOL_LINE = re.compile(r'    \("[^"\\]*", "[^"\\]*", \d+, \d+, \d+, -?\d+\.\d, -?\d+\.\d\),?')
PAIR_LINE = re.compile(r'    \("[^"\\]*", "[^"\\]*", "[^"\\]*", "[^"\\]*"\),?')
FENCE = re.compile(r'^```([^\n`]*)\n(.*?)^```[ \t]*$', re.M | re.S)    # scripts/check-code-blocks.js 의 FENCE 와 같은 꼴
# 글자로 대조하는 이름. 글의 python 블록은 두 리터럴의 머리 줄과 이 파일과 같은 BETA 줄 말고는 이 이름을 다시 대입하거나 고치면 안 된다.
COMPARED = ('COPY_POOL', 'PREF_PAIRS', 'BETA')
# 목록을 그 자리에서 고치는 list 메서드. PREF_PAIRS.append(...) 처럼 부르면 리터럴의 값이 바뀐다. rng.shuffle(PREF_PAIRS) 도 따로 센다.
LIST_MUTATORS = ('append', 'extend', 'insert', 'pop', 'remove', 'sort', 'reverse', 'clear')


def recount(copy):
    """카피 하나의 (글자 수, 숫자 일치, 근거 없는 최상급) 을 게이트로 다시 센다."""
    return len(copy), int(numbers(copy) <= numbers(ASSET_RUNNING)), int(not gate_superlative(copy, ASSET_RUNNING))


def failed_gates(copy):
    """카피가 걸리는 게이트. 길이(40자 초과), 숫자(자산에 없는 숫자), 최상급(근거 없는 최상급) 차례이고, 빈 목록이면 통과다."""
    n, num, sup = recount(copy)
    return [name for name, hit in zip(GATE_NAMES, (not gate_length(copy), not num, sup)) if hit]


def verdict(copy):
    """통과면 「통과」, 아니면 걸린 게이트를 쉼표로 이은 글."""
    return ', '.join(failed_gates(copy)) or '통과'


def dpo_margin(pol_w, pol_l, ref_w, ref_l, beta=BETA):
    """쌍 하나의 margin. β((정책 chosen - 참조 chosen) - (정책 rejected - 참조 rejected)) 이다.
    음수면 정책이 참조보다 rejected 쪽으로 기운 쌍이다."""
    return beta * ((pol_w - ref_w) - (pol_l - ref_l))


def pair_rows():
    """쌍마다 (id, 출처, chosen 후보 줄, rejected 후보 줄). 후보 줄은 COPY_POOL 의 튜플이다. 꼴 검사를 지난 뒤에만 부른다."""
    pool = {c[0]: c for c in COPY_POOL}
    return [(pid, src, pool[w], pool[l]) for pid, w, l, src in PREF_PAIRS]


def beta_line():
    """이 파일에서 줄 맨 앞의 「BETA = 」 로 시작하는 줄. 꼭 하나일 때만 그 줄이고, 아니면 None 이다."""
    found = re.findall(r'^BETA = .*$', own_source(), re.M)
    return found[0] if len(found) == 1 else None


def dpo_pairs_text():
    """js/training-dpo-pairs.js 의 글 전체. 주석 세 줄 아래 window.DPO_PAIRS = {...}; 한 줄이다.
    쌍은 PREF_PAIRS 차례이고, 카피와 로그 확률은 COPY_POOL 에서 가져온다."""
    head = ('// LLM 학습 트랙의 가상 카피 후보 %d개 사이에 둔 선호 쌍 %d개입니다. '
            'scripts/gen-training-data.py --write 가 쓰고 손으로 고치지 않습니다.\n'
            '// pairs 의 줄마다 [id, 출처, chosen id, rejected id, chosen 카피, rejected 카피, '
            '정책 chosen, 정책 rejected, 참조 chosen, 참조 rejected] 입니다. 뒤의 넷은 로그 확률입니다.\n'
            '// 출처는 gate, judge, edit 가운데 하나입니다. beta 는 DPO 의 β 이고, default 는 놀이터를 처음 열 때 고르는 쌍입니다.\n'
            % (len(COPY_POOL), len(PREF_PAIRS)))
    pairs = [[pid, src, w[0], l[0], w[1], l[1], w[6], l[6], w[5], l[5]] for pid, src, w, l in pair_rows()]
    data = {'beta': BETA, 'default': DEFAULT_PAIR, 'pairs': pairs}
    return head + 'window.DPO_PAIRS = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n'


# DATA_FILES 의 파일마다 그 글 전체를 만드는 함수.
BUILDERS = {'js/training-dpo-pairs.js': dpo_pairs_text}


def pool_row_ok(row):
    """후보 한 줄이 (글자, 글자, 정수, 정수, 정수, 실수, 실수) 튜플인가."""
    return (isinstance(row, tuple) and len(row) == 7 and all(type(v) is str for v in row[:2])
            and all(type(v) is int for v in row[2:5]) and all(type(v) is float for v in row[5:]))


def pair_row_ok(row):
    """쌍 한 줄이 글자 넷인 튜플인가."""
    return isinstance(row, tuple) and len(row) == 4 and all(type(v) is str for v in row)


def registry_errors():
    """BETA, DATA_FILES, POSTS 의 꼴. 틀린 곳을 적은 문장 목록을 돌려준다."""
    out = []
    if type(BETA) is not float or not BETA > 0 or beta_line() != 'BETA = %r' % (BETA,):
        out.append('BETA 는 이 파일 줄 맨 앞에 「BETA = <양의 실수>」 한 줄로 한 번만 씁니다. '
                   '글의 python 블록은 그 줄을 바이트까지 같게만 옮길 수 있습니다')
    for name, paths in (('DATA_FILES', DATA_FILES), ('POSTS', POSTS)):
        if not (isinstance(paths, list) and all(type(p) is str for p in paths)) or len(set(paths)) != len(paths):
            out.append('%s 는 저장소 맨 위에서 본 경로 문자열의 목록이고, 같은 경로를 두 번 적지 않습니다' % name)
        elif name == 'DATA_FILES':
            out += ['DATA_FILES 의 %s 를 만드는 함수가 BUILDERS 에 없습니다' % p for p in paths if p not in BUILDERS]
    return out


def layout_errors(name, pattern):
    """리터럴 name 의 글. 머리 줄과 닫는 줄 사이에 한 줄에 튜플 하나, 들여쓰기 4칸, 큰따옴표 문자열, 소수 한 자리 로그 확률이고
    마지막 줄만 끝에 쉼표가 없다. 그 글을 값으로 읽은 것이 이 파일이 쓰는 값과 같아야 한다(리터럴 뒤에서 값을 바꾸지 않는다)."""
    text = literal_text(name)
    if text is None:
        return ['이 파일에서 「%s = [」 줄부터 닫는 「]」 줄까지의 리터럴을 찾지 못했습니다. 두 줄은 줄 맨 앞에 둡니다' % name]
    rows = text.split('\n')[1:-1]
    out = ['%s 리터럴의 %d번째 줄 「%s」 의 꼴이 다릅니다. 한 줄에 튜플 하나, 들여쓰기 4칸, 큰따옴표 문자열, 소수 한 자리 로그 확률로 쓰고 '
           '마지막 줄만 끝에 쉼표를 뺍니다' % (name, i, row.strip())
           for i, row in enumerate(rows, 1) if not pattern.fullmatch(row) or row.endswith(',') != (i < len(rows))]
    if not out and ast.literal_eval(text.split(' = ', 1)[1]) != globals()[name]:
        out.append('%s 리터럴의 글과 이 파일이 쓰는 값이 다릅니다. 리터럴 뒤에서 값을 고치지 말고 리터럴을 고칩니다' % name)
    return out


def format_errors():
    """0번 꼴 검사. 틀린 곳을 적은 문장 목록을 돌려주고, 맞으면 빈 목록이다. 세 갈래 모두 이것을 먼저 돌린다.
    꼴이 틀린 줄이 있으면 그 줄만 알리고 값을 다시 세지 않는다. 틀린 줄로 표를 만들면 안내 대신 traceback 이 나기 때문이다
    (scripts/gen-ads-data.py 의 --check 첫 관문과 같은 까닭)."""
    out = registry_errors()
    if not isinstance(COPY_POOL, list) or not isinstance(PREF_PAIRS, list):
        return out + ['COPY_POOL 과 PREF_PAIRS 는 목록이어야 합니다']
    out += ['COPY_POOL 의 %d번째 줄 %r 이 (id, 카피, 글자 수, 숫자 일치, 최상급, 참조 로그 확률, 정책 로그 확률) 꼴이 아닙니다. '
            '글자 둘, 정수 셋, 실수 둘인 튜플로 씁니다' % (i, row) for i, row in enumerate(COPY_POOL, 1) if not pool_row_ok(row)]
    out += ['PREF_PAIRS 의 %d번째 줄 %r 이 (id, chosen id, rejected id, 출처) 꼴이 아닙니다. 글자 넷인 튜플로 씁니다' % (i, row)
            for i, row in enumerate(PREF_PAIRS, 1) if not pair_row_ok(row)]
    if out:
        return out
    out += layout_errors('COPY_POOL', POOL_LINE) + layout_errors('PREF_PAIRS', PAIR_LINE)
    ids = [c[0] for c in COPY_POOL]
    if ids != ['c%02d' % i for i in range(1, 13)]:
        out.append('후보 id 가 c01 부터 c12 까지 차례대로가 아닙니다 (%s)' % ', '.join(ids))
    if [p[0] for p in PREF_PAIRS] != ['d%02d' % i for i in range(1, 21)]:
        out.append('쌍 id 가 d01 부터 d20 까지 차례대로가 아닙니다 (%s)' % ', '.join(p[0] for p in PREF_PAIRS))
    for cid, copy, n, num, sup, ref, pol in COPY_POOL:
        if (n, num, sup) != recount(copy):
            out.append('%s: 글자 수, 숫자 일치, 최상급을 (%d, %d, %d) 로 적었는데 다시 세면 (%d, %d, %d) 입니다 '
                       '(카피의 숫자 %s, 최상급 낱말 %s). 다시 센 값으로 고칩니다'
                       % ((cid, n, num, sup) + recount(copy)
                          + (', '.join(NUMBER.findall(copy)) or '없음', ', '.join(w for w in SUPERLATIVES if w in copy) or '없음')))
        if not all(v < 0 and round(v, 1) == v for v in (ref, pol)):
            out.append('%s: 로그 확률은 소수 한 자리의 음수로 씁니다 (참조 %r, 정책 %r)' % (cid, ref, pol))
    copies = {c[0]: c[1] for c in COPY_POOL}
    length_only = [cid for cid, copy in copies.items() if failed_gates(copy) == ['길이']]
    if length_only != list(LENGTH_ONLY):
        out.append('길이 게이트에만 걸리는 후보가 LENGTH_ONLY(%s)와 다릅니다 (지금 %s)' % (', '.join(LENGTH_ONLY), ', '.join(length_only) or '없음'))
    sources = Counter(p[3] for p in PREF_PAIRS)
    if sources != Counter(WANT_SOURCES):
        out.append('출처별 쌍 수가 %s 입니다. gate 6, judge 8, edit 6 이어야 합니다' % ', '.join('%s %d' % kv for kv in sources.items()))
    for pid, w, l, src in PREF_PAIRS:
        if w not in copies or l not in copies or w == l:
            out.append('%s: chosen 과 rejected 는 COPY_POOL 에 있는 서로 다른 후보 id 여야 합니다 (chosen %s, rejected %s)' % (pid, w, l))
            continue
        fw, fl = failed_gates(copies[w]), failed_gates(copies[l])
        if src not in SOURCES:
            out.append('%s: 출처가 gate, judge, edit 가운데 하나가 아닙니다 (%r)' % (pid, src))
        elif src != 'judge' and (fw or not {'숫자', '최상급'} & set(fl)):
            out.append('%s: %s 쌍은 chosen 이 통과하고 rejected 가 숫자나 최상급에 걸려야 합니다 (chosen %s: %s, rejected %s: %s)'
                       % (pid, src, w, verdict(copies[w]), l, verdict(copies[l])))
        elif src == 'judge' and (fw or fl or len(copies[w]) <= len(copies[l])):
            out.append('%s: judge 쌍은 둘 다 통과하고 chosen 이 더 길어야 합니다 (%s %d자 %s, %s %d자 %s)'
                       % (pid, w, len(copies[w]), verdict(copies[w]), l, len(copies[l]), verdict(copies[l])))
        if w in LENGTH_ONLY or l in LENGTH_ONLY:
            out.append('%s: 길이에만 걸리는 후보(%s)는 어느 쌍에도 넣지 않습니다' % (pid, ', '.join(LENGTH_ONLY)))
    if DEFAULT_PAIR not in [p[0] for p in PREF_PAIRS]:
        out.append('DEFAULT_PAIR(%r)가 쌍 id 가운데 없습니다' % (DEFAULT_PAIR,))
    return out


def first_char_diff(a, b):
    """두 글에서 처음 다른 글자의 자리. (줄 번호, a 의 그 자리 앞뒤, b 의 그 자리 앞뒤). 줄바꿈은 \\n 으로 보인다."""
    i = next((j for j, (x, y) in enumerate(zip(a, b)) if x != y), min(len(a), len(b)))

    def show(s):
        part = ('…' if i > 20 else '') + s[max(0, i - 20):i + 30] + ('…' if i + 30 < len(s) else '')
        return part.replace('\n', '\\n') or '(끝)'

    return a.count('\n', 0, i) + 1, show(a), show(b)


def python_blocks(text):
    """글의 python 블록. FENCE 의 match 목록이고, group(2) 가 블록의 코드다."""
    return [m for m in FENCE.finditer(text) if m.group(1).strip() == 'python']


def literal_errors(path, text):
    """POSTS 의 글 하나에서 두 리터럴을 대조한다(2번). 이름마다 python 블록 안에 머리 줄이 하나 이상 있어야 하고,
    글 안의 머리 줄마다 그 자리부터 이 파일의 리터럴과 바이트까지 같아야 한다. 틀린 곳 목록을 돌려준다."""
    out = []
    spans = [(m.start(2), m.end(2)) for m in python_blocks(text)]
    for name in ('COPY_POOL', 'PREF_PAIRS'):
        want = literal_text(name) + '\n'
        heads = [m.start() for m in re.finditer(r'^%s = \[' % name, text, re.M)]
        if not any(a <= h < b for h in heads for a, b in spans):
            out.append('%s: python 블록에 %s 리터럴이 없습니다. 이 파일의 「%s = [」 줄부터 닫는 「]」 줄까지를 글자 그대로 옮깁니다'
                       % (path, name, name))
        for h in heads:
            got = text[h:h + len(want)]
            if got != want:
                line, a, b = first_char_diff(got, want)
                out.append('%s: %d번째 줄부터 쓴 %s 리터럴에 이 파일의 것과 다른 글자가 있습니다 (%d번째 줄, 글 「%s」, 생성기 「%s」). '
                           '생성기의 리터럴을 글자 그대로 옮깁니다'
                           % (path, text.count('\n', 0, h) + 1, name, text.count('\n', 0, h) + line, a, b))
    return out


def name_writes(tree, name):
    """python 블록 하나의 구문 트리에서 name 에 값을 묶거나 name 이 가리키는 목록을 고치는 줄의 번호 목록(블록의 첫 줄이 1).
    scripts/gen-ranker-data.py 의 name_writes 가 세는 것에 컴프리헨션의 for 와 shuffle 부르기를 더 센다. 대입(=, +=, :=,
    꼴 표시가 붙은 대입), for 와 with 와 컴프리헨션이 묶는 이름, def, class, import, del, except 의 이름, 함수 인자,
    name[...] = 와 name.x = 같은 대입, name.append() 같은 list 메서드 부르기, rng.shuffle(name) 이다. 함수 안의 지역 이름도
    센다. 맨 위의 「name = [」 리터럴 대입과 「BETA = 0.1」 대입도 한 줄로 든다. 넘길지는 rebind_errors 가 정한다."""
    found = []

    def base(t):        # name[0], name.x, *name 의 맨 앞 이름
        while isinstance(t, (ast.Subscript, ast.Attribute, ast.Starred)):
            t = t.value
        return t

    def leaves(t):      # (a, name) = ... 처럼 묶어 대입하면 하나씩 본다
        if isinstance(t, (ast.Tuple, ast.List)):
            for e in t.elts:
                yield from leaves(e)
        else:
            yield t

    def named(t):
        return isinstance(t, ast.Name) and t.id == name

    def visit(node, line):
        line = getattr(node, 'lineno', line)    # withitem, alias, comprehension 은 줄 번호가 없어 그 문장의 줄을 쓴다
        targets = []
        if isinstance(node, (ast.Assign, ast.Delete)):
            targets = node.targets
        elif isinstance(node, (ast.AugAssign, ast.AnnAssign, ast.For, ast.AsyncFor, ast.NamedExpr, ast.comprehension)):
            targets = [node.target]
        elif isinstance(node, ast.withitem) and node.optional_vars is not None:
            targets = [node.optional_vars]
        func = node.func if isinstance(node, ast.Call) else None
        if (any(named(base(leaf)) for t in targets for leaf in leaves(t))
                or isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)) and node.name == name
                or isinstance(node, ast.ExceptHandler) and node.name == name
                or isinstance(node, ast.arg) and node.arg == name
                or isinstance(node, ast.alias) and (node.asname or node.name.split('.')[0]) == name
                or isinstance(func, ast.Attribute) and func.attr in LIST_MUTATORS and named(func.value)
                or func is not None and getattr(func, 'attr', getattr(func, 'id', None)) == 'shuffle'
                and bool(node.args) and named(node.args[0])):
            found.append(line)
        for child in ast.iter_child_nodes(node):
            visit(child, line)

    visit(tree, 0)
    return sorted(set(found))


def rebind_errors(path, text, beta):
    """POSTS 의 글 하나의 python 블록에서 COMPARED 의 이름을 리터럴 밖에서 다시 대입하거나 고치는 줄을 찾는다(5번).
    (틀린 곳 목록, 본 블록 수). 줄 맨 앞에서 시작해 끝 공백을 뗀 글이 「COPY_POOL = [」 나 「PREF_PAIRS = [」 하나인 줄만
    여러 줄 리터럴의 첫 줄로 보고 넘긴다. 그 리터럴이 이 파일의 것과 같은지는 2번의 글자 대조가 본다. BETA 는 이 파일의
    BETA 줄(beta)과 바이트까지 같은 줄만 넘긴다. 들여 쓴 머리 줄, 「PREF_PAIRS = [p for p in PREF_PAIRS if …]」 처럼
    한 줄로 다시 대입하는 줄, 함수 안의 대입은 넘기지 않는다."""
    out, seen = [], 0
    for i, m in enumerate(python_blocks(text), 1):
        seen += 1
        code, first = m.group(2), text.count('\n', 0, m.start(2)) + 1
        try:
            tree = ast.parse(code)
        except SyntaxError:
            names = [n for n in COMPARED if re.search(r'\b%s\b' % n, code)]
            if names:
                out.append('%s: 파이썬 %d번째 블록(%d번째 줄부터)을 파이썬으로 읽지 못해 다시 대입하는지 보지 못했습니다 (이름: %s)'
                           % (path, i, first, ', '.join(names)))
            continue
        lines = code.split('\n')
        for name in COMPARED:
            for n in name_writes(tree, name):
                line = lines[n - 1]
                if (line == beta) if name == 'BETA' else (line.rstrip() == name + ' = ['):
                    continue
                if name == 'BETA':
                    guide = 'β 를 바꾸려면 scripts/gen-training-data.py 의 「%s」 줄을 고치고, 다른 β 는 beta 같은 새 이름으로 둡니다' % beta
                else:
                    guide = '값을 바꾸려면 scripts/gen-training-data.py 의 리터럴을 고치고, 고르거나 바꾼 목록은 새 이름에 담습니다'
                shown = line.strip() if len(line.strip()) <= 80 else line.strip()[:80] + '…'
                out.append('%s: %d번째 줄(파이썬 %d번째 블록)이 리터럴 밖에서 %s 의 값을 다시 대입하거나 고칩니다 (「%s」). %s'
                           % (path, first + n - 1, i, name, shown, guide))
    return out, seen


def read_post(path):
    """글 하나의 글. 바이트까지 대조하므로 줄바꿈을 바꾸지 않고 읽는다."""
    with open(os.path.join(ROOT, path), encoding='utf-8', newline='') as f:
        return f.read()


def report_format(errors, what):
    """꼴 검사에서 나온 틀린 곳을 찍고 1 을 돌려준다. what 은 하지 않은 일이다."""
    for e in errors:
        print('✗ ' + e)
    print('✗ 리터럴이나 등록 목록의 꼴이 틀려 %s. 위를 고친 뒤 다시 돌립니다' % what)
    return 1


def check():
    errors = format_errors()
    if errors:
        return report_format(errors, '대조하지 않았습니다')
    done = Counter()
    # 1) 놀이터 데이터 파일. 지금 생성한 글 전체와 바이트까지 같아야 한다
    for path in DATA_FILES:
        want = BUILDERS[path]().encode('utf-8')
        try:
            with open(os.path.join(ROOT, path), 'rb') as f:
                on_disk = f.read()
        except FileNotFoundError:
            errors.append('%s 가 없습니다. python3 scripts/gen-training-data.py --write 로 씁니다' % path)
            continue
        done['데이터 파일'] += 1
        if on_disk != want:
            line, a, b = first_char_diff(on_disk.decode('utf-8', 'replace'), want.decode('utf-8'))
            errors.append('%s 에 지금 생성한 글과 다른 글자가 있습니다 (%d번째 줄, 파일 「%s」, 생성기 「%s」). '
                          'python3 scripts/gen-training-data.py --write 로 다시 씁니다' % (path, line, a, b))
    # 2) 등록한 글의 두 리터럴, 5) 리터럴 밖에서 세 이름을 바꾸는 줄
    beta = beta_line()
    for path in POSTS:
        try:
            text = read_post(path)
        except FileNotFoundError:
            errors.append('%s 가 없습니다. POSTS 에 등록한 글은 있어야 합니다' % path)
            continue
        done['글'] += 1
        errors += literal_errors(path, text)
        wrong, seen = rebind_errors(path, text, beta)
        errors += wrong
        done['블록'] += seen
    # 3) 등록하지 않은 놀이터 데이터. js/ 의 training- 파일은 이 생성기가 쓰는 파일이라 모두 DATA_FILES 에 있어야 한다
    for name in sorted(os.listdir(JS_DIR)):
        if name.startswith('training-'):
            done['training- 파일'] += 1
            if 'js/' + name not in DATA_FILES:
                errors.append('등록하지 않은 파일 js/%s 가 있습니다. js/ 의 training- 파일은 이 생성기가 쓰는 놀이터 데이터라 '
                              'DATA_FILES 에 등록하고 BUILDERS 에 만드는 함수를 두거나, 파일을 지웁니다' % name)
    # 4) 등록하지 않은 글. 두 리터럴의 머리 줄이 있는 글은 모두 POSTS 에 있어야 대조된다
    for name in sorted(os.listdir(POSTS_DIR)):
        if not name.endswith('.md'):
            continue
        path = 'posts/' + name
        text = read_post(path)
        head = re.search(r'^(?:COPY_POOL|PREF_PAIRS) = \[', text, re.M)
        if head:
            done['머리 줄이 있는 글'] += 1
            if path not in POSTS:
                errors.append('등록하지 않은 글 %s 의 %d번째 줄이 「%s」 로 시작합니다. 두 리터럴을 옮긴 글은 POSTS 에 등록해 '
                              '--check 가 대조하게 하고, 아니면 그 줄을 지웁니다' % (path, text.count('\n', 0, head.start()) + 1, head.group(0)))
    for e in errors:
        print('✗ ' + e)
    if errors:
        return 1
    sources = Counter(p[3] for p in PREF_PAIRS)
    print('✓ 후보 %d개와 선호 쌍 %d개(gate %d, judge %d, edit %d)의 꼴이 맞고, 대조 %d건(데이터 파일 %d, 글 %d)이 지금 생성 결과와 같습니다. '
          '등록한 글 %d편의 python 블록 %d개에 리터럴 밖에서 COPY_POOL, PREF_PAIRS, BETA 를 바꾸는 줄이 없고, '
          'js/ 의 training- 파일 %d개와 리터럴 머리 줄이 있는 글 %d편이 모두 등록돼 있습니다'
          % (len(COPY_POOL), len(PREF_PAIRS), sources['gate'], sources['judge'], sources['edit'],
             done['데이터 파일'] + done['글'], done['데이터 파일'], done['글'], done['글'], done['블록'],
             done['training- 파일'], done['머리 줄이 있는 글']))
    return 0


def id_span(ids):
    """id 목록을 줄여 쓴다. 번호가 셋 이상 이어지면 「c01~c05」 꼴로, 나머지는 쉼표로 잇는다."""
    groups = []
    for i in ids:
        if groups and int(i[1:]) == int(groups[-1][-1][1:]) + 1:
            groups[-1].append(i)
        else:
            groups.append([i])
    return ', '.join('%s~%s' % (g[0], g[-1]) if len(g) >= 3 else ', '.join(g) for g in groups)


def pad(text, width):
    """터미널에서 글자 폭이 width 가 되도록 오른쪽에 공백을 붙인다. 한글은 폭 2 로 센다."""
    used = sum(2 if unicodedata.east_asian_width(ch) in ('W', 'F') else 1 for ch in text)
    return text + ' ' * max(0, width - used)


def show():
    """인자 없이 돌릴 때 찍는 표. 후보 12줄, 쌍 20줄, 요약 네 줄이다."""
    print('후보 %d개 (id, 글자 수, 숫자 일치, 근거 없는 최상급, 통과, 참조 로그 확률, 정책 로그 확률, 카피)' % len(COPY_POOL))
    for cid, copy, n, num, sup, ref, pol in COPY_POOL:
        print('%s  %2d자  숫자 %d  최상급 %d  %s  참조 %.1f  정책 %.1f  %s' % (cid, n, num, sup, pad(verdict(copy), 12), ref, pol, copy))
    rows = pair_rows()
    margins = {pid: dpo_margin(w[6], l[6], w[5], l[5]) for pid, src, w, l in rows}
    print('선호 쌍 %d개 (id, 출처, chosen>rejected, β %g 의 margin)' % (len(PREF_PAIRS), BETA))
    for pid, src, w, l in rows:
        print('%s  %-5s  %s>%s  margin %+.3f' % (pid, src, w[0], l[0], margins[pid]))
    passing = [c[0] for c in COPY_POOL if not failed_gates(c[1])]
    diff = {s: [len(w[1]) - len(l[1]) for pid, src, w, l in rows if src == s] for s in SOURCES}
    negative = [pid for pid, m in margins.items() if m < 0]
    print('요약: 후보 %d개, 선호 쌍 %d개(%s), 놀이터 기본 쌍 %s'
          % (len(COPY_POOL), len(PREF_PAIRS), ', '.join('%s %d' % (s, len(diff[s])) for s in SOURCES), DEFAULT_PAIR))
    print('통과 후보 %d개 %s. 길이에만 걸리는 후보(%s)는 어느 쌍에도 없습니다' % (len(passing), id_span(passing), ', '.join(LENGTH_ONLY)))
    print('출처별 글자 수 차이 평균 %s (chosen 글자 수에서 rejected 글자 수를 뺀 값)'
          % ', '.join('%s %+.1f' % (s, sum(diff[s]) / len(diff[s])) for s in SOURCES))
    print('β %g 에서 margin 이 음수인 쌍 %d개 %s' % (BETA, len(negative), ', '.join(negative) or '없음'))


def main():
    args = sys.argv[1:]
    if args not in ([], ['--write'], ['--check']):
        print(__doc__)
        return 2
    if args == ['--check']:
        return check()
    errors = format_errors()
    if errors:
        return report_format(errors, '데이터 파일을 쓰지 않았습니다' if args else '표를 찍지 않았습니다')
    if args == ['--write']:
        for path in DATA_FILES:
            data = BUILDERS[path]().encode('utf-8')
            with open(os.path.join(ROOT, path), 'wb') as f:
                f.write(data)
            print('✓ %s 에 선호 쌍 %d개를 썼습니다 (%d바이트)' % (path, len(PREF_PAIRS), len(data)))
        return 0
    show()
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
