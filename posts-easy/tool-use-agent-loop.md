모델 팀 25주째 월요일, 지훈 씨는 선배의 노트북 화면을 옆에서 봤습니다. 서연 씨의 러닝화 광고가 어제 쓴 돈에 비해 덜 팔았다는 메모가 떠 있었습니다. 선배는 모델에게 「목표보다 덜 버는 광고의 입찰가를 조금 내려 달라」고 적어 보냈습니다.

지훈 씨는 모델이 바로 답을 쓸 거라고 생각했지만 모델은 답 대신 짧은 요청을 돌려보냈습니다. 요청에는 광고 목록을 꺼내는 함수의 이름과 빈 입력이 적혀 있었습니다. 선배가 그 함수를 돌려 목록을 건네자 모델은 광고마다 어제 숫자를 보여 달라고 했습니다.

**모델이 직접 하지 않는다면, 입찰가는 누가 바꾸고 이 주고받기는 언제 끝날까요?**

숫자를 받은 모델은 러닝화 광고의 입찰가를 10% 내리는 함수를 불러 달라고 했습니다. 입찰가는 그 요청을 받아 함수를 돌린 선배의 코드가 바꿨습니다. 모델은 다음에 무엇을 부를지 고르기만 했습니다. 선배는 그 고르기를 어디서 멈추게 할지 정하는 일이 이번 주 숙제라고 했습니다.

> **한 줄 요약:** 언어 모델(LLM)이 답을 쓰는 대신 부를 함수를 고르게 하는 방식을 tool use 라고 부릅니다. 이때 모델에게 건네는 함수가 도구이고 도구마다 적어 주는 이름, 설명, 입력 꼴이 도구 정의입니다. 모델은 도구를 직접 실행하지 않고 부를 도구와 입력을 적어 돌려줄 뿐입니다. 모델이 도구를 고르면 코드가 실행해 결과를 돌려주는 프로그램을 에이전트, 그 주고받기를 되풀이하는 반복문을 루프라고 부릅니다. 규칙으로 도구를 고르는 함수(가짜 LLM)에게 「목표보다 낮은 캠페인의 입찰가를 10% 내린다」는 과제를 주자 가상 캠페인 3개 가운데 러닝화 입찰가만 20000원에서 18000원으로 내려갔습니다. 목표에 끝내 닿을 수 없는 과제에서는 가짜 LLM 이 스스로 끝내지 않아, 같은 호출이 되풀이되는지 보는 검사가 루프를 멈췄고 그 검사를 끄면 모델을 부르는 횟수의 상한이 멈췄습니다. 모델이 어겨도 코드가 막는 제한을 가드레일이라고 부르는데, 한 번에 20% 넘게 바꾸려는 입찰가는 가드레일이 거부했고 그 거부도 결과로 모델에 돌아갔습니다. MCP(Model Context Protocol)는 같은 도구를 서버가 내놓고 여러 LLM 앱이 같은 꼴로 부르게 하는 공개 프로토콜(주고받는 메시지의 꼴을 정한 규약)입니다.

> **골라 읽는 법** — 절이 7개입니다. 절마다 있는 표나 코드나 카드만 보고 넘어가도 됩니다.
>
> - 도구를 고르는 LLM 과 실행하는 코드 → 1절
> - 도구 3개의 정의와 가상 캠페인 3개 → 2절
> - 가짜 LLM 으로 돌린 루프 한 바퀴 → 3절
> - 끝나지 않는 과제와 멈춤 조건 3가지 → 4절
> - 가드레일을 프롬프트가 아니라 코드에 두는 까닭 → 5절
> - MCP 명세가 정한 역할 3가지와 서버의 기능 3가지 → 6절
> - 담장 안과 열린 RTB 에서 에이전트의 도구가 닿는 곳 → 7절

이 글의 캠페인 3개와 어제 통계, 목표값, 객단가는 설명을 위해 만든 가상 데이터입니다. 캠페인 3개는 [후보풀 여덟 질문](post.html?id=candidate-pool-questions) 편에 나온 서연 씨 러닝화, 여행사, 카페를 그대로 가져왔습니다. 이 글에는 진짜 모델이 돌려준 응답의 기록이 없습니다. 도구를 고르는 일은 규칙대로 움직이는 가짜 LLM 이 하므로 단계 수(루프가 모델을 부른 횟수)와 도구 호출 수도 그 규칙에서 나옵니다. 그래서 이 글의 숫자로는 진짜 모델이 몇 번 만에 과제를 끝내는지 알 수 없습니다. 카드에서 파랑은 코드가 하는 일, 벽돌색은 모델이 고른 것, 먹색은 도구와 캠페인이고 회색은 거부되거나 멈춘 것, 점선 상자는 가상 값입니다.

---

## 1. 도구를 고르는 LLM 과 실행하는 코드의 루프

**모델은 도구를 실행하지 않고 부를 도구의 이름과 입력을 적어 돌려주기만 합니다. 적힌 도구를 실행하고 그 결과를 대화에 다시 넣는 일은 코드의 반복문인 루프가 맡습니다.**

도입에서 지훈 씨가 본 짧은 요청은 모델이 함수를 돌린 흔적이 아니라 부를 함수의 이름과 입력을 적은 글이었습니다. [LLM 호출 한 번](post.html?id=llm-first-call) 편에서처럼 tool use 에서도 모델은 글을 받아 글을 돌려줍니다. 달라지는 점은 하나로, 요청에 도구 정의 목록을 같이 보내면 모델이 답 대신 「이 도구를 이 입력으로 불러 달라」는 블록을 돌려줄 수 있습니다. 그 블록은 함수를 실제로 부른 결과가 아니라 부를 함수를 적어 둔 글이라, 그 글을 읽고 함수를 돌리는 일은 코드가 맡습니다.

응답의 꼴은 [구조화 출력](post.html?id=structured-output) 편과 같아서 모델이 답을 멈춘 까닭을 적은 stop_reason 과 내용 블록의 목록인 content 가 들어 있습니다. content 의 블록마다 종류를 적은 type 이 있는데, 글은 text 블록에, 도구를 불러 달라는 요청은 tool_use 블록에 담깁니다. 모델이 도구를 고르면 stop_reason 이 tool_use 이고 content 에 tool_use 블록이 들어가는데, 이 블록에는 호출마다 붙는 id 와 도구 이름, 입력이 적힙니다. 모델이 할 일을 마치면 stop_reason 이 end_turn 이고 content 에는 답을 적은 text 블록이 들어갑니다.

코드는 tool_use 블록에 적힌 이름의 함수를 그 입력으로 돌리고 결과를 tool_result 블록에 담습니다. 결과가 어느 호출의 것인지는 tool_result 블록의 tool_use_id 에 그 호출의 id 를 적어 연결합니다. 대화의 메시지마다 보낸 이를 적는 role 이 붙는데, 모델의 응답은 assistant 이고 과제와 도구 결과는 user 입니다. 코드는 tool_result 블록을 user 메시지로 대화 끝에 추가한 뒤 모델을 다시 부릅니다. 모델이 end_turn 을 낼 때까지 이 일을 되풀이하는 반복문이 루프입니다.

그래서 에이전트를 만드는 일은 대부분 모델 밖에서 이루어집니다. 모델에게 어떤 도구를 줄지, 도구가 무엇을 돌려줄지, 언제 멈출지는 코드가 정합니다. 모델은 다음에 부를 도구와 그 입력만 정합니다. 2절부터 5절까지가 코드가 정하는 일들을 하나씩 다룹니다.

아래 표는 루프가 도는 동안 하는 일마다 누가 맡는지와 이 글의 어느 코드나 값이 그 일을 하는지 보여 줍니다. `TOOLS` 와 `run_tool` 은 2절에서 정의할 도구 목록과 실행 함수입니다. 멈출지 정하는 일은 LLM 과 코드가 나눠 맡습니다. 모델이 end_turn 을 내서 끝내기도 하지만 코드가 단계 상한(모델을 부르는 횟수의 상한)이나 같은 호출 반복(같은 도구를 같은 입력으로 다시 부르는 일)을 보고 끝내기도 합니다. 두 조건은 4절에서 다룹니다.

| 한 바퀴의 일 | 누가 | 이 글에서 |
|---|---|---|
| 도구 정의 목록을 건넴 | 코드 | `TOOLS` 셋 |
| 다음 도구와 입력을 고름 | LLM | 가짜 LLM 의 규칙 |
| 도구를 실행함 | 코드 | `run_tool` |
| 결과를 대화에 더함 | 코드 | tool_result 블록, user 메시지 |
| 멈출지 정함 | LLM 과 코드 | end_turn, 단계 상한, 같은 호출 반복 |
| 위험한 입력을 막음 | 코드 | 한 번에 20% 넘는 변경 거부 |

첫 카드에서는 2절에서 정의할 도구 3개와, 목표보다 낮은 캠페인이 러닝화 하나라는 점을 보면 됩니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-tool-loop-cards.html?embed=1&card=tools" height="480" loading="lazy" title="도구 셋의 정의"></iframe>
<a class="demo-embed-open" href="demo-tool-loop-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 2. 도구 3개의 정의와 가상 캠페인 3개

**도구는 get_campaigns, get_stats, set_bid 3개이고 도구마다 이름, 설명, input_schema(입력의 꼴)를 적습니다. 도구를 실제로 돌리는 함수 `run_tool` 은 실패해도 예외(실행을 멈추는 오류)를 던지지 않고 error 를 담은 결과를 돌려줍니다.**

도입에서 모델이 차례로 불러 달라고 한 함수는 광고 목록을 꺼내는 함수, 광고마다 어제 숫자를 보여 주는 함수, 입찰가를 바꾸는 함수였습니다. 이 절의 get_campaigns, get_stats, set_bid 가 차례로 그 3개입니다. 모델은 블록 주석대로 코드가 건넨 이 정의 3개만 보고 무엇을 부를지 고릅니다.

도구 정의는 필드 3개로 이루어집니다. name 은 모델이 tool_use 블록에 적을 도구 이름입니다. description 은 모델이 언제 이 도구를 쓸지 고를 때 단서로 삼는 설명입니다. set_bid 의 description 에는 한 번에 20% 넘는 변경은 거부된다는 상한도 적었습니다. input_schema 에는 입력의 꼴을 JSON Schema 로 적습니다. JSON 은 이름과 값의 짝을 중괄호로 묶어 적는 꼴입니다. JSON Schema 는 JSON 에 어떤 이름의 값이 어떤 자료형으로 들어가는지 적는 공개 명세입니다. input_schema 의 required 에는 빠지면 안 되는 입력의 이름을 적습니다.

캠페인은 3개입니다. 서연 씨 러닝화(c1)와 여행사(c2)는 구매 1건을 기준으로 입찰하는 cpa 방식이고 입찰가는 각각 20000원과 50000원입니다. 카페(c3)는 클릭 1번에 300원을 손으로 정해 둔 cpc_manual 방식입니다.

ROAS 는 광고비 대비 매출을 백분율로 적은 값입니다. 매출을 광고비로 나눠 100 을 곱하므로 높을수록 같은 광고비로 매출을 더 올렸다는 뜻입니다. 캠페인마다 정해 둔 목표 ROAS 는 러닝화 400%, 여행사 300% 이고 카페에는 목표가 없습니다.

통계는 어제 하루 동안 쓴 광고비와 구매 수입니다. 매출은 구매 수에 객단가(구매 1건의 매출)를 곱해 셉니다. 객단가는 러닝화 120000원, 여행사 600000원, 카페 8000원입니다. 러닝화는 어제 광고비 300만 원으로 구매 70건을 얻었으므로 매출은 70 × 120000원 = 840만 원입니다. 그래서 ROAS 는 840만 원 ÷ 300만 원 × 100 = 280% 로 목표 400% 에 못 미칩니다. 입찰가 20000원은 구매 1건에 쓰려는 목표 금액인데, 어제 구매 1건에 실제로 든 광고비(300만 원을 70건으로 나눈 값)는 입찰가보다 컸습니다. 여행사는 3절의 출력대로 ROAS 가 360% 로 목표 300% 를 넘고 카페는 목표가 없으므로, 자기 목표에 못 미치는 캠페인은 러닝화 하나입니다.

`run_tool` 은 모델이 고른 도구를 실제로 돌리는 함수입니다. 모르는 도구 이름이 오거나 required 입력이 빠졌거나 없는 캠페인을 가리키는 호출은 모두 예외 대신 error 를 담은 결과로 돌려줍니다. 결과 옆에는 실패였는지를 참(True)과 거짓(False)으로 붙입니다. 예외를 던지면 루프가 멈춰 모델은 무엇이 잘못됐는지 모르지만 결과로 돌려주면 모델이 그 결과를 읽고 다음 호출을 고칠 수 있습니다(5절).

아래 블록은 캠페인 3개와 어제 통계, 도구 3개의 정의, `run_tool` 을 차례로 둡니다. 블록의 마지막 4단계는 도구마다 받는 입력과 캠페인을 찍은 뒤 get_stats 를 손으로 두 번 불러, 성공한 호출과 입력이 빠진 호출이 각각 어떤 결과로 돌아오는지 보입니다.

```python
# 하는 일: 도구 셋을 정의하고, 가상 캠페인 셋과 도구를 실행하는 코드를 둔다.
import json

# 1단계: 가상 캠페인 셋과 어제 하루의 통계를 둔다
# 값은 설명을 위해 만든 가상 데이터다. 러닝화와 여행사는 구매 1건(cpa)에, 카페는 클릭 1번(cpc)에 입찰한다.
# 목표 ROAS 는 러닝화 400%, 여행사 300% 이고 카페에는 없다. aov 는 구매 1건의 매출, 곧 객단가다.
# 통계는 어제 하루의 값이라 오늘 입찰가를 바꿔도 이 실행 안에서는 바뀌지 않는다.
# pctr, pcvr, daily_budget 은 캠페인 셋의 값을 그대로 둔 것이고, 이 글의 도구와 루프는 쓰지 않는다.
CAMPAIGNS = {
    'c1': {'name': 'running_shoes', 'pctr': 0.012, 'pcvr': 0.030, 'bid_type': 'cpa', 'bid': 20000,
           'daily_budget': 3000000, 'target_roas': 400, 'aov': 120000},
    'c2': {'name': 'travel_agency', 'pctr': 0.008, 'pcvr': 0.020, 'bid_type': 'cpa', 'bid': 50000,
           'daily_budget': None, 'target_roas': 300, 'aov': 600000},
    'c3': {'name': 'cafe', 'pctr': 0.020, 'pcvr': None, 'bid_type': 'cpc_manual', 'bid': 300,
           'daily_budget': None, 'target_roas': None, 'aov': 8000},
}
STATS = {'c1': {'spend': 3000000, 'conversions': 70},
         'c2': {'spend': 2000000, 'conversions': 12},
         'c3': {'spend': 300000, 'conversions': 60}}
START_BIDS = {cid: c['bid'] for cid, c in CAMPAIGNS.items()}


def reset_bids():
    for cid, bid in START_BIDS.items():
        CAMPAIGNS[cid]['bid'] = bid


# 2단계: 도구 셋을 정의한다
# 도구마다 이름, 설명, 입력 꼴(input_schema)을 적는다. 모델은 이 셋만 보고 무엇을 부를지 고른다.
# input_schema 는 JSON Schema 꼴이다. required 는 빠지면 안 되는 입력이다.
TOOLS = [
    {'name': 'get_campaigns',
     'description': 'List the campaigns with their bid type, bid and target ROAS.',
     'input_schema': {'type': 'object', 'properties': {}, 'required': []}},
    {'name': 'get_stats',
     'description': "Get yesterday's spend, revenue and ROAS (%) of one campaign.",
     'input_schema': {'type': 'object', 'properties': {'campaign_id': {'type': 'string'}},
                      'required': ['campaign_id']}},
    {'name': 'set_bid',
     'description': 'Set a new bid for one campaign. A change above 20% in one call is refused.',
     'input_schema': {'type': 'object',
                      'properties': {'campaign_id': {'type': 'string'}, 'new_bid': {'type': 'integer'}},
                      'required': ['campaign_id', 'new_bid']}},
]
MAX_CHANGE = 0.20


# 3단계: 도구를 실행하는 코드를 둔다
# 실행은 모델이 아니라 이 함수가 한다. 결과와 실패 여부 둘을 돌려준다.
# 실패도 예외를 던지지 않고 error 를 담은 결과로 돌려준다. 가드레일 20% 도 여기서 막는다.
def run_tool(name, args):
    tool = next((t for t in TOOLS if t['name'] == name), None)
    if tool is None:
        return {'error': 'unknown_tool', 'name': name}, True
    missing = [k for k in tool['input_schema']['required'] if k not in args]
    if missing:
        return {'error': 'missing_input', 'missing': missing}, True
    if name == 'get_campaigns':
        rows = [{'id': cid, 'name': c['name'], 'bid_type': c['bid_type'], 'bid': c['bid'],
                 'target_roas': c['target_roas']} for cid, c in CAMPAIGNS.items()]
        return {'campaigns': rows}, False
    cid = args['campaign_id']
    if cid not in CAMPAIGNS:
        return {'error': 'unknown_campaign', 'campaign_id': cid}, True
    if name == 'get_stats':
        spend = STATS[cid]['spend']
        revenue = STATS[cid]['conversions'] * CAMPAIGNS[cid]['aov']
        return {'campaign_id': cid, 'spend': spend, 'revenue': revenue,
                'roas': round(revenue / spend * 100)}, False
    old, new = CAMPAIGNS[cid]['bid'], args['new_bid']
    change = (new - old) / old
    if abs(change) > MAX_CHANGE:
        return {'error': 'change_too_large', 'campaign_id': cid, 'bid': old,
                'asked_change_pct': round(change * 100), 'max_change_pct': round(MAX_CHANGE * 100)}, True
    CAMPAIGNS[cid]['bid'] = new
    return {'campaign_id': cid, 'old_bid': old, 'new_bid': new}, False


# 4단계: 도구 셋과 캠페인을 찍고, 도구 하나를 손으로 불러 본다
for t in TOOLS:
    props = t['input_schema']['properties']
    print(f"tool {t['name']}(" + ', '.join(f'{k}: {v["type"]}' for k, v in props.items()) + ')')
for cid, c in CAMPAIGNS.items():
    print(f"{cid} {c['name']}: {c['bid_type']} bid {c['bid']}, target_roas {c['target_roas']}, aov {c['aov']}")
print(run_tool('get_stats', {'campaign_id': 'c1'}))
print(run_tool('get_stats', {}))
# 출력:
# 4단계 뜻: 도구 셋의 이름과 입력, 캠페인 셋이 찍힌다. 손으로 부른 get_stats 는 ROAS 280 을, 입력이 빠진 호출은 error 를 돌려준다.
# tool get_campaigns()
# tool get_stats(campaign_id: string)
# tool set_bid(campaign_id: string, new_bid: integer)
# c1 running_shoes: cpa bid 20000, target_roas 400, aov 120000
# c2 travel_agency: cpa bid 50000, target_roas 300, aov 600000
# c3 cafe: cpc_manual bid 300, target_roas None, aov 8000
# ({'campaign_id': 'c1', 'spend': 3000000, 'revenue': 8400000, 'roas': 280}, False)
# ({'error': 'missing_input', 'missing': ['campaign_id']}, True)
```

블록의 4단계가 찍은 첫 세 줄은 도구마다 받는 입력입니다. get_campaigns 는 입력이 없고 get_stats 는 글자(string)인 campaign_id 를, set_bid 는 campaign_id 와 정수(integer)인 new_bid 를 받습니다. c1 으로 부른 get_stats 는 spend 3000000, revenue 8400000, roas 280 을 실패 여부 False 와 함께 돌려줬는데, 앞에서 계산한 러닝화의 광고비 300만 원, 매출 840만 원, ROAS 280% 와 같은 값입니다. campaign_id 를 빼고 부른 호출은 멈추지 않고 error 가 missing_input, 빠진 입력이 campaign_id 인 결과를 True 와 함께 돌려줬습니다.

도구 정의는 모델이 읽는 글이기도 합니다. 진짜 모델은 description 을 근거로 도구를 고르므로 설명이 모호하면 엉뚱한 도구를 고를 수 있지만 이 글의 가짜 LLM 은 설명을 읽지 않습니다. 정의 3개의 전문은 더 깊이 보기에 JSON 으로 옮겨 두었습니다.

## 3. 가짜 LLM 으로 돌린 루프 한 바퀴

**과제 「목표보다 낮은 캠페인의 입찰가를 10% 내린다」는 모델을 4번 부른 4단계와 도구 호출 5번 만에 end_turn 으로 끝났습니다. 입찰가가 바뀐 캠페인은 러닝화 하나로, 20000원에서 18000원이 되었습니다.**

2절의 도구 정의와 `run_tool` 만으로는 모델과의 주고받기가 일어나지 않습니다. 모델을 부르고 그 응답에 적힌 도구를 실행해 결과를 돌려주는 반복문까지 있어야 도입에서 본 주고받기가 이어지므로, 이 절에서는 그 반복문에 도입과 비슷한 과제를 넣어 처음부터 end_turn 까지 한 바퀴 돌려 봅니다. 과제는 루프를 시작할 때 첫 user 메시지로 보내는 할 일입니다.

아래 블록의 가짜 LLM(`fake_llm`)은 지금까지의 대화 기록을 읽고 정해 둔 규칙으로 다음 도구를 고르는 함수입니다. 가짜 LLM 은 아래 규칙 4가지를 위에서부터 차례로 봅니다.

- 캠페인 목록을 아직 받지 않았으면 get_campaigns 를 부릅니다.
- 통계를 받지 않은 캠페인이 있으면 그 캠페인마다 get_stats 를 부릅니다.
- ROAS 가 목표보다 낮고 아직 입찰가를 바꾸지 않은 캠페인이 있으면 set_bid 로 입찰가를 10% 내립니다.
- 할 일이 남지 않았으면 end_turn 으로 끝냅니다.

진짜 모델이라면 이 자리에서 시스템 메시지와 대화를 읽고 다음 도구를 스스로 고릅니다. 시스템 메시지는 요청마다 모델에 같이 보내는 할 일 설명으로, 이 글에서는 블록의 SYSTEM 에 적었습니다. 가짜 LLM 의 응답은 블록 주석대로 진짜 SDK 가 돌려주는 응답과 같은 꼴입니다. SDK 는 API(서비스를 코드에서 부르는 정해진 방법)를 부르는 일을 함수로 묶어 둔 라이브러리입니다.

`run_agent` 는 한 단계마다 가짜 LLM 을 한 번 부릅니다. 응답의 stop_reason 이 end_turn 이면 그 자리에서 멈춥니다. tool_use 이면 tool_use 블록마다 `run_tool` 을 돌려 결과를 tool_result 블록으로 만드는데, 실패한 결과의 블록에는 is_error 를 참으로 두어 실패였다고 알립니다. 결과 블록들을 user 메시지 하나로 대화에 추가하면 다음 단계로 넘어갑니다. 루프가 끝나면 단계 수, 도구 호출 수, 실패한 호출 수(errors)를 메시지 목록과 함께 돌려줍니다.

아래 블록은 가짜 LLM 과 루프를 두고 첫 과제를 끝까지 돌립니다. 단계마다 모델이 고른 tool_use 블록과 코드가 돌려준 tool_result 블록을 차례로 찍은 뒤, 마지막 줄에 멈춘 까닭과 단계 수, 도구 호출 수, 실패 수, 메시지 수를 찍습니다.

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 규칙으로 도구를 고르는 가짜 LLM 과 루프를 두고, 과제 하나를 끝까지 한 바퀴 돌린다.

# 1단계: 가짜 LLM 을 둔다
# 응답 꼴은 구조화 출력 편과 같다. stop_reason 과 content 블록 목록이다.
# 도구를 부를 때는 stop_reason 이 tool_use 이고 content 에 tool_use 블록이 든다. 끝낼 때는 end_turn 과 text 블록이다.
# 다음 행동은 대화 기록을 읽어 규칙으로 고른다. 캠페인 목록, 캠페인마다 통계, 목표보다 낮으면 입찰가 조정, 끝 순서다.
# 과제가 Keep 으로 시작하면 목표에 닿을 때까지 고치고, 아니면 10% 한 번만 내린다.
SYSTEM = 'You manage ad campaigns. Read and change bids only through the tools.'


def read_history(messages):
    """대화 기록에서 도구 호출과 결과를 꺼낸다. 처음 입찰가와 캠페인마다 마지막 일을 남긴다."""
    calls, campaigns, start, stats, last = {}, None, {}, {}, {}
    for m in messages[1:]:
        for block in m['content']:
            if block['type'] == 'tool_use':
                calls[block['id']] = block
            elif block['type'] == 'tool_result':
                call, result = calls[block['tool_use_id']], json.loads(block['content'])
                if call['name'] == 'get_campaigns':
                    campaigns = {row['id']: row for row in result['campaigns']}
                    start = {cid: row['bid'] for cid, row in campaigns.items()}
                elif call['name'] == 'get_stats':
                    stats[result['campaign_id']] = result
                    last[result['campaign_id']] = ('stats', result)
                elif call['name'] == 'set_bid':
                    cid = call['input']['campaign_id']
                    last[cid] = ('error' if block['is_error'] else 'bid', result)
                    if not block['is_error']:
                        campaigns[cid]['bid'] = result['new_bid']
    return len(calls), campaigns, start, stats, last


def fake_llm(system, messages, tools):
    """진짜 SDK 와 같은 꼴의 응답을 돌려준다. 다음 도구는 대화를 읽어 정해 둔 규칙으로 고른다."""
    # system 과 tools 는 SDK 의 호출 꼴을 맞추려고 받는다. 규칙은 도구 이름만 본다.
    names = {t['name'] for t in tools}
    task = messages[0]['content']
    n, campaigns, start, stats, last = read_history(messages)
    uses = []

    def use(name, args):
        assert name in names
        uses.append({'type': 'tool_use', 'id': f'toolu_{n + len(uses) + 1:02d}', 'name': name, 'input': args})

    if campaigns is None:
        use('get_campaigns', {})
    elif any(cid not in stats for cid in campaigns):
        for cid in campaigns:
            if cid not in stats:
                use('get_stats', {'campaign_id': cid})
    else:
        for cid, c in campaigns.items():
            target, roas = c['target_roas'], stats[cid]['roas']
            if target is None or roas >= target:
                continue
            kind, result = last[cid]
            if not task.startswith('Keep'):
                if kind == 'stats':
                    use('set_bid', {'campaign_id': cid, 'new_bid': round(c['bid'] * 0.9)})
            elif kind == 'stats':
                use('set_bid', {'campaign_id': cid, 'new_bid': round(c['bid'] * roas / target)})
            elif kind == 'error':
                use('set_bid', {'campaign_id': cid, 'new_bid': round(c['bid'] * (1 - result['max_change_pct'] / 100))})
            else:
                use('get_stats', {'campaign_id': cid})
    if uses:
        return {'stop_reason': 'tool_use', 'content': uses}
    done = [f"{cid} bid {start[cid]} -> {c['bid']}" for cid, c in campaigns.items() if c['bid'] != start[cid]]
    text = 'Done. Changed: ' + ', '.join(done) + '. Other campaigns meet their target or have none.'
    return {'stop_reason': 'end_turn', 'content': [{'type': 'text', 'text': text}]}


# 2단계: 루프를 둔다
# 한 단계는 LLM 을 한 번 부르는 일이다. 도구를 고르는 것은 LLM 이고, 실행해서 결과를 붙이는 것은 이 코드다.
# 결과는 tool_result 블록에 tool_use_id 를 달아 user 메시지로 돌려준다. 실패한 결과는 is_error 를 참으로 둔다.
# 멈춤 조건은 셋이다. end_turn, 단계 상한 max_steps, 같은 도구를 같은 입력으로 다시 부르기(repeat)다.
def run_agent(task, max_steps=6, detect_repeat=True):
    messages = [{'role': 'user', 'content': task}]
    seen, count = set(), {'tool_calls': 0, 'errors': 0}

    def finish(stop, steps):
        return messages, dict(count, steps=steps, stop=stop)

    for step in range(1, max_steps + 1):
        response = fake_llm(SYSTEM, messages, TOOLS)
        messages.append({'role': 'assistant', 'content': response['content']})
        if response['stop_reason'] == 'end_turn':
            return finish('end_turn', step)
        results = []
        for block in response['content']:
            key = block['name'] + json.dumps(block['input'], sort_keys=True)
            if detect_repeat and key in seen:
                # 여기서 멈추면 messages 끝의 assistant 메시지에 짝인 tool_result 가 없는 tool_use 가 남는다.
                return finish('repeat', step)
            seen.add(key)
            content, is_error = run_tool(block['name'], block['input'])
            count['tool_calls'] += 1
            count['errors'] += is_error
            results.append({'type': 'tool_result', 'tool_use_id': block['id'],
                            'content': json.dumps(content), 'is_error': is_error})
        messages.append({'role': 'user', 'content': results})
    return finish('max_steps', max_steps)


def show(messages, from_step=1):
    """메시지 목록을 단계마다 짧게 찍는다. from_step 앞 단계는 건너뛰고, 캠페인 목록 결과는 줄여서 찍는다."""
    step = 0
    for m in messages[1:]:
        if m['role'] == 'assistant':
            step += 1
        if step < from_step:
            continue
        for block in m['content']:
            if block['type'] == 'tool_use':
                if block is m['content'][0]:
                    print(f'step {step} stop_reason=tool_use')
                print(f"  tool_use {block['id']} {block['name']} {json.dumps(block['input'])}")
            elif block['type'] == 'tool_result':
                body = json.loads(block['content'])
                if 'campaigns' in body:
                    body = {'campaigns': [row['id'] for row in body['campaigns']]}
                flag = ' is_error' if block['is_error'] else ''
                print(f"  tool_result {block['tool_use_id']}{flag} {json.dumps(body)}")
            else:
                print(f'step {step} stop_reason=end_turn')
                print(f"  text {block['text']}")


# 3단계: 과제 하나를 끝까지 돌린다
reset_bids()
messages, run = run_agent('Lower the bid by 10% for each campaign below its target ROAS.')
show(messages)
print(f"stop={run['stop']} steps={run['steps']} tool_calls={run['tool_calls']} errors={run['errors']}")
print(f'messages={len(messages)}')
# 출력:
# 3단계 뜻: 목록, 통계 셋, 입찰가 변경 하나 다음에 end_turn 이 온다. 단계는 4, 도구 호출은 5번이다.
# step 1 stop_reason=tool_use
#   tool_use toolu_01 get_campaigns {}
#   tool_result toolu_01 {"campaigns": ["c1", "c2", "c3"]}
# step 2 stop_reason=tool_use
#   tool_use toolu_02 get_stats {"campaign_id": "c1"}
#   tool_use toolu_03 get_stats {"campaign_id": "c2"}
#   tool_use toolu_04 get_stats {"campaign_id": "c3"}
#   tool_result toolu_02 {"campaign_id": "c1", "spend": 3000000, "revenue": 8400000, "roas": 280}
#   tool_result toolu_03 {"campaign_id": "c2", "spend": 2000000, "revenue": 7200000, "roas": 360}
#   tool_result toolu_04 {"campaign_id": "c3", "spend": 300000, "revenue": 480000, "roas": 160}
# step 3 stop_reason=tool_use
#   tool_use toolu_05 set_bid {"campaign_id": "c1", "new_bid": 18000}
#   tool_result toolu_05 {"campaign_id": "c1", "old_bid": 20000, "new_bid": 18000}
# step 4 stop_reason=end_turn
#   text Done. Changed: c1 bid 20000 -> 18000. Other campaigns meet their target or have none.
# stop=end_turn steps=4 tool_calls=5 errors=0
# messages=8
```

찍힌 줄을 단계마다 따라가면 1단계에서 get_campaigns 가 캠페인 3개의 목록(c1, c2, c3)을 돌려줍니다. 2단계에서 가짜 LLM 은 캠페인 3개의 통계를 한 번에 물으려고 tool_use 블록 3개(toolu_02, toolu_03, toolu_04)를 한 응답에 담았습니다. 코드는 결과 3개를 tool_result 블록 3개로 만들어 user 메시지 하나에 담아 돌려줬습니다. 결과마다 붙은 tool_use_id 가 같은 id 의 호출을 가리키므로, toolu_02 의 roas 280 은 c1, toolu_03 의 roas 360 은 c2, toolu_04 의 roas 160 은 c3 의 값입니다.

도구 호출은 1단계의 1번, 2단계의 3번, 3단계의 1번을 더한 5번입니다. 단계는 모델이 도구를 부르지 않고 end_turn 만 낸 4단계까지 세어 4입니다. 2단계의 호출 3번이 한 단계에 들어갔기 때문에 도구 호출 수가 단계 수보다 많습니다.

여행사는 ROAS 360% 가 목표 300% 를 넘었고 카페는 ROAS 가 160% 여도 목표가 없어 규칙이 두 캠페인을 건너뛰었으므로, 3단계의 set_bid 는 러닝화 하나만 불렀습니다. 새 입찰가 18000원은 규칙대로 20000원에 0.9 를 곱해 10% 내린 값입니다. 바뀌는 몫 10% 는 20% 상한 안이라 `run_tool` 은 그대로 받아들여 old_bid 20000 과 new_bid 18000 을 돌려줬습니다.

4단계의 text 블록은 무엇을 바꿨는지(c1 bid 20000 -> 18000) 적은 마지막 답입니다. 끝에 찍힌 stop=end_turn steps=4 tool_calls=5 errors=0 은 모델의 end_turn 으로 멈췄고 단계 4, 도구 호출 5번, 실패 0번이었다는 뜻입니다.

메시지 목록은 8개로, 처음 보낸 과제 1개와 모델의 응답 4개, 도구 결과를 담은 user 메시지 3개를 더한 수입니다. 루프는 단계마다 이 목록 전체를 모델에 다시 보내므로, 단계가 늘수록 보내는 글이 길어져 루프가 오래 돌면 그만큼 모델이 받는 입력도 커집니다.

아래 표에 메시지 8개의 role 과 담긴 블록을 적었습니다.

| 메시지 | role | content 블록 |
|---|---|---|
| 1 | user | 과제 글 |
| 2, 4, 6 | assistant | tool_use 1개, 3개, 1개 |
| 3, 5, 7 | user | tool_result 1개, 3개, 1개 |
| 8 | assistant | text 1개, stop_reason 은 end_turn |

둘째 카드에서는 첫 과제가 4단계, 도구 호출 5번 동안 LLM 의 선택과 코드의 실행을 주고받는 차례를 보면 됩니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-tool-loop-cards.html?embed=1&card=loop" height="480" loading="lazy" title="LLM 이 고르고 코드가 실행하는 한 바퀴"></iframe>
<a class="demo-embed-open" href="demo-tool-loop-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 4. 멈춤 조건 3가지

**모델이 end_turn 을 내지 않는 과제도 있습니다. 둘째 과제에서는 가짜 LLM 이 끝내지 않아 같은 호출 반복 검사가 5단계에서, 그 검사를 끄면 단계 상한이 6단계에서 루프를 멈췄습니다. 두 실행 모두 러닝화 입찰가는 16000원에서 끝났습니다.**

3절의 과제는 바꿀 캠페인이 남지 않자 가짜 LLM 이 end_turn 을 내며 끝났습니다. end_turn 이 끝내 오지 않는 과제에서는 루프가 스스로 끝나지 않습니다. 선배가 도입에서 이번 주 숙제로 꼽은 일도 모델의 고르기를 어디서 멈추게 할지 정하는 일이었습니다.

둘째 과제는 「모든 캠페인이 목표 ROAS 에 닿을 때까지 입찰가를 바꾼다」입니다. 이 과제에서 가짜 LLM 은 목표에 닿는 입찰가를 한 번에 적는데, 러닝화라면 지금 입찰가에 ROAS 를 목표로 나눈 비율을 곱한 20000 × 280 / 400 = 14000원으로 30% 를 내린 값입니다. set_bid 가 이 값을 거부하면 상한인 20% 만 내린 20000 × (1 - 20 / 100) = 16000원을 다시 적습니다. 입찰가를 바꾼 뒤에는 통계를 다시 묻습니다.

그런데 통계는 어제 하루의 값이라 오늘 입찰가를 바꿔도 이 실행 안에서는 바뀌지 않습니다. 실제 광고에서도 통계는 모아서 늦게 쌓이므로 입찰가를 바꾼 효과는 나중에야 숫자로 보입니다. 그래서 다시 물은 러닝화의 ROAS 는 280% 그대로이고 목표 400% 는 끝내 채워지지 않아 이 과제는 가짜 LLM 의 규칙으로는 끝나지 않습니다.

같은 호출 반복 검사(repeat)는 모델이 고른 도구의 이름과 입력이 앞서 부른 호출과 같으면 그 호출을 실행하기 전에 루프를 멈춥니다. 블록은 도구 이름 뒤에 입력을 JSON 으로 붙인 글자를 키로 삼아 seen 에 모아 두다가 같은 키가 다시 오면 멈추는데, 둘째 과제에서는 5단계의 get_stats 가 2단계와 같은 입력이라 실행되기 전에 멈췄습니다. 반복 검사를 끄면 5단계에서 통계를 다시 받고 6단계에서 16000 × 280 / 400 = 11200원으로 또 30% 를 내린 값을 적어 거부당합니다. 그다음 단계로 가기 전에 단계 상한 6 이 루프를 멈춥니다.

아래 블록은 둘째 과제를 반복 검사를 켠 채 한 번, 끈 채 한 번 돌려 어느 조건이 몇 단계에서 루프를 멈추는지 봅니다. 블록의 마지막 3단계는 거부된 set_bid 하나가 어떤 꼴의 결과로 돌아왔는지 찍습니다.

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 규칙이 끝내 채울 수 없는 과제를 돌려, 같은 호출 반복과 단계 상한이 루프를 멈추는 것을 본다.

# 1단계: 목표에 닿을 때까지 고치라는 과제를 같은 호출 반복 검사와 함께 돌린다
# 가짜 LLM 은 목표에 닿는 입찰가를 한 번에 적는다. 러닝화는 280/400 이라 30% 를 내려야 해서 set_bid 가 거부한다.
# 거부 결과를 읽고 20% 만 내린 뒤 통계를 다시 묻는다. 통계는 어제 값이라 280 그대로이고, 같은 호출이 된다.
TASK = 'Keep changing bids until every campaign meets its target ROAS.'
reset_bids()
messages, run = run_agent(TASK)
show(messages, from_step=3)
print(f"stop={run['stop']} steps={run['steps']} tool_calls={run['tool_calls']} errors={run['errors']}, c1 bid {CAMPAIGNS['c1']['bid']}")

# 2단계: 반복 검사를 끄고 같은 과제를 돌린다
# 같은 호출을 막지 않으면 통계를 다시 받고, 또 30% 를 적어 거부당한다. 그때는 단계 상한 6 이 멈춘다.
reset_bids()
messages, run = run_agent(TASK, detect_repeat=False)
show(messages, from_step=5)
print(f"stop={run['stop']} steps={run['steps']} tool_calls={run['tool_calls']} errors={run['errors']}, c1 bid {CAMPAIGNS['c1']['bid']}")

# 3단계: 거부된 set_bid 하나가 결과로 돌아온 꼴을 본다
# 예외가 아니라 tool_result 블록이다. is_error 가 참이고, content 에 거부 까닭과 상한이 든다.
refused = [b for m in messages[1:] if m['role'] == 'user' for b in m['content'] if b['is_error']]
print(f'refused={len(refused)}')
first = refused[0]
print(f"type={first['type']} tool_use_id={first['tool_use_id']} is_error={first['is_error']}")
print(f"content={first['content']}")
# 출력:
# 1단계 뜻: 30% 변경은 error 결과로 돌아오고, 20% 로 고친 호출은 통과한다. 같은 get_stats 를 다시 부르려는 5단계에서 멈춘다.
# step 3 stop_reason=tool_use
#   tool_use toolu_05 set_bid {"campaign_id": "c1", "new_bid": 14000}
#   tool_result toolu_05 is_error {"error": "change_too_large", "campaign_id": "c1", "bid": 20000, "asked_change_pct": -30, "max_change_pct": 20}
# step 4 stop_reason=tool_use
#   tool_use toolu_06 set_bid {"campaign_id": "c1", "new_bid": 16000}
#   tool_result toolu_06 {"campaign_id": "c1", "old_bid": 20000, "new_bid": 16000}
# step 5 stop_reason=tool_use
#   tool_use toolu_07 get_stats {"campaign_id": "c1"}
# stop=repeat steps=5 tool_calls=6 errors=1, c1 bid 16000
# 2단계 뜻: 반복 검사가 없으면 통계를 다시 받고 또 30% 를 적어 거부당한다. 단계 상한 6 이 멈춘다.
# step 5 stop_reason=tool_use
#   tool_use toolu_07 get_stats {"campaign_id": "c1"}
#   tool_result toolu_07 {"campaign_id": "c1", "spend": 3000000, "revenue": 8400000, "roas": 280}
# step 6 stop_reason=tool_use
#   tool_use toolu_08 set_bid {"campaign_id": "c1", "new_bid": 11200}
#   tool_result toolu_08 is_error {"error": "change_too_large", "campaign_id": "c1", "bid": 16000, "asked_change_pct": -30, "max_change_pct": 20}
# stop=max_steps steps=6 tool_calls=8 errors=2, c1 bid 16000
# 3단계 뜻: 거부는 예외가 아니라 is_error 가 참인 tool_result 블록이고, content 에 까닭과 상한이 든다.
# refused=2
# type=tool_result tool_use_id=toolu_05 is_error=True
# content={"error": "change_too_large", "campaign_id": "c1", "bid": 20000, "asked_change_pct": -30, "max_change_pct": 20}
```

반복 검사를 켠 첫 실행의 3단계에서 set_bid 14000 은 is_error 가 붙은 결과로 돌아왔습니다. 결과에는 바꾸려던 몫 asked_change_pct -30, 상한 max_change_pct 20 이 들어 있었습니다. 가짜 LLM 은 그 결과를 읽고 4단계에서 16000 을 적었는데, 20000 에서 16000 은 정확히 20% 내린 값이고 `run_tool` 은 20% 를 넘을 때만 거부하므로 통과했습니다. 5단계의 get_stats 는 2단계와 같은 호출이라 실행되지 않았습니다. 블록 주석대로 이때 대화 끝에는 짝인 tool_result 가 없는 tool_use 가 하나 남습니다. 줄 끝의 stop=repeat steps=5 tool_calls=6 errors=1 은 반복 검사가 5단계에서 루프를 멈췄고 도구 호출이 6번, 그중 실패가 1번이라는 뜻입니다. 도구 호출 6번은 1단계의 1번과 2단계의 3번에 3단계와 4단계의 set_bid 1번씩을 더한 수이고 실행되지 않은 5단계의 get_stats 는 세지 않았습니다.

반복 검사를 끈 둘째 실행은 5단계에서 get_stats 를 실제로 다시 불러 앞서와 같은 roas 280 을 받았으므로, 6단계에서 다시 30% 를 내린 11200 을 적어 거부당했습니다. 줄 끝의 stop=max_steps steps=6 tool_calls=8 errors=2 는 단계 상한 6 에서 멈췄고 도구를 8번 불러 그중 2번이 실패했다는 뜻입니다. 블록의 3단계가 찍은 refused=2 도 이 둘째 실행에서 거부된 set_bid 2번을 센 값입니다. 첫째 거부(toolu_05)는 예외가 아니라 type 이 tool_result 이고 is_error 가 True 인 블록이며 content 에 거부 까닭 change_too_large 와 상한 max_change_pct 20 이 들어 있습니다.

두 실행 모두 러닝화 입찰가는 16000원에서 끝났습니다. 반복 검사를 켠 실행은 도구를 6번, 끈 실행은 8번 불렀으므로 반복 검사는 앞서와 같은 값을 돌려줄 통계 호출 1번과 거부될 변경 1번을 아꼈습니다. 단계 상한은 다른 조건이 루프를 멈추지 못해도 끝내 주는 마지막 방어선이라 어떤 루프든 6단계 안에서 끝냅니다. 반복 검사를 끈 이 과제에 상한마저 없다면 루프는 거부와 20% 인하를 끝없이 되풀이합니다.

무엇을 같은 호출의 반복으로 볼지는 도구마다 다르게 정합니다. 이 글은 이름과 입력이 같으면 반복으로 봤지만 통계가 자주 바뀌는 도구라면 같은 입력으로 다시 부를 까닭이 있습니다. 그런 도구는 결과까지 같을 때만 반복으로 보거나 같은 호출을 부를 수 있는 횟수에 한도를 둡니다.

| 멈춤 조건 | 누가 정하나 | 이 글에서 멈춘 자리 |
|---|---|---|
| end_turn | 모델 | 첫 과제, 4단계 |
| 같은 호출 반복 (repeat) | 코드 | 둘째 과제, 5단계 |
| 단계 상한 (max_steps) | 코드 | 반복 검사를 끈 둘째 과제, 6단계 |

셋째 카드에서는 반복 검사가 5단계에서, 단계 상한이 6단계에서 루프를 멈추는 자리를 보면 됩니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-tool-loop-cards.html?embed=1&card=stop" height="480" loading="lazy" title="멈춤 조건 셋"></iframe>
<a class="demo-embed-open" href="demo-tool-loop-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 5. 프롬프트가 아니라 코드에 두는 가드레일

**set_bid 의 설명에 20% 상한을 적었지만 가짜 LLM 은 반복 검사를 끈 실행에서 30% 인하를 두 번 적었습니다. 두 번 모두 설명이 아니라 `run_tool` 의 비교 한 줄이 막았습니다.**

모델이 지킬 제한은 프롬프트(모델에 보내는 글, 여기서는 시스템 메시지나 도구 설명)에 「20% 넘게 바꾸지 말라」고 적어 둘 수 있습니다. 하지만 그렇게 적은 글은 모델이 읽기만 할 뿐 모델이 그 제한을 지켰는지는 알려 주지 않습니다. 이 글의 가짜 LLM 은 설명을 아예 읽지 않으므로 4절에서 30% 를 그대로 적었습니다. 진짜 모델이 지킬지는 답을 받아 보기 전에는 알 수 없으므로 광고주의 돈이 걸린 자리에서는 글로 적은 제한만으로 모자랍니다.

그래서 상한은 도구를 실행하는 코드에 둡니다. `run_tool` 은 바꿀 몫을 (새 입찰가 - 지금 입찰가) ÷ 지금 입찰가로 계산해 그 크기가 MAX_CHANGE 0.20 을 넘으면 입찰가를 건드리지 않습니다. 4절의 첫 거부라면 (14000 - 20000) ÷ 20000 은 30% 를 내리는 변경이라 크기 30% 가 상한 20% 를 넘어 거부되었습니다. 이 비교는 모델이 무엇을 적든 매번 같은 답을 내므로 모델이 바뀌거나 프롬프트를 고쳐도 상한은 그대로입니다.

거부는 예외가 아니라 결과로 돌려줍니다. tool_result 블록의 is_error 를 참으로 두고 content 에 까닭과 상한을 적어 보내는데, 예외를 던지면 루프가 멈춰 모델은 왜 안 됐는지 모르지만 결과로 돌려주면 모델이 그 글을 읽고 20% 로 다시 적을 수 있습니다. 4절의 4단계에서 가짜 LLM 이 적은 16000 이 그렇게 고친 호출입니다.

한 번의 상한은 여러 번에 걸쳐 쌓이는 변경을 막지 못합니다. 4절의 둘째 실행처럼 반복 검사가 없는 루프에서 단계 상한이 더 크면 20% 인하가 거듭되어 입찰가가 계속 내려갑니다. 그래서 실제 가드레일은 하루 누적 변경 한도(하루 동안 바꾼 몫을 모두 합한 값의 한도)나 사람의 확인을 받는 문턱을 함께 둡니다. 이 글의 코드에는 한 번의 상한만 있습니다.

| 막는 방법 | 어디에 두나 | 어기면 | 이 글에서 |
|---|---|---|---|
| 시스템 메시지, 도구 설명 | 프롬프트 | 모델이 읽고 따를 수도, 안 따를 수도 있음 | set_bid 설명의 20% 문장 |
| 입력 꼴 검사 | 코드 | 빠진 입력을 error 결과로 돌려줌 | missing_input |
| 한 번의 변경 상한 | 코드 | 실행하지 않고 error 결과로 돌려줌 | change_too_large, 2번 |
| 누적 한도, 사람 확인 | 코드와 사람 | 하루 한도를 넘으면 사람에게 넘김 | 이 글에는 없음 |

넷째 카드에서는 30% 변경 2번이 거부되고 20% 로 고친 호출은 통과하는 차례를 보면 됩니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-tool-loop-cards.html?embed=1&card=guard" height="480" loading="lazy" title="가드레일은 코드"></iframe>
<a class="demo-embed-open" href="demo-tool-loop-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 6. 도구를 서버로 내놓는 MCP

**이 글의 도구 3개는 에이전트와 같은 파일 안에 있는 목록입니다. MCP 는 도구를 서버가 내놓으면 여러 LLM 앱이 같은 꼴의 메시지로 그 도구를 찾아 부르게 하는 공개 프로토콜입니다.**

이 글은 `TOOLS` 목록과 `run_tool` 을 에이전트와 같은 파일에 뒀으므로 다른 앱이 같은 캠페인 도구를 쓰려면 정의와 실행 코드를 다시 짜야 합니다. 도구를 가진 프로그램과 부르는 프로그램이 다르면 두 프로그램이 주고받는 꼴을 미리 정해 두는 편이 낫습니다. MCP 명세는 바로 그 꼴을 정합니다.

명세는 MCP 를 LLM 앱과 바깥의 데이터, 도구를 연결하는 공개 프로토콜이라고 적습니다. 메시지는 JSON-RPC 2.0 을 따르는데, JSON-RPC 는 부를 함수의 이름과 인자를 JSON 으로 적어 보내 다른 프로그램의 함수를 부르는 원격 호출 규약입니다. 연결에 참여하는 역할은 3가지로, 연결을 여는 LLM 앱이 호스트, 호스트 안에서 연결을 맡는 부분이 클라이언트, 기능을 내놓는 프로그램이 서버입니다.

서버가 내놓는 기능도 3가지입니다. 리소스(Resources)는 모델이나 사람이 쓰는 맥락과 데이터를 말합니다. 프롬프트(Prompts)는 사람이 골라 쓰는, 틀이 정해진 메시지입니다. 도구(Tools)는 모델이 실행을 요청하는 함수로, 이 글의 get_campaigns, get_stats, set_bid 는 서버의 도구로 내놓을 수 있는 꼴입니다.

명세는 도구를 임의의 코드 실행(어떤 코드든 돌릴 수 있는 일)으로 보고 조심해서 다루라고 적습니다. 사용자가 데이터 접근과 동작을 알고 동의해야 한다는 문장도 있습니다. 프로토콜이 도구를 내놓는 꼴을 정해도 무엇을 막을지는 여전히 도구를 실행하는 코드가 정하므로, 5절의 20% 상한은 MCP 서버 안에서도 도구를 실행하는 같은 자리에 둡니다.

| MCP 서버의 기능 | 명세의 뜻 | 이 글에 대면 |
|---|---|---|
| Resources | 모델이나 사람이 쓸 맥락과 데이터 | 캠페인 설정 문서, 어제 통계 표 |
| Prompts | 사람이 고르는 틀이 정해진 메시지 | 「목표보다 낮은 캠페인 손보기」 과제 글 |
| Tools | 모델이 실행을 요청하는 함수 | get_campaigns, get_stats, set_bid |

## 7. 두 무대에서 에이전트가 손대는 곳

**도구를 고르고 실행하는 루프는 두 무대에서 같습니다. 두 무대는 도구가 닿는 데이터와 루프를 돌릴 시간이 있는 자리가 다릅니다.**

### 담장 안: 캠페인 설정과 통계를 다 가진 한 회사 [무대: 닫힌 생태계]

한 회사가 서비스와 광고 서버를 다 가진 곳을 담장 안이라고 부릅니다. 담장 안에서는 캠페인 설정과 어제 통계, 입찰가를 바꾸는 API 가 모두 한 회사 안에 있으므로 get_stats 와 set_bid 를 같은 회사의 API 로 만들 수 있습니다. 광고주 화면 안의 도우미가 이 도구들을 부르면 입찰가를 바꾸기 전에 그 화면에서 광고주의 확인을 받기도 쉽습니다.

### 열린 RTB: 입찰 경로 밖에서 돌리는 루프 [무대: 열린 RTB]

여러 회사가 실시간 경매로 남의 지면(광고가 실리는 자리)에 광고를 사고파는 곳을 열린 RTB 라고 부릅니다. 광고를 사는 측의 시스템인 DSP 는 입찰 요청에 짧은 시간 안에 답해야 하므로, 요청을 받아 답하기까지의 입찰 경로에서는 모델을 여러 번 부르는 루프를 요청마다 돌릴 수 없습니다. 그래서 에이전트는 입찰이 일어나기 전에 DSP 안의 캠페인 설정을 손봅니다. 입찰 때는 에이전트가 고쳐 둔 값을 씁니다. 지면을 가진 회사의 데이터는 도구로 부를 수 없으므로 에이전트의 도구가 닿는 곳은 DSP 안의 데이터입니다.

## 한눈 정리

| 자리 | 무엇 | 이 글의 값 |
|---|---|---|
| tool use | LLM 이 답 대신 부를 도구와 입력을 적음 | stop_reason tool_use, tool_use 블록 |
| 도구 정의 | 이름, 설명, input_schema | get_campaigns, get_stats, set_bid |
| 도구 결과 | tool_use_id 로 이은 tool_result 블록 | 실패는 is_error 참 |
| 에이전트 루프 | 고르기, 실행, 결과 더하기의 되풀이 | 첫 과제 4단계, 도구 호출 5번 |
| 멈춤 조건 | end_turn, 같은 호출 반복, 단계 상한 | 4단계, 5단계, 6단계 |
| 가드레일 | 모델이 어겨도 코드가 막는 제한 | 한 번에 20% 넘는 변경 거부 2번 |
| MCP | 서버가 도구, 리소스, 프롬프트를 내놓는 프로토콜 | 이 글은 한 파일 안의 목록 |

## 헷갈리기 쉬운 점

- **도구는 LLM 이 실행하지 않습니다.** 모델은 tool_use 블록에 도구 이름과 입력을 적어 보낼 뿐입니다. 함수를 돌려 입찰가를 바꾼 코드는 `run_tool` 이었으므로 모델에게 무엇을 허락할지도 도구를 실행하는 코드가 정합니다.
- **실패도 결과로 돌려줍니다.** 거부된 set_bid 는 예외가 아니라 is_error 가 참인 tool_result 블록으로 돌아왔습니다. 가짜 LLM 은 그 결과를 읽고 14000원 대신 16000원을 다시 적었습니다. 예외를 던져 루프를 끊으면 모델은 거부된 까닭을 읽지 못해 호출을 고칠 기회를 잃습니다.
- **자율 루프와 정해진 순서의 워크플로는 다릅니다.** 이 글의 루프에서는 단계마다 모델이 다음 도구를 고릅니다. 목록, 통계, 변경처럼 부르는 순서가 늘 같다면 코드가 그 순서대로 도구를 부르는 워크플로로 충분합니다. 모델에게는 순서를 미리 정할 수 없는 자리에서만 고르게 합니다.

## 더 깊이 보기

:::deep ReAct 는 생각과 행동을 번갈아 적게 했습니다
ReAct 논문은 LLM 이 추론하는 글과 행동을 번갈아 내게 하는 방법을 내놓았습니다. 행동은 위키백과 API 검색처럼 바깥의 정보를 가져오는 일이고, 결과를 다시 읽고 다음 추론을 적습니다. 초록은 이 방법이 생각의 사슬 추론에서 흔한 지어낸 답과 오류 전파를 넘어선다고 적었습니다. 이 글의 루프도 고르기, 실행, 결과 읽기를 되풀이한다는 점에서 같은 꼴입니다. 이 글의 가짜 LLM 은 추론하는 글을 적지 않고 규칙으로만 고릅니다.

같은 무렵의 Toolformer 는 어떤 API 를 언제, 어떤 인자로 부를지를 모델이 스스로 배우게 했습니다. 계산기, 검색, 번역, 달력 같은 도구를 썼습니다. 두 논문 모두 고른 호출을 실행하는 것은 모델 밖의 코드입니다.
:::

:::deep 도구 정의 전문
2절의 `TOOLS` 를 JSON 으로 옮긴 것입니다. 블록의 사전과 글자까지 같습니다.

```json
[
  {
    "name": "get_campaigns",
    "description": "List the campaigns with their bid type, bid and target ROAS.",
    "input_schema": {
      "type": "object",
      "properties": {},
      "required": []
    }
  },
  {
    "name": "get_stats",
    "description": "Get yesterday's spend, revenue and ROAS (%) of one campaign.",
    "input_schema": {
      "type": "object",
      "properties": {
        "campaign_id": {
          "type": "string"
        }
      },
      "required": [
        "campaign_id"
      ]
    }
  },
  {
    "name": "set_bid",
    "description": "Set a new bid for one campaign. A change above 20% in one call is refused.",
    "input_schema": {
      "type": "object",
      "properties": {
        "campaign_id": {
          "type": "string"
        },
        "new_bid": {
          "type": "integer"
        }
      },
      "required": [
        "campaign_id",
        "new_bid"
      ]
    }
  }
]
```

properties 의 type 은 JSON Schema 의 자료형 이름입니다. string 은 글자, integer 는 정수입니다. get_campaigns 는 입력이 없어 properties 가 빈 객체입니다.
:::

- [구조화 출력](post.html?id=structured-output) — 이 글의 `stop_reason` 과 content 블록 꼴을 처음 쓴 22주째 편입니다.
- [RAG](post.html?id=rag-basics) — 바로 앞 24주째 편입니다. 찾은 문서를 넣고 답하게 했습니다.
- [LLM 호출 한 번](post.html?id=llm-first-call) — 노트북의 모델에 요청 하나를 처음 보낸 편입니다.
- [후보풀 여덟 질문](post.html?id=candidate-pool-questions) — 이 글의 캠페인 셋의 값이 적힌 편입니다.
- [Tool use 카드 네 장](demo-tool-loop-cards.html) — 이 글의 카드 전체입니다. 카드를 누르면 헷갈리는 것 하나가 더 나옵니다.

## 참고문헌

- Shunyu Yao 외 (2022). *ReAct: Synergizing Reasoning and Acting in Language Models*. arXiv:2210.03629. [arxiv.org](https://arxiv.org/abs/2210.03629). 추론하는 글과 행동을 번갈아 내게 하는 방법입니다.
- Timo Schick 외 (2023). *Toolformer: Language Models Can Teach Themselves to Use Tools*. arXiv:2302.04761. [arxiv.org](https://arxiv.org/abs/2302.04761). 어떤 API 를 언제 부를지 스스로 배운 모델입니다.
- Model Context Protocol. *Specification* (2026-07-28 버전). [modelcontextprotocol.io](https://modelcontextprotocol.io/specification/2026-07-28). 서버가 리소스, 프롬프트, 도구를 내놓는 공개 프로토콜입니다.
- Anthropic. *Tool use with Claude*. [platform.claude.com](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview). 앱이 tool_use 블록을 실행하고 tool_result 로 돌려주는 흐름입니다.
- Anthropic. *Handle tool calls*. [platform.claude.com](https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls). 실행 실패를 tool_result 의 is_error 로 알리는 법입니다.
