모델 팀 21주째 화요일, 지훈 씨는 지난주 [LLM 모델 고르기](post.html?id=llm-model-selection) 편에서 만들어 노트북의 모델에 물었던 숫자 문제 20개를 다시 꺼냈습니다. 이번에는 모델을 그대로 두고 묻는 말만 바꿔 보라고 선배가 말했습니다.

지훈 씨는 같은 문제를 세 번 물었습니다. 처음에는 문제만 보냈습니다. 두 번째에는 답까지 적어 둔 비슷한 문제 3개를 문제 앞에 붙였고 세 번째에는 계산 순서를 먼저 적고 답은 맨 끝에 쓰라고 했습니다. 세 번 모두 모델과 문제는 바꾸지 않았습니다.

**같은 문제를 묻는 말만 바꿔 보내면, 답은 어디서 왜 달라질까요?**

세 번의 답은 문제에 따라 조금씩 달랐습니다. 처음에 맞던 답이 두 번째에 틀린 문제도 있었고 세 번째에 처음으로 맞은 문제도 있었습니다. 대신 세 번째 답은 앞의 두 번보다 훨씬 길었고 받는 데도 오래 걸렸습니다. 세 번 가운데 어느 질문이 나은지는 문제를 하나씩 세어 봐야 알 수 있었습니다.

> **한 줄 요약:** 모델에 보내는 글 전체를 프롬프트라고 부릅니다. 같은 모델에 같은 문제를 보내도 프롬프트의 세 자리를 바꾸면 답이 달라집니다. 세 자리는 요청마다 같이 보내는 할 일 설명인 시스템 메시지, 그 시스템 메시지에 붙이는 예시, 답을 쓰는 순서를 정하는 지시 한 줄입니다. 예시 몇 개를 앞에 두는 방식은 few-shot, 답 앞에 풀이 단계를 쓰게 하는 방식은 Chain-of-Thought(CoT)라고 부릅니다. 광고 운영 숫자 문제 20개를 이 세 자리만 다른 프롬프트 세 벌로 물었더니 문제만 보낸 plain 은 14개, 예시 3개를 붙인 fewshot 은 13개, 단계를 먼저 쓰게 한 steps 는 17개를 맞혔습니다. 대신 steps 는 답에 단계가 함께 들어가 모델이 쓴 출력 토큰(토큰은 모델이 글을 읽고 쓰는 조각)이 plain 의 7.5배였습니다. 시간 합도 plain 의 4.2배였습니다. 세 벌 모두 한 단계로 푸는 문제는 다 맞혀서 맞힘의 차이는 두세 단계로 푸는 문제에서만 났습니다.

> **골라 읽는 법** — 절이 6개입니다. 절마다 있는 표나 코드나 카드만 보고 넘어가도 됩니다.
>
> - 답을 바꾸는 세 자리와 프롬프트 세 벌 → 1절
> - 문제만 보낸 plain 의 맞힘과 토큰 → 2절
> - 예시 3개를 붙인 fewshot 의 기록과 바뀐 답 → 3절
> - 단계를 먼저 쓰게 한 steps 의 기록과 세 벌 비교 → 4절
> - 늘어난 토큰과 더 맞힌 문제 → 5절
> - 두 무대에서 기다릴 수 있는 시간 → 6절

이 글의 문제 20개와 예시 3개는 설명을 위해 만든 가상 데이터입니다. 반면 모델의 답과 토큰 수와 걸린 시간은 지어낸 값이 아니라 2026-11-05 에 이 블로그를 쓰는 맥에서 Ollama 로 qwen3.5:27b 를 띄워 기록한 값입니다. Ollama 는 공개된 모델을 개인 컴퓨터에서 돌리는 도구입니다. 세 벌 모두 thinking(모델이 답을 쓰기 전에 먼저 쓰는 풀이)을 끄고 temperature 0 과 seed 7 로 문제마다 한 번씩 물었습니다. temperature 는 다음 토큰을 얼마나 흔들리게 뽑을지 정하는 값입니다. seed 는 다음 토큰을 뽑을 때 쓰는 난수의 시작값입니다. 기록 파일 3개는 `data/llm-records/` 에 있고 파일 이름이 각각 plain, fewshot, steps 로 끝납니다. 2절 블록의 두 상수 RECORD 와 USAGE 는 `--export-constant --with-usage` 가 찍은 줄 그대로입니다. 3절과 4절의 블록도 맨 위 주석에 적은 기록 파일에서 두 상수를 옮겼습니다.

---

## 1. 답을 바꾸는 세 자리와 프롬프트 세 벌

**세 벌은 사용자 메시지, 모델, 설정이 모두 같고 시스템 메시지만 다릅니다. 시스템 메시지 안에서 바꾼 세 자리는 할 일 설명, 예시, 답을 쓰는 순서를 정하는 지시 한 줄입니다.**

세 번의 답이 왜 달라졌는지 따지려면 세 번의 요청에서 무엇이 그대로였고 무엇이 바뀌었는지부터 알아야 합니다. 요청 한 건에는 글이 2개 들어갑니다. 하나는 요청마다 같이 보내는 할 일 설명인 시스템 메시지이고 다른 하나는 이번에 물을 글인 사용자 메시지입니다. 사용자 메시지는 세 벌 모두 「문제: 」 뒤에 문제 한 줄을 붙인 같은 글입니다. 노출 가운데 클릭의 비율인 클릭률을 묻는 p01 이면 「문제: 노출 120,000건에서 클릭이 3,600건이면 클릭률은 몇 %인가?」를 보냅니다. 두 메시지를 요청에 담는 꼴은 [LLM 호출 한 번](post.html?id=llm-first-call) 편에서 보았습니다.

첫째 자리는 시스템 메시지의 할 일 설명이고 plain 에서는 「문제를 읽고 정수 답 하나를 JSON {"answer": 정수} 로만 답한다. 설명을 쓰지 않는다.」 두 문장입니다. JSON 은 이름과 값의 짝을 중괄호로 묶어 적는 꼴입니다. plain 의 기록에서 p01 의 답은 클릭 3,600건을 노출 120,000건으로 나눈 3% 에서 숫자 3 만 담은 {"answer": 3} 한 줄이었습니다. plain 의 두 문장은 지난 편에서 쓴 시스템 메시지와 글자까지 같으므로 plain 은 지난 편의 기록과 비교하는 기준이 됩니다.

둘째 자리인 예시는 fewshot 에만 있습니다. fewshot 은 plain 의 두 문장 뒤에 「예시 셋:」이라는 줄과 문제 3개, 그 답을 붙였습니다. 예시 문제는 20개 밖에서 새로 만들었습니다. 첫 예시는 「광고비 450,000원으로 클릭 1,500건을 얻었다면 클릭당 비용은 몇 원인가?」 다음 줄에 {"answer": 300} 이 붙어 있습니다. 세 예시의 답 300, 80, 2000 은 모두 20개에 바라는 답과 같은 JSON 꼴로 적었습니다. 예시는 풀이 없이 문제와 답의 꼴만 보여 줍니다.

셋째 자리인 지시 한 줄은 답을 쓰는 순서를 정하며 steps 에만 있습니다. steps 의 시스템 메시지는 「먼저 steps 에 영어 짧은 구로 단계를 적고(최대 5개) 마지막에 answer 를 적는다.」로 시작하고 답의 꼴도 {"steps": [...], "answer": 정수} 로 정합니다. 곧 CoT 는 시스템 메시지에 지시 한 줄을 넣고 답 JSON 에 steps 칸(필드)을 추가하는 2가지만 바꿉니다. 이 블로그는 기록하는 답에 영어와 숫자만 쓰게 하므로 단계도 영어로 적게 했습니다.

Chain-of-Thought 라는 이름은 Wei 등이 2022년에 낸 논문에서 나왔습니다. 이 논문은 파라미터(학습으로 정해지는 모델 안의 숫자)가 5,400억 개인 모델의 프롬프트 앞에 풀이까지 적은 예시 여덟 개를 두었고 이 방법으로 수학 문장 문제 데이터셋 GSM8K 에서 당시 가장 높은 정확도를 냈다고 적었습니다. 반면 Kojima 등은 예시를 하나도 두지 않고 답 앞에 「Let's think step by step」 한 줄만 붙였습니다. steps 도 예시 없이 지시 한 줄로 단계를 쓰게 하므로 Wei 등보다 Kojima 등의 방식에 가깝습니다.

| 자리 | 정하는 내용 | plain | fewshot | steps |
|---|---|---|---|---|
| 시스템 메시지의 할 일 설명 | 모델이 할 일과 답의 꼴 | 정수 답 하나, 설명 없음 | plain 과 같음 | 단계를 먼저, 답은 끝에 |
| 예시 | 같은 꼴로 적은 문제와 답 | 없음 | 문제 3개, 답 300, 80, 2000 | 없음 |
| 지시 한 줄 | 답을 쓰는 순서와 꼴 | 없음 | 없음 | steps 최대 5개, 그다음 answer |
| 그대로 둔 것 | 나머지 전부 | 사용자 메시지, qwen3.5:27b, thinking 끔, temperature 0, seed 7 | 같음 | 같음 |

첫 카드는 요청 안에서 시스템 메시지와 사용자 메시지가 놓이는 곳과 답이 달라지는 세 자리를 보여 줍니다. 카드에서 파랑은 plain, 먹색은 fewshot, 벽돌색은 steps 를 나타냅니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-prompting-cards.html?embed=1&card=system" height="480" loading="lazy" title="시스템 메시지와 사용자 메시지, 답이 달라지는 세 자리"></iframe>
<a class="demo-embed-open" href="demo-prompting-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 2. 문제만 보낸 plain

**문제만 보낸 plain 은 20개 중 14개를 맞혔습니다. 한 단계 문제 10개는 모두 맞혔고 두세 단계 문제 10개는 4개만 맞혔습니다. 답이 정수 한 줄이라 출력 토큰은 20개를 합해도 163개였습니다. 시간은 20개를 합해 22.7초 걸렸습니다.**

아무것도 붙이지 않은 plain 의 맞힘, 토큰, 시간이 있어야 예시와 단계를 붙인 뒤에 무엇이 달라졌는지 말할 수 있습니다. 문제 20개는 지난 편의 그 20개이고 푸는 데 드는 단계 수에 따라 2가지로 나뉩니다. easy 10개는 p01 의 클릭률처럼 한 단계로 푸는 문제입니다. hard 10개는 두세 단계로 푸는 문제입니다. 하루 전환을 묻는 p11 은 하루 예산 300만 원을 클릭당 비용(클릭 한 번에 드는 광고비) 250원으로 나눠 클릭 12,000건을 구한 다음 전환율 2% 를 곱해야 답 240 이 나옵니다. 전환율은 클릭 가운데 구매 같은 전환이 일어난 비율입니다. 답은 모두 단위 없는 정수이며 문제와 정답은 블록의 PROBLEMS 에 함께 들어 있습니다.

블록 2단계의 `read_answer` 는 답이 JSON 객체이고 키가 answer 하나이며 그 값이 정수일 때만 읽은 답으로 칩니다. 「3.0」 같은 실수나 「"240"」 같은 글자, true 는 정수가 아니어서 꼴이 틀린 답이 됩니다. 꼴이 틀린 답은 읽지 못한 답으로 따로 세고 채점에서는 틀린 답으로 칩니다. 채점하는 `score` 와 결과를 찍는 `show` 는 3절과 4절의 블록도 그대로 씁니다. USAGE 는 문제마다 입력 토큰(모델이 읽은 프롬프트의 토큰 수), 출력 토큰, 걸린 시간(ms), 풀이 글자 수를 차례로 담습니다. 뒤 블록이 RECORD 와 USAGE 라는 이름을 다시 쓰므로 plain 의 두 상수는 `R_PLAIN` 과 `U_PLAIN` 에 옮겨 둡니다.

아래 블록은 plain 의 답 20개를 채점해 맞힌 수와 출력 토큰 합과 시간 합을 세려고 돌립니다.

```python
# 하는 일: 문제 20개를 문제만 보내 받은 답 20개를 채점하고, 맞힌 수와 출력 토큰 합과 시간 합을 센다.
# 기록 data/llm-records/prompting-chain-of-thought-plain.json 에서 옮김
import json

# 1단계: 문제 20개와 plain 기록을 둔다
# PROBLEMS 는 광고 운영 숫자 문제 20개다. 값은 설명을 위해 만든 것이고 answer 는 단위 없는 정수다.
# p01~p10 은 한 단계로 푸는 easy, p11~p20 은 두세 단계로 푸는 hard 다.
# USAGE 의 네 값은 차례대로 prompt_tokens, output_tokens, elapsed_ms, thinking_chars 다.
# 뒤 블록이 RECORD 와 USAGE 를 다시 쓰므로 R_PLAIN, U_PLAIN 에 옮겨 둔다.
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

RECORD = {"p01": "{\"answer\": 3}", "p02": "{\"answer\": 1440}", "p03": "{\"answer\": 4}", "p04": "{\"answer\": 250}", "p05": "{\"answer\": 100}", "p06": "{\"answer\": 200000}", "p07": "{\"answer\": 40}", "p08": "{\"answer\": 150}", "p09": "{\"answer\": 400}", "p10": "{\"answer\": 3000}", "p11": "{\"answer\": 240}", "p12": "{\"answer\": 9216}", "p13": "{\"answer\": 120}", "p14": "{\"answer\": 4687}", "p15": "{\"answer\": 36}", "p16": "{\"answer\": 144}", "p17": "{\"answer\": 90}", "p18": "{\"answer\": 720}", "p19": "{\"answer\": 529200}", "p20": "{\"answer\": 900}"}
USAGE = {"p01": [72, 6, 1246, 0], "p02": [70, 9, 929, 0], "p03": [68, 6, 978, 0], "p04": [75, 8, 1040, 0], "p05": [68, 8, 868, 0], "p06": [82, 11, 1244, 0], "p07": [69, 7, 799, 0], "p08": [72, 8, 1042, 0], "p09": [85, 8, 1049, 0], "p10": [88, 9, 1119, 0], "p11": [75, 8, 1044, 0], "p12": [81, 9, 1108, 0], "p13": [85, 8, 1059, 0], "p14": [91, 9, 1115, 0], "p15": [101, 7, 1000, 0], "p16": [101, 8, 1268, 0], "p17": [96, 7, 1359, 0], "p18": [111, 8, 1545, 0], "p19": [88, 11, 1509, 0], "p20": [93, 8, 1371, 0]}
R_PLAIN, U_PLAIN = RECORD, USAGE

# 2단계: 답을 정수로 읽고 채점한다
# JSON 객체이고 키가 answer 하나이며 값이 정수일 때만 읽은 답이다. 그 밖은 읽지 못한 답으로 세고 틀린 답으로 친다.
ANSWER = {p['id']: p['answer'] for p in PROBLEMS}
LEVEL = {p['id']: p['level'] for p in PROBLEMS}
IDS = list(ANSWER)


def read_answer(text):
    try:
        obj = json.loads(text)
    except ValueError:
        return None
    if not isinstance(obj, dict) or list(obj) != ['answer'] or type(obj['answer']) is not int:
        return None                            # 3.0 같은 실수, "240" 같은 글자, true 는 정수가 아니다
    return obj['answer']


def score(record, usage, reader):
    got = {i: reader(record[i]) for i in IDS}
    right = {i: got[i] == ANSWER[i] for i in IDS}
    return {'got': got, 'right': right,
            'unread': sum(v is None for v in got.values()),
            'easy': sum(right[i] for i in IDS if LEVEL[i] == 'easy'),
            'hard': sum(right[i] for i in IDS if LEVEL[i] == 'hard'),
            'in': sum(usage[i][0] for i in IDS), 'out': sum(usage[i][1] for i in IDS), 'ms': sum(usage[i][2] for i in IDS),
            'inp': (min(usage[i][0] for i in IDS), max(usage[i][0] for i in IDS))}


def show(name, s):
    print(f'{name}: 맞힘 {s["easy"] + s["hard"]}개 (easy {s["easy"]}, hard {s["hard"]}), 읽지 못한 답 {s["unread"]}개')
    print(f'{name}: 입력 {s["inp"][0]}~{s["inp"][1]} 토큰, 출력 토큰 합 {s["out"]:,}개, 시간 합 {s["ms"] / 1000:.1f}초')
    wrong = [f'{i} {s["got"][i]}' for i in IDS if not s['right'][i]]
    print(f'{name} 틀림: ' + ', '.join(wrong))


plain = score(R_PLAIN, U_PLAIN, read_answer)
show('plain', plain)

# 출력:
# 2단계 뜻: 20개 모두 읽혔다. easy 는 모두, hard 는 4개를 맞혔다.
# plain: 맞힘 14개 (easy 10, hard 4), 읽지 못한 답 0개
# plain: 입력 68~111 토큰, 출력 토큰 합 163개, 시간 합 22.7초
# plain 틀림: p12 9216, p13 120, p14 4687, p15 36, p18 720, p19 529200
```

첫 줄의 「맞힘 14개 (easy 10, hard 4), 읽지 못한 답 0개」는 20개가 모두 정수 JSON 으로 읽혔고 easy 는 10개 모두, hard 는 p11, p16, p17, p20 의 4개만 맞혔다는 뜻입니다. 셋째 줄에 찍힌 틀린 6개 p12(광고비), p13(전환 건당 비용), p14(남은 예산으로 얻는 클릭), p15(예상 전환), p18(노출 1,000건당 기대 수익), p19(회원에게 노출한 광고비)는 지난 편에서 thinking 을 끈 답이 틀린 문제와 같고 틀린 답의 값까지 같습니다.

[모델 고르기 편](post.html?id=llm-model-selection)이 센 대로 이 6개 가운데 4개는 정답과 자릿수만 다릅니다. p15 는 pCTR(노출 대비 클릭 확률)과 pCVR(클릭 대비 전환 확률)로 예상 전환을 묻는 문제입니다. 노출 1,000,000건에 pCTR 1.2% 를 곱한 클릭 12,000건에 pCVR 3.0% 를 곱한 360 이 정답인데 plain 은 자릿수가 하나 적은 36 을 답했습니다. p12 도 정답 921,600 을 9,216 으로 답했습니다. plain 의 시스템 메시지가 설명을 쓰지 말라고 했으므로 모델이 왜 그렇게 계산했는지는 답 한 줄 어디에도 적혀 있지 않습니다.

둘째 줄에 찍힌 입력 토큰은 문제마다 68~111개입니다. 맞힘은 많을수록 좋습니다. 토큰이 적을수록 값이 덜 들고 시간이 짧을수록 덜 기다립니다. 이 맞힘 14개와 출력 토큰 163개와 시간 22.7초를 기준으로 3절과 4절에서 fewshot 과 steps 를 비교합니다.

## 3. 예시 3개를 붙인 fewshot

**예시 3개를 붙이자 맞힘이 14개에서 13개로 줄었고 plain 이 맞힌 p16 의 답 144 가 3 으로 바뀌었습니다. 예시가 들어간 만큼 입력 토큰은 문제마다 139개 늘었지만 답은 그대로 정수 한 줄이라 출력 토큰 합은 163개로 같았습니다.**

두 번째 시도에서 지훈 씨는 plain 의 시스템 메시지 뒤에 답까지 적은 비슷한 문제 3개를 붙였습니다. 예시 3개가 맞힘과 토큰을 바꾸는지는 plain 과 똑같이 채점해 두 기록을 나란히 놓으면 보입니다.

첫째 예시는 광고비 450,000원을 클릭 1,500건으로 나눠 클릭당 비용을 구하는 한 단계 문제이고 답은 300 입니다. 둘째 예시는 노출 400,000건에 클릭률 0.5% 와 전환율 4% 를 차례로 곱해 전환 80건을 구하는 두 단계 문제입니다. 셋째 예시도 두 단계 문제로, 하루 예산 200만 원 가운데 저녁에 쓰는 40% 를 저녁 클릭당 비용 400원으로 나눠 저녁 클릭 2000건을 구합니다. 3개 모두 풀이 없이 문제와 {"answer": 정수} 한 줄만 적었습니다.

앞 블록에 이어서 돌리는 아래 블록은 fewshot 의 답 20개를 앞 블록의 `read_answer` 와 `score` 로 똑같이 채점한 뒤 문제마다 plain 의 답과 비교해 달라진 문제만 찍습니다. 예시가 늘린 입력 토큰은 같은 문제의 두 기록에서 입력 토큰을 빼서 셉니다.

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 시스템 메시지에 예시 셋을 더해 받은 답 20개를 채점하고, plain 과 답이 바뀐 문제를 찾는다.
# 기록 data/llm-records/prompting-chain-of-thought-fewshot.json 에서 옮김

# 1단계: fewshot 기록을 둔다
# 시스템 메시지는 plain 의 두 문장 뒤에 PROBLEMS 밖의 문제 셋과 그 답을 같은 JSON 꼴로 붙였다.
# 사용자 메시지와 설정은 plain 과 같다. 바뀐 것은 시스템 메시지 하나다.
RECORD = {"p01": "{\"answer\": 3}", "p02": "{\"answer\": 1440}", "p03": "{\"answer\": 4}", "p04": "{\"answer\": 250}", "p05": "{\"answer\": 100}", "p06": "{\"answer\": 200000}", "p07": "{\"answer\": 40}", "p08": "{\"answer\": 150}", "p09": "{\"answer\": 400}", "p10": "{\"answer\": 3000}", "p11": "{\"answer\": 240}", "p12": "{\"answer\": 215040}", "p13": "{\"answer\": 3000}", "p14": "{\"answer\": 4062}", "p15": "{\"answer\": 36}", "p16": "{\"answer\": 3}", "p17": "{\"answer\": 90}", "p18": "{\"answer\": 720}", "p19": "{\"answer\": 54432}", "p20": "{\"answer\": 900}"}
USAGE = {"p01": [211, 6, 1988, 0], "p02": [209, 9, 1488, 0], "p03": [207, 6, 1942, 0], "p04": [214, 8, 1283, 0], "p05": [207, 8, 1220, 0], "p06": [221, 11, 1484, 0], "p07": [208, 7, 1086, 0], "p08": [211, 8, 1520, 0], "p09": [224, 8, 1340, 0], "p10": [227, 9, 1423, 0], "p11": [214, 8, 1794, 0], "p12": [220, 11, 1773, 0], "p13": [224, 9, 1395, 0], "p14": [230, 9, 1813, 0], "p15": [240, 7, 1505, 0], "p16": [240, 6, 1203, 0], "p17": [235, 7, 1338, 0], "p18": [250, 8, 1535, 0], "p19": [227, 10, 1394, 0], "p20": [232, 8, 1321, 0]}
R_FEW, U_FEW = RECORD, USAGE

# 2단계: 같은 방식으로 채점하고 plain 과 비교한다
# 읽는 법과 채점은 앞 블록의 read_answer, score 를 그대로 쓴다.
few = score(R_FEW, U_FEW, read_answer)
show('fewshot', few)
extra = [U_FEW[i][0] - U_PLAIN[i][0] for i in IDS]
span = f'{min(extra)}개' if min(extra) == max(extra) else f'{min(extra)}~{max(extra)}개'
print(f'예시 셋이 늘린 입력 토큰: 문제마다 {span}, 20개 합 {sum(extra):,}개')


def fmt(v):
    return '읽지 못한 답' if v is None else f'{v:,}'   # None 은 쉼표를 찍지 않고 말로 적는다


mark = {True: '맞음', False: '틀림'}
for i in IDS:
    if few['got'][i] != plain['got'][i]:
        print(f'바뀐 답 {i}: 정답 {ANSWER[i]:,}, plain {fmt(plain["got"][i])} ({mark[plain["right"][i]]}) '
              f'-> fewshot {fmt(few["got"][i])} ({mark[few["right"][i]]})')

# 출력:
# 2단계 뜻: 20개 모두 읽혔고 맞힘은 13개로 줄었다. 바뀐 답 5개 중 p16 만 맞던 답이 틀린 답이 되었다.
# fewshot: 맞힘 13개 (easy 10, hard 3), 읽지 못한 답 0개
# fewshot: 입력 207~250 토큰, 출력 토큰 합 163개, 시간 합 29.8초
# fewshot 틀림: p12 215040, p13 3000, p14 4062, p15 36, p16 3, p18 720, p19 54432
# 예시 셋이 늘린 입력 토큰: 문제마다 139개, 20개 합 2,780개
# 바뀐 답 p12: 정답 921,600, plain 9,216 (틀림) -> fewshot 215,040 (틀림)
# 바뀐 답 p13: 정답 12,000, plain 120 (틀림) -> fewshot 3,000 (틀림)
# 바뀐 답 p14: 정답 5,000, plain 4,687 (틀림) -> fewshot 4,062 (틀림)
# 바뀐 답 p16: 정답 144, plain 144 (맞음) -> fewshot 3 (틀림)
# 바뀐 답 p19: 정답 544,320, plain 529,200 (틀림) -> fewshot 54,432 (틀림)
```

찍힌 값을 보면 fewshot 도 20개가 모두 읽혔고 맞힘은 13개입니다. plain 과 답이 달라진 문제는 p12, p13, p14, p16, p19 의 5개입니다. 그중 4개는 틀린 답이 다른 틀린 답으로 바뀌었을 뿐입니다. p16 하나만 plain 이 맞힌 144 가 3 으로 바뀌어 틀렸으므로 hard 의 맞힘이 4개에서 3개로 줄었습니다.

p16 은 하루 예산 300만 원을 CPM(노출 1,000건당 비용) 6,250원으로 모두 쓰고 클릭률이 1.2%, 전환율이 2.5% 일 때 하루 전환을 묻는 문제입니다. fewshot 의 답도 풀이 없는 정수 한 줄이라 p16 이 왜 3 이 되었는지는 이 기록만으로 알 수 없습니다.

예시 3개는 답의 꼴을 보여 주지만 plain 도 이미 20개 모두 그 꼴대로 정수 JSON 을 답했습니다. 그래서 이 기록에서는 예시가 꼴에서 바로잡을 것이 없었고 맞힌 계산도 예시로 늘지 않았습니다.

대신 예시는 입력 토큰을 늘렸습니다. 입력 토큰은 문제마다 plain 의 68~111개에서 fewshot 의 207~250개가 되었습니다. 블록이 같은 문제의 두 기록에서 입력 토큰을 뺀 값은 20개 모두 139개였습니다. 그래서 입력 토큰 합은 139개의 20배인 2,780개가 늘어 1,671개에서 4,451개가 되었습니다. 시간 합도 22.7초에서 29.8초로 늘었지만 출력 토큰 합은 plain 과 같은 163개였습니다.

입력 토큰에도 값이 매겨지므로 예시는 요청 수만큼 값을 늘립니다. 요청 한 건의 값은 입력 토큰에 입력 단가를, 출력 토큰에 출력 단가를 곱해 더해서 셉니다. 세는 법은 [LLM 모델 고르기](post.html?id=llm-model-selection) 편 5절에 자세히 있습니다.

| 문제 | 정답 | plain 의 답 | fewshot 의 답 | 맞음과 틀림 |
|---|---|---|---|---|
| p12 | 921,600 | 9,216 | 215,040 | 틀림 → 틀림 |
| p13 | 12,000 | 120 | 3,000 | 틀림 → 틀림 |
| p14 | 5,000 | 4,687 | 4,062 | 틀림 → 틀림 |
| p16 | 144 | 144 | 3 | 맞음 → 틀림 |
| p19 | 544,320 | 529,200 | 54,432 | 틀림 → 틀림 |

아래 카드에는 예시 3개가 시스템 메시지의 어디에 들어가는지와 늘어난 입력 토큰이 나옵니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-prompting-cards.html?embed=1&card=fewshot" height="480" loading="lazy" title="예시 셋이 들어간 시스템 메시지와 늘어난 입력 토큰"></iframe>
<a class="demo-embed-open" href="demo-prompting-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 4. 단계를 먼저 쓰게 한 steps

**단계를 먼저 적게 하자 맞힘이 17개가 되었습니다. hard 는 4개에서 7개로 늘었고 easy 10개는 모두 맞았습니다. 출력 토큰 합은 답에 단계가 함께 들어가 163개에서 1,223개로 7.5배가 되었습니다. 시간 합은 4.2배로 늘었습니다.**

세 번째 시도는 계산 순서를 먼저 적고 답은 맨 끝에 쓰게 한 CoT 입니다. 답의 꼴이 {"steps": [...], "answer": 정수} 로 바뀌었으므로 답을 읽는 함수부터 새로 둡니다. 새 함수 `read_steps` 는 키가 steps 와 answer 2개뿐이고 steps 가 문자열 1~5개의 목록이며 answer 가 정수일 때만 읽은 답으로 칩니다. 그래서 단계를 6개 적었거나 answer 를 문자열로 적은 답은 읽지 못한 답이 됩니다. 채점하는 `score` 와 찍는 `show` 는 2절에서 둔 함수를 그대로 씁니다.

3단계는 단계에 숫자를 적은 답과 말로만 적은 답이 맞힘에서 다른지 보려고 hard 10개를 두 그룹으로 나눕니다. 단계 가운데 하나라도 두 자리 이상인 숫자를 적었으면 숫자를 적은 답이고 그렇지 않으면 말로만 적은 답입니다. 「1.」처럼 단계 앞에 붙인 번호는 숫자로 치지 않습니다.

4단계는 세 벌의 맞힘, 읽지 못한 답, 입력 토큰 합, 출력 토큰 합, 시간 합을 한 표로 찍습니다. 표의 배수는 plain 의 값을 1 로 둔 값입니다. 출력 배수 7.5 는 steps 의 출력 토큰 합이 plain 의 7.5배라는 뜻입니다.

앞의 두 블록에 이어서 돌리는 아래 블록은 steps 의 답 20개를 새 규칙으로 채점하고 프롬프트 세 벌의 맞힘과 토큰과 시간을 한 표로 비교합니다.

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 단계를 먼저 적게 해 받은 답 20개를 채점하고, 프롬프트 세 벌의 맞힘과 토큰과 시간을 한 표로 비교한다.
# 기록 data/llm-records/prompting-chain-of-thought-steps.json 에서 옮김
import re

# 1단계: steps 기록을 둔다
# 시스템 메시지는 steps 에 영어 짧은 구로 단계를 적고(최대 5개) 마지막에 answer 를 적으라고 한다.
# 답의 꼴은 {"steps": [...], "answer": 정수} 다. 줄바꿈이 섞인 답도 JSON 으로는 같다.
RECORD = {"p01": "{\n\"steps\": [\n\"Divide clicks by impressions\",\n\"3600 divided by 120000 equals 0.03\",\n\"Multiply the result by 100 to get percentage\",\n\"0.03 times 100 equals 3\"\n],\n\"answer\": 3\n}", "p02": "{\n\"steps\": [\n\"1. Convert CTR to decimal\",\n\"2. Multiply impressions by CTR\",\n\"3. Calculate final clicks\"\n],\n\"answer\": 1440\n}", "p03": "{\n\"steps\": [\n\"Divide conversions by clicks\",\n\"100 divided by 2500 is 0.04\",\n\"Multiply by 100 to get percent\",\n\"0.04 times 100 is 4\"\n],\n\"answer\": 4\n}", "p04": "{\"steps\": [\"Divide 600000 by 2400\", \"Calculate the result\"], \"answer\": 250}", "p05": "{\n\"steps\": [\n\"1. Convert the conversion rate percentage to a decimal.\",\n\"2. Multiply the total clicks by the decimal conversion rate.\",\n\"3. Calculate the final number of conversions.\"\n],\n\"answer\": 100\n}", "p06": "{\n\"steps\": [\n\"CPM is 4000 won per 1000 impressions\",\n\"Total impressions are 50000\",\n\"Divide total impressions by 1000 to get units\",\n\"Multiply units by CPM cost\",\n\"Calculate final cost\"\n],\n\"answer\": 200000\n}", "p07": "{\n\"steps\": [\n\"Divide 120 by 300\",\n\"Multiply the result by 100\"\n],\n\"answer\": 40\n}", "p08": "{\n\"steps\": [\n\"1. Divide total budget by cost per purchase.\",\n\"2. Calculate 3000000 divided by 20000.\"\n],\n\"answer\": 150\n}", "p09": "{\n\"steps\": [\n\"1. Divide sales by ad cost.\",\n\"2. Multiply the result by 100.\"\n],\n\"answer\": 400\n}", "p10": "{\n\"steps\": [\n\"Calculate total clicks by multiplying impressions by click-through rate\",\n\"Calculate expected revenue by multiplying total clicks by cost per click\",\n\"Compute final value as 12 times 250\"\n],\n\"answer\": 3000\n}", "p11": "{\n\"steps\": [\n\"1. Divide daily budget by cost per click\",\n\"2. Multiply total clicks by conversion rate\",\n\"3. Calculate final conversions\"\n],\n\"answer\": 240\n}", "p12": "{\n\"steps\": [\n\"Calculate clicks by multiplying impressions 384000 by click-through rate 0.0075\",\n\"Calculate total cost by multiplying clicks by cost per click 320\"\n],\n\"answer\": 921600\n}", "p13": "{\n\"steps\": [\n\"Calculate total conversions by multiplying clicks by conversion rate\",\n\"Divide total ad cost by total conversions to get cost per conversion\"\n],\n\"answer\": 120\n}", "p14": "{\n\"steps\": [\n\"Calculate remaining budget: 3000000 - 1375000\",\n\"Divide remaining budget by cost per click: 1625000 / 325\"\n],\n\"answer\": 5000\n}", "p15": "{\n\"steps\": [\n\"Calculate clicks by multiplying impressions by pCTR\",\n\"Convert pCTR percentage to decimal\",\n\"Calculate conversions by multiplying clicks by pCVR\",\n\"Convert pCVR percentage to decimal\",\n\"Compute final expected conversions\"\n],\n\"answer\": 36\n}", "p16": "{\n\"steps\": [\n\"Calculate total impressions by dividing budget by CPM\",\n\"Calculate total clicks by multiplying impressions by click-through rate\",\n\"Calculate total conversions by multiplying clicks by conversion rate\"\n],\n\"answer\": 144\n}", "p17": "{\n\"steps\": [\n\"Calculate afternoon budget: 3000000 * 0.62\",\n\"Calculate clicks: Afternoon budget / 310\",\n\"Calculate conversions: Clicks * 0.015\"\n],\n\"answer\": 90\n}", "p18": "{\n\"steps\": [\n\"Calculate pCTR as 0.012\",\n\"Calculate pCVR as 0.03\",\n\"Calculate expected conversions per 1000 impressions: 1000 * 0.012 * 0.03 = 0.36\",\n\"Calculate total revenue: 0.36 * 20000 = 7200\",\n\"eCPM is the revenue per 1000 impressions which is 7200\"\n],\n\"answer\": 7200\n}", "p19": "{\n\"steps\": [\n\"Calculate total impressions by multiplying members by average exposures\",\n\"Calculate total clicks by multiplying total impressions by click-through rate\",\n\"Calculate total cost by multiplying total clicks by cost per click\"\n],\n\"answer\": 5443200\n}", "p20": "{\n\"steps\": [\n\"Calculate revenue per click by multiplying revenue per purchase by conversion rate.\",\n\"Divide the calculated revenue per click by the target ROAS to find the maximum cost per click.\"\n],\n\"answer\": 900\n}"}
USAGE = {"p01": [102, 75, 5903, 0], "p02": [100, 47, 4007, 0], "p03": [98, 70, 5373, 0], "p04": [105, 33, 2781, 0], "p05": [98, 56, 4248, 0], "p06": [112, 83, 6135, 0], "p07": [99, 42, 3288, 0], "p08": [102, 52, 4161, 0], "p09": [115, 41, 3473, 0], "p10": [118, 61, 4575, 0], "p11": [105, 49, 3802, 0], "p12": [111, 64, 4912, 0], "p13": [115, 46, 3664, 0], "p14": [121, 68, 5096, 0], "p15": [131, 66, 5281, 0], "p16": [131, 55, 4483, 0], "p17": [126, 67, 5300, 0], "p18": [141, 131, 9372, 0], "p19": [118, 62, 5283, 0], "p20": [123, 55, 4453, 0]}
R_STEPS, U_STEPS = RECORD, USAGE

# 2단계: steps 꼴로 읽고 채점한다
# 키가 steps, answer 둘이고, steps 가 문자열 1~5개의 목록이며, answer 가 정수일 때만 읽은 답이다.
def read_steps(text):
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
    return obj['answer']


def steps_of(i):
    return json.loads(R_STEPS[i])['steps'] if steps['got'][i] is not None else []   # 읽지 못한 답은 단계도 없다


steps = score(R_STEPS, U_STEPS, read_steps)
show('steps', steps)
count = [len(steps_of(i)) for i in IDS if steps['got'][i] is not None]
print(f'steps 의 단계 수: 가장 적게 {min(count)}개, 가장 많이 {max(count)}개, 평균 {sum(count) / len(count):.2f}개')
print(f'steps 의 출력 토큰: 문제마다 {min(U_STEPS[i][1] for i in IDS)}~{max(U_STEPS[i][1] for i in IDS)}개')
print(f'p12 plain: 답 {fmt(plain["got"]["p12"])}, 출력 토큰 {U_PLAIN["p12"][1]}개 / '
      f'steps: 답 {fmt(steps["got"]["p12"])}, 출력 토큰 {U_STEPS["p12"][1]}개')
for i in IDS:
    if not steps['right'][i]:
        print(f'steps 틀림 {i}: 정답 {ANSWER[i]:,}, 답 {fmt(steps["got"][i])}, 단계 ' + ' / '.join(steps_of(i)))

# 3단계: hard 10개를 단계에 숫자를 적은 답과 말로만 적은 답으로 나눈다
# 두 자리 이상인 숫자가 한 단계라도 있으면 숫자를 적은 답으로 본다. 1. 같은 단계 번호는 세지 않는다.
hard = [i for i in IDS if LEVEL[i] == 'hard']
for name, keep in (('숫자를 적은 답', True), ('말로만 적은 답', False)):
    ids = [i for i in hard if any(re.search(r'\d{2,}', t) for t in steps_of(i)) == keep]
    print(f'hard 중 {name} {len(ids)}개, 맞힘 {sum(steps["right"][i] for i in ids)}개: {", ".join(ids)}')

# 4단계: 세 벌을 한 표로 비교한다
# 배수는 plain 을 1 로 둔 값이고, 출력 토큰과 시간에 붙인다.
print('프롬프트 | 맞힘 | easy | hard | 읽지 못한 답 | 입력 토큰 합 | 출력 토큰 합 | 시간 합 | 출력 배수 | 시간 배수')
for name, s in (('plain', plain), ('fewshot', few), ('steps', steps)):
    print(f'{name} | {s["easy"] + s["hard"]} | {s["easy"]} | {s["hard"]} | {s["unread"]} | {s["in"]:,} | {s["out"]:,} | '
          f'{s["ms"] / 1000:.1f}초 | {s["out"] / plain["out"]:.1f} | {s["ms"] / plain["ms"]:.1f}')
gain = (steps['easy'] + steps['hard']) - (plain['easy'] + plain['hard'])
if gain > 0:
    print(f'steps 는 plain 보다 {gain}개 더 맞혔다. 출력 토큰을 {steps["out"] - plain["out"]:,}개 더 썼고, 하나에 {(steps["out"] - plain["out"]) / gain:,.0f}개다')

# 출력:
# 2단계 뜻: 20개 모두 steps 꼴로 읽혔고 17개를 맞혔다.
# steps: 맞힘 17개 (easy 10, hard 7), 읽지 못한 답 0개
# steps: 입력 98~141 토큰, 출력 토큰 합 1,223개, 시간 합 95.6초
# steps 틀림: p13 120, p15 36, p19 5443200
# steps 의 단계 수: 가장 적게 2개, 가장 많이 5개, 평균 3.00개
# steps 의 출력 토큰: 문제마다 33~131개
# p12 plain: 답 9,216, 출력 토큰 9개 / steps: 답 921,600, 출력 토큰 64개
# steps 틀림 p13: 정답 12,000, 답 120, 단계 Calculate total conversions by multiplying clicks by conversion rate / Divide total ad cost by total conversions to get cost per conversion
# steps 틀림 p15: 정답 360, 답 36, 단계 Calculate clicks by multiplying impressions by pCTR / Convert pCTR percentage to decimal / Calculate conversions by multiplying clicks by pCVR / Convert pCVR percentage to decimal / Compute final expected conversions
# steps 틀림 p19: 정답 544,320, 답 5,443,200, 단계 Calculate total impressions by multiplying members by average exposures / Calculate total clicks by multiplying total impressions by click-through rate / Calculate total cost by multiplying total clicks by cost per click
# 3단계 뜻: 단계에 숫자를 적은 hard 4개는 모두 맞았고, 말로만 적은 6개는 3개를 맞혔다. 틀린 3개는 단계를 말로만 적었다.
# hard 중 숫자를 적은 답 4개, 맞힘 4개: p12, p14, p17, p18
# hard 중 말로만 적은 답 6개, 맞힘 3개: p11, p13, p15, p16, p19, p20
# 4단계 뜻: steps 는 맞힘이 가장 많고, 출력 토큰은 7.5배, 시간은 4.2배다. fewshot 은 입력 토큰만 늘었다.
# 프롬프트 | 맞힘 | easy | hard | 읽지 못한 답 | 입력 토큰 합 | 출력 토큰 합 | 시간 합 | 출력 배수 | 시간 배수
# plain | 14 | 10 | 4 | 0 | 1,671 | 163 | 22.7초 | 1.0 | 1.0
# fewshot | 13 | 10 | 3 | 0 | 4,451 | 163 | 29.8초 | 1.0 | 1.3
# steps | 17 | 10 | 7 | 0 | 2,271 | 1,223 | 95.6초 | 7.5 | 4.2
# steps 는 plain 보다 3개 더 맞혔다. 출력 토큰을 1,060개 더 썼고, 하나에 353개다
```

2단계에 찍힌 대로 steps 의 답 20개는 모두 정해 둔 꼴로 읽혔고 그중 17개가 맞았습니다. 단계는 가장 적게 2개, 가장 많이 5개, 평균 3.00개였습니다. 출력 토큰은 문제마다 33개에서 131개였습니다.

광고비를 묻는 p12 는 노출 384,000건에 클릭률 0.75% 를 곱해 클릭 수를 구하고 여기에 클릭당 비용 320원을 곱하는 문제입니다. plain 은 출력 토큰 9개로 9,216 이라고 답했지만 steps 는 단계에 384000, 0.0075, 320 을 적고 출력 토큰 64개를 써서 정답 921,600 을 답했습니다.

steps 도 3개는 틀렸습니다. p13 은 120, p15 는 36 으로 plain 과 같은 답을 냈습니다. 회원 72,000명에게 평균 4.5건씩 노출한 광고비를 묻는 p19 는 정답 544,320 의 10배인 5,443,200 을 답했습니다.

p13 의 단계는 전환 수를 먼저 구하고 광고비를 그 전환 수로 나눈다는 맞는 순서를 영어로 적었습니다. 이 순서대로 클릭 4,200건에 전환율 2.5% 를 곱해 전환 수를 구하고 광고비 1,260,000원을 그 전환 수로 나누면 정답 12,000 이 나와야 하는데 모델의 답은 120 이었습니다. p13 은 단계가 맞는 말이었는데도 답이 그 단계를 따라 맞지 않았습니다.

3단계 줄을 보면 hard 10개 가운데 단계에 숫자를 적은 답은 p12, p14, p17, p18 의 4개이고 4개 모두 맞았습니다. 말로만 적은 답은 p11, p13, p15, p16, p19, p20 의 6개인데 그중 3개만 맞았습니다. 숫자를 적은 답은 p12 처럼 계산에 쓸 값을 단계 안에 적어 두었습니다. 다만 10개를 두 그룹으로 나눈 결과일 뿐이라 숫자를 적게 하면 맞는다고 말할 수는 없습니다.

4단계가 찍은 세 벌 비교에서 배수를 뺀 나머지를 아래 표에 옮겼습니다.

| 프롬프트 | 맞힘 | easy | hard | 읽지 못한 답 | 입력 토큰 합 | 출력 토큰 합 | 시간 합 |
|---|---|---|---|---|---|---|---|
| plain | 14 | 10 | 4 | 0 | 1,671 | 163 | 22.7초 |
| fewshot | 13 | 10 | 3 | 0 | 4,451 | 163 | 29.8초 |
| steps | 17 | 10 | 7 | 0 | 2,271 | 1,223 | 95.6초 |

다음 카드는 단계를 먼저 쓰게 한 답과 문제만 보낸 답을 나란히 놓았습니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-prompting-cards.html?embed=1&card=cot" height="480" loading="lazy" title="단계를 먼저 쓰게 한 답과 문제만 보낸 답"></iframe>
<a class="demo-embed-open" href="demo-prompting-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 5. 늘어난 토큰과 더 맞힌 문제

**세 벌 모두 easy 10개를 맞혀서 맞힘의 차이는 모두 hard 10개에서 났습니다. steps 가 plain 보다 더 맞힌 문제는 p12, p14, p18 의 3개입니다. steps 는 20개 전체에서 출력 토큰을 1,060개 더 썼으므로 더 맞힌 문제 하나에 353개가 들었습니다.**

steps 는 맞힘이 가장 많았지만 출력 토큰도 가장 많이 썼습니다. 토큰이 늘 때 어느 문제에서 맞힘이 늘었는지는 hard 10개를 문제마다 세 벌로 놓고 보면 알 수 있습니다.

easy 10개는 세 벌 모두 맞혔습니다. 한 단계 문제는 문제만 보내도 맞아서 예시나 단계가 더 도울 것이 없었습니다. 그래서 세 벌의 맞힘 차이는 hard 10개에서만 났습니다. 아래 표에는 hard 10개의 맞음과 틀림을 세 벌로 적고 마지막 열에 steps 가 단계에 숫자를 적었는지 말로만 적었는지를 두었습니다.

| 문제 | plain | fewshot | steps | steps 의 단계 |
|---|---|---|---|---|
| p11 | 맞음 | 맞음 | 맞음 | 말로만 |
| p12 | 틀림 | 틀림 | 맞음 | 숫자를 적음 |
| p13 | 틀림 | 틀림 | 틀림 | 말로만 |
| p14 | 틀림 | 틀림 | 맞음 | 숫자를 적음 |
| p15 | 틀림 | 틀림 | 틀림 | 말로만 |
| p16 | 맞음 | 틀림 | 맞음 | 말로만 |
| p17 | 맞음 | 맞음 | 맞음 | 숫자를 적음 |
| p18 | 틀림 | 틀림 | 맞음 | 숫자를 적음 |
| p19 | 틀림 | 틀림 | 틀림 | 말로만 |
| p20 | 맞음 | 맞음 | 맞음 | 말로만 |

steps 가 새로 맞힌 p12, p14, p18 은 3개 모두 단계에 숫자를 적은 답입니다. p16 은 세 벌 가운데 fewshot 만 틀린 문제입니다. steps 는 p16 에서 plain 과 같은 정답 144 를 냈습니다. 세 벌이 모두 틀린 p13, p15, p19 는 3개 모두 steps 가 단계를 말로만 적은 문제입니다.

fewshot 과 steps 는 토큰이 늘어난 곳이 다릅니다. fewshot 은 예시가 들어간 입력 토큰만 늘어 입력 토큰 합이 1,671개에서 4,451개가 되었고 출력 토큰은 163개 그대로였습니다. steps 는 입력 토큰 합이 2,271개로 조금만 늘었는데 출력 토큰 합은 답에 단계가 들어가 1,223개로 7.5배가 되었습니다. 이 1,223개에서 plain 의 163개를 뺀 1,060개를 더 맞힌 3개로 나누면 하나에 353개입니다. 시간 합도 95.6초로 plain 의 4.2배였습니다.

지난 편 기록에서 같은 hard 10개는 thinking 을 켜자 10개 모두 맞았습니다. 그때 쓴 출력 토큰은 hard 10개에서만 7,713개였습니다. steps 는 20개 전부에 출력 토큰 1,223개를 쓰고 hard 를 7개 맞혔습니다. 두 숫자는 따로 측정한 기록에서 나왔으므로 나란히 놓고 볼 뿐 몇 배인지 나눠서 비교하지는 않습니다.

정답률은 맞힌 문제의 비율입니다. 두 정답률의 차이는 퍼센트포인트(%p)로 적습니다. 20개에서는 한 문제가 정답률 5%p 라서 plain 과 fewshot 의 14개와 13개는 p16 한 문제, 5%p 차이입니다. steps 의 17개도 hard 3개에서 난 차이입니다. 이 기록만으로는 다른 문제나 다른 모델에서도 같은 차이가 난다고 말할 수 없습니다.

마지막 카드에서 세 벌의 맞힘, 출력 토큰, 시간을 한 번에 비교할 수 있습니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-prompting-cards.html?embed=1&card=result" height="480" loading="lazy" title="세 벌의 맞힘과 출력 토큰과 시간"></iframe>
<a class="demo-embed-open" href="demo-prompting-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 6. 두 무대에서 기다릴 수 있는 시간

**프롬프트의 세 자리는 두 무대에서 같습니다. 두 무대는 답을 기다릴 수 있는 시간과 같은 프롬프트를 보내는 횟수가 다릅니다.**

앞에서 steps 는 시간 합이 plain 의 4.2배였습니다. fewshot 은 요청마다 입력 토큰을 139개씩 더 보냈습니다. 두 무대에서 이 두 숫자가 어떻게 작용하는지 차례로 봅니다.

### 담장 안: 단계를 기다릴 수 있는 캠페인 화면 [무대: 닫힌 생태계]

담장 안은 한 회사가 서비스와 광고 서버를 모두 가진 곳입니다. 광고주가 캠페인 화면에서 숫자를 물으면 답은 화면 앞의 사람에게 가므로, steps 가 20개에 95.6초로 plain 의 4.2배가 걸리고 출력 토큰을 7.5배 쓰더라도 광고주는 단계를 쓰는 시간을 기다릴 수 있습니다. steps 의 단계는 영어 짧은 구라 광고주 화면에 그대로 내보이기보다 답을 고칠 때 어디서 틀렸는지 찾는 데 씁니다.

### 열린 RTB: 미리 하는 일에만 쓰는 프롬프트 [무대: 열린 RTB]

열린 RTB 는 여러 회사가 실시간 경매로 남의 지면(광고가 실리는 페이지나 앱 화면)에 광고를 사고파는 곳입니다. 광고를 사는 시스템인 DSP 는 입찰 요청에 100ms 안팎으로 답해야 하는데, 문제만 보낸 plain 도 20개에 22.7초가 걸린 이 모델은 입찰 요청을 받아 답을 돌려보내는 경로에 둘 수 없습니다. 그래서 모델은 지면 분류처럼 입찰 전에 미리 해 둘 수 있는 일에 씁니다. 이런 일에는 같은 프롬프트를 많이 보내므로 fewshot 의 예시 3개가 요청마다 늘리는 입력 토큰 139개가 하루 요청 수만큼 쌓입니다.

## 한눈 정리

| 자리 | 무엇 | 이 글의 값 |
|---|---|---|
| 프롬프트 | 모델에 보내는 글 전체, 시스템 메시지와 사용자 메시지 | 세 벌 모두 사용자 메시지는 같음 |
| plain | 할 일 설명 두 문장, 문제만 보냄 | 맞힘 14개, 출력 토큰 163개, 22.7초 |
| fewshot | plain 에 예시 3개를 붙임, 꼴만 보여 줌 | 맞힘 13개, 입력 토큰 문제마다 139개 늘어남 |
| steps | 단계를 먼저 쓰는 지시, CoT | 맞힘 17개, 출력 토큰 1,223개, 95.6초 |
| 읽지 못한 답 | 꼴이 틀린 답, 틀린 답으로 침 | 세 벌 모두 0개 |
| 차이가 난 곳 | 두세 단계 문제 hard 10개 | 맞힘 plain 4개, fewshot 3개, steps 7개 |

## 헷갈리기 쉬운 점

- **CoT 의 단계와 thinking 은 다른 자리입니다.** thinking 은 모델이 답 앞에 쓰는 풀이입니다. Ollama 는 이 풀이를 답과 다른 칸에 따로 담습니다. 반면 steps 의 단계는 모델이 시스템 메시지를 따라 답 JSON 의 steps 칸에 적은 글이라 답 안에 들어 있습니다. 이 글의 세 벌은 thinking 을 끄고 기록했으므로 세 벌의 USAGE 에서 넷째 값인 풀이 글자 수가 모두 0 입니다.
- **예시는 답을 알려 주지 않고 꼴을 보여 줍니다.** 예시 3개는 20개 밖의 문제이고 그 답 300, 80, 2000 은 20개의 정답 가운데 어디에도 없습니다. 세 예시는 문제 다음 줄에 {"answer": 정수} 한 줄을 쓴다는 꼴만 보여 줍니다. 이 기록에서는 plain 도 이미 그 꼴을 지켰으므로 예시를 붙여도 맞힘이 늘지 않았습니다.
- **20문제에서 난 정답률 차이는 문제가 늘면 달라질 수 있습니다.** 20개에서는 한 문제가 5%p 라서 14개와 13개의 차이는 p16 하나입니다. steps 의 17개도 hard 3개에서 난 차이입니다. 문제가 더 많으면 차이가 더 커질 수도 있고 줄어들 수도 있습니다. 그래서 프롬프트를 고를 때는 실제로 풀 문제를 더 모아 다시 측정합니다.

## 더 깊이 보기

:::deep self-consistency 는 풀이를 여러 번 뽑아 가장 많이 나온 답을 고릅니다
Wang 등의 2022년 논문은 CoT 의 풀이를 하나만 받지 않고 여러 갈래로 뽑습니다. 논문은 그중 가장 일관된 답, 곧 여러 풀이가 가장 많이 닿은 답을 고른다고 적었습니다. 이 방식을 self-consistency 라고 부르고, GSM8K 에서 CoT 의 성적을 +17.9% 올렸다고 적었습니다. 이 글의 기록은 temperature 0 으로 문제마다 한 번만 물어, 풀이 한 갈래만 받았습니다. 여러 갈래를 뽑으려면 temperature 를 올려 같은 문제를 여러 번 묻습니다. 그만큼 출력 토큰과 시간도 물은 횟수만큼 늡니다.
:::

:::deep 프롬프트 세 벌의 시스템 메시지 전문
세 벌의 사용자 메시지는 모두 「문제: 」 뒤에 PROBLEMS 의 문제 한 줄을 붙인 글입니다. 시스템 메시지는 아래와 같습니다. fewshot 의 예시 셋은 실제로는 줄을 바꿔 적었고, 표에서는 한 칸에 이어 적었습니다. 프롬프트 파일은 `data/llm-records/prompts/` 에 있습니다.

| 이름 | 시스템 메시지 |
|---|---|
| plain | 문제를 읽고 정수 답 하나를 JSON {"answer": 정수} 로만 답한다. 설명을 쓰지 않는다. |
| fewshot | plain 의 두 문장, 그다음 「예시 셋:」 / 문제: 광고비 450,000원으로 클릭 1,500건을 얻었다면 클릭당 비용은 몇 원인가? {"answer": 300} / 문제: 노출 400,000건에서 클릭률이 0.5%이고 전환율이 4%이면 전환은 몇 건인가? {"answer": 80} / 문제: 하루 예산 200만 원 중 40%를 저녁에 쓴다. 저녁 클릭당 비용이 400원이면 저녁 클릭은 몇 건인가? {"answer": 2000} |
| steps | 먼저 steps 에 영어 짧은 구로 단계를 적고(최대 5개) 마지막에 answer 를 적는다. JSON {"steps": [...], "answer": 정수} 로만 답한다. steps 의 문자열은 영어와 숫자만 쓴다. |
:::

- [LLM 호출 한 번](post.html?id=llm-first-call) — 요청과 응답 JSON 의 필드를 읽은 19주째 편입니다.
- [LLM 모델 고르기](post.html?id=llm-model-selection) — 같은 문제 20개에 thinking 을 끄고 켠 20주째 편입니다.
- [프롬프트 카드 네 장](demo-prompting-cards.html) — 이 글의 카드 전체입니다. 카드를 누르면 헷갈리는 것 하나가 더 나옵니다.

## 참고문헌

- Jason Wei et al. (2022). *Chain-of-Thought Prompting Elicits Reasoning in Large Language Models*. arXiv:2201.11903. [arxiv.org](https://arxiv.org/abs/2201.11903). 풀이를 적은 예시 여덟 개로 540B 모델이 GSM8K 에서 가장 높은 정확도를 냈다고 적었습니다.
- Takeshi Kojima et al. (2022). *Large Language Models are Zero-Shot Reasoners*. arXiv:2205.11916. [arxiv.org](https://arxiv.org/abs/2205.11916). 답 앞에 「Let's think step by step」 한 줄을 붙이는 방식을 적었습니다.
- Xuezhi Wang et al. (2022). *Self-Consistency Improves Chain of Thought Reasoning in Language Models*. arXiv:2203.11171. [arxiv.org](https://arxiv.org/abs/2203.11171). 풀이를 여러 갈래로 뽑아 가장 일관된 답을 고르는 방식을 적었습니다.
