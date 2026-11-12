학습 환경에서 AUC 0.82 를 받은 pCTR 모델이라도 실제 광고를 내보내는 운영 환경(프로덕션)에 올렸을 때 그 0.82 만큼의 성능을 낸다는 보장은 없습니다. pCTR 은 광고가 노출됐을 때 클릭될 확률을 모델이 예측한 값입니다. AUC 는 클릭이 난 광고에 클릭이 나지 않은 광고보다 높은 pCTR 을 주었는지를 세는 지표로, 1 에 가까울수록 좋습니다. 프로덕션에서 모델이 가치를 만들려면 **100ms RTB 타임아웃 안에서 수백 개 후보 광고를 초당 수만 QPS 로 추론**할 수 있어야 합니다. RTB(Real-Time Bidding)는 광고 노출 한 번마다 실시간 경매로 광고 자리를 사고파는 방식입니다. RTB 타임아웃은 그 경매에 응답해야 하는 마감 시간이라 100ms 를 넘긴 응답은 버려집니다. 후보 광고는 그 광고 자리에 내보낼 수 있는 광고들을 말합니다. 추론은 학습을 마친 모델로 예측값을 계산하는 일입니다. QPS(Queries Per Second)는 서버가 1초에 받는 요청 수입니다. 이 글은 광고 ML 모델이 학습 환경을 떠나 프로덕션에서 요청을 받고 예측값을 돌려주는 일, 즉 서빙의 전체 아키텍처를 부분마다 나눠 살펴봅니다.

> **이 글은 모델을 돌리는 서빙 계층을 다룹니다.** 피처(모델이 예측에 쓰는 입력값)를 저장소에서 꺼내 오는 과정은 [피처 스토어(Feature Store) 포스트](post.html?id=feature-store-serving)에, 모델이 낡지 않도록 새 데이터로 갱신하는 과정은 [온라인 학습(Online Learning) 포스트](post.html?id=online-learning-delayed-feedback)에 있습니다. 이 글은 두 과정 사이에서 **피처를 받은 모델이 예측값을 계산해 돌려주는 서빙 계층**만 집중해서 봅니다.

---

## 1. 광고 모델 서빙의 제약 조건

**광고 모델 서빙은 요청 하나마다 후보 광고 수백~수천 개에 10ms 안에 점수를 매겨야 하므로, 모델 하나를 빠르게 만드는 것만으로는 풀리지 않고 후보를 단계마다 줄이는 구조가 필요합니다.**

일반 ML 서빙에서 하던 대로 모델 한 번의 추론 시간만 줄이면 된다고 생각하면, 광고 서빙에서는 그 시간이 요청마다 붙은 후보 수만큼 곱해져 시간 한도를 넘기기 쉽습니다. 일반적인 ML 서빙과 광고 모델 서빙은 같은 서빙이라도 지켜야 할 조건이 근본부터 다릅니다. 아래 표는 두 서빙을 6가지 제약으로 비교합니다.

| 제약 | 일반 ML 서빙 | 광고 모델 서빙 |
|------|------------|-------------|
| **레이턴시** | 수백 ms OK | **10ms 이내** (DSP 내부 처리) |
| **후보 수** | 1건 (단건 추론) | **수백~수천 개** (후보 광고 전체) |
| **QPS** | 수백~수천 | **수만~수십만** |
| **모델 크기** | 수 GB OK | 레이턴시 제약으로 **경량화 필수** |
| **SLA** | 99.9% | **99.99%+** (장애 = 매출 손실) |
| **갱신 주기** | 주 1회 | **일 1회 + 실시간 Calibration** |

표의 레이턴시는 요청을 받아 응답을 돌려주기까지 걸리는 시간으로 짧을수록 좋습니다. 이 글은 레이턴시를 지연이라고도 부릅니다. DSP(Demand-Side Platform)는 광고주를 대신해 경매에 입찰하는 플랫폼입니다. SLA(Service Level Agreement)는 서비스가 지키기로 약속한 수준입니다. 표의 99.9% 와 99.99% 는 전체 시간 가운데 정상으로 응답해야 하는 비율을 뜻합니다. Calibration 은 모델이 낸 확률을 실제 클릭률에 맞도록 고치는 보정입니다.

일반 ML 서빙은 요청 하나를 받으면 예측 하나를 돌려주면 됩니다. 광고 서빙은 요청 하나를 받을 때마다 그 자리에 낼 수 있는 후보 광고 수백 개에 한꺼번에 점수를 매겨야 하는데, 그런 요청이 초당 수만 건씩 들어옵니다.

표의 6가지 가운데 가장 자주 과소평가되는 항목은 **후보 수**입니다. 레이턴시가 10배 빡빡해지는 부담보다 한 요청에서 점수를 매길 광고가 수백 배 많아지는 부담이 더 큽니다. 모델이 후보 1개에 쓰는 시간에 후보 수가 그대로 곱해지므로, 후보 1개에 0.02ms 만 드는 가벼운 모델도 후보가 2,000개면 0.02ms × 2,000 = 40ms 가 걸립니다. 그래서 모델만 빠르게 만들어서는 이 문제가 풀리지 않습니다.

같은 까닭으로 후보 광고 500개를 복잡한 모델 하나로 10ms 안에 모두 점수 매기기는 불가능합니다. 이 한계를 풀려고 쓰는 구조가 다음 절의 단계별 랭킹(Multi-Stage Ranking)입니다. 표의 모델 크기 줄에 나온 경량화(모델을 작고 빠르게 만드는 일)는 3절에서, SLA 를 지키는 장애 대응은 7절에서 다룹니다.

---

## 2. 단계별 랭킹: 깔때기 구조

**후보 전체를 한 번에 복잡한 모델에 넣는 대신 후보 생성, 앞단 랭킹, 랭킹, 뒷단 랭킹의 4단계를 차례로 지나면서 후보는 수천 개에서 1개로 줄이고 모델은 단계마다 더 복잡한 것을 씁니다.**

1절에서 본 대로 복잡한 모델은 후보 전부를 시간 안에 계산할 수 없습니다. 그래서 앞 단계에서는 가볍고 빠른 방법으로 후보 수를 크게 줄인 다음 몇십 개만 남았을 때 비로소 무거운 모델을 씁니다. 후보가 위는 넓고 아래는 좁은 모양으로 줄어든다고 해서 이 구조를 깔때기 구조라고 부릅니다. 아래 그림은 네 단계마다 후보가 몇 개에서 몇 개로 줄고 어떤 모델을 쓰며 시간이 얼마나 드는지 보여 줍니다.

<div class="chart-steps">
  <div style="font-size:0.85rem; font-weight:700; color:var(--text-primary); margin-bottom:12px;">단계별 랭킹 파이프라인(Multi-Stage Ranking Pipeline) (수천 &rarr; 1)</div>
  <div class="chart-step">
    <div class="chart-step-indicator">
      <div class="chart-step-dot green">1</div>
      <div class="chart-step-line"></div>
    </div>
    <div class="chart-step-content">
      <div class="chart-step-title">후보 생성(Retrieval) &mdash; 수천 &rarr; 수백</div>
      <div class="chart-step-desc">타겟팅 조건 매칭 + 간단한 규칙 기반 필터. 예산 소진 캠페인 제외, 타겟 불일치 제외. 0.1ms 이내.</div>
      <span class="chart-step-badge green">규칙 기반, DB 조회</span>
    </div>
  </div>
  <div class="chart-step">
    <div class="chart-step-indicator">
      <div class="chart-step-dot yellow">2</div>
      <div class="chart-step-line"></div>
    </div>
    <div class="chart-step-content">
      <div class="chart-step-title">앞단 랭킹(Pre-Ranking) (경량 스코어링) &mdash; 수백 &rarr; 50</div>
      <div class="chart-step-desc">경량 모델(Logistic Regression, 작은 MLP)로 빠르게 스코어링. 피처 수 제한(상위 20개). 후보 대폭 축소.</div>
      <span class="chart-step-badge yellow">경량 모델, ~1ms</span>
    </div>
  </div>
  <div class="chart-step">
    <div class="chart-step-indicator">
      <div class="chart-step-dot orange">3</div>
      <div class="chart-step-line"></div>
    </div>
    <div class="chart-step-content">
      <div class="chart-step-title">랭킹(Ranking) (정밀 스코어링) &mdash; 50 &rarr; 5</div>
      <div class="chart-step-desc">복잡한 모델(DeepFM, DCN, DIN)로 정밀 pCTR/pCVR 예측. 전체 피처 사용. 참 가치(True Value) 계산.</div>
      <span class="chart-step-badge orange">복잡 모델, ~3-5ms</span>
    </div>
  </div>
  <div class="chart-step">
    <div class="chart-step-indicator">
      <div class="chart-step-dot pink">4</div>
    </div>
    <div class="chart-step-content">
      <div class="chart-step-title">뒷단 랭킹(Re-Ranking) (최종 선택) &mdash; 5 &rarr; 1</div>
      <div class="chart-step-desc">비즈니스 로직 적용: 다양성(같은 광고주 중복 방지), 빈도 제한(frequency cap), 광고 품질 점수. 최종 1개 선택 후 Bid Shading.</div>
      <span class="chart-step-badge pink">비즈니스 로직, ~0.5ms</span>
    </div>
  </div>
</div>

그림의 스코어링은 후보마다 점수를 매기는 일입니다. 네 단계를 차례로 보면 이렇습니다.

- **후보 생성(Retrieval)** 은 모델 없이 규칙과 DB 조회로 후보를 거릅니다. 광고주가 정한 노출 대상 조건(타겟팅 조건)에 맞지 않는 광고와 광고비 예산을 다 쓴 캠페인을 빼서 수천 개를 수백 개로 줄이며 이 단계는 0.1ms 이내에 끝납니다.

- **앞단 랭킹(Pre-Ranking)** 은 Logistic Regression 이나 작은 MLP 같은 경량 모델에 상위 20개 피처만 넣어 빠르게 점수를 매깁니다. Logistic Regression 은 입력에 가중치를 곱해 더한 값을 0~1 사이 확률로 바꾸는 선형 모델입니다. MLP(Multi-Layer Perceptron)는 층 몇 개를 쌓은 신경망입니다. 후보 수백 개를 50개로 크게 줄이는 데 약 1ms 가 듭니다.

- **랭킹(Ranking)** 은 DeepFM, DCN, DIN 같은 복잡한 모델에 피처 전체를 넣어 pCTR 과 pCVR(전환 확률 예측값)을 정밀하게 예측합니다. DeepFM, DCN, DIN 은 피처끼리의 조합이나 유저의 과거 행동까지 학습하는 딥러닝 CTR 모델입니다. 예측값으로는 참 가치(True Value)를 계산합니다. 참 가치는 광고 하나를 이번에 노출했을 때 기대하는 가치로, 아래 의사코드에서는 pCTR 에 전환 가치(conversion_value)를 곱해 구합니다. 후보 50개를 5개로 줄이는 데 약 3-5ms 가 듭니다.

- **뒷단 랭킹(Re-Ranking)** 은 모델 대신 비즈니스 규칙으로 최종 1개를 고릅니다. 같은 광고주의 광고가 겹치지 않게 하는 다양성 규칙, 한 사람에게 같은 광고를 정해진 횟수 넘게 보여 주지 않는 빈도 제한(frequency cap), 광고 품질 점수를 반영해 5개 가운데 1개를 고르는 데 약 0.5ms 가 듭니다. 고른 광고에는 마지막으로 Bid Shading 을 적용합니다. Bid Shading 은 낙찰에 필요한 만큼만 입찰가를 낮춰 내는 기법입니다.

### 단계별 상세 비교

아래 표는 네 단계를 후보 수, 모델, 피처 수, 레이턴시, 정확도, 목표로 나란히 비교합니다.

| | 후보 생성 | 앞단 랭킹 | 랭킹 | 뒷단 랭킹 |
|---|---|---|---|---|
| **후보 수** | 수천 → 수백 | 수백 → 50 | 50 → 5 | 5 → 1 |
| **모델** | 규칙/인덱스 | LR, 작은 MLP | DeepFM, DCN, DIN | 규칙 + 점수 보정 |
| **피처 수** | 0 (필터만) | ~20개 (핵심만) | ~200개 (전체) | 메타데이터만 |
| **레이턴시** | <0.1ms | ~1ms | 3-5ms | <0.5ms |
| **정확도** | 낮음 (recall 중심) | 중간 | 높음 (precision 중심) | - |
| **핵심 목표** | 놓치지 않기 | 빠르게 거르기 | 정확하게 평가 | 비즈니스 제약 반영 |

표를 왼쪽에서 오른쪽으로 읽으면 뒤 단계로 갈수록 후보는 줄어드는 반면 후보 하나에 쓰는 피처는 후보 생성 0개에서 앞단 랭킹 약 20개, 랭킹 약 200개로 늘어납니다.

정확도 줄에서 후보 생성은 recall 중심인 반면 랭킹은 precision 중심입니다. recall 은 정말 좋은 광고 가운데 다음 단계로 넘어간 광고의 비율입니다. precision 은 다음 단계로 넘긴 광고 가운데 정말 좋은 광고의 비율입니다. 앞 단계는 좋은 광고를 놓치지 않는 일을 맡고 뒤 단계는 남은 몇 개를 정확하게 평가하는 일을 맡습니다. 맨 아래 핵심 목표 줄의 「놓치지 않기」와 「정확하게 평가」도 같은 차이를 말합니다.

### 앞단 랭킹(Pre-Ranking)을 두는 까닭

앞단 랭킹을 빼고 후보 500개를 곧바로 랭킹 모델(DeepFM)에 넣을 때와 앞단 랭킹을 둘 때 걸리는 시간을 아래 상자가 비교합니다. 여기서 예산은 돈이 아니라 응답에 쓸 수 있는 시간을 말합니다.

```text
[Pre-Ranking 없이]
500개를 Ranking 모델(DeepFM)에 직접 → 50개씩 배치 = 10 배치 × 3ms = 30ms
→ 10ms 예산 3배 초과

[Pre-Ranking 적용]
500개 × 0.01ms = 5ms (Pre-Ranking, CPU 경량 모델)
 50개 × 0.1ms  = 5ms (Ranking, GPU DeepFM)
총 ~10ms → 예산 내 처리 가능
```

앞단 랭킹이 없으면 GPU 의 DeepFM 이 후보 500개를 50개씩 10번의 배치로 나눠 계산합니다. 배치(batch)는 모델에 한 번에 같이 넣어 계산하는 입력의 단위입니다. 배치 한 번에 3ms 가 들어 10번이면 10 × 3ms = 30ms 가 되므로 10ms 예산의 3배를 씁니다.

앞단 랭킹을 두면 CPU 의 경량 모델이 후보 500개를 하나에 0.01ms 씩 계산해 500 × 0.01ms = 5ms 가 듭니다. 랭킹 단계의 GPU DeepFM 은 앞단 랭킹을 통과한 50개만 하나에 0.1ms 씩 계산해 50 × 0.1ms = 5ms 가 듭니다. 두 단계를 합치면 약 10ms 라 예산 안에 처리할 수 있습니다.

**앞단 랭킹은 랭킹 모델이 골랐을 상위 50개(Top-50)를 빠뜨리지 않으면서 후보 수를 줄여야 합니다.** 앞단 랭킹에서 떨어진 광고는 뒤 단계의 정밀한 모델을 다시 만날 길이 없어 영영 기회를 잃으므로, 앞단 랭킹에서는 **precision 보다 recall 을 먼저 지킵니다.**

아래 의사코드는 그대로 실행되는 코드가 아니라 네 단계가 10ms 예산 안에서 차례로 후보를 줄여 광고 1개를 고르는 구조만 보여 줍니다.

```python
# (의사코드 — 그대로 실행되지 않습니다.)
# 하는 일: 수천 개 후보를 네 단계로 줄여 광고 1개를 고르는 Multi-Stage Ranking Pipeline 이 10ms 예산 안에서 도는 구조만 보여 준다.

def multi_stage_ranking(bid_request, budget_ms=10):
    """광고 랭킹: 단계별 후보 축소 + 모델 복잡도 증가"""

    # Stage 1: Retrieval (수천 → 수백, ~0.1ms, 규칙 기반)
    candidates = retrieval(bid_request)       # 타겟팅, 예산 필터

    # Stage 2: Pre-Ranking (수백 → 50, ~1ms, 경량 모델)
    feats = extract_features(candidates, light=True)
    scores = lightweight_model.predict(feats)  # LR / 작은 MLP
    candidates = top_k(candidates, scores, k=50)

    # Stage 3: Ranking (50 → 5, ~5ms, 풀 모델)
    feats = extract_features(candidates, light=False)
    pCTR = ranking_model.predict(feats)        # DeepFM / DIN
    value = pCTR * conversion_value
    candidates = top_k(candidates, value, k=5)

    # Stage 4: Re-Ranking (5 → 1, ~0.5ms, 비즈니스 로직)
    final = apply_rules(candidates)            # 다양성, 빈도 제한
    return final, bid_shading(final, value)
```

코드의 Stage 2 는 경량 모델의 점수로 상위 50개를 남깁니다(top_k). Stage 3 은 pCTR 에 conversion_value 를 곱한 value(참 가치)로 다시 5개를 남깁니다. Stage 4 는 다양성과 빈도 제한 규칙으로 1개를 고른 뒤 bid_shading 으로 입찰가를 정합니다.

---

### 구간별 비용의 합과 예산 초과 지점

1절 표의 10ms 는 DSP 안에서 처리하는 시간인 반면, 여기서 다루는 예산 100ms 는 광고 요청 하나가 응답까지 쓸 수 있는 시간 전체라 네트워크 왕복, 피처 조회, 전처리, 모델 추론, 후처리가 모두 그 안에 들어가야 합니다. 이 100ms 가 어느 구간에서 얼마씩 쓰이는지 직접 더해 보면 예산을 넘기는 원인이 보입니다. 아래 코드는 요청마다 한 번 드는 고정 비용과 후보 1개마다 드는 후보 비례 비용을 나눠 적은 다음 후보가 100개, 500개, 2,000개, 5,000개일 때 합계를 예산과 비교하고 예산 안에 드는 최대 후보 수까지 구합니다. 수치는 모두 가상값입니다.

```python
# 하는 일: 요청당 고정 비용과 후보 1개당 비용을 더해, 후보 수마다 100ms 예산을 넘는지와 예산 안에 드는 최대 후보 수를 구한다.

# 1단계: 예산과 두 종류의 비용을 둔다
# 광고 요청 하나가 응답까지 쓸 수 있는 시간은 대략 100ms 다. 그 안에 피처 조회, 전처리, 모델 추론, 후처리(보정, 랭킹)가 다 들어가야 한다. 수치는 전부 가상값이다. 자리 크기만 맞췄고 사내에서 측정한 값이 아니다.
BUDGET_MS = 100.0

# 후보 수와 무관하게 한 번만 드는 비용 (요청당 고정)
FIXED = [
    ("네트워크 왕복(거래소↔우리)", 12.0),
    ("유저 피처 조회 (캐시 미스 섞임)", 8.0),
    ("요청 파싱, 검증", 1.5),
]

# 후보 1개당 드는 비용 (후보 수에 비례해 늘어난다)
PER_CANDIDATE = [
    ("광고 피처 조회", 0.008),
    ("피처 전처리(정규화, 해싱)", 0.004),
    ("모델 추론", 0.020),
    ("보정 + eCPM 랭킹", 0.003),
]

# 2단계: 후보 수마다 합계를 예산과 비교한다
# 고정 비용은 후보 수와 상관없이 같고, 후보 비례 비용은 후보 1개당 비용의 합에 후보 수를 곱한다.
print(f"예산 {BUDGET_MS:.0f}ms, 아래 수치는 모두 가상값\n")
fixed_total = sum(ms for _, ms in FIXED)
print(f"{'후보 수':>8}{'고정 비용':>12}{'후보 비례':>12}{'합계':>10}{'예산 대비':>11}   판정")
for n in (100, 500, 2000, 5000):
    per = sum(ms for _, ms in PER_CANDIDATE) * n
    total = fixed_total + per
    verdict = "통과" if total <= BUDGET_MS else f"초과 {total - BUDGET_MS:.1f}ms"
    print(f"{n:>8,}{fixed_total:>10.1f}ms{per:>10.1f}ms{total:>8.1f}ms{total/BUDGET_MS*100:>10.0f}%   {verdict}")

# 3단계: 후보 2,000개일 때 구간별 내역을 찍는다
# 구간을 큰 순서로 정렬하고, 막대 길이는 합계에서 차지하는 몫이다.
print()
N = 2000
print(f"후보 {N:,}개일 때 구간별 내역")
rows = [(name, ms, False) for name, ms in FIXED] + [(name, ms * N, True) for name, ms in PER_CANDIDATE]
rows.sort(key=lambda r: -r[1])
total = sum(ms for _, ms, _ in rows)
for name, ms, scales in rows:
    bar = '█' * max(1, round(ms / total * 40))
    tag = '후보에 비례' if scales else '고정'
    print(f"  {name:<26}{ms:>7.1f}ms  {ms/total*100:>5.1f}%  {bar}  ({tag})")
print(f"  {'합계':<26}{total:>7.1f}ms")

# 4단계: 예산에 맞추려면 후보를 몇 개까지 줄여야 하는지 구한다
# 예산에서 고정 비용을 빼고 남은 시간을 후보 1개당 비용으로 나눈다.
print()
per_one = sum(ms for _, ms in PER_CANDIDATE)
max_n = int((BUDGET_MS - fixed_total) / per_one)
print(f"예산 안에 들어가는 최대 후보 수  {max_n:,}개")
print(f"  고정 비용 {fixed_total:.1f}ms를 빼면 후보에 쓸 수 있는 시간은 {BUDGET_MS - fixed_total:.1f}ms")
print(f"  후보 1개당 {per_one:.3f}ms 이므로 {BUDGET_MS - fixed_total:.1f} / {per_one:.3f} = {max_n:,}개")
print()
print("→ 후보를 무한히 늘릴 수 없다. 그래서 정밀 랭킹 앞에 후보를 좁히는 단계가 반드시 온다.")
print("→ 그 좁히는 단계가 Two-Tower 같은 retrieval이다.")

# 출력:
# 2단계 뜻: 고정 비용 21.5ms 는 후보 수와 상관없이 같다. 후보 비례 비용은 후보 수와 같은 비율로 늘어, 합계가 2,000개에서도 91.5ms 로 통과하지만 5,000개는 196.5ms 로 예산을 96.5ms 넘는다.
# 예산 100ms, 아래 수치는 모두 가상값
#
#     후보 수       고정 비용       후보 비례        합계      예산 대비   판정
#      100      21.5ms       3.5ms    25.0ms        25%   통과
#      500      21.5ms      17.5ms    39.0ms        39%   통과
#    2,000      21.5ms      70.0ms    91.5ms        92%   통과
#    5,000      21.5ms     175.0ms   196.5ms       197%   초과 96.5ms
# 3단계 뜻: 후보 2,000개면 모델 추론이 40.0ms 로 합계 91.5ms 의 43.7% 를 차지해 가장 크다.
#
# 후보 2,000개일 때 구간별 내역
#   모델 추론                        40.0ms   43.7%  █████████████████  (후보에 비례)
#   광고 피처 조회                     16.0ms   17.5%  ███████  (후보에 비례)
#   네트워크 왕복(거래소↔우리)              12.0ms   13.1%  █████  (고정)
#   유저 피처 조회 (캐시 미스 섞임)           8.0ms    8.7%  ███  (고정)
#   피처 전처리(정규화, 해싱)               8.0ms    8.7%  ███  (후보에 비례)
#   보정 + eCPM 랭킹                  6.0ms    6.6%  ███  (후보에 비례)
#   요청 파싱, 검증                     1.5ms    1.6%  █  (고정)
#   합계                           91.5ms
# 4단계 뜻: 고정 비용 21.5ms 를 빼고 남는 78.5ms 를 후보 1개당 0.035ms 로 나누면, 예산 안에 드는 후보는 2,242개까지다.
#
# 예산 안에 들어가는 최대 후보 수  2,242개
#   고정 비용 21.5ms를 빼면 후보에 쓸 수 있는 시간은 78.5ms
#   후보 1개당 0.035ms 이므로 78.5 / 0.035 = 2,242개
#
# → 후보를 무한히 늘릴 수 없다. 그래서 정밀 랭킹 앞에 후보를 좁히는 단계가 반드시 온다.
# → 그 좁히는 단계가 Two-Tower 같은 retrieval이다.
```

찍힌 값은 고정 비용과 후보 비례 비용을 나눠 보면 읽힙니다. 2단계 표에서 고정 비용은 네트워크 왕복 12ms, 유저 피처 조회 8ms, 요청 파싱과 검증 1.5ms 를 더한 21.5ms 로, 후보가 100개든 5,000개든 똑같습니다. 네트워크 왕복은 광고 거래소(Ad Exchange, 광고 자리를 실시간 경매로 파는 곳)와 우리 서버 사이를 요청과 응답이 오가는 시간입니다. 후보 비례 비용은 후보 1개당 광고 피처 조회 0.008ms, 피처 전처리 0.004ms, 모델 추론 0.020ms, 보정과 eCPM 랭킹 0.003ms 를 더한 0.035ms 에 후보 수를 곱한 값이라 후보 수와 같은 비율로 늘어납니다. eCPM 은 광고를 천 번 노출했을 때 기대하는 수익입니다.

후보 2,000개면 후보 비례 비용이 0.035ms × 2,000 = 70.0ms 가 되고 고정 비용 21.5ms 를 더한 합계 91.5ms 는 예산의 92% 라 통과합니다. 3단계 내역을 보면 이 2,000개에서 가장 큰 구간은 모델 추론으로, 0.020ms × 2,000 = 40.0ms 가 합계 91.5ms 의 43.7% 를 차지합니다. 다음은 광고 피처 조회 16.0ms(17.5%)이고 고정 비용 가운데 가장 큰 네트워크 왕복 12ms 는 세 번째입니다.

모델 추론처럼 후보 수에 비례하는 구간이 합계를 키우므로 예산 초과는 늘 같은 방식으로 찾아옵니다. **고정 비용이 아니라 후보 수가 예산을 넘깁니다.** 합계는 후보 100개일 때 25ms 로 예산의 25% 만 쓰는데 5,000개에서는 후보 비례 비용이 0.035ms × 5,000 = 175.0ms 로 늘어 합계 196.5ms 가 되고 예산을 96.5ms 넘습니다. 25ms 에서 196.5ms 로, 두 배쯤이 아니라 여덟 배 가까이 늘어납니다.

4단계는 예산 100ms 에서 고정 비용 21.5ms 를 뺀 78.5ms 를 후보 1개당 0.035ms 로 나눠 예산 안에 드는 최대 후보 수를 78.5 / 0.035 = **2,242개**로 찍습니다. 이 2,242개가 아키텍처를 정합니다. 광고가 10만 개 있어도 정밀 모델에 넣을 수 있는 후보는 2천여 개뿐이므로 **정밀 랭킹 앞에는 후보를 좁히는 단계가 반드시 들어갑니다.** 그 단계는 유저와 광고를 각각 벡터로 바꾼 뒤 유저 벡터와 가까운 광고를 빠르게 골라내는 Two-Tower 같은 후보 생성 모델이 맡습니다. 자세한 내용은 [Two-Tower 후보 생성(Two-Tower Retrieval)](post.html?id=two-tower-retrieval) 편에 있습니다.

## 3. 모델 경량화: 정확도와 속도의 트레이드오프

**랭킹 단계의 복잡한 모델은 앞단 랭킹에 쓰기에 너무 느리므로 AUC 를 조금 내주고 속도를 얻는 경량화 기법 3가지(증류, 양자화, 가지치기) 가운데 용도에 맞는 것을 고릅니다.**

트레이드오프(trade-off)는 하나를 얻으려면 다른 하나를 내줘야 하는 관계입니다. 경량화에서는 속도를 얻는 대신 정확도를 조금 내줍니다. 랭킹 단계의 복잡한 모델을 앞단 랭킹에 그대로 쓰면 후보 수백 개를 시간 안에 계산하지 못하므로, 모델을 작고 빠르게 바꾸는 경량화로 속도를 확보합니다. 아래 카드는 세 기법의 원리, 속도 개선, AUC 손실, 알맞은 자리를 나란히 보여 줍니다. 카드의 속도 개선 5-10x 는 5~10배 빨라진다는 뜻입니다. AUC 손실 -0.005 ~ -0.015 는 경량화한 모델의 AUC 가 원래 모델보다 그만큼 낮아진다는 뜻이라 0 에 가까울수록 좋습니다.

<div class="chart-cards">
  <div class="chart-card">
    <div class="chart-card-header">
      <div class="chart-card-icon yellow">D</div>
      <div>
        <div class="chart-card-name">Knowledge 증류(Distillation)</div>
        <div class="chart-card-subtitle">Teacher → Student 학습</div>
      </div>
    </div>
    <div class="chart-card-body">
      <div class="chart-card-row">
        <span class="chart-card-row-label">원리</span>
        <span class="chart-card-row-value">복잡한 Teacher 모델의 출력을 Student가 모방</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">속도 개선</span>
        <span class="chart-card-row-value">5-10x</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">AUC 손실</span>
        <span class="chart-card-row-value">-0.005 ~ -0.015</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">적합</span>
        <span class="chart-card-row-value">앞단 랭킹 모델 생성</span>
      </div>
    </div>
  </div>
  <div class="chart-card">
    <div class="chart-card-header">
      <div class="chart-card-icon green">Q</div>
      <div>
        <div class="chart-card-name">양자화(Quantization)</div>
        <div class="chart-card-subtitle">FP32 → INT8/FP16</div>
      </div>
    </div>
    <div class="chart-card-body">
      <div class="chart-card-row">
        <span class="chart-card-row-label">원리</span>
        <span class="chart-card-row-value">모델 가중치의 정밀도를 낮춤</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">속도 개선</span>
        <span class="chart-card-row-value">2-4x</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">AUC 손실</span>
        <span class="chart-card-row-value">-0.001 ~ -0.003</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">적합</span>
        <span class="chart-card-row-value">랭킹 모델 가속</span>
      </div>
    </div>
  </div>
  <div class="chart-card">
    <div class="chart-card-header">
      <div class="chart-card-icon orange">P</div>
      <div>
        <div class="chart-card-name">가지치기(Pruning)</div>
        <div class="chart-card-subtitle">불필요한 뉴런/레이어 제거</div>
      </div>
    </div>
    <div class="chart-card-body">
      <div class="chart-card-row">
        <span class="chart-card-row-label">원리</span>
        <span class="chart-card-row-value">기여도 낮은 파라미터를 0으로 설정</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">속도 개선</span>
        <span class="chart-card-row-value">2-5x (sparse 지원 시)</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">AUC 손실</span>
        <span class="chart-card-row-value">-0.002 ~ -0.01</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">적합</span>
        <span class="chart-card-row-value">대형 모델 압축</span>
      </div>
    </div>
  </div>
</div>

세 기법을 하나씩 풀면 이렇습니다. **증류(Knowledge Distillation)** 는 큰 모델(Teacher)이 낸 확률값을 작은 모델(Student)이 따라 배우게 하는 방법입니다. 작은 모델이 정답 라벨 대신 큰 모델이 매긴 확률값을 따라 배우므로 큰 모델의 판단을 물려받습니다.

**양자화(Quantization)** 는 가중치를 나타내는 숫자의 정밀도를 낮추는 방법입니다. 소수점 아래 자리를 줄이는 일이라고 보면 되는데, 32비트 부동소수점(FP32)으로 저장하던 가중치를 8비트 정수(INT8)로 나타내면 2~4배 빨라집니다. 카드의 FP16 은 16비트 부동소수점입니다.

**가지치기(Pruning)** 는 기여도가 낮은 파라미터(학습으로 정해지는 가중치)를 0 으로 만들어 거의 쓰이지 않는 뉴런을 잘라 냅니다. 정확도는 거의 그대로이고 계산만 줄어듭니다. 카드의 속도 개선 2-5x 는 0 이 된 파라미터를 건너뛰고 계산하는 sparse 연산을 지원할 때의 값입니다.

세 기법 가운데 무엇을 쓸지 고르는 기준은 **AUC 를 얼마 잃고 속도를 얼마 얻는가** 하나뿐입니다. 앞단 랭킹은 recall 만 지키면 되므로 AUC 를 조금 더 잃더라도 속도를 크게 얻는 증류가 맞습니다. 랭킹은 정확도가 곧 매출이므로 AUC 손실이 -0.001 ~ -0.003 으로 가장 작은 양자화가 맞습니다.

### 실전 경량화 전략

아래 상자는 원래 랭킹 모델(DeepFM)을 증류와 양자화로 줄였을 때 AUC 와 레이턴시가 어떻게 바뀌는지 보여 주는 예입니다.

```text
[Ranking 모델 - 원본]
  DeepFM, 50M parameters, FP32
  AUC: 0.823, 레이턴시: 5ms/50ads
  → 이것이 "정답"이지만 Pre-Ranking에는 너무 느림

[Pre-Ranking 모델 - Distillation]
  2-Layer MLP (Teacher=DeepFM), 500K parameters, FP16
  AUC: 0.810 (-0.013), 레이턴시: 0.3ms/500ads
  → 17x 빠름, AUC 손실 1.5% — Pre-Ranking에 충분

[Ranking 모델 - Quantization]
  DeepFM, 50M parameters, INT8
  AUC: 0.821 (-0.002), 레이턴시: 2ms/50ads
  → 2.5x 빠름, AUC 손실 0.2% — Ranking 가속에 사용
```

원래 DeepFM 은 파라미터 5천만 개(50M)를 FP32 로 저장하는 모델로, AUC 는 0.823 이고 광고 50개를 계산하는 데 5ms 가 걸립니다. 상자는 이 모델을 기준이 되는 「정답」으로 두지만 앞단 랭킹에 쓰기에는 너무 느리다고 봅니다.

증류한 앞단 랭킹 모델은 DeepFM 을 Teacher 로 삼아 배운 2-Layer MLP(층이 2개인 신경망)로, 파라미터가 50만 개(500K)이고 FP16 을 씁니다. AUC 는 0.823 에서 0.810 으로 내려가지만(-0.013) 광고 500개를 0.3ms 에 계산하므로, 상자는 기준 모델이 광고 50개에 쓰던 5ms 와 비교해 17배 빠르다고 적었습니다. 상자는 이 AUC 손실 1.5% 를 앞단 랭킹에는 충분한 수준으로 판정합니다.

양자화한 랭킹 모델은 같은 DeepFM 의 가중치를 INT8 로 바꾼 모델입니다. AUC 는 0.823 에서 0.821 로 내려가고(-0.002) 광고 50개를 계산하는 시간은 5ms 에서 2ms 로 줄어 5 ÷ 2 = 2.5배 빨라집니다. AUC 손실이 0.2% 뿐이라 상자는 이 모델을 랭킹 가속에 씁니다.

---

## 4. 임베딩 조회(Embedding Lookup) 최적화: 숨은 병목

**DeepFM, DIN 같은 광고 추천 모델에서 가장 큰 병목은 신경망 층의 계산이 아니라 큰 표에서 ID 마다 둔 벡터를 찾아 읽는 임베딩 조회이므로, 이 구간은 계산량보다 데이터를 찾아가는 거리를 줄여야 빨라집니다.**

광고 추천 모델은 유저 ID, 광고 ID, 카테고리 같은 값마다 학습으로 정한 숫자 벡터를 표에 담아 두는데, 이 벡터를 임베딩(Embedding)이라고 부릅니다. 요청이 오면 먼저 그 요청에 나온 ID 의 벡터를 표에서 꺼내는데 이 일이 임베딩 조회입니다. 꺼낸 벡터는 모든 입력이 모든 출력과 연결된 신경망 층인 조밀 층(Dense Layer)을 지나 확률이 됩니다. 그런데 임베딩 표는 수십 GB 에 이르고 요청마다 표의 흩어진 자리를 읽어야 하므로, 이런 모델에서 가장 큰 병목은 조밀 층의 연산이 아니라 임베딩 조회입니다.

### 임베딩(Embedding)이 병목이 되는 까닭

먼저 임베딩 표가 얼마나 큰지 계산해 봅니다. 숫자 하나를 FP32(4바이트)로 저장하면 표의 크기는 ID 수 × 차원 수 × 4바이트입니다.

```text
유저 ID: 1억 개   × 64차원 × 4B(FP32) = 25.6GB
광고 ID: 1000만 개 × 64차원 × 4B(FP32) = 2.56GB
카테고리: 1만 개   × 32차원 × 4B(FP32) = 1.3MB
──────────────────────────────────────────
총 Embedding 테이블: ~28GB → 단일 GPU 메모리(16-80GB) 초과 가능
```

유저 ID 1억 개에 64차원(숫자 64개짜리) 벡터를 두면 1억 × 64 × 4B = 25.6GB 입니다. 같은 계산으로 광고 ID 1000만 개는 2.56GB, 32차원인 카테고리 1만 개는 1.3MB 라 표 전체가 약 28GB 가 되어 단일 GPU 메모리(16-80GB)를 넘을 수 있습니다.

추론할 때는 요청마다 그 요청의 유저와 광고 임베딩을 조회해야 하는데, 이 조회가 랜덤 메모리 접근이라 캐시 미스가 자주 납니다. 랜덤 메모리 접근은 메모리 여기저기 흩어진 자리를 순서 없이 찾아 읽는 방식입니다. 캐시 미스는 찾는 데이터가 가까이 둔 빠른 캐시에 없어 더 멀고 느린 메모리까지 가야 하는 경우입니다.

랜덤 접근이 느린 까닭은 메모리를 읽는 방식에 있습니다. 조밀 층 연산은 메모리에 이어 붙은 자리를 순서대로 읽지만 임베딩 조회는 흩어진 자리를 한 칸씩 찾아가 읽으므로, 읽는 양이 같아도 흩어진 자리를 찾아가는 시간이 전체 시간을 지배합니다. 그래서 이 구간을 빠르게 하려면 연산을 줄이기보다 **데이터를 찾아가는 거리를 줄여야** 합니다.

### 임베딩 조회 최적화 기법

아래 표는 임베딩 조회를 빠르게 하거나 임베딩 표를 작게 만드는 기법 5가지의 원리와 효과입니다.

| 기법 | 원리 | 효과 |
|------|------|------|
| **임베딩 캐시** | Hot user/ad의 임베딩을 L1 캐시에 유지 | 조회 레이턴시 10x 감소 |
| **Mixed-Dimension** | 빈도 높은 ID는 64차원, 낮은 ID는 16차원 | 메모리 50% 절감 |
| **해시 임베딩(Hash Embedding)** | ID → hash → 공유 임베딩 (충돌 허용) | 메모리 90%+ 절감 |
| **CPU/GPU Split** | 임베딩은 CPU(대용량 메모리), Dense는 GPU | 메모리 제약 해소 |
| **임베딩 압축** | PQ(Product 양자화)로 벡터 압축 | 메모리 4-8x 절감 |

효과 칸을 보면 임베딩 캐시가 조회 레이턴시를 줄이는 반면 나머지 4가지는 메모리 문제를 풉니다.

- **임베딩 캐시**는 요청이 몰리는 유저와 광고(Hot user/ad)의 임베딩을 가장 가까운 단계의 캐시(L1 캐시)에 둬서 찾아가는 거리를 줄이므로 조회 레이턴시가 10배 줄어듭니다.

- **Mixed-Dimension** 은 자주 나오는 ID 에는 64차원, 드물게 나오는 ID 에는 16차원 벡터를 줘서 메모리를 50% 아낍니다.

- **해시 임베딩(Hash Embedding)** 은 ID 를 해시 함수(입력을 정해진 범위의 번호로 바꾸는 함수)에 넣어 나온 번호의 칸을 여러 ID 가 함께 쓰게 합니다. 서로 다른 ID 가 같은 칸에 들어가는 충돌을 허용하는 대신 메모리를 90% 넘게 줄입니다.

- **CPU/GPU Split** 은 큰 임베딩 표를 메모리가 넉넉한 CPU 쪽에 두고 조밀 층(Dense) 계산만 GPU 에 맡겨 GPU 메모리 제약을 풉니다.

- **임베딩 압축**은 PQ(Product Quantization)로 벡터를 압축해 메모리를 4-8배 줄입니다. PQ 는 벡터를 몇 조각으로 나눈 뒤 조각마다 미리 정해 둔 대표 벡터의 번호만 저장하는 방법입니다.

---

## 5. 서빙 인프라 아키텍처

**서빙 인프라는 요청을 나눠 주는 로드 밸런서, 점수를 매기는 모델 서버 군집, 어느 모델 버전을 누구에게 보여 줄지 정하는 모델 관리 계층의 3층입니다. 가장 과소평가되는 층은 모델 관리 계층인데, 잘못된 모델을 빨리 되돌리는 일이 모델을 빠르게 돌리는 일보다 매출을 더 많이 지킵니다.**

모델 서버가 아무리 빨라도 새로 올린 모델이 잘못되었을 때 곧바로 되돌릴 장치가 없으면 잘못된 모델이 그대로 서빙됩니다. 아래 그림은 서빙 인프라를 위에서부터 3층으로 나눠 보여 줍니다.

<div class="chart-layer">
  <div class="chart-layer-title">LOAD BALANCER</div>
  <div class="chart-layer-row">
    <div class="chart-layer-group">
      <div class="chart-layer-group-label">L7 Load Balancer</div>
      <div class="chart-layer-items">
        <span class="chart-layer-item blue">QPS 분산</span>
        <span class="chart-layer-item blue">Health Check</span>
        <span class="chart-layer-item blue">Circuit Breaker</span>
      </div>
    </div>
  </div>
  <div class="chart-layer-arrow">v</div>
  <div class="chart-layer-title">MODEL SERVER CLUSTER</div>
  <div class="chart-layer-row">
    <div class="chart-layer-group">
      <div class="chart-layer-group-label">앞단 랭킹 Server</div>
      <div class="chart-layer-items">
        <span class="chart-layer-item yellow">경량 모델 (CPU)</span>
        <span class="chart-layer-item yellow">수평 확장 N대</span>
      </div>
    </div>
    <div class="chart-layer-group">
      <div class="chart-layer-group-label">랭킹 Server</div>
      <div class="chart-layer-items">
        <span class="chart-layer-item pink">DeepFM/DCN (GPU)</span>
        <span class="chart-layer-item pink">Batch 추론</span>
      </div>
    </div>
    <div class="chart-layer-group">
      <div class="chart-layer-group-label">임베딩 서비스(Embedding Service)</div>
      <div class="chart-layer-items">
        <span class="chart-layer-item cyan">대용량 임베딩 테이블</span>
        <span class="chart-layer-item cyan">Redis / 자체 KV Store</span>
      </div>
    </div>
  </div>
  <div class="chart-layer-arrow">v</div>
  <div class="chart-layer-title">MODEL MANAGEMENT</div>
  <div class="chart-layer-row">
    <div class="chart-layer-group">
      <div class="chart-layer-group-label">Model Registry</div>
      <div class="chart-layer-items">
        <span class="chart-layer-item purple">버전 관리</span>
        <span class="chart-layer-item purple">A/B 실험 할당</span>
      </div>
    </div>
    <div class="chart-layer-group">
      <div class="chart-layer-group-label">배포 전략</div>
      <div class="chart-layer-items">
        <span class="chart-layer-item green">Canary (5% 트래픽)</span>
        <span class="chart-layer-item green">Shadow (로그만, 서빙 안 함)</span>
        <span class="chart-layer-item green">Blue-Green (즉시 전환)</span>
      </div>
    </div>
    <div class="chart-layer-group">
      <div class="chart-layer-group-label">Rollback</div>
      <div class="chart-layer-items">
        <span class="chart-layer-item orange">성능 하락 감지 시 자동 롤백</span>
        <span class="chart-layer-item orange">이전 버전 즉시 복원</span>
      </div>
    </div>
  </div>
</div>

첫째 층의 **로드 밸런서(Load Balancer)** 는 들어온 요청을 여러 서버에 나눠 주는 장치입니다. 그림의 L7 은 요청의 내용(HTTP 경로 같은 정보)까지 보고 나누는 방식을 뜻합니다. Health Check 는 죽은 서버를 찾아 목록에서 뺍니다. Circuit Breaker 는 계속 실패하는 서버로 가는 요청을 끊어 그 서버에 더는 요청을 보내지 않습니다.

둘째 층의 **모델 서버 군집**은 실제로 점수를 매기는 서버들입니다. 앞단 랭킹 서버는 경량 모델을 CPU 에서 돌리는데, 서버 대수를 늘려 처리량을 키우는 수평 확장으로 N대까지 둡니다. DeepFM, DCN 같은 무거운 모델은 GPU 를 쓰는 랭킹 서버가 배치 추론으로 계산합니다. 임베딩 표는 메모리가 큰 별도의 임베딩 서비스(Embedding Service)에 두고 Redis(메모리 기반 저장소)나 자체 KV Store(키로 값을 찾는 저장소)에서 조회합니다.

셋째 층의 **모델 관리 계층**은 어느 모델 버전을 누구에게 보여 줄지 정합니다. Model Registry 는 학습된 모델의 버전을 관리하고 A/B 실험(트래픽을 나눠 두 버전의 성과를 비교하는 실험)에 버전을 할당합니다. 배포 전략은 새 모델을 트래픽에 내보내는 방법으로 Canary, Shadow, Blue-Green 이 있고 아래 표에서 비교합니다. Rollback 은 성능 하락을 감지하면 자동으로 이전 버전을 즉시 복원합니다.

모델을 빠르게 돌리는 일보다 **잘못된 모델을 빨리 되돌리는 일**이 매출을 더 많이 지키는데, 세 층 가운데 가장 과소평가되는 층이 바로 그 일을 맡은 셋째 층입니다. 서버와 네트워크 같은 인프라 전반은 [쿠버네티스 네트워킹](post.html?id=kubernetes-networking) 편과 [소프트웨어 아키텍처 패턴](post.html?id=software-architecture-patterns) 편에서 다룹니다.

### 배포 전략 비교

세 배포 전략은 새 모델의 예측을 실제 응답에 얼마나 쓰느냐에 따라 위험도가 달라집니다.

| 전략 | 방식 | 위험도 | 적합한 경우 |
|------|------|-------|-----------|
| **Shadow** | 새 모델 로그만 기록, 실제 서빙은 기존 모델 | 매우 낮음 | 신규 아키텍처 검증 |
| **Canary** | 5% 트래픽에만 새 모델 적용 | 낮음 | 일상적 모델 업데이트 |
| **Blue-Green** | 전체 트래픽을 새 모델로 즉시 전환 | 높음 | 긴급 핫픽스, 검증 완료 후 |

Shadow 는 새 모델이 예측을 로그에만 남기고 실제 응답은 기존 모델이 내므로 위험도가 매우 낮습니다. 신규 아키텍처를 검증할 때 이 전략을 씁니다. Canary 는 트래픽 5% 에만 새 모델을 쓰므로 위험도가 낮고 일상적인 모델 업데이트에 맞습니다. Blue-Green 은 기존 모델이 도는 환경과 새 모델이 도는 환경을 나란히 두고 전체 트래픽을 한 번에 새 쪽으로 돌리는 방식이라 위험도가 높습니다. 알맞은 경우는 긴급 핫픽스(급한 오류 수정)나 검증을 마친 뒤입니다.

### Canary 배포 의사결정

아래 상자는 Canary 배포로 새 모델 v2 를 내보낼 때 날마다 무엇을 보고 어떻게 판단하는지 적은 예입니다.

```text
[Day 0] 새 모델 v2 학습 완료, 오프라인 AUC +0.005

[Day 1] Canary 배포: 5% 트래픽
  모니터링: AUC, Calibration, Win Rate, CPX
  → 24시간 관찰

[Day 2] 결과 확인
  Case A: 모든 지표 개선 → 25% → 50% → 100% (점진 확대)
  Case B: AUC 개선이지만 CPX 악화 → 원인 분석
  Case C: 성능 하락 → 즉시 롤백 (자동)
```

Day 0 에 오프라인 AUC(서빙 전에 지난 데이터로 측정한 AUC)가 +0.005 오른 v2 가 나오면 Day 1 에 트래픽 5% 에만 v2 를 쓰고 24시간 동안 AUC, Calibration, Win Rate, CPX 를 지켜봅니다. Win Rate(낙찰률)는 입찰한 경매 가운데 이긴 비율입니다. CPX 는 클릭이나 전환 같은 성과 한 건을 얻는 데 드는 비용(CPC, CPA 등)으로 낮을수록 좋습니다.

Day 2 의 판단은 세 갈래입니다. 모든 지표가 좋아지면(Case A) 트래픽을 25%, 50%, 100% 로 차례로 넓힙니다. AUC 는 좋아졌지만 CPX 가 나빠졌으면(Case B) 원인을 분석합니다. 성능이 떨어지면(Case C) 즉시 자동으로 롤백합니다. Case B 는 AUC 가 좋아져도 CPX 가 나빠질 수 있다는 것을 보여 줍니다.

---

## 6. GPU vs CPU 추론: 실행 위치의 선택

**GPU 는 한 번 실행할 때마다 약 2ms 의 고정 오버헤드가 들어 후보를 많이 모아 한 번에 넣을수록 유리하지만 배치가 찰 때까지 먼저 온 요청이 기다려야 하므로, 응답 시간 상한을 넘지 않는 가장 큰 배치를 고르거나 한가할 때 배치를 줄입니다.**

GPU 가 CPU 보다 빠르다는 생각만으로 모든 모델을 GPU 에 올리면 후보를 하나씩 계산하는 앞단 랭킹은 오히려 CPU 보다 느려집니다. 아래 표는 CPU 추론과 GPU 추론을 레이턴시, 처리량, 비용, 알맞은 단계, 임베딩으로 비교합니다. 처리량(throughput)은 서버가 1초에 처리하는 요청 수로 클수록 좋습니다.

| | CPU 추론 | GPU 추론 |
|---|---|---|
| **레이턴시** | 단건 빠름 (~0.5ms) | 단건 느림 (~2ms, 커널 오버헤드) |
| **처리량** | 낮음 (직렬) | 높음 (배치 병렬) |
| **비용** | 서버당 저렴 | 서버당 비쌈 |
| **적합** | 앞단 랭킹 (단건 빠른 응답) | 랭킹 (배치 스코어링) |
| **임베딩** | 대용량 메모리 가능 | 메모리 제한 (16-80GB) |

표의 직렬은 후보를 하나씩 차례로 계산한다는 뜻입니다. 배치 병렬은 여러 후보를 한 번에 같이 계산한다는 뜻입니다. 표의 첫 두 줄에서 GPU 는 단건 레이턴시가 CPU 보다 느린데도(~2ms 대 ~0.5ms) 처리량은 더 높습니다. 헷갈리기 쉬운 대목이지만 까닭은 단순합니다. GPU 는 한 번 실행할 때마다 커널 실행과 텐서 복사에 오버헤드가 2ms 쯤 듭니다. 커널은 GPU 에서 돌아가는 계산 함수입니다. 텐서 복사는 입력 데이터를 CPU 메모리에서 GPU 메모리로 옮기는 일입니다. 두 시간은 한 번 실행에 한 번씩 들어서 넣는 후보가 몇 개든 같습니다.

그래서 후보를 1개만 넣으면 그 1개가 오버헤드 2ms 를 혼자 떠안아 CPU 보다 느립니다. 후보 40개를 한 번에 넣으면 같은 2ms 를 40개가 나눠 하나당 2 ÷ 40 = 0.05ms 만 떠안으므로 하나당 시간이 훨씬 짧아집니다. 그러므로 GPU 를 쓸지는 모델 크기가 아니라 **한 번에 몇 개를 같이 넣는가**로 정합니다.

그렇다고 후보를 무조건 많이 모아 넣을 수도 없습니다. 배치가 찰 때까지 먼저 온 요청은 기다려야 하므로 배치를 키우면 처리량이 오르는 대신 지연이 늘어납니다. 처리량과 지연이 맞서는 이 지점에서 둘의 균형을 정하는 조절값이 배치 크기입니다. 배치에 맨 먼저 온 요청이 가장 오래 기다리므로 아래 코드는 그 대기에 추론 시간을 더한 값을 p99 로 어림합니다. p99 는 요청을 응답 시간 순으로 늘어놓았을 때 느린 쪽 1% 가 시작되는 값으로, 요청 100개라면 가장 느린 1개쯤이 겪는 응답 시간이라 낮을수록 좋습니다.

배치 크기를 1, 8, 32, 128 로 바꿔 가며 확인해 보겠습니다. 카드에서는 배치 크기마다 필요한 서버 수와 p99 막대가 10ms 예산 선을 넘는지를 보면 됩니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-serving-cards.html?embed=1&card=batch" height="480" loading="lazy" title="몇 건씩 묶어 한 번에"></iframe>
<a class="demo-embed-open" href="demo-serving-cards.html" target="_blank" rel="noopener">↗ 카드 다섯 장 전체로 열기</a>
</div>

아래 코드는 서비스 전체에 들어오는 요청을 초당 2만 건(ARRIVAL_QPS)으로 놓고 배치 1회마다 고정 오버헤드 2.0ms 와 후보 1개당 연산 0.05ms 가 든다고 가정합니다. 배치 크기마다 추론 시간, 배치 대기, p99, 필요한 서버 수를 구해 p99 상한 10ms 와 비교합니다. 수치는 모두 가상값입니다.

```python
# 하는 일: 배치를 1, 8, 32, 128건으로 묶을 때 추론 시간, 배치 대기, p99, 필요한 서버 수를 구해 p99 상한 10ms 와 비교한다.
import math

# 1단계: 도착률과 배치 비용, p99 상한을 둔다
# 크게 묶으면 처리량은 오르고, 먼저 온 요청은 배치가 찰 때까지 기다린다. 수치는 가상값이다. 사내에서 측정한 값이 아니라 자리 크기만 맞춘 대략치다.
ARRIVAL_QPS = 20000.0    # 서비스 전체 도착률
KERNEL_MS = 2.0          # 배치 1회당 고정 오버헤드(커널 실행, 텐서 복사)
PER_ITEM_MS = 0.05       # 후보 1개당 순수 연산
P99_BUDGET_MS = 10.0     # 모델 서버가 지켜야 할 p99 상한

# 2단계: 배치 크기마다 p99 와 필요한 서버 수를 구한다
# 배치에 맨 먼저 온 요청이 가장 오래 기다리므로, 그 대기에 추론 시간을 더한 값을 p99 로 어림한다. 서버 수는 도착률을 서버 1대가 감당하는 QPS 로 나눈 뒤 소수점 아래를 올린 값이다.
print("배치   추론    배치대기   p99      서버1대QPS  필요서버  판정")
for B in (1, 8, 32, 128):
    infer = KERNEL_MS + PER_ITEM_MS * B        # 배치 1회 추론에 걸리는 시간
    wait = (B - 1) / ARRIVAL_QPS * 1000        # 먼저 온 요청이 배치가 찰 때까지 기다리는 시간
    p99 = wait + infer                         # 꼬리 지연 = 대기 + 추론
    qps = B / infer * 1000                     # 서버 1대가 감당하는 QPS
    servers = math.ceil(ARRIVAL_QPS / qps)     # 도착률을 다 받으려면 몇 대 필요한가
    ok = "통과" if p99 <= P99_BUDGET_MS else "탈락"
    print("%4d %6.2fms %7.2fms %6.2fms %10.0f %8d대  %s"
          % (B, infer, wait, p99, qps, servers, ok))

# 출력:
# 2단계 뜻: 배치를 1 에서 32 로 키우면 필요한 서버가 41대에서 3대로 줄어든다. 128 로 키우면 서버는 2대로 하나만 더 줄고, p99 가 14.75ms 로 상한을 넘어 탈락한다.
# 배치   추론    배치대기   p99      서버1대QPS  필요서버  판정
#    1   2.05ms    0.00ms   2.05ms        488       41대  통과
#    8   2.40ms    0.35ms   2.75ms       3333        6대  통과
#   32   3.60ms    1.55ms   5.15ms       8889        3대  통과
#  128   8.40ms    6.35ms  14.75ms      15238        2대  탈락
```

찍힌 표를 한 줄씩 따라가 봅니다. 배치 1건은 추론이 고정 오버헤드 2.0ms 에 연산 0.05ms 를 더한 2.05ms 라 서버 1대가 1초(1000ms)에 1000 ÷ 2.05 ≈ 488건을 처리하므로, 초당 2만 건을 받으려면 41대가 필요합니다. 배치 32건은 추론이 2.0 + 0.05 × 32 = 3.60ms 로 늘지만 한 번에 32건을 처리해서 서버 1대가 초당 32 ÷ 3.60 × 1000 ≈ 8889건을 감당하므로 3대면 됩니다. 그래서 배치를 1 에서 32 로 키우면 서버가 41대에서 3대로 13.7배 줄어듭니다.

그런데 배치 128건은 맨 먼저 온 요청이 배치가 다 찰 때까지 기다리는 배치 대기 6.35ms 에 추론 8.40ms 가 더해져 p99 가 14.75ms 로 상한 10ms 를 넘으므로, 서버가 2대로 하나 더 줄어도 탈락합니다. 코드는 배치 대기를 나머지 요청이 서비스 전체 도착률(초당 2만 건)로 들어오는 시간으로 계산해 배치 8건에 0.35ms, 32건에 1.55ms 를 찍습니다.

**배치를 키워 얻는 이득은 금방 한계에 닿지만 배치 대기는 계속 선형으로 늘어납니다.** 배치가 커지면 고정 오버헤드 2.0ms 를 나눠 갖는 건수가 늘어 서버 수가 41대, 6대, 3대로 크게 줄다가, 건당 연산 0.05ms 는 배치를 키워도 줄지 않으므로 128건에서는 2대로 하나만 더 줄어듭니다. 반면 배치 대기는 0.00ms, 0.35ms, 1.55ms, 6.35ms 로 배치 크기에 비례해 계속 붙습니다. 그래서 실무에서는 예산을 넘지 않는 가장 큰 배치로 크기를 고정하거나 한가할 때 배치를 줄이는 동적 배칭(dynamic batching)을 씁니다. 이 표에서 상한을 지킨 배치 가운데 가장 큰 값은 32건입니다.

### 최적 조합

표와 배치 계산을 합치면 단계마다 맞는 장치가 정해집니다. 앞단 랭킹은 후보 500개를 하나씩 빠르게 계산해야 하므로 단건 레이턴시가 짧은 CPU 에서 0.01ms × 500 = 5ms 에 돌립니다. 랭킹은 후보 50개를 한 번에 넣을 수 있으므로 배치 처리량이 높은 GPU 에서 50개를 3ms 에 계산합니다.

<div class="chart-arch">
  <div class="chart-arch-row">
    <div class="chart-arch-section">
      <div class="chart-arch-section-header">
        <span class="chart-arch-section-title yellow">앞단 랭킹: CPU</span>
      </div>
      <div class="chart-arch-grid">
        <div class="chart-arch-node">
          <div class="chart-arch-node-name">경량 모델 (LR, 작은 MLP)</div>
          <div class="chart-arch-node-desc">500개 후보를 개별 스코어링</div>
        </div>
        <div class="chart-arch-node">
          <div class="chart-arch-node-name">단건 레이턴시 중심</div>
          <div class="chart-arch-node-desc">0.01ms/개 x 500 = 5ms</div>
        </div>
      </div>
    </div>
    <div class="chart-arch-section">
      <div class="chart-arch-section-header">
        <span class="chart-arch-section-title pink">랭킹: GPU</span>
      </div>
      <div class="chart-arch-grid">
        <div class="chart-arch-node">
          <div class="chart-arch-node-name">복잡 모델 (DeepFM, DCN)</div>
          <div class="chart-arch-node-desc">50개 후보를 배치 스코어링</div>
        </div>
        <div class="chart-arch-node">
          <div class="chart-arch-node-name">배치 처리량 중심</div>
          <div class="chart-arch-node-desc">50개 한번에 = 3ms (GPU 배치)</div>
        </div>
      </div>
    </div>
  </div>
</div>

---

## 7. 장애 대응과 SLA

**광고 서빙에서는 서버가 살아 있어도 예산을 넘긴 응답이 거래소에서 버려져 응답이 없는 것과 같으므로, 고칠 때까지 멈추는 대신 정확도를 조금씩 포기하면서 응답은 계속 냅니다.**

광고 모델 서빙에 장애가 나면 곧바로 매출 손실로 이어지는데, 1분만 멈춰도 수백만 건의 입찰 기회를 잃습니다. 다만 광고 서빙은 장애의 뜻이 일반 웹 서비스와 다릅니다. 일반 웹 서비스에서는 서버가 죽어야 장애입니다. 광고 서빙에서는 예산을 넘긴 응답이 거래소에서 버려져 느린 응답과 없는 응답의 결과가 같으므로, 서버가 모두 살아 있어도 응답이 12ms 걸려 예산을 넘기면 장애입니다.

이 차이 때문에 대응 방향도 다릅니다. 광고 서빙은 고칠 때까지 멈추는 대신 **정확도를 조금씩 포기하면서 응답은 계속 내는** 방향으로 대응하므로 아래 표의 대응 칸은 모두 폴백이나 자동 조절입니다. 폴백(fallback)은 원래 방법이 실패하거나 늦을 때 미리 정해 둔 덜 정확한 방법으로 대신 응답하는 방식입니다.

| 장애 유형 | 영향 | 대응 |
|-----------|------|------|
| **Model Server 다운** | 추론 불가 | Auto-scaling + 다중 AZ 배포 |
| **레이턴시 스파이크** | 타임아웃 증가 → Win Rate 하락 | 타임아웃 시 캐시된 예측값 사용 |
| **새 모델 성능 저하** | CPX 악화, 예산 낭비 | Canary 자동 롤백 (5분 이내) |
| **임베딩 서비스 장애** | 피처 누락 → 부정확한 예측 | Default 임베딩 + Degraded Model |
| **GPU OOM** | 추론 실패 | 배치 크기 자동 조절 + CPU 폴백 |

표를 한 줄씩 읽으면 이렇습니다.

- 모델 서버가 다운되면 추론을 할 수 없으므로, 부하에 맞춰 서버 대수를 자동으로 늘리고 줄이는 Auto-scaling 과 서로 떨어진 데이터센터 구역(AZ, Availability Zone) 여러 곳에 서버를 나눠 두는 다중 AZ 배포로 대비합니다.

- 레이턴시 스파이크(지연이 갑자기 치솟는 현상)는 타임아웃을 늘려 Win Rate 를 떨어뜨리므로, 타임아웃이 나면 캐시해 둔 예측값을 대신 씁니다.

- 새 모델의 성능이 떨어지면 CPX 가 나빠지고 광고비 예산이 낭비되므로 Canary 가 5분 안에 자동으로 롤백합니다.

- 임베딩 서비스가 멈추면 피처가 빠져 예측이 부정확해지므로, 미리 정해 둔 기본 벡터(Default 임베딩)와 정확도는 낮지만 빠진 피처 없이도 돌아가는 대체 모델(Degraded Model)을 씁니다.

- GPU OOM(GPU 메모리가 모자라 실행이 실패하는 오류)이 나면 추론이 실패하므로, 배치 크기를 자동으로 조절하고 CPU 로 폴백합니다.

### Timeout Fallback 계층

타임아웃이 날 때 정확도를 한 단계씩 포기하는 순서는 아래 상자와 같습니다.

```text
[정상] Ranking Model 응답 (3ms)
  → pCTR = 0.032

[Timeout 5ms] Ranking 느림 → Pre-Ranking 점수로 대체
  → pCTR ≈ 0.028 (덜 정확하지만 입찰 가능)

[Timeout 8ms] Pre-Ranking도 느림 → 캐시된 유저 평균 pCTR
  → pCTR = 0.025 (개인화 없음, 입찰은 유지)

[Timeout 10ms] 전체 장애 → 입찰 포기
  → 이 경우에만 기회 손실
```

정상일 때는 랭킹 모델이 3ms 에 응답해 pCTR 0.032 를 냅니다. 5ms 가 지나도 랭킹이 느리면 앞단 랭킹 점수로 바꿔 덜 정확한 pCTR 약 0.028 로라도 입찰합니다. 8ms 가 지나 앞단 랭킹도 느리면 캐시해 둔 그 유저의 평균 pCTR 0.025 를 써서 개인화 없이 입찰을 이어 갑니다. 10ms 가 될 때까지 아무 단계도 응답하지 못한 전체 장애에서만 입찰을 포기하므로 기회를 잃는 경우는 이 마지막 단계 하나뿐입니다.

아래 의사코드는 같은 순서를 try/except 와 경과 시간 검사로 짠 구조만 보여 주며 그대로 실행되지는 않습니다.

```python
# (의사코드 — 그대로 실행되지 않습니다.)
# 하는 일: 모델 장애에도 입찰 기회를 놓치지 않는 방어 계층인 Timeout Fallback 이 정확도를 한 단계씩 포기하는 구조만 보여 준다.

def score_with_fallback(user, candidates, timeout_ms=10):
    """다단계 Fallback: 정확도를 점진적으로 포기하되 입찰은 유지"""
    start = now()

    # Level 1: Ranking Model (최고 정확도, ~3ms)
    try:
        return ranking_model.predict(candidates, timeout=5)
    except TimeoutError:
        pass

    # Level 2: Pre-Ranking 점수 (덜 정확, 개인화 유지)
    if elapsed(start) < 8:
        log_fallback("preranking")
        return preranking_model.predict(candidates)

    # Level 3: 캐시된 평균 pCTR (개인화 없음, 입찰은 유지)
    if elapsed(start) < 10:
        log_fallback("cache")
        return [user_cache.get(user.id, GLOBAL_AVG)] * len(candidates)

    # Level 4: 전체 타임아웃 → 이 임프레션 건너뜀
    log_fallback("skip")
    raise BidSkipException("전체 장애 — 기회 손실")
```

Level 1 은 랭킹 모델을 5ms 타임아웃으로 호출합니다. 타임아웃이 나면 경과 시간이 8ms 전일 때는 Level 2 의 앞단 랭킹 점수를, 10ms 전일 때는 Level 3 의 캐시된 평균 pCTR(캐시에 없으면 전체 평균 GLOBAL_AVG)을 돌려줍니다. 10ms 가 지났으면 BidSkipException 으로 이 노출을 건너뜁니다. 단계를 내려갈 때마다 log_fallback 으로 어느 단계를 썼는지 남깁니다.

:::deep 더 깊이 — p99 를 평균보다 먼저 보는 까닭: 곱해지는 꼬리

평균이 3ms 인데 p99 까지 걱정해야 하느냐는 질문이 흔합니다. 광고 응답 한 번은 조회를 한 번이 아니라 **여러 번** 하므로 걱정해야 합니다. 후보 100개의 임베딩을 하나씩 조회하고 조회 하나가 느릴 확률이 1% 라면, 100번이 모두 빠를 확률은 0.99^100 이고 **적어도 하나**가 느릴 확률은 1 - 0.99^100 입니다. 조회 횟수마다 계산하면 아래와 같습니다.

```text
조회 50번  → 1 - 0.99^50  = 39.5%
조회 100번 → 1 - 0.99^100 = 63.4%
조회 500번 → 1 - 0.99^500 = 99.3%
```

조회가 50번이면 39.5%, 100번이면 63.4%, 500번이면 99.3% 의 요청에서 적어도 한 조회가 느립니다. 응답은 가장 느린 조회가 끝나야 나가므로 조회 하나의 1% 꼬리(응답 시간이 가장 느린 쪽 1%)가 조회 100번을 하는 요청의 63.4% 를 느리게 만듭니다. 요청 하나가 여러 하위 조회로 퍼지는 구조를 fan-out 이라고 합니다. 조회가 늘수록 모두 빠를 확률 0.99 가 그 횟수만큼 곱해져 작아지므로, 이 현상을 fan-out 의 곱셈 효과라고 부릅니다.

처방은 두 가지입니다. 첫째로 **fan-out 을 줄입니다.** 개별 조회 100번을 배치 조회 1번으로 합치면 느려질 확률을 100번이 아니라 한 번만 겪습니다. 둘째로 **꼬리를 잘라 냅니다.** 조회마다 짧은 타임아웃을 걸어 두고 그 안에 응답이 오지 않으면 기본값을 씁니다.
:::

---

## 8. 담장 안 서빙: 예측되는 요청량과 미리 계산한 피처 [무대: 닫힌 생태계]

**자기 앱과 웹페이지의 광고 자리에 자기 광고를 내보내는 닫힌 생태계는 트래픽이 자기 것이라 요청량을 예측할 수 있고 유저를 알아보는 키가 안정적이며 타임아웃도 내부 목표입니다. 이 덕분에 이곳의 튜닝은 같은 예산으로 더 무거운 모델을 돌리는 방향으로 갑니다.**

1~7절의 아키텍처는 같아도 그 아키텍처를 돌리는 무대에 따라 서빙의 난이도가 꽤 다릅니다. 닫힌 생태계는 네이버, 카카오처럼 한 회사가 자기 지면(광고가 실리는 앱이나 웹페이지의 자리)에 자기 광고를 내보내는 환경입니다. 이 글은 닫힌 생태계를 담장 안이라고도 부릅니다. 이곳에서는 **트래픽이 자기 것**이라 세 가지가 편해집니다.

첫째로 요청량을 예측할 수 있습니다. 어제 이 시간의 요청량이 오늘도 맞으므로 서버를 몇 대 둘지 미리 계산해 둘 수 있습니다.

둘째로 유저 키(유저를 알아보는 식별자)가 안정적입니다. 유저 키가 로그인 ID 라 같은 사람이 다시 오므로, 유저 피처와 임베딩을 미리 계산해 캐시(자주 쓰는 값을 빠른 메모리에 올려 둔 저장소)에 넣어 두면 대부분의 조회가 캐시에서 끝납니다.

셋째로 타임아웃이 남이 정한 규칙이 아닙니다. 타임아웃이 내부 목표라 조금 넘겨도 응답이 버려지지는 않습니다.

그래서 담장 안의 튜닝은 예산 안에 들어가는 일보다 **같은 예산으로 더 무거운 모델을 돌리는 일**에 힘을 씁니다. 피처를 미리 계산해 두면 요청마다 조회에 쓰던 시간이 줄어드는데 그렇게 아낀 시간을 모델 추론에 다시 씁니다.

---

## 9. 열린 RTB 서빙: 남이 정하는 트래픽과 맞지 않는 캐시 [무대: 열린 RTB]

**열린 RTB 의 DSP 는 요청이 거래소에서 오므로 요청량이 예고 없이 뛰고 쿠키(브라우저 식별 값)가 매번 달라 유저 쪽 캐시가 잘 맞지 않으며 100ms 를 1ms 만 넘겨도 응답이 버려집니다. 담장 안이 예산을 잘 쓰는 문제를 푼다면 열린 RTB 는 예산을 넘기지 않는 문제부터 풀어야 합니다.**

열린 RTB 는 남의 앱이나 웹페이지에 나갈 광고 자리를 거래소의 실시간 입찰로 사는 시장입니다. 이 시장에서 입찰하는 DSP 의 사정은 닫힌 생태계와 정반대입니다. 요청이 거래소에서 밀려오므로 **트래픽이 남의 것**입니다.

첫째로 요청량이 예고 없이 뜁니다. 거래소가 배분을 바꾸거나 새 퍼블리셔(광고 지면을 가진 매체)가 붙으면 평소의 몇 배가 들어옵니다.

둘째로 쿠키가 매번 다릅니다. 미리 계산해 둔 유저 피처를 찾을 키가 흔들리므로 캐시 미스가 늘어납니다.

셋째로 타임아웃도 남의 규칙입니다. 100ms 를 1ms 만 넘긴 응답도 거래소에서 버려지므로, 늦은 응답은 낙찰률(Win Rate) 0% 와 같습니다.

두 무대의 캐시 효과가 얼마나 다른지 계산해 보겠습니다. 아래 코드는 광고 100만 개에 요청 20만 건을 인기 광고로 쏠리게 뽑은 뒤 상위 0.1%, 1%, 10% 광고의 임베딩을 캐시할 때의 적중률, 평균 조회 지연, 메모리를 구합니다. 같은 캐시를 유저 임베딩에 쓸 때의 두 무대도 비교합니다. 적중률은 찾는 값이 캐시에 있던 요청의 비율로 높을수록 좋습니다. 임베딩 1회 조회는 캐시에 있으면 0.05ms, 없으면 1.20ms 가 든다고 둔 가상값입니다.

```python
# 하는 일: 요청 20만 건이 인기 광고에 쏠리게 뽑아, 상위 몇 % 를 캐시할 때의 적중률과 조회 지연을 구하고 유저 임베딩 캐시를 두 무대에서 비교한다.
import random
random.seed(42)

# 1단계: 광고 100만 개와 요청 20만 건, 조회 비용을 둔다
# 수치는 가상값이다. 임베딩 1회 조회는 캐시에 있으면 0.05ms, 없으면 1.20ms 가 든다.
N_ADS = 1_000_000              # 살아 있는 광고 소재 100만 개
REQUESTS = 200_000             # 요청 20만 건을 굴려 본다
HIT_MS, MISS_MS = 0.05, 1.20   # 임베딩 1회 조회: 캐시 적중 / 미스
DIM, FP32 = 16, 4              # 임베딩 16차원, FP32 = 4바이트

# 2단계: 요청이 인기 광고에 쏠리게 뽑는다
# 요청 쏠림을 log-uniform 으로 근사한다. rank = N^u (u 는 0~1 균등)이면 P(rank <= k) = log k / log N 이 되어 Zipf 와 비슷한 모양이 나온다.
ranks = [int(N_ADS ** random.random()) + 1 for _ in range(REQUESTS)]

# 3단계: 상위 0.1%, 1%, 10% 를 캐시할 때 적중률, 평균 지연, 메모리를 구한다
# 적중률은 상위 k개가 차지하는 요청 비율이고, 평균 지연은 적중과 미스를 그 비율로 섞은 값이다.
for pct in (0.001, 0.01, 0.1):
    k = int(N_ADS * pct)
    hit = sum(1 for r in ranks if r <= k) / REQUESTS   # 적중률 = 상위 k개가 먹는 요청 비율
    avg = hit * HIT_MS + (1 - hit) * MISS_MS           # 적중/미스를 섞은 기대 지연
    mem = k * DIM * FP32 / 1024 / 1024                 # 캐시가 먹는 메모리(MB)
    print("상위 %4.1f%%(%6d개) 캐시 | 적중 %4.1f%% | 평균 %5.3fms | %5.1fMB | %.1f배 빠름"
          % (pct * 100, k, hit * 100, avg, mem, MISS_MS / avg))

# 4단계: 같은 캐시를 유저 임베딩에 쓸 때 두 무대를 비교한다
# 같은 캐시라도 무대에 따라 다르다. 담장 안은 로그인 ID 라 같은 사람이 다시 오고, 열린 RTB 는 쿠키가 매번 달라 거의 다 미스다. 적중률 65% 와 12% 도 가상 수치다.
walled = 0.65 * HIT_MS + 0.35 * MISS_MS     # 로그인 ID라 같은 사람이 다시 온다
open_rtb = 0.12 * HIT_MS + 0.88 * MISS_MS   # 쿠키가 매번 달라 거의 다 미스
print("유저 임베딩 | 담장 안 적중 65%% -> %5.3fms | 열린 RTB 적중 12%% -> %5.3fms | %.1f배 차이"
      % (walled, open_rtb, open_rtb / walled))

# 출력:
# 3단계 뜻: 상위 1.0% 만 캐시해도 요청의 66.6% 가 적중한다. 상위 10.0% 를 캐시하면 메모리 6.1MB 로 조회가 5.0배 빨라진다.
# 상위  0.1%(  1000개) 캐시 | 적중 49.9% | 평균 0.626ms |   0.1MB | 1.9배 빠름
# 상위  1.0%( 10000개) 캐시 | 적중 66.6% | 평균 0.434ms |   0.6MB | 2.8배 빠름
# 상위 10.0%(100000개) 캐시 | 적중 83.3% | 평균 0.241ms |   6.1MB | 5.0배 빠름
# 4단계 뜻: 같은 캐시를 유저 임베딩에 쓰면 담장 안은 0.453ms, 열린 RTB 는 1.062ms 로 2.3배 차이 난다.
# 유저 임베딩 | 담장 안 적중 65% -> 0.453ms | 열린 RTB 적중 12% -> 1.062ms | 2.3배 차이
```

찍힌 3단계 줄을 보면 광고 쪽 캐시는 두 무대에서 똑같이 효과가 있습니다. 요청이 인기 광고에 쏠려 있어서 상위 0.1%(1000개)만 캐시해도 적중률이 49.9% 에 이르며 상위 1%(1만 개)를 캐시하면 요청의 66.6% 가 적중합니다. 상위 10%(10만 개)를 캐시하면 적중률이 83.3% 로 오르는데 메모리는 6.1MB 뿐입니다. 이때 평균 조회 지연은 적중 0.05ms 와 미스 1.20ms 를 적중률로 섞은 0.241ms 라, 캐시가 없을 때의 1.20ms 와 비교하면 1.20 ÷ 0.241 ≈ 5.0배 빠릅니다.

두 무대가 달라지는 곳은 유저 쪽입니다. 4단계 줄의 적중률 65% 와 12% 는 가상 수치입니다. 로그인 ID 가 안정적인 담장 안은 유저 임베딩도 적중률 65% 라 평균 지연이 0.65 × 0.05 + 0.35 × 1.20 ≈ 0.453ms 입니다. 쿠키가 1회성인 열린 RTB 는 적중률 12% 라 0.12 × 0.05 + 0.88 × 1.20 = 1.062ms 가 듭니다. 같은 하드웨어, 같은 코드인데도 1.062 ÷ 0.453 ≈ 2.3배 차이가 납니다. 그래서 열린 RTB 의 DSP 는 유저 피처를 적게 쓰고 광고 피처와 문맥 피처(지금 보는 페이지나 앱처럼 요청 자체에 담긴 정보)에 더 기댑니다.

### 두 무대의 서빙 조건 비교 (가상 데이터)

아래 표는 두 무대의 서빙 조건을 4가지로 비교합니다.

| | 닫힌 생태계 | 열린 RTB (DSP) |
|---|---|---|
| **요청량 예측** | 쉬움 (자사 트래픽) | 어려움 (거래소가 결정) |
| **용량 계획** | 예측 기반 사전 증설 | 과잉 프로비저닝 + 스로틀 |
| **예산 초과의 결과** | 내부 지연 목표 위반 | 응답 폐기 = 낙찰률 0% |
| **주의할 실패 모드** | 캐시가 낡아 피처가 과거값 | 스파이크에 큐가 밀려 p99 폭발 |

요청량 예측은 자사 트래픽인 닫힌 생태계에서 쉽고 거래소가 정하는 열린 RTB 에서 어렵습니다. 용량 계획도 달라서 닫힌 생태계는 예측을 바탕으로 서버를 미리 늘려 두는 반면 열린 RTB 는 필요보다 서버를 넉넉히 잡아 두는 과잉 프로비저닝(over-provisioning)과 감당할 수 없는 요청을 일부러 덜 받는 스로틀(throttle)을 함께 씁니다. 예산을 넘겼을 때 닫힌 생태계는 내부 지연 목표를 어기는 데 그치지만 열린 RTB 는 응답이 버려져 낙찰률이 0% 가 됩니다. 주의할 실패도 다른데, 닫힌 생태계에서는 캐시가 낡아 피처가 과거값으로 남는 실패를, 열린 RTB 에서는 요청이 갑자기 몰리는 스파이크에 처리 대기열(큐)이 밀려 p99 가 폭발하는 실패를 조심합니다.

숫자는 가상값이지만 방향은 실무와 같습니다. 담장 안은 주어진 예산을 잘 쓰는 문제를 푸는 반면 열린 RTB 는 예산을 넘기지 않는 문제부터 풀어야 합니다.

---

## 마무리

1. **단계별 랭킹이 광고 서빙 아키텍처의 중심입니다.** 후보 수천 개를 한 번에 점수 매길 수 없으므로 후보 생성 → 앞단 랭킹 → 랭킹 → 뒷단 랭킹의 깔때기로 후보를 줄여 가며 모델을 점점 복잡하게 씁니다.

2. **앞단 랭킹의 recall 이 전체 성능을 좌우합니다.** 앞단 랭킹에서 떨어진 광고는 랭킹의 정밀한 모델을 만날 기회가 없으므로, 앞단 랭킹에서는 정확도보다 recall 을 먼저 지킵니다.

3. **경량화는 AUC 를 조금 내주고 속도를 얻는 trade-off 입니다.** 증류(5-10x 빠름, AUC -1.5%), 양자화(2-4x 빠름, AUC -0.2%), 가지치기(2-5x 빠름, AUC -1%) 가운데 용도에 맞는 것을 고릅니다.

4. **임베딩 조회가 숨은 병목입니다.** 수십 GB 에 이르는 임베딩 테이블이 메모리와 레이턴시를 좌우합니다. 해시 임베딩, Mixed-Dimension, CPU/GPU Split 으로 이 병목에 대응합니다.

5. **배포는 Canary 가 기본입니다.** 새 모델은 언제나 트래픽 5% 로 시작해 24시간 지켜본 뒤 조금씩 넓힙니다. 성능이 떨어졌을 때 자동으로 롤백하는 장치는 반드시 있어야 합니다.

> 이 글의 서빙 계층은 [피처 스토어](post.html?id=feature-store-serving)가 공급하는 피처를 받아 씁니다. 그 모델은 [온라인 학습](post.html?id=online-learning-delayed-feedback)이 갱신하고 최종 입찰가는 [Auto-Bidding](post.html?id=auto-bidding-pacing)이 정합니다. 서빙은 이 파이프라인의 중심 계층입니다.

---

## 더 깊이 보기

- 피처를 꺼내와 모델에 넣기까지 → [Feature Store와 실시간 서빙](post.html?id=feature-store-serving)
- 각 단계에 어떤 모델을 놓나 → [Deep CTR 모델](post.html?id=deep-ctr-models)
- 수백만 후보에서 수천 개를 건져내는 1단계 → [Two-Tower Retrieval](post.html?id=two-tower-retrieval)
- 광고 요청 한 건이 흐르는 전체 경로 → [광고 서빙 플로우](post.html?id=ad-serving-flow)
- 보정 계층을 서빙 어디에 두나 → [Calibration](post.html?id=calibration)
- 배치 크기를 정한 뒤 그 지연을 실제로 측정하고 대시보드로 읽는 법 → [지연, 처리량과 Grafana 읽는 법](post.html?id=serving-latency-throughput)
- 광고 ML 전체 지도에서 이 글의 위치 → [ML 엔지니어 트랙](ml-track.html)