어제 AUC 0.82였던 pCTR 모델이 오늘 0.78입니다. 코드도, 피처도, 인프라도 바뀐 게 없는데 성능이 떨어졌습니다. **시장이 변한 것입니다.** 유저 관심사가 바뀌고, 경쟁 DSP의 전략이 달라지고, 새 광고주가 진입하고, 시즌 효과가 작동합니다. 광고 ML 모델은 태생적으로 빠르게 낡아집니다.

이 글은 **왜 모델이 낡아지는가**(Concept Drift), **어떻게 최신 상태를 유지하는가**(Online Learning), 그리고 **전환 지연이 학습을 어떻게 방해하는가**(Delayed Feedback)를 해부합니다.

> [pCVR 모델링 포스트](post.html?id=my-markdown-post)에서 FSIW 알고리즘을 다뤘습니다. 이 글은 그 문제를 더 넓은 맥락 — Online Learning 전체 파이프라인 — 에서 다룹니다.

---

## 1. 왜 광고 모델은 빠르게 낡아지는가

광고 데이터의 분포는 끊임없이 변합니다. 이것을 **Concept Drift**라고 합니다. Drift에는 세 가지 유형이 있습니다:

<div class="chart-cards">
  <div class="chart-card">
    <div class="chart-card-header">
      <div class="chart-card-icon orange">!</div>
      <div>
        <div class="chart-card-name">Sudden Drift</div>
        <div class="chart-card-subtitle">갑작스러운 분포 변화</div>
      </div>
    </div>
    <div class="chart-card-body">
      <div class="chart-card-row">
        <span class="chart-card-row-label">원인</span>
        <span class="chart-card-row-value">정책 변화, 경쟁사 전략 전환</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">예시</span>
        <span class="chart-card-row-value">iOS ATT 도입 &rarr; IDFA 차단</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">영향</span>
        <span class="chart-card-row-value">AUC 급락, 입찰 전략 무력화</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">대응 속도</span>
        <span class="chart-card-row-value">즉시 재학습 필요</span>
      </div>
    </div>
    <div class="chart-card-tags">
      <span class="chart-card-tag">정책 변화</span>
      <span class="chart-card-tag">플랫폼 업데이트</span>
    </div>
  </div>
  <div class="chart-card">
    <div class="chart-card-header">
      <div class="chart-card-icon yellow">~</div>
      <div>
        <div class="chart-card-name">Gradual Drift</div>
        <div class="chart-card-subtitle">서서히 누적되는 변화</div>
      </div>
    </div>
    <div class="chart-card-body">
      <div class="chart-card-row">
        <span class="chart-card-row-label">원인</span>
        <span class="chart-card-row-value">유저 관심사 변화, 시즌 효과</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">예시</span>
        <span class="chart-card-row-value">여름 &rarr; 가을: 패션 트렌드 전환</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">영향</span>
        <span class="chart-card-row-value">Calibration 서서히 틀어짐</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">대응 속도</span>
        <span class="chart-card-row-value">일 1회 재학습으로 대응 가능</span>
      </div>
    </div>
    <div class="chart-card-tags">
      <span class="chart-card-tag">시즌 효과</span>
      <span class="chart-card-tag">트렌드 변화</span>
    </div>
  </div>
  <div class="chart-card">
    <div class="chart-card-header">
      <div class="chart-card-icon green">R</div>
      <div>
        <div class="chart-card-name">Recurring Drift</div>
        <div class="chart-card-subtitle">주기적으로 반복되는 패턴</div>
      </div>
    </div>
    <div class="chart-card-body">
      <div class="chart-card-row">
        <span class="chart-card-row-label">원인</span>
        <span class="chart-card-row-value">요일/시간 패턴, 공휴일, 급여일</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">예시</span>
        <span class="chart-card-row-value">금요일 저녁 CTR >> 월요일 아침 CTR</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">영향</span>
        <span class="chart-card-row-value">시간대별 예측 편향</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">대응 속도</span>
        <span class="chart-card-row-value">시간 피처로 학습 가능 (재학습 불필요)</span>
      </div>
    </div>
    <div class="chart-card-tags">
      <span class="chart-card-tag">요일 패턴</span>
      <span class="chart-card-tag">시간대 패턴</span>
    </div>
  </div>
</div>

### 실전 예시: CTR이 하루 만에 달라지는 이유

```
월요일 오전 9시 (출근길, 모바일)
  - 유저 행동: 뉴스 훑어보기, 짧은 체류
  - 평균 CTR: 1.8%
  - 전환율: 낮음 (구매 여유 없음)

금요일 저녁 8시 (퇴근 후, 모바일/데스크톱)
  - 유저 행동: 쇼핑 탐색, 긴 체류
  - 평균 CTR: 3.2%
  - 전환율: 높음 (주말 구매 준비)

→ 같은 유저, 같은 광고인데 CTR이 78% 차이
→ 월요일 데이터로 학습한 모델이 금요일에 과소추정
```

Recurring Drift는 시간/요일 피처로 모델이 학습할 수 있지만, Sudden/Gradual Drift는 **모델 자체를 재학습**해야 합니다.

---

## 2. Batch Retraining vs Online Learning

모델을 최신 상태로 유지하는 두 가지 접근법입니다:

<div class="chart-cards">
  <div class="chart-card">
    <div class="chart-card-header">
      <div class="chart-card-icon yellow">B</div>
      <div>
        <div class="chart-card-name">Batch Retraining</div>
        <div class="chart-card-subtitle">주기적 전체 재학습</div>
      </div>
    </div>
    <div class="chart-card-body">
      <div class="chart-card-row">
        <span class="chart-card-row-label">방식</span>
        <span class="chart-card-row-value">전체 데이터로 모델 처음부터 학습</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">주기</span>
        <span class="chart-card-row-value">수 시간 ~ 1일</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">장점</span>
        <span class="chart-card-row-value">안정적, 재현 가능, 검증 용이</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">단점</span>
        <span class="chart-card-row-value">학습 지연, 급변에 느림</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">적합</span>
        <span class="chart-card-row-value">Gradual Drift, 안정적 환경</span>
      </div>
    </div>
  </div>
  <div class="chart-card" style="grid-column: span 2;">
    <div class="chart-card-header">
      <div class="chart-card-icon green">O</div>
      <div>
        <div class="chart-card-name">Online Learning</div>
        <div class="chart-card-subtitle">실시간 점진 업데이트</div>
      </div>
    </div>
    <div class="chart-card-body">
      <div class="chart-card-row">
        <span class="chart-card-row-label">방식</span>
        <span class="chart-card-row-value">새 데이터가 올 때마다 모델 파라미터 점진 업데이트</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">주기</span>
        <span class="chart-card-row-value">수 초 ~ 수 분 (이벤트 단위)</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">장점</span>
        <span class="chart-card-row-value">빠른 적응, Sudden Drift 대응, 최신 트렌드 반영</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">단점</span>
        <span class="chart-card-row-value">노이즈 민감, Catastrophic Forgetting, 디버깅 어려움</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">적합</span>
        <span class="chart-card-row-value">Sudden Drift, 빠르게 변하는 환경</span>
      </div>
    </div>
  </div>
</div>

### 프로덕션의 주류: Batch + Online Calibration 하이브리드

대부분의 프로덕션 DSP는 둘 다 사용합니다:

| 계층 | 역할 | 주기 | 변경 대상 |
|------|------|------|---------|
| **Base Model** (Batch) | 전체 패턴 학습 | 일 1회 | 모델 전체 파라미터 |
| **Online Calibration** | 최신 편향 보정 | 수 분 ~ 수 시간 | Calibration Layer만 |

```python
# 하이브리드 구조 (간략화)

# 1. Base Model: 일 1회 Batch 재학습 (Spark + GPU)
base_pctr = DeepFM.train(
    data=last_30days_logs,    # 최근 30일 전체 데이터
    features=all_features,
    epochs=3
)

# 2. Online Calibration: 수 분마다 보정 (경량)
#    Base Model의 출력을 Platt Scaling으로 보정
calibrator = PlattScaling()
calibrator.update(
    predictions=base_pctr.predict(recent_1hour),
    actuals=recent_1hour.labels    # 최근 1시간 실제 CTR
)

# 3. 서빙 시: Base Model + Calibration
def serve(x):
    raw_pctr = base_pctr.predict(x)      # Base Model 예측
    calibrated = calibrator.transform(raw_pctr)  # 보정
    return calibrated
```

**왜 Calibration Layer만 Online으로?**
- Base Model 전체를 Online으로 업데이트하면 Catastrophic Forgetting 위험
- Calibration Layer(2개 파라미터: $a$, $b$)만 업데이트하면 안전하면서도 최신 편향을 보정
- $p_{\text{calibrated}} = \sigma(a \cdot \log(p_{\text{raw}}) + b)$

---

## 3. Delayed Feedback: 라벨이 늦게 오는 문제

Online Learning의 가장 큰 장애물이 **Delayed Feedback**입니다. 클릭은 즉시 관측되지만, 전환은 수 시간~수 일 후에 발생합니다.

<div class="chart-timeline">
  <div style="font-size:0.85rem; font-weight:700; color:var(--text-primary); margin-bottom:12px;">클릭 후 전환까지의 시간 분포 (일반적 e-commerce)</div>
  <div class="chart-timeline-bar">
    <div class="chart-timeline-segment green" style="width:25%;">30분 이내<br/>35%</div>
    <div class="chart-timeline-segment cyan" style="width:20%;">1-6시간<br/>25%</div>
    <div class="chart-timeline-segment blue" style="width:20%;">6-24시간<br/>20%</div>
    <div class="chart-timeline-segment orange" style="width:15%;">1-3일<br/>12%</div>
    <div class="chart-timeline-segment pink" style="width:10%;">3-7일<br/>5%</div>
    <div class="chart-timeline-segment" style="width:10%; background:rgba(176,38,255,0.5);">7일+<br/>3%</div>
  </div>
  <div class="chart-timeline-labels">
    <span>클릭 직후</span>
    <span>35% 전환 완료</span>
    <span>60%</span>
    <span>80%</span>
    <span>92%</span>
    <span>97%</span>
    <span>100%</span>
  </div>
  <div class="chart-timeline-legend">
    <div class="chart-timeline-legend-item">
      <div class="chart-timeline-legend-dot" style="background:rgba(75,192,192,0.7);"></div>
      <span>학습에 안전하게 사용 가능한 구간 (라벨 확정)</span>
    </div>
    <div class="chart-timeline-legend-item">
      <div class="chart-timeline-legend-dot" style="background:rgba(255,99,132,0.7);"></div>
      <span>라벨 미확정 구간 (Fake Negative 위험)</span>
    </div>
  </div>
</div>

### Fake Negative 문제

학습 시점에 아직 전환하지 않은 유저를 "미전환(negative)"으로 레이블링하면:

| 시나리오 | 실제 | 학습 라벨 | 결과 |
|---------|------|---------|------|
| 클릭 후 10분, 아직 전환 안 함 | **전환 예정** (2시간 후 구매) | negative (0) | **Fake Negative** |
| 클릭 후 10분, 전환 안 할 유저 | 미전환 | negative (0) | 정상 |
| 클릭 후 3시간, 이미 전환 완료 | 전환 | positive (1) | 정상 |

Fake Negative가 많아지면 모델이 전환율을 **과소추정**합니다:
- pCVR 하락 → True Value 하락 → 입찰가 하락 → Win Rate 하락
- 실제로는 전환이 잘 일어나는 캠페인인데, 입찰을 포기하게 됨

---

## 4. Delayed Feedback 보정 기법

<div class="chart-arch">
  <div class="chart-arch-section">
    <div class="chart-arch-section-header">
      <span class="chart-arch-section-title orange">기법 1: Attribution Window (대기 전략)</span>
    </div>
    <div class="chart-arch-grid">
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">원리</div>
        <div class="chart-arch-node-desc">전환 확정까지 충분히 대기 후 학습. 예: 클릭 후 7일 대기</div>
      </div>
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">장점</div>
        <div class="chart-arch-node-desc">라벨 정확도 높음, 구현 단순</div>
      </div>
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">단점</div>
        <div class="chart-arch-node-desc">7일 지연 = 7일 동안 모델 낡음</div>
      </div>
    </div>
  </div>
  <div class="chart-arch-connector">vs</div>
  <div class="chart-arch-section">
    <div class="chart-arch-section-header">
      <span class="chart-arch-section-title blue">기법 2: Importance Weighting (FSIW)</span>
    </div>
    <div class="chart-arch-grid">
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">원리</div>
        <div class="chart-arch-node-desc">Fake Negative 확률을 추정하여 가중치 보정</div>
      </div>
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">장점</div>
        <div class="chart-arch-node-desc">최신 데이터 즉시 사용 가능</div>
      </div>
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">단점</div>
        <div class="chart-arch-node-desc">지연 분포 모델링 필요, 가중치 분산 큼</div>
      </div>
    </div>
  </div>
  <div class="chart-arch-connector">vs</div>
  <div class="chart-arch-section">
    <div class="chart-arch-section-header">
      <span class="chart-arch-section-title purple">기법 3: Delay Model (지연 분포 모델링)</span>
    </div>
    <div class="chart-arch-grid">
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">원리</div>
        <div class="chart-arch-node-desc">P(conversion | click, elapsed_time)을 직접 모델링</div>
      </div>
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">장점</div>
        <div class="chart-arch-node-desc">경과 시간을 피처로 활용, 정교한 보정</div>
      </div>
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">단점</div>
        <div class="chart-arch-node-desc">모델 복잡도 증가, 학습 데이터 구성 어려움</div>
      </div>
    </div>
  </div>
</div>

### 기법별 Trade-off 비교

| | Attribution Window | FSIW | Delay Model |
|---|---|---|---|
| **학습 지연** | 7일+ (긴 대기) | 수 시간 (빠름) | 수 시간 (빠름) |
| **라벨 정확도** | 매우 높음 | 중간 (가중치 의존) | 높음 |
| **구현 복잡도** | 매우 낮음 | 중간 | 높음 |
| **Drift 대응력** | 매우 낮음 | 높음 | 높음 |
| **적합한 경우** | 전환 지연이 짧은 캠페인 | 범용 | 전환 지연이 긴 캠페인 (보험, 부동산) |

### FSIW 핵심 수식

> 자세한 유도 과정은 [pCVR 모델링 포스트](post.html?id=my-markdown-post)를 참고하세요.

FSIW의 핵심 아이디어: 관측 시점에 "미전환"으로 보이는 샘플 중 일부는 **아직 전환이 안 온 Fake Negative**입니다. 이 비율을 추정하여 학습 가중치를 보정합니다.

- **이미 전환된 Positive 샘플**: 전환이 관측 시점 내에 도착할 확률 $F_d(\Delta t)$로 나누어 보정

$$w_i^{(+)} = \frac{1}{F_d(t - t_{\text{click}})}$$

- **미전환 Negative 샘플**: 경과 시간이 길수록 진짜 Negative일 확률이 높으므로 가중치를 낮춤

$$w_i^{(-)} = \frac{1 - p_{\text{cvr}} \cdot (1 - F_d(t - t_{\text{click}}))}{1 - p_{\text{cvr}}}$$

여기서 $F_d(\cdot)$는 전환 지연 시간의 CDF, $p_{\text{cvr}}$은 전환 확률 추정값입니다. 시간이 충분히 지나면 $F_d \to 1$이 되어 Positive 가중치는 1에 수렴하고, Negative 가중치도 1에 수렴합니다 — 즉, 충분히 오래 기다린 샘플은 보정 없이 그대로 사용해도 안전합니다.

---

## 5. 프로덕션 Online Learning 아키텍처

실제 프로덕션에서는 Batch Retraining, Online Calibration, Delayed Feedback 보정이 하나의 파이프라인으로 통합됩니다:

<div class="chart-layer">
  <div class="chart-layer-title">EVENT STREAM (실시간 이벤트 수집)</div>
  <div class="chart-layer-row">
    <div class="chart-layer-group">
      <div class="chart-layer-group-label">Kafka / Kinesis</div>
      <div class="chart-layer-items">
        <span class="chart-layer-item blue">Impression Event</span>
        <span class="chart-layer-item blue">Click Event (수 초)</span>
        <span class="chart-layer-item orange">Conversion Event (수 시간~수 일)</span>
      </div>
    </div>
    <div class="chart-layer-group">
      <div class="chart-layer-group-label">Click-Conversion Join</div>
      <div class="chart-layer-items">
        <span class="chart-layer-item cyan">Click + Conversion 매칭</span>
        <span class="chart-layer-item cyan">Attribution Window 적용</span>
      </div>
    </div>
  </div>
  <div class="chart-layer-arrow">v</div>
  <div class="chart-layer-title">NEAR-REAL-TIME UPDATE (수 분 ~ 수 시간)</div>
  <div class="chart-layer-row">
    <div class="chart-layer-group">
      <div class="chart-layer-group-label">Online Calibration (Flink)</div>
      <div class="chart-layer-items">
        <span class="chart-layer-item pink">최근 1시간 predicted vs actual</span>
        <span class="chart-layer-item pink">Platt Scaling 파라미터 업데이트</span>
      </div>
    </div>
    <div class="chart-layer-group">
      <div class="chart-layer-group-label">Delayed Feedback 보정</div>
      <div class="chart-layer-items">
        <span class="chart-layer-item orange">FSIW 가중치 계산</span>
        <span class="chart-layer-item orange">Fake Negative 보정</span>
      </div>
    </div>
    <div class="chart-layer-group">
      <div class="chart-layer-group-label">Feature Update</div>
      <div class="chart-layer-items">
        <span class="chart-layer-item cyan">Streaming Feature 갱신</span>
        <span class="chart-layer-item cyan">Redis INCR/SET</span>
      </div>
    </div>
  </div>
  <div class="chart-layer-arrow">v</div>
  <div class="chart-layer-title">BATCH RETRAINING (일 1회)</div>
  <div class="chart-layer-row">
    <div class="chart-layer-group">
      <div class="chart-layer-group-label">Full Retrain (Spark + GPU)</div>
      <div class="chart-layer-items">
        <span class="chart-layer-item pink">최근 30일 전체 데이터</span>
        <span class="chart-layer-item pink">Base Model 재학습</span>
      </div>
    </div>
    <div class="chart-layer-group">
      <div class="chart-layer-group-label">Offline 평가</div>
      <div class="chart-layer-items">
        <span class="chart-layer-item green">AUC, LogLoss, Calibration</span>
        <span class="chart-layer-item green">A/B 실험 배포 결정</span>
      </div>
    </div>
  </div>
  <div class="chart-layer-arrow">v</div>
  <div class="chart-layer-title">SERVING (실시간 추론)</div>
  <div class="chart-layer-row">
    <div class="chart-layer-group">
      <div class="chart-layer-group-label">Model Server</div>
      <div class="chart-layer-items">
        <span class="chart-layer-item pink">Base Model (일 1회 갱신)</span>
        <span class="chart-layer-item pink">+ Calibration Layer (수 분 갱신)</span>
      </div>
    </div>
    <div class="chart-layer-group">
      <div class="chart-layer-group-label">최종 출력</div>
      <div class="chart-layer-items">
        <span class="chart-layer-item green">calibrated pCTR</span>
        <span class="chart-layer-item green">calibrated pCVR</span>
      </div>
    </div>
  </div>
</div>

### 각 계층의 역할 정리

| 계층 | 갱신 주기 | 변경 대상 | Drift 대응 |
|------|---------|---------|-----------|
| **Event Stream** | 실시간 | 원시 데이터 수집 | - |
| **Online Calibration** | 수 분 | Calibration 파라미터 (a, b) | Sudden + Gradual |
| **Delayed Feedback 보정** | 수 시간 | 학습 데이터의 가중치 | Fake Negative 방지 |
| **Batch Retraining** | 일 1회 | 모델 전체 파라미터 | Gradual Drift |
| **Serving** | 실시간 | Base + Calibration 조합 | 최종 보정된 예측 |

---

## 6. 모델 Staleness 모니터링

모델이 언제 낡아지는지 **자동으로 감지**하는 것이 핵심입니다. 사람이 매일 AUC를 확인하는 것은 확장 불가능합니다.

### 핵심 모니터링 지표

| 지표 | 무엇을 측정하는가 | 계산 방법 | 알림 기준 |
|------|----------------|---------|---------|
| **Calibration Gap** | 예측 확률과 실제 확률의 차이 | mean(predicted) - mean(actual), 최근 1시간 | gap > 10% |
| **AUC 추이** | 모델 판별력 변화 | 최근 6시간 단위 AUC 계산 | 전일 대비 -0.02 이상 하락 |
| **PSI (Population Stability Index)** | 입력 피처 분포 변화 | 학습 데이터 vs 서빙 데이터 분포 비교 | PSI > 0.2 |
| **Prediction 분포** | 예측값 분포 변화 | 최근 1시간 예측값의 mean/std 추적 | mean 이동 > 2$\sigma$ |
| **Win Rate 변화** | 입찰 성과 변화 | wins / total bids, 최근 1시간 | 전일 대비 20% 이상 변화 |

### 자동 재학습 트리거

```
[Level 1] Calibration Gap > 10%
  → Online Calibration 즉시 업데이트 (수 분)

[Level 2] AUC 하락 > 0.02 AND PSI > 0.2
  → 긴급 Batch Retraining 트리거 (수 시간)
  → 알림: "Feature 분포 변화 감지, 모델 재학습 시작"

[Level 3] Win Rate 급변 > 30%
  → 입찰 일시 중지 검토
  → 알림: "시장 환경 급변, Auto-Bidding λ 조정 필요"
  → 원인 분석: 경쟁사 전략 변경? 플랫폼 정책 변경? 데이터 파이프라인 장애?
```

---

## 마무리

1. **광고 모델은 태생적으로 빠르게 낡는다** — Concept Drift(Sudden, Gradual, Recurring)가 끊임없이 발생합니다. "모델 배포 후 잊어버리기"는 광고 ML에서 불가능합니다.

2. **Batch + Online Calibration 하이브리드가 프로덕션 주류** — Base Model은 일 1회 전체 재학습, Calibration Layer만 수 분 단위로 Online 업데이트합니다. 안정성과 적응력의 균형입니다.

3. **Delayed Feedback은 Online Learning의 최대 장애물** — 전환 지연으로 인한 Fake Negative가 pCVR을 과소추정시킵니다. Attribution Window(단순), FSIW(범용), Delay Model(정교) 중 선택합니다.

4. **모니터링이 재학습보다 중요하다** — Calibration Gap, AUC 추이, PSI를 자동 추적하고, 임계치 초과 시 자동 재학습을 트리거하세요. 사람이 매일 확인하는 것은 확장 불가능합니다.

5. **pCTR 정확도의 체인은 여기서도 이어진다** — 모델이 낡아지면 pCTR이 부정확해지고, True Value가 틀어지고, 입찰가가 비효율적이 되고, 결국 광고주 ROI가 하락합니다. [Feature Store](post.html?id=feature-store-serving) → Online Learning → [Auto-Bidding](post.html?id=auto-bidding-pacing)의 체인이 하나라도 끊어지면 전체가 무너집니다.