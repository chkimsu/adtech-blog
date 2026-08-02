pCTR 모델을 만드는 입장에서, "내 모델이 실제로 어디에서 어떻게 쓰이는가"를 이해하는 것은 모델 설계만큼 중요합니다. 이 글은 **광고주의 캠페인 등록부터 유저의 전환까지**, 전체 생태계를 pCTR 모델러의 시선으로 해부합니다.

> 각 단계에서 pCTR/pCVR 모델이 어떤 역할을 하는지, 그리고 모델 정확도가 비즈니스에 어떤 영향을 미치는지에 집중합니다.

---

## 1. 광고 생태계 전체 조감도

먼저 숲을 보겠습니다. 광고 생태계의 모든 주요 참여자와 데이터 흐름입니다:

```mermaid
graph TB
  subgraph Advertiser["광고주 (Advertiser)"]
    ADV(["광고주<br/>KPI: ROAS, CPA, ROI"])
    CAMP(["캠페인 설정<br/>예산 · 타겟 · 소재"])
    CREATIVE(["광고 소재<br/>배너, 동영상, 네이티브"])
  end

  subgraph DSP_System["DSP (Demand-Side Platform)"]
    BIDDER(["Bidder<br/>실시간 입찰 엔진"])

    subgraph ML_Models["ML 모델 스택"]
      PCTR(["pCTR 모델<br/>클릭 확률 예측"])
      PCVR(["pCVR 모델<br/>전환 확률 예측"])
      BUDGET(["Budget Pacer<br/>예산 분배 최적화"])
    end

    subgraph Bid_Optimization["입찰 최적화"]
      TV(["True Value 계산<br/>V = pCTR × pCVR × ConvValue"])
      SHADE(["Bid Shading<br/>최적 입찰가 b*"])
    end

    TARGETING(["타겟팅 엔진"])
    ADSELECT(["Ad Ranking"])
    FEAT[("Feature Store<br/>유저·지면·시간 피처")]
  end

  subgraph DMP_CDP["데이터 플랫폼"]
    DMP(["DMP<br/>3rd Party 데이터"])
    CDP(["CDP<br/>1st Party 데이터"])
    SEGMENT(["Audience Segment"])
  end

  subgraph Exchange["Ad Exchange"]
    ADEX(["Ad Exchange<br/>경매 운영"])
    AUCTION(["Auction Engine<br/>1st/2nd Price"])
  end

  subgraph SSP_System["SSP (Supply-Side Platform)"]
    SSP(["SSP<br/>매체 수익 최적화"])
    FLOOR(["Floor Price 설정"])
    HB(["Header Bidding<br/>병렬 경매"])
  end

  subgraph Publisher["매체 (Publisher)"]
    PUB(["웹사이트 / 앱"])
    SLOT(["광고 지면 (Ad Slot)"])
  end

  subgraph User_Side["유저 (Consumer)"]
    USER(["유저"])
    IMP(["광고 노출 (Impression)"])
    CLICK(["클릭 (Click)"])
    CONV(["전환 (Conversion)"])
  end

  ADV -->|캠페인 등록| CAMP
  CAMP --> CREATIVE
  CAMP ==>|예산·타겟·KPI| DSP_System

  CDP --> SEGMENT
  DMP --> SEGMENT
  SEGMENT -->|유저 프로필| TARGETING

  USER -->|페이지 방문| PUB
  PUB -->|광고 요청| SSP
  SSP --> FLOOR
  SSP --> HB
  HB ==>|Bid Request| ADEX
  ADEX ==>|Bid Request 전달| BIDDER

  BIDDER --> FEAT
  FEAT --> PCTR
  FEAT --> PCVR
  PCTR --> TV
  PCVR --> TV
  TARGETING --> ADSELECT
  ADSELECT --> TV
  TV --> SHADE
  BUDGET --> SHADE
  SHADE ==>|Bid Response| ADEX

  ADEX --> AUCTION
  AUCTION ==>|낙찰 결과| SSP
  SSP -->|광고 전달| SLOT
  SLOT --> IMP
  IMP -->|유저 반응| CLICK
  CLICK --> CONV

  CONV -.->|전환 피드백| PCVR
  CLICK -.->|클릭 피드백| PCTR
  AUCTION -.->|Win/Lose 피드백| SHADE

  %% 서브그래프 배경색
  style Advertiser stroke:#8f6231,stroke-width:2px
  style DSP_System stroke:#4a6b8a,stroke-width:2px
  style ML_Models stroke:#b0442c,stroke-width:2px
  style Bid_Optimization stroke:#4a6b8a,stroke-width:1px
  style DMP_CDP stroke:#7a5a30,stroke-width:2px
  style Exchange stroke:#4a6b8a,stroke-width:2px
  style SSP_System stroke:#5b7d6a,stroke-width:2px
  style Publisher stroke:#5b7d6a,stroke-width:1px
  style User_Side stroke:#54736f,stroke-width:2px

  %% 노드 스타일
  style PCTR fill:#b0442c,stroke:#b0442c,color:#fff
  style PCVR fill:#b0442c,stroke:#b0442c,color:#fff
  style SHADE fill:#4a6b8a,stroke:#4a6b8a,color:#fff
  style TV fill:#7a5a30,stroke:#7a5a30,color:#fff
  style ADEX fill:#4a6b8a,stroke:#4a6b8a,color:#fff
  style AUCTION fill:#3f5c78,stroke:#3f5c78,color:#fff
  style USER fill:#5b7d6a,stroke:#4f6f5f,color:#fff
  style ADV fill:#8f6231,stroke:#8f6231,color:#fff
  style BUDGET fill:#c9a961,stroke:#c9a961,color:#201d1a
  style FEAT fill:#54736f,stroke:#54736f,color:#fff
  style BIDDER fill:#3f5c78,stroke:#3f5c78,color:#fff
  style CAMP fill:#8f6231,stroke:#8f6231,color:#fff
  style CREATIVE fill:#dcc0ae,stroke:#8f6231,color:#201d1a
  style SSP fill:#5b7d6a,stroke:#4f6f5f,color:#fff
  style HB fill:#4f6f5f,stroke:#4f6f5f,color:#fff
  style IMP fill:#b8cdc4,stroke:#b8cdc4,color:#201d1a
  style CLICK fill:#b8cdc4,stroke:#b8cdc4,color:#201d1a
  style CONV fill:#54736f,stroke:#54736f,color:#fff
```

이 다이어그램에서 **벽돌색(pCTR, pCVR)**이 pCTR 모델러의 영역입니다. 황동색(True Value)과 파란색(Bid Shading)은 모델 출력이 실제 입찰로 전환되는 지점입니다.

### 이 그림의 살아 있는 버전 — 지도 페이지

눌러 보고 재생할 수 있는 버전이 [살아있는 생태계 지도](ecosystem.html)입니다. 21개 모듈을 **두 층**으로 놓았습니다.

- **위층 = 두뇌 층.** Feature Store → Training → Model Serving → **pCTR/pCVR** → Calibration → Monitoring.
- **아래층 = 거래 층.** 사용자 → 매체·SSP → Ad Exchange → DSP → 광고주.

두 층은 **DSP와 pCTR/pCVR을 잇는 세로선**에서 만납니다. 이 한 줄만 붙잡으면 나머지는 따라옵니다. 처음이면 [모델러의 눈으로 보는 0.1초](ecosystem.html?flow=modeler) 칩, 거래 층만 보려면 [100ms RTB](ecosystem.html?flow=rtb) 칩입니다.

---

## 2. 한 번의 입찰이 일어나는 100ms

유저가 웹페이지를 열고 광고가 노출되기까지 약 100~200ms. 이 짧은 시간 안에 일어나는 모든 일을 시간순으로 봅니다:

<div class="chart-timeline">
<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
<span style="font-size:0.85rem; font-weight:700; color:var(--text-primary);">RTB 입찰 전체 타임라인 (~100-200ms)</span>
<span style="font-size:0.75rem; color:var(--text-muted);">유저 페이지 방문 &rarr; 광고 노출</span>
</div>
<div class="chart-timeline-bar">
<div class="chart-timeline-segment green" style="width:5%;" title="유저 → Publisher">1</div>
<div class="chart-timeline-segment green" style="width:8%;" title="Publisher → SSP">2-3</div>
<div class="chart-timeline-segment blue" style="width:10%;" title="SSP → Exchange → DSP">4</div>
<div class="chart-timeline-segment pink" style="width:35%;" title="DSP 내부 처리">5. DSP 내부 처리 (~10-30ms)</div>
<div class="chart-timeline-segment blue" style="width:8%;" title="Bid Response">6</div>
<div class="chart-timeline-segment" style="width:10%; background:rgba(176,38,255,0.5);" title="Auction">7. 경매</div>
<div class="chart-timeline-segment green" style="width:12%;" title="낙찰 → 노출">8-10</div>
<div class="chart-timeline-segment orange" style="width:12%;" title="유저 반응">11-12</div>
</div>
<div class="chart-timeline-labels">
<span>0ms</span>
<span>Bid Request</span>
<span style="color:#ff6384; font-weight:600;">DSP: Feature &rarr; pCTR &rarr; Shading</span>
<span>Auction</span>
<span>노출</span>
<span>~200ms</span>
</div>
<div class="chart-timeline-legend">
<div class="chart-timeline-legend-item">
<div class="chart-timeline-legend-dot" style="background:rgba(75,192,192,0.7);"></div>
<span>1. 유저 페이지 방문 &rarr; SSP 광고 요청</span>
</div>
<div class="chart-timeline-legend-item">
<div class="chart-timeline-legend-dot" style="background:rgba(54,162,235,0.7);"></div>
<span>4. Bid Request 전달 (~50ms 타임아웃)</span>
</div>
<div class="chart-timeline-legend-item">
<div class="chart-timeline-legend-dot" style="background:rgba(255,99,132,0.7);"></div>
<span>5. DSP: Feature 추출 &rarr; pCTR=0.032 &rarr; pCVR=0.15 &rarr; V=$0.24 &rarr; b*=$0.17</span>
</div>
<div class="chart-timeline-legend-item">
<div class="chart-timeline-legend-dot" style="background:rgba(176,38,255,0.5);"></div>
<span>7. Auction (1st/2nd Price) &rarr; 낙찰</span>
</div>
<div class="chart-timeline-legend-item">
<div class="chart-timeline-legend-dot" style="background:rgba(255,159,64,0.7);"></div>
<span>11-12. Click (수 초) / Conversion (수 시간~수 일 지연)</span>
</div>
</div>
</div>

### pCTR 모델러가 주목할 포인트

- **5c**: pCTR 추론이 **~1ms 이내**에 완료되어야 합니다. 모델 복잡도 vs 레이턴시 트레이드오프
- **5e**: pCTR의 작은 오차가 True Value에 증폭됩니다. pCTR이 0.032가 아니라 0.050이었다면 True Value는 $0.24 → $0.375로 56% 뛰고, 입찰가도 그만큼 올라갑니다
- **11-12**: 클릭 피드백은 수 초 내 도착하지만, 전환 피드백은 **수 시간~수 일 지연**(Delayed Feedback)될 수 있습니다. 이것이 pCVR 모델의 핵심 난관입니다

### 이 100ms가 지금 몇 번 겹쳐서 벌어지고 있나

지도에 화살표는 한 개지만, 실제로는 초마다 수만 번 겹칩니다.

```python
# 지도의 "SSP → Exchange → DSP" 화살표 하나는 요청 1건이 아니다.
# 페이지가 한 번 열릴 때 그 화살표가 몇 갈래로 갈라지는지 센다.
SLOTS, SSP_PER_SLOT, DSP_PER_AUCTION = 5, 3, 20  # 지면 수·지면당 SSP·경매당 DSP
PAGEVIEW = 10_000_000                            # 이 매체의 하루 페이지뷰

per_page = SLOTS * SSP_PER_SLOT * DSP_PER_AUCTION  # 페이지 1회의 Bid Request
daily = per_page * PAGEVIEW                        # 하루 총건
avg = daily / 86_400                               # 초당 평균(하루 = 86,400초)

for label, n in [("페이지 1회", per_page), ("하루 전체", daily), ("초당 평균", avg),
                 ("초당 피크(평균×3)", avg * 3), ("DSP 1곳 몫", avg / DSP_PER_AUCTION),
                 ("매체 100곳이면", avg * 100)]:
    print(f"{n:>15,.0f} 건  {label}")

# 출력:
#             300 건  페이지 1회
#   3,000,000,000 건  하루 전체
#          34,722 건  초당 평균
#         104,167 건  초당 피크(평균×3)
#           1,736 건  DSP 1곳 몫
#       3,472,222 건  매체 100곳이면
```

지면 5개짜리 페이지 하나가 **Bid Request 300건**을 만듭니다. 하루 1,000만 PV면 30억 건, 초당 3만 5천 건. 이런 매체가 100곳이면 초당 347만 건입니다.

---

## 3. pCTR 모델이 비즈니스에 미치는 영향 경로

pCTR 모델의 정확도가 최종 광고주 ROI까지 어떤 경로로 영향을 미치는지 추적합니다:

<div class="chart-steps">
<div style="font-size:0.85rem; font-weight:700; color:var(--text-primary); margin-bottom:12px;">pCTR 모델 정확도 &rarr; 비즈니스 결과 영향 경로</div>
<div class="chart-step">
<div class="chart-step-indicator">
<div class="chart-step-dot pink">1</div>
<div class="chart-step-line"></div>
</div>
<div class="chart-step-content">
<div class="chart-step-title">pCTR 모델</div>
<div class="chart-step-desc">캘리브레이션 (예측 vs 실제 확률 일치도) + 판별력 (AUC-ROC)</div>
<span class="chart-step-badge pink">모델러의 영역</span>
</div>
</div>
<div class="chart-step">
<div class="chart-step-indicator">
<div class="chart-step-dot purple" style="background:rgba(176,38,255,0.8);">2</div>
<div class="chart-step-line"></div>
</div>
<div class="chart-step-content">
<div class="chart-step-title">True Value 정확도</div>
<div class="chart-step-desc">V = pCTR &times; pCVR &times; ConvValue. pCTR 오차가 그대로 V에 전파됩니다.</div>
</div>
</div>
<div class="chart-step">
<div class="chart-step-indicator">
<div class="chart-step-dot blue">3</div>
<div class="chart-step-line"></div>
</div>
<div class="chart-step-content">
<div class="chart-step-title">입찰가 정확도 &rarr; Win Rate &amp; 비용 효율</div>
<div class="chart-step-desc">과대추정 &rarr; 과다입찰 &rarr; Win Rate&uarr; but 비용&uarr;&uarr;. 과소추정 &rarr; 과소입찰 &rarr; 기회 손실.</div>
</div>
</div>
<div class="chart-step">
<div class="chart-step-indicator">
<div class="chart-step-dot green">4</div>
</div>
<div class="chart-step-content">
<div class="chart-step-title">비즈니스 결과</div>
<div class="chart-step-desc">광고주 ROI, DSP 수익, 예산 소진 속도가 모두 pCTR 정확도에 직결됩니다.</div>
<span class="chart-step-badge green">최종 목표: ROI 극대화</span>
</div>
</div>
</div>

| pCTR 상태 | True Value | 입찰 결과 | 비즈니스 영향 |
|-----------|-----------|---------|-------------|
| **과대추정** (pCTR > 실제 CTR) | V 과대 → 과다 입찰 | Win Rate ↑ but 비용 ↑↑ | ROI 하락, 예산 조기 소진 |
| **과소추정** (pCTR < 실제 CTR) | V 과소 → 과소 입찰 | Win Rate ↓↓ | 기회 손실, 노출 부족 |
| **정확** (pCTR ≈ 실제 CTR) | V 정확 → 최적 shading 가능 | Win Rate 적정 + 비용 효율 | **ROI 극대화** |
| **판별력 부족** (AUC 낮음) | 좋은 지면/나쁜 지면 구분 실패 | 나쁜 지면에 과다입찰 | 전환 없는 노출에 예산 낭비 |

### 지도가 pCTR/pCVR을 심장으로 그린 이유

[생태계 지도](ecosystem.html)에서 pCTR/pCVR 상자만 크고 색이 다릅니다. 위 표의 네 줄이 그 이유입니다. 이 숫자가 틀리면 True Value가 틀리고, 입찰가와 비용이 함께 틀어집니다. 얼마나 넓게 퍼지는지는 지도의 모양으로 확인할 수 있습니다. 화살표를 코드로 옮겨 적고, 심장에서 각 모듈까지 몇 다리인지 세어 봅니다.

```python
from collections import deque

# 지도의 화살표를 짧은 이름으로 옮겨 적었다(방향은 빼고 이웃 관계만 본다).
TRADE = ("user-pub pub-ssp ssp-ex ex-dsp dsp-adv ex-auc pub-hb hb-ssp user-log "
         "pub-log log-mmp mmp-adv dmp-dsp dco-dsp brand-adv cmp-dmp journey-log journey-cmp")
BRAIN = "fs-train train-serve serve-mon mon-train fs-serve serve-pctr pctr-calib"
CROSS = "dsp-pctr dsp-serve auc-pctr calib-dsp log-fs"  # 두 층을 잇는 화살표

g = {}
for pair in f"{TRADE} {BRAIN} {CROSS}".split():
    a, b = pair.split("-")
    g.setdefault(a, set()).add(b)   # 이웃 관계는 양방향으로 담는다
    g.setdefault(b, set()).add(a)

dist, q = {"pctr": 0}, deque(["pctr"])  # 심장에서 출발하는 너비 우선 탐색
while q:
    n = q.popleft()
    for m in sorted(g[n]):              # sorted로 출력 순서를 고정
        if m not in dist:
            dist[m] = dist[n] + 1
            q.append(m)

print(f"모듈 {len(g)}개 · 두 층을 잇는 화살표 {len(CROSS.split())}개")
for k in range(max(dist.values()) + 1):
    same = sorted(n for n, v in dist.items() if v == k)
    print(f"{k}다리 {len(same):2d}개  {' '.join(same)}")

# 출력:
# 모듈 21개 · 두 층을 잇는 화살표 5개
# 0다리  1개  pctr
# 1다리  4개  auc calib dsp serve
# 2다리  7개  adv dco dmp ex fs mon train
# 3다리  5개  brand cmp log mmp ssp
# 4다리  4개  hb journey pub user
```

21개 모듈 전부가 심장에서 **4다리 안**에 있습니다. 가장 먼 곳이 사용자와 매체(4다리)입니다. 두 층을 잇는 화살표는 5개뿐인데도 이만큼 가깝습니다. pCTR 오차가 왜 전체로 번지는지, 지도의 모양이 설명합니다.

---

## 4. 자동 입찰(Auto-Bidding) 파이프라인 상세

광고주가 "CPA $10 목표"라고 설정하면, DSP 내부에서 일어나는 자동 입찰 로직입니다:

<div class="chart-arch">
<div class="chart-arch-section">
<div class="chart-arch-section-header">
<span class="chart-arch-section-icon">1</span>
<span class="chart-arch-section-title orange">광고주 입력 (Input)</span>
</div>
<div class="chart-arch-grid">
<div class="chart-arch-node">
<div class="chart-arch-node-name">캠페인 목표</div>
<div class="chart-arch-node-desc">CPA = $10</div>
</div>
<div class="chart-arch-node">
<div class="chart-arch-node-name">일일 예산</div>
<div class="chart-arch-node-desc">$1,000</div>
</div>
<div class="chart-arch-node">
<div class="chart-arch-node-name">타겟 조건</div>
<div class="chart-arch-node-desc">국가, 디바이스, 관심사</div>
</div>
</div>
</div>
<div class="chart-arch-connector">&#8595;</div>
<div class="chart-arch-section">
<div class="chart-arch-section-header">
<span class="chart-arch-section-icon">2</span>
<span class="chart-arch-section-title pink">예측 단계 (Prediction)</span>
</div>
<div class="chart-arch-grid">
<div class="chart-arch-node">
<div class="chart-arch-node-name">pCTR(x) = 0.032</div>
<div class="chart-arch-node-desc">클릭 확률 예측</div>
</div>
<div class="chart-arch-node">
<div class="chart-arch-node-name">pCVR(x) = 0.15</div>
<div class="chart-arch-node-desc">전환 확률 예측</div>
</div>
<div class="chart-arch-node">
<div class="chart-arch-node-name">pCTCVR = 0.0048</div>
<div class="chart-arch-node-desc">pCTR &times; pCVR</div>
</div>
</div>
</div>
<div class="chart-arch-connector">&#8595;</div>
<div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
<div class="chart-arch-section">
<div class="chart-arch-section-header">
<span class="chart-arch-section-icon">3</span>
<span class="chart-arch-section-title purple">가치 산정 (Valuation)</span>
</div>
<div class="chart-arch-grid">
<div class="chart-arch-node">
<div class="chart-arch-node-name">CPA 기반</div>
<div class="chart-arch-node-desc">V = 0.0048 &times; $10 = $0.048</div>
</div>
<div class="chart-arch-node">
<div class="chart-arch-node-name">ROAS 기반</div>
<div class="chart-arch-node-desc">V = 0.0048 &times; $50 = $0.24</div>
</div>
</div>
</div>
<div class="chart-arch-section">
<div class="chart-arch-section-header">
<span class="chart-arch-section-icon">4</span>
<span class="chart-arch-section-title blue">입찰 최적화 (Shading)</span>
</div>
<div class="chart-arch-grid">
<div class="chart-arch-node">
<div class="chart-arch-node-name">시장 분포 추정</div>
<div class="chart-arch-node-desc">F(b|x) ~ LogNormal</div>
</div>
<div class="chart-arch-node">
<div class="chart-arch-node-name">Budget Pacing</div>
<div class="chart-arch-node-desc">남은 예산 기반 조절</div>
</div>
</div>
</div>
</div>
<div class="chart-arch-connector">&#8595;</div>
<div class="chart-arch-section">
<div class="chart-arch-section-header">
<span class="chart-arch-section-icon">5</span>
<span class="chart-arch-section-title" style="color:#4bc0c0;">입찰 출력 (Output)</span>
</div>
<div class="chart-arch-grid">
<div class="chart-arch-node">
<div class="chart-arch-node-name">최종 입찰가: b* = $0.034</div>
<div class="chart-arch-node-desc">Surplus 최대화: b* = argmax (V-b)&middot;F(b|x), shading 29%</div>
</div>
</div>
</div>
</div>

### eCPM: 과금 모델을 통일하는 정규화 공식

광고 시장에는 CPM(노출 과금), CPC(클릭 과금), CPA(전환 과금) 등 다양한 과금 모델이 공존합니다. Ad Exchange에서는 과금 모델이 다른 캠페인들이 **동일 지면을 놓고 경쟁**합니다. 이들을 나란히 비교하려면 **eCPM(effective Cost Per Mille)**으로 단위를 통일해야 합니다.

$$\text{eCPM} = \text{1,000 노출당 기대 수익}$$

| 과금 모델 | eCPM 변환 공식 | 예시 |
|----------|--------------|------|
| **CPM** | $\text{eCPM} = \text{CPM}$ | CPM $5.00 → eCPM $5.00 |
| **CPC** | $\text{eCPM} = pCTR \times CPC \times 1{,}000$ | pCTR 2%, CPC $0.50 → eCPM $10.00 |
| **CPA** | $\text{eCPM} = pCTR \times pCVR \times CPA \times 1{,}000$ | pCTR 2%, pCVR 10%, CPA $20 → eCPM $40.00 |

**pCTR 모델의 정확도가 eCPM에 직결되는 이유**: CPC/CPA 캠페인의 eCPM은 pCTR을 곱해서 산출됩니다. pCTR이 2%인데 모델이 4%로 과대추정하면 eCPM이 2배로 뻥튀기되어, 실제 가치보다 훨씬 높은 가격에 입찰하게 됩니다. 반대로 과소추정하면 경쟁에서 밀려 노출 기회를 잃습니다.

**SSP/Exchange 관점**: Exchange는 모든 입찰을 eCPM으로 변환한 뒤 비교하여 낙찰자를 결정합니다. 따라서 DSP가 보내는 입찰가는 이미 eCPM 기반이며, 앞서 본 True Value 계산이 바로 이 eCPM 산출 과정입니다.

### 두 가지 가치 산정 방식

**CPA 기반** (전환 최적화 캠페인):
$$V = \underbrace{pCTR(x) \times pCVR(x)}_{\text{전환 확률 (pCTCVR)}} \times \underbrace{\text{Target CPA}}_{\text{광고주 설정 목표}}$$

**ROAS 기반** (수익 최적화 캠페인):
$$V = pCTR(x) \times pCVR(x) \times \underbrace{\text{Avg Revenue}}_{\text{평균 전환 매출}}$$

어떤 방식이든, **pCTR과 pCVR이 핵심 입력**입니다. 모델이 부정확하면 V가 부정확하고, V가 부정확하면 입찰가가 부정확합니다.

---

## 5. 데이터 피드백 루프: 모델이 학습하는 과정

광고 시스템은 **자기 강화 루프(feedback loop)**로 작동합니다. pCTR 모델의 예측이 데이터를 만들고, 그 데이터가 다시 모델을 학습시킵니다:

<div class="chart-layer">
<div class="chart-layer-title">OFFLINE TRAINING (수 시간 ~ 수 일 주기)</div>
<div class="chart-layer-row">
<div class="chart-layer-group">
<div class="chart-layer-group-label">로그 데이터</div>
<div class="chart-layer-items">
<span class="chart-layer-item blue">Impression</span>
<span class="chart-layer-item blue">Click</span>
<span class="chart-layer-item blue">Conversion</span>
</div>
</div>
<div class="chart-layer-group">
<div class="chart-layer-group-label">Feature Engineering</div>
<div class="chart-layer-items">
<span class="chart-layer-item pink">유저 &middot; 지면 &middot; 시간 &middot; 소재 피처</span>
</div>
</div>
<div class="chart-layer-group">
<div class="chart-layer-group-label">모델 학습 &amp; 평가</div>
<div class="chart-layer-items">
<span class="chart-layer-item pink">Logistic Reg, DeepFM 등</span>
<span class="chart-layer-item pink">AUC, Calibration, LogLoss</span>
</div>
</div>
<div class="chart-layer-group">
<div class="chart-layer-group-label">모델 배포</div>
<div class="chart-layer-items">
<span class="chart-layer-item green">서빙 서버 배포</span>
</div>
</div>
</div>
<div class="chart-layer-arrow">&#8595; 배포된 모델</div>
<div class="chart-layer-title">ONLINE SERVING (실시간, ~1ms)</div>
<div class="chart-layer-row">
<div class="chart-layer-group">
<div class="chart-layer-group-label">pCTR 추론</div>
<div class="chart-layer-items">
<span class="chart-layer-item pink">x &rarr; p(click|x)</span>
</div>
</div>
<div class="chart-layer-group">
<div class="chart-layer-group-label">입찰 &amp; 낙찰</div>
<div class="chart-layer-items">
<span class="chart-layer-item blue">True Value &rarr; Bid Shading</span>
</div>
</div>
<div class="chart-layer-group">
<div class="chart-layer-group-label">광고 노출</div>
<div class="chart-layer-items">
<span class="chart-layer-item green">유저에게 광고 도달</span>
</div>
</div>
</div>
<div class="chart-layer-arrow">&#8595; 유저 반응</div>
<div class="chart-layer-title">FEEDBACK (피드백 수집) &mdash; &#8634; 다시 로그 데이터로</div>
<div class="chart-layer-row">
<div class="chart-layer-group">
<div class="chart-layer-group-label">클릭 이벤트</div>
<div class="chart-layer-items">
<span class="chart-layer-item cyan">수 초 내 수집</span>
</div>
</div>
<div class="chart-layer-group">
<div class="chart-layer-group-label">전환 이벤트</div>
<div class="chart-layer-items">
<span class="chart-layer-item cyan">수 시간 ~ 수 일 지연</span>
</div>
</div>
<div class="chart-layer-group">
<div class="chart-layer-group-label">Win/Lose 피드백</div>
<div class="chart-layer-items">
<span class="chart-layer-item cyan">경매 결과</span>
</div>
</div>
<div class="chart-layer-group">
<div class="chart-layer-group-label">! 난관 (Challenges)</div>
<div class="chart-layer-items">
<span class="chart-layer-item orange">Selection Bias</span>
<span class="chart-layer-item orange">Delayed Feedback</span>
<span class="chart-layer-item orange">Distribution Shift</span>
<span class="chart-layer-item orange">Censored Data</span>
</div>
</div>
</div>
</div>

### pCTR 모델러가 매일 싸우는 4가지 난관

| 난관 | 원인 | 영향 | 대응 |
|------|------|------|------|
| **Selection Bias** | 낙찰한 광고만 클릭/전환 데이터 수집 | 못 이긴 경매의 잠재 성과를 모름 | ESMM, Inverse Propensity Weighting |
| **Delayed Feedback** | 전환은 클릭 후 수 시간~수 일 후 발생 | 최신 데이터에 전환 라벨 누락 | Attribution Window, FSIW |
| **Distribution Shift** | 유저 행동, 시즌, 경쟁 환경 변화 | 어제의 모델이 오늘 부정확 | 온라인 학습, 주기적 재학습 |
| **Censored Data** | 패찰 시 경쟁자 가격 미관측 | 시장 분포 과소추정 → 과도한 shading | Censored Regression, Survival Analysis |

### 두뇌 층은 한 바퀴 도는 데 몇 시간 걸리나

지도 위층은 왼쪽에서 오른쪽으로 흐르지 않습니다. **고리**입니다: `로그 → Feature Store → Training → Model Serving → pCTR/pCVR → Monitoring → Training`. 이 고리만 따라가려면 [모델 학습·서빙 흐름](ecosystem.html?flow=modeling) 칩을 누르세요.

```python
# 두뇌 층은 고리다. 로그가 한 바퀴 돌아 다시 심장에 닿는 시간을 더한다.
STAGES = [
    ("로그 수집·조인", 0.5),   # 노출·클릭 로그가 모여 붙기까지
    ("전환 라벨 대기", 24.0),  # 전환은 클릭보다 한참 늦게 온다
    ("학습셋 만들기", 1.5),    # Feature Store에서 피처를 붙인다
    ("모델 학습", 4.0),        # Training
    ("오프라인 검증", 1.0),    # AUC·LogLoss가 기준을 넘는지
    ("배포·워밍업", 0.5),      # Model Serving 교체
]
loop = sum(h for _, h in STAGES)
for name, h in STAGES:
    print(f"{h:5.1f}시간 ({h / loop:3.0%})  {name}")
print(f"{loop:5.1f}시간         한 바퀴 전체")

# 학습을 하루 n번 돌리면 지금 서빙 중인 모델은 평균 몇 시간 전 세상을 보는가.
# 모델 나이는 한 주기 안에서 loop ~ loop+24/n을 오가니 평균은 loop+12/n이다.
for n in (1, 4, 24):
    print(f"하루 {n:2d}회 학습 → 모델 나이 평균 {loop + 12 / n:.1f}시간")

# 출력:
#   0.5시간 ( 2%)  로그 수집·조인
#  24.0시간 (76%)  전환 라벨 대기
#   1.5시간 ( 5%)  학습셋 만들기
#   4.0시간 (13%)  모델 학습
#   1.0시간 ( 3%)  오프라인 검증
#   0.5시간 ( 2%)  배포·워밍업
#  31.5시간         한 바퀴 전체
# 하루  1회 학습 → 모델 나이 평균 43.5시간
# 하루  4회 학습 → 모델 나이 평균 34.5시간
# 하루 24회 학습 → 모델 나이 평균 32.0시간
```

한 바퀴에 31.5시간, 그중 24시간이 **전환 라벨을 기다리는 시간**입니다(76%). 학습을 하루 1번에서 24번으로 늘려도 모델 나이는 43.5시간에서 32.0시간까지만 줄어듭니다. 병목은 GPU가 아니라 기다림입니다([지연 피드백 글](post.html?id=online-learning-delayed-feedback)).

---

## 6. 유저 여정과 모델 터치포인트

마지막으로, **유저의 관점**에서 광고가 어떤 경로로 도달하는지, 그리고 각 단계에서 어떤 모델이 개입하는지 봅니다:

<div class="chart-timeline">
<div style="font-size:0.85rem; font-weight:700; color:var(--text-primary); margin-bottom:12px;">유저 여정 (Consumer Journey) &amp; 모델 터치포인트</div>
<div class="chart-timeline-bar">
<div class="chart-timeline-segment green" style="width:14%;">뉴스 앱 실행</div>
<div class="chart-timeline-segment green" style="width:14%;">기사 페이지 로딩</div>
<div class="chart-timeline-segment cyan" style="width:15%;">광고 노출</div>
<div class="chart-timeline-segment pink" style="width:14%;">광고 클릭</div>
<div class="chart-timeline-segment" style="width:14%; background:rgba(176,38,255,0.5);">랜딩 페이지</div>
<div class="chart-timeline-segment orange" style="width:14%;">장바구니 담기</div>
<div class="chart-timeline-segment" style="width:15%; background:rgba(75,192,192,0.7);">결제 완료</div>
</div>
<div class="chart-timeline-legend">
<div class="chart-timeline-legend-item">
<div class="chart-timeline-legend-dot" style="background:rgba(255,206,86,0.8);"></div>
<span><strong>페이지 로딩 시</strong> &mdash; 타겟팅 모델: 이 유저에게 광고를 보여줄 것인가?</span>
</div>
<div class="chart-timeline-legend-item">
<div class="chart-timeline-legend-dot" style="background:rgba(255,99,132,0.8);"></div>
<span><strong>노출 전 (~10ms)</strong> &mdash; pCTR 모델: 클릭 확률은? + Bid Shading: 얼마에 입찰?</span>
</div>
<div class="chart-timeline-legend-item">
<div class="chart-timeline-legend-dot" style="background:rgba(255,99,132,0.8);"></div>
<span><strong>클릭 시 (수 초)</strong> &mdash; pCVR 모델 (사후 분석) + pCTR 학습 데이터 수집</span>
</div>
<div class="chart-timeline-legend-item">
<div class="chart-timeline-legend-dot" style="background:rgba(176,38,255,0.8);"></div>
<span><strong>전환 시 (수 시간~수 일)</strong> &mdash; 어트리뷰션 모델: 이 전환은 어떤 광고 덕분?</span>
</div>
</div>
</div>

| 유저 행동 | 시점 | 개입 모델 | 모델러 관심사 |
|----------|------|---------|-------------|
| 페이지 방문 | Bid Request 발생 | **타겟팅 모델** | 이 유저가 캠페인 타겟에 맞는가? |
| 광고 노출 전 | 입찰 결정 (~10ms) | **pCTR** + **Bid Shading** | 클릭 확률 → True Value → 최적 입찰가 |
| 클릭 | 수 초 내 | **pCVR** (사후 분석) | 클릭 피드백으로 pCTR 모델 업데이트 |
| 전환 | 수 시간~수 일 후 | **어트리뷰션 모델** | 어떤 노출/클릭이 전환에 기여했는가? |

---

## 7. 데모와 개념의 연결 가이드

이 블로그의 데모들이 전체 생태계에서 어디에 위치하는지 매핑합니다:

| 데모 | 생태계 위치 | pCTR 모델러에게 주는 인사이트 |
|------|-----------|--------------------------|
| [UCB1 Demo](demo-ucb1.html) | 광고 선택 (Ad Ranking) | 새 광고의 pCTR을 아직 모를 때, 탐색과 활용의 균형 |
| [Thompson Sampling](demo-ts.html) | 광고 선택 (확률적 접근) | pCTR의 **불확실성**을 분포로 표현하여 자연스러운 탐색 |
| [LinUCB](demo-linucb.html) | 개인화 광고 선택 | **유저 Feature**를 활용한 pCTR 예측의 기초 원리 |
| [RTB Auction](demo-rtb.html) | Ad Exchange 경매 | pCTR × ConvValue가 입찰가로 변환되는 과정 |
| [Bid Landscape](demo-bid-landscape.html) | 입찰 전략 분석 | pCTR 정확도가 최적 입찰가에 미치는 영향 |
| [Bid Shading](demo-bid-shading.html) | 입찰 최적화 + Censored Data | 1st Price에서 Shading이 필수인 이유 + 관측 불가 문제 |

### 추천 학습 순서

```text
1. UCB1 / Thompson Sampling  →  "탐색 vs 활용" 직관 형성
2. LinUCB                    →  "Feature가 예측에 미치는 영향" 이해
3. RTB Auction               →  "경매 시장에서 입찰이 어떻게 작동하는가"
4. Bid Landscape             →  "pCTR이 입찰 전략에 미치는 영향"
5. Bid Shading               →  "1st Price에서의 최적화 + Censored Data"
```

1-2에서 알고리즘의 기초를 잡고, 3에서 시장 역학을 이해합니다. 그다음 4-5에서 **pCTR 정확도가 비즈니스 성과를 좌우한다**는 핵심 교훈에 도달합니다.

### 지도에서 같은 연결을 눌러 보기

위 표를 외울 필요는 없습니다. [살아있는 생태계 지도](ecosystem.html)에서 상자를 클릭하면, 그 모듈의 정의와 연결된 데모·글이 옆 패널에 열립니다. DSP 상자를 누르면 위 표의 데모가 거기 다 붙어 있습니다. 지도와 글이 같은 색인을 공유한다는 뜻입니다. 두뇌 층만 순서대로 훑고 싶다면 [ML 엔지니어 트랙](ml-track.html)이 읽는 순서를 정해 줍니다. 회사별 역할은 [DSP·SSP·Exchange](post.html?id=dsp-ssp-exchange), 전체 관문은 [30분 입문 가이드](post.html?id=adtech-30min-primer)입니다.

---

## 8. 같은 지도, 두 무대

**똑같은 지도가 무대에 따라 다르게 작동합니다.** 상자들이 남남인지, 한 회사 안인지의 차이입니다.

### 상자 사이마다 회사 경계가 있을 때 [무대: 열린 RTB]

경계를 넘을 때마다 **수수료**와 **정보 단절**이 생깁니다. 아래 가상 데이터로 구간별로 봅니다. 수수료율은 업계 통념 범위이며, 특정 회사의 요율이 아닙니다.

| 지도 구간 | 회사 경계 | 이 구간 수수료(가상 데이터) | 넘어가지 않는 정보 |
|---|---|---|---|
| Publisher → SSP | 있음 | 10~20% | 매체의 실제 실수령액 |
| SSP → Ad Exchange | 있음 | 10~20% | 다른 SSP가 받은 바닥값 |
| Ad Exchange → DSP | 있음 | 10~20% | 패찰 시 경쟁자 입찰가 |
| DSP → Advertiser | 있음 | 5~20% | 각 단계의 실제 수수료율 |
| DSP ↔ pCTR/pCVR (두 층 연결선) | 없음 | 0% | 없음 |

마지막 줄이 요점입니다. 두 층을 잇는 세로선만 어느 무대에서도 경계를 넘지 않습니다. 수수료 곱셈은 [DSP·SSP·Exchange](post.html?id=dsp-ssp-exchange)에 있습니다.

:::deep 화살표에 실려 가는 것 — OpenRTB Bid Request의 뼈대
경계를 넘는 화살표에는 정해진 서식의 JSON이 실립니다. `imp`(지면 크기·바닥값), `site`/`app`, `device`, `user`, `tmax`(제한시간)가 뼈대입니다. 여기 없는 값은 좋은 모델로도 쓸 수 없습니다.
:::

### 상자 여럿이 한 회사 안에 있을 때 [무대: 닫힌 생태계]

담장 안(네이버·카카오)에서는 매체·SSP·Exchange·DSP가 대부분 한 회사입니다. 위 표의 수수료 칸과 정보 단절 칸이 함께 사라집니다. 열린 RTB에서 어려운 건 가로 화살표(회사 사이)이고, 담장 안에서는 세로선(두 층 사이)이 거의 전부입니다. 비교는 [Walled Garden](post.html?id=walled-garden)에서 다룹니다.

---

## 마무리

1. **pCTR 모델은 광고 시스템의 심장** — True Value 계산의 핵심 입력이며, 정확도가 입찰가 → Win Rate → 비용 효율 → 광고주 ROI로 직결됩니다.

2. **모델링은 입찰의 시작일 뿐** — pCTR → True Value → Bid Shading → Budget Pacing까지 end-to-end 파이프라인을 이해해야 모델 개선의 방향을 잡을 수 있습니다.

3. **피드백 루프의 함정에 주의** — Selection Bias, Delayed Feedback, Censored Data는 모델 학습 데이터 자체를 오염시킵니다. 이 구조적 문제를 모르면 모델 정확도를 올려도 비즈니스 성과가 안 따라옵니다.

4. **캘리브레이션이 AUC보다 중요할 수 있다** — 입찰 시스템에서는 "얼마나 정확한 확률인가"(calibration)가 "순서를 잘 맞추는가"(AUC)보다 직접적으로 비용에 영향을 미칩니다.

5. **시장은 살아있다** — 경쟁 DSP의 전략 변화, 시즌 효과, SSP의 floor price 조정 등 외부 요인이 끊임없이 변합니다. 모델 재학습 주기와 모니터링이 필수입니다.

---

## 더 깊이 보기

- [살아있는 생태계 지도](ecosystem.html) — 눌러 보고 흐름 재생
- [ML 엔지니어 트랙](ml-track.html) — 두뇌 층 읽는 순서
- [DSP·SSP·Exchange](post.html?id=dsp-ssp-exchange)
- [30분 입문 가이드](post.html?id=adtech-30min-primer)
- [광고 서빙 플로우](post.html?id=ad-serving-flow)
- [Walled Garden](post.html?id=walled-garden)