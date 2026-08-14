새 랭킹 모델이 어제 오프라인 평가를 통과했다. 다음 질문은 하나다. 이 모델을 정책으로 올리면 CTR이 얼마가 되나.

답을 얻는 길은 둘이다. 온라인에 올려 일주일 재 볼 수 있다. 아니면 지난주 로그로 오늘 오후에 추정할 수 있다. 앞의 것은 매출을 걸고 뒤의 것은 걸지 않는다. 그래서 뒤의 것을 먼저 한다.

문제는 로그에 무엇이 들어 있느냐다. 요청 `r-3c07` 한 건을 열어 보자. 지면은 `main_top`이고 후보 광고는 8개였다. 옛 정책은 그중 후보 4번을 91.1%의 확률로 골랐다. 그 광고는 클릭되지 않았다. 나머지 일곱은 뜨지 않았으니 클릭도 없다.

새 정책은 같은 요청에서 후보 1번을 고른다. 후보 1번이 클릭됐을지는 로그 어디에도 없다. 그 빈칸을 메우는 방법이 이 글의 내용이다.

이 글의 숫자는 전부 설명을 위해 지어낸 값이다. 규모도 작게 잡았다. 하루 노출 로그가 2억 2,800만 줄인 서비스를 떠올려 보자. 거기서 한 캠페인의 요청 10,000건만 떼어 온 셈이다. 독자가 손으로 검산할 수 있는 크기다.

> **한 줄 요약:** 옛 정책이 고를 확률 `p`를 로그에 남겨 둬야 한다. 그러면 겹친 건을 `1/p`배로 세어 새 정책의 성적을 추정할 수 있다. 대신 `p`가 작은 건 하나가 추정치를 통째로 흔든다.

**이 글에 나오는 말** — 낯선 이름만 먼저 풀어 둡니다. 본문에서 다시 설명하니 지금 외울 필요는 없습니다.

| 말 | 한 줄 뜻 |
|---|---|
| 겹치는 건만 쓰기 (Replay) | 옛 정책과 새 정책이 같은 광고를 고른 건만 세는 방법 |
| 성향점수 | 그때 옛 정책이 그 광고를 고를 확률. 로그에 남겨야 한다 |
| 역확률 가중 (IPS) | 옛 정책이 고를 확률이 낮았던 건을 그만큼 크게 세는 방법 |
| 유효표본크기 | 그 추정치를 실제로 받치는 건수. 로그 줄 수보다 훨씬 적다 |
| 자기정규화 (SNIPS) | 가중치 합으로 나눠 무게의 어긋남을 지우는 손질 |
| 절단 (clipping) | 가중치에 상한을 두는 손질. 흔들림은 줄고 값은 내려간다 |
| 이중 강건 (DR) | 성향점수와 보상 모델을 겹쳐 하나만 맞아도 되게 하는 방법 |

> **골라 읽는 법** — 절이 8개인 긴 글입니다. 처음부터 다 읽지 않아도 됩니다.
>
> - 무엇이 문제인지만 → 1절
> - 겹친 것만 쓰면 왜 안 되나 → 2절
> - 확률의 역수로 세는 법과 로깅 준비물 → 3절
> - 추정치가 왜 못 믿게 되나 → 4절
> - 흔들림을 줄이는 두 방법 → 5절
> - 보상 모델을 같이 쓰는 법 → 6절
> - 로깅을 어떻게 설계하나 → 7절
> - 온라인 A/B와 어떻게 나눠 쓰나 → 8절

---

## 1. 안 띄운 광고는 결과가 없다

**로그 한 줄에는 결과가 하나뿐이다. 옛 정책이 고른 광고의 결과다. 새 정책이 고를 광고의 결과는 그 줄에 없다.**

요청 `r-3c07`을 표로 펼치면 이렇다. 후보 8개마다 옛 정책이 고를 확률이 있었다. 실제로 고른 것은 하나다. 진짜 CTR 열은 이 글이 가상 세계를 지어냈기 때문에 있다. 실제 로그에는 그 열이 없다.

| 후보 | 옛 정책 확률 `p` | 옛 정책이 골랐나 | 새 정책이 고르나 | 로그에 남은 결과 |
|---|---|---|---|---|
| 0 | 0.0125 | 아니오 | 아니오 | 없음 |
| 1 | 0.0128 | 아니오 | **고른다** | **없음** |
| 2 | 0.0125 | 아니오 | 아니오 | 없음 |
| 3 | 0.0125 | 아니오 | 아니오 | 없음 |
| 4 | 0.9109 | **골랐다** | 아니오 | **클릭 0** |
| 5 | 0.0137 | 아니오 | 아니오 | 없음 |
| 6 | 0.0125 | 아니오 | 아니오 | 없음 |
| 7 | 0.0125 | 아니오 | 아니오 | 없음 |

확률 여덟 개를 더하면 1이다. 넷째 자리까지 반올림해 적었으니 손으로 더하면 0.9999가 나온다. 결과가 있는 줄은 여덟 중 하나뿐이다.

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 520 330" role="img" aria-label="요청 하나를 표 모양으로 그린 그림. 왼쪽부터 후보 번호, 옛 정책 확률 막대, 옛 정책이 고른 칸, 새 정책이 고를 칸, 로그에 남은 결과 순이다. 후보 4번 줄만 옛 정책 칸이 채워져 있고 결과 칸에 클릭 0이 적혀 있다. 후보 1번 줄은 새 정책 칸이 점선으로 표시돼 있고 결과 칸은 물음표다. 나머지 여섯 줄도 결과 칸이 전부 물음표다." style="width:100%; max-width:520px; height:auto; font-family:var(--font-sans)">
<text x="4" y="14" style="font-size:12.5px; fill:var(--ink2)">요청 r-3c07 · 지면 main_top · 후보 8개</text>
<text x="4" y="36" style="font-size:12px; fill:var(--ink3)">후보</text>
<text x="60" y="36" style="font-size:12px; fill:var(--ink3)">옛 정책 확률 p</text>
<text x="232" y="36" style="font-size:12px; fill:var(--ink3)">옛 정책</text>
<text x="330" y="36" style="font-size:12px; fill:var(--ink3)">새 정책</text>
<text x="428" y="36" style="font-size:12px; fill:var(--ink3)">로그에 남은 결과</text>
<line x1="4" y1="42" x2="516" y2="42" style="stroke:var(--rule); stroke-width:1"/>
<g style="font-size:12.5px; fill:var(--ink)">
<text x="8" y="62">0</text>
<rect x="60" y="52" width="2" height="12" style="fill:var(--grey)"/>
<text x="212" y="62" text-anchor="end" style="fill:var(--ink2)">0.0125</text>
<text x="428" y="62" style="fill:var(--ink3)">?</text>
<rect x="60" y="78" width="2" height="12" style="fill:var(--grey)"/>
<text x="8" y="88">1</text>
<text x="212" y="88" text-anchor="end" style="fill:var(--ink2)">0.0128</text>
<rect x="326" y="74" width="84" height="20" style="fill:none; stroke:var(--oxide); stroke-width:2; stroke-dasharray:5 3"/>
<text x="368" y="88" text-anchor="middle" style="font-size:12px; fill:var(--oxide)">고른다</text>
<rect x="424" y="74" width="88" height="20" style="fill:none; stroke:var(--oxide); stroke-width:2; stroke-dasharray:5 3"/>
<text x="468" y="88" text-anchor="middle" style="font-size:12px; fill:var(--oxide)">비어 있다</text>
<rect x="60" y="104" width="2" height="12" style="fill:var(--grey)"/>
<text x="8" y="114">2</text>
<text x="212" y="114" text-anchor="end" style="fill:var(--ink2)">0.0125</text>
<text x="428" y="114" style="fill:var(--ink3)">?</text>
<rect x="60" y="130" width="2" height="12" style="fill:var(--grey)"/>
<text x="8" y="140">3</text>
<text x="212" y="140" text-anchor="end" style="fill:var(--ink2)">0.0125</text>
<text x="428" y="140" style="fill:var(--ink3)">?</text>
<rect x="60" y="156" width="100" height="12" style="fill:var(--navy)"/>
<text x="8" y="166">4</text>
<text x="212" y="166" text-anchor="end" style="fill:var(--ink2)">0.9109</text>
<rect x="228" y="152" width="84" height="20" style="fill:var(--navy-bg); stroke:var(--navy); stroke-width:2"/>
<text x="270" y="166" text-anchor="middle" style="font-size:12px; fill:var(--navy)">골랐다</text>
<rect x="424" y="152" width="88" height="20" style="fill:var(--navy-bg); stroke:var(--navy); stroke-width:2"/>
<text x="468" y="166" text-anchor="middle" style="font-size:12px; fill:var(--navy)">클릭 0</text>
<rect x="60" y="182" width="2" height="12" style="fill:var(--grey)"/>
<text x="8" y="192">5</text>
<text x="212" y="192" text-anchor="end" style="fill:var(--ink2)">0.0137</text>
<text x="428" y="192" style="fill:var(--ink3)">?</text>
<rect x="60" y="208" width="2" height="12" style="fill:var(--grey)"/>
<text x="8" y="218">6</text>
<text x="212" y="218" text-anchor="end" style="fill:var(--ink2)">0.0125</text>
<text x="428" y="218" style="fill:var(--ink3)">?</text>
<rect x="60" y="234" width="2" height="12" style="fill:var(--grey)"/>
<text x="8" y="244">7</text>
<text x="212" y="244" text-anchor="end" style="fill:var(--ink2)">0.0125</text>
<text x="428" y="244" style="fill:var(--ink3)">?</text>
</g>
<line x1="4" y1="258" x2="516" y2="258" style="stroke:var(--rule); stroke-width:1"/>
<text x="4" y="278" style="font-size:12.5px; fill:var(--ink2)">결과가 있는 줄은 여덟 중 하나다. 나머지 일곱은 뜨지도 않았다.</text>
<text x="4" y="298" style="font-size:12.5px; fill:var(--ink2)">새 정책이 고를 후보 1번이 겹칠 확률은 0.0128, 겹쳤다면 가중치 78배다.</text>
<text x="4" y="318" style="font-size:12.5px; fill:var(--ink3)">확률 여덟 개의 합은 1이다</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">옛 정책이 거의 확신하고 고른 요청이다. 이런 요청은 새 정책의 선택과 겹칠 일이 드물고, 어쩌다 겹치면 한 건이 78건 몫으로 세어진다.</figcaption>
</figure>

이 글은 이름을 두 개만 쓴다. 로그를 남긴 쪽을 **옛 정책**이라 쓴다. 채점 대상인 쪽을 **새 정책**이라 쓴다. 논문에서는 각각 behavior policy와 target policy다.

지금 하려는 일은 이것이다. 로그를 남긴 정책과 다른 정책을 그 로그로 채점한다. 이 일을 오프폴리시 평가라 부른다. 이름은 낯설지만 하는 일은 빈칸 메우기다.

여기서 착각하기 쉬운 것이 하나 있다. 후보 1번의 진짜 CTR을 새 모델이 예측할 수는 있다. 하지만 그 예측이 맞는지는 이 로그로 확인할 수 없다. 채점에는 정답 라벨이 필요하다. 후보 1번 줄에는 라벨이 없다.

그래서 이것은 모델 정확도 문제가 아니다. **로그에 없는 결과를 어떻게 메우느냐**의 문제다. 남은 절은 메우는 방법 네 가지를 차례로 본다.

---

## 2. 겹치는 건만 써 본다 — 네 건 중 한 건

**두 정책이 같은 광고를 고른 건만 세면 계산이 한 줄로 끝난다. 대신 남은 표본이 원래 로그와 다르게 생겼다.**

가장 단순한 방법부터 본다. 옛 정책과 새 정책이 같은 광고를 고른 건만 남긴다. 그 건들의 클릭률을 새 정책의 성적으로 삼는다. 겹치지 않은 건은 그냥 버린다. 이 방법을 **겹치는 건만 쓰기**(Replay)라 부른다. 매칭 방식이라고도 한다.

아래 코드가 지난주 로그를 지어낸다. 요청 10,000건, 지면 5개, 요청마다 후보 8개다. 옛 정책은 softmax로 고르되 10%는 균등 무작위로 섞는다. 새 모델은 옛 모델이 못 보는 피처 하나를 더 본다. 그 피처의 값어치는 지면마다 다르게 잡았다.

```python
# 지난주 로그 10,000건을 지어내고, Replay(매칭)로 새 정책을 채점한다.
# 진짜 CTR을 우리가 정해 놓았으므로 '정답'을 알 수 있다. 실제 로그에는 정답이 없다.

import math, random

K, EPS, TAU = 8, 0.10, 0.0014      # 후보 8개 · 옛 정책 = softmax + 균등 10% 섞기
# (지면, 요청 수, 기저 CTR 하한, 상한, 숨은 피처 z의 값어치)
# z는 옛 모델이 못 보는 피처다. 새 모델만 본다. 지면마다 z의 값어치가 다르다.
SLOTS = [("main_top", 2600, 0.024, 0.044, 0.000), ("search_top", 1400, 0.016, 0.032, 0.003),
         ("feed_mid", 3100, 0.007, 0.018, 0.010), ("feed_low", 2000, 0.004, 0.012, 0.014),
         ("detail_side", 900, 0.003, 0.009, 0.018)]

def build_log(seed=7):
    random.seed(seed); log = []
    for name, n, lo, hi, bonus in SLOTS:
        for _ in range(n):
            base = [random.uniform(lo, hi) for _ in range(K)]
            ctr = [b + bonus * (1 if random.random() < 0.2 else 0) for b in base]
            old_s = [b + random.gauss(0, 0.004) for b in base]     # 옛 모델은 z를 못 본다
            new_s = [c + random.gauss(0, 0.002) for c in ctr]      # 새 모델은 z를 본다
            m = max(old_s); ex = [math.exp((s - m) / TAU) for s in old_s]; Z = sum(ex)
            p = [(1 - EPS) * (x / Z) + EPS / K for x in ex]        # 옛 정책의 선택 확률
            u, acc, a = random.random(), 0.0, K - 1
            for i, pi in enumerate(p):
                acc += pi
                if u <= acc: a = i; break                          # 옛 정책이 실제로 고른 것
            log.append((name, ctr, p, a, 1 if random.random() < ctr[a] else 0,
                        max(range(K), key=lambda i: new_s[i])))    # 새 정책이라면 골랐을 것
    return log

log = build_log()
N = len(log)
print(f"{'지면':<12}{'요청':>7}{'겹친 건':>9}{'겹침률':>8}{'겹친 건 클릭':>12}{'Replay CTR':>12}")
tm = tc = 0
for name, n, lo, hi, bonus in SLOTS:
    sub = [x for x in log if x[0] == name]
    mt = [x for x in sub if x[3] == x[5]]
    ck = sum(x[4] for x in mt); tm += len(mt); tc += ck
    print(f"{name:<12}{len(sub):>7,}{len(mt):>9,}{len(mt)/len(sub):>8.1%}{ck:>12}{ck/len(mt):>12.2%}")
print(f"{'합계':<12}{N:>7,}{tm:>9,}{tm/N:>8.1%}{tc:>12}{tc/tm:>12.2%}")

obs = sum(x[4] for x in log) / N                    # 옛 정책이 실제로 낸 성적
v_new = sum(x[1][x[5]] for x in log) / N            # 새 정책의 진짜 값
v_old = sum(sum(pi * ci for pi, ci in zip(x[2], x[1])) for x in log) / N
print()
print(f"로그 전체 CTR (옛 정책 실측)   : {obs:.3%}  (클릭 {sum(x[4] for x in log)}건)")
print(f"Replay 추정 (겹친 {tm:,}건만)  : {tc/tm:.3%}  → 옛 정책 대비 {(tc/tm)/obs-1:+.1%}")
print(f"새 정책의 진짜 값             : {v_new:.3%}  → 옛 정책 진짜 값 {v_old:.3%} 대비 {v_new/v_old-1:+.1%}")

nm, ctr, p, a, r, e = log[9]           # 1절 그림에 쓴 요청 한 건
print(f"\n1절 그림의 요청({nm}) — 옛 정책은 후보 {a}번을 확률 {p[a]:.1%}로 골랐고 클릭은 {r}이다.")
print(f"  새 정책이라면 후보 {e}번을 고른다. 그 후보가 겹칠 확률은 {p[e]:.2%}, 가중치로는 {1/p[e]:.0f}배다.")
print(f"  후보 8개를 균등 무작위로 골랐다면 CTR은 {sum(sum(x[1])/K for x in log)/N:.3%}였다.")

# 출력:
# 지면               요청     겹친 건     겹침률     겹친 건 클릭  Replay CTR
# main_top      2,600    1,021   39.3%          42       4.11%
# search_top    1,400      485   34.6%          15       3.09%
# feed_mid      3,100      628   20.3%          13       2.07%
# feed_low      2,000      316   15.8%          12       3.80%
# detail_side     900      145   16.1%           4       2.76%
# 합계           10,000    2,595   25.9%          86       3.31%
#
# 로그 전체 CTR (옛 정책 실측)   : 2.120%  (클릭 212건)
# Replay 추정 (겹친 2,595건만)  : 3.314%  → 옛 정책 대비 +56.3%
# 새 정책의 진짜 값             : 2.807%  → 옛 정책 진짜 값 2.291% 대비 +22.5%
#
# 1절 그림의 요청(main_top) — 옛 정책은 후보 4번을 확률 91.1%로 골랐고 클릭은 0이다.
#   새 정책이라면 후보 1번을 고른다. 그 후보가 겹칠 확률은 1.28%, 가중치로는 78배다.
#   후보 8개를 균등 무작위로 골랐다면 CTR은 1.983%였다.
```

숫자부터 읽자. 10,000건 중 2,595건이 겹쳤다. 네 건 중 한 건이다. 그 2,595건의 CTR은 3.31%다. 로그 전체 CTR 2.12%보다 56.3% 높다. 보고서에 쓰면 훌륭한 성과처럼 보인다.

진짜 값은 2.807%다. 옛 정책의 진짜 값 2.291% 대비 22.5% 향상이다. 겹치는 건만 쓰기가 말한 56.3%는 그 두 배를 넘는다.

| 지면 | 요청 | 겹친 건 | 겹침률 | 겹친 건 클릭 | Replay CTR |
|---|---|---|---|---|---|
| `main_top` | 2,600 | 1,021 | 39.3% | 42 | 4.11% |
| `search_top` | 1,400 | 485 | 34.6% | 15 | 3.09% |
| `feed_mid` | 3,100 | 628 | 20.3% | 13 | 2.07% |
| `feed_low` | 2,000 | 316 | 15.8% | 12 | 3.80% |
| `detail_side` | 900 | 145 | 16.1% | 4 | 2.76% |
| **합계** | **10,000** | **2,595** | **25.9%** | **86** | **3.31%** |

원인은 겹침률 열에 있다. `main_top`은 39.3%가 살아남고 `feed_low`는 15.8%만 살아남는다. 그런데 `main_top`은 원래 CTR이 높은 지면이다. 겹친 건을 모으면 CTR 높은 지면 쪽으로 표본이 기운다. 전체 요청의 26%인 `main_top`이 겹친 건의 39%를 차지한다.

더 나쁜 것이 있다. **새 정책이 가장 크게 달라지는 지면이 가장 많이 버려진다.** 이 가상 데이터에서 새 모델의 강점은 숨은 피처 `z`다. `z`의 값어치는 `feed_low`와 `detail_side`에서 가장 크다. 그 지면에서 두 정책의 선택이 가장 많이 갈린다. 그래서 겹침률이 가장 낮다. 남은 표본은 두 정책이 이미 같은 답을 내던 곳이다.

이걸 한 문장으로 줄이면 이렇다. 이 방법이 남기는 것은 **새 정책이 새롭지 않은 구간**이다. 로그를 열 배로 늘려도 이 성질은 그대로다. 5절에서 400주를 다시 뽑아 확인한다.

---

## 3. 모자란 것을 몇 배로 셀까

**겹친 건 하나를 `1/p`건 몫으로 세면 버려진 건까지 대신 세어진다. 대신 로그에 `p`가 적혀 있어야 한다.**

2절의 문제는 겹친 건을 전부 똑같이 1건으로 센 것이다. 어떤 요청은 겹칠 확률이 42%였고 어떤 요청은 1.3%였다. 둘을 같은 무게로 세면 겹치기 쉬운 쪽이 과하게 대표된다.

무게를 바로잡는 길은 이렇다. 겹칠 확률이 `p`였던 건을 `1/p`건 몫으로 센다. 확률 1.28%로 겹친 건은 78건 몫이다. 같은 상황이 78번 있었는데 한 번만 관측됐다고 보는 것이다. 이 방법을 **역확률 가중**(IPS)이라 부른다. 여기 쓰인 확률 `p`는 **성향점수**라 부른다.

식으로 쓰면 이렇다.

$$\hat{V}_{\mathrm{IPS}} = \frac{1}{n}\sum_{i=1}^{n} \frac{\mathbf{1}[a_i = \pi_e(x_i)]}{p_i}\, r_i$$

$a_i$는 옛 정책이 실제로 고른 광고다. $\pi_e(x_i)$는 새 정책이 골랐을 광고다. $p_i$는 옛 정책이 $a_i$를 고를 확률이다. $r_i$는 클릭 여부다. 대괄호 안의 조건이 맞을 때만 1이고 아니면 0이다.

아래 코드는 요청 하나에서 기대값을 직접 더해 본다. 옛 정책이 어느 후보를 고르든 그 경우를 확률만큼 반영해 합친다. 결과는 새 정책이 고른 후보의 진짜 CTR과 정확히 같아진다.

```python
# IPS(역확률 가중)가 왜 불편추정인가 — 한 요청에서 기대값을 직접 더해 본다.
# 그 다음 로그 10,000건 전체에 같은 식을 적용한다. build_log는 2절과 같다.

import math, random
K, EPS, TAU = 8, 0.10, 0.0014
SLOTS = [("main_top", 2600, 0.024, 0.044, 0.000), ("search_top", 1400, 0.016, 0.032, 0.003),
         ("feed_mid", 3100, 0.007, 0.018, 0.010), ("feed_low", 2000, 0.004, 0.012, 0.014),
         ("detail_side", 900, 0.003, 0.009, 0.018)]

def build_log(seed=7):
    random.seed(seed); log = []
    for name, n, lo, hi, bonus in SLOTS:
        for _ in range(n):
            base = [random.uniform(lo, hi) for _ in range(K)]
            ctr = [b + bonus * (1 if random.random() < 0.2 else 0) for b in base]
            old_s = [b + random.gauss(0, 0.004) for b in base]
            new_s = [c + random.gauss(0, 0.002) for c in ctr]
            m = max(old_s); ex = [math.exp((s - m) / TAU) for s in old_s]; Z = sum(ex)
            p = [(1 - EPS) * (x / Z) + EPS / K for x in ex]
            u, acc, a = random.random(), 0.0, K - 1
            for i, pi in enumerate(p):
                acc += pi
                if u <= acc: a = i; break
            log.append((name, ctr, p, a, 1 if random.random() < ctr[a] else 0,
                        max(range(K), key=lambda i: new_s[i])))
    return log

log = build_log()
name, ctr, p, a, r, e = log[3100]        # 로그에서 요청 한 건을 꺼내 펼쳐 본다
print(f"요청 하나({name}) — 새 정책은 후보 {e}번을 고른다\n")
print(f"{'후보':>4}{'옛 정책 확률 p':>15}{'진짜 CTR':>10}{'새 정책이 고르나':>17}{'IPS 기여 = p x (1/p) x CTR':>28}")
tot = 0.0
for i in range(K):
    hit = (i == e)
    contrib = p[i] * (1 / p[e]) * ctr[i] if hit else 0.0
    tot += contrib
    print(f"{i:>4}{p[i]:>15.4f}{ctr[i]:>10.4f}{'예' if hit else '아니오':>17}{contrib:>28.5f}")
print(f"{'합계':>4}{sum(p):>15.4f}{'':>10}{'':>17}{tot:>28.5f}")
print(f"\n합계 {tot:.5f} = 후보 {e}번의 진짜 CTR {ctr[e]:.5f}  →  한 건 기준으로 정확히 맞는다")
print("옛 정책이 그 후보를 안 고른 경우는 0을 더하고, 고른 경우는 1/p 배로 부풀린다.")
print("고를 확률이 p이니 'p번 중 1/p배'가 상쇄돼 딱 한 번 센 것이 된다.\n")

N = len(log)
w = [(1 / x[2][x[5]]) if x[3] == x[5] else 0.0 for x in log]
ips = sum(wi * x[4] for wi, x in zip(w, log)) / N
v_new = sum(x[1][x[5]] for x in log) / N
v_old = sum(sum(pi * ci for pi, ci in zip(x[2], x[1])) for x in log) / N
matched = sum(1 for x in log if x[3] == x[5])
print(f"로그 {N:,}건 전체")
print(f"  겹친 건            : {matched:,}건 ({matched/N:.1%})")
print(f"  가중치 합계        : {sum(w):,.0f}  (요청 수 {N:,}건과 비슷해야 한다)")
print(f"  IPS 추정           : {ips:.3%}")
print(f"  Replay 추정        : {sum(x[4] for x in log if x[3] == x[5])/matched:.3%}")
print(f"  새 정책 진짜 값    : {v_new:.3%}   (옛 정책 진짜 값 {v_old:.3%})")

# 출력:
# 요청 하나(search_top) — 새 정책은 후보 4번을 고른다
#
#   후보      옛 정책 확률 p    진짜 CTR        새 정책이 고르나    IPS 기여 = p x (1/p) x CTR
#    0         0.0125    0.0185              아니오                     0.00000
#    1         0.1841    0.0276              아니오                     0.00000
#    2         0.0125    0.0199              아니오                     0.00000
#    3         0.3181    0.0304              아니오                     0.00000
#    4         0.4235    0.0284                예                     0.02839
#    5         0.0237    0.0258              아니오                     0.00000
#    6         0.0126    0.0182              아니오                     0.00000
#    7         0.0130    0.0258              아니오                     0.00000
#   합계         1.0000                                                0.02839
#
# 합계 0.02839 = 후보 4번의 진짜 CTR 0.02839  →  한 건 기준으로 정확히 맞는다
# 옛 정책이 그 후보를 안 고른 경우는 0을 더하고, 고른 경우는 1/p 배로 부풀린다.
# 고를 확률이 p이니 'p번 중 1/p배'가 상쇄돼 딱 한 번 센 것이 된다.
#
# 로그 10,000건 전체
#   겹친 건            : 2,595건 (25.9%)
#   가중치 합계        : 9,681  (요청 수 10,000건과 비슷해야 한다)
#   IPS 추정           : 1.669%
#   Replay 추정        : 3.314%
#   새 정책 진짜 값    : 2.807%   (옛 정책 진짜 값 2.291%)
```

한 건짜리 계산은 깔끔하다. 여덟 줄 중 일곱 줄은 0을 더한다. 남은 한 줄이 `0.4235 × (1/0.4235) × 0.0284 = 0.02839`를 더한다. 확률과 가중치가 서로를 지운다. 그래서 여러 번 평균 내면 진짜 값에 맞는다. 이 성질을 **불편추정**이라 부른다. 치우침이 없다는 뜻이다.

가중치 합계도 신호다. 9,681로 요청 수 10,000에 가깝다. 이론상 이 합의 기대값은 정확히 요청 수다. 어긋난 3%는 이번 주가 그렇게 나온 것뿐이다.

그런데 전체 추정치는 1.669%다. 진짜 값 2.807%의 60% 수준이다. Replay는 위로 빗나갔는데 IPS는 아래로 크게 빗나갔다.

**방법이 틀린 것이 아니다. 이 한 주가 그렇게 나온 것이다.** 평균이 맞는다는 성질은 한 번의 추정치를 보장하지 않는다. 왜 이렇게까지 흔들리는지가 다음 절이다.

:::deep 더 깊이 — 왜 평균이 맞나 (불편성 유도)

요청 $x$가 주어졌을 때 옛 정책은 확률 $p(a \mid x)$로 광고 $a$를 고른다. 새 정책이 고르는 것을 $\pi_e(x)$라 쓰자. 한 건이 더하는 값의 기대값은 이렇다.

$$E\!\left[\frac{\mathbf{1}[a = \pi_e(x)]}{p(a \mid x)}\, r \;\middle|\; x\right] = \sum_{a} p(a \mid x)\, \frac{\mathbf{1}[a = \pi_e(x)]}{p(a \mid x)}\, E[r \mid x, a]$$

합 안에서 $p(a \mid x)$가 약분된다. 지시함수 때문에 $a = \pi_e(x)$인 항만 남는다.

$$= E[r \mid x, \pi_e(x)]$$

이것이 바로 새 정책이 그 요청에서 얻을 기대 보상이다. 모든 요청에 대해 평균을 내면 새 정책의 값이 된다.

약분이 성립하려면 조건이 둘 있다. 첫째, $\pi_e(x)$를 고를 확률이 0이 아니어야 한다. 0이면 나눌 수 없다. 그 요청은 영원히 관측되지 않는다. 이것을 **공통 지지 조건**이라 부른다. 영어로는 support 조건이다. 둘째, 보상이 문맥과 선택한 광고에만 달려 있어야 한다. 옆에서 다른 광고가 같이 떴는지가 클릭에 영향을 준다면 이 식은 깨진다.

두 번째 조건은 광고 랭킹에서 자주 위태롭다. 한 화면에 여러 광고가 같이 뜬다. 위치에 따라 클릭률도 달라진다. 위치가 만드는 편향은 [위치 편향과 ULTR](post.html?id=position-bias-ultr)에서 따로 다룬다.
:::

### 성향점수를 안 남겼으면 여기서 끝난다

성향점수 `p`는 나중에 계산할 수 없다. 그 순간 그 요청에서 옛 모델이 낸 점수가 있어야 한다. 그때의 탐색 설정도 있어야 한다. 모델은 매일 새로 배포된다. 피처도 계속 갱신된다. 지난주 로그를 보고 지난주의 `p`를 되살리는 일은 실패한다.

그래서 첫 관문은 통계가 아니라 로깅이다. 서빙 시점에 남겨야 하는 것은 아래와 같다.

| 남길 필드 | 예시 값 | 없으면 무엇이 막히나 |
|---|---|---|
| `req_id` | `r-3c07` | 같은 요청을 다시 짚을 수 없다 |
| `slot` | `main_top` | 지면별 진단이 안 된다 |
| `cand_ids` | `9931`에서 `9938`까지 8개 | 새 정책을 다시 돌릴 수 없다 |
| `chosen_id` | `9935` | 무엇을 골랐는지 모른다 |
| `p_chosen` | `0.9109` | IPS·SNIPS·DR이 전부 막힌다 |
| `policy_id` | `rank-v41` | 어느 정책이 남긴 줄인지 모른다 |
| `explore_flag` | `false` | 탐색 건만 따로 볼 수 없다 |
| `y` | `0` | 라벨이 없다 |

여기서 실무에 도움이 되는 사실이 하나 있다. **고른 것의 확률 하나면 충분하다.** 후보 8개의 확률 분포를 전부 남길 필요는 없다. 나눗셈의 분모에 들어가는 것은 고른 광고의 확률뿐이다. 필드 하나가 부동소수 8바이트면 하루 2억 2,800만 줄에 1.8GB다. 분포 전체를 남기는 것보다 훨씬 싸다.

대신 후보 목록과 그때의 피처 값은 남겨야 한다. 새 정책을 돌려 무엇을 골랐을지 알아내려면 그 둘이 필요하다. 서빙 시점의 피처를 어떻게 붙잡아 두는지는 [피처 스토어와 서빙](post.html?id=feature-store-serving)에 있다.

---

## 4. 한 건이 전체를 흔드는 자리

**가중치 80짜리 한 건이 추정치의 0.8%p를 움직인다. 유효표본크기로 재면 10,000건짜리 로그가 339건이 된다.**

3절의 추정치는 왜 1.669%까지 내려갔나. 가중치가 어디에 몰려 있는지 보면 된다. 아래 코드가 겹친 2,595건을 가중치 구간으로 나눈다.

```python
# 가중치가 어디에 몰려 있나 — 그리고 유효표본크기(ESS)로 다시 재 본다.
import math, random
K, EPS, TAU = 8, 0.10, 0.0014
SLOTS = [("main_top", 2600, 0.024, 0.044, 0.000), ("search_top", 1400, 0.016, 0.032, 0.003),
         ("feed_mid", 3100, 0.007, 0.018, 0.010), ("feed_low", 2000, 0.004, 0.012, 0.014),
         ("detail_side", 900, 0.003, 0.009, 0.018)]

def build_log(seed=7):                          # 2절과 같은 함수다
    random.seed(seed); log = []
    for name, n, lo, hi, bonus in SLOTS:
        for _ in range(n):
            base = [random.uniform(lo, hi) for _ in range(K)]
            ctr = [b + bonus * (1 if random.random() < 0.2 else 0) for b in base]
            old_s = [b + random.gauss(0, 0.004) for b in base]
            new_s = [c + random.gauss(0, 0.002) for c in ctr]
            m = max(old_s); ex = [math.exp((s - m) / TAU) for s in old_s]; Z = sum(ex)
            p = [(1 - EPS) * (x / Z) + EPS / K for x in ex]
            u, acc, a = random.random(), 0.0, K - 1
            for i, pi in enumerate(p):
                acc += pi
                if u <= acc: a = i; break
            log.append((name, ctr, p, a, 1 if random.random() < ctr[a] else 0,
                        max(range(K), key=lambda i: new_s[i])))
    return log

log = build_log(); N = len(log)
rows = [(1 / x[2][x[5]], x[4]) for x in log if x[3] == x[5]]     # (가중치, 클릭) — 겹친 건만
sw = sum(w for w, r in rows); sw2 = sum(w * w for w, r in rows)
ess = sw * sw / sw2
ips = sum(w * r for w, r in rows) / N
v_new = sum(x[1][x[5]] for x in log) / N        # 새 정책의 진짜 값

print(f"{'가중치 1/p':>12}{'건수':>7}{'가중치 합':>11}{'제곱 합':>11}{'클릭':>6}{'IPS 기여':>11}")
BINS = [("1 ~ 2", 1, 2), ("2 ~ 5", 2, 5), ("5 ~ 10", 5, 10),
        ("10 ~ 20", 10, 20), ("20 ~ 40", 20, 40), ("40 ~ 80", 40, 81)]
for label, lo, hi in BINS:
    g = [(w, r) for w, r in rows if lo <= w < hi]
    s = sum(w for w, r in g); s2 = sum(w * w for w, r in g); c = sum(r for w, r in g)
    print(f"{label:>12}{len(g):>7,}{s:>11,.0f}{s2:>11,.0f}{c:>6}{sum(w*r for w,r in g)/N:>11.4%}")
print(f"{'합계':>12}{len(rows):>7,}{sw:>11,.0f}{sw2:>11,.0f}{sum(r for w,r in rows):>6}{ips:>11.4%}")

print(f"\n유효표본크기 ESS = (가중치 합)^2 / (제곱 합) = {sw:,.0f}^2 / {sw2:,.0f} = {ess:,.0f}")
print(f"  겹친 건 {len(rows):,}건 · 로그 {N:,}건 → 실제로 값을 지탱하는 건 {ess:,.0f}건")
print(f"  ESS {ess:,.0f}건에 진짜 CTR {v_new:.3%}를 곱하면 클릭 {ess*v_new:.1f}건 — 그만큼이 이 숫자를 받친다")

top = sorted(rows, key=lambda t: -t[0] * t[1])[:10]
print(f"\n클릭이 붙은 겹친 건 {sum(r for w,r in rows)}건 중 가중치 상위 10건이 IPS의 "
      f"{sum(w*r for w, r in top)/ (ips*N):.0%}를 만든다")
print(f"  상위 10건 가중치: {', '.join(f'{w:.0f}' for w, r in top)}")
print(f"  가장 큰 가중치 {max(w for w, r in rows):.0f}배 — 이 한 건이 {max(w for w,r in rows)/N:.4%}p를 움직인다")

# 출력:
#      가중치 1/p     건수      가중치 합       제곱 합    클릭     IPS 기여
#        1 ~ 2  1,883      2,437      3,254    68    0.8776%
#        2 ~ 5    442      1,304      4,101    14    0.4322%
#       5 ~ 10    135        935      6,784     4    0.3587%
#      10 ~ 20     50        715     10,545     0    0.0000%
#      20 ~ 40     33        947     28,370     0    0.0000%
#      40 ~ 80     52      3,343    223,039     0    0.0000%
#           합계  2,595      9,681    276,093    86    1.6685%
#
# 유효표본크기 ESS = (가중치 합)^2 / (제곱 합) = 9,681^2 / 276,093 = 339
#   겹친 건 2,595건 · 로그 10,000건 → 실제로 값을 지탱하는 건 339건
#   ESS 339건에 진짜 CTR 2.807%를 곱하면 클릭 9.5건 — 그만큼이 이 숫자를 받친다
#
# 클릭이 붙은 겹친 건 86건 중 가중치 상위 10건이 IPS의 36%를 만든다
#   상위 10건 가중치: 10, 9, 9, 8, 5, 5, 4, 4, 4, 3
#   가장 큰 가중치 80배 — 이 한 건이 0.8000%p를 움직인다
```

표의 마지막 줄을 보자. 가중치 40에서 80 사이인 건이 52개다. 겹친 건의 2.0%다. 그런데 이 52건이 가중치 합 9,681 중 3,343을 갖고 있다. 34.5%다. 그리고 **이 52건에는 클릭이 하나도 없다.** 그래서 추정치에 더해지는 값이 0이다.

만약 이 52건 중 하나에 클릭이 붙었다면 어땠을까. 가중치 80이면 `80 ÷ 10,000 = 0.8%p`가 더해진다. 추정치가 1.669%에서 2.469%로 뛴다. 클릭 한 번이 추정치를 절반 가까이 움직인다.

이 상태를 하나의 수로 요약한 것이 **유효표본크기**다. 영어 이름은 effective sample size, 줄여서 ESS다. 가중치가 전부 같으면 표본 수와 같아진다. 몇 건에 몰릴수록 작아진다. 이 로그에서는 339이다.

:::deep 더 깊이 — 유효표본크기 식

가중치 $w_i$의 합을 제곱한 뒤, 제곱의 합으로 나눈다.

$$\mathrm{ESS} = \frac{\left(\sum_i w_i\right)^2}{\sum_i w_i^2}$$

가중치가 전부 같으면 이 값은 건수와 같아진다. 한 건에 다 몰리면 1이 된다. 위 코드 출력의 두 합을 넣으면 `9,681² ÷ 276,093 = 339`다.
:::

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 520 336" role="img" aria-label="위쪽에 가로 막대 세 개가 있다. 로그 전체 10,000건은 가장 긴 막대이고, 겹친 건 2,595건은 그 4분의 1, 유효표본 339건은 거의 보이지 않는 짧은 막대다. 아래쪽에는 가중치 구간별 막대 여섯 개가 있고 오른쪽에 클릭 수가 적혀 있다. 가중치 40에서 80 구간 막대가 가장 길지만 클릭은 0이다." style="width:100%; max-width:520px; height:auto; font-family:var(--font-sans)">
<text x="4" y="14" style="font-size:12.5px; fill:var(--ink2)">표본이 세 번 줄어든다</text>
<text x="4" y="38" style="font-size:12px; fill:var(--ink3)">로그 전체</text>
<rect x="4" y="44" width="460" height="18" style="fill:var(--grey-bg); stroke:var(--grey); stroke-width:1.5"/>
<text x="470" y="58" style="font-size:12.5px; fill:var(--ink)">10,000</text>
<text x="4" y="82" style="font-size:12px; fill:var(--ink3)">겹친 건 (Replay가 쓰는 것)</text>
<rect x="4" y="88" width="119" height="18" style="fill:var(--navy-bg); stroke:var(--navy); stroke-width:1.5"/>
<text x="129" y="102" style="font-size:12.5px; fill:var(--ink)">2,595</text>
<text x="4" y="126" style="font-size:12px; fill:var(--ink3)">유효표본 ESS (IPS를 실제로 받치는 것)</text>
<rect x="4" y="132" width="16" height="18" style="fill:var(--oxide-bg); stroke:var(--oxide); stroke-width:2.5"/>
<text x="26" y="146" style="font-size:12.5px; fill:var(--oxide)">339</text>
<line x1="4" y1="166" x2="516" y2="166" style="stroke:var(--rule); stroke-width:1"/>
<text x="4" y="186" style="font-size:12.5px; fill:var(--ink2)">겹친 2,595건의 가중치가 어디에 있나 (가중치 합 9,681)</text>
<g style="font-size:12px; fill:var(--ink2)">
<rect x="56" y="196" width="116" height="12" style="fill:var(--navy)"/>
<text x="4" y="206">1-2</text>
<text x="222" y="206">가중치 2,437 · 클릭 68</text>
<rect x="56" y="216" width="62" height="12" style="fill:var(--navy)"/>
<text x="4" y="226">2-5</text>
<text x="222" y="226">가중치 1,304 · 클릭 14</text>
<rect x="56" y="236" width="44" height="12" style="fill:var(--navy)"/>
<text x="4" y="246">5-10</text>
<text x="222" y="246">가중치 935 · 클릭 4</text>
<rect x="56" y="256" width="34" height="12" style="fill:var(--grey)"/>
<text x="4" y="266">10-20</text>
<text x="222" y="266">가중치 715 · 클릭 0</text>
<rect x="56" y="276" width="45" height="12" style="fill:var(--grey)"/>
<text x="4" y="286">20-40</text>
<text x="222" y="286">가중치 947 · 클릭 0</text>
<rect x="56" y="296" width="159" height="12" style="fill:none; stroke:var(--oxide); stroke-width:2.5; stroke-dasharray:6 3"/>
<text x="4" y="306">40-80</text>
<text x="222" y="306" style="fill:var(--oxide)">가중치 3,343 · 클릭 0</text>
</g>
<text x="4" y="328" style="font-size:12.5px; fill:var(--ink3)">막대 길이는 그 구간의 가중치 합이다. 건수가 아니다.</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">점선으로 그린 마지막 막대가 이 추정치의 위험이 놓인 자리다. 가중치의 3분의 1을 52건이 들고 있는데 그 52건에서 클릭이 한 번도 안 나왔다.</figcaption>
</figure>

ESS 339에 진짜 CTR 2.807%를 곱하면 클릭 9.5건이다. **클릭 열 번 남짓으로 정책 하나를 판정하고 있는 셈이다.** 이 수를 계산하지 않으면 "10,000건이나 썼다"고 착각하게 된다.

실무에서 ESS는 경보로 쓴다. 기준을 미리 정해 두는 편이 낫다. ESS가 전체 요청의 1% 아래로 떨어지면 그 추정치는 보고서에 쓰지 않는다는 식이다. 이 로그의 ESS는 3.4%다. 통과는 하지만 넉넉하지 않다.

아래 데모에서 탐색 비율과 정책 차이를 움직이면 가중치 분포와 ESS가 같이 바뀐다. 탐색을 늘리면 최대 가중치가 어떻게 내려가는지 눈으로 볼 수 있다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-ips-weights.html?embed=1" height="890" loading="lazy" title="IPS 가중치와 유효표본크기 미니 데모"></iframe>
<a class="demo-embed-open" href="demo-ips-weights.html" target="_blank" rel="noopener">↗ 전체 데모로 열기</a>
</div>

---

## 5. 흔들림을 줄이면 값이 내려간다

**자기정규화는 가중치 합의 어긋남을 지운다. 절단은 흔들림을 크게 줄이는 대신 값을 24% 깎는다. 둘을 같이 걸면 오차가 가장 작다.**

4절까지는 한 주의 로그만 봤다. 그 한 주가 운이 나빴는지는 알 수 없다. 같은 조건의 주를 여러 번 뽑아 봐야 갈린다. 아래 코드가 400주를 뽑는다.

겹치지 않은 건은 어느 추정기에서도 0을 더한다. 그래서 요청마다 겹칠 확률과 그때의 CTR만 있으면 한 주를 다시 뽑을 수 있다. 그렇게 줄여야 400번이 몇 초에 끝난다.

```python
# 같은 조건의 '지난주'를 400번 다시 뽑아, 추정기마다 평균과 흔들림을 잰다.
# 평균이 진짜 값에서 벗어난 만큼이 편향이고, 주마다 흔들리는 폭이 분산이다.
import math, random
K, EPS, TAU = 8, 0.10, 0.0014
SLOTS = [("main_top", 2600, 0.024, 0.044, 0.000), ("search_top", 1400, 0.016, 0.032, 0.003),
         ("feed_mid", 3100, 0.007, 0.018, 0.010), ("feed_low", 2000, 0.004, 0.012, 0.014),
         ("detail_side", 900, 0.003, 0.009, 0.018)]

def build_log(seed=7):                          # 2절과 같은 함수다
    random.seed(seed); log = []
    for name, n, lo, hi, bonus in SLOTS:
        for _ in range(n):
            base = [random.uniform(lo, hi) for _ in range(K)]
            ctr = [b + bonus * (1 if random.random() < 0.2 else 0) for b in base]
            old_s = [b + random.gauss(0, 0.004) for b in base]
            new_s = [c + random.gauss(0, 0.002) for c in ctr]
            m = max(old_s); ex = [math.exp((s - m) / TAU) for s in old_s]; Z = sum(ex)
            p = [(1 - EPS) * (x / Z) + EPS / K for x in ex]
            u, acc, a = random.random(), 0.0, K - 1
            for i, pi in enumerate(p):
                acc += pi
                if u <= acc: a = i; break
            log.append((name, ctr, p, a, 1 if random.random() < ctr[a] else 0,
                        max(range(K), key=lambda i: new_s[i])))
    return log

# 겹치지 않은 건은 어떤 추정기에도 0을 더한다. 그래서 겹칠 확률과 그때의 CTR만 있으면 된다.
pool = [(x[2][x[5]], x[1][x[5]]) for x in build_log()]
N = len(pool)
V = sum(c for p, c in pool) / N                 # 새 정책의 진짜 값

def one_week(rng):
    return [(1 / pe, 1 if rng.random() < ce else 0) for pe, ce in pool if rng.random() < pe]

EST = ["Replay", "IPS", "SNIPS", "절단 M=20", "절단 M=5", "절단 M=20 + 자기정규화"]
acc = {k: [] for k in EST}
for wk in range(400):
    rows = one_week(random.Random(1000 + wk))
    sw = sum(w for w, r in rows); swr = sum(w * r for w, r in rows)
    acc["Replay"].append(sum(r for w, r in rows) / len(rows))
    acc["IPS"].append(swr / N)
    acc["SNIPS"].append(swr / sw)
    for M, key in ((20, "절단 M=20"), (5, "절단 M=5")):
        cw = [min(w, M) for w, r in rows]
        acc[key].append(sum(c * r for c, (w, r) in zip(cw, rows)) / N)
        if M == 20:
            acc["절단 M=20 + 자기정규화"].append(sum(c * r for c, (w, r) in zip(cw, rows)) / sum(cw))

print(f"새 정책의 진짜 값 = {V:.3%}   ('지난주'를 400번 다시 뽑았다)\n")
print(f"{'추정기':<22}{'평균':>9}{'편향':>9}{'표준편차':>10}{'RMSE':>9}{'20% 넘게 빗나간 주':>20}")
for k in EST:
    v = acc[k]; mu = sum(v) / len(v)
    sd = (sum((x - mu) ** 2 for x in v) / (len(v) - 1)) ** 0.5
    rmse = (sum((x - V) ** 2 for x in v) / len(v)) ** 0.5
    off = sum(1 for x in v if abs(x - V) > 0.2 * V) / len(v)
    print(f"{k:<22}{mu:>9.3%}{mu-V:>+9.3%}{sd:>10.3%}{rmse:>9.3%}{off:>20.0%}")

# 400주를 10주씩 40묶음으로 합치면 요청 100,000건짜리 추정 40개가 된다.
print(f"\n{'로그를 10배(100,000건)로 늘리면':<28}{'평균':>9}{'편향':>9}{'표준편차':>10}")
for k in ("Replay", "IPS"):
    g = [sum(acc[k][i*10:(i+1)*10]) / 10 for i in range(40)]
    mu = sum(g) / 40; sd = (sum((x - mu) ** 2 for x in g) / 39) ** 0.5
    print(f"{k:<28}{mu:>9.3%}{mu-V:>+9.3%}{sd:>10.3%}")

# 출력:
# 새 정책의 진짜 값 = 2.807%   ('지난주'를 400번 다시 뽑았다)
#
# 추정기                          평균       편향      표준편차     RMSE        20% 넘게 빗나간 주
# Replay                   3.183%  +0.376%    0.355%   0.517%                 31%
# IPS                      2.776%  -0.031%    0.809%   0.808%                 48%
# SNIPS                    2.781%  -0.026%    0.812%   0.811%                 50%
# 절단 M=20                  2.124%  -0.683%    0.407%   0.795%                 64%
# 절단 M=5                   1.582%  -1.225%    0.210%   1.243%                100%
# 절단 M=20 + 자기정규화          2.917%  +0.110%    0.553%   0.563%                 30%
#
# 로그를 10배(100,000건)로 늘리면             평균       편향      표준편차
# Replay                         3.183%  +0.376%    0.117%
# IPS                            2.776%  -0.031%    0.224%
```

표를 정리하면 이렇다. 진짜 값은 2.807%다. 편향은 400주 평균이 진짜 값에서 벗어난 만큼이다. 표준편차는 주마다 흔들리는 폭이다. RMSE는 그 둘을 한 수로 합친 값이고 작을수록 좋다.

| 추정기 | 400주 평균 | 편향 | 표준편차 | RMSE | 20% 넘게 빗나간 주 |
|---|---|---|---|---|---|
| Replay | 3.183% | +0.376%p | 0.355%p | 0.517%p | 31% |
| IPS | 2.776% | -0.031%p | 0.809%p | 0.808%p | 48% |
| SNIPS | 2.781% | -0.026%p | 0.812%p | 0.811%p | 50% |
| 절단 M=20 | 2.124% | -0.683%p | 0.407%p | 0.795%p | 64% |
| 절단 M=5 | 1.582% | -1.225%p | 0.210%p | 1.243%p | 100% |
| 절단 M=20 + 자기정규화 | 2.917% | +0.110%p | 0.553%p | 0.563%p | 30% |

세 가지를 읽을 수 있다.

**첫째, 역확률 가중은 정말로 치우침이 없다.** 400주 평균 2.776%는 진짜 값 2.807%와 0.031%p 차이다. 400주 평균의 표준오차는 `0.809 ÷ 20 = 0.040%p`다. 차이가 그 안에 든다. 겹치는 건만 쓰기는 다르다. 편향 +0.376%p는 진짜 값의 13.4%이고 표준오차의 아홉 배를 넘는다.

차이는 코드 출력의 마지막 두 줄에서 분명해진다. 로그를 10배로 늘리면 표준편차가 0.809%p에서 0.224%p로 줄어든다. 겹치는 건만 쓰기의 편향은 +0.376%p 그대로다. **흔들림은 데이터로 사고, 편향은 데이터로 못 산다.**

**둘째, 자기정규화(SNIPS)만으로는 여기서 별 도움이 안 된다.** 표준편차가 0.809%p에서 0.812%p로 사실상 그대로다.

자기정규화는 나눗셈의 분모를 바꾸는 손질이다. 요청 수 대신 가중치 합으로 나눈다. 3절에서 가중치 합은 9,681로 요청 수 10,000에서 3% 어긋났다. 그런 어긋남을 지운다. 문제는 이 데이터에서 흔들림의 주범이 가중치 합이 아니라는 것이다. 클릭이 드물어서 분자가 훨씬 크게 흔들린다. 분모를 다듬어도 분자의 흔들림은 그대로다.

:::deep 더 깊이 — 자기정규화 식

$$\hat{V}_{\mathrm{SNIPS}} = \frac{\sum_i w_i r_i}{\sum_i w_i}, \qquad w_i = \frac{\mathbf{1}[a_i = \pi_e(x_i)]}{p_i}$$

3절 식과 분자는 같고 분모만 다르다. 3절은 요청 수 $n$으로 나눴다. 여기서는 가중치 합으로 나눈다. 가중치 합의 기대값이 $n$이라서 둘이 비슷한 값을 낸다. 대신 이쪽은 완전한 불편추정이 아니다. 표본이 커지면 치우침이 사라지는 종류다.
:::

**셋째, 절단만 하면 값이 아래로 끌려 내려간다.** 가중치에 상한을 두는 손질을 **절단**(clipping)이라 부른다. 상한을 20으로 두면 표준편차가 0.809%p에서 0.407%p로 절반이 된다. 대신 평균이 2.124%로 내려앉는다. 편향 -0.683%p는 진짜 값의 24%다. 상한을 5로 더 조이면 표준편차는 0.210%p까지 내려간다. 그 대신 편향이 -1.225%p, 즉 44%가 된다. 400주 전부가 20% 넘게 빗나간다.

이유는 잘라 낸 몫이 돌아오지 않기 때문이다. 가중치 80을 20으로 자르면 그 건이 대표하던 60건 몫이 사라진다. 아무 데도 더해지지 않으니 합계가 그만큼 작아진다.

**절단과 자기정규화를 같이 걸면 그 몫이 대부분 돌아온다.** 분모도 같이 줄어들기 때문이다. 평균 2.917%, 편향 +0.110%p, RMSE 0.563%p로 표에서 가장 낫다. 역확률 가중의 RMSE 0.808%p보다 30% 작다.

실무 기본값은 이것이다. **가중치 상한을 걸고, 자기정규화를 같이 건다.** 상한 값은 유효표본크기를 보면서 정한다. 상한을 낮출수록 유효표본크기는 커지고 편향도 커진다. 그래서 목표선을 넘는 가장 큰 상한을 고른다.

---

## 6. 두 방법을 겹치는 법

**보상 모델로 먼저 답을 깔고, 가중치는 그 모델이 틀린 몫에만 건다. 그러면 둘 중 하나만 맞아도 값이 진짜에 붙는다.**

지금까지 쓴 재료는 성향점수 `p` 하나였다. 재료가 하나 더 있다. **보상 모델** $\hat{q}(x, a)$다. 요청 $x$에서 광고 $a$를 띄우면 클릭될 확률을 예측한다. 우리는 이미 그런 모델을 갖고 있다. pCTR 모델이 바로 그것이다.

보상 모델만으로 채점할 수도 있다. 새 정책이 고를 광고의 예측을 평균 내면 끝이다. 이 방법을 **모델 예측만 쓰기**(DM)라 부른다. 로그의 결과를 아예 안 쓴다. 그래서 모델이 틀리면 그대로 틀린다.

두 재료를 겹치는 방법이 있다. 이것을 **이중 강건**(DR)이라 부른다. 원래 이름은 doubly robust다.

계산은 두 단계다. 먼저 새 정책이 고를 광고의 예측을 다 더한다. 그 다음 겹친 건에서 실제 클릭과 예측의 차이만 `1/p`배로 더한다. 뒤 단계가 앞 단계의 오차를 메운다.

중요한 것은 뒤 단계가 무엇에 가중하느냐다. 클릭이 아니라 **잔차**에 가중한다. 보상 모델이 잘 맞으면 잔차가 작아진다. 그러면 큰 가중치가 곱해질 값 자체가 작아진다.

아래 코드가 네 경우를 다 만든다. 성향점수가 맞거나 틀리고, 보상 모델이 맞거나 틀린다. 틀린 성향점수는 탐색 비율을 10%가 아니라 20%로 잘못 알고 있는 경우다. 틀린 보상 모델은 후보를 구분하지 못하고 지면 평균만 내놓는 모델이다.

```python
# DR(이중 강건) — 보상 모델과 성향점수 중 하나만 맞아도 값이 산다.
# 넷을 다 만들어 본다: (성향점수 맞음/틀림) x (보상 모델 맞음/틀림)
import math, random
K, EPS, TAU = 8, 0.10, 0.0014
SLOTS = [("main_top", 2600, 0.024, 0.044, 0.000), ("search_top", 1400, 0.016, 0.032, 0.003),
         ("feed_mid", 3100, 0.007, 0.018, 0.010), ("feed_low", 2000, 0.004, 0.012, 0.014),
         ("detail_side", 900, 0.003, 0.009, 0.018)]

def build_log(seed=7):                          # 2절과 같은 함수다
    random.seed(seed); log = []
    for name, n, lo, hi, bonus in SLOTS:
        for _ in range(n):
            base = [random.uniform(lo, hi) for _ in range(K)]
            ctr = [b + bonus * (1 if random.random() < 0.2 else 0) for b in base]
            old_s = [b + random.gauss(0, 0.004) for b in base]
            new_s = [c + random.gauss(0, 0.002) for c in ctr]
            m = max(old_s); ex = [math.exp((s - m) / TAU) for s in old_s]; Z = sum(ex)
            p = [(1 - EPS) * (x / Z) + EPS / K for x in ex]
            u, acc, a = random.random(), 0.0, K - 1
            for i, pi in enumerate(p):
                acc += pi
                if u <= acc: a = i; break
            log.append((name, ctr, p, a, 1 if random.random() < ctr[a] else 0,
                        max(range(K), key=lambda i: new_s[i])))
    return log

MEAN = {n: (lo + hi) / 2 + 0.2 * bonus for n, _, lo, hi, bonus in SLOTS}   # 지면 평균 CTR
pool = []      # (진짜 성향, 잘못 기록된 성향, 진짜 CTR, 지면 평균으로 뭉갠 예측)
for name, ctr, p, a, r, e in build_log():
    soft = (p[e] - EPS / K) / (1 - EPS)                # softmax 성분만 되꺼낸다
    pool.append((p[e], 0.80 * soft + 0.20 / K, ctr[e], MEAN[name]))
N = len(pool)
V = sum(c for _, _, c, _ in pool) / N
DM = {1: sum(c for _, _, c, _ in pool) / N, 0: sum(q for _, _, _, q in pool) / N}

est = {(tp, tq): {"ips": [], "dr": []} for tp in (1, 0) for tq in (1, 0)}
for wk in range(400):
    rng = random.Random(1000 + wk)
    rows = [(pe, pw, ce, qm, 1 if rng.random() < ce else 0)
            for pe, pw, ce, qm in pool if rng.random() < pe]     # 겹친 건만 남는다
    for (tp, tq), box in est.items():
        ips = corr = 0.0
        for pe, pw, ce, qm, r in rows:
            ph = pe if tp else pw                                # 우리가 믿는 성향점수
            q = ce if tq else qm                                 # 보상 모델의 예측
            ips += r / ph
            corr += (r - q) / ph                                 # DR은 잔차에 가중한다
        box["ips"].append(ips / N)
        box["dr"].append(DM[tq] + corr / N)

def sd(v):
    mu = sum(v) / len(v)
    return (sum((x - mu) ** 2 for x in v) / (len(v) - 1)) ** 0.5

print(f"새 정책의 진짜 값 = {V:.3%}   (400주 평균)\n")
print(f"{'성향점수':<10}{'보상 모델':<12}{'DM':>9}{'IPS':>9}{'DR':>9}{'IPS 편차':>10}{'DR 편차':>10}")
for (tp, tq) in ((1, 1), (1, 0), (0, 1), (0, 0)):
    b = est[(tp, tq)]
    print(f"{'맞음' if tp else '틀림':<10}{'맞음' if tq else '틀림':<12}{DM[tq]:>9.3%}"
          f"{sum(b['ips'])/400:>9.3%}{sum(b['dr'])/400:>9.3%}"
          f"{sd(b['ips']):>10.3%}{sd(b['dr']):>10.3%}")

# 출력:
# 새 정책의 진짜 값 = 2.807%   (400주 평균)
#
# 성향점수      보상 모델              DM      IPS       DR    IPS 편차     DR 편차
# 맞음        맞음             2.807%   2.776%   2.775%    0.809%    0.806%
# 맞음        틀림             1.980%   2.776%   2.774%    0.809%    0.805%
# 틀림        맞음             2.807%   2.442%   2.797%    0.526%    0.521%
# 틀림        틀림             1.980%   2.442%   2.671%    0.526%    0.521%
```

DR 열만 따라 읽으면 된다. 진짜 값은 2.807%다.

| 성향점수 | 보상 모델 | DM | IPS | DR |
|---|---|---|---|---|
| 맞음 | 맞음 | 2.807% | 2.776% | 2.775% |
| 맞음 | 틀림 | **1.980%** | 2.776% | 2.774% |
| 틀림 | 맞음 | 2.807% | **2.442%** | 2.797% |
| 틀림 | 틀림 | **1.980%** | **2.442%** | 2.671% |

둘째 줄을 보자. 모델 예측만 쓰면 1.980%로 크게 빗나간다. 이중 강건은 2.774%로 버틴다. 성향점수가 맞았기 때문이다. 셋째 줄에서는 역확률 가중이 2.442%로 13% 낮게 나온다. 이중 강건은 2.797%다. 보상 모델이 맞았기 때문이다.

넷째 줄에서 처음으로 이중 강건이 흔들린다. 2.671%로 진짜보다 4.8% 낮다. 그래도 1.980%나 2.442%보다는 낫다. 두 오차가 서로를 부분적으로는 덮기 때문이다.

한 가지 기대를 접어야 한다. **여기서 이중 강건은 흔들림을 거의 줄이지 못한다.** 편차가 0.809%p에서 0.806%p로 사실상 같다. 보상이 0과 1뿐이고 클릭이 드물기 때문이다. 그러면 잔차의 흔들림이 클릭의 흔들림과 거의 같다. 이득은 보상이 연속인 지표에서 커진다. 클릭 대신 전환 매출이나 체류 시간을 재면 눈에 띄게 줄어든다.

:::deep 더 깊이 — 이중 강건의 식과 편향

식으로 쓰면 이렇다. $w_i$는 3절에서 쓴 가중치와 같다.

$$\hat{V}_{\mathrm{DR}} = \frac{1}{n}\sum_i \Bigl[\, \hat{q}\bigl(x_i, \pi_e(x_i)\bigr) + w_i\,\bigl(r_i - \hat{q}(x_i, a_i)\bigr) \Bigr]$$

앞항이 모델 예측만 쓰기이고 뒷항이 역확률 가중이다. 뒷항이 클릭 대신 잔차에 가중하는 점만 다르다.

편향을 정리하면 이런 모양이 된다. $p$는 진짜 성향점수, $\hat{p}$는 우리가 믿는 값이다. $q$는 진짜 기대 보상, $\hat{q}$는 보상 모델의 예측이다.

$$\mathrm{Bias}(\hat{V}_{\mathrm{DR}}) = E\left[\left(1 - \frac{p}{\hat{p}}\right)\bigl(\hat{q} - q\bigr)\right]$$

두 괄호의 곱이라는 점이 전부다. 성향점수가 맞으면 앞 괄호가 0이 되고, 보상 모델이 맞으면 뒤 괄호가 0이 된다. 어느 쪽이든 곱이 0이니 편향이 사라진다. 이것이 이중 강건이라는 이름의 뜻이다.

곱이라는 사실은 실무에서 더 쓸모가 있다. 둘 다 조금씩 틀린 경우를 보자. 성향점수가 10% 틀리고 보상 모델이 10% 틀리면 편향은 대략 1% 수준이 된다. 각각을 완벽하게 만들려고 애쓰는 것보다 **둘 다 웬만하게 만드는 편이 싸다.**

한 가지 주의가 있다. 위 식이 성립하려면 보상 모델이 이 로그로 학습된 것이 아니어야 한다. 같은 데이터로 학습하고 같은 데이터로 평가하면 잔차가 인위적으로 작아진다. 실무에서는 로그를 시간으로 가른다. 앞 기간으로 보상 모델을 학습하고 뒤 기간으로 평가한다. 갈라 쓰지 않으면 값이 모델 예측 쪽으로 조용히 기운다. 그 사실이 표에 드러나지 않는다.
:::

---

## 7. 확률로 남기지 않으면 아무것도 못 한다

**옛 정책이 argmax만 하면 성향점수가 0 아니면 1이다. 그러면 겹치지 않은 건을 되살릴 방법이 없다.**

여기서 자주 뒤집혀 이야기되는 것이 있다. "새 정책이 argmax라서 역확률 가중을 못 쓴다"는 말이다. **반은 틀렸다.** argmax는 점수가 가장 높은 하나를 무조건 고르는 것이다. 새 정책이 그렇게 고르는 것은 아무 문제가 없다. 3절의 식이 바로 그 경우를 다뤘다. 지시함수가 1이 되는 건만 남는 것뿐이다.

막히는 것은 반대쪽이다. **로그를 남긴 옛 정책이 argmax만 했을 때** 계산이 죽는다. 그러면 고른 것의 확률이 1이고 나머지는 0이다. 겹친 건은 가중치가 1이니 그냥 세는 것과 같다. 겹치지 않은 건은 확률이 0이라 나눌 수 없다. 3절 접기에서 말한 공통 지지 조건이 깨진다.

그래서 이것은 오늘 어떤 추정기를 고르느냐의 문제가 아니다. **지난주에 로그를 어떻게 남겼느냐의 문제다.** 옛 정책에 확률을 심어 두지 않았다면 남는 길은 하나다. 2절의 겹치는 건만 쓰기다. 거기서 본 편향을 안고 가야 한다.

확률을 심는 방법은 둘이 흔하다. ε-greedy는 일정 비율만큼 균등 무작위로 고르고 나머지는 argmax다. softmax는 점수를 확률로 바꿔 전부 확률적으로 고른다. 아래는 후보 8개일 때 두 방식의 성질이다.

| 로깅 방식 | 최소 선택 확률 | 최대 가중치 | IPS를 쓸 수 있나 | 성적 손실 |
|---|---|---|---|---|
| argmax만 | 0 | 무한 | 못 쓴다 | 0 |
| softmax만 | 정해진 하한이 없다 | 제한이 없다 | 위태롭다 | 작다 |
| ε-greedy, ε=0.02 | 0.0025 | 400 | 되지만 흔들린다 | 0.007%p |
| ε-greedy, ε=0.10 | 0.0125 | 80 | 쓸 만하다 | 0.034%p |
| ε-greedy, ε=0.20 | 0.025 | 40 | 넉넉하다 | 0.068%p |
| 완전 균등 무작위 | 0.125 | 8 | 가장 깨끗하다 | 0.342%p |

최대 가중치는 후보 수를 탐색 비율로 나눈 값이다. `8 ÷ 0.10 = 80`이다. 이 글의 로그가 바로 그 설정이다. 4절 표의 마지막 구간이 80에서 끊긴 이유다.

성적 손실은 2절 코드의 출력에서 나온다. 후보 8개를 균등 무작위로 고르면 CTR이 1.983%다. 탐색을 아예 끄면 옛 정책의 값은 `(2.291 − 0.1 × 1.983) ÷ 0.9 = 2.325%`가 된다. 그러니 무작위로 돌리는 구간에서 요청당 `2.325 − 1.983 = 0.342%p`를 잃는다. 탐색 비율이 ε이면 전체 손실은 그 ε배다.

**여기가 맞바꿈이 생기는 자리다.** 탐색을 늘리면 추정이 튼튼해지고 오늘의 성적이 내려간다. 탐색을 줄이면 반대다. 이 맞바꿈을 더 영리하게 다루는 방법이 밴딧이다. 무작위로 흩뿌리는 대신 불확실한 곳에 탐색을 몰아 준다. 자세한 것은 [탐색과 활용](post.html?id=exploration-exploitation)과 [disjoint LinUCB](post.html?id=disjoint-linucb)에 있다.

softmax만 쓰는 경우를 따로 볼 필요가 있다. 점수 차가 벌어지면 확률이 얼마든지 작아진다. 2절 코드에서 `EPS`를 0으로 두고 다시 돌려 보면 바로 보인다. 겹칠 확률이 0.0001 아래인 요청이 6%쯤 나온다. 그 건들의 가중치는 10,000배를 넘는다. 그래서 실무에서는 softmax를 쓰더라도 확률 하한을 함께 건다. 하한을 걸면 최대 가중치가 계산 가능한 값으로 묶인다.

---

## 8. 이걸로 온라인 A/B를 대신할 수는 없다 [무대: 공통]

**오프폴리시 추정은 후보를 걸러 내는 단계다. 통과한 한둘만 A/B로 보낸다. 순서를 바꾸면 둘 다 망가진다.**

여기까지 오면 이런 생각이 든다. 로그로 이만큼 잴 수 있으면 A/B를 왜 하나. 세 가지 때문이다.

**첫째, 구간이 너무 넓다.** 4절에서 ESS 339, 클릭 9.5건이었다. 5절 표에서 역확률 가중의 표준편차는 0.809%p였다. 진짜 값 2.807%의 29%다. 이 폭으로는 5% 차이를 가르지 못한다. 로그를 백 배로 늘려도 표준편차는 10분의 1이 될 뿐이다.

**둘째, 정책을 바꾸면 세상이 반응한다.** 이 글의 전제는 "다른 것은 그대로"다. 실제로는 그렇지 않다. 새 정책이 입찰가를 높이면 낙찰률이 오른다. 그러면 예산이 빨리 마르고 사는 시간대가 달라진다. 같은 광고를 더 자주 보게 된 유저는 클릭을 덜 한다. 이 되먹임은 지난주 로그에 없다. [모델 A/B 테스트](post.html?id=model-ab-testing) 1절이 이 문제만 따로 다룬다.

**셋째, 로그에 없는 행동은 영원히 못 잰다.** 새 정책이 지난주에 한 번도 안 뜬 신규 광고를 고른다고 하자. 그 광고의 성적은 어떤 추정기로도 나오지 않는다. 신규 광고를 어떻게 다루는지는 [콜드 스타트 pCTR](post.html?id=cold-start-pctr)에 있다.

그래서 실무의 순서는 이렇게 된다. 후보 정책이 마흔 개라면 로그로 대여섯 개까지 줄인다. 그중 한둘만 A/B로 보낸다. A/B 한 판에 일주일과 트래픽 절반이 든다. 마흔 개를 차례로 돌리면 마흔 주가 걸린다.

**거르는 데 쓰는 값은 정확할 필요가 없다.** 순서만 맞으면 된다. 5절에서 절단과 자기정규화를 같이 걸어 RMSE를 줄인 이유가 그것이다. 절대값이 조금 낮게 나와도 괜찮다. 후보들을 같은 방식으로 재면 순위는 유지된다.

반대로 이렇게 쓰면 안 되는 자리도 분명하다. 광고주 보고, 정산, 모델 카드에 들어갈 숫자는 다르다. 그 숫자는 로그 추정치로 채우지 않는다. 그 자리는 [무작위 통제 실험](post.html?id=rct-randomized-experiment)의 몫이다.

### 담장 안에서는 로깅 정책을 우리가 정한다 [무대: 닫힌 생태계]

담장 안 DSP는 경매를 직접 돌린다. 그래서 7절의 맞바꿈을 우리가 직접 정할 수 있다. 탐색 비율을 지면별로 다르게 잡는 것도 가능하다. 트래픽이 많고 CTR이 낮은 지면에서 탐색을 더 한다. 매출이 큰 지면에서는 덜 한다.

`p_chosen`을 로그 스키마에 넣는 것도 우리 결정이다. 노출 로그 한 줄에 필드 하나를 더하는 일이다. 그 줄은 이미 [Kafka 토픽](post.html?id=kafka-log-pipeline)을 지나간다. 유저 ID로 요청을 묶을 수도 있다. 그러면 유저 단위로 정책을 고정해 로그를 남기는 것도 된다.

대신 담장 안에는 다른 제약이 있다. 지면과 광고주가 둘 다 우리 고객이다. 탐색이 만드는 성적 하락을 양쪽에 설명해야 한다. "이번 달 CTR이 0.03%p 낮은 것은 다음 모델을 위한 탐색 때문"이라고 매체 담당자에게 말해야 한다. 광고주 담당자에게도 따로 말해야 한다.

### 열린 RTB에서는 성향점수가 남의 손에 있다 [무대: 열린 RTB]

외부 DSP는 상황이 다르다. 우리가 정하는 것은 **입찰가와 어떤 크리에이티브를 실을지**까지다. 그 입찰이 노출로 이어질지는 거래소의 경매가 정한다.

그래서 "우리 정책이 이 광고를 고를 확률"과 "이 광고가 실제로 노출될 확률"이 갈린다. 뒤의 것은 경쟁 입찰가에 달려 있다. 우리는 그 값을 못 본다. 패찰하면 얼마에 졌는지도 모른다. 이 구조는 [Bid Shading과 검열된 데이터](post.html?id=bid-shading-censored)에 있다.

실무에서는 두 단계를 나눠 다룬다. 우리 랭킹 정책의 확률은 우리가 남긴다. 경매 통과 확률은 따로 모델링해 낙찰 확률로 곱한다. 그러면 성향점수가 두 항의 곱이 된다. 뒤 항이 모델 추정치라 오차가 실린다. 6절의 이중 강건이 여기서 값을 한다. 성향점수가 부정확해도 보상 모델이 받쳐 주기 때문이다.

한 가지 더 있다. 전환은 광고주 포스트백이나 측정 사업자(MMP)를 거쳐 늦게 들어온다. 일부는 아예 안 온다. 지난주 로그로 채점할 때 전환이 다 안 도착했다면 값이 아래로 내려간다. 도착 분포를 어떻게 다루는지는 [지연 피드백과 온라인 학습](post.html?id=online-learning-delayed-feedback)에 있다.

---

## 한눈 정리

| 추정기 | 쓰는 재료 | 편향 | 흔들림 | 언제 쓰나 |
|---|---|---|---|---|
| Replay | 겹침 여부만 | 크다 (+13.4%) | 작다 | 성향점수가 없을 때의 마지막 수단 |
| IPS | 성향점수 `p` | 없다 | 크다 (29%) | 편향 없는 기준선이 필요할 때 |
| SNIPS | 성향점수 `p` | 없다 | IPS와 비슷 | 가중치 합이 크게 흔들릴 때 |
| 절단 IPS | `p` + 상한 M | 아래로 크다 (-24%) | 절반으로 | 단독으로는 권하지 않는다 |
| 절단 + 자기정규화 | `p` + 상한 M | 작다 (+3.9%) | 중간 | 실무 기본값 |
| DR | `p` + 보상 모델 | 하나만 맞으면 없다 | IPS와 비슷 | 성향점수가 의심스러울 때 |

수치는 이 글의 가상 데이터 기준이다. 진짜 값 2.807%에 대한 400주 평균으로 계산했다.

| 점검 항목 | 이 로그의 값 | 기준 |
|---|---|---|
| 겹침률 | 25.9% | 10% 아래면 Replay는 못 쓴다 |
| 가중치 합 대 요청 수 | 9,681 대 10,000 | 10% 넘게 어긋나면 로깅을 의심한다 |
| 최대 가중치 | 80 | 후보 수를 탐색 비율로 나눈 값과 맞아야 한다 |
| ESS | 339 (요청의 3.4%) | 1% 아래면 보고하지 않는다 |
| ESS로 환산한 클릭 | 9.5건 | 두 자리 아래면 순위 비교만 한다 |

---

## 헷갈리기 쉬운 점

- **새 정책이 argmax인 것은 문제가 아니다.** 문제는 옛 정책이 argmax였을 때다. 로그를 남긴 쪽에 확률이 없으면 나눗셈의 분모가 0 아니면 1이 된다. 그러면 겹치지 않은 건을 되살릴 방법이 사라진다.
- **`p`는 나중에 계산할 수 없다.** 그 순간의 모델과 탐색 설정이 있어야 나오는 값이다. 모델은 매일 바뀐다. 서빙 시점에 남기지 않았으면 그 로그로는 역확률 가중을 못 쓴다.
- **불편이라는 말은 한 번의 추정치가 맞는다는 뜻이 아니다.** 3절의 추정치는 1.669%였고 진짜는 2.807%였다. 여러 번 평균 내면 맞는다는 뜻일 뿐이다.
- **겹친 건 수와 유효표본크기는 다르다.** 겹친 건은 2,595건인데 ESS는 339건이다. 겹친 건 수만 보고 표본이 충분하다고 판단하면 클릭 열 번짜리 숫자를 믿게 된다.
- **가중치 절단은 공짜가 아니다.** 상한 20이면 편향 -24%, 상한 5면 -44%다. 잘라 낸 몫이 어디에도 더해지지 않기 때문이다. 자기정규화를 같이 걸어야 대부분 돌아온다.
- **이중 강건의 보상 모델은 평가에 쓸 로그로 학습하면 안 된다.** 같은 데이터로 학습하고 평가하면 잔차가 인위적으로 작아진다. 그러면 값이 모델 예측 쪽으로 조용히 기운다. 기간을 갈라 쓴다.
- **로그로 낸 추정치는 절대값으로 보고하지 않는다.** 후보를 거르는 순위 비교에 쓴다. 광고주 보고와 정산에 들어가는 숫자는 온라인 실험에서 나와야 한다.
- **로그에 한 번도 안 뜬 광고는 어떤 추정기로도 못 잰다.** 신규 광고나 신규 지면이 섞이면 그 부분은 추정 대상에서 빼고 따로 표시한다.

---

## 더 깊이 보기

- [모델 A/B 테스트](post.html?id=model-ab-testing) — 오프폴리시로 거른 뒤에 하는 온라인 실험의 설계
- [무작위 통제 실험(RCT)](post.html?id=rct-randomized-experiment) — 표본 크기와 검출력 계산의 토대
- [위치 편향과 ULTR](post.html?id=position-bias-ultr) — 로그에 실린 또 다른 편향과 그 보정
- [disjoint LinUCB](post.html?id=disjoint-linucb) — 탐색을 무작위 대신 불확실성에 몰아 주는 방법
- [탐색과 활용](post.html?id=exploration-exploitation) — 7절의 맞바꿈을 정면으로 다루는 글
- [A/B 테스트 vs 밴딧](post.html?id=ab-test-vs-mab) — 두 방식 중 무엇을 고를까
- [Calibration](post.html?id=calibration) — 이중 강건의 보상 모델이 맞는다는 말의 뜻
- [지연 피드백과 온라인 학습](post.html?id=online-learning-delayed-feedback) — 전환이 늦게 도착할 때
- [피처 스토어와 서빙](post.html?id=feature-store-serving) — 새 정책을 다시 돌리려면 그때의 피처가 있어야 한다
- [Bid Shading과 검열된 데이터](post.html?id=bid-shading-censored) — 열린 RTB에서 성향점수가 갈라지는 이유
- [ML 엔지니어 트랙](ml-track.html) — pCTR/pCVR 실무 커리큘럼 전체
