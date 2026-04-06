# UCB 알고리즘 패밀리: UCB1 vs LinUCB vs Hybrid LinUCB

AdTech에서 "어떤 광고를 보여줄 것인가"를 결정하는 핵심 알고리즘인 UCB(Upper Confidence Bound) 계열을 상세 비교합니다.

---

## 1. UCB1 (기본형)

"과거 평균 성적 + 아직 잘 모르니까 보너스"

### 수식

$$\text{Score}\_{a} = \underbrace{\bar{x}\_{a}}\_{\text{평균 보상}} + \underbrace{\sqrt{\frac{2 \ln t}{n\_{a}}}}\_{\text{탐색 보너스}}$$

- $\bar{x}_a$ : arm $a$의 지금까지의 평균 보상 (예: 평균 CTR)
- $t$ : 전체 라운드 수
- $n_a$ : arm $a$가 선택된 횟수

### 작동 방식

- 광고 A가 1000번 노출되어 CTR 5%가 확인됨 -> 보너스 작음 (이미 잘 알아)
- 광고 B가 3번 노출됨 -> 보너스 큼 (아직 잘 몰라, 기회를 더 줘야 해)
- 매 라운드마다 "평균 + 보너스"가 가장 높은 광고를 선택

### 핵심 특징

- Context-Free: 유저가 누구든 상관없이 광고의 "전체 평균"만 봄
- Deterministic: 같은 상태에서는 항상 같은 광고를 선택 (TS와의 차이)
- 광고별로 저장하는 데이터: 평균 보상($\bar{x}_a$)과 노출 횟수($n_a$) 단 2개

### 한계

20대 남성이든 50대 여성이든 같은 결과. 개인화 불가능.

---

## 2. LinUCB (Disjoint)

"이 유저의 특성을 고려해서, 이 광고의 예상 CTR + 불확실성 보너스"

### 수식

$$\text{Score}\_{a} = \underbrace{x^T \theta\_{a}}\_{\text{개인화 예측}} + \underbrace{\alpha \sqrt{x^T A\_{a}^{-1} x}}\_{\text{개인화 탐색 보너스}}$$

- $x$ : 유저+광고의 Context Vector (예: [나이, 성별, 검색어, 시간대...])
- $\theta_a$ : 광고 $a$가 학습한 Feature 가중치 ($A_a^{-1} b_a$로 계산)
- $A_a$ : 광고 $a$의 경험 행렬 (데이터가 쌓일수록 커짐)
- $A_a^{-1}$ : 불확실성 행렬 (데이터가 쌓일수록 작아짐)

### UCB1과의 결정적 차이

| | UCB1 | LinUCB |
|---|---|---|
| 입력 | 없음 (평균만) | Context Vector $x$ |
| 예측 | 전체 평균 $\bar{x}\_{a}$ | 개인화 예측 $x^T \theta\_{a}$ |
| 보너스 | $\sqrt{\frac{2 \ln t}{n\_{a}}}$ (횟수 기반) | $\alpha \sqrt{x^T A\_{a}^{-1} x}$ (Feature 방향 기반) |
| 저장 | 숫자 2개 | 행렬 $A\_{a}$ ($d \times d$) + 벡터 $b\_{a}$ ($d \times 1$) |

### 작동 방식

- 20대 남성이 "운동화"를 검색 -> Context Vector $x$ = [20대, 남성, 운동화, 오후...]
- 광고 A(나이키): $\theta_A$와 $x$를 내적 -> 예측 CTR 높음
- 광고 B(화장품): $\theta_B$와 $x$를 내적 -> 예측 CTR 낮음
- 같은 광고 B라도 30대 여성이 오면 -> 다른 $x$ -> 예측 CTR 높아질 수 있음

### "Disjoint"의 의미

- 각 광고가 독립적인 $A_a$, $b_a$를 가짐
- 광고 A에서 "20대 남성은 클릭을 잘 한다"는 걸 배워도, 광고 B는 이 사실을 모름
- 신규 광고가 들어오면 $A = I$ (단위행렬)에서 처음부터 시작 -> Cold Start 문제

---

## 3. Hybrid LinUCB

"공통 지식(모든 광고가 공유) + 개별 지식(광고별 고유)을 합쳐서 판단"

### 수식

$$\text{Score}\_{a} = \underbrace{z\_{a}^T \beta}\_{\text{공통 지식}} + \underbrace{x^T \theta\_{a}}\_{\text{개별 지식}} + \text{탐색 보너스}$$

- $z_a$ : 광고 $a$의 Feature (카테고리, 브랜드, 가격대 등)
- $\beta$ : 모든 광고가 공유하는 가중치 (공통 파라미터)
- $x$ : 유저 Context Vector
- $\theta_a$ : 광고 $a$ 고유의 가중치 (개별 파라미터)

### LinUCB(Disjoint)와의 결정적 차이

| | Disjoint LinUCB | Hybrid LinUCB |
|---|---|---|
| 파라미터 | 광고별 $\theta_a$만 | 공통 $\beta$ + 광고별 $\theta_a$ |
| 지식 공유 | 없음 | 있음 ($\beta$를 통해) |
| 신규 광고 | Cold Start (처음부터 학습) | 공통 지식 $\beta$ 활용하여 즉시 추론 |
| 복잡도 | $O(d^2)$ per arm | $O((d+k)^2)$ per arm |

### 핵심 메커니즘 - 지식 전이(Knowledge Transfer)

Disjoint에서는:
- 나이키 운동화 A를 1000번 노출해서 "20대 남성이 잘 클릭한다"를 학습
- 나이키 운동화 B(신상품)가 등록되면 -> 학습 데이터 0 -> 아무것도 모름

Hybrid에서는:
- 나이키 운동화 A의 학습 결과가 공통 파라미터 $\beta$에 반영됨
- $\beta$가 "나이키 브랜드 + 운동화 카테고리 + 20대 남성 = 높은 CTR"이라는 패턴을 학습
- 나이키 운동화 B가 등록되면 -> 광고 Feature $z_B$ = [나이키, 운동화, 신상] -> $z_B^T \beta$로 즉시 합리적 예측 가능

---

## 4. 종합 비교

| 기준 | UCB1 | Disjoint LinUCB | Hybrid LinUCB |
|------|------|-----------------|---------------|
| 개인화 | 없음 | 유저 기반 | 유저+광고 기반 |
| Cold Start | 심각 | 심각 | 해결 |
| 지식 공유 | 없음 | 없음 | 있음 |
| 구현 난이도 | 매우 쉬움 | 행렬 연산 | 행렬 연산 + 공통 파라미터 |
| 저장 공간 | 숫자 2개/arm | $d \times d$ 행렬/arm | $(d+k) \times (d+k)$ 행렬 + 공통 |
| 추천 상황 | 배너 A/B 테스트 | 광고 수 고정, 개인화 필요 | 신규 광고 빈번한 대규모 환경 |

### 선택 기준

- 광고 수가 적고 고정적 (배너 3~5개) -> UCB1
- 유저별 개인화 필요, 광고 수 중간 -> Disjoint LinUCB
- 신규 광고가 매일 수백 개씩 유입되는 환경 (검색 광고, 커머스) -> Hybrid LinUCB

### 테크트리 (진화 경로)

실무에서는 보통 이 순서로 고도화합니다:

1. UCB1 / Basic TS로 시작 (MVP, 로직 검증)
2. Disjoint LinUCB로 개인화 도입 (유저 Feature 활용)
3. Hybrid LinUCB로 신규 광고 대응력 강화 (광고 Feature 공유)
4. Deep Learning 기반 모델 + Exploration Layer (Neural Bandit)
