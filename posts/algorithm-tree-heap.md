지훈은 앞 세 편으로 배열 문제를 넘겼다. 그런데 이번 문제는 입력이 배열이 아니었다. "각 사원의 상사 번호가 주어진다"로 시작했다.

배열로 옮겨 보려 했지만 잘 안 됐다. 사원 하나에 부하가 여럿이고, 그 부하에게도 또 부하가 있었다. 순서대로 늘어놓을 수가 없는 모양이었다.

**한 줄로 늘어놓을 수 없는 자료는 어떻게 다루나?**

이런 모양을 **트리**라고 한다. 이 글은 트리를 코드로 어떻게 담고 어떻게 훑는지, 그리고 트리를 배열 하나로 접어 넣은 **힙**이 왜 "가장 작은 것 하나"에 강한지를 다룬다.

> **한 줄 요약:** 트리는 부모가 하나뿐인 갈래 구조다. 훑는 방법이 네 가지 있고 그중 셋은 재귀 한 줄 차이다. 힙은 트리처럼 생겼지만 실제로는 배열이고, 전체를 정렬하지 않고 최솟값 하나만 꺼내는 데 쓴다.

> **골라 읽는 법** — 절이 열 개인 글입니다.
>
> - 트리를 코드로 담고 훑는 법 → 앞의 네 절
> - 이진 탐색 트리와 그 함정 → 다섯째·여섯째 절
> - 힙만 → 일곱째 절부터
> - 실무에서 바로 쓰는 것 → 아홉째 절

---

## 1. 트리 — 부모는 하나, 자식은 여럿

**트리는 자기 위에 부모가 하나뿐이고 아래로만 갈라지는 구조다.**

사원과 상사 관계가 그렇다. 사원 하나에 상사는 한 명이고, 상사 밑에는 부하가 여럿일 수 있다. 맨 위에는 상사가 없는 사람이 하나 있는데 이것을 **뿌리**라 부른다. 아래에 아무도 없는 사람은 **잎**이다.

말이 몇 개 나오니 그림으로 한 번에 보자. 이 글 전체가 아래 트리 하나로 돌아간다.

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 500 230" role="img" aria-label="여덟이 맨 위에 있고 그 아래로 셋과 열이 갈라지는 트리 그림. 셋 아래에는 하나와 여섯이, 여섯 아래에는 넷과 일곱이 있고, 열 아래에는 열넷이, 열넷 아래에는 열셋이 있다. 왼쪽에 층 번호가 붙어 있다." style="width:100%; max-width:500px; height:auto; font-family:var(--font-sans)">
<g style="stroke:var(--border-color); stroke-width:1.4">
<line x1="250" y1="42" x2="150" y2="82"/><line x1="250" y1="42" x2="350" y2="82"/>
<line x1="150" y1="98" x2="90" y2="138"/><line x1="150" y1="98" x2="210" y2="138"/>
<line x1="350" y1="98" x2="410" y2="138"/>
<line x1="210" y1="154" x2="170" y2="194"/><line x1="210" y1="154" x2="250" y2="194"/>
<line x1="410" y1="154" x2="370" y2="194"/></g>
<g style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.4">
<circle cx="150" cy="90" r="16"/><circle cx="350" cy="90" r="16"/>
<circle cx="210" cy="146" r="16"/><circle cx="410" cy="146" r="16"/></g>
<circle cx="250" cy="34" r="16" style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:2.5"/>
<g style="fill:var(--bg-tertiary); stroke:var(--accent-secondary); stroke-width:1.8">
<circle cx="90" cy="146" r="16"/><circle cx="170" cy="202" r="16"/>
<circle cx="250" cy="202" r="16"/><circle cx="370" cy="202" r="16"/></g>
<g style="font-size:13px; fill:var(--text-primary); text-anchor:middle; font-family:var(--font-mono)">
<text x="250" y="39">8</text><text x="150" y="95">3</text><text x="350" y="95">10</text>
<text x="90" y="151">1</text><text x="210" y="151">6</text><text x="410" y="151">14</text>
<text x="170" y="207">4</text><text x="250" y="207">7</text><text x="370" y="207">13</text></g>
<g style="font-size:11px; fill:var(--text-muted); font-family:var(--font-mono)">
<text x="6" y="39">0층</text><text x="6" y="95">1층</text><text x="6" y="151">2층</text><text x="6" y="207">3층</text></g>
<text x="290" y="30" style="font-size:11px; fill:var(--accent-primary)">뿌리</text>
<text x="60" y="176" style="font-size:11px; fill:var(--accent-secondary)">잎</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">굵게 그린 8 이 뿌리이고, 아래로 아무도 없는 1·4·7·13 이 잎이다. 14 는 자식이 하나뿐인데 그래도 트리다. 자식이 둘 이하인 트리를 <strong>이진 트리</strong>라 부르고, 이 글에서 쓰는 트리가 전부 그것이다.</figcaption>
</figure>

**높이**는 뿌리에서 가장 먼 잎까지의 층수다. 위 그림은 3층까지 있으니 높이가 3이다. 높이가 왜 중요한지는 다섯째 절에서 드러난다.

코드로 담는 방법은 간단하다. 값 하나와 왼쪽·오른쪽을 가리킬 자리 둘을 가진 상자를 만들고, 그 상자끼리 서로를 가리키게 하면 된다.

```python
class Node:
    def __init__(self, val):
        self.val, self.left, self.right = val, None, None

#         8
#      3     10
#    1   6      14
#       4 7    13
def build():
    n = {v: Node(v) for v in (8, 3, 10, 1, 6, 14, 4, 7, 13)}
    n[8].left,  n[8].right  = n[3], n[10]
    n[3].left,  n[3].right  = n[1], n[6]
    n[6].left,  n[6].right  = n[4], n[7]
    n[10].right = n[14]
    n[14].left  = n[13]
    return n[8]

root = build()
print("뿌리", root.val, "· 왼쪽", root.left.val, "· 오른쪽", root.right.val)
```

```
뿌리 8 · 왼쪽 3 · 오른쪽 10
```

`left` 나 `right` 가 `None` 이면 그쪽으로는 자식이 없다는 뜻이다. 1의 왼쪽과 오른쪽이 둘 다 `None` 이라서 1이 잎이 된다.

## 2. 훑는 순서 세 가지

**트리를 훑는 코드는 세 줄인데, 그 세 줄의 순서만 바꾸면 세 가지 순서가 나온다.**

배열은 왼쪽에서 오른쪽으로 한 가지로 훑는다. 트리는 갈래가 있으니 순서를 정해야 한다. "나를 언제 처리하느냐"만 정하면 나머지는 따라온다.

- 나 먼저, 그다음 왼쪽, 그다음 오른쪽 → **전위**
- 왼쪽 먼저, 그다음 나, 그다음 오른쪽 → **중위**
- 왼쪽·오른쪽 먼저, 나는 마지막 → **후위**

```python
def 전위(t, out):
    if t: out.append(t.val); 전위(t.left, out); 전위(t.right, out)

def 중위(t, out):
    if t: 중위(t.left, out); out.append(t.val); 중위(t.right, out)

def 후위(t, out):
    if t: 후위(t.left, out); 후위(t.right, out); out.append(t.val)

for 이름, fn in (("전위 (뿌리 먼저)", 전위), ("중위 (왼쪽 먼저)", 중위), ("후위 (뿌리 나중)", 후위)):
    out = []
    fn(root, out)
    print(f"{이름:<18}{out}")
```

```
전위 (뿌리 먼저)        [8, 3, 1, 6, 4, 7, 10, 14, 13]
중위 (왼쪽 먼저)        [1, 3, 4, 6, 7, 8, 10, 13, 14]
후위 (뿌리 나중)        [1, 4, 7, 6, 3, 13, 14, 10, 8]
```

세 줄의 순서만 다른데 결과가 완전히 다르다. **중위 결과를 눈여겨보자 — 정렬돼 있다.** 이것이 우연이 아닌 이유는 다섯째 절에서 다룬다.

셋의 쓰임도 다르다. 전위는 트리를 그대로 복사하거나 파일로 저장할 때 쓴다. 뿌리부터 나오니 읽으면서 위에서 아래로 다시 만들 수 있다. 후위는 자식을 다 처리해야 부모를 처리할 수 있는 일에 쓰는데, 폴더 크기 계산이나 트리 삭제가 그렇다.

:::deep 재귀가 부담스러우면 — 스택으로 바꾸기

위 코드는 자기 자신을 부르는 **재귀**다. 파이썬은 재귀를 깊게 못 하니(넷째 절), 스택으로 바꿔 쓰기도 한다. 앞 편에서 본 그 스택이다.

전위 순회를 스택으로 쓰면 이렇게 된다. 오른쪽을 먼저 넣는 것이 요령인데, 스택은 마지막에 넣은 것부터 꺼내니 그래야 왼쪽이 먼저 나온다.

```python
def 전위_스택(root):
    out, 스택 = [], [root]
    while 스택:
        t = 스택.pop()
        if not t: continue
        out.append(t.val)
        스택.append(t.right)      # 오른쪽을 먼저 넣어야
        스택.append(t.left)       # 왼쪽이 먼저 나온다
    return out

print(전위_스택(root))
```

```
[8, 3, 1, 6, 4, 7, 10, 14, 13]
```

재귀와 결과가 같다. 사실 재귀도 속으로는 스택을 쓰는데, 그것을 파이썬이 대신 관리해 줄 뿐이다. 재귀를 스택으로 바꾼다는 것은 그 관리를 내가 하겠다는 뜻이다.

중위와 후위도 스택으로 쓸 수 있지만 코드가 눈에 띄게 복잡해진다. 코딩 테스트에서는 대체로 재귀 한계를 올리는 쪽이 빠르고 안전하다.
:::

## 3. 층별로 보기 — 큐를 쓴다

**"몇 층인가", "각 층에 무엇이 있나"를 물으면 재귀가 아니라 큐를 쓴다.**

앞의 세 순회는 한 갈래를 끝까지 파고든 다음 옆 갈래로 간다. 그래서 같은 층에 있는 것들이 결과에서 흩어진다. 전위 결과에서 1층인 3과 10 사이에 2층·3층 값들이 끼어 있는 것이 그 때문이다.

층별로 보려면 **먼저 본 것부터 처리**해야 한다. 앞 편에서 본 `deque` 가 바로 그 도구다. 지금 층을 전부 꺼내면서 그 자식들을 뒤에 넣으면, 다음 회차에는 자연히 다음 층만 큐에 남는다.

```python
from collections import deque

큐, 층 = deque([root]), 0
print(f"{'층':<4}{'큐에서 꺼낸 것':<16}{'큐에 넣은 것':<16}{'큐 상태'}")
while 큐:
    이번층, 넣은것 = [], []
    for _ in range(len(큐)):          # 지금 큐에 있는 만큼만 꺼낸다 = 한 층
        t = 큐.popleft()
        이번층.append(t.val)
        for c in (t.left, t.right):
            if c:
                큐.append(c); 넣은것.append(c.val)
    print(f"{층:<4}{str(이번층):<16}{str(넣은것):<16}{[x.val for x in 큐]}")
    층 += 1
```

```
층   큐에서 꺼낸 것        큐에 넣은 것         큐 상태
0   [8]             [3, 10]         [3, 10]
1   [3, 10]         [1, 6, 14]      [1, 6, 14]
2   [1, 6, 14]      [4, 7, 13]      [4, 7, 13]
3   [4, 7, 13]      []              []
```

`for _ in range(len(큐))` 한 줄이 이 코드의 전부다. **반복문에 들어가기 전의 큐 길이가 곧 지금 층의 크기다.** 이 줄이 없으면 층 경계가 사라져서 전체가 한 줄로 나온다.

이 방식을 **너비 우선 탐색(BFS)** 이라 하고, 다음 편의 그래프에서 그대로 다시 쓴다. 트리는 갈래가 되돌아오지 않는 그래프라, 방문 표시를 안 해도 된다는 점만 다르다.

## 4. 재귀 깊이 — 파이썬은 1000에서 멈춘다

**트리가 깊으면 재귀가 오류로 죽는다. 코딩 테스트에서 원인을 못 찾고 헤매는 자리다.**

파이썬은 자기 자신을 부르는 깊이에 한계를 둔다. 기본값이 1000이고, 넘으면 `RecursionError` 가 난다. 트리의 높이가 그만큼 깊으면 2절의 순회 코드가 그대로 죽는다.

```python
import sys

print("파이썬 기본 재귀 한계", sys.getrecursionlimit())

def 깊이(n):
    if n == 0: return 0
    return 1 + 깊이(n - 1)

for n in (900, 3000):
    try:
        print(f"깊이 {n:>5} → {깊이(n)}")
    except RecursionError:
        print(f"깊이 {n:>5} → RecursionError")

sys.setrecursionlimit(10_000)
print("한계를 10,000 으로 올린 뒤")
print(f"깊이  3000 → {깊이(3000)}")
```

```
파이썬 기본 재귀 한계 1000
깊이   900 → 900
깊이  3000 → RecursionError
한계를 10,000 으로 올린 뒤
깊이  3000 → 3000
```

`sys.setrecursionlimit(10**6)` 를 코드 맨 위에 적어 두는 것이 코딩 테스트의 관행이다. 값이 십만 개인 문제에서 트리가 한 줄로 늘어지면 깊이가 십만이 되기 때문이다.

한계를 올린다고 무한정 되지는 않는다. 재귀는 부를 때마다 실제 메모리를 쓰니, 너무 깊으면 오류 대신 프로그램이 통째로 죽는다. **깊이가 수십만을 넘길 것 같으면 아예 스택으로 바꾸는 편이 안전하다.**

## 5. 이진 탐색 트리 — 왼쪽은 작고 오른쪽은 크다

**모든 마디에서 "왼쪽 갈래는 전부 나보다 작고 오른쪽 갈래는 전부 나보다 크다"가 성립하면 이진 탐색 트리다.**

이 글의 트리가 그렇다. 뿌리 8을 보면 왼쪽 갈래에 1·3·4·6·7이 있고 오른쪽 갈래에 10·13·14가 있다. 3을 봐도 왼쪽에 1, 오른쪽에 4·6·7이다.

이 규칙 하나가 두 가지를 공짜로 준다. 하나는 2절에서 본 것 — **중위로 훑으면 정렬된 순서가 나온다.** 왼쪽을 다 보고 나를 보고 오른쪽을 보니 당연히 작은 것부터 나온다.

다른 하나가 본론이다. 값을 찾을 때 **한 번 비교할 때마다 갈래 하나를 통째로 버릴 수 있다.** 앞 편의 이분 탐색과 같은 구조인데, 배열이 아니라 트리 위에서 한다.

```python
def 넣기(t, v):
    if t is None: return Node(v)
    if v < t.val: t.left  = 넣기(t.left, v)
    else:         t.right = 넣기(t.right, v)
    return t

def 찾기(t, v):
    회차 = 0
    while t:
        회차 += 1
        방향 = "찾음" if v == t.val else ("왼쪽" if v < t.val else "오른쪽")
        기호 = '=' if v == t.val else ('<' if v < t.val else '>')
        print(f"  {회차}회  지금 {t.val:>2}  {v} {기호} {t.val}  → {방향}")
        if v == t.val: return 회차
        t = t.left if v < t.val else t.right
    print(f"  {회차}회  더 갈 곳이 없다 → 없음")
    return -1

균형 = None
for v in (8, 3, 10, 1, 6, 14, 4, 7, 13):
    균형 = 넣기(균형, v)

한줄 = None
for v in (1, 3, 4, 6, 7, 8, 10, 13, 14):       # 정렬된 순서로 넣는다
    한줄 = 넣기(한줄, v)

print("균형 잡힌 트리에서 13 찾기")
a = 찾기(균형, 13)
print("\n정렬된 순서로 넣어 한 줄이 된 트리에서 13 찾기")
b = 찾기(한줄, 13)
print(f"\n같은 값 아홉 개인데 {a}회 vs {b}회")
```

```
균형 잡힌 트리에서 13 찾기
  1회  지금  8  13 > 8  → 오른쪽
  2회  지금 10  13 > 10  → 오른쪽
  3회  지금 14  13 < 14  → 왼쪽
  4회  지금 13  13 = 13  → 찾음

정렬된 순서로 넣어 한 줄이 된 트리에서 13 찾기
  1회  지금  1  13 > 1  → 오른쪽
  2회  지금  3  13 > 3  → 오른쪽
  3회  지금  4  13 > 4  → 오른쪽
  4회  지금  6  13 > 6  → 오른쪽
  5회  지금  7  13 > 7  → 오른쪽
  6회  지금  8  13 > 8  → 오른쪽
  7회  지금 10  13 > 10  → 오른쪽
  8회  지금 13  13 = 13  → 찾음

같은 값 아홉 개인데 4회 vs 8회
```

## 6. 한 줄로 늘어지면 트리가 아니다

**같은 값 아홉 개를 같은 코드로 넣었는데 회차가 두 배 차이 났다. 넣은 순서만 달랐다.**

정렬된 순서로 넣으면 새 값이 매번 오른쪽 끝에 붙는다. 그러면 왼쪽 갈래가 하나도 안 생겨서, 트리가 아니라 그냥 연결된 한 줄이 된다.

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 500 210" role="img" aria-label="왼쪽에는 균형 잡힌 트리가 네 층으로 그려져 있고 오른쪽에는 같은 값들이 오른쪽으로만 계속 이어진 한 줄짜리 트리가 그려져 있다. 왼쪽은 높이 3, 오른쪽은 높이 8 이라고 적혀 있다." style="width:100%; max-width:500px; height:auto; font-family:var(--font-sans)">
<text x="6" y="12" style="font-size:12px; fill:var(--text-secondary)">뒤섞어 넣으면 — 높이 3</text>
<text x="250" y="12" style="font-size:12px; fill:var(--accent-primary)">정렬된 순서로 넣으면 — 높이 8</text>
<g style="stroke:var(--border-color); stroke-width:1.2">
<line x1="110" y1="36" x2="66" y2="66"/><line x1="110" y1="36" x2="154" y2="66"/>
<line x1="66" y1="80" x2="38" y2="110"/><line x1="66" y1="80" x2="94" y2="110"/>
<line x1="154" y1="80" x2="182" y2="110"/>
<line x1="94" y1="124" x2="74" y2="154"/><line x1="94" y1="124" x2="114" y2="154"/>
<line x1="182" y1="124" x2="162" y2="154"/></g>
<g style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.2">
<circle cx="110" cy="30" r="13"/><circle cx="66" cy="74" r="13"/><circle cx="154" cy="74" r="13"/>
<circle cx="38" cy="118" r="13"/><circle cx="94" cy="118" r="13"/><circle cx="182" cy="118" r="13"/>
<circle cx="74" cy="162" r="13"/><circle cx="114" cy="162" r="13"/><circle cx="162" cy="162" r="13"/></g>
<g style="font-size:11px; fill:var(--text-primary); text-anchor:middle; font-family:var(--font-mono)">
<text x="110" y="34">8</text><text x="66" y="78">3</text><text x="154" y="78">10</text>
<text x="38" y="122">1</text><text x="94" y="122">6</text><text x="182" y="122">14</text>
<text x="74" y="166">4</text><text x="114" y="166">7</text><text x="162" y="166">13</text></g>
<g style="stroke:var(--accent-primary); stroke-width:1.2">
<line x1="288" y1="36" x2="308" y2="56"/><line x1="308" y1="76" x2="328" y2="96"/>
<line x1="328" y1="116" x2="348" y2="136"/><line x1="348" y1="156" x2="368" y2="176"/></g>
<g style="stroke:var(--accent-primary); stroke-width:1.2; stroke-dasharray:3 2">
<line x1="368" y1="196" x2="392" y2="200"/></g>
<g style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:1.6">
<circle cx="288" cy="30" r="13"/><circle cx="308" cy="70" r="13"/><circle cx="328" cy="110" r="13"/>
<circle cx="348" cy="150" r="13"/><circle cx="368" cy="190" r="13"/></g>
<g style="font-size:11px; fill:var(--text-primary); text-anchor:middle; font-family:var(--font-mono)">
<text x="288" y="34">1</text><text x="308" y="74">3</text><text x="328" y="114">4</text>
<text x="348" y="154">6</text><text x="368" y="194">7</text></g>
<text x="400" y="196" style="font-size:11px; fill:var(--text-muted); font-family:var(--font-mono)">8 → 10 → 13 → 14</text>
<text x="20" y="196" style="font-size:11px; fill:var(--text-muted)">13 찾는 데 4회</text>
<text x="196" y="152" style="font-size:11px; fill:var(--accent-primary)">13 찾는 데 8회</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">오른쪽은 왼쪽 갈래가 하나도 안 생겨 매번 오른쪽으로만 내려간다. 값이 십만 개면 높이도 십만이 되어 찾기가 O(n) 이 되고, 순회 재귀는 넷째 절의 한계에 걸려 죽는다.</figcaption>
</figure>

값이 n개일 때 균형 잡힌 트리의 높이는 대략 log n 이고, 한 줄로 늘어진 트리의 높이는 n 이다. **이진 탐색 트리가 O(log n)이라는 말은 균형이 잡혀 있을 때만 참이다.**

실무 데이터베이스나 표준 라이브러리는 넣을 때마다 트리를 스스로 다시 세우는 **자가 균형** 트리를 쓴다. 레드-블랙 트리나 AVL 트리라는 이름을 들어 봤다면 그것들이다. 원리는 "한쪽이 너무 깊어지면 회전시켜 낮춘다"인데, 구현이 길어서 코딩 테스트에서 직접 짜는 일은 거의 없다.

**그래서 코딩 테스트에서는 이진 탐색 트리를 직접 만들지 않는다.** 정렬된 상태에서 찾는 일은 앞 편의 `bisect` 로, 넣고 빼면서 최솟값만 필요한 일은 다음 절의 힙으로 푼다. 이진 탐색 트리는 그 둘의 배경으로 알아 두는 쪽이 실속 있다.

## 7. 힙 — 가장 작은 것 하나만 빨리

**전체를 정렬하지 않고 최솟값 하나만 꺼내는 구조가 힙이다.**

문제 상황을 보자. 값이 계속 들어오는데 그때마다 "지금까지 중 가장 작은 것"을 꺼내야 한다. 매번 정렬하면 값 하나 들어올 때마다 O(n log n)이라 감당이 안 된다.

힙은 이 일만 한다. 넣기와 최솟값 빼기가 각각 O(log n)이고, **최솟값 보기는 O(1)** 이다. 대신 다른 것은 잘 못한다 — "세 번째로 작은 값"을 물으면 힙은 답을 모른다.

```python
import heapq

값 = [23, 5, 38, 2, 45, 8, 16, 12]
힙 = []
print(f"{'넣는 값':<8}{'힙 안쪽(리스트 그대로)':<34}{'맨 앞(가장 작은 값)'}")
for v in 값:
    heapq.heappush(힙, v)
    print(f"{v:<8}{str(힙):<34}{힙[0]}")

print()
print("작은 것부터 꺼내기")
꺼낸것 = []
while 힙:
    꺼낸것.append(heapq.heappop(힙))
print(" ", 꺼낸것)
print(" 정렬한 것과 같나:", 꺼낸것 == sorted(값))
```

```
넣는 값    힙 안쪽(리스트 그대로)                     맨 앞(가장 작은 값)
23      [23]                              23
5       [5, 23]                           5
38      [5, 23, 38]                       5
2       [2, 5, 38, 23]                    2
45      [2, 5, 38, 23, 45]                2
8       [2, 5, 8, 23, 45, 38]             2
16      [2, 5, 8, 23, 45, 38, 16]         2
12      [2, 5, 8, 12, 45, 38, 16, 23]     2

작은 것부터 꺼내기
  [2, 5, 8, 12, 16, 23, 38, 45]
 정렬한 것과 같나: True
```

가운데 칸을 보자. 힙 안쪽은 **정렬돼 있지 않다.** `[2, 5, 8, 12, 45, 38, 16, 23]` 에서 45가 38보다 앞에 있다. 그런데 맨 앞은 언제나 최솟값이다.

이 어중간함이 힙의 값어치다. 완전히 정렬하려면 비싸고, 아무 정리도 안 하면 최솟값을 매번 찾아야 한다. 힙은 **"맨 앞만 최솟값"이라는 약한 규칙만 지키고, 그 대가로 넣기와 빼기를 싸게 한다.**

## 8. 힙은 사실 배열이다

**힙이 트리처럼 보이지만 코드에는 연결선이 없다. 칸 번호로 부모와 자식을 계산한다.**

앞 절의 출력이 리스트였던 것이 그래서다. 칸 `i` 에 대해 왼쪽 자식은 `2i+1`, 오른쪽 자식은 `2i+2`, 부모는 `(i-1)//2` 다. 이 계산만 있으면 `Node` 클래스도 `left`·`right` 자리도 필요 없다.

```python
힙 = [2, 5, 8, 12, 45, 38, 16, 23]

print(f"{'칸':<4}{'값':<5}{'부모 칸':<9}{'왼쪽 자식':<11}{'오른쪽 자식':<12}{'부모 값 ≤ 내 값'}")
for i, v in enumerate(힙):
    부모 = (i - 1) // 2 if i > 0 else None
    왼, 오 = 2*i + 1, 2*i + 2
    왼 = 왼 if 왼 < len(힙) else None
    오 = 오 if 오 < len(힙) else None
    지킴 = "-" if 부모 is None else ("예" if 힙[부모] <= v else "아니오")
    print(f"{i:<4}{v:<5}{str(부모):<9}{str(왼):<11}{str(오):<12}{지킴}")

print("\n칸 번호만으로 부모·자식을 계산하니 연결선을 따로 안 들고 있어도 된다.")
```

```
칸   값    부모 칸     왼쪽 자식      오른쪽 자식      부모 값 ≤ 내 값
0   2    None     1          2           -
1   5    0        3          4           예
2   8    0        5          6           예
3   12   1        7          None        예
4   45   1        None       None        예
5   38   2        None       None        예
6   16   2        None       None        예
7   23   3        None       None        예

칸 번호만으로 부모·자식을 계산하니 연결선을 따로 안 들고 있어도 된다.
```

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 500 232" role="img" aria-label="위쪽에 힙을 트리 모양으로 그리고 아래쪽에 같은 값들을 배열 여덟 칸으로 그린 그림. 트리의 각 마디에서 배열의 같은 칸으로 점선이 이어져 있고, 칸 번호가 위에서 아래로 왼쪽부터 차례로 붙는 것을 보인다." style="width:100%; max-width:500px; height:auto; font-family:var(--font-sans)">
<text x="6" y="14" style="font-size:12px; fill:var(--text-secondary)">트리로 보면</text>
<g style="stroke:var(--border-color); stroke-width:1.2">
<line x1="250" y1="34" x2="170" y2="66"/><line x1="250" y1="34" x2="330" y2="66"/>
<line x1="170" y1="82" x2="130" y2="114"/><line x1="170" y1="82" x2="210" y2="114"/>
<line x1="330" y1="82" x2="290" y2="114"/><line x1="330" y1="82" x2="370" y2="114"/>
<line x1="130" y1="130" x2="110" y2="154"/></g>
<g style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.4">
<circle cx="170" cy="74" r="14"/><circle cx="330" cy="74" r="14"/>
<circle cx="130" cy="122" r="14"/><circle cx="210" cy="122" r="14"/>
<circle cx="290" cy="122" r="14"/><circle cx="370" cy="122" r="14"/>
<circle cx="110" cy="166" r="14"/></g>
<circle cx="250" cy="26" r="14" style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:2.5"/>
<g style="font-size:12px; fill:var(--text-primary); text-anchor:middle; font-family:var(--font-mono)">
<text x="250" y="30">2</text><text x="170" y="78">5</text><text x="330" y="78">8</text>
<text x="130" y="126">12</text><text x="210" y="126">45</text><text x="290" y="126">38</text><text x="370" y="126">16</text>
<text x="110" y="170">23</text></g>
<g style="font-size:9.5px; fill:var(--text-muted); text-anchor:middle; font-family:var(--font-mono)">
<text x="272" y="16">0</text><text x="150" y="62">1</text><text x="352" y="62">2</text>
<text x="110" y="110">3</text><text x="230" y="110">4</text><text x="270" y="110">5</text><text x="390" y="110">6</text>
<text x="90" y="154">7</text></g>
<text x="6" y="207" style="font-size:12px; fill:var(--text-secondary)">배열로 담으면</text>
<g style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.2">
<rect x="130" y="194" width="34" height="18"/><rect x="166" y="194" width="34" height="18"/>
<rect x="202" y="194" width="34" height="18"/><rect x="238" y="194" width="34" height="18"/>
<rect x="274" y="194" width="34" height="18"/><rect x="310" y="194" width="34" height="18"/>
<rect x="346" y="194" width="34" height="18"/></g>
<rect x="94" y="194" width="34" height="18" style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:2"/>
<g style="font-size:11.5px; fill:var(--text-primary); text-anchor:middle; font-family:var(--font-mono)">
<text x="111" y="207">2</text><text x="147" y="207">5</text><text x="183" y="207">8</text><text x="219" y="207">12</text>
<text x="255" y="207">45</text><text x="291" y="207">38</text><text x="327" y="207">16</text><text x="363" y="207">23</text></g>
<g style="font-size:9.5px; fill:var(--text-muted); text-anchor:middle; font-family:var(--font-mono)">
<text x="111" y="224">0</text><text x="147" y="224">1</text><text x="183" y="224">2</text><text x="219" y="224">3</text>
<text x="255" y="224">4</text><text x="291" y="224">5</text><text x="327" y="224">6</text><text x="363" y="224">7</text></g>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">배열은 <strong>층을 왼쪽부터 차례로 눕힌 것</strong>이다. 0층의 2, 1층의 5·8, 2층의 12·45·38·16 이 배열에 그 순서로 들어간다. 트리에서 5의 왼쪽 자식이 12인데 배열에서도 1번 칸의 자식 자리인 3번 칸에 12가 있다. 힙이 중간에 빈 자리를 허용하지 않는 이유가 이것이다 — 빈 자리가 생기면 이 계산이 깨진다.</figcaption>
</figure>

배열로 담을 수 있는 이유는 힙이 **위 층부터 왼쪽부터 빈틈없이 채워지는** 모양을 유지하기 때문이다. 앞 절 출력에서 값을 넣을 때마다 리스트 길이가 하나씩 늘기만 한 것이 그 증거다.

넣기와 빼기가 O(log n)인 것도 여기서 나온다. 새 값을 맨 끝에 붙인 뒤 부모와 비교하며 위로 올리는데, 부모로 가는 것은 칸 번호를 반으로 줄이는 일이라 높이만큼만 올라간다.

## 9. 실전 heapq — 최대 힙, 튜플, 상위 K

**파이썬 `heapq` 는 최소 힙만 준다. 나머지는 넣는 값을 바꿔서 해결한다.**

큰 것부터 꺼내야 하면 부호를 뒤집어 넣고 꺼낼 때 다시 뒤집는다. 값에 딸린 정보가 있으면 튜플로 묶어 넣는데, 튜플은 앞칸부터 비교하니 첫 칸이 정렬 기준이 된다.

```python
import heapq

값 = [23, 5, 38, 2, 45]

# 파이썬 heapq 는 작은 것부터만 꺼낸다. 큰 것부터 꺼내려면 부호를 뒤집는다.
최대힙 = []
for v in 값:
    heapq.heappush(최대힙, -v)
print("큰 것부터", [-heapq.heappop(최대힙) for _ in range(len(값))])

# 값 말고 딸린 정보도 같이 넣으려면 튜플로 — 앞칸부터 비교한다
작업 = [(2, "리포트"), (1, "장애 대응"), (3, "회의"), (1, "배포 롤백")]
h = []
for 순위, 이름 in 작업:
    heapq.heappush(h, (순위, 이름))
print("급한 것부터")
while h:
    순위, 이름 = heapq.heappop(h)
    print(f"  {순위}순위  {이름}")
```

```
큰 것부터 [45, 38, 23, 5, 2]
급한 것부터
  1순위  배포 롤백
  1순위  장애 대응
  2순위  리포트
  3순위  회의
```

1순위가 둘인데 "배포 롤백"이 먼저 나왔다. 순위가 같으면 튜플의 둘째 칸으로 넘어가 이름을 가나다순으로 비교하기 때문이다. **순서를 넣은 차례대로 유지하고 싶으면 `(순위, 들어온 번호, 이름)` 처럼 칸을 하나 더 둔다.** 둘째 칸을 비워 두면 이름 비교로 넘어가 버린다.

가장 자주 쓰는 것은 "값이 아주 많은데 큰 것 K개만 필요한" 경우다. 세 가지 방법을 재 보자.

```python
import heapq, random, time

random.seed(7)
값 = [random.randint(1, 1_000_000) for _ in range(200_000)]
K = 10

def 재기(fn):
    t = time.perf_counter()
    r = fn()
    return (time.perf_counter() - t) * 1000, r

def 전부정렬():
    return sorted(값, reverse=True)[:K]

def 힙K칸():
    h = []
    for v in 값:
        heapq.heappush(h, v)
        if len(h) > K:
            heapq.heappop(h)       # 가장 작은 것을 버린다
    return sorted(h, reverse=True)

def nlargest():
    return heapq.nlargest(K, 값)

print(f"값 {len(값):,}개 중 큰 것 {K}개")
print(f"{'방법':<16}{'시간(ms)':>10}{'들고 있는 칸':>14}")
답 = []
for 이름, fn, 칸 in (("전부 정렬", 전부정렬, f"{len(값):,}"),
                    ("힙 K칸 직접", 힙K칸, str(K)),
                    ("heapq.nlargest", nlargest, str(K))):
    ms, r = 재기(fn)
    답.append(r)
    print(f"{이름:<16}{ms:>10.1f}{칸:>14}")
print(f"\n세 답이 모두 같나 {답[0] == 답[1] == 답[2]}")
```

```
값 200,000개 중 큰 것 10개
방법                  시간(ms)       들고 있는 칸
전부 정렬                 21.9       200,000
힙 K칸 직접               31.9            10
heapq.nlargest         2.2            10

세 답이 모두 같나 True
```

밀리초는 기계마다 다르지만 셋의 순서는 어디서 돌려도 같다. **직접 짠 힙이 전부 정렬보다 느리다.** 예상과 반대라 놀랄 만한 결과인데 이유가 있다. 파이썬의 `sorted` 는 C로 짜여 있고, 직접 짠 반복문은 파이썬으로 한 줄씩 돈다. 계산 횟수는 힙이 적지만 한 번의 비용이 훨씬 비싸다.

`nlargest` 가 압도적인 것도 같은 이유다. 힙과 같은 방법을 쓰되 C로 도니, 적은 계산 횟수의 이득이 그대로 나온다.

여기서 두 가지를 가져가면 된다. **첫째, 파이썬에서는 표준 라이브러리 함수가 거의 항상 직접 짠 반복문보다 빠르다.** 둘째, 그래도 직접 짠 힙에는 값어치가 있다 — **들고 있는 칸이 K개뿐이다.** 값이 파일에서 한 줄씩 들어와 전부 담을 수 없을 때는 이 방법밖에 없다.

## 10. 어느 것을 언제 쓰나

**입력의 모양과 무엇을 묻는지로 갈린다.**

먼저 입력이 트리 모양인지 본다. "부모", "상사", "폴더", "조상"처럼 위아래 관계가 있으면 트리다. 이때 층을 물으면 큐로 층별 순회를, 자식을 다 처리해야 부모를 처리할 수 있으면 후위 순회를 쓴다.

값이 정렬된 상태에서 찾는 일이라면 이진 탐색 트리를 직접 만들지 말고 **앞 편의 `bisect`** 를 쓴다. 파이썬 리스트는 가운데 삽입이 O(n)이라 넣기가 잦으면 불리하지만, 코딩 테스트 범위에서는 대체로 통과한다.

값이 계속 들어오면서 **최솟값이나 최댓값 하나만** 반복해서 필요하면 힙이다. "가장 급한 작업", "가장 가까운 점", "지금까지 중 K번째"가 전부 이 꼴이다. 다음 편의 최단 경로 알고리즘도 속에 힙을 쓴다.

마지막으로 재귀를 쓸 때는 깊이를 먼저 생각한다. **입력 크기가 만을 넘으면 `sys.setrecursionlimit` 을 맨 위에 적어 두는 것이 습관이 되어야 한다.**

## 한눈 정리

| 상황 | 쓸 것 | 왜 |
|---|---|---|
| 트리를 그대로 저장하거나 복사한다 | 전위 순회 | 뿌리부터 나와 위에서 아래로 다시 만든다 |
| 이진 탐색 트리를 정렬된 순서로 본다 | 중위 순회 | 왼쪽·나·오른쪽 순서가 곧 크기 순서 |
| 자식을 다 처리해야 부모를 처리한다 | 후위 순회 | 폴더 크기, 트리 삭제 |
| "몇 층인가", "각 층에 무엇이" | 큐로 층별 순회 | 반복문 전의 큐 길이가 그 층의 크기 |
| 재귀가 깊어질 것 같다 | `sys.setrecursionlimit` | 기본 한계가 1000뿐 |
| 정렬된 값에서 찾기·넣기 | `bisect` | 이진 탐색 트리를 직접 안 짜도 된다 |
| 최솟값 하나만 반복해서 꺼낸다 | `heapq` | 넣기·빼기 O(log n), 최솟값 보기 O(1) |
| 큰 것부터 꺼낸다 | 부호를 뒤집어 넣는다 | 파이썬은 최소 힙만 준다 |
| 값에 정보를 붙여 넣는다 | 튜플 `(기준, 순번, 값)` | 앞칸부터 비교하니 둘째 칸을 비우면 안 된다 |
| 아주 많은 값 중 상위 K개 | `heapq.nlargest` | C로 돌아 직접 짠 힙보다 빠르다 |

## 헷갈리기 쉬운 점

- **이진 탐색 트리가 항상 O(log n)은 아니다.** 정렬된 순서로 넣으면 한 줄이 되어 O(n)이 된다. 같은 값 아홉 개로 4회와 8회가 갈렸다.
- **중위 순회가 정렬을 주는 것은 이진 탐색 트리일 때뿐이다.** 아무 이진 트리에서 중위로 훑으면 그냥 뒤섞인 순서가 나온다.
- **힙 안쪽은 정렬돼 있지 않다.** 맨 앞만 최솟값이고, 둘째로 작은 값이 어디 있는지는 정해져 있지 않다.
- **파이썬 `heapq` 는 최대 힙이 없다.** 부호를 뒤집는데, 값이 문자열이면 이 방법이 안 통하니 정렬 기준을 따로 만들어야 한다.
- **튜플로 넣을 때 둘째 칸을 비우지 마라.** 첫 칸이 같으면 둘째 칸을 비교하는데, 거기 비교할 수 없는 것이 오면 오류가 난다.
- **직접 짠 힙이 `sorted` 보다 빠르다고 단정하지 마라.** 파이썬에서는 반대인 경우가 흔하다. 힙의 값어치는 속도보다 **들고 있는 칸이 K개뿐**이라는 쪽이다.
- **재귀 한계는 올려도 무한이 아니다.** 너무 깊으면 오류 대신 프로그램이 통째로 죽는다.

## 더 깊이 보기

- 이 글의 층별 순회가 다음 편 그래프의 너비 우선 탐색과 같은 코드다. 트리는 되돌아오는 갈래가 없어 방문 표시가 필요 없다는 점만 다르다.
- [이분 탐색과 스택](post.html?id=algorithm-binary-search-stack) 편의 `bisect` 가 이진 탐색 트리를 직접 짜지 않아도 되는 이유다. 스택으로 재귀를 바꾸는 이야기도 그 편에 있다.
- [해시와 정렬](post.html?id=algorithm-hash-sort) 편의 안정 정렬과 튜플 `key` 가 힙에 튜플을 넣을 때 그대로 쓰인다.
- 광고 서빙에서 후보 광고 중 상위 K개만 남기는 자리에 같은 구조가 쓰인다. [eCPM 랭킹](post.html?id=ecpm-ranking) 편이 그 이야기다.
