가격을 올리면 판매가 줄까요? 상식적으론 그럴 것 같죠. 그런데 데이터를 보면 종종 **비싼 상품이 더 잘 팔립니다.** 가격이 올라도 판매가 오르는 거예요. 왜일까요?

인기 많은 상품은 비싸게 매겨도 잘 팔리기 때문입니다. 여기서 **수요(인기)**라는 숨은 변수가 가격도 끌어올리고 판매도 끌어올려요. 또 교란이죠. 이 교란 때문에 "가격 → 판매"의 진짜 효과를 직접 볼 수가 없습니다. 게다가 가격을 마음대로 올렸다 내렸다 하는 랜덤 실험도 현실에선 어렵고요.

도구변수(IV, Instrumental Variables)는 이럴 때 쓰는 영리한 우회로입니다. X(가격)를 직접 못 흔드니, **X를 우연히 흔드는 외부 요인**을 찾아 그걸 지렛대로 쓰는 거예요.

> 한 줄 비유: 너무 무거워 직접 못 미는 그네. 마침 분 **바람(도구)**이 밀어준 만큼만 그네가 움직인 걸 보고, '미는 힘 → 그네' 관계를 거꾸로 추정한다.

---

## 1. 문제 — 교란이 X와 Y를 동시에 흔든다

우리가 알고 싶은 건 가격(X)이 판매(Y)에 주는 효과예요. 그런데 수요(U)가 끼어듭니다.

- 수요가 높으면 → 가격을 올려도 됨 (X↑)
- 수요가 높으면 → 어차피 많이 팔림 (Y↑)

그래서 가격과 판매가 같이 오르는 것처럼 보여요. 이건 가격의 효과가 아니라 **수요가 만든 착시**입니다. X와 Y를 동시에 흔드는 U가 둘 사이를 오염시킨 거죠.

---

## 2. 아이디어 — 외부 지렛대(도구 Z)

해법은 **수요와 무관하게 가격만 흔드는 무언가**를 찾는 겁니다. 예를 들어 원재료비·생산비 충격(공급 측 요인)이요. 원재료가 비싸지면 가격이 오릅니다. 그런데 원재료비는 **소비자의 수요(인기)와는 상관이 없어요.**

이 외부 요인이 도구변수 $Z$입니다. 조건은 하나예요. **Z는 오직 X를 통해서만 Y에 닿아야 합니다.**

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 600 290" role="img" aria-label="교란 U가 가격 X와 판매 Y를 동시에 흔든다. 도구 Z(비용 충격)는 오직 X를 통해서만 Y에 닿으며, Y로 가는 직접 경로는 없다." style="width:100%; max-width:560px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="iv-arr" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" style="fill:var(--accent-primary)"/></marker>
<marker id="iv-arr-g" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" style="fill:var(--text-muted)"/></marker>
</defs>
<line x1="142" y1="160" x2="236" y2="160" style="stroke:var(--accent-primary); stroke-width:2.4" marker-end="url(#iv-arr)"/>
<line x1="352" y1="160" x2="456" y2="160" style="stroke:var(--accent-primary); stroke-width:2.4" marker-end="url(#iv-arr)"/>
<line x1="288" y1="78" x2="288" y2="132" style="stroke:var(--text-muted); stroke-width:2" marker-end="url(#iv-arr-g)"/>
<line x1="322" y1="74" x2="500" y2="132" style="stroke:var(--text-muted); stroke-width:2" marker-end="url(#iv-arr-g)"/>
<path d="M80,186 Q300,272 520,186" style="fill:none; stroke:var(--text-muted); stroke-width:1.6; stroke-dasharray:6 5"/>
<rect x="20" y="135" width="120" height="50" rx="10" style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:1.8"/>
<text x="80" y="155" text-anchor="middle" style="font-size:13.5px; font-weight:700; fill:var(--accent-primary)">도구 Z</text>
<text x="80" y="172" text-anchor="middle" style="font-size:11px; fill:var(--text-muted)">비용 충격</text>
<rect x="238" y="135" width="114" height="50" rx="10" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="295" y="155" text-anchor="middle" style="font-size:13.5px; font-weight:700; fill:var(--text-primary)">X</text>
<text x="295" y="172" text-anchor="middle" style="font-size:11px; fill:var(--text-muted)">가격</text>
<rect x="458" y="135" width="120" height="50" rx="10" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="518" y="155" text-anchor="middle" style="font-size:13.5px; font-weight:700; fill:var(--text-primary)">Y</text>
<text x="518" y="172" text-anchor="middle" style="font-size:11px; fill:var(--text-muted)">판매</text>
<rect x="238" y="30" width="114" height="46" rx="10" style="fill:var(--bg-tertiary); stroke:var(--text-muted); stroke-width:1.5; stroke-dasharray:5 4"/>
<text x="295" y="50" text-anchor="middle" style="font-size:12.5px; font-weight:600; fill:var(--text-secondary)">교란 U</text>
<text x="295" y="66" text-anchor="middle" style="font-size:11px; fill:var(--text-muted)">수요·인기</text>
<circle cx="300" cy="229" r="12" style="fill:var(--bg-secondary)"/>
<line x1="293" y1="222" x2="307" y2="236" style="stroke:var(--accent-primary); stroke-width:2.4"/>
<line x1="307" y1="222" x2="293" y2="236" style="stroke:var(--accent-primary); stroke-width:2.4"/>
<text x="300" y="262" text-anchor="middle" style="font-size:11.5px; fill:var(--text-muted)">배제 — Z는 Y로 가는 직접 경로가 없다</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">교란 U(수요·인기)가 가격과 판매를 동시에 흔들어 X→Y를 가린다. 도구 Z(비용 충격)는 오직 가격을 통해서만 판매에 닿으므로, Z가 만든 가격 변동만 보면 순수 가격 효과를 추정할 수 있다.</figcaption>
</figure>

비용 충격은 수요와 무관하게 가격을 흔듭니다. 그러니 **그 흔들림이 판매에 미친 영향**만 따로 떼어 보면, 수요의 착시가 빠진 순수한 가격 효과가 남아요.

---

## 3. 수식으로 — Wald 추정량과 2SLS

도구 $Z$가 두 상태(비용 충격 있음/없음)라고 합시다. 추정은 의외로 직관적이에요.

$$\hat{\tau}_{IV} = \frac{E[Y \mid Z=1] - E[Y \mid Z=0]}{E[X \mid Z=1] - E[X \mid Z=0]} = \frac{\Delta Y}{\Delta X}$$

**"Z를 흔들었을 때 Y가 변한 양"을 "Z를 흔들었을 때 X가 변한 양"으로 나눈** 값입니다(Wald 추정량). Z는 X를 통해서만 Y에 닿으니, 이 비율이 곧 X 한 단위가 Y에 주는 효과가 돼요. 그네가 바람에 밀려 움직인 거리를, 바람이 가한 힘으로 나눠 "힘 1당 움직임"을 구하는 셈이죠.

좀 더 일반적인 방법이 **2단계 최소제곱(2SLS)**이에요.

1. **1단계**: Z로 X를 예측한다 → X에서 "Z가 만든 깨끗한 변동"만 골라낸다.
2. **2단계**: 그 예측된 X로 Y를 회귀한다.

교란 U에 오염된 X의 변동은 버리고, **도구 Z가 만든 변동만** 써서 효과를 추정하는 거예요.

---

## 4. 도구가 갖춰야 할 세 조건

좋은 도구 Z는 세 가지를 만족해야 합니다.

- **관련성(relevance):** Z가 X를 실제로 흔든다. (비용 충격이 가격을 실제로 바꿔야 함 — 1단계가 충분히 강해야)
- **배제(exclusion):** Z는 **오직 X를 통해서만** Y에 닿는다. 다른 직접 경로가 없어야 함. (비용 충격이 가격 말고 다른 길로 판매에 영향 주면 안 됨)
- **독립성(independence):** Z가 교란 U와 무관하게 발생한다. (비용 충격이 수요와 상관없이 우연히 일어남)

여기 함정이 있어요. **관련성은 데이터로 확인되지만, 배제·독립성은 데이터로 증명할 수 없습니다.** 오직 논리와 도메인 지식으로 정당화해야 해요. IV에서 가장 어렵고, 가장 논쟁이 많은 부분입니다. "정말 그 도구가 다른 경로로는 결과에 영향을 안 주는가?"가 늘 핵심 질문이에요.

---

## 5. 약한 도구 문제

Z가 X를 **아주 조금밖에** 못 흔들면(관련성이 약하면), 위 식의 분모 $\Delta X$가 작아집니다. 작은 수로 나누면 추정이 크게 흔들리고 편향돼요. 이걸 **약한 도구(weak instrument)** 문제라고 합니다.

그래서 1단계가 충분히 강한지 꼭 점검해요(흔히 1단계 F통계량이 10보다 큰지 봅니다). 약한 도구로 얻은 화려한 결과는 신기루일 때가 많습니다.

---

## 6. 광고에서는 — encouragement design

광고 노출을 직접 랜덤화할 수 없을 때 IV가 빛납니다. 노출 자체 대신, **노출을 '권유'하는 무언가를 랜덤화**하는 거예요.

- 일부 사용자에게 **랜덤하게** 광고 예산·입찰을 더 태운다(Z) → 그들의 노출 확률이 올라간다(X) → 전환을 본다(Y).
- 모두가 권유대로 노출되진 않지만(불완전 준수), 랜덤한 권유 Z를 도구로 쓰면 **"실제 노출의 효과"**를 추정할 수 있습니다.

지역 단위로 예산을 무작위 배정하는 geo 실험도 같은 골격이에요. "예산을 흔든 것"이 도구, "실제 노출"이 X죠. 직접 못 흔드는 노출을, 흔들 수 있는 예산을 빌려 미는 겁니다.

> IV의 정신: 원인을 직접 못 건드릴 때, 그 원인을 우연히 밀어주는 외부의 손잡이를 찾아라.

---

## 정리

- 교란 U가 X와 Y를 동시에 흔들면 X→Y의 진짜 효과를 직접 못 본다.
- **도구 Z**: X를 우연히 흔드는 외부 손잡이. **오직 X를 통해서만** Y에 닿아야 한다.
- 효과 ≈ $\Delta Y / \Delta X$ — Z가 만든 변동만 사용(2SLS).
- 세 조건: **관련성 + 배제 + 독립성.** 뒤 둘은 데이터가 아니라 논리로 정당화해야 한다.
- **약한 도구** 주의(1단계가 약하면 추정이 불안정).
- 광고: 노출을 못 흔들면 **예산·입찰을 랜덤화**해 도구로 삼는다(encouragement design).

### 더 깊이 읽기

- [인과추론 입문](post.html?id=causal-inference-101) — 교란변수가 왜 문제인가
- [랜덤 실험(RCT)](post.html?id=rct-randomized-experiment) — 직접 흔들 수 있을 때의 황금기준
- [이중차분법(DiD)](post.html?id=difference-in-differences) — 시간을 활용하는 준실험
