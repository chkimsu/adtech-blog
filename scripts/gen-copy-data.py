#!/usr/bin/env python3
"""광고 카피 생성 글(grounded-ad-copy-generation)의 광고주 자산 10개, 시스템 메시지, 게이트 넷. 글의 파이썬 블록과 프롬프트 파일이 이 파일의 값을 그대로 가져가고,
판정 체계 글(generated-copy-judging-system)의 빌더 셋(-score, -pairs, -cascade)은 이 파일에서 게이트를 지난 카피(passing_copies)를 가져간다.

  python3 scripts/gen-copy-data.py                     자산 10개를 한 줄씩 찍는다 (id, 글자 수, 자산 안의 숫자, 첫 문장)
  python3 scripts/gen-copy-data.py --prompts <슬러그>    PROMPTS 에 등록한 프롬프트 파일 한 벌을 찍는다. 아래처럼 받아 쓴다
      python3 scripts/gen-copy-data.py --prompts grounded-ad-copy-generation > data/llm-records/prompts/grounded-ad-copy-generation.json
                                                       앞 기록을 읽는 빌더(판정 체계 편의 -score, -pairs 는 카피 기록을, -cascade 는
                                                       -score 와 -pairs 기록을 읽는다)는 그 기록이 없거나 쓸 수 없으면 까닭을 알리고 1 로 끝난다.
                                                       -cascade 가 고른 것이 없으면 아무것도 찍지 않고 1 로 끝난다. 위처럼 > 로 받으면
                                                       셸이 빈 파일을 남기니 지운다. 남은 빈 파일은 --check 가 「만들지 않아야 하는 파일이 있습니다」로 잡는다
  python3 scripts/gen-copy-data.py --check             자산 10개의 꼴과 사람 라벨(HUMAN)의 꼴을 본 뒤 아래 일곱을 대조하고 몇 건 대조했는지 찍는다
                                                       0) 이 생성기의 슬러그(grounded-ad-copy-generation, generated-copy-judging-system)로
                                                          시작하는 프롬프트 파일과 기록 파일이 모두 PROMPTS 에 등록한 슬러그인가. 아니면 실패다
                                                       1) PROMPTS 의 프롬프트 파일마다 파일 전체(system, think, repeat, repeat_subset,
                                                          think_subset, options, allow_length, items)가 빌더로 다시 만든 글과 글자까지 같은가.
                                                          파일이 없으면 실패로 두고, 기록이 있는데 파일이 없으면 그렇다고 알린다.
                                                          앞 기록을 읽는 빌더는 지금 있는 앞 기록에서 다시 만든다. 빌더가 고른 것이 없으면(None)
                                                          그 프롬프트 파일과 기록이 둘 다 없어야 통과하고, 하나라도 있으면 실패다
                                                       2) 기록이 있으면 그 기록이 지금 프롬프트로 받은 것인가. 항목마다 id, think, run,
                                                          system, user, options 가 기록 도구(scripts/llm-record.py)가 보낼 차례와 같고 error 가 없어야 한다
                                                       3) 글(posts/grounded-ad-copy-generation.md)의 파이썬 블록에 「ASSETS = [」 줄부터
                                                          닫는 「]」 줄까지의 리터럴이 글자까지 그대로 들어 있는가 (글이 없으면 실패)
                                                       4) 글의 파이썬 블록이 SHARED 의 이름(게이트 넷과 그 도우미, 답 읽기, 판정)을 모두 정의하고,
                                                          정의마다 줄 전체(끝 줄의 주석까지)가 이 파일의 것과 같은가. ASSET_RUNNING 의 정의는
                                                          scripts/gen-ads-data.py 의 것과 같은가
                                                       5) 이 자산과 게이트를 이어 쓰는 글(LATER 의 글)이 있으면, 그 글의 「ASSETS = [」 리터럴과
                                                          SHARED 의 이름 가운데 정의한 것이 이 파일과 같은가
                                                       6) 판정 체계 글(posts/generated-copy-judging-system.md)의 파이썬 블록이 JUDGE_SHARED 의 이름
                                                          (사람 라벨 리터럴 HUMAN, 답 읽기, 쌍 고르기, 캐스케이드 고르기)을 모두 정의하고, 정의마다
                                                          줄 전체가 이 파일의 것과 같은가 (글이 없으면 실패)

자산 하나는 (id, 자산 텍스트) 이다. x01 은 서연 씨 러닝화의 자산 텍스트로, scripts/gen-ads-data.py 의 ASSET_RUNNING 을 읽어 온다(옮겨 적지 않는다).
x02~x08 은 이 트랙의 가상 광고주 상품이고 브랜드는 가상 이름(모노웍스, 숲결)만 쓴다. x09 와 x10 은 상품의 사실이 없는 얇은 자산이다.
x02~x10 은 한국어 120~200자이고, 건강이나 몸에 관한 효능은 넣지 않는다. x03 에만 최상급 「가장」이 자산 안에 있다(숲결 러닝화 가운데).
모델에게는 시스템 메시지와 「자산 텍스트:」 아래의 자산 하나를 보낸다. 기록은 자산마다 한 번, thinking 끔, temperature 0 이다.
게이트 넷은 근거 → 길이 → 중복 → 최상급 차례로 돌고, 카피는 처음 걸린 게이트 하나에서만 센다. 중복은 같은 자산 안에서 앞서 남은 카피와 비교한다.
ASSETS 리터럴, 시스템 메시지, 게이트를 고치면 글의 블록도 똑같이 고치고, 프롬프트 파일을 다시 뽑아
python3 scripts/llm-record.py --slug grounded-ad-copy-generation 으로 다시 기록한다.
판정 체계 편은 게이트를 지난 카피를 채점표로 채점한다(-score, thinking 끔, temperature 0.7 로 5번). 같은 자산의 카피 20쌍은
좌우를 바꿔 두 번 고르게 한다(-pairs, thinking 끔, temperature 0). 두 기록에서 점수가 흔들린 카피와 좌우를 바꾸면 승자가 바뀐 쌍만
thinking 을 켜고 temperature 0 으로 다시 본다(-cascade). 카피 기록을 다시 받으면 판정 기록 셋도 다시 받고,
-score 나 -pairs 를 다시 받으면 -cascade 도 다시 뽑아 다시 받는다. 표준 라이브러리만 쓴다.
"""
import ast
import importlib.util
import json
import os
import re
import sys
from collections import Counter
from itertools import combinations

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RECORDS_DIR = os.path.join(ROOT, 'data', 'llm-records')
PROMPTS_DIR = os.path.join(RECORDS_DIR, 'prompts')
POST = os.path.join(ROOT, 'posts', 'grounded-ad-copy-generation.md')
# 이 자산과 게이트를 이어 쓰는 뒤 글. 파일이 있으면 「ASSETS = [」 리터럴과 SHARED 의 정의 가운데 있는 것을 대조한다.
LATER = [os.path.join(ROOT, 'posts', 'generated-copy-judging-system.md')]
# 판정 체계 글. 그 글의 파이썬 블록은 JUDGE_SHARED 의 정의를 모두 옮겨야 한다.
JUDGE_POST = LATER[0]
ADS_TOOL = os.path.join(ROOT, 'scripts', 'gen-ads-data.py')
RECORD_TOOL = os.path.join(ROOT, 'scripts', 'llm-record.py')


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

# 광고주 자산 10개. 이 리터럴이 글의 파이썬 1 블록에 글자 그대로 들어간다. 글의 블록은 그 위에 ASSET_RUNNING 의 정의를 옮겨 둔다.
ASSETS = [
    ("x01", ASSET_RUNNING),
    ("x02", "모노웍스 데일리는 매일 달리는 사람을 위한 러닝화입니다. 바닥에 홈을 깊게 파서 비에 젖은 길에서도 덜 미끄러집니다. 한 짝 무게는 270g 이고, 회색과 남색 두 가지 색으로 나옵니다. 사이즈는 240mm 부터 290mm 까지 있고, 깔창은 빼서 빨 수 있습니다."),
    ("x03", "숲결 트레일은 산길과 흙길을 달리는 트레일 러닝화입니다. 바닥에 높이 5mm 의 돌기를 달아 비탈에서 잘 버팁니다. 겉감은 물이 잘 스미지 않는 천이고, 끈은 한 번 당기면 조여지는 퀵 레이스입니다. 숲결 러닝화 가운데 가장 가벼운 모델로, 한 짝 무게는 280g 입니다."),
    ("x04", "달릴 때 신는 러닝 전용 양말입니다. 앞쪽은 도톰한 실로 짜고, 윗면에는 바람이 통하는 그물 무늬를 넣었습니다. 물에 빨아도 쉽게 늘어나지 않습니다. 3켤레를 한 묶음으로 팔고, 한 묶음 값은 12,900원입니다. 220mm 부터 280mm 까지 맞는 프리 사이즈입니다."),
    ("x05", "달린 거리와 속도를 기록하는 GPS 러닝 시계입니다. 한 번 충전하면 10일 동안 쓰고, 기록은 휴대폰 앱으로 옮겨 볼 수 있습니다. 화면은 1.2인치이고, 물속 50m 깊이까지 견딥니다. 전화나 메시지가 오면 진동으로 알려 줍니다. 시곗줄은 검은색과 흰색 가운데 고를 수 있습니다."),
    ("x06", "휴대폰과 열쇠를 넣고 달리는 러닝 벨트입니다. 달려도 흔들리지 않도록 안쪽에 고무줄을 넣었고, 무게는 80g 입니다. 주머니는 2개이고, 6.7인치 휴대폰까지 들어갑니다. 밤에 달릴 때 잘 보이도록 빛을 되비추는 띠를 붙였습니다."),
    ("x07", "접어서 들고 다니는 캠핑 의자입니다. 접으면 두께가 10cm 이고, 무게는 1.9kg 입니다. 의자 하나가 120kg 까지 버팁니다. 수납 가방을 함께 드리고, 색은 올리브색과 모래색 두 가지입니다. 바닥이 고르지 않은 곳에서도 네 다리가 흔들리지 않게 받칩니다."),
    ("x08", "김포에서 출발하는 제주 2박 3일 자유여행 상품입니다. 왕복 항공권과 바다가 보이는 호텔 2박이 들어 있습니다. 위탁 수하물은 15kg 까지 부칠 수 있고, 렌터카를 3일 동안 씁니다. 출발 7일 전까지 취소하면 낸 돈을 모두 돌려 드립니다."),
    ("x09", "달리는 아침을 응원합니다. 오늘도 운동화 끈을 묶고 문을 나서는 모든 분께 고마운 마음을 전합니다. 새로운 계절에는 새로운 기록이 기다리고 있습니다. 함께 달리는 즐거움을 오래 나누고 싶습니다. 더 좋은 소식으로 다시 찾아뵙겠습니다."),
    ("x10", "새 단장을 마치고 다시 인사드립니다. 그동안 기다려 주신 분들께 진심으로 감사드립니다. 앞으로도 좋은 물건과 친절한 안내로 보답하겠습니다. 매장을 찾는 분들이 편하게 머물 수 있도록 늘 준비하겠습니다. 자세한 내용은 매장에서 직접 확인해 주십시오.")
]

# 시스템 메시지. 말투 줄(STYLE_LINES)은 기록이 든 글의 말투 검사에 걸리면 고칠 수 있는 유일한 줄이다(Ruling B3-18).
# 이 메시지는 글의 더 깊이 보기에 코드 블록으로 그대로 실리고 말투 검사기가 코드 블록 안도 센다.
# 그래서 가운뎃점 글자와 「저희」라는 낱말을 직접 적지 않고, 「가운뎃점」과 「1인칭 대명사」로 적는다.
STYLE_LINES = [
    '카피의 문장 끝은 명사나 「~합니다」 꼴로 끝낸다.',
    '카피에는 가운뎃점, 이모지, 1인칭 대명사를 쓰지 않는다. 숫자는 아라비아 숫자로 쓴다.',
]
SYSTEM = '\n'.join(
    ['너는 검색 광고의 카피를 쓰는 작성자다. 광고주가 준 자산 텍스트 하나를 읽고, 그 자산에 적힌 사실만으로 광고 카피를 쓴다.',
     '카피는 5개까지 쓴다. 카피 하나는 한국어 40자 이하다.',
     '카피마다 quote 를 붙인다. quote 는 그 카피가 기대는 구절을 자산 텍스트에서 글자 그대로 옮긴 것이다. 띄어쓰기와 문장 부호도 바꾸지 않는다.',
     '카피의 사실은 모두 그 카피의 quote 안에 있어야 한다. quote 에 없는 사실을 카피에 더하지 않는다.',
     '숫자는 자산 텍스트에 있는 숫자만 쓴다. 할인율, 순위, 기간 같은 숫자를 새로 만들지 않는다.',
     '최고, 최초, 1위, 유일, 가장, 국내 최대 같은 최상급 표현은 자산 텍스트에 그 말이 있을 때만 쓴다.',
     '자산 텍스트에 상품의 사실이 부족해 카피를 쓸 수 없으면 status 를 no_generation 으로 두고 candidates 를 빈 목록으로 둔다. 카피를 하나라도 쓰면 status 는 ok 다.']
    + STYLE_LINES
    + ['답은 아래 꼴의 JSON 한 줄로만 쓴다. 설명이나 다른 글은 붙이지 않는다.',
       '{"status": "<ok|no_generation>", "candidates": [{"copy": "<한국어 40자 이하>", "quote": "<자산에서 그대로 옮긴 구절>"}]}'])

SLUG = 'grounded-ad-copy-generation'


def copy_prompts():
    """자산마다 항목 하나, 10개. thinking 끔, temperature 0(seed 는 기록 도구의 기본값 7)으로 한 번씩 보낸다."""
    return {'system': SYSTEM, 'think': 'off', 'repeat': 1, 'options': {'temperature': 0},
            'items': [{'id': aid, 'user': '자산 텍스트:\n' + text} for aid, text in ASSETS]}


# 프롬프트 파일 목록. 키는 data/llm-records/prompts/<슬러그>.json 의 슬러그이고, 값은 그 파일 한 벌을 만드는 함수다.
# 판정 체계 편의 빌더 셋(-score, -pairs, -cascade)은 아래 판정 체계 절에서 더한다. 빌더가 None 을 돌려주면 만들 항목이 없다는 뜻이다.
PROMPTS = {SLUG: copy_prompts}

# ---------- 게이트 넷과 답 읽기. 아래 SHARED 의 정의는 글의 파이썬 블록에 글자 그대로 들어간다. ----------

# 답을 스키마대로 읽는다. 키가 status, candidates 둘뿐이고, 카피는 5개까지, 카피마다 copy 와 quote 두 문자열이어야 한다.
# status 가 ok 면 카피가 하나 이상, no_generation 이면 0개여야 한다. 꼴이 다르면 None 이고 읽지 못한 답으로 센다.
def read_answer(text):
    try:
        answer = json.loads(text)
    except ValueError:
        return None
    if not (isinstance(answer, dict) and set(answer) == {'status', 'candidates'}):
        return None
    status, cands = answer['status'], answer['candidates']
    if status not in ('ok', 'no_generation') or not isinstance(cands, list) or len(cands) > 5:
        return None
    for c in cands:
        if not (isinstance(c, dict) and set(c) == {'copy', 'quote'}) or not all(isinstance(v, str) for v in c.values()):
            return None
    if (status == 'ok') != bool(cands):
        return None
    return answer


# 최상급 게이트가 보는 낱말 여섯. 카피에 있으면 그 자산에도 있어야 지난다.
SUPERLATIVES = ['최고', '최초', '1위', '유일', '가장', '국내 최대']
# 숫자 하나. 쉼표로 묶은 천 단위와 소수점까지 한 덩어리로 읽는다.
NUMBER = re.compile(r'\d+(?:,\d{3})*(?:\.\d+)?')


# 글에 든 숫자의 집합. 쉼표는 지운다. 12,900 과 12900 은 같은 숫자이고, 240 은 1240 안에서 찾지 않는다.
def numbers(text):
    return {n.replace(',', '') for n in NUMBER.findall(text)}


# 근거 게이트. quote 가 비어 있지 않고 자산 안에 글자 그대로 있으며, 카피의 숫자가 모두 자산에 있어야 지난다.
def gate_grounding(copy, quote, asset):
    return bool(quote) and quote in asset and numbers(copy) <= numbers(asset)


# 길이 게이트. 공백과 문장 부호를 포함한 len() 이 max_len 이하여야 지난다.
def gate_length(copy, max_len=40):
    return len(copy) <= max_len


# 공백을 모두 지운 뒤 글자 두 개씩 묶은 집합. 띄어쓰기만 다른 두 카피는 같은 집합이 된다.
def bigrams(text):
    s = ''.join(text.split())
    return {s[i:i + 2] for i in range(len(s) - 1)}


# 두 집합의 Jaccard. 교집합 크기를 합집합 크기로 나눈다. 둘 다 비면 같은 것으로 본다.
def jaccard(a, b):
    return len(a & b) / len(a | b) if a | b else 1.0


# 중복 게이트. 같은 자산에서 앞서 남은 카피(kept) 모두와 Jaccard 가 0.8 보다 작아야 지난다.
def gate_duplicate(copy, kept):
    return all(jaccard(bigrams(copy), bigrams(k)) < 0.8 for k in kept)


# 최상급 게이트. 카피에 든 SUPERLATIVES 의 낱말이 모두 자산에도 있어야 지난다.
def gate_superlative(copy, asset):
    return all(word in asset for word in SUPERLATIVES if word in copy)


# 답마다 카피를 게이트 넷에 근거, 길이, 중복, 최상급 차례로 넣는다. 카피는 처음 걸린 게이트 하나에서만 센다.
# 돌려주는 줄은 (자산 id, 답 안의 차례, 카피, quote, 처음 걸린 게이트) 이고, 다 지나면 게이트 자리가 None 이다.
# 읽지 못한 답과 no_generation 은 카피가 없어 줄을 내지 않는다. record 는 {자산 id: 답 글}, assets 는 {자산 id: 자산 텍스트} 다.
def judge_copies(record, assets):
    rows = []
    for aid, text in record.items():
        answer = read_answer(text)
        if answer is None:
            continue
        asset, kept = assets[aid], []
        for n, c in enumerate(answer['candidates'], 1):
            copy, quote = c['copy'], c['quote']
            if not gate_grounding(copy, quote, asset):
                failed = 'grounding'
            elif not gate_length(copy):
                failed = 'length'
            elif not gate_duplicate(copy, kept):
                failed = 'duplicate'
            elif not gate_superlative(copy, asset):
                failed = 'superlative'
            else:
                failed = None
                kept.append(copy)
            rows.append((aid, n, copy, quote, failed))
    return rows


# 게이트 넷을 모두 지난 카피. (자산 id, 답 안의 차례, 카피, quote) 를 기록의 차례대로 돌려준다.
def passing_copies(record, assets):
    return [(aid, n, copy, quote) for aid, n, copy, quote, failed in judge_copies(record, assets) if failed is None]


# 글에 옮기는 이름. 글의 파이썬 블록은 이 이름을 모두 정의해야 하고, 정의의 줄 전체(끝 줄의 주석까지)가 이 파일의 것과 같아야 한다.
# 정의 위의 주석은 대조하지 않는다. 글은 그 자리에 단계 풀이를 쓴다.
SHARED = ['read_answer', 'SUPERLATIVES', 'NUMBER', 'numbers', 'gate_grounding', 'gate_length', 'bigrams', 'jaccard',
          'gate_duplicate', 'gate_superlative', 'judge_copies', 'passing_copies']

# ---------- 여기부터는 기록 읽기, 대조, 출력이다. 글에는 옮기지 않는다. ----------

THIN = ('x09', 'x10')
ASSET_LEN = (120, 200)
SENTENCE_MAX = 80
# x02~x10 에 넣지 않는 건강과 몸의 말. 효능 주장이 섞여 들지 않았는지 고칠 때마다 본다.
# x01(ASSET_RUNNING)은 공용 생성기의 값이라 여기서 보지 않는다. 「발바닥에 오는 충격」이 그 문장에 있다.
BODY_WORDS = ('건강', '통증', '무릎', '관절', '부상', '체중', '다이어트', '피로', '회복', '질병', '발바닥', '발목', '발가락',
              '발등', '근육', '혈액', '피부', '수면', '칼로리', '심박', '허리', '어깨')
FENCE = re.compile(r'^```([^\n`]*)\n(.*?)^```[ \t]*$', re.M | re.S)    # scripts/check-code-blocks.js 의 FENCE 와 같은 꼴
LITERAL = re.compile(r'^ASSETS = \[\n.*?^\]$', re.M | re.S)


def rel(path):
    return os.path.relpath(path, ROOT)


def read_text(path):
    with open(path, encoding='utf-8') as f:
        return f.read()


def asset_errors():
    """ASSETS 의 꼴을 본다. 틀린 곳을 적은 문장 목록을 돌려주고, 맞으면 빈 목록이다."""
    out = []
    if [a[0] for a in ASSETS] != ['x%02d' % i for i in range(1, 11)]:
        out.append('자산 id 가 x01 부터 x10 까지 차례대로가 아닙니다')
    if not all(isinstance(a, tuple) and len(a) == 2 and all(isinstance(v, str) for v in a) for a in ASSETS):
        return out + ['자산이 (id, 자산 텍스트) 꼴이 아닙니다']
    if ASSETS[0][1] != ASSET_RUNNING or not re.search(r'^    \("x01", ASSET_RUNNING\),$', literal_source(), re.M):
        out.append('x01 이 scripts/gen-ads-data.py 의 ASSET_RUNNING 을 가리키지 않습니다. 글자를 옮겨 적지 말고 이름으로 둡니다')
    for aid, text in ASSETS[1:]:
        if not ASSET_LEN[0] <= len(text) <= ASSET_LEN[1]:
            out.append('%s: %d자입니다. %d~%d자로 씁니다' % (aid, len(text), ASSET_LEN[0], ASSET_LEN[1]))
        sentences = re.split(r'(?<=\.) ', text)
        if not all(s.endswith('.') for s in sentences) or '·' in text:
            out.append('%s: 문장이 모두 마침표로 끝나지 않거나 가운뎃점이 있습니다' % aid)
        out += ['%s: 문장이 %d자입니다. %d자 이하로 씁니다' % (aid, len(s), SENTENCE_MAX) for s in sentences if len(s) > SENTENCE_MAX]
        found = [w for w in BODY_WORDS if w in text]
        if found:
            out.append('%s: 건강이나 몸에 관한 말(%s)이 있습니다' % (aid, ', '.join(found)))
    for aid, text in ASSETS:
        if aid in THIN and numbers(text):
            out.append('%s: 얇은 자산인데 숫자(%s)가 있습니다' % (aid, ', '.join(sorted(numbers(text)))))
    texts = [a[1] for a in ASSETS]
    if len(set(texts)) != len(texts):
        out.append('같은 자산 텍스트가 둘 이상 있습니다')
    return out


def prompt_text(spec):
    """프롬프트 파일 한 벌. 맨 위 필드는 한 줄에 하나, 항목도 한 줄에 하나씩 둔다."""
    head = {k: v for k, v in spec.items() if k != 'items'}
    lines = ['{' + ',\n '.join('%s: %s' % (json.dumps(k), json.dumps(v, ensure_ascii=False)) for k, v in head.items())
             + ',\n "items": [']
    lines.append(',\n'.join('  ' + json.dumps(it, ensure_ascii=False) for it in spec['items']))
    lines.append(' ]}')
    return '\n'.join(lines) + '\n'


def literal_source():
    """이 파일에서 「ASSETS = [」 줄부터 닫는 「]」 줄까지의 글. 글의 파이썬 블록에 이 글이 그대로 들어 있어야 한다."""
    found = LITERAL.search(read_text(os.path.abspath(__file__)))
    if not found:
        raise SystemExit('✗ 이 파일에서 「ASSETS = [」 줄부터 닫는 「]」 줄까지의 리터럴을 찾지 못했습니다')
    return found.group(0)


def definitions(src):
    """맨 위 수준에서 정의한 이름마다 그 정의의 글. 문장의 줄 전체(끝 줄의 주석까지)이고, 한 이름을 여러 문장이 정의하면
    나온 차례로 잇는다. scripts/gen-ads-data.py 의 definitions 와 같은 꼴이다. 파이썬으로 읽지 못하면 SyntaxError 가 난다."""
    lines = src.split('\n')
    out = {}
    for node in ast.parse(src).body:
        name = None
        if isinstance(node, ast.FunctionDef):
            name = node.name
        elif isinstance(node, ast.Assign) and len(node.targets) == 1:
            target = node.targets[0]
            target = target.value if isinstance(target, ast.Subscript) else target
            name = target.id if isinstance(target, ast.Name) else None
        if name:
            out.setdefault(name, []).append('\n'.join(lines[node.lineno - 1:node.end_lineno]))
    return {name: '\n'.join(parts) for name, parts in out.items()}


def first_diff(a, b):
    """두 글에서 처음 다른 줄. (줄 번호, a 의 그 줄, b 의 그 줄). 한쪽에 그 줄이 없으면 (없음)."""
    la, lb = a.split('\n'), b.split('\n')
    i = next((j for j, (x, y) in enumerate(zip(la, lb)) if x != y), min(len(la), len(lb)))
    return i + 1, la[i].strip()[:60] if i < len(la) else '(없음)', lb[i].strip()[:60] if i < len(lb) else '(없음)'


def first_char_diff(a, b):
    """두 글에서 처음 다른 글자의 자리. (줄 번호, a 의 그 자리 앞뒤, b 의 그 자리 앞뒤). 줄바꿈은 \\n 으로 보인다."""
    i = next((j for j, (x, y) in enumerate(zip(a, b)) if x != y), min(len(a), len(b)))

    def show(s):
        part = ('…' if i > 20 else '') + s[max(0, i - 20):i + 30] + ('…' if i + 30 < len(s) else '')
        return part.replace('\n', '\\n') or '(끝)'

    return a.count('\n', 0, i) + 1, show(a), show(b)


def planned(spec):
    """기록 도구가 이 프롬프트로 보낼 요청의 차례. scripts/llm-record.py 의 plan_requests 를 그대로 불러 쓴다."""
    return load_script(RECORD_TOOL, 'llm_record').plan_requests(spec, None)


def record_errors(slug, spec):
    """기록 하나가 지금 프롬프트로 받은 것인지 본다. (틀린 곳 목록, 기록이 있었는가)."""
    path = os.path.join(RECORDS_DIR, slug + '.json')
    if not os.path.exists(path):
        return [], False
    try:
        items = json.loads(read_text(path))['items']
        fields = ('id', 'think', 'run', 'system', 'user', 'options')
        got = [tuple(json.dumps(it[k], ensure_ascii=False, sort_keys=True) for k in fields) for it in items]
        broken = [it['id'] for it in items if 'error' in it]
    except (ValueError, KeyError, TypeError) as e:
        return ['%s 를 읽지 못했습니다 (%s: %s)' % (rel(path), type(e).__name__, e)], True
    want = [tuple(json.dumps(job[k], ensure_ascii=False, sort_keys=True) for k in fields) for job in planned(spec)]
    out = []
    if got != want:
        n = next((k for k, (x, y) in enumerate(zip(got, want)) if x != y), min(len(got), len(want)))
        out.append('%s 는 지금 프롬프트로 받은 기록이 아닙니다 (항목 %d개, 보낼 요청 %d개, 처음 다른 자리 %d번째). '
                   '--prompts %s 로 다시 뽑고 다시 기록합니다' % (rel(path), len(got), len(want), n + 1, slug))
    if broken:
        out.append('%s 에 error 가 남은 항목이 있습니다 (%s). 다시 기록합니다' % (rel(path), ', '.join(broken)))
    return out, True


class NeedRecord(Exception):
    """앞 기록이 없거나, error 가 남았거나, 지금 프롬프트로 받은 기록이 아니라서 그 기록을 읽는 빌더가 프롬프트를 만들 수 없다."""


def record_constant(slug, spec):
    """기록 하나를 글의 RECORD 상수와 같은 꼴({키: 답 글})로 돌려준다. 키는 scripts/llm-record.py 의 key_of 꼴이라,
    thinking 을 끈 첫 회차는 id 그대로, 그 밖은 「id|off|2」, 「id|on|1」 꼴이다.
    기록이 없거나, error 가 남았거나, 지금 프롬프트로 받은 기록이 아니면 그 까닭을 담아 NeedRecord 를 낸다."""
    path = os.path.join(RECORDS_DIR, slug + '.json')
    wrong, has_record = record_errors(slug, spec)
    if not has_record:
        raise NeedRecord('%s 가 없습니다. 먼저 python3 scripts/llm-record.py --slug %s 로 기록합니다' % (rel(path), slug))
    if wrong:
        raise NeedRecord(' / '.join(wrong))
    key_of = load_script(RECORD_TOOL, 'llm_record').key_of
    return {key_of(it): it['output'] for it in json.loads(read_text(path))['items']}


def copy_record():
    """카피 기록의 답을 글의 RECORD 와 같은 꼴({자산 id: 답 글})로 돌려준다. 판정 체계 편의 빌더가
    passing_copies(copy_record(), dict(ASSETS)) 로 게이트를 지난 카피를 얻는다.
    기록이 없거나, error 가 남았거나, 지금 프롬프트로 받은 기록이 아니면 그 까닭을 담아 NeedRecord 를 낸다."""
    return record_constant(SLUG, copy_prompts())


# ---------- 판정 체계 편(posts/generated-copy-judging-system.md)의 프롬프트 세 벌 ----------
# 판정할 카피는 게이트 넷을 지난 카피 전부다(passing_copies). 세 기록은 같은 시스템 메시지(JUDGE_SYSTEM)를 쓴다.
# -score 는 카피마다 채점표의 1~5 점을 thinking 끔, temperature 0.7 로 5번(run 마다 seed 7 + run) 받는다.
# -pairs 는 pick_pairs 가 고른 같은 자산의 카피 20쌍을 좌우를 바꿔 두 번(-ab, -ba), thinking 끔, temperature 0 으로 받는다.
# -cascade 는 두 기록에서 uncertain 이 고른 것만 thinking 켬, temperature 0 으로 다시 받는다. 카피는 -score 의 사용자 메시지로
# 한 번, 쌍은 -pairs 의 사용자 메시지로 -ab 와 -ba 두 번이다. 기록 모델은 하나라, 같은 모델의 thinking 끔이 싼 판정자, 켬이 비싼 판정자다.
# 캐스케이드 파일 하나에 카피와 쌍이 함께 들어가고 프롬프트 파일의 시스템 메시지는 하나뿐이라, 세 기록 모두 두 물음을 함께 적은 같은 시스템 메시지를 쓴다.
# 출력은 영어와 숫자뿐이다({"score": N}, {"winner": "A"}). 한국어는 시스템 메시지와 사용자 메시지(자산, 카피, quote)에만 있다.
JUDGE_SLUG = 'generated-copy-judging-system'
JUDGE_SCORE = JUDGE_SLUG + '-score'
JUDGE_PAIRS = JUDGE_SLUG + '-pairs'
JUDGE_CASCADE = JUDGE_SLUG + '-cascade'
# 채점표를 담은 시스템 메시지. 카피 생성 편의 시스템 메시지가 정한 넷(사실은 quote 안, 숫자는 자산의 것만, 근거 없는 최상급 금지,
# 문장 끝)에 읽기 쉬움을 더한 다섯 요구를 기록 전에 정했고(Ruling B3-21), 점수를 본 뒤에는 고치지 않는다.
# 글의 더 깊이 보기에 코드 블록으로 그대로 실리니 가운뎃점 글자와 어색한 낱말(드러나다, 어긋나다 같은 말)을 쓰지 않는다.
JUDGE_SYSTEM = '\n'.join([
    '너는 검색 광고 카피를 채점하는 검수자다. 광고주의 자산 텍스트와, 그 자산으로 쓴 카피와 quote 를 받는다.',
    'quote 는 카피가 기댄 구절을 자산 텍스트에서 옮긴 것이다. 카피는 아래 다섯 요구로 본다.',
    '1. 카피가 말하는 상품의 성질(무게, 크기, 기능, 조건 같은 것)은 모두 quote 안에 있다. quote 에 없는 성질이나 꾸밈말을 더하지 않았고, '
    'quote 의 뜻을 넓히지 않았다. 상품의 이름과 종류는 자산에 있으면 더해도 된다.',
    '2. 카피의 숫자는 모두 자산 텍스트에 있는 숫자다.',
    '3. 최고, 최초, 1위, 유일, 가장, 국내 최대 같은 최상급 표현은 자산이 같은 범위로 말할 때만 쓴다.',
    '4. 문장 끝은 명사나 「~합니다」 꼴이다.',
    '5. 검색 광고 문구로 읽기 쉽다. 한 번 읽어 뜻이 들어오고, 조사가 빠져 끊기거나 낱말이 어색하게 이어지지 않는다.',
    '점수는 1~5 의 정수다.',
    '5: 다섯 요구를 모두 지켰다.',
    '4: 1, 2, 3 은 지켰고, 4 와 5 가운데 하나를 어겼다.',
    '3: 1, 2, 3 은 지켰고, 4 와 5 를 둘 다 어겼다.',
    '2: 1, 2, 3 가운데 하나를 어겼다.',
    '1: 1, 2, 3 가운데 둘 이상을 어겼다.',
    '사용자 메시지에 카피가 하나 있으면 그 카피의 점수를 매겨 아래 꼴의 JSON 한 줄로만 답한다.',
    '{"score": <1~5 의 정수>}',
    '사용자 메시지에 카피 A 와 카피 B 가 있으면 다섯 요구로 보아 더 나은 쪽을 골라 아래 꼴의 JSON 한 줄로만 답한다. 둘이 비슷해도 하나를 고른다.',
    '{"winner": "<A|B>"}',
    '설명이나 다른 글은 붙이지 않는다.'])

# ----- 아래 JUDGE_SHARED 의 정의는 판정 체계 글의 파이썬 블록에 글자 그대로 들어간다. 정의 위의 주석은 대조하지 않는다. -----

# 사람 라벨(가상). 판정 기록을 받기 전에 채점표대로 카피마다 매겼다. 5 점이 아닌 카피와 그 카피가 어긴 요구 번호는 이렇다.
# 4 점 셋: x02-3, x02-5 는 요구 5(관형절 안의 「는」, 「은」이 어색하다), x04-1 은 요구 5(조사가 빠져 끊긴다).
# 2 점 다섯: x03-5 는 요구 3(자산의 「숲결 러닝화 가운데」라는 범위를 뺀 「가장」), x04-5 는 요구 1(quote 의 「쉽게」를 빼 뜻을 넓혔다),
# x07-1 은 요구 1 과 4(quote 에 없는 「가볍게 들고 다니」, 「~하세요」), x07-2 는 요구 1(quote 에 없는 「휴대하기 편한」),
# x07-4 는 요구 1 과 4(quote 에 없는 「편리하게 보관」, 「~하세요」).
# 상품의 이름과 종류를 더한 카피(x02-3, x04-2 같은 것)와, quote 가 든 자산 문장의 주어를 되살린 카피(x03-3 의 겉감, x05-4 의 화면)는
# 요구 1 을 어긴 것으로 보지 않았다. 「선택 가능」처럼 명사로 끝나는 짧은 꼴(x07-5)은 요구 5 를 어긴 것으로 보지 않았다.
HUMAN = {
    "x01-1": 5, "x01-2": 5, "x01-3": 5, "x01-4": 5, "x01-5": 5,
    "x02-1": 5, "x02-2": 5, "x02-3": 4, "x02-4": 5, "x02-5": 4,
    "x03-1": 5, "x03-2": 5, "x03-3": 5, "x03-4": 5, "x03-5": 2,
    "x04-1": 4, "x04-2": 5, "x04-4": 5, "x04-5": 2,
    "x05-1": 5, "x05-2": 5, "x05-3": 5, "x05-4": 5, "x05-5": 5,
    "x06-1": 5, "x06-2": 5, "x06-3": 5, "x06-4": 5, "x06-5": 5,
    "x07-1": 2, "x07-2": 2, "x07-3": 5, "x07-4": 2, "x07-5": 5,
    "x08-3": 5
}


# 점수 답 하나를 읽는다. LLM-as-a-Judge 편(posts/llm-as-a-judge.md)의 정의를 글자 그대로 옮겼다.
# 키가 score 하나이고 값이 1~5 의 정수일 때만 읽은 답이고, 그 밖은 None 이다.
def read_score(text):
    try:
        obj = json.loads(text)
    except ValueError:
        return None
    if not isinstance(obj, dict) or list(obj) != ['score']:
        return None
    s = obj['score']
    return s if isinstance(s, int) and not isinstance(s, bool) and 1 <= s <= 5 else None


# -score 기록 상수에서 카피마다 점수 다섯. 키는 run 1 이 카피 id, run 2~5 가 「카피 id|off|run」 이다. 읽지 못한 답은 None 이다.
def score_table(record, ids, runs=5):
    return {cid: [read_score(record[cid if r == 1 else f'{cid}|off|{r}']) for r in range(1, runs + 1)] for cid in ids}


# 승자 답 하나를 읽는다. LLM-as-a-Judge 편의 정의를 글자 그대로 옮겼다. 키가 winner 하나이고 값이 A 나 B 일 때만 읽은 답이다.
def read_winner(text):
    try:
        obj = json.loads(text)
    except ValueError:
        return None
    if not isinstance(obj, dict) or list(obj) != ['winner'] or obj['winner'] not in ('A', 'B'):
        return None
    return obj['winner']


# 같은 자산의 카피 쌍을 고른다. ids 는 자산 id 와 카피 번호 차례인 카피 id 목록이다.
# 자산 안에서는 카피 번호 차례로 (i, j), i < j 를 늘어놓고, 자산 id 차례로 돌아가며 첫 쌍, 둘째 쌍 차례로 limit 개까지 고른다.
# 카피가 하나뿐인 자산은 쌍이 없다.
def pick_pairs(ids, limit=20):
    by_asset = {}
    for cid in ids:
        by_asset.setdefault(cid.rsplit('-', 1)[0], []).append(cid)
    queues = [list(combinations(by_asset[aid], 2)) for aid in sorted(by_asset)]
    pairs = []
    for k in range(max(len(q) for q in queues)):
        pairs += [q[k] for q in queues if k < len(q)]
    return pairs[:limit]


# 쌍 id. 「x01-1」 과 「x01-3」 의 쌍은 「x01-1-3」 이다. 기록의 항목 id 는 그 뒤에 -ab(앞 카피가 A) 나 -ba(뒤 카피가 A) 를 붙인다.
def pair_id(i, j):
    return f'{i}-{j.rsplit("-", 1)[1]}'


# -pairs 기록 상수에서 쌍마다 (-ab 의 답, -ba 의 답). 읽지 못한 답은 None 이다.
def verdict_table(record, pairs):
    return {(i, j): (read_winner(record[pair_id(i, j) + '-ab']), read_winner(record[pair_id(i, j) + '-ba'])) for i, j in pairs}


# 비싼 판정자에게 넘길 것. 점수 다섯의 최댓값과 최솟값이 gap 이상 차이 나거나 읽지 못한 답이 든 카피,
# 두 번의 답이 같은 자리(둘 다 A 나 둘 다 B)라 좌우를 바꾸면 승자가 바뀌거나 읽지 못한 답이 든 쌍이다.
def uncertain(scores, verdicts, gap=2):
    copies = [cid for cid, s in scores.items() if None in s or max(s) - min(s) >= gap]
    pairs = [p for p, (ab, ba) in verdicts.items() if ab is None or ba is None or ab == ba]
    return copies, pairs


# 판정 체계 글에 옮기는 이름. 글의 파이썬 블록은 이 이름을 모두 정의해야 하고, 정의의 줄 전체가 이 파일의 것과 같아야 한다.
JUDGE_SHARED = ['HUMAN', 'read_score', 'score_table', 'read_winner', 'pick_pairs', 'pair_id', 'verdict_table', 'uncertain']


def judge_targets():
    """판정할 카피. 게이트 넷을 지난 카피를 기록 차례대로 (카피 id, 자산 id, 카피, quote) 로 돌려준다. 카피 id 는 「x01-3」 꼴이다."""
    return [(f'{aid}-{n}', aid, copy, quote) for aid, n, copy, quote in passing_copies(copy_record(), dict(ASSETS))]


def score_user(asset, copy, quote):
    """-score 의 사용자 메시지. 자산 텍스트와 카피와 quote 를 줄을 나눠 적는다."""
    return f'자산 텍스트:\n{asset}\n\n카피:\n{copy}\nquote:\n{quote}'


def pair_user(asset, a, b):
    """-pairs 의 사용자 메시지. a 와 b 는 (카피, quote) 이고, a 를 카피 A 자리에, b 를 카피 B 자리에 둔다."""
    return f'자산 텍스트:\n{asset}\n\n카피 A:\n{a[0]}\n카피 A 의 quote:\n{a[1]}\n\n카피 B:\n{b[0]}\n카피 B 의 quote:\n{b[1]}'


def judge_prompts_score():
    """카피마다 항목 하나. thinking 끔, temperature 0.7 로 5번 보낸다. seed 를 적지 않아 기록 도구가 run 마다 7 + run 을 쓴다."""
    asset = dict(ASSETS)
    return {'system': JUDGE_SYSTEM, 'think': 'off', 'repeat': 5, 'options': {'temperature': 0.7},
            'items': [{'id': cid, 'user': score_user(asset[aid], copy, quote)} for cid, aid, copy, quote in judge_targets()]}


def judge_prompts_pairs():
    """pick_pairs 가 고른 쌍마다 항목 둘. 「<쌍 id>-ab」 는 앞 카피를, 「<쌍 id>-ba」 는 뒤 카피를 A 자리에 둔다. thinking 끔, temperature 0."""
    asset = dict(ASSETS)
    found = {cid: (aid, (copy, quote)) for cid, aid, copy, quote in judge_targets()}
    items = []
    for i, j in pick_pairs(list(found)):
        text, a, b = asset[found[i][0]], found[i][1], found[j][1]
        items += [{'id': pair_id(i, j) + '-ab', 'user': pair_user(text, a, b)},
                  {'id': pair_id(i, j) + '-ba', 'user': pair_user(text, b, a)}]
    return {'system': JUDGE_SYSTEM, 'think': 'off', 'repeat': 1, 'options': {'temperature': 0}, 'items': items}


def judge_prompts_cascade():
    """-score 와 -pairs 기록에서 uncertain 이 고른 카피와 쌍을 thinking 켬, temperature 0 으로 다시 본다.
    카피는 -score 의 사용자 메시지로 한 번, 쌍은 -pairs 의 사용자 메시지로 -ab 와 -ba 두 번 보내고, 항목 id 도 두 기록의 것을 그대로 쓴다.
    고른 것이 없으면 None 이다. 그때는 캐스케이드 프롬프트 파일과 기록을 만들지 않는다. 두 기록을 쓸 수 없으면 NeedRecord 를 낸다."""
    score_spec, pairs_spec = judge_prompts_score(), judge_prompts_pairs()
    ids = [it['id'] for it in score_spec['items']]
    scores = score_table(record_constant(JUDGE_SCORE, score_spec), ids)
    verdicts = verdict_table(record_constant(JUDGE_PAIRS, pairs_spec), pick_pairs(ids))
    copies, pairs = uncertain(scores, verdicts)
    if not copies and not pairs:
        return None
    users = {it['id']: it['user'] for it in score_spec['items'] + pairs_spec['items']}
    keys = copies + [pair_id(i, j) + side for i, j in pairs for side in ('-ab', '-ba')]
    return {'system': JUDGE_SYSTEM, 'think': 'on', 'repeat': 1, 'options': {'temperature': 0},
            'items': [{'id': k, 'user': users[k]} for k in keys]}


PROMPTS[JUDGE_SCORE] = judge_prompts_score
PROMPTS[JUDGE_PAIRS] = judge_prompts_pairs
PROMPTS[JUDGE_CASCADE] = judge_prompts_cascade
# 이 생성기가 쓰는 슬러그의 앞부분. 이 말로 시작하는 프롬프트 파일과 기록 파일은 모두 PROMPTS 에 등록한 슬러그여야 한다.
OWN_PREFIXES = (SLUG, JUDGE_SLUG)


def human_errors():
    """사람 라벨의 꼴을 본다. 키가 판정할 카피 id 와 같은 차례이고 값이 1~5 의 정수여야 한다. 틀린 곳을 적은 문장 목록을 돌려준다."""
    try:
        ids = [t[0] for t in judge_targets()]
    except NeedRecord as e:
        return ['사람 라벨을 판정할 카피와 대조하지 못했습니다. %s' % e]
    out = []
    if list(HUMAN) != ids:
        out.append('HUMAN 의 키가 게이트를 지난 카피 id 와 같은 차례가 아닙니다 (HUMAN %d개, 카피 %d개)' % (len(HUMAN), len(ids)))
    bad = [k for k, v in HUMAN.items() if not (type(v) is int and 1 <= v <= 5)]
    if bad:
        out.append('HUMAN 의 값이 1~5 의 정수가 아닙니다: %s' % ', '.join(bad))
    return out


def shared_errors(path, text, wants, required):
    """글 하나의 python 블록에서 정의를 대조한다. wants 는 (이름, 그 정의의 글, 출처를 적은 말) 목록이다.
    (틀린 곳 목록, 대조한 정의 수). required 면 wants 의 이름을 모두 정의해야 하고, 아니면 정의한 것만 대조한다."""
    out, done, seen = [], 0, set()
    names = '|'.join(name for name, _, _ in wants)
    for i, m in enumerate((m for m in FENCE.finditer(text) if m.group(1).strip() == 'python'), 1):
        try:
            defs = definitions(m.group(2))
        except SyntaxError:
            if re.search(r'^\s*(?:def (?:%s)\(|(?:%s) = )' % (names, names), m.group(2), re.M):
                out.append('%s: 파이썬 %d번째 블록을 파이썬으로 읽지 못해 정의를 대조하지 못했습니다' % (rel(path), i))
            continue
        for key, want, source in wants:
            if key not in defs:
                continue
            done += 1
            seen.add(key)
            if defs[key] != want:
                line, got, exp = first_diff(defs[key], want)
                out.append('%s: 파이썬 %d번째 블록의 %s 정의가 %s 것과 다릅니다 (%d번째 줄, 글 「%s」, 생성기 「%s」). '
                           '정의를 글자 그대로 옮기고, 다른 뜻이면 이름을 바꿉니다' % (rel(path), i, key, source, line, got, exp))
    lack = [name for name, _, _ in wants if name not in seen]
    if required and lack:
        out.append('%s: 파이썬 블록에 정의가 없습니다: %s' % (rel(path), ', '.join(lack)))
    return out, done


def check():
    errors = asset_errors() + human_errors()
    done = Counter()
    # 0) 등록하지 않은 파일. 이 생성기의 슬러그로 시작하는 프롬프트 파일과 기록 파일은 모두 PROMPTS 에 있어야 한다.
    # 등록하지 않은 빌더의 파일은 아래 대조가 열어 보지 않아서, 손으로 만든 파일이 검사 밖에 남기 때문이다.
    for folder in (PROMPTS_DIR, RECORDS_DIR):
        for name in sorted(os.listdir(folder)):
            stem, ext = os.path.splitext(name)
            if ext != '.json' or not stem.startswith(OWN_PREFIXES):
                continue
            done['등록을 확인한 파일'] += 1
            if stem not in PROMPTS:
                errors.append('%s: 이 생성기의 슬러그(%s)로 시작하는데 PROMPTS 에 등록하지 않은 파일입니다. '
                              '빌더를 PROMPTS 에 등록하거나 파일을 지웁니다' % (rel(os.path.join(folder, name)), ', '.join(OWN_PREFIXES)))
    # 1) 프롬프트 파일, 2) 기록
    for slug, build in PROMPTS.items():
        path = os.path.join(PROMPTS_DIR, slug + '.json')
        there = [rel(p) for p in (path, os.path.join(RECORDS_DIR, slug + '.json')) if os.path.exists(p)]
        try:
            spec = build()
        except NeedRecord as e:
            # 앞 기록이 없거나 쓸 수 없어 이 프롬프트를 다시 만들 수 없다. 이 슬러그의 파일이 하나라도 있으면 대조할 수 없으니 실패다
            if there:
                errors.append('%s 를 빌더로 다시 만들 수 없습니다. %s' % (', '.join(there), e))
            continue
        if spec is None:
            # 빌더가 고른 것이 없다. 그 프롬프트 파일과 기록은 만들지 않으므로 둘 다 없어야 한다
            if there:
                errors.append('%s: 빌더(%s)가 고른 항목이 없어 만들지 않아야 하는 파일이 있습니다. 지우거나 앞 기록을 다시 봅니다'
                              % (', '.join(there), build.__name__))
            else:
                done['고른 것이 없어 만들지 않은 프롬프트'] += 1
            continue
        wrong, has_record = record_errors(slug, spec)
        if not os.path.exists(path):
            errors.append('%s 가 없습니다%s. --prompts %s 로 뽑습니다' % (
                rel(path), ' (기록 data/llm-records/%s.json 은 있습니다)' % slug if has_record else '', slug))
        else:
            done['프롬프트 파일'] += 1
            on_disk, want = read_text(path), prompt_text(spec)
            if on_disk != want:
                line, got, exp = first_char_diff(on_disk, want)
                errors.append('%s: 빌더로 다시 만든 글과 %d번째 줄부터 다릅니다 (파일 「%s」, 빌더 「%s」). '
                              '--prompts %s 로 다시 뽑고 다시 기록합니다' % (rel(path), line, got, exp, slug))
        if has_record:
            done['기록'] += 1
            errors += wrong
    # 3) 글의 리터럴, 4) 글의 공용 정의, 5) 뒤 글의 리터럴과 공용 정의
    literal = literal_source()
    mine = definitions(read_text(os.path.abspath(__file__)))
    ads = definitions(read_text(ADS_TOOL))['ASSET_RUNNING']
    gate_wants = [(k, mine[k], '이 파일의') for k in SHARED] + [('ASSET_RUNNING', ads, 'scripts/gen-ads-data.py 의')]
    for path, required in [(POST, True)] + [(p, False) for p in LATER]:
        try:
            text = read_text(path)
        except FileNotFoundError:
            if required:
                errors.append('%s 가 없습니다' % rel(path))
            continue
        starts = len(re.findall(r'^ASSETS = \[', text, re.M))
        if required or starts:
            done['글의 ASSETS 리터럴'] += 1
            found = LITERAL.findall(text)
            if not found or len(found) != starts or any(f != literal for f in found):
                errors.append('%s: 파이썬 블록에 이 파일의 ASSETS 리터럴이 글자까지 그대로 들어 있지 않습니다' % rel(path))
        wrong, compared = shared_errors(path, text, gate_wants, required)
        errors += wrong
        done['글의 공용 정의'] += compared
    # 6) 판정 체계 글의 공용 정의. 사람 라벨 리터럴(HUMAN)도 이름 하나로 대조한다
    try:
        text = read_text(JUDGE_POST)
    except FileNotFoundError:
        errors.append('%s 가 없습니다' % rel(JUDGE_POST))
    else:
        wrong, compared = shared_errors(JUDGE_POST, text, [(k, mine[k], '이 파일의') for k in JUDGE_SHARED], True)
        errors += wrong
        done['판정 글의 공용 정의'] += compared
    for e in errors:
        print('✗ ' + e)
    if errors:
        return 1
    parts = ['프롬프트 파일', '기록', '글의 ASSETS 리터럴', '글의 공용 정의', '판정 글의 공용 정의']
    print('✓ 자산 %d개(얇은 자산 %s)와 사람 라벨 %d개의 꼴이 맞고, 대조 %d건(%s)이 이 파일과 같습니다. '
          '이 생성기의 슬러그로 시작하는 파일 %d개가 모두 등록돼 있고, 고른 것이 없어 만들지 않은 프롬프트는 %d벌입니다'
          % (len(ASSETS), ', '.join(THIN), len(HUMAN), sum(done[k] for k in parts), ', '.join('%s %d' % (k, done[k]) for k in parts),
             done['등록을 확인한 파일'], done['고른 것이 없어 만들지 않은 프롬프트']))
    return 0


def main():
    args = sys.argv[1:]
    if len(args) == 2 and args[0] == '--prompts':
        # 알림은 stderr 에 쓴다. stdout 은 프롬프트 파일로 받아 쓰는 자리라, 알림이 파일 안에 들어가지 않게 한다
        if args[1] not in PROMPTS:
            print('✗ PROMPTS 에 슬러그 %s 가 없습니다. 있는 것: %s' % (args[1], ', '.join(PROMPTS)), file=sys.stderr)
            return 2
        try:
            spec = PROMPTS[args[1]]()
        except NeedRecord as e:
            print('✗ %s 를 만들 수 없습니다. %s' % (args[1], e), file=sys.stderr)
            return 1
        if spec is None:
            print('✗ %s 는 고른 항목이 없습니다. 프롬프트 파일을 만들지 않습니다' % args[1], file=sys.stderr)
            return 1
        sys.stdout.write(prompt_text(spec))
        return 0
    if args == ['--check']:
        return check()
    if args:
        print(__doc__)
        return 2
    for aid, text in ASSETS:
        print('%s  %3d자  숫자 %-26s  %s' % (aid, len(text), ', '.join(sorted(numbers(text), key=float)) or '-', text.split('. ')[0]))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
