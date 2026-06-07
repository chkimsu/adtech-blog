장학금이 졸업률을 올릴까요? 성적 상위권에게 장학금을 줬다고 합시다. 장학생들이 졸업을 잘했어요. 그런데 장학금 덕분인가요, 아니면 **원래 공부 잘하는 학생들**이라 어차피 졸업할 사람들이었나요? 또 선택편향이에요.

그런데 장학금 기준이 "80점 이상"이라면, 아주 영리한 트릭을 쓸 수 있습니다. **79점 학생과 80점 학생을 비교**하는 거예요. 둘은 실력이 사실상 똑같습니다. 1점 차이는 거의 운이죠. 그런데 한 명은 장학금을 받고, 한 명은 못 받았어요. 거의 실험에 가까운 비교가 생긴 겁니다.

이게 **회귀불연속(RDD, Regression Discontinuity Design)**입니다. 어떤 기준선(컷오프)에서 처치가 갈릴 때, 그 경계를 현미경처럼 들여다보는 방법이에요.

> 한 줄 비유: 키 180cm 컷으로 농구부를 뽑으면, 179cm와 181cm는 사실상 같은 사람. 둘의 차이라면 원인은 '농구부' 하나뿐이다.

---

## 1. 컷오프가 만드는 자연 실험

핵심 재료는 **연속적인 기준 점수**(running variable)와 **칼같은 컷오프**입니다. 점수가 컷오프를 넘으면 처치를 받고, 못 넘으면 안 받아요.

- 컷오프에서 **한참 떨어진** 사람들(50점 vs 95점)은 당연히 다릅니다.
- 하지만 컷오프 **바로 근처** 사람들(79점 vs 80점)끼리는 거의 똑같아요.

경계 근처에선 누가 80점이고 누가 79점인지가 거의 **운**으로 갈립니다. 컨디션, 찍은 문제 하나, 채점 오차 같은 것들요. 그래서 경계 바로 양옆은 "처치만 다른 쌍둥이"가 됩니다. 자연이 우리 대신 작은 랜덤 실험을 깔아준 셈이에요.

---

## 2. 그림으로 — 경계에서 점프

경계를 중심으로 결과를 그려보면, RDD의 직관이 한눈에 들어옵니다.

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 640 340" role="img" aria-label="가로축은 시험 점수, 세로축은 졸업률. 합격컷에서 졸업률이 위로 뚝 점프한다. 그 점프의 크기가 장학금의 효과다." style="width:100%; max-width:600px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="rdd-arr" markerWidth="9" markerHeight="9" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" style="fill:var(--accent-secondary)"/></marker>
</defs>
<line x1="58" y1="300" x2="610" y2="300" style="stroke:var(--border-color); stroke-width:1"/>
<line x1="60" y1="40" x2="60" y2="300" style="stroke:var(--border-color); stroke-width:1"/>
<line x1="330" y1="44" x2="330" y2="306" style="stroke:var(--text-muted); stroke-width:1.5; stroke-dasharray:4 4"/>
<text x="330" y="36" text-anchor="middle" style="font-size:12px; fill:var(--text-muted)">합격컷 (80점)</text>
<text x="40" y="48" text-anchor="middle" style="font-size:11px; fill:var(--text-muted)">졸업률</text>
<text x="600" y="320" text-anchor="end" style="font-size:11px; fill:var(--text-muted)">점수 →</text>
<circle cx="92" cy="250" r="4.5" style="fill:var(--text-muted)"/><circle cx="128" cy="238" r="4.5" style="fill:var(--text-muted)"/><circle cx="170" cy="232" r="4.5" style="fill:var(--text-muted)"/><circle cx="205" cy="214" r="4.5" style="fill:var(--text-muted)"/><circle cx="245" cy="208" r="4.5" style="fill:var(--text-muted)"/><circle cx="282" cy="192" r="4.5" style="fill:var(--text-muted)"/><circle cx="312" cy="186" r="4.5" style="fill:var(--text-muted)"/>
<circle cx="356" cy="128" r="4.5" style="fill:var(--accent-primary)"/><circle cx="392" cy="120" r="4.5" style="fill:var(--accent-primary)"/><circle cx="430" cy="110" r="4.5" style="fill:var(--accent-primary)"/><circle cx="468" cy="104" r="4.5" style="fill:var(--accent-primary)"/><circle cx="508" cy="92" r="4.5" style="fill:var(--accent-primary)"/><circle cx="548" cy="82" r="4.5" style="fill:var(--accent-primary)"/><circle cx="582" cy="72" r="4.5" style="fill:var(--accent-primary)"/>
<polyline points="70,245 325,178" style="fill:none; stroke:var(--text-muted); stroke-width:2.5"/>
<polyline points="335,120 592,62" style="fill:none; stroke:var(--accent-primary); stroke-width:2.5"/>
<line x1="330" y1="121" x2="330" y2="177" style="stroke:var(--accent-secondary); stroke-width:1.6"/>
<line x1="325" y1="121" x2="335" y2="121" style="stroke:var(--accent-secondary); stroke-width:1.6"/>
<line x1="325" y1="177" x2="335" y2="177" style="stroke:var(--accent-secondary); stroke-width:1.6"/>
<text x="250" y="120" text-anchor="middle" style="font-size:12.5px; font-weight:600; fill:var(--accent-secondary)">효과 = 점프</text>
<line x1="278" y1="126" x2="322" y2="142" style="stroke:var(--accent-secondary); stroke-width:1.4" marker-end="url(#rdd-arr)"/>
<text x="190" y="278" text-anchor="middle" style="font-size:11.5px; fill:var(--text-muted)">불합격 (장학금 ✗)</text>
<text x="470" y="290" text-anchor="middle" style="font-size:11.5px; fill:var(--text-muted)">합격 (장학금 ○)</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">합격컷을 경계로 졸업률이 위로 뚝 점프한다. 79점과 80점은 거의 같은 학생이니, 이 점프는 장학금(처치)의 효과로 볼 수 있다.</figcaption>
</figure>

추세선을 양쪽에서 그어 경계까지 늘여보면, 컷오프에서 **뚝 끊기며 점프**합니다. 이 점프의 높이가 바로 처치효과예요. 점수가 천천히 변하는 동안 결과도 천천히 변하다가, 오직 컷오프에서만 계단처럼 튀는 거죠. 그 계단을 만든 건 점수가 아니라 **처치**입니다.

---

## 3. 수식으로 — 경계의 양쪽 극한

효과는 컷오프 $c$에서 결과의 "위쪽 극한 빼기 아래쪽 극한"으로 정의됩니다.

$$\tau = \lim_{x \to c^{+}} E[Y \mid X=x] \;-\; \lim_{x \to c^{-}} E[Y \mid X=x]$$

말로 풀면: 컷오프에 **바로 위에서** 다가갈 때의 평균 결과에서, **바로 아래에서** 다가갈 때의 평균 결과를 뺀 값. 양쪽 추세선을 경계까지 외삽해 그 사이 간격을 재는 거예요. 그림의 점프가 정확히 이 $\tau$입니다.

---

## 4. 두 가지 가정

이 깔끔함은 두 가정 위에 서 있어요.

- **연속성:** 컷오프에서 점프하는 건 **처치 하나뿐**이어야 합니다. 만약 80점 경계에서 "장학금 + 우수반 배정 + 멘토링"이 한꺼번에 갈린다면, 점프가 누구 덕인지 알 수 없어요.
- **조작 없음(no manipulation):** 사람들이 컷오프를 넘으려고 점수를 **조작**할 수 없어야 합니다. 79.5점을 80점으로 올려주는 로비가 가능하다면, 경계 바로 위 학생들은 "운으로 넘은" 게 아니라 "기를 쓰고 넘은" 특별한 사람들이 돼요. 그럼 더는 쌍둥이가 아니죠. (그래서 경계 근처 인원 분포가 한쪽으로 쏠리지 않았는지 점검합니다.)

---

## 5. 한계 — 컷오프 근처에서만

RDD가 알려주는 효과는 **컷오프 바로 근처에서만** 유효합니다. 80점 경계의 효과지, 50점이나 95점 학생에게도 같은 효과라는 보장은 없어요. 이걸 국소 효과라고 부릅니다.

장학금이 경계의 학생(턱걸이 합격)에겐 큰 도움이 돼도, 최상위권에겐 별 차이 없을 수 있잖아요. RDD는 "경계에 있는 사람" 이야기만 정확히 해줍니다. 일반화할 때 조심해야 해요.

---

## 6. 광고에서는 — 곳곳의 임계값

광고 시스템에는 칼같은 임계값이 의외로 많아요. RDD가 잘 들어맞는 자리죠.

- **입찰 하한(floor):** 입찰가가 floor를 넘어야 노출/슬롯을 얻습니다. floor 바로 위/아래 입찰을 비교하면 "노출되는 것"의 효과를 잴 수 있어요.
- **빈도 캡(frequency cap):** "최대 3회 노출"이면, 3회 본 사람과 (캡에 막혀) 못 본 사람의 경계에서 추가 노출의 효과를 봅니다.
- **등급 컷:** 누적 구매액이 어떤 선을 넘으면 VIP 혜택 → 경계에서 혜택의 효과.

> 컷오프가 있는 곳이라면, 그 경계는 자연이 깔아둔 작은 실험일 수 있다.

---

## 정리

- **컷오프 위/아래** — 경계 근처는 1점 차이로 갈린 거의 같은 사람들. 자연 실험이 된다.
- 효과 = 경계에서 결과가 **점프하는 높이**(양쪽 극한의 차이 $\tau$).
- **가정**: 연속성(다른 게 같이 점프하지 않음) + 조작 없음(컷오프를 못 넘나든다).
- **한계**: 컷오프 근처에서만 유효한 국소 효과. 일반화 주의.
- **광고**: 입찰 하한·빈도 캡·등급 컷 같은 임계값에 적용.

### 더 깊이 읽기

- [인과추론 입문](post.html?id=causal-inference-101) — 선택편향이 왜 문제인가
- [이중차분법(DiD)](post.html?id=difference-in-differences) — 시간을 활용하는 또 다른 준실험
- [도구변수(IV)](post.html?id=instrumental-variables) — 외부 지렛대로 푸는 법
