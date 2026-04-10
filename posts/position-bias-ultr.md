광고 검색 결과에서 1위 광고의 CTR이 3위보다 3배 높습니다. 이 광고가 3배 더 좋은 걸까요? 아닙니다. 유저가 **1위를 3배 더 자주 봤을** 뿐입니다. 이것이 **Position Bias**이며, 이를 보정하지 않으면 pCTR 모델은 "좋은 광고"가 아니라 "좋은 위치"를 학습하게 됩니다.

이 글은 Position Bias의 구조를 해부하고, **Unbiased Learning to Rank (ULTR)** — 편향된 클릭 데이터에서 진짜 광고 품질을 분리하는 방법 — 을 ML Engineer 관점에서 다룹니다.

> [Walled Garden 포스트](post.html?id=walled-garden)에서 Position Bias와 Examination Hypothesis를 소개했습니다. 이 글은 그 개념을 확장하여, 실제로 어떻게 보정하는지를 다룹니다.

---

## 1. Position Bias란 무엇인가

### Examination Hypothesis

유저의 클릭은 두 단계를 거칩니다:

<div class="chart-steps">
  <div style="font-size:0.85rem; font-weight:700; color:var(--text-primary); margin-bottom:12px;">클릭이 발생하는 두 단계</div>
  <div class="chart-step">
    <div class="chart-step-indicator">
      <div class="chart-step-dot blue">1</div>
      <div class="chart-step-line"></div>
    </div>
    <div class="chart-step-content">
      <div class="chart-step-title">Examination (관찰)</div>
      <div class="chart-step-desc">유저가 해당 위치의 광고를 실제로 봤는가? 위치에만 의존하며, 광고 내용과 무관합니다.</div>
      <span class="chart-step-badge blue">P(examine | position) -- 위치 효과</span>
    </div>
  </div>
  <div class="chart-step">
    <div class="chart-step-indicator">
      <div class="chart-step-dot pink">2</div>
    </div>
    <div class="chart-step-content">
      <div class="chart-step-title">Click (클릭 결정)</div>
      <div class="chart-step-desc">광고를 본 유저가 클릭할 것인가? 광고 품질, 유저 관심사, 쿼리 관련성에 의존합니다.</div>
      <span class="chart-step-badge pink">P(click | examine, ad, user, query) -- 진짜 품질</span>
    </div>
  </div>
</div>

이 두 확률의 곱이 관측 CTR입니다:

$$P(\text{click}) = \underbrace{P(\text{examine} | \text{position})}_{\text{Position Bias}} \times \underbrace{P(\text{click} | \text{examine}, \text{ad}, \text{user})}_{\text{True Relevance}}$$

### 위치별 Examination 확률 예시

| 위치 | Examination 확률 | 관측 CTR (동일 광고) | True Relevance |
|------|-----------------|---------------------|---------------|
| 1위 | 100% | 5.0% | 5.0% |
| 2위 | 75% | 3.75% | 5.0% |
| 3위 | 50% | 2.5% | 5.0% |
| 4위 | 30% | 1.5% | 5.0% |
| 5위 | 15% | 0.75% | 5.0% |

같은 광고가 위치만 바뀌어도 CTR이 **6.7배** 차이납니다 (1위 5.0% vs 5위 0.75%). Position Bias를 보정하지 않으면, 모델은 이 차이를 "광고 품질 차이"로 학습합니다.

### Rich-Get-Richer 문제

Position Bias를 보정하지 않으면 강화 루프가 발생합니다:

```
1. 광고 A가 1위에 배치됨
2. Position Bias로 CTR 높게 관측됨
3. 모델이 "A는 좋은 광고"라고 학습
4. A가 다시 1위에 배치됨
5. → 반복 (A는 영원히 1위, 더 좋은 B는 기회를 못 받음)
```

---

## 2. Position Bias를 보정하지 않으면 생기는 문제

### 랭킹 모델에 미치는 영향

| 문제 | 원인 | 결과 |
|------|------|------|
| **품질 과대추정** | 상위 노출 광고의 CTR을 그대로 학습 | 진짜 품질이 아니라 위치 효과를 반영한 순위 |
| **탐색 실패** | 하위 광고에 기회를 주지 않음 | 잠재적 좋은 광고가 묻힘 |
| **Calibration 왜곡** | 동일 광고가 위치별로 다른 pCTR | 서빙 위치 변경 시 예측 부정확 |
| **경매 불공정** | 위치 효과가 입찰가에 반영 | eCPM 기반 경매의 효율성 저하 |

### 실전 예시: 서빙 위치와 학습 위치의 불일치

```
[학습 데이터]
  광고 A: position=1, CTR=5.0% → 모델 학습: pCTR(A) = 5.0%
  광고 B: position=3, CTR=2.2% → 모델 학습: pCTR(B) = 2.2%

[서빙 시: A와 B의 위치가 바뀌면?]
  광고 A: position=3 → 실제 CTR = 2.5% (모델 예측 5.0% → 2배 과대추정)
  광고 B: position=1 → 실제 CTR = 4.4% (모델 예측 2.2% → 2배 과소추정)

→ True Relevance는 A=5.0%, B=4.4%로 비슷한데,
  Position Bias 때문에 pCTR이 2배 이상 왜곡됨
```

---

## 3. Unbiased Learning to Rank (ULTR) 기법

Position Bias를 보정하는 주요 기법들입니다:

<div class="chart-cards">
  <div class="chart-card">
    <div class="chart-card-header">
      <div class="chart-card-icon yellow">A</div>
      <div>
        <div class="chart-card-name">IPS (Inverse Propensity Scoring)</div>
        <div class="chart-card-subtitle">관측 확률의 역수로 가중</div>
      </div>
    </div>
    <div class="chart-card-body">
      <div class="chart-card-row">
        <span class="chart-card-row-label">원리</span>
        <span class="chart-card-row-value">클릭 데이터에 1/P(examine) 가중치</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">장점</span>
        <span class="chart-card-row-value">이론적 보장 (unbiased estimator)</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">단점</span>
        <span class="chart-card-row-value">높은 분산, propensity 추정 필요</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">복잡도</span>
        <span class="chart-card-row-value">낮음</span>
      </div>
    </div>
  </div>
  <div class="chart-card">
    <div class="chart-card-header">
      <div class="chart-card-icon green">B</div>
      <div>
        <div class="chart-card-name">Dual Learning Algorithm (DLA)</div>
        <div class="chart-card-subtitle">Relevance + Propensity 동시 학습</div>
      </div>
    </div>
    <div class="chart-card-body">
      <div class="chart-card-row">
        <span class="chart-card-row-label">원리</span>
        <span class="chart-card-row-value">두 모델이 서로의 가중치를 제공</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">장점</span>
        <span class="chart-card-row-value">Propensity를 별도 실험 없이 추정</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">단점</span>
        <span class="chart-card-row-value">수렴 불안정 가능, 초기값 민감</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">복잡도</span>
        <span class="chart-card-row-value">중간</span>
      </div>
    </div>
  </div>
  <div class="chart-card">
    <div class="chart-card-header">
      <div class="chart-card-icon orange">C</div>
      <div>
        <div class="chart-card-name">Regression EM</div>
        <div class="chart-card-subtitle">EM 알고리즘으로 잠재 변수 추정</div>
      </div>
    </div>
    <div class="chart-card-body">
      <div class="chart-card-row">
        <span class="chart-card-row-label">원리</span>
        <span class="chart-card-row-value">Examination을 잠재 변수로, EM으로 추정</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">장점</span>
        <span class="chart-card-row-value">확률 모델 기반, 불확실성 추정</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">단점</span>
        <span class="chart-card-row-value">수렴 속도 느림, 로컬 최적해</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">복잡도</span>
        <span class="chart-card-row-value">높음</span>
      </div>
    </div>
  </div>
</div>

---

## 4. IPS (Inverse Propensity Scoring) 상세

가장 널리 사용되는 ULTR 기법입니다.

### 핵심 아이디어

관측된 클릭은 Position Bias에 의해 편향되어 있으므로, **관측 확률의 역수**를 가중치로 곱하여 편향을 제거합니다:

$$\mathcal{L}_{\text{IPS}} = \sum_{i} \frac{c_i}{\hat{P}(\text{examine} | \text{pos}_i)} \cdot \ell(f(x_i), c_i)$$

- $c_i$: 클릭 여부 (0 또는 1)
- $\hat{P}(\text{examine} | \text{pos}_i)$: 위치 $\text{pos}_i$의 Examination 확률 추정값
- $\ell$: 손실 함수 (cross-entropy 등)
- $f(x_i)$: 모델의 예측값

**직관**: 5위에서 클릭이 발생했다면, 유저가 5위까지 볼 확률이 15%밖에 안 되므로, 이 클릭은 $1/0.15 \approx 6.7$배의 가중치를 받습니다. "5위에서도 클릭했으니 진짜 좋은 광고"라는 신호를 증폭하는 것입니다.

### Propensity 추정 방법

Examination 확률 $P(\text{examine} | \text{position})$을 어떻게 구할 것인가:

| 방법 | 원리 | 장점 | 단점 |
|------|------|------|------|
| **Randomized Experiment** | 같은 광고를 랜덤 위치에 배치 | 가장 정확 (ground truth) | 매출 손실 (최적 아닌 배치) |
| **Result Randomization** | 상위 K개 결과의 순서를 셔플 | 유저 경험 훼손 적음 | 부분적 추정만 가능 |
| **EM Algorithm** | 클릭 데이터에서 위치별 확률 추정 | 실험 불필요 | 수렴 보장 약함 |
| **Regression-based** | 위치를 피처로 넣고 효과 분리 | 유연, 다른 bias도 처리 | 모델 의존적 |

### 실전 예시: IPS 적용 전후

```python
# Propensity 추정값 (Randomized Experiment에서 측정)
propensity = {1: 1.0, 2: 0.75, 3: 0.50, 4: 0.30, 5: 0.15}

# IPS 적용 전: 원시 학습 데이터
# 광고 A (pos=1): 100 노출, 5 클릭 → CTR = 5.0%
# 광고 B (pos=3): 100 노출, 2 클릭 → CTR = 2.0%
# → 모델 학습: A가 B보다 2.5배 좋다

# IPS 적용 후: 가중치 보정
# 광고 A (pos=1): 5 클릭 × (1/1.0) = 5.0 → weighted CTR = 5.0%
# 광고 B (pos=3): 2 클릭 × (1/0.5) = 4.0 → weighted CTR = 4.0%
# → 모델 학습: A가 B보다 1.25배 좋다 (2.5배 → 1.25배로 보정)
# → True Relevance에 더 가까운 추정
```

### IPS의 분산 문제와 해결

IPS의 최대 약점은 **높은 분산**입니다. 하위 위치의 가중치가 매우 커서 학습이 불안정해집니다:

| 위치 | Propensity | IPS 가중치 | 문제 |
|------|-----------|-----------|------|
| 1위 | 1.0 | 1.0x | 안정 |
| 3위 | 0.5 | 2.0x | 보통 |
| 5위 | 0.15 | 6.7x | 분산 높음 |
| 10위 | 0.05 | 20x | 매우 불안정 |

**분산 감소 기법**:

| 기법 | 원리 | 효과 |
|------|------|------|
| **Clipping** | 가중치 상한 설정 (예: max 10x) | 분산 감소, 약간의 bias 도입 |
| **Self-Normalized IPS (SNIPS)** | 가중치를 합으로 정규화 | 분산 크게 감소, bounded |
| **Doubly Robust** | IPS + 직접 추정의 결합 | bias와 분산 모두 개선 |

---

## 5. DLA (Dual Learning Algorithm): 실험 없이 보정

IPS는 Propensity를 알아야 합니다. Randomized Experiment 없이 Propensity를 추정하면서 동시에 Relevance 모델을 학습하는 방법이 **DLA**입니다.

<div class="chart-arch">
  <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
    <div class="chart-arch-section">
      <div class="chart-arch-section-header">
        <span class="chart-arch-section-title pink">Relevance Model</span>
      </div>
      <div class="chart-arch-grid">
        <div class="chart-arch-node">
          <div class="chart-arch-node-name">입력: 광고, 유저, 쿼리</div>
          <div class="chart-arch-node-desc">P(click | examine, ad, user, query)</div>
        </div>
        <div class="chart-arch-node">
          <div class="chart-arch-node-name">가중치: Propensity Model이 제공</div>
          <div class="chart-arch-node-desc">1 / P(examine | position)</div>
        </div>
      </div>
    </div>
    <div class="chart-arch-section">
      <div class="chart-arch-section-header">
        <span class="chart-arch-section-title blue">Propensity Model</span>
      </div>
      <div class="chart-arch-grid">
        <div class="chart-arch-node">
          <div class="chart-arch-node-name">입력: 위치 (position)</div>
          <div class="chart-arch-node-desc">P(examine | position)</div>
        </div>
        <div class="chart-arch-node">
          <div class="chart-arch-node-name">가중치: Relevance Model이 제공</div>
          <div class="chart-arch-node-desc">1 / P(click | examine)</div>
        </div>
      </div>
    </div>
  </div>
  <div class="chart-arch-connector">v</div>
  <div class="chart-arch-section">
    <div class="chart-arch-section-header">
      <span class="chart-arch-section-title green">학습 과정</span>
    </div>
    <div class="chart-arch-grid">
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">1. Relevance 고정, Propensity 업데이트</div>
        <div class="chart-arch-node-desc">현재 Relevance 추정값으로 Propensity 학습</div>
      </div>
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">2. Propensity 고정, Relevance 업데이트</div>
        <div class="chart-arch-node-desc">현재 Propensity 추정값으로 Relevance 학습 (IPS)</div>
      </div>
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">3. 반복 수렴</div>
        <div class="chart-arch-node-desc">두 모델이 서로를 점진적으로 개선</div>
      </div>
    </div>
  </div>
</div>

**핵심 통찰**: Examination Hypothesis에서 $P(\text{click}) = P(\text{examine}) \times P(\text{relevance})$이므로, 한쪽을 알면 다른 쪽을 추정할 수 있습니다. DLA는 이 대칭성을 활용하여 두 모델을 번갈아 학습시킵니다.

---

## 6. 광고 시스템에서의 실전 적용

### Open RTB vs Walled Garden에서의 차이

| | Open RTB (DSP) | Walled Garden (네이버/카카오/구글) |
|---|---|---|
| **Position Bias 심각도** | 낮음 (보통 1개 광고만 노출) | 높음 (검색: 3-5개, 피드: 연속 노출) |
| **보정 필요성** | pCTR 정확도에 간접 영향 | 랭킹 공정성에 직접 영향 |
| **Propensity 추정** | 어려움 (위치가 거의 고정) | 가능 (다양한 위치에 노출) |
| **주요 활용** | Calibration 보정 | 랭킹 모델 학습 + 광고 품질 평가 |

### Position Bias 외에 보정해야 할 다른 Bias

| Bias | 원인 | 영향 |
|------|------|------|
| **Position Bias** | 위치에 따른 시선 확률 차이 | 상위 광고 품질 과대추정 |
| **Selection Bias** | 모델이 선택한 광고만 노출 | 미노출 광고의 성과를 모름 |
| **Trust Bias** | 상위 결과를 더 신뢰 | Position Bias와 복합 작용 |
| **Presentation Bias** | 광고 크기, 색상, 이미지 차이 | 시각적 요소가 CTR에 영향 |
| **Context Bias** | 주변 광고의 품질이 영향 | 좋은 광고 사이에 있으면 CTR 하락 |

### 실전 파이프라인

```
[데이터 수집]
  클릭 로그: (user, query, ad, position, clicked)

[Propensity 추정]
  방법 1: Randomized Experiment (5% 트래픽으로 위치 셔플)
  방법 2: DLA (실험 없이 로그 데이터만으로 추정)

[모델 학습]
  IPS-weighted Loss:
    L = sum(click_i / propensity[pos_i] * cross_entropy(pred_i, click_i))
  
  또는 Position을 피처로:
    features = [user_features, ad_features, query_features]  # position 제외
    label = click (IPS-weighted)

[서빙]
  랭킹 시 position 피처 없이 순수 relevance만으로 순위 결정
  → 이후 비즈니스 로직(diversity, frequency cap) 적용
```

---

## 마무리

1. **Position Bias는 "위치가 만드는 착각"** — 1위 광고의 높은 CTR 중 상당 부분은 광고 품질이 아니라 위치 효과입니다. 보정하지 않으면 Rich-Get-Richer 강화 루프가 발생합니다.

2. **Examination Hypothesis가 핵심 프레임워크** — 관측 CTR = P(examine|position) x P(click|examine, ad). 이 분해를 통해 위치 효과와 광고 품질을 분리합니다.

3. **IPS가 가장 실용적인 출발점** — Propensity를 추정하고, 클릭에 역수 가중치를 부여합니다. 분산 문제는 Clipping이나 SNIPS로 대응합니다.

4. **DLA는 실험 없이 보정 가능** — Relevance Model과 Propensity Model을 번갈아 학습시켜, 랜덤 실험 없이도 Position Bias를 추정합니다.

5. **광고 랭킹의 공정성이 곧 매출** — Position Bias를 보정하면 진짜 좋은 광고가 상위에 노출되고, 유저 클릭률과 광고주 전환율이 모두 올라갑니다. pCTR 모델의 정확도 → 랭킹 공정성 → 비즈니스 성과의 체인입니다.

> Position Bias는 [Walled Garden 포스트](post.html?id=walled-garden)에서 소개한 "Walled Garden 고유 문제"의 핵심입니다. Open RTB에서는 보통 단일 광고가 노출되므로 Position Bias가 덜 중요하지만, 검색 광고나 피드 광고처럼 여러 광고가 순서대로 노출되는 환경에서는 필수적인 보정입니다.