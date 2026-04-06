# pCTR 모델러를 위한 광고 기술 생태계 전체 지도

pCTR 모델을 만드는 입장에서, "내 모델이 실제로 어디에서 어떻게 쓰이는가"를 이해하는 것은 모델 설계만큼 중요합니다. 이 글은 **광고주의 캠페인 등록부터 유저의 전환까지**, 전체 생태계를 pCTR 모델러의 시선으로 해부합니다.

> 각 단계에서 pCTR/pCVR 모델이 어떤 역할을 하는지, 그리고 모델 정확도가 비즈니스에 어떤 영향을 미치는지에 집중합니다.

---

## 1. 광고 생태계 전체 조감도

먼저 숲을 보겠습니다. 광고 생태계의 모든 주요 참여자와 데이터 흐름입니다:

```mermaid
graph TB
    subgraph Advertiser["광고주 (Advertiser)"]
        ADV["광고주<br/>KPI: ROAS, CPA, ROI"]
        CAMP["캠페인 설정<br/>예산 · 타겟 · 소재"]
        CREATIVE["광고 소재<br/>(배너, 동영상, 네이티브)"]
    end

    subgraph DSP_System["DSP (Demand-Side Platform)"]
        BIDDER["Bidder<br/>(실시간 입찰 엔진)"]

        subgraph ML_Models["ML 모델 스택"]
            PCTR["pCTR 모델<br/>클릭 확률 예측"]
            PCVR["pCVR 모델<br/>전환 확률 예측"]
            BUDGET["Budget Pacer<br/>예산 분배 최적화"]
        end

        subgraph Bid_Optimization["입찰 최적화"]
            TV["True Value 계산<br/>V = pCTR × pCVR × ConvValue"]
            SHADE["Bid Shading<br/>최적 입찰가 b*"]
        end

        TARGETING["타겟팅 엔진<br/>(Audience Matching)"]
        ADSELECT["광고 선택<br/>(Ad Ranking)"]
        FEAT["Feature Store<br/>(유저·지면·시간 피처)"]
    end

    subgraph DMP_CDP["데이터 플랫폼"]
        DMP["DMP<br/>3rd Party 데이터"]
        CDP["CDP<br/>1st Party 데이터"]
        SEGMENT["Audience Segment<br/>(유저 세그먼트)"]
    end

    subgraph Exchange["Ad Exchange (거래소)"]
        ADEX["Ad Exchange<br/>경매 운영"]
        AUCTION["Auction Engine<br/>(1st/2nd Price)"]
    end

    subgraph SSP_System["SSP (Supply-Side Platform)"]
        SSP["SSP<br/>매체 수익 최적화"]
        FLOOR["Floor Price 설정"]
        HB["Header Bidding<br/>(병렬 경매)"]
    end

    subgraph Publisher["매체 (Publisher)"]
        PUB["웹사이트 / 앱"]
        SLOT["광고 지면<br/>(Ad Slot)"]
    end

    subgraph User_Side["유저 (Consumer)"]
        USER["유저"]
        IMP["광고 노출<br/>(Impression)"]
        CLICK["클릭<br/>(Click)"]
        CONV["전환<br/>(Conversion)"]
    end

    ADV -->|캠페인 등록| CAMP
    CAMP --> CREATIVE
    CAMP -->|예산·타겟·KPI| DSP_System

    CDP --> SEGMENT
    DMP --> SEGMENT
    SEGMENT -->|유저 프로필| TARGETING

    USER -->|페이지 방문| PUB
    PUB -->|광고 요청| SSP
    SSP --> FLOOR
    SSP --> HB
    HB -->|Bid Request| ADEX
    ADEX -->|Bid Request 전달| BIDDER

    BIDDER --> FEAT
    FEAT --> PCTR
    FEAT --> PCVR
    PCTR --> TV
    PCVR --> TV
    TARGETING --> ADSELECT
    ADSELECT --> TV
    TV --> SHADE
    BUDGET --> SHADE
    SHADE -->|Bid Response| ADEX

    ADEX --> AUCTION
    AUCTION -->|낙찰 결과| SSP
    SSP -->|광고 전달| SLOT
    SLOT --> IMP
    IMP -->|유저 반응| CLICK
    CLICK --> CONV

    CONV -.->|전환 피드백| PCVR
    CLICK -.->|클릭 피드백| PCTR
    AUCTION -.->|Win/Lose 피드백| SHADE

    style PCTR fill:#ff6384,stroke:#ff6384,color:#fff
    style PCVR fill:#ff6384,stroke:#ff6384,color:#fff
    style SHADE fill:#36a2eb,stroke:#36a2eb,color:#fff
    style TV fill:#b026ff,stroke:#b026ff,color:#fff
    style ADEX fill:#36a2eb,stroke:#36a2eb,color:#fff
    style USER fill:#4bc0c0,stroke:#4bc0c0,color:#fff
    style ADV fill:#ff9f40,stroke:#ff9f40,color:#fff
    style BUDGET fill:#ffce56,stroke:#ffce56,color:#333
```

이 다이어그램에서 **빨간색(pCTR, pCVR)**이 pCTR 모델러의 영역입니다. 보라색(True Value)과 파란색(Bid Shading)은 모델 출력이 실제 입찰로 전환되는 지점입니다.

---

## 2. 한 번의 입찰이 일어나는 100ms

유저가 웹페이지를 열고 광고가 노출되기까지 약 100~200ms. 이 짧은 시간 안에 일어나는 모든 일을 시간순으로 봅니다:

```mermaid
sequenceDiagram
    participant U as 유저
    participant P as 매체 (Publisher)
    participant S as SSP
    participant E as Ad Exchange
    participant D as DSP Bidder
    participant ML as ML 모델 스택
    participant BS as Bid Shading

    U->>P: 1. 페이지 방문
    P->>S: 2. 광고 슬롯 요청 (user_id, page_url, slot_size)
    S->>E: 3. Bid Request (유저 정보 + 지면 정보 + floor price)
    E->>D: 4. Bid Request 전달 (~50ms 타임아웃)

    rect rgb(255, 99, 132, 0.1)
        Note over D,BS: DSP 내부 처리 (~10-30ms)
        D->>D: 5a. Feature 추출 (유저·지면·시간·디바이스)
        D->>D: 5b. 타겟팅 필터 (캠페인 조건 매칭)
        D->>ML: 5c. pCTR 예측 요청
        ML-->>D: pCTR = 0.032
        D->>ML: 5d. pCVR 예측 요청
        ML-->>D: pCVR = 0.15
        D->>D: 5e. True Value = pCTR × pCVR × ConvValue<br/>= 0.032 × 0.15 × $50 = $0.24
        D->>BS: 5f. Bid Shading: V=$0.24, 시장분포 → b*
        BS-->>D: b* = $0.17 (shading 29%)
        D->>D: 5g. Budget Pacing 체크 (예산 잔여량)
    end

    D->>E: 6. Bid Response (b* = $0.17)
    E->>E: 7. Auction (1st/2nd Price)
    E->>S: 8. 낙찰 결과 (Winner: DSP, Price: $0.17)
    S->>P: 9. 광고 소재 URL 전달
    P->>U: 10. 광고 노출 (Impression)

    opt 유저가 클릭한 경우
        U->>D: 11. Click Event → pCTR 학습 데이터
    end

    opt 유저가 전환한 경우
        U->>D: 12. Conversion Event → pCVR 학습 데이터 (지연 발생)
    end
```

### pCTR 모델러가 주목할 포인트

- **5c**: pCTR 추론이 **~1ms 이내**에 완료되어야 합니다. 모델 복잡도 vs 레이턴시 트레이드오프
- **5e**: pCTR의 작은 오차가 True Value에 증폭됩니다. pCTR이 0.032가 아니라 0.050이었다면 True Value는 $0.24 → $0.375로 56% 뛰고, 입찰가도 그만큼 올라갑니다
- **11-12**: 클릭 피드백은 수 초 내 도착하지만, 전환 피드백은 **수 시간~수 일 지연**(Delayed Feedback)될 수 있습니다. 이것이 pCVR 모델의 핵심 난관입니다

---

## 3. pCTR 모델이 비즈니스에 미치는 영향 경로

pCTR 모델의 정확도가 최종 광고주 ROI까지 어떤 경로로 영향을 미치는지 추적합니다:

```mermaid
graph LR
    subgraph Model["pCTR 모델"]
        CAL["모델 캘리브레이션<br/>(예측 vs 실제)"]
        DISC["판별력<br/>(AUC-ROC)"]
    end

    subgraph Impact["영향 경로"]
        TV2["True Value 정확도"]
        BID2["입찰가 정확도"]
        WR["Win Rate<br/>(낙찰률)"]
        COST["비용 효율<br/>(eCPX)"]
    end

    subgraph Business["비즈니스 결과"]
        ROI["광고주 ROI"]
        REV["DSP 수익"]
        BUDGET2["예산 소진 속도"]
    end

    CAL -->|과대추정| TV2
    CAL -->|과소추정| TV2
    DISC --> TV2
    TV2 --> BID2
    BID2 --> WR
    BID2 --> COST
    WR --> ROI
    COST --> ROI
    WR --> REV
    COST --> BUDGET2

    style CAL fill:#ff6384,stroke:#ff6384,color:#fff
    style DISC fill:#ff6384,stroke:#ff6384,color:#fff
    style ROI fill:#4bc0c0,stroke:#4bc0c0,color:#fff
    style REV fill:#ffce56,stroke:#ffce56,color:#333
```

| pCTR 상태 | True Value | 입찰 결과 | 비즈니스 영향 |
|-----------|-----------|---------|-------------|
| **과대추정** (pCTR > 실제 CTR) | V 과대 → 과다 입찰 | Win Rate ↑ but 비용 ↑↑ | ROI 하락, 예산 조기 소진 |
| **과소추정** (pCTR < 실제 CTR) | V 과소 → 과소 입찰 | Win Rate ↓↓ | 기회 손실, 노출 부족 |
| **정확** (pCTR ≈ 실제 CTR) | V 정확 → 최적 shading 가능 | Win Rate 적정 + 비용 효율 | **ROI 극대화** |
| **판별력 부족** (AUC 낮음) | 좋은 지면/나쁜 지면 구분 실패 | 나쁜 지면에 과다입찰 | 전환 없는 노출에 예산 낭비 |

---

## 4. 자동 입찰(Auto-Bidding) 파이프라인 상세

광고주가 "CPA $10 목표"라고 설정하면, DSP 내부에서 일어나는 자동 입찰 로직입니다:

```mermaid
graph TD
    subgraph Input["광고주 입력"]
        GOAL["캠페인 목표<br/>CPA = $10"]
        DAILY["일일 예산<br/>$1,000"]
        TARGET["타겟 조건<br/>(국가, 디바이스, 관심사)"]
    end

    subgraph AutoBid["자동 입찰 엔진"]
        subgraph Prediction["예측 단계"]
            P1["pCTR(x) = 0.032<br/>이 유저가 이 광고를 클릭할 확률"]
            P2["pCVR(x) = 0.15<br/>클릭 후 전환할 확률"]
            P3["pCTCVR = pCTR × pCVR<br/>= 0.0048"]
        end

        subgraph Valuation["가치 산정"]
            V1["방법 1: CPA 기반<br/>V = pCTCVR × Target CPA<br/>= 0.0048 × $10 = $0.048"]
            V2["방법 2: ROAS 기반<br/>V = pCTR × pCVR × AvgRevenue<br/>= 0.0048 × $50 = $0.24"]
        end

        subgraph Shading["입찰 최적화"]
            S1["시장 분포 추정<br/>F(b|x) ~ LogNormal"]
            S2["Surplus 최대화<br/>b* = argmax (V-b)·F(b|x)"]
            S3["Budget Pacing<br/>남은 예산 기반 입찰 조절"]
        end
    end

    subgraph Output["입찰 출력"]
        FINAL["최종 입찰가<br/>b* = $0.034<br/>(shading 29%)"]
    end

    GOAL --> V1
    GOAL --> V2
    DAILY --> S3
    TARGET --> P1
    P1 --> P3
    P2 --> P3
    P3 --> V1
    P3 --> V2
    V1 --> S2
    V2 --> S2
    S1 --> S2
    S2 --> S3
    S3 --> FINAL

    style P1 fill:#ff6384,stroke:#ff6384,color:#fff
    style P2 fill:#ff6384,stroke:#ff6384,color:#fff
    style P3 fill:#ff6384,stroke:#ff6384,color:#fff
    style S2 fill:#36a2eb,stroke:#36a2eb,color:#fff
    style FINAL fill:#4bc0c0,stroke:#4bc0c0,color:#fff
```

### 두 가지 가치 산정 방식

**CPA 기반** (전환 최적화 캠페인):
$$V = \underbrace{pCTR(x) \times pCVR(x)}_{\text{전환 확률 (pCTCVR)}} \times \underbrace{\text{Target CPA}}_{\text{광고주 설정 목표}}$$

**ROAS 기반** (수익 최적화 캠페인):
$$V = pCTR(x) \times pCVR(x) \times \underbrace{\text{Avg Revenue}}_{\text{평균 전환 매출}}$$

어떤 방식이든, **pCTR과 pCVR이 핵심 입력**입니다. 모델이 부정확하면 V가 부정확하고, V가 부정확하면 입찰가가 부정확합니다.

---

## 5. 데이터 피드백 루프: 모델이 학습하는 과정

광고 시스템은 **자기 강화 루프(feedback loop)**로 작동합니다. pCTR 모델의 예측이 데이터를 만들고, 그 데이터가 다시 모델을 학습시킵니다:

```mermaid
graph TD
    subgraph Training["오프라인 학습 (수 시간~수 일 주기)"]
        LOG["로그 데이터<br/>(impression, click, conversion)"]
        FE["Feature Engineering<br/>(유저·지면·시간·소재 피처)"]
        TRAIN["모델 학습<br/>(Logistic Reg, DeepFM, etc.)"]
        EVAL["오프라인 평가<br/>(AUC, Calibration, LogLoss)"]
        DEPLOY["모델 배포"]
    end

    subgraph Serving["온라인 서빙 (실시간, ~1ms)"]
        INFER["pCTR 추론<br/>x → p(click|x)"]
        BIDDING["입찰 & 낙찰"]
        EXPOSURE["광고 노출"]
    end

    subgraph Feedback["피드백 수집"]
        CLK["클릭 이벤트<br/>(수 초 내)"]
        CVR2["전환 이벤트<br/>(수 시간~수 일 지연)"]
        WINLOSE["Win/Lose 피드백<br/>(경매 결과)"]
    end

    subgraph Challenges["pCTR 모델러의 난관"]
        SSB["Selection Bias<br/>낙찰한 광고만 피드백 수집"]
        DF["Delayed Feedback<br/>전환 지연으로 라벨 누락"]
        DIST_SHIFT["Distribution Shift<br/>유저 행동 패턴 변화"]
        CENSOR["Censored Data<br/>패찰 시 시장가 미관측"]
    end

    LOG --> FE
    FE --> TRAIN
    TRAIN --> EVAL
    EVAL --> DEPLOY
    DEPLOY --> INFER
    INFER --> BIDDING
    BIDDING --> EXPOSURE
    EXPOSURE --> CLK
    EXPOSURE --> CVR2
    BIDDING --> WINLOSE
    CLK --> LOG
    CVR2 --> LOG
    WINLOSE --> LOG

    SSB -.->|편향된 학습 데이터| LOG
    DF -.->|불완전한 라벨| CVR2
    DIST_SHIFT -.->|모델 성능 저하| INFER
    CENSOR -.->|시장 분포 추정 어려움| WINLOSE

    style INFER fill:#ff6384,stroke:#ff6384,color:#fff
    style TRAIN fill:#ff6384,stroke:#ff6384,color:#fff
    style SSB fill:#ff9f40,stroke:#ff9f40,color:#fff
    style DF fill:#ff9f40,stroke:#ff9f40,color:#fff
    style DIST_SHIFT fill:#ff9f40,stroke:#ff9f40,color:#fff
    style CENSOR fill:#ff9f40,stroke:#ff9f40,color:#fff
```

### pCTR 모델러가 매일 싸우는 4가지 난관

| 난관 | 원인 | 영향 | 대응 |
|------|------|------|------|
| **Selection Bias** | 낙찰한 광고만 클릭/전환 데이터 수집 | 못 이긴 경매의 잠재 성과를 모름 | ESMM, Inverse Propensity Weighting |
| **Delayed Feedback** | 전환은 클릭 후 수 시간~수 일 후 발생 | 최신 데이터에 전환 라벨 누락 | Attribution Window, FSIW |
| **Distribution Shift** | 유저 행동, 시즌, 경쟁 환경 변화 | 어제의 모델이 오늘 부정확 | 온라인 학습, 주기적 재학습 |
| **Censored Data** | 패찰 시 경쟁자 가격 미관측 | 시장 분포 과소추정 → 과도한 shading | Censored Regression, Survival Analysis |

---

## 6. 유저 여정과 모델 터치포인트

마지막으로, **유저의 관점**에서 광고가 어떤 경로로 도달하는지, 그리고 각 단계에서 어떤 모델이 개입하는지 봅니다:

```mermaid
graph LR
    subgraph Journey["유저 여정 (Consumer Journey)"]
        U1["뉴스 앱 실행"]
        U2["기사 페이지 로딩"]
        U3["광고 노출<br/>(Impression)"]
        U4["광고 클릭"]
        U5["랜딩 페이지"]
        U6["장바구니 담기"]
        U7["결제 완료<br/>(Conversion)"]
    end

    subgraph Models["개입하는 모델"]
        M1["타겟팅 모델<br/>이 유저에게 광고를<br/>보여줄 것인가?"]
        M2["pCTR 모델<br/>클릭할 확률은?"]
        M3["Bid Shading<br/>얼마에 입찰할까?"]
        M4["pCVR 모델<br/>전환할 확률은?"]
        M5["어트리뷰션 모델<br/>이 전환은 어떤 광고 덕분?"]
    end

    U1 --> U2
    U2 --> U3
    U3 --> U4
    U4 --> U5
    U5 --> U6
    U6 --> U7

    U2 -.-> M1
    U2 -.-> M2
    U2 -.-> M3
    U4 -.-> M4
    U7 -.-> M5

    style M2 fill:#ff6384,stroke:#ff6384,color:#fff
    style M4 fill:#ff6384,stroke:#ff6384,color:#fff
    style M3 fill:#36a2eb,stroke:#36a2eb,color:#fff
    style M1 fill:#ffce56,stroke:#ffce56,color:#333
    style M5 fill:#b026ff,stroke:#b026ff,color:#fff
```

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

```
1. UCB1 / Thompson Sampling  →  "탐색 vs 활용" 직관 형성
2. LinUCB                    →  "Feature가 예측에 미치는 영향" 이해
3. RTB Auction               →  "경매 시장에서 입찰이 어떻게 작동하는가"
4. Bid Landscape             →  "pCTR이 입찰 전략에 미치는 영향"
5. Bid Shading               →  "1st Price에서의 최적화 + Censored Data"
```

1-2에서 알고리즘의 기초를 잡고, 3에서 시장 역학을 이해한 후, 4-5에서 **pCTR 모델의 정확도가 비즈니스 성과를 좌우한다**는 핵심 교훈에 도달하는 구조입니다.

---

## 마무리

1. **pCTR 모델은 광고 시스템의 심장** — True Value 계산의 핵심 입력이며, 정확도가 입찰가 → Win Rate → 비용 효율 → 광고주 ROI로 직결됩니다.

2. **모델링은 입찰의 시작일 뿐** — pCTR → True Value → Bid Shading → Budget Pacing까지 end-to-end 파이프라인을 이해해야 모델 개선의 방향을 잡을 수 있습니다.

3. **피드백 루프의 함정에 주의** — Selection Bias, Delayed Feedback, Censored Data는 모델 학습 데이터 자체를 오염시킵니다. 이 구조적 문제를 모르면 모델 정확도를 올려도 비즈니스 성과가 안 따라옵니다.

4. **캘리브레이션이 AUC보다 중요할 수 있다** — 입찰 시스템에서는 "얼마나 정확한 확률인가"(calibration)가 "순서를 잘 맞추는가"(AUC)보다 직접적으로 비용에 영향을 미칩니다.

5. **시장은 살아있다** — 경쟁 DSP의 전략 변화, 시즌 효과, SSP의 floor price 조정 등 외부 요인이 끊임없이 변합니다. 모델 재학습 주기와 모니터링이 필수입니다.
