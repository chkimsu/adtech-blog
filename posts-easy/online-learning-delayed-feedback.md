어제 AUC 0.82 였던 pCTR 모델이 오늘은 0.78 입니다. pCTR 은 광고가 한 번 노출됐을 때 클릭될 확률을 모델이 예측한 값입니다. AUC 는 클릭이 난 노출에 클릭이 나지 않은 노출보다 높은 pCTR 을 주었는지를 세는 지표라 1 에 가까울수록 좋습니다. 코드와 피처(모델이 예측에 쓰는 입력값)와 인프라는 하나도 바뀌지 않았는데 성능이 떨어졌으니 **시장이 변했습니다.** 유저의 관심사가 바뀌고 경쟁 DSP(광고주를 대신해 노출마다 입찰하는 플랫폼)가 전략을 바꾸며 새 광고주가 들어오고 시즌 효과도 나타납니다. 광고 ML 모델은 이렇게 계속 변하는 시장의 데이터로 학습하고 예측하므로 태생적으로 빠르게 낡습니다.

이 글은 질문 세 가지를 차례로 다룹니다. 모델이 왜 낡는지는 **Concept Drift** 로, 모델을 어떻게 최신 상태로 유지하는지는 **Online Learning** 으로, 늦게 오는 전환이 학습을 어떻게 방해하는지는 **Delayed Feedback** 으로 설명합니다. Concept Drift 는 세상이 변해 데이터의 분포가 바뀌면서 모델이 낡는 현상입니다. Online Learning 은 새 데이터가 들어올 때마다 모델을 조금씩 고쳐 최신 상태를 유지합니다. Delayed Feedback 은 학습에 정답으로 쓰는 라벨이 늦게 도착하는 문제를 가리킵니다. 이 글의 라벨은 클릭 한 건이 전환(구매나 가입처럼 광고주가 바라는 행동)으로 이어졌으면 1, 이어지지 않았으면 0 으로 적은 값입니다.

> 지연 전환이 학습 라벨을 어떻게 오염시키는지는 [pCVR 모델링 포스트](post.html?id=pcvr-modeling)에서 다뤘습니다. pCVR 은 클릭이 전환으로 이어질 확률을 모델이 예측한 값입니다. 이 글은 같은 문제를 Online Learning 파이프라인 전체라는 더 넓은 맥락에서 봅니다.

> **골라 읽는 법** — 절이 10개인 긴 글이라 처음부터 끝까지 읽지 않고 필요한 절만 골라 읽어도 됩니다.
>
> - 모델이 낡는 원인과 최신 상태를 유지하는 두 방식 → 1~2절
> - 늦게 오는 전환이 만드는 문제와 보정 기법 → 3~4절
> - 운영 아키텍처와 모델 감시 → 5~6절
> - 전환이 들어오는 길이 다른 두 무대의 비교 → 7~8절

---
## 1. 광고 모델이 빠르게 낡는 원인과 Concept Drift 세 가지

**광고 데이터의 분포는 끊임없이 변하는데(Concept Drift) 변화의 모양에 따라 처방이 다릅니다. 갑자기 바뀌는 Sudden Drift 는 즉시 재학습이 필요하고 서서히 쌓이는 Gradual Drift 는 정기 재학습으로 따라가지만 요일과 시간대처럼 되풀이되는 Recurring Drift 는 재학습 없이 시간 피처로 흡수합니다.**

광고 데이터의 분포가 끊임없이 변하는 현상을 **Concept Drift** 라고 부릅니다. 이름은 어렵지만 어제까지 맞던 답이 오늘은 틀린 답이 된다는 단순한 뜻입니다. 도입부의 pCTR 모델처럼 코드를 하나도 바꾸지 않았는데 성능이 떨어져도 모델은 자기가 낡았다는 사실을 스스로 알지 못합니다. 그래서 성능이 떨어지는 데서 끝나지 않고 **떨어진 줄도 모른 채 자신 있게 계속 틀립니다.**

변화의 모양이 다르면 대응법도 완전히 달라지므로 모델이 낡았을 때는 데이터가 변했다는 사실보다 **어떻게 변했는지**를 먼저 따집니다. 하루아침에 절벽처럼 떨어지는 변화라면 모델을 새 데이터로 곧바로 다시 학습시키는 즉시 재학습이 필요합니다. 몇 주에 걸쳐 서서히 미끄러지는 변화라면 정해진 주기마다 다시 학습하는 정기 재학습으로 충분합니다. 매주 같은 모양으로 되돌아오는 변화는 재학습 대신 **피처를 하나 추가해서** 풉니다. 재학습은 비용이 큽니다. 변화에 맞지 않는 엉뚱한 처방은 돈만 쓰고 문제를 그대로 남기므로 Drift 를 아래 세 갈래로 나눠 처방을 고릅니다.

아래 카드 3장에는 Drift 마다 원인, 예시, 영향, 대응 속도를 적었습니다. Sudden Drift 의 예시인 iOS ATT(앱 추적 동의)는 앱이 광고 식별자를 읽기 전에 사용자에게 동의를 물어야 한다는 규칙이라 동의하지 않은 기기에서는 iOS 광고 식별자 IDFA 를 읽을 수 없습니다. Gradual Drift 의 영향 칸에 적힌 Calibration(보정)은 예측 확률이 실제로 일어나는 비율과 맞는 정도입니다. Recurring Drift 의 예시에 나오는 CTR 은 노출 가운데 클릭이 난 비율입니다.

<div class="chart-cards">
  <div class="chart-card">
    <div class="chart-card-header">
      <div class="chart-card-icon orange">!</div>
      <div>
        <div class="chart-card-name">Sudden Drift</div>
        <div class="chart-card-subtitle">갑작스러운 분포 변화.</div>
      </div>
    </div>
    <div class="chart-card-body">
      <div class="chart-card-row">
        <span class="chart-card-row-label">원인</span>
        <span class="chart-card-row-value">정책 변화, 경쟁사 전략 전환.</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">예시</span>
        <span class="chart-card-row-value">iOS ATT 도입 &rarr; IDFA 차단.</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">영향</span>
        <span class="chart-card-row-value">AUC 급락, 입찰 전략 무력화.</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">대응 속도</span>
        <span class="chart-card-row-value">즉시 재학습 필요.</span>
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
        <div class="chart-card-subtitle">서서히 누적되는 변화.</div>
      </div>
    </div>
    <div class="chart-card-body">
      <div class="chart-card-row">
        <span class="chart-card-row-label">원인</span>
        <span class="chart-card-row-value">유저 관심사 변화, 시즌 효과.</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">예시</span>
        <span class="chart-card-row-value">여름 &rarr; 가을: 패션 트렌드 전환.</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">영향</span>
        <span class="chart-card-row-value">Calibration 서서히 틀어짐.</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">대응 속도</span>
        <span class="chart-card-row-value">일 1회 재학습으로 대응 가능.</span>
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
        <div class="chart-card-subtitle">주기적으로 반복되는 패턴.</div>
      </div>
    </div>
    <div class="chart-card-body">
      <div class="chart-card-row">
        <span class="chart-card-row-label">원인</span>
        <span class="chart-card-row-value">요일/시간 패턴, 공휴일, 급여일.</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">예시</span>
        <span class="chart-card-row-value">금요일 저녁 CTR >> 월요일 아침 CTR.</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">영향</span>
        <span class="chart-card-row-value">시간대별 예측 편향.</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">대응 속도</span>
        <span class="chart-card-row-value">시간 피처로 학습 가능 (재학습 불필요).</span>
      </div>
    </div>
    <div class="chart-card-tags">
      <span class="chart-card-tag">요일 패턴</span>
      <span class="chart-card-tag">시간대 패턴</span>
    </div>
  </div>
</div>

### 실전 예시: 월요일 아침과 금요일 저녁의 CTR

아래 기록은 같은 유저가 같은 광고를 월요일 오전 9시 출근길과 금요일 저녁 8시 퇴근 뒤에 볼 때의 행동, 평균 CTR, 전환율을 나란히 적었습니다.

```text
월요일 오전 9시 (출근길, 모바일)
  - 유저 행동: 뉴스 빠르게 보기, 짧은 체류
  - 평균 CTR: 1.8%
  - 전환율: 낮음 (구매 여유 없음)

금요일 저녁 8시 (퇴근 후, 모바일/데스크톱)
  - 유저 행동: 쇼핑 탐색, 긴 체류
  - 평균 CTR: 3.2%
  - 전환율: 높음 (주말 구매 준비)

→ 같은 유저, 같은 광고인데 CTR이 78% 차이
→ 월요일 데이터로 학습한 모델이 금요일에 과소추정
```

기록에서 평균 CTR 은 월요일 오전의 1.8% 에서 금요일 저녁의 3.2% 로 78% 높아지지만 모델이 나빠져서 생긴 차이가 아닙니다. 월요일 아침의 사람들은 뉴스를 빠르게 보고 지나가지만 금요일 저녁에는 쇼핑을 둘러보며 장바구니를 들여다봅니다. 사람들의 하루가 원래 이렇게 생겼으므로 같은 유저와 같은 광고라도 요일과 시간대에 따라 CTR 이 달라집니다. 기록의 마지막 줄처럼 월요일 데이터로 학습한 모델은 금요일 CTR 을 과소추정(실제보다 낮게 예측)합니다.

CTR 차이가 사람들의 하루 모양에서 오므로 이 변화는 재학습으로 풀 문제가 아닙니다. **모델에게 지금이 몇 요일 몇 시인지를 알려 주면 모델이 그 차이를 스스로 배웁니다.** 요일과 시간대를 피처로 넣으면 Recurring Drift 는 모델을 틀리게 하는 문제에서 예측에 쓰는 재료로 바뀝니다. 2절의 실험이 요일 피처가 만드는 차이를 숫자로 보여 줍니다. 그 실험의 학습기(관측이 들어올 때마다 예측을 고쳐 나가는 작은 모델) 가운데 요일 피처가 없는 4개는 주말을 세 번 겪고도 주말마다 처음부터 다시 배웠습니다. 요일 피처를 넣은 학습기만 주말이 시작된 직후부터 참값(가상 데이터에 정해 둔 실제 CTR)을 따라갔습니다.

세 갈래의 처방을 모으면 Recurring Drift 는 **피처로** 흡수하고 Gradual Drift 는 **정기 재학습**으로 따라가며 **즉시 재학습**이 필요한 Drift 는 Sudden Drift 하나뿐입니다. 다만 즉시 재학습은 말처럼 간단하지 않습니다. 다음 절부터는 「얼마나 자주 다시 배울 것인가」라는 질문 하나가 이 글 전체의 주제로 커지는 과정을 따라갑니다.

---

## 2. Batch Retraining 과 Online Learning

**모델을 최신 상태로 유지하는 방법에는 정해진 주기마다 전체 데이터로 다시 학습하는 Batch Retraining 과 새 데이터가 올 때마다 조금씩 고치는 Online Learning 이 있습니다. 대부분의 프로덕션 DSP 는 두 방식을 섞어서 기본 모델(Base Model)은 하루 한 번 다시 학습하는 반면 출력을 고치는 보정층은 수 분마다 갱신합니다. 4주치 가상 관측으로 실험하면 학습 속도(학습률)나 기억하는 기간(윈도우)만 바꾼 학습기 4개는 주말을 세 번 겪고도 주말 CTR 을 기억하지 못했지만 요일 피처를 가진 학습기는 참 CTR 이 바뀐 직후에도 예측 오차가 0.165%p 로 작았습니다.**

1절에서 Sudden Drift 에는 즉시 재학습이 필요하다고 했는데, 모델을 새 데이터에 맞춰 최신 상태로 유지하는 방법은 크게 아래 두 가지입니다. Batch Retraining 은 정해진 주기마다 전체 데이터로 모델을 처음부터 다시 학습하는 방식입니다. Online Learning 은 새 데이터가 올 때마다 모델 파라미터(학습으로 정해지는 모델 안의 값)를 조금씩 고쳐 나갑니다.

<div class="chart-cards">
  <div class="chart-card">
    <div class="chart-card-header">
      <div class="chart-card-icon yellow">B</div>
      <div>
        <div class="chart-card-name">Batch Retraining</div>
        <div class="chart-card-subtitle">주기적 전체 재학습.</div>
      </div>
    </div>
    <div class="chart-card-body">
      <div class="chart-card-row">
        <span class="chart-card-row-label">방식</span>
        <span class="chart-card-row-value">전체 데이터로 모델 처음부터 학습.</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">주기</span>
        <span class="chart-card-row-value">수 시간 ~ 1일.</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">장점</span>
        <span class="chart-card-row-value">안정적, 재현 가능, 검증 용이.</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">단점</span>
        <span class="chart-card-row-value">학습 지연, 급변에 느림.</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">적합</span>
        <span class="chart-card-row-value">Gradual Drift, 안정적 환경.</span>
      </div>
    </div>
  </div>
  <div class="chart-card" style="grid-column: span 2;">
    <div class="chart-card-header">
      <div class="chart-card-icon green">O</div>
      <div>
        <div class="chart-card-name">Online Learning</div>
        <div class="chart-card-subtitle">실시간 점진 업데이트.</div>
      </div>
    </div>
    <div class="chart-card-body">
      <div class="chart-card-row">
        <span class="chart-card-row-label">방식</span>
        <span class="chart-card-row-value">새 데이터가 올 때마다 모델 파라미터 점진 업데이트.</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">주기</span>
        <span class="chart-card-row-value">수 초 ~ 수 분 (이벤트 단위).</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">장점</span>
        <span class="chart-card-row-value">빠른 적응, Sudden Drift 대응, 최신 트렌드 반영.</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">단점</span>
        <span class="chart-card-row-value">노이즈 민감, Catastrophic Forgetting, 디버깅 어려움.</span>
      </div>
      <div class="chart-card-row">
        <span class="chart-card-row-label">적합</span>
        <span class="chart-card-row-value">Sudden Drift, 빠르게 변하는 환경.</span>
      </div>
    </div>
  </div>
</div>

두 카드의 적합 칸을 보면 Batch Retraining 은 1절의 Gradual Drift 에, Online Learning 은 Sudden Drift 에 맞습니다. Batch Retraining 은 수 시간에서 하루 주기로 돌며 안정적이고 재현과 검증이 쉽지만 학습이 늦고 급변에 느립니다. Online Learning 은 수 초에서 수 분 단위로 이벤트마다 갱신하며 빠르게 적응하고 최신 트렌드를 반영하지만 노이즈에 민감하고 디버깅이 어렵습니다. Online Learning 의 단점 칸에 적힌 Catastrophic Forgetting 은 새 데이터로 모델을 계속 고치다가 예전에 배운 패턴을 잃어버리는 현상으로, 이 절 끝에서 학습기 5개로 직접 만들어 봅니다.

### 프로덕션에서 주로 쓰는 구조: Batch 와 Online Calibration 하이브리드

대부분의 프로덕션 DSP 는 두 방식 가운데 하나를 고르지 않고 둘 다 씁니다. 아래 표처럼 전체 패턴을 배우는 Base Model(기본 모델)은 하루 한 번 Batch 로 모델 전체 파라미터를 다시 학습합니다. Online Calibration 은 Base Model 이 낸 확률을 최근 데이터에 맞게 고치는 Calibration Layer(보정층)만 수 분에서 수 시간마다 갱신해 최근에 생긴 편향(예측이 한쪽으로 치우친 정도)을 보정합니다.

| 계층 | 역할 | 주기 | 변경 대상 |
|------|------|------|---------|
| **Base Model** (Batch) | 전체 패턴 학습 | 일 1회 | 모델 전체 파라미터 |
| **Online Calibration** | 최신 편향 보정 | 수 분 ~ 수 시간 | Calibration Layer만 |

아래 의사코드(그대로 실행되지 않고 구조만 보여 주는 코드)는 하이브리드가 도는 차례를 세 단계로 보여 줍니다. 1단계에서는 최근 30일 전체 데이터로 Base Model 을 하루 한 번 새로 학습합니다. 2단계에서는 최근 1시간의 예측과 실제 CTR 로 Platt Scaling 보정기를 수 분마다 갱신합니다. Platt Scaling 은 모델이 낸 확률을 $a$, $b$ 두 값이 들어간 시그모이드 식으로 다시 계산해 실제 비율에 맞추는 보정 기법입니다. 3단계의 serve 함수는 서빙(실제 광고 요청에 예측값을 돌려주는 일) 때 Base Model 의 예측을 보정기에 통과시켜 돌려줍니다. 코드의 DeepFM 같은 클래스 이름은 예시입니다.

```python
# (의사코드 — 그대로 실행되지 않습니다.)
# 하는 일: 하루 한 번 다시 학습하는 Base Model 에 수 분마다 갱신하는 Online Calibration 을 더하는 하이브리드 구조만 간략히 보여 주며, DeepFM 같은 클래스 이름은 예시다.

# 1단계: Base Model 을 하루 한 번 Batch 로 다시 학습한다
# Spark 와 GPU 로 최근 30일 전체 데이터를 학습한다.
base_pctr = DeepFM.train(
    data=last_30days_logs,    # 최근 30일 전체 데이터
    features=all_features,
    epochs=3
)

# 2단계: 수 분마다 Online Calibration 을 갱신한다
# 가벼운 작업이다. Base Model 의 출력을 Platt Scaling 으로 보정한다.
calibrator = PlattScaling()
calibrator.update(
    predictions=base_pctr.predict(recent_1hour),
    actuals=recent_1hour.labels    # 최근 1시간 실제 CTR
)

# 3단계: 서빙할 때 Base Model 예측을 보정해 돌려주는 함수를 만든다
# 서빙은 Base Model 과 Calibration 을 차례로 지난다.
def serve(x):
    raw_pctr = base_pctr.predict(x)      # Base Model 예측
    calibrated = calibrator.transform(raw_pctr)  # 보정
    return calibrated
```

**Calibration Layer 만 Online 으로 갱신하는 까닭**

- Base Model 전체를 Online 으로 계속 고치면 예전에 배운 패턴을 잃는 Catastrophic Forgetting 위험이 생깁니다.
- Calibration Layer 는 파라미터가 $a$, $b$ 2개뿐이라 이 두 값만 고치면 Base Model 은 그대로 둔 채 안전하게 최근에 생긴 편향을 보정합니다.
- 보정 식은 $p_{\text{calibrated}} = \sigma(a \cdot \log(p_{\text{raw}}) + b)$ 입니다. 식의 $p_{\text{raw}}$ 는 Base Model 이 낸 확률입니다. σ 는 어떤 값이든 0 과 1 사이의 값으로 바꾸는 시그모이드 함수라서 식 전체는 $p_{\text{raw}}$ 의 로그에 $a$ 를 곱하고 $b$ 를 더한 값을 다시 확률로 바꿉니다.

보정이 왜 이런 식으로 맞춰지는지는 [Calibration 포스트](post.html?id=calibration)에서 따로 다룹니다. 이 글에서는 여러 층 가운데 이 보정층만 빠르게 움직이게 두는 까닭만 봅니다.

### 학습률과 윈도우를 바꾼 학습기 5개의 예측 오차

앞에서 정의한 **Catastrophic Forgetting** 은 말로만 들으면 추상적이라 1절의 값으로 직접 만들어 봅니다. 평일 CTR 은 1.8%, 주말 CTR 은 3.2% 로 두고 4주 동안 1시간마다 노출 2천 건의 관측이 들어오면 학습기가 그 관측을 보고 예측을 갱신합니다.

나란히 돌리는 학습기는 5개입니다. 첫 두 개는 EMA(지수 이동평균)로, 새 관측과 지금 예측의 차이에 학습률을 곱한 만큼 예측을 옮깁니다. 학습률은 관측 하나가 예측을 얼마나 움직일지 정하는 값이라 클수록 최근 데이터를 세게 반영합니다. 여기서는 느린 0.02 와 빠른 0.30 을 비교합니다. 다음 두 개는 최근 N시간의 관측만 평균하고 그보다 오래된 관측은 버리는 윈도우 학습기라, 하나는 최근 24시간만 보고 다른 하나는 168시간(7일)을 봅니다. 마지막 학습기는 평일용 EMA 와 주말용 EMA 를 따로 두어 요일을 피처로 가진 학습기 역할을 합니다. 앞의 학습기 4개에는 요일이라는 개념이 아예 없습니다.

코드는 참 CTR 이 평일과 주말 사이에서 바뀐 직후 6시간을 급변 구간으로 따로 모읍니다. 학습기마다 그 시간의 관측으로 갱신하기 전에 먼저 예측하게 해서 진짜 예측 오차, 곧 예측과 참 CTR 의 차이를 측정하고 %p(퍼센트포인트, 두 백분율을 뺀 차이) 단위로 찍습니다. 오차는 작을수록 좋습니다.

```python
# 하는 일: 평일 CTR 1.8%, 주말 CTR 3.2% 인 4주치 관측을 1시간마다 학습기 다섯 개에 넣어, 급변 직후와 안정 구간의 예측 오차, 4주차 주말 진입 직후의 예측을 비교한다.
import random

# 1단계: 4주치 시간과 평일, 주말의 참 CTR 을 둔다
# 가상 데이터다. 1스텝은 1시간이고, 한 시간마다 노출 2천 건의 관측이 들어온다.
random.seed(42)

HOURS = 4 * 7 * 24        # 4주치, 1스텝 = 1시간
IMPS_PER_HOUR = 2_000     # 한 시간에 노출 2천 건
CTR_WEEKDAY = 0.018       # 가상 데이터: 평일 CTR 1.8%
CTR_WEEKEND = 0.032       # 가상 데이터: 주말 CTR 3.2%


# 2단계: 표 칸을 맞추는 함수와 요일, 참 CTR 을 구하는 함수를 만든다
def pad(s, w):
    """한글은 두 칸을 차지한다고 보고 표 폭을 맞춘다."""
    width = sum(2 if ord(c) > 0x2000 else 1 for c in s)
    return s + " " * max(0, w - width)


def is_weekend(hour):
    """0=월 … 5=토, 6=일. 토, 일이면 True."""
    return (hour // 24) % 7 >= 5


def true_ctr(hour):
    return CTR_WEEKEND if is_weekend(hour) else CTR_WEEKDAY


# 3단계: 학습기 세 종류를 클래스로 만든다
# 지수 이동평균, 최근 N시간 평균, 평일과 주말을 따로 두는 지수 이동평균이다. 앞의 둘에는 '요일'이라는 개념이 아예 없다.
class Ema:
    """지수 이동평균. lr이 크면 최근 데이터를 세게 반영한다."""
    def __init__(self, lr):
        self.lr, self.p = lr, 0.02      # 초기 예측 2%
    def predict(self, hour):
        return self.p
    def update(self, hour, obs):
        self.p += self.lr * (obs - self.p)


class Window:
    """최근 N시간 관측만 평균. 그보다 오래된 건 전부 잊는다."""
    def __init__(self, size):
        self.size, self.buf = size, []
    def predict(self, hour):
        return sum(self.buf) / len(self.buf) if self.buf else 0.02
    def update(self, hour, obs):
        self.buf.append(obs)
        if len(self.buf) > self.size:
            self.buf.pop(0)             # 오래된 관측 버리기 = 망각


class WeekdayEma:
    """평일용, 주말용 EMA를 따로 둔다. 요일이 '피처'로 들어간 셈."""
    def __init__(self, lr):
        self.lr, self.p = lr, {True: 0.02, False: 0.02}
    def predict(self, hour):
        return self.p[is_weekend(hour)]
    def update(self, hour, obs):
        k = is_weekend(hour)
        self.p[k] += self.lr * (obs - self.p[k])


# 4단계: 학습기 다섯 개를 두고 급변 구간을 정한다
# 학습률이 느린 것과 빠른 것, 24시간과 168시간 윈도우, 요일을 피처로 가진 것이다.
models = {
    "EMA lr=0.02(느림)": Ema(0.02),
    "EMA lr=0.30(빠름)": Ema(0.30),
    "윈도우 24시간": Window(24),
    "윈도우 168시간": Window(168),
    "요일피처+EMA 0.30": WeekdayEma(0.30),
}

# 참 CTR이 바뀌는 시각들. 그 직후 6시간을 '급변 구간'으로 본다.
switches = [h for h in range(1, HOURS) if true_ctr(h) != true_ctr(h - 1)]
shock = {h + k for h in switches for k in range(6)}

err_all = {n: [] for n in models}
err_shock = {n: [] for n in models}
err_calm = {n: [] for n in models}
last_weekend_track = {n: [] for n in models}   # 4주차 주말 진입 6시간 예측값

# 5단계: 4주 동안 시간마다 관측을 만들며 예측 오차를 모은다
# 학습기마다 갱신하기 전에 먼저 예측해서, 진짜 예측 오차를 측정한다.
for hour in range(HOURS):
    p_true = true_ctr(hour)
    # 노출 2천 건을 확률대로 하나씩 뽑아 관측 CTR을 만든다 → 통계적 잡음 포함
    clicks = sum(1 for _ in range(IMPS_PER_HOUR) if random.random() < p_true)
    obs = clicks / IMPS_PER_HOUR
    for name, m in models.items():
        pred = m.predict(hour)          # 갱신 전에 예측 → 진짜 예측 오차
        e = abs(pred - p_true)
        err_all[name].append(e)
        (err_shock if hour in shock else err_calm)[name].append(e)
        if switches[-1] <= hour < switches[-1] + 6:   # 마지막 주말 진입 직후
            last_weekend_track[name].append(pred)
        m.update(hour, obs)

# 6단계: 학습기마다 전체, 급변 직후, 안정 구간의 오차를 찍는다
print(pad("학습기", 22) + "전체오차  급변직후  안정구간")
for n in models:
    a = sum(err_all[n]) / len(err_all[n]) * 100
    s = sum(err_shock[n]) / len(err_shock[n]) * 100
    c = sum(err_calm[n]) / len(err_calm[n]) * 100
    print(pad(n, 22) + f"{a:6.3f}%p {s:6.3f}%p {c:6.3f}%p")

# 7단계: 4주차 주말 진입 직후 6시간의 예측을 찍는다
print()
print("4주차 주말 진입 직후 6시간의 예측 CTR (참값 3.20%)")
for n in models:
    track = " ".join(f"{v*100:.2f}" for v in last_weekend_track[n])
    print("  " + pad(n, 22) + track)

# 출력:
# 6단계 뜻: 요일을 피처로 가진 학습기가 전체 0.107%p, 급변 직후 0.165%p 로 가장 작다. 요일 피처가 없는 넷은 급변 직후 오차가 0.675%p 에서 1.227%p 사이로 크고, 그중 윈도우 24시간이 1.227%p 로 가장 크다.
# 학습기                전체오차  급변직후  안정구간
# EMA lr=0.02(느림)      0.440%p  1.080%p  0.397%p
# EMA lr=0.30(빠름)      0.141%p  0.675%p  0.105%p
# 윈도우 24시간          0.220%p  1.227%p  0.153%p
# 윈도우 168시간         0.524%p  0.795%p  0.506%p
# 요일피처+EMA 0.30      0.107%p  0.165%p  0.104%p
# 7단계 뜻: 4주차 주말에 들어선 직후에도 요일 피처가 없는 넷은 참값 3.20% 에 한참 못 미치는 1.69 에서 2.21 사이에서 출발한다. 요일피처+EMA 0.30 은 3.03 에서 출발해 참값 근처에 머문다.
#
# 4주차 주말 진입 직후 6시간의 예측 CTR (참값 3.20%)
#   EMA lr=0.02(느림)     1.89 1.93 1.96 1.99 2.01 2.03
#   EMA lr=0.30(빠름)     1.69 2.24 2.63 2.88 2.87 3.00
#   윈도우 24시간         1.84 1.89 1.96 2.01 2.04 2.12
#   윈도우 168시간        2.21 2.21 2.21 2.21 2.21 2.21
#   요일피처+EMA 0.30     3.03 3.17 3.28 3.33 3.19 3.22
```

6단계 표는 학습기마다 4주 전체, 급변 직후, 안정 구간(급변 구간을 뺀 나머지 시간)의 평균 예측 오차를 보여 줍니다. 요일피처+EMA 0.30 이 전체 0.107%p, 급변 직후 0.165%p 로 가장 작습니다. 요일 피처가 없는 4개는 급변 직후 오차가 0.675%p 에서 1.227%p 사이로 큽니다. 안정 구간에서는 EMA lr=0.30 이 0.105%p 로 요일 학습기의 0.104%p 와 거의 같으므로 두 학습기의 차이는 거의 전부 참 CTR 이 바뀐 직후에서 나옵니다.

7단계 표는 이 글에서 가장 중요한 결과로, **4주째 주말**이 시작된 직후 6시간 동안 학습기마다 낸 예측 CTR 을 보여 줍니다. 학습기들은 이미 주말을 세 번 겪었는데도 요일 피처가 없는 4개는 참값 3.20% 에 한참 못 미치는 1.7~2.2% 에서 출발합니다. 이 4개는 지난 주말 세 번에서 배운 주말 CTR 을 하나도 기억하지 못했습니다.

급변 직후 오차는 윈도우 24시간이 1.227%p 로 가장 큽니다. 토요일이 시작되는 순간 이 학습기가 평균하는 버퍼(최근 관측을 담아 두는 목록) 24칸은 전부 평일 관측이라 예측도 평일 값이 되므로 **최근만 보면 그만큼 지난 일을 잊습니다.** 반대로 윈도우 168시간은 일주일치 평일과 주말 관측을 한꺼번에 평균해 늘 2.21% 를 냅니다. 2.21% 는 평일 1.8% 보다 높고 주말 3.2% 보다 낮아서 평일에도 주말에도 틀린 값입니다.

학습률이 빠른 EMA lr=0.30 은 주말 첫 시간에 1.69% 에서 출발해 6시간 만에 3.00% 까지 따라잡습니다. 하지만 그 6시간 동안은 계속 틀린 값으로 입찰하고 다음 주말이 오면 다시 처음부터 따라잡아야 합니다. 학습률을 올리면 적응 속도는 빨라지지만 지난 주말을 기억하게 되지는 않습니다.

요일 피처를 넣은 학습기는 평일용 예측과 주말용 예측을 따로 두므로 주말이 시작되면 지난 주말에 배운 값을 꺼내 씁니다. 그래서 이 학습기만 주말 첫 시간부터 3.03% 로 출발해 참값 근처에 머물고 급변 직후 오차도 0.165%p 로 학습률이 가장 빠른 EMA lr=0.30 의 0.675%p 와 비교하면 4분의 1 입니다. **되풀이되는 패턴은 학습률이 아니라 피처로 풉니다.** 요일 피처 하나로 주말 CTR 을 기억할 수 있으므로 1절에서 Recurring Drift 에는 재학습이 필요 없다고 했습니다. 모델 구조로 여러 목표를 함께 배우는 접근은 [Multi-Task Learning](post.html?id=multi-task-learning) 편으로 이어집니다.

---

## 3. Delayed Feedback: 늦게 도착하는 라벨

**클릭은 누르는 순간 기록되지만 전환은 수 시간에서 수 일 뒤에 오므로, 학습 시점에 아직 오지 않은 전환을 미전환으로 학습하면 모델이 전환율(CVR)을 실제보다 낮게 예측합니다. 참 CVR 이 3% 인 가상 클릭 30만 건으로 지금 학습하면 지연을 무시한 관측 CVR 은 1.89% 로 참값의 63% 에 머물지만 도착한 전환마다 그 시점까지 도착할 확률로 나눠 되돌리면 2.94% 까지 돌아옵니다.**

2절의 학습기들은 한 시간 동안의 클릭을 그 시간이 끝나자마자 관측으로 받았지만 전환을 예측하는 pCVR 모델의 정답은 그렇게 빨리 오지 않습니다. 클릭은 누르는 즉시 관측되는데 전환은 클릭 뒤 수 시간에서 수 일이 지나야 일어나므로 Online Learning 의 가장 큰 장애물은 정답이 늦게 오는 **Delayed Feedback** 입니다. 학습을 언제 돌리느냐에 따라 아직 도착하지 않은 전환을 「안 샀다」로 잘못 배우는 양이 정해집니다.

카드에서는 클릭 뒤 기다린 시간이 1시간, 6시간, 1일, 7일로 늘 때 잡히는 전환의 누적 비율과 오래 기다린 만큼 학습 데이터가 낡는다는 점을 보면 됩니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-training-cards.html?embed=1&card=delay" height="480" loading="lazy" title="전환은 며칠 뒤에 도착한다"></iframe>
<a class="demo-embed-open" href="demo-training-cards.html" target="_blank" rel="noopener">↗ 카드 여섯 장 전체로 열기</a>
</div>

아래 띠는 이 글에서 계속 쓰는 가상의 전환 지연 분포입니다. 전환의 35% 는 클릭 뒤 30분 안에 오고 6시간까지 누적 60%, 24시간까지 80%, 3일까지 92%, 7일까지 97% 가 도착하며 나머지 3% 는 7일이 지나서 옵니다. 범례는 라벨이 확정돼 학습에 안전하게 쓸 수 있는 구간과 아직 전환이 올 수 있어 라벨이 확정되지 않은 구간을 나눕니다.

<div class="chart-timeline">
  <div style="font-size:0.85rem; font-weight:700; color:var(--text-primary); margin-bottom:12px;">클릭 후 전환까지의 시간 분포 (가상 데이터).</div>
  <div class="chart-timeline-bar">
    <div class="chart-timeline-segment green" style="width:25%;">30분 이내<br/>35%</div>
    <div class="chart-timeline-segment cyan" style="width:20%;">30분-6시간<br/>25%</div>
    <div class="chart-timeline-segment blue" style="width:20%;">6-24시간<br/>20%</div>
    <div class="chart-timeline-segment orange" style="width:15%;">1-3일<br/>12%</div>
    <div class="chart-timeline-segment pink" style="width:10%;">3-7일<br/>5%</div>
    <div class="chart-timeline-segment" style="width:10%; background:rgba(176,38,255,0.5);">7일+<br/>3%</div>
  </div>
  <div class="chart-timeline-labels">
    <span>클릭 직후 0%.</span>
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
      <span>학습에 안전하게 사용 가능한 구간 (라벨 확정).</span>
    </div>
    <div class="chart-timeline-legend-item">
      <div class="chart-timeline-legend-dot" style="background:rgba(255,99,132,0.7);"></div>
      <span>라벨 미확정 구간 (Fake Negative 위험).</span>
    </div>
  </div>
</div>

### Fake Negative 문제

학습을 돌리는 시점에 아직 전환하지 않은 유저에게 미전환(negative, 라벨 0)을 붙이면 아래 표의 첫 줄 같은 일이 생깁니다. 표는 가상의 클릭 3건이 학습 시점에 어떤 라벨을 받는지 보여 줍니다.

| 시나리오 | 실제 | 학습 라벨 | 결과 |
|---------|------|---------|------|
| 클릭 후 10분, 아직 전환 안 함 | **전환 예정** (2시간 후 구매) | negative (0) | **Fake Negative** |
| 클릭 후 10분, 전환 안 할 유저 | 미전환 | negative (0) | 정상 |
| 클릭 후 3시간, 이미 전환 완료 | 전환 | positive (1) | 정상 |

첫 줄의 유저는 2시간 뒤에 살 예정인데 학습 시점이 클릭 뒤 10분이라 아직 전환이 없으므로 negative 로 학습됩니다. 이렇게 실제로는 전환할 클릭이 학습 시점에 negative 로 적힌 샘플을 **Fake Negative**(가짜 음성)라고 부릅니다. 둘째 줄은 정말 전환하지 않을 유저라 negative 가 맞습니다. 셋째 줄은 클릭 뒤 3시간이 지나 이미 전환했으므로 positive(라벨 1)가 맞습니다.

Fake Negative 가 많아지면 모델은 전환이 실제보다 덜 일어난다고 배워 전환율을 **과소추정**합니다. pCVR 이 낮아진 영향은 입찰까지 차례로 이어집니다.

- pCVR 이 내려가면 노출 한 번의 가치를 예측 확률로 계산한 True Value 가 내려가고 True Value 로 정하는 입찰가도 내려가서 입찰한 경매 가운데 이긴 비율인 Win Rate 까지 내려갑니다.
- 결국 실제로는 전환이 잘 일어나는 캠페인인데도 그 캠페인의 입찰을 포기하는 결과가 됩니다.

### 관측 CVR 이 낮아지는 정도: 숫자로 확인

과소추정이라는 말만으로는 밋밋해서 실제로 몇 %p 인지 세어 봐야 크기가 보입니다. 아래 코드는 CVR(클릭 가운데 전환이 난 비율)의 참값을 3% 로 정해 두고 위 띠의 지연 분포를 그대로 써서 가상 클릭 30만 건을 만듭니다. 코드는 지금 학습을 돌린다고 보고 클릭 30만 건을 지난 24시간 사이에 고르게 흩어 둡니다. 그러면 방금 누른 클릭은 아직 전환이 도착할 시간이 없었지만 20시간 전 클릭은 전환 대부분이 이미 도착했으므로, **클릭 뒤 지난 시간(경과 시간)에 따라 학습 시점에 보이는 관측 CVR 이 달라집니다.**

같은 코드에서 낮아진 값을 되돌리는 방법도 확인합니다. $F_d(t)$ 는 클릭 뒤 t 시간 안에 전환이 도착할 확률이라, 도착한 전환 하나하나를 그 클릭의 경과 시간에서의 $F_d(t)$ 로 나누면 원래 크기로 돌아옵니다. 도착할 확률이 작을수록 크게 키우므로 경과 시간이 30분인 클릭에서 이미 도착한 전환은 $F_d$ 35% 로 나눠 확률이 100% 에 가까운 시점의 전환보다 훨씬 크게 키웁니다.

```python
# 하는 일: 참 CVR 3% 인 클릭 30만 건을 지연 분포대로 시뮬레이션해, 지금 학습할 때 경과 시간대별로 보이는 관측 CVR 과 도착 확률로 나눠 되돌린 보정 CVR, 음성 가중치를 구한다.
import random

# 1단계: 지연 분포와 참 CVR, 클릭 수, 학습 시각을 둔다
# 지금 학습을 돌린다고 할 때, 클릭 30만 건은 지난 24시간 사이에 흩어져 있다.
random.seed(42)

# 앞 타임라인과 같은 가상 지연 분포 (구간 상한 시각, 그 구간 비율)
DELAY_BUCKETS = [(0.5, 0.35), (6.0, 0.25), (24.0, 0.20),
                 (72.0, 0.12), (168.0, 0.05), (720.0, 0.03)]
TRUE_CVR = 0.03
N_CLICKS = 300_000
TRAIN_AT = 24.0   # 학습을 도는 시각. 클릭은 지난 24시간 사이에 흩어져 있다.


# 2단계: 표 칸을 맞추는 함수, 도착 확률 F(t) 를 구하는 함수, 지연을 뽑는 함수를 만든다
def pad(s, w):
    """한글은 두 칸을 차지한다고 보고 표 폭을 맞춘다."""
    width = sum(2 if ord(c) > 0x2000 else 1 for c in s)
    return s + " " * max(0, w - width)


def delay_cdf(t):
    """클릭 후 t시간 안에 전환이 도착할 확률 F(t). 구간 안은 균등이라고 본다."""
    acc, lo = 0.0, 0.0
    for hi, share in DELAY_BUCKETS:
        if t >= hi:
            acc += share                         # 구간을 전부 지났다
        elif t > lo:
            acc += share * (t - lo) / (hi - lo)  # 구간 안에서 비례 배분
            return acc
        else:
            return acc
        lo = hi
    return acc


def draw_delay():
    r, acc, lo = random.random(), 0.0, 0.0
    for hi, share in DELAY_BUCKETS:
        acc += share
        if r <= acc:
            return random.uniform(lo, hi)
        lo = hi
    return lo


# 3단계: 클릭 30만 건이 언제 눌렸는지, 전환하는지, 얼마 뒤 전환하는지 뽑는다
clicks = []
for _ in range(N_CLICKS):
    elapsed = random.uniform(0.0, TRAIN_AT)      # 학습 시각까지 지난 시간
    delay = draw_delay() if random.random() < TRUE_CVR else None
    clicks.append((elapsed, delay))

# 4단계: 경과 시간대별로 관측 CVR 과 보정 CVR 을 구한다
# 각 전환을 '그 시점까지 도착할 확률' F(t) 로 나누면 원래 크기로 돌아온다. 확률이 작을수록 크게 키운다.
BINS = [(0, 1), (1, 3), (3, 6), (6, 12), (12, 24)]
print(pad("경과시간", 10) + pad("클릭수", 10) + pad("관측전환", 11)
      + pad("관측CVR", 10) + pad("F(t)", 8) + "보정CVR")
tot_naive = tot_fixed = 0.0
for lo, hi in BINS:
    grp = [c for c in clicks if lo <= c[0] < hi]
    # 학습 시점에 이미 도착한 전환만 positive로 보인다. 나머지는 Fake Negative.
    pos = [c for c in grp if c[1] is not None and c[1] <= c[0]]
    naive = len(pos) / len(grp)
    # 각 전환을 "그 시점까지 도착할 확률"로 나눠 되돌린다 (역수 가중)
    w_sum = sum(1.0 / delay_cdf(c[0]) for c in pos)
    tot_naive += len(pos)
    tot_fixed += w_sum
    print(pad(f"{lo}~{hi}h", 10) + pad(f"{len(grp):,}", 10)
          + pad(f"{len(pos):,}", 11) + pad(f"{naive*100:.2f}%", 10)
          + pad(f"{delay_cdf((lo+hi)/2)*100:.1f}%", 8)
          + f"{w_sum/len(grp)*100:.2f}%")

# 5단계: 전체 클릭의 관측 CVR 과 보정 CVR 을 참값과 비교한다
print()
print(f"전체 관측 CVR (지연 무시) {tot_naive/N_CLICKS*100:.2f}%")
print(f"전체 보정 CVR (역수 가중) {tot_fixed/N_CLICKS*100:.2f}%")
print(f"참 CVR                    {TRUE_CVR*100:.2f}%")
print(f"→ 지연을 무시하면 입찰가가 참값의 {tot_naive/N_CLICKS/TRUE_CVR*100:.0f}%로 주저앉는다")

# 6단계: 전환하지 않은 샘플의 음성 가중치를 본다
# FSIW 의 음성 가중치다.
print()
print(pad("경과시간", 10) + pad("F(t)", 9) + "음성 가중치")
for t in [0.5, 2, 6, 24, 168, 720]:
    f = delay_cdf(t)
    w_neg = (1 - TRUE_CVR * (1 - f)) / (1 - TRUE_CVR)
    print(pad(f"{t:.1f}h", 10) + pad(f"{f*100:.1f}%", 9) + f"{w_neg:.5f}")

# 출력:
# 4단계 뜻: 방금 누른 0~1h 클릭은 관측 CVR 이 0.72% 이고, 12~24h 클릭은 2.15% 다. 전환을 F(t) 로 나눠 되돌리면 구간마다 2.40% 에서 3.16% 사이가 된다.
# 경과시간  클릭수    관측전환   관측CVR   F(t)    보정CVR
# 0~1h      12,469    90         0.72%     35.0%   2.40%
# 1~3h      25,103    294        1.17%     41.8%   2.79%
# 3~6h      37,332    629        1.68%     53.2%   3.16%
# 6~12h     74,882    1,421      1.90%     63.3%   2.99%
# 12~24h    150,214   3,226      2.15%     73.3%   2.93%
# 5단계 뜻: 지연을 무시하면 전체 관측 CVR 은 1.89% 로 참 CVR 3.00% 의 63% 에 머물고, 역수 가중으로 2.94% 까지 되돌린다.
#
# 전체 관측 CVR (지연 무시) 1.89%
# 전체 보정 CVR (역수 가중) 2.94%
# 참 CVR                    3.00%
# → 지연을 무시하면 입찰가가 참값의 63%로 주저앉는다
# 6단계 뜻: 전환하지 않은 샘플의 음성 가중치는 F(t) 가 35.0% 에서 100.0% 로 커져도 1.01082 에서 1.03093 까지만 움직인다. 한 건씩 크게 고치지 않는다.
#
# 경과시간  F(t)     음성 가중치
# 0.5h      35.0%    1.01082
# 2.0h      41.8%    1.01293
# 6.0h      60.0%    1.01856
# 24.0h     80.0%    1.02474
# 168.0h    97.0%    1.03000
# 720.0h    100.0%   1.03093
```

4단계 표는 경과 시간 구간마다 클릭 수, 학습 시점까지 도착한 관측 전환 수, 관측 CVR, 구간 가운데 시각의 도착 확률 F(t), 전환을 도착 확률로 나눠 되돌린 보정 CVR 을 찍습니다. 참 CVR 은 모든 구간에서 3% 이므로 관측 CVR 과 보정 CVR 이 3% 에 가까울수록 정확합니다.

- **관측 CVR 은 기다린 시간이 길수록 높아집니다.** 방금 누른 0~1h 클릭은 전환 대부분이 아직 도착하지 않아 관측 CVR 이 0.72% 에 그치고 12~24h 클릭은 2.15% 입니다. 같은 캠페인의 같은 유저인데도 학습 시점까지 얼마나 기다렸느냐만으로 세 배 차이가 납니다.
- **구간을 모두 합친 전체 관측 CVR 은 1.89% 로 참 CVR 3% 의 63% 입니다.** 이 값을 입찰에 그대로 쓰면 입찰가도 참값으로 계산한 입찰가의 63% 로 깎이므로 이겨야 할 경매를 계속 집니다.
- **도착한 전환마다 도착 확률의 역수(1 을 그 확률로 나눈 값)를 곱하는 역수 가중으로 되돌리면 전체 2.94% 까지 돌아옵니다.** 정확히 3.00% 가 되지 않는 까닭은 경과 시간이 짧은 구간에 있습니다. 그 구간은 $F_d$ 가 작아 전환 하나를 나눌 때 값이 크게 튀고 그만큼 추정이 출렁이므로 0~1h 구간의 보정 CVR 은 2.40% 로 3% 에서 크게 벗어납니다. 이렇게 큰 가중치 때문에 추정이 흔들리는 현상을 **가중치 분산**이라고 부릅니다. 가중치 분산은 4절에서 다룰 FSIW(Feedback Shift Importance Weighting, 전환 지연으로 생긴 라벨 차이를 샘플 가중치로 보정하는 기법)의 알려진 약점입니다.

6단계 표의 음성 가중치는 아직 전환이 없는 샘플에 곱하는 FSIW 가중치입니다(식은 4절에 있습니다). 코드는 경과 시간을 0.5h 에서 720h 까지 늘려 F(t) 가 35.0% 에서 100.0% 로 커지는 동안의 음성 가중치를 찍는데, 값은 1.01082 에서 1.03093 까지, 반올림하면 1.01 에서 1.031 사이만 움직입니다. 참 CVR 이 3% 라 전환하지 않는 샘플이 97% 로 워낙 많아서 한 건씩 크게 고칠 필요가 없으므로 보정은 거의 전부 전환 샘플의 가중치에서 일어납니다.

---

## 4. Delayed Feedback 보정 기법

**늦게 오는 전환을 다루는 기법에는 전환이 확정될 때까지 기다리는 Attribution Window, 아직 안 온 전환을 가중치로 되돌리는 FSIW, 경과 시간을 넣어 전환 확률을 직접 모델링하는 Delay Model 이 있습니다. 6시간을 기다리면 전환의 59.7% 를 잡고 학습 데이터는 평균 9시간 전 것이지만 7일을 기다리면 97.2% 를 잡는 대신 데이터가 평균 252시간 전 것이 되어 정답인 대기 시간이 하나로 정해지지 않으므로, 프로덕션은 보통 짧은 윈도우와 FSIW 가중치로 자주 학습하고 7일 윈도우 데이터는 검증과 일일 재학습에만 씁니다.**

3절에서 보았듯이 아직 오지 않은 전환을 미전환으로 학습하면 관측 CVR 이 참값의 63% 까지 내려갑니다. 이 문제를 다루는 기법은 아래 그림의 세 가지입니다.

<div class="chart-arch">
  <div class="chart-arch-section">
    <div class="chart-arch-section-header">
      <span class="chart-arch-section-title orange">기법 1: Attribution Window (대기 전략)</span>
    </div>
    <div class="chart-arch-grid">
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">원리</div>
        <div class="chart-arch-node-desc">전환 확정까지 충분히 대기 후 학습. 예: 클릭 후 7일 대기.</div>
      </div>
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">장점</div>
        <div class="chart-arch-node-desc">라벨 정확도 높음, 구현 단순.</div>
      </div>
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">단점</div>
        <div class="chart-arch-node-desc">7일 지연 = 7일 동안 모델 낡음.</div>
      </div>
    </div>
  </div>
  <div class="chart-arch-connector">vs.</div>
  <div class="chart-arch-section">
    <div class="chart-arch-section-header">
      <span class="chart-arch-section-title blue">기법 2: Importance Weighting (FSIW)</span>
    </div>
    <div class="chart-arch-grid">
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">원리</div>
        <div class="chart-arch-node-desc">Fake Negative 확률을 추정하여 가중치 보정.</div>
      </div>
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">장점</div>
        <div class="chart-arch-node-desc">최신 데이터 즉시 사용 가능.</div>
      </div>
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">단점</div>
        <div class="chart-arch-node-desc">지연 분포 모델링 필요, 가중치 분산 큼.</div>
      </div>
    </div>
  </div>
  <div class="chart-arch-connector">vs.</div>
  <div class="chart-arch-section">
    <div class="chart-arch-section-header">
      <span class="chart-arch-section-title purple">기법 3: Delay Model (지연 분포 모델링)</span>
    </div>
    <div class="chart-arch-grid">
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">원리</div>
        <div class="chart-arch-node-desc">P(conversion | click, elapsed_time)을 직접 모델링.</div>
      </div>
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">장점</div>
        <div class="chart-arch-node-desc">경과 시간을 피처로 활용, 정교한 보정.</div>
      </div>
      <div class="chart-arch-node">
        <div class="chart-arch-node-name">단점</div>
        <div class="chart-arch-node-desc">모델 복잡도 증가, 학습 데이터 구성 어려움.</div>
      </div>
    </div>
  </div>
</div>

그림의 세 기법을 차례로 풀면 다음과 같습니다.

- **Attribution Window**(대기 전략)는 클릭 뒤 일정 기간, 그림의 예로는 7일을 기다려 전환이 확정된 뒤에 학습합니다. 라벨이 정확하고 구현이 단순하지만 7일을 기다리는 동안 모델이 7일만큼 낡습니다.
- **Importance Weighting**(중요도 가중)은 샘플마다 가중치를 곱해 관측된 데이터를 실제 분포에 맞추는 방법입니다. FSIW 는 Fake Negative 일 확률을 추정해 이 가중치를 정합니다. 기다리지 않고 최신 데이터를 바로 쓸 수 있는 대신 지연 분포를 모델링해야 하고 가중치 분산이 큽니다.
- **Delay Model**(지연 분포 모델링)은 클릭과 경과 시간이 주어졌을 때의 전환 확률 P(conversion | click, elapsed_time) 을 직접 모델링합니다. 경과 시간을 피처로 써서 정교하게 보정하지만 모델이 복잡해지고 학습 데이터를 구성하기 어렵습니다.

### 기법별 Trade-off 비교

아래 표는 세 기법을 학습 지연, 라벨 정확도, 구현 복잡도, Drift 대응력, 적합한 경우로 비교합니다. Attribution Window 는 라벨 정확도가 매우 높고 구현 복잡도는 매우 낮지만 7일 넘게 기다리므로 Drift 대응력이 매우 낮습니다. FSIW 와 Delay Model 은 학습 지연이 수 시간으로 짧고 Drift 대응력이 높습니다. 라벨 정확도는 FSIW 가 가중치에 기대므로 중간이고 Delay Model 은 높지만 구현은 Delay Model 이 세 기법 가운데 가장 복잡하고 FSIW 는 중간입니다. 표는 Attribution Window 를 전환 지연이 짧은 캠페인에, FSIW 를 범용으로, Delay Model 을 보험이나 부동산처럼 전환 지연이 긴 캠페인에 맞는 기법으로 적었습니다.

| | Attribution Window | FSIW | Delay Model |
|---|---|---|---|
| **학습 지연** | 7일+ (긴 대기) | 수 시간 (빠름) | 수 시간 (빠름) |
| **라벨 정확도** | 매우 높음 | 중간 (가중치 의존) | 높음 |
| **구현 복잡도** | 매우 낮음 | 중간 | 높음 |
| **Drift 대응력** | 매우 낮음 | 높음 | 높음 |
| **적합한 경우** | 전환 지연이 짧은 캠페인 | 범용 | 전환 지연이 긴 캠페인 (보험, 부동산) |

### 대기 시간의 선택: 하나로 정해지지 않는 최적점

아래는 Attribution Window 의 길이를 고를 때 실무자가 실제로 하는 계산입니다. 오래 기다릴수록 늦게 온 전환까지 잡혀 라벨은 정확해지지만 그동안 모델은 낡으므로, 라벨이 틀려서 생기는 손실과 모델이 낡아서 생기는 손실이 서로 반대 방향으로 움직입니다. 그래서 누구에게나 맞는 정답 대기 시간은 없고 두 손실 가운데 무엇을 더 아프게 여기느냐에 따라 답이 달라집니다.

결정은 숫자로 보면 쉬워집니다. 아래 코드는 가상 클릭 20만 건을 같은 지연 분포로 만들고 전환을 1시간, 6시간, 1일, 7일 기다릴 때를 한 표에 찍습니다. 표의 잡힌 전환은 기다리는 동안 도착한 전환을 전체 전환으로 나눈 비율이라 높을수록 라벨이 정확합니다. 관측 CVR 은 지연을 무시할 때 보이는 CVR 입니다. 데이터 나이는 학습이 대기 시간 W 만큼 뒤처져 돌 때 학습에 쓰는 데이터가 평균 몇 시간 전 것인지를 뜻해 낮을수록 신선합니다. 코드는 데이터 나이를 1.5W 시간으로 두므로 6시간 대기면 6 × 1.5 인 9시간, 7일(168시간) 대기면 168 × 1.5 인 252시간입니다. 1시간 대기는 1.5시간이 반올림돼 표에 2h 로 찍힙니다.

```python
# 하는 일: 클릭 20만 건을 지연 분포대로 시뮬레이션해, 전환을 1시간, 6시간, 1일, 7일 기다릴 때 잡히는 전환 비율과 학습 데이터 나이를 비교한다.
import random

# 1단계: 전환 지연 분포와 참 CVR, 클릭 수를 둔다
# 가상 데이터다. 행마다 (구간 상한 시각, 그 구간에 들어올 전환 비율)이고, 본문 타임라인과 같은 값이다.
random.seed(42)

DELAY_BUCKETS = [
    (0.5, 0.35),    # 30분 안에 35%
    (6.0, 0.25),    # 30분~6시간에 25%
    (24.0, 0.20),   # 6~24시간에 20%
    (72.0, 0.12),   # 1~3일에 12%
    (168.0, 0.05),  # 3~7일에 5%
    (720.0, 0.03),  # 7일 이후에 3% (30일까지 꼬리)
]
TRUE_CVR = 0.03      # 참 전환율 3%
N_CLICKS = 200_000


# 2단계: 표 칸을 맞추는 함수와 전환 지연을 뽑는 함수를 만든다
def pad(s, w):
    """한글은 두 칸을 차지한다고 보고 표 폭을 맞춘다."""
    width = sum(2 if ord(c) > 0x2000 else 1 for c in s)
    return s + " " * max(0, w - width)


def draw_delay():
    """전환 1건이 클릭 후 몇 시간 뒤에 들어오는지 뽑는다."""
    r = random.random()          # 0~1 균등 난수
    acc, lo = 0.0, 0.0           # acc=누적 비율, lo=이 구간의 하한 시각
    for hi, share in DELAY_BUCKETS:
        acc += share
        if r <= acc:
            return random.uniform(lo, hi)   # 구간 안은 균등하게 흩어진다고 본다
        lo = hi
    return lo


# 3단계: 클릭 20만 건을 만들고 전환 수를 센다
# 전환하면 지연 시간을, 안 하면 None 을 둔다.
clicks = [draw_delay() if random.random() < TRUE_CVR else None
          for _ in range(N_CLICKS)]
n_conv = sum(1 for d in clicks if d is not None)

# 4단계: 기다리는 시간을 바꿔 가며 잡히는 전환 비율, 관측 CVR, 데이터 나이를 측정한다
# (a) 잡히는 전환 비율은 기다리는 동안 도착한 전환을 전체 전환으로 나눈 값이다. (b) 데이터 나이는 학습이 W시간 뒤처져 돌 때 쓰는 데이터가 평균 몇 시간 전 것인지로, 1.5W 시간이다.
print(pad("대기", 8) + pad("잡힌전환", 11) + pad("관측CVR", 10)
      + pad("데이터나이", 12) + "한 줄 평")
for label, wait_h in [("1시간", 1), ("6시간", 6), ("1일", 24), ("7일", 168)]:
    caught = sum(1 for d in clicks if d is not None and d <= wait_h)
    catch_rate = caught / n_conv                # (a)
    observed_cvr = caught / N_CLICKS            # 지연 무시하면 보이는 CVR
    data_age = wait_h * 1.5                     # (b)
    note = "신선한데 라벨이 없다" if wait_h <= 6 else "라벨은 맞는데 낡았다"
    print(pad(label, 8) + pad(f"{catch_rate*100:.1f}%", 11)
          + pad(f"{observed_cvr*100:.2f}%", 10)
          + pad(f"{data_age:.0f}h", 12) + note)

# 5단계: 참 CVR 과 한 줄 결론을 찍는다
print()
print(f"참 CVR {TRUE_CVR*100:.2f}%  (전환 {n_conv:,}건 / 클릭 {N_CLICKS:,}건)")
print("최적점은 하나가 아니다. 대기를 늘리면 라벨은 맞아지고 모델은 낡는다.")

# 출력:
# 4단계 뜻: 대기를 1시간에서 7일로 늘리면 잡히는 전환이 38.3% 에서 97.2% 로 오르지만, 데이터 나이도 2h 에서 252h 로 늘어난다.
# 대기    잡힌전환   관측CVR   데이터나이  한 줄 평
# 1시간   38.3%      1.13%     2h          신선한데 라벨이 없다
# 6시간   59.7%      1.77%     9h          신선한데 라벨이 없다
# 1일     80.7%      2.39%     36h         라벨은 맞는데 낡았다
# 7일     97.2%      2.87%     252h        라벨은 맞는데 낡았다
# 5단계 뜻: 클릭 200,000건 가운데 전환이 5,913건 나왔고, 정해 둔 참 CVR 은 3.00% 다.
#
# 참 CVR 3.00%  (전환 5,913건 / 클릭 200,000건)
# 최적점은 하나가 아니다. 대기를 늘리면 라벨은 맞아지고 모델은 낡는다.
```

4단계 표를 위에서 아래로 읽으면 잡힌 전환 열은 좋아지고 데이터 나이 열은 나빠져 두 열이 반대 방향으로 움직입니다. 5단계 줄을 보면 클릭 200,000건 가운데 전환은 5,913건이고 참 CVR 은 정해 둔 대로 3.00% 입니다.

- **6시간만 기다리면 전환의 59.7% 만 잡힙니다.** 나머지 40% 는 학습 시점에 아직 오지 않아 Fake Negative 가 되는 대신 데이터는 평균 9시간밖에 묵지 않았습니다.
- **7일을 기다리면 97.2% 를 잡아 라벨은 거의 정확합니다.** 하지만 학습에 들어가는 데이터는 평균 252시간, 열흘 넘게 묵은 데이터입니다.
- 그 252시간 사이에 시장이 한 번이라도 급변하면(1절의 Sudden Drift) 모델은 정확한 라벨로 낡은 세상을 배웁니다.

**Fake Negative 도 낡은 데이터도 손실이라 프로덕션은 보통 두 윈도우를 나눠 씁니다.** 짧은 윈도우(1~6시간)로 자주 학습하면서 아직 안 들어온 전환은 FSIW 가중치로 되돌립니다. 긴 윈도우(7일)로 만든 데이터셋은 검증과 일일 재학습(하루 한 번 하는 재학습)에만 씁니다. 윈도우를 어디서 자를지는 전환을 어느 광고의 성과로 볼지 정하는 기여도 배분 규칙과도 얽혀 있어 [어트리뷰션 기초](post.html?id=attribution-basics) 편에서 따로 다룹니다.

### FSIW 가중치 수식

> 아래에는 가중치가 무슨 뜻인지만 적었습니다. 지연을 지수분포로 근사해 가중치를 유도하는 과정은 이 절 끝의 「더 깊이」 블록에 있습니다. 지연 전환이 라벨을 오염시키는 문제 자체는 [pCVR 모델링 포스트](post.html?id=pcvr-modeling)에서 다룹니다.

FSIW 는 관측 시점에 미전환으로 보이는 샘플 가운데 일부가 **아직 전환이 오지 않은 Fake Negative** 라는 데서 출발해 Fake Negative 가 섞인 비율을 추정하고 그만큼 학습 가중치를 고칩니다. 가중치 식은 이미 전환이 온 Positive 샘플과 아직 전환이 없는 Negative 샘플에 따로 있습니다.

- **이미 전환이 온 Positive 샘플**에는 1 을 $F_d(\Delta t)$ 로 나눈 가중치를 줍니다. $F_d(\Delta t)$ 는 클릭 뒤 관측 시점까지 지난 시간 $\Delta t$ 안에 전환이 도착할 확률이라, 도착할 확률이 낮은 시점에 온 전환일수록 큰 가중치를 받습니다.

$$w_i^{(+)} = \frac{1}{F_d(t - t_{\text{click}})}$$

- **아직 전환이 없는 Negative 샘플**은 경과 시간이 길수록 정말 전환하지 않을 진짜 Negative 일 확률이 높으므로 가중치를 높입니다.

$$w_i^{(-)} = \frac{1 - p_{\text{cvr}} \cdot (1 - F_d(t - t_{\text{click}}))}{1 - p_{\text{cvr}}}$$

두 식에서 $t - t_{\text{click}}$ 은 클릭 뒤 지난 시간을, $p_{\text{cvr}}$ 은 전환 확률 추정값을 가리킵니다. $F_d(\cdot)$ 는 전환 지연 시간의 CDF(누적 분포 함수, 지연이 주어진 시간 이하일 확률)라서 3절에서 쓴 도착 확률 $F_d(t)$ 와 같은 함수입니다. 시간이 충분히 지나 $F_d \to 1$ 이 되면 Positive 가중치는 1 을 1 로 나눈 값이라 1 에 수렴합니다. Negative 가중치는 분자 안의 $1 - F_d$ 가 0 이 되어 분자가 1 이 되므로 $1/(1 - p_{\text{cvr}})$ 에서 멈춥니다. 3절 코드는 $p_{\text{cvr}}$ 자리에 참 CVR 3% 를 넣었으므로 6단계에서 720h 의 음성 가중치로 찍힌 1.03093, 반올림해 1.031 이 이 값입니다. 1.031 은 사실상 1 이라 충분히 오래 기다린 샘플은 보정 없이 그대로 써도 안전합니다.

:::deep 더 깊이 — 지연을 지수분포로 근사할 때 쉬워지는 계산과 잃는 것

앞의 두 코드는 지연 분포를 구간별 비율의 표로 들고 다녔지만 실무에서는 이 표를 **지수분포** 하나로 근사하는 경우가 많습니다. 아래에서는 지수분포로 근사하면 계산이 왜 쉬워지는지와 그 대가로 무엇을 잃는지를 차례로 계산합니다.

지연 시간 $D$ 가 파라미터 $\lambda$ 인 지수분포를 따른다고 가정하면 CDF 는 아래 한 줄로 쓸 수 있습니다.

$$F_d(t) = 1 - e^{-\lambda t}$$

이 CDF 에는 파라미터가 $\lambda$ 하나뿐이라 평균 지연 $\mathbb{E}[D] = 1/\lambda$ 만 알면 모든 $t$ 에서 $F_d(t)$ 가 정해집니다. 두 코드의 표는 구간 6개마다 비율을 하나씩 두어 값 6개를 관리해야 했지만 지수분포는 숫자 하나면 되므로, 지연 분포를 캠페인마다, 광고주마다 따로 추정해야 하는 상황에서는 이 차이가 큽니다.

FSIW 가중치도 닫힌 식(값을 바로 계산할 수 있는 식 하나)으로 나옵니다. Positive 가중치 식에 위 CDF 를 넣으면 아래와 같습니다.

$$w^{(+)}(t) = \frac{1}{1 - e^{-\lambda t}}$$

이 식에서 바로 읽히는 사실은 두 가지입니다. 첫째, $t \to 0$ 이면 $w^{(+)} \to \infty$ 라서 방금 누른 클릭에서 도착한 전환은 한없이 큰 가중치를 받으므로 실무에서는 가중치에 반드시 상한을 둡니다(clipping). 짧은 경과 시간에서 이 가중치가 커지므로 3절 코드의 0~1시간 구간도 보정 CVR 이 2.40% 로 출렁였습니다. 둘째, $\lambda t$ 가 3 을 넘으면 $F_d > 0.95$ 라서 가중치가 1.05 근처까지 내려오므로 평균 지연의 세 배만 기다리면 보정이 거의 필요 없습니다.

$\lambda$ 추정도 간단해서 이미 도착한 전환들의 지연 시간 평균을 쓰면 되지만 여기에 함정이 하나 있습니다. 관측된 전환은 이미 도착한 전환만 모인 표본이라 지연이 짧은 전환 위주로 치우쳐 있으므로, 이 표본을 그대로 평균 내면 평균 지연을 짧게 잡아 $\lambda$ 를 과대추정합니다. 전환이 실제보다 빨리 온다고 잘못 믿는 결과입니다. 그래서 우도(관측한 데이터가 나올 확률을 파라미터의 함수로 본 값)를 쓸 때 **아직 오지 않은 전환은 절단(censoring)으로 처리**합니다. 클릭 뒤 $t_i$ 가 지났는데 아직 전환이 없는 건은 「$D > t_i$ 였다」는 정보로만 씁니다.

$$\log L = \sum_{i \in \text{도착}} \log \left( \lambda e^{-\lambda d_i} \right) + \sum_{j \in \text{미도착}} \log \left( e^{-\lambda t_j} \right)$$

식의 첫째 합은 도착한 전환마다 지연이 $d_i$ 일 확률 밀도의 로그를 더하고 둘째 합은 아직 도착하지 않은 건마다 지연이 $t_j$ 보다 길 확률의 로그를 더합니다. 이 절단 처리는 경매에서 졌을 때 낙찰가를 알 수 없는 패찰 가격 문제와 수학적으로 같은 모양입니다. 패찰 가격 문제는 [Bid Shading](post.html?id=bid-shading-censored) 글에서 다룹니다. 패찰 가격 문제는 얼마에 졌는지를 모르고 지연 전환은 언제 전환할지를 모르지만 둘 다 관측이 한쪽에서 잘려 있다는 같은 문제입니다.

대신 잃는 것도 분명합니다. 지수분포는 **무기억성**을 가정하는데, 무기억성은 6시간을 기다린 클릭이 앞으로 더 기다려야 할 시간의 분포가 방금 누른 클릭의 분포와 같다는 성질입니다. 실제 전환에는 30분 안에 35% 가 몰리는 급한 봉우리와 3~7일에 걸쳐 늘어지는 꼬리가 따로 있어서 이 가정이 맞지 않으므로 지수분포 하나로는 이런 이봉 구조를 담지 못합니다. 그래서 정교하게 근사할 때는 지수분포 두세 개를 섞거나(mixture) 와이불(Weibull) 분포처럼 위험률(아직 전환하지 않은 클릭이 바로 다음 순간 전환할 비율)이 시간에 따라 변하는 분포를 씁니다.
:::

---

## 5. 프로덕션 Online Learning 아키텍처

**재학습, 보정, 늦게 오는 전환을 메우는 지연 보상은 세 가지 가운데 하나를 고르는 기법이 아니라 층층이 쌓아 함께 쓰는 기법입니다. 층마다 고치는 대상과 감당할 수 있는 속도가 달라서 빠른 층이 느린 층의 실수를 임시로 덮고 느린 층이 근본을 나중에 바로잡습니다.**

2절부터 4절까지 재학습, 보정, 지연 보상(늦게 오는 전환을 가중치로 메우는 보정)을 따로 봤지만 실제 프로덕션에서는 세 가지 가운데 하나를 고르지 않고 **층층이 쌓습니다.** 층마다 고치는 대상이 다르므로 세 층이 모두 필요합니다. 재학습은 **모델의 가중치**를 바꾸는 무겁고 느린 작업입니다. 보정은 Base Model 이 낸 **출력 확률의 눈금**만 바꾸는 가볍고 빠른 작업입니다. 지연 보상은 **학습 데이터의 가중치**를 바꿔서 아직 오지 않은 전환을 「안 살 사람」으로 오해하지 않게 막습니다.

고치는 대상에 따라 층마다 감당할 수 있는 속도도 달라서 세 층은 갱신 주기가 하루, 수 분, 수 시간으로 서로 다릅니다. 빠른 층은 느린 층의 실수를 임시로 덮는 반면 느린 층은 빠른 층으로는 고치지 못하는 근본 원인을 나중에 바로잡습니다.

카드에서는 서버가 내보낸 광고가 새 노출과 클릭을 만들고 그 클릭이 수 분 뒤에는 보정값으로, 하루 뒤에는 새 가중치로 서버에 돌아오는 한 바퀴를 먼저 보면 됩니다. 그 아래 그림은 같은 구조를 부품 이름으로 적었습니다. 그림은 위로 갈수록 빠르고 가벼운 층이고 아래로 갈수록 느리고 무거운 층입니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-ops-cards.html?embed=1&card=onlineloop" height="480" loading="lazy" title="온라인 학습은 층층이 쌓인 한 바퀴다"></iframe>
<a class="demo-embed-open" href="demo-ops-cards.html" target="_blank" rel="noopener">↗ 카드 여섯 장 전체로 열기</a>
</div>

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

그림의 층을 위에서부터 읽으면 이렇습니다.

- **EVENT STREAM** 층은 Kafka 나 Kinesis 같은 스트리밍 플랫폼(이벤트를 실시간으로 모아 전달하는 시스템)으로 노출, 클릭, 전환 이벤트를 모읍니다. 같은 층의 Click-Conversion Join 은 나중에 온 전환을 원래 클릭과 연결하고 Attribution Window 를 적용합니다.
- **NEAR-REAL-TIME UPDATE** 층에는 그룹이 3개 있습니다. Online Calibration 은 Flink(스트림을 실시간으로 처리하는 엔진)에서 최근 1시간의 예측과 실제를 비교해 Platt Scaling 파라미터를 고칩니다. Delayed Feedback 보정은 FSIW 가중치를 계산해 Fake Negative 를 보정합니다. Feature Update 는 Redis(메모리에 값을 두는 저장소)의 INCR(값을 1 올리는 명령)과 SET(값을 덮어쓰는 명령)으로 스트리밍 피처를 갱신합니다.
- **BATCH RETRAINING** 층은 하루 한 번 최근 30일 전체 데이터로 Base Model 을 다시 학습하고 AUC, LogLoss(예측 확률이 실제 라벨과 얼마나 다른지 로그로 측정한 손실), Calibration 으로 오프라인 평가를 한 뒤 A/B 실험(트래픽을 나눠 두 모델을 비교하는 실험)으로 배포를 정합니다.
- **SERVING** 층의 모델 서버는 하루 한 번 갱신되는 Base Model 과 수 분마다 갱신되는 Calibration Layer 를 차례로 지나 보정된 pCTR 과 pCVR 을 냅니다.

### 계층별 갱신 주기와 역할

아래 표는 그림의 계층 5개를 갱신 주기, 바꾸는 대상, 맡는 Drift 로 다시 적었습니다. Online Calibration 은 수 분마다 Calibration 파라미터 a, b 만 바꿔 Sudden Drift 와 Gradual Drift 를 함께 받습니다. Delayed Feedback 보정은 수 시간마다 학습 데이터의 가중치를 바꿔 Fake Negative 를 막습니다. Batch Retraining 은 하루 한 번 모델 전체 파라미터를 바꿔 Gradual Drift 에 대응합니다.

| 계층 | 갱신 주기 | 변경 대상 | Drift 대응 |
|------|---------|---------|-----------|
| **Event Stream** | 실시간 | 원시 데이터 수집 | - |
| **Online Calibration** | 수 분 | Calibration 파라미터 (a, b) | Sudden + Gradual |
| **Delayed Feedback 보정** | 수 시간 | 학습 데이터의 가중치 | Fake Negative 방지 |
| **Batch Retraining** | 일 1회 | 모델 전체 파라미터 | Gradual Drift |
| **Serving** | 실시간 | Base + Calibration 조합 | 최종 보정된 예측 |

---

## 6. 모델 Staleness 모니터링

**모델이 낡는 순간은 사람이 매일 AUC 를 확인하는 방식으로는 따라갈 수 없어 자동으로 감지해야 합니다. CVR 은 7일 뒤에야 확정되므로 「어제 CVR 이 떨어졌다」는 알림은 관측값을 그때까지의 도착 확률 $F_d$ 로 나눠 진짜 하락인지 아직 안 온 전환인지 구분합니다. 지표는 확정이 빠른 입력 분포, 예측과 실제의 차이, CVR 순서로 봅니다.**

도입부의 pCTR 모델처럼 AUC 가 하루 만에 떨어지는 일을 사람이 매일 확인해서 잡는 방식은 모델과 지표가 늘어나면 확장할 수 없으므로 모델이 언제 낡는지는 **자동으로 감지**해야 합니다. 제목의 Staleness 는 모델이 학습한 뒤 시간이 지나 낡은 정도를 가리킵니다.

자동 감지에는 지연이 만드는 다루기 어려운 함정이 하나 있습니다. **CVR 지표는 늘 뒤늦게 확정되어서** 어제 클릭의 진짜 CVR 은 오늘 알 수 없고 7일이 지나야 확정됩니다. 그래서 「어제 CVR 이 떨어졌다」는 알림이 오면 정말 성과가 나빠졌을 수도 있고 전환이 아직 다 들어오지 않았을 수도 있는데, 두 경우를 구분하지 못하면 사람들은 금방 그 알림을 무시합니다.

두 경우는 4절의 $F_d$ 로 구분합니다. 어제 12시에 난 클릭이라면 그 클릭의 전환이 지금까지 도착했을 확률을 계산하고 관측한 CVR 을 그 확률로 나눕니다. 나눈 값이 평소 수준이면 CVR 은 지연 때문에 낮아 보였을 뿐입니다. 나눈 값도 낮으면 진짜 하락입니다. 3절 표의 6~12h 줄로 해 보면 관측 CVR 1.90% 는 참 CVR 3% 보다 한참 낮지만 구간 가운데 시각의 F(t) 63.3% 로 나누면 3.00% 로 평소 수준이므로 이 구간도 지연 때문에 낮아 보였을 뿐입니다. 지연을 감안하지 않는 대시보드는 전날 클릭의 전환이 아직 다 들어오지 않은 아침마다 가짜 경보를 울립니다.

모델이 낡을 때 가장 먼저 나빠지는 신호가 가장 쓸모 있으므로 모니터링 지표는 값이 얼마나 빨리 확정되는지, 곧 **확정 속도**로 순위를 매기는 편이 좋습니다. CTR 과 Calibration Gap(예측 확률의 평균과 실제 비율의 평균의 차이)은 수 분 안에 확정됩니다. 피처 분포의 변화를 나타내는 PSI(Population Stability Index, 학습 데이터와 서빙 데이터의 피처 분포가 얼마나 달라졌는지 숫자 하나로 나타낸 지수)는 입력이 들어오는 순간 측정할 수 있어 지연이 아예 없습니다. 반대로 CVR 계열 지표는 전환을 기다려야 해서 며칠이 걸립니다. 그래서 실무에서는 먼저 PSI 로 입력이 변했는지 보고 다음으로 Calibration Gap 으로 출력이 틀어졌는지 본 뒤 마지막에 CVR 로 확인합니다. 원본 로그가 어디서 어떤 지연을 거쳐 들어오는지는 [광고 로그 파이프라인](post.html?id=ad-log-pipeline) 편에서 다룹니다.

### 주요 모니터링 지표 5가지

아래 표는 지표마다 무엇을 측정하는지, 어떻게 계산하는지, 언제 알림을 보내는지를 적었습니다. 예를 들어 Calibration Gap 은 최근 1시간의 예측 평균에서 실제 평균을 뺀 값이 10% 를 넘으면, AUC 는 최근 6시간 단위로 계산한 값이 전일보다 0.02 이상 떨어지면 알림 대상입니다. Prediction 분포의 σ 는 표준편차라서 최근 1시간 예측값의 평균이 표준편차의 2배보다 크게 움직이면 알립니다. Win Rate 는 전체 입찰 가운데 이긴 입찰의 비율이고 전일보다 20% 이상 변하면 알림을 보냅니다.

| 지표 | 무엇을 측정하는가 | 계산 방법 | 알림 기준 |
|------|----------------|---------|---------|
| **Calibration Gap** | 예측 확률과 실제 확률의 차이 | mean(predicted) - mean(actual), 최근 1시간 | gap > 10% |
| **AUC 추이** | 모델 판별력 변화 | 최근 6시간 단위 AUC 계산 | 전일 대비 -0.02 이상 하락 |
| **PSI (Population Stability Index)** | 입력 피처 분포 변화 | 학습 데이터 vs 서빙 데이터 분포 비교 | PSI > 0.2 |
| **Prediction 분포** | 예측값 분포 변화 | 최근 1시간 예측값의 mean/std 추적 | mean 이동 > 2$\sigma$ |
| **Win Rate 변화** | 입찰 성과 변화 | wins / total bids, 최근 1시간 | 전일 대비 20% 이상 변화 |

### 자동 재학습 트리거

아래 규칙은 지표가 임계치를 넘었을 때 자동으로 할 일을 세 단계로 나눕니다.

```text
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

Level 1 은 Calibration Gap 이 10% 를 넘으면 수 분 안에 끝나는 Online Calibration 갱신을 바로 합니다. Level 2 는 AUC 가 0.02 넘게 떨어지고 PSI 도 0.2 를 넘어 입력 분포까지 바뀌었을 때 수 시간이 걸리는 긴급 Batch Retraining 을 시작하며 「Feature 분포 변화 감지, 모델 재학습 시작」이라고 알립니다. Level 3 은 Win Rate 가 30% 넘게 급변하면 입찰 일시 중지를 검토하고 경쟁사 전략 변경인지, 플랫폼 정책 변경인지, 데이터 파이프라인 장애인지 원인을 분석합니다. Level 3 알림에 나오는 Auto-Bidding λ 는 자동 입찰이 예산 소진 속도를 맞추려고 조절하는 값입니다.

---

## 7. 담장 안: 자기 결제 로그로 들어오는 전환 [무대: 닫힌 생태계]

**자기 지면에 자기 광고를 내는 닫힌 생태계는 전환이 자사 결제 로그로 들어와 유실이 없고 ID 가 확실하며 지연 분포가 안정적이므로, 1~6시간 윈도우로 자주 학습하고 아직 안 온 전환은 $F_d$ 역수 가중으로 되돌리는 방식이 잘 맞습니다. 대신 지면이 몇 개로 정해져 있어 Recurring Drift 가 유독 강하므로 요일, 시간, 지면 피처로 풀어야 합니다.**

3절과 4절에서 쓴 지연 분포는 평균적인 e-commerce(온라인 쇼핑)를 가정한 값이지만 실제 지연의 성격은 내가 어느 무대에 서 있는지에 따라 완전히 달라집니다. 네이버, 카카오처럼 자기 지면(광고가 실리는 화면 자리)에 자기 광고를 내보내는 닫힌 생태계는 지연 면에서 사정이 좋습니다. 이런 환경을 담장 안이라고도 부릅니다. 유저가 광고를 누르고 같은 회사의 쇼핑에서 결제하면 그 결제 로그는 처음부터 회사 안에 남습니다. **전환이 다른 회사의 서버를 거치지 않으므로** 클릭 로그와 결제 로그를 같은 데이터 웨어하우스(회사의 로그를 모아 두고 조회하는 저장소)에서 join(같은 키로 두 표를 합치는 연산)하기만 하면 됩니다.

이 구조에서 좋은 점 세 가지가 따라옵니다. 첫째, 결제가 일어나면 로그가 반드시 남으므로 **유실이 없습니다.** 충분히 오래 기다리면 모든 전환이 도착한다는 뜻으로 $F_d(\infty) = 1$ 이 성립합니다. 둘째, 로그인한 계정으로 사람을 알아보므로 기기가 바뀌어도 같은 사람으로 이어져 **ID(사람을 알아보는 식별자)가 확실합니다.** 셋째, 지면과 상품 카테고리가 정해져 있어 어제의 지연 분포가 오늘도 대체로 맞으므로 **지연 분포가 안정적입니다.**

세 가지 덕분에 담장 안에서는 짧은 윈도우를 공격적으로 씁니다. 1~6시간 윈도우로 자주 학습하고 아직 안 들어온 전환은 $F_d$ 역수 가중으로 되돌립니다. 8절에서 다루듯 역수 가중은 전환이 언젠가는 온다는 전제로 계산하는데, 담장 안은 유실이 없어 4절의 보정이 실제로 잘 맞는 환경입니다. 지연 분포를 캠페인별로 매일 다시 추정해도 비용이 크지 않습니다. 학습 때와 서빙 때 피처 값이 같게 유지되는 피처의 온, 오프라인 일관성만 지키면 이 학습 루프는 큰 문제 없이 돌아갑니다. 그 일관성을 지키는 방법은 [Feature Store](post.html?id=feature-store-serving) 편에서 다룹니다.

다만 담장 안에는 다른 숙제가 있습니다. 지면이 몇 개로 정해져 있어 같은 검색 지면, 같은 시간대, 같은 유저 군이 매주 되풀이되므로 **Recurring Drift 가 유독 강합니다.** 2절의 실험에서 학습률이나 윈도우만 바꾼 학습기들이 주말을 기억하지 못했듯이 이 Drift 는 학습률로 풀 수 없고 요일, 시간, 지면 피처로 풀어야 합니다.

---

## 8. 열린 RTB: 다른 회사 서버에서 넘어오는 전환 [무대: 열린 RTB]

**열린 RTB(실시간 경매 시장)의 DSP 는 전환을 다른 회사가 보내 주는 포스트백으로만 알 수 있어 유실이 있고 지연이 길며 광고주마다 다르고 ID 도 흔들립니다. 영원히 오지 않는 유실을 지연으로 착각하면 가중치를 과하게 키워 pCVR 을 과대추정하므로 윈도우를 길게 잡고 광고주별 지연 모델을 두며 유실률은 지연 분포와 따로 추정합니다.**

열린 RTB(Real-Time Bidding, 노출 한 번마다 여러 DSP 가 실시간 경매로 입찰하는 시장)의 DSP 는 7절의 닫힌 생태계와 정반대 상황에 있습니다. 유저가 광고를 누르면 광고주 사이트로 넘어가 그다음 일을 DSP 가 볼 수 없습니다. 그래서 전환을 알려면 광고주 서버나 MMP(모바일 측정 파트너, 앱 설치와 그 뒤 활동을 측정해 알려 주는 회사)가 **포스트백**(전환을 알려 주는 서버 호출)을 보내 줘야 하므로, DSP 는 다른 회사의 시스템이 알려 주기를 기다리는 구조에 놓입니다.

이 구조에서는 7절의 좋은 점 세 가지가 모두 나빠집니다.

- **유실이 있습니다.** 포스트백 전송이 실패하거나 전환을 기록하는 태그(광고주 페이지에 넣는 코드 조각)가 잘못 설치됐거나 광고주가 포스트백을 아예 보내지 않으면 영원히 기다려도 오지 않는 전환이 생깁니다. 아무리 오래 기다려도 도착 확률이 1 에 닿지 않으므로 $F_d(\infty) < 1$ 입니다.
- **지연이 길고 광고주마다 다릅니다.** 게임 앱 설치는 몇 분, 보험 상담 신청은 며칠, 여행 예약은 몇 주가 걸리므로 모든 광고주를 지연 분포 하나로 묶을 수 없습니다.
- **ID 가 흔들립니다.** iOS ATT 이후 쓰는 SKAN(SKAdNetwork, 애플이 사용자 식별자 없이 설치 성과를 대신 측정해 알려 주는 경로)은 24~48시간의 랜덤 지연을 일부러 넣고 결과를 집계 단위로만 알려 주므로 클릭 한 건에 대응하는 라벨이 처음부터 없습니다.

세 가지 가운데 유실이 가장 아픕니다. 4절의 역수 가중은 전환이 언젠가는 온다는 전제로 아직 안 온 전환을 메우는데 **유실은 지연이 아니어서** 아무리 나눠도 오지 않는 전환은 복원되지 않습니다. 유실을 지연으로 착각하면 가중치를 과하게 키워 3절의 과소추정과 반대로 pCVR 을 과대추정합니다. 표본이 한쪽으로 잘려 있을 때 생기는 이 편향은 [Negative Sampling](post.html?id=negative-sampling-bias) 편에서 다루는 편향과 같은 계열입니다.

### 두 무대의 지연 성격 비교 (가상 데이터)

아래 표는 두 무대의 지연 성격을 가상 숫자로 나란히 놓았습니다.

| | 닫힌 생태계 (자사 결제) | 열린 RTB (외부 포스트백) |
|---|---|---|
| 6시간 내 도착 | 62% | 34% |
| 7일 내 도착 | 97% | 78% |
| 영구 유실 | 0% | 12% |
| 지연 분포 안정성 | 높음 (일별 변동 작음) | 낮음 (광고주별로 다름) |
| 권장 학습 윈도우 | 1~6시간 + FSIW | 1일 이상 + 광고주별 모델 |
| 주의할 실패 모드 | Recurring Drift 미반영 | 유실을 지연으로 착각 |

표의 숫자는 가상이지만 방향은 실무와 같습니다. 열린 RTB 는 6시간 안에 도착하는 전환이 34% 라서 6시간 윈도우로 학습하면 전환의 3분의 1 만 보고 배우는 결과가 됩니다. 그래서 열린 RTB 에서는 윈도우를 1일 이상으로 길게 잡고 광고주(혹은 전환 유형)마다 지연 모델을 따로 둡니다. 유실률(표의 영구 유실 12% 같은 값)은 지연 분포와 분리해 따로 추정합니다. 그리고 모델이 낸 출력은 맨 마지막에 한 번 더 보정합니다([Calibration](post.html?id=calibration)).

두 무대의 차이를 한 줄로 줄이면 **담장 안은 전환이 언제 오는지만 풀면 되지만 열린 RTB 는 전환이 오기는 하는지부터 풀어야 합니다.**

---

## 마무리

이 글의 결론은 7가지입니다.

1. **광고 모델은 태생적으로 빠르게 낡습니다.** Sudden, Gradual, Recurring 세 갈래의 Concept Drift 가 끊임없이 일어나므로 광고 ML 에서는 모델을 배포한 뒤 잊어버릴 수 없습니다.

2. **프로덕션에서는 Batch 와 Online Calibration 을 섞은 하이브리드를 주로 씁니다.** Base Model 은 하루 한 번 전체를 다시 학습하고 Calibration Layer 만 수 분 단위로 Online 갱신해 안정성과 적응력의 균형을 맞춥니다.

3. **Online Learning 의 가장 큰 장애물은 Delayed Feedback 입니다.** 전환 지연이 만든 Fake Negative 때문에 pCVR 이 과소추정됩니다. 대응 기법은 단순한 Attribution Window, 범용인 FSIW, 정교한 Delay Model 가운데에서 고릅니다.

4. **모델이 낡는 순간을 자동으로 잡는 모니터링이 재학습보다 우선입니다.** 사람이 매일 확인하는 방식은 확장할 수 없으므로 Calibration Gap, AUC 추이, PSI 를 자동으로 추적하다가 임계치를 넘으면 자동 재학습을 트리거합니다.

5. **되풀이되는 패턴은 학습률이 아니라 피처로 풉니다.** 2절 코드에서 주말 첫 시간부터 3.03% 로 출발한 학습기는 요일 피처를 가진 학습기 하나뿐이었습니다. 요일 피처가 없는 나머지 4개는 주말을 세 번 겪고도 매번 1.9% 부근에서 처음부터 다시 배웠습니다. 학습률을 올리면 적응 속도는 빨라지지만 기억은 생기지 않습니다.

6. **무대에 따라 처방이 다릅니다.** 담장 안은 전환이 자사 결제 로그로 들어와 유실이 없으므로 짧은 윈도우와 역수 가중이 잘 맞습니다. 열린 RTB 는 포스트백이 외부에서 오고 일부는 영원히 오지 않아서 유실을 지연으로 착각하면 보정이 반대 방향으로 틀어집니다.

7. **pCTR 정확도의 체인은 여기서도 이어집니다.** 모델이 낡으면 pCTR 이 부정확해지고 그 값으로 계산한 True Value 가 틀어져 입찰가가 비효율적이 되며 결국 광고주 ROI(쓴 광고비 대비 수익)가 떨어집니다. [Feature Store](post.html?id=feature-store-serving) → Online Learning → [Auto-Bidding](post.html?id=auto-bidding-pacing) 의 체인 가운데 하나라도 끊어지면 전체가 제대로 동작하지 않습니다.

---

## 더 깊이 보기

- 지연 전환의 문제 정의(중복, 지연, 클릭 편향) → [pCVR 모델링](post.html?id=pcvr-modeling)
- 전환 로그가 어떤 지연으로 흘러오는지 → [광고 로그 파이프라인](post.html?id=ad-log-pipeline)
- 학습, 서빙 피처를 어긋나지 않게 두는 법 → [Feature Store와 실시간 서빙](post.html?id=feature-store-serving)
- 예측 확률을 실제 확률에 맞추는 보정 → [Calibration](post.html?id=calibration)
- 구조로 여러 목표를 함께 배우는 접근 → [Multi-Task Learning](post.html?id=multi-task-learning)
- 표본이 한쪽으로 잘릴 때 생기는 편향 → [Negative Sampling & Bias](post.html?id=negative-sampling-bias)
- 기여 기간(윈도우)을 정하는 규칙 → [어트리뷰션 기초](post.html?id=attribution-basics)
- 보정된 pCVR이 입찰가로 바뀌는 지점 → [Auto-Bidding과 Pacing](post.html?id=auto-bidding-pacing)
- 담장 안 무대의 특징 → [Walled Garden](post.html?id=walled-garden)
- 광고 ML 전체 지도에서 이 글의 위치 → [ML 엔지니어 트랙](ml-track.html)