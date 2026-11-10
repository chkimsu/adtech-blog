ML 엔지니어 면접에서 「라이브러리를 쓰지 말고 AUC 를 직접 구해 보세요」라는 문제를 받으면, 매일 보던 숫자인데도 손이 멈추는 경우가 많습니다. 함수 이름은 알지만 그 안에서 점수와 정답을 어떻게 세는지는 직접 짜 본 적이 없기 때문입니다.

이런 문제는 코딩테스트의 자료구조 문제와 모양이 다릅니다. 지표 하나나 학습 한 걸음을 표준 라이브러리만으로 짜게 하고, 코드가 돌아가는지와 함께 「점수가 같은 두 광고는 어떻게 세는가」, 「확률이 정확히 0 이면 어떻게 되는가」 같은 경계에서 지원자가 그 지표의 정의를 아는지를 봅니다.

**AUC, log loss, 샘플링, k-means 를 라이브러리 없이 짜려면 무엇을 알아야 할까요?**

이 글은 ML 코딩 면접에 나올 수 있는 다섯 가지(AUC, log loss, 샘플링, k-means, softmax)를 `math`, `random`, `bisect` 같은 표준 라이브러리만으로 짜고, 각 코드가 어느 경계에서 틀리기 쉬운지를 지어낸 광고 데이터로 확인합니다. 정의를 코드로 옮길 수 있으면 라이브러리가 낸 숫자가 이상할 때도 어디가 잘못되었는지 찾을 수 있어서, 면접 밖에서도 쓸모가 있습니다.

> **한 줄 요약:** AUC 는 클릭한 광고와 안 클릭한 광고의 쌍을 세는 정의를 먼저 짜고, 정렬과 순위로 같은 값(이 글의 예제에서 0.7667)이 나오는지 맞춰 봅니다. log loss 는 확률을 잘라 log(0) 을 막고, 안 클릭한 데이터를 10% 만 남겨 학습한 모델의 예측은 한 줄 식으로 되돌리며(0.1695 가 0.0200 으로), k-means 는 시작 중심에 따라 결과가 달라집니다.

> **골라 읽는 법** — 절이 여덟 개인 글입니다.
>
> - 이런 문제가 무엇을 보는가 → 1절
> - AUC → 2~3절
> - log loss → 4절
> - 샘플링(가중치 랜덤 선택, reservoir sampling, negative 다운샘플링 보정) → 5~6절
> - k-means 와 softmax → 7~8절

이 글의 점수, 클릭, 노출 수, 좌표는 모두 설명을 위해 지어낸 가상 데이터이고, 코드는 표준 라이브러리만 써서 복사해 바로 돌릴 수 있습니다.

---

## 1. ML 코딩 문제가 보는 것

**ML 코딩 문제는 라이브러리 함수 하나를 표준 라이브러리로 다시 짜게 해서, 지원자가 그 함수의 정의와 경계(동점, 0 확률, 큰 입력)를 아는지 봅니다.**

실무에서는 AUC 를 scikit-learn 의 `roc_auc_score` 로, k-means 를 `KMeans` 로 구하고 직접 짤 일이 거의 없습니다. 그래서 이 문제는 「빨리 짜는가」보다 「정의를 아는가」를 보는 문제이고, 코드가 짧은 대신 면접관이 「점수가 같으면요?」, 「확률이 정확히 1 이면요?」처럼 경계를 하나씩 물을 수 있습니다. 이런 문제가 나온다는 것은 면접 후기와 준비 자료에서 볼 수 있는 경향을 옮긴 것이고, 어느 회사가 어떤 문제를 낸다는 공식 자료는 아닙니다.

| 문제 | 직접 짜는 것 | 물을 만한 경계 | 쓰는 표준 라이브러리 |
|---|---|---|---|
| AUC | 쌍 세기, 순위 합 | 점수가 같은 쌍, 클릭이 0개 | `sorted` |
| log loss | 평균 음의 로그 우도 | 확률 0 과 1 | `math.log` |
| 가중치 랜덤 선택 | 누적합과 이진 탐색 | 가중치가 0 인 원소 | `itertools.accumulate`, `bisect` |
| reservoir sampling | 길이를 모르는 스트림에서 k 개 | 원소가 k 개보다 적은 스트림 | `random` |
| negative 다운샘플링 보정 | 예측 확률 되돌리기 | 남긴 비율 r 을 어디서 아는가 | 없음(산수) |
| k-means | 배정과 중심 갱신 반복 | 시작 중심, 빈 군집 | `math`, `random` |
| softmax | 지수와 정규화 | 큰 값에서 넘침(overflow) | `math.exp` |

표의 셋째 칸이 이 글이 절마다 확인할 자리입니다. 정의대로 짜면 보통의 입력은 대개 맞고 틀리는 자리는 거의 이 경계라서, 짠 다음 경계 입력 하나를 직접 넣어 보는 것까지가 답입니다. 문제를 받았을 때의 순서(이해, 제약 보기, 구현, 확인)는 [코딩테스트 풀이 순서](post.html?id=algorithm-solving-steps) 편과 같고, 이 글은 그 가운데 구현과 확인을 ML 지표에 적용합니다.

## 2. AUC: 쌍 세기 정의

**AUC 는 클릭한 광고 하나와 안 클릭한 광고 하나를 뽑았을 때 클릭한 쪽의 점수가 더 높을 확률이고, 점수가 같은 쌍은 절반(0.5)으로 셉니다.**

AUC(Area Under the ROC Curve)는 이름 그대로 ROC 곡선 아래 넓이지만, 같은 값을 쌍을 세는 방식으로도 구할 수 있습니다. 이 관계는 통계에서 Mann-Whitney U 통계량과 AUC 가 같다는 성질로 알려져 있어서, 곡선을 그리지 않고 positive(클릭 1)와 negative(클릭 0)의 모든 쌍을 비교해 positive 가 이긴 쌍의 비율을 구하면 AUC 가 나옵니다.

| 광고 | 모델 점수 | 클릭 |
|---|---|---|
| a1 | 0.9 | 1 |
| a2 | 0.8 | 0 |
| a3 | 0.7 | 1 |
| a4 | 0.7 | 0 |
| a5 | 0.6 | 1 |
| a6 | 0.4 | 0 |
| a7 | 0.3 | 0 |
| a8 | 0.2 | 0 |

이 가상 데이터는 positive 가 3개, negative 가 5개라 비교할 쌍이 3 × 5 = 15개입니다. 손으로 세면 a1(0.9)은 negative 다섯을 모두 이겨 5, a3(0.7)은 a2(0.8)에 지고 a4(0.7)와 비기고 나머지 셋을 이겨 3.5, a5(0.6)는 a6, a7, a8 셋만 이겨 3 이므로, 합 11.5 를 15 로 나눈 0.7667 이 AUC 입니다.

동점을 0.5 로 세는 까닭은 점수가 같은 두 광고는 모델이 순서를 정하지 않은 것이라 무작위로 순서를 정했을 때 이길 확률이 절반이기 때문입니다. 같은 데이터에서 동점을 1 로 세면 12 / 15 = 0.8, 0 으로 세면 11 / 15 = 0.7333 이 되고, 점수를 반올림해 저장하는 등으로 동점이 많아지면 세는 법에 따라 값이 더 크게 달라집니다. 면접에서는 짜기 전에 「동점은 절반으로 세겠습니다」를 먼저 말하면 정의를 안다는 것이 보입니다.

쌍 세기는 정의 그대로라 틀리기 어렵지만 positive 가 P 개, negative 가 N 개면 P × N 번을 비교해서, 노출 100만 건에 클릭 1만 건이면 1만 × 99만 = 99억 쌍입니다. 그래서 쌍 세기는 확인용으로 두고, 실제 답은 다음 절의 순위 방식으로 짭니다.

## 3. AUC: 순위로 O(n log n)

**점수로 오름차순 정렬해 순위를 매기고(동점은 순위의 평균), positive 순위의 합에서 P(P+1)/2 를 빼고 P × N 으로 나누면 쌍 세기와 같은 AUC 가 나옵니다.**

순위 방식이 쌍 세기와 같은 까닭은 positive 하나의 오름차순 순위가 「그보다 점수가 낮은 광고 수 + 1」이기 때문입니다. positive 의 순위를 모두 더하면 각 positive 가 이긴 negative 수에 positive 끼리의 순위 몫 1 + 2 + … + P = P(P+1)/2 가 섞여 들어가므로, 그것을 빼면 positive 가 이긴 negative 쌍의 수만 남고, 동점에 순위의 평균을 주는 것은 2절에서 동점 쌍을 0.5 로 센 것과 같은 일을 합니다.

이 글의 데이터로 따라가면 오름차순 순위는 a8 이 1, a7 이 2, a6 이 3, a5 가 4, 점수 0.7 인 a3 과 a4 가 5위와 6위를 나눠 5.5, a2 가 7, a1 이 8 이고, positive 의 순위 합은 8 + 5.5 + 4 = 17.5 입니다. 여기서 3 × 4 / 2 = 6 을 빼면 11.5 이고, 15 로 나누면 2절의 손 계산과 같은 0.7667 입니다.

아래 블록은 두 방식을 짜서 이 데이터와 동점이 많은 무작위 입력 300개에 같이 돌립니다. 확인용 풀이와 빠른 풀이를 같이 짜서 무작위 입력으로 비교하는 방법은 코딩테스트에서 쓰는 브루트 포스 비교와 같습니다.

```python
# 하는 일: 가상 광고 8개의 점수와 클릭으로 AUC 를 쌍 세기와 순위 방식으로 구하고, 무작위 입력 300개에서 두 값이 같은지 본다.
import random

# 1단계: 쌍 세기 정의를 짠다
# positive 와 negative 의 모든 쌍을 비교해 이기면 1, 비기면 0.5 를 더한다. O(P × N) 이다.
def auc_pairs(scores, labels):
    pos = [s for s, y in zip(scores, labels) if y == 1]
    neg = [s for s, y in zip(scores, labels) if y == 0]
    if not pos or not neg:
        return None              # 한쪽이 없으면 AUC 를 정의할 수 없다
    win = 0.0
    for p in pos:
        for n in neg:
            if p > n:
                win += 1
            elif p == n:
                win += 0.5
    return win / (len(pos) * len(neg))

# 2단계: 순위 방식을 짠다
# 점수로 정렬하고, 같은 점수 묶음에는 순위의 평균을 준다. 정렬이 있어 O(n log n) 이다.
def auc_rank(scores, labels):
    n_pos = sum(labels)
    n_neg = len(labels) - n_pos
    if n_pos == 0 or n_neg == 0:
        return None
    order = sorted(range(len(scores)), key=lambda i: scores[i])
    ranks = [0.0] * len(scores)
    i = 0
    while i < len(order):
        j = i
        while j + 1 < len(order) and scores[order[j + 1]] == scores[order[i]]:
            j += 1
        avg = (i + 1 + j + 1) / 2      # 1부터 센 순위 i+1 ~ j+1 의 평균
        for k in range(i, j + 1):
            ranks[order[k]] = avg
        i = j + 1
    rank_sum = sum(r for r, y in zip(ranks, labels) if y == 1)
    return (rank_sum - n_pos * (n_pos + 1) / 2) / (n_pos * n_neg)

# 3단계: 이 글의 데이터와 경계 입력을 돌린다
scores = [0.9, 0.8, 0.7, 0.7, 0.6, 0.4, 0.3, 0.2]   # 가상 데이터
labels = [1, 0, 1, 0, 1, 0, 0, 0]
print(f'쌍 세기 {auc_pairs(scores, labels):.4f}')
print(f'순위    {auc_rank(scores, labels):.4f}')
print(f'클릭이 하나도 없을 때 {auc_rank([0.5, 0.4], [0, 0])}')

# 4단계: 무작위 입력 300개로 두 방식을 비교한다
# 점수를 0.0 ~ 0.9 의 10가지로만 만들어 동점이 자주 나오게 한다.
random.seed(1)
diff = 0
for _ in range(300):
    n = random.randint(2, 15)
    sc = [random.randint(0, 9) / 10 for _ in range(n)]
    lb = [random.randint(0, 1) for _ in range(n)]
    a, b = auc_pairs(sc, lb), auc_rank(sc, lb)
    if (a is None) != (b is None) or (a is not None and abs(a - b) > 1e-12):
        diff += 1
print(f'무작위 300개 중 다른 값 {diff}개')

# 출력:
# 3단계 뜻: 두 방식 모두 손 계산과 같은 0.7667 이고, 클릭이 없으면 정의할 수 없어 None 이다.
# 쌍 세기 0.7667
# 순위    0.7667
# 클릭이 하나도 없을 때 None
# 4단계 뜻: 동점이 잦은 무작위 입력 300개에서도 두 방식의 값이 모두 같다.
# 무작위 300개 중 다른 값 0개
```

찍힌 값을 보면 두 방식이 이 글의 데이터에서 모두 0.7667 이고, 동점이 자주 나오게 만든 무작위 입력 300개에서도 다른 값이 0개라 순위 방식의 동점 처리가 쌍 세기의 0.5 와 같다는 것을 확인할 수 있습니다. 클릭이 하나도 없는 입력은 비교할 쌍이 없어서 두 함수 모두 `None` 을 돌려주는데, scikit-learn 도 정답에 한 종류만 있으면 AUC 를 정의할 수 없다며 오류를 냅니다.

면접에서는 「시간은 정렬 때문에 O(n log n), 공간은 순위 배열 때문에 O(n) 이고, 동점은 평균 순위로 처리해 쌍 세기의 절반 규칙과 같습니다」까지 말하면 됩니다. AUC 가 순위만 본다는 성질 때문에 모델 점수를 모두 2배로 키워도 AUC 는 그대로이고, 그래서 AUC 가 높아도 확률 값 자체는 틀릴 수 있다는 이야기는 [Calibration(확률 보정)](post.html?id=calibration) 편에, AUC 하나로 놓치는 것은 [GAUC 와 오프라인 지표](post.html?id=offline-metrics-gauc) 편에 있습니다.

## 4. log loss: 확률 클리핑

**log loss 는 정답에 준 확률의 음의 로그를 평균한 값이라 확률이 정확히 0 인 정답이 하나만 있어도 계산이 멈추고, 그래서 확률을 아주 작은 값 eps 와 1 - eps 사이로 잘라(clip) 씁니다.**

log loss(로그 손실, binary cross-entropy)는 광고 하나마다 클릭이면 -log(p), 안 클릭이면 -log(1 - p) 를 구해 평균한 값으로, 0 에 가까울수록 좋습니다. AUC 가 순서만 보는 것과 달리 log loss 는 확률 값 자체를 보므로, 클릭률을 예측해 입찰가에 곱하는 광고 모델에서 둘을 같이 봅니다.

이 글의 데이터로 a1 하나만 따라가면 클릭한 광고에 0.9 를 주었으므로 -log(0.9) = 0.1054 이고, a2 는 안 클릭한 광고에 0.8 을 주었으므로 -log(1 - 0.8) = -log(0.2) = 1.6094 로 훨씬 큽니다. 여덟 개를 모두 평균하면 0.6096 이고, 모든 광고에 평균 클릭률 3 / 8 = 0.375 를 똑같이 주는 모델의 0.6616 보다 낮아서 이 점수가 평균보다는 나은 예측이라는 것을 알 수 있습니다.

문제는 확률이 정확히 0 이나 1 인 경우입니다. 안 클릭한 광고 a9 에 모델이 1.0 을 주면 -log(1 - 1.0) = -log(0) 을 구해야 하는데, 수학적으로 무한대라 Python 의 `math.log(0)` 은 오류(`math domain error`)를 냅니다. 그래서 확률을 eps 와 1 - eps 사이로 잘라 계산하는데, 아래 블록은 같은 데이터에서 eps 를 바꾸면 값이 얼마나 달라지는지를 같이 찍습니다.

```python
# 하는 일: 가상 광고 8개의 log loss 를 구하고, 확률 1.0 을 준 오답 하나를 더했을 때 자르지 않으면 오류, 자르면 eps 에 따라 값이 달라지는 것을 본다.
import math

# 1단계: log loss 를 짠다
# eps 를 주면 확률을 eps 와 1 - eps 사이로 자른 뒤 계산한다.
def log_loss(probs, labels, eps=None):
    total = 0.0
    for p, y in zip(probs, labels):
        if eps is not None:
            p = min(max(p, eps), 1 - eps)
        total += -(y * math.log(p) + (1 - y) * math.log(1 - p))
    return total / len(probs)

# 2단계: 이 글의 데이터와 평균 클릭률 모델을 비교한다
probs = [0.9, 0.8, 0.7, 0.7, 0.6, 0.4, 0.3, 0.2]    # 가상 데이터, 3절의 점수를 확률로 쓴다
labels = [1, 0, 1, 0, 1, 0, 0, 0]
base = sum(labels) / len(labels)
print(f'모델            {log_loss(probs, labels):.4f}')
print(f'평균 클릭률 {base} {log_loss([base] * 8, labels):.4f}')

# 3단계: 안 클릭한 광고에 확률 1.0 을 준 a9 를 더한다
# 자르지 않으면 log(0) 이라 오류가 난다.
probs9, labels9 = probs + [1.0], labels + [0]
try:
    log_loss(probs9, labels9)
except ValueError as e:
    print(f'자르지 않으면 오류: {e}')

# 4단계: eps 를 바꿔 가며 자른다
for eps in [1e-3, 1e-7, 1e-15]:
    print(f'eps {eps:<6}  log loss {log_loss(probs9, labels9, eps):.4f}  a9 한 개의 손실 {-math.log(eps):.2f}')

# 출력:
# 2단계 뜻: 모델의 0.6096 이 평균 클릭률만 주는 모델의 0.6616 보다 낮다.
# 모델            0.6096
# 평균 클릭률 0.375 0.6616
# 3단계 뜻: 확률 1.0 을 준 오답이 있으면 log(0) 이라 계산이 멈춘다.
# 자르지 않으면 오류: math domain error
# 4단계 뜻: 자르면 계산은 되지만 eps 가 작을수록 a9 한 개의 손실이 커져 평균이 1.3094 에서 4.3796 까지 달라진다.
# eps 0.001   log loss 1.3094  a9 한 개의 손실 6.91
# eps 1e-07   log loss 2.3328  a9 한 개의 손실 16.12
# eps 1e-15   log loss 4.3796  a9 한 개의 손실 34.54
```

찍힌 값을 보면 자르기는 오류를 막아 주지만 값을 「맞게」 만들어 주지는 않습니다. eps 가 1e-15 면 a9 하나의 손실이 -log(1e-15) = 34.54 라 이것을 9 로 나눈 3.84 가 평균에 들어가 log loss 가 4.3796 이 되고, eps 를 1e-3 으로 잡으면 같은 데이터가 1.3094 가 되어서, eps 를 다르게 잡은 두 실험의 log loss 는 비교할 수 없습니다.

면접에서 「왜 자릅니까?」를 물으면 「log(0) 이 무한대라 계산이 멈추기 때문이고, 자른 값은 확신에 찬 오답 하나가 평균을 크게 끌어올린다는 것을 숨기지 않습니다」라고 답하면 됩니다. scikit-learn 의 `log_loss` 도 확률을 작은 값으로 잘라 계산하는데, 그 기본값은 버전마다 바뀐 적이 있으므로 쓰는 버전의 문서에서 확인합니다.

## 5. 가중치 랜덤 선택과 reservoir sampling

**가중치 랜덤 선택은 누적합을 만들고 0 과 전체 합 사이의 난수가 어느 구간에 떨어지는지 `bisect` 로 찾아 한 번에 O(log n) 이고, reservoir sampling 은 i 번째 원소를 k / i 확률로 넣어 길이를 모르는 스트림에서도 모든 원소를 같은 확률로 뽑습니다.**

가중치 랜덤 선택은 원소마다 무게(가중치)가 다를 때 무게에 비례하는 확률로 하나를 뽑는 일로, 광고 세 개를 예산 비율 5 : 3 : 2 로 나눠 보여 줄 때가 그 예입니다. 누적합이 [5, 8, 10] 이면 0 이상 10 미만의 난수가 0~5 구간이면 첫째, 5~8 이면 둘째, 8~10 이면 셋째를 고르고, 각 구간의 길이가 가중치와 같아서 고를 확률이 0.5, 0.3, 0.2 가 됩니다. 구간을 찾는 일은 정렬된 배열에서 위치를 찾는 일이라 [이분 탐색과 스택](post.html?id=algorithm-binary-search-stack) 편의 `bisect_right` 를 그대로 씁니다.

reservoir sampling 은 끝을 모르는 스트림(예: 하루 동안 계속 들어오는 클릭 로그)에서 메모리에 k 개만 두고 무작위 표본 k 개를 뽑는 방법입니다. 처음 k 개는 그대로 담고, i 번째(1부터 셈) 원소가 오면 1 부터 i 사이의 정수 j 를 뽑아 j 가 k 이하면 j 번째 자리를 그 원소로 바꾸는데, 이렇게 하면 지금까지 본 원소 i 개가 모두 k / i 확률로 남아 있습니다. 원소 10개에서 3개를 뽑으면 각 원소가 남을 확률이 3 / 10 = 0.3 이라 10,000번 반복하면 원소마다 대략 3,000번씩 뽑혀야 합니다.

```python
# 하는 일: 광고 세 개를 가중치 5:3:2 로 10,000번 뽑아 비율을 보고, reservoir sampling 으로 원소 10개 중 3개를 10,000번 뽑아 원소마다 뽑힌 횟수를 본다.
import bisect
import random
from itertools import accumulate

# 1단계: 누적합과 bisect 로 가중치 랜덤 선택을 짠다
# 0 이상 전체 합 미만의 난수를 만들고, 그 값보다 큰 첫 누적합의 위치를 고른다.
def weighted_pick(cum, rng):
    r = rng.random() * cum[-1]
    return bisect.bisect_right(cum, r)

ads = ['광고A', '광고B', '광고C']
weights = [5, 3, 2]                       # 가상 예산 비율
cum = list(accumulate(weights))
print(f'누적합 {cum}')
rng = random.Random(7)
count = [0, 0, 0]
for _ in range(10_000):
    count[weighted_pick(cum, rng)] += 1
for name, c in zip(ads, count):
    print(f'{name} {c:>5}번  {c / 10_000:.3f}')

# 2단계: reservoir sampling 을 짠다
# i 번째(0부터 셈) 원소에서 0 ~ i 의 정수 j 를 뽑아 j < k 면 그 자리를 바꾼다.
def reservoir(stream, k, rng):
    sample = []
    for i, x in enumerate(stream):
        if i < k:
            sample.append(x)
        else:
            j = rng.randint(0, i)
            if j < k:
                sample[j] = x
    return sample

rng = random.Random(3)
print(f'1~100 에서 3개 {reservoir(range(1, 101), 3, rng)}')
print(f'원소가 2개뿐일 때 {reservoir(range(2), 3, rng)}')

# 3단계: 원소 10개에서 3개를 10,000번 뽑아 원소마다 횟수를 센다
# 각 원소가 3 / 10 확률로 남으므로 대략 3,000번씩이어야 한다.
hits = [0] * 10
for _ in range(10_000):
    for x in reservoir(range(10), 3, rng):
        hits[x] += 1
print(f'원소별 횟수 {hits}')

# 출력:
# 1단계 뜻: 10,000번 뽑은 비율이 가중치 비율 0.5, 0.3, 0.2 에 가깝다.
# 누적합 [5, 8, 10]
# 광고A  5030번  0.503
# 광고B  2956번  0.296
# 광고C  2014번  0.201
# 2단계 뜻: 길이를 모르는 스트림에서 3개를 뽑고, 원소가 3개보다 적으면 있는 것을 모두 돌려준다.
# 1~100 에서 3개 [33, 38, 91]
# 원소가 2개뿐일 때 [0, 1]
# 3단계 뜻: 원소 10개가 모두 3,000번 안팎으로 뽑혀 앞뒤 원소의 확률이 같다.
# 원소별 횟수 [2998, 3065, 2945, 3007, 3030, 3001, 3015, 2989, 2987, 2963]
```

찍힌 값을 보면 가중치 선택의 비율이 0.503, 0.296, 0.201 로 0.5, 0.3, 0.2 에 가깝고, reservoir sampling 은 원소 10개 모두 3,000번 안팎(가장 적은 2,945번, 가장 많은 3,065번)이라 앞에 온 원소와 뒤에 온 원소가 같은 확률로 남는다는 것을 확인할 수 있습니다. 원소가 k 개보다 적은 스트림은 있는 것을 모두 돌려주므로, 면접에서 「스트림이 k 개보다 짧으면요?」를 물으면 이 줄을 보여 주면 됩니다.

복잡도는 가중치 선택이 누적합을 한 번 만드는 데 O(n), 한 번 뽑는 데 O(log n) 이고, reservoir sampling 은 원소 하나에 O(1), 메모리는 k 개뿐입니다. Python 의 `random.choices` 도 `weights` 나 `cum_weights` 를 받아 같은 일을 하므로 실무에서는 그것을 쓰고, 이 방법을 Algorithm R 이라 부른다는 것과 증명은 더 깊이 보기의 링크에 있습니다.

## 6. negative 다운샘플링 보정

**안 클릭한 데이터(negative)를 비율 r 만 남겨 학습하면 모델의 예측 q 가 원래 확률보다 커지고, 원래 확률 p 는 `p = q / (q + (1 - q) / r)` 로 되돌립니다. 이 글의 예에서 r 이 0.1 이면 q 0.1695 가 p 0.0200 이 됩니다.**

다운샘플링(down-sampling)은 클릭률이 2% 처럼 낮은 데이터에서 negative 를 일부만 남겨 학습 데이터를 줄이는 일이고, 클릭(positive)은 모두 남기고 negative 만 무작위로 r 비율만 남깁니다. 학습이 빨라지는 대신 모델이 보는 데이터의 클릭률이 원래보다 높아져서, 그대로 쓰면 예측 확률이 원래보다 큽니다. 클릭률을 입찰가에 곱하는 광고 모델에서는 이 차이가 그대로 입찰가가 되므로 되돌리기까지가 다운샘플링입니다.

식이 나오는 길은 odds(일어날 확률 ÷ 안 일어날 확률)로 보면 짧습니다. positive 는 그대로 두고 negative 만 r 배로 줄였으므로 학습 데이터의 odds q / (1 - q) 는 원래 odds p / (1 - p) 를 r 로 나눈 값이 되고, 이 식 q / (1 - q) = p / (r(1 - p)) 를 p 에 대해 풀면 p = rq / (rq + 1 - q) 이며, 분자와 분모를 r 로 나누면 위의 식이 됩니다. 이 블로그의 [Negative Sampling](post.html?id=negative-sampling-bias) 편과 [ML 모델링 면접](post.html?id=interview-ml-modeling) 편이 같은 식을 쓰고, 유도와 함정은 Negative Sampling 편에 더 자세히 있습니다.

이 글의 숫자로 따라가면 노출 10,000건에 클릭 200건(2%)인 가상 데이터에서 negative 9,800건 가운데 10% 인 980건만 남기면 학습 데이터는 1,180건이고 클릭률은 200 / 1,180 = 0.1695 입니다. 이것을 식에 넣으면 1 - 0.1695 = 0.8305 를 r 0.1 로 나눈 8.305 에 0.1695 를 더한 8.4746 이 분모라 0.1695 / 8.4746 = 0.0200 으로, 원래 클릭률 2% 가 정확히 돌아옵니다.

```python
# 하는 일: 노출 10,000건, 클릭 200건인 가상 데이터에서 negative 를 10% 만 남겨 학습 데이터의 클릭률을 보고, 보정식으로 원래 클릭률을 되찾는다.
import random

# 1단계: 보정식을 짠다
# q 는 다운샘플링한 데이터로 학습한 모델의 예측, r 은 negative 를 남긴 비율이다.
def correct(q, r):
    return q / (q + (1 - q) / r)

# 2단계: 정확히 10% 를 남긴 경우를 계산한다
q = 200 / (200 + 980)
print(f'남긴 데이터의 클릭률 {q:.4f}  보정 {correct(q, 0.1):.4f}')

# 3단계: 무작위로 10% 를 남긴다
# negative 마다 0.1 확률로 남기므로 남는 수가 정확히 980 이 되지는 않는다.
random.seed(5)
labels = [1] * 200 + [0] * 9_800        # 가상 데이터
kept = [y for y in labels if y == 1 or random.random() < 0.1]
q = sum(kept) / len(kept)
print(f'남은 {len(kept)}건, 클릭 {sum(kept)}건  클릭률 {q:.4f}  보정 {correct(q, 0.1):.4f}')

# 4단계: 모델이 낸 예측 몇 개를 되돌린다
for q in [0.05, 0.15, 0.5]:
    print(f'예측 {q:.2f} → 보정 {correct(q, 0.1):.4f}')

# 출력:
# 2단계 뜻: negative 를 정확히 10% 남기면 클릭률 0.1695 가 보정 뒤 원래의 0.0200 이 된다.
# 남긴 데이터의 클릭률 0.1695  보정 0.0200
# 3단계 뜻: 무작위로 남기면 negative 가 945건이라 보정값이 0.0207 로 2% 와 조금 다르다.
# 남은 1145건, 클릭 200건  클릭률 0.1747  보정 0.0207
# 4단계 뜻: 보정 뒤 예측이 크게 작아지고, 작은 예측일수록 줄어드는 배수가 크다.
# 예측 0.05 → 보정 0.0052
# 예측 0.15 → 보정 0.0173
# 예측 0.50 → 보정 0.0909
```

찍힌 값을 보면 정확히 980건을 남긴 경우는 0.0200 으로 돌아오고, 무작위로 남긴 경우는 남은 negative 가 945건이라 클릭률이 0.1747, 보정값이 0.0207 로 2% 와 조금 다릅니다. 이 차이는 식이 틀려서가 아니라 무작위로 남긴 비율이 정확히 0.1 이 아니어서 생기고, 식에 넣는 r 은 「남기려고 정한 비율」이라 데이터가 클수록 실제로 남은 비율이 그 값에 가까워집니다.

모델 예측 0.15 는 0.0173 으로, 0.5 는 0.0909 로 내려가서, 보정을 빼먹으면 0.15 를 낸 광고는 원래 확률 0.0173 의 8.7배로 입찰가에 들어갑니다. 면접관이 「r 은 어디서 압니까?」를 물으면 학습 데이터를 만든 사람이 직접 정한 값이라 기록해 두고 서빙에서 같은 값을 쓴다고 답하고, 보정 뒤에도 남는 확률 오차는 [Calibration(확률 보정)](post.html?id=calibration) 편의 방법으로 다룹니다.

## 7. k-means: 배정과 중심 갱신

**k-means 는 점마다 가장 가까운 중심에 배정하고, 중심을 배정된 점들의 평균으로 옮기는 두 단계를 배정이 바뀌지 않을 때까지 되풀이하며, 시작 중심에 따라 다른 답에서 멈출 수 있습니다.**

k-means 는 점들을 k 개의 묶음(군집, cluster)으로 나누는 방법으로, 각 점과 그 점이 속한 군집 중심 사이 거리 제곱의 합(inertia)을 줄이는 쪽으로 움직입니다. 배정 단계는 중심을 고정하고 점마다 가장 가까운 중심을 고르므로 inertia 가 늘지 않고, 갱신 단계는 배정을 고정하고 중심을 평균으로 옮기는데 평균이 거리 제곱의 합을 가장 작게 하는 점이라 역시 늘지 않습니다. 그래서 반복이 언젠가 멈추지만, 멈춘 자리가 가장 좋은 답(전역 최적)이라는 보장은 없습니다.

가상 사용자 10명을 (주간 방문 수, 주간 클릭 수) 좌표로 두면 왼쪽 아래 셋, 왼쪽 위 셋, 오른쪽 가로로 넷이 모여 있습니다. 첫 시작에서는 왼쪽 아래 둘과 오른쪽 하나를 중심으로 잡고, 둘째 시작에서는 왼쪽 위 하나와 오른쪽 둘을 중심으로 잡아 k = 3 으로 돌립니다.

```python
# 하는 일: 가상 사용자 10명의 2차원 점을 k=3 으로 k-means 하고, 시작 중심 두 가지에서 반복마다 배정과 중심을 찍어 멈춘 결과와 inertia 를 비교한다.
# 1단계: 거리와 k-means 반복을 짠다
# 배정이 바뀌지 않으면 멈춘다. 빈 군집은 이 데이터에서 생기지 않지만, 생기면 중심을 그대로 둔다.
def dist2(p, c):
    return (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2

def kmeans(points, centers):
    assign = None
    step = 0
    while True:
        new = [min(range(len(centers)), key=lambda c: dist2(p, centers[c])) for p in points]
        if new == assign:
            break
        assign = new
        step += 1
        moved = []
        for c in range(len(centers)):
            members = [p for p, a in zip(points, assign) if a == c]
            if not members:
                moved.append(centers[c])
                continue
            moved.append((sum(x for x, _ in members) / len(members),
                          sum(y for _, y in members) / len(members)))
        centers = moved
        shown = ', '.join(f'({x:.2f}, {y:.2f})' for x, y in centers)
        print(f'  반복 {step}  배정 {assign}  중심 {shown}')
    inertia = sum(dist2(p, centers[a]) for p, a in zip(points, assign))
    print(f'  멈춤  inertia {inertia:.2f}')

points = [(1, 1), (2, 1), (1, 2),          # 왼쪽 아래 셋 (가상 데이터)
          (1, 5), (2, 5), (1, 6),          # 왼쪽 위 셋
          (8, 3), (9, 3), (12, 3), (13, 3)]  # 오른쪽 넷

# 2단계: 왼쪽 아래 둘과 오른쪽 하나에서 시작한다
print('시작 A: 점 0, 2, 8')
kmeans(points, [points[0], points[2], points[8]])

# 3단계: 왼쪽 위 하나와 오른쪽 둘에서 시작한다
print('시작 B: 점 3, 6, 7')
kmeans(points, [points[3], points[6], points[7]])

# 출력:
# 2단계 뜻: 시작 A 는 반복 2번 만에 눈으로 본 세 묶음과 같은 배정에서 inertia 19.67 로 멈춘다.
# 시작 A: 점 0, 2, 8
#   반복 1  배정 [0, 0, 1, 1, 1, 1, 2, 2, 2, 2]  중심 (1.50, 1.00), (1.25, 4.50), (10.50, 3.00)
#   반복 2  배정 [0, 0, 0, 1, 1, 1, 2, 2, 2, 2]  중심 (1.33, 1.33), (1.33, 5.33), (10.50, 3.00)
#   멈춤  inertia 19.67
# 3단계 뜻: 시작 B 는 왼쪽 여섯이 중심 하나를 나눠 쓰는 배정에서 inertia 27.67 로 멈춘다.
# 시작 B: 점 3, 6, 7
#   반복 1  배정 [0, 0, 0, 0, 0, 0, 1, 2, 2, 2]  중심 (1.33, 3.33), (8.00, 3.00), (11.33, 3.00)
#   반복 2  배정 [0, 0, 0, 0, 0, 0, 1, 1, 2, 2]  중심 (1.33, 3.33), (8.50, 3.00), (12.50, 3.00)
#   멈춤  inertia 27.67
```

찍힌 값을 보면 시작 A 는 첫 반복에서 왼쪽 위 셋 가운데 (1, 5), (2, 5), (1, 6) 과 함께 (1, 2) 까지 둘째 중심에 들어갔다가, 둘째 반복에서 (1, 2) 가 첫째 중심으로 돌아가 눈으로 본 세 묶음과 같은 배정에서 inertia 19.67 로 멈춥니다. 시작 B 는 오른쪽 넷에 중심 둘이 몰려 있어서 왼쪽 여섯이 중심 하나를 나눠 쓰는 배정에서 inertia 27.67 로 멈추는데, 이때 왼쪽 중심 (1.33, 3.33) 에서 보면 왼쪽 점들이 모두 오른쪽 중심보다 가까워 더 움직일 이유가 없기 때문입니다.

그래서 실무에서는 시작 중심을 여러 번 바꿔 돌리고 inertia 가 가장 낮은 결과를 고르거나, 서로 멀리 떨어진 점을 시작 중심으로 고르는 k-means++ 를 씁니다. scikit-learn 의 `KMeans` 도 `init` 과 `n_init` 으로 이 두 가지를 정하므로, 면접에서는 「결과가 시작 중심에 따라 달라서 여러 번 돌려 inertia 가 낮은 것을 고릅니다」까지 말하면 됩니다. 사용자를 묶음으로 나누는 일 자체는 [오디언스 세그멘테이션](post.html?id=audience-segmentation) 편에 있습니다.

## 8. softmax 넘침 방지와 라이브러리

**softmax 는 점수마다 지수를 구해 합으로 나누는데, 점수가 크면 지수가 넘쳐서(overflow) 계산이 멈추므로 모든 점수에서 최댓값을 빼고 계산하며, 빼도 결과는 수학적으로 같습니다.**

softmax 는 점수 z1, z2, … 를 합이 1 인 확률로 바꾸는 함수로, 각 값은 exp(zi) 를 모든 exp(zj) 의 합으로 나눈 것입니다. Python 의 `math.exp` 는 대략 709 를 넘는 입력에서 오류(`math range error`)를 내서, 점수가 [1000, 1001, 1002] 처럼 크면 첫 지수부터 계산할 수 없습니다. 모든 점수에서 같은 값 m 을 빼면 분자와 분모가 모두 exp(-m) 배가 되어 나눗셈에서 지워지므로 결과가 같고, m 을 최댓값으로 잡으면 가장 큰 지수가 exp(0) = 1 이라 넘침이 생기지 않습니다.

이 글의 숫자로 따라가면 [1000, 1001, 1002] 에서 1002 를 빼면 [-2, -1, 0] 이고, 지수는 0.1353, 0.3679, 1 이며 합 1.5032 로 나누면 0.0900, 0.2447, 0.6652 입니다. 이 값은 [1, 2, 3] 의 softmax 와 같은데, 두 입력 모두 점수 사이의 차이가 1 씩이기 때문입니다.

```python
# 하는 일: 점수 [1000, 1001, 1002] 의 softmax 를 그대로 구하면 넘침 오류가 나고, 최댓값을 빼면 [1, 2, 3] 의 softmax 와 같은 값이 나오는 것을 본다.
import math

# 1단계: 그대로 지수를 구한다
def softmax_naive(z):
    e = [math.exp(v) for v in z]
    s = sum(e)
    return [x / s for x in e]

try:
    softmax_naive([1000, 1001, 1002])
except OverflowError as err:
    print(f'그대로 구하면 오류: {err}')

# 2단계: 최댓값을 빼고 지수를 구한다
def softmax(z):
    m = max(z)
    e = [math.exp(v - m) for v in z]
    s = sum(e)
    return [x / s for x in e]

print('최댓값을 빼면 ', [round(p, 4) for p in softmax([1000, 1001, 1002])])
print('[1, 2, 3] 은   ', [round(p, 4) for p in softmax_naive([1, 2, 3])])

# 출력:
# 1단계 뜻: 점수 1000 의 지수가 너무 커서 계산이 멈춘다.
# 그대로 구하면 오류: math range error
# 2단계 뜻: 최댓값을 빼면 계산이 되고, 차이가 같은 [1, 2, 3] 과 값이 같다.
# 최댓값을 빼면  [0.09, 0.2447, 0.6652]
# [1, 2, 3] 은    [0.09, 0.2447, 0.6652]
```

찍힌 값을 보면 그대로 구한 쪽은 오류로 멈추고, 최댓값을 뺀 쪽은 [1, 2, 3] 과 같은 0.09, 0.2447, 0.6652 를 냅니다. 면접에서 softmax 를 짜라고 하면 첫 줄에 `m = max(z)` 를 쓰는 것이 이 문제가 보려는 자리이고, 같은 이유로 log softmax 를 구할 때도 최댓값을 빼는 log-sum-exp 방식을 씁니다.

이 글의 코드는 모두 실무에서는 라이브러리 함수 한 줄입니다. AUC 는 `sklearn.metrics.roc_auc_score`, log loss 는 `sklearn.metrics.log_loss`, 가중치 선택은 `random.choices`, k-means 는 `sklearn.cluster.KMeans` 를 쓰고, 직접 짠 코드를 서비스에 넣을 일은 드뭅니다. 면접이 직접 짜게 하는 것은 라이브러리를 대신하라는 뜻이 아니라, 라이브러리가 동점, 0 확률, 큰 점수, 시작 중심을 어떻게 다루는지 아는가를 보려는 것이라서, 짠 뒤에 「실무에서는 이 함수를 쓰고, 지금 짠 것과 같은 규칙으로 동작합니다」를 한 줄 붙이면 답이 끝납니다.

## 한눈 정리

| 문제 | 핵심 규칙 | 경계 | 이 글의 값 |
|---|---|---|---|
| AUC | 쌍 세기, 또는 (positive 순위 합 - P(P+1)/2) ÷ (P × N) | 동점은 0.5, 클릭이 0개면 정의 안 됨 | 두 방식 모두 0.7667, 무작위 300개 중 다른 값 0개 |
| log loss | 정답에 준 확률의 -log 평균 | 확률 0 과 1 은 eps 로 자름 | 0.6096, 오답 a9 를 더하면 eps 1e-15 에서 4.3796 |
| 가중치 랜덤 선택 | 누적합 + `bisect_right` | 가중치 0 인 원소는 구간 길이가 0 | 5:3:2 → 0.503, 0.296, 0.201 |
| reservoir sampling | i 번째 원소를 k / i 확률로 넣음 | 원소가 k 개보다 적으면 모두 돌려줌 | 원소마다 2,945~3,065번(기대 3,000번) |
| 다운샘플링 보정 | p = q / (q + (1 - q) / r) | r 은 남기려고 정한 비율 | r 0.1 에서 0.1695 → 0.0200 |
| k-means | 배정과 평균 갱신을 배정이 안 바뀔 때까지 | 시작 중심에 따라 다른 답 | 시작 A inertia 19.67, 시작 B 27.67 |
| softmax | 최댓값을 빼고 지수 | 큰 점수에서 넘침 | [1000, 1001, 1002] → 0.09, 0.2447, 0.6652 |

## 헷갈리기 쉬운 점

- **AUC 의 동점은 0.5 입니다.** 이 글의 데이터에서 동점을 1 로 세면 0.8, 0 으로 세면 0.7333 이 되어 정의대로 센 0.7667 과 다릅니다. 순위 방식에서는 동점에 순위의 평균을 주는 것이 같은 일입니다.
- **AUC 는 순서만 봅니다.** 점수를 모두 2배로 키워도 AUC 는 그대로라서, 확률 값이 맞는지는 log loss 나 calibration 으로 따로 봅니다.
- **log loss 의 자르기는 값을 고치는 것이 아니라 오류를 막는 것입니다.** eps 에 따라 같은 데이터가 1.3094 에서 4.3796 까지 달라지므로 eps 가 다른 실험끼리는 비교하지 않습니다.
- **보정식의 r 은 남긴 비율입니다.** negative 를 10% 남겼으면 r 은 0.1 이고, 「10배 줄였다」를 r = 10 으로 넣으면 예측이 오히려 커집니다.
- **k-means 가 멈췄다고 가장 좋은 답은 아닙니다.** 같은 점 10개에서 시작 중심만 바꿔도 inertia 가 19.67 과 27.67 로 다르게 멈추므로, 여러 번 돌리거나 k-means++ 로 시작합니다.
- **softmax 에서 빼는 값은 결과를 바꾸지 않습니다.** 모든 점수에서 같은 값을 빼면 분자와 분모가 같은 배수로 줄어 지워지므로, 넘침만 막고 확률은 그대로입니다.

## 더 깊이 보기

- AUC 와 Mann-Whitney U 의 관계는 Wikipedia 의 [Mann–Whitney U test](https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test) 의 AUC 관련 부분과 [Receiver operating characteristic](https://en.wikipedia.org/wiki/Receiver_operating_characteristic) 에 있습니다.
- 라이브러리 함수의 정의와 인자는 scikit-learn 문서의 [roc_auc_score](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.roc_auc_score.html), [log_loss](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.log_loss.html), [KMeans](https://scikit-learn.org/stable/modules/generated/sklearn.cluster.KMeans.html) 에 있습니다.
- reservoir sampling 의 Algorithm R 과 증명은 Wikipedia 의 [Reservoir sampling](https://en.wikipedia.org/wiki/Reservoir_sampling) 에, k-means 의 반복과 k-means++ 는 [k-means clustering](https://en.wikipedia.org/wiki/K-means_clustering) 에 있습니다.
- 가중치 선택과 이진 탐색의 표준 라이브러리 문서는 [random.choices](https://docs.python.org/3/library/random.html#random.choices) 와 [bisect](https://docs.python.org/3/library/bisect.html) 입니다.
- 다운샘플링 보정식의 유도와 함정은 [Negative Sampling](post.html?id=negative-sampling-bias) 편, 보정 뒤에 남는 확률 오차는 [Calibration(확률 보정)](post.html?id=calibration) 편, AUC 하나로 놓치는 것은 [GAUC 와 오프라인 지표](post.html?id=offline-metrics-gauc) 편에 있습니다.
- 광고 모델 면접에서 다운샘플링과 보정을 묻는 질문은 [ML 모델링 면접](post.html?id=interview-ml-modeling) 편에 있습니다.
- 문제를 받았을 때의 순서와 브루트 포스 비교는 [코딩테스트 풀이 순서](post.html?id=algorithm-solving-steps) 편, `bisect` 의 쓰임은 [이분 탐색과 스택](post.html?id=algorithm-binary-search-stack) 편에 있습니다.
