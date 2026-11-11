모델 팀 41주째 월요일, 지훈 씨는 카피를 쓰는 모델을 직접 고치게 되었습니다. 40주째에는 실험 하나를 계획부터 마무리까지 프로그램에게 맡겼는데, 이번에는 모델의 숫자를 바꿉니다.

손에 든 것은 서연 씨 러닝화에 쓴 카피 12개와, 둘 가운데 나은 쪽을 정한 기록 20개입니다. 코드 검사에 걸린 카피와 지난 카피, 채점하는 모델이 고른 쪽, 광고주가 고쳐 쓴 문장이 섞여 있습니다. 선배는 좋은 카피만 골라 따라 쓰게 하면 나쁜 카피도 같이 늘 수 있다고 말했습니다.

**좋은 카피와 나쁜 카피를 짝지어 보여 주면, 모델은 어느 쪽으로 얼마나 움직이고 언제 멈춰야 할까요?**

좋은 답 하나를 그대로 따라 쓰게 하는 학습을 SFT, 둘 가운데 고른 쪽으로 모델을 미는 학습을 DPO 라고 부릅니다. 고른 쪽 chosen 과 고르지 않은 쪽 rejected 를 묶은 것은 선호 쌍입니다. 학습한 모델이 쓴 카피는 광고주에게 바로 보이고, 심사에서 빠지면 그 광고는 나가지 않습니다.

> **한 줄 요약:** 토큰 12개짜리 유니그램 모델에서 SFT 한 걸음은 chosen 의 로그 확률을 -12.425 에서 -11.121 로 올렸습니다. 공유 토큰 셋 때문에 rejected 도 -12.121 로 올랐습니다. 같은 시작점에서 DPO 한 걸음은 chosen 을 올리고 rejected 를 내렸고, 공유 토큰은 0.000 움직였습니다. 가상 선호 쌍 20개의 DPO 손실은 정책과 참조 모델의 로그 확률 넷으로 셉니다. 정책이 최상급 카피 쪽으로 더 움직인 d02 는 margin -0.080, 손실 0.734, 무게 0.520 이었습니다. 판정자 쌍 8개는 chosen 이 rejected 보다 평균 14.4자 깁니다. 피처 셋의 가중치를 DPO 로 300걸음 학습하자 손실은 0.693 에서 0.354 로 한 번도 오르지 않고 줄었습니다. 통과율은 50걸음의 0.597 에서 300걸음의 0.008 로 떨어졌고, 확률은 쌍에 없는 긴 카피 c06, c07 로 옮겨 갔습니다. 그래서 통과율이 가장 높은 50걸음의 체크포인트로 되돌립니다. LoRA 는 4096 × 4096 행렬 하나에서 r 이 8 이면 65,536개, 0.39% 만 학습합니다.

> **골라 읽는 법** — 절이 7개입니다. 절마다 표나 코드나 카드가 있어 그것만 보고 넘어가도 됩니다.
>
> - SFT 한 걸음과 DPO 한 걸음의 차이 → 1절
> - 선호 쌍 20개의 출처 셋 → 2절
> - 로그 확률 넷으로 세는 DPO 손실 → 3절
> - 틀린 쌍에 큰 무게가 붙는 기울기와 β → 4절
> - 오래 학습하면 떨어지는 통과율과 체크포인트 → 5절
> - 고칠 가중치를 줄이는 LoRA → 6절
> - 담장 안과 열린 RTB 에서 쌍을 모으는 곳 → 7절

이 글의 카피 후보 12개와 선호 쌍 20개, 정책과 참조 모델의 로그 확률은 설명을 위해 만든 가상 데이터입니다. 후보와 쌍은 `scripts/gen-training-data.py` 가 만들고, 블록 2 는 그 리터럴을 글자 그대로 옮겼습니다. 카피는 35주째 [광고 카피 생성](post.html?id=grounded-ad-copy-generation) 편의 서연 씨 러닝화 자산에 맞춰 썼습니다. 쌍은 그 편과 36주째 편의 기록에서 뽑지 않았고, 쌍을 모으는 세 출처를 흉내 냈습니다. 이 글은 모델을 부르지 않고, 숫자는 논문에서 옮긴 수치를 빼면 모두 블록 셋이 찍은 것입니다. 카드 속 파랑은 참조 모델, 선호 쌍, 게이트를 지난 카피, chosen 과 공유 토큰입니다. 벽돌색은 학습하는 정책과 margin 이 음수인 쌍입니다. 먹색은 손실, 기울기, 글자 수 차이, 로그 비율과 margin 상자이고, 회색은 게이트에 걸린 카피입니다. 점선은 게이트 조건, margin 0, c06+c07 의 확률입니다.

---

## 1. SFT 는 좋은 답 하나를 따라 쓰게 합니다

**SFT 는 좋은 답 하나의 로그 확률을 올립니다. 토큰 12개짜리 모델에서 한 걸음 가자 chosen 은 -12.425 에서 -11.121 로, rejected 도 -12.121 로 올랐습니다. 같은 시작점에서 DPO 한 걸음은 chosen 을 올리고 rejected 를 내렸습니다.**

모델이 카피 하나를 쓸 확률은, 토큰마다 앞 토큰 다음에 그 토큰이 나올 확률을 모두 곱한 값입니다. 토큰은 모델이 글을 읽고 쓰는 조각이고, 19주째 [LLM 호출 한 번](post.html?id=llm-first-call) 편에서 보았습니다. 확률을 여러 번 곱하면 0 에 아주 가까워져서, 로그를 씌워 더한 값을 씁니다. 이 값을 로그 확률이라고 부르고, 0 에 가까울수록 모델이 그 카피를 쓸 확률이 높습니다.

블록 1 의 모델은 다음 토큰의 확률이 앞 토큰과 상관없는 가장 작은 언어 모델, 유니그램입니다. 토큰 12개마다 점수가 하나씩 있고, 이 점수를 로짓이라고 부릅니다. 로짓을 소프트맥스에 넣으면 합이 1 인 확률 12개가 나옵니다. 소프트맥스는 [Two-Tower 학습](post.html?id=two-tower-training) 편에서 풀었습니다. 로짓이 모두 0 이면 토큰 하나의 확률은 0.083 이고, 토큰 다섯인 카피의 로그 확률은 -12.425 입니다.

SFT(supervised fine-tuning)는 좋은 답을 정답으로 주고 그 답의 로그 확률을 올리는 학습입니다. 로그 확률을 로짓으로 미분한 기울기는 토큰마다 「카피에 든 횟수 - 카피 길이 × 확률」입니다. 블록은 이 기울기에 학습률 0.5 를 곱해, 기울기의 절반만큼 로짓을 옮깁니다. DPO(direct preference optimization)는 chosen 과 rejected 를 함께 봅니다. 학습하는 동안 고정해 두고 비교의 기준으로 쓰는 모델을 참조 모델, 학습하는 모델을 정책이라고 부릅니다. 블록 1 은 시작점을 참조 모델로 두고, 정책도 그 점에서 출발합니다.

```python
# 하는 일: 토큰 12개짜리 유니그램 모델에서 SFT 한 걸음과 DPO 한 걸음을 가고, 두 카피의 로그 확률과 토큰 점수가 움직인 양을 찍는다.
import math

# 1단계: 어휘, 두 카피, 시작 점수를 둔다
# 유니그램은 다음 토큰의 확률이 앞 토큰과 상관없는 가장 작은 언어 모델이다. 토큰 점수(로짓)는 모두 0 에서 시작한다.
# 두 카피는 공백으로 나눈 토큰 다섯씩이고, 쿠션, 폼, 러닝화 셋이 두 카피에 같이 든다.
VOCAB = ['240g', '쿠션', '폼', '입문자용', '러닝화', '가장', '가벼운', '한', '짝', '1위', '편한', '교환']
CHOSEN = '240g 쿠션 폼 입문자용 러닝화'.split()
REJECTED = '가장 가벼운 쿠션 폼 러닝화'.split()
SHARED = [t for t in CHOSEN if t in REJECTED]
start = {t: 0.0 for t in VOCAB}


def probs(score):
    # 소프트맥스. 가장 큰 점수를 빼고 지수를 취해 넘치지 않게 한 뒤, 합이 1 이 되게 나눈다.
    top = max(score.values())
    e = {k: math.exp(v - top) for k, v in score.items()}
    total = sum(e.values())
    return {k: v / total for k, v in e.items()}


def seq_logp(score, tokens):
    # 카피의 로그 확률은 토큰 로그 확률의 합이다.
    p = probs(score)
    return sum(math.log(p[t]) for t in tokens)


def seq_grad(score, tokens):
    # seq_logp 를 토큰 점수로 미분한 값. 토큰마다 「카피에 든 횟수 - 카피 길이 × 확률」이다.
    p = probs(score)
    return {t: tokens.count(t) - len(tokens) * p[t] for t in VOCAB}


def change(x):
    # 점수 변화를 소수 셋째 자리로 적는다. 0 이 되면 부호 없이 0.000 이다.
    return '0.000' if round(x, 3) == 0 else f'{x:+.3f}'


p0 = probs(start)
print(f'어휘 {len(VOCAB)}개, 토큰 하나의 확률 {p0["240g"]:.3f}, 로그 확률 {math.log(p0["240g"]):.3f}')
print(f'시작 chosen {seq_logp(start, CHOSEN):.3f}, rejected {seq_logp(start, REJECTED):.3f}')

# 2단계: SFT 로 한 걸음 간다
# SFT 의 손실은 chosen 하나만 본다. chosen 의 로그 확률을 올리는 기울기에 학습률 0.5 를 곱한 만큼 토큰 점수를 옮긴다.
# 로그 확률은 「토큰 점수 - log Z」의 합이다. Z 는 점수 12개의 지수를 더한 값이다.
grad = seq_grad(start, CHOSEN)
sft = {t: start[t] + 0.5 * grad[t] for t in VOCAB}
print(f'SFT 한 걸음(학습률 0.5) 뒤 chosen {seq_logp(sft, CHOSEN):.3f}, rejected {seq_logp(sft, REJECTED):.3f}')
moved = sum(sft[t] - start[t] for t in REJECTED)
log_z = math.log(sum(math.exp(v) for v in sft.values())) - math.log(sum(math.exp(v) for v in start.values()))
print(f'rejected 의 토큰 점수 합 {moved:+.3f}, log Z 가 늘어난 몫 5 × {log_z:.3f} = {5 * log_z:.3f}')


# 3단계: DPO 로 한 걸음 간다
# 같은 시작점을 참조 모델로 두고, 정책도 그 점에서 출발한다. margin 은 β × (chosen 의 로그 비율 - rejected 의 로그 비율) 이다.
# 로그 비율은 정책의 로그 확률 - 참조 모델의 로그 확률이다. 손실은 -log σ(margin), 무게는 σ(-margin) 이다.
# 손실을 줄이는 방향은 토큰마다 β × 무게 × (chosen 의 기울기 - rejected 의 기울기) 이고, 학습률 5.0 을 곱해 간다.
def sigmoid(x):
    # 큰 |x| 에서도 넘치지 않게 부호에 따라 식을 고른다.
    if x >= 0:
        return 1 / (1 + math.exp(-x))
    e = math.exp(x)
    return e / (1 + e)


def softplus(x):
    # log(1 + e^x). -log σ(m) 은 softplus(-m) 이다. 큰 x 에서 넘치지 않게 x + log(1 + e^-x) 로 센다.
    return x + math.log1p(math.exp(-x)) if x > 0 else math.log1p(math.exp(x))


def dpo_step(policy, ref, chosen, rejected, beta, lr):
    ratio_w = seq_logp(policy, chosen) - seq_logp(ref, chosen)
    ratio_l = seq_logp(policy, rejected) - seq_logp(ref, rejected)
    margin = beta * (ratio_w - ratio_l)
    weight = sigmoid(-margin)
    gw, gl = seq_grad(policy, chosen), seq_grad(policy, rejected)
    new = {t: policy[t] + lr * beta * weight * (gw[t] - gl[t]) for t in VOCAB}
    return new, margin, softplus(-margin), weight


dpo, margin, loss, weight = dpo_step(start, start, CHOSEN, REJECTED, beta=0.1, lr=5.0)
print(f'DPO 한 걸음(β 0.1, 학습률 5.0) 전 margin {margin:.3f}, 손실 {loss:.3f}, 무게 {weight:.3f}')
print(f'DPO 뒤 chosen {seq_logp(dpo, CHOSEN):.3f}, rejected {seq_logp(dpo, REJECTED):.3f}')

# 4단계: 두 걸음의 토큰 점수 변화를 비교한다
# 줄마다 토큰 하나다. 두 카피에 든 횟수와, 두 걸음이 그 토큰의 점수를 옮긴 양을 적는다.
for t in VOCAB:
    print(f'{t}: chosen {CHOSEN.count(t)}번, rejected {REJECTED.count(t)}번, '
          f'SFT {change(sft[t] - start[t])}, DPO {change(dpo[t] - start[t])}')

# 5단계: 공유 토큰의 DPO 기울기를 나눠 본다
# 토큰 하나의 DPO 기울기는 β × 무게 × ((chosen 횟수 - rejected 횟수) - (chosen 길이 - rejected 길이) × 확률) 이다.
# 두 카피의 길이가 같으면 확률 항이 지워지고, 두 카피에 한 번씩 든 공유 토큰은 횟수 항도 0 이다.
for t in SHARED:
    count_part = CHOSEN.count(t) - REJECTED.count(t)
    prob_part = (len(CHOSEN) - len(REJECTED)) * p0[t]
    print(f'{t}: 횟수 항 {count_part}, 확률 항 ({len(CHOSEN)} - {len(REJECTED)}) × {p0[t]:.3f} = {prob_part:.3f}, '
          f'DPO 변화 {change(dpo[t] - start[t])}')
longer = REJECTED + ['1위']
moved_long = dpo_step(start, start, CHOSEN, longer, beta=0.1, lr=5.0)[0]
print(f'rejected 끝에 1위 를 붙여 토큰 {len(longer)}개로 늘리면 공유 토큰의 DPO 변화 '
      + ', '.join(f'{t} {change(moved_long[t] - start[t])}' for t in SHARED))
# 출력:
# 1단계 뜻: 로짓이 모두 0 이라 토큰 확률이 같고, 토큰 다섯인 두 카피의 로그 확률도 같다.
# 어휘 12개, 토큰 하나의 확률 0.083, 로그 확률 -2.485
# 시작 chosen -12.425, rejected -12.425
# 2단계 뜻: SFT 의 손실은 chosen 하나만 보지만, 공유 토큰 셋 때문에 rejected 의 로짓 합도 올라 rejected 도 올랐다.
# SFT 한 걸음(학습률 0.5) 뒤 chosen -11.121, rejected -12.121
# rejected 의 토큰 점수 합 +0.458, log Z 가 늘어난 몫 5 × 0.031 = 0.155
# 3단계 뜻: 정책과 참조 모델이 같은 점에서 출발해 margin 은 0 이고, 한 걸음에 chosen 은 오르고 rejected 는 내려갔다.
# DPO 한 걸음(β 0.1, 학습률 5.0) 전 margin 0.000, 손실 0.693, 무게 0.500
# DPO 뒤 chosen -11.977, rejected -12.977
# 4단계 뜻: SFT 는 토큰 12개를 모두 옮기고, DPO 는 한쪽 카피에만 든 토큰 넷만 옮겼다.
# 240g: chosen 1번, rejected 0번, SFT +0.292, DPO +0.250
# 쿠션: chosen 1번, rejected 1번, SFT +0.292, DPO 0.000
# 폼: chosen 1번, rejected 1번, SFT +0.292, DPO 0.000
# 입문자용: chosen 1번, rejected 0번, SFT +0.292, DPO +0.250
# 러닝화: chosen 1번, rejected 1번, SFT +0.292, DPO 0.000
# 가장: chosen 0번, rejected 1번, SFT -0.208, DPO -0.250
# 가벼운: chosen 0번, rejected 1번, SFT -0.208, DPO -0.250
# 한: chosen 0번, rejected 0번, SFT -0.208, DPO 0.000
# 짝: chosen 0번, rejected 0번, SFT -0.208, DPO 0.000
# 1위: chosen 0번, rejected 0번, SFT -0.208, DPO 0.000
# 편한: chosen 0번, rejected 0번, SFT -0.208, DPO 0.000
# 교환: chosen 0번, rejected 0번, SFT -0.208, DPO 0.000
# 5단계 뜻: 두 카피의 길이가 같아 확률 항이 0 이고, rejected 를 토큰 여섯으로 늘리면 공유 토큰도 움직인다.
# 쿠션: 횟수 항 0, 확률 항 (5 - 5) × 0.083 = 0.000, DPO 변화 0.000
# 폼: 횟수 항 0, 확률 항 (5 - 5) × 0.083 = 0.000, DPO 변화 0.000
# 러닝화: 횟수 항 0, 확률 항 (5 - 5) × 0.083 = 0.000, DPO 변화 0.000
# rejected 끝에 1위 를 붙여 토큰 6개로 늘리면 공유 토큰의 DPO 변화 쿠션 +0.021, 폼 +0.021, 러닝화 +0.021
```

SFT 한 걸음 뒤 chosen 의 토큰 다섯은 로짓이 0.292 씩 오르고, 나머지 일곱은 0.208 씩 내려갔습니다. rejected 도 -12.425 에서 -12.121 로 올랐습니다. rejected 의 토큰 다섯 가운데 쿠션, 폼, 러닝화 셋이 chosen 과 같아 0.292 씩 올랐기 때문입니다. 2단계는 rejected 의 로짓 합이 0.458 오르는 사이, 확률을 나누는 log Z 의 몫은 0.155 만 늘어난 것을 찍습니다. 좋은 카피만 따라 쓰게 해도 낱말을 함께 쓰는 나쁜 카피가 같이 올라가는 자리가 여기입니다.

DPO 한 걸음 전에는 정책과 참조 모델이 같아 margin 이 0.000, 손실이 0.693, 무게가 0.500 입니다. margin 과 무게는 3절에서 풀고, β 0.1 은 4절에서 다시 봅니다. 한 걸음 뒤 chosen 은 -11.977 로 오르고 rejected 는 -12.977 로 내려갔습니다. 로짓이 움직인 토큰은 chosen 에만 든 240g 과 입문자용(+0.250), rejected 에만 든 가장과 가벼운(-0.250)뿐입니다.

공유 토큰 셋은 DPO 한 걸음에서 0.000 움직였습니다. DPO 의 기울기는 chosen 의 기울기에서 rejected 의 기울기를 뺀 값입니다. 두 카피의 길이가 5 로 같아 「길이 × 확률」 항이 지워지고, 공유 토큰은 두 카피에 한 번씩 들어 횟수 항도 0 입니다. 5단계는 rejected 끝에 「1위」를 붙여 토큰 여섯으로 늘리면 공유 토큰 셋이 0.021 씩 오르는 것을 찍습니다. 2절부터는 길이가 서로 다른 카피의 쌍을 다룹니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-sft-dpo-cards.html?embed=1&card=sft" height="480" loading="lazy" title="토큰 12개짜리 모델에서 SFT 한 걸음과 DPO 한 걸음이 두 카피의 로짓을 옮긴 양"></iframe>
<a class="demo-embed-open" href="demo-sft-dpo-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 2. 선호 쌍 20개를 세 곳에서 모읍니다

**선호 쌍은 게이트, 판정자의 짝비교, 광고주 편집 세 곳에서 모읍니다. 이 글의 쌍 20개는 6쌍, 8쌍, 6쌍이고, 출처마다 chosen 을 정하는 법이 다릅니다. 판정자 쌍은 chosen 이 rejected 보다 평균 14.4자 깁니다.**

후보 12개는 서연 씨 러닝화 자산 하나에 쓴 카피입니다. 통과의 기준은 35주째 편의 게이트 넷 가운데 길이와 최상급 게이트, 그리고 근거 게이트의 숫자 대조입니다. 길이는 40자 이하이고, 카피의 숫자는 모두 자산에 있어야 합니다. 근거 없는 최상급, 곧 자산에 없는 「가장」이나 「1위」 같은 낱말도 없어야 합니다. 셋을 모두 지난 카피는 c01 부터 c05 까지 다섯이고, c06 과 c07 은 길이에만 걸립니다.

게이트 쌍은 통과한 카피를 chosen, 숫자나 최상급에 걸린 카피를 rejected 로 둡니다. 자산에 없는 무게를 쓴 c08 과, 「가장 가벼운」으로 시작하는 c09 가 rejected 에 들어갑니다. 게이트는 코드라 쌍을 많이 만들 수 있지만, 쌍이 가르치는 것은 숫자와 낱말 몇 개입니다. 6쌍의 글자 수 차이는 평균 +0.2자라 길이와는 거의 상관이 없습니다.

판정자 쌍은 게이트를 둘 다 지난 카피 둘을 판정자에게 보이고 나은 쪽을 고르게 한 쌍입니다. 판정자는 카피를 채점하는 모델이고, 둘을 나란히 놓고 고르는 짝비교는 26주째 [LLM-as-a-Judge](post.html?id=llm-as-a-judge) 편에서 보았습니다. 이 글의 판정자 쌍 8개는 늘 긴 카피를 고르는 판정자를 흉내 낸 가상 쌍입니다. 그래서 chosen 이 rejected 보다 평균 14.4자 깁니다.

광고주 편집 쌍은 광고주가 고친 카피를 chosen, 원래 카피를 rejected 로 둡니다. 「가장 편한」으로 시작하는 c12 를 최상급 없는 c05 로 고친 d15 가 그런 쌍입니다. 광고주가 손댄 문장이라 쌍마다 사람의 판단이 하나씩 들어 있고, 고친 쪽이 평균 3.8자 짧습니다. 아래 표가 출처 셋을 나란히 적은 것입니다.

| 출처 | 쌍 수 | chosen 과 rejected 를 정하는 법 | 글자 수 차이 평균 (chosen - rejected) |
|---|---|---|---|
| 게이트 | 6 | 통과한 카피가 chosen, 숫자나 최상급에 걸린 카피가 rejected | +0.2자 |
| 판정자 짝비교 | 8 | 둘 다 통과, 판정자가 고른 긴 카피가 chosen | +14.4자 |
| 광고주 편집 | 6 | 광고주가 고친 카피가 chosen, 원래 카피가 rejected | -3.8자 |

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 카피 후보 12개 사이의 선호 쌍 20개로 출처별 글자 수 차이를 세고, 쌍마다 DPO 의 margin, 손실, 무게를 센다.

# 1단계: 후보 12개와 선호 쌍 20개를 둔다
# COPY_POOL 과 PREF_PAIRS 는 scripts/gen-training-data.py 의 리터럴을 글자 그대로 옮겼다. 값은 모두 가상이다.
# 후보 하나는 (id, 카피, 글자 수, 숫자 일치 0|1, 근거 없는 최상급 0|1, 참조 로그 확률, 정책 로그 확률) 이다.
# 정책 열은 DPO 를 조금 돌린 정책을 흉내 낸 가상 표다. 쌍 하나는 (id, chosen id, rejected id, 출처) 다.
COPY_POOL = [
    ("c01", "입문자용 러닝화 런솔 라이트", 15, 1, 0, -18.1, -16.7),
    ("c02", "한 짝 240g, 처음 달리는 사람을 위한 러닝화", 27, 1, 0, -19.2, -16.6),
    ("c03", "밑창 전체에 쿠션 폼을 깐 입문자용 러닝화", 23, 1, 0, -18.3, -16.4),
    ("c04", "한 짝 240g 에 쿠션 폼을 깐, 처음 달리는 사람을 위한 러닝화", 37, 1, 0, -20.5, -17.4),
    ("c05", "240g 으로 가볍고 앞코가 넉넉한 러닝화, 30일 안에 한 번 교환", 38, 1, 0, -20.8, -18.5),
    ("c06", "한 짝 240g 으로 가볍고 밑창 전체에 쿠션 폼을 깐, 처음 달리는 사람을 위한 러닝화", 49, 1, 0, -23.3, -20.5),
    ("c07", "한 짝 240g 에 앞코가 넉넉하고 밑창 전체에 쿠션 폼을 깐 입문자용 러닝화", 43, 1, 0, -22.7, -21.5),
    ("c08", "한 짝 220g, 처음 달리는 사람을 위한 러닝화", 27, 0, 0, -18.0, -19.6),
    ("c09", "가장 가벼운 입문자용 러닝화 런솔 라이트", 22, 1, 1, -16.7, -14.0),
    ("c10", "입문 러너 1위 러닝화, 쿠션 폼을 깐 런솔 라이트", 28, 0, 1, -18.7, -20.8),
    ("c11", "한 짝 200g, 쿠션 폼을 깐 입문자용 러닝화", 26, 0, 0, -18.1, -19.0),
    ("c12", "가장 편한 쿠션 폼 러닝화, 한 짝 240g 으로 처음 달리는 사람을 위해 만들었습니다", 48, 1, 1, -22.9, -22.3)
]
PREF_PAIRS = [
    ("d01", "c02", "c08", "gate"),
    ("d02", "c03", "c09", "gate"),
    ("d03", "c03", "c11", "gate"),
    ("d04", "c04", "c10", "gate"),
    ("d05", "c01", "c09", "gate"),
    ("d06", "c02", "c11", "gate"),
    ("d07", "c04", "c01", "judge"),
    ("d08", "c05", "c02", "judge"),
    ("d09", "c04", "c03", "judge"),
    ("d10", "c05", "c03", "judge"),
    ("d11", "c02", "c01", "judge"),
    ("d12", "c05", "c01", "judge"),
    ("d13", "c03", "c01", "judge"),
    ("d14", "c04", "c02", "judge"),
    ("d15", "c05", "c12", "edit"),
    ("d16", "c02", "c10", "edit"),
    ("d17", "c04", "c12", "edit"),
    ("d18", "c01", "c10", "edit"),
    ("d19", "c03", "c08", "edit"),
    ("d20", "c05", "c09", "edit")
]
BETA = 0.1
POOL = {c[0]: c for c in COPY_POOL}
SOURCES = ('gate', 'judge', 'edit')

# 2단계: 출처별 쌍 수와 글자 수 차이를 센다
# 글자 수 차이는 쌍마다 chosen 의 글자 수에서 rejected 의 글자 수를 뺀 값이고, 출처마다 평균을 낸다.
print(f'후보 {len(COPY_POOL)}개, 선호 쌍 {len(PREF_PAIRS)}개')
for s in SOURCES:
    diffs = [POOL[w][2] - POOL[l][2] for pid, w, l, src in PREF_PAIRS if src == s]
    print(f'{s} {len(diffs)}쌍, chosen - rejected 글자 수 평균 {sum(diffs) / len(diffs):+.1f}')


# 3단계: 쌍마다 margin, 손실, 무게를 센다
# margin 은 β × ((정책 chosen - 참조 chosen) - (정책 rejected - 참조 rejected)) 다. 두 괄호가 두 카피의 로그 비율이다.
# 손실은 -log σ(margin), 무게는 σ(-margin) 이다. 무게는 이 쌍의 기울기에 곱해지는 몫이다.
def dpo_numbers(pol_w, pol_l, ref_w, ref_l, beta=0.1):
    margin = beta * ((pol_w - ref_w) - (pol_l - ref_l))
    return margin, softplus(-margin), sigmoid(-margin)


rows = []
for pid, w, l, src in PREF_PAIRS:
    cw, cl = POOL[w], POOL[l]
    m, loss, wt = dpo_numbers(cw[6], cl[6], cw[5], cl[5], beta=BETA)
    rows.append((pid, m, loss, wt))
    print(f'{pid} {src} {w}>{l} 정책 {cw[6]:.1f} {cl[6]:.1f} 참조 {cw[5]:.1f} {cl[5]:.1f} margin {m:+.3f} 손실 {loss:.3f} 무게 {wt:.3f}')

# 4단계: 표에 넣을 쌍 다섯의 두 로그 비율을 찍는다
# 로그 비율은 정책의 로그 확률에서 참조 모델의 로그 확률을 뺀 값이다. 0 보다 크면 정책이 그 카피를 참조 모델보다 더 좋아한다.
for pid, w, l, src in PREF_PAIRS:
    if pid in ('d01', 'd02', 'd07', 'd08', 'd16'):
        rw, rl = POOL[w][6] - POOL[w][5], POOL[l][6] - POOL[l][5]
        print(f'{pid} chosen {w} 로그 비율 {rw:+.1f}, rejected {l} 로그 비율 {rl:+.1f}, 차이 {rw - rl:+.1f}')

# 5단계: 평균 손실과 margin 이 음수인 쌍을 본다
# margin 이 음수면 정책이 참조 모델보다 rejected 쪽으로 더 기운 쌍이다.
neg = [r[0] for r in rows if r[1] < 0]
print(f'평균 손실 {sum(r[2] for r in rows) / len(rows):.3f}')
print(f'margin 이 음수인 쌍 {len(neg)}개 ' + ', '.join(neg))

# 6단계: β 를 바꿔 같은 표를 다시 센다
# 정책과 참조 모델의 표는 그대로 두고 β 만 바꾼다. 무게는 5단계의 margin 음수 쌍과 나머지로도 나눠 평균을 낸다.
for beta in (0.01, 0.1, 0.5, 1.0):
    nums = {pid: dpo_numbers(POOL[w][6], POOL[l][6], POOL[w][5], POOL[l][5], beta=beta) for pid, w, l, src in PREF_PAIRS}
    weights_neg = [nums[pid][2] for pid in nums if pid in neg]
    weights_rest = [nums[pid][2] for pid in nums if pid not in neg]
    print(f'β {beta}: 평균 손실 {sum(v[1] for v in nums.values()) / len(nums):.3f}, '
          f'평균 무게 {sum(v[2] for v in nums.values()) / len(nums):.3f} '
          f'(음수 {len(weights_neg)}쌍 {sum(weights_neg) / len(weights_neg):.3f}, '
          f'나머지 {len(weights_rest)}쌍 {sum(weights_rest) / len(weights_rest):.3f})')
# 출력:
# 2단계 뜻: 판정자 쌍만 chosen 이 rejected 보다 크게 길다.
# 후보 12개, 선호 쌍 20개
# gate 6쌍, chosen - rejected 글자 수 평균 +0.2
# judge 8쌍, chosen - rejected 글자 수 평균 +14.4
# edit 6쌍, chosen - rejected 글자 수 평균 -3.8
# 3단계 뜻: 쌍마다 로그 확률 넷으로 margin, 손실, 무게를 세고, margin 이 음수면 손실과 무게가 크다.
# d01 gate c02>c08 정책 -16.6 -19.6 참조 -19.2 -18.0 margin +0.420 손실 0.505 무게 0.397
# d02 gate c03>c09 정책 -16.4 -14.0 참조 -18.3 -16.7 margin -0.080 손실 0.734 무게 0.520
# d03 gate c03>c11 정책 -16.4 -19.0 참조 -18.3 -18.1 margin +0.280 손실 0.563 무게 0.430
# d04 gate c04>c10 정책 -17.4 -20.8 참조 -20.5 -18.7 margin +0.520 손실 0.467 무게 0.373
# d05 gate c01>c09 정책 -16.7 -14.0 참조 -18.1 -16.7 margin -0.130 손실 0.760 무게 0.532
# d06 gate c02>c11 정책 -16.6 -19.0 참조 -19.2 -18.1 margin +0.350 손실 0.533 무게 0.413
# d07 judge c04>c01 정책 -17.4 -16.7 참조 -20.5 -18.1 margin +0.170 손실 0.612 무게 0.458
# d08 judge c05>c02 정책 -18.5 -16.6 참조 -20.8 -19.2 margin -0.030 손실 0.708 무게 0.507
# d09 judge c04>c03 정책 -17.4 -16.4 참조 -20.5 -18.3 margin +0.120 손실 0.635 무게 0.470
# d10 judge c05>c03 정책 -18.5 -16.4 참조 -20.8 -18.3 margin +0.040 손실 0.673 무게 0.490
# d11 judge c02>c01 정책 -16.6 -16.7 참조 -19.2 -18.1 margin +0.120 손실 0.635 무게 0.470
# d12 judge c05>c01 정책 -18.5 -16.7 참조 -20.8 -18.1 margin +0.090 손실 0.649 무게 0.478
# d13 judge c03>c01 정책 -16.4 -16.7 참조 -18.3 -18.1 margin +0.050 손실 0.668 무게 0.488
# d14 judge c04>c02 정책 -17.4 -16.6 참조 -20.5 -19.2 margin +0.050 손실 0.668 무게 0.488
# d15 edit c05>c12 정책 -18.5 -22.3 참조 -20.8 -22.9 margin +0.170 손실 0.612 무게 0.458
# d16 edit c02>c10 정책 -16.6 -20.8 참조 -19.2 -18.7 margin +0.470 손실 0.486 무게 0.385
# d17 edit c04>c12 정책 -17.4 -22.3 참조 -20.5 -22.9 margin +0.250 손실 0.576 무게 0.438
# d18 edit c01>c10 정책 -16.7 -20.8 참조 -18.1 -18.7 margin +0.350 손실 0.533 무게 0.413
# d19 edit c03>c08 정책 -16.4 -19.6 참조 -18.3 -18.0 margin +0.350 손실 0.533 무게 0.413
# d20 edit c05>c09 정책 -18.5 -14.0 참조 -20.8 -16.7 margin -0.040 손실 0.713 무게 0.510
# 4단계 뜻: d02 와 d08 은 정책이 rejected 를 더 많이 올려 두 로그 비율의 차이가 음수다.
# d01 chosen c02 로그 비율 +2.6, rejected c08 로그 비율 -1.6, 차이 +4.2
# d02 chosen c03 로그 비율 +1.9, rejected c09 로그 비율 +2.7, 차이 -0.8
# d07 chosen c04 로그 비율 +3.1, rejected c01 로그 비율 +1.4, 차이 +1.7
# d08 chosen c05 로그 비율 +2.3, rejected c02 로그 비율 +2.6, 차이 -0.3
# d16 chosen c02 로그 비율 +2.6, rejected c10 로그 비율 -2.1, 차이 +4.7
# 5단계 뜻: 20쌍 가운데 넷은 정책이 참조 모델보다 rejected 쪽으로 더 움직였다.
# 평균 손실 0.613
# margin 이 음수인 쌍 4개 d02, d05, d08, d20
# 6단계 뜻: β 가 클수록 평균 손실은 줄고, margin 음수 쌍과 나머지 쌍의 무게 차이는 벌어진다.
# β 0.01: 평균 손실 0.684, 평균 무게 0.496 (음수 4쌍 0.502, 나머지 16쌍 0.494)
# β 0.1: 평균 손실 0.613, 평균 무게 0.457 (음수 4쌍 0.517, 나머지 16쌍 0.441)
# β 0.5: 평균 손실 0.431, 평균 무게 0.325 (음수 4쌍 0.586, 나머지 16쌍 0.260)
# β 1.0: 평균 손실 0.370, 평균 무게 0.256 (음수 4쌍 0.662, 나머지 16쌍 0.154)
```

블록 2 의 2단계가 위 표의 쌍 수와 글자 수 차이를 찍습니다. 3단계의 20줄은 쌍마다 정책과 참조 모델의 로그 확률 넷과 margin, 손실, 무게입니다. 정책 열은 DPO 를 조금 돌린 정책을 흉내 낸 가상 표이고, 3절과 4절이 이 20줄을 읽습니다. 쌍이 가르치는 것은 출처마다 다릅니다. 게이트 쌍과 편집 쌍은 숫자와 최상급을, 판정자 쌍은 길이를 가르치고, 5절의 블록이 그 차이를 피처마다 찍습니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-sft-dpo-cards.html?embed=1&card=pairs" height="480" loading="lazy" title="게이트, 판정자 짝비교, 광고주 편집에서 모은 선호 쌍 20개와 출처별 글자 수 차이"></iframe>
<a class="demo-embed-open" href="demo-sft-dpo-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 3. DPO 손실은 로그 확률 넷으로 셉니다

**쌍 하나의 DPO 손실에는 로그 확률 넷이 들어갑니다. 정책과 참조 모델이 chosen 과 rejected 에 준 값입니다. 카피마다 두 모델의 차이를 빼면 로그 비율 둘이 되고, 그 차이에 β 를 곱한 margin 이 손실과 무게를 정합니다.**

로그 비율은 정책의 로그 확률에서 참조 모델의 로그 확률을 뺀 값입니다. 로그의 차이라서, 두 모델이 그 카피에 준 확률의 비율에 로그를 씌운 값과 같습니다. 0 보다 크면 정책이 참조 모델보다 그 카피를 더 쓰게 되었다는 뜻입니다. margin 은 chosen 의 로그 비율에서 rejected 의 로그 비율을 빼고 β 0.1 을 곱한 값입니다.

손실은 -log σ(margin) 이고, σ 는 값을 0 과 1 사이로 옮기는 시그모이드입니다. margin 이 0 이면 손실은 0.693 이고, margin 이 클수록 0 에 가까워집니다. 무게는 σ(-margin) 이라, margin 이 음수면 0.5 보다 큽니다. DPO 논문은 β × 로그 비율을 정책과 참조 모델이 정하는 암묵적 보상이라고 불렀습니다. 카피마다 점수를 내는 보상 모델을 따로 학습하지 않고, 정책의 로그 확률로 그 차이를 셉니다.

참조 모델은 대개 SFT 를 마친 모델입니다. DPO 논문은 쌍을 만든 SFT 모델이 있으면 그 모델을 참조 모델로 둔다고 적었습니다. SFT 모델이 없으면 chosen 의 로그 확률을 최대로 올린 모델을 참조 모델로 만든다고 적었습니다. 참조 모델을 SFT 모델로 두면, DPO 는 SFT 를 마친 뒤에 잇는 단계가 됩니다.

d02 는 chosen c03 의 로그 비율이 +1.9, rejected c09 의 로그 비율이 +2.7 입니다. 정책이 두 카피를 모두 참조 모델보다 더 쓰게 되었지만, 최상급 카피 c09 쪽으로 더 움직였습니다. 두 로그 비율의 차이 -0.8 에 β 를 곱한 margin 은 -0.080, 손실은 0.734, 무게는 0.520 입니다. d07 은 정책이 rejected c01 에 준 로그 확률 -16.7 이 chosen c04 의 -17.4 보다 높습니다. 그런데도 c04 의 로그 비율이 +3.1 로 c01 의 +1.4 보다 커서 margin 은 +0.170 입니다.

| 쌍 | 출처 | 정책 (chosen, rejected) | 참조 (chosen, rejected) | 로그 비율 (chosen, rejected) | margin | 손실 | 무게 |
|---|---|---|---|---|---|---|---|
| d01 c02>c08 | gate | -16.6, -19.6 | -19.2, -18.0 | +2.6, -1.6 | +0.420 | 0.505 | 0.397 |
| d02 c03>c09 | gate | -16.4, -14.0 | -18.3, -16.7 | +1.9, +2.7 | -0.080 | 0.734 | 0.520 |
| d07 c04>c01 | judge | -17.4, -16.7 | -20.5, -18.1 | +3.1, +1.4 | +0.170 | 0.612 | 0.458 |
| d08 c05>c02 | judge | -18.5, -16.6 | -20.8, -19.2 | +2.3, +2.6 | -0.030 | 0.708 | 0.507 |
| d16 c02>c10 | edit | -16.6, -20.8 | -19.2, -18.7 | +2.6, -2.1 | +0.470 | 0.486 | 0.385 |

표의 d01 과 d16 은 정책이 chosen 을 올리고 rejected 를 내린 쌍입니다. margin 이 +0.420 과 +0.470 으로 크고, 손실은 0.505 와 0.486 입니다. d08 은 판정자 쌍인데, 정책이 rejected c02 를 chosen c05 보다 조금 더 올려 margin 이 -0.030 입니다. margin 의 부호는 정책이 어느 카피를 더 쓰는지가 아니라, 참조 모델에서 어느 쪽으로 더 움직였는지를 말합니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-sft-dpo-cards.html?embed=1&card=loss" height="480" loading="lazy" title="d02 의 로그 확률 넷에서 로그 비율 둘, margin, 손실, 무게를 세는 차례와 쌍 20개의 margin"></iframe>
<a class="demo-embed-open" href="demo-sft-dpo-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 4. 기울기는 정책이 틀린 쌍을 더 세게 밉니다

**DPO 의 기울기에는 쌍마다 무게 σ(-margin) 이 곱해집니다. 정책이 rejected 쪽으로 더 움직인 쌍은 margin 이 음수라 무게가 0.5 보다 큽니다. β 를 키우면 틀린 쌍과 나머지 쌍의 무게 차이가 더 벌어집니다.**

쌍 하나의 기울기는 chosen 의 로그 확률을 올리고 rejected 의 로그 확률을 내리는 방향입니다. 그 크기에 β 와 무게 σ(-margin) 이 곱해집니다. DPO 논문은 이 무게를 암묵적 보상이 쌍의 순서를 얼마나 틀리게 매기는지로 풀었습니다. 무게를 뺀 단순한 방법은 언어 모델을 망가뜨릴 수 있다고도 적었습니다.

β 0.1 에서 margin 이 음수인 쌍은 d02, d05, d08, d20 넷이고, 20쌍의 평균 손실은 0.613 입니다. 넷의 무게 평균은 0.517 로, 나머지 16쌍의 0.441 보다 큽니다. d02, d05, d20 은 rejected 가 모두 최상급 카피 c09 이고, d08 은 판정자 쌍입니다. 세 쌍 모두 chosen 의 로그 비율이 c09 의 +2.7 보다 작아 margin 이 음수가 되었습니다.

β 를 바꾸면 같은 정책 표에서도 margin 이 β 에 비례해 바뀝니다. β 0.01 에서는 margin 음수 4쌍과 나머지 16쌍의 무게 평균이 0.502 와 0.494 로 거의 같습니다. β 1.0 에서는 0.662 와 0.154 로 벌어집니다. 블록 2 의 6단계가 β 넷을 같은 20쌍으로 다시 셉니다.

| β | 평균 손실 | 평균 무게 | margin 음수 4쌍(d02, d05, d08, d20)의 무게 | 나머지 16쌍의 무게 |
|---|---|---|---|---|
| 0.01 | 0.684 | 0.496 | 0.502 | 0.494 |
| 0.1 | 0.613 | 0.457 | 0.517 | 0.441 |
| 0.5 | 0.431 | 0.325 | 0.586 | 0.260 |
| 1.0 | 0.370 | 0.256 | 0.662 | 0.154 |

학습률을 바꾸면 모든 쌍의 걸음이 같은 배수로 커지거나 작아집니다. β 도 모든 쌍의 기울기 앞에 곱해지지만, 시그모이드 안에도 들어가 쌍 사이의 무게 차이까지 바꿉니다. 평균 손실도 β 에 따라 0.684 에서 0.370 까지 달라지니, β 가 다른 실행의 손실 값은 서로 비교하지 않습니다. DPO 논문은 β 를 참조 정책에서 얼마나 벗어날지 정하는 값으로 두었고, 따로 적지 않으면 0.1 을 썼습니다.

## 5. 오래 학습하면 통과율이 후퇴합니다

**피처 셋의 가중치를 DPO 로 300걸음 학습하자 손실은 0.693 에서 0.354 로 한 번도 오르지 않고 줄었습니다. 통과율은 50걸음에 0.597 로 가장 높았다가 300걸음에 0.008 이 되었습니다. 확률이 쌍에 없는 긴 카피 c06, c07 로 옮겨 갔기 때문입니다.**

2절과 3절의 정책 열은 DPO 를 조금 돌린 정책을 흉내 낸 가상 표였습니다. 블록 3 은 그 표를 쓰지 않고, 참조 모델(θ = 0)에서 다시 시작해 직접 학습합니다. 정책의 점수는 참조 로그 확률에, 가중치 θ 와 피처 φ 를 곱해 더한 `dot(θ, φ)` 를 더한 값입니다. 확률은 이 점수를 후보 12개 안에서만 소프트맥스로 나눈 값이라, 실제 모델이 모든 카피에 두는 확률과 다릅니다.

피처 φ 는 글자 수를 10 으로 나눈 값, 숫자 일치, 근거 없는 최상급 셋입니다. 쌍 하나의 margin 은 β `dot(θ, Δφ)` 이고, Δφ 는 chosen 과 rejected 의 피처 차이입니다. 두 후보의 확률을 나누는 log Z 가 쌍 안에서 지워져 피처 차이만 남습니다. 블록은 손실을 줄이는 방향으로 θ 를 학습률 2.0 으로 300걸음 옮기고, 25걸음마다 체크포인트를 남깁니다. 체크포인트는 학습 중간의 가중치를 저장해 둔 것입니다.

통과율은 후보 12개에 둔 확률로 센 기댓값입니다. 정책이 카피를 하나 쓸 때 통과 후보가 나올 확률의 합이고, 카피를 뽑아서 센 값이 아닙니다. 평균 글자 수도 같은 확률로 셉니다. KL 발산은 정책의 확률이 참조 모델에서 얼마나 멀어졌는지 측정하는 값으로, 두 확률이 같으면 0 입니다.

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 참조 모델에서 다시 시작해 가중치 셋을 DPO 로 300걸음 학습하며, 손실과 통과율(후보 12개에 둔 확률로 센 기댓값)을 25걸음마다 찍는다.

# 1단계: 피처, 통과 후보, 쌍의 피처 차이를 둔다
# 피처 φ 는 (글자 수 / 10, 숫자 일치, 근거 없는 최상급) 이다. 통과는 게이트 셋(40자 이하, 숫자 일치 1, 최상급 0)을 모두 지난 것이다.
# 쌍마다 Δφ = φ(chosen) - φ(rejected) 를 두고, 출처별과 전체와 판정자 쌍을 뺀 12쌍의 평균을 낸다. 학습은 이 Δφ 만 본다.
def phi(c):
    return (c[2] / 10, c[3], c[4])


def dot(a, b):
    return sum(x * y for x, y in zip(a, b))


PASS = [c[0] for c in COPY_POOL if c[2] <= 40 and c[3] == 1 and c[4] == 0]
WINNERS = sorted({w for pid, w, l, src in PREF_PAIRS})
DELTA = {pid: tuple(a - b for a, b in zip(phi(POOL[w]), phi(POOL[l]))) for pid, w, l, src in PREF_PAIRS}
print('통과(40자 이하, 숫자 일치 1, 최상급 0) 후보 ' + ', '.join(PASS) + ' / chosen 으로 나온 후보 ' + ', '.join(WINNERS))
for cid in ('c06', 'c07'):
    c = POOL[cid]
    seen = sum(cid in (w, l) for pid, w, l, src in PREF_PAIRS)
    print(f'{cid}: {c[2]}자, 숫자 일치 {c[3]}, 최상급 {c[4]}, 쌍에 나온 수 {seen}')
groups = {s: [p[0] for p in PREF_PAIRS if p[3] == s] for s in SOURCES}
groups['전체'] = [p[0] for p in PREF_PAIRS]
groups['판정자 쌍 뺌'] = [p[0] for p in PREF_PAIRS if p[3] != 'judge']
for name, ids in groups.items():
    print(f'Δφ 평균 {name} {len(ids)}쌍 (' + ', '.join(f'{sum(DELTA[i][j] for i in ids) / len(ids):+.3f}' for j in range(3)) + ')')


# 2단계: 정책, 손실, 기울기를 둔다
# 정책은 「참조 로그 확률 + dot(θ, φ)」를 후보 12개 안에서만 소프트맥스로 나눈 확률이다. θ = 0 이면 참조 모델과 같다.
# 쌍 하나의 margin 은 β dot(θ, Δφ) 다. 두 후보를 나누는 log Z 가 같아 쌍 안에서 지워진다.
# 손실을 줄이는 방향은 쌍 20개 평균 β σ(-β dot(θ, Δφ)) Δφ 이고, 여기에 학습률 2.0 을 곱해 θ 를 옮긴다.
def policy(theta):
    return probs({c[0]: c[5] + dot(theta, phi(c)) for c in COPY_POOL})


def loss_of(theta):
    return sum(softplus(-BETA * dot(theta, d)) for d in DELTA.values()) / len(DELTA)


def direction(theta):
    return [sum(BETA * sigmoid(-BETA * dot(theta, d)) * d[j] for d in DELTA.values()) / len(DELTA) for j in range(3)]


REF = policy((0.0, 0.0, 0.0))


# 3단계: 300걸음을 가며 25걸음마다 체크포인트를 남긴다
# 통과율과 평균 글자 수는 후보 12개에 둔 확률로 센 기댓값이다. KL 은 Σ 정책 × log(정책 / 참조) 다.
# 맞힌 쌍은 margin 이 0 보다 큰 쌍이다. 손실은 체크포인트가 아닌 걸음까지 모두 적어 둔다.
def checkpoint(step, theta):
    pi = policy(theta)
    return {'step': step, 'theta': tuple(theta), 'loss': loss_of(theta),
            'pass': sum(pi[k] for k in PASS), 'long': pi['c06'] + pi['c07'],
            'chars': sum(pi[c[0]] * c[2] for c in COPY_POOL),
            'kl': sum(pi[k] * math.log(pi[k] / REF[k]) for k in pi),
            'right': sum(dot(theta, d) > 0 for d in DELTA.values()), 'top': max(pi, key=pi.get)}


theta = [0.0, 0.0, 0.0]
losses, saved = [], []
for step in range(301):
    losses.append(loss_of(theta))
    if step % 25 == 0:
        saved.append(checkpoint(step, theta))
    if step < 300:
        theta = [t + 2.0 * g for t, g in zip(theta, direction(theta))]
print('φ = (글자 수 / 10, 숫자 일치, 최상급), 학습률 2.0 으로 300걸음, 25걸음마다 체크포인트')
print('열: 걸음, 손실, θ(글자, 숫자, 최상급), 통과율, c06+c07 확률, 평균 글자 수, KL, 확률이 가장 큰 후보')
for s in saved:
    a, b, c = s['theta']
    print(f"{s['step']:3d} 손실 {s['loss']:.3f} θ {a:+.2f} {b:+.2f} {c:+.2f} 통과율 {s['pass']:.3f} "
          f"c06+c07 {s['long']:.3f} 글자 {s['chars']:.1f} KL {s['kl']:.2f} {s['top']}")
print(f'손실이 앞 걸음보다 줄지 않은 걸음 {sum(b >= a for a, b in zip(losses, losses[1:]))}개 (300걸음 가운데)')

# 4단계: 통과율이 가장 높은 체크포인트로 되돌린다
# 체크포인트 13개 가운데 통과율이 가장 높은 것을 고른다. 통과율이 같으면 앞의 것을 둔다. 고른 θ 를 theta 에 다시 넣고 통과율을 다시 센다.
best = saved[0]
for s in saved[1:]:
    if s['pass'] > best['pass']:
        best = s
for s in (best, saved[-1]):
    print(f"{s['step']}걸음: 통과율 {s['pass']:.3f}, 손실 {s['loss']:.3f}, 맞힌 쌍 {s['right']}/{len(DELTA)}, KL {s['kl']:.2f}")
theta = list(best['theta'])
restored = policy(theta)
print(f"{best['step']}걸음의 θ (" + ', '.join(f'{v:+.2f}' for v in theta) + ') 로 되돌렸다. '
      f"되돌린 θ 의 통과율 {sum(restored[k] for k in PASS):.3f}, 손실 {loss_of(theta):.3f}")

# 5단계: 글자 수 가중치를 출처별로 나누고, 판정자 쌍을 뺀 12쌍으로 다시 학습한다
# train 은 3단계와 같은 식과 차례로 θ 를 300걸음 옮기고, 걸음마다 글자 수 칸에 더한 양을 쌍의 출처별로 모은다.
# 쌍 20개로 돌리면 3단계의 300걸음 θ 와 같은 θ 가 나온다. NO_JUDGE 는 PREF_PAIRS 에서 판정자 쌍 8개를 뺀 새 목록이다.
def train(pairs, steps=300):
    th, share = [0.0, 0.0, 0.0], {s: 0.0 for s in SOURCES}
    for _ in range(steps):
        push = {pid: BETA * sigmoid(-BETA * dot(th, DELTA[pid])) for pid, w, l, src in pairs}
        for pid, w, l, src in pairs:
            share[src] += 2.0 * (push[pid] * DELTA[pid][0] / len(pairs))
        th = [t + 2.0 * (sum(push[pid] * DELTA[pid][j] for pid, w, l, src in pairs) / len(pairs)) for j, t in enumerate(th)]
    return th, share


th20, share = train(PREF_PAIRS)
print('쌍 20개로 다시 돌린 θ (' + ', '.join(f'{v:+.2f}' for v in th20) + f") 는 3단계의 300걸음 θ 와 같은가 {tuple(th20) == saved[-1]['theta']}")
print(f'글자 수 가중치 {th20[0]:+.2f} 의 출처별 몫 ' + ', '.join(f'{s} {share[s]:+.2f}' for s in SOURCES))
NO_JUDGE = [p for p in PREF_PAIRS if p[3] != 'judge']
th12, _ = train(NO_JUDGE)
pi12 = policy(th12)
print(f'판정자 쌍을 뺀 {len(NO_JUDGE)}쌍으로 300걸음 θ (' + ', '.join(f'{v:+.2f}' for v in th12) + f'), '
      f"통과율 {sum(pi12[k] for k in PASS):.3f}, c06+c07 {pi12['c06'] + pi12['c07']:.3f}, 확률이 가장 큰 후보 {max(pi12, key=pi12.get)}")

# 6단계: LoRA 가 학습할 가중치 수를 센다
# LoRA 는 d × k 행렬 W0 를 고정하고 B(d × r) 와 A(r × k) 만 학습한다. 행렬 하나에서 학습할 수는 r × (d + k) 다.
D = K = 4096
print(f'{D} × {K} 행렬 하나의 가중치 {D * K:,}개')
for r in (4, 8, 16):
    n = r * (D + K)
    print(f'r {r}: {r} × ({D} + {K}) = {n:,}개, 행렬의 {n / (D * K):.2%}')
print(f'이 블록이 학습한 가중치 {len(theta)}개 (θ 의 글자, 숫자, 최상급)')
# 출력:
# 1단계 뜻: 통과 후보는 chosen 으로 나온 후보와 같고, c06 과 c07 은 쌍에 없으며, Δφ 의 글자 수 칸은 판정자 쌍만 크게 양수다.
# 통과(40자 이하, 숫자 일치 1, 최상급 0) 후보 c01, c02, c03, c04, c05 / chosen 으로 나온 후보 c01, c02, c03, c04, c05
# c06: 49자, 숫자 일치 1, 최상급 0, 쌍에 나온 수 0
# c07: 43자, 숫자 일치 1, 최상급 0, 쌍에 나온 수 0
# Δφ 평균 gate 6쌍 (+0.017, +0.667, -0.500)
# Δφ 평균 judge 8쌍 (+1.438, +0.000, +0.000)
# Δφ 평균 edit 6쌍 (-0.383, +0.500, -0.833)
# Δφ 평균 전체 20쌍 (+0.465, +0.350, -0.400)
# Δφ 평균 판정자 쌍 뺌 12쌍 (-0.183, +0.583, -0.667)
# 3단계 뜻: 손실은 300걸음 내내 줄지만, 통과율은 50걸음 뒤로 떨어지고 확률이 c06, c07 로 옮겨 간다.
# φ = (글자 수 / 10, 숫자 일치, 최상급), 학습률 2.0 으로 300걸음, 25걸음마다 체크포인트
# 열: 걸음, 손실, θ(글자, 숫자, 최상급), 통과율, c06+c07 확률, 평균 글자 수, KL, 확률이 가장 큰 후보
#   0 손실 0.693 θ +0.00 +0.00 +0.00 통과율 0.255 c06+c07 0.002 글자 23.3 KL 0.00 c09
#  25 손실 0.636 θ +1.08 +0.85 -0.97 통과율 0.449 c06+c07 0.032 글자 26.4 KL 0.35 c09
#  50 손실 0.589 θ +2.01 +1.66 -1.90 통과율 0.597 c06+c07 0.204 글자 34.4 KL 2.08 c04
#  75 손실 0.549 θ +2.82 +2.42 -2.77 통과율 0.473 c06+c07 0.472 글자 41.1 KL 3.98 c06
# 100 손실 0.515 θ +3.52 +3.14 -3.60 통과율 0.299 c06+c07 0.681 글자 44.4 KL 5.13 c06
# 125 손실 0.486 θ +4.14 +3.82 -4.39 통과율 0.178 c06+c07 0.813 글자 46.2 KL 5.86 c06
# 150 손실 0.460 θ +4.69 +4.47 -5.14 통과율 0.106 c06+c07 0.890 글자 47.2 KL 6.33 c06
# 175 손실 0.437 θ +5.19 +5.09 -5.85 통과율 0.064 c06+c07 0.934 글자 47.8 KL 6.64 c06
# 200 손실 0.417 θ +5.63 +5.68 -6.54 통과율 0.040 c06+c07 0.959 글자 48.2 KL 6.84 c06
# 225 손실 0.399 θ +6.04 +6.24 -7.19 통과율 0.026 c06+c07 0.974 글자 48.4 KL 6.98 c06
# 250 손실 0.383 θ +6.41 +6.78 -7.82 통과율 0.017 c06+c07 0.983 글자 48.6 KL 7.08 c06
# 275 손실 0.368 θ +6.75 +7.29 -8.43 통과율 0.012 c06+c07 0.988 글자 48.7 KL 7.14 c06
# 300 손실 0.354 θ +7.07 +7.78 -9.01 통과율 0.008 c06+c07 0.992 글자 48.8 KL 7.19 c06
# 손실이 앞 걸음보다 줄지 않은 걸음 0개 (300걸음 가운데)
# 4단계 뜻: 50걸음은 18쌍만 맞혔지만 통과율이 가장 높아, 그 체크포인트의 θ 로 되돌리고 통과율을 다시 셌다.
# 50걸음: 통과율 0.597, 손실 0.589, 맞힌 쌍 18/20, KL 2.08
# 300걸음: 통과율 0.008, 손실 0.354, 맞힌 쌍 20/20, KL 7.19
# 50걸음의 θ (+2.01, +1.66, -1.90) 로 되돌렸다. 되돌린 θ 의 통과율 0.597, 손실 0.589
# 5단계 뜻: 300걸음 동안 글자 수 가중치를 키운 것은 판정자 쌍이고, 판정자 쌍을 빼고 다시 학습하면 확률이 c06, c07 로 가지 않는다.
# 쌍 20개로 다시 돌린 θ (+7.07, +7.78, -9.01) 는 3단계의 300걸음 θ 와 같은가 True
# 글자 수 가중치 +7.07 의 출처별 몫 gate -0.48, judge +11.67, edit -4.12
# 판정자 쌍을 뺀 12쌍으로 300걸음 θ (-2.35, +10.46, -11.76), 통과율 1.000, c06+c07 0.000, 확률이 가장 큰 후보 c01
# 6단계 뜻: r 이 두 배가 되면 학습할 가중치도 두 배이고, 이 블록이 학습한 것은 θ 3개다.
# 4096 × 4096 행렬 하나의 가중치 16,777,216개
# r 4: 4 × (4096 + 4096) = 32,768개, 행렬의 0.20%
# r 8: 8 × (4096 + 4096) = 65,536개, 행렬의 0.39%
# r 16: 16 × (4096 + 4096) = 131,072개, 행렬의 0.78%
# 이 블록이 학습한 가중치 3개 (θ 의 글자, 숫자, 최상급)
```

| 걸음 | 손실 | θ (글자, 숫자, 최상급) | 통과율 | c06+c07 | 평균 글자 수 | KL | 확률이 가장 큰 후보 |
|---|---|---|---|---|---|---|---|
| 0 | 0.693 | +0.00, +0.00, +0.00 | 0.255 | 0.002 | 23.3 | 0.00 | c09 |
| 50 | 0.589 | +2.01, +1.66, -1.90 | 0.597 | 0.204 | 34.4 | 2.08 | c04 |
| 100 | 0.515 | +3.52, +3.14, -3.60 | 0.299 | 0.681 | 44.4 | 5.13 | c06 |
| 300 | 0.354 | +7.07, +7.78, -9.01 | 0.008 | 0.992 | 48.8 | 7.19 | c06 |

손실은 300걸음 가운데 앞 걸음보다 줄지 않은 걸음이 0개입니다. 통과율은 0.255 에서 50걸음의 0.597 로 올랐다가, 100걸음에 0.299, 300걸음에 0.008 이 되었습니다. 같은 사이 c06 과 c07 의 확률 합은 0.002 에서 0.992 로 늘었고, 75걸음부터 확률이 가장 큰 후보는 c06 입니다. c06 은 49자, c07 은 43자라 길이 게이트에만 걸리고, 어느 쌍에도 나오지 않습니다.

θ 는 300걸음에 (+7.07, +7.78, -9.01) 이 되었습니다. 5단계가 글자 수 가중치에 더해진 양을 출처별로 모으면 판정자 쌍 +11.67, 게이트 쌍 -0.48, 편집 쌍 -4.12 입니다. 판정자 쌍 8개를 뺀 12쌍으로 같은 300걸음을 다시 학습하면 글자 수 가중치는 -2.35 로 끝납니다. 그때 통과율은 1.000 이고, c06 과 c07 의 확률 합은 0.000 입니다. 그래서 글자 수 가중치를 키워 통과율을 떨어뜨린 것은 판정자 쌍입니다. c06 과 c07 은 통과 후보와 숫자 일치, 최상급 값이 같고 더 길어서, 글자 수 가중치만큼 점수를 더 얻습니다.

학습이 보는 값은 좋아지는데 정말 원하는 값이 나빠지는 일을 과최적화라고 부릅니다. 손실은 쌍 20개의 margin 만 보므로, 쌍에 없는 두 카피가 확률을 가져가도 계속 줄었습니다. 300걸음에는 맞힌 쌍이 20/20 이었지만 통과율은 0.008 이라, 블록은 통과율이 가장 높은 50걸음의 θ 로 되돌립니다. InstructGPT 논문은 강화학습 단계에서 보상 모델의 과최적화를 줄이려고, 토큰마다 SFT 모델과의 KL 벌점을 더했다고 적었습니다. DPO 논문은 보상 과최적화가 DPO 에서 어떻게 나타나는지를 앞으로 볼 물음으로 남겼습니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-sft-dpo-cards.html?embed=1&card=overopt" height="480" loading="lazy" title="300걸음 동안 줄어드는 손실과 50걸음 뒤로 떨어지는 통과율, 쌍에 없는 c06 과 c07 의 확률"></iframe>
<a class="demo-embed-open" href="demo-sft-dpo-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 6. LoRA 는 고칠 가중치를 줄입니다

**LoRA 는 원래 행렬을 고정하고, 작은 행렬 둘의 곱만 학습해 더합니다. 4096 × 4096 행렬 하나에서 r 이 4, 8, 16 이면 학습할 가중치는 32,768개, 65,536개, 131,072개입니다. 행렬 전체의 0.20%, 0.39%, 0.78% 입니다.**

블록 3 은 참조 모델의 로그 확률을 고정하고 θ 3개만 학습했습니다. 이미 학습한 모델을 새 일에 맞춰 더 학습하는 것을 파인튜닝이라고 부르고, SFT 와 DPO 도 파인튜닝입니다. 실제 언어 모델은 가중치가 행렬 단위로 모여 있고, 4096 × 4096 행렬 하나만 해도 16,777,216개입니다. 기울기로 가중치를 옮기는 옵티마이저가 Adam 이면, 모든 가중치를 고칠 때 가중치마다 그 상태도 메모리에 둡니다. 고친 모델을 저장할 때도 원래 모델만큼의 크기가 듭니다.

LoRA(Low-Rank Adaptation)는 원래 행렬 W0 를 고정하고, 그 변화를 행렬 둘의 곱 BA 로 적습니다. 논문은 W0 가 d × k 일 때 B 를 d × r, A 를 r × k 로 두고, r 을 d 와 k 보다 훨씬 작게 잡았습니다. A 는 무작위 가우시안, B 는 0 으로 시작해서 학습을 시작할 때 BA 는 0 입니다. 그래서 첫 걸음의 모델은 원래 모델과 같고, 학습은 B 와 A 만 고칩니다.

행렬 하나에서 학습할 수는 B 의 d × r 개와 A 의 r × k 개를 더한 r × (d + k) 입니다. 블록 3 의 6단계가 4096 × 4096 행렬로 이 수를 셉니다. r 이 8 이면 65,536개로 행렬의 0.39% 이고, r 을 두 배로 늘리면 학습할 수도 두 배가 됩니다.

| r | 학습할 가중치 수 | 4096 × 4096 행렬의 몫 |
|---|---|---|
| 4 | 32,768 | 0.20% |
| 8 | 65,536 | 0.39% |
| 16 | 131,072 | 0.78% |
| 행렬 전체 | 16,777,216 | |
| 블록 3 의 θ | 3 | |

논문은 GPT-3 175B 를 Adam 으로 파인튜닝할 때와 비교했습니다. 학습 가중치 수는 10,000배, GPU 메모리는 3배 줄일 수 있다고 적었습니다. 같은 GPT-3 175B 에서 학습 중 GPU 메모리(VRAM)는 1.2TB 에서 350GB 로 줄었다고 적었습니다. 체크포인트는 350GB 에서 35MB 로 약 10,000배 작아졌다고도 적었습니다. 체크포인트 크기의 수치는 r 4 로 셀프 어텐션의 행렬 넷 가운데 query 와 value 둘만 바꾼 조건입니다. 블록의 0.39% 는 행렬 하나에서 센 몫이라, 모델 전체에서 측정한 논문의 수치와는 따로 읽습니다.

LoRA 는 손실을 바꾸지 않고, 어느 가중치를 고칠지만 바꿉니다. SFT 의 손실도 DPO 의 손실도 그대로 쓰고, 그 기울기로 B 와 A 만 고칩니다. 블록 3 이 참조 모델의 값을 고정하고 θ 만 고친 것과 같은 꼴입니다. 논문은 배포한 뒤에도 B 와 A 만 바꿔 끼워 다른 과제로 옮길 수 있다고 적었습니다.

## 7. 두 무대는 쌍을 모으는 곳이 다릅니다

**SFT 와 DPO 의 셈은 두 무대가 같습니다. 다른 것은 선호 쌍의 출처 셋이 한 회사 안에 모이느냐입니다. 담장 안은 광고주 편집과 심사 결과가 같은 회사에 쌓이고, 열린 RTB 의 DSP 는 매체의 심사 결과를 받지 못할 수 있습니다.**

두 무대의 이름은 18주째 [자연어 오디언스](post.html?id=natural-language-audience) 편 8절에서 풀었습니다. 1~6절의 셈은 두 무대가 같고, 쌍의 출처 셋을 어디까지 모을 수 있는지가 다릅니다.

### 담장 안에서는 쌍의 출처 셋이 한 회사에 모입니다 [무대: 닫힌 생태계]

담장 안의 플랫폼은 카피를 만들고, 게이트와 판정자에 넣고, 자기 지면에 노출합니다. 광고주가 카피를 고친 기록과 심사에서 빠진 카피도 같은 회사에 쌓입니다. 그래서 게이트 쌍, 판정자 쌍, 편집 쌍을 한 곳에서 모으고 쌍마다 출처를 적어 둘 수 있습니다. 출처별 글자 수 차이처럼 쌍이 가르치는 버릇도 학습 전에 셀 수 있습니다.

### 열린 RTB 에서는 쌍의 출처가 줄어듭니다 [무대: 열린 RTB]

열린 RTB 의 DSP 는 카피를 만들고 판정한 뒤 입찰 응답에 담아 보냅니다. 게이트 쌍과 판정자 쌍은 DSP 안에서 만들 수 있습니다. 다만 36주째 [생성 문구 판정 체계](post.html?id=generated-copy-judging-system) 편에서 본 것처럼, 매체 쪽의 심사 결과는 DSP 에 오지 않을 수 있습니다. 그러면 심사에서 빠진 카피로 쌍을 만들기 어렵고, 판정자 쌍의 몫이 커지면 판정자의 버릇이 더 크게 들어갈 수 있습니다.

## 한눈 정리

| 자리 | 무엇을 보나 | 이 글의 숫자 |
|---|---|---|
| SFT 한 걸음 | chosen 하나의 로그 확률을 올림 | chosen -12.425 → -11.121, rejected -12.425 → -12.121 |
| DPO 한 걸음 | chosen 과 rejected 의 로그 비율 차이를 벌림 | chosen -11.977, rejected -12.977, 공유 토큰 0.000 |
| 선호 쌍 | 출처 셋과 글자 수 차이 | 게이트 6, 판정자 8, 광고주 편집 6, 판정자 쌍 +14.4자 |
| DPO 손실 | 로그 확률 넷, β 0.1 | 평균 0.613, d02 margin -0.080, 손실 0.734, 무게 0.520 |
| 무게 | σ(-margin) | margin 음수 4쌍 0.517, 나머지 16쌍 0.441 |
| β | 무게 차이 | β 1.0 에서 0.662 와 0.154 |
| 과최적화 | 300걸음의 손실과 통과율 | 손실 0.693 → 0.354, 통과율 0.255 → 0.597 → 0.008 |
| 판정자 쌍의 몫 | 글자 수 가중치의 출처별 몫, 빼고 다시 학습 | 판정자 +11.67, 게이트 -0.48, 편집 -4.12, 12쌍이면 통과율 1.000 |
| 되돌리기 | 통과율이 가장 높은 체크포인트 | 50걸음, θ (+2.01, +1.66, -1.90) |
| LoRA | r × (d + k) | r 8 이면 65,536개, 0.39% |

## 헷갈리기 쉬운 점

- **DPO 손실이 줄어도 카피가 좋아진 것은 아닙니다.** 블록 3 의 손실은 300걸음 가운데 한 번도 오르지 않았지만, 통과율은 50걸음 뒤로 떨어졌습니다. 손실은 쌍 20개의 margin 만 보고, 쌍에 없는 카피의 확률은 보지 않습니다. 그래서 체크포인트는 손실이 아니라 통과율처럼 따로 측정한 값으로 고릅니다.
- **DPO 는 chosen 의 확률을 올리는 것이 아니라 두 로그 비율의 차이를 벌립니다.** 블록 3 에서 chosen 으로 나온 후보는 c01 부터 c05 까지로, 통과 후보 다섯과 같습니다. 300걸음에 맞힌 쌍은 20/20 인데, 다섯의 확률 합인 통과율은 0.255 에서 0.008 로 줄었습니다. 쌍에 없는 c06 과 c07 이 확률을 가져갔기 때문입니다.
- **β 는 학습률이 아닙니다.** 학습률은 모든 쌍의 걸음을 같은 배수로 바꿉니다. β 도 기울기 앞에 곱해지지만, 시그모이드 안에서 margin 까지 바꿉니다. 그래서 β 1.0 에서는 margin 음수 4쌍의 무게가 0.662, 나머지가 0.154 입니다. 평균 손실도 β 에 따라 0.684 에서 0.370 까지 달라져, β 가 다른 실행의 손실은 비교하지 않습니다.

## 더 깊이 보기

:::deep DPO 손실과 기울기의 식
DPO 논문의 식 7 은 선호 쌍 데이터셋 $\mathcal{D}$ 에 대한 기댓값으로 손실을 적습니다. 프롬프트는 $x$, chosen 은 $y_w$, rejected 는 $y_l$ 입니다. 정책은 $\pi_\theta$, 참조 모델은 $\pi_{\mathrm{ref}}$ 로 적습니다. 아래 첫 식이 쌍 하나의 항이고, 둘째 식이 식 7 입니다.

$$\ell(x, y_w, y_l) = -\log \sigma\left(\beta \log \frac{\pi_\theta(y_w \mid x)}{\pi_{\mathrm{ref}}(y_w \mid x)} - \beta \log \frac{\pi_\theta(y_l \mid x)}{\pi_{\mathrm{ref}}(y_l \mid x)}\right)$$

$$\mathcal{L}_{\mathrm{DPO}} = \mathbb{E}_{(x, y_w, y_l) \sim \mathcal{D}}\big[\ell(x, y_w, y_l)\big]$$

괄호 안이 블록의 margin 이고, 블록 2 와 3 은 쌍 20개의 항을 평균합니다. 논문은 아래의 $\hat r_\theta$ 를 암묵적 보상이라 부르고, 4절에서 기울기를 그 아래처럼 적었습니다.

$$\hat r_\theta(x, y) = \beta \log \frac{\pi_\theta(y \mid x)}{\pi_{\mathrm{ref}}(y \mid x)}$$

$$\nabla_\theta \mathcal{L}_{\mathrm{DPO}} = -\beta\, \mathbb{E}\Big[\sigma\big(\hat r_\theta(x, y_l) - \hat r_\theta(x, y_w)\big)\big(\nabla_\theta \log \pi_\theta(y_w \mid x) - \nabla_\theta \log \pi_\theta(y_l \mid x)\big)\Big]$$

σ 항이 블록의 무게 σ(-margin) 이고, 암묵적 보상이 rejected 를 더 높게 매길수록 커집니다. 블록 3 의 정책은 아래와 같아서, margin 을 세면 $\log Z(\theta)$ 가 쌍 안에서 지워집니다.

$$\log \pi_\theta(c) = \log \pi_{\mathrm{ref}}(c) + \mathrm{dot}(\theta, \phi(c)) - \log Z(\theta)$$

그래서 margin 은 β dot(θ, Δφ) 입니다. 손실을 줄이는 방향은 쌍마다 β σ(-β dot(θ, Δφ)) Δφ 를 구해 평균한 값입니다.
:::

:::deep SFT 손실과 토큰 점수의 기울기
SFT 의 손실은 chosen 의 음의 로그 확률 $-\log \pi(y_w)$ 입니다. 유니그램에서 토큰 $k$ 의 확률은 로짓 $z_k$ 로 아래처럼 적고, 카피 $y$ 의 로그 확률은 그 아래입니다.

$$p_k = \frac{e^{z_k}}{Z}, \qquad Z = \sum_j e^{z_j}$$

$$\log \pi(y) = \sum_{t \in y} z_t - |y| \log Z$$

$n_k(y)$ 는 카피 $y$ 에 토큰 $k$ 가 든 횟수, $|y|$ 는 카피의 토큰 수입니다. 로그 확률을 로짓 $z_k$ 로 미분하면 아래가 나옵니다.

$$\frac{\partial \log \pi(y)}{\partial z_k} = n_k(y) - |y|\, p_k$$

SFT 한 걸음은 이 값에 학습률 $\eta$ 를 곱해 더하고, 블록의 $\eta$ 는 0.5 입니다. DPO 한 걸음에서 토큰 $k$ 의 로짓이 움직이는 양은 아래이고, 블록의 $\eta$ 는 5.0, $m$ 은 margin 입니다.

$$\eta\, \beta\, \sigma(-m) \Big[\big(n_k(y_w) - n_k(y_l)\big) - \big(|y_w| - |y_l|\big)\, p_k\Big]$$

두 카피의 토큰 수가 같으면 둘째 항이 0 이 되고, 두 카피에 같은 횟수로 든 토큰은 첫째 항도 0 입니다.
:::

:::deep LoRA 의 식
LoRA 논문의 식 3 은 원래 행렬 $W_0$ 를 지나는 입력 $x$ 의 출력을 아래처럼 적습니다. $W_0$ 는 d × k 행렬입니다.

$$h = W_0 x + \Delta W x = W_0 x + B A x, \qquad B \in \mathbb{R}^{d \times r},\ A \in \mathbb{R}^{r \times k}$$

학습하는 동안 $W_0$ 는 기울기를 받지 않고, $A$ 와 $B$ 만 고칩니다. 논문은 $\Delta W x$ 에 α / r 을 곱하고, α 는 처음 시도한 r 로 두고 다시 맞추지 않았다고 적었습니다. 학습할 수는 d × r 과 r × k 를 더한 r × (d + k) 이고, d 와 k 가 4096, r 이 8 이면 65,536 입니다. 배포할 때는 $W_0 + BA$ 를 미리 계산해 두어서 추론 지연이 늘지 않는다고 적었습니다.
:::

- [LLM-as-a-Judge](post.html?id=llm-as-a-judge) — 판정자와 짝비교를 처음 다룬 26주째 편입니다.
- [광고 카피 생성](post.html?id=grounded-ad-copy-generation) — 게이트 넷과 서연 씨 러닝화 자산이 나온 35주째 편입니다.
- [생성 문구 판정 체계](post.html?id=generated-copy-judging-system) — 판정자가 카피에 점수를 매기고 둘 가운데 고른 36주째 편입니다.
- [SFT 와 DPO 카드 네 장](demo-sft-dpo-cards.html) — 이 글의 카드 전체입니다. 카드를 누르면 헷갈리는 것 하나가 더 나옵니다.
- [DPO 손실 놀이터](demo-dpo-loss.html) — 로그 확률 넷과 β 를 바꿔 이 글의 DPO 손실을 다시 세는 곳입니다. 기본값에서는 블록 2 의 d02 줄과 같은 margin -0.080, 손실 0.734, 무게 0.520 이 나옵니다.

## 참고문헌

- Ouyang, L., Wu, J., Jiang, X., et al. (2022). *Training language models to follow instructions with human feedback*. arXiv:2203.02155. [arxiv.org](https://arxiv.org/abs/2203.02155). 시연으로 GPT-3 를 지도 학습하고, 비교로 보상 모델을 학습한 뒤 PPO 로 정책을 고치는 세 단계를 적었습니다. 라벨러에게 답 4~9개의 순위를 매기게 해, 프롬프트마다 비교 쌍을 여럿 만들었습니다. PPO 단계에서는 보상 모델의 과최적화를 줄이려고 토큰마다 SFT 모델과의 KL 벌점을 더했습니다. 논문이 모은 프롬프트로 한 사람 평가에서는 1.3B InstructGPT 의 답이 175B GPT-3 의 답보다 선호되었습니다.
- Rafailov, R., Sharma, A., Mitchell, E., et al. (2023). *Direct Preference Optimization: Your Language Model is Secretly a Reward Model*. NeurIPS 2023. arXiv:2305.18290. [arxiv.org](https://arxiv.org/abs/2305.18290). 보상 모델과 강화학습 없이, 선호 쌍의 분류 손실 하나로 정책을 학습하는 DPO 를 내놓았습니다. 손실은 정책과 참조 모델의 확률 비율에 로그를 씌운 값으로 적고, β × 그 로그 비율을 암묵적 보상으로 봅니다. 기울기는 암묵적 보상이 쌍의 순서를 틀리게 매길수록 큰 무게를 받는다고 풀었습니다. 참조 모델은 SFT 모델이 있으면 그 모델로 두고, 없으면 chosen 으로 학습해 만든다고 적었습니다.
- Hu, E. J., Shen, Y., Wallis, P., et al. (2021). *LoRA: Low-Rank Adaptation of Large Language Models*. arXiv:2106.09685. [arxiv.org](https://arxiv.org/abs/2106.09685). 사전 학습한 가중치를 고정하고, 층마다 학습할 저랭크 행렬의 곱 BA 를 더하는 방법입니다. A 는 무작위 가우시안, B 는 0 으로 시작해 학습을 시작할 때 BA 는 0 입니다. GPT-3 175B 를 Adam 으로 파인튜닝할 때와 비교해 학습 가중치 수를 10,000배, GPU 메모리를 3배 줄인다고 적었습니다.
- Christiano, P., Leike, J., Brown, T. B., et al. (2017). *Deep reinforcement learning from human preferences*. arXiv:1706.03741. [arxiv.org](https://arxiv.org/abs/1706.03741). 사람이 짧은 영상 조각 둘 가운데 나은 쪽을 고르면, 그 선택으로 보상 함수를 배우는 방법입니다. 조각을 고를 확률이 조각에 걸친 예측 보상 합의 지수에 비례한다고 두었고, Bradley-Terry 모델을 따릅니다. Atari 와 MuJoCo 의 과제를, 에이전트가 환경과 주고받은 것의 1% 미만에 준 피드백으로 풀었다고 적었습니다.
