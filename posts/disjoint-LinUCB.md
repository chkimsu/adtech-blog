밤 9시, 같은 순간에 같은 광고 지면을 본 두 사람이 있다. 한 명은 요 며칠 러닝화 후기만 찾아본 20대다. 다른 한 명은 아기 물티슈를 검색하던 30대 후반이다. 서버는 이 둘에게 정확히 같은 광고 후보 목록을 올렸다.

이 블로그에서 이미 다룬 UCB1은 이 순간 아무 도움이 안 된다. UCB1은 "이 광고가 지금까지 평균 몇 퍼센트 클릭됐나"만 기억한다. 화면 앞에 누가 앉아 있는지는 전혀 모른다. 그래서 20대에게도 30대 후반에게도 똑같은 순위를 그대로 들이민다.

Disjoint LinUCB는 이 문제를 처음으로 제대로 풀어낸 축에 속하는 알고리즘이다. [UCB 알고리즘 패밀리](post.html?id=ucb-family)가 큰 지도를 그렸다. UCB1에서 LinUCB로 왜 넘어가야 하는지가 그 지도의 내용이다. 이 글은 그 지도의 한 점, Disjoint LinUCB 하나만 끝까지 해부한다. 수식 한 줄 한 줄이 무엇을 세는지, 그 수식이 코드로 어떻게 도는지, 실무에 올리면 뭘 조심해야 하는지 순서대로 본다.

> 한 줄 요약: Disjoint LinUCB는 광고(arm)마다 계수 벡터를 **따로** 학습한다. 그래서 같은 사람이라도 광고에 따라 완전히 다른 점수를 매긴다. 그런데 이 "따로"라는 한 단어가 알고리즘의 장점과 약점을 동시에 만든다.

---

## 1. "Disjoint"라는 이름이 뜻하는 것

**Disjoint는 "arm(광고)마다 계수 벡터를 따로 갖고, 서로 절대 들여다보지 않는다"는 뜻이다. 이 한 단어가 알고리즘의 성격을 전부 결정한다.**

광고마다 자기만의 노트를 한 권씩 들고 있다고 생각하자. "스포츠 용품" 광고 담당 노트에는 그 광고를 본 사람의 특징과 클릭 여부만 적힌다. "육아 용품" 광고 담당 노트는 완전히 다른 노트다. 두 노트는 같은 서랍에 있어도 서로 펼쳐보지 않는다. 스포츠 광고가 클릭을 100번 받아도 육아 광고의 노트는 한 줄도 늘지 않는다.

수식으로 옮기면 이렇다. 광고 $a$마다 계수 벡터 $\theta_a$가 따로 있다. 그걸 계산하는 데 쓰는 행렬 $A_a$와 벡터 $b_a$도 각자 따로 있다. 광고가 4개면 $\theta$도 $A$도 $b$도 각 4벌씩 관리된다. 어느 한 광고의 데이터가 다른 광고의 $\theta$ 계산에 단 한 번도 끼어들지 않는다.

이 "따로"가 장점이 되는 지점이 있다. 스포츠 용품과 육아 용품은 애초에 잘 먹히는 유저층이 다르다. 두 광고의 데이터를 억지로 섞으면 오히려 서로의 신호를 흐린다. Disjoint는 이 오염을 원천 차단한다. 대신 대가도 있다. 광고마다 데이터를 처음부터 따로 모아야 한다. 그래서 신규 광고는 노트가 텅 빈 채로 출발한다. 이 콜드스타트 문제는 §7에서 다시 다룬다.

이 대가를 줄이려는 시도가 광고끼리 지식 일부를 공유하는 Hybrid LinUCB다. 그 구조와 disjoint의 차이는 이미 [UCB 알고리즘 패밀리](post.html?id=ucb-family)가 다뤘다. 이 글은 순수 disjoint 버전 하나에만 집중한다.

---

## 2. 가데이터로 먼저 보기 — 같은 컨텍스트, 갈라지는 두 arm

**유저 정보 3개짜리 벡터 하나를 두 arm에 각각 넣으면, 두 arm은 완전히 다른 점수를 내놓는다. 그 차이는 오직 각 arm이 따로 쌓아온 학습 데이터에서 나온다.**

먼저 컨텍스트 벡터부터 정하자. 이 글에서는 세 피처만 쓴다. 연령대 점수는 0에 가까울수록 20대, 1에 가까울수록 40대 이상이다. 관심사 점수는 스포츠에 관심이 많을수록 1에 가깝다. 저녁 시간대 여부는 저녁이면 1, 아니면 0이다. 이 세 숫자를 나란히 묶은 게 컨텍스트 벡터 $x$다.

지금까지 "스포츠 용품"과 "육아 용품" 두 arm에 이런 로그가 쌓였다고 하자.

| 요청 | 연령대 점수 | 관심사 점수 | 저녁 | 노출된 arm | 클릭 |
|---|---|---|---|---|---|
| 1 | 0.20 | 0.90 | 0 | 스포츠 | O |
| 2 | 0.30 | 0.80 | 1 | 스포츠 | O |
| 3 | 0.20 | 0.20 | 1 | 스포츠 | X |
| 4 | 0.40 | 0.70 | 0 | 스포츠 | O |
| 5 | 0.80 | 0.20 | 1 | 육아 | O |
| 6 | 0.90 | 0.10 | 0 | 육아 | O |
| 7 | 0.70 | 0.30 | 1 | 육아 | X |
| 8 | 0.85 | 0.15 | 0 | 육아 | O |

스포츠 arm은 관심사 점수가 높을 때 클릭이 몰렸다(1·2·4번). 관심사 점수가 낮았던 3번만 클릭이 없었다. 육아 arm은 반대로 연령대 점수가 높을 때 클릭이 몰렸다(5·6·8번). 이 로그만으로 두 arm은 §3의 공식을 따라 각자의 계수 $\theta$를 학습한다. 계산 과정은 §4에서 코드로 그대로 보인다.

| arm | $\theta$ (연령대, 관심사, 저녁) |
|---|---|
| 스포츠 | (0.2545, 0.7257, 0.0490) |
| 육아 | (0.6988, 0.0440, -0.0234) |

숫자만 봐도 성격이 또렷하다. 스포츠 arm은 관심사 항(0.7257)이 압도적으로 크다. 육아 arm은 연령대 항(0.6988)이 압도적으로 크다. 각 arm이 자기 노트에서 배운 걸 그대로 계수에 새긴 것이다.

이제 새 요청이 왔다고 하자. 연령대 0.25, 관심사 0.50, 저녁 시간대라면 $x=(0.25,\ 0.50,\ 1)$이다. 두 arm에 그대로 곱해 예측 항($x^T\theta$)만 먼저 비교해 보자.

| arm | 예측 점수 | 탐색 보너스 ($\alpha=1$) | 최종 UCB |
|---|---|---|---|
| 스포츠 | 0.4755 | 0.5881 | **1.0636** |
| 육아 | 0.1733 | 0.6935 | 0.8669 |

예측만 보면 스포츠가 육아보다 거의 3배 높다(0.4755 대 0.1733). 관심사 점수가 중간(0.5)만 돼도 스포츠 arm의 큰 관심사 계수가 그대로 살아나기 때문이다. 이번엔 반대 성향의 유저를 넣어 보자. 연령대 0.85, 관심사 0.15, 낮 시간대라면 $x=(0.85,\ 0.15,\ 0)$이다.

| arm | 예측 점수 | 탐색 보너스 ($\alpha=1$) | 최종 UCB |
|---|---|---|---|
| 스포츠 | 0.3252 | 0.7771 | 1.1023 |
| 육아 | 0.6006 | 0.5006 | 1.1012 |

이번엔 예측만 보면 육아가 스포츠를 거의 2배 앞선다(0.6006 대 0.3252). 그런데 탐색 보너스까지 더한 최종 UCB 점수는 1.1023 대 1.1012로 사실상 동점이다. 스포츠 arm의 보너스(0.7771)가 예측의 열세를 거의 다 메웠기 때문이다. "이 방향은 아직 잘 모른다"는 값이 "예측이 낮다"는 불리함을 뒤집을 수 있다는 뜻이다. 이 보너스가 정확히 무엇을 재는 값인지는 §3에서 뜯어본다.

---

## 3. 수식 해부 — $A$·$b$·$\theta$·신뢰상한이 재는 것

**네 기호는 각각 다른 질문에 답한다. 얼마나 봤나, 어느 방향에 보상이 있었나, 그래서 추정치는 뭔가, 그 추정을 얼마나 믿어도 되나.**

첫 번째 질문은 $A_a$가 답한다.

$$A_a = I_d + \sum_{\tau:\,a_\tau = a} x_\tau x_\tau^T$$

$A_a$가 세는 것은 "이 arm이 지금까지 어떤 방향의 컨텍스트를 얼마나 자주 봤는가"다. 항등행렬 $I_d$는 안전장치다. 데이터가 하나도 없어도 역행렬이 항상 존재하게 만드는 최소한의 보험이다. 나머지 항은 매 라운드 컨텍스트 벡터 자신과의 외적을 계속 쌓아 올린다. §2에서 스포츠 arm의 대각선 값이 1.33·2.98·3.0으로 나온 이유가 이거다. 대각선 값이 클수록 그 피처 방향을 많이 관측했다는 뜻이다.

두 번째 질문은 $b_a$가 답한다.

$$b_a = \sum_{\tau:\,a_\tau=a} r_\tau\, x_\tau$$

$b_a$는 "그 관측 중 실제로 보상이 나온 방향이 어디였는지"를 더한 값이다. 클릭이 없던 라운드는 $r_\tau=0$이라 $b_a$엔 아무것도 더해지지 않는다. 그래도 $A_a$에는 여전히 더해진다. 안 봤다는 게 아니라 봤는데 클릭이 없었다는 사실 자체는 기록해야 하기 때문이다. 그래서 $b_a$는 "본 것 전체"가 아니라 "본 것 중 보상이 있던 방향"만 가중해서 쌓은 합이다. §2 표에서 스포츠 arm의 $b$는 (0.9, 2.4, 1.0)이다.

세 번째, $\theta_a$는 앞의 두 답을 하나로 합친다.

$$\theta_a = A_a^{-1} b_a$$

"이 방향에 보상이 몰려 있었다"는 정보를 $A_a^{-1}$로 눌러 만든 계수가 $\theta_a$다. 데이터를 조금 본 방향은 $A_a$가 작아 이 계산의 효과가 크다. 많이 본 방향은 $A_a$가 커서 효과가 작다. 이 형태는 능선회귀(ridge regression)의 정규방정식과 정확히 같다. §2 표의 $\theta$ 값이 바로 이 계산의 결과다.

네 번째, 이 글에서 가장 중요한 직관이 신뢰상한 항에 있다.

$$\mathrm{UCB}_a(x) = x^T\theta_a + \alpha\sqrt{x^T A_a^{-1} x}$$

첫 항 $x^T\theta_a$는 지금까지 배운 계수로 계산한 예상 보상이다. §2 표의 "예측 점수" 열이 이 값이다. 두 번째 항 $\sqrt{x^T A_a^{-1} x}$가 진짜 핵심이다. 이 값은 "지금 이 방향으로 우리가 얼마나 안 봤는가"를 잰다. $A_a$가 어떤 방향을 많이 관측했다면 그 방향에서 $A_a^{-1}$는 작아진다. 그 방향과 비슷한 $x$를 넣으면 이 제곱근 값도 작아진다. 반대로 한 번도 안 본 방향의 $x$를 넣으면 이 값이 커진다. $\alpha$는 "안 본 정도"에 얼마나 가산점을 얹을지 정하는 손잡이다. §6에서 이 손잡이를 직접 돌려 본다.

---

## 4. 파이썬 구현 — 행렬 역행렬도 직접 짠다

**Disjoint LinUCB는 표준 라이브러리만으로 50줄 안쪽에 다 들어간다. 역행렬조차 가우스-조던 소거법 하나면 numpy 없이 짤 수 있다.**

컨텍스트가 3차원이면 $A_a$는 3×3 행렬이다. 이 정도 크기는 가우스-조던 소거법으로 역행렬을 직접 구해도 코드가 짧다. 원리는 단순하다. 원래 행렬 옆에 항등행렬을 나란히 붙인다. 왼쪽을 항등행렬로 만드는 행 연산을 오른쪽에도 그대로 적용한다. 그러면 오른쪽이 역행렬이 된다. 아래 `mat_inv` 함수가 이 과정을 그대로 코드로 옮긴 것이다.

나머지는 벡터 연산 몇 개뿐이다. 내적(`dot`)과 행렬-벡터 곱(`matvec`), 신뢰상한에 쓰이는 이차형식 $x^TA^{-1}x$(`quad`)까지 합쳐도 열 줄이 안 된다. 이 도구들 위에 `DisjointLinUCB` 클래스를 얹으면 §2의 가데이터가 그대로 재현된다.

```python
import math

def mat_inv(A):
    """가우스-조던 소거법으로 n x n 역행렬을 구한다. numpy 없이 리스트만으로."""
    n = len(A)
    aug = [row[:] + [1.0 if i == j else 0.0 for j in range(n)] for i, row in enumerate(A)]
    for i in range(n):
        pivot = aug[i][i]
        aug[i] = [v / pivot for v in aug[i]]          # 피벗 행을 1로 정규화
        for k in range(n):
            if k != i:
                factor = aug[k][i]
                aug[k] = [v - factor * w for v, w in zip(aug[k], aug[i])]  # 다른 행에서 소거
    return [row[n:] for row in aug]                    # 오른쪽 절반이 역행렬

def dot(u, v):
    return sum(ui * vi for ui, vi in zip(u, v))

def matvec(M, v):
    return [dot(row, v) for row in M]

def quad(M, x):                                        # x^T M x, 신뢰상한에 쓰는 이차형식
    return dot(x, matvec(M, x))

class DisjointLinUCB:
    """arm마다 A(공분산 누적)·b(보상 가중합)를 따로 갖는다 — 이름 그대로 'disjoint'."""
    def __init__(self, d, alpha):
        self.d, self.alpha = d, alpha
        self.A, self.b = {}, {}

    def _ensure(self, arm):
        if arm not in self.A:
            self.A[arm] = [[1.0 if i == j else 0.0 for j in range(self.d)] for i in range(self.d)]
            self.b[arm] = [0.0] * self.d

    def score(self, arm, x):
        self._ensure(arm)
        A_inv = mat_inv(self.A[arm])
        theta = matvec(A_inv, self.b[arm])
        pred = dot(theta, x)
        bonus = self.alpha * math.sqrt(quad(A_inv, x))
        return pred, bonus, pred + bonus

    def update(self, arm, x, reward):
        self._ensure(arm)
        for i in range(self.d):
            for j in range(self.d):
                self.A[arm][i][j] += x[i] * x[j]
            self.b[arm][i] += reward * x[i]

# 학습 로그 — 유저 컨텍스트(연령대, 관심사, 저녁여부)와 노출된 arm, 클릭여부
log = [
    (0.20, 0.90, 0, "스포츠", 1), (0.30, 0.80, 1, "스포츠", 1),
    (0.20, 0.20, 1, "스포츠", 0), (0.40, 0.70, 0, "스포츠", 1),
    (0.80, 0.20, 1, "육아",   1), (0.90, 0.10, 0, "육아",   1),
    (0.70, 0.30, 1, "육아",   0), (0.85, 0.15, 0, "육아",   1),
]
model = DisjointLinUCB(d=3, alpha=1.0)
for age, interest, evening, arm, click in log:
    model.update(arm, [age, interest, evening], click)

for arm in ("스포츠", "육아"):
    theta = matvec(mat_inv(model.A[arm]), model.b[arm])
    print(f"theta[{arm}] = {[round(v, 4) for v in theta]}")

print()
for x in ([0.25, 0.50, 1], [0.85, 0.15, 0]):
    print(f"x={x}")
    for arm in ("스포츠", "육아"):
        pred, bonus, ucb = model.score(arm, x)
        print(f"  {arm}: 예측={pred:.4f} + 보너스={bonus:.4f} = UCB {ucb:.4f}")

# 출력:
# theta[스포츠] = [0.2545, 0.7257, 0.049]
# theta[육아] = [0.6988, 0.044, -0.0234]
#
# x=[0.25, 0.5, 1]
#   스포츠: 예측=0.4755 + 보너스=0.5881 = UCB 1.0636
#   육아: 예측=0.1733 + 보너스=0.6935 = UCB 0.8669
# x=[0.85, 0.15, 0]
#   스포츠: 예측=0.3252 + 보너스=0.7771 = UCB 1.1023
#   육아: 예측=0.6006 + 보너스=0.5006 = UCB 1.1012
```

이 코드가 §2 표의 모든 숫자를 그대로 만들어 낸다. `_ensure`가 처음 보는 arm에는 $A=I$, $b=0$에서 시작하게 만드는 부분이다. 이게 콜드스타트의 코드적 정의다. 새 arm은 항상 이 초기 상태에서 출발한다. `update`의 이중 for문 두 개가 각각 $A_a$와 $b_a$를 누적하는 부분이다. `score`가 §3의 신뢰상한 공식을 그대로 계산한다.

---

## 5. 실험 — UCB1과 비교하고, 알파를 흔들어보기

**같은 클래스를 800번 돌려보면 두 가지가 드러난다. 컨텍스트를 쓰는 것 자체가 얼마나 이득인지, 그리고 탐색 강도 $\alpha$에 따라 그 이득이 얼마나 달라지는지.**

비교 대상은 컨텍스트를 아예 무시하는 UCB1이다. UCB1은 arm마다 "관측 평균 + 시도횟수 보너스"만 계산한다. 매 라운드 어떤 유저가 왔는지는 보지 않는다. 그 arm이 지금까지 전체 평균 몇 번 클릭됐는지만 본다. 반면 Disjoint LinUCB는 매 라운드 컨텍스트를 보고 arm마다 다른 점수를 계산한다.

진짜 클릭 확률은 스포츠 arm이 관심사 점수에, 육아 arm이 연령대 점수에 비례하도록 정해 뒀다. 두 알고리즘 모두 이 진짜 값은 모른 채로 시작한다. 대조군 삼아 컨텍스트와 거의 무관한 "가전" arm도 하나 추가했다. 같은 800번의 요청, 같은 시드로 두 알고리즘을 각각 돌린 결과가 아래다.

```python
import random
import math

def mat_inv(A):
    n = len(A)
    aug = [row[:] + [1.0 if i == j else 0.0 for j in range(n)] for i, row in enumerate(A)]
    for i in range(n):
        pivot = aug[i][i]
        aug[i] = [v / pivot for v in aug[i]]
        for k in range(n):
            if k != i:
                factor = aug[k][i]
                aug[k] = [v - factor * w for v, w in zip(aug[k], aug[i])]
    return [row[n:] for row in aug]

def dot(u, v):
    return sum(ui * vi for ui, vi in zip(u, v))

def matvec(M, v):
    return [dot(row, v) for row in M]

ARMS = ["스포츠", "육아", "가전"]

def true_ctr(arm, x):                     # 알고리즘은 모르는 '진짜' 클릭 확률
    age, interest, evening = x
    if arm == "스포츠":
        p = 0.03 + 0.30 * interest - 0.05 * age
    elif arm == "육아":
        p = 0.03 + 0.30 * age - 0.05 * interest
    else:                                  # 가전 — 컨텍스트와 거의 무관한 대조군
        p = 0.08
    return min(0.4, max(0.01, p))

class DisjointLinUCB:
    def __init__(self, d, alpha):
        self.d, self.alpha = d, alpha
        self.A = {a: [[1.0 if i == j else 0.0 for j in range(d)] for i in range(d)] for a in ARMS}
        self.b = {a: [0.0] * d for a in ARMS}
    def choose(self, x):
        def s(a):
            A_inv = mat_inv(self.A[a])
            pred = dot(matvec(A_inv, self.b[a]), x)
            bonus = self.alpha * math.sqrt(dot(x, matvec(A_inv, x)))
            return pred + bonus
        return max(ARMS, key=s)
    def update(self, arm, x, r):
        for i in range(self.d):
            for j in range(self.d):
                self.A[arm][i][j] += x[i] * x[j]
            self.b[arm][i] += r * x[i]

class UCB1ContextBlind:                    # 컨텍스트를 아예 안 보는 대조 알고리즘
    def __init__(self):
        self.counts = {a: 0 for a in ARMS}
        self.sums = {a: 0 for a in ARMS}
        self.t = 0
    def choose(self, x):
        self.t += 1
        unseen = [a for a in ARMS if self.counts[a] == 0]
        if unseen:
            return unseen[0]
        return max(ARMS, key=lambda a: self.sums[a] / self.counts[a]
                   + math.sqrt(2 * math.log(self.t) / self.counts[a]))
    def update(self, arm, x, r):
        self.counts[arm] += 1
        self.sums[arm] += r

def run(policy, rounds, seed):
    random.seed(seed)
    total, picks = 0, {a: 0 for a in ARMS}
    for _ in range(rounds):
        x = [random.random(), random.random(), random.choice([0, 1])]
        arm = policy.choose(x)
        reward = 1 if random.random() < true_ctr(arm, x) else 0
        policy.update(arm, x, reward)
        total += reward
        picks[arm] += 1
    return total, picks

ROUNDS, SEED = 800, 2026

lin_total, lin_picks = run(DisjointLinUCB(d=3, alpha=1.0), ROUNDS, SEED)
ucb_total, ucb_picks = run(UCB1ContextBlind(), ROUNDS, SEED)
print(f"LinUCB(a=1.0)  누적클릭 {lin_total:3d}  {lin_picks}")
print(f"UCB1(무맥락)    누적클릭 {ucb_total:3d}  {ucb_picks}")
print(f"LinUCB가 {lin_total - ucb_total}건 더 획득 ({(lin_total/ucb_total - 1)*100:.1f}% 더)")

print()
for alpha in (0.1, 1.0, 3.0):
    total, picks = run(DisjointLinUCB(d=3, alpha=alpha), ROUNDS, SEED)
    print(f"alpha={alpha:<4}  누적클릭 {total:3d}  {picks}")

# 출력:
# LinUCB(a=1.0)  누적클릭 172  {'스포츠': 388, '육아': 322, '가전': 90}
# UCB1(무맥락)    누적클릭 124  {'스포츠': 250, '육아': 383, '가전': 167}
# LinUCB가 48건 더 획득 (38.7% 더)
#
# alpha=0.1   누적클릭 137  {'스포츠': 6, '육아': 646, '가전': 148}
# alpha=1.0   누적클릭 172  {'스포츠': 388, '육아': 322, '가전': 90}
# alpha=3.0   누적클릭 154  {'스포츠': 283, '육아': 342, '가전': 175}
```

LinUCB가 UCB1보다 48건 더 많이 클릭했다. 38.7% 더 번 셈이다. 이유는 각 arm의 선택 횟수에 있다. UCB1은 스포츠(250)와 육아(383)를 거의 구분하지 못했다. 컨텍스트를 못 보니 두 arm의 전체 평균 클릭률이 비슷하게 보였기 때문이다. LinUCB는 매 라운드 관심사 점수가 높으면 스포츠를, 연령대 점수가 높으면 육아를 골라 훨씬 유리한 조합으로 몰아줬다.

---

## 6. 알파(탐색 강도)를 흔들면 생기는 일

**같은 800번인데 $\alpha$만 0.1 → 1.0 → 3.0으로 바꾸면 결과가 뒤집힌다. 낮아도 문제, 높아도 문제, 그 사이 어딘가가 최선이다.**

§5 코드의 마지막 블록이 그 결과다. $\alpha=0.1$일 때는 스포츠 arm을 겨우 6번밖에 못 골랐다. 왜 이런 일이 생겼는지는 알고리즘의 초기 상태를 보면 안다. 데이터가 하나도 없을 때는 모든 arm의 $A$가 똑같은 항등행렬이다. 그래서 예측도 보너스도 arm마다 차이가 거의 없다. 이 상태에서 탐색 보너스가 작으면 아주 작은 우연 하나가 그대로 굳어져 버린다. 이번 시드에서는 그 우연이 육아 arm 쪽으로 쏠렸다. 그 뒤로도 낮은 $\alpha$는 스포츠 arm을 다시 찔러볼 동기를 거의 주지 않았다.

$\alpha=3.0$일 때는 반대 방향으로 문제가 생겼다. 가전 arm은 클릭률이 대체로 낮고 컨텍스트와도 무관한 대조군이다. 그런데 이 arm을 175번이나 골랐다. 탐색 보너스가 너무 크다 보니, 이미 잘 아는 방향보다 안 본 방향에 계속 가산점을 몰아준 것이다. 그 결과 누적 클릭이 154건으로, $\alpha=1.0$일 때(172건)보다 오히려 낮아졌다.

$\alpha=1.0$이 이 시뮬레이션에서는 가장 균형 잡힌 값이었다. 스포츠(388)와 육아(322) 두 arm 모두 활발히 골랐다. 가전(90)은 적당히만 찔러봤다. 다만 이 정확한 숫자는 이 데이터, 이 시드에서만 유효하다. 실무에서 $\alpha$는 데이터가 쌓이는 속도, 광고 개수, 트래픽 크기에 따라 A/B 테스트로 다시 잡아야 하는 값이다.

아래 데모에서 $\alpha$ 슬라이더를 직접 움직여 보자. 값이 바뀔 때 예측 막대와 보너스 막대의 비율이 실시간으로 변하는 걸 눈으로 볼 수 있다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-linucb.html?embed=1" height="560" loading="lazy" title="LinUCB 미니 데모"></iframe>
<a class="demo-embed-open" href="demo-linucb.html" target="_blank" rel="noopener">↗ 전체 데모로 열기</a>
</div>

---

## 7. 실무에서 조심할 것 — 차원 비용·콜드스타트·피처 스케일

**행렬 연산이라는 이름값을 하는 순간이 셋 있다. 피처가 늘어날 때, arm이 자주 바뀔 때, 피처 스케일이 다를 때다.**

첫째는 차원이 커질 때의 계산 비용이다. 가우스-조던 소거법으로 $d \times d$ 행렬을 뒤집는 데는 대략 $O(d^3)$만큼의 연산이 든다. 피처를 3개만 쓰면 문제없다. 하지만 실무에서는 유저 세그먼트·지면·소재 피처를 합쳐 수백 차원을 쓰는 일이 흔하다. 요청마다 이 역행렬을 처음부터 다시 구하면, 트래픽이 조금만 늘어도 서빙 지연을 감당하기 어렵다. 그래서 실서비스는 역행렬을 매번 새로 구하지 않는다. 이전 역행렬에서 바로 갱신하는 셔먼-모리슨(Sherman-Morrison) 공식을 쓴다. 원리는 아래 접이 블록에서 다룬다.

:::deep 더 깊이 — Sherman-Morrison으로 역행렬을 매번 새로 구하지 않는 법
매 라운드 $A_a$에 더해지는 항은 $xx^T$ 하나뿐이다. 이렇게 행렬에 벡터 하나의 외적만 더해졌을 때, 새 역행렬을 이전 역행렬로부터 바로 계산하는 공식이 있다.

$$(A + xx^T)^{-1} = A^{-1} - \frac{A^{-1}xx^TA^{-1}}{1 + x^TA^{-1}x}$$

오른쪽 항은 전부 이미 갖고 있는 $A^{-1}$와 새로 들어온 $x$만으로 계산된다. $A^{-1}x$는 벡터-행렬 곱이라 $O(d^2)$다. 나머지도 벡터 몇 개를 곱하고 더하는 수준이라 전체가 $O(d^2)$에 끝난다. 가우스-조던 소거법으로 처음부터 다시 구하는 $O(d^3)$보다, 차원이 클수록 압도적으로 싸다.

아래 코드는 항등행렬에서 시작해 5번 갱신한다. 매번 "처음부터 다시 구한 역행렬"과 "Sherman-Morrison으로 갱신한 역행렬"을 나란히 비교한다.

```python
import random

def mat_inv(A):
    n = len(A)
    aug = [row[:] + [1.0 if i == j else 0.0 for j in range(n)] for i, row in enumerate(A)]
    for i in range(n):
        pivot = aug[i][i]
        aug[i] = [v / pivot for v in aug[i]]
        for k in range(n):
            if k != i:
                factor = aug[k][i]
                aug[k] = [v - factor * w for v, w in zip(aug[k], aug[i])]
    return [row[n:] for row in aug]

def dot(u, v):
    return sum(ui * vi for ui, vi in zip(u, v))

def matvec(M, v):
    return [dot(row, v) for row in M]

def sherman_morrison_update(A_inv, x):
    """(A + xx^T)^-1 를 O(d^2)로 갱신 — 전체 역행렬 재계산 없이."""
    Ax = matvec(A_inv, x)
    denom = 1.0 + dot(x, Ax)
    d = len(x)
    return [[A_inv[i][j] - (Ax[i] * Ax[j]) / denom for j in range(d)] for i in range(d)]

random.seed(3)
d = 3
A = [[1.0 if i == j else 0.0 for j in range(d)] for i in range(d)]
A_inv_sm = mat_inv(A)                    # 시작은 둘 다 항등행렬의 역행렬(자기 자신)

for step in range(1, 6):
    x = [random.uniform(-1, 1) for _ in range(d)]
    for i in range(d):                   # A를 직접 갱신
        for j in range(d):
            A[i][j] += x[i] * x[j]
    A_inv_direct = mat_inv(A)            # 방법 1: 매번 처음부터 재계산
    A_inv_sm = sherman_morrison_update(A_inv_sm, x)   # 방법 2: 이전 값에서 갱신

    diff = max(abs(A_inv_direct[i][j] - A_inv_sm[i][j]) for i in range(d) for j in range(d))
    print(f"갱신 {step}회차 — 두 방식의 최대 오차: {diff:.2e}")

# 출력:
# 갱신 1회차 — 두 방식의 최대 오차: 1.11e-16
# 갱신 2회차 — 두 방식의 최대 오차: 1.11e-16
# 갱신 3회차 — 두 방식의 최대 오차: 2.22e-16
# 갱신 4회차 — 두 방식의 최대 오차: 4.16e-17
# 갱신 5회차 — 두 방식의 최대 오차: 1.11e-16
```

오차는 전부 $10^{-16}$대다. 부동소수점 반올림 오차 수준이라는 뜻이다. 두 방식이 수학적으로 완전히 같다는 걸 확인해 준다. 실서비스에서는 arm 하나가 클릭 데이터를 받을 때마다 이 갱신 한 번만 하면 된다. 굳이 `mat_inv`를 다시 부를 필요가 없다.
:::

둘째는 arm이 자주 바뀌는 환경에서의 콜드스타트다. §4의 `_ensure` 메서드가 보여줬듯, 처음 보는 arm은 항상 $A=I$, $b=0$에서 시작한다. 소재가 하루에도 수십 개씩 새로 올라오는 광고판이라면, 새 arm은 예측 항이 0이라 사실상 탐색 보너스만으로 순위가 매겨진다. 이 상태 자체가 나쁜 건 아니다. 아직 모르니 기회를 주는 게 맞는 동작이다. 문제는 그 arm이 실제로 나쁜 광고여도, 데이터가 쌓이기 전까지는 계속 경쟁에 낄 자격을 얻는다는 점이다. arm 수명 자체가 짧은 환경(§9)에서는 이 초기 탐색 비용을 회수할 시간조차 없을 수 있다. Disjoint 구조로는 이 문제를 근본적으로 풀 수 없다. 광고끼리 지식을 일부 공유하는 Hybrid LinUCB로 넘어가야 완화된다.

셋째는 피처 스케일이다. 이 글의 예시는 세 피처 모두 0에서 1 사이라 문제가 없었다. 그런데 실무에서 피처 하나가 "월 소득(원 단위, 수백만)"이고 다른 하나가 "성별(0 또는 1)"이라면 얘기가 다르다. 신뢰상한 $\sqrt{x^TA_a^{-1}x}$는 $x$의 크기에 그대로 비례해서 커진다. 스케일이 큰 피처가 있으면 그 방향의 불확실성이 실제보다 훨씬 크게 계산된다. 그러면 알고리즘은 그 피처가 큰 값을 가진 요청에 부당하게 큰 탐색 보너스를 준다. 그래서 LinUCB에 넣는 피처는 반드시 정규화를 거쳐야 한다. 0~1 스케일링이나 표준화가 흔한 방법이다. 이 작업을 건너뛰면 신뢰구간 자체가 피처 단위에 휘둘려 의미를 잃는다.

---

## 8. 담장 안에서 쓸 때 [무대: 닫힌 생태계]

**로그인 기반 서비스는 컨텍스트가 이미 넉넉하고, 피드백도 거의 항상 온다. Disjoint LinUCB가 가장 편하게 돌아가는 무대다.**

네이버·밴드처럼 로그인이 걸린 서비스는 유저의 연령대·관심사·최근 행동 이력을 이미 1st-party 로그로 갖고 있다. §2에서 손으로 만든 연령대·관심사·시간대 같은 피처를, 실제로는 훨씬 풍부하게 채울 수 있다는 뜻이다. 컨텍스트가 풍부할수록 $\theta_a$가 더 세밀하게 학습된다. 같은 유저라도 상황에 따라 다른 arm이 뜨는 개인화가 살아난다.

피드백도 안정적이다. 노출을 플랫폼이 직접 배정하니 클릭 여부가 항상 관측된다. 그래서 $A_a$와 $b_a$가 요청마다 빠짐없이 갱신된다. §7에서 지적한 콜드스타트도 여기서는 상대적으로 덜 아프다. 신규 소재라도 노출만 계속 배정되면 데이터가 꾸준히 쌓이기 때문이다.

다만 이 무대에서도 §7의 피처 스케일 문제는 그대로 남는다. 로그인 기반이라 피처 후보가 많아질수록, 단위가 서로 다른 피처를 무심코 섞어 넣기 쉽다. 새 피처를 추가할 때마다 정규화를 거쳤는지 점검하는 습관이 필요하다.

---

## 9. 열린 경매에서 쓸 때 [무대: 열린 RTB]

**컨텍스트는 매 요청마다 오지만, 패찰하면 그 컨텍스트로 아무것도 배우지 못한다. arm의 수명도 짧다.**

DSP가 입찰 요청을 받을 때마다 유저·지면 정보가 담긴 컨텍스트는 매번 들어온다. 문제는 그다음이다. 입찰에서 져서 패찰하면 노출도 클릭도 생기지 않는다. $A_a$와 $b_a$를 갱신할 재료 자체가 없다는 뜻이다. 닫힌 생태계는 노출을 직접 배정해 결과가 항상 관측된다. 반면 여기서는 이겨야만 비로소 학습이 시작된다. 시도는 했는데 결과가 통째로 사라지는 셈이다.

arm의 수명도 짧다. 캠페인과 소재가 며칠 단위로 교체되는 경우가 흔하다. $A_a$가 항등행렬에서 벗어나 쓸 만한 $\theta_a$를 갖추기도 전에 그 arm 자체가 사라진다. §7에서 다룬 콜드스타트가 닫힌 생태계에서는 "느리지만 결국 해결되는 문제"였다. 여기서는 "해결되기 전에 arm이 먼저 없어지는 문제"에 가깝다.

그래서 열린 RTB에서는 disjoint 구조를 그대로 쓰기보다 다른 전략이 유리하다. 캠페인 간에 공유 가능한 피처(카테고리·브랜드 같은)를 따로 뽑는 편이다. 이게 Hybrid LinUCB로 넘어가는 유인이 된다. 새 캠페인이 떠도 공유 피처의 학습된 가중치를 즉시 물려받을 수 있기 때문이다. 이 구조는 [UCB 알고리즘 패밀리](post.html?id=ucb-family)에서 다룬다.

---

## 10. 한눈 정리

| 개념 | 뜻 | 이 글에서 본 숫자 | 핵심 |
|---|---|---|---|
| Disjoint | arm마다 계수를 따로 학습, 공유 없음 | θ 스포츠(0.25,0.73,0.05) / 육아(0.70,0.04,-0.02) | 오염은 없지만 arm마다 데이터를 따로 모아야 함 |
| $A_a$ | 이 arm이 어느 방향을 얼마나 관측했나 | 스포츠 대각선 1.33·2.98·3.0 | 누적 공분산, 데이터가 쌓일수록 커짐 |
| $b_a$ | 그 방향 중 보상이 있던 곳의 가중합 | 스포츠 (0.9, 2.4, 1.0) | 클릭 없으면 더해지지 않음 |
| $\theta_a=A_a^{-1}b_a$ | 봤던 만큼만 확신하는 추정 계수 | §2·§4 표 | 능선회귀와 같은 형태 |
| 신뢰상한 | 이 방향으로 얼마나 안 봤는가 | 문맥2: 스포츠 보너스 0.78 vs 육아 0.50 | 예측 열세를 뒤집을 수 있음 |
| LinUCB vs UCB1 | 컨텍스트 사용 여부 | 800회 후 172 대 124건(38.7% 차) | 컨텍스트를 쓰면 같은 트래픽으로 더 번다 |
| $\alpha$(탐색 강도) | 신뢰상한에 곱하는 손잡이 | 0.1→137건, 1.0→172건, 3.0→154건 | 너무 낮아도 너무 높아도 손해 |
| Sherman-Morrison | 역행렬을 갱신만으로 구하는 공식 | 오차 $10^{-16}$대(사실상 동일) | $O(d^3)$ 대신 $O(d^2)$ |

---

## 11. 헷갈리기 쉬운 점

- **Disjoint는 "성능이 나쁘다"는 뜻이 아니다.** arm끼리 데이터를 안 나눈다는 구조적 특징일 뿐이다. arm들의 성격이 서로 확실히 다르면 오히려 이게 더 안전하다.
- **예측 점수가 낮다고 그 arm이 진다는 보장은 없다.** §2의 두 번째 예시처럼, 탐색 보너스가 커서 예측 열세를 뒤집는 경우가 흔하다.
- **$A_a$가 커진다고 좋기만 한 게 아니다.** 데이터가 많이 쌓였다는 뜻일 뿐, 그 데이터로 배운 계수가 정확하다는 보장은 아니다. 피처가 편향되게 쌓였다면 확신만 커지고 방향은 틀릴 수 있다.
- **$\alpha$를 올릴수록 무조건 좋아지지 않는다.** 이 글의 실험에서 $\alpha=3.0$은 $\alpha=1.0$보다 오히려 누적 클릭이 낮았다. 탐색에도 비용이 있다.
- **Disjoint와 Hybrid는 우열 관계가 아니라 다른 선택이다.** arm 수가 적고 안정적이면 disjoint로 충분하다. arm이 자주 바뀌면 Hybrid 쪽 지식 공유가 필요해진다.
- **행렬이 크다고 항상 numpy가 필요한 건 아니다.** 이 글처럼 차원이 몇 안 되면 가우스-조던 소거법 20줄로 충분하다. 다만 차원이 커지면 §7의 Sherman-Morrison처럼 갱신 자체를 최적화해야 한다.

---

## 더 깊이 보기

- 밴딧 알고리즘 전체 지도에서 이 글의 위치 → [멀티암드 밴딧: 어느 광고를 더 보여줄까](post.html?id=mab-summary)
- UCB1과 톰슨 샘플링의 결정적 vs 확률적 차이 → [UCB vs Thompson Sampling](post.html?id=ucb-vs-ts)
- UCB1 → LinUCB → Hybrid로 왜 넘어가는지 큰 그림 → [UCB 알고리즘 패밀리](post.html?id=ucb-family)
- 톰슨 샘플링을 같은 방식으로 컨텍스트까지 확장하면 → [Standard TS vs Linear TS](post.html?id=TS-linTS)
- 탐색-활용 딜레마 자체가 궁금하다면 → [탐색과 활용](post.html?id=exploration-exploitation)
- 알파 슬라이더를 직접 돌려보기 → [LinUCB 인터랙티브 데모](demo-linucb.html)
- 광고 ML 전체 지도에서 이 글의 위치 → [ML 엔지니어 트랙](ml-track.html)
