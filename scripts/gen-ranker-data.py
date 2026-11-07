#!/usr/bin/env python3
"""LLM 라벨과 코드 랭커 글(llm-labels-code-ranker)의 광고 후보 30개와 시스템 메시지 둘. 글의 파이썬 1 블록과 프롬프트 파일 둘이 이 파일의 값을 그대로 가져간다.

  python3 scripts/gen-ranker-data.py                   후보 30개를 한 줄씩 찍는다 (id, 정답 라벨, pCTR, 입찰가, pCTR × 입찰가, 첫 문장)
  python3 scripts/gen-ranker-data.py --prompts <슬러그>  PROMPTS 에 등록한 프롬프트 파일 한 벌을 찍는다. 아래처럼 받아 쓴다
      python3 scripts/gen-ranker-data.py --prompts llm-labels-code-ranker > data/llm-records/prompts/llm-labels-code-ranker.json
  python3 scripts/gen-ranker-data.py --check           후보 30개의 꼴과 정답 수를 본 뒤 아래 넷을 대조하고 몇 건 대조했는지 찍는다
                                                       1) PROMPTS 의 프롬프트 파일마다 파일 전체(system, think, repeat, repeat_subset,
                                                          think_subset, options, allow_length, items)가 빌더로 다시 만든 글과 글자까지 같은가.
                                                          파일이 없으면 실패로 두고, 기록이 있는데 파일이 없으면 그렇다고 알린다
                                                       2) 기록이 있으면 그 기록이 지금 프롬프트로 받은 것인가. 항목마다 id, think, run,
                                                          system, user, options 가 기록 도구(scripts/llm-record.py)가 보낼 차례와 같고 error 가 없어야 한다
                                                       3) 글(posts/llm-labels-code-ranker.md)의 파이썬 블록에 「CANDIDATES = [」 줄부터
                                                          닫는 「]」 줄까지의 리터럴이 글자까지 그대로 들어 있는가 (글이 없으면 실패)
                                                       4) 이 후보를 이어 쓰는 글(LATER 의 글)이 있고 「CANDIDATES = [」 줄이 있으면 그 리터럴도 같은가

후보 하나는 (id, 문장 s1, 문장 s2, 문장 s3, pCTR, 클릭 한 번의 입찰가 원, 정답 라벨) 이다. 질의는 「러닝화 추천」 하나다.
정답 라벨은 high 6개, mid 8개, low 10개, exclude 6개이고 모두 가상 값이다. exclude 셋은 질의와 무관한 광고, 셋은 근거 없이
성능, 가격, 인기를 내세우는 광고다. 건강이나 몸에 관한 효능은 어느 후보에도 넣지 않는다. 브랜드는 이 트랙의 가상 이름만 쓴다.
a01 은 서연 씨의 런솔 라이트다. 첫 문장은 scripts/gen-ads-data.py 의 ASSET_RUNNING 첫 문장 그대로이고, pCTR 1.2% 와
클릭당 600원(구매 1건 2만 원 × pCVR 3.0%)은 후보풀 여덟 질문 편의 값이다. 모델에게는 질의와 문장 셋만 보내고 pCTR, 입찰가, 정답은 보내지 않는다.
기록 둘은 서로 기대지 않는다. 포인트와이즈는 후보마다 한 번씩 30번, 리스트와이즈는 30개를 한 번에 주는 항목 하나를
출력 상한 없이 한 번(run 1), num_predict 400 으로 한 번(run 2) 보낸다. 잘려 온 답을 남기려고 리스트와이즈 파일에 allow_length 를 둔다.
CANDIDATES 리터럴이나 시스템 메시지를 고치면 글의 블록도 똑같이 고치고, 프롬프트 파일을 다시 뽑아
python3 scripts/llm-record.py --slug <슬러그> 로 다시 기록한다. 표준 라이브러리만 쓴다.
"""
import importlib.util
import json
import os
import re
import sys
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RECORDS_DIR = os.path.join(ROOT, 'data', 'llm-records')
PROMPTS_DIR = os.path.join(RECORDS_DIR, 'prompts')
POST = os.path.join(ROOT, 'posts', 'llm-labels-code-ranker.md')
# 이 후보를 이어 쓰는 뒤 글. 파일이 있고 「CANDIDATES = [」 줄이 있으면 그 리터럴도 대조한다.
LATER = [os.path.join(ROOT, 'posts', 'llm-labeling-distillation.md')]
RECORD_TOOL = os.path.join(ROOT, 'scripts', 'llm-record.py')
QUERY = '러닝화 추천'

# 광고 후보 30개. 이 리터럴이 글의 파이썬 1 블록에 글자 그대로 들어간다.
CANDIDATES = [
    ("a01", "런솔 라이트는 달리기를 처음 시작하는 사람을 위한 입문자용 러닝화입니다.", "밑창 전체에 쿠션 폼을 깔았습니다.", "한 짝 무게가 240g 으로 가볍습니다.", 0.012, 600, "high"),
    ("a02", "역 앞 헬스장의 3개월 이용권입니다.", "러닝머신 40대와 샤워실을 갖췄습니다.", "새벽 6시부터 밤 12시까지 엽니다.", 0.009, 1500, "low"),
    ("a03", "달릴 때 신는 러닝 전용 양말입니다.", "도톰한 실로 짰습니다.", "3켤레 묶음으로 팝니다.", 0.014, 240, "mid"),
    ("a04", "가볍고 반발력이 좋은 러닝화입니다.", "평생 달려도 밑창이 닳지 않습니다.", "사이즈는 240mm 부터 280mm 까지 있습니다.", 0.028, 500, "exclude"),
    ("a05", "모노웍스 데일리는 매일 달리는 사람을 위한 러닝화입니다.", "바닥에 홈을 깊게 파서 젖은 길에서도 덜 미끄러집니다.", "회색과 남색 두 가지 색으로 나옵니다.", 0.010, 700, "high"),
    ("a06", "바위가 많은 산길에 맞춘 등산화입니다.", "겉감에 방수 막을 넣었습니다.", "한 짝 무게가 520g 입니다.", 0.005, 600, "low"),
    ("a07", "달린 거리와 속도를 기록하는 GPS 시계입니다.", "한 번 충전하면 10일 동안 씁니다.", "기록을 휴대폰 앱으로 옮겨 볼 수 있습니다.", 0.008, 1400, "mid"),
    ("a08", "접어서 들고 다니는 캠핑 의자입니다.", "접으면 두께가 10cm 입니다.", "수납 가방을 함께 드립니다.", 0.003, 700, "exclude"),
    ("a09", "출근할 때 신기 좋은 가죽 스니커즈입니다.", "소가죽으로 만들었습니다.", "흰색과 검은색 두 가지입니다.", 0.006, 520, "low"),
    ("a10", "대회에서 기록을 재는 사람을 위한 레이싱 러닝화입니다.", "한 짝 무게가 190g 입니다.", "밑창을 얇게 만들어 바닥의 느낌이 잘 전해집니다.", 0.009, 900, "high"),
    ("a11", "오래 걸어도 편한 워킹화입니다.", "밑창을 두껍게 만들었습니다.", "출퇴근길에 신기 좋은 검은색입니다.", 0.008, 500, "mid"),
    ("a12", "집에서 쓰는 두께 8mm 요가 매트입니다.", "바닥에 미끄럼을 막는 무늬를 넣었습니다.", "말아서 끈으로 묶어 들고 다닙니다.", 0.004, 300, "low"),
    ("a13", "쿠션이 두꺼운 데일리 러닝화입니다.", "흰색, 검은색, 파란색으로 나옵니다.", "러너 100명 가운데 99명이 고른 판매 1위 러닝화입니다.", 0.022, 600, "exclude"),
    ("a14", "휴대폰과 열쇠를 넣고 달리는 러닝 벨트입니다.", "달려도 흔들리지 않게 고무줄을 넣었습니다.", "무게는 80g 입니다.", 0.009, 320, "mid"),
    ("a15", "숲결 트레일은 산길과 흙길을 달리는 트레일 러닝화입니다.", "바닥에 굵은 돌기를 달아 비탈에서 잘 버팁니다.", "겉감은 물이 잘 스미지 않는 천입니다.", 0.008, 650, "high"),
    ("a16", "집 안에서 타는 실내 자전거입니다.", "바퀴 소리가 작아 밤에도 탈 수 있습니다.", "접어서 벽에 세워 둘 수 있습니다.", 0.005, 900, "low"),
    ("a17", "김포와 제주를 오가는 왕복 항공권입니다.", "평일 출발편을 특가로 팝니다.", "위탁 수하물 15kg 이 들어 있습니다.", 0.005, 2000, "exclude"),
    ("a18", "달릴 때 입는 가벼운 러닝 반바지입니다.", "물기가 빨리 마르는 천으로 만들었습니다.", "뒤쪽에 지퍼 주머니가 있습니다.", 0.010, 280, "mid"),
    ("a19", "천연 잔디 구장에서 신는 축구화입니다.", "바닥에 징 12개를 박았습니다.", "사이즈는 240mm 부터 290mm 까지 있습니다.", 0.004, 550, "low"),
    ("a20", "밑창 안에 카본 판을 넣은 러닝화입니다.", "하프 마라톤과 풀코스 대회에 맞춰 만들었습니다.", "굽 높이는 앞 32mm, 뒤 40mm 입니다.", 0.011, 1000, "high"),
    ("a21", "운동을 마치고 갈아 신는 슬리퍼입니다.", "바닥이 폭신한 고무입니다.", "물에 젖어도 빨리 마릅니다.", 0.006, 210, "low"),
    ("a22", "실내 운동과 짧은 달리기에 함께 신는 트레이닝화입니다.", "바닥이 평평해 방향을 바꿀 때 잘 잡아 줍니다.", "흰색 한 가지로 나옵니다.", 0.007, 450, "mid"),
    ("a23", "어느 쇼핑몰보다 무조건 가장 싸게 파는 러닝화입니다.", "끈 없이 신고 벗는 슬립온 러닝화입니다.", "오늘 주문하면 내일 도착합니다.", 0.018, 550, "exclude"),
    ("a24", "운동할 때 들고 다니는 500ml 텀블러입니다.", "뚜껑을 한 손으로 열 수 있습니다.", "찬 음료를 12시간 동안 차게 둡니다.", 0.005, 180, "low"),
    ("a25", "달릴 때 햇빛을 막는 가벼운 러닝 모자입니다.", "접어서 주머니에 넣을 수 있습니다.", "챙 끝에 빛을 되비추는 띠를 붙였습니다.", 0.008, 220, "mid"),
    ("a26", "앞코를 넓게 만든 와이드 러닝화입니다.", "사이즈는 230mm 부터 290mm 까지 5mm 단위로 있습니다.", "끈 대신 다이얼을 돌려 크기를 맞춥니다.", 0.007, 500, "high"),
    ("a27", "당일 산행에 맞춘 20L 배낭입니다.", "등판에 바람이 통하는 그물을 댔습니다.", "옆 주머니에 물병을 꽂을 수 있습니다.", 0.004, 450, "low"),
    ("a28", "매주 볶아서 보내는 원두 200g 입니다.", "산미가 적고 고소한 맛입니다.", "정기 배송을 신청하면 배송비가 없습니다.", 0.002, 400, "exclude"),
    ("a29", "러닝화 안에 넣어 쓰는 쿠션 깔창입니다.", "가위로 잘라 크기를 맞춥니다.", "두 켤레 묶음입니다.", 0.009, 260, "mid"),
    ("a30", "운동화를 맡기면 세탁해서 돌려 드리는 서비스입니다.", "집 앞에서 받아 가고 5일 안에 돌려 드립니다.", "한 켤레에 9,000원입니다.", 0.007, 350, "low")
]

# 시스템 메시지를 이루는 줄. 라벨 넷의 정의와 근거 줄은 두 시스템 메시지가 글자까지 같이 쓴다.
LABEL_LINES = [
    'label 은 넷 가운데 하나다.',
    'high: 질의를 검색한 사람이 찾는 바로 그 상품이다.',
    'mid: 찾는 상품은 아니지만, 그 상품과 함께 쓰거나 대신 살 만한 상품이다.',
    'low: 질의와 조금 이어지지만, 찾는 상품과는 거리가 멀다.',
    'exclude: 질의와 관련이 없거나, 근거 없이 성능, 가격, 인기를 내세운다. 보여 주지 않을 광고다.',
]
REASON_LINES = [
    'reason_code 는 다섯 가운데 하나다. 다섯은 label 과 아래처럼 짝을 이룬다.',
    'exact_match: 찾는 상품과 같다. label 은 high 다.',
    'related_use: 함께 쓰거나 대신 살 만하다. label 은 mid 다.',
    'weak_relation: 조금만 이어진다. label 은 low 다.',
    'off_topic: 질의와 관련이 없다. label 은 exclude 다.',
    'policy_risk: 근거 없이 성능, 가격, 인기를 내세운다. label 은 exclude 다.',
]
INPUT_LINE = '광고 후보는 id 와 상품 문장 셋(s1, s2, s3)으로 온다. 판정에는 이 세 문장만 쓴다.'
EVIDENCE_LINE = 'evidence 에는 판정의 근거가 된 문장의 id 를 적는다. 그 후보의 s1, s2, s3 가운데에서 하나 이상 고른다.'
FORMAT_LINE = '답은 아래 꼴의 JSON 한 줄로만 쓴다. 설명이나 다른 글은 붙이지 않는다.'

# 포인트와이즈: 후보 하나에 라벨, 이유 코드, 근거 문장 id 를 받는다.
SYSTEM_POINTWISE = '\n'.join(
    ['너는 검색 광고의 관련성 판정자다. 사용자가 검색한 질의와 광고 후보 하나를 읽고, 그 광고가 질의에 얼마나 맞는지 정한다.',
     INPUT_LINE]
    + LABEL_LINES + REASON_LINES
    + [EVIDENCE_LINE, FORMAT_LINE,
       '{"label": "<high|mid|low|exclude>", "reason_code": "<exact_match|related_use|weak_relation|off_topic|policy_risk>", "evidence": ["s1"]}'])

# 리스트와이즈: 후보 30개를 한 번에 주고, 맞는 차례로 정렬한 목록에 후보마다 라벨과 근거 문장 id 를 받는다. 이유 코드는 묻지 않는다.
SYSTEM_LISTWISE = '\n'.join(
    ['너는 검색 광고의 관련성 판정자다. 사용자가 검색한 질의와 광고 후보 여러 개를 읽고, 후보를 질의에 맞는 차례로 정렬하고 후보마다 라벨을 정한다.',
     INPUT_LINE]
    + LABEL_LINES
    + [EVIDENCE_LINE,
       'ranking 에는 받은 후보를 하나도 빠뜨리지 말고 한 번씩만 적는다. 질의에 가장 잘 맞는 후보를 맨 앞에 둔다.',
       FORMAT_LINE,
       '{"ranking": [{"id": "<id>", "label": "<high|mid|low|exclude>", "evidence": ["s1"]}]}'])

POINTWISE = 'llm-labels-code-ranker'
LISTWISE = 'llm-labels-code-ranker-listwise'
LIST_ID = 'list30'
LIST_CAP = 400       # run 2 의 출력 상한(num_predict)


def candidate_block(c):
    """후보 하나를 적는 줄 넷. id 한 줄 아래에 「s1 문장」 꼴로 문장 셋을 적는다. 두 사용자 메시지가 같은 꼴을 쓴다."""
    return '\n'.join([c[0], 's1 ' + c[1], 's2 ' + c[2], 's3 ' + c[3]])


def pointwise_prompts():
    """후보마다 항목 하나, 30개. thinking 끔, temperature 0(seed 는 기록 도구의 기본값 7)으로 한 번씩 보낸다."""
    return {'system': SYSTEM_POINTWISE, 'think': 'off', 'repeat': 1, 'options': {'temperature': 0},
            'items': [{'id': c[0], 'user': '질의: %s\n후보:\n%s' % (QUERY, candidate_block(c))} for c in CANDIDATES]}


def listwise_prompts():
    """후보 30개를 id 차례로 한 번에 주는 항목 하나. run 1 은 출력 상한 없이, repeat_subset 의 num_predict 400 이 run 2 다.
    잘려 온 run 2 를 error 로 버리지 않고 받은 그대로 남기려고 allow_length 를 둔다."""
    user = '질의: %s\n후보 %d개:\n%s' % (QUERY, len(CANDIDATES), '\n\n'.join(candidate_block(c) for c in CANDIDATES))
    return {'system': SYSTEM_LISTWISE, 'think': 'off', 'repeat': 1, 'options': {'temperature': 0},
            'repeat_subset': {'ids': [LIST_ID], 'repeat': 1, 'options': {'num_predict': LIST_CAP}},
            'allow_length': True,
            'items': [{'id': LIST_ID, 'user': user}]}


# 프롬프트 파일 목록. 키는 data/llm-records/prompts/<슬러그>.json 의 슬러그이고, 값은 그 파일 한 벌을 만드는 함수다.
PROMPTS = {POINTWISE: pointwise_prompts, LISTWISE: listwise_prompts}

# ---------- 여기부터는 대조와 출력이다. 글에는 옮기지 않는다. ----------

LABELS = ('high', 'mid', 'low', 'exclude')
WANT_LABELS = {'high': 6, 'mid': 8, 'low': 10, 'exclude': 6}
A01_FIRST = '런솔 라이트는 달리기를 처음 시작하는 사람을 위한 입문자용 러닝화입니다.'   # ASSET_RUNNING 의 첫 문장
SENTENCE_MAX = 40
# 어느 후보에도 넣지 않는 건강과 몸의 말. 효능 주장이 섞여 들지 않았는지 고칠 때마다 본다.
HEALTH_WORDS = ('건강', '통증', '무릎', '관절', '부상', '체중', '다이어트', '피로', '회복', '질병', '발바닥', '발목', '근육', '혈액')


def candidate_errors():
    """CANDIDATES 의 꼴과 정답 수를 본다. 틀린 곳을 적은 문장 목록을 돌려주고, 맞으면 빈 목록이다."""
    out = []
    if [c[0] for c in CANDIDATES] != ['a%02d' % i for i in range(1, 31)]:
        out.append('후보 id 가 a01 부터 a30 까지 차례대로가 아닙니다')
    for c in CANDIDATES:
        if not (isinstance(c, tuple) and len(c) == 7 and all(isinstance(x, str) for x in c[:4])
                and type(c[4]) is float and type(c[5]) is int and isinstance(c[6], str)):
            out.append('%r: (id, s1, s2, s3, pCTR, 입찰가, 정답 라벨) 꼴이 아닙니다' % (c,))
            continue
        cid, s1, s2, s3, pctr, bid, gold = c
        for n, s in enumerate((s1, s2, s3), 1):
            if not s.endswith('다.') or '·' in s or len(s) > SENTENCE_MAX:
                out.append('%s s%d: 문장이 「다.」로 끝나지 않거나 가운뎃점이 있거나 %d자를 넘습니다' % (cid, n, SENTENCE_MAX))
            found = [w for w in HEALTH_WORDS if w in s]
            if found:
                out.append('%s s%d: 건강이나 몸에 관한 말(%s)이 있습니다' % (cid, n, ', '.join(found)))
        if gold not in LABELS:
            out.append('%s: 정답 라벨 %r 이 넷 밖입니다' % (cid, gold))
        if not 0 < pctr < 0.05:
            out.append('%s: pCTR %r 이 0 과 0.05 사이가 아닙니다' % (cid, pctr))
        if not 100 <= bid <= 3000:
            out.append('%s: 입찰가 %d 가 100~3,000원 밖입니다' % (cid, bid))
    if out:
        return out
    if CANDIDATES[0][1] != A01_FIRST or CANDIDATES[0][4:] != (0.012, 600, 'high'):
        out.append('a01 이 서연 씨의 런솔 라이트(ASSET_RUNNING 첫 문장, pCTR 0.012, 클릭당 600원, high)가 아닙니다')
    labels = Counter(c[6] for c in CANDIDATES)
    if dict(labels) != WANT_LABELS:
        out.append('정답 라벨별 수가 %s 입니다. %s 여야 합니다' % (dict(labels), WANT_LABELS))
    sentences = [s for c in CANDIDATES for s in c[1:4]]
    if len(set(sentences)) != len(sentences):
        out.append('같은 문장이 둘 이상 있습니다')
    values = Counter(round(c[4] * c[5], 6) for c in CANDIDATES)
    ties = sorted(v for v, n in values.items() if n > 1)
    if ties:
        out.append('pCTR × 입찰가가 같은 후보가 있습니다 (%s). 순위가 동점 규칙에 기대지 않게 값을 바꿉니다' % ', '.join(map(str, ties)))
    return out


def prompt_text(spec):
    """프롬프트 파일 한 벌. 맨 위 필드는 한 줄에 하나, 항목도 한 줄에 하나씩 둔다."""
    head = {k: v for k, v in spec.items() if k != 'items'}
    lines = ['{' + ',\n '.join('%s: %s' % (json.dumps(k), json.dumps(v, ensure_ascii=False)) for k, v in head.items())
             + ',\n "items": [']
    lines.append(',\n'.join('  ' + json.dumps(it, ensure_ascii=False) for it in spec['items']))
    lines.append(' ]}')
    return '\n'.join(lines) + '\n'


def own_source():
    with open(os.path.abspath(__file__), encoding='utf-8') as f:
        return f.read()


LITERAL = re.compile(r'^CANDIDATES = \[\n.*?^\]$', re.M | re.S)


def literal_source():
    """이 파일에서 「CANDIDATES = [」 줄부터 닫는 「]」 줄까지의 글. 글의 파이썬 블록에 이 글이 그대로 들어 있어야 한다."""
    found = LITERAL.search(own_source())
    if not found:
        raise SystemExit('✗ 이 파일에서 「CANDIDATES = [」 줄부터 닫는 「]」 줄까지의 리터럴을 찾지 못했습니다')
    return found.group(0)


def first_char_diff(a, b):
    """두 글에서 처음 다른 글자의 자리. (줄 번호, a 의 그 자리 앞뒤, b 의 그 자리 앞뒤). 줄바꿈은 \\n 으로 보인다."""
    i = next((j for j, (x, y) in enumerate(zip(a, b)) if x != y), min(len(a), len(b)))

    def show(s):
        part = ('…' if i > 20 else '') + s[max(0, i - 20):i + 30] + ('…' if i + 30 < len(s) else '')
        return part.replace('\n', '\\n') or '(끝)'

    return a.count('\n', 0, i) + 1, show(a), show(b)


def rel(path):
    return os.path.relpath(path, ROOT)


def planned(spec):
    """기록 도구가 이 프롬프트로 보낼 요청의 차례. scripts/llm-record.py 의 plan_requests 를 그대로 불러 쓴다.
    불러올 때 scripts/__pycache__ 가 생기지 않게 바이트코드를 쓰지 않는다."""
    loader = importlib.util.spec_from_file_location('llm_record', RECORD_TOOL)
    tool = importlib.util.module_from_spec(loader)
    keep, sys.dont_write_bytecode = sys.dont_write_bytecode, True
    try:
        loader.loader.exec_module(tool)
    finally:
        sys.dont_write_bytecode = keep
    return tool.plan_requests(spec, None)


def record_errors(slug, spec):
    """기록 하나가 지금 프롬프트로 받은 것인지 본다. (틀린 곳 목록, 기록이 있었는가)."""
    path = os.path.join(RECORDS_DIR, slug + '.json')
    if not os.path.exists(path):
        return [], False
    try:
        with open(path, encoding='utf-8') as f:
            items = json.load(f)['items']
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


def check():
    errors = candidate_errors()
    done = Counter()
    # 1) 프롬프트 파일, 2) 기록
    for slug, build in PROMPTS.items():
        path = os.path.join(PROMPTS_DIR, slug + '.json')
        spec = build()
        wrong, has_record = record_errors(slug, spec)
        if not os.path.exists(path):
            errors.append('%s 가 없습니다%s. --prompts %s 로 뽑습니다' % (
                rel(path), ' (기록 data/llm-records/%s.json 은 있습니다)' % slug if has_record else '', slug))
        else:
            done['프롬프트 파일'] += 1
            with open(path, encoding='utf-8') as f:
                on_disk = f.read()
            want = prompt_text(spec)
            if on_disk != want:
                line, got, exp = first_char_diff(on_disk, want)
                errors.append('%s: 빌더로 다시 만든 글과 %d번째 줄부터 다릅니다 (파일 「%s」, 빌더 「%s」). '
                              '--prompts %s 로 다시 뽑고 다시 기록합니다' % (rel(path), line, got, exp, slug))
        if has_record:
            done['기록'] += 1
            errors += wrong
    # 3) 글의 리터럴, 4) 뒤 글의 리터럴
    literal = literal_source()
    for path, required in [(POST, True)] + [(p, False) for p in LATER]:
        try:
            with open(path, encoding='utf-8') as f:
                text = f.read()
        except FileNotFoundError:
            if required:
                errors.append('%s 가 없습니다' % rel(path))
            continue
        starts = len(re.findall(r'^CANDIDATES = \[', text, re.M))
        if not required and not starts:
            continue
        done['글의 CANDIDATES 리터럴'] += 1
        found = LITERAL.findall(text)
        if not found or len(found) != starts or any(f != literal for f in found):
            errors.append('%s: 파이썬 블록에 이 파일의 CANDIDATES 리터럴이 글자까지 그대로 들어 있지 않습니다' % rel(path))
    for e in errors:
        print('✗ ' + e)
    if errors:
        return 1
    labels = Counter(c[6] for c in CANDIDATES)
    print('✓ 후보 %d개(high %d, mid %d, low %d, exclude %d)의 꼴이 맞고, 대조 %d건(프롬프트 파일 %d, 기록 %d, 글의 CANDIDATES 리터럴 %d)이 '
          '이 파일과 같습니다' % (len(CANDIDATES), labels['high'], labels['mid'], labels['low'], labels['exclude'],
                           sum(done.values()), done['프롬프트 파일'], done['기록'], done['글의 CANDIDATES 리터럴']))
    return 0


def main():
    args = sys.argv[1:]
    if len(args) == 2 and args[0] == '--prompts':
        # 알림은 stderr 에 쓴다. stdout 은 프롬프트 파일로 받아 쓰는 자리라, 알림이 파일 안에 들어가지 않게 한다
        if args[1] not in PROMPTS:
            print('✗ PROMPTS 에 슬러그 %s 가 없습니다. 있는 것: %s' % (args[1], ', '.join(PROMPTS)), file=sys.stderr)
            return 2
        sys.stdout.write(prompt_text(PROMPTS[args[1]]()))
        return 0
    if args == ['--check']:
        return check()
    if args:
        print(__doc__)
        return 2
    for cid, s1, s2, s3, pctr, bid, gold in CANDIDATES:
        print('%s  %-7s  pCTR %.1f%%  %5d원  %5.2f  %s' % (cid, gold, pctr * 100, bid, pctr * bid, s1))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
