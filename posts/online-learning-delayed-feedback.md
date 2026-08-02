어제 AUC 0.82였던 pCTR 모델이 오늘 0.78입니다. 코드도, 피처도, 인프라도 바뀐 게 없는데 성능이 떨어졌습니다. **시장이 변한 것입니다.** 유저 관심사가 바뀌고, 경쟁 DSP의 전략이 달라지고, 새 광고주가 진입하고, 시즌 효과가 작동합니다. 광고 ML 모델은 태생적으로 빠르게 낡아집니다.

이 글은 세 가지를 차례로 해부합니다. 먼저 **왜 모델이 낡아지는가**(Concept Drift). 다음으로 **어떻게 최신 상태를 유지하는가**(Online Learning). 마지막으로 **전환 지연이 학습을 어떻게 방해하는가**(Delayed Feedback).

> [pCVR 모델링 포스트](post.html?id=pcvr-modeling)에서 FSIW 알고리즘을 다뤘습니다. 이 글은 그 문제를 더 넓은 맥락 — Online Learning 전체 파이프라인 — 에서 다룹니다.

---

## 1. 왜 광고 모델은 빠르게 낡아지는가

광고 데이터의 분포는 끊임없이 변합니다. 이것을 **Concept Drift**라고 합니다.

말이 어렵지만 뜻은 단순합니다. 어제까지 맞던 답이 오늘은 틀린 답이 되는 것입니다. 시험 범위가 조용히 바뀌었는데 학생은 지난 범위로 공부한 상태라고 생각하면 됩니다. 모델은 자기가 낡았다는 걸 스스로 모릅니다. 그래서 성능이 떨어지는 게 아니라, **떨어지는 줄 모른 채로 계속 자신 있게 틀립니다.**

중요한 건 "변한다"가 아니라 **"어떻게 변하는가"** 입니다. 변화의 모양이 다르면 대응법도 완전히 달라지기 때문입니다. 하루아침에 절벽처럼 떨어지는 변화라면 즉시 재학습이 답입니다. 몇 주에 걸쳐 서서히 미끄러지는 변화라면 정기 재학습으로 충분합니다. 매주 같은 모양으로 되돌아오는 변화라면 재학습이 아니라 **피처를 하나 추가하는 것**이 답입니다. 재학습은 비싸고, 엉뚱한 처방은 돈만 쓰고 문제를 남깁니다.

그래서 Drift를 세 갈래로 나눠 봅니다.

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

### 실전 예시: CTR이 하루 만에 달라지는 이유

```text
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

위 로그를 다시 보면 CTR이 1.8%에서 3.2%로 뜁니다. 78% 차이입니다. 그런데 이건 모델이 나빠진 게 아닙니다. 사람들의 하루가 원래 그렇게 생긴 것입니다. 월요일 아침에는 뉴스를 훑고 지나가고, 금요일 저녁에는 장바구니를 들여다봅니다.

그래서 이 변화는 재학습으로 풀 문제가 아닙니다. **모델에게 "지금이 몇 시 몇 요일인지" 알려 주면 스스로 배웁니다.** 요일·시간대를 피처로 넣는 순간 Recurring Drift는 문제에서 재료로 바뀝니다. 뒤에서 이걸 숫자로 확인합니다. 요일 피처가 없는 학습기 넷은 주말을 세 번 겪고도 매번 처음부터 다시 배웠습니다. 요일 피처를 넣은 쪽만 주말 진입 직후부터 참값을 따라갔습니다.

정리하면 처방이 셋으로 갈립니다. Recurring Drift는 **피처로** 흡수합니다. Gradual Drift는 **정기 재학습**으로 따라갑니다. Sudden Drift만이 **즉시 재학습**을 필요로 합니다. 그런데 즉시 재학습은 그렇게 간단하지 않습니다. 다음 절부터 "얼마나 자주 다시 배울 것인가"라는 질문 하나가 어떻게 이 글 전체의 주제로 커지는지 보겠습니다.

---

## 2. Batch Retraining vs Online Learning

모델을 최신 상태로 유지하는 두 가지 접근법입니다.

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

### 프로덕션의 주류: Batch + Online Calibration 하이브리드

대부분의 프로덕션 DSP는 둘 다 씁니다.

| 계층 | 역할 | 주기 | 변경 대상 |
|------|------|------|---------|
| **Base Model** (Batch) | 전체 패턴 학습 | 일 1회 | 모델 전체 파라미터 |
| **Online Calibration** | 최신 편향 보정 | 수 분 ~ 수 시간 | Calibration Layer만 |

```python
# (의사코드 — 구조만 보여 줍니다. DeepFM 같은 클래스 이름은 예시이고 그대로 실행되지 않습니다.)
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

보정 자체의 원리는 [Calibration 포스트](post.html?id=calibration)에서 따로 다룹니다. 여기서는 "왜 이 층만 빨리 움직이게 두는가"만 봅니다.

### 학습률과 윈도우를 바꾸면 무엇이 망가지나

Online Learning의 단점 칸에 적힌 **Catastrophic Forgetting**은 추상적으로 들립니다. 직접 만들어 보면 손에 잡힙니다. §1의 예시를 그대로 씁니다. 평일 CTR 1.8%, 주말 CTR 3.2%. 4주 동안 1시간 단위로 관측이 들어오고, 학습기는 그걸 보며 예측을 갱신합니다.

학습기 다섯 개를 나란히 돌립니다. 학습률이 느린 것(0.02)과 빠른 것(0.30). 최근 24시간만 보는 윈도우와 168시간(7일)을 보는 윈도우. 마지막으로 요일을 피처로 가진 학습기입니다. 앞의 네 개는 "요일"이라는 개념이 아예 없습니다.

```python
import random

random.seed(42)

HOURS = 4 * 7 * 24        # 4주치, 1스텝 = 1시간
IMPS_PER_HOUR = 2_000     # 한 시간에 노출 2천 건
CTR_WEEKDAY = 0.018       # 가상 데이터: 평일 CTR 1.8%
CTR_WEEKEND = 0.032       # 가상 데이터: 주말 CTR 3.2%


def pad(s, w):
    """한글은 두 칸을 차지한다고 보고 표 폭을 맞춘다."""
    width = sum(2 if ord(c) > 0x2000 else 1 for c in s)
    return s + " " * max(0, w - width)


def is_weekend(hour):
    """0=월 … 5=토, 6=일. 토·일이면 True."""
    return (hour // 24) % 7 >= 5


def true_ctr(hour):
    return CTR_WEEKEND if is_weekend(hour) else CTR_WEEKDAY


class Ema:
    """지수 이동평균. lr이 크면 최근 데이터를 세게 반영한다."""
    def __init__(self, lr):
        self.lr, self.p = lr, 0.02      # 초기 예측 2%
    def predict(self, hour):
        return self.p
    def update(self, hour, obs):
        self.p += self.lr * (obs - self.p)


class Window:
    """최근 N시간 관측만 평균. 그보다 오래된 건 통째로 잊는다."""
    def __init__(self, size):
        self.size, self.buf = size, []
    def predict(self, hour):
        return sum(self.buf) / len(self.buf) if self.buf else 0.02
    def update(self, hour, obs):
        self.buf.append(obs)
        if len(self.buf) > self.size:
            self.buf.pop(0)             # 오래된 관측 버리기 = 망각


class WeekdayEma:
    """평일용·주말용 EMA를 따로 둔다. 요일이 '피처'로 들어간 셈."""
    def __init__(self, lr):
        self.lr, self.p = lr, {True: 0.02, False: 0.02}
    def predict(self, hour):
        return self.p[is_weekend(hour)]
    def update(self, hour, obs):
        k = is_weekend(hour)
        self.p[k] += self.lr * (obs - self.p[k])


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

for hour in range(HOURS):
    p_true = true_ctr(hour)
    # 노출 2천 건을 실제로 굴려 관측 CTR을 만든다 → 통계적 잡음 포함
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

print(pad("학습기", 22) + "전체오차  급변직후  안정구간")
for n in models:
    a = sum(err_all[n]) / len(err_all[n]) * 100
    s = sum(err_shock[n]) / len(err_shock[n]) * 100
    c = sum(err_calm[n]) / len(err_calm[n]) * 100
    print(pad(n, 22) + f"{a:6.3f}%p {s:6.3f}%p {c:6.3f}%p")

print()
print("4주차 주말 진입 직후 6시간의 예측 CTR (참값 3.20%)")
for n in models:
    track = " ".join(f"{v*100:.2f}" for v in last_weekend_track[n])
    print("  " + pad(n, 22) + track)

# 출력:
# 학습기                전체오차  급변직후  안정구간
# EMA lr=0.02(느림)      0.440%p  1.080%p  0.397%p
# EMA lr=0.30(빠름)      0.141%p  0.675%p  0.105%p
# 윈도우 24시간          0.220%p  1.227%p  0.153%p
# 윈도우 168시간         0.524%p  0.795%p  0.506%p
# 요일피처+EMA 0.30      0.107%p  0.165%p  0.104%p
#
# 4주차 주말 진입 직후 6시간의 예측 CTR (참값 3.20%)
#   EMA lr=0.02(느림)     1.89 1.93 1.96 1.99 2.01 2.03
#   EMA lr=0.30(빠름)     1.69 2.24 2.63 2.88 2.87 3.00
#   윈도우 24시간         1.84 1.89 1.96 2.01 2.04 2.12
#   윈도우 168시간        2.21 2.21 2.21 2.21 2.21 2.21
#   요일피처+EMA 0.30     3.03 3.17 3.28 3.33 3.19 3.22
```

아래쪽 표가 이 글에서 가장 중요한 그림입니다. **4주째 주말입니다.** 학습기들은 이미 주말을 세 번 겪었습니다. 그런데 요일 피처가 없는 네 개는 여전히 1.7~2.2%에서 출발합니다. 참값은 3.20%인데도요. 세 번을 겪고도 아무것도 기억하지 못한 것입니다.

윈도우 24시간이 특히 나쁩니다. 급변 직후 오차가 1.227%p로 최악입니다. 버퍼 24칸이 전부 평일 데이터라서, 토요일이 시작되는 순간 예측 전체가 평일 값입니다. **최근만 보는 게 곧 잊는 것입니다.** 반대로 윈도우 168시간은 평일과 주말을 한 통에 섞어 항상 2.21%를 냅니다. 평일에도 주말에도 틀린 값입니다.

빠른 학습률(0.30)은 6시간 만에 3.00%까지 따라잡습니다. 하지만 그 6시간 동안은 계속 틀린 값으로 입찰합니다. 그리고 다음 주말에 또 처음부터 따라잡습니다. 학습률을 올려서 얻는 건 "적응 속도"뿐이고, "기억"은 아닙니다.

요일 피처를 넣은 학습기만 주말 첫 시간부터 3.03%로 출발합니다. 급변 직후 오차가 0.165%p로, 최고 학습률 모델의 4분의 1입니다. **되풀이되는 패턴은 학습률로 풀 문제가 아니라 피처로 풀 문제입니다.** §1에서 Recurring Drift는 재학습이 필요 없다고 한 이유가 이것입니다. 구조로 푸는 접근은 [Multi-Task Learning](post.html?id=multi-task-learning)으로 이어집니다.

---

## 3. Delayed Feedback: 라벨이 늦게 오는 문제

Online Learning의 가장 큰 장애물이 **Delayed Feedback**입니다. 클릭은 즉시 관측되지만, 전환은 수 시간~수 일 후에 발생합니다.

<div class="chart-timeline">
  <div style="font-size:0.85rem; font-weight:700; color:var(--text-primary); margin-bottom:12px;">클릭 후 전환까지의 시간 분포 (가상 데이터).</div>
  <div class="chart-timeline-bar">
    <div class="chart-timeline-segment green" style="width:25%;">30분 이내<br/>35%</div>
    <div class="chart-timeline-segment cyan" style="width:20%;">1-6시간<br/>25%</div>
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

학습 시점에 아직 전환하지 않은 유저를 "미전환(negative)"으로 레이블링하면 이런 일이 벌어집니다. 아래 표는 클릭 세 건의 운명입니다 (가상 데이터).

| 시나리오 | 실제 | 학습 라벨 | 결과 |
|---------|------|---------|------|
| 클릭 후 10분, 아직 전환 안 함 | **전환 예정** (2시간 후 구매) | negative (0) | **Fake Negative** |
| 클릭 후 10분, 전환 안 할 유저 | 미전환 | negative (0) | 정상 |
| 클릭 후 3시간, 이미 전환 완료 | 전환 | positive (1) | 정상 |

Fake Negative가 많아지면 모델이 전환율을 **과소추정**합니다.

- pCVR 하락 → True Value 하락 → 입찰가 하락 → Win Rate 하락
- 실제로는 전환이 잘 일어나는 캠페인인데, 입찰을 포기하게 됨

### 얼마나 내려앉는가: 숫자로 확인

"과소추정"은 말로는 밋밋합니다. 실제로 몇 %p인지 세어 보면 얘기가 달라집니다. 참 CVR을 3%로 정해 두고, 위 타임라인의 지연 분포를 그대로 써서 클릭 30만 건을 굴려 봅니다. 학습을 지금 돌린다고 하면, 방금 누른 클릭은 아직 전환이 도착할 시간이 없었습니다. 반면 20시간 전 클릭은 대부분 도착했습니다. 그래서 **경과 시간대별로 관측 CVR이 다르게 보입니다.**

되돌리는 방법도 같은 코드에서 확인합니다. 각 전환을 "이 시점까지 도착할 확률" $F_d(t)$로 나누면 원래 크기로 복원됩니다. 확률이 작을수록 크게 부풀리는 셈입니다.

```python
import random

random.seed(42)

# 앞 타임라인과 같은 가상 지연 분포 (구간 상한 시각, 그 구간 비율)
DELAY_BUCKETS = [(0.5, 0.35), (6.0, 0.25), (24.0, 0.20),
                 (72.0, 0.12), (168.0, 0.05), (720.0, 0.03)]
TRUE_CVR = 0.03
N_CLICKS = 300_000
TRAIN_AT = 24.0   # 학습을 도는 시각. 클릭은 지난 24시간 사이에 흩어져 있다.


def pad(s, w):
    """한글은 두 칸을 차지한다고 보고 표 폭을 맞춘다."""
    width = sum(2 if ord(c) > 0x2000 else 1 for c in s)
    return s + " " * max(0, w - width)


def delay_cdf(t):
    """클릭 후 t시간 안에 전환이 도착할 확률 F(t). 구간 안은 균등이라고 본다."""
    acc, lo = 0.0, 0.0
    for hi, share in DELAY_BUCKETS:
        if t >= hi:
            acc += share                         # 구간을 통째로 지났다
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


# ── 클릭 30만 건: 언제 눌렀나 + 전환하나 + 얼마 뒤 전환하나 ──────
clicks = []
for _ in range(N_CLICKS):
    elapsed = random.uniform(0.0, TRAIN_AT)      # 학습 시각까지 지난 시간
    delay = draw_delay() if random.random() < TRUE_CVR else None
    clicks.append((elapsed, delay))

# ── 경과 시간대별로 나눠 본다 ─────────────────────────────────
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

print()
print(f"전체 관측 CVR (지연 무시) {tot_naive/N_CLICKS*100:.2f}%")
print(f"전체 보정 CVR (역수 가중) {tot_fixed/N_CLICKS*100:.2f}%")
print(f"참 CVR                    {TRUE_CVR*100:.2f}%")
print(f"→ 지연을 무시하면 입찰가가 참값의 {tot_naive/N_CLICKS/TRUE_CVR*100:.0f}%로 주저앉는다")

# ── 미전환 샘플에 붙는 가중치도 확인 (FSIW 음성 가중치) ─────────
print()
print(pad("경과시간", 10) + pad("F(t)", 9) + "음성 가중치")
for t in [0.5, 2, 6, 24, 168, 720]:
    f = delay_cdf(t)
    w_neg = (1 - TRUE_CVR * (1 - f)) / (1 - TRUE_CVR)
    print(pad(f"{t:.1f}h", 10) + pad(f"{f*100:.1f}%", 9) + f"{w_neg:.5f}")

# 출력:
# 경과시간  클릭수    관측전환   관측CVR   F(t)    보정CVR
# 0~1h      12,469    90         0.72%     35.0%   2.40%
# 1~3h      25,103    294        1.17%     41.8%   2.79%
# 3~6h      37,332    629        1.68%     53.2%   3.16%
# 6~12h     74,882    1,421      1.90%     63.3%   2.99%
# 12~24h    150,214   3,226      2.15%     73.3%   2.93%
#
# 전체 관측 CVR (지연 무시) 1.89%
# 전체 보정 CVR (역수 가중) 2.94%
# 참 CVR                    3.00%
# → 지연을 무시하면 입찰가가 참값의 63%로 주저앉는다
#
# 경과시간  F(t)     음성 가중치
# 0.5h      35.0%    1.01082
# 2.0h      41.8%    1.01293
# 6.0h      60.0%    1.01856
# 24.0h     80.0%    1.02474
# 168.0h    97.0%    1.03000
# 720.0h    100.0%   1.03093
```

읽는 법은 세 줄입니다.

- **관측 CVR이 시간에 따라 늘어납니다.** 0~1시간 클릭은 0.72%, 12~24시간 클릭은 2.15%. 같은 캠페인, 같은 유저인데 "얼마나 기다렸나"만으로 세 배 차이가 납니다.
- **전체로 뭉치면 1.89%.** 참값 3%의 63%입니다. 이 값을 그대로 입찰에 쓰면 입찰가도 63%로 깎입니다. 이겨야 할 경매를 계속 지게 됩니다.
- **역수 가중으로 2.94%까지 복원됩니다.** 완벽히 3.00%가 아닌 이유는 경과 시간이 짧은 구간입니다. $F_d$가 작아서 나눌 때 값이 크게 튀고, 그만큼 추정이 출렁입니다. 이게 FSIW의 알려진 약점인 **가중치 분산**입니다.

마지막 표의 음성 가중치는 1.01에서 1.031까지만 움직입니다. 미전환 샘플은 워낙 많아서(97%) 한 건 한 건 크게 건드릴 필요가 없습니다. 보정의 무게는 거의 전부 전환 쪽에 실립니다.

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

### 기법별 Trade-off 비교

| | Attribution Window | FSIW | Delay Model |
|---|---|---|---|
| **학습 지연** | 7일+ (긴 대기) | 수 시간 (빠름) | 수 시간 (빠름) |
| **라벨 정확도** | 매우 높음 | 중간 (가중치 의존) | 높음 |
| **구현 복잡도** | 매우 낮음 | 중간 | 높음 |
| **Drift 대응력** | 매우 낮음 | 높음 | 높음 |
| **적합한 경우** | 전환 지연이 짧은 캠페인 | 범용 | 전환 지연이 긴 캠페인 (보험, 부동산) |

### 얼마나 기다릴까: 최적점은 하나가 아니다

Attribution Window를 고를 때 실무자가 실제로 하는 계산입니다. 오래 기다리면 라벨이 맞아집니다. 그런데 그 사이 모델은 낡습니다. 두 손실이 반대 방향으로 움직이니, "정답인 대기 시간"은 존재하지 않습니다. 무엇을 더 아프게 여기는지에 따라 답이 달라집니다.

숫자로 보면 결정이 쉬워집니다. 잡히는 전환 비율과 데이터 나이를 같은 표에 올려 봅니다.

```python
import random

random.seed(42)

# ── 가상 데이터: 클릭 후 전환까지 걸리는 시간 분포 ────────────────
# (구간 상한 시각, 그 구간에 들어올 전환 비율). 본문 타임라인과 같은 값.
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


# ── 클릭 20만 건 생성. 전환하면 지연 시간, 안 하면 None ──────────
clicks = [draw_delay() if random.random() < TRUE_CVR else None
          for _ in range(N_CLICKS)]
n_conv = sum(1 for d in clicks if d is not None)

# ── 기다리는 시간을 바꿔 가며 두 값을 잰다 ──────────────────────
# (a) 잡히는 전환 비율: 기다리는 동안 도착한 전환 / 전체 전환
# (b) 데이터 나이: 학습이 W시간 뒤처져 돌면 쓰는 데이터는 평균 1.5W 시간 전 것
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

print()
print(f"참 CVR {TRUE_CVR*100:.2f}%  (전환 {n_conv:,}건 / 클릭 {N_CLICKS:,}건)")
print("최적점은 하나가 아니다. 대기를 늘리면 라벨은 맞아지고 모델은 낡는다.")

# 출력:
# 대기    잡힌전환   관측CVR   데이터나이  한 줄 평
# 1시간   38.3%      1.13%     2h          신선한데 라벨이 없다
# 6시간   59.7%      1.77%     9h          신선한데 라벨이 없다
# 1일     80.7%      2.39%     36h         라벨은 맞는데 낡았다
# 7일     97.2%      2.87%     252h        라벨은 맞는데 낡았다
#
# 참 CVR 3.00%  (전환 5,913건 / 클릭 200,000건)
# 최적점은 하나가 아니다. 대기를 늘리면 라벨은 맞아지고 모델은 낡는다.
```

표를 위에서 아래로 훑으면 두 열이 반대로 움직입니다.

- **6시간만 기다리면 전환의 59.7%만 잡힙니다.** 나머지 40%는 Fake Negative가 됩니다. 대신 데이터는 평균 9시간밖에 안 묵었습니다.
- **7일을 기다리면 97.2%를 잡습니다.** 라벨은 거의 완벽합니다. 그런데 학습에 들어가는 데이터가 평균 252시간, 열흘 넘게 묵은 것입니다.
- 그 사이 시장이 한 번이라도 급변하면(§1의 Sudden Drift) 정확한 라벨로 낡은 세상을 배우게 됩니다.

**둘 다 손실입니다.** 그래서 프로덕션은 보통 둘을 쪼갭니다. 짧은 창(1~6시간)으로 자주 학습하고, 안 들어온 전환은 FSIW 가중치로 되돌립니다. 그리고 긴 창(7일)으로 만든 데이터셋은 검증과 일일 재학습에만 씁니다. 창을 어떻게 자르느냐는 기여도 배분 규칙과도 얽힙니다. 그 부분은 [어트리뷰션 기초](post.html?id=attribution-basics)에서 다룹니다.

### FSIW 핵심 수식

> 자세한 유도 과정은 [pCVR 모델링 포스트](post.html?id=pcvr-modeling)를 참고하세요.

FSIW의 핵심 아이디어: 관측 시점에 "미전환"으로 보이는 샘플 중 일부는 **아직 전환이 안 온 Fake Negative**입니다. 이 비율을 추정하여 학습 가중치를 보정합니다.

- **이미 전환된 Positive 샘플**: 전환이 관측 시점 내에 도착할 확률 $F_d(\Delta t)$로 나누어 보정

$$w_i^{(+)} = \frac{1}{F_d(t - t_{\text{click}})}$$

- **미전환 Negative 샘플**: 경과 시간이 길수록 진짜 Negative일 확률이 높으므로 가중치를 낮춤

$$w_i^{(-)} = \frac{1 - p_{\text{cvr}} \cdot (1 - F_d(t - t_{\text{click}}))}{1 - p_{\text{cvr}}}$$

여기서 $F_d(\cdot)$는 전환 지연 시간의 CDF, $p_{\text{cvr}}$은 전환 확률 추정값입니다. 시간이 충분히 지나면 $F_d \to 1$이 됩니다. 그러면 Positive 가중치는 1에 수렴합니다. Negative 가중치는 $1/(1 - p_{\text{cvr}})$에 멈춥니다. 앞 절 코드에서 확인한 1.031이 그 값입니다. 사실상 1이니, 충분히 오래 기다린 샘플은 보정 없이 그대로 써도 안전하다는 뜻입니다.

:::deep 더 깊이 — 지연을 지수분포로 보면 무엇이 쉬워지나

앞 코드에서는 지연 분포를 구간별 표로 들고 다녔습니다. 실무에서는 이걸 **지수분포** 하나로 근사하는 경우가 많습니다. 왜 그런지, 그리고 무엇을 잃는지 계산해 보자.

지연 시간 $D$가 파라미터 $\lambda$의 지수분포라고 가정하면 CDF는 이렇게 한 줄이다.

$$F_d(t) = 1 - e^{-\lambda t}$$

파라미터가 하나뿐이라는 게 핵심이다. 평균 지연 $\mathbb{E}[D] = 1/\lambda$ 하나만 알면 모든 $t$에서 $F_d(t)$가 정해진다. 앞 코드의 표는 구간 6개 × 비율 = 값 6개를 관리해야 했다. 지수분포는 숫자 하나다. 캠페인마다, 광고주마다 따로 추정해야 하는 상황에서 이 차이는 크다.

FSIW 가중치도 닫힌 식이 된다. Positive 가중치를 대입하면 이렇다.

$$w^{(+)}(t) = \frac{1}{1 - e^{-\lambda t}}$$

여기서 바로 읽히는 사실이 두 개 있다. 첫째, $t \to 0$이면 $w^{(+)} \to \infty$다. 방금 누른 클릭에서 도착한 전환은 무한히 큰 가중치를 받는다. 그래서 실무에서는 반드시 상한을 씌운다(clipping). 앞 절 코드의 0~1시간 구간이 2.40%로 출렁였던 이유가 이것이다. 둘째, $\lambda t$가 3을 넘으면 $F_d > 0.95$이므로 가중치는 1.05 아래다. 평균 지연의 세 배만 기다리면 보정이 거의 필요 없어진다.

$\lambda$ 추정도 간단하다. 이미 도착한 전환들의 지연 시간 평균을 쓰면 되는데, 여기에 함정이 있다. 관측된 전환은 "이미 도착한 것"만 모인 표본이라 지연이 짧은 쪽으로 치우쳐 있다. 이걸 그대로 평균 내면 $\lambda$를 과대추정한다(즉 실제보다 빠르다고 믿는다). 그래서 우도를 쓸 때 **아직 안 온 전환은 절단(censoring)으로 처리**한다. 클릭 후 $t_i$가 지났는데 아직 전환이 없는 건은 "$D > t_i$였다"는 정보로만 쓴다.

$$\log L = \sum_{i \in \text{도착}} \log \left( \lambda e^{-\lambda d_i} \right) + \sum_{j \in \text{미도착}} \log \left( e^{-\lambda t_j} \right)$$

이 절단 처리는 패찰 가격 문제와 수학적으로 같은 모양이다. [Bid Shading](post.html?id=bid-shading-censored) 글에서 다룬다. 한쪽은 "얼마에 졌는지 모른다", 다른 쪽은 "언제 전환할지 모른다"다. 둘 다 "관측이 한쪽에서 잘려 있다"는 같은 문제다.

잃는 것도 분명하다. 지수분포는 **무기억성**을 가정한다. 6시간을 기다린 클릭이 앞으로 더 기다려야 할 시간의 분포가, 방금 누른 클릭과 같다는 뜻이다. 실제 전환은 그렇지 않다. 30분 안에 35%가 몰리는 급한 봉우리가 있고, 3~7일에 늘어지는 꼬리가 따로 있다. 이런 이봉 구조를 지수분포 하나로는 못 담는다. 그래서 정교하게 갈 때는 지수분포 두세 개를 섞거나(mixture), 와이불(Weibull)처럼 위험률이 시간에 따라 변하는 분포를 쓴다.
:::

---

## 5. 프로덕션 Online Learning 아키텍처

지금까지 셋을 따로 봤습니다. 재학습, 보정, 지연 보상입니다. 실제 프로덕션에서는 이 셋을 고르는 게 아니라 **층층이 쌓습니다.**

왜 쌓아야 하는지는 각자 고치는 것이 다르기 때문입니다. 재학습은 **모델의 가중치**를 바꿉니다. 무겁고 느립니다. 보정은 **출력 확률의 눈금**만 바꿉니다. 가볍고 빠릅니다. 지연 보상은 **학습 데이터의 무게**를 바꿉니다. 아직 안 온 전환을 "안 살 사람"으로 오해하지 않게 막아 줍니다.

셋의 갱신 주기가 다른 것도 그래서입니다. 층마다 감당할 수 있는 속도가 다릅니다. 빠른 층이 느린 층의 실수를 임시로 덮고, 느린 층이 빠른 층으로는 못 고치는 근본을 나중에 바로잡습니다. 집의 배관과 수도꼭지 같습니다. 수압이 이상하면 일단 꼭지를 조절해 버티고(보정), 배관 자체가 낡았으면 결국 갈아야 합니다(재학습).

아래 그림에서 위로 갈수록 빠르고 가볍고, 아래로 갈수록 느리고 무겁습니다.

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

여기에 지연이 만드는 고약한 함정이 하나 있습니다. **CVR 지표는 항상 뒤늦게 확정됩니다.** 어제의 진짜 CVR은 오늘 알 수 없습니다. 7일 뒤에야 확정됩니다. 그러니 "어제 CVR이 떨어졌다"는 알림은 두 가지 중 하나입니다. 정말 성과가 나빠진 것일 수도 있고, 그냥 전환이 아직 안 들어온 것일 수도 있습니다. 이 둘을 구분하지 못하면 알림은 곧 무시당합니다.

구분하는 방법은 §4의 $F_d$를 그대로 쓰는 것입니다. 어제 12시 클릭이라면 지금까지 도착할 확률이 얼마인지 계산해서, 관측값을 그 확률로 나눠 봅니다. 나눈 값이 평소 수준이면 지연 때문입니다. 나눈 값도 낮으면 진짜 하락입니다. 지연을 감안하지 않은 대시보드는 매일 아침 가짜 경보를 울립니다.

그래서 모니터링 지표는 **확정 속도**로 줄을 세우는 게 좋습니다. 가장 먼저 무너지는 신호가 가장 쓸모 있습니다. CTR과 Calibration Gap은 수 분 안에 확정됩니다. 피처 분포(PSI)는 지연이 아예 없습니다. 입력이 들어오는 순간 잴 수 있으니까요. 반대로 CVR 계열은 며칠이 걸립니다. 그래서 실무 순서는 이렇습니다. 먼저 PSI로 입력이 변했는지 보고, 다음으로 Calibration Gap으로 출력이 틀어졌는지 보고, 마지막에 CVR로 확인합니다. 원본 로그가 어디서 어떤 지연으로 흘러오는지는 [광고 로그 파이프라인](post.html?id=ad-log-pipeline)에서 다룹니다.

### 핵심 모니터링 지표

| 지표 | 무엇을 측정하는가 | 계산 방법 | 알림 기준 |
|------|----------------|---------|---------|
| **Calibration Gap** | 예측 확률과 실제 확률의 차이 | mean(predicted) - mean(actual), 최근 1시간 | gap > 10% |
| **AUC 추이** | 모델 판별력 변화 | 최근 6시간 단위 AUC 계산 | 전일 대비 -0.02 이상 하락 |
| **PSI (Population Stability Index)** | 입력 피처 분포 변화 | 학습 데이터 vs 서빙 데이터 분포 비교 | PSI > 0.2 |
| **Prediction 분포** | 예측값 분포 변화 | 최근 1시간 예측값의 mean/std 추적 | mean 이동 > 2$\sigma$ |
| **Win Rate 변화** | 입찰 성과 변화 | wins / total bids, 최근 1시간 | 전일 대비 20% 이상 변화 |

### 자동 재학습 트리거

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

---

## 7. 담장 안에서는 전환이 자기 결제 로그로 들어온다 [무대: 닫힌 생태계]

지금까지 다룬 지연 분포는 "평균적인 e-commerce"를 가정했습니다. 실제로는 내가 어느 무대에 서 있는지에 따라 지연의 성격이 완전히 달라집니다.

네이버·카카오처럼 자기 지면에 자기 광고를 꽂는 닫힌 생태계는 사정이 좋습니다. **전환이 남의 서버를 거치지 않습니다.** 유저가 광고를 누르고 자사 쇼핑에서 결제하면, 그 결제 로그는 이미 우리 회사 안에 있습니다. 클릭 로그와 결제 로그를 같은 데이터 웨어하우스에서 join하면 끝입니다.

여기서 세 가지가 따라옵니다. 첫째, **유실이 없습니다.** 결제가 일어났으면 로그는 반드시 남습니다. $F_d(\infty) = 1$이 성립합니다. 둘째, **ID가 확실합니다.** 로그인 기반이라 기기가 바뀌어도 같은 사람으로 이어집니다. 셋째, **지연 분포가 안정적입니다.** 지면과 상품 카테고리가 정해져 있으니 어제의 지연 분포가 오늘도 대체로 맞습니다.

그래서 담장 안에서는 짧은 창을 공격적으로 씁니다. 1~6시간 창으로 자주 학습하고, 안 들어온 전환은 $F_d$ 역수 가중으로 되돌립니다. §4에서 계산한 보정이 실제로 잘 먹는 환경입니다. 지연 분포를 캠페인별로 매일 다시 추정해도 비용이 크지 않습니다. 피처의 온·오프라인 일관성만 지켜지면 이 루프는 꽤 조용히 돕니다. 그 부분은 [Feature Store](post.html?id=feature-store-serving)에서 다룹니다.

대신 다른 숙제가 생깁니다. 담장 안은 지면이 몇 개로 정해져 있어 **Recurring Drift가 유독 강합니다.** 같은 검색 지면, 같은 시간대, 같은 유저 군이 매주 반복됩니다. §2에서 본 것처럼 이건 학습률로 풀 문제가 아닙니다. 요일·시간·지면 피처로 풀어야 합니다.

---

## 8. 열린 RTB에서는 전환이 남의 서버에서 넘어온다 [무대: 열린 RTB]

열린 RTB의 DSP는 정반대 상황입니다. 유저가 광고를 누르면 광고주 사이트로 넘어가고, 그다음 일은 우리가 못 봅니다. 전환을 알려면 광고주 서버나 MMP(모바일 측정 파트너)가 **포스트백**을 쏴 줘야 합니다. 남의 시스템이 알려 주기를 기다리는 구조입니다.

여기서 세 가지가 나빠집니다.

- **유실이 있습니다.** 포스트백이 실패하거나, 태그가 잘못 심겼거나, 광고주가 아예 안 보내는 경우가 있습니다. 영원히 기다려도 안 오는 전환이 존재합니다. $F_d(\infty) < 1$입니다.
- **지연이 길고 광고주마다 다릅니다.** 게임 앱 설치는 몇 분, 보험 상담 신청은 며칠, 여행 예약은 몇 주입니다. 하나의 지연 분포로 묶을 수 없습니다.
- **ID가 흔들립니다.** iOS ATT 이후 SKAN 경로는 24~48시간 랜덤 지연을 일부러 넣고, 집계 단위로만 알려 줍니다. 클릭 한 건에 대응하는 라벨이 애초에 없습니다.

첫 번째가 가장 아픕니다. **유실은 지연이 아닙니다.** §4의 역수 가중은 "언젠가 오긴 온다"를 전제로 합니다. 안 오는 전환은 아무리 나눠도 복원되지 않습니다. 이걸 지연으로 착각하면 가중치를 과하게 부풀려 pCVR을 반대로 과대추정합니다. 이건 표본이 한쪽으로 잘려 있을 때 생기는 편향입니다. [Negative Sampling](post.html?id=negative-sampling-bias)과 같은 계열입니다.

### 두 무대의 지연 성격 비교 (가상 데이터)

| | 닫힌 생태계 (자사 결제) | 열린 RTB (외부 포스트백) |
|---|---|---|
| 6시간 내 도착 | 62% | 34% |
| 7일 내 도착 | 97% | 78% |
| 영구 유실 | 0% | 12% |
| 지연 분포 안정성 | 높음 (일별 변동 작음) | 낮음 (광고주별로 다름) |
| 권장 학습 창 | 1~6시간 + FSIW | 1일 이상 + 광고주별 모델 |
| 주의할 실패 모드 | Recurring Drift 미반영 | 유실을 지연으로 착각 |

숫자는 가상이지만 방향은 실무와 같습니다. 열린 RTB에서 6시간 창을 쓰면 전환의 3분의 1만 보고 학습하는 셈입니다. 그래서 창을 길게 잡고, 광고주(혹은 전환 유형)별로 지연 모델을 따로 두는 쪽으로 갑니다. 유실률은 지연 분포와 분리해서 따로 추정합니다. 그리고 모델 출력은 마지막에 다시 보정합니다([Calibration](post.html?id=calibration)).

한 줄로 정리하면 이렇습니다. **담장 안은 "언제 오나"만 풀면 되고, 열린 RTB는 "오기는 하나"를 먼저 풀어야 합니다.**

---

## 마무리

1. **광고 모델은 태생적으로 빠르게 낡는다** — Concept Drift(Sudden, Gradual, Recurring)가 끊임없이 발생합니다. "모델 배포 후 잊어버리기"는 광고 ML에서 불가능합니다.

2. **Batch + Online Calibration 하이브리드가 프로덕션 주류** — Base Model은 일 1회 전체 재학습, Calibration Layer만 수 분 단위로 Online 업데이트합니다. 안정성과 적응력의 균형입니다.

3. **Delayed Feedback은 Online Learning의 최대 장애물** — 전환 지연으로 인한 Fake Negative가 pCVR을 과소추정시킵니다. Attribution Window(단순), FSIW(범용), Delay Model(정교) 중 선택합니다.

4. **모니터링이 재학습보다 중요하다** — Calibration Gap, AUC 추이, PSI를 자동 추적하고, 임계치 초과 시 자동 재학습을 트리거하세요. 사람이 매일 확인하는 것은 확장 불가능합니다.

5. **되풀이되는 패턴은 학습률이 아니라 피처로 푼다** — §2 코드에서 요일 피처를 가진 학습기만 주말 첫 시간부터 3.03%로 출발했습니다. 나머지 넷은 주말을 세 번 겪고도 매번 1.9% 부근에서 다시 배웠습니다. 학습률을 올려 얻는 건 적응 속도뿐이고 기억은 아닙니다.

6. **무대에 따라 처방이 다르다** — 담장 안은 전환이 자사 결제 로그로 들어와 유실이 없습니다. 짧은 창과 역수 가중이 잘 먹습니다. 열린 RTB는 포스트백이 외부에서 오고 일부는 영원히 안 옵니다. 유실을 지연으로 착각하면 보정이 반대로 틀어집니다.

7. **pCTR 정확도의 체인은 여기서도 이어진다** — 모델이 낡아지면 pCTR이 부정확해지고, True Value가 틀어지고, 입찰가가 비효율적이 되고, 결국 광고주 ROI가 하락합니다. [Feature Store](post.html?id=feature-store-serving) → Online Learning → [Auto-Bidding](post.html?id=auto-bidding-pacing)의 체인이 하나라도 끊어지면 전체가 무너집니다.

---

## 더 깊이 보기

- 지연 전환의 문제 정의와 FSIW 유도 → [pCVR 모델링](post.html?id=pcvr-modeling)
- 전환 로그가 어떤 지연으로 흘러오는지 → [광고 로그 파이프라인](post.html?id=ad-log-pipeline)
- 학습·서빙 피처를 어긋나지 않게 두는 법 → [Feature Store와 실시간 서빙](post.html?id=feature-store-serving)
- 예측 확률을 실제 확률에 맞추는 보정 → [Calibration](post.html?id=calibration)
- 구조로 여러 목표를 함께 배우는 접근 → [Multi-Task Learning](post.html?id=multi-task-learning)
- 표본이 한쪽으로 잘릴 때 생기는 편향 → [Negative Sampling & Bias](post.html?id=negative-sampling-bias)
- 기여 기간(윈도우)을 정하는 규칙 → [어트리뷰션 기초](post.html?id=attribution-basics)
- 보정된 pCVR이 입찰가로 바뀌는 지점 → [Auto-Bidding과 Pacing](post.html?id=auto-bidding-pacing)
- 담장 안 무대의 특징 → [Walled Garden](post.html?id=walled-garden)
- 광고 ML 전체 지도에서 이 글의 위치 → [ML 엔지니어 트랙](ml-track.html)