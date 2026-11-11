모델 팀 38주째 월요일, 지훈 씨는 밤마다 도는 입찰가 작업을 같은 조건으로 10번 돌려 봤습니다. 광고비에 비해 덜 버는 캠페인을 찾아 입찰가를 내리는 작업입니다. 지난주 서연 씨의 도우미처럼, 다음에 할 일은 모델이 매번 고르게 했습니다.

10번의 끝은 같지 않았습니다. 러닝화 입찰가는 5번은 그대로였고, 나머지는 17,000원이나 19,000원이 되었습니다. 순서를 코드에 적고 모델에게는 마지막 요약만 맡기자 10번 모두 18,000원이었습니다.

**같은 일을 맡길 때, 다음 할 일은 모델이 고르게 할까요, 코드가 정하게 할까요?**

코드가 정한 길로 LLM 과 도구를 부르는 방식을 워크플로, 모델이 단계마다 다음 도구를 고르는 방식을 자율 루프라고 부릅니다. 두 방식은 37주째 [광고주 에이전트](post.html?id=advertiser-agent-mcp) 편의 서버를 같이 씁니다. 순서를 정하는 쪽이 바뀌면 LLM 호출 수와 기다리는 시간, 결과가 매번 같은지가 바뀝니다. 입찰가 하나가 광고주의 하루 광고비를 바꾸므로 이 셋으로 방식을 고릅니다.

> **한 줄 요약:** 캠페인 셋의 ROAS 를 읽고 목표보다 낮은 캠페인의 입찰가를 내리는 일을 두 방식으로 10번씩 돌렸습니다. 서버와 승인 검사는 37주째 편의 코드를 글자 그대로 옮겼습니다. 광고주들이 미리 승인한 범위는 승인 데이터의 규칙 하나로 적었습니다. 자율 루프는 가짜 LLM 이 확률표로 다음 도구를 고르게 했고, LLM 을 run 마다 3~5번 불렀습니다. 워크플로는 코드가 순서를 정하고 LLM 을 요약에 한 번만 불렀습니다. 28주째 기록의 호출 시간을 빌려 세면 run 하나는 중앙값으로 7,236.5ms 와 1,712.5ms 였습니다. 최종 입찰가는 자율 루프가 세 가지, 워크플로가 한 가지였습니다. 자율 루프에서 러닝화 입찰가를 내린 run 은 5번이었고, 10번 가운데 7번은 같은 호출 반복 검사가 멈췄습니다. 여러 에이전트를 잇는 자리에서는 A2A 명세 1.0.0 의 작업 상태로 결과를 주고받았습니다. 타겟 에이전트와 카피 에이전트는 TASK_STATE_COMPLETED 로 끝났습니다. 건강으로 사람을 고르는 요청은 TASK_STATE_REJECTED 로 끝났고, 그 작업에 보낸 다음 메시지는 -32004 로 거절되었습니다.

> **골라 읽는 법** — 절이 6개입니다. 절마다 표나 코드나 카드가 있어 그것만 보고 넘어가도 됩니다.
>
> - 같은 일을 두 방식으로 돌릴 때 다른 것 → 1절
> - LLM 호출 수와 run 하나의 시간 → 2절
> - 10번의 최종 입찰가가 몇 가지인지 → 3절
> - 비용, 지연, 예측 가능성으로 고르는 기준 → 4절
> - 오케스트레이터, A2A, 작업 상태 → 5절
> - 담장 안과 열린 RTB 에서 맡길 수 있는 일 → 6절

이 글의 캠페인 셋, 어제 통계, 목표 ROAS, 객단가는 설명을 위해 만든 가상 데이터입니다. 값은 25주째, 37주째 편과 같습니다. 이 일은 광고주 한 명의 대화 창이 아니라 지훈 씨의 팀이 플랫폼에서 돌리는 운영 작업이라, 서버가 캠페인 셋을 모두 보여 줍니다. 광고주들은 목표 ROAS 아래로 떨어진 캠페인의 입찰가를 내리는 일을 미리 승인해 두었습니다. 도구를 고르는 일은 확률표로 움직이는 가짜 LLM 이 합니다. 진짜 모델은 이 자리에서 시스템 메시지와 대화를 읽고 스스로 고릅니다. 호출 한 번의 시간은 28주째 [자연어 → 타겟 조건](post.html?id=nl-to-targeting-query) 편의 판정 기록에서 빌립니다. qwen3.5:27b 를 thinking 을 끄고 temperature 0 으로 2026-11-07 에 기록한 30건입니다. 카드의 파랑은 코드가 정한 일, 벽돌색은 모델이 고른 것, 먹색은 서버와 에이전트입니다. 회색은 막힌 호출과 멈춘 run, 점선 상자는 가상 값과 승인 기록입니다.

---

## 1. 같은 일을 두 방식으로 돌립니다

**일은 캠페인 셋의 통계를 읽고, 목표 ROAS 보다 낮은 캠페인의 입찰가를 가드레일 안에서 내리는 것입니다. 자율 루프는 모델이 단계마다 다음 도구를 고르고, 워크플로는 코드가 목록, 통계, 입찰가 변경, 요약의 순서를 정합니다. 두 방식 모두 같은 서버와 같은 승인 검사를 지납니다.**

캠페인 셋은 25주째 [Tool use 와 에이전트 루프](post.html?id=tool-use-agent-loop) 편의 러닝화, 여행사, 카페입니다. ROAS 는 그 편에서 광고비 대비 매출을 백분율로 적은 값이라고 풀었습니다. 러닝화의 ROAS 는 280% 로 목표 400% 보다 낮고, 여행사는 360% 로 목표 300% 를 넘습니다. 카페에는 목표가 없습니다. 그래서 이 일에서 입찰가를 내릴 캠페인은 러닝화 하나이고, 한 번에 20% 넘게 바꾸면 서버의 가드레일이 거부합니다.

자율 루프는 25주째 편의 에이전트 루프와 같은 꼴입니다. 단계마다 LLM 을 한 번 부르고, 모델이 돌려준 tool_use 블록을 실행해 결과를 돌려줍니다. 이 글의 가짜 LLM 은 지금까지 읽은 것에 따라 다음 행동을 확률표에서 뽑습니다. 통계를 읽기 전에는 주로 읽고, 다 읽은 뒤에는 주로 입찰가를 내리자고 하며, 가끔 다시 읽거나 일찍 끝냅니다. 내릴 폭은 5, 10, 15, 25, 30% 가운데 하나를 뽑아서, 25% 와 30% 는 가드레일을 넘습니다. 멈춤 조건은 25주째 편과 같은 셋입니다.

워크플로는 코드가 순서를 정합니다. 캠페인 목록을 읽고, 캠페인마다 통계를 읽고, 목표보다 낮은 캠페인의 입찰가를 10% 내립니다. 마지막에 LLM 을 한 번 불러 바뀐 것을 요약하게 합니다. 이 LLM 은 도구를 받지 않아 다음 할 일을 고르지 않고, 코드도 난수를 쓰지 않습니다.

두 방식은 쓰기를 같은 관문에 보냅니다. 37주째 편의 승인 함수 approve 와, 모델의 호출 하나를 승인 검사를 거쳐 서버에 보내는 host_call 입니다. 광고주들의 미리 승인은 approve 가 읽는 데이터의 rules 필드에 적었습니다. 목표 아래 캠페인마다 지금 입찰가를 상한으로 두고, 그 이하로 바꾸는 set_bid 만 승인합니다. 이 작업에는 물어볼 사람이 없어서, 범위 밖의 쓰기는 서버에 가지 않습니다.

Anthropic 의 글 「Building effective agents」는 두 방식을 이렇게 나눕니다. 워크플로는 LLM 과 도구를 미리 정한 코드 경로로 엮은 시스템입니다. 에이전트는 LLM 이 자기 과정과 도구 사용을 그때그때 스스로 이끌고, 일을 어떻게 해낼지에 대한 통제를 쥔 시스템입니다. 이 글의 자율 루프는 뒤의 정의를 가짜 LLM 으로 만든 것입니다. 아래 표는 두 방식이 다른 자리를 모은 것입니다.

| 무엇 | 자율 루프 | 워크플로 |
|---|---|---|
| 다음 할 일을 정하는 쪽 | 모델 (가짜 LLM 의 확률표) | 코드에 적은 순서 |
| LLM 이 하는 일 | 단계마다 다음 도구를 고르고, 끝낼 때를 정함 | 마지막에 요약 한 번 |
| 내릴 폭 | 5, 10, 15, 25, 30% 가운데 뽑음 | 10% |
| 멈추는 자리 | end_turn, 단계 상한 6, 같은 호출 반복 | 코드 경로의 끝 |
| 쓰기가 지나는 관문 | approve 와 서버의 가드레일 | 같음 |
| 난수 | run 마다 다른 시드 | 없음 |

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-workflow-loop-cards.html?embed=1&card=two_ways" height="480" loading="lazy" title="두 방식"></iframe>
<a class="demo-embed-open" href="demo-workflow-loop-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 2. 자율 루프는 LLM 을 더 자주 부르고, 시간의 중앙값도 더 깁니다

**10번씩 돌리자 자율 루프는 run 마다 LLM 을 3~5번 불렀고, 워크플로는 늘 1번 불렀습니다. 28주째 기록의 호출 시간 30개를 호출 차례대로 돌려 쓰고, 도구 시간은 0 으로 칩니다. 그렇게 센 run 하나의 시간은 중앙값으로 7,236.5ms 와 1,712.5ms 입니다.**

아래 블록의 1~5단계의 정의는 37주째 편의 서버와 승인 코드를 글자 그대로 옮긴 것입니다. 37주째 서연 씨의 서버는 c1 만 보여 줬지만, 이 글의 서버는 캠페인 셋을 모두 보여 줍니다. 6단계는 미리 승인한 범위를 rules 에 적고, 7, 8단계가 자율 루프, 9단계가 워크플로입니다. 10단계는 두 방식을 10번씩 돌립니다. 자율 루프의 run 은 시드가 저마다 다르고, run 마다 서버를 새로 만들어 입찰가가 처음 값에서 시작합니다.

```python
# 하는 일: 37주째의 MCP 서버와 승인을 그대로 두고, 같은 일을 자율 루프와 워크플로로 10번씩 돌려 LLM 호출 수와 단계 수를 센다.
import collections
import itertools
import json
import random
import statistics

# 1단계: 가상 캠페인 셋과 어제 통계를 둔다
# 1~5단계의 정의는 37주째 광고주 에이전트 편의 블록 1, 2 에서 글자 그대로 옮겼다.
# 25주째 Tool use 편과 같은 가상 데이터다. 러닝화와 여행사는 구매 1건(cpa)에, 카페는 클릭 1번(cpc)에 입찰한다.
# 목표 ROAS 는 러닝화 400%, 여행사 300% 이고 카페에는 없다. aov 는 구매 1건의 매출, 곧 객단가다.
# pctr, pcvr, daily_budget 은 25주째 편의 사전을 그대로 옮긴 것이고, 이 글의 도구는 쓰지 않는다.
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

# 2단계: 도구 셋을 MCP 의 Tool 꼴로 적는다
# 이름과 설명은 Tool use 편 그대로다. 입력 꼴은 inputSchema 에, 도구가 하는 일의 힌트는 annotations 에 적는다.
# 입력이 없는 get_campaigns 는 명세가 권하는 대로 빈 객체만 받는 꼴(additionalProperties 거짓)로 적는다.
# readOnlyHint 가 참이면 환경을 바꾸지 않는 도구다. 기본값이 거짓이라 적지 않은 도구는 쓰기 도구로 본다.
# destructiveHint 와 idempotentHint 는 readOnlyHint 가 거짓일 때만 뜻이 있어 set_bid 에만 적는다.
# openWorldHint 가 거짓이면 바깥의 열린 대상이 아니라 닫힌 범위, 곧 이 플랫폼의 캠페인만 다루는 도구다.
TOOLS = [
    {'name': 'get_campaigns',
     'description': 'List the campaigns with their bid type, bid and target ROAS.',
     'inputSchema': {'type': 'object', 'additionalProperties': False},
     'annotations': {'readOnlyHint': True, 'openWorldHint': False}},
    {'name': 'get_stats',
     'description': "Get yesterday's spend, revenue and ROAS (%) of one campaign.",
     'inputSchema': {'type': 'object', 'properties': {'campaign_id': {'type': 'string'}},
                     'required': ['campaign_id']},
     'annotations': {'readOnlyHint': True, 'openWorldHint': False}},
    {'name': 'set_bid',
     'description': 'Set a new bid for one campaign. A change above 20% in one call is refused.',
     'inputSchema': {'type': 'object',
                     'properties': {'campaign_id': {'type': 'string'}, 'new_bid': {'type': 'integer'}},
                     'required': ['campaign_id', 'new_bid']},
     'annotations': {'readOnlyHint': False, 'destructiveHint': True, 'idempotentHint': True,
                     'openWorldHint': False}},
]
MAX_CHANGE = 0.20

# 3단계: 서버를 둔다
# MCP 명세 2026-07-28 버전은 연결 상태를 두지 않는다. 요청마다 params 의 _meta 에 프로토콜 버전과 클라이언트 기능을 적는다.
# 결과에는 resultType 이 꼭 들어간다. server/discover 와 tools/list 의 결과에는 캐시 힌트 ttlMs 와 cacheScope 도 들어간다.
# ttlMs 0 은 받자마자 낡은 것으로 보라는 뜻이고, private 은 같은 권한 범위 안에서만 캐시하라는 뜻이다.
# 모르는 도구는 JSON-RPC 오류로 돌려주고, 도구가 실행하다 막힌 일은 isError 가 참인 결과로 돌려준다.
# campaign_ids 는 이 서버가 보여 줄 캠페인이고, allow_write 가 거짓이면 쓰기 도구를 목록에서 뺀다.
PROTOCOL_VERSION = '2026-07-28'
VERSION_KEY = 'io.modelcontextprotocol/protocolVersion'
CAPS_KEY = 'io.modelcontextprotocol/clientCapabilities'
SERVER_INFO = {'name': 'campaign-server', 'version': '1.0.0'}
CACHE = {'ttlMs': 0, 'cacheScope': 'private'}


def ok(req, body):
    """성공 응답. 결과에 resultType 을 넣고, 서버 이름과 버전은 결과의 _meta 에 적는다."""
    result = {'resultType': 'complete', **body, '_meta': {'io.modelcontextprotocol/serverInfo': SERVER_INFO}}
    return {'jsonrpc': '2.0', 'id': req['id'], 'result': result}


def fail(req, code, message, data=None):
    """오류 응답. error 에는 code 와 message 가 들고, data 는 붙여도 되고 빼도 된다."""
    error = {'code': code, 'message': message}
    if data is not None:
        error['data'] = data
    return {'jsonrpc': '2.0', 'id': req.get('id'), 'error': error}


class AdServer:
    """광고주 계정 하나가 쓰는 MCP 서버. 보여 줄 캠페인과 쓰기 도구를 내놓을지를 만들 때 정한다."""

    def __init__(self, campaign_ids, allow_write):
        self.bids = {cid: CAMPAIGNS[cid]['bid'] for cid in campaign_ids}
        self.allow_write = allow_write

    def tools(self):
        return [t for t in TOOLS if self.allow_write or t.get('annotations', {}).get('readOnlyHint', False)]

    def handle(self, req):
        params = req.get('params', {})
        missing = [k for k in (VERSION_KEY, CAPS_KEY) if k not in params.get('_meta', {})]
        if missing:
            return fail(req, -32602, 'Invalid params', {'missing': missing})
        if params['_meta'][VERSION_KEY] != PROTOCOL_VERSION:
            return fail(req, -32022, 'Unsupported protocol version',
                        {'supported': [PROTOCOL_VERSION], 'requested': params['_meta'][VERSION_KEY]})
        if req['method'] == 'server/discover':
            return ok(req, {'supportedVersions': [PROTOCOL_VERSION], 'capabilities': {'tools': {}}, **CACHE})
        if req['method'] == 'tools/list':
            # 쓰기를 끄면 다음 요청부터 목록이 바로 달라져야 해서, CACHE 의 ttlMs 를 0 으로 두었다.
            return ok(req, {'tools': self.tools(), **CACHE})
        if req['method'] == 'tools/call':
            name = params.get('name')
            if name not in [t['name'] for t in self.tools()]:
                return fail(req, -32602, f'Unknown tool: {name}')
            body, is_error = self.run(name, params.get('arguments', {}))
            return ok(req, {'content': [{'type': 'text', 'text': json.dumps(body)}], 'isError': is_error})
        return fail(req, -32601, 'Method not found')

    def run(self, name, args):
        """도구를 실행한다. 막힌 일도 예외를 던지지 않고, error 를 담은 결과와 참을 돌려준다."""
        tool = next(t for t in TOOLS if t['name'] == name)
        missing = [k for k in tool['inputSchema'].get('required', []) if k not in args]
        if missing:
            return {'error': 'missing_input', 'missing': missing}, True
        if name == 'get_campaigns':
            rows = [{'id': cid, 'name': CAMPAIGNS[cid]['name'], 'bid_type': CAMPAIGNS[cid]['bid_type'],
                     'bid': bid, 'target_roas': CAMPAIGNS[cid]['target_roas']} for cid, bid in self.bids.items()]
            return {'campaigns': rows}, False
        cid = args['campaign_id']
        if cid not in self.bids:
            # 보여 주지 않는 캠페인은 없는 캠페인과 같은 답을 받는다. 있는지도 알려 주지 않는다.
            return {'error': 'unknown_campaign', 'campaign_id': cid}, True
        if name == 'get_stats':
            spend = STATS[cid]['spend']
            revenue = STATS[cid]['conversions'] * CAMPAIGNS[cid]['aov']
            return {'campaign_id': cid, 'spend': spend, 'revenue': revenue,
                    'roas': round(revenue / spend * 100)}, False
        old, new = self.bids[cid], args['new_bid']
        if not isinstance(new, int) or new <= 0:
            return {'error': 'invalid_input', 'new_bid': new}, True
        change = (new - old) / old
        if abs(change) > MAX_CHANGE:
            # 가드레일. 승인을 받은 호출이어도 서버는 이 비교를 다시 한다.
            return {'error': 'change_too_large', 'campaign_id': cid, 'bid': old,
                    'asked_change_pct': round(change * 100), 'max_change_pct': round(MAX_CHANGE * 100)}, True
        self.bids[cid] = new
        return {'campaign_id': cid, 'old_bid': old, 'new_bid': new}, False


# 4단계: 클라이언트가 요청을 만드는 코드를 둔다
# 요청마다 id 를 새로 붙이고 params 에 _meta 를 넣는다. 한 프로세스 안이라 전송 없이 사전을 바로 건넨다.
# brief 는 찍을 때만 _meta 와 도구 결과의 글을 "..." 로 줄인다. 결과의 글은 다음 줄에 따로 찍는다.
REQUEST_IDS = itertools.count(1)


def meta():
    return {VERSION_KEY: PROTOCOL_VERSION, CAPS_KEY: {},
            'io.modelcontextprotocol/clientInfo': {'name': 'advertiser-agent', 'version': '1.0.0'}}


def rpc(server, method, params=None):
    req = {'jsonrpc': '2.0', 'id': next(REQUEST_IDS), 'method': method,
           'params': {**(params or {}), '_meta': meta()}}
    return req, server.handle(req)


def brief(msg):
    out = dict(msg)
    for key in ('params', 'result'):
        if key in out:
            out[key] = {k: ('...' if k == '_meta' else v) for k, v in out[key].items()}
    if 'content' in out.get('result', {}):
        out['result']['content'] = [{'type': 'text', 'text': '...'}]
    return out


def show_call(req, resp):
    print('->', json.dumps(brief(req)))
    print('<-', json.dumps(brief(resp)))
    if 'result' in resp and 'content' in resp['result']:
        print('   text', resp['result']['content'][0]['text'])



# 5단계: 승인과 호스트의 관문을 둔다
# 37주째 블록 2 의 승인 함수와 host_call 이다. 승인은 모델이 쓰는 글이 아니라 호스트의 코드가 보는 데이터다.
# tools 는 처음부터 허락한 읽기 도구 둘이다. call_ids 는 사람이 화면에서 승인한 호출인데, 이 글에는 물어볼 사람이 없어 비어 있다.
# rules 는 미리 승인한 범위다. 이 글은 6단계에서 광고주들이 미리 승인한 범위를 여기에 적는다.
# host_call 은 tool_use 블록 하나를 처리한다. approve 가 거짓이면 사람에게 묻는데(decide), 이 글은 decide 가 None 이다.
# 그래서 범위 밖의 쓰기는 서버에 가지 않고 approval_required 를 돌려받는다. 참이면 tools/call 을 보내고 결과와 isError 를 돌려준다.
APPROVALS = {'tools': {'get_campaigns', 'get_stats'}, 'call_ids': {}, 'rules': []}


def call_key(call):
    """승인 기록에 남기는 호출의 내용. 도구 이름과, 키를 정렬한 입력 JSON 이다."""
    return call['name'], json.dumps(call['input'], sort_keys=True, ensure_ascii=False)


def approve(call):
    """tool_use 블록 하나를 실행해도 되는지 본다. 허락한 도구, 승인한 호출과 id, 이름, 입력이 모두 같은 호출, 미리 승인한 범위 가운데 하나면 참이다."""
    if call['name'] in APPROVALS['tools'] or APPROVALS['call_ids'].get(call['id']) == call_key(call):
        return True
    args = call['input']
    return any(rule['tool'] == call['name'] and rule['campaign_id'] == args.get('campaign_id')
               and isinstance(args.get('new_bid'), int) and args['new_bid'] <= rule['max_new_bid']
               for rule in APPROVALS['rules'])


def host_call(server, block, decide, run):
    log = run['trace'].append
    if not approve(block):
        if decide is None:
            log(f"  approve {block['id']} -> False, no one to ask")
        elif decide(block):
            APPROVALS['call_ids'][block['id']] = call_key(block)
            log(f"  approve {block['id']} -> False, asked the advertiser -> approved -> {approve(block)}")
        else:
            log(f"  approve {block['id']} -> False, asked the advertiser -> declined")
    if not approve(block):
        log('  not sent to the server')
        return {'error': 'approval_required', 'tool': block['name']}, True
    req, resp = rpc(server, 'tools/call', {'name': block['name'], 'arguments': block['input']})
    run['wire'].append((req, resp))
    if 'error' in resp:
        log(f"  jsonrpc id={req['id']} tools/call {block['name']} -> error {resp['error']['code']}")
        return {'error': 'protocol_error', **resp['error']}, True
    body, is_error = json.loads(resp['result']['content'][0]['text']), resp['result']['isError']
    log(f"  jsonrpc id={req['id']} tools/call {block['name']} -> isError={json.dumps(is_error)}")
    return body, is_error


# 6단계: 광고주들이 미리 승인한 범위를 rules 에 적는다
# 이 일은 광고주 한 명의 대화 창이 아니라 지훈 씨의 팀이 돌리는 운영 작업이라, 서버가 캠페인 셋을 모두 보여 준다.
# 광고주들은 목표 ROAS 아래 캠페인의 입찰가를 내리는 일을 미리 승인했다. 호스트는 서버에서 목록과 통계를 읽고,
# 목표 아래 캠페인마다 지금 입찰가를 max_new_bid 로 적는다. 그 값 이하로 바꾸는 set_bid 만 승인된다.
setup = AdServer(['c1', 'c2', 'c3'], allow_write=True)
req, resp = rpc(setup, 'tools/call', {'name': 'get_campaigns', 'arguments': {}})
show_call(req, resp)
for row in json.loads(resp['result']['content'][0]['text'])['campaigns']:
    _, got = rpc(setup, 'tools/call', {'name': 'get_stats', 'arguments': {'campaign_id': row['id']}})
    roas = json.loads(got['result']['content'][0]['text'])['roas']
    below = row['target_roas'] is not None and roas < row['target_roas']
    print(f"{row['id']} roas {roas}, target {row['target_roas']}, below target {below}")
    if below:
        APPROVALS['rules'].append({'tool': 'set_bid', 'campaign_id': row['id'], 'max_new_bid': row['bid']})
print('rules', json.dumps(APPROVALS['rules']))
for cid, bid in (('c1', 18000), ('c2', 45000)):
    probe = {'type': 'tool_use', 'id': f'probe_{cid}', 'name': 'set_bid', 'input': {'campaign_id': cid, 'new_bid': bid}}
    print(f'approve set_bid {cid} {bid} -> {approve(probe)}')


# 7단계: 자율 루프의 가짜 LLM 을 둔다
# 응답 꼴은 37주째와 같다. stop_reason 과 content 블록 목록이고, 도구를 부를 때는 tool_use 블록(id, name, input)이 든다.
# 다음 행동은 대화에서 읽은 지금 자리(where)에 따라 PROBS 의 확률로 뽑는다. 확률은 측정한 값이 아니라 이 글이 정한 가상 값이다.
# read 는 아직 읽지 않은 것을, reread 는 이미 읽은 통계 하나를 다시 읽는다. change 는 목표 아래 캠페인을, change_other 는 다른 캠페인을 내린다.
# reread 는 이미 부른 get_stats 를 같은 입력으로 다시 부르므로, 뽑히면 8단계의 같은 호출 반복 검사가 그 단계에서 멈춘다.
# 내릴 폭은 CUTS 에서 같은 확률로 뽑는다. 25 와 30 은 가드레일 20% 를 넘는다. end 는 바뀐 것을 글로 적고 끝낸다.
PROBS = {
    'start': {'read': 1.0},
    'listed': {'read': 0.9, 'end': 0.1},
    'read': {'change': 0.6, 'change_other': 0.1, 'reread': 0.15, 'end': 0.15},
    'refused': {'change': 0.6, 'change_other': 0.1, 'reread': 0.1, 'end': 0.2},
    'changed': {'end': 0.7, 'change': 0.15, 'reread': 0.15},
}
CUTS = [5, 10, 15, 25, 30]
TOOL_USE_IDS = itertools.count(1)


def loop_state(messages):
    """대화에서 캠페인 목록, 처음 입찰가, 통계, 마지막 set_bid 가 거부되었는지를 꺼낸다. 통과한 set_bid 는 입찰가에 반영한다."""
    calls, campaigns, start, stats, refused = {}, None, {}, {}, None
    for m in messages[1:]:
        for block in m['content']:
            if block['type'] == 'tool_use':
                calls[block['id']] = block
            elif block['type'] == 'tool_result':
                call, body = calls[block['tool_use_id']], json.loads(block['content'])
                if call['name'] == 'get_campaigns':
                    campaigns = {row['id']: dict(row) for row in body['campaigns']}
                    start = {cid: row['bid'] for cid, row in campaigns.items()}
                elif call['name'] == 'get_stats':
                    stats[body['campaign_id']] = body
                elif call['name'] == 'set_bid':
                    refused = block['is_error']
                    if not refused:
                        campaigns[body['campaign_id']]['bid'] = body['new_bid']
    return campaigns, start, stats, refused


def loop_llm(system, messages, tools, rng):
    """진짜 SDK 와 같은 꼴의 응답을 돌려준다. 다음 행동은 지금 자리의 확률을 rng 로 뽑아 정한다."""
    # system 과 tools 는 SDK 의 호출 꼴을 맞추려고 받는다. 확률표는 대화만 본다.
    campaigns, start, stats, refused = loop_state(messages)
    where = ('start' if campaigns is None else 'listed' if len(stats) < len(campaigns)
             else 'read' if refused is None else 'refused' if refused else 'changed')
    act = rng.choices(list(PROBS[where]), weights=list(PROBS[where].values()))[0]

    def use(name, args):
        return {'type': 'tool_use', 'id': f'toolu_{next(TOOL_USE_IDS):02d}', 'name': name, 'input': args}

    if act == 'read' and campaigns is None:
        return {'stop_reason': 'tool_use', 'content': [use('get_campaigns', {})]}
    if act == 'read':
        return {'stop_reason': 'tool_use',
                'content': [use('get_stats', {'campaign_id': cid}) for cid in campaigns if cid not in stats]}
    if act == 'reread':
        return {'stop_reason': 'tool_use', 'content': [use('get_stats', {'campaign_id': rng.choice(sorted(stats))})]}
    if act in ('change', 'change_other'):
        # 목표 아래 캠페인은 통계를 다 읽은 뒤에만 셀 수 있다. listed 에서 end 를 뽑은 run 은 여기 오지 않는다.
        below = [cid for cid, c in campaigns.items()
                 if c['target_roas'] is not None and stats[cid]['roas'] < c['target_roas']]
        cid = below[0] if act == 'change' else rng.choice([c for c in campaigns if c not in below])
        new_bid = round(campaigns[cid]['bid'] * (100 - rng.choice(CUTS)) / 100)
        return {'stop_reason': 'tool_use', 'content': [use('set_bid', {'campaign_id': cid, 'new_bid': new_bid})]}
    done = [f"{cid} bid {start[cid]} -> {c['bid']}" for cid, c in campaigns.items() if c['bid'] != start[cid]]
    text = 'Changed: ' + ', '.join(done) + '.' if done else 'No bid changed.'
    return {'stop_reason': 'end_turn', 'content': [{'type': 'text', 'text': text}]}


# 8단계: 자율 루프를 둔다
# 한 단계는 LLM 을 한 번 부르는 일이다. 모델이 돌려준 tool_use 블록은 모두 host_call 을 지나 같은 서버로 간다.
# 물어볼 사람이 없는 작업이라 decide 는 None 이다. run 을 시작할 때 call_ids 를 비우고 서버를 새로 만든다.
# 멈춤 조건은 25주째와 같은 셋이다. end_turn, 단계 상한 max_steps, 같은 도구를 같은 입력으로 다시 부르기(repeat)다.
SYSTEM = 'You manage ad campaigns through the tools.'
JOB = 'Lower the bid of each campaign below its target ROAS. One change may not move a bid by more than 20%.'


def short(body):
    """찍을 때만 캠페인 목록을 id 로 줄인다."""
    return {'campaigns': [row['id'] for row in body['campaigns']]} if 'campaigns' in body else body


def count_write(run, block, body):
    """set_bid 의 시도와 거부를 센다. approval_required 는 호스트의 approve 가, change_too_large 는 서버의 가드레일이 막은 것이다."""
    if block['name'] != 'set_bid':
        return
    run['writes'] += 1
    by = {'approval_required': 'approve', 'change_too_large': 'guardrail'}.get(body.get('error'))
    if by:
        run['refused'].append((by, block['input']['campaign_id'], block['input']['new_bid']))


def new_run(first_line):
    return {'trace': [first_line], 'wire': [], 'llm_calls': 0, 'writes': 0, 'refused': [], 'repeated': None}


def run_loop(seed, max_steps=6):
    rng = random.Random(seed)
    server = AdServer(['c1', 'c2', 'c3'], allow_write=True)
    APPROVALS['call_ids'].clear()
    _, listed = rpc(server, 'tools/list')
    tools = [{'name': t['name'], 'description': t['description'], 'input_schema': t['inputSchema']}
             for t in listed['result']['tools']]
    messages = [{'role': 'user', 'content': JOB}]
    run = new_run(f'loop seed {seed}')
    log, seen = run['trace'].append, set()

    def finish(stop, steps):
        log(f'stop={stop} steps={steps}')
        return dict(run, seed=seed, stop=stop, steps=steps, bids=dict(server.bids))

    for step in range(1, max_steps + 1):
        response = loop_llm(SYSTEM, messages, tools, rng)
        run['llm_calls'] += 1
        messages.append({'role': 'assistant', 'content': response['content']})
        log(f"step {step} stop_reason={response['stop_reason']}")
        results = []
        for block in response['content']:
            if block['type'] == 'text':
                log(f"  text {block['text']}")
                continue
            log(f"  tool_use {block['id']} {block['name']} {json.dumps(block['input'])}")
            key = block['name'] + json.dumps(block['input'], sort_keys=True)
            if key in seen:
                run['repeated'] = block['name'] + ' ' + ' '.join(str(v) for v in block['input'].values())
                return finish('repeat', step)
            seen.add(key)
            body, is_error = host_call(server, block, None, run)
            count_write(run, block, body)
            results.append({'type': 'tool_result', 'tool_use_id': block['id'],
                            'content': json.dumps(body), 'is_error': is_error})
            log(f"  tool_result {block['id']}{' is_error' if is_error else ''} {json.dumps(short(body))}")
        if response['stop_reason'] == 'end_turn':
            return finish('end_turn', step)
        messages.append({'role': 'user', 'content': results})
    return finish('max_steps', max_steps)


# 9단계: 워크플로를 둔다
# 순서는 코드가 정한다. 목록, 캠페인마다 통계, 목표 아래 캠페인의 입찰가를 10% 내리기, LLM 요약 한 번의 네 단계다.
# 호출은 tool_use 블록과 같은 꼴로 만들어 같은 host_call 에 넣는다. 그래서 같은 approve 와 같은 서버의 가드레일을 지난다.
# LLM 은 도구를 받지 않고, 바뀐 입찰가를 받아 요약하는 글만 쓴다. 난수는 쓰지 않는다.
CUT = 10
WORKFLOW_IDS = itertools.count(1)


def summary_llm(system, messages):
    """요약만 쓰는 가짜 LLM. 도구를 받지 않아 늘 end_turn 으로 답한다."""
    # system 은 SDK 의 호출 꼴을 맞추려고 받는다.
    changed = json.loads(messages[0]['content'])['changed']
    done = [f"{b['campaign_id']} bid {b['old_bid']} -> {b['new_bid']}" for b in changed]
    text = 'Changed: ' + ', '.join(done) + '.' if done else 'No bid changed.'
    return {'stop_reason': 'end_turn', 'content': [{'type': 'text', 'text': text}]}


def run_workflow():
    server = AdServer(['c1', 'c2', 'c3'], allow_write=True)
    APPROVALS['call_ids'].clear()
    run = new_run('workflow')
    log = run['trace'].append

    def call(name, args):
        block = {'type': 'tool_use', 'id': f'wf_{next(WORKFLOW_IDS):02d}', 'name': name, 'input': args}
        log(f"  call {block['id']} {name} {json.dumps(args)}")
        body, is_error = host_call(server, block, None, run)
        count_write(run, block, body)
        log(f"  result {block['id']}{' is_error' if is_error else ''} {json.dumps(short(body))}")
        return body

    log('stage 1 code: get_campaigns')
    rows = call('get_campaigns', {})['campaigns']
    log('stage 2 code: get_stats for each campaign')
    stats = {row['id']: call('get_stats', {'campaign_id': row['id']}) for row in rows}
    log(f'stage 3 code: set_bid -{CUT}% for each campaign below target')
    tried = [call('set_bid', {'campaign_id': row['id'], 'new_bid': round(row['bid'] * (100 - CUT) / 100)})
             for row in rows if row['target_roas'] is not None and stats[row['id']]['roas'] < row['target_roas']]
    changed = [body for body in tried if 'error' not in body]
    response = summary_llm(SYSTEM, [{'role': 'user', 'content': json.dumps({'changed': changed})}])
    run['llm_calls'] += 1
    log(f"stage 4 llm stop_reason={response['stop_reason']}")
    log(f"  text {response['content'][0]['text']}")
    steps = sum(line.startswith('stage ') for line in run['trace'])
    return dict(run, seed=None, stop='code path', steps=steps, bids=dict(server.bids))


# 10단계: 두 방식을 10번씩 돌린다
# 자율 루프는 random.Random(7) 이 run 마다 시드 하나를 뽑고, run 은 그 시드의 random.Random 으로 고른다.
# 두 방식의 첫 run 을 찍는다. 37주째의 host_call 이 trace 에 남기는 jsonrpc 줄은 빼고 찍는다.
master = random.Random(7)
SEEDS = [master.randrange(10 ** 6) for _ in range(10)]
RUNS = {'loop': [run_loop(seed) for seed in SEEDS], 'workflow': [run_workflow() for _ in range(10)]}
for way in ('loop', 'workflow'):
    print('\n'.join(line for line in RUNS[way][0]['trace'] if not line.startswith('  jsonrpc')))
for way in ('loop', 'workflow'):
    parts = []
    for name in ('llm_calls', 'steps'):
        v = [r[name] for r in RUNS[way]]
        parts.append(f'{name} min {min(v)}, median {statistics.median(v):g}, max {max(v)}')
    print(f'{way}: ' + ' / '.join(parts))
stops = collections.Counter(r['stop'] for r in RUNS['loop'])
print('loop stop:', ', '.join(f'{name} {stops[name]}' for name in ('end_turn', 'repeat', 'max_steps')))

# 출력:
# 6단계 뜻: 캠페인 셋이 모두 보이고, 목표 아래는 러닝화 c1 하나라 rules 에 상한 20000 이 적힌다. c1 인하는 승인되고, 목표를 넘는 c2 인하는 승인되지 않는다.
# -> {"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "get_campaigns", "arguments": {}, "_meta": "..."}}
# <- {"jsonrpc": "2.0", "id": 1, "result": {"resultType": "complete", "content": [{"type": "text", "text": "..."}], "isError": false, "_meta": "..."}}
#    text {"campaigns": [{"id": "c1", "name": "running_shoes", "bid_type": "cpa", "bid": 20000, "target_roas": 400}, {"id": "c2", "name": "travel_agency", "bid_type": "cpa", "bid": 50000, "target_roas": 300}, {"id": "c3", "name": "cafe", "bid_type": "cpc_manual", "bid": 300, "target_roas": null}]}
# c1 roas 280, target 400, below target True
# c2 roas 360, target 300, below target False
# c3 roas 160, target None, below target False
# rules [{"tool": "set_bid", "campaign_id": "c1", "max_new_bid": 20000}]
# approve set_bid c1 18000 -> True
# approve set_bid c2 45000 -> False
# 10단계 뜻: 자율 루프의 첫 run 은 30% 인하가 가드레일에 거부되자 아무것도 바꾸지 않고 끝난다. 워크플로는 네 단계에 18000 으로 바꾼다. LLM 호출은 자율 루프 3~5번, 워크플로 1번이다.
# loop seed 339563
# step 1 stop_reason=tool_use
#   tool_use toolu_01 get_campaigns {}
#   tool_result toolu_01 {"campaigns": ["c1", "c2", "c3"]}
# step 2 stop_reason=tool_use
#   tool_use toolu_02 get_stats {"campaign_id": "c1"}
#   tool_result toolu_02 {"campaign_id": "c1", "spend": 3000000, "revenue": 8400000, "roas": 280}
#   tool_use toolu_03 get_stats {"campaign_id": "c2"}
#   tool_result toolu_03 {"campaign_id": "c2", "spend": 2000000, "revenue": 7200000, "roas": 360}
#   tool_use toolu_04 get_stats {"campaign_id": "c3"}
#   tool_result toolu_04 {"campaign_id": "c3", "spend": 300000, "revenue": 480000, "roas": 160}
# step 3 stop_reason=tool_use
#   tool_use toolu_05 set_bid {"campaign_id": "c1", "new_bid": 14000}
#   tool_result toolu_05 is_error {"error": "change_too_large", "campaign_id": "c1", "bid": 20000, "asked_change_pct": -30, "max_change_pct": 20}
# step 4 stop_reason=end_turn
#   text No bid changed.
# stop=end_turn steps=4
# workflow
# stage 1 code: get_campaigns
#   call wf_01 get_campaigns {}
#   result wf_01 {"campaigns": ["c1", "c2", "c3"]}
# stage 2 code: get_stats for each campaign
#   call wf_02 get_stats {"campaign_id": "c1"}
#   result wf_02 {"campaign_id": "c1", "spend": 3000000, "revenue": 8400000, "roas": 280}
#   call wf_03 get_stats {"campaign_id": "c2"}
#   result wf_03 {"campaign_id": "c2", "spend": 2000000, "revenue": 7200000, "roas": 360}
#   call wf_04 get_stats {"campaign_id": "c3"}
#   result wf_04 {"campaign_id": "c3", "spend": 300000, "revenue": 480000, "roas": 160}
# stage 3 code: set_bid -10% for each campaign below target
#   call wf_05 set_bid {"campaign_id": "c1", "new_bid": 18000}
#   result wf_05 {"campaign_id": "c1", "old_bid": 20000, "new_bid": 18000}
# stage 4 llm stop_reason=end_turn
#   text Changed: c1 bid 20000 -> 18000.
# loop: llm_calls min 3, median 4, max 5 / steps min 3, median 4, max 5
# workflow: llm_calls min 1, median 1, max 1 / steps min 4, median 4, max 4
# loop stop: end_turn 3, repeat 7, max_steps 0
```

6단계는 러닝화만 목표 아래임을 확인하고, rules 에 c1 의 상한 20,000원을 적었습니다. 시험으로 넣은 두 호출 가운데 c1 을 18,000원으로 내리는 호출은 승인되었습니다. 목표를 넘는 c2 를 45,000원으로 내리는 호출은 승인되지 않았습니다. 자율 루프의 첫 run 은 목록과 통계를 읽은 뒤 러닝화를 30% 내린 14,000원을 적었습니다. 서버의 가드레일이 거부해 모델은 is_error 가 참인 tool_result 를 받았고, 다음 단계에서 아무것도 바꾸지 않은 채 끝냈습니다. 워크플로의 첫 run 은 네 단계 만에 18,000원으로 바꾸고 요약을 받았습니다.

이 글에서 단계는 앞의 일이 끝나야 시작하는 차례 하나입니다. 자율 루프는 LLM 호출 하나와 그 호출이 고른 도구의 실행이 한 단계이고, 워크플로는 코드 경로의 네 차례가 단계입니다. 그래서 자율 루프는 LLM 호출 수와 단계 수가 같고, 워크플로는 단계가 넷이어도 LLM 호출은 하나입니다. 자율 루프 10번 가운데 7번은 같은 호출 반복 검사가, 3번은 모델의 end_turn 이 멈췄습니다. 이 글의 확률표에서 reread 는 이미 읽은 통계를 같은 입력으로 다시 부르는 행동이라, 뽑히면 그 단계에서 같은 호출 반복 검사에 걸립니다. 이 10번의 반복 7번이 모두 그런 다시 읽기였고, 단계 상한 6까지 간 run 은 없었습니다. 가장 긴 run 은 5단계였습니다.

시간은 진짜 모델의 기록에서 빌립니다. 28주째 판정 기록 30건의 걸린 시간(elapsed_ms)을 LLM 호출 차례대로 하나씩 대응시킵니다. 30번째 뒤에는 첫 값으로 돌아가고, 두 방식은 각자 첫 값부터 셉니다. 도구 호출은 한 프로세스 안에서 돌아 시간을 0 으로 칩니다. 그 기록은 짧은 JSON 하나를 받는 판정 호출이라, 실제 에이전트의 호출 시간과 다를 수 있습니다.

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 28주째 판정 기록의 걸린 시간을 LLM 호출 차례대로 빌려 run 마다 전체 시간을 세고, 10번의 최종 입찰가가 몇 가지인지 센다.
# 기록 data/llm-records/nl-to-targeting-query-verdict.json 에서 옮김
RECORD = {"n01": "{\"verdict\": \"supported\", \"reason_code\": \"none\"}", "n02": "{\"verdict\": \"unsupported\", \"reason_code\": \"exposure_history_unavailable\"}", "n03": "{\"verdict\": \"unsupported\", \"reason_code\": \"sensitive_attribute\"}", "n04": "{\"verdict\": \"supported\", \"reason_code\": \"none\"}", "n05": "{\"verdict\": \"partial\", \"reason_code\": \"unknown_field\"}", "n06": "{\"verdict\": \"supported\", \"reason_code\": \"none\"}", "n07": "{\"verdict\": \"unsupported\", \"reason_code\": \"unknown_field\"}", "n08": "{\"verdict\": \"unsupported\", \"reason_code\": \"exposure_history_unavailable\"}", "n09": "{\"verdict\": \"supported\", \"reason_code\": \"none\"}", "n10": "{\"verdict\": \"supported\", \"reason_code\": \"none\"}", "n11": "{\"verdict\": \"unsupported\", \"reason_code\": \"exposure_history_unavailable\"}", "n12": "{\"verdict\": \"unsupported\", \"reason_code\": \"unknown_field\"}", "n13": "{\"verdict\": \"supported\", \"reason_code\": \"none\"}", "n14": "{\"verdict\": \"unsupported\", \"reason_code\": \"exposure_history_unavailable\"}", "n15": "{\"verdict\": \"supported\", \"reason_code\": \"none\"}", "n16": "{\"verdict\": \"unsupported\", \"reason_code\": \"sensitive_attribute\"}", "n17": "{\"verdict\": \"partial\", \"reason_code\": \"unknown_field\"}", "n18": "{\"verdict\": \"supported\", \"reason_code\": \"none\"}", "n19": "{\"verdict\": \"unsupported\", \"reason_code\": \"unknown_field\"}", "n20": "{\"verdict\": \"unsupported\", \"reason_code\": \"exposure_history_unavailable\"}", "n21": "{\"verdict\": \"supported\", \"reason_code\": \"none\"}", "n22": "{\"verdict\": \"partial\", \"reason_code\": \"unknown_field\"}", "n23": "{\"verdict\": \"supported\", \"reason_code\": \"none\"}", "n24": "{\"verdict\": \"unsupported\", \"reason_code\": \"exposure_history_unavailable\"}", "n25": "{\"verdict\": \"partial\", \"reason_code\": \"unknown_field\"}", "n26": "{\"verdict\": \"supported\", \"reason_code\": \"none\"}", "n27": "{\"verdict\": \"unsupported\", \"reason_code\": \"unknown_field\"}", "n28": "{\"verdict\": \"unsupported\", \"reason_code\": \"exposure_history_unavailable\"}", "n29": "{\"verdict\": \"supported\", \"reason_code\": \"none\"}", "n30": "{\"verdict\": \"unsupported\", \"reason_code\": \"exposure_history_unavailable\"}"}
USAGE = {"n01": [561, 14, 5201, 0], "n02": [574, 18, 5494, 0], "n03": [561, 16, 1722, 0], "n04": [563, 14, 1566, 0], "n05": [565, 15, 1703, 0], "n06": [571, 14, 1648, 0], "n07": [560, 15, 1725, 0], "n08": [570, 18, 1891, 0], "n09": [571, 14, 1624, 0], "n10": [562, 14, 1607, 0], "n11": [563, 18, 1984, 0], "n12": [565, 15, 1673, 0], "n13": [562, 14, 1723, 0], "n14": [568, 18, 2490, 0], "n15": [567, 14, 1588, 0], "n16": [566, 16, 1921, 0], "n17": [570, 15, 1641, 0], "n18": [564, 14, 1794, 0], "n19": [561, 15, 2007, 0], "n20": [569, 18, 2114, 0], "n21": [568, 14, 1934, 0], "n22": [566, 15, 2031, 0], "n23": [563, 14, 1699, 0], "n24": [566, 18, 2290, 0], "n25": [568, 15, 2012, 0], "n26": [566, 14, 1753, 0], "n27": [561, 15, 1838, 0], "n28": [566, 18, 1903, 0], "n29": [564, 14, 1616, 0], "n30": [565, 18, 1824, 0]}

# 1단계: 빌려 쓸 호출 시간 30개를 꺼낸다
# USAGE 의 값은 [prompt_tokens, output_tokens, elapsed_ms, thinking_chars] 이고, 셋째 값이 호출 한 번에 걸린 시간(ms)이다.
# RECORD 와 USAGE 는 키 차례가 같다. 이 글은 RECORD 의 답을 쓰지 않고, 그 키 차례로 시간만 꺼낸다.
TIMES = [USAGE[key][2] for key in RECORD]
print(f'borrowed {len(TIMES)} calls: first two {TIMES[:2]} ms, the other {len(TIMES) - 2} from {min(TIMES[2:])} to {max(TIMES[2:])} ms')


# 2단계: run 마다 전체 시간을 센다
# 가정 셋을 둔다. 호출 한 번의 시간은 이 기록에서 빌린다. LLM 호출 차례대로 값을 하나씩 주고, 30번째 뒤에는 첫 값으로 돌아간다.
# 차례는 방식마다 따로 첫 값부터 센다. 도구 호출은 한 프로세스 안에서 돌아 시간을 0 으로 친다.
# writes 는 set_bid 를 부른 수, refused 는 그 가운데 approve 나 가드레일이 막은 수, passed 는 서버가 받아들인 수다.
def assign(runs):
    """run 마다 받은 값의 차례(0부터) 목록을 돌려준다. LLM 호출 하나에 값 하나다."""
    order = itertools.cycle(range(len(TIMES)))
    return [[next(order) for _ in range(r['llm_calls'])] for r in runs]


GOT = {way: assign(RUNS[way]) for way in RUNS}
MS = {way: [sum(TIMES[i] for i in got) for got in GOT[way]] for way in RUNS}
print('loop run    seed  stop      llm  writes  refused  passed     ms  bids c1 c2 c3')
for n, (r, ms) in enumerate(zip(RUNS['loop'], MS['loop']), 1):
    b = r['bids']
    print(f"{n:>8}  {r['seed']:>6}  {r['stop']:<9} {r['llm_calls']:>3}  {r['writes']:>6}  {len(r['refused']):>7}"
          f"  {r['writes'] - len(r['refused']):>6}  {ms:>5}"
          f"  {b['c1']} {b['c2']} {b['c3']}")
print('refused writes:', ' / '.join(f'run {n} ' + ', '.join(f'{by} {cid} {bid}' for by, cid, bid in r['refused'])
                                  for n, r in enumerate(RUNS['loop'], 1) if r['refused']))
print('repeated calls:', ' / '.join(f"run {n} {r['repeated']}" for n, r in enumerate(RUNS['loop'], 1) if r['repeated']))
print('workflow (stop, llm, writes, refused) in all runs:',
      sorted({(r['stop'], r['llm_calls'], r['writes'], len(r['refused'])) for r in RUNS['workflow']}))
print('workflow ms per run', MS['workflow'])
for way in ('loop', 'workflow'):
    first_two = [n for n, got in enumerate(GOT[way], 1) if {0, 1} & set(got)]
    print(f'{way} ms: min {min(MS[way])}, median {statistics.median(MS[way]):g}, max {max(MS[way])},'
          f' runs given the first two values {first_two}')

# 3단계: 10번의 최종 입찰가가 몇 가지인지 센다
# 최종 입찰가는 run 이 끝났을 때 서버에 남은 c1, c2, c3 의 입찰가다. 같은 묶음끼리 모아 run 번호와 멈춘 까닭을 적는다.
for way in ('loop', 'workflow'):
    groups = collections.defaultdict(list)
    for n, r in enumerate(RUNS[way], 1):
        groups[tuple(r['bids'].values())].append(n)
    print(f'{way} distinct final bid sets: {len(groups)}')
    for bids, runs in sorted(groups.items(), key=lambda kv: -len(kv[1])):
        pct = round((bids[0] - CAMPAIGNS['c1']['bid']) / CAMPAIGNS['c1']['bid'] * 100)
        stop = collections.Counter(RUNS[way][n - 1]['stop'] for n in runs)
        print(f'  c1 c2 c3 = {bids[0]} {bids[1]} {bids[2]} (c1 {pct}%): {len(runs)} runs {runs}, stop {dict(stop)}')

# 출력:
# 1단계 뜻: 빌린 30개 가운데 처음 두 값만 5000ms 를 넘고, 나머지 28개는 1566ms 에서 2490ms 사이다.
# borrowed 30 calls: first two [5201, 5494] ms, the other 28 from 1566 to 2490 ms
# 2단계 뜻: 자율 루프의 run 시간은 중앙값 7236.5ms, 워크플로는 1712.5ms 이고, 두 방식의 가장 긴 run 은 처음 두 값을 받은 run 이다.
# loop run    seed  stop      llm  writes  refused  passed     ms  bids c1 c2 c3
#        1  339563  end_turn    4       1        1       0  13983  20000 50000 300
#        2  993908  repeat      4       1        0       1   6967  17000 50000 300
#        3  158176  repeat      4       1        0       1   6888  19000 50000 300
#        4  414002  end_turn    4       1        0       1   7722  17000 50000 300
#        5  682554  repeat      3       0        0       0   5442  20000 50000 300
#        6   50631  repeat      5       2        2       0  10068  20000 50000 300
#        7   75954  end_turn    4       1        0       1   7506  19000 50000 300
#        8  861168  repeat      5       2        1       1  15857  17000 50000 300
#        9  561913  repeat      3       0        0       0   4917  20000 50000 300
#       10   98702  repeat      3       0        0       0   5240  20000 50000 300
# refused writes: run 1 guardrail c1 14000 / run 6 guardrail c1 14000, guardrail c1 15000 / run 8 approve c2 45000
# repeated calls: run 2 get_stats c3 / run 3 get_stats c1 / run 5 get_stats c2 / run 6 get_stats c1 / run 8 get_stats c2 / run 9 get_stats c2 / run 10 get_stats c3
# workflow (stop, llm, writes, refused) in all runs: [('code path', 1, 1, 0)]
# workflow ms per run [5201, 5494, 1722, 1566, 1703, 1648, 1725, 1891, 1624, 1607]
# loop ms: min 4917, median 7236.5, max 15857, runs given the first two values [1, 8]
# workflow ms: min 1566, median 1712.5, max 5494, runs given the first two values [1, 2]
# 3단계 뜻: 최종 입찰가는 자율 루프가 세 가지, 워크플로가 한 가지다. 여행사와 카페는 모든 run 에서 그대로다.
# loop distinct final bid sets: 3
#   c1 c2 c3 = 20000 50000 300 (c1 0%): 5 runs [1, 5, 6, 9, 10], stop {'end_turn': 1, 'repeat': 4}
#   c1 c2 c3 = 17000 50000 300 (c1 -15%): 3 runs [2, 4, 8], stop {'repeat': 2, 'end_turn': 1}
#   c1 c2 c3 = 19000 50000 300 (c1 -5%): 2 runs [3, 7], stop {'repeat': 1, 'end_turn': 1}
# workflow distinct final bid sets: 1
#   c1 c2 c3 = 18000 50000 300 (c1 -10%): 10 runs [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], stop {'code path': 10}
```

빌린 30개 가운데 처음 두 값은 5,201ms 와 5,494ms 이고, 나머지 28개는 1,566ms 에서 2,490ms 사이입니다. 워크플로는 run 1, 2 가 그 두 값을 받았습니다. 자율 루프는 run 1 이 받았고, 30개를 다 쓴 뒤 첫 값부터 다시 쓰면서 run 8 이 또 받았습니다. 두 방식의 가장 긴 run 도 이 두 값을 받은 run 입니다. run 마다 보면 자율 루프의 run 9 는 4,917ms 로, 워크플로의 run 1, 2 보다 짧습니다. 그래서 두 방식은 중앙값으로 비교합니다. 중앙값은 10개 값을 크기 차례로 놓았을 때 5번째와 6번째 값의 평균입니다. 도구 시간을 0 으로 쳤기 때문에, run 의 시간은 LLM 호출 수와 그 호출이 받은 값으로만 정해집니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-workflow-loop-cards.html?embed=1&card=calls" height="480" loading="lazy" title="호출 수와 시간"></iframe>
<a class="demo-embed-open" href="demo-workflow-loop-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 3. 자율 루프의 최종 입찰가는 10번에 세 가지였습니다

**워크플로의 최종 입찰가는 10번 모두 같았고, 자율 루프는 세 가지였습니다. 자율 루프에서 러닝화 입찰가를 내린 run 은 5번이고, 나머지 5번은 쓰기 없이 멈추거나 거부된 쓰기 뒤에 멈췄습니다.**

최종 입찰가는 run 이 끝났을 때 서버에 남은 c1, c2, c3 의 입찰가 셋입니다. 워크플로는 10번 모두 러닝화 18,000원이었습니다. 자율 루프는 20,000원 그대로가 5번, 17,000원이 3번, 19,000원이 2번이었습니다. 여행사와 카페의 입찰가는 두 방식의 모든 run 에서 그대로였습니다.

러닝화를 그대로 둔 5번은 멈춘 자리가 둘로 나뉩니다. run 5, 9, 10 은 통계를 다 읽은 뒤 한 캠페인의 통계를 다시 읽으려 했고, 같은 호출 반복 검사가 그 단계에서 멈췄습니다. 세 run 은 쓰기를 한 번도 하지 않았습니다. run 1 과 6 은 30% 나 25% 를 내리자고 했다가 가드레일에 거부되었습니다. run 1 은 그 뒤에 끝냈고, run 6 은 c1 의 통계를 다시 읽으려다 멈췄습니다.

내린 5번도 폭이 달랐습니다. 17,000원은 15%, 19,000원은 5% 를 내린 값이고, 워크플로와 같은 18,000원으로 끝난 run 은 없었습니다. 자율 루프에서는 폭까지 모델이 고르기 때문입니다. 워크플로는 그 폭을 코드에 10% 로 적어 10번 모두 같은 값을 냈습니다.

막힌 쓰기는 서버에 가기 전이나 서버에서 멈췄습니다. 가드레일은 run 1 과 6 에서 쓰기 셋을 거부했습니다. run 8 은 여행사 c2 를 45,000원으로 내리려 했고, approve 에 막혀 그 호출은 서버에 가지 않았습니다. 통과한 쓰기는 run 마다 많아야 한 번이라, 이 10번의 흔들림은 미리 승인한 범위 안의 변경 한 번에서만 생겼습니다. 다만 25주째 편에서 본 것처럼 한 번의 상한은 쌓이는 변경을 막지 못합니다.

같은 호출 반복 검사가 멈춘 7번은 모두 이미 읽은 통계를 다시 읽으려던 호출이었고, 그 run 에는 마지막 요약 글이 없습니다. 결과를 글로 적은 run 은 end_turn 으로 끝난 run 1, 4, 7 뿐입니다. 운영 작업이라면 멈춘 까닭과 최종 입찰가를 코드가 따로 남겨야, 다음 날 아침에 무엇이 바뀌었는지 알 수 있습니다. 아래 표는 블록 2 의 마지막 출력을 러닝화 입찰가로 묶은 것입니다.

| 방식 | 러닝화 최종 입찰가 | run 수 | run 번호 | 멈춘 까닭 |
|---|---|---|---|---|
| 자율 루프 | 20,000원 (그대로) | 5 | 1, 5, 6, 9, 10 | end_turn 1, 같은 호출 반복 4 |
| 자율 루프 | 17,000원 (-15%) | 3 | 2, 4, 8 | end_turn 1, 같은 호출 반복 2 |
| 자율 루프 | 19,000원 (-5%) | 2 | 3, 7 | end_turn 1, 같은 호출 반복 1 |
| 워크플로 | 18,000원 (-10%) | 10 | 1~10 | 코드 경로의 끝 |

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-workflow-loop-cards.html?embed=1&card=variance" height="480" loading="lazy" title="10번의 결과"></iframe>
<a class="demo-embed-open" href="demo-workflow-loop-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 4. 비용, 지연, 예측 가능성으로 고릅니다

**이 일에서는 비용, 중앙값으로 본 지연, 예측 가능성 모두 워크플로가 앞섰습니다. 순서를 코드에 적을 수 있는 일이었고, 워크플로는 그 순서로 10번 모두 같은 입찰가를 냈습니다. 자율 루프는 필요한 단계 수를 미리 알기 어렵고, 정해진 길을 코드에 적을 수 없는 일에 둡니다.**

이 글에서 비용은 LLM 호출 수로 셉니다. 자율 루프는 run 마다 3~5번, 워크플로는 1번이었습니다. 25주째 편에서 본 것처럼 루프의 모델은 단계마다 대화 전체를 다시 받아서, 단계가 늘수록 보내는 글이 길어집니다. 빌린 기록은 대화가 길어지는 루프의 호출이 아니라서, 이 글은 토큰을 세지 않고 호출 수만 셉니다.

지연은 run 하나를 끝까지 기다린 시간입니다. 2절처럼 28주째 기록의 호출 시간 30개를 호출 차례대로 돌려 쓰고, 도구 시간은 0 으로 칩니다. 그렇게 센 중앙값은 자율 루프 7,236.5ms, 워크플로 1,712.5ms 였습니다. 이 차이는 차례대로 기다린 LLM 호출 수와, 그 호출들이 받은 값에서 나옵니다. run 마다 보면 자율 루프가 더 짧은 run 도 있어서, 비교는 중앙값으로 합니다. 자율 루프는 다음 할 일을 정하려고 단계마다 모델의 답을 기다리고, 워크플로는 코드가 순서를 알아서 끝에 한 번만 기다립니다.

예측 가능성은 같은 일을 다시 돌렸을 때 같은 결과가 나오는지입니다. 최종 입찰가는 워크플로가 한 가지, 자율 루프가 세 가지였습니다. 러닝화 입찰가를 내리는 일을 마친 run 은 워크플로 10번, 자율 루프 5번이었습니다. 자율 루프는 멈춘 까닭도 end_turn 3번, 같은 호출 반복 7번으로 run 마다 달랐습니다.

Anthropic 의 글은 가장 단순한 방법을 찾고, 필요할 때만 복잡도를 늘리라고 권합니다. 그 글은 워크플로와 에이전트를 모두 에이전트 시스템(agentic systems)이라 부릅니다. 에이전트 시스템은 흔히 지연과 비용을 내주고 더 나은 성과를 얻으니, 그 맞바꿈이 맞는 때를 따지라고 했습니다. 복잡도가 더 필요할 때 워크플로는 잘 정의된 일에 예측 가능성과 일관성을 줍니다. 유연성과 모델이 내리는 판단이 대규모로 필요하면 에이전트가 낫다고 했습니다.

같은 글은 에이전트를 필요한 단계 수를 예측하기 어렵거나 불가능하고, 정해진 길을 코드에 적을 수 없는 열린 문제에 쓸 수 있다고 했습니다. 그런 일에서 LLM 은 여러 차례 돌 수 있어서, 그 판단을 어느 정도 믿을 수 있어야 한다고 적었습니다. 대신 자율적인 만큼 비용이 크고 오류가 쌓일 수 있다고 했습니다. LangGraph 문서도 같은 구분을 씁니다. 워크플로는 미리 정한 코드 경로로 정해진 차례에 따라 돌고, 에이전트는 동적이며 자기 과정과 도구 사용을 스스로 정한다고 적었습니다. 에이전트는 계속 도는 피드백 루프로 움직이고, 문제와 해법을 예측할 수 없는 자리에 쓴다고 했습니다.

이 글의 밤 작업은 순서가 늘 목록, 통계, 변경이라 워크플로로 둡니다. 서연 씨의 대화 창처럼 다음에 무엇을 물을지 모르는 일은 자율 루프로 둡니다. 그때도 37주째 편처럼 쓰기는 승인과 가드레일을 지나게 합니다. 아래 표의 값은 모두 2, 3절의 블록이 찍은 것입니다.

| 기준 | 무엇으로 측정했나 | 자율 루프 | 워크플로 |
|---|---|---|---|
| 비용 | run 하나의 LLM 호출 수 (최소, 중앙값, 최대) | 3, 4, 5 | 1, 1, 1 |
| 지연 | run 하나의 시간의 중앙값 (빌린 호출 시간을 차례대로 돌려 씀, 도구 0ms) | 7,236.5ms | 1,712.5ms |
| 예측 가능성 | 10번의 최종 입찰가 가짓수 | 3 | 1 |
| 일을 마친 run | 러닝화 입찰가를 내린 run | 5 | 10 |
| 멈춘 까닭 | 10번의 멈춤 조건 | end_turn 3, 같은 호출 반복 7 | 코드 경로의 끝 10 |

## 5. 여러 에이전트를 이을 때는 작업 상태로 주고받습니다

**일이 여러 팀의 에이전트로 나뉘면 오케스트레이터가 일을 나눠 맡기고 결과를 받습니다. A2A 명세 1.0.0 은 그 사이의 메시지를 정합니다. 블록에서 타겟 에이전트와 카피 에이전트의 작업은 TASK_STATE_COMPLETED 로 끝났습니다. 건강으로 사람을 고르는 요청은 TASK_STATE_REJECTED 로 끝났습니다.**

1~4절의 일은 에이전트 하나가 도구를 부르는 일이었습니다. 새 캠페인을 여는 일은 다릅니다. 이 절에서는 보여 줄 사람을 타겟 팀의 에이전트가, 카피를 카피 팀의 에이전트가 만든다고 둡니다. 이 둘에게 일을 나눠 맡기고 결과를 모으는 쪽을 오케스트레이터라고 부릅니다. 오케스트레이터가 다른 에이전트와 주고받는 꼴을 정한 공개 명세가 A2A(Agent2Agent)이고, 이 글은 1.0.0 버전을 따릅니다. MCP 가 에이전트와 도구를 잇는 약속이라면, A2A 는 에이전트와 에이전트를 잇는 약속입니다.

A2A 의 에이전트는 자기를 소개하는 에이전트 카드(Agent Card)를 내놓습니다. 명세는 클라이언트가 카드를 찾는 디스커버리(discovery) 방법으로 셋을 적었습니다. 하나는 에이전트 도메인의 /.well-known/agent-card.json 을 읽는 것입니다. 나머지 둘은 에이전트를 모은 카탈로그에 묻기와, 카드의 주소나 내용을 미리 설정해 두기입니다. 명세의 필수 필드는 name, description, supportedInterfaces, version, capabilities 입니다. 기본 입출력 형식인 defaultInputModes, defaultOutputModes 와 스킬 목록 skills 도 꼭 넣습니다. 오케스트레이터는 카드의 스킬을 보고 일을 맡길 에이전트를 고릅니다.

일을 맡기는 메서드는 SendMessage 입니다. 메시지에는 messageId, role, parts 가 꼭 들고, 받은 에이전트는 작업(Task)을 만들어 돌려주거나 메시지로 바로 답합니다. 작업에는 id 와 상태(status)가 있고, 결과물은 artifacts 에 담깁니다. 작업의 지금 상태는 GetTask 로 다시 물을 수 있습니다. 상태 이름은 TASK_STATE_COMPLETED 처럼 TASK_STATE_ 로 시작하는 아홉 값이고, 이 글은 앞부분을 빼고 적기도 합니다. 그 가운데 COMPLETED, FAILED, CANCELED, REJECTED 넷은 종료 상태(terminal state)입니다. INPUT_REQUIRED 와 AUTH_REQUIRED 둘은 중단 상태(interrupted state)입니다. 작업이 입력이나 인증을 기다리다가, 받으면 이어 가는 상태입니다.

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 오케스트레이터가 A2A 꼴의 JSON-RPC 메시지로 타겟 에이전트와 카피 에이전트에게 일을 맡기고, 작업 상태를 받는다.

# 1단계: 에이전트 카드 둘을 둔다
# A2A 명세 1.0.0 의 AgentCard 필수 필드만 채운다. name, description, supportedInterfaces, version, capabilities,
# defaultInputModes, defaultOutputModes, skills 다. 스킬의 필수 필드는 id, name, description, tags 다.
# 명세의 디스커버리 방법 하나는 에이전트 도메인의 /.well-known/agent-card.json 에서 카드를 읽는 것이다.
# 두 에이전트는 이 블록 안의 가짜라 example 주소는 열리지 않는다.
def agent_card(name, description, url, skill):
    return {'name': name, 'description': description,
            'supportedInterfaces': [{'url': url, 'protocolBinding': 'JSONRPC', 'protocolVersion': '1.0'}],
            'version': '1.0.0', 'capabilities': {'streaming': False, 'pushNotifications': False},
            'defaultInputModes': ['text/plain', 'application/json'], 'defaultOutputModes': ['application/json'],
            'skills': [skill]}


TARGETING_CARD = agent_card('targeting-agent', 'Turns an audience request into a segment.', 'https://targeting.example/a2a',
                            {'id': 'audience-segment', 'name': 'Audience segment', 'tags': ['targeting'],
                             'description': 'Turns a natural-language audience request into a segment id.'})
COPY_CARD = agent_card('copy-agent', 'Writes ad copy from the advertiser asset.', 'https://copy.example/a2a',
                       {'id': 'grounded-copy', 'name': 'Grounded copy', 'tags': ['copy'],
                        'description': 'Writes ad copy that quotes the asset text.'})


# 2단계: 에이전트 쪽을 둔다
# 요청은 JSON-RPC 2.0 이고, 메서드 이름은 명세의 JSON-RPC 바인딩 그대로 SendMessage 와 GetTask 다.
# SendMessage 는 Task 를 만들어 result 의 task 에 담고, GetTask 는 Task 를 result 에 그대로 담는다.
# 이 가짜는 작업을 만들 때 TASK_STATE_SUBMITTED, TASK_STATE_WORKING 을 적고, 일을 마치면 종료 상태 하나를 적는다.
# 종료 상태는 COMPLETED, FAILED, CANCELED, REJECTED 넷이다. 명세가 SUBMITTED 와 WORKING 을 꼭 지나라고 정한 것은 아니다.
# 종료 상태의 작업에 보낸 메시지는 UnsupportedOperationError(-32004)로, 없는 작업 id 는 TaskNotFoundError(-32001)로 답한다.
# 서버가 보내는 메시지에는 contextId 를 꼭 넣고, 작업을 만들었으면 taskId 도 넣는다. 명세의 Message 설명이 그렇게 정한다.
# 오류의 data 는 명세의 예처럼 @type 이 google.rpc.ErrorInfo 인 객체이고, reason 은 오류 이름에서 Error 를 떼고 대문자와 밑줄로 쓴다.
TERMINAL = {'TASK_STATE_COMPLETED', 'TASK_STATE_FAILED', 'TASK_STATE_CANCELED', 'TASK_STATE_REJECTED'}


def a2a_error(req, code, message, reason, task_id):
    info = {'@type': 'type.googleapis.com/google.rpc.ErrorInfo', 'reason': reason, 'domain': 'a2a-protocol.org',
            'metadata': {'taskId': task_id}}
    return {'jsonrpc': '2.0', 'id': req['id'], 'error': {'code': code, 'message': message, 'data': [info]}}


class Agent:
    """A2A 서버 쪽의 가짜 에이전트. work 가 받은 part 를 보고 종료 상태와 결과를 정한다. slow 면 WORKING 으로 먼저 답한다."""

    def __init__(self, card, prefix, work, slow=False):
        self.card, self.prefix, self.work, self.slow = card, prefix, work, slow
        self.tasks, self.inbox, self.states = {}, {}, {}
        self.ids = itertools.count(1)

    def reply(self, req, result):
        """응답에는 작업의 그 순간 모습을 복사해 담는다. 뒤에 상태가 바뀌어도 보낸 응답은 그대로다."""
        return {'jsonrpc': '2.0', 'id': req['id'], 'result': json.loads(json.dumps(result))}

    def finish(self, task):
        state, out = self.work(self.inbox.pop(task['id']))
        task['status'] = {'state': state}
        if state == 'TASK_STATE_COMPLETED':
            task['artifacts'] = [{'artifactId': task['id'] + '-a1', 'parts': [{'data': out}]}]
        else:
            task['status']['message'] = {'messageId': task['id'] + '-m1', 'contextId': task['contextId'], 'taskId': task['id'],
                                         'role': 'ROLE_AGENT', 'parts': [{'text': out}]}
        self.states[task['id']].append(state)

    def handle(self, req):
        params = req.get('params', {})
        if req['method'] == 'SendMessage':
            msg = params['message']
            if 'taskId' in msg:
                task = self.tasks.get(msg['taskId'])
                if task is None:
                    return a2a_error(req, -32001, 'Task not found', 'TASK_NOT_FOUND', msg['taskId'])
                if task['status']['state'] in TERMINAL:
                    return a2a_error(req, -32004, 'Unsupported operation', 'UNSUPPORTED_OPERATION', task['id'])
                # 끝나지 않은 작업에 이어 보낸 메시지는 이 가짜가 읽지 않고, 작업을 그대로 돌려준다.
                return self.reply(req, {'task': task})
            task_id = f'{self.prefix}-{next(self.ids)}'
            # 클라이언트가 contextId 를 주지 않으면 서버가 정한다. 서버의 메시지에는 contextId 가 꼭 있어야 하기 때문이다.
            task = {'id': task_id, 'contextId': msg.get('contextId') or task_id + '-ctx', 'status': {'state': 'TASK_STATE_WORKING'}}
            self.tasks[task['id']], self.inbox[task['id']] = task, msg['parts'][0]
            self.states[task['id']] = ['TASK_STATE_SUBMITTED', 'TASK_STATE_WORKING']
            if not self.slow:
                self.finish(task)
            return self.reply(req, {'task': task})
        if req['method'] == 'GetTask':
            task = self.tasks.get(params['id'])
            if task is None:
                return a2a_error(req, -32001, 'Task not found', 'TASK_NOT_FOUND', params['id'])
            if task['id'] in self.inbox:
                self.finish(task)
            return self.reply(req, task)
        return {'jsonrpc': '2.0', 'id': req['id'], 'error': {'code': -32601, 'message': 'Method not found'}}


def targeting_work(part):
    """타겟 에이전트의 규칙. 건강으로 사람을 고르는 요청은 하지 않기로 정하고 REJECTED 로 끝낸다."""
    if '건강' in part['text']:
        return 'TASK_STATE_REJECTED', 'sensitive_attribute'
    return 'TASK_STATE_COMPLETED', {'segment': 317, 'members': 1600000}


def copy_work(part):
    """카피 에이전트의 규칙. 자산 id 와 세그먼트를 받아 카피 id 셋을 돌려준다."""
    asset = part['data']['asset_id']
    return 'TASK_STATE_COMPLETED', {'asset_id': asset, 'segment': part['data']['segment'],
                                    'copy_ids': [f'{asset}-{i}' for i in (1, 2, 3)]}


# 3단계: 오케스트레이터를 둔다
# 오케스트레이터는 A2A 의 클라이언트다. 카드의 스킬 id 로 일을 맡길 에이전트를 찾는다.
# 타겟 에이전트의 작업이 COMPLETED 일 때만 그 세그먼트를 카피 에이전트의 입력에 담는다.
# 카피 에이전트는 일이 오래 걸린다고 보고 WORKING 으로 먼저 답한다. 이 블록에서는 GetTask 를 받을 때 일을 끝낸다.
A2A_IDS, MESSAGE_IDS, A2A_WIRE = itertools.count(1), itertools.count(1), []
AGENTS = {agent.card['skills'][0]['id']: agent
          for agent in (Agent(TARGETING_CARD, 'tgt', targeting_work), Agent(COPY_CARD, 'cpy', copy_work, slow=True))}


def send(agent, method, params):
    req = {'jsonrpc': '2.0', 'id': next(A2A_IDS), 'method': method, 'params': params}
    resp = agent.handle(req)
    A2A_WIRE.append((req, resp))
    if method == 'SendMessage':
        msg = params['message']
        head = f"SendMessage{' taskId ' + msg['taskId'] if 'taskId' in msg else ''} {json.dumps(msg['parts'][0], ensure_ascii=False)}"
    else:
        head = f'{method} {json.dumps(params)}'
    print(f"-> {agent.card['name']} {head}")
    if 'error' in resp:
        print('<- error', json.dumps(resp['error']))
        return None
    task = resp['result'].get('task', resp['result'])
    note = ''
    if task.get('artifacts'):
        note = ' artifact ' + json.dumps(task['artifacts'][0]['parts'][0]['data'])
    elif 'message' in task['status']:
        note = ' message ' + task['status']['message']['parts'][0]['text']
    print(f"<- task {task['id']} {task['status']['state']}{note}")
    return task


def message(context, part, task_id=None):
    msg = {'messageId': f'msg-{next(MESSAGE_IDS)}', 'contextId': context, 'role': 'ROLE_USER', 'parts': [part]}
    if task_id:
        msg['taskId'] = task_id
    return {'message': msg}


def orchestrate(context, request, asset_id):
    tgt = send(AGENTS['audience-segment'], 'SendMessage', message(context, {'text': request}))
    if tgt['status']['state'] != 'TASK_STATE_COMPLETED':
        print(f"orchestrator: copy-agent not called, job ends with {tgt['status']['state']}")
        return tgt
    segment = tgt['artifacts'][0]['parts'][0]['data']['segment']
    cpy = send(AGENTS['grounded-copy'], 'SendMessage', message(context, {'data': {'asset_id': asset_id, 'segment': segment}}))
    while cpy['status']['state'] not in TERMINAL:
        cpy = send(AGENTS['grounded-copy'], 'GetTask', {'id': cpy['id']})
    print(f"orchestrator: draft ready, segment {segment}, copies {len(cpy['artifacts'][0]['parts'][0]['data']['copy_ids'])}")
    return cpy


# 4단계: 카드를 보고, 성공 길과 실패 길을 돌린다
# 성공 길은 「러닝화 살 사람」, 실패 길은 건강으로 사람을 고르는 요청이다. 두 길은 contextId 가 다르다.
for card in (TARGETING_CARD, COPY_CARD):
    face = card['supportedInterfaces'][0]
    print(f"card {card['name']}: skill {card['skills'][0]['id']}, {face['protocolBinding']} {face['protocolVersion']}, {face['url']}")
orchestrate('ctx-1', '러닝화 살 사람', 'x01')
rejected = orchestrate('ctx-2', '건강 상태로 골라 달라', 'x01')

# 5단계: 종료 상태의 작업에 메시지를 더 보낸다
# 같은 taskId 로 다른 요청을 보내면, 종료 상태의 작업이라 받지 않는다. 마지막 줄들은 이 가짜 에이전트가 적어 둔 상태의 차례다.
send(AGENTS['audience-segment'], 'SendMessage', message('ctx-2', {'text': '러닝화 살 사람'}, task_id=rejected['id']))
for agent in AGENTS.values():
    for task_id, states in agent.states.items():
        print(task_id, ' -> '.join(state.replace('TASK_STATE_', '') for state in states))

# 출력:
# 4단계 뜻: 성공 길의 두 작업은 COMPLETED 로 끝나고, 건강으로 고르는 요청은 REJECTED 로 끝나 카피 에이전트를 부르지 않는다.
# card targeting-agent: skill audience-segment, JSONRPC 1.0, https://targeting.example/a2a
# card copy-agent: skill grounded-copy, JSONRPC 1.0, https://copy.example/a2a
# -> targeting-agent SendMessage {"text": "러닝화 살 사람"}
# <- task tgt-1 TASK_STATE_COMPLETED artifact {"segment": 317, "members": 1600000}
# -> copy-agent SendMessage {"data": {"asset_id": "x01", "segment": 317}}
# <- task cpy-1 TASK_STATE_WORKING
# -> copy-agent GetTask {"id": "cpy-1"}
# <- task cpy-1 TASK_STATE_COMPLETED artifact {"asset_id": "x01", "segment": 317, "copy_ids": ["x01-1", "x01-2", "x01-3"]}
# orchestrator: draft ready, segment 317, copies 3
# -> targeting-agent SendMessage {"text": "건강 상태로 골라 달라"}
# <- task tgt-2 TASK_STATE_REJECTED message sensitive_attribute
# orchestrator: copy-agent not called, job ends with TASK_STATE_REJECTED
# 5단계 뜻: 종료 상태의 작업에 보낸 메시지는 -32004 UnsupportedOperationError 로 거절된다. 이 가짜는 세 작업 모두 SUBMITTED 와 WORKING 을 적었다.
# -> targeting-agent SendMessage taskId tgt-2 {"text": "러닝화 살 사람"}
# <- error {"code": -32004, "message": "Unsupported operation", "data": [{"@type": "type.googleapis.com/google.rpc.ErrorInfo", "reason": "UNSUPPORTED_OPERATION", "domain": "a2a-protocol.org", "metadata": {"taskId": "tgt-2"}}]}
# tgt-1 SUBMITTED -> WORKING -> COMPLETED
# tgt-2 SUBMITTED -> WORKING -> REJECTED
# cpy-1 SUBMITTED -> WORKING -> COMPLETED
```

성공 길에서 타겟 에이전트는 「러닝화 살 사람」을 세그먼트 317 로 바꿔 COMPLETED 로 답했습니다. 오케스트레이터는 그 세그먼트를 카피 에이전트의 입력에 담았습니다. 이 블록의 카피 에이전트는 일이 오래 걸린다고 보고 WORKING 으로 먼저 답하게 만들었습니다. GetTask 로 다시 묻자 COMPLETED 와 카피 id 셋을 돌려줬습니다.

실패 길에서 타겟 에이전트는 「건강 상태로 골라 달라」를 하지 않기로 하고 REJECTED 로 끝냈습니다. 명세는 REJECTED 를 에이전트가 그 작업을 하지 않기로 정한 상태라고 적었습니다. 처음 작업을 만들 때 정할 수도 있고, 진행할 수 없거나 진행하지 않겠다고 판단한 뒤에 정할 수도 있습니다.

종료 상태의 작업은 메시지를 더 받지 않습니다. 오케스트레이터가 같은 작업 id 로 다른 요청을 보내자, 타겟 에이전트는 JSON-RPC 오류 -32004 로 답했습니다. 명세가 종료 상태의 작업에 보낸 메시지에 쓰라고 적은 UnsupportedOperationError 입니다. 오류의 data 에는 @type 이 google.rpc.ErrorInfo 인 객체를 담았습니다. reason 은 명세가 gRPC 와 HTTP+JSON 바인딩에 정한 꼴을 따라, 오류 이름에서 Error 를 떼고 대문자와 밑줄로 썼습니다. JSON-RPC 바인딩은 ErrorInfo 같은 알려진 꼴을 쓰라고 권하고, 명세의 예도 같은 꼴의 TASK_NOT_FOUND 입니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-workflow-loop-cards.html?embed=1&card=a2a" height="480" loading="lazy" title="오케스트레이터와 상태"></iframe>
<a class="demo-embed-open" href="demo-workflow-loop-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 6. 두 무대는 맡길 수 있는 일이 다릅니다

**워크플로와 자율 루프를 고르는 기준은 두 무대가 같습니다. 다른 것은 작업이 닿는 데이터와, 일을 맡기는 에이전트가 같은 회사 안에 있느냐입니다.**

두 무대의 이름은 18주째 [자연어 오디언스](post.html?id=natural-language-audience) 편 8절에서 풀었습니다. 1~5절의 코드는 두 무대가 같고, 누가 그 코드를 돌리고 어디까지 닿느냐가 다릅니다.

### 담장 안에서는 밤 작업과 에이전트가 한 회사 안에 있습니다 [무대: 닫힌 생태계]

담장 안의 플랫폼은 캠페인 설정, 어제 통계, 입찰가를 바꾸는 API 를 모두 가집니다. 그래서 이 글의 밤 작업처럼 순서가 정해진 일은 한 회사의 코드로 워크플로를 둡니다. 광고주의 미리 승인도 같은 플랫폼의 광고주 화면에서 받습니다.

타겟 에이전트와 카피 에이전트가 다른 팀의 것이어도 같은 회사 안이라, 카드의 인증 필드를 회사 안의 방식으로 정합니다. 명세의 카드에는 인증 방식을 적는 securitySchemes 필드가 있습니다. 에이전트에 접속할 때의 요구는 securityRequirements 필드에 적습니다. 둘 다 필수 필드는 아닙니다.

### 열린 RTB 에서는 입찰 경로 밖의 일만 맡깁니다 [무대: 열린 RTB]

열린 RTB 의 DSP 는 입찰 요청에 짧은 시간 안에 답해야 해서, LLM 을 부르는 루프는 입찰 경로 밖에서 돕니다. 이 글의 입찰가 작업도 DSP 안의 캠페인 설정을 밤에 고치는 일이고, 입찰은 고친 값을 씁니다.

바깥 회사의 에이전트에게 일을 맡기면, 그 에이전트가 안에서 무엇을 하는지는 카드에 적힌 만큼만 압니다. A2A 명세도 독립되어 있고 속이 보이지 않는 경우가 많은 에이전트끼리의 프로토콜이라고 적었습니다. 그래서 오케스트레이터는 받은 작업의 상태와 결과물을 쓰기 전에 검사합니다. 5절의 오케스트레이터도 상태가 COMPLETED 가 아니면 다음 에이전트를 부르지 않았습니다.

## 한눈 정리

| 자리 | 무엇 | 이 글의 값 |
|---|---|---|
| 일 | 목표 ROAS 아래 캠페인의 입찰가를 가드레일 안에서 내리기 | 러닝화 하나가 목표 아래 |
| 미리 승인 | approve 가 읽는 rules | c1, 상한 20,000원 |
| 자율 루프 | 모델이 단계마다 다음 도구를 고름 | LLM 호출 3~5번, 중앙값 4 |
| 워크플로 | 코드가 순서를 정하고 LLM 은 요약 한 번 | LLM 호출 1번 |
| 시간 | 28주째 기록의 호출 시간을 빌림, 도구 시간 0 | 중앙값 7,236.5ms 와 1,712.5ms |
| 최종 입찰가 | 10번의 가짓수 | 자율 루프 3, 워크플로 1 |
| 멈춤 조건 | 자율 루프 10번 | end_turn 3, 같은 호출 반복 7, 단계 상한 0 |
| A2A | 에이전트 카드, SendMessage, GetTask, 작업 상태 | COMPLETED 둘, REJECTED 하나, -32004 |

## 헷갈리기 쉬운 점

- **워크플로에도 LLM 이 있습니다.** 이 글의 워크플로도 마지막에 LLM 을 한 번 불러 요약을 받았습니다. 두 방식의 차이는 LLM 이 있느냐가 아니라, 다음에 할 일을 누가 정하느냐입니다. 4절에서 본 것처럼 Anthropic 의 글도 둘을 모두 에이전트 시스템이라 부르고, 그 안에서 구조를 나눴습니다. 순서를 코드에 적어도 글을 읽고 쓰는 자리에는 LLM 을 둘 수 있습니다.
- **자율 루프의 흔들림은 모델 탓만이 아닙니다.** 이 10번에서 run 을 끝낸 것은 모두 확률표가 뽑은 end 와 reread 였습니다. 다만 reread 를 멈춤으로 바꾼 것은 코드의 같은 호출 반복 검사이고, 7번이 그렇게 멈췄으며 그 가운데 3번은 쓰기 전이었습니다. 가드레일도 run 1 과 6 의 쓰기 셋을 거부해 길을 바꿨습니다. 내릴 폭을 모델에게 맡긴 설계도 흔들림을 만들었고, 워크플로는 그 폭을 코드에 적어 같은 값을 냈습니다.
- **A2A 와 MCP 는 맡는 자리가 다릅니다.** A2A 명세의 부록은 MCP 를 AI 모델과 에이전트가 도구, API, 데이터 원천 같은 바깥 자원에 붙는 방법의 표준으로 적었습니다. A2A 는 독립된 에이전트끼리 대등하게 주고받고 협업하는 방법의 표준으로 적었습니다. 1~4절의 루프와 워크플로는 MCP 서버의 도구를 불렀고, 5절의 오케스트레이터는 A2A 메시지로 에이전트 둘에게 일을 맡겼습니다. 같은 부록은 A2A 의 서버 에이전트가 맡은 일을 하려고 안에서 MCP 로 도구를 부를 수 있다고 적었습니다.

## 더 깊이 보기

:::deep 두 방식의 코드 차이와 확률표
두 방식은 서버, approve, host_call 을 같이 씁니다. 다른 곳은 다음 할 일을 정하는 코드 한 곳입니다. 자율 루프의 run_loop 는 단계 상한까지 도는 반복문 안에서 loop_llm 을 부릅니다. 돌려받은 tool_use 블록은 host_call 에 넣습니다. 워크플로의 run_workflow 는 반복문 없이 목록, 통계, 입찰가 변경을 차례로 부르고 summary_llm 을 한 번 부릅니다. 멈춤 조건은 자율 루프에만 있습니다. 워크플로는 코드의 마지막 줄에서 끝나기 때문입니다.

자율 루프의 시드는 random.Random(7) 이 run 마다 하나씩 뽑습니다. randrange(10 ** 6) 으로 10개를 뽑고, run 은 그 시드로 만든 random.Random 으로 행동과 폭을 고릅니다. 워크플로는 난수를 쓰지 않습니다. 아래는 블록 1 의 7단계에 적은 PROBS 를 표로 옮긴 것입니다. 이 확률은 진짜 모델에서 측정한 값이 아니라 이 글이 정한 가상 값입니다.

| 지금 자리 (where) | 뜻 | read | reread | change | change_other | end |
|---|---|---|---|---|---|---|
| start | 캠페인 목록을 아직 읽지 않음 | 1.0 | 0 | 0 | 0 | 0 |
| listed | 목록만 읽고 통계는 아직 | 0.9 | 0 | 0 | 0 | 0.1 |
| read | 통계를 다 읽고 아직 쓰지 않음 | 0 | 0.15 | 0.6 | 0.1 | 0.15 |
| refused | 마지막 set_bid 가 거부됨 | 0 | 0.1 | 0.6 | 0.1 | 0.2 |
| changed | 마지막 set_bid 가 통과함 | 0 | 0.15 | 0.15 | 0 | 0.7 |

read 는 아직 읽지 않은 것을 읽습니다. 목록 전이면 get_campaigns 를, 목록 뒤면 아직 읽지 않은 캠페인의 get_stats 를 한 응답에 담습니다. reread 는 이미 읽은 캠페인 하나의 get_stats 를 다시 부르는 것이라, 같은 호출 반복 검사가 그 단계에서 멈춥니다. change 는 목표 아래 캠페인을, change_other 는 그 밖의 캠페인을 CUTS 의 폭만큼 내립니다. CUTS 는 5, 10, 15, 25, 30 이고 같은 확률로 뽑습니다. end 는 처음 입찰가와 다른 캠페인을 글로 적고 end_turn 으로 끝냅니다.

25주째 편의 더 깊이 보기에서 본 ReAct 는 LLM 이 추론하는 글과 행동을 번갈아 내게 했습니다. 이 글의 가짜 LLM 은 추론하는 글 없이 행동만 고릅니다. LangGraph 는 실행을 super-step 이라는 차례로 나눠 진행합니다. 나란히 도는 노드는 한 super-step 을 함께 쓰고, 차례로 도는 노드는 따로 씁니다. LangGraph 문서는 한 번의 실행이 도는 super-step 수의 상한을 recursion limit 이라 부릅니다. 상한을 넘으면 GraphRecursionError 를 낸다고 적었습니다. 이 글의 max_steps 처럼, 루프가 끝없이 돌지 않게 막는 장치입니다.
:::

:::deep A2A 작업 상태와 메시지 전문
명세의 작업 상태는 아홉 값이고, 5절에서 본 것처럼 넷은 종료 상태, 둘은 중단 상태입니다. 아래 표의 뜻은 명세의 설명을 옮긴 것입니다. 오른쪽 칸은 이 가짜 에이전트가 블록 3 의 작업마다 적어 둔 상태입니다.

| 상태 | 명세의 뜻 | 명세의 구분 | 이 가짜가 적은 작업 |
|---|---|---|---|
| TASK_STATE_UNSPECIFIED | 알 수 없거나 정해지지 않은 상태 | 적지 않음 | 없음 |
| TASK_STATE_SUBMITTED | 작업을 받았다고 확인함 | 적지 않음 | 세 작업 모두 처음 |
| TASK_STATE_WORKING | 에이전트가 처리하는 중 | 적지 않음 | 세 작업 모두, cpy-1 은 응답에 보임 |
| TASK_STATE_INPUT_REQUIRED | 사용자 입력이 더 있어야 진행함 | 중단 상태 | 없음 |
| TASK_STATE_AUTH_REQUIRED | 인증이 있어야 진행함 | 중단 상태 | 없음 |
| TASK_STATE_COMPLETED | 성공으로 끝남 | 종료 상태 | tgt-1, cpy-1 |
| TASK_STATE_FAILED | 오류로 끝남 | 종료 상태 | 없음 |
| TASK_STATE_CANCELED | 끝나기 전에 취소됨 | 종료 상태 | 없음 |
| TASK_STATE_REJECTED | 에이전트가 그 작업을 하지 않기로 정함 | 종료 상태 | tgt-2 |

응답에는 그 순간의 상태 하나만 담깁니다. 블록 3 의 마지막 세 줄은 이 가짜 에이전트가 적어 둔 상태의 차례입니다. 명세가 SUBMITTED 와 WORKING 을 꼭 지나라고 정한 것은 아니고, 이 가짜가 작업을 만들 때 그 둘을 적은 것입니다. 오케스트레이터가 받은 것은 그 가운데 응답을 보낸 순간의 상태입니다. 명세에는 작업을 취소하는 CancelTask 도 있습니다. 이미 완료, 실패, 취소된 작업처럼 취소할 수 없는 상태의 작업에는 TaskNotCancelableError(-32002)로 답합니다. 없는 작업 id 에는 TaskNotFoundError(-32001)로 답합니다. 블록이 찍은 오류는 -32004 하나입니다.

아래는 블록 3 이 타겟 에이전트에게 처음 보낸 SendMessage 요청과 그 응답입니다. 블록이 만든 사전을 JSON 으로 옮긴 것이고, 필드와 값은 블록의 것과 같습니다. HTTP 로 보낸다면 클라이언트는 요청마다 A2A-Version 헤더를 보내야 하고, 이 글이 따르는 버전이면 값은 1.0 입니다. 명세는 헤더 대신 요청 파라미터로 줘도 된다고 했고, 값이 비어 있으면 에이전트가 0.3 으로 읽는다고 적었습니다.

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "SendMessage",
  "params": {
    "message": {
      "messageId": "msg-1",
      "contextId": "ctx-1",
      "role": "ROLE_USER",
      "parts": [
        {
          "text": "러닝화 살 사람"
        }
      ]
    }
  }
}
```

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "task": {
      "id": "tgt-1",
      "contextId": "ctx-1",
      "status": {
        "state": "TASK_STATE_COMPLETED"
      },
      "artifacts": [
        {
          "artifactId": "tgt-1-a1",
          "parts": [
            {
              "data": {
                "segment": 317,
                "members": 1600000
              }
            }
          ]
        }
      ]
    }
  }
}
```

실패 길의 응답에는 TASK_STATE_REJECTED 와, 까닭을 적은 에이전트의 메시지가 듭니다. 명세는 서버가 보내는 메시지에 contextId 를 꼭 넣고, 작업을 만들었으면 taskId 도 넣으라고 적었습니다. 그래서 이 메시지에는 ctx-2 와 tgt-2 가 함께 들어갑니다.

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "result": {
    "task": {
      "id": "tgt-2",
      "contextId": "ctx-2",
      "status": {
        "state": "TASK_STATE_REJECTED",
        "message": {
          "messageId": "tgt-2-m1",
          "contextId": "ctx-2",
          "taskId": "tgt-2",
          "role": "ROLE_AGENT",
          "parts": [
            {
              "text": "sensitive_attribute"
            }
          ]
        }
      }
    }
  }
}
```

종료 상태의 작업 tgt-2 에 다시 보낸 메시지의 응답은 오류입니다. result 대신 error 가 있고, data 는 @type 이 든 객체의 목록입니다.

```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "error": {
    "code": -32004,
    "message": "Unsupported operation",
    "data": [
      {
        "@type": "type.googleapis.com/google.rpc.ErrorInfo",
        "reason": "UNSUPPORTED_OPERATION",
        "domain": "a2a-protocol.org",
        "metadata": {
          "taskId": "tgt-2"
        }
      }
    ]
  }
}
```
:::

- [Tool use 와 에이전트 루프](post.html?id=tool-use-agent-loop) — 멈춤 조건 셋과 가드레일을 처음 쓴 25주째 편입니다.
- [광고주 에이전트](post.html?id=advertiser-agent-mcp) — 이 글이 서버와 승인 코드를 옮겨 온 37주째 편입니다.
- [자연어 → 타겟 조건](post.html?id=nl-to-targeting-query) — 호출 시간을 빌려 온 판정 기록이 나오는 28주째 편입니다.
- [광고 카피 생성](post.html?id=grounded-ad-copy-generation) — 카피 에이전트가 맡는 일을 다룬 35주째 편입니다.
- [자연어 오디언스](post.html?id=natural-language-audience) — 두 무대의 이름을 푼 18주째 편입니다.
- [워크플로와 자율 루프 카드 네 장](demo-workflow-loop-cards.html) — 이 글의 카드 전체입니다. 카드를 누르면 헷갈리는 것 하나가 더 나옵니다.

## 참고문헌

- Anthropic (2024-12-19). *Building effective agents*. [anthropic.com](https://www.anthropic.com/engineering/building-effective-agents). 워크플로와 에이전트의 정의입니다. 가장 단순한 방법에서 시작하고, 복잡도는 필요할 때만 늘리라고 권합니다.
- A2A Project (The Linux Foundation). *Agent2Agent (A2A) Protocol Specification* (1.0.0 버전). [a2a-protocol.org](https://a2a-protocol.org/v1.0.0/specification/). 에이전트 카드의 필수 필드, SendMessage 와 GetTask, 작업 상태 아홉, 오류 코드입니다. 부록 B 는 MCP 와의 관계를 적었습니다.
- Shunyu Yao 외 (2022). *ReAct: Synergizing Reasoning and Acting in Language Models*. arXiv:2210.03629. [arxiv.org](https://arxiv.org/abs/2210.03629). 추론하는 글과 행동을 번갈아 내게 하는 방법입니다.
- LangChain. *Workflows and agents* (LangGraph 문서). [docs.langchain.com](https://docs.langchain.com/oss/python/langgraph/workflows-agents). 미리 정한 코드 경로의 워크플로와, 과정과 도구 사용을 스스로 정하는 에이전트를 나눕니다.
- LangChain. *Graph API* (LangGraph 문서). [docs.langchain.com](https://docs.langchain.com/oss/python/langgraph/graph-api). 한 번의 실행이 도는 super-step 수의 상한, recursion limit 입니다.
