지훈 씨는 이진 탐색(정렬된 배열의 가운데 값과 비교해 절반을 버리는 방법)을 배운 뒤 힙으로 넘어가며 말했습니다. 「오케이, 이제 알고리즘의 heapq 에 대해서 설명해 주세요.」 설명을 듣고는 이어서 물었습니다. 「top k 에서 heapq 를 사용한다는데 어떻게 하는지 잘 모르겠어요.」

heapq 는 파이썬 표준 라이브러리의 힙(heap) 모듈입니다. 이 모듈의 힙은 가장 작은 값이 늘 리스트 맨 앞에 오는 최소 힙입니다. Top K 는 값 N개 가운데 가장 큰 K개나 가장 작은 K개를 고르는 문제입니다.

**가장 큰 K개를 고르는데 왜 가장 작은 값이 맨 앞에 오는 최소 힙을 쓸까요?**

이 글은 리스트의 0번 칸 heap[0] 을 맨 앞 값, 넣은 뒤 길이가 K 를 넘으면 맨 앞 값을 꺼내 길이를 K 로 지키는 힙을 크기 K 힙이라고 부릅니다. 값 100,000개에서 가장 큰 5개를 고르면 전체 정렬은 비교를 1,529,024번, 크기 K 힙은 399,987번 하지만 K 가 1,000 이면 크기 K 힙이 정렬보다 많이 비교해서 K 에 따라 고를 방법이 달라집니다.

> **한 줄 요약:** heapq 의 힙은 맨 앞 값 heap[0] 이 가장 작은 최소 힙이라, 가장 큰 K개를 고를 때는 값을 하나씩 넣고 넣은 뒤 길이가 K 를 넘으면 맨 앞 값을 꺼내는 크기 K 최소 힙을 쓰고 모든 값을 넣은 뒤의 맨 앞 값이 K번째로 큰 수입니다. 리스트는 많아야 K + 1칸이고 값 하나를 넣고 꺼내는 비교가 많아야 O(log K) 번이라 값 하나를 비교하는 데 O(1) 이면 값 N개에 O(N log K) 시간이 듭니다. 가장 작은 K개는 부호를 뒤집은 최대 힙으로 같은 일을 합니다. 값이 이미 모두 있으면 heapify 로 리스트를 한 번에 힙으로 바꾸는 풀이도 씁니다. 값 100,000개에서 직접 센 비교 횟수로는 K = 5 에서 크기 K 힙이 정렬보다 적고 K = 1,000 에서는 정렬보다 많습니다.

> **골라 읽는 법** — 절이 9개인 긴 글입니다. 처음부터 다 읽지 않아도 됩니다.
>
> - heapq 의 최소 힙과 값 하나를 넣는 비용 → 1~2절
> - 크기 K 최소 힙으로 푸는 LeetCode 215 → 3절
> - 상위 K개와 최소 힙, 하위 K개와 최대 힙 → 4절
> - 값이 모두 있을 때의 세 방법과 직접 센 비교 횟수 → 5~6절
> - heapify 로 푸는 LeetCode 215 → 7절
> - 같은 틀로 푸는 LeetCode 문제 2개 → 8~9절

---

## 1. 최소 힙과 heappush, heappop, heapify

**heapq 의 힙은 따로 만든 객체가 아니라 파이썬 리스트이고 k번 칸의 값이 자식 칸인 2k + 1번과 2k + 2번 칸의 값보다 크지 않다는 조건만 지킵니다. 그래서 맨 앞 값 heap[0] 은 늘 가장 작은 값이지만 1번 칸부터는 정렬돼 있다는 보장이 없습니다. heappush 와 heappop 은 이 조건을 지키며 값 하나를 넣고 꺼냅니다. heapify 는 값이 든 리스트를 한 번에 이 조건에 맞게 바꿉니다.**

과외에서 저는 heapq 를 늦게 와도 가장 위급한 환자부터 진료하는 응급실에 빗댔습니다. 들어온 순서가 아니라 우선순위가 가장 높은 값부터 꺼내는 자료구조를 우선순위 큐(priority queue)라고 부르고 [공식 문서](https://docs.python.org/3/library/heapq.html)도 heapq 를 우선순위 큐 알고리즘(the priority queue algorithm)의 구현이라고 소개합니다. heapq 에서는 가장 작은 값이 가장 먼저 나오고 그 값은 늘 0번 칸에 있어서 아래 코드처럼 40, 10, 30, 5 를 차례로 넣으면 마지막에 넣은 5 가 heap[0] 입니다.

같은 문서는 최소 힙을 모든 부모 노드의 값이 자식 노드의 값보다 작거나 같은 이진 트리로 정의하고 heapq 는 이 트리를 리스트로 구현해 비교할 칸이 있는 모든 k 에서 `heap[k] <= heap[2*k+1]` 과 `heap[k] <= heap[2*k+2]` 를 지킨다고 적습니다. 그래서 0번 칸의 자식은 1번과 2번, 1번 칸의 자식은 3번과 4번 칸입니다. 자료구조 교과서는 힙을 완전 이진 트리(마지막 층을 빼고 모든 층이 차 있고 마지막 층은 왼쪽부터 채운 트리)이면서 부모가 자식보다 크지 않은 트리로 정의하는데, 리스트는 0번 칸부터 빈칸 없이 채워지므로 리스트로 적은 트리는 늘 완전 이진 트리이고 남는 조건이 문서의 부등식 두 개입니다.

과외에서 저는 0번 칸만 완벽한 최솟값이고 heap[1] 과 heap[2] 는 크기 순서대로 정렬돼 있지 않다고 했는데 맞는 설명입니다. 부등식은 부모와 자식만 비교하고 형제 칸끼리는 비교하지 않습니다. 아래 코드는 과외에서 쓴 값으로 빈 리스트에 40, 10, 30, 5 를 넣고 맨 앞 값을 보고 하나를 꺼낸 뒤 `[9, 1, 5, 2, 7]` 을 heapify 하며 리스트마다 부등식을 지키는지와 작은 값부터 정렬돼 있는지를 찍습니다.

```python
# 하는 일: 빈 리스트에 40, 10, 30, 5 를 heappush 하고 heap[0] 을 본 뒤 heappop 하고, [9, 1, 5, 2, 7] 을 heapify 해서 리스트마다 힙 조건과 정렬 여부를 찍는다.
import heapq                                               # 표준 라이브러리의 힙 모듈

# 1단계: 힙 조건과 정렬 여부를 찍는 함수를 만든다
# k번 칸의 값이 자식 칸 2k + 1, 2k + 2 의 값보다 크지 않으면 힙 조건을 지킨다.
def is_heap(a):                                            # 공식 문서의 부등식을 모든 칸에서 확인한다
    return all(a[k] <= a[c] for k in range(len(a)) for c in (2 * k + 1, 2 * k + 2) if c < len(a))   # 자식 칸이 있을 때만 비교한다

def show(name, a):                                         # 리스트, 힙 조건, 정렬 여부를 한 줄로 찍는다
    print(f'{name}: {a}, 힙 조건 {is_heap(a)}, 정렬됨 {a == sorted(a)}')   # 정렬됨은 작은 값부터 놓였는지 본다

# 2단계: 빈 리스트에 값을 하나씩 넣는다
heap = []                                                  # 힙은 따로 만든 객체가 아니라 빈 리스트다
for value in (40, 10, 30, 5):                              # 과외에서 쓴 순서
    heapq.heappush(heap, value)                            # 힙 조건을 지키며 넣는다
    show(f'heappush({value}) 뒤', heap)                    # 넣을 때마다 찍는다
print(f'type(heap) = {type(heap).__name__}, heap[0] = {heap[0]}')   # 리스트 그대로이고 0번 칸이 가장 작은 값이다

# 3단계: 맨 앞 값을 꺼낸다
smallest = heapq.heappop(heap)                             # 가장 작은 값을 꺼내고 남은 값으로 힙 조건을 다시 맞춘다
print(f'heappop() → {smallest}')                           # 꺼낸 값
show('heappop() 뒤', heap)                                 # 남은 리스트

# 4단계: 값이 든 리스트를 한 번에 힙으로 바꾼다
nums = [9, 1, 5, 2, 7]                                     # 과외에서 쓴 리스트
heapq.heapify(nums)                                        # 새 리스트를 만들지 않고 nums 의 칸을 그 자리에서 바꾼다
show('heapify(nums) 뒤', nums)                             # 맨 앞 값만 가장 작은 값으로 정해진다

# 출력:
# 2단계 뜻: 넣을 때마다 맨 앞 값이 가장 작은 값이고 마지막 [5, 10, 30, 40] 은 우연히 정렬돼 있다.
# heappush(40) 뒤: [40], 힙 조건 True, 정렬됨 True
# heappush(10) 뒤: [10, 40], 힙 조건 True, 정렬됨 True
# heappush(30) 뒤: [10, 40, 30], 힙 조건 True, 정렬됨 False
# heappush(5) 뒤: [5, 10, 30, 40], 힙 조건 True, 정렬됨 True
# type(heap) = list, heap[0] = 5
# 3단계 뜻: 5 를 꺼낸 [10, 40, 30] 은 힙 조건을 지키지만 정렬돼 있지 않다.
# heappop() → 5
# heappop() 뒤: [10, 40, 30], 힙 조건 True, 정렬됨 False
# 4단계 뜻: heapify 한 [1, 2, 5, 9, 7] 도 맨 앞 값만 가장 작고 9 가 7 보다 앞에 있다.
# heapify(nums) 뒤: [1, 2, 5, 9, 7], 힙 조건 True, 정렬됨 False
```

넣을 때마다 맨 앞 값이 그때까지 넣은 값 가운데 가장 작은 값이었고 마지막에 넣은 5 는 0번 칸으로 올라갔습니다. 그 결과 `[5, 10, 30, 40]` 은 정렬돼 있어 힙이 정렬된 리스트처럼 보이지만 우연입니다. 5 를 꺼낸 `[10, 40, 30]` 은 1번 칸의 40 이 2번 칸의 30 보다 크고 heapify 한 `[1, 2, 5, 9, 7]` 은 3번 칸의 9 가 4번 칸의 7 보다 크지만 부모가 자식보다 크지 않아 둘 다 힙 조건은 지킵니다. 넣은 값이 부모 칸과 자리를 바꾸며 올라가는 과정은 [힙의 내부 글](post.html?id=algorithm-lesson-heap-internals)에서 다룹니다.

heap[0] 은 칸 하나를 읽으므로 O(1) 입니다. heappush 와 heappop 은 비교가 많아야 트리의 층 수에 비례해서 값이 N개면 O(log N) 이고 heapify 는 공식 문서가 「in linear time」이라고 적는 대로 O(N) 입니다.

## 2. 정렬된 리스트와 힙에 값 하나를 넣는 비용

**정렬된 리스트에 값 하나를 넣는 bisect.insort 는 넣을 자리를 O(log N) 에 찾은 뒤 그 뒤의 칸을 모두 한 칸씩 밀어야 해서 많아야 N칸을 옮기는 O(N) 이 듭니다. heappush 는 맨 뒤 칸에 넣은 값을 부모 칸과 비교하며 올리므로 값이 N개면 비교가 많아야 floor(log2(N + 1)) 번입니다. 가장 작은 값을 넣으면 값 1,000,000개에서 heappush 는 비교 19번, insort 는 비교 20번에 1,000,000칸을 밉니다.**

과외의 표는 숫자를 넣을 때마다 sort() 를 다시 부르는 리스트와 heapq 를 비교하며 하나를 추가하는 비용을 O(N log N) 대 O(log N), 값 100만 개에서 약 2,000만 번 대 20번이라고 적고 배수까지 붙였습니다. 정렬된 리스트에 값 하나를 넣을 때는 다시 정렬하지 않고 bisect.insort 로 넣을 자리를 이진 탐색으로 찾아 insert 로 넣습니다. [bisect 공식 문서](https://docs.python.org/3/library/bisect.html)는 이 함수에 「O(log n) 탐색보다 느린 O(n) 삽입 단계가 더 크다」(Keep in mind that the O(log n) search is dominated by the slow O(n) insertion step.)고 적습니다. 그래서 비교 대상은 insort 이고 배수와 연산 횟수는 지우고 아래에서 직접 셉니다.

같은 표는 정렬된 리스트에서 최솟값을 꺼내는 비용을 「O(1) (정렬 후 pop)」이라고 적었는데 무엇을 pop 하는지에 따라 다릅니다. 작은 값부터 정렬된 리스트의 `pop(0)` 은 뒤의 값을 모두 한 칸씩 당겨 O(N) 이고([파이썬 튜토리얼](https://docs.python.org/3/tutorial/datastructures.html#using-lists-as-queues)도 리스트 앞에서 꺼내면 나머지를 옮겨 느리다고 적습니다), 큰 값부터 정렬해 두고 `pop()` 하면 O(1) 입니다. 어느 쪽이든 넣을 때의 insort 는 많아야 O(N) 이고 heappop 은 많아야 O(log N) 입니다.

지훈 씨는 이 비교를 보고 물었습니다. 「그러니까 원래 주어진 전체 데이터가 있는 게 아니고 빈 값부터 시작할 때 heapq 로 top k 쓰는 게 유용하다는 거죠?」 반은 맞습니다. 값이 하나씩 들어올 때 유용하다는 말은 맞고 LeetCode 703(Kth Largest Element in a Stream)이 그런 문제입니다. 다만 값이 이미 모두 있을 때도 K 가 작으면 크기 K 힙을 씁니다(5~6절). 과외에서 저는 정렬을 쓰면 서버가 멈춘다고 했는데 이 글은 그 말 대신 센 값을 씁니다.

아래 코드는 1 부터 N 까지 작은 값부터 정렬된 리스트를 만들어 힙으로도 씁니다. 이런 리스트는 모든 부모 칸이 자식 칸보다 작아 그대로 최소 힙입니다. 여기에 가장 작은 값 0 을 넣으면 heappush 는 0 을 0번 칸까지 올리고 insort 는 0번 칸에 넣느라 나머지를 모두 밀어서 두 방법 모두 가장 많은 일을 합니다.

```python
# 하는 일: 1 부터 N 까지 정렬된 리스트(그대로 최소 힙이기도 하다)에 가장 작은 값 0 을 heappush 와 bisect.insort 로 넣어 < 비교 횟수와 뒤로 민 칸 수를 센다. N 은 10 과 1,000,000 이다.
import bisect                                              # 정렬된 리스트에 넣는 insort
import heapq                                               # 힙에 넣는 heappush
import math                                                # floor 와 log2

# 1단계: < 비교를 세는 값을 만든다
# heapq 와 bisect 는 값끼리 < 로만 비교하므로 __lt__ 가 불린 횟수가 비교 횟수다.
class Counted:                                             # 정수 하나를 담고 < 비교를 센다
    count = 0                                              # 모든 값이 함께 쓰는 비교 횟수
    __slots__ = ('value',)                                 # 값을 100만 개 만들어도 메모리를 적게 쓴다
    def __init__(self, value):                             # 담을 정수를 받는다
        self.value = value                                 # 정수를 적어 둔다
    def __lt__(self, other):                               # a < b 를 계산할 때 불린다
        Counted.count += 1                                 # 비교 1번
        return self.value < other.value                    # 담은 정수로 비교한다

# 2단계: 두 크기에서 0 을 넣는다
for n in (10, 1_000_000):                                  # 작은 리스트와 큰 리스트
    values = [Counted(v) for v in range(1, n + 1)]         # 1 부터 n 까지 작은 값부터 정렬된 리스트
    heap = values[:]                                       # 같은 값을 담은 복사본. 정렬돼 있어 그대로 최소 힙이다
    Counted.count = 0                                      # 비교 횟수를 0 으로 둔다
    heapq.heappush(heap, Counted(0))                       # n번 칸에 넣고 부모 칸과 비교하며 올린다
    pushed = Counted.count                                 # heappush 의 비교 횟수
    Counted.count = 0                                      # 다시 0 으로 둔다
    zero = Counted(0)                                      # insort 로 넣을 값
    bisect.insort(values, zero)                            # 넣을 자리를 이진 탐색으로 찾고 insert 로 넣는다
    point = values.index(zero)                             # 0 이 들어간 자리. index 는 < 를 부르지 않는다
    print(f'N = {n:,}: heappush 비교 {pushed}번, floor(log2(N + 1)) = {math.floor(math.log2(n + 1))}')   # 힙에 넣은 비용과 식
    print(f'N = {n:,}: insort 비교 {Counted.count}번, 넣은 자리 {point}, 뒤로 민 칸 {n - point:,}칸')     # 정렬된 리스트에 넣은 비용

# 출력:
# 2단계 뜻: heappush 의 비교는 floor(log2(N + 1)) 과 같고, insort 는 비교가 20번이어도 N칸을 모두 민다.
# N = 10: heappush 비교 3번, floor(log2(N + 1)) = 3
# N = 10: insort 비교 4번, 넣은 자리 0, 뒤로 민 칸 10칸
# N = 1,000,000: heappush 비교 19번, floor(log2(N + 1)) = 19
# N = 1,000,000: insort 비교 20번, 넣은 자리 0, 뒤로 민 칸 1,000,000칸
```

값 10개에서 0 이 들어간 10번 칸의 조상은 4번, 1번, 0번 칸이라 heappush 가 3번 비교했고 값 1,000,000개에서는 19번이라 둘 다 floor(log2(N + 1)) 과 같습니다. 과외에서 크기 10 힙에 넣으면 3~4번 연산한다고 한 자리는 가장 많이 비교하는 이 경우의 3번으로 고칩니다. insort 는 이진 탐색이라 비교가 20번이었지만 0번 자리에 넣느라 뒤의 1,000,000칸을 모두 밀었습니다. 3절은 같은 heappush 와 heappop 으로 가장 큰 K개를 고릅니다.

## 3. Kth Largest Element in an Array (LeetCode 215, Medium)

**LeetCode 215 는 정수 배열에서 K번째로 큰 값을 구하라고 합니다. 크기 K 최소 힙에 값을 하나씩 넣고 넣은 뒤 길이가 K 를 넘으면 맨 앞 값을 꺼내면 리스트에는 지금까지 본 값 가운데 가장 큰 K개가 남고 모든 값을 넣은 뒤의 맨 앞 값이 K번째로 큰 수입니다.**

[LeetCode 215. Kth Largest Element in an Array](https://leetcode.com/problems/kth-largest-element-in-an-array/) 는 정수 배열 `nums` 와 정수 `k` 를 주고 nums 를 정렬했을 때 k번째로 큰 값을 돌려 달라고 합니다. 서로 다른 값 기준이 아니라서 같은 값도 따로 셉니다. 첫 예제 `nums = [3, 2, 1, 5, 6, 4]`, `k = 2` 는 큰 값부터 6, 5 라서 5 가 답이고 둘째 예제 `nums = [3, 2, 3, 1, 2, 4, 5, 5, 6]`, `k = 4` 는 큰 값부터 6, 5, 5, 4 라서 4 가 답입니다. k 는 1 이상 nums 의 길이 이하이고 nums 의 길이는 100,000 이하이며 문제는 정렬하지 않고 풀 수 있는지도 묻습니다. 지훈 씨가 「예시 문제 하나 LeetCode 에서 찾아서 문제와 이전처럼 주석 같이 해 주세요」라고 해서 고른 문제입니다.

과외에서 저는 크기 K 힙을 합격자 K명만 남기는 오디션장에 빗댔습니다. 실제 리스트로는 첫 예제에서 1 을 넣어 `[1, 3, 2]` 가 되면 길이 3 이 K = 2 를 넘으므로 맨 앞 값 1 을 꺼내 `[2, 3]` 을 남깁니다.

가장 큰 K개를 남기려면 버릴 값은 남은 값 가운데 가장 작은 값이고 최소 힙은 그 값을 맨 앞 값으로 두므로 heappop 한 번에 꺼냅니다. 그래서 리스트는 늘 지금까지 본 값 가운데 가장 큰 K개이고 그 맨 앞 값이 지금까지의 K번째로 큰 수입니다.

1. 빈 리스트 `min_heap` 을 둡니다.
2. nums 의 값마다 heappush 로 넣습니다.
3. 넣은 뒤 길이가 k 를 넘으면 heappop 으로 맨 앞 값을 꺼냅니다.
4. 모든 값을 넣은 뒤 `min_heap[0]` 을 돌려줍니다.

첫 예제를 값 하나씩 따라가면 이렇습니다. 리스트는 아래 코드가 찍은 그대로입니다.

| 들어온 값 | 넣은 뒤 리스트 | 길이 | 꺼낸 값 | 꺼낸 뒤 리스트 |
|---|---|---|---|---|
| 3 | [3] | 1 | 없음 | [3] |
| 2 | [2, 3] | 2 | 없음 | [2, 3] |
| 1 | [1, 3, 2] | 3 | 1 | [2, 3] |
| 5 | [2, 3, 5] | 3 | 2 | [3, 5] |
| 6 | [3, 5, 6] | 3 | 3 | [5, 6] |
| 4 | [4, 6, 5] | 3 | 4 | [5, 6] |

1 과 4 는 넣자마자 리스트에서 가장 작은 값이 되어 바로 나갔고 5 와 6 을 넣었을 때는 그전의 맨 앞 값 2 와 3 이 나갔습니다. LeetCode 화면은 `class Solution` 의 메서드라서 아래 코드는 화면의 메서드 이름 `findKthLargest` 와 인자 순서 `nums`, `k` 를 그대로 쓰고 타입 주석은 `from typing import List` 의 `List[int]` 로 적습니다.

```python
# 하는 일: LeetCode 215 를 크기 K 최소 힙으로 풀어 첫 예제에서 값마다 넣은 뒤와 꺼낸 뒤의 리스트를 찍고, 두 예제의 답을 찍는다.
import heapq                                               # 힙에 넣고 꺼내는 함수
from typing import List                                    # 함수 주석의 List[int] 에 쓴다

# 1단계: 풀이를 만든다
# 넣은 뒤 길이가 k 를 넘으면 맨 앞 값을 꺼내서 리스트에는 가장 큰 k개만 남는다.
class Solution:                                            # LeetCode 가 정해 둔 클래스 이름 그대로 둔다
    def findKthLargest(self, nums: List[int], k: int, trace: bool = False) -> int:   # trace 는 이 글이 붙인 인자
        min_heap = []                                      # 크기 K 힙. 빈 리스트에서 시작한다
        for num in nums:                                   # 값을 하나씩
            heapq.heappush(min_heap, num)                  # 넣는다
            pushed = min_heap[:]                           # 넣은 뒤의 리스트를 적어 둔다
            popped = None                                  # 꺼낸 값. 아직 없다
            if len(min_heap) > k:                          # 넣은 뒤 길이가 k 를 넘으면
                popped = heapq.heappop(min_heap)           # 맨 앞 값을 꺼낸다
            if trace:                                      # 따라가기를 켰으면
                print(f'{num} 넣은 뒤 {pushed}, 꺼낸 값 {popped}, 꺼낸 뒤 {min_heap}')   # 이번 값의 상태
        return min_heap[0]                                 # 가장 큰 k개 가운데 가장 작은 값이 k번째로 큰 수다

# 2단계: 첫 예제를 따라간다
print(f'답 {Solution().findKthLargest([3, 2, 1, 5, 6, 4], 2, trace=True)}')   # 값마다 찍고 답을 찍는다

# 3단계: 둘째 예제를 돌린다
print(f'[3, 2, 3, 1, 2, 4, 5, 5, 6], k = 4 → {Solution().findKthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4)}')   # 같은 값이 여러 번 나온다

# 출력:
# 2단계 뜻: 길이가 3 이 될 때마다 맨 앞 값을 꺼내 [5, 6] 이 남고 답은 맨 앞 값 5 다.
# 3 넣은 뒤 [3], 꺼낸 값 None, 꺼낸 뒤 [3]
# 2 넣은 뒤 [2, 3], 꺼낸 값 None, 꺼낸 뒤 [2, 3]
# 1 넣은 뒤 [1, 3, 2], 꺼낸 값 1, 꺼낸 뒤 [2, 3]
# 5 넣은 뒤 [2, 3, 5], 꺼낸 값 2, 꺼낸 뒤 [3, 5]
# 6 넣은 뒤 [3, 5, 6], 꺼낸 값 3, 꺼낸 뒤 [5, 6]
# 4 넣은 뒤 [4, 6, 5], 꺼낸 값 4, 꺼낸 뒤 [5, 6]
# 답 5
# 3단계 뜻: 같은 값이 여러 번 나와도 따로 세어 4번째로 큰 수 4 를 돌려준다.
# [3, 2, 3, 1, 2, 4, 5, 5, 6], k = 4 → 4
```

찍힌 리스트는 위 표와 같고 마지막에 남은 `[5, 6]` 의 맨 앞 값 5 가 답입니다. 둘째 예제는 두 번씩 나온 3 과 5 를 따로 세어 4 를 돌려줬습니다. 값 N개마다 길이가 많아야 K + 1 인 리스트에 넣고 꺼내므로 시간 복잡도는 O(N log K), 공간 복잡도는 O(K) 입니다. 과외에서 이 풀이에 붙인 「N = 1,000,000, K = 2 이면 2,000만 번이 100만 번으로」는 복잡도 식에 N 을 넣은 값이라 6절의 센 값으로 바꿉니다.

아래 데모는 첫 예제를 값 하나씩 보여 줍니다. 보드 위쪽은 리스트, 아래쪽은 같은 리스트의 트리이고 맨 앞 값(트리의 루트 칸)은 범례의 「맨 앞 값」 모양입니다. 「다음 값」을 처음 누르면 이번 단계 칸에 「3을 넣어 [3]이 됐습니다. 길이 1은 K = 2 이하라 그대로 둡니다.」가 나옵니다. 세 번째로 누르면 단계 4 / 10 에서 「1을 넣어 [1, 3, 2]가 됐습니다. 길이 3이 K = 2를 넘어 맨 앞 값 1을 꺼내고 [2, 3]이 남습니다. 방금 넣은 값이 가장 작아 그대로 나갑니다.」가 나오고 상태 칸의 꺼낸 값에 1 이 쌓입니다. 「한 칸」은 넣기와 꺼내기를 한 단계씩 따로 넘깁니다. 「끝까지」를 누르면 단계 10 / 10 에서 결과 칸에 「2번째로 큰 수 5」와 「heappush 6번, heappop 4번, 리스트는 많아야 3칸」이 나오고 꺼낸 값은 1, 2, 3, 4 입니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-lesson-heap-top-k.html?embed=1&mode=topk&preset=leetcode-215" height="860" loading="lazy" title="LeetCode 215 크기 K 최소 힙 미니 데모"></iframe>
<a class="demo-embed-open" href="demo-lesson-heap-top-k.html?mode=topk&preset=leetcode-215" target="_blank" rel="noopener">↗ 전체 데모로 열기</a>
</div>

가장 큰 K개를 남기는 데 최소 힙을 쓴다는 것을 보고 지훈 씨는 반대쪽 경우를 물었습니다.

## 4. 상위 K개와 최소 힙, 하위 K개와 최대 힙

**크기 K 힙에서 꺼낼 수 있는 값은 맨 앞 값 하나라서 버릴 쪽 끝의 값이 맨 앞에 와야 합니다. 가장 큰 K개를 남길 때는 가장 작은 값을 버리므로 최소 힙을, 가장 작은 K개를 남길 때는 가장 큰 값을 버리므로 최대 힙을 씁니다. Python 3.9 의 heapq 에는 공개된 최대 힙 함수가 없어 값의 부호를 뒤집어 최소 힙에 넣고 꺼낼 때 부호를 되돌립니다.**

처음 물음은 「이건 그럼 최댓값 K개를 뽑는 데 많이 쓰겠네요?」였습니다. 맞습니다. 가장 큰 K개를 고를 때 쓰고 가장 작은 K개도 힙의 종류만 바꿔 같은 틀로 고릅니다. 과외에서 저는 이 틀을 매일 쓴다며 회사 이름을 여럿 들었는데 출처가 없어 지웁니다. 지훈 씨가 이어서 물었습니다. 「오히려 상위 k개는 최소 힙, 하위 k개는 최대 힙을 쓴다는 거죠?」 맞습니다. 지훈 씨의 질문을 다시 말하면 「왜 남길 값과 반대 종류의 힙을 쓰는가」입니다. heappop 은 맨 앞 값 하나만 꺼내므로 K + 1개 가운데 버릴 값이 맨 앞에 와야 합니다.

과외에서 저는 파이썬은 최소 힙만 지원하고 정렬의 reverse 처럼 뒤집는 옵션 자체가 없다고 했는데, 지금 공식 문서에는 최대 힙 함수 다섯 개 `heapify_max`, `heappush_max`, `heappop_max`, `heappushpop_max`, `heapreplace_max` 가 있고 함수마다 「Added in version 3.14.」가 붙어 있습니다. 이 블로그의 코드는 Python 3.9 에서 돌고 채점 환경의 버전도 3.14 보다 낮을 수 있어서 이 글은 값의 부호를 뒤집습니다. 가장 큰 값의 부호를 뒤집으면 가장 작은 값이 되어 최소 힙의 맨 앞에 옵니다.

과외에서 말한 `_heapify_max()` 는 CPython 3.9 의 [heapq.py](https://github.com/python/cpython/blob/3.9/Lib/heapq.py) 에 실제로 있습니다. 같은 파일의 merge 와 nsmallest 가 안에서 쓰는 함수이고 이름 앞에 밑줄이 붙어 모듈이 공개하는 이름 목록 `__all__` 에 없습니다. 공개 API 가 아니라 다른 버전에도 같은 이름과 동작으로 남는다는 보장이 없으므로 이 글은 쓰지 않습니다.

아래 코드는 이 블록을 돌린 Python 3.9 의 heapq 에 공개 최대 힙 함수 `heappush_max`, `heapify_max` 와 밑줄 붙은 `_heapify_max` 가 있는지, `_heapify_max` 가 `__all__` 에 있는지 찍습니다.

```python
# 하는 일: 이 블록을 돌린 Python 3.9 의 heapq 에 공개 최대 힙 함수와 내부 함수 _heapify_max 가 있는지, _heapify_max 가 __all__ 에 있는지 찍는다.
import heapq                                               # 표준 라이브러리의 힙 모듈
import sys                                                 # 돌리는 파이썬 버전을 읽는다

print(f'Python {sys.version_info.major}.{sys.version_info.minor}')   # 이 블록을 돌린 버전
print(f"heappush_max {hasattr(heapq, 'heappush_max')}, heapify_max {hasattr(heapq, 'heapify_max')}")   # 3.14 에서 생긴 공개 최대 힙 함수
print(f"_heapify_max {hasattr(heapq, '_heapify_max')}, __all__ 에 있음 {'_heapify_max' in heapq.__all__}")   # 밑줄 붙은 내부 함수는 공개 목록에 없다

# 출력:
# 뜻: 3.9 에는 공개 최대 힙 함수가 없고 _heapify_max 는 있지만 __all__ 에 없다.
# Python 3.9
# heappush_max False, heapify_max False
# _heapify_max True, __all__ 에 있음 False
```

3.9 에는 공개 최대 힙 함수가 없고 `_heapify_max` 는 있지만 `__all__` 에 없었습니다. 그래서 아래 코드는 과외에서 쓴 `[4, 1, 7, 3, 8, 5]` 의 부호를 뒤집어 최소 힙에 넣은 뒤 가장 큰 값을 꺼내고, 2단계에서 같은 값을 크기 2 최소 힙과 크기 2 최대 힙에 넣어 남는 값을 비교합니다.

```python
# 하는 일: [4, 1, 7, 3, 8, 5] 의 부호를 뒤집어 최소 힙에 넣어 가장 큰 값을 꺼낸 뒤, 크기 2 최소 힙과 크기 2 최대 힙이 남기는 값을 비교한다.
import heapq                                               # 표준 라이브러리의 힙 모듈

# 1단계: 부호를 뒤집어 넣고 가장 큰 값을 꺼낸다
nums = [4, 1, 7, 3, 8, 5]                                  # 과외에서 쓴 값
max_heap = []                                              # 부호를 뒤집은 값을 담을 최소 힙
for num in nums:                                           # 값을 하나씩
    heapq.heappush(max_heap, -num)                         # 8 은 -8 이 되어 가장 작은 값이 된다
print(f'부호를 뒤집어 넣은 뒤 {max_heap}')                    # 맨 앞 값이 -8 이다
largest = -heapq.heappop(max_heap)                         # 맨 앞 값을 꺼내 부호를 되돌린다
print(f'가장 큰 값 {largest}, 남은 리스트 {max_heap}')         # 남은 리스트도 부호를 뒤집은 값이다

# 2단계: 같은 값을 크기 2 최소 힙과 크기 2 최대 힙에 넣는다
# sign 이 1 이면 값을 그대로 넣는 최소 힙, -1 이면 부호를 뒤집어 넣는 최대 힙이다.
def keep(nums, k, sign):                                   # 남은 값과 꺼낸 값을 원래 값으로 돌려준다
    heap, popped = [], []                                  # 크기 K 힙과 꺼낸 값
    for num in nums:                                       # 값을 하나씩
        heapq.heappush(heap, sign * num)                   # 넣는다
        if len(heap) > k:                                  # 넣은 뒤 길이가 k 를 넘으면
            popped.append(sign * heapq.heappop(heap))      # 맨 앞 값을 꺼내 원래 값으로 적는다
    return sorted(sign * v for v in heap), popped          # 남은 값을 작은 값부터 원래 값으로
for sign, name in ((1, '크기 2 최소 힙'), (-1, '크기 2 최대 힙')):   # 두 힙을 차례로
    kept, popped = keep(nums, 2, sign)                     # 같은 값을 넣는다
    print(f'{name}: 남은 값 {kept}, 꺼낸 값 {popped}')          # 어느 쪽 끝이 남는지 본다

# 출력:
# 1단계 뜻: 맨 앞 값 -8 을 꺼내 부호를 되돌리면 가장 큰 값 8 이다.
# 부호를 뒤집어 넣은 뒤 [-8, -7, -5, -1, -3, -4]
# 가장 큰 값 8, 남은 리스트 [-7, -4, -5, -1, -3]
# 2단계 뜻: 최소 힙은 가장 큰 두 값을, 최대 힙은 가장 작은 두 값을 남긴다.
# 크기 2 최소 힙: 남은 값 [7, 8], 꺼낸 값 [1, 3, 4, 5]
# 크기 2 최대 힙: 남은 값 [1, 3], 꺼낸 값 [7, 4, 8, 5]
```

부호를 뒤집어 넣은 리스트의 맨 앞 값 -8 을 꺼내 부호를 되돌리면 가장 큰 값 8 이고 남은 `[-7, -4, -5, -1, -3]` 도 부호를 뒤집은 값입니다. 2단계에서 크기 2 최소 힙은 작은 값을 버려 7 과 8 을, 크기 2 최대 힙은 큰 값을 버려 1 과 3 을 남겼습니다. 9절의 973 이 크기 K 최대 힙을 쓰는 문제입니다.

## 5. 값이 모두 있을 때의 세 방법

**값이 이미 모두 있으면 크기 K 힙 말고도 전체를 정렬해 앞의 K개를 자르는 방법과 부호를 뒤집은 리스트를 heapify 한 뒤 K번 꺼내는 방법이 있습니다. 정렬과 heapify 는 값 N개를 모두 담은 리스트가 있어야 해서 메모리가 O(N) 이고 크기 K 힙은 리스트가 많아야 K + 1칸이라 O(K) 입니다.**

지훈 씨가 물었습니다. 「만약 전체 데이터가 다 있는 top k 를 뽑는 거라면 heapq 는 빈 리스트부터 시작해서 하나씩 넣는 거예요?」 그렇게 해도 됩니다. 값이 이미 리스트에 있어도 빈 리스트에서 시작할 수 있고 다른 방법이 둘 더 있습니다. 설명을 듣고 지훈 씨가 다시 청했습니다. 「음.. 잘 이해가 안 돼요. top k 뽑는 것 예시로 종류별로 설명 좀 해 주세요.」 그래서 시험 점수라고 가정한 가상 데이터 `[10, 5, 20, 1, 15, 30]` 에서 가장 큰 2개를 세 방법으로 골랐습니다.

| 방법 | 하는 일 | 메모리 |
|---|---|---|
| 정렬 | `sorted(nums, reverse=True)` 로 큰 값부터 정렬하고 앞의 K개를 자른다 | O(N), 정렬한 새 리스트 |
| 부호를 뒤집은 heapify | 부호를 뒤집은 리스트를 heapify 하고 K번 꺼내 부호를 되돌린다 | O(N), 부호를 뒤집은 새 리스트 |
| 크기 K 힙 | 빈 리스트에 하나씩 넣고 넣은 뒤 길이가 K 를 넘으면 맨 앞 값을 꺼낸다 | O(K), 많아야 K + 1칸 |

과외에서 저는 세 번째 방법을 설명하며 1 이 맨 앞 값 10 보다 작으니 「입구 컷(무시)」이라고 했는데 과외의 코드는 그렇게 돌지 않습니다. 코드는 1 을 먼저 넣고 길이가 K 를 넘은 것을 본 뒤 맨 앞 값을 꺼내므로 1 은 들어왔다가 바로 나갑니다. 넣기 전에 맨 앞 값과 먼저 비교하는 방법은 6절에서 셉니다. 아래 코드는 세 방법을 차례로 돌리고 크기 K 힙은 값마다 리스트를 찍습니다.

```python
# 하는 일: 가상 점수 [10, 5, 20, 1, 15, 30] 에서 가장 큰 2개를 정렬, 부호를 뒤집은 heapify, 크기 K 힙으로 고르고 크기 K 힙은 값마다 리스트를 찍는다.
import heapq                                               # 힙 함수

nums = [10, 5, 20, 1, 15, 30]                              # 시험 점수라고 가정한 가상 데이터
k = 2                                                      # 가장 큰 2개를 고른다

# 1단계: 전체를 정렬하고 앞의 k개를 자른다
print(f'정렬: {sorted(nums, reverse=True)[:k]}')            # 큰 값부터 정렬한 새 리스트의 앞 k개

# 2단계: 부호를 뒤집은 리스트를 heapify 하고 k번 꺼낸다
max_heap = [-x for x in nums]                              # 부호를 뒤집은 새 리스트
heapq.heapify(max_heap)                                    # 한 번에 힙으로 바꾼다
print(f'heapify 뒤 {max_heap}')                            # 맨 앞 값 -30 은 원래 가장 큰 30 이다
top1 = -heapq.heappop(max_heap)                            # 첫째로 큰 값
top2 = -heapq.heappop(max_heap)                            # 둘째로 큰 값
print('heapify 뒤 두 번 꺼낸 값', top1, top2)               # print 에 값 두 개를 넘기면 공백으로 나눠 찍는다

# 3단계: 빈 리스트에 하나씩 넣고 길이를 k 로 지킨다
min_heap = []                                              # 크기 K 힙
for num in nums:                                           # 값을 하나씩
    heapq.heappush(min_heap, num)                          # 먼저 넣는다
    pushed = min_heap[:]                                   # 넣은 뒤의 리스트
    popped = heapq.heappop(min_heap) if len(min_heap) > k else None   # 길이가 k 를 넘으면 맨 앞 값을 꺼낸다
    print(f'{num} 넣은 뒤 {pushed}, 꺼낸 값 {popped}, 꺼낸 뒤 {min_heap}')   # 이번 값의 상태
print(f'크기 K 힙: {min_heap}')                             # 남은 두 값

# 출력:
# 1단계 뜻: 정렬은 큰 값부터 놓은 새 리스트의 앞 두 개를 자른다.
# 정렬: [30, 20]
# 2단계 뜻: heapify 뒤 맨 앞 값을 두 번 꺼내 30, 20 을 얻고 print 는 두 값을 공백으로 나눠 찍는다.
# heapify 뒤 [-30, -15, -20, -1, -5, -10]
# heapify 뒤 두 번 꺼낸 값 30 20
# 3단계 뜻: 1 은 [1, 20, 10] 으로 들어왔다가 바로 나가고 끝에 [20, 30] 이 남는다.
# 10 넣은 뒤 [10], 꺼낸 값 None, 꺼낸 뒤 [10]
# 5 넣은 뒤 [5, 10], 꺼낸 값 None, 꺼낸 뒤 [5, 10]
# 20 넣은 뒤 [5, 10, 20], 꺼낸 값 5, 꺼낸 뒤 [10, 20]
# 1 넣은 뒤 [1, 20, 10], 꺼낸 값 1, 꺼낸 뒤 [10, 20]
# 15 넣은 뒤 [10, 20, 15], 꺼낸 값 10, 꺼낸 뒤 [15, 20]
# 30 넣은 뒤 [15, 20, 30], 꺼낸 값 15, 꺼낸 뒤 [20, 30]
# 크기 K 힙: [20, 30]
```

세 방법 모두 30 과 20 을 골랐습니다. 2단계의 heapify 는 부호를 뒤집은 리스트를 `[-30, -15, -20, -1, -5, -10]` 으로 바꿔 원래 가장 큰 30 을 맨 앞에 두었습니다. 과외에서 같은 꼴의 코드에 `print(top1, top2)  # [1, 2]` 라고 적었던 줄도 리스트가 아니라 공백으로 나눈 `1 2` 를 찍습니다. 3단계에서 1 은 `[1, 20, 10]` 으로 들어왔다가 바로 나갔습니다. 과외에서는 크기 K 힙이면 값이 1억 개여도 메모리 걱정이 없다고 했는데 이 글은 칸 수로 씁니다. 크기 K 힙의 리스트는 많아야 K + 1칸입니다. 정렬과 부호를 뒤집은 heapify 는 값 N개를 담은 새 리스트를 만듭니다. nums 를 그 자리에서 heapify 해 새 리스트를 만들지 않는 풀이는 7절에 있습니다.

아래 데모는 같은 점수를 크기 K 최소 힙으로 보여 줍니다. 「다음 값」을 네 번 누르면 단계 6 / 10 에서 「1을 넣어 [1, 20, 10]이 됐습니다. 길이 3이 K = 2를 넘어 맨 앞 값 1을 꺼내고 [10, 20]이 남습니다. 방금 넣은 값이 가장 작아 그대로 나갑니다.」가 나오고 상태 칸의 꺼낸 값이 5, 1 이 됩니다. 「끝까지」를 누르면 결과 칸에 「2번째로 큰 수 20」이 나오고 리스트에는 `[20, 30]`, 꺼낸 값에는 5, 1, 10, 15 가 남습니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-lesson-heap-top-k.html?embed=1&mode=topk&preset=scores" height="840" loading="lazy" title="가상 점수 6개의 크기 K 최소 힙 미니 데모"></iframe>
<a class="demo-embed-open" href="demo-lesson-heap-top-k.html?mode=topk&preset=scores" target="_blank" rel="noopener">↗ 전체 데모로 열기</a>
</div>

값 6개로는 세 방법의 차이가 보이지 않아 6절은 값 100,000개로 비교 횟수를 셉니다.

## 6. 다섯 방법의 비교 횟수

**복잡도 식에 N 과 K 를 넣은 값은 연산 횟수가 아니므로 값 100,000개에서 가장 큰 K개를 고르며 < 비교를 직접 셉니다. K = 5 에서는 맨 앞 값과 먼저 비교해 클 때만 바꾸는 방법과 nlargest 가 똑같이 100,135번으로 가장 적고 넣고 꺼내는 크기 K 힙은 K = 1,000 에서 1,859,675번으로 sorted 의 1,529,024번보다 많이 비교합니다.**

과외에서 저는 값 100만 개에서 가장 큰 5개를 고르면 전체 정렬이 N log N 으로 약 2,000만 번, 크기 5 힙이 N log K 로 약 230만 번 연산한다고 했습니다. O 표기는 상수와 낮은 차수를 빼고 N 이 커질 때 늘어나는 빠르기만 적은 식이라서 N 을 넣은 값이 실제 연산 횟수와 같지 않습니다. 그래서 이 절은 heapq 와 sorted 가 값끼리 비교할 때 쓰는 < 를 셉니다.

1. 정렬: `sorted(values, reverse=True)[:k]`.
2. 부호를 뒤집은 heapify: 5절 2단계.
3. 넣고 꺼내는 크기 K 힙: 3절의 풀이.
4. 먼저 비교하는 크기 K 힙: 앞의 k개를 heapify 하고 그다음 값마다 맨 앞 값보다 클 때만 heapreplace 로 바꿉니다. heapreplace 는 맨 앞 값을 꺼내고 새 값을 넣는 일을 한 번에 해서 리스트 길이가 k 로 그대로입니다.
5. `heapq.nlargest(k, values)`.

과외에서 저는 nlargest 도 안에서 정확히 3번 방식을 쓴다고 했는데 3.9 의 [heapq.py](https://github.com/python/cpython/blob/3.9/Lib/heapq.py) 를 보면 다릅니다. nlargest 는 n 이 1 이면 `max()` 를, n 이 값의 개수 이상이면 `sorted()` 를 쓰고 나머지 경우에는 앞의 n개로 힙을 만든 뒤 `if top < elem:` 으로 맨 앞 값과 먼저 비교해 클 때만 heapreplace 합니다. 값마다 순번을 붙인 튜플로 힙을 만들어 크기가 같은 값의 순서까지 문서가 적는 `sorted(iterable, key=key, reverse=True)[:n]` 과 같게 맞추고 끝에 남은 n개를 큰 값부터 정렬해 돌려줍니다.

아래 코드는 `random.seed(0)` 으로 1 부터 10^9 사이의 정수 100,000개를 만들고 2절의 Counted 처럼 < 를 세는 값에 담아 K = 5 와 K = 1,000 에서 다섯 방법을 돌립니다. 다섯 방법 모두 가장 큰 K개를 큰 값부터 정렬해 돌려주도록 맞춰서 3번과 4번은 끝에 남은 K개를 정렬하는 비교까지 세고 4번은 heapreplace 로 바꾼 횟수도 셉니다. 로컬 Python 3.9.7 에서 2초 안에 끝났습니다.

```python
# 하는 일: 1 부터 10^9 사이의 정수 100,000개에서 가장 큰 K개를 다섯 방법으로 고르며 < 비교 횟수를 세고, K = 5 와 K = 1,000 에서 비교한다.
import heapq                                               # 힙 함수와 nlargest
import random                                              # 가상 데이터를 만든다

# 1단계: < 비교를 세는 값과 데이터를 만든다
# 2절과 같은 Counted 다. 모든 방법이 같은 정수 100,000개를 쓴다.
class Counted:                                             # 정수 하나를 담고 < 비교를 센다
    count = 0                                              # 모든 값이 함께 쓰는 비교 횟수
    __slots__ = ('value',)                                 # 메모리를 적게 쓴다
    def __init__(self, value):                             # 담을 정수를 받는다
        self.value = value                                 # 정수를 적어 둔다
    def __lt__(self, other):                               # a < b 를 계산할 때 불린다
        Counted.count += 1                                 # 비교 1번
        return self.value < other.value                    # 담은 정수로 비교한다

random.seed(0)                                             # 돌릴 때마다 같은 데이터가 나오게 한다
numbers = [random.randint(1, 10 ** 9) for _ in range(100_000)]   # 가상 데이터 100,000개

# 2단계: 힙을 쓰는 세 방법을 만든다
# 모두 가장 큰 k개를 큰 값부터 정렬해 돌려준다. 맨 앞 값과 먼저 비교하는 방법은 바꾼 횟수도 돌려준다.
def by_heapify(values, k):                                 # 2. 부호를 뒤집은 heapify 뒤 k번 꺼내기
    heap = [Counted(-v.value) for v in values]             # 부호를 뒤집은 새 리스트. 만드는 동안 < 는 불리지 않는다
    Counted.count = 0                                      # 리스트를 만든 뒤부터 센다
    heapq.heapify(heap)                                    # 한 번에 힙으로 바꾼다
    return [Counted(-heapq.heappop(heap).value) for _ in range(k)], None   # k번 꺼내 부호를 되돌린다

def by_push_pop(values, k):                                # 3. 넣고 꺼내는 크기 K 힙
    heap = []                                              # 빈 리스트에서 시작한다
    for v in values:                                       # 값을 하나씩
        heapq.heappush(heap, v)                            # 먼저 넣는다
        if len(heap) > k:                                  # 넣은 뒤 길이가 k 를 넘으면
            heapq.heappop(heap)                            # 맨 앞 값을 꺼낸다
    return sorted(heap, reverse=True), None                # 남은 k개를 큰 값부터

def by_compare_first(values, k):                           # 4. 맨 앞 값과 먼저 비교하는 크기 K 힙
    heap = values[:k]                                      # 앞의 k개로 시작한다
    heapq.heapify(heap)                                    # 힙으로 바꾼다
    replaced = 0                                           # heapreplace 로 바꾼 횟수
    for v in values[k:]:                                   # 나머지 값을 하나씩
        if heap[0] < v:                                    # 맨 앞 값보다 클 때만
            heapq.heapreplace(heap, v)                     # 맨 앞 값을 꺼내고 v 를 넣는다
            replaced += 1                                  # 바꾼 횟수 1번
    return sorted(heap, reverse=True), replaced            # 남은 k개를 큰 값부터

# 3단계: 다섯 방법을 K = 5 와 K = 1,000 에서 센다
methods = [('sorted', lambda values, k: (sorted(values, reverse=True)[:k], None)),   # 1. 전체를 정렬하고 앞의 k개
           ('부호를 뒤집은 heapify', by_heapify), ('넣고 꺼내는 크기 K 힙', by_push_pop),   # 2와 3
           ('먼저 비교하는 크기 K 힙', by_compare_first),                               # 4
           ('nlargest', lambda values, k: (heapq.nlargest(k, values), None))]          # 5. 표준 라이브러리
for k in (5, 1_000):                                       # 작은 K 와 큰 K
    answer = sorted(numbers, reverse=True)[:k]             # 정답. 일반 정수라 < 를 세지 않는다
    for name, method in methods:                           # 방법마다
        values = [Counted(n) for n in numbers]             # 같은 정수를 Counted 에 담는다
        Counted.count = 0                                  # 비교 횟수를 0 으로 둔다
        result, replaced = method(values, k)               # 가장 큰 k개를 고른다
        note = f', 바꾼 횟수 {replaced:,}번' if replaced is not None else ''   # 먼저 비교하는 방법만
        print(f'K = {k:,}, {name}: 비교 {Counted.count:,}번, 정답과 같음 {[c.value for c in result] == answer}{note}')   # 한 줄씩

# 출력:
# 3단계 뜻: 다섯 방법 모두 정답을 고르고, 먼저 비교하는 크기 K 힙과 nlargest 의 비교 횟수가 같다.
# K = 5, sorted: 비교 1,529,024번, 정답과 같음 True
# K = 5, 부호를 뒤집은 heapify: 비교 165,078번, 정답과 같음 True
# K = 5, 넣고 꺼내는 크기 K 힙: 비교 399,987번, 정답과 같음 True
# K = 5, 먼저 비교하는 크기 K 힙: 비교 100,135번, 정답과 같음 True, 바꾼 횟수 45번
# K = 5, nlargest: 비교 100,135번, 정답과 같음 True
# K = 1,000, sorted: 비교 1,529,024번, 정답과 같음 True
# K = 1,000, 부호를 뒤집은 heapify: 비교 181,921번, 정답과 같음 True
# K = 1,000, 넣고 꺼내는 크기 K 힙: 비교 1,859,675번, 정답과 같음 True
# K = 1,000, 먼저 비교하는 크기 K 힙: 비교 158,956번, 정답과 같음 True, 바꾼 횟수 4,578번
# K = 1,000, nlargest: 비교 158,956번, 정답과 같음 True
```

센 값을 표로 옮기면 이렇습니다. 다섯 방법 모두 정답과 같은 K개를 골랐습니다.

| 방법 | K = 5 | K = 1,000 |
|---|---|---|
| sorted | 1,529,024 | 1,529,024 |
| 부호를 뒤집은 heapify | 165,078 | 181,921 |
| 넣고 꺼내는 크기 K 힙 | 399,987 | 1,859,675 |
| 먼저 비교하는 크기 K 힙 | 100,135 | 158,956 |
| nlargest | 100,135 | 158,956 |

sorted 는 K 와 상관없이 전체를 정렬하므로 두 K 에서 같은 횟수였습니다. 넣고 꺼내는 크기 K 힙은 값 100,000개를 모두 넣고 그 가운데 100,000 - K 개를 다시 꺼내므로 값마다 넣을 때와 꺼낼 때 비교를 하고 리스트가 길어지는 K = 1,000 에서는 한 번 넣고 꺼낼 때의 비교가 늘어 sorted 보다 많아졌습니다. 부호를 뒤집은 heapify 는 리스트 전체를 한 번 heapify 하는 비교가 대부분이고 K번 꺼내는 비교가 더해졌습니다.

먼저 비교하는 크기 K 힙은 맨 앞 값보다 크지 않은 값을 비교 한 번으로 넘겨서, 앞의 K개 뒤에 오는 값 가운데 heapreplace 까지 간 값이 K = 5 에서 45개, K = 1,000 에서 4,578개뿐이었습니다. 3.9 의 heapq.py 에 적힌 알고리즘 메모대로 무작위 순서에서는 i번째 값이 그때까지의 상위 k개에 들 확률이 k/i 라서 뒤로 갈수록 바꿀 일이 줄어듭니다. 같은 메모는 새 값마다 힙에 넣어야 하는 입력을 최악의 경우로 적는데, 가장 큰 K개를 고를 때는 작은 값부터 정렬돼 들어오는 입력이 그렇습니다. nlargest 는 위에서 본 소스대로 이 방법과 같은 순서로 비교해서 두 K 에서 모두 비교 횟수가 같았습니다.

공식 문서는 nlargest 와 nsmallest 가 n 이 작을 때 가장 잘 돌고 n 이 크면 sorted 가 더 효율적이며 n 이 1 이면 내장 함수 min 과 max 가 낫다고 적습니다. 이 글의 표에서는 K = 1,000 에서도 nlargest 가 sorted 보다 적게 비교했지만 걸리는 시간은 비교 횟수만으로 정해지지 않습니다. 3.9 의 nlargest 는 heapq.py 에 파이썬 for 문으로 적혀 있어 값마다 비교 말고도 그 줄들을 돕니다. sorted 는 C 로 구현된 내장 함수입니다. 지훈 씨의 다음 질문은 heapify 로도 215 를 풀 수 있느냐였습니다.

## 7. LeetCode 215 의 heapify 풀이 두 가지

**heapify 는 자식이 있는 마지막 칸부터 0번 칸까지 거꾸로 가며 값을 자식 쪽으로 내려 보내 리스트를 한 번에 힙으로 바꿉니다. 215 는 부호를 뒤집은 리스트를 heapify 하고 K번 꺼내도 되고 nums 를 그대로 heapify 하고 작은 값 N - K 개를 꺼내 버려도 됩니다. 앞의 풀이는 O(N + K log N), 뒤의 풀이는 O(N + (N - K) log N) 이고 뒤의 풀이에는 부호가 없습니다.**

지훈 씨는 heapify 를 쓰면 무엇이 다른지 설명해 달라고 한 뒤 물었습니다. 「heapify 로 같은 문제를 풀었을 때 답을 보여 줄래요?」 두 가지로 풀 수 있습니다. 하나는 부호를 뒤집어 K번 꺼내는 풀이이고 다른 하나는 작은 값 N - K 개를 버리는 풀이입니다. 뒤의 풀이는 값 6개 가운데 2번째로 큰 값이 작은 값부터 5번째라서 작은 값 4개를 버리면 맨 앞에 온다는 데서 나옵니다.

과외에서는 heapify 가 리프 노드(자식이 없는 칸)부터 거꾸로 올라간다고 했는데, 3.9 의 heapq.py 는 `for i in reversed(range(n//2)):` 로 n//2 - 1 번 칸부터 0번 칸까지 거꾸로 돕니다. n//2 - 1 번은 자식이 있는 마지막 칸입니다. 그 뒤의 칸은 자식이 없어 이미 힙 조건을 지키므로 건너뜁니다. 돌 때마다 그 칸의 값을 자식보다 크지 않은 자리까지 내려 보내서 그 칸 아래의 부분 트리가 힙 조건을 지킵니다. 공식 문서는 이 heapify 를 「in linear time」, 곧 O(N) 이라고 적습니다.

아래 첫 코드는 부호를 뒤집는 풀이입니다. heapify 가 고치는 칸의 번호와 heapify 뒤의 리스트, 꺼낸 값을 찍습니다.

```python
# 하는 일: LeetCode 215 를 부호를 뒤집은 리스트의 heapify 와 k번 꺼내기로 풀어 첫 예제에서 heapify 가 도는 칸, heapify 뒤의 리스트, 꺼낸 값을 찍는다.
import heapq                                               # 힙 함수
from typing import List                                    # 함수 주석의 List[int] 에 쓴다

# 1단계: 풀이를 만든다
# 원래 가장 큰 값이 부호를 뒤집은 리스트에서는 가장 작은 값이라 맨 앞에 온다.
class Solution:                                            # LeetCode 가 정해 둔 클래스 이름 그대로 둔다
    def findKthLargest(self, nums: List[int], k: int, trace: bool = False) -> int:   # trace 는 이 글이 붙인 인자
        max_heap = [-num for num in nums]                  # 부호를 뒤집은 새 리스트
        if trace:                                          # 따라가기를 켰으면
            print(f'부호를 뒤집은 리스트 {max_heap}, heapify 가 도는 칸 {list(reversed(range(len(max_heap) // 2)))}')   # heapq.py 와 같은 순서
        heapq.heapify(max_heap)                            # 한 번에 힙으로 바꾼다
        if trace:                                          # 따라가기를 켰으면
            print(f'heapify 뒤 {max_heap}')                # 맨 앞 값이 원래 가장 큰 값이다
        result = 0                                         # 마지막으로 꺼낸 값
        for _ in range(k):                                 # k번
            result = -heapq.heappop(max_heap)              # 꺼내서 부호를 되돌린다
            if trace:                                      # 따라가기를 켰으면
                print(f'꺼낸 값 {result}, 남은 {max_heap}')  # 꺼낼 때마다 찍는다
        return result                                      # k번째로 꺼낸 값이 k번째로 큰 수다

# 2단계: 첫 예제를 따라간다
print(f'답 {Solution().findKthLargest([3, 2, 1, 5, 6, 4], 2, trace=True)}')   # 상태를 찍고 답을 찍는다

# 출력:
# 2단계 뜻: heapify 는 2, 1, 0번 칸만 돌고, 부호를 되돌려 꺼낸 6, 5 가운데 두 번째 5 가 답이다.
# 부호를 뒤집은 리스트 [-3, -2, -1, -5, -6, -4], heapify 가 도는 칸 [2, 1, 0]
# heapify 뒤 [-6, -5, -4, -3, -2, -1]
# 꺼낸 값 6, 남은 [-5, -3, -4, -1, -2]
# 꺼낸 값 5, 남은 [-4, -3, -2, -1]
# 답 5
```

heapify 는 값 6개에서 2, 1, 0번 칸만 돌고 3~5번 칸은 건너뛰었습니다. heapify 뒤의 맨 앞 값 -6 은 원래 가장 큰 6 이고 두 번 꺼낸 값이 6, 5 라서 답은 5 입니다. heapify 가 O(N), 꺼내기 K번이 각각 많아야 O(log N) 이라 시간 복잡도는 O(N + K log N) 이고 부호를 뒤집은 새 리스트 때문에 공간 복잡도는 O(N) 입니다.

둘째 코드는 부호 없이 nums 를 그대로 heapify 하고 작은 값 N - K 개를 꺼내 버립니다.

```python
# 하는 일: LeetCode 215 를 nums 의 heapify 와 작은 값 N - K 개 버리기로 풀어 첫 예제에서 heapify 뒤의 리스트, 버린 값, 남은 리스트를 찍는다.
import heapq                                               # 힙 함수
from typing import List                                    # 함수 주석의 List[int] 에 쓴다

# 1단계: 풀이를 만든다
# 작은 값부터 N - K 개를 버리면 남은 K개 가운데 가장 작은 맨 앞 값이 K번째로 큰 수다.
class Solution:                                            # LeetCode 가 정해 둔 클래스 이름 그대로 둔다
    def findKthLargest(self, nums: List[int], k: int, trace: bool = False) -> int:   # trace 는 이 글이 붙인 인자
        heapq.heapify(nums)                                # 새 리스트 없이 nums 를 그 자리에서 힙으로 바꾼다
        if trace:                                          # 따라가기를 켰으면
            print(f'heapify 뒤 {nums}')                    # 맨 앞 값이 가장 작은 값이다
        dropped = [heapq.heappop(nums) for _ in range(len(nums) - k)]   # 작은 값부터 N - K 개를 꺼내 버린다
        if trace:                                          # 따라가기를 켰으면
            print(f'버린 값 {dropped}, 남은 {nums}')        # 남은 k개
        return nums[0]                                     # 남은 k개 가운데 가장 작은 값이 답이다

# 2단계: 첫 예제를 따라간다
print(f'답 {Solution().findKthLargest([3, 2, 1, 5, 6, 4], 2, trace=True)}')   # 상태를 찍고 답을 찍는다

# 출력:
# 2단계 뜻: 작은 값 4개를 버린 뒤 남은 [5, 6] 의 맨 앞 값 5 가 답이다.
# heapify 뒤 [1, 2, 3, 5, 6, 4]
# 버린 값 [1, 2, 3, 4], 남은 [5, 6]
# 답 5
```

heapify 뒤의 `[1, 2, 3, 5, 6, 4]` 에서 작은 값 1, 2, 3, 4 를 버리자 `[5, 6]` 이 남았고 맨 앞 값 5 가 답입니다. 시간 복잡도는 heapify 의 O(N) 에 꺼내기 N - K 번이 더해진 O(N + (N - K) log N) 이고 nums 를 그 자리에서 바꾸므로 nums 밖의 메모리는 O(1) 입니다. 대신 nums 의 순서가 바뀌어서 nums 를 다시 쓸 코드라면 복사본을 heapify 합니다. 꺼내는 횟수로 보면 K 가 N 에 가까울 때 이 풀이가, K 가 작을 때 부호를 뒤집는 풀이가 적게 꺼냅니다.

두 풀이를 본 지훈 씨가 물었습니다. 「이상하다 했어요. heapify 를 쓰면 어쩔 수 없이 - 를 붙여야 하는 거죠?」 아닙니다. 둘째 풀이는 부호 없이 heapify 했고 Python 3.14 이상이면 heapify_max 로 최대 힙을 바로 만듭니다. 과외에서 저는 이 질문에 그렇다고 답했는데 둘째 풀이를 보인 바로 뒤라 틀린 답이었습니다. 부호는 3.9 의 최소 힙에서 원래 가장 큰 값을 맨 앞에 둘 때만 필요합니다.

아래 데모의 「부호를 뒤집는 풀이」 탭은 첫 예제의 첫 풀이를 보여 줍니다. 「한 칸」을 한 번 누르면 부호를 뒤집은 `[-3, -2, -1, -5, -6, -4]` 가 나오고 한 번 더 누르면 이번 단계 칸이 「heapify 한 번에 [-6, -5, -4, -3, -2, -1]이 됐습니다. 맨 앞 값 -6은 가장 작고, 원래 값으로는 가장 큰 6입니다.」로 바뀝니다. 「끝까지」를 누르면 단계 4 / 4 에서 결과 칸에 「2번째로 큰 수 5」와 「heapify 1번, heappop 2번, 리스트 6칸」이 나오고 꺼낸 값은 6, 5 입니다. 「N - K 개를 버리는 풀이」 탭은 같은 입력으로 둘째 풀이를 보여 줍니다. 「다음 값」을 한 번 누르면 「heapify 한 번에 [1, 2, 3, 5, 6, 4]가 됐습니다. 맨 앞 값 1은 가장 작은 값이고, 작은 값 4개를 차례로 꺼내 버립니다.」가 나오고 「끝까지」를 누르면 결과 칸에 「2번째로 큰 수 5」와 「heapify 1번, heappop 4번, 리스트 6칸」이 나오며 리스트에는 `[5, 6]` 이 남습니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-lesson-heap-top-k.html?embed=1&mode=negate&preset=leetcode-215" height="860" loading="lazy" title="LeetCode 215 부호를 뒤집는 풀이와 N - K 개를 버리는 풀이 미니 데모"></iframe>
<a class="demo-embed-open" href="demo-lesson-heap-top-k.html?mode=negate&preset=leetcode-215" target="_blank" rel="noopener">↗ 전체 데모로 열기</a>
</div>

215 는 값 하나를 크기로 비교했습니다. 8절의 문제는 값과 그 값이 나온 횟수를 함께 힙에 넣습니다.

## 8. Top K Frequent Elements (LeetCode 347, Medium)

**LeetCode 347 은 정수 배열에서 가장 자주 나온 값 K개를 순서와 상관없이 돌려 달라고 합니다. Counter 로 값마다 나온 횟수를 센 뒤 (횟수, 값) 튜플을 크기 K 최소 힙에 넣고 넣은 뒤 길이가 K 를 넘으면 맨 앞 튜플을 꺼내면, 튜플은 첫 값부터 비교하므로 횟수가 가장 적은 튜플이 나가고 가장 자주 나온 K개가 남습니다.**

[LeetCode 347. Top K Frequent Elements](https://leetcode.com/problems/top-k-frequent-elements/) 는 정수 배열 `nums` 와 정수 `k` 를 주고 가장 자주 나온 값 k개를 돌려 달라고 하며 답의 순서는 상관없습니다. 첫 예제 `nums = [1, 1, 1, 2, 2, 3]`, `k = 2` 는 1 이 3번, 2 가 2번, 3 이 1번 나와 `[1, 2]` 가 답이고 둘째 예제 `nums = [1]`, `k = 1` 은 `[1]`, 셋째 예제 `nums = [1, 2, 1, 2, 1, 2, 3, 1, 3, 2]`, `k = 2` 는 1 과 2 가 4번씩 나와 `[1, 2]` 입니다. k 는 1 이상 서로 다른 값의 개수 이하이고 답이 하나로 정해지는 입력만 주어지며 nums 의 길이가 n 일 때 O(n log n) 보다 빠른 풀이를 요구합니다.

튜플끼리는 첫 값부터 비교하고 첫 값이 같을 때만 둘째 값을 비교하므로 (횟수, 값) 튜플은 횟수가 작을수록 맨 앞에 옵니다. 공식 문서도 힙의 값이 튜플이면 우선순위 같은 비교 값을 레코드와 함께 둘 수 있다고 적습니다. 서로 다른 값이 M개일 때 전체를 횟수로 정렬하면 O(M log M) 이고 크기 K 힙은 O(M log K) 입니다.

1. `Counter(nums)` 로 값마다 나온 횟수를 셉니다.
2. 값과 횟수마다 `(횟수, 값)` 을 heappush 로 넣습니다.
3. 넣은 뒤 길이가 k 를 넘으면 heappop 으로 횟수가 가장 적은 튜플을 꺼냅니다.
4. 남은 튜플에서 값만 모아 돌려줍니다.

```python
# 하는 일: LeetCode 347 을 Counter 와 (횟수, 값) 튜플의 크기 K 최소 힙으로 풀어 세 예제에서 센 횟수, 남은 튜플, 답을 찍는다.
import heapq                                               # 힙 함수
from collections import Counter                            # 값마다 나온 횟수를 센다
from typing import List                                    # 함수 주석의 List[int] 에 쓴다

# 1단계: 풀이를 만든다
# 튜플은 첫 값인 횟수부터 비교하므로 맨 앞 튜플이 지금 남은 것 가운데 가장 적게 나온 값이다.
class Solution:                                            # LeetCode 가 정해 둔 클래스 이름 그대로 둔다
    def topKFrequent(self, nums: List[int], k: int, trace: bool = False) -> List[int]:   # trace 는 이 글이 붙인 인자
        count = Counter(nums)                              # {값: 나온 횟수}
        min_heap = []                                      # (횟수, 값) 튜플의 크기 K 힙
        for num, freq in count.items():                    # 서로 다른 값마다
            heapq.heappush(min_heap, (freq, num))          # 횟수를 첫 값으로 넣는다
            if len(min_heap) > k:                          # 넣은 뒤 길이가 k 를 넘으면
                heapq.heappop(min_heap)                    # 횟수가 가장 적은 튜플을 꺼낸다
        if trace:                                          # 따라가기를 켰으면
            print(f'{nums}, k = {k}: 횟수 {dict(count)}, 남은 튜플 {min_heap}')   # 센 횟수와 남은 튜플
        return [num for freq, num in min_heap]             # 튜플에서 값만 모은다

# 2단계: 세 예제를 돌린다
for nums, k in (([1, 1, 1, 2, 2, 3], 2), ([1], 1), ([1, 2, 1, 2, 1, 2, 3, 1, 3, 2], 2)):   # LeetCode 의 세 예제
    print(f'답 {Solution().topKFrequent(nums, k, trace=True)}')   # 횟수와 튜플을 찍고 답을 찍는다

# 출력:
# 2단계 뜻: 횟수가 가장 적은 튜플이 나가고 남은 튜플의 값이 답이다.
# [1, 1, 1, 2, 2, 3], k = 2: 횟수 {1: 3, 2: 2, 3: 1}, 남은 튜플 [(2, 2), (3, 1)]
# 답 [2, 1]
# [1], k = 1: 횟수 {1: 1}, 남은 튜플 [(1, 1)]
# 답 [1]
# [1, 2, 1, 2, 1, 2, 3, 1, 3, 2], k = 2: 횟수 {1: 4, 2: 4, 3: 2}, 남은 튜플 [(4, 1), (4, 2)]
# 답 [1, 2]
```

첫 예제의 답 `[2, 1]` 은 LeetCode 화면의 `[1, 2]` 와 순서만 달라 맞는 답입니다. 셋째 예제에서는 1 과 2 의 횟수가 4 로 같아 `(4, 1)` 과 `(4, 2)` 를 둘째 값으로 비교했고 `(2, 3)` 이 맨 앞 값이 되어 나갔습니다. 세는 데 O(N), 서로 다른 값 M개를 길이가 많아야 K + 1 인 힙에 넣고 꺼내는 데 O(M log K) 라서 시간 복잡도는 O(N + M log K) 이고 Counter 가 M개를 담아 공간 복잡도는 O(M) 입니다. 347 은 큰 쪽을 남겼고 9절의 973 은 작은 쪽을 남깁니다.

## 9. K Closest Points to Origin (LeetCode 973, Medium)

**LeetCode 973 은 점 목록에서 원점 (0, 0) 에 가장 가까운 점 K개를 순서와 상관없이 돌려 달라고 합니다. 가장 가까운 K개는 거리가 가장 작은 K개라서 4절의 규칙대로 크기 K 최대 힙을 쓰고 3.9 에는 공개된 최대 힙 함수가 없으므로 거리 제곱의 부호를 뒤집은 값을 튜플의 첫 값으로 넣습니다.**

[LeetCode 973. K Closest Points to Origin](https://leetcode.com/problems/k-closest-points-to-origin/) 은 `points[i] = [x, y]` 꼴의 점 목록 `points` 와 정수 `k` 를 주고 원점에 가장 가까운 점 k개를 돌려 달라고 합니다. 거리는 유클리드 거리이고 답의 순서는 상관없습니다. 첫 예제 `points = [[1, 3], [-2, 2]]`, `k = 1` 은 거리가 √10 과 √8 이라 `[[-2, 2]]` 가 답이고 둘째 예제 `points = [[3, 3], [5, -1], [-2, 4]]`, `k = 2` 는 `[[3, 3], [-2, 4]]` 입니다. k 는 1 이상 점의 개수 이하이고 점은 10,000개 이하, 좌표는 -10,000 부터 10,000 까지입니다.

3.9 에서는 4절처럼 `(-거리, x, y)` 를 최소 힙에 넣으면 버릴 가장 먼 점이 맨 앞에 옵니다. 음이 아닌 수에서 제곱근은 크기 순서를 바꾸지 않아서 거리 √(x² + y²) 대신 제곱 x² + y² 로 비교해도 결과가 같고 제곱근을 구하지 않아 정수로만 계산합니다. 점이 N개일 때 모두 거리로 정렬하면 O(N log N) 이고 크기 K 힙은 O(N log K) 입니다.

1. 점마다 거리 제곱 `x * x + y * y` 를 구합니다.
2. `(-거리 제곱, x, y)` 를 heappush 로 넣습니다.
3. 넣은 뒤 길이가 k 를 넘으면 heappop 으로 가장 먼 점을 꺼냅니다.
4. 남은 튜플에서 `[x, y]` 만 모아 돌려줍니다.

```python
# 하는 일: LeetCode 973 을 거리 제곱의 부호를 뒤집은 크기 K 최대 힙으로 풀어 두 예제에서 거리 제곱, 남은 튜플, 답을 찍고 heapq.nsmallest 와 같은지 본다.
import heapq                                               # 힙 함수와 nsmallest
from typing import List                                    # 함수 주석의 List[List[int]] 에 쓴다

# 1단계: 풀이를 만든다
# 거리 제곱의 부호를 뒤집어 넣으면 맨 앞 튜플이 지금 남은 점 가운데 가장 먼 점이다.
class Solution:                                            # LeetCode 가 정해 둔 클래스 이름 그대로 둔다
    def kClosest(self, points: List[List[int]], k: int, trace: bool = False) -> List[List[int]]:   # trace 는 이 글이 붙인 인자
        max_heap = []                                      # (-거리 제곱, x, y) 튜플의 크기 K 힙
        for x, y in points:                                # 점마다
            heapq.heappush(max_heap, (-(x * x + y * y), x, y))   # 부호를 뒤집은 거리 제곱을 첫 값으로 넣는다
            if len(max_heap) > k:                          # 넣은 뒤 길이가 k 를 넘으면
                heapq.heappop(max_heap)                    # 가장 먼 점을 꺼낸다
        if trace:                                          # 따라가기를 켰으면
            print(f'거리 제곱 {[x * x + y * y for x, y in points]}, 남은 튜플 {max_heap}')   # 점마다의 거리 제곱과 남은 튜플
        return [[x, y] for _, x, y in max_heap]            # 튜플에서 좌표만 모은다

# 2단계: 두 예제를 돌리고 nsmallest 와 비교한다
for points, k in (([[1, 3], [-2, 2]], 1), ([[3, 3], [5, -1], [-2, 4]], 2)):   # LeetCode 의 두 예제
    answer = Solution().kClosest(points, k, trace=True)    # 거리 제곱과 튜플을 찍는다
    nearest = heapq.nsmallest(k, points, key=lambda p: p[0] * p[0] + p[1] * p[1])   # 거리 제곱이 가장 작은 k개
    print(f'답 {answer}, nsmallest 와 같은 점 {sorted(answer) == sorted(nearest)}')   # 순서는 상관없어 정렬해 비교한다

# 출력:
# 2단계 뜻: 가장 먼 점의 튜플이 맨 앞에서 나가고 남은 점이 nsmallest 가 고른 점과 같다.
# 거리 제곱 [10, 8], 남은 튜플 [(-8, -2, 2)]
# 답 [[-2, 2]], nsmallest 와 같은 점 True
# 거리 제곱 [18, 26, 20], 남은 튜플 [(-20, -2, 4), (-18, 3, 3)]
# 답 [[-2, 4], [3, 3]], nsmallest 와 같은 점 True
```

첫 예제는 거리 제곱이 10 과 8 이라 `(-10, 1, 3)` 이 맨 앞에서 나갔습니다. 둘째 예제는 18, 26, 20 이라 가장 먼 `[5, -1]` 이 나갔고 답 `[[-2, 4], [3, 3]]` 은 LeetCode 화면의 `[[3, 3], [-2, 4]]` 와 순서만 다릅니다. 점마다 길이가 많아야 K + 1 인 힙에 넣고 꺼내므로 시간 복잡도는 O(N log K), 공간 복잡도는 O(K) 입니다. 확인에 쓴 nsmallest 는 3.9 의 heapq.py 에서 n 이 1 이면 min 을 쓰고 둘째 예제처럼 n 이 2 이상이고 값의 개수보다 작으면 4절의 `_heapify_max` 와 `_heapreplace_max` 로 크기 n 최대 힙을 만듭니다. 이 글의 코드는 같은 힙을 공개 함수와 부호 뒤집기로 만듭니다.

## 한눈 정리

| 방법 | 힙 | 리스트에 하는 일 | 시간 | 메모리 | 이 글의 예 |
|---|---|---|---|---|---|
| 크기 K 최소 힙 (215) | 최소 힙 | 넣은 뒤 길이가 K 를 넘으면 맨 앞 값을 꺼낸다 | O(N log K) | O(K) | `[3, 2, 1, 5, 6, 4]`, k = 2 → 5 |
| 먼저 비교하는 크기 K 힙, nlargest | 최소 힙 | 맨 앞 값보다 클 때만 heapreplace | O(N log K) | O(K) | 값 100,000개, K = 5 에서 비교 100,135번 |
| 정렬 | 없음 | `sorted(nums, reverse=True)[:k]` | O(N log N) | O(N) | `[10, 5, 20, 1, 15, 30]`, k = 2 → [30, 20] |
| 부호를 뒤집은 heapify (215) | 부호를 뒤집은 최소 힙 | heapify 뒤 K번 꺼낸다 | O(N + K log N) | O(N) | 꺼낸 값 6, 5 → 5 |
| N - K 개를 버리는 heapify (215) | 최소 힙 | nums 를 heapify 하고 N - K 번 꺼낸다 | O(N + (N - K) log N) | nums 밖 O(1) | 버린 값 1, 2, 3, 4 → 5 |
| 횟수 튜플의 크기 K 힙 (347) | 최소 힙 | (횟수, 값) 을 넣고 길이가 K 를 넘으면 꺼낸다 | O(N + M log K) | O(M) | `[1, 1, 1, 2, 2, 3]`, k = 2 → [2, 1] |
| 크기 K 최대 힙 (973) | 부호를 뒤집은 최소 힙 | (-거리 제곱, x, y) 를 넣고 길이가 K 를 넘으면 꺼낸다 | O(N log K) | O(K) | k = 2 → [[-2, 4], [3, 3]] |

표의 O(log K) 와 O(log N) 은 힙에 값 하나를 넣거나 꺼낼 때 비교가 많아야 트리의 층 수에 비례한다는 뜻이고 값 하나를 비교하는 데 O(1) 일 때입니다. 347 의 M 은 서로 다른 값의 개수입니다.

## 헷갈리기 쉬운 점

- **최소 힙은 정렬된 리스트가 아닙니다.** 40, 10, 30, 5 를 넣은 `[5, 10, 30, 40]` 은 우연히 정렬돼 있었지만 5 를 꺼낸 `[10, 40, 30]` 과 heapify 한 `[1, 2, 5, 9, 7]` 은 정렬돼 있지 않습니다. 늘 지키는 조건은 부모 칸이 자식 칸보다 크지 않다는 것 하나이고 그래서 맨 앞 값이 가장 작습니다.
- **상위 K개는 최소 힙, 하위 K개는 최대 힙입니다.** heappop 이 꺼내는 값은 맨 앞 값 하나라서 버릴 쪽 끝의 값이 맨 앞에 와야 합니다. 같은 `[4, 1, 7, 3, 8, 5]` 에서 크기 2 최소 힙은 7 과 8 을, 크기 2 최대 힙은 1 과 3 을 남겼습니다.
- **크기 K 힙은 K 가 작을 때만 정렬보다 적게 비교합니다.** 값 100,000개에서 넣고 꺼내는 크기 K 힙은 K = 5 이면 sorted 보다 적게, K = 1,000 이면 많이 비교했습니다. 맨 앞 값과 먼저 비교하는 방법과 nlargest 는 두 K 에서 모두 가장 적었습니다.
- **heapify 를 써도 부호가 꼭 필요하지는 않습니다.** nums 를 그대로 heapify 하고 작은 값 N - K 개를 버리면 남은 맨 앞 값이 K번째로 큰 수입니다.
- **최대 힙 함수는 Python 3.14 에서 생겼습니다.** heapify_max, heappush_max 같은 다섯 함수는 3.9 채점 환경에서 쓸 수 없고 3.9 의 `_heapify_max` 는 밑줄이 붙은 내부 함수라 쓰지 않습니다.
- **heapify 는 잎부터가 아니라 자식이 있는 마지막 칸부터 돕니다.** n//2 - 1 번 칸부터 0번 칸까지 거꾸로 가며 값을 내려 보내고 공식 문서가 적는 대로 O(N) 입니다.

## 더 깊이 보기

- 힙이 트리이면서 배열이라는 설명과 실전 heapq(최대 힙, 튜플, 상위 K)는 [트리와 힙](post.html?id=algorithm-tree-heap) 편 7~9절에 있습니다.
- 지문 낱말로 힙을 고르는 표와 heapq 함수의 비용 표는 [코딩테스트 핵심 도구](post.html?id=algorithm-coding-test-toolkit) 편 맨 앞 절과 4절에 있습니다.
- 정렬된 리스트에서 넣을 자리를 찾는 bisect 는 [이진 탐색](post.html?id=algorithm-lesson-binary-search) 편 5절에 있습니다.
- 이진 탐색, BST, 힙의 규칙과 값 찾기, 넣기 비용을 한 표로 비교한 것은 [트리와 BST](post.html?id=algorithm-lesson-tree-bst) 편 10절에 있습니다.
- heappush 가 넣은 값을 부모 칸과 바꾸며 올리는 순서와 heappop 이 꺼낸 자리를 마지막 값으로 채우는 두 방식은 [힙의 내부](post.html?id=algorithm-lesson-heap-internals) 편 4~6절에 있습니다.
- 이 글의 데모는 [힙과 Top K: 크기 K 힙과 heapify 두 풀이](demo-lesson-heap-top-k.html) 한 페이지에서 탭과 입력을 바꿔 가며 볼 수 있고 값 12개를 heapify 하는 입력도 있습니다.
- 예시 문제는 [Kth Largest Element in an Array](https://leetcode.com/problems/kth-largest-element-in-an-array/)(215), [Top K Frequent Elements](https://leetcode.com/problems/top-k-frequent-elements/)(347), [K Closest Points to Origin](https://leetcode.com/problems/k-closest-points-to-origin/)(973) 이고 값이 하나씩 들어오는 경우는 [Kth Largest Element in a Stream](https://leetcode.com/problems/kth-largest-element-in-a-stream/)(703) 입니다.
- heapq 의 정의와 3.14 의 최대 힙 함수는 [공식 문서](https://docs.python.org/3/library/heapq.html)에, CPython 3.9 의 heapify, nlargest, `_heapify_max` 는 [heapq.py](https://github.com/python/cpython/blob/3.9/Lib/heapq.py) 에 있습니다.
