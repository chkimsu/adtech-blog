모델 팀 30주째 월요일, 서연 씨가 지훈 씨에게 상품 설명 한 단락을 보냈습니다. 새 러닝화 「런솔 라이트」의 설명으로, 입문자용이고 쿠션 폼을 깔았다고 적혀 있습니다. 지난주의 검색어 목록은 손으로 적어서 빠진 말이 많다고 했습니다.

선배는 검색어가 나오는 길을 일곱 갈래로 나눠 모델에게 물어보라고 했습니다. 상품의 이름, 같이 사는 물건, 사는 사람이 겪는 문제마다 떠오르는 말이 다르기 때문입니다. 다만 말을 지어내지 않게, 하루 검색 수를 아는 검색어 120개 안에서만 고르게 했습니다.

**일곱 갈래로 고른 검색어 가운데 무엇을 그대로 쓰고, 무엇을 코드가 걸러야 할까요?**

광고 하나에서 살 만한 검색어를 늘리는 일을 키워드 확장(keyword expansion)이라고 부르고, 갈래 하나를 전략이라고 부릅니다. 고른 검색어는 하루 300만 원이 쓰일 자리를 정합니다. 건강처럼 사람을 고르는 데 쓰면 안 되는 말이 섞이면, 그 목록으로 만든 명단은 쓸 수 없습니다.

> **한 줄 요약:** 서연 씨 러닝화의 상품 설명과 키워드 120개를 qwen3.5:27b 에 주고, 전략 일곱의 키워드를 사전의 id 로 고르게 했습니다. 한 번에 일곱을 맡긴 기록 2개와 전략마다 따로 부른 기록 14개이고, 답 16개가 모두 스키마대로 읽혔습니다. 한 번에 맡기면 모델은 direct 를 런솔 라이트라는 그 상품으로 읽어, 러닝화 같은 정답 direct 를 하나도 맞히지 못했습니다. thinking 을 끄고 따로 부르면 direct 가 러닝화를 받아, 맞은 수의 합이 27개에서 30개로 늘었습니다. 대신 서로의 답을 모르는 전략끼리 id 14개가 겹쳤습니다. problem_goal 은 네 설정 모두 무릎통증 같은 health 키워드를 끌어왔습니다. 코드가 겹침을 하나로 남기고 health 와 noise 를 뺀 최종 목록은 34, 15, 30, 26개였습니다. 가장 많이 남긴 것은 출력 토큰과 시간이 가장 적은, 한 번에 thinking 을 끄고 물은 답입니다.

> **골라 읽는 법** — 절이 6개입니다. 절마다 표나 코드나 카드가 있어 그것만 보고 넘어가도 됩니다.
>
> - 전략 일곱의 정의와 사전 속 정답 → 1절
> - 지어내게 하지 않고 사전에서 고르게 한 까닭 → 2절
> - 한 번에 일곱 전략을 맡긴 기록과 direct 를 읽은 방식 → 3절
> - 전략마다 따로 부른 기록, 겹침, 비용 → 4절
> - 코드가 하는 정책 거르기와 겹침 빼기, 최종 목록 → 5절
> - 담장 안과 열린 RTB 에서 달라지는 것 → 6절

이 글의 상품 설명, 키워드 120개, 정답 전략, 하루 검색 수는 설명을 위해 만든 가상 데이터입니다. 키워드는 `scripts/gen-ads-data.py` 가 만들고, 첫 블록은 그 리터럴을 글자 그대로 옮겼습니다. LLM 의 답만은 지어낸 값이 아닙니다. 2026-11-07 에 이 블로그를 쓰는 맥에서 Ollama 로 qwen3.5:27b 를 띄워 기록했습니다. 두 벌 모두 temperature 0, seed 7 이고, thinking 을 끈 것과 켠 것을 한 번씩 보냈습니다. 기록 파일 둘은 `data/llm-records/` 에 있고, 이름 끝이 all, each 입니다. 카드 속 파랑은 사전과 정답과 코드가 남긴 키워드, 벽돌색은 모델이 고른 키워드입니다. 회색은 정책 거르기로 빠지는 health 키워드이고, 점선 상자는 시스템 메시지에 적어 둔 정의입니다.

---

## 1. 전략 일곱은 광고 하나에서 출발합니다

**전략 일곱은 같은 상품 설명을 서로 다른 질문으로 읽습니다. 상품을 부르는 이름을 묻는 direct 부터 경쟁 브랜드까지 묻는 brand 까지, 전략마다 사전의 다른 키워드가 답이 됩니다.**

서연 씨가 보낸 상품 설명은 200자 안팎의 네 문장입니다. 첫 문장은 「런솔 라이트는 달리기를 처음 시작하는 사람을 위한 입문자용 러닝화입니다.」입니다. 밑창 전체의 쿠션 폼, 한 짝 240g 의 무게, 발볼이 넓은 사람도 편한 앞코, 사이즈와 교환 조건이 뒤를 잇습니다. 브랜드 이름 런솔과 상품의 사실은 모두 가상입니다.

검색어를 넓히는 길은 여러 갈래입니다. 상품을 부르는 다른 이름(조깅화), 상품이 속한 더 넓은 상품군(운동화), 같이 사는 물건(러닝양말)이 있습니다. 사는 사람이 풀려는 문제(무릎보호대), 사는 사람이 어떤 사람인지(초보러너), 브랜드(런솔), 세부 제품(쿠션러닝화)도 있습니다. 이 글은 이 일곱 갈래를 전략이라고 부르고, 모델이 답에 쓰는 영어 이름을 그대로 씁니다.

키워드는 29주째 [유저를 문서로](post.html?id=users-as-documents) 편에서 회원의 문서를 만들 때 쓴 120개입니다. 키워드마다 주제, 정답 전략, 하루 검색 수가 붙어 있고, 모두 설명을 위해 만든 가상 데이터입니다. 주제는 러닝, 캠핑 같은 관심사 8개에 health 와 noise 를 더한 10개입니다. noise 는 날씨, 뉴스, 택배조회처럼 무언가를 사려는 뜻, 곧 상업 의도(commercial intent)가 없는 말입니다.

정답 전략은 서연 씨 러닝화를 기준으로 붙인 값입니다. 러닝 키워드 40개가 전략 일곱에 나뉘고, 나머지 키워드는 정답 전략이 없습니다. 다만 problem_goal 의 정답에는 러닝 키워드 6개 말고 health 키워드 4개도 들어 있습니다. 무릎통증, 족저근막염 같은 증상은 러닝화를 찾는 까닭이 될 수 있어서입니다. 이 넷을 어떻게 다루는지는 5절에서 봅니다.

아래 표는 시스템 메시지에 적은 정의를 줄인 것과, 사전에서 정답이 그 전략인 예와 수입니다. 정답 수는 3절 코드의 1단계가 찍은 값입니다. 정답이 있는 키워드는 모두 44개입니다.

| 전략 | 묻는 것 | 사전 속 정답의 예 | 정답 수 |
|---|---|---|---|
| direct | 상품을 바로 가리키는 말. 표기만 다르거나 뜻이 같은 말도 든다 | 러닝화, 런닝화, 조깅화 | 7 |
| category | 상품이 속한 더 넓은 상품군이나 옆 상품군 | 운동화, 워킹화, 트레일러닝화 | 6 |
| co_purchase | 이 상품을 사는 사람이 함께 사는 다른 상품 | 러닝양말, 러닝벨트, 스포츠워치 | 6 |
| problem_goal | 사는 사람이 풀려는 문제나 이루려는 목표 | 무릎보호대, 10km완주, 무릎통증 | 10 |
| persona | 사는 사람이 어떤 사람인지. 경력, 습관, 모임 | 초보러너, 주말러너, 러닝크루 | 5 |
| brand | 광고주의 브랜드와 경쟁하는 다른 브랜드 | 런솔, 모노웍스러닝화, 숲결러닝화 | 4 |
| product_line | 기능, 용도, 소재, 모양으로 나눈 세부 제품 | 쿠션러닝화, 와이드러닝화, 카본러닝화 | 6 |

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-keyword-expansion-cards.html?embed=1&card=strategies" height="480" loading="lazy" title="상품 설명 하나를 전략 일곱으로 읽고 사전에서 답이 되는 키워드"></iframe>
<a class="demo-embed-open" href="demo-keyword-expansion-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 2. 만들게 하지 않고 사전에서 고르게 합니다

**모델에게 검색어를 지어내게 하면 검색량을 모르는 말이 섞이고, 맞았는지도 사람이 읽어야 압니다. 이 글은 하루 검색 수를 아는 키워드 120개를 사전으로 주고 id 만 받았습니다. 그래서 고른 id 로 코드가 정답 전략과 하루 검색 수를 바로 셉니다.**

검색 광고는 광고주가 산 키워드와 사람이 쓴 검색어를 맞춰 광고를 보입니다. Google Ads 문서는 맞추는 방식을 셋으로 적었습니다. broad match 는 키워드와 관련된 검색어에도, phrase match 는 키워드의 뜻을 담은 검색어에 광고를 보입니다. exact match 는 뜻이나 의도가 같은 검색어에만 보이고, 셋 가운데 닿는 검색어가 가장 적습니다. 어느 방식이든 사람들이 실제로 쓰는 검색어가 있어야 광고가 나갈 자리가 생깁니다.

모델에게 검색어를 자유롭게 지어내게 할 수도 있습니다. Jagerman 외(2023)는 검색 질의를 LLM 에게 넓히게 하고 프롬프트 셋을 비교했습니다. 그 가운데 21주째 [프롬프트와 Chain-of-Thought](post.html?id=prompting-chain-of-thought) 편에서 본 CoT 프롬프트가 특히 쓸모 있었다고 적었습니다. 논문은 질의 확장을 검색 시스템의 재현율(recall)을 올리는 방법으로 소개합니다. 재현율은 찾아야 할 문서 가운데 실제로 찾은 비율입니다. 광고 키워드는 돈을 내고 사는 말이라 사정이 다릅니다. 모델이 지어낸 말은 하루에 몇 번 검색되는지 아무도 모르고, 표기가 조금만 달라도 아무도 쓰지 않는 말일 수 있습니다.

그래서 이 글은 사전을 줍니다. 사용자 메시지에 상품 설명과 키워드 120개를 「k001 러닝화」 꼴로 한 줄씩 적고, 모델은 id 만 돌려줍니다. 주제, 정답 전략, 하루 검색 수는 보내지 않습니다. 고른 id 를 사전과 이으면 정답 전략과 맞았는지, 하루 검색 수의 합이 얼마인지 코드가 바로 셉니다. 사전에 없는 id 가 오면 코드가 빼고 그 수를 따로 셉니다.

사전에도 대가가 있습니다. 사전에 없는 말은 아무리 잘 맞아도 고를 수 없습니다. 새로 뜨는 검색어를 놓치지 않으려면 검색 기록에서 사전을 자주 다시 만들어야 합니다. 31주째 관심사 사전 편은 같은 키워드 120개를 이 글과 같은 기준으로 거르고 묶어, 이름 붙은 오디언스로 만듭니다.

아래 표는 두 방식을 한 줄씩 놓은 것입니다. 이 글의 기록은 오른쪽 칸의 방식으로만 받았습니다.

| 무엇 | 자유 생성 | 사전에서 고르기 |
|---|---|---|
| 모델이 돌려주는 것 | 검색어 문자열 | 사전의 id |
| 검색량 | 모른다. 따로 찾아봐야 한다 | 사전에 적힌 하루 검색 수 |
| 맞았는지 | 사람이 읽고 판단한다 | 코드가 정답 전략과 비교한다 |
| 사전에 없는 말 | 새 말을 찾을 수 있다 | 고를 수 없다. 사전 밖 id 는 코드가 뺀다 |
| 정책 거르기 | 문자열마다 주제를 다시 정해야 한다 | id 의 주제로 코드가 바로 거른다 |

## 3. 한 번에 일곱 전략을 맡기면 direct 에 브랜드가 들어옵니다

**전략 일곱을 한 번에 맡긴 답은 thinking 을 끄면 서로 다른 키워드 38개를, 켜면 17개를 골랐습니다. 두 답 모두 direct 에 런솔 같은 이 상품의 이름을 적어, 러닝화 같은 정답 direct 는 하나도 맞지 않았습니다. thinking 을 끈 답은 problem_goal 에 health 키워드 4개를 넣었습니다.**

한 번에 맡기는 시스템 메시지는 1절의 정의 일곱을 적고, 사전에 있는 키워드만 id 로 고르게 했습니다. 한 키워드가 두 전략에 다 맞으면 둘 다 넣어도 된다고 적었고, reason 은 영어 6낱말 이하로 받았습니다. 답의 꼴은 picks 목록 하나이고, 전략 일곱을 정의의 차례대로 하나씩 적게 했습니다. 시스템 메시지 전문은 끝의 더 깊이 보기에 있습니다.

채점은 블록이 합니다. 답을 스키마대로 읽고, 고른 id 마다 사전의 정답 전략과 주제를 붙여 셉니다. 스키마로 읽는 법과 읽지 못한 답을 세는 법은 22주째 [구조화 출력](post.html?id=structured-output) 편에서 보았습니다. thinking 을 켜면 모델이 답 앞에 풀이 토큰을 먼저 쓰고, 그 말은 20주째 [LLM 모델 고르기](post.html?id=llm-model-selection) 편에서 풀었습니다.

```python
# 하는 일: 전략 일곱을 한 번에 맡긴 기록 2개를 스키마대로 읽고, 전략마다 고른 수와 정답 전략과 맞은 수, health 와 noise 를 고른 수를 센다.
# 기록 data/llm-records/keyword-expansion-strategies-all.json 에서 옮김
import json
from collections import Counter

# 1단계: 키워드 사전, 전략 일곱, 기록을 둔다
# KEYWORDS 는 scripts/gen-ads-data.py 의 리터럴을 글자 그대로 옮겼다. (id, 검색어, 주제, 정답 전략, 하루 검색 수) 이고 값은 모두 가상이다.
# 기록의 키는 thinking 을 끈 답이 all, 켠 답이 all|on|1 이다. USAGE 의 네 값은 입력 토큰, 출력 토큰, 걸린 ms, thinking 글자 수다.
# 뒤 블록이 RECORD 와 USAGE 를 다시 쓰므로 R_ALL, U_ALL 로 옮겨 둔다.
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
STRATEGIES = ['direct', 'category', 'co_purchase', 'problem_goal', 'persona', 'brand', 'product_line']
RECORD = {"all": "{\"picks\": [{\"strategy\": \"direct\", \"ids\": [\"k020\", \"k048\"], \"reason\": \"Exact brand and product name\"}, {\"strategy\": \"category\", \"ids\": [\"k001\", \"k006\", \"k011\", \"k017\", \"k019\", \"k029\", \"k031\", \"k084\", \"k095\", \"k112\"], \"reason\": \"Broader shoe categories and synonyms\"}, {\"strategy\": \"co_purchase\", \"ids\": [\"k010\", \"k013\", \"k060\", \"k073\", \"k079\", \"k107\", \"k119\"], \"reason\": \"Items bought with running shoes\"}, {\"strategy\": \"problem_goal\", \"ids\": [\"k009\", \"k012\", \"k059\", \"k068\", \"k080\", \"k094\"], \"reason\": \"Pain relief and running goals\"}, {\"strategy\": \"persona\", \"ids\": [\"k038\", \"k045\", \"k046\", \"k101\"], \"reason\": \"Runner types and communities\"}, {\"strategy\": \"brand\", \"ids\": [\"k020\", \"k048\"], \"reason\": \"Brand name matches only\"}, {\"strategy\": \"product_line\", \"ids\": [\"k036\", \"k041\", \"k081\", \"k102\", \"k105\", \"k106\", \"k109\", \"k115\", \"k116\"], \"reason\": \"Specific shoe features and types\"}]}", "all|on|1": "{\"picks\": [{\"strategy\": \"direct\", \"ids\": [\"k048\", \"k102\"], \"reason\": \"Exact product name match\"}, {\"strategy\": \"category\", \"ids\": [\"k001\", \"k006\", \"k095\"], \"reason\": \"General shoe categories\"}, {\"strategy\": \"co_purchase\", \"ids\": [\"k013\", \"k079\", \"k060\"], \"reason\": \"Running gear accessories\"}, {\"strategy\": \"problem_goal\", \"ids\": [\"k009\", \"k068\", \"k059\"], \"reason\": \"Pain relief or goals\"}, {\"strategy\": \"persona\", \"ids\": [\"k045\", \"k046\"], \"reason\": \"Target user demographics\"}, {\"strategy\": \"brand\", \"ids\": [\"k020\"], \"reason\": \"Brand name search\"}, {\"strategy\": \"product_line\", \"ids\": [\"k116\", \"k109\", \"k115\"], \"reason\": \"Specific feature based types\"}]}"}
USAGE = {"all": [1529, 381, 34255, 0], "all|on|1": [1527, 4691, 334182, 13563]}
R_ALL, U_ALL = RECORD, USAGE
INFO = {kid: (text, topic, gold, daily) for kid, text, topic, gold, daily in KEYWORDS}
GOLD_N = Counter(gold for kid, text, topic, gold, daily in KEYWORDS)
topic_n = Counter(topic for kid, text, topic, gold, daily in KEYWORDS)
print(f'사전 {len(INFO)}개: running {topic_n["running"]}, health {topic_n["health"]}, noise {topic_n["noise"]}, '
      f'나머지 주제 {len(INFO) - topic_n["running"] - topic_n["health"] - topic_n["noise"]}')
print('정답 전략: ' + ', '.join(f'{s} {GOLD_N[s]}' for s in STRATEGIES) + f', 전략 없음 {GOLD_N["none"]}')
print('problem_goal 정답 가운데 health: '
      + ', '.join(f'{kid} {t}' for kid, (t, topic, g, d) in INFO.items() if g == 'problem_goal' and topic == 'health'))

# 2단계: 답을 스키마대로 읽는다
# picks 는 strategy, ids, reason 셋만 가진 객체의 목록이고, wanted 의 전략이 하나씩 빠짐없이 나와야 한다.
# 꼴이 다르면 None 이고, 읽지 못한 답은 고른 것이 없는 틀린 답으로 센다. 한 전략 안에서 겹친 id 는 하나로 센다.
# 사전에 없는 id 는 빼서 따로 둔다. reason 은 코드가 채점하지 않고 그대로 옮긴다.
def read_picks(text, wanted):
    """답 하나를 {전략: (사전 안의 id 목록, 사전 밖 id 목록, reason)} 으로 읽는다. 꼴이 다르면 None 이다."""
    try:
        a = json.loads(text)
    except ValueError:
        return None
    if not (isinstance(a, dict) and set(a) == {'picks'} and isinstance(a['picks'], list)):
        return None
    out = {}
    for p in a['picks']:
        if not (isinstance(p, dict) and set(p) == {'strategy', 'ids', 'reason'} and p['strategy'] in wanted
                and p['strategy'] not in out and isinstance(p['reason'], str)
                and isinstance(p['ids'], list) and all(isinstance(i, str) for i in p['ids'])):
            return None
        ids = list(dict.fromkeys(p['ids']))
        out[p['strategy']] = ([i for i in ids if i in INFO], [i for i in ids if i not in INFO], p['reason'])
    return out if set(out) == set(wanted) else None


PICKS = {}                     # 설정 이름 → {전략: 읽은 답 또는 None}. 뒤 블록이 두 설정을 더한다
for name, key in (('한 번에, thinking 끔', 'all'), ('한 번에, thinking 켬', 'all|on|1')):
    ans = read_picks(R_ALL[key], STRATEGIES)
    PICKS[name] = ans if ans else {s: None for s in STRATEGIES}
    tokens_in, tokens_out, ms, chars = U_ALL[key]
    print(f'{name}: 읽지 못한 답 {int(ans is None)}개, 입력 {tokens_in:,} 토큰, 출력 {tokens_out:,} 토큰, {ms / 1000:.1f}초, thinking {chars:,}자')

# 3단계: 전략마다 센다
# 맞음은 고른 id 가운데 정답 전략이 그 전략인 수이고, 분모는 사전에서 그 전략이 정답인 키워드 수다.
# 끝 줄은 일곱 전략이 고른 id 를 합친 서로 다른 키워드 수와 그 하루 검색 수의 합이다.
def report(name, picks):
    print(name)
    for s in STRATEGIES:
        if picks[s] is None:
            print(f'  {s}: 읽지 못한 답, 맞음 0/{GOLD_N[s]}')
            continue
        ids, outside, reason = picks[s]
        hit = sum(INFO[i][2] == s for i in ids)
        health = sum(INFO[i][1] == 'health' for i in ids)
        noise = sum(INFO[i][1] == 'noise' for i in ids)
        print(f'  {s}: 고름 {len(ids)}, 맞음 {hit}/{GOLD_N[s]}, health {health}, noise {noise}, 사전 밖 {len(outside)}, reason "{reason}"')
    chosen = [i for v in picks.values() if v for i in v[0]]
    hits = sum(INFO[i][2] == s for s in STRATEGIES if picks[s] for i in picks[s][0])
    distinct = set(chosen)
    print(f'  고른 id {len(chosen)}개, 맞음 합 {hits}/{sum(GOLD_N[s] for s in STRATEGIES)}, '
          f'서로 다른 키워드 {len(distinct)}개, 하루 검색 수 합 {sum(INFO[i][3] for i in distinct):,}')


for name in PICKS:
    report(name, PICKS[name])

# 4단계: 정답이 direct 와 brand 인 키워드가 어느 전략에 들어갔는지 본다
# 키워드마다 그 id 를 고른 전략을 적고, 어느 전략도 고르지 않았으면 없음이다.
for name, picks in PICKS.items():
    for g in ('direct', 'brand'):
        where = [f'{t} {"/".join(s for s in STRATEGIES if picks[s] and kid in picks[s][0]) or "없음"}'
                 for kid, (t, topic, gold, d) in INFO.items() if gold == g]
        print(f'{name}, 정답 {g}: ' + ', '.join(where))

# 출력:
# 1단계 뜻: 사전 120개 가운데 정답 전략이 있는 키워드는 44개이고, problem_goal 의 정답 10개에는 health 넷이 든다.
# 사전 120개: running 40, health 6, noise 14, 나머지 주제 60
# 정답 전략: direct 7, category 6, co_purchase 6, problem_goal 10, persona 5, brand 4, product_line 6, 전략 없음 76
# problem_goal 정답 가운데 health: k009 무릎통증, k012 발목염좌, k068 족저근막염, k080 정강이통증
# 2단계 뜻: 두 답 모두 스키마대로 읽힌다. thinking 을 켜면 출력 토큰과 시간이 크게 늘어난다.
# 한 번에, thinking 끔: 읽지 못한 답 0개, 입력 1,529 토큰, 출력 381 토큰, 34.3초, thinking 0자
# 한 번에, thinking 켬: 읽지 못한 답 0개, 입력 1,527 토큰, 출력 4,691 토큰, 334.2초, thinking 13,563자
# 3단계 뜻: 끈 답은 40개를 골라 27개가 맞고, 켠 답은 17개를 골라 13개가 맞는다. direct 는 둘 다 0/7 이다.
# 한 번에, thinking 끔
#   direct: 고름 2, 맞음 0/7, health 0, noise 0, 사전 밖 0, reason "Exact brand and product name"
#   category: 고름 10, 맞음 4/6, health 0, noise 0, 사전 밖 0, reason "Broader shoe categories and synonyms"
#   co_purchase: 고름 7, 맞음 5/6, health 0, noise 0, 사전 밖 0, reason "Items bought with running shoes"
#   problem_goal: 고름 6, 맞음 6/10, health 4, noise 0, 사전 밖 0, reason "Pain relief and running goals"
#   persona: 고름 4, 맞음 4/5, health 0, noise 0, 사전 밖 0, reason "Runner types and communities"
#   brand: 고름 2, 맞음 2/4, health 0, noise 0, 사전 밖 0, reason "Brand name matches only"
#   product_line: 고름 9, 맞음 6/6, health 0, noise 0, 사전 밖 0, reason "Specific shoe features and types"
#   고른 id 40개, 맞음 합 27/44, 서로 다른 키워드 38개, 하루 검색 수 합 227,600
# 한 번에, thinking 켬
#   direct: 고름 2, 맞음 0/7, health 0, noise 0, 사전 밖 0, reason "Exact product name match"
#   category: 고름 3, 맞음 1/6, health 0, noise 0, 사전 밖 0, reason "General shoe categories"
#   co_purchase: 고름 3, 맞음 3/6, health 0, noise 0, 사전 밖 0, reason "Running gear accessories"
#   problem_goal: 고름 3, 맞음 3/10, health 2, noise 0, 사전 밖 0, reason "Pain relief or goals"
#   persona: 고름 2, 맞음 2/5, health 0, noise 0, 사전 밖 0, reason "Target user demographics"
#   brand: 고름 1, 맞음 1/4, health 0, noise 0, 사전 밖 0, reason "Brand name search"
#   product_line: 고름 3, 맞음 3/6, health 0, noise 0, 사전 밖 0, reason "Specific feature based types"
#   고른 id 17개, 맞음 합 13/44, 서로 다른 키워드 17개, 하루 검색 수 합 96,900
# 4단계 뜻: 끈 답에서 정답 direct 는 category 와 product_line 으로 갔고, 경쟁 브랜드 둘은 두 답 모두 brand 에 들지 않았다.
# 한 번에, thinking 끔, 정답 direct: 러닝화 category, 조깅화 category, 런닝화 category, 런닝슈즈 category, 러닝슈즈 category, 달리기신발 category, 마라톤화 product_line
# 한 번에, thinking 끔, 정답 brand: 런솔 direct/brand, 모노웍스러닝화 product_line, 런솔러닝화 direct/brand, 숲결러닝화 product_line
# 한 번에, thinking 켬, 정답 direct: 러닝화 category, 조깅화 category, 런닝화 없음, 런닝슈즈 없음, 러닝슈즈 없음, 달리기신발 없음, 마라톤화 없음
# 한 번에, thinking 켬, 정답 brand: 런솔 brand, 모노웍스러닝화 없음, 런솔러닝화 direct, 숲결러닝화 없음
```

두 답 모두 스키마대로 읽혔고, 사전 밖 id 는 0개였습니다. thinking 을 끈 답은 고른 id 40개 가운데 27개가 정답 전략과 맞았습니다. co_purchase 는 5/6, persona 는 4/5, product_line 은 6/6 이 맞았습니다. problem_goal 은 6/10 이 맞았는데, 그 여섯 가운데 넷이 무릎통증, 발목염좌 같은 health 키워드입니다.

direct 는 두 답 모두 0/7 이었습니다. thinking 을 끈 답은 direct 에 런솔과 런솔러닝화를 적었습니다. 그 reason 은 「Exact brand and product name」이었습니다. 정의의 「광고하는 상품」을 러닝화라는 종류가 아니라 런솔 라이트라는 그 상품으로 읽은 것입니다. 정답 direct 일곱 가운데 여섯은 category 로, 마라톤화는 product_line 으로 갔습니다. 정답은 종류를, 모델은 그 상품을 기준으로 삼았고, 정의 한 줄은 둘 다로 읽힙니다.

brand 도 좁게 읽었습니다. 정의는 경쟁하는 다른 브랜드까지 넣으라고 했습니다. 그런데 thinking 을 끈 답의 brand 는 런솔과 런솔러닝화 둘뿐이었습니다. reason 은 「Brand name matches only」였습니다. 경쟁 브랜드인 모노웍스러닝화와 숲결러닝화는 product_line 에 들어갔습니다. 경쟁 브랜드의 키워드를 살지는 광고주가 정할 일이라, 이 차이는 reason 과 목록을 사람이 읽어야 보입니다.

thinking 을 켠 답은 훨씬 적게 골랐습니다. 서로 다른 키워드가 17개로 끈 답의 절반이 안 되고, 맞은 수의 합도 13개였습니다. 풀이는 13,563자였고, 시간은 끈 답의 34.3초에서 334.2초로 늘었습니다. Jagerman 외는 CoT 프롬프트가 원래 질의와 관련된 낱말을 많이 내게 해서 확장에 잘 맞았다고 적었습니다. 이 기록의 thinking 은 반대로 범위를 좁혔습니다. 고른 17개에는 입문용러닝화, 쿠션러닝화처럼 상품 설명과 바로 맞는 말이 들어 있었습니다.

## 4. 전략마다 따로 부르면 맞는 수가 늘고 겹침도 늘어납니다

**전략마다 따로 부르자 맞은 수의 합이 thinking 을 끄면 27개에서 30개로, 켜면 13개에서 29개로 늘었습니다. 따로 물은 direct 는 러닝화 같은 정답을 6개와 5개 맞혔습니다. 대신 전략끼리 서로의 답을 모르니, thinking 을 끈 답에서는 id 14개가 두 전략 이상에 들었습니다.**

전략마다 부르는 시스템 메시지는 정의 일곱을 한 글자도 바꾸지 않고, 할 일을 적은 줄만 고쳤습니다. 사용자 메시지 끝의 「전략: direct」 같은 줄이 이번에 고를 전략 하나를 정합니다. 같은 상품 설명과 사전을 일곱 번 보내고, thinking 을 끈 것과 켠 것을 한 번씩 받아 기록은 14개입니다. 블록은 3절의 표를 같은 함수로 다시 그리고, 겹친 id 와 비용을 더 셉니다.

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 전략마다 따로 부른 기록 14개를 같은 표로 세고, 전략 사이에 겹친 id 와 두 방식의 출력 토큰과 시간을 비교한다.
# 기록 data/llm-records/keyword-expansion-strategies-each.json 에서 옮김
import re

# 1단계: 기록을 둔다
# 항목 id 는 전략 이름이다. thinking 을 끈 답은 direct, 켠 답은 direct|on|1 꼴의 키를 갖는다.
# 한글은 기록 16개의 답을 모두 센다. 답은 영어와 id 로만 받기로 했다.
RECORD = {"direct": "{\"picks\": [{\"strategy\": \"direct\", \"ids\": [\"k001\", \"k006\", \"k011\", \"k019\", \"k020\", \"k029\", \"k031\", \"k048\", \"k084\", \"k102\"], \"reason\": \"Direct product name and synonyms\"}]}", "direct|on|1": "{\"picks\": [{\"strategy\": \"direct\", \"ids\": [\"k020\", \"k048\", \"k001\", \"k011\", \"k029\", \"k031\", \"k084\", \"k102\", \"k116\"], \"reason\": \"Brand name and category synonyms\"}]}", "category": "{\"picks\": [{\"strategy\": \"category\", \"ids\": [\"k001\", \"k006\", \"k011\", \"k017\", \"k019\", \"k029\", \"k031\", \"k036\", \"k041\", \"k048\", \"k081\", \"k084\", \"k095\", \"k102\", \"k105\", \"k106\", \"k109\", \"k112\", \"k115\", \"k116\"], \"reason\": \"broader shoe categories and synonyms\"}]}", "category|on|1": "{\"picks\": [{\"strategy\": \"category\", \"ids\": [\"k001\", \"k095\", \"k112\", \"k006\", \"k072\", \"k017\"], \"reason\": \"Broader footwear types and related categories\"}]}", "co_purchase": "{\"picks\": [{\"strategy\": \"co_purchase\", \"ids\": [\"k013\", \"k060\", \"k073\", \"k079\", \"k119\"], \"reason\": \"items bought with running shoes\"}]}", "co_purchase|on|1": "{\"picks\": [{\"strategy\": \"co_purchase\", \"ids\": [\"k013\", \"k060\", \"k073\", \"k079\", \"k119\"], \"reason\": \"Items bought with running shoes\"}]}", "problem_goal": "{\"picks\": [{\"strategy\": \"problem_goal\", \"ids\": [\"k009\", \"k012\", \"k068\", \"k080\"], \"reason\": \"keywords for pain relief goals\"}]}", "problem_goal|on|1": "{\"picks\": [{\"strategy\": \"problem_goal\", \"ids\": [\"k009\", \"k012\", \"k068\", \"k080\", \"k059\", \"k094\"], \"reason\": \"Addresses pain and running goals\"}]}", "persona": "{\"picks\": [{\"strategy\": \"persona\", \"ids\": [\"k038\", \"k045\", \"k046\", \"k101\"], \"reason\": \"Target runner types and groups\"}]}", "persona|on|1": "{\"picks\": [{\"strategy\": \"persona\", \"ids\": [\"k045\", \"k046\", \"k101\"], \"reason\": \"Identifies buyer habits and groups.\"}]}", "brand": "{\"picks\": [{\"strategy\": \"brand\", \"ids\": [\"k020\", \"k048\"], \"reason\": \"Brand name and product line\"}]}", "brand|on|1": "{\"picks\": [{\"strategy\": \"brand\", \"ids\": [\"k020\", \"k048\"], \"reason\": \"Matches advertiser brand name\"}]}", "product_line": "{\"picks\": [{\"strategy\": \"product_line\", \"ids\": [\"k102\", \"k105\", \"k109\", \"k115\", \"k116\"], \"reason\": \"cushion, light, wide, entry shoes\"}]}", "product_line|on|1": "{\"picks\": [{\"strategy\": \"product_line\", \"ids\": [\"k048\", \"k102\", \"k109\", \"k115\", \"k116\"], \"reason\": \"Sub-products defined by features and brand\"}]}"}
USAGE = {"direct": [1553, 84, 15902, 0], "direct|on|1": [1551, 6294, 421505, 18347], "category": [1553, 145, 19062, 0], "category|on|1": [1551, 4393, 289747, 13767], "co_purchase": [1554, 55, 4083, 0], "co_purchase|on|1": [1552, 3680, 241798, 10903], "problem_goal": [1554, 49, 3566, 0], "problem_goal|on|1": [1552, 4833, 317433, 14136], "persona": [1553, 48, 3442, 0], "persona|on|1": [1551, 4005, 263095, 12739], "brand": [1553, 36, 2636, 0], "brand|on|1": [1551, 2415, 157992, 8591], "product_line": [1554, 60, 4161, 0], "product_line|on|1": [1552, 4400, 288949, 13913]}
R_EACH, U_EACH = RECORD, USAGE
hangul = sum(len(re.findall('[가-힣]', t)) for t in list(R_ALL.values()) + list(R_EACH.values()))
print(f'기록 {len(R_ALL)} + {len(R_EACH)}개, 답에 든 한글 {hangul}자')

# 2단계: 같은 표로 센다
# 그 전략 하나만 적은 답이어야 읽는다. 읽지 못한 전략은 고른 것이 없는 것으로 센다.
for think, tail in (('끔', ''), ('켬', '|on|1')):
    name = f'전략마다 따로, thinking {think}'
    PICKS[name] = {}
    for s in STRATEGIES:
        ans = read_picks(R_EACH[s + tail], [s])
        PICKS[name][s] = ans[s] if ans else None
    print(f'{name}: 읽지 못한 답 {sum(v is None for v in PICKS[name].values())}개')
    report(name, PICKS[name])
reason_words = [len(v[2].split()) for picks in PICKS.values() for v in picks.values() if v]
print(f'네 설정의 reason {len(reason_words)}개, 낱말 수 {min(reason_words)}~{max(reason_words)}')

# 3단계: 전략 사이에 겹친 id 를 센다
# 두 전략 이상이 고른 id 다. 네 설정을 나란히 놓고, 겹친 id 를 고른 전략의 묶음마다 모아 적는다.
def overlaps(picks):
    seen = {}
    for s in STRATEGIES:
        for i in (picks[s][0] if picks[s] else []):
            seen.setdefault(i, []).append(s)
    return {i: ss for i, ss in seen.items() if len(ss) > 1}


for name, picks in PICKS.items():
    groups = {}
    for i, ss in overlaps(picks).items():
        groups.setdefault('/'.join(ss), []).append(INFO[i][0])
    print(f'{name}: 겹친 id {sum(len(v) for v in groups.values())}개'
          + ''.join(f'\n  {k} {len(v)}개: {", ".join(v)}' for k, v in groups.items()))

# 4단계: 한 번 부를 때와 일곱 번 부를 때의 토큰과 시간을 비교한다
# USAGE 의 입력 토큰, 출력 토큰, 걸린 시간, thinking 글자 수를 더한다. 시간은 이 맥에서 기록한 값이다.
def usage_line(table, keys):
    rows = [table[k] for k in keys]
    return (f'호출 {len(rows)}번, 입력 {sum(r[0] for r in rows):,} 토큰, 출력 {sum(r[1] for r in rows):,} 토큰, '
            f'{sum(r[2] for r in rows) / 1000:,.1f}초, thinking {sum(r[3] for r in rows):,}자')


print('한 번에, thinking 끔: ' + usage_line(U_ALL, ['all']))
print('한 번에, thinking 켬: ' + usage_line(U_ALL, ['all|on|1']))
print('전략마다 따로, thinking 끔: ' + usage_line(U_EACH, STRATEGIES))
print('전략마다 따로, thinking 켬: ' + usage_line(U_EACH, [s + '|on|1' for s in STRATEGIES]))

# 출력:
# 1단계 뜻: 기록 16개의 답에 한글은 0자다.
# 기록 2 + 14개, 답에 든 한글 0자
# 2단계 뜻: 따로 부르면 맞음 합이 30과 29로 늘고 direct 가 6/7, 5/7 을 맞힌다. reason 은 모두 6낱말 이하다.
# 전략마다 따로, thinking 끔: 읽지 못한 답 0개
# 전략마다 따로, thinking 끔
#   direct: 고름 10, 맞음 6/7, health 0, noise 0, 사전 밖 0, reason "Direct product name and synonyms"
#   category: 고름 20, 맞음 4/6, health 0, noise 0, 사전 밖 0, reason "broader shoe categories and synonyms"
#   co_purchase: 고름 5, 맞음 5/6, health 0, noise 0, 사전 밖 0, reason "items bought with running shoes"
#   problem_goal: 고름 4, 맞음 4/10, health 4, noise 0, 사전 밖 0, reason "keywords for pain relief goals"
#   persona: 고름 4, 맞음 4/5, health 0, noise 0, 사전 밖 0, reason "Target runner types and groups"
#   brand: 고름 2, 맞음 2/4, health 0, noise 0, 사전 밖 0, reason "Brand name and product line"
#   product_line: 고름 5, 맞음 5/6, health 0, noise 0, 사전 밖 0, reason "cushion, light, wide, entry shoes"
#   고른 id 50개, 맞음 합 30/44, 서로 다른 키워드 34개, 하루 검색 수 합 221,000
# 전략마다 따로, thinking 켬: 읽지 못한 답 0개
# 전략마다 따로, thinking 켬
#   direct: 고름 9, 맞음 5/7, health 0, noise 0, 사전 밖 0, reason "Brand name and category synonyms"
#   category: 고름 6, 맞음 4/6, health 0, noise 0, 사전 밖 0, reason "Broader footwear types and related categories"
#   co_purchase: 고름 5, 맞음 5/6, health 0, noise 0, 사전 밖 0, reason "Items bought with running shoes"
#   problem_goal: 고름 6, 맞음 6/10, health 4, noise 0, 사전 밖 0, reason "Addresses pain and running goals"
#   persona: 고름 3, 맞음 3/5, health 0, noise 0, 사전 밖 0, reason "Identifies buyer habits and groups."
#   brand: 고름 2, 맞음 2/4, health 0, noise 0, 사전 밖 0, reason "Matches advertiser brand name"
#   product_line: 고름 5, 맞음 4/6, health 0, noise 0, 사전 밖 0, reason "Sub-products defined by features and brand"
#   고른 id 36개, 맞음 합 29/44, 서로 다른 키워드 30개, 하루 검색 수 합 225,600
# 네 설정의 reason 28개, 낱말 수 3~6
# 3단계 뜻: 따로 부른 답은 서로의 답을 모르니 겹친 id 가 14개와 5개다. 한 번에 부른 답은 2개와 0개다.
# 한 번에, thinking 끔: 겹친 id 2개
#   direct/brand 2개: 런솔, 런솔러닝화
# 한 번에, thinking 켬: 겹친 id 0개
# 전략마다 따로, thinking 끔: 겹친 id 14개
#   direct/category 7개: 러닝화, 조깅화, 런닝화, 트레일러닝화, 런닝슈즈, 러닝슈즈, 달리기신발
#   direct/brand 1개: 런솔
#   direct/category/brand 1개: 런솔러닝화
#   direct/category/product_line 1개: 입문용러닝화
#   category/product_line 4개: 데일리러닝화, 경량러닝화, 와이드러닝화, 쿠션러닝화
# 전략마다 따로, thinking 켬: 겹친 id 5개
#   direct/brand 1개: 런솔
#   direct/brand/product_line 1개: 런솔러닝화
#   direct/category 1개: 러닝화
#   direct/product_line 2개: 입문용러닝화, 쿠션러닝화
# 4단계 뜻: 따로 부르면 입력이 10,874 토큰으로 늘고, thinking 을 켠 일곱 번은 1,980.5초가 걸린다.
# 한 번에, thinking 끔: 호출 1번, 입력 1,529 토큰, 출력 381 토큰, 34.3초, thinking 0자
# 한 번에, thinking 켬: 호출 1번, 입력 1,527 토큰, 출력 4,691 토큰, 334.2초, thinking 13,563자
# 전략마다 따로, thinking 끔: 호출 7번, 입력 10,874 토큰, 출력 477 토큰, 52.9초, thinking 0자
# 전략마다 따로, thinking 켬: 호출 7번, 입력 10,860 토큰, 출력 30,020 토큰, 1,980.5초, thinking 92,396자
```

14개 답이 모두 읽혔고, 기록 16개의 답에 든 한글은 0자였습니다. 가장 크게 바뀐 것은 direct 입니다. 따로 물은 direct 는 thinking 을 끄면 10개를 골라 정답 7개 가운데 6개를 맞혔습니다. 한 번에 물을 때 category 로 가던 러닝화, 조깅화, 런닝화가 이번에는 direct 에 들어왔습니다. 그래도 런솔과 런솔러닝화는 두 설정 모두 direct 에 남았습니다. 정의 한 줄을 그 상품과 상품의 종류 양쪽으로 읽은 것입니다.

category 는 thinking 을 끄면 20개를 골랐습니다. 정답 category 6개 가운데 4개를 맞혔고, 러닝화나 쿠션러닝화처럼 다른 전략의 정답도 함께 골랐습니다. 그래서 겹친 id 가 14개로 늘었습니다. 러닝화처럼 direct 와 category 둘에 든 id 가 7개입니다. 쿠션러닝화처럼 category 와 product_line 둘에 든 id 는 4개입니다. 런솔러닝화와 입문용러닝화는 세 전략에 들었습니다.

대신 호출이 일곱 번입니다. 상품 설명과 사전을 일곱 번 보내니 입력은 1,529 토큰에서 10,874 토큰으로 늘었습니다. thinking 을 끈 일곱 번은 합해서 52.9초, 켠 일곱 번은 1,980.5초가 걸렸습니다. 켠 쪽은 출력 토큰이 30,020개, 풀이가 92,396자였습니다. 기록의 출력 토큰에는 풀이 토큰도 들어 있습니다. 사전이 길어질수록 이 입력은 전략 수만큼 곱해집니다.

따로 부를 때는 thinking 을 켜도 고른 수가 한 번에 물을 때만큼 줄지 않았습니다. 맞은 수의 합은 30개와 29개, 서로 다른 키워드는 34개와 30개였습니다. 한 번에 물을 때 17개까지 줄었던 것과 다릅니다. thinking 을 켠 category 는 6개만 골랐고, 겹친 id 도 5개였습니다. 아래 표는 네 설정을 3절과 4절 블록의 출력으로 한 줄씩 모은 것입니다.

| 설정 | 호출 | 출력 토큰 | 시간 | 맞음 합 | 서로 다른 키워드 | 겹친 id |
|---|---|---|---|---|---|---|
| 한 번에, thinking 끔 | 1번 | 381 | 34.3초 | 27/44 | 38개 | 2개 |
| 한 번에, thinking 켬 | 1번 | 4,691 | 334.2초 | 13/44 | 17개 | 0개 |
| 전략마다, thinking 끔 | 7번 | 477 | 52.9초 | 30/44 | 34개 | 14개 |
| 전략마다, thinking 켬 | 7번 | 30,020 | 1,980.5초 | 29/44 | 30개 | 5개 |

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-keyword-expansion-cards.html?embed=1&card=one_vs_each" height="480" loading="lazy" title="한 번에 일곱 전략을 물을 때와 전략마다 따로 물을 때의 호출, 시간, 맞은 수"></iframe>
<a class="demo-embed-open" href="demo-keyword-expansion-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-keyword-expansion-cards.html?embed=1&card=overlap" height="480" loading="lazy" title="전략마다 따로 부른 답에서 두 전략 이상이 고른 키워드"></iframe>
<a class="demo-embed-open" href="demo-keyword-expansion-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 5. 정책 거르기와 겹침 빼기는 코드가 합니다

**코드는 고른 id 를 전략 차례로 합쳐 겹침을 하나로 남기고, policy_filter 로 health 와 noise 를 뺍니다. 네 설정의 최종 목록은 34, 15, 30, 26개였고, 모델은 noise 를 한 번도 고르지 않았습니다. thinking 을 끄고 따로 부른 problem_goal 은 health 넷만 골라, 거르고 나면 비었습니다.**

모델이 고른 id 는 코드가 두 번 거른 뒤에 씁니다. 먼저 전략 차례로 이어 붙여 겹친 id 를 하나로 남기고, 그다음 policy_filter 로 health 와 noise 를 뺍니다. policy_filter 는 id 목록을 받아 남긴 목록과 빠진 이유별 목록을 돌려줍니다. 빠진 이유는 둘입니다. 민감한 정보라서 빠지는 sensitive_health 와, 상업 의도가 없어서 빠지는 no_commercial_intent 입니다.

기준은 일부러 단순하게 두었습니다. 사전의 주제가 health 나 noise 면 빼고, 나머지는 남깁니다. 같은 id 목록에는 언제나 같은 결과가 나오고, 함수 열 줄을 읽으면 무엇이 빠지는지 누구나 압니다. 31주째 관심사 사전 편도 같은 기준으로 거릅니다. 정책이 바뀌면 이 함수 하나를 고치고, 기록을 다시 받지 않아도 같은 답에서 새 목록이 나옵니다.

이 기록의 시스템 메시지에는 정책 줄을 넣지 않았습니다. 모델이 건강 키워드를 얼마나 끌어오는지 그대로 보려는 것이었습니다. 정책 줄을 넣더라도 코드 거르기는 그대로 둡니다. 모델이 그 줄을 지켰는지는 답을 받아 봐야 알고, 그것을 확인하는 일이 결국 이 함수입니다.

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 네 설정의 답을 전략 차례로 합쳐 겹침을 하나로 남기고, health 와 noise 를 빼서 최종 목록의 수와 하루 검색 수 합, 빠진 이유별 수를 센다.

# 1단계: 정책 거르기를 둔다
# health 는 민감한 정보라 sensitive_health, noise 는 상업 의도가 없어 no_commercial_intent 로 빼고 나머지는 남긴다.
# 들어오는 id 는 사전 안의 것이어야 한다. 사전 밖 id 는 앞 블록의 read_picks 가 이미 뺐다.
def policy_filter(ids):
    """id 목록을 (남긴 id 목록, {빠진 이유: id 목록}) 으로 나눈다. 차례는 들어온 차례 그대로다."""
    kept, dropped = [], {'sensitive_health': [], 'no_commercial_intent': []}
    for kid in ids:
        topic = INFO[kid][1]
        if topic == 'health':
            dropped['sensitive_health'].append(kid)
        elif topic == 'noise':
            dropped['no_commercial_intent'].append(kid)
        else:
            kept.append(kid)
    return kept, dropped


# 2단계: 겹침을 하나로 남긴다
# direct 부터 product_line 까지 전략 차례로 이어 붙이고, 앞 전략에 이미 든 id 는 뒤 전략에서 뺀다.
def merge(picks):
    """(전략 차례로 합친 서로 다른 id 목록, 고른 id 의 수)."""
    merged, total = [], 0
    for s in STRATEGIES:
        for i in (picks[s][0] if picks[s] else []):
            total += 1
            if i not in merged:
                merged.append(i)
    return merged, total


# 3단계: 네 설정의 최종 목록을 센다
# 빠진 이유는 overlap, sensitive_health, no_commercial_intent 셋이다.
# 정답이 있는 러닝 키워드 40개 가운데 최종 목록에 든 수와 빠진 키워드, 정답 전략이 없는데 남은 키워드도 센다.
RUNNING_IDS = [kid for kid, (t, topic, g, d) in INFO.items() if topic == 'running']
for name, picks in PICKS.items():
    merged, total = merge(picks)
    kept, dropped = policy_filter(merged)
    stray = [i for i in kept if INFO[i][2] == 'none']
    missed = [INFO[i][0] for i in RUNNING_IDS if i not in kept]
    print(f'{name}: 고른 id {total}개 → 겹침 빼고 {len(merged)}개 → 최종 {len(kept)}개, 하루 검색 수 합 {sum(INFO[i][3] for i in kept):,}')
    print(f'  빠진 이유: overlap {total - len(merged)}, '
          + ', '.join(f'{why} {len(ids)}' + (f' ({", ".join(INFO[i][0] for i in ids)})' if ids else '') for why, ids in dropped.items()))
    print(f'  러닝 키워드 {len(RUNNING_IDS)}개 가운데 최종 목록에 든 수 {len(RUNNING_IDS) - len(missed)}, '
          f'정답 전략이 없는데 남은 키워드 {len(stray)}개' + (f' ({", ".join(INFO[i][0] for i in stray)})' if stray else ''))
    print(f'  빠진 러닝 키워드: ' + ', '.join(missed))

# 4단계: problem_goal 의 답이 거르기 뒤에 얼마나 남는지 본다
# 전략 하나의 id 를 그대로 policy_filter 에 넣는다. 남는 것이 없으면 그 전략은 목록에 아무것도 보태지 못한다.
for name, picks in PICKS.items():
    chosen = picks['problem_goal'][0] if picks['problem_goal'] else []
    left = policy_filter(chosen)[0]
    print(f'{name}: problem_goal {len(chosen)}개 가운데 남는 키워드 {len(left)}개' + (f' ({", ".join(INFO[i][0] for i in left)})' if left else ''))

# 출력:
# 3단계 뜻: 최종 목록은 34, 15, 30, 26개이고 noise 와 정답 없는 키워드는 0개다. 한 번에 thinking 을 끈 답이 가장 많이 남긴다.
# 한 번에, thinking 끔: 고른 id 40개 → 겹침 빼고 38개 → 최종 34개, 하루 검색 수 합 208,900
#   빠진 이유: overlap 2, sensitive_health 4 (무릎통증, 발목염좌, 족저근막염, 정강이통증), no_commercial_intent 0
#   러닝 키워드 40개 가운데 최종 목록에 든 수 34, 정답 전략이 없는데 남은 키워드 0개
#   빠진 러닝 키워드: 스포츠선글라스, 새벽러닝, 아치깔창, 무릎보호대, 워킹화, 스포츠웨어
# 한 번에, thinking 켬: 고른 id 17개 → 겹침 빼고 17개 → 최종 15개, 하루 검색 수 합 82,000
#   빠진 이유: overlap 0, sensitive_health 2 (무릎통증, 족저근막염), no_commercial_intent 0
#   러닝 키워드 40개 가운데 최종 목록에 든 수 15, 정답 전략이 없는데 남은 키워드 0개
#   빠진 러닝 키워드: 발목보호대, 런닝화, 트레이닝화, 트레일러닝화, 런닝슈즈, 러닝슈즈, 카본러닝화, 마라토너, 모노웍스러닝화, 스포츠선글라스, 새벽러닝, 아치깔창, 무릎보호대, 워킹화, 스포츠워치, 숲결러닝화, 스포츠웨어, 달리기신발, 마라톤완주, 러닝크루, 데일리러닝화, 마라톤화, 종아리압박슬리브, 운동화, 러닝벨트
# 전략마다 따로, thinking 끔: 고른 id 50개 → 겹침 빼고 34개 → 최종 30개, 하루 검색 수 합 202,300
#   빠진 이유: overlap 16, sensitive_health 4 (무릎통증, 발목염좌, 족저근막염, 정강이통증), no_commercial_intent 0
#   러닝 키워드 40개 가운데 최종 목록에 든 수 30, 정답 전략이 없는데 남은 키워드 0개
#   빠진 러닝 키워드: 발목보호대, 스포츠선글라스, 10km완주, 새벽러닝, 아치깔창, 무릎보호대, 워킹화, 스포츠웨어, 마라톤완주, 종아리압박슬리브
# 전략마다 따로, thinking 켬: 고른 id 36개 → 겹침 빼고 30개 → 최종 26개, 하루 검색 수 합 206,900
#   빠진 이유: overlap 6, sensitive_health 4 (무릎통증, 발목염좌, 족저근막염, 정강이통증), no_commercial_intent 0
#   러닝 키워드 40개 가운데 최종 목록에 든 수 26, 정답 전략이 없는데 남은 키워드 0개
#   빠진 러닝 키워드: 발목보호대, 트레일러닝화, 카본러닝화, 마라토너, 모노웍스러닝화, 스포츠선글라스, 새벽러닝, 아치깔창, 무릎보호대, 숲결러닝화, 스포츠웨어, 데일리러닝화, 마라톤화, 종아리압박슬리브
# 4단계 뜻: thinking 을 끄고 따로 부른 problem_goal 은 health 넷만 골라, 거르고 나면 남는 키워드가 없다.
# 한 번에, thinking 끔: problem_goal 6개 가운데 남는 키워드 2개 (10km완주, 마라톤완주)
# 한 번에, thinking 켬: problem_goal 3개 가운데 남는 키워드 1개 (10km완주)
# 전략마다 따로, thinking 끔: problem_goal 4개 가운데 남는 키워드 0개
# 전략마다 따로, thinking 켬: problem_goal 6개 가운데 남는 키워드 2개 (10km완주, 마라톤완주)
```

health 는 세 설정에서 4개, thinking 을 켜고 한 번에 물은 답에서 2개가 빠졌습니다. 겹쳐서 빠진 id 는 블록의 차례대로 2, 0, 16, 6개입니다. 정답 전략이 없는데 남은 키워드는 네 설정 모두 0개라, 캠핑이나 여행 키워드가 섞이지는 않았습니다. 코드가 뺀 것은 모두 사전의 주제와 겹침만으로 정해졌습니다.

최종 목록은 전략 이름을 지운 합집합입니다. 그래서 3절에서 direct 와 category 를 바꿔 읽은 차이는 목록에서 사라지고, 무엇을 빠뜨렸는지만 남습니다. 러닝 키워드 40개를 가장 많이 남긴 것은 한 번에 thinking 을 끄고 물은 답으로 34개입니다. 출력 토큰과 시간이 가장 적었던 설정입니다. 빠진 여섯은 스포츠선글라스, 새벽러닝, 아치깔창, 무릎보호대, 워킹화, 스포츠웨어입니다.

problem_goal 은 따로 볼 만합니다. thinking 을 끄고 따로 부른 problem_goal 은 무릎통증, 발목염좌, 족저근막염, 정강이통증 넷만 골랐습니다. 그래서 거르고 나면 남는 키워드가 없습니다. 같은 문제를 푸는 상품 키워드인 무릎보호대와 아치깔창은 네 설정의 최종 목록 어디에도 없었습니다. 정책 거르기는 빼는 일만 하므로, 빈자리는 사람이 problem_goal 의 정의를 고쳐 채웁니다. 정의에 「문제를 푸는 상품」을 적는 것이 한 방법입니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-keyword-expansion-cards.html?embed=1&card=filter" height="480" loading="lazy" title="고른 id 에서 겹침을 하나로 남기고 health 와 noise 를 빼는 코드 거르기"></iframe>
<a class="demo-embed-open" href="demo-keyword-expansion-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 6. 키워드가 쓰이는 자리가 무대마다 다릅니다

**사전에서 고르고 코드가 거르는 순서는 두 무대가 같습니다. 담장 안에서는 검색창의 검색어를 키워드로 사고, 같은 검색어로 회원도 찾습니다. 열린 RTB 의 DSP 는 검색창이 없어서 키워드를 지면의 글과 맞추는 데 씁니다.**

1~5절의 셈은 두 무대가 같습니다. 담장 안은 한 회사가 서비스와 광고 서버를 다 가진 곳이고, 열린 RTB 는 여러 회사가 실시간 경매로 남의 지면에 광고를 사고파는 곳입니다. 두 무대의 이름은 18주째 [자연어 오디언스](post.html?id=natural-language-audience) 편 8절에서 풀었습니다. 둘이 다른 것은 사전이 어디서 오고, 고른 키워드로 무엇을 고르느냐입니다.

### 담장 안에서는 검색어를 사고, 같은 검색어로 회원도 찾습니다 [무대: 닫힌 생태계]

검색창을 가진 플랫폼은 회원이 쓴 검색어를 자기 서버에 남깁니다. 그래서 키워드 사전과 하루 검색 수를 자기 기록에서 만들 수 있고, 이 글의 사전이 그 자리에 있습니다. 고른 키워드는 검색 광고로 사고, 29주째처럼 그 말을 검색한 회원을 찾는 질의로도 씁니다. 사전을 자주 다시 만들수록 새로 뜨는 검색어도 고를 수 있습니다.

회원을 찾는 데 쓰려면 정책 거르기가 꼭 있어야 합니다. Google 의 맞춤 광고 정책은 건강을 민감한 관심 카테고리로 둡니다. 그 카테고리를 광고할 때는 광고주가 만든 오디언스를 쓸 수 없다고 적었습니다. Customer Match 와 Lookalike segments 가 그런 오디언스입니다. 이 글의 policy_filter 는 광고하는 상품과 상관없이 health 키워드를 목록에서 뺍니다.

### 열린 RTB 에서는 키워드를 지면의 글과 맞춥니다 [무대: 열린 RTB]

열린 RTB 에서 광고를 사는 쪽의 시스템인 DSP 에는 검색창이 없습니다. 입찰 요청에는 회원의 검색어 대신 지면의 주소나 카테고리가 담겨 옵니다. 그래서 키워드는 지면의 글과 맞출 낱말이 됩니다. 17주째 [컨텍스추얼 타겟팅](post.html?id=contextual-targeting) 편의 키워드 사전도 지면 글에 든 낱말로 카테고리를 붙였습니다.

DSP 가 이 글의 방식을 쓴다면, 사전에는 하루 검색 수 대신 그 낱말이 든 지면의 입찰 요청 수를 적게 됩니다. 사전에서 id 로 고르고 코드가 세는 순서는 그대로입니다. policy_filter 도 같은 함수를 쓰고, 걸러진 목록이 고르는 것이 회원이 아니라 지면이라는 점만 다릅니다. 거르는 기준을 한 함수에 두면 무대마다 따로 고칠 일이 줄어듭니다.

아래 표는 가상 데이터가 아니라 두 무대의 설계 차이를 적은 것입니다.

| 무엇 | 담장 안 | 열린 RTB |
|---|---|---|
| 사전의 출처 | 플랫폼이 남긴 검색 기록 | DSP 가 받은 입찰 요청의 지면 |
| 사전에 적는 수 | 하루 검색 수 | 그 낱말이 든 지면의 입찰 요청 수 |
| 고른 키워드가 고르는 것 | 검색 광고의 검색어와, 그 말을 검색한 회원 | 그 낱말이 든 지면 |
| 정책 거르기 | 회원을 고르기 전에 health 를 뺀다 | 같은 함수로 뺀다 |

## 한눈 정리

| 자리 | 무엇을 하나 | 이 기록의 숫자 |
|---|---|---|
| 사전 | 키워드 120개를 id 로 주고 id 만 받는다 | 답 16개 모두 읽힘, 사전 밖 id 0개, 한글 0자 |
| 한 번에, thinking 끔 | 전략 일곱을 호출 한 번으로 고른다 | 맞음 합 27/44, 키워드 38개, 34.3초 |
| 한 번에, thinking 켬 | 같은 호출에서 풀이를 먼저 쓴다 | 맞음 합 13/44, 키워드 17개, 334.2초 |
| 전략마다, thinking 끔 | 전략 하나씩 일곱 번 부른다 | 맞음 합 30/44, 키워드 34개, 겹친 id 14개 |
| 전략마다, thinking 켬 | 일곱 번 모두 풀이를 먼저 쓴다 | 맞음 합 29/44, 키워드 30개, 1,980.5초 |
| 겹침 빼기 | 전략 차례로 합쳐 앞 전략의 id 만 남긴다 | 빠진 id 2, 0, 16, 6개 |
| 정책 거르기 | 사전의 주제로 health 와 noise 를 뺀다 | health 4, 2, 4, 4개. noise 0개 |
| 최종 목록 | 전략 이름을 지운 합집합 | 34, 15, 30, 26개. 러닝 키워드 40개 가운데 가장 많이 34개 |

## 헷갈리기 쉬운 점

- **문제와 목표 전략은 건강 키워드를 끌어옵니다.** 네 설정의 problem_goal 이 모두 health 키워드를 골랐고, 세 설정은 넷을 다 골랐습니다. 정답에도 증상 넷이 problem_goal 로 들어 있을 만큼, 사는 사람의 문제를 묻는 정의는 증상과 가깝습니다. 거르기는 그대로 두고, 거르고 나서 빈 전략은 정의를 고쳐 채웁니다.
- **이유 구절은 사람이 확인하는 값입니다.** reason 은 6낱말 이하의 영어 구이고, 코드는 그 뜻을 채점하지 않습니다. 「Brand name matches only」는 모델이 brand 를 좁게 읽었다고 알려 준 구절입니다. 목록을 받는 사람은 id 와 함께 이 구절을 읽고, 정의를 고칠지 정합니다.
- **검색 수 합은 도달이 아닙니다.** 하루 검색 수는 검색한 횟수라서, 한 사람이 러닝화와 런닝화를 다 찾으면 두 번 셉니다. 최종 목록의 하루 검색 수 합 208,900 은 광고가 나갈 수 있는 검색의 수이지 사람 수가 아닙니다. 사람 수는 29주째처럼 회원의 검색 기록에서 셉니다.

## 더 깊이 보기

:::deep 시스템 메시지 둘 전문
기록에 보낸 시스템 메시지 둘입니다. 사용자 메시지는 둘 다 「상품 설명:」 아래에 상품 설명을, 「키워드 사전, 120개:」 아래에 키워드를 한 줄씩 적은 글입니다. 전략마다 부른 벌은 맨 끝에 「전략: direct」 같은 줄을 하나 더했습니다. 두 프롬프트 파일은 `scripts/gen-ads-data.py --prompts` 가 씁니다. `--check` 는 사용자 메시지를 다시 만들어 파일과 대조합니다.

```text
너는 검색 광고의 키워드 플래너다. 광고주의 상품 설명과 키워드 사전을 읽고, 전략 일곱마다 그 전략에 맞는 키워드를 사전에서 고른다.
키워드는 사전에 있는 것만 고르고 사전의 id 로 적는다. 사전에 없는 키워드를 새로 만들지 않는다.
전략은 아래 일곱이다.
direct: 광고하는 상품을 바로 가리키는 검색어다. 표기만 다르거나 뜻이 같은 말도 여기에 든다.
category: 상품이 속한 더 넓은 상품군이나, 같은 매장에서 함께 파는 옆 상품군의 검색어다.
co_purchase: 이 상품을 사는 사람이 함께 사는 다른 상품의 검색어다.
problem_goal: 사는 사람이 풀려는 문제나 이루려는 목표를 담은 검색어다.
persona: 사는 사람이 어떤 사람인지를 가리키는 검색어다. 경력, 습관, 모임을 나타내는 말도 여기에 든다.
brand: 광고주의 브랜드와, 같은 상품군에서 경쟁하는 다른 브랜드의 검색어다.
product_line: 같은 상품군을 기능, 용도, 소재, 모양으로 나눈 세부 제품의 검색어다.
한 전략에 맞는 키워드가 사전에 없으면 ids 를 빈 목록으로 둔다. 한 키워드가 두 전략에 다 맞으면 두 전략에 모두 넣어도 된다.
reason 에는 그 전략으로 고른 까닭을 영어 6낱말 이하의 짧은 구로 적는다.
답은 아래 꼴의 JSON 한 줄로만 쓴다. picks 에는 전략 일곱을 위 차례대로 하나씩 모두 적는다. 설명이나 다른 글은 붙이지 않는다.
{"picks": [{"strategy": "<전략>", "ids": ["<id>", "<id>"], "reason": "<영어 짧은 구>"}]}
```

전략마다 부른 벌은 할 일을 적은 줄 넷이 다릅니다. 첫 줄은 「전략:」 줄의 전략 하나만 고르게 하고, 셋째 줄은 이번에 고르는 것이 그 하나뿐이라고 적습니다. 겹침을 허락하는 줄과 답의 꼴 앞 줄도 전략 하나에 맞게 고쳤습니다. 전략 일곱의 정의 줄, reason 줄, 답의 꼴은 글자까지 같습니다.

```text
너는 검색 광고의 키워드 플래너다. 광고주의 상품 설명과 키워드 사전을 읽고, 사용자 메시지 끝의 「전략:」 줄에 적은 전략 하나에 맞는 키워드를 사전에서 고른다.
키워드는 사전에 있는 것만 고르고 사전의 id 로 적는다. 사전에 없는 키워드를 새로 만들지 않는다.
전략은 아래 일곱이다. 이번에 고르는 것은 「전략:」 줄의 전략 하나뿐이다.
direct: 광고하는 상품을 바로 가리키는 검색어다. 표기만 다르거나 뜻이 같은 말도 여기에 든다.
category: 상품이 속한 더 넓은 상품군이나, 같은 매장에서 함께 파는 옆 상품군의 검색어다.
co_purchase: 이 상품을 사는 사람이 함께 사는 다른 상품의 검색어다.
problem_goal: 사는 사람이 풀려는 문제나 이루려는 목표를 담은 검색어다.
persona: 사는 사람이 어떤 사람인지를 가리키는 검색어다. 경력, 습관, 모임을 나타내는 말도 여기에 든다.
brand: 광고주의 브랜드와, 같은 상품군에서 경쟁하는 다른 브랜드의 검색어다.
product_line: 같은 상품군을 기능, 용도, 소재, 모양으로 나눈 세부 제품의 검색어다.
그 전략에 맞는 키워드가 사전에 없으면 ids 를 빈 목록으로 둔다. 다른 전략에도 맞는 키워드라도 이 전략에 맞으면 넣어도 된다.
reason 에는 그 전략으로 고른 까닭을 영어 6낱말 이하의 짧은 구로 적는다.
답은 아래 꼴의 JSON 한 줄로만 쓴다. picks 에는 「전략:」 줄의 전략 하나만 적는다. 설명이나 다른 글은 붙이지 않는다.
{"picks": [{"strategy": "<전략>", "ids": ["<id>", "<id>"], "reason": "<영어 짧은 구>"}]}
```
:::

:::deep 기록한 방법과 이 기록으로 말할 수 없는 것
두 기록은 2026-11-07 에 차례로 받았습니다. 한 번에 맡기는 벌은 항목 1개를 thinking 을 끄고 켜서 두 번, 전략마다 부르는 벌은 항목 7개를 같은 식으로 14번 보냈습니다. 프롬프트 파일 둘은 `scripts/gen-ads-data.py --prompts` 가 씁니다. 첫 블록의 KEYWORDS 리터럴은 `--check` 가 생성기의 것과 대조합니다. 기록을 다시 받으면 파일 전체가 바뀌므로 글의 숫자도 다시 맞춥니다.

시스템 메시지를 고쳐 다시 기록하지 않은 까닭도 적어 둡니다. 이 블로그는 temperature 0 의 기준 답이 스키마대로 읽히지 않을 때만 프롬프트를 고칩니다. 두 기록의 답은 모두 읽혔습니다. direct 의 정의를 정답에 맞게 고쳐 다시 받으면, 정답을 보고 고친 프롬프트의 기록이 됩니다. 고친다면 「광고하는 상품의 종류를 부르는 말」처럼 기준을 적고, 고친 뒤의 기록을 새 기록으로 따로 둡니다.

이 기록으로 말할 수 없는 것도 셋입니다. 설정마다 한 번씩만 보내서, temperature 를 올렸을 때 고르는 키워드가 얼마나 흔들리는지는 재지 않았습니다. 정답 전략은 한 사람이 붙인 가상 값이라, 다른 사람이 붙이면 일부가 달라질 수 있습니다. 사전도 120개뿐이라, 키워드가 훨씬 많은 실제 사전에서는 입력 토큰과 시간이 그만큼 늘어납니다.
:::

- [유저를 문서로](post.html?id=users-as-documents) — 키워드 120개와 정답 전략이 처음 나온 29주째 편입니다. 그 글은 전략 셋의 정답 키워드로 회원을 검색했습니다.
- [구조화 출력](post.html?id=structured-output) — 스키마로 읽고 읽지 못한 답을 세는 법이 나온 22주째 편입니다.
- [LLM 모델 고르기](post.html?id=llm-model-selection) — thinking 을 켜고 끄는 필드와 풀이 토큰이 나온 20주째 편입니다.
- [키워드 확장 전략 카드 네 장](demo-keyword-expansion-cards.html) — 이 글의 카드 전체입니다. 카드를 누르면 헷갈리는 것 하나가 더 나옵니다.

## 참고문헌

- Jagerman, R., Zhuang, H., Qin, Z., Wang, X., Bendersky, M. (2023). *Query Expansion by Prompting Large Language Models*. arXiv:2305.03653. [arxiv.org](https://arxiv.org/abs/2305.03653). 질의 확장을 LLM 프롬프트로 하는 연구입니다. zero-shot, few-shot, Chain-of-Thought 프롬프트를 비교해 CoT 프롬프트가 특히 쓸모 있었다고 적었습니다. MS-MARCO 와 BEIR 에서 LLM 이 만든 확장이 전통적인 질의 확장보다 나을 수 있다고 보고했습니다.
- Google. *About keyword matching options*. Google Ads 도움말. [support.google.com](https://support.google.com/google-ads/answer/7478529). broad match, phrase match, exact match 의 정의입니다. 넓은 방식은 좁은 방식이 닿는 검색어를 모두 담고, exact match 가 닿는 검색어가 가장 적다고 적었습니다.
- Google. *Health in personalized advertising*. Google Ads 정책 도움말. [support.google.com](https://support.google.com/adspolicy/answer/16701855). 건강을 민감한 관심 카테고리로 둔 문서입니다. 그 카테고리를 광고할 때는 광고주가 만든 오디언스를 쓸 수 없다고 적었습니다. Customer Match 와 Lookalike segments 가 그 예입니다.
