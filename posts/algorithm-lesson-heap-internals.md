지훈 씨는 트리의 종류를 배우다 힙(가장 작은 값이나 가장 큰 값을 늘 맨 앞에 두는 자료구조)이 완전 이진 트리(마지막 층을 빼고 모든 층이 꽉 차 있고 마지막 층은 왼쪽부터 채운 트리)라는 말을 듣고 물었습니다. 「완전 이진 트리는 규칙이 뭐예요? heapq 랑 어떤 관계예요?」

완전 이진 트리의 규칙은 칸이 빈자리 없이 놓인 모양 하나입니다. heapq 는 그 모양을 파이썬 리스트 하나에 담은 뒤 부모 칸의 값이 자식 칸의 값보다 크지 않다는 값의 규칙을 하나 더 지킵니다. [힙과 Top K](post.html?id=algorithm-lesson-heap-top-k) 편이 heapq 를 쓰는 법을 봤다면 이 글은 [트리와 BST](post.html?id=algorithm-lesson-tree-bst) 편 1절의 정의를 이어받아 heappush 와 heappop 이 리스트 안에서 값을 옮기는 순서를 봅니다.

**heappop 은 맨 앞 값을 꺼낸 빈칸을 왜 바로 아래 자식만으로 채우지 않고 리스트 끝의 값을 쓸까요?**

이 글은 heappop 도중 값이 없는 칸을 빈칸, 리스트 끝에서 떼어 낸 값을 마지막 값이라고 부릅니다. 리스트는 끝에서만 O(1) 에 한 칸을 줄일 수 있어서 빈칸은 결국 마지막 값으로 채웁니다. 채우는 순서에 따라 무작위로 고른 서로 다른 값 1,000개 한 벌(seed 0)을 모두 꺼내는 비교가 교과서 방식 15,003번, heapq 8,650번으로 다르지만 남는 리스트는 같습니다.

> **한 줄 요약:** heapq 의 힙은 i번 칸의 부모 칸이 (i - 1) // 2, 자식 칸이 2i + 1 과 2i + 2 인 리스트이고 모든 부모와 자식 사이에서 부모 ≤ 자식(힙 규칙)을 지켜 맨 앞 값 heap[0] 이 가장 작지만 층끼리는 정렬돼 있지 않습니다. heappush 는 끝에 붙인 값을 부모보다 작은 동안 올립니다. heappop 은 꺼낸 빈칸을 리스트 끝의 마지막 값으로 채우는데 교과서 방식은 마지막 값을 0번 칸에서 내리고 CPython 의 heapq 는 빈칸을 잎까지 내린 뒤 마지막 값을 올립니다. 값이 모두 다를 때 두 방식의 리스트는 같고 무작위로 고른 서로 다른 값 1,000개 한 벌(seed 0)을 모두 꺼내는 비교는 15,003번과 8,650번입니다.

> **골라 읽는 법** — 절이 10개인 긴 글입니다. 처음부터 다 읽지 않아도 됩니다.
>
> - 완전 이진 트리와 칸 번호, 부모와 자식에만 걸리는 힙 규칙 → 1~3절
> - heappush 와 heappop 의 자리 이동, 마지막 값을 쓰는 까닭 → 4~5절
> - CPython 3.9 의 heappop 과 직접 짠 함수의 비교 수 → 6절
> - 최대 힙에서 두 번째로 큰 값 → 7절
> - 힙으로 푸는 LeetCode 문제 3개(1046, 703, 912) → 8~10절

---

## 1. 완전 이진 트리와 리스트 칸 번호

**완전 이진 트리는 마지막 층을 빼고 모든 층이 꽉 차 있고 마지막 층은 왼쪽부터 빈자리 없이 채운 트리입니다. 위층부터, 같은 층은 왼쪽부터 리스트에 담으면 중간에 빈자리가 없어서 i번 칸의 부모 칸은 (i - 1) // 2, 왼쪽 자식 칸은 2i + 1, 오른쪽 자식 칸은 2i + 2 로 계산하고 이 계산은 칸이 몇 개든 O(1) 입니다.**

지훈 씨는 이름의 뜻도 물었습니다. 「'완전'은 무슨 뜻이에요?」 모든 층이 꽉 찼다는 뜻이 아니라 빈자리 없이 왼쪽부터 채웠다는 뜻입니다. 과외에서 「마지막 줄 빼고 위는 꽉 차 있고 마지막 줄도 왼쪽부터 빈틈없이 채움」이라고 한 정의도 교과서와 같습니다. 모든 층이 꽉 찬 트리는 포화 이진 트리(perfect binary tree)라고 따로 부르고 이 트리도 완전 이진 트리입니다. 과외에서 「외동 자식 없음」으로 푼 정 이진 트리(full binary tree)는 책에 따라 포화 이진 트리를 뜻하기도 하고 모든 노드의 자식이 0개나 2개인 트리를 뜻하기도 해서 트리와 BST 편 1절처럼 이 글도 쓰지 않습니다.

LeetCode 의 트리 배열처럼 위층부터, 같은 층은 왼쪽부터 적으면 완전 이진 트리는 빈자리가 마지막 층의 오른쪽 끝에만 있어 리스트 끝 뒤로 밀려나므로 None 없이 적힙니다. 거꾸로 층별 배열에서 None 뒤에 값이 하나라도 있으면 중간이 비어 완전 이진 트리가 아닙니다. 과외의 그림 두 장은 `[1, 2, 3, 4, 5, 6]` 과 4 의 자리가 빈 `[1, 2, 3, None, 5, 6]` 입니다.

빈자리가 없으니 칸 번호만으로 부모와 자식을 찾습니다. i번 칸 앞의 칸 i개가 자식 자리를 2개씩 먼저 차지하고 0번 칸(트리의 루트 칸)은 누구의 자식도 아니므로 i번 칸의 왼쪽 자식 칸은 2i + 1, 오른쪽 자식 칸은 2i + 2 이고 부모 칸은 거꾸로 (i - 1) // 2 입니다. 층은 데모와 같이 0번 칸을 1층으로 세서 i번 칸이 floor(log2(i + 1)) + 1 층입니다(트리와 BST 편은 루트를 0층으로 셌습니다). 아래 표는 과외에서 쓴 가상의 최대 힙 `[90, 80, 75, 50, 60, 70]` 을 이 식으로 계산한 값입니다.

| 칸 | 값 | 층 | 부모 칸 | 왼쪽 자식 칸 | 오른쪽 자식 칸 |
|---|---|---|---|---|---|
| 0 | 90 | 1 | 없음 | 1 | 2 |
| 1 | 80 | 2 | 0 | 3 | 4 |
| 2 | 75 | 2 | 0 | 5 | 없음 (6번 칸이 없다) |
| 3 | 50 | 3 | 1 | 없음 | 없음 |
| 4 | 60 | 3 | 1 | 없음 | 없음 |
| 5 | 70 | 3 | 2 | 없음 | 없음 |

과외에서 저는 이 계산으로 부모와 자식을 「0.0001초 만에」 찾고 「메모리 낭비 0개」라고 했는데 측정하지 않은 시간과 근거 없는 개수라 지웁니다. 칸 번호 계산은 칸이 몇 개든 산수 두 번이라 O(1) 이고 노드마다 left 와 right 를 담는 TreeNode 가 필요 없습니다. 아래 코드는 두 층별 배열을 판정하고 표의 값을 계산합니다.

```python
# 하는 일: 층별 배열 두 개가 완전 이진 트리인지 판정하고 [90, 80, 75, 50, 60, 70] 의 칸마다 층, 부모 칸, 자식 칸을 계산한다.
import math  # 층을 구하는 floor 와 log2

# 1단계: 층별 배열이 완전 이진 트리인지 본다
# 위층부터, 같은 층은 왼쪽부터 적은 배열에서 None 뒤에 값이 하나라도 있으면 중간에 빈자리가 있다.
def is_complete(level_order):  # 층별 배열을 받는다
    seen_none = False  # 아직 None 을 보지 못했다
    for value in level_order:  # 앞 칸부터 하나씩
        if value is None:  # 빈자리를 만나면
            seen_none = True  # 본 것을 적어 둔다
        elif seen_none:  # 빈자리 뒤에 값이 있으면
            return False  # 중간이 빈 트리다
    return True  # 빈자리가 있어도 모두 끝에 있다

for level_order in ([1, 2, 3, 4, 5, 6], [1, 2, 3, None, 5, 6]):  # 과외 그림의 두 트리
    print(f'{level_order} → 완전 이진 트리 {is_complete(level_order)}')  # 판정을 찍는다

# 2단계: 칸마다 층, 부모 칸, 자식 칸을 계산한다
# 0번 칸이 있는 층을 1층으로 센다. 칸 번호가 리스트 길이 이상이면 그 자식은 없다.
heap = [90, 80, 75, 50, 60, 70]  # 과외에서 쓴 최대 힙
n = len(heap)  # 칸 수 6
for i in range(n):  # 0번 칸부터 차례로
    layer = math.floor(math.log2(i + 1)) + 1  # i번 칸의 층
    parent = (i - 1) // 2 if i > 0 else '없음'  # 0번 칸은 (0 - 1) // 2 = -1 이라 부모가 없다고 둔다
    left = 2 * i + 1 if 2 * i + 1 < n else '없음'  # 왼쪽 자식 칸
    right = 2 * i + 2 if 2 * i + 2 < n else '없음'  # 오른쪽 자식 칸
    print(f'{i}번 칸 {heap[i]}: {layer}층, 부모 칸 {parent}, 왼쪽 자식 칸 {left}, 오른쪽 자식 칸 {right}')  # 한 칸씩 찍는다

# 출력:
# 1단계 뜻: None 이 5 앞에 있는 배열만 완전 이진 트리가 아니다.
# [1, 2, 3, 4, 5, 6] → 완전 이진 트리 True
# [1, 2, 3, None, 5, 6] → 완전 이진 트리 False
# 2단계 뜻: 칸마다 계산한 층과 부모 칸, 자식 칸이 표와 같다.
# 0번 칸 90: 1층, 부모 칸 없음, 왼쪽 자식 칸 1, 오른쪽 자식 칸 2
# 1번 칸 80: 2층, 부모 칸 0, 왼쪽 자식 칸 3, 오른쪽 자식 칸 4
# 2번 칸 75: 2층, 부모 칸 0, 왼쪽 자식 칸 5, 오른쪽 자식 칸 없음
# 3번 칸 50: 3층, 부모 칸 1, 왼쪽 자식 칸 없음, 오른쪽 자식 칸 없음
# 4번 칸 60: 3층, 부모 칸 1, 왼쪽 자식 칸 없음, 오른쪽 자식 칸 없음
# 5번 칸 70: 3층, 부모 칸 2, 왼쪽 자식 칸 없음, 오른쪽 자식 칸 없음
```

0번 칸은 (0 - 1) // 2 가 -1 이라 부모가 없다고 따로 두었습니다. 파이썬의 `heap[-1]` 은 마지막 칸을 읽으므로 이 경우를 빼지 않으면 0번 칸의 부모로 70 을 읽습니다.

아래 데모는 이 리스트를 위쪽에 리스트로, 아래쪽에 트리로 보여 주고 노드 아래 작은 숫자가 칸 번호입니다. 「다음 쌍」을 처음 누르면 이번 단계 칸에 「1번 칸 80의 부모는 (1 - 1) // 2 = 0번 칸 90입니다. 90 ≥ 80이라 규칙을 지킵니다.」가 나오고 「끝까지」를 누르면 단계 6 / 6 에서 결과 칸에 「부모와 자식 5쌍 모두 부모 ≥ 자식」이 나옵니다. 마지막 단계는 7절에서 다시 봅니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-lesson-heap-internals.html?embed=1&mode=rule&preset=max-90" height="950" loading="lazy" title="최대 힙 리스트의 칸 번호와 부모 칸 미니 데모"></iframe>
<a class="demo-embed-open" href="demo-lesson-heap-internals.html?mode=rule&preset=max-90" target="_blank" rel="noopener">↗ 전체 데모로 열기</a>
</div>

## 2. 완전 이진 트리와 힙, 최소 힙과 최대 힙

**완전 이진 트리는 칸이 놓인 모양만 정하고 힙은 그 모양에서 모든 부모와 자식 사이의 값 규칙을 하나 더 지키는 트리라서 완전 이진 트리라고 모두 힙은 아닙니다. 부모 ≤ 자식이면 맨 앞 값이 가장 작은 최소 힙, 부모 ≥ 자식이면 맨 앞 값이 가장 큰 최대 힙이고 Python 3.9 의 heapq 에는 최소 힙 함수만 있어서 최대 힙은 값의 부호를 뒤집어 만듭니다.**

1절의 리스트를 최대 힙이라고 부르자 지훈 씨가 두 가지를 한꺼번에 물었습니다. 「완전 이진 트리가 곧 힙이에요? 힙은 최솟값만 찾는 것 아니었어요?」 둘 다 아닙니다. 과외에서 저는 완전 이진 트리를 붕어빵 틀에, 힙을 그 틀로 구운 붕어빵에 빗댔습니다. 리스트로 보면 `[50, 90, 10]` 은 칸 3개를 빈자리 없이 채운 완전 이진 트리지만 2번 칸의 10 이 부모 칸의 50 보다 작아 최소 힙이 아닙니다.

heapq [공식 문서](https://docs.python.org/3/library/heapq.html)는 최소 힙을 모든 부모 노드의 값이 자식 노드의 값보다 작거나 같은 이진 트리(binary trees for which every parent node has a value less than or equal to any of its children)로 정의하고 이 조건을 힙 규칙(heap invariant)이라고 부릅니다. 리스트로는 비교할 칸이 있는 모든 k 에서 `heap[k] <= heap[2*k+1]` 과 `heap[k] <= heap[2*k+2]` 이고 문서는 그 결과 가장 작은 값이 늘 루트 heap[0] 에 있다(its smallest element is always the root, heap[0])고 적습니다. 과외의 「부모 < 자식」, 「부모가 자식보다 무조건 우월」은 같은 값도 되도록 ≤ 로 고칩니다.

둘째 물음도 아닙니다. 모든 쌍에서 부모 ≥ 자식이면 맨 앞 값이 가장 큰 최대 힙이고 1절의 리스트가 그렇습니다. heapq 가 최소 힙만 다뤄서 힙을 최솟값으로 기억하기 쉽습니다. 과외에서 말한 「최소 힙으로만 동작하도록 설계」와 달리 지금 문서에는 Python 3.14 에서 생긴 최대 힙 함수가 있고(힙과 Top K 편 4절) 이 글의 코드는 3.9 에서 돌아 부호를 뒤집습니다. 「C++ 이나 Java 는 최대 힙이 기본이거나 옵션」이라는 과외의 말은 맞습니다. C++ 의 [priority_queue](https://en.cppreference.com/w/cpp/container/priority_queue) 는 기본으로 가장 큰 값을 맨 앞에 둡니다. Java 의 [PriorityQueue](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/PriorityQueue.html) 는 기본으로 가장 작은 값부터 꺼내지만 순서를 거꾸로 정한 Comparator(두 값의 순서를 정하는 객체)를 넘기면 가장 큰 값부터 꺼냅니다.

과외에서 「조금 더 쉽게」 다시 설명한 극장 의자 이야기는 설명의 1세와 데모 화면의 10세가 서로 맞지 않아 빼고 리스트 값으로 봅니다. 같은 과외의 비교 표에서 BST 탐색 O(log N) 은 [트리와 BST](post.html?id=algorithm-lesson-tree-bst) 편 9절처럼 높이 h 에 비례하는 O(h) 이고 「오직 1등 초고속 추출 O(1)」인 힙은 맨 앞 값을 보는 데 O(1), 꺼내는 데 O(log N) 입니다. 「빈틈 0%」는 빈자리가 없다는 뜻입니다.

아래 코드는 `[50, 90, 10]` 의 (자식 칸, 부모 칸) 두 쌍을 확인하고 과외의 코드처럼 `[50, 10, 90, 30, 70]` 을 그대로 넣은 최소 힙과 부호를 뒤집어 넣은 최대 힙을 비교합니다.

```python
# 하는 일: [50, 90, 10] 의 쌍을 최소 힙 규칙으로 확인하고 [50, 10, 90, 30, 70] 으로 최소 힙과 부호를 뒤집은 최대 힙을 만든다.
import heapq  # 표준 라이브러리의 힙 모듈

# 1단계: [50, 90, 10] 의 쌍을 확인한다
# 칸 3개를 빈자리 없이 채워 완전 이진 트리지만 모든 쌍이 부모 <= 자식이어야 최소 힙이다.
tree = [50, 90, 10]  # 과외의 예. 부모 50, 자식 90 과 10
for child in range(1, len(tree)):  # 0번 칸은 부모가 없어 1번 칸부터
    parent = (child - 1) // 2  # 부모 칸
    print(f'({child}, {parent}): {tree[parent]} <= {tree[child]} → {tree[parent] <= tree[child]}')  # (자식 칸, 부모 칸) 쌍마다 규칙을 찍는다

# 2단계: 같은 값을 최소 힙과 부호를 뒤집은 최대 힙에 넣는다
nums = [50, 10, 90, 30, 70]  # 과외에서 쓴 값
min_heap, max_heap = [], []  # 두 힙 모두 빈 리스트에서 시작한다
for x in nums:  # 값을 하나씩
    heapq.heappush(min_heap, x)  # 그대로 넣는다
    heapq.heappush(max_heap, -x)  # 부호를 뒤집어 넣는다. 90 은 -90 이 된다
print(f'최소 힙 {min_heap}, 가장 작은 값 {min_heap[0]}')  # 맨 앞 값이 가장 작은 값이다
print(f'부호를 뒤집은 힙 {max_heap}, 가장 큰 값 {-max_heap[0]}')  # 맨 앞 값의 부호를 되돌리면 가장 큰 값이다

# 출력:
# 1단계 뜻: 1번 칸 쌍은 규칙을 지키고 2번 칸 쌍은 어겨서 [50, 90, 10] 은 최소 힙이 아니다.
# (1, 0): 50 <= 90 → True
# (2, 0): 50 <= 10 → False
# 2단계 뜻: 같은 값으로 맨 앞 값이 10 인 최소 힙과 부호를 되돌리면 90 인 최대 힙을 만든다.
# 최소 힙 [10, 30, 90, 50, 70], 가장 작은 값 10
# 부호를 뒤집은 힙 [-90, -70, -50, -10, -30], 가장 큰 값 90
```

최소 힙 `[10, 30, 90, 50, 70]` 은 3번 칸의 50 이 2번 칸의 90 보다 작아 정렬돼 있지 않습니다. 그래도 힙인 까닭은 3절에서 봅니다. 데모의 [`[50, 90, 10]` 장면](demo-lesson-heap-internals.html?mode=rule&preset=not-heap)에서 「끝까지」를 누르면 2번 칸이 범례의 「규칙을 어긴 자식」 모양으로 바뀌고 결과 칸에 「2쌍 가운데 1쌍이 규칙을 어깁니다」가 나옵니다.

## 3. 층이 아니라 부모와 자식

**힙 규칙은 층 전체가 아니라 부모와 자식 사이에만 걸려서 3층의 값이 2층의 값보다 작을 수 있습니다. 그래도 모든 쌍이 규칙을 지키면 어느 칸에서 루트 칸까지 올라가는 길의 값이 줄어들기만 해서 맨 앞 값이 가장 작습니다. 아래 쌍이 규칙을 어긴 리스트에서는 heappop 이 작은 값부터 꺼내지 못합니다.**

지훈 씨는 「부모 ≤ 자식」을 층 사이의 규칙으로 들었습니다. 「힙에서는 첫 번째 줄보다 두 번째 줄의 값이 모두 크고 세 번째 줄은 두 번째 줄보다 항상 커야 해요? 제가 알던 heapq 는 맨 위만 최소나 최대를 지키는 줄 알았어요.」 앞의 물음은 아닙니다. 힙 규칙은 부모와 자식만 비교하고 부모와 자식이 아닌 칸끼리는 층이 달라도 비교하지 않습니다. 뒤의 말은 반만 맞아서 맨 앞 값만 가장 작다고 정해지지만 규칙은 모든 부모와 자식 쌍에 걸립니다.

과외에서 저는 「알고 계신 게 맞다」로 답을 시작하고 아래 줄은 대충 엉켜 있다고 했습니다. 그러자 지훈 씨가 다시 물었습니다. 「그래도 부모와 자식 사이의 관계는 지키는 거였어요? 저는 맨 위 노드만 지키는 줄 알았어요.」 맞습니다. 과외의 그림 `[10, 50, 20, 60, 70, 25, 30]` 에서 6쌍은 모두 부모 ≤ 자식입니다. 2층의 50 이 3층의 25 보다 크지만 둘은 부모와 자식이 아니라 규칙과 상관없습니다. 과외에서 붙인 「100점짜리」, 「100%」 같은 말은 지웁니다.

25 가 있는 5번 칸에서 부모 칸으로 올라가면 (5 - 1) // 2 = 2번 칸의 20, 다시 0번 칸의 10 이고 쌍마다 부모 ≤ 자식이라 값이 줄어들기만 합니다. 어느 칸에서 출발해도 이 길은 0번 칸에서 끝나므로 0번 칸의 값은 어느 칸의 값보다도 크지 않습니다. 과외에서 층마다 정렬하지 않는 까닭으로 댄 「모든 줄을 재배치하면 O(N) 이나 O(N log N)」은 근거가 없어 지웁니다. 힙이 값 하나를 넣고 꺼낼 때 하는 비교는 4절과 5절에서 셉니다.

과외에서 저는 아래가 제멋대로라면 맨 앞 값을 꺼낸 뒤 「수만 개의 노드를 다 뒤져야」 한다고 했지만 heappop 은 규칙을 믿고 작은 자식 쪽 길 하나만 내려가므로 다 뒤지지 않고 틀린 값을 꺼냅니다. `[0, 5, 1, 2, 9, 3, 4]` 는 맨 앞 값 0 이 가장 작지만 3번 칸의 2 가 부모 1번 칸의 5 보다 작은 리스트입니다. 아래 코드는 그림의 6쌍과 층이 다른 두 칸을 비교하고 25 에서 루트 칸까지 올라간 뒤 이 리스트에서 heappop 을 일곱 번 합니다.

```python
# 하는 일: 최소 힙의 6쌍과 층이 다른 두 칸을 비교하고 25 에서 루트 칸까지 올라간 뒤, 규칙을 어긴 리스트에서 heappop 한 순서를 찍는다.
import heapq  # heappop 을 쓴다

# 1단계: 부모와 자식 쌍과 층이 다른 두 칸을 비교한다
# 6쌍이 모두 부모 <= 자식이면 최소 힙이다. 2층의 50 과 3층의 25 는 부모와 자식이 아니다.
heap = [10, 50, 20, 60, 70, 25, 30]  # 과외 그림의 최소 힙
pairs = [(heap[(i - 1) // 2], heap[i]) for i in range(1, len(heap))]  # (부모 값, 자식 값) 6쌍
print(f'(부모, 자식) {pairs}')  # 어떤 쌍인지 찍는다
print(f'6쌍 모두 부모 <= 자식 {all(p <= c for p, c in pairs)}')  # 힙 규칙을 지키나
print(f'2층 1번 칸 {heap[1]} > 3층 5번 칸 {heap[5]} → {heap[1] > heap[5]}')  # 층으로는 거꾸로다

# 2단계: 25 에서 루트 칸까지 올라간다
i = 5  # 25 가 있는 칸
path = [heap[i]]  # 지나는 값을 모은다
while i > 0:  # 루트 칸에 닿을 때까지
    i = (i - 1) // 2  # 부모 칸으로 올라간다
    path.append(heap[i])  # 그 칸의 값을 모은다
print(f'5번 칸에서 루트 칸까지 {path}')  # 줄어들기만 한다

# 3단계: 규칙을 어긴 리스트에서 heappop 을 일곱 번 한다
# 맨 앞 값 0 은 가장 작은 값이지만 3번 칸 2 가 부모 1번 칸 5 보다 작다.
broken = [0, 5, 1, 2, 9, 3, 4]  # 맨 앞 값만 가장 작은 리스트
print(f'꺼낸 순서 {[heapq.heappop(broken) for _ in range(7)]}')  # heappop 은 규칙을 믿고 길 하나만 본다

# 출력:
# 1단계 뜻: 6쌍은 모두 규칙을 지키고 2층의 50 이 3층의 25 보다 크다.
# (부모, 자식) [(10, 50), (10, 20), (50, 60), (50, 70), (20, 25), (20, 30)]
# 6쌍 모두 부모 <= 자식 True
# 2층 1번 칸 50 > 3층 5번 칸 25 → True
# 2단계 뜻: 5번 칸에서 루트 칸까지의 값은 줄어들기만 한다.
# 5번 칸에서 루트 칸까지 [25, 20, 10]
# 3단계 뜻: 규칙을 어긴 리스트에서는 2 보다 3 과 4 가 먼저 나온다.
# 꺼낸 순서 [0, 1, 3, 4, 2, 5, 9]
```

규칙을 어긴 리스트에서는 0 과 1 다음에 2 보다 큰 3 과 4 가 먼저 나왔습니다. heappop 은 꺼낼 때마다 작은 자식 쪽 길만 내려가는데 2 는 부모 5 가 반대쪽 자식보다 커서 그 길에 들지 못했고 3 과 4 가 나간 뒤에야 0번 칸에 올라왔습니다.

아래 데모에서 「다음 쌍」을 일곱 번 누르면 단계 7 / 8 에서 1번 칸과 5번 칸이 범례의 「지금 보는 칸」 모양이 되고 「2층의 50이 3층의 25보다 크지만 둘은 부모와 자식이 아닙니다.」가 나옵니다. 「끝까지」를 누르면 결과 칸에 「부모와 자식 6쌍 모두 부모 ≤ 자식」과 「두 번째로 작은 값은 루트의 두 자식 50, 20 가운데 20」이 나옵니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-lesson-heap-internals.html?embed=1&mode=rule&preset=loose" height="1000" loading="lazy" title="층이 아니라 부모와 자식만 비교하는 힙 규칙 미니 데모"></iframe>
<a class="demo-embed-open" href="demo-lesson-heap-internals.html?mode=rule&preset=loose" target="_blank" rel="noopener">↗ 전체 데모로 열기</a>
</div>

## 4. 값을 넣는 heappush

**heappush 는 새 값을 리스트 끝에 붙이고 부모 칸의 값보다 작은 동안 부모와 자리를 바꾸며 올립니다. i번 칸에 붙인 값 위에는 조상 칸(부모 칸, 부모의 부모 칸, …, 0번 칸)이 floor(log2(i + 1)) 개 있어서 비교는 많아야 그만큼이고 값이 N개인 힙에 하나를 넣으면 O(log N) 입니다.**

과외에서 저는 새 값이 자기 부모하고만 몇 번 자리를 바꾸면 끝난다고 했는데 맞는 설명입니다. 리스트 끝에 붙이면 빈자리 없이 한 칸 늘어 모양은 그대로이고 규칙을 어길 수 있는 쌍은 새 값과 그 부모뿐이라 그 쌍만 고치며 올라갑니다. 한 칸 내려간 부모는 원래부터 자기 아래 모든 값보다 크지 않았으므로 내려간 자리에서도 규칙을 지킵니다. 과외에서 쓴 40, 10, 30, 5 를 빈 리스트에 차례로 넣으면 아래 표와 같습니다.

| 넣은 값 | 붙은 칸 | 비교한 부모 | 비교 수 | 넣은 뒤 리스트 |
|---|---|---|---|---|
| 40 | 0번 칸 | 없음 | 0 | `[40]` |
| 10 | 1번 칸 | 0번 칸 40, 바꾼다 | 1 | `[10, 40]` |
| 30 | 2번 칸 | 0번 칸 10, 그대로 둔다 | 1 | `[10, 40, 30]` |
| 5 | 3번 칸 | 1번 칸 40, 바꾼다. 0번 칸 10, 바꾼다 | 2 | `[5, 10, 30, 40]` |

새 값은 조상 칸마다 많아야 한 번 비교하므로 i번 칸에 붙인 값의 비교는 많아야 floor(log2(i + 1)) 번입니다. 5 가 붙은 3번 칸은 floor(log2 4) = 2 라서 2번이 가장 많은 경우였습니다. 30 은 부모 10 보다 작지 않아 한 번 비교하고 멈췄습니다. 값이 N개인 힙에서는 새 칸이 N번 칸이라 비교가 많아야 floor(log2(N + 1)) 번입니다. 힙과 Top K 편 2절은 값 1,000,000개인 힙에 가장 작은 값을 넣어 19번을 셌습니다.

CPython 3.9 의 [heappush](https://github.com/python/cpython/blob/3.9/Lib/heapq.py#L130-L133) 는 `heap.append(item)` 으로 끝에 붙이고 [`_siftdown`](https://github.com/python/cpython/blob/3.9/Lib/heapq.py#L205-L217) 을 부릅니다. `_siftdown` 은 새 값을 따로 들고 있다가 더 큰 부모를 한 칸씩 내리고(`heap[pos] = parent`) 멈춘 칸에 새 값을 한 번 씁니다(`heap[pos] = newitem`). 비교와 결과는 자리를 맞바꾸는 방법과 같고 값을 올리는 함수의 이름이 `_siftdown` 인 까닭은 6절에서 봅니다. heapq 의 함수는 C 로 만들었지만 값끼리 < 로만 비교하므로 아래 코드는 < 를 계산할 때마다 수를 세는 값 Counted 를 넣어 표의 비교 수를 셉니다.

```python
# 하는 일: 빈 리스트에 40, 10, 30, 5 를 차례로 heappush 하며 넣을 때마다 리스트와 < 비교 수를 찍는다.
import heapq  # heappush 를 쓴다

# 1단계: < 비교를 세는 값을 만든다
# heapq 는 값끼리 < 로만 비교하므로 __lt__ 가 불린 횟수가 비교 수다.
class Counted:  # 정수 하나를 담고 < 비교를 센다
    count = 0  # 모든 값이 함께 쓰는 비교 수
    def __init__(self, value):  # 담을 정수를 받는다
        self.value = value  # 정수를 적어 둔다
    def __lt__(self, other):  # a < b 를 계산할 때 불린다
        Counted.count += 1  # 비교 1번
        return self.value < other.value  # 담은 정수로 비교한다
    def __repr__(self):  # 리스트를 찍을 때 불린다
        return repr(self.value)  # 담은 정수만 보인다

# 2단계: 값을 하나씩 넣는다
heap = []  # 빈 리스트에서 시작한다
for value in (40, 10, 30, 5):  # 과외에서 쓴 순서
    Counted.count = 0  # 이 값의 비교 수를 0 으로 둔다
    heapq.heappush(heap, Counted(value))  # 끝에 붙이고 부모와 비교하며 올린다
    print(f'{value} 넣은 뒤 {heap}, 비교 {Counted.count}번')  # 리스트와 이번 비교 수

# 출력:
# 2단계 뜻: 비교는 값마다 0, 1, 1, 2 번이고 5 는 부모 두 개와 비교해 0번 칸까지 올라갔다.
# 40 넣은 뒤 [40], 비교 0번
# 10 넣은 뒤 [10, 40], 비교 1번
# 30 넣은 뒤 [10, 40, 30], 비교 1번
# 5 넣은 뒤 [5, 10, 30, 40], 비교 2번
```

아래 데모는 이 차례로 눌러 봅니다.

1. 「다음 값」을 세 번 누르면 단계 8 / 12 에서 리스트가 [10, 40, 30] 이 됩니다.
2. 이어서 「한 칸」을 누르면 이번 단계 칸에 「5를 3번 칸에 붙였습니다. 부모는 (3 - 1) // 2 = 1번 칸 40입니다.」가 나옵니다.
3. 「한 칸」을 한 번 더 누르면 5 와 40 이 자리를 바꾸고 이번 단계 칸이 「5는 부모 1번 칸 40보다 작아 자리를 바꿉니다. [10, 5, 30, 40]이 됩니다.」로 바뀝니다.
4. 「끝까지」를 누르면 단계 12 / 12 이고 결과 칸 아랫줄이 「비교 0 + 1 + 1 + 2 = 4번」입니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-lesson-heap-internals.html?embed=1&mode=push&preset=four" height="850" loading="lazy" title="heappush 가 새 값을 부모와 비교하며 올리는 미니 데모"></iframe>
<a class="demo-embed-open" href="demo-lesson-heap-internals.html?mode=push&preset=four" target="_blank" rel="noopener">↗ 전체 데모로 열기</a>
</div>

## 5. 마지막 값으로 빈칸을 채우는 heappop

**heappop 은 맨 앞 값을 꺼낸 뒤 리스트 끝에서 마지막 값을 떼어 빈칸을 채웁니다. 교과서 방식은 마지막 값을 0번 칸에 두고 두 자식 가운데 작은 값이 더 작으면 자리를 바꾸며 내려서 값 1,000,000개의 힙이면 바꾸기가 많아야 19번, 비교가 많아야 38번입니다. 리스트는 끝에서만 O(1) 에 한 칸을 줄이므로 마지막 값을 쓰지 않고 자식만 올리면 빈칸이 리스트 끝이 아닌 잎에 남을 수 있습니다.**

지훈 씨는 3절의 과외 설명 가운데 꺼내는 대목을 그대로 인용해 물었습니다. 「"1등의 직속 자식들끼리 단 몇 번의 가위바위보(O(log N))만 치르면", 이 부분 좀 더 보여 줄래요?」 그 문장은 맞습니다. 3절의 길 때문에 맨 앞 값을 꺼낸 뒤 가장 작은 값은 루트 칸의 두 자식 가운데 작은 값이고 두 자식을 한 번 비교하면 정해집니다. 다만 그 값을 0번 칸에 올리면 그 값이 있던 자리가 다시 비므로 비교는 층마다 이어지고 리스트도 끝에서 한 칸 줄여야 합니다. 인용의 가위바위보는 이 글에서 두 값을 < 로 한 번 비교하는 일입니다.

교과서 방식은 맨 앞 값을 적어 두고 마지막 값을 pop() 으로 떼어 0번 칸에 둔 뒤, 그 칸과 두 자식 칸 가운데 가장 작은 칸이 자식이면 자리를 바꿔 한 층 내려가고 아니면 멈춥니다. 과외의 `[10, 20, 15, 40, 50, 30]` 에서는 0번 칸에 둔 30 이 작은 자식 15 와 자리를 바꾸고 2번 칸에서 자식이 없어 멈춥니다. 과외에서 부른 하강(Sift-Down)은 교과서의 이름이고 CPython 3.9 의 heapq.py 에서 같은 일을 맡은 함수의 이름은 반대인 `_siftup` 입니다(6절).

비교는 한 층에 많아야 2번입니다. 마지막 값은 1층의 0번 칸에서 많아야 마지막 층까지 내려가므로 바꾸기는 많아야 층 수 - 1 번이고 비교는 그 두 배입니다. 값 1,000,000개인 힙에서 계산하면 아래 표와 같습니다.

| 항목 | 식 | 값 1,000,000개인 힙 |
|---|---|---|
| 마지막 칸(999,999번)의 층 | floor(log2(999,999 + 1)) + 1 | 20층 (2^19 = 524,288 ≤ 1,000,000 < 2^20) |
| 바꾸기 수 | 층 수 - 1 | 많아야 19번 |
| 비교 수 | 2 × (층 수 - 1) | 많아야 38번 |
| 정렬되지 않은 리스트에서 가장 작은 값 탐색의 비교 수 | 값 수 - 1 | 999,999번 |

과외의 「20층」은 맞고 「자리바꿈 최대 20번」과 「100만 번 대 단 20번의 비교」는 표의 값으로 고칩니다. 100만 번은 표의 마지막 줄처럼 정렬되지 않은 리스트에서 가장 작은 값을 찾으려고 값을 모두 볼 때의 비교 수입니다.

지훈 씨가 다시 물었습니다. 「하나 이해가 안 되는데 15 가 왜 안 올라가고 30 이 올라가는 거예요?」 15 도 0번 칸으로 올라갑니다. 30 은 0번 칸에 잠깐 놓였다가 15 와 자리를 바꿔 내려갔고 남은 리스트의 맨 앞 값은 15 입니다. 지훈 씨의 물음을 다시 말하면 「어차피 15 가 맨 앞 값이 될 텐데 마지막 값 30 을 왜 가져오는가」입니다.

값을 하나 꺼내면 리스트가 한 칸 짧아져야 하는데 O(1) 에 없앨 수 있는 칸은 끝 칸뿐입니다. Python wiki 의 TimeComplexity 표가 옮겨 간 [공식 문서](https://docs.python.org/3/builtins/time-complexity.html)는 길이 n 인 리스트의 `l.pop(k)` 를 O(n - k) 로 적고 k번 칸 뒤의 값을 모두 한 칸씩 당기기 때문이라고 풀며 끝에서 꺼내면 O(1) 이라고 적습니다. 과외의 「O(N) 의 지옥」은 문서대로 O(N) 이고 「전 세계 컴퓨터 공학자들이」 이 방법을 골랐다는 말은 근거가 없어 지웁니다.

과외에서 저는 15 를 바로 올리면 「싱크홀(구멍)」이 생겨 완전 이진 트리가 파괴된다고 했는데 과외의 예에서는 그렇지 않습니다. 자식만 올리면 15 와 30 이 한 층씩 올라가고 빈칸은 리스트 끝인 5번 칸에서 멈춰 pop() 으로 줄이면 됩니다. 빈칸이 끝 칸이 아닌 잎에서 멈추는 입력은 15 와 20 의 자리를 바꾼 `[10, 15, 20, 40, 50, 30]` 입니다. 아래 코드는 과외의 `my_heappop` 을 이름만 `book_heappop` 으로 바꿔 3단계에서 heapq.heappop 과 비교하고 4단계에서 두 입력에 자식만 올립니다. 과외 코드의 함수 주석 `list[int]` 는 3.9 에서도 돌지만 비교를 세는 값을 넣으려고 뺐습니다.

```python
# 하는 일: 교과서 방식 book_heappop 을 heapq.heappop 과 비교하고, 자식만 올리면 빈칸이 어디서 멈추는지 두 입력에서 찍는다.
import heapq  # 비교할 heapq.heappop

# 1단계: < 비교를 세는 값을 만든다
# 4절과 같은 클래스다. 두 함수 모두 값끼리 < 로만 비교한다.
class Counted:  # 정수 하나를 담고 < 비교를 센다
    count = 0  # 모든 값이 함께 쓰는 비교 수
    def __init__(self, value):  # 담을 정수를 받는다
        self.value = value  # 정수를 적어 둔다
    def __lt__(self, other):  # a < b 를 계산할 때 불린다
        Counted.count += 1  # 비교 1번
        return self.value < other.value  # 담은 정수로 비교한다
    def __repr__(self):  # 리스트를 찍을 때 불린다
        return repr(self.value)  # 담은 정수만 보인다

# 2단계: 교과서 방식 heappop 을 만든다
# 마지막 값을 0번 칸에 두고 지금 칸과 두 자식 가운데 가장 작은 칸이 자식이면 바꾸며 내린다.
def book_heappop(heap):  # 과외의 my_heappop 과 같은 순서로 돈다
    min_val = heap[0]  # 맨 앞 값을 적어 둔다. 빈 리스트면 IndexError 가 난다
    last_val = heap.pop()  # 리스트 끝에서 마지막 값을 떼어 낸다
    if not heap:  # 값이 하나뿐이었으면
        return min_val  # 떼어 낸 값이 맨 앞 값이었다
    heap[0] = last_val  # 마지막 값을 0번 칸에 둔다
    curr, n = 0, len(heap)  # 내려갈 칸과 줄어든 길이
    while True:  # 자리를 찾을 때까지 한 층씩
        left, right = 2 * curr + 1, 2 * curr + 2  # 두 자식 칸
        smallest = curr  # 지금 칸과 두 자식 칸 가운데 가장 작은 칸
        if left < n and heap[left] < heap[smallest]:  # 왼쪽 자식이 더 작으면
            smallest = left  # 왼쪽 자식 칸을 고른다
        if right < n and heap[right] < heap[smallest]:  # 오른쪽 자식이 그보다 작으면
            smallest = right  # 오른쪽 자식 칸을 고른다
        if smallest == curr:  # 두 자식이 모두 더 작지 않으면
            break  # 여기서 멈춘다
        heap[curr], heap[smallest] = heap[smallest], heap[curr]  # 작은 자식과 자리를 바꾼다
        curr = smallest  # 내려간 칸에서 되풀이한다
    return min_val  # 꺼낸 맨 앞 값

# 3단계: 같은 리스트에서 두 함수로 꺼낸다
for name, pop in (('book_heappop', book_heappop), ('heapq.heappop', heapq.heappop)):  # 두 함수를 차례로
    heap = [Counted(v) for v in (10, 20, 15, 40, 50, 30)]  # 과외의 최소 힙을 새로 만든다
    Counted.count = 0  # 비교 수를 0 으로 둔다
    top = pop(heap)  # 맨 앞 값을 꺼낸다
    print(f'{name}: 꺼낸 값 {top}, 남은 리스트 {heap}, 비교 {Counted.count}번')  # 셋을 찍는다

# 4단계: 마지막 값 없이 자식만 올린다
# 빈칸은 None 으로 적는다. 빈칸에 자식이 없으면(잎이면) 멈추고, 멈춘 칸이 리스트 끝이 아니면 중간에 빈칸이 남는다.
def lift_children(heap):  # 마지막 값을 쓰지 않는 방법
    heap = heap[:]  # 넘겨받은 리스트는 그대로 둔다
    hole, n = 0, len(heap)  # 빈칸은 0번 칸에서 시작한다
    heap[hole] = None  # 맨 앞 값을 꺼내 빈칸이 된다
    while 2 * hole + 1 < n:  # 빈칸에 자식이 있는 동안
        child = 2 * hole + 1  # 왼쪽 자식 칸
        if child + 1 < n and heap[child + 1] < heap[child]:  # 오른쪽 자식이 더 작으면
            child += 1  # 오른쪽 자식 칸을 고른다
        heap[hole], heap[child] = heap[child], None  # 작은 자식을 빈칸으로 올린다
        hole = child  # 빈칸이 그 자식 칸으로 내려간다
    return heap, hole  # 리스트와 빈칸이 멈춘 칸

for heap in ([10, 20, 15, 40, 50, 30], [10, 15, 20, 40, 50, 30]):  # 과외의 힙과 15, 20 의 자리를 바꾼 힙
    after, hole = lift_children(heap)  # 자식만 올린다
    print(f'{heap} → {after}, 빈칸 {hole}번 칸, 리스트 끝 {len(heap) - 1}번 칸')  # 두 칸이 같은지 본다

# 출력:
# 3단계 뜻: 두 함수 모두 10 을 꺼내 같은 리스트를 남기고 비교는 2번이다.
# book_heappop: 꺼낸 값 10, 남은 리스트 [15, 20, 30, 40, 50], 비교 2번
# heapq.heappop: 꺼낸 값 10, 남은 리스트 [15, 20, 30, 40, 50], 비교 2번
# 4단계 뜻: 과외의 힙은 빈칸이 끝 칸에서 멈추고 15, 20 을 바꾼 힙은 3번 칸에서 멈춘다.
# [10, 20, 15, 40, 50, 30] → [15, 20, 30, 40, 50, None], 빈칸 5번 칸, 리스트 끝 5번 칸
# [10, 15, 20, 40, 50, 30] → [15, 40, 20, None, 50, 30], 빈칸 3번 칸, 리스트 끝 5번 칸
```

3단계의 두 함수는 꺼낸 값, 남은 리스트, 비교 수가 모두 같아서 과외의 「heappop 내부도 정확히 이 원리」는 이 입력의 결과로는 맞지만 heapq 안의 순서는 6절처럼 다릅니다. 4단계의 둘째 입력은 빈칸이 리스트 끝이 아닌 3번 칸에 남아 리스트 중간에 빈자리가 생기므로 완전 이진 트리가 아닙니다. 마지막 값 30 으로 3번 칸을 채우면 30 이 부모 40 보다 작아 다시 올려야 합니다. 이 순서가 6절의 CPython 방식입니다.

아래 데모는 이 차례로 눌러 봅니다.

1. 「다음 층」을 처음 누르면 단계 3 / 5 에서 이번 단계 칸에 「마지막 값 30을 0번 칸에 둡니다. [30, 20, 15, 40, 50]이 됩니다.」가 나옵니다.
2. 「다음 층」을 한 번 더 누르면 30 이 15 와 자리를 바꿔 리스트가 [15, 20, 30, 40, 50] 이 되고 결과 칸 아랫줄은 「지금까지 비교 2번」입니다.
3. 「끝까지」를 누르면 단계 5 / 5 에서 결과 칸에 「꺼낸 값 10, 남은 리스트 [15, 20, 30, 40, 50]」이 뜹니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-lesson-heap-internals.html?embed=1&mode=book&preset=six" height="780" loading="lazy" title="마지막 값을 0번 칸에 두고 내리는 교과서 방식 heappop 미니 데모"></iframe>
<a class="demo-embed-open" href="demo-lesson-heap-internals.html?mode=book&preset=six" target="_blank" rel="noopener">↗ 전체 데모로 열기</a>
</div>

## 6. CPython 3.9 소스의 heappop

**CPython 3.9 의 heappop 도 마지막 값을 0번 칸에 두는 데까지는 교과서 방식과 같지만 `_siftup` 이 두 자식 가운데 작은 값을 올리며 빈칸을 잎까지 내리고 그 잎에 마지막 값을 둔 뒤 `_siftdown` 이 부모보다 작은 동안 올립니다. 값이 모두 다르면 남는 리스트는 교과서 방식과 같고 무작위로 고른 서로 다른 값 1,000개 한 벌(seed 0)을 모두 꺼내는 비교는 교과서 방식 15,003번, CPython 방식 8,650번입니다.**

과외에서 저는 heapq.heappop 의 내부도 「정확히 이 원리로」 돈다고 했는데 3.9 소스는 순서가 다릅니다. [heappop](https://github.com/python/cpython/blob/3.9/Lib/heapq.py#L135-L143) 은 마지막 값을 떼어 0번 칸에 두고 `_siftup(heap, 0)` 을 부릅니다. [`_siftup`](https://github.com/python/cpython/blob/3.9/Lib/heapq.py#L258-L276) 은 그 값을 따로 들고 0번 칸을 빈칸으로 보면서 두 자식 가운데 작은 값을 빈칸으로 올리는 일을 잎에 닿을 때까지 되풀이한 뒤(「Bubble up the smaller child until hitting a leaf.」) 그 잎에 마지막 값을 두고 `_siftdown` 으로 부모보다 작은 동안 올립니다.

이름이 교과서와 반대입니다. 교과서는 값을 아래로 보내는 일을 sift-down 이라고 부르는데 소스 주석은 `_siftup` 의 일을 작은 자식을 올리는 일(bubbling the smaller child of pos up)로, heappush 가 부르는 `_siftdown` 의 일을 부모를 내리는 일(moving parents down)로 적습니다. 두 이름이 함께 움직이는 다른 값의 방향을 따르므로 이름만 보고 마지막 값이나 새 값의 방향을 짐작하면 거꾸로 읽습니다.

빈칸을 잎까지 내리는 까닭을 [같은 파일의 주석](https://github.com/python/cpython/blob/3.9/Lib/heapq.py#L219-L256)이 적고 있습니다. 마지막 값이 두 자식보다 크지 않은 칸에서 일찍 멈출 수도 있지만 heappop 이 0번 칸에 두는 마지막 값은 대개 커서 루트 칸부터 비교해서는 대개 일찍 멈추지 못합니다(that tends to be large, so that comparing it against values starting from the root usually doesn't pay). 그래서 CPython 방식은 내려갈 때 층마다 두 자식끼리 1번만 비교하고 잎에서 마지막 값을 올리며 몇 번 더 비교합니다. 주석은 길이 1,000 인 무작위 리스트에서 heappop 1,000번의 비교를 세 번 측정해 14,966~15,024번이 8,678~8,703번으로 줄었다고 적어 두었습니다.

heapq.py 의 [맨 끝](https://github.com/python/cpython/blob/3.9/Lib/heapq.py#L579-L583)은 `from _heapq import *` 라서 CPython 에서는 이 함수들이 [_heapqmodule.c](https://github.com/python/cpython/blob/3.9/Modules/_heapqmodule.c#L63-L111) 의 C 함수로 바뀝니다. C 의 siftup 은 같은 주석을 달고 마지막 값과 작은 자식의 자리를 맞바꾸며 내려가는데 비교하는 값과 순서는 heapq.py 와 같습니다.

첫 코드는 5절 블록에 이어서 돌며 heapq.py 의 네 함수를 줄마다 옮깁니다. 3단계는 리스트가 비어 있지 않으면 40% 확률로 꺼내고 아니면 1~100 의 정수를 넣는 조작 1,000번을 직접 짠 함수와 heapq 에 똑같이 하며 꺼낸 값과 남은 리스트를 비교하고 4단계는 같은 값이 있는 `[1, 3, 3, 4, 4, 4, 4]` 를 두 방식으로 꺼냅니다. 둘째 코드는 첫 코드에 이어서 돌며 세 함수의 비교 수를 셉니다.

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: heapq.py 의 _siftdown, _siftup, heappush, heappop 을 옮겨 무작위 조작 1,000번을 heapq 와 맞춰 보고, 같은 값이 있을 때 두 방식의 리스트를 찍는다.
import heapq  # 맞춰 볼 표준 라이브러리
import random  # 무작위 조작을 만든다

# 1단계: heapq.py 의 _siftdown 과 _siftup 을 옮긴다
# _siftdown 은 새 값보다 큰 부모를 한 칸씩 내리고 새 값을 멈춘 칸에 한 번 쓴다.
# _siftup 은 두 자식 가운데 작은 값을 올리며 빈칸을 잎까지 내린 뒤 그 잎에 마지막 값을 두고 _siftdown 으로 올린다.
def _siftdown(heap, startpos, pos):  # heapq.py 의 _siftdown
    newitem = heap[pos]  # 올릴 새 값
    while pos > startpos:  # 시작 칸에 닿기 전까지
        parentpos = (pos - 1) >> 1  # 부모 칸. (pos - 1) // 2 와 같다
        parent = heap[parentpos]  # 부모 값
        if newitem < parent:  # 새 값이 부모보다 작으면
            heap[pos] = parent  # 부모를 한 칸 내린다
            pos = parentpos  # 새 값의 자리는 부모 칸이 된다
            continue  # 한 층 더 올라가 본다
        break  # 부모보다 작지 않으면 멈춘다
    heap[pos] = newitem  # 새 값을 멈춘 칸에 한 번 쓴다

def _siftup(heap, pos):  # heapq.py 의 _siftup
    endpos = len(heap)  # 리스트 길이
    startpos = pos  # 나중에 _siftdown 이 멈출 칸
    newitem = heap[pos]  # pos 칸에 둔 마지막 값. 이 칸은 이제 빈칸으로 본다
    childpos = 2 * pos + 1  # 빈칸의 왼쪽 자식 칸
    while childpos < endpos:  # 빈칸에 자식이 있는 동안
        rightpos = childpos + 1  # 오른쪽 자식 칸
        if rightpos < endpos and not heap[childpos] < heap[rightpos]:  # 오른쪽 자식이 작거나 같으면
            childpos = rightpos  # 오른쪽 자식을 고른다
        heap[pos] = heap[childpos]  # 작은 자식을 빈칸으로 올린다
        pos = childpos  # 빈칸이 한 층 내려간다
        childpos = 2 * pos + 1  # 다음 왼쪽 자식 칸
    heap[pos] = newitem  # 잎에 닿은 빈칸을 마지막 값으로 채운다
    _siftdown(heap, startpos, pos)  # 마지막 값을 부모보다 작은 동안 올린다

# 2단계: heappush 와 heappop 을 옮긴다
def my_heappush(heap, item):  # heapq.py 의 heappush
    heap.append(item)  # 리스트 끝에 붙인다
    _siftdown(heap, 0, len(heap) - 1)  # 끝 칸의 새 값을 올린다

def my_heappop(heap):  # heapq.py 의 heappop. CPython 방식
    lastelt = heap.pop()  # 마지막 값을 떼어 낸다. 빈 리스트면 IndexError 가 난다
    if heap:  # 남은 값이 있으면
        returnitem = heap[0]  # 꺼낼 맨 앞 값
        heap[0] = lastelt  # 마지막 값을 0번 칸에 둔다
        _siftup(heap, 0)  # 빈칸을 잎까지 내리고 마지막 값을 올린다
        return returnitem  # 맨 앞 값을 돌려준다
    return lastelt  # 값이 하나였으면 그 값이 맨 앞 값이다

# 3단계: 무작위 조작 1,000번을 heapq 와 맞춰 본다
# 리스트가 비어 있지 않으면 40% 확률로 꺼내고 아니면 1~100 정수를 넣는다. 같은 값이 여러 번 들어간다.
print(f'heapq.heappop 이 들어 있는 모듈 {heapq.heappop.__module__}')  # C 로 만든 _heapq 의 함수다
random.seed(0)  # 돌릴 때마다 같은 조작
mine, theirs, same = [], [], 0  # 직접 짠 힙, heapq 의 힙, 같았던 횟수
for _ in range(1000):  # 조작 1,000번
    if mine and random.random() < 0.4:  # 꺼낼 차례면
        same_top = my_heappop(mine) == heapq.heappop(theirs)  # 꺼낸 값이 같은가
    else:  # 넣을 차례면
        value = random.randint(1, 100)  # 1~100 정수
        my_heappush(mine, value)  # 직접 짠 함수로 넣는다
        heapq.heappush(theirs, value)  # heapq 로 넣는다
        same_top = True  # 넣을 때는 꺼낸 값이 없다
    same += same_top and mine == theirs  # 꺼낸 값과 남은 리스트가 모두 같으면 센다
print(f'조작 1,000번 가운데 같았던 횟수 {same}, 남은 값 {len(mine)}개')  # 1,000 이면 매번 같았다

# 4단계: 같은 값이 있는 리스트에서 두 방식이 남기는 리스트를 본다
# book_heappop 은 5절 블록의 교과서 방식이다.
dup = [1, 3, 3, 4, 4, 4, 4]  # 같은 값이 여러 개인 최소 힙
c, d = dup[:], dup[:]  # 같은 리스트 두 벌
heapq.heappop(c)  # CPython 방식으로 꺼낸다
book_heappop(d)  # 교과서 방식으로 꺼낸다
is_heap = lambda h: all(h[(i - 1) // 2] <= h[i] for i in range(1, len(h)))  # 모든 쌍이 부모 <= 자식인가
print(f'heapq {c} 힙 규칙 {is_heap(c)}, 교과서 방식 {d} 힙 규칙 {is_heap(d)}')  # 리스트가 달라도 둘 다 힙이다

# 출력:
# 3단계 뜻: heapq 의 함수는 C 모듈 _heapq 에 있고 직접 짠 함수는 조작 1,000번 내내 같은 리스트를 남겼다.
# heapq.heappop 이 들어 있는 모듈 _heapq
# 조작 1,000번 가운데 같았던 횟수 1000, 남은 값 240개
# 4단계 뜻: 같은 값이 있으면 두 방식의 리스트가 다르지만 둘 다 힙 규칙을 지킨다.
# heapq [3, 3, 4, 4, 4, 4] 힙 규칙 True, 교과서 방식 [3, 4, 3, 4, 4, 4] 힙 규칙 True
```

직접 짠 함수는 같은 값이 여러 번 들어가도 heapq 와 같은 값을 같은 순서로 비교하므로 조작 1,000번 내내 같은 값을 꺼내고 같은 리스트를 남겼습니다. 4단계에서 0번 칸의 두 자식이 3 으로 같을 때 heapq.py 는 `not heap[childpos] < heap[rightpos]` 가 참이라 오른쪽을 올리고 교과서 방식은 오른쪽이 더 작을 때만 오른쪽을 골라 두 리스트가 달랐습니다. 둘 다 힙 규칙을 지켜 틀린 결과는 아닙니다. 두 방식의 리스트가 같다는 말은 값이 모두 다를 때만 맞습니다.

둘째 코드의 1단계는 데모의 값 12개 입력에서 맨 앞 값을 한 번 꺼냅니다. 2단계는 random.seed(0) 으로 1 이상 1,000,000 미만에서 고른 서로 다른 값 1,000개 한 벌을 heapify 한 뒤 1,000번 모두 꺼내며 꺼낼 때의 비교만 셉니다. 3단계는 seed 1~5 로 고른 다섯 벌에서 같은 일을 해 표본이 바뀌면 비교 수가 얼마나 달라지는지 봅니다.

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 값 12개에서 한 번, 서로 다른 값 1,000개에서 1,000번 꺼내며 세 heappop 의 < 비교 수와 남은 리스트를 비교하고 다른 표본 다섯 벌에서 비교 수의 범위를 본다.
import heapq  # heapify 와 heappop
import random  # 값 1,000개를 고른다

pops = {'heapq.heappop': heapq.heappop, 'my_heappop': my_heappop, 'book_heappop': book_heappop}  # 비교할 세 함수. Counted 와 book_heappop 은 5절 블록에 있다

# 1단계: 값 12개에서 한 번 꺼낸다
twelve = [1, 2, 7, 3, 6, 9, 8, 15, 4, 10, 12, 11]  # 데모의 값 12개 입력. 최소 힙이다
for name, pop in pops.items():  # 세 함수를 차례로
    heap = [Counted(v) for v in twelve]  # 같은 리스트를 새로 만든다
    Counted.count = 0  # 비교 수를 0 으로 둔다
    top = pop(heap)  # 맨 앞 값을 꺼낸다
    print(f'{name}: 꺼낸 값 {top}, 남은 리스트 {heap}, 비교 {Counted.count}번')  # 셋을 찍는다

# 2단계: 서로 다른 값 1,000개를 모두 꺼낸다
# seed 로 값 1,000개를 고르고 세 힙을 같은 heapify 로 만든 뒤 한 번에 하나씩 꺼내며 비교 수를 따로 모은다.
def pop_all(seed):  # seed 로 고른 값 1,000개를 세 함수로 모두 꺼낸다
    random.seed(seed)  # 같은 seed 면 돌릴 때마다 같은 값
    values = random.sample(range(1, 10**6), 1000)  # 1 이상 1,000,000 미만에서 서로 다른 값 1,000개
    heaps, counts = {}, {}  # 함수마다 힙과 비교 수
    for name in pops:  # 세 함수마다
        heaps[name] = [Counted(v) for v in values]  # 같은 값으로 리스트를 만든다
        heapq.heapify(heaps[name])  # 같은 heapify 로 힙을 만든다
        counts[name] = 0  # 꺼내는 비교 수만 센다
    same = 0  # 세 리스트가 같았던 횟수
    for _ in range(1000):  # 1,000번 꺼낸다
        for name, pop in pops.items():  # 세 함수가 하나씩 꺼낸다
            Counted.count = 0  # 이번 꺼내기의 비교 수
            pop(heaps[name])  # 맨 앞 값을 꺼낸다
            counts[name] += Counted.count  # 함수마다 모은다
        lists = [[c.value for c in h] for h in heaps.values()]  # 남은 리스트를 정수로 바꾼다
        same += lists[0] == lists[1] == lists[2]  # 셋이 같으면 센다
    return counts, same  # 함수마다 비교 수와 세 리스트가 같았던 횟수

counts, same = pop_all(0)  # 이 글의 표본은 seed 0 으로 고른 한 벌이다
for name in pops:  # 함수마다
    print(f'{name}: 1,000번 꺼낸 비교 {counts[name]:,}번')  # 모은 비교 수
print(f'1,000번 꺼내는 동안 세 리스트가 같았던 횟수 {same:,}')  # 매번 같았나

# 3단계: 다른 표본 다섯 벌에서 비교 수의 범위를 본다
# seed 1~5 로 값 1,000개를 새로 골라 2단계와 같이 꺼내고 함수마다 가장 적은 비교 수와 가장 많은 비교 수를 찍는다.
runs = [pop_all(seed) for seed in range(1, 6)]  # seed 1~5 마다 (비교 수, 같았던 횟수)
for name in pops:  # 함수마다
    seen = [c[name] for c, _ in runs]  # 다섯 표본의 비교 수
    print(f'{name}: seed 1~5 에서 {min(seen):,}~{max(seen):,}번')  # 가장 적은 값과 가장 많은 값
print(f'다섯 표본 모두 1,000번 내내 세 리스트가 같았나 {all(s == 1000 for _, s in runs)}')  # 표본이 바뀌어도 리스트는 같은가

# 출력:
# 1단계 뜻: 세 함수가 같은 리스트를 남기고 비교는 CPython 방식 4번, 교과서 방식 6번이다.
# heapq.heappop: 꺼낸 값 1, 남은 리스트 [2, 3, 7, 4, 6, 9, 8, 15, 11, 10, 12], 비교 4번
# my_heappop: 꺼낸 값 1, 남은 리스트 [2, 3, 7, 4, 6, 9, 8, 15, 11, 10, 12], 비교 4번
# book_heappop: 꺼낸 값 1, 남은 리스트 [2, 3, 7, 4, 6, 9, 8, 15, 11, 10, 12], 비교 6번
# 2단계 뜻: 1,000번 내내 세 리스트가 같았고 비교는 CPython 방식 8,650번, 교과서 방식 15,003번이다.
# heapq.heappop: 1,000번 꺼낸 비교 8,650번
# my_heappop: 1,000번 꺼낸 비교 8,650번
# book_heappop: 1,000번 꺼낸 비교 15,003번
# 1,000번 꺼내는 동안 세 리스트가 같았던 횟수 1,000
# 3단계 뜻: 표본을 바꾸면 비교 수가 수십 번씩 달라지지만 세 리스트는 다섯 표본에서도 늘 같았다.
# heapq.heappop: seed 1~5 에서 8,655~8,679번
# my_heappop: seed 1~5 에서 8,655~8,679번
# book_heappop: seed 1~5 에서 14,977~15,013번
# 다섯 표본 모두 1,000번 내내 세 리스트가 같았나 True
```

값 12개에서는 교과서 방식이 마지막 값 11 을 세 층 내리며 층마다 2번씩 비교했고 CPython 방식은 층마다 1번씩 비교한 뒤 잎의 11 을 부모 4 와 한 번 더 비교했습니다.

세 함수는 1,000번 꺼내는 동안 매번 같은 리스트를 남기고 비교 수만 달랐습니다. C 함수와 heapq.py 를 옮긴 함수는 비교 수까지 같았습니다. seed 0 표본에서 교과서 방식은 15,003 - 8,650 = 6,353번 더 비교했는데 이 수는 표본 하나의 값이라 3단계처럼 seed 1~5 로 값을 새로 고르면 교과서 방식이 14,977~15,013번, CPython 방식이 8,655~8,679번으로 수십 번씩 달라집니다. 그래도 다섯 표본 모두 교과서 방식이 훨씬 많이 비교했습니다. 두 범위는 heapq.py 주석의 세 측정과도 비슷합니다.

아래 데모는 이 차례로 눌러 봅니다.

1. 「다음 층」을 처음 누르면 0번 칸이 점선의 빈칸이 됩니다.
2. 세 번째까지 누르면 단계 4 / 8 에서 리스트가 [15, 40, 20, 빈칸, 50] 입니다.
3. 「끝까지」를 누르면 단계 8 / 8 에서 결과 칸 아랫줄에 「비교 4번. 빈칸이 3번 칸 잎에 닿아 30으로 채우고 1번 칸으로 올렸습니다」가 나옵니다.

같은 입력을 [교과서 방식](demo-lesson-heap-internals.html?mode=book&preset=hole)으로 꺼내도 남은 리스트 [15, 30, 20, 40, 50] 이 같습니다. 값 12개 입력은 [CPython 방식](demo-lesson-heap-internals.html?mode=pop&preset=twelve)에서 비교 4번, [교과서 방식](demo-lesson-heap-internals.html?mode=book&preset=twelve)에서 비교 6번입니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-lesson-heap-internals.html?embed=1&mode=pop&preset=hole" height="780" loading="lazy" title="빈칸이 잎까지 내려가는 CPython 방식 heappop 미니 데모"></iframe>
<a class="demo-embed-open" href="demo-lesson-heap-internals.html?mode=pop&preset=hole" target="_blank" rel="noopener">↗ 전체 데모로 열기</a>
</div>

## 7. 최대 힙에서 두 번째로 큰 값

**최대 힙에서는 어느 칸에서 루트 칸까지 올라가는 길의 값이 작아지지 않아서 두 번째로 큰 값은 루트 칸의 두 자식 가운데 큰 값이고 두 값을 한 번 비교하면 되므로 값이 몇 개든 O(1) 입니다. 부호를 뒤집어 heapq 로 만든 리스트에서는 칸이 3개 이상일 때 `-min(h[1], h[2])` 입니다.**

지훈 씨는 트리의 종류를 물을 때 「최근에 완전 이진 트리에서 두 번째로 큰 수를 찾는 문제를 풀어 봤어요」라고 덧붙였습니다. 과외에서 저는 그 트리가 최대 힙인 경우와 BST 인 경우로 나눠 답했고 BST 인 경우는 트리와 BST 편 9절에서 O(h) 로 고쳐 다뤘습니다. 그 답에 붙인 「면접관들이 정말 좋아하는 단골 문제」는 근거가 없어 지웁니다.

이 글의 두 번째로 큰 값은 큰 값부터 정렬했을 때 두 번째 값입니다. 그 값이 루트 칸의 자식이 아닌 칸에 있다면 그 칸의 부모 칸도 루트 칸이 아닙니다. 부모 칸의 값은 그보다 작지 않고 맨 앞 값 말고는 그보다 큰 값이 없으므로 같은 값이며 이렇게 한 칸씩 올라가면 루트 칸의 자식 칸에서 같은 값을 만납니다. 그래서 과외에서 루트의 두 자식 가운데 하나가 두 번째로 큰 값이라고 한 답과 O(1) 은 맞습니다.

칸이 2개면 1번 칸의 값이고 칸이 1개면 두 번째 값이 없습니다. 과외의 코드는 자식이 없으면 -1 을 돌려줬는데 -1 도 힙에 든 값일 수 있어 아래 코드는 None 을 돌려줍니다. 부호를 뒤집은 heapq 리스트에서는 1번과 2번 칸 가운데 작은 음수의 부호를 되돌립니다.

```python
# 하는 일: 최대 힙과 부호를 뒤집은 heapq 리스트에서 루트 칸의 두 자식을 비교해 두 번째로 큰 값을 찾는다.
import heapq  # 부호를 뒤집은 리스트를 heapify 한다

# 1단계: 최대 힙에서 찾는다
# 두 번째로 큰 값은 루트 칸의 자식인 1번, 2번 칸 가운데 큰 값이다.
def second_largest(max_heap):  # 부모 >= 자식인 리스트를 받는다
    if len(max_heap) < 2:  # 값이 하나 이하면
        return None  # 두 번째 값이 없다
    return max(max_heap[1:3])  # 1번 칸과 (있으면) 2번 칸 가운데 큰 값. 비교는 많아야 1번

for h in ([90, 80, 75, 50, 60, 70], [90]):  # 과외의 최대 힙과 값 하나인 힙
    print(f'{h} → 두 번째로 큰 값 {second_largest(h)}')  # 찾은 값을 찍는다

# 2단계: 부호를 뒤집은 heapq 리스트에서 찾는다
# 부호를 뒤집으면 가장 큰 값이 맨 앞 값이 되고 두 번째로 큰 값은 1번, 2번 칸 가운데 작은 음수다.
neg = [-v for v in [90, 80, 75, 50, 60, 70]]  # 부호를 뒤집는다
heapq.heapify(neg)  # 최소 힙으로 바꾼다
print(f'heapify 뒤 {neg}, 가장 큰 값 {-neg[0]}, 두 번째로 큰 값 {-min(neg[1], neg[2])}')  # 칸이 3개 이상일 때의 식

# 출력:
# 1단계 뜻: 루트 칸의 두 자식 80, 75 가운데 80 이 두 번째로 큰 값이고 값이 하나면 없다.
# [90, 80, 75, 50, 60, 70] → 두 번째로 큰 값 80
# [90] → 두 번째로 큰 값 None
# 2단계 뜻: 부호를 뒤집은 리스트에서도 -min(-80, -75) 로 80 을 찾는다.
# heapify 뒤 [-90, -80, -75, -50, -60, -70], 가장 큰 값 90, 두 번째로 큰 값 80
```

1절 데모에서 「끝까지」를 누른 마지막 단계가 이 계산입니다. 이번 단계 칸에 「루트의 두 자식 80, 75 가운데 큰 80이 두 번째로 큰 값입니다. 두 번째 값은 루트의 두 자식 칸만 보면 됩니다.」가 나오며 1번 칸이 범례의 「답」 모양입니다. 8절은 이렇게 부호를 뒤집은 최대 힙에서 가장 큰 값 두 개를 되풀이해 꺼내는 문제입니다.

## 8. Last Stone Weight (LeetCode 1046, Easy)

**LeetCode 1046 은 가장 무거운 돌 두 개를 부딪쳐 무게가 같으면 둘 다 없애고 다르면 차이만큼의 돌 하나를 남기는 일을 돌이 하나 이하가 될 때까지 되풀이한 뒤 남은 무게를 묻습니다. 매번 가장 큰 값 두 개를 꺼내고 차이를 다시 넣어야 해서 최대 힙을 쓰고 3.9 의 heapq 로는 무게의 부호를 뒤집어 넣습니다.**

[LeetCode 1046. Last Stone Weight](https://leetcode.com/problems/last-stone-weight/) 는 돌마다 무게가 적힌 정수 배열 `stones` 를 줍니다. 가장 무거운 돌 두 개의 무게가 x ≤ y 이면 같을 때 둘 다 없어지고 다를 때 무게 y - x 인 돌 하나가 남습니다. 돌이 하나 이하가 되면 남은 무게를, 없으면 0 을 돌려줍니다. 첫 예제 `stones = [2, 7, 4, 1, 8, 1]` 의 답은 1, 둘째 예제 `stones = [1]` 의 답은 1 이고 돌은 1개 이상 30개 이하, 무게는 1 이상 1,000 이하입니다.

매번 가장 큰 값 두 개를 꺼내고 차이를 다시 넣어야 하는데 정렬된 리스트에 차이를 넣으면 힙과 Top K 편 2절의 bisect.insort 처럼 뒤 칸을 밀어 많아야 O(N) 이 들지만 최대 힙은 가장 큰 값을 꺼내는 일과 새 값을 넣는 일이 각각 O(log N) 입니다.

1. stones 의 부호를 뒤집은 리스트를 heapify 합니다.
2. 길이가 2 이상인 동안 heappop 을 두 번 해 부호를 되돌린 y 와 x 를 얻습니다.
3. 두 무게가 다르면 -(y - x) 를 heappush 로 넣습니다.
4. 남은 값이 있으면 부호를 되돌려, 없으면 0 을 돌려줍니다.

아래 코드는 LeetCode 화면의 메서드 이름 `lastStoneWeight` 와 인자 `stones` 를 그대로 쓰고 타입 주석은 `from typing import List` 의 `List[int]` 로 적습니다.

```python
# 하는 일: LeetCode 1046 을 부호를 뒤집은 최소 힙으로 풀어 첫 예제를 따라가고 세 입력의 답을 찍는다.
import heapq  # heapify, heappop, heappush
from typing import List  # 함수 주석의 List[int] 에 쓴다

# 1단계: 풀이를 만든다
# 부호를 뒤집으면 가장 무거운 돌이 맨 앞 값이 된다. 무거운 둘을 꺼내 무게가 다르면 차이를 다시 넣는다.
class Solution:  # LeetCode 가 정해 둔 클래스 이름 그대로 둔다
    def lastStoneWeight(self, stones: List[int], trace: bool = False) -> int:  # trace 는 이 글이 붙인 인자
        heap = [-w for w in stones]  # 부호를 뒤집은 무게
        heapq.heapify(heap)  # 한 번에 힙으로 바꾼다
        if trace:  # 따라가기를 켰으면
            print(f'heapify 뒤 {heap}')  # 처음 리스트
        while len(heap) > 1:  # 돌이 둘 이상 남은 동안
            y = -heapq.heappop(heap)  # 가장 무거운 돌
            x = -heapq.heappop(heap)  # 두 번째로 무거운 돌. x <= y
            if x != y:  # 무게가 다르면
                heapq.heappush(heap, -(y - x))  # 차이 y - x 의 돌을 다시 넣는다
            if trace:  # 따라가기를 켰으면
                print(f'부딪친 돌 {y}, {x} → {heap}')  # 이번에 남은 리스트
        return -heap[0] if heap else 0  # 남은 돌의 무게. 없으면 0

# 2단계: 첫 예제를 따라가고 세 입력의 답을 찍는다
print(f'답 {Solution().lastStoneWeight([2, 7, 4, 1, 8, 1], trace=True)}')  # LeetCode 첫 예제
for stones in ([1], [2, 2]):  # LeetCode 둘째 예제와 둘 다 없어지는 입력
    print(f'{stones} → {Solution().lastStoneWeight(stones)}')  # 답만 찍는다

# 출력:
# 2단계 뜻: 네 번 부딪친 뒤 1 이 남고 [2, 2] 는 둘 다 없어져 0 이다.
# heapify 뒤 [-8, -7, -4, -1, -2, -1]
# 부딪친 돌 8, 7 → [-4, -2, -1, -1, -1]
# 부딪친 돌 4, 2 → [-2, -1, -1, -1]
# 부딪친 돌 2, 1 → [-1, -1, -1]
# 부딪친 돌 1, 1 → [-1]
# 답 1
# [1] → 1
# [2, 2] → 0
```

1 과 1 을 부딪친 줄에서는 두 무게가 같아 아무것도 다시 넣지 않았고 `[2, 2]` 도 같은 까닭으로 리스트가 비어 0 을 돌려줬습니다. 한 번 부딪칠 때마다 돌이 적어도 하나 줄어 반복은 많아야 N - 1 번이고 한 번에 heappop 2번과 heappush 많아야 1번이 각각 O(log N) 이라 시간 복잡도는 O(N log N), 부호를 뒤집은 리스트 때문에 공간 복잡도는 O(N) 입니다.

## 9. Kth Largest Element in a Stream (LeetCode 703, Easy)

**LeetCode 703 은 값이 하나씩 들어올 때마다 지금까지 들어온 값 가운데 k번째로 큰 값을 돌려주는 클래스를 만들라고 합니다. 힙과 Top K 편 3절의 크기 K 최소 힙을 클래스 안에 두고 add 마다 값을 넣은 뒤 길이가 k 를 넘으면 맨 앞 값을 꺼내고 남은 맨 앞 값을 돌려주며 add 한 번은 O(log K) 입니다.**

[LeetCode 703. Kth Largest Element in a Stream](https://leetcode.com/problems/kth-largest-element-in-a-stream/) 은 정수 k 와 처음 값들 `nums` 로 만드는 클래스 `KthLargest` 와, 값 `val` 을 받아 지금까지의 k번째로 큰 값을 돌려주는 메서드 `add` 를 만들라고 합니다. 예제 둘과 제약은 아래와 같습니다.

- 첫 예제: `KthLargest(3, [4, 5, 8, 2])` 뒤 add 3, 5, 10, 9, 4 → 4, 5, 5, 8, 8
- 둘째 예제: `KthLargest(4, [7, 7, 7, 7, 8, 3])` 뒤 add 2, 10, 9, 9 → 7, 7, 7, 8
- nums 의 길이: 0 이상 10,000 이하
- k: 1 이상 nums 의 길이 + 1 이하
- 값: -10,000 이상 10,000 이하
- add 호출 수: 많아야 10,000번

힙과 Top K 편 2절에서 값이 하나씩 들어오는 문제로 든 703 입니다. 버릴 값은 남은 값 가운데 가장 작은 값이라 최소 힙의 맨 앞 값을 heappop 하면 됩니다. 값이 들어올 때마다 전체를 다시 정렬하면 add 한 번에 O(N log N) 이지만 크기 K 최소 힙은 O(log K) 입니다. k 가 nums 의 길이 + 1 이하라서 add 를 한 번 부른 뒤에는 힙에 값이 k개 있습니다.

1. `__init__` 에서 k 를 적어 두고 빈 리스트를 만든 뒤 nums 의 값마다 add 를 부릅니다.
2. add 는 val 을 heappush 로 넣습니다.
3. 넣은 뒤 길이가 k 를 넘으면 heappop 으로 맨 앞 값을 꺼냅니다.
4. 맨 앞 값 `heap[0]` 을 돌려줍니다.

아래 코드는 화면의 클래스 이름 `KthLargest` 와 메서드 `__init__(self, k, nums)`, `add(self, val)` 을 그대로 씁니다.

```python
# 하는 일: LeetCode 703 의 KthLargest 를 크기 K 최소 힙으로 만들어 두 예제의 add 를 하나씩 따라간다.
import heapq  # heappush, heappop
from typing import List  # 함수 주석의 List[int] 에 쓴다

# 1단계: 클래스를 만든다
# 힙에는 지금까지 들어온 값 가운데 가장 큰 k개만 남고 맨 앞 값이 k번째로 큰 값이다.
class KthLargest:  # LeetCode 가 정해 둔 클래스 이름 그대로 둔다
    def __init__(self, k: int, nums: List[int]):  # k 와 처음 값들을 받는다
        self.k = k  # 남길 값의 수
        self.heap = []  # 크기 K 최소 힙
        for num in nums:  # 처음 값을 하나씩
            self.add(num)  # add 와 같은 규칙으로 넣는다

    def add(self, val: int) -> int:  # 값 하나를 받아 k번째로 큰 값을 돌려준다
        heapq.heappush(self.heap, val)  # 넣는다
        if len(self.heap) > self.k:  # 넣은 뒤 길이가 k 를 넘으면
            heapq.heappop(self.heap)  # 맨 앞 값을 꺼낸다
        return self.heap[0]  # 남은 값 가운데 가장 작은 값

# 2단계: 두 예제를 돌린다
for k, nums, vals in ((3, [4, 5, 8, 2], [3, 5, 10, 9, 4]), (4, [7, 7, 7, 7, 8, 3], [2, 10, 9, 9])):  # LeetCode 의 두 예제
    obj = KthLargest(k, nums)  # 처음 값을 넣는다
    print(f'KthLargest({k}, {nums}) 뒤 힙 {obj.heap}')  # 처음 힙
    for val in vals:  # add 를 차례로 부른다
        answer = obj.add(val)  # k번째로 큰 값
        print(f'add({val}) → {answer}, 힙 {obj.heap}')  # 돌려준 값과 힙

# 출력:
# 2단계 뜻: 첫 예제는 4, 5, 5, 8, 8 을, 둘째 예제는 7, 7, 7, 8 을 돌려준다.
# KthLargest(3, [4, 5, 8, 2]) 뒤 힙 [4, 5, 8]
# add(3) → 4, 힙 [4, 5, 8]
# add(5) → 5, 힙 [5, 5, 8]
# add(10) → 5, 힙 [5, 10, 8]
# add(9) → 8, 힙 [8, 9, 10]
# add(4) → 8, 힙 [8, 9, 10]
# KthLargest(4, [7, 7, 7, 7, 8, 3]) 뒤 힙 [7, 7, 8, 7]
# add(2) → 7, 힙 [7, 7, 8, 7]
# add(10) → 7, 힙 [7, 7, 8, 10]
# add(9) → 7, 힙 [7, 9, 8, 10]
# add(9) → 8, 힙 [8, 9, 9, 10]
```

첫 예제의 처음 힙 `[4, 5, 8]` 은 2 까지 넣은 뒤 길이 4 가 k = 3 을 넘어 2 를 꺼낸 결과입니다. add(3) 은 3 이 들어오자마자 가장 작은 값이라 바로 나가 4 를 돌려줬고 add(9) 에서는 5 가 나가 8 이 맨 앞 값이 됐습니다. 둘째 예제는 같은 값 7 을 따로 세어 4번째로 큰 값이 7 이다가 9 가 두 번 들어온 뒤 8 이 됩니다. `__init__` 은 값 N개에 O(N log K), add 는 O(log K) 이고 힙에 많아야 k + 1 개가 있어 공간 복잡도는 O(K) 입니다.

## 10. Sort an Array (LeetCode 912, Medium)

**LeetCode 912 는 정수 배열을 작은 값부터 정렬하되 내장 함수를 쓰지 않고 O(N log N) 에 하라고 합니다. heapq.py 를 옮긴 heapify 로 리스트를 힙으로 바꾼 뒤 6절의 heappop 으로 N번 꺼내면 작은 값부터 나옵니다. heapify 가 O(N), 꺼내기 N번이 O(N log N) 이라 전체가 O(N log N) 입니다.**

[LeetCode 912. Sort an Array](https://leetcode.com/problems/sort-an-array/) 는 정수 배열 `nums` 를 작은 값부터 정렬해 돌려 달라고 하며 내장 함수 없이 O(N log N) 시간에, 공간은 가능한 한 적게 쓰라고 합니다. 첫 예제 `nums = [5, 2, 3, 1]` 의 답은 `[1, 2, 3, 5]`, 둘째 예제 `nums = [5, 1, 1, 2, 0, 0]` 의 답은 `[0, 0, 1, 1, 2, 5]` 이고 길이는 1 이상 50,000 이하, 값은 -50,000 이상 50,000 이하입니다.

최소 힙에서 heappop 을 되풀이하면 남은 값 가운데 가장 작은 값이 나오므로 꺼낸 순서가 정렬된 순서입니다. sorted 나 heapq 같은 내장 함수를 쓰지 말라는 조건이 있어 6절에서 옮긴 함수를 Solution 안에 둡니다. heapify 는 [3.9 소스](https://github.com/python/cpython/blob/3.9/Lib/heapq.py#L168-L177)대로 자식이 있는 마지막 칸부터 0번 칸까지 `for i in reversed(range(n//2))` 로 거꾸로 가며 `_siftup` 을 부릅니다. 공식 문서는 heapify 를 선형 시간(in linear time)으로 적습니다.

1. nums 를 복사해 heapify 와 같은 차례로 `_siftup` 을 부릅니다.
2. 리스트가 빌 때까지 마지막 값을 떼어 내고 남은 값이 있으면 맨 앞 값을 결과에 담은 뒤 마지막 값을 0번 칸에 두고 `_siftup` 을 부릅니다.
3. 결과 리스트를 돌려줍니다.

아래 코드는 메서드 이름 `sortArray` 와 인자 `nums` 를 그대로 쓰고 heapq 는 결과를 맞춰 볼 때만 씁니다.

```python
# 하는 일: LeetCode 912 를 heapq.py 를 옮긴 heapify 와 heappop 으로 풀고 heapq.heapify, sorted 의 결과와 비교한다.
import heapq  # 결과를 맞춰 볼 때만 쓴다
from typing import List  # 함수 주석의 List[int] 에 쓴다

# 1단계: 풀이를 만든다
# 3.9 heapq.py 의 함수를 옮겨 쓰므로 정렬 함수와 heapq 없이 작은 값부터 꺼낸다.
class Solution:  # LeetCode 가 정해 둔 클래스 이름 그대로 둔다
    def sortArray(self, nums: List[int], trace: bool = False) -> List[int]:  # trace 는 이 글이 붙인 인자
        def siftdown(heap, startpos, pos):  # 6절의 _siftdown
            newitem = heap[pos]  # 올릴 값
            while pos > startpos:  # 시작 칸에 닿기 전까지
                parentpos = (pos - 1) >> 1  # 부모 칸
                if newitem < heap[parentpos]:  # 부모보다 작으면
                    heap[pos] = heap[parentpos]  # 부모를 내린다
                    pos = parentpos  # 한 층 올라간다
                    continue  # 다시 본다
                break  # 부모보다 작지 않으면 멈춘다
            heap[pos] = newitem  # 멈춘 칸에 쓴다

        def siftup(heap, pos):  # 6절의 _siftup
            endpos, startpos, newitem = len(heap), pos, heap[pos]  # 길이, 시작 칸, 내릴 값
            childpos = 2 * pos + 1  # 왼쪽 자식 칸
            while childpos < endpos:  # 자식이 있는 동안
                if childpos + 1 < endpos and not heap[childpos] < heap[childpos + 1]:  # 오른쪽 자식이 작거나 같으면
                    childpos += 1  # 오른쪽 자식을 고른다
                heap[pos] = heap[childpos]  # 작은 자식을 올린다
                pos = childpos  # 빈칸이 내려간다
                childpos = 2 * pos + 1  # 다음 왼쪽 자식 칸
            heap[pos] = newitem  # 잎에 둔다
            siftdown(heap, startpos, pos)  # 제자리까지 올린다

        heap = nums[:]  # nums 는 그대로 둔다
        for i in reversed(range(len(heap) // 2)):  # 3.9 heapify 와 같은 차례
            siftup(heap, i)  # 그 칸 아래를 힙으로 만든다
        if trace:  # 따라가기를 켰으면
            print(f'{nums} → heapify 뒤 {heap}')  # 직접 짠 heapify 의 결과
        out = []  # 꺼낸 값을 차례로 담는다
        while heap:  # 값이 남은 동안
            last = heap.pop()  # 마지막 값을 떼어 낸다
            if heap:  # 남은 값이 있으면
                out.append(heap[0])  # 맨 앞 값을 꺼낸다
                heap[0] = last  # 마지막 값을 0번 칸에 둔다
                siftup(heap, 0)  # 빈칸을 잎까지 내리고 마지막 값을 올린다
            else:  # 마지막 하나였으면
                out.append(last)  # 그 값을 담는다
        return out  # 작은 값부터 담긴 리스트

# 2단계: 두 예제를 돌리고 heapq.heapify, sorted 와 비교한다
for nums in ([5, 2, 3, 1], [5, 1, 1, 2, 0, 0]):  # LeetCode 의 두 예제
    answer = Solution().sortArray(nums, trace=True)  # heapify 뒤 리스트를 찍고 답을 받는다
    ref = nums[:]  # heapq.heapify 에 줄 복사본
    heapq.heapify(ref)  # 표준 라이브러리로 힙을 만든다
    print(f'heapq.heapify 뒤 {ref}, 답 {answer}, sorted 와 같음 {answer == sorted(nums)}')  # 두 결과와 비교한다

# 출력:
# 2단계 뜻: 직접 짠 heapify 는 heapq.heapify 와 같은 리스트를 만들고 답은 sorted 와 같다.
# [5, 2, 3, 1] → heapify 뒤 [1, 2, 3, 5]
# heapq.heapify 뒤 [1, 2, 3, 5], 답 [1, 2, 3, 5], sorted 와 같음 True
# [5, 1, 1, 2, 0, 0] → heapify 뒤 [0, 0, 1, 2, 1, 5]
# heapq.heapify 뒤 [0, 0, 1, 2, 1, 5], 답 [0, 0, 1, 1, 2, 5], sorted 와 같음 True
```

`[5, 2, 3, 1]` 은 heapify 한 리스트가 우연히 정렬된 `[1, 2, 3, 5]` 였고 `[5, 1, 1, 2, 0, 0]` 은 정렬되지 않은 힙 `[0, 0, 1, 2, 1, 5]` 였지만 둘 다 heapq.heapify 와 칸마다 같았습니다. heapify 가 O(N), 값 N개를 꺼내는 데 O(N log N) 이라 시간 복잡도는 O(N log N) 이고 복사한 힙과 결과 리스트 때문에 공간 복잡도는 O(N) 입니다.

## 한눈 정리

| 연산과 문제 | 리스트에 하는 일 | 비교나 시간 | 이 글의 예 |
|---|---|---|---|
| 칸 번호 계산 | 부모 칸 (i - 1) // 2, 자식 칸 2i + 1 과 2i + 2 | O(1) | 2번 칸 75 의 부모 칸 0, 왼쪽 자식 칸 5 |
| 맨 앞 값 보기 | heap[0] 을 읽는다 | O(1) | `[10, 30, 90, 50, 70]` → 10 |
| heappush | 끝에 붙이고 부모보다 작은 동안 올린다 | 값 N개인 힙에 넣으면 많아야 floor(log2(N + 1)) 번, O(log N) | 40, 10, 30, 5 → 비교 0, 1, 1, 2 번 |
| heappop 교과서 방식 | 마지막 값을 0번 칸에 두고 작은 자식과 바꾸며 내린다 | 층마다 많아야 2번, O(log N) | 무작위로 고른 서로 다른 값 1,000개 한 벌(seed 0)을 모두 꺼내 15,003번 |
| heappop CPython 방식 | 빈칸을 잎까지 내리고 마지막 값을 채워 올린다 | O(log N) | 같은 입력에서 8,650번 |
| 최대 힙의 두 번째로 큰 값 | 루트 칸의 두 자식을 비교한다 | 많아야 1번, O(1) | `[90, 80, 75, 50, 60, 70]` → 80 |
| 1046 마지막 돌의 무게 | 부호를 뒤집은 힙에서 둘을 꺼내고 차이를 넣는다 | O(N log N), 공간 O(N) | `[2, 7, 4, 1, 8, 1]` → 1 |
| 703 스트림의 k번째로 큰 값 | 크기 K 최소 힙에 넣고 길이가 k 를 넘으면 꺼낸다 | add O(log K), 공간 O(K) | add 3, 5, 10, 9, 4 → 4, 5, 5, 8, 8 |
| 912 배열 정렬 | 직접 짠 heapify 뒤 heappop 을 N번 | O(N log N), 공간 O(N) | `[5, 1, 1, 2, 0, 0]` → `[0, 0, 1, 1, 2, 5]` |

표의 O(log N) 과 O(log K) 는 값 하나를 비교하는 데 O(1) 일 때입니다.

## 헷갈리기 쉬운 점

- **힙은 층별로 정렬돼 있지 않습니다.** `[10, 50, 20, 60, 70, 25, 30]` 에서 2층의 50 이 3층의 25 보다 크지만 둘은 부모와 자식이 아니라서 최소 힙이고 모든 부모와 자식 사이의 부모 ≤ 자식만으로 맨 앞 값이 가장 작습니다.
- **완전 이진 트리라고 모두 힙은 아닙니다.** `[50, 90, 10]` 은 칸 3개를 빈자리 없이 채웠지만 2번 칸의 10 이 부모 50 보다 작아 최소 힙이 아닙니다.
- **CPython 의 `_siftup` 은 0번 칸에 둔 마지막 값을 아래로 보냅니다.** 이름의 위(up)는 빈칸으로 올라가는 작은 자식들을 가리키고 heappush 가 부르는 `_siftdown` 은 거꾸로 새 값을 위로 올립니다.
- **두 방식은 값이 모두 다를 때만 같은 리스트를 남깁니다.** 같은 값이 있는 `[1, 3, 3, 4, 4, 4, 4]` 에서 heapq 는 `[3, 3, 4, 4, 4, 4]`, 교과서 방식은 `[3, 4, 3, 4, 4, 4]` 를 남겼고 둘 다 힙 규칙을 지킵니다.
- **마지막 값은 리스트 중간을 비우지 않으려고 씁니다.** 리스트는 끝에서만 O(1) 에 한 칸을 줄입니다. 자식만 올리면 `[10, 15, 20, 40, 50, 30]` 처럼 빈칸이 끝 칸이 아닌 3번 칸에 남습니다.
- **heapq.heappop 은 C 함수입니다.** heapq.py 맨 끝의 `from _heapq import *` 가 함수를 `_heapqmodule.c` 의 것으로 바꾸고 그 C 함수는 heapq.py 를 옮긴 함수와 비교 수까지 같았습니다.

## 더 깊이 보기

- 힙이 가장 작은 값 하나를 빨리 꺼내는 까닭과 칸 번호 계산은 [트리와 힙](post.html?id=algorithm-tree-heap) 편 7~8절에 있습니다.
- 크기 K 최소 힙과 3.14 의 최대 힙 함수는 [힙과 Top K](post.html?id=algorithm-lesson-heap-top-k) 편 3~4절에, 값 1,000,000개인 힙에 넣는 heappush 의 비교 수는 2절에 있습니다.
- 완전 이진 트리와 포화 이진 트리의 정의는 [트리와 BST](post.html?id=algorithm-lesson-tree-bst) 편 1절에, BST 에서 두 번째로 큰 값을 찾는 O(h) 방법은 9절에 있습니다.
- 이 글의 데모는 [힙의 내부: 부모와 자식 규칙, heappush, heappop 의 두 방식](demo-lesson-heap-internals.html) 한 페이지에서 탭과 입력을 바꿔 가며 볼 수 있습니다.
- 힙 규칙의 정의는 heapq [공식 문서](https://docs.python.org/3/library/heapq.html)에, CPython 3.9 의 heappush, heappop, `_siftdown`, `_siftup` 과 비교 수를 적은 주석은 [heapq.py](https://github.com/python/cpython/blob/3.9/Lib/heapq.py) 에, C 함수는 [_heapqmodule.c](https://github.com/python/cpython/blob/3.9/Modules/_heapqmodule.c) 에, 리스트 pop 의 비용은 [Time complexity of built-in types](https://docs.python.org/3/builtins/time-complexity.html) 에 있습니다.
- 예시 문제는 [Last Stone Weight](https://leetcode.com/problems/last-stone-weight/)(1046), [Kth Largest Element in a Stream](https://leetcode.com/problems/kth-largest-element-in-a-stream/)(703), [Sort an Array](https://leetcode.com/problems/sort-an-array/)(912) 입니다.
