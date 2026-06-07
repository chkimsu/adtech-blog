"이 약을 먹어서 나은 걸까, 안 먹어도 나았을까?"

광고로 바꿔도 똑같습니다. "이 광고 *때문에* 산 걸까, 어차피 살 사람이었을까?"

이 질문에 답하는 게 **인과추론(causal inference)**입니다. 데이터 분석에서 가장 어렵고, 가장 중요한 부분이에요. 왜 그렇게 어려운지부터 한 걸음씩 풀어봅니다. 이 글은 **인과추론 트랙**의 출발점이에요.

> 한 줄 비유: 인과를 안다는 건 **"그 일이 없었던 평행우주"**와 비교하는 것. 문제는 그 평행우주를 우리가 절대 볼 수 없다는 데 있다.

---

## 1. 상관과 인과는 다르다

여름이면 아이스크림이 많이 팔립니다. 같은 여름, 물놀이 익사 사고도 늘어요. 둘은 분명히 **같이 움직입니다(상관)**.

그럼 아이스크림을 금지하면 익사가 줄까요? 당연히 아니죠. 진짜 범인은 **더위**입니다. 더위가 아이스크림 판매도, 물놀이도 동시에 늘린 거예요.

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 560 270" role="img" aria-label="더위라는 숨은 원인이 아이스크림 판매와 익사 사고를 둘 다 늘린다. 아이스크림과 익사는 같이 움직이지만 서로 원인은 아니다." style="width:100%; max-width:520px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="ci-arr" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" style="fill:var(--accent-primary)"/></marker>
</defs>
<line x1="238" y1="78" x2="132" y2="183" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#ci-arr)"/>
<line x1="322" y1="78" x2="428" y2="183" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#ci-arr)"/>
<line x1="202" y1="208" x2="358" y2="208" style="stroke:var(--text-muted); stroke-width:1.6; stroke-dasharray:6 5"/>
<rect x="200" y="30" width="160" height="46" rx="9" style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:1.8"/>
<text x="280" y="53" text-anchor="middle" style="font-size:14px; font-weight:700; fill:var(--accent-primary)">더위</text>
<text x="280" y="69" text-anchor="middle" style="font-size:11px; fill:var(--text-muted)">숨은 원인 (교란변수)</text>
<rect x="30" y="185" width="172" height="46" rx="9" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="116" y="212" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">아이스크림 판매</text>
<rect x="358" y="185" width="172" height="46" rx="9" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="444" y="212" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">익사 사고</text>
<circle cx="280" cy="208" r="12" style="fill:var(--bg-secondary)"/>
<line x1="273" y1="201" x2="287" y2="215" style="stroke:var(--accent-primary); stroke-width:2.4"/>
<line x1="287" y1="201" x2="273" y2="215" style="stroke:var(--accent-primary); stroke-width:2.4"/>
<text x="280" y="256" text-anchor="middle" style="font-size:12px; fill:var(--text-muted)">겉보기 상관 — 직접 원인 아님</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">더위(숨은 원인)가 아이스크림 판매와 익사를 둘 다 늘린다. 그래서 둘은 같이 움직이지만(상관), 한쪽이 다른 쪽의 원인은 아니다.</figcaption>
</figure>

이렇게 **둘 다를 동시에 일으키는 숨은 원인**을 교란변수(confounder)라고 부릅니다. 상관만 보고 인과로 착각하면 "아이스크림을 금지하자" 같은 엉뚱한 결론에 도달해요.

> 핵심: 같이 움직인다(상관) ≠ 때문이다(인과). 둘 사이엔 보통 숨은 제3의 원인이 있다.

---

## 2. 인과추론의 근본 난제 — 반사실

인과효과의 진짜 정의는 이렇습니다.

> 철수가 약을 먹고 3일 만에 나았다. 그런데 **철수가 약을 안 먹었다면 며칠 걸렸을까?**

앞은 봤지만, 뒤(약을 안 먹은 철수)는 **영원히 못 봅니다.** 철수는 이미 약을 먹었으니까요. 이 "일어나지 않은 세계"를 **반사실(counterfactual)**이라고 해요.

한 사람에게서 우리는 둘 중 하나만 관측합니다.

- 처치를 받은 결과 $Y(1)$, 또는
- 처치를 안 받은 결과 $Y(0)$

진짜 알고 싶은 건 한 사람의 효과, 즉 $Y(1) - Y(0)$ 입니다. 그런데 둘 중 하나는 **언제나 빈칸**이에요. 이걸 **인과추론의 근본 문제(fundamental problem)**라고 부릅니다.

> 한 사람에게선 사실과 반사실을 동시에 볼 수 없다. 인과추론의 모든 어려움이 여기서 나온다.

---

## 3. 그래서 '비슷한 남'을 빌려온다

한 사람의 두 세계를 못 보니, **나 대신 내 반사실을 연기해 줄 비슷한 누군가**가 필요합니다. 약 먹은 사람들과 안 먹은 사람들을 무리로 비교하는 거죠.

여기서 우리가 정말 알고 싶은 건 집단 평균 효과, **평균처치효과(ATE, Average Treatment Effect)**입니다.

$$\text{ATE} = E[\,Y(1) - Y(0)\,]$$

모두가 처치받은 세계의 평균에서, 아무도 안 받은 세계의 평균을 뺀 값이에요.

문제는 — 비교하는 **두 무리가 원래 다를 수 있다**는 겁니다.

- 약을 챙겨 먹은 사람들이 원래 건강을 더 신경 쓰는 사람들이었다면?
- 그럼 빨리 나은 게 약 덕분인지, **원래 건강해서**인지 구분이 안 돼요.

이렇게 **두 무리가 처음부터 다르게 모여서 생기는 왜곡**을 선택편향(selection bias)이라고 합니다. 1절의 교란변수가 만드는 함정의 한 형태예요. "건강을 챙기는 성향"이 약 복용과 회복을 동시에 끌어올린 거죠.

---

## 4. 빈칸을 채우는 두 갈래 길

반사실이라는 빈칸을 **어떻게 채우느냐**에서 길이 갈립니다. 인과추론 전체가 사실 이 두 길의 이야기예요.

**길 1 — 직접 실험으로 만든다 (랜덤 실험, RCT).**
누가 약을 먹을지 **동전 던지기로** 정하면, 두 무리가 평균적으로 "쌍둥이"가 됩니다. 건강을 챙기는 사람도 양쪽에 골고루 섞이죠. 그럼 남는 차이는 오직 약 때문 → 반사실을 깨끗하게 대신합니다. 이게 **황금기준**이에요. ([→ 랜덤 실험(RCT)](post.html?id=rct-randomized-experiment))

**길 2 — 자연이 만든 실험을 빌린다 (준실험).**
윤리·비용·현실 때문에 랜덤이 불가능할 때가 훨씬 많습니다. 이미 광고를 다 집행한 뒤라면 되돌릴 수도 없고요. 그럴 땐 **이미 쌓인 데이터에서 "거의 실험 같은 상황"**을 찾아냅니다.

- **이중차분(DiD)** — 처치 안 받은 옆 그룹의 시간 변화를 빌려 반사실을 그림 ([→ DiD](post.html?id=difference-in-differences))
- **회귀불연속(RDD)** — 어떤 컷오프 바로 위/아래를 비교 ([→ RDD](post.html?id=regression-discontinuity))
- **도구변수(IV)** — 처치를 우연히 흔드는 외부 요인을 지렛대로 ([→ IV](post.html?id=instrumental-variables))

이 트랙의 나머지 글들이 길 2의 도구를 하나씩 풀어냅니다.

---

## 5. 광고에서는 — 효과 측정이 곧 인과추론

"이 캠페인이 매출을 15% 올렸다" 같은 말은 **전부 인과 주장**이에요. 그런데 광고는 보통 **살 것 같은 사람에게 더 노출**됩니다(타겟팅). 바로 여기서 선택편향이 터져요.

- 광고 본 사람이 더 많이 샀다? → 광고 덕분일 수도, 하지만 **원래 살 사람을 골라 보여준 것**일 수도 있습니다.

그래서 광고가 *진짜로 더 만든* 매출, 즉 **증분효과(incrementality)**를 재려면 인과추론이 꼭 필요합니다. 단순히 "광고 본 사람의 구매율"을 보면 효과를 한참 부풀리게 돼요. 광고판에서 인과추론이 그토록 중요한 이유입니다.

> 광고 효과 측정 = 증분효과 = 인과추론 문제. 상관(광고 본 사람이 더 샀다)에 속지 않는 것이 출발점.

---

## 정리

- **상관 ≠ 인과.** 둘 사이엔 보통 교란변수라는 숨은 원인이 있다 (더위 → 아이스크림·익사).
- **인과효과 = 사실 − 반사실.** 한 사람에게선 둘 중 하나만 보이는 게 근본 난제.
- 그래서 **'비슷한 남'을 빌려** 빈칸을 채우는데, 두 무리가 원래 다르면 **선택편향**이 생긴다.
- 빈칸 채우는 법은 두 갈래: **랜덤 실험(RCT, 황금기준)** 아니면 **준실험(DiD·RDD·IV)**.
- **광고 효과 측정 = 증분효과 = 인과추론.** 타겟팅 때문에 상관에 속기 쉽다.

### 더 깊이 읽기

- [랜덤 실험(RCT)](post.html?id=rct-randomized-experiment) — 반사실이라는 빈칸을 가장 깨끗하게 채우는 법
- [이중차분법(DiD)](post.html?id=difference-in-differences) — 실험을 못 할 때 옆 그룹을 빌리는 법
- [A/B 테스트 vs 멀티암드 밴딧](post.html?id=ab-test-vs-mab) — 랜덤 분할을 실제로 굴리는 이야기
