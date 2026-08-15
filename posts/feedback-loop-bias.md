지훈이 새 소재 여덟 개를 같은 지면에 같은 날 올렸다. 이 지면은 클릭 한 건에 ₩500 을 준다. 아래에서는 그 여덟을 A 부터 H 까지로 부르겠다. 첫날은 어느 쪽이 좋은지 모르니 노출을 500건씩 똑같이 나눠 줬다.

그날 A 에는 클릭이 8건 붙었고 F 에는 14건이 붙었다. 그 클릭 수 하나가 다음 날 순위를 결정했다. 39일이 지난 지금 F 는 노출을 십만 건 넘게 받았고, A 는 첫날 이후 한 번도 화면에 뜨지 못했다.

**그러면 A 는 정말 나쁜 소재였을까?** 오래 띄워 보면 A 의 클릭률이 F 보다 높다. 더 좋은 쪽이 안 뜨고, 안 떴기 때문에 더 좋다는 사실이 로그에 영영 남지 않는다.

어제 모델이 고른 것만 오늘의 학습 데이터가 되고, 그 데이터가 내일 모델을 만든다. 이 되돌이를 **피드백 루프 편향**이라 부른다. 다음 달 예산을 어디에 더 붓고 어느 소재를 중단할지가 전부 이 로그 위에서 결정되니, 로그가 한쪽으로 굳으면 결정도 같이 굳는다.

> **한 줄 요약:** 광고 모델의 학습 데이터는 어제의 모델이 고른 것이다. 그래서 한 번 밀려난 광고는 추정값이 얼어붙고, 그 언 값이 다음 날의 순위를 다시 결정한다.

**이름 붙이기** — 이 글은 광고 여덟을 진짜 클릭률이 높은 순서로 A 부터 H 까지 부른다. A 가 가장 좋고 H 가 가장 나쁜데, 그 순서는 우리만 알고 시스템은 모른다. 로그와 아래 코드에는 광고 번호로 찍히니 A 가 `9931`, H 가 `9938` 이라고 알아 두면 된다.

**무대 표시 읽는 법** — `열린 RTB` 는 남의 거래소에 입찰만 넣는 자리이고, `닫힌 생태계` 는 우리가 경매를 직접 돌리는 자리다. `공통` 은 두 자리 모두에 해당한다는 뜻이다.

이 글의 숫자는 전부 설명을 위해 지어낸 값이지만, 시뮬레이션 결과는 아래 파이썬 코드를 실제로 돌려 얻은 것이다.

---

## 1. 어제 고른 것만 오늘의 데이터가 된다

**모델이 랭킹을 결정하고, 랭킹이 노출을 결정하고, 노출이 로그를 결정한다. 그리고 그 로그가 내일 모델을 결정한다.**

이 네 단계는 하루에 한 바퀴 돈다. 돌아서 제자리로 오는 이 경로를 **고리**라 부르고, 한 바퀴가 **한 세대**다. 그래서 이 글에 나오는 40세대는 곧 40일이고, 그 40일이 한 캠페인의 예산 주기다.

광고 모델의 학습 데이터는 밖에서 주어지지 않고, 어제 배포된 모델이 오늘 뜰 광고를 골라서 만든다. 뜬 광고에만 노출 줄이 생기고 그 줄에만 클릭 여부가 붙으니, 뜨지 않은 광고는 로그에 줄이 0개다.

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 500 300" role="img" aria-label="네 상자가 시계 방향 고리를 이룬다. 어제까지의 로그에서 오늘의 모델로, 모델에서 랭킹과 배분으로, 랭킹에서 오늘의 노출 2만 건으로, 노출에서 다시 로그로 화살표가 돌아온다. 아래에는 이 세대에 노출 0건을 받은 광고 A·D·H 상자가 있고, 그 상자에서 로그로 가는 점선이 X 표시에서 끊겨 있다." style="width:100%; max-width:500px; height:auto; font-family:var(--font-sans); font-size:12.5px; fill:var(--text-muted)">
<defs>
<marker id="feedback1-arr" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto"><path d="M0,0 L7.5,3 L0,6 Z" style="fill:var(--accent-primary)"/></marker>
</defs>
<rect x="20" y="40" width="180" height="52" style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="110" y="62" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">어제까지의 로그</text>
<text x="110" y="80" text-anchor="middle">뜬 광고만 줄이 있다</text>
<rect x="300" y="40" width="180" height="52" style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="390" y="62" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">오늘의 모델</text>
<text x="390" y="80" text-anchor="middle">광고 여덟의 추정 클릭률</text>
<rect x="300" y="150" width="180" height="52" style="fill:var(--bg-secondary); stroke:var(--accent-primary); stroke-width:2"/>
<text x="390" y="172" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">랭킹과 배분</text>
<text x="390" y="190" text-anchor="middle">상한 6,000건씩 채운다</text>
<rect x="20" y="150" width="180" height="52" style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="110" y="172" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">오늘의 노출 20,000건</text>
<text x="110" y="190" text-anchor="middle">상위 넷만 화면에 뜬다</text>
<line x1="200" y1="66" x2="294" y2="66" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#feedback1-arr)"/>
<text x="247" y="58" text-anchor="middle">학습</text>
<line x1="390" y1="92" x2="390" y2="144" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#feedback1-arr)"/>
<text x="396" y="122">내림차순</text>
<line x1="300" y1="176" x2="206" y2="176" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#feedback1-arr)"/>
<text x="253" y="220" text-anchor="middle">노출</text>
<line x1="110" y1="150" x2="110" y2="98" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#feedback1-arr)"/>
<text x="104" y="122" text-anchor="end">클릭 로그</text>
<rect x="20" y="244" width="160" height="44" style="fill:none; stroke:var(--text-muted); stroke-width:1.3; stroke-dasharray:6 4"/>
<text x="100" y="263" text-anchor="middle" style="fill:var(--text-primary)">A · D · H</text>
<text x="100" y="280" text-anchor="middle">이 세대 노출 0건</text>
<line x1="180" y1="266" x2="216" y2="266" style="stroke:var(--text-muted); stroke-width:1.6; stroke-dasharray:5 4"/>
<line x1="222" y1="259" x2="236" y2="273" style="stroke:var(--state-bad); stroke-width:2.4"/>
<line x1="236" y1="259" x2="222" y2="273" style="stroke:var(--state-bad); stroke-width:2.4"/>
<line x1="242" y1="266" x2="284" y2="266" style="stroke:var(--text-muted); stroke-width:1; stroke-dasharray:2 5"/>
<rect x="290" y="244" width="190" height="44" style="fill:none; stroke:var(--border-color); stroke-width:1.5"/>
<text x="385" y="263" text-anchor="middle" style="fill:var(--text-primary)">로그에 줄이 0개</text>
<text x="385" y="280" text-anchor="middle">추정값이 어제 그대로</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">위 네 상자는 매일 한 바퀴 돈다. 아래 줄은 그 고리에 못 들어간 광고다. 노출이 0건이면 로그가 0줄이고, 그러면 추정값이 어제 값에서 멈춘다.</figcaption>
</figure>

이 고리에는 밖에서 들어오는 정보가 하나도 없다. 오늘 뜬 것은 어제 로그가 결정했고, 어제 로그는 그저께 모델이 결정했다. 그래서 첫날의 우연한 오차가 지워지지 않고 그대로 다음 세대로 넘어간다.

오차를 지우려면 오차가 난 광고를 다시 띄워 봐야 하는데, 바로 그 오차 때문에 그 광고가 안 뜬다. 광고비를 어디에 더 붓고 어느 소재를 중단할지는 이 로그를 보고 결정되니, 로그가 굳으면 예산 결정도 같이 굳는다.

이 글은 그 고리를 40번 돌린다. 아래 설정값들이 굳음이 몇 세대에 오는지를 그대로 결정한다.

| 항목 | 값 | 왜 이 값인가 |
|---|---|---|
| 광고 수 | 여덟 (A~H) | 한 지면의 한 광고군 |
| 하루 노출 | 20,000건 | 지면 한 곳이 하루에 내보내는 몫 |
| 광고당 하루 상한 | 6,000건 | 예산·빈도 제한이 만드는 상한 |
| 첫날 상한 | 광고당 500건 | 신규 광고 보호 상한 |
| 세대 수 | 40 | 하루 한 번 재학습, 40일 |
| 추정 방법 | (누적 클릭+1) ÷ (누적 노출+2) | 분모가 0이 되지 않게 |

상한 6,000건이 이 글의 핵심 장치다. 이 상한 덕분에 1위가 하루 예산을 전부 가져가지 못하고 상위 넷이 나눠 갖는다. **추정 순위 5위부터는 그날 노출이 0건이고, 밀리는 순간 그 광고의 로그가 끊긴다.**

그러니까 첫날 받은 500건이 그 광고군의 남은 39일과 그 기간의 매출을 결정하는 셈이다. 그렇다면 그 500건은 얼마나 믿을 만한가. 다음 절이 그 질문이다.

## 2. 첫날 500건이 순위를 뒤집는다

**첫날 표본으로 잰 클릭률은 가장 좋은 광고와 중간쯤 되는 광고를 못 가른다. 그런데 그 값이 둘째 날 노출을 결정한다.**

첫날 여덟은 아직 어느 쪽이 좋은지 모르니 노출을 500건씩 똑같이 받는다. 첫날이 끝나면 광고마다 클릭 수가 하나씩 붙고, 그 숫자 하나가 둘째 날의 예산 배분을 결정한다.

문제는 첫날 표본이 작다는 것이다. 진짜 클릭률이 2.60% 인 A 라 해도 500건 중 클릭은 8건에서 18건 사이 어디로든 나온다. 그 폭 안에서 남은 39일의 예산이 갈린다.

이 판에서 A 는 클릭 8건을 받았고, 그래서 추정 클릭률이 1.793% 로 잡혔다. 진짜로는 A 보다 못한 F 가 14건을 받아 2.988% 로 잡혔다. 재는 오차가 재려는 차이보다 크니, 순위도 예산도 통째로 뒤집힌다.

:::deep 더 깊이 — 첫날 표본이 얼마나 흔들리나
진짜 클릭률 2.60% 면 500건에서 나오는 클릭 수의 평균은 13건이고, 그 표준편차가 3.6건이다.

$$\mathrm{SE} = \sqrt{\frac{p(1-p)}{n}} = \sqrt{\frac{0.026 \times 0.974}{500}} = 0.0072$$

클릭 3.6건을 클릭률로 옮기면 0.0072, 즉 0.72 다. 가장 좋은 광고는 2.60% 이고 넷째로 좋은 광고는 2.20% 인데, 이 흔들림은 그 둘 사이 간격을 덮고도 남는다.

표본이 4배가 되면 흔들림은 절반이 된다. 아래 코드가 세 가지 표본 크기를 나란히 돌리는 이유가 그것이다.
:::

아래가 이 글이 쓰는 첫날 결과다. 시드 37로 실제 뽑은 값이라, 뒤 절의 모든 숫자와 모든 예산 결정이 여기서 출발한다.

| 광고 | 로그의 번호 | 진짜 클릭률 | 첫날 클릭 | 추정 클릭률 | 추정 순위 |
|---|---|---|---|---|---|
| **A** | `9931` | 2.60% | 8 | 1.793% | 6위 |
| **B** | `9932` | 2.40% | 10 | 2.191% | 3위 |
| **C** | `9933` | 2.30% | 12 | 2.590% | 2위 |
| **D** | `9934` | 2.20% | 8 | 1.793% | 7위 |
| **E** | `9935` | 2.10% | 9 | 1.992% | 5위 |
| **F** | `9936` | 1.90% | 14 | 2.988% | 1위 |
| **G** | `9937` | 1.70% | 10 | 2.191% | 4위 |
| **H** | `9938` | 1.50% | 6 | 1.394% | 8위 |

여덟이 첫날 받은 클릭은 다 합쳐 77건이다. 진짜 가장 좋은 A 가 추정 순위로는 여섯째로 내려앉았고, 진짜로는 여섯째인 F 가 맨 위에 올라섰다. 일곱째인 G 마저 넷째 자리를 차지했는데, 둘째 날 예산은 그 넷째까지만 받는다.

이런 뒤집힘이 얼마나 흔한지 세어 보자. 첫날 검증에 쓰는 노출을 바꿔 가며 같은 상황을 1,000판씩 돌린다.

```python
import random

# 광고 8개의 '진짜' CTR. 시스템은 이 값을 모른다 — 우리만 안다.
TRUE = {9931: .0260, 9932: .0240, 9933: .0230, 9934: .0220,
        9935: .0210, 9936: .0190, 9937: .0170, 9938: .0150}
ADS = list(TRUE)


def cold_start_rank(rng, n):
    """8개에 n건씩 똑같이 노출한 뒤 관측 CTR 로 순위를 매긴다.
    돌려주는 값은 진짜 1위 광고 9931(=A) 이 몇 위로 추정됐나 다."""
    est = {}
    for ad in ADS:
        clicks = sum(rng.random() < TRUE[ad] for _ in range(n))
        est[ad] = (clicks + 1) / (n + 2)      # 분모가 0이 되지 않게 1과 2를 더한다
    order = sorted(ADS, key=lambda a: -est[a])
    return order.index(9931) + 1


rng = random.Random(7)
for n in (500, 2000, 10000):
    ranks = [cold_start_rank(rng, n) for _ in range(1000)]
    top1 = sum(r == 1 for r in ranks) / 10          # 1000판 중 %
    out4 = sum(r >= 5 for r in ranks) / 10          # 상위 4자리 밖으로 밀린 %
    print('첫날 %5d건 → 1위로 맞힘 %4.1f%% · 5위 밖 %4.1f%% · 평균 순위 %.2f'
          % (n, top1, out4, sum(ranks) / len(ranks)))

# 출력:
# 첫날   500건 → 1위로 맞힘 35.4% · 5위 밖 17.4% · 평균 순위 2.69
# 첫날  2000건 → 1위로 맞힘 50.3% · 5위 밖  6.6% · 평균 순위 2.03
# 첫날 10000건 → 1위로 맞힘 79.2% · 5위 밖  0.1% · 평균 순위 1.28
```

첫날 500건에서는 가장 좋은 광고를 맨 위로 맞히는 판이 35.4% 뿐이다. 그리고 17.4% 의 판에서는 그 광고가 상위 네 자리 밖으로 아예 밀려난다. 밀려나면 둘째 날부터 예산이 0이 되고 로그도 끊긴다. 표본을 10,000건까지 키우면 그 확률이 0.1% 로 떨어진다.

그런데 첫날 표본을 키우는 것 자체가 비용이다. 좋은지 나쁜지 모르는 광고 여덟에 10,000건씩 주면 하루 80,000건이 든다. 하루 노출이 20,000건인 지면에서는 나흘치 예산을 검증에만 태우는 셈이다.

그래서 실무는 검증 비용이 싼 500건 쪽을 고르고, 그 대가를 남은 39세대 동안 치른다. 그 39세대를 다음 절에서 실제로 돌려 본다.

## 3. 40일을 돌리면 사흘 만에 굳는다

**둘째 날부터 A 의 노출은 0건이고, 마지막 세대까지 0건이다. 예산 자리의 주인은 사흘째에 결정되고 그 뒤로 바뀌지 않는다.**

이제 고리를 돌린다. 매 세대 시작에 누적 로그로 추정 클릭률을 다시 계산하고, 그 순서대로 예산을 상한까지 채운다. 아래 코드가 이 글에 나오는 나머지 숫자를 전부 만든다.

```python
import random
# 앞 블록의 TRUE·ADS 를 그대로 쓴다.

N, CAP, GENS = 20000, 6000, 40      # 하루 노출 · 광고당 하루 상한 · 세대 수


def allocate(est, total=N):
    """추정 CTR 이 높은 광고부터 상한까지 채운다. 나눠 줄 몫이 떨어지면 끝이다.
    아래로 밀린 광고는 그날 노출이 0건이고, 그래서 로그도 0줄이다."""
    a, left = {ad: 0 for ad in ADS}, total
    for ad in sorted(ADS, key=lambda x: -est[x]):
        a[ad] = min(CAP, left)
        left -= a[ad]
        if left == 0:
            break
    return a


def gini(vals):
    """노출이 한쪽으로 쏠린 정도. 0이면 8개가 똑같이 나눠 가진 상태다."""
    v = sorted(vals)
    n, s = len(v), sum(v)
    return 2 * sum((i + 1) * x for i, x in enumerate(v)) / (n * s) - (n + 1) / n


def run(seed, mode='기본', eps=0.05, slot=1600, pm=None, pk=None):
    """고리를 40세대 돌린다. mode 가 '기본' 이면 처방 없이 그대로 돈다.
    ε탐색·강제슬롯·낙관(pm) 은 처방 글에서 걸어 볼 스위치다."""
    rng = random.Random(seed)
    imps = {ad: 0 for ad in ADS}
    clicks = {ad: 0 for ad in ADS}
    hist = []
    for g in range(1, GENS + 1):
        if g == 1:
            a = {ad: 500 for ad in ADS}                 # 신규 광고는 첫날 500건까지
        else:
            if pm is None:
                est = {ad: (clicks[ad] + 1) / (imps[ad] + 2) for ad in ADS}
            else:   # 낙관: 아직 안 본 광고를 pm(=3.5%) 이라고 우기고 시작한다
                est = {ad: (pm * pk + clicks[ad]) / (pk + imps[ad]) for ad in ADS}
            if mode == 'ε탐색':                      # 8개에 똑같이 흩뿌린다
                per = int(N * eps) // 8
                a = allocate(est, N - per * 8)
                for ad in ADS:
                    a[ad] += per
            elif mode == '강제슬롯':                  # 그날 0건이 된 광고에게만 준다
                a = allocate(est, N - slot)
                out = [ad for ad in ADS if a[ad] == 0]
                for ad in out:
                    a[ad] += slot // len(out)
            else:
                a = allocate(est)                     # 어제까지의 로그로 오늘을 정한다
        got = {ad: sum(rng.random() < TRUE[ad] for _ in range(a[ad])) for ad in ADS}
        for ad in ADS:
            imps[ad] += a[ad]
            clicks[ad] += got[ad]
        hist.append((g, a, got, gini([imps[x] for x in ADS])))
    return hist, imps, clicks


hist, imps, clicks = run(37)
print('세대  배분 9931 9932 9933 9934 9935 9936 9937 9938        클릭   CTR     누적지니')
for g, a, got, gi in hist:
    c = sum(got.values())
    if g in (1, 2, 3, 4, 5, 10, 20, 40):
        print('%3d       %s  %5d  %.3f%%   %.3f'
              % (g, ' '.join('%4d' % a[x] for x in ADS), c, 100 * c / sum(a.values()), gi))
print('40세대째 노출을 받는 광고:', [x for x in ADS if hist[-1][1][x] > 0])
print('9931 누적 노출 %d건 · 40세대 누적 클릭 %d건' % (imps[9931], sum(clicks.values())))

# 출력:
# 세대  배분 9931 9932 9933 9934 9935 9936 9937 9938        클릭   CTR     누적지니
#   1        500  500  500  500  500  500  500  500     77  1.925%   0.000
#   2          0 6000 6000    0    0 6000 2000    0    441  2.205%   0.479
#   3          0 6000 6000    0 2000 6000    0    0    421  2.105%   0.511
#   4          0 6000 6000    0 6000 2000    0    0    428  2.140%   0.516
#   5          0 6000 6000    0 2000 6000    0    0    446  2.230%   0.530
#  10          0 6000 6000    0 6000 2000    0    0    444  2.220%   0.543
#  20          0 6000 6000    0 6000 2000    0    0    470  2.350%   0.551
#  40          0 6000 6000    0 6000 2000    0    0    479  2.395%   0.563
# 40세대째 노출을 받는 광고: [9932, 9933, 9935, 9936]
# 9931 누적 노출 500건 · 40세대 누적 클릭 17350건
```

출력의 배분 열은 왼쪽부터 A·B·C·D·E·F·G·H 순서다. 세대 2에서 A·D·E·H 가 한꺼번에 0건이 되고, 세대 3에서 G 가 빠지면서 E 가 돌아온다. 세대 4부터는 예산을 받는 넷이 B·C·E·F 로 고정된다.

**예산을 받는 광고 집합이 마지막으로 바뀐 날이 사흘째다.** 그 뒤 37세대 동안 새로 들어오는 광고도, 중단되어 나가는 광고도 없다. 안에 남은 넷이 6,000건 자리와 2,000건 자리를 주고받는 흔들림은 조금 더 이어지지만, 밖으로 밀려난 넷에게는 아무 영향이 없다.

<figure style="text-align:center; margin:2rem 0;">
<div class="table-wrapper">
<svg viewBox="0 0 510 300" role="img" aria-label="광고 여덟의 40세대 노출 이력을 가로 띠로 그린 그림. 왼쪽에 광고 이름과 진짜 클릭률, 오른쪽 끝에 40세대 누적 노출이 있다. B와 C는 2세대부터 끝까지 굵은 띠가 이어진다. E는 3세대부터 들어와 9세대부터 굵은 띠가 이어지고, F는 반대로 9세대부터 얇은 띠로 내려앉는다. A·D·H는 1세대의 아주 얇은 조각 하나만 있고 그 뒤가 비어 있다. G는 2세대 조각 하나가 더 있을 뿐이다." style="width:100%; min-width:460px; max-width:510px; height:auto; font-family:var(--font-sans); font-size:12.5px; fill:var(--text-muted)">
<defs>
<marker id="feedback3-arr" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto"><path d="M0,0 L7.5,3 L0,6 Z" style="fill:var(--text-muted)"/></marker>
</defs>
<text x="6" y="20">광고 · 진짜 클릭률</text>
<text x="504" y="20" text-anchor="end">40세대 누적 노출</text>
<text x="132" y="36">세대 1</text>
<text x="479" y="36" text-anchor="end">세대 40</text>
<text x="6" y="55" style="fill:var(--text-primary)">A</text><text x="30" y="55">2.60%</text>
<line x1="132" y1="52" x2="479" y2="52" style="stroke:var(--rule); stroke-width:1; stroke-dasharray:2 4"/>
<rect x="132" y="56" width="7.5" height="3" style="fill:var(--grey)"/>
<text x="504" y="55" text-anchor="end" style="font-family:var(--font-mono); fill:var(--text-secondary)">500</text>
<text x="6" y="82" style="fill:var(--text-primary)">B</text><text x="30" y="82">2.40%</text>
<line x1="132" y1="79" x2="479" y2="79" style="stroke:var(--rule); stroke-width:1; stroke-dasharray:2 4"/>
<rect x="132" y="83" width="7.5" height="3" style="fill:var(--grey)"/>
<rect x="140.7" y="72" width="338.1" height="14" style="fill:var(--accent-primary)"/>
<text x="504" y="82" text-anchor="end" style="font-family:var(--font-mono); fill:var(--text-secondary)">234,500</text>
<text x="6" y="109" style="fill:var(--text-primary)">C</text><text x="30" y="109">2.30%</text>
<line x1="132" y1="106" x2="479" y2="106" style="stroke:var(--rule); stroke-width:1; stroke-dasharray:2 4"/>
<rect x="132" y="110" width="7.5" height="3" style="fill:var(--grey)"/>
<rect x="140.7" y="99" width="338.1" height="14" style="fill:var(--accent-primary)"/>
<text x="504" y="109" text-anchor="end" style="font-family:var(--font-mono); fill:var(--text-secondary)">234,500</text>
<text x="6" y="136" style="fill:var(--text-primary)">D</text><text x="30" y="136">2.20%</text>
<line x1="132" y1="133" x2="479" y2="133" style="stroke:var(--rule); stroke-width:1; stroke-dasharray:2 4"/>
<rect x="132" y="137" width="7.5" height="3" style="fill:var(--grey)"/>
<text x="504" y="136" text-anchor="end" style="font-family:var(--font-mono); fill:var(--text-secondary)">500</text>
<text x="6" y="163" style="fill:var(--text-primary)">E</text><text x="30" y="163">2.10%</text>
<line x1="132" y1="160" x2="479" y2="160" style="stroke:var(--rule); stroke-width:1; stroke-dasharray:2 4"/>
<rect x="132" y="164" width="7.5" height="3" style="fill:var(--grey)"/>
<rect x="149.4" y="161" width="7.5" height="6" style="fill:var(--accent-secondary)"/>
<rect x="158.1" y="153" width="7.5" height="14" style="fill:var(--accent-primary)"/>
<rect x="166.8" y="161" width="33.6" height="6" style="fill:var(--accent-secondary)"/>
<rect x="201.6" y="153" width="277.2" height="14" style="fill:var(--accent-primary)"/>
<text x="504" y="163" text-anchor="end" style="font-family:var(--font-mono); fill:var(--text-secondary)">208,500</text>
<text x="6" y="190" style="fill:var(--text-primary)">F</text><text x="30" y="190">1.90%</text>
<line x1="132" y1="187" x2="479" y2="187" style="stroke:var(--rule); stroke-width:1; stroke-dasharray:2 4"/>
<rect x="132" y="191" width="7.5" height="3" style="fill:var(--grey)"/>
<rect x="140.7" y="180" width="16.2" height="14" style="fill:var(--accent-primary)"/>
<rect x="158.1" y="188" width="7.5" height="6" style="fill:var(--accent-secondary)"/>
<rect x="166.8" y="180" width="33.6" height="14" style="fill:var(--accent-primary)"/>
<rect x="201.6" y="188" width="277.2" height="6" style="fill:var(--accent-secondary)"/>
<text x="504" y="190" text-anchor="end" style="font-family:var(--font-mono); fill:var(--text-secondary)">102,500</text>
<text x="6" y="217" style="fill:var(--text-primary)">G</text><text x="30" y="217">1.70%</text>
<line x1="132" y1="214" x2="479" y2="214" style="stroke:var(--rule); stroke-width:1; stroke-dasharray:2 4"/>
<rect x="132" y="218" width="7.5" height="3" style="fill:var(--grey)"/>
<rect x="140.7" y="215" width="7.5" height="6" style="fill:var(--accent-secondary)"/>
<text x="504" y="217" text-anchor="end" style="font-family:var(--font-mono); fill:var(--text-secondary)">2,500</text>
<text x="6" y="244" style="fill:var(--text-primary)">H</text><text x="30" y="244">1.50%</text>
<line x1="132" y1="241" x2="479" y2="241" style="stroke:var(--rule); stroke-width:1; stroke-dasharray:2 4"/>
<rect x="132" y="245" width="7.5" height="3" style="fill:var(--grey)"/>
<text x="504" y="244" text-anchor="end" style="font-family:var(--font-mono); fill:var(--text-secondary)">500</text>
<line x1="132" y1="268" x2="479" y2="268" style="stroke:var(--text-muted); stroke-width:1.2" marker-end="url(#feedback3-arr)"/>
<rect x="132" y="278" width="12" height="14" style="fill:var(--accent-primary)"/>
<text x="150" y="290">6,000건</text>
<rect x="206" y="286" width="12" height="6" style="fill:var(--accent-secondary)"/>
<text x="224" y="290">2,000건</text>
<rect x="280" y="289" width="12" height="3" style="fill:var(--grey)"/>
<text x="298" y="290">500건</text>
<text x="356" y="290">빈 자리는 0건</text>
</svg>
</div>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">위에서 셋째 줄까지가 진짜 클릭률 상위 셋인데, 굵은 띠가 끝까지 이어지는 줄은 둘째·셋째뿐이다. 맨 위 줄은 왼쪽 끝의 500건 조각 하나로 끝난다.</figcaption>
</figure>

40세대가 끝나면 예산이 이렇게 갈린다. B 와 C 가 각각 234,500건, E 가 208,500건, F 가 102,500건을 가져갔다.

밖으로 밀린 넷은 다 합쳐도 4,000건이고 전체의 0.5% 다. 첫날 받은 500건이 그 넷이 40일 동안 받은 예산 전부라는 뜻이다.

| 광고 | 누적 노출 | 누적 클릭 | 마지막 세대의 추정 클릭률 | 상태 |
|---|---|---|---|---|
| **A** | 500 | 8 | 1.793% | 1세대에 언 값 |
| **B** | 234,500 | 5,545 | 2.365% | 살아 있음 |
| **C** | 234,500 | 5,410 | 2.307% | 살아 있음 |
| **D** | 500 | 8 | 1.793% | 1세대에 언 값 |
| **E** | 208,500 | 4,368 | 2.095% | 살아 있음 |
| **F** | 102,500 | 1,961 | 1.914% | 살아 있음 |
| **G** | 2,500 | 44 | 1.799% | 2세대에 언 값 |
| **H** | 500 | 6 | 1.394% | 1세대에 언 값 |

예산을 계속 받은 넷은 추정값이 진짜 클릭률에 거의 붙었고, 언 넷은 첫날 뽑힌 값 그대로다. 진짜 클릭률은 2절 표에 있으니 나란히 놓고 보면 된다.

A 가 그동안 번 클릭은 8건이고 F 는 1,961건이다. 클릭 한 건에 ₩500 이니 F 쪽 매출만 ₩980,500 이고, A 쪽은 ₩4,000 이다.

광고주 리포트에는 F 가 잘 팔린 소재로 찍히고 A 는 죽은 소재로 찍힌다. 다음 달 예산은 그 리포트를 보고 결정되니, 진짜로 좋았던 소재가 가장 먼저 중단 승인을 받는다.

### 왜 다시 안 올라오나

굳음이 풀리려면, 그러니까 밀려난 광고가 예산을 다시 받으려면, 그 추정값이 안에 있는 광고를 넘어서야 한다. 그런데 밖에 있는 광고는 새 데이터가 없고, 새 데이터가 없으면 추정값이 한 발짝도 움직이지 않는다. 그래서 굳음이 풀리는 유일한 길은 **안에 있는 광고의 추정값이 스스로 내려가는 것**이다.

A 의 언 값은 1.793% 다. 예산 넷째 자리를 지키는 F 의 추정값은 1.914% 이고, F 의 진짜 클릭률은 1.90% 다.

표본이 쌓일수록 F 의 추정값은 자기 진짜 값 쪽으로 다가간다. 그러니 A 가 자리를 되찾는 데 필요한 1.793% 아래로 F 가 내려갈 이유가 없다.

G 도 같은 벽에 걸렸다. G 는 2세대에 2,000건을 받고 나서 얼었는데 그 언 값이 1.799% 라, A 의 1.793% 보다 아주 조금 높다. 진짜로는 A 가 훨씬 좋은 소재인데도 G 가 영원히 A 위에 있고, 예산도 그 순서대로 나간다.

**굳음(lock-in)의 정의는 이것이다.** 밖으로 밀려난 광고의 언 추정값이 안에 남은 광고들의 진짜 클릭률보다 전부 낮은 상태다. 이 상태가 되면 되돌릴 힘이 시스템 안에 남지 않아, 예산을 그대로 두는 한 순위가 영영 안 바뀐다.

### 쏠림은 어디서 멈추나

예산이 얼마나 쏠렸는지는 숫자 하나로 잴 수 있는데, 그 숫자를 **지니계수**(Gini coefficient, 몫이 한쪽으로 쏠린 정도)라 부른다. 여덟이 똑같이 나눠 가지면 0이고, 한 광고가 다 가져가면 1에 가까워진다.

완전히 굳은 예산 배분의 값을 먼저 구해 두면 기준선이 생긴다. 상위 셋이 상한까지 채우고 넷째가 남은 몫을 가져가며 나머지 넷은 0건인 상태인데, 이 배분의 지니계수가 0.575 다. **누적 지니계수는 이 값을 향해 올라가고 넘지 않는다.**

:::deep 더 깊이 — 0.575 는 어떻게 나온 값인가
위 코드의 `gini` 함수는 점유율을 오름차순으로 정렬한 뒤 아래 식을 쓴다. $n$ 은 광고 수 여덟이고, $x_i$ 는 $i$ 번째로 작은 점유율이다.

$$G = \frac{2\sum_{i=1}^{n} i \cdot x_i}{n \sum_i x_i} - \frac{n+1}{n}$$

완전히 굳은 배분을 오름차순으로 놓으면 앞의 넷이 0 이고 뒤의 넷이 0.1 · 0.3 · 0.3 · 0.3 이다. 이 값을 위 식에 넣으면 0.575 가 나온다.

이 값이 상한인 이유는 하나다. 누적 노출은 첫날의 균등 배분을 계속 품고 있어 쏠림을 조금 낮추는데, 세대가 늘수록 그 몫의 비중이 줄어든다. 그래서 누적 지니계수가 0.575 에 점점 가까워지기만 한다.
:::

아래 표의 오른쪽 세 열은 다음 글에서 걸어 볼 처방이다. 지금은 기본 열만 따라 읽으면 된다.

| 세대 | 기본 | ε 탐색 5% | 낙관 초기값 | 강제 슬롯 8% |
|---|---|---|---|---|
| 1 | 0.000 | 0.000 | 0.000 | 0.000 |
| 2 | 0.479 | 0.474 | 0.479 | 0.438 |
| 3 | 0.511 | 0.466 | 0.136 | 0.445 |
| 5 | 0.530 | 0.512 | 0.214 | 0.450 |
| 10 | 0.543 | 0.487 | 0.342 | 0.460 |
| 20 | 0.551 | 0.483 | 0.456 | 0.494 |
| 30 | 0.559 | 0.508 | 0.488 | 0.505 |
| 40 | 0.563 | 0.522 | 0.510 | 0.510 |

기본 열은 2세대 한 번에 0.479 까지 뛴다. 첫날의 균등 배분이 단 한 번의 순위 매김으로 지워진 것이고, 그 뒤 38세대를 더 돌려도 0.563 까지밖에 못 간다.

**쏠림은 천천히 심해지는 것이 아니라 한 번에 결정되고 그대로 유지된다.** 그래서 지니계수가 멈추는 것 자체가 굳음의 신호다. 값이 계속 오르내린다면 예산 자리의 주인이 아직 바뀌는 중이라는 뜻이다.

낙관 초기값 열을 보라. 3세대에 0.136 까지 떨어졌다가 다시 올라간다. 여덟이 예산 자리를 돌아가며 나눠 갖느라 누적 점유율이 한 번 평평해진 것이다.

**지니계수가 낮다고 좋은 것은 아니다.** 지니가 0이면 진짜 나쁜 광고에도 똑같이 예산을 준다는 뜻이라 그만큼 매출이 깎인다. 이 값은 "좋은가"가 아니라 "멈췄는가"를 보는 데 쓴다.

### 처방 넷과 그 대가는 따로 본다

굳음을 막는 방법은 결국 하나다. 추정값이 낮은 광고에도 예산을 떼어 주는 것이다. 다른 점은 누구에게 얼마를 어떤 명분으로 떼어 주느냐다.

- **ε 탐색** — 하루 노출에서 일정 비율을 떼어 여덟에게 똑같이 나눠 준다.
- **낙관적 초기값** — 아직 안 본 광고의 시작 추정값을 실제보다 높게 잡아 준다.
- **강제 슬롯** — 그날 노출이 0건이 된 광고에게만 몫을 떼어 준다.
- **역확률 가중** — 배분은 그대로 두고 학습 가중치만 고친다.

앞의 셋은 A 를 실제로 되살리지만, 되살리는 속도와 그동안 포기하는 매출이 서로 다르다. 같은 판에 넷을 걸어 잰 손익과 시드 100판 평균은 따로 뗐다.

→ **[굳은 것을 푸는 네 방법과 그 대가](post.html?id=feedback-loop-remedies)**

여기서는 넷 중 마지막 하나만 데리고 다음 절로 간다. 역확률 가중은 예산을 한 푼도 안 쓰는 유일한 처방이라, 한 번 굳은 뒤에 되돌리기가 왜 어려운지를 가장 선명하게 보여 주기 때문이다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-feedback-loop.html?embed=1" height="1960" loading="lazy" title="피드백 루프 미니 데모"></iframe>
<a class="demo-embed-open" href="demo-feedback-loop.html" target="_blank" rel="noopener">↗ 전체 데모로 열기</a>
</div>

## 4. 굳은 뒤에는 되돌리기 어렵다 [무대: 공통]

**그 광고가 뜰 확률이 0이면 1 ÷ 0 이라 계산 자체가 안 된다. 굳음은 그 확률을 0으로 만드는 사건이다.**

되돌리는 계산은 이렇게 한다. 학습 표본마다 "그게 노출될 확률"의 역수를 가중치로 주는 것이다. 그 확률을 **성향점수**(propensity score, 그 건이 뽑힐 확률)라 부른다. 이렇게 가중하는 방법이 **역확률 가중**(IPS)이다.

자주 뜨는 광고의 표본은 가중치를 낮추고, 드물게 뜨는 광고의 표본은 가중치를 높인다. 그러면 "여덟을 똑같이 띄웠다면 봤을 분포"를 로그에서 복원할 수 있다. [위치 편향과 ULTR](post.html?id=position-bias-ultr) 4절이 화면 위치에 대해 같은 계산을 편다.

여기서는 광고별로 재 본다. 재는 값은 "여덟을 똑같이 노출했을 때의 평균 클릭률"이고, 그 진짜 값은 진짜 클릭률 여덟 개의 평균인 2.0875% 다. 굳은 로그에서 이 값을 되찾을 수 있느냐가 이 절의 질문이다.

로그를 볼 구간은 전체 40세대와 최근 7세대 둘로 나누는데, 이 구간을 **창**(window, 학습에 넣을 최근 기간)이라 부른다. 실무가 대개 최근 며칠 창을 쓰는 것은, 오래된 로그를 계속 넣으면 소재가 바뀐 뒤에도 옛 성적이 남기 때문이다.

```python
import statistics
# 앞 블록의 TRUE·ADS·run 을 그대로 쓴다.

TRUE_MEAN = 100 * sum(TRUE.values()) / 8      # 2.0875% — 8개를 똑같이 노출했을 때의 평균


def pad(s, w):   # 한글은 터미널에서 두 칸을 먹는다 — 표를 맞추려고 센다
    return s + ' ' * max(0, w - sum(2 if ord(c) > 0x2000 else 1 for c in s))


def measure(hist, window):
    """창(window) 안의 로그만으로 평균 CTR 을 두 가지 방법으로 잰다.
    raw = 클릭 합 ÷ 노출 합. 로그를 그대로 믿는 값이다.
    ips = 광고마다 1/성향점수 로 가중. 성향점수가 0이면 나눌 수가 없어 빠진다."""
    win = hist[-window:] if window else hist
    imps = {ad: sum(a[ad] for _, a, _, _ in win) for ad in ADS}
    clk = {ad: sum(got[ad] for _, _, got, _ in win) for ad in ADS}
    live = [ad for ad in ADS if imps[ad] > 0]         # 성향점수 > 0 인 광고만
    tot = sum(imps.values())
    w = {ad: tot / imps[ad] for ad in live}           # 1 / 성향점수
    raw = 100 * sum(clk.values()) / tot
    ips = (100 * sum(w[ad] * clk[ad] for ad in live)
           / sum(w[ad] * imps[ad] for ad in live))
    return raw, ips, 8 - len(live)


print('진짜 균등 평균 CTR %.4f%%' % TRUE_MEAN)
print(pad('설정', 26) + '로그 그대로      IPS 가중        성향점수 0')
for label, kw, win in [('기본 · 전체 이력', {}, None),
                       ('기본 · 최근 7세대', {}, 7),
                       ('ε탐색 5% · 최근 7세대', {'mode': 'ε탐색'}, 7),
                       ('강제슬롯 8% · 최근 7세대', {'mode': '강제슬롯'}, 7)]:
    raws, ipss, dead = [], [], []
    for seed in range(1, 31):
        r, i, d = measure(run(seed, **kw)[0], win)
        raws.append(r), ipss.append(i), dead.append(d)
    print(pad(label, 26) + '%.3f±%.3f    %.3f±%.3f    %.1f개'
          % (statistics.mean(raws), statistics.pstdev(raws),
             statistics.mean(ipss), statistics.pstdev(ipss), statistics.mean(dead)))

# 출력:
# 진짜 균등 평균 CTR 2.0875%
# 설정                      로그 그대로      IPS 가중        성향점수 0
# 기본 · 전체 이력          2.369±0.042    1.880±0.105    0.0개
# 기본 · 최근 7세대         2.379±0.052    2.331±0.061    4.0개
# ε탐색 5% · 최근 7세대     2.399±0.039    2.085±0.118    0.0개
# 강제슬롯 8% · 최근 7세대  2.372±0.041    2.081±0.069    0.0개
```

네 줄을 하나씩 읽자. 로그를 그대로 믿으면 어느 설정에서든 2.37% 에서 2.40% 사이가 나오는데, 진짜 값은 2.0875% 다. 고리가 클릭률 높은 광고만 남겼으니 로그의 평균이 위로 뜬 것이다.

이 값을 새 광고의 출발점으로 물려주면 새 광고를 통째로 과대평가한다. 그 값을 믿고 예산을 태우면 그대로 손해가 나니, 예산 결정이 통째로 위로 밀리는 셈이다.

**둘째 줄이 이 절의 핵심이다.** 최근 7세대 창에는 성향점수가 0인 광고가 평균 넷이다. 굳은 뒤라 그 넷은 노출이 없고, 나눗셈의 분모가 0이라 계산에서 통째로 빠진다.

그 결과 역확률 가중이 2.331% 를 내놓는다. 로그를 그대로 믿은 2.379% 를 거의 못 고친 셈이라, **역확률 가중은 로그에 아예 없는 광고를 되살리지 못한다.**

셋째·넷째 줄에서 답이 나온다. 탐색 예산을 켜면 여덟 전부 성향점수가 0보다 크고, 같은 창에서 역확률 가중이 2.085% 와 2.081% 를 낸다. 진짜 값 2.0875% 에 거의 붙은 값이다.

**역확률 가중은 탐색이 있어야 작동한다.** 순서를 뒤집으면 안 된다. 탐색 예산이 성향점수를 만들고, 그 성향점수가 역확률 가중을 가능하게 한다.

이제 첫 줄로 돌아가 보자. 전체 40세대 창에서는 첫날에 여덟이 모두 500건씩 받았으니 성향점수가 0인 광고가 하나도 없다. 그런데 역확률 가중이 1.880% 를 내놓았다. 위로 뜨는 대신 진짜 값보다 아래로 내려간 것이다.

원인은 성향점수를 어디서 가져왔는지에 있다. 이 코드는 성향점수를 실제 배분 비율로 추정하는데, 그 배분 자체가 결과에 의존한다. 밀려난 광고는 첫날 클릭이 적게 나온 광고라, 그 관측 클릭률은 "적게 나왔다는 조건" 아래의 값이어서 아래로 치우쳐 있다.

역확률 가중은 하필 그 치우친 값에 가장 큰 가중치를 얹는다. 노출 500건짜리 광고의 가중치는 234,500건짜리 광고의 469배다. 그래서 추정값이 진짜 값보다 아래로 끌려 내려간다.

셋째·넷째 줄이 잘 나온 이유도 여기 있다. 탐색 예산으로 나가는 노출은 추정값과 무관하게 미리 정해진 몫이라, 그 몫에 대해서는 노출 확률을 우리가 안다. 성향점수를 추정하는 대신 **설계로 박아 넣은** 것이다.

:::deep 더 깊이 — 역확률 가중을 식으로 쓰면
광고 $a$ 의 노출 확률 $e_a$ 로 가중한 평균 클릭률은 아래와 같다. $c_a$ 는 클릭 수, $n_a$ 는 노출 수다.

$$\hat{\mu}_{\text{IPS}} = \frac{\sum_a w_a c_a}{\sum_a w_a n_a}, \qquad w_a = \frac{1}{e_a}$$

$e_a$ 가 진짜 무작위 배정 확률이면 이 추정은 치우침이 없다. 하지만 $e_a$ 를 나중에 관측된 노출 비율로 채우면 그 조건이 깨진다. 밀려난 광고에서는 $n_a$ 가 작고 $w_a$ 가 크므로, 그 광고의 치우친 값이 결과에 크게 실린다.
:::

마지막으로 값의 퍼짐을 보라. ε 탐색의 역확률 가중은 ±0.118 이고 강제 슬롯은 ±0.069 라, 강제 슬롯 쪽이 6할 수준이다. 밀려난 광고 한 개가 한 세대에 받는 표본 크기가 다르기 때문인데, 그 표본 크기가 곧 떼어 준 예산이다.

**강제 슬롯이 사는 것은 매출이 아니라 측정의 정확도다.** 클릭 수로만 고르면 강제 슬롯은 탈락이다. 그런데 그 로그로 다음 분기 예산을 결정해야 한다면 이야기가 달라진다. 얼마를 떼어 줄지는 처방 글에서 잰다.

### 위치 편향·선택 편향과 어디가 다른가

세 이름이 자주 섞여 쓰인다. 경계를 그어 두면 어느 예산을 어느 문제에 써야 하는지 헷갈리지 않는다.

| | 위치 편향 | 선택 편향 | 피드백 루프 편향 |
|---|---|---|---|
| 무엇이 왜곡되나 | 같은 광고의 관측 클릭률 | 학습 표본의 구성 | 학습 표본의 구성이 세대마다 |
| 원인 | 아래 위치는 덜 보인다 | 뜬 광고만 라벨이 붙는다 | 어제 모델이 오늘 표본을 결정한다 |
| 한 세대 안에서 보이나 | 보인다 | 보인다 | 안 보인다 |
| 시간이 지나면 | 그대로 | 그대로 | 심해진다 |
| 되돌릴 수 있나 | 위치를 바꿔 재면 된다 | 성향점수로 가중하면 된다 | 표본이 아예 없으면 못 한다 |
| 대표 처방 | 위치별 성향점수 | 역확률 가중 | 탐색 예산, 낙관적 초기값 |

**위치 편향은 한 세대 안의 문제다.** 같은 광고를 맨 위에 두면 5.0% 가 관측되고 다섯째 자리에 두면 0.75% 가 관측된다. 위치가 관측을 막은 것이라 광고 품질과는 무관하다. 위치만 바꿔 다시 재면 원래 값을 알 수 있으니, 예산을 옮길 근거가 된다.

**선택 편향도 한 세대 안의 문제다.** 학습 데이터에는 뜬 광고만 있고 그 광고에만 클릭 라벨이 붙는다. 그래서 이 편향은 한 세대의 로그만 보고도 지적할 수 있다. [네거티브 샘플링과 편향](post.html?id=negative-sampling-bias) 4절이 그 구조를 정리한다.

**이 글의 편향은 세대를 이어 보아야 보인다.** 마지막 세대 한 줄만 보면 그냥 쏠린 로그다. 첫 세대부터 이어 보아야 그 쏠림이 어디서 왔는지 드러난다.

결정적인 차이가 하나 더 있다. 선택 편향은 성향점수가 0보다 크기만 하면 고칠 수 있는데, 이 고리는 그 성향점수를 0으로 만들어 버린다. 위 출력의 둘째 줄이 바로 그 장면이다.

실제 로그에는 셋이 겹쳐 있다. 위치 성향점수로 위치 편향만 고치면 선택 편향이 남고, 역확률 가중까지 걸어도 세대 사이의 굳음은 그대로 남는다.

### 담장 안에서는 고리가 완전히 닫힌다 [무대: 닫힌 생태계]

담장 안 DSP 에서는 후보 광고를 고르는 것도, 순위를 매기는 것도, 로그를 적는 것도 전부 우리 코드다. 그래서 1절 그림의 화살표 넷이 모두 우리 손 안에 있고, 탐색 예산도 우리가 결정한다.

좋은 점은 성향점수를 정확히 안다는 것이다. 배분 규칙이 우리 것이니 추정할 필요 없이 그냥 기록하면 된다. 나쁜 점은 그 고리에 우연이 전혀 안 섞인다는 것인데, 우리 모델이 안 고른 광고는 그 지면에서 정말로 0번 뜬다. A 처럼 첫날 500건에서 이력이 끝나 버리는 것이다.

| | 담장 안 | 열린 RTB |
|---|---|---|
| 랭킹을 누가 결정하나 | 우리 | 우리가 입찰, 낙찰은 매체 쪽 |
| 성향점수를 아나 | 안다 (기록하면 됨) | 모른다 (낙찰 확률이 남의 손) |
| 노출 0건이 되는 이유 | 우리 모델이 안 골라서 | 우리가 안 골랐거나 경매에서 져서 |
| 고리에 섞이는 우연 | 거의 없다 | 경쟁사 입찰가 변동이 섞인다 |
| 탐색 예산을 누가 대나 | 우리가 낸다 | 우리가 낸다 (경매에서 지면 못 씀) |

담장 안의 실무가 **탐색을 명시적으로 예산에 넣는 것**으로 가는 이유가 이것이다. 아무도 대신 흔들어 주지 않으니, 이 예산을 0으로 두면 3절의 결과가 그대로 나온다. 새 광고를 어떻게 시작시키는지는 [새 광고의 pCTR](post.html?id=cold-start-pctr) 2절이 다룬다.

### 열린 RTB 에서는 고리가 한 번 끊긴다 [무대: 열린 RTB]

밖에서 입찰만 넣는 DSP 는 사정이 조금 다르다. 우리가 입찰가를 높게 써도 낙찰될지는 남이 결정하고, 경쟁사 입찰가가 매일 흔들리니 경매에서 지는 일도 매일 흔들린다. 그 변동이 고리에 우연을 조금 넣어 굳음을 늦춘다.

대신 성향점수가 두 겹이 된다. "우리가 이 광고에 입찰했을 확률"과 "그 입찰이 이겼을 확률"인데, 뒤쪽은 경매에서 지면 경쟁가를 못 봐서 관측되지 않는다. [입찰 가림과 검열된 데이터](post.html?id=bid-shading-censored)가 그 구조를 다룬다.

그래서 열린 RTB 에서는 역확률 가중이 담장 안보다 어렵고, 탐색 예산을 잡아도 경매에서 지면 그 예산을 쓰지도 못한다. 위에서 본 "성향점수를 추정으로 채우는 문제"가 여기서는 예외가 아니라 기본값이다.

두 무대의 공통점은 하나다. 어느 쪽이든 **내가 고른 것만 라벨이 붙는다.** 끊긴 자리가 우연으로 채워지지도 않는다. 경쟁사의 선택도 그들의 모델이 만든 것이라, 우리 입장에서는 무작위가 아니기 때문이다.

## 한눈 정리

| 무엇 | 이 글의 숫자 | 어디서 |
|---|---|---|
| 첫날 500건에서 가장 좋은 광고를 맨 위로 맞힐 확률 | 35.4% | 2절 |
| 첫날 500건에서 그 광고가 상위 네 자리 밖으로 밀릴 확률 | 17.4% | 2절 |
| 노출을 받는 광고 집합이 굳은 세대 | 사흘째 | 3절 |
| 진짜 가장 좋은 A 의 40세대 누적 노출 | 500건 | 3절 |
| 굳음이 안 풀리는 조건 | A 의 언 값이 안에 남은 넷의 진짜 클릭률보다 낮다 | 3절 |
| 누적 지니계수 | 0.000 → 0.479 → 0.563 | 3절 |
| 굳은 뒤 최근 7세대 창의 성향점수 0 광고 | 4개 | 4절 |
| 로그를 그대로 믿었을 때의 평균 클릭률 | 2.369% (진짜 값은 2.0875%) | 4절 |
| 탐색을 켠 뒤 역확률 가중이 낸 값 | 2.085% · 2.081% | 4절 |
| 전체 이력에 역확률 가중만 건 값 | 1.880% — 진짜 값보다 아래 | 4절 |

## 헷갈리기 쉬운 점

- **"모델이 정확해지면 편향이 줄어든다"는 반대다.** 정확한 모델일수록 좋은 광고만 정확히 골라 노출하고, 그러면 로그가 더 좁아진다. 4절 첫 줄의 2.369% 가 그 결과다.
- **역확률 가중을 켰다고 굳음이 풀리지 않는다.** 그 방법은 예산 배분을 바꾸지 않는다. 2.379% 가 2.331% 로 옮겨간 것이 고친 폭의 전부다.
- **탐색 예산은 매출이 아니라 정보를 사는 돈이다.** 이미 옳게 굳은 판에서는 그냥 손해인데, 옳은지 그른지 모르기 때문에 내는 값이다. 그 손익은 처방 글이 잰다.
- **"굳음이 몇 세대에 오나"는 시스템 설정이 결정한다.** 여기서는 광고당 상한이 예산 자리를 넷으로 잘랐다. 그래서 다섯째부터 로그가 끊겼고, 상한이 다르면 그 경계도 달라진다.
- **언 값끼리의 비교에는 정보가 없다.** G 가 A 보다 위에 있는 것은 소수 셋째 자리의 차이다. 그 차이를 만든 첫날의 우연이 마지막 세대의 순위를 아직도 결정하고 있다.

## 더 깊이 보기

- [굳은 것을 푸는 네 방법과 그 대가](post.html?id=feedback-loop-remedies) — 이 글에서 뗀 처방 편
- [탐색과 활용](post.html?id=exploration-exploitation) — 탐색 예산을 어떻게 쓸지 고르는 기준
- [위치 편향과 ULTR](post.html?id=position-bias-ultr) — 역확률 가중의 원형
- [네거티브 샘플링과 학습 데이터 편향](post.html?id=negative-sampling-bias) — 한 세대 안의 선택 편향
- [새 광고의 pCTR — 콜드 스타트](post.html?id=cold-start-pctr) — 표본이 적을 때 값을 빌려 오는 법
- [모델 A/B 테스트](post.html?id=model-ab-testing) — 굳음을 실험으로 잡아내는 설계
- [광고 로그 파이프라인](post.html?id=ad-log-pipeline) — 이 고리가 실제로 도는 물리적 경로
