광고 검색 결과에서 1위 광고의 CTR이 3위보다 3배 높습니다. 이 광고가 3배 더 좋은 걸까요? 아닙니다. 유저가 **1위를 3배 더 자주 봤을** 뿐입니다. 이것이 **자리 편향(Position Bias)**입니다. 이를 보정하지 않으면 pCTR 모델은 "좋은 광고"가 아니라 "좋은 위치"를 학습하게 됩니다.

이 글은 자리 편향의 구조를 해부합니다. 그리고 진짜 광고 품질을 편향된 클릭에서 떼어 내는 방법을 다룹니다. **편향을 걷어낸 랭킹 학습(Unbiased Learning to Rank, ULTR)**입니다. 관점은 ML Engineer, 즉 모델을 실제로 고치는 사람의 시선입니다.

> [닫힌 생태계(Walled Garden) 포스트](post.html?id=walled-garden)에서 자리 편향을 소개했습니다. 먼저 봐야 누른다는 전제(Examination Hypothesis)도 그 글에서 처음 나왔습니다. 이 글은 그 개념을 확장해, 실제로 어떻게 보정하는지를 다룹니다.

---

## 1. 자리 편향이란 무엇인가

### 먼저 봐야 누른다는 전제

유저의 클릭은 두 단계를 거칩니다:

<div class="chart-steps">
  <div style="font-size:0.85rem; font-weight:700; color:var(--text-primary); margin-bottom:12px;">클릭이 발생하는 두 단계</div>
  <div class="chart-step">
    <div class="chart-step-indicator">
      <div class="chart-step-dot blue">1</div>
      <div class="chart-step-line"></div>
    </div>
    <div class="chart-step-content">
      <div class="chart-step-title">눈길이 닿음(Examination) (관찰)</div>
      <div class="chart-step-desc">유저가 해당 위치의 광고를 실제로 봤는가? 위치에만 의존하며, 광고 내용과 무관합니다.</div>
      <span class="chart-step-badge blue">P(눈길이 닿다(examine) | position) -- 위치 효과</span>
    </div>
  </div>
  <div class="chart-step">
    <div class="chart-step-indicator">
      <div class="chart-step-dot pink">2</div>
    </div>
    <div class="chart-step-content">
      <div class="chart-step-title">Click (클릭 결정)</div>
      <div class="chart-step-desc">광고를 본 유저가 클릭할 것인가? 광고 품질, 유저 관심사, 쿼리 관련성에 의존합니다.</div>
      <span class="chart-step-badge pink">P(클릭(click) | 눈길이 닿다, ad, user, query) -- 진짜 품질</span>
    </div>
  </div>
</div>

이 두 확률의 곱이 관측 CTR입니다.

$$P(\text{click}) = \underbrace{P(\text{examine} | \text{position})}_{\text{Position Bias}} \times \underbrace{P(\text{click} | \text{examine}, \text{ad}, \text{user})}_{\text{True Relevance}}$$

### 위치별 눈길이 닿음 확률 예시

| 위치 | 눈길이 닿음 확률 | 관측 CTR (동일 광고) | True Relevance |
|------|-----------------|---------------------|---------------|
| 1위 | 100% | 5.0% | 5.0% |
| 2위 | 75% | 3.75% | 5.0% |
| 3위 | 50% | 2.5% | 5.0% |
| 4위 | 30% | 1.5% | 5.0% |
| 5위 | 15% | 0.75% | 5.0% |

같은 광고가 위치만 바뀌어도 CTR이 **6.7배** 차이납니다 (1위 5.0% vs 5위 0.75%). 자리 편향을 보정하지 않으면, 모델은 이 차이를 "광고 품질 차이"로 학습합니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-training-cards.html?embed=1&card=position" height="480" loading="lazy" title="자리가 만드는 착각"></iframe>
<a class="demo-embed-open" href="demo-training-cards.html" target="_blank" rel="noopener">↗ 카드 여섯 장 전체로 열기</a>
</div>

### Rich-Get-Richer 문제

자리 편향을 보정하지 않으면 강화 루프가 발생합니다.

```text
1. 광고 A가 1위에 배치됨
2. Position Bias로 CTR 높게 관측됨
3. 모델이 "A는 좋은 광고"라고 학습
4. A가 다시 1위에 배치됨
5. → 반복 (A는 영원히 1위, 더 좋은 B는 기회를 못 받음)
```

:::deep 더 깊이 — Position-Based Model(PBM)의 가정과 균열

이 글 전체가 기대는 가정을 정확히 적으면 이렇습니다.

$$P(C_k = 1) = P(E_k = 1) \times P(R_k = 1)$$

- $C_k = 1$: 유저가 위치 $k$의 광고를 클릭했다는 뜻
- $E_k = 1$: 유저가 위치 $k$의 광고를 실제로 봤다는 뜻 (Examination)
- $R_k = 1$: 그 광고가 유저의 의도에 실제로 관련 있다는 뜻 (Relevance)

**PBM의 핵심 가정은 $E_k$가 오직 위치 $k$에만 의존한다는 것입니다.** 그 위에 무엇이 있었는지는 상관하지 않습니다. 유저가 그 전에 클릭했는지도 상관하지 않습니다. 이 덕분에 위치별 눈길이 닿음 확률 하나만 알면 충분합니다. 어떤 광고든 같은 값을 곱해 되돌릴 수 있습니다. 계산이 쉬워지는 대신 강한 가정을 깔고 가는 셈입니다.

이 가정은 실제로 자주 깨집니다. 대표적인 대안이 **Cascade Model**입니다. 여기서는 유저가 1위부터 순서대로 훑는다고 가정합니다. 그리고 클릭하면 그 자리에서 멈춥니다. 그러면 위치 $k$를 볼 확률은 그 앞 위치들에서 아무것도 클릭하지 않았을 확률에 좌우됩니다.

$$P(E_k = 1) = \prod_{j < k} P(R_j = 0)$$

3위를 보려면 1위와 2위를 봤는데 둘 다 클릭하지 않았어야 합니다. 그 확률은 1·2위 광고가 얼마나 매력적인지에 달렸습니다. **3위의 Examination 확률이 3위 자신이 아니라 옆 경쟁자의 품질에 좌우되는 것입니다.** PBM이라면 3위 Examination은 고정된 상수, 예를 들어 50%여야 합니다. 하지만 Cascade Model에서는 1위 광고가 매력적일수록 3위를 볼 확률이 낮아집니다. 위치는 그대로인데 경쟁자가 바뀌면 내 Examination 확률도 바뀐다는 뜻입니다.

실무에서는 대개 PBM으로 시작합니다. 구현이 단순하고, IPS 공식도 PBM을 전제로 만들어졌기 때문입니다. Cascade 계열은 유저가 위에서 아래로 훑는다는 확신이 강할 때 검토 대상이 됩니다. PBM 보정 후에도 순위가 이상하게 불안정하다면, 그때 의심해 볼 지점이기도 합니다.
:::

---

## 2. Position Bias를 보정하지 않으면 생기는 문제

**Position Bias를 그대로 두면 모델은 틀린 것을 정답으로 배웁니다.** 1위 광고가 잘 눌리는 이유 중 얼마가 품질이고 얼마가 자리인지, 모델은 구별하지 못합니다.

검색 결과 화면을 떠올려 봅시다. 맨 위 광고는 화면을 열면 바로 보입니다. 다섯 번째 광고는 스크롤을 내린 사람만 봅니다. 그래서 1위 광고가 제일 많이 눌렸다고 제일 좋은 광고라는 뜻은 아닙니다. 노출 로그에는 "봤는지"와 "좋았는지"가 뒤섞여 있는데, 모델은 이 둘을 나눌 방법이 없습니다.

1절의 숫자로 돌아가 봅시다. 같은 광고인데 1위(5.0%)와 5위(0.75%) 사이에 CTR이 6.7배 벌어졌습니다. 모델이 이 차이를 그대로 학습하면, "5위에 있던 광고는 원래 나쁘다"고 잘못 결론짓습니다. 그리고 다음번에도 그 광고를 5위 밑으로 내립니다. 한 번 밀린 광고는 계속 밀립니다. 1절에서 본 Rich-Get-Richer 루프가 여기서 실제 피해로 이어지는 것입니다.

### 랭킹 모델에 미치는 영향

| 문제 | 원인 | 결과 |
|------|------|------|
| **품질 과대추정** | 상위 노출 광고의 CTR을 그대로 학습 | 진짜 품질이 아니라 위치 효과를 반영한 순위 |
| **탐색 실패** | 하위 광고에 기회를 주지 않음 | 잠재적 좋은 광고가 묻힘 |
| **Calibration 왜곡** | 동일 광고가 위치별로 다른 pCTR | 서빙 위치 변경 시 예측 부정확 |
| **경매 불공정** | 위치 효과가 입찰가에 반영 | eCPM 기반 경매의 효율성 저하 |

네 가지 문제 모두 뿌리는 하나입니다. **위치 때문에 생긴 CTR 차이를, 모델이 광고 품질 차이로 오인합니다.** 아래 표에서 이것을 숫자로 직접 확인해 봅시다.

### 다섯 광고로 확인하는 뒤바뀐 순위

같은 슬롯에 서로 다른 광고 A~E가 각자 1위~5위에 노출됐다고 합시다. 노출은 각 10,000회입니다. 진짜 품질은 아무도 모릅니다. 관측되는 것은 클릭뿐입니다.

| 광고 | 위치 | 노출 | 클릭 | 관측 CTR | 관측 순위 | Examination 추정 | 보정 CTR | 보정 순위 |
|---|---|---|---|---|---|---|---|---|
| A | 1위 | 10,000 | 277 | 2.77% | 1위 | 100.0% | 2.77% | 3위 |
| B | 2위 | 10,000 | 192 | 1.92% | 2위 | 74.4% | 2.58% | 4위 |
| C | 3위 | 10,000 | 146 | 1.46% | 3위 | 49.4% | 2.95% | 2위 |
| D | 4위 | 10,000 | 120 | 1.20% | 4위 | 29.5% | 4.06% | **1위** |
| E | 5위 | 10,000 | 17 | 0.17% | 5위 | 16.4% | 1.03% | 5위 |

**관측 CTR만 보면 순위는 그냥 위치 순서입니다.** A, B, C, D, E — 1위부터 5위까지 한 치의 어긋남도 없습니다. 광고 품질은 표에 전혀 없는데도 이 순서가 나옵니다.

Examination 추정치로 관측 CTR을 나누면 얘기가 완전히 달라집니다. **4위였던 D가 보정 순위 1위로 뛰어오릅니다.** D는 4위라는 불리한 자리에서 관측 CTR 1.20%를 냈습니다. 위치 효과를 걷어내면 보정 CTR은 4.06%로, 다섯 광고 중 가장 높습니다. 반대로 1위였던 A는 3위로 내려갑니다. 밀어주는 자리 덕에 실제보다 좋아 보였을 뿐입니다.

3위였던 C도 2위로 올라와 A·B를 앞지릅니다. 이것은 노이즈입니다. 광고 하나당 노출이 10,000번뿐이라 클릭 수가 요동친 탓입니다. 4절에서 다시 나오는 **IPS의 분산 문제**가 바로 이 흔들림입니다. 극단적인 반전(D)은 표본이 작아도 믿을 만합니다. 하지만 중간 순위의 미세한 차이는 표본을 늘리기 전엔 장담하기 어렵습니다.

이 Examination 추정치가 어디서 나왔는지, 보정 계산을 코드로 어떻게 하는지는 4절에서 그대로 이어갑니다.

### 실전 예시: 서빙 위치와 학습 위치의 불일치

```text
[학습 데이터]
  광고 A: position=1, CTR=5.0% → 모델 학습: pCTR(A) = 5.0%
  광고 B: position=3, CTR=2.2% → 모델 학습: pCTR(B) = 2.2%

[서빙 시: A와 B의 위치가 바뀌면?]
  광고 A: position=3 → 실제 CTR = 2.5% (모델 예측 5.0% → 2배 과대추정)
  광고 B: position=1 → 실제 CTR = 4.4% (모델 예측 2.2% → 2배 과소추정)

→ True Relevance는 A=5.0%, B=4.4%로 비슷한데,
  Position Bias 때문에 pCTR이 2배 이상 왜곡됨
```

왜 이런 일이 생길까요. 모델이 위치를 피처로 넣지 않았다면, pCTR 자체에 위치 효과가 녹아 들어갑니다. 위치를 피처로 넣었더라도, 학습 때 본 위치 분포와 서빙 때 실제로 배치되는 위치 분포가 다르면 똑같이 어긋납니다. 실무에서는 이 어긋남이 그대로 입찰가로 번집니다. eCPM이 pCTR에서 계산되니, pCTR이 틀리면 입찰가도 틀립니다. 결과는 광고주에게는 손해, 플랫폼에게는 경매 비효율입니다.

---

## 3. Unbiased Learning to Rank (ULTR) 기법

여기서 문제를 다시 정리해 봅시다. 우리가 진짜 알고 싶은 건 "이 광고가 이 사람에게 얼마나 맞나"입니다. 그런데 로그에 남은 건 "이 광고가 3번 자리에 있었고 클릭이 안 됐다"뿐입니다. 안 눌린 이유가 두 가지 섞여 있습니다. **광고가 별로였을 수도 있고, 아예 안 봤을 수도 있습니다.** 이 둘을 나누는 것이 ULTR(Unbiased Learning to Rank)입니다.

나누는 방법은 결국 하나로 모입니다. **"이 자리에 있었으면 볼 확률이 얼마인가"를 아는 것.** 이 확률을 Propensity라고 부릅니다. 1번 자리는 볼 확률이 높고 10번 자리는 낮습니다. 그 확률을 알면 낮은 자리의 클릭 하나를 더 무겁게 세어 균형을 맞출 수 있습니다.

문제는 이 확률을 어디서 구하냐입니다. 여기서 기법이 나뉩니다. **일부러 순서를 섞어 실험해서 재는 방법**이 있고, **실험 없이 로그만으로 추정하는 방법**이 있습니다. 실험은 정확하지만 그 기간 동안 수익을 깎아 먹습니다. 추정은 공짜지만 틀릴 수 있습니다. 아래 세 기법은 이 둘 사이에서 서로 다른 자리를 고른 것입니다.

<div class="chart-cards">
  <div class="chart-card">
    <div class="chart-card-header">
      <div class="chart-card-icon yellow">A</div>
      <div>
        <div class="chart-card-name">IPS (노출 확률의 역수로 가중(Inverse Propensity Scoring))</div>
        <div class="chart-card-subtitle">관측 확률의 역수로 가중.</div>
      </div>
    </div>
    <div class="chart-card-body">
      <div class="chart-card-row">
        <span class="chart-card-row-label">원리</span>
        <span class="chart-card-row-value">클릭 데이터에 1/P(눈길이 닿다) 가중치.</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">장점</span>
        <span class="chart-card-row-value">이론적 보장 (unbiased estimator).</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">단점</span>
        <span class="chart-card-row-value">높은 분산, propensity 추정 필요.</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">복잡도</span>
        <span class="chart-card-row-value">낮음.</span>
      </div>
    </div>
  </div>
  <div class="chart-card">
    <div class="chart-card-header">
      <div class="chart-card-icon green">B</div>
      <div>
        <div class="chart-card-name">두 모델을 번갈아 학습하는 방법(Dual Learning Algorithm) (DLA)</div>
        <div class="chart-card-subtitle">Relevance + 노출 확률(Propensity) 동시 학습.</div>
      </div>
    </div>
    <div class="chart-card-body">
      <div class="chart-card-row">
        <span class="chart-card-row-label">원리</span>
        <span class="chart-card-row-value">두 모델이 서로의 가중치를 제공.</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">장점</span>
        <span class="chart-card-row-value">노출 확률을 별도 실험 없이 추정.</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">단점</span>
        <span class="chart-card-row-value">수렴 불안정 가능, 초기값 민감.</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">복잡도</span>
        <span class="chart-card-row-value">중간.</span>
      </div>
    </div>
  </div>
  <div class="chart-card">
    <div class="chart-card-header">
      <div class="chart-card-icon orange">C</div>
      <div>
        <div class="chart-card-name">Regression EM</div>
        <div class="chart-card-subtitle">EM 알고리즘으로 잠재 변수 추정.</div>
      </div>
    </div>
    <div class="chart-card-body">
      <div class="chart-card-row">
        <span class="chart-card-row-label">원리</span>
        <span class="chart-card-row-value">눈길이 닿음을 잠재 변수로, EM으로 추정.</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">장점</span>
        <span class="chart-card-row-value">확률 모델 기반, 불확실성 추정.</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">단점</span>
        <span class="chart-card-row-value">수렴 속도 느림, 로컬 최적해.</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">복잡도</span>
        <span class="chart-card-row-value">높음.</span>
      </div>
    </div>
  </div>
</div>

세 기법을 고르는 기준은 결국 **"노출 확률을 어디서 얻을 수 있나"** 한 가지로 정리됩니다.

순서를 섞는 실험을 돌릴 수 있다면 IPS가 제일 낫습니다. 확률을 직접 재서 넣기 때문에 이론적으로 편향이 사라집니다. 다만 실무에서 실험 기간은 늘 짧고, 그동안 좋은 광고를 아래에 내려 보내야 하니 눈에 보이는 손실이 생깁니다. 그리고 낮은 자리의 확률이 아주 작으면 그 역수가 커져서, 클릭 한 건이 수십 건처럼 세어지는 문제가 생깁니다(분산 폭발). 그래서 실무에서는 가중치에 상한을 두고 씁니다.

실험을 못 돌리는 상황이라면 DLA나 Regression EM으로 넘어갑니다. 둘 다 로그만으로 확률과 관련도를 함께 추정합니다. DLA는 두 모델이 서로를 가르치게 하고, Regression EM은 확률 모델을 세운 뒤 반복해서 다듬습니다. 공짜라는 게 장점이고, 수렴이 느리고 엉뚱한 답에 갇힐 수 있다는 게 대가입니다.

**현실적인 순서는 이렇습니다.** 작은 규모로 순서를 섞는 실험을 한 번 돌려 노출 확률의 대략적인 모양을 잡습니다. 그 값을 초기값으로 DLA를 돌려 계속 갱신합니다. 실험은 한 번만 하고, 이후의 변화는 로그가 따라잡게 하는 방식입니다.

---

## 4. IPS (노출 확률의 역수로 가중) 상세

가장 널리 사용되는 ULTR 기법입니다.

### 핵심 아이디어

관측된 클릭은 자리 편향에 의해 편향되어 있으므로, **관측 확률의 역수**를 가중치로 곱하여 편향을 제거합니다.

$$\mathcal{L}_{\text{IPS}} = \sum_{i} \frac{c_i}{\hat{P}(\text{examine} | \text{pos}_i)} \cdot \ell(f(x_i), c_i)$$

- $c_i$: 클릭 여부 (0 또는 1)
- $\hat{P}(\text{examine} | \text{pos}_i)$: 위치 $\text{pos}_i$의 눈길이 닿음 확률 추정값
- $\ell$: 손실 함수 (cross-entropy 등)
- $f(x_i)$: 모델의 예측값

**직관**: 5위에서 클릭이 발생했다고 합시다. 유저가 5위까지 볼 확률은 15%뿐입니다. 그래서 이 클릭은 $1/0.15 \approx 6.7$배의 가중치를 받습니다. "5위에서도 클릭했으니 진짜 좋은 광고"라는 신호를 증폭하는 것입니다.

### 노출 확률 추정 방법

눈길이 닿음 확률 $P(\text{examine} | \text{position})$을 어떻게 구할 것인가?

| 방법 | 원리 | 장점 | 단점 |
|------|------|------|------|
| **Randomized Experiment** | 같은 광고를 랜덤 위치에 배치 | 가장 정확 (ground truth) | 매출 손실 (최적 아닌 배치) |
| **Result Randomization** | 상위 K개 결과의 순서를 셔플 | 유저 경험 훼손 적음 | 부분적 추정만 가능 |
| **EM Algorithm** | 클릭 데이터에서 위치별 확률 추정 | 실험 불필요 | 수렴 보장 약함 |
| **Regression-based** | 위치를 피처로 넣고 효과 분리 | 유연, 다른 편향(bias)도 처리 | 모델 의존적 |

### 실전 예시: 2절의 표를 코드로 직접 계산하기

2절에서 본 다섯 광고 표를 그대로 코드로 만들어 보겠습니다. 실험에서 눈길이 닿음 확률을 추정하는 부분까지 포함합니다.

```python
# 위치 편향을 (1) 데이터에서 추정하고 (2) IPW로 되돌려 진짜 순위를 되찾는다.
# 표준 라이브러리만 쓴다. 그대로 복붙해 돌리면 2절 표의 "보정 CTR" "보정 순위"가 똑같이 나온다.
import random

random.seed(42)

def simulate_clicks(n_impressions, click_prob):
    # 노출 하나하나에 동전을 던져(무작위) 클릭 여부를 정하고, 클릭 수를 센다.
    return sum(1 for _ in range(n_impressions) if random.random() < click_prob)

# --- 1단계: 같은 광고를 위치만 바꿔 보여주는 실험에서 Examination 확률을 "추정"한다 ---
# 진짜 Examination 확률(TRUE_EXAM)은 세상만 알고, 우리는 노출·클릭만 본다고 가정한다.
TRUE_EXAM = {1: 1.00, 2: 0.75, 3: 0.50, 4: 0.30, 5: 0.15}   # 검증용 정답 -- 코드는 모르는 척한다
PROBE_TRUE_RELEVANCE = 0.05      # 프로브 광고의 진짜 품질(위치를 바꿔도 불변)
PROBE_IMPRESSIONS = 50_000       # 위치마다 이만큼 무작위로 노출

probe_ctr = {}
for pos, exam in TRUE_EXAM.items():
    clicks = simulate_clicks(PROBE_IMPRESSIONS, PROBE_TRUE_RELEVANCE * exam)
    probe_ctr[pos] = clicks / PROBE_IMPRESSIONS

# 1위를 기준(100%)으로 삼아 상대 비율로 Examination 확률을 추정한다.
est_exam = {pos: ctr / probe_ctr[1] for pos, ctr in probe_ctr.items()}

# --- 2단계: 서로 다른 5개 광고가 각자 자기 위치에서 실제로 낸 관측 데이터 ---
ads = {
    #  광고: (위치, 노출수, 진짜 품질 -- 실무에선 아무도 모르는 값)
    "A": (1, 10_000, 0.0300),
    "B": (2, 10_000, 0.0280),
    "C": (3, 10_000, 0.0260),
    "D": (4, 10_000, 0.0400),   # 위치는 4위지만 진짜 품질은 다섯 광고 중 가장 높다
    "E": (5, 10_000, 0.0100),
}

observed = {}
for ad, (pos, n, true_relevance) in ads.items():
    exam = TRUE_EXAM[pos]                                # 세상은 이 확률로 실제 노출을 만든다
    clicks = simulate_clicks(n, true_relevance * exam)
    observed[ad] = {"pos": pos, "n": n, "clicks": clicks, "ctr": clicks / n}

# --- 3단계: 관측 CTR을 추정 Examination 확률로 나눠 되돌린다 (IPW) ---
for ad, row in observed.items():
    row["corrected"] = row["ctr"] / est_exam[row["pos"]]

raw_rank = sorted(observed, key=lambda a: -observed[a]["ctr"])
corrected_rank = sorted(observed, key=lambda a: -observed[a]["corrected"])

print("추정 Examination 확률 (실제 vs 추정):")
for pos in sorted(est_exam):
    print(f"  {pos}위  실제 {TRUE_EXAM[pos]*100:5.1f}%   추정 {est_exam[pos]*100:5.1f}%")
print()
print(f"{'광고':<4}{'위치':<6}{'관측 CTR':>10}{'보정 CTR':>10}")
for ad in "ABCDE":
    row = observed[ad]
    print(f"{ad:<4}{row['pos']:<6}{row['ctr']*100:>9.2f}%{row['corrected']*100:>9.2f}%")
print()
print("관측 순위(그냥 CTR 순)  :", " > ".join(raw_rank))
print("보정 순위(IPW 적용 후)  :", " > ".join(corrected_rank))

# 출력:
# 추정 Examination 확률 (실제 vs 추정):
#   1위  실제 100.0%   추정 100.0%
#   2위  실제  75.0%   추정  74.4%
#   3위  실제  50.0%   추정  49.4%
#   4위  실제  30.0%   추정  29.5%
#   5위  실제  15.0%   추정  16.4%
#
# 광고  위치        관측 CTR    보정 CTR
# A   1          2.77%     2.77%
# B   2          1.92%     2.58%
# C   3          1.46%     2.95%
# D   4          1.20%     4.06%
# E   5          0.17%     1.03%
#
# 관측 순위(그냥 CTR 순)  : A > B > C > D > E
# 보정 순위(IPW 적용 후)  : D > C > A > B > E
```

코드는 딱 세 단계입니다. 1단계는 같은 프로브 광고를 위치만 바꿔 보여줘서 눈길이 닿음 확률을 역산합니다. 2단계는 서로 다른 5개 광고가 각자 자기 자리에서 낸 관측 데이터를 만듭니다. 3단계는 관측 CTR을 추정 눈길이 닿음 확률로 나눠 보정 CTR을 얻습니다. 추정치가 정답(TRUE_EXAM)과 거의 일치하는 것도 확인할 수 있습니다. 2위는 실제 75%인데 추정 74.4%, 5위는 실제 15%인데 추정 16.4%입니다. 표본이 5만 개면 이 정도 오차 안에서 수렴합니다.

### IPS의 분산 문제와 해결

IPS의 최대 약점은 **높은 분산**입니다. 하위 위치의 가중치가 매우 커서 학습이 불안정해집니다:

| 위치 | 노출 확률 | IPS 가중치 | 문제 |
|------|-----------|-----------|------|
| 1위 | 1.0 | 1.0x | 안정 |
| 3위 | 0.5 | 2.0x | 보통 |
| 5위 | 0.15 | 6.7x | 분산 높음 |
| 10위 | 0.05 | 20x | 매우 불안정 |

**분산 감소 기법**:

| 기법 | 원리 | 효과 |
|------|------|------|
| **Clipping** | 가중치 상한 설정 (예: max 10x) | 분산 감소, 약간의 편향 도입 |
| **Self-Normalized IPS (SNIPS)** | 가중치를 합으로 정규화 | 분산 크게 감소, bounded |
| **Doubly Robust** | IPS + 직접 추정의 결합 | 편향과 분산 모두 개선 |

---

## 5. DLA (두 모델을 번갈아 학습하는 방법): 실험 없이 보정

IPS에는 전제가 하나 있습니다. **노출 확률(자리별로 볼 확률)를 이미 안다는 것.** 그런데 그걸 알려면 순서를 섞는 실험을 돌려야 하고, 실험은 돈이 듭니다.

여기서 순환 문제가 생깁니다. 관련도를 제대로 배우려면 자리 효과를 걷어내야 합니다. 자리 효과를 재려면 관련도가 같은 광고끼리 비교해야 합니다. 둘 중 어느 것도 먼저 알 수 없습니다.

**DLA는 이 문제를 "둘을 동시에, 서로를 이용해서" 푸는 방법입니다.** 두 개의 모델을 나란히 세웁니다. 하나는 관련도 모델, 하나는 자리별 관찰 확률 모델입니다. 그리고 서로의 답을 가중치로 빌려 씁니다.

이름의 dual은 「두 모델이 서로의 출력을 학습 재료로 쓴다」는 뜻입니다. 정답지가 없어도 둘이 서로를 다듬습니다.

돌아가는 순서는 이렇습니다. 처음에는 자리 효과를 대충 찍습니다(예: 모든 자리가 같다). 그 값으로 관련도 모델을 한 걸음 학습시킵니다. 이제 관련도를 대충 알게 됐으니, **같은 관련도를 가진 광고들이 자리에 따라 클릭률이 어떻게 다른지** 봅니다. 그 차이가 자리 효과입니다. 그 값을 갱신하고, 다시 관련도를 학습합니다. 이걸 반복하면 둘이 함께 제자리를 찾아갑니다.

공짜로 얻는 건 아닙니다. 시작점이 나쁘면 엉뚱한 답 한 쌍에서 서로 만족한 채 멈출 수 있습니다(로컬 최적해). "이 광고는 원래 별로다"와 "이 자리는 원래 안 보인다"가 서로를 정당화하는 상태입니다. 그래서 실무에서는 작은 실험으로 자리 효과의 대략적인 모양을 한 번 잡아 초기값으로 넣고, 이후의 변화만 DLA가 따라잡게 합니다.

<div class="chart-arch">
  <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
    <div class="chart-arch-section">
      <div class="chart-arch-section-header">
        <span class="chart-arch-section-title pink">Relevance Model</span>
      </div>
      <div class="chart-arch-grid">
        <div class="chart-arch-node">
          <div class="chart-arch-node-name">입력: 광고, 유저, 쿼리</div>
          <div class="chart-arch-node-desc">P(클릭 | 눈길이 닿다, ad, user, query).</div>
        </div>
        <div class="chart-arch-node">
          <div class="chart-arch-node-name">가중치: 노출 확률 Model이 제공</div>
          <div class="chart-arch-node-desc">1 / P(눈길이 닿다 | position).</div>
        </div>
      </div>
    </div>
    <div class="chart-arch-section">
      <div class="chart-arch-section-header">
        <span class="chart-arch-section-title blue">노출 확률 Model</span>
      </div>
      <div class="chart-arch-grid">
        <div class="chart-arch-node">
          <div class="chart-arch-node-name">입력: 위치 (position)</div>
          <div class="chart-arch-node-desc">P(눈길이 닿다 | position).</div>
        </div>
        <div class="chart-arch-node">
          <div class="chart-arch-node-name">가중치: Relevance Model이 제공</div>
          <div class="chart-arch-node-desc">1 / P(클릭 | 눈길이 닿다).</div>
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
        <div class="chart-arch-node-name">1. Relevance 고정, 노출 확률 업데이트</div>
        <div class="chart-arch-node-desc">현재 Relevance 추정값으로 노출 확률 학습.</div>
      </div>
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">2. 노출 확률 고정, Relevance 업데이트</div>
        <div class="chart-arch-node-desc">현재 노출 확률 추정값으로 Relevance 학습 (IPS).</div>
      </div>
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">3. 반복 수렴</div>
        <div class="chart-arch-node-desc">두 모델이 서로를 점진적으로 개선.</div>
      </div>
    </div>
  </div>
</div>

**핵심 통찰**: 먼저 봐야 누른다는 전제 에서는 클릭 확률이 두 확률의 곱입니다.

$$P(\text{click}) = P(\text{examine}) \times P(\text{relevance})$$

곱으로 이어져 있으니 한쪽을 알면 다른 쪽을 추정할 수 있습니다. DLA는 이 대칭성을 활용하여 두 모델을 번갈아 학습시킵니다.

---

## 6. 광고 시스템에서의 실전 적용

**자리 편향을 얼마나 심각하게 다뤄야 하는지는 광고가 어디서 도는지에 달렸습니다.** 광고 하나만 딱 뜨는 자리라면 위치 편향은 계산에서 거의 무시해도 됩니다. 광고 여러 개가 줄줄이 늘어서는 자리라면 얘기가 다릅니다.

### 열린 RTB(Open RTB) vs 닫힌 생태계에서의 차이

| | 열린 RTB (DSP) | 닫힌 생태계 (네이버/카카오/구글) |
|---|---|---|
| **자리 편향 심각도** | 낮음 (보통 1개 광고만 노출) | 높음 (검색: 3-5개, 피드: 연속 노출) |
| **보정 필요성** | pCTR 정확도에 간접 영향 | 랭킹 공정성에 직접 영향 |
| **노출 확률 추정** | 어려움 (위치가 거의 고정) | 가능 (다양한 위치에 노출) |
| **주요 활용** | Calibration 보정 | 랭킹 모델 학습 + 광고 품질 평가 |

표의 차이는 결국 "내가 위치를 정하는가"로 나뉩니다. 그 질문의 답에 따라 눈길이 닿음 확률을 재는 방법 자체가 달라집니다. 두 무대를 각각 들여다봅시다.

### 열린 RTB에서는 위치를 짐작만 한다 [무대: 열린 RTB]

열린 RTB의 DSP는 자기 광고가 화면 어디에 실렸는지 정확히 알기 어렵습니다. 매체(퍼블리셔)가 슬롯 번호를 성실하게 넘겨주지 않는 경우가 흔하고, 넘겨주는 값도 매체마다 정의가 다릅니다. 그래서 실전에서는 위치를 직접 세는 대신 **뷰어빌리티(viewability)** 신호로 간접 추정합니다. 화면에 몇 초 동안 몇 퍼센트가 보였는지를 재는 IAB 표준 지표입니다. "1위였다"는 못 말해도 "50% 이상 1초 넘게 보였다"는 잴 수 있습니다.

이 간접 추정은 노출 확률 추정 정확도에 그대로 영향을 줍니다. 4절의 표에서 본 것처럼 IPS는 애초에 눈길이 닿음 확률 추정이 틀리면 보정 자체가 틀어집니다. 그래서 열린 RTB의 자리 편향 보정은 랭킹 공정성보다 pCTR을 대략 맞추는 데 머무는 경우가 많습니다.

### 담장 안에서는 위치를 정확히 안다 [무대: 닫힌 생태계]

네이버·카카오·구글처럼 자기 지면에 자기 광고를 싣는 닫힌 생태계는 사정이 다릅니다. 광고가 화면 몇 번째 자리에 실렸는지를 서빙 로그에 그대로 남깁니다. 위치 로그가 100% 정확하니, 1절의 표 같은 노출 확률 추정 실험도 어렵지 않습니다.

더 큰 이점은 **무작위 섞기(randomization)**입니다. 트래픽의 일부를 떼어 광고 순서를 일부러 뒤섞으면, 같은 광고가 여러 위치에 무작위로 노출됩니다. 4절의 파이썬 코드에서 "프로브 광고"로 눈길이 닿음 확률을 추정한 방식이 바로 이것입니다. 실험이라 매출 손실이 따르지만, 그만큼 편향을 직접 재는 가장 확실한 방법입니다. 그래서 닫힌 생태계에서는 자리 편향 보정이 랭킹 모델 학습에 그대로 들어갑니다. 4·5절에서 다룬 IPS·DLA가 실제로 서빙 랭킹을 바꾸는 지점이 여기입니다.

### 자리 편향 외에 보정해야 할 다른 Bias

| Bias | 원인 | 영향 |
|------|------|------|
| **자리 편향** | 위치에 따른 시선 확률 차이 | 상위 광고 품질 과대추정 |
| **Selection Bias** | 모델이 선택한 광고만 노출 | 미노출 광고의 성과를 모름 |
| **Trust Bias** | 상위 결과를 더 신뢰 | 자리 편향과 복합 작용 |
| **Presentation Bias** | 광고 크기, 색상, 이미지 차이 | 시각적 요소가 CTR에 영향 |
| **Context Bias** | 주변 광고의 품질이 영향 | 좋은 광고 사이에 있으면 CTR 하락 |

### 실전 파이프라인

지금까지의 이론을 실무 파이프라인 하나로 이어 붙이면 이렇습니다.

```text
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

1. **자리 편향은 "위치가 만드는 착각"** — 1위 광고의 높은 CTR 중 상당 부분은 광고 품질이 아니라 위치 효과입니다. 보정하지 않으면 Rich-Get-Richer 강화 루프가 발생합니다.

2. **먼저 봐야 누른다는 전제가 핵심 프레임워크** — 관측 CTR = P(눈길이 닿다|position) x P(클릭|눈길이 닿다, ad). 이 분해를 통해 위치 효과와 광고 품질을 분리합니다.

3. **IPS가 가장 실용적인 출발점** — 노출 확률을 추정하고, 클릭에 역수 가중치를 부여합니다. 분산 문제는 Clipping이나 SNIPS로 대응합니다.

4. **DLA는 실험 없이 보정 가능** — Relevance Model과 노출 확률 Model(살 것 같은 정도를 점수로 매기는 모델)을 번갈아 학습시켜, 랜덤 실험 없이도 자리 편향을 추정합니다.

5. **광고 랭킹의 공정성이 곧 매출** — 자리 편향을 보정하면 진짜 좋은 광고가 상위에 노출되고, 유저 클릭률과 광고주 전환율이 모두 올라갑니다. pCTR 모델의 정확도 → 랭킹 공정성 → 비즈니스 성과의 체인입니다.

> 자리 편향은 [닫힌 생태계 포스트](post.html?id=walled-garden)에서 처음 소개했습니다. 거기서 말한 "닫힌 생태계 고유 문제"의 핵심이 바로 이것입니다. 열린 RTB는 보통 광고가 하나만 뜨니 자리 편향이 덜 중요합니다. 하지만 검색·피드처럼 광고 여러 개가 순서대로 뜨는 환경에서는 필수적인 보정입니다.

---

## 더 깊이 보기

- Position Bias 개념이 처음 나온 곳 → [Walled Garden: 담장 안의 광고 생태계](post.html?id=walled-garden)
- 노출 자체가 편향돼 있는 문제(Sample Selection Bias) → [Negative Sampling & Bias](post.html?id=negative-sampling-bias)
- pCTR 모델이 마주하는 또 다른 노출 편향 → [pCTR 예측 모델링](post.html?id=pctr-prediction)
- 위치 편향을 직접 재는 무작위 실험 설계 → [RCT: 무작위 실험](post.html?id=rct-randomized-experiment)
- 밀어주는 자리 없이도 좋은 광고를 찾는 탐색-활용 문제 → [멀티암드 밴딧](post.html?id=mab-summary)
- 광고 ML 전체 지도에서 이 글의 위치 → [ML 엔지니어 트랙](ml-track.html)