모델 팀 18주째 월요일, 지훈 씨는 새 과제의 첫 화면을 열었습니다. 번호를 고르던 「보여 줄 사람」 칸 대신 글을 적는 입력 칸이 있었습니다. 서연 씨가 시험 삼아 적어 둔 문장은 「러닝화 살 사람」이었습니다.

선배는 언어 모델이 이 문장을 읽고 조건으로 바꾸면, 코드가 그 조건에 맞는 회원을 센다고 했습니다. 시험 문장은 둘 더 있었습니다. 「우리 광고 안 본」이 붙은 캠핑 요청과, 건강 상태로 골라 달라는 요청입니다.

**광고주가 쓴 문장 하나는 어떤 길을 지나 회원 명단이 되고, 그 길의 어디까지를 언어 모델에 맡길까요?**

문장으로 광고를 보여 줄 사람을 고르는 일을 자연어 오디언스(natural language audience)라고 부릅니다. 자연어는 사람이 평소에 쓰는 말이고, 오디언스는 광고를 보여 줄 사람의 무리입니다. 문장을 읽는 언어 모델은 LLM 이라고 부릅니다. 문장을 잘못 옮기면 하루 300만 원이 다른 사람에게 가고, 받아서는 안 되는 요청이 명단이 됩니다.

> **한 줄 요약:** 광고주가 쓴 문장 하나는 네 단계를 지나 명단이 됩니다. 받을 수 있는 요청인지 정하는 판정, 문장을 조건으로 바꾸는 조건 추출, 조건에 맞는 회원만 남기는 필터, 남은 수를 세는 명단 크기입니다. LLM 은 앞의 둘을 JSON(이름과 값을 정해진 꼴로 적은 글) 한 줄로 답하고, 뒤의 둘과 응답은 코드가 맡습니다. 「러닝화 살 사람」은 「러닝화 검색 1회 이상」이 되어 가상 표본 2,000명 중 63명이 남습니다. 「살 사람」은 원래 예측인데, LLM 에게 할 일을 적은 시스템 메시지가 그런 말을 행동 조건으로 옮기라고 했고 답이 그대로 따랐습니다. 「우리 광고 안 본」이 붙은 요청은 그 부분만 빼면 되는데, 기본 설정으로 받은 답은 요청 전체를 불가로 판정했습니다. 답 앞에 풀이를 쓰게 하는 thinking 을 켜고 한 번 더 물으면 조건 셋이 나왔지만, 모델이 써 낸 글 조각(토큰)이 114배였습니다. 답이 흔들리게 뽑는 설정으로 다섯 번 더 보내면, 캠핑 요청은 그중 두 번 같은 조건 셋을 냈습니다. 러닝화 요청의 명단은 12명에서 163명까지 바뀌었습니다. 그래서 코드가 JSON 의 꼴과 필드끼리 맞는지를 검사하고, 거절 문장은 정해 둔 템플릿으로 보냅니다.

> **골라 읽는 법** — 절이 8개인 긴 글입니다. 절마다 표나 코드나 카드가 들어 있어 그것만 보고 넘어가도 됩니다.
>
> - 입력 칸 하나와 조건에 쓸 수 있는 필드 10개 → 1절
> - 지원, 일부 지원, 불가 판정 → 2절
> - 문장이 조건 JSON 이 되는 자리 → 3절
> - 조건이 쿼리가 되고 명단 크기가 나오는 자리 → 4절
> - 다섯 번 더 보낸 답과 thinking 을 켠 답 → 5절
> - 거절 문장을 템플릿으로 보내는 까닭 → 6절
> - LLM 과 코드가 맡는 일의 경계 → 7절
> - 담장 안과 열린 RTB 에서 달라지는 것 → 8절

이 글의 회원 표본과 지역 가중치는 전부 설명을 위해 만든 가상 데이터입니다. LLM 의 답만은 지어낸 값이 아닙니다. 2026-11-04 에 이 블로그를 쓰는 맥에서 Ollama 로 qwen3.5:27b 를 띄워 한 번에 기록했습니다. 글은 그 기록을 그대로 다시 씁니다. Ollama 는 공개된 모델을 개인 컴퓨터에서 돌리는 도구입니다. 기록 파일은 `data/llm-records/natural-language-audience.json` 입니다. 회원 A 와 B 의 30일 행동, 세그먼트 317 의 조건 셋은 [유저 프로파일 피처](post.html?id=user-profile-features) 편 그대로입니다. 카드 속 벽돌색은 LLM 이 쓴 답, 파랑은 코드가 하는 일과 표본 회원, 회색은 명단을 만들지 않는 답입니다. 점선 상자는 사람이 미리 적어 둔 글입니다.

---

## 1. 새 과제의 첫 화면은 문장 하나입니다

**광고주는 번호를 고르는 대신 문장 하나를 적고, 화면은 그 문장에 맞는 회원 수를 돌려줍니다. 그 사이에서 문장은 판정, 조건 추출, 필터, 명단 크기의 네 단계를 지납니다. 조건에 쓸 수 있는 것은 회원마다 적혀 있는 값 10가지뿐입니다.**

지금까지 서연 씨는 「보여 줄 사람」 칸에 세그먼트 317 을 적었습니다. 세그먼트는 조건이 같은 회원 무리에 붙인 번호이고, 317 은 러닝에 관심 있는 회원 160만 명입니다. 새 화면에서는 번호 대신 「러닝화 살 사람」처럼 문장을 적습니다. 그러면 화면이 그 문장에 맞는 회원이 몇 명인지 돌려줍니다.

문장이 회원 수가 되기까지는 네 단계입니다. 판정은 받을 수 있는 요청인지 정하는 일이고, 답은 지원, 일부 지원, 불가 가운데 하나입니다. 조건 추출은 문장을 「무엇이 몇 이상」 꼴의 조건으로 바꾸는 일입니다. 필터는 조건에 맞지 않는 회원을 걸러 내는 일입니다. 남은 회원의 목록을 명단, 그 수를 명단 크기라고 부릅니다.

이 글에서는 앞의 둘을 LLM 이 하고 뒤의 둘을 코드가 합니다. LLM 에는 할 일을 적은 글인 시스템 메시지(system message)를 요청마다 같이 보냅니다. LLM 은 판정과 조건을 JSON 한 줄로 돌려줍니다. JSON 은 `{"verdict": "supported"}` 처럼 이름과 값을 중괄호로 적는 꼴이라 코드가 바로 읽습니다. 코드는 그 JSON 으로 쿼리를 만듭니다. 쿼리는 데이터베이스에 조건에 맞는 줄을 세어 달라고 묻는 글입니다.

조건에 쓸 수 있는 것은 회원마다 적혀 있는 값 10가지이고, 이 값의 이름을 필드라고 부릅니다. 앞의 8개는 13주째 글의 행동 8종을 최근 30일 동안 센 횟수입니다. 그래서 「최근 한 달」은 따로 조건을 만들 필요가 없습니다. 나머지 둘은 나이와 사는 지역이고, 광고를 본 적이 있는지 같은 노출 기록은 필드에 없습니다.

회원 1,400만 명 대신 표본(sample) 2,000명으로 셉니다. 표본은 전체 대신 들여다보는 가상 회원이고, 세그먼트 317 이 붙는 회원은 229명(11.4%)으로 전체의 160만 명과 같은 몫입니다. 그래서 표본에서 센 수에 7,000을 곱하면 전체로 옮겨집니다. 나이는 [Lookalike 계산](post.html?id=lookalike-computation) 편의 나이 함수를 그대로 씁니다. 지역은 이 글이 서울 18, 경기 26 같은 가상 가중치로 새로 뽑았습니다. 아래 표는 4절 코드의 1단계가 찍은 회원 A 와 B 의 값입니다.

| 필드 | 뜻 | 회원 A | 회원 B |
|---|---|---|---|
| search_running_shoes | 30일 동안 검색어 「러닝화」를 검색한 횟수 | 12 | 0 |
| sports_app_days | 30일 가운데 운동 앱을 켠 날 | 8 | 0 |
| running_posts | 30일 동안 읽은 러닝 글 | 9 | 0 |
| sports_goods_buy | 30일 동안 운동 용품을 산 횟수 | 1 | 0 |
| travel_posts | 30일 동안 읽은 여행 글 | 4 | 0 |
| cafe_posts | 30일 동안 읽은 카페 글 | 3 | 0 |
| camping_posts | 30일 동안 읽은 캠핑 글 | 0 | 15 |
| camping_search | 30일 동안 캠핑 용품을 검색한 횟수 | 0 | 6 |
| age | 나이 | 32 | 63 |
| region | 사는 지역, 9개 가운데 하나 | seoul | busan |

회원 B 는 캠핑 쪽 두 필드에만 값이 있고 나이가 30대 밖입니다. 그래서 이 기록의 캠핑 요청 답으로는 어느 명단에도 들지 않습니다. 표본 전체로는 서울 371명, 경기 491명이 뽑혔습니다. 이 필드 10개가 LLM 에게 보여 주는 이름의 전부라서, 필드에 없는 것을 물으면 판정이 달라집니다.

## 2. 첫 단계는 판정: 지원, 일부 지원, 불가

**판정 셋은 시스템 메시지에 정해 두었습니다. 요청을 전부 조건으로 옮길 수 있으면 지원, 일부만 옮길 수 있으면 일부 지원, 옮길 수 없거나 옮기면 안 되면 불가입니다. 기본 설정으로 받은 답은 러닝화 요청을 지원, 건강 상태 요청을 불가로 판정했고, 일부 지원이어야 할 캠핑 요청도 불가로 판정했습니다.**

판정은 LLM 이 JSON 의 verdict 필드에 적습니다. JSON 에서 이름 하나와 값 하나의 짝도 필드라고 부릅니다. 회원의 필드 10개와 섞이지 않게, 이 글은 JSON 쪽 필드를 늘 이름과 같이 씁니다. verdict 에는 supported, partial, unsupported 가운데 하나만 쓰게 했습니다. 차례대로 지원, 일부 지원, 불가입니다. 이렇게 정해 둔 낱말 가운데 하나만 쓰는 값을 enum 이라고 부릅니다. 낱말이 정해져 있으니 코드는 그 낱말만 보고 다음 단계를 고릅니다.

판정의 이유는 reason_code 필드에 enum 으로 적습니다. none 은 옮기지 못한 부분이 없다는 뜻입니다. sensitive_attribute 는 건강, 종교처럼 민감한 정보로 사람을 고르는 요청입니다. unknown_field 는 필드 10개에 없는 정보가 필요한 요청입니다. exposure_history_unavailable 은 노출 기록이 있어야 하는 요청입니다. 옮기지 못한 부분은 unsupported_parts 필드에 영어 짧은 구로 적게 했습니다. 광고주에게 보일 글이 아니라 담당자가 읽을 메모이기 때문입니다.

기본 설정은 thinking 을 끄고 temperature 0 으로 한 번씩 묻는 것이고, 이렇게 받은 답을 기준 답이라고 부릅니다. thinking 은 답 앞에 풀이를 길게 쓰게 하는 모드입니다. LLM 은 답을 토큰이라는 글 조각으로 하나씩 이어 씁니다. temperature 는 다음 토큰을 얼마나 흔들리게 뽑을지 정하는 값이고, 0 이면 늘 점수가 가장 높은 토큰을 고릅니다. 아래 표의 판정은 4절 코드의 2단계가 기록에서 읽어 찍은 값입니다. 「기대한 판정」은 이 과제를 정할 때 세 요청에 붙여 둔 값입니다.

| 요청 | 기대한 판정 | 기준 답의 판정 | reason_code | unsupported_parts |
|---|---|---|---|---|
| 러닝화 살 사람 | 지원 | supported | none | 없음 |
| 최근 한 달 캠핑 용품 본 30대 중 우리 광고 안 본 사람 | 일부 지원 | unsupported | exposure_history_unavailable | people who have not seen our ad |
| 건강 상태로 골라 달라 | 불가 | unsupported | sensitive_attribute | health status |

어긋난 것은 캠핑 요청 하나입니다. 이 요청에서 필드로 옮길 수 없는 것은 「우리 광고 안 본」뿐입니다. 「최근 한 달」은 30일 횟수 그대로이고, 「캠핑 용품 본」과 「30대」는 필드가 있습니다. 시스템 메시지의 정의로는 일부 지원입니다. 기준 답은 노출 기록이 없다는 이유를 맞게 적고도 verdict 에는 불가를 적었습니다.

판정이 불가면 시스템 메시지대로 conditions 가 비고, 코드는 쿼리를 만들지 않습니다. 이 답 하나로 캠핑 요청의 명단은 아예 생기지 않습니다. 같은 요청을 thinking 을 켜고 한 번 더 물은 답은 일부 지원이었고, 그 답은 3절과 5절에서 봅니다. [컨텍스추얼 타겟팅](post.html?id=contextual-targeting) 편에서도 thinking 을 끈 답이 시스템 메시지에 적은 기준을 따르지 않은 지면이 있었습니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-nl-audience-cards.html?embed=1&card=intent" height="480" loading="lazy" title="세 요청과 LLM 이 적은 판정, 기대한 판정"></iframe>
<a class="demo-embed-open" href="demo-nl-audience-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 3. 조건 추출: 문장이 JSON 이 됩니다

**조건 하나는 필드 이름, 비교, 값 셋으로 적고, 조건이 여럿이면 모두 맞는 회원을 고릅니다. 「러닝화 살 사람」은 조건 하나가 되었습니다. thinking 을 켠 캠핑 요청의 답은 「30대」를 나이 조건 둘로, 「캠핑 용품 본」을 검색 조건 하나로 옮겼습니다. 「우리 광고 안 본」은 조건에서 빼 두었습니다.**

아래 첫째는 러닝화 요청의 기준 답이고, 둘째는 캠핑 요청을 thinking 을 켜고 받은 답입니다. 기록에는 한 줄로 남아 있고, 여기서는 필드마다 줄만 바꿨습니다.

```json
{"verdict": "supported",
 "conditions": [{"field": "search_running_shoes", "op": ">=", "value": 1}],
 "unsupported_parts": [],
 "reason_code": "none"}

{"verdict": "partial",
 "conditions": [{"field": "age", "op": ">=", "value": 30},
                {"field": "age", "op": "<=", "value": 39},
                {"field": "camping_search", "op": ">=", "value": 1}],
 "unsupported_parts": ["ad exposure history"],
 "reason_code": "exposure_history_unavailable"}
```

조건 하나는 field, op, value 셋으로 적습니다. field 에는 필드 10개 가운데 하나의 이름이 들어갑니다. op 에는 크거나 같다(>=), 작거나 같다(<=), 같다(==) 가운데 하나가 들어가고, value 는 비교할 값입니다. 러닝화 요청의 조건은 30일 동안 「러닝화」를 한 번 이상 검색한 회원입니다. 문턱 1 은 문장에 없는 값이라 LLM 이 고른 것입니다.

「살 사람」은 지난 30일에 한 일이 아니라 앞으로 할 일에 대한 말입니다. 그런데 필드에는 지난 30일의 횟수만 있습니다. 그래서 시스템 메시지에 「구매 의향이나 관심처럼 마음을 말하는 표현은 그 마음이 드러나는 행동 필드의 조건으로 옮긴다」고 적었습니다. 기준 답은 이 줄대로 「살 사람」을 「검색한 사람」으로 옮겼습니다. 그렇게 바꾼 조건이 실제로 살 사람을 고르는지는 LLM 도 코드도 확인하지 않습니다.

캠핑 요청의 답에서 「30대」는 age >= 30 과 age <= 39 두 조건이 되었습니다. 시스템 메시지에 「20대는 age >= 20 과 age <= 29」라는 예를 적어 둔 그대로입니다. 「캠핑 용품 본」은 캠핑 용품을 검색한 횟수인 camping_search >= 1 이 되었습니다. 상품을 본 것과 검색한 것은 다른 행동인데, 필드 10개 가운데 가장 가까운 것을 고른 셈입니다.

「최근 한 달」은 조건이 되지 않았습니다. 필드가 모두 30일 동안의 횟수라서 따로 적을 것이 없습니다. 「우리 광고 안 본」은 conditions 에 들지 않았습니다. 대신 unsupported_parts 에 「ad exposure history」로 남았습니다. 코드는 unsupported_parts 로 사람을 고르지 않고, 무엇이 빠졌는지 알릴 때는 reason_code 를 봅니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-nl-audience-cards.html?embed=1&card=slots" height="480" loading="lazy" title="문장 조각이 필드, 비교, 값의 조건이 되는 자리"></iframe>
<a class="demo-embed-open" href="demo-nl-audience-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 4. 조건이 쿼리가 되고 명단 크기가 나옵니다

**코드는 조건 JSON 을 쿼리로 바꾸고 표본 2,000명에서 맞는 회원을 셉니다. 「러닝화 살 사람」은 63명이고 전체로는 44만 1천 명입니다. thinking 을 켠 캠핑 요청의 조건 셋은 59명, 전체로는 41만 3천 명이고, 판정이 불가인 답은 쿼리를 만들지 않습니다.**

쿼리는 코드가 조건 JSON 에서 만듭니다. 조건마다 「필드 비교 값」을 쓰고 AND 로 이으면 SQL 의 WHERE 절이 됩니다. SQL 은 데이터베이스에 묻는 표준 언어이고, WHERE 절은 그 가운데 조건을 적는 자리입니다. LLM 에게 SQL 을 쓰게 하지 않고 JSON 만 받으면, 쿼리에는 코드가 아는 필드와 비교만 들어갑니다.

아래 코드의 1단계가 1절의 표본을 만들고, 2단계가 기록의 답 19개를 스키마대로 읽습니다. 스키마는 JSON 에 어떤 이름의 필드가 어떤 값으로 들어가는지 정해 둔 꼴입니다. 필드가 빠지거나 enum 밖의 낱말이 오면 그 답은 읽지 못한 답으로 셉니다. 3단계가 쿼리를 만들어 세고, 4~6단계는 5절과 6절에서 씁니다.

```python
# 하는 일: 기록한 LLM 답 19개를 스키마대로 읽고, 조건을 표본 2,000명에 대어 명단 크기를 센 뒤, 다섯 번 더 보낸 답과 thinking 을 켠 답을 비교하고 응답을 고른다.
# 기록 data/llm-records/natural-language-audience.json 에서 옮김
import json
import random
from collections import Counter

# 1단계: 표본 2,000명과 필드 10개를 만든다
# 행동 8종은 유저 프로파일 피처 편의 생성기, 나이는 Lookalike 계산 편의 ages() 를 글자 그대로 옮긴다. 지역은 따로 뽑는 가상 값이다.
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


members = make_members(2000)
age = ages(members)
age[0] = 32                                         # 회원 A 는 다른 글과 같게 32세
region = regions(members)
region[0], region[1] = 'seoul', 'busan'             # 회원 A 는 서울, 회원 B 는 부산
FIELDS = KEYS + ['age', 'region']
rows = [dict(counts(m), age=a, region=r) for m, a, r in zip(members, age, region)]
n317 = sum(in_segment_317(m) for m in members)
print(f'표본 {len(rows):,}명, 필드 {len(FIELDS)}개. 세그먼트 317 은 {n317}명 ({n317 * 1000 // len(rows) / 10}%)')
for name, i in (('회원 A', 0), ('회원 B', 1)):
    print(f'{name}: ' + ', '.join(f'{f} {rows[i][f]}' for f in FIELDS))
print('지역:', ', '.join(f'{r} {n}' for r, n in Counter(region).most_common()))

# 2단계: 기록을 스키마대로 읽는다
# 키 r1 은 thinking 을 끄고 temperature 0 으로 받은 기준 답, r1|off|2 부터 r1|off|6 은 temperature 0.7 로 다섯 번 더 받은 답이다.
# r2|on|1 은 r2 를 thinking 을 켜고 한 번 더 물은 답이다. USAGE 의 네 값은 입력 토큰, 출력 토큰, 걸린 ms, thinking 으로 쓴 풀이의 글자 수다.
RECORD = {"r1": "{\"verdict\": \"supported\", \"conditions\": [{\"field\": \"search_running_shoes\", \"op\": \">=\", \"value\": 1}], \"unsupported_parts\": [], \"reason_code\": \"none\"}", "r1|off|2": "{\"verdict\": \"partial\", \"conditions\": [{\"field\": \"search_running_shoes\", \"op\": \">=\", \"value\": 1}], \"unsupported_parts\": [\"purchase intent\"], \"reason_code\": \"none\"}", "r1|off|3": "{\"verdict\": \"supported\", \"conditions\": [{\"field\": \"search_running_shoes\", \"op\": \">=\", \"value\": 1}], \"unsupported_parts\": [], \"reason_code\": \"none\"}", "r1|off|4": "{\"verdict\": \"partial\", \"conditions\": [{\"field\": \"search_running_shoes\", \"op\": \">=\", \"value\": 1}, {\"field\": \"sports_goods_buy\", \"op\": \">=\", \"value\": 1}], \"unsupported_parts\": [\"immediate purchase intent\"], \"reason_code\": \"unknown_field\"}", "r1|off|5": "{\"verdict\": \"partial\", \"conditions\": [{\"field\": \"sports_goods_buy\", \"op\": \">=\", \"value\": 1}], \"unsupported_parts\": [\"intent to buy running shoes\"], \"reason_code\": \"unknown_field\"}", "r1|off|6": "{\"verdict\": \"supported\", \"conditions\": [{\"field\": \"search_running_shoes\", \"op\": \">=\", \"value\": 1}], \"unsupported_parts\": [], \"reason_code\": \"none\"}", "r2": "{\"verdict\": \"unsupported\", \"conditions\": [], \"unsupported_parts\": [\"people who have not seen our ad\"], \"reason_code\": \"exposure_history_unavailable\"}", "r2|off|2": "{\"verdict\": \"unsupported\", \"conditions\": [], \"unsupported_parts\": [\"ad not viewed in the last month\"], \"reason_code\": \"exposure_history_unavailable\"}", "r2|off|3": "{\"verdict\": \"unsupported\", \"conditions\": [], \"unsupported_parts\": [\"people who have not seen our ad\"], \"reason_code\": \"exposure_history_unavailable\"}", "r2|off|4": "{\"verdict\": \"partial\", \"conditions\": [{\"field\": \"camping_search\", \"op\": \">=\", \"value\": 1}, {\"field\": \"age\", \"op\": \">=\", \"value\": 30}, {\"field\": \"age\", \"op\": \"<=\", \"value\": 39}], \"unsupported_parts\": [\"users who have not seen our ad\"], \"reason_code\": \"exposure_history_unavailable\"}", "r2|off|5": "{\"verdict\": \"partial\", \"conditions\": [{\"field\": \"age\", \"op\": \">=\", \"value\": 30}, {\"field\": \"age\", \"op\": \"<=\", \"value\": 39}, {\"field\": \"camping_search\", \"op\": \">=\", \"value\": 1}], \"unsupported_parts\": [\"users who have not seen our ad\"], \"reason_code\": \"exposure_history_unavailable\"}", "r2|off|6": "{\"verdict\": \"unsupported\", \"conditions\": [], \"unsupported_parts\": [\"users who have not seen our ad\"], \"reason_code\": \"exposure_history_unavailable\"}", "r2|on|1": "{\"verdict\": \"partial\", \"conditions\": [{\"field\": \"age\", \"op\": \">=\", \"value\": 30}, {\"field\": \"age\", \"op\": \"<=\", \"value\": 39}, {\"field\": \"camping_search\", \"op\": \">=\", \"value\": 1}], \"unsupported_parts\": [\"ad exposure history\"], \"reason_code\": \"exposure_history_unavailable\"}", "r3": "{\"verdict\": \"unsupported\", \"conditions\": [], \"unsupported_parts\": [\"health status\"], \"reason_code\": \"sensitive_attribute\"}", "r3|off|2": "{\"verdict\": \"unsupported\", \"conditions\": [], \"unsupported_parts\": [\"health status\"], \"reason_code\": \"sensitive_attribute\"}", "r3|off|3": "{\"verdict\": \"unsupported\", \"conditions\": [], \"unsupported_parts\": [\"health status\"], \"reason_code\": \"sensitive_attribute\"}", "r3|off|4": "{\"verdict\": \"unsupported\", \"conditions\": [], \"unsupported_parts\": [\"health status\"], \"reason_code\": \"sensitive_attribute\"}", "r3|off|5": "{\"verdict\": \"unsupported\", \"conditions\": [], \"unsupported_parts\": [\"health status\"], \"reason_code\": \"sensitive_attribute\"}", "r3|off|6": "{\"verdict\": \"unsupported\", \"conditions\": [], \"unsupported_parts\": [\"health status\"], \"reason_code\": \"sensitive_attribute\"}"}
USAGE = {"r1": [630, 42, 5030, 0], "r1|off|2": [630, 45, 3062, 0], "r1|off|3": [630, 42, 2810, 0], "r1|off|4": [630, 67, 4403, 0], "r1|off|5": [630, 48, 3190, 0], "r1|off|6": [630, 42, 2799, 0], "r2": [643, 35, 2582, 0], "r2|off|2": [643, 35, 2411, 0], "r2|off|3": [643, 35, 2347, 0], "r2|off|4": [643, 89, 5782, 0], "r2|off|5": [643, 89, 5767, 0], "r2|off|6": [643, 35, 2349, 0], "r2|on|1": [641, 3974, 305035, 14536], "r3": [630, 28, 2247, 0], "r3|off|2": [630, 28, 1980, 0], "r3|off|3": [630, 28, 1969, 0], "r3|off|4": [630, 28, 1965, 0], "r3|off|5": [630, 28, 1966, 0], "r3|off|6": [630, 28, 1968, 0]}
REQUESTS = {'r1': '러닝화 살 사람', 'r2': '최근 한 달 캠핑 용품 본 30대 중 우리 광고 안 본 사람', 'r3': '건강 상태로 골라 달라'}
VERDICTS = ('supported', 'partial', 'unsupported')
REASONS = ('none', 'sensitive_attribute', 'unknown_field', 'exposure_history_unavailable')
OPS = {'>=': lambda x, v: x >= v, '<=': lambda x, v: x <= v, '==': lambda x, v: x == v}


def good_condition(c):
    if not (isinstance(c, dict) and set(c) == {'field', 'op', 'value'} and c['field'] in FIELDS
            and isinstance(c['op'], str) and c['op'] in OPS):   # op 가 목록이나 객체면 in OPS 가 TypeError 를 내서 먼저 본다
        return False
    if c['field'] == 'region':
        return c['op'] == '==' and c['value'] in REGIONS   # 지역은 같은지만 본다
    return isinstance(c['value'], (int, float)) and not isinstance(c['value'], bool)


def read(key):
    """기록 하나를 스키마대로 읽는다. JSON 이 아니거나 필드, enum, 자료형이 스키마와 다르면 None 이다."""
    try:
        a = json.loads(RECORD[key])
    except ValueError:
        return None
    if not (isinstance(a, dict) and set(a) == {'verdict', 'conditions', 'unsupported_parts', 'reason_code'}):
        return None
    if a['verdict'] not in VERDICTS or a['reason_code'] not in REASONS:
        return None
    if not (isinstance(a['conditions'], list) and all(good_condition(c) for c in a['conditions'])):
        return None
    if not (isinstance(a['unsupported_parts'], list) and all(isinstance(p, str) for p in a['unsupported_parts'])):
        return None
    return a


def show(conditions):
    return ', '.join(f"{c['field']} {c['op']} {c['value']}" for c in conditions) or '없음'


answers = {k: read(k) for k in RECORD}
print(f'기록 {len(RECORD)}개, USAGE {len(USAGE)}개, 두 상수의 키와 차례가 같은가 {list(RECORD) == list(USAGE)}')
print(f'읽지 못한 답 {sum(a is None for a in answers.values())}개')
for k in ('r1', 'r2', 'r3', 'r2|on|1'):
    a = answers[k]
    if a is None:
        print(f'{k} 읽지 못한 답')
        continue
    print(f'{k} {a["verdict"]}, {a["reason_code"]}, 조건 {len(a["conditions"])}개 [{show(a["conditions"])}], '
          f'빠진 부분 {a["unsupported_parts"]}')

# 3단계: 조건을 쿼리로 바꾸고 표본에서 센다
# 쿼리는 코드가 조건 JSON 에서 만든다. 불가인 답은 세지 않고, 일부 지원인 답은 conditions 만 쓴다. 전체 회원 1,400만 명은 표본의 7,000배다.
SCALE = 14000000 // len(rows)


def sql(conditions):
    where = ' AND '.join(f"{c['field']} {'=' if c['op'] == '==' else c['op']} "
                         f"{repr(c['value']) if isinstance(c['value'], str) else c['value']}" for c in conditions)
    return 'SELECT COUNT(*) FROM members WHERE ' + where


def size(conditions):
    return sum(all(OPS[c['op']](r[c['field']], c['value']) for c in conditions) for r in rows)


def countable(a):
    """명단 크기를 셀 답인가. 불가인 답과 조건이 빈 답은 세지 않는다. 조건이 빈 지원과 일부 지원은 6단계가 review 로 보낸다."""
    return a['verdict'] != 'unsupported' and bool(a['conditions'])


for k in ('r1', 'r2', 'r2|on|1', 'r3'):
    a = answers[k]
    if a is None:
        print(f'{k}: 읽지 못한 답이라 쿼리를 만들지 않는다')
        continue
    if not countable(a):
        why = '이라' if a['verdict'] == 'unsupported' else '인데 조건이 없어'
        print(f'{k}: {a["verdict"]} {why} 쿼리를 만들지 않는다')
        continue
    n = size(a['conditions'])
    print(f'{k}: {sql(a["conditions"])}')
    print(f'    표본 {n:,}명 ({n * 1000 // len(rows) / 10}%), 전체로 옮기면 {n * SCALE:,}명')
    steps = [size(a['conditions'][:j + 1]) for j in range(len(a['conditions']))]
    print(f'    조건을 하나씩 더하면 {len(rows):,}명 → ' + ' → '.join(f'{x:,}명' for x in steps))

# 4단계: temperature 0.7 로 다섯 번 더 보낸 답을 기준 답과 비교한다
# 조건은 (field, op, value) 묶음의 집합으로 비교해 차례는 보지 않는다. 판정이 바뀐 답과 명단 크기도 센다.
def cond_set(a):
    return frozenset((c['field'], c['op'], c['value']) for c in a['conditions'])


for k in REQUESTS:
    base = answers[k]
    runs = {run: answers[f'{k}|off|{run}'] for run in range(2, 7)}
    readable = {run: a for run, a in runs.items() if a is not None}
    if base is None:
        print(f'{k}: 기준 답을 읽지 못해 비교하지 않는다')
        continue
    changed = sum(cond_set(a) != cond_set(base) for a in readable.values())
    flipped = sum(a['verdict'] != base['verdict'] for a in readable.values())
    print(f'{k}: 다섯 번 중 조건이 바뀐 답 {changed}개, 판정이 바뀐 답 {flipped}개, 읽지 못한 답 {len(runs) - len(readable)}개')
    for run, a in readable.items():
        n = f'{size(a["conditions"]):,}명' if countable(a) else '명단 없음'
        print(f'    run {run}: {a["verdict"]}, {a["reason_code"]}, [{show(a["conditions"])}], 빠진 부분 {a["unsupported_parts"]}, {n}')

# 5단계: r2 를 thinking 을 켜고 물은 답과 비교한다
# thinking 으로 쓴 풀이의 토큰은 출력 토큰에 들어 있다. 둘 다 한 번 기록한 값이다.
off, on = answers['r2'], answers['r2|on|1']
partial = [a for a in (answers[f'r2|off|{run}'] for run in range(2, 7)) if a is not None and a['verdict'] == 'partial']
if off is None or on is None:
    print('r2 의 기준 답이나 thinking 을 켠 답을 읽지 못해 판정을 비교하지 않는다')
else:
    same = [cond_set(on) == cond_set(a) for a in partial]
    print(f'thinking 끔 {off["verdict"]}, 켬 {on["verdict"]}. 켠 답의 조건 묶음이 0.7 의 일부 지원 답 {len(same)}개와 같은가 {same}')
for name, k in (('끔', 'r2'), ('켬', 'r2|on|1')):
    tin, tout, ms, chars = USAGE[k]
    print(f'thinking {name}: 입력 {tin:,} 토큰, 출력 {tout:,} 토큰, {ms / 1000:.1f}초, 풀이 {chars:,}자')
print(f'켜면 출력 토큰 {USAGE["r2|on|1"][1] / USAGE["r2"][1]:.0f}배, 걸린 시간 {USAGE["r2|on|1"][2] / USAGE["r2"][2]:.0f}배')

# 6단계: 판정과 reason_code 로 응답을 고른다
# 민감한 정보면 고정 템플릿, 판정과 나머지 필드가 어긋나거나 민감한 정보가 아닌데 불가면 담당자 검토, 나머지는 명단 크기다.
def consistent(a):
    if a['verdict'] == 'supported':
        return a['reason_code'] == 'none' and not a['unsupported_parts'] and bool(a['conditions'])
    if a['verdict'] == 'partial':
        return a['reason_code'] != 'none' and bool(a['unsupported_parts']) and bool(a['conditions'])
    return a['reason_code'] != 'none' and not a['conditions']


def respond(a):
    if a is None:
        return 'retry'                    # 읽지 못한 답은 다시 묻는다
    if a['reason_code'] == 'sensitive_attribute':
        return 'reject_template'          # 고정 템플릿 한 문장. LLM 이 쓴 글은 보내지 않는다
    if not consistent(a) or a['verdict'] == 'unsupported':
        return 'review'                   # 명단을 만들지 않고 담당자가 본다
    return 'list'                         # 명단 크기와 조건을 보인다


for k in ('r1', 'r2', 'r2|on|1', 'r3'):
    print(f'{k}: {respond(answers[k])}')
groups = {}
for k, a in answers.items():
    groups.setdefault(respond(a), []).append(k)
for r, keys in groups.items():
    print(f'{r} {len(keys)}개: {", ".join(keys)}')
print('판정과 나머지 필드가 어긋난 답:', [k for k, a in answers.items() if a is not None and not consistent(a)])
# 출력:
# 1단계 뜻: 표본 2,000명에 필드 10개가 붙고 317 은 229명이다. 회원 A 는 32세 서울, 회원 B 는 63세 부산이고, 나머지 지역은 가상 가중치대로 퍼진다.
# 표본 2,000명, 필드 10개. 세그먼트 317 은 229명 (11.4%)
# 회원 A: search_running_shoes 12, sports_app_days 8, running_posts 9, sports_goods_buy 1, travel_posts 4, cafe_posts 3, camping_posts 0, camping_search 0, age 32, region seoul
# 회원 B: search_running_shoes 0, sports_app_days 0, running_posts 0, sports_goods_buy 0, travel_posts 0, cafe_posts 0, camping_posts 15, camping_search 6, age 63, region busan
# 지역: other 625, gyeonggi 491, seoul 371, busan 130, incheon 128, daegu 98, gwangju 62, daejeon 60, ulsan 35
# 2단계 뜻: 19개 모두 스키마대로 읽힌다. 기준 답은 캠핑 요청을 불가로 판정했고, thinking 을 켠 답은 같은 요청을 일부 지원과 조건 셋으로 바꿨다.
# 기록 19개, USAGE 19개, 두 상수의 키와 차례가 같은가 True
# 읽지 못한 답 0개
# r1 supported, none, 조건 1개 [search_running_shoes >= 1], 빠진 부분 []
# r2 unsupported, exposure_history_unavailable, 조건 0개 [없음], 빠진 부분 ['people who have not seen our ad']
# r3 unsupported, sensitive_attribute, 조건 0개 [없음], 빠진 부분 ['health status']
# r2|on|1 partial, exposure_history_unavailable, 조건 3개 [age >= 30, age <= 39, camping_search >= 1], 빠진 부분 ['ad exposure history']
# 3단계 뜻: 러닝화 요청은 63명, 전체로 441,000명이다. 캠핑 요청의 조건 셋은 나이 둘과 검색 하나를 지나 59명이 되고, 불가인 답에는 쿼리가 없다.
# r1: SELECT COUNT(*) FROM members WHERE search_running_shoes >= 1
#     표본 63명 (3.1%), 전체로 옮기면 441,000명
#     조건을 하나씩 더하면 2,000명 → 63명
# r2: unsupported 이라 쿼리를 만들지 않는다
# r2|on|1: SELECT COUNT(*) FROM members WHERE age >= 30 AND age <= 39 AND camping_search >= 1
#     표본 59명 (2.9%), 전체로 옮기면 413,000명
#     조건을 하나씩 더하면 2,000명 → 1,603명 → 782명 → 59명
# r3: unsupported 이라 쿼리를 만들지 않는다
# 4단계 뜻: temperature 0.7 에서 러닝화 요청은 필드가 더해지거나 바뀌어 명단이 12명에서 163명까지 달라지고, 캠핑 요청은 두 번 일부 지원이 된다. 건강 상태 요청은 다섯 번 모두 같다.
# r1: 다섯 번 중 조건이 바뀐 답 2개, 판정이 바뀐 답 3개, 읽지 못한 답 0개
#     run 2: partial, none, [search_running_shoes >= 1], 빠진 부분 ['purchase intent'], 63명
#     run 3: supported, none, [search_running_shoes >= 1], 빠진 부분 [], 63명
#     run 4: partial, unknown_field, [search_running_shoes >= 1, sports_goods_buy >= 1], 빠진 부분 ['immediate purchase intent'], 12명
#     run 5: partial, unknown_field, [sports_goods_buy >= 1], 빠진 부분 ['intent to buy running shoes'], 163명
#     run 6: supported, none, [search_running_shoes >= 1], 빠진 부분 [], 63명
# r2: 다섯 번 중 조건이 바뀐 답 2개, 판정이 바뀐 답 2개, 읽지 못한 답 0개
#     run 2: unsupported, exposure_history_unavailable, [없음], 빠진 부분 ['ad not viewed in the last month'], 명단 없음
#     run 3: unsupported, exposure_history_unavailable, [없음], 빠진 부분 ['people who have not seen our ad'], 명단 없음
#     run 4: partial, exposure_history_unavailable, [camping_search >= 1, age >= 30, age <= 39], 빠진 부분 ['users who have not seen our ad'], 59명
#     run 5: partial, exposure_history_unavailable, [age >= 30, age <= 39, camping_search >= 1], 빠진 부분 ['users who have not seen our ad'], 59명
#     run 6: unsupported, exposure_history_unavailable, [없음], 빠진 부분 ['users who have not seen our ad'], 명단 없음
# r3: 다섯 번 중 조건이 바뀐 답 0개, 판정이 바뀐 답 0개, 읽지 못한 답 0개
#     run 2: unsupported, sensitive_attribute, [없음], 빠진 부분 ['health status'], 명단 없음
#     run 3: unsupported, sensitive_attribute, [없음], 빠진 부분 ['health status'], 명단 없음
#     run 4: unsupported, sensitive_attribute, [없음], 빠진 부분 ['health status'], 명단 없음
#     run 5: unsupported, sensitive_attribute, [없음], 빠진 부분 ['health status'], 명단 없음
#     run 6: unsupported, sensitive_attribute, [없음], 빠진 부분 ['health status'], 명단 없음
# 5단계 뜻: thinking 을 켜고 한 번 물은 캠핑 요청의 답은 0.7 의 일부 지원 답과 같은 조건 셋이지만, 출력 토큰은 114배, 걸린 시간은 118배다.
# thinking 끔 unsupported, 켬 partial. 켠 답의 조건 묶음이 0.7 의 일부 지원 답 2개와 같은가 [True, True]
# thinking 끔: 입력 643 토큰, 출력 35 토큰, 2.6초, 풀이 0자
# thinking 켬: 입력 641 토큰, 출력 3,974 토큰, 305.0초, 풀이 14,536자
# 켜면 출력 토큰 114배, 걸린 시간 118배
# 6단계 뜻: 건강 상태 요청 6개는 템플릿, 필드끼리 맞지 않는 답과 민감한 정보가 아닌 불가 5개는 검토, 나머지 8개는 명단이다.
# r1: list
# r2: review
# r2|on|1: list
# r3: reject_template
# list 8개: r1, r1|off|3, r1|off|4, r1|off|5, r1|off|6, r2|off|4, r2|off|5, r2|on|1
# review 5개: r1|off|2, r2, r2|off|2, r2|off|3, r2|off|6
# reject_template 6개: r3, r3|off|2, r3|off|3, r3|off|4, r3|off|5, r3|off|6
# 판정과 나머지 필드가 어긋난 답: ['r1|off|2']
```

러닝화 요청의 명단은 표본 63명이고, 7,000을 곱하면 44만 1천 명입니다. 이 조건은 세그먼트 317 의 조건 셋 가운데 「러닝화 검색」과 같습니다. [오디언스와 세그먼트](post.html?id=audience-and-segments) 편은 그 조건의 회원을 41만 명으로 적었습니다. 표본은 317 전체의 몫만 전체와 맞춰 만들어서, 조건 하나의 크기는 그 값과 꼭 같지 않습니다.

캠핑 요청의 조건 셋을 하나씩 더하면 2,000명이 1,603명, 782명, 59명으로 줄어듭니다. 나이 두 조건이 30대 782명을 남기고, 캠핑 용품 검색이 그 가운데 59명을 남깁니다. 「우리 광고 안 본」을 빼고 센 수라서, 그 조건을 더해도 이 수보다 늘지는 않습니다. 그래서 광고주 화면에는 이 59명이 빠진 조건이 있는 명단이라는 것을 같이 보입니다.

판정이 불가인 두 답, 곧 캠핑 요청의 기준 답과 건강 상태 요청은 쿼리를 만들지 않습니다. 명단 크기는 서연 씨가 하루 300만 원을 이 명단에 걸지 정하는 숫자입니다. 판정 하나가 바뀌면 그 숫자가 아예 없거나 59명이 되니, 판정을 그대로 믿고 넘기기 어렵습니다. 같은 문장에도 그 판정이 흔들리는지를 5절에서 봅니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-nl-audience-cards.html?embed=1&card=query" height="480" loading="lazy" title="조건 JSON 이 쿼리가 되어 표본에서 남는 회원 수"></iframe>
<a class="demo-embed-open" href="demo-nl-audience-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 5. 같은 문장을 다섯 번 더 보내면

**temperature 0 의 기준 답은 다시 기록해도 같습니다. 답을 흔들리게 뽑는 temperature 0.7 로 다섯 번 더 보내면, 러닝화 요청은 조건이 2번, 판정이 3번 바뀝니다. 캠핑 요청은 2번 일부 지원으로 바뀝니다. 건강 상태 요청은 한 번도 바뀌지 않았습니다. thinking 을 켜고 한 번 물은 캠핑 요청은 일부 지원이 되었지만 출력 토큰이 114배였습니다.**

temperature 를 0 보다 크게 두면 점수가 조금 낮은 토큰도 뽑힐 수 있어서, 같은 문장에 다른 답이 나옵니다. 세 요청을 temperature 0.7 로 다섯 번씩 더 보냈고, 기록은 이 다섯 번을 run 2 부터 run 6 으로 적습니다. 기준 답이 run 1 입니다. 뽑을 때 쓰는 난수의 시작값인 seed 는 run 마다 9 부터 13 까지 바꿨습니다. temperature 0 에 같은 seed 면 같은 답이 나와서, 흔들림을 보려면 둘을 함께 바꿉니다. 아래 표는 4절 코드의 4단계와 5단계가 찍은 값을 요청마다 모은 것입니다.

| 요청 | temperature 0, 기준 답 | temperature 0.7 로 다섯 번 더 | thinking 켬, temperature 0 |
|---|---|---|---|
| 러닝화 살 사람 | supported, 조건 1개, 63명 | 조건이 바뀐 답 2개, 판정이 바뀐 답 3개, 명단 12~163명 | 묻지 않음 |
| 최근 한 달 캠핑 용품 본 30대 중 우리 광고 안 본 사람 | unsupported, 명단 없음 | 조건과 판정이 바뀐 답 2개, 둘 다 partial 에 조건 셋, 59명 | partial, 조건 셋, 59명 |
| 건강 상태로 골라 달라 | unsupported, sensitive_attribute | 바뀐 답 0개 | 묻지 않음 |

러닝화 요청에서 판정이 바뀐 셋은 모두 일부 지원이고, 셋 다 「살 사람」을 옮기지 못한 부분으로 적었습니다. 「purchase intent」, 「intent to buy running shoes」 같은 구입니다. 기준 답은 시스템 메시지대로 「살 사람」을 행동 조건으로 옮겼고, 이 셋은 조건을 내면서도 구매 의향 자체는 옮길 수 없다고 적었습니다. 그중 둘은 운동 용품 구매 조건을 더하거나 그것으로 바꿔 명단이 12명과 163명이 되었습니다.

그 셋 가운데 run 2 의 답은 일부 지원이라 하면서 reason_code 를 none 으로 적었습니다. 시스템 메시지의 정의로는 일부 지원에는 옮기지 못한 이유가 있어야 하니, 판정과 이유가 서로 맞지 않습니다. 이런 답도 JSON 의 꼴로는 멀쩡해서 스키마 검사를 지납니다. 그래서 4절 코드의 6단계가 필드끼리 앞뒤가 맞는지를 따로 봅니다.

캠핑 요청은 다섯 번 가운데 두 번 일부 지원으로 바뀌었고, 두 답의 조건 묶음은 차례만 다르고 같습니다. thinking 을 켜고 temperature 0 으로 한 번 물은 답도 같은 조건 셋입니다. 대신 출력 토큰이 35개에서 3,974개로 114배, 걸린 시간이 2.6초에서 305.0초로 118배입니다. 출력 토큰에는 답 앞에 쓴 풀이 14,536자가 들어 있습니다.

이 표의 수는 한 번 기록한 19개의 값입니다. thinking 을 끈 18개를 같은 설정으로 다시 기록해 보았습니다. 기준 답 셋은 같았고, temperature 0.7 의 답에는 달라진 것이 있었습니다. seed 를 같게 두어도 temperature 0.7 에서는 다시 돌릴 때마다 같은 답이 나온다고 보장되지 않았습니다. 그래서 다섯 번의 결과도 이 기록 한 벌로 읽습니다. thinking 은 캠핑 요청 하나에만 켜 보았고, 다른 두 요청에서는 재지 않았습니다. 서비스는 temperature 0 으로 돌리더라도, 흔들릴 수 있는 판정을 코드와 사람이 다시 보는 자리를 둡니다.

## 6. 거절은 LLM 이 아니라 템플릿이 말합니다

**광고주에게 가는 글은 코드가 판정과 reason_code 로 고릅니다. 건강 상태 요청의 답 6개는 모두 민감한 정보라서, 미리 써 둔 템플릿 한 문장이 가고 LLM 이 쓴 글은 가지 않습니다. 민감한 정보가 아닌데 불가이거나 필드끼리 맞지 않는 답 5개는 명단 없이 담당자가 봅니다.**

건강 상태 요청에 가는 글은 이 문장 하나입니다. 「요청에 건강 상태처럼 민감한 정보로 고르는 조건이 있어 만들 수 없습니다. 관심사나 행동 조건으로 바꿔 주시면 다시 만들겠습니다.」 템플릿은 이렇게 미리 써 두고 그대로 보내는 문장입니다. 코드는 reason_code 가 sensitive_attribute 이면 verdict 와 상관없이 이 문장을 고릅니다.

거절 문장은 정책을 말하는 자리라서 LLM 에게 쓰게 하지 않았습니다. 같은 요청에는 같은 글이 가야 하고, 무엇을 받지 않는지는 사람이 정해 검토한 말이어야 합니다. 5절에서 temperature 를 올리자 판정과 조건부터 바뀌었고, LLM 이 쓴 글이 늘 같으리라고 볼 근거는 이 기록에 없습니다. 그래서 LLM 은 enum 과 숫자와 영어 짧은 구만 돌려주고, 광고주가 읽는 글은 템플릿에서만 나옵니다.

코드가 고르는 응답은 넷이고, 이 기록에서 쓰인 것은 셋입니다. list 는 명단 크기를 보이고, review 는 담당자에게 넘기고, reject_template 은 템플릿 문장을 보냅니다. 넷째 retry 는 읽지 못한 답을 다시 묻는 것인데, 읽지 못한 답이 0개라 쓰이지 않았습니다. 아래 표는 4절 코드의 6단계가 답 19개에 고른 응답을 답의 꼴마다 모은 것입니다.

| 답의 꼴 | 이 기록의 답 | 코드가 고른 응답 | 광고주에게 가는 것 |
|---|---|---|---|
| reason_code 가 sensitive_attribute | 건강 상태 요청 6개 | reject_template | 템플릿 한 문장 |
| 판정과 나머지 필드가 맞지 않는다 | 러닝화 요청의 run 2, 1개 | review | 담당자가 본 뒤에 정한다 |
| 민감한 정보가 아닌데 불가 | 캠핑 요청의 기준 답과 run 2, 3, 6, 4개 | review | 담당자가 본 뒤에 정한다 |
| 지원, 일부 지원 | 러닝화 요청 5개, 캠핑 요청 3개 | list | 명단 크기와 조건 |

캠핑 요청의 기준 답이 셋째 줄에 있습니다. 판정이 틀렸다는 것을 코드는 알 수 없지만, 민감한 정보가 아닌데 불가라는 꼴은 알 수 있습니다. 그런 답을 거절로 돌려보내면 일부라도 만들 수 있던 요청을 잃습니다. 담당자는 thinking 을 켜고 다시 묻거나, 조건을 직접 적어 명단을 만들 수 있습니다.

일부 지원인 답에는 명단 크기와 함께 빠진 조건이 있다는 안내가 갑니다. 이 안내도 reason_code 마다 미리 써 둔 글에서 고르고, unsupported_parts 의 영어 구는 화면에 그대로 내지 않습니다. 이 글은 그 안내 문장까지는 정하지 않았고, 정해 둔 문장은 위의 거절 템플릿 하나입니다.

## 7. 어디까지 LLM 이고 어디부터 코드인가

**LLM 은 문장을 읽어야 하는 판정과 조건 추출만 맡습니다. JSON 검사, 쿼리, 명단 크기, 응답 고르기는 같은 입력에 늘 같은 답이 나와야 해서 코드가 맡습니다. 이 기록에서 답이 흔들린 자리는 모두 LLM 이 맡은 두 일이었습니다.**

아래 표는 네 단계에 JSON 검사와 응답 고르기를 더한 여섯 일을, 맡는 쪽과 이 기록에서 본 것으로 놓은 것입니다.

| 일 | 맡는 쪽 | 이 기록에서 본 것 |
|---|---|---|
| 판정 | LLM | 캠핑 요청의 기준 답이 일부 지원 대신 불가 |
| 조건 추출 | LLM | 러닝화 요청의 조건이 다섯 번 중 두 번 바뀜 |
| JSON 검사 | 코드 | 읽지 못한 답 0개, 필드끼리 맞지 않는 답 1개 |
| 쿼리 | 코드 | 기준 답 가운데 불가인 둘에는 만들지 않았다 |
| 명단 크기 | 코드 | 63명과 59명. 7,000을 곱해 전체로 옮긴다 |
| 응답 고르기 | 코드 | 템플릿 6개, 검토 5개, 명단 8개 |

판정과 조건 추출은 문장을 읽어야 하는 일입니다. 「30대」가 나이 조건 둘이고 「우리 광고 안 본」이 노출 기록이라는 것은, 낱말 목록으로 미리 다 적어 두기 어렵습니다. 그래서 LLM 이 읽게 하고, 그 결과는 enum 과 숫자로만 돌려받습니다. 이렇게 받으면 LLM 이 틀려도 틀린 자리가 필드 하나로 보입니다.

나머지 넷은 같은 입력에 늘 같은 답이 나와야 하는 일입니다. 같은 조건으로 명단을 두 번 셌는데 수가 다르면, 서연 씨는 어느 쪽에 돈을 걸지 정할 수 없습니다. Amazon Ads 는 2025년 1월 보도자료에서, 광고주가 원하는 오디언스를 말로 적으면 SQL 쿼리를 돌려주는 생성기를 소개했습니다. 그 생성기는 쿼리와 함께 쿼리를 만든 단계도 돌려줍니다. 이 글은 한 걸음 더 좁혀, LLM 은 조건 JSON 만 쓰고 SQL 은 코드가 씁니다.

LLM 이 맡은 두 일에도 사람이 보는 자리를 둡니다. Zeotap 의 자연어 오디언스 빌더 문서에는 에이전트가 나옵니다. 에이전트는 LLM 을 불러 사람 대신 일을 처리하는 프로그램입니다. 문서는 에이전트가 조건과 그 까닭, 대략의 회원 수를 제안하는 순서를 적었습니다. 사람은 그 제안을 빌더에 적용한 뒤 손으로 고칠 수 있습니다. 이 기록에서도 틀린 판정은 꼴로는 멀쩡했습니다. 조건을 광고주 화면에 그대로 보이면, 「본」이 「검색」으로 바뀐 자리도 광고주가 봅니다.

JSON 의 꼴은 LLM 쪽에서 강제할 수도 있습니다. Anthropic 의 Structured outputs 문서는 JSON 스키마를 문법으로 바꿔 쓰는 방식을 설명합니다. 여기서 문법은 다음에 올 수 있는 토큰을 정해 두는 규칙이라, 모델이 그 꼴로만 쓰게 됩니다. 그래도 강제되는 것은 꼴이고, 캠핑 요청을 불가로 본 판단은 꼴 안에서 일어납니다. LLM 에 보내는 글 전체를 프롬프트라고 부릅니다. 프롬프트가 토큰이 되어 오가는 길과 thinking, temperature 가 바꾸는 것은 다음 묶음인 LLM 기초 트랙이 한 편씩 다룹니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-nl-audience-cards.html?embed=1&card=bridge" height="480" loading="lazy" title="LLM 이 맡는 두 일과 코드가 맡는 네 일"></iframe>
<a class="demo-embed-open" href="demo-nl-audience-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 8. 필드 목록과 노출 기록을 누가 갖고 있나가 무대마다 다릅니다

**문장을 조건으로 옮기는 셈은 어디서나 같고, 다른 것은 필드 목록과 광고 노출 기록을 누가 갖고 있나입니다. 서비스와 광고 서버를 한 회사가 다 가진 곳에서는 「우리 광고 안 본」도 필드로 더할 수 있습니다. 여러 회사가 경매로 광고를 사고파는 곳에서는 광고를 사는 쪽이 자기가 낸 노출만 압니다.**

1~7절의 셈은 두 무대가 같습니다. 한 회사가 서비스와 광고 서버를 다 가진 곳을 담장 안이라고 부릅니다. 여러 회사가 실시간 경매로 남의 지면에 광고를 사고파는 곳은 열린 RTB 라고 부릅니다. 둘이 다른 것은 LLM 에게 보여 줄 필드 목록에 무엇을 둘 수 있느냐입니다.

### 담장 안에서는 노출 기록도 필드가 될 수 있습니다 [무대: 닫힌 생태계]

담장 안의 플랫폼은 회원의 행동, 나이, 지역을 갖고, 광고를 내보낸 기록도 자기 서버에 남깁니다. 그래서 「30일 동안 이 광고주의 광고를 본 횟수」 같은 필드를 더하면, 「우리 광고 안 본」은 그 필드가 0 이라는 조건이 됩니다. 이 글의 필드 10개에 그런 필드가 없었을 뿐입니다. Amazon 보도자료의 예시 요청도 광고 노출을 조건에 씁니다. 「제품 페이지를 보고 스트리밍 TV 광고도 봤지만 30일 동안 사지 않은 고객」입니다.

필드를 더할 때는 시스템 메시지의 목록과 코드의 스키마를 같이 고칩니다. LLM 은 시스템 메시지에 적힌 필드만 알고, 코드는 스키마에 있는 필드만 쿼리로 바꾸기 때문입니다. 민감한 정보를 막는 줄은 필드를 더해도 그대로 둡니다. 건강을 운동 앱 일수로 바꿔 고르면 민감한 정보를 다른 이름으로 고르는 셈이라, 시스템 메시지는 그것도 막았습니다.

### 열린 RTB 에서는 광고를 사는 쪽이 아는 노출이 일부입니다 [무대: 열린 RTB]

열린 RTB 에서 광고를 사는 쪽의 시스템을 DSP 라고 부릅니다. DSP 는 자기가 이긴 경매에서 보인 노출만 기록하고, 다른 DSP 가 같은 광고주의 광고를 보인 기록은 모릅니다. 사람도 회원 번호 대신 쿠키, 곧 브라우저에 남겨 두는 작은 식별 값으로 알아봅니다. 앱에서는 휴대폰 운영체제가 광고에 쓰라고 주는 식별 값인 기기의 광고 ID 를 씁니다. 그래서 「우리 광고 안 본」을 필드로 만들어도, 그 DSP 가 그 쿠키나 광고 ID 에 보인 적이 없다는 뜻에 그칩니다.

문장으로 오디언스를 만드는 도구는 고객 데이터 플랫폼(CDP)에도 있습니다. CDP 는 회사가 가진 고객 데이터를 모아 오디언스를 만드는 도구입니다. Zeotap 의 문서는 에이전트가 회사의 데이터 모델에 실제로 있는 컬럼만 쓴다고 적었습니다. 데이터 모델은 고객 데이터를 어떤 표로 둘지 정한 설계이고, 컬럼은 그 표의 세로 칸 하나입니다. 어느 무대든 LLM 이 옮길 수 있는 것은 필드 목록에 적힌 것까지입니다. 그래서 목록을 넓히기 전에, 새 필드로 민감한 무리를 고를 수 있게 되지 않는지 먼저 봅니다.

아래 표는 가상 데이터가 아니라 두 무대의 설계 차이를 적은 것입니다.

| 무엇 | 담장 안 | 열린 RTB |
|---|---|---|
| 필드 목록 | 플랫폼의 회원 데이터. 노출 기록도 더할 수 있다 | DSP 의 쿠키 기록과 사 온 데이터 |
| 「우리 광고 안 본」 | 노출 횟수 필드가 0 인 조건 | 그 DSP 가 보인 노출만 안다 |
| 사람을 알아보는 값 | 로그인한 회원 번호 | 쿠키나 기기의 광고 ID |
| 민감한 정보 | 시스템 메시지가 막고, 코드는 reason_code 와 필드 목록으로 거른다 | 같다 |

## 한눈 정리

| 자리 | 무엇을 하나 | 숫자 |
|---|---|---|
| 입력 칸 | 광고주가 번호 대신 문장 하나를 적는다 | 시험 요청 셋 |
| 판정 | LLM 이 지원, 일부 지원, 불가 가운데 하나를 고른다 | 캠핑 요청을 일부 지원 대신 불가로 |
| 조건 추출 | LLM 이 필드, 비교, 값으로 옮긴다 | 러닝화 조건 1개, 캠핑 조건 3개 (thinking 켬) |
| JSON 검사 | 코드가 꼴과 필드끼리의 앞뒤를 본다 | 읽지 못한 답 0개, 맞지 않는 답 1개 |
| 쿼리와 명단 크기 | 코드가 표본에서 세고 7,000을 곱한다 | 63명은 44만 1천 명, 59명은 41만 3천 명 |
| 다섯 번 더 | temperature 0.7, seed 9~13 | 러닝화 조건 2번, 판정 3번, 명단 12~163명 |
| thinking 켬 | 캠핑 요청을 한 번 더 | 일부 지원, 출력 토큰 114배, 시간 118배 |
| 응답 | 코드가 템플릿, 검토, 명단 가운데 고른다 | 19개 중 6개, 5개, 8개 |

## 헷갈리기 쉬운 점

- **「살 사람」은 조건이 아니라 예측입니다.** 필드에는 지난 30일의 행동만 있습니다. 그래서 「러닝화 검색 1회 이상」은 살 것 같은 사람을 행동으로 대신한 조건입니다. temperature 0.7 의 다섯 번 가운데 셋은 「살 사람」을 옮기지 못한 부분으로 적었습니다. 누가 살지를 확률로 매기는 일은 [전환 예측으로 타겟 고르기](post.html?id=pcvr-based-targeting) 편의 pCVR(모델이 매긴 구매 확률)이 합니다.
- **노출 기록이 없다고 요청 전체가 불가가 되지는 않습니다.** 캠핑 요청에서 옮길 수 없는 것은 「우리 광고 안 본」 하나라서 일부 지원이 맞습니다. 그런데 기준 답은 reason_code 에 노출 기록을 맞게 적고도 verdict 에 불가를 적었습니다. 그래서 코드는 민감한 정보가 아닌 불가를 거절로 돌려보내지 않고 담당자에게 넘깁니다.
- **판정과 조건 추출을 한 번에 시키면, 판정이 틀릴 때 조건도 같이 사라집니다.** 이 기록은 둘을 한 JSON 으로 받았고, 시스템 메시지는 불가면 conditions 를 비우라고 했습니다. 그래서 캠핑 요청의 기준 답은 옮길 수 있던 조건 셋까지 비웠습니다. 둘을 따로 물으면 판정이 틀려도 뽑은 조건이 남아 담당자가 고칠 수 있습니다. 따로 묻는 방식은 이 글에서 재지 않았습니다.

## 더 깊이 보기

:::deep 시스템 메시지와 스키마 전문
기록에 보낸 시스템 메시지의 전문입니다. 사용자 메시지는 「요청: 」 뒤에 광고주의 문장을 붙인 한 줄입니다.

```text
너는 광고 오디언스 조건 변환기다. 광고주가 쓴 요청 한 문장을 읽고, 회원을 고를 조건과 판정을 JSON 으로 돌려준다.
쓸 수 있는 필드는 아래 10개뿐이다. 앞의 8개는 모두 최근 30일 동안 센 횟수다.
search_running_shoes: 검색어 「러닝화」를 검색한 횟수
sports_app_days: 운동 앱을 켠 날의 수
running_posts: 러닝 글을 읽은 수
sports_goods_buy: 운동 용품을 산 횟수
travel_posts: 여행 글을 읽은 수
cafe_posts: 카페 글을 읽은 수
camping_posts: 캠핑 글을 읽은 수
camping_search: 캠핑 용품을 검색한 횟수
age: 나이, 정수
region: 사는 지역. seoul, gyeonggi, incheon, busan, daegu, gwangju, daejeon, ulsan, other 가운데 하나
조건 하나는 {"field": 필드 이름, "op": ">=" 또는 "<=" 또는 "==", "value": 값} 꼴이다. value 는 숫자이고, region 일 때만 위의 지역 이름 하나다. 조건이 여럿이면 모두 맞는 회원을 고른다.
나이대는 age 조건 둘로 옮긴다. 20대는 age >= 20 과 age <= 29 이다.
구매 의향이나 관심처럼 마음을 말하는 표현은 그 마음이 드러나는 행동 필드의 조건으로 옮긴다.
verdict 는 셋 가운데 하나다.
supported: 요청 전부를 위 필드의 조건으로 옮길 수 있다.
partial: 요청의 일부만 옮길 수 있다. 옮길 수 있는 부분만 conditions 에 넣는다.
unsupported: 요청을 조건으로 옮길 수 없거나 옮기면 안 된다. conditions 는 빈 목록이다.
지원하지 않는 조건은 conditions 에 넣지 말고 unsupported_parts 에 영어 짧은 구로 적는다. 옮기지 못한 부분이 없으면 빈 목록이다.
reason_code 는 넷 가운데 하나다.
none: 옮기지 못한 부분이 없다.
sensitive_attribute: 건강, 질병, 종교, 정치 성향, 성적 지향처럼 민감한 정보로 사람을 고르는 요청이다. 판정은 unsupported 이고, 비슷한 행동 필드로 바꿔 옮기지도 않는다.
unknown_field: 위 10개 필드에 없는 정보가 필요하다.
exposure_history_unavailable: 광고를 본 적이 있는지 같은 광고 노출 이력이 필요하다. 노출 이력은 필드에 없다.
답은 아래 꼴의 JSON 한 줄로만 쓴다. 설명이나 다른 글은 붙이지 않는다.
{"verdict": "<판정>", "conditions": [{"field": "<필드>", "op": "<비교>", "value": <값>}], "unsupported_parts": ["<영어 짧은 구>"], "reason_code": "<이유>"}
```

4절 코드의 read() 가 이 꼴을 그대로 검사합니다. 맨 위 필드는 verdict, conditions, unsupported_parts, reason_code 넷입니다. 이름이 정확히 같아야 합니다. verdict 와 reason_code 는 위의 enum 가운데 하나이고, unsupported_parts 는 문자열 목록입니다. 조건의 field 는 필드 10개, op 는 비교 셋 가운데 하나입니다. field 가 region 이면 op 는 == 하나만 받고, value 는 지역 이름 9개 가운데 하나입니다. 나머지 조건의 value 는 숫자입니다.

Structured outputs 처럼 모델이 토큰을 고르는 단계에서 꼴을 강제하려면, 같은 내용을 JSON Schema 로 적어 넘깁니다. Anthropic 의 문서는 객체마다 additionalProperties 를 false 로 두라고 적었습니다. 스키마에 없는 필드를 받지 않는다는 뜻입니다. 최솟값 같은 숫자 제약은 쓸 수 없다고도 적었습니다. 이 글은 Ollama 에 꼴을 강제하지 않고 시스템 메시지로만 요청했고, 답 19개가 모두 꼴을 지켰습니다.
:::

:::deep 흔들림을 잰 방법
기준 답은 temperature 0, seed 7 로 한 번씩 받았습니다. 반복은 기록 도구의 repeat_subset 으로 세 요청을 다섯 번씩 더 보냈습니다. temperature 는 0.7 이고 seed 는 7 + run 이라, run 2 부터 6 까지 seed 9~13 이 쓰였습니다. 프롬프트 파일의 맨 위 options 에 seed 를 적으면 이 묶음이 그 seed 를 물려받아 다섯 번이 같은 seed 로 나갑니다. 그래서 맨 위에는 temperature 만 적었습니다.

조건이 바뀌었는지는 조건마다 field, op, value 세 값을 묶은 뒤 집합으로 만들어 기준 답의 집합과 비교합니다. 집합이라 차례는 보지 않아서, 캠핑 요청의 run 4 와 run 5 는 차례가 달라도 같은 묶음입니다. 판정은 따로 비교했고, 그래서 러닝화 요청은 조건이 바뀐 답 2개와 판정이 바뀐 답 3개가 따로 나옵니다.

thinking 을 켠 답은 캠핑 요청에만 temperature 0, seed 7 로 한 번 받았습니다. Ollama 의 응답에는 thinking 토큰 수가 따로 없어서, 풀이가 든 출력 토큰 수와 풀이의 글자 수를 적었습니다. 풀이 글 자체는 기록에 두지 않았습니다. 이 기록으로 말할 수 없는 것도 셋입니다. 다섯 번보다 많이 보냈을 때의 비율, 다른 temperature 에서의 흔들림, thinking 을 켠 답의 흔들림입니다.
:::

- [전환 예측으로 타겟 고르기](post.html?id=pcvr-based-targeting) — 「살 사람에게만」을 확률로 들어준 16주째 편입니다.
- [유저 프로파일 피처](post.html?id=user-profile-features) — 필드 8개의 이름과 표본 생성기가 처음 나온 13주째 편입니다.
- [오디언스와 세그먼트](post.html?id=audience-and-segments) — 세그먼트 317 의 조건 셋과 160만 명이 처음 나온 편입니다.
- [컨텍스추얼 타겟팅](post.html?id=contextual-targeting) — thinking 을 끈 답이 시스템 메시지의 기준을 따르지 않은 다른 기록입니다.
- [자연어 오디언스 카드 네 장](demo-nl-audience-cards.html) — 이 글의 카드 전체입니다. 카드를 누르면 헷갈리는 것 하나가 더 나옵니다.

## 참고문헌

- Amazon Ads (2025-01-08). *Amazon Ads Brings Generative AI to Amazon Marketing Cloud with New SQL Generator*. 보도자료. [press.aboutamazon.com](https://press.aboutamazon.com/2025/1/amazon-ads-brings-generative-ai-to-amazon-marketing-cloud-with-new-sql-generator). 광고주가 원하는 오디언스를 말로 적으면 SQL 쿼리와 그 쿼리를 만든 단계를 돌려주는 생성기입니다. 예시 요청이 광고 노출을 조건에 씁니다.
- Zeotap. *Natural Language Audience Builder*. 제품 문서. [agentic-docs.zeotap.com](https://agentic-docs.zeotap.com/agent-smith/nl-audience-builder/). 에이전트가 조건과 그 까닭, 대략의 회원 수를 제안하고 사람이 빌더에 적용하는 순서입니다. 데이터 모델에 실제로 있는 컬럼만 쓴다고 적었습니다.
- Anthropic. *Structured outputs*. Claude API 문서. [platform.claude.com](https://platform.claude.com/docs/en/build-with-claude/structured-outputs). JSON 스키마를 문법으로 바꿔 답의 꼴을 맞추는 방식입니다. 거절한 답과 길이 상한(max_tokens)에서 잘린 답은 스키마와 다를 수 있다고 적었습니다.
