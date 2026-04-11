MAB(Multi-Armed Bandit) 알고리즘들을 AdTech 엔지니어의 시각에서 정리한 치트 시트입니다. "어떤 상황에 뭘 써야 하지?" 헷갈릴 때 참고하세요.

---

AdTech에서는 "탐색(Exploration)과 활용(Exploitation)의 균형"을 맞추기 위해 다음의 무기들을 사용합니다.

## 1. Context-Free Bandits (상황을 보지 않음)

> "누가 오든 똑같이 대한다. 오직 광고의 '평균 실력'만 믿는다."
> *사용처: 배너 A/B 테스트, 데이터가 적은 초기 단계, 단순 로테이션*

### ① ε-Greedy (입실론 그리디)

* 별명: 동전 던지기
* 로직: 동전을 던져서(확률 ) 앞면이면 아무거나 뽑고(탐색), 뒷면이면 1등을 뽑는다(활용).
* 특징: 구현이 제일 쉽지만, 탐색할 때 최악의 광고를 보여줄 위험이 있음.

AdTech 적용: "모델 마련 전까진 랜덤으로 임의의 ad를 1개 선택"하는 로직이 바로 이 방식의 가장 기초적인 형태(Pure Exploration)입니다.

```python
import numpy as np

def epsilon_greedy(rewards_history, epsilon=0.1):
    """ε-Greedy: 확률 ε로 랜덤 탐색, 1-ε로 최고 평균 선택"""
    n_arms = len(rewards_history)
    if np.random.rand() < epsilon:
        return np.random.randint(n_arms)  # 탐색: 무작위 선택
    means = [np.mean(r) if len(r) > 0 else 0 for r in rewards_history]
    return np.argmax(means)  # 활용: 최고 평균 arm

# 시뮬레이션: 광고 3개, 실제 CTR = [2%, 5%, 3%]
np.random.seed(42)
true_ctrs = [0.02, 0.05, 0.03]
history = [[] for _ in range(3)]

for t in range(1000):
    arm = epsilon_greedy(history, epsilon=0.1)
    reward = np.random.binomial(1, true_ctrs[arm])
    history[arm].append(reward)

for i, h in enumerate(history):
    print(f"  광고{i}: 노출 {len(h):4d}회, 추정CTR={np.mean(h):.3f} "
          f"(실제={true_ctrs[i]:.3f})")
# 광고1(CTR 5%)에 노출이 자연스럽게 집중됨
```

### ② UCB (Upper Confidence Bound)

* 별명: 긍정왕 (낙관주의자)
* 로직: `평균 + 신뢰 보너스(confidence bound)`. "데이터가 없어서 잘 모르는 광고? 운 좋으면 대박일 거야!"라고 믿고 점수를 퍼줌.
* 특징: 수학적으로 증명된 알고리즘. 랜덤성이 없어서(Deterministic) 디버깅하기 좋음.

### ③ Thompson Sampling (Basic / Beta)

* 별명: 도박사 (확률주의자)
* 로직: 각 광고의 성공 확률을 Beta 분포로 그림. 매번 주사위를 굴려서(Sampling) 나온 값으로 1등을 정함.
* 특징: 현업에서 A/B 테스트용으로 성능이 가장 좋음. 하지만 유저별 개인화는 불가능.

```python
import numpy as np

def thompson_sampling(alphas, betas):
    """Thompson Sampling: Beta 분포에서 샘플링하여 arm 선택"""
    samples = [np.random.beta(a, b) for a, b in zip(alphas, betas)]
    return np.argmax(samples)

# 시뮬레이션: 광고 3개, 실제 CTR = [2%, 5%, 3%]
np.random.seed(42)
true_ctrs = [0.02, 0.05, 0.03]
alphas = [1, 1, 1]  # 사전분포 Beta(1,1) = Uniform
betas = [1, 1, 1]

for t in range(1000):
    arm = thompson_sampling(alphas, betas)
    reward = np.random.binomial(1, true_ctrs[arm])
    if reward:
        alphas[arm] += 1  # 클릭 → α 증가 (성공 누적)
    else:
        betas[arm] += 1   # 미클릭 → β 증가 (실패 누적)

for i in range(3):
    est = alphas[i] / (alphas[i] + betas[i])
    n = alphas[i] + betas[i] - 2
    print(f"  광고{i}: 노출 {n:4d}회, 추정CTR={est:.3f} (실제={true_ctrs[i]:.3f})")
# Beta 분포가 자연스럽게 탐색/활용 균형을 잡아줌
```

---

## 2. Contextual Bandits (상황을 봄)

> "들어온 손님(User)과 검색어(Query)에 따라 맞춤형으로 대한다."
> *사용처: 검색 광고(파워링크), 추천 시스템, 개인화 피드*

이 단계부터는 "행렬(Matrix)"이 등장하며, Ad selection~pCTR 취득 단계에 들어가는 핵심 엔진입니다.

### ④ Disjoint LinUCB

* 별명: 각자도생 개인플레이
* 로직:
  * 광고마다 서로 다른 공책(Model)을 가짐.
  * 점수 = (개별 예측) + (개별 불확실성)
* 핵심:
  * 역행렬($A^{-1}$)은 '내가 모르는 정도'를 의미함.
  * 들어온 손님($x$)이 내가 잘 모르는 방향이면 역행렬 값이 커져서 탐색 점수가 올라감.
* 한계: 신규 광고가 들어오면 기존 광고들의 지식을 못 빌려 써서 맨땅에 헤딩(Cold Start) 해야 함.

```python
import numpy as np

def linucb_score(x, A_inv, b, alpha=1.0):
    """LinUCB 점수 = 예측(활용) + 불확실성(탐색)"""
    theta = A_inv @ b                             # 학습된 가중치
    prediction = x @ theta                        # 개인화된 CTR 예측
    uncertainty = alpha * np.sqrt(x @ A_inv @ x)  # 탐색 보너스
    return prediction + uncertainty, prediction, uncertainty

# 예시: context 차원 d=4, 광고 2개 비교
d = 4
A_inv = [np.eye(d) for _ in range(2)]  # 초기: 단위행렬 (최대 불확실성)
b_vec = [np.zeros(d) for _ in range(2)]

# 광고 0에만 데이터 10개 축적
np.random.seed(42)
for _ in range(10):
    x_sample = np.random.randn(d)
    reward = 0.5 + 0.3 * x_sample[0]  # feature[0]이 CTR에 영향
    A = np.linalg.inv(A_inv[0]) + np.outer(x_sample, x_sample)
    A_inv[0] = np.linalg.inv(A)
    b_vec[0] += reward * x_sample

# 새 유저 context로 두 광고 비교
x_new = np.array([1.0, 0.5, -0.3, 0.1])
for arm in range(2):
    score, pred, unc = linucb_score(x_new, A_inv[arm], b_vec[arm])
    status = "학습됨" if arm == 0 else "미학습"
    print(f"  광고{arm}({status}): 점수={score:.3f} "
          f"(예측={pred:.3f} + 보너스={unc:.3f})")
# 미학습 광고는 보너스가 커서 탐색 기회를 얻음
```

### ⑤ Hybrid LinUCB

* 별명: 지식공유 팀플레이
* 로직:
  * 모든 광고가 공유하는 공통 공책($A_0$)과, 각자의 개별 공책($A_a$)을 가짐.
  * 점수 = (공통 지식 + 개별 지식) + (공통 불확실성 + 개별 불확실성)
* 핵심:
  * "나이키"나 "운동화" 같은 광고의 피쳐(Feature)를 통해 지식을 공유함.
  * 판매량이 0인 신규 광고라도, "나이키니까 기본은 하겠지"라며 공통 지식 버프를 받아 노출 기회를 얻음.

AdTech 적용: Broad match keyword처럼 다양한 키워드와 광고가 매칭될 때, 키워드의 속성을 공유하여 학습 속도를 높이는 데 필수적입니다.

### ⑥ Linear Thompson Sampling

* 별명: LinUCB의 확률 버전
* 로직: LinUCB처럼 상한선(Upper Bound)을 계산하는 게 아니라, 가중치 분포(Gaussian)에서 임의의 가중치를 뽑아서 점수를 계산.
* 특징: 딥러닝 모델의 마지막 레이어에 붙여서 탐색을 유도할 때 자주 쓰임.

---

## 3. 한눈에 보는 비교표

| 알고리즘 | 정보 활용 (Context) | 지식 공유 (Sharing) | 탐색 방식 | 추천 상황 |
| --- | --- | --- | --- | --- |
| ε-Greedy | X | X | Random | 로직 검증, 단순 롤링 |
| Basic TS (Beta) | X | X | Sampling | 배너 A/B 테스트 |
| Disjoint LinUCB | O (User) | X | Deterministic | 광고 개수가 적고 고정적일 때 |
| Hybrid LinUCB | O (User + Ad) | O | Deterministic | 신규 광고가 많은 커머스/검색광고 |

---

## 4. 마무리 (AdTech Engineer's View)

* 학습(Learning): 유저가 클릭하면($r=1$), 해당 광고의 행렬($A_a$)에 그 유저의 특징($x$)을 더해줍니다. 이것이 "경험치를 쌓는 과정"입니다.
* 탐색(Exploration): 경험치가 쌓이면 역행렬($A_a^{-1}$)이 작아집니다. 즉, "이제 다 아니까 모험 안 해" 상태가 됩니다.
* 진화: 처음엔 Basic TS로 시작해서 유저를 구분하는 Disjoint LinUCB로 신규 광고까지 챙기는 Hybrid LinUCB로 고도화하는 것이 정석 테크트리입니다.

이 알고리즘들의 전체 구조를 이해했다면, 실제 Ad Serving Engine 구현에 필요한 기초가 갖춰진 것입니다.
