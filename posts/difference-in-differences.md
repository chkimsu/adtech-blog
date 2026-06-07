"이 광고, 진짜 효과가 있었을까?" 측정은 생각보다 까다롭습니다.

광고를 켠 뒤 매출이 올랐다고 해봅시다. 광고 덕분일까요? 아니면 그냥 성수기라서? 둘을 구분하지 못하면 효과를 부풀리거나 깎아내리게 됩니다.

**이중차분법(Difference-in-Differences, DiD)**은 바로 이 질문에 답하는 통계 기법입니다. 이름은 거창하지만 아이디어는 단순합니다 — **차이를 두 번 빼서, "원래 있었을 변화"를 걷어내고 진짜 효과만 남깁니다.**

이 글은 수식을 최소화하고 **구체적인 숫자와 그림**으로 DiD를 풀어봅니다. 마지막엔 핵심 통계 개념(평행추세 가정, 회귀식)도 한 번에 정리합니다.

> 한 줄 비유: DiD는 **"광고를 안 한 옆 동네"를 대역 배우로 세워**, 그 동네가 그냥 흘러간 만큼을 우리 동네 변화에서 빼주는 것.

---

## 1. 왜 단순 비교는 잘 속나

서울에만 "무료배송" 광고를 켰다고 합시다. 효과를 보고 싶어요. 흔한 두 가지 방법이 있는데, 둘 다 잘 속습니다.

**방법 1 — 광고 전후로 비교.**
서울 매출이 100에서 130으로 올랐어요. "광고 덕분!" …정말요?
하필 그달이 **성수기**라 전국이 다 올랐을 수도 있습니다. 광고 효과와 계절 효과가 뒤섞여 버립니다.

**방법 2 — 광고한 서울 vs 안 한 부산 비교.**
광고 후 서울이 부산보다 높아요. "광고 덕분!" …정말요?
서울은 **원래부터** 매출이 더 높은 동네였을 수 있습니다. 지역 차이와 광고 효과가 뒤섞입니다.

두 방법 모두 **다른 요인 하나를 통제하지 못해** 속는 거예요.

> 핵심 문제: 전후만 보면 **시간 효과**에 속고, 그룹만 보면 **원래 차이**에 속는다.

여기서 부산이 중요한 역할을 합니다. 부산은 광고를 안 했으니, **"서울도 광고를 안 했다면 어떻게 흘러갔을까"를 보여주는 대역 배우**입니다.

---

## 2. 차이를 두 번 빼기 — 이중차분

부산을 잣대로 삼아, 광고 전후 숫자를 깔아봅시다. (광고 전 = 직전 달, 광고 후 = 광고 첫 달)

| 구분 | 광고 전 | 광고 후 | 변화 |
|---|---|---|---|
| **서울 (광고 함)** | 110 | 130 | **+20** |
| **부산 (광고 안 함)** | 90 | 95 | **+5** |

생각의 흐름은 이렇습니다.

- 부산도 +5 올랐죠. 광고를 안 했는데도 오른 거니, 이 **+5가 "광고 없이도 어차피 일어났을 변화"**입니다 (성수기 등).
- 서울은 +20 올랐습니다. 여기엔 광고 효과 **그리고** 그 자연 증가가 함께 섞여 있어요.
- 그러니 서울의 +20에서 부산의 +5를 빼주면, **광고만의 순수 기여**가 남습니다.

$$\text{효과} = (130 - 110) - (95 - 90) = 20 - 5 = +15$$

각 동네에서 변화를 한 번 빼고(전후), 그 둘을 다시 한 번 뺍니다(서울−부산). **차분을 두 번** 한다고 해서 이중차분입니다.

> 직관: 서울이 오른 +20 중 +5는 "시대 흐름"이고, 나머지 **+15가 광고가 진짜 만든 몫**.

---

## 3. 그림으로 보기 — 평행추세

말보다 그림이 빠릅니다. 광고 전 몇 달과 광고 후를 함께 그려봤습니다.

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 680 360" role="img" aria-label="서울과 부산의 월별 주문 추이. 광고 전에는 두 선이 나란히 오르다가, 4월 광고 시작 후 서울만 위로 튀어오른다. 점선은 광고가 없었을 경우 서울이 갔을 가상의 경로." style="width:100%; max-width:640px; height:auto; font-family:var(--font-sans)">
<text x="58" y="40" style="font-size:11px; fill:var(--text-muted)">주문 수</text>
<line x1="70" y1="22" x2="95" y2="22" style="stroke:var(--accent-primary); stroke-width:2.5"/>
<text x="101" y="26" style="font-size:12px; fill:var(--text-secondary)">서울 (광고 함)</text>
<line x1="222" y1="22" x2="247" y2="22" style="stroke:var(--text-muted); stroke-width:2.5"/>
<text x="253" y="26" style="font-size:12px; fill:var(--text-secondary)">부산 (광고 안 함)</text>
<line x1="392" y1="22" x2="417" y2="22" style="stroke:var(--accent-primary); stroke-width:2; stroke-dasharray:6 5; opacity:0.6"/>
<text x="423" y="26" style="font-size:12px; fill:var(--text-secondary)">서울 — 광고 없었다면</text>
<line x1="60" y1="315" x2="566" y2="315" style="stroke:var(--border-color); stroke-width:1"/>
<line x1="370" y1="50" x2="370" y2="318" style="stroke:var(--border-color); stroke-width:1.5; stroke-dasharray:4 4"/>
<text x="374" y="46" style="font-size:12px; fill:var(--text-muted)">광고 시작</text>
<polyline points="310,161 430,143 550,124" style="fill:none; stroke:var(--accent-primary); stroke-width:2; stroke-dasharray:6 5; opacity:0.6"/>
<circle cx="430" cy="143" r="3" style="fill:var(--bg-secondary); stroke:var(--accent-primary); stroke-width:1.5; opacity:0.8"/>
<circle cx="550" cy="124" r="3" style="fill:var(--bg-secondary); stroke:var(--accent-primary); stroke-width:1.5; opacity:0.8"/>
<polyline points="70,273 190,254 310,236 430,217 550,199" style="fill:none; stroke:var(--text-muted); stroke-width:2.5; stroke-linejoin:round; stroke-linecap:round"/>
<polyline points="70,199 190,180 310,161 430,87 550,69" style="fill:none; stroke:var(--accent-primary); stroke-width:2.5; stroke-linejoin:round; stroke-linecap:round"/>
<circle cx="70" cy="273" r="3.5" style="fill:var(--text-muted)"/>
<circle cx="190" cy="254" r="3.5" style="fill:var(--text-muted)"/>
<circle cx="310" cy="236" r="3.5" style="fill:var(--text-muted)"/>
<circle cx="430" cy="217" r="3.5" style="fill:var(--text-muted)"/>
<circle cx="550" cy="199" r="3.5" style="fill:var(--text-muted)"/>
<circle cx="70" cy="199" r="3.5" style="fill:var(--accent-primary)"/>
<circle cx="190" cy="180" r="3.5" style="fill:var(--accent-primary)"/>
<circle cx="310" cy="161" r="3.5" style="fill:var(--accent-primary)"/>
<circle cx="430" cy="87" r="3.5" style="fill:var(--accent-primary)"/>
<circle cx="550" cy="69" r="3.5" style="fill:var(--accent-primary)"/>
<line x1="430" y1="89" x2="430" y2="141" style="stroke:var(--accent-secondary); stroke-width:1.5"/>
<line x1="425" y1="89" x2="435" y2="89" style="stroke:var(--accent-secondary); stroke-width:1.5"/>
<line x1="425" y1="141" x2="435" y2="141" style="stroke:var(--accent-secondary); stroke-width:1.5"/>
<text x="442" y="119" style="font-size:12.5px; fill:var(--accent-secondary); font-weight:600">효과 ≈ +15</text>
<text x="70" y="334" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">1월</text>
<text x="190" y="334" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">2월</text>
<text x="310" y="334" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">3월</text>
<text x="430" y="334" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">4월</text>
<text x="550" y="334" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">5월</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">광고 전(1~3월) 두 동네는 나란히 올랐다. 4월 광고가 들어가자 서울만 위로 튄다. 점선은 "광고가 없었다면" 서울이 갔을 길 — 실선과 점선의 벌어진 간격이 광고 효과다.</figcaption>
</figure>

그림의 핵심은 **광고 전 두 선이 나란하다**는 점입니다. 서울도 부산도 매달 +5씩, 보폭이 같았어요. 그러다 4월에 서울만 위로 솟습니다.

점선은 "서울이 광고를 안 했다면 갔을 길"입니다. 부산과 똑같은 보폭으로 그어둔 **가상의 경로**죠. 실제 선(실선)과 이 가상선(점선)이 벌어진 간격, 그게 바로 광고가 만든 효과입니다.

---

## 4. 통계로 한 줄 — 회귀식과 β₃

실무에선 표 계산 대신 **회귀식 한 줄**로 한 번에 구합니다. 어려워 보여도, 방금 본 2×2 표를 그대로 옮긴 것뿐이에요.

$$Y = \beta_0 + \beta_1\,\mathrm{Treat} + \beta_2\,\mathrm{Post} + \beta_3\,(\mathrm{Treat} \times \mathrm{Post}) + \varepsilon$$

- $\mathrm{Treat}$ : 처치 그룹이면 1, 아니면 0 (서울 = 1, 부산 = 0)
- $\mathrm{Post}$ : 광고 후 시점이면 1, 전이면 0
- $\varepsilon$ : 설명하지 못한 잡음(오차)

각 계수가 무엇을 잡아내는지 표로 보면:

| 계수 | 무엇을 잡아내나 | 이 예시 값 |
|---|---|---|
| $\beta_0$ | 부산·광고 전의 기본값 | 90 |
| $\beta_1$ | 서울이라서 더 높은 몫 (지역 차이) | +20 |
| $\beta_2$ | 시간이 지나서 오른 몫 (시간 효과) | +5 |
| $\beta_3$ | 서울이면서 광고 후일 때만 추가로 붙는 몫 | **+15** |

**$\beta_3$ 하나가 바로 DiD 효과입니다.** "서울이다(Treat)"와 "광고 후다(Post)"가 곱해진 항(교차항)이라, **둘이 동시에 참일 때만 켜집니다.** 덕분에 지역 고유 차이($\beta_1$)와 시간 흐름($\beta_2$)을 자동으로 걸러내고, 광고가 만든 순수 효과만 $\beta_3$에 담겨요.

회귀식이 2절의 손계산과 똑같은 답(+15)을 주는 게 보이나요? 둘은 같은 이야기를 다른 언어로 한 것뿐입니다.

---

## 5. 단 하나의 가정 — 평행추세, 그리고 깨질 때

DiD가 성립하려면 딱 하나를 믿어야 합니다.

> **평행추세(parallel trends): "광고가 없었다면, 서울도 부산과 똑같은 보폭으로 변했을 것이다."**

3절 그림에서 광고 전 두 선이 **나란했던 것**이 이 가정의 근거예요. 점선(가상 경로)을 부산과 평행하게 그은 것도 그래서고요.

이 가정이 현실에서 깨지는 상황들:

- **원래 추세가 달랐다.** 서울이 광고 전부터 매달 +5가 아니라 +10씩 크던 동네였다면? 4월 점프의 일부는 그냥 원래 성장입니다. 효과를 부풀려 잡게 돼요. → 그래서 **광고 전 몇 기간이 나란했는지** 꼭 먼저 확인합니다.
- **동시에 다른 일이 터졌다.** 마침 그달 서울에만 지하철 파업 → 온라인 주문 폭증. 광고 효과와 섞여 분리가 안 됩니다.
- **대조군이 오염됐다.** 부산 사람이 서울 광고를 보고 주문하면, 부산도 영향을 받아요. 대역 배우가 진짜 배우를 따라 연기하는 셈이라 비교가 흐려집니다.

> 한 줄 요약: DiD는 **"대조군이 처치군의 가상 경로를 잘 대신한다"**는 믿음 위에 서 있다. 그 믿음이 약하면 결과도 약하다.

---

## 6. 광고에서는 — 증분효과(incrementality)

광고판에서 가장 깔끔한 효과 측정은 **A/B 테스트**입니다. 사용자를 랜덤으로 나눠 한쪽에만 광고를 노출하면 되니까요. (→ [A/B 테스트 vs 멀티암드 밴딧](post.html?id=ab-test-vs-mab))

문제는 **랜덤으로 못 나누는 경우**입니다.

- 캠페인을 **지역 단위**로 집행할 때 (한 도시 전체를 켜고 끔)
- TV·옥외처럼 **개인을 가를 수 없는** 매체
- 이미 끝난 캠페인을 **사후에** 평가할 때

이럴 때 "광고가 진짜로 더 만든 매출", 즉 **증분효과(incrementality)**를 재는 대표 도구가 DiD입니다. 광고를 켠 지역(처치)과 안 켠 지역(대조)을 캠페인 전후로 이중차분하면 되죠. 방금 본 서울/부산 예시가 정확히 그것입니다.

> A/B를 돌릴 수 있으면 A/B가 1순위. **못 돌릴 때, DiD가 다음 카드.**

---

## 정리

- **문제**: 단순 전후 비교는 시간 효과에, 단순 그룹 비교는 원래 차이에 속는다.
- **해법**: 광고를 안 한 대조군을 "대역 배우"로 세워, **(처치군 변화) − (대조군 변화)** 로 자연 증가를 걷어낸다. 이게 이중차분.
- **통계로는**: 교차항 회귀식의 **β₃**가 곧 DiD 효과. 지역 차이·시간 흐름을 자동으로 분리한다.
- **단 하나의 가정**: 평행추세. 광고가 없었다면 두 그룹이 나란히 움직였어야 한다. 깨지면 결과도 흔들린다.
- **광고에서는**: A/B가 불가능할 때 증분효과(incrementality)를 재는 핵심 도구.

### 더 깊이 읽기

- [A/B 테스트 vs 멀티암드 밴딧](post.html?id=ab-test-vs-mab) — 랜덤 분할이 가능할 때의 정석 비교
- [30분 만에 이해하는 광고 시스템](post.html?id=adtech-30min-primer) — Attribution·측정을 포함한 전체 지도
