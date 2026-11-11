지훈은 코딩 테스트에서 문제를 다 풀었고 예제 입력 세 개가 전부 맞았습니다. 지훈의 노트북에서는 눈 깜짝할 사이에 끝났는데, 제출하니 시간 초과가 떴습니다.

코드를 다시 봐도 틀린 곳이 없었고 실제로 틀리지도 않았습니다. 답은 맞았는데 채점 서버가 기다려 주지 않았을 뿐입니다. 예제 입력은 숫자가 열 개였고 채점 입력은 십만 개였습니다.

**돌아가는 코드와 통과하는 코드는 무엇이 다를까요?**

두 코드는 입력이 커질 때 시간이 어떻게 늘어나느냐가 다릅니다. 입력에 든 값의 개수를 n 이라 적으면 지훈의 예제 입력은 n=10 이고 채점 입력은 n=100,000 입니다. n 이 커질 때 걸리는 시간이 어떤 모양으로 늘어나는지를 측정하는 기준을 **복잡도**라고 부릅니다. 이 글에서 복잡도라고만 쓰면 걸리는 시간이 늘어나는 모양(시간 복잡도)을 뜻합니다. 쓰는 메모리가 늘어나는 모양(공간 복잡도)은 3절에서 따로 다룹니다.

코딩 테스트에서 떨어지는 경우의 상당수는 알고리즘(문제를 푸는 방법과 순서)을 몰라서가 아니라 자기 코드가 어느 등급에 놓이는지, 곧 시간이 늘어나는 모양이 어느 종류인지를 몰라서입니다.

이 글은 복잡도와 함께 배열(값을 번호 붙은 칸에 차례로 담아 둔 줄, 파이썬에서는 리스트)을 처리하는 요령도 설명합니다.

> **한 줄 요약:** 입력이 두 배가 될 때 시간이 두 배가 되는 코드와 네 배가 되는 코드는 다른 종류입니다. 그 차이는 십만 개짜리 입력에서 5밀리초와 2분 남짓으로 벌어집니다.

> **골라 읽는 법** — 절이 아홉 개인 글입니다. 처음부터 다 읽지 않아도 됩니다.
>
> - 시간이 어떻게 늘어나는지 직접 측정하는 것만 → 앞의 두 절
> - 파이썬 자료형 고르는 법만 → 자료형 절
> - 배열을 순회하는 세 가지 요령만 → 한 번 순회부터 슬라이딩 윈도우까지
> - 방법을 고르는 순서만 → 마지막 절

---

## 1. 입력을 두 배씩 키운 실행 시간 측정

**입력을 두 배로 키워 측정해 보면 코드의 시간이 두 배로 느는지 네 배로 느는지 바로 보입니다.**

풀 문제는 정수 목록에 같은 값이 두 번 나오는지 보는 일입니다. 첫째 방법은 목록의 값 두 개로 만들 수 있는 짝을 전부 만들어 하나씩 비교합니다(`dup_pairs`). 둘째 방법은 이미 본 값을 집합(set, 같은 값을 한 번만 담는 자료형)에 적어 두고 목록을 한 번만 순회합니다(`dup_set`). 순회는 목록을 처음부터 끝까지 하나씩 차례로 보는 일입니다. 출력 칸의 이름(짝 전부, 집합)을 따라 첫째를 **짝 전부**, 둘째를 **집합 방법**이라고 부릅니다.

두 방법 모두 답이 맞고 지훈의 예제 입력처럼 값이 열 개뿐이면 어느 쪽이든 눈 깜짝할 사이에 끝나므로, 예제 입력으로는 차이가 전혀 보이지 않습니다. 차이를 보려면 입력을 키워 가며 시간을 측정해야 합니다.

n 이 두 배가 될 때 두 방법의 시간이 몇 배로 느는지 아래 블록으로 측정합니다. n 은 1,000 에서 8,000 까지 두 배씩 키웁니다. 배수 칸에는 바로 앞 n 의 시간보다 몇 배가 되었는지를 찍습니다. 목록에 중복이 없게 만들어 두 방법이 끝까지 순회하게 했으므로 찍힌 값은 가장 오래 걸리는 경우(최악의 경우)의 시간입니다.

```python
# 하는 일: 정수 목록에 같은 값이 두 번 나오는지를 두 방법으로 풀고, n 을 1,000 에서 8,000 까지 두 배씩 키우며 걸린 시간을 측정한다.

import random
from time import perf_counter

# 1단계: 두 방법을 만든다
# 방법 A 는 짝을 전부 만들어 비교한다. 방법 B 는 이미 본 값을 집합에 넣어 두고 목록을 한 번만 순회한다.
def dup_pairs(nums):                  # 짝을 전부 만든다
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] == nums[j]:
                return True
    return False

def dup_set(nums):                    # 한 번만 순회한다
    seen = set()
    for x in nums:
        if x in seen:
            return True
        seen.add(x)
    return False

# 2단계: 걸린 시간을 측정하는 함수를 만든다
def took(fn, nums, repeat=3):         # 가장 빨랐던 회차를 쓴다. 잡음을 줄이려고
    best = float('inf')
    for _ in range(repeat):
        t0 = perf_counter()
        fn(nums)
        best = min(best, perf_counter() - t0)
    return best

# 3단계: n 을 두 배씩 키우며 측정한다
# 가장 오래 걸리는 경우를 측정하려고 목록에 중복이 없게 해서 두 방법 다 끝까지 순회하게 했다.
# 시간은 노트북 한 대에서 측정한 값이라 기계마다 다르니, 절대 시간보다 n 이 두 배가 될 때 시간이 몇 배가 되는지를 본다.
rng = random.Random(20260815)
print(f"{'n':>7}{'짝 전부(ms)':>14}{'배수':>7}{'집합(ms)':>12}{'배수':>7}")
pa = pb = None
for n in (1000, 2000, 4000, 8000):
    nums = rng.sample(range(n * 10), n)
    a = took(dup_pairs, nums, 1) * 1000
    b = took(dup_set, nums) * 1000
    ra = f"{a/pa:.1f}배" if pa else "-"
    rb = f"{b/pb:.1f}배" if pb else "-"
    print(f"{n:>7}{a:>14.1f}{ra:>7}{b:>12.3f}{rb:>7}")
    pa, pb = a, b

# 출력 (시간은 돌릴 때마다 다르다):
# 3단계 뜻: n 이 두 배가 될 때 짝 전부는 4배쯤, 집합은 2배쯤 는다. 밀리초 값은 기계마다 다르다.
#       n      짝 전부(ms)     배수      집합(ms)     배수
#    1000          14.2      -       0.043      -
#    2000          56.1   3.9배       0.099   2.3배
#    4000         227.2   4.0배       0.186   1.9배
#    8000         870.3   3.8배       0.397   2.1배
```

n=1,000 에서 짝 전부는 14.2밀리초, 집합 방법은 0.043밀리초가 걸렸습니다. 이 밀리초 값은 노트북 한 대에서 측정한 것이라 기계마다 다르게 나오므로 절대 시간보다 배수 칸을 봅니다. 짝 전부의 배수는 3.9배, 4.0배, 3.8배로 n 이 두 배가 될 때마다 4배 근처이고 집합 방법의 배수는 2.3배, 1.9배, 2.1배로 2배 근처입니다.

4배와 2배는 두 방법이 하는 일의 양에서 나옵니다. 짝 전부는 값 하나마다 그 뒤의 값 전부와 비교하므로 비교 횟수가 n 의 제곱에 비례해 n 이 두 배가 되면 네 배가 됩니다. 집합 방법은 값마다 `seen` 집합에 들어 있는지 묻고 넣는 일을 한 번씩만 합니다. 집합은 값이 몇 개 들어 있든 찾는 값이 있는지 한 번에 확인하므로 집합 방법의 전체 일은 n 에 비례해 n 이 두 배가 되면 두 배가 됩니다. 집합이 한 번에 확인하는 방식은 4절에서 다룹니다.

4배와 2배의 차이가 세 번 쌓여 n=8,000 에서는 짝 전부가 870.3밀리초, 집합 방법이 0.397밀리초로 이미 2,000배 넘게 벌어집니다.

아래 그림은 짝 전부의 시간을 막대로 그렸습니다. n 이 두 배가 될 때마다 막대가 네 배 가까이 길어져 n=8,000 의 막대는 n=1,000 의 막대보다 61배 깁니다.

<div class="table-wrapper">
<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 500 150" role="img" aria-label="n 이 1000, 2000, 4000, 8000 으로 두 배씩 커질 때 짝을 전부 만드는 방법의 걸린 시간을 막대로 그린 그림. 막대 길이가 매번 네 배 가까이 길어져 마지막 막대가 첫 막대의 61배다." style="width:100%; max-width:500px; height:auto; font-family:var(--font-sans)">
<text x="6" y="14" style="font-size:12.5px; fill:var(--text-secondary)">짝을 전부 만드는 방법 — n 이 두 배가 될 때마다 막대가 네 배</text>
<g style="stroke:var(--rule); stroke-width:1"><line x1="86" y1="26" x2="86" y2="140"/></g>
<g style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.4">
<rect x="88" y="32" width="5" height="16"/>
<rect x="88" y="58" width="19" height="16"/>
<rect x="88" y="84" width="78" height="16"/>
</g>
<rect x="88" y="110" width="300" height="16" style="fill:var(--bg-secondary); stroke:var(--accent-primary); stroke-width:2.5"/>
<g style="font-size:12.5px; fill:var(--text-secondary); text-anchor:end; font-family:var(--font-mono)">
<text x="80" y="44">1,000</text><text x="80" y="70">2,000</text><text x="80" y="96">4,000</text><text x="80" y="122">8,000</text></g>
<g style="font-size:12.5px; fill:var(--text-muted); font-family:var(--font-mono)">
<text x="99" y="44">14.2 ms</text><text x="113" y="70">56.1 ms</text><text x="172" y="96">227.2 ms</text></g>
<text x="394" y="122" style="font-size:12.5px; fill:var(--accent-primary); font-family:var(--font-mono)">870.3 ms</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">같은 눈금에 집합 쪽을 그리면 가장 긴 것도 0.14픽셀이라 선이 아예 안 보인다. 두 방법을 한 그림에 담을 수 없다는 것이 이 절의 요점이다.</figcaption>
</figure>
</div>

n 이 두 배가 될 때 시간이 몇 배가 되느냐가 코딩 테스트의 합격선을 정합니다. 채점 입력 십만 개는 8,000 개의 12.5배라서 위 표를 그대로 늘려 보면, 시간이 n 에 비례하는 집합 방법은 0.397밀리초의 12.5배인 5밀리초쯤이지만 n 의 제곱에 비례하는 짝 전부는 870.3밀리초에 12.5를 두 번 곱해 2분 넘게 걸립니다. 코딩 테스트의 제한 시간은 보통 몇 초뿐입니다.

## 2. 빅오 표기와 복잡도 등급

**빅오(Big-O)는 입력이 커질 때 시간이 어떻게 느는지만 남기고 나머지를 버린 표기입니다.**

1절의 밀리초는 기계가 바뀌면 달라지므로, 코드끼리 비교하려면 밀리초 대신 늘어나는 모양에 이름을 붙여야 합니다.

1절의 집합 방법처럼 시간이 입력 개수 n 에 비례해서 n 이 두 배가 될 때 2배 근처로 느는 모양을 **O(n)** 이라 씁니다. 짝 전부처럼 시간이 n 의 제곱에 비례해서 n 이 두 배가 될 때 4배 근처로 느는 모양은 **O(n²)** 입니다.

빅오는 실제 시간을 말하지 않습니다. 노트북이 빠르면 두 방법이 함께 빨라지고 파이썬 대신 C 를 쓰면 또 함께 빨라지지만 n 이 두 배가 될 때 몇 배로 느는지는 그대로입니다. 그래서 빅오는 **입력이 커질 때 어떤 모양으로 늘어나느냐** 하나만 말합니다.

빅오는 이 모양만 남기므로 상수 배(3n 의 3)와 낮은 항(3n + 100 의 100)을 버리고 3n + 100 도 n 도 똑같이 O(n)이라 씁니다. n 이 충분히 커지면 3배와 100 은 제곱으로 늘어나는 시간 앞에서 아무 의미가 없으므로 버려도 됩니다. 아래 표의 「n=100만이면 대략」 칸으로 보면 O(n)의 100만번이 3배가 되고 100번이 더해져도 O(n²)의 1조번에 비하면 차이라고 할 수 없습니다.

아래 표는 자주 만나는 등급 다섯 가지입니다. O(1)은 n 이 커져도 하는 일의 횟수가 그대로인 등급이고 O(log n)은 n 이 두 배가 되어도 한 번만 더 하면 되는 등급입니다.

| 이름 | n이 두 배가 되면 | n=100만이면 대략 | 어디서 보나 |
|---|---|---|---|
| O(1) | 그대로 | 1번 | 리스트 인덱스 접근, 딕셔너리 조회 |
| O(log n) | 한 번 더 | 20번 | 이분탐색, 균형 잡힌 트리 |
| O(n) | 두 배 | 100만번 | 한 번 순회, 최댓값 찾기 |
| O(n log n) | 두 배 조금 넘게 | 2,000만번 | 정렬 |
| O(n²) | 네 배 | 1조번 | 짝을 전부 만들기, 이중 반복문 |

실무 감각은 표의 가운데 칸에서 얻습니다. 같은 n=100만에서 O(n)은 100만번이고 O(n²)은 1조번입니다. 코딩 테스트 입력이 십만 개면 O(n log n)까지는 대체로 통과하고 O(n²)은 대체로 떨어지는데, 1절에서 늘려 본 대로 짝 전부는 십만 개에서 2분 넘게 걸립니다. 그래서 문제에 적힌 입력 크기가 "어느 등급까지 허용되는가"를 알려 줍니다.

문제를 읽으면 입력 크기부터 봅니다. 이중 반복문은 1절의 짝 전부처럼 반복문 안에 반복문이 하나 더 들어 있는 코드입니다. n 이 1,000 이하라면 이중 반복문을 써도 됩니다. 1절에서도 짝 전부는 n=1,000 에서 14.2밀리초에 끝났습니다. n 이 십만이면 처음부터 한 번 순회하는 방법을 찾아야 합니다.

## 3. 공간 복잡도: 시간과 메모리의 맞바꿈

**1절의 집합 방법은 본 값을 따로 적어 두어서 빨랐습니다. 그 적어 두는 메모리가 비용입니다.**

`dup_set` 은 본 값을 적어 둘 `seen` 이라는 집합을 하나 더 만듭니다. 최악의 경우에는 중복이 없어 끝까지 순회하므로 입력 전부가 `seen` 에 들어가 입력 개수만큼 메모리를 더 씁니다. 1절에서 n 이 8,000 일 때는 `seen` 에 값이 8,000개까지 들어갔습니다.

공간 복잡도는 쓰는 메모리가 n 에 따라 늘어나는 모양이고 시간 복잡도처럼 빅오로 적습니다. `seen` 처럼 쓰는 메모리가 입력 개수에 비례해 늘면 **공간 복잡도 O(n)** 이라 합니다. 짝 전부는 반복문 변수 두 개(`i`, `j`) 말고는 새 메모리를 쓰지 않아 n 이 커져도 쓰는 메모리가 그대로이므로 공간 복잡도가 O(1)입니다.

집합 방법은 `seen` 에 메모리를 더 써서 시간을 줄이고 짝 전부는 시간이 훨씬 오래 걸리는 대신 메모리를 덜 씁니다. 이렇게 시간과 메모리 가운데 하나를 줄이려고 다른 하나를 더 쓰는 시간과 메모리의 맞바꿈이 알고리즘 문제의 기본 구조입니다. **대체로 시간을 줄이려면 메모리를 더 씁니다.** 6절의 누적합과 2편에서 다룰 해시도 모두 메모리를 더 써서 시간을 줄이는 이 맞바꿈을 따릅니다.

코딩 테스트에서 메모리 제한(채점 서버가 허용하는 메모리 양)에 걸리는 일은 시간 제한에 걸리는 일보다 드뭅니다. 그래서 우선은 시간을 줄이는 방법부터 생각하고 메모리가 문제가 되면 그때 맞바꿈을 되돌립니다.

## 4. 자료형 선택: list, set, deque

**알고리즘을 바꾸지 않아도 자료형만 바꿔서 시간 초과가 풀리는 경우가 있습니다.**

파이썬에서 `x in 리스트` 와 `x in 집합` 은 겉모습이 같고 하는 일도 같아 보이지만 속은 전혀 다릅니다. 리스트는 앞에서부터 하나씩 비교(스캔)하므로 찾는 값이 맨 끝에 있으면 값 n 개를 전부 비교합니다. 집합은 값에서 저장된 자리를 계산(해시)해 값이 몇 개 들어 있든 그 자리로 한 번에 갑니다.

`리스트.pop(0)` 도 겉보기와 속이 다릅니다. 리스트에서 맨 앞을 빼면 뒤에 남은 값이 전부 한 칸씩 앞으로 당겨지므로, 한 번 뺄 때마다 남은 개수만큼 일이 듭니다. `deque`(양쪽 끝에서 빼고 넣도록 만든 자료형)는 맨 앞을 빼도 당기는 일이 없습니다.

두 차이가 실제 시간으로 얼마나 되는지 n = 100,000 에서 확인합니다. 아래 블록은 「안에 있나」 1,000번과 「맨 앞을 뺀다」 100,000번에 걸린 시간을 list(리스트)와 다른 자료형인 set(집합), deque 로 측정해 나란히 찍고 몇 배 차이인지 계산합니다. 찾는 값은 늘 맨 끝의 값이라 list 는 매번 끝까지 스캔합니다.

```python
# 하는 일: n = 100,000 에서 「안에 있나」와 「맨 앞을 뺀다」를 list 와 다른 자료형(set, deque)으로 해 보고 걸린 시간을 비교한다.

from collections import deque
from time import perf_counter

N = 100_000
LOOKUPS = 1_000

# 1단계: 「안에 있나」를 list 와 set 으로 측정한다
# list 는 앞에서부터 스캔하고, set 은 해시로 한 번에 간다. 찾는 값을 늘 맨 끝에 두어 list 가 끝까지 스캔하게 했다.
data = list(range(N))
as_list, as_set = data, set(data)

t0 = perf_counter()
for i in range(LOOKUPS):
    (N - 1) in as_list          # 항상 맨 끝 — 끝까지 스캔한다
list_in = (perf_counter() - t0) * 1000

t0 = perf_counter()
for i in range(LOOKUPS):
    (N - 1) in as_set
set_in = (perf_counter() - t0) * 1000

# 2단계: 「맨 앞을 뺀다」를 list 와 deque 로 측정한다
# list 는 뺄 때마다 나머지를 전부 한 칸씩 당기고, deque 는 그냥 뗀다.
lst = list(range(N))
t0 = perf_counter()
while lst:
    lst.pop(0)                  # 뺄 때마다 뒤를 한 칸씩 당긴다
list_pop = (perf_counter() - t0) * 1000

dq = deque(range(N))
t0 = perf_counter()
while dq:
    dq.popleft()
deque_pop = (perf_counter() - t0) * 1000

# 3단계: 두 비교를 표로 찍는다
# list 로 하는 이 두 가지가 코딩 테스트에서 시간 초과가 나는 자리의 상당수를 차지한다.
print(f"{'하는 일':<22}{'list(ms)':>11}{'다른 쪽(ms)':>14}{'몇 배':>9}")
print(f"{'안에 있나 (1,000번)':<22}{list_in:>11.1f}{set_in:>14.2f}{list_in/set_in:>8.0f}배")
print(f"{'맨 앞 빼기 (100,000번)':<20}{list_pop:>11.1f}{deque_pop:>14.2f}{list_pop/deque_pop:>8.0f}배")

# 출력 (시간은 돌릴 때마다 다르다):
# 3단계 뜻: 자료형 하나만 바꿨는데 「안에 있나」는 1만 배 넘게, 「맨 앞 빼기」는 수백 배 차이 난다. 배수는 기계마다 다르다.
# 하는 일                     list(ms)      다른 쪽(ms)      몇 배
# 안에 있나 (1,000번)              558.6          0.05   11303배
# 맨 앞 빼기 (100,000번)         685.7          2.95     232배
```

「안에 있나」 1,000번은 list 가 558.6밀리초, set 이 0.05밀리초로 11,303배 차이가 났습니다. list 는 물을 때마다 맨 끝의 값에 닿을 때까지 100,000개를 앞에서부터 비교하고 set 은 자리를 계산해 한 번에 가므로, 코드에서 `as_list` 를 `as_set` 으로 바꾼 한 줄만으로 이만큼 달라집니다.

「맨 앞 빼기」 100,000번은 list 가 685.7밀리초, deque 가 2.95밀리초로 232배 차이가 났습니다. 뺄 때마다 list 는 뒤에 남은 값을 전부 한 칸씩 당기지만 deque 는 맨 앞을 그냥 떼므로 이만큼 벌어집니다. 밀리초 값은 돌릴 때마다 다르고 두 배수도 기계마다 다르게 나옵니다.

외울 것은 짧습니다. **"안에 있나"를 반복해서 물으면 집합이나 딕셔너리에 담고 맨 앞을 빼야 하면 `deque` 를 씁니다.** 딕셔너리(dict)는 키와 값을 짝지어 담는 자료형입니다. 2절 표에 있듯 딕셔너리도 키로 조회하는 일이 O(1)이라 집합처럼 한 번에 찾습니다. 코딩 테스트에서 시간 초과가 나는 자리의 상당수가 list 로 「안에 있나」를 묻는 일과 맨 앞을 빼는 일이라서 이 두 규칙만 지켜도 시간 초과가 많이 사라집니다.

다만 집합은 값을 넣은 순서를 잃고 메모리도 더 씁니다. 위 블록에서도 `as_set` 은 리스트와 따로 값 100,000개를 한 벌 더 담았으니, 3절에서 본 시간과 메모리의 맞바꿈이 여기서도 나옵니다.

## 5. 한 번 순회

**배열 문제의 기본형은 "처음부터 끝까지 한 번 지나가면서 필요한 것을 들고 간다"입니다.**

값 하나를 볼 때마다 이미 지나온 값을 다시 돌아보면 1절의 짝 전부처럼 O(n²)이 됩니다. 그래서 배열 문제는 한 번 지나가는 것으로 끝낼 방법부터 찾습니다.

최댓값 찾기로 보면, 정렬(작은 값부터 순서대로 놓는 일)한 뒤 마지막 값을 보는 방법은 O(n log n)이고 한 번 순회하면서 지금까지 본 값 중 가장 큰 값을 들고 가는 방법은 O(n)입니다. 답은 같은데 2절 표의 n=100만 칸으로 보면 정렬은 2,000만번, 한 번 순회는 100만번이라 한 번 순회가 더 쌉니다. 6절에서 쓸 값 3 1 4 1 5 9 2 6 을 차례로 보면 들고 가는 최댓값은 3 3 4 4 5 9 9 9 로 바뀌고 마지막에 9 가 남아, 지나온 값을 다시 보지 않고 한 번에 끝납니다.

들고 가는 것이 하나일 필요도 없습니다. 같은 값에서 최댓값과 최솟값을 함께 들고 가면 한 번 순회로 9 와 1 을 둘 다 얻습니다. 합계와 개수를 들고 가면 끝에 합계 31 과 개수 8 이 남아 다시 순회하지 않고 그 자리에서 31 ÷ 8 로 평균을 구합니다.

**"무엇을 들고 가면 되돌아보지 않아도 되나"를 찾으면 됩니다.** 7절과 8절은 이 질문에 답하는 정해진 방법 두 가지입니다.

## 6. 누적합: 구간 합을 뺄셈 한 번으로 구하는 법

**구간의 합을 여러 번 물어볼 거라면, 앞에서부터의 합을 한 줄 만들어 두고 뺄셈으로 답합니다.**

칸 번호를 0 부터 셀 때 2번 칸부터 5번 칸까지처럼 이어진 칸들의 합을 구간 합이라 합니다. 구간 합을 물을 때마다 그 구간을 순회해 더하면 질문 하나에 구간 길이만큼 걸리므로, 질문이 십만 번이면 구간 길이에 십만을 곱한 만큼 걸립니다.

**누적합**은 앞에서부터 더해 온 합을 차례로 적어 둔 줄입니다. 이 줄을 미리 한 번 만들어 두면 어떤 구간의 합이든 뺄셈 한 번으로 나옵니다. 누적합을 만들 때는 값을 한 번 순회하므로 O(n)이 들고 그 뒤로는 질문마다 뺄셈 한 번이라 O(1)입니다. 대신 누적합 줄을 메모리에 더 두어야 하니 3절에서 말한 시간과 메모리의 맞바꿈이 누적합에도 있습니다.

누적합으로 구한 값이 직접 더한 값과 같은지 지어낸 값 8개로 확인합니다. 아래 블록은 누적합을 만든 뒤 세 구간의 합을 두 방법으로 구해 나란히 찍습니다. `pre[i]` 는 앞 i 개를 더한 값이고 맨 앞에는 0 을 하나 둡니다.

```python
# 하는 일: 지어낸 값 8개로 누적합을 한 줄 만들어 두고, 세 구간의 합을 더해서 구한 값과 뺄셈 한 번으로 구한 값을 비교한다.

ARR = [3, 1, 4, 1, 5, 9, 2, 6]

# 1단계: 누적합을 만든다
# pre[i] 는 ARR 의 앞 i 개를 더한 값이다. 앞에 0 을 하나 두는 것이 요령이다.
pre = [0]
for x in ARR:
    pre.append(pre[-1] + x)

# 2단계: 칸 번호, 값, 누적합을 나란히 찍는다
print("칸    ", " ".join(f"{i:>3}" for i in range(len(ARR))))
print("값    ", " ".join(f"{x:>3}" for x in ARR))
print("누적합", " ".join(f"{x:>3}" for x in pre))
print()

# 3단계: 세 구간의 합을 두 방법으로 구한다
# 구간의 합을 물을 때마다 더하면 물어본 횟수만큼 순회한다. 누적합은 뺄셈 한 번이면 끝난다.
for lo, hi in [(2, 5), (0, 3), (5, 7)]:
    direct = sum(ARR[lo:hi + 1])
    fast = pre[hi + 1] - pre[lo]
    print(f"{lo}~{hi} 칸의 합  더해서 {direct:>2}, 누적합으로 pre[{hi+1}]-pre[{lo}] = "
          f"{pre[hi+1]}-{pre[lo]} = {fast:>2}  {'같다' if direct == fast else '다르다'}")

# 출력:
# 2단계 뜻: 누적합 줄은 값 줄보다 하나 길다. 맨 앞에 둔 0 때문이다.
# 칸       0   1   2   3   4   5   6   7
# 값       3   1   4   1   5   9   2   6
# 누적합   0   3   4   8   9  14  23  25  31
#
# 3단계 뜻: 세 구간 모두 더한 값과 뺄셈 한 번으로 구한 값이 같다.
# 2~5 칸의 합  더해서 19, 누적합으로 pre[6]-pre[2] = 23-4 = 19  같다
# 0~3 칸의 합  더해서  9, 누적합으로 pre[4]-pre[0] = 9-0 =  9  같다
# 5~7 칸의 합  더해서 17, 누적합으로 pre[8]-pre[5] = 31-14 = 17  같다
```

세 구간 모두 끝에 「같다」가 찍혔습니다. 2~5 칸의 합을 직접 구하면 값 4개를 더해 4 + 1 + 5 + 9 = 19 입니다. 누적합에서는 `pre[6]` 이 앞 6개의 합 23 이고 `pre[2]` 가 앞 2개의 합 4 입니다. 23 에서 4 를 한 번 빼면 앞쪽 두 칸(값 3 과 1)의 합이 빠지고 2번 칸부터 5번 칸까지의 합 19 만 남습니다. 5~7 칸도 `pre[8]` - `pre[5]` = 31 - 14 = 17 로 직접 더한 17 과 같습니다.

아래 그림에서는 2번부터 5번 칸의 합 19 가 누적합 줄의 어느 두 자리에서 나오는지를 봅니다.

<div class="table-wrapper">
<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 500 176" role="img" aria-label="위 줄에 값 여덟 개가 칸으로 놓여 있고 아래 줄에 누적합 아홉 개가 반 칸씩 밀려 놓여 있다. 2번부터 5번 칸까지의 합을 구하려고 누적합의 6번과 2번 자리를 화살표로 가리키고, 스물셋에서 넷을 빼 열아홉이 되는 것을 보인다." style="width:100%; max-width:500px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="ca6-arr" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto"><path d="M0,0 L7.5,3 L0,6 Z" style="fill:var(--accent-primary)"/></marker>
</defs>
<text x="6" y="14" style="font-size:12.5px; fill:var(--text-secondary)">값 — 굵은 넷이 2번부터 5번 칸이다</text>
<g style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.4">
<rect x="60" y="24" width="28" height="20"/><rect x="92" y="24" width="28" height="20"/>
<rect x="220" y="24" width="28" height="20"/><rect x="252" y="24" width="28" height="20"/></g>
<g style="fill:var(--bg-secondary); stroke:var(--accent-primary); stroke-width:2">
<rect x="124" y="24" width="28" height="20"/><rect x="156" y="24" width="28" height="20"/>
<rect x="188" y="24" width="28" height="20"/><rect x="284" y="24" width="28" height="20"/></g>
<g style="font-size:12.5px; fill:var(--text-primary); text-anchor:middle; font-family:var(--font-mono)">
<text x="74" y="38">3</text><text x="106" y="38">1</text><text x="138" y="38">4</text><text x="170" y="38">1</text>
<text x="202" y="38">5</text><text x="234" y="38">9</text><text x="266" y="38">2</text><text x="298" y="38">6</text></g>
<g style="font-size:11px; fill:var(--text-muted); text-anchor:middle; font-family:var(--font-mono)">
<text x="74" y="56">0</text><text x="106" y="56">1</text><text x="138" y="56">2</text><text x="170" y="56">3</text>
<text x="202" y="56">4</text><text x="234" y="56">5</text><text x="266" y="56">6</text><text x="298" y="56">7</text></g>
<text x="6" y="86" style="font-size:12.5px; fill:var(--text-secondary)">누적합 — 칸 사이 경계에 놓인다</text>
<g style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.4">
<rect x="46" y="96" width="28" height="20"/><rect x="78" y="96" width="28" height="20"/>
<rect x="142" y="96" width="28" height="20"/><rect x="174" y="96" width="28" height="20"/>
<rect x="206" y="96" width="28" height="20"/><rect x="270" y="96" width="28" height="20"/>
<rect x="302" y="96" width="28" height="20"/></g>
<g style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:2">
<rect x="110" y="96" width="28" height="20"/><rect x="238" y="96" width="28" height="20"/></g>
<g style="font-size:12.5px; fill:var(--text-primary); text-anchor:middle; font-family:var(--font-mono)">
<text x="60" y="110">0</text><text x="92" y="110">3</text><text x="124" y="110">4</text><text x="156" y="110">8</text>
<text x="188" y="110">9</text><text x="220" y="110">14</text><text x="252" y="110">23</text><text x="284" y="110">25</text><text x="316" y="110">31</text></g>
<line x1="380" y1="106" x2="270" y2="106" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#ca6-arr)"/>
<text x="384" y="110" style="font-size:12.5px; fill:var(--accent-primary); font-family:var(--font-mono)">23 − 4 = 19</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">누적합 줄이 반 칸 밀려 그려진 것은 실수가 아니다. 누적합은 칸의 값이 아니라 칸과 칸 사이 경계까지의 합이라, 값 여덟 개에 경계는 아홉 개가 된다. 2번 칸 앞까지가 4이고 5번 칸 뒤까지가 23이니, 빼면 그 사이 넷의 합만 남는다.</figcaption>
</figure>
</div>

누적합 줄은 맨 앞에 둔 0 때문에 값 줄보다 한 칸 깁니다. 이 0 은 0번 칸 앞까지의 합이라서 0~3 칸처럼 맨 앞에서 시작하는 구간도 `pre[4]` - `pre[0]` = 9 - 0 = 9 로 다른 구간과 같은 뺄셈 하나로 처리됩니다. 이 0 이 없으면 0번 칸 앞까지의 합을 적어 둘 자리가 없어서 구간이 맨 앞에서 시작할 때만 따로 처리해야 합니다.

:::deep 더 깊이 — 2차원으로 늘리면
가로세로가 있는 표에서도 같은 것을 만들 수 있습니다. `pre[i][j]` 를 "왼쪽 위 구석에서 (i, j)까지의 합"으로 두면 임의의 직사각형 합이 덧셈 한 번과 뺄셈 두 번으로 나옵니다.

```
직사각형 합 = pre[하][우] - pre[상][우] - pre[하][좌] + pre[상][좌]
```

위쪽 영역(`pre[상][우]`)과 왼쪽 영역(`pre[하][좌]`)을 빼면 두 영역이 겹치는 왼쪽 위 영역(`pre[상][좌]`)이 두 번 빠지므로 마지막에 한 번 다시 더합니다. 겹친 만큼 한 번 돌려주는 이 꼴을 포함배제라 부르며 격자 문제에서 자주 나옵니다.
:::

## 7. 투 포인터: 양 끝에서 좁혀 오는 방법

**정렬된 배열에서 두 값을 고르는 문제는 양 끝 칸을 가리키는 변수(포인터) 두 개를 두고 좁혀 오면 한 번 순회로 끝납니다.**

두 수를 더해 목표값이 되는 짝을 찾는 문제를 봅니다. 짝을 전부 만들면 짝의 수가 n × (n − 1) ÷ 2 라서 값이 8개일 때 28번, 값이 십만 개면 50억 번을 비교합니다.

배열이 오름차순(작은 값부터 순서대로)으로 정렬돼 있다면 훨씬 싸게 찾을 수 있습니다. **투 포인터**는 왼쪽 끝 칸에 포인터 L 을, 오른쪽 끝 칸에 포인터 R 을 두는 방법입니다. L 과 R 이 가리키는 값을 더해 보고 목표보다 크면 R 을 왼쪽으로 한 칸 당기고 작으면 L 을 오른쪽으로 한 칸 밉니다.

**합이 목표보다 크다면 R 의 값은 R 왼쪽에 남은 어떤 값과 짝지어도 너무 큽니다.** 배열이 정렬돼 있어서 L 부터 R 바로 앞까지 남은 값은 전부 지금 L 의 값보다 크거나 같으므로, R 의 값에 그중 어느 것을 더해도 이미 목표보다 큰 지금의 합보다 작아지지 않습니다. 그래서 R 의 값은 후보에서 지워도 됩니다. 합이 목표보다 작을 때는 방향만 반대입니다. L 바로 뒤부터 R 까지 남은 값은 전부 지금 R 의 값보다 작거나 같으므로, L 의 값에 그중 어느 것을 더해도 이미 목표보다 작은 지금의 합보다 커지지 않습니다. 그래서 이때는 L 의 값을 후보에서 지웁니다.

이 규칙만으로 짝을 찾는지 오름차순으로 정렬된 지어낸 값 8개로 확인합니다. 아래 블록은 더해서 28 이 되는 두 수를 양 끝에서 좁혀 오며 찾고 회차마다 L, R, 합을 찍습니다.

```python
# 하는 일: 오름차순으로 정렬된 지어낸 값 8개에서, 더해서 28 이 되는 두 수를 양 끝에서 좁혀 오며 찾는다.

ARR = [2, 5, 8, 12, 16, 23, 38, 45]
TARGET = 28

# 1단계: 양 끝에서 좁혀 오는 함수를 만든다
# 합이 목표보다 크면 오른쪽을 당기고, 작으면 왼쪽을 민다.
# 이 방법은 정렬돼 있다는 것이 전제라, 정렬이 안 되어 있으면 먼저 정렬해야 한다.
def two_sum_sorted(arr, target):
    lo, hi = 0, len(arr) - 1
    step = 0
    while lo < hi:
        step += 1
        total = arr[lo] + arr[hi]
        mark = "찾음" if total == target else ("크다 → 오른쪽을 당긴다" if total > target
                                              else "작다 → 왼쪽을 민다")
        print(f"{step}회차  L={lo}({arr[lo]:>2})  R={hi}({arr[hi]:>2})  "
              f"합 {total:>2}  {mark}")
        if total == target:
            return lo, hi
        if total > target:
            hi -= 1
        else:
            lo += 1
    return None

# 2단계: 목표 28 인 짝을 찾는다
print(f"목표 {TARGET}")
found = two_sum_sorted(ARR, TARGET)
print(f"→ 칸 {found[0]}, {found[1]} 의 {ARR[found[0]]} + {ARR[found[1]]} = {TARGET}")
print(f"→ 짝을 전부 만들면 {len(ARR)*(len(ARR)-1)//2}번 비교한다. 여기서는 4번이었다.")

# 출력:
# 2단계 뜻: 회차마다 두 수의 합을 목표와 비교해 한쪽 끝을 옮긴다. 4회차에 합이 28 이 된다.
# 목표 28
# 1회차  L=0( 2)  R=7(45)  합 47  크다 → 오른쪽을 당긴다
# 2회차  L=0( 2)  R=6(38)  합 40  크다 → 오른쪽을 당긴다
# 3회차  L=0( 2)  R=5(23)  합 25  작다 → 왼쪽을 민다
# 4회차  L=1( 5)  R=5(23)  합 28  찾음
# 2단계 뜻: 찾은 짝은 칸 1 의 5 와 칸 5 의 23 이다. 짝을 전부 만들면 28번 비교할 것을 4번에 끝냈다.
# → 칸 1, 5 의 5 + 23 = 28
# → 짝을 전부 만들면 28번 비교한다. 여기서는 4번이었다.
```

찍힌 네 회차는 위 규칙 그대로 움직입니다. 1회차에는 칸 0 의 2 와 칸 7 의 45 를 더한 합 47 이 목표 28 보다 커서 R 을 한 칸 당깁니다. 2회차의 합 40(2 + 38)도 커서 R 을 한 번 더 당깁니다. 3회차의 합 25(2 + 23)는 작아서 L 을 밉니다. 4회차에 칸 1 의 5 와 칸 5 의 23 을 더한 합이 28 이 되어 끝납니다. 블록 마지막 줄대로 짝을 전부 만들면 28번 비교할 것을 4번에 끝냈습니다. 이 28번은 값 8개로 만드는 짝의 수라서 목표값 28 과는 숫자만 같습니다.

아래 그림은 네 회차를 위에서 아래로 쌓아, 회차가 갈수록 L 과 R 사이가 좁아지는 모양을 보여 줍니다.

<div class="table-wrapper">
<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 500 250" role="img" aria-label="네 회차를 위에서 아래로 쌓은 그림. 회차마다 값 여덟 개가 칸으로 놓여 있고 왼쪽 포인터 L 과 오른쪽 포인터 R 이 화살표로 표시된다. 회차가 갈수록 두 포인터 사이가 좁아지고 네 번째 회차에서 합이 스물여덟이 되어 찾는다." style="width:100%; max-width:500px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="ca7-arr" markerWidth="8" markerHeight="8" refX="3" refY="6.5" orient="auto"><path d="M3,0 L6,6.5 L0,6.5 Z" style="fill:var(--accent-primary)"/></marker>
</defs>
<g style="font-size:11px; fill:var(--text-muted); text-anchor:middle; font-family:var(--font-mono)">
<text x="118" y="14">0</text><text x="150" y="14">1</text><text x="182" y="14">2</text><text x="214" y="14">3</text>
<text x="246" y="14">4</text><text x="278" y="14">5</text><text x="310" y="14">6</text><text x="342" y="14">7</text></g>
<text x="6" y="38" style="font-size:12px; fill:var(--text-secondary)">1회차</text>
<g style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.4">
<rect x="104" y="24" width="28" height="20"/><rect x="136" y="24" width="28" height="20"/><rect x="168" y="24" width="28" height="20"/><rect x="200" y="24" width="28" height="20"/>
<rect x="232" y="24" width="28" height="20"/><rect x="264" y="24" width="28" height="20"/><rect x="296" y="24" width="28" height="20"/><rect x="328" y="24" width="28" height="20"/></g>
<g style="font-size:12.5px; fill:var(--text-primary); text-anchor:middle; font-family:var(--font-mono)">
<text x="118" y="38">2</text><text x="150" y="38">5</text><text x="182" y="38">8</text><text x="214" y="38">12</text>
<text x="246" y="38">16</text><text x="278" y="38">23</text><text x="310" y="38">38</text><text x="342" y="38">45</text></g>
<line x1="118" y1="52" x2="118" y2="46" style="stroke:var(--accent-primary); stroke-width:1.6" marker-end="url(#ca7-arr)"/>
<line x1="342" y1="52" x2="342" y2="46" style="stroke:var(--accent-primary); stroke-width:1.6" marker-end="url(#ca7-arr)"/>
<text x="118" y="62" style="font-size:11px; fill:var(--accent-primary); text-anchor:middle; font-family:var(--font-mono)">L</text>
<text x="342" y="62" style="font-size:11px; fill:var(--accent-primary); text-anchor:middle; font-family:var(--font-mono)">R</text>
<text x="366" y="38" style="font-size:12px; fill:var(--text-muted); font-family:var(--font-mono)">합 47, 크다</text>
<text x="6" y="96" style="font-size:12px; fill:var(--text-secondary)">2회차</text>
<g style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.4">
<rect x="104" y="82" width="28" height="20"/><rect x="136" y="82" width="28" height="20"/><rect x="168" y="82" width="28" height="20"/><rect x="200" y="82" width="28" height="20"/>
<rect x="232" y="82" width="28" height="20"/><rect x="264" y="82" width="28" height="20"/><rect x="296" y="82" width="28" height="20"/></g>
<rect x="328" y="82" width="28" height="20" style="fill:var(--bg-tertiary); stroke:var(--rule2); stroke-width:1; stroke-dasharray:3 2"/>
<g style="font-size:12.5px; fill:var(--text-primary); text-anchor:middle; font-family:var(--font-mono)">
<text x="118" y="96">2</text><text x="150" y="96">5</text><text x="182" y="96">8</text><text x="214" y="96">12</text>
<text x="246" y="96">16</text><text x="278" y="96">23</text><text x="310" y="96">38</text></g>
<text x="342" y="96" style="font-size:12.5px; fill:var(--text-muted); text-anchor:middle; font-family:var(--font-mono)">45</text>
<line x1="118" y1="110" x2="118" y2="104" style="stroke:var(--accent-primary); stroke-width:1.6" marker-end="url(#ca7-arr)"/>
<line x1="310" y1="110" x2="310" y2="104" style="stroke:var(--accent-primary); stroke-width:1.6" marker-end="url(#ca7-arr)"/>
<text x="118" y="120" style="font-size:11px; fill:var(--accent-primary); text-anchor:middle; font-family:var(--font-mono)">L</text>
<text x="310" y="120" style="font-size:11px; fill:var(--accent-primary); text-anchor:middle; font-family:var(--font-mono)">R</text>
<text x="366" y="96" style="font-size:12px; fill:var(--text-muted); font-family:var(--font-mono)">합 40, 크다</text>
<text x="6" y="154" style="font-size:12px; fill:var(--text-secondary)">3회차</text>
<g style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.4">
<rect x="104" y="140" width="28" height="20"/><rect x="136" y="140" width="28" height="20"/><rect x="168" y="140" width="28" height="20"/><rect x="200" y="140" width="28" height="20"/>
<rect x="232" y="140" width="28" height="20"/><rect x="264" y="140" width="28" height="20"/></g>
<g style="fill:var(--bg-tertiary); stroke:var(--rule2); stroke-width:1; stroke-dasharray:3 2">
<rect x="296" y="140" width="28" height="20"/><rect x="328" y="140" width="28" height="20"/></g>
<g style="font-size:12.5px; fill:var(--text-primary); text-anchor:middle; font-family:var(--font-mono)">
<text x="118" y="154">2</text><text x="150" y="154">5</text><text x="182" y="154">8</text><text x="214" y="154">12</text>
<text x="246" y="154">16</text><text x="278" y="154">23</text></g>
<g style="font-size:12.5px; fill:var(--text-muted); text-anchor:middle; font-family:var(--font-mono)">
<text x="310" y="154">38</text><text x="342" y="154">45</text></g>
<line x1="118" y1="168" x2="118" y2="162" style="stroke:var(--accent-primary); stroke-width:1.6" marker-end="url(#ca7-arr)"/>
<line x1="278" y1="168" x2="278" y2="162" style="stroke:var(--accent-primary); stroke-width:1.6" marker-end="url(#ca7-arr)"/>
<text x="118" y="178" style="font-size:11px; fill:var(--accent-primary); text-anchor:middle; font-family:var(--font-mono)">L</text>
<text x="278" y="178" style="font-size:11px; fill:var(--accent-primary); text-anchor:middle; font-family:var(--font-mono)">R</text>
<text x="366" y="154" style="font-size:12px; fill:var(--text-muted); font-family:var(--font-mono)">합 25, 작다</text>
<text x="6" y="212" style="font-size:12px; fill:var(--text-secondary)">4회차</text>
<rect x="104" y="198" width="28" height="20" style="fill:var(--bg-tertiary); stroke:var(--rule2); stroke-width:1; stroke-dasharray:3 2"/>
<g style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.4">
<rect x="168" y="198" width="28" height="20"/><rect x="200" y="198" width="28" height="20"/><rect x="232" y="198" width="28" height="20"/></g>
<g style="fill:var(--bg-secondary); stroke:var(--accent-primary); stroke-width:2">
<rect x="136" y="198" width="28" height="20"/><rect x="264" y="198" width="28" height="20"/></g>
<g style="fill:var(--bg-tertiary); stroke:var(--rule2); stroke-width:1; stroke-dasharray:3 2">
<rect x="296" y="198" width="28" height="20"/><rect x="328" y="198" width="28" height="20"/></g>
<text x="118" y="212" style="font-size:12.5px; fill:var(--text-muted); text-anchor:middle; font-family:var(--font-mono)">2</text>
<g style="font-size:12.5px; fill:var(--text-primary); text-anchor:middle; font-family:var(--font-mono)">
<text x="150" y="212">5</text><text x="182" y="212">8</text><text x="214" y="212">12</text><text x="246" y="212">16</text><text x="278" y="212">23</text></g>
<g style="font-size:12.5px; fill:var(--text-muted); text-anchor:middle; font-family:var(--font-mono)">
<text x="310" y="212">38</text><text x="342" y="212">45</text></g>
<line x1="150" y1="226" x2="150" y2="220" style="stroke:var(--accent-primary); stroke-width:1.6" marker-end="url(#ca7-arr)"/>
<line x1="278" y1="226" x2="278" y2="220" style="stroke:var(--accent-primary); stroke-width:1.6" marker-end="url(#ca7-arr)"/>
<text x="150" y="236" style="font-size:11px; fill:var(--accent-primary); text-anchor:middle; font-family:var(--font-mono)">L</text>
<text x="278" y="236" style="font-size:11px; fill:var(--accent-primary); text-anchor:middle; font-family:var(--font-mono)">R</text>
<text x="366" y="212" style="font-size:12px; fill:var(--accent-primary); font-family:var(--font-mono)">합 28, 찾음</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">점선으로 흐려진 칸이 후보에서 지워진 값이다. 한 회차에 최소 한 칸씩 지워지므로 회차 수가 값의 개수를 넘지 못한다. 그래서 O(n)이다.</figcaption>
</figure>
</div>

두 포인터는 각자 한 방향으로만 움직입니다. L 은 오른쪽으로만 가고 R 은 왼쪽으로만 가다가 두 포인터가 만나면 끝나므로, 전체 이동 횟수가 값의 개수를 넘지 않아 시간 복잡도가 짝을 전부 만드는 O(n²)에서 O(n)으로 줄어듭니다. 값이 십만 개라면 짝을 전부 만들 때 50억 번 비교하던 일을 투 포인터는 포인터 이동 십만 번 안에 끝냅니다.

**정렬이 전제라는 것을 잊으면 안 됩니다.** 정렬돼 있지 않으면 「남은 값은 전부 L 의 값보다 크거나 같다」가 성립하지 않아 지우면 안 되는 값을 지울 수 있으므로 먼저 정렬해야 합니다. 그러면 정렬 때문에 O(n log n)이 되지만 그래도 O(n²)보다는 훨씬 쌉니다. 2절 표의 n=100만 칸으로 보면 2,000만번과 1조번의 차이입니다.

## 8. 슬라이딩 윈도우

**연속한 구간을 차례로 볼 때는 구간을 다시 더하지 않습니다. 빠지는 값을 빼고 들어오는 값을 더합니다.**

길이가 3인 구간의 합이 가장 큰 자리를 찾는다고 하겠습니다. 이 길이 3 짜리 구간처럼 차례로 보는 연속 구간을 윈도우라 하고 윈도우를 한 칸씩 옮겨 가며 보는 방법을 **슬라이딩 윈도우**라 합니다. 구간마다 세 개를 다시 더하면 더하는 횟수가 구간 개수에 3 을 곱한 만큼이라 값 8개에 길이 3 이면 구간이 6개여서 6 × 3 = 18번 더합니다. 구간 길이가 커지면 곱하는 수도 그만큼 커집니다.

그런데 옆 구간과 지금 구간은 대부분 겹칩니다. 칸 0~2 의 [3 1 4] 와 칸 1~3 의 [1 4 1] 은 겹치는 칸 1~2 의 1 과 4 가 같고 양 끝의 3 과 1 만 다르므로, 앞에서 빠지는 값을 빼고 뒤에서 들어오는 값을 더하면 됩니다.

아래 블록은 6절과 같은 값 8개에서 길이가 3 인 구간의 합이 가장 큰 자리를 찾습니다. 처음 한 구간만 다 더하고 그다음부터는 빠지는 값과 들어오는 값만 계산하면서 회차마다 구간과 합을 찍습니다.

```python
# 하는 일: 6절과 같은 값 8개에서 길이가 3 인 구간의 합이 가장 큰 자리를 찾는다.

ARR = [3, 1, 4, 1, 5, 9, 2, 6]
K = 3

# 1단계: 첫 구간만 다 더한다
total = sum(ARR[:K])
best, best_at = total, 0
print(f"1회차  칸 0~{K-1}  [{' '.join(str(x) for x in ARR[:K])}]  합 {total:>2}  (처음 한 번만 다 더한다)")

# 2단계: 구간을 한 칸씩 옮긴다
# 옮길 때마다 세 개를 다시 더하지 않는다. 빠지는 값을 빼고 들어오는 값을 더한다.
for i in range(K, len(ARR)):
    out, into = ARR[i - K], ARR[i]
    total += into - out
    win = ARR[i - K + 1:i + 1]
    flag = ""
    if total > best:
        best, best_at = total, i - K + 1
        flag = "  ← 지금까지 최대"
    print(f"{i-K+2}회차  칸 {i-K+1}~{i}  [{' '.join(str(x) for x in win)}]  "
          f"합 {total:>2}  ({out} 빼고 {into} 더함){flag}")

# 3단계: 가장 큰 구간과 더한 횟수를 찍는다
print(f"→ 가장 큰 구간은 칸 {best_at}~{best_at+K-1} 이고 합이 {best} 이다.")
print(f"→ 구간마다 다시 더하면 {(len(ARR)-K+1)*K}번 더한다. 여기서는 {K + (len(ARR)-K)*2}번이었다.")

# 출력:
# 1단계 뜻: 처음 한 번만 세 개를 다 더한다.
# 1회차  칸 0~2  [3 1 4]  합  8  (처음 한 번만 다 더한다)
# 2단계 뜻: 뺄셈 한 번과 덧셈 한 번으로 합을 고친다. 최대가 바뀐 회차에 표시가 붙는다.
# 2회차  칸 1~3  [1 4 1]  합  6  (3 빼고 1 더함)
# 3회차  칸 2~4  [4 1 5]  합 10  (1 빼고 5 더함)  ← 지금까지 최대
# 4회차  칸 3~5  [1 5 9]  합 15  (4 빼고 9 더함)  ← 지금까지 최대
# 5회차  칸 4~6  [5 9 2]  합 16  (1 빼고 2 더함)  ← 지금까지 최대
# 6회차  칸 5~7  [9 2 6]  합 17  (5 빼고 6 더함)  ← 지금까지 최대
# 3단계 뜻: 구간마다 다시 더하면 18번 더할 것을 13번에 끝냈다.
# → 가장 큰 구간은 칸 5~7 이고 합이 17 이다.
# → 구간마다 다시 더하면 18번 더한다. 여기서는 13번이었다.
```

1회차 [3 1 4] 의 합 8 은 처음 한 번만 세 개를 다 더한 값입니다. 2회차부터는 뺄셈 한 번과 덧셈 한 번으로 합을 고치므로 2회차의 합은 3 을 빼고 1 을 더한 8 - 3 + 1 = 6 입니다. 이렇게 한 칸씩 옮겨 가면 6회차의 [9 2 6] 이 합 17 로 가장 큽니다.

블록 마지막 줄대로 구간마다 다시 더하면 18번 더할 것을 슬라이딩 윈도우는 13번에 끝냈습니다. 13번은 첫 구간의 3번에 다섯 번 옮길 때마다 2번씩을 더한 3 + 5 × 2 입니다. 윈도우 길이가 커져도 한 번 옮길 때 드는 일은 뺄셈 한 번과 덧셈 한 번 그대로라서 전체 일은 윈도우 길이와 상관없이 값의 개수에 비례합니다.

아래 그림은 같은 값 위로 윈도우가 옮겨 가는 모양을 보여 줍니다.

<div class="table-wrapper">
<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 500 200" role="img" aria-label="같은 값 여덟 개 위로 길이 3 짜리 윈도우가 세 자리로 옮겨 가는 그림. 첫 자리는 왼쪽 끝, 가운데 자리는 한가운데, 마지막 자리는 오른쪽 끝이고 마지막 자리의 합이 열일곱으로 가장 크다." style="width:100%; max-width:500px; height:auto; font-family:var(--font-sans)">
<g style="font-size:11px; fill:var(--text-muted); text-anchor:middle; font-family:var(--font-mono)">
<text x="118" y="14">0</text><text x="150" y="14">1</text><text x="182" y="14">2</text><text x="214" y="14">3</text>
<text x="246" y="14">4</text><text x="278" y="14">5</text><text x="310" y="14">6</text><text x="342" y="14">7</text></g>
<text x="6" y="40" style="font-size:12px; fill:var(--text-secondary)">1회차</text>
<rect x="102" y="22" width="94" height="24" style="fill:color-mix(in srgb, var(--navy) 12%, transparent); stroke:var(--navy); stroke-width:1.6"/>
<g style="fill:none; stroke:var(--border-color); stroke-width:1.4">
<rect x="104" y="24" width="28" height="20"/><rect x="136" y="24" width="28" height="20"/><rect x="168" y="24" width="28" height="20"/><rect x="200" y="24" width="28" height="20"/>
<rect x="232" y="24" width="28" height="20"/><rect x="264" y="24" width="28" height="20"/><rect x="296" y="24" width="28" height="20"/><rect x="328" y="24" width="28" height="20"/></g>
<g style="font-size:12.5px; fill:var(--text-primary); text-anchor:middle; font-family:var(--font-mono)">
<text x="118" y="38">3</text><text x="150" y="38">1</text><text x="182" y="38">4</text><text x="214" y="38">1</text>
<text x="246" y="38">5</text><text x="278" y="38">9</text><text x="310" y="38">2</text><text x="342" y="38">6</text></g>
<text x="370" y="38" style="font-size:12px; fill:var(--text-muted); font-family:var(--font-mono)">합 8</text>
<text x="6" y="102" style="font-size:12px; fill:var(--text-secondary)">4회차</text>
<rect x="198" y="84" width="94" height="24" style="fill:color-mix(in srgb, var(--navy) 12%, transparent); stroke:var(--navy); stroke-width:1.6"/>
<g style="fill:none; stroke:var(--border-color); stroke-width:1.4">
<rect x="104" y="86" width="28" height="20"/><rect x="136" y="86" width="28" height="20"/><rect x="168" y="86" width="28" height="20"/><rect x="200" y="86" width="28" height="20"/>
<rect x="232" y="86" width="28" height="20"/><rect x="264" y="86" width="28" height="20"/><rect x="296" y="86" width="28" height="20"/><rect x="328" y="86" width="28" height="20"/></g>
<g style="font-size:12.5px; fill:var(--text-primary); text-anchor:middle; font-family:var(--font-mono)">
<text x="118" y="100">3</text><text x="150" y="100">1</text><text x="182" y="100">4</text><text x="214" y="100">1</text>
<text x="246" y="100">5</text><text x="278" y="100">9</text><text x="310" y="100">2</text><text x="342" y="100">6</text></g>
<text x="370" y="100" style="font-size:12px; fill:var(--text-muted); font-family:var(--font-mono)">합 15</text>
<text x="6" y="164" style="font-size:12px; fill:var(--text-secondary)">6회차</text>
<rect x="262" y="146" width="94" height="24" style="fill:color-mix(in srgb, var(--oxide) 12%, transparent); stroke:var(--accent-primary); stroke-width:2.5"/>
<g style="fill:none; stroke:var(--border-color); stroke-width:1.4">
<rect x="104" y="148" width="28" height="20"/><rect x="136" y="148" width="28" height="20"/><rect x="168" y="148" width="28" height="20"/><rect x="200" y="148" width="28" height="20"/>
<rect x="232" y="148" width="28" height="20"/><rect x="264" y="148" width="28" height="20"/><rect x="296" y="148" width="28" height="20"/><rect x="328" y="148" width="28" height="20"/></g>
<g style="font-size:12.5px; fill:var(--text-primary); text-anchor:middle; font-family:var(--font-mono)">
<text x="118" y="162">3</text><text x="150" y="162">1</text><text x="182" y="162">4</text><text x="214" y="162">1</text>
<text x="246" y="162">5</text><text x="278" y="162">9</text><text x="310" y="162">2</text><text x="342" y="162">6</text></g>
<text x="370" y="162" style="font-size:12px; fill:var(--accent-primary); font-family:var(--font-mono)">합 17, 최대</text>
<text x="6" y="192" style="font-size:12.5px; fill:var(--text-muted)">윈도우가 한 칸 옮겨 갈 때 바뀌는 것은 양 끝 하나씩뿐이다. 가운데는 그대로 있다.</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">여섯 자리 중 세 자리만 그렸다. 윈도우의 굵기가 다른 마지막 자리가 합이 가장 큰 곳이다.</figcaption>
</figure>
</div>

윈도우의 길이가 고정이 아닐 수도 있습니다(가변 윈도우). "합이 목표 이상이 되는 가장 짧은 구간" 같은 문제에서는 오른쪽 끝을 오른쪽으로 옮겨 윈도우를 늘리다가 조건을 만족하면 왼쪽 끝도 오른쪽으로 옮겨 줄입니다.

이때도 두 끝은 각자 오른쪽으로만 가므로 끝마다 많아야 n 번 움직입니다. 그래서 겉보기에 반복문이 두 겹이어도 전체는 O(n)입니다. **가변 윈도우는 반복문이 겹친 것만 보고 O(n²)이라 단정하면 안 되는 대표적인 자리입니다.**

## 9. 방법을 고르는 순서

**문제를 읽고 입력 크기를 본 다음, 세 가지를 순서대로 떠올립니다.**

먼저 입력 크기가 허용하는 등급을 정합니다. 2절에서 본 대로 n 이 1,000 이하면 O(n²)인 이중 반복문도 괜찮고 십만이면 O(n)인 한 번 순회나 O(n log n)인 정렬까지입니다. 이 판단이 풀이의 방향을 정합니다.

그다음 자료형을 봅니다. 리스트에 "안에 있나"를 반복해서 묻는다면 집합이나 딕셔너리로 바꾸고 리스트의 맨 앞을 뺀다면 `deque` 로 바꿉니다. 4절에서 봤듯 알고리즘은 그대로 두고 자료형만 바꿔도 풀리는 문제가 있습니다.

마지막으로 배열을 순회하는 세 가지 요령 중 맞는 것을 고릅니다. 구간 합을 여러 번 물으면 누적합을, 정렬된 배열에서 짝을 찾으면 투 포인터를, 연속한 구간을 차례로 보면 슬라이딩 윈도우를 씁니다.

이 순서로 생각하면 대부분의 배열 문제가 정리됩니다. 정렬된 배열이 아닐 때가 남는데 그때는 해시를 씁니다. 다음 편이 그 이야기입니다.

## 한눈 정리

| 상황 | 쓸 것 | 왜 |
|---|---|---|
| "안에 있나"를 반복해서 묻는다 | 집합, 딕셔너리 | 리스트는 앞에서부터 스캔한다 |
| 맨 앞을 자주 뺀다 | `deque` | 리스트는 뒤를 전부 당긴다 |
| 구간 합을 여러 번 묻는다 | 누적합 | 만들 때 한 번, 그 뒤로는 뺄셈 하나 |
| 정렬된 배열에서 짝을 찾는다 | 투 포인터 | 한쪽이 크면 그 값은 어떤 짝에도 크다 |
| 연속한 구간을 차례로 본다 | 슬라이딩 윈도우 | 옆 구간과 양 끝만 다르다 |
| 최댓값, 합계처럼 한 값만 필요하다 | 한 번 순회 | 정렬은 필요 이상으로 비싸다 |

## 헷갈리기 쉬운 점

- **빅오는 실제 시간이 아닙니다.** 기계가 빠르면 전부 빨라집니다. 빅오는 입력이 커질 때의 모양만 말합니다.
- **반복문이 두 겹이라고 다 O(n²)은 아닙니다.** 8절의 가변 윈도우가 그렇습니다. 두 끝이 각자 한 방향으로만 가면 끝마다 이동이 n번을 넘지 않아 전체가 O(n)입니다.
- **투 포인터는 정렬이 전제입니다.** 정렬돼 있지 않은 배열에 그냥 쓰면 답이 틀립니다. 틀린 방법인데도 답이 우연히 맞게 나오는 경우가 있어서 더 위험합니다.
- **누적합 줄은 값 줄보다 한 칸 깁니다.** 맨 앞의 0을 빼먹으면 맨 앞에서 시작하는 구간만 따로 처리해야 합니다.
- **집합은 순서를 잃습니다.** 순서가 필요한데 집합으로 바꾸면 다른 문제가 생깁니다. 순서와 빠른 조회가 둘 다 필요하면 딕셔너리를 씁니다.
- **시간을 줄이면 대체로 메모리를 더 씁니다.** 메모리 제한이 빡빡한 문제에서는 이 맞바꿈을 되돌려야 할 수도 있습니다.

## 더 깊이 보기

- 다음 편에서는 정렬돼 있지 않은 배열을 다룹니다. 해시로 한 번에 찾는 법과, 정렬이 먼저인 문제들입니다.
- 구간을 절반씩 줄이는 이야기는 그다음 편입니다. 이 글의 투 포인터와 닮았지만 한 번에 절반을 지웁니다.
- 같은 "구간을 좁혀 답을 찾는" 구조가 광고 입찰가 최적화에도 쓰입니다. [Bid Shading](post.html?id=bid-shading-censored) 4절의 황금 비율 탐색이 그 예입니다.
