pCTR 모델의 AUC가 0.82라고 해서 프로덕션에서 0.82의 성능이 나오는 것은 아닙니다. **100ms RTB 타임아웃 안에서, 수백 개 후보 광고에 대해, 초당 수만 QPS로 추론**할 수 있어야 비로소 모델이 가치를 만듭니다. 이 글은 광고 ML 모델이 학습 환경을 떠나 프로덕션에서 서빙되는 전체 아키텍처를 해부합니다.

> **피처를 꺼내오는 쪽은 [Feature Store 포스트](post.html?id=feature-store-serving), 모델을 돌리는 쪽이 이 글입니다.** 모델이 낡지 않게 갱신하는 이야기는 [Online Learning 포스트](post.html?id=online-learning-delayed-feedback)에 있습니다. 이 글은 그 사이 — **모델이 피처를 받아 예측값을 반환하는 서빙 계층** 자체에 집중합니다.

---

## 1. 광고 모델 서빙의 제약 조건

일반적인 ML 서빙과 광고 모델 서빙은 근본적으로 다릅니다:

| 제약 | 일반 ML 서빙 | 광고 모델 서빙 |
|------|------------|-------------|
| **레이턴시** | 수백 ms OK | **10ms 이내** (DSP 내부 처리) |
| **후보 수** | 1건 (단건 추론) | **수백~수천 개** (후보 광고 전체) |
| **QPS** | 수백~수천 | **수만~수십만** |
| **모델 크기** | 수 GB OK | 레이턴시 제약으로 **경량화 필수** |
| **SLA** | 99.9% | **99.99%+** (장애 = 매출 손실) |
| **갱신 주기** | 주 1회 | **일 1회 + 실시간 Calibration** |

일반 ML 서빙이 손님 한 명에게 요리를 내는 레스토랑이라면, 광고 서빙은 점심시간 급식실입니다. 줄이 수만 명인데 한 사람당 국자를 한 번만 뜰 수 있습니다.

가장 자주 과소평가되는 칸은 **후보 수**입니다. 레이턴시가 10배 빡빡한 것보다, 한 요청에서 점수를 매길 광고가 수백 배 많다는 게 더 아픕니다. 단건 0.02ms인 가벼운 모델도 후보가 2,000개면 40ms입니다. 모델만 빠르게 만들어서는 풀리지 않습니다.

10ms 안에 500개 후보 광고를 모두 스코어링하는 것은 불가능합니다. 이것이 **Multi-Stage Ranking**이 필요한 이유입니다.

---

## 2. Multi-Stage Ranking: 깔때기 구조

전체 광고 후보를 한 번에 복잡한 모델로 스코어링하는 대신, **단계별로 후보를 줄이면서 모델 복잡도를 올리는** 깔때기 구조를 사용합니다:

<div class="chart-steps">
  <div style="font-size:0.85rem; font-weight:700; color:var(--text-primary); margin-bottom:12px;">Multi-Stage Ranking Pipeline (수천 &rarr; 1)</div>
  <div class="chart-step">
    <div class="chart-step-indicator">
      <div class="chart-step-dot green">1</div>
      <div class="chart-step-line"></div>
    </div>
    <div class="chart-step-content">
      <div class="chart-step-title">Retrieval (후보 생성) &mdash; 수천 &rarr; 수백</div>
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
      <div class="chart-step-title">Pre-Ranking (경량 스코어링) &mdash; 수백 &rarr; 50</div>
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
      <div class="chart-step-title">Ranking (정밀 스코어링) &mdash; 50 &rarr; 5</div>
      <div class="chart-step-desc">복잡한 모델(DeepFM, DCN, DIN)로 정밀 pCTR/pCVR 예측. 전체 피처 사용. True Value 계산.</div>
      <span class="chart-step-badge orange">복잡 모델, ~3-5ms</span>
    </div>
  </div>
  <div class="chart-step">
    <div class="chart-step-indicator">
      <div class="chart-step-dot pink">4</div>
    </div>
    <div class="chart-step-content">
      <div class="chart-step-title">Re-Ranking (최종 선택) &mdash; 5 &rarr; 1</div>
      <div class="chart-step-desc">비즈니스 로직 적용: 다양성(같은 광고주 중복 방지), 빈도 제한(frequency cap), 광고 품질 점수. 최종 1개 선택 후 Bid Shading.</div>
      <span class="chart-step-badge pink">비즈니스 로직, ~0.5ms</span>
    </div>
  </div>
</div>

### 각 단계별 상세 비교

| | Retrieval | Pre-Ranking | Ranking | Re-Ranking |
|---|---|---|---|---|
| **후보 수** | 수천 → 수백 | 수백 → 50 | 50 → 5 | 5 → 1 |
| **모델** | 규칙/인덱스 | LR, 작은 MLP | DeepFM, DCN, DIN | 규칙 + 점수 보정 |
| **피처 수** | 0 (필터만) | ~20개 (핵심만) | ~200개 (전체) | 메타데이터만 |
| **레이턴시** | <0.1ms | ~1ms | 3-5ms | <0.5ms |
| **정확도** | 낮음 (recall 중심) | 중간 | 높음 (precision 중심) | - |
| **핵심 목표** | 놓치지 않기 | 빠르게 거르기 | 정확하게 평가 | 비즈니스 제약 반영 |

### Pre-Ranking이 왜 중요한가

Pre-Ranking 없이 500개 후보를 Ranking 모델(DeepFM)에 직접 넣으면:

```text
[Pre-Ranking 없이]
500개를 Ranking 모델(DeepFM)에 직접 → 50개씩 배치 = 10 배치 × 3ms = 30ms
→ 10ms 예산 3배 초과

[Pre-Ranking 적용]
500개 × 0.01ms = 5ms (Pre-Ranking, CPU 경량 모델)
 50개 × 0.1ms  = 5ms (Ranking, GPU DeepFM)
총 ~10ms → 예산 내 처리 가능
```

**Pre-Ranking의 목표**: Ranking 모델이 선택할 Top-50을 놓치지 않으면서 후보를 줄이는 것. Pre-Ranking에서 탈락한 광고는 영영 기회를 잃으므로, **recall이 precision보다 중요**합니다.

```python
# (의사코드 — 구조만 보여 줍니다. 그대로 실행되지 않습니다.)
# Multi-Stage Ranking Pipeline
# 수천 후보 → 1개 선택, 총 10ms 이내

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

---

### 예산은 어디서 터지나 — 구간을 더해 보기

100ms라는 예산이 어디로 사라지는지 직접 더해 봅시다. 아래 수치는 전부 가상값입니다.

```python
# 100ms 예산은 어디서 터지나 — 구간을 더해 본다.
#
# 광고 요청 하나가 응답까지 쓸 수 있는 시간은 대략 100ms다.
# 그 안에 피처 조회 · 전처리 · 모델 추론 · 후처리(보정·랭킹)가 다 들어가야 한다.
# 아래 수치는 전부 가상값이다. 자리 크기만 맞췄고 사내 실측치가 아니다.

BUDGET_MS = 100.0

# 후보 수와 무관하게 한 번만 드는 비용 (요청당 고정)
FIXED = [
    ("네트워크 왕복(거래소↔우리)", 12.0),
    ("유저 피처 조회 (캐시 미스 섞임)", 8.0),
    ("요청 파싱·검증", 1.5),
]

# 후보 1개당 드는 비용 (후보 수에 비례해 늘어난다)
PER_CANDIDATE = [
    ("광고 피처 조회", 0.008),
    ("피처 전처리(정규화·해싱)", 0.004),
    ("모델 추론", 0.020),
    ("보정 + eCPM 랭킹", 0.003),
]

print(f"예산 {BUDGET_MS:.0f}ms · 아래 수치는 모두 가상값\n")
fixed_total = sum(ms for _, ms in FIXED)
print(f"{'후보 수':>8}{'고정 비용':>12}{'후보 비례':>12}{'합계':>10}{'예산 대비':>11}   판정")
for n in (100, 500, 2000, 5000):
    per = sum(ms for _, ms in PER_CANDIDATE) * n
    total = fixed_total + per
    verdict = "통과" if total <= BUDGET_MS else f"초과 {total - BUDGET_MS:.1f}ms"
    print(f"{n:>8,}{fixed_total:>10.1f}ms{per:>10.1f}ms{total:>8.1f}ms{total/BUDGET_MS*100:>10.0f}%   {verdict}")

print()
# 후보 2,000개일 때 구간별 내역
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

print()
# 예산에 맞추려면 후보를 몇 개까지 줄여야 하나
per_one = sum(ms for _, ms in PER_CANDIDATE)
max_n = int((BUDGET_MS - fixed_total) / per_one)
print(f"예산 안에 들어가는 최대 후보 수  {max_n:,}개")
print(f"  고정 비용 {fixed_total:.1f}ms를 빼면 후보에 쓸 수 있는 시간은 {BUDGET_MS - fixed_total:.1f}ms")
print(f"  후보 1개당 {per_one:.3f}ms 이므로 {BUDGET_MS - fixed_total:.1f} / {per_one:.3f} = {max_n:,}개")
print()
print("→ 후보를 무한히 늘릴 수 없다. 그래서 정밀 랭킹 앞에 후보를 좁히는 단계가 반드시 온다.")
print("→ 그 좁히는 단계가 Two-Tower 같은 retrieval이다.")

# 출력:
# 예산 100ms · 아래 수치는 모두 가상값
#
#     후보 수       고정 비용       후보 비례        합계      예산 대비   판정
#      100      21.5ms       3.5ms    25.0ms        25%   통과
#      500      21.5ms      17.5ms    39.0ms        39%   통과
#    2,000      21.5ms      70.0ms    91.5ms        92%   통과
#    5,000      21.5ms     175.0ms   196.5ms       197%   초과 96.5ms
#
# 후보 2,000개일 때 구간별 내역
#   모델 추론                        40.0ms   43.7%  █████████████████  (후보에 비례)
#   광고 피처 조회                     16.0ms   17.5%  ███████  (후보에 비례)
#   네트워크 왕복(거래소↔우리)              12.0ms   13.1%  █████  (고정)
#   유저 피처 조회 (캐시 미스 섞임)           8.0ms    8.7%  ███  (고정)
#   피처 전처리(정규화·해싱)                8.0ms    8.7%  ███  (후보에 비례)
#   보정 + eCPM 랭킹                  6.0ms    6.6%  ███  (후보에 비례)
#   요청 파싱·검증                      1.5ms    1.6%  █  (고정)
#   합계                           91.5ms
#
# 예산 안에 들어가는 최대 후보 수  2,242개
#   고정 비용 21.5ms를 빼면 후보에 쓸 수 있는 시간은 78.5ms
#   후보 1개당 0.035ms 이므로 78.5 / 0.035 = 2,242개
#
# → 후보를 무한히 늘릴 수 없다. 그래서 정밀 랭킹 앞에 후보를 좁히는 단계가 반드시 온다.
# → 그 좁히는 단계가 Two-Tower 같은 retrieval이다.
```

읽는 요령은 **고정 비용과 후보 비례 비용을 갈라 보는 것**입니다.

네트워크 왕복 12ms, 유저 피처 조회 8ms는 후보가 100개든 5,000개든 똑같이 듭니다. 반면 모델 추론은 후보 수에 그대로 비례합니다. 후보 2,000개면 40ms로 예산의 43.7%를 먹습니다.

그래서 예산 초과는 늘 같은 방식으로 옵니다. **고정 비용이 아니라 후보 수가 터집니다.** 후보 100개일 때 25ms로 여유롭던 것이 5,000개에서 196.5ms가 됩니다. 두 배가 아니라 여덟 배입니다.

계산해 보면 예산 안에 들어가는 최대 후보는 **2,242개**입니다. 고정 비용 21.5ms를 빼면 후보에 쓸 수 있는 시간이 78.5ms이고, 후보 하나에 0.035ms가 들기 때문입니다.

이 숫자가 아키텍처를 결정합니다. 광고가 10만 개 있어도 정밀 모델에 넣을 수 있는 건 2천 개뿐입니다. **그래서 정밀 랭킹 앞에 후보를 좁히는 단계가 반드시 옵니다.** 그 단계가 [Two-Tower Retrieval](post.html?id=two-tower-retrieval)입니다.

## 3. 모델 경량화: 정확도와 속도의 트레이드오프

Ranking 단계에서 사용하는 복잡한 모델을 Pre-Ranking에 쓸 수는 없습니다. 경량화 기법으로 속도를 확보합니다:

<div class="chart-cards">
  <div class="chart-card">
    <div class="chart-card-header">
      <div class="chart-card-icon yellow">D</div>
      <div>
        <div class="chart-card-name">Knowledge Distillation</div>
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
        <span class="chart-card-row-value">Pre-Ranking 모델 생성</span>
      </div>
    </div>
  </div>
  <div class="chart-card">
    <div class="chart-card-header">
      <div class="chart-card-icon green">Q</div>
      <div>
        <div class="chart-card-name">Quantization</div>
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
        <span class="chart-card-row-value">Ranking 모델 가속</span>
      </div>
    </div>
  </div>
  <div class="chart-card">
    <div class="chart-card-header">
      <div class="chart-card-icon orange">P</div>
      <div>
        <div class="chart-card-name">Pruning</div>
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

세 기법을 한 문장씩 풀면 이렇습니다. **Distillation**은 잘하는 선배(Teacher)의 답안을 후배(Student)가 베끼는 것입니다. 정답 라벨이 아니라 선배가 매긴 확률값을 따라 하니, 작은 모델이 큰 모델의 감각을 물려받습니다. **Quantization**은 소수점 자리를 줄이는 일입니다. 32비트로 재던 가중치를 8비트로 재면 2~4배 빨라집니다. **Pruning**은 거의 안 쓰이는 뉴런을 잘라냅니다. 가지치기한 나무처럼 모양만 단순해집니다.

고를 때 기준은 **AUC를 얼마 잃고 속도를 얼마 얻는가** 하나입니다. Pre-Ranking은 recall만 지키면 되니 속도를 크게 사는 Distillation이 맞습니다. Ranking은 정확도가 곧 매출이니 손실이 가장 작은 Quantization이 맞습니다.

### 실전 경량화 전략

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

---

## 4. Embedding Lookup 최적화: 숨은 병목

광고 추천 모델(DeepFM, DIN 등)에서 가장 큰 병목은 Dense Layer 연산이 아니라 **Embedding Lookup**입니다.

### 왜 Embedding이 병목인가

```text
유저 ID: 1억 개   × 64차원 × 4B(FP32) = 25.6GB
광고 ID: 1000만 개 × 64차원 × 4B(FP32) = 2.56GB
카테고리: 1만 개   × 32차원 × 4B(FP32) = 1.3MB
──────────────────────────────────────────
총 Embedding 테이블: ~28GB → 단일 GPU 메모리(16-80GB) 초과 가능
```

추론 시 매 요청마다 해당 유저/광고의 Embedding을 조회해야 합니다. 이 조회가 **랜덤 메모리 접근**이라 캐시 미스가 빈번합니다.

왜 랜덤 접근이 나쁜지는 도서관으로 옮기면 쉽습니다. Dense Layer 연산은 서가 한 칸에서 책 100권을 연달아 빼 오는 일입니다. Embedding Lookup은 5층 건물에 흩어진 책 100권을 한 권씩 찾아오는 일입니다. 읽는 양은 같은데 걸어 다니는 시간이 전체를 지배합니다.

그래서 이 구간의 최적화는 연산을 줄이는 일이 아니라 **찾아가는 거리를 줄이는 일**입니다.

### 최적화 기법

| 기법 | 원리 | 효과 |
|------|------|------|
| **Embedding 캐시** | Hot user/ad의 Embedding을 L1 캐시에 유지 | 조회 레이턴시 10x 감소 |
| **Mixed-Dimension** | 빈도 높은 ID는 64차원, 낮은 ID는 16차원 | 메모리 50% 절감 |
| **Hash Embedding** | ID → hash → 공유 Embedding (충돌 허용) | 메모리 90%+ 절감 |
| **CPU/GPU Split** | Embedding은 CPU(대용량 메모리), Dense는 GPU | 메모리 제약 해소 |
| **Embedding 압축** | PQ(Product Quantization)로 벡터 압축 | 메모리 4-8x 절감 |

---

## 5. 서빙 인프라 아키텍처

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
      <div class="chart-layer-group-label">Pre-Ranking Server</div>
      <div class="chart-layer-items">
        <span class="chart-layer-item yellow">경량 모델 (CPU)</span>
        <span class="chart-layer-item yellow">수평 확장 N대</span>
      </div>
    </div>
    <div class="chart-layer-group">
      <div class="chart-layer-group-label">Ranking Server</div>
      <div class="chart-layer-items">
        <span class="chart-layer-item pink">DeepFM/DCN (GPU)</span>
        <span class="chart-layer-item pink">Batch 추론</span>
      </div>
    </div>
    <div class="chart-layer-group">
      <div class="chart-layer-group-label">Embedding Service</div>
      <div class="chart-layer-items">
        <span class="chart-layer-item cyan">대용량 Embedding 테이블</span>
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

그림을 위에서 아래로 읽으면 세 덩어리입니다. 첫째, **로드 밸런서**는 요청을 서버들에 갈라 주는 안내원입니다. 죽은 서버를 빼고, 계속 실패하는 서버에는 요청을 보내지 않습니다. 둘째, **모델 서버 군집**은 점수를 매기는 주방입니다. 경량 모델은 CPU에, 무거운 모델은 GPU에, 임베딩 테이블은 메모리 큰 별도 서비스에 나눠 얹습니다. 셋째, **모델 관리 계층**은 어느 버전을 누구에게 보여 줄지 정하는 관제실입니다.

세 번째가 가장 과소평가됩니다. 모델을 빠르게 돌리는 것보다 **잘못된 모델을 빨리 되돌리는 것**이 매출을 더 많이 지킵니다. 인프라 일반론은 [쿠버네티스 네트워킹](post.html?id=kubernetes-networking)과 [소프트웨어 아키텍처 패턴](post.html?id=software-architecture-patterns)에 있습니다.

### 배포 전략 비교

| 전략 | 방식 | 위험도 | 적합한 경우 |
|------|------|-------|-----------|
| **Shadow** | 새 모델 로그만 기록, 실제 서빙은 기존 모델 | 매우 낮음 | 신규 아키텍처 검증 |
| **Canary** | 5% 트래픽에만 새 모델 적용 | 낮음 | 일상적 모델 업데이트 |
| **Blue-Green** | 전체 트래픽을 새 모델로 즉시 전환 | 높음 | 긴급 핫픽스, 검증 완료 후 |

### Canary 배포 의사결정

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

---

## 6. GPU vs CPU 추론: 어디서 실행할 것인가

| | CPU 추론 | GPU 추론 |
|---|---|---|
| **레이턴시** | 단건 빠름 (~0.5ms) | 단건 느림 (~2ms, 커널 오버헤드) |
| **처리량** | 낮음 (직렬) | 높음 (배치 병렬) |
| **비용** | 서버당 저렴 | 서버당 비쌈 |
| **적합** | Pre-Ranking (단건 빠른 응답) | Ranking (배치 스코어링) |
| **Embedding** | 대용량 메모리 가능 | 메모리 제한 (16-80GB) |

표의 첫 두 줄이 헷갈리기 쉬운데 이유는 단순합니다. GPU는 시동이 느린 대형 버스입니다. 한 명만 태우고 출발하면 승용차(CPU)보다 느리지만, 40명을 태우면 1인당 시간은 훨씬 짧습니다. 그래서 GPU를 쓸지는 모델 크기가 아니라 **한 번에 몇 개를 같이 태우는가**로 결정됩니다.

그러면 최대한 많이 모아 태우면 되지 않을까요. 아닙니다. 버스가 차기를 기다리는 동안 먼저 온 사람은 서 있어야 합니다. 처리량과 지연이 맞붙는 지점이고, 배치 크기가 그 손잡이입니다. 손잡이를 1·8·32·128로 돌려 보겠습니다.

```python
# 배칭의 맞교환 — 크게 묶으면 처리량은 오르고, 먼저 온 요청은 기다린다
# (가상 수치입니다. 사내 실측이 아니라 자리 크기만 맞춘 대략치예요.)
import math

ARRIVAL_QPS = 20000.0    # 서비스 전체 도착률
KERNEL_MS = 2.0          # 배치 1회당 고정 오버헤드(커널 실행, 텐서 복사)
PER_ITEM_MS = 0.05       # 후보 1개당 순수 연산
P99_BUDGET_MS = 10.0     # 모델 서버가 지켜야 할 p99 상한

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
# 배치   추론    배치대기   p99      서버1대QPS  필요서버  판정
#    1   2.05ms    0.00ms   2.05ms        488       41대  통과
#    8   2.40ms    0.35ms   2.75ms       3333        6대  통과
#   32   3.60ms    1.55ms   5.15ms       8889        3대  통과
#  128   8.40ms    6.35ms  14.75ms      15238        2대  탈락
```

읽는 법은 이렇습니다. 배치를 1에서 32로 키우면 서버가 41대에서 3대로, 13.7배 줄어듭니다. 그런데 128로 키우면 서버는 하나 더 줄 뿐인데 p99가 14.75ms로 예산을 넘깁니다. **배치를 키워 얻는 이득은 금방 포화되고, 대기 시간은 계속 선형으로 붙습니다.** 그래서 예산을 안 넘기는 가장 큰 배치를 고정하거나, 한가할 때 배치를 줄이는 동적 배칭을 씁니다.

### 최적 조합

<div class="chart-arch">
  <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
    <div class="chart-arch-section">
      <div class="chart-arch-section-header">
        <span class="chart-arch-section-title yellow">Pre-Ranking: CPU</span>
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
        <span class="chart-arch-section-title pink">Ranking: GPU</span>
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

광고 모델 서빙 장애는 곧 매출 손실입니다. 1분 다운타임 = 수천 건의 입찰 기회 손실.

다만 여기서 "장애"의 뜻이 다릅니다. 일반 웹 서비스는 서버가 죽는 게 장애입니다. 광고 서빙은 서버가 다 살아 있는데 응답이 12ms 걸리는 것도 장애입니다. 예산을 넘긴 응답은 거래소에서 버려지니, 느린 응답과 없는 응답이 같습니다.

그래서 대응 방향도 다릅니다. 고칠 때까지 멈추는 게 아니라 **정확도를 조금씩 포기하면서 응답은 계속 내는 쪽**입니다. 아래 표의 대응 칸이 전부 폴백과 자동 조절인 이유입니다.

| 장애 유형 | 영향 | 대응 |
|-----------|------|------|
| **Model Server 다운** | 추론 불가 | Auto-scaling + 다중 AZ 배포 |
| **레이턴시 스파이크** | 타임아웃 증가 → Win Rate 하락 | 타임아웃 시 캐시된 예측값 사용 |
| **새 모델 성능 저하** | CPX 악화, 예산 낭비 | Canary 자동 롤백 (5분 이내) |
| **Embedding Service 장애** | 피처 누락 → 부정확한 예측 | Default Embedding + Degraded Model |
| **GPU OOM** | 추론 실패 | 배치 크기 자동 조절 + CPU 폴백 |

### Timeout Fallback 계층

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

```python
# (의사코드 — 구조만 보여 줍니다. 그대로 실행되지 않습니다.)
# Timeout Fallback
# 모델 장애에도 입찰 기회를 놓치지 않는 방어 계층

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

:::deep 더 깊이 — p99가 평균보다 중요한 이유: 꼬리는 곱해진다

"평균 3ms인데 왜 p99를 걱정하나"는 흔한 질문입니다. 답은 한 번의 광고 응답이 조회를 **여러 번** 한다는 데 있습니다. 후보 100개의 임베딩을 각각 조회한다고 해 봅시다. 조회 하나가 느릴 확률이 1%라면, **적어도 하나**가 느릴 확률은 이렇게 됩니다.

```text
조회 50번  → 1 - 0.99^50  = 39.5%
조회 100번 → 1 - 0.99^100 = 63.4%
조회 500번 → 1 - 0.99^500 = 99.3%
```

전체 응답 시간은 가장 느린 조회에 끌려갑니다. 그래서 1%짜리 꼬리가 요청의 63.4%를 물들입니다. 이게 fan-out의 곱셈 효과입니다.

처방은 둘입니다. 첫째, **fan-out을 줄입니다.** 개별 조회 100번을 배치 조회 1번으로 묶으면 주사위를 한 번만 굴립니다. 둘째, **꼬리를 잘라냅니다.** 조회에 짧은 타임아웃을 걸고 늦으면 기본값을 씁니다.
:::

---

## 8. 담장 안 서빙: 요청량을 알고, 피처를 미리 구워 둔다 [무대: 닫힌 생태계]

같은 아키텍처라도 무대에 따라 난이도가 꽤 다릅니다.

네이버·카카오처럼 자기 지면에 자기 광고를 꽂는 닫힌 생태계는 **트래픽이 자기 것**입니다. 여기서 세 가지가 편해집니다. 첫째, 요청량이 예측됩니다. 어제 이 시간의 요청량이 오늘도 맞으니 서버 대수를 미리 계산해 둘 수 있습니다. 둘째, 유저 키가 안정적입니다. 로그인 ID라 같은 사람이 다시 오니, 유저 피처와 임베딩을 미리 구워 캐시에 얹어 두면 맞습니다. 셋째, 타임아웃이 남의 규칙이 아닙니다. 내부 목표라 조금 넘겨도 응답이 버려지지는 않습니다.

그래서 담장 안의 튜닝은 예산 안에 들어가기보다 **같은 예산으로 더 무거운 모델을 돌리기** 쪽으로 갑니다. 미리 구워 둔 피처가 아껴 준 조회 시간을 추론에 다시 씁니다.

---

## 9. 열린 RTB 서빙: 남의 트래픽은 튀고, 캐시는 안 맞는다 [무대: 열린 RTB]

열린 RTB의 DSP는 정반대입니다. 요청이 거래소에서 밀려오니 **트래픽이 남의 것**입니다. 요청량이 예고 없이 뜁니다. 거래소가 배분을 바꾸거나 새 퍼블리셔가 붙으면 평시의 몇 배가 들어옵니다. 쿠키도 매번 다릅니다. 미리 구워 둔 유저 피처를 찾을 키가 흔들려 캐시가 헛돕니다. 타임아웃도 남의 규칙입니다. 100ms를 1ms 넘긴 응답도 버려지고, 그건 낙찰률 0%와 같습니다.

캐시가 얼마나 갈리는지 재 보겠습니다.

```python
# 인기 광고에 요청이 쏠리는 정도와, 캐시로 줄어드는 임베딩 조회 지연
# (가상 수치입니다.)
import random
random.seed(42)

N_ADS = 1_000_000              # 살아 있는 광고 소재 100만 개
REQUESTS = 200_000             # 요청 20만 건을 굴려 본다
HIT_MS, MISS_MS = 0.05, 1.20   # 임베딩 1회 조회: 캐시 적중 / 미스
DIM, FP32 = 16, 4              # 임베딩 16차원, FP32 = 4바이트

# 요청 쏠림을 log-uniform으로 근사한다. rank = N^u (u는 0~1 균등)이면
# P(rank <= k) = log k / log N 이 되어 Zipf와 비슷한 모양이 나온다.
ranks = [int(N_ADS ** random.random()) + 1 for _ in range(REQUESTS)]

for pct in (0.001, 0.01, 0.1):
    k = int(N_ADS * pct)
    hit = sum(1 for r in ranks if r <= k) / REQUESTS   # 적중률 = 상위 k개가 먹는 요청 비율
    avg = hit * HIT_MS + (1 - hit) * MISS_MS           # 적중/미스를 섞은 기대 지연
    mem = k * DIM * FP32 / 1024 / 1024                 # 캐시가 먹는 메모리(MB)
    print("상위 %4.1f%%(%6d개) 캐시 | 적중 %4.1f%% | 평균 %5.3fms | %5.1fMB | %.1f배 빠름"
          % (pct * 100, k, hit * 100, avg, mem, MISS_MS / avg))

# 같은 캐시를 유저 임베딩에 쓰면 무대에 따라 갈린다 (가상 수치)
walled = 0.65 * HIT_MS + 0.35 * MISS_MS     # 로그인 ID라 같은 사람이 다시 온다
open_rtb = 0.12 * HIT_MS + 0.88 * MISS_MS   # 쿠키가 매번 달라 거의 다 미스
print("유저 임베딩 | 담장 안 적중 65%% -> %5.3fms | 열린 RTB 적중 12%% -> %5.3fms | %.1f배 차이"
      % (walled, open_rtb, open_rtb / walled))

# 출력:
# 상위  0.1%(  1000개) 캐시 | 적중 49.9% | 평균 0.626ms |   0.1MB | 1.9배 빠름
# 상위  1.0%( 10000개) 캐시 | 적중 66.6% | 평균 0.434ms |   0.6MB | 2.8배 빠름
# 상위 10.0%(100000개) 캐시 | 적중 83.3% | 평균 0.241ms |   6.1MB | 5.0배 빠름
# 유저 임베딩 | 담장 안 적중 65% -> 0.453ms | 열린 RTB 적중 12% -> 1.062ms | 2.3배 차이
```

광고 쪽 캐시는 양쪽 무대가 똑같이 이깁니다. 인기 광고 상위 1%(1만 개)가 요청의 66.6%를 먹습니다. 상위 10%를 캐시하면 적중률 83.3%인데 메모리는 6.1MB뿐이고 조회 지연은 5배 줄어듭니다.

갈리는 건 유저 쪽입니다. 로그인 ID가 안정적인 담장 안은 유저 임베딩도 캐시가 먹어 평균 0.453ms인데, 쿠키가 1회성인 열린 RTB는 1.062ms입니다. 같은 하드웨어, 같은 코드인데 2.3배 차이입니다. 그래서 열린 RTB의 DSP는 유저 피처를 적게 쓰고 광고·문맥 피처에 더 기댑니다.

### 두 무대의 서빙 조건 비교 (가상 데이터)

| | 닫힌 생태계 | 열린 RTB (DSP) |
|---|---|---|
| **요청량 예측** | 쉬움 (자사 트래픽) | 어려움 (거래소가 결정) |
| **용량 계획** | 예측 기반 사전 증설 | 과잉 프로비저닝 + 스로틀 |
| **예산 초과의 결과** | 내부 지연 목표 위반 | 응답 폐기 = 낙찰률 0% |
| **주의할 실패 모드** | 캐시가 낡아 피처가 과거값 | 스파이크에 큐가 밀려 p99 폭발 |

숫자는 가상이지만 방향은 실무와 같습니다. 담장 안은 예산을 잘 쓰는 문제를 풀고, 열린 RTB는 예산을 넘기지 않는 것부터 풀어야 합니다.

---

## 마무리

1. **Multi-Stage Ranking이 핵심 아키텍처** — 수천 후보를 한 번에 스코어링할 수 없습니다. Retrieval → Pre-Ranking → Ranking → Re-Ranking 깔때기로 후보를 줄이면서 모델 복잡도를 올리세요.

2. **Pre-Ranking의 recall이 전체 성능을 좌우** — Pre-Ranking에서 탈락한 광고는 Ranking의 정밀한 모델을 만날 기회가 없습니다. Pre-Ranking은 정확도보다 recall이 중요합니다.

3. **경량화는 AUC 손실과의 trade-off** — Distillation(5-10x 빠름, AUC -1.5%), Quantization(2-4x 빠름, AUC -0.2%), Pruning(2-5x 빠름, AUC -1%). 용도에 맞게 선택하세요.

4. **Embedding이 숨은 병목** — 7GB 이상의 Embedding 테이블이 메모리와 레이턴시를 지배합니다. Hash Embedding, Mixed-Dimension, CPU/GPU Split으로 대응하세요.

5. **배포는 Canary가 기본** — 새 모델은 항상 5% 트래픽으로 시작하고, 24시간 모니터링 후 점진 확대하세요. 성능 하락 시 자동 롤백이 필수입니다.

> 이 글에서 다룬 서빙 아키텍처는 [Feature Store](post.html?id=feature-store-serving)가 공급하는 피처를 소비합니다. [Online Learning](post.html?id=online-learning-delayed-feedback)이 그 모델을 갱신하고, [Auto-Bidding](post.html?id=auto-bidding-pacing)이 최종 입찰가를 결정합니다. 서빙은 그 파이프라인의 핵심 계층입니다.

---

## 더 깊이 보기

- 피처를 꺼내와 모델에 넣기까지 → [Feature Store와 실시간 서빙](post.html?id=feature-store-serving)
- 각 단계에 어떤 모델을 놓나 → [Deep CTR 모델의 진화](post.html?id=deep-ctr-models)
- 수백만 후보에서 수천 개를 건져내는 1단계 → [Two-Tower Retrieval](post.html?id=two-tower-retrieval)
- 광고 요청 한 건이 흐르는 전체 경로 → [광고 서빙 플로우](post.html?id=ad-serving-flow)
- 보정 계층을 서빙 어디에 두나 → [Calibration](post.html?id=calibration)
- 배치 크기를 정한 뒤 그 지연을 실제로 재고 대시보드로 읽는 법 → [지연·처리량과 Grafana 읽는 법](post.html?id=serving-latency-throughput)
- 광고 ML 전체 지도에서 이 글의 위치 → [ML 엔지니어 트랙](ml-track.html)