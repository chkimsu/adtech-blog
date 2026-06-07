앞 글([인과추론 입문](post.html?id=causal-inference-101))에서 우리는 벽에 부딪혔습니다. 약 먹은 사람이 빨리 나았다 — 그런데 약 덕분인지, 그 사람들이 **원래 건강을 챙기는 사람들**이어서인지 알 수가 없었죠. 두 무리가 처음부터 다르면 비교가 오염된다(선택편향)는 문제였어요.

랜덤 실험(RCT, Randomized Controlled Trial)은 이 문제를 **놀랄 만큼 깔끔하게** 풉니다. 도구는 단 하나, 동전 던지기예요. 인과추론에서 가장 강력한 아이디어이자, 모든 방법이 흉내 내려고 하는 "황금기준"입니다.

> 한 줄 비유: 누가 약을 먹을지 **동전으로** 정하면, 두 무리가 평균적으로 "쌍둥이"가 된다. 쌍둥이의 차이라면, 원인은 약밖에 없다.

---

## 1. 문제 복습 — 두 무리가 원래 다르면

약을 먹은 그룹과 안 먹은 그룹을 그냥 비교한다고 합시다. 문제는 **누가 약을 먹었느냐**예요.

스스로 약을 챙겨 먹는 사람들은 보통 운동도 하고, 잠도 잘 자고, 병원도 잘 갑니다. 즉 "건강을 챙기는 성향"이라는 숨은 변수가 **약 복용**과 **빠른 회복**을 동시에 끌어올려요. 이게 1절에서 본 교란변수죠.

그래서 약 먹은 그룹이 빨리 나아도, 그게 약 때문인지 원래 건강해서인지 **분리가 안 됩니다.** 출발선이 다른 두 사람의 달리기 기록을 비교하는 셈이에요.

---

## 2. 랜덤화의 마법 — 교란을 '균형'으로 바꾼다

해법은 의외로 단순합니다. **누가 약을 먹을지 본인이 정하게 두지 말고, 동전을 던져서 정합니다.**

그러면 무슨 일이 일어날까요? 건강을 챙기는 사람도, 안 챙기는 사람도, 젊은이도 노인도 — **모든 특성이 양쪽 그룹에 골고루 섞입니다.**

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 600 280" role="img" aria-label="모집단의 섞인 사람들을 동전 던지기로 두 그룹에 나누면, 건강을 챙기는 사람과 안 챙기는 사람이 양쪽에 같은 비율로 균형 있게 배분된다." style="width:100%; max-width:560px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="rct-arr" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" style="fill:var(--text-muted)"/></marker>
</defs>
<line x1="172" y1="140" x2="266" y2="140" style="stroke:var(--text-muted); stroke-width:2" marker-end="url(#rct-arr)"/>
<line x1="328" y1="124" x2="424" y2="92" style="stroke:var(--text-muted); stroke-width:2" marker-end="url(#rct-arr)"/>
<line x1="328" y1="156" x2="424" y2="214" style="stroke:var(--text-muted); stroke-width:2" marker-end="url(#rct-arr)"/>
<text x="96" y="58" text-anchor="middle" style="font-size:12.5px; font-weight:600; fill:var(--text-secondary)">모집단</text>
<rect x="22" y="68" width="148" height="146" rx="10" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<circle cx="55" cy="98" r="7" style="fill:var(--accent-primary)"/><circle cx="96" cy="98" r="7" style="fill:var(--text-muted)"/><circle cx="137" cy="98" r="7" style="fill:var(--accent-primary)"/>
<circle cx="55" cy="128" r="7" style="fill:var(--text-muted)"/><circle cx="96" cy="128" r="7" style="fill:var(--accent-primary)"/><circle cx="137" cy="128" r="7" style="fill:var(--text-muted)"/>
<circle cx="55" cy="158" r="7" style="fill:var(--accent-primary)"/><circle cx="96" cy="158" r="7" style="fill:var(--text-muted)"/><circle cx="137" cy="158" r="7" style="fill:var(--accent-primary)"/>
<circle cx="55" cy="188" r="7" style="fill:var(--text-muted)"/><circle cx="96" cy="188" r="7" style="fill:var(--accent-primary)"/><circle cx="137" cy="188" r="7" style="fill:var(--text-muted)"/>
<circle cx="298" cy="140" r="27" style="fill:var(--bg-secondary); stroke:var(--accent-secondary); stroke-width:2"/>
<text x="298" y="145" text-anchor="middle" style="font-size:12px; font-weight:600; fill:var(--accent-secondary)">랜덤</text>
<text x="298" y="192" text-anchor="middle" style="font-size:11.5px; fill:var(--text-muted)">동전 던지기</text>
<text x="503" y="60" text-anchor="middle" style="font-size:12.5px; font-weight:600; fill:var(--text-secondary)">처치군 (약 먹음)</text>
<rect x="426" y="68" width="154" height="56" rx="10" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<circle cx="460" cy="96" r="7" style="fill:var(--accent-primary)"/><circle cx="488" cy="96" r="7" style="fill:var(--text-muted)"/><circle cx="516" cy="96" r="7" style="fill:var(--accent-primary)"/><circle cx="544" cy="96" r="7" style="fill:var(--text-muted)"/>
<text x="503" y="150" text-anchor="middle" style="font-size:12.5px; font-weight:600; fill:var(--text-secondary)">대조군 (약 안 먹음)</text>
<rect x="426" y="158" width="154" height="56" rx="10" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<circle cx="460" cy="186" r="7" style="fill:var(--text-muted)"/><circle cx="488" cy="186" r="7" style="fill:var(--accent-primary)"/><circle cx="516" cy="186" r="7" style="fill:var(--text-muted)"/><circle cx="544" cy="186" r="7" style="fill:var(--accent-primary)"/>
<circle cx="120" cy="255" r="6" style="fill:var(--accent-primary)"/><text x="132" y="259" style="font-size:11.5px; fill:var(--text-muted)">건강 챙김</text>
<circle cx="320" cy="255" r="6" style="fill:var(--text-muted)"/><text x="332" y="259" style="font-size:11.5px; fill:var(--text-muted)">안 챙김</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">동전 던지기로 나누면 '건강 챙김(주황)'과 '안 챙김(회색)'이 양쪽 그룹에 같은 비율로 섞인다. 두 그룹이 출발선에서 쌍둥이가 되는 것 — 이것이 랜덤화의 힘이다.</figcaption>
</figure>

여기서 진짜 마법은 이거예요. 랜덤화는 우리가 **아는 교란변수(나이, 건강 성향)뿐 아니라, 모르는 교란변수까지** 양쪽에 골고루 분배합니다. 우리가 측정조차 못 한 요인들도요. 다른 어떤 방법도 못 하는 일이에요.

두 그룹이 출발선에서 통계적으로 같으니, 나중에 생긴 차이는 **오직 약 때문**입니다.

---

## 3. 수식으로 — 왜 편향이 사라지나

우리가 데이터에서 실제로 보는 건 두 그룹의 평균 차이예요.

$$\underbrace{E[Y \mid T=1] - E[Y \mid T=0]}_{\text{관측된 차이}} = \underbrace{E[Y(1) - Y(0) \mid T=1]}_{\text{진짜 효과}} + \underbrace{E[Y(0) \mid T=1] - E[Y(0) \mid T=0]}_{\text{선택편향}}$$

복잡해 보이지만 뜻은 단순해요. **관측된 차이 = 진짜 효과 + 선택편향**입니다. 마지막 항(선택편향)은 "처치 안 받았을 때조차 두 그룹이 원래 달랐던 정도"예요. 약 먹은 그룹이 원래 더 건강했다면 이 값이 0이 아니죠.

랜덤화가 하는 일은 한 줄로 표현됩니다. 처치 여부 $T$를 동전으로 정하니, $T$가 잠재 결과와 **독립**이 돼요.

$$T \perp \big(Y(0),\, Y(1)\big)$$

독립이면 $E[Y(0) \mid T=1] = E[Y(0) \mid T=0]$ — 즉 **선택편향 항이 0**이 됩니다. 그래서 깔끔하게:

$$E[Y \mid T=1] - E[Y \mid T=0] = \text{ATE}$$

관측된 단순 차이가 곧 평균처치효과(ATE)가 돼요. 이게 RCT가 황금기준인 이유입니다. 빼야 할 편향을 **설계 단계에서 0으로 만들어** 버리니까요.

---

## 4. A/B 테스트가 곧 RCT

광고·웹 서비스에서 RCT는 다른 이름으로 매일 돌아갑니다. 바로 **A/B 테스트**예요.

사용자를 랜덤으로 두 그룹에 나눠, 한쪽엔 새 버튼(또는 광고)을 보여주고 다른 쪽엔 안 보여줍니다. 동전 던지기로 나눴으니 두 그룹은 쌍둥이 → 전환율 차이 = 새 버튼의 순수 효과. 원리가 완전히 똑같죠.

(트래픽을 어떻게 나누고, 언제 멈추고, 밴딧과 무엇이 다른지는 [A/B 테스트 vs 멀티암드 밴딧](post.html?id=ab-test-vs-mab)에서 자세히 다룹니다.)

딱 하나 주의할 점은 **표본 크기**예요. 동전을 몇 번만 던지면 우연히 한쪽에 건강한 사람이 몰릴 수 있어요. 표본이 충분히 커야 "골고루 섞임"이 실제로 보장되고, 관측된 차이가 우연인지 진짜인지를 통계적으로 따질 수 있습니다.

---

## 5. 한계 — 랜덤이 안 될 때

RCT가 황금기준이라면, 왜 DiD·RDD·IV 같은 다른 방법들이 필요할까요? **현실에선 동전을 못 던질 때가 훨씬 많기 때문**이에요.

- **윤리:** 흡연의 해를 보려고 사람들을 랜덤하게 흡연시킬 순 없습니다.
- **비용·규모:** 전국 단위 캠페인을 도시별로 랜덤 배정하긴 어렵습니다.
- **개인을 못 가름:** TV·옥외 광고는 누가 봤는지 랜덤하게 나눌 수가 없어요.
- **이미 끝난 일:** 작년에 끝난 캠페인은 되돌려 실험할 수 없습니다.
- **오염(spillover):** 한 사람의 처치가 옆 사람에게 새어 나가면(입소문 등) 두 그룹이 더는 깨끗하지 않아요.

이럴 때 우리는 **"이미 쌓인 데이터에서 거의 실험 같은 상황"**을 찾아냅니다. 그게 준실험이고, 이 트랙의 나머지 글들이에요.

- [이중차분법(DiD)](post.html?id=difference-in-differences) — 처치 안 받은 옆 그룹의 시간 변화를 빌림
- [회귀불연속(RDD)](post.html?id=regression-discontinuity) — 컷오프 바로 위/아래를 비교
- [도구변수(IV)](post.html?id=instrumental-variables) — 처치를 우연히 흔드는 외부 요인을 지렛대로

> 준실험은 결국 "RCT를 못 할 때, 자연이 우연히 만들어 둔 랜덤성을 빌리는" 기술이다.

---

## 정리

- **선택편향**: 비교하는 두 그룹이 원래 다르면(누가 처치를 받았느냐), 차이가 효과인지 기저 차이인지 모른다.
- **랜덤화**: 동전으로 배정하면 아는 교란도 **모르는 교란도** 양쪽에 균형 → 두 그룹이 쌍둥이.
- 그래서 선택편향 항이 0이 되고, **관측된 차이 = ATE.** 편향을 설계로 없애는 게 RCT의 핵심.
- **A/B 테스트 = RCT.** 단, 표본이 충분해야 한다.
- 윤리·비용·개인분리·사후·오염 때문에 못 할 때 → **준실험(DiD·RDD·IV)**.

### 더 깊이 읽기

- [인과추론 입문](post.html?id=causal-inference-101) — 반사실과 선택편향이 왜 문제인가
- [이중차분법(DiD)](post.html?id=difference-in-differences) — 랜덤이 불가능할 때의 첫 번째 카드
- [A/B 테스트 vs 멀티암드 밴딧](post.html?id=ab-test-vs-mab) — RCT를 실제로 굴리는 법
