모델 팀 19주째 월요일, 지훈 씨는 노트북에 공개된 언어 모델 하나를 띄웠습니다. 지난주 [자연어 오디언스](post.html?id=natural-language-audience) 편에서는 서연 씨의 문장이 회원 조건이 되는 흐름을 따라갔습니다. 그때는 문장을 보내고 답을 받는 사이를 열어 보지 않았습니다.

선배가 요청을 하나 직접 보내 보라고 해서, 지훈 씨는 서연 씨 캠페인 설명 한 줄을 보냈습니다. 캠페인 목표를 하나 골라 달라는 말도 함께 적었습니다. 돌아온 것을 열어 보니 답 한 낱말 옆에 숫자가 여럿 붙어 있었습니다.

**보낸 글은 어떤 꼴로 모델에 들어가고, 답은 무엇과 함께 돌아올까요?**

언어 모델에 글을 보내 답을 받는 일을 LLM 호출이라고 부릅니다. LLM 은 글을 읽고 이어 쓰도록 학습한 큰 언어 모델이고, 모델에 보내는 글 전체를 프롬프트라고 부릅니다. 모델은 글을 토큰이라는 조각으로 읽고 씁니다. 상용 서비스는 이 토큰 수로 요청 값을 매기니, 한 번에 오가는 토큰 수가 하루 비용을 정합니다.

> **한 줄 요약:** LLM 호출 한 번은 JSON 한 덩이를 보내고 JSON 한 덩이를 받는 일입니다. JSON 은 이름과 값의 짝인 필드를 중괄호로 묶어 적는 꼴입니다. 이 요청의 맨 위 필드는 다섯이고, 그중 messages 에 메시지 둘이 들어갑니다. 할 일을 적어 요청마다 같이 보내는 시스템 메시지와, 이번에 물을 사용자 메시지입니다. 서버는 두 메시지를 글 하나로 이었고, 모델은 그 글을 토큰 78개로 읽었습니다. 답은 `{"objective": "conversion"}` 한 줄이었습니다. objective 의 값은 정해 둔 낱말 넷 가운데 하나만 쓰는 enum 이고, 답은 그 안이었습니다. 응답에는 답과 함께 출력 토큰 6개와 걸린 시간 1,114ms 가 담겨 옵니다. 답 앞에 풀이를 먼저 쓰게 하는 thinking 을 켜도 답은 같았습니다. 대신 출력 토큰이 505개로 84.2배, 시간이 28.7배가 되었습니다.

> **골라 읽는 법** — 절이 6개입니다. 절마다 표나 코드나 카드가 들어 있어 그것만 보고 넘어가도 됩니다.
>
> - 이 요청 JSON 의 필드 다섯 → 1절
> - 두 메시지가 토큰이 되는 자리 → 2절
> - 요청을 보내는 파이썬 코드 → 3절
> - 응답 JSON 의 필드와 기록에서 읽은 두 답 → 4절
> - thinking 을 켠 답의 토큰과 시간 → 5절
> - 담장 안과 열린 RTB 에서 LLM 을 부르는 자리 → 6절

이 글의 서연 씨 캠페인 한 줄은 설명을 위해 만든 가상 데이터입니다. 답과 토큰 수와 걸린 시간은 지어낸 값이 아닙니다. 2026-11-04 에 이 블로그를 쓰는 맥에서 Ollama 로 qwen3.5:27b 를 띄워 기록했습니다. Ollama 는 공개된 모델을 개인 컴퓨터에서 돌리는 도구입니다. 지훈 씨의 요청과 같은 꼴로 thinking 을 끈 요청과 켠 요청을 한 번씩 보냈습니다. 기록 파일은 `data/llm-records/llm-first-call.json` 입니다. 카드 속 벽돌색은 이번 요청과 답, 먹색은 모델과 서버가 붙이는 표시입니다. 파랑은 기록에 남은 값, 회색은 기록에 옮기지 않는 필드입니다. 점선 상자는 사람이 미리 적어 둔 시스템 메시지입니다.

---

## 1. 지훈 씨가 보내는 첫 요청은 JSON 한 덩이입니다

**요청은 노트북 안의 서버에 보내는 JSON 한 덩이이고, 이 요청의 맨 위 필드는 다섯입니다. 답할 모델, 메시지 둘, 답을 한 번에 받을지, thinking 을 켤지, 토큰을 뽑는 방식입니다. 이 글의 두 요청은 think 필드 하나만 다르고 나머지 넷은 같습니다.**

Ollama 를 띄우면 노트북 안에 서버가 하나 열립니다. 서버는 다른 프로그램이 맡긴 일을 하고 결과를 돌려주는 프로그램입니다. 일을 맡기며 보내는 글을 요청, 서버가 돌려주는 글을 응답이라고 부릅니다. 지훈 씨의 코드는 `http://localhost:11434/api/chat` 주소로 요청을 보냅니다. localhost 는 지금 쓰는 그 컴퓨터를 가리키는 이름이라, 요청이 노트북 밖으로 나가지 않습니다.

요청에 담아 보내는 내용을 본문이라고 부르고, 이 요청의 본문이 JSON 한 덩이입니다. 맨 위 필드는 model, messages, stream, think, options 다섯입니다. `/api/chat` 은 tools, format, keep_alive 같은 필드도 받지만 이 요청은 쓰지 않습니다. model 에는 Ollama 에 받아 둔 모델의 이름 qwen3.5:27b 를 그대로 적습니다. 이름이 틀리면 서버는 답 대신 그 모델을 찾지 못했다는 오류를 돌려줍니다.

messages 는 메시지의 목록이고, 메시지마다 role 과 content 두 필드가 있습니다. role 은 누가 쓴 글인지, content 는 글 자체입니다. 첫째 메시지는 role 이 system 인 시스템 메시지입니다. 캠페인 설명을 읽고 목표를 enum 에서 하나 골라 JSON 으로만 답하라는 두 문장입니다. 둘째는 role 이 user 인 사용자 메시지입니다. 그 content 는 서연 씨 캠페인 한 줄 「러닝화 신상품 출시. 첫 구매를 늘리고 싶다. 하루 300만 원」입니다.

enum 의 낱말 넷은 광고 캠페인이 흔히 고르는 목표입니다. awareness 는 많은 사람에게 알리기, traffic 은 사이트로 데려오기입니다. conversion 은 구매 같은 전환 늘리기, retention 은 이미 산 사람을 다시 오게 하기입니다. 전환은 광고를 본 사람이 구매처럼 광고주가 바라는 행동을 한 것입니다. 목표가 정해지면 광고 시스템은 그 목표의 수를 늘리는 쪽으로 입찰합니다.

stream 을 false 로 두면 모델이 답을 다 쓴 뒤에 JSON 한 덩이로 받습니다. stream 을 적지 않으면 모델이 쓰는 대로 조각조각 보내는데, 화면에 글자가 흘러나오게 할 때 쓰는 방식입니다. think 는 thinking 을 켤지 정하는 필드이고, 이 글의 두 요청은 false 와 true 로 이 값만 다릅니다. qwen3.5:27b 는 think 를 빼면 thinking 을 켠 채로 답하니, 끄려면 false 를 적습니다.

options 에는 다음 토큰을 뽑는 방식을 적습니다. temperature 는 다음 토큰을 얼마나 흔들리게 뽑을지 정하는 값이고, 0 이면 늘 점수가 가장 높은 토큰을 고릅니다. seed 는 뽑을 때 쓰는 난수의 시작값입니다. 두 요청 모두 temperature 0, seed 7 로 보냈습니다. 다시 보내도 같은 답이 나와야 글이 기록을 그대로 다시 쓸 수 있기 때문입니다. 아래 표는 두 요청의 본문을 필드마다 놓은 것입니다.

| 필드 | 이 글의 두 요청 | 하는 일 |
|---|---|---|
| model | qwen3.5:27b | 답할 모델, Ollama 에 받아 둔 이름 |
| messages | 시스템 메시지와 사용자 메시지 | 할 일과 이번에 물을 캠페인 한 줄 |
| stream | false | 답을 다 쓴 뒤 한 덩이로 받기 |
| think | 끈 요청은 false, 켠 요청은 true | 답 앞에 풀이를 먼저 쓸지 |
| options | temperature 0, seed 7 | 다음 토큰을 뽑는 방식 |

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-first-call-cards.html?embed=1&card=request" height="480" loading="lazy" title="이 요청 JSON 의 필드 다섯과 필드마다 하는 일"></iframe>
<a class="demo-embed-open" href="demo-first-call-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 2. 프롬프트는 토큰이 되어 들어갑니다

**모델은 요청 JSON 을 그대로 읽지 않습니다. 서버가 두 메시지를 역할 표시와 함께 글 하나로 잇고, 모델은 그 글을 토큰으로 읽습니다. 이 요청의 프롬프트는 thinking 을 끄면 78토큰, 켜면 76토큰이었습니다.**

모델이 받는 것은 요청 JSON 이 아니라 메시지를 이어 붙인 글 하나입니다. Ollama 는 qwen3.5 모델에 보낼 때 메시지마다 앞에 역할 표시를 붙입니다. 시스템 메시지 앞에는 `<|im_start|>system` 이, 끝에는 `<|im_end|>` 가 붙습니다. 맨 끝에는 `<|im_start|>assistant` 를 붙여, 모델이 그 뒤에 답을 이어 쓰게 합니다. 이렇게 이은 글이 모델이 실제로 읽는 프롬프트입니다. 이 꼴은 Ollama 소스의 qwen3.5 용 코드에 적혀 있습니다.

모델은 이런 표시가 붙은 대화로 학습되어, 표시를 보고 두 글을 나눠 읽습니다. 그래서 시스템 메시지에는 요청마다 같은 할 일과 답의 꼴을 적고, 사용자 메시지에는 요청마다 바뀌는 내용을 적습니다. 다음 캠페인의 목표를 물을 때는 사용자 메시지만 바꿉니다.

글을 토큰으로 자를 때 어디서 끊을지는 모델마다 정해 둔 토큰 목록이 정합니다. 낱말 하나가 한 토큰이 되기도 하고, 낱말의 일부나 문장 부호 하나가 한 토큰이 되기도 합니다. 자주 쓰이는 글자 묶음일수록 한 토큰에 많이 들어갑니다. 그래서 같은 글도 모델이 다르면 토큰 수가 다르고, 글자 수로는 토큰 수를 알 수 없습니다. 기록에는 서버가 센 프롬프트의 토큰 수가 prompt_tokens 로 남습니다.

thinking 을 켜고 끄는 것도 프롬프트 끝의 표시로 모델에 전해집니다. 끄면 서버가 답 자리 앞에 비어 있는 풀이 자리 `<think>` 와 `</think>` 를 넣습니다. 켜면 `<think>` 하나만 두어 모델이 풀이부터 쓰게 합니다. 그래서 같은 두 메시지인데 prompt_tokens 가 끈 쪽 78개, 켠 쪽 76개로 2개 다릅니다.

컨텍스트(context)는 모델이 다음 토큰을 고를 때 한꺼번에 보는 토큰 전부입니다. 처음에는 프롬프트의 토큰뿐이고, 답을 한 토큰 쓸 때마다 그 토큰이 끝에 붙습니다. 모델마다 컨텍스트에 둘 수 있는 토큰 수에 상한이 있고, 이를 컨텍스트 길이라고 부릅니다. 이 요청은 그 상한에 한참 못 미치지만, 긴 문서를 넣어 묻는 요청에서는 이 상한이 넣을 수 있는 양을 정합니다.

토큰 수는 값과 시간을 정합니다. 프롬프트의 토큰은 모델이 읽는 데, 출력 토큰은 쓰는 데 시간이 듭니다. API 는 프로그램이 다른 프로그램의 기능을 부를 때 쓰는 정해진 요청의 꼴입니다. Anthropic 이 Claude 를 부르게 열어 둔 Messages API 의 문서는 토큰 수로 값을 매긴다고 적었습니다. 같은 문서는 요청을 모델이 읽는 꼴로 바꾸기 때문에 토큰 수가 보이는 글과 꼭 맞지 않는다고도 적었습니다. 아래 표는 이 요청의 프롬프트를 이루는 자리입니다.

| 자리 | 이 요청에서 | 하는 일 |
|---|---|---|
| 시스템 메시지 | role system, 할 일 두 문장 | 요청마다 같은 할 일과 답의 꼴 |
| 사용자 메시지 | role user, 캠페인 한 줄 | 요청마다 바뀌는 내용 |
| 역할 표시 | 메시지마다 앞의 시작 표시와 끝 표시 | 누가 쓴 글인지 모델에 알리기 |
| 풀이 자리 | 끄면 빈 풀이 자리, 켜면 여는 표시 하나 | thinking 을 켤지 모델에 알리기 |
| 프롬프트 토큰 | thinking 끔 78개, 켬 76개 | 위 넷을 이은 글의 토큰 수 |
| 컨텍스트 | 프롬프트 토큰과 모델이 쓴 답의 토큰 | 다음 토큰을 고를 때 모델이 보는 전부 |

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-first-call-cards.html?embed=1&card=tokens" height="480" loading="lazy" title="두 메시지가 역할 표시와 함께 프롬프트 토큰이 되는 자리"></iframe>
<a class="demo-embed-open" href="demo-first-call-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 3. 요청을 보내는 코드 한 벌

**파이썬 표준 라이브러리의 urllib 만으로 요청 하나를 보낼 수 있습니다. 본문을 JSON 글로 바꿔 서버에 보내고, 돌아온 JSON 에서 답과 네 값을 꺼냅니다. 네트워크와 모델이 있어야 도는 코드라, 이 블록은 검사기가 돌리지 않는 발췌입니다.**

HTTP 는 웹에서 프로그램끼리 요청과 응답을 주고받는 규약입니다. POST 는 본문을 담아 보내는 HTTP 요청입니다. 아래 블록의 1단계는 1절의 다섯 필드를 그대로 적은 본문입니다. 2단계가 그 본문을 보내고, 3단계가 응답에서 답과 네 값을 꺼내 찍습니다.

```python
# (발췌 — 그대로 실행되지 않습니다.)
# 하는 일: 노트북의 Ollama 에 요청 하나를 보내고, 응답 JSON 에서 답과 네 값을 꺼낸다.
import json
import urllib.request

# 1단계: 요청 본문을 만든다
# 이 요청의 맨 위 필드 다섯이다. messages 의 첫째가 시스템 메시지, 둘째가 사용자 메시지다.
# think 를 True 로 바꾸면 thinking 을 켠 요청이 된다. 이 모델은 think 를 빼면 thinking 을 켠다.
SYSTEM = ('광고 캠페인 설명을 읽고 목표를 enum 에서 하나 골라 JSON {"objective": "<목표>"} 으로만 답한다. '
          'enum 은 awareness, traffic, conversion, retention 넷이다.')
body = {
    'model': 'qwen3.5:27b',
    'messages': [
        {'role': 'system', 'content': SYSTEM},
        {'role': 'user', 'content': '러닝화 신상품 출시. 첫 구매를 늘리고 싶다. 하루 300만 원'},
    ],
    'stream': False,
    'think': False,
    'options': {'temperature': 0, 'seed': 7},
}

# 2단계: 본문을 JSON 글로 바꿔 POST 로 보낸다
# stream 이 False 라 모델이 답을 다 쓴 뒤에 JSON 한 덩이가 한 번에 온다.
# thinking 을 켜면 풀이까지 다 쓴 뒤에야 응답이 와서, 기다리는 한도를 600초로 넉넉히 둔다.
req = urllib.request.Request('http://localhost:11434/api/chat',
                             data=json.dumps(body).encode('utf-8'),
                             headers={'Content-Type': 'application/json'}, method='POST')
with urllib.request.urlopen(req, timeout=600) as r:
    resp = json.load(r)

# 3단계: 응답에서 답과 네 값을 꺼낸다
# 답은 message 의 content, 풀이는 message 의 thinking 에 온다. thinking 을 끄면 thinking 필드가 없다.
# total_duration 은 나노초라 100만으로 나눠 ms 로 바꾼다. 기록 도구가 같은 다섯 값을 이 이름으로 적는다.
msg = resp['message']
print('output', msg['content'])
print('prompt_tokens', resp['prompt_eval_count'])
print('output_tokens', resp['eval_count'])
print('elapsed_ms', round(resp['total_duration'] / 1e6))
print('thinking_chars', len(msg.get('thinking') or ''))
```

2단계의 timeout 은 응답을 기다리는 한도입니다. stream 이 false 라 모델이 다 쓸 때까지 아무것도 오지 않다가, JSON 한 덩이가 한 번에 옵니다. thinking 을 켠 요청은 풀이까지 다 쓴 뒤에야 응답이 오니, 한도를 600초로 넉넉히 두고 기록 도구도 같은 한도로 기다립니다.

3단계가 꺼내는 이름은 Ollama 의 응답 필드 이름입니다. 답은 message 필드 안의 content 에, 풀이는 같은 자리의 thinking 에 옵니다. 프롬프트의 토큰 수는 prompt_eval_count, 출력 토큰 수는 eval_count 입니다. 걸린 시간 total_duration 은 나노초 단위입니다. 나노초는 10억분의 1초라서 100만으로 나누면 ms 가 됩니다.

이 블로그의 기록 도구 `scripts/llm-record.py` 도 같은 본문을 같은 주소로 보냅니다. 응답의 다섯 값은 이름을 바꿔 적어서, 답은 output, 풀이의 글자 수는 thinking_chars 입니다. 토큰 수 둘은 prompt_tokens 와 output_tokens, 시간은 elapsed_ms 입니다. 다른 점은 둘인데, 실패하면 두 번까지 다시 보내고 응답의 done_reason 이 stop 이 아니면 답을 적지 않습니다. stop 이 아니면 답이 끝까지 오지 않은 것이기 때문입니다.

상용 API 는 주소와 인증 헤더가 다르고, model 과 messages 는 같은 꼴입니다. 인증 헤더는 본문 앞에 붙여 누가 보낸 요청인지 밝히는 줄입니다. 나머지 필드는 API 마다 다르고, Anthropic 의 Messages API 에는 출력 토큰의 상한 max_tokens 를 꼭 적습니다. thinking 을 켜는 필드도 think 가 아니라 thinking 객체이고, seed 필드는 없습니다. Anthropic 의 Messages API 문서는 시스템 메시지를 messages 밖의 system 필드에 넣을 수 있다고 적었습니다. 응답의 토큰 수는 usage 필드 안의 input_tokens 와 output_tokens 로 옵니다.

## 4. 답은 JSON 한 줄과 필드 몇 개로 돌아옵니다

**thinking 을 끈 답은 `{"objective": "conversion"}` 한 줄이었습니다. JSON 으로 읽혔고 objective 는 enum 넷 가운데 하나였습니다. 답과 함께 프롬프트 토큰 78개, 출력 토큰 6개, 걸린 시간 1,114ms 가 담겨 왔습니다.**

응답도 JSON 한 덩이이고, 답은 message 필드 안의 content 에 들어 있습니다. 기록 도구는 Ollama 0.40.11 이 돌려준 필드 가운데 다섯 값을 옮겨 적었습니다. 아래 블록은 그 기록에서 뽑은 RECORD 와 USAGE 두 줄을 붙여 읽습니다. 두 줄은 `--export-constant --with-usage` 가 찍은 것이고, 검사기가 기록과 글자까지 같은지 봅니다.

```python
# 하는 일: 기록한 두 답을 JSON 으로 읽어 objective 가 enum 안인지 보고, 응답 네 값으로 thinking 을 끈 답과 켠 답을 비교한다.
# 기록 data/llm-records/llm-first-call.json 에서 옮김
import json

RECORD = {"c001": "{\"objective\": \"conversion\"}", "c001|on|1": "{\"objective\": \"conversion\"}"}
USAGE = {"c001": [78, 6, 1114, 0], "c001|on|1": [76, 505, 31979, 1905]}

# 1단계: 두 답을 JSON 으로 읽는다
# 키 c001 은 thinking 을 끄고 받은 답이고, c001|on|1 은 같은 요청을 thinking 을 켜고 받은 답이다.
# JSON 으로 읽히지 않거나, 필드가 objective 하나가 아니거나, 값이 enum 밖이면 읽지 못한 답이다.
ENUM = ['awareness', 'traffic', 'conversion', 'retention']


def read(text):
    try:
        obj = json.loads(text)
    except ValueError:
        return None
    if not isinstance(obj, dict) or list(obj) != ['objective'] or obj['objective'] not in ENUM:
        return None
    return obj['objective']


for key, text in RECORD.items():
    got = read(text)
    print(f'{key}: {text} ({len(text)}자) -> objective {got}, 읽힘 {got is not None}')

# 2단계: 응답의 네 값에 이름을 붙여 찍는다
# USAGE 의 값은 차례대로 prompt_tokens, output_tokens, elapsed_ms, thinking_chars 다.
# elapsed_ms 는 응답의 total_duration 을 ms 로 바꾼 값이라, 1,000으로 나누면 초가 된다.
FIELDS = ['prompt_tokens', 'output_tokens', 'elapsed_ms', 'thinking_chars']
for key, values in USAGE.items():
    row = dict(zip(FIELDS, values))
    print(f'{key}: ' + ', '.join(f'{name} {row[name]:,}' for name in FIELDS) + f' ({row["elapsed_ms"] / 1000:.1f}초)')

# 3단계: thinking 을 켜면 무엇이 달라지나 본다
# 두 요청은 think 필드 하나만 다르다. 켠 답의 출력 토큰에는 풀이의 토큰도 들어 있다.
off, on = USAGE['c001'], USAGE['c001|on|1']
ans_off, ans_on = read(RECORD['c001']), read(RECORD['c001|on|1'])
print(f'답이 같은가 {ans_off is not None and ans_off == ans_on}')
print(f'prompt_tokens {off[0]} -> {on[0]}, 차이 {off[0] - on[0]}개')
print(f'output_tokens {off[1]} -> {on[1]}, {on[1] / off[1]:.1f}배')
print(f'elapsed_ms {off[2]:,} -> {on[2]:,}, {on[2] / off[2]:.1f}배')
print(f'thinking_chars {off[3]} -> {on[3]:,}')

# 출력:
# 1단계 뜻: 두 답 모두 JSON 으로 읽히고, objective 는 enum 안의 conversion 이다.
# c001: {"objective": "conversion"} (27자) -> objective conversion, 읽힘 True
# c001|on|1: {"objective": "conversion"} (27자) -> objective conversion, 읽힘 True
# 2단계 뜻: 끈 답은 78토큰을 읽고 6토큰을 썼다. 켠 답은 풀이까지 505토큰을 썼다.
# c001: prompt_tokens 78, output_tokens 6, elapsed_ms 1,114, thinking_chars 0 (1.1초)
# c001|on|1: prompt_tokens 76, output_tokens 505, elapsed_ms 31,979, thinking_chars 1,905 (32.0초)
# 3단계 뜻: 답은 같고, 출력 토큰은 84.2배, 시간은 28.7배가 되었다. 풀이는 1,905자다.
# 답이 같은가 True
# prompt_tokens 78 -> 76, 차이 2개
# output_tokens 6 -> 505, 84.2배
# elapsed_ms 1,114 -> 31,979, 28.7배
# thinking_chars 0 -> 1,905
```

1단계는 답 글을 JSON 으로 읽고, 필드가 objective 하나인지와 값이 enum 넷 가운데 하나인지 봅니다. 하나라도 어긋나면 읽지 못한 답으로 셉니다. 꼴이 틀린 답을 그대로 넘기면 캠페인 설정에 엉뚱한 값이 들어가기 때문입니다. 이 기록의 두 답은 모두 읽혔고, 둘 다 conversion 입니다.

캠페인 한 줄에는 「신상품 출시」처럼 알리기에 가까운 말도 있었습니다. 답은 「첫 구매를 늘리고 싶다」에 맞는 conversion 쪽이었습니다. 모델이 왜 그쪽을 골랐는지는 답 한 줄에 적혀 있지 않습니다. 이 요청은 답만 JSON 으로 받았고, 까닭을 함께 받으려면 시스템 메시지에 그런 필드를 더해야 합니다.

2단계는 USAGE 의 네 값에 이름을 붙여 찍습니다. 끈 답은 프롬프트 토큰 78개를 읽고 출력 토큰 6개를 썼고, 1.1초가 걸렸습니다. 답 27자가 출력 토큰 6개라서, 출력 토큰 하나가 글자 하나가 아닙니다. thinking_chars 가 0 인 것은 thinking 을 끈 응답에 풀이 필드가 없기 때문입니다.

답 한 줄만 쓴다면 나머지 값은 버려도 될 것 같지만, 이 값들이 요청 한 건의 값과 기다리는 시간입니다. 상용 API 라면 입력 토큰과 출력 토큰에 각각의 단가를 곱해 더한 것이 요청 한 건의 값입니다. elapsed_ms 는 이 답을 기다리는 화면이나 코드가 멈춰 있는 시간입니다. thinking 하나만 켠 요청은 이 네 값이 달랐습니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-first-call-cards.html?embed=1&card=response" height="480" loading="lazy" title="응답 JSON 의 필드와 기록 도구가 옮기는 다섯 값"></iframe>
<a class="demo-embed-open" href="demo-first-call-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 5. thinking 을 켜면 같은 답에 토큰이 붙습니다

**thinking 을 켜면 모델은 답 앞에 풀이를 먼저 쓰고, 풀이의 토큰도 출력 토큰으로 셉니다. 이 요청은 답이 같았고, 출력 토큰은 6개에서 505개로 84.2배가 되었습니다. 시간은 1.1초에서 32.0초로 28.7배, 풀이는 1,905자였습니다.**

Qwen3 기술 보고서는 thinking 모드와 non-thinking 모드를 한 모델에 함께 두었다고 적었습니다. 앞은 여러 단계를 따지는 답에, 뒤는 빠른 답에 쓰는 모드입니다. qwen3.5:27b 도 think 필드 하나로 두 모드를 오갑니다. thinking 을 켠 요청에서 모델은 2절의 `<think>` 뒤에 풀이를 쓰고, `</think>` 다음에 답을 씁니다. 서버는 둘을 나눠 풀이는 message 의 thinking 에, 답은 content 에 담습니다.

기록 도구는 풀이 글을 적지 않고 글자 수만 thinking_chars 로 적습니다. 그래서 풀이에서 무엇을 따졌는지는 이 기록으로 알 수 없습니다. 아래 표는 4절 블록의 1단계와 2단계가 찍은 값을 두 답으로 나란히 놓은 것입니다.

| 필드 | thinking 끔 | thinking 켬 |
|---|---|---|
| 답 (output) | `{"objective": "conversion"}` | `{"objective": "conversion"}` |
| prompt_tokens | 78 | 76 |
| output_tokens | 6 | 505 |
| elapsed_ms | 1,114 | 31,979 |
| thinking_chars | 0 | 1,905 |

답은 같고, 달라진 것은 프롬프트 토큰, 출력 토큰, 시간, 풀이 글자 수입니다. 프롬프트 토큰이 2개 준 것은 2절에서 본 풀이 자리 표시의 차이입니다. 출력 토큰은 84.2배인데 시간은 28.7배입니다. total_duration 은 응답 하나를 만드는 데 든 전체 시간입니다. 그래서 프롬프트를 읽는 시간처럼 출력 토큰 수와 상관없는 시간도 들어 있습니다. 출력 토큰이 6개뿐인 끈 답은 그 몫이 커서, 토큰이 는 만큼 시간이 늘지 않았습니다.

풀이는 답이 아니지만 값은 냅니다. 상용 API 에서도 풀이로 쓴 토큰은 출력 토큰에 들어갑니다. Anthropic 의 Messages API 문서는 usage 의 output_tokens 가 값을 매기는 합계라고 적었습니다. 그 가운데 풀이로 쓴 토큰 수를 따로 적어 준다고도 설명합니다. 이 요청이라면 같은 답을 받으려고 출력 토큰을 84.2배 낸 것입니다.

이 기록에서는 thinking 을 꺼도 답이 같았으니, 이 캠페인 한 줄에는 끈 쪽으로 충분했습니다. 다만 캠페인 한 줄을 한 번 물은 기록이라, 다른 문장에서도 답이 같을지는 말할 수 없습니다. [컨텍스추얼 타겟팅](post.html?id=contextual-targeting) 편에서는 thinking 을 켠 답이 시스템 메시지에 적은 기준을 더 잘 따랐습니다. 그때도 출력 토큰이 크게 늘어서, thinking 은 켤 자리를 골라 켭니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-first-call-cards.html?embed=1&card=think" height="480" loading="lazy" title="thinking 을 끈 답과 켠 답의 출력 토큰과 시간"></iframe>
<a class="demo-embed-open" href="demo-first-call-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 6. LLM 을 부르는 자리가 무대마다 다릅니다

**요청의 꼴과 토큰을 세는 법은 두 무대가 같습니다. 다른 것은 요청 한 건을 기다릴 수 있는 시간입니다. 담장 안은 캠페인을 만들 때 한 번 부르면 되고, 열린 RTB 는 입찰 요청마다 부를 시간이 없습니다.**

### 담장 안은 캠페인을 만들 때 한 번 부릅니다 [무대: 닫힌 생태계]

한 회사가 서비스와 광고 서버를 다 가진 곳을 담장 안이라고 부릅니다. 이 글의 요청처럼 목표를 고르는 호출은 서연 씨가 캠페인을 만들 때 한 번이면 됩니다. 답은 캠페인 설정에 적어 두고 광고 요청마다 다시 묻지 않으니, 호출 수는 캠페인 수만큼입니다. thinking 을 켠 32.0초도 캠페인 화면에서는 기다릴 수 있지만, 답이 같다면 끈 쪽 1.1초가 낫습니다. 캠페인 설명은 광고주의 자료라, 회사 안 서버에 띄운 공개 모델로 부르면 그 글이 회사 밖으로 나가지 않습니다.

### 열린 RTB 에서는 입찰 요청에 LLM 을 부를 시간이 없습니다 [무대: 열린 RTB]

여러 회사가 실시간 경매로 남의 지면에 광고를 사고파는 곳을 열린 RTB 라고 부릅니다. 광고를 사는 쪽의 시스템인 DSP 는 입찰 요청에 100ms 안팎으로 답해야 합니다. 이 노트북에서는 thinking 을 끈 답도 1.1초가 걸렸으니, 입찰 요청마다 LLM 을 부를 수는 없습니다. 그래서 LLM 은 캠페인 설정이나 지면 분류처럼 미리 해 둘 수 있는 일에 쓰고, 입찰 때는 적어 둔 결과를 꺼냅니다. 캠페인 설명을 상용 API 로 보내면 그 글은 API 를 연 회사의 서버로 갑니다.

## 한눈 정리

| 자리 | 무엇 | 이 기록의 값 |
|---|---|---|
| 요청 | JSON 한 덩이, 이 요청은 맨 위 필드 다섯 | model, messages, stream, think, options |
| 프롬프트 | 두 메시지를 역할 표시로 이은 글 | thinking 끔 78토큰, 켬 76토큰 |
| 답 | message 의 content, JSON 한 줄 | `{"objective": "conversion"}`, enum 안 |
| 출력 토큰 | 응답의 eval_count | 끔 6개, 켬 505개, 84.2배 |
| 걸린 시간 | total_duration 을 ms 로 | 끔 1,114ms, 켬 31,979ms, 28.7배 |
| 풀이 | message 의 thinking, 글자 수만 기록 | 끔 0자, 켬 1,905자 |
| 기록 | 다섯 값을 옮겨 적은 파일 | `data/llm-records/llm-first-call.json` |

## 헷갈리기 쉬운 점

- **토큰은 글자가 아닙니다.** 답 `{"objective": "conversion"}` 은 27자인데 출력 토큰은 6개입니다. 어디서 끊을지는 모델마다 정해 둔 토큰 목록이 정합니다. 그래서 같은 글도 모델이 다르면 토큰 수가 다릅니다. prompt_tokens 에는 두 메시지의 글 말고도 역할 표시와 풀이 자리 표시가 들어 있습니다. 값과 시간은 글자 수가 아니라 이 토큰 수를 따라갑니다.
- **시스템 메시지는 사용자 메시지와 다른 자리입니다.** Ollama 에서는 messages 의 첫째에 role system 으로 넣습니다. 프롬프트 안에서도 `<|im_start|>system` 표시 뒤에 따로 들어갑니다. Anthropic 의 Messages API 는 맨 위 system 필드로도 받습니다. 캠페인 설명을 시스템 메시지에 섞으면 캠페인마다 할 일을 다시 써야 합니다. 할 일은 시스템 메시지에 두고, 캠페인 한 줄만 사용자 메시지로 바꿉니다.
- **thinking 글자는 답이 아닙니다.** 풀이 1,905자는 message 의 thinking 에 따로 옵니다. 코드가 읽는 답은 content 의 JSON 한 줄입니다. 그래도 풀이의 토큰은 출력 토큰 505개에 들어 있어서 값과 시간을 냅니다. 기록은 풀이 글을 남기지 않고 글자 수만 남깁니다.

## 더 깊이 보기

:::deep Ollama 응답 필드 전문
Ollama 0.40.11 의 `/api/chat` 이 thinking 을 켠 요청에 돌려준 응답의 필드입니다. 필드 목록은 이 버전이 돌려준 응답에서 옮겼습니다. 시간과 토큰 수 필드, message 안의 필드는 Ollama 의 API 문서가 적은 뜻을 옮겼습니다. done_reason 의 뜻은 기록 도구의 주석에서 옮겼고, 나머지는 이름 그대로입니다. 캐시는 앞 요청에서 이미 읽은 같은 앞부분을 다시 읽지 않으려고 남겨 둔 계산 결과입니다.

| 응답 필드 | 뜻 | 기록 도구가 적는 이름 |
|---|---|---|
| model | 답한 모델의 이름 | 옮기지 않음 |
| created_at | 응답을 만든 시각 | 옮기지 않음 |
| message.role | 쓴 쪽, 답은 assistant | 옮기지 않음 |
| message.content | 답 | output |
| message.thinking | 풀이, thinking 을 켠 응답에만 있음 | thinking_chars, 글자 수만 |
| done | 응답이 끝났는지 | 옮기지 않음 |
| done_reason | 끝난 까닭, stop 이면 끝까지 씀 | stop 이 아니면 답을 적지 않음 |
| total_duration | 응답을 만드는 데 든 전체 시간 | elapsed_ms, ms 로 바꿔서 |
| load_duration | 모델을 메모리에 올린 시간 | 옮기지 않음 |
| prompt_eval_count | 프롬프트의 토큰 수 | prompt_tokens |
| prompt_eval_cached_count | 그 가운데 캐시에서 읽은 토큰 수 | 옮기지 않음 |
| prompt_eval_duration | 캐시에 없던 프롬프트 토큰을 읽은 시간 | 옮기지 않음 |
| eval_count | 응답의 토큰 수 | output_tokens |
| eval_duration | 응답을 쓴 시간 | 옮기지 않음 |

시간 필드는 모두 나노초입니다. 문서는 eval_count 를 eval_duration 으로 나눠 초당 출력 토큰 수를 셀 수 있다고 적었습니다. 기록 도구는 eval_duration 을 적지 않아서, 이 글은 그 수를 세지 않았습니다. prompt_eval_count 는 캐시에서 읽은 토큰까지 셉니다.
:::

:::deep 기록 도구가 보내고 옮기는 것
기록 도구에 준 프롬프트 파일 `data/llm-records/prompts/llm-first-call.json` 의 전문입니다.

```json
{
  "system": "광고 캠페인 설명을 읽고 목표를 enum 에서 하나 골라 JSON {\"objective\": \"<목표>\"} 으로만 답한다. enum 은 awareness, traffic, conversion, retention 넷이다.",
  "items": [
    {
      "id": "c001",
      "user": "러닝화 신상품 출시. 첫 구매를 늘리고 싶다. 하루 300만 원"
    }
  ],
  "think": "both",
  "repeat": 1
}
```

think 가 both 라서 도구는 항목 c001 을 thinking 을 끄고 한 번, 켜고 한 번 보냅니다. options 를 적지 않아 도구의 기본값 temperature 0, seed 7 이 두 요청에 같이 갔습니다. 아래는 기록 파일에 남은 두 항목 가운데 thinking 을 켠 쪽입니다.

```json
{
  "id": "c001",
  "think": true,
  "run": 1,
  "system": "광고 캠페인 설명을 읽고 목표를 enum 에서 하나 골라 JSON {\"objective\": \"<목표>\"} 으로만 답한다. enum 은 awareness, traffic, conversion, retention 넷이다.",
  "user": "러닝화 신상품 출시. 첫 구매를 늘리고 싶다. 하루 300만 원",
  "output": "{\"objective\": \"conversion\"}",
  "thinking_chars": 1905,
  "prompt_tokens": 76,
  "output_tokens": 505,
  "elapsed_ms": 31979,
  "options": {
    "temperature": 0,
    "seed": 7
  }
}
```

`--export-constant` 는 thinking 을 끈 첫 회차를 `c001`, 켠 첫 회차를 `c001|on|1` 이라는 키로 찍습니다. 4절 블록의 RECORD 와 USAGE 는 그 두 줄을 그대로 붙인 것입니다. `scripts/check-llm-constants.py` 가 두 줄을 기록에서 다시 뽑은 줄과 글자까지 비교합니다. 다시 기록하면 파일 전체가 바뀌므로 이 글의 숫자도 다시 맞춥니다.
:::

- [자연어 오디언스](post.html?id=natural-language-audience) — 서연 씨의 문장이 조건 JSON 이 된 18주째 편입니다.
- [컨텍스추얼 타겟팅](post.html?id=contextual-targeting) — thinking 을 켠 답이 시스템 메시지의 기준을 따른 기록입니다.
- [LLM 호출 한 번 카드 네 장](demo-first-call-cards.html) — 이 글의 카드 전체입니다. 카드를 누르면 헷갈리는 것 하나가 더 나옵니다.

## 참고문헌

- Ollama. *API*. GitHub 의 `docs/api.md`. [github.com](https://github.com/ollama/ollama/blob/main/docs/api.md). `/api/chat` 의 요청 필드와 응답 필드를 적은 문서입니다. 시간 필드는 모두 나노초라고 적었습니다.
- Ollama. *qwen35.go*. v0.40.11 소스 코드 `model/renderers/qwen35.go`. [github.com](https://github.com/ollama/ollama/blob/v0.40.11/model/renderers/qwen35.go). 메시지마다 역할 표시를 붙이고 thinking 을 끄면 빈 풀이 자리를 넣는 코드입니다.
- Anthropic. *Messages*. Claude API 문서. [platform.claude.com](https://platform.claude.com/docs/en/api/messages). 맨 위 system 필드와 usage 의 input_tokens, output_tokens 를 적었습니다. 토큰 수로 값을 매기고, 풀이로 쓴 토큰도 출력 토큰에 든다고 설명합니다.
- An Yang et al. (2025). *Qwen3 Technical Report*. arXiv:2505.09388. [arxiv.org](https://arxiv.org/abs/2505.09388). thinking 모드와 non-thinking 모드를 한 모델에 둔 설계를 적었습니다.
