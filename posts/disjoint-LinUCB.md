Disjoint LinUCB 모델의 시각화를 통해, UCB 점수가 어떻게 구성되고 왜 특정 광고가 추천되는지를 해석합니다.

---

### 1. Disjoint LinUCB의 핵심 구조

Disjoint LinUCB에서는 광고(Arm)마다 별도의 행렬을 관리합니다. 4개의 막대그래프가 서로 독립적으로 각자의 점수를 계산하는 구조입니다.

* Ad A의 점수: 오직 Ad A의 과거 데이터(클릭)만 반영됨.
* Ad B의 점수: Ad A가 클릭되든 말든 상관없음.

---

<div class="chart-js-container">
  <canvas id="linucbChart" height="300"></canvas>
</div>
<p style="text-align: center; margin-top: 0.5rem;">
  <a href="demo-linucb.html" class="btn-demo">Interactive Demo로 직접 실험해보기 →</a>
</p>

### 2. 그래프 완벽 해석 (The Anatomy of UCB)

이 그래프는 LinUCB의 핵심 공식인 "최종 점수 = 예측(Exploitation) + 불확실성(Exploration)"을 눈으로 보여줍니다.

#### ① 전체 막대 높이 (Total Height) = 최종 UCB 점수

* 모델은 이 전체 높이가 가장 높은 광고를 유저에게 보여줍니다.
* 현재 Ad A (Tech)가 가장 키가 크기 때문에 [Recommended] 딱지가 붙은 것입니다.

#### ② 색깔 있는 부분 (Bottom Bar) = "실력 점수" (Prediction / Exploitation)

* 수식: $x^T \theta$
* 의미: "지금까지 배운 바로는, 이 유저가 이 광고를 클릭할 확률이 이만큼이야."
* 해석:
  * Ad A (분홍색): 색깔 막대가 제일 높죠? 모델은 "이 유저 취향엔 Ad A가 딱이야!"라고 아주 강하게 확신하고 있습니다.
  * Ad C (노란색): 색깔 막대가 낮습니다. "음.. 경험상 이 유저는 Ad C를 별로 안 좋아할 것 같은데..."라고 생각하는 겁니다.

#### ③ 회색 부분 (Top Bar) = "호기심 점수" (Uncertainty / Exploration)

* 수식: $\alpha \sqrt{x^T A^{-1} x}$
* 의미: "이 광고에 대한 데이터가 부족해서 잘 모르겠어. 그러니까 가산점(보너스)을 줄게!"
* 해석:
  * 데이터가 많이 쌓일수록(많이 노출될수록) 이 회색 막대는 점점 줄어듭니다. (아니까 안 궁금함)
  * Ad D (청록색 위의 회색): 회색 부분이 꽤 두툼하죠? 모델이 "Ad D는 아직 긴가민가해. 기회를 좀 더 줘볼까?"라고 생각하고 있는 겁니다.

---

### 3. 상황별 시나리오 분석

스크린샷의 상황을 점쟁이(모델)의 속마음으로 읽어보겠습니다.

* Ad A (1등, 추천됨): "실력(분홍)도 빵빵하고, 아직 100% 다 아는 건 아니라서 호기심(회색)도 좀 남았네. 합치니까 네가 1등이다!"
* Ad D (2등): "실력(청록)은 A보다 달리는데, 내가 얘를 잘 몰라서(회색이 큼) 점수를 후하게 쳐줬어. 아깝게 2등이네."
  * *만약 여기서 Ad A를 계속 노출하면?* A의 회색이 줄어들면서, 언젠가 D가 역전하는 순간이 올 수도 있습니다(탐색).
* Ad B (3등): "실력도 어중간하고, 궁금한 정도(회색)도 어중간하네."
* Ad C (꼴찌): "실력(노랑)도 형편없다고 예측되고, 이미 노출도 좀 돼서 별로 안 궁금해(회색도 낮음). 넌 탈락."

### 4. 요약

이 시각화는 Disjoint LinUCB가 어떻게 "확실한 이득(색깔 막대)"과 "미래를 위한 투자(회색 막대)" 사이에서 줄타기를 하는지 보여줍니다.

* 유저가 Ad A를 클릭하면?
  1. 분홍색 막대(실력)는 더 커집니다. (예측 성공!)
  2. 회색 막대(호기심)는 줄어듭니다. (이제 너에 대해 더 잘 알게 됐으니까.)

---

### 1. 시소(Seesaw)의 원리: 반비례 관계

행렬 와 그 역행렬 $A^{-1}$은 시소와 같습니다. 한쪽이 커지면, 다른 쪽은 반드시 작아져야 합니다.

숫자 의 역수가 $\frac{1}{5}$인 것과 똑같은 이치입니다.

| 구분 | 행렬  (Original) | 역행렬  (Inverse) |
| --- | --- | --- |
| 의미 | 데이터의 양 (Confidence) | 데이터의 구멍 (Uncertainty) |
| 직관 | "내가 이만큼 경험했다!" | "나는 이만큼 모른다!" |
| 데이터가 쌓이면 | 숫자가 점점 커짐 ($A \uparrow$) | 숫자가 점점 작아짐 ($A^{-1} \downarrow$) |
| 역할 | 과거의 지식을 저장 (Memory) | 탐색 보너스를 계산 (Bonus) |

---

### 2. 코드와 그래프로 다시 보기

시각화에서 보이는 회색 막대(탐색 점수)가 바로 이 역행렬 $A^{-1}$에서 나옵니다.

#### ① 초기 상태 (데이터 0개)

* $A = I$ : 정보 최소 상태 (정규화 항만 존재, 데이터에서 학습한 것 없음)
* $A^{-1} = I$ : 불확실성 최대 (데이터가 쌓이면 $A$가 커지고 $A^{-1}$은 작아짐)
* 결과: $A^{-1}$ 값이 크니까 회색 막대(탐색 점수)가 엄청 길게 나옴.
* 의미: "난 아는 게(A) 없어. 그러니까 모르는 정도($A^{-1}$)가 최대치야! 무조건 찔러봐!"

#### ② 학습 후 (클릭 100번 발생)

* : 데이터가 쌓여서 숫자가 엄청 커짐 (예: 100, 1000...)
* : 반대로 숫자가 아주 작아짐 (예: 0.01, 0.001...)
* 결과: 값이 0에 가까워짐 회색 막대가 사라짐.
* 의미: "난 이제 경험치(A)가 만렙이야. 모르는 거($A^{-1} \approx 0$) 없어. 모험 안 해."

```python
import numpy as np

def sherman_morrison_update(A_inv, x):
    """Sherman-Morrison: O(d²)로 역행렬 갱신 (전체 역행렬 재계산 불필요)"""
    Ax = A_inv @ x
    denom = 1.0 + x @ Ax
    return A_inv - np.outer(Ax, Ax) / denom

# 데이터가 쌓일수록 불확실성 감소 과정
d = 3
x_test = np.array([1.0, 0.5, -0.3])

np.random.seed(42)
checkpoints = [0, 1, 5, 20, 100]
A_inv = np.eye(d)
prev = 0
for step in checkpoints:
    for _ in range(step - prev):
        A_inv = sherman_morrison_update(A_inv, np.random.randn(d))
    prev = step
    unc = np.sqrt(x_test @ A_inv @ x_test)
    print(f"  데이터 {step:3d}개: 불확실성={unc:.4f}"
          f"{'  ← 최대 (탐색 모드)' if step == 0 else ''}")
# 데이터 0→100개: 불확실성이 지속 감소 → 탐색에서 활용으로 전환
```

---

### 3. 기하학적 시각화 (타원)

이걸 그림으로 그리면 "자신감의 타원(Confidence Ellipsoid)"이 됩니다.

* 행렬 가 커진다 = 우리가 찍은 점(데이터)들이 많아진다.
* 역행렬 $A^{-1}$이 작아진다 = 데이터가 많아지니 타원의 크기(오차 범위)가 쪼그라든다.
* LinUCB는 이 타원의 크기($A^{-1}$)가 클수록 "여긴 미지의 영역이다!"라며 가산점을 주는 것입니다.

### 한 줄 요약

> "는 '지식의 탑'이고, $A^{-1}$은 그 탑의 '빈틈'입니다.
> 지식의 탑($A$)이 높게 쌓일수록, 빈틈($A^{-1}$)은 작아집니다.

이 개념을 이해했다면, LinUCB 수식의 핵심 90%를 파악한 것과 같습니다.

```python
import numpy as np

def linucb_alpha_comparison(d=3):
    """alpha 값에 따른 탐색/활용 균형 변화"""
    A_inv_learned = np.eye(d) * 0.05   # 학습된 광고 (불확실성 낮음)
    A_inv_new = np.eye(d) * 1.0        # 신규 광고 (불확실성 높음)
    theta_learned = np.array([0.8, 0.3, 0.1])
    theta_new = np.array([0.2, 0.1, 0.0])
    x = np.array([1.0, 0.5, 0.3])

    for alpha in [0.1, 1.0, 2.5]:
        label = '보수적' if alpha < 0.5 else '탐색적' if alpha > 1.5 else '균형'
        print(f"\n  alpha={alpha} ({label}):")
        for name, theta, A_inv in [("학습광고", theta_learned, A_inv_learned),
                                     ("신규광고", theta_new, A_inv_new)]:
            pred = x @ theta
            bonus = alpha * np.sqrt(x @ A_inv @ x)
            print(f"    {name}: 예측={pred:.3f} + 보너스={bonus:.3f} = {pred+bonus:.3f}")

linucb_alpha_comparison()
# alpha 작으면: 학습된 광고 유리 (활용 중심)
# alpha 크면: 신규 광고도 기회 획득 (탐색 중심)
```
