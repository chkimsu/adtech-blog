모델 팀 37주째 월요일, 서연 씨가 광고주 화면의 대화 창에 한 줄을 적었습니다. 「러닝화 캠페인 ROAS 가 목표보다 낮습니다.」 화면 속 도우미는 캠페인 설정과 어제 숫자를 읽고, 입찰가를 10% 내리자고 답했습니다.

입찰가는 바로 바뀌지 않았습니다. 제안 아래에 승인 버튼이 떴고, 서연 씨가 누른 뒤에야 입찰가가 내려갔습니다. 옆에서 보던 지훈 씨는 두 가지가 궁금했습니다. 서연 씨가 더 크게 내려 달라고 하면 어떻게 될지, 다른 광고주의 캠페인도 읽히는지입니다.

**광고주가 대화로 캠페인을 바꾸게 하면, 무엇을 열어 두고 무엇을 막아야 할까요?**

모델이 부를 함수를 고르고 코드가 실행하는 프로그램은 25주째 [Tool use 와 에이전트 루프](post.html?id=tool-use-agent-loop) 편의 에이전트입니다. 이 글에서는 그 함수, 곧 도구를 MCP 서버가 내놓습니다. 입찰가를 바꾸는 도구 앞에는 광고주의 승인 단계와 서버의 가드레일을 둡니다. 입찰가 하나가 광고주의 하루 광고비를 바꾸므로, 어디서 막을지를 코드로 정해 둡니다.

> **한 줄 요약:** 서연 씨가 대화로 캠페인을 손보는 에이전트를, 한 프로세스 안의 MCP 서버와 가짜 LLM 으로 만들어 돌렸습니다. 서버는 MCP 명세 2026-07-28 버전을 따라 JSON-RPC 2.0 요청 셋에 답합니다. server/discover, tools/list, tools/call 입니다. 이 버전은 요청마다 _meta 에 프로토콜 버전과 클라이언트 기능을 적고, 빠지면 -32602 로 거절합니다. 도구 목록에는 읽기 도구 둘과 입찰가를 바꾸는 set_bid 가 있습니다. 쓰기를 끈 서버의 목록에는 읽기 도구 둘만 나옵니다. 서연 씨의 서버는 러닝화 캠페인 c1 만 보여 주고, c2 를 물으면 없는 캠페인과 같은 답을 돌려줍니다. 「러닝화 캠페인 ROAS 가 목표보다 낮습니다」는 읽기 둘, 10% 인하 제안, 승인, 적용을 거쳐 4단계에 끝났습니다. 입찰가는 20,000원에서 18,000원이 되었습니다. 막히는 길 셋은 막은 자리가 다릅니다. 승인 기록이 없는 쓰기는 호스트의 approve 가 서버에 보내지 않았습니다. 승인까지 받은 35% 인하는 서버의 가드레일이 isError 가 참인 결과로 돌려줬습니다. 쓰기를 끈 서버는 set_bid 를 모르는 도구로 보고 JSON-RPC 오류로 답했습니다. 세 길 모두 입찰가는 20,000원 그대로였습니다.

> **골라 읽는 법** — 절이 6개입니다. 절마다 표나 코드나 카드가 있어 그것만 보고 넘어가도 됩니다.
>
> - 대화로 열리는 일과 막히는 일, 막는 자리 → 1절
> - MCP 서버의 요청 셋과 도구 목록 → 2절
> - 읽기는 바로, 쓰기는 승인 뒤에 도는 한 바퀴 → 3절
> - 막히는 길 셋과 가드레일을 서버에 두는 까닭 → 4절
> - 도구로 내놓지 않는 것 → 5절
> - 담장 안과 열린 RTB 에서 서버가 닿는 데이터 → 6절

이 글의 캠페인 셋, 어제 통계, 목표 ROAS, 객단가는 설명을 위해 만든 가상 데이터입니다. 값은 25주째 편과 같고, 캠페인 셋은 [후보풀 여덟 질문](post.html?id=candidate-pool-questions) 편의 서연 씨 러닝화, 여행사, 카페입니다. 이 글에는 모델의 기록이 없습니다. 도구를 고르는 일은 규칙으로 움직이는 가짜 LLM 이 하고, 단계 수는 그 규칙에서 나옵니다. MCP 메시지의 필드 이름은 2026-07-28 버전 명세에서 열어 본 것만 씁니다. 모델 쪽 블록의 이름은 Anthropic 의 tool use 문서에서 확인했습니다. 카드의 파랑은 호스트와 클라이언트의 코드, 벽돌색은 모델이 고른 것, 먹색은 MCP 서버입니다. 회색은 막힌 호출, 점선 상자는 가상 값과 승인 기록입니다.

---

## 1. 대화로 캠페인을 설정하면 열리는 것과 막히는 것이 있습니다

**대화 창에서 서연 씨는 캠페인을 읽고, 입찰가를 바꾸자는 제안을 받을 수 있습니다. 입찰가를 실제로 바꾸는 일은 광고주의 승인과 서버의 검사를 지나야 열립니다. 쓰기를 막는 자리는 셋이고, 읽기도 서버가 보여 줄 캠페인만 열립니다.**

25주째 편에서는 도구를 고르는 모델과 도구를 실행하는 코드가 한 파일 안에 있었습니다. 이 글에서는 둘 사이에 MCP 서버가 들어갑니다. 서연 씨가 쓰는 도우미 앱이 호스트이고, 그 안에서 서버와 메시지를 주고받는 연결부가 클라이언트입니다. 캠페인 도구를 내놓는 쪽이 서버이고, 세 이름은 25주째 편 6절에서 명세의 정의로 풀었습니다.

서연 씨가 대화로 하려는 일은 둘로 나뉩니다. 캠페인 설정과 어제 통계를 읽는 일은 광고비를 바꾸지 않습니다. 그래서 처음 연결할 때 한 번 허락받고, 그 뒤로는 호출마다 묻지 않습니다. 입찰가를 바꾸는 일은 하루 광고비를 바꾸므로, 모델은 제안만 하고 광고주가 그 호출을 승인한 뒤에 실행합니다.

쓰기를 막는 자리는 셋입니다. 호스트는 승인 기록이 없는 쓰기를 서버에 보내지 않습니다. 서버는 승인을 받은 호출이라도 한 번에 20% 넘는 변경을 거부합니다. 운영자가 쓰기를 끈 서버는 쓰기 도구를 목록에 내놓지 않고, 그 도구를 부르면 모르는 도구로 답합니다.

읽기에도 막는 자리가 있습니다. 서연 씨의 서버는 서연 씨의 캠페인만 보여 주고, 여행사와 카페의 입찰가는 보여 주지 않습니다. 아래 표는 서연 씨가 대화로 하려는 일마다 열리는지와 그것을 정하는 자리입니다. 오른쪽 칸의 값은 2~4절의 블록이 찍은 결과입니다.

| 서연 씨가 대화로 하려는 일 | 열리나 | 정하는 자리 | 이 글에서 |
|---|---|---|---|
| 캠페인 목록과 어제 통계 읽기 | 바로 열림 | 호스트의 승인 검사(연결할 때 허락) | 읽기 둘이 묻지 않고 지나감 |
| 입찰가를 바꾸자는 제안 | 열림 | 모델 | 10% 인하, 18,000원 제안 |
| 승인한 변경의 적용 | 열림 | 광고주의 승인과 서버 | 20,000원 → 18,000원 |
| 승인 기록이 없는 변경 | 막힘 | 호스트의 승인 검사 | 서버에 보내지 않음 |
| 한 번에 20% 넘는 변경 | 막힘 | 서버의 가드레일 | 35% 인하를 결과로 거부 |
| 쓰기를 끈 서버에서 변경 | 막힘 | 서버의 도구 목록 | 모르는 도구라는 오류 |
| 다른 광고주의 캠페인 읽기 | 막힘 | 서버가 보여 줄 캠페인 목록 | 없는 캠페인과 같은 답 |

막는 일을 모델에게 맡기지 않는 까닭은 25주째 편의 가드레일과 같습니다. 모델이 고른 호출이 무엇이든, 코드의 비교는 매번 같은 답을 냅니다. 이 글에서 달라진 것은 비교를 두는 자리가 호스트와 서버 둘로 나뉜다는 점입니다. 2절은 서버가 무엇을 내놓는지부터 봅니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-advertiser-agent-cards.html?embed=1&card=mcp" height="480" loading="lazy" title="클라이언트와 서버"></iframe>
<a class="demo-embed-open" href="demo-advertiser-agent-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 2. MCP 서버는 도구 목록을 내놓습니다

**서버는 JSON-RPC 2.0 요청 셋에 답합니다. server/discover 에는 지원하는 버전과 기능을 돌려줍니다. tools/list 에는 도구 목록을, tools/call 에는 도구의 결과를 돌려줍니다. 쓰기를 끈 서버의 목록에는 읽기 도구 둘만 나오고, 서연 씨의 서버는 c1 만 보여 줍니다.**

JSON-RPC 는 25주째 편에서 함수 이름과 인자를 JSON 으로 적어 보내는 원격 호출 규약이라고 했습니다. 2.0 명세의 요청에는 jsonrpc, method 와 응답을 짝지을 id 가 있고, 인자는 params 에 담습니다. 응답은 요청과 같은 id 를 달고 result 나 error 가운데 하나만 담습니다. 요청의 id 를 읽지 못한 오류일 때만 응답의 id 가 null 입니다. error 에는 정수 code 와 짧은 설명인 message 가 들고, data 는 붙여도 되고 빼도 됩니다.

이 글은 MCP 명세 2026-07-28 버전을 따릅니다. 이 버전은 연결 상태를 두지 않아, 요청마다 params 의 `_meta` 에 프로토콜 버전과 클라이언트 기능을 적습니다. 2025-11-25 와 그 앞의 버전은 연결을 열 때 initialize 요청으로 버전과 기능을 한 번 주고받았습니다. 지금 버전의 서버는 server/discover 를 꼭 구현해야 하지만, 클라이언트는 그것을 부르지 않고 바로 다른 요청을 보내도 됩니다.

결과 쪽에도 꼭 넣을 필드가 있습니다. 모든 결과에는 결과의 종류를 적는 resultType 이 들어갑니다. server/discover 와 tools/list 의 결과에는 캐시 힌트 ttlMs 와 cacheScope 도 들어갑니다. ttlMs 0 은 받자마자 낡은 결과로 보라는 뜻이고, private 은 같은 인증 범위 안에서만 캐시하라는 뜻입니다. 이 서버는 쓰기를 끄면 목록이 바로 달라져야 해서 ttlMs 를 0 으로 둡니다.

도구 정의는 name, description, inputSchema 에 annotations 를 더한 꼴입니다. inputSchema 는 25주째 편의 input_schema 처럼 입력 꼴을 JSON Schema 로 적는 필드이고, 이름의 표기가 다릅니다. 입력이 없는 get_campaigns 는 명세가 권하는 대로 빈 객체만 받는 꼴로 적었습니다. annotations 는 도구가 하는 일의 힌트입니다. 명세는 이 값이 도구를 그대로 설명한다는 보장이 없다고 적었습니다. 믿을 수 있는 서버에서 온 것이 아니면 클라이언트가 믿지 말라고도 적었습니다.

```python
# 하는 일: 한 프로세스 안에 MCP 서버를 두고, JSON-RPC 2.0 요청 셋(server/discover, tools/list, tools/call)에 답하게 한다.
import itertools
import json

# 1단계: 가상 캠페인 셋과 어제 통계를 둔다
# 25주째 Tool use 편과 같은 가상 데이터다. 러닝화와 여행사는 구매 1건(cpa)에, 카페는 클릭 1번(cpc)에 입찰한다.
# 목표 ROAS 는 러닝화 400%, 여행사 300% 이고 카페에는 없다. aov 는 구매 1건의 매출, 곧 객단가다.
# pctr, pcvr, daily_budget 은 캠페인 셋의 값을 그대로 둔 것이고, 이 글의 도구는 쓰지 않는다.
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
# ttlMs 0 은 받자마자 낡은 것으로 보라는 뜻이고, private 은 같은 인증 범위 안에서만 캐시하라는 뜻이다.
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
        return [t for t in TOOLS if self.allow_write or t['annotations']['readOnlyHint']]

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


# 5단계: server/discover 를 보낸다
# 서연 씨의 서버는 c1 만 보여 주고 쓰기를 켰다. 이 요청은 서버가 지원하는 버전과 기능을 묻는다.
seoyeon = AdServer(['c1'], allow_write=True)
show_call(*rpc(seoyeon, 'server/discover'))

# 6단계: 쓰기를 켠 서버와 끈 서버의 tools/list 를 비교한다
# 도구마다 이름과 annotations 만 찍는다.
no_write = AdServer(['c1'], allow_write=False)
for server in (seoyeon, no_write):
    req, resp = rpc(server, 'tools/list')
    print('->', json.dumps(brief(req)))
    result = resp['result']
    print('<- tools', len(result['tools']), 'ttlMs', result['ttlMs'], 'cacheScope', result['cacheScope'])
    for t in result['tools']:
        print('  ', t['name'], json.dumps(t['annotations']))

# 7단계: tools/call 로 읽기 도구를 부른다
# c2 는 서연 씨의 서버가 보여 주지 않는 캠페인이고, c9 는 어디에도 없는 캠페인이다.
show_call(*rpc(seoyeon, 'tools/call', {'name': 'get_campaigns', 'arguments': {}}))
for cid in ('c2', 'c9'):
    show_call(*rpc(seoyeon, 'tools/call', {'name': 'get_stats', 'arguments': {'campaign_id': cid}}))

# 8단계: _meta 없이 요청을 보낸다
bare = {'jsonrpc': '2.0', 'id': next(REQUEST_IDS), 'method': 'tools/list', 'params': {}}
show_call(bare, seoyeon.handle(bare))

# 출력:
# 5단계 뜻: 서버는 지원하는 버전 2026-07-28 과 tools 기능을 돌려주고, 결과에 resultType 과 캐시 힌트를 단다.
# -> {"jsonrpc": "2.0", "id": 1, "method": "server/discover", "params": {"_meta": "..."}}
# <- {"jsonrpc": "2.0", "id": 1, "result": {"resultType": "complete", "supportedVersions": ["2026-07-28"], "capabilities": {"tools": {}}, "ttlMs": 0, "cacheScope": "private", "_meta": "..."}}
# 6단계 뜻: 쓰기를 켠 서버는 도구 셋을, 끈 서버는 readOnlyHint 가 참인 읽기 도구 둘만 내놓는다.
# -> {"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {"_meta": "..."}}
# <- tools 3 ttlMs 0 cacheScope private
#    get_campaigns {"readOnlyHint": true, "openWorldHint": false}
#    get_stats {"readOnlyHint": true, "openWorldHint": false}
#    set_bid {"readOnlyHint": false, "destructiveHint": true, "idempotentHint": true, "openWorldHint": false}
# -> {"jsonrpc": "2.0", "id": 3, "method": "tools/list", "params": {"_meta": "..."}}
# <- tools 2 ttlMs 0 cacheScope private
#    get_campaigns {"readOnlyHint": true, "openWorldHint": false}
#    get_stats {"readOnlyHint": true, "openWorldHint": false}
# 7단계 뜻: get_campaigns 는 c1 하나만 돌려준다. c2 의 통계는 어디에도 없는 c9 와 같은 꼴의 unknown_campaign 이고, isError 가 참이다.
# -> {"jsonrpc": "2.0", "id": 4, "method": "tools/call", "params": {"name": "get_campaigns", "arguments": {}, "_meta": "..."}}
# <- {"jsonrpc": "2.0", "id": 4, "result": {"resultType": "complete", "content": [{"type": "text", "text": "..."}], "isError": false, "_meta": "..."}}
#    text {"campaigns": [{"id": "c1", "name": "running_shoes", "bid_type": "cpa", "bid": 20000, "target_roas": 400}]}
# -> {"jsonrpc": "2.0", "id": 5, "method": "tools/call", "params": {"name": "get_stats", "arguments": {"campaign_id": "c2"}, "_meta": "..."}}
# <- {"jsonrpc": "2.0", "id": 5, "result": {"resultType": "complete", "content": [{"type": "text", "text": "..."}], "isError": true, "_meta": "..."}}
#    text {"error": "unknown_campaign", "campaign_id": "c2"}
# -> {"jsonrpc": "2.0", "id": 6, "method": "tools/call", "params": {"name": "get_stats", "arguments": {"campaign_id": "c9"}, "_meta": "..."}}
# <- {"jsonrpc": "2.0", "id": 6, "result": {"resultType": "complete", "content": [{"type": "text", "text": "..."}], "isError": true, "_meta": "..."}}
#    text {"error": "unknown_campaign", "campaign_id": "c9"}
# 8단계 뜻: _meta 가 빠진 요청은 JSON-RPC 오류 -32602 로 거절되고, data 에 빠진 키 둘이 적힌다.
# -> {"jsonrpc": "2.0", "id": 7, "method": "tools/list", "params": {}}
# <- {"jsonrpc": "2.0", "id": 7, "error": {"code": -32602, "message": "Invalid params", "data": {"missing": ["io.modelcontextprotocol/protocolVersion", "io.modelcontextprotocol/clientCapabilities"]}}}
```

쓰기를 켠 서버는 도구 셋을, 끈 서버는 읽기 도구 둘을 내놓았습니다. 끈 서버는 readOnlyHint 가 거짓인 도구를 목록에 넣지 않았고, 자기 도구에 적은 힌트라 믿을 수 있습니다. 서연 씨의 서버에 get_campaigns 를 부르자 c1 하나만 돌아왔습니다. c2 의 통계를 물으면 isError 가 참인 결과에 unknown_campaign 이 들었습니다. 어디에도 없는 c9 를 물었을 때와 꼴이 같은 답입니다. 읽기 도구도 무엇을 보여 줄지를 서버가 정해야 다른 광고주의 입찰가가 모델에게 가지 않습니다. 마지막 요청은 `_meta` 가 빠져 -32602 로 거절되었고, data 에 빠진 키 둘이 적혔습니다.

| 힌트 | 명세의 뜻 | 기본값 | 이 글의 값 |
|---|---|---|---|
| readOnlyHint | 참이면 환경을 바꾸지 않음 | 거짓 | 읽기 도구 둘은 참, set_bid 는 거짓 |
| destructiveHint | 참이면 환경을 파괴적으로 바꿀 수 있음, 거짓이면 더하는 변경만 함. readOnlyHint 가 거짓일 때만 뜻이 있음 | 참 | set_bid 참 |
| idempotentHint | 참이면 같은 인자로 거듭 불러도 더 바뀌는 것이 없음. readOnlyHint 가 거짓일 때만 뜻이 있음 | 거짓 | set_bid 참 |
| openWorldHint | 참이면 바깥의 열린 대상과 주고받을 수 있음, 거짓이면 닫힌 범위만 다룸 | 참 | 셋 모두 거짓 |

set_bid 는 옛 입찰가를 새 값으로 덮어써서, 더하기만 하는 변경이 아니라 destructiveHint 를 참으로 둡니다. 같은 입찰가를 두 번 적으면 두 번째에는 바뀌는 것이 없어 idempotentHint 도 참입니다. 세 도구는 이 플랫폼의 캠페인만 다뤄 openWorldHint 가 거짓입니다. 다만 힌트는 서버가 스스로 적은 말이라, 승인 여부는 3절의 호스트가 따로 가진 데이터로 정합니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-advertiser-agent-cards.html?embed=1&card=tools" height="480" loading="lazy" title="읽기와 쓰기"></iframe>
<a class="demo-embed-open" href="demo-advertiser-agent-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 3. 읽기는 바로 하고, 쓰기는 승인 뒤에 합니다

**호스트는 모든 tool_use 블록을 approve 에 먼저 넣습니다. 읽기 도구 둘은 서연 씨가 연결할 때 허락해서 바로 지나갔습니다. set_bid 는 서연 씨가 그 호출을 승인한 뒤에야 서버로 갔고, 요청은 4단계 만에 입찰가 18,000원으로 끝났습니다.**

호스트는 tools/list 로 받은 도구를 모델에게 건네는 도구 정의 꼴로 옮깁니다. 이때 inputSchema 는 input_schema 로 이름을 바꿔 적습니다. 모델의 응답은 22주째 [구조화 출력](post.html?id=structured-output) 편의 꼴이라, 도구를 부르면 tool_use 블록에 id, name, input 이 듭니다. 아래 블록의 가짜 LLM 은 캠페인 목록, 캠페인마다 통계 순서로 읽습니다. 목표보다 낮은 캠페인이 있으면 요청에 적힌 퍼센트만큼, 적혀 있지 않으면 10% 내리자고 제안합니다. 진짜 모델은 이 자리에서 시스템 메시지와 대화를 읽고 스스로 고릅니다.

승인은 approve 함수와 그 함수가 읽는 사전 APPROVALS 입니다. tools 는 광고주가 처음 연결할 때 허락한 도구, call_ids 는 광고주가 화면에서 승인한 호출의 id 입니다. rules 는 범위를 정해 미리 승인하는 자리이고, 이 글에서는 비워 둡니다. 모델의 출력은 블록일 뿐이라 이 사전을 바꾸지 못합니다. 승인이 호출의 id 에 붙으므로, 이미 승인한 호출과 같은 내용이라도 id 가 다른 호출은 다시 묻습니다.

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 승인 함수와 가짜 LLM, 호스트의 루프를 두고, 서연 씨의 요청 하나를 읽기, 제안, 승인, 적용까지 돌린다.
import re

# 1단계: 승인을 데이터와 함수로 둔다
# 승인은 모델이 쓰는 글이 아니라 호스트의 코드가 보는 데이터다. 모델의 출력은 이 사전을 바꾸지 못한다.
# tools 는 광고주가 처음 연결할 때 허락한 도구다. 이 도구는 호출마다 묻지 않는다.
# call_ids 는 광고주가 화면에서 승인한 호출의 id 다. 승인은 호출 하나에만 붙는다.
# rules 는 미리 승인한 범위다. {'tool': 'set_bid', 'campaign_id': 'c1', 'max_new_bid': 20000} 은
# c1 의 입찰가를 20000원 이하로 바꾸는 호출을 승인한다. 이 글은 rules 를 비워 둔다.
APPROVALS = {'tools': {'get_campaigns', 'get_stats'}, 'call_ids': set(), 'rules': []}


def approve(call):
    """tool_use 블록 하나를 실행해도 되는지 본다. 허락한 도구, 승인한 호출 id, 미리 승인한 범위 가운데 하나면 참이다."""
    if call['name'] in APPROVALS['tools'] or call['id'] in APPROVALS['call_ids']:
        return True
    args = call['input']
    return any(rule['tool'] == call['name'] and rule['campaign_id'] == args.get('campaign_id')
               and isinstance(args.get('new_bid'), int) and args['new_bid'] <= rule['max_new_bid']
               for rule in APPROVALS['rules'])


# 2단계: 가짜 LLM 을 둔다
# 응답 꼴은 Tool use 편과 같다. stop_reason 과 content 블록 목록이고, 도구를 부를 때는 tool_use 블록(id, name, input)이 든다.
# 규칙은 캠페인 목록, 캠페인마다 통계, 목표보다 낮으면 입찰가를 내리는 제안, 끝 순서다.
# 내릴 폭은 요청에 적힌 퍼센트를 쓰고, 없으면 10% 다. 도구 목록에 set_bid 가 없으면 제안을 글로만 남긴다.
# tool_use 의 id 는 실행 전체에서 하나씩 늘린다. 승인이 id 에 붙으므로 같은 id 가 다시 나오면 안 된다.
SYSTEM = 'You help an advertiser manage campaigns through the tools. Bid changes need approval in the app.'
TOOL_USE_IDS = itertools.count(1)


def read_history(messages):
    """대화에서 도구 호출과 결과를 꺼낸다. 캠페인 목록, 캠페인마다 통계와 마지막 set_bid 결과를 남긴다."""
    calls, campaigns, stats, last = {}, None, {}, {}
    for m in messages[1:]:
        for block in m['content']:
            if block['type'] == 'tool_use':
                calls[block['id']] = block
            elif block['type'] == 'tool_result':
                call, body = calls[block['tool_use_id']], json.loads(block['content'])
                if call['name'] == 'get_campaigns' and not block['is_error']:
                    campaigns = {row['id']: row for row in body['campaigns']}
                elif call['name'] == 'get_stats' and not block['is_error']:
                    stats[body['campaign_id']] = body
                elif call['name'] == 'set_bid':
                    last[call['input']['campaign_id']] = (block['is_error'], body)
    return campaigns, stats, last


def fake_llm(system, messages, tools):
    """진짜 SDK 와 같은 꼴의 응답을 돌려준다. 다음 행동은 대화를 읽어 정해 둔 규칙으로 고른다."""
    # system 은 SDK 의 호출 꼴을 맞추려고 받는다. 규칙은 도구 이름과 대화만 본다.
    names = {t['name'] for t in tools}
    found = re.search(r'(\d+)%', messages[0]['content'])
    pct = int(found.group(1)) if found else 10
    campaigns, stats, last = read_history(messages)

    def use(name, args):
        return {'type': 'tool_use', 'id': f'toolu_{next(TOOL_USE_IDS):02d}', 'name': name, 'input': args}

    if campaigns is None:
        return {'stop_reason': 'tool_use', 'content': [use('get_campaigns', {})]}
    todo = [cid for cid in campaigns if cid not in stats]
    if todo:
        return {'stop_reason': 'tool_use', 'content': [use('get_stats', {'campaign_id': cid}) for cid in todo]}
    notes = []
    for cid, c in campaigns.items():
        target, roas = c['target_roas'], stats[cid]['roas']
        if target is None or roas >= target:
            continue
        new_bid = round(c['bid'] * (100 - pct) / 100)
        if cid in last:
            failed, body = last[cid]
            notes.append(f"Not applied: {body['error']}." if failed
                         else f"Done. {cid} bid {body['old_bid']} -> {body['new_bid']}.")
        elif 'set_bid' not in names:
            notes.append(f"No set_bid tool. Suggested: {cid} bid {c['bid']} -> {new_bid}.")
        else:
            text = {'type': 'text', 'text': f'{cid} ROAS {roas} is below target {target}. Proposing -{pct}%.'}
            return {'stop_reason': 'tool_use',
                    'content': [text, use('set_bid', {'campaign_id': cid, 'new_bid': new_bid})]}
    return {'stop_reason': 'end_turn', 'content': [{'type': 'text', 'text': ' '.join(notes) or 'Nothing to change.'}]}


# 3단계: 호스트의 루프를 둔다
# 도구 목록은 tools/list 로 받아, 모델에게 건네는 도구 정의 꼴(name, description, input_schema)로 옮긴다.
# tool_use 블록마다 approve 를 먼저 본다. 거짓이면 광고주에게 묻고(decide), 승인하면 그 id 를 call_ids 에 넣는다.
# 그래도 거짓이면 서버에 보내지 않고, is_error 가 참인 tool_result 를 모델에게 돌려준다.
# 참이면 tools/call 을 보내고, 결과의 isError 를 tool_result 의 is_error 로 옮긴다. JSON-RPC 오류도 is_error 로 옮긴다.
# 멈춤 조건은 Tool use 편과 같은 셋이다. end_turn, 단계 상한 max_steps, 같은 호출 반복(repeat)이다.
def run_agent(server, request, decide=None, max_steps=6, detect_repeat=True):
    _, listed = rpc(server, 'tools/list')
    tools = [{'name': t['name'], 'description': t['description'], 'input_schema': t['inputSchema']}
             for t in listed['result']['tools']]
    messages = [{'role': 'user', 'content': request}]
    run = {'trace': [f'request {request}', 'tools ' + ', '.join(t['name'] for t in tools)], 'wire': []}
    log, seen = run['trace'].append, set()

    def finish(stop, steps):
        log(f'stop={stop} steps={steps} messages={len(messages)}')
        return messages, dict(run, stop=stop, steps=steps)

    for step in range(1, max_steps + 1):
        response = fake_llm(SYSTEM, messages, tools)
        messages.append({'role': 'assistant', 'content': response['content']})
        log(f"step {step} stop_reason={response['stop_reason']}")
        results = []
        for block in response['content']:
            if block['type'] == 'text':
                log(f"  text {block['text']}")
                continue
            log(f"  tool_use {block['id']} {block['name']} {json.dumps(block['input'])}")
            key = block['name'] + json.dumps(block['input'], sort_keys=True)
            if detect_repeat and key in seen:
                # 여기서 멈추면 messages 끝의 assistant 메시지에 짝인 tool_result 가 없는 tool_use 가 남는다.
                return finish('repeat', step)
            seen.add(key)
            if not approve(block):
                if decide is None:
                    log(f"  approve {block['id']} -> False, no one to ask")
                elif decide(block):
                    APPROVALS['call_ids'].add(block['id'])
                    log(f"  approve {block['id']} -> False, asked the advertiser -> approved -> {approve(block)}")
                else:
                    log(f"  approve {block['id']} -> False, asked the advertiser -> declined")
            if not approve(block):
                body, is_error = {'error': 'approval_required', 'tool': block['name']}, True
                log('  not sent to the server')
            else:
                req, resp = rpc(server, 'tools/call', {'name': block['name'], 'arguments': block['input']})
                run['wire'].append((req, resp))
                if 'error' in resp:
                    body, is_error = {'error': 'protocol_error', **resp['error']}, True
                    log(f"  jsonrpc id={req['id']} tools/call {block['name']} -> error {resp['error']['code']}")
                else:
                    body, is_error = json.loads(resp['result']['content'][0]['text']), resp['result']['isError']
                    log(f"  jsonrpc id={req['id']} tools/call {block['name']} -> isError={json.dumps(is_error)}")
            results.append({'type': 'tool_result', 'tool_use_id': block['id'],
                            'content': json.dumps(body), 'is_error': is_error})
            log(f"  tool_result {block['id']}{' is_error' if is_error else ''} {json.dumps(body)}")
        if response['stop_reason'] == 'end_turn':
            return finish('end_turn', step)
        messages.append({'role': 'user', 'content': results})
    return finish('max_steps', max_steps)


def show(run, from_step=1):
    """trace 를 from_step 단계부터 찍는다. from_step 이 1 이면 요청과 도구 목록 줄부터 찍는다."""
    lines = run['trace']
    start = 0 if from_step == 1 else next(i for i, line in enumerate(lines) if line.startswith(f'step {from_step} '))
    print('\n'.join(lines[start:]))


def ask_seoyeon(call):
    """서연 씨가 화면에 뜬 호출의 이름과 입력을 보고 승인을 누른다."""
    return True


# 4단계: 서연 씨의 요청을 돌린다
# 서연 씨의 서버는 c1 만 보여 주고 쓰기를 켰다. 읽기 둘은 처음 연결할 때 허락해서 묻지 않고 지나간다.
server = AdServer(['c1'], allow_write=True)
messages, run = run_agent(server, '러닝화 캠페인 ROAS 가 목표보다 낮습니다.', decide=ask_seoyeon)
show(run)
print(f"c1 bid {server.bids['c1']}, approved call_ids {sorted(APPROVALS['call_ids'])}")

# 출력:
# 4단계 뜻: 읽기 둘은 묻지 않고 지나간다. set_bid 는 서연 씨가 승인한 뒤 서버로 가서, 4단계 만에 18000 이 된다.
# request 러닝화 캠페인 ROAS 가 목표보다 낮습니다.
# tools get_campaigns, get_stats, set_bid
# step 1 stop_reason=tool_use
#   tool_use toolu_01 get_campaigns {}
#   jsonrpc id=9 tools/call get_campaigns -> isError=false
#   tool_result toolu_01 {"campaigns": [{"id": "c1", "name": "running_shoes", "bid_type": "cpa", "bid": 20000, "target_roas": 400}]}
# step 2 stop_reason=tool_use
#   tool_use toolu_02 get_stats {"campaign_id": "c1"}
#   jsonrpc id=10 tools/call get_stats -> isError=false
#   tool_result toolu_02 {"campaign_id": "c1", "spend": 3000000, "revenue": 8400000, "roas": 280}
# step 3 stop_reason=tool_use
#   text c1 ROAS 280 is below target 400. Proposing -10%.
#   tool_use toolu_03 set_bid {"campaign_id": "c1", "new_bid": 18000}
#   approve toolu_03 -> False, asked the advertiser -> approved -> True
#   jsonrpc id=11 tools/call set_bid -> isError=false
#   tool_result toolu_03 {"campaign_id": "c1", "old_bid": 20000, "new_bid": 18000}
# step 4 stop_reason=end_turn
#   text Done. c1 bid 20000 -> 18000.
# stop=end_turn steps=4 messages=8
# c1 bid 18000, approved call_ids ['toolu_03']
```

루프의 1, 2단계에서 읽기는 approve 가 tools 에서 이름을 찾아 바로 참이 되었고, 그래서 승인 줄이 찍히지 않았습니다. 루프의 3단계에서 가짜 LLM 은 text 블록에 까닭을 적고, tool_use 블록에 set_bid 18,000원을 담았습니다. approve 가 거짓이라 호스트는 서연 씨에게 물었습니다. 승인을 받자 그 id 를 call_ids 에 넣고 tools/call 을 보냈습니다. 서버의 결과 isError 는 거짓이었고, 호스트는 그것을 tool_result 블록의 is_error 로 옮겼습니다.

메시지는 8개입니다. 과제 하나와 모델의 응답 넷, 도구 결과를 담은 user 메시지 셋으로, 25주째 편의 첫 과제와 같은 수입니다. 달라진 것은 메시지 밖의 일입니다. 호스트는 처음에 도구 목록을 한 번 받았고, 도구를 부를 때마다 tools/call 을 하나씩 보냈습니다. 셋째 응답 뒤에는 승인도 한 번 받았고, call_ids 에는 toolu_03 하나가 남았습니다.

MCP 명세의 도구 문서는 사람이 도구 호출을 거절할 수 있도록 늘 사람이 개입하는 자리를 두라고 권했습니다. 명세의 보안 원칙은 호스트가 도구를 부르기 전에 사용자의 분명한 동의를 받아야 한다고 적었습니다. 읽기 도구 둘은 연결할 때 받은 동의로 부르고, set_bid 는 호출마다 동의를 받습니다. OWASP Top 10 for LLM Applications 2025 도 같은 방법을 적었습니다. 그 목록의 LLM06:2025 Excessive Agency 는 영향이 큰 행동을 실행하기 전에 사람이 승인하게 하라고 적었습니다.

승인은 광고주가 이 변경을 원하는지를 확인할 뿐, 변경이 얼마나 큰지는 보지 않습니다. 서연 씨가 35% 를 원해서 승인하면 approve 는 그대로 참입니다. 그래서 크기를 보는 비교는 승인과 따로, 서버에 둡니다. 4절은 그 비교와 막히는 길 셋을 돌립니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-advertiser-agent-cards.html?embed=1&card=approval" height="480" loading="lazy" title="승인 단계"></iframe>
<a class="demo-embed-open" href="demo-advertiser-agent-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 4. 가드레일은 서버에 둡니다

**막히는 길 셋은 막은 자리가 다릅니다. 승인 기록이 없는 쓰기는 호스트의 approve 가, 승인을 받은 35% 인하는 서버의 가드레일이 막았습니다. 쓰기를 끈 서버의 set_bid 는 서버의 도구 목록이 막았고, 세 길 모두 입찰가는 20,000원 그대로였습니다.**

첫째 길의 요청에는 「승인은 이미 했습니다」가 적혀 있습니다. 그러나 approve 는 대화의 글을 읽지 않고 APPROVALS 만 봅니다. 이 호출은 3절에서 승인한 toolu_03 과 내용이 같지만, id 가 toolu_06 이라 승인 기록에 없습니다. 이 실행에는 물어볼 사람도 없어서 call_ids 에 그 id 가 들어가지 않았습니다. 호스트는 set_bid 를 서버에 보내지 않았습니다. 모델에게는 is_error 가 참인 tool_result 에 approval_required 를 담아 돌려줬습니다.

둘째 길에서 서연 씨는 35% 를 요청했고 화면에서 승인도 눌렀습니다. 호스트는 tools/call 을 보냈고, 서버는 바꿀 몫을 다시 계산해 -35% 가 상한 20% 를 넘는다고 보았습니다. 서버는 입찰가를 건드리지 않고, result 에 isError 를 참으로 두고 change_too_large 를 담아 돌려줬습니다. 거부가 예외가 아니라 결과라서, 모델은 그 글을 읽고 다음 답을 적을 수 있습니다.

셋째 길의 서버는 쓰기를 껐습니다. 모델이 받은 도구 목록에 set_bid 가 없어서, 가짜 LLM 은 제안을 글로만 남기고 루프의 3단계에서 끝냈습니다. 그래도 클라이언트가 set_bid 를 보내면 서버는 그것을 모르는 도구로 봅니다. 이번 답은 result 가 아니라 error 이고, code 는 -32602, message 는 Unknown tool: set_bid 였습니다.

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 막히는 길 셋을 돌려, 무엇이 어느 자리에서 막혔는지 찍는다.

# 1단계: 승인 없이 쓰기
# 요청 글에 「승인은 이미 했습니다」가 있어도 call_ids 에 그 호출의 id 가 없으면 approve 는 거짓이다.
# 물어볼 사람이 없는 실행(decide 없음)이라, 호스트는 set_bid 를 서버에 보내지 않는다.
server = AdServer(['c1'], allow_write=True)
_, run = run_agent(server, '러닝화 입찰가를 10% 내리고 싶습니다. 승인은 이미 했습니다.')
show(run, 3)
sent = [req['params']['name'] for req, _ in run['wire']]
print(f"refused by approval (host): set_bid sent to the server {sent.count('set_bid')} times, c1 bid {server.bids['c1']}")

# 2단계: 35% 변경
# 서연 씨가 35% 를 요청했고 화면에서 승인도 눌렀다. approve 는 참이라 호스트는 tools/call 을 보낸다.
# 서버의 가드레일은 승인과 상관없이 바꿀 몫을 다시 계산해, 20% 를 넘으면 isError 가 참인 결과로 돌려준다.
server = AdServer(['c1'], allow_write=True)
_, run = run_agent(server, '러닝화 입찰가를 35% 내리고 싶습니다.', decide=ask_seoyeon)
show(run, 3)
print('<-', json.dumps(brief(run['wire'][-1][1])))
print(f"refused by guardrail (server): result with isError true, c1 bid {server.bids['c1']}")

# 3단계: 쓰기를 끈 서버
# tools/list 에 set_bid 가 없어 모델은 그 도구를 고를 수 없다. 가짜 LLM 은 제안을 글로만 남기고 끝낸다.
# 그래도 set_bid 를 보내는 클라이언트가 있으면, 서버는 모르는 도구라 JSON-RPC 오류로 돌려준다.
server = AdServer(['c1'], allow_write=False)
_, run = run_agent(server, '러닝화 캠페인 ROAS 가 목표보다 낮습니다.', decide=ask_seoyeon)
print(run['trace'][1])
show(run, 3)
show_call(*rpc(server, 'tools/call', {'name': 'set_bid', 'arguments': {'campaign_id': 'c1', 'new_bid': 18000}}))
print(f"refused by write-disabled server: JSON-RPC error, c1 bid {server.bids['c1']}")

# 출력:
# 1단계 뜻: 승인 기록이 없어 set_bid 는 서버에 가지 않고, 모델은 is_error 가 참인 approval_required 를 받는다.
# step 3 stop_reason=tool_use
#   text c1 ROAS 280 is below target 400. Proposing -10%.
#   tool_use toolu_06 set_bid {"campaign_id": "c1", "new_bid": 18000}
#   approve toolu_06 -> False, no one to ask
#   not sent to the server
#   tool_result toolu_06 is_error {"error": "approval_required", "tool": "set_bid"}
# step 4 stop_reason=end_turn
#   text Not applied: approval_required.
# stop=end_turn steps=4 messages=8
# refused by approval (host): set_bid sent to the server 0 times, c1 bid 20000
# 2단계 뜻: 승인은 받았지만 서버의 가드레일이 -35% 를 거부하고, 거부는 isError 가 참인 result 로 돌아온다.
# step 3 stop_reason=tool_use
#   text c1 ROAS 280 is below target 400. Proposing -35%.
#   tool_use toolu_09 set_bid {"campaign_id": "c1", "new_bid": 13000}
#   approve toolu_09 -> False, asked the advertiser -> approved -> True
#   jsonrpc id=18 tools/call set_bid -> isError=true
#   tool_result toolu_09 is_error {"error": "change_too_large", "campaign_id": "c1", "bid": 20000, "asked_change_pct": -35, "max_change_pct": 20}
# step 4 stop_reason=end_turn
#   text Not applied: change_too_large.
# stop=end_turn steps=4 messages=8
# <- {"jsonrpc": "2.0", "id": 18, "result": {"resultType": "complete", "content": [{"type": "text", "text": "..."}], "isError": true, "_meta": "..."}}
# refused by guardrail (server): result with isError true, c1 bid 20000
# 3단계 뜻: 쓰기를 끈 서버에서 모델은 set_bid 를 받지 못해 글로만 제안하고, 직접 보낸 호출은 JSON-RPC 오류 -32602 다.
# tools get_campaigns, get_stats
# step 3 stop_reason=end_turn
#   text No set_bid tool. Suggested: c1 bid 20000 -> 18000.
# stop=end_turn steps=3 messages=6
# -> {"jsonrpc": "2.0", "id": 22, "method": "tools/call", "params": {"name": "set_bid", "arguments": {"campaign_id": "c1", "new_bid": 18000}, "_meta": "..."}}
# <- {"jsonrpc": "2.0", "id": 22, "error": {"code": -32602, "message": "Unknown tool: set_bid"}}
# refused by write-disabled server: JSON-RPC error, c1 bid 20000
```

둘째 길과 셋째 길의 답은 꼴이 다릅니다. MCP 명세는 도구의 오류를 두 가지로 나눕니다. 모르는 도구, 꼴이 틀린 요청, 서버 오류는 프로토콜 오류로 보고 JSON-RPC 의 error 로 돌려줍니다. API 실패, 범위를 벗어난 값 같은 입력 검사 실패, 업무 규칙의 실패는 도구 실행 오류입니다. 도구 실행 오류는 isError 가 참인 result 로 돌려줍니다. 명세는 도구 실행 오류를 모델에게 넘기라고 권하고, 프로토콜 오류는 넘겨도 되지만 모델이 고쳐 다시 부를 가능성이 낮다고 적었습니다.

| 막힌 길 | 막은 자리 | 서버가 받은 것 | 모델이 받은 것 |
|---|---|---|---|
| 승인 기록이 없는 쓰기 | 호스트의 approve | set_bid 0번 | tool_result is_error, approval_required |
| 승인한 35% 인하 | 서버의 가드레일 | tools/call 1번 | result 의 isError 참 → tool_result is_error, change_too_large |
| 쓰기를 끈 서버 | 서버의 도구 목록 | 목록에 set_bid 없음, 직접 보낸 tools/call 1번 | 모델은 set_bid 를 받지 못함, 직접 보낸 호출은 JSON-RPC error -32602 |

크기를 보는 비교를 서버에 두는 까닭은 서버가 모든 호출이 지나는 마지막 자리이기 때문입니다. 호스트는 하나가 아닐 수 있고, 다른 앱이나 사람이 짠 스크립트도 같은 서버를 부를 수 있습니다. 호스트의 승인은 그 호스트를 지난 호출에만 걸리지만, 서버의 비교는 누가 보낸 호출이든 매번 같습니다. OWASP 의 같은 항목도 행동이 허용되는지를 LLM 이 정하게 두지 말고, 도구가 닿는 시스템에서 권한을 검사하라고 적었습니다.

이 비교도 한 번의 변경만 봅니다. 25주째 편에서 본 것처럼 20% 인하를 거듭하면 입찰가는 계속 내려갈 수 있고, 하루 누적 한도는 이 글의 서버에도 없습니다. 누적 한도를 더한다면 그 검사도 같은 자리, 곧 서버에 둡니다. 서버가 아예 내놓지 않을 도구는 5절에서 봅니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-advertiser-agent-cards.html?embed=1&card=guard" height="480" loading="lazy" title="서버의 가드레일"></iframe>
<a class="demo-embed-open" href="demo-advertiser-agent-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 5. 도구로 내놓지 않는 것도 정합니다

**도구를 적게 내놓는 것도 막는 방법입니다. 서연 씨의 서버에는 다른 광고주의 캠페인, 회원 한 명 단위의 기록, 되돌리기 어려운 변경, 무엇이든 실행하는 도구를 두지 않습니다.**

OWASP 는 Excessive Agency 를 해로운 행동이 실행되게 하는 취약점이라고 적었습니다. LLM 의 출력이 예상하지 못했거나, 모호하거나, 조작되었을 때 그 출력대로 행동이 실행되는 것입니다. LLM 이 왜 잘못 움직였는지와 상관없이 생기고, 지어낸 답과 프롬프트 주입이 흔한 계기라고 적었습니다. 원인은 대개 지나친 기능, 지나친 권한, 지나친 자율 가운데 하나 이상입니다. 4절까지는 지나친 자율을 승인과 가드레일로 막았고, 이 절은 앞의 둘을 봅니다.

지나친 기능을 줄이는 방법은 필요한 도구만, 그 도구에도 필요한 기능만 두는 것입니다. 서연 씨의 서버에는 읽기 도구 둘과 입찰가를 바꾸는 도구 하나만 있습니다. 쿼리를 그대로 받아 실행하는 도구처럼 무엇이든 할 수 있는 도구는 두지 않습니다. OWASP 도 할 수 있으면 열린 기능의 도구를 피하고 좁은 도구를 쓰라고 적었습니다.

지나친 권한은 도구가 닿는 시스템에 필요보다 넓은 권한을 갖는 것이고, 서연 씨의 서버에서는 보여 주는 캠페인의 범위입니다. 다른 광고주의 입찰가와 목표 ROAS 는 그 회사의 영업 정보입니다. OWASP 의 LLM02:2025 Sensitive Information Disclosure 는 민감 정보에 회사의 기밀 정보를 넣었습니다. 접근은 최소 권한의 원칙에 따라 제한하라고 적었습니다. 그래서 서버를 만들 때 보여 줄 캠페인을 정하고, 그 밖의 캠페인은 없는 캠페인과 같은 답을 받게 했습니다.

회원 한 명 단위의 기록도 도구로 내놓지 않습니다. get_stats 는 캠페인 하나의 광고비, 매출, ROAS 만 돌려주고, 누가 클릭하고 샀는지는 돌려주지 않습니다. 예산, 결제 수단, 캠페인 삭제는 되돌리기 어렵고 돈이 커서 도구로 두지 않습니다. 이런 변경은 광고주가 화면에서 직접 합니다.

| 내놓지 않는 것 | 까닭 | 이 글이 대신 한 것 |
|---|---|---|
| 다른 광고주의 캠페인과 입찰가 | 그 회사의 영업 정보 | 서버를 만들 때 c1 만 보여 줌 |
| 회원 한 명 단위의 행동 기록 | 개인의 기록이 대화로 나감 | 캠페인 단위 합계만 get_stats 로 |
| 예산, 결제 수단, 캠페인 삭제 | 되돌리기 어렵고 돈이 큼 | 광고주가 화면에서 직접 |
| 쿼리를 그대로 실행하는 도구 | 무엇이든 읽고 바꿀 수 있음 | 좁은 도구 셋 |

## 6. 두 무대는 서버가 닿는 데이터가 다릅니다

**도구를 내놓고 승인과 가드레일을 두는 꼴은 두 무대가 같습니다. 다른 것은 서버가 닿는 데이터와, 서버가 광고주를 알아보는 방법입니다.**

두 무대의 이름은 18주째 [자연어 오디언스](post.html?id=natural-language-audience) 편 8절에서 풀었습니다. 1~5절의 서버와 호스트는 두 무대가 같고, 도구가 닿는 데이터의 범위가 다릅니다.

### 담장 안에서는 플랫폼이 서버와 승인 화면을 함께 둡니다 [무대: 닫힌 생태계]

담장 안의 플랫폼은 캠페인 설정, 어제 통계, 입찰가를 바꾸는 API 를 모두 가집니다. 그래서 MCP 서버 하나가 세 도구를 내놓을 수 있습니다. 광고주 화면 안의 도우미가 호스트가 되고, 승인 버튼도 같은 화면에 둡니다.

광고주는 로그인으로 알아봅니다. 명세는 도구 목록이 연결마다, 또는 같은 연결의 다른 요청 때문에 달라지면 안 된다고 적었습니다. 요청에 담긴 인증 정보에 따라서는 달라질 수 있다고 했습니다. 인증 정보는 연결 상태가 아니라 요청마다 들어오는 입력이기 때문입니다. 서버는 알맞은 접근 제어를 갖춰야 한다고도 적었습니다. 이 글은 서버를 만들 때 campaign_ids 로 범위를 정했고, 실제 서버는 요청의 인증 정보로 광고주를 알아봅니다.

### 열린 RTB 에서는 DSP 의 설정만 도구가 됩니다 [무대: 열린 RTB]

열린 RTB 에서 광고를 사는 쪽인 DSP 는 입찰 요청에 짧은 시간 안에 답해야 합니다. 그래서 25주째 편처럼 에이전트는 입찰 경로 밖에서 돌고, 입찰 전에 DSP 안의 캠페인 설정을 고칩니다. 도구가 닿는 곳은 DSP 의 캠페인과 통계이고, 거래소와 매체의 데이터는 도구로 부를 수 없습니다.

DSP 는 여러 광고주를 한 화면에서 다루는 대행사가 쓰기도 합니다. 그때 서버가 보여 줄 캠페인은 사람 한 명이 아니라 광고주 계정마다 나눕니다. 한 대행사 직원이 광고주 둘을 맡아도, 한쪽 광고주의 대화에서 다른 쪽의 입찰가가 보이지 않게 합니다. 아래 표는 가상 데이터가 아니라 두 무대의 설계 차이를 적은 것입니다.

| 무엇 | 담장 안 | 열린 RTB |
|---|---|---|
| 서버가 내놓는 도구 | 플랫폼의 캠페인, 통계, 입찰가 | DSP 의 캠페인, 통계, 입찰가 |
| 광고주를 알아보는 방법 | 플랫폼 로그인 | DSP 계정, 대행사는 광고주 계정마다 |
| 승인 화면 | 광고주 화면 안 | DSP 화면 안 |
| 도구로 부를 수 없는 것 | 회원 한 명 단위의 기록 | 거래소와 매체의 데이터 |

## 한눈 정리

| 자리 | 무엇 | 이 글의 값 |
|---|---|---|
| MCP 명세 버전 | 연결 상태 없이 요청마다 `_meta` | 2026-07-28 |
| server/discover | 지원 버전과 기능 | supportedVersions 2026-07-28, tools |
| tools/list | 도구 목록과 캐시 힌트 | 쓰기를 켜면 3개, 끄면 2개, ttlMs 0 |
| annotations | 도구가 하는 일의 힌트 | 읽기 둘은 readOnlyHint 참 |
| 보여 줄 캠페인 | 서버가 정하는 읽기 범위 | c1 만, c2 는 unknown_campaign |
| 승인 | approve 가 읽는 APPROVALS | 허락한 도구 둘, 승인한 호출 toolu_03 |
| 한 바퀴 | 읽기, 제안, 승인, 적용 | 4단계, 20,000원 → 18,000원 |
| 막힌 길 셋 | 승인, 가드레일, 쓰기를 끈 서버 | 서버에 안 감, isError 참, -32602 |

## 헷갈리기 쉬운 점

- **MCP 는 모델이 아니라 도구를 내놓는 약속입니다.** MCP 는 서버가 도구, 리소스, 프롬프트를 내놓는 꼴을 정한 프로토콜이고, 답을 쓰는 모델이 아닙니다. 이 글의 서버도 도구 목록과 도구의 결과를 JSON-RPC 메시지로 돌려줄 뿐입니다. 도구를 고르는 것은 호스트가 부르는 모델이고, 실행할지를 정하는 것은 호스트와 서버의 코드입니다. 모델이 규칙으로 도는 가짜여도 서버와 메시지는 그대로입니다.
- **승인은 프롬프트가 아니라 코드입니다.** 첫째 길의 요청에 「승인은 이미 했습니다」가 적혀 있어도 approve 는 거짓이었습니다. 승인은 광고주가 화면에서 누른 기록이 APPROVALS 에 들어간 것이고, 대화의 글은 그 사전을 바꾸지 못합니다. 그래서 모델이 무엇을 적든 승인 없는 쓰기는 서버에 가지 않습니다.
- **읽기 도구도 정보 노출 범위를 정해야 합니다.** 읽기는 광고비를 바꾸지 않지만, 읽은 것은 모델의 입력이 되어 대화에 남습니다. 서연 씨의 서버가 여행사의 입찰가를 돌려줬다면, 그 값이 서연 씨에게 쓰는 답에 들어갈 수 있었습니다. 그래서 서버는 c2 를 묻는 호출에 없는 캠페인과 같은 답을 돌려줬습니다.

## 더 깊이 보기

:::deep 메시지 전문, set_bid 한 번
3절의 블록에서 서연 씨가 승인한 set_bid 하나를 모델 쪽과 MCP 쪽으로 나눠 옮겼습니다. 블록이 만든 사전을 JSON 으로 옮긴 것이고, 필드와 값은 블록의 것과 같습니다. 먼저 모델의 셋째 응답과, 호스트가 돌려준 user 메시지입니다.

```json
{
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "c1 ROAS 280 is below target 400. Proposing -10%."
    },
    {
      "type": "tool_use",
      "id": "toolu_03",
      "name": "set_bid",
      "input": {
        "campaign_id": "c1",
        "new_bid": 18000
      }
    }
  ]
}
```

```json
{
  "role": "user",
  "content": [
    {
      "type": "tool_result",
      "tool_use_id": "toolu_03",
      "content": "{\"campaign_id\": \"c1\", \"old_bid\": 20000, \"new_bid\": 18000}",
      "is_error": false
    }
  ]
}
```

호스트가 그 사이에 서버로 보낸 tools/call 요청과 서버의 응답입니다. 블록의 출력에서 "..." 로 줄인 `_meta` 와 결과의 글이 여기서는 다 보입니다.

```json
{
  "jsonrpc": "2.0",
  "id": 11,
  "method": "tools/call",
  "params": {
    "name": "set_bid",
    "arguments": {
      "campaign_id": "c1",
      "new_bid": 18000
    },
    "_meta": {
      "io.modelcontextprotocol/protocolVersion": "2026-07-28",
      "io.modelcontextprotocol/clientCapabilities": {},
      "io.modelcontextprotocol/clientInfo": {
        "name": "advertiser-agent",
        "version": "1.0.0"
      }
    }
  }
}
```

```json
{
  "jsonrpc": "2.0",
  "id": 11,
  "result": {
    "resultType": "complete",
    "content": [
      {
        "type": "text",
        "text": "{\"campaign_id\": \"c1\", \"old_bid\": 20000, \"new_bid\": 18000}"
      }
    ],
    "isError": false,
    "_meta": {
      "io.modelcontextprotocol/serverInfo": {
        "name": "campaign-server",
        "version": "1.0.0"
      }
    }
  }
}
```

두 쪽을 잇는 것은 호스트의 코드입니다. tool_use 의 name 과 input 이 tools/call 의 name 과 arguments 가 됩니다. 결과의 isError 는 tool_result 의 is_error 가 됩니다. content 의 text 는 tool_result 의 content 가 됩니다. 두 id 는 서로 다른 값입니다. toolu_03 은 모델 쪽의 호출을, 11 은 JSON-RPC 요청을 가리킵니다.
:::

:::deep 요청의 _meta 와 오류 코드
지금 버전에서 `_meta` 의 필수 키는 둘입니다. 하나는 프로토콜 버전을 적는 io.modelcontextprotocol/protocolVersion 입니다. 다른 하나는 클라이언트 기능을 적는 io.modelcontextprotocol/clientCapabilities 입니다. 클라이언트 기능이 빈 객체이면 선택 기능을 하나도 지원하지 않는다는 뜻이고, 이 글의 클라이언트가 그렇습니다. 클라이언트 정보를 적는 io.modelcontextprotocol/clientInfo 는 넣기를 권하는 키입니다. 넣지 않도록 따로 정하지 않았다면 요청마다 넣으라는 것이고, 이 글의 요청에도 넣었습니다.

필수 키가 빠진 요청은 꼴이 틀린 요청이라, 서버는 -32602 로 거절해야 합니다. HTTP 라면 응답 상태도 400 Bad Request 여야 합니다. 서버가 지원하지 않는 버전을 적은 요청에는 -32022 로 답하고, 지원하는 버전 목록을 data 에 적습니다. 이 글의 서버도 그렇게 짰습니다. 서버의 이름과 버전은 결과의 `_meta` 에 io.modelcontextprotocol/serverInfo 로 적었습니다. 명세는 이 키도, 넣지 않도록 따로 정하지 않았다면 결과마다 넣기를 권합니다.

이 서버가 쓰는 오류 코드는 셋이고, 블록이 찍은 것은 -32602 하나입니다. -32602 는 JSON-RPC 2.0 명세의 Invalid params 입니다. MCP 명세는 모르는 도구와 필수 키가 빠진 요청에 이 코드를 씁니다. -32601 은 Method not found 로, 이 서버가 모르는 메서드를 받았을 때 돌려주게 짰습니다. -32022 는 MCP 명세가 정한 UnsupportedProtocolVersion 입니다. 막힌 쓰기 가운데 승인과 가드레일의 거부는 JSON-RPC 오류가 아닙니다. 승인 거부는 호스트가 만든 tool_result 이고, 가드레일 거부는 isError 가 참인 result 입니다.
:::

- [Tool use 와 에이전트 루프](post.html?id=tool-use-agent-loop) — 이 글의 도구 셋, 가드레일, 멈춤 조건 셋을 처음 쓴 25주째 편입니다.
- [구조화 출력](post.html?id=structured-output) — stop_reason 과 content 블록 꼴을 처음 쓴 22주째 편입니다.
- [자연어 오디언스](post.html?id=natural-language-audience) — 두 무대의 이름을 푼 18주째 편입니다.
- [후보풀 여덟 질문](post.html?id=candidate-pool-questions) — 이 글의 캠페인 셋의 값이 적힌 편입니다.
- [생성 문구 판정 체계](post.html?id=generated-copy-judging-system) — 바로 앞 36주째 편입니다.
- [광고주 에이전트 카드 네 장](demo-advertiser-agent-cards.html) — 이 글의 카드 전체입니다. 카드를 누르면 헷갈리는 것 하나가 더 나옵니다.

## 참고문헌

- Model Context Protocol. *Specification* (2026-07-28 버전). [modelcontextprotocol.io](https://modelcontextprotocol.io/specification/2026-07-28). 호스트, 클라이언트, 서버의 정의와 보안 원칙입니다. 호스트는 도구를 부르기 전에 사용자의 분명한 동의를 받아야 한다고 적었습니다.
- Model Context Protocol. *Versioning and Compatibility* (2026-07-28 버전). [modelcontextprotocol.io](https://modelcontextprotocol.io/specification/2026-07-28/basic/versioning). 요청마다 프로토콜 버전을 적는 방식과, 2025-11-25 와 그 앞의 initialize 방식입니다.
- Model Context Protocol. *Discovery* (2026-07-28 버전). [modelcontextprotocol.io](https://modelcontextprotocol.io/specification/2026-07-28/server/discover). server/discover 의 요청과 결과입니다. 서버는 꼭 구현하고, 클라이언트는 부르지 않아도 됩니다.
- Model Context Protocol. *Tools* (2026-07-28 버전). [modelcontextprotocol.io](https://modelcontextprotocol.io/specification/2026-07-28/server/tools). tools/list, tools/call, 프로토콜 오류와 도구 실행 오류의 구분입니다. 사람이 도구 호출을 거절할 수 있게 하라고 적었습니다.
- Model Context Protocol. *Schema Reference* (2026-07-28 버전). [modelcontextprotocol.io](https://modelcontextprotocol.io/specification/2026-07-28/schema). annotations 의 힌트 넷과 기본값, resultType 과 캐시 힌트 필드입니다.
- JSON-RPC Working Group. *JSON-RPC 2.0 Specification* (2010-03-26, 2013-01-04 갱신). [jsonrpc.org](https://www.jsonrpc.org/specification). 요청과 응답의 필드, result 와 error 가운데 하나만 담는 규칙, 미리 정한 오류 코드입니다.
- Anthropic. *Tool use with Claude*. [platform.claude.com](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview). 앱이 직접 실행하는 client tool 의 tool_use 와 tool_result 한 바퀴입니다.
- Anthropic. *Handle tool calls*. [platform.claude.com](https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls). tool_use 블록의 id, name, input 과 tool_result 의 is_error 입니다.
- Anthropic. *Stop reasons and fallback*. [platform.claude.com](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons). stop_reason 의 값 가운데 end_turn 과 tool_use 의 뜻입니다.
- OWASP. *OWASP Top 10 for LLM Applications 2025*. [genai.owasp.org](https://genai.owasp.org/llm-top-10/). 이 글은 두 항목을 인용했습니다. LLM06:2025 Excessive Agency 와 LLM02:2025 Sensitive Information Disclosure 입니다.
