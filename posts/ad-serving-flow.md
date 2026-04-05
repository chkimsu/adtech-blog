# Ad Serving Flow: 광고가 유저에게 도달하는 전체 과정

광고주가 캠페인을 집행하고, 유저가 광고를 보기까지의 전체 흐름을 도식화합니다.

---

## 1. 전체 파이프라인 (End-to-End)

```mermaid
graph TD
  subgraph Demand["Demand Side (광고주)"]
    ADV[Advertiser<br/>광고주]
    DSP[DSP<br/>Demand-Side Platform]
    DMP[DMP<br/>Data Management Platform]
  end

  subgraph Market["Marketplace (거래소)"]
    ADEX[Ad Exchange<br/>광고 거래소]
  end

  subgraph Supply["Supply Side (매체)"]
    SSP[SSP<br/>Supply-Side Platform]
    PUB[Publisher<br/>매체사]
  end

  USER[User<br/>유저]

  ADV -->|1. Campaign 등록| DSP
  DMP -->|Audience Data| DSP
  PUB -->|2. Ad Slot 요청| SSP
  SSP -->|3. Bid Request| ADEX
  ADEX -->|4. Bid Request 전달| DSP
  DSP -->|5. Bid Response| ADEX
  ADEX -->|6. Auction 낙찰| SSP
  SSP -->|7. Ad Creative 전달| PUB
  PUB -->|8. Ad 노출| USER
  USER -->|9. Click / Conversion| DSP

  style ADV fill:#ff6384,stroke:#ff6384,color:#fff
  style DSP fill:#ff6384,stroke:#ff6384,color:#fff
  style DMP fill:#ff9f40,stroke:#ff9f40,color:#fff
  style ADEX fill:#36a2eb,stroke:#36a2eb,color:#fff
  style SSP fill:#ffce56,stroke:#ffce56,color:#333
  style PUB fill:#ffce56,stroke:#ffce56,color:#333
  style USER fill:#4bc0c0,stroke:#4bc0c0,color:#fff
```

---

## 2. RTB Auction 상세 플로우

유저가 페이지를 로드하는 순간부터 광고가 노출되기까지 100~200ms 안에 벌어지는 일입니다.

```mermaid
sequenceDiagram
  participant U as User
  participant P as Publisher
  participant SSP as SSP
  participant AX as Ad Exchange
  participant DSP1 as DSP A
  participant DSP2 as DSP B

  U->>P: 페이지 로드
  P->>SSP: Ad Slot 비어있음
  SSP->>AX: Bid Request (유저 정보 + 지면 정보)
  
  par Bid Request 동시 전송
    AX->>DSP1: Bid Request
    AX->>DSP2: Bid Request
  end

  DSP1->>DSP1: pCTR 예측 + 입찰가 계산
  DSP2->>DSP2: pCTR 예측 + 입찰가 계산

  DSP1->>AX: Bid Response ($3.50)
  DSP2->>AX: Bid Response ($2.80)

  AX->>AX: Auction (Second Price)
  Note over AX: 낙찰: DSP A<br/>지불액: $2.81

  AX->>SSP: Win Notice + Ad Creative
  SSP->>P: Ad Creative
  P->>U: 광고 노출
  U-->>DSP1: Impression Tracking
```

---

## 3. 주요 구성요소

### DSP (Demand-Side Platform)

광고주 측의 플랫폼. 여러 Ad Exchange에 동시에 입찰하여 최적의 지면을 확보합니다.

핵심 기능:
- Audience Targeting (DMP 연동)
- pCTR/pCVR 예측 모델
- Bid Optimization (입찰가 최적화)
- MAB Algorithm (탐색/활용 밸런싱)

### SSP (Supply-Side Platform)

매체사 측의 플랫폼. 광고 지면의 수익을 극대화합니다.

핵심 기능:
- Floor Price 설정
- Header Bidding 지원
- Ad Quality 필터링

### Ad Exchange

DSP와 SSP를 연결하는 거래소. 실시간 경매를 수행합니다.

경매 방식:
- First Price Auction: 입찰가 그대로 지불
- Second Price Auction: 2등 입찰가 + $0.01 지불
- Bid Shading: First Price 환경에서 낙찰가를 낮추는 전략

### DMP (Data Management Platform)

유저 데이터를 수집/분석하여 Audience Segment를 생성합니다.

```mermaid
graph LR
  subgraph Data Sources
    FP[1st Party Data<br/>자사 데이터]
    TP[3rd Party Data<br/>외부 데이터]
  end

  subgraph DMP Process
    COL[Data Collection]
    SEG[Segmentation]
    ACT[Activation]
  end

  FP --> COL
  TP --> COL
  COL --> SEG
  SEG --> ACT
  ACT -->|Audience Segment| DSP_OUT[DSP에 전달]

  style FP fill:#4bc0c0,stroke:#4bc0c0,color:#fff
  style TP fill:#ff9f40,stroke:#ff9f40,color:#fff
  style DSP_OUT fill:#ff6384,stroke:#ff6384,color:#fff
```

---

## 4. MAB가 개입하는 지점

DSP 내부에서 "어떤 광고를 입찰할 것인가"를 결정하는 Ad Selection 단계에 MAB 알고리즘이 적용됩니다.

```mermaid
graph TD
  REQ[Bid Request 수신] --> FIL[Campaign Filtering<br/>예산/타겟팅 필터]
  FIL --> CAND[후보 광고 N개]
  CAND --> MAB{MAB Algorithm}
  MAB -->|Exploitation| PRED[pCTR 예측 점수]
  MAB -->|Exploration| UNC[불확실성 보너스]
  PRED --> SCORE[최종 점수 = pCTR + Exploration Bonus]
  UNC --> SCORE
  SCORE --> RANK[Top-K 광고 선택]
  RANK --> BID[입찰가 계산 + Bid Response]

  style REQ fill:#36a2eb,stroke:#36a2eb,color:#fff
  style MAB fill:#b026ff,stroke:#b026ff,color:#fff
  style SCORE fill:#4bc0c0,stroke:#4bc0c0,color:#fff
  style BID fill:#ff6384,stroke:#ff6384,color:#fff
```

이 흐름에서 MAB 알고리즘의 선택지:
- Context-Free (e-Greedy, Basic TS): 유저 정보 없이 광고의 평균 CTR만으로 선택
- Contextual (LinUCB, Linear TS): 유저 Context Vector를 활용하여 개인화된 선택
