네, 지금까지 우리가 논의했던 **Standard Thompson Sampling(일반 TS)**과 **Linear Thompson Sampling(Linear TS)**의 차이를 기술 블로그나 사내 위키에 바로 올릴 수 있도록 깔끔한 Markdown 문서로 정리해 드립니다.

---

# Exploration Strategy: Standard TS vs. Linear TS

이 문서는 AdTech 및 추천 시스템(RecSys)에서 탐색(Exploration)과 활용(Exploitation)의 균형을 맞추기 위해 사용되는 두 가지 핵심 알고리즘, **Standard Thompson Sampling**과 **Linear Thompson Sampling**의 차이점을 정의하고 비교합니다.

## 1. 핵심 요약 (Executive Summary)

| 구분 | Standard Thompson Sampling (Vanilla) | Linear Thompson Sampling (Contextual) |
| --- | --- | --- |
| **핵심 철학** | **"각자도생" (Independence)** | **"응용과 추론" (Generalization)** |
| **학습 대상** | 개별 광고 ID (Arm)의 성공 확률 | **Feature(특징)의 가중치 ()** |
| **확률 분포** | **Beta Distribution** (이진 결과) | **Gaussian Distribution** (실수 가중치) |
| **신규 광고** | 대응 불가 (Cold Start 문제 발생) | **즉시 대응** (Feature 기반 추론) |
| **주요 용도** | 단순 A/B 테스트, 고정된 배너 최적화 | **검색 광고, 개인화 추천, 동적 후보군** |

---

## 2. 상세 비교

### 2.1 Standard Thompson Sampling (일반 TS)

> **"기억력이 없는 슬롯머신 플레이어"**

각 광고(Arm)를 **서로 완전히 다른 독립적인 존재**로 취급합니다. 광고 A가 잘된다고 해서, 비슷하게 생긴 광고 B도 잘될 것이라고 추론하지 못합니다.

* **작동 원리:**
* 각 광고 에 대해 성공()과 실패() 횟수를 기록합니다.
* 각 광고의 CTR을 **Beta 분포** $Beta(\alpha_i, \beta_i)$로 모델링합니다.
* 매 요청마다 각 분포에서 랜덤한 값(Sample)을 뽑아 가장 높은 광고를 노출합니다.


* **치명적 단점 (AdTech 관점):**
* **Cold Start:** 데이터가 0인 신규 광고는 $Beta(1,1)$에서 시작하므로, 운 좋게 노출되기 전까지 성능을 증명할 수 없습니다.
* **확장성 부족:** 광고 후보가 수만 개로 늘어나거나 매번 바뀌는 환경(Dynamic Candidates)에서는 모든 광고의 Beta 분포를 관리할 수 없습니다.



### 2.2 Linear Thompson Sampling (Linear TS)

> **"레시피를 학습한 셰프"**

광고 ID가 아니라 **광고가 가진 속성(Feature)**을 학습합니다. "나이키가 잘 팔린다"는 법칙(Weight)을 배우면, 새로운 나이키 신발이 들어와도 즉시 점수를 높게 줍니다.

* **작동 원리:**
* 유저와 광고의 특징을 **Context Vector ()**로 정의합니다.
* 각 특징이 보상(클릭)에 기여하는 가중치()를 **Multivariate Gaussian Distribution(다변량 정규분포)**로 모델링합니다.
* 평균(): 학습된 가중치 (Exploitation)
* 분산(): 해당 특징에 대한 불확실성 (Exploration)


* 매 요청마다 가중치 분포에서 샘플()을 뽑아 점수()를 계산합니다.


* **압도적 장점 (AdTech 관점):**
* **Generalization (일반화):** 신규 광고가 등록되어도, 기존에 학습된 Feature 가중치(예: '나이키' 가중치 +5점)를 그대로 **공유**받아 즉시 합리적인 추론이 가능합니다.



---

## 3. 시나리오 예시: "신상 운동화 런칭"

상황: 유저가 **"러닝화"**를 검색했습니다. 기존 베스트셀러 A와 오늘 막 등록된 신상품 B가 있습니다.

#### A. 광고 후보

1. **광고 A (나이키 페가수스):** 노출 1,000회 / 클릭 50회 (데이터 풍부)
2. **광고 B (나이키 베이퍼플라이 - 신상):** 노출 0회 / 클릭 0회 (데이터 없음)

#### B. 알고리즘별 반응

| 알고리즘 | 광고 A 처리 | 광고 B 처리 | 결과 |
| --- | --- | --- | --- |
| **Standard TS** |  분포 형성. <br>

<br>→ **평균 5% 근처**에서 샘플링됨. |  분포 형성 (완전 랜덤). <br>

<br>→ 0~100% 사이 아무 값이나 나옴. | 광고 A가 압도적으로 유리함. **광고 B는 운에 맡겨야 함.** |
| **Linear TS** | Feature: `[나이키, 러닝화]` <br>

<br>→ 이미 학습된 가중치(`나이키` High, `러닝화` High) 적용. <br>

<br>→ **높은 점수** 예상. | Feature: `[나이키, 러닝화, 신상]` <br>

<br>→ **A와 동일한 가중치(나이키, 러닝화)를 공유**받음. <br>

<br>→ **즉시 높은 점수** 획득 가능. | **광고 B도 A만큼 좋은 광고라고 바로 인식**하고 경쟁에 참여함. |

---

## 4. 결론 (Takeaway)

* **Standard TS**는 **ID 기반의 통계적 접근**이며, 광고나 유저가 고정된 소규모 환경(Static Environment)에 적합합니다.
* **Linear TS**는 **Feature 기반의 머신러닝적 접근**이며, 신규 광고가 쏟아지고 개인화가 필요한 대규모 동적 환경(Dynamic Environment)에 필수적입니다.
* **현업 적용:** 우리가 구축하려는 검색 광고 시스템은 유저의 Query와 신규 광고 유입이 빈번하므로, **Linear TS (혹은 LinUCB)** 방식을 채택하여 **Feature 가중치에 대한 분포(Gaussian)**를 학습해야 합니다.

---

### 🚀 Next Step

이 문서를 바탕으로 팀 내에 공유하거나, 다음 단계로 **"Linear TS의 Python 구현체와 성능 시뮬레이션"**을 진행할 수 있습니다. 필요시 말씀해 주세요.