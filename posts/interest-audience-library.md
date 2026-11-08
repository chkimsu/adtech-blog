모델 팀 31주째 월요일, 서연 씨가 지훈 씨에게 부탁을 하나 보냈습니다. 캠페인 화면에서 보여 줄 사람을 번호가 아니라 이름으로 고르고 싶다는 부탁입니다. 「러닝」, 「캠핑」처럼 회원이 실제로 찾아본 말에서 나온 이름이면 좋겠다고 했습니다.

선배는 검색 기록에 쌓인 검색어 120개로 시작하라고 했습니다. 쓸 말과 뺄 말을 모델에게 두 번 묻고, 두 답이 다른 말만 더 오래 생각하게 해서 다시 묻습니다. 남은 말은 모델이 묶어 이름을 붙이고, 묶음마다 회원이 몇 명인지는 코드가 셉니다.

**검색어 120개 가운데 무엇을 빼고, 남은 말을 어떻게 묶어야 광고주가 고를 수 있는 이름이 될까요?**

검색 키워드를 거르고 묶어 이름을 붙인 오디언스 목록을 관심사 사전이라고 부릅니다. 사전의 이름 하나가 서연 씨의 하루 300만 원이 쓰일 사람을 정합니다. 건강 검색어가 섞이거나 회원이 너무 적은 이름이 들어가면, 그 이름을 고른 캠페인은 쓸 수 없는 명단에 돈을 씁니다.

> **한 줄 요약:** 29주째부터 쓴 키워드 120개를 qwen3.5:27b 에 20개씩 주고, 남길지 거를지를 두 번 물었습니다. temperature 0 과 0.7 로 받은 두 답은 116개에서 keep 이 같았습니다. 다른 4개만 thinking 을 켠 심판이 다시 보았습니다. 최종 결정은 정답과 112개가 맞았고, health 6개는 두 투표가 모두 걸렀습니다. 틀린 8개 가운데 7개는 두 투표가 같은 답을 내서 심판에게 가지 않은 키워드입니다. 투표와 심판에 615.3초가 걸렸고, 심판이 120개를 다 본다면 7,452.8초로 어림됩니다. 다만 키워드당 값은 두 답의 keep 이 다른 4개, 곧 판단이 어려운 키워드에서 잰 것이라 어림이 높을 수 있습니다. 남은 94개는 모델이 묶음 9개로 나누고 영어 이름을 붙였습니다. 절반을 넘는 묶음도, 20명이 안 되는 묶음도 없어서 코드의 두 규칙은 아무것도 바꾸지 않았습니다. 가장 큰 오디언스는 버너, 토너, 번역기를 묶은 office_supplies 795명입니다. 그 가운데 713명은 noise 인 번역기를 검색한 회원입니다.

> **골라 읽는 법** — 절이 6개입니다. 절마다 표나 코드나 카드가 있어 그것만 보고 넘어가도 됩니다.
>
> - 키워드 120개가 지나는 다섯 단계와 맡는 쪽 → 1절
> - 두 번 묻는 투표와 두 답이 같았던 키워드 → 2절
> - 답이 다른 키워드만 보는 심판, 최종 결정과 비용 → 3절
> - 모델이 붙인 묶음과 이름, 코드의 나누기 규칙 → 4절
> - 최소 크기 20명과 최종 사전 → 5절
> - 담장 안과 열린 RTB 에서 달라지는 것 → 6절

이 글의 키워드 120개, 주제, 하루 검색 수, 회원 2,000명의 30일 검색 기록은 설명을 위해 만든 가상 데이터입니다. 키워드와 회원은 `scripts/gen-ads-data.py` 가 만들고, 블록은 그 리터럴과 생성 코드를 글자 그대로 옮겼습니다. LLM 의 답만은 지어낸 값이 아닙니다. 2026-11-07 에 이 블로그를 쓰는 맥에서 Ollama 0.40.11 로 qwen3.5:27b 를 띄워 기록했습니다. 기록 파일 셋은 `data/llm-records/` 에 있고, 이름 끝이 voters, referee, groups 입니다. 처음 계획은 작은 모델 둘이 투표하고 큰 모델 하나가 심판하는 구조였습니다. 이 블로그는 기록 모델이 하나라서, thinking 을 끈 같은 모델을 싼 투표자로, 켠 같은 모델을 비싼 심판으로 두었습니다. 카드 속 파랑은 코드와 정답, 벽돌색은 모델의 답과 정답과 다른 자리입니다. 회색은 두 답이 같은데 정답과 다른 키워드와 어림한 값이고, 점선 상자는 다섯 단계의 이름입니다.

---

## 1. 로그 키워드 120개가 다섯 단계를 지나 이름 붙은 오디언스가 됩니다

**로그 키워드는 거르기, 심판, 묶기, 다시 나누기와 합치기, 최소 크기의 다섯 단계를 지납니다. 앞의 셋은 모델이 답하고, 뒤의 둘은 코드가 회원 수로 정합니다. 모델이 답하는 단계에서도 답을 읽고 세는 일은 코드가 합니다.**

키워드는 29주째 [유저를 문서로](post.html?id=users-as-documents) 편에서 회원의 문서를 만들 때 쓴 120개입니다. 주제는 14주째 [관심사 분류](post.html?id=interest-classification) 편의 라벨 8개에 health 와 noise 를 더한 10개입니다. health 는 무릎통증, 고혈압처럼 건강 상태를 가리키는 말이고 6개입니다. noise 는 날씨, 택배조회처럼 무언가를 사려는 뜻, 곧 상업 의도가 없는 말이고 14개입니다.

오디언스는 광고를 보일 회원의 목록입니다. [오디언스와 세그먼트](post.html?id=audience-and-segments) 편에서 조건 한 벌인 세그먼트와 나눠 보았습니다. 관심사 사전은 이름이 붙은 오디언스의 목록입니다. 광고주가 사전에서 이름을 고르면, 플랫폼은 그 이름의 키워드를 검색한 회원에게 광고를 보입니다. 그래서 사전의 이름마다 키워드 목록과 회원 수가 함께 있어야 합니다.

남길지 거를지의 정답은 주제로 정했습니다. health 와 noise 20개는 거르고, 나머지 100개는 남깁니다. 30주째 [키워드 확장 전략](post.html?id=keyword-expansion-strategies) 편의 policy_filter 가 health 와 noise 를 뺀 것과 같은 기준입니다. 그 글은 모델이 고른 키워드를 코드가 걸렀고, 이 글은 거르기 자체를 모델에게 묻고 그 답을 이 정답과 비교합니다.

다섯 단계 가운데 거르기, 심판, 묶기는 모델이 답합니다. 다시 나누기와 합치기, 최소 크기는 코드가 회원 2,000명의 검색 기록으로 정합니다. 모델이 답하는 단계에서도 답을 스키마대로 읽고, 정답과 비교하고, 다음 단계의 입력을 만드는 일은 코드가 합니다. 아래 표의 수는 2~4절 코드가 찍은 값입니다.

| 단계 | 맡는 쪽 | 들어가는 것 | 나오는 것 |
|---|---|---|---|
| 1 거르기 | 모델 투표 둘, thinking 끔 | 키워드 120개를 20개씩 6묶음 | 키워드마다 keep 두 개. 116개가 같다 |
| 2 심판 | 모델, thinking 켬 | 두 답의 keep 이 다른 4개 | 4개의 keep. 최종 남김 94개 |
| 3 묶기 | 모델, thinking 끔 | 남긴 키워드 94개 | 묶음 9개와 영어 이름. 빠진 키워드 4개 |
| 4 다시 나누기와 합치기 | 코드 | 묶음 9개 | 절반을 넘으면 둘로, 20명 미만은 이웃에. 바뀐 묶음 0개 |
| 5 최소 크기 | 코드, 회원 수 | 회원 2,000명의 30일 검색 기록 | 20명 이상인 오디언스 9개와 1,400만 명 기준 크기 |

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-interest-library-cards.html?embed=1&card=filter" height="480" loading="lazy" title="로그 키워드 120개가 거르기, 심판, 묶기, 나누기와 합치기, 최소 크기를 지나는 다섯 단계"></iframe>
<a class="demo-embed-open" href="demo-interest-library-cards.html" target="_blank" rel="noopener">↗ 카드 다섯 장 전체로 열기</a>
</div>

## 2. 거르기는 두 번 묻고 같으면 그대로 둡니다

**키워드 120개를 20개씩 6묶음으로 나눠, 같은 시스템 메시지를 temperature 0 과 0.7 로 한 번씩 보냈습니다. 답 12개가 모두 스키마대로 읽혔고, 두 답의 keep 은 116개에서 같았습니다. 같은 116개 가운데 7개는 두 답이 함께 틀렸습니다.**

시스템 메시지는 키워드마다 keep 과 reason_code 를 적게 했습니다. keep 은 남기면 true, 거르면 false 이고, reason_code 는 그 까닭을 넷 가운데 하나로 적습니다. commercial_interest 는 사거나 쓰려는 관심이 보이는 말이라 남깁니다. sensitive_health 는 건강 정보, no_commercial_intent 는 상업 의도가 없는 말이라 거릅니다. too_broad 는 관심사 하나를 가리키기에 너무 넓은 말이라 거릅니다. 정답은 health 와 noise 만 거르니, 정답이 남김인 키워드를 too_broad 로 거른 답은 구조상 틀린 답이 됩니다. 시스템 메시지 전문은 끝의 더 깊이 보기에 있습니다.

투표자 A 는 temperature 0 으로, 투표자 B 는 같은 묶음을 temperature 0.7 로 한 번 더 받았습니다. temperature 와 seed 가 답을 얼마나 흔드는지는 27주째 [비용, 캐시, 비결정성](post.html?id=llm-cost-cache-nondeterminism) 편에서 보았습니다. 투표자 B 는 seed 9 로 뽑은 temperature 0.7 이라, 답이 흔들리는 키워드에서 투표자 A 와 다른 답을 낼 수 있습니다. 두 답이 같으면 그대로 쓰고, 다르면 그 키워드만 더 비싼 심판에게 넘깁니다.

Wang 외(2022)의 Self-Consistency 는 같은 문제에서 여러 풀이를 뽑고 가장 일관된 답을 고릅니다. 이 글은 두 번만 묻기 때문에 다수결 대신 두 답이 같은지만 보고, 다르면 셋째 답을 심판에게서 받습니다. 두 답이 같은지는 keep 으로만 봅니다. keep 이 같고 reason_code 만 다르면 심판에게 보내지 않고 투표자 A 의 코드를 씁니다. 거르는 결정은 keep 이고, 코드는 그 결정의 설명이기 때문입니다.

읽지 못한 답도 심판에게 갑니다. 한 묶음의 답을 스키마대로 읽지 못하면 그 묶음 20개가 모두 갑니다. 읽은 답에서 id 하나가 빠지거나 두 번 나오면 그 키워드 하나만 갑니다. 읽는 법은 22주째 [구조화 출력](post.html?id=structured-output) 편과 같습니다. 블록의 읽는 함수는 생성기가 심판에게 보낼 키워드를 정할 때 쓰는 함수를 글자 그대로 옮긴 것입니다.

```python
# 하는 일: 키워드 120개를 20개씩 6묶음으로 두 번 물은 기록 12개를 읽고, 두 투표의 keep 이 같은 키워드와 다른 키워드, 읽지 못한 답을 센다.
# 기록 data/llm-records/interest-audience-library-voters.json 에서 옮김
import json
from collections import Counter

# 1단계: 키워드 사전과 정답을 둔다
# KEYWORDS 는 scripts/gen-ads-data.py 의 리터럴을 글자 그대로 옮겼다. (id, 검색어, 주제, 전략, 하루 검색 수) 이고 값은 모두 가상이다.
# 정답은 주제로 정한다. health 는 민감한 정보라서, noise 는 상업 의도가 없어서 거르고, 나머지 여덟 주제는 남긴다.
# 투표 묶음은 id 차례로 20개씩이다. b1 은 k001~k020, b6 은 k101~k120 이다.
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
INFO = {kid: (text, topic, daily) for kid, text, topic, strategy, daily in KEYWORDS}
GOLD_KEEP = {kid: topic not in ('health', 'noise') for kid, (text, topic, daily) in INFO.items()}
BATCHES = [[k[0] for k in KEYWORDS[i:i + 20]] for i in range(0, len(KEYWORDS), 20)]
topic_n = Counter(topic for text, topic, daily in INFO.values())
print(f'사전 {len(INFO)}개를 {len(BATCHES)}묶음으로: 정답이 남김인 키워드 {sum(GOLD_KEEP.values())}개, '
      f'거름인 키워드 {len(INFO) - sum(GOLD_KEEP.values())}개 (health {topic_n["health"]}, noise {topic_n["noise"]})')

# 2단계: 기록을 두고 답을 읽는다
# 키 b1 은 temperature 0 으로 물은 투표자 A, b1|off|2 는 같은 묶음을 temperature 0.7 로 다시 물은 투표자 B 다.
# USAGE 의 네 값은 입력 토큰, 출력 토큰, 걸린 ms, thinking 글자 수다. 뒤 블록이 RECORD 와 USAGE 를 다시 쓰므로 R_VOTE, U_VOTE 로 옮겨 둔다.
# REASON_CODES 와 read_decisions 는 생성기가 심판에 보낼 키워드를 정할 때 쓰는 것을 글자 그대로 옮겼다.
RECORD = {"b1": "{\"decisions\": [{\"id\": \"k001\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k002\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k003\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k004\", \"keep\": false, \"reason_code\": \"no_commercial_intent\"}, {\"id\": \"k005\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k006\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k007\", \"keep\": false, \"reason_code\": \"no_commercial_intent\"}, {\"id\": \"k008\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k009\", \"keep\": false, \"reason_code\": \"sensitive_health\"}, {\"id\": \"k010\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k011\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k012\", \"keep\": false, \"reason_code\": \"sensitive_health\"}, {\"id\": \"k013\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k014\", \"keep\": false, \"reason_code\": \"no_commercial_intent\"}, {\"id\": \"k015\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k016\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k017\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k018\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k019\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k020\", \"keep\": false, \"reason_code\": \"too_broad\"}]}", "b1|off|2": "{\"decisions\": [{\"id\": \"k001\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k002\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k003\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k004\", \"keep\": false, \"reason_code\": \"no_commercial_intent\"}, {\"id\": \"k005\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k006\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k007\", \"keep\": false, \"reason_code\": \"no_commercial_intent\"}, {\"id\": \"k008\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k009\", \"keep\": false, \"reason_code\": \"sensitive_health\"}, {\"id\": \"k010\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k011\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k012\", \"keep\": false, \"reason_code\": \"sensitive_health\"}, {\"id\": \"k013\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k014\", \"keep\": false, \"reason_code\": \"no_commercial_intent\"}, {\"id\": \"k015\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k016\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k017\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k018\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k019\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k020\", \"keep\": false, \"reason_code\": \"too_broad\"}]}", "b2": "{\"decisions\": [{\"id\": \"k021\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k022\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k023\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k024\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k025\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k026\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k027\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k028\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k029\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k030\", \"keep\": false, \"reason_code\": \"no_commercial_intent\"}, {\"id\": \"k031\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k032\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k033\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k034\", \"keep\": false, \"reason_code\": \"no_commercial_intent\"}, {\"id\": \"k035\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k036\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k037\", \"keep\": false, \"reason_code\": \"too_broad\"}, {\"id\": \"k038\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k039\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k040\", \"keep\": false, \"reason_code\": \"sensitive_health\"}]}", "b2|off|2": "{\"decisions\": [{\"id\": \"k021\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k022\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k023\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k024\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k025\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k026\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k027\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k028\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k029\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k030\", \"keep\": false, \"reason_code\": \"no_commercial_intent\"}, {\"id\": \"k031\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k032\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k033\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k034\", \"keep\": false, \"reason_code\": \"too_broad\"}, {\"id\": \"k035\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k036\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k037\", \"keep\": false, \"reason_code\": \"too_broad\"}, {\"id\": \"k038\", \"keep\": false, \"reason_code\": \"no_commercial_intent\"}, {\"id\": \"k039\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k040\", \"keep\": false, \"reason_code\": \"sensitive_health\"}]}", "b3": "{\"decisions\": [{\"id\": \"k041\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k042\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k043\", \"keep\": false, \"reason_code\": \"no_commercial_intent\"}, {\"id\": \"k044\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k045\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k046\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k047\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k048\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k049\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k050\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k051\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k052\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k053\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k054\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k055\", \"keep\": false, \"reason_code\": \"no_commercial_intent\"}, {\"id\": \"k056\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k057\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k058\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k059\", \"keep\": false, \"reason_code\": \"no_commercial_intent\"}, {\"id\": \"k060\", \"keep\": true, \"reason_code\": \"commercial_interest\"}]}", "b3|off|2": "{\"decisions\": [{\"id\": \"k041\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k042\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k043\", \"keep\": false, \"reason_code\": \"no_commercial_intent\"}, {\"id\": \"k044\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k045\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k046\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k047\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k048\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k049\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k050\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k051\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k052\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k053\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k054\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k055\", \"keep\": false, \"reason_code\": \"no_commercial_intent\"}, {\"id\": \"k056\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k057\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k058\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k059\", \"keep\": false, \"reason_code\": \"no_commercial_intent\"}, {\"id\": \"k060\", \"keep\": true, \"reason_code\": \"commercial_interest\"}]}", "b4": "{\"decisions\": [{\"id\": \"k061\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k062\", \"keep\": false, \"reason_code\": \"no_commercial_intent\"}, {\"id\": \"k063\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k064\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k065\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k066\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k067\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k068\", \"keep\": false, \"reason_code\": \"sensitive_health\"}, {\"id\": \"k069\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k070\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k071\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k072\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k073\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k074\", \"keep\": false, \"reason_code\": \"no_commercial_intent\"}, {\"id\": \"k075\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k076\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k077\", \"keep\": false, \"reason_code\": \"no_commercial_intent\"}, {\"id\": \"k078\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k079\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k080\", \"keep\": false, \"reason_code\": \"sensitive_health\"}]}", "b4|off|2": "{\"decisions\": [{\"id\": \"k061\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k062\", \"keep\": false, \"reason_code\": \"no_commercial_intent\"}, {\"id\": \"k063\", \"keep\": false, \"reason_code\": \"no_commercial_intent\"}, {\"id\": \"k064\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k065\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k066\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k067\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k068\", \"keep\": false, \"reason_code\": \"sensitive_health\"}, {\"id\": \"k069\", \"keep\": false, \"reason_code\": \"no_commercial_intent\"}, {\"id\": \"k070\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k071\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k072\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k073\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k074\", \"keep\": false, \"reason_code\": \"no_commercial_intent\"}, {\"id\": \"k075\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k076\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k077\", \"keep\": false, \"reason_code\": \"no_commercial_intent\"}, {\"id\": \"k078\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k079\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k080\", \"keep\": false, \"reason_code\": \"sensitive_health\"}]}", "b5": "{\"decisions\": [{\"id\": \"k081\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k082\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k083\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k084\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k085\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k086\", \"keep\": false, \"reason_code\": \"no_commercial_intent\"}, {\"id\": \"k087\", \"keep\": false, \"reason_code\": \"no_commercial_intent\"}, {\"id\": \"k088\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k089\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k090\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k091\", \"keep\": false, \"reason_code\": \"no_commercial_intent\"}, {\"id\": \"k092\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k093\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k094\", \"keep\": false, \"reason_code\": \"no_commercial_intent\"}, {\"id\": \"k095\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k096\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k097\", \"keep\": false, \"reason_code\": \"no_commercial_intent\"}, {\"id\": \"k098\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k099\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k100\", \"keep\": false, \"reason_code\": \"sensitive_health\"}]}", "b5|off|2": "{\"decisions\": [{\"id\": \"k081\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k082\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k083\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k084\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k085\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k086\", \"keep\": false, \"reason_code\": \"too_broad\"}, {\"id\": \"k087\", \"keep\": false, \"reason_code\": \"no_commercial_intent\"}, {\"id\": \"k088\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k089\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k090\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k091\", \"keep\": false, \"reason_code\": \"no_commercial_intent\"}, {\"id\": \"k092\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k093\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k094\", \"keep\": false, \"reason_code\": \"no_commercial_intent\"}, {\"id\": \"k095\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k096\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k097\", \"keep\": false, \"reason_code\": \"no_commercial_intent\"}, {\"id\": \"k098\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k099\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k100\", \"keep\": false, \"reason_code\": \"sensitive_health\"}]}", "b6": "{\"decisions\": [{\"id\": \"k101\", \"keep\": false, \"reason_code\": \"no_commercial_intent\"}, {\"id\": \"k102\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k103\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k104\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k105\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k106\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k107\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k108\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k109\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k110\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k111\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k112\", \"keep\": false, \"reason_code\": \"too_broad\"}, {\"id\": \"k113\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k114\", \"keep\": false, \"reason_code\": \"no_commercial_intent\"}, {\"id\": \"k115\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k116\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k117\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k118\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k119\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k120\", \"keep\": true, \"reason_code\": \"commercial_interest\"}]}", "b6|off|2": "{\"decisions\": [{\"id\": \"k101\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k102\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k103\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k104\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k105\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k106\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k107\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k108\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k109\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k110\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k111\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k112\", \"keep\": false, \"reason_code\": \"too_broad\"}, {\"id\": \"k113\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k114\", \"keep\": false, \"reason_code\": \"no_commercial_intent\"}, {\"id\": \"k115\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k116\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k117\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k118\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k119\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k120\", \"keep\": true, \"reason_code\": \"commercial_interest\"}]}"}
USAGE = {"b1": [489, 454, 32257, 0], "b1|off|2": [489, 454, 30165, 0], "b2": [481, 451, 31823, 0], "b2|off|2": [481, 452, 29850, 0], "b3": [499, 451, 30321, 0], "b3|off|2": [499, 451, 29913, 0], "b4": [498, 453, 30594, 0], "b4|off|2": [498, 457, 30246, 0], "b5": [488, 456, 30425, 0], "b5|off|2": [488, 455, 29758, 0], "b6": [494, 450, 32284, 0], "b6|off|2": [494, 448, 29199, 0]}
R_VOTE, U_VOTE = RECORD, USAGE
REASON_CODES = ['commercial_interest', 'sensitive_health', 'no_commercial_intent', 'too_broad']


def read_decisions(text, ids):
    """거르기 답 하나를 {id: (keep, reason_code)} 로 읽는다. 답의 꼴이 스키마와 다르면 None 이다.
    ids 가운데 결정이 꼭 하나인 id 만 담는다. 빠진 id 와 두 번 이상 적은 id 는 읽지 못한 키워드라 담지 않는다."""
    try:
        answer = json.loads(text)
    except ValueError:
        return None
    if not (isinstance(answer, dict) and set(answer) == {'decisions'} and isinstance(answer['decisions'], list)):
        return None
    found = {}
    for d in answer['decisions']:
        if not (isinstance(d, dict) and set(d) == {'id', 'keep', 'reason_code'} and isinstance(d['id'], str)
                and isinstance(d['keep'], bool) and d['reason_code'] in REASON_CODES):
            return None
        found.setdefault(d['id'], []).append((d['keep'], d['reason_code']))
    return {i: found[i][0] for i in ids if len(found.get(i, [])) == 1}


def say(ans):
    """답 하나를 「남김 commercial_interest」 꼴로 적는다. 읽지 못했으면 「읽지 못함」이다."""
    return '읽지 못함' if ans is None else ('남김 ' if ans[0] else '거름 ') + ans[1]


VOTES = {}                     # id → (투표자 A 의 답, 투표자 B 의 답). 답은 (keep, reason_code) 이고 읽지 못하면 None 이다
for n, ids in enumerate(BATCHES, 1):
    pair = [read_decisions(R_VOTE[f'b{n}'], ids), read_decisions(R_VOTE[f'b{n}|off|2'], ids)]
    for i in ids:
        VOTES[i] = tuple((ans or {}).get(i) for ans in pair)
    print(f'b{n}: ' + ', '.join(f'투표자 {who} ' + ('읽지 못한 답' if ans is None else f'{len(ans)}/{len(ids)} 읽음')
                              for who, ans in zip('AB', pair)))

# 3단계: 두 투표를 비교한다
# keep 이 같으면 그 답을 그대로 쓰고, keep 이 같은데 reason_code 만 다르면 투표자 A 의 코드를 쓴다.
# keep 이 다르거나 어느 한쪽이라도 읽지 못한 키워드만 심판에게 보낸다.
SAME = [i for i, (a, b) in VOTES.items() if a and b and a[0] == b[0]]
CODE_ONLY = [i for i in SAME if VOTES[i][0][1] != VOTES[i][1][1]]
CONTESTED = [i for i in VOTES if i not in SAME]
unread = [i for i, (a, b) in VOTES.items() if a is None or b is None]
print(f'keep 이 같은 키워드 {len(SAME)}개, 그 가운데 reason_code 만 다른 키워드 {len(CODE_ONLY)}개')
for i in CODE_ONLY:
    print(f'  {i} {INFO[i][0]} ({INFO[i][1]}): 투표자 A {say(VOTES[i][0])}, 투표자 B {say(VOTES[i][1])}')
print(f'심판에게 보낼 키워드 {len(CONTESTED)}개 (keep 이 다름 {len(CONTESTED) - len(unread)}, 읽지 못함 {len(unread)})')
for i in CONTESTED:
    print(f'  {i} {INFO[i][0]} ({INFO[i][1]}): 투표자 A {say(VOTES[i][0])}, 투표자 B {say(VOTES[i][1])}')

# 4단계: 투표자마다 정답과 비교한다
# 읽지 못한 키워드는 틀린 답으로 센다. 두 투표가 같은데 정답과 다른 키워드는 심판에게 가지 않으니 따로 적는다.
for k, name in enumerate(('투표자 A, temperature 0', '투표자 B, temperature 0.7')):
    answers = [VOTES[i][k] for i in VOTES]
    hit = sum(ans is not None and ans[0] == GOLD_KEEP[i] for i, ans in zip(VOTES, answers))
    codes = Counter(ans[1] for ans in answers if ans)
    print(f'{name}: 맞음 {hit}/{len(VOTES)}, ' + ', '.join(f'{c} {codes[c]}' for c in REASON_CODES))
agreed_wrong = [i for i in SAME if VOTES[i][0][0] != GOLD_KEEP[i]]
print(f'두 투표가 같은데 정답과 다른 키워드 {len(agreed_wrong)}개')
for i in agreed_wrong:
    print(f'  {i} {INFO[i][0]} ({INFO[i][1]}): {say(VOTES[i][0])}')

# 출력:
# 1단계 뜻: 정답은 주제로 정해 남김 100개, 거름 20개다.
# 사전 120개를 6묶음으로: 정답이 남김인 키워드 100개, 거름인 키워드 20개 (health 6, noise 14)
# 2단계 뜻: 답 12개가 모두 스키마대로 읽혀 묶음마다 20개를 다 읽었다.
# b1: 투표자 A 20/20 읽음, 투표자 B 20/20 읽음
# b2: 투표자 A 20/20 읽음, 투표자 B 20/20 읽음
# b3: 투표자 A 20/20 읽음, 투표자 B 20/20 읽음
# b4: 투표자 A 20/20 읽음, 투표자 B 20/20 읽음
# b5: 투표자 A 20/20 읽음, 투표자 B 20/20 읽음
# b6: 투표자 A 20/20 읽음, 투표자 B 20/20 읽음
# 3단계 뜻: keep 이 같은 116개는 그대로 두고, keep 이 다른 4개만 심판에게 보낸다.
# keep 이 같은 키워드 116개, 그 가운데 reason_code 만 다른 키워드 2개
#   k034 지도 (noise): 투표자 A 거름 no_commercial_intent, 투표자 B 거름 too_broad
#   k086 달력 (noise): 투표자 A 거름 no_commercial_intent, 투표자 B 거름 too_broad
# 심판에게 보낼 키워드 4개 (keep 이 다름 4, 읽지 못함 0)
#   k038 마라토너 (running): 투표자 A 남김 commercial_interest, 투표자 B 거름 no_commercial_intent
#   k063 새벽러닝 (running): 투표자 A 남김 commercial_interest, 투표자 B 거름 no_commercial_intent
#   k069 번역기 (noise): 투표자 A 남김 commercial_interest, 투표자 B 거름 no_commercial_intent
#   k101 러닝크루 (running): 투표자 A 거름 no_commercial_intent, 투표자 B 남김 commercial_interest
# 4단계 뜻: 두 투표자는 각각 111개를 맞혔지만, 두 답이 같은 7개는 함께 틀렸다.
# 투표자 A, temperature 0: 맞음 111/120, commercial_interest 93, sensitive_health 6, no_commercial_intent 18, too_broad 3
# 투표자 B, temperature 0.7: 맞음 111/120, commercial_interest 91, sensitive_health 6, no_commercial_intent 18, too_broad 5
# 두 투표가 같은데 정답과 다른 키워드 7개
#   k020 런솔 (running): 거름 too_broad
#   k030 카페추천 (cafe): 거름 no_commercial_intent
#   k059 10km완주 (running): 거름 no_commercial_intent
#   k074 가계부앱 (finance): 거름 no_commercial_intent
#   k077 쿠션팩트 (beauty): 거름 no_commercial_intent
#   k094 마라톤완주 (running): 거름 no_commercial_intent
#   k112 운동화 (running): 거름 too_broad
```

답 12개는 모두 스키마대로 읽혔고, 묶음마다 20개를 다 읽었습니다. 두 답의 keep 은 116개에서 같았고, 그 가운데 지도와 달력 2개는 reason_code 만 달랐습니다. 투표자 A 는 no_commercial_intent, 투표자 B 는 too_broad 로 거른 것입니다. keep 이 다른 키워드는 마라토너, 새벽러닝, 번역기, 러닝크루 4개였고, 읽지 못한 키워드는 없었습니다.

두 투표자는 따로 보면 각각 111개가 맞았고, health 6개는 둘 다 sensitive_health 로 걸렀습니다. 그런데 두 답이 같은 116개 가운데 7개가 정답과 달랐습니다. 운동화와 런솔은 둘 다 too_broad 로 걸렀습니다. 카페추천, 10km완주, 가계부앱, 쿠션팩트, 마라톤완주는 둘 다 no_commercial_intent 로 걸렀습니다. 이 7개는 두 답이 같아서 심판에게 가지 않습니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-interest-library-cards.html?embed=1&card=vote" height="480" loading="lazy" title="같은 묶음을 temperature 0 과 0.7 로 두 번 묻고 keep 이 같은지 보는 투표"></iframe>
<a class="demo-embed-open" href="demo-interest-library-cards.html" target="_blank" rel="noopener">↗ 카드 다섯 장 전체로 열기</a>
</div>

## 3. 답이 다른 것만 심판에게 보냅니다

**심판은 투표와 같은 시스템 메시지를 thinking 을 켜고 받아, 다른 답 4개를 한 번에 보았습니다. 넷 모두 남긴다고 답해 셋은 정답과 맞았고, noise 인 번역기는 틀렸습니다. 최종 결정은 정답과 112개가 맞아, 투표자 하나만 쓸 때의 111개보다 하나 많았습니다.**

심판의 프롬프트는 생성기가 voters 기록을 읽어 씁니다. 두 답의 keep 이 다르거나 읽지 못한 키워드를 id 차례로 20개씩 묶는데, 이번에는 4개라 묶음 하나였습니다. 시스템 메시지는 투표와 글자까지 같고, thinking 을 켜고 temperature 0 으로 보냈습니다. thinking 은 모델이 답 앞에 풀이 토큰을 먼저 쓰는 설정이고, 20주째 [LLM 모델 고르기](post.html?id=llm-model-selection) 편에서 보았습니다. `gen-ads-data.py --check` 는 voters 기록에서 심판 프롬프트를 다시 만들어 파일과 대조합니다.

Chen 외(2023)의 FrugalGPT 는 이런 순서를 LLM cascade 라고 부릅니다. 질의를 LLM 목록에 차례로 보내고, 앞 모델의 답이 믿을 만하면 거기서 멈춥니다. 앞의 몇 모델이 싸고 믿을 만한 답을 내면 질의 비용이 크게 준다고 적었습니다. 그 논문은 답이 믿을 만한지를 학습한 점수 함수로 정하고, 이 글은 두 투표의 keep 이 같은지로 정합니다.

최종 결정은 이렇게 합칩니다. keep 이 같았던 키워드는 투표자 A 의 답을, 심판에게 간 키워드는 심판의 답을 씁니다. 심판의 답도 읽지 못하면 그 키워드는 거릅니다. 맞은 수를 셀 때 읽지 못한 키워드는 틀린 답으로 칩니다.

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 심판 기록을 두 투표의 결정과 합쳐 최종 남김과 거름을 정하고, 정답과 맞은 수, 투표 둘과 심판의 출력 토큰과 시간을 센다.
# 기록 data/llm-records/interest-audience-library-referee.json 에서 옮김

# 1단계: 기록을 두고 심판의 답을 읽는다
# 심판에게는 앞 블록의 CONTESTED 를 id 차례로 20개씩 묶어 보냈다. 묶음 id 는 r1, r2… 이고 thinking 을 켜서 키가 r1|on|1 꼴이다.
# 시스템 메시지는 투표와 같아서 심판의 답도 read_decisions 로 읽는다.
RECORD = {"r1|on|1": "{\"decisions\": [{\"id\": \"k038\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k063\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k069\", \"keep\": true, \"reason_code\": \"commercial_interest\"}, {\"id\": \"k101\", \"keep\": true, \"reason_code\": \"commercial_interest\"}]}"}
USAGE = {"r1|on|1": [353, 3792, 248426, 14067]}

R_REF, U_REF = RECORD, USAGE
REF_BATCHES = [CONTESTED[i:i + 20] for i in range(0, len(CONTESTED), 20)]
REFEREE = {}                   # id → 심판의 답 (keep, reason_code)
for n, ids in enumerate(REF_BATCHES, 1):
    ans = read_decisions(R_REF[f'r{n}|on|1'], ids)
    REFEREE.update(ans or {})
    print(f'r{n}: 키워드 {len(ids)}개, ' + ('읽지 못한 답' if ans is None else f'{len(ans)}/{len(ids)} 읽음'))
for i in CONTESTED:
    print(f'  {i} {INFO[i][0]} ({INFO[i][1]}): 심판 {say(REFEREE.get(i))}, 정답 {"남김" if GOLD_KEEP[i] else "거름"}')
print(f'심판에게 보낸 키워드 {len(CONTESTED)}개 가운데 정답과 맞은 키워드 '
      f'{sum(i in REFEREE and REFEREE[i][0] == GOLD_KEEP[i] for i in CONTESTED)}개')

# 2단계: 최종 결정을 정한다
# keep 이 같았던 키워드는 투표자 A 의 답을, 심판에게 간 키워드는 심판의 답을 쓴다. 심판의 답도 읽지 못하면 거른다.
FINAL = {i: REFEREE.get(i) if i in CONTESTED else VOTES[i][0] for i in VOTES}
KEPT = [i for i in VOTES if FINAL[i] and FINAL[i][0]]
dropped = Counter(FINAL[i][1] if FINAL[i] else '읽지 못함' for i in VOTES if i not in KEPT)
print(f'남긴 키워드 {len(KEPT)}개, 거른 키워드 {len(VOTES) - len(KEPT)}개: '
      + ', '.join(f'{c} {dropped[c]}' for c in REASON_CODES[1:] + ['읽지 못함']))
broad = [INFO[i][0] for i in VOTES if GOLD_KEEP[i] and FINAL[i] == (False, 'too_broad')]
print(f'정답이 남김인데 too_broad 로 거른 키워드 {len(broad)}개: ' + ', '.join(broad))

# 3단계: 정답과 비교한다
# 읽지 못한 키워드는 틀린 답으로 센다. 틀린 키워드는 두 투표가 같아 심판에게 가지 않은 것과 심판이 정한 것으로 나눈다.
def hits(answers):
    return sum(answers[i] is not None and answers[i][0] == GOLD_KEEP[i] for i in VOTES)


print(f'맞음: 투표자 A 혼자 {hits({i: v[0] for i, v in VOTES.items()})}/120, 투표자 B 혼자 {hits({i: v[1] for i, v in VOTES.items()})}/120, '
      f'투표와 심판 {hits(FINAL)}/120')
for topic in ('health', 'noise'):
    ids = [i for i in VOTES if INFO[i][1] == topic]
    print(f'  {topic} {len(ids)}개 가운데 거른 키워드 {sum(i not in KEPT for i in ids)}개')
interest = [i for i in VOTES if GOLD_KEEP[i]]
print(f'  나머지 주제 {len(interest)}개 가운데 남긴 키워드 {sum(i in KEPT for i in interest)}개')
wrong = [i for i in VOTES if not (FINAL[i] and FINAL[i][0] == GOLD_KEEP[i])]
print(f'틀린 키워드 {len(wrong)}개: 두 투표가 같았던 것 {sum(i not in CONTESTED for i in wrong)}개, 심판이 정한 것 {sum(i in CONTESTED for i in wrong)}개')

# 4단계: 비용을 비교한다
# 투표 12번과 심판의 출력 토큰과 시간을 USAGE 에서 더한다. 시간은 이 맥에서 기록한 값이다.
# 심판 하나로 120개를 다 보는 기록은 받지 않았다. 그래서 「심판이 키워드 하나에 쓴 출력 토큰과 시간 × 120」으로 어림한다.
# 키워드 하나에 드는 값이 묶음의 크기와 상관없이 같다는 가정이다.
# 키워드 하나의 값은 두 답의 keep 이 다른 4개에서 잰다. 판단이 어려운 키워드라 120개 전체의 값보다 클 수 있다.
def total(usage):
    rows = list(usage.values())
    return len(rows), sum(r[1] for r in rows), sum(r[2] for r in rows) / 1000, sum(r[3] for r in rows)


n_vote, out_vote, sec_vote, _ = total(U_VOTE)
n_ref, out_ref, sec_ref, chars_ref = total(U_REF)
per_out, per_sec = out_ref / len(CONTESTED), sec_ref / len(CONTESTED)
print(f'투표 둘: 호출 {n_vote}번, 출력 {out_vote:,} 토큰, {sec_vote:,.1f}초')
print(f'심판: 호출 {n_ref}번, 키워드 {len(CONTESTED)}개, 출력 {out_ref:,} 토큰, {sec_ref:,.1f}초, thinking {chars_ref:,}자')
print(f'투표와 심판 합: 호출 {n_vote + n_ref}번, 출력 {out_vote + out_ref:,} 토큰, {sec_vote + sec_ref:,.1f}초')
print(f'심판 하나로 120개 어림: 키워드당 {per_out:,.0f} 토큰, {per_sec:,.1f}초 × 120 = 출력 {per_out * 120:,.0f} 토큰, '
      f'{per_sec * 120:,.1f}초 (투표와 심판의 {per_sec * 120 / (sec_vote + sec_ref):.1f}배)')

# 출력:
# 1단계 뜻: 심판은 4개를 모두 남겼고, noise 인 번역기 하나가 정답과 다르다.
# r1: 키워드 4개, 4/4 읽음
#   k038 마라토너 (running): 심판 남김 commercial_interest, 정답 남김
#   k063 새벽러닝 (running): 심판 남김 commercial_interest, 정답 남김
#   k069 번역기 (noise): 심판 남김 commercial_interest, 정답 거름
#   k101 러닝크루 (running): 심판 남김 commercial_interest, 정답 남김
# 심판에게 보낸 키워드 4개 가운데 정답과 맞은 키워드 3개
# 2단계 뜻: 최종 결정은 94개를 남기고, 정답이 남김인 2개를 too_broad 로 걸렀다.
# 남긴 키워드 94개, 거른 키워드 26개: sensitive_health 6, no_commercial_intent 17, too_broad 3, 읽지 못함 0
# 정답이 남김인데 too_broad 로 거른 키워드 2개: 런솔, 운동화
# 3단계 뜻: 투표와 심판은 112개를 맞혔고, 틀린 8개 가운데 7개는 심판에게 가지 않았다.
# 맞음: 투표자 A 혼자 111/120, 투표자 B 혼자 111/120, 투표와 심판 112/120
#   health 6개 가운데 거른 키워드 6개
#   noise 14개 가운데 거른 키워드 13개
#   나머지 주제 100개 가운데 남긴 키워드 93개
# 틀린 키워드 8개: 두 투표가 같았던 것 7개, 심판이 정한 것 1개
# 4단계 뜻: 심판 하나로 120개를 다 보는 어림은 투표와 심판을 합한 시간의 12.1배다.
# 투표 둘: 호출 12번, 출력 5,432 토큰, 366.8초
# 심판: 호출 1번, 키워드 4개, 출력 3,792 토큰, 248.4초, thinking 14,067자
# 투표와 심판 합: 호출 13번, 출력 9,224 토큰, 615.3초
# 심판 하나로 120개 어림: 키워드당 948 토큰, 62.1초 × 120 = 출력 113,760 토큰, 7,452.8초 (투표와 심판의 12.1배)
```

심판의 답은 4개 모두 읽혔고, 넷 모두 commercial_interest 로 남겼습니다. 마라토너, 새벽러닝, 러닝크루는 정답과 맞았고, 번역기는 정답이 noise 라 틀렸습니다. 번역기는 번역 도구를 찾는 말이지만, 번역기를 사려는 검색으로도 읽힙니다. 정답은 한 사람이 붙인 가상 값이라, 이런 키워드는 정답 쪽도 다시 볼 만합니다.

최종 결정은 94개를 남기고 26개를 걸러, 정답과 112개가 맞았습니다. health 6개는 모두, noise 는 14개 가운데 13개를 걸렀습니다. 나머지 주제는 100개 가운데 93개를 남겼습니다. 틀린 8개 가운데 7개는 두 투표가 같아 심판에게 가지 않은 키워드입니다. 그 가운데 운동화와 런솔은 too_broad 로 걸렀는데, 넓은 상품군과 서연 씨의 브랜드라서 관심사가 아닌 말은 아닙니다. 말이 넓은지는 묶기와 최소 크기가 정할 일이라, 거르기에서 too_broad 로 빼면 묶기는 그 말을 보지도 못합니다.

비용은 투표 12번이 출력 5,432 토큰과 366.8초, 심판 한 번이 3,792 토큰과 248.4초였습니다. 심판 하나로 120개를 다 보는 기록은 받지 않았으므로, 키워드당 948 토큰과 62.1초에 120 을 곱해 어림했습니다. 어림은 출력 113,760 토큰과 7,452.8초이고, 시간은 투표와 심판을 합한 615.3초의 12.1배입니다. 키워드 4개로 나눈 값이라, 부를 때마다 한 번씩 드는 몫이 있다면 20개씩 묶을 때 키워드당 값은 이보다 작습니다. 그 4개는 두 답의 keep 이 달라 심판에게 간, 판단이 어려운 키워드이기도 합니다. 쉬운 키워드가 대부분인 120개라면 키워드당 값이 더 작을 수 있어, 이 어림은 높게 나왔을 수 있습니다. 아래 표는 3절 블록의 출력을 한 줄씩 모은 것입니다.

| 방식 | 호출 | 출력 토큰 | 시간 | 정답과 맞은 수 |
|---|---|---|---|---|
| 투표 둘, thinking 끔 | 12번 | 5,432 | 366.8초 | 투표자마다 111/120 |
| 심판, thinking 켬 | 1번 | 3,792 | 248.4초 | 보낸 4개 가운데 3개 |
| 투표와 심판 | 13번 | 9,224 | 615.3초 | 112/120 |
| 심판 하나로 120개, 어림 | 기록 없음 | 113,760 | 7,452.8초 | 기록 없음 |

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-interest-library-cards.html?embed=1&card=referee" height="480" loading="lazy" title="두 답의 keep 이 다른 키워드 4개만 thinking 을 켠 심판에게 보내는 자리와 비용"></iframe>
<a class="demo-embed-open" href="demo-interest-library-cards.html" target="_blank" rel="noopener">↗ 카드 다섯 장 전체로 열기</a>
</div>

## 4. 묶고 이름을 붙이는 것은 LLM, 다시 나누고 합치는 것은 코드입니다

**남은 94개를 한 번에 주자 모델은 묶음 9개에 영어 이름을 붙였고, 키워드 4개는 어느 묶음에도 넣지 않았습니다. 8개 묶음은 정답 주제 하나로만 이루어졌고, office_supplies 하나에 버너, 토너, 번역기가 섞였습니다. 절반을 넘는 묶음이 없어서 코드는 나누지 않았습니다.**

묶기의 시스템 메시지는 남은 키워드를 관심사 오디언스로 묶고, 묶음마다 이름을 붙이게 했습니다. 한 묶음은 광고주가 고르는 관심사 하나이고, 이름은 영어 snake_case 로 받았습니다. snake_case 는 running_gear 처럼 소문자 낱말을 밑줄로 잇는 이름 꼴입니다. 키워드는 모두 한 묶음에 한 번씩 넣게 했고, thinking 은 껐습니다.

Wan 외(2024)의 TnT-LLM 은 LLM 이 라벨 체계를 여러 단계에 걸쳐 만들고 다듬게 합니다. 그다음 LLM 이 붙인 라벨로 가벼운 분류 모델을 학습시켜 많은 글에 씁니다. 이 글은 묶기를 한 번만 묻고, 다듬는 일 가운데 크기에 관한 것은 코드에 맡깁니다. 크기는 회원 수로 세야 하고, 같은 답에는 늘 같은 결과가 나와야 하기 때문입니다.

코드는 먼저 답을 읽습니다. 남긴 키워드가 아닌 id 는 빼고, 두 묶음에 든 id 는 처음 나온 묶음에만 둡니다. 어느 묶음에도 없는 키워드는 사전에 넣지 않고 따로 적습니다. 묶음의 회원 수는 그 묶음의 키워드를 한 번 이상 검색한 회원 수이고, 생성기가 만든 30일 검색 기록 전체에서 셉니다. 순도는 묶음에서 가장 많은 정답 주제의 몫입니다.

코드의 규칙은 둘입니다. 한 묶음이 남은 키워드의 절반을 넘으면, 정답과 상관없이 둘로 나눕니다. 키워드를 하루 검색 수 차례로 정렬해 앞 절반에는 이름 끝에 _head, 나머지에는 _tail 을 붙입니다. head 는 검색 수가 많은 쪽, tail 은 적은 쪽입니다. 회원이 20명이 안 되는 묶음은 회원이 가장 많이 겹치는 묶음에 합치고, 겹치는 회원이 없으면 버립니다. 차례와 동점을 정하는 법은 더 깊이 보기에 있습니다.

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 묶기 기록을 읽어 묶음마다 회원 수와 정답 주제 순도를 세고, 코드의 두 규칙(절반을 넘으면 나누기, 20명 미만은 합치거나 버리기)을 거쳐 최종 사전을 만든다.
# 기록 data/llm-records/interest-audience-library-groups.json 에서 옮김
import random
import re

# 1단계: 회원 2,000명과 30일 검색 기록을 만든다
# scripts/gen-ads-data.py 의 생성 코드를 글자 그대로 옮긴다. KEYWORDS 는 첫 블록의 것을 쓴다. 0번이 회원 A, 1번이 회원 B 다.

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
SEARCHERS = {kid: {n for n, m in enumerate(members) if kid in m['searches']} for kid in INFO}
print(f'회원 {len(members):,}명, 30일 검색 {sum(sum(m["searches"].values()) for m in members):,}번')

# 2단계: 묶기 답을 읽고 묶음마다 센다
# 답은 groups 목록이고 묶음마다 영어 snake_case 이름과 id 목록이 있다. 꼴이 다르면 None 이다.
# 남긴 키워드가 아닌 id 는 빼고, 두 번 나온 id 는 처음 나온 묶음에만 둔다. 어느 묶음에도 없는 키워드는 사전에 넣지 않는다.
# 회원 수는 그 묶음의 키워드를 30일 동안 한 번 이상 검색한 회원 수다. 순도는 가장 많은 정답 주제가 묶음에서 차지하는 몫이다.
RECORD = {"groups": "{\"groups\": [{\"name\": \"running_gear\", \"ids\": [\"k001\", \"k006\", \"k010\", \"k011\", \"k013\", \"k017\", \"k019\", \"k029\", \"k031\", \"k036\", \"k038\", \"k041\", \"k045\", \"k046\", \"k048\", \"k060\", \"k063\", \"k066\", \"k072\", \"k079\", \"k081\", \"k082\", \"k084\", \"k095\", \"k101\", \"k102\", \"k105\", \"k106\", \"k107\", \"k109\", \"k115\", \"k116\", \"k119\"]}, {\"name\": \"gaming_hardware\", \"ids\": [\"k005\", \"k016\", \"k027\", \"k053\", \"k076\", \"k088\", \"k117\"]}, {\"name\": \"camping_outdoor\", \"ids\": [\"k022\", \"k026\", \"k035\", \"k051\", \"k064\", \"k070\", \"k075\", \"k111\", \"k120\"]}, {\"name\": \"coffee_bakery\", \"ids\": [\"k002\", \"k018\", \"k025\", \"k033\", \"k039\", \"k065\", \"k108\"]}, {\"name\": \"travel_booking\", \"ids\": [\"k008\", \"k015\", \"k023\", \"k050\", \"k057\", \"k061\", \"k098\", \"k103\", \"k104\", \"k118\"]}, {\"name\": \"baby_care\", \"ids\": [\"k003\", \"k078\", \"k083\", \"k089\", \"k096\", \"k099\", \"k110\", \"k113\"]}, {\"name\": \"beauty_skincare\", \"ids\": [\"k024\", \"k032\", \"k052\", \"k085\", \"k090\", \"k092\"]}, {\"name\": \"finance_investment\", \"ids\": [\"k028\", \"k042\", \"k047\", \"k049\", \"k054\", \"k058\", \"k093\"]}, {\"name\": \"office_supplies\", \"ids\": [\"k021\", \"k056\", \"k069\"]}]}"}

NAME = re.compile(r'^[a-z][a-z0-9_]*$')


def read_groups(text):
    """묶기 답을 [(이름, id 목록)] 으로 읽는다. 꼴이 다르면 None 이다."""
    try:
        answer = json.loads(text)
    except ValueError:
        return None
    if not (isinstance(answer, dict) and set(answer) == {'groups'} and isinstance(answer['groups'], list)):
        return None
    out = []
    for g in answer['groups']:
        if not (isinstance(g, dict) and set(g) == {'name', 'ids'} and isinstance(g['name'], str) and NAME.match(g['name'])
                and isinstance(g['ids'], list) and all(isinstance(i, str) for i in g['ids'])):
            return None
        out.append((g['name'], g['ids']))
    return out


def audience(ids):
    """키워드 id 목록을 한 번 이상 검색한 회원 번호의 집합."""
    return set().union(*(SEARCHERS[i] for i in ids))


def purity(ids):
    """(가장 많은 정답 주제, 그 키워드 수)."""
    return Counter(INFO[i][1] for i in ids).most_common(1)[0]


raw = read_groups(RECORD['groups'])
GROUPS, placed = {}, set()     # 이름 → 남긴 키워드의 id 목록. 이름이 같으면 한 묶음이다
outside = repeated = 0
for name, ids in raw or []:
    for i in ids:
        if i not in KEPT:
            outside += 1
        elif i in placed:
            repeated += 1
        else:
            GROUPS.setdefault(name, []).append(i)
            placed.add(i)
missing = [i for i in KEPT if i not in placed]
print(f'묶음 {len(GROUPS)}개, 묶음에 든 키워드 {len(placed)}/{len(KEPT)}개, 남긴 목록 밖 id {outside}개, 두 번 나온 id {repeated}개')
print(f'어느 묶음에도 없는 키워드 {len(missing)}개: ' + ', '.join(INFO[i][0] for i in missing))
for name, ids in GROUPS.items():
    topic, n = purity(ids)
    line = f'  {name}: 키워드 {len(ids)}개, 회원 {len(audience(ids))}명, 순도 {n}/{len(ids)} {topic}'
    if n < len(ids):
        line += ' (' + ', '.join(f'{INFO[i][0]} {INFO[i][1]} {len(SEARCHERS[i])}명' for i in ids) + ')'
    print(line)

# 3단계: 남긴 키워드의 절반을 넘는 묶음을 나눈다
# 정답과 상관없이 크기만 본다. 하루 검색 수가 많은 차례로 정렬해 앞 절반(홀수면 하나 더)을 <이름>_head,
# 나머지를 <이름>_tail 로 둔다. 절반을 넘는 묶음이 없을 때까지 되풀이한다.
def split(ids):
    ranked = sorted(ids, key=lambda i: (-INFO[i][2], i))
    half = (len(ranked) + 1) // 2
    return ranked[:half], ranked[half:]


def resplit(groups, limit):
    while True:
        big = [g for g, ids in groups.items() if len(ids) > limit]
        if not big:
            return groups
        head, tail = split(groups[big[0]])
        groups = {k: v for g, ids in groups.items()
                  for k, v in ([(g + '_head', head), (g + '_tail', tail)] if g == big[0] else [(g, ids)])}


limit = len(KEPT) / 2
largest = max(GROUPS, key=lambda g: len(GROUPS[g]))
SPLIT = resplit(dict(GROUPS), limit)
print(f'절반 기준 {limit:g}개: 나눈 묶음 {len(SPLIT) - len(GROUPS)}개. 가장 큰 묶음은 {largest} {len(GROUPS[largest])}개')
head, tail = split(GROUPS[largest])
for part, ids in (('_head', head), ('_tail', tail)):
    print(f'  {largest} 를 나눈다면 {largest}{part}: 키워드 {len(ids)}개, 회원 {len(audience(ids))}명, '
          + ', '.join(INFO[i][0] for i in ids[:4]) + ' …')

# 4단계: 20명 미만인 묶음을 합치거나 버린다
# 회원이 가장 적은 묶음부터 하나씩 본다. 회원이 가장 많이 겹치는 묶음(이웃)에 합치고, 겹치는 회원이 없으면 버린다.
# 겹친 수가 같으면 회원이 많은 묶음, 그다음 이름 차례로 고른다. 20명 미만인 묶음이 없을 때까지 되풀이한다.
MIN_SIZE = 20                  # 표본 2,000명의 1%, 1,400만 명이면 14만 명이다


def neighbors(groups, g):
    """g 와 겹친 회원이 많은 차례의 [(겹친 회원 수, 이웃 이름)]."""
    mine = audience(groups[g])
    ranked = sorted((-len(mine & audience(ids)), -len(audience(ids)), h) for h, ids in groups.items() if h != g)
    return [(-shared, h) for shared, size, h in ranked]


def apply_min_size(groups):
    log = []
    while True:
        small = sorted((len(audience(ids)), g) for g, ids in groups.items() if len(audience(ids)) < MIN_SIZE)
        if not small:
            return groups, log
        size, g = small[0]
        near = neighbors(groups, g)
        if near and near[0][0] > 0:
            groups[near[0][1]] = groups[near[0][1]] + groups.pop(g)
            log.append(f'{g}({size}명) → {near[0][1]}')
        else:
            groups.pop(g)
            log.append(f'{g}({size}명) 버림')


LIBRARY, log = apply_min_size(dict(SPLIT))
smallest = min(SPLIT, key=lambda g: len(audience(SPLIT[g])))
print(f'최소 크기 {MIN_SIZE}명: 합치거나 버린 묶음 {len(log)}개' + (' (' + ', '.join(log) + ')' if log else '')
      + f'. 가장 작은 묶음은 {smallest} {len(audience(SPLIT[smallest]))}명')
print(f'  {smallest} 를 합친다면 회원이 겹치는 차례: ' + ', '.join(f'{h} {n}명' for n, h in neighbors(SPLIT, smallest)[:3]))

# 5단계: 최종 사전을 찍는다
# 회원 수에 7,000 을 곱해 회원 1,400만 명으로 늘린다(2,000명이 1,400만 명의 표본이다). 한 회원이 여러 오디언스에 들 수 있다.
for name, ids in sorted(LIBRARY.items(), key=lambda kv: -len(audience(kv[1]))):
    n = len(audience(ids))
    print(f'{name}: 키워드 {len(ids)}개, 회원 {n}명, 1,400만 명이면 {n * 7000:,}명')
print(f'오디언스 {len(LIBRARY)}개, 하나라도 든 회원 {len(audience([i for ids in LIBRARY.values() for i in ids])):,}명')

# 출력:
# 1단계 뜻: 회원 2,000명에게 30일 검색 20,783번이 붙는다.
# 회원 2,000명, 30일 검색 20,783번
# 2단계 뜻: 묶음 9개 가운데 8개는 주제 하나이고, office_supplies 는 번역기를 검색한 713명 때문에 가장 크다.
# 묶음 9개, 묶음에 든 키워드 90/94개, 남긴 목록 밖 id 0개, 두 번 나온 id 0개
# 어느 묶음에도 없는 키워드 4개: 스포츠선글라스, 보드게임, 무릎보호대, 스포츠워치
#   running_gear: 키워드 33개, 회원 271명, 순도 33/33 running
#   gaming_hardware: 키워드 7개, 회원 206명, 순도 7/7 game
#   camping_outdoor: 키워드 9개, 회원 384명, 순도 9/9 camping
#   coffee_bakery: 키워드 7개, 회원 612명, 순도 7/7 cafe
#   travel_booking: 키워드 10개, 회원 489명, 순도 10/10 travel
#   baby_care: 키워드 8개, 회원 158명, 순도 8/8 parenting
#   beauty_skincare: 키워드 6개, 회원 235명, 순도 6/6 beauty
#   finance_investment: 키워드 7개, 회원 246명, 순도 7/7 finance
#   office_supplies: 키워드 3개, 회원 795명, 순도 1/3 camping (버너 camping 78명, 토너 beauty 68명, 번역기 noise 713명)
# 3단계 뜻: 가장 큰 묶음이 33개라 절반 47개를 넘지 않아 나누지 않는다.
# 절반 기준 47개: 나눈 묶음 0개. 가장 큰 묶음은 running_gear 33개
#   running_gear 를 나눈다면 running_gear_head: 키워드 17개, 회원 245명, 러닝화, 워킹화, 런닝화, 스포츠웨어 …
#   running_gear 를 나눈다면 running_gear_tail: 키워드 16개, 회원 67명, 숲결러닝화, 런닝슈즈, 마라토너, 입문용러닝화 …
# 4단계 뜻: 가장 작은 baby_care 도 158명이라 합치지 않지만, 합쳤다면 육아와 상관없는 office_supplies 로 간다.
# 최소 크기 20명: 합치거나 버린 묶음 0개. 가장 작은 묶음은 baby_care 158명
#   baby_care 를 합친다면 회원이 겹치는 차례: office_supplies 62명, coffee_bakery 47명, travel_booking 31명
# 5단계 뜻: 최종 사전은 오디언스 9개이고, 1,400만 명 기준으로 1,106,000명에서 5,565,000명이다.
# office_supplies: 키워드 3개, 회원 795명, 1,400만 명이면 5,565,000명
# coffee_bakery: 키워드 7개, 회원 612명, 1,400만 명이면 4,284,000명
# travel_booking: 키워드 10개, 회원 489명, 1,400만 명이면 3,423,000명
# camping_outdoor: 키워드 9개, 회원 384명, 1,400만 명이면 2,688,000명
# running_gear: 키워드 33개, 회원 271명, 1,400만 명이면 1,897,000명
# finance_investment: 키워드 7개, 회원 246명, 1,400만 명이면 1,722,000명
# beauty_skincare: 키워드 6개, 회원 235명, 1,400만 명이면 1,645,000명
# gaming_hardware: 키워드 7개, 회원 206명, 1,400만 명이면 1,442,000명
# baby_care: 키워드 8개, 회원 158명, 1,400만 명이면 1,106,000명
# 오디언스 9개, 하나라도 든 회원 1,706명
```

모델은 묶음 9개를 냈고, 남긴 94개 가운데 90개를 넣었습니다. 스포츠선글라스, 보드게임, 무릎보호대, 스포츠워치 4개는 어느 묶음에도 없어 사전에 들어가지 않습니다. 시스템 메시지가 모두 넣으라고 적었어도, 빠진 키워드는 답을 세어 봐야 압니다. 9개 가운데 8개는 정답 주제 하나로만 이루어졌습니다. running_gear 는 러닝 키워드 33개, travel_booking 은 여행 키워드 10개입니다.

office_supplies 는 버너, 토너, 번역기 3개이고, 정답 주제가 camping, beauty, noise 로 모두 다릅니다. 토너는 사무용품으로도 읽히는 말이지만 이 사전에서는 화장품입니다. 회원은 795명으로 9개 가운데 가장 많고, 그 가운데 713명이 번역기를 검색한 회원입니다. 가장 큰 묶음 running_gear 는 33개라 절반인 47개를 넘지 않아 나누지 않았습니다. 나눴다면 head 17개는 러닝화, 워킹화처럼 검색이 많은 말로 245명이 됩니다. tail 16개는 숲결러닝화, 런닝슈즈처럼 검색이 적은 말로 67명입니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-interest-library-cards.html?embed=1&card=group" height="480" loading="lazy" title="모델이 붙인 묶음 아홉과 이름, 회원 수, 정답 주제 순도, 나누기 규칙"></iframe>
<a class="demo-embed-open" href="demo-interest-library-cards.html" target="_blank" rel="noopener">↗ 카드 다섯 장 전체로 열기</a>
</div>

## 5. 최소 크기 아래는 오디언스가 아닙니다

**최소 크기는 표본 2,000명의 1%인 20명이고, 회원 1,400만 명으로 늘리면 14만 명입니다. 가장 작은 baby_care 도 158명이라 합치거나 버린 묶음은 없었습니다. 최종 사전은 오디언스 9개이고, 회원 1,706명이 하나 이상에 들었습니다.**

이름이 있어도 회원이 너무 적으면 오디언스로 쓰기 어렵습니다. 하루 300만 원을 쓰려면 보여 줄 사람이 그만큼 있어야 합니다. 구매 1건에 2만 원을 거는 캠페인은 사람이 적으면 결과를 비교할 전환도 적습니다. 몇 사람만 든 묶음은 그 사람들이 무엇을 검색했는지 알려 주기도 합니다. 그래서 사전에 올리기 전에 회원 수로 아래 끝을 둡니다.

이 글의 아래 끝은 20명입니다. 표본 2,000명의 1%이고, 회원 1,400만 명으로 늘리면 14만 명입니다. [Lookalike 기초](post.html?id=lookalike-basics) 편에서 유사타겟 1% 가 회원 1,400만 명의 14만 명이었던 것과 같은 크기입니다. 표본의 회원 한 명이 회원 1,400만 명 가운데 7,000명을 대신하므로, 회원 수에 7,000 을 곱해 늘립니다.

이 기록에서는 20명이 안 되는 묶음이 없었습니다. 가장 작은 baby_care 도 158명이라, 규칙은 아무것도 합치거나 버리지 않았습니다. 다만 합쳤다면 어디로 갔을지 보면 규칙의 약한 곳이 보입니다. baby_care 와 회원이 가장 많이 겹치는 묶음은 office_supplies 로 62명입니다. 그다음이 coffee_bakery 47명, travel_booking 31명입니다. 회원 겹침으로 고른 이웃은 뜻이 가까운 묶음보다 회원이 많은 묶음 쪽으로 가기 쉽습니다. 육아와 상관없는 office_supplies 가 그 예입니다.

최종 사전은 모델이 낸 묶음 9개 그대로입니다. 아래 표는 4절 블록의 5단계가 찍은 값이고, 1,400만 명 칸은 회원 수에 7,000 을 곱한 값입니다. 한 회원이 여러 오디언스에 들 수 있어 회원 수를 더하면 2,000명을 넘고, 하나 이상에 든 회원은 1,706명입니다.

| 오디언스 | 키워드 | 회원(2,000명 가운데) | 1,400만 명이면 |
|---|---|---|---|
| office_supplies | 3개 | 795명 | 5,565,000명 |
| coffee_bakery | 7개 | 612명 | 4,284,000명 |
| travel_booking | 10개 | 489명 | 3,423,000명 |
| camping_outdoor | 9개 | 384명 | 2,688,000명 |
| running_gear | 33개 | 271명 | 1,897,000명 |
| finance_investment | 7개 | 246명 | 1,722,000명 |
| beauty_skincare | 6개 | 235명 | 1,645,000명 |
| gaming_hardware | 7개 | 206명 | 1,442,000명 |
| baby_care | 8개 | 158명 | 1,106,000명 |

서연 씨에게 바로 쓸모 있는 이름은 running_gear 입니다. 러닝 키워드 33개를 묶어 1,400만 명 기준 1,897,000명이고, 세그먼트 317 의 160만 명과 비슷한 크기입니다. 다만 세그먼트 317 은 행동 조건으로 만든 목록입니다. running_gear 는 키워드를 한 번 이상 검색한 회원이라 들어오는 사람이 다릅니다. 가장 큰 office_supplies 는 크기만 보면 가장 쓸 만해 보입니다. 하지만 795명 가운데 713명은 거르기에서 빠졌어야 할 번역기를 검색한 회원입니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-interest-library-cards.html?embed=1&card=size" height="480" loading="lazy" title="최소 크기 20명과 묶음마다의 회원 수, 1,400만 명으로 늘린 최종 사전"></iframe>
<a class="demo-embed-open" href="demo-interest-library-cards.html" target="_blank" rel="noopener">↗ 카드 다섯 장 전체로 열기</a>
</div>

## 6. 관심사 사전의 재료와 크기를 세는 단위가 무대마다 다릅니다

**거르고 묶고 회원 수로 자르는 순서는 두 무대가 같습니다. 담장 안은 회원이 쓴 검색어로 사전을 만들고 회원 번호로 셉니다. 열린 RTB 의 DSP 는 지면과 데이터 회사의 세그먼트로 사전을 채우고, 쿠키나 광고 ID 로 셉니다.**

1~5절의 셈은 두 무대가 같습니다. 두 무대의 이름은 18주째 [자연어 오디언스](post.html?id=natural-language-audience) 편 8절에서 풀었습니다. 다른 것은 키워드가 어디서 오고, 최소 크기를 무엇의 수로 세느냐입니다.

### 담장 안에서는 회원의 검색어로 사전을 만들고 회원 번호로 셉니다 [무대: 닫힌 생태계]

검색창을 가진 플랫폼은 회원이 쓴 검색어를 회원 번호와 함께 남깁니다. 그래서 이 글처럼 검색 기록에서 키워드를 뽑고, 묶음마다 검색한 회원을 번호로 셀 수 있습니다. 사전의 이름은 캠페인 화면에서 세그먼트 번호처럼 고르는 항목이 됩니다. 새 검색어가 쌓이면 사전을 다시 만들고, 그때도 두 답이 다른 키워드만 심판에게 보내면 심판 비용은 다른 답의 수만큼만 듭니다.

건강 키워드는 묶기 전에 빠져야 합니다. 건강은 사람을 고르는 데 쓰지 않는 민감한 정보이고, 30주째 편이 그 정책 문서와 함께 적었습니다. 이 기록에서는 두 투표가 health 6개를 모두 걸렀지만, 다시 물어도 그렇다는 보장은 없습니다. 그래서 모델의 거르기 뒤에도 30주째의 policy_filter 같은 코드 거르기를 한 번 더 두는 것이 안전합니다.

### 열린 RTB 에서는 세그먼트 이름을 표준 분류에 맞춥니다 [무대: 열린 RTB]

열린 RTB 의 DSP 에는 검색창이 없습니다. 키워드 대신 입찰 요청이 가리키는 지면의 글이 있고, 데이터 회사에서 산 오디언스 세그먼트가 있습니다. IAB Tech Lab 의 Audience Taxonomy 는 회사마다 다른 세그먼트 이름을 비교할 수 있게 공통 명명법을 정한 문서입니다. 그 Tier 1 표시는 세그먼트가 데모그래픽인지, 관심사인지, 구매 의도인지를 적습니다. 이 글의 영어 이름을 열린 RTB 에서 쓰려면 이런 표준 분류의 이름에 맞춰 적게 됩니다.

크기를 세는 단위도 다릅니다. DSP 는 쿠키나 기기의 광고 ID 로 사람을 알아보므로, 한 사람이 여러 ID 로 세어질 수 있습니다. 그래서 ID 20개는 사람 20명보다 적을 수 있습니다. 최소 크기 규칙은 그대로 두되, 무엇의 20인지를 사전과 함께 적어 둡니다. 아래 표는 가상 데이터가 아니라 두 무대의 설계 차이를 적은 것입니다.

| 무엇 | 담장 안 | 열린 RTB |
|---|---|---|
| 키워드가 오는 곳 | 회원이 쓴 검색어 | 지면의 글과 데이터 회사의 세그먼트 |
| 크기를 세는 단위 | 회원 번호 | 쿠키나 광고 ID |
| 사전의 이름 | 플랫폼이 정한다 | Audience Taxonomy 같은 표준 분류에 맞춘다 |
| 건강 키워드 | 묶기 전에 거른다 | 같은 기준으로 거른다 |

## 한눈 정리

| 자리 | 무엇을 하나 | 이 기록의 숫자 |
|---|---|---|
| 투표자 A | temperature 0, thinking 끔으로 20개씩 묻는다 | 맞음 111/120 |
| 투표자 B | 같은 묶음을 temperature 0.7 로 묻는다 | 맞음 111/120 |
| 두 답 비교 | keep 이 같으면 그대로, 다르면 심판에게 | 같음 116개, 코드만 다름 2개, 심판행 4개 |
| 심판 | 같은 시스템 메시지를 thinking 을 켜고 받는다 | 4개 가운데 3개 맞음, 248.4초 |
| 최종 거르기 | 투표와 심판을 합친다 | 맞음 112/120, 남김 94개, 615.3초 |
| 심판 하나로 120개 | 키워드당 값 × 120 으로 어림한다 | 7,452.8초 |
| 묶기 | 모델이 묶고 영어 이름을 붙인다 | 묶음 9개, 빠진 키워드 4개 |
| 나누기와 합치기 | 절반을 넘으면 나누고 20명 미만은 합친다 | 바뀐 묶음 0개 |
| 최종 사전 | 회원 수와 1,400만 명 기준 크기 | 오디언스 9개, 회원 1,706명 |

## 헷갈리기 쉬운 점

- **투표자 둘이 같은 모델이면 같은 실수를 같이 합니다.** 두 답이 같은 116개 가운데 7개가 정답과 달랐습니다. temperature 를 0.7 로 올려도 운동화와 런솔은 두 번 다 too_broad 였습니다. 두 답이 같다는 것은 맞았다는 뜻이 아니라, 이 모델이 그 키워드에서 흔들리지 않았다는 뜻입니다. 같은 실수를 잡으려면 다른 모델이나 사람이 표본을 따로 봅니다.
- **심판 비용은 다른 답의 비율이 정합니다.** 120개 가운데 4개만 달라 심판을 한 번 불렀고, 투표와 심판에 615.3초가 걸렸습니다. 키워드당 심판 값이 같다면 다른 답이 늘수록 심판 시간도 그만큼 늘어납니다. 모두 다르면 7,452.8초 어림에 다가가니, 투표자의 설정을 바꿀 때는 맞은 수와 함께 다른 답의 수를 봅니다.
- **이름은 LLM 이 붙여도 크기는 회원 수로 셉니다.** 모델은 키워드만 보고 회원을 보지 못하니, 묶음의 크기는 코드가 검색 기록에서 셉니다. 거꾸로 코드는 크기만 셀 뿐 이름이 맞는지는 모릅니다. office_supplies 는 키워드 3개로 795명이 되었고, 그 가운데 713명이 noise 인 번역기를 검색한 회원이었습니다. 이름과 키워드 목록은 사람이 함께 읽습니다.

## 더 깊이 보기

:::deep 투표와 심판 규칙 전문
기록에 보낸 시스템 메시지 둘입니다. 투표 12번과 심판 한 번은 첫째를, 묶기는 둘째를 받았습니다. 사용자 메시지는 첫 줄 「키워드 20개:」 아래에 「k001 러닝화」 꼴로 한 줄씩 적은 글입니다. 심판은 「키워드 4개:」, 묶기는 「남은 키워드 94개:」로 시작합니다. 세 프롬프트 파일은 `scripts/gen-ads-data.py --prompts` 가 씁니다. `--check` 는 파일 전체를 다시 만들어 대조합니다.

```text
너는 광고 플랫폼의 관심사 사전을 만드는 검수자다. 검색 로그에서 뽑은 키워드를 읽고, 키워드마다 관심사 오디언스를 만드는 데 남길지 거를지 정한다.
관심사 오디언스는 같은 관심사의 키워드를 검색한 회원의 묶음이고, 광고주가 광고를 보일 사람으로 고른다.
키워드마다 keep 과 reason_code 를 적는다. 남기면 keep 은 true, 거르면 false 다. reason_code 는 아래 넷 가운데 하나다.
commercial_interest: 상품이나 서비스를 사거나 쓰려는 관심이 드러나는 검색어다. 남긴다.
sensitive_health: 건강 상태, 증상, 질병을 드러내는 검색어다. 민감한 정보라 사람을 고르는 데 쓰지 않으므로 거른다.
no_commercial_intent: 사거나 쓰려는 뜻 없이 생활 정보나 도구를 찾는 검색어다. 거른다.
too_broad: 너무 넓어서 관심사 하나를 가리키지 못하는 검색어다. 거른다.
사용자 메시지의 키워드를 하나도 빠뜨리지 말고, 받은 차례대로 하나씩 적는다.
답은 아래 꼴의 JSON 한 줄로만 쓴다. 설명이나 다른 글은 붙이지 않는다.
{"decisions": [{"id": "<id>", "keep": true, "reason_code": "<commercial_interest|sensitive_health|no_commercial_intent|too_broad>"}]}
```

```text
너는 광고 플랫폼의 관심사 사전을 만든다. 거르기를 통과한 키워드를 관심사 오디언스로 묶고, 묶음마다 이름을 붙인다.
한 묶음은 광고주가 광고를 보일 사람으로 고르는 관심사 하나다. 같은 관심사를 가진 사람이 검색할 키워드를 한 묶음에 넣는다.
이름은 그 관심사를 가리키는 영어 snake_case 로 적는다. 소문자와 숫자와 밑줄만 쓴다.
사용자 메시지의 키워드는 모두 어느 한 묶음에 넣는다. 한 키워드를 두 묶음에 넣지 않는다.
답은 아래 꼴의 JSON 한 줄로만 쓴다. 설명이나 다른 글은 붙이지 않는다.
{"groups": [{"name": "<영어 snake_case>", "ids": ["<id>", "<id>"]}]}
```

투표의 규칙은 넷입니다. 첫째, 두 투표의 keep 이 같으면 그 답을 쓰고, reason_code 만 다르면 투표자 A 의 코드를 씁니다. 둘째, keep 이 다르면 심판에게 보냅니다. 셋째, 한 묶음의 답을 스키마대로 읽지 못하면 그 묶음 20개를 모두 심판에게 보냅니다. 넷째, 읽은 답에서 빠진 id 와 두 번 나온 id 는 그 키워드 하나만 심판에게 보냅니다. 심판의 답이 최종 결정이고, 심판의 답도 읽지 못한 키워드는 거릅니다.
:::

:::deep 다시 나누기와 합치기 규칙
코드의 두 규칙을 차례대로 적습니다. 둘 다 정답을 보지 않고, 같은 묶기 답에는 늘 같은 사전이 나옵니다.

다시 나누기는 남긴 키워드 수의 절반을 넘는 묶음을 찾습니다. 이 기록에서는 94개의 절반인 47개입니다. 그런 묶음은 키워드를 하루 검색 수가 많은 차례로 정렬하고, 검색 수가 같으면 id 차례로 둡니다. 앞 절반(홀수면 하나 더)은 이름 끝에 _head, 나머지는 _tail 을 붙여 두 묶음으로 바꿉니다. 나눈 뒤에도 절반을 넘는 묶음이 있으면 되풀이합니다. 이름은 코드가 붙여서 뜻을 담지 않으니, 뜻이 있는 이름이 필요하면 나눈 묶음을 모델이나 사람에게 다시 보냅니다.

합치기와 버리기는 나누기를 마친 묶음에서 회원이 20명 미만인 묶음을 찾습니다. 회원이 가장 적은 묶음부터, 같으면 이름 차례로 하나씩 봅니다. 그 묶음과 겹치는 회원이 가장 많은 묶음에 키워드를 옮기고, 받는 쪽의 이름을 그대로 씁니다. 겹친 수가 같으면 회원이 많은 묶음, 그다음 이름 차례로 고릅니다. 겹치는 회원이 없으면 그 묶음을 버립니다. 20명 미만인 묶음이 없을 때까지 되풀이하고, 남은 묶음이 사전이 됩니다.
:::

:::deep 기록한 방법과 이 기록으로 말할 수 없는 것
세 기록은 2026-11-07 에 차례로 받았습니다. 투표 12번을 먼저 받고, 생성기가 그 기록에서 심판 프롬프트를 썼습니다. 심판을 받은 뒤 생성기가 두 기록으로 남긴 키워드를 정해 묶기 프롬프트를 썼고, 묶기를 받았습니다. 앞 기록을 다시 받으면 뒤 프롬프트와 뒤 기록도 다시 받습니다. thinking 을 켠 심판은 시간 초과 없이 한 번에 받아, 묶음을 반으로 나눠 다시 보낼 일이 없었습니다.

시스템 메시지를 고쳐 다시 기록하지 않은 까닭도 적어 둡니다. 이 블로그는 temperature 0 의 기준 답이 스키마대로 읽히지 않을 때만 프롬프트를 고칩니다. 투표자 A 의 답 6개, 심판의 답, 묶기의 답이 모두 읽혔습니다. 운동화를 거른 답이나 office_supplies 를 보고 시스템 메시지를 고치면, 정답을 보고 고친 프롬프트가 됩니다.

이 기록으로 말할 수 없는 것도 셋입니다. 투표자 B 는 temperature 0.7 에서 한 번만 뽑아서, 다시 기록하면 다른 4개가 달라질 수 있습니다. 정답은 한 사람이 붙인 가상 값이라, 번역기처럼 다른 사람은 다르게 붙일 키워드가 있습니다. 심판 하나로 120개를 보는 값은 기록이 아니라 키워드당 값에서 늘린 어림입니다.
:::

- [키워드 확장 전략](post.html?id=keyword-expansion-strategies) — 같은 키워드 120개에서 러닝화 광고의 키워드를 고르고, health 와 noise 를 코드로 거른 30주째 편입니다.
- [유저를 문서로](post.html?id=users-as-documents) — 회원 2,000명의 30일 검색 기록이 처음 나온 29주째 편입니다.
- [LLM-as-a-Judge](post.html?id=llm-as-a-judge) — 모델에게 판정을 맡기고 사람의 판정과 맞춰 본 26주째 편입니다.
- [관심사 사전 카드 다섯 장](demo-interest-library-cards.html) — 이 글의 카드 전체입니다. 카드를 누르면 헷갈리는 것 하나가 더 나옵니다.

## 참고문헌

- Wan, M., Safavi, T., Jauhar, S. K., et al. (2024). *TnT-LLM: Text Mining at Scale with Large Language Models*. arXiv:2403.12173. [arxiv.org](https://arxiv.org/abs/2403.12173). LLM 이 라벨 체계를 여러 단계의 추론으로 만들고 다듬은 뒤, LLM 라벨로 가벼운 분류 모델을 학습시키는 방법입니다. Bing Copilot 의 사용자 의도와 대화 분야 분석에 썼다고 적었습니다.
- Wang, X., Wei, J., Schuurmans, D., et al. (2022). *Self-Consistency Improves Chain of Thought Reasoning in Language Models*. arXiv:2203.11171. ICLR 2023. [arxiv.org](https://arxiv.org/abs/2203.11171). 풀이 하나를 고르는 대신 여러 풀이를 뽑고, 가장 일관된 답을 고르는 방법입니다.
- Chen, L., Zaharia, M., Zou, J. (2023). *FrugalGPT: How to Use Large Language Models While Reducing Cost and Improving Performance*. arXiv:2305.05176. [arxiv.org](https://arxiv.org/abs/2305.05176). 비용을 줄이는 전략 셋 가운데 LLM cascade 는 질의를 LLM 목록에 차례로 보내고, 답이 믿을 만하면 멈춥니다. 답이 믿을 만한지는 점수 함수가 정합니다.
- IAB Tech Lab. *Audience Taxonomy*. [iabtechlab.com](https://iabtechlab.com/standards/audience-taxonomy/). 회사마다 다른 오디언스 세그먼트 이름에 공통 명명법을 정한 문서입니다. Data Transparency Standard 의 핵심 요소이고, Tier 1 표시가 데모그래픽, 관심사, 구매 의도를 구분합니다. 최신 버전은 2020년 10월의 1.1 입니다.
