pCTR 모델의 AUC를 0.01 올리는 데 몇 주를 투자하지만, **100ms 안에 피처를 모아서 추론하는 시스템**이 없으면 그 모델은 프로덕션에서 아무 일도 하지 못합니다. 이 글은 광고 ML 시스템의 **데이터 공급망** — Feature Store와 Real-Time Serving 아키텍처를 ML Engineer의 시선으로 해부합니다.

> [pCTR 모델러를 위한 광고 기술 생태계 전체 지도](post.html?id=adtech-ecosystem-map)에서 Feature Store 노드를 한 줄로 소개했습니다. 이 글은 그 노드를 확대하여, 피처가 생성되고 저장되고 서빙되는 전체 과정을 다룹니다.

---

## 1. Feature Serving 전체 조감도

먼저 숲을 봅니다. 광고 ML 시스템에서 피처가 흐르는 전체 경로입니다:

<div class="chart-layer">
  <div class="chart-layer-title">DATA SOURCES</div>
  <div class="chart-layer-row">
    <div class="chart-layer-group">
      <div class="chart-layer-group-label">이벤트 로그</div>
      <div class="chart-layer-items">
        <span class="chart-layer-item blue">Impression</span>
        <span class="chart-layer-item blue">Click</span>
        <span class="chart-layer-item blue">Conversion</span>
      </div>
    </div>
    <div class="chart-layer-group">
      <div class="chart-layer-group-label">유저 프로필</div>
      <div class="chart-layer-items">
        <span class="chart-layer-item purple">DMP / CDP</span>
        <span class="chart-layer-item purple">Audience Segment</span>
      </div>
    </div>
    <div class="chart-layer-group">
      <div class="chart-layer-group-label">캠페인 메타</div>
      <div class="chart-layer-items">
        <span class="chart-layer-item orange">예산</span>
        <span class="chart-layer-item orange">타겟</span>
        <span class="chart-layer-item orange">소재</span>
      </div>
    </div>
    <div class="chart-layer-group">
      <div class="chart-layer-group-label">실시간 컨텍스트</div>
      <div class="chart-layer-items">
        <span class="chart-layer-item green">디바이스</span>
        <span class="chart-layer-item green">시간</span>
        <span class="chart-layer-item green">지면</span>
      </div>
    </div>
  </div>
  <div class="chart-layer-arrow">&#8595;</div>
  <div class="chart-layer-title">FEATURE PIPELINES</div>
  <div class="chart-layer-row">
    <div class="chart-layer-group">
      <div class="chart-layer-group-label">Batch Pipeline (수 시간)</div>
      <div class="chart-layer-items">
        <span class="chart-layer-item yellow">Spark / Hive</span>
        <span class="chart-layer-item yellow">집계 &middot; 통계 &middot; 임베딩</span>
      </div>
    </div>
    <div class="chart-layer-group">
      <div class="chart-layer-group-label">Streaming Pipeline (수 분)</div>
      <div class="chart-layer-items">
        <span class="chart-layer-item orange">Flink / Kafka</span>
        <span class="chart-layer-item orange">윈도우 집계</span>
      </div>
    </div>
    <div class="chart-layer-group">
      <div class="chart-layer-group-label">Real-Time (요청 시점)</div>
      <div class="chart-layer-items">
        <span class="chart-layer-item green">Application 내부</span>
        <span class="chart-layer-item green">파싱 &middot; 변환</span>
      </div>
    </div>
  </div>
  <div class="chart-layer-arrow">&#8595;</div>
  <div class="chart-layer-title">FEATURE STORE</div>
  <div class="chart-layer-row">
    <div class="chart-layer-group">
      <div class="chart-layer-group-label">Feature Registry</div>
      <div class="chart-layer-items">
        <span class="chart-layer-item purple">스키마</span>
        <span class="chart-layer-item purple">버전</span>
        <span class="chart-layer-item purple">메타데이터</span>
      </div>
    </div>
    <div class="chart-layer-group">
      <div class="chart-layer-group-label">Offline Store (학습용)</div>
      <div class="chart-layer-items">
        <span class="chart-layer-item blue">S3 / Hive</span>
        <span class="chart-layer-item blue">Point-in-Time</span>
      </div>
    </div>
    <div class="chart-layer-group">
      <div class="chart-layer-group-label">Online Store (서빙용)</div>
      <div class="chart-layer-items">
        <span class="chart-layer-item cyan">Redis</span>
        <span class="chart-layer-item cyan">DynamoDB</span>
      </div>
    </div>
  </div>
  <div class="chart-layer-arrow">&#8595;</div>
  <div class="chart-layer-title">ONLINE SERVING (~10ms)</div>
  <div class="chart-layer-row">
    <div class="chart-layer-group">
      <div class="chart-layer-group-label">Feature Lookup</div>
      <div class="chart-layer-items">
        <span class="chart-layer-item cyan">Key: user_id, ad_id</span>
      </div>
    </div>
    <div class="chart-layer-group">
      <div class="chart-layer-group-label">Feature Vector 조합</div>
      <div class="chart-layer-items">
        <span class="chart-layer-item cyan">Pre-computed + On-the-fly</span>
      </div>
    </div>
    <div class="chart-layer-group">
      <div class="chart-layer-group-label">Model Inference</div>
      <div class="chart-layer-items">
        <span class="chart-layer-item pink">pCTR</span>
        <span class="chart-layer-item pink">pCVR</span>
      </div>
    </div>
    <div class="chart-layer-group">
      <div class="chart-layer-group-label">DSP Bidder</div>
      <div class="chart-layer-items">
        <span class="chart-layer-item pink">True Value &rarr; Bid Shading</span>
      </div>
    </div>
  </div>
</div>

핵심은 **세 갈래의 피처 파이프라인**(Batch / Streaming / Real-Time)이 하나의 Feature Store로 합류하고, 서빙 시점에 이들이 단일 Feature Vector로 조합된다는 것입니다.

### 광고 요청 1건에 필요한 피처 분류

| 피처 유형 | 예시 | 생성 방식 | 갱신 주기 | 저장 위치 |
|-----------|------|----------|----------|----------|
| **유저 피처** | 과거 7일 CTR, 관심사 세그먼트, 최근 본 카테고리 | Batch / Streaming | 수 시간 ~ 수 분 | Online Store |
| **광고 피처** | 광고 과거 CTR, 소재 임베딩, 캠페인 잔여 예산 | Batch / Streaming | 수 시간 ~ 수 분 | Online Store |
| **지면 피처** | 지면 카테고리, 평균 CTR, 광고 슬롯 위치 | Batch | 수 시간 | Online Store |
| **컨텍스트 피처** | 디바이스, OS, 시간대, 요일, 지역 | Real-Time | 요청 시점 | 계산 후 즉시 사용 |
| **교차 피처** | 유저×광고 과거 노출 횟수, 유저×카테고리 선호도 | Batch / Streaming | 수 시간 ~ 수 분 | Online Store |

---

## 2. 한 번의 광고 요청에서 피처가 모이는 과정

유저가 페이지를 열고 Bid Request가 도착한 순간부터, 피처가 조합되어 모델 추론이 완료되기까지의 타임라인입니다:

<div class="chart-timeline">
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
    <span style="font-size:0.85rem; font-weight:700; color:var(--text-primary);">DSP 내부 처리 타임라인</span>
    <span style="font-size:0.75rem; color:var(--text-muted);">목표: ~10ms 이내</span>
  </div>
  <div style="font-size:0.72rem; color:var(--text-muted); margin-bottom:4px;">1. Bid Request 수신 &rarr; Feature Gateway</div>
  <div class="chart-timeline-bar">
    <div class="chart-timeline-segment blue" style="width:12%;">유저 피처<br/>0.5ms</div>
    <div class="chart-timeline-segment cyan" style="width:14%;">광고 피처 N개<br/>1ms</div>
    <div class="chart-timeline-segment purple" style="width:8%;">지면 피처<br/>0.5ms</div>
    <div class="chart-timeline-segment green" style="width:4%;">컨텍스트<br/>0.1ms</div>
    <div class="chart-timeline-segment orange" style="width:8%;">Vector 조합<br/>0.5ms</div>
    <div class="chart-timeline-segment pink" style="width:38%;">Model Inference (pCTR, pCVR)<br/>2-5ms</div>
    <div class="chart-timeline-segment" style="width:16%; background:rgba(176,38,255,0.5);">Bid Logic<br/>1ms</div>
  </div>
  <div class="chart-timeline-labels">
    <span>0ms</span>
    <span>|</span>
    <span style="color:#36a2eb; font-weight:600;">병렬 조회 구간 (~1ms)</span>
    <span>|</span>
    <span>5ms</span>
    <span>|</span>
    <span>8ms</span>
    <span>|</span>
    <span>10ms</span>
  </div>
  <div class="chart-timeline-legend">
    <div class="chart-timeline-legend-item">
      <div class="chart-timeline-legend-dot" style="background:rgba(54,162,235,0.7);"></div>
      <span>Feature Lookup (Redis)</span>
    </div>
    <div class="chart-timeline-legend-item">
      <div class="chart-timeline-legend-dot" style="background:rgba(75,192,192,0.6);"></div>
      <span>Real-Time 계산 (CPU only)</span>
    </div>
    <div class="chart-timeline-legend-item">
      <div class="chart-timeline-legend-dot" style="background:rgba(255,159,64,0.6);"></div>
      <span>Vector 조합 (메모리)</span>
    </div>
    <div class="chart-timeline-legend-item">
      <div class="chart-timeline-legend-dot" style="background:rgba(255,99,132,0.6);"></div>
      <span>모델 추론 (GPU/CPU)</span>
    </div>
    <div class="chart-timeline-legend-item">
      <div class="chart-timeline-legend-dot" style="background:rgba(176,38,255,0.5);"></div>
      <span>입찰 로직</span>
    </div>
  </div>
</div>

### 시간 예산 분배

| 단계 | 소요 시간 (p50) | 비고 |
|------|----------------|------|
| Feature Lookup (병렬) | ~1ms | Redis MGET, 네트워크 왕복 포함 |
| 컨텍스트 피처 계산 | ~0.1ms | CPU 연산만 (I/O 없음) |
| Feature Vector 조합 | ~0.5ms | 메모리 내 concat + 정규화 |
| Model Inference | ~2-5ms | 모델 복잡도에 비례 |
| Bid Logic | ~1ms | True Value + Shading |
| **합계** | **~5-8ms** | DSP 내부 처리 총합 |

**병렬 조회가 핵심입니다.** 유저/광고/지면/컨텍스트 피처를 순차적으로 가져오면 4ms → 병렬로 가져오면 1ms. 이 차이가 후보 광고 수를 2배 이상 늘릴 여유를 만듭니다.

### 실전 예시: Redis에서 피처 조회하기

실제 Bid Request가 도착했을 때 Feature Gateway가 수행하는 Redis 명령입니다:

```bash
# 1. Bid Request 수신: user_id=U98712, ad_candidates=[A001, A002, A003], slot=S50

# 2a. 유저 피처 조회 (Hash)
HGETALL user:U98712
# → {
#     "ctr_7d": "0.023",         ← 최근 7일 CTR
#     "click_count_5m": "3",     ← 최근 5분 클릭 수 (Streaming)
#     "interest": "auto,finance", ← 관심사 세그먼트
#     "embedding": "[0.12, -0.34, ...]"  ← 유저 임베딩 (128차원)
#   }

# 2b. 광고 피처 일괄 조회 (Pipeline)
HGETALL ad:A001
HGETALL ad:A002
HGETALL ad:A003
# → 각 광고별 { "historical_ctr": "0.045", "creative_emb": "[...]", "budget_remain": "0.73" }

# 2c. 지면 피처 조회
HGETALL slot:S50
# → { "category": "news", "avg_ctr": "0.031", "position": "above_fold" }

# 2d. 컨텍스트 피처 (Redis 조회 아님 — 요청 데이터에서 직접 파싱)
# device=mobile, os=iOS, hour=14, weekday=Thu, geo=KR
```

이렇게 모인 피처들이 하나의 Feature Vector로 concat됩니다:

```python
# Feature Vector 조합 (간략화)
feature_vector = {
    # 유저 피처 (Batch + Streaming)
    "user_ctr_7d": 0.023,
    "user_click_count_5m": 3,
    "user_interest_auto": 1,    # one-hot
    "user_interest_finance": 1, # one-hot
    "user_embedding": [0.12, -0.34, ...],  # 128dim

    # 광고 피처 (Batch)
    "ad_historical_ctr": 0.045,
    "ad_creative_embedding": [0.08, 0.21, ...],  # 64dim
    "ad_budget_remain_ratio": 0.73,

    # 지면 피처 (Batch)
    "slot_category_news": 1,    # one-hot
    "slot_avg_ctr": 0.031,
    "slot_position_above_fold": 1,

    # 컨텍스트 피처 (Real-Time)
    "device_mobile": 1,
    "os_ios": 1,
    "hour_of_day": 14,
    "is_weekday": 1,
}
# → 이 벡터가 pCTR 모델에 입력됨
# → pCTR(user=U98712, ad=A001) = 0.038
```

---

## 3. Offline vs Near-Real-Time vs Real-Time Feature Pipeline

세 가지 파이프라인은 각각 다른 시간 해상도의 피처를 담당합니다:

<div class="chart-cards">
  <div class="chart-card">
    <div class="chart-card-header">
      <div class="chart-card-icon yellow">B</div>
      <div>
        <div class="chart-card-name">Batch Pipeline</div>
        <div class="chart-card-subtitle">수 시간 ~ 1일 주기</div>
      </div>
    </div>
    <div class="chart-card-body">
      <div class="chart-card-row">
        <span class="chart-card-row-label">처리 엔진</span>
        <span class="chart-card-row-value">Spark, Hive, BigQuery</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">저장소</span>
        <span class="chart-card-row-value">S3/Hive &rarr; Redis</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">장점</span>
        <span class="chart-card-row-value">복잡한 집계, 대용량</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">한계</span>
        <span class="chart-card-row-value">데이터 지연 (stale)</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">장애 영향</span>
        <span class="chart-card-row-value">성능 서서히 저하</span>
      </div>
    </div>
    <div class="chart-card-tags">
      <span class="chart-card-tag">유저 7일 CTR</span>
      <span class="chart-card-tag">광고 과거 성과</span>
      <span class="chart-card-tag">유저 임베딩</span>
    </div>
  </div>
  <div class="chart-card">
    <div class="chart-card-header">
      <div class="chart-card-icon orange">S</div>
      <div>
        <div class="chart-card-name">Streaming Pipeline</div>
        <div class="chart-card-subtitle">수 초 ~ 수 분 주기</div>
      </div>
    </div>
    <div class="chart-card-body">
      <div class="chart-card-row">
        <span class="chart-card-row-label">처리 엔진</span>
        <span class="chart-card-row-value">Flink, Kafka Streams</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">저장소</span>
        <span class="chart-card-row-value">Redis 직접 기록</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">장점</span>
        <span class="chart-card-row-value">최신 트렌드 반영</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">한계</span>
        <span class="chart-card-row-value">인프라 복잡도 높음</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">장애 영향</span>
        <span class="chart-card-row-value">입찰 정확도 하락</span>
      </div>
    </div>
    <div class="chart-card-tags">
      <span class="chart-card-tag">최근 5분 CTR</span>
      <span class="chart-card-tag">예산 소진율</span>
      <span class="chart-card-tag">트렌딩 카테고리</span>
    </div>
  </div>
  <div class="chart-card">
    <div class="chart-card-header">
      <div class="chart-card-icon green">&#11013;</div>
      <div>
        <div class="chart-card-name">Real-Time</div>
        <div class="chart-card-subtitle">요청 시점 (0ms 지연)</div>
      </div>
    </div>
    <div class="chart-card-body">
      <div class="chart-card-row">
        <span class="chart-card-row-label">처리 엔진</span>
        <span class="chart-card-row-value">애플리케이션 내부</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">저장소</span>
        <span class="chart-card-row-value">저장 안 함 (즉시 소비)</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">장점</span>
        <span class="chart-card-row-value">지연 없음, I/O 없음</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">한계</span>
        <span class="chart-card-row-value">단순 계산만 가능</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">장애 영향</span>
        <span class="chart-card-row-value">파싱 실패 &rarr; 입찰 불가</span>
      </div>
    </div>
    <div class="chart-card-tags">
      <span class="chart-card-tag">디바이스 타입</span>
      <span class="chart-card-tag">시간대</span>
      <span class="chart-card-tag">지면 URL</span>
    </div>
  </div>
</div>

### 피처별 파이프라인 매핑 예시

```
[Batch]  유저 과거 7일 CTR         ← Spark에서 일 1회 집계
[Batch]  광고 소재 임베딩            ← 모델 학습 후 업데이트
[Batch]  유저 관심사 세그먼트        ← DMP/CDP 연동, 일 1회 갱신

[Stream] 유저 최근 5분 클릭 수      ← Flink 윈도우 집계, Redis INCR
[Stream] 광고 최근 1시간 CTR        ← Sliding window, 매 분 갱신
[Stream] 캠페인 잔여 예산 비율      ← 소진 이벤트 실시간 차감

[RT]     디바이스 타입 (mobile/desktop)  ← Bid Request User-Agent 파싱
[RT]     시간대 (hour_of_day)            ← 서버 시각 기준 계산
[RT]     지면 URL 카테고리               ← URL 패턴 매칭 또는 lookup
```

---

## 4. Feature Store 아키텍처 심층 해부

Feature Store는 단순한 저장소가 아닙니다. **학습과 서빙에서 동일한 피처를 보장**하는 시스템입니다:

<div class="chart-arch">
  <div class="chart-arch-section">
    <div class="chart-arch-section-header">
      <span class="chart-arch-section-icon">1</span>
      <span class="chart-arch-section-title purple">Feature Registry (중앙 메타데이터)</span>
    </div>
    <div class="chart-arch-grid">
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">Feature 스키마</div>
        <div class="chart-arch-node-desc">이름, 타입, 차원</div>
      </div>
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">버전 관리</div>
        <div class="chart-arch-node-desc">v1 &rarr; v2 마이그레이션</div>
      </div>
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">Data Lineage</div>
        <div class="chart-arch-node-desc">원본 &rarr; 변환 &rarr; 피처</div>
      </div>
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">오너십</div>
        <div class="chart-arch-node-desc">팀, 담당자, SLA</div>
      </div>
    </div>
  </div>
  <div class="chart-arch-connector">&#8595;</div>
  <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
    <div class="chart-arch-section">
      <div class="chart-arch-section-header">
        <span class="chart-arch-section-icon">2</span>
        <span class="chart-arch-section-title blue">Offline Store (학습용)</span>
      </div>
      <div class="chart-arch-grid">
        <div class="chart-arch-node">
          <div class="chart-arch-node-name">Hive / S3</div>
          <div class="chart-arch-node-desc">Point-in-Time 쿼리</div>
        </div>
        <div class="chart-arch-node">
          <div class="chart-arch-node-name">학습 데이터셋</div>
          <div class="chart-arch-node-desc">Label + Feature Join</div>
        </div>
      </div>
    </div>
    <div class="chart-arch-section">
      <div class="chart-arch-section-header">
        <span class="chart-arch-section-icon">S</span>
        <span class="chart-arch-section-title blue">Online Store (서빙용)</span>
      </div>
      <div class="chart-arch-grid">
        <div class="chart-arch-node">
          <div class="chart-arch-node-name">Redis / DynamoDB</div>
          <div class="chart-arch-node-desc">Key-Value 조회</div>
        </div>
        <div class="chart-arch-node">
          <div class="chart-arch-node-name">Local Cache</div>
          <div class="chart-arch-node-desc">Hot Feature 캐싱</div>
        </div>
      </div>
    </div>
  </div>
  <div class="chart-arch-connector">&#8595;</div>
  <div class="chart-arch-section">
    <div class="chart-arch-section-header">
      <span class="chart-arch-section-icon">3</span>
      <span class="chart-arch-section-title orange">Materialization (Offline &rarr; Online 동기화)</span>
    </div>
    <div class="chart-arch-grid">
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">동기화 Job</div>
        <div class="chart-arch-node-desc">주기적 Offline &rarr; Online 복사</div>
      </div>
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">일관성 검증</div>
        <div class="chart-arch-node-desc">값 분포, null 비율, 범위 체크</div>
      </div>
    </div>
  </div>
  <div class="chart-arch-connector">&#8595;</div>
  <div class="chart-arch-section">
    <div class="chart-arch-section-header">
      <span class="chart-arch-section-icon">4</span>
      <span class="chart-arch-section-title pink">소비자 (Consumers)</span>
    </div>
    <div class="chart-arch-grid">
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">모델 학습</div>
        <div class="chart-arch-node-desc">Offline Store 읽기</div>
      </div>
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">모델 서빙</div>
        <div class="chart-arch-node-desc">Online Store 읽기</div>
      </div>
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">분석 / 디버깅</div>
        <div class="chart-arch-node-desc">Offline Store 읽기</div>
      </div>
    </div>
  </div>
</div>

### 핵심 컴포넌트

**Feature Registry**: Feature Store의 "카탈로그"입니다. 모든 피처의 이름, 타입, 차원, 생성 파이프라인, 담당 팀을 중앙에서 관리합니다. 새 피처를 등록하면 스키마 검증이 자동으로 파이프라인에 적용됩니다.

**Offline Store**: Hive나 S3에 시간축(timestamp)과 함께 피처를 저장합니다. 학습 데이터를 만들 때 **Point-in-Time Join**이 핵심입니다 — "이 유저가 이 광고를 본 시점에 피처 값이 무엇이었는가"를 정확히 복원해야 합니다. 미래 데이터가 섞이면 data leakage가 발생합니다.

**Online Store**: Redis나 DynamoDB에 최신 피처 값을 Key-Value로 저장합니다. 서빙 시 `GET user:12345` 한 번으로 유저의 전체 피처 벡터를 가져옵니다. p99 레이턴시 1ms 이내가 목표입니다.

**Materialization Job**: Offline Store의 피처를 Online Store로 동기화합니다. 이 과정에서 **피처 일관성 검증**(값 분포, null 비율, 범위 체크)을 수행하여, Offline과 Online의 피처가 일치하는지 확인합니다.

### Training-Serving Skew: Feature Store가 풀어야 할 근본 문제

Feature Store가 없던 시절에는 이런 일이 일상이었습니다:

```
# 학습 코드 (Python)
user_ctr = clicks_7d / impressions_7d          # 0으로 나누기 처리 없음

# 서빙 코드 (Java)  
user_ctr = clicks_7d / max(impressions_7d, 1)  # 0으로 나누기 방지
```

같은 피처인데 학습과 서빙에서 계산 로직이 다릅니다. 이것이 **Training-Serving Skew**입니다.

| Skew 유형 | 원인 | 결과 |
|-----------|------|------|
| **로직 Skew** | 학습/서빙 코드가 다른 언어·로직 | 동일 입력에 다른 피처 값 → 모델 성능 저하 |
| **시간 Skew** | 학습 시 미래 데이터 포함 (data leakage) | 오프라인 AUC 높지만 온라인 성능 낮음 |
| **분포 Skew** | 학습 데이터와 서빙 데이터의 분포 차이 | 입력 분포가 벗어나면 예측 신뢰도 하락 |

Feature Store는 **피처 정의를 한 곳에서 관리**하여 로직 Skew를 방지하고, **Point-in-Time Join**으로 시간 Skew를 방지합니다. 분포 Skew는 모니터링으로 감지합니다.

### 실전 예시: Point-in-Time Join

학습 데이터를 만들 때, "이 유저가 이 광고를 본 **그 시점**의 피처"를 정확히 복원해야 합니다. 미래 데이터가 섞이면 data leakage입니다.

```sql
-- 학습 데이터 생성: 클릭 이벤트 + 해당 시점의 피처 조합
SELECT
    e.user_id,
    e.ad_id,
    e.timestamp AS event_time,
    e.clicked AS label,

    -- Point-in-Time Join: 이벤트 시점 직전의 피처만 사용
    f.user_ctr_7d,
    f.user_click_count_5m,
    f.ad_historical_ctr,
    f.slot_avg_ctr

FROM impression_events e
LEFT JOIN feature_snapshots f
  ON  e.user_id = f.user_id
  AND e.ad_id   = f.ad_id
  AND f.snapshot_time = (
      -- 이벤트 시점 이전의 가장 최근 스냅샷
      SELECT MAX(snapshot_time)
      FROM feature_snapshots
      WHERE user_id = e.user_id
        AND ad_id   = e.ad_id
        AND snapshot_time <= e.timestamp  -- 핵심: 미래 데이터 차단
  )

WHERE e.date BETWEEN '2026-03-01' AND '2026-03-31'
```

**잘못된 Join (data leakage 발생)**:

```sql
-- 위험: snapshot_time 조건 없이 최신 피처를 그냥 가져오는 경우
LEFT JOIN feature_latest f ON e.user_id = f.user_id
-- → 3월 1일 이벤트에 3월 31일 피처가 붙음
-- → 오프라인 AUC 0.82 → 온라인 AUC 0.74 (성능 급락)
```

### 실전 예시: Online Store 데이터 구조

Redis에서 피처를 저장하는 실제 Key-Value 구조입니다:

```
Key 설계: {entity_type}:{entity_id}
TTL: 피처 갱신 주기의 2배 (안전 마진)

┌──────────────────────────────────────────────────────┐
│  Key: user:U98712          TTL: 48h (Batch 피처)     │
│  ┌──────────────────┬────────────────────────────┐   │
│  │ ctr_7d           │ 0.023                      │   │
│  │ interest         │ auto,finance               │   │
│  │ embedding        │ [0.12, -0.34, 0.56, ...]   │   │
│  │ updated_at       │ 2026-04-10T06:00:00Z       │   │
│  └──────────────────┴────────────────────────────┘   │
├──────────────────────────────────────────────────────┤
│  Key: user:U98712:rt       TTL: 10m (Streaming 피처) │
│  ┌──────────────────┬────────────────────────────┐   │
│  │ click_count_5m   │ 3                          │   │
│  │ last_click_cat   │ auto                       │   │
│  │ updated_at       │ 2026-04-10T14:32:15Z       │   │
│  └──────────────────┴────────────────────────────┘   │
├──────────────────────────────────────────────────────┤
│  Key: ad:A001              TTL: 24h                  │
│  ┌──────────────────┬────────────────────────────┐   │
│  │ historical_ctr   │ 0.045                      │   │
│  │ creative_emb     │ [0.08, 0.21, -0.15, ...]   │   │
│  │ budget_remain    │ 0.73                        │   │
│  └──────────────────┴────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

Batch 피처와 Streaming 피처를 **별도 Key**로 분리하는 이유: Streaming 피처의 TTL이 훨씬 짧아서(10분), 만료 시 Batch 피처까지 함께 사라지는 것을 방지합니다.

---

## 5. Feature Freshness vs Latency 트레이드오프

"피처를 더 자주 갱신하면 모델 성능이 올라간다"는 직관적이지만, 비용과 복잡도가 함께 올라갑니다:

<div class="chart-js-container">
  <canvas id="freshnessChart" height="280"></canvas>
</div>

### 피처별 최적 갱신 주기 가이드라인

| 피처 | 권장 갱신 주기 | 근거 |
|------|--------------|------|
| 유저 관심사 세그먼트 | 1일 | 관심사는 천천히 변함, 배치로 충분 |
| 유저 임베딩 | 1일 | 모델 재학습 주기와 동기화 |
| 유저 과거 7일 CTR | 1일 | 7일 윈도우 → 1일 지연은 ~14% 오차 |
| 광고 과거 CTR | 1시간 ~ 1일 | 새 광고는 빠른 갱신 필요, 성숙 광고는 1일 OK |
| 유저 최근 클릭 수 | 5분 | 직전 행동이 다음 클릭에 강한 영향 |
| 캠페인 잔여 예산 | 1분 | 예산 소진 속도에 따라 입찰 조절 필수 |
| 디바이스 / 시간대 | 실시간 | 요청마다 달라지는 값, 계산 비용 극히 낮음 |

### Freshness가 pCTR에 미치는 직관적 예시

유저가 오전에 자동차 관련 기사를 10개 클릭했다고 합시다.

- **24시간 전 CTR 피처**: 어제까지의 행동만 반영 → 자동차 관심사를 모름 → 자동차 광고 pCTR 과소추정 → 입찰 기회 손실
- **5분 전 CTR 피처**: 직전 클릭 패턴 반영 → 자동차 관심사 포착 → 자동차 광고 pCTR 정확 추정 → 적정 입찰 → 낙찰

이 차이가 **Streaming Pipeline의 존재 이유**입니다. 다만 모든 피처를 5분 갱신할 필요는 없고, 위 표처럼 **피처의 변화 속도에 맞춰 갱신 주기를 차등 설정**하는 것이 비용 대비 효과적입니다.

### 실전 예시: Freshness가 입찰가에 미치는 영향 (숫자 시뮬레이션)

같은 유저(U98712)에게 자동차 광고(A001)를 보여줄 때, 피처 갱신 주기에 따라 입찰가가 어떻게 달라지는지 추적합니다:

**상황**: 유저가 오전 10시부터 자동차 기사를 집중적으로 클릭 중. 현재 오후 2시.

| | Batch Only (24시간) | + Streaming (5분) |
|---|---|---|
| **user_ctr_7d** | 0.023 (어제 기준) | 0.023 (동일) |
| **user_click_count_5m** | 0 (피처 없음) | 3 (직전 5분) |
| **user_interest_auto** | 0 (어제엔 관심 없었음) | 1 (오늘 클릭 패턴 반영) |
| **pCTR 예측** | 0.018 | 0.042 |
| **True Value** (pCTR × pCVR × CPA) | $0.018 × 0.12 × $50 = **$0.108** | $0.042 × 0.12 × $50 = **$0.252** |
| **Bid Shading 후 입찰가** | **$0.076** | **$0.177** |
| **시장 평균가** | $0.15 | $0.15 |
| **결과** | **패찰** (입찰가 < 시장가) | **낙찰** (입찰가 > 시장가) |

Streaming 피처 하나(`user_click_count_5m`)의 추가로 pCTR이 0.018 → 0.042로 올라가고, 입찰가가 $0.076 → $0.177로 바뀌면서 **패찰이 낙찰로 전환**됩니다.

이것이 하루 수억 건의 입찰에서 반복되면, Streaming Pipeline 도입의 ROI는 명확해집니다.

---

## 6. 장애 시나리오 & Reliability

Feature Store는 광고 입찰의 **크리티컬 패스**에 있습니다. 장애가 곧 매출 손실입니다.

### 장애 유형별 영향과 대응

| 장애 유형 | 증상 | 영향 | 대응 전략 |
|-----------|------|------|----------|
| **Online Store 전체 장애** | 피처 조회 실패 | 모든 입찰 중단 | Multi-AZ 복제, 핫 스탠바이 |
| **Online Store 지연** | p99 레이턴시 급증 | 입찰 타임아웃 증가 → Win Rate 하락 | 타임아웃 설정 + Default Value 폴백 |
| **Batch Pipeline 지연** | 피처가 점점 stale | 모델 정확도 서서히 저하 | Freshness 모니터링 + 알림 |
| **Streaming Pipeline 장애** | 실시간 피처 갱신 중단 | 최근 행동 미반영 → 개인화 품질 하락 | Batch 피처로 자동 폴백 |
| **특정 피처 null 급증** | 파이프라인 버그/스키마 변경 | 모델 입력 오류 → 비정상 예측 | null 비율 모니터링 + 임계치 알림 |
| **피처 값 분포 이상** | 업스트림 데이터 변경 | 예측값 편향 → 과대/과소 입찰 | Feature Drift 감지 (PSI, KL Divergence) |

### Fallback 전략 계층

<div class="chart-steps">
  <div style="font-size:0.85rem; font-weight:700; color:var(--text-primary); margin-bottom:12px;">피처 조회 요청 발생 시 Fallback 순서</div>

  <div class="chart-step">
    <div class="chart-step-indicator">
      <div class="chart-step-dot green">1</div>
      <div class="chart-step-line"></div>
    </div>
    <div class="chart-step-content">
      <div class="chart-step-title">Online Store 최신 피처 사용</div>
      <div class="chart-step-desc">정상 경로. Redis/DynamoDB에서 최신 피처를 조회합니다. p99 레이턴시 1ms 이내.</div>
      <span class="chart-step-badge green">정상 &mdash; 최고 품질</span>
    </div>
  </div>
  <div class="chart-step">
    <div class="chart-step-indicator">
      <div class="chart-step-dot yellow">2</div>
      <div class="chart-step-line"></div>
    </div>
    <div class="chart-step-content">
      <div class="chart-step-title">Local Cache에서 캐시된 피처 사용</div>
      <div class="chart-step-desc">Online Store 장애 또는 타임아웃 시, 로컬에 캐싱된 이전 값을 사용합니다. 약간 stale하지만 유효합니다.</div>
      <span class="chart-step-badge yellow">경고 &mdash; 약간 stale</span>
    </div>
  </div>
  <div class="chart-step">
    <div class="chart-step-indicator">
      <div class="chart-step-dot orange">3</div>
      <div class="chart-step-line"></div>
    </div>
    <div class="chart-step-content">
      <div class="chart-step-title">Default Value 사용</div>
      <div class="chart-step-desc">캐시도 없을 때, 미리 정의된 글로벌 평균/중앙값을 사용합니다. 개인화 품질 하락.</div>
      <span class="chart-step-badge orange">위험 &mdash; 개인화 없음</span>
    </div>
  </div>
  <div class="chart-step">
    <div class="chart-step-indicator">
      <div class="chart-step-dot pink">4</div>
    </div>
    <div class="chart-step-content">
      <div class="chart-step-title">해당 피처 제외 (Degraded Model)</div>
      <div class="chart-step-desc">Default Value도 없으면 해당 피처 없이 추론합니다. 예측 품질 크게 저하되지만, 입찰은 유지됩니다.</div>
      <span class="chart-step-badge pink">심각 &mdash; 품질 저하</span>
    </div>
  </div>
</div>

각 계층으로 갈수록 예측 품질은 떨어지지만, **입찰 자체를 중단하는 것보다는 낫습니다**. Feature Store 설계 시 모든 피처에 대해 Default Value를 정의해두는 것이 안전합니다.

### Feature Drift 모니터링

프로덕션에서 피처 분포가 변하면 모델 성능이 저하됩니다. 주요 감지 지표:

| 지표 | 설명 | 알림 기준 (예시) |
|------|------|----------------|
| **PSI (Population Stability Index)** | 학습 데이터 대비 서빙 데이터의 분포 변화 | PSI > 0.2 → 경고 |
| **Null 비율** | 피처 값이 null인 요청 비율 | 평소 대비 3배 이상 → 경고 |
| **값 범위** | min/max/mean의 이동 | 이동평균 대비 3σ 이탈 → 경고 |
| **Freshness** | 피처의 마지막 갱신 시각 | 기대 주기 대비 2배 초과 → 경고 |

---

## 마무리

1. **피처 파이프라인은 세 갈래** — Batch(수 시간), Streaming(수 분), Real-Time(요청 시점)이 각각 다른 시간 해상도의 피처를 담당합니다. 피처의 변화 속도에 맞춰 파이프라인을 선택하세요.

2. **병렬 조회가 레이턴시의 핵심** — 10ms 예산 안에서 유저/광고/지면 피처를 순차적으로 가져오면 시간이 부족합니다. 병렬 조회와 local caching으로 I/O를 최소화하세요.

3. **Training-Serving Skew는 Feature Store가 해결** — 학습과 서빙에서 같은 피처 정의를 사용하도록 Feature Registry로 중앙 관리하고, Point-in-Time Join으로 data leakage를 방지하세요.

4. **Freshness는 무조건 높을수록 좋지 않다** — 피처별 최적 갱신 주기가 다릅니다. 인프라 복잡도와 비용 대비 성능 개선 효과를 따져서 차등 설정하세요.

5. **장애 대비는 설계 단계에서** — Online Store 장애 시 Local Cache → Default Value → Degraded Model로 이어지는 fallback 계층을 미리 구축하고, Feature Drift 모니터링으로 조기 감지하세요.

> 이 글에서 다룬 Feature Store와 Serving 아키텍처는 [광고 기술 생태계 전체 지도](post.html?id=adtech-ecosystem-map)의 DSP 내부 "Feature Store" 노드를 확대한 것입니다. 다음 글에서는 이 피처들을 소비하는 **모델 서빙 아키텍처**(Multi-Stage Ranking, 모델 경량화, A/B 실험)를 다룰 예정입니다.