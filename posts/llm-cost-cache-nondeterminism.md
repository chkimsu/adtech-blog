모델 팀 27주째 월요일, 지훈 씨는 선배에게서 질문 하나를 받았습니다. 광고주 화면의 숫자 질문에 모델이 답하게 하면 하루에 얼마가 드느냐는 질문입니다. 지난주 [LLM-as-a-Judge](post.html?id=llm-as-a-judge) 편에서 채점을 모델에게 맡겨 본 다음입니다.

선배는 하루 100만 번 부른다고 치고 세어 오라고 했습니다. 지훈 씨는 7주 전 모델을 고르며 적어 둔 계산을 다시 꺼냈습니다. 그때는 모델마다 하루 값을 하나씩만 적었습니다. 이번에는 같은 질문을 같은 모델에 10번씩 보내 보기로 했습니다. 서비스는 같은 질문을 여러 번 받기 때문입니다.

**하루 100만 요청의 값은 어디서 오고, 같은 질문에 답은 늘 같을까요?**

값은 요청 한 건이 읽는 글과 쓰는 글의 길이에서 나옵니다. 읽는 글 가운데 요청마다 똑같은 앞부분은 값을 덜 낼 수 있습니다. 답은 같은 질문이어도 설정에 따라 달라질 수 있습니다. 지훈 씨는 어려운 문제 다섯을 두 설정으로 10번씩 물어 서로 다른 답을 셌습니다.

> **한 줄 요약:** 토큰은 모델이 글을 읽고 쓰는 조각이고, 토큰 단가는 100만 토큰당 매긴 값입니다. 가상 단가로 하루 100만 요청을 세면 작은 모델 72만 원, 큰 모델 780만 원입니다. 프롬프트 캐시는 앞 요청에서 계산해 둔 프롬프트 앞부분을 다시 쓰는 것입니다. 캐시 적중은 요청의 앞부분이 캐시와 같아 그 계산을 다시 쓰는 일입니다. 요청마다 같이 보내는 할 일 설명인 시스템 메시지 1,000 토큰이 모두 적중하면 큰 모델도 하루 420만 원입니다. 출력 토큰의 값은 캐시와 상관없이 남아서, 그때 출력이 하루 값의 71% 입니다. temperature 는 다음 토큰을 얼마나 흔들리게 뽑을지 정하는 값이고, seed 는 뽑을 때 쓰는 난수의 시작값입니다. 비결정성은 같은 입력에 다른 출력이 나오는 성질입니다. 문제 다섯을 temperature 0 으로 10번씩 물으니 50개 답이 문제마다 글자까지 같았습니다. temperature 0.7 로 물으니 다섯 문제 모두 answer 가 두세 가지로 나왔습니다. 1회차와 비교하면 answer 는 45회차 중 21회차, 풀이 단계인 steps 는 42회차가 달랐습니다.

> **골라 읽는 법** — 절이 6개입니다. 절마다 표나 코드나 카드가 있어 그것만 보고 넘어가도 됩니다.
>
> - 요청 한 건의 토큰 셋과 하루 100만 요청의 값 → 1절
> - 시스템 메시지를 캐시에서 읽는 몫과 하루 값 → 2절
> - 같은 문제 다섯을 temperature 0 과 0.7 로 10번씩 물은 기록 → 3절
> - 정수 하나인 answer 와 영어 구의 목록인 steps 의 흔들림 → 4절
> - 지훈 씨가 선배에게 낸 계산표 → 5절
> - 두 무대에서 값과 흔들림을 보는 자리 → 6절

이 글의 단가, 요청 크기, 광고 운영 숫자 문제는 설명을 위해 만든 가상 데이터입니다. 답과 토큰 수와 시간은 지어낸 값이 아닙니다. 2026-11-05 에 이 블로그를 쓰는 맥에서 Ollama 0.40.11 로 qwen3.5:27b 를 띄워 기록했습니다. Ollama 는 공개된 모델을 개인 컴퓨터에서 돌리는 도구입니다. 기록 파일은 `data/llm-records/` 에 둘입니다. temperature 0 은 `llm-cost-cache-nondeterminism-t0.json`, 0.7 은 `-t7.json` 입니다. 카드의 파랑은 입력 토큰과 temperature 0, 벽돌색은 출력 토큰과 temperature 0.7 입니다. 먹색은 요청과 문제, 회색은 캐시에서 읽은 몫, 점선 상자는 가상 값입니다.

---

## 1. 하루 100만 요청의 값은 토큰 셋으로 셉니다

**요청 한 건은 시스템 메시지 1,000 토큰, 사용자 메시지 200 토큰을 읽고 150 토큰을 씁니다. 가상 단가로 큰 모델 한 건은 7.80원이고, 시스템 4.00원, 사용자 0.80원, 출력 3.00원입니다. 하루 100만 요청이면 작은 모델 720,000원, 큰 모델 7,800,000원입니다.**

상용 API 는 읽은 토큰과 쓴 토큰에 따로 값을 매깁니다. API 는 프로그램이 다른 프로그램의 기능을 부를 때 쓰는 정해진 요청의 꼴입니다. 단가는 100만 토큰당 원으로 적고, 출력 단가가 입력 단가보다 높습니다. 실제 단가는 [Anthropic](https://platform.claude.com/docs/en/about-claude/pricing) 과 [OpenAI](https://developers.openai.com/api/docs/pricing) 의 가격 문서에 있습니다. 이 글은 실제 단가를 쓰지 않고 아래 표의 가상 단가로 셉니다.

| 모델 (가상) | 입력 | 출력 | 캐시에서 읽은 입력 |
|---|---|---|---|
| 작은 모델 | 400원 | 1,600원 | 40원 |
| 큰 모델 | 4,000원 | 20,000원 | 400원 |

요청 한 건이 읽는 글은 둘입니다. 하나는 요청마다 같은 시스템 메시지이고, 다른 하나는 광고주의 질문인 사용자 메시지입니다. 7주 전 [LLM 모델 고르기](post.html?id=llm-model-selection) 편과 같이 시스템 1,000 토큰, 사용자 200 토큰을 읽고 150 토큰을 쓴다고 둡니다. 셋을 따로 세면 어느 덩이가 값을 많이 내는지 보입니다.

아래 블록의 `cost_won` 은 그 편의 함수를 글자 그대로 옮긴 것입니다. 2단계는 요청 한 건을 셋으로 나눠 세고, 3단계는 하루 100만 요청과 한 달 30일의 값을 셉니다. 4단계는 다음 절의 캐시 비율을 바꿔 봅니다. 맨 위의 PROBLEMS 는 문제 20개이고, 이 글은 그중 p16~p20 만 뒤 블록에서 씁니다.

```python
# 하는 일: 가상 단가로 요청 한 건의 토큰 셋과 하루 100만 요청의 값을 세고, 시스템 메시지를 캐시에서 읽는 비율을 바꿔 큰 모델의 하루와 한 달 값을 비교한다.

# 1단계: 문제 20개와 값을 세는 함수를 둔다
# PROBLEMS 는 광고 운영 숫자 문제 20개다. answer 는 단위 없는 정수다.
# 이 글은 그중 두세 단계로 푸는 p16~p20 다섯 개만 뒤 블록에서 쓴다.
# 단가 price_in, price_out 은 100만 토큰당 원이다. in_tokens 는 캐시에서 읽은 토큰까지 센 입력 토큰 전부다.
# 그 가운데 cached_tokens 만큼은 입력 단가의 0.1배로 센다. 나머지 입력과 출력은 단가 그대로다.
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


def cost_won(in_tokens, out_tokens, price_in, price_out, cached_tokens=0):
    fresh = in_tokens - cached_tokens
    return (fresh * price_in + cached_tokens * price_in * 0.1 + out_tokens * price_out) / 1_000_000


# 2단계: 가상 단가와 요청 한 건의 토큰 셋을 둔다
# 단가는 설명을 위해 정한 가상 값이다. 실제 단가는 회사마다 가격 문서에 있다.
# 요청 한 건은 시스템 메시지 1,000 토큰과 사용자 메시지 200 토큰을 읽고 150 토큰을 쓴다.
PRICES = {'작은 모델': (400, 1_600), '큰 모델': (4_000, 20_000)}
SYSTEM, USER, OUT = 1_000, 200, 150
DAILY, DAYS = 1_000_000, 30
print(f'요청 한 건: 시스템 {SYSTEM:,} + 사용자 {USER} = 입력 {SYSTEM + USER:,} 토큰, 출력 {OUT} 토큰')
for model, (price_in, price_out) in PRICES.items():
    one = cost_won(SYSTEM + USER, OUT, price_in, price_out)
    parts = [cost_won(SYSTEM, 0, price_in, price_out), cost_won(USER, 0, price_in, price_out), cost_won(0, OUT, price_in, price_out)]
    print(f'{model}: 한 건 {one:.2f}원 = 시스템 {parts[0]:.2f} + 사용자 {parts[1]:.2f} + 출력 {parts[2]:.2f}')

# 3단계: 하루 100만 요청의 세 값을 센다
# 셋째 경우는 요청마다 같은 시스템 메시지 1,000 토큰을 모두 캐시에서 읽는다.
cases = [('작은 모델', '작은 모델', 0), ('큰 모델', '큰 모델', 0), ('큰 모델 + 시스템 캐시', '큰 모델', SYSTEM)]
for name, model, cached in cases:
    price_in, price_out = PRICES[model]
    day = round(cost_won((SYSTEM + USER) * DAILY, OUT * DAILY, price_in, price_out, cached * DAILY))
    print(f'{name}: 하루 {day:,}원, 한 달 {day * DAYS:,}원')

# 4단계: 시스템 메시지 가운데 캐시에서 읽는 몫을 바꿔 본다
# 비율은 시스템 메시지 1,000 토큰 가운데 캐시에 맞은 몫이다. 사용자 메시지와 출력은 캐시와 상관없다.
price_in, price_out = PRICES['큰 모델']
base = round(cost_won((SYSTEM + USER) * DAILY, OUT * DAILY, price_in, price_out))
for ratio in (0, 50, 90, 100):
    cached = SYSTEM * ratio // 100
    day = round(cost_won((SYSTEM + USER) * DAILY, OUT * DAILY, price_in, price_out, cached * DAILY))
    print(f'캐시 {ratio}%: 캐시 토큰 {cached:,}개, 하루 {day:,}원 ({day / base:.0%}), 한 달 {day * DAYS:,}원')
out_day = round(cost_won(0, OUT * DAILY, price_in, price_out))
print(f'출력 150 토큰의 하루 값은 {out_day:,}원으로 캐시와 상관없이 그대로다')
print(f'캐시 100% 에서 출력은 하루 값의 {out_day / day:.0%} 다')

# 출력:
# 2단계 뜻: 큰 모델 한 건 7.80원 가운데 시스템 메시지가 4.00원, 출력이 3.00원이다.
# 요청 한 건: 시스템 1,000 + 사용자 200 = 입력 1,200 토큰, 출력 150 토큰
# 작은 모델: 한 건 0.72원 = 시스템 0.40 + 사용자 0.08 + 출력 0.24
# 큰 모델: 한 건 7.80원 = 시스템 4.00 + 사용자 0.80 + 출력 3.00
# 3단계 뜻: 하루 100만 요청이면 작은 모델 720,000원, 큰 모델 7,800,000원, 캐시를 쓴 큰 모델 4,200,000원이다.
# 작은 모델: 하루 720,000원, 한 달 21,600,000원
# 큰 모델: 하루 7,800,000원, 한 달 234,000,000원
# 큰 모델 + 시스템 캐시: 하루 4,200,000원, 한 달 126,000,000원
# 4단계 뜻: 캐시 몫이 커질수록 하루 값이 줄지만 54% 에서 멈춘다. 출력의 값은 그대로다.
# 캐시 0%: 캐시 토큰 0개, 하루 7,800,000원 (100%), 한 달 234,000,000원
# 캐시 50%: 캐시 토큰 500개, 하루 6,000,000원 (77%), 한 달 180,000,000원
# 캐시 90%: 캐시 토큰 900개, 하루 4,560,000원 (58%), 한 달 136,800,000원
# 캐시 100%: 캐시 토큰 1,000개, 하루 4,200,000원 (54%), 한 달 126,000,000원
# 출력 150 토큰의 하루 값은 3,000,000원으로 캐시와 상관없이 그대로다
# 캐시 100% 에서 출력은 하루 값의 71% 다
```

큰 모델 한 건 7.80원 가운데 시스템 메시지가 4.00원으로 가장 큽니다. 토큰이 1,000개로 가장 많기 때문입니다. 출력은 150 토큰뿐인데 3.00원입니다. 출력 단가가 입력 단가의 5배라서, 토큰 수로는 작아도 값은 시스템 메시지에 가깝습니다.

하루 100만 요청이면 작은 모델 720,000원, 큰 모델 7,800,000원이고 한 달은 그 30배입니다. 큰 모델의 한 달 값은 234,000,000원입니다. 같은 요청인데 모델 하나를 바꾸면 하루 값이 열 배 넘게 달라집니다. 그래서 지훈 씨는 단가표보다 요청 한 건의 토큰 셋을 먼저 적었습니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-llm-cost-cards.html?embed=1&card=tokens" height="480" loading="lazy" title="요청 한 건의 토큰 셋과 큰 모델 한 건의 값"></iframe>
<a class="demo-embed-open" href="demo-llm-cost-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 2. 캐시는 시스템 메시지 값을 깎습니다

**시스템 메시지 1,000 토큰 가운데 캐시에 맞는 몫을 0, 50, 90, 100% 로 바꿔 봅니다. 큰 모델 하루 값은 7,800,000원, 6,000,000원, 4,560,000원, 4,200,000원입니다. 출력 3,000,000원은 그대로라, 캐시를 다 맞혀도 하루 값의 71% 가 출력입니다.**

프롬프트 캐시는 요청의 앞부분이 앞 요청과 같을 때만 맞습니다. Anthropic 의 prompt caching 문서는 tools, system, messages 차례로 프롬프트 전체를 본다고 적었습니다. 캐시 적중에는 표시한 자리까지의 글이 100% 같아야 한다고도 적었습니다. 그래서 요청마다 같은 시스템 메시지를 앞에 두고, 바뀌는 질문을 뒤에 둡니다.

OpenAI 의 prompt caching 문서도 앞부분 전체가 같아야 캐시를 다시 쓴다고 적었습니다. 바뀌지 않는 지시와 자료를 앞에 두라고 권하고, 지원 모델에서는 따로 켜지 않아도 캐시가 돈다고 적었습니다. 캐시에서 읽은 토큰은 usage 의 `input_tokens_details.cached_tokens` 에 나옵니다. 두 문서 모두 캐시에서 읽은 토큰을 보통 입력보다 낮게 매긴다고 적었습니다.

이 글은 캐시에서 읽은 토큰을 입력 단가의 0.1배로 셉니다. 실제 배수와 캐시에 처음 쓸 때의 값은 문서마다, 모델마다 따로 적혀 있습니다. 캐시가 남는 시간과 캐시할 수 있는 가장 짧은 길이도 문서에 있습니다. 1,000 토큰보다 짧은 앞부분은 캐시하지 않는 모델도 있어서, 이 계산은 캐시가 된다고 둔 것입니다.

| 시스템 메시지 중 캐시 몫 | 캐시 토큰 | 큰 모델 하루 | 원래 대비 | 한 달 |
|---|---|---|---|---|
| 0% | 0개 | 7,800,000원 | 100% | 234,000,000원 |
| 50% | 500개 | 6,000,000원 | 77% | 180,000,000원 |
| 90% | 900개 | 4,560,000원 | 58% | 136,800,000원 |
| 100% | 1,000개 | 4,200,000원 | 54% | 126,000,000원 |

캐시 몫이 0% 에서 100% 로 가면 하루 값은 7,800,000원에서 4,200,000원으로 줄어듭니다. 깎이는 것은 시스템 메시지 4.00원 가운데 0.9배 몫뿐입니다. 사용자 메시지 0.80원과 출력 3.00원은 캐시와 상관이 없습니다. 그래서 캐시를 다 맞혀도 원래의 54% 에서 멈춥니다.

캐시를 다 맞힌 큰 모델에서는 출력 3,000,000원이 하루 값의 71% 입니다. 이때 값을 더 줄이려면 출력을 줄여야 합니다. 3절의 steps 처럼 풀이를 먼저 쓰게 하면 출력 토큰이 늘어납니다. 캐시는 입력 쪽만 깎는다는 것을 계산표에 같이 적어야 합니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-llm-cost-cards.html?embed=1&card=cache" height="480" loading="lazy" title="시스템 메시지의 캐시 몫과 큰 모델 하루 값"></iframe>
<a class="demo-embed-open" href="demo-llm-cost-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 3. 같은 입력 10번: temperature 0 과 0.7

**문제 다섯을 temperature 0 으로 10번씩 묻자 50개 답이 문제마다 글자까지 같았습니다. temperature 0.7 로 묻자 다섯 문제 모두 answer 가 두세 가지로 나왔습니다. 정답은 temperature 0 이 50개 중 40개, 0.7 이 28개입니다.**

문제는 PROBLEMS 의 두세 단계 문제 가운데 p16~p20 다섯 개입니다. 시스템 메시지는 [프롬프트와 Chain-of-Thought](post.html?id=prompting-chain-of-thought) 편의 steps 꼴을 글자 그대로 썼습니다. 영어 짧은 구로 단계를 steps 에 먼저 적고, 정수 답을 answer 에 적게 합니다. 사용자 메시지는 「문제: 」 뒤에 문제 한 줄을 붙인 글입니다.

같은 요청을 temperature 0 으로 10번, 0.7 로 10번 보냈습니다. temperature 0 은 10번 모두 seed 7 이고, 0.7 은 회차마다 seed 를 8 에서 17 까지 바꿨습니다. [자연어 오디언스](post.html?id=natural-language-audience) 편에서 temperature 0.7 은 seed 를 같게 두고 다시 기록해도 답이 달라졌습니다. 그래서 흔들림은 seed 가 다른 0.7 과 temperature 0 을 나란히 두고 측정합니다.

첫 블록은 temperature 0 기록 50개를 읽습니다. 키 p16 은 1회차이고, p16|off|2 는 같은 요청의 2회차입니다. 문제마다 글자가 다른 답의 수, answer 와 steps 가 몇 가지인지, 정답 수를 셉니다. 2~10회차는 1회차와 비교해 다른 회차를 셉니다.

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: p16~p20 을 temperature 0 으로 10번씩 물은 답 50개를 읽고, 문제마다 10개의 answer 와 steps 가 모두 같은지 센다.
# 기록 data/llm-records/llm-cost-cache-nondeterminism-t0.json 에서 옮김
import json

# 1단계: temperature 0 기록을 둔다
# 키 p16 은 첫 회차이고, p16|off|2 부터 p16|off|10 은 같은 입력을 다시 보낸 2~10회차다.
# 열 번 모두 seed 7 로 보냈다. USAGE 의 네 값은 차례대로 prompt_tokens, output_tokens, elapsed_ms, thinking_chars 다.
RECORD = {"p16": "{\n\"steps\": [\n\"Calculate total impressions by dividing budget by CPM\",\n\"Calculate total clicks by multiplying impressions by click-through rate\",\n\"Calculate total conversions by multiplying clicks by conversion rate\"\n],\n\"answer\": 144\n}", "p16|off|2": "{\n\"steps\": [\n\"Calculate total impressions by dividing budget by CPM\",\n\"Calculate total clicks by multiplying impressions by click-through rate\",\n\"Calculate total conversions by multiplying clicks by conversion rate\"\n],\n\"answer\": 144\n}", "p16|off|3": "{\n\"steps\": [\n\"Calculate total impressions by dividing budget by CPM\",\n\"Calculate total clicks by multiplying impressions by click-through rate\",\n\"Calculate total conversions by multiplying clicks by conversion rate\"\n],\n\"answer\": 144\n}", "p16|off|4": "{\n\"steps\": [\n\"Calculate total impressions by dividing budget by CPM\",\n\"Calculate total clicks by multiplying impressions by click-through rate\",\n\"Calculate total conversions by multiplying clicks by conversion rate\"\n],\n\"answer\": 144\n}", "p16|off|5": "{\n\"steps\": [\n\"Calculate total impressions by dividing budget by CPM\",\n\"Calculate total clicks by multiplying impressions by click-through rate\",\n\"Calculate total conversions by multiplying clicks by conversion rate\"\n],\n\"answer\": 144\n}", "p16|off|6": "{\n\"steps\": [\n\"Calculate total impressions by dividing budget by CPM\",\n\"Calculate total clicks by multiplying impressions by click-through rate\",\n\"Calculate total conversions by multiplying clicks by conversion rate\"\n],\n\"answer\": 144\n}", "p16|off|7": "{\n\"steps\": [\n\"Calculate total impressions by dividing budget by CPM\",\n\"Calculate total clicks by multiplying impressions by click-through rate\",\n\"Calculate total conversions by multiplying clicks by conversion rate\"\n],\n\"answer\": 144\n}", "p16|off|8": "{\n\"steps\": [\n\"Calculate total impressions by dividing budget by CPM\",\n\"Calculate total clicks by multiplying impressions by click-through rate\",\n\"Calculate total conversions by multiplying clicks by conversion rate\"\n],\n\"answer\": 144\n}", "p16|off|9": "{\n\"steps\": [\n\"Calculate total impressions by dividing budget by CPM\",\n\"Calculate total clicks by multiplying impressions by click-through rate\",\n\"Calculate total conversions by multiplying clicks by conversion rate\"\n],\n\"answer\": 144\n}", "p16|off|10": "{\n\"steps\": [\n\"Calculate total impressions by dividing budget by CPM\",\n\"Calculate total clicks by multiplying impressions by click-through rate\",\n\"Calculate total conversions by multiplying clicks by conversion rate\"\n],\n\"answer\": 144\n}", "p17": "{\n\"steps\": [\n\"Calculate afternoon budget: 3000000 * 0.62 = 1860000\",\n\"Calculate clicks: 1860000 / 310 = 6000\",\n\"Calculate conversions: 6000 * 0.015 = 90\"\n],\n\"answer\": 90\n}", "p17|off|2": "{\n\"steps\": [\n\"Calculate afternoon budget: 3000000 * 0.62 = 1860000\",\n\"Calculate clicks: 1860000 / 310 = 6000\",\n\"Calculate conversions: 6000 * 0.015 = 90\"\n],\n\"answer\": 90\n}", "p17|off|3": "{\n\"steps\": [\n\"Calculate afternoon budget: 3000000 * 0.62 = 1860000\",\n\"Calculate clicks: 1860000 / 310 = 6000\",\n\"Calculate conversions: 6000 * 0.015 = 90\"\n],\n\"answer\": 90\n}", "p17|off|4": "{\n\"steps\": [\n\"Calculate afternoon budget: 3000000 * 0.62 = 1860000\",\n\"Calculate clicks: 1860000 / 310 = 6000\",\n\"Calculate conversions: 6000 * 0.015 = 90\"\n],\n\"answer\": 90\n}", "p17|off|5": "{\n\"steps\": [\n\"Calculate afternoon budget: 3000000 * 0.62 = 1860000\",\n\"Calculate clicks: 1860000 / 310 = 6000\",\n\"Calculate conversions: 6000 * 0.015 = 90\"\n],\n\"answer\": 90\n}", "p17|off|6": "{\n\"steps\": [\n\"Calculate afternoon budget: 3000000 * 0.62 = 1860000\",\n\"Calculate clicks: 1860000 / 310 = 6000\",\n\"Calculate conversions: 6000 * 0.015 = 90\"\n],\n\"answer\": 90\n}", "p17|off|7": "{\n\"steps\": [\n\"Calculate afternoon budget: 3000000 * 0.62 = 1860000\",\n\"Calculate clicks: 1860000 / 310 = 6000\",\n\"Calculate conversions: 6000 * 0.015 = 90\"\n],\n\"answer\": 90\n}", "p17|off|8": "{\n\"steps\": [\n\"Calculate afternoon budget: 3000000 * 0.62 = 1860000\",\n\"Calculate clicks: 1860000 / 310 = 6000\",\n\"Calculate conversions: 6000 * 0.015 = 90\"\n],\n\"answer\": 90\n}", "p17|off|9": "{\n\"steps\": [\n\"Calculate afternoon budget: 3000000 * 0.62 = 1860000\",\n\"Calculate clicks: 1860000 / 310 = 6000\",\n\"Calculate conversions: 6000 * 0.015 = 90\"\n],\n\"answer\": 90\n}", "p17|off|10": "{\n\"steps\": [\n\"Calculate afternoon budget: 3000000 * 0.62 = 1860000\",\n\"Calculate clicks: 1860000 / 310 = 6000\",\n\"Calculate conversions: 6000 * 0.015 = 90\"\n],\n\"answer\": 90\n}", "p18": "{\n\"steps\": [\n\"Calculate pCTR as 0.012\",\n\"Calculate pCVR as 0.03\",\n\"Calculate expected conversions per 1000 impressions: 1000 * 0.012 * 0.03 = 0.36\",\n\"Calculate total revenue: 0.36 * 20000 = 7200\",\n\"eCPM is the revenue per 1000 impressions which is 7200\"\n],\n\"answer\": 7200\n}", "p18|off|2": "{\n\"steps\": [\n\"Calculate pCTR as 0.012\",\n\"Calculate pCVR as 0.03\",\n\"Calculate expected conversions per 1000 impressions: 1000 * 0.012 * 0.03 = 0.36\",\n\"Calculate total revenue: 0.36 * 20000 = 7200\",\n\"eCPM is the revenue per 1000 impressions which is 7200\"\n],\n\"answer\": 7200\n}", "p18|off|3": "{\n\"steps\": [\n\"Calculate pCTR as 0.012\",\n\"Calculate pCVR as 0.03\",\n\"Calculate expected conversions per 1000 impressions: 1000 * 0.012 * 0.03 = 0.36\",\n\"Calculate total revenue: 0.36 * 20000 = 7200\",\n\"eCPM is the revenue per 1000 impressions which is 7200\"\n],\n\"answer\": 7200\n}", "p18|off|4": "{\n\"steps\": [\n\"Calculate pCTR as 0.012\",\n\"Calculate pCVR as 0.03\",\n\"Calculate expected conversions per 1000 impressions: 1000 * 0.012 * 0.03 = 0.36\",\n\"Calculate total revenue: 0.36 * 20000 = 7200\",\n\"eCPM is the revenue per 1000 impressions which is 7200\"\n],\n\"answer\": 7200\n}", "p18|off|5": "{\n\"steps\": [\n\"Calculate pCTR as 0.012\",\n\"Calculate pCVR as 0.03\",\n\"Calculate expected conversions per 1000 impressions: 1000 * 0.012 * 0.03 = 0.36\",\n\"Calculate total revenue: 0.36 * 20000 = 7200\",\n\"eCPM is the revenue per 1000 impressions which is 7200\"\n],\n\"answer\": 7200\n}", "p18|off|6": "{\n\"steps\": [\n\"Calculate pCTR as 0.012\",\n\"Calculate pCVR as 0.03\",\n\"Calculate expected conversions per 1000 impressions: 1000 * 0.012 * 0.03 = 0.36\",\n\"Calculate total revenue: 0.36 * 20000 = 7200\",\n\"eCPM is the revenue per 1000 impressions which is 7200\"\n],\n\"answer\": 7200\n}", "p18|off|7": "{\n\"steps\": [\n\"Calculate pCTR as 0.012\",\n\"Calculate pCVR as 0.03\",\n\"Calculate expected conversions per 1000 impressions: 1000 * 0.012 * 0.03 = 0.36\",\n\"Calculate total revenue: 0.36 * 20000 = 7200\",\n\"eCPM is the revenue per 1000 impressions which is 7200\"\n],\n\"answer\": 7200\n}", "p18|off|8": "{\n\"steps\": [\n\"Calculate pCTR as 0.012\",\n\"Calculate pCVR as 0.03\",\n\"Calculate expected conversions per 1000 impressions: 1000 * 0.012 * 0.03 = 0.36\",\n\"Calculate total revenue: 0.36 * 20000 = 7200\",\n\"eCPM is the revenue per 1000 impressions which is 7200\"\n],\n\"answer\": 7200\n}", "p18|off|9": "{\n\"steps\": [\n\"Calculate pCTR as 0.012\",\n\"Calculate pCVR as 0.03\",\n\"Calculate expected conversions per 1000 impressions: 1000 * 0.012 * 0.03 = 0.36\",\n\"Calculate total revenue: 0.36 * 20000 = 7200\",\n\"eCPM is the revenue per 1000 impressions which is 7200\"\n],\n\"answer\": 7200\n}", "p18|off|10": "{\n\"steps\": [\n\"Calculate pCTR as 0.012\",\n\"Calculate pCVR as 0.03\",\n\"Calculate expected conversions per 1000 impressions: 1000 * 0.012 * 0.03 = 0.36\",\n\"Calculate total revenue: 0.36 * 20000 = 7200\",\n\"eCPM is the revenue per 1000 impressions which is 7200\"\n],\n\"answer\": 7200\n}", "p19": "{\n\"steps\": [\n\"Calculate total impressions by multiplying members by average exposures\",\n\"Calculate total clicks by multiplying total impressions by click-through rate\",\n\"Calculate total cost by multiplying total clicks by cost per click\"\n],\n\"answer\": 5443200\n}", "p19|off|2": "{\n\"steps\": [\n\"Calculate total impressions by multiplying members by average exposures\",\n\"Calculate total clicks by multiplying total impressions by click-through rate\",\n\"Calculate total cost by multiplying total clicks by cost per click\"\n],\n\"answer\": 5443200\n}", "p19|off|3": "{\n\"steps\": [\n\"Calculate total impressions by multiplying members by average exposures\",\n\"Calculate total clicks by multiplying total impressions by click-through rate\",\n\"Calculate total cost by multiplying total clicks by cost per click\"\n],\n\"answer\": 5443200\n}", "p19|off|4": "{\n\"steps\": [\n\"Calculate total impressions by multiplying members by average exposures\",\n\"Calculate total clicks by multiplying total impressions by click-through rate\",\n\"Calculate total cost by multiplying total clicks by cost per click\"\n],\n\"answer\": 5443200\n}", "p19|off|5": "{\n\"steps\": [\n\"Calculate total impressions by multiplying members by average exposures\",\n\"Calculate total clicks by multiplying total impressions by click-through rate\",\n\"Calculate total cost by multiplying total clicks by cost per click\"\n],\n\"answer\": 5443200\n}", "p19|off|6": "{\n\"steps\": [\n\"Calculate total impressions by multiplying members by average exposures\",\n\"Calculate total clicks by multiplying total impressions by click-through rate\",\n\"Calculate total cost by multiplying total clicks by cost per click\"\n],\n\"answer\": 5443200\n}", "p19|off|7": "{\n\"steps\": [\n\"Calculate total impressions by multiplying members by average exposures\",\n\"Calculate total clicks by multiplying total impressions by click-through rate\",\n\"Calculate total cost by multiplying total clicks by cost per click\"\n],\n\"answer\": 5443200\n}", "p19|off|8": "{\n\"steps\": [\n\"Calculate total impressions by multiplying members by average exposures\",\n\"Calculate total clicks by multiplying total impressions by click-through rate\",\n\"Calculate total cost by multiplying total clicks by cost per click\"\n],\n\"answer\": 5443200\n}", "p19|off|9": "{\n\"steps\": [\n\"Calculate total impressions by multiplying members by average exposures\",\n\"Calculate total clicks by multiplying total impressions by click-through rate\",\n\"Calculate total cost by multiplying total clicks by cost per click\"\n],\n\"answer\": 5443200\n}", "p19|off|10": "{\n\"steps\": [\n\"Calculate total impressions by multiplying members by average exposures\",\n\"Calculate total clicks by multiplying total impressions by click-through rate\",\n\"Calculate total cost by multiplying total clicks by cost per click\"\n],\n\"answer\": 5443200\n}", "p20": "{\n\"steps\": [\n\"Calculate revenue per click by multiplying revenue per purchase by conversion rate.\",\n\"Divide the calculated revenue per click by the target ROAS to find the maximum cost per click.\"\n],\n\"answer\": 900\n}", "p20|off|2": "{\n\"steps\": [\n\"Calculate revenue per click by multiplying revenue per purchase by conversion rate.\",\n\"Divide the calculated revenue per click by the target ROAS to find the maximum cost per click.\"\n],\n\"answer\": 900\n}", "p20|off|3": "{\n\"steps\": [\n\"Calculate revenue per click by multiplying revenue per purchase by conversion rate.\",\n\"Divide the calculated revenue per click by the target ROAS to find the maximum cost per click.\"\n],\n\"answer\": 900\n}", "p20|off|4": "{\n\"steps\": [\n\"Calculate revenue per click by multiplying revenue per purchase by conversion rate.\",\n\"Divide the calculated revenue per click by the target ROAS to find the maximum cost per click.\"\n],\n\"answer\": 900\n}", "p20|off|5": "{\n\"steps\": [\n\"Calculate revenue per click by multiplying revenue per purchase by conversion rate.\",\n\"Divide the calculated revenue per click by the target ROAS to find the maximum cost per click.\"\n],\n\"answer\": 900\n}", "p20|off|6": "{\n\"steps\": [\n\"Calculate revenue per click by multiplying revenue per purchase by conversion rate.\",\n\"Divide the calculated revenue per click by the target ROAS to find the maximum cost per click.\"\n],\n\"answer\": 900\n}", "p20|off|7": "{\n\"steps\": [\n\"Calculate revenue per click by multiplying revenue per purchase by conversion rate.\",\n\"Divide the calculated revenue per click by the target ROAS to find the maximum cost per click.\"\n],\n\"answer\": 900\n}", "p20|off|8": "{\n\"steps\": [\n\"Calculate revenue per click by multiplying revenue per purchase by conversion rate.\",\n\"Divide the calculated revenue per click by the target ROAS to find the maximum cost per click.\"\n],\n\"answer\": 900\n}", "p20|off|9": "{\n\"steps\": [\n\"Calculate revenue per click by multiplying revenue per purchase by conversion rate.\",\n\"Divide the calculated revenue per click by the target ROAS to find the maximum cost per click.\"\n],\n\"answer\": 900\n}", "p20|off|10": "{\n\"steps\": [\n\"Calculate revenue per click by multiplying revenue per purchase by conversion rate.\",\n\"Divide the calculated revenue per click by the target ROAS to find the maximum cost per click.\"\n],\n\"answer\": 900\n}"}
USAGE = {"p16": [131, 55, 11873, 0], "p16|off|2": [131, 55, 3627, 0], "p16|off|3": [131, 55, 3636, 0], "p16|off|4": [131, 55, 3634, 0], "p16|off|5": [131, 55, 3643, 0], "p16|off|6": [131, 55, 3647, 0], "p16|off|7": [131, 55, 3642, 0], "p16|off|8": [131, 55, 3655, 0], "p16|off|9": [131, 55, 3647, 0], "p16|off|10": [131, 55, 3649, 0], "p17": [126, 94, 6837, 0], "p17|off|2": [126, 94, 6158, 0], "p17|off|3": [126, 94, 6084, 0], "p17|off|4": [126, 94, 6069, 0], "p17|off|5": [126, 94, 6094, 0], "p17|off|6": [126, 94, 6076, 0], "p17|off|7": [126, 94, 6095, 0], "p17|off|8": [126, 94, 6083, 0], "p17|off|9": [126, 94, 6076, 0], "p17|off|10": [126, 94, 6115, 0], "p18": [141, 131, 9400, 0], "p18|off|2": [141, 131, 8405, 0], "p18|off|3": [141, 131, 8499, 0], "p18|off|4": [141, 131, 8415, 0], "p18|off|5": [141, 131, 8417, 0], "p18|off|6": [141, 131, 8456, 0], "p18|off|7": [141, 131, 8626, 0], "p18|off|8": [141, 131, 8631, 0], "p18|off|9": [141, 131, 8872, 0], "p18|off|10": [141, 131, 8869, 0], "p19": [118, 62, 4689, 0], "p19|off|2": [118, 62, 4349, 0], "p19|off|3": [118, 62, 4330, 0], "p19|off|4": [118, 62, 4445, 0], "p19|off|5": [118, 62, 4522, 0], "p19|off|6": [118, 62, 5095, 0], "p19|off|7": [118, 62, 4694, 0], "p19|off|8": [118, 62, 4592, 0], "p19|off|9": [118, 62, 4557, 0], "p19|off|10": [118, 62, 4801, 0], "p20": [123, 55, 4797, 0], "p20|off|2": [123, 55, 5025, 0], "p20|off|3": [123, 55, 4202, 0], "p20|off|4": [123, 55, 4275, 0], "p20|off|5": [123, 55, 4374, 0], "p20|off|6": [123, 55, 4326, 0], "p20|off|7": [123, 55, 4264, 0], "p20|off|8": [123, 55, 4074, 0], "p20|off|9": [123, 55, 4160, 0], "p20|off|10": [123, 55, 4264, 0]}
R_T0, U_T0 = RECORD, USAGE

# 2단계: 답을 읽고 문제마다 10개를 비교하는 함수를 둔다
# 키가 steps, answer 둘이고, steps 가 문자열 1~5개이며, answer 가 정수일 때만 읽은 답이다.
# 읽지 못한 답은 None 으로 두고 틀린 답으로 센다. 몇 가지인지는 읽은 답끼리 센다.
# 2~10회차는 1회차와 비교한다. 읽지 못한 답이 끼면 다른 것으로 친다.
ANSWER = {p['id']: p['answer'] for p in PROBLEMS}
HARD5 = ['p16', 'p17', 'p18', 'p19', 'p20']


def read(text):
    try:
        obj = json.loads(text)
    except ValueError:
        return None
    if not isinstance(obj, dict) or sorted(obj) != ['answer', 'steps']:
        return None
    items = obj['steps']
    if not isinstance(items, list) or not 1 <= len(items) <= 5 or not all(isinstance(t, str) for t in items):
        return None
    if type(obj['answer']) is not int:
        return None
    return obj['answer'], tuple(items)


def keys(pid):
    return [pid] + [f'{pid}|off|{run}' for run in range(2, 11)]


def spread(record, usage):
    rows = {}
    for pid in HARD5:
        got = [read(record[k]) for k in keys(pid)]
        ok = [g for g in got if g is not None]
        first = got[0]
        rows[pid] = {'texts': len({record[k] for k in keys(pid)}), 'unread': got.count(None),
                     'answers': len({g[0] for g in ok}), 'steps': len({g[1] for g in ok}),
                     'gold': sum(g is not None and g[0] == ANSWER[pid] for g in got),
                     'seen': sorted({g[0] for g in ok}),
                     'a_diff': sum(g is None or first is None or g[0] != first[0] for g in got[1:]),
                     's_diff': sum(g is None or first is None or g[1] != first[1] for g in got[1:]),
                     'out': sum(usage[k][1] for k in keys(pid)), 'ms': sum(usage[k][2] for k in keys(pid))}
    return rows


def show(name, rows):
    for pid in HARD5:
        r = rows[pid]
        seen = ', '.join(f'{a:,}' for a in r['seen'])
        print(f'{name} {pid}: 글자가 다른 답 {r["texts"]}개, answer {r["answers"]}가지 ({seen}), '
              f'steps {r["steps"]}가지, 읽지 못한 답 {r["unread"]}개, 정답 {r["gold"]}/10, '
              f'1회차와 다른 회차 answer {r["a_diff"]}/9, steps {r["s_diff"]}/9')


# 3단계: temperature 0 의 10번을 문제마다 비교한다
t0 = spread(R_T0, U_T0)
show('t0', t0)
same = [pid for pid in HARD5 if t0[pid]['texts'] == 1]
print(f't0: 10번의 답이 글자까지 모두 같은 문제 {len(same)}/5개')

# 출력:
# 3단계 뜻: 다섯 문제 모두 10번의 답이 글자까지 같았다. p19 는 10번 모두 같은 답으로 틀렸다.
# t0 p16: 글자가 다른 답 1개, answer 1가지 (144), steps 1가지, 읽지 못한 답 0개, 정답 10/10, 1회차와 다른 회차 answer 0/9, steps 0/9
# t0 p17: 글자가 다른 답 1개, answer 1가지 (90), steps 1가지, 읽지 못한 답 0개, 정답 10/10, 1회차와 다른 회차 answer 0/9, steps 0/9
# t0 p18: 글자가 다른 답 1개, answer 1가지 (7,200), steps 1가지, 읽지 못한 답 0개, 정답 10/10, 1회차와 다른 회차 answer 0/9, steps 0/9
# t0 p19: 글자가 다른 답 1개, answer 1가지 (5,443,200), steps 1가지, 읽지 못한 답 0개, 정답 0/10, 1회차와 다른 회차 answer 0/9, steps 0/9
# t0 p20: 글자가 다른 답 1개, answer 1가지 (900), steps 1가지, 읽지 못한 답 0개, 정답 10/10, 1회차와 다른 회차 answer 0/9, steps 0/9
# t0: 10번의 답이 글자까지 모두 같은 문제 5/5개
```

temperature 0 의 50개는 다섯 문제 모두 10번의 답이 글자까지 같았습니다. answer 도 steps 도 문제마다 한 가지입니다. p19 는 10번 모두 정답의 10배인 5,443,200 을 답했습니다. 같은 답이 열 번 나온 것은 맞는다는 뜻이 아니라, 틀린 답도 열 번 같다는 뜻입니다.

둘째 블록은 같은 다섯 문제를 temperature 0.7 로 물은 50개를 같은 함수로 셉니다. 3단계는 바뀐 문제와 바뀐 회차를 answer 와 steps 로 나눠 세고, 4단계는 정답 수와 토큰, 시간을 셉니다. 두 상수는 `--export-constant --with-usage` 가 찍은 줄 그대로입니다.

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 같은 다섯 문제를 temperature 0.7 로 10번씩 물은 답 50개를 읽고, answer 와 steps 가 몇 가지로 나왔는지 temperature 0 과 비교한다.
# 기록 data/llm-records/llm-cost-cache-nondeterminism-t7.json 에서 옮김

# 1단계: temperature 0.7 기록을 둔다
# 키의 모양은 앞 블록과 같다. 회차마다 seed 를 7 + 회차로 보냈다(1회차 8, 10회차 17).
RECORD = {"p16": "{\n\"steps\": [\n\"Calculate total impressions by dividing budget by CPM and multiplying by 1000\",\n\"Calculate clicks by multiplying total impressions by the click-through rate\",\n\"Calculate conversions by multiplying clicks by the conversion rate\"\n],\n\"answer\": 144\n}", "p16|off|2": "{\n\"steps\": [\n\"Calculate total impressions by dividing the daily budget by CPM.\",\n\"Calculate total clicks by multiplying total impressions by the click-through rate.\",\n\"Calculate total conversions by multiplying total clicks by the conversion rate.\"\n],\n\"answer\": 12\n}", "p16|off|3": "{\n\"steps\": [\n\"Calculate total impressions by dividing daily budget by CPM\",\n\"Calculate total clicks by multiplying impressions by click-through rate\",\n\"Calculate total conversions by multiplying clicks by conversion rate\"\n],\n\"answer\": 144\n}", "p16|off|4": "{\n\"steps\": [\n\"Calculate total impressions by dividing budget by CPM cost\",\n\"Calculate total clicks by multiplying impressions by click-through rate\",\n\"Calculate total conversions by multiplying clicks by conversion rate\",\n\"Round the result to the nearest integer\"\n],\n\"answer\": 144\n}", "p16|off|5": "{\n\"steps\": [\n\"Calculate total impressions by dividing the budget by CPM.\",\n\"Calculate total clicks by multiplying total impressions by the click-through rate.\",\n\"Calculate total conversions by multiplying total clicks by the conversion rate.\"\n],\n\"answer\": 12\n}", "p16|off|6": "{\n\"steps\": [\n\"Calculate total impressions by dividing the daily budget of 3,000,000 won by the CPM of 6,250 won\",\n\"Calculate total clicks by multiplying the total impressions by the click-through rate of 1.2%\",\n\"Calculate total conversions by multiplying the total clicks by the conversion rate of 2.5%\"\n],\n\"answer\": 144\n}", "p16|off|7": "{\n\"steps\": [\n\"3000000 / 6250 = 480\",\n\"480 * 1000 = 480000\",\n\"480000 * 0.012 = 5760\",\n\"5760 * 0.025 = 144\"\n],\n\"answer\": 144\n}", "p16|off|8": "{\n\"steps\": [\n\"Calculate total impressions by dividing the budget of 3000000 by the CPM of 6250.\",\n\"Calculate total clicks by multiplying the impressions by the click-through rate of 1.2%.\",\n\"Calculate total conversions by multiplying the clicks by the conversion rate of 2.5%.\"\n],\n\"answer\": 36\n}", "p16|off|9": "{\n\"steps\": [\n\"3000000 divided by 6250 equals total impressions\",\n\"total impressions multiplied by 1.2 percent equals clicks\",\n\"clicks multiplied by 2.5 percent equals conversions\"\n],\n\"answer\": 144\n}", "p16|off|10": "{\n\"steps\": [\n\"Divide daily budget by CPM to get total impressions.\",\n\"Multiply total impressions by click-through rate to get clicks.\",\n\"Multiply clicks by conversion rate to get conversions.\"\n],\n\"answer\": 12\n}", "p17": "{\n\"steps\": [\n\"Calculate afternoon budget: 3000000 * 0.62\",\n\"Calculate clicks: Afternoon budget / 310\",\n\"Calculate conversions: Clicks * 0.015\"\n],\n\"answer\": 90\n}", "p17|off|2": "{\n\"steps\": [\n\"Calculate afternoon budget: 3000000 * 0.62\",\n\"Calculate afternoon clicks: Afternoon budget / 310\",\n\"Calculate afternoon conversions: Afternoon clicks * 0.015\"\n],\n\"answer\": 90\n}", "p17|off|3": "{\n\"steps\": [\n\"Calculate afternoon budget: 3000000 * 0.62 = 1860000\",\n\"Calculate clicks: 1860000 / 310 = 6000\",\n\"Calculate conversions: 6000 * 0.015 = 90\"\n],\n\"answer\": 90\n}", "p17|off|4": "{\n\"steps\": [\n\"Calculate afternoon budget: 3000000 * 0.62 = 1860000\",\n\"Calculate clicks: 1860000 / 310 = 6000\",\n\"Calculate conversions: 6000 * 0.015 = 90\"\n],\n\"answer\": 90\n}", "p17|off|5": "{\n\"steps\": [\"Calculate afternoon budget: 3000000 * 0.62\", \"Calculate clicks: Afternoon budget / 310\", \"Calculate conversions: Clicks * 0.015\"],\n\"answer\": 894\n}", "p17|off|6": "{\n\"steps\": [\n\"Calculate afternoon budget: 3000000 * 0.62\",\n\"Calculate clicks: Afternoon budget / 310\",\n\"Calculate conversions: Clicks * 0.015\"\n],\n\"answer\": 90\n}", "p17|off|7": "{\"steps\": [\"Calculate afternoon budget as 62% of 3 million\", \"Divide afternoon budget by cost per click to get clicks\", \"Multiply clicks by conversion rate to get conversions\"], \"answer\": 180}", "p17|off|8": "{\n\"steps\": [\n\"Calculate afternoon budget: 3000000 * 0.62\",\n\"Calculate clicks: Afternoon budget / 310\",\n\"Calculate conversions: Clicks * 0.015\"\n],\n\"answer\": 90\n}", "p17|off|9": "{\n\"steps\": [\n\"Calculate afternoon budget: 3000000 * 0.62\",\n\"Calculate clicks: afternoon budget / 310\",\n\"Calculate conversions: clicks * 0.015\"\n],\n\"answer\": 90", "p17|off|10": "{\n\"steps\": [\n\"Calculate afternoon budget: 3000000 * 0.62 = 1860000\",\n\"Calculate clicks: 1860000 / 310 = 6000\",\n\"Calculate conversions: 6000 * 0.015 = 90\"\n],\n\"answer\": 90\n}", "p18": "{\n\"steps\": [\n\"1. Calculate pCTR as 0.012\",\n\"2. Calculate pCVR as 0.030\",\n\"3. Multiply bid price 20000 by pCTR and pCVR\",\n\"4. Multiply result by 1000 impressions to get eCPM\"\n],\n\"answer\": 7200\n}", "p18|off|2": "{\n\"steps\": [\n\"Calculate pCTR as 0.012\",\n\"Calculate pCVR as 0.03\",\n\"Calculate expected conversions per impression as 0.012 * 0.03 = 0.00036\",\n\"Calculate expected revenue per impression as 0.00036 * 20000 = 7.2\",\n\"Calculate eCPM for 1000 impressions as 7.2 * 1000 = 7200\"\n],\n\"answer\": 7200\n}", "p18|off|3": "{\n\"steps\": [\n\"1. Calculate pCTR as 0.012\",\n\"2. Calculate pCVR as 0.03\",\n\"3. Compute expected clicks per 1000 impressions\",\n\"4. Compute expected conversions per 1000 impressions\",\n\"5. Multiply conversions by bid price to get eCPM\"\n],\n\"answer\": 7200\n}", "p18|off|4": "{\n\"steps\": [\n\"Calculate pCVR in decimal: 0.03\",\n\"Calculate conversion rate per impression: 0.012 * 0.03 = 0.00036\",\n\"Calculate total conversions for 1000 impressions: 1000 * 0.00036 = 0.36\",\n\"Calculate expected revenue in won: 0.36 * 20000 = 7200\"\n],\n\"answer\": 7200\n}", "p18|off|5": "{\n\"steps\": [\n\"Calculate pCTR as 0.012\",\n\"Calculate pCVR as 0.03\",\n\"Calculate expected conversions per 1000 impressions: 1000 * 0.012 * 0.03 = 0.36\",\n\"Calculate eCPM revenue in won: 0.36 * 20000 = 7200\"\n],\n\"answer\": 7200\n}", "p18|off|6": "{\n\"steps\": [\n\"Calculate pCTR as 0.012\",\n\"Calculate pCVR as 0.03\",\n\"Calculate expected conversions for 1000 impressions by multiplying 1000 by pCTR and pCVR to get 0.36\",\n\"Calculate eCPM by multiplying expected conversions 0.36 by bid price 20000 to get 7200\"\n],\n\"answer\": 7200\n}", "p18|off|7": "{\"steps\": [\"Convert pCTR 1.2% to 0.012\", \"Convert pCVR 3.0% to 0.03\", \"Multiply bid price 20000 by pCTR and pCVR for expected revenue per impression\", \"Multiply the result by 1000 impressions to get eCPM\"], \"answer\": 720}", "p18|off|8": "{\n\"steps\": [\n\"Calculate expected clicks by multiplying impressions 1000 by pCTR 0.012\",\n\"Calculate expected conversions by multiplying expected clicks by pCVR 0.03\",\n\"Calculate total expected revenue by multiplying expected conversions by bid 20000\",\n\"Convert total expected revenue to eCPM by dividing by 1000 impressions and multiplying by 1000\",\n\"Simplify to find that eCPM equals bid multiplied by pCTR multiplied by pCVR multiplied by 1000\"\n],\n\"answer\": 720\n}", "p18|off|9": "{\n\"steps\": [\n\"1. Multiply pCTR by pCVR to get conversion rate.\",\n\"2. Multiply conversion rate by bid price for expected revenue per impression.\",\n\"3. Multiply by 1000 impressions to get eCPM.\"\n],\n\"answer\": 720\n}", "p18|off|10": "{\n\"steps\": [\n\"Step 1: Calculate pCTR as 0.012\",\n\"Step 2: Calculate pCVR as 0.03\",\n\"Step 3: Multiply bid by pCTR and pCVR for expected revenue per impression\",\n\"Step 4: Multiply result by 1000 impressions\",\n\"Step 5: Convert to final integer value\"\n],\n\"answer\": 720\n}", "p19": "{\n\"steps\": [\n\"Calculate total impressions by multiplying members by average exposures.\",\n\"Calculate total clicks by multiplying total impressions by click-through rate.\",\n\"Calculate total cost by multiplying total clicks by cost per click.\"\n],\n\"answer\": 5443200\n}", "p19|off|2": "{\n\"steps\": [\n\"Calculate total impressions by multiplying members by average exposures: 72000 * 4.5 = 324000\",\n\"Calculate total clicks by multiplying impressions by click-through rate: 324000 * 0.008 = 2592\",\n\"Calculate total cost by multiplying total clicks by cost per click: 2592 * 210 = 544320\"\n],\n\"answer\": 544320\n}", "p19|off|3": "{\n\"steps\": [\n\"Calculate total impressions by multiplying members by average exposures\",\n\"Calculate total clicks by multiplying total impressions by click-through rate\",\n\"Calculate total cost by multiplying total clicks by cost per click\"\n],\n\"answer\": 5443200\n}", "p19|off|4": "{\n\"steps\": [\n\"Calculate total impressions by multiplying members by average exposures: 72000 * 4.5\",\n\"Calculate total clicks by multiplying total impressions by click-through rate: result * 0.008\",\n\"Calculate total cost by multiplying total clicks by cost per click: result * 210\"\n],\n\"answer\": 5443200\n}", "p19|off|5": "{\n\"steps\": [\"Calculate total impressions by multiplying members by average exposure.\", \"Calculate total clicks by multiplying total impressions by click rate.\", \"Calculate total cost by multiplying total clicks by cost per click.\"],\n\"answer\": 529200\n}", "p19|off|6": "{\n\"steps\": [\n\"Calculate total impressions by multiplying members by average exposures\",\n\"Calculate total clicks by multiplying total impressions by click-through rate\",\n\"Calculate total cost by multiplying total clicks by cost per click\"\n],\n\"answer\": 544320\n}", "p19|off|7": "{\n\"steps\": [\n\"Calculate total impressions by multiplying 72,000 members by 4.5 exposures.\",\n\"Calculate total clicks by multiplying total impressions by the 0.8% click-through rate.\",\n\"Calculate total cost by multiplying total clicks by the 210 won cost per click.\"\n],\n\"answer\": 544320\n}", "p19|off|8": "{\n\"steps\": [\n\"Calculate total impressions by multiplying members 72000 by average exposures 4.5\",\n\"Calculate total clicks by multiplying total impressions by click-through rate 0.008\",\n\"Calculate total cost by multiplying total clicks by cost per click 210\"\n],\n\"answer\": 5443200\n}", "p19|off|9": "{\n\"steps\": [\n\"Calculate total impressions by multiplying members by average exposures\",\n\"Calculate total clicks by multiplying total impressions by click-through rate\",\n\"Calculate total cost by multiplying total clicks by cost per click\"\n],\n\"answer\": 5443200\n}", "p19|off|10": "{\n\"steps\": [\n\"1. Calculate total impressions: 72000 * 4.5\",\n\"2. Calculate total clicks: impressions * 0.008\",\n\"3. Calculate total cost: clicks * 210\"\n],\n\"answer\": 544320\n}", "p20": "{\n\"steps\": [\n\"Calculate average order value in won: 120000\",\n\"Convert target ROAS to decimal: 4.0\",\n\"Convert conversion rate to decimal: 0.03\",\n\"Calculate max CPC using formula (AOV * CR) / ROAS\",\n\"Compute result: (120000 * 0.03) / 4.0 = 900\"\n],\n\"answer\": 900\n}", "p20|off|2": "{\n\"steps\": [\n\"Calculate revenue per click by multiplying revenue per purchase and conversion rate.\",\n\"Convert the target ROAS percentage to a decimal ratio.\",\n\"Determine the maximum cost per click by dividing revenue per click by the ROAS ratio.\"\n],\n\"answer\": 900\n}", "p20|off|3": "{\n\"steps\": [\n\"Calculate revenue per click by multiplying revenue per purchase by conversion rate.\",\n\"Calculate the maximum cost per click by dividing revenue per click by target ROAS.\"\n],\n\"answer\": 90\n}", "p20|off|4": "{\n\"steps\": [\n\"Calculate revenue per click by multiplying revenue per purchase and conversion rate.\",\n\"Divide revenue per click by the target ROAS ratio to find max cost per click.\"\n],\n\"answer\": 900\n}", "p20|off|5": "{\n\"steps\": [\"Calculate revenue per click by multiplying purchase value and conversion rate.\", \"Set target cost per click by dividing revenue per click by ROAS.\"],\n\"answer\": 90\n}", "p20|off|6": "{\n\"steps\": [\n\"Calculate revenue per click by multiplying revenue per purchase by conversion rate\",\n\"Divide the revenue per click by the target ROAS ratio to find maximum cost per click\",\n\"Convert the result into won\"\n],\n\"answer\": 90\n}", "p20|off|7": "{\"steps\": [\"Convert conversion rate to decimal\", \"Calculate target revenue per click using ROAS\", \"Divide target revenue by ROAS ratio\", \"Compute maximum cost per click\"], \"answer\": 90}", "p20|off|8": "{\n\"steps\": [\n\"Calculate average revenue per click by multiplying revenue per order by conversion rate\",\n\"Determine maximum cost per click by dividing average revenue per click by target ROAS\",\n\"Convert percentage to decimal for calculation\",\n\"Perform division to find the final value\",\n\"Round the result to the nearest integer\"\n],\n\"answer\": 900\n}", "p20|off|9": "{\n\"steps\": [\n\"1. Convert target ROAS to decimal: 400% = 4.0\",\n\"2. Convert conversion rate to decimal: 3.0% = 0.03\",\n\"3. Calculate total cost per transaction limit: 120000 / 4.0 = 30000\",\n\"4. Divide transaction cost limit by conversion rate: 30000 / 0.03\",\n\"5. Result is the maximum cost per click\"\n],\n\"answer\": 1000000\n}", "p20|off|10": "{\n\"steps\": [\n\"Convert conversion rate to decimal: 3.0% becomes 0.03\",\n\"Calculate revenue per click by multiplying purchase revenue and conversion rate: 120000 * 0.03\",\n\"Set ROAS target as a ratio: 400% equals 4.0\",\n\"Determine maximum cost per click by dividing revenue per click by ROAS target\",\n\"Final calculation yields the upper limit for cost per click\"\n],\n\"answer\": 900\n}"}
USAGE = {"p16": [131, 64, 4669, 0], "p16|off|2": [131, 60, 4756, 0], "p16|off|3": [131, 56, 4554, 0], "p16|off|4": [131, 66, 5533, 0], "p16|off|5": [131, 59, 4682, 0], "p16|off|6": [131, 94, 6890, 0], "p16|off|7": [131, 100, 7030, 0], "p16|off|8": [131, 87, 5936, 0], "p16|off|9": [131, 66, 4441, 0], "p16|off|10": [131, 55, 3707, 0], "p17": [126, 67, 4564, 0], "p17|off|2": [126, 70, 4729, 0], "p17|off|3": [126, 94, 6271, 0], "p17|off|4": [126, 94, 6235, 0], "p17|off|5": [126, 62, 4136, 0], "p17|off|6": [126, 67, 4469, 0], "p17|off|7": [126, 48, 3214, 0], "p17|off|8": [126, 67, 4465, 0], "p17|off|9": [126, 63, 4203, 0], "p17|off|10": [126, 94, 6179, 0], "p18": [141, 90, 6006, 0], "p18|off|2": [141, 135, 8811, 0], "p18|off|3": [141, 94, 6187, 0], "p18|off|4": [141, 125, 8418, 0], "p18|off|5": [141, 112, 7595, 0], "p18|off|6": [141, 111, 7764, 0], "p18|off|7": [141, 85, 5806, 0], "p18|off|8": [141, 135, 9201, 0], "p18|off|9": [141, 68, 4539, 0], "p18|off|10": [141, 101, 6755, 0], "p19": [118, 62, 4363, 0], "p19|off|2": [118, 120, 8198, 0], "p19|off|3": [118, 62, 4164, 0], "p19|off|4": [118, 90, 5907, 0], "p19|off|5": [118, 55, 3664, 0], "p19|off|6": [118, 61, 4030, 0], "p19|off|7": [118, 83, 5457, 0], "p19|off|8": [118, 82, 5395, 0], "p19|off|9": [118, 62, 4198, 0], "p19|off|10": [118, 73, 4821, 0], "p20": [123, 110, 7767, 0], "p20|off|2": [123, 65, 4299, 0], "p20|off|3": [123, 50, 3332, 0], "p20|off|4": [123, 53, 3559, 0], "p20|off|5": [123, 43, 2916, 0], "p20|off|6": [123, 61, 4057, 0], "p20|off|7": [123, 44, 2962, 0], "p20|off|8": [123, 81, 5365, 0], "p20|off|9": [123, 134, 8764, 0], "p20|off|10": [123, 117, 7631, 0]}
R_T7, U_T7 = RECORD, USAGE

# 2단계: temperature 0.7 의 10번을 문제마다 비교한다
t7 = spread(R_T7, U_T7)
show('t7', t7)

# 3단계: 두 설정을 바뀐 비율로 비교한다
# 문제 단위는 10번 가운데 한 번이라도 1회차와 다른 값이 나온 문제의 수다.
# 회차 단위는 2~10회차 45개 가운데 1회차와 다른 회차의 수다. answer 는 정수 하나, steps 는 영어 구의 목록이다.
for name, rows in (('temperature 0', t0), ('temperature 0.7', t7)):
    a = sum(rows[p]['a_diff'] > 0 for p in HARD5)
    st = sum(rows[p]['s_diff'] > 0 for p in HARD5)
    a_runs = sum(rows[p]['a_diff'] for p in HARD5)
    s_runs = sum(rows[p]['s_diff'] for p in HARD5)
    print(f'{name}: 바뀐 문제 answer {a}/5, steps {st}/5 / 바뀐 회차 answer {a_runs}/45 ({a_runs / 45:.0%}), '
          f'steps {s_runs}/45 ({s_runs / 45:.0%})')

# 4단계: 정답 수와 토큰, 시간을 비교한다
for name, rows in (('temperature 0', t0), ('temperature 0.7', t7)):
    gold = sum(rows[p]['gold'] for p in HARD5)
    out = sum(rows[p]['out'] for p in HARD5)
    ms = sum(rows[p]['ms'] for p in HARD5)
    print(f'{name}: 정답 {gold}/50, 읽지 못한 답 {sum(rows[p]["unread"] for p in HARD5)}개, '
          f'출력 토큰 {out:,}개, 시간 {ms / 1000:.1f}초')

# 출력:
# 2단계 뜻: 다섯 문제 모두 answer 가 두세 가지로 나왔고, steps 는 4~10가지였다.
# t7 p16: 글자가 다른 답 10개, answer 3가지 (12, 36, 144), steps 10가지, 읽지 못한 답 0개, 정답 6/10, 1회차와 다른 회차 answer 4/9, steps 9/9
# t7 p17: 글자가 다른 답 6개, answer 3가지 (90, 180, 894), steps 4가지, 읽지 못한 답 1개, 정답 7/10, 1회차와 다른 회차 answer 3/9, steps 6/9
# t7 p18: 글자가 다른 답 10개, answer 2가지 (720, 7,200), steps 10가지, 읽지 못한 답 0개, 정답 6/10, 1회차와 다른 회차 answer 4/9, steps 9/9
# t7 p19: 글자가 다른 답 9개, answer 3가지 (529,200, 544,320, 5,443,200), steps 8가지, 읽지 못한 답 0개, 정답 4/10, 1회차와 다른 회차 answer 5/9, steps 9/9
# t7 p20: 글자가 다른 답 10개, answer 3가지 (90, 900, 1,000,000), steps 10가지, 읽지 못한 답 0개, 정답 5/10, 1회차와 다른 회차 answer 5/9, steps 9/9
# 3단계 뜻: temperature 0.7 에서 1회차와 다른 회차는 answer 21개, steps 42개다.
# temperature 0: 바뀐 문제 answer 0/5, steps 0/5 / 바뀐 회차 answer 0/45 (0%), steps 0/45 (0%)
# temperature 0.7: 바뀐 문제 answer 5/5, steps 5/5 / 바뀐 회차 answer 21/45 (47%), steps 42/45 (93%)
# 4단계 뜻: temperature 0.7 은 정답이 더 적고, 출력 토큰과 시간은 비슷하다.
# temperature 0: 정답 40/50, 읽지 못한 답 0개, 출력 토큰 3,970개, 시간 282.8초
# temperature 0.7: 정답 28/50, 읽지 못한 답 1개, 출력 토큰 3,997개, 시간 272.6초
```

temperature 0.7 에서는 다섯 문제 모두 answer 가 두세 가지였습니다. p16 은 144 말고도 12 와 36 이, p20 은 900 말고도 90 과 1,000,000 이 나왔습니다. 정답은 50개 중 28개로 temperature 0 의 40개보다 적습니다. 다만 p19 는 temperature 0 이 10번 모두 틀렸는데, 0.7 은 4번 정답 544,320 을 답했습니다. p17 의 9회차는 닫는 중괄호 없이 끝나 읽지 못한 답이 되었습니다. 출력 토큰 합은 3,970개와 3,997개, 시간 합은 282.8초와 272.6초로 비슷했습니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-llm-cost-cards.html?embed=1&card=variance" height="480" loading="lazy" title="같은 입력 10번의 answer 와 steps, temperature 0 과 0.7"></iframe>
<a class="demo-embed-open" href="demo-llm-cost-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 4. 긴 답은 더 흔들립니다

**temperature 0.7 의 2~10회차 45개를 1회차와 비교했습니다. answer 는 21회차(47%), steps 는 42회차(93%)가 달랐습니다. 정수 하나인 answer 보다 영어 구의 목록인 steps 가 두 배 자주 바뀌었습니다.**

[관심사 분류](post.html?id=interest-classification) 편은 라벨 한 낱말을 temperature 0.7 로 3번 더 물었습니다. 그때 바뀐 답은 0건이었고, 그 편은 긴 답의 흔들림을 LLM 기초 트랙에서 기록으로 본다고 적었습니다. 이 절이 그 기록입니다. 한 답 안에 짧은 answer 와 긴 steps 가 같이 있어서 둘을 나란히 셀 수 있습니다.

센 방법은 둘째 블록의 3단계입니다. 문제마다 2~10회차 9개를 1회차와 비교하고, answer 와 steps 가 다른 회차를 셉니다. steps 는 목록의 글자가 하나라도 다르면 다른 것으로 칩니다. 읽지 못한 답은 둘 다 다른 것으로 칩니다.

| 문제 | answer 가지 | 1회차와 다른 answer | steps 가지 | 1회차와 다른 steps | 정답 |
|---|---|---|---|---|---|
| p16 | 3 | 4/9 | 10 | 9/9 | 6/10 |
| p17 | 3 | 3/9 | 4 | 6/9 | 7/10 |
| p18 | 2 | 4/9 | 10 | 9/9 | 6/10 |
| p19 | 3 | 5/9 | 8 | 9/9 | 4/10 |
| p20 | 3 | 5/9 | 10 | 9/9 | 5/10 |
| 합 | | 21/45 | | 42/45 | 28/50 |

네 문제는 steps 가 9회차 모두 1회차와 달랐습니다. p16, p18, p20 은 steps 가 10가지라 같은 풀이가 한 번도 겹치지 않았습니다. answer 는 문제마다 두세 가지에 머물렀습니다. 고를 자리가 많은 긴 답이라 짧은 답보다 자주 바뀐 것으로 보입니다.

steps 가 바뀌어도 answer 는 같은 회차가 많습니다. p17 의 1회차는 「Calculate clicks: Afternoon budget / 310」 이라고 적었습니다. 2회차는 「Calculate afternoon clicks: Afternoon budget / 310」 이었습니다. 두 회차 모두 answer 는 90 입니다. 그래서 답을 비교할 때는 글자 전체가 아니라 읽어 낸 answer 를 비교합니다.

다만 이 기록은 한 모델에 문제 다섯을 10번씩 물은 결과입니다. 다른 모델이나 더 긴 답에서 이 비율이 그대로 나온다고 말할 수는 없습니다. 말할 수 있는 것은 같은 요청 안에서도 steps 가 answer 보다 자주 바뀌었다는 것입니다.

## 5. 지훈 씨의 계산표: 값은 토큰 셋, 답은 두 설정으로

**지훈 씨는 하루 값 셋과 캐시 몫, 두 설정의 흔들림을 한 장에 적어 선배에게 냈습니다. 서비스는 temperature 0 으로 두되, 같은 답이 맞는 답은 아니라는 것도 같이 적었습니다.**

지훈 씨가 먼저 적은 것은 요청 한 건의 토큰 셋입니다. 하루 값은 그 셋에 단가와 요청 수를 곱한 것이라, 셋 가운데 무엇을 줄일지가 먼저입니다. 이 요청에서는 시스템 메시지가 가장 크고, 그다음이 출력입니다. 시스템 메시지는 캐시로, 출력은 답의 길이로 줄입니다.

| 항목 | 값 | 어디서 |
|---|---|---|
| 요청 한 건 | 시스템 1,000 + 사용자 200, 출력 150 토큰 | 가상 요청 크기 |
| 작은 모델 | 하루 720,000원, 한 달 21,600,000원 | 첫 블록 3단계 |
| 큰 모델 | 하루 7,800,000원, 한 달 234,000,000원 | 첫 블록 3단계 |
| 큰 모델 + 시스템 캐시 | 하루 4,200,000원, 한 달 126,000,000원 | 첫 블록 4단계 |
| temperature 0, 10번 | 다섯 문제 모두 글자까지 같음, 정답 40/50 | t0 기록 50개 |
| temperature 0.7, 10번 | 바뀐 회차 answer 21/45, steps 42/45, 정답 28/50 | t7 기록 50개 |

모델은 맞힘이 같으면 작은 모델을 씁니다. 큰 모델이 꼭 필요하면 시스템 메시지를 앞에 고정해 캐시에 맞힙니다. 그래도 출력 3,000,000원은 남으니, 답을 짧게 받을지를 화면을 만드는 쪽과 함께 정합니다. steps 를 받으면 맞힘은 늘 수 있지만 출력 토큰도 늘어납니다.

서비스의 답은 temperature 0 으로 받습니다. 이 기록에서 temperature 0 은 같은 요청에 같은 답을 냈고, 0.7 보다 많이 맞혔습니다. 그래도 p19 처럼 틀린 답을 열 번 똑같이 내기도 합니다. 그래서 같은 답이 나오는지와 맞는 답인지는 따로 측정합니다.

계산은 하루 100만 요청을 두고 한 것입니다. 요청 수가 열 배면 하루 값도 열 배입니다. 지훈 씨는 표 아래에 단가와 요청 크기가 가상 값이라고 적고, 실제 단가는 가격 문서로 다시 세라고 덧붙였습니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-llm-cost-cards.html?embed=1&card=daily" height="480" loading="lazy" title="하루 100만 요청의 값 셋과 한 달 값"></iframe>
<a class="demo-embed-open" href="demo-llm-cost-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 6. 두 무대에서 값과 흔들림을 봅니다

**값을 세는 식과 흔들림을 측정하는 법은 두 무대가 같습니다. 다른 것은 요청 수가 어디서 오고, 답이 바뀌면 누가 보는지입니다.**

### 담장 안은 광고주 화면의 요청 수로 값을 셉니다 [무대: 닫힌 생태계]

한 회사가 서비스와 광고 서버를 다 가진 곳을 담장 안이라고 부릅니다. 광고주가 캠페인 화면에서 묻는 질문은 그 회사의 서버로 오니, 하루 요청 수를 그 회사가 셉니다. 시스템 메시지도 한 회사가 정하므로 모든 요청의 앞부분을 같게 두어 캐시에 맞히기 쉽습니다. 답이 바뀌면 화면의 광고주가 보므로, 숫자 답은 temperature 0 으로 받고 코드로 다시 셉니다.

### 열린 RTB 에서는 입찰 밖의 일에 값을 셉니다 [무대: 열린 RTB]

여러 회사가 실시간 경매로 남의 지면에 광고를 사고파는 곳을 열린 RTB 라고 부릅니다. 광고를 사는 쪽 시스템인 DSP 는 입찰 요청에 짧은 시간 안에 답해야 해서, 요청마다 모델을 부르지 않습니다. 그래서 모델은 지면 분류나 소재 검수처럼 미리 하는 일에 쓰고, 값은 그 일의 건수로 셉니다. 같은 지면을 두 번 분류해 답이 바뀌면 입찰 규칙이 흔들리니, 분류는 temperature 0 으로 하고 결과를 저장해 다시 씁니다.

## 한눈 정리

| 자리 | 무엇 | 이 글의 값 |
|---|---|---|
| 토큰 셋 | 시스템, 사용자, 출력을 따로 셈 | 1,000 + 200, 출력 150 토큰 |
| 토큰 단가 | 100만 토큰당 값, 출력이 더 비쌈 | 가상 단가, 큰 모델 입력 4,000원 출력 20,000원 |
| 하루 값 | 한 건 값 × 하루 요청 수 | 720,000원, 7,800,000원, 4,200,000원 |
| 프롬프트 캐시 | 앞부분이 같을 때만 맞음, 입력만 깎음 | 캐시 100% 면 54%, 출력이 71% |
| temperature 0 | 10번 물은 답이 같았음 | 다섯 문제 모두 글자까지 같음, 정답 40/50 |
| temperature 0.7 | 회차마다 seed 를 바꿔 10번 | 바뀐 회차 answer 21/45, steps 42/45 |
| 긴 답 | 고를 자리가 많아 더 자주 바뀜 | steps 93%, answer 47% |

## 헷갈리기 쉬운 점

- **프롬프트 캐시는 답을 캐시하는 것이 아닙니다.** 캐시에 남는 것은 프롬프트 앞부분을 읽은 계산이고, 답은 요청마다 새로 씁니다. OpenAI 의 문서는 캐시가 출력 토큰을 만드는 방식을 바꾸지 않는다고 적었습니다. 그래서 캐시를 써도 출력 토큰의 값은 그대로 냅니다. 같은 질문에 같은 답을 돌려주려면 답을 따로 저장해야 합니다.
- **temperature 0 이 같은 답을 내는 것은 같은 서버, 같은 설정의 이 기록 안에서입니다.** 이번 50개는 문제마다 10번이 같았습니다. 그런데 21주째 편의 steps 기록도 같은 맥, 같은 모델로 같은 요청을 temperature 0, seed 7 로 보냈습니다. 두 기록을 비교하면 p17 의 답 글자가 다릅니다. 21주째 답은 단계에 식만 적었고, 이번 답은 식 뒤에 계산한 값까지 적었습니다. answer 는 둘 다 90 이지만, 이 기록으로는 왜 달라졌는지 알 수 없습니다.
- **비용은 출력 토큰이 좌우할 때가 많습니다.** 출력 단가가 입력의 5배라, 큰 모델에서 출력 150 토큰이 한 건 7.80원 가운데 3.00원입니다. 시스템 메시지를 캐시에 다 맞히면 출력이 하루 값의 71% 가 됩니다. 풀이를 먼저 쓰게 하거나 thinking(답 앞의 풀이)을 켜면 이 몫이 더 커집니다.

## 더 깊이 보기

:::deep 요청 한 건의 값을 세는 식
`cost_won` 은 아래 식을 그대로 옮긴 것입니다. $p_{in}$ 과 $p_{out}$ 은 100만 토큰당 단가입니다. $N_{in}$ 은 캐시에서 읽은 토큰 $N_{cache}$ 까지 센 입력 토큰 전부입니다.

$$\mathrm{cost} = \frac{(N_{in} - N_{cache})\,p_{in} + 0.1\,N_{cache}\,p_{in} + N_{out}\,p_{out}}{10^6}$$

시스템 메시지 1,000 토큰 가운데 몫 $r$ 이 캐시에 맞으면 $N_{cache} = 1000\,r$ 입니다. 큰 모델에 넣으면 한 건의 값은 $r$ 에 대해 직선입니다.

$$\frac{(1200 - 1000r) \times 4000 + 0.1 \times 1000r \times 4000 + 150 \times 20000}{10^6} = 7.8 - 3.6\,r$$

$r$ 이 0.5 면 6.0원, 0.9 면 4.56원, 1 이면 4.2원입니다. 하루 100만 요청이면 2절 표의 값이 되고, 한 달은 30배입니다. 캐시에 처음 쓰는 토큰의 값은 이 식에 넣지 않았습니다.
:::

:::deep 비결정성의 다른 원인: 배치와 부동소수점
Thinking Machines 가 2025년에 낸 글이 이 원인을 다뤘습니다. 제목은 「Defeating Nondeterminism in LLM Inference」 입니다. 글은 temperature 0 에서도 LLM API 가 실제로는 결정적이지 않다고 적었습니다. 흔히 드는 설명은 GPU(병렬 계산용 칩)의 동시 계산과 부동소수점 덧셈의 차례입니다. 글은 이 설명이 틀리지는 않았지만 전부를 보여 주지는 않는다고 적었습니다. 글이 짚은 원인은 계산의 수치가 배치 크기에 따라 달라지는 커널(GPU 의 계산 함수)입니다. 배치는 서버가 여러 요청을 한 번에 묶어 계산하는 단위이고, 서버의 부하에 따라 그 크기가 바뀝니다. 글의 실험은 같은 질문을 temperature 0 으로 여러 번 받아 서로 다른 답이 여럿 나온 것을 보였습니다. 배치 크기와 상관없이 같은 차례로 더하는 커널을 쓰자 답이 모두 같아졌다고 적었습니다. 이 글의 기록은 맥 한 대에서 요청을 하나씩 보낸 것이라, 이 원인이 21주째 기록과의 차이를 만들었는지는 측정하지 않았습니다.
:::

- [LLM 모델 고르기](post.html?id=llm-model-selection) — 하루 100만 요청의 값 셋과 `cost_won` 을 처음 둔 20주째 편입니다.
- [프롬프트와 Chain-of-Thought](post.html?id=prompting-chain-of-thought) — 이 글이 쓴 steps 시스템 메시지를 처음 둔 21주째 편입니다.
- [관심사 분류](post.html?id=interest-classification) — 라벨 한 낱말은 temperature 0.7 에서도 바뀌지 않은 기록입니다.
- [비용, 캐시, 비결정성 카드 네 장](demo-llm-cost-cards.html) — 이 글의 카드 전체입니다. 카드를 누르면 헷갈리는 것 하나가 더 나옵니다.

## 참고문헌

- Anthropic. *Prompt caching*. Claude API 문서. [platform.claude.com](https://platform.claude.com/docs/en/build-with-claude/prompt-caching). 캐시가 tools, system, messages 차례의 앞부분이 같을 때 맞는다고 적었습니다. 캐시에서 읽은 토큰을 보통 입력보다 낮게 매긴다고 적었습니다.
- OpenAI. *Prompt caching*. API 문서. [developers.openai.com](https://developers.openai.com/api/docs/guides/prompt-caching). 앞부분 전체가 같아야 캐시를 다시 쓰고, 바뀌지 않는 지시를 앞에 두라고 적었습니다. 캐시가 출력을 만드는 방식을 바꾸지 않는다고 적었습니다.
- Horace He, Thinking Machines Lab (2025). *Defeating Nondeterminism in LLM Inference*. Thinking Machines 블로그. [thinkingmachines.ai](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/). temperature 0 에서도 답이 달라지는 원인을 배치 크기에 따라 수치가 바뀌는 커널로 짚었습니다.
