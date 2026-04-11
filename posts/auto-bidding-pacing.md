광고주가 "CPA $10, 일 예산 $1,000"을 설정하면, DSP는 하루 동안 수십만 번의 입찰 기회를 만납니다. 매번 최적의 입찰가를 결정하되, 하루가 끝나기 전에 예산이 소진되지 않아야 합니다. 이 글은 **Auto-Bidding(자동 입찰)**과 **Budget Pacing(예산 분배)**이 이 문제를 어떻게 푸는지 해부합니다.

> [Bid Shading 포스트](post.html?id=bid-shading-censored)에서는 "한 번의 입찰에서 최적 입찰가 b*를 계산하는 방법"을 다뤘습니다. 이 글은 그 다음 단계 — **수십만 번의 입찰을 하루 예산 안에서 어떻게 배분하는가**를 다룹니다.

---

## 1. Auto-Bidding이 풀어야 할 문제

### 광고주가 원하는 것 vs DSP가 해야 할 것

광고주는 단순한 목표를 설정합니다:

| 광고주 입력 | 예시 |
|-----------|------|
| 캠페인 목표 | CPA $10 (전환당 비용) |
| 일일 예산 | $1,000 |
| 타겟 조건 | 한국, 모바일, 25-44세 |
| 기간 | 30일 |

하지만 DSP 내부에서 이 단순한 목표를 달성하려면, 매 입찰마다 세 가지 질문에 답해야 합니다:

<div class="chart-steps">
  <div style="font-size:0.85rem; font-weight:700; color:var(--text-primary); margin-bottom:12px;">매 입찰(Bid Request)마다 DSP가 답해야 할 3가지 질문</div>
  <div class="chart-step">
    <div class="chart-step-indicator">
      <div class="chart-step-dot pink">1</div>
      <div class="chart-step-line"></div>
    </div>
    <div class="chart-step-content">
      <div class="chart-step-title">이 기회의 가치는 얼마인가? (Valuation)</div>
      <div class="chart-step-desc">V = pCTR &times; pCVR &times; ConvValue. 모델이 예측한 전환 확률 기반의 기대 가치.</div>
      <span class="chart-step-badge pink">pCTR/pCVR 모델 담당</span>
    </div>
  </div>
  <div class="chart-step">
    <div class="chart-step-indicator">
      <div class="chart-step-dot blue">2</div>
      <div class="chart-step-line"></div>
    </div>
    <div class="chart-step-content">
      <div class="chart-step-title">이길 수 있는 최소 가격은? (Bid Shading)</div>
      <div class="chart-step-desc">시장 분포 F(b|x)를 추정하고, Surplus를 극대화하는 b*를 계산.</div>
      <span class="chart-step-badge blue">Bid Shading 모델 담당</span>
    </div>
  </div>
  <div class="chart-step">
    <div class="chart-step-indicator">
      <div class="chart-step-dot green">3</div>
    </div>
    <div class="chart-step-content">
      <div class="chart-step-title">지금 입찰해도 예산이 괜찮은가? (Budget Pacing)</div>
      <div class="chart-step-desc">남은 예산과 남은 시간을 비교하여, 입찰 강도를 조절하거나 입찰을 건너뜀.</div>
      <span class="chart-step-badge green">Budget Pacer 담당 &mdash; 이 글의 핵심</span>
    </div>
  </div>
</div>

질문 1-2는 이전 포스트에서 다뤘습니다. 이 글은 **질문 3: Budget Pacing**에 집중합니다.

### Bid Shading vs Budget Pacing: 스코프가 다르다

Bid Shading과 Budget Pacing은 모두 "입찰 최적화"에 속하지만, **최적화하는 대상과 시간 범위가 근본적으로 다릅니다**:

| 구분 | Bid Shading | Budget Pacing (PID) |
|------|-------------|---------------------|
| **최적화 스코프** | 개별 경매 1건 (미시적) | 하루 전체 입찰 (거시적) |
| **풀고 있는 질문** | "이 경매에서 얼마에 입찰해야 Surplus가 최대인가?" | "지금 입찰해도 하루 예산이 버틸 수 있는가?" |
| **핵심 수식** | $b^* = \arg\max (V - b) \cdot F(b \mid x)$ | $\lambda_{t+1} = \lambda_t + K_p \cdot e_t + K_i \cdot \sum e$ |
| **입력** | 시장 가격 분포 $F(b \mid x)$, True Value $V$ | 남은 예산, 남은 시간, 현재 소비 속도 |
| **출력** | 최적 입찰가 $b^*$ | 입찰 강도 배수 $\lambda$ |
| **없으면 생기는 문제** | 1st Price 경매에서 매번 과다 지불 | 오전에 예산 소진, 오후 최적 시간대 놓침 |

실제 파이프라인에서는 **두 모듈이 직렬로 연결**됩니다:

1. **Bid Shading**이 먼저 개별 경매의 최적 입찰가 $b^*$를 계산
2. **Budget Pacer**가 현재 예산 상황에 따라 배수 $\lambda$를 결정
3. **최종 입찰가** = $b^* \times \lambda$ (예산이 빨리 소진되면 $\lambda < 1$로 억제, 여유가 있으면 $\lambda > 1$로 공격적)

> Bid Shading 없이 Pacing만 있으면 개별 경매에서 과다 지불하고, Pacing 없이 Bid Shading만 있으면 하루 예산 분배가 불균형해집니다. **둘 다 있어야 완전한 입찰 최적화**입니다.

Bid Shading의 상세 메커니즘(Censored Data, 분포 추정, Surplus 최적화)은 [Bid Shading 포스트](post.html?id=bid-shading-censored)에서 다룹니다. 아래부터는 Budget Pacing에 집중합니다.

### 왜 Budget Pacing이 필요한가?

예산 $1,000을 Pacing 없이 사용하면 이런 일이 벌어집니다:

| 시간 | 입찰 기회 | Pacing 없음 | Pacing 적용 |
|------|---------|------------|------------|
| 00:00 - 06:00 | 적음 (새벽) | 기회가 오면 무조건 입찰 | 기회가 오면 적극 입찰 |
| 06:00 - 12:00 | 보통 | 높은 가격에도 입찰 | 적정 가격에 입찰 |
| 12:00 - 14:00 | 많음 (점심) | **예산 소진** | 약간 보수적 입찰 |
| 14:00 - 18:00 | 많음 (최고) | 입찰 불가 (예산 없음) | 정상 입찰 유지 |
| 18:00 - 24:00 | 보통 | 입찰 불가 | 남은 예산 소진 |
| **결과** | | 오전에 예산 소진, **오후 최적 시간대 놓침** | 하루 전체에 걸쳐 균등하게 노출 |

오후 14-18시는 전환율이 가장 높은 시간대인 경우가 많습니다. Pacing 없이 오전에 예산을 다 쓰면, **가장 좋은 기회를 놓치게 됩니다**.

---

## 2. Budget Pacing의 두 가지 접근법

Budget Pacing에는 크게 두 가지 방식이 있습니다:

<div class="chart-cards">
  <div class="chart-card">
    <div class="chart-card-header">
      <div class="chart-card-icon yellow">A</div>
      <div>
        <div class="chart-card-name">Throttling (확률적 참여)</div>
        <div class="chart-card-subtitle">입찰 기회 자체를 필터링</div>
      </div>
    </div>
    <div class="chart-card-body">
      <div class="chart-card-row">
        <span class="chart-card-row-label">원리</span>
        <span class="chart-card-row-value">입찰 참여 확률 p를 조절</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">예시</span>
        <span class="chart-card-row-value">p=0.5이면 50%만 참여</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">장점</span>
        <span class="chart-card-row-value">구현 단순, 계산 비용 낮음</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">단점</span>
        <span class="chart-card-row-value">좋은 기회도 무작위로 버림</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">사용처</span>
        <span class="chart-card-row-value">대규모 트래픽, 빠른 조절</span>
      </div>
    </div>
    <div class="chart-card-tags">
      <span class="chart-card-tag">Random Throttle</span>
      <span class="chart-card-tag">Probabilistic</span>
    </div>
  </div>
  <div class="chart-card" style="grid-column: span 2;">
    <div class="chart-card-header">
      <div class="chart-card-icon green">B</div>
      <div>
        <div class="chart-card-name">Bid Modification (입찰가 조절)</div>
        <div class="chart-card-subtitle">입찰가에 pacing multiplier를 곱함</div>
      </div>
    </div>
    <div class="chart-card-body">
      <div class="chart-card-row">
        <span class="chart-card-row-label">원리</span>
        <span class="chart-card-row-value">b_final = b* &times; &lambda; (pacing multiplier)</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">예시</span>
        <span class="chart-card-row-value">&lambda;=0.8이면 입찰가 20% 하향</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">장점</span>
        <span class="chart-card-row-value">좋은 기회에 여전히 참여, 가치 기반 의사결정 유지</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">단점</span>
        <span class="chart-card-row-value">Win Rate 하락, &lambda; 최적화 필요</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">사용처</span>
        <span class="chart-card-row-value">정교한 예산 관리, 대부분의 프로덕션 DSP</span>
      </div>
    </div>
    <div class="chart-card-tags">
      <span class="chart-card-tag">PID Controller</span>
      <span class="chart-card-tag">Lagrangian</span>
      <span class="chart-card-tag">RL</span>
    </div>
  </div>
</div>

프로덕션에서는 대부분 **Bid Modification**을 사용합니다. 모든 입찰에 참여하되, pacing multiplier $\lambda$로 입찰 강도를 조절하면 좋은 기회를 놓치지 않으면서 예산을 분배할 수 있습니다.

### 최종 입찰가 공식

$$b_{\text{final}} = \underbrace{b^*}_{\text{Bid Shading}} \times \underbrace{\lambda}_{\text{Pacing Multiplier}}$$

- $b^* < V$: Bid Shading이 True Value보다 낮은 최적 입찰가를 계산 (이전 포스트)
- $\lambda \in (0, 1]$: Budget Pacer가 예산 상황에 따라 조절
  - $\lambda = 1.0$: 예산 여유 → 원래 입찰가 유지
  - $\lambda = 0.7$: 예산 부족 → 30% 하향
  - $\lambda = 0.3$: 예산 위기 → 70% 하향 (거의 포기)

---

## 3. PID Controller 기반 Budget Pacing

가장 널리 사용되는 방식은 **PID Controller**입니다. 제어 이론에서 차용한 방법으로, 목표값과 현재값의 차이(오차)를 기반으로 조절합니다.

### 핵심 아이디어

<div class="chart-arch">
  <div class="chart-arch-section">
    <div class="chart-arch-section-header">
      <span class="chart-arch-section-icon">1</span>
      <span class="chart-arch-section-title orange">목표 설정</span>
    </div>
    <div class="chart-arch-grid">
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">이상적 소진율</div>
        <div class="chart-arch-node-desc">target_spend_rate = 일 예산 / 24시간</div>
      </div>
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">예시</div>
        <div class="chart-arch-node-desc">$1,000 / 24h = $41.67/h</div>
      </div>
    </div>
  </div>
  <div class="chart-arch-connector">&#8595;</div>
  <div class="chart-arch-section">
    <div class="chart-arch-section-header">
      <span class="chart-arch-section-icon">2</span>
      <span class="chart-arch-section-title pink">오차 측정 (매 시간 or 매 분)</span>
    </div>
    <div class="chart-arch-grid">
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">error(t)</div>
        <div class="chart-arch-node-desc">= target_spend_rate - actual_spend_rate</div>
      </div>
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">양수: 예산 여유</div>
        <div class="chart-arch-node-desc">&lambda; 올림 (더 적극 입찰)</div>
      </div>
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">음수: 예산 초과</div>
        <div class="chart-arch-node-desc">&lambda; 내림 (보수적 입찰)</div>
      </div>
    </div>
  </div>
  <div class="chart-arch-connector">&#8595;</div>
  <div class="chart-arch-section">
    <div class="chart-arch-section-header">
      <span class="chart-arch-section-icon">3</span>
      <span class="chart-arch-section-title blue">PID 조절</span>
    </div>
    <div class="chart-arch-grid">
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">P (비례)</div>
        <div class="chart-arch-node-desc">현재 오차에 비례하여 조절</div>
      </div>
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">I (적분)</div>
        <div class="chart-arch-node-desc">누적 오차 보정 (장기 편향 제거)</div>
      </div>
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">D (미분)</div>
        <div class="chart-arch-node-desc">오차 변화율 반영 (진동 방지)</div>
      </div>
    </div>
  </div>
  <div class="chart-arch-connector">&#8595;</div>
  <div class="chart-arch-section">
    <div class="chart-arch-section-header">
      <span class="chart-arch-section-icon">4</span>
      <span class="chart-arch-section-title" style="color:#4bc0c0;">출력</span>
    </div>
    <div class="chart-arch-grid">
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">&lambda;(t+1) = clamp(&lambda;(t) + K_p&middot;e + K_i&middot;&Sigma;e + K_d&middot;&Delta;e, 0.1, 1.0)</div>
        <div class="chart-arch-node-desc">다음 구간의 pacing multiplier 결정</div>
      </div>
    </div>
  </div>
</div>

### PID 공식

$$\lambda(t+1) = \text{clamp}\Big(\lambda(t) + K_p \cdot e(t) + K_i \cdot \sum_{\tau=0}^{t} e(\tau) + K_d \cdot \big(e(t) - e(t-1)\big), \; \lambda_{\min}, \; \lambda_{\max}\Big)$$

| 항 | 역할 | 예시 |
|---|------|------|
| $K_p \cdot e(t)$ | **현재 오차** 비례 조절 | 지금 예산을 많이 쓰면 즉시 $\lambda$ 하향 |
| $K_i \cdot \sum e$ | **누적 오차** 보정 | 계속 목표보다 적게 쓰면 서서히 $\lambda$ 상향 |
| $K_d \cdot \Delta e$ | **오차 변화율** 반영 | 급격히 소진율이 변하면 빠르게 대응 |

### 실전 예시: 하루 동안의 Pacing 동작

```text
시간   예산잔여  목표소진  실제소진  error   λ 조절
──────────────────────────────────────────────────────
00:00  $1,000   $41.7/h   $30/h    +$11.7  λ=1.0 → 1.0  (여유, 유지)
06:00  $820     $41.7/h   $55/h    -$13.3  λ=1.0 → 0.82 (초과, 하향)
09:00  $680     $41.7/h   $48/h    -$6.3   λ=0.82→ 0.78 (아직 초과)
12:00  $520     $41.7/h   $40/h    +$1.7   λ=0.78→ 0.80 (거의 목표)
15:00  $360     $41.7/h   $38/h    +$3.7   λ=0.80→ 0.85 (약간 여유)
18:00  $200     $41.7/h   $42/h    -$0.3   λ=0.85→ 0.84 (미세 조정)
21:00  $80      $41.7/h   $40/h    +$1.7   λ=0.84→ 0.86
24:00  $5       -         -        -       하루 종료, 예산 99.5% 소진 ✓
```

**핵심 포인트**: PID Controller는 매 시간(또는 매 분) 오차를 측정하고 $\lambda$를 조절하여, 하루 끝에 예산을 거의 정확히 소진시킵니다.

```python
import numpy as np

def pid_pacing_simulation(budget=1000, hours=24, Kp=0.04, Ki=0.01, Kd=0.02):
    """PID Controller: 하루 예산 Pacing 시뮬레이션"""
    target_rate = budget / hours
    lam, cum_error, prev_error = 1.0, 0.0, 0.0
    remaining = budget

    for t in range(hours):
        # 트래픽 패턴: 낮 시간대 1.2배, 밤 0.8배
        traffic = 1.2 if 6 <= t <= 14 else 0.8
        noise = np.random.normal(0, 5)
        spend = np.clip(target_rate * lam * traffic + noise, 0, remaining)
        remaining -= spend

        # PID 오차 계산 및 λ 업데이트
        error = target_rate - spend
        cum_error += error
        lam += Kp * error + Ki * cum_error + Kd * (error - prev_error)
        lam = np.clip(lam, 0.1, 1.0)
        prev_error = error

        if t % 6 == 0:
            print(f"  t={t:2d}h  잔여=${remaining:6.0f}  λ={lam:.3f}")

    print(f"  최종 소진율: {(budget - remaining) / budget * 100:.1f}%")

np.random.seed(42)
pid_pacing_simulation()
```

---

## 4. Lagrangian 기반 최적화: 이론적 접근

PID가 "경험적 조절"이라면, **Lagrangian Dual** 방식은 수학적으로 최적해를 유도합니다.

### 문제 정의

$$\max_{\{b_i\}} \sum_{i=1}^{N} V_i \cdot \mathbb{1}[\text{win}_i] \quad \text{s.t.} \quad \sum_{i=1}^{N} b_i \cdot \mathbb{1}[\text{win}_i] \leq B$$

- $V_i$: $i$번째 입찰 기회의 True Value
- $b_i$: $i$번째 입찰가
- $B$: 일일 예산

"일 예산 $B$ 안에서, 총 전환 가치를 극대화하라."

### Lagrangian Relaxation

예산 제약을 라그랑주 승수 $\mu$로 완화합니다:

$$\mathcal{L} = \sum_{i=1}^{N} V_i \cdot \mathbb{1}[\text{win}_i] - \mu \cdot \Big(\sum_{i=1}^{N} b_i \cdot \mathbb{1}[\text{win}_i] - B\Big)$$

최적 조건에서 각 입찰의 수정된 가치는:

$$V_i^{\text{adj}} = V_i - \mu \cdot b_i$$

$\mu$가 바로 **예산의 기회비용(shadow price)**입니다:

| $\mu$ 값 | 의미 | 입찰 행동 |
|----------|------|---------|
| $\mu \approx 0$ | 예산 제약이 느슨 | $V_i^{\text{adj}} \approx V_i$ → 적극 입찰 |
| $\mu$ 크다 | 예산 제약이 빡빡 | $V_i^{\text{adj}} \ll V_i$ → 높은 가치만 선별 입찰 |

### PID와 Lagrangian의 관계

실은 PID의 $\lambda$와 Lagrangian의 $\mu$는 같은 역할을 합니다:

$$\lambda = \frac{1}{1 + \mu}$$

- $\mu = 0$ → $\lambda = 1.0$ (예산 여유, 풀 입찰)
- $\mu = 1$ → $\lambda = 0.5$ (예산 부족, 반값 입찰)
- $\mu \to \infty$ → $\lambda \to 0$ (예산 위기, 입찰 포기)

PID는 $\lambda$를 경험적으로 조절하고, Lagrangian은 $\mu$를 수학적으로 풀지만, **결과적으로 같은 곳에 수렴합니다**.

```python
import numpy as np

def lagrangian_dual_update(budget=1000, n_rounds=100, lr=0.05):
    """Lagrangian Dual: μ(shadow price) 업데이트로 λ(pacing) 도출"""
    mu = 0.0  # 예산의 shadow price

    for t in range(1, n_rounds + 1):
        lam = 1.0 / (1.0 + mu)  # μ → λ 변환

        # 이번 라운드의 시뮬레이션된 지출
        n_bids = np.random.randint(80, 120)
        values = np.random.exponential(0.5, n_bids)
        spend = np.sum(values * lam)
        budget_per_round = budget / n_rounds

        # Subgradient: 초과 → μ↑(보수적), 여유 → μ↓(적극적)
        mu = max(0, mu + lr * (spend - budget_per_round))

        if t % 25 == 0:
            print(f"  Round {t:3d}: μ={mu:.3f}, λ={lam:.3f}, "
                  f"지출=${spend:.1f} (목표=${budget_per_round:.1f})")

    print(f"  최종: μ={mu:.3f} → λ={1/(1+mu):.3f}")

np.random.seed(42)
lagrangian_dual_update()
```

---

## 5. 실전 고려사항: 이론과 프로덕션의 간극

### 트래픽 예측: Pacing의 숨은 전제

PID든 Lagrangian이든, "남은 시간에 얼마나 많은 입찰 기회가 올 것인가"를 예측해야 합니다. 이 예측이 빗나가면 Pacing도 실패합니다.

| 상황 | 원인 | 결과 | 대응 |
|------|------|------|------|
| 트래픽 과대예측 | 평일 모델로 주말 예측 | 예산 잔여 (under-delivery) | 요일/시간대별 트래픽 모델 |
| 트래픽 과소예측 | 이벤트 기간 미반영 | 예산 조기 소진 | 실시간 트래픽 모니터링 + 적응 |
| 트래픽 급변 | 뉴스 이벤트, 서버 장애 | Pacing 진동 | PID의 D항(미분)으로 급변 감지 |

### 캠페인 간 경쟁: 내부 경매

같은 DSP 내에서 여러 캠페인이 같은 유저/지면을 타겟하면, **내부 경쟁**이 발생합니다:

```text
캠페인 A: CPA $10, 일 예산 $1,000
캠페인 B: CPA $15, 일 예산 $500
캠페인 C: CPA $8,  일 예산 $2,000

→ 같은 유저에게 세 캠페인 모두 입찰하고 싶다면?
→ 내부 Ad Ranking으로 한 캠페인만 선택 후 외부 경매에 참여
→ 각 캠페인의 Pacing이 서로 영향을 미침
```

### Pacing 업데이트 주기

| 주기 | 장점 | 단점 | 적합한 경우 |
|------|------|------|-----------|
| **1시간** | 안정적, 진동 적음 | 급변에 느림 | 대규모 예산 캠페인 |
| **5분** | 빠른 대응 | 진동 가능 | 중간 규모 캠페인 |
| **실시간** (요청마다) | 최적 반응 | 계산 비용, 과민 반응 | RL 기반 시스템 |

---

## 6. RL(강화학습) 기반 Auto-Bidding: 차세대 접근

최근 대형 DSP(Google, Meta, Alibaba)는 강화학습으로 Auto-Bidding을 고도화하고 있습니다.

### 왜 RL인가?

PID/Lagrangian의 한계:
- **PID**: 단일 오차 신호만 추적 → 예산 OR CPA 중 하나만 직접 제어
- **Lagrangian**: 제약당 dual variable을 추가하면 다중 제약이 가능하지만, **dual variable 간 상호작용**으로 튜닝이 복잡해지고 수렴이 불안정해짐
- 두 방식 모두 **트래픽 패턴을 학습하지 못함** (과거 패턴 기반 예측 없이 반응적으로만 동작)

RL은 이 한계를 극복합니다:

<div class="chart-arch">
  <div class="chart-arch-section">
    <div class="chart-arch-section-header">
      <span class="chart-arch-section-icon">S</span>
      <span class="chart-arch-section-title purple">State (상태)</span>
    </div>
    <div class="chart-arch-grid">
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">예산 잔여 비율</div>
        <div class="chart-arch-node-desc">remaining_budget / total_budget</div>
      </div>
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">시간 잔여 비율</div>
        <div class="chart-arch-node-desc">remaining_hours / 24</div>
      </div>
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">현재 CPA</div>
        <div class="chart-arch-node-desc">total_cost / total_conversions</div>
      </div>
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">최근 Win Rate</div>
        <div class="chart-arch-node-desc">wins / bids (최근 1시간)</div>
      </div>
    </div>
  </div>
  <div class="chart-arch-connector">&#8595;</div>
  <div class="chart-arch-section">
    <div class="chart-arch-section-header">
      <span class="chart-arch-section-icon">A</span>
      <span class="chart-arch-section-title blue">Action (행동)</span>
    </div>
    <div class="chart-arch-grid">
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">&lambda; 선택</div>
        <div class="chart-arch-node-desc">pacing multiplier를 [0.1, 1.0] 범위에서 결정</div>
      </div>
    </div>
  </div>
  <div class="chart-arch-connector">&#8595;</div>
  <div class="chart-arch-section">
    <div class="chart-arch-section-header">
      <span class="chart-arch-section-icon">R</span>
      <span class="chart-arch-section-title green">Reward (보상)</span>
    </div>
    <div class="chart-arch-grid">
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">전환 가치</div>
        <div class="chart-arch-node-desc">conversions &times; ConvValue</div>
      </div>
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">CPA 페널티</div>
        <div class="chart-arch-node-desc">-penalty if CPA > target</div>
      </div>
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">예산 초과 페널티</div>
        <div class="chart-arch-node-desc">-penalty if over budget</div>
      </div>
    </div>
  </div>
</div>

### PID vs Lagrangian vs RL 비교

| | PID Controller | Lagrangian Dual | RL (강화학습) |
|---|---|---|---|
| **원리** | 오차 기반 피드백 | 수학적 최적화 | 시행착오 학습 |
| **제약 처리** | 예산 1개 | 예산 1개 (+ KKT) | 다중 제약 가능 |
| **트래픽 적응** | 없음 (반응적) | 없음 (반응적) | 패턴 학습 (예측적) |
| **구현 복잡도** | 낮음 | 중간 | 높음 |
| **안정성** | 높음 (검증됨) | 높음 | 학습 불안정 가능 |
| **실무 채택** | 가장 많음 | 보통 | 대형 플랫폼 |

---

## 7. Auto-Bidding이 pCTR 모델에 미치는 영향

Auto-Bidding과 ML 모델은 서로 영향을 주고받습니다:

### pCTR 정확도가 Pacing에 미치는 영향

| pCTR 상태 | True Value 영향 | Pacing 영향 |
|-----------|---------------|------------|
| **과대추정** | V 과대 → 과다 입찰 | Win Rate 급증 → 예산 빠르게 소진 → $\lambda$ 급락 |
| **과소추정** | V 과소 → 과소 입찰 | Win Rate 급감 → 예산 잔여 → $\lambda$ 상승해도 효과 제한 |
| **정확** | V 정확 → 적정 입찰 | Win Rate 안정 → 예산 균등 소진 → $\lambda$ 안정 |

**pCTR이 과대추정되면 Pacing이 아무리 잘 동작해도 ROI가 하락합니다.** $\lambda$가 0.3까지 떨어져도, 과대추정된 V에 0.3을 곱한 값이 여전히 적정가보다 높을 수 있기 때문입니다.

### Pacing이 학습 데이터에 미치는 영향

$\lambda$가 낮아지면 입찰가가 낮아지고, Win Rate가 떨어집니다. 이는 **Selection Bias를 증가**시킵니다:

```text
λ = 1.0 → 다양한 입찰에서 낙찰 → 풍부한 학습 데이터
λ = 0.3 → 저렴한 입찰만 낙찰 → 편향된 학습 데이터
         → 모델이 "저가 지면 = 높은 CTR"이라고 잘못 학습할 위험
```

이것이 **Bid-Learning Feedback Loop** 문제입니다. Auto-Bidding 시스템을 설계할 때, 학습 데이터의 다양성을 위한 **탐색(exploration) 예산**을 별도로 확보하는 것이 중요합니다.

---

## 마무리

1. **Budget Pacing은 "언제, 얼마나 입찰할까"의 문제** — Bid Shading이 "한 번의 입찰"을 최적화한다면, Budget Pacing은 "하루 전체의 입찰"을 최적화합니다.

2. **PID Controller가 실무의 주력** — 단순하고 안정적이며, 대부분의 예산 제약을 충분히 처리합니다. $K_p$, $K_i$, $K_d$ 튜닝이 핵심입니다.

3. **Lagrangian은 PID의 이론적 근거** — $\lambda$(pacing multiplier)와 $\mu$(shadow price)는 같은 것의 다른 표현입니다. 수학적으로 최적임이 보장됩니다.

4. **RL은 다중 제약 최적화의 열쇠** — 예산 + CPA + ROAS + 노출 균등성을 동시에 최적화할 때 PID/Lagrangian의 한계를 극복합니다.

5. **pCTR 정확도가 모든 것의 기초** — Auto-Bidding이 아무리 정교해도, 입력인 pCTR이 부정확하면 예산을 낭비합니다. 모델 정확도 → 입찰 정확도 → 예산 효율의 체인이 끊어집니다.

> 이 글에서 다룬 Auto-Bidding은 [Bid Shading 포스트](post.html?id=bid-shading-censored)의 자연스러운 후속편입니다. Bid Shading이 "한 번의 b*"를 계산하고, Auto-Bidding이 "$\lambda$로 스케일링"하여 최종 입찰가가 결정됩니다. 다음 글에서는 이 모든 것을 지탱하는 **모델 서빙 아키텍처**(Multi-Stage Ranking, 모델 경량화, A/B 실험)를 다룰 예정입니다.