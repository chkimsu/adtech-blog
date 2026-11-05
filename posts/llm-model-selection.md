모델 팀 20주째 월요일, 지훈 씨는 선배에게서 모델 이름이 길게 적힌 목록을 받았습니다. 지난주 [LLM 호출 한 번](post.html?id=llm-first-call) 편에서 노트북의 모델에 요청 하나를 보내 본 다음입니다. 이름마다 만든 회사와 숫자 몇 개, 영어 낱말이 붙어 있었습니다.

선배는 광고주가 캠페인 화면에서 묻는 숫자 질문에 답할 모델을 고르라고 했습니다. 「하루 예산을 이 단가로 다 쓰면 전환이 몇 건인가」 같은 질문입니다. 지훈 씨는 그런 문제 20개를 적어 노트북의 모델에 하나씩 물었습니다. 어려운 10개는 풀이를 먼저 쓰게 하고 한 번 더 물었습니다.

**모델은 이름 말고 무엇으로 견주고, 풀이를 먼저 쓰게 하면 무엇이 달라질까요?**

이름 옆의 것들은 네 가지를 말합니다. 모델이 어디서 도는지, 얼마나 큰지, 한 번에 얼마나 긴 글을 읽는지, 답 앞에 풀이를 쓰는지입니다. 넷 모두 요청 한 건의 값과 답을 기다리는 시간을 바꿉니다. 같은 모델도 문제에 따라 맞히는 수가 달라서, 답할 문제로 잰 숫자를 같이 봅니다.

> **한 줄 요약:** 모델은 이름보다 네 가지로 고릅니다. 첫째는 만든 회사의 서버로만 부르는 상용 API 인지, 가중치를 내려받아 직접 운영하는 서버에서 돌리는 공개 가중치인지입니다. API 는 프로그램이 다른 프로그램의 기능을 부를 때 쓰는 정해진 요청의 꼴입니다. 가중치는 모델이 학습으로 얻은 숫자들입니다. 나머지는 크기, 한 번에 읽는 글의 상한인 컨텍스트 길이, 답 앞의 풀이입니다. 토큰은 모델이 글을 읽고 쓰는 조각이고, 답 앞에 모델이 쓰는 풀이 토큰을 thinking 이라고 부릅니다. reasoning 도 같은 풀이를 가리키는 이름이고, 풀이 토큰도 출력 토큰이라 값을 냅니다. 광고 운영 숫자 문제 20개를 노트북의 qwen3.5:27b 에 thinking 을 끄고 물으니 14개를 맞혔습니다. 한 단계로 푸는 10개는 모두, 두세 단계로 푸는 10개는 4개만 맞혔습니다. 두세 단계 10개는 thinking 을 켜자 모두 맞혔고, 출력 토큰은 92.9배, 시간은 43.6배가 되었습니다. 가상 단가로 하루 100만 요청을 세면 작은 모델 72만 원, 큰 모델 780만 원입니다. 요청마다 같이 보내는 할 일 설명인 시스템 메시지를 캐시에서 읽으면 큰 모델도 420만 원입니다. 캐시는 앞 요청에서 계산해 둔 결과입니다.

> **골라 읽는 법** — 절이 7개입니다. 절마다 표나 코드나 카드가 있어 그것만 보고 넘어가도 됩니다.
>
> - 모델 일곱 계열을 네 가지로 놓은 표 → 1절
> - 크기, 활성 파라미터, 컨텍스트 길이 → 2절
> - thinking 을 켜고 끄는 필드와 풀이 토큰의 값 → 3절
> - 문제 20개에 thinking 을 끄고 켠 기록 → 4절
> - 요청 한 건과 하루 100만 건의 값 → 5절
> - 지훈 씨가 고른 것과 그 숫자 → 6절
> - 두 무대에서 모델을 부르는 자리 → 7절

이 글의 문제 20개와 5절의 단가, 요청 크기는 설명을 위해 만든 가상 데이터입니다. 모델 표의 값은 각 회사의 공개 문서와 모델 카드에서 옮겼습니다. 모델 카드는 모델을 낸 곳이 크기와 쓰는 법을 적어 둔 문서이고, 출처는 참고문헌에 있습니다. 답과 토큰 수와 시간은 지어낸 값이 아닙니다. 2026-11-05 에 이 블로그를 쓰는 맥에서 Ollama 0.40.11 로 qwen3.5:27b 를 띄워 기록했습니다. Ollama 는 공개된 모델을 개인 컴퓨터에서 돌리는 도구입니다. 기록 파일은 `data/llm-records/llm-model-selection.json` 입니다. 카드의 파랑은 thinking 을 끈 답, 벽돌색은 켠 답과 출력 토큰입니다. 먹색은 모델과 서버, 회색은 문서에 없는 값, 점선 상자는 가상 값입니다.

---

## 1. 고를 것은 모델 이름이 아니라 네 가지입니다

**상용 API 셋은 만든 회사의 서버로만 부르고, 공개 가중치 넷은 직접 운영하는 서버에서도 돌립니다. 상용 셋은 크기를 문서에 적지 않았고, 공개 넷은 모델 카드에 적었습니다. 컨텍스트 길이와 thinking 은 같은 계열 안에서도 모델마다 다릅니다.**

LLM 은 글을 읽고 이어 쓰도록 학습한 큰 언어 모델입니다. 상용 API 로 부르면 요청은 모델을 만든 회사의 서버에서 처리됩니다. 요청에 담은 글도 그 서버로 가니, 광고주의 자료를 담을 때는 이 점부터 봅니다. Claude 는 Anthropic, GPT 는 OpenAI, Gemini 는 Google 이 이렇게 엽니다.

공개 가중치 모델은 가중치 파일을 받아 직접 운영하는 서버나 노트북에서 돌립니다. 지난 편의 qwen3.5:27b 도 Ollama 로 가중치를 받아 이 블로그를 쓰는 맥에서 돌렸습니다. 요청이 그 컴퓨터 밖으로 나가지 않고, 요청마다 내는 값도 없습니다. 대신 모델을 올릴 메모리와 계산할 기계를 직접 마련합니다. Qwen 과 DeepSeek 은 가중치를 공개하면서 만든 회사의 API 로도 엽니다.

가중치를 받아 어디까지 써도 되는지는 라이선스가 정합니다. 라이선스는 모델을 낸 쪽이 적어 둔 사용 조건입니다. Qwen3.5 와 Gemma 4 는 Apache 2.0, DeepSeek-V4 는 MIT 라이선스입니다. Llama 4 는 Meta 가 따로 쓴 Llama 4 Community License 를 따릅니다. 서비스에 붙이기 전에는 그 원문을 읽습니다.

표의 크기 칸은 파라미터 수입니다. 파라미터는 가중치 숫자 하나하나이고, B 는 10억입니다. 「35B 중 3B」는 35B 를 다 갖고 있되, 토큰 하나를 쓸 때 3B 만 계산한다는 뜻입니다. 이 3B 를 활성 파라미터라고 부르고, 2절에서 자세히 봅니다. thinking 칸은 답 앞의 풀이를 켜고 끌 수 있는지와 그 양을 정하는 법입니다.

상용 셋은 크기를 문서에 적지 않아서 그 칸은 「문서에 없음」입니다. 컨텍스트 길이는 셋 다 100만 토큰 안팎으로 적었습니다. 공개 넷은 크기와 활성 파라미터를 모델 카드에 적었고, 컨텍스트 길이는 128K 에서 10M 까지입니다. K 는 약 1,000, M 은 약 100만입니다. Gemma 4 는 시스템 메시지 맨 앞에 `<|think|>` 표시를 넣어 thinking 을 켭니다. Llama 4 의 모델 카드에는 thinking 이야기가 없습니다.

같은 회사가 두 갈래를 다 내기도 합니다. Google 은 Gemini 를 API 로 열고, Gemma 는 가중치를 공개했습니다. 그래서 고를 때는 회사 이름보다 이 표의 칸을 봅니다. 요청에 담을 글이 회사 밖으로 나가도 되는지가 첫째 칸을 정하고, 나머지 칸은 2~4절의 숫자로 정합니다.

| 계열 | 어디서 도나 | 가중치를 받나 | 크기와 활성 파라미터 | 컨텍스트 길이 | thinking 지원 |
|---|---|---|---|---|---|
| Claude | Claude API, 클라우드 플랫폼 | 받지 않음 | 문서에 없음 | 지금 모델 넷 모두 1M 토큰 | 기본으로 켬, 끌 수 있는 것은 Claude Haiku 5.5, Sonnet 5.5 는 풀이 양이 high 단계 이하일 때 답 앞의 풀이만 끔 |
| GPT | OpenAI API | 받지 않음 | 문서에 없음 | 대표 모델 넷 모두 1.05M 토큰 | 풀이 양을 단계로 정함, 끄는 단계는 GPT-6.1 Terra, GPT-6 Luna 만 |
| Gemini | Gemini API | 받지 않음 | 문서에 없음 | Gemini 4 Argon 1,048,576 토큰 | 기본으로 켬, 양을 low 에서 high 로 정함 |
| Qwen3.5 | 직접 운영하는 서버, Alibaba Cloud API | 받음, Apache 2.0 | 27B, 35B 중 3B, 397B 중 17B | 262,144 토큰, 늘리면 1,010,000 | 기본으로 켬, 끌 수 있음 |
| Llama 4 | 직접 운영 | 받음, Llama 4 Community License | Scout 109B 중 17B, Maverick 400B 중 17B | Scout 10M, Maverick 1M 토큰 | 문서에 없음 |
| Gemma 4 | 직접 운영, 노트북, 휴대폰 | 받음, Apache 2.0 | E2B, E4B, 12B, 31B, 26B A4B 다섯, 26B A4B 는 25.2B 중 3.8B | E2B, E4B 는 128K, 나머지 셋 256K 토큰 | 시스템 메시지 첫머리의 표시로 켬 |
| DeepSeek-V4 | 직접 운영, DeepSeek API | 받음, MIT | Flash 284B 중 13B, Pro 1.6T 중 49B | 1M 토큰 | Non-think, Think High, Think Max 셋 |

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-model-selection-cards.html?embed=1&card=landscape" height="480" loading="lazy" title="상용 API 세 계열과 공개 가중치 네 계열"></iframe>
<a class="demo-embed-open" href="demo-model-selection-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 2. 크기, 활성 파라미터, 컨텍스트 길이

**크기는 가중치를 올릴 메모리를, 활성 파라미터는 토큰 하나를 쓰는 계산량을 정합니다. Gemma 4 의 26B A4B 는 25.2B 중 3.8B 만 계산하지만, 메모리는 31B 모델과 비슷하게 듭니다. 이 글의 요청은 qwen3.5:27b 의 컨텍스트 길이 262,144 토큰에 한참 못 미칩니다.**

이 블로그가 기록에 쓰는 qwen3.5:27b 부터 봅니다. `ollama show qwen3.5:27b` 를 돌리면 파라미터 27.4B, 컨텍스트 길이 262144, 양자화 nvfp4 가 찍힙니다. 양자화는 가중치 숫자 하나를 더 적은 비트로 줄여 적는 일이고, nvfp4 는 이 파일이 쓴 방식입니다. 27.4B 는 모델 카드의 27B 를 소수 한 자리까지 적은 값이고, 맥에 받은 파일은 19GB 입니다. 토큰을 쓰려면 가중치를 메모리에 올려야 하니, 파라미터 수와 비트 수가 메모리를 정합니다.

같은 27B 도 비트 수에 따라 크기가 다릅니다. Ollama 라이브러리에서 qwen3.5:27b 의 16비트 bf16 판은 56GB 입니다. 8비트 int8 판은 30GB, 4비트 int4 판은 16GB 입니다. 27.4B 에 16비트, 곧 2바이트를 곱하면 약 55GB 라 bf16 판의 크기와 가깝습니다. Gemma 문서는 파라미터와 비트가 많을수록 대개 더 잘하지만, 계산과 메모리와 전력이 더 든다고 적었습니다. 이 글의 기록은 nvfp4 판 하나로만 했습니다.

활성 파라미터가 전체보다 작은 모델은 MoE(Mixture of Experts) 구조입니다. 층마다 전문가(expert)라고 부르는 작은 신경망을 여럿 두고, 토큰마다 그중 몇 개만 골라 계산합니다. Gemma 4 의 26B A4B 는 전문가 128개 가운데 8개와 늘 쓰는 1개를 골라 25.2B 중 3.8B 를 계산합니다. 이름의 A4B 는 활성 파라미터가 약 4B 라는 뜻입니다. Gemma 문서는 그래서 이 모델이 26B 라는 전체 크기보다 훨씬 빨리 돈다고 적었습니다.

메모리는 전체 크기만큼 듭니다. Gemma 문서는 빠르게 전문가를 고르려면 26B 전부를 메모리에 올려야 한다고 적었습니다. 그래서 26B A4B 의 메모리는 4B 모델보다, 모든 파라미터를 계산에 쓰는 dense 26B 모델에 훨씬 가깝습니다. 같은 문서가 어림한 4비트 메모리는 26B A4B 가 14.4GB, dense 31B 가 17.5GB 입니다.

컨텍스트에는 프롬프트의 토큰과 모델이 쓴 답의 토큰이 같이 듭니다. 4절의 끈 답 20개는 입력이 68~111 토큰이라, 262,144 토큰의 상한에 한참 못 미칩니다. 긴 문서나 대화 기록을 통째로 넣는 요청에서 이 상한이 걸립니다. Gemma 문서는 프롬프트와 답의 토큰이 늘수록 가중치 위에 메모리가 더 든다고도 적었습니다.

그래서 직접 운영하는 서버에 올릴 모델은 메모리에 들어가는 크기부터 고릅니다. 활성 파라미터가 작은 MoE 모델은 토큰을 빨리 쓰지만, 메모리를 줄여 주지는 않습니다. 상용 API 는 크기가 문서에 없으니, 크기 대신 4절처럼 맞힘과 시간을 재서 견줍니다.

| 모델 | 전체 파라미터 | 활성 파라미터 | 가중치 크기 | 컨텍스트 길이 |
|---|---|---|---|---|
| Gemma 4 31B | 30.7B | 30.7B, 전부 | 4비트 17.5GB | 256K 토큰 |
| Gemma 4 26B A4B | 25.2B | 3.8B | 4비트 14.4GB | 256K 토큰 |
| qwen3.5:27b, 이 글의 기록 | 27.4B | 27.4B, 전부 | nvfp4 파일 19GB, int4 판 16GB | 262,144 토큰 |

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-model-selection-cards.html?embed=1&card=size" height="480" loading="lazy" title="전체 파라미터와 활성 파라미터, 메모리, 컨텍스트 길이"></iframe>
<a class="demo-embed-open" href="demo-model-selection-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 3. reasoning 과 thinking 은 답 앞의 풀이입니다

**thinking 을 켜면 모델은 답 앞에 풀이 토큰을 먼저 쓰고, 그 토큰도 출력 토큰으로 값을 냅니다. OpenAI 는 같은 풀이를 reasoning 토큰이라고 부릅니다. 켜고 끄는 필드는 Ollama 가 think, Claude 가 thinking 입니다. OpenAI 는 reasoning.effort, Gemini 는 thinking_level 로 풀이의 양을 정합니다.**

thinking 을 켜면 모델은 문제를 나눠 따지는 글을 먼저 쓰고 그 뒤에 답을 씁니다. Qwen3.5 의 모델 카드는 이 풀이가 `<think>` 와 `</think>` 사이에 먼저 나온다고 적었습니다. Ollama 는 둘을 나눠 풀이는 message 의 thinking 에, 답은 content 에 담습니다. 응답의 필드는 [LLM 호출 한 번](post.html?id=llm-first-call) 편에서 보았습니다. 이 블로그의 기록 도구는 풀이 글을 적지 않고 글자 수만 적습니다.

reasoning 은 같은 풀이를 부르는 다른 이름입니다. OpenAI 문서는 reasoning 모델이 답을 내기 전에 안에서 reasoning 토큰을 쓴다고 적었습니다. 강화 학습은 결과에 따라 보상을 주어 모델을 고치는 학습입니다. DeepSeek-R1 보고서는 강화 학습만으로 모델이 풀이 안에서 스스로 되짚고 검증하게 되었다고 적었습니다. 보고서는 수학과 코딩처럼 답을 맞춰 볼 수 있는 과제에서 성적이 올랐다고 적었습니다.

1절의 표에서도 한 모델이 두 모드를 다 갖는 계열이 여럿입니다. Qwen3 기술 보고서는 thinking 모드와 non-thinking 모드를 한 틀에 넣어, 모델을 바꾸지 않고 오가게 했다고 적었습니다. 같은 보고서는 풀이에 쓸 양을 정하는 thinking budget 도 두었다고 적었습니다. 그래서 요청마다 켜고 끄거나 양을 정하는 필드가 있고, 그 이름이 API 마다 다릅니다.

아래 표는 이 글이 본 네 곳의 필드입니다. Ollama 의 think 는 true 와 false 를 받습니다. gpt-oss 처럼 low, medium, high 같은 이름을 받는 모델도 있습니다. Claude 의 지금 모델 넷은 thinking.type 의 기본값이 adaptive 라 풀이의 양을 모델이 정합니다. 끄는 값 disabled 는 Haiku 5.5 만 받고, effort 가 high 이하일 때입니다. effort 는 풀이를 포함해 응답에 들이는 양을 정하는 단계이고, output_config 안에 둡니다. Sonnet 5.5 는 disabled 대신 between_tools 를 받아 답 앞의 풀이만 끕니다. 이것도 effort 가 high 이하일 때입니다. OpenAI 와 Gemini 도 켜고 끄기보다 풀이의 양을 단계로 정합니다.

어느 쪽이든 풀이 토큰은 출력 토큰으로 값을 냅니다. Claude 문서는 풀이 글을 돌려주지 않아도 풀이에 쓴 토큰은 출력 토큰으로 값을 낸다고 적었습니다. OpenAI 문서도 reasoning 토큰은 API 에 보이지 않지만 출력 토큰으로 값을 낸다고 적었습니다. Gemini 문서는 thinking 을 켜면 출력 토큰과 thinking 토큰을 더해 값을 매긴다고 적었습니다. 그래서 응답에는 풀이 토큰 수를 따로 적은 필드가 있습니다. Ollama 의 응답에는 그런 필드가 따로 없습니다. 이 기록에서는 풀이 토큰이 출력 토큰 수 eval_count 에 같이 들어, p11 의 출력 토큰이 끄면 8개, 켜면 583개였습니다.

풀이가 맞힘을 늘리는지는 문제에 달려 있습니다. 지난 편의 캠페인 한 줄은 thinking 을 켜도 답이 같았습니다. [컨텍스추얼 타겟팅](post.html?id=contextual-targeting) 편에서는 제목과 첫 문단이 다른 지면에 thinking 을 켜자 라벨이 제목 쪽으로 바뀌었습니다. 4절은 숫자 문제 20개로 같은 것을 봅니다.

| 어디서 | 켜고 끄는 필드 | 받는 값 | 풀이 토큰 수를 보는 곳 |
|---|---|---|---|
| Ollama `/api/chat` | think | true, false, 모델이 정한 이름 | 따로 없음, 이 기록에서는 eval_count 에 같이 듦 |
| Claude Messages API | thinking.type, output_config.effort | adaptive, disabled 와 effort 단계 | usage 의 output_tokens_details.thinking_tokens |
| OpenAI Responses API | reasoning.effort | none 에서 max 까지, 모델마다 다름 | usage 의 output_tokens_details.reasoning_tokens |
| Gemini API | thinking_level | minimal 에서 high 까지, 모델마다 다름 | usage 의 total_thought_tokens |

## 4. 같은 문제 20개에 thinking 을 켜고 끄면

**thinking 을 끈 답은 20개 중 14개를 맞혔습니다. 한 단계 문제 10개(easy)는 모두 맞았고, 두세 단계 문제 10개(hard)는 4개였습니다. hard 10개에 thinking 을 켜자 10개가 모두 맞았고, 출력 토큰은 83개에서 7,713개로 92.9배가 되었습니다. 시간은 11.3초에서 493.4초로 43.6배입니다.**

문제 20개는 광고 운영에서 자주 나오는 계산입니다. 노출 가운데 클릭의 비율인 클릭률처럼 한 단계로 푸는 문제가 easy 10개입니다. 클릭 가운데 구매 같은 전환이 일어난 비율은 전환율이라고 부릅니다. 예산을 클릭당 비용으로 나눈 뒤 전환율을 곱하는 것처럼 두세 단계로 푸는 문제가 hard 10개입니다. 답은 모두 단위 없는 정수이고, 블록의 PROBLEMS 에 문제와 정답이 같이 들어 있습니다.

시스템 메시지는 「문제를 읽고 정수 답 하나를 JSON {"answer": 정수} 로만 답한다. 설명을 쓰지 않는다.」 두 문장입니다. JSON 은 이름과 값의 짝을 중괄호로 묶어 적는 꼴입니다. 사용자 메시지는 「문제: 」 뒤에 문제 한 줄을 붙인 글입니다. 20개 모두 thinking 을 끄고 temperature 0 과 seed 7 로 한 번씩 물었습니다. temperature 는 다음 토큰을 얼마나 흔들리게 뽑을지 정하는 값이고, seed 는 뽑을 때 쓰는 난수의 시작값입니다. [자연어 오디언스](post.html?id=natural-language-audience) 편과 [컨텍스추얼 타겟팅](post.html?id=contextual-targeting) 편에서 temperature 0 은 다시 기록해도 같은 답이 나왔습니다. 답이 같았다는 뜻이고, 글자까지 같았다는 뜻은 아닙니다. 그 차이는 [비용, 캐시, 비결정성](post.html?id=llm-cost-cache-nondeterminism) 편에서 봅니다. hard 10개는 thinking 만 켜서 한 번 더 물었습니다.

아래 블록은 답을 JSON 으로 읽고, answer 가 정수일 때만 답으로 칩니다. 꼴이 틀린 답은 읽지 못한 답으로 세고 틀린 답으로 칩니다. 틀린 답은 정답과 자릿수만 다른지도 같이 찍습니다. 키 p11|on|1 은 p11 을 thinking 을 켜고 받은 답입니다. 두 상수는 `--export-constant --with-usage` 가 찍은 줄 그대로입니다.

```python
# 하는 일: 문제 20개의 정답과 기록한 답 30개를 견주어 맞힌 수를 세고, hard 10개에서 thinking 을 끈 답과 켠 답의 맞힌 수, 출력 토큰, 시간을 견준다.
# 기록 data/llm-records/llm-model-selection.json 에서 옮김
import json

# 1단계: 문제 20개와 기록을 둔다
# PROBLEMS 는 광고 운영 숫자 문제 20개다. 값은 가상 데이터이고 answer 는 단위 없는 정수다.
# p01~p10 은 한 단계로 푸는 easy, p11~p20 은 두세 단계로 푸는 hard 다.
# 키 p11 은 thinking 을 끄고 받은 답이고, p11|on|1 은 같은 문제를 thinking 을 켜고 받은 답이다.
# USAGE 의 네 값은 차례대로 prompt_tokens, output_tokens, elapsed_ms, thinking_chars 다.
PROBLEMS = [
    {"id": "p01", "question": "노출 120,000건에서 클릭이 3,600건이면 클릭률은 몇 %인가?", "answer": 3, "level": "easy"},
    {"id": "p02", "question": "노출 120,000건에서 클릭률이 1.2%이면 클릭은 몇 건인가?", "answer": 1440, "level": "easy"},
    {"id": "p03", "question": "클릭 2,500건에서 전환이 100건이면 전환율은 몇 %인가?", "answer": 4, "level": "easy"},
    {"id": "p04", "question": "광고비 600,000원으로 클릭 2,400건을 얻었다면 클릭당 비용은 몇 원인가?", "answer": 250, "level": "easy"},
    {"id": "p05", "question": "클릭 4,000건에서 전환율이 2.5%이면 전환은 몇 건인가?", "answer": 100, "level": "easy"},
    {"id": "p06", "question": "노출 1,000건당 비용(CPM)이 4,000원이면 노출 50,000건의 광고비는 몇 원인가?", "answer": 200000, "level": "easy"},
    {"id": "p07", "question": "하루 예산 300만 원 중 120만 원을 썼다면 소진율은 몇 %인가?", "answer": 40, "level": "easy"},
    {"id": "p08", "question": "하루 예산이 300만 원이고 구매 건당 2만 원을 쓴다면 하루 구매는 최대 몇 건인가?", "answer": 150, "level": "easy"},
    {"id": "p09", "question": "광고비 500,000원으로 매출 2,000,000원이 났다면 ROAS(광고비 대비 매출 비율)는 몇 %인가?", "answer": 400, "level": "easy"},
    {"id": "p10", "question": "노출 1,000건당 클릭이 12건이고 클릭당 입찰가가 250원이면 노출 1,000건당 기대 수익은 몇 원인가?", "answer": 3000, "level": "easy"},
    {"id": "p11", "question": "하루 예산 300만 원을 클릭당 250원으로 모두 쓰고 전환율이 2%이면 하루 전환은 몇 건인가?", "answer": 240, "level": "hard"},
    {"id": "p12", "question": "노출 384,000건에서 클릭률이 0.75%이고 클릭당 비용이 320원이면 광고비는 몇 원인가?", "answer": 921600, "level": "hard"},
    {"id": "p13", "question": "광고비 1,260,000원으로 클릭 4,200건을 얻었고 전환율이 2.5%이면 전환 건당 비용은 몇 원인가?", "answer": 12000, "level": "hard"},
    {"id": "p14", "question": "하루 예산 300만 원 중 오전에 1,375,000원을 썼다. 남은 예산을 클릭당 325원에 모두 쓰면 클릭을 몇 건 더 얻는가?", "answer": 5000, "level": "hard"},
    {"id": "p15", "question": "노출 1,000,000건이 있고 pCTR(노출 대비 클릭 확률)은 1.2%, pCVR(클릭 대비 전환 확률)은 3.0%이다. 예상 전환은 몇 건인가?", "answer": 360, "level": "hard"},
    {"id": "p16", "question": "하루 예산 300만 원을 CPM(노출 1,000건당 비용) 6,250원으로 모두 쓴다. 클릭률이 1.2%, 전환율이 2.5%이면 하루 전환은 몇 건인가?", "answer": 144, "level": "hard"},
    {"id": "p17", "question": "하루 예산 300만 원 중 62%를 오후에 쓴다. 오후 클릭당 비용이 310원, 전환율이 1.5%이면 오후 전환은 몇 건인가?", "answer": 90, "level": "hard"},
    {"id": "p18", "question": "pCTR(노출 대비 클릭 확률)은 1.2%, pCVR(클릭 대비 전환 확률)은 3.0%이다. 구매 건당 입찰가가 2만 원이면 노출 1,000건당 기대 수익(eCPM)은 몇 원인가?", "answer": 7200, "level": "hard"},
    {"id": "p19", "question": "회원 72,000명에게 평균 4.5건씩 노출했다. 클릭률이 0.8%, 클릭당 비용이 210원이면 광고비는 몇 원인가?", "answer": 544320, "level": "hard"},
    {"id": "p20", "question": "구매 건당 매출이 12만 원이고 전환율이 3.0%이다. 목표 ROAS(광고비 대비 매출 비율)가 400%이면 클릭당 비용의 상한은 몇 원인가?", "answer": 900, "level": "hard"}
]

RECORD = {"p01": "{\"answer\": 3}", "p02": "{\"answer\": 1440}", "p03": "{\"answer\": 4}", "p04": "{\"answer\": 250}", "p05": "{\"answer\": 100}", "p06": "{\"answer\": 200000}", "p07": "{\"answer\": 40}", "p08": "{\"answer\": 150}", "p09": "{\"answer\": 400}", "p10": "{\"answer\": 3000}", "p11": "{\"answer\": 240}", "p11|on|1": "{\"answer\": 240}", "p12": "{\"answer\": 9216}", "p12|on|1": "{\"answer\": 921600}", "p13": "{\"answer\": 120}", "p13|on|1": "{\"answer\": 12000}", "p14": "{\"answer\": 4687}", "p14|on|1": "{\"answer\": 5000}", "p15": "{\"answer\": 36}", "p15|on|1": "{\"answer\": 360}", "p16": "{\"answer\": 144}", "p16|on|1": "{\"answer\": 144}", "p17": "{\"answer\": 90}", "p17|on|1": "{\"answer\": 90}", "p18": "{\"answer\": 720}", "p18|on|1": "{\"answer\": 7200}", "p19": "{\"answer\": 529200}", "p19|on|1": "{\"answer\": 544320}", "p20": "{\"answer\": 900}", "p20|on|1": "{\"answer\": 900}"}
USAGE = {"p01": [72, 6, 1103, 0], "p02": [70, 9, 1289, 0], "p03": [68, 6, 921, 0], "p04": [75, 8, 1037, 0], "p05": [68, 8, 863, 0], "p06": [82, 11, 1233, 0], "p07": [69, 7, 794, 0], "p08": [72, 8, 1056, 0], "p09": [85, 8, 1049, 0], "p10": [88, 9, 1115, 0], "p11": [75, 8, 1441, 0], "p11|on|1": [73, 583, 37408, 1459], "p12": [81, 9, 1113, 0], "p12|on|1": [79, 820, 52498, 1770], "p13": [85, 8, 1054, 0], "p13|on|1": [83, 827, 52832, 1858], "p14": [91, 9, 1119, 0], "p14|on|1": [89, 633, 40501, 1441], "p15": [101, 7, 997, 0], "p15|on|1": [99, 509, 32916, 1205], "p16": [101, 8, 1056, 0], "p16|on|1": [99, 1085, 69584, 2528], "p17": [96, 7, 989, 0], "p17|on|1": [94, 806, 51349, 2079], "p18": [111, 8, 1235, 0], "p18|on|1": [109, 980, 62347, 2460], "p19": [88, 11, 1244, 0], "p19|on|1": [86, 746, 47692, 1824], "p20": [93, 8, 1057, 0], "p20|on|1": [91, 724, 46248, 2020]}

# 2단계: 답을 정수로 읽고 thinking 을 끈 20개를 채점한다
# JSON 객체이고 키가 answer 하나이며 값이 정수일 때만 읽은 답이다. 그 밖은 읽지 못한 답으로 세고 틀린 답으로 친다.
# 틀린 답은 정답과 자릿수만 다른지(10배, 100배, 1,000배) 함께 찍는다.
ANSWER = {p['id']: p['answer'] for p in PROBLEMS}
LEVEL = {p['id']: p['level'] for p in PROBLEMS}


def read(text):
    try:
        obj = json.loads(text)
    except ValueError:
        return None
    if not isinstance(obj, dict) or list(obj) != ['answer'] or type(obj['answer']) is not int:
        return None                            # 3.0 같은 실수, "240" 같은 글자, true 는 정수가 아니다
    return obj['answer']


def digits_only(answer, value):
    big, small = max(answer, value), min(answer, value)
    if small > 0 and big % small == 0 and big // small in (10, 100, 1000):
        return big // small
    return 0


got = {key: read(text) for key, text in RECORD.items()}
right = {key: got[key] == ANSWER[key.split('|')[0]] for key in RECORD}
off = list(ANSWER)
groups = {'easy 10개': [i for i in off if LEVEL[i] == 'easy'], 'hard 10개': [i for i in off if LEVEL[i] == 'hard'], '20개': off}
print(f'기록 {len(RECORD)}개, 읽지 못한 답 {sum(v is None for v in got.values())}개')
print(f'끈 답 20개의 입력 {min(USAGE[i][0] for i in off)}~{max(USAGE[i][0] for i in off)} 토큰, '
      f'출력 {min(USAGE[i][1] for i in off)}~{max(USAGE[i][1] for i in off)} 토큰')
for name, ids in groups.items():
    hits = sum(right[i] for i in ids)
    print(f'thinking 끔 {name}: 맞힘 {hits}개 ({hits / len(ids):.0%})')
for i in off:
    v = got[i]
    if right[i]:
        continue
    if v is None:
        print(f'틀림 {i}: 정답 {ANSWER[i]:,}, 읽지 못한 답 {RECORD[i]}')
        continue
    k = digits_only(ANSWER[i], v)
    if not k:
        note = '자릿수 말고도 다름'
    elif v < ANSWER[i]:
        note = f'자릿수만 다름, 정답의 1/{k}'
    else:
        note = f'자릿수만 다름, 정답의 {k}배'
    print(f'틀림 {i}: 정답 {ANSWER[i]:,}, 답 {v:,} ({note})')

# 3단계: hard 10개를 thinking 을 켠 답과 견준다
# 같은 문제를 think 필드 하나만 바꿔 두 번 물었다. 켠 답의 출력 토큰에는 풀이의 토큰도 들어 있다.
# 끝의 두 줄은 늘어난 맞힘 하나에 든 출력 토큰과, easy 는 끈 답, hard 는 켠 답으로 둔 20개다.
hard = groups['hard 10개']
mark = {True: '맞음', False: '틀림'}
for i in hard:
    a, b = USAGE[i], USAGE[i + '|on|1']
    print(f'{i}: 끔 {mark[right[i]]}, 켬 {mark[right[i + "|on|1"]]}, 출력 토큰 {a[1]} -> {b[1]:,}, '
          f'{a[2] / 1000:.1f}초 -> {b[2] / 1000:.1f}초')
total = {}
for name, keys in (('끔', hard), ('켬', [i + '|on|1' for i in hard])):
    hits = sum(right[k] for k in keys)
    out, ms, chars = (sum(USAGE[k][j] for k in keys) for j in (1, 2, 3))
    total[name] = (hits, out, ms)
    print(f'hard 10개 thinking {name}: 맞힘 {hits}개, 출력 토큰 {out:,}개, {ms / 1000:.1f}초, 풀이 {chars:,}자')
(h0, o0, m0), (h1, o1, m1) = total['끔'], total['켬']
print(f'켜면 맞힘 {h0}개 -> {h1}개, 출력 토큰 {o1 / o0:.1f}배, 시간 {m1 / m0:.1f}배')
if h1 > h0:
    print(f'더 맞힌 {h1 - h0}개에 출력 토큰 {o1 - o0:,}개를 더 썼다. 하나에 {(o1 - o0) / (h1 - h0):,.0f}개')
mix = [i if LEVEL[i] == 'easy' else i + '|on|1' for i in off]
print(f'easy 는 끈 답, hard 는 켠 답으로 두면 20개 중 맞힘 {sum(right[k] for k in mix)}개, '
      f'출력 토큰 {sum(USAGE[i][1] for i in off):,}개 -> {sum(USAGE[k][1] for k in mix):,}개')

# 출력:
# 2단계 뜻: 30개 모두 정수 JSON 으로 읽혔다. 끈 답은 easy 10개를 모두, hard 는 4개만 맞혔고, 틀린 6개 중 4개는 자릿수만 다르다.
# 기록 30개, 읽지 못한 답 0개
# 끈 답 20개의 입력 68~111 토큰, 출력 6~11 토큰
# thinking 끔 easy 10개: 맞힘 10개 (100%)
# thinking 끔 hard 10개: 맞힘 4개 (40%)
# thinking 끔 20개: 맞힘 14개 (70%)
# 틀림 p12: 정답 921,600, 답 9,216 (자릿수만 다름, 정답의 1/100)
# 틀림 p13: 정답 12,000, 답 120 (자릿수만 다름, 정답의 1/100)
# 틀림 p14: 정답 5,000, 답 4,687 (자릿수 말고도 다름)
# 틀림 p15: 정답 360, 답 36 (자릿수만 다름, 정답의 1/10)
# 틀림 p18: 정답 7,200, 답 720 (자릿수만 다름, 정답의 1/10)
# 틀림 p19: 정답 544,320, 답 529,200 (자릿수 말고도 다름)
# 3단계 뜻: thinking 을 켠 hard 10개는 모두 맞았다. 출력 토큰은 92.9배, 시간은 43.6배가 되었다.
# p11: 끔 맞음, 켬 맞음, 출력 토큰 8 -> 583, 1.4초 -> 37.4초
# p12: 끔 틀림, 켬 맞음, 출력 토큰 9 -> 820, 1.1초 -> 52.5초
# p13: 끔 틀림, 켬 맞음, 출력 토큰 8 -> 827, 1.1초 -> 52.8초
# p14: 끔 틀림, 켬 맞음, 출력 토큰 9 -> 633, 1.1초 -> 40.5초
# p15: 끔 틀림, 켬 맞음, 출력 토큰 7 -> 509, 1.0초 -> 32.9초
# p16: 끔 맞음, 켬 맞음, 출력 토큰 8 -> 1,085, 1.1초 -> 69.6초
# p17: 끔 맞음, 켬 맞음, 출력 토큰 7 -> 806, 1.0초 -> 51.3초
# p18: 끔 틀림, 켬 맞음, 출력 토큰 8 -> 980, 1.2초 -> 62.3초
# p19: 끔 틀림, 켬 맞음, 출력 토큰 11 -> 746, 1.2초 -> 47.7초
# p20: 끔 맞음, 켬 맞음, 출력 토큰 8 -> 724, 1.1초 -> 46.2초
# hard 10개 thinking 끔: 맞힘 4개, 출력 토큰 83개, 11.3초, 풀이 0자
# hard 10개 thinking 켬: 맞힘 10개, 출력 토큰 7,713개, 493.4초, 풀이 18,644자
# 켜면 맞힘 4개 -> 10개, 출력 토큰 92.9배, 시간 43.6배
# 더 맞힌 6개에 출력 토큰 7,630개를 더 썼다. 하나에 1,272개
# easy 는 끈 답, hard 는 켠 답으로 두면 20개 중 맞힘 20개, 출력 토큰 163개 -> 7,793개
```

30개 모두 정수 JSON 으로 읽혀서 읽지 못한 답은 없습니다. thinking 을 끈 답은 easy 10개를 모두 맞혔고, hard 는 10개 중 4개만 맞혔습니다. 틀린 6개 가운데 4개는 정답과 자릿수만 달라서, 답이 정답의 1/10 이나 1/100 이었습니다. p13 은 전환 건당 비용 12,000원을 120원으로 답했습니다. 왜 그렇게 셌는지는 답 한 줄에 적혀 있지 않습니다.

hard 10개에 thinking 을 켜자 10개가 모두 맞았습니다. 끈 답이 틀린 6개가 모두 정답으로 바뀌었고, 맞았던 4개는 그대로 맞았습니다. 대신 출력 토큰은 83개에서 7,713개로, 시간은 11.3초에서 493.4초로 늘었습니다. 문제 하나에 32.9초에서 69.6초가 걸렸고, 풀이는 모두 18,644자였습니다.

더 맞힌 6개에 출력 토큰 7,630개를 더 썼으니, 맞힘 하나에 1,272개를 쓴 셈입니다. easy 는 끈 답, hard 는 켠 답으로 두면 20개를 모두 맞히고, 출력 토큰은 163개에서 7,793개가 됩니다. 다만 이 기록은 한 모델에 문제 20개를 한 번씩 물은 결과입니다. 다른 모델이나 다른 문제에서도 thinking 이 이만큼 맞힘을 늘린다고 말할 수는 없습니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-model-selection-cards.html?embed=1&card=thinking" height="480" loading="lazy" title="hard 10개의 thinking 끔과 켬, 맞힘과 출력 토큰과 시간"></iframe>
<a class="demo-embed-open" href="demo-model-selection-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 5. 요청 한 건과 하루 100만 건의 값

**가상 단가로 요청 한 건(입력 1,200 토큰, 출력 150 토큰)을 세면 작은 모델 0.72원, 큰 모델 7.80원입니다. 하루 100만 요청이면 72만 원과 780만 원입니다. 시스템 메시지 1,000 토큰을 캐시에서 읽으면 큰 모델도 하루 420만 원입니다.**

상용 API 는 100만 토큰당 단가로 값을 매기고, 입력 단가와 출력 단가를 따로 둡니다. 요청 한 건의 값은 입력 토큰에 입력 단가를, 출력 토큰에 출력 단가를 곱해 더한 것입니다. 실제 단가는 [Anthropic](https://platform.claude.com/docs/en/about-claude/pricing), [OpenAI](https://developers.openai.com/api/docs/pricing), [Google](https://aistudio.google.com/docs/pricing) 의 가격 문서에 있습니다. 이 절의 단가는 가상 값이고, 작은 모델과 큰 모델 둘로 둡니다.

요청 한 건은 시스템 메시지 1,000 토큰과 사용자 메시지 200 토큰을 읽고 150 토큰을 쓴다고 둡니다. 시스템 메시지는 요청마다 같은 글이라, 앞 요청의 계산을 캐시에 남겨 두면 다시 계산하지 않아도 됩니다. 이 절은 캐시에서 읽은 토큰을 입력 단가의 0.1배로 셉니다. 실제 비율과 캐시에 처음 쓰는 토큰의 값은 API 마다 가격 문서에 따로 있습니다.

```python
# 하는 일: 100만 토큰당 단가로 요청 한 건의 값을 세고, 하루 100만 요청의 값을 작은 모델, 큰 모델, 시스템 메시지를 캐시에서 읽는 큰 모델로 견준다.

# 1단계: 요청 한 건의 값을 세는 함수를 둔다
# 단가 price_in, price_out 은 100만 토큰당 원이다. in_tokens 는 캐시에서 읽은 토큰까지 센 입력 토큰 전부다.
# 그 가운데 cached_tokens 만큼은 입력 단가의 0.1배로 센다. 나머지 입력과 출력은 단가 그대로다.
def cost_won(in_tokens, out_tokens, price_in, price_out, cached_tokens=0):
    fresh = in_tokens - cached_tokens
    return (fresh * price_in + cached_tokens * price_in * 0.1 + out_tokens * price_out) / 1_000_000


# 2단계: 가상 단가와 요청 한 건의 토큰을 둔다
# 단가는 설명을 위해 정한 가상 값이다. 실제 단가는 회사마다 가격 문서에 있고, 모델마다 다르다.
# 요청 한 건은 시스템 메시지 1,000 토큰과 사용자 메시지 200 토큰을 읽고 150 토큰을 쓴다.
PRICES = {'작은 모델': (400, 1_600), '큰 모델': (4_000, 20_000)}
SYSTEM, USER, OUT = 1_000, 200, 150
DAILY = 1_000_000
for model, (price_in, price_out) in PRICES.items():
    print(f'{model} 단가: 100만 토큰당 입력 {price_in:,}원, 출력 {price_out:,}원')
print(f'요청 한 건: 입력 {SYSTEM + USER:,} 토큰 (시스템 {SYSTEM:,} + 사용자 {USER}), 출력 {OUT} 토큰, 하루 {DAILY:,}건')

# 3단계: 세 경우의 요청 한 건과 하루 값을 센다
# 셋째 경우는 요청마다 같은 시스템 메시지 1,000 토큰을 캐시에서 읽는다. 사용자 메시지와 출력은 그대로다.
cases = [('작은 모델', '작은 모델', 0), ('큰 모델', '큰 모델', 0), ('큰 모델 + 시스템 캐시', '큰 모델', SYSTEM)]
daily = {}
for name, model, cached_tokens in cases:
    price_in, price_out = PRICES[model]
    one = cost_won(SYSTEM + USER, OUT, price_in, price_out, cached_tokens)
    part_in = cost_won(SYSTEM + USER, 0, price_in, price_out, cached_tokens)
    daily[name] = round(cost_won((SYSTEM + USER) * DAILY, OUT * DAILY, price_in, price_out, cached_tokens * DAILY))
    print(f'{name}: 한 건 {one:.2f}원 (입력 {part_in:.2f}원, 출력 {one - part_in:.2f}원), 하루 {daily[name]:,}원')

# 4단계: 세 값을 견준다
# 출력은 토큰 수로는 작지만 단가가 입력의 4~5배라 값에서 차지하는 몫이 크다.
small, large, cached = daily['작은 모델'], daily['큰 모델'], daily['큰 모델 + 시스템 캐시']
print(f'큰 모델은 작은 모델의 {large / small:.1f}배')
print(f'캐시를 쓰면 큰 모델의 하루 값이 {large - cached:,}원 줄어 {cached / large:.0%} 가 된다')
out_share = cost_won(0, OUT, *PRICES['큰 모델']) / cost_won(SYSTEM + USER, OUT, *PRICES['큰 모델'])
print(f'큰 모델에서 출력은 토큰 수의 {OUT / (SYSTEM + USER + OUT):.0%} 인데 값의 {out_share:.0%} 다')

# 출력:
# 2단계 뜻: 가상 단가 둘과 요청 한 건의 토큰이다.
# 작은 모델 단가: 100만 토큰당 입력 400원, 출력 1,600원
# 큰 모델 단가: 100만 토큰당 입력 4,000원, 출력 20,000원
# 요청 한 건: 입력 1,200 토큰 (시스템 1,000 + 사용자 200), 출력 150 토큰, 하루 1,000,000건
# 3단계 뜻: 하루 100만 요청이면 작은 모델 720,000원, 큰 모델 7,800,000원, 캐시를 쓴 큰 모델 4,200,000원이다.
# 작은 모델: 한 건 0.72원 (입력 0.48원, 출력 0.24원), 하루 720,000원
# 큰 모델: 한 건 7.80원 (입력 4.80원, 출력 3.00원), 하루 7,800,000원
# 큰 모델 + 시스템 캐시: 한 건 4.20원 (입력 1.20원, 출력 3.00원), 하루 4,200,000원
# 4단계 뜻: 큰 모델은 작은 모델의 10.8배이고, 캐시는 큰 모델을 54% 로 줄인다. 출력은 토큰 수의 11% 인데 값의 38% 다.
# 큰 모델은 작은 모델의 10.8배
# 캐시를 쓰면 큰 모델의 하루 값이 3,600,000원 줄어 54% 가 된다
# 큰 모델에서 출력은 토큰 수의 11% 인데 값의 38% 다
```

작은 모델은 한 건 0.72원, 하루 72만 원이고, 큰 모델은 한 건 7.80원, 하루 780만 원입니다. 큰 모델의 입력 단가는 작은 모델의 10배, 출력 단가는 12.5배라 하루 값은 10.8배입니다. 같은 요청인데 모델 하나를 바꾸면 하루 값이 열 배 넘게 달라집니다.

큰 모델에서 출력 150 토큰은 토큰 수로 11% 인데 값으로는 38% 입니다. 출력 단가가 입력 단가의 5배이기 때문입니다. thinking 을 켜면 이 출력 쪽에 풀이 토큰이 붙습니다. 4절의 hard 10개처럼 출력 토큰이 92.9배가 되면, 값에서 출력이 차지하는 몫은 더 커집니다.

캐시를 쓰면 큰 모델의 하루 값이 360만 원 줄어 420만 원, 원래의 54% 가 됩니다. 요청마다 같은 1,000 토큰을 입력 단가의 0.1배로 읽기 때문입니다. Anthropic 의 문서는 캐시가 프롬프트의 앞부분이 같을 때 맞는다고 적었습니다. 그래서 요청마다 같은 시스템 메시지를 앞에 두고, 바뀌는 사용자 메시지를 그 뒤에 둡니다.

그래서 단가표만으로는 하루 값이 나오지 않습니다. 요청 한 건의 입력과 출력 토큰, thinking 이 붙이는 풀이 토큰, 캐시에서 읽는 몫을 같이 세어야 합니다. 지훈 씨가 서비스 모델을 고를 때 맞힘 옆에 놓는 숫자가 이 셈입니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-model-selection-cards.html?embed=1&card=cost" height="480" loading="lazy" title="요청 한 건과 하루 100만 요청의 값, 세 경우"></iframe>
<a class="demo-embed-open" href="demo-model-selection-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 6. 지훈 씨의 선택: 기록에는 공개 모델, 서비스는 숫자로 정합니다

**지훈 씨는 글과 실험의 기록을 노트북의 공개 모델로 계속하기로 했습니다. 요청이 맥 밖으로 나가지 않고, 같은 설정으로 다시 물어 숫자를 맞춰 볼 수 있기 때문입니다. 서비스에 붙일 모델은 같은 문제 20개로 잰 맞힘과 토큰, 시간, 하루 값을 나란히 놓고 고릅니다.**

선배의 목록으로 돌아가 지훈 씨가 먼저 정한 것은 첫째 칸입니다. 광고주의 질문에는 예산과 단가 같은 광고주의 자료가 들어 있습니다. 공개 가중치 모델을 회사 안 서버에 띄우면 그 글이 회사 밖으로 나가지 않습니다. 상용 API 로 보내면 글은 API 를 연 회사의 서버로 갑니다.

기록은 노트북의 qwen3.5:27b 로 계속합니다. 같은 모델을 같은 설정으로 다시 부를 수 있어서, 글의 숫자를 다시 맞춰 볼 수 있습니다. 다만 컨텍스추얼 타겟팅 편에서 다시 기록해 보니 thinking 을 켠 답은 풀이의 길이가 달라지기도 했습니다. 그래서 켠 답의 토큰과 시간은 한 번 기록한 값으로 읽습니다. 요청마다 내는 값은 없지만, hard 10개에 thinking 을 켠 답이 493.4초를 쓴 것처럼 시간과 기계가 듭니다.

서비스 모델은 같은 문제 20개를 후보마다 보내 숫자로 고릅니다. 남이 잰 점수보다 서비스가 답할 문제에서 맞힌 수가 먼저입니다. 4절에서 같은 모델이 easy 는 10개, hard 는 4개를 맞혔듯, 맞히는 수는 문제 묶음에 따라 다릅니다. 상용 API 는 크기가 문서에 없으니 이렇게 잰 숫자로 견줍니다.

thinking 은 어려운 문제에만 켭니다. 이 기록에서 hard 10개는 켜면 6개를 더 맞혔지만, 문제 하나에 32.9초에서 69.6초가 걸렸습니다. 화면에서 그만큼 기다리게 할지는 화면을 만드는 쪽과 함께 정합니다. 어느 질문이 어려운지 미리 나누는 규칙은 이 기록으로 재지 않았습니다.

값은 5절의 셈으로 봅니다. 작은 모델이 이 문제들을 충분히 맞히면 하루 72만 원이면 됩니다. 큰 모델이 꼭 필요하면 시스템 메시지를 캐시에서 읽어 780만 원을 420만 원으로 줄입니다.

| 고를 것 | 이 글에서 본 값 | 지훈 씨의 선택 |
|---|---|---|
| 어디서 도나 | 공개 가중치는 회사 안 서버, 상용 API 는 회사 밖 서버 | 기록은 노트북의 qwen3.5:27b |
| 크기와 메모리 | qwen3.5:27b 27.4B, 파일 19GB | 노트북 메모리에 들어가는 크기 |
| 컨텍스트 길이 | 끈 답의 입력 68~111 토큰, 상한 262,144 | 이 문제들에는 걸리지 않음 |
| 맞힘 | 끈 답 easy 10개, hard 4개 | 후보마다 같은 문제 20개로 잼 |
| thinking | hard 맞힘 4개에서 10개, 시간 43.6배 | 어려운 문제에만 켬 |
| 값 | 하루 72만, 780만, 캐시로 420만 원 | 맞힘이 같으면 작은 모델 |

## 7. 두 무대에서 모델을 부르는 자리

**모델을 고르는 네 가지는 두 무대가 같습니다. 다른 것은 답을 기다릴 수 있는 시간과, 요청에 담는 글이 누구의 자료인지입니다.**

### 담장 안은 캠페인 화면에서 답을 기다릴 수 있습니다 [무대: 닫힌 생태계]

한 회사가 서비스와 광고 서버를 다 가진 곳을 담장 안이라고 부릅니다. 광고주가 캠페인 화면에서 숫자를 물으면 답은 사람에게 가니, thinking 을 끈 답의 1초 안팎은 기다릴 수 있습니다. 켠 답의 32.9초에서 69.6초는 화면에서 길어서, 계산은 코드에 맡기고 모델은 질문을 식으로 옮기게 하는 길도 있습니다. 광고주의 예산과 단가는 회사 안 자료라, 회사 안 서버의 공개 모델로 부르면 밖으로 나가지 않습니다.

### 열린 RTB 에서는 입찰 요청마다 모델을 부를 수 없습니다 [무대: 열린 RTB]

여러 회사가 실시간 경매로 남의 지면에 광고를 사고파는 곳을 열린 RTB 라고 부릅니다. 광고를 사는 쪽 시스템인 DSP 는 입찰 요청에 100ms 안팎으로 답해야 합니다. thinking 을 끈 답도 1초 안팎이 걸린 이 모델은 입찰 경로에 둘 수 없습니다. 그래서 LLM 은 캠페인 설정이나 지면 분류처럼 미리 할 수 있는 일에 씁니다. 그 일도 하루 100만 건이면 작은 모델 72만 원과 큰 모델 780만 원의 차이가 날마다 쌓입니다.

## 한눈 정리

| 자리 | 무엇 | 이 글의 값 |
|---|---|---|
| 어디서 도나 | 상용 API 는 만든 회사의 서버, 공개 가중치는 직접 운영하는 서버 | Claude, GPT, Gemini 와 Qwen, Llama, Gemma, DeepSeek |
| 크기 | 파라미터 수, 메모리를 정함 | qwen3.5:27b 27.4B, 파일 19GB |
| 활성 파라미터 | 토큰 하나를 쓸 때 계산하는 파라미터 | Gemma 4 26B A4B 는 25.2B 중 3.8B |
| 컨텍스트 길이 | 한 번에 둘 수 있는 토큰의 상한 | qwen3.5 262,144, 상용 셋 100만 토큰 안팎 |
| thinking | 답 앞의 풀이 토큰, 출력 토큰으로 값을 냄 | hard 10개 맞힘 4개에서 10개 |
| 출력 토큰과 시간 | 풀이까지 센 출력과 걸린 시간 | 83개에서 7,713개, 11.3초에서 493.4초 |
| 요청 값 | 100만 토큰당 단가 × 토큰 | 하루 72만, 780만, 캐시로 420만 원 |

## 헷갈리기 쉬운 점

- **파라미터 수와 활성 파라미터는 다른 숫자입니다.** 26B A4B 의 26B 는 메모리에 올리는 크기이고, 4B 는 토큰 하나를 쓸 때 계산하는 크기입니다. 그래서 활성 파라미터가 작은 MoE 모델도 메모리는 전체 크기만큼 듭니다. Gemma 문서의 4비트 값으로 26B A4B 는 14.4GB, dense 31B 는 17.5GB 입니다. Gemma 와 Qwen 은 모델 이름의 A 뒤에 활성 파라미터를 적습니다.
- **thinking 토큰은 출력 토큰으로 값을 냅니다.** 풀이 글이 응답에 보이지 않아도 값은 냅니다. Claude 의 지금 모델은 풀이 글을 기본으로 돌려주지 않고, OpenAI 의 reasoning 토큰도 API 에 보이지 않습니다. 그래도 두 문서 모두 그 토큰을 출력 토큰으로 값을 매긴다고 적었습니다. 이 글의 hard 10개에서 출력 토큰은 83개에서 7,713개가 되었습니다.
- **정답률은 문제 묶음에 달려 있습니다.** 같은 모델이 같은 설정으로 easy 10개는 모두, hard 10개는 4개만 맞혔습니다. 20개를 하나로 묶으면 70% 이지만, 묶음을 나누면 100% 와 40% 입니다. 남이 잰 점수표의 정답률도 그 문제 묶음의 값입니다. 그래서 모델은 실제로 풀 문제로 다시 잽니다.

## 더 깊이 보기

:::deep MoE 는 토큰마다 전문가 몇 개만 계산합니다
MoE 층에는 전문가가 여럿 있고, 토큰마다 그중 몇 개를 골라 계산합니다. 전문가 하나하나는 피드포워드 층, 곧 토큰 하나의 벡터에 가중치를 곱하고 더해 다음 층으로 넘기는 층입니다. Qwen3.5-35B-A3B 의 모델 카드는 전문가 256개 가운데 8개와 늘 쓰는 공유 전문가 1개를 쓴다고 적었습니다. 그래서 35B 를 갖고도 토큰 하나에는 3B 를 계산합니다. 같은 계열의 Qwen3.5-27B 는 층마다 MoE 대신 보통 피드포워드 층을 두어 27B 를 모두 계산합니다. Gemma 4 26B A4B 는 전문가 128개 가운데 8개와 공유 1개를 씁니다. DeepSeek-V4-Pro 는 1.6T 중 49B 를 계산합니다. Gemma 문서는 26B A4B 의 전문가 전부를 메모리에 올려야 한다고 적었습니다.
:::

:::deep 요청 한 건의 값을 세는 식
5절의 `cost_won` 은 아래 식을 그대로 옮긴 것입니다. $p_{in}$ 과 $p_{out}$ 은 100만 토큰당 단가입니다. $N_{in}$ 은 캐시에서 읽은 토큰 $N_{cache}$ 까지 센 입력 토큰 전부입니다.

$$\mathrm{cost} = \frac{(N_{in} - N_{cache})\,p_{in} + 0.1\,N_{cache}\,p_{in} + N_{out}\,p_{out}}{10^6}$$

셋째 경우를 넣으면 한 건이 4.2원이고, 하루 100만 요청이면 420만 원입니다.

$$\frac{200 \times 4000 + 0.1 \times 1000 \times 4000 + 150 \times 20000}{10^6} = 4.2$$

thinking 을 켜면 풀이 토큰이 $N_{out}$ 에 더해집니다. 실제 API 는 캐시에 처음 쓰는 토큰의 단가와 캐시가 남는 시간을 따로 정합니다. Anthropic 의 prompt caching 문서는 캐시가 5분이나 1시간 동안 남는다고 적었습니다.
:::

- [LLM 호출 한 번](post.html?id=llm-first-call) — 요청과 응답 JSON 의 필드를 읽은 19주째 편입니다.
- [컨텍스추얼 타겟팅](post.html?id=contextual-targeting) — 헷갈리는 지면에 thinking 을 켜자 라벨이 제목 쪽으로 바뀐 기록입니다.
- [자연어 오디언스](post.html?id=natural-language-audience) — thinking 을 켠 답이 불가 판정을 일부 지원으로 바꾼 기록입니다.
- [LLM 모델 고르기 카드 네 장](demo-model-selection-cards.html) — 이 글의 카드 전체입니다. 카드를 누르면 헷갈리는 것 하나가 더 나옵니다.

## 참고문헌

- Anthropic. *Models overview*. Claude API 문서. [platform.claude.com](https://platform.claude.com/docs/en/models/overview). 지금 모델 넷의 컨텍스트 길이 1M 토큰과 thinking 설정을 적었습니다.
- Anthropic. *Thinking*. Claude API 문서. [platform.claude.com](https://platform.claude.com/docs/en/build-with-claude/thinking). thinking.type 의 값과 모델마다 끌 수 있는지를 적었습니다. 풀이에 쓴 토큰은 출력 토큰으로 값을 낸다고 적었습니다.
- Anthropic. *Extended thinking*. Claude API 문서. [platform.claude.com](https://platform.claude.com/docs/en/build-with-claude/extended-thinking). type enabled 와 budget_tokens 로 켜는 예전 방식입니다. Claude 4.7 부터의 모델은 받지 않는다고 적었습니다.
- Anthropic. *Steering thinking*. Claude API 문서. [platform.claude.com](https://platform.claude.com/docs/en/build-with-claude/thinking-steering-and-cost). usage 의 output_tokens_details.thinking_tokens 를 적었습니다.
- Anthropic. *Prompt caching*. Claude API 문서. [platform.claude.com](https://platform.claude.com/docs/en/build-with-claude/prompt-caching). 캐시가 프롬프트의 앞부분 단위로 맞고, 5분이나 1시간 남는다고 적었습니다.
- OpenAI. *Models*. API 문서. [developers.openai.com](https://developers.openai.com/api/docs/models). 대표 모델 넷의 컨텍스트 길이 1.05M 과 reasoning 단계를 적었습니다.
- OpenAI. *Reasoning models*. API 문서. [developers.openai.com](https://developers.openai.com/api/docs/guides/reasoning). reasoning.effort 와 reasoning_effort 를 적었습니다. reasoning 토큰이 출력 토큰으로 값을 낸다고 적었습니다.
- Google. *Gemini 4 Argon*. Gemini API 문서. [aistudio.google.com](https://aistudio.google.com/docs/models/gemini-4-argon). 컨텍스트 길이 1,048,576 토큰과 thinking 단계를 적었습니다.
- Google. *Gemini thinking*. Gemini API 문서. [aistudio.google.com](https://aistudio.google.com/docs/thinking). thinking_level 과 total_thought_tokens 를 적었습니다. thinking 토큰도 값에 든다고 적었습니다.
- Qwen Team. *Qwen3.5-27B*. Hugging Face 모델 카드. [huggingface.co](https://huggingface.co/Qwen/Qwen3.5-27B). 27B, 컨텍스트 길이 262,144 토큰, thinking 을 끄는 법을 적었습니다.
- Qwen Team. *Qwen3.5-35B-A3B*, *Qwen3.5-397B-A17B*. Hugging Face 모델 카드. [35B-A3B](https://huggingface.co/Qwen/Qwen3.5-35B-A3B), [397B-A17B](https://huggingface.co/Qwen/Qwen3.5-397B-A17B). 전체와 활성 파라미터, 전문가 수를 적었습니다.
- An Yang et al. (2025). *Qwen3 Technical Report*. arXiv:2505.09388. [arxiv.org](https://arxiv.org/abs/2505.09388). thinking 모드와 non-thinking 모드를 한 모델에 둔 설계와 thinking budget 을 적었습니다.
- Meta. *Llama 4 Model Card*. GitHub 의 llama-models 저장소. [github.com](https://github.com/meta-llama/llama-models/blob/main/models/llama4/MODEL_CARD.md). Scout 와 Maverick 의 전체와 활성 파라미터, 컨텍스트 길이를 적었습니다.
- Google DeepMind. *Gemma 4 model card*. Gemma 문서. [ai.google.dev](https://ai.google.dev/gemma/docs/core/model_card_4). 다섯 크기의 파라미터와 컨텍스트 길이, thinking 을 켜는 표시를 적었습니다.
- Google DeepMind. *Gemma 4 model overview*. Gemma 문서. [ai.google.dev](https://ai.google.dev/gemma/docs/core). 비트 수마다 메모리를 어림한 표가 있습니다. MoE 도 전체를 메모리에 올린다고 적었습니다.
- DeepSeek-AI. *DeepSeek-V4*. Hugging Face 모델 카드. [huggingface.co](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro). Pro 와 Flash 의 전체와 활성 파라미터, 컨텍스트 길이, 풀이 모드 셋을 적었습니다.
- DeepSeek. *Thinking Mode*. API 문서. [api-docs.deepseek.com](https://api-docs.deepseek.com/guides/thinking_mode). thinking.type 으로 켜고 끄고 reasoning_effort 로 양을 정한다고 적었습니다.
- DeepSeek-AI (2025). *DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning*. arXiv:2501.12948. [arxiv.org](https://arxiv.org/abs/2501.12948). 강화 학습만으로 풀이를 쓰는 능력을 키운 모델을 적었습니다.
- Ollama. *Thinking*. Ollama 문서. [docs.ollama.com](https://docs.ollama.com/capabilities/thinking). think 필드가 받는 true, false, 이름 값을 적었습니다.
- Ollama. *qwen3.5 tags*. Ollama 라이브러리. [ollama.com](https://ollama.com/library/qwen3.5/tags). qwen3.5:27b 의 bf16, int8, int4 판 크기를 적었습니다.
