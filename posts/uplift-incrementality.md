지난달 리타게팅 캠페인 리포트에 이렇게 찍혔다. 도달 105,000명, 전환 9,000건, 전환당 비용 ₩1,400. 목표로 잡았던 전환당 비용은 ₩3,000이었다. 광고팀은 예산을 더 달라고 했다.

같은 달 이 브랜드의 매출은 거의 움직이지 않았다. 두 숫자가 따로 논다. 리포트는 "광고를 본 뒤 산 사람"을 센다. 매출은 "광고가 없었으면 안 샀을 사람"에서만 는다. 이 글은 그 둘을 갈라 세는 방법을 다룬다.

이 글에 나오는 숫자는 전부 설명을 위해 지어낸 값이다. 실제 캠페인 수치가 아니다.

> **한 줄 요약:** 광고를 보고 산 사람을 세면 안 된다. 광고가 없었으면 안 샀을 사람만 세야 한다. 그 사람을 골라내는 것이 증분(uplift) 모델이다.

**이 글에 나오는 말** — 낯선 이름만 먼저 풀어 둡니다. 본문에서 다시 설명하니 지금 외울 필요는 없습니다.

| 말 | 한 줄 뜻 |
|---|---|
| 증분 (uplift) | 광고를 봤을 때 전환율에서 안 봤을 때 전환율을 뺀 값 |
| 반사실 | 그 사람이 광고를 안 봤을 때의 결과. 볼 수 없다 |
| 홀드아웃 (대조군) | 일부러 광고를 안 보낸 비교용 집단 |
| 예측 전환율 (pCVR) | 광고를 봤을 때 살 확률. 지금 광고 시스템이 쓰는 점수 |
| S·T·X-learner | 증분 모델을 만드는 세 가지 방법의 이름 |
| Qini 곡선 | 점수 높은 순으로 잘라 갈 때 늘어난 전환의 누적 그림 |
| 곡선 아래 면적 (AUUC) | 그 곡선을 한 숫자로 줄인 점수. 클수록 좋다 |

> **골라 읽는 법** — 절이 10개인 긴 글입니다. 처음부터 다 읽지 않아도 됩니다.
>
> - 문제 장면과 네 부류만 → 1~2절
> - 개인 증분을 왜 못 재나 → 3절
> - 타게팅 순서가 실제로 어떻게 바뀌나 → 4절
> - 모델 만드는 법과 각각의 약점 → 5~6절
> - 모델을 어떻게 채점하나 → 7절
> - 대조군 비율을 정해야 하면 → 8절
> - 실무에서 깨지는 곳 → 9절
> - 두 무대 비교만 → 10절

---

## 1. 같은 5만 명, 다른 세그먼트

**리포트는 노출군의 전환만 센다. 그 사람이 광고 없이도 샀을지는 묻지 않는다.**

캠페인 후보 80만 명을 무작위로 절반씩 갈랐다. 40만 명에게는 광고를 내보냈다. 나머지 40만 명은 이 캠페인에서 아예 제외했다. 제외한 쪽을 **홀드아웃(대조군)** 이라고 부른다. 이렇게 크게 잡은 이유는 세그먼트별로 쪼개서 봐야 하기 때문이다. 실무의 상시 홀드아웃은 이보다 훨씬 작다. 그 비율은 8절에서 따로 다룬다.

세그먼트 두 개만 먼저 보자. 각각 노출군 5만 명, 대조군 5만 명이 들어 있다. 도달 1명당 광고비는 ₩120으로 잡았다. 아래 표의 CPA 는 전환당 비용이다. 겉보기 CPA 는 리포트에 찍히는 값이다. 증분 CPA 는 광고가 늘린 전환만으로 다시 계산한 값이다.

| 세그먼트 | 노출군 전환 | 대조군 전환 | 증분 | 광고비 | 겉보기 CPA | 증분 CPA |
|---|---|---|---|---|---|---|
| C. 브랜드 키워드 검색 유입 | 4,500건 | 4,350건 | **150건** | ₩6,000,000 | ₩1,333 | **₩40,000** |
| D. 앱 설치 30일 내 미구매 | 1,000건 | 600건 | **400건** | ₩6,000,000 | ₩6,000 | **₩15,000** |

C는 전환을 4,500건 만들었다. D는 1,000건이다. 리포트만 보면 C가 4.5배 낫다. 겉보기 CPA도 C가 ₩1,333으로 D의 ₩6,000보다 4.5배 싸다. 예산을 어디에 더 넣을지 물으면 아무도 D를 고르지 않는다.

그런데 대조군을 같이 보면 그림이 뒤집힌다. C의 대조군은 광고를 한 번도 안 봤는데 4,350건을 샀다. C가 실제로 늘린 것은 150건뿐이다. D의 대조군은 600건이다. D가 늘린 것은 400건이다. 같은 ₩6,000,000으로 C는 150건, D는 400건을 만들었다. 증분 기준 CPA는 C가 ₩40,000, D가 ₩15,000이다. 순서가 완전히 뒤집힌다.

C가 나쁜 세그먼트여서가 아니다. 브랜드 이름을 직접 검색해서 들어온 사람은 이미 살 마음이 있다. 그 사람에게 광고를 보여 주면 그 전환이 리포트에 잡힌다. 하지만 그 전환은 광고가 없어도 일어났다. 광고는 매출을 만든 게 아니라 매출의 공을 가져온 것이다. 어트리뷰션 규칙이 이 공을 어떻게 나누는지는 [어트리뷰션 입문](post.html?id=attribution-basics)에서 다뤘다. 이 글은 그 공이 애초에 있었느냐를 묻는다.

---

## 2. 네 부류 — 광고비가 값진 곳은 하나뿐

**사람은 광고에 대한 반응으로 네 부류로 갈린다. 광고비가 값을 하는 곳은 그중 하나뿐이다.**

한 사람에게는 두 개의 미래가 있다. 광고를 봤을 때와 안 봤을 때다. 각 미래에서 사거나 안 산다. 두 답의 조합이 네 가지다. 그게 네 부류다.

| 부류 | 광고 봄 | 광고 안 봄 | 인원(80만 명 중) | 광고비의 값 |
|---|---|---|---|---|
| 설득 가능(persuadable) | 산다 | 안 산다 | 6,400명 | **여기서만 매출이 는다** |
| 확실 구매(sure thing) | 산다 | 산다 | 17,600명 | 0 — 어차피 살 사람 |
| 청개구리(sleeping dog) | 안 산다 | 산다 | 2,400명 | **음수 — 보이면 손해** |
| 무관심(lost cause) | 안 산다 | 안 산다 | 773,600명 | 0 — 뭘 해도 안 산다 |
| 합계 | | | 800,000명 | |

6,400 + 17,600 + 2,400 + 773,600 = 800,000이다. 설득 가능은 전체의 0.8%뿐이다. 청개구리는 0.3%다. 나머지 98.9%에게 쓰는 돈은 매출을 1원도 안 늘린다.

청개구리가 실제로 있느냐는 질문이 자주 나온다. 있다. 사흘 전에 같은 상품을 산 사람에게 그 광고를 다시 띄우면 반품 문의가 는다. 구독을 해지하려다 만 사람에게 리마인드 광고를 보내면 해지를 다시 떠올린다. 실무의 청개구리는 대부분 이렇게 "굳이 안 건드렸으면 좋았을" 사람이다.

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 560 330" role="img" aria-label="광고를 봤을 때와 안 봤을 때의 구매 여부로 사람을 네 칸으로 가른 사분면. 광고를 봐야만 사는 설득 가능 6400명 칸에만 광고비가 값을 하고, 광고를 보면 오히려 안 사는 청개구리 2400명 칸에서는 손해가 난다." style="width:100%; max-width:560px; height:auto; font-family:var(--font-sans)">
<text class="chart-label" x="280" y="18" text-anchor="middle" style="font-size:12.5px; fill:var(--ink3)">가로 = 광고를 안 봤을 때 / 세로 = 광고를 봤을 때</text>
<rect x="120" y="34" width="200" height="120" style="fill:var(--grey-bg); stroke:var(--rule); stroke-width:1.5"/>
<rect x="320" y="34" width="200" height="120" style="fill:var(--navy-bg); stroke:var(--navy); stroke-width:2"/>
<rect x="120" y="154" width="200" height="120" style="fill:var(--oxide-bg); stroke:var(--oxide); stroke-width:2"/>
<rect x="320" y="154" width="200" height="120" style="fill:var(--grey-bg); stroke:var(--rule); stroke-width:1.5"/>
<text class="chart-label" x="220" y="62" text-anchor="middle" style="font-size:13.5px; font-weight:700; fill:var(--ink)">확실 구매</text>
<text class="chart-label" x="220" y="84" text-anchor="middle" style="font-size:12.5px; fill:var(--ink2)">17,600명</text>
<text class="chart-label" x="220" y="106" text-anchor="middle" style="font-size:12.5px; fill:var(--ink3)">광고가 공만 가져간다</text>
<text class="chart-label" x="220" y="128" text-anchor="middle" style="font-size:12.5px; fill:var(--ink3)">증분 0</text>
<text class="chart-label" x="420" y="62" text-anchor="middle" style="font-size:13.5px; font-weight:700; fill:var(--navy)">설득 가능</text>
<text class="chart-label" x="420" y="84" text-anchor="middle" style="font-size:12.5px; fill:var(--ink2)">6,400명</text>
<text class="chart-label" x="420" y="106" text-anchor="middle" style="font-size:12.5px; fill:var(--navy)">광고비가 여기서만 산다</text>
<text class="chart-label" x="420" y="128" text-anchor="middle" style="font-size:12.5px; fill:var(--navy)">증분 +3,200</text>
<text class="chart-label" x="220" y="182" text-anchor="middle" style="font-size:13.5px; font-weight:700; fill:var(--oxide)">청개구리</text>
<text class="chart-label" x="220" y="204" text-anchor="middle" style="font-size:12.5px; fill:var(--ink2)">2,400명</text>
<text class="chart-label" x="220" y="226" text-anchor="middle" style="font-size:12.5px; fill:var(--oxide)">보이면 오히려 손해</text>
<text class="chart-label" x="220" y="248" text-anchor="middle" style="font-size:12.5px; fill:var(--oxide)">증분 -1,200</text>
<text class="chart-label" x="420" y="182" text-anchor="middle" style="font-size:13.5px; font-weight:700; fill:var(--ink)">무관심</text>
<text class="chart-label" x="420" y="204" text-anchor="middle" style="font-size:12.5px; fill:var(--ink2)">773,600명</text>
<text class="chart-label" x="420" y="226" text-anchor="middle" style="font-size:12.5px; fill:var(--ink3)">뭘 해도 안 산다</text>
<text class="chart-label" x="420" y="248" text-anchor="middle" style="font-size:12.5px; fill:var(--ink3)">증분 0</text>
<text class="chart-label" x="112" y="98" text-anchor="end" style="font-size:12.5px; fill:var(--ink2)">봤을 때 산다</text>
<text class="chart-label" x="112" y="218" text-anchor="end" style="font-size:12.5px; fill:var(--ink2)">봤을 때 안 산다</text>
<text class="chart-label" x="220" y="294" text-anchor="middle" style="font-size:12.5px; fill:var(--ink2)">안 봐도 산다</text>
<text class="chart-label" x="420" y="294" text-anchor="middle" style="font-size:12.5px; fill:var(--ink2)">안 보면 안 산다</text>
<line x1="120" y1="306" x2="520" y2="306" style="stroke:var(--rule); stroke-width:1"/>
<text class="chart-label" x="320" y="324" text-anchor="middle" style="font-size:12.5px; fill:var(--ink3)">전체 80만 명 중 광고비가 값을 하는 칸은 오른쪽 위 0.8% 하나뿐</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">네 칸의 넓이는 같지만 인원은 최대 322배 차이 난다. 무관심 칸이 전체의 96.7%다.</figcaption>
</figure>

지금 광고 시스템이 쓰는 점수는 **예측 전환율(pCVR)** 이다. 이 모델은 위 네 칸을 구분하지 않는다. pCVR 이 높다는 것은 "광고를 봤을 때 살 확률이 높다"는 뜻이다. 그 조건에 맞는 사람은 설득 가능과 확실 구매 둘 다다. 둘 중 확실 구매가 2.75배 많다. 그래서 pCVR 상위를 그대로 고르면 대부분 확실 구매가 뽑힌다. pCVR 모델을 만드는 법은 [pCVR 모델링](post.html?id=pcvr-modeling)에 있다.

---

## 3. 개인은 못 재고 그룹은 잰다

**증분은 한 사람의 두 미래의 차이다. 그런데 한 사람에게서는 둘 중 하나만 관측된다.**

한 사람의 증분은 뺄셈 하나로 정의된다. 광고를 봤을 때 살 확률에서 안 봤을 때 살 확률을 뺀다. 2절의 네 부류를 여기 넣어 보자. 설득 가능은 +1이다. 청개구리는 -1이다. 확실 구매와 무관심은 둘 다 0이다.

문제는 이 값을 개인 단위로는 절대 못 본다는 것이다. 광고를 보여 주면 안 봤을 때의 결과가 사라진다. 안 보여 주면 봤을 때의 결과가 사라진다. 관측되지 않는 쪽의 결과를 **반사실(counterfactual)** 이라 부른다. [인과추론 입문](post.html?id=causal-inference-101)의 3절이 같은 문제를 다룬다.

그래서 개인을 포기하고 그룹으로 간다. 두 그룹을 무작위로 갈라 놓으면 무엇이 같아지나. 두 그룹의 "광고를 안 봤을 때 구매율"이 평균적으로 같아진다. 그러면 대조군에서 관측한 구매율을 노출군의 안 본 세계 대신 쓸 수 있다. 무작위 배정이 왜 이걸 보장하는지는 [랜덤 실험(RCT)](post.html?id=rct-randomized-experiment)에 자세히 있다.

아래 코드는 2절의 네 부류를 그대로 넣는다. 개인 증분은 못 보는데 그룹 증분은 왜 복원되는지 확인한다.

```python
# 네 부류와 잠재적 결과 — 개인 증분은 왜 못 보는가 (숫자는 전부 가데이터)
# 후보 80만 명. 설명을 위해 부류별로 정확히 반씩 갈라 노출군 40만·대조군 40만으로 만들었다.

TYPE_N = {                    # 부류별 전체 인원
    "설득 가능": 6400,        # 광고를 봐야만 산다
    "확실 구매": 17600,       # 광고와 무관하게 산다
    "청개구리": 2400,         # 광고를 보면 오히려 안 산다
    "무관심": 773600,         # 어느 쪽이든 안 산다
}
POTENTIAL = {                 # (광고 봤을 때 구매, 안 봤을 때 구매)
    "설득 가능": (1, 0),
    "확실 구매": (1, 1),
    "청개구리": (0, 1),
    "무관심": (0, 0),
}
COST_PER_USER = 120           # 1명에게 도달하는 데 드는 광고비(원)

t_buy = c_buy = arm = 0
for name, n in TYPE_N.items():
    y1, y0 = POTENTIAL[name]
    half = n // 2             # 노출군·대조군에 반씩
    t_buy += half * y1
    c_buy += half * y0
    arm += half
    print(f"{name} | 인원 {n:,} | 봤을때 {y1} | 안봤을때 {y0} | "
          f"개인 증분 {y1-y0:+d} | 노출군 기여 {half*(y1-y0):+,}")

inc = t_buy - c_buy
spend = arm * COST_PER_USER
print(f"\n노출군 전환 {t_buy:,} / {arm:,} = {t_buy/arm*100:.2f}%")
print(f"대조군 전환 {c_buy:,} / {arm:,} = {c_buy/arm*100:.2f}%")
print(f"증분        {inc:,}건 = {inc/arm*100:.2f}%p")
print(f"광고비 {spend:,}원 → 겉보기 CPA {spend//t_buy:,}원 / 증분 CPA {spend//inc:,}원")

# 출력:
# 설득 가능 | 인원 6,400 | 봤을때 1 | 안봤을때 0 | 개인 증분 +1 | 노출군 기여 +3,200
# 확실 구매 | 인원 17,600 | 봤을때 1 | 안봤을때 1 | 개인 증분 +0 | 노출군 기여 +0
# 청개구리 | 인원 2,400 | 봤을때 0 | 안봤을때 1 | 개인 증분 -1 | 노출군 기여 -1,200
# 무관심 | 인원 773,600 | 봤을때 0 | 안봤을때 0 | 개인 증분 +0 | 노출군 기여 +0
#
# 노출군 전환 12,000 / 400,000 = 3.00%
# 대조군 전환 10,000 / 400,000 = 2.50%
# 증분        2,000건 = 0.50%p
# 광고비 48,000,000원 → 겉보기 CPA 4,000원 / 증분 CPA 24,000원
```

노출군 전환 12,000건 중 광고가 만든 것은 2,000건이다. 나머지 10,000건은 확실 구매가 어차피 샀을 건이다. 겉보기 CPA ₩4,000과 증분 CPA ₩24,000의 6배 차이가 여기서 나온다. 이 배수는 확실 구매가 얼마나 섞였느냐로 정해진다. 리타게팅처럼 이미 관심을 보인 사람만 모으는 캠페인일수록 이 배수가 커진다.

:::deep 더 깊이 — 식으로 쓰면, 그리고 왜 대조군을 빌려 쓸 수 있나
한 사람 $i$의 증분을 $\tau(i)$로 쓴다. $Y_i$는 그 사람이 샀는지 여부다.

$$\tau(i) = P(Y_i = 1 \mid \text{노출}) - P(Y_i = 1 \mid \text{비노출})$$

잠재적 결과 표기로 쓰면 한 사람은 $Y_i(1)$과 $Y_i(0)$ 두 값을 갖는다. 관측되는 것은 배정 $T_i$에 따라 하나뿐이다.

$$Y_i^{obs} = T_i \, Y_i(1) + (1 - T_i)\, Y_i(0)$$

우리가 알고 싶은 평균 증분은 $E[Y(1)] - E[Y(0)]$이다. 두 항 다 절반씩만 관측된다. 무작위 배정은 다음을 보장한다.

$$E[Y(0) \mid T=1] = E[Y(0) \mid T=0]$$

배정이 사람의 특성과 독립이니, 노출군의 "안 봤을 세계" 평균과 대조군의 실제 평균이 같다. 그래서 대조군 관측치를 노출군의 빈칸에 그대로 끼워 넣을 수 있다. 이 등식이 깨지는 순간 증분 추정 전체가 무너진다. 9절의 비랜덤 홀드아웃이 바로 이 등식을 깨는 사고다.
:::

---

## 4. 잘 살 사람 순서와 광고가 잘 먹는 사람 순서는 다르다

**개인 증분은 못 보지만 세그먼트 증분은 뺄셈으로 나온다. 그 순서가 pCVR 순서와 어긋난다.**

80만 명을 여섯 세그먼트로 나눴다. 각 세그먼트 안에서 노출군과 대조군이 반씩이다. 그래서 세그먼트별 증분은 두 전환율의 뺄셈이다. 표의 인원은 노출군 기준이다. 대조군에도 같은 수가 들어 있다.

| 세그먼트 | 인원 | 노출군 전환 | 대조군 전환 | 노출군 CVR | 대조군 CVR | uplift | 증분 |
|---|---|---|---|---|---|---|---|
| A. 장바구니 담고 미구매(7일) | 25,000 | 3,000 | 2,500 | 12.00% | 10.00% | **+2.00%p** | +500 |
| B. 상품 상세 3회 이상(3일) | 30,000 | 1,500 | 1,050 | 5.00% | 3.50% | **+1.50%p** | +450 |
| C. 브랜드 키워드 검색 유입 | 50,000 | 4,500 | 4,350 | 9.00% | 8.70% | +0.30%p | +150 |
| D. 앱 설치 30일 내 미구매 | 50,000 | 1,000 | 600 | 2.00% | 1.20% | **+0.80%p** | +400 |
| E. 저관여 열람(카테고리 1회) | 200,000 | 1,550 | 870 | 0.775% | 0.435% | +0.34%p | +680 |
| F. 최근 구매 3일 내 | 45,000 | 450 | 630 | 1.00% | 1.40% | **-0.40%p** | -180 |
| 합계 | 400,000 | 12,000 | 10,000 | 3.00% | 2.50% | +0.50%p | +2,000 |

인원 25,000 + 30,000 + 50,000 + 50,000 + 200,000 + 45,000 = 400,000이다. 전환도 각각 12,000건과 10,000건으로 3절의 코드 출력과 같다. F는 증분이 음수다. 45,000명에게 광고를 보낸 결과 전환이 180건 줄었다.

두 순위를 나란히 놓으면 어긋나는 자리가 보인다.

| 순위 | 노출군 CVR(pCVR) 기준 | uplift 기준 |
|---|---|---|
| 1 | A (12.00%) | A (+2.00%p) |
| 2 | **C (9.00%)** | B (+1.50%p) |
| 3 | B (5.00%) | **D (+0.80%p)** |
| 4 | D (2.00%) | E (+0.34%p) |
| 5 | F (1.00%) | C (+0.30%p) |
| 6 | E (0.775%) | F (-0.40%p) |

C는 pCVR 기준 2등인데 증분 기준 5등이다. F는 pCVR 기준 5등이다. 증분 기준으로는 꼴찌이고 값이 음수다. 이 어긋남이 예산에서 어떻게 나타나는지 보자. 105,000명에게만 광고할 예산이 있다고 하자. 광고비는 105,000 × ₩120 = ₩12,600,000이다.

| 고르는 기준 | 뽑히는 세그먼트 | 리포트 전환 | 실제 증분 | 겉보기 CPA | 증분 CPA |
|---|---|---|---|---|---|
| pCVR 높은 순 | A + C + B | **9,000건** | 1,100건 | ₩1,400 | ₩11,455 |
| uplift 높은 순 | A + B + D | 5,500건 | **1,350건** | ₩2,291 | ₩9,333 |

두 계획 다 정확히 105,000명이다. 차이는 C(5만 명)를 넣느냐 D(5만 명)를 넣느냐 하나뿐이다. pCVR 계획은 리포트에 전환 9,000건을 찍는다. uplift 계획은 5,500건이다. 리포트만 보면 pCVR 계획이 63.6% 낫다.

실제로 늘어난 매출은 반대다. pCVR 계획의 증분은 1,100건, uplift 계획은 1,350건이다. uplift 계획이 22.7% 더 많이 팔았다. 증분 CPA도 ₩9,333으로 ₩11,455보다 싸다. 도입부의 "전환 9,000건, CPA ₩1,400" 리포트가 바로 이 pCVR 계획이었다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-uplift-quadrant.html?embed=1" height="1530" loading="lazy" title="증분 사분면 미니 데모"></iframe>
<a class="demo-embed-open" href="demo-uplift-quadrant.html" target="_blank" rel="noopener">↗ 전체 데모로 열기</a>
</div>

세그먼트를 사람이 손으로 정의하는 방식은 여기까지가 한계다. 세그먼트가 여섯 개면 증분 값도 여섯 개뿐이다. 같은 세그먼트 안의 사람은 전부 같은 값을 받는다. 개인마다 다른 값을 주려면 모델을 학습해야 한다. 세그먼트를 나누는 일 자체는 [오디언스 세그멘테이션](post.html?id=audience-segmentation)에서 따로 다룬다.

---

## 5. 어떻게 학습하나 — 셋을 같은 데이터로

**증분에는 정답 라벨이 없다. 그래서 라벨이 있는 문제를 풀고 그 답을 빼서 만든다.**

증분 모델을 학습하려고 해도 "이 사람의 증분은 +1"이라고 적힌 데이터가 없다. 3절에서 봤듯 개인 증분은 관측이 안 된다. 그래서 실무의 학습법은 전부 우회다. 관측되는 것은 전환 여부다. 전환 확률을 맞히는 모델을 먼저 만든다. 그다음 두 조건의 예측을 빼서 증분을 만든다.

이제부터 광고를 보여 주는 일을 **처치**라고 부른다. 인과추론에서 쓰는 말이다. 방법은 셋이 대표적이고 이름이 알파벳 한 글자씩이다. **S-learner** 의 S 는 single, 모델을 하나만 쓴다는 뜻이다. **T-learner** 의 T 는 two, 모델을 둘 따로 쓴다는 뜻이다. **X-learner** 의 X 는 cross, 두 모델이 엇갈려 상대의 빈칸을 메운다는 뜻이다.

<figure style="text-align:center; margin:2rem 0;">
<div class="table-wrapper">
<svg viewBox="0 0 620 300" role="img" aria-label="세 학습법의 데이터 흐름 비교. S-learner는 노출 여부를 피처로 넣은 모델 한 개를 학습하고, T-learner는 노출군과 대조군에 모델을 하나씩 따로 학습하며, X-learner는 T-learner의 두 모델로 서로의 빈칸을 메운 뒤 그 차이를 다시 회귀로 학습한다." style="width:100%; min-width:620px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="uplift5-arr" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto"><path d="M0,0 L7.5,3 L0,6 Z" style="fill:var(--ink3)"/></marker>
<marker id="uplift5-key" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto"><path d="M0,0 L7.5,3 L0,6 Z" style="fill:var(--navy)"/></marker>
</defs>
<text class="chart-label" x="103" y="20" text-anchor="middle" style="font-size:13.5px; font-weight:700; fill:var(--ink)">S-learner</text>
<text class="chart-label" x="310" y="20" text-anchor="middle" style="font-size:13.5px; font-weight:700; fill:var(--ink)">T-learner</text>
<text class="chart-label" x="517" y="20" text-anchor="middle" style="font-size:13.5px; font-weight:700; fill:var(--navy)">X-learner</text>
<line x1="207" y1="30" x2="207" y2="280" style="stroke:var(--rule2); stroke-width:1"/>
<line x1="414" y1="30" x2="414" y2="280" style="stroke:var(--rule2); stroke-width:1"/>
<rect x="20" y="40" width="166" height="40" style="fill:var(--plate); stroke:var(--rule); stroke-width:1.5"/>
<text class="chart-label" x="103" y="65" text-anchor="middle" style="font-size:12.5px; fill:var(--ink2)">전체 로그 + 노출 여부 피처</text>
<line x1="103" y1="80" x2="103" y2="106" style="stroke:var(--ink3); stroke-width:1.6" marker-end="url(#uplift5-arr)"/>
<rect x="20" y="112" width="166" height="40" style="fill:var(--paper); stroke:var(--ink2); stroke-width:1.8"/>
<text class="chart-label" x="103" y="137" text-anchor="middle" style="font-size:12.5px; fill:var(--ink)">모델 1개</text>
<line x1="103" y1="152" x2="103" y2="178" style="stroke:var(--ink3); stroke-width:1.6" marker-end="url(#uplift5-arr)"/>
<rect x="20" y="184" width="166" height="44" style="fill:var(--grey-bg); stroke:var(--rule); stroke-width:1.5"/>
<text class="chart-label" x="103" y="204" text-anchor="middle" style="font-size:12.5px; fill:var(--ink2)">노출=1 예측 빼기</text>
<text class="chart-label" x="103" y="221" text-anchor="middle" style="font-size:12.5px; fill:var(--ink2)">노출=0 예측</text>
<text class="chart-label" x="103" y="252" text-anchor="middle" style="font-size:12.5px; fill:var(--oxide)">처치 계수 하나가</text>
<text class="chart-label" x="103" y="269" text-anchor="middle" style="font-size:12.5px; fill:var(--oxide)">모든 사람을 좌우한다</text>
<rect x="222" y="40" width="80" height="40" style="fill:var(--plate); stroke:var(--rule); stroke-width:1.5"/>
<text class="chart-label" x="262" y="65" text-anchor="middle" style="font-size:12.5px; fill:var(--ink2)">노출군</text>
<rect x="318" y="40" width="80" height="40" style="fill:var(--plate); stroke:var(--rule); stroke-width:1.5"/>
<text class="chart-label" x="358" y="65" text-anchor="middle" style="font-size:12.5px; fill:var(--ink2)">대조군</text>
<line x1="262" y1="80" x2="262" y2="106" style="stroke:var(--ink3); stroke-width:1.6" marker-end="url(#uplift5-arr)"/>
<line x1="358" y1="80" x2="358" y2="106" style="stroke:var(--ink3); stroke-width:1.6" marker-end="url(#uplift5-arr)"/>
<rect x="222" y="112" width="80" height="40" style="fill:var(--paper); stroke:var(--ink2); stroke-width:1.8"/>
<text class="chart-label" x="262" y="137" text-anchor="middle" style="font-size:12.5px; fill:var(--ink)">모델 1</text>
<rect x="318" y="112" width="80" height="40" style="fill:var(--paper); stroke:var(--ink2); stroke-width:1.8"/>
<text class="chart-label" x="358" y="137" text-anchor="middle" style="font-size:12.5px; fill:var(--ink)">모델 0</text>
<line x1="310" y1="152" x2="310" y2="178" style="stroke:var(--ink3); stroke-width:1.6" marker-end="url(#uplift5-arr)"/>
<rect x="222" y="184" width="176" height="44" style="fill:var(--grey-bg); stroke:var(--rule); stroke-width:1.5"/>
<text class="chart-label" x="310" y="211" text-anchor="middle" style="font-size:12.5px; fill:var(--ink2)">모델1 예측 빼기 모델0 예측</text>
<text class="chart-label" x="310" y="252" text-anchor="middle" style="font-size:12.5px; fill:var(--oxide)">대조군이 작으면</text>
<text class="chart-label" x="310" y="269" text-anchor="middle" style="font-size:12.5px; fill:var(--oxide)">모델 0이 흔들린다</text>
<rect x="429" y="40" width="176" height="40" style="fill:var(--plate); stroke:var(--rule); stroke-width:1.5"/>
<text class="chart-label" x="517" y="65" text-anchor="middle" style="font-size:12.5px; fill:var(--ink2)">T-learner의 모델 둘을 그대로</text>
<line x1="517" y1="80" x2="517" y2="106" style="stroke:var(--navy); stroke-width:1.8" marker-end="url(#uplift5-key)"/>
<rect x="429" y="112" width="176" height="44" style="fill:var(--navy-bg); stroke:var(--navy); stroke-width:1.8"/>
<text class="chart-label" x="517" y="132" text-anchor="middle" style="font-size:12.5px; fill:var(--ink)">사람마다 빈칸을 메워</text>
<text class="chart-label" x="517" y="149" text-anchor="middle" style="font-size:12.5px; fill:var(--ink)">가짜 증분 라벨을 만든다</text>
<line x1="517" y1="156" x2="517" y2="182" style="stroke:var(--navy); stroke-width:1.8" marker-end="url(#uplift5-key)"/>
<rect x="429" y="188" width="176" height="40" style="fill:var(--paper); stroke:var(--navy); stroke-width:1.8"/>
<text class="chart-label" x="517" y="213" text-anchor="middle" style="font-size:12.5px; fill:var(--ink)">그 라벨로 회귀 모델 2개</text>
<text class="chart-label" x="517" y="252" text-anchor="middle" style="font-size:12.5px; fill:var(--navy)">작은 대조군을 큰 모델이</text>
<text class="chart-label" x="517" y="269" text-anchor="middle" style="font-size:12.5px; fill:var(--navy)">받쳐 준다</text>
</svg>
</div>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">셋 다 마지막에는 뺄셈이다. 다른 것은 무엇을 학습해서 빼느냐다.</figcaption>
</figure>

**S-learner**는 노출 여부를 피처 하나로 넣고 모델을 하나만 학습한다. 예측할 때 그 피처를 1로 놓은 값과 0으로 놓은 값의 차이가 증분 추정치다. 구현이 가장 쉽다. 기존 pCVR 학습 파이프라인을 거의 그대로 쓴다.

**T-learner**는 노출군과 대조군에 모델을 하나씩 따로 학습한다. 두 모델의 예측 차이가 증분이다. 처치의 효과가 피처와 어떻게 얽히든 자유롭게 표현할 수 있다. 대신 대조군 데이터가 적으면 모델 하나가 통째로 흔들린다.

**X-learner**는 그 약점을 메우려고 한 단계를 더 둔다. 먼저 T-learner처럼 두 모델을 만든다. 그다음 사람마다 빈칸을 상대 모델의 예측으로 메운다. 그러면 개인별 가짜 증분 라벨이 생긴다. 마지막으로 그 라벨을 목표로 회귀 모델을 학습한다.

:::deep 더 깊이 — X-learner 의 네 단계
1. 노출군으로 모델 1, 대조군으로 모델 0을 학습한다. 여기까지는 T-learner 와 같다.
2. 노출군의 각 사람에게서 실제 전환 여부를 꺼내고 모델 0의 예측을 뺀다. 그 값이 그 사람의 가짜 증분 라벨이다.
3. 대조군의 각 사람에게는 반대로 한다. 모델 1의 예측에서 실제 전환 여부를 뺀다.
4. 두 라벨 집합을 각각 목표로 회귀 모델을 하나씩 학습한다. 마지막에 노출 비율로 가중해 합친다.

가중을 노출 비율로 두는 이유가 핵심이다. 노출군에서 만든 라벨은 작은 대조군 모델의 예측에 기대고 있다. 대조군에서 만든 라벨은 큰 노출군 모델의 예측에 기댄다. 뒤쪽이 더 믿을 만하니 가중을 크게 준다. 아래 코드의 `E * dot(a0, x) + (1 - E) * dot(a1, x)` 가 그 줄이다.
:::

아래 코드는 참 증분을 아는 가상 데이터를 만들고 셋을 같은 조건에서 비교한다. 홀드아웃은 5%로 잡았다. 실무에서 흔한 비율이다. 이 불균형이 셋을 가르는 지점이기도 하다.

:::deep 더 깊이 — 가상 데이터에 심어 둔 참 증분
아래 코드의 `tau = 0.013 * x1 - 0.010 * x2` 한 줄이 참 증분이다. `x1` 은 0과 1 사이의 관심도 점수다. 값이 1에 가까우면 증분이 +1.3%p까지 오른다. `x2` 는 최근 구매자 표시다. 이 표시가 붙으면 증분이 1.0%p 깎인다. 그래서 최근 구매자이면서 관심도가 낮으면 증분이 음수가 된다. 출력의 참 음수 4,556명이 그렇게 생긴 사람들이다. 기저 전환율은 다른 계수 2.2·1.4·-0.4 로 따로 정한다. 그래서 기저가 높은 사람과 증분이 큰 사람이 일치하지 않는다. 4절에서 두 순서가 어긋난 것과 같은 구조다.
:::

```python
import random, math
random.seed(11)
SIG = lambda z: 1 / (1 + math.exp(-max(-30, min(30, z))))
E = 0.95                                   # 노출 비율 (홀드아웃 5%)

def make(n):
    d = []
    for _ in range(n):
        x1, x2, x3 = random.random(), int(random.random() < .15), int(random.random() < .30)
        p0 = SIG(-4.6 + 2.2 * x1 + 1.4 * x2 - 0.4 * x3)
        tau = 0.013 * x1 - 0.010 * x2      # 참 증분: 관심도는 +, 최근 구매자는 -
        p1 = min(max(p0 + tau, 0.0002), .99)
        t = int(random.random() < E)
        y = int(random.random() < (p1 if t else p0))
        d.append(([1.0, x1, x2, x3], t, y, tau))
    return d

def sgd(rows, link, epochs=25, lr0=.5, lam=1e-6, b0=0.0):
    w = [b0] + [0.0] * (len(rows[0][0]) - 1); rows = rows[:]; n = len(rows); k = 0
    for _ in range(epochs):
        random.shuffle(rows)
        for x, y in rows:
            k += 1; lr = lr0 / (1 + 3 * k / n)
            e = link(sum(a * b for a, b in zip(w, x))) - y
            for j in range(len(w)): w[j] -= lr * (e * x[j] + lam * w[j])
    return w

ident = lambda z: z
dot = lambda w, x: sum(a * b for a, b in zip(w, x))
def logit(rows):
    m = sum(y for _, y in rows) / len(rows)
    return sgd(rows, SIG, b0=math.log(m / (1 - m)))

D = make(40000)
tr = [r for r in D if r[1] == 1]; ct = [r for r in D if r[1] == 0]
ws = logit([(x + [float(t)], y) for x, t, y, _ in D])          # S-learner
s_hat = [SIG(dot(ws, x + [1.0])) - SIG(dot(ws, x + [0.0])) for x, _, _, _ in D]
w1 = logit([(x, y) for x, t, y, _ in tr]); w0 = logit([(x, y) for x, t, y, _ in ct])
t_hat = [SIG(dot(w1, x)) - SIG(dot(w0, x)) for x, _, _, _ in D]  # T-learner
a1 = sgd([(x, y - SIG(dot(w0, x))) for x, t, y, _ in tr], ident, lr0=.2)
a0 = sgd([(x, SIG(dot(w1, x)) - y) for x, t, y, _ in ct], ident, lr0=.2)
x_hat = [E * dot(a0, x) + (1 - E) * dot(a1, x) for x, _, _, _ in D]  # X-learner

true = [r[3] for r in D]
def corr(a, b):
    ma, mb = sum(a) / len(a), sum(b) / len(b)
    ca = [v - ma for v in a]; cb = [v - mb for v in b]
    return sum(p * q for p, q in zip(ca, cb)) / math.sqrt(sum(v * v for v in ca) * sum(v * v for v in cb))
neg = sum(1 for v in true if v < 0)
print(f"노출 {len(tr):,}명 · 홀드아웃 {len(ct):,}명 · 참 평균 증분 {sum(true)/len(true)*100:+.3f}%p · 참 음수 {neg:,}명")
print(f"대조군 전환 {sum(r[2] for r in ct):,}건 · 노출군 전환 {sum(r[2] for r in tr):,}건")
print(f"S-learner 처치 계수 {ws[-1]:+.3f}")
for name, h in (("S-learner", s_hat), ("T-learner", t_hat), ("X-learner", x_hat), ("참값(상한)", true)):
    top = sorted(range(len(h)), key=lambda i: -h[i])[:len(h) // 5]
    mae = sum(abs(v - t0) for v, t0 in zip(h, true)) / len(h)
    print(f"{name} | 평균 {sum(h)/len(h)*100:+.3f}%p | 상관 {corr(h, true):+.3f} | 오차 {mae*100:.3f}%p "
          f"| 상위20% 참증분 {sum(true[i] for i in top)/len(top)*100:+.3f}%p "
          f"| 음수판정 {sum(1 for v in h if v < 0):,}명")

# 출력:
# 노출 38,026명 · 홀드아웃 1,974명 · 참 평균 증분 +0.500%p · 참 음수 4,556명
# 대조군 전환 77건 · 노출군 전환 1,903건
# S-learner 처치 계수 +0.240
# S-learner | 평균 +0.900%p | 상관 +0.105 | 오차 0.451%p | 상위20% 참증분 +0.589%p | 음수판정 0명
# T-learner | 평균 +1.248%p | 상관 +0.905 | 오차 1.564%p | 상위20% 참증분 +1.132%p | 음수판정 5,963명
# X-learner | 평균 +0.479%p | 상관 +0.911 | 오차 1.205%p | 상위20% 참증분 +1.105%p | 음수판정 8,565명
# 참값(상한) | 평균 +0.500%p | 상관 +1.000 | 오차 0.000%p | 상위20% 참증분 +1.144%p | 음수판정 4,556명
```

마지막 줄이 상한선이다. 참값을 그대로 알고 상위 20%를 고르면 그 집단의 평균 증분이 +1.144%p다. 전체 평균 +0.500%p의 2.3배다. 세 학습법이 이 상한에 얼마나 붙었는지가 성적표다.

---

## 6. 셋은 각각 어디서 무너지나

**S-learner는 처치 효과가 작으면 그 피처를 거의 안 쓴다. T-learner는 대조군이 작으면 값의 크기가 어긋난다.**

5절 출력의 S-learner 줄부터 보자. 참값과의 상관이 +0.105다. 사실상 순서를 못 맞힌다. 상위 20%를 골라도 그 집단의 참 증분은 +0.589%p다. 전체 평균 +0.500%p보다 겨우 조금 높다. 상한선 +1.144%p의 절반에 그친다. 골라 봐야 안 고른 것과 큰 차이가 없다.

이유는 구조에 있다. S-learner는 노출 여부를 피처 하나로 받는다. 그 피처의 계수는 +0.240 하나뿐이다. 노출 여부와 다른 피처를 곱한 피처를 따로 넣지 않으면, 이 계수가 모든 사람에게 똑같이 곱해진다. 그러면 추정 증분이 기저 확률의 함수로만 정해진다. 사람마다 다른 증분을 표현할 수 없다. 음수 판정이 0명인 것도 그래서다. 처치 계수가 양수인 한 누구에게도 음수가 안 나온다. 참 음수는 4,556명인데 한 명도 못 잡는다.

문제는 이 계수가 작을수록 심해진다는 것이다. 전환율 2.50%에서 3.00%는 로그오즈에서 아주 작은 이동이다. 정규화를 걸어 둔 모델은 그런 작은 신호를 잡음으로 본다. 그래서 계수를 0 쪽으로 민다. 피처가 수백 개인 실제 pCVR 모델에서는 노출 피처가 아예 안 쓰이는 일도 생긴다. 효과가 클수록 S-learner가 잘 돈다. 정작 증분 모델이 필요한 상황은 효과가 작을 때다.

:::deep 더 깊이 — 로그오즈에서 0.50%p 는 얼마나 작은가
전환율 2.50%를 로그오즈로 옮기면 -3.664다. 3.00%는 -3.476이다. 차이는 0.187뿐이다. 5절 코드가 기저 확률에 쓴 다른 계수는 2.2·1.4·-0.4 다. 처치 계수는 그것들보다 한 자리 작다. 정규화 항은 계수의 크기에 벌점을 매긴다. 그래서 이렇게 작은 계수가 가장 먼저 0 쪽으로 밀린다. 5절 출력의 처치 계수 +0.240 이 그 크기대다.
:::

T-learner는 순서는 잘 맞힌다. 상관 +0.905, 상위 20% 참증분 +1.132%p로 상한선 +1.144%p에 거의 붙었다. 무너지는 곳은 값의 크기다. 추정 평균이 +1.248%p로 참값 +0.500%p의 2.5배다. 대조군 1,974명 안의 전환은 77건뿐이다. 노출군은 1,903건이니 24.7배 차이다. 그 적은 데이터로 만든 대조군 모델이 통째로 흔들린 결과다. 평균 오차도 1.564%p로 셋 중 가장 크다.

X-learner는 그 자리를 메운다. 추정 평균 +0.479%p는 참값 +0.500%p와 거의 같다. 평균 오차 1.205%p도 T-learner보다 작다. 대조군 사람의 가짜 라벨을 만들 때 노출군 모델의 예측을 쓰기 때문이다. 그 모델은 38,026명으로 학습했다. 대신 음수를 8,565명으로 과하게 잡았다. 참 음수는 4,556명이니 절반가량이 헛짚은 것이다. 셋 중 무엇도 모든 항목에서 이기지 않는다.

| 학습법 | 강한 곳 | 무너지는 조건 | 5절 실측 |
|---|---|---|---|
| S-learner | 파이프라인 재사용, 데이터 효율 | 처치 효과가 작을 때, 상호작용 항이 없을 때 | 상관 +0.105 · 음수 0명 |
| T-learner | 처치 효과 모양에 제약 없음 | 대조군이 작을 때 수준이 어긋남 | 평균 +1.248%p (참값의 2.5배) |
| X-learner | 대조군이 작아도 수준이 안정 | 2단계라 잡음이 겹쳐 쌓임 | 평균 +0.479%p · 음수 과잉 8,565명 |

한 가지 더 중요한 것이 5절 출력에 숨어 있다. **평균 오차가 가장 작은 것은 S-learner(0.451%p)다.** 순서를 거의 못 맞히는 그 모델이 오차로는 1등이다. 모두에게 비슷한 값을 찍으면 오차는 작아지기 때문이다. 오차나 정확도로 증분 모델을 고르면 가장 쓸모없는 모델이 뽑힌다. 다음 절이 그래서 필요하다.

---

## 7. 정확도로는 못 잰다 — 위에서부터 잘라 가며 더한다

**증분에는 정답 라벨이 없으니 개인 단위 정확도를 못 잰다. 대신 상위 몇 %를 골랐을 때 실제로 얼마가 늘었는지를 잰다.**

분류 모델의 정확도는 보통 AUC 로 잰다. 정답이 1인 사람의 점수가 0인 사람보다 높은지를 보는 값이다. 그런데 증분 모델의 정답은 개인 단위로 존재하지 않는다. 억지로 전환 여부를 정답으로 놓고 AUC 를 재면 어떻게 되나. 그건 증분 모델이 아니라 pCVR 모델의 성적표가 된다.

그래서 채점을 다른 방식으로 한다. 모델 점수 높은 순으로 사람을 줄 세운다. 위에서부터 잘라 가며 그 구간의 노출군 전환에서 대조군 전환을 뺀다. 그 누적값을 세로축에 그린다. 가로축은 누적 도달 인원이다. 이 그림을 uplift 곡선이라 부른다. 대조군과 노출군 크기가 다르면 대조군 쪽을 비율로 보정한다. 그 보정을 넣은 것이 **Qini 곡선**이다. 4절 표는 두 군 크기가 같아 보정이 필요 없다.

곡선을 한 숫자로 줄이면 모델끼리 비교할 수 있다. 곡선 아래 면적을 재면 된다. 그 점수를 **AUUC**라 부른다. 아무 순서로나 고르면 곡선이 직선이 되고 정규화한 면적이 0.5다. 거기서 0.5를 뺀 값이 **Qini 계수**다. 0보다 크면 순서를 매긴 값이 있었다는 뜻이다.

아래 코드는 4절의 여섯 세그먼트로 두 곡선을 그린다. 같은 데이터에서 AUC 도 같이 잰다.

```python
# Qini 곡선·AUUC 와 AUC 를 같은 가데이터로 나란히 계산한다.
# (세그먼트, 노출군 인원=대조군 인원, 노출군 전환, 대조군 전환)
SEG = [
    ("A 장바구니 담고 미구매", 25000, 3000, 2500),
    ("B 상품 상세 3회 이상",   30000, 1500, 1050),
    ("C 브랜드 검색 유입",     50000, 4500, 4350),
    ("D 앱 설치 30일 내",      50000, 1000,  600),
    ("E 저관여 열람",         200000, 1550,  870),
    ("F 최근 구매 3일 내",     45000,  450,  630),
]
TOT_N = sum(s[1] for s in SEG)
TOT_INC = sum(s[2] - s[3] for s in SEG)

def curve(order):                      # 누적 도달 인원 → 누적 증분 전환
    pts, x, y = [(0, 0)], 0, 0
    for name in order:
        n, t, c = next((s[1], s[2], s[3]) for s in SEG if s[0].startswith(name))
        x, y = x + n, y + (t - c)
        pts.append((x, y))
    return pts

def area(pts):                          # 사다리꼴 적분
    return sum((pts[i+1][0] - pts[i][0]) * (pts[i][1] + pts[i+1][1]) / 2
               for i in range(len(pts) - 1))

def auc(score):                         # 노출군에서 '전환 여부'를 얼마나 잘 가르나
    cells = sorted((score[s[0][0]], s[2], s[1] - s[2]) for s in SEG)
    pos = sum(c[1] for c in cells); neg = sum(c[2] for c in cells)
    hit, below = 0.0, 0
    for _, p, n in cells:              # 점수 오름차순
        hit += p * (below + n / 2)     # 같은 칸 안은 동점 → 0.5점
        below += n
    return hit / (pos * neg)

up_order = ["A", "B", "D", "E", "C", "F"]      # 실제 uplift 내림차순
cv_order = ["A", "C", "B", "D", "F", "E"]      # 노출군 전환율(pCVR) 내림차순
for label, order in (("uplift 순", up_order), ("pCVR 순", cv_order)):
    pts = curve(order)
    norm = area(pts) / (TOT_N * TOT_INC)
    print(f"[{label}] 누적점 " + " → ".join(f"({x:,},{y:+,})" for x, y in pts))
    print(f"   AUUC(정규화) {norm:.4f} · 랜덤 0.5000 · Qini 계수 {norm - 0.5:+.4f}")
    print(f"   최고점 {max(y for _, y in pts):+,}건 (도달 {max(pts, key=lambda p: p[1])[0]:,}명)")

pcvr = {s[0][0]: s[2] / s[1] for s in SEG}
uplf = {s[0][0]: (s[2] - s[3]) / s[1] for s in SEG}
print(f"\nAUC(전환 예측) — pCVR 점수 {auc(pcvr):.4f} vs uplift 점수 {auc(uplf):.4f}")
print(f"전체 증분 {TOT_INC:,}건 · 도달 {TOT_N:,}명")

# 출력:
# [uplift 순] 누적점 (0,+0) → (25,000,+500) → (55,000,+950) → (105,000,+1,350) → (305,000,+2,030) → (355,000,+2,180) → (400,000,+2,000)
#    AUUC(정규화) 0.7785 · 랜덤 0.5000 · Qini 계수 +0.2785
#    최고점 +2,180건 (도달 355,000명)
# [pCVR 순] 누적점 (0,+0) → (25,000,+500) → (75,000,+650) → (105,000,+1,100) → (155,000,+1,500) → (200,000,+1,320) → (400,000,+2,000)
#    AUUC(정규화) 0.6521 · 랜덤 0.5000 · Qini 계수 +0.1521
#    최고점 +2,000건 (도달 400,000명)
#
# AUC(전환 예측) — pCVR 점수 0.7851 vs uplift 점수 0.4463
# 전체 증분 2,000건 · 도달 400,000명
```

두 지표가 정반대를 가리킨다. AUC로 재면 pCVR 점수가 0.7851, uplift 점수가 0.4463이다. 정확도 기준으로는 pCVR 쪽이 압도적으로 낫다고 나온다. Qini 계수로 재면 uplift 점수가 +0.2785, pCVR 점수가 +0.1521이다. 순서가 뒤집힌다. 어느 지표를 보느냐로 배포할 모델이 바뀐다.

:::deep 더 깊이 — 면적을 어떻게 정규화했나
코드의 `area` 는 누적점들을 사다리꼴로 이어 붙여 적분한다. 그 값의 단위는 인원 곱하기 전환 건수다. 그대로는 캠페인 크기가 다르면 비교가 안 된다. 그래서 전체 도달 인원과 전체 증분의 곱으로 나눈다. 코드의 `area(pts) / (TOT_N * TOT_INC)` 가 그 줄이다. 나눈 뒤에는 캠페인 크기와 무관한 값이 된다. 무작위 순서는 0.5다. 이 글의 uplift 순은 0.7785, pCVR 순은 0.6521이다. 여기서 0.5를 뺀 것이 Qini 계수다. 두 군의 크기가 다를 때는 보정을 먼저 한다. 대조군 전환에 노출군 인원 나누기 대조군 인원을 곱한다. 그 뒤 같은 계산을 한다.
:::

<figure style="text-align:center; margin:2rem 0;">
<div class="table-wrapper">
<svg viewBox="0 0 620 360" role="img" aria-label="가로축은 누적 도달 인원, 세로축은 누적 증분 전환인 Qini 곡선. uplift 순으로 고르면 35만5천 명에서 2180건으로 최고점을 찍고, pCVR 순으로 고르면 같은 자리에서 훨씬 아래에 있으며, 랜덤은 직선이다." style="width:100%; min-width:620px; height:auto; font-family:var(--font-sans)">
<line x1="60" y1="300" x2="592" y2="300" style="stroke:var(--rule); stroke-width:1.5"/>
<line x1="60" y1="30" x2="60" y2="300" style="stroke:var(--rule); stroke-width:1.5"/>
<line x1="60" y1="63.6" x2="592" y2="63.6" style="stroke:var(--rule2); stroke-width:1; stroke-dasharray:3 4"/>
<text class="chart-label" x="52" y="68" text-anchor="end" style="font-size:12.5px; fill:var(--ink3)">2,000</text>
<text class="chart-label" x="52" y="45" text-anchor="end" style="font-size:12.5px; fill:var(--ink3)">2,200</text>
<text class="chart-label" x="52" y="305" text-anchor="end" style="font-size:12.5px; fill:var(--ink3)">0</text>
<text class="chart-label" x="60" y="322" text-anchor="middle" style="font-size:12.5px; fill:var(--ink3)">0</text>
<text class="chart-label" x="196.5" y="322" text-anchor="middle" style="font-size:12.5px; fill:var(--ink3)">105,000</text>
<text class="chart-label" x="320" y="322" text-anchor="middle" style="font-size:12.5px; fill:var(--ink3)">200,000</text>
<text class="chart-label" x="580" y="322" text-anchor="middle" style="font-size:12.5px; fill:var(--ink3)">400,000</text>
<text class="chart-label" x="326" y="344" text-anchor="middle" style="font-size:12.5px; fill:var(--ink2)">누적 도달 인원(노출군)</text>
<text class="chart-label" x="18" y="170" text-anchor="middle" transform="rotate(-90 18 170)" style="font-size:12.5px; fill:var(--ink2)">누적 증분 전환</text>
<polyline points="60,300 580,63.6" style="fill:none; stroke:var(--grey); stroke-width:1.6; stroke-dasharray:6 5"/>
<polyline points="60,300 92.5,240.9 157.5,223.2 196.5,170 261.5,122.7 320,144 580,63.6" style="fill:none; stroke:var(--oxide); stroke-width:2.2; stroke-dasharray:9 4"/>
<polyline points="60,300 92.5,240.9 131.5,187.7 196.5,140.5 456.5,60.1 521.5,42.4 580,63.6" style="fill:none; stroke:var(--navy); stroke-width:2.6"/>
<circle cx="521.5" cy="42.4" r="4.5" style="fill:var(--navy)"/>
<text class="chart-label" x="513" y="34" text-anchor="end" style="font-size:12.5px; fill:var(--navy)">최고점 2,180건 (355,000명)</text>
<circle cx="196.5" cy="140.5" r="4" style="fill:var(--navy)"/>
<circle cx="196.5" cy="170" r="4" style="fill:var(--oxide)"/>
<line x1="196.5" y1="140.5" x2="196.5" y2="170" style="stroke:var(--ink3); stroke-width:1.2"/>
<text class="chart-label" x="204" y="163" style="font-size:12.5px; fill:var(--ink2)">1,350건 대 1,100건</text>
<line x1="360" y1="250" x2="392" y2="250" style="stroke:var(--navy); stroke-width:2.6"/>
<text class="chart-label" x="400" y="254" style="font-size:12.5px; fill:var(--ink2)">uplift 순 (Qini 0.2785)</text>
<line x1="360" y1="270" x2="392" y2="270" style="stroke:var(--oxide); stroke-width:2.2; stroke-dasharray:9 4"/>
<text class="chart-label" x="400" y="274" style="font-size:12.5px; fill:var(--ink2)">pCVR 순 (Qini 0.1521)</text>
<line x1="360" y1="290" x2="392" y2="290" style="stroke:var(--grey); stroke-width:1.6; stroke-dasharray:6 5"/>
<text class="chart-label" x="400" y="294" style="font-size:12.5px; fill:var(--ink2)">랜덤 (Qini 0)</text>
</svg>
</div>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">두 점을 잇는 짧은 세로선이 105,000명 지점이다. 그 간격 250건이 곧 매출 차이다.</figcaption>
</figure>

곡선에서 눈여겨볼 자리가 두 곳이다. 하나는 오른쪽 끝이다. 40만 명 전원에게 광고하면 두 곡선 다 2,000건에서 만난다. 순서를 아무리 잘 매겨도 전원에게 뿌리면 의미가 없다는 뜻이다. 증분 모델의 값은 "어디서 멈출 것인가"와 짝을 이룰 때만 생긴다.

다른 하나는 uplift 곡선의 최고점이다. 355,000명에서 2,180건으로 정점을 찍는다. 나머지 45,000명(F 세그먼트)을 넣으면 2,000건으로 떨어진다. F를 빼면 증분이 180건 늘고 광고비 ₩5,400,000도 아낀다. 광고를 덜 해서 매출이 느는 구간이 실제로 존재한다. Qini 곡선은 그 지점을 눈으로 짚어 준다.

---

## 8. 대조군을 몇 %로 둘 것인가

**대조군을 키우면 측정이 정확해지고 매출을 포기한다. 줄이면 반대다. 그 사이 어디를 고를지가 설계다.**

여기서는 규모를 바꾼다. 1~7절은 세그먼트별로 쪼개 보려고 80만 명을 50대 50으로 크게 갈랐다. 실무의 상시 홀드아웃은 캠페인 하나 안에서 몇 %를 뗄지의 문제다. 대상 20만 명짜리 캠페인 하나를 놓고 계산해 보자.

대조군을 키우면 두 가지가 동시에 일어난다. 먼저 대조군 쪽 추정이 안정돼 검정력이 오른다. 검정력은 진짜 차이가 있을 때 그것을 유의하다고 잡아낼 확률이다. 동시에 그 사람들에게 광고를 안 하니 얻을 수 있었던 전환을 못 얻는다. 광고비는 그만큼 안 쓴다.

```python
# 홀드아웃 비율 하나만 바꿔 가며 검정력과 기회비용을 같이 본다 (가데이터).
from math import sqrt, erf

N = 200_000          # 캠페인 하나의 대상 인원
P0 = 0.0250          # 대조군 전환율 (광고를 안 봤을 때)
P1 = 0.0300          # 노출군 전환율 (광고를 봤을 때)
Z_ALPHA = 1.96       # 양측 5%
COST = 120           # 1명 도달 광고비(원)

def phi(z):                      # 표준정규 누적분포
    return 0.5 * (1 + erf(z / sqrt(2)))

print("홀드아웃 | 대조군 | 노출군 | 표준오차 | z값 | 검정력 | 못 얻은 증분 | 아낀 광고비")
for f in (0.01, 0.02, 0.05, 0.10, 0.20, 0.50):
    n_c = int(N * f)
    n_t = N - n_c
    se = sqrt(P1 * (1 - P1) / n_t + P0 * (1 - P0) / n_c)
    z = (P1 - P0) / se
    power = phi(z - Z_ALPHA)     # 진짜 차이를 유의하다고 잡아낼 확률
    lost = n_c * (P1 - P0)       # 대조군에게 광고를 안 해서 못 얻은 전환
    saved = n_c * COST           # 그 대신 안 쓴 광고비
    print(f"{f*100:5.0f}% | {n_c:6,} | {n_t:7,} | {se:.6f} | {z:5.2f} | "
          f"{power*100:5.1f}% | {lost:5.0f}건 | {saved:9,}원")

# 출력:
# 홀드아웃 | 대조군 | 노출군 | 표준오차 | z값 | 검정력 | 못 얻은 증분 | 아낀 광고비
#     1% |  2,000 | 198,000 | 0.003512 |  1.42 |  29.6% |    10건 |   240,000원
#     2% |  4,000 | 196,000 | 0.002498 |  2.00 |  51.6% |    20건 |   480,000원
#     5% | 10,000 | 190,000 | 0.001610 |  3.11 |  87.4% |    50건 | 1,200,000원
#    10% | 20,000 | 180,000 | 0.001175 |  4.26 |  98.9% |   100건 | 2,400,000원
#    20% | 40,000 | 160,000 | 0.000890 |  5.62 | 100.0% |   200건 | 4,800,000원
#    50% | 100,000 | 100,000 | 0.000731 |  6.84 | 100.0% |   500건 | 12,000,000원
```

1%는 쓰면 안 되는 값이다. 진짜로 0.50%p 차이가 있어도 그걸 유의하다고 잡아낼 확률이 29.6%다. 열 번 재면 일곱 번은 "차이 없음"이 나온다. 그 결론을 근거로 캠페인을 끄면 잘 되던 캠페인을 끄는 것이다. 표본이 모자라 실험이 실패하는 이 패턴은 [랜덤 실험(RCT)](post.html?id=rct-randomized-experiment)의 3절에 자세히 있다.

5%부터 쓸 만해진다. 검정력 87.4%에 못 얻은 전환은 50건이다. 10%면 검정력 98.9%인데 못 얻은 전환이 100건으로 두 배가 된다. 5%에서 10%로 올려 얻는 것은 11.5%p의 검정력이다. 잃는 것은 전환 50건이다. 20%로 더 올리면 검정력은 1.1%p밖에 안 오른다. 그런데 전환은 100건을 더 잃는다. 검정력은 위로 갈수록 포화된다. 기회비용은 계속 선형으로 는다. 그래서 실무의 답이 대개 5~10% 사이에 있다.

:::deep 더 깊이 — 검정력을 어떤 식으로 구했나
두 비율의 차이를 볼 때 표준오차는 두 군의 분산을 더해 뿌리를 씌운 값이다.

$$SE = \sqrt{\frac{p_1(1-p_1)}{n_t} + \frac{p_0(1-p_0)}{n_c}}$$

여기서 $n_c$ 가 작으면 뒤쪽 항이 커진다. 대조군 2,000명일 때 표준오차가 0.003512였다. 100,000명일 때는 0.000731이다. 차이 0.50%p를 이 표준오차로 나눈 값이 $z$ 다. 검정력은 $\Phi(z - 1.96)$ 으로 계산했다. 1.96은 양측 5% 유의수준의 기준값이다. 코드의 `phi(z - Z_ALPHA)` 한 줄이 이 식이다.
:::

한 가지 더 챙길 것이 있다. 위 계산은 캠페인 전체 증분 하나만 잴 때의 값이다. 세그먼트별 증분을 따로 재려면 각 세그먼트 안에서 다시 검정력을 채워야 한다. 4절의 F 세그먼트는 노출군이 45,000명이었다. 여기에 5% 홀드아웃을 걸면 대조군이 2,250명이다. 그 안의 전환은 30건 남짓이다. 증분 모델 학습용 데이터를 모으려면 상시 홀드아웃을 계정 단위로 길게 유지하는 편이 낫다.

---

## 9. 실무 함정

**두 함정 다 3절 접기에 적은 등식을 깬다. 등식이 깨지면 뒤의 모든 계산이 무의미해진다.**

첫째는 오염이다. 대조군에게 이 캠페인 광고는 안 나간다. 그런데 같은 브랜드가 다른 채널에서 광고를 하고 있다. 검색광고, 다른 매체의 디스플레이, 오프라인 전단이 대조군에게도 닿는다. 그러면 대조군의 일부가 사실상 처치를 받은 셈이 된다.

대조군의 몇 %가 다른 경로로 같은 메시지에 닿았느냐를 오염률이라 하자. 참 증분은 2,000건 그대로다. 관측값만 줄어든다.

| 오염률 | 대조군 관측 CVR | 관측 uplift | 관측 증분 | 관측 증분 CPA |
|---|---|---|---|---|
| 0% | 2.50% | +0.50%p | 2,000건 | ₩24,000 |
| 10% | 2.55% | +0.45%p | 1,800건 | ₩26,667 |
| 20% | 2.60% | +0.40%p | 1,600건 | ₩30,000 |
| 30% | 2.65% | +0.35%p | 1,400건 | ₩34,286 |
| 50% | 2.75% | +0.25%p | 1,000건 | ₩48,000 |

오염률 30%면 관측 증분이 1,400건으로 참값의 70%다. 증분 CPA는 ₩24,000이 아니라 ₩34,286으로 보인다. 방향이 한쪽으로만 틀어진다는 점이 중요하다. 오염은 증분을 항상 실제보다 작게 보이게 한다. 그래서 잘 되고 있는 캠페인을 끄는 쪽으로 사람을 민다. 대조군을 잡을 때 그 캠페인만 막을지 브랜드 전체를 막을지 먼저 정해야 하는 이유가 이것이다.

둘째는 홀드아웃이 무작위가 아닌 경우다. 이건 오염보다 훨씬 나쁘다. 오염은 결과를 한쪽으로 줄일 뿐이다. 무작위가 아닌 대조군은 값을 아무 방향으로나 보낸다. 노출군 전환율 3.00%를 고정하고 대조군을 어떻게 뽑았느냐만 바꿔 보자.

| 대조군을 고른 방법 | 대조군 CVR | 관측 uplift | 참값(+0.50%p) 대비 |
|---|---|---|---|
| 로그인 ID 해시 끝 두 자리로 무작위 | 2.50% | +0.50%p | 그대로 |
| 최근 30일 미접속자로 채움 | 1.20% | +1.80%p | 3.6배 부풀림 |
| 광고를 클릭 안 한 사람을 대조군으로 씀 | 1.60% | +1.40%p | 2.8배 부풀림 |
| 입찰에서 진 요청을 대조군으로 씀 | 3.40% | -0.40%p | 부호가 뒤집힘 |

표의 두 번째와 세 번째 줄은 흔한 실수다. 대조군을 "광고 로그가 없는 사람"으로 정의하면 그 안에 활동이 적은 사람이 몰린다. 그 사람들은 광고가 있었어도 안 샀을 사람이다. 그래서 대조군 전환율이 낮게 나오고 증분이 부풀려진다. 네 번째 줄은 열린 RTB에서 나오는 형태다. 경매에서 진 요청은 경쟁이 치열했던 요청이다. 원래 구매 의향이 높은 지면이라는 뜻이다. 그걸 대조군으로 쓰면 대조군 전환율이 노출군보다 높아진다. 증분이 음수로 뒤집힌다.

세 가지 다 판정법은 같다. 홀드아웃을 정한 다음, 광고를 켜기 전 기간의 두 그룹 전환율을 비교해 보면 된다. 그 기간에는 아직 처치가 없으니 두 값이 같아야 한다. 다르면 배정이 무작위가 아니다. [랜덤 실험(RCT)](post.html?id=rct-randomized-experiment)의 A/A 테스트가 같은 검사다.

---

## 10. 두 무대에서 무엇이 갈리나

**증분을 재는 논리는 양쪽이 같다. 다른 것은 노출을 막을 수 있느냐 하나다.**

이 글의 계산은 어느 무대에서나 같다. 뺄셈도 같고 Qini 곡선도 같다. 갈리는 것은 8절의 홀드아웃을 실제로 만들 수 있느냐다. 대조군에게 광고가 안 나가게 하려면 노출 결정권이 있어야 한다. 그 결정권의 위치가 두 무대를 가른다.

### 담장 안에서는 상시 홀드아웃이 기본 설비다 [무대: 닫힌 생태계]

로그인 ID가 있으니 홀드아웃 판정이 매번 같은 답을 낸다. ID 해시의 나머지가 정해진 구간에 들면 이 캠페인에서 제외한다. 같은 사람이 폰과 PC를 오가도 판정이 흔들리지 않는다. 이 판정을 광고 요청을 받는 자리에서 하면 노출 자체가 안 나간다. 판정 결과를 노출 로그에 그대로 남기면 나중에 두 그룹을 다시 맞출 필요도 없다.

규모도 문제가 안 된다. 하루 노출 로그가 2.28억 줄이면 5% 홀드아웃만으로도 세그먼트별 대조군이 충분히 쌓인다. 실제 운영에서는 캠페인마다 홀드아웃을 새로 잡지 않는다. 계정 단위로 상시 홀드아웃을 길게 유지한다. 그래야 8절 마지막에 적은 세그먼트별 검정력이 채워진다. 5절의 X-learner를 학습할 대조군 데이터도 모인다.

대신 값을 치른다. 상시 홀드아웃은 그 사람들에게 계속 광고를 안 보낸다는 뜻이다. 8절 표의 "못 얻은 증분"이 매일 쌓인다. 그리고 홀드아웃에 들어간 사람에게도 다른 캠페인 광고는 나간다. 9절의 오염이 회사 안에서 생기는 것이다. 캠페인 단위 홀드아웃인지 브랜드 단위인지 계정 단위인지를 먼저 합의해야 숫자가 말이 된다.

### 열린 RTB에서는 노출을 막을 수 없다 [무대: 열린 RTB]

광고주는 입찰만 넣는다. 실제로 누구에게 보일지는 경매가 정한다. "이 사람에게는 보이지 마라"를 지시해도 소용이 없을 수 있다. 그 사람이 다른 광고 구매 시스템(DSP)을 통해 같은 광고를 볼 수 있다. 그래서 홀드아웃을 만드는 방식 자체가 달라진다.

가장 깨끗한 우회가 유령 입찰(ghost bidding)이다. 대조군으로 뽑힌 사람의 요청에도 입찰가를 평소대로 계산한다. 다만 실제로는 응찰하지 않는다. "이 값이면 이겼을 것"이라는 판정만 기록한다. 그 기록이 대조군의 노출 자격을 만든다. 이 방식은 응찰과 판정을 같은 로직으로 처리해야 성립한다. 그래서 거래소나 광고 서버가 지원해야 쓸 수 있다.

지원이 없으면 공익광고 대조나 지역 단위 실험으로 내려간다. 둘 다 [랜덤 실험(RCT)](post.html?id=rct-randomized-experiment)의 8절에서 다룬 방식이다. 그마저 안 되면 준실험으로 간다. 옆 그룹의 변화를 빌려 쓰는 [이중차분법(DiD)](post.html?id=difference-in-differences)이 대표적이다. 이 무대에서 절대 하면 안 되는 것이 9절 표의 마지막 줄이다. 낙찰 여부는 무작위가 아니라 경매 결과다. 진 요청을 대조군으로 쓰면 부호까지 뒤집힌다. 낙찰가와 경쟁 상황이 왜 관측되지 않는지는 [bid shading과 절단된 데이터](post.html?id=bid-shading-censored)에 있다.

---

## 한눈 정리

| 개념 | 뜻 | 이 글에서 본 숫자 | 핵심 |
|---|---|---|---|
| 증분(uplift) | 노출 전환율 빼기 비노출 전환율 | 3.00% - 2.50% = +0.50%p | 리포트 전환 12,000건 중 2,000건만 광고가 만든 것 |
| 네 부류 | 설득 가능·확실 구매·청개구리·무관심 | 6,400 / 17,600 / 2,400 / 773,600명 | 광고비가 값을 하는 곳은 0.8%뿐 |
| 반사실 | 개인의 안 본 세계는 관측 불가 | 개인 증분은 +1·0·-1 중 하나 | 개인은 못 재고 무작위 그룹으로 푼다 |
| 순위 뒤집힘 | pCVR 순 vs uplift 순 | 리포트 9,000건 대 5,500건, 증분 1,100건 대 1,350건 | 리포트가 63.6% 좋은 쪽이 매출은 22.7% 나쁘다 |
| S-learner | 처치를 피처로, 모델 1개 | 상관 +0.105, 음수 판정 0명 | 효과가 작으면 그 피처를 거의 안 쓴다 |
| T-learner | 두 모델의 차이 | 평균 +1.248%p (참값의 2.5배) | 대조군이 작으면 수준이 어긋난다 |
| X-learner | 상대 모델로 빈칸을 메움 | 평균 +0.479%p (참값 +0.500%p) | 수준은 안정, 음수는 8,565명으로 과잉 |
| 평가 지표 | 정확도(AUC) 대신 Qini 곡선·AUUC | AUC 0.7851 대 0.4463, Qini 0.1521 대 0.2785 | 두 지표가 정반대를 가리킨다 |
| 곡선 최고점 | 광고를 멈출 지점 | 355,000명에서 2,180건 | 45,000명을 빼면 증분 180건이 는다 |
| 홀드아웃 비율 | 검정력과 기회비용의 절충 | 1% 검정력 29.6%, 5% 87.4%, 10% 98.9% | 검정력은 포화되고 비용은 선형으로 는다 |
| 오염 | 대조군이 다른 채널로 노출됨 | 30% 오염이면 관측 증분 1,400건 | 증분을 항상 작게 보이게 한다 |
| 비랜덤 홀드아웃 | 배정이 무작위가 아님 | 미접속자 대조군은 3.6배 부풀림 | 부호까지 뒤집힐 수 있다 |

---

## 헷갈리기 쉬운 점

- **전환이 많이 나온 세그먼트가 좋은 세그먼트가 아니다.** 4절의 C는 전환 4,500건을 냈지만 그중 광고가 만든 것은 150건이다. 리포트의 전환 수는 그 사람이 원래 살 사람이었는지를 구분하지 않는다.
- **증분이 음수인 세그먼트는 예산을 줄일 곳이 아니라 뺄 곳이다.** F 세그먼트를 아예 빼면 증분이 2,000건에서 2,180건으로 는다. 광고비도 ₩5,400,000 아낀다.
- **pCVR 모델을 잘 만들어도 증분 모델이 되지 않는다.** 둘은 다른 것을 맞힌다. pCVR은 "광고를 봤을 때 살 확률", 증분은 "광고 때문에 늘어난 확률"이다. 확실 구매가 많은 인벤토리일수록 둘이 크게 갈린다.
- **AUC가 높은 증분 모델은 오히려 의심해야 한다.** 7절에서 AUC 0.7851짜리 점수의 Qini 계수가 더 낮았다. AUC가 재는 것은 전환 예측력이지 증분 예측력이 아니다.
- **오차(MAE)가 작다고 좋은 증분 모델이 아니다.** 5절에서 오차 1등은 S-learner(0.451%p)였는데 상관은 +0.105로 꼴찌였다. 모두에게 같은 값을 찍으면 오차는 작아진다.
- **홀드아웃 1%는 홀드아웃이 없는 것과 크게 다르지 않다.** 검정력 29.6%면 진짜 효과의 70%를 놓친다. "차이 없음"이라는 결론이 근거가 되지 못한다.
- **오염과 비랜덤 배정은 다른 사고다.** 오염은 증분을 항상 작게 만들고, 비랜덤 배정은 아무 방향으로나 보낸다. 후자는 부호까지 뒤집는다.
- **증분 모델은 "어디서 멈출까"와 짝일 때만 값이 있다.** 40만 명 전원에게 광고하면 어떤 순서로 골랐든 결과는 2,000건으로 같다.

---

## 더 깊이 보기

- 상관과 인과가 왜 다른지, 반사실이 무엇인지 → [인과추론 입문](post.html?id=causal-inference-101)
- 무작위 배정과 표본 크기·검정력의 기초 → [랜덤 실험(RCT)](post.html?id=rct-randomized-experiment)
- 전환의 공을 규칙으로 나누는 법과 그 한계 → [어트리뷰션 입문](post.html?id=attribution-basics)
- 전환 확률 모델 자체를 만드는 법 → [pCVR 모델링](post.html?id=pcvr-modeling)
- 실험을 못 할 때 옆 그룹을 빌리는 법 → [이중차분법(DiD)](post.html?id=difference-in-differences)
- 모델 교체 실험을 설계하는 법 → [모델 A/B 테스트](post.html?id=model-ab-testing)
- 세그먼트를 나누는 기준과 방법 → [오디언스 세그멘테이션](post.html?id=audience-segmentation)
- 낙찰가가 왜 관측되지 않는가 → [bid shading과 절단된 데이터](post.html?id=bid-shading-censored)
