모델 팀 28주째 월요일, 서연 씨가 지훈 씨에게 문장 30개를 보냈습니다. 그동안 입력 칸에 시험 삼아 적어 본 요청들이었습니다. 「러닝화 살 사람」처럼 열 주 전에 돌려 본 문장도, 「우리 광고를 본 적 있는 사람」처럼 처음 보는 문장도 있었습니다.

18주째 [자연어 오디언스](post.html?id=natural-language-audience) 편에서는 문장마다 판정과 조건을 한 번에 받았고, 판정이 틀린 캠핑 요청은 조건까지 비었습니다. 선배는 묻는 일을 둘로 나눠 보라고 했습니다. 받을 요청인지 먼저 묻고, 받을 요청에만 조건을 묻는 차례입니다.

**한 번에 하던 일을 판정과 조건 두 번으로 나눠 물으면, 어디가 나아지고 어디가 그대로일까요?**

정해 둔 차례대로 LLM 을 부르고 그 사이를 코드가 잇는 흐름을 워크플로(workflow)라고 부릅니다. 첫 단계는 요청을 지원, 일부 지원, 불가로 나누는 의도 분류이고, 둘째 단계가 조건 추출입니다. 판정 하나가 틀리면 하루 300만 원을 걸 명단이 사라지거나, 받으면 안 되는 요청이 명단이 됩니다.

> **한 줄 요약:** 요청 30개를 세 벌로 기록했습니다. 판정과 조건을 한 번에 받는 oneshot, 판정만 받는 verdict, 조건만 받는 extract 입니다. 워크플로는 판정이 지원이나 일부 지원인 요청에만 조건을 쓰고, 쿼리와 광고주에게 가는 답은 코드가 씁니다. 판정만 따로 물어도 맞은 판정은 25개에서 24개로 줄었습니다. 두 기록 모두 「우리 광고 안 본」처럼 노출 이력이 붙은 일부 지원 5개를 불가로 보았습니다. 그래서 워크플로가 맞힌 조건 필드는 37개 중 28개로, oneshot 의 29개보다 하나 적었습니다. 조건 단계의 답만 따로 채점하면 35개가 맞았고, 판정 단계가 막은 일부 지원 6개 중 4개도 조건은 맞았습니다. 틀린 자리가 판정 단계 하나로 모였고, 받으면 안 되는 요청을 받은 답은 0개였습니다. 쿼리는 코드가 허용 목록을 확인한 뒤 쓰고, 거절과 일부 지원은 고정 템플릿으로 답합니다.

> **골라 읽는 법** — 절이 6개입니다. 절마다 표나 코드나 카드가 있어 그것만 보고 넘어가도 됩니다.
>
> - 한 번에 하던 변환과 워크플로의 네 단계 → 1절
> - 판정 셋의 채점과 혼동표 → 2절
> - 조건만 받은 답과 필드 단위로 센 맞은 수 → 3절
> - 코드가 쓴 쿼리와 명단 크기 → 4절
> - 거절과 일부 지원의 고정 템플릿 → 5절
> - 담장 안과 열린 RTB 에서 달라지는 것 → 6절

이 글의 요청 30개에 붙인 정답과 회원 표본은 설명을 위해 만든 가상 데이터입니다. LLM 의 답만은 지어낸 값이 아닙니다. 2026-11-07 에 이 블로그를 쓰는 맥에서 Ollama 로 qwen3.5:27b 를 띄워 기록했습니다. 세 벌 모두 thinking 을 끄고 temperature 0, seed 7 로 요청 30개를 한 번씩 보냈습니다. 세 설정은 [프롬프트와 Chain-of-Thought](post.html?id=prompting-chain-of-thought) 편에서 본 그 값입니다. 기록 파일 셋은 `data/llm-records/` 에 있고, 이름 끝이 oneshot, verdict, extract 입니다. 카드 속 벽돌색은 LLM 이 쓴 답, 파랑은 코드가 하는 일과 회원 표본, 회색은 명단을 만들지 않는 답입니다. 점선 상자는 사람이 미리 적어 둔 글입니다.

---

## 1. 한 번에 하던 변환을 단계로 나눕니다

**18주째의 변환에서는 LLM 호출 한 번이 판정과 조건을 같이 돌려주었습니다. 이 글의 워크플로는 판정, 조건 추출, 쿼리, 답의 네 단계로 나누고, LLM 은 앞의 둘만 맡습니다. 세 벌의 기록은 요청 30개를 모두 보내 서로 기대지 않게 했습니다.**

18주째의 시스템 메시지는 필드 10개와 판정 셋, reason_code 넷을 적고 답을 JSON 한 줄로 받았습니다. 그 JSON 에는 verdict, conditions, unsupported_parts, reason_code 넷이 함께 들어갑니다. 판정이 불가면 conditions 를 빈 목록으로 두라는 줄이 있어서, 불가로 판정된 캠핑 요청은 옮길 수 있던 조건 셋까지 잃었습니다. 이 글은 그 시스템 메시지를 글자 하나 바꾸지 않고 다시 보내고, 이 방식을 oneshot 이라고 부릅니다. 판정, reason_code, 쿼리, 명단 크기 같은 말은 18주째 편 1~4절에서 풀었습니다.

워크플로는 이 일을 네 단계로 나눕니다. 판정 단계는 요청을 받을지 정하고, verdict 와 reason_code 둘만 돌려줍니다. 조건 추출 단계는 판정을 묻지 않고 필드, 비교, 값만 돌려줍니다. 쿼리 단계에서는 코드가 조건으로 SELECT 문을 쓰고 표본에서 명단 크기를 셉니다. 답 단계에서는 코드가 판정과 reason_code 로 미리 써 둔 문장을 고릅니다. 미리 써 두고 그대로 보내는 이 문장을 템플릿이라고 부릅니다.

LLM 은 문장을 읽어야 하는 앞의 두 단계만 맡습니다. 뒤의 두 단계는 같은 입력에 늘 같은 답이 나와야 해서 코드가 맡습니다. 단계의 차례도 코드가 정해 둡니다. [Tool use 와 에이전트 루프](post.html?id=tool-use-agent-loop) 편의 루프는 다음에 부를 도구를 모델이 매번 골랐습니다. 워크플로에서는 모델이 차례를 고르지 않고, 정해 둔 자리에서 한 가지 일만 합니다.

요청 30개는 지훈 씨가 시스템 메시지의 정의대로 정답을 붙여 둔 목록입니다. 정답 판정은 지원 12개, 일부 지원 10개, 불가 8개입니다. 불가 8개의 reason_code 는 민감한 정보 2개, 필드에 없는 정보 3개, 노출 이력 3개이고, 민감한 정보 둘은 모두 건강입니다. 일부 지원 10개는 필드에 없는 정보가 붙은 요청과 노출 이력이 붙은 요청이 5개씩입니다. 앞 세 요청은 18주째의 요청 셋을 글자 그대로 썼습니다.

기록은 세 벌이고, 셋 다 요청 30개를 모두 보냈습니다. 실제 워크플로라면 불가로 판정된 요청에는 조건 단계를 부르지 않습니다. 그래도 기록은 30개를 다 받아 두어, 판정 단계가 막은 요청의 조건이 맞았는지도 셀 수 있게 했습니다. 워크플로 코드는 verdict 의 답을 보고 extract 의 답을 쓸지 고릅니다. 아래 표는 네 단계와 비교할 oneshot 을 한 줄씩 적은 것입니다.

| 단계 | 입력 | 출력 | 맡는 것 |
|---|---|---|---|
| 판정 (verdict) | 시스템 메시지와 요청 한 문장 | verdict 와 reason_code 를 적은 JSON 한 줄 | LLM |
| 조건 추출 (extract) | 시스템 메시지와 요청 한 문장. 판정이 지원이나 일부 지원일 때만 쓴다 | conditions 와 unsupported_parts 를 적은 JSON 한 줄 | LLM |
| 쿼리와 명단 크기 | 조건 목록과 회원 표본 2,000명 | SELECT 문 한 줄과 회원 수 | 코드 |
| 답 | 판정, reason_code, 회원 수 | 템플릿 문장 하나 | 코드 |
| 비교할 oneshot | 18주째의 시스템 메시지와 요청 한 문장 | 판정과 조건을 함께 적은 JSON 한 줄 | LLM |

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-nl-query-cards.html?embed=1&card=steps" height="480" loading="lazy" title="요청 한 문장이 판정, 조건, 쿼리, 명단을 지나는 차례"></iframe>
<a class="demo-embed-open" href="demo-nl-query-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 2. 첫 단계는 판정입니다

**판정만 물은 verdict 는 30개 중 24개를 맞혀, 판정과 조건을 함께 물은 oneshot 의 25개보다 하나 적었습니다. 두 기록 모두 틀린 답은 일부 지원을 불가로 본 쪽뿐이었고, 받으면 안 되는 요청을 받은 답은 없었습니다.**

verdict 의 시스템 메시지는 oneshot 에서 조건을 적으라는 줄을 뺐습니다. 답의 꼴도 verdict 와 reason_code 둘로 줄였습니다. 필드 10개와 조건의 꼴, 나이대와 마음을 말하는 표현의 줄, reason_code 넷의 정의는 그대로 두었습니다. 받을 수 있는지 정하려면 무엇을 조건으로 쓸 수 있는지 알아야 하기 때문입니다. 요청을 정해 둔 몇 갈래로 나누는 일을 의도 분류(intent classification)라고 부릅니다. 이 글에서는 그 갈래가 판정 셋입니다.

채점은 두 블록이 합니다. 첫 블록은 oneshot 의 답 30개를 18주째의 스키마대로 읽고, 판정과 reason_code 와 조건을 정답과 비교합니다. 스키마로 읽는 법과 읽지 못한 답을 세는 법은 [구조화 출력](post.html?id=structured-output) 편에서 보았습니다. 둘째 블록은 verdict 의 답 30개를 같은 정답으로 채점하고 혼동표를 그립니다. 혼동표(confusion matrix)는 정답 판정을 줄로, 답의 판정을 칸으로 놓고 요청 수를 센 표입니다. 대각선의 칸이 맞은 답입니다.

```python
# 하는 일: 판정과 조건을 한 번에 받은 oneshot 기록 30개를 채점해, 판정과 reason_code 와 조건 필드가 정답과 몇 개 맞는지 센다.
# 기록 data/llm-records/nl-to-targeting-query-oneshot.json 에서 옮김
import json
from collections import Counter

# 1단계: 필드 10개, 요청 30개와 정답, oneshot 기록을 둔다
# 필드와 비교와 enum 은 18주째 글의 시스템 메시지 그대로다. 요청마다 (id, 요청, 정답 판정, 정답 reason_code, 정답 조건) 이다.
# 정답은 가상 값이고, 조건은 (필드, 비교, 값) 묶음의 목록이다. 앞 세 요청은 18주째 글의 요청 셋이다.
# USAGE 의 네 값은 입력 토큰, 출력 토큰, 걸린 ms, thinking 글자 수다. 뒤 블록이 RECORD 와 USAGE 를 다시 쓰므로 옮겨 둔다.
KEYS = ['search_running_shoes', 'sports_app_days', 'running_posts', 'sports_goods_buy',
        'travel_posts', 'cafe_posts', 'camping_posts', 'camping_search']
FIELDS = KEYS + ['age', 'region']
REGIONS = ['seoul', 'gyeonggi', 'incheon', 'busan', 'daegu', 'gwangju', 'daejeon', 'ulsan', 'other']
OPS = {'>=': lambda x, v: x >= v, '<=': lambda x, v: x <= v, '==': lambda x, v: x == v}
VERDICTS = ('supported', 'partial', 'unsupported')
REASONS = ('none', 'sensitive_attribute', 'unknown_field', 'exposure_history_unavailable')
REQUESTS = [
    ('n01', '러닝화 살 사람', 'supported', 'none', [('search_running_shoes', '>=', 1)]),
    ('n02', '최근 한 달 캠핑 용품 본 30대 중 우리 광고 안 본 사람', 'partial', 'exposure_history_unavailable', [('age', '>=', 30), ('age', '<=', 39), ('camping_search', '>=', 1)]),
    ('n03', '건강 상태로 골라 달라', 'unsupported', 'sensitive_attribute', []),
    ('n04', '부산에 사는 캠핑 글 독자', 'supported', 'none', [('region', '==', 'busan'), ('camping_posts', '>=', 1)]),
    ('n05', '반려견을 키우는 캠핑 글 독자', 'partial', 'unknown_field', [('camping_posts', '>=', 1)]),
    ('n06', '20대 중에 러닝 글을 5편 이상 읽은 사람', 'supported', 'none', [('age', '>=', 20), ('age', '<=', 29), ('running_posts', '>=', 5)]),
    ('n07', '골프 치는 사람', 'unsupported', 'unknown_field', []),
    ('n08', '서울 사는 러닝 글 독자 중 우리 광고를 아직 못 본 사람', 'partial', 'exposure_history_unavailable', [('region', '==', 'seoul'), ('running_posts', '>=', 1)]),
    ('n09', '운동 앱을 10일 이상 켠 40세 이상', 'supported', 'none', [('sports_app_days', '>=', 10), ('age', '>=', 40)]),
    ('n10', '여행 좋아하는 30대', 'supported', 'none', [('travel_posts', '>=', 1), ('age', '>=', 30), ('age', '<=', 39)]),
    ('n11', '우리 광고를 본 적 있는 사람', 'unsupported', 'exposure_history_unavailable', []),
    ('n12', '태블릿으로 접속하는 여행 글 독자', 'partial', 'unknown_field', [('travel_posts', '>=', 1)]),
    ('n13', '서울에 사는 카페 글 독자', 'supported', 'none', [('region', '==', 'seoul'), ('cafe_posts', '>=', 1)]),
    ('n14', '우리 광고를 이미 본 20대 여행 글 독자', 'partial', 'exposure_history_unavailable', [('age', '>=', 20), ('age', '<=', 29), ('travel_posts', '>=', 1)]),
    ('n15', '캠핑 용품을 3번 이상 검색한 사람', 'supported', 'none', [('camping_search', '>=', 3)]),
    ('n16', '무릎 통증이 있는 러닝 글 독자', 'unsupported', 'sensitive_attribute', []),
    ('n17', '마라톤 대회에 나간 적 있는 러닝화 검색자', 'partial', 'unknown_field', [('search_running_shoes', '>=', 1)]),
    ('n18', '운동 용품을 산 적 있는 경기도 회원', 'supported', 'none', [('sports_goods_buy', '>=', 1), ('region', '==', 'gyeonggi')]),
    ('n19', '전기차를 타는 사람', 'unsupported', 'unknown_field', []),
    ('n20', '우리 광고를 세 번 넘게 본 러닝화 검색자', 'partial', 'exposure_history_unavailable', [('search_running_shoes', '>=', 1)]),
    ('n21', '러닝화를 검색하고 러닝 글도 읽은 사람', 'supported', 'none', [('search_running_shoes', '>=', 1), ('running_posts', '>=', 1)]),
    ('n22', '자동차가 있는 40대 여행 글 독자', 'partial', 'unknown_field', [('age', '>=', 40), ('age', '<=', 49), ('travel_posts', '>=', 1)]),
    ('n23', '50대 여행 글 독자', 'supported', 'none', [('age', '>=', 50), ('age', '<=', 59), ('travel_posts', '>=', 1)]),
    ('n24', '지난달 우리 광고를 다섯 번 넘게 본 사람', 'unsupported', 'exposure_history_unavailable', []),
    ('n25', '등산 글도 읽는 대구의 캠핑 글 독자', 'partial', 'unknown_field', [('region', '==', 'daegu'), ('camping_posts', '>=', 1)]),
    ('n26', '카페 글을 3편 이상 읽은 인천 사람', 'supported', 'none', [('cafe_posts', '>=', 3), ('region', '==', 'incheon')]),
    ('n27', '낚시를 좋아하는 사람', 'unsupported', 'unknown_field', []),
    ('n28', '지난주에 우리 광고를 본 카페 글 독자', 'partial', 'exposure_history_unavailable', [('cafe_posts', '>=', 1)]),
    ('n29', '25세 이하 운동 앱 사용자', 'supported', 'none', [('age', '<=', 25), ('sports_app_days', '>=', 1)]),
    ('n30', '우리 광고를 한 번도 안 본 사람', 'unsupported', 'exposure_history_unavailable', [])
]
RECORD = {"n01": "{\"verdict\": \"supported\", \"conditions\": [{\"field\": \"search_running_shoes\", \"op\": \">=\", \"value\": 1}], \"unsupported_parts\": [], \"reason_code\": \"none\"}", "n02": "{\"verdict\": \"unsupported\", \"conditions\": [], \"unsupported_parts\": [\"users who have not seen our ad\"], \"reason_code\": \"exposure_history_unavailable\"}", "n03": "{\"verdict\": \"unsupported\", \"conditions\": [], \"unsupported_parts\": [\"health status\"], \"reason_code\": \"sensitive_attribute\"}", "n04": "{\"verdict\": \"supported\", \"conditions\": [{\"field\": \"region\", \"op\": \"==\", \"value\": \"busan\"}, {\"field\": \"camping_posts\", \"op\": \">=\", \"value\": 1}], \"unsupported_parts\": [], \"reason_code\": \"none\"}", "n05": "{\"verdict\": \"partial\", \"conditions\": [{\"field\": \"camping_posts\", \"op\": \">=\", \"value\": 1}], \"unsupported_parts\": [\"pet dog owner\"], \"reason_code\": \"unknown_field\"}", "n06": "{\"verdict\": \"supported\", \"conditions\": [{\"field\": \"age\", \"op\": \">=\", \"value\": 20}, {\"field\": \"age\", \"op\": \"<=\", \"value\": 29}, {\"field\": \"running_posts\", \"op\": \">=\", \"value\": 5}], \"unsupported_parts\": [], \"reason_code\": \"none\"}", "n07": "{\"verdict\": \"unsupported\", \"conditions\": [], \"unsupported_parts\": [\"golf players\"], \"reason_code\": \"unknown_field\"}", "n08": "{\"verdict\": \"unsupported\", \"conditions\": [], \"unsupported_parts\": [\"users who have not seen our ad yet\"], \"reason_code\": \"exposure_history_unavailable\"}", "n09": "{\"verdict\": \"supported\", \"conditions\": [{\"field\": \"sports_app_days\", \"op\": \">=\", \"value\": 10}, {\"field\": \"age\", \"op\": \">=\", \"value\": 40}], \"unsupported_parts\": [], \"reason_code\": \"none\"}", "n10": "{\"verdict\": \"supported\", \"conditions\": [{\"field\": \"travel_posts\", \"op\": \">=\", \"value\": 1}, {\"field\": \"age\", \"op\": \">=\", \"value\": 30}, {\"field\": \"age\", \"op\": \"<=\", \"value\": 39}], \"unsupported_parts\": [], \"reason_code\": \"none\"}", "n11": "{\"verdict\": \"unsupported\", \"conditions\": [], \"unsupported_parts\": [\"ad exposure history\"], \"reason_code\": \"exposure_history_unavailable\"}", "n12": "{\"verdict\": \"partial\", \"conditions\": [{\"field\": \"travel_posts\", \"op\": \">=\", \"value\": 1}], \"unsupported_parts\": [\"tablet access\"], \"reason_code\": \"unknown_field\"}", "n13": "{\"verdict\": \"supported\", \"conditions\": [{\"field\": \"region\", \"op\": \"==\", \"value\": \"seoul\"}, {\"field\": \"cafe_posts\", \"op\": \">=\", \"value\": 1}], \"unsupported_parts\": [], \"reason_code\": \"none\"}", "n14": "{\"verdict\": \"unsupported\", \"conditions\": [], \"unsupported_parts\": [\"users who have already seen our ad\"], \"reason_code\": \"exposure_history_unavailable\"}", "n15": "{\"verdict\": \"supported\", \"conditions\": [{\"field\": \"camping_search\", \"op\": \">=\", \"value\": 3}], \"unsupported_parts\": [], \"reason_code\": \"none\"}", "n16": "{\"verdict\": \"unsupported\", \"conditions\": [], \"unsupported_parts\": [\"knee pain\"], \"reason_code\": \"sensitive_attribute\"}", "n17": "{\"verdict\": \"partial\", \"conditions\": [{\"field\": \"search_running_shoes\", \"op\": \">=\", \"value\": 1}], \"unsupported_parts\": [\"participated in marathon\"], \"reason_code\": \"unknown_field\"}", "n18": "{\"verdict\": \"supported\", \"conditions\": [{\"field\": \"sports_goods_buy\", \"op\": \">=\", \"value\": 1}, {\"field\": \"region\", \"op\": \"==\", \"value\": \"gyeonggi\"}], \"unsupported_parts\": [], \"reason_code\": \"none\"}", "n19": "{\"verdict\": \"unsupported\", \"conditions\": [], \"unsupported_parts\": [\"electric car owner\"], \"reason_code\": \"unknown_field\"}", "n20": "{\"verdict\": \"unsupported\", \"conditions\": [], \"unsupported_parts\": [\"ad exposure history\"], \"reason_code\": \"exposure_history_unavailable\"}", "n21": "{\"verdict\": \"supported\", \"conditions\": [{\"field\": \"search_running_shoes\", \"op\": \">=\", \"value\": 1}, {\"field\": \"running_posts\", \"op\": \">=\", \"value\": 1}], \"unsupported_parts\": [], \"reason_code\": \"none\"}", "n22": "{\"verdict\": \"partial\", \"conditions\": [{\"field\": \"age\", \"op\": \">=\", \"value\": 40}, {\"field\": \"age\", \"op\": \"<=\", \"value\": 49}, {\"field\": \"travel_posts\", \"op\": \">=\", \"value\": 1}], \"unsupported_parts\": [\"car ownership\"], \"reason_code\": \"unknown_field\"}", "n23": "{\"verdict\": \"supported\", \"conditions\": [{\"field\": \"age\", \"op\": \">=\", \"value\": 50}, {\"field\": \"age\", \"op\": \"<=\", \"value\": 59}, {\"field\": \"travel_posts\", \"op\": \">=\", \"value\": 1}], \"unsupported_parts\": [], \"reason_code\": \"none\"}", "n24": "{\"verdict\": \"unsupported\", \"conditions\": [], \"unsupported_parts\": [\"ad exposure history\"], \"reason_code\": \"exposure_history_unavailable\"}", "n25": "{\"verdict\": \"partial\", \"conditions\": [{\"field\": \"camping_posts\", \"op\": \">=\", \"value\": 1}, {\"field\": \"region\", \"op\": \"==\", \"value\": \"daegu\"}], \"unsupported_parts\": [\"reading hiking posts\"], \"reason_code\": \"unknown_field\"}", "n26": "{\"verdict\": \"supported\", \"conditions\": [{\"field\": \"cafe_posts\", \"op\": \">=\", \"value\": 3}, {\"field\": \"region\", \"op\": \"==\", \"value\": \"incheon\"}], \"unsupported_parts\": [], \"reason_code\": \"none\"}", "n27": "{\"verdict\": \"unsupported\", \"conditions\": [], \"unsupported_parts\": [\"fishing interest\"], \"reason_code\": \"unknown_field\"}", "n28": "{\"verdict\": \"unsupported\", \"conditions\": [], \"unsupported_parts\": [\"ad exposure history\"], \"reason_code\": \"exposure_history_unavailable\"}", "n29": "{\"verdict\": \"supported\", \"conditions\": [{\"field\": \"age\", \"op\": \"<=\", \"value\": 25}, {\"field\": \"sports_app_days\", \"op\": \">=\", \"value\": 1}], \"unsupported_parts\": [], \"reason_code\": \"none\"}", "n30": "{\"verdict\": \"unsupported\", \"conditions\": [], \"unsupported_parts\": [\"users who have never seen our ad\"], \"reason_code\": \"exposure_history_unavailable\"}"}
USAGE = {"n01": [630, 42, 14906, 0], "n02": [643, 35, 6352, 0], "n03": [630, 28, 2179, 0], "n04": [632, 59, 4212, 0], "n05": [634, 46, 3351, 0], "n06": [640, 76, 5275, 0], "n07": [629, 28, 2278, 0], "n08": [639, 36, 2721, 0], "n09": [640, 60, 4222, 0], "n10": [631, 76, 5233, 0], "n11": [632, 31, 2362, 0], "n12": [634, 44, 3203, 0], "n13": [631, 59, 4182, 0], "n14": [637, 35, 2640, 0], "n15": [636, 41, 2998, 0], "n16": [635, 29, 2237, 0], "n17": [639, 49, 3551, 0], "n18": [633, 62, 4342, 0], "n19": [630, 28, 2153, 0], "n20": [638, 31, 2357, 0], "n21": [637, 60, 4281, 0], "n22": [635, 80, 5534, 0], "n23": [632, 76, 5347, 0], "n24": [635, 31, 2426, 0], "n25": [637, 65, 4913, 0], "n26": [635, 60, 4573, 0], "n27": [630, 28, 2418, 0], "n28": [635, 31, 2748, 0], "n29": [633, 59, 4719, 0], "n30": [634, 35, 3233, 0]}
R_ONESHOT, U_ONESHOT = RECORD, USAGE
GOLD = {rid: (verdict, reason, conds) for rid, text, verdict, reason, conds in REQUESTS}
print(f'요청 {len(GOLD)}개: ' + ', '.join(f'{v} {n}' for v, n in Counter(g[0] for g in GOLD.values()).items()))
print(f'기록 {len(RECORD)}개, USAGE {len(USAGE)}개, 키의 차례가 요청과 같은가 {list(RECORD) == list(USAGE) == list(GOLD)}')

# 2단계: 답을 스키마대로 읽는다
# JSON 객체가 아니거나 맨 위 필드, enum, 조건의 꼴이 스키마와 다르면 None 이다. 읽지 못한 답은 틀린 답으로 센다.
# 조건의 field 는 필드 10개, op 는 비교 셋 가운데 하나다. region 은 == 와 지역 이름 하나, 나머지 값은 숫자다.
def good_condition(c):
    if not (isinstance(c, dict) and set(c) == {'field', 'op', 'value'} and c['field'] in FIELDS
            and isinstance(c['op'], str) and c['op'] in OPS):   # op 가 목록이나 객체면 in OPS 가 TypeError 를 내서 먼저 본다
        return False
    if c['field'] == 'region':
        return c['op'] == '==' and c['value'] in REGIONS
    return isinstance(c['value'], (int, float)) and not isinstance(c['value'], bool)


def read_json(text, keys):
    """JSON 객체이고 맨 위 필드가 keys 와 같으면 그 객체, 아니면 None 이다."""
    try:
        a = json.loads(text)
    except ValueError:
        return None
    return a if isinstance(a, dict) and set(a) == set(keys) else None


def good_lists(a):
    """conditions 는 맞는 꼴의 조건 목록이고, unsupported_parts 는 문자열 목록인가."""
    return (isinstance(a['conditions'], list) and all(good_condition(c) for c in a['conditions'])
            and isinstance(a['unsupported_parts'], list) and all(isinstance(p, str) for p in a['unsupported_parts']))


def read_oneshot(text):
    a = read_json(text, ('verdict', 'conditions', 'unsupported_parts', 'reason_code'))
    if a is None or a['verdict'] not in VERDICTS or a['reason_code'] not in REASONS or not good_lists(a):
        return None
    return a


one = {rid: read_oneshot(RECORD[rid]) for rid in GOLD}
print(f'읽지 못한 답 {sum(a is None for a in one.values())}개')

# 3단계: 판정과 reason_code 와 조건을 정답과 비교한다
# 조건은 필드 단위로 센다. 한 필드에 걸린 (비교, 값) 묶음 전체가 정답과 같으면 그 필드가 맞다. 30대의 age 조건 둘은 필드 하나다.
# 정답에 없는 필드를 낸 것은 더한 필드로 따로 센다. 판정이 불가라 조건이 빈 답은 그 요청의 정답 필드를 모두 놓친다.
def by_field(conds):
    out = {}
    for field, op, value in conds:
        out.setdefault(field, set()).add((op, value))
    return out


def as_tuples(a):
    return [] if a is None else [(c['field'], c['op'], c['value']) for c in a['conditions']]


def field_score(answers):
    """answers 는 요청 id 마다 (필드, 비교, 값) 목록이다. (정답 필드 수, 맞은 필드 수, 더한 필드 수, 조건이 모두 맞은 요청 수)."""
    total = hit = extra = whole = 0
    for rid, (verdict, reason, conds) in GOLD.items():
        want, got = by_field(conds), by_field(answers[rid])
        total += len(want)
        hit += sum(got.get(f) == pairs for f, pairs in want.items())
        extra += sum(f not in want for f in got)
        whole += want == got
    return total, hit, extra, whole


def verdict_of(a):
    return a['verdict'] if a else 'unread'


def by_verdict(ok):
    """정답 판정마다 맞은 수와 요청 수."""
    return ', '.join(f'{v} {sum(GOLD[rid][0] == v for rid in ok)}/{sum(GOLD[rid][0] == v for rid in GOLD)}' for v in VERDICTS)


ok_one = [rid for rid in GOLD if verdict_of(one[rid]) == GOLD[rid][0]]
print(f'oneshot: 판정 맞음 {len(ok_one)}/30, reason_code 맞음 {sum(bool(a) and a["reason_code"] == GOLD[rid][1] for rid, a in one.items())}/30')
print('  정답 판정별 맞음: ' + by_verdict(ok_one))
print('  판정이 틀린 요청: ' + ', '.join(f'{rid} {GOLD[rid][0]} -> {verdict_of(one[rid])}' for rid in GOLD if rid not in ok_one))
print('  틀린 요청의 정답 reason_code:', dict(Counter(GOLD[rid][1] for rid in GOLD if rid not in ok_one)))
total, hit, extra, whole = field_score({rid: as_tuples(a) for rid, a in one.items()})
print(f'  조건 필드: 정답 필드 {total}개 중 맞음 {hit}개, 더한 필드 {extra}개, 조건이 모두 맞은 요청 {whole}/30')
print(f'  호출 {len(USAGE)}번: 출력 {sum(u[1] for u in USAGE.values()):,} 토큰, 기록한 시간의 합 {sum(u[2] for u in USAGE.values()) / 1000:.1f}초')
# 출력:
# 1단계 뜻: 요청 30개는 supported 12, partial 10, unsupported 8 이고, 기록과 USAGE 의 키가 요청과 같은 차례다.
# 요청 30개: supported 12, partial 10, unsupported 8
# 기록 30개, USAGE 30개, 키의 차례가 요청과 같은가 True
# 2단계 뜻: 30개 모두 스키마대로 읽힌다.
# 읽지 못한 답 0개
# 3단계 뜻: 판정은 25개, reason_code 는 30개가 맞는다. 틀린 5개는 모두 노출 이력이 붙은 일부 지원을 불가로 본 답이라 그 조건도 비었다.
# oneshot: 판정 맞음 25/30, reason_code 맞음 30/30
#   정답 판정별 맞음: supported 12/12, partial 5/10, unsupported 8/8
#   판정이 틀린 요청: n02 partial -> unsupported, n08 partial -> unsupported, n14 partial -> unsupported, n20 partial -> unsupported, n28 partial -> unsupported
#   틀린 요청의 정답 reason_code: {'exposure_history_unavailable': 5}
#   조건 필드: 정답 필드 37개 중 맞음 29개, 더한 필드 0개, 조건이 모두 맞은 요청 25/30
#   호출 30번: 출력 1,420 토큰, 기록한 시간의 합 120.9초
```

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 판정만 받은 verdict 기록 30개를 같은 정답으로 채점하고, 정답 셋과 답 셋의 혼동표를 oneshot 과 나란히 그린다.
# 기록 data/llm-records/nl-to-targeting-query-verdict.json 에서 옮김

# 1단계: verdict 기록을 둔다
# 시스템 메시지는 oneshot 에서 조건을 쓰라는 줄을 빼고, 답의 꼴을 verdict 와 reason_code 둘로 줄였다.
# 필드 10개와 조건의 꼴, reason_code 넷의 줄은 oneshot 과 같다. 읽는 법은 앞 블록의 read_json 을 쓴다.
RECORD = {"n01": "{\"verdict\": \"supported\", \"reason_code\": \"none\"}", "n02": "{\"verdict\": \"unsupported\", \"reason_code\": \"exposure_history_unavailable\"}", "n03": "{\"verdict\": \"unsupported\", \"reason_code\": \"sensitive_attribute\"}", "n04": "{\"verdict\": \"supported\", \"reason_code\": \"none\"}", "n05": "{\"verdict\": \"partial\", \"reason_code\": \"unknown_field\"}", "n06": "{\"verdict\": \"supported\", \"reason_code\": \"none\"}", "n07": "{\"verdict\": \"unsupported\", \"reason_code\": \"unknown_field\"}", "n08": "{\"verdict\": \"unsupported\", \"reason_code\": \"exposure_history_unavailable\"}", "n09": "{\"verdict\": \"supported\", \"reason_code\": \"none\"}", "n10": "{\"verdict\": \"supported\", \"reason_code\": \"none\"}", "n11": "{\"verdict\": \"unsupported\", \"reason_code\": \"exposure_history_unavailable\"}", "n12": "{\"verdict\": \"unsupported\", \"reason_code\": \"unknown_field\"}", "n13": "{\"verdict\": \"supported\", \"reason_code\": \"none\"}", "n14": "{\"verdict\": \"unsupported\", \"reason_code\": \"exposure_history_unavailable\"}", "n15": "{\"verdict\": \"supported\", \"reason_code\": \"none\"}", "n16": "{\"verdict\": \"unsupported\", \"reason_code\": \"sensitive_attribute\"}", "n17": "{\"verdict\": \"partial\", \"reason_code\": \"unknown_field\"}", "n18": "{\"verdict\": \"supported\", \"reason_code\": \"none\"}", "n19": "{\"verdict\": \"unsupported\", \"reason_code\": \"unknown_field\"}", "n20": "{\"verdict\": \"unsupported\", \"reason_code\": \"exposure_history_unavailable\"}", "n21": "{\"verdict\": \"supported\", \"reason_code\": \"none\"}", "n22": "{\"verdict\": \"partial\", \"reason_code\": \"unknown_field\"}", "n23": "{\"verdict\": \"supported\", \"reason_code\": \"none\"}", "n24": "{\"verdict\": \"unsupported\", \"reason_code\": \"exposure_history_unavailable\"}", "n25": "{\"verdict\": \"partial\", \"reason_code\": \"unknown_field\"}", "n26": "{\"verdict\": \"supported\", \"reason_code\": \"none\"}", "n27": "{\"verdict\": \"unsupported\", \"reason_code\": \"unknown_field\"}", "n28": "{\"verdict\": \"unsupported\", \"reason_code\": \"exposure_history_unavailable\"}", "n29": "{\"verdict\": \"supported\", \"reason_code\": \"none\"}", "n30": "{\"verdict\": \"unsupported\", \"reason_code\": \"exposure_history_unavailable\"}"}
USAGE = {"n01": [561, 14, 5201, 0], "n02": [574, 18, 5494, 0], "n03": [561, 16, 1722, 0], "n04": [563, 14, 1566, 0], "n05": [565, 15, 1703, 0], "n06": [571, 14, 1648, 0], "n07": [560, 15, 1725, 0], "n08": [570, 18, 1891, 0], "n09": [571, 14, 1624, 0], "n10": [562, 14, 1607, 0], "n11": [563, 18, 1984, 0], "n12": [565, 15, 1673, 0], "n13": [562, 14, 1723, 0], "n14": [568, 18, 2490, 0], "n15": [567, 14, 1588, 0], "n16": [566, 16, 1921, 0], "n17": [570, 15, 1641, 0], "n18": [564, 14, 1794, 0], "n19": [561, 15, 2007, 0], "n20": [569, 18, 2114, 0], "n21": [568, 14, 1934, 0], "n22": [566, 15, 2031, 0], "n23": [563, 14, 1699, 0], "n24": [566, 18, 2290, 0], "n25": [568, 15, 2012, 0], "n26": [566, 14, 1753, 0], "n27": [561, 15, 1838, 0], "n28": [566, 18, 1903, 0], "n29": [564, 14, 1616, 0], "n30": [565, 18, 1824, 0]}
R_VERDICT, U_VERDICT = RECORD, USAGE


def read_verdict(text):
    a = read_json(text, ('verdict', 'reason_code'))
    if a is None or a['verdict'] not in VERDICTS or a['reason_code'] not in REASONS:
        return None
    return a


ver = {rid: read_verdict(RECORD[rid]) for rid in GOLD}
print(f'기록 {len(RECORD)}개, 읽지 못한 답 {sum(a is None for a in ver.values())}개')

# 2단계: 채점하고 혼동표를 그린다
# 줄은 정답 판정이고 칸은 답의 판정이다. 대각선이 맞은 답이고, 대각선 밖은 어느 쪽으로 틀렸는지 보인다.
ok_ver = [rid for rid in GOLD if verdict_of(ver[rid]) == GOLD[rid][0]]
print(f'verdict: 판정 맞음 {len(ok_ver)}/30, reason_code 맞음 {sum(bool(a) and a["reason_code"] == GOLD[rid][1] for rid, a in ver.items())}/30')
print('  정답 판정별 맞음: ' + by_verdict(ok_ver))
for name, answers in (('oneshot', one), ('verdict', ver)):
    table = Counter((GOLD[rid][0], verdict_of(answers[rid])) for rid in GOLD)
    print(f'{name} 혼동표, 칸은 답 {" / ".join(VERDICTS)}')
    for v in VERDICTS:
        print(f'  정답 {v}: ' + ' / '.join(str(table[(v, w)]) for w in VERDICTS))

# 3단계: 틀린 방향과 두 기록의 차이를 본다
# 정답보다 덜 받은 답은 받을 수 있는 요청을 막고, 정답보다 더 받은 답은 막아야 할 요청을 받는다.
RANK = {'supported': 0, 'partial': 1, 'unsupported': 2}   # 클수록 덜 받는 판정이다
for name, answers in (('oneshot', one), ('verdict', ver)):
    wrong = [rid for rid in GOLD if verdict_of(answers[rid]) != GOLD[rid][0]]
    less = [rid for rid in wrong if answers[rid] and RANK[answers[rid]['verdict']] > RANK[GOLD[rid][0]]]
    more = [rid for rid in wrong if answers[rid] and RANK[answers[rid]['verdict']] < RANK[GOLD[rid][0]]]
    print(f'{name}: 틀린 답 {len(wrong)}개 = 덜 받은 답 {len(less)}개 + 더 받은 답 {len(more)}개 + 읽지 못한 답 {len(wrong) - len(less) - len(more)}개')
moved = [rid for rid in GOLD if verdict_of(one[rid]) != verdict_of(ver[rid])]
print('두 기록의 판정이 다른 요청: ' + ', '.join(f'{rid} oneshot {verdict_of(one[rid])}, verdict {verdict_of(ver[rid])}, 정답 {GOLD[rid][0]} {GOLD[rid][1]}' for rid in moved))
outs = [u[1] for u in USAGE.values()]
print(f'호출 {len(USAGE)}번: 출력 {sum(outs):,} 토큰(답 하나에 {min(outs)}~{max(outs)}개), 기록한 시간의 합 {sum(u[2] for u in USAGE.values()) / 1000:.1f}초')
# 출력:
# 1단계 뜻: 30개 모두 스키마대로 읽힌다.
# 기록 30개, 읽지 못한 답 0개
# 2단계 뜻: 판정만 물으면 24개가 맞아 oneshot 보다 하나 적다. 두 혼동표에서 대각선 밖은 정답 partial 줄의 unsupported 칸뿐이다.
# verdict: 판정 맞음 24/30, reason_code 맞음 30/30
#   정답 판정별 맞음: supported 12/12, partial 4/10, unsupported 8/8
# oneshot 혼동표, 칸은 답 supported / partial / unsupported
#   정답 supported: 12 / 0 / 0
#   정답 partial: 0 / 5 / 5
#   정답 unsupported: 0 / 0 / 8
# verdict 혼동표, 칸은 답 supported / partial / unsupported
#   정답 supported: 12 / 0 / 0
#   정답 partial: 0 / 4 / 6
#   정답 unsupported: 0 / 0 / 8
# 3단계 뜻: 두 기록 모두 정답보다 덜 받은 쪽으로만 틀렸다. 판정이 달라진 요청은 n12 하나이고, 판정만 받은 답은 출력 토큰이 14~18개다.
# oneshot: 틀린 답 5개 = 덜 받은 답 5개 + 더 받은 답 0개 + 읽지 못한 답 0개
# verdict: 틀린 답 6개 = 덜 받은 답 6개 + 더 받은 답 0개 + 읽지 못한 답 0개
# 두 기록의 판정이 다른 요청: n12 oneshot partial, verdict unsupported, 정답 partial unknown_field
# 호출 30번: 출력 464 토큰(답 하나에 14~18개), 기록한 시간의 합 62.0초
```

oneshot 은 판정 25개, verdict 는 24개가 맞았고, reason_code 는 둘 다 30개가 맞았습니다. oneshot 이 틀린 5개는 모두 노출 이력이 붙은 일부 지원입니다. 18주째의 캠핑 요청 n02 와, 「서울 사는 러닝 글 독자 중 우리 광고를 아직 못 본 사람」 같은 요청들입니다. 다섯 모두 reason_code 에는 노출 이력이 없다는 이유를 맞게 적고, verdict 에는 불가를 적었습니다. 18주째의 캠핑 요청에서 본 답의 모양이 다섯 요청에서 되풀이되었습니다.

verdict 는 그 다섯에 더해 n12 「태블릿으로 접속하는 여행 글 독자」도 틀렸습니다. oneshot 은 이 요청을 일부 지원으로 맞혔지만, verdict 는 같은 reason_code 를 적고 불가로 판정했습니다. 판정만 따로 묻는다고 판정의 기준이 바뀌지는 않았습니다. 노출 이력이 붙은 요청 5개는 두 기록에서 똑같이 불가였습니다.

틀린 방향은 하나였습니다. 두 기록의 틀린 답은 모두 정답보다 덜 받은 답, 곧 받을 수 있는 요청을 막은 답입니다. 정답보다 더 받은 답, 곧 막아야 할 요청을 받은 답은 0개였습니다. 건강 요청 둘과 노출 이력만 묻는 요청 셋도 두 기록 모두 불가로 판정했습니다. 덜 받은 답은 정책을 어기지 않지만, 만들 수 있던 명단을 광고주에게 주지 못합니다.

판정만 받은 답은 짧습니다. verdict 의 답은 하나에 출력 토큰 14~18개였고, 30개의 합은 464개로 oneshot 의 1,420개보다 적었습니다. 기록한 시간의 합도 62.0초로, oneshot 의 120.9초보다 짧았습니다. 판정 단계에서 막히는 요청은 짧은 호출 한 번으로 끝납니다. 막힌 요청의 조건을 조건 단계가 어떻게 옮겼는지는 3절에서 봅니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-nl-query-cards.html?embed=1&card=verdict" height="480" loading="lazy" title="oneshot 과 verdict 의 판정 셋 혼동표"></iframe>
<a class="demo-embed-open" href="demo-nl-query-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 3. 조건은 필드 이름과 값만 받습니다

**조건 단계에는 판정을 묻지 않고 필드, 비교, 값만 받았습니다. 워크플로가 쓴 조건은 정답 필드 37개 중 28개가 맞아 oneshot 의 29개보다 하나 적었습니다. 판정 없이 조건 단계의 답만 채점하면 35개가 맞았습니다.**

extract 의 시스템 메시지는 필드 10개, 조건의 꼴, 나이대와 마음을 말하는 표현의 줄을 oneshot 과 같게 두었습니다. 판정 셋과 reason_code 넷의 정의는 뺐습니다. 대신 필드로 옮길 수 없는 부분은 conditions 에 넣지 말고, unsupported_parts 에 영어 짧은 구로 적게 했습니다. 받을지 말지는 판정 단계가 정하므로, 이 단계는 문장을 필드로 옮기는 일만 합니다.

조건이 맞았는지는 필드 단위로 셉니다. 한 필드에 걸린 비교와 값이 모두 정답과 같으면 그 필드가 맞은 것입니다. 「30대」는 age 조건 둘이지만 필드는 age 하나라서, 둘 다 맞아야 한 필드가 맞습니다. 정답에 없는 필드를 낸 것은 더한 필드로 따로 셉니다. 정답 조건의 필드는 요청 30개에 모두 37개이고, 정답이 불가인 요청에는 필드가 없습니다.

아래 표는 4절 코드의 2단계가 찍은 값입니다. 워크플로는 판정 단계가 지원이나 일부 지원으로 넘긴 16개에만 조건 단계의 답을 썼습니다. 「조건 단계만」은 판정을 보지 않고 30개 모두에 조건 단계의 답을 쓴 경우입니다. 조건이 모두 맞은 요청에는 정답과 답이 둘 다 빈 조건인 요청도 들어갑니다.

| 무엇을 썼나 | 정답 필드 37개 중 맞음 | 더한 필드 | 조건이 모두 맞은 요청 |
|---|---|---|---|
| oneshot 의 조건 | 29개 | 0개 | 25/30 |
| 워크플로, 판정 단계가 넘긴 16개에만 | 28개 | 1개 | 23/30 |
| 조건 단계만, 30개 모두 | 35개 | 2개 | 26/30 |

워크플로가 하나 덜 맞은 까닭은 판정 단계에 있습니다. 판정 단계가 막은 일부 지원 6개 가운데 4개는 조건 단계의 답이 정답과 같았습니다. 캠핑 요청 n02 의 답은 나이 조건 둘과 캠핑 용품 검색 조건 하나입니다. 18주째에 thinking 을 켜고서야 받은 조건 셋과 같은 묶음입니다. 판정을 묻지 않은 조건 단계에서는 thinking 을 끈 채로 나왔지만, 워크플로는 판정 단계가 막은 이 조건을 쓰지 않았습니다.

조건 단계가 새로 틀린 것도 있습니다. n01 「러닝화 살 사람」에는 러닝화 검색에 운동 용품 구매 조건 하나를 더 붙였는데, oneshot 의 답에는 없던 조건입니다. n20 「우리 광고를 세 번 넘게 본 러닝화 검색자」에서는 노출의 「세 번」이 러닝화 검색의 문턱 3 으로 옮겨 갔습니다. n28 은 요청 전체를 unsupported_parts 에 적고 조건을 내지 않았습니다. n20 과 n28 은 판정 단계가 막아 워크플로에 들어가지 않았고, n01 은 들어갔습니다.

답의 꼴은 모델 쪽에서 강제할 수도 있습니다. Ollama 의 문서는 format 필드에 JSON 스키마를 넘겨 답이 그 스키마를 따르게 하는 방식을 적었습니다. Anthropic 의 문서도 스키마로 만든 문법에 맞는 토큰만 고르게 하는 방식을 설명합니다. 이 글의 세 기록은 꼴을 시스템 메시지로만 요청했고, 읽지 못한 답은 세 기록 모두 0개였습니다. 꼴을 강제해도 「세 번」을 어느 필드에 붙일지는 꼴 안에서 모델이 고릅니다. 그래서 맞았는지는 꼴과 따로 정답으로 셉니다.

## 4. 쿼리는 코드가 씁니다

**코드는 조건의 필드 이름과 비교를 허용 목록에서 확인한 뒤에만 쿼리를 씁니다. 표본 2,000명에서 센 명단에 7,000을 곱하면 회원 1,400만 명의 크기가 됩니다. 「러닝화 살 사람」은 조건 단계가 더한 구매 조건 하나로 표본 63명이 12명이 되었습니다.**

허용 목록(allowlist)은 받을 수 있는 이름을 미리 적어 둔 목록이고, 목록에 없는 것은 받지 않습니다. to_query 는 조건마다 필드 이름이 필드 10개에, 비교가 비교 셋에 있는지 봅니다. region 이면 값이 지역 이름 9개 가운데 하나인지, 나머지는 값이 숫자인지까지 확인한 뒤에야 WHERE 절에 씁니다. 조건이 하나도 없으면 회원 전부가 남으므로 쿼리를 쓰지 않습니다.

회원 표본 2,000명은 18주째와 같은 표본입니다. 행동 8종은 [유저 프로파일 피처](post.html?id=user-profile-features) 편의 생성기, 나이와 지역은 18주째의 함수를 글자 그대로 옮겼습니다. 세그먼트 317 이 붙는 회원은 229명이고, 전체 1,400만 명 가운데 160만 명과 같은 몫입니다. 그래서 표본에서 센 수에 7,000을 곱해 전체로 옮깁니다. audience_size 는 조건을 모두 지키는 회원을 세는 함수입니다.

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 판정 단계의 답으로 조건 단계의 답을 골라 쓰는 워크플로를 돌려, 조건이 맞은 수와 코드가 쓴 쿼리, 명단 크기, 고정 답을 센다.
# 기록 data/llm-records/nl-to-targeting-query-extract.json 에서 옮김
import random

# 1단계: extract 기록을 둔다
# 시스템 메시지는 판정과 reason_code 를 묻지 않고 필드 10개와 조건의 꼴만 적었다. 답의 꼴은 conditions 와 unsupported_parts 둘이다.
RECORD = {"n01": "{\"conditions\": [{\"field\": \"search_running_shoes\", \"op\": \">=\", \"value\": 1}, {\"field\": \"sports_goods_buy\", \"op\": \">=\", \"value\": 1}], \"unsupported_parts\": []}", "n02": "{\"conditions\": [{\"field\": \"camping_search\", \"op\": \">=\", \"value\": 1}, {\"field\": \"age\", \"op\": \">=\", \"value\": 30}, {\"field\": \"age\", \"op\": \"<=\", \"value\": 39}], \"unsupported_parts\": [\"users who have not seen our ad\"]}", "n03": "{\"conditions\": [], \"unsupported_parts\": [\"health status\"]}", "n04": "{\"conditions\": [{\"field\": \"region\", \"op\": \"==\", \"value\": \"busan\"}, {\"field\": \"camping_posts\", \"op\": \">=\", \"value\": 1}], \"unsupported_parts\": []}", "n05": "{\"conditions\": [{\"field\": \"camping_posts\", \"op\": \">=\", \"value\": 1}], \"unsupported_parts\": [\"dog owner\"]}", "n06": "{\"conditions\": [{\"field\": \"age\", \"op\": \">=\", \"value\": 20}, {\"field\": \"age\", \"op\": \"<=\", \"value\": 29}, {\"field\": \"running_posts\", \"op\": \">=\", \"value\": 5}], \"unsupported_parts\": []}", "n07": "{\"conditions\": [], \"unsupported_parts\": [\"golf players\"]}", "n08": "{\"conditions\": [{\"field\": \"region\", \"op\": \"==\", \"value\": \"seoul\"}, {\"field\": \"running_posts\", \"op\": \">=\", \"value\": 1}], \"unsupported_parts\": [\"users who have not seen our ad yet\"]}", "n09": "{\"conditions\": [{\"field\": \"sports_app_days\", \"op\": \">=\", \"value\": 10}, {\"field\": \"age\", \"op\": \">=\", \"value\": 40}], \"unsupported_parts\": []}", "n10": "{\"conditions\": [{\"field\": \"age\", \"op\": \">=\", \"value\": 30}, {\"field\": \"age\", \"op\": \"<=\", \"value\": 39}, {\"field\": \"travel_posts\", \"op\": \">=\", \"value\": 1}], \"unsupported_parts\": []}", "n11": "{\"conditions\": [], \"unsupported_parts\": [\"people who have seen our ad\"]}", "n12": "{\"conditions\": [{\"field\": \"travel_posts\", \"op\": \">=\", \"value\": 1}], \"unsupported_parts\": [\"tablet access\"]}", "n13": "{\"conditions\": [{\"field\": \"region\", \"op\": \"==\", \"value\": \"seoul\"}, {\"field\": \"cafe_posts\", \"op\": \">=\", \"value\": 1}], \"unsupported_parts\": []}", "n14": "{\"conditions\": [{\"field\": \"age\", \"op\": \">=\", \"value\": 20}, {\"field\": \"age\", \"op\": \"<=\", \"value\": 29}, {\"field\": \"travel_posts\", \"op\": \">=\", \"value\": 1}], \"unsupported_parts\": [\"already seen the ad\"]}", "n15": "{\"conditions\": [{\"field\": \"camping_search\", \"op\": \">=\", \"value\": 3}], \"unsupported_parts\": []}", "n16": "{\"conditions\": [{\"field\": \"running_posts\", \"op\": \">=\", \"value\": 1}], \"unsupported_parts\": [\"knee pain\"]}", "n17": "{\"conditions\": [{\"field\": \"search_running_shoes\", \"op\": \">=\", \"value\": 1}], \"unsupported_parts\": [\"has participated in marathon races\"]}", "n18": "{\"conditions\": [{\"field\": \"sports_goods_buy\", \"op\": \">=\", \"value\": 1}, {\"field\": \"region\", \"op\": \"==\", \"value\": \"gyeonggi\"}], \"unsupported_parts\": []}", "n19": "{\"conditions\": [], \"unsupported_parts\": [\"electric car owners\"]}", "n20": "{\"conditions\": [{\"field\": \"search_running_shoes\", \"op\": \">=\", \"value\": 3}], \"unsupported_parts\": [\"ad viewed more than three times\"]}", "n21": "{\"conditions\": [{\"field\": \"search_running_shoes\", \"op\": \">=\", \"value\": 1}, {\"field\": \"running_posts\", \"op\": \">=\", \"value\": 1}], \"unsupported_parts\": []}", "n22": "{\"conditions\": [{\"field\": \"age\", \"op\": \">=\", \"value\": 40}, {\"field\": \"age\", \"op\": \"<=\", \"value\": 49}, {\"field\": \"travel_posts\", \"op\": \">=\", \"value\": 1}], \"unsupported_parts\": [\"has car\"]}", "n23": "{\"conditions\": [{\"field\": \"age\", \"op\": \">=\", \"value\": 50}, {\"field\": \"age\", \"op\": \"<=\", \"value\": 59}, {\"field\": \"travel_posts\", \"op\": \">=\", \"value\": 1}], \"unsupported_parts\": []}", "n24": "{\"conditions\": [], \"unsupported_parts\": [\"viewed our ad more than 5 times last month\"]}", "n25": "{\"conditions\": [{\"field\": \"camping_posts\", \"op\": \">=\", \"value\": 1}, {\"field\": \"region\", \"op\": \"==\", \"value\": \"daegu\"}], \"unsupported_parts\": [\"reading hiking posts\"]}", "n26": "{\"conditions\": [{\"field\": \"cafe_posts\", \"op\": \">=\", \"value\": 3}, {\"field\": \"region\", \"op\": \"==\", \"value\": \"incheon\"}], \"unsupported_parts\": []}", "n27": "{\"conditions\": [], \"unsupported_parts\": [\"fishing interest\"]}", "n28": "{\"conditions\": [], \"unsupported_parts\": [\"readers of cafe posts who saw our ad last week\"]}", "n29": "{\"conditions\": [{\"field\": \"age\", \"op\": \"<=\", \"value\": 25}, {\"field\": \"sports_app_days\", \"op\": \">=\", \"value\": 1}], \"unsupported_parts\": []}", "n30": "{\"conditions\": [], \"unsupported_parts\": [\"users who have never seen our ad\"]}"}
USAGE = {"n01": [444, 48, 6471, 0], "n02": [457, 71, 8206, 0], "n03": [444, 12, 1610, 0], "n04": [446, 46, 3921, 0], "n05": [448, 30, 2859, 0], "n06": [454, 63, 5278, 0], "n07": [443, 13, 1560, 0], "n08": [453, 53, 4604, 0], "n09": [454, 47, 4242, 0], "n10": [445, 63, 5159, 0], "n11": [446, 16, 2007, 0], "n12": [448, 29, 3042, 0], "n13": [445, 46, 4177, 0], "n14": [451, 67, 6065, 0], "n15": [450, 28, 2939, 0], "n16": [449, 30, 3320, 0], "n17": [453, 34, 3606, 0], "n18": [447, 49, 4691, 0], "n19": [444, 13, 1703, 0], "n20": [452, 35, 3412, 0], "n21": [451, 47, 4754, 0], "n22": [449, 65, 5329, 0], "n23": [446, 63, 5150, 0], "n24": [449, 21, 2166, 0], "n25": [451, 50, 4503, 0], "n26": [449, 47, 4389, 0], "n27": [444, 13, 1288, 0], "n28": [449, 21, 2056, 0], "n29": [447, 46, 4182, 0], "n30": [448, 17, 1752, 0]}


def read_extract(text):
    a = read_json(text, ('conditions', 'unsupported_parts'))
    return a if a is not None and good_lists(a) else None


ext = {rid: read_extract(RECORD[rid]) for rid in GOLD}
print(f'기록 {len(RECORD)}개, 읽지 못한 답 {sum(a is None for a in ext.values())}개')

# 2단계: 워크플로가 조건을 고르고 정답과 비교한다
# 판정 단계가 supported 나 partial 로 낸 요청에만 조건 단계의 답을 쓴다. reason_code 가 sensitive_attribute 면 판정과 상관없이 쓰지 않는다.
# 조건 단계의 답 30개를 판정 없이 모두 쓴 경우도 센다. 판정 단계가 막은 요청의 조건이 맞았는지 보려는 것이다.
def passes(v):
    return v is not None and v['verdict'] in ('supported', 'partial') and v['reason_code'] != 'sensitive_attribute'


def show(conds):
    return ', '.join(f'{f} {op} {v}' for f, op, v in conds) or '없음'


flow = {rid: as_tuples(ext[rid]) if passes(ver[rid]) else [] for rid in GOLD}
print(f'조건 단계로 넘어간 요청 {sum(passes(v) for v in ver.values())}개')
for name, answers in (('oneshot', {rid: as_tuples(a) for rid, a in one.items()}), ('워크플로', flow),
                      ('조건 단계만', {rid: as_tuples(a) for rid, a in ext.items()})):
    total, hit, extra, whole = field_score(answers)
    print(f'  {name}: 정답 필드 {total}개 중 맞음 {hit}개, 더한 필드 {extra}개, 조건이 모두 맞은 요청 {whole}/30')
blocked = [rid for rid in GOLD if GOLD[rid][0] == 'partial' and not passes(ver[rid])]
same = [rid for rid in blocked if by_field(as_tuples(ext[rid])) == by_field(GOLD[rid][2])]
print(f'판정 단계가 막은 일부 지원 {len(blocked)}개 중 조건 단계의 답이 정답과 같은 것 {len(same)}개: {", ".join(same)}')
empty = [rid for rid in GOLD if GOLD[rid][0] == 'unsupported' and not as_tuples(ext[rid])]
print(f'정답이 불가인 {sum(g[0] == "unsupported" for g in GOLD.values())}개 중 조건 단계도 빈 조건을 낸 것 {len(empty)}개')
for rid in GOLD:
    if by_field(as_tuples(ext[rid])) != by_field(GOLD[rid][2]):
        print(f'  {rid} 조건 단계 [{show(as_tuples(ext[rid]))}], 정답 [{show(GOLD[rid][2])}], 워크플로에서 {"씀" if passes(ver[rid]) else "안 씀"}')

# 3단계: 회원 2,000명을 만든다
# 행동 8종은 유저 프로파일 피처 편, 나이와 지역은 자연어 오디언스 편의 함수를 글자 그대로 옮긴다. scripts/gen-ads-data.py 와 같다.
# 행동마다 사건의 경과일을 적는다. 0 은 오늘, 29 는 29일 전이고, 같은 날 두 번이면 두 번 적는다.
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


REGION_WEIGHTS = [18, 26, 6, 6, 5, 3, 3, 2, 31]        # 가상 가중치다. 합이 100 이다


def regions(members, seed=7):
    """회원마다 지역 하나. 나이처럼 표본을 만든 난수와 따로 뽑는다."""
    rng = random.Random(seed + 2)
    return [rng.choices(REGIONS, weights=REGION_WEIGHTS)[0] for _ in members]


behaviors = make_members(2000)
age = ages(behaviors)
age[0] = 32                                          # 회원 A 는 다른 글과 같게 32세
region = regions(behaviors)
region[0], region[1] = 'seoul', 'busan'              # 회원 A 는 서울, 회원 B 는 부산
members = [dict(counts(m), age=a, region=r) for m, a, r in zip(behaviors, age, region)]
print(f'회원 {len(members):,}명, 필드 {len(FIELDS)}개, 세그먼트 317 은 {sum(in_segment_317(m) for m in behaviors)}명')

# 4단계: 코드가 쿼리를 쓰고 명단 크기를 센다
# to_query 는 필드 이름과 비교를 허용 목록(FIELDS, OPS)에서 찾고 값의 꼴까지 본 뒤에만 쿼리를 쓴다. 목록 밖이거나 조건이 없으면 ValueError 다.
# 전체 회원 1,400만 명은 표본의 7,000배다. 정답 조건으로 센 크기도 같이 찍는다.
SCALE = 14000000 // len(members)


def to_query(conditions):
    if not conditions:
        raise ValueError('조건이 없으면 회원 전부가 남아 쿼리를 쓰지 않는다')
    where = []
    for field, op, value in conditions:
        if field not in FIELDS or op not in OPS:
            raise ValueError(f'허용 목록에 없는 필드나 비교: {field} {op}')
        if field == 'region':
            if op != '==' or value not in REGIONS:
                raise ValueError(f'region 은 == 와 지역 이름 하나만 받는다: {value!r}')
            where.append(f"region = '{value}'")
        elif isinstance(value, (int, float)) and not isinstance(value, bool):
            where.append(f'{field} {op} {value}')
        else:
            raise ValueError(f'{field} 의 값은 숫자다: {value!r}')
    return 'SELECT COUNT(*) FROM members WHERE ' + ' AND '.join(where)


def audience_size(conditions, members):
    """members 는 필드 10개를 가진 회원 줄의 목록이다. 조건을 모두 지키는 회원 수를 센다."""
    return sum(all(OPS[op](m[field], value) for field, op, value in conditions) for m in members)


for rid in ('n01', 'n04', 'n22'):
    n, g = audience_size(flow[rid], members), audience_size(GOLD[rid][2], members)
    print(f'{rid}: {to_query(flow[rid])}')
    print(f'    표본 {n:,}명, 1,400만 명으로 늘리면 {n * SCALE:,}명. 정답 조건이면 표본 {g:,}명, {g * SCALE:,}명')
try:
    to_query([('age', '>=', 30), ('region', '==', "seoul' OR '1'='1")])     # 가상으로 만든 틀린 조건이다
except ValueError as e:
    print('가상 조건은 쿼리가 되지 않는다:', e)
print('판정 단계가 막은 일부 지원의 정답 조건 명단: ' + ', '.join(f'{rid} {audience_size(GOLD[rid][2], members)}명' for rid in blocked))

# 5단계: 판정과 reason_code 로 고정 답을 고른다
# 광고주에게 가는 글은 사람이 미리 적어 둔 문장이고, LLM 이 쓴 글은 보내지 않는다. {size} 자리에만 코드가 센 회원 수가 들어간다.
# reason_code 마다 판정에 맞는 문장을 둔다. 표에 없는 짝, 읽지 못한 답, 조건이 빈 지원과 일부 지원은 담당자가 본다.
TEMPLATES = {
    'none': {'supported': '조건에 맞는 회원은 약 {size}명입니다.'},
    'unknown_field': {
        'partial': '회원 정보에 없는 조건은 빼고 만들었습니다. 남은 조건에 맞는 회원은 약 {size}명입니다.',
        'unsupported': '요청한 조건이 회원 정보에 없어 만들 수 없습니다. 나이, 지역, 최근 30일 행동으로 다시 적어 주시면 만들겠습니다.'},
    'exposure_history_unavailable': {
        'partial': '광고를 본 적이 있는지는 조건으로 쓸 수 없어 빼고 만들었습니다. 남은 조건에 맞는 회원은 약 {size}명입니다.',
        'unsupported': '광고를 본 적이 있는지는 조건으로 쓸 수 없어 만들 수 없습니다. 나이, 지역, 최근 30일 행동으로 다시 적어 주시면 만들겠습니다.'},
    'sensitive_attribute': {
        'unsupported': '요청에 건강 상태처럼 민감한 정보로 고르는 조건이 있어 만들 수 없습니다. 관심사나 행동 조건으로 바꿔 주시면 다시 만들겠습니다.'},
}


def reply(rid):
    """요청 하나에 보낼 (템플릿 이름, 글, 회원 수). 담당자에게 넘기면 ('review', None, None) 이다."""
    v = ver[rid]
    if v is None:
        return 'review', None, None
    verdict = 'unsupported' if v['reason_code'] == 'sensitive_attribute' else v['verdict']   # 민감한 정보는 판정과 상관없이 거절한다
    text = TEMPLATES.get(v['reason_code'], {}).get(verdict)
    if text is None or (verdict != 'unsupported' and not flow[rid]):
        return 'review', None, None
    name = f"{v['reason_code']}/{verdict}"
    if verdict == 'unsupported':
        return name, text, None
    size = audience_size(flow[rid], members) * SCALE
    return name, text.format(size=f'{size:,}'), size


replies = {rid: reply(rid) for rid in GOLD}
groups = {}
for rid, (name, text, size) in replies.items():
    groups.setdefault(name, []).append(rid)
for name, ids in groups.items():
    print(f'{name} {len(ids)}개: {", ".join(ids)}')
print(f"담당자에게 넘긴 답 {len(groups.get('review', []))}개. 쓰이지 않은 템플릿: "
      + (', '.join(f'{r}/{v}' for r in TEMPLATES for v in TEMPLATES[r] if f'{r}/{v}' not in groups) or '없음'))
for rid in ('n01', 'n05'):
    print(f'{rid} 의 회원 수 자리: {replies[rid][2]:,}명')
wrong = Counter(replies[rid][0] for rid in GOLD if verdict_of(ver[rid]) != GOLD[rid][0])
print('판정이 정답과 다른 요청이 받은 답: ' + ', '.join(f'{name} {n}개' for name, n in wrong.items()))
spare = [rid for rid in GOLD if ver[rid] and ver[rid]['verdict'] == 'unsupported'
         and ver[rid]['reason_code'] != 'sensitive_attribute' and as_tuples(ext[rid])]
print(f'민감한 정보가 아닌 불가인데 조건 단계의 답에 조건이 있는 요청 {len(spare)}개: {", ".join(spare)}')

# 6단계: 호출 수와 토큰과 시간을 oneshot 과 비교한다
# 워크플로는 판정을 30번 부르고, 조건 단계로 넘어간 요청만 한 번씩 더 부른다. 시간은 기록한 elapsed_ms 의 합이다.
calls = list(U_VERDICT.values()) + [USAGE[rid] for rid in GOLD if passes(ver[rid])]
for name, uses in (('oneshot', list(U_ONESHOT.values())), ('워크플로', calls)):
    print(f'{name}: 호출 {len(uses)}번, 입력 {sum(u[0] for u in uses):,} 토큰, 출력 {sum(u[1] for u in uses):,} 토큰, '
          f'시간의 합 {sum(u[2] for u in uses) / 1000:.1f}초')
# 출력:
# 1단계 뜻: 30개 모두 스키마대로 읽힌다.
# 기록 30개, 읽지 못한 답 0개
# 2단계 뜻: 판정 단계가 넘긴 16개에만 조건을 써서 워크플로는 정답 필드 28개를 맞힌다. 조건 단계만 쓰면 35개이고, 막힌 일부 지원 6개 중 4개는 조건이 정답과 같다.
# 조건 단계로 넘어간 요청 16개
#   oneshot: 정답 필드 37개 중 맞음 29개, 더한 필드 0개, 조건이 모두 맞은 요청 25/30
#   워크플로: 정답 필드 37개 중 맞음 28개, 더한 필드 1개, 조건이 모두 맞은 요청 23/30
#   조건 단계만: 정답 필드 37개 중 맞음 35개, 더한 필드 2개, 조건이 모두 맞은 요청 26/30
# 판정 단계가 막은 일부 지원 6개 중 조건 단계의 답이 정답과 같은 것 4개: n02, n08, n12, n14
# 정답이 불가인 8개 중 조건 단계도 빈 조건을 낸 것 7개
#   n01 조건 단계 [search_running_shoes >= 1, sports_goods_buy >= 1], 정답 [search_running_shoes >= 1], 워크플로에서 씀
#   n16 조건 단계 [running_posts >= 1], 정답 [없음], 워크플로에서 안 씀
#   n20 조건 단계 [search_running_shoes >= 3], 정답 [search_running_shoes >= 1], 워크플로에서 안 씀
#   n28 조건 단계 [없음], 정답 [cafe_posts >= 1], 워크플로에서 안 씀
# 3단계 뜻: 회원 2,000명과 세그먼트 317 의 229명은 18주째 글과 같은 표본이다.
# 회원 2,000명, 필드 10개, 세그먼트 317 은 229명
# 4단계 뜻: 쿼리는 허용 목록을 지난 조건으로만 쓴다. n01 은 조건 단계가 더한 구매 조건 하나로 63명이 12명이 되고, 가상 조건은 쿼리가 되지 않는다.
# n01: SELECT COUNT(*) FROM members WHERE search_running_shoes >= 1 AND sports_goods_buy >= 1
#     표본 12명, 1,400만 명으로 늘리면 84,000명. 정답 조건이면 표본 63명, 441,000명
# n04: SELECT COUNT(*) FROM members WHERE region = 'busan' AND camping_posts >= 1
#     표본 16명, 1,400만 명으로 늘리면 112,000명. 정답 조건이면 표본 16명, 112,000명
# n22: SELECT COUNT(*) FROM members WHERE age >= 40 AND age <= 49 AND travel_posts >= 1
#     표본 163명, 1,400만 명으로 늘리면 1,141,000명. 정답 조건이면 표본 163명, 1,141,000명
# 가상 조건은 쿼리가 되지 않는다: region 은 == 와 지역 이름 하나만 받는다: "seoul' OR '1'='1"
# 판정 단계가 막은 일부 지원의 정답 조건 명단: n02 59명, n08 76명, n12 554명, n14 86명, n20 63명, n28 773명
# 5단계 뜻: 30개 모두 템플릿으로 답하고 담당자에게 간 답은 없다. 판정이 틀린 6개는 불가 문장을 받았고, 노출 이력의 일부 지원 문장은 쓰이지 않는다.
# none/supported 12개: n01, n04, n06, n09, n10, n13, n15, n18, n21, n23, n26, n29
# exposure_history_unavailable/unsupported 8개: n02, n08, n11, n14, n20, n24, n28, n30
# sensitive_attribute/unsupported 2개: n03, n16
# unknown_field/partial 4개: n05, n17, n22, n25
# unknown_field/unsupported 4개: n07, n12, n19, n27
# 담당자에게 넘긴 답 0개. 쓰이지 않은 템플릿: exposure_history_unavailable/partial
# n01 의 회원 수 자리: 84,000명
# n05 의 회원 수 자리: 1,715,000명
# 판정이 정답과 다른 요청이 받은 답: exposure_history_unavailable/unsupported 5개, unknown_field/unsupported 1개
# 민감한 정보가 아닌 불가인데 조건 단계의 답에 조건이 있는 요청 5개: n02, n08, n12, n14, n20
# 6단계 뜻: 워크플로는 호출이 46번으로 늘고 출력 토큰은 1,236개로 줄며, 시간의 합은 133.7초다.
# oneshot: 호출 30번, 입력 19,036 토큰, 출력 1,420 토큰, 시간의 합 120.9초
# 워크플로: 호출 46번, 입력 24,145 토큰, 출력 1,236 토큰, 시간의 합 133.7초
```

쿼리 세 줄은 n01, n04, n22 의 것입니다. n01 은 조건 단계가 더한 운동 용품 구매 때문에 표본 12명, 전체로 84,000명이 되었습니다. 정답 조건이면 표본 63명, 전체 441,000명이고, 63명은 같은 조건을 센 18주째의 수와 같습니다. 조건 하나가 명단을 441,000명에서 84,000명으로 줄였고, 서연 씨는 그 수를 보고 하루 300만 원을 걸지 정합니다. n04 는 지역 값이 따옴표 안에 들어가고, n22 는 「자동차가 있는」을 뺀 조건 셋으로 163명입니다.

허용 목록이 막는 것은 가상으로 만든 조건 하나로 보입니다. 지역 값에 `seoul' OR '1'='1` 을 넣으면 to_query 는 쿼리를 쓰지 않고 멈춥니다. 이 값을 WHERE 절에 그대로 붙이면 따옴표가 닫히고 뒤의 OR 가 조건이 되어, 나이와 지역에 상관없이 회원 전부가 남습니다. 값이 쿼리의 일부가 되게 만드는 이런 입력을 SQL 인젝션이라고 부릅니다. LLM 에게 SQL 을 쓰게 하면 이런 글이 들어올 자리가 생기고, 조건 JSON 만 받으면 그 자리가 허용 목록으로 좁혀집니다.

판정 단계가 막은 일부 지원 6개는 정답 조건이면 표본 59명에서 773명의 명단이었습니다. 캠핑 요청 n02 는 59명이고, 카페 글 독자를 고르는 n28 은 773명입니다. 이 명단들은 광고주에게 가지 않았고, 대신 5절의 불가 문장이 갔습니다. 덜 받은 판정 하나의 값을 이렇게 명단 크기로 셀 수 있습니다. 명단이 없으면 서연 씨는 그 요청에 돈을 걸 수도 없습니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-nl-query-cards.html?embed=1&card=query" height="480" loading="lazy" title="조건 JSON 을 코드가 확인해 쿼리로 쓰고 회원 수를 세는 자리"></iframe>
<a class="demo-embed-open" href="demo-nl-query-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 5. 거절과 일부 지원은 고정 템플릿으로 답합니다

**광고주에게 가는 글은 코드가 판정과 reason_code 로 고르는 고정 템플릿입니다. 이 기록의 답 30개는 모두 템플릿 문장으로 나갔고, 담당자에게 넘어간 답은 없었습니다. 노출 이력의 일부 지원 문장은 판정 단계가 그 짝을 한 번도 내지 않아 쓰이지 않았습니다.**

템플릿은 reason_code 마다, 그 안에서 판정마다 한 문장씩 모두 여섯입니다. 지원과 일부 지원의 문장에는 회원 수 자리가 있고, 그 자리에만 코드가 센 수가 들어갑니다. 불가의 문장은 왜 만들 수 없는지와 다시 적는 법을 말합니다. 건강 요청의 문장은 18주째에 정해 둔 거절 템플릿을 그대로 썼습니다.

코드는 다섯 가지를 차례로 봅니다. 판정 단계의 답을 읽지 못하면 담당자에게 넘깁니다. reason_code 가 sensitive_attribute 면 판정과 상관없이 거절 문장을 보냅니다. 판정과 reason_code 의 짝이 표에 없으면 담당자에게 넘기고, 18주째 기록의 일부 지원과 none 의 짝이 그런 경우입니다. 지원이나 일부 지원인데 조건이 비었으면 회원 전부가 남으므로 역시 담당자에게 넘깁니다. 나머지는 템플릿에 회원 수를 넣어 보냅니다.

아래 표는 4절 코드의 5단계가 고른 답을 템플릿마다 모은 것입니다. 「광고주에게 간 글」은 그 템플릿을 받은 요청 하나의 글이고, 회원 수는 같은 단계가 찍은 값입니다.

| reason_code, 판정 | 이 기록에서 | 광고주에게 간 글 |
|---|---|---|
| none, supported | 12개 | n01 「조건에 맞는 회원은 약 84,000명입니다.」 |
| unknown_field, partial | 4개 | n05 「회원 정보에 없는 조건은 빼고 만들었습니다. 남은 조건에 맞는 회원은 약 1,715,000명입니다.」 |
| unknown_field, unsupported | 4개 | n07 「요청한 조건이 회원 정보에 없어 만들 수 없습니다. 나이, 지역, 최근 30일 행동으로 다시 적어 주시면 만들겠습니다.」 |
| exposure_history_unavailable, partial | 0개 | 쓰이지 않음 |
| exposure_history_unavailable, unsupported | 8개 | n02 「광고를 본 적이 있는지는 조건으로 쓸 수 없어 만들 수 없습니다. 나이, 지역, 최근 30일 행동으로 다시 적어 주시면 만들겠습니다.」 |
| sensitive_attribute, unsupported | 2개 | n16 「요청에 건강 상태처럼 민감한 정보로 고르는 조건이 있어 만들 수 없습니다. 관심사나 행동 조건으로 바꿔 주시면 다시 만들겠습니다.」 |

일부 지원의 문장은 빠진 조건이 있다는 것을 먼저 말하고 회원 수를 말합니다. 광고주는 무엇이 빠진 명단인지 알고 돈을 겁니다. unsupported_parts 의 영어 구는 담당자가 읽는 메모라서 광고주 화면에 내지 않습니다. 같은 판정과 reason_code 에는 늘 같은 문장이 가고, 그 문장은 사람이 정해 검토한 말입니다.

노출 이력의 일부 지원 문장이 쓰이지 않은 것은 2절의 판정 때문입니다. 판정이 정답과 다른 요청 가운데 5개가 노출 이력의 불가 문장을, 1개가 필드에 없는 정보의 불가 문장을 받았습니다. 조건 단계의 기록에서는 민감한 정보가 아닌 불가인데 조건이 있는 요청이 5개였습니다. 이런 요청을 불가 문장 대신 담당자에게 넘기려면, 불가로 판정된 요청에도 조건 단계를 불러야 합니다. 호출이 그만큼 늘지만, 담당자가 막힌 명단을 다시 만들 수 있습니다.

거절 문장은 정책을 말하는 자리라서 LLM 에게 쓰게 하지 않았습니다. LLM 은 enum 과 숫자와 영어 짧은 구만 돌려주고, 광고주가 읽는 글은 템플릿에서만 나옵니다. 그래서 같은 판정에는 늘 같은 글이 갑니다. 판정이 틀리면 글도 틀리게 나가므로, 고칠 곳은 글이 아니라 판정 단계의 시스템 메시지입니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-nl-query-cards.html?embed=1&card=reply" height="480" loading="lazy" title="reason_code 와 판정의 짝마다 정해 둔 템플릿과 받은 요청 수"></iframe>
<a class="demo-embed-open" href="demo-nl-query-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 6. 허용 목록에 넣을 수 있는 필드가 무대마다 다릅니다

**네 단계와 허용 목록의 쓰임은 두 무대가 같습니다. 다른 것은 허용 목록에 어떤 필드를 넣을 수 있느냐와, 쿼리가 누구의 데이터를 세느냐입니다. 담장 안은 노출 기록까지 필드로 더할 수 있고, 열린 RTB 의 DSP 는 자기가 이긴 경매의 노출만 압니다.**

1~5절의 셈은 두 무대가 같습니다. 담장 안은 한 회사가 서비스와 광고 서버를 다 가진 곳이고, 열린 RTB 는 여러 회사가 실시간 경매로 남의 지면에 광고를 사고파는 곳입니다. 두 무대의 이름은 18주째 편 8절에서 풀었습니다.

### 담장 안에서는 노출 이력을 필드로 더할 수 있습니다 [무대: 닫힌 생태계]

담장 안의 플랫폼은 회원의 행동, 나이, 지역과 함께 광고를 내보낸 기록도 같은 회원 번호로 갖습니다. 그래서 「30일 동안 이 광고주의 광고를 본 횟수」 같은 필드를 더할 수 있습니다. 그러면 이 기록에서 노출 이력 때문에 막힌 요청들도 조건으로 옮겨집니다. 필드를 더할 때는 판정과 조건 단계의 시스템 메시지, to_query 의 허용 목록, 템플릿을 함께 고칩니다. 단계마다 기록과 채점을 따로 두었으니, 고친 뒤에는 그 단계만 다시 잴 수 있습니다.

민감한 정보를 막는 줄은 플랫폼의 광고 정책과 같은 쪽을 봅니다. Google Ads 의 개인 맞춤 광고 정책은 건강을 민감한 관심 카테고리 목록에 두었습니다. 그 카테고리의 상품이나 서비스를 광고할 때는 광고주가 직접 만든 오디언스를 쓸 수 없다고도 적었습니다. 이 글의 판정 단계는 광고하는 상품과 상관없이, 건강으로 사람을 고르는 요청 자체를 받지 않습니다.

### 열린 RTB 에서는 DSP 가 쿠키 기록으로 명단을 셉니다 [무대: 열린 RTB]

열린 RTB 에서 광고를 사는 쪽의 시스템인 DSP 는, 사람을 쿠키나 기기의 광고 ID 로 알아봅니다. 허용 목록에 넣을 수 있는 필드도 DSP 가 그 값에 붙여 모은 행동과 사 온 데이터입니다. 노출은 자기가 이긴 경매의 것만 남아서, 노출 필드를 더해도 다른 DSP 가 보인 노출은 모릅니다. 그래서 「우리 광고 안 본」 같은 요청은 그 DSP 가 보인 적이 없다는 뜻에 그칩니다.

명단은 캠페인을 걸 때 한 번 만들고, 입찰 요청마다 만들지 않습니다. 입찰 응답은 100ms 안팎에 돌려줘야 하지만, 명단을 만드는 두 번의 호출은 그 시간 밖에 있습니다. 이 기록에서 워크플로의 호출 46번은 시간의 합이 133.7초였습니다. 두 무대 모두 이 시간은 캠페인을 거는 화면에서 기다리는 시간입니다.

아래 표는 가상 데이터가 아니라 두 무대의 설계 차이를 적은 것입니다.

| 무엇 | 담장 안 | 열린 RTB |
|---|---|---|
| 허용 목록의 필드 | 회원의 행동, 나이, 지역. 노출 횟수도 더할 수 있다 | DSP 가 쿠키와 광고 ID 에 붙여 모은 행동, 사 온 데이터 |
| 노출 이력이 붙은 요청 | 노출 필드를 더하면 조건이 된다 | 자기 노출만 알아서, 「안 본」은 그 DSP 기준이다 |
| 민감한 정보 | 판정 단계가 막고, 플랫폼 정책도 같은 쪽이다 | 판정 단계가 막는다 |
| 명단을 만드는 때 | 캠페인을 걸 때 한 번 | 같다. 입찰마다 만들지 않는다 |

## 한눈 정리

| 자리 | 무엇을 하나 | 이 기록의 숫자 |
|---|---|---|
| oneshot | 판정과 조건을 한 번에 받는다 | 판정 25/30, 정답 필드 37개 중 29개 |
| 판정 단계 | verdict 와 reason_code 만 받는다 | 판정 24/30, 틀린 6개는 모두 덜 받은 답 |
| 조건 단계 | 필드, 비교, 값만 받는다 | 판정 없이 채점하면 정답 필드 35개 |
| 워크플로 | 판정이 넘긴 16개에만 조건을 쓴다 | 정답 필드 28개, 더한 필드 1개 |
| 쿼리 | 코드가 허용 목록을 확인하고 쓴다 | n01 은 63명이 12명, 가상 조건은 멈춘다 |
| 답 | 판정과 reason_code 로 템플릿을 고른다 | 30개 모두 템플릿, 담당자 0개 |
| 호출 | 판정 30번에 조건 16번을 더한다 | 46번, 출력 1,236 토큰, 133.7초 |

## 헷갈리기 쉬운 점

- **불가도 정상 답입니다.** 정답이 불가인 8개는 oneshot 과 verdict 모두 불가로 판정했습니다. 워크플로는 이 8개에 쿼리를 쓰지 않고 템플릿으로 답했습니다. 불가는 실패한 답이 아니라 정해 둔 답의 하나입니다. 이 기록에서 문제가 된 것은 불가 자체가 아니라, 일부 지원을 불가로 본 덜 받은 판정입니다.
- **민감 정보는 비슷한 행동 필드로 바꿔 옮기지도 않습니다.** 판정 단계의 정의 줄은 민감한 정보가 든 요청 전체를 불가로 두고, 비슷한 행동 필드로 바꿔 옮기는 것도 막습니다. 조건 단계만 따로 물으면 「무릎 통증이 있는 러닝 글 독자」에서 무릎 통증만 빼고 러닝 글 조건을 냈습니다. 그대로 쓰면 건강으로 고른 요청에 명단이 나갑니다. 그래서 코드는 sensitive_attribute 면 판정과 상관없이 조건을 쓰지 않습니다.
- **LLM 에게 쿼리를 쓰게 하지 않는 데는 이유가 있습니다.** 문장을 SQL 로 바꾸는 일을 Text-to-SQL 이라고 부릅니다. BIRD 논문은 데이터베이스 95개로 만든 문제를 썼습니다. 가장 잘한 모델이 쓴 SQL 도 돌린 결과가 맞은 비율이 사람보다 크게 낮았다고 적었습니다. 이 글은 LLM 에게 조건 JSON 만 받고, 코드가 허용 목록을 확인한 뒤 쿼리를 씁니다. 가상으로 만든 지역 값 하나도 그 목록을 지나지 못했습니다.

## 더 깊이 보기

:::deep 시스템 메시지 셋 전문
기록에 보낸 시스템 메시지 셋입니다. 사용자 메시지는 셋 다 「요청: 」 뒤에 광고주의 문장을 붙인 한 줄입니다. oneshot 은 18주째 편의 시스템 메시지와 글자까지 같습니다. 두 파일은 `scripts/gen-nl-requests.py --check` 가 대조합니다.

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

verdict 는 첫 줄을 판정기로 바꾸고, 판정 셋의 정의에서 conditions 에 관한 말을 뺐습니다. unsupported_parts 의 줄도 뺐고, 마지막 두 줄은 답의 꼴을 verdict 와 reason_code 둘로 줄였습니다.

```text
너는 광고 오디언스 요청 판정기다. 광고주가 쓴 요청 한 문장을 읽고, 그 요청을 회원을 고를 조건으로 옮길 수 있는지 판정을 JSON 으로 돌려준다.
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
partial: 요청의 일부만 옮길 수 있다.
unsupported: 요청을 조건으로 옮길 수 없거나 옮기면 안 된다.
reason_code 는 넷 가운데 하나다.
none: 옮기지 못한 부분이 없다.
sensitive_attribute: 건강, 질병, 종교, 정치 성향, 성적 지향처럼 민감한 정보로 사람을 고르는 요청이다. 판정은 unsupported 이고, 비슷한 행동 필드로 바꿔 옮기지도 않는다.
unknown_field: 위 10개 필드에 없는 정보가 필요하다.
exposure_history_unavailable: 광고를 본 적이 있는지 같은 광고 노출 이력이 필요하다. 노출 이력은 필드에 없다.
답은 아래 꼴의 JSON 한 줄로만 쓴다. 조건은 쓰지 않는다. 설명이나 다른 글은 붙이지 않는다.
{"verdict": "<판정>", "reason_code": "<이유>"}
```

extract 는 첫 줄을 조건 추출기로 바꾸고, 판정 셋과 reason_code 넷의 줄을 뺐습니다. 필드로 옮길 수 없는 부분을 적는 줄은 판정 없이도 읽히게 고쳐 썼습니다. 마지막 두 줄은 답의 꼴을 conditions 와 unsupported_parts 둘로 바꿨습니다. 민감한 정보의 줄도 없어서, 건강 요청을 막는 일은 판정 단계에만 있습니다.

```text
너는 광고 오디언스 조건 추출기다. 광고주가 쓴 요청 한 문장을 읽고, 회원을 고를 조건을 JSON 으로 돌려준다.
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
위 필드로 옮길 수 없는 부분은 conditions 에 넣지 말고 unsupported_parts 에 영어 짧은 구로 적는다. 옮기지 못한 부분이 없으면 빈 목록이다.
답은 아래 꼴의 JSON 한 줄로만 쓴다. 판정은 쓰지 않는다. 설명이나 다른 글은 붙이지 않는다.
{"conditions": [{"field": "<필드>", "op": "<비교>", "value": <값>}], "unsupported_parts": ["<영어 짧은 구>"]}
```
:::

:::deep 템플릿 전문과 짝으로 둔 까닭
템플릿 여섯의 전문입니다. {size} 자리에는 코드가 표본에서 센 회원 수에 7,000을 곱한 값이 쉼표를 넣어 들어갑니다.

```text
none, supported
  조건에 맞는 회원은 약 {size}명입니다.
unknown_field, partial
  회원 정보에 없는 조건은 빼고 만들었습니다. 남은 조건에 맞는 회원은 약 {size}명입니다.
unknown_field, unsupported
  요청한 조건이 회원 정보에 없어 만들 수 없습니다. 나이, 지역, 최근 30일 행동으로 다시 적어 주시면 만들겠습니다.
exposure_history_unavailable, partial
  광고를 본 적이 있는지는 조건으로 쓸 수 없어 빼고 만들었습니다. 남은 조건에 맞는 회원은 약 {size}명입니다.
exposure_history_unavailable, unsupported
  광고를 본 적이 있는지는 조건으로 쓸 수 없어 만들 수 없습니다. 나이, 지역, 최근 30일 행동으로 다시 적어 주시면 만들겠습니다.
sensitive_attribute, unsupported
  요청에 건강 상태처럼 민감한 정보로 고르는 조건이 있어 만들 수 없습니다. 관심사나 행동 조건으로 바꿔 주시면 다시 만들겠습니다.
```

템플릿을 reason_code 하나가 아니라 판정과의 짝으로 둔 까닭이 있습니다. 같은 노출 이력이라도 일부 지원이면 명단이 있고, 불가면 명단이 없습니다. 그래서 같은 reason_code 에 문장이 둘 필요합니다. 짝이 표에 없으면 그 답은 시스템 메시지의 정의와 맞지 않는 답이라, 코드는 템플릿을 고르지 않고 담당자에게 넘깁니다. 표 하나가 보낼 문장의 목록이면서, 받을 수 있는 짝의 허용 목록이기도 합니다.
:::

:::deep 기록한 방법과 이 기록으로 말할 수 없는 것
세 기록은 2026-11-07 에 차례로 받았습니다. 프롬프트 파일 셋은 `scripts/gen-nl-requests.py --prompts` 가 씁니다. 요청 30개의 리터럴도 그 파일에 있고, 글의 첫 블록에 글자 그대로 들어 있는지 `--check` 가 봅니다. 기록을 다시 받으면 파일 전체가 바뀌므로 글의 숫자도 다시 맞춥니다.

n02 의 oneshot 답은 18주째 기록의 기준 답과 판정, 조건, reason_code 가 같았습니다. 다른 것은 unsupported_parts 의 영어 구 하나였습니다. 18주째의 답은 「people who have not seen our ad」였습니다. 이번 답은 「users who have not seen our ad」입니다. 같은 설정으로 다시 기록해도 답의 글자는 달라질 수 있다는 뜻입니다.

이 기록으로 말할 수 없는 것도 셋입니다. 설정마다 한 벌씩이라 temperature 를 올렸을 때의 흔들림은 재지 않았습니다. thinking 을 켠 판정 단계도 재지 않았습니다. 정답은 지훈 씨가 시스템 메시지의 정의대로 붙인 값이라, 다른 사람이 붙이면 일부가 달라질 수 있습니다. 「골프 치는 사람」을 운동 용품 구매로 옮길 수 있다고 보면 이 요청은 불가가 아니게 됩니다.
:::

- [자연어 오디언스](post.html?id=natural-language-audience) — 판정과 조건을 한 번에 받은 18주째 편입니다. 이 글의 oneshot 이 그 시스템 메시지입니다.
- [구조화 출력](post.html?id=structured-output) — 스키마로 읽고 읽지 못한 답을 세는 법이 처음 나온 22주째 편입니다.
- [Tool use 와 에이전트 루프](post.html?id=tool-use-agent-loop) — 다음 단계를 모델이 고르는 25주째 편입니다. 이 글의 워크플로는 차례를 코드가 정합니다.
- [자연어 → 타겟 조건 카드 네 장](demo-nl-query-cards.html) — 이 글의 카드 전체입니다. 카드를 누르면 헷갈리는 것 하나가 더 나옵니다.

## 참고문헌

- Anthropic. *Structured outputs*. Claude API 문서. [platform.claude.com](https://platform.claude.com/docs/en/build-with-claude/structured-outputs). 스키마로 만든 문법에 맞는 토큰만 골라 답이 스키마를 따르게 하는 방식입니다. 거절한 답과 max_tokens 에서 잘린 답은 스키마와 다를 수 있다고 적었습니다.
- Ollama. *Structured Outputs*. Ollama 문서. [docs.ollama.com](https://docs.ollama.com/capabilities/structured-outputs). format 필드에 JSON 스키마를 넘겨 답의 꼴을 정하는 방식입니다. 스키마를 프롬프트에도 문자열로 넣고, temperature 를 0 처럼 낮추라고 권합니다.
- Li, J. 외 (2023). *Can LLM Already Serve as A Database Interface? A BIg Bench for Large-Scale Database Grounded Text-to-SQLs*. NeurIPS 2023. [arXiv:2305.03111](https://arxiv.org/abs/2305.03111). 데이터베이스 95개와 문장, SQL 쌍 12,751개로 만든 BIRD 벤치마크입니다. 가장 잘한 모델도 실행 결과의 정확도가 사람과 거리가 멀었다고 적었습니다.
- Google. *Restricted targeting in Personalized advertising*. Google Ads 정책 도움말. [support.google.com](https://support.google.com/adspolicy/answer/143465). 개인 맞춤 광고에서 타겟팅을 제한하는 카테고리 목록입니다. 건강(Health)을 민감한 관심 카테고리에 두고, 그 카테고리를 광고할 때는 광고주가 만든 오디언스를 쓸 수 없다고 적었습니다.
