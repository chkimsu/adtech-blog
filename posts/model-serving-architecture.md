pCTR 모델의 AUC가 0.82라고 해서 프로덕션에서 0.82의 성능이 나오는 것은 아닙니다. **100ms RTB 타임아웃 안에서, 수백 개 후보 광고에 대해, 초당 수만 QPS로 추론**할 수 있어야 비로소 모델이 가치를 만듭니다. 이 글은 광고 ML 모델이 학습 환경을 떠나 프로덕션에서 서빙되는 전체 아키텍처를 해부합니다.

> [Feature Store 포스트](post.html?id=feature-store-serving)에서 "피처가 모델에 도달하는 과정"을, [Online Learning 포스트](post.html?id=online-learning-delayed-feedback)에서 "모델이 최신 상태를 유지하는 방법"을 다뤘습니다. 이 글은 그 사이 — **모델이 피처를 받아 예측값을 반환하는 서빙 계층** 자체에 집중합니다.

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

```
500개 × 3ms/batch = 총 ~15ms (Ranking만으로 예산 초과)

Pre-Ranking으로 50개로 축소하면:
500개 × 0.01ms/개 = 5ms (Pre-Ranking) + 50개 × 0.1ms/개 = 5ms (Ranking)
총 ~10ms → 예산 내 처리 가능
```

**Pre-Ranking의 목표**: Ranking 모델이 선택할 Top-50을 놓치지 않으면서 후보를 줄이는 것. Pre-Ranking에서 탈락한 광고는 영영 기회를 잃으므로, **recall이 precision보다 중요**합니다.

---

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

### 실전 경량화 전략

```
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

```
유저 ID: 1억 개   × 64차원 = 6.4GB
광고 ID: 1000만 개 × 64차원 = 640MB
카테고리: 1만 개   × 32차원 = 320KB
──────────────────────────────
총 Embedding 테이블: ~7GB → 단일 GPU 메모리 초과 가능
```

추론 시 매 요청마다 해당 유저/광고의 Embedding을 조회해야 합니다. 이 조회가 **랜덤 메모리 접근**이라 캐시 미스가 빈번합니다.

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

### 배포 전략 비교

| 전략 | 방식 | 위험도 | 적합한 경우 |
|------|------|-------|-----------|
| **Shadow** | 새 모델 로그만 기록, 실제 서빙은 기존 모델 | 매우 낮음 | 신규 아키텍처 검증 |
| **Canary** | 5% 트래픽에만 새 모델 적용 | 낮음 | 일상적 모델 업데이트 |
| **Blue-Green** | 전체 트래픽을 새 모델로 즉시 전환 | 높음 | 긴급 핫픽스, 검증 완료 후 |

### Canary 배포 의사결정

```
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

| 장애 유형 | 영향 | 대응 |
|-----------|------|------|
| **Model Server 다운** | 추론 불가 | Auto-scaling + 다중 AZ 배포 |
| **레이턴시 스파이크** | 타임아웃 증가 → Win Rate 하락 | 타임아웃 시 캐시된 예측값 사용 |
| **새 모델 성능 저하** | CPX 악화, 예산 낭비 | Canary 자동 롤백 (5분 이내) |
| **Embedding Service 장애** | 피처 누락 → 부정확한 예측 | Default Embedding + Degraded Model |
| **GPU OOM** | 추론 실패 | 배치 크기 자동 조절 + CPU 폴백 |

### Timeout Fallback 계층

```
[정상] Ranking Model 응답 (3ms)
  → pCTR = 0.032

[Timeout 5ms] Ranking 느림 → Pre-Ranking 점수로 대체
  → pCTR ≈ 0.028 (덜 정확하지만 입찰 가능)

[Timeout 8ms] Pre-Ranking도 느림 → 캐시된 유저 평균 pCTR
  → pCTR = 0.025 (개인화 없음, 입찰은 유지)

[Timeout 10ms] 전체 장애 → 입찰 포기
  → 이 경우에만 기회 손실
```

---

## 마무리

1. **Multi-Stage Ranking이 핵심 아키텍처** — 수천 후보를 한 번에 스코어링할 수 없습니다. Retrieval → Pre-Ranking → Ranking → Re-Ranking 깔때기로 후보를 줄이면서 모델 복잡도를 올리세요.

2. **Pre-Ranking의 recall이 전체 성능을 좌우** — Pre-Ranking에서 탈락한 광고는 Ranking의 정밀한 모델을 만날 기회가 없습니다. Pre-Ranking은 정확도보다 recall이 중요합니다.

3. **경량화는 AUC 손실과의 trade-off** — Distillation(5-10x 빠름, AUC -1.5%), Quantization(2-4x 빠름, AUC -0.2%), Pruning(2-5x 빠름, AUC -1%). 용도에 맞게 선택하세요.

4. **Embedding이 숨은 병목** — 7GB 이상의 Embedding 테이블이 메모리와 레이턴시를 지배합니다. Hash Embedding, Mixed-Dimension, CPU/GPU Split으로 대응하세요.

5. **배포는 Canary가 기본** — 새 모델은 항상 5% 트래픽으로 시작하고, 24시간 모니터링 후 점진 확대하세요. 성능 하락 시 자동 롤백이 필수입니다.

> 이 글에서 다룬 서빙 아키텍처는 [Feature Store](post.html?id=feature-store-serving)가 공급하는 피처를 소비하고, [Online Learning](post.html?id=online-learning-delayed-feedback)이 모델을 갱신하고, [Auto-Bidding](post.html?id=auto-bidding-pacing)이 최종 입찰가를 결정하는 전체 파이프라인의 핵심 계층입니다.