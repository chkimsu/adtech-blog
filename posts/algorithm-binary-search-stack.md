지훈은 이분 탐색을 안다. 코드도 외워서 쓴다. 그런데 제출하면 절반쯤은 틀린다.

문제는 알고리즘이 아니었다. 어떤 날은 `while lo <= hi` 라 쓰고 어떤 날은 `while lo < hi` 라 쓰는데, 왜 그렇게 쓰는지를 몰랐다. 그래서 중복이 있는 배열에서 답이 한 칸 어긋나면 어디를 고쳐야 할지 감이 안 왔다.

**같은 알고리즘인데 왜 부등호 하나로 답이 달라질까?**

이분 탐색은 코드가 다섯 줄뿐이라 배우기는 쉽고 맞히기는 어렵다. 이 글은 그 다섯 줄의 **경계 조건**을 네 가지 변형으로 갈라서 본다. 뒤이어 스택과 덱을 다루는데, 셋 다 "지금 볼 후보를 어떻게 줄이느냐"라는 같은 물음에 대한 다른 답이다.

> **한 줄 요약:** 이분 탐색은 값을 찾는 도구가 아니라 **경계를 찾는 도구**다. 경계를 어디까지 남기느냐를 정하는 것이 `hi` 초기값과 부등호이고, 그 둘만 정확히 알면 변형을 외울 필요가 없다.

> **골라 읽는 법** — 절이 열 개인 글입니다.
>
> - 이분 탐색의 경계 조건만 → 앞의 세 절
> - 배열이 아닌 것에 이분 탐색 쓰기 → 파라메트릭 서치와 회전 배열
> - 스택 이야기만 → 여섯째 절부터
> - 창 최댓값을 O(n)으로 → 마지막 두 절

---

## 1. 절반씩 지운다

**정렬된 배열에서는 가운데 값 하나만 보고 나머지 절반을 통째로 버릴 수 있다.**

값이 열둘인 배열에서 38을 찾는다고 하자. 가운데 값을 봤더니 23이었다. 배열이 정렬돼 있으니 23보다 왼쪽에 있는 값들은 전부 23 이하이고, 따라서 38일 수가 없다. 왼쪽 절반은 한 번도 안 보고 지워도 된다.

```python
ARR = [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91, 100]
TARGET = 38

print(f"찾는 값 {TARGET} · 값 {len(ARR)}개")
print(f"{'회차':<5}{'lo':>4}{'hi':>4}{'mid':>5}{'ARR[mid]':>10}   {'판정':<12}{'남은 후보'}")
lo, hi, k = 0, len(ARR) - 1, 0
while lo <= hi:
    k += 1
    mid = (lo + hi) // 2
    v = ARR[mid]
    if v == TARGET:
        print(f"{k:<5}{lo:>4}{hi:>4}{mid:>5}{v:>10}   {'같다 → 찾음':<12}-")
        break
    elif v < TARGET:
        lo = mid + 1
        판정 = "작다 → 오른쪽"
    else:
        hi = mid - 1
        판정 = "크다 → 왼쪽"
    print(f"{k:<5}{lo:>4}{hi:>4}{mid:>5}{v:>10}   {판정:<12}{hi-lo+1}개")
print(f"\n{len(ARR)}개를 {k}회에 찾았다 · 앞에서부터 훑었다면 {ARR.index(TARGET)+1}회")
```

```
찾는 값 38 · 값 12개
회차     lo  hi  mid  ARR[mid]   판정          남은 후보
1       6  11    5        23   작다 → 오른쪽    6개
2       6   7    8        56   크다 → 왼쪽     2개
3       6   7    6        38   같다 → 찾음     -

12개를 3회에 찾았다 · 앞에서부터 훑었다면 7회
```

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 500 200" role="img" aria-label="세 회차를 위에서 아래로 쌓은 그림. 회차마다 열두 칸이 놓여 있고, 지워진 칸은 흐리게 남은 후보는 진하게 표시된다. 회차가 갈수록 진한 칸이 열둘에서 여섯, 둘로 줄고 마지막에 한 칸이 굵게 표시된다." style="width:100%; max-width:500px; height:auto; font-family:var(--font-sans)">
<text x="6" y="14" style="font-size:12.5px; fill:var(--text-secondary)">찾는 값 38 — 회차마다 남은 후보가 절반으로 준다</text>
<text x="6" y="34" style="font-size:10.5px; fill:var(--text-muted); font-family:var(--font-mono)">칸 번호</text>
<g style="font-size:10.5px; fill:var(--text-muted); text-anchor:middle; font-family:var(--font-mono)">
<text x="88" y="34">0</text><text x="120" y="34">1</text><text x="152" y="34">2</text><text x="184" y="34">3</text>
<text x="216" y="34">4</text><text x="248" y="34">5</text><text x="280" y="34">6</text><text x="312" y="34">7</text>
<text x="344" y="34">8</text><text x="376" y="34">9</text><text x="408" y="34">10</text><text x="440" y="34">11</text></g>
<g style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.2">
<rect x="74" y="42" width="28" height="18"/><rect x="106" y="42" width="28" height="18"/><rect x="138" y="42" width="28" height="18"/>
<rect x="170" y="42" width="28" height="18"/><rect x="202" y="42" width="28" height="18"/>
<rect x="266" y="42" width="28" height="18"/><rect x="298" y="42" width="28" height="18"/><rect x="330" y="42" width="28" height="18"/>
<rect x="362" y="42" width="28" height="18"/><rect x="394" y="42" width="28" height="18"/><rect x="426" y="42" width="28" height="18"/></g>
<g style="font-size:10.5px; fill:var(--text-primary); text-anchor:middle; font-family:var(--font-mono)">
<text x="88" y="55">2</text><text x="120" y="55">5</text><text x="152" y="55">8</text><text x="184" y="55">12</text>
<text x="216" y="55">16</text><text x="280" y="55">38</text><text x="312" y="55">45</text>
<text x="344" y="55">56</text><text x="376" y="55">72</text><text x="408" y="55">91</text><text x="440" y="55">100</text></g>
<rect x="234" y="42" width="28" height="18" style="fill:var(--bg-tertiary); stroke:var(--accent-secondary); stroke-width:2"/>
<text x="248" y="55" style="font-size:10.5px; fill:var(--accent-secondary); text-anchor:middle; font-family:var(--font-mono)">23</text>
<g style="opacity:0.3">
<g style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.2">
<rect x="74" y="80" width="28" height="18"/><rect x="106" y="80" width="28" height="18"/><rect x="138" y="80" width="28" height="18"/>
<rect x="170" y="80" width="28" height="18"/><rect x="202" y="80" width="28" height="18"/><rect x="234" y="80" width="28" height="18"/></g>
<g style="font-size:10.5px; fill:var(--text-primary); text-anchor:middle; font-family:var(--font-mono)">
<text x="88" y="93">2</text><text x="120" y="93">5</text><text x="152" y="93">8</text><text x="184" y="93">12</text>
<text x="216" y="93">16</text><text x="248" y="93">23</text></g></g>
<g style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.2">
<rect x="266" y="80" width="28" height="18"/><rect x="298" y="80" width="28" height="18"/>
<rect x="362" y="80" width="28" height="18"/><rect x="394" y="80" width="28" height="18"/><rect x="426" y="80" width="28" height="18"/></g>
<g style="font-size:10.5px; fill:var(--text-primary); text-anchor:middle; font-family:var(--font-mono)">
<text x="280" y="93">38</text><text x="312" y="93">45</text>
<text x="376" y="93">72</text><text x="408" y="93">91</text><text x="440" y="93">100</text></g>
<rect x="330" y="80" width="28" height="18" style="fill:var(--bg-tertiary); stroke:var(--accent-secondary); stroke-width:2"/>
<text x="344" y="93" style="font-size:10.5px; fill:var(--accent-secondary); text-anchor:middle; font-family:var(--font-mono)">56</text>
<g style="opacity:0.3">
<g style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.2">
<rect x="74" y="118" width="28" height="18"/><rect x="106" y="118" width="28" height="18"/><rect x="138" y="118" width="28" height="18"/>
<rect x="170" y="118" width="28" height="18"/><rect x="202" y="118" width="28" height="18"/><rect x="234" y="118" width="28" height="18"/>
<rect x="330" y="118" width="28" height="18"/><rect x="362" y="118" width="28" height="18"/><rect x="394" y="118" width="28" height="18"/>
<rect x="426" y="118" width="28" height="18"/></g>
<g style="font-size:10.5px; fill:var(--text-primary); text-anchor:middle; font-family:var(--font-mono)">
<text x="88" y="131">2</text><text x="120" y="131">5</text><text x="152" y="131">8</text><text x="184" y="131">12</text>
<text x="216" y="131">16</text><text x="248" y="131">23</text>
<text x="344" y="131">56</text><text x="376" y="131">72</text><text x="408" y="131">91</text><text x="440" y="131">100</text></g></g>
<rect x="298" y="118" width="28" height="18" style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.2"/>
<text x="312" y="131" style="font-size:10.5px; fill:var(--text-primary); text-anchor:middle; font-family:var(--font-mono)">45</text>
<rect x="266" y="118" width="28" height="18" style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:2.5"/>
<text x="280" y="131" style="font-size:10.5px; fill:var(--accent-primary); text-anchor:middle; font-family:var(--font-mono)">38</text>
<g style="font-size:11px; fill:var(--text-muted); text-anchor:end; font-family:var(--font-mono)">
<text x="66" y="55">1회 · 12칸</text><text x="66" y="93">2회 · 6칸</text><text x="66" y="131">3회 · 2칸</text></g>
<text x="74" y="164" style="font-size:12px; fill:var(--text-secondary)">회차마다 진한 칸이 절반으로 준다. 흐려진 칸은 끝까지 다시 안 본다.</text>
<text x="74" y="184" style="font-size:12px; fill:var(--accent-primary)">앞에서부터 훑었다면 7번 봐야 했다.</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">2회차에서 후보가 6칸인데 <code>mid</code> 가 8번 칸인 것이 어색해 보일 수 있다. <code>mid</code> 는 남은 구간 <code>lo</code>~<code>hi</code> 의 가운데이지 배열 전체의 가운데가 아니다. 흐려진 칸을 손으로 가리고 보면 정확히 가운데다.</figcaption>
</figure>

값이 200만 개면 차이가 커진다. 앞에서부터 훑으면 최악의 경우 200만 번 비교하지만, 이분 탐색은 21번이면 끝난다.

```python
import time

N = 2_000_000
ARR = list(range(N))
찾을것 = [N - 1, N // 2, 0]

def 훑기(a, t):
    for i, v in enumerate(a):
        if v == t: return i
    return -1

def 이분(a, t):
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if   a[mid] == t: return mid
        elif a[mid] <  t: lo = mid + 1
        else:             hi = mid - 1
    return -1

print(f"{'찾는 값':>10}{'훑기(ms)':>12}{'이분(ms)':>12}")
for t in 찾을것:
    s = time.perf_counter(); 훑기(ARR, t); a = (time.perf_counter()-s)*1000
    s = time.perf_counter(); 이분(ARR, t); b = (time.perf_counter()-s)*1000
    print(f"{t:>10}{a:>12.1f}{b:>12.4f}")
print(f"\n값 {N:,}개 → 이분은 최대 {N.bit_length()}회면 끝난다")
```

```
      찾는 값      훑기(ms)      이분(ms)
   1999999        40.1      0.0041
   1000000        20.2      0.0048
         0         0.0      0.0044

값 2,000,000개 → 이분은 최대 21회면 끝난다
```

밀리초 값은 기계마다 다르게 나오니 자릿수만 보면 된다. 마지막 줄을 보자. 찾는 값이 맨 앞이면 훑기가 오히려 빠르다. **이분 탐색의 값어치는 평균이 빠른 것이 아니라, 가장 운 나쁜 경우에도 21회를 안 넘는다는 보장이다.** 채점 서버는 평균이 아니라 최악을 재기 때문에 이 보장이 합격선을 정한다.

<iframe class="demo-embed" src="demo-binary-search.html?embed=1" height="720" loading="lazy" title="이분 탐색 회차별 시각화"></iframe>

위 데모에서 `Step` 을 눌러 보면 회차마다 칸의 절반이 흐려진다. 칸 수를 두 배로 늘려도 회차는 하나만 는다는 것도 슬라이더로 확인할 수 있다.

## 2. 경계 조건 — 여기서 틀린다

**변형이 네 가지 있고, `hi` 초기값과 부등호와 `mid` 계산이 서로 맞물려야 한다.**

앞 절의 코드는 "값 자체를 찾는" 변형이다. 그런데 실제 문제는 값보다 **경계**를 더 자주 묻는다. "이 값 이상이 처음 나오는 자리", "이 값 이하인 마지막 자리" 같은 것들이다. 이때 코드가 조금씩 달라진다.

네 변형을 한 배열 위에서 나란히 돌려 보면 차이가 분명해진다.

```python
ARR = [1, 3, 3, 3, 7]

def 정확히(a, t):                       # 값 자체를 찾는다
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if   a[mid] == t: return mid
        elif a[mid] <  t: lo = mid + 1
        else:             hi = mid - 1
    return -1

def 왼쪽경계(a, t):                     # t 이상이 처음 나오는 자리
    lo, hi = 0, len(a)                  # hi 가 len 인 것에 주의
    while lo < hi:
        mid = (lo + hi) // 2            # 내림
        if a[mid] < t: lo = mid + 1
        else:          hi = mid
    return lo

def 오른쪽경계(a, t):                   # t 초과가 처음 나오는 자리
    lo, hi = 0, len(a)
    while lo < hi:
        mid = (lo + hi) // 2
        if a[mid] <= t: lo = mid + 1
        else:           hi = mid
    return lo

def 마지막으로작거나같은(a, t):          # t 이하인 마지막 자리
    lo, hi = 0, len(a) - 1
    while lo < hi:
        mid = (lo + hi + 1) // 2        # 올림 — 이게 없으면 무한 루프
        if a[mid] <= t: lo = mid
        else:           hi = mid - 1
    return lo

print("배열", ARR)
print(f"{'찾는 값':>7}{'정확히':>8}{'왼쪽경계':>9}{'오른쪽경계':>11}{'≤ 마지막':>10}")
for t in (0, 3, 5, 7, 9):
    print(f"{t:>7}{정확히(ARR,t):>8}{왼쪽경계(ARR,t):>9}{오른쪽경계(ARR,t):>11}{마지막으로작거나같은(ARR,t):>10}")
```

```
배열 [1, 3, 3, 3, 7]
   찾는 값     정확히     왼쪽경계      오른쪽경계     ≤ 마지막
      0      -1        0          0         0
      3       2        1          4         3
      5      -1        4          4         3
      7       4        4          5         4
      9      -1        5          5         4
```

찾는 값이 3인 줄을 보자. 3은 1·2·3번 칸에 있는데 네 변형이 각각 2, 1, 4, 3을 낸다. **같은 배열, 같은 값인데 네 개의 다른 답이 나온다.** 어느 것도 틀린 답이 아니고, 서로 다른 질문에 답하고 있을 뿐이다.

| 변형 | `hi` 초기값 | `while` | `mid` | 답의 뜻 |
|---|---|---|---|---|
| 정확히 찾기 | `len - 1` | `lo <= hi` | 내림 | 값이 있는 아무 칸, 없으면 -1 |
| 왼쪽 경계 | `len` | `lo < hi` | 내림 | 그 값 이상이 처음 나오는 자리 |
| 오른쪽 경계 | `len` | `lo < hi` | 내림 | 그 값 초과가 처음 나오는 자리 |
| 이하인 마지막 | `len - 1` | `lo < hi` | **올림** | 그 값 이하인 마지막 자리 |

표에서 눈여겨볼 곳은 마지막 줄의 **올림**이다. `mid = (lo + hi + 1) // 2` 로 1을 더한 이유가 있다. 이 변형만 `lo = mid` 를 쓰는데, `mid` 를 내림으로 두면 `lo` 가 영영 안 움직여 무한 루프가 된다.

```python
ARR = [1, 3, 3, 3, 7]
lo, hi, k = 0, len(ARR) - 1, 0
print("mid 를 내림으로 두고 lo = mid 를 쓰면:")
while lo < hi and k < 6:
    k += 1
    mid = (lo + hi) // 2          # 내림 — 여기가 함정
    if ARR[mid] <= 7: lo = mid    # lo 가 mid 그대로
    else:             hi = mid - 1
    print(f"  {k}회차  lo={lo} hi={hi} mid={mid}")
print(f"  ... {k}회를 돌아도 lo 와 hi 가 그대로다 (무한 루프)")
```

```
mid 를 내림으로 두고 lo = mid 를 쓰면:
  1회차  lo=2 hi=4 mid=2
  2회차  lo=3 hi=4 mid=3
  3회차  lo=3 hi=4 mid=3
  4회차  lo=3 hi=4 mid=3
  5회차  lo=3 hi=4 mid=3
  6회차  lo=3 hi=4 mid=3
  ... 6회를 돌아도 lo 와 hi 가 그대로다 (무한 루프)
```

3회차부터 `lo=3, hi=4, mid=3` 이 그대로 반복된다. `lo` 와 `hi` 가 붙어 있는데 내림으로 `mid` 를 구하면 항상 `lo` 가 나오고, `lo = mid` 는 아무것도 안 바꾸기 때문이다. **`lo = mid` 를 쓸 때는 `mid` 를 올림으로 구한다** — 이 한 줄이 규칙의 전부다.

:::deep `(lo + hi) // 2` 가 넘칠 수 있다는 이야기

면접에서 가끔 나오는 질문이 있다. `mid = (lo + hi) // 2` 대신 `mid = lo + (hi - lo) // 2` 를 쓰라는 조언인데, 이유는 정수 오버플로다.

`lo` 와 `hi` 가 각각 20억쯤이면 둘을 더한 40억이 32비트 정수의 한계를 넘는다. 자바나 C에서는 이때 값이 음수로 뒤집히면서 엉뚱한 칸을 가리킨다. 실제로 자바 표준 라이브러리의 이분 탐색에 이 버그가 9년 동안 있었다.

**파이썬에서는 이 문제가 없다.** 파이썬 정수는 크기 제한이 없어서 아무리 커져도 그냥 커진다. 그래도 두 형태를 다 알아 두면 좋다. 코딩 테스트를 자바나 C++로 보는 사람과 이야기가 통하고, 면접에서 물으면 답할 수 있다.

한 가지 덧붙이면, `lo + (hi - lo) // 2` 는 넘침만 막는 것이 아니라 읽는 방식도 다르다. "`lo` 에서 시작해 남은 폭의 절반만큼 간다"로 읽히니 구간 길이가 그대로 드러난다.
:::

## 3. bisect — 직접 짜지 않는다

**파이썬에는 왼쪽 경계와 오른쪽 경계가 표준 라이브러리로 들어 있다.**

앞 절의 네 변형을 매번 손으로 짜면 매번 틀릴 기회가 생긴다. `bisect` 모듈을 쓰면 두 줄로 끝나고, 검증된 구현이니 경계에서 안 틀린다.

```python
from bisect import bisect_left, bisect_right

ARR = [10, 20, 20, 20, 30, 40]
print("배열", ARR, " 칸 번호", list(range(len(ARR))))
print()
print(f"{'찾는 값':>7}{'bisect_left':>13}{'bisect_right':>14}   {'뜻'}")
for t in (5, 20, 25, 40, 50):
    l, r = bisect_left(ARR, t), bisect_right(ARR, t)
    뜻 = f"{t} 이 {r-l}개 있다" if r > l else f"{t} 은 없다 · {l}번 칸에 넣으면 된다"
    print(f"{t:>7}{l:>13}{r:>14}   {뜻}")
print()
print("20 의 개수      ", bisect_right(ARR, 20) - bisect_left(ARR, 20))
print("20 미만 개수    ", bisect_left(ARR, 20))
print("20 이하 개수    ", bisect_right(ARR, 20))
print("20 보다 큰 첫 값 ", ARR[bisect_right(ARR, 20)])
```

```
배열 [10, 20, 20, 20, 30, 40]  칸 번호 [0, 1, 2, 3, 4, 5]

   찾는 값  bisect_left  bisect_right   뜻
      5            0             0   5 은 없다 · 0번 칸에 넣으면 된다
     20            1             4   20 이 3개 있다
     25            4             4   25 은 없다 · 4번 칸에 넣으면 된다
     40            5             6   40 이 1개 있다
     50            6             6   50 은 없다 · 6번 칸에 넣으면 된다

20 의 개수       3
20 미만 개수     1
20 이하 개수     4
20 보다 큰 첫 값  30
```

아래쪽 네 줄이 실전에서 자주 쓰는 꼴이다. 두 함수의 차만 구하면 **그 값이 몇 개인지**가 훑지 않고 나온다. `bisect_left` 자체가 **그 값보다 작은 것의 개수**이고, `bisect_right` 는 **이하인 것의 개수**다.

값이 없을 때 두 함수가 같은 자리를 내는 것도 유용하다. 그 자리가 곧 **정렬을 깨지 않고 값을 끼워 넣을 칸**이다. `insort` 를 쓰면 찾기와 넣기를 한 번에 한다.

> **주의** — `bisect` 는 배열이 정렬돼 있다고 **믿는다**. 정렬 안 된 배열에 쓰면 오류를 내지 않고 엉뚱한 자리를 낸다. 조용히 틀리는 쪽이 요란하게 죽는 쪽보다 찾기 어렵다.

## 4. 답을 이분한다 — 파라메트릭 서치

**이분 탐색은 배열이 있어야만 쓰는 것이 아니다. 답의 범위를 이분해도 된다.**

문제를 하나 보자. 길이가 802, 743, 457, 539인 나무 넷이 있다. 절단기 높이를 정해 그 위로 올라온 부분만 가져가는데, 1000만큼 얻으려면 높이를 최대 얼마로 둘 수 있을까.

높이를 하나씩 올려 보면 최대 802번 시도해야 한다. 그런데 여기에 **단조성**이 있다. 높이를 올리면 얻는 양은 반드시 줄어든다. 그러면 "이 높이로 1000을 얻을 수 있나"라는 예·아니오 질문의 답이 어느 지점을 경계로 딱 갈린다.

경계가 있으면 이분 탐색이 통한다. 찾는 것이 배열의 칸이 아니라 **높이 그 자체**로 바뀌었을 뿐이다.

```python
길이 = [802, 743, 457, 539]
목표 = 1000

def 얻는양(h):
    return sum(x - h for x in 길이 if x > h)

lo, hi, k = 0, max(길이), 0
print(f"{'회차':<5}{'lo':>6}{'hi':>6}{'mid':>6}{'얻는 양':>9}   판정")
while lo < hi:
    k += 1
    mid = (lo + hi + 1) // 2
    양 = 얻는양(mid)
    if 양 >= 목표:
        lo = mid
        판정 = f"{목표} 이상 → 더 높여 본다"
    else:
        hi = mid - 1
        판정 = f"{목표} 미만 → 낮춰야 한다"
    print(f"{k:<5}{lo:>6}{hi:>6}{mid:>6}{양:>9}   {판정}")
print(f"\n답 {lo} · 이때 얻는 양 {얻는양(lo)}")
```

```
회차       lo    hi   mid     얻는 양   판정
1         0   400   401      937   1000 미만 → 낮춰야 한다
2       200   400   200     1741   1000 이상 → 더 높여 본다
3       300   400   300     1341   1000 이상 → 더 높여 본다
4       350   400   350     1141   1000 이상 → 더 높여 본다
5       375   400   375     1041   1000 이상 → 더 높여 본다
6       375   387   388      989   1000 미만 → 낮춰야 한다
7       381   387   381     1017   1000 이상 → 더 높여 본다
8       384   387   384     1005   1000 이상 → 더 높여 본다
9       384   385   386      997   1000 미만 → 낮춰야 한다
10      385   385   385     1001   1000 이상 → 더 높여 본다

답 385 · 이때 얻는 양 1001
```

높이 0에서 802까지 803가지를 10회에 좁혔다. `mid` 를 올림으로 구한 것에 주목하자. 이 코드는 "조건을 만족하는 **가장 큰** 값"을 찾으니 2절의 마지막 변형과 같은 꼴이고, 따라서 올림이 필요하다.

이 방법을 쓸 수 있는지 판단하는 기준은 하나다. **"답을 x라 두었을 때, x가 되면 되고 x보다 크면 안 되는가"** 를 물어서 그렇다면 통한다. 문제 지문의 "최소의 최대", "최대의 최소" 같은 표현이 이 꼴을 알리는 신호다.

같은 구조가 광고 입찰가를 정할 때도 쓰인다. 입찰가를 올리면 이길 확률은 오르지만 남는 이익은 준다는 단조 관계 위에서 최적점을 찾는 것이다. 자세한 것은 [Bid Shading & Censored Data](post.html?id=bid-shading-censored) 편의 황금분할 탐색에 있다.

## 5. 회전된 배열 — 반쪽은 항상 정렬돼 있다

**정렬된 배열을 어느 지점에서 잘라 앞뒤를 바꿔 놓아도 이분 탐색은 통한다.**

정렬된 배열 `[2, 5, 8, 12, 16, 30, 38, 45, 56]` 이 있다고 하자. 30이 맨 앞에 오도록 회전시키면 `[30, 38, 45, 56, 2, 5, 8, 12, 16]` 이 된다. 전체로 보면 정렬이 깨졌다. 그런데 가운데를 기준으로 자르면 **한쪽은 반드시 정렬돼 있다.**

이것이 핵심이다. 정렬된 반쪽 안에 찾는 값이 있는지는 양 끝만 보면 알 수 있고, 없으면 반대쪽으로 가면 된다. 어느 쪽으로 가든 후보는 절반이 된다.

```python
ARR, TARGET = [30, 38, 45, 56, 2, 5, 8, 12, 16], 5

print("배열", ARR, " 찾는 값", TARGET)
print(f"{'회차':<5}{'lo':>4}{'hi':>4}{'mid':>5}{'값':>5}   {'정렬된 반쪽':<12}{'판정'}")
lo, hi, k = 0, len(ARR) - 1, 0
while lo <= hi:
    k += 1
    mid = (lo + hi) // 2
    if ARR[mid] == TARGET:
        print(f"{k:<5}{lo:>4}{hi:>4}{mid:>5}{ARR[mid]:>5}   {'-':<12}찾음")
        break
    if ARR[lo] <= ARR[mid]:                        # 왼쪽 반이 정렬돼 있다
        반쪽 = f"왼쪽 {ARR[lo]}~{ARR[mid]}"
        if ARR[lo] <= TARGET < ARR[mid]:
            hi = mid - 1; 판정 = "그 안에 있다 → 왼쪽"
        else:
            lo = mid + 1; 판정 = "그 안에 없다 → 오른쪽"
    else:                                          # 오른쪽 반이 정렬돼 있다
        반쪽 = f"오른쪽 {ARR[mid]}~{ARR[hi]}"
        if ARR[mid] < TARGET <= ARR[hi]:
            lo = mid + 1; 판정 = "그 안에 있다 → 오른쪽"
        else:
            hi = mid - 1; 판정 = "그 안에 없다 → 왼쪽"
    print(f"{k:<5}{lo:>4}{hi:>4}{mid:>5}{ARR[mid]:>5}   {반쪽:<12}{판정}")
```

```
배열 [30, 38, 45, 56, 2, 5, 8, 12, 16]  찾는 값 5
회차     lo  hi  mid    값   정렬된 반쪽      판정
1       5   8    4    2   오른쪽 2~16    그 안에 있다 → 오른쪽
2       5   5    6    8   왼쪽 5~8      그 안에 있다 → 왼쪽
3       5   5    5    5   -           찾음
```

1회차에서 `ARR[lo]` 가 30이고 `ARR[mid]` 가 2다. 30이 2보다 크니 왼쪽 반은 정렬이 깨진 쪽이고, 따라서 오른쪽 반이 정렬돼 있다. 오른쪽 반은 2부터 16까지인데 찾는 값 5가 그 범위 안이니 오른쪽으로 간다.

**어느 쪽이 정렬됐는지를 먼저 판정하고, 그다음 찾는 값이 그 안에 있는지를 본다.** 이 두 단계 순서를 뒤집으면 틀린다. 회전 배열 문제에서 헤매는 대부분이 이 순서를 섞어서다.

## 6. 스택 — 마지막에 넣은 것부터

**이분 탐색이 "정렬된 후보를 반씩 지우는" 도구라면, 스택은 "아직 짝을 못 찾은 것을 쌓아 두는" 도구다.**

파이썬에서 스택은 그냥 리스트다. `append` 로 넣고 `pop` 으로 마지막 것을 뺀다. 둘 다 O(1)이라 따로 자료형을 만들 필요가 없다.

스택이 답이 되는 문제의 신호는 **"가장 최근 것과 짝을 맞춘다"** 이다. 괄호 문제가 대표적이다. 닫는 괄호를 만나면 짝은 항상 가장 최근에 열린 괄호이지, 맨 처음 열린 것이 아니다.

```python
쌍 = {")": "(", "]": "[", "}": "{"}

def 확인(s):
    스택 = []
    print(f"  {'글자':<5}{'하는 일':<22}{'스택'}")
    for c in s:
        if c in "([{":
            스택.append(c)
            print(f"  {c:<5}{'여는 괄호 → 쌓는다':<20}{스택}")
        else:
            if not 스택 or 스택[-1] != 쌍[c]:
                print(f"  {c:<5}{'짝이 안 맞는다 → 실패':<19}{스택}")
                return False
            스택.pop()
            print(f"  {c:<5}{'짝이 맞는다 → 뺀다':<20}{스택}")
    return not 스택

for s in ("([]{})", "([)]"):
    print(f"'{s}'")
    r = 확인(s)
    print(f"  → {'맞다' if r else '틀리다'}\n")
```

```
'([]{})'
  글자   하는 일                  스택
  (    여는 괄호 → 쌓는다         ['(']
  [    여는 괄호 → 쌓는다         ['(', '[']
  ]    짝이 맞는다 → 뺀다         ['(']
  {    여는 괄호 → 쌓는다         ['(', '{']
  }    짝이 맞는다 → 뺀다         ['(']
  )    짝이 맞는다 → 뺀다         []
  → 맞다

'([)]'
  글자   하는 일                  스택
  (    여는 괄호 → 쌓는다         ['(']
  [    여는 괄호 → 쌓는다         ['(', '[']
  )    짝이 안 맞는다 → 실패      ['(', '[']
  → 틀리다
```

두 번째 문자열이 왜 틀렸는지 보자. 여는 괄호 개수와 닫는 괄호 개수는 맞다. 그런데 `)` 를 만난 순간 가장 최근에 열린 것이 `[` 였다. 개수만 세는 코드는 이것을 못 잡는다.

끝난 뒤 `return not 스택` 도 중요하다. 스택에 뭔가 남아 있으면 열고 안 닫은 괄호가 있다는 뜻이다. **닫는 괄호에서만 검사하면 `"((("` 같은 입력을 통과시킨다.**

## 7. 단조 스택 — 다음에 더 큰 값

**스택에 "아직 답을 못 찾은 칸 번호"를 쌓아 두면, 이중 반복문이 필요해 보이는 문제가 한 번 훑기로 끝난다.**

문제를 보자. 날마다 기온이 있고, 각 날짜에 대해 "며칠 뒤에 처음으로 더 더워지는가"를 구한다. 짝을 전부 만들면 O(n²)이다.

여기서 관찰 하나가 상황을 바꾼다. **오늘 기온이 33도인데 어제가 28도였다면, 어제의 답은 오늘이다.** 그리고 28도 앞에 30도가 있었다면 30도의 답도 오늘이다. 즉 오늘 기온보다 낮은 날들이 한꺼번에 답을 얻는다.

그러니 아직 답을 못 찾은 날의 번호를 스택에 쌓아 두고, 새 날이 올 때마다 그보다 낮은 날들을 꺼내면 된다. 스택에는 항상 기온이 내림차순으로 남게 되어 **단조 스택**이라 부른다.

```python
기온 = [30, 28, 33, 31, 29, 35, 32]
답 = [0] * len(기온)
스택 = []                       # 아직 답을 못 찾은 칸 번호를 쌓아 둔다

print(f"{'칸':<4}{'기온':<6}{'하는 일':<34}{'스택(칸번호)'}")
for i, t in enumerate(기온):
    뺀것 = []
    while 스택 and 기온[스택[-1]] < t:
        j = 스택.pop()
        답[j] = i - j
        뺀것.append(f"{j}번은 {i-j}일 뒤")
    스택.append(i)
    설명 = ", ".join(뺀것) if 뺀것 else "더 높은 게 없다 → 쌓기만"
    print(f"{i:<4}{t:<6}{설명:<34}{스택}")

print(f"\n기온 {기온}")
print(f"답   {답}   (0 은 끝까지 더 높은 날이 없다는 뜻)")
```

```
칸   기온    하는 일                              스택(칸번호)
0   30    더 높은 게 없다 → 쌓기만                   [0]
1   28    더 높은 게 없다 → 쌓기만                   [0, 1]
2   33    1번은 1일 뒤, 0번은 2일 뒤                [2]
3   31    더 높은 게 없다 → 쌓기만                   [2, 3]
4   29    더 높은 게 없다 → 쌓기만                   [2, 3, 4]
5   35    4번은 1일 뒤, 3번은 2일 뒤, 2번은 3일 뒤      [5]
6   32    더 높은 게 없다 → 쌓기만                   [5, 6]

기온 [30, 28, 33, 31, 29, 35, 32]
답   [2, 1, 3, 2, 1, 0, 0]   (0 은 끝까지 더 높은 날이 없다는 뜻)
```

5번 칸에서 세 개를 한꺼번에 꺼낸 것을 보자. 안쪽에 `while` 이 있으니 O(n²)처럼 보인다. 그런데 **각 칸은 스택에 한 번 들어가고 한 번 나온다.** 전체 `pop` 횟수가 칸 개수를 못 넘으니 전체는 O(n)이다.

이 논증은 앞 편의 양 끝 좁히기와 같은 꼴이다. 반복문이 겹쳐 보여도 **전체 이동 횟수를 세면** 답이 나온다. 면접에서 "여기 `while` 이 있는데 왜 O(n)인가"를 물으면 이렇게 답하면 된다.

## 8. 덱 — 양끝에서 넣고 뺀다

**리스트는 맨 앞을 빼는 것이 비싸다. 양끝을 다 써야 하면 `deque` 를 쓴다.**

앞 편에서 `리스트.pop(0)` 이 뒤의 값을 전부 한 칸씩 당긴다는 것을 봤다. 십만 번 반복하면 그 자체로 시간 초과가 난다. `collections.deque` 는 양끝을 떼도록 만들어져서 `popleft` 도 O(1)이다.

| 하는 일 | 리스트 | `deque` |
|---|---|---|
| 뒤에 넣기 | O(1) | O(1) |
| 뒤에서 빼기 | O(1) | O(1) |
| 앞에 넣기 | O(n) | O(1) |
| 앞에서 빼기 | O(n) | O(1) |
| 가운데 칸 읽기 | O(1) | O(n) |

마지막 줄이 맞바꿈이다. `deque` 는 `d[5]` 같은 가운데 접근이 느리니, 번호로 아무 칸이나 찍어 읽는 코드에는 안 맞는다. **양끝만 쓰면 `deque`, 가운데를 찍어 읽으면 리스트다.**

너비 우선 탐색(BFS)에서 `deque` 를 쓰는 이유가 이것이다. 큐는 앞에서 빼고 뒤에 넣는 일만 하니 `deque` 의 강점만 쓴다. 그래프 편에서 다시 나온다.

## 9. 단조 덱 — 창 최댓값을 O(n)으로

**단조 스택의 생각을 양끝으로 넓히면, 슬라이딩 윈도우의 최댓값을 한 번 훑기로 구할 수 있다.**

앞 편에서 창을 미끄러뜨리며 **합**을 구했다. 합은 빠지는 값을 빼고 들어오는 값을 더하면 됐다. 그런데 **최댓값**은 그렇게 안 된다. 최댓값이 창 밖으로 나가면 남은 것들 중 최댓값을 다시 찾아야 한다.

여기서도 관찰 하나가 있다. **지금 들어온 값보다 작으면서 더 왼쪽에 있는 값은 앞으로 영영 최댓값이 될 수 없다.** 나중에 창이 미끄러지면 그 값이 먼저 밖으로 나가기 때문이다. 그러니 버려도 된다.

그래서 덱에 칸 번호를 값이 내림차순이 되게 유지한다. 새 값이 들어오면 뒤에서 작은 것들을 버리고, 창 밖으로 나간 것은 앞에서 버린다. 그러면 **덱의 맨 앞이 항상 지금 창의 최댓값**이다.

```python
from collections import deque

ARR, K = [1, 3, -1, -3, 5, 3, 6, 7], 3
덱, 답 = deque(), []

print(f"{'칸':<4}{'값':<5}{'덱(칸번호)':<18}{'창':<16}{'최댓값'}")
for i, v in enumerate(ARR):
    while 덱 and ARR[덱[-1]] <= v:
        덱.pop()                       # 뒤에서 작은 것들을 버린다
    덱.append(i)
    if 덱[0] <= i - K:
        덱.popleft()                   # 창 밖으로 나간 것을 버린다
    if i >= K - 1:
        답.append(ARR[덱[0]])
        창 = ARR[i-K+1:i+1]
        print(f"{i:<4}{v:<5}{str(list(덱)):<18}{str(창):<16}{ARR[덱[0]]}")
    else:
        print(f"{i:<4}{v:<5}{str(list(덱)):<18}{'아직 창이 안 참':<14}-")
print(f"\n답 {답}")
```

```
칸   값    덱(칸번호)            창               최댓값
0   1    [0]               아직 창이 안 참     -
1   3    [1]               아직 창이 안 참     -
2   -1   [1, 2]            [1, 3, -1]      3
3   -3   [1, 2, 3]         [3, -1, -3]     3
4   5    [4]               [-1, -3, 5]     5
5   3    [4, 5]            [-3, 5, 3]      5
6   6    [6]               [5, 3, 6]       6
7   7    [7]               [3, 6, 7]       7

답 [3, 3, 5, 5, 6, 7]
```

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 500 180" role="img" aria-label="네 회차를 위에서 아래로 쌓은 그림. 회차마다 여덟 칸의 값이 놓여 있고 창 세 칸이 굵게 표시된다. 오른쪽에는 그 회차의 덱 내용과 최댓값이 적혀 있다. 덱에 남은 칸 수가 창 크기보다 적은 회차가 있다." style="width:100%; max-width:500px; height:auto; font-family:var(--font-sans)">
<text x="6" y="13" style="font-size:12.5px; fill:var(--text-secondary)">값 [1, 3, −1, −3, 5, 3, 6, 7] · 창 크기 3</text>
<text x="6" y="32" style="font-size:10.5px; fill:var(--text-muted); font-family:var(--font-mono)">칸 번호</text>
<g style="font-size:10.5px; fill:var(--text-muted); text-anchor:middle; font-family:var(--font-mono)">
<text x="72" y="32">0</text><text x="104" y="32">1</text><text x="136" y="32">2</text><text x="168" y="32">3</text>
<text x="200" y="32">4</text><text x="232" y="32">5</text><text x="264" y="32">6</text><text x="296" y="32">7</text></g>
<g style="opacity:0.3">
<g style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.2">
<rect x="154" y="40" width="28" height="16"/><rect x="186" y="40" width="28" height="16"/><rect x="218" y="40" width="28" height="16"/>
<rect x="250" y="40" width="28" height="16"/><rect x="282" y="40" width="28" height="16"/>
<rect x="58" y="66" width="28" height="16"/><rect x="218" y="66" width="28" height="16"/>
<rect x="250" y="66" width="28" height="16"/><rect x="282" y="66" width="28" height="16"/>
<rect x="58" y="92" width="28" height="16"/><rect x="90" y="92" width="28" height="16"/>
<rect x="250" y="92" width="28" height="16"/><rect x="282" y="92" width="28" height="16"/>
<rect x="58" y="118" width="28" height="16"/><rect x="90" y="118" width="28" height="16"/>
<rect x="122" y="118" width="28" height="16"/><rect x="154" y="118" width="28" height="16"/><rect x="186" y="118" width="28" height="16"/></g>
<g style="font-size:10.5px; fill:var(--text-primary); text-anchor:middle; font-family:var(--font-mono)">
<text x="168" y="52">−3</text><text x="200" y="52">5</text><text x="232" y="52">3</text><text x="264" y="52">6</text><text x="296" y="52">7</text>
<text x="72" y="78">1</text><text x="232" y="78">3</text><text x="264" y="78">6</text><text x="296" y="78">7</text>
<text x="72" y="104">1</text><text x="104" y="104">3</text><text x="264" y="104">6</text><text x="296" y="104">7</text>
<text x="72" y="130">1</text><text x="104" y="130">3</text><text x="136" y="130">−1</text><text x="168" y="130">−3</text><text x="200" y="130">5</text></g></g>
<g style="fill:var(--bg-tertiary); stroke:var(--accent-secondary); stroke-width:1.8">
<rect x="58" y="40" width="28" height="16"/><rect x="90" y="40" width="28" height="16"/><rect x="122" y="40" width="28" height="16"/>
<rect x="90" y="66" width="28" height="16"/><rect x="122" y="66" width="28" height="16"/><rect x="154" y="66" width="28" height="16"/>
<rect x="122" y="92" width="28" height="16"/><rect x="154" y="92" width="28" height="16"/><rect x="186" y="92" width="28" height="16"/>
<rect x="218" y="118" width="28" height="16"/><rect x="250" y="118" width="28" height="16"/><rect x="282" y="118" width="28" height="16"/></g>
<g style="font-size:10.5px; fill:var(--text-primary); text-anchor:middle; font-family:var(--font-mono)">
<text x="72" y="52">1</text><text x="104" y="52">3</text><text x="136" y="52">−1</text>
<text x="104" y="78">3</text><text x="136" y="78">−1</text><text x="168" y="78">−3</text>
<text x="136" y="104">−1</text><text x="168" y="104">−3</text><text x="200" y="104">5</text>
<text x="232" y="130">3</text><text x="264" y="130">6</text><text x="296" y="130">7</text></g>
<g style="font-size:12px; fill:var(--text-muted); font-family:var(--font-mono)">
<text x="322" y="52">덱 [1] · 최대 3</text>
<text x="322" y="78">덱 [1,2,3] · 최대 3</text>
<text x="322" y="104">덱 [4] · 최대 5</text></g>
<text x="322" y="130" style="font-size:12px; fill:var(--accent-primary); font-family:var(--font-mono)">덱 [7] · 최대 7</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">덱이 창보다 짧은 회차가 있다. 4번 칸에서 5가 들어오자 덱이 <code>[1,2,3]</code> 에서 <code>[4]</code> 로 한 번에 줄었다. 5보다 작으면서 더 왼쪽에 있던 셋은 앞으로 어떤 창에서도 최댓값이 될 수 없으니 한꺼번에 버린 것이다.</figcaption>
</figure>

여기서도 각 칸은 덱에 한 번 들어가고 한 번 나온다. 그래서 안쪽에 `while` 이 있어도 전체는 O(n)이다. 창 크기를 K라 할 때 매번 창 안을 다시 훑으면 O(nK)인데, 값이 십만 개에 창이 천이면 그 차이가 합격과 불합격을 가른다.

## 10. 어느 것을 언제 쓰나

**문제 지문의 표현이 어느 도구를 쓸지 거의 알려 준다.**

먼저 정렬 여부를 본다. 입력이 정렬돼 있거나 정렬해도 답이 안 바뀌면 이분 탐색이 후보다. "이상인 첫", "이하인 마지막", "몇 개인가" 같은 표현이 보이면 `bisect` 두 줄로 끝난다.

정렬이 없어도 **답이 단조로우면** 파라메트릭 서치가 통한다. "최소의 최대", "최대의 최소", "가능한 가장 큰 값"이 신호다. 이때 이분하는 것은 배열이 아니라 답의 범위다.

배열을 왼쪽에서 오른쪽으로 지나가면서 **가장 최근 것과 짝을 맞추면** 스택이다. 괄호·수식·되돌리기가 여기 든다. 짝을 맞추는 기준이 "나보다 큰 첫 값" 같은 크기 비교면 단조 스택이다.

마지막으로 **양끝을 다 쓰면** 덱이다. 큐가 필요한 BFS가 대표적이고, 창을 미끄러뜨리며 최댓값이나 최솟값을 물으면 단조 덱이다.

이렇게 세 도구를 정리하면 배열 계열 문제의 상당 부분이 덮인다. 남은 큰 갈래는 트리와 그래프인데, 그 이야기는 다음 편으로 넘긴다.

## 한눈 정리

| 지문에 이런 말이 나오면 | 쓸 것 | 왜 |
|---|---|---|
| 정렬된 배열에서 값 찾기 | 이분 탐색 | 가운데 하나로 절반을 지운다 |
| "이상인 첫", "이하인 마지막" | `bisect_left` / `bisect_right` | 직접 짜면 경계에서 틀린다 |
| "그 값이 몇 개인가" | 두 `bisect` 의 차 | 훑지 않고 개수가 나온다 |
| "최소의 최대", "최대의 최소" | 파라메트릭 서치 | 답의 범위를 이분한다 |
| 회전된 정렬 배열 | 반쪽 판정 후 이분 | 한쪽은 반드시 정렬돼 있다 |
| 가장 최근 것과 짝 맞추기 | 스택 | 괄호·되돌리기가 이 꼴 |
| "나보다 큰 첫 값" | 단조 스택 | 각 칸이 한 번 들어가고 한 번 나온다 |
| 앞뒤로 넣고 빼기 | `deque` | 리스트는 앞이 O(n) |
| 창 안의 최댓값·최솟값 | 단조 덱 | 될 수 없는 값을 미리 버린다 |

## 헷갈리기 쉬운 점

- **`lo = mid` 를 쓰면 `mid` 는 올림이다.** 내림으로 두면 `lo` 와 `hi` 가 붙었을 때 무한 루프가 된다.
- **`hi` 초기값이 `len` 인지 `len - 1` 인지가 변형을 가른다.** `len` 이면 `while lo < hi`, `len - 1` 이면 `while lo <= hi` 로 짝을 맞춘다.
- **`bisect` 는 정렬을 확인하지 않는다.** 정렬 안 된 배열에 쓰면 오류 없이 틀린 답을 낸다.
- **파라메트릭 서치는 단조성이 전제다.** "높이를 올리면 얻는 양이 준다"가 성립해야 하고, 안 하면 경계 자체가 없다.
- **회전 배열은 판정 순서가 중요하다.** 어느 쪽이 정렬됐는지를 먼저 보고, 그다음 값이 그 범위 안인지를 본다.
- **괄호 문제는 끝나고 스택이 비었는지도 봐야 한다.** 닫는 괄호에서만 검사하면 `"((("` 가 통과한다.
- **`while` 이 겹쳤다고 O(n²)이 아니다.** 각 칸이 한 번 들어가고 한 번 나오면 전체는 O(n)이다.
- **`deque` 는 가운데 접근이 느리다.** 번호로 아무 칸이나 찍어 읽는 코드에는 리스트를 쓴다.

## 더 깊이 보기

- 앞 편의 [복잡도와 배열 훑기](post.html?id=algorithm-complexity-array)에서 양 끝 좁히기와 창 미끄러뜨리기를 다뤘다. 이 글의 단조 스택·단조 덱이 그 생각의 확장이다.
- [해시와 정렬](post.html?id=algorithm-hash-sort) 편의 정렬이 이 글의 이분 탐색과 파라메트릭 서치의 전제가 된다.
- 답의 범위를 좁혀 최적점을 찾는 같은 구조가 광고 입찰가 계산에 쓰인다. [Bid Shading & Censored Data](post.html?id=bid-shading-censored) 4절의 황금분할 탐색을 보면 된다.
- 위 [이분 탐색 데모](demo-binary-search.html)에서 세 변형을 같은 배열 위에 번갈아 돌려 보면 경계 차이가 눈에 들어온다.
