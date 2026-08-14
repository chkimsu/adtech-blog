월요일에 새 pCTR 모델을 올렸다. 누를 확률을 맞히는 모델이다. 오프라인 평가에서 순위 점수(AUC)가 0.7412 에서 0.7434 로 올랐다. 상대로 +0.30% 다. 팀에서는 배포해도 되겠다고 봤다.

A/B 를 7일 돌렸다. 매출 차이는 +0.1% 였다. 신뢰구간은 -0.4% 에서 +0.6% 였다. 0 이 구간 안에 있다. 아무 일도 없었다는 뜻이다.

이런 일이 반복되면 보통 둘 중 하나를 의심한다. A/B 설계가 틀렸나. 아니면 모델이 실제로는 안 좋아졌나. 그런데 세 번째가 있다. **점수가 내가 바꾼 것을 재고 있지 않았던 것이다.**

이 글의 숫자는 전부 설명을 위해 지어낸 값이다. 실제 지표 값과 문턱은 회사·지면마다 다르다.

> **한 줄 요약:** AUC 는 순위만 재고, 그것도 요청을 가로질러 뭉개서 잰다. 경매가 실제로 쓰는 것은 한 요청 안의 순위와 확률의 크기다.

**이 글에 나오는 말** — 낯선 이름만 먼저 풀어 둡니다. 본문에서 다시 설명하니 지금 외울 필요는 없습니다.

| 말 | 한 줄 뜻 |
|---|---|
| 순위 점수 (AUC) | 클릭한 노출이 안 누른 노출보다 위에 있는 짝의 비율 |
| 요청 안 순위 점수 (GAUC) | 같은 요청 안에서만 짝을 지어 다시 잰 순위 점수 |
| 확률 벌점 (LogLoss) | 정답 쪽에 얼마나 큰 확률을 걸었는지 재는 벌점 |
| 기저엔트로피 | 평균 CTR 만 답하는 모델의 확률 벌점 |
| 정규화 엔트로피 (NE) | 확률 벌점을 기저엔트로피로 나눈 값 |
| 예측 대비 실제 (COPC) | 실제 클릭을 예측 클릭 합으로 나눈 값 |

> **골라 읽는 법** — 절이 8개인 긴 글입니다. 처음부터 다 읽지 않아도 됩니다.
>
> - 순위 점수가 무엇을 세는지 손으로 확인하려면 → 2절
> - 한 통에 섞은 점수와 요청 안 점수가 갈리는 자리만 → 3절
> - 확률 벌점을 그냥 비교하면 왜 틀리나 → 4~5절
> - 예측 대비 실제의 방향이 헷갈리면 → 6절
> - 오프라인이 온라인으로 안 넘어가는 이유 → 7절
> - 게이트 표만 → 8절

---

## 1. 오프라인은 올랐고 온라인은 그대로였다

**순위 점수 하나만 보면 이겼다. 점수를 넷으로 늘리면 진 자리가 보인다.**

같은 배포를 지표 다섯 개로 다시 적으면 아래 표가 된다. 아래 값은 설명을 위해 지어낸 가상 수치다.

| 지표 | 기존 모델 | 새 모델 | 차이 | 무엇을 재나 |
|---|---|---|---|---|
| 순위 점수 AUC (전체) | 0.7412 | 0.7434 | +0.0022 (+0.30%) | 순위 — 전체 노출을 섞어서 |
| 요청 안 순위 GAUC | 0.6180 | 0.6172 | -0.0008 (-0.13%) | 순위 — 한 요청 안에서만 |
| 정규화 엔트로피 NE | 0.9031 | 0.9026 | -0.0005 | 확률의 크기 |
| 예측 대비 실제 COPC (전체) | 1.012 | 1.043 | +0.031 | 예측 총합이 실제와 맞나 |
| 매출 (A/B 7일) | 기준 | +0.1% | 구간 -0.4% 에서 +0.6% | 실제 결과 |

올라간 건 전체 AUC 하나뿐이다. GAUC 는 오히려 내려갔다. COPC 는 1.012 에서 1.043 으로 벌어졌다. NE 는 사실상 제자리다.

이 표를 읽는 순서가 이 글의 순서다. 먼저 순위 점수가 정확히 무엇을 세는지 손으로 세어 본다(2절). 그다음 그 셈이 요청을 가로질러 뭉개진다는 것을 본다(3절). 확률의 크기는 4~5절에서 잰다. 예측 총합이 맞는지는 6절에서 본다.

배포 전에 이 표를 볼 수 있었다면 판단이 달라졌을까. 달라진다. GAUC 가 안 오르고 COPC 만 벌어진 배포는 "랭킹은 그대로인데 예측값만 커진 모델"이다. 이 모델을 올리면 매출은 안 움직이고 입찰가만 흔들린다. 7절에서 그 경로를 따라간다.

---

## 2. 순위 쌍을 세는 점수 — 노출 8건으로 직접 센다

**클릭한 노출과 안 누른 노출로 짝을 전부 만든다. 클릭한 쪽 예측이 더 높은 짝의 비율을 낸다. 이 값이 순위 점수, 즉 AUC 다. 확률이 얼마나 큰지는 세지 않는다.**

노출 8건을 놓고 직접 세어 보자. 아래는 손으로 짝을 셀 수 있게 만든 가상 표본이다. 클릭을 일부러 많이 넣었으니 CTR 추정치로 읽으면 안 된다.

| 노출 | 예측 pCTR | 클릭 | 짝에서 지는 상대 |
|---|---|---|---|
| i-1 | 0.082 | 클릭 | 없음 |
| i-2 | 0.061 | — | |
| i-3 | 0.055 | 클릭 | i-2 |
| i-4 | 0.040 | — | |
| i-5 | 0.034 | — | |
| i-6 | 0.028 | 클릭 | i-2, i-4, i-5 |
| i-7 | 0.019 | — | |
| i-8 | 0.011 | — | |

클릭이 3건이고 안 누른 것이 5건이다. 짝은 3 × 5 = 15개다. 클릭한 쪽이 더 높은 짝만 세면 11개다. 표의 오른쪽 칸이 지는 짝 4개를 적어 놓은 것이다. 그래서 AUC 는 11 / 15 = 0.7333 이다.

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 520 220" role="img" aria-label="예측 pCTR 축 위에 클릭한 노출 3개와 안 누른 노출 5개를 올린 그림. 클릭한 쪽이 더 낮게 예측된 짝 4개만 점선으로 이어져 있다." style="width:100%; max-width:520px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="offline2-arr" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto"><path d="M0,0 L7.5,3 L0,6 Z" style="fill:var(--text-muted)"/></marker>
</defs>
<text x="14" y="34" style="font-size:12.5px; fill:var(--state-good)">클릭한 노출 3건</text>
<circle cx="470" cy="58" r="7" style="fill:var(--state-good)"/>
<circle cx="331" cy="58" r="7" style="fill:var(--state-good)"/>
<circle cx="192" cy="58" r="7" style="fill:var(--state-good)"/>
<text x="470" y="42" text-anchor="middle" style="font-size:12px; fill:var(--text-muted)">.082</text>
<text x="331" y="42" text-anchor="middle" style="font-size:12px; fill:var(--text-muted)">.055</text>
<text x="192" y="42" text-anchor="middle" style="font-size:12px; fill:var(--text-muted)">.028</text>
<line x1="24" y1="112" x2="506" y2="112" style="stroke:var(--border-color); stroke-width:1.4"/>
<text x="24" y="132" style="font-size:12px; fill:var(--text-muted)">낮은 예측</text>
<text x="506" y="132" text-anchor="end" style="font-size:12px; fill:var(--text-muted)">높은 예측</text>
<text x="14" y="182" style="font-size:12.5px; fill:var(--text-muted)">안 누른 노출 5건</text>
<circle cx="362" cy="158" r="7" style="fill:none; stroke:var(--text-muted); stroke-width:1.6"/>
<circle cx="253" cy="158" r="7" style="fill:none; stroke:var(--text-muted); stroke-width:1.6"/>
<circle cx="223" cy="158" r="7" style="fill:none; stroke:var(--text-muted); stroke-width:1.6"/>
<circle cx="145" cy="158" r="7" style="fill:none; stroke:var(--text-muted); stroke-width:1.6"/>
<circle cx="104" cy="158" r="7" style="fill:none; stroke:var(--text-muted); stroke-width:1.6"/>
<text x="362" y="180" text-anchor="middle" style="font-size:12px; fill:var(--text-muted)">.061</text>
<text x="256" y="180" text-anchor="middle" style="font-size:12px; fill:var(--text-muted)">.040</text>
<text x="220" y="196" text-anchor="middle" style="font-size:12px; fill:var(--text-muted)">.034</text>
<text x="145" y="180" text-anchor="middle" style="font-size:12px; fill:var(--text-muted)">.019</text>
<text x="104" y="180" text-anchor="middle" style="font-size:12px; fill:var(--text-muted)">.011</text>
<line x1="333" y1="66" x2="359" y2="150" style="stroke:var(--state-bad); stroke-width:1.6; stroke-dasharray:5 4" marker-end="url(#offline2-arr)"/>
<line x1="194" y1="66" x2="358" y2="150" style="stroke:var(--state-bad); stroke-width:1.6; stroke-dasharray:5 4" marker-end="url(#offline2-arr)"/>
<line x1="195" y1="66" x2="251" y2="150" style="stroke:var(--state-bad); stroke-width:1.6; stroke-dasharray:5 4" marker-end="url(#offline2-arr)"/>
<line x1="196" y1="66" x2="222" y2="150" style="stroke:var(--state-bad); stroke-width:1.6; stroke-dasharray:5 4" marker-end="url(#offline2-arr)"/>
<text x="260" y="212" text-anchor="middle" style="font-size:12.5px; fill:var(--state-bad)">점선 4개 = 지는 짝. 15개 중 11개를 이겨서 AUC 0.7333</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">점의 가로 위치만 셈에 들어간다. 축 전체를 오른쪽으로 밀거나 늘려도 점선 4개는 그대로다.</figcaption>
</figure>

여기서 축을 통째로 늘려 보자. 모든 예측에 3을 곱한다. 0.082 는 0.246 이 되고 0.011 은 0.033 이 된다. 그런데 점의 좌우 순서는 한 칸도 안 바뀐다. 지는 짝도 여전히 4개다. AUC 는 소수점까지 그대로 0.7333 이다.

이것이 AUC 의 성질이자 한계다. **순서만 지키는 변환이라면 AUC 는 아무 반응도 안 한다.** 예측을 3배 하든 절반으로 줄이든 값이 같다. 제곱을 해도 로그를 씌워도 같다. 광고 랭킹에서 이 성질은 절반만 반갑다. 어느 광고를 위에 올릴지는 순서만 있으면 된다. 얼마를 입찰할지는 크기가 있어야 정해진다.

```python
import math

# 노출 8건. 예측 pCTR 과 실제 클릭(1=클릭). 설명을 위해 지어낸 값이다.
# 손으로 짝을 셀 수 있게 클릭을 일부러 많이 넣었다. CTR 추정치가 아니다.
rows = [
    ("i-1", 0.082, 1), ("i-2", 0.061, 0), ("i-3", 0.055, 1), ("i-4", 0.040, 0),
    ("i-5", 0.034, 0), ("i-6", 0.028, 1), ("i-7", 0.019, 0), ("i-8", 0.011, 0),
]

def auc(data):
    # 클릭한 것 하나와 안 누른 것 하나로 짝을 전부 만든다.
    # 클릭한 쪽 예측이 더 높은 짝의 비율이 AUC 다. 값이 같으면 0.5 로 센다.
    pos = [p for _, p, y in data if y == 1]
    neg = [p for _, p, y in data if y == 0]
    win = sum(1.0 if a > b else 0.5 if a == b else 0.0 for a in pos for b in neg)
    return win, len(pos) * len(neg), win / (len(pos) * len(neg))

def logloss(data):
    # 확률의 크기를 재는 지표. 정답 쪽에 얼마나 큰 확률을 걸었는지를 본다.
    s = 0.0
    for _, p, y in data:
        s += -(y * math.log(p) + (1 - y) * math.log(1 - p))
    return s / len(data)

win, total, a = auc(rows)
print(f"이긴 짝 {win:.0f} / 전체 짝 {total} -> AUC {a:.4f}")

# 모든 예측에 3을 곱한다. 순위는 한 칸도 안 바뀐다.
tripled = [(i, p * 3, y) for i, p, y in rows]
_, _, a3 = auc(tripled)
print(f"3배 후 AUC {a3:.4f} (소수점까지 같다)")
print(f"평균 예측 {sum(p for _, p, _ in rows) / 8:.4f} -> {sum(p for _, p, _ in tripled) / 8:.4f}")
print(f"LogLoss {logloss(rows):.4f} -> {logloss(tripled):.4f}")

# 출력:
# 이긴 짝 11 / 전체 짝 15 -> AUC 0.7333
# 3배 후 AUC 0.7333 (소수점까지 같다)
# 평균 예측 0.0413 -> 0.1237
# LogLoss 1.1432 -> 0.7764
```

마지막 줄에 확률 벌점(LogLoss)이 나온다. 정답 쪽에 얼마나 큰 확률을 걸었는지 재는 값이다. 1.1432 에서 0.7764 로 움직였다. AUC 와 달리 반응은 했다. 다만 이 표본에서는 **좋아지는 쪽으로** 움직였다. 클릭 비율이 37.5% 인 표본이라 그렇다. 예측을 키우는 것이 실제로 맞는 방향이었다.

기저 CTR 이 4% 대인 표본에서는 같은 3배가 벌점을 크게 나쁘게 만든다. 그 숫자는 5절에서 20만 건으로 확인한다. 지금 기억할 것은 하나다. **AUC 는 크기 변화에 아예 반응하지 않는다. LogLoss 는 반응한다.**

:::deep 더 깊이 — AUC 가 왜 짝의 비율인가
AUC 는 ROC 곡선 아래 면적으로 정의된다. 이산 표본에서는 Wilcoxon-Mann-Whitney 통계량과 정확히 같다. 클릭한 표본 집합을 $P$, 안 누른 표본 집합을 $N$ 이라 하자. 통계량 $U$ 는 두 집합에서 하나씩 뽑은 모든 짝을 비교한 값이다.

$$U = \sum_{i \in P} \sum_{j \in N} \left[ \mathbf{1}(p_i > p_j) + \tfrac{1}{2}\mathbf{1}(p_i = p_j) \right]$$

$$\mathrm{AUC} = \frac{U}{|P| \cdot |N|}$$

위 코드의 `auc()` 가 이 식을 그대로 옮긴 것이다. 짝을 전부 도는 방식은 클릭 수와 미클릭 수의 곱만큼 돈다. 20만 건에 클릭이 8천 건이면 8,000 × 192,000 = 15.4억 번이다. 그래서 실무에서는 예측값을 정렬해 순위 합으로 계산한다. 결과는 같다.

$$\mathrm{AUC} = \frac{\sum_{i \in P} \mathrm{rank}_i - \frac{|P|(|P|+1)}{2}}{|P| \cdot |N|}$$

정렬 기반이라 표본 수에 로그를 곱한 시간이면 끝난다. 같은 값을 두 방법으로 구할 수 있다는 사실이 검증에 쓸모 있다. 작은 표본에서 두 구현이 다른 값을 내면 동점 처리가 틀린 것이다.
:::

---

## 3. 한 통에 섞으면 0.78, 요청 안에서는 0.60

**AUC 는 서로 다른 요청에서 온 노출끼리도 짝을 짓는다. 경매는 한 요청 안에서만 줄을 세운다. 그러니 요청을 가로지른 짝은 재도 쓸 데가 없다.**

요청 6건을 놓고 보자. 이 지면은 한 화면에 광고 자리가 5개다. 요청 하나가 노출 5건을 만든다. 아래 값은 전부 지어낸 가상 수치다. 셀 안의 숫자는 예측 pCTR 을 퍼센트로 적은 것이다. 굵게 적은 값이 실제로 클릭이 일어난 자리다.

| 요청 | 지면 | 자리 1 | 자리 2 | 자리 3 | 자리 4 | 자리 5 | 클릭 |
|---|---|---|---|---|---|---|---|
| r-8f21 | main_top | 3.52 | **3.04** | **2.60** | 2.20 | 1.84 | 2건 |
| r-9c04 | main_top | **2.88** | 2.44 | 2.08 | **1.76** | 1.48 | 2건 |
| r-3ab7 | feed_mid | 2.32 | 2.00 | **1.52** | 1.40 | 1.16 | 1건 |
| r-5d18 | feed_mid | 1.92 | 1.64 | **1.44** | 1.16 | 0.96 | 1건 |
| r-7e60 | search_top | 1.56 | 1.32 | 1.12 | 0.92 | 0.76 | 0건 |
| r-2c95 | search_top | 1.24 | 1.04 | 0.88 | 0.72 | 0.60 | 0건 |

노출은 30건이고 클릭은 6건이다. 30건을 한 통에 부어 놓고 AUC 를 재면 0.7778 이 나온다. 꽤 괜찮은 값이다.

그런데 그 0.7778 을 만든 짝을 뜯어보자. 대부분이 요청을 가로지른 짝이다. 짝은 6 × 24 = 144개다. 그중 같은 요청 안에서 만들어진 짝은 20개뿐이다. 나머지 124개는 `r-8f21` 의 클릭과 `r-2c95` 의 미클릭 같은 조합이다.

이 짝을 이기는 건 어렵지 않다. `main_top` 은 원래 CTR 이 높은 지면이다. 모델은 그 지면 요청 전체를 위로 올린다. 지면 피처 하나만 잘 써도 이 짝들은 대부분 맞는다. 그래서 전체 AUC 는 "이 모델이 지면을 구분할 줄 안다"를 주로 재고 있다.

경매에서 실제로 쓰는 건 그게 아니다. 한 요청 안에서 누구를 1등 자리에 올릴지만 쓴다. `r-8f21` 의 후보와 `r-2c95` 의 후보는 애초에 경쟁하지 않는다. 서로 다른 사용자의 서로 다른 요청이기 때문이다.

<div class="table-wrapper">
<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 700 300" role="img" aria-label="위쪽은 노출 30건을 한 축에 섞어 놓은 그림으로 클릭한 점이 오른쪽으로 치우쳐 있다. 아래쪽은 같은 데이터를 요청 6개로 쪼갠 그림으로 각 요청 안에서는 클릭한 점이 가운데에 섞여 있다." style="width:100%; min-width:640px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="offline3-arr" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto"><path d="M0,0 L7.5,3 L0,6 Z" style="fill:var(--text-muted)"/></marker>
</defs>
<text x="16" y="26" style="font-size:13px; font-weight:700; fill:var(--text-primary)">한 통에 섞어서 잰다 — AUC 0.7778</text>
<line x1="16" y1="76" x2="684" y2="76" style="stroke:var(--border-color); stroke-width:1.4"/>
<g style="fill:none; stroke:var(--text-muted); stroke-width:1.5">
<circle cx="33" cy="60" r="6"/><circle cx="54" cy="60" r="6"/><circle cx="75" cy="60" r="6"/><circle cx="96" cy="60" r="6"/><circle cx="117" cy="60" r="6"/><circle cx="138" cy="60" r="6"/><circle cx="159" cy="60" r="6"/><circle cx="180" cy="60" r="6"/><circle cx="201" cy="60" r="6"/><circle cx="222" cy="60" r="6"/><circle cx="243" cy="60" r="6"/><circle cx="264" cy="60" r="6"/><circle cx="285" cy="60" r="6"/><circle cx="327" cy="60" r="6"/><circle cx="369" cy="60" r="6"/><circle cx="390" cy="60" r="6"/><circle cx="432" cy="60" r="6"/><circle cx="453" cy="60" r="6"/><circle cx="474" cy="60" r="6"/><circle cx="495" cy="60" r="6"/><circle cx="516" cy="60" r="6"/><circle cx="537" cy="60" r="6"/><circle cx="558" cy="60" r="6"/><circle cx="642" cy="60" r="6"/>
</g>
<g style="fill:var(--state-good)">
<circle cx="306" cy="60" r="6"/><circle cx="348" cy="60" r="6"/><circle cx="411" cy="60" r="6"/><circle cx="579" cy="60" r="6"/><circle cx="600" cy="60" r="6"/><circle cx="621" cy="60" r="6"/>
</g>
<text x="16" y="98" style="font-size:12px; fill:var(--text-muted)">낮은 예측 pCTR</text>
<text x="684" y="98" text-anchor="end" style="font-size:12px; fill:var(--text-muted)">높은 예측 pCTR</text>
<text x="350" y="120" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">채운 점 6개가 오른쪽으로 치우쳐 있다 — 짝 144개 중 112개를 이긴다</text>
<line x1="350" y1="130" x2="350" y2="150" style="stroke:var(--text-muted); stroke-width:1.4" marker-end="url(#offline3-arr)"/>
<text x="16" y="176" style="font-size:13px; font-weight:700; fill:var(--accent-primary)">요청으로 쪼개서 잰다 — GAUC 0.6000</text>
<g style="font-size:12px; fill:var(--text-muted); font-family:var(--font-mono)">
<text x="16" y="212">r-8f21</text><text x="16" y="238">r-9c04</text><text x="16" y="264">r-3ab7</text>
<text x="366" y="212">r-5d18</text><text x="366" y="238">r-7e60</text><text x="366" y="264">r-2c95</text>
</g>
<g style="stroke:var(--rule2); stroke-width:1.2">
<line x1="86" y1="208" x2="326" y2="208"/><line x1="86" y1="234" x2="326" y2="234"/><line x1="86" y1="260" x2="326" y2="260"/>
<line x1="436" y1="208" x2="676" y2="208"/><line x1="436" y1="234" x2="676" y2="234"/><line x1="436" y1="260" x2="676" y2="260"/>
</g>
<g style="fill:none; stroke:var(--text-muted); stroke-width:1.5">
<circle cx="86" cy="208" r="6"/><circle cx="146" cy="208" r="6"/><circle cx="326" cy="208" r="6"/>
<circle cx="86" cy="234" r="6"/><circle cx="206" cy="234" r="6"/><circle cx="266" cy="234" r="6"/>
<circle cx="86" cy="260" r="6"/><circle cx="146" cy="260" r="6"/><circle cx="266" cy="260" r="6"/><circle cx="326" cy="260" r="6"/>
<circle cx="436" cy="208" r="6"/><circle cx="496" cy="208" r="6"/><circle cx="616" cy="208" r="6"/><circle cx="676" cy="208" r="6"/>
<circle cx="436" cy="234" r="6"/><circle cx="496" cy="234" r="6"/><circle cx="556" cy="234" r="6"/><circle cx="616" cy="234" r="6"/><circle cx="676" cy="234" r="6"/>
<circle cx="436" cy="260" r="6"/><circle cx="496" cy="260" r="6"/><circle cx="556" cy="260" r="6"/><circle cx="616" cy="260" r="6"/><circle cx="676" cy="260" r="6"/>
</g>
<g style="fill:var(--state-good)">
<circle cx="206" cy="208" r="6"/><circle cx="266" cy="208" r="6"/>
<circle cx="146" cy="234" r="6"/><circle cx="326" cy="234" r="6"/>
<circle cx="206" cy="260" r="6"/>
<circle cx="556" cy="208" r="6"/>
</g>
<text x="350" y="292" text-anchor="middle" style="font-size:12.5px; fill:var(--accent-primary)">같은 요청 안에서는 채운 점이 가운데에 섞여 있다 — 20개 짝 중 12개만 이긴다</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">두 그림의 점은 완전히 같은 30건이다. 짝을 어디까지 허용하느냐만 다르다. 아래 줄 두 개는 클릭이 없어 아예 잴 수 없다.</figcaption>
</figure>
</div>

짝을 같은 그룹 안으로 제한한 AUC 가 있다. 이것을 **요청 안 순위 점수(GAUC)** 라고 부른다. 광고 랭킹에서 그룹은 요청이다. 요청 하나마다 AUC 를 따로 잰다. 그것들을 합쳐 하나의 숫자로 만든다.

합치는 방법으로 이 글은 **짝 가중**을 쓴다. 이긴 짝과 전체 짝을 요청별로 더한 뒤 나누는 방법이다. 위 데이터에서 값은 0.6000 이다.

클릭이 0건인 요청은 계산에서 뺀다. `r-7e60` 과 `r-2c95` 가 그렇다. 짝을 하나도 만들 수 없기 때문이다. 자리가 전부 클릭된 요청도 마찬가지다. 이렇게 빠지는 요청이 생각보다 많다. 자리 5개에 자리당 CTR 이 2.5% 면 요청의 88.1% 가 빠진다.

```python
# 요청 6개 x 후보 광고 5개 = 노출 30건. 전부 지어낸 값이다.
# 앞 숫자는 예측 pCTR(%), 뒤 숫자는 y(1=클릭). 요청 안에서 예측 내림차순이다.
requests = {
    "r-8f21": [(3.52, 0), (3.04, 1), (2.60, 1), (2.20, 0), (1.84, 0)],
    "r-9c04": [(2.88, 1), (2.44, 0), (2.08, 0), (1.76, 1), (1.48, 0)],
    "r-3ab7": [(2.32, 0), (2.00, 0), (1.52, 1), (1.40, 0), (1.16, 0)],
    "r-5d18": [(1.92, 0), (1.64, 0), (1.44, 1), (1.16, 0), (0.96, 0)],
    "r-7e60": [(1.56, 0), (1.32, 0), (1.12, 0), (0.92, 0), (0.76, 0)],
    "r-2c95": [(1.24, 0), (1.04, 0), (0.88, 0), (0.72, 0), (0.60, 0)],
}

def wins(rows):
    # (클릭 1건, 미클릭 1건) 짝에서 클릭 쪽 예측이 높은 횟수와 전체 짝 수.
    pos = [p for p, y in rows if y == 1]
    neg = [p for p, y in rows if y == 0]
    w = sum(1.0 if a > b else 0.5 if a == b else 0.0 for a in pos for b in neg)
    return w, len(pos) * len(neg)

flat = [r for rows in requests.values() for r in rows]   # 요청 구분을 지운다
w, t = wins(flat)
print(f"전체 AUC = {w:.0f}/{t} = {w / t:.4f}")

gw = gt = 0.0
for rid, rows in requests.items():
    w, t = wins(rows)
    if t == 0:                       # 클릭 0건 또는 전부 클릭 -> 짝이 없다
        print(f"  {rid}: 클릭 0건 -> 요청 안 AUC 정의 불가, 버린다")
        continue
    gw += w
    gt += t
    print(f"  {rid}: {w:.0f}/{t} = {w / t:.3f}")
print(f"GAUC(짝 가중) = {gw:.0f}/{gt:.0f} = {gw / gt:.4f}")

# 출력:
# 전체 AUC = 112/144 = 0.7778
#   r-8f21: 4/6 = 0.667
#   r-9c04: 4/6 = 0.667
#   r-3ab7: 2/4 = 0.500
#   r-5d18: 2/4 = 0.500
#   r-7e60: 클릭 0건 -> 요청 안 AUC 정의 불가, 버린다
#   r-2c95: 클릭 0건 -> 요청 안 AUC 정의 불가, 버린다
# GAUC(짝 가중) = 12/20 = 0.6000
```

0.7778 과 0.6000 의 간격 0.1778 이 이 절의 결론이다. 그 간격은 "모델이 지면과 사용자를 구분할 줄 안다"가 만든 값이다. "한 요청 안에서 광고를 줄 세울 줄 안다"가 만든 값이 아니다.

간격이 클수록 나쁜 모델이라는 뜻은 아니다. 다만 **전체 AUC 의 상승분이 어느 쪽에서 왔는지 모르면 배포 판단을 할 수 없다.** 지면 피처를 하나 더 넣어 전체 AUC 를 0.02 올리는 일은 쉽다. 그게 경매 결과를 바꾸지 않는 일도 흔하다.

:::deep 더 깊이 — 합치는 두 방법과 버려지는 요청
요청별 점수를 하나로 합치는 방법은 둘이다. **짝 가중**은 요청별로 이긴 짝과 전체 짝을 각각 더한 뒤 나눈다. **단순 평균**은 요청별 점수를 그냥 평균한다. 위 데이터에서 짝 가중은 0.6000 이고 단순 평균은 0.5833 이다.

짝 가중을 권한다. 후보가 20개인 요청과 3개인 요청이 같은 무게를 갖는 게 이상하기 때문이다. 어느 쪽을 쓰든 팀 안에서 하나로 고정해야 한다. 두 정의를 섞어 비교하면 배포 판단이 흔들린다.

버려지는 양은 계산으로 나온다. 자리 5개에 자리당 CTR 이 2.5% 라고 하자. 한 자리도 안 눌릴 확률은 0.975 의 5제곱이다. 값은 88.1% 다. 요청 100건 중 88건이 계산에 못 들어간다는 뜻이다. 남은 12건이 트래픽 전체를 대표하는지는 따로 확인해야 한다.

그룹을 요청이 아니라 사용자로 잡는 정의도 널리 쓰인다. 추천 도메인에서 온 정의라 사용자별 리스트가 그룹이기 때문이다. 광고 랭킹에서는 한 사용자가 하루에 요청을 수십 번 낸다. 그때마다 후보가 다르다. 우리가 줄을 세우는 단위는 요청이므로 요청으로 잡는 편이 맞는다.
:::

---

## 4. 확률의 크기를 재는 점수

**확률 벌점(LogLoss)은 정답 쪽에 얼마나 큰 확률을 걸었는지를 잰다. 기저 CTR 이 다른 두 데이터셋을 이 값으로 비교하면 안 된다. 항상 CTR 낮은 쪽이 이긴다.**

LogLoss 는 노출 한 건마다 벌점을 매기고 평균한다. 클릭이 일어났으면 예측 확률에 로그를 씌워 부호를 바꾼 값이 벌점이다. 안 일어났으면 1에서 예측을 뺀 값에 같은 계산을 한다. 벌점이 낮을수록 좋다.

숫자 몇 개만 보면 성질이 바로 보인다. 아래는 노출 한 건의 벌점이다.

| 실제 | 예측 | 벌점 | 읽는 법 |
|---|---|---|---|
| 클릭 | 0.90 | 0.105 | 맞혔고 자신도 있었다 |
| 클릭 | 0.50 | 0.693 | 맞혔지만 반신반의였다 |
| 클릭 | 0.02 | 3.912 | 거의 아니라고 했는데 눌렸다 |
| 미클릭 | 0.02 | 0.020 | 거의 아니라고 했고 맞았다 |
| 미클릭 | 0.50 | 0.693 | 반신반의했는데 안 눌렸다 |
| 미클릭 | 0.90 | 2.303 | 누른다고 했는데 안 눌렸다 |

여기서 문제가 드러난다. 기저 CTR 이 1% 인 데이터셋은 노출 100건 중 99건이 미클릭이다. 그 99건에 0.01 을 답하면 건당 벌점이 0.010 밖에 안 된다. 평균 벌점이 자동으로 낮아진다.

기저 CTR 이 4% 인 데이터셋은 다르다. 미클릭 96건에 0.04 를 답하면 건당 0.041 이다. 클릭 4건의 벌점도 훨씬 자주 등장한다. 모델 품질이 똑같아도 평균 벌점이 크게 나온다.

그래서 이런 대화가 실제로 오간다. "검색 지면 모델은 LogLoss 가 0.054 인데 피드 모델은 0.153 이다. 피드 팀이 뭘 잘못하고 있나." 이 물음은 전제부터 틀렸다. **두 값은 애초에 같은 자로 잰 것이 아니다.**

같은 데이터셋 안에서 두 모델을 비교할 때는 LogLoss 를 그대로 써도 된다. 문제는 데이터셋이 갈릴 때다. 지면이 다르면 갈린다. 기간이 달라도 갈리고 샘플링 비율이 달라도 갈린다. 학습 때 미클릭을 10:1 로 다운샘플링했다고 하자. 그 데이터셋의 기저 CTR 은 원본과 완전히 다르다.

---

## 5. 기준 모델로 나누면 지면끼리 비교된다

**확률 벌점을 "기저 CTR 만 답하는 모델"의 벌점으로 나눈다. 이 값을 정규화 엔트로피(NE)라고 부른다. 1보다 작으면 그 기준보다 낫다. 1을 넘으면 못하다.**

기준이 되는 모델은 아주 단순하다. 누가 오든 그 데이터셋의 평균 CTR 을 그대로 답한다. 피처를 하나도 안 본다. 이 모델의 LogLoss 를 **기저엔트로피**라고 부른다.

기저 CTR 이 4.070% 면 기저엔트로피는 0.17016 이다. 0.986% 면 0.05536 이다. 이 값은 데이터셋만 정해지면 자동으로 결정된다. 모델과는 상관이 없다. 그래서 나누는 자로 쓸 수 있다.

지면 두 곳에서 20만 건씩 뽑아 계산해 보자. 아래 숫자는 전부 코드가 만든 가상 데이터에서 나온 값이다.

| 지면 | 기저 CTR | LogLoss | 기저엔트로피 | NE | 순위 |
|---|---|---|---|---|---|
| 뉴스피드 | 4.070% | 0.15296 | 0.17016 | 0.8989 | 1등 |
| 검색 | 0.986% | 0.05418 | 0.05536 | 0.9788 | 2등 |

LogLoss 만 보면 검색이 0.05418 로 뉴스피드 0.15296 보다 세 배 가까이 좋다. NE 로 보면 순서가 뒤집힌다. 뉴스피드 모델은 기준보다 10.1% 잘하고 있다. 검색 모델은 2.1% 잘하고 있을 뿐이다.

뒤집히는 이유는 4절에서 본 그대로다. 검색 지면은 기저 CTR 이 낮아서 아무것도 안 해도 LogLoss 가 낮다. 그 공짜로 얻은 부분을 나눗셈이 걷어 낸 것이다.

NE 는 데이터셋을 가로질러 비교할 수 있다는 게 가장 큰 이점이다. 지면별 모델 품질을 한 표에 놓고 볼 수 있다. 다운샘플링 비율이 다른 실험끼리도 비교가 된다.

```python
import math, random

# 지면 두 곳에서 20만 건씩 뽑았다고 하자. 아래 숫자는 전부 지어낸 값이다.
# base 는 그 지면의 기저 CTR, spread 는 모델이 사람을 얼마나 갈라 보는지다.
# spread 가 클수록 예측이 넓게 퍼진다 = 순위를 더 잘 가른다.
rnd = random.Random(20260814)

def sample(n, base, spread):
    out = []
    for _ in range(n):
        z = rnd.gauss(0, 1)
        p = base * math.exp(spread * z - spread * spread / 2)  # 평균이 base 로 남는다
        p = min(p, 0.9)
        out.append((p, 1 if rnd.random() < p else 0))
    return out

def logloss(rows):
    s = 0.0
    for p, y in rows:
        s += -(y * math.log(p) + (1 - y) * math.log(1 - p))
    return s / len(rows)

def entropy(p):
    # 기저 CTR 만 답하는 모델의 LogLoss. 데이터셋만 정해지면 값이 정해진다.
    return -(p * math.log(p) + (1 - p) * math.log(1 - p))

feed = sample(200_000, 0.040, 0.9)     # 뉴스피드 — 기저 4%, 잘 가르는 모델
search = sample(200_000, 0.010, 0.5)   # 검색 — 기저 1%, 덜 가르는 모델

for name, rows in (("뉴스피드", feed), ("검색", search)):
    ctr = sum(y for _, y in rows) / len(rows)
    ll, h = logloss(rows), entropy(ctr)
    print(f"{name}: 기저CTR {ctr * 100:.3f}%  LogLoss {ll:.5f}  기저엔트로피 {h:.5f}  NE {ll / h:.4f}")

# 뉴스피드 예측에 3을 곱해 본다. 2절처럼 순위는 그대로다.
tripled = [(min(p * 3, 0.999), y) for p, y in feed]
ctr = sum(y for _, y in feed) / len(feed)
h = entropy(ctr)
print(f"뉴스피드 3배: LogLoss {logloss(tripled):.5f}  NE {logloss(tripled) / h:.4f}")
print(f"뉴스피드 COPC: {ctr / (sum(p for p, _ in feed) / len(feed)):.3f}"
      f" -> {ctr / (sum(p for p, _ in tripled) / len(tripled)):.3f}")

# 출력:
# 뉴스피드: 기저CTR 4.070%  LogLoss 0.15296  기저엔트로피 0.17016  NE 0.8989
# 검색: 기저CTR 0.986%  LogLoss 0.05418  기저엔트로피 0.05536  NE 0.9788
# 뉴스피드 3배: LogLoss 0.20577  NE 1.2093
# 뉴스피드 COPC: 1.018 -> 0.342
```

마지막 두 줄이 2절에서 미뤄 둔 답이다. 기저 CTR 이 4% 대인 20만 건 표본이다. 예측을 3배 하면 NE 가 0.8989 에서 1.2093 이 된다. 순위는 한 칸도 안 바뀌었다. AUC 와 GAUC 는 그대로다.

NE 가 1.2093 이라는 건 뜻이 분명하다. **이 모델을 쓸 바에는 모든 요청에 4.070% 를 그대로 답하는 편이 낫다.** 피처를 아무것도 안 보는 상수 모델에게 진 것이다. 1을 넘는 NE 를 배포에 태우면 안 된다.

예측 대비 실제(COPC)도 1.018 에서 0.342 로 떨어졌다. 예측이 3배가 됐으니 실제를 예측으로 나눈 값은 거의 3분의 1이 된다. 0.999 에서 자른 예측이 조금 섞여 정확히 3분의 1은 아니다. 다음 절이 이 숫자를 다룬다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-metrics-lab.html?embed=1" height="770" loading="lazy" title="오프라인 지표 실험실 미니 데모 — AUC GAUC NE COPC 를 같은 데이터에서 동시에 본다"></iframe>
<a class="demo-embed-open" href="demo-metrics-lab.html" target="_blank" rel="noopener">↗ 전체 데모로 열기</a>
</div>

:::deep 더 깊이 — NE 식과 다운샘플링 보정
NE 의 분자는 LogLoss 그대로이고, 분모는 라벨 평균 $\bar{y}$ 하나로 결정되는 상수다.

$$\mathrm{NE} = \frac{-\frac{1}{N}\sum_{i=1}^{N}\left[y_i \log p_i + (1-y_i)\log(1-p_i)\right]}{-\left[\bar{y}\log\bar{y} + (1-\bar{y})\log(1-\bar{y})\right]}$$

분모가 상수라는 점이 중요하다. 같은 데이터셋 안에서 두 모델을 비교하면 NE 순서와 LogLoss 순서가 반드시 같다. NE 가 값을 더하는 자리는 데이터셋이 갈릴 때뿐이다. Facebook 의 2014년 광고 예측 논문이 이 지표를 표준으로 쓰면서 업계에 퍼졌다.

다운샘플링을 쓴다면 순서를 조심해야 한다. 미클릭을 $r$ 배로 줄여 학습했다면 그 데이터셋의 기저 CTR 은 원본보다 높다. 평가를 다운샘플링된 데이터 위에서 하면 NE 의 분모도 같이 올라간다. 그래서 값 자체는 계산된다. 다만 그 값을 원본 데이터의 NE 와 나란히 놓으면 안 된다.

권하는 순서는 이렇다. 먼저 예측 확률을 원본 스케일로 되돌린다. 다음 식이 표준 보정이다.

$$p_{\mathrm{orig}} = \frac{p}{p + (1-p)/r}$$

그다음 **원본 분포의 평가 데이터** 위에서 LogLoss 와 NE 를 잰다. 이 순서를 뒤집으면 확률이 위로 부푼 채로 지표가 계산된다. 그러면 NE 는 멀쩡한데 COPC 만 1보다 한참 작게 나온다. 원인을 찾기 어려운 상태가 된다.
:::

---

## 6. 예측 총합이 실제와 맞나

**실제 클릭 수를 예측 클릭 수의 합으로 나눈 값이 있다. 이 값을 예측 대비 실제(COPC)라고 부른다. 1보다 크면 실제가 더 많았다는 뜻이다. 곧 모델이 낮게 봤다는 뜻이다.**

방향을 반대로 외우는 일이 자주 있다. 식을 그대로 읽으면 헷갈릴 이유가 없다. 분자가 실제고 분모가 예측이다. 분자가 크면 분자 쪽이 많았던 것이다.

1절의 새 모델을 지면별로 쪼개면 아래 표가 된다. 하루 노출 2.28억 줄 가운데 평가에 쓴 표본 100만 건이다. 아래 값은 설명을 위해 지어낸 가상 수치다.

| 지면 | 노출 | 예측 클릭 합 | 실제 클릭 | 예측 CTR | 실제 CTR | COPC |
|---|---|---|---|---|---|---|
| main_top | 400,000 | 12,800 | 14,080 | 3.20% | 3.52% | 1.100 |
| feed_mid | 300,000 | 7,500 | 7,050 | 2.50% | 2.35% | 0.940 |
| search_top | 200,000 | 2,400 | 2,760 | 1.20% | 1.38% | 1.150 |
| video_pre | 60,000 | 1,020 | 918 | 1.70% | 1.53% | 0.900 |
| detail_side | 40,000 | 480 | 432 | 1.20% | 1.08% | 0.900 |
| **합계** | **1,000,000** | **24,200** | **25,240** | **2.42%** | **2.52%** | **1.043** |

합계 줄부터 읽자. 예측 클릭을 다 더하면 24,200 이고 실제는 25,240 이다. 25,240 / 24,200 = 1.043 이다. 실제 클릭이 예측보다 4.3% 많았다는 뜻이다. 뒤집어 보면 예측 총합이 실제보다 4.1% 적다.

지면별로 쪼개면 더 넓게 흩어진다. `search_top` 은 1.150 이다. 실제가 예측보다 15% 많았다. `video_pre` 와 `detail_side` 는 0.900 이다. 이 둘은 실제가 예측보다 10% 적었다. 전체 1.043 이라는 숫자 하나만 보면 이 흩어짐이 안 보인다.

여기서 조심할 것이 하나 있다. **지면 단위 COPC 가 어긋나도 그것만으로는 요청 안 순위가 안 바뀐다.** 한 요청 안의 다섯 자리는 전부 같은 지면이기 때문이다. `search_top` 의 모든 예측에 1.150 을 곱해도 그 요청 안 순서는 그대로다.

순위가 바뀌는 건 광고 단위로 쪼갤 때다. 같은 `main_top` 요청 안에서 광고마다 COPC 가 다르면 곱하는 순간 순서가 뒤집힌다.

| 광고 | 예측 pCTR | 광고 단위 COPC | 보정 후 | 보정 전 순위 | 보정 후 순위 |
|---|---|---|---|---|---|
| 9931 | 3.52% | 0.85 | 2.99% | 1 | 2 |
| 8420 | 3.04% | 1.30 | 3.95% | 2 | 1 |
| 7715 | 2.60% | 1.00 | 2.60% | 3 | 3 |

1등이 9931 에서 8420 으로 바뀐다. 이렇게 순위가 바뀌면 그때부터 매출이 움직인다. 보정 기법과 그 손실 계산은 [Calibration: AUC가 높아도 돈을 잃는 이유](post.html?id=calibration)에서 다뤘다. 여기서는 지표 쪽만 정리한다.

지표로서 COPC 를 볼 때 지킬 것은 셋이다. 첫째, 전체와 세그먼트를 같이 본다. 둘째, 세그먼트는 지면뿐 아니라 광고·시간대·기기로도 쪼갠다. 셋째, 문턱을 미리 정해 두고 넘으면 배포를 멈춘다.

COPC 의 역수를 P/O Ratio 라고 부르는 팀도 많다. 예측을 실제로 나눈 값이라 1.043 의 역수인 0.959 가 된다. 둘 다 쓰이므로 대시보드에 어느 쪽인지 반드시 적어 둬야 한다. 방향을 반대로 읽고 보정을 반대로 걸면 오차가 두 배가 된다.

---

## 7. 오프라인이 온라인으로 안 넘어가는 세 갈림 [무대: 공통]

**AUC +0.3% 가 매출로 안 나타나는 길은 셋이다. 평가 표본을 이미 옛 모델이 골랐다. 또는 지표가 요청 단위가 아니다. 또는 순위는 좋아졌는데 확률의 크기가 틀렸다.**

### 갈림 1 — 평가 표본을 옛 모델이 골랐다

노출 로그에는 실제로 보여 준 광고만 남는다. 요청 하나에 후보가 40개 올라와도 자리는 5개다. 그 5개를 고른 건 지금 서빙 중인 옛 모델이다.

하루 노출을 2.28억 건이라고 하자. 자리가 5개니 요청은 4,560만 건이다. 후보로 올라온 광고는 4,560만 × 40 = 18.24억 건이다. 그중 로그에 남는 건 2.28억 건이다. 전체의 12.5% 다. 나머지 87.5% 는 라벨이 없다.

새 모델의 강점이 "옛 모델이 안 고르던 후보를 잘 고르는 것"이라면 평가에서 그 강점이 안 보인다. 그 후보들이 표본에 없기 때문이다. 반대로 옛 모델이 이미 잘하던 구간에서만 점수가 매겨진다.

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 560 266" role="img" aria-label="요청 하나에 후보 40개가 올라오지만 옛 모델이 고른 5개만 노출되고 로그에 남는다. 오프라인 평가는 그 5개만 본다." style="width:100%; max-width:560px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="offline7-arr" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto"><path d="M0,0 L7.5,3 L0,6 Z" style="fill:var(--accent-primary)"/></marker>
</defs>
<rect x="10" y="30" width="190" height="180" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="105" y="54" text-anchor="middle" style="font-size:13px; font-weight:700; fill:var(--text-primary)">후보 40개</text>
<text x="105" y="74" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">요청 1건마다 · 자리는 5개</text>
<g style="fill:none; stroke:var(--text-muted); stroke-width:1.2">
<circle cx="28" cy="102" r="5"/><circle cx="50" cy="102" r="5"/><circle cx="94" cy="102" r="5"/><circle cx="116" cy="102" r="5"/><circle cx="138" cy="102" r="5"/><circle cx="160" cy="102" r="5"/><circle cx="182" cy="102" r="5"/>
<circle cx="28" cy="124" r="5"/><circle cx="50" cy="124" r="5"/><circle cx="72" cy="124" r="5"/><circle cx="94" cy="124" r="5"/><circle cx="138" cy="124" r="5"/><circle cx="160" cy="124" r="5"/><circle cx="182" cy="124" r="5"/>
<circle cx="28" cy="146" r="5"/><circle cx="50" cy="146" r="5"/><circle cx="72" cy="146" r="5"/><circle cx="116" cy="146" r="5"/><circle cx="138" cy="146" r="5"/><circle cx="160" cy="146" r="5"/>
<circle cx="28" cy="168" r="5"/><circle cx="50" cy="168" r="5"/><circle cx="72" cy="168" r="5"/><circle cx="94" cy="168" r="5"/><circle cx="116" cy="168" r="5"/><circle cx="138" cy="168" r="5"/><circle cx="182" cy="168" r="5"/>
<circle cx="28" cy="190" r="5"/><circle cx="50" cy="190" r="5"/><circle cx="72" cy="190" r="5"/><circle cx="94" cy="190" r="5"/><circle cx="116" cy="190" r="5"/><circle cx="138" cy="190" r="5"/><circle cx="160" cy="190" r="5"/><circle cx="182" cy="190" r="5"/>
</g>
<g style="fill:var(--accent-primary)">
<circle cx="72" cy="102" r="6.5"/><circle cx="116" cy="124" r="6.5"/><circle cx="94" cy="146" r="6.5"/><circle cx="182" cy="146" r="6.5"/><circle cx="160" cy="168" r="6.5"/>
</g>
<line x1="206" y1="120" x2="246" y2="120" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#offline7-arr)"/>
<text x="226" y="106" text-anchor="middle" style="font-size:12px; fill:var(--text-muted)">옛 모델이</text>
<text x="226" y="146" text-anchor="middle" style="font-size:12px; fill:var(--text-muted)">고른다</text>
<rect x="252" y="76" width="140" height="88" style="fill:var(--bg-secondary); stroke:var(--accent-primary); stroke-width:1.8"/>
<text x="322" y="104" text-anchor="middle" style="font-size:13px; font-weight:700; fill:var(--accent-primary)">노출 로그</text>
<text x="322" y="126" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">하루 2.28억 줄</text>
<text x="322" y="148" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">후보의 12.5%</text>
<line x1="398" y1="120" x2="438" y2="120" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#offline7-arr)"/>
<rect x="444" y="76" width="110" height="88" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="499" y="104" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">오프라인 평가</text>
<text x="499" y="126" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">여기만 본다</text>
<text x="499" y="148" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">AUC · NE · COPC</text>
<text x="280" y="232" text-anchor="middle" style="font-size:12.5px; fill:var(--accent-primary)">채운 점 5개만 로그에 남는다</text>
<text x="280" y="252" text-anchor="middle" style="font-size:12.5px; fill:var(--state-bad)">빈 점 35개는 라벨이 없다</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">평가 표본은 중립이 아니다. 지금 서빙 중인 모델의 취향이 그대로 찍혀 있다. 새 모델의 강점이 빈 점 쪽에 있으면 이 표본에서는 안 보인다.</figcaption>
</figure>

이 편향을 완전히 없앨 방법은 없다. 줄이는 방법은 있다. 트래픽의 일부를 무작위 노출로 돌린다. 그러면 편향 없는 평가 표본을 따로 모을 수 있다. 1% 만 떼어도 하루 228만 건이 쌓인다. 자세한 것은 [노출된 것만 배우는 문제](post.html?id=negative-sampling-bias)와 [Position Bias 와 ULTR](post.html?id=position-bias-ultr)에 있다.

### 갈림 2 — 지표가 요청 단위가 아니다

3절에서 본 그대로다. 전체 AUC 가 오르는 가장 쉬운 길은 요청을 가로지르는 짝을 더 잘 맞히는 것이다. 지면 피처, 시간대 피처, 사용자 활동량 피처가 그 일을 한다.

경매는 그 짝을 안 쓴다. `r-8f21` 의 후보와 `r-2c95` 의 후보는 만나지 않는다. 그래서 전체 AUC 가 올라도 1등이 안 바뀌면 매출은 그대로다.

1절 표에서 GAUC 가 -0.0008 이었던 것이 바로 이 경우다. 요청 안 순위는 오히려 아주 조금 나빠졌다. 매출 신뢰구간이 0을 품은 것과 앞뒤가 맞는다.

### 갈림 3 — 순위는 좋아졌는데 확률의 크기가 틀렸다

COPC 가 1.012 에서 1.043 으로 벌어졌다. 예측 총합이 실제보다 4.1% 적다는 뜻이다. 이 오차가 어디로 흘러가는지는 무대에 따라 다르다.

**[무대: 열린 RTB]** 입찰가는 예측 확률에 값을 곱해 만든다. pCTR 이 평균 4.1% 낮으면 입찰가도 4.1% 낮다. 아슬아슬하게 이기던 노출을 진다. 진 건은 낙찰가도 안 보이므로 왜 졌는지도 모른다. [Bid Shading 과 Censored 데이터](post.html?id=bid-shading-censored)에 그 구조가 있다.

**[무대: 닫힌 생태계]** 경매를 우리가 돌리므로 진 건도 다 보인다. 대신 다른 곳이 아프다. CPC 상품과 CPM 상품을 eCPM 으로 환산해 한 줄에 세우려면 확률의 크기가 필요하다. 4.1% 오차는 CPC 물량 전체를 CPM 물량 대비 그만큼 낮게 눌러 앉힌다. 예산 페이싱도 같은 값으로 어긋난다.

세 갈림의 공통점이 하나 있다. **셋 다 전체 AUC 로는 안 보인다.** 그래서 지표를 늘리는 것이 아니라 게이트를 다시 짜야 한다.

---

## 8. 배포 게이트에 무엇을 거나

**게이트는 지표 목록이 아니라 문턱과 행동의 짝이다. 넘으면 무엇을 할지 미리 안 정해 두면 게이트가 아니다.**

아래는 이 글의 논리대로 짠 게이트다. 문턱 값은 설명을 위해 지어낸 가상 수치이므로 그대로 쓰면 안 된다. 지면 구성과 트래픽 규모에 따라 다시 잡아야 한다.

| 지표 | 문턱 | 넘으면 | 왜 이 자리인가 |
|---|---|---|---|
| 요청 안 순위 GAUC (짝 가중) | 기존 대비 -0.001 아래 | 배포 중단 | 요청 안 순위가 실제로 나빠졌다 |
| 정규화 엔트로피 NE | 기존 대비 +0.5% 이상 | 배포 중단 | 확률의 크기가 나빠졌다 |
| 정규화 엔트로피 절댓값 | 1.0 이상 | 즉시 중단 | 상수 모델보다 못하다 |
| 예측 대비 실제 COPC (전체) | 0.97~1.03 밖 | 배포 중단 | 입찰가·과금이 통째로 밀린다 |
| 예측 대비 실제 COPC (지면별 최악) | 0.90~1.10 밖 | 경고 후 검토 | 한 지면만 무너지는 경우 |
| 예측 평균 | 학습 기간 실제 CTR 대비 ±3% 밖 | 즉시 중단 | 다운샘플링 보정 누락을 잡는다 |
| 전체 순위 AUC | 문턱 없음 | 기록만 | 요청을 가로질러 뭉갠다 |
| 서빙 p99 | 12ms 예산 초과 | 배포 중단 | 늦은 응답은 없던 응답이다 |

전체 AUC 를 목록에서 빼지 않은 이유가 있다. 값 자체는 여전히 쓸모가 있다. 갑자기 0.74 에서 0.62 로 떨어지면 피처 파이프라인이 깨진 것이다. 다만 **작은 개선을 판정하는 자리에는 못 쓴다.** 그래서 기록만 한다.

게이트를 통과했다고 끝이 아니다. 오프라인 게이트는 "온라인에 태울 자격"까지만 준다. 매출이 올랐는지는 A/B 만 답할 수 있다. 그 설계는 [모델 A/B 테스트](post.html?id=model-ab-testing)에 있다. 배포 후에 조용히 나빠지는 것을 잡는 방법은 [모델 모니터링](post.html?id=model-monitoring)에 있다.

:::deep 더 깊이 — 문턱을 정하는 방법과 게이트에 안 넣은 것
문턱을 잡는 방법도 정해 둬야 한다. 가장 흔한 실수는 소수점 넷째 자리 차이를 유의미하게 읽는 것이다. GAUC -0.001 이라는 문턱은 그 자체로는 근거가 없다. 같은 모델을 시드만 바꿔 다섯 번 학습한다. GAUC 가 얼마나 흔들리는지 먼저 잰다. 그 흔들림보다 큰 값을 문턱으로 잡는다.

게이트에 안 넣은 것도 적어 둘 만하다. Precision·Recall·F1 은 광고 랭킹 게이트에 잘 안 맞는다. 이 셋은 임계값을 정해 클릭할지 안 할지를 이분법으로 나눠야 계산된다. 우리는 그런 결정을 안 한다. 확률을 그대로 eCPM 에 곱해 줄을 세울 뿐이다.
:::

---

## 한눈 정리

| 지표 | 무엇을 재나 | 반응하는 것 | 반응하지 않는 것 | 이 글의 값 |
|---|---|---|---|---|
| 순위 점수 AUC | 순위 (전체 섞어서) | 순서 뒤바뀜 | 예측 크기·스케일 | 0.7333 · 0.7778 |
| 요청 안 순위 GAUC | 순위 (요청 안에서만) | 요청 안 순서 | 요청 간 차이·스케일 | 0.6000 |
| 확률 벌점 LogLoss | 확률의 크기 | 크기·순서 둘 다 | — (데이터셋 간 비교 불가) | 0.15296 · 0.05418 |
| 정규화 엔트로피 NE | LogLoss ÷ 기저엔트로피 | 크기·순서 둘 다 | 기저 CTR 차이 | 0.8989 · 0.9788 |
| 예측 대비 실제 COPC | 실제 ÷ 예측 총합 | 총합 어긋남 | 순위 | 1.043 |

읽는 순서도 정해 두면 편하다. **GAUC 로 순위를 보고, NE 로 크기를 보고, COPC 로 총합을 본다.** 셋 다 통과해야 온라인에 태운다. 전체 AUC 는 파이프라인이 깨졌는지 보는 용도로 옆에 둔다.

## 헷갈리기 쉬운 점

- **COPC 가 1보다 크면 과소예측이다.** 실제 ÷ 예측이므로 분자인 실제가 더 컸다는 뜻이다. 역수인 P/O Ratio 와 헷갈리면 보정을 반대로 건다.
- **AUC 가 0.5 라고 모델이 쓸모없는 건 아니다.** 요청 안 GAUC 가 0.5 면 쓸모없는 게 맞다. 전체 AUC 0.5 는 대개 라벨이나 피처 조인이 깨진 신호다.
- **NE 1.0 은 "보통"이 아니라 "실패"다.** 기저 CTR 만 답하는 상수 모델과 같다는 뜻이다. 1을 넘으면 그보다 못하다.
- **LogLoss 는 같은 데이터셋 안에서만 비교한다.** 지면·기간·샘플링 비율이 다르면 다른 자로 잰 값이다. 그때 쓰라고 NE 가 있다.
- **GAUC 는 요청 대부분을 버린다.** 클릭이 0건인 요청은 짝을 못 만든다. 자리 5개에 자리당 CTR 이 2.5% 면 요청의 88.1% 가 버려진다. 남은 표본이 편향돼 있지 않은지 따로 봐야 한다.
- **GAUC 정의를 팀 안에서 하나로 고정한다.** 짝 가중과 단순 평균은 같은 데이터에서 0.6000 과 0.5833 으로 갈린다. 정의가 섞이면 배포 판단이 흔들린다.
- **오프라인 지표가 다 통과해도 매출은 안 오를 수 있다.** 7절의 세 갈림 중 첫째, 즉 평가 표본의 편향은 지표를 아무리 늘려도 안 없어진다.

## 더 깊이 보기

- [Calibration: AUC가 높아도 돈을 잃는 이유](post.html?id=calibration) — 6절이 지표까지만 다룬 자리. 보정 기법과 순위가 뒤집힐 때의 손실 계산
- [pCTR: 누를 확률이 왜 돈이 되나](post.html?id=pctr-prediction) — 예측 확률이 eCPM 을 거쳐 매출이 되는 경로. 이 글의 전제가 되는 글
- [모델 모니터링](post.html?id=model-monitoring) — 배포 뒤 이야기. 같은 COPC 를 세그먼트로 쪼개 조용한 악화를 잡는다
- [모델 A/B 테스트](post.html?id=model-ab-testing) — 오프라인 게이트를 통과한 다음. 매출 차이를 실제로 재는 설계
- [노출된 것만 배우는 문제](post.html?id=negative-sampling-bias) — 7절 갈림 1의 확대판. 후보 40개 중 5개만 남는 로그로 학습할 때
- [Position Bias 와 ULTR](post.html?id=position-bias-ultr) — 같은 편향의 다른 얼굴. 위에 있어서 눌린 것과 좋아서 눌린 것을 가른다
- [eCPM 랭킹](post.html?id=ecpm-ranking) — 요청 안 순위가 실제로 어떻게 매겨지는지. GAUC 가 왜 요청 단위인지의 근거
- [오프라인 지표 실험실 데모](demo-metrics-lab.html) — 슬라이더로 예측을 늘리고 줄이며 다섯 지표가 어떻게 갈리는지 보는 화면
