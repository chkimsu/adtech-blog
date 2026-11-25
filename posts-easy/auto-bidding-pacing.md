광고주가 「CPA `$10`, 일 예산 `$1,000`」을 설정했다고 해 봅시다. CPA(Cost Per Action)는 전환 한 건을 얻는 데 드는 광고비입니다. 전환은 광고를 본 유저가 구매나 가입처럼 광고주가 바라는 행동까지 하는 일을 말합니다. 이 설정을 받은 DSP(Demand-Side Platform, 광고주를 대신해 광고 자리를 사는 플랫폼)는 하루 동안 수십만 번의 입찰 기회를 만나는데, 기회마다 가장 좋은 입찰가를 정하면서도 하루가 끝나기 전에 예산이 바닥나지 않게 해야 합니다. 이 글은 **자동 입찰(Auto-Bidding)**과 **예산 페이싱(Budget Pacing)**이 이 문제를 어떻게 푸는지 차례로 살펴봅니다. 자동 입찰은 광고주가 정한 목표와 예산에 맞춰 DSP 가 입찰가를 대신 정하는 일입니다. 예산 페이싱(줄여서 페이싱)은 남은 예산과 남은 시간을 비교해 입찰 강도를 조절하거나 입찰을 건너뛰어서 하루 예산을 하루 동안 나눠 쓰게 합니다.

> 「얼마를 부를까」라는 질문은 두 층으로 나뉩니다. 아래층은 경매 한 번에서 가장 좋은 값을 찾고 위층은 광고주의 목표와 예산에 맞춰 그 값을 조정합니다.
> 아래층의 Bid Shading 은 이길 수 있는 만큼만 가치보다 낮춰 부르는 기술입니다. [Bid Shading 포스트](post.html?id=bid-shading-censored)는 한 번의 입찰에서 최적 입찰가 $b^*$ 를 계산하는 방법을 보였습니다. 이 글은 그다음 단계인 위층에서 **수십만 번의 입찰을 하루 예산 안에서 어떻게 배분하는가**를 다룹니다.

---

## 1. 자동 입찰이 풀어야 할 문제

**DSP 는 입찰 요청마다 그 기회의 가치가 얼마인지, 이길 수 있는 최소 가격이 얼마인지, 지금 입찰해도 예산이 괜찮은지에 답해야 합니다. 이 글은 그 가운데 세 번째 질문인 예산 페이싱을 다룹니다. 가상 데이터에서는 같은 하루 예산 100만 원을 시간대별 전환율로 가중해 나눠 쓰자 아침에 몰아 쓸 때보다 CPA 가 29,411원에서 20,260원으로 내려갔습니다.**

### 광고주가 정하는 목표와 DSP 의 일

광고주는 아래 표처럼 몇 줄짜리 단순한 목표만 설정합니다.

| 광고주 입력 | 예시 |
|-----------|------|
| 캠페인 목표 | CPA $10 (전환당 비용) |
| 일일 예산 | $1,000 |
| 타겟 조건 | 한국, 모바일, 25-44세 |
| 기간 | 30일 |

목표는 이렇게 단순하지만 DSP 안에서 이 목표를 지키려면 입찰 요청(Bid Request)이 올 때마다 아래 세 가지 질문에 답해야 합니다. 입찰 요청은 광고 자리 하나가 경매에 나왔으니 값을 불러 달라는 요청입니다.

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
      <div class="chart-step-desc">시장 분포 F(b|x)를 추정하고, 남는 몫(Surplus)를 극대화하는 b*를 계산.</div>
      <span class="chart-step-badge blue">Bid Shading 모델 담당</span>
    </div>
  </div>
  <div class="chart-step">
    <div class="chart-step-indicator">
      <div class="chart-step-dot green">3</div>
    </div>
    <div class="chart-step-content">
      <div class="chart-step-title">지금 입찰해도 예산이 괜찮은가? (예산 페이싱)</div>
      <div class="chart-step-desc">남은 예산과 남은 시간을 비교하여, 입찰 강도를 조절하거나 입찰을 건너뜀.</div>
      <span class="chart-step-badge green">Budget Pacer 담당 &mdash; 이 글의 핵심</span>
    </div>
  </div>
</div>

1번 질문의 가치 V 는 광고를 한 번 보여 줬을 때 기대되는 전환 가치입니다. 이 글은 이 값을 참 가치(True Value)라고도 부릅니다. V 는 모델이 예측한 클릭 확률 [pCTR](post.html?id=pctr-prediction)에 클릭한 유저가 전환할 확률 [pCVR](post.html?id=pcvr-modeling)과 전환 한 건의 가치 ConvValue 를 곱해 구합니다. 이렇게 구한 값을 광고 사이의 순위로 바꾸는 규칙은 [eCPM](post.html?id=ecpm-ranking)(노출 1,000번당 기대 수익)입니다.

2번 질문의 시장 분포 $F(b \mid x)$ 는 요청의 조건이 $x$ 일 때 입찰가 $b$ 로 경매에서 이길 확률을 알려 줍니다. 남는 몫(Surplus)은 그 기회의 가치에서 실제로 낸 값을 뺀 값입니다. Bid Shading 은 이 남는 몫 $V - b$ 에 이길 확률 $F(b \mid x)$ 를 곱한 값이 가장 커지는 입찰가 $b^*$ 를 계산합니다.

1번과 2번 질문은 이전 포스트들에서 다뤘습니다. 이 글은 그림에서 Budget Pacer(예산 페이싱 모듈)가 담당하는 **3번 질문, 예산 페이싱**에 집중합니다.

### Bid Shading 과 예산 페이싱의 범위 차이

Bid Shading 과 예산 페이싱은 둘 다 「입찰 최적화」에 속하지만 **최적화하는 대상과 시간 범위가 근본적으로 다릅니다**. 아래 표의 첫 줄처럼 Bid Shading 은 경매 1건을 미시적으로, 예산 페이싱은 하루 전체의 입찰을 거시적으로 최적화합니다.

| 구분 | Bid Shading | 예산 페이싱 (PID) |
|------|-------------|---------------------|
| **최적화 스코프** | 개별 경매 1건 (미시적) | 하루 전체 입찰 (거시적) |
| **풀고 있는 질문** | "이 경매에서 얼마에 입찰해야 남는 몫이 최대인가?" | "지금 입찰해도 하루 예산이 버틸 수 있는가?" |
| **핵심 수식** | $b^* = \arg\max (V - b) \cdot F(b \mid x)$ | $\lambda_{t+1} = \lambda_t + K_p \cdot e_t + K_i \cdot \sum e$ |
| **입력** | 시장 가격 분포 $F(b \mid x)$, 참 가치(True Value) $V$ | 남은 예산, 남은 시간, 현재 소비 속도 |
| **출력** | 최적 입찰가 $b^*$ | 입찰 강도 배수 $\lambda$ |
| **없으면 생기는 문제** | 1st Price 경매에서 매번 과다 지불 | 오전에 예산 소진, 오후 최적 시간대 놓침 |

표의 예산 페이싱 열 괄호 안에 있는 PID 는 3절에서 자세히 다룰 제어 방식입니다. 그 열의 수식대로 지금 배수 $\lambda_t$ 에 오차 $e_t$ 와 지금까지 쌓인 오차의 합 $\sum e$ 를 각각 계수 $K_p$, $K_i$ 와 곱해 더하면 다음 배수 $\lambda_{t+1}$ 이 나옵니다. 오차 $e_t$ 는 목표 소진 속도(시간당 써야 할 금액)에서 실제 소진 속도를 뺀 값입니다. 표의 마지막 줄에 나오는 1st Price 경매는 이긴 입찰자가 자기가 부른 값을 그대로 내는 경매입니다. 그래서 Bid Shading 없이 가치대로 부르면 매번 필요보다 많이 냅니다.

실제 파이프라인에서는 **두 모듈이 직렬로 연결**되어 아래 순서로 최종 입찰가를 만듭니다.

1. 먼저 **Bid Shading** 이 경매 한 건의 최적 입찰가 $b^*$ 를 계산합니다.
2. 이어서 **Budget Pacer** 가 지금의 예산 상황을 보고 입찰 강도 배수 $\lambda$(pacing multiplier)를 정합니다.
3. 두 값을 곱한 $b^* \times \lambda$ 가 **최종 입찰가**입니다. 예산이 빨리 줄면 $\lambda < 1$ 로 입찰을 억제하고 여유가 있으면 $\lambda > 1$ 로 더 공격적으로 부릅니다.

> Bid Shading 없이 페이싱만 있으면 경매 한 건 한 건에서 매번 과다 지불합니다. 거꾸로 페이싱 없이 Bid Shading 만 있으면 하루 예산이 시간대에 고르게 나뉘지 않습니다. 그래서 **두 모듈이 모두 있어야 입찰 최적화가 완전해집니다**.

Bid Shading 의 자세한 동작은 [Bid Shading 포스트](post.html?id=bid-shading-censored)에서 다룹니다. 그 글은 경매에서 졌을 때 경쟁자가 얼마를 불렀는지 보이지 않아 「내 입찰가보다 높았다」는 사실만 남는 Censored Data 와 그 데이터로 시장 분포를 추정하는 방법, 남는 몫을 가장 크게 만드는 입찰가 계산을 설명합니다. 이 절의 나머지와 다음 절부터는 예산 페이싱만 봅니다.

### 예산 페이싱이 필요한 이유

페이싱이 없으면 DSP 가 기회가 오는 대로 입찰하므로 하루 예산은 먼저 들어온 기회부터 쓰입니다. 하루 예산 1,000달러를 페이싱 없이 쓸 때와 페이싱을 적용할 때를 시간대별로 나란히 놓으면 아래 표와 같습니다.

| 시간 | 입찰 기회 | 페이싱 없음 | 페이싱 적용 |
|------|---------|------------|------------|
| 00:00 - 06:00 | 적음 (새벽) | 기회가 오면 무조건 입찰 | 기회가 오면 적극 입찰 |
| 06:00 - 12:00 | 보통 | 높은 가격에도 입찰 | 적정 가격에 입찰 |
| 12:00 - 14:00 | 많음 (점심) | **예산 소진** | 약간 보수적 입찰 |
| 14:00 - 18:00 | 많음 (최고) | 입찰 불가 (예산 없음) | 정상 입찰 유지 |
| 18:00 - 24:00 | 보통 | 입찰 불가 | 남은 예산 소진 |
| **결과** | | 오전에 예산 소진, **오후 최적 시간대 놓침** | 하루 전체에 걸쳐 균등하게 노출 |

표를 따라가 보면 페이싱이 없을 때 새벽에는 기회가 오는 대로, 오전에는 가격이 높아도 입찰하다가 기회가 많은 점심(12:00 - 14:00)에 예산이 바닥납니다. 그래서 기회가 가장 많은 14:00 - 18:00 와 그 뒤 저녁에는 예산이 없어 입찰하지 못합니다. 페이싱을 적용하면 새벽에는 적극 입찰, 오전에는 적정 가격 입찰, 점심에는 약간 보수적인 입찰로 속도를 조절해 오후에도 정상 입찰을 유지하고 18:00 - 24:00 에 남은 예산을 다 써서 하루 전체에 고르게 노출됩니다. 오후 14-18시는 전환율이 가장 높은 시간대인 경우가 많은데, 페이싱 없이 오전에 예산을 다 쓰면 바로 그 시간대에 입찰하지 못해 **가장 좋은 기회를 놓칩니다**.

### 가상 데이터로 비교하는 배분안 세 가지

하루 예산으로 시장의 클릭을 다 살 수 없으면 어느 시간대의 클릭을 살지 골라야 하는데, 고르는 방식에 따라 같은 예산으로 얻는 전환 수가 달라집니다. 아래 **가상 데이터**로 하루 예산 100만 원을 세 방식으로 나눠 봅니다. 클릭 단가(클릭 한 번에 내는 값)는 500원으로 고정했습니다. 하루는 4시간씩 6구간으로 나눴고 구간마다 트래픽 비중(하루 시장 물량 가운데 그 구간에 있는 몫)과 전환율(클릭이 전환으로 이어지는 비율)만 다르게 두었습니다. 100만 원을 클릭 단가 500원으로 나누면 2,000클릭이라 예산으로는 시장 물량 4,000클릭의 절반만 살 수 있습니다.

| 시간대 | 트래픽 비중 | 전환율 |
|---|---|---|
| 00-04 | 5% | 0.8% |
| 04-08 | 10% | 1.0% |
| 08-12 | 20% | 1.6% |
| 12-16 | 25% | 2.6% |
| 16-20 | 25% | **3.2%** |
| 20-24 | 15% | 1.8% |

같은 예산 100만 원이라도 **어느 절반을 고르느냐**에 따라 성과가 달라집니다. 아래 코드는 표의 값으로 세 배분안을 돌려 소진, 전환, CPA 를 비교합니다.

- (a) 아침 몰아쓰기는 이른 구간부터 살 수 있는 만큼 사다가 예산이 떨어지면 멈춥니다.
- (b) 균등은 예산을 6구간에 똑같이 나눕니다.
- (c) 전환율 가중은 구간의 가치를 트래픽 비중 × 전환율로 보고 그 비율대로 나눕니다.

어느 배분안이든 구간마다 시장에 있는 클릭 수(시장 물량 4,000클릭 × 트래픽 비중)보다 많이 살 수는 없습니다.

```python
# 하는 일: 같은 하루 예산 100만 원을 시간대 6구간에 아침 몰아쓰기, 균등, 전환율 가중 셋으로 나눠 쓰고 전환과 CPA 를 비교한다.
# 1단계: 예산과 시간대 구간을 둔다
# 예산으로 살 수 있는 클릭은 2,000개이고, 구간마다 시장에 있는 클릭에 상한이 있다.
BUDGET, CPC, SUPPLY = 1000000, 500, 4000   # 예산 100만 원, 클릭 단가 500원, 시장 물량 4천 클릭
# 가상 데이터: (트래픽 비중, 전환율) — 위 표와 같은 값
SLOTS = [(0.05, 0.008), (0.10, 0.010), (0.20, 0.016),
         (0.25, 0.026), (0.25, 0.032), (0.15, 0.018)]
BUYABLE = BUDGET / CPC                  # 예산으로 살 수 있는 클릭 = 2,000
CAP = [SUPPLY * s[0] for s in SLOTS]    # 구간마다 시장에 있는 클릭 상한

# 2단계: 아침 몰아쓰기로 나눈다
# 이른 구간부터 살 수 있는 만큼 사고, 예산이 떨어지면 끝낸다.
left, rush = BUYABLE, []
for cap in CAP:
    rush.append(min(cap, left))
    left -= rush[-1]

# 3단계: 시간대 균등으로 나눈다
# 예산을 6등분한다. 새벽엔 살 물량이 없어 상한에 걸린다.
even = [min(cap, BUYABLE / 6) for cap in CAP]

# 4단계: 전환율 가중으로 나눈다
# 구간 가치를 트래픽 비중 x 전환율로 보고, 그 비율대로 나눈다.
w = [s[0] * s[1] for s in SLOTS]
smart = [min(cap, BUYABLE * wi / sum(w)) for cap, wi in zip(CAP, w)]

# 5단계: 세 방식의 소진, 전환, CPA 를 찍는다
for name, clicks in [("(a) 아침 몰아쓰기", rush), ("(b) 균등", even), ("(c) 가중", smart)]:
    spend = sum(clicks) * CPC
    conv = sum(c * s[1] for c, s in zip(clicks, SLOTS))  # 클릭 x 그 구간 전환율
    print("%s 소진 %.1f%% / 전환 %.1f건 / CPA %d원"
          % (name, spend / BUDGET * 100, conv, spend / conv))

# 출력:
# 5단계 뜻: 세 방식이 예산을 거의 다 쓰지만, 전환율 가중이 전환 49.4건으로 가장 많고 CPA 도 20260원으로 가장 낮다. 균등은 새벽 상한에 걸려 93.3% 만 쓴다.
# (a) 아침 몰아쓰기 소진 100.0% / 전환 34.0건 / CPA 29411원
# (b) 균등 소진 93.3% / 전환 35.6건 / CPA 26217원
# (c) 가중 소진 100.0% / 전환 49.4건 / CPA 20260원
```

찍힌 세 줄에서 소진은 예산 가운데 쓴 비율입니다. 세 배분안 모두 예산을 거의 다 쓰는데도 전환 수는 다릅니다. 아침 몰아쓰기는 00-04 구간부터 차례로 사다가 12-16 구간에서 2,000클릭을 다 채우므로, 전환율 3.2% 인 16-20 구간(저녁)과 20-24 구간에서는 한 클릭도 사지 못합니다. 그래서 예산을 100.0% 쓰고도 전환이 34.0건이고 CPA 는 100만 원을 34.0건으로 나눈 29,411원입니다. 균등은 2,000클릭을 6구간에 똑같이 나누는데, 트래픽 비중 5% 인 00-04 구간(새벽)에는 시장에 4,000클릭의 5% 인 200클릭밖에 없어 새벽 몫을 다 사지 못합니다. 그 결과 예산의 6.7% 가 남아 소진이 93.3% 에 그치고 전환은 35.6건입니다.

아침 몰아쓰기와 균등의 전환이 34건 대 35.6건으로 거의 같다는 데 함정이 있습니다. 몰아쓰기는 예산을 다 쓰지만 전환율 3.2% 인 저녁을 못 사고 균등은 살 물량이 없는 새벽 몫 6.7% 를 남기므로, 예산을 고르게 나누는 것만으로는 몰아쓰기보다 크게 나아지지 않습니다. 전환율로 가중하면 트래픽 비중 25% 에 전환율 3.2% 인 16-20 구간이 가장 큰 몫을 받아 같은 100만 원으로 전환이 49.4건으로 가장 많아집니다. CPA 는 아침 몰아쓰기의 29,411원에서 20,260원으로 내려갑니다.

---

## 2. 예산 페이싱의 두 가지 접근법

**예산 페이싱의 방식은 크게 두 가지로, 입찰 기회 일부를 무작위로 건너뛰는 Throttling 과 입찰가에 배수 $\lambda$ 를 곱하는 Bid Modification 입니다. 프로덕션에서는 대부분 Bid Modification 을 씁니다.**

예산이 하루가 끝나기 전에 바닥나는 일을 막으려면 입찰의 양이나 강도를 시간에 맞춰 조절해야 하는데, 그 방법이 크게 두 가지입니다. 아래 카드 두 장에서는 두 방식이 무엇을 조절하고 어디에 쓰이는지 보면 됩니다.

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

카드 A 의 Throttling(확률적 참여)은 입찰 참여 확률 p 를 정해 그 확률만큼만 입찰하는 방식입니다. p=0.5 이면 입찰 기회의 50% 에만 참여합니다. 이렇게 입찰 기회 자체를 걸러 내는 방식은 구현이 단순하고 계산 비용이 낮은 것이 장점입니다. 단점은 버릴 기회를 무작위로 정하므로 좋은 기회도 함께 버린다는 점입니다. 주로 대규모 트래픽을 빠르게 조절할 때 씁니다.

카드 B 의 Bid Modification(입찰가 조절)은 Bid Shading 이 정한 입찰가 $b^*$ 에 pacing multiplier $\lambda$ 를 곱하는 방식입니다. $\lambda = 0.8$ 이면 입찰가가 20% 내려갑니다. 장점은 좋은 기회에 여전히 참여해 가치를 기준으로 판단한다는 점입니다. 단점은 입찰가가 낮아져 Win Rate(승률, 입찰한 경매 가운데 이긴 비율)가 떨어지고 $\lambda$ 를 따로 최적화해야 한다는 점입니다. 카드 아래 태그처럼 $\lambda$ 를 정하는 방법으로는 3절의 PID Controller, 4절의 Lagrangian, 6절의 RL 이 있습니다.

대부분의 프로덕션 DSP 가 쓰는 **Bid Modification** 은 모든 입찰에 참여하면서 강도만 $\lambda$ 로 조절하므로, 좋은 기회를 버리지 않으면서도 예산을 하루에 걸쳐 나눠 쓸 수 있습니다.

### 최종 입찰가 공식

1절에서 본 두 모듈의 직렬 연결을 식 하나로 쓰면 아래와 같습니다.

$$b_{\text{final}} = \underbrace{b^*}_{\text{Bid Shading}} \times \underbrace{\lambda}_{\text{Pacing Multiplier}}$$

- $b^* < V$: Bid Shading 이 참 가치 $V$ 보다 낮게 계산한 최적 입찰가입니다(이전 포스트).
- $\lambda \in (0, 1]$: Budget Pacer 가 예산 상황에 따라 0 보다 크고 1 이하인 범위에서 정합니다.
  - $\lambda = 1.0$: 예산에 여유가 있어 원래 입찰가를 그대로 씁니다.
  - $\lambda = 0.7$: 예산이 부족해 입찰가를 30% 낮춥니다.
  - $\lambda = 0.3$: 예산이 위기라 입찰가를 70% 낮추며 입찰을 거의 포기합니다.

$\lambda$ 가 0.7 이면 최종 입찰가가 $b^*$ 의 0.7배라서 1 − 0.7 = 0.3, 곧 30% 만큼 낮아집니다.

---

## 3. PID Controller 로 하는 예산 페이싱

**PID Controller 는 목표 소진 속도와 실제 소진 속도의 차이(오차)를 보고 목표보다 많이 쓰면 $\lambda$ 를 내리고 적게 쓰면 올리는 제어 방식입니다. 오차에 곱하는 계수를 잘못 잡은 예시 코드에서는 $\lambda$ 가 6시에 1.0 에서 0.1 로 떨어지고 하루가 끝날 때 예산의 85.6% 만 씁니다.**

2절의 Bid Modification 을 쓰려면 $\lambda$ 를 언제 얼마나 고칠지 정하는 규칙이 있어야 합니다. 가장 널리 쓰는 방식은 **PID Controller** 입니다. 제어 이론(장치의 출력을 목표값에 맞추는 방법을 다루는 공학 분야)에서 빌려 온 방법으로, 목표값과 현재값의 차이인 오차를 보고 조절합니다. PID 라는 이름은 이 방식이 쓰는 세 항인 비례(P), 적분(I), 미분(D)의 머리글자입니다.

### 오차를 보고 배수를 고치는 원리

PID 는 원래 온도 조절기 같은 제어 장치에 쓰는 방법으로, 목표 온도를 정해 두면 지금 온도와 목표의 차이만큼 세기를 올리거나 내립니다. Budget Pacer 도 같은 계산을 하는데 측정하는 값은 소진 속도 하나뿐입니다. 시간당 목표보다 많이 쓴 구간 다음에는 $\lambda$ 를 내리고 적게 쓴 구간 다음에는 올립니다. 아래 그림은 이 과정을 목표 설정, 오차 측정, PID 조절, 출력의 4단계로 보여 줍니다.

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
        <div class="chart-arch-node-desc"><code>$1,000</code> / 24h = <code>$41.67</code>/h</div>
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
      <span class="chart-arch-section-title" style="color:var(--accent-secondary);">출력</span>
    </div>
    <div class="chart-arch-grid">
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">&lambda;(t+1) = clamp(&lambda;(t) + K_p×e + K_i×&Sigma;e + K_d×&Delta;e, 0.1, 1.0)</div>
        <div class="chart-arch-node-desc">다음 구간의 pacing multiplier 결정</div>
      </div>
    </div>
  </div>
</div>

그림 1단계의 이상적 소진율(target_spend_rate)은 목표 소진 속도로, 일 예산을 24시간으로 나눈 값이라 일 예산이 1,000달러면 시간당 41.67달러입니다. 2단계에서는 매 시간이나 매 분 목표 소진 속도에서 실제 소진 속도를 뺀 error(t) 를 측정합니다. error(t) 가 양수면 목표보다 덜 쓴 것이라 $\lambda$ 를 올리고 음수면 목표보다 더 쓴 것이라 $\lambda$ 를 내립니다. 그림은 두 경우를 각각 「예산 여유」와 「예산 초과」로 적었습니다. 3단계의 P, I, D 는 바로 아래 공식의 세 항입니다. 4단계의 clamp 는 계산한 값이 0.1 보다 작으면 0.1 로, 1.0 보다 크면 1.0 으로 자르는 함수입니다. 그래서 다음 구간의 $\lambda$ 는 늘 0.1 과 1.0 사이에 있습니다.

### PID 공식

그림 4단계의 식을 일반형으로 쓰면 아래와 같습니다.

$$\lambda(t+1) = \text{clamp}\Big(\lambda(t) + K_p \cdot e(t) + K_i \cdot \sum_{\tau=0}^{t} e(\tau) + K_d \cdot \big(e(t) - e(t-1)\big), \; \lambda_{\min}, \; \lambda_{\max}\Big)$$

$K_p$, $K_i$, $K_d$ 는 세 항에 곱하는 계수로, 값이 클수록 같은 오차에도 $\lambda$ 가 크게 움직입니다. $\lambda_{\min}$ 과 $\lambda_{\max}$ 는 clamp 의 하한과 상한입니다. $\sum_{\tau=0}^{t} e(\tau)$ 는 처음부터 지금까지의 오차를 모두 더한 누적 오차이고 $e(t) - e(t-1)$ 은 직전 구간보다 오차가 얼마나 바뀌었는지를 나타냅니다.

| 항 | 역할 | 예시 |
|---|------|------|
| $K_p \cdot e(t)$ | **현재 오차** 비례 조절 | 지금 예산을 많이 쓰면 즉시 $\lambda$ 하향 |
| $K_i \cdot \sum e$ | **누적 오차** 보정 | 계속 목표보다 적게 쓰면 서서히 $\lambda$ 상향 |
| $K_d \cdot \Delta e$ | **오차 변화율** 반영 | 급격히 소진율이 변하면 빠르게 대응 |

P 항은 지금의 오차에 비례해 바로 반응하므로 지금 예산을 많이 쓰면 $\lambda$ 를 즉시 내립니다. I 항은 쌓인 오차에 반응해서 한동안 목표보다 계속 적게 쓰면 $\lambda$ 를 서서히 올리는데, 그림은 이 항의 역할을 오래 한쪽으로 치우친 오차, 곧 장기 편향을 없애는 일로 적었습니다. D 항은 오차가 변하는 속도에 반응하므로 소진 속도가 갑자기 바뀌면 빠르게 대응합니다. 그림에는 이 항의 역할이 진동 방지라고 적혀 있습니다.

### 하루 동안의 페이싱 동작 예시

아래 표는 하루 예산 1,000달러로 몇 시간마다 $\lambda$ 를 고친 예시입니다. 목표소진은 하루 내내 시간당 41.7달러이고 error 는 목표소진에서 실제소진을 뺀 값입니다. 마지막 열에는 그 error 를 보고 $\lambda$ 를 어떻게 고쳤는지 적었습니다.

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
24:00  $5       -         -        -       하루 종료, 예산 99.5% 소진 
```

00:00 에는 실제소진이 시간당 30달러로 목표 41.7달러보다 적어 error 가 41.7 − 30 = 11.7 로 양수입니다. 하지만 $\lambda$ 가 이미 상한인 1.0 이라 그대로 둡니다. 06:00 에는 실제소진이 시간당 55달러로 목표보다 많아 error 가 41.7 − 55 = −13.3 으로 음수라서 $\lambda$ 를 1.0 에서 0.82 로 내립니다. 그 뒤로 error 가 0 에 가까워지면서 $\lambda$ 는 0.78 과 0.86 사이에서 조금씩만 움직입니다. 24:00 에는 1,000달러 가운데 5달러만 남아 예산의 99.5% 를 썼습니다.

**PID Controller 는 이렇게 매 시간(또는 매 분) 오차를 측정해 $\lambda$ 를 조절하므로 하루가 끝날 때 예산을 거의 정확히 다 씁니다.**

아래 코드는 같은 PID 계산을 하루 예산 1,000달러로 24시간 동안 돌립니다. 계수는 Kp=0.04, Ki=0.01, Kd=0.02 입니다. 트래픽은 6시부터 14시까지 1.2배, 나머지 시간은 0.8배라 같은 $\lambda$ 에서도 낮에 더 많이 씁니다. 시간마다 쓰는 금액에는 무작위 잡음도 더해집니다. 출력은 6시간마다 찍은 잔여 예산과 $\lambda$ 입니다.

```python
# 하는 일: PID 컨트롤러로 하루 예산 1,000달러의 소진 속도를 시간마다 조절하는 과정을 시뮬레이션한다.
import numpy as np

# 1단계: PID 페이싱 함수를 만든다
# 시간마다 목표 소진 속도와 실제 소진의 차이를 오차로 보고, 그 오차로 입찰 배수 λ 를 고친다.
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

# 2단계: seed 를 고정하고 돌린다
# 6시간마다 잔여 예산과 λ 를 찍는다.
np.random.seed(42)
pid_pacing_simulation()

# 출력:
# 2단계 뜻: 6시에는 λ 가 0.100 까지 떨어지고, 18시에는 1.000 으로 돌아온다. 하루가 끝날 때 소진율은 85.6% 로, 예산을 다 쓰지 못한다.
#   t= 0h  잔여=$   964  λ=1.000
#   t= 6h  잔여=$   732  λ=0.100
#   t=12h  잔여=$   505  λ=0.949
#   t=18h  잔여=$   303  λ=1.000
#   최종 소진율: 85.6%
```

찍힌 값은 PID 가 **잘 도는 예가 아닙니다**. 최종 소진율이 85.6% 라 하루 예산 1,000달러 가운데 144달러가 쓰이지 않고 남았습니다. $\lambda$ 는 t=0h 에 1.000 이었다가 오차를 달러 단위 그대로 계수에 곱한 탓에 t=6h 에 하한인 0.100 까지 급락한 뒤 t=12h 에 0.949, t=18h 에 1.000 으로 돌아옵니다. $\lambda$ 는 0.1 과 1.0 사이를 오가는 배수인데 오차는 달러로 측정되므로, 0.04 같은 작은 계수를 곱해도 $\lambda$ 가 한 번에 크게 움직일 수 있습니다. 오차를 예산 대비 비율로 바꾸고 계수 $K$ 값을 작게 잡으면 $\lambda$ 가 이렇게 크게 오르내리는 진동이 잦아듭니다. 실제 튜닝은 이 글의 범위를 넘으므로 여기서는 $K$ 를 잘못 잡으면 이렇게 된다는 예로 남겨 둡니다.

---

## 4. Lagrangian Dual 로 푸는 이론적 접근

**Lagrangian Dual 은 예산 제약을 승수 $\mu$(예산의 기회비용)로 바꿔 최적 입찰을 수학적으로 유도합니다. $\mu$ 는 $\lambda = 1/(1+\mu)$ 로 PID 의 $\lambda$ 와 이어져 같은 역할을 합니다. 예시 코드에서 $\mu$ 는 3.775 에서 4.164 사이를 오가고 $\lambda$ 는 0.2 안팎에 머뭅니다.**

PID 가 오차를 보고 $\lambda$ 를 경험적으로 조절한다면 **Lagrangian Dual** 방식은 같은 문제를 수식으로 쓰고 최적해를 수학적으로 유도합니다. Lagrangian Dual(라그랑주 쌍대)은 제약을 승수와 곱해 목적함수에 넣은 다음 그 승수를 조정해 가며 푸는 방식입니다. 이 절에서는 그 승수 $\mu$ 를 고치는 일이 PID 에서 $\lambda$ 를 고치는 일에 해당합니다.

### 문제 정의

$$\max_{\{b_i\}} \sum_{i=1}^{N} V_i \cdot \mathbb{1}[\text{win}_i] \quad \text{s.t.} \quad \sum_{i=1}^{N} b_i \cdot \mathbb{1}[\text{win}_i] \leq B$$

- $V_i$ 는 $i$번째 입찰 기회의 참 가치입니다.
- $b_i$ 는 $i$번째 입찰가입니다.
- $B$ 는 하루 예산을 뜻합니다.
- $\mathbb{1}[\text{win}_i]$ 는 $i$번째 경매에서 이기면 1 이고 지면 0 인 표시 함수입니다.
- $N$ 은 하루에 들어오는 입찰 기회의 수를 나타냅니다.

식을 말로 옮기면 「일 예산 $B$ 안에서 총 전환 가치를 극대화하라」입니다. 이긴 경매의 입찰가 합이 $B$ 를 넘지 않는 범위에서 이긴 경매의 가치 합이 가장 커지도록 입찰가 $b_i$ 들을 고르라는 뜻입니다.

### Lagrangian Relaxation

Lagrangian Relaxation(라그랑주 완화)은 제약식에 승수를 곱해 목적함수 안으로 옮기는 방법입니다. 여기서는 예산 제약을 라그랑주 승수 $\mu$ 로 완화합니다.

$$\mathcal{L} = \sum_{i=1}^{N} V_i \cdot \mathbb{1}[\text{win}_i] - \mu \cdot \Big(\sum_{i=1}^{N} b_i \cdot \mathbb{1}[\text{win}_i] - B\Big)$$

식의 앞부분은 원래 목적인 이긴 경매의 가치 합입니다. 뒷부분은 이긴 경매의 입찰가 합에서 예산 $B$ 를 뺀 값에 $\mu$ 를 곱해 빼므로, 예산을 넘겨 쓸수록 $\mathcal{L}$ 이 작아집니다. 이 식의 최적 조건에서 입찰 기회마다 수정된 가치는 아래와 같습니다.

$$V_i^{\text{adj}} = V_i - \mu \cdot b_i$$

수정된 가치는 원래 가치 $V_i$ 에서 그 입찰에 쓰는 돈 $b_i$ 의 기회비용 $\mu b_i$ 를 뺀 값입니다. $\mu$ 가 바로 **예산의 기회비용(shadow price)**으로, 돈 1단위를 이 경매에 쓰느라 포기하는 다른 기회의 가치를 뜻합니다.

| $\mu$ 값 | 의미 | 입찰 행동 |
|----------|------|---------|
| $\mu \approx 0$ | 예산 제약이 느슨 | $V_i^{\text{adj}} \approx V_i$ → 적극 입찰 |
| $\mu$ 크다 | 예산 제약이 빡빡 | $V_i^{\text{adj}} \ll V_i$ → 높은 가치만 선별 입찰 |

표처럼 $\mu$ 가 0 에 가까우면 예산 제약이 느슨해 수정된 가치가 원래 가치와 거의 같으므로 적극 입찰합니다. $\mu$ 가 크면 예산 제약이 빡빡해 수정된 가치가 원래 가치보다 훨씬 작아지므로 가치가 높은 기회만 골라 입찰합니다.

### PID 와 Lagrangian 의 관계

실은 PID 의 $\lambda$ 와 Lagrangian 의 $\mu$ 는 같은 역할을 하고 둘 사이에는 아래 관계가 있습니다.

$$\lambda = \frac{1}{1 + \mu}$$

- $\mu = 0$ 이면 예산에 여유가 있는 상황이라 $\lambda = 1/(1+0) = 1.0$ 이고 입찰가를 다 부르는 풀 입찰을 합니다.
- $\mu = 1$ 이면 예산이 부족한 상황이라 $\lambda = 1/(1+1) = 0.5$ 이고 반값으로 입찰합니다.
- $\mu \to \infty$ 이면 예산이 위기인 상황이라 $\lambda \to 0$ 이 되어 입찰을 포기합니다.

:::deep 더 깊이 — 1/(1+μ) 꼴이 나오는 이유

문제 정의의 식은 이긴 경매의 전환 가치만 목적함수로 최대화하고 낸 돈은 제약에만 넣었습니다. 여기에 「내가 낸 돈도 비용」이라는 생각을 넣어 $\sum (V_i - b_i)$ 를 최대화하면 낙찰 하나에서 $b_i$ 항이 두 번 빠집니다. 한 번은 실제로 낸 돈 $b_i$ 이고 다른 한 번은 그 돈을 이 경매에 쓰느라 포기한 다른 기회의 값 $\mu b_i$ 입니다. 그래서 낙찰 하나의 순기여는 $V_i - (1+\mu) b_i$ 가 됩니다. 이 순기여가 0 이 되는 입찰가 $V_i / (1+\mu)$ 가 손해 없이 부를 수 있는 상한입니다. 가치 $V_i$ 를 그대로 부르는 원래 입찰가에 $1/(1+\mu)$ 를 곱한 것과 같은 결과라서 $\lambda = 1/(1+\mu)$ 가 나옵니다.
:::

PID 처럼 $\lambda$ 를 경험으로 맞춰 가는 방식과 Lagrangian 처럼 $\mu$ 를 수식으로 푸는 방식은 출발점이 다르지만 **결과적으로 같은 곳에 수렴합니다**.

아래 코드는 $\mu$ 를 라운드마다 고쳐 $\lambda$ 를 정하는 Lagrangian Dual 페이싱을 100라운드 돌립니다. 하루 예산 1,000달러를 100라운드로 나눴으므로 목표 지출은 라운드마다 10달러입니다. 지출은 그 라운드에 들어온 입찰(80건 이상 120건 미만)마다 값에 $\lambda$ 를 곱해 더한 합입니다. 지출이 목표를 넘으면 학습률 0.05 에 초과분을 곱한 만큼 $\mu$ 를 올려 입찰을 보수적으로 만들고 모자라면 같은 방식으로 $\mu$ 를 내려 더 적극 입찰하게 만듭니다. 코드 주석은 이 갱신을 Subgradient 라고 적었는데, Subgradient 는 미분할 수 없는 점에서도 쓸 수 있도록 기울기를 넓힌 개념입니다. $\mu$ 는 0 아래로 내려가지 않습니다. 출력은 25라운드마다 찍은 $\mu$, $\lambda$, 지출입니다.

```python
# 하는 일: 예산의 기회비용(shadow price) μ 를 라운드마다 고쳐 입찰 배수 λ 를 정하는 Lagrangian Dual 페이싱을 100라운드 돌린다.
import numpy as np

# 1단계: Lagrangian Dual 갱신 함수를 만든다
# μ 는 예산의 shadow price 이고 λ = 1 / (1 + μ) 다. 라운드 지출이 목표를 넘으면 μ 를 올리고, 남으면 내린다.
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

# 2단계: seed 를 고정하고 돌린다
# 25라운드마다 μ, λ, 지출을 찍는다.
np.random.seed(42)
lagrangian_dual_update()

# 출력:
# 2단계 뜻: 25라운드마다 찍은 μ 는 3.775 에서 4.164 사이이고, λ 는 0.2 안팎이다. 지출은 목표 $10.0 위아래로 $9.4 에서 $12.3 사이를 오가고, 끝에 λ 는 0.194 다.
#   Round  25: μ=3.933, λ=0.205, 지출=$11.2 (목표=$10.0)
#   Round  50: μ=3.795, λ=0.207, 지출=$9.4 (목표=$10.0)
#   Round  75: μ=3.775, λ=0.215, 지출=$12.3 (목표=$10.0)
#   Round 100: μ=4.164, λ=0.198, 지출=$12.1 (목표=$10.0)
#   최종: μ=4.164 → λ=0.194
```

찍힌 값을 보면 $\mu$ 는 25라운드마다 3.933, 3.795, 3.775, 4.164 로 3.775 에서 4.164 사이를 오가고 $\lambda$ 는 0.205, 0.207, 0.215, 0.198 로 0.2 안팎입니다. 지출은 목표 10.0달러 위아래로 9.4달러에서 12.3달러 사이를 오갑니다. 25라운드처럼 지출이 11.2달러로 목표보다 많으면 $\mu$ 를 올리고 50라운드처럼 9.4달러로 목표보다 적으면 $\mu$ 를 내립니다. 마지막 $\mu$ 4.164 를 $\lambda = 1/(1+\mu)$ 에 넣으면 $\lambda = 1/(1 + 4.164) = 0.194$ 입니다. 지출은 $\lambda$ 에 비례하므로 이 시뮬레이션에서 $\lambda$ 를 0.2 안팎이 아니라 1 로 두면 지출이 목표를 크게 넘습니다.

---

아래 데모에서는 한 캠페인에 예산을 몰아줄 때 전체 성과가 어떻게 바뀌는지 곡선으로 보면 됩니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-portfolio.html?embed=1" height="580" loading="lazy" title="예산 배분 미니 데모"></iframe>
<a class="demo-embed-open" href="demo-portfolio.html" target="_blank" rel="noopener">↗ 전체 데모로 열기 (가이드 투어 포함)</a>
</div>

이 데모는 여러 캠페인에 한정된 예산을 나누는 문제를 직접 만져 보게 합니다. 한계 효용은 예산을 조금 더 줄 때 늘어나는 효과인데, 한 캠페인에 예산을 몰아줄수록 그 캠페인의 한계 효용이 떨어지므로 **한 곳에 몰아주면 전체가 손해**라는 것이 곡선으로 보입니다. 앞 절의 페이싱이 하루의 시간대 사이에서 예산을 나눴다면 이 데모는 같은 일을 캠페인 사이에서 합니다.

## 5. 이론과 프로덕션 사이의 실전 고려사항

**이론과 프로덕션 사이에는 간극이 있어서 프로덕션에서는 네 가지를 더 봅니다. 목표 CPA 를 낮출 때 물량이 사라지는 문제, 페이싱이 기대는 트래픽 예측, 같은 DSP 안의 캠페인끼리 벌이는 내부 경쟁, $\lambda$ 를 고치는 주기입니다. 가상 데이터에서 목표를 6,000원에서 3,000원으로 낮추자 승률은 50.4% 에서 18.8% 로, 소진율은 100% 에서 46.4% 로 떨어졌습니다.**

실제 시스템에서는 목표를 얼마로 잡는지와 트래픽 예측이 맞는지, 캠페인끼리 어떻게 겨루는지에 따라 결과가 달라집니다.

### 목표 CPA 를 낮출 때 바뀌는 것

목표 CPA 입찰은 광고주가 정한 목표 CPA 에 맞춰 입찰가를 정하는 방식입니다. 그 정석은 **입찰가 = 전환확률 × 목표 CPA** 입니다. 전환확률이 1.5% 인 요청에 목표 CPA 가 6,000원이면 1.5% × 6,000원 = 90원을 부릅니다. 목표를 낮출 때 승률과 소진과 전환이 어떻게 바뀌는지 **가상 데이터**로 확인합니다.

코드의 예산은 100만 원이고 하루 입찰 기회는 4만 건입니다. 기회마다 전환율 예측과 이겨야 하는 금액을 무작위로 뽑는데, 중앙값은 각각 1.5% 와 90원입니다. 같은 트래픽에서 목표 CPA 만 6000원, 5000원, 3000원으로 바꿔 비교합니다. 입찰가가 이겨야 하는 금액을 넘으면 낙찰되고 낼 때는 입찰가가 아니라 이기는 데 드는 금액만 냅니다. 예산이 떨어지면 그날은 거기서 끝납니다.

```python
# 하는 일: 같은 하루 트래픽에서 목표 CPA 를 6000원, 5000원, 3000원으로 바꿔, 승률과 예산 소진, 전환, CPA 가 어떻게 달라지는지 비교한다.
import math, random

# 1단계: 예산과 시장 값을 둔다
# 예산과 하루 입찰 기회, 전환율 예측과 이겨야 하는 금액의 중앙값이다.
BUDGET, N = 1000000, 40000       # 예산 100만 원, 하루에 들어오는 입찰 기회 4만 건
CVR_MED, MKT_MED = 0.015, 90.0   # 전환율 예측 중앙값 1.5%, 이겨야 하는 금액 중앙값 90원

# 2단계: 하루를 돌리는 함수를 만든다
# 입찰가는 전환확률 x 목표 CPA 이고, 넘기면 이기는 데 드는 금액만 낸다. 예산이 떨어지면 그날은 거기서 끝난다.
def day(target):
    random.seed(42)              # 목표만 바꿔 비교하려면 같은 트래픽을 봐야 한다
    left, wins, conv = BUDGET, 0, 0.0
    for seen in range(1, N + 1):
        pcvr = random.lognormvariate(math.log(CVR_MED), 0.6)
        price = random.lognormvariate(math.log(MKT_MED), 0.5)
        if price < pcvr * target:   # 입찰가 = 전환확률 x 목표 CPA. 넘겼으면 낙찰
            left -= price           # 내는 건 입찰가가 아니라 이기는 데 드는 금액
            wins, conv = wins + 1, conv + pcvr
            if left <= 0:
                break               # 예산 소진 — 하루가 끝나기 전에 문이 닫힌다
    spend = BUDGET - max(left, 0)
    print("목표 %5d원 승률 %4.1f%% 소진 %5.1f%% 전환 %5.1f건 CPA %5d원 소화 %3.0f%%"
          % (target, wins / seen * 100, spend / BUDGET * 100, conv,
             spend / conv, seen / N * 100))

# 3단계: 목표 CPA 셋으로 돌린다
for t in (6000, 5000, 3000):
    day(t)

# 출력:
# 3단계 뜻: 목표를 6000원으로 높게 잡으면 승률 50.4% 로 예산을 다 쓰지만 하루의 65% 만 소화하고 CPA 가 3149원이다. 3000원으로 낮추면 CPA 는 1941원이지만 예산의 46.4% 만 쓰고 전환도 239.1건으로 준다.
# 목표  6000원 승률 50.4% 소진 100.0% 전환 317.5건 CPA  3149원 소화  65%
# 목표  5000원 승률 41.0% 소진 100.0% 전환 357.0건 CPA  2801원 소화  84%
# 목표  3000원 승률 18.8% 소진  46.4% 전환 239.1건 CPA  1941원 소화 100%
```

찍힌 줄에서 승률은 살펴본 입찰 기회 가운데 이긴 비율, 소진은 예산 가운데 쓴 비율, 전환은 이긴 요청의 전환확률을 더한 기대 전환 수, 소화는 하루 입찰 기회 4만 건 가운데 예산이 떨어지기 전까지 살펴본 비율입니다. 목표 6000원에서는 전환확률이 중앙값 1.5% 인 요청의 입찰가 90원이 이겨야 하는 금액의 중앙값 90원과 같아 승률이 절반 남짓한 50.4% 가 나옵니다. 목표를 3000원으로 낮추면 같은 요청의 입찰가가 그 절반으로 내려가 승률이 18.8% 로 떨어집니다.

목표를 6,000원에서 3,000원으로 낮추면 승률과 함께 소진율도 100% 에서 46.4% 로 떨어집니다. 목표 3000원에서 CPA 는 1941원으로 목표보다 낮지만 소진은 예산의 절반에도 못 미치고 전환도 239.1건으로 줄어듭니다. **CPA 는 지켜지지만 물량이 사라집니다.**

실제 CPA 가 늘 목표보다 낮은 이유도 같습니다. 이기는 경매는 이기는 데 드는 금액이 입찰가(전환확률 × 목표 CPA)보다 싼 경매뿐이고 낼 때도 그 금액만 내므로, 이긴 경매마다 낸 금액을 전환확률로 나누면 목표 CPA 보다 작습니다. 그래서 낸 금액의 합을 전환확률의 합으로 나눈 CPA 도 목표 6000원에서 3149원, 5000원에서 2801원으로 목표보다 낮습니다.

반대로 목표 6000원은 승률 50.4% 로 경매를 더 많이 이겨 예산이 하루의 65% 지점에서 바닥납니다. 그래서 하루의 84% 까지 버틴 목표 5000원보다 전환이 357건에서 317건으로 줄어듭니다.

### 페이싱의 숨은 전제인 트래픽 예측 [무대: 열린 RTB]

**페이싱은 남은 시간에 입찰 기회가 얼마나 올지 예측해야 돌아가는데, 다른 회사의 광고 자리를 사는 열린 RTB 의 DSP 에게는 이 예측이 흔들립니다.**

열린 RTB 는 여러 회사가 광고 자리를 실시간 경매(RTB, Real-Time Bidding)로 사고파는 시장입니다. PID 든 Lagrangian 이든 남은 예산을 남은 시간에 나눠 쓰려면 「남은 시간에 입찰 기회가 얼마나 올 것인가」를 예측해야 합니다. 예측이 빗나가면 페이싱도 함께 실패합니다. 열린 RTB 에서 남의 인벤토리(매체가 파는 광고 자리)를 사는 DSP 는 경매에서 졌을 때 경쟁자가 얼마를 불렀는지도 보지 못하고 하루 요청의 총량도 남의 것이라 예측이 흔들립니다.

| 상황 | 원인 | 결과 | 대응 |
|------|------|------|------|
| 트래픽 과대예측 | 평일 모델로 주말 예측 | 예산 잔여 (under-delivery) | 요일/시간대별 트래픽 모델 |
| 트래픽 과소예측 | 이벤트 기간 미반영 | 예산 조기 소진 | 실시간 트래픽 모니터링 + 적응 |
| 트래픽 급변 | 뉴스 이벤트, 서버 장애 | Pacing 진동 | PID의 D항(미분)으로 급변 감지 |

표의 과대예측은 평일 모델로 주말을 예측할 때처럼 실제보다 기회를 많이 예상하는 경우입니다. 그러면 기회가 많이 남았다고 보고 지금 덜 쓰다가 예산이 남는 under-delivery(예산을 다 집행하지 못하는 일)가 생깁니다. 요일과 시간대별 트래픽 모델로 대응합니다. 과소예측은 이벤트 기간을 반영하지 않아 기회를 적게 예상하는 경우입니다. 그러면 예산이 일찍 바닥나므로 실시간으로 트래픽을 모니터링하며 적응합니다. 뉴스 이벤트나 서버 장애로 트래픽이 갑자기 바뀌면 페이싱이 진동하는데, 오차 변화율에 반응하는 3절 PID 의 D항(미분)으로 이런 급변을 감지합니다.

### 담장 안에서 계산으로 세우는 계획 [무대: 닫힌 생태계]

**광고 자리와 경매를 한 회사가 모두 맡는 닫힌 생태계에서는 요청의 총량이 이미 보여 계획을 추정이 아니라 계산으로 세우므로, 앞 표의 예측 문제가 훨씬 작습니다.**

닫힌 생태계는 한 플랫폼이 광고 자리를 팔고 사는 일과 경매를 모두 맡는 구조입니다. 담장 안은 그 구조의 안쪽을 부르는 이름입니다. 지면(광고가 들어가는 화면의 자리)과 경매를 한 회사가 모두 쥐고 있으면 요청의 총량이 이미 보이므로 계획을 추정이 아니라 계산으로 세웁니다. 플랫폼은 하루에 그 지면에 요청이 몇 건 오는지, 그 가운데 이 광고주의 조건에 맞는 요청이 몇 건인지를 자기 로그에서 직접 셉니다. 그래서 앞 표의 과대예측과 과소예측 문제가 열린 RTB 보다 훨씬 작습니다. 그래도 캠페인끼리 같은 요청을 두고 겨루는 내부 경쟁은 남는데, 다음 절에서 다룹니다.

### 캠페인 사이의 경쟁과 내부 경매

같은 DSP 안에서 여러 캠페인이 같은 유저나 지면을 노리면 캠페인끼리 **내부 경쟁**이 생깁니다. 아래는 캠페인 3개가 같은 유저를 두고 겨루는 예시입니다.

```text
캠페인 A: CPA $10, 일 예산 $1,000
캠페인 B: CPA $15, 일 예산 $500
캠페인 C: CPA $8,  일 예산 $2,000

→ 같은 유저에게 세 캠페인 모두 입찰하고 싶다면?
→ 내부 Ad Ranking으로 한 캠페인만 선택 후 외부 경매에 참여
→ 각 캠페인의 Pacing이 서로 영향을 미침
```

목표 CPA 가 C 8, A 10, B 15달러로 서로 다른 세 캠페인이 모두 같은 유저에게 입찰하고 싶어 하면 DSP 는 내부 Ad Ranking(후보 광고에 순위를 매기는 일)으로 한 캠페인만 골라 외부 경매에 내보냅니다. 내부에서 고른 캠페인만 외부 경매에 나가 예산을 쓸 기회를 얻고 나머지는 그 요청에서 예산을 쓰지 못하므로, 각 캠페인의 페이싱이 서로 영향을 주고받습니다.

### 페이싱 업데이트 주기

$\lambda$ 를 얼마나 자주 고칠지도 정해야 합니다. 주기가 길면 안정적이지만 급변에 느립니다. 주기가 짧을수록 빨리 대응하는 대신 진동하거나 과민하게 반응할 수 있습니다.

| 주기 | 장점 | 단점 | 적합한 경우 |
|------|------|------|-----------|
| **1시간** | 안정적, 진동 적음 | 급변에 느림 | 대규모 예산 캠페인 |
| **5분** | 빠른 대응 | 진동 가능 | 중간 규모 캠페인 |
| **실시간** (요청마다) | 최적 반응 | 계산 비용, 과민 반응 | RL 기반 시스템 |

표에서 1시간 주기는 대규모 예산 캠페인에, 5분 주기는 중간 규모 캠페인에 맞습니다. 요청마다 고치는 실시간 갱신은 최적 반응이 장점이고 계산 비용과 과민 반응이 단점입니다. 주로 RL 기반 시스템에 적합합니다.

---

## 6. 차세대 접근인 RL(강화학습) 기반 자동 입찰

**PID 는 오차 신호 하나만 따라가고 Lagrangian 은 제약을 늘릴수록 튜닝이 어려워지며 둘 다 트래픽 패턴을 학습하지 못합니다. RL(강화학습)은 상태를 보고 $\lambda$ 를 고르는 법을 시행착오로 배워 이 한계를 넘습니다.**

최근 대형 DSP(Google, Meta, Alibaba)는 강화학습으로 자동 입찰을 고도화하고 있습니다. 강화학습(RL, Reinforcement Learning)은 에이전트(결정을 내리는 프로그램)가 상태를 보고 행동을 고른 뒤 받은 보상이 커지는 쪽으로 행동 방식을 시행착오로 배우는 방법입니다.

### RL 을 쓰는 이유

PID 와 Lagrangian 에는 세 가지 한계가 있습니다.

- **PID** 는 오차 신호 하나만 따라가므로 예산과 CPA 가운데 하나만 직접 제어합니다.
- **Lagrangian** 은 제약마다 dual variable(제약 하나에 붙는 승수로, 4절의 $\mu$ 가 그 예)을 추가하면 여러 제약을 함께 다룰 수 있지만 **dual variable 끼리 서로 영향을 주어** 튜닝이 복잡해지고 수렴이 불안정해집니다.
- 두 방식 모두 **트래픽 패턴을 학습하지 못하고** 과거 패턴으로 앞을 예측하지 않은 채 들어온 오차에 반응하기만 합니다.

RL 은 이 한계를 넘습니다. 아래 그림처럼 상태(State)를 보고 행동(Action)을 고른 뒤 받은 보상(Reward)으로 배웁니다.

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

그림의 상태는 예산 잔여 비율(남은 예산 ÷ 전체 예산), 시간 잔여 비율(남은 시간 ÷ 24), 지금까지의 CPA(총비용 ÷ 총전환), 최근 1시간의 Win Rate(이긴 수 ÷ 입찰 수) 4가지입니다. 행동은 $\lambda$ 를 0.1 에서 1.0 사이에서 고르는 일입니다. 보상은 전환 가치(전환 수 × ConvValue)이고 CPA 가 목표를 넘거나 예산을 넘겨 쓰면 거기서 페널티를 뺍니다. 보상 하나에 CPA 페널티와 예산 초과 페널티가 함께 들어 있으므로 RL 은 PID 처럼 둘 가운데 하나만 고르지 않고 예산과 CPA 를 한 번에 봅니다.

### PID, Lagrangian, RL 비교

| | PID Controller | Lagrangian Dual | RL (강화학습) |
|---|---|---|---|
| **원리** | 오차 기반 피드백 | 수학적 최적화 | 시행착오 학습 |
| **제약 처리** | 예산 1개 | 예산 1개 (+ KKT) | 다중 제약 가능 |
| **트래픽 적응** | 없음 (반응적) | 없음 (반응적) | 패턴 학습 (예측적) |
| **구현 복잡도** | 낮음 | 중간 | 높음 |
| **안정성** | 높음 (검증됨) | 높음 | 학습 불안정 가능 |
| **실무 채택** | 가장 많음 | 보통 | 대형 플랫폼 |

표의 KKT 는 제약이 있는 최적화 문제에서 최적해가 만족해야 하는 조건(Karush-Kuhn-Tucker 조건)입니다. 트래픽 적응 줄의 반응적은 이미 생긴 오차에 대응한다는 뜻이고 예측적은 학습한 패턴으로 앞을 내다본다는 뜻입니다. PID 는 구현 복잡도가 낮고 안정성이 검증되어 있으며 실무 채택도 가장 많습니다. RL 은 다중 제약을 다루고 트래픽 패턴을 학습하는 대신 구현 복잡도가 높고 학습이 불안정할 수 있습니다. 실무에서는 주로 대형 플랫폼이 RL 을 채택합니다.

---

## 7. 자동 입찰이 pCTR 모델에 미치는 영향

**자동 입찰과 ML 모델은 서로 영향을 주고받습니다. pCTR 이 과대추정되면 페이싱이 아무리 잘 동작해도 ROI(쓴 비용 대비 수익)가 떨어집니다. $\lambda$ 가 낮아지면 싼 입찰만 낙찰해 학습 데이터가 편향됩니다.**

이 글의 자동 입찰은 pCTR 같은 모델의 예측값을 입력으로 받는데, 그 입찰로 낙찰한 경매가 다시 모델의 학습 데이터가 되므로 두 쪽은 서로 영향을 주고받습니다.

### pCTR 정확도가 페이싱에 미치는 영향

1절에서 가치 V 를 pCTR × pCVR × ConvValue 로 구했으므로 pCTR 이 틀리면 V 가 틀리고 V 에서 시작한 입찰과 예산이 쓰이는 속도도 함께 달라집니다.

| pCTR 상태 | 참 가치 영향 | 페이싱 영향 |
|-----------|---------------|------------|
| **과대추정** | V 과대 → 과다 입찰 | Win Rate 급증 → 예산 빠르게 소진 → $\lambda$ 급락 |
| **과소추정** | V 과소 → 과소 입찰 | Win Rate 급감 → 예산 잔여 → $\lambda$ 상승해도 효과 제한 |
| **정확** | V 정확 → 적정 입찰 | Win Rate 안정 → 예산 균등 소진 → $\lambda$ 안정 |

과대추정이면 V 가 실제보다 커져 과다 입찰하고 Win Rate 가 급증해 예산이 빨리 줄므로 $\lambda$ 가 급락합니다. 과소추정이면 V 가 작아져 과소 입찰하고 Win Rate 가 급감해 예산이 남는데, 이때는 $\lambda$ 가 올라가도 효과가 제한됩니다. pCTR 이 정확하면 적정 입찰로 Win Rate 가 안정되어 예산이 고르게 쓰이고 $\lambda$ 도 안정됩니다.

$\lambda$ 가 0.3 까지 떨어져도 과대추정된 V 에 0.3 을 곱한 값이 여전히 적정가보다 높을 수 있으므로, **pCTR 이 과대추정되면 페이싱이 아무리 잘 동작해도 ROI 가 떨어집니다**.

### 페이싱이 학습 데이터에 미치는 영향

$\lambda$ 가 낮아지면 입찰가가 낮아져 Win Rate 가 떨어지고 이기는 경매가 싼 쪽으로 몰려 **Selection Bias 가 커집니다**. Selection Bias(선택 편향)는 학습 데이터가 전체 요청이 아니라 어떤 조건을 통과한 일부로만 채워져 생기는 편향입니다. 학습 데이터에는 이긴 경매의 노출과 클릭 기록만 쌓이므로 이긴 경매가 치우치면 학습 데이터도 치우칩니다.

```text
λ = 1.0 → 다양한 입찰에서 낙찰 → 풍부한 학습 데이터
λ = 0.3 → 저렴한 입찰만 낙찰 → 편향된 학습 데이터
         → 모델이 "저가 지면 = 높은 CTR"이라고 잘못 학습할 위험
```

$\lambda$ 가 1.0 이면 여러 가격대의 입찰에서 낙찰해 학습 데이터가 풍부합니다. 0.3 이면 저렴한 입찰만 낙찰해 데이터가 편향되어 그 데이터로 학습한 모델이 저가 지면의 CTR(노출 가운데 클릭된 비율)이 높다고 잘못 배울 위험이 생깁니다. 입찰이 학습 데이터를 바꾸고 그 데이터로 학습한 모델이 다시 입찰을 바꾸는 이 순환이 **Bid-Learning Feedback Loop** 문제입니다. 그래서 자동 입찰 시스템을 설계할 때는 학습 데이터를 다양하게 유지하려고 당장의 성과와 별개로 새 데이터를 얻는 데 쓰는 [탐색(exploration) 예산](post.html?id=exploration-exploitation)을 따로 떼어 두어야 합니다.

---

## 마무리

1. **예산 페이싱은 「언제, 얼마나 입찰할까」를 정하는 문제입니다.** Bid Shading 이 입찰 한 번을 최적화한다면 예산 페이싱은 하루 전체의 입찰을 최적화합니다.

2. **실무의 주력은 PID Controller 입니다.** 단순하고 안정적이며 대부분의 예산 제약을 충분히 처리합니다. 3절의 코드처럼 계수를 잘못 잡으면 $\lambda$ 가 한 번에 1.0 에서 0.1 로 떨어지므로 $K_p$, $K_i$, $K_d$ 튜닝이 결과를 좌우합니다.

3. **Lagrangian 은 PID(목표에서 벗어난 만큼 되돌려 잡는 제어 방식)의 이론적 근거입니다.** $\lambda$(pacing multiplier)와 $\mu$(shadow price)는 $\lambda = 1/(1+\mu)$ 로 연결된 같은 것의 다른 표현입니다. Lagrangian 방식은 수학적으로 최적임이 보장됩니다.

4. **여러 제약을 함께 최적화하는 열쇠는 RL 입니다.** 예산, CPA, ROAS(쓴 광고비 대비 매출), 노출 균등성(하루 동안 고르게 노출되는 정도)을 동시에 최적화해야 할 때 RL 은 PID 와 Lagrangian 의 한계를 넘습니다.

5. **모든 것의 기초는 pCTR 정확도입니다.** 자동 입찰이 아무리 정교해도 입력인 pCTR 이 부정확하면 모델 정확도에서 입찰 정확도를 거쳐 예산 효율로 이어지는 체인이 처음부터 끊어져 예산을 낭비합니다.

> 이 글은 [Bid Shading 포스트](post.html?id=bid-shading-censored)에 자연스럽게 이어지는 후속편입니다. Bid Shading 이 입찰 한 번의 $b^*$ 를 계산하면 자동 입찰이 그 값을 $\lambda$ 로 스케일링해 최종 입찰가를 정합니다. 후보를 단계마다 줄여 가며 고르는 구조는 Multi-Stage Ranking 이라고 부릅니다. 이 모든 계산을 받쳐 주는 구조는 [모델 서빙 아키텍처](post.html?id=model-serving-architecture)에서 다룹니다.

---

## 더 깊이 보기

- 확률이 틀리면 CPA도 어긋난다 → [Calibration](post.html?id=calibration)
- 카카오의 실제 입찰, 측정 → [카카오 사례](post.html?id=kakao-ads-bidding-measurement)
- 광고 ML 전체 지도 → [ML 엔지니어 트랙](ml-track.html)
