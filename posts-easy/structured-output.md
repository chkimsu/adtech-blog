모델 팀 22주째 목요일, 지훈 씨는 아침에 돌린 코드의 기록을 열었습니다. 지난주에 만든 코드는 광고주가 적은 요청을 모델에 보내고 돌아온 답에서 판정과 조건을 꺼내 회원을 셉니다. 요청 12건 가운데 두 건에서 코드가 멈춰 있었습니다.

멈춘 두 건의 답을 열어 보니 맨 앞에 영어 문장 한 줄이 붙어 있었습니다. 「Here is the answer you asked for.」 그 뒤에 바라던 답이 있었고 맨 끝에도 인사가 한 줄 더 있었습니다. 멈추지 않은 열 건에도 이상한 답이 4건 섞여 있었습니다.

**모델이 돌려준 답을 코드는 어디까지 믿고, 어떻게 받아야 할까요?**

4건 가운데 2건은 이유 칸이 아예 없었고 1건은 판정 칸에 정해 둔 세 낱말이 아닌 낱말을 적었습니다. 코드는 이 4건에서 멈추지 않고 그대로 지나갔습니다. 선배는 멈춘 두 건보다 지나간 4건이 더 위험하다고 했습니다.

> **한 줄 요약:** 모델의 답을 코드가 받을 때는 이름과 값의 짝(필드)을 중괄호로 묶어 적는 JSON 으로 받습니다. 묻기 전에는 필드마다 이름과 값의 종류와 받을 값을 적은 약속(스키마)부터 정합니다. 언어 모델(LLM) 대신 규칙으로 답하는 가짜 LLM 에 요청 12건을 보내자, 받은 글 전체를 JSON 으로 읽는 코드는 10건만 읽었고 첫 { 부터 마지막 } 까지 잘라 읽는 코드는 12건을 다 읽었습니다. 그래도 스키마와 맞는지 보는 검증을 통과한 답은 8건이었습니다. 빠진 필드만 다시 물어 9건이 통과했으며 남은 3건은 사람이 보는 review 로 갔습니다. 돈을 내고 부르는 상용 API 에 스키마를 넘기면 꼴은 맞춰 주지만 값의 뜻이 맞는지는 그래도 코드가 따로 봅니다.

> **골라 읽는 법** — 절이 6개입니다. 절마다 있는 표나 코드나 카드만 보고 넘어가도 됩니다.
>
> - 자유 문장으로 받은 답과 답의 네 가지 꼴 → 1절
> - 필드 4개의 스키마와 enum(정해 둔 낱말만 받는 값) → 2절
> - 파싱 두 방법과 스키마 검증, 가짜 LLM → 3절
> - 빠진 필드만 다시 묻는 대화와 review → 4절
> - 상용 API 의 스키마 강제와 그래도 남는 검증 → 5절
> - 두 무대에서 review 로 간 답을 받는 사람 → 6절

이 글의 요청 12건과 가짜 LLM 의 답은 설명을 위해 규칙으로 만든 가상 데이터입니다. 앞의 세 편에는 모델이 실제로 돌려준 답의 기록이 있었지만 이 글에는 모델의 기록이 없습니다. 요청마다 답의 꼴을 미리 정해 두었고 블록이 센 건수도 그 규칙에서 나오므로, 이 글의 숫자는 진짜 모델이 얼마나 자주 꼴을 어기는지를 말하지 않습니다. 필드 4개의 이름과 enum 은 [자연어 오디언스](post.html?id=natural-language-audience) 편의 조건 JSON 그대로입니다. 카드의 파랑은 코드가 하는 일, 벽돌색은 모델의 답, 먹색은 필드 이름과 스키마, 회색은 review 로 가는 답입니다.

---

## 1. 자유 문장으로 받은 답과 네 가지 꼴

**모델이 돌려주는 답은 글자 한 덩이입니다. 코드는 정해 둔 자리에서만 값을 꺼내므로, 그 글자에서 값을 꺼내려면 값이 오는 자리(꼴)가 정해져 있어야 합니다. 이 글은 받은 답을 생긴 모양에 따라 네 가지 꼴로 나눕니다.**

지훈 씨의 코드는 JSON 앞뒤에 영어 문장이 붙은 답 2건에서 멈췄습니다. [LLM 호출 한 번](post.html?id=llm-first-call) 편에서 모델이 돌려준 응답도 답 자체는 message 필드 안 content 에 든 글자였습니다. 사람은 그 글자를 문장으로 읽고 뜻을 알지만 코드는 정해 둔 자리에서만 값을 꺼내므로, 답이 자유로운 문장이면 코드는 판정이 문장의 어디에 있는지부터 찾아야 합니다.

모델이 「이 요청은 러닝화 검색 1회 이상으로 옮길 수 있습니다」라고 답했다고 해 봅니다. 코드가 이 문장에서 판정을 꺼내려면 「옮길 수 있습니다」라는 말을 찾아야 하는데, 반대 뜻인 「옮길 수 없습니다」와는 한 글자만 다릅니다. 모델이 다음 답에서 같은 뜻을 「바꿀 수 있습니다」라고 쓰면 코드는 찾던 말이 없어 판정을 꺼내지 못합니다.

이런 문제를 피하려고 답을 JSON 으로 받습니다. JSON 은 이름과 값의 짝을 중괄호로 묶어 적는 꼴입니다. 이름 하나와 값 하나의 짝을 필드라고 부릅니다. 이름이 정해져 있으면 코드는 문장을 뒤지지 않고 그 이름의 값만 꺼내면 됩니다. 캠페인의 목표를 고르던 [LLM 호출 한 번](post.html?id=llm-first-call) 편은 답을 {"objective": "conversion"} 꼴로 받았습니다. [자연어 오디언스](post.html?id=natural-language-audience) 편은 판정, 조건, 옮기지 못한 부분, 이유를 필드 4개에 담은 JSON 한 줄로 받았습니다. 이 글도 그 필드 4개를 예로 삼습니다.

다만 모델에 JSON 으로만 답하라고 적어도 답이 늘 그 꼴로 오지는 않습니다. 아래 표에 이 글이 나눈 네 꼴을 적었습니다. 앞뒤에 설명 문장이 붙은 답은 글 전체로 보면 JSON 이 아니어서 글 전체를 JSON 으로 읽는 코드는 여기서 막힙니다. 필드가 빠진 답과 정해 둔 낱말 밖의 값을 쓴 답은 JSON 으로는 읽히지만 코드가 그 값을 그대로 쓸 수는 없습니다. 이처럼 정해 둔 낱말 가운데 하나로만 받는 값을 enum 이라고 부릅니다.

블록은 네 꼴을 영어 이름으로 부르고 본문도 그 이름을 그대로 씁니다. valid 는 정상 답이고 wrapped 는 JSON 앞뒤에 설명이 붙은 답입니다. missing 은 필드가 빠진 답이고 enum 은 정해 둔 낱말 밖의 값을 쓴 답입니다. 표의 마지막 칸은 3절과 4절에서 코드가 꼴마다 하는 일입니다.

| 꼴 | 답의 모습 | 글 전체를 JSON 으로 읽으면 | 코드가 할 일 |
|---|---|---|---|
| valid | 필드 넷이 다 있는 JSON 한 줄 | 읽힘 | 검증하고 그대로 씀 |
| wrapped | 앞에 영어 문장, 가운데 JSON, 끝에 인사 | 못 읽음 | 중괄호 사이만 잘라 읽음 |
| missing | reason_code 같은 필드가 없음 | 읽힘 | 빠진 필드만 다시 물음 |
| enum | verdict 에 full_support 같은 낱말 | 읽힘 | review 로 보냄 |

첫 카드에서는 wrapped 답 하나가 실제로 어떻게 생겼는지와 네 꼴의 건수를 보면 됩니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-structured-output-cards.html?embed=1&card=freeform" height="480" loading="lazy" title="자유 문장으로 받은 답과 네 가지 꼴"></iframe>
<a class="demo-embed-open" href="demo-structured-output-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 2. 묻기 전에 정하는 스키마와 enum

**모델에 묻기 전에 어떤 꼴로 받을지부터 적어 둡니다. 필드 4개의 이름과 자료형(값의 종류), 그리고 enum 으로 받을 낱말입니다. 모델에 할 일을 적어 보내는 시스템 메시지와 받은 답을 보는 검증 코드가 이 스키마 하나를 함께 봅니다.**

받을 꼴을 정해 두지 않으면 모델이 시킨 대로 답했는지 코드가 판단할 기준이 없습니다. 스키마는 필드마다 이름, 자료형, 받을 수 있는 값을 미리 적어 둔 약속입니다. 자료형은 글자, 숫자, 목록처럼 값의 종류를 말합니다. 블록의 `SCHEMA` 에서는 글자가 `str`, 목록이 `list` 입니다.

이 글의 스키마는 필드 4개입니다. 판정을 적는 verdict 와 이유를 적는 reason_code 는 글자이면서 enum 이라 정해 둔 낱말 가운데 하나만 받습니다. 조건을 담는 conditions 와 옮기지 못한 부분을 담는 unsupported_parts 는 목록이고 빈 목록이어도 됩니다. 4개 모두 빠지면 안 되는 필수 필드입니다.

verdict 의 enum 은 supported, partial, unsupported 3개로 차례대로 지원, 일부 지원, 불가라는 뜻입니다. reason_code 의 enum 은 none, sensitive_attribute, unknown_field, exposure_history_unavailable 4개입니다. none 은 옮기지 못한 부분이 없다는 뜻입니다. 나머지 3개는 옮기지 못한 까닭입니다. 이 글의 요청으로 보면 q03(「건강 상태로 고른 사람」)은 민감한 정보로 사람을 고르는 요청이라 sensitive_attribute, q05(「우리 광고 안 본 여행 글 독자」)는 광고 노출 기록이 있어야 하는 요청이라 exposure_history_unavailable, q12(「자동차를 새로 산 사람」)는 회원 정보에 없는 값이 필요한 요청이라 unknown_field 입니다. 네 낱말의 정의는 자연어 오디언스 편 2절에 있습니다.

같은 꼴을 두 곳이 쓰므로 스키마는 묻기 전에 적어 둡니다. 시스템 메시지는 할 일을 적어 요청마다 모델에 같이 보내는 글인데, 여기에 이 꼴로 답하라고 적습니다. 검증 코드는 같은 꼴을 기준으로 받은 답이 맞는지 확인합니다. 두 곳이 서로 다른 꼴을 보고 있으면 모델이 시킨 대로 답해도 코드는 틀린 답으로 봅니다.

enum 으로 받는 값이 있으면 코드는 그 낱말 하나만 보고 다음에 할 일을 고릅니다. verdict 가 supported 면 conditions 의 조건으로 회원을 세고 unsupported 면 세지 않습니다. 예를 들어 q01(「러닝화 살 사람」)의 맞는 답은 verdict 가 supported, conditions 가 「search_running_shoes 1회 이상」 조건 하나, unsupported_parts 가 빈 목록, reason_code 가 none 이라서 코드는 그 조건으로 회원을 셉니다. 그래서 enum 밖의 낱말이 오면 코드는 고를 다음 일이 없습니다. full_support 는 supported 와 뜻이 비슷해 보여도 코드에는 모르는 낱말입니다.

맨 위 필드 4개만 봐도 네 꼴을 다 나눌 수 있으므로, 이 글의 검증 블록은 조건 하나의 꼴인 field, op, value 까지는 보지 않습니다. 조건의 꼴까지 적은 스키마는 5절의 발췌와 더 깊이 보기에서 볼 수 있습니다.

| 필드 | 자료형 | 받는 값 | 없을 때 |
|---|---|---|---|
| verdict | 글자 | supported, partial, unsupported | 틀림 (missing) |
| conditions | 목록 | 조건 {field, op, value} 의 목록, 빈 목록도 됨 | 틀림 (missing) |
| unsupported_parts | 목록 | 영어 짧은 구의 목록, 빈 목록도 됨 | 틀림 (missing) |
| reason_code | 글자 | none, sensitive_attribute, unknown_field, exposure_history_unavailable | 틀림 (missing) |

둘째 카드에서는 필드 4개의 스키마가 시스템 메시지와 validate 두 곳으로 함께 가는 모습을 보면 됩니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-structured-output-cards.html?embed=1&card=schema" height="480" loading="lazy" title="필드 넷의 스키마와 enum"></iframe>
<a class="demo-embed-open" href="demo-structured-output-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 3. 파싱과 스키마 검증 세 단계

**받은 글 전체를 JSON 으로 읽으면 12건 가운데 10건이 읽히고 첫 { 부터 마지막 } 까지만 잘라 읽으면 12건이 다 읽힙니다. 그래도 필드와 값이 스키마와 맞는지 보는 검증은 8건만 통과합니다.**

지훈 씨의 코드는 읽지 못한 2건에서 멈췄지만 읽기는 했어도 스키마와 맞지 않는 4건은 알아채지 못하고 그대로 넘겼습니다. 받은 글에서 JSON 을 꺼내 읽는 일을 파싱이라고 부릅니다. 꺼낸 JSON 이 스키마와 맞는지 보는 일은 검증이라고 부릅니다. 이 절의 코드는 받은 답을 파싱한 뒤 검증까지 합니다.

아래 블록에서 답을 만드는 가짜 LLM 은 언어 모델이 아니라 규칙으로 답하는 함수입니다. LLM 은 글을 읽고 이어 쓰도록 학습한 큰 언어 모델입니다. SDK 는 API 를 부르는 일을 함수로 묶어 둔 라이브러리입니다. 가짜 LLM 의 응답은 진짜 SDK 가 돌려주는 응답과 같은 꼴이라서, 답을 멈춘 까닭인 stop_reason 과 내용 블록의 목록인 content 가 들어 있습니다. 진짜 모델은 이 자리에서 시스템 메시지와 대화를 읽고 스스로 답을 쓰지만 가짜 LLM 은 요청마다 미리 정해 둔 꼴로 답을 만듭니다.

검증 코드는 세 단계로 봅니다. 첫 단계는 파싱, 둘째는 필수 필드가 다 있는지, 셋째는 자료형과 enum 이 맞는지입니다. 파싱은 두 방법으로 해 봅니다. `parse_strict` 는 받은 글 전체를 JSON 으로 읽고 `parse_braces` 는 첫 { 부터 마지막 } 까지만 잘라 읽습니다. `validate` 는 나머지 두 단계를 한 번에 보면서 스키마에 없는 남는 필드도 틀린 자리로 적고 틀린 자리를 글자 목록으로 돌려줍니다. 돌려준 목록이 비어 있으면 통과입니다.

아래 블록은 가짜 LLM 에 요청 12건을 보내고 받은 글을 두 방법으로 파싱한 뒤 스키마로 검증해 단계마다 남은 건수를 찍습니다.

```python
# 하는 일: 가짜 LLM 이 요청 12건에 돌려준 글을 JSON 으로 읽고 스키마로 검증해, 단계마다 남은 건수를 센다.
import json

# 1단계: 스키마를 둔다
# 맨 위 필드 넷의 자료형과 enum 이다. 이름은 자연어 오디언스 편의 조건 JSON 과 같다.
# 조건 하나의 꼴(field, op, value)은 이 블록에서 보지 않고 더 깊이 보기에 적는다.
SCHEMA = {
    'verdict': {'type': str, 'enum': ['supported', 'partial', 'unsupported']},
    'conditions': {'type': list},
    'unsupported_parts': {'type': list},
    'reason_code': {'type': str, 'enum': ['none', 'sensitive_attribute', 'unknown_field', 'exposure_history_unavailable']},
}
SYSTEM = '광고주 요청 한 문장을 읽고 verdict, conditions, unsupported_parts, reason_code 네 필드의 JSON 한 줄로만 답한다.'

# 2단계: 요청 12건과 가짜 LLM 을 둔다
# 요청과 답은 설명을 위해 규칙으로 만든 값이다. ANSWERS 는 요청마다 맞는 답 하나다.
# SHAPE 는 첫 답의 꼴이다. 적지 않은 요청은 valid, 곧 정상 JSON 이다.
# wrapped 는 JSON 앞뒤에 설명 문장을 붙이고, missing 은 DROP 의 필드를 빼고, enum 은 BAD 의 값으로 바꾼다.
def c(field, op, value):
    return {'field': field, 'op': op, 'value': value}


REQUESTS = [
    ('q01', '러닝화 살 사람', ['supported', [c('search_running_shoes', '>=', 1)], [], 'none']),
    ('q02', '캠핑 글 읽은 30대', ['supported', [c('camping_posts', '>=', 1), c('age', '>=', 30), c('age', '<=', 39)], [], 'none']),
    ('q03', '건강 상태로 고른 사람', ['unsupported', [], ['health status'], 'sensitive_attribute']),
    ('q04', '부산 사는 카페 글 독자', ['supported', [c('region', '==', 'busan'), c('cafe_posts', '>=', 1)], [], 'none']),
    ('q05', '우리 광고 안 본 여행 글 독자', ['partial', [c('travel_posts', '>=', 1)], ['users who have not seen our ad'], 'exposure_history_unavailable']),
    ('q06', '운동 앱을 자주 켜는 사람', ['supported', [c('sports_app_days', '>=', 10)], [], 'none']),
    ('q07', '러닝 글 읽고 운동 용품 산 사람', ['supported', [c('running_posts', '>=', 1), c('sports_goods_buy', '>=', 1)], [], 'none']),
    ('q08', '캠핑 용품 검색한 20대', ['supported', [c('camping_search', '>=', 1), c('age', '>=', 20), c('age', '<=', 29)], [], 'none']),
    ('q09', '서울 사는 여행 글 독자', ['supported', [c('region', '==', 'seoul'), c('travel_posts', '>=', 1)], [], 'none']),
    ('q10', '대구 사는 캠핑 글 독자', ['supported', [c('region', '==', 'daegu'), c('camping_posts', '>=', 1)], [], 'none']),
    ('q11', '인천 사는 러닝화 검색자', ['supported', [c('region', '==', 'incheon'), c('search_running_shoes', '>=', 1)], [], 'none']),
    ('q12', '자동차를 새로 산 사람', ['unsupported', [], ['car purchase'], 'unknown_field']),
]
NAMES = list(SCHEMA)
ANSWERS = {qid: dict(zip(NAMES, values)) for qid, _, values in REQUESTS}
ID_OF = {'요청: ' + text: qid for qid, text, _ in REQUESTS}
SHAPE = {'q07': 'wrapped', 'q08': 'wrapped', 'q09': 'missing', 'q10': 'missing', 'q11': 'enum', 'q12': 'enum'}
DROP = {'q09': ['reason_code'], 'q10': ['unsupported_parts', 'reason_code']}
BAD = {'q11': ('verdict', 'full_support'), 'q12': ('reason_code', 'field_missing')}
REASK_BAD = {'q10': ('reason_code', 'other')}   # 다시 물어도 enum 밖 값을 쓰는 답 하나


def fake_llm(system, messages):
    """진짜 SDK 와 같은 꼴의 응답을 돌려준다. 다음 답은 대화를 읽어 정해 둔 규칙으로 고른다."""
    # system 은 SDK 의 호출 꼴을 맞추려고 받는다. 규칙은 쓰지 않는다.
    qid = ID_OF[messages[0]['content']]
    if len(messages) == 1:                                   # 첫 요청이면 SHAPE 의 꼴로 답한다
        obj = dict(ANSWERS[qid])
        shape = SHAPE.get(qid, 'valid')
        for name in DROP.get(qid, []):
            del obj[name]
        if qid in BAD:
            obj[BAD[qid][0]] = BAD[qid][1]
        text = json.dumps(obj)
        if shape == 'wrapped':
            text = 'Here is the answer you asked for.\n' + text + '\nLet me know if you need anything else.'
    else:                                                    # 다시 묻기면 마지막 메시지가 적은 필드만 답한다
        asked = messages[-1]['content'].split(': ', 1)[1].split(', ')
        obj = {name: ANSWERS[qid][name] for name in asked}
        if qid in REASK_BAD:
            obj[REASK_BAD[qid][0]] = REASK_BAD[qid][1]
        text = json.dumps(obj)
    return {'stop_reason': 'end_turn', 'content': [{'type': 'text', 'text': text}]}


def text_of(response):
    return ''.join(block['text'] for block in response['content'] if block['type'] == 'text')


# 3단계: 자유 문장에서 JSON 을 꺼내는 두 방법을 둔다
# strict 는 글 전체를 JSON 으로 읽는다. braces 는 첫 { 부터 마지막 } 까지만 잘라 읽는다.
def parse_strict(text):
    try:
        obj = json.loads(text)
    except ValueError:
        return None
    return obj if isinstance(obj, dict) else None


def parse_braces(text):
    start, end = text.find('{'), text.rfind('}')
    if start < 0 or end < start:
        return None
    return parse_strict(text[start:end + 1])


# 4단계: 스키마로 검증한다
# 틀린 자리를 글자 목록으로 돌려준다. 빈 목록이면 통과다. 순서는 빠진 필드, 자료형, enum, 남는 필드다.
def validate(obj, schema):
    errors = []
    for name, rule in schema.items():
        if name not in obj:
            errors.append(f'missing {name}')
        elif type(obj[name]) is not rule['type']:
            errors.append(f'type {name}')
        elif 'enum' in rule and obj[name] not in rule['enum']:
            errors.append(f'enum {name}={obj[name]}')
    errors += [f'extra {name}' for name in obj if name not in schema]
    return errors


# 5단계: 12건을 보내고 단계마다 남은 건수를 센다
first = {}
for qid, text, _ in REQUESTS:
    first[qid] = text_of(fake_llm(SYSTEM, [{'role': 'user', 'content': '요청: ' + text}]))
shapes = [SHAPE.get(qid, 'valid') for qid in first]
print('꼴별 건수: ' + ', '.join(f'{s} {shapes.count(s)}' for s in ('valid', 'wrapped', 'missing', 'enum')))
strict = {qid: parse_strict(t) for qid, t in first.items()}
print(f'글 전체를 JSON 으로: 읽힘 {sum(v is not None for v in strict.values())}건, '
      f'못 읽음 {", ".join(q for q, v in strict.items() if v is None)}')
parsed = {qid: parse_braces(t) for qid, t in first.items()}
print(f'첫 {{ 부터 마지막 }} 까지: 읽힘 {sum(v is not None for v in parsed.values())}건')
errs = {qid: validate(obj, SCHEMA) for qid, obj in parsed.items()}
print(f'스키마 검증 통과: {sum(not e for e in errs.values())}건')
for qid, e in errs.items():
    if e:
        print(f'  틀림 {qid} ({SHAPE.get(qid, "valid")}): {", ".join(e)}')
# 출력:
# 5단계 뜻: 글 전체로 읽으면 wrapped 2건이 막히고, 잘라 읽으면 12건이 읽힌다. 검증은 8건이 통과한다.
# 꼴별 건수: valid 6, wrapped 2, missing 2, enum 2
# 글 전체를 JSON 으로: 읽힘 10건, 못 읽음 q07, q08
# 첫 { 부터 마지막 } 까지: 읽힘 12건
# 스키마 검증 통과: 8건
#   틀림 q09 (missing): missing reason_code
#   틀림 q10 (missing): missing unsupported_parts, missing reason_code
#   틀림 q11 (enum): enum verdict=full_support
#   틀림 q12 (enum): enum reason_code=field_missing
```

찍힌 첫 줄은 규칙이 정한 꼴별 건수로 valid 6건, wrapped 2건, missing 2건, enum 2건입니다. 글 전체를 JSON 으로 읽는 `parse_strict` 는 12건 가운데 wrapped 2건을 빼고 10건을 읽었습니다. 못 읽은 답은 q07(「러닝 글 읽고 운동 용품 산 사람」)과 q08(「캠핑 용품 검색한 20대」)입니다. 두 답은 JSON 앞에 영어 문장 한 줄이, 뒤에도 인사 한 줄이 붙어 있어 글 전체로는 JSON 이 아니므로 `parse_strict` 가 None 을 돌려줍니다. 중괄호 사이만 자르는 `parse_braces` 로 읽자 앞뒤 문장이 떨어져 나가 두 답도 읽혀서 12건이 모두 파싱되었습니다.

파싱된 12건 가운데 검증을 통과한 답은 정상인 valid 6건에 잘라 읽은 wrapped 2건을 더한 8건입니다. 나머지 4건은 `validate` 가 틀린 자리를 적었습니다. q09(「서울 사는 여행 글 독자」)는 reason_code 가 없고 q10(「대구 사는 캠핑 글 독자」)은 unsupported_parts 와 reason_code 가 없습니다. q11(「인천 사는 러닝화 검색자」)은 verdict 에 enum 밖의 full_support 를 적었고 q12(「자동차를 새로 산 사람」)는 reason_code 에 enum 밖의 field_missing 을 적었습니다.

틀린 4건은 모두 JSON 으로는 멀쩡히 읽혔으므로, 파싱만 보는 코드는 이 4건을 멈추지 않고 다음 일로 넘깁니다. q09 처럼 reason_code 가 없는 답은 뒤에서 이유를 꺼내는 순간에야 코드가 멈춥니다. 도입에서 선배가 멈춘 2건보다 지나간 4건을 더 걱정한 까닭이 여기에 있습니다.

`parse_braces` 처럼 첫 { 부터 마지막 } 까지 자르는 방법도 늘 통하지는 않습니다. 앞뒤에 붙은 설명 문장에 중괄호가 들어 있으면 엉뚱한 자리부터 잘리는데, 이 글의 두 답은 설명에 중괄호가 없어서 읽혔을 뿐입니다. 그래서 잘라 읽어 파싱된 답도 다른 답과 똑같이 검증을 거칩니다.

셋째 카드에서는 받은 답 12건이 파싱의 두 방법과 검증을 지나며 10건, 12건, 8건으로 남는 모습과 틀린 4건을 보면 됩니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-structured-output-cards.html?embed=1&card=validate" height="480" loading="lazy" title="파싱과 검증 세 단계에서 남는 건수"></iframe>
<a class="demo-embed-open" href="demo-structured-output-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 4. 빠진 필드만 다시 묻기와 review

**필드가 빠지기만 한 2건은 빠진 필드 이름만 적어 모델에 다시 물었습니다. q09 는 합치자 통과했고 q10 은 다시 받은 값이 enum 밖이라 사람이 보는 review 로 갔습니다. 마지막에 통과한 답은 9건, review 는 3건입니다.**

검증에서 틀린 4건은 틀린 자리가 서로 다릅니다. q09 와 q10 은 필드가 빠졌고 q11 과 q12 는 enum 밖의 낱말을 적었으므로, 이 글의 코드는 틀린 자리의 종류를 보고 처리를 나눕니다. 코드가 다시 묻는 답은 `validate` 가 적은 틀린 자리가 모두 missing 인 답입니다. 빠진 필드는 모델이 아직 쓰지 않은 값이므로 그 필드의 이름만 적어 다시 묻습니다. 반대로 enum 밖의 값은 모델이 이미 다른 낱말을 고른 답입니다. 이 글의 코드는 그런 답에는 다시 묻지 않고 곧바로 review 로 보냅니다. review 는 코드가 다음 일에 쓰지 않고 담당자가 직접 보는 답의 목록입니다.

다시 묻는 대화에는 첫 요청, 모델의 첫 답, 빠진 필드 이름만 적은 한 줄까지 메시지 3개가 들어갑니다. 메시지마다 누가 쓴 글인지를 적는 역할(role) 칸이 있는데, 모델의 첫 답을 대화에 다시 넣을 때는 모델이 쓴 글이므로 역할을 assistant 로 적습니다. 답을 받으면 첫 답의 나머지 필드는 그대로 두고 다시 받은 필드만 합친 뒤 다시 검증합니다.

아래 블록은 앞 블록에 이어서 돌며 틀린 4건 가운데 다시 물을 답을 골라 빠진 필드만 다시 묻고 합쳐 검증한 뒤 마지막 건수와 review 목록을 찍습니다.

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 필드가 빠지기만 한 답에 빠진 필드만 다시 묻고, 합쳐 다시 검증한 뒤 그래도 틀리면 review 로 보낸다.

# 1단계: 다시 물을 답을 고른다
# 틀린 자리가 모두 missing 인 답만 다시 묻는다. enum 밖 값은 다시 묻지 않고 바로 review 로 간다.
def missing_of(errors):
    return [e.split(' ', 1)[1] for e in errors if e.startswith('missing ')]


failed = [qid for qid, e in errs.items() if e]
reask = [qid for qid in failed if len(missing_of(errs[qid])) == len(errs[qid])]
review = {qid: errs[qid] for qid in failed if qid not in reask}
print(f'검증에서 틀린 {len(failed)}건 중 다시 물을 답 {len(reask)}건: {", ".join(reask)}')

# 2단계: 빠진 필드만 다시 묻고 합친다
# 대화에 첫 요청과 첫 답을 두고, 마지막 메시지에 빠진 필드 이름만 적는다. 첫 답의 나머지 필드는 그대로 쓴다.
# 가짜 LLM 은 마지막 메시지에 적힌 필드만 규칙으로 채운다.
final = {qid: parsed[qid] for qid in parsed if not errs[qid]}
for qid in reask:
    names = missing_of(errs[qid])
    text = next(t for q, t, _ in REQUESTS if q == qid)
    messages = [{'role': 'user', 'content': '요청: ' + text},
                {'role': 'assistant', 'content': first[qid]},
                {'role': 'user', 'content': 'Return only these missing fields as one JSON object: ' + ', '.join(names)}]
    reply = text_of(fake_llm(SYSTEM, messages))
    part = parse_braces(reply) or {}
    merged = dict(parsed[qid])
    merged.update({name: part[name] for name in names if name in part})
    again = validate(merged, SCHEMA)
    print(f'  다시 묻기 {qid}: 받은 글 {reply}')
    print(f'  다시 묻기 {qid}: 다시 검증 {"통과" if not again else ", ".join(again)}')
    if again:
        review[qid] = again
    else:
        final[qid] = merged

# 3단계: 남은 건수와 review 를 찍는다
print(f'요청 수: 첫 요청 {len(REQUESTS)}건, 다시 묻기 {len(reask)}건')
print(f'최종 통과 {len(final)}건, review {len(review)}건')
for qid, e in review.items():
    print(f'  review {qid}: {", ".join(e)}')
# 출력:
# 1단계 뜻: 틀린 4건 중 빠진 필드만 틀린 2건을 다시 묻는다.
# 검증에서 틀린 4건 중 다시 물을 답 2건: q09, q10
# 2단계 뜻: q09 는 합치자 통과하고, q10 은 다시 받은 reason_code 가 enum 밖이다.
#   다시 묻기 q09: 받은 글 {"reason_code": "none"}
#   다시 묻기 q09: 다시 검증 통과
#   다시 묻기 q10: 받은 글 {"unsupported_parts": [], "reason_code": "other"}
#   다시 묻기 q10: 다시 검증 enum reason_code=other
# 3단계 뜻: 요청은 14건이 나갔고, 9건이 통과하고 3건이 review 로 간다.
# 요청 수: 첫 요청 12건, 다시 묻기 2건
# 최종 통과 9건, review 3건
#   review q11: enum verdict=full_support
#   review q12: enum reason_code=field_missing
#   review q10: enum reason_code=other
```

1단계가 찍은 줄은 틀린 4건 가운데 틀린 자리가 모두 missing 인 q09 와 q10 의 2건만 다시 묻는다는 뜻입니다. q11 과 q12 는 enum 밖 값이라 바로 review 로 갔습니다. q09 는 reason_code 하나만 물어 {"reason_code": "none"} 을 받았고 첫 답의 나머지 필드 3개와 합치자 검증을 통과했습니다. q10 은 빠진 두 필드를 물어 unsupported_parts 와 reason_code 를 받았지만 reason_code 가 other 였습니다. 규칙에 적어 둔 맞는 답은 none 인데 other 는 reason_code 의 enum 에 없는 낱말이라서, q10 은 다시 물어도 쓸 수 없었습니다.

3단계가 찍은 건수를 차례로 보면 첫 검증을 통과한 8건에 다시 묻기로 통과한 q09 를 더해 9건이 통과했습니다. 처음부터 enum 밖이던 q11 과 q12 에 다시 물어도 틀린 q10 을 더해 3건이 review 로 갔습니다. 모델에 보낸 요청은 첫 요청 12건에 다시 묻기 2건을 더한 14건입니다. 다시 묻기는 빠진 필드만 받으므로 답이 짧습니다. 틀린 답을 요청부터 전부 다시 보내는 재시도와는 다른데, 재시도는 맞게 온 필드까지 다시 받고 그 값이 처음과 달라질 수도 있습니다.

review 로 간 3건(q10, q11, q12)으로는 회원을 세지 않습니다. 대신 담당자가 요청 문장을 직접 읽고 판정을 정하거나 광고주에게 요청을 다시 적어 달라고 합니다. 회원을 세는 다음 일로 넘어가는 답은 검증을 통과한 9건뿐입니다.

| 요청 | 첫 답의 틀린 자리 | 다시 묻기 | 끝 |
|---|---|---|---|
| q09 | missing reason_code | reason_code 만 물음, none 을 받음 | 통과 |
| q10 | missing unsupported_parts, reason_code | 두 필드를 물음, reason_code 가 other | review |
| q11 | enum verdict=full_support | 묻지 않음 | review |
| q12 | enum reason_code=field_missing | 묻지 않음 | review |

넷째 카드에서는 q09 를 다시 묻는 메시지 3개의 차례와 마지막 통과 9건, review 3건을 보면 됩니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-structured-output-cards.html?embed=1&card=retry" height="480" loading="lazy" title="빠진 필드만 다시 묻는 대화와 review"></iframe>
<a class="demo-embed-open" href="demo-structured-output-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 5. 상용 API 의 스키마 강제와 남는 검증

**돈을 내고 부르는 상용 API 에는 JSON 스키마를 넘겨 답의 꼴을 강제하는 옵션이 있습니다. 이 옵션은 꼴을 맞춰 주지만 값의 뜻까지 맞춰 주지는 않습니다.**

3절과 4절의 코드는 답을 받은 뒤에 꼴을 확인하고 처리했습니다. 상용 API 는 모델이 답을 쓰는 단계에서 꼴을 맞추는 옵션을 주는데, 그 옵션을 켜면 받는 쪽 검증을 빼도 되는지 따져 봅니다. Anthropic 의 Claude API 에서는 이 기능의 이름이 [structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) 입니다. 문서는 요청의 output_config 안 format 에 스키마를 넘기는 예를 보이는데, format 의 type 은 json_schema 이고 schema 에 스키마를 적습니다. 넘기는 스키마는 JSON Schema 라는 공개 명세를 따라 적습니다. OpenAI 의 API 에도 같은 이름의 Structured Outputs 가 있습니다.

아래 발췌는 2절의 스키마를 JSON Schema 로 옮겨 Claude API 에 넘기고 받은 답을 그래도 `validate` 로 다시 보는 차례를 보이려고 실었습니다. 이 블로그에는 API 키가 없어 블록을 돌리지 않았고 찍힌 값도 없습니다. 발췌의 모델 이름 claude-opus-5-5 는 그 문서의 예시에 적힌 이름입니다.

```python
# (발췌 — 그대로 실행되지 않습니다.)
# 하는 일: Claude API 에 네 필드를 JSON Schema 로 넘겨 꼴을 강제하고, 받은 답을 그래도 validate 로 다시 본다.
import json
import anthropic

# 1단계: 네 필드를 JSON Schema 로 적는다
# 객체마다 additionalProperties 를 False 로 둔다. 문서는 객체에 False 만 받는다고 적었다.
# value 는 숫자이거나 지역 이름 글자라 anyOf 로 둘 다 받는다. 최솟값 같은 숫자 제약은 적지 않는다.
CONDITION = {
    'type': 'object',
    'properties': {
        'field': {'type': 'string'},
        'op': {'type': 'string', 'enum': ['>=', '<=', '==']},
        'value': {'anyOf': [{'type': 'number'}, {'type': 'string'}]},
    },
    'required': ['field', 'op', 'value'],
    'additionalProperties': False,
}
JSON_SCHEMA = {
    'type': 'object',
    'properties': {
        'verdict': {'type': 'string', 'enum': ['supported', 'partial', 'unsupported']},
        'conditions': {'type': 'array', 'items': CONDITION},
        'unsupported_parts': {'type': 'array', 'items': {'type': 'string'}},
        'reason_code': {'type': 'string',
                        'enum': ['none', 'sensitive_attribute', 'unknown_field', 'exposure_history_unavailable']},
    },
    'required': ['verdict', 'conditions', 'unsupported_parts', 'reason_code'],
    'additionalProperties': False,
}

# 2단계: output_config 의 format 에 스키마를 담아 보낸다
# SYSTEM 은 앞 블록의 시스템 메시지다. 모델 이름은 문서의 예시에 적힌 것이다.
# 이 블로그에는 API 키가 없어 이 블록은 돌리지 않는다.
client = anthropic.Anthropic()
response = client.messages.create(
    model='claude-opus-5-5',
    max_tokens=1024,
    system=SYSTEM,
    messages=[{'role': 'user', 'content': '요청: 러닝화 살 사람'}],
    output_config={'format': {'type': 'json_schema', 'schema': JSON_SCHEMA}},
)

# 3단계: stop_reason 을 먼저 보고, 꼴이 맞아도 validate 로 다시 본다
# 문서는 refusal 과 max_tokens 일 때 답이 스키마와 다를 수 있다고 적었다. 그 둘은 review 로 보낸다.
# 답의 JSON 은 type 이 text 인 내용 블록에 온다. 꼴이 맞는다고 값의 뜻까지 맞지는 않는다.
if response.stop_reason in ('refusal', 'max_tokens'):
    print('review', response.stop_reason)
else:
    text = next(block.text for block in response.content if block.type == 'text')
    print('errors', validate(json.loads(text), SCHEMA))
```

1단계는 2절의 필드 4개를 JSON Schema 로 다시 적습니다. 이 글의 `SCHEMA` 와 달리 조건 하나의 꼴(field, op, value)까지 적고 객체마다 additionalProperties 를 False 로 둡니다. additionalProperties 가 False 이면 스키마에 없는 필드를 받지 않는다는 뜻입니다. 블록의 주석대로 문서는 객체에 False 만 받는다고 적었습니다. value 는 숫자이거나 지역 이름 글자라 anyOf 로 둘 다 받습니다. 2단계는 그 스키마를 output_config 의 format 에 담아 보냅니다. 3단계는 답을 쓰기 전에 stop_reason 부터 봅니다.

토큰은 모델이 글을 읽고 쓰는 조각입니다. 문서에 따르면 이 기능은 constrained decoding 이라는 방식으로 스키마에 맞는 답을 보장합니다. constrained decoding 은 모델이 토큰을 하나씩 고를 때 스키마에 맞지 않는 토큰을 고르지 못하게 막는 방식입니다. 그래서 문서는 답의 JSON 이 파싱 오류 없이 오고 필수 필드와 자료형도 보장된다고 적었습니다.

다만 문서는 이 보장에 예외가 있다고 적었습니다. stop_reason 이 refusal 이면 모델이 요청을 거절했다는 뜻이며 거절하는 글이 스키마보다 앞섭니다. stop_reason 이 max_tokens 이면 답이 길이 상한에서 잘려 스키마와 맞지 않을 수 있습니다. 그래서 발췌의 3단계는 답을 읽기 전에 stop_reason 이 그 둘 가운데 하나인지 먼저 보고 그렇다면 review 로 보냅니다.

글자로 된 enum 값의 대소문자도 보장하지 않는다고 문서는 적었습니다. verdict 에 supported 대신 Supported 가 오면 이 글의 `validate` 는 enum 밖의 값으로 봅니다. 문서는 대소문자를 구분하지 않고 enum 값을 비교하라고 권합니다. 또 숫자의 최솟값 같은 제약은 스키마에 적을 수 없고 적으면 오류가 난다고 적었습니다. 그래서 「나이는 0 이상」 같은 규칙은 스키마 대신 코드가 따로 확인합니다. 발췌의 스키마도 주석대로 최솟값 같은 숫자 제약을 적지 않았습니다.

꼴이 맞더라도 값이 뜻하는 내용은 틀릴 수 있습니다. q03(「건강 상태로 고른 사람」)의 규칙상 맞는 답은 verdict 가 unsupported, reason_code 가 sensitive_attribute 입니다. 그런데 모델이 verdict 에 supported, reason_code 에 none 을 적어도 두 낱말 모두 enum 안에 있으므로 스키마로는 맞는 답입니다. 이 글의 `validate` 도 이 답에서 틀린 자리를 찾지 못합니다. 자연어 오디언스 편에서도 일부 지원(partial)이라면서 reason_code 를 none 으로 적은 답이 스키마 검사를 지났습니다. OpenAI 문서도 Structured Outputs 의 답에 실수가 남을 수 있다고 적었습니다.

그래서 스키마를 강제해도 받는 쪽의 `validate` 는 그대로 두고 판정과 이유처럼 필드끼리 앞뒤가 맞는지는 그 뒤에 코드가 한 번 더 봅니다. 꼴의 보장도 모델을 바꾸거나 옵션을 끄면 함께 사라집니다. 받는 쪽 검증은 어느 모델을 쓰든 빼지 않고 같은 자리에 둡니다.

| 틀린 꼴 | 스키마 강제가 막나 | 그래도 코드가 볼 것 |
|---|---|---|
| 설명 문장이 붙은 답 (wrapped) | 막음 | validate 는 그대로 |
| 필드가 빠진 답 (missing) | 막음, 길이 상한에서 잘리면 못 막음 | stop_reason 이 max_tokens 인지 |
| enum 밖 값 (enum) | 막음, 대소문자는 보장하지 않음 | 대소문자가 다른 낱말 |
| 거절한 답 | 못 막음 | stop_reason 이 refusal 인지 |
| 값의 뜻 | 못 막음 | 필드끼리 앞뒤가 맞는지 |

## 6. 두 무대에서 review 로 간 답을 받는 사람

**받을 꼴을 정하고 검증하는 일은 두 무대가 같습니다. 두 무대는 review 로 간 답을 누가, 언제 보는지가 다릅니다.**

### 담장 안: 화면 앞의 광고주에게 다시 묻기 [무대: 닫힌 생태계]

한 회사가 서비스와 광고 서버를 다 가진 곳을 담장 안이라고 부릅니다. 광고주가 캠페인 화면에 요청을 적으면 모델의 답 가운데 검증을 통과한 답만 회원을 세는 데 쓰입니다. review 로 간 답은 담당자가 직접 보거나 캠페인 화면에서 광고주에게 요청을 다시 적어 달라고 합니다. 광고주가 그 화면 앞에 있으니 다시 묻기 한두 번은 기다릴 수 있습니다.

### 열린 RTB: 검증을 마친 결과만 쓰는 입찰 [무대: 열린 RTB]

여러 회사가 실시간 경매로 남의 지면(광고가 실리는 자리)에 광고를 사고파는 곳을 열린 RTB 라고 부릅니다. 광고를 사는 쪽 시스템인 DSP 는 입찰 요청에 100ms 안팎으로 답해야 해서 입찰 요청을 받고 답하기까지의 경로에서는 모델에 다시 물을 시간이 없습니다. 지면 분류처럼 입찰 전에 미리 하는 일의 답을 검증해 적어 두고 입찰 때는 적어 둔 값만 꺼냅니다. review 로 간 지면은 분류 없이 두고 그 지면에는 분류 조건을 쓰지 않습니다.

## 한눈 정리

| 자리 | 무엇 | 이 글의 값 |
|---|---|---|
| 스키마 | 필드 이름, 자료형, enum 을 먼저 적은 약속 | 필드 넷, enum 둘 |
| 가짜 LLM | 규칙으로 답하는 함수, SDK 와 같은 응답 꼴 | 요청 12건, 꼴 6/2/2/2 |
| 파싱 | 받은 글에서 JSON 을 꺼내 읽음 | 글 전체 10건, 중괄호 사이 12건 |
| 검증 | 필수 필드, 자료형, enum 을 봄 | 통과 8건 |
| 다시 묻기 | 빠진 필드 이름만 적어 다시 물음 | 2건 물음, 1건 통과 |
| review | 사람이 보는 목록 | 3건, 최종 통과 9건 |
| 스키마 강제 | 상용 API 가 꼴을 맞춤 | 값의 뜻은 보장하지 않음 |

## 헷갈리기 쉬운 점

- **JSON 이 나왔다고 맞은 답은 아닙니다.** 이 글의 q09 부터 q12 까지 4건은 JSON 으로 멀쩡히 읽혔지만 필드가 빠졌거나 enum 밖의 값을 적어 검증에서 떨어졌습니다. 파싱은 받은 글이 JSON 인지만 확인합니다. 스키마와 맞는지는 검증이 봅니다.
- **다시 묻기와 재시도는 다릅니다.** 다시 묻기는 빠진 필드의 이름만 적어 그 필드만 받고 첫 답의 나머지 필드는 그대로 둡니다. 재시도는 같은 요청을 처음부터 다시 보내서 필드 4개가 든 답 전체를 새로 받습니다. 이 글의 다시 묻기는 2건에만 보냈고 돌아온 답도 필드 한두 개였습니다.
- **스키마 강제는 값의 뜻을 보장하지 않습니다.** 상용 API 의 스키마 강제는 필드와 자료형과 enum 의 꼴을 맞춰 줄 뿐이라서 건강 상태 요청에 supported 를 적은 답도 꼴로는 맞는 답입니다. 그래서 강제를 켜도 받는 쪽 검증과 필드끼리 앞뒤가 맞는지 보는 코드는 남깁니다.

## 더 깊이 보기

:::deep 세 자리의 스키마를 비교합니다
같은 네 필드를 세 자리가 다른 꼴로 적습니다. 이 글의 `SCHEMA` 는 파이썬 사전입니다. 자연어 오디언스 편의 `read()` 는 같은 규칙을 if 문으로 적었습니다. 발췌의 `JSON_SCHEMA` 는 JSON Schema 꼴이라 상용 API 에 그대로 넘깁니다. type, enum, required 같은 낱말의 뜻은 JSON Schema 의 검증 명세에 있습니다.

| 무엇을 보나 | 이 글의 SCHEMA 와 validate | 자연어 오디언스 편의 read() | 발췌의 JSON_SCHEMA |
|---|---|---|---|
| 맨 위 필드 | 넷이 다 있는지, 남는 필드가 있는지 | 넷과 정확히 같은지 | required 넷, additionalProperties false |
| verdict, reason_code | 글자이고 enum 안인지 | enum 안인지 | type string 과 enum |
| 조건 하나의 꼴 | 보지 않음 | field 10개, op 셋, value 의 자료형 | field, op, value 가 필수, op 는 enum |
| 틀렸을 때 | 틀린 자리 목록 | None 하나 | 꼴이 맞는 답만 옴, 예외는 stop_reason |

`validate` 는 틀린 자리를 목록으로 돌려줍니다. 그래서 4절처럼 빠진 필드 이름을 골라 다시 물을 수 있습니다. `read()` 는 틀리면 None 하나만 돌려주어, 무엇이 틀렸는지는 알 수 없습니다. 다시 묻기를 하려면 틀린 자리를 아는 쪽이 필요합니다.
:::

:::deep 가짜 LLM 이 답을 만드는 규칙
요청 12건마다 맞는 답 하나를 `ANSWERS` 에 적어 두었습니다. 첫 요청이면 `SHAPE` 를 보고 wrapped 면 앞뒤에 영어 문장을 붙입니다. missing 이면 `DROP` 의 필드를 빼고 enum 이면 `BAD` 의 낱말로 바꿉니다. 다시 묻기면 마지막 메시지에 적힌 필드만 `ANSWERS` 에서 꺼내 답합니다. q10 만은 `REASK_BAD` 를 따라 reason_code 를 other 로 바꿉니다. 그래서 이 글의 건수는 규칙이 정한 값입니다.
:::

- [LLM 호출 한 번](post.html?id=llm-first-call) — 응답의 content 와 목표 enum 하나를 받은 19주째 편입니다.
- [자연어 오디언스](post.html?id=natural-language-audience) — 이 글의 필드 넷과 enum 이 처음 나온 18주째 편입니다.
- [프롬프트와 Chain-of-Thought](post.html?id=prompting-chain-of-thought) — 답의 꼴을 지키지 못한 답을 읽지 못한 답으로 센 21주째 편입니다.
- [구조화 출력 카드 네 장](demo-structured-output-cards.html) — 이 글의 카드 전체입니다. 카드를 누르면 헷갈리는 것 하나가 더 나옵니다.

## 참고문헌

- Anthropic. *Structured outputs*. Claude API 문서. [platform.claude.com](https://platform.claude.com/docs/en/build-with-claude/structured-outputs). output_config 의 format 에 json_schema 와 스키마를 넘기는 방식입니다. refusal 과 max_tokens 일 때는 스키마와 다를 수 있다고 적었습니다.
- OpenAI. *Structured model outputs*. API 문서. [developers.openai.com](https://developers.openai.com/api/docs/guides/structured-outputs). 답이 넘긴 JSON Schema 를 따르도록 하는 Structured Outputs 입니다. 그래도 답에 실수가 남을 수 있다고 적었습니다.
- Austin Wright et al. (2022). *JSON Schema Validation: A Vocabulary for Structural Validation of JSON*. Draft 2020-12. [json-schema.org](https://json-schema.org/draft/2020-12/json-schema-validation). type, enum, required 같은 검증 낱말을 정의합니다.
