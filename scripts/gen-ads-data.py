#!/usr/bin/env python3
"""LLM 광고 응용 트랙의 글들이 같이 쓰는 가상 회원 2,000명, 키워드 120개, 광고주 자산 텍스트. 글의 파이썬 블록, 프롬프트 파일, 놀이터 데이터가 이 파일의 값을 그대로 가져간다.

  python3 scripts/gen-ads-data.py --json keywords   키워드 120개를 JSON 목록으로 찍는다 (id, text, topic, strategy, daily_searches)
  python3 scripts/gen-ads-data.py --json summary    회원 수, 세그먼트 317, 주제별 키워드 수, 회원 A 와 B 의 문서 낱말 수, 구매자 수를 찍는다
  python3 scripts/gen-ads-data.py --write           놀이터 데이터 js/ads-users-data.js 를 다시 쓴다
  python3 scripts/gen-ads-data.py --prompts <슬러그>  PROMPTS 에 등록한 프롬프트 파일 한 벌을 찍는다. 아래처럼 받아 쓴다
      python3 scripts/gen-ads-data.py --prompts <슬러그> > data/llm-records/prompts/<슬러그>.json
  python3 scripts/gen-ads-data.py --check           키워드와 자산 텍스트의 꼴을 본 뒤 아래 넷을 대조하고 몇 건 대조했는지 찍는다
                                                    1) js/ads-users-data.js 가 지금 생성 결과와 같은가 (파일이 없으면 실패)
                                                    2) posts/ 에서 「KEYWORDS = [」 줄이 있는 글마다 그 리터럴이 이 파일의 것과 글자까지 같은가
                                                    3) PROMPTS 에 등록한 프롬프트 파일이 있으면 그 items 의 id 와 user 가 빌더의 것과 같은가
                                                    4) 생성기를 옮긴 글(ANCHORS 의 함수나 「KEYWORDS = [」 리터럴이 있는 글)의 python 블록이
                                                       SHARED 의 이름을 정의하면 그 정의가 이 파일의 것과 글자까지 같은가
                                                    2) ~ 4) 는 아직 없는 글과 프롬프트 파일, 정의하지 않은 이름을 건너뛴다

회원은 유저 프로파일 피처 편(posts/user-profile-features.md)의 make_members 와 그 도우미, 자연어 오디언스 편의 ages, regions 를
글자 그대로 옮겼다. 그래서 같은 2,000명이고 세그먼트 317 은 229명이다. extend 는 그 뒤에 따로 만든 random.Random(7) 로
검색 기록과 다음 30일 러닝화 구매(가상 정답)를 붙인다. 회원 A 와 B 에게는 정해 둔 행동만 옮기고 검색을 더하지 않는다.
KEYWORDS 리터럴(「KEYWORDS = [」 줄부터 닫는 「]」 줄까지)과 SHARED 의 정의는 글의 파이썬 블록에 글자 그대로 들어간다.
그 가운데 하나를 고치면 글의 블록도 똑같이 고치고, --write 로 데이터 파일을 다시 쓰고, 프롬프트 파일을 다시 뽑아 다시 기록한다.
표준 라이브러리만 쓴다.
"""
import ast
import json
import os
import random
import re
import sys
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'js', 'ads-users-data.js')
POSTS_DIR = os.path.join(ROOT, 'posts')
PROMPTS_DIR = os.path.join(ROOT, 'data', 'llm-records', 'prompts')
N_MEMBERS = 2000

# 행동마다 사건의 경과일을 적는다. 0 은 오늘, 29 는 29일 전이고, 같은 날 두 번이면 두 번 적는다.
KEYS = ['search_running_shoes', 'sports_app_days', 'running_posts', 'sports_goods_buy',
        'travel_posts', 'cafe_posts', 'camping_posts', 'camping_search']
MEMBER_A = {
    'search_running_shoes': [0, 1, 2, 3, 5, 7, 9, 12, 15, 18, 22, 27],
    'sports_app_days': [0, 2, 4, 6, 9, 11, 13, 16],      # 켠 날을 적으니 같은 날이 두 번 없다
    'running_posts': [0, 0, 1, 1, 2, 3, 4, 5, 6],
    'sports_goods_buy': [5],
    'travel_posts': [17, 19, 22, 26],
    'cafe_posts': [1, 10, 20],
    'camping_posts': [],
    'camping_search': [],
}
MEMBER_B = {k: [] for k in KEYS}                         # 캠핑 둘 말고는 30일 동안 한 일이 없다
MEMBER_B['camping_posts'] = [0, 1, 3, 4, 6, 8, 10, 12, 14, 16, 18, 21, 23, 26, 28]
MEMBER_B['camping_search'] = [1, 3, 6, 10, 15, 21]


def counts(m):
    return {k: len(m[k]) for k in KEYS}


SEGMENT_317 = {'running_posts': 3, 'sports_app_days': 5, 'search_running_shoes': 1}   # 셋 중 하나


def in_segment_317(m):
    c = counts(m)
    return any(c[k] >= at_least for k, at_least in SEGMENT_317.items())


def runner_count(n):
    return n * 229 // 2000                               # 러닝 성향 11.45%, 2,000명이면 229명


# 행동마다 (그 행동을 하는 사람 비율, 하는 사람의 30일 평균 횟수). 앞은 러닝 성향, 뒤는 나머지다.
TENDENCY = {
    'search_running_shoes': ((0.17, 11.0), (0.00, 0.0)),
    'sports_app_days':      ((0.26, 9.0), (0.25, 2.5)),
    'running_posts':        ((0.46, 8.0), (0.25, 1.5)),
    'sports_goods_buy':     ((0.30, 1.5), (0.10, 1.2)),
    'travel_posts':         ((0.30, 4.0), (0.30, 4.0)),
    'cafe_posts':           ((0.40, 4.0), (0.40, 4.0)),
    'camping_posts':        ((0.08, 7.0), (0.12, 7.0)),
    'camping_search':       ((0.05, 5.0), (0.08, 5.0)),
}


def make_members(n, seed=7):
    """회원 n 명의 30일 행동. 0번은 회원 A, 1번은 회원 B 다."""
    rng = random.Random(seed)
    n_run = runner_count(n)
    runner = [True] * (n_run - 1) + [False] * (n - n_run - 1)   # A 는 러닝 성향, B 는 나머지
    rng.shuffle(runner)
    members = [dict(MEMBER_A), dict(MEMBER_B)]
    for is_runner in runner:
        while True:     # 러닝 성향은 조건이 하나라도 맞을 때까지, 나머지는 하나도 안 맞을 때까지 다시 뽑는다
            m = {}
            for k in KEYS:
                share, mean = TENDENCY[k][0 if is_runner else 1]
                does = rng.random() < share                     # 이 행동을 하는 사람인가
                days = range(30) if does else []                # 안 하는 사람은 날마다 뽑지 않는다
                m[k] = [d for d in days if rng.random() < mean / 30]
            if in_segment_317(m) == is_runner:
                break
        members.append(m)
    return members


def ages(members, seed=7):
    """회원마다 나이 하나. 표본을 만든 난수와 따로 뽑아 표본 순서를 건드리지 않는다."""
    rng = random.Random(seed + 1)
    out = []
    for m in members:
        age = round(rng.gauss(33, 6) if in_segment_317(m) else rng.gauss(38, 10))
        out.append(min(70, max(18, age)))
    return out


REGIONS = ['seoul', 'gyeonggi', 'incheon', 'busan', 'daegu', 'gwangju', 'daejeon', 'ulsan', 'other']
REGION_WEIGHTS = [18, 26, 6, 6, 5, 3, 3, 2, 31]        # 가상 가중치다. 합이 100 이다


def regions(members, seed=7):
    """회원마다 지역 하나. 나이처럼 표본을 만든 난수와 따로 뽑는다."""
    rng = random.Random(seed + 2)
    return [rng.choices(REGIONS, weights=REGION_WEIGHTS)[0] for _ in members]


# 키워드 120개. (id, 검색어, 주제, 전략, 하루 검색 수) 이고 값은 모두 가상이다.
# 주제는 관심사 라벨 8개와 health(민감 정보라 거를 말), noise(날씨, 뉴스처럼 상업 의도가 없는 말)다.
# 전략은 서연 씨 러닝화 광고를 기준으로 정한 가상 정답이고, 러닝 주제가 아닌 말은 none 이다. 차례는 로그에 쌓인 차례처럼 섞었다.
KEYWORDS = [
    ("k001", "러닝화", "running", "direct", 52000), ("k002", "감성카페", "cafe", "none", 3200), ("k003", "유모차", "parenting", "none", 8600),
    ("k004", "맞춤법검사기", "noise", "none", 12000), ("k005", "게임패드", "game", "none", 3100), ("k006", "조깅화", "running", "direct", 3300),
    ("k007", "버스시간표", "noise", "none", 3500), ("k008", "숙소추천", "travel", "none", 6100), ("k009", "무릎통증", "health", "problem_goal", 9600),
    ("k010", "발목보호대", "running", "problem_goal", 4200), ("k011", "런닝화", "running", "direct", 18000), ("k012", "발목염좌", "health", "problem_goal", 2600),
    ("k013", "러닝반바지", "running", "co_purchase", 2500), ("k014", "택배조회", "noise", "none", 24000), ("k015", "캐리어", "travel", "none", 7800),
    ("k016", "게임모니터", "game", "none", 3600), ("k017", "트레이닝화", "running", "category", 1700), ("k018", "디저트카페", "cafe", "none", 3700),
    ("k019", "트레일러닝화", "running", "category", 4500), ("k020", "런솔", "running", "brand", 3100), ("k021", "버너", "camping", "none", 4600),
    ("k022", "글램핑", "camping", "none", 16000), ("k023", "호텔예약", "travel", "none", 12000), ("k024", "향수", "beauty", "none", 16000),
    ("k025", "원두", "cafe", "none", 6900), ("k026", "텐트", "camping", "none", 22000), ("k027", "콘솔게임", "game", "none", 2000),
    ("k028", "주식계좌", "finance", "none", 4900), ("k029", "런닝슈즈", "running", "direct", 2100), ("k030", "카페추천", "cafe", "none", 8400),
    ("k031", "러닝슈즈", "running", "direct", 6400), ("k032", "아이섀도", "beauty", "none", 3000), ("k033", "핸드드립", "cafe", "none", 2200),
    ("k034", "지도", "noise", "none", 31000), ("k035", "캠핑테이블", "camping", "none", 6200), ("k036", "카본러닝화", "running", "product_line", 3800),
    ("k037", "뉴스", "noise", "none", 48000), ("k038", "마라토너", "running", "persona", 1900), ("k039", "베이커리", "cafe", "none", 4300),
    ("k040", "불면증", "health", "none", 8700), ("k041", "모노웍스러닝화", "running", "brand", 1700), ("k042", "신용카드추천", "finance", "none", 6300),
    ("k043", "공휴일", "noise", "none", 6800), ("k044", "스포츠선글라스", "running", "co_purchase", 2200), ("k045", "초보러너", "running", "persona", 800),
    ("k046", "주말러너", "running", "persona", 400), ("k047", "예금이자", "finance", "none", 3800), ("k048", "런솔러닝화", "running", "brand", 1400),
    ("k049", "청약통장", "finance", "none", 5500), ("k050", "여행자보험", "travel", "none", 4800), ("k051", "캠핑장예약", "camping", "none", 11000),
    ("k052", "네일아트", "beauty", "none", 4600), ("k053", "게이밍마우스", "game", "none", 4400), ("k054", "적금금리", "finance", "none", 7700),
    ("k055", "우편번호", "noise", "none", 4700), ("k056", "토너", "beauty", "none", 6400), ("k057", "패키지여행", "travel", "none", 5600),
    ("k058", "펀드추천", "finance", "none", 1900), ("k059", "10km완주", "running", "problem_goal", 600), ("k060", "러닝모자", "running", "co_purchase", 1800),
    ("k061", "제주여행", "travel", "none", 23000), ("k062", "계산기", "noise", "none", 15000), ("k063", "새벽러닝", "running", "persona", 1300),
    ("k064", "침낭", "camping", "none", 7400), ("k065", "커피머신", "cafe", "none", 5800), ("k066", "아치깔창", "running", "problem_goal", 1600),
    ("k067", "보드게임", "game", "none", 4100), ("k068", "족저근막염", "health", "problem_goal", 5300), ("k069", "번역기", "noise", "none", 19000),
    ("k070", "캠핑랜턴", "camping", "none", 3900), ("k071", "무릎보호대", "running", "problem_goal", 8800), ("k072", "워킹화", "running", "category", 21000),
    ("k073", "스포츠워치", "running", "co_purchase", 7600), ("k074", "가계부앱", "finance", "none", 1600), ("k075", "캠핑의자", "camping", "none", 9000),
    ("k076", "기계식키보드", "game", "none", 5900), ("k077", "쿠션팩트", "beauty", "none", 8100), ("k078", "기저귀", "parenting", "none", 12000),
    ("k079", "러닝양말", "running", "co_purchase", 3600), ("k080", "정강이통증", "health", "problem_goal", 1200), ("k081", "숲결러닝화", "running", "brand", 2300),
    ("k082", "스포츠웨어", "running", "category", 9800), ("k083", "이유식", "parenting", "none", 6600), ("k084", "달리기신발", "running", "direct", 900),
    ("k085", "핸드크림", "beauty", "none", 5700), ("k086", "달력", "noise", "none", 8200), ("k087", "편성표", "noise", "none", 5400),
    ("k088", "게임쿠폰", "game", "none", 2700), ("k089", "젖병", "parenting", "none", 2800), ("k090", "마스크팩", "beauty", "none", 7300),
    ("k091", "지하철노선도", "noise", "none", 7300), ("k092", "립밤", "beauty", "none", 3900), ("k093", "ETF", "finance", "none", 11000),
    ("k094", "마라톤완주", "running", "problem_goal", 1100), ("k095", "스포츠신발", "running", "category", 2400), ("k096", "카시트", "parenting", "none", 5200),
    ("k097", "미세먼지", "noise", "none", 26000), ("k098", "해외여행", "travel", "none", 15000), ("k099", "분유", "parenting", "none", 9300),
    ("k100", "고혈압", "health", "none", 14000), ("k101", "러닝크루", "running", "persona", 5200), ("k102", "입문용러닝화", "running", "product_line", 1900),
    ("k103", "렌터카", "travel", "none", 9100), ("k104", "항공권", "travel", "none", 33000), ("k105", "데일리러닝화", "running", "product_line", 1200),
    ("k106", "마라톤화", "running", "direct", 2700), ("k107", "종아리압박슬리브", "running", "problem_goal", 700), ("k108", "브런치", "cafe", "none", 7100),
    ("k109", "경량러닝화", "running", "product_line", 2600), ("k110", "아기욕조", "parenting", "none", 1300), ("k111", "차박", "camping", "none", 13000),
    ("k112", "운동화", "running", "category", 58000), ("k113", "아기띠", "parenting", "none", 3400), ("k114", "날씨", "noise", "none", 60000),
    ("k115", "와이드러닝화", "running", "product_line", 1500), ("k116", "쿠션러닝화", "running", "product_line", 4100), ("k117", "모바일게임", "game", "none", 13000),
    ("k118", "오사카여행", "travel", "none", 17000), ("k119", "러닝벨트", "running", "co_purchase", 2900), ("k120", "타프", "camping", "none", 5100)
]

# 서연 씨 러닝화의 광고주 자산 텍스트. 문장 넷, 200자 안팎이고 상품 이름과 사실은 모두 가상이다.
ASSET_RUNNING = ('런솔 라이트는 달리기를 처음 시작하는 사람을 위한 입문자용 러닝화입니다. '
                 '밑창 전체에 쿠션 폼을 깔아 착지할 때 발바닥에 오는 충격을 줄였습니다. '
                 '한 짝 무게 240g 으로 가볍고, 발볼이 넓은 사람도 편하게 신도록 앞코를 넉넉하게 만들었습니다. '
                 '사이즈는 230mm 부터 290mm 까지 5mm 단위로 있고, 받은 날부터 30일 안에 한 번 교환할 수 있습니다.')

# 검색 기록을 만드는 표. 키워드는 후보 안에서 하루 검색 수에 비례해 뽑는다.
TEXT = {kid: text for kid, text, topic, strategy, daily in KEYWORDS}
# 캠핑 용품 검색이 뽑는 후보. 캠핑 키워드 10개 가운데 용품 일곱이고, 글램핑, 캠핑장예약, 차박은 뺀다.
CAMPING_GOODS = ['버너', '텐트', '캠핑테이블', '침낭', '캠핑랜턴', '캠핑의자', '타프']


def make_pool():
    """뽑는 후보. 주제마다 (키워드 id, 하루 검색 수) 목록이고, camping_goods 는 캠핑 용품 검색의 후보다.
    k001 의 횟수는 검색어 러닝화 사건 수 그대로라 후보에서 뺀다."""
    pool = {}
    for kid, text, topic, strategy, daily in KEYWORDS:
        if kid != 'k001':
            pool.setdefault(topic, []).append((kid, daily))
    pool['camping_goods'] = [(kid, daily) for kid, daily in pool['camping'] if TEXT[kid] in CAMPING_GOODS]
    return pool


POOL = make_pool()
RUNNING = KEYS[:4]                                       # 러닝 사건. 검색어 러닝화, 운동 앱, 러닝 글, 운동 용품 구매
# 행동 사건 하나에 그 주제의 검색이 한 번 따라올 확률. 앞은 러닝 성향, 뒤는 나머지다.
FOLLOW = {
    'sports_app_days':  ('running', 0.25, 0.10),
    'running_posts':    ('running', 0.25, 0.10),
    'sports_goods_buy': ('running', 0.25, 0.10),
    'travel_posts':     ('travel', 0.50, 0.50),
    'cafe_posts':       ('cafe', 0.50, 0.50),
    'camping_posts':    ('camping', 0.50, 0.50),
}
# 행동 필드가 없는 주제마다 (그 주제를 검색하는 사람 비율, 하는 사람의 30일 평균 검색 수). 앞은 러닝 성향, 뒤는 나머지다.
OTHER_TOPICS = {
    'parenting': ((0.08, 3.0), (0.08, 3.0)),
    'finance':   ((0.12, 3.0), (0.12, 3.0)),
    'game':      ((0.10, 4.0), (0.10, 4.0)),
    'beauty':    ((0.12, 3.0), (0.12, 3.0)),
    'health':    ((0.12, 2.0), (0.05, 2.0)),
    'noise':     ((1.00, 6.0), (1.00, 6.0)),           # 모두가 한 달에 몇 번씩 찾는다
}


def buy_chance(m):
    """다음 30일에 러닝화를 살 확률(가상 정답). 러닝 성향이면 최근 7일의 러닝 사건 하나마다 0.05 씩 올라
    0.8 에서 멈추고, 나머지는 0.01 이다."""
    if not in_segment_317(m):
        return 0.01
    recent = sum(d < 7 for k in RUNNING for d in m[k])
    return min(0.8, 0.05 + 0.05 * recent)


def extend(members, seed=7):
    """회원마다 searches(키워드 id → 30일 검색 횟수)와 buys_next_30d(다음 30일 러닝화 구매, 0 이나 1)를 붙인 새 목록.
    표본을 만든 난수와 따로 뽑는다. 0번 회원 A 와 1번 회원 B 는 정해 둔 행동만 옮기고 검색을 더하지 않는다."""
    rng = random.Random(seed)

    def pick(topic):
        ids, daily = zip(*POOL[topic])
        return rng.choices(ids, weights=daily)[0]

    out = []
    for i, m in enumerate(members):
        runner = in_segment_317(m)
        found = Counter({'k001': len(m['search_running_shoes'])})    # 검색어 러닝화의 사건 수가 k001 의 횟수다
        for _ in m['camping_search']:                                # 캠핑 용품 검색의 사건은 용품 일곱에 나눈다
            found[pick('camping_goods')] += 1
        if i >= 2:
            for k, (topic, p_runner, p_other) in FOLLOW.items():
                for _ in m[k]:
                    if rng.random() < (p_runner if runner else p_other):
                        found[pick(topic)] += 1
            for topic, pair in OTHER_TOPICS.items():
                share, mean = pair[0 if runner else 1]
                if rng.random() < share:                             # 이 주제를 검색하는 사람인가
                    for _ in range(30):                              # 30일 동안 날마다 검색할지 뽑는다
                        if rng.random() < mean / 30:
                            found[pick(topic)] += 1
        searches = {kid: found[kid] for kid in TEXT if found[kid]}
        out.append(dict(m, searches=searches, buys_next_30d=int(rng.random() < buy_chance(m))))
    return out


# 행동 필드마다 문서에 쓰는 낱말 하나. 검색어 러닝화와 캠핑 용품 검색은 searches 에 검색어로 들어 있어 낱말을 따로 두지 않는다.
WORDS = {'sports_app_days': '운동앱', 'running_posts': '러닝글', 'sports_goods_buy': '운동용품구매',
         'travel_posts': '여행글', 'cafe_posts': '카페글', 'camping_posts': '캠핑글'}


def user_doc(m):
    """회원 한 명을 글 한 편으로 쓴다. 검색어는 그 문자열을, 행동은 낱말 하나를 횟수만큼 공백으로 잇는다."""
    words = [TEXT[kid] for kid, n in m['searches'].items() for _ in range(n)]
    words += [WORDS[k] for k in WORDS for _ in m[k]]
    return ' '.join(words)


# ---------- 여기부터는 대조와 출력이다. 글에는 옮기지 않는다. ----------

TOPICS = ['running', 'camping', 'travel', 'cafe', 'parenting', 'finance', 'game', 'beauty', 'health', 'noise']
STRATEGIES = ['direct', 'category', 'co_purchase', 'problem_goal', 'persona', 'brand', 'product_line']
TOPIC_COUNTS = {'running': 40, 'health': 6, 'noise': 14}  # 나머지 일곱 주제는 합이 60 이다
ASSET_MUST = ('쿠션 폼', '무게 240g', '입문자용')
SENTENCE_MAX = 80
DATA_HEAD = ('// 가상 회원 2,000명과 키워드 120개입니다. scripts/gen-ads-data.py --write 가 쓰고, 손으로 고치지 않습니다.\n'
             '// keywords 는 [id, 검색어, 주제, 하루 검색 수, 전략] 이고, members 는 [세그먼트 317 여부, 다음 30일 구매, '
             '[[키워드 번호, 30일 검색 수], ...], fields 차례의 행동 횟수 8개] 입니다.\n'
             '// 키워드 번호는 keywords 를 0부터 센 차례입니다. words 는 fields 마다 문서에 쓰는 낱말이고, null 은 검색어로 들어간 필드입니다.\n')

# 프롬프트 파일 목록. 키는 data/llm-records/prompts/<슬러그>.json 의 슬러그이고, 값은 그 파일 한 벌을 만드는 함수다.
# 함수는 인자 없이 {"system": ..., "think": ..., "repeat": ..., "items": [{"id": ..., "user": ...}, ...]} 를 돌려준다.
# 만들 항목이 없으면 None 을 돌려주고, 그때는 파일도 없어야 한다. 키워드 확장 편과 관심사 사전 편이 자기 빌더를 여기에 더한다.
PROMPTS = {}

# 키워드 확장 편(posts/keyword-expansion-strategies.md)의 프롬프트 두 벌. 시스템 메시지는 전략 일곱의 정의를 같은 줄로 적고,
# 한 번에 일곱을 맡기는 벌(-all)과 전략마다 따로 부르는 벌(-each)은 할 일을 적은 줄만 다르다.
# 사용자 메시지는 자산 텍스트와 키워드 120개를 「k001 러닝화」 꼴로 한 줄씩 적은 목록이다. -each 는 맨 끝에 「전략: <이름>」 줄을 더한다.
# 키워드의 주제, 전략 정답, 하루 검색 수는 보내지 않는다. 고른 id 로 코드가 센다.
KE_STRATEGY_LINES = [
    'direct: 광고하는 상품을 바로 가리키는 검색어다. 표기만 다르거나 뜻이 같은 말도 여기에 든다.',
    'category: 상품이 속한 더 넓은 상품군이나, 같은 매장에서 함께 파는 옆 상품군의 검색어다.',
    'co_purchase: 이 상품을 사는 사람이 함께 사는 다른 상품의 검색어다.',
    'problem_goal: 사는 사람이 풀려는 문제나 이루려는 목표를 담은 검색어다.',
    'persona: 사는 사람이 어떤 사람인지를 가리키는 검색어다. 경력, 습관, 모임을 나타내는 말도 여기에 든다.',
    'brand: 광고주의 브랜드와, 같은 상품군에서 경쟁하는 다른 브랜드의 검색어다.',
    'product_line: 같은 상품군을 기능, 용도, 소재, 모양으로 나눈 세부 제품의 검색어다.',
]
KE_FORMAT = '{"picks": [{"strategy": "<전략>", "ids": ["<id>", "<id>"], "reason": "<영어 짧은 구>"}]}'
KE_SYSTEM_ALL = '\n'.join(
    ['너는 검색 광고의 키워드 플래너다. 광고주의 상품 설명과 키워드 사전을 읽고, 전략 일곱마다 그 전략에 맞는 키워드를 사전에서 고른다.',
     '키워드는 사전에 있는 것만 고르고 사전의 id 로 적는다. 사전에 없는 키워드를 새로 만들지 않는다.',
     '전략은 아래 일곱이다.']
    + KE_STRATEGY_LINES
    + ['한 전략에 맞는 키워드가 사전에 없으면 ids 를 빈 목록으로 둔다. 한 키워드가 두 전략에 다 맞으면 두 전략에 모두 넣어도 된다.',
       'reason 에는 그 전략으로 고른 까닭을 영어 6낱말 이하의 짧은 구로 적는다.',
       '답은 아래 꼴의 JSON 한 줄로만 쓴다. picks 에는 전략 일곱을 위 차례대로 하나씩 모두 적는다. 설명이나 다른 글은 붙이지 않는다.',
       KE_FORMAT])
KE_SYSTEM_EACH = '\n'.join(
    ['너는 검색 광고의 키워드 플래너다. 광고주의 상품 설명과 키워드 사전을 읽고, 사용자 메시지 끝의 「전략:」 줄에 적은 전략 하나에 맞는 키워드를 사전에서 고른다.',
     '키워드는 사전에 있는 것만 고르고 사전의 id 로 적는다. 사전에 없는 키워드를 새로 만들지 않는다.',
     '전략은 아래 일곱이다. 이번에 고르는 것은 「전략:」 줄의 전략 하나뿐이다.']
    + KE_STRATEGY_LINES
    + ['그 전략에 맞는 키워드가 사전에 없으면 ids 를 빈 목록으로 둔다. 다른 전략에도 맞는 키워드라도 이 전략에 맞으면 넣어도 된다.',
       'reason 에는 그 전략으로 고른 까닭을 영어 6낱말 이하의 짧은 구로 적는다.',
       '답은 아래 꼴의 JSON 한 줄로만 쓴다. picks 에는 「전략:」 줄의 전략 하나만 적는다. 설명이나 다른 글은 붙이지 않는다.',
       KE_FORMAT])


def keyword_user(strategy=None):
    """키워드 확장 편의 사용자 메시지. strategy 를 주면 맨 끝에 「전략: <이름>」 줄을 더한다."""
    lines = ['상품 설명:', ASSET_RUNNING, '', '키워드 사전, %d개:' % len(KEYWORDS)]
    lines += ['%s %s' % (kid, text) for kid, text, topic, gold, daily in KEYWORDS]
    if strategy:
        lines += ['', '전략: ' + strategy]
    return '\n'.join(lines)


def keyword_prompts_all():
    """전략 일곱을 한 번에 맡기는 항목 하나. thinking 을 끈 것과 켠 것을 둘 다 보낸다."""
    return {'system': KE_SYSTEM_ALL, 'think': 'both', 'repeat': 1, 'items': [{'id': 'all', 'user': keyword_user()}]}


def keyword_prompts_each():
    """전략마다 따로 부르는 항목 일곱. 항목 id 는 전략 이름이고, thinking 을 끈 것과 켠 것을 둘 다 보낸다."""
    return {'system': KE_SYSTEM_EACH, 'think': 'both', 'repeat': 1,
            'items': [{'id': s, 'user': keyword_user(s)} for s in STRATEGIES]}


PROMPTS['keyword-expansion-strategies-all'] = keyword_prompts_all
PROMPTS['keyword-expansion-strategies-each'] = keyword_prompts_each

# 글에 옮기는 이름. 회원, 나이와 지역, 키워드, 검색 기록, 문서를 다시 만드는 맨 위 함수와 상수다.
# 생성기를 옮긴 글의 python 블록이 이 이름을 정의하면, 그 정의의 줄 전체(끝 줄의 주석까지)가 이 파일의 것과 같아야 한다.
SHARED = ['KEYS', 'MEMBER_A', 'MEMBER_B', 'counts', 'SEGMENT_317', 'in_segment_317', 'runner_count', 'TENDENCY',
          'make_members', 'ages', 'REGIONS', 'REGION_WEIGHTS', 'regions',
          'KEYWORDS', 'TEXT', 'CAMPING_GOODS', 'make_pool', 'POOL', 'RUNNING', 'FOLLOW', 'OTHER_TOPICS',
          'buy_chance', 'extend', 'WORDS', 'user_doc']
# 생성기를 옮긴 글의 표시. 이 함수 가운데 하나를 정의했거나 「KEYWORDS = [」 리터럴이 있는 글만 SHARED 를 대조한다.
# counts, WORDS, KEYWORDS 같은 이름은 광고 서빙 흐름, 해시와 정렬, 컨텍스추얼 타겟팅, 관심사 분류 편이 다른 뜻으로 쓴다.
ANCHORS = ['make_members', 'make_pool', 'extend', 'buy_chance', 'user_doc']
FENCE = re.compile(r'^```([^\n`]*)\n(.*?)^```[ \t]*$', re.M | re.S)    # scripts/check-code-blocks.js 의 FENCE 와 같은 꼴


def corpus():
    """회원 2,000명에 검색 기록과 구매를 붙인 목록."""
    return extend(make_members(N_MEMBERS))


def keyword_errors():
    """KEYWORDS 의 꼴을 본다. 틀린 곳을 적은 문장 목록을 돌려주고, 맞으면 빈 목록이다."""
    out = []
    if [k[0] for k in KEYWORDS] != ['k%03d' % i for i in range(1, 121)]:
        out.append('키워드 id 가 k001 부터 k120 까지 차례대로가 아닙니다')
    if KEYWORDS and tuple(KEYWORDS[0]) != ('k001', '러닝화', 'running', 'direct', 52000):
        out.append('k001 이 ("k001", "러닝화", "running", "direct", 52000) 이 아닙니다')
    for k in KEYWORDS:
        if not (isinstance(k, tuple) and len(k) == 5 and all(isinstance(x, str) for x in k[:4])
                and type(k[4]) is int):
            out.append('%r: (id, 검색어, 주제, 전략, 하루 검색 수) 꼴이 아닙니다' % (k,))
            continue
        kid, text, topic, strategy, daily = k
        if not text or re.search(r'\s|\u00b7', text):
            out.append('%s: 검색어가 비었거나 공백이나 가운뎃점이 있습니다' % kid)
        if topic not in TOPICS:
            out.append('%s: 주제 %s 가 목록에 없습니다' % (kid, topic))
        if topic == 'running' and strategy not in STRATEGIES:
            out.append('%s: 러닝 키워드의 전략이 일곱 가운데 하나가 아닙니다 (%s)' % (kid, strategy))
        if topic == 'health' and strategy not in ('problem_goal', 'none'):
            out.append('%s: health 키워드의 전략은 problem_goal 이나 none 입니다 (%s)' % (kid, strategy))
        if topic not in ('running', 'health') and strategy != 'none':
            out.append('%s: 러닝 주제가 아닌 키워드의 전략은 none 입니다 (%s)' % (kid, strategy))
        if not 300 <= daily <= 60000:
            out.append('%s: 하루 검색 수 %d 가 300~60,000 밖입니다' % (kid, daily))
    if out:
        return out
    if len({k[1] for k in KEYWORDS}) != len(KEYWORDS):
        out.append('같은 검색어가 둘 이상 있습니다')
    topics = Counter(k[2] for k in KEYWORDS)
    for topic, n in TOPIC_COUNTS.items():
        if topics[topic] != n:
            out.append('%s 키워드가 %d개입니다. %d개여야 합니다' % (topic, topics[topic], n))
    rest = [t for t in TOPICS if t not in TOPIC_COUNTS]
    if sum(topics[t] for t in rest) != 60 or not all(topics[t] for t in rest):
        out.append('관심사 일곱 주제(%s)의 합이 60 이 아니거나 빈 주제가 있습니다' % ', '.join(rest))
    plan = Counter(k[3] for k in KEYWORDS if k[2] == 'running')
    for s in STRATEGIES:
        if not 4 <= plan[s] <= 8:
            out.append('러닝 키워드의 %s 전략이 %d개입니다. 4~8개여야 합니다' % (s, plan[s]))
    if not any(k[2] == 'health' and k[3] == 'problem_goal' for k in KEYWORDS):
        out.append('problem_goal 에 health 키워드(증상)가 없습니다')
    camping = {k[1] for k in KEYWORDS if k[2] == 'camping'}
    stray = [w for w in CAMPING_GOODS if w not in camping]
    if stray:
        out.append('CAMPING_GOODS 에 캠핑 키워드가 아닌 말이 있습니다: %s' % ', '.join(stray))
    return out


def asset_errors():
    """ASSET_RUNNING 의 꼴을 본다. 문장 넷, 200자 안팎, 꼭 들어갈 말 셋, 문장마다 80자 이하."""
    out = ['자산 텍스트에 「%s」가 없습니다' % w for w in ASSET_MUST if w not in ASSET_RUNNING]
    sentences = re.split(r'(?<=\.) ', ASSET_RUNNING)
    if len(sentences) != 4 or not all(s.endswith('.') for s in sentences):
        out.append('자산 텍스트가 마침표로 끝나는 문장 넷이 아닙니다 (%d문장)' % len(sentences))
    if not 180 <= len(ASSET_RUNNING) <= 220:
        out.append('자산 텍스트가 %d자입니다. 200자 안팎(180~220자)이어야 합니다' % len(ASSET_RUNNING))
    out += ['자산 텍스트의 문장이 %d자입니다. %d자 이하로 씁니다' % (len(s), SENTENCE_MAX)
            for s in sentences if len(s) > SENTENCE_MAX]
    return out


def keywords_json():
    rows = [dict(zip(('id', 'text', 'topic', 'strategy', 'daily_searches'), k)) for k in KEYWORDS]
    return '[\n' + ',\n'.join(' ' + json.dumps(r, ensure_ascii=False) for r in rows) + '\n]'


def summary(members):
    """--json summary 의 값. 회원 A 와 B 의 문서는 낱말마다 횟수다."""
    seg = [m for m in members if in_segment_317(m)]
    topic_of = {k[0]: k[2] for k in KEYWORDS}
    searchers = Counter(t for m in members for t in {topic_of[kid] for kid in m['searches']})
    topics = Counter(k[2] for k in KEYWORDS)
    running = Counter(k[3] for k in KEYWORDS if k[2] == 'running')
    health = Counter(k[3] for k in KEYWORDS if k[2] == 'health')
    return {'members': len(members),
            'segment_317': len(seg),
            'keywords': len(KEYWORDS),
            'keywords_by_topic': {t: topics[t] for t in TOPICS},
            'running_by_strategy': {s: running[s] for s in STRATEGIES},
            'health_by_strategy': dict(health),
            'member_a_doc': dict(Counter(user_doc(members[0]).split())),
            'member_b_doc': dict(Counter(user_doc(members[1]).split())),
            'searchers_by_topic': {t: searchers[t] for t in TOPICS},
            'buyers_next_30d': sum(m['buys_next_30d'] for m in members),
            'buyers_in_segment_317': sum(m['buys_next_30d'] for m in seg)}


def lines_json(obj):
    """맨 위 키마다 한 줄씩 쓰는 JSON. 값은 한 줄로 붙인다."""
    return '{' + ',\n '.join('%s: %s' % (json.dumps(k), json.dumps(v, ensure_ascii=False)) for k, v in obj.items()) + '}'


def data_text(members):
    """js/ads-users-data.js 의 글 전체. 주석 세 줄 아래 window.ADS_USERS = {...}; 한 줄이다."""
    number = {k[0]: i for i, k in enumerate(KEYWORDS)}
    data = {'fields': KEYS,
            'words': [WORDS.get(k) for k in KEYS],
            'keywords': [[kid, text, topic, daily, strategy] for kid, text, topic, strategy, daily in KEYWORDS],
            'members': [[int(in_segment_317(m)), m['buys_next_30d'],
                         [[number[kid], n] for kid, n in m['searches'].items()],
                         [len(m[k]) for k in KEYS]] for m in members]}
    return DATA_HEAD + 'window.ADS_USERS = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n'


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


def literal_source():
    """이 파일에서 「KEYWORDS = [」 줄부터 닫는 「]」 줄까지의 글."""
    found = re.search(r'^KEYWORDS = \[\n.*?^\]$', own_source(), re.M | re.S)
    if not found:
        raise SystemExit('✗ 이 파일에서 「KEYWORDS = [」 줄부터 닫는 「]」 줄까지의 리터럴을 찾지 못했습니다')
    return found.group(0)


def definitions(src):
    """맨 위 수준에서 정의한 이름마다 그 정의의 글. 문장의 줄 전체(끝 줄의 주석까지)이고, 한 이름을 여러 문장이 정의하면
    (MEMBER_B 와 그 아래 두 줄처럼) 나온 차례로 잇는다. 파이썬으로 읽지 못하면 SyntaxError 가 난다."""
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


def shared_errors(name, text, mine):
    """글 하나의 python 블록에서 SHARED 이름의 정의를 이 파일의 것과 대조한다. (틀린 곳 목록, 대조한 정의 수).
    생성기를 옮긴 글이 아니면 ([], 0) 이다."""
    blocks = []
    for i, m in enumerate((m for m in FENCE.finditer(text) if m.group(1).strip() == 'python'), 1):
        try:
            blocks.append((i, m.group(2), definitions(m.group(2))))
        except SyntaxError:
            blocks.append((i, m.group(2), None))
    if not (re.search(r'^KEYWORDS = \[', text, re.M) or any(defs and set(defs) & set(ANCHORS) for _, _, defs in blocks)):
        return [], 0
    out, done = [], 0
    names = '|'.join(SHARED)
    for i, code, defs in blocks:
        if defs is None:                                     # 읽지 못한 블록은 정의처럼 보이는 줄이 있으면 실패로 둔다
            if re.search(r'^\s*(?:def (?:%s)\(|(?:%s) = )' % (names, names), code, re.M):
                out.append('posts/%s: 파이썬 %d번째 블록을 파이썬으로 읽지 못해 생성기 이름의 정의를 대조하지 못했습니다' % (name, i))
            continue
        for key in SHARED:
            if key not in defs:
                continue
            done += 1
            if defs[key] != mine[key]:
                line, got, want = first_diff(defs[key], mine[key])
                out.append('posts/%s: 파이썬 %d번째 블록의 %s 정의가 생성기의 것과 다릅니다 (%d번째 줄, 글 「%s」, 생성기 「%s」). '
                           '생성기의 정의를 글자 그대로 옮기고, 다른 뜻이면 이름을 바꿉니다' % (name, i, key, line, got, want))
    return out, done


def rel(path):
    return os.path.relpath(path, ROOT)


def check():
    errors = keyword_errors() + asset_errors()
    members = corpus()
    done = Counter()
    # 1) 놀이터 데이터 파일
    try:
        with open(DATA, encoding='utf-8') as f:
            on_disk = f.read()
    except FileNotFoundError:
        errors.append('%s 가 없습니다. python3 scripts/gen-ads-data.py --write 로 씁니다' % rel(DATA))
    else:
        done['데이터 파일'] += 1
        if on_disk != data_text(members):
            errors.append('%s 가 지금 생성 결과와 다릅니다. python3 scripts/gen-ads-data.py --write 로 다시 씁니다' % rel(DATA))
    # 2) KEYWORDS 리터럴을 가진 글, 4) 생성기를 옮긴 글의 SHARED 정의
    literal = literal_source()
    mine = definitions(own_source())
    missing = [n for n in SHARED if n not in mine]
    if missing:
        errors.append('SHARED 의 이름이 이 파일에 정의돼 있지 않습니다: %s' % ', '.join(missing))
    for name in sorted(os.listdir(POSTS_DIR)):
        if not name.endswith('.md'):
            continue
        with open(os.path.join(POSTS_DIR, name), encoding='utf-8') as f:
            text = f.read()
        starts = len(re.findall(r'^KEYWORDS = \[', text, re.M))
        if starts:
            done['KEYWORDS 리터럴'] += 1
            found = re.findall(r'^KEYWORDS = \[\n.*?^\]$', text, re.M | re.S)
            if len(found) != starts or any(f != literal for f in found):
                errors.append('posts/%s: KEYWORDS 리터럴이 이 파일의 것과 글자까지 같지 않습니다' % name)
        if not missing:
            wrong, compared = shared_errors(name, text, mine)
            errors += wrong
            done['공용 정의'] += compared
            done['공용 정의를 옮긴 글'] += 1 if compared else 0
    # 3) 등록한 프롬프트 파일
    for slug, build in PROMPTS.items():
        path = os.path.join(PROMPTS_DIR, slug + '.json')
        if not os.path.exists(path):
            continue
        done['프롬프트 파일'] += 1
        spec = build()
        try:
            with open(path, encoding='utf-8') as f:
                items = json.load(f).get('items')
        except (ValueError, AttributeError) as e:
            errors.append('%s 를 읽지 못했습니다 (%s)' % (rel(path), e))
            continue
        if spec is None:
            errors.append('%s: 빌더가 만들 항목이 없다고 하는데 파일이 있습니다' % rel(path))
            continue
        got = [(it.get('id'), it.get('user')) if isinstance(it, dict) else it for it in items or []]
        if got != [(it['id'], it['user']) for it in spec['items']]:
            errors.append('%s: items 의 id 와 user 가 지금 생성 결과와 다릅니다. --prompts %s 로 다시 뽑고 다시 기록합니다'
                          % (rel(path), slug))
    for e in errors:
        print('✗ ' + e)
    if errors:
        return 1
    total = done['데이터 파일'] + done['KEYWORDS 리터럴'] + done['공용 정의'] + done['프롬프트 파일']
    print('✓ 대조 %d건(데이터 파일 %d, 글의 KEYWORDS 리터럴 %d, 글 %d편의 공용 정의 %d, 프롬프트 파일 %d)이 지금 생성 결과와 같습니다. '
          '키워드 %d개와 자산 텍스트 %d자의 꼴도 맞습니다'
          % (total, done['데이터 파일'], done['KEYWORDS 리터럴'], done['공용 정의를 옮긴 글'], done['공용 정의'],
             done['프롬프트 파일'], len(KEYWORDS), len(ASSET_RUNNING)))
    return 0


def main():
    args = sys.argv[1:]
    if args == ['--json', 'keywords']:
        print(keywords_json())
        return 0
    if args == ['--json', 'summary']:
        print(lines_json(summary(corpus())))
        return 0
    if args == ['--write']:
        text = data_text(corpus())
        with open(DATA, 'w', encoding='utf-8') as f:
            f.write(text)
        print('✓ %s 에 회원 %d명, 키워드 %d개를 썼습니다 (%d바이트)' % (rel(DATA), N_MEMBERS, len(KEYWORDS), len(text.encode('utf-8'))))
        return 0
    if len(args) == 2 and args[0] == '--prompts':
        if args[1] not in PROMPTS:
            print('✗ PROMPTS 에 슬러그 %s 가 없습니다. 있는 것: %s' % (args[1], ', '.join(PROMPTS) or '없음'))
            return 2
        spec = PROMPTS[args[1]]()
        if spec is None:
            print('✗ %s 는 만들 항목이 없습니다. 프롬프트 파일을 만들지 않습니다' % args[1])
            return 1
        sys.stdout.write(prompt_text(spec))
        return 0
    if args == ['--check']:
        return check()
    print(__doc__)
    return 0 if not args else 2


if __name__ == '__main__':
    raise SystemExit(main())
