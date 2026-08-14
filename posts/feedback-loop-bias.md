지면 `main_top` 에 광고 8개가 같은 날 올라왔다. 광고 번호는 `9931` 부터 `9938` 까지다. 첫날 각 광고는 노출 500건씩 받았다. 광고 `9931` 에는 클릭 8건이 붙었다. 광고 `9936` 에는 14건이 붙었다.

39일이 지났다. `9936` 은 노출 102,500건을 받았다. `9931` 은 500건 그대로다. 첫날 이후 `9931` 이 화면에 뜬 적은 한 번도 없다.

두 광고의 진짜 CTR 은 `9931` 이 2.60%, `9936` 이 1.90% 다. 더 좋은 쪽이 안 뜬다. 그리고 안 떴기 때문에 더 좋다는 사실이 로그에 남지 않는다.

이 글의 숫자는 전부 설명을 위해 지어낸 값이다. 다만 시뮬레이션 결과는 아래 파이썬 코드를 실제로 돌려 얻었다. 본문의 숫자는 그 출력과 같다.

> **한 줄 요약:** 광고 모델의 학습 데이터는 어제의 모델이 고른 것이다. 그래서 한 번 밀려난 광고는 추정값이 얼어붙는다. 그 언 값이 다음 날의 순위를 다시 정한다.

**이 글에 나오는 말** — 낯선 이름만 먼저 풀어 둡니다. 본문에서 다시 설명하니 지금 외울 필요는 없습니다.

| 말 | 한 줄 뜻 |
|---|---|
| 굳음 (lock-in) | 한 번 밀려난 광고가 다시는 못 올라오는 상태 |
| 탐색 예산 ε | 좋은지 모르는 광고에 일부러 떼어 주는 노출 몫 |
| 낙관적 초기값 | 아직 안 본 광고의 시작 추정값을 높게 잡는 것 |
| 역확률 가중 (IPS) | 옛 정책이 고를 확률이 낮았던 건을 그만큼 크게 세는 방법 |
| 지니계수 | 노출이 소수 광고로 쏠린 정도. 0이면 똑같이 나눠 가진 것 |
| 선택 편향 | 뜬 광고에만 클릭 라벨이 붙어 생기는 치우침 |
| 위치 편향 | 아래 자리는 덜 보여서 클릭률이 낮게 나오는 것 |

> **골라 읽는 법** — 절이 10개인 긴 글입니다. 처음부터 다 읽지 않아도 됩니다.
>
> - 데이터가 어디서 되돌아오나 → 1절
> - 첫날 표본이 왜 순위를 뒤집나 → 2절
> - 40일을 돌린 결과와 굳음 → 3~4절
> - 쏠림을 숫자로 → 5절
> - 처방 넷과 그 대가 → 6~7절
> - 굳은 뒤에 되돌리기가 왜 어려운가 → 8절
> - 비슷한 이름의 편향 둘과 어디가 다른가 → 9절
> - 담장 안과 열린 RTB 의 차이 → 10절

---

## 1. 어제 고른 것만 오늘의 데이터가 된다

**모델이 랭킹을 정한다. 랭킹이 노출을 정한다. 노출이 로그를 정한다. 그 로그가 내일 모델을 정한다.**

이 네 단계는 하루에 한 바퀴 돈다. 돌아서 제자리로 오는 이 경로를 **고리**라 부른다. 한 바퀴가 **한 세대**다. 그래서 이 글의 40세대는 40일이다.

광고 모델의 학습 데이터는 밖에서 주어지지 않는다. 어제 배포된 모델이 오늘 뜰 광고를 골랐다. 뜬 광고에만 노출 줄이 생긴다. 그 줄에만 클릭 여부가 붙는다. 뜨지 않은 광고는 로그에 줄이 0개다. 오늘 밤 학습기는 그 로그를 읽어 내일 모델을 만든다.

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 500 300" role="img" aria-label="네 상자가 시계 방향 고리를 이룬다. 어제까지의 로그에서 오늘의 모델로, 모델에서 랭킹과 배분으로, 랭킹에서 오늘의 노출 2만 건으로, 노출에서 다시 로그로 화살표가 돌아온다. 아래에는 이 세대에 노출 0건을 받은 광고 9931·9934·9938 상자가 있고, 그 상자에서 로그로 가는 점선이 X 표시에서 끊겨 있다." style="width:100%; max-width:500px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="feedback1-arr" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto"><path d="M0,0 L7.5,3 L0,6 Z" style="fill:var(--accent-primary)"/></marker>
</defs>
<rect x="20" y="40" width="180" height="52" style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="110" y="62" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">어제까지의 로그</text>
<text x="110" y="80" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">뜬 광고만 줄이 있다</text>
<rect x="300" y="40" width="180" height="52" style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="390" y="62" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">오늘의 모델</text>
<text x="390" y="80" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">광고 8개의 추정 CTR</text>
<rect x="300" y="150" width="180" height="52" style="fill:var(--bg-secondary); stroke:var(--accent-primary); stroke-width:2"/>
<text x="390" y="172" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">랭킹과 배분</text>
<text x="390" y="190" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">상한 6,000건씩 채운다</text>
<rect x="20" y="150" width="180" height="52" style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="110" y="172" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">오늘의 노출 20,000건</text>
<text x="110" y="190" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">상위 넷만 화면에 뜬다</text>
<line x1="200" y1="66" x2="294" y2="66" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#feedback1-arr)"/>
<text x="247" y="58" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">학습</text>
<line x1="390" y1="92" x2="390" y2="144" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#feedback1-arr)"/>
<text x="396" y="122" style="font-size:12.5px; fill:var(--text-muted)">내림차순</text>
<line x1="300" y1="176" x2="206" y2="176" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#feedback1-arr)"/>
<text x="253" y="220" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">노출</text>
<line x1="110" y1="150" x2="110" y2="98" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#feedback1-arr)"/>
<text x="104" y="122" text-anchor="end" style="font-size:12.5px; fill:var(--text-muted)">클릭 로그</text>
<rect x="20" y="244" width="160" height="44" style="fill:none; stroke:var(--text-muted); stroke-width:1.3; stroke-dasharray:6 4"/>
<text x="100" y="263" text-anchor="middle" style="font-size:12.5px; fill:var(--text-primary)">9931 · 9934 · 9938</text>
<text x="100" y="280" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">이 세대 노출 0건</text>
<line x1="180" y1="266" x2="216" y2="266" style="stroke:var(--text-muted); stroke-width:1.6; stroke-dasharray:5 4"/>
<line x1="222" y1="259" x2="236" y2="273" style="stroke:var(--state-bad); stroke-width:2.4"/>
<line x1="236" y1="259" x2="222" y2="273" style="stroke:var(--state-bad); stroke-width:2.4"/>
<line x1="242" y1="266" x2="284" y2="266" style="stroke:var(--text-muted); stroke-width:1; stroke-dasharray:2 5"/>
<rect x="290" y="244" width="190" height="44" style="fill:none; stroke:var(--border-color); stroke-width:1.5"/>
<text x="385" y="263" text-anchor="middle" style="font-size:12.5px; fill:var(--text-primary)">로그에 줄이 0개</text>
<text x="385" y="280" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">추정값이 어제 그대로</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">위 네 상자는 매일 한 바퀴 돈다. 아래 줄은 그 고리에 못 들어간 광고다. 노출이 0건이면 로그가 0줄이고, 로그가 0줄이면 추정값이 어제 값에서 멈춘다.</figcaption>
</figure>

이 고리에는 밖에서 들어오는 정보가 없다. 오늘 뜬 것은 어제 로그가 정했다. 어제 로그는 그저께 모델이 정했다. 그래서 첫날의 우연한 오차가 지워지지 않는다. 그 오차는 그대로 다음 세대로 넘어간다. 오차를 지우려면 오차가 난 광고를 다시 띄워 봐야 한다. 그런데 오차 때문에 그 광고가 안 뜬다.

이 글은 그 고리를 40번 돌린다. 설정은 아래와 같이 고정한다.

| 항목 | 값 | 왜 이 값인가 |
|---|---|---|
| 광고 수 | 8개 (`9931`~`9938`) | 한 지면의 한 광고군 |
| 하루 노출 | 20,000건 | 지면 `main_top` 한 곳 몫 |
| 광고당 하루 상한 | 6,000건 | 예산·빈도 제한이 만드는 상한 |
| 첫날 상한 | 광고당 500건 | 신규 광고 보호 상한 |
| 세대 수 | 40 | 하루 한 번 재학습, 40일 |
| 추정 방법 | (누적 클릭+1) ÷ (누적 노출+2) | 분모가 0이 되지 않게 |

상한 6,000건이 이 글의 핵심 장치다. 상한이 있으면 1위가 전부 가져가지 않는다. 20,000건은 6,000 + 6,000 + 6,000 + 2,000 으로 나뉜다. **추정 순위 5위부터는 그날 노출이 0건이다.** 5위 아래로 밀리는 순간 그 광고의 로그가 끊긴다.

다른 글의 규모와 다른 점을 짚어 둔다. [광고 로그 파이프라인](post.html?id=ad-log-pipeline)이 쓰는 하루 2억 2,800만 줄은 전 지면·전 광고를 합친 수다. 여기 20,000건은 지면 한 곳의 광고 8개 몫이다. 이 고리는 전사 단위가 아니라 광고군 단위로 돈다. 그래서 이 글은 광고군 하나만 본다.

## 2. 첫날 500건이 순위를 뒤집는다

**500건에서 잰 CTR 은 오차가 0.7%p 다. 진짜 1등과 4등의 차이는 0.4%p 다.**

첫날 8개 광고는 노출 500건씩을 똑같이 받는다. 이때는 아직 어느 광고가 좋은지 모르기 때문이다. 첫날이 끝나면 광고마다 클릭 수가 하나씩 붙는다. 그 숫자가 둘째 날의 순위를 정한다.

문제는 500건이 작다는 것이다. 진짜 CTR 이 2.60% 인 광고는 500건에서 평균 13건을 받는다. 8건이 나올 수도 있고 18건이 나올 수도 있다. 8건이 나오면 추정 CTR 은 1.79% 가 된다. 진짜 1.90% 인 광고가 14건을 받으면 추정 CTR 은 2.99% 다. 재는 오차가 재려는 차이보다 크다.

:::deep 더 깊이 — 오차 0.7%p 는 어디서 나온 값인가
500건에 진짜 CTR 2.60% 면 클릭 수의 평균은 500 × 0.026 = 13건이다. 표준편차는 3.6건이다.

클릭 3.6건을 CTR 로 옮기면 3.6 ÷ 500 = 0.72%p 다. 이 값이 500건에서 잰 CTR 의 표준오차다. 진짜 1등 2.60% 와 4등 2.20% 의 차이는 0.40%p 다. 그래서 500건짜리 표본으로는 둘의 순서를 못 가른다.

$$\mathrm{SE} = \sqrt{\frac{p(1-p)}{n}} = \sqrt{\frac{0.026 \times 0.974}{500}} = 0.0072$$

표본이 4배가 되면 이 값은 절반이 된다. 아래 코드가 500건·2,000건·10,000건을 나란히 돌리는 이유다.
:::

아래 표가 이 글이 쓰는 첫날 결과다. 시드 37로 실제 뽑은 값이다.

| 광고 | 진짜 CTR | 첫날 노출 | 첫날 클릭 | 추정 CTR | 추정 순위 |
|---|---|---|---|---|---|
| `9931` | 2.60% | 500 | 8 | 1.793% | 6위 |
| `9932` | 2.40% | 500 | 10 | 2.191% | 3위 |
| `9933` | 2.30% | 500 | 12 | 2.590% | 2위 |
| `9934` | 2.20% | 500 | 8 | 1.793% | 7위 |
| `9935` | 2.10% | 500 | 9 | 1.992% | 5위 |
| `9936` | 1.90% | 500 | 14 | 2.988% | 1위 |
| `9937` | 1.70% | 500 | 10 | 2.191% | 4위 |
| `9938` | 1.50% | 500 | 6 | 1.394% | 8위 |

클릭 합계는 77건이고 노출 합계는 4,000건이다. 진짜 순위와 추정 순위를 나란히 보면 1위와 6위가 통째로 바뀌어 있다. 진짜 꼴찌에서 두 번째인 `9937` 이 4위 자리를 차지했다. 그리고 4위까지만 둘째 날 노출을 받는다.

이런 뒤집힘이 얼마나 흔한지 세어 보자. 표본 크기를 바꿔 가며 1,000판씩 돌린다.

```python
import random

# 광고 8개의 '진짜' CTR. 시스템은 이 값을 모른다 — 우리만 안다.
TRUE = {9931: .0260, 9932: .0240, 9933: .0230, 9934: .0220,
        9935: .0210, 9936: .0190, 9937: .0170, 9938: .0150}
ADS = list(TRUE)


def cold_start_rank(rng, n):
    """8개에 n건씩 똑같이 노출한 뒤 관측 CTR 로 순위를 매긴다.
    돌려주는 값은 진짜 1위 광고 9931 이 몇 위로 추정됐나 다."""
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

500건에서는 진짜 1위를 1위로 맞히는 판이 35.4% 뿐이다. 그리고 17.4% 의 판에서 진짜 1위가 상위 4자리 밖으로 밀린다. 10,000건을 주면 5위 밖으로 밀리는 판이 0.1% 로 떨어진다. 첫날 표본이 크면 이 문제는 거의 사라진다.

그런데 첫날 표본을 크게 주는 것 자체가 비용이다. 좋은지 나쁜지 모르는 광고 8개에 10,000건씩이면 하루 80,000건이다. 하루 예산이 20,000건인 지면에서는 나흘치다. 그래서 실무는 500건 쪽을 고른다. 그리고 그 대가를 다음 39세대 동안 치른다.

## 3. 40일을 돌려 본다 — 3일 만에 굳는다

**둘째 날부터 `9931` 의 노출은 0건이다. 그리고 40세대까지 0건이다.**

이제 고리를 돌린다. 매 세대 시작에 누적 로그로 추정 CTR 을 다시 계산한다. 그리고 내림차순으로 상한까지 채운다. 이 코드가 이 글의 나머지 전부를 만든다.

```python
import random
# 앞 블록의 TRUE·ADS 를 그대로 쓴다.

N, CAP, GENS = 20000, 6000, 40      # 하루 노출 · 광고당 하루 상한 · 세대 수


def allocate(est):
    """추정 CTR 이 높은 광고부터 상한까지 채운다. 20,000건이 떨어지면 끝이다.
    아래로 밀린 광고는 그날 노출이 0건이고, 그래서 로그도 0줄이다."""
    a = {ad: 0 for ad in ADS}
    left = N
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


def run(seed):
    rng = random.Random(seed)
    imps = {ad: 0 for ad in ADS}
    clicks = {ad: 0 for ad in ADS}
    hist = []
    for g in range(1, GENS + 1):
        if g == 1:
            a = {ad: 500 for ad in ADS}                 # 신규 광고는 첫날 500건까지
        else:
            est = {ad: (clicks[ad] + 1) / (imps[ad] + 2) for ad in ADS}
            a = allocate(est)                           # 어제까지의 로그로 오늘을 정한다
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

세대 2에서 `9931` · `9934` · `9935` · `9938` 이 한꺼번에 0건이 된다. 세대 3에서 `9937` 이 빠지고 `9935` 가 들어온다. 세대 4부터는 노출을 받는 광고 넷이 `9932` · `9933` · `9935` · `9936` 으로 고정된다. **노출을 받는 광고 집합이 마지막으로 바뀐 날이 3일째다.** 그 뒤 37세대 동안 아무도 새로 들어오지 못한다. 나가는 광고도 없다.

:::deep 더 깊이 — 안에 남은 넷 사이에서는 자리가 더 바뀐다
노출을 받는 넷은 3세대에 고정되지만 그 안의 순서는 조금 더 흔들린다. `9935` 와 `9936` 이 6,000건 자리와 2,000건 자리를 번갈아 가진다. 두 광고가 자리를 굳히는 것은 9세대다.

이 흔들림은 이미 안에 들어온 넷 사이의 일이다. 밖으로 밀려난 넷에게는 아무 영향이 없다. 그래서 이 글이 세는 굳음은 안쪽 순서가 아니다. "노출을 받는 광고 집합이 마지막으로 바뀐 세대"로 센다. 안쪽 순서까지 세면 9세대가 되지만 밖에 있는 광고에게는 뜻이 없는 숫자다.
:::

<figure style="text-align:center; margin:2rem 0;">
<div class="table-wrapper">
<svg viewBox="0 0 510 300" role="img" aria-label="광고 8개의 40세대 노출 이력을 가로 띠로 그린 그림. 왼쪽에 광고 번호와 진짜 CTR, 오른쪽 끝에 40세대 누적 노출이 있다. 9932와 9933은 2세대부터 끝까지 굵은 띠가 이어진다. 9935는 3세대부터 들어와 9세대부터 굵은 띠가 이어지고, 9936은 반대로 9세대부터 얇은 띠로 내려앉는다. 9931·9934·9938은 1세대의 아주 얇은 조각 하나만 있고 그 뒤가 비어 있다. 9937은 2세대 조각 하나가 더 있을 뿐이다." style="width:100%; min-width:460px; max-width:510px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="feedback3-arr" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto"><path d="M0,0 L7.5,3 L0,6 Z" style="fill:var(--text-muted)"/></marker>
</defs>
<text x="6" y="20" style="font-size:12.5px; fill:var(--text-muted)">광고 · 진짜 CTR</text>
<text x="504" y="20" text-anchor="end" style="font-size:12.5px; fill:var(--text-muted)">40세대 누적 노출</text>
<text x="132" y="36" style="font-size:12.5px; fill:var(--text-muted)">세대 1</text>
<text x="479" y="36" text-anchor="end" style="font-size:12.5px; fill:var(--text-muted)">세대 40</text>
<text x="6" y="55" style="font-size:12.5px; fill:var(--text-primary)">9931</text><text x="52" y="55" style="font-size:12.5px; fill:var(--text-muted)">2.60%</text>
<line x1="132" y1="52" x2="479" y2="52" style="stroke:var(--rule); stroke-width:1; stroke-dasharray:2 4"/>
<rect x="132" y="56" width="7.5" height="3" style="fill:var(--grey)"/>
<text x="504" y="55" text-anchor="end" style="font-size:12.5px; font-family:var(--font-mono); fill:var(--text-secondary)">500</text>
<text x="6" y="82" style="font-size:12.5px; fill:var(--text-primary)">9932</text><text x="52" y="82" style="font-size:12.5px; fill:var(--text-muted)">2.40%</text>
<line x1="132" y1="79" x2="479" y2="79" style="stroke:var(--rule); stroke-width:1; stroke-dasharray:2 4"/>
<rect x="132" y="83" width="7.5" height="3" style="fill:var(--grey)"/>
<rect x="140.7" y="72" width="338.1" height="14" style="fill:var(--accent-primary)"/>
<text x="504" y="82" text-anchor="end" style="font-size:12.5px; font-family:var(--font-mono); fill:var(--text-secondary)">234,500</text>
<text x="6" y="109" style="font-size:12.5px; fill:var(--text-primary)">9933</text><text x="52" y="109" style="font-size:12.5px; fill:var(--text-muted)">2.30%</text>
<line x1="132" y1="106" x2="479" y2="106" style="stroke:var(--rule); stroke-width:1; stroke-dasharray:2 4"/>
<rect x="132" y="110" width="7.5" height="3" style="fill:var(--grey)"/>
<rect x="140.7" y="99" width="338.1" height="14" style="fill:var(--accent-primary)"/>
<text x="504" y="109" text-anchor="end" style="font-size:12.5px; font-family:var(--font-mono); fill:var(--text-secondary)">234,500</text>
<text x="6" y="136" style="font-size:12.5px; fill:var(--text-primary)">9934</text><text x="52" y="136" style="font-size:12.5px; fill:var(--text-muted)">2.20%</text>
<line x1="132" y1="133" x2="479" y2="133" style="stroke:var(--rule); stroke-width:1; stroke-dasharray:2 4"/>
<rect x="132" y="137" width="7.5" height="3" style="fill:var(--grey)"/>
<text x="504" y="136" text-anchor="end" style="font-size:12.5px; font-family:var(--font-mono); fill:var(--text-secondary)">500</text>
<text x="6" y="163" style="font-size:12.5px; fill:var(--text-primary)">9935</text><text x="52" y="163" style="font-size:12.5px; fill:var(--text-muted)">2.10%</text>
<line x1="132" y1="160" x2="479" y2="160" style="stroke:var(--rule); stroke-width:1; stroke-dasharray:2 4"/>
<rect x="132" y="164" width="7.5" height="3" style="fill:var(--grey)"/>
<rect x="149.4" y="161" width="7.5" height="6" style="fill:var(--accent-secondary)"/>
<rect x="158.1" y="153" width="7.5" height="14" style="fill:var(--accent-primary)"/>
<rect x="166.8" y="161" width="33.6" height="6" style="fill:var(--accent-secondary)"/>
<rect x="201.6" y="153" width="277.2" height="14" style="fill:var(--accent-primary)"/>
<text x="504" y="163" text-anchor="end" style="font-size:12.5px; font-family:var(--font-mono); fill:var(--text-secondary)">208,500</text>
<text x="6" y="190" style="font-size:12.5px; fill:var(--text-primary)">9936</text><text x="52" y="190" style="font-size:12.5px; fill:var(--text-muted)">1.90%</text>
<line x1="132" y1="187" x2="479" y2="187" style="stroke:var(--rule); stroke-width:1; stroke-dasharray:2 4"/>
<rect x="132" y="191" width="7.5" height="3" style="fill:var(--grey)"/>
<rect x="140.7" y="180" width="16.2" height="14" style="fill:var(--accent-primary)"/>
<rect x="158.1" y="188" width="7.5" height="6" style="fill:var(--accent-secondary)"/>
<rect x="166.8" y="180" width="33.6" height="14" style="fill:var(--accent-primary)"/>
<rect x="201.6" y="188" width="277.2" height="6" style="fill:var(--accent-secondary)"/>
<text x="504" y="190" text-anchor="end" style="font-size:12.5px; font-family:var(--font-mono); fill:var(--text-secondary)">102,500</text>
<text x="6" y="217" style="font-size:12.5px; fill:var(--text-primary)">9937</text><text x="52" y="217" style="font-size:12.5px; fill:var(--text-muted)">1.70%</text>
<line x1="132" y1="214" x2="479" y2="214" style="stroke:var(--rule); stroke-width:1; stroke-dasharray:2 4"/>
<rect x="132" y="218" width="7.5" height="3" style="fill:var(--grey)"/>
<rect x="140.7" y="215" width="7.5" height="6" style="fill:var(--accent-secondary)"/>
<text x="504" y="217" text-anchor="end" style="font-size:12.5px; font-family:var(--font-mono); fill:var(--text-secondary)">2,500</text>
<text x="6" y="244" style="font-size:12.5px; fill:var(--text-primary)">9938</text><text x="52" y="244" style="font-size:12.5px; fill:var(--text-muted)">1.50%</text>
<line x1="132" y1="241" x2="479" y2="241" style="stroke:var(--rule); stroke-width:1; stroke-dasharray:2 4"/>
<rect x="132" y="245" width="7.5" height="3" style="fill:var(--grey)"/>
<text x="504" y="244" text-anchor="end" style="font-size:12.5px; font-family:var(--font-mono); fill:var(--text-secondary)">500</text>
<line x1="132" y1="268" x2="479" y2="268" style="stroke:var(--text-muted); stroke-width:1.2" marker-end="url(#feedback3-arr)"/>
<rect x="132" y="278" width="12" height="14" style="fill:var(--accent-primary)"/>
<text x="150" y="290" style="font-size:12.5px; fill:var(--text-muted)">6,000건</text>
<rect x="206" y="286" width="12" height="6" style="fill:var(--accent-secondary)"/>
<text x="224" y="290" style="font-size:12.5px; fill:var(--text-muted)">2,000건</text>
<rect x="280" y="289" width="12" height="3" style="fill:var(--grey)"/>
<text x="298" y="290" style="font-size:12.5px; fill:var(--text-muted)">500건</text>
<text x="356" y="290" style="font-size:12.5px; fill:var(--text-muted)">빈 자리는 0건</text>
</svg>
</div>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">위에서 셋째 줄까지가 진짜 CTR 상위 셋이다. 그런데 굵은 띠가 끝까지 이어지는 줄은 둘째·셋째뿐이다. 맨 위 줄은 왼쪽 끝의 500건 조각 하나로 끝난다.</figcaption>
</figure>

40세대가 끝나면 누적 노출이 이렇게 갈린다. `9932` 와 `9933` 이 각각 234,500건이다. `9935` 가 208,500건, `9936` 이 102,500건이다. 나머지 넷을 다 합쳐도 4,000건이다. 전체 784,000건 중 0.5% 다.

## 4. 왜 다시 안 올라오나

**밀려난 광고의 추정값은 그날 값에서 멈춘다. 안에 있는 광고의 추정값만 진짜 값으로 다가간다.**

굳음이 풀리려면 밖에 있는 광고의 추정값이 안에 있는 광고를 넘어서야 한다. 그런데 밖에 있는 광고는 새 데이터가 없다. 새 데이터가 없으면 추정값이 안 움직인다. 움직이는 쪽은 안에 있는 광고뿐이다. 즉 굳음이 풀리는 유일한 길은 **안에 있는 광고의 추정값이 스스로 내려가는 것**이다.

40세대가 끝난 시점의 광고별 상태다.

| 광고 | 진짜 CTR | 누적 노출 | 누적 클릭 | 40세대째 추정 CTR | 상태 |
|---|---|---|---|---|---|
| `9931` | 2.60% | 500 | 8 | 1.793% | 1세대에 언 값 |
| `9932` | 2.40% | 234,500 | 5,545 | 2.365% | 살아 있음 |
| `9933` | 2.30% | 234,500 | 5,410 | 2.307% | 살아 있음 |
| `9934` | 2.20% | 500 | 8 | 1.793% | 1세대에 언 값 |
| `9935` | 2.10% | 208,500 | 4,368 | 2.095% | 살아 있음 |
| `9936` | 1.90% | 102,500 | 1,961 | 1.914% | 살아 있음 |
| `9937` | 1.70% | 2,500 | 44 | 1.799% | 2세대에 언 값 |
| `9938` | 1.50% | 500 | 6 | 1.394% | 1세대에 언 값 |

노출 합계는 784,000건이고 클릭 합계는 17,350건이다. 살아 있는 넷은 추정값이 진짜 값에서 0.03%p 안쪽까지 붙었다. 언 넷은 첫날 뽑힌 값 그대로다.

이제 `9931` 이 돌아올 조건을 계산해 보자. `9931` 의 언 값은 1.793% 다. 노출 넷째 자리를 차지한 `9936` 의 추정값은 1.914% 다. `9931` 이 자리를 되찾으려면 `9936` 이 1.793% 아래로 내려가야 한다. 그런데 `9936` 의 진짜 CTR 은 1.90% 다. 표본이 쌓일수록 `9936` 의 추정값은 1.90% 로 수렴한다. **1.793% 아래로 갈 이유가 없다.**

`9937` 도 같은 벽에 걸렸다. `9937` 은 2세대에 2,000건을 받고 나서 얼었다. 그 언 값이 1.799% 다. 이 값이 `9931` 의 1.793% 보다 0.006%p 높다. 즉 진짜 CTR 1.70% 인 광고가 진짜 2.60% 인 광고보다 영원히 위에 있다. 두 값 다 첫날 우연이 남긴 것이다. 그 우연이 39세대째 순위를 정하고 있다.

**굳음(lock-in)의 정의는 이것이다.** 밖으로 밀려난 광고의 언 추정값을 보자. 그 값이 안에 남은 광고들의 진짜 CTR 보다 전부 낮은 상태다. 이 상태가 되면 되돌릴 힘이 시스템 안에 없다. 이 판에서는 3세대에 그 상태에 들어갔다.

## 5. 쏠림이 어디서 멈추나

**쏠림은 2세대에 0.479 로 한 번 뛴다. 그다음부터 아주 천천히 0.575 로 간다.**

노출이 얼마나 쏠렸는지는 숫자 하나로 잴 수 있다. 그 숫자를 **지니계수**라 부른다. 8개가 똑같이 나눠 가지면 0이다. 한 광고가 다 가져가면 1에 가깝다. 여기서는 누적 노출 점유율로 잰다.

완전히 굳은 배분의 값을 먼저 구해 두면 기준이 생긴다. 배분이 6,000 · 6,000 · 6,000 · 2,000 이고 나머지 넷은 0건인 상태다. 점유율로는 0.3 · 0.3 · 0.3 · 0.1 이고 나머지 넷은 0이다. 이 값의 지니계수는 0.575 다. **누적 지니계수는 이 값을 향해 올라가고, 넘지 않는다.**

:::deep 더 깊이 — 0.575 를 손으로 구하기
3절 코드의 `gini` 함수는 점유율을 오름차순으로 정렬한 뒤 아래 식을 쓴다. $n$ 은 광고 수 8이다. $x_i$ 는 $i$ 번째로 작은 점유율이다.

$$G = \frac{2\sum_{i=1}^{n} i \cdot x_i}{n \sum_i x_i} - \frac{n+1}{n}$$

점유율을 오름차순으로 놓으면 0 · 0 · 0 · 0 · 0.1 · 0.3 · 0.3 · 0.3 이다. 분자 안의 합은 5×0.1 + 6×0.3 + 7×0.3 + 8×0.3 = 6.8 이다. 그러면 $G = 2 \times 6.8 / 8 - 9/8 = 0.575$ 가 된다.

이 값이 상한인 이유는 하나다. 누적 노출은 첫날의 균등 배분 4,000건을 계속 품고 있다. 그 4,000건이 쏠림을 조금 낮춘다. 세대가 늘면 4,000건의 비중이 줄어든다. 그래서 누적 지니계수가 0.575 에 점점 가까워진다.
:::

아래 표의 오른쪽 세 열은 6절에서 걸어 볼 처방이다. 지금은 기본 열만 보면 된다.

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

기본 열을 보면 2세대 한 번에 0.479 까지 뛴다. 첫날의 균등 배분이 단 한 번의 순위 매김으로 지워진 것이다. 그 뒤 38세대 동안 0.084 밖에 더 안 오른다. **쏠림은 천천히 심해지는 것이 아니다.** 한 번에 정해지고 그 뒤로는 유지된다.

지니계수가 멈추는 것 자체가 굳음의 신호다. 값이 계속 오르내리면 노출 자리의 주인이 아직 바뀌고 있다는 뜻이다. 낙관 초기값 열을 보라. 3세대에 0.136 까지 떨어졌다가 다시 올라간다. 자리를 돌아가며 나눠 갖는 중이라 누적 점유율이 한 번 평평해진 것이다.

주의할 점 하나. **지니계수가 낮다고 좋은 것이 아니다.** 지니계수가 0이면 진짜 나쁜 광고에도 똑같이 노출을 준다는 뜻이다. 이 값은 "좋은가"가 아니라 "멈췄는가"를 보는 데 쓴다. 볼 것은 값 자체가 아니라 값의 변화가 사라진 순간이다.

## 6. 처방 넷을 같은 판에 걸어 본다

**넷 다 `9931` 을 되살린다. 되살리는 속도와 그 대가가 다르다.**

굳음을 막는 방법은 결국 하나다. 추정값이 낮은 광고에도 노출을 주는 것이다. 다른 점은 누구에게 얼마를 어떤 명분으로 주느냐다. 네 가지를 같은 시드에 걸어 본다.

먼저 이름 넷을 풀어 둔다.

- **ε 탐색** — 하루 노출에서 일정 비율을 떼어 8개에 똑같이 나눠 준다. ε 은 그 비율이다.
- **낙관적 초기값** — 아직 안 본 광고의 시작 추정값을 실제보다 높게 잡는다. 그러면 안 본 광고가 순위 위로 올라온다.
- **역확률 가중(IPS)** — 배분은 그대로 두고 학습 가중치만 고친다. 옛 배분이 그 광고를 고를 확률의 역수로 가중한다.
- **강제 슬롯** — 그날 노출이 0건이 된 광고에게만 몫을 떼어 준다.

| 처방 | 규칙 | 탐색에 쓰는 노출 | 한 광고가 받는 몫 |
|---|---|---|---|
| ε 탐색 5% | 20,000건 중 1,000건을 8개에 균등 분배 | 1,000건 | 125건 (모든 광고) |
| 낙관 초기값 | 안 본 광고를 3.5% 라고 가정하고 시작 | 정해진 값 없음 | 그때그때 다름 |
| 역확률 가중 (IPS) | 학습 표본에 1÷노출확률 가중 | 0건 | 0건 |
| 강제 슬롯 8% | 20,000건 중 1,600건을 0건 광고에게만 | 1,600건 | 400건 (밀려난 넷) |

**역확률 가중만 노출을 하나도 쓰지 않는다.** 나머지 셋은 배분을 바꾸는 처방이다. 역확률 가중은 배분을 그대로 둔 채 학습 가중치만 바꾼다. 이 차이가 8절의 결론을 만든다. 지금은 배분을 바꾸는 셋을 먼저 본다.

```python
import random
# 앞 블록의 TRUE·ADS·N·CAP·GENS·allocate·gini 를 그대로 쓴다.


def run2(seed, mode='기본', eps=0.05, slot=1600, pm=None, pk=None):
    rng = random.Random(seed)
    imps = {ad: 0 for ad in ADS}
    clicks = {ad: 0 for ad in ADS}
    hist = []
    for g in range(1, GENS + 1):
        if g == 1:
            a = {ad: 500 for ad in ADS}
        else:
            if pm is None:
                est = {ad: (clicks[ad] + 1) / (imps[ad] + 2) for ad in ADS}
            else:   # 낙관: 아직 안 본 광고를 pm(=3.5%) 이라고 우기고 시작한다
                est = {ad: (pm * pk + clicks[ad]) / (pk + imps[ad]) for ad in ADS}
            if mode == 'ε탐색':                      # 8개에 똑같이 흩뿌린다
                per = int(N * eps) // 8
                a = allocate_n(est, N - per * 8)
                for ad in ADS:
                    a[ad] += per
            elif mode == '강제슬롯':                  # 0건 받은 광고에게만 준다
                a = allocate_n(est, N - slot)
                out = [ad for ad in ADS if a[ad] == 0]
                for ad in out:
                    a[ad] += slot // len(out)
            else:
                a = allocate(est)
        got = {ad: sum(rng.random() < TRUE[ad] for _ in range(a[ad])) for ad in ADS}
        for ad in ADS:
            imps[ad] += a[ad]
            clicks[ad] += got[ad]
        hist.append((g, a, got, gini([imps[x] for x in ADS])))
    return hist, imps, clicks


def allocate_n(est, total):
    a, left = {ad: 0 for ad in ADS}, total
    for ad in sorted(ADS, key=lambda x: -est[x]):
        a[ad] = min(CAP, left)
        left -= a[ad]
        if left == 0:
            break
    return a


def lock_gen(hist):
    served = [frozenset(x for x in ADS if a[x] > 0) for _, a, _, _ in hist]
    last = 1
    for i in range(1, len(served)):
        if served[i] != served[i - 1]:
            last = i + 1
    return '없음' if len(served[-1]) == 8 else '%d세대' % last


def revived(hist):
    for g, a, _, _ in hist[1:]:
        if 9931 in sorted(ADS, key=lambda x: -a[x])[:3]:
            return '%d세대' % g
    return '없음'


def pad(s, w):   # 한글은 터미널에서 두 칸을 먹는다 — 표를 맞추려고 센다
    return s + ' ' * max(0, w - sum(2 if ord(c) > 0x2000 else 1 for c in s))


print(pad('처방', 14) + pad('굳음', 10) + pad('9931 복귀', 12)
      + '9931 노출  40세대 클릭  1~5세대 클릭   지니')
for name, kw in [('기본', {}), ('ε탐색 5%', {'mode': 'ε탐색'}),
                 ('낙관 초기값', {'pm': .035, 'pk': 2000}),
                 ('강제슬롯 8%', {'mode': '강제슬롯'})]:
    h, imps, clicks = run2(37, **kw)
    first5 = sum(sum(got.values()) for g, a, got, gi in h[:5])
    print(pad(name, 14) + pad(lock_gen(h), 10) + pad(revived(h), 12)
          + '%9d %12d %13d %6.3f'
          % (imps[9931], sum(clicks.values()), first5, h[-1][3]))

rng = random.Random(37)                       # 진짜 CTR 을 처음부터 알았다면
best = allocate(TRUE)                         # 6000·6000·6000·2000 으로 고정 배분
tot = sum(sum(rng.random() < TRUE[ad] for _ in range(500 if g == 1 else best[ad]))
          for g in range(1, GENS + 1) for ad in ADS)
print('참고 — 진짜 CTR 을 알고 배분했다면 40세대 클릭 %d건' % tot)

# 출력:
# 처방          굳음      9931 복귀   9931 노출  40세대 클릭  1~5세대 클릭   지니
# 기본          3세대     없음              500        17350          1813  0.563
# ε탐색 5%      없음      8세대          204375        18541          1844  0.522
# 낙관 초기값   31세대    3세대          222500        18546          1812  0.510
# 강제슬롯 8%   없음      3세대          223300        18515          1914  0.510
# 참고 — 진짜 CTR 을 알고 배분했다면 40세대 클릭 18831건
```

세 처방 다 `9931` 을 되살렸다. 속도가 다르다. 낙관 초기값과 강제 슬롯은 3세대에 `9931` 을 상위 셋 안으로 올린다. ε 탐색은 8세대가 걸린다. 이유는 한 세대에 주는 표본 크기다. ε 탐색은 `9931` 에게 세대당 125건을 준다. 강제 슬롯은 400건을 준다. 125건짜리 표본으로 1.793% 라는 언 값을 뒤집으려면 여러 세대가 필요하다.

굳음 칸도 다르다. ε 탐색과 강제 슬롯은 8개 전부가 매 세대 노출을 받는다. 그래서 노출 집합이 아예 굳지 않는다. 낙관 초기값은 여전히 매 세대 넷만 띄운다. 다만 그 넷의 구성이 31세대까지 계속 바뀐다. 노출을 받은 광고는 추정값이 진짜 값으로 내려간다. 그러면 아직 덜 본 광고가 위로 올라온다.

이 판만으로는 40세대 클릭 수 차이가 작아 보인다. 기본 17,350건, 셋은 18,515~18,546건이다. 기준선은 마지막 줄이다. 진짜 CTR 을 처음부터 알고 배분하면 같은 시드에서 18,831건이 나온다. 기본은 그것보다 1,481건 적다. **7.9% 를 잃은 것이다.**

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-feedback-loop.html?embed=1" height="1960" loading="lazy" title="피드백 루프 미니 데모"></iframe>
<a class="demo-embed-open" href="demo-feedback-loop.html" target="_blank" rel="noopener">↗ 전체 데모로 열기</a>
</div>

## 7. 매출을 얼마 포기하나

**탐색은 대부분의 판에서 조금 손해다. 그리고 소수의 판에서 크게 이득이다.**

시드 하나는 운 한 판이다. 그 한 판으로 처방을 고르면 안 된다. 시드 100개를 돌려 평균을 본다. 그리고 기본이 진짜 상위 셋을 맞힌 판과 틀린 판을 갈라서 본다.

```python
import statistics
# 앞 블록의 run2·pad 를 그대로 쓴다. 100판이라 30초 안팎 걸린다.

res, right, out2, out40 = {}, [], [], []
for name, kw in [('기본', {}), ('ε탐색 5%', {'mode': 'ε탐색'}),
                 ('낙관 초기값', {'pm': .035, 'pk': 2000}),
                 ('강제슬롯 8%', {'mode': '강제슬롯'}),
                 ('강제슬롯 5%', {'mode': '강제슬롯', 'slot': 1000})]:
    c40, c05 = [], []
    for seed in range(1, 101):
        h, imps, clicks = run2(seed, **kw)
        c40.append(sum(clicks.values()))
        c05.append(sum(sum(got.values()) for g, a, got, gi in h[:5]))
        if name == '기본':      # 마지막 세대 상위 3이 진짜 상위 3과 같은가
            top3 = sorted(ADS, key=lambda x: -h[-1][1][x])[:3]
            right.append(set(top3) == {9931, 9932, 9933})
            out2.append(h[1][1][9931] == 0)      # 2세대에 9931 이 밀려났나
            out40.append(h[-1][1][9931] == 0)    # 40세대에도 여전히 0건인가
    res[name] = (c40, c05)

base = res['기본'][0]
print(pad('처방', 14) + '40세대 클릭  1~5세대 클릭  기본보다 나쁜 판')
for name, (c40, c05) in res.items():
    worse = sum(1 for i in range(100) if c40[i] < base[i])
    print(pad(name, 14) + '%11.0f %13.0f %13d판'
          % (statistics.mean(c40), statistics.mean(c05), worse))

print('9931 이 2세대에 밀려난 판 %d개 · 그중 40세대까지 못 돌아온 판 %d개'
      % (sum(out2), sum(1 for i in range(100) if out2[i] and out40[i])))
eps = res['ε탐색 5%'][0]
ok = [i for i in range(100) if right[i]]
no = [i for i in range(100) if not right[i]]
print('기본이 진짜 상위 3을 맞힌 판 %d개 · 틀린 판 %d개' % (len(ok), len(no)))
print('맞힌 판만: 기본 %.0f → ε탐색 %.0f'
      % (statistics.mean(base[i] for i in ok), statistics.mean(eps[i] for i in ok)))
print('틀린 판만: 기본 %.0f → ε탐색 %.0f'
      % (statistics.mean(base[i] for i in no), statistics.mean(eps[i] for i in no)))

# 출력:
# 처방          40세대 클릭  1~5세대 클릭  기본보다 나쁜 판
# 기본                18513          1938             0판
# ε탐색 5%            18665          1941            38판
# 낙관 초기값         18653          1869            52판
# 강제슬롯 8%         18507          1928            68판
# 강제슬롯 5%         18581          1934            59판
# 9931 이 2세대에 밀려난 판 12개 · 그중 40세대까지 못 돌아온 판 6개
# 기본이 진짜 상위 3을 맞힌 판 60개 · 틀린 판 40개
# 맞힌 판만: 기본 18754 → ε탐색 18738
# 틀린 판만: 기본 18152 → ε탐색 18555
```

먼저 굳음이 얼마나 흔한지부터 보자. 100판 중 12판에서 `9931` 이 2세대에 밀려났다. 그중 6판은 40세대에도 여전히 노출이 0건이다. 나머지 6판은 도중에 돌아왔다. 4절에서 계산한 조건이 그 갈림을 정한다. 안에 남은 광고의 진짜 CTR 이 `9931` 의 언 값보다 낮으면 돌아온다. 높으면 못 돌아온다.

그리고 더 흔한 실패가 따로 있다. **40판에서 상위 셋의 구성이 틀렸다.** 진짜 1위가 끝까지 0건인 극단은 6판뿐이다. 하지만 상위 셋이 어긋나는 일은 40판이다. 굳음은 극단에서만 오는 것이 아니라 늘 조금씩 온다.

매출을 보자. 40세대 누적 클릭은 기본이 18,513건이다. ε 탐색 18,665건, 낙관 초기값 18,653건, 강제 슬롯 18,507건이다. 차이가 −0.03% 부터 +0.8% 사이다. 처음 5세대만 보면 낙관 초기값이 1,869건이다. 기본 1,938건보다 69건 적다. **낙관 초기값의 단기 대가가 3.6% 다.** 대신 40세대로는 140건을 더 번다.

가장 중요한 줄은 마지막 둘이다. 기본이 진짜 상위 셋을 맞힌 60판만 보면 ε 탐색이 16건 손해다. 틀린 40판만 보면 403건 이득이다. **탐색은 잘못 굳었을 때만 값을 한다.** 그런데 지금 굳음이 옳은지 그른지는 알 수 없다. 그 값을 알려면 탐색을 해야 하기 때문이다. **탐색 예산**은 그 정보에 매기는 값이다.

강제 슬롯은 클릭으로는 기본을 못 이긴다. 평균이 6건 적고 100판 중 68판에서 진다. 그 값어치는 클릭이 아니라 측정 쪽에 있다. 그것이 8절 주제다.

:::deep 더 깊이 — 강제 슬롯 예산을 8%에서 5%로 줄이면
예산을 5% 로 줄이면 평균 클릭이 18,581건까지 오른다. 기본에 지는 판도 68판에서 59판으로 준다. 예산을 줄인 만큼 클릭 손해가 줄어든 것이다.

그래도 ε 탐색의 18,665건보다는 낮다. 강제 슬롯은 밀려난 넷에게만 몫을 주기 때문이다. 밀려난 넷 중에는 진짜로 나쁜 광고가 섞여 있다. 그 광고에 400건을 꽂으면 그만큼 클릭이 깎인다. ε 탐색은 같은 몫을 8개에 흩뿌리므로 나쁜 광고 몫이 125건으로 작다.

예산을 얼마로 잡을지는 이 손익과 8절의 측정 정확도를 같이 보고 정한다. 이 글은 8% 와 5% 두 값만 재 봤다.
:::

## 8. 굳은 뒤에는 되돌리기 어렵다 [무대: 공통]

**그 광고가 뜰 확률이 0이면 1÷0 이라 계산이 안 된다. 굳음은 그 확률을 0으로 만드는 사건이다.**

되돌리는 계산은 이렇게 한다. 학습 표본마다 "그게 노출될 확률"의 역수를 가중치로 준다. 그 확률을 **성향점수**라 부른다. 그리고 이 가중 방법이 **역확률 가중(IPS)** 이다. 자주 뜨는 광고의 표본은 가중치를 낮춘다. 드물게 뜨는 광고의 표본은 가중치를 높인다. 그러면 "모든 광고를 똑같이 띄웠다면 봤을 분포"를 복원할 수 있다. [위치 편향과 ULTR](post.html?id=position-bias-ultr) 4절이 위치에 대해 이 계산을 자세히 편다. 그 글의 ULTR 은 편향을 걷어낸 랭킹 학습을 가리킨다.

여기서는 광고별로 재 보자. 재는 값은 "8개를 똑같이 노출했을 때의 평균 CTR" 이다. 진짜 값은 진짜 CTR 여덟 개의 평균인 2.0875% 다. 로그를 볼 구간을 둘로 나눈다. 전체 40세대와 최근 7세대다. 이 구간을 **창(window)** 이라 부른다. 실무 학습은 대개 최근 며칠 창을 쓴다.

```python
import statistics
# 앞 블록의 run2·pad 를 그대로 쓴다.

TRUE_MEAN = 100 * sum(TRUE.values()) / 8      # 2.0875% — 8개를 똑같이 노출했을 때의 평균


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
        r, i, d = measure(run2(seed, **kw)[0], win)
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

네 줄을 하나씩 읽자. 로그를 그대로 믿으면 어느 설정에서든 2.37~2.40% 가 나온다. 진짜 값 2.0875% 보다 0.28~0.31%p 높다. 고리가 CTR 높은 광고만 남겼으니 로그의 평균이 위로 뜬 것이다. 새 광고에 이 값을 사전값으로 물려주면 새 광고를 과대평가한다.

**둘째 줄이 이 절의 핵심이다.** 최근 7세대 창에는 성향점수가 0인 광고가 평균 4개다. 굳은 뒤라 그 넷은 노출이 0건이다. 1÷0 을 할 수 없으니 계산에서 통째로 빠진다. 그 결과 IPS 가 2.331% 를 내놓는다. 로그 그대로인 2.379% 에서 0.05%p 밖에 못 고쳤다. **IPS 는 로그에 없는 광고를 되살리지 못한다.**

셋째·넷째 줄에서 답이 나온다. ε 탐색이나 강제 슬롯을 켜면 8개 전부 성향점수가 0보다 크다. 그러면 같은 창에서 IPS 가 2.085% 와 2.081% 를 낸다. 진짜 값과 0.01%p 차이다. **IPS 는 탐색이 있어야 작동한다.** 순서를 뒤집으면 안 된다. 탐색이 성향점수를 만들고, 성향점수가 IPS 를 가능하게 한다.

마지막으로 퍼짐을 보라. ε 탐색의 IPS 는 ±0.118 이고 강제 슬롯은 ±0.069 다. 강제 슬롯 쪽이 6할 수준이다. 밀려난 광고 한 개가 받는 표본이 125건과 400건으로 다르기 때문이다. 7절에서 강제 슬롯은 클릭으로 졌다. 여기서는 이긴다. **강제 슬롯이 사는 것은 매출이 아니라 측정의 정확도다.**

:::deep 더 깊이 — 첫 줄의 IPS 가 1.880% 로 내려간 이유
전체 이력 창에서는 성향점수가 0인 광고가 없다. 1세대에 8개 모두 500건씩 받았기 때문이다. 그런데 IPS 값이 1.880% 로 진짜 값보다 0.21%p 낮게 나왔다. 위로 뜨는 것이 아니라 아래로 내려갔다.

원인은 성향점수를 어디서 가져왔는지에 있다. 이 코드는 성향점수를 **실제 배분 비율**로 추정한다. 그런데 그 배분은 결과에 의존한다. 밀려난 광고는 첫날 클릭이 적게 나온 광고다. 그 광고의 관측 CTR 은 "적게 나왔다는 조건" 아래의 값이라 아래로 치우쳐 있다. 그런데 IPS 는 그 치우친 값에 큰 가중치를 얹는다. 노출 500건짜리 광고의 가중치는 234,500건짜리 광고의 469배다.

$$\hat{\mu}_{\text{IPS}} = \frac{\sum_a w_a c_a}{\sum_a w_a n_a}, \qquad w_a = \frac{1}{e_a}$$

여기서 $e_a$ 가 진짜 무작위 배정 확률이면 이 추정량은 불편(unbiased)이다. 하지만 $e_a$ 를 사후 관측된 노출 비율로 채우면 그 조건이 깨진다. 밀려난 광고에서는 $n_a$ 가 작고 $w_a$ 가 크므로 이 왜곡이 그대로 결과에 실린다.

그래서 셋째·넷째 줄이 잘 나온 것이다. ε 탐색과 강제 슬롯의 노출은 추정값과 무관하게 정해진 몫이다. 그 몫에 대해서는 $e_a$ 를 우리가 안다. 성향점수를 추정하는 대신 **설계로 박아 넣은** 것이다. IPS 를 진지하게 쓰려면 이 설계가 먼저 있어야 한다.
:::

## 9. 위치 편향·선택 편향과 어디가 다른가 [무대: 공통]

**셋은 같은 로그에서 동시에 일어난다. 다른 것은 무엇이 관측을 막았나다.**

세 이름이 자주 섞여 쓰인다. 경계를 그어 두면 어느 처방이 어느 문제를 고치는지 헷갈리지 않는다.

| | 위치 편향 | 선택 편향 | 피드백 루프 편향 |
|---|---|---|---|
| 무엇이 왜곡되나 | 같은 광고의 관측 CTR | 학습 표본의 구성 | 학습 표본의 구성이 세대마다 |
| 원인 | 아래 위치는 덜 보인다 | 뜬 광고만 라벨이 붙는다 | 어제 모델이 오늘 표본을 정한다 |
| 한 세대 안에서 보이나 | 보인다 | 보인다 | 안 보인다 |
| 시간이 지나면 | 그대로 | 그대로 | 심해진다 |
| 되돌릴 수 있나 | 위치를 바꿔 재면 된다 | 성향점수로 가중하면 된다 | 표본이 아예 없으면 못 한다 |
| 대표 처방 | 위치 성향점수, DLA | IPS 재가중 | 탐색 예산, 낙관 초기값 |

표의 셋째 열이 이 글이 다룬 것이다. 이름은 **피드백 루프 편향**이다.

**위치 편향은 한 세대 안의 문제다.** 같은 광고를 1위에 두면 5.0% 가 관측된다. 5위에 두면 0.75% 다. 이것은 위치가 관측을 막은 것이다. 광고 품질과는 무관하다. [위치 편향과 ULTR](post.html?id=position-bias-ultr) 1절이 그 표를 편다. 위치만 바꿔 다시 재면 원래 값을 알 수 있다.

**선택 편향도 한 세대 안의 문제다.** 학습 데이터에는 노출된 것만 있다. 뜬 광고에만 클릭 라벨이 붙기 때문이다. 이 편향은 한 세대의 로그만 보고도 지적할 수 있다.

**이 글의 편향은 세대를 이어 보아야 보인다.** 3절 출력의 세대 40 한 줄만 보면 그냥 "쏠린 로그"다. 세대 1부터 이어 보아야 그 쏠림이 어디서 왔는지 보인다. 그리고 결정적인 차이가 하나 더 있다. 선택 편향은 성향점수가 0보다 크면 고칠 수 있다. 그런데 이 고리는 성향점수를 0으로 만들어 버린다. 8절 둘째 줄이 그 장면이다.

:::deep 더 깊이 — 선택 편향을 식으로 쓰면, 그리고 표의 DLA
학습 데이터에는 노출된 것만 있다. 그래서 모델은 $P(Y \mid X)$ 대신 $P(Y \mid X, O=1)$ 을 배운다. 여기서 $O=1$ 은 "그 건이 노출됐다"는 조건이다. [네거티브 샘플링과 편향](post.html?id=negative-sampling-bias) 4절이 그 구조를 정리한다.

위 표의 DLA 는 이중 학습 알고리즘(Dual Learning Algorithm)이다. 위치가 만드는 관측 확률과 광고 품질을 한 모델에서 같이 배운다. 위치 성향점수를 따로 실험해서 구하지 않아도 되는 것이 장점이다. [위치 편향과 ULTR](post.html?id=position-bias-ultr)이 그쪽을 다룬다.
:::

셋은 배타적이지 않다. 실제 로그에는 셋이 겹쳐 있다. 위치 성향점수로 위치 편향만 고치면 선택 편향이 남는다. 선택 편향을 역확률 가중으로 고쳐도 세대 사이의 굳음은 남는다. 순서를 정하면 이렇다. **탐색으로 성향점수를 0에서 떼어 놓는 것이 먼저다.** 그다음이 역확률 가중이다.

## 10. 담장 안에서는 고리가 완전히 닫힌다 [무대: 닫힌 생태계]

**한 회사가 경매·랭킹·로그를 다 쥐고 있으면 고리 밖에서 들어오는 잡음이 없다.**

담장 안 DSP 에서는 후보 광고를 고르는 것이 우리 코드다. 순위를 매기는 것도, 노출을 찍는 것도, 로그를 적는 것도 같은 회사 코드다. 그래서 1절 그림의 화살표 넷이 전부 우리 것이다. 좋은 점은 성향점수를 정확히 알 수 있다는 것이다. 배분 규칙이 우리 것이니 $e_a$ 를 추정할 필요가 없다. 그냥 기록하면 된다.

나쁜 점은 그 고리에 우연이 안 섞인다는 것이다. 밖에서 다른 사업자가 같은 사용자에게 다른 광고를 띄워 주는 일이 없다. 우리 모델이 안 고른 광고는 그 지면에서 정말로 0번 뜬다. 3절의 `9931` 처럼 500건에서 이력이 끝난다.

| | 담장 안 | 열린 RTB |
|---|---|---|
| 랭킹을 누가 정하나 | 우리 | 우리가 입찰, 낙찰은 SSP |
| 성향점수를 아나 | 안다 (기록하면 됨) | 모른다 (낙찰 확률이 남의 손) |
| 노출 0건이 되는 이유 | 우리 모델이 안 골라서 | 우리가 안 골랐거나 패찰해서 |
| 고리에 섞이는 잡음 | 거의 없다 | 경쟁사 입찰가 변동이 섞인다 |
| 탐색 예산을 누가 대나 | 우리가 낸다 | 우리가 낸다 (패찰하면 못 씀) |

담장 안의 실무는 그래서 **탐색을 명시적으로 예산에 넣는 것**으로 간다. 아무도 대신 흔들어 주지 않기 때문이다. 6~7절의 5% 나 8% 가 그 예산이다. 이 값을 0으로 두면 3절의 결과가 그대로 나온다. 콜드 스타트 처리를 어떻게 짜는지는 [새 광고의 pCTR](post.html?id=cold-start-pctr) 2절이 수축(shrinkage) 쪽에서 다룬다.

### 열린 RTB 에서는 고리가 한 번 끊긴다 [무대: 열린 RTB]

밖에서 입찰만 넣는 DSP 는 사정이 다르다. 우리가 입찰가를 높게 써도 낙찰될지는 남이 정한다. 우리가 안 고른 광고가 뜨는 일은 여기서도 없다. 대신 우리가 고른 광고가 패찰해서 안 뜨는 일이 생긴다. 경쟁사의 입찰가가 매일 흔들리니 패찰 여부도 매일 흔들린다. 그 변동이 고리에 잡음을 넣어 굳음을 조금 늦춘다.

대신 성향점수가 두 겹이 된다. "우리가 이 광고에 입찰했을 확률"과 "그 입찰이 이겼을 확률"이다. 뒤쪽은 관측되지 않는다. 패찰하면 경쟁가를 못 보기 때문이다. [입찰 가림과 검열된 데이터](post.html?id=bid-shading-censored)가 그 구조를 다룬다. 그래서 열린 RTB 의 역확률 가중은 담장 안보다 어렵다. 8절 접기가 지적한 "성향점수를 추정으로 채우는 문제"가 여기서는 기본값이다.

두 무대의 공통점은 하나다. 어느 쪽이든 **내가 고른 것만 라벨이 붙는다.** 열린 RTB 는 고리가 한 번 끊길 뿐이다. 끊긴 자리가 우연으로 채워지는 것도 아니다. 경쟁사의 선택도 그들의 모델이 만든 것이라 우리 입장에서 무작위가 아니다.

## 한눈 정리

| 무엇 | 이 글의 숫자 | 어디서 |
|---|---|---|
| 첫날 500건에서 진짜 1위를 1위로 맞힐 확률 | 35.4% | 2절 |
| 첫날 500건에서 진짜 1위가 5위 밖으로 밀릴 확률 | 17.4% | 2절 |
| 노출 집합이 굳은 세대 | 3세대 | 3절 |
| 진짜 1위 `9931` 의 40세대 누적 노출 | 500건 (전체의 0.06%) | 3절 |
| 굳음이 안 풀리는 조건 | 언 값 1.793% < 안에 남은 넷의 진짜 CTR | 4절 |
| 누적 지니계수 | 0.000 → 0.479(2세대) → 0.563(40세대) | 5절 |
| 기본 루프가 잃은 클릭 | 18,831건 대비 1,481건 (7.9%) | 6절 |
| 100판 중 진짜 1위가 40세대까지 0건인 판 | 6판 | 7절 |
| 100판 중 상위 셋 구성이 틀린 판 | 40판 | 7절 |
| 탐색의 값 — 맞힌 판 / 틀린 판 | −16건 / +403건 | 7절 |
| 굳은 뒤 최근 7세대 창의 성향점수 0 광고 | 4개 | 8절 |
| 탐색을 켰을 때 IPS 의 오차 | 0.01%p 이내 | 8절 |

## 헷갈리기 쉬운 점

- **"모델이 정확해지면 편향이 줄어든다"는 반대다.** 정확한 모델일수록 좋은 광고만 정확히 골라 노출한다. 그러면 로그가 더 좁아진다. 8절 첫 줄의 2.369% 가 그 결과다.
- **지니계수가 낮은 것이 목표가 아니다.** 지니 0은 진짜 나쁜 광고에도 같은 노출을 준다는 뜻이다. 볼 것은 값이 아니라 값의 변화가 멈춘 순간이다.
- **역확률 가중을 켰다고 굳음이 풀리지 않는다.** 그 방법은 배분을 바꾸지 않는다. 8절 둘째 줄에서 고친 폭은 0.05%p 였다.
- **탐색 예산은 매출을 사는 돈이 아니라 정보를 사는 돈이다.** 7절에서 이미 옳게 굳은 60판에서는 ε 탐색이 손해였다. 옳은지 그른지 모르기 때문에 내는 값이다.
- **"굳음이 몇 세대에 오나"는 시스템 설정이 정한다.** 이 글에서는 상한 6,000건이 노출 자리를 넷으로 잘랐고, 그래서 5위부터 로그가 끊겼다. 상한이 다르면 그 경계도 다르다.
- **`9937` 이 `9931` 보다 위에 있는 것은 0.006%p 차이다.** 첫날 우연이 남긴 값이 39세대째 순위를 정하고 있다는 뜻이다. 언 값끼리의 비교에는 정보가 없다.

## 더 깊이 보기

- [탐색과 활용](post.html?id=exploration-exploitation) — ε 탐색·UCB·톰슨 샘플링을 고르는 기준
- [위치 편향과 ULTR](post.html?id=position-bias-ultr) — 위치 성향점수와 IPS 의 원형
- [네거티브 샘플링과 학습 데이터 편향](post.html?id=negative-sampling-bias) — 한 세대 안의 선택 편향
- [새 광고의 pCTR — 콜드 스타트](post.html?id=cold-start-pctr) — 표본이 적을 때 값을 빌려 오는 법
- [온라인 학습과 지연된 피드백](post.html?id=online-learning-delayed-feedback) — 세대 주기를 하루보다 짧게 가져갈 때
- [모델 A/B 테스트](post.html?id=model-ab-testing) — 굳음을 실험으로 잡아내는 설계
- [Calibration — 확률을 믿을 수 있게](post.html?id=calibration) — 로그 평균이 뜨면 보정이 먼저 흔들린다
- [광고 로그 파이프라인](post.html?id=ad-log-pipeline) — 이 글의 고리가 실제로 도는 물리적 경로
