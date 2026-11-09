모델 팀 34주째 월요일, 지훈 씨는 광고 점수를 매기는 모델의 입력 목록을 열었습니다. 광고가 무엇인지, 러닝 번호 317 이 붙었는지, 30일 동안 얼마나 움직였는지가 적혀 있었습니다. 5주 전에 회원마다 써 둔 30일 기록의 글은 목록에 없었습니다.

선배는 그 글을 숫자 64개로 바꿔 새벽마다 한 번에 만들어 두자고 했습니다. 모델은 광고를 보일 때 그 숫자를 읽기만 하면 됩니다. 서연 씨는 광고를 보일 때마다 큰 모델에게 이 사람의 취향을 물으면 안 되느냐고 했습니다.

**회원의 기록을 숫자 64개로 적어 광고 점수에 넣으면 무엇이 나아지고, 왜 그때마다 큰 모델을 부르지 않을까요?**

회원의 기록을 정해 둔 개수의 숫자로 적은 것을 유저 임베딩, 그 숫자를 만드는 모델을 인코더라고 부릅니다. 만든 값을 회원 번호로 꺼내 쓰도록 모아 두는 곳은 피처 스토어입니다. 광고 점수가 조금만 바뀌어도 하루 2억 2,800만 번의 노출에서 누가 어떤 광고를 보는지가 바뀝니다.

> **한 줄 요약:** 회원 2,000명의 30일 문서를 장난감 인코더로 64차원 벡터로 바꿔, 새벽 배치처럼 한 번에 피처 스토어에 넣었습니다. 회원 1,400만 명이면 3.58GB 입니다. 유저 벡터와 광고 벡터의 코사인을 피처 하나로 더했습니다. 시험 회원 400명에서 AUC 는 0.637 에서 0.670 으로, logloss 는 0.0766 에서 0.0756 으로 나아졌습니다. 광고 하나 안에서만 재면 AUC 가 0.555~0.577 에서 0.611~0.649 로 올랐습니다. 가짜 클릭은 실제 로그에는 없는 숨은 관심으로 만들었고, 그 관심을 그대로 아는 경우의 AUC 는 0.738 입니다. 기록에서 LLM 호출 한 번은 thinking 을 끄고도 1,114ms 로, 모델 서버 예산 8ms 의 139배입니다. 노출마다 부르면 하루 토큰 값이 가상 단가로 9,302,400원과 98,496,000원이고, 짧은 호출로 센 하한입니다. GPU 서버 한 대가 1초에 2,300명을 처리한다고 두면, 1,400만 명의 새벽 배치는 1.69시간에 6,425원입니다. 인코더가 크면 이 값은 늘어납니다.

> **골라 읽는 법** — 절이 6개입니다. 절마다 표나 코드나 카드가 있어 그것만 보고 넘어가도 됩니다.
>
> - 랭커가 읽는 피처와 유저 벡터 → 1절
> - 장난감 인코더, 새벽 배치, 피처 스토어 → 2절
> - 코사인 피처를 더한 랭커의 logloss 와 AUC → 3절
> - 요청 때 LLM 을 부르면 드는 시간과 값 → 4절
> - 큰 인코더의 벡터를 작은 인코더가 배우는 일 → 5절
> - 담장 안과 열린 RTB 에서 벡터를 찾는 키 → 6절

이 글의 회원, 행동, 광고, 숨은 관심, 클릭은 설명을 위해 만든 가상 데이터입니다. 회원 2,000명과 문서는 `scripts/gen-ads-data.py` 가 만들고, 첫 블록은 그 코드를 글자 그대로 옮겼습니다. 29주째 [유저를 문서로](post.html?id=users-as-documents) 편과 같은 회원, 같은 문서입니다. 가짜 클릭은 둘째 블록이 `random.Random(7)` 로 만들어서, 블록을 차례로 돌리면 늘 같은 값이 나옵니다. LLM 호출 한 번의 답과 토큰과 시간은 지어낸 값이 아닙니다. 19주째 [LLM 호출 한 번](post.html?id=llm-first-call) 편이 2026-11-04 에 기록했습니다. 이 블로그를 쓰는 맥에서 Ollama 0.40.11 로 qwen3.5:27b 를 띄운 기록입니다. 기록 파일은 `data/llm-records/llm-first-call.json` 이고, 이 글은 새로 기록하지 않았습니다. 카드 속 파랑은 놓여 있는 데이터(문서, 벡터, 피처 스토어), 벽돌색은 지금 오는 것(요청, 코사인, LLM 호출)입니다. 먹색은 모델과 서버, 회색은 만드는 작업(새벽 배치)과 비교할 기준값입니다. 점선 상자는 적어 둔 것(낱말마다 인코더가 정한 버킷)입니다.

---

## 1. 유저 벡터는 랭커의 피처 하나입니다

**광고 랭커는 요청마다 후보 광고에 클릭 확률 pCTR 을 매기고, 그 계산에 피처 여러 개를 읽습니다. 유저 벡터는 그 가운데 하나입니다. 새벽에 미리 만들어 피처 스토어에 둔 값을 요청 때 회원 번호로 읽기만 합니다.**

광고 요청 한 건이 오면 광고 서버는 후보 광고마다 이 회원이 누를 확률을 매깁니다. 이 확률이 pCTR 이고, 점수와 순위의 재료라는 것은 [pCTR](post.html?id=pctr-prediction) 편에서 보았습니다. 이 글은 그 확률을 매기는 모델을 랭커라고 부릅니다. 랭커가 쓸 수 있는 시간은 요청 한 건에 8ms 입니다. [서빙 지연, 처리량과 Grafana](post.html?id=serving-latency-throughput) 편이 응답 전체 12ms 가운데 모델 호출에 준 몫입니다.

랭커가 읽는 피처는 광고 쪽과 사람 쪽에서 옵니다. 광고 쪽에는 그 광고가 무엇인지가 있습니다. 사람 쪽에는 회원이 받은 세그먼트 번호와 지난 30일에 얼마나 움직였는지가 있습니다. 이 글은 이 셋을 기본 피처로 둡니다. 세그먼트 317 은 13주째 [유저 프로파일 피처](post.html?id=user-profile-features) 편에서 본 러닝 세그먼트입니다.

유저 벡터는 회원 한 명을 숫자 64개로 적은 것입니다. 벡터가 무엇인지는 13주째 편에서 보았습니다. 글을 벡터로 바꾸는 임베딩과 두 벡터의 코사인은 23주째 [임베딩과 벡터 검색](post.html?id=embeddings-vector-search) 편에서 보았습니다. 13주째의 벡터는 행동 8종마다 최근 사건을 더 쳐서 더한 값을 사람이 정한 차례로 놓은 8개였습니다. 유저 임베딩은 인코더가 회원의 기록을 읽고 내는 64개이고, 값마다 무엇을 뜻하는지는 사람이 정하지 않습니다.

LLM 유저 임베딩은 그 인코더를 LLM 과 같은 Transformer 로 짜고 회원의 행동 시퀀스로 학습한 것입니다. Transformer 는 [행동 시퀀스 Attention](post.html?id=behavior-sequence-attention) 편 5절의 self-attention 을 여러 층 쌓은 모델입니다. Ning 외(2024)의 User-LLM 은 행동 시퀀스를 라벨 없이 미리 학습한 Transformer 인코더로 유저 임베딩을 만들었습니다. Pancha 외(2022)의 PinnerFormer 는 최근 행동 시퀀스를 읽는 Transformer 입니다. 벡터는 하루 한 번 배치로 만듭니다. 이 글은 그런 인코더 대신 2절에서 장난감 인코더를 짭니다.

벡터가 랭커에 들어가는 길은 둘입니다. 64개를 피처 64개로 그대로 넣을 수도 있고, 광고 쪽 벡터와의 코사인을 피처 하나로 넣을 수도 있습니다. 이 글은 코사인 하나를 더하고, 64개를 다 넣는 것과의 차이는 헷갈리기 쉬운 점에서 봅니다. 아래 표는 이 글의 랭커가 읽는 피처입니다.

| 피처 | 누구의 값 | 언제 만드나 | 요청 때 하는 일 |
|---|---|---|---|
| 광고 (러닝화, 여행사, 카페) | 광고 | 광고가 들어올 때 | 후보 광고와 함께 온다 |
| 세그먼트 317 | 사람 | 새벽 배치 | 회원 프로필에서 읽는다 |
| 30일 활동량 | 사람 | 새벽 배치 | 회원 프로필에서 읽는다 |
| 유저 벡터 64차원 | 사람 | 새벽 배치 | 피처 스토어에서 회원 번호로 읽는다 |
| 유저 벡터와 광고 벡터의 코사인 | 사람과 광고 | 요청 때 | 두 벡터를 곱해 더한다 |

앞의 셋이 기본 피처이고, 3절은 마지막 줄을 더했을 때 달라지는 것을 잽니다. 기본 피처는 사람 쪽 값과 광고 쪽 값이 따로 들어가서, 이 사람이 이 광고를 좋아하는지는 어느 줄에도 없습니다. 코사인은 사람과 광고를 함께 보고 낸 값이라 그 빈자리를 채웁니다. 그 전에 2절은 벡터를 새벽에 만드는 일을 봅니다.

## 2. 벡터는 새벽에 미리 만듭니다

**장난감 인코더로 회원 2,000명의 문서를 한꺼번에 64차원 벡터로 바꿔 피처 스토어에 넣었습니다. 회원 A 의 벡터는 64개 값 가운데 6개만 0 이 아닙니다. 회원 1,400만 명이면 3,584,000,000바이트, 10억 바이트를 1GB 로 세어 3.58GB 입니다.**

문서는 29주째 편의 것을 그대로 씁니다. 회원마다 30일 동안 검색한 말과 「러닝글」 같은 행동 낱말을 횟수만큼 이은 글입니다. 블록의 1~2단계는 그 편처럼 생성기를 글자 그대로 옮겨 회원과 문서를 만듭니다. 그래서 회원 A 의 문서도 그 편과 같은 37낱말입니다.

실제 인코더는 이 문서나 행동 시퀀스를 읽고, 행동이 비슷한 회원에게 비슷한 벡터를 주도록 학습합니다. 이 글의 인코더는 행동 시퀀스로 학습한 작은 LLM 인코더 대신 쓰는 장난감입니다. 낱말마다 해시로 0~63 가운데 번호 하나를 정하고, 벡터의 그 번째 값에 1 을 더한 뒤 길이를 1 로 맞춥니다. 해시가 정한 번호 하나를 버킷이라고 부릅니다. 23주째 편의 장난감 임베딩과 같은 꼴이고, 해시도 그 편처럼 `zlib.crc32` 입니다. 파이썬의 `hash()` 는 프로그램을 띄울 때마다 문자열의 값이 달라져서, 같은 문서가 밤마다 다른 벡터가 됩니다. 그러면 랭커가 학습한 벡터의 뜻도 밤마다 바뀌므로 새벽 배치에는 쓰지 않습니다.

배치는 회원 2,000명을 한 번에 인코딩해 딕셔너리 하나에 넣습니다. 이 딕셔너리가 피처 스토어 흉내이고, 키는 회원 번호, 값은 벡터와 만든 시각입니다. 오픈 소스 피처 스토어 Feast 의 문서도 온라인 스토어에는 키마다 가장 최근의 값만 둔다고 적었습니다. 배치가 만든 값은 materialize 명령으로 올린다고 적었습니다. 랭커는 요청 때 회원 번호로 값을 읽기만 하고 인코더를 부르지 않습니다.

```python
# 하는 일: 회원 2,000명의 문서를 장난감 인코더로 64차원 벡터로 바꾸고, 새벽 배치처럼 한 번에 피처 스토어 딕셔너리에 넣는다.
import math
import random
import zlib
from collections import Counter

# 1단계: 회원 2,000명과 30일 검색 기록을 만든다
# 유저를 문서로 편처럼 scripts/gen-ads-data.py 의 생성기를 글자 그대로 옮긴다. 0번이 회원 A, 1번이 회원 B 다.
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


members = extend(make_members(2000))
print(f'회원 {len(members):,}명, 세그먼트 317 은 {sum(in_segment_317(m) for m in members)}명')

# 2단계: 회원마다 문서 한 편을 쓴다
# 검색어는 그 문자열을, 행동은 낱말 하나를 횟수만큼 공백으로 잇는다. 유저를 문서로 편의 문서와 같다.
# 행동 필드마다 문서에 쓰는 낱말 하나. 검색어 러닝화와 캠핑 용품 검색은 searches 에 검색어로 들어 있어 낱말을 따로 두지 않는다.
WORDS = {'sports_app_days': '운동앱', 'running_posts': '러닝글', 'sports_goods_buy': '운동용품구매',
         'travel_posts': '여행글', 'cafe_posts': '카페글', 'camping_posts': '캠핑글'}


def user_doc(m):
    """회원 한 명을 글 한 편으로 쓴다. 검색어는 그 문자열을, 행동은 낱말 하나를 횟수만큼 공백으로 잇는다."""
    words = [TEXT[kid] for kid, n in m['searches'].items() for _ in range(n)]
    words += [WORDS[k] for k in WORDS for _ in m[k]]
    return ' '.join(words)


docs = [user_doc(m) for m in members]
print(f'문서 {len(docs):,}편, 낱말 종류 {len({w for d in docs for w in d.split()})}개')
for name, number in (('회원 A', 0), ('회원 B', 1)):
    found = Counter(docs[number].split()).most_common()
    print(f'{name} 의 문서 {sum(n for w, n in found)}낱말: ' + ', '.join(f'{w} {n}' for w, n in found))

# 3단계: 장난감 인코더로 문서를 64차원 벡터로 바꾼다
# 행동 시퀀스로 학습한 작은 LLM 인코더 대신 쓰는 장난감이다. 배운 것이 없어서 낱말의 뜻을 모른다.
# 낱말마다 zlib.crc32 로 0~63 가운데 버킷 하나를 정해 벡터의 그 값에 1 을 더하고, 길이(L2 노름)로 나눠 길이를 1 로 맞춘다.
# crc32 는 언제 어디서 돌려도 같은 낱말에 같은 버킷을 준다. 파이썬의 hash() 는 프로그램을 띄울 때마다 문자열의 값이 달라 쓰지 않는다.
DIM = 64


def bucket(word):
    return zlib.crc32(word.encode('utf-8')) % DIM


def encode(doc):
    vec = [0.0] * DIM
    for word in doc.split():
        vec[bucket(word)] += 1.0
    norm = math.sqrt(sum(x * x for x in vec))
    return [x / norm for x in vec] if norm else vec


vocab = sorted({w for d in docs for w in d.split()})
filled = Counter(bucket(w) for w in vocab)
print(f'낱말 {len(vocab)}종이 버킷 {DIM}개 가운데 {len(filled)}개에 떨어졌고, 두 낱말 이상이 든 버킷은 {sum(n >= 2 for n in filled.values())}개다')
for name, number in (('회원 A', 0), ('회원 B', 1)):
    found = Counter(docs[number].split()).most_common()
    print(f'{name} 의 낱말과 버킷: ' + ', '.join(f'{w} {bucket(w)}' for w, n in found))
print(f'러닝화는 {bucket("러닝화")}번 버킷, 런닝화는 {bucket("런닝화")}번 버킷')

# 4단계: 새벽 배치처럼 2,000명을 한 번에 인코딩해 피처 스토어에 넣는다
# 피처 스토어는 딕셔너리로 흉내 낸다. 키는 회원 번호이고, 값은 벡터와 그 벡터를 만든 시각이다.
# 랭커는 요청 때 회원 번호로 이 값을 읽기만 하고, 인코더를 부르지 않는다.
BUILT_AT = '04:30'
feature_store = {number: {'vector': encode(doc), 'built_at': BUILT_AT} for number, doc in enumerate(docs)}
vec_a, vec_b = feature_store[0]['vector'], feature_store[1]['vector']
print(f'피처 스토어: 키 {len(feature_store):,}개, 값마다 {DIM}차원 벡터와 만든 시각 {feature_store[0]["built_at"]}')
nonzero = [(i, x) for i, x in enumerate(vec_a) if x]
print(f'회원 A 의 벡터에서 0 이 아닌 값 {len(nonzero)}개: ' + ', '.join(f'[{i}] {x:.3f}' for i, x in nonzero))
print(f'회원 A 와 B 의 코사인 {sum(x * y for x, y in zip(vec_a, vec_b)):.3f}')

# 5단계: 저장 크기를 센다
# 값 하나를 4바이트(float32)로 저장한다고 둔다. GB 는 10억 바이트로 센다.
BYTES_PER_VALUE = 4
print(f'표본 {len(feature_store):,}명: {len(feature_store) * DIM * BYTES_PER_VALUE:,}바이트')
size = 14_000_000 * DIM * BYTES_PER_VALUE
print(f'회원 1,400만 명: {size:,}바이트, {size / 1e9:.2f}GB')

# 출력:
# 1단계 뜻: 회원 2,000명 가운데 세그먼트 317 은 229명으로, 유저를 문서로 편의 표본과 같다.
# 회원 2,000명, 세그먼트 317 은 229명
# 2단계 뜻: 문서는 2,000편이고 낱말 종류는 126개다. 회원 A 의 문서는 37낱말, 회원 B 의 문서는 21낱말이다.
# 문서 2,000편, 낱말 종류 126개
# 회원 A 의 문서 37낱말: 러닝화 12, 러닝글 9, 운동앱 8, 여행글 4, 카페글 3, 운동용품구매 1
# 회원 B 의 문서 21낱말: 캠핑글 15, 버너 2, 텐트 2, 캠핑테이블 1, 침낭 1
# 3단계 뜻: 낱말 126종이 버킷 64개에 들어가 40개 버킷에서 두 낱말 이상이 섞이고, 뜻이 같은 러닝화와 런닝화는 다른 버킷이다.
# 낱말 126종이 버킷 64개 가운데 56개에 떨어졌고, 두 낱말 이상이 든 버킷은 40개다
# 회원 A 의 낱말과 버킷: 러닝화 25, 러닝글 2, 운동앱 54, 여행글 24, 카페글 44, 운동용품구매 57
# 회원 B 의 낱말과 버킷: 캠핑글 11, 버너 38, 텐트 53, 캠핑테이블 14, 침낭 8
# 러닝화는 25번 버킷, 런닝화는 35번 버킷
# 4단계 뜻: 회원 A 의 벡터는 64개 값 가운데 6개만 0 이 아니고, 같이 쓰는 버킷이 없는 회원 B 와의 코사인은 0 이다.
# 피처 스토어: 키 2,000개, 값마다 64차원 벡터와 만든 시각 04:30
# 회원 A 의 벡터에서 0 이 아닌 값 6개: [2] 0.507, [24] 0.225, [25] 0.676, [44] 0.169, [54] 0.451, [57] 0.056
# 회원 A 와 B 의 코사인 0.000
# 5단계 뜻: 회원 1,400만 명이면 3,584,000,000바이트이고, 10억 바이트를 1GB 로 세어 3.58GB 다.
# 표본 2,000명: 512,000바이트
# 회원 1,400만 명: 3,584,000,000바이트, 3.58GB
```

블록이 만든 회원과 문서는 29주째 편과 같고, 세그먼트 317 도 같은 229명입니다. 회원 A 의 문서는 러닝화 검색에 러닝글, 운동앱, 여행글, 카페글, 운동용품구매가 횟수만큼 이어진 37낱말입니다. 3단계에서 회원 A 의 낱말 여섯은 서로 다른 버킷에 떨어졌습니다. 그래서 벡터의 값 가운데 여섯만 0 이 아니고, 가장 큰 값 0.676 은 가장 많이 나온 러닝화의 버킷입니다.

낱말 126종은 버킷 64개 가운데 56개에 떨어졌고, 그 가운데 40개 버킷에는 두 낱말 이상이 같이 들었습니다. 버킷보다 낱말이 많으니 서로 다른 낱말이 같은 값에 더해지고, 이것을 해시 충돌이라고 부릅니다. 러닝화와 런닝화는 뜻이 같은데 25번과 35번으로 떨어져, 장난감에게 둘은 다른 낱말입니다. 학습한 인코더라면 두 낱말을 검색한 회원들이 비슷하게 움직이는 것을 보고 가까운 벡터를 줍니다.

저장 크기는 값 하나를 4바이트로 두고 셉니다. 회원 1,400만 명이면 3,584,000,000바이트입니다. 10억 바이트를 1GB 로 세면 3.58GB 로, [배치 추론과 실시간 추론](post.html?id=batch-vs-realtime-inference) 편의 유저 벡터 표와 같은 크기입니다. 이 글의 BUILT_AT 은 그 편의 새벽 배치가 돈 시각으로 두었습니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-user-embedding-cards.html?embed=1&card=batch" height="480" loading="lazy" title="회원 2,000명의 문서가 새벽 배치에서 64차원 벡터가 되는 길"></iframe>
<a class="demo-embed-open" href="demo-user-embedding-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-user-embedding-cards.html?embed=1&card=store" height="480" loading="lazy" title="피처 스토어의 키와 값, 회원 A 와 B 의 벡터"></iframe>
<a class="demo-embed-open" href="demo-user-embedding-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 3. 피처 하나를 더한 랭커의 logloss 와 AUC 를 봅니다

**광고 셋에 가짜 클릭 18만 노출을 만들고, 기본 피처 셋의 로지스틱 회귀와 코사인 하나를 더한 회귀를 비교했습니다. 시험 회원 400명에서 AUC 는 0.637 에서 0.670 으로, logloss 는 0.0766 에서 0.0756 으로 나아졌습니다. 광고 하나 안에서만 재도 세 광고 모두 올랐습니다.**

광고는 [후보풀 여덟 질문](post.html?id=candidate-pool-questions) 편이 회원 A 의 요청에서 꺼낸 캠페인 셋입니다. 서연 씨 러닝화, 여행사, 카페이고, 그 편의 pCTR 은 1.2%, 0.8%, 2.0% 였습니다. 광고 문서는 그 주제의 키워드 검색어에 그 주제의 행동 낱말을 이은 글이고, 러닝화 광고는 direct 전략의 키워드를 씁니다. 장난감 인코더는 글자가 같은 낱말만 같은 버킷에 더하므로, 광고 문서도 회원 문서와 같은 낱말로 썼습니다. 학습한 인코더라면 광고 쪽 벡터도 클릭 기록으로 함께 배웁니다.

클릭은 가짜로 만들었습니다. 회원마다 러닝, 여행, 카페에 둔 숨은 관심을 0 과 1 사이로 정합니다. 숨은 관심은 실제 로그에는 없는 값이고, 가짜 클릭을 만들 때만 씁니다. 지난 30일에 그 주제의 사건이 한 번이라도 있으면 0.5 를 받고, 나머지 0.5 는 행동으로 남지 않은 몫이라 난수로 정했습니다. 클릭 확률은 숨은 관심이 0.5 인 회원에게 위의 pCTR 이고, 관심이 클수록 커집니다. 관심이 클 때 오르는 폭이 작을 때 내리는 폭보다 커서, 광고마다 실제 CTR 은 위의 pCTR 보다 조금 높게 나옵니다. 회원마다 세 광고를 다음 30일 동안 하루 한 번씩 본다고 두었습니다.

랭커는 [관심사 분류](post.html?id=interest-classification) 편과 33주째 [LLM 라벨링과 증류](post.html?id=llm-labeling-distillation) 편의 로지스틱 회귀입니다. 기본 피처는 광고, 세그먼트 317, 30일 활동량 셋이고, 활동량은 문서의 낱말 수로 셉니다. 둘째 모델은 여기에 유저 벡터와 광고 벡터의 코사인을 더합니다. 회원 1,600명의 노출로 배우고, 배울 때 보지 않은 회원 400명의 노출로 잽니다. logloss 는 모델의 확률이 실제 클릭과 먼 만큼 커지는 값으로, 33주째 편의 로그 손실과 같은 식이고 작을수록 좋습니다. AUC 는 클릭한 노출과 안 한 노출을 하나씩 뽑았을 때 클릭한 쪽의 점수가 클 확률입니다. 0.5 면 아무렇게나 매긴 순서와 같고, 계산은 [GAUC 와 오프라인 지표](post.html?id=offline-metrics-gauc) 편의 짝 세기와 같습니다.

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 광고 셋의 벡터와 가짜 클릭을 만들고, 기본 피처만 쓴 로지스틱 회귀와 코사인 피처를 더한 회귀의 logloss 와 AUC 를 시험 회원 400명에서 비교한다.

# 1단계: 광고 셋의 문서를 같은 인코더로 벡터로 바꾼다
# 광고는 후보풀 여덟 질문 편의 캠페인 셋이다. 광고 문서는 그 주제의 키워드 검색어에 그 주제의 행동 낱말을 잇고, 러닝화 광고는 direct 전략의 키워드를 쓴다.
# 장난감 인코더는 글자가 같은 낱말만 같은 버킷에 더하므로, 광고 문서도 회원 문서와 같은 낱말로 쓴다.
# 평소 CTR 은 숨은 관심이 0.5 인 회원의 클릭 확률이고, 그 편의 pCTR 1.2%, 0.8%, 2.0% 를 쓴다.
AD_DOCS = {
    '러닝화': [text for kid, text, topic, strategy, daily in KEYWORDS if strategy == 'direct'] + ['운동앱', '러닝글', '운동용품구매'],
    '여행사': [text for kid, text, topic, strategy, daily in KEYWORDS if topic == 'travel'] + ['여행글'],
    '카페': [text for kid, text, topic, strategy, daily in KEYWORDS if topic == 'cafe'] + ['카페글'],
}
AD_CTR = {'러닝화': 0.012, '여행사': 0.008, '카페': 0.020}
AD_TOPIC = {'러닝화': 'running', '여행사': 'travel', '카페': 'cafe'}
ad_vectors = {name: encode(' '.join(words)) for name, words in AD_DOCS.items()}


def cosine(u, v):
    return sum(x * y for x, y in zip(u, v))    # 두 벡터 모두 길이가 1 이라 내적이 곧 코사인이다


for name, words in AD_DOCS.items():
    print(f'{name} 광고: 낱말 {len(words)}개, 평소 CTR {AD_CTR[name]:.1%}, '
          f'코사인 회원 A {cosine(vec_a, ad_vectors[name]):.2f}, 회원 B {cosine(vec_b, ad_vectors[name]):.2f}')
clash = sorted({(bucket(w), w, v) for w in set(docs[1].split()) for v in AD_DOCS['러닝화'] if bucket(w) == bucket(v)})
print('회원 B 의 문서와 러닝화 광고가 같이 쓰는 버킷: ' + ', '.join(f'{i}번 ({w}, {v})' for i, w, v in clash))

# 2단계: 숨은 관심으로 다음 30일의 가짜 클릭을 만든다
# 숨은 관심은 회원마다 러닝, 여행, 카페에 둔 0~1 의 값이다. 실제 로그에는 없는 값이고, 가짜 클릭을 만들 때만 쓴다.
# 지난 30일에 그 주제의 사건이 한 번이라도 있으면 0.5 를 받고, 나머지 0.5 는 행동으로 남지 않은 몫이라 난수로 정한다.
# 클릭 확률의 로그 오즈는 평소 CTR 의 로그 오즈에 3 × (숨은 관심 - 0.5) 를 더한 값이다. 회원마다 광고 셋을 하루 한 번씩 30일 본다.
# 숨은 관심이 0.5 보다 클 때 오르는 폭이 작을 때 내리는 폭보다 커서, 광고마다의 CTR 은 평소 CTR 보다 조금 높게 나온다.
rng = random.Random(7)
EVENT_KEYS = {'running': RUNNING, 'travel': ['travel_posts'], 'cafe': ['cafe_posts']}


def log_odds(p):
    return math.log(p / (1 - p))


def sigmoid(z):
    return 1 / (1 + math.exp(-z))


hidden = [{topic: 0.5 * (sum(len(m[k]) for k in keys) > 0) + 0.5 * rng.random() for topic, keys in EVENT_KEYS.items()}
          for m in members]
DAYS = 30
rows = []    # 회원과 광고 한 쌍마다 (회원 번호, 광고, 노출 수, 클릭 수)
for number in range(len(members)):
    for name in AD_DOCS:
        chance = sigmoid(log_odds(AD_CTR[name]) + 3 * (hidden[number][AD_TOPIC[name]] - 0.5))
        rows.append((number, name, DAYS, sum(rng.random() < chance for _ in range(DAYS))))
print(f'노출 {sum(r[2] for r in rows):,}번, 클릭 {sum(r[3] for r in rows):,}번')
for name in AD_DOCS:
    shown = sum(r[2] for r in rows if r[1] == name)
    clicked = sum(r[3] for r in rows if r[1] == name)
    print(f'  {name} 광고: 노출 {shown:,}번, 클릭 {clicked:,}번, CTR {clicked / shown:.2%}')

# 3단계: 피처를 만들고 회원으로 학습과 시험을 나눈다
# 기본 피처는 광고(여행사인가, 카페인가. 둘 다 0 이면 러닝화), 세그먼트 317, 30일 활동량(문서의 낱말 수) 셋이다.
# 코사인 피처는 피처 스토어에서 읽은 유저 벡터와 광고 벡터의 코사인이다. 회원 0~1,599번이 학습, 1,600~1,999번이 시험이다.
# 같은 회원이 같은 광고를 본 노출 30번은 피처가 같아서, 노출 수와 클릭 수로 묶어 한 줄로 둔다. 노출마다 따로 센 것과 값이 같다.
# 한 줄은 (피처, 노출 수, 클릭 수, 광고, 회원 번호) 다.
NAMES = ['여행사', '카페', '세그먼트 317', '활동량', '코사인']


def features(number, name):
    return [float(name == '여행사'), float(name == '카페'), float(in_segment_317(members[number])),
            float(len(docs[number].split())), cosine(feature_store[number]['vector'], ad_vectors[name])]


train = [(features(n, name), shown, clicked, name, n) for n, name, shown, clicked in rows if n < 1_600]
test = [(features(n, name), shown, clicked, name, n) for n, name, shown, clicked in rows if n >= 1_600]
print(f'학습: 회원 1,600명, 노출 {sum(r[1] for r in train):,}번, 클릭 {sum(r[2] for r in train):,}번')
print(f'시험: 회원 400명, 노출 {sum(r[1] for r in test):,}번, 클릭 {sum(r[2] for r in test):,}번')

# 4단계: 경사 하강 200번으로 두 모델을 배운다
# 피처는 학습의 평균을 빼고 표준편차로 나눈다. 절편은 학습 노출의 CTR 의 로그 오즈에서 시작한다.
# 클릭이 노출의 1.6% 쯤이라 손실의 기울기가 작다. 학습률 1 로 200번이면 손실은 거의 같아도 가중치가 아직 덜 움직인다.
# 글이 가중치를 읽으므로 학습률을 10 으로 둔다. fit 은 학습할 줄과 쓸 피처의 번호를 받고, 6단계에서도 그대로 쓴다.
def fit(part, cols, steps=200, lr=10.0):
    xs = [[r[0][j] for j in cols] for r in part]
    mean = [sum(x[j] for x in xs) / len(xs) for j in range(len(cols))]
    sd = [math.sqrt(sum((x[j] - mean[j]) ** 2 for x in xs) / len(xs)) for j in range(len(cols))]
    zs = [[(v - mu) / s for v, mu, s in zip(x, mean, sd)] for x in xs]
    total = sum(r[1] for r in part)
    w, b, losses = [0.0] * len(cols), log_odds(sum(r[2] for r in part) / total), []
    for _ in range(steps):
        gw, gb, loss = [0.0] * len(cols), 0.0, 0.0
        for z, r in zip(zs, part):
            shown, clicked = r[1], r[2]
            p = sigmoid(b + sum(wj * zj for wj, zj in zip(w, z)))
            loss -= clicked * math.log(p) + (shown - clicked) * math.log(1 - p)
            for j in range(len(cols)):
                gw[j] += (shown * p - clicked) * z[j]
            gb += shown * p - clicked
        losses.append(loss / total)
        w = [wj - lr * g / total for wj, g in zip(w, gw)]
        b -= lr * gb / total
    return {'cols': cols, 'w': w, 'b': b, 'mean': mean, 'sd': sd, 'losses': losses}


def predict(model, x):
    z = [(x[j] - mu) / s for j, mu, s in zip(model['cols'], model['mean'], model['sd'])]
    return sigmoid(model['b'] + sum(wj * zj for wj, zj in zip(model['w'], z)))


models = {'기본 피처 셋': fit(train, [0, 1, 2, 3]), '기본 + 코사인': fit(train, [0, 1, 2, 3, 4])}
for label, model in models.items():
    loss = model['losses']
    print(f'{label}: 학습 logloss 1번째 {loss[0]:.4f}, 50번째 {loss[49]:.4f}, 200번째 {loss[-1]:.4f}')
    print('  가중치: ' + ', '.join(f'{NAMES[j]} {wj:.2f}' for j, wj in zip(model['cols'], model['w'])) + f', 절편 {model["b"]:.2f}')

# 5단계: 시험 회원 400명의 노출에서 logloss 와 AUC 를 잰다
# logloss 는 클릭한 노출의 확률이 작을수록, 안 한 노출의 확률이 클수록 커진다. 작을수록 좋다.
# AUC 는 클릭한 노출과 안 한 노출을 하나씩 뽑았을 때 클릭한 쪽의 점수가 클 확률이다. 점수가 같으면 반으로 센다.
# 비교할 기준 둘: 평균 CTR 하나로 모든 노출을 매긴 것과, 실제 로그에는 없는 숨은 관심으로 센 확률을 그대로 쓴 것이다.
def logloss(scored):
    return -sum(c * math.log(p) + (s - c) * math.log(1 - p) for p, s, c in scored) / sum(s for p, s, c in scored)


def auc(scored):
    scored = sorted(scored)                  # 점수가 낮은 쪽부터
    pos, neg = sum(c for p, s, c in scored), sum(s - c for p, s, c in scored)
    wins, below, i = 0.0, 0, 0
    while i < len(scored):                   # 점수가 같은 줄을 한 묶음으로 센다
        j, tie_pos, tie_neg = i, 0, 0
        while j < len(scored) and scored[j][0] == scored[i][0]:
            tie_pos += scored[j][2]
            tie_neg += scored[j][1] - scored[j][2]
            j += 1
        wins += tie_pos * (below + 0.5 * tie_neg)
        below += tie_neg
        i = j
    return wins / (pos * neg)


base_ctr = sum(r[2] for r in train) / sum(r[1] for r in train)
scorers = {'평균 CTR 하나': lambda x, name, n: base_ctr,
           '기본 피처 셋': lambda x, name, n: predict(models['기본 피처 셋'], x),
           '기본 + 코사인': lambda x, name, n: predict(models['기본 + 코사인'], x),
           '숨은 관심 그대로': lambda x, name, n: sigmoid(log_odds(AD_CTR[name]) + 3 * (hidden[n][AD_TOPIC[name]] - 0.5))}
for label, score in scorers.items():
    scored = [(score(x, name, n), shown, clicked) for x, shown, clicked, name, n in test]
    print(f'{label}: logloss {logloss(scored):.4f}, AUC {auc(scored):.3f}')
for name in AD_DOCS:
    part = [r for r in test if r[3] == name]
    pair = [auc([(predict(models[label], x), shown, clicked) for x, shown, clicked, ad, n in part])
            for label in ('기본 피처 셋', '기본 + 코사인')]
    print(f'  {name} 광고 안에서만 잰 AUC: 기본 피처 셋 {pair[0]:.3f}, 기본 + 코사인 {pair[1]:.3f}')

# 6단계: 세그먼트 317 을 광고마다 따로 배워 본다
# 기본 피처 셋은 피처 하나에 가중치 하나라, 세그먼트 317 이 세 광고에 같은 몫을 더한다.
# 광고 하나의 학습 줄만으로 세그먼트 317 과 활동량 둘을 다시 배우고, 그 광고의 시험 줄에서 AUC 를 잰다.
for name in AD_DOCS:
    alone = fit([r for r in train if r[3] == name], [2, 3])
    part = [r for r in test if r[3] == name]
    print(f'{name} 광고만 따로 배우면: 세그먼트 317 {alone["w"][0]:.2f}, 활동량 {alone["w"][1]:.2f}, '
          f'광고 안 AUC {auc([(predict(alone, x), shown, clicked) for x, shown, clicked, ad, n in part]):.3f}')

# 출력:
# 1단계 뜻: 회원 A 는 러닝화 광고와 코사인이 가장 크고, 러닝을 한 적 없는 회원 B 도 해시 충돌로 러닝화 광고와 0.31 을 받는다.
# 러닝화 광고: 낱말 10개, 평소 CTR 1.2%, 코사인 회원 A 0.53, 회원 B 0.31
# 여행사 광고: 낱말 11개, 평소 CTR 0.8%, 코사인 회원 A 0.22, 회원 B 0.06
# 카페 광고: 낱말 9개, 평소 CTR 2.0%, 코사인 회원 A 0.06, 회원 B 0.04
# 회원 B 의 문서와 러닝화 광고가 같이 쓰는 버킷: 11번 (캠핑글, 달리기신발)
# 2단계 뜻: 18만 노출에 클릭은 2,834번이고, 광고마다 CTR 은 평소 CTR 보다 조금 높은 1.45%, 0.83%, 2.44% 다. 숨은 관심이 클 때 오르는 폭이 더 크다.
# 노출 180,000번, 클릭 2,834번
#   러닝화 광고: 노출 60,000번, 클릭 872번, CTR 1.45%
#   여행사 광고: 노출 60,000번, 클릭 499번, CTR 0.83%
#   카페 광고: 노출 60,000번, 클릭 1,463번, CTR 2.44%
# 3단계 뜻: 학습은 회원 1,600명의 노출 144,000번, 시험은 회원 400명의 노출 36,000번과 클릭 543번이다.
# 학습: 회원 1,600명, 노출 144,000번, 클릭 2,291번
# 시험: 회원 400명, 노출 36,000번, 클릭 543번
# 4단계 뜻: 두 모델 모두 50번째에 손실이 다 줄었다. 기본 피처 셋의 세그먼트 317 은 -0.01 이고, 코사인을 더하면 활동량이 0.18 에서 0.07 로 준다.
# 기본 피처 셋: 학습 logloss 1번째 0.0817, 50번째 0.0799, 200번째 0.0799
#   가중치: 여행사 -0.26, 카페 0.26, 세그먼트 317 -0.01, 활동량 0.18, 절편 -4.24
# 기본 + 코사인: 학습 logloss 1번째 0.0817, 50번째 0.0785, 200번째 0.0785
#   가중치: 여행사 -0.18, 카페 0.16, 세그먼트 317 0.03, 활동량 0.07, 코사인 0.44, 절편 -4.32
# 5단계 뜻: 코사인을 더하자 시험 AUC 가 0.637 에서 0.670 으로 오르고, 광고 하나 안에서 잰 AUC 도 세 광고 모두 오른다.
# 평균 CTR 하나: logloss 0.0783, AUC 0.500
# 기본 피처 셋: logloss 0.0766, AUC 0.637
# 기본 + 코사인: logloss 0.0756, AUC 0.670
# 숨은 관심 그대로: logloss 0.0726, AUC 0.738
#   러닝화 광고 안에서만 잰 AUC: 기본 피처 셋 0.555, 기본 + 코사인 0.611
#   여행사 광고 안에서만 잰 AUC: 기본 피처 셋 0.577, 기본 + 코사인 0.649
#   카페 광고 안에서만 잰 AUC: 기본 피처 셋 0.574, 기본 + 코사인 0.627
# 6단계 뜻: 광고마다 따로 배우면 세그먼트 317 의 가중치는 러닝화에서만 양수이고, 러닝화 광고 안 AUC 는 기본 피처 셋의 0.555 보다 높은 0.572 다.
# 러닝화 광고만 따로 배우면: 세그먼트 317 0.21, 활동량 0.06, 광고 안 AUC 0.572
# 여행사 광고만 따로 배우면: 세그먼트 317 -0.04, 활동량 0.28, 광고 안 AUC 0.576
# 카페 광고만 따로 배우면: 세그먼트 317 -0.16, 활동량 0.23, 광고 안 AUC 0.578
```

회원 A 의 코사인은 러닝화 광고와 0.53 으로 가장 큽니다. 러닝을 한 적이 없는 회원 B 도 러닝화 광고와 0.31 을 받았는데, 캠핑글과 달리기신발이 11번 버킷에 같이 떨어졌기 때문입니다. 장난감 인코더의 코사인에는 이런 해시 충돌의 값이 섞여 있고, 랭커는 그 값까지 피처로 읽습니다. 코사인을 더한 모델은 코사인에 0.44 를 주었고, 활동량의 가중치는 0.18 에서 0.07 로 줄었습니다. 많이 움직인 회원이 많이 누른다는 몫의 일부가, 광고와 같은 쪽으로 움직였는지로 옮겨 간 것입니다.

기본 피처 셋에서 세그먼트 317 의 가중치는 -0.01 로 0 에 가깝습니다. 로지스틱 회귀는 피처 하나에 가중치 하나라, 이 세그먼트는 세 광고에 같은 몫을 더합니다. 블록의 마지막 단계에서 광고마다 따로 배우면 그 가중치는 러닝화 0.21, 여행사 -0.04, 카페 -0.16 으로 서로 다릅니다. 활동량을 함께 넣은 값이라, 활동량이 같은 회원끼리 세그먼트가 있고 없음을 비교한 몫입니다. 생성기에서 러닝 성향의 회원은 러닝 사건이 많고, 여행과 카페의 사건은 나머지 회원과 같은 확률로 생깁니다. 그래서 활동량이 같으면 세그먼트 회원 쪽이 여행과 카페의 사건이 적은 편입니다. 광고마다 다른 이 셋을 가중치 하나로 맞추니 서로 상쇄되었습니다. 아래 표는 시험 회원의 노출에서 잰 값이고, 첫 줄과 끝 줄은 비교할 기준입니다.

| 모델 | 피처 | 시험 logloss | 시험 AUC | 광고 하나 안의 AUC (러닝화, 여행사, 카페) |
|---|---|---|---|---|
| 평균 CTR 하나 | 없음 | 0.0783 | 0.500 | 해당 없음 |
| 기본 피처 셋 | 광고, 세그먼트 317, 활동량 | 0.0766 | 0.637 | 0.555, 0.577, 0.574 |
| 기본 + 코사인 | 위 셋과 코사인 | 0.0756 | 0.670 | 0.611, 0.649, 0.627 |
| 숨은 관심 그대로 | 실제 로그에는 없음 | 0.0726 | 0.738 | 해당 없음 |

같은 광고 안에서는 광고 피처가 모두 같아서, 기본 피처는 세그먼트와 활동량으로만 회원의 순서를 정합니다. 러닝화 광고에는 세그먼트 317 이 쓸모 있는데도, 세 광고가 같이 쓰는 가중치가 0 근처라 순서를 거의 바꾸지 못합니다. 그래서 러닝화 광고 안의 AUC 가 셋 가운데 가장 낮은 0.555 이고, 러닝화만 따로 배우면 0.572 입니다. 여행사와 카페에는 세그먼트도 없어서, 그 관심을 직접 알려 주는 피처는 코사인뿐입니다. 숨은 관심을 그대로 쓴 확률도 AUC 가 0.738 에 머뭅니다. 클릭은 확률로 일어나서, 확률을 정확히 알아도 클릭한 노출이 모두 위에 오지는 않기 때문입니다. 0.670 과 0.738 의 차이에는 행동으로 남지 않은 몫, 해시 충돌, 선형 모델의 한계가 섞여 있습니다. 그 크기도 가짜 클릭을 만든 규칙에 기댑니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-user-embedding-cards.html?embed=1&card=ranker" height="480" loading="lazy" title="랭커가 읽는 피처 넷과 코사인을 더했을 때의 AUC"></iframe>
<a class="demo-embed-open" href="demo-user-embedding-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 4. 요청 때 LLM 을 부르지 않는 이유를 셉니다

**기록에서 LLM 호출 한 번은 thinking 을 끄고도 1,114ms 로, 모델 서버 예산 8ms 의 139배입니다. 노출마다 부르면 하루 토큰 값이 가상 단가로 9,302,400원과 98,496,000원이고, 이것도 하한입니다. GPU 서버 한 대가 1초에 2,300명을 처리한다고 두면 새벽 배치는 1.69시간에 6,425원이고, 인코더가 크면 늘어납니다.**

서연 씨의 물음대로라면 광고 요청이 올 때마다 LLM 에게 그 회원을 묻습니다. 이 글은 그 호출 한 번의 시간과 토큰을 19주째 편의 기록으로 셉니다. 그 편은 서연 씨 캠페인 한 줄을 보내 광고 목표를 enum 넷 가운데 하나로 받았습니다. 같은 요청을 thinking 을 끄고 한 번, 켜고 한 번 보냈습니다. 블록은 그 기록에서 뽑은 `RECORD` 와 `USAGE` 두 줄을 글자 그대로 붙였습니다.

기록의 시간은 이 블로그를 쓰는 맥에서 받은 값이라, 서버의 GPU 에서는 더 짧을 수 있습니다. 비교할 기준은 모델 서버 예산 8ms 입니다. 요청 한 건에서 랭커가 후보 광고 전부에 확률을 매기는 데 쓰는 시간이고, LLM 호출은 그 안에 더 들어가야 합니다. 요청 한 건에 회원은 한 명이니, 호출도 요청마다 한 번이라고 둡니다.

값은 하루 노출 2억 2,800만 번마다 thinking 을 끈 호출을 한 번씩 부른다고 두고 셉니다. 단가는 [비용, 캐시, 비결정성](post.html?id=llm-cost-cache-nondeterminism) 편의 가상 단가입니다. 100만 토큰당 작은 상용 모델은 입력 400원과 출력 1,600원, 큰 상용 모델은 입력 4,000원과 출력 20,000원입니다. 기록의 요청은 캠페인 한 줄을 보낸 짧은 호출이었습니다. 회원을 묻는 실제 호출은 회원의 기록을 함께 보내 입력이 훨씬 길어서, 이 블록이 센 값은 하한입니다.

새벽 배치의 값은 배치 추론과 실시간 추론 편의 GPU 서버로 셉니다. 한 대가 1초에 요청 2,300건을 받고, 한 시간에 3,800원입니다. 회원 한 명의 벡터를 만드는 일을 그 요청 한 건으로 둡니다. 2,300 QPS 는 그 편에서 랭킹 모델을 돌리던 서버의 값입니다. 인코더가 그 모델보다 크면 1초에 만드는 벡터가 줄어 시간과 값이 늘어나므로, 이 블록의 새벽 배치 값은 낙관적인 어림입니다.

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 기록한 LLM 호출 한 번의 시간을 모델 서버 예산 8ms 와 비교하고, 노출마다 부를 때의 하루 토큰 값과 새벽 GPU 배치의 시간과 값을 센다.
# 기록 data/llm-records/llm-first-call.json 에서 옮김
import json

# 1단계: 기록을 두고 호출 한 번의 시간을 예산 8ms 와 비교한다
# RECORD 와 USAGE 는 LLM 호출 한 번 편의 기록이다. 같은 요청을 thinking 을 끄고(c001) 켜고(c001|on|1) 한 번씩 보냈다.
# USAGE 의 네 값은 입력 토큰, 출력 토큰, 걸린 ms, thinking 글자 수다. 시간은 이 블로그를 쓰는 맥에서 받은 값이다.
RECORD = {"c001": "{\"objective\": \"conversion\"}", "c001|on|1": "{\"objective\": \"conversion\"}"}
USAGE = {"c001": [78, 6, 1114, 0], "c001|on|1": [76, 505, 31979, 1905]}
BUDGET_MS = 8
for key, label in (('c001', 'thinking 끔'), ('c001|on|1', 'thinking 켬')):
    tokens_in, tokens_out, ms, thinking = USAGE[key]
    answer = json.loads(RECORD[key])['objective']
    print(f'{label}: 답 {answer}, 입력 {tokens_in} 토큰, 출력 {tokens_out} 토큰, {ms:,}ms, 예산 8ms 의 {ms / BUDGET_MS:,.0f}배')

# 2단계: 노출마다 LLM 을 부르면 드는 하루 토큰 값을 센다
# 하루 노출 2억 2,800만 번마다 thinking 을 끈 호출을 한 번씩 부른다고 둔다. 단가는 100만 토큰당 원이고 가상 값이다.
# 기록의 요청은 캠페인 한 줄을 보낸 짧은 호출이다. 회원의 30일 기록을 담는 실제 호출은 입력이 더 길어서, 이 값은 하한이다.
IMPRESSIONS = 228_000_000
PRICES = {'작은 상용 모델': (400, 1_600), '큰 상용 모델': (4_000, 20_000)}
tokens_in, tokens_out = USAGE['c001'][0], USAGE['c001'][1]
for label, (won_in, won_out) in PRICES.items():
    per_call = (tokens_in * won_in + tokens_out * won_out) / 1_000_000
    print(f'{label}: 호출 한 번 {per_call:.4f}원, 하루 {IMPRESSIONS:,}번이면 {per_call * IMPRESSIONS:,.0f}원')

# 3단계: GPU 서버 한 대로 회원 1,400만 명의 벡터를 새벽에 만드는 시간과 값을 센다
# GPU 서버 한 대가 1초에 2,300명의 벡터를 만들고, 한 시간에 3,800원이라고 둔다. 배치 추론과 실시간 추론 편의 GPU 서버 값이다.
# 그 서버는 랭킹 모델을 돌리던 서버라, 인코더가 그 모델보다 크면 1초에 만드는 벡터가 줄어든다. 이 시간과 값은 낙관적인 어림이다.
ALL_MEMBERS, GPU_QPS, GPU_WON_PER_HOUR = 14_000_000, 2_300, 3_800
hours = ALL_MEMBERS / GPU_QPS / 3600
print(f'새벽 배치: {ALL_MEMBERS:,}명 ÷ {GPU_QPS:,} QPS = {hours:.2f}시간, {hours * GPU_WON_PER_HOUR:,.0f}원')

# 출력:
# 1단계 뜻: thinking 을 끈 호출도 1,114ms 로 예산 8ms 의 139배이고, 켠 호출은 3,997배다.
# thinking 끔: 답 conversion, 입력 78 토큰, 출력 6 토큰, 1,114ms, 예산 8ms 의 139배
# thinking 켬: 답 conversion, 입력 76 토큰, 출력 505 토큰, 31,979ms, 예산 8ms 의 3,997배
# 2단계 뜻: 노출마다 부르면 하루 9,302,400원과 98,496,000원이고, 짧은 호출로 센 하한이다.
# 작은 상용 모델: 호출 한 번 0.0408원, 하루 228,000,000번이면 9,302,400원
# 큰 상용 모델: 호출 한 번 0.4320원, 하루 228,000,000번이면 98,496,000원
# 3단계 뜻: GPU 서버 한 대가 1초에 2,300명을 만든다고 두면 새벽 배치는 1.69시간에 6,425원이고, 인코더가 크면 이보다 늘어난다.
# 새벽 배치: 14,000,000명 ÷ 2,300 QPS = 1.69시간, 6,425원
```

thinking 을 끈 호출은 기록에서 가장 빠른 호출인데도 예산의 139배였고, thinking 을 켠 호출은 3,997배였습니다. 두 하루 값은 모두 실제보다 작게 센 값입니다. 노출마다의 값은 짧은 호출로 센 하한이고, 새벽 배치의 값은 인코더가 랭킹 모델만큼 빠르다고 둔 낙관적인 어림입니다. 둘 다 작게 셌으니 둘을 나눈 배수는 어느 쪽으로도 기준이 되지 않아 적지 않습니다. 횟수부터 다릅니다. 새벽 배치는 회원마다 하루 한 번이라 1,400만 번이고, 노출마다 부르면 2억 2,800만 번입니다. 아래 표는 두 방식을 한 줄씩 놓은 것이고, 상용 모델의 시간은 기록이 없어 비워 두었습니다.

| 방식 | 한 번의 시간 | 하루 횟수 | 하루 값 |
|---|---|---|---|
| 노출마다 LLM, 기록한 로컬 모델 | 1,114ms, thinking 끔 | 2억 2,800만 | 토큰 0원, GPU 시간 따로 |
| 노출마다 LLM, 작은 상용 모델 | 기록 없음 | 2억 2,800만 | 9,302,400원 이상 |
| 노출마다 LLM, 큰 상용 모델 | 기록 없음 | 2억 2,800만 | 98,496,000원 이상 |
| 새벽 배치, GPU 서버 한 대 | 1초에 2,300명 | 1,400만 | 6,425원, 낙관적 어림 |

그래서 LLM 인코더는 새벽 배치에만 두고, 랭커는 요청 때 피처 스토어의 벡터를 읽습니다. 배치 추론 편은 그 읽기 한 번을 0.20ms 로 두었습니다. 기록한 로컬 모델은 토큰 값이 0원이지만, 노출마다 부르면 모델을 돌리는 GPU 의 시간이 2억 2,800만 번만큼 듭니다. PinnerFormer 도 실시간 추론을 운영에 맞지 않는다고 보았습니다. 하루 수십, 수백 번 움직이는 회원이 있어 배치보다 추론 값이 몇 배로 늘기 때문입니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-user-embedding-cards.html?embed=1&card=budget" height="480" loading="lazy" title="예산 8ms 와 LLM 호출 1,114ms, 하루 값과 새벽 배치의 값"></iframe>
<a class="demo-embed-open" href="demo-user-embedding-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 5. 큰 인코더의 벡터를 작은 인코더가 배우게 할 수 있습니다

**새벽 배치는 다음 날 요청이 몰리기 전에 끝나야 합니다. 인코더가 커서 하룻밤에 1,400만 명을 다 처리하지 못하면, 큰 인코더의 벡터를 정답으로 작은 인코더를 학습하는 방법이 있습니다. 33주째 편의 교사와 학생에서 라벨 자리에 벡터가 들어간 꼴입니다.**

4절의 1.69시간은 GPU 서버 한 대가 1초에 2,300명을 처리한다고 둔 값입니다. 인코더가 클수록 한 명에 드는 시간이 늘고, 같은 서버로는 새벽 배치가 길어집니다. PinnerFormer 는 지연 제약이 없는 오프라인 배치라서 더 큰 모델을 쓸 수 있었다고 적었습니다. 그래도 배치는 하룻밤 안에 끝나야 하고, 서버를 늘리면 그만큼 값이 듭니다.

33주째 편은 교사가 질의와 광고 1만 쌍에 붙인 라벨로 피처 여섯의 로지스틱 회귀를 학습했습니다. 그 편의 1만 쌍은 LLM 의 판정을 흉내 낸 가짜 교사가 붙였고, 날마다 들어오는 쌍은 학생이 맡아 라벨 100만 건이 465원이었습니다. 유저 벡터에도 같은 나눔을 쓸 수 있습니다. 큰 인코더가 회원 일부의 벡터를 만들고, 작은 인코더가 같은 기록을 읽고 그 벡터를 따라 내도록 학습하는 방법입니다.

이 방법에서는 학생이 배우는 정답이 라벨에서 벡터로 바뀌어, 재는 법도 달라집니다. 라벨은 맞았는지 틀렸는지로 재지만, 벡터는 교사의 벡터와 얼마나 가까운지로 잴 수 있습니다. 두 벡터의 코사인이나 거리를 손실로 두는 식입니다. 학생의 벡터도 64차원이면 피처 스토어와 랭커를 그대로 쓸 수 있습니다.

교사가 바뀌면 일이 더 큽니다. 33주째 편에서는 교사가 바뀌면 라벨 1만 건을 다시 받고 학생을 다시 학습했습니다. 벡터는 인코더가 바뀌면 64개 값의 뜻이 모두 바뀝니다. 그래서 회원 1,400만 명의 벡터와 광고 벡터를 같은 인코더로 다시 만들고, 그 벡터로 배운 랭커도 다시 학습해야 합니다. 피처 스토어에 벡터를 만든 인코더의 버전을 함께 적어 두면, 어느 벡터로 배운 랭커인지 맞춰 볼 수 있습니다. 아래 표는 33주째 편의 증류와 이 글의 유저 벡터를 같은 줄에 놓은 것입니다.

| 무엇 | 33주째 편의 증류 | 이 글의 유저 벡터 |
|---|---|---|
| 교사 | LLM 의 관련성 판정 (1만 쌍은 가짜 교사) | 행동 시퀀스로 학습한 큰 인코더 |
| 교사가 내는 것 | 라벨 (관련, 무관) | 64차원 벡터 |
| 학생 | 피처 여섯의 로지스틱 회귀 | 같은 기록을 읽는 작은 인코더 |
| 학생이 배우는 정답 | 교사의 라벨 | 교사의 벡터 |
| 학생이 맡는 일 | 날마다 들어오는 쌍의 판정 | 새벽 배치의 인코딩 |
| 교사가 바뀌면 | 라벨 1만 건을 다시 받고 학생을 다시 학습 | 벡터를 모두 다시 만들고 랭커도 다시 학습 |

이 글의 장난감 인코더는 배운 것이 없어 옮길 것도 없습니다. 학생이 교사를 얼마나 따라 하는지는 교사 벡터와의 코사인으로 먼저 잴 수 있습니다. 그다음 학생의 벡터로 바꾼 랭커의 logloss 와 AUC 를 3절처럼 다시 보면 됩니다. 랭커가 쓰는 것은 벡터 자체가 아니라 그 벡터로 낸 확률이기 때문입니다.

## 6. 벡터를 찾는 키가 무대마다 다릅니다

**새벽에 만든 벡터를 요청 때 읽는 셈은 두 무대가 같습니다. 다른 것은 벡터를 찾는 키입니다. 담장 안은 로그인한 회원 번호로 거의 모든 회원의 벡터를 찾습니다. 열린 RTB 의 DSP 는 쿠키나 기기의 광고 ID 로 찾아서, 벡터가 없는 요청이 많습니다.**

1~5절의 셈은 두 무대가 같습니다. 두 무대의 이름은 18주째 [자연어 오디언스](post.html?id=natural-language-audience) 편 8절에서 풀었습니다.

### 담장 안에서는 회원 번호가 벡터의 키입니다 [무대: 닫힌 생태계]

검색창, 피드, 앱을 함께 운영하는 플랫폼에는 회원의 검색어와 읽은 글이 같은 회원 번호로 쌓입니다. 새벽 배치가 회원 1,400만 명의 문서를 인코딩하고, 요청에는 그 회원 번호가 함께 오니 피처 스토어에서 바로 찾습니다. 폰과 PC 에서 온 요청도 같은 번호라 같은 벡터를 씁니다. 광고 벡터도 플랫폼이 같은 인코더로 만들어, 코사인의 두 벡터가 같은 버전에서 나옵니다.

벡터가 없는 회원은 새로 가입해 기록이 아직 없는 사람입니다. 문서가 비면 인코더는 0 벡터를 내고, 코사인도 0 이 되어 확률은 기본 피처로만 정해집니다. 그래서 랭커를 학습할 때도 벡터가 없는 회원의 노출이 섞여 있어야, 서빙에서 같은 회원을 만났을 때도 확률을 제대로 매깁니다.

### 열린 RTB 에서는 벡터를 찾지 못하는 요청이 흔합니다 [무대: 열린 RTB]

열린 RTB 에서 광고를 사는 DSP 는 쿠키나 기기의 광고 ID 로 사람을 알아봅니다. 쿠키는 브라우저마다 다르고 지워지면 처음부터 다시 쌓여서, 어제 만든 벡터를 찾을 키가 오늘 요청에 없는 일이 많습니다. 배치 추론 편도 그래서 열린 RTB 에서는 요청마다 유저 타워를 돌린다고 적었습니다. 그 유저 타워는 작은 모델이고, 4절에서 잰 큰 LLM 은 호출 한 번의 시간 때문에 입찰 요청마다 부를 수 없습니다.

DSP 가 쿠키마다 문서를 쓴다면 낱말은 검색어가 아니라 자기가 받은 입찰 요청의 지면 카테고리와 앱 이름입니다. 다시 오는 쿠키의 벡터만 새벽에 만들고, 처음 보는 쿠키에는 지면의 글로 광고를 고르는 방법을 함께 씁니다. 그 방법은 17주째 [컨텍스추얼 타겟팅](post.html?id=contextual-targeting) 편에서 보았습니다. 아래 표는 가상 데이터가 아니라 두 무대의 설계 차이를 적은 것입니다.

| 무엇 | 담장 안 | 열린 RTB |
|---|---|---|
| 벡터를 찾는 키 | 로그인한 회원 번호 | 쿠키나 기기의 광고 ID |
| 문서의 낱말 | 검색어, 읽은 글, 켠 앱 | 입찰 요청의 지면 카테고리와 앱 이름 |
| 벡터가 없는 요청 | 새로 가입한 회원 | 처음 보거나 지워진 쿠키, 흔하다 |
| 벡터가 없을 때 | 기본 피처로만 매긴다 | 지면의 글로 고르는 방법을 함께 쓴다 |

## 한눈 정리

| 자리 | 무엇을 하나 | 이 글의 숫자 |
|---|---|---|
| 문서 | 회원마다 검색어와 행동 낱말을 횟수만큼 잇는다 | 2,000편, 회원 A 37낱말 |
| 장난감 인코더 | 낱말을 crc32 로 버킷 64개에 더하고 길이를 1 로 | 낱말 126종이 버킷 56개에, 두 낱말 이상 든 버킷 40개 |
| 피처 스토어 | 키는 회원 번호, 값은 벡터와 만든 시각 | 1,400만 명 3,584,000,000바이트, 3.58GB |
| 코사인 피처 | 유저 벡터와 광고 벡터를 곱해 더한다 | 회원 A 와 러닝화 0.53, 회원 B 와 러닝화 0.31 (충돌) |
| 랭커 | 기본 피처 셋에 코사인 하나를 더한다 | AUC 0.637 → 0.670, logloss 0.0766 → 0.0756 |
| 숨은 관심 | 실제 로그에는 없는 값으로 가짜 클릭을 만든다 | 그대로 알면 AUC 0.738 |
| 요청 때 LLM | 기록의 호출 한 번 | 1,114ms 로 예산 8ms 의 139배, 하루 9,302,400원 이상 |
| 새벽 배치 | GPU 서버 한 대, 1초에 2,300명 | 1.69시간, 6,425원 (낙관적 어림) |

## 헷갈리기 쉬운 점

- **벡터의 신선도는 배치 주기가 정합니다.** 새벽 04:30 에 만든 벡터는 그날 오후의 행동을 모릅니다. 인코더가 아무리 좋아도 랭커가 읽는 것은 마지막 배치가 본 기록까지입니다. 배치 추론 편은 오늘 로그인한 회원 168만 명이 요청의 80% 를 만든다고 보고, 그 회원만 한 시간마다 다시 만들었습니다. PinnerFormer 는 전날 활동한 회원의 벡터만 새로 만들어 전날 벡터와 합칩니다. 그 논문에서 실시간 벡터는 하루 한 번 만든 벡터보다 나았고, 학습 목표를 바꿔 그 차이를 줄였습니다.

- **코사인 하나와 64차원 전부는 다른 피처입니다.** 코사인은 유저 벡터와 광고 벡터를 정해 둔 식 하나로 묶은 값이라, 64개 값을 어떻게 섞을지는 식이 정합니다. 64개를 피처로 다 넣으면 랭커가 값마다 가중치를 배웁니다. 다만 이 글의 로지스틱 회귀에 64개를 그대로 넣으면 광고와 엮이지 않아, 같은 회원에게는 세 광고 모두 같은 몫을 더합니다. 광고마다 다른 관심을 배우려면 64개를 광고 피처와 곱한 피처를 만들거나, 피처끼리 엮는 층이 있는 딥 모델을 씁니다. 그런 모델은 [Deep CTR 모델](post.html?id=deep-ctr-models) 편에 있습니다.

- **오프라인 AUC 가 오른 만큼 온라인 성과가 오르지는 않습니다.** 이 글의 0.637 에서 0.670 은 가짜 클릭과 시험 회원 400명으로 잰 값이고, 그 크기는 클릭을 만든 규칙에 기댑니다. AUC 가 올라도 매출이 그대로일 수 있는 까닭은 GAUC 와 오프라인 지표 편에 있습니다. 그래서 새 피처는 [모델 온라인 A/B 설계](post.html?id=model-ab-testing) 편의 실험으로 다시 확인합니다. PinnerFormer 도 Ads 랭킹 모델에 피처로 더한 A/B 실험에서 CTR 이 지면마다 7.1~10.0% 올랐다고 보고했습니다.

## 더 깊이 보기

:::deep 해시 인코더의 식과 충돌의 수
장난감 인코더의 식입니다. 문서 $d$ 의 낱말 $w$ 마다 $h(w)$ 는 crc32 값이고, $D$ 는 차원 수 64 입니다. 대괄호는 안의 식이 참이면 1, 거짓이면 0 입니다.

$$v_j = \sum_{w \in d} [\, h(w) \bmod D = j \,], \qquad e = \frac{v}{\lVert v \rVert}, \qquad \lVert v \rVert = \sqrt{\sum_{j} v_j^2}$$

회원 A 의 문서는 낱말 여섯이 서로 다른 버킷에 떨어져, $v$ 의 0 이 아닌 값이 12, 9, 8, 4, 3, 1 입니다. 제곱합은 $144 + 81 + 64 + 16 + 9 + 1 = 315$ 입니다. 길이는 $\sqrt{315} = 17.75$ 이고, 러닝화의 값은 $12 / 17.75 = 0.676$ 입니다. 두 벡터의 길이가 모두 1 이라 코사인은 같은 차원끼리 곱해 더한 내적과 같습니다.

해시가 낱말을 버킷에 고르게 나눈다고 두면 충돌의 수를 어림할 수 있습니다. 낱말 $V$ 종을 버킷 $D$ 개에 넣을 때, 버킷 하나가 비어 있을 확률은 $(1 - 1/D)^V$ 입니다. $V = 126$, $D = 64$ 이면 $(63/64)^{126} = 0.137$ 입니다. 그래서 쓰이는 버킷은 $64 \times (1 - 0.137) = 55.2$ 개쯤입니다. 블록은 56개를 찍었습니다. 낱말이 꼭 하나만 든 버킷의 확률은 $126 \times (1/64) \times (63/64)^{125} = 0.275$ 입니다. 그래서 두 낱말 이상 든 버킷은 $64 \times (1 - 0.137 - 0.275) = 37.6$ 개쯤이고, 블록은 40개를 찍었습니다.

$D$ 를 키우면 충돌은 줄지만 저장 크기가 그만큼 늘어납니다. 회원 1,400만 명에 값 하나가 4바이트면, 크기는 $14{,}000{,}000 \times D \times 4$ 바이트입니다. $D = 256$ 이면 14.34GB 로 64차원의 네 배입니다. 학습한 인코더는 버킷이 아니라 배운 차원을 쓰므로, 64개 값마다 여러 낱말의 정보를 섞어 담습니다.
:::

:::deep AUC 와 logloss 의 계산
클릭한 노출 $P$ 개와 안 한 노출 $N$ 개로 짝 $P \times N$ 개를 만듭니다. AUC 는 그 가운데 클릭한 쪽의 점수가 큰 짝의 비율입니다. 점수가 같은 짝은 반으로 셉니다. $s_i$ 는 클릭한 노출 $i$ 의 점수, $s_j$ 는 안 한 노출 $j$ 의 점수입니다.

$$\mathrm{AUC} = \frac{1}{P N} \sum_{i=1}^{P} \sum_{j=1}^{N} \Big( [\, s_i > s_j \,] + \tfrac{1}{2} [\, s_i = s_j \,] \Big)$$

이 값은 Mann-Whitney 의 U 통계량을 $P N$ 으로 나눈 것과 같습니다. 노출 전부를 점수가 낮은 쪽부터 순위를 매기고, 점수가 같은 노출에는 순위의 평균을 줍니다. 클릭한 노출의 순위 합을 $R$ 이라 하면 아래 식이 위 식과 같은 값을 냅니다.

$$\mathrm{AUC} = \frac{R - P(P+1)/2}{P N}$$

블록의 auc 는 짝을 하나씩 세지 않습니다. 회원과 광고 한 쌍의 노출 30번은 점수가 같으니, 쌍을 점수 순으로 놓고 아래에서부터 안 한 노출의 수를 쌓아 갑니다. 점수가 같은 묶음마다 그 묶음의 클릭 수에 (아래에 쌓인 안 한 노출 + 묶음 안의 안 한 노출의 절반) 을 곱해 더합니다. 마지막에 그 합을 $P N$ 으로 나눕니다. 평균 CTR 하나로 매기면 모든 노출의 점수가 같아, 이 셈은 정확히 0.5 를 냅니다.

logloss 는 쌍마다 노출 $n$ 번과 클릭 $k$ 번, 모델의 확률 $p$ 로 셉니다. 노출마다 따로 센 로그 손실의 평균과 같은 값입니다.

$$\mathrm{logloss} = -\frac{1}{\sum n} \sum_{\text{쌍}} \Big[\, k \log p + (n - k) \log (1 - p) \,\Big]$$

AUC 는 점수의 순서만 보고, logloss 는 확률의 크기도 봅니다. 모든 확률을 두 배로 키워도 순서는 그대로라 AUC 는 같지만, logloss 는 나빠집니다. 확률의 크기를 맞추는 일은 [Calibration](post.html?id=calibration) 편에 있습니다.
:::

- [유저를 문서로](post.html?id=users-as-documents) — 29주째 편입니다. 이 글의 회원 2,000명과 문서가 그 편에서 왔습니다.
- [LLM 호출 한 번](post.html?id=llm-first-call) — 19주째 편입니다. 호출 한 번의 답과 토큰과 시간을 기록한 편입니다.
- [임베딩과 벡터 검색](post.html?id=embeddings-vector-search) — 23주째 편입니다. 해시로 짠 장난감 임베딩과 코사인을 처음 본 편입니다.
- [배치 추론과 실시간 추론](post.html?id=batch-vs-realtime-inference) — 유저 벡터 3.58GB 와 새벽 04:30 배치, GPU 서버의 값이 나온 편입니다.
- [LLM 라벨링과 증류](post.html?id=llm-labeling-distillation) — 33주째 편입니다. 교사의 라벨로 학생을 학습한 편입니다.
- [LLM 유저 임베딩 카드 네 장](demo-user-embedding-cards.html) — 이 글의 카드 전체입니다. 카드를 누르면 헷갈리는 것 하나가 더 나옵니다.

## 참고문헌

- Ning, L., Liu, L., Wu, J., et al. (2024). *User-LLM: Efficient LLM Contextualization with User Embeddings*. arXiv:2402.13598. [arxiv.org](https://arxiv.org/abs/2402.13598). 행동 시퀀스를 라벨 없이 미리 학습한 Transformer 인코더로 유저 임베딩을 만드는 방법입니다. 그 임베딩은 cross-attention 으로 LLM 에 넣습니다. 행동 기록을 글로 풀어 프롬프트에 넣는 방법보다 추론이 최대 78.1배 빨랐다고 보고했습니다. 행동 하나를 토큰 하나로 줄여 LLM 의 컨텍스트를 덜 쓴다고 적었습니다.
- Pancha, N., Zhai, A., Leskovec, J., Rosenberg, C. (2022). *PinnerFormer: Sequence Modeling for User Representation at Pinterest*. KDD 2022, 3702–3712. arXiv:2205.04507. [arxiv.org](https://arxiv.org/abs/2205.04507). 최근 행동 시퀀스를 읽는 Transformer 로, 벡터를 만든 뒤 14일 동안의 참여를 맞히는 것을 목표로 학습한 유저 벡터입니다. 전날 활동한 회원의 벡터만 날마다 새로 만들어 전날 벡터와 합치고, 키값 피처 스토어에 올립니다. 실시간 추론은 하루 수십, 수백 번 움직이는 회원 때문에 값이 배치의 몇 배라 운영에 맞지 않는다고 적었습니다. 하루 한 번 만든 벡터는 실시간 벡터보다 오프라인 평가가 낮았고, 학습 목표를 바꿔 그 차이를 줄였다고 적었습니다. Ads 랭킹 모델에 피처로 더한 A/B 실험에서 CTR 이 지면마다 7.1~10.0% 올랐다고 보고했습니다.
- Feast. *Online store*, *Entity*. Feast 문서. [온라인 스토어](https://docs.feast.dev/getting-started/components/online-store), [엔티티](https://docs.feast.dev/getting-started/concepts/entity). 오픈 소스 피처 스토어 Feast 의 문서입니다. 온라인 스토어는 엔티티 키마다 가장 최근의 피처 값만 두고 지난 값은 두지 않는다고 적었습니다. 배치 소스의 값은 materialize 명령으로 온라인 스토어에 올린다고 적었습니다. 엔티티 키와 시각을 주면 그 시각에 맞는 피처 값으로 학습 데이터를 만든다고 적었습니다.
