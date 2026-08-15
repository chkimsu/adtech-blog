지훈은 코딩 테스트에서 문제를 다 풀었고 예제 입력 세 개가 전부 맞았다. 제 노트북에서는 눈 깜짝할 사이에 끝났는데, 제출하니 시간 초과가 떴다.

코드를 다시 봐도 틀린 곳이 없고, 실제로 틀리지도 않았다. 답은 맞는데 채점 서버가 기다려 주지 않은 것뿐이다. 예제 입력은 숫자가 열 개였고 채점 입력은 십만 개였다.

**돌아가는 코드와 통과하는 코드는 무엇이 다를까?**

다른 것은 입력이 커질 때 시간이 어떻게 늘어나느냐다. 이것을 재는 자를 **복잡도**라고 부른다. 코딩 테스트에서 떨어지는 자리의 상당수가 알고리즘을 몰라서가 아니라, 자기 코드가 어느 자에 놓이는지 몰라서다.

> **한 줄 요약:** 입력이 두 배가 될 때 시간이 두 배가 되는 코드와 네 배가 되는 코드는 다른 종류다. 그 차이는 십만 개짜리 입력에서 0.4밀리초와 15분으로 벌어진다.

> **골라 읽는 법** — 절이 아홉 개인 글입니다. 처음부터 다 읽지 않아도 됩니다.
>
> - 시간이 어떻게 늘어나는지 직접 재는 것만 → 앞의 두 절
> - 파이썬 자료형 고르는 법만 → 자료형 절
> - 배열 훑는 세 가지 요령만 → 한 번 훑기부터 창 미끄러뜨리기까지
> - 어느 것을 언제 쓰나 → 마지막 절

---

## 1. 얼마나 걸리는지 직접 재 본다

**입력을 두 배로 키워 보면 코드가 어느 종류인지 바로 드러난다.**

문제를 하나 정하자. 정수 목록에 같은 값이 두 번 나오는지 보는 일이다. 방법은 둘이다. 짝을 전부 만들어 비교할 수도 있고, 이미 본 값을 따로 적어 두고 목록을 한 번만 훑을 수도 있다.

둘 다 답은 맞으니 예제 입력에서는 차이가 전혀 안 보인다. 차이를 보려면 입력을 키우면서 시간을 재야 한다.

```python
# 같은 문제를 두 방법으로 풀고, n 을 두 배씩 키우며 걸린 시간을 잰다.
#
# 문제 — 정수 목록에 같은 값이 두 번 나오나?
#   방법 A: 짝을 전부 만들어 비교한다
#   방법 B: 이미 본 값을 집합에 넣어 두고 목록을 한 번만 훑는다
#
# 아래 시간은 노트북 한 대에서 잰 값이라 기계마다 다르다. 볼 것은 절대 시간이 아니라
# "n 이 두 배가 되면 시간이 몇 배가 되나" 다. 목록은 중복이 없게 만들어 두 방법 다
# 끝까지 훑게 했다. 그래야 가장 오래 걸리는 경우를 잰다.

import random
from time import perf_counter

def dup_pairs(nums):                  # 짝을 전부 만든다
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] == nums[j]:
                return True
    return False

def dup_set(nums):                    # 한 번만 훑는다
    seen = set()
    for x in nums:
        if x in seen:
            return True
        seen.add(x)
    return False

def took(fn, nums, repeat=3):         # 가장 빨랐던 회차를 쓴다. 잡음을 줄이려고
    best = float('inf')
    for _ in range(repeat):
        t0 = perf_counter()
        fn(nums)
        best = min(best, perf_counter() - t0)
    return best

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

# 출력:
#       n      짝 전부(ms)     배수      집합(ms)     배수
#    1000          14.2      -       0.043      -
#    2000          56.1   3.9배       0.099   2.3배
#    4000         227.2   4.0배       0.186   1.9배
#    8000         870.3   3.8배       0.397   2.1배
```

밀리초 값은 기계마다 다르게 나오니 배수 칸만 보면 되는데, 왼쪽은 계속 4배 근처이고 오른쪽은 계속 2배 근처다. n을 두 배로 했으니, 한쪽은 두 배로 늘고 다른 쪽은 네 배로 느는 것이다.

그 차이가 쌓이면 n이 8,000일 때 870.3밀리초와 0.397밀리초가 되어, 이미 2,000배 넘게 벌어진다.

<div class="table-wrapper">
<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 500 150" role="img" aria-label="n 이 1000·2000·4000·8000 으로 두 배씩 커질 때 짝을 전부 만드는 방법의 걸린 시간을 막대로 그린 그림. 막대 길이가 매번 네 배 가까이 길어져 마지막 막대가 첫 막대의 예순한 배다." style="width:100%; max-width:500px; height:auto; font-family:var(--font-sans)">
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
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">같은 자에 집합 쪽을 그리면 가장 긴 것도 0.14픽셀이라 선이 아예 안 보인다. 두 방법을 한 그림에 담을 수 없다는 것이 이 절의 요점이다.</figcaption>
</figure>
</div>

이 자가 코딩 테스트의 합격선을 정한다. 채점 입력이 십만 개라면 왼쪽 방법은 15분쯤 걸리는데, 제한 시간은 보통 몇 초뿐이다.

## 2. 두 배가 되나 네 배가 되나

**입력이 커질 때 시간이 어떻게 느는지만 남기고 나머지를 버린 표기가 빅오다.**

1절에서 잰 두 방법에 이름을 붙이자. 한 번만 훑는 쪽은 입력 개수에 비례해서 늘고, 이것을 **O(n)** 이라 쓴다. 짝을 전부 만드는 쪽은 개수의 제곱에 비례하니 이것이 **O(n²)** 다.

빅오는 실제 시간을 말하지 않는다. 노트북이 빠르면 전부 빨라지고 파이썬 대신 C를 쓰면 또 전부 빨라진다. 빅오가 말하는 것은 **입력이 커질 때 어떤 모양으로 늘어나느냐** 하나뿐이다.

그래서 상수와 낮은 항은 버려서, 3n + 100 도 O(n)이고 n 도 그냥 O(n)이다. n이 충분히 커지면 3배와 100은 제곱 앞에서 아무 의미가 없기 때문이다.

| 이름 | n이 두 배가 되면 | n=100만이면 대략 | 어디서 보나 |
|---|---|---|---|
| O(1) | 그대로 | 1번 | 리스트 인덱스 접근, 딕셔너리 조회 |
| O(log n) | 한 번 더 | 20번 | 이분탐색, 균형 잡힌 트리 |
| O(n) | 두 배 | 100만번 | 한 번 훑기, 최댓값 찾기 |
| O(n log n) | 두 배 조금 넘게 | 2,000만번 | 정렬 |
| O(n²) | 네 배 | 1조번 | 짝을 전부 만들기, 이중 반복문 |

가운데 칸이 실무 감각이다. 코딩 테스트 입력이 십만 개면 O(n log n)까지는 대체로 통과하고 O(n²)은 대체로 떨어진다. 문제에 적힌 입력 크기가 곧 "어느 줄까지 허용되는가"를 알려 주는 셈이다.

그래서 문제를 읽을 때 입력 크기부터 본다. n이 1,000 이하라면 이중 반복문을 써도 된다. n이 십만이면 처음부터 한 번 훑는 방법을 찾아야 한다.

## 3. 시간을 줄이려고 자리를 쓴다

**1절의 빠른 쪽이 빨랐던 이유는 본 값을 따로 적어 두었기 때문이다. 그 적어 두는 자리가 비용이다.**

`dup_set` 은 `seen` 이라는 집합을 하나 더 만든다. 최악의 경우 이 집합에 입력 전부가 들어가니, 입력 개수만큼 자리를 더 쓰는 셈이다. 이것을 **공간 복잡도 O(n)** 이라 한다.

짝을 전부 만드는 쪽은 반복문 변수 둘 말고는 새 자리를 안 써서 O(1)이다. 시간은 훨씬 오래 걸리지만 메모리는 덜 쓴다.

이 맞바꿈이 알고리즘 문제의 기본 축이다. **대체로 시간을 줄이려면 자리를 더 쓴다.** 6절의 누적합도, 2편에서 다룰 해시도 전부 이 축 위에 있다.

코딩 테스트에서 메모리 제한에 걸리는 일은 시간 제한보다 드물다. 그래서 우선은 시간을 줄이는 쪽으로 생각하고, 메모리가 문제가 되면 그때 되돌린다.

## 4. 어느 자료형을 쓰느냐로 갈린다

**알고리즘을 바꾸지 않아도 자료형만 바꿔서 시간 초과가 풀리는 경우가 있다.**

파이썬에서 `x in 리스트` 와 `x in 집합` 은 겉모습이 같고 하는 일도 같아 보이지만, 속은 전혀 다르다. 리스트는 앞에서부터 하나씩 비교하고, 집합은 값에서 자리를 계산해 한 번에 간다.

`리스트.pop(0)` 도 마찬가지인데, 맨 앞을 빼면 뒤에 있는 것들이 전부 한 칸씩 앞으로 당겨진다. `deque` 는 양끝을 떼도록 만들어져서 당기는 일이 없다.

```python
# 같은 일을 어느 자료형으로 하느냐에 따라 시간이 갈린다.
# 코딩 테스트에서 시간 초과가 나는 자리의 상당수가 여기다.
#
# 두 짝을 잰다.
#   "안에 있나" — list 는 앞에서부터 훑고, set 은 해시로 한 번에 간다
#   "맨 앞을 뺀다" — list 는 나머지를 전부 한 칸씩 당기고, deque 는 그냥 뗀다
#
# n = 100,000 이고 시간은 노트북 한 대에서 잰 값이다.

from collections import deque
from time import perf_counter

N = 100_000
LOOKUPS = 1_000

data = list(range(N))
as_list, as_set = data, set(data)

t0 = perf_counter()
for i in range(LOOKUPS):
    (N - 1) in as_list          # 항상 맨 끝 — 끝까지 훑는다
list_in = (perf_counter() - t0) * 1000

t0 = perf_counter()
for i in range(LOOKUPS):
    (N - 1) in as_set
set_in = (perf_counter() - t0) * 1000

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

print(f"{'하는 일':<22}{'list(ms)':>11}{'다른 쪽(ms)':>14}{'몇 배':>9}")
print(f"{'안에 있나 (1,000번)':<22}{list_in:>11.1f}{set_in:>14.2f}{list_in/set_in:>8.0f}배")
print(f"{'맨 앞 빼기 (100,000번)':<20}{list_pop:>11.1f}{deque_pop:>14.2f}{list_pop/deque_pop:>8.0f}배")

# 출력:
# 하는 일                     list(ms)      다른 쪽(ms)      몇 배
# 안에 있나 (1,000번)              558.6          0.05   11303배
# 맨 앞 빼기 (100,000번)         685.7          2.95     232배
```

`as_list` 를 `as_set` 으로 바꾼 한 줄이 전부인데 11,303배 차이가 난다.

외울 것은 짧다. **"안에 있나"를 반복해서 물으면 집합이나 딕셔너리에 담고, 맨 앞을 빼야 하면 `deque` 를 쓴다.** 이 둘만 지켜도 시간 초과의 상당수가 사라진다.

다만 집합은 순서를 잃고 자리를 더 쓰니, 3절에서 본 맞바꿈이 여기서도 그대로 나온다.

## 5. 한 번만 훑어서 끝내기

**배열 문제의 기본형은 "처음부터 끝까지 한 번 지나가면서 필요한 것을 들고 간다"다.**

최댓값을 찾는 일을 생각하자. 정렬한 뒤 마지막을 보면 O(n log n)이다. 그냥 한 번 훑으면서 지금까지 본 것 중 가장 큰 값을 들고 가면 O(n)이다. 답은 같은데 한쪽이 더 싸다.

들고 가는 것이 하나일 필요도 없다. 최댓값과 최솟값을 같이 들고 가면 한 번 훑어서 둘 다 얻고, 합계와 개수를 들고 가면 그 자리에서 평균이 나온다.

**요령은 "무엇을 들고 가면 되돌아보지 않아도 되나"를 찾는 것이다.** 되돌아봐야 한다면 그 순간 O(n²)이 된다. 7절과 8절은 이 질문에 답하는 두 가지 정형화된 방법이다.

## 6. 구간 합을 미리 만들어 두기

**구간의 합을 여러 번 물어볼 거라면, 앞에서부터의 합을 한 줄 만들어 두고 뺄셈으로 답한다.**

배열의 2번 칸부터 5번 칸까지 더하라는 질문이 온다. 매번 그 구간을 훑으면 질문 하나에 구간 길이만큼 걸리고, 질문이 십만 번이면 그만큼 곱해진다.

대신 앞에서부터의 누적 합을 미리 한 줄 만들어 둔다. 그러면 어떤 구간이든 뺄셈 한 번으로 나온다. 만드는 데 O(n)이 들고, 그 뒤로는 질문마다 O(1)이다.

```python
# 구간의 합을 여러 번 물어볼 때, 매번 더하면 물어본 횟수만큼 훑는다.
# 미리 "앞에서부터의 합"을 한 줄 만들어 두면 뺄셈 한 번으로 끝난다.
#
# 아래 여덟 값은 설명을 위해 지어낸 것이다.

ARR = [3, 1, 4, 1, 5, 9, 2, 6]

# 누적합: pre[i] = ARR 의 앞 i 개를 더한 값. 앞에 0 을 하나 두는 것이 요령이다.
pre = [0]
for x in ARR:
    pre.append(pre[-1] + x)

print("칸    ", " ".join(f"{i:>3}" for i in range(len(ARR))))
print("값    ", " ".join(f"{x:>3}" for x in ARR))
print("누적합", " ".join(f"{x:>3}" for x in pre))
print()

for lo, hi in [(2, 5), (0, 3), (5, 7)]:
    direct = sum(ARR[lo:hi + 1])
    fast = pre[hi + 1] - pre[lo]
    print(f"{lo}~{hi} 칸의 합  더해서 {direct:>2}  ·  누적합으로 pre[{hi+1}]-pre[{lo}] = "
          f"{pre[hi+1]}-{pre[lo]} = {fast:>2}  {'같다' if direct == fast else '다르다'}")

# 출력:
# 칸       0   1   2   3   4   5   6   7
# 값       3   1   4   1   5   9   2   6
# 누적합   0   3   4   8   9  14  23  25  31
#
# 2~5 칸의 합  더해서 19  ·  누적합으로 pre[6]-pre[2] = 23-4 = 19  같다
# 0~3 칸의 합  더해서  9  ·  누적합으로 pre[4]-pre[0] = 9-0 =  9  같다
# 5~7 칸의 합  더해서 17  ·  누적합으로 pre[8]-pre[5] = 31-14 = 17  같다
```

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

맨 앞에 0을 하나 두는 것이 요령인데, 그래야 0번 칸부터 시작하는 구간도 뺄셈 하나로 처리된다. 이 0이 없으면 구간이 맨 앞에서 시작할 때만 따로 처리해야 한다.

:::deep 더 깊이 — 2차원으로 늘리면
가로세로가 있는 표에서도 같은 것을 만들 수 있다. `pre[i][j]` 를 "왼쪽 위 구석에서 (i, j)까지의 합"으로 두면, 임의의 직사각형 합이 덧셈 하나와 뺄셈 둘로 나온다.

```
직사각형 합 = pre[하][우] - pre[상][우] - pre[하][좌] + pre[상][좌]
```

마지막에 다시 더하는 항이 있는 이유는, 두 번 뺀 영역이 겹치기 때문이다. 겹친 만큼 한 번 돌려주는 셈인데, 이 꼴을 포함배제라 부르고 격자 문제에서 자주 나온다.
:::

## 7. 양 끝에서 좁혀 오기

**정렬된 배열에서 두 값을 고르는 문제는 양 끝에 손가락 두 개를 두고 좁혀 오면 한 번 훑기로 끝난다.**

두 수를 더해 목표값이 되는 짝을 찾는 문제를 보자. 짝을 전부 만들면 값이 여덟 개일 때 28번 비교하지만, 값이 십만 개면 50억 번이 된다.

정렬돼 있다면 훨씬 싸게 할 수 있다. 먼저 왼쪽 끝과 오른쪽 끝을 더해 보고, 목표보다 크면 오른쪽을 하나 당기고 작으면 왼쪽을 하나 민다.

이게 되는 이유가 중요하다. **합이 목표보다 크다면, 오른쪽 값은 어떤 왼쪽 값과 짝지어도 너무 크다.** 왼쪽에 남은 값은 전부 지금 값보다 크거나 같기 때문이다. 그래서 오른쪽 값은 후보에서 통째로 지워도 된다.

```python
# 정렬된 배열에서 두 수를 더해 목표값이 되는 짝을 찾는다.
# 짝을 전부 만들면 28번 비교하지만, 양 끝에서 좁혀 오면 4번이면 끝난다.
#
# 아래 여덟 값은 설명을 위해 지어낸 것이고 오름차순으로 정렬돼 있다.
# 정렬돼 있다는 것이 이 방법의 전제다. 안 되어 있으면 먼저 정렬해야 한다.

ARR = [2, 5, 8, 12, 16, 23, 38, 45]
TARGET = 28

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

print(f"목표 {TARGET}")
found = two_sum_sorted(ARR, TARGET)
print(f"→ 칸 {found[0]}·{found[1]} 의 {ARR[found[0]]} + {ARR[found[1]]} = {TARGET}")
print(f"→ 짝을 전부 만들면 {len(ARR)*(len(ARR)-1)//2}번 비교한다. 여기서는 4번이었다.")

# 출력:
# 목표 28
# 1회차  L=0( 2)  R=7(45)  합 47  크다 → 오른쪽을 당긴다
# 2회차  L=0( 2)  R=6(38)  합 40  크다 → 오른쪽을 당긴다
# 3회차  L=0( 2)  R=5(23)  합 25  작다 → 왼쪽을 민다
# 4회차  L=1( 5)  R=5(23)  합 28  찾음
# → 칸 1·5 의 5 + 23 = 28
# → 짝을 전부 만들면 28번 비교한다. 여기서는 4번이었다.
```

<div class="table-wrapper">
<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 500 250" role="img" aria-label="네 회차를 위에서 아래로 쌓은 그림. 회차마다 값 여덟 개가 칸으로 놓여 있고 왼쪽 손가락 L 과 오른쪽 손가락 R 이 화살표로 표시된다. 회차가 갈수록 두 손가락 사이가 좁아지고 네 번째 회차에서 합이 스물여덟이 되어 찾는다." style="width:100%; max-width:500px; height:auto; font-family:var(--font-sans)">
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
<text x="366" y="38" style="font-size:12px; fill:var(--text-muted); font-family:var(--font-mono)">합 47 · 크다</text>
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
<text x="366" y="96" style="font-size:12px; fill:var(--text-muted); font-family:var(--font-mono)">합 40 · 크다</text>
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
<text x="366" y="154" style="font-size:12px; fill:var(--text-muted); font-family:var(--font-mono)">합 25 · 작다</text>
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
<text x="366" y="212" style="font-size:12px; fill:var(--accent-primary); font-family:var(--font-mono)">합 28 · 찾음</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">점선으로 흐려진 칸이 후보에서 지워진 값이다. 한 회차에 최소 한 칸씩 지워지므로 회차 수가 값의 개수를 넘지 못한다. 그래서 O(n)이다.</figcaption>
</figure>
</div>

두 손가락은 각자 한 방향으로만 움직여서, 왼쪽은 오른쪽으로만 가고 오른쪽은 왼쪽으로만 간다. 그래서 둘이 만나면 끝이고, 전체 이동 횟수가 값의 개수를 넘지 않는다.

**정렬이 전제라는 것을 잊으면 안 된다.** 정렬돼 있지 않으면 먼저 정렬해야 하고 그러면 O(n log n)이 되지만, 그래도 O(n²)보다는 훨씬 싸다.

## 8. 창을 미끄러뜨리기

**연속한 구간을 차례로 볼 때는 구간을 다시 더하지 않는다. 빠지는 값을 빼고 들어오는 값을 더한다.**

길이가 3인 구간의 합이 가장 큰 자리를 찾는다고 하자. 구간마다 세 개씩 다시 더하면 구간 개수만큼 곱해진다. 구간 길이가 커지면 그만큼 더 곱해진다.

그런데 옆 구간과 지금 구간은 대부분 겹친다. 다른 것은 양 끝 하나씩뿐이니, 앞에서 빠지는 값을 빼고 뒤에서 들어오는 값을 더하면 된다.

```python
# 길이가 3 인 구간의 합이 가장 큰 자리를 찾는다.
# 구간을 옮길 때마다 세 개를 다시 더하지 않는다. 빠지는 값을 빼고 들어오는 값을 더한다.
#
# 값은 6절과 같은 여덟 개다.

ARR = [3, 1, 4, 1, 5, 9, 2, 6]
K = 3

total = sum(ARR[:K])
best, best_at = total, 0
print(f"1회차  칸 0~{K-1}  [{' '.join(str(x) for x in ARR[:K])}]  합 {total:>2}  (처음 한 번만 다 더한다)")

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

print(f"→ 가장 큰 구간은 칸 {best_at}~{best_at+K-1} 이고 합이 {best} 이다.")
print(f"→ 구간마다 다시 더하면 {(len(ARR)-K+1)*K}번 더한다. 여기서는 {K + (len(ARR)-K)*2}번이었다.")

# 출력:
# 1회차  칸 0~2  [3 1 4]  합  8  (처음 한 번만 다 더한다)
# 2회차  칸 1~3  [1 4 1]  합  6  (3 빼고 1 더함)
# 3회차  칸 2~4  [4 1 5]  합 10  (1 빼고 5 더함)  ← 지금까지 최대
# 4회차  칸 3~5  [1 5 9]  합 15  (4 빼고 9 더함)  ← 지금까지 최대
# 5회차  칸 4~6  [5 9 2]  합 16  (1 빼고 2 더함)  ← 지금까지 최대
# 6회차  칸 5~7  [9 2 6]  합 17  (5 빼고 6 더함)  ← 지금까지 최대
# → 가장 큰 구간은 칸 5~7 이고 합이 17 이다.
# → 구간마다 다시 더하면 18번 더한다. 여기서는 13번이었다.
```

<div class="table-wrapper">
<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 500 200" role="img" aria-label="같은 값 여덟 개 위로 길이 3 짜리 창이 세 자리로 옮겨 가는 그림. 첫 자리는 왼쪽 끝, 가운데 자리는 한가운데, 마지막 자리는 오른쪽 끝이고 마지막 자리의 합이 열일곱으로 가장 크다." style="width:100%; max-width:500px; height:auto; font-family:var(--font-sans)">
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
<text x="370" y="162" style="font-size:12px; fill:var(--accent-primary); font-family:var(--font-mono)">합 17 · 최대</text>
<text x="6" y="192" style="font-size:12.5px; fill:var(--text-muted)">창이 한 칸 옮겨 갈 때 바뀌는 것은 양 끝 하나씩뿐이다. 가운데는 그대로 있다.</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">여섯 자리 중 세 자리만 그렸다. 창의 굵기가 다른 마지막 자리가 합이 가장 큰 곳이다.</figcaption>
</figure>
</div>

창의 길이가 고정이 아닐 수도 있다. "합이 목표 이상이 되는 가장 짧은 구간" 같은 문제에서는 오른쪽 끝을 밀어 창을 늘리다가, 조건을 만족하면 왼쪽 끝을 당겨 줄인다.

이때도 두 끝은 각자 한 방향으로만 가므로, 겉보기에 반복문이 두 겹이어도 전체는 O(n)이다. **반복문 겹침만 보고 O(n²)이라 단정하면 안 되는 대표적인 자리다.**

## 9. 어느 것을 언제 쓰나

**문제를 읽고 입력 크기를 본 다음, 세 가지를 순서대로 떠올린다.**

먼저 입력 크기가 허용하는 줄을 정한다. n이 천 이하면 이중 반복문도 괜찮고, 십만이면 한 번 훑기나 정렬까지다. 이 판단이 방향을 정한다.

그다음 자료형을 본다. "안에 있나"를 반복해서 묻는다면 집합이나 딕셔너리로 바꾸고, 맨 앞을 뺀다면 `deque` 로 바꾼다. 4절에서 봤듯 이것만으로 풀리는 문제가 있다.

마지막으로 배열을 훑는 요령 셋 중 맞는 것을 고른다. 구간 합을 여러 번 물으면 누적합이고, 정렬된 배열에서 짝을 찾으면 양 끝 좁히기이며, 연속한 구간을 차례로 보면 창 미끄러뜨리기다.

이 순서로 생각하면 대부분의 배열 문제가 정리된다. 남은 것은 정렬된 배열이 아닐 때인데, 그때 쓰는 것이 해시다. 다음 편이 그 이야기다.

## 한눈 정리

| 상황 | 쓸 것 | 왜 |
|---|---|---|
| "안에 있나"를 반복해서 묻는다 | 집합·딕셔너리 | 리스트는 앞에서부터 훑는다 |
| 맨 앞을 자주 뺀다 | `deque` | 리스트는 뒤를 전부 당긴다 |
| 구간 합을 여러 번 묻는다 | 누적합 | 만들 때 한 번, 그 뒤로는 뺄셈 하나 |
| 정렬된 배열에서 짝을 찾는다 | 양 끝에서 좁히기 | 한쪽이 크면 그 값은 어떤 짝에도 크다 |
| 연속한 구간을 차례로 본다 | 창 미끄러뜨리기 | 옆 구간과 양 끝만 다르다 |
| 최댓값·합계처럼 한 값만 필요하다 | 한 번 훑기 | 정렬은 필요 이상으로 비싸다 |

## 헷갈리기 쉬운 점

- **빅오는 실제 시간이 아니다.** 기계가 빠르면 전부 빨라진다. 빅오가 말하는 것은 입력이 커질 때의 모양뿐이다.
- **반복문이 두 겹이라고 다 O(n²)은 아니다.** 8절의 가변 창이 그렇다. 두 끝이 각자 한 방향으로만 가면 전체 이동은 n번을 넘지 않는다.
- **양 끝 좁히기는 정렬이 전제다.** 정렬돼 있지 않은 배열에 그냥 쓰면 답이 틀린다. 틀린 답이 우연히 맞는 경우가 있어서 더 위험하다.
- **누적합은 값보다 하나 길다.** 맨 앞의 0을 빼먹으면 맨 앞에서 시작하는 구간만 따로 처리해야 한다.
- **집합은 순서를 잃는다.** 순서가 필요한데 집합으로 바꾸면 다른 문제가 생긴다. 순서와 빠른 조회가 둘 다 필요하면 딕셔너리를 쓴다.
- **시간을 줄이면 대체로 자리를 더 쓴다.** 메모리 제한이 빡빡한 문제에서는 이 맞바꿈을 되돌려야 할 수도 있다.

## 더 깊이 보기

- 다음 편에서는 정렬돼 있지 않은 배열을 다룬다. 해시로 한 번에 찾는 법과, 정렬이 먼저인 문제들이다.
- 구간을 절반씩 줄이는 이야기는 그다음 편이다. 이 글의 양 끝 좁히기와 닮았지만 전제가 다르다.
- 같은 "구간을 좁혀 답을 찾는" 구조가 광고 입찰가 최적화에도 쓰인다. [Bid Shading & Censored Data](post.html?id=bid-shading-censored)의 황금분할 탐색이 그 예다.
