지훈 씨는 투 포인터(정렬된 배열의 양 끝에 둔 인덱스 두 개를 좁혀 오며 답을 찾는 방법)를 배운 과외를 마치며 다음 진도를 정했습니다. 「그럼 그다음 이진 탐색, 그다음은 트리에 대해서 해 봐요.」

이진 탐색(binary search, 이분 탐색이라고도 부릅니다)은 정렬된 배열의 가운데 값과 찾는 값(target)을 비교해 target 이 있을 수 없는 절반을 버리는 방법입니다. 투 포인터에 이어 정렬된 배열에서 쓰는 두 번째 도구입니다. [트리 글](post.html?id=algorithm-lesson-tree-bst)에서 다룰 이진 탐색 트리(BST)도 같은 비교로 한쪽을 버립니다.

**가운데 값 하나만 보고 절반을 버려도 답을 놓치지 않으려면 무엇이 필요할까요?**

배열이 정렬돼 있어야 합니다. 이 글은 아직 버리지 않은 칸들을 남은 범위, 버린 쪽을 버린 칸이라고 부릅니다. 반복마다 남은 범위가 절반 이하로 줄어 값 100만 개에서도 반복은 많아야 20번이지만 부등호 하나를 잘못 쓰면 마지막 한 칸을 보지 않거나 같은 남은 범위를 끝없이 되풀이해서 코드가 짧아도 틀리기 쉽습니다.

> **한 줄 요약:** 이진 탐색은 정렬된 배열에서 남은 범위의 가운데 값을 target 과 비교해 target 이 있을 수 없는 쪽을 버리므로, 반복은 많아야 floor(log2 N) + 1 번이라 값 100만 개에서 20번이고 값 하나를 비교하는 데 O(1) 이면 시간은 O(log N) 입니다. 남은 범위를 양 끝을 포함하는 닫힌 구간 [left, right] 로 두면 `while left <= right` 로 마지막 한 칸까지 보고 이미 비교한 가운데 칸 mid 를 빼서 `left = mid + 1` 이나 `right = mid - 1` 로 옮깁니다. 같은 값이 여럿이면 bisect_left 와 bisect_right 가 돌려주는 넣을 자리의 차가 그 값의 개수입니다. 배열이 없어도 Koko Eating Bananas 처럼 속도가 오를수록 걸리는 시간이 늘지 않는 문제는 답의 범위를 같은 방식으로 좁힙니다.

---

## 1. 가운데 값과 버리는 절반

**정렬된 배열에서 가운데 값이 target 보다 작으면 가운데 칸과 그 왼쪽 칸은 모두 target 보다 작아 답이 될 수 없으므로 한 번에 버립니다. 반복할 때마다 남은 범위가 절반 이하로 줄어 값이 N개면 많아야 floor(log2 N) + 1 번 반복하고 정렬하지 않은 배열에는 이 근거가 없어 있는 값도 버립니다.**

[투 포인터](post.html?id=algorithm-lesson-two-pointers) 편에서 지훈 씨가 정렬된 배열에서 쓰는 방법과 아닌 방법을 바로 알아볼 수 있게 보여 달라고 했을 때, 저는 투 포인터와 함께 정렬된 배열 `[2, 5, 8, 12, 16, 23, 38, 56]` 에서 23 을 찾는 이진 탐색을 보였습니다. 처음에는 배열 전체가 남은 범위이고 가운데 칸은 3번 칸의 12 입니다. 이 글은 남은 범위의 가운데 인덱스를 코드 그대로 mid 라고 부릅니다. 12 가 23 보다 작고 배열이 작은 값부터 정렬돼 있으므로 12 와 그 왼쪽 칸의 값은 모두 23 보다 작아 답이 될 수 없습니다. 그래서 그 네 칸을 버리고 오른쪽 네 칸만 남깁니다.

당연해 보이는 다른 방법으로 정렬하지 않은 배열에도 같은 규칙을 써 봅니다. 같은 8개 값을 섞은 `[23, 5, 56, 12, 2, 38, 8, 16]` 에서도 가운데 칸은 3번 칸의 12 인데, 과외에서 말한 대로 가운데 값이 12 라는 것만으로는 23 이 왼쪽에 있을지 오른쪽에 있을지 알 수 없습니다. 실제로 23 은 0번 칸에 있어서 왼쪽 네 칸을 버리면 답도 함께 버립니다.

아래 코드는 반복마다 남은 범위와 mid 를 찍는 이진 탐색을 두 배열에 돌립니다. 정렬된 배열에서는 앞에서부터 하나씩 비교해 찾을 때의 비교 수도 함께 찍습니다.

```python
# 하는 일: 정렬된 배열 8칸에서 23 을 이진 탐색으로 찾으며 반복마다 남은 범위와 mid 를 찍고, 같은 값을 섞은 배열에도 같은 코드를 돌려 본다.

# 1단계: 반복마다 상태를 찍는 이진 탐색을 만든다
# 남은 범위는 양 끝을 포함하는 [left, right] 다. 가운데 값과 target 을 비교해 한쪽을 버린다.
def binary_search(nums, target):                           # 찾으면 인덱스, 없으면 -1 을 돌려준다
    left, right = 0, len(nums) - 1                         # 처음 남은 범위는 배열 전체
    rounds = 0                                             # 반복 횟수
    while left <= right:                                   # 남은 범위에 칸이 하나라도 있는 동안
        mid = left + (right - left) // 2                   # 남은 범위의 가운데 인덱스
        rounds += 1                                        # 반복 1번
        print(f'반복 {rounds}: 남은 범위 {left}~{right}, mid {mid}, nums[{mid}] = {nums[mid]}')   # 이번 반복의 상태
        if nums[mid] == target:                            # 가운데 값이 target 이면
            return mid                                     # 그 인덱스가 답이다
        if nums[mid] < target:                             # 가운데 값이 target 보다 작으면
            left = mid + 1                                 # mid 와 그 왼쪽 칸을 버린다
        else:                                              # 가운데 값이 target 보다 크면
            right = mid - 1                                # mid 와 그 오른쪽 칸을 버린다
    return -1                                              # 남은 범위가 비어 못 찾았다

# 2단계: 정렬된 배열에서 23 을 찾는다
sorted_nums = [2, 5, 8, 12, 16, 23, 38, 56]                # 과외에서 쓴 정렬된 배열
print(f'정렬된 배열 {sorted_nums}')                          # 입력
answer = binary_search(sorted_nums, 23)                    # 반복마다 상태를 찍으며 찾는다
print(f'답 {answer}, 앞에서부터 찾으면 비교 {sorted_nums.index(23) + 1}번')   # 23 은 6번째 값이다

# 3단계: 같은 값을 섞은 배열에서 23 을 찾는다
shuffled = [23, 5, 56, 12, 2, 38, 8, 16]                   # 같은 8개 값을 섞었다
print(f'섞은 배열 {shuffled}')                               # 입력
answer = binary_search(shuffled, 23)                       # 같은 코드를 그대로 돌린다
print(f'답 {answer}, 23 은 실제로 {shuffled.index(23)}번 칸에 있다')   # 있는 값을 못 찾았다

# 출력:
# 2단계 뜻: 정렬된 배열에서는 mid 3 의 12 를 보고 왼쪽을 버린 뒤 mid 5 에서 23 을 찾는다.
# 정렬된 배열 [2, 5, 8, 12, 16, 23, 38, 56]
# 반복 1: 남은 범위 0~7, mid 3, nums[3] = 12
# 반복 2: 남은 범위 4~7, mid 5, nums[5] = 23
# 답 5, 앞에서부터 찾으면 비교 6번
# 3단계 뜻: 섞은 배열에서는 첫 반복에 23 이 있는 0번 칸을 버려 -1 을 돌려준다.
# 섞은 배열 [23, 5, 56, 12, 2, 38, 8, 16]
# 반복 1: 남은 범위 0~7, mid 3, nums[3] = 12
# 반복 2: 남은 범위 4~7, mid 5, nums[5] = 38
# 반복 3: 남은 범위 4~4, mid 4, nums[4] = 2
# 답 -1, 23 은 실제로 0번 칸에 있다
```

정렬된 배열에서는 반복 2번에 23 을 찾았고 앞에서부터 찾으면 23 과 그 앞의 값을 모두 비교해 6번입니다. 섞은 배열에서는 첫 반복에 12 를 보고 23 이 있는 0번 칸까지 버린 뒤 오른쪽 칸들만 보다가 -1 을 돌려줬습니다. 버린 칸에 답이 없다고 믿는 근거는 정렬 하나뿐이어서 정렬되지 않은 배열에서 이진 탐색은 오류 없이 돌고 틀린 답을 냅니다.

23 을 2번 만에 찾은 예만 보면 이진 탐색이 늘 일찍 끝나는 것처럼 보이지만 반복이 가장 많은 경우를 따로 봐야 합니다. 남은 범위가 n칸이면 mid 왼쪽에 (n - 1) // 2 칸, 오른쪽에 n // 2 칸이 남아서 가장 큰 값보다 큰 값을 찾아 매번 오른쪽으로 가면 남은 칸이 가장 천천히 줄어듭니다. 그래도 한 번 반복할 때마다 남은 칸은 많아야 절반(소수점 아래 버림)이 되므로 N칸에서 시작해 k번 반복하면 많아야 N / 2^k 칸이 남고 남은 칸이 1칸 이상인 동안만 반복하므로 반복은 많아야 floor(log2 N) + 1 번입니다.

과외에서 저는 log2 10^6 이 약 20 이라며 데이터가 100만 개여도 단 20번 만에 찾는다고 했는데, 20번은 늘 걸리는 횟수가 아니라 상한입니다. 반복 수는 남은 범위가 반복마다 절반 이하로 줄어드는 것만으로 정해져서 배열이 정렬돼 있는지와 값의 종류에 상관없이 많아야 floor(log2 N) + 1 번이고, 그렇게 찾은 답이 맞으려면 배열이 정렬돼 있어야 합니다. 시간이 O(log N) 이 되려면 값 하나를 비교하는 데 O(1) 이어야 하고, 긴 문자열처럼 비교 한 번에 글자 수만큼 드는 값이면 반복 수에 비교 비용을 곱합니다. 아래 코드는 0 부터 N - 1 까지 정렬된 `range` 에서 가장 큰 값보다 큰 N 을 찾아 반복 횟수를 세고 식과 비교합니다.

```python
# 하는 일: 0 부터 N - 1 까지 정렬된 range 에서 가장 큰 값보다 큰 N 을 이진 탐색으로 찾아 반복 횟수를 세고 floor(log2 N) + 1 과 비교한다.
import math                                                # floor 와 log2 를 쓴다

# 1단계: 반복 횟수만 세는 이진 탐색을 만든다
def count_rounds(nums, target):                            # 반복 횟수를 돌려준다
    left, right = 0, len(nums) - 1                         # 처음 남은 범위는 배열 전체
    rounds = 0                                             # 반복 횟수
    while left <= right:                                   # 남은 범위에 칸이 하나라도 있는 동안
        mid = left + (right - left) // 2                   # 남은 범위의 가운데 인덱스
        rounds += 1                                        # 반복 1번
        if nums[mid] == target:                            # 찾으면
            return rounds                                  # 여기까지의 반복 횟수
        if nums[mid] < target:                             # 가운데 값이 작으면
            left = mid + 1                                 # 오른쪽만 남긴다
        else:                                              # 가운데 값이 크면
            right = mid - 1                                # 왼쪽만 남긴다
    return rounds                                          # 못 찾았을 때의 반복 횟수

# 2단계: 값 8개, 100만 개, 10억 개에서 센다
# range 는 값을 메모리에 만들어 두지 않고 인덱스로 값을 계산해 돌려줘서 10억 개짜리도 바로 쓴다.
for n in (8, 1_000_000, 1_000_000_000):                    # 1절의 8칸과 과외에서 말한 두 크기
    rounds = count_rounds(range(n), n)                     # 가장 큰 값 n - 1 보다 큰 n 을 찾는다
    bound = math.floor(math.log2(n)) + 1                   # 식으로 구한 상한
    print(f'N = {n:,}: 반복 {rounds}번, floor(log2 N) + 1 = {bound}, 2^{bound - 1} = {2 ** (bound - 1):,} ≤ N < 2^{bound} = {2 ** bound:,}')   # 센 값, 식, N 이 놓인 2의 거듭제곱 사이

# 출력:
# 2단계 뜻: 세 크기 모두 센 반복 횟수가 floor(log2 N) + 1 과 같다.
# N = 8: 반복 4번, floor(log2 N) + 1 = 4, 2^3 = 8 ≤ N < 2^4 = 16
# N = 1,000,000: 반복 20번, floor(log2 N) + 1 = 20, 2^19 = 524,288 ≤ N < 2^20 = 1,048,576
# N = 1,000,000,000: 반복 30번, floor(log2 N) + 1 = 30, 2^29 = 536,870,912 ≤ N < 2^30 = 1,073,741,824
```

세 크기 모두 센 반복 횟수가 식과 같았습니다. 100만은 2의 19제곱 이상이고 20제곱보다 작아서 floor(log2 N) 이 19 이고 반복이 20번입니다. 같은 값을 앞에서부터 찾으면 가장 큰 값보다 큰 값이라 모든 칸과 비교하므로 100만 번과 10억 번이 듭니다. 정렬된 배열에서 값을 찾는 문제가 LeetCode 에 어떤 모양으로 나오는지 2절에서 봅니다.

## 2. Binary Search (LeetCode 704, Easy)

**LeetCode 704 는 오름차순으로 정렬된 서로 다른 정수 배열에서 target 의 인덱스를 돌려주고 없으면 -1 을 돌려 달라고 합니다. 남은 범위를 닫힌 구간 [left, right] 로 두고 left <= right 인 동안 가운데 값이 target 보다 작으면 `left = mid + 1`, 크면 `right = mid - 1` 로 mid 를 포함한 쪽을 버립니다.**

[LeetCode 704. Binary Search](https://leetcode.com/problems/binary-search/) 는 오름차순으로 정렬된 정수 배열 `nums` 와 정수 `target` 을 주고 target 이 있으면 그 인덱스를, 없으면 -1 을 돌려 달라고 하며 O(log n) 시간에 도는 풀이를 요구합니다. nums 의 길이는 1 부터 10,000 까지이고 값은 모두 다릅니다. 첫 예제 `nums = [-1, 0, 3, 5, 9, 12]`, `target = 9` 는 9 가 4번 칸에 있어 4 가 답이고 둘째 예제는 같은 nums 에서 `target = 2` 라 -1 이 답입니다. 과외에서 다룬 중심 문제입니다.

과외에서 저는 이 탐색을 1부터 100 사이의 수를 맞힐 때 50 을 먼저 부르고 「다운」을 들으면 50부터 100까지를 한 번에 지우는 업다운 게임에 빗댔습니다. 첫 예제에서는 가운데 값 nums[2] = 3 이 9 보다 작아 3 과 그 왼쪽 칸을 한 번에 버리고 남은 오른쪽 칸들의 가운데 값 nums[4] = 9 에서 찾습니다.

배열이 정렬돼 있고 O(log n) 을 요구하므로 1절의 이진 탐색을 그대로 씁니다. 값이 모두 달라서 target 과 같은 칸은 많아야 하나라 찾는 즉시 돌려줍니다. mid 를 `(left + right) // 2` 대신 `left + (right - left) // 2` 로 구하는 까닭은 4절에서 봅니다.

1. left 를 0, right 를 `len(nums) - 1` 로 두어 배열 전체를 남은 범위로 삼습니다.
2. left <= right 인 동안 `mid = left + (right - left) // 2` 를 구합니다.
3. `nums[mid]` 가 target 이면 mid 를 돌려줍니다.
4. `nums[mid]` 가 target 보다 작으면 `left = mid + 1`, 크면 `right = mid - 1` 로 옮깁니다.
5. 반복이 끝나면 -1 을 돌려줍니다.

두 예제를 한 반복씩 따라가면 이렇습니다. 판정 칸은 nums[mid] 와 target 을 비교한 결과와 그 뒤에 바뀐 값이고 버린 칸은 그 반복에서 남은 범위에서 빠진 인덱스입니다.

| target | 반복 | left | right | mid | nums[mid] | 판정 | 버린 칸 |
|---|---|---|---|---|---|---|---|
| 9 | 1 | 0 | 5 | 2 | 3 | 3 < 9, left = 3 | 0~2 |
| 9 | 2 | 3 | 5 | 4 | 9 | 같음, 답 4 | 없음 |
| 2 | 1 | 0 | 5 | 2 | 3 | 3 > 2, right = 1 | 2~5 |
| 2 | 2 | 0 | 1 | 0 | -1 | -1 < 2, left = 1 | 0 |
| 2 | 3 | 1 | 1 | 1 | 0 | 0 < 2, left = 2 | 1 |
| 2 | 끝 | 2 | 1 | | | left > right, 답 -1 | 남은 칸 없음 |

target 2 는 셋째 반복에서 left 와 right 가 모두 1 이라 남은 범위가 1번 칸 하나였고 그 칸의 0 이 2 보다 작아 left 가 2 로 옮겨 가자 left 가 right 보다 커져 반복이 끝났습니다. 과외의 코드는 함수 하나였는데 LeetCode 화면은 `class Solution` 의 메서드라서 아래 코드는 화면의 메서드 이름 `search` 와 인자 순서 `nums`, `target` 을 그대로 쓰고 타입 주석은 `from typing import List` 의 `List[int]` 로 적습니다.

```python
# 하는 일: LeetCode 704 를 닫힌 구간 이진 탐색으로 풀어 target 9 와 2 에서 반복마다 left, right, mid 를 찍는다.
from typing import List                                    # LeetCode 화면의 List[int] 주석에 쓴다

# 1단계: 풀이를 만든다
# 남은 범위는 닫힌 구간 [left, right] 다. mid 는 이미 본 칸이라 옮길 때 남은 범위에서 뺀다.
class Solution:                                            # LeetCode 가 정해 둔 클래스 이름 그대로 둔다
    def search(self, nums: List[int], target: int, trace: bool = False) -> int:   # trace 는 이 글이 붙인 인자
        left, right = 0, len(nums) - 1                     # 남은 범위를 배열 전체로 둔다
        while left <= right:                               # 남은 범위에 칸이 하나라도 있는 동안
            mid = left + (right - left) // 2               # 남은 범위의 가운데 인덱스
            if trace:                                      # 따라가기를 켰으면
                print(f'left {left}, right {right}, mid {mid}, nums[{mid}] = {nums[mid]}')   # 이번 반복의 상태
            if nums[mid] == target:                        # 가운데 값이 target 이면
                return mid                                 # 그 인덱스가 답이다
            elif nums[mid] < target:                       # 가운데 값이 작으면 target 은 오른쪽에만 있을 수 있다
                left = mid + 1                             # mid 와 그 왼쪽 칸을 버린다
            else:                                          # 가운데 값이 크면 target 은 왼쪽에만 있을 수 있다
                right = mid - 1                            # mid 와 그 오른쪽 칸을 버린다
        if trace:                                          # 따라가기를 켰으면
            print(f'left {left} > right {right}: 남은 범위가 비었다')   # 반복이 끝난 자리
        return -1                                          # 끝까지 못 찾았다

# 2단계: 첫 예제를 따라간다
nums = [-1, 0, 3, 5, 9, 12]                                # LeetCode 704 의 예제 배열
print(f'target 9 → {Solution().search(nums, 9, trace=True)}')   # 반복마다 상태를 찍고 답을 찍는다

# 3단계: 둘째 예제를 따라간다
print(f'target 2 → {Solution().search(nums, 2, trace=True)}')   # 없는 값이다

# 출력:
# 2단계 뜻: mid 2 의 3 을 보고 0~2번 칸을 버린 뒤 mid 4 에서 9 를 찾는다.
# left 0, right 5, mid 2, nums[2] = 3
# left 3, right 5, mid 4, nums[4] = 9
# target 9 → 4
# 3단계 뜻: mid 2, 0, 1 을 본 뒤 left 가 right 보다 커져 -1 을 돌려준다.
# left 0, right 5, mid 2, nums[2] = 3
# left 0, right 1, mid 0, nums[0] = -1
# left 1, right 1, mid 1, nums[1] = 0
# left 2 > right 1: 남은 범위가 비었다
# target 2 → -1
```

찍힌 left, right, mid 는 위 표와 같습니다. 반복 한 번에 남은 범위가 절반 이하로 줄어 반복은 많아야 floor(log2 N) + 1 번이므로 시간 복잡도는 O(log N) 이고 left, right, mid 세 변수만 쓰므로 공간 복잡도는 O(1) 입니다. `trace` 는 단계를 찍으려고 이 글이 붙인 인자라 LeetCode 에 낼 때는 지워도 됩니다.

아래 데모는 첫 예제를 한 단계씩 보여 줍니다. 「한 칸」을 처음 누르면 이번 단계 칸에 「left 0, right 5, mid 2. nums[2] = 3이 9보다 작습니다. 정렬되어 있어 0~2번 칸은 모두 9보다 작으니 답이 될 수 없습니다.」가 나옵니다. 한 번 더 누르면 「0~2번 칸을 버리고 left 를 3으로 옮깁니다. 남은 범위는 3~5번 칸입니다.」로 바뀌고 0~2번 칸이 범례의 「버린 칸」 모양인 점선 회색이 됩니다. 세 번째로 누르면 단계 3 / 3 에서 결과 칸에 「인덱스 4」와 「반복 2번. 앞에서부터 찾으면 비교 5번. 정렬된 배열이면 값이 100만 개여도 반복은 많아야 20번입니다.」가 나오고 4번 칸이 「답」 색으로 칠해집니다. 「다음 반복」은 mid 를 보고 칸을 버리는 두 단계를 한 번에 넘겨서 「처음」 뒤 한 번 누르면 단계 2 / 3 입니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-lesson-binary-search.html?embed=1&mode=search&preset=leetcode-704" height="820" loading="lazy" title="LeetCode 704 닫힌 구간 탐색 미니 데모"></iframe>
<a class="demo-embed-open" href="demo-lesson-binary-search.html?mode=search&preset=leetcode-704" target="_blank" rel="noopener">↗ 전체 데모로 열기</a>
</div>

이 풀이의 while 조건과 left, right 를 옮기는 식은 한 글자만 바꿔도 결과가 달라져서 과외에서 제가 자주 틀리는 자리로 든 셋 가운데 두 곳입니다.

## 3. 닫힌 구간과 `<=`

**닫힌 구간 [left, right] 는 양 끝 칸을 모두 남은 범위에 넣으므로 left = right 일 때도 칸이 하나 남아 있고 `while left <= right` 가 그 칸까지 봅니다. 같은 코드에서 부등호만 `<` 로 바꾸면 남은 칸이 하나일 때 비교하지 않고 끝나 `[-1, 0, 3, 5, 9, 12]` 의 12 와 `[5]` 의 5 를 못 찾습니다. 오른쪽 끝을 남은 범위에서 빼는 반열린 구간 [lo, hi) 에서는 lo = hi 이면 남은 칸이 없어 `<` 가 맞습니다.**

과외에서 저는 이진 탐색에서 자주 틀리는 자리로 while 의 부등호, left 와 right 를 옮길 때의 ± 1, mid 를 구하는 식을 들었습니다. 그때 초보자 대부분이 틀린다며 비율을 붙였는데 출처가 없는 숫자라 이 글에서는 지웁니다. 첫 자리에서 저는 `<` 를 쓰면 원소가 하나 남았을 때 그 원소를 검사하지 않고 빠져나온다고 했습니다. 남은 범위를 닫힌 구간으로 두고 mid ± 1 로 옮기는 2절의 코드에서는 맞는 설명입니다.

닫힌 구간(closed interval) [left, right] 는 left 번 칸과 right 번 칸을 모두 남은 범위에 넣고 반열린 구간(half-open interval) [lo, hi) 는 lo 번 칸은 넣고 hi 번 칸은 넣지 않습니다. 닫힌 구간의 칸 수는 right - left + 1 이라서 left = right 이면 1칸이고 left 가 right 보다 커져야 0칸입니다. 그래서 칸이 1칸 이상 남은 동안 반복하는 조건이 `left <= right` 입니다.

아래 코드는 2절의 풀이에서 while 의 부등호만 다른 두 함수를 만들어 같은 nums 의 target 12 와 한 칸 배열 `[5]` 에 돌리고 본 mid 와 끝날 때의 left, right 를 찍습니다. 마지막 단계에서는 nums 의 값 6개를 모두 `<` 로 찾아 어느 값을 놓치는지 봅니다.

```python
# 하는 일: 닫힌 구간 이진 탐색에서 while 의 부등호만 <= 와 < 로 바꿔 target 12 와 한 칸 배열 [5] 에서 결과를 비교하고, < 가 nums 의 어느 값을 놓치는지 본다.

# 1단계: 부등호만 다른 탐색을 만든다
# op 가 '<=' 면 left <= right, '<' 면 left < right 동안 돈다. 나머지는 2절의 풀이와 같다.
def search(nums, target, op):                              # 답, 본 mid, 끝날 때의 left, right 를 돌려준다
    left, right = 0, len(nums) - 1                         # 남은 범위를 배열 전체로 둔다
    mids = []                                              # 본 mid 를 차례로 적는다
    while (left <= right) if op == '<=' else (left < right):   # 부등호만 다르다
        mid = left + (right - left) // 2                   # 남은 범위의 가운데 인덱스
        mids.append(mid)                                   # 본 mid 를 적는다
        if nums[mid] == target:                            # 가운데 값이 target 이면
            return mid, mids, left, right                  # 찾았다
        if nums[mid] < target:                             # 가운데 값이 작으면
            left = mid + 1                                 # mid 와 그 왼쪽을 버린다
        else:                                              # 가운데 값이 크면
            right = mid - 1                                # mid 와 그 오른쪽을 버린다
    return -1, mids, left, right                           # 못 찾고 끝났다

# 2단계: 두 입력에 두 부등호를 돌린다
for nums, target in (([-1, 0, 3, 5, 9, 12], 12), ([5], 5)):   # 마지막 칸에 있는 값과 한 칸 배열
    for op in ('<=', '<'):                                 # 두 부등호를 차례로
        answer, mids, left, right = search(nums, target, op)   # 결과를 받는다
        print(f'{nums}, target {target}, {op}: 답 {answer}, 본 mid {mids}, 끝날 때 left {left}, right {right}')   # 나란히 찍는다

# 3단계: nums 의 값 6개를 모두 < 로 찾아 본다
nums = [-1, 0, 3, 5, 9, 12]                                # 2절의 배열
found = [t for t in nums if search(nums, t, '<')[0] != -1]      # < 로 찾은 값
missed = [t for t in nums if search(nums, t, '<')[0] == -1]     # < 로 못 찾은 값
print(f'< 로 찾은 값 {found}, 못 찾은 값 {missed}')            # 둘로 나눠 찍는다

# 출력:
# 2단계 뜻: <= 는 left = right 인 마지막 한 칸까지 보고, < 는 그 칸을 보지 않아 -1 을 돌려준다.
# [-1, 0, 3, 5, 9, 12], target 12, <=: 답 5, 본 mid [2, 4, 5], 끝날 때 left 5, right 5
# [-1, 0, 3, 5, 9, 12], target 12, <: 답 -1, 본 mid [2, 4], 끝날 때 left 5, right 5
# [5], target 5, <=: 답 0, 본 mid [0], 끝날 때 left 0, right 0
# [5], target 5, <: 답 -1, 본 mid [], 끝날 때 left 0, right 0
# 3단계 뜻: < 는 남은 범위가 한 칸이 되기 전에 mid 로 만나는 값만 찾는다.
# < 로 찾은 값 [-1, 3, 9], 못 찾은 값 [0, 5, 12]
```

`<=` 는 left 와 right 가 모두 5 인 마지막 반복에서 12 를 찾았고 `<` 는 같은 자리에서 5 < 5 가 거짓이라 그 칸을 보지 않고 -1 을 돌려줬습니다. `[5]` 에서는 처음부터 남은 칸이 하나라 `<` 가 한 번도 반복하지 않았습니다. 3단계에서 `<` 가 찾은 값은 남은 범위가 한 칸이 되기 전에 mid 로 만난 값뿐이었고 예제의 9 도 그런 값이라 9 하나만 돌려 보면 `<` 도 맞는 코드처럼 보입니다.

반열린 구간에서는 사정이 다릅니다. [lo, hi) 의 칸 수는 hi - lo 라서 lo = hi 이면 남은 칸이 없고 `while lo < hi` 가 칸이 1칸 이상 남은 동안이라는 같은 조건입니다. 5절의 bisect 가 이 꼴이고 CPython 3.9 의 bisect.py 도 `while lo < hi` 로 돕니다. 부등호는 구간을 잡은 방식에 맞춰 고르므로 `<` 도 반열린 구간에서는 맞는 코드입니다.

아래 데모는 같은 nums 에서 target 12 를 찾습니다. 「한 칸」을 네 번 누르면 이번 단계 칸에 「3~4번 칸을 버리고 left 를 5로 옮깁니다. 남은 범위는 5번 칸입니다.」가 나오고 상태 칸이 left 5, right 5 를 보입니다. 한 번 더 누르면 단계 5 / 5 에서 「left 5, right 5, mid 5. nums[5] = 12가 12와 같아 찾았습니다. 답은 인덱스 5입니다. 배열에는 답인 5번 칸을 표시했습니다.」가 나오고 결과 칸에 「인덱스 5」와 「반복 3번. 앞에서부터 찾으면 비교 6번. 정렬된 배열이면 값이 100만 개여도 반복은 많아야 20번입니다.」가 나옵니다. left 와 right 가 같은 칸을 가리킨 뒤의 반복에서 답이 나오므로, 그 반복을 건너뛰는 `<` 로는 12 를 찾지 못합니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-lesson-binary-search.html?embed=1&mode=search&preset=last-one" height="820" loading="lazy" title="마지막 한 칸까지 보는 닫힌 구간 탐색 미니 데모"></iframe>
<a class="demo-embed-open" href="demo-lesson-binary-search.html?mode=search&preset=last-one" target="_blank" rel="noopener">↗ 전체 데모로 열기</a>
</div>

부등호가 마지막 한 칸을 볼지 정한다면, left 와 right 를 옮기는 식은 같은 칸을 다시 볼지 정합니다.

## 4. `mid ± 1` 갱신과 mid 계산식

**mid 는 방금 target 과 비교해 답이 아니라고 확인한 칸이라 `left = mid + 1`, `right = mid - 1` 로 남은 범위에서 뺍니다. `right = mid` 로 두면 남은 칸이 하나이고 그 값이 target 보다 클 때 left 와 right 가 그대로라 같은 남은 범위를 끝없이 되풀이합니다. int 가 32비트인 언어에서는 left + right 가 2,147,483,647 을 넘으면 Java 는 음수가 되고 C++ 는 정의되지 않은 동작이라 mid 를 `left + (right - left) // 2` 로 구합니다. 정수 크기에 한계가 없는 파이썬에서는 두 식의 값이 같습니다.**

과외에서 든 둘째 자리는 mid ± 1 이었습니다. mid 의 값은 이미 target 과 비교했고 같지 않다고 확인했으니 다음 남은 범위에서 mid 를 빼야 무한 루프를 막는다고 했는데 맞는 설명입니다. 다만 무한 루프가 언제 생기는지는 값으로 따라가야 보입니다.

2절의 nums 에서 target 2 를 찾으며 `right = mid - 1` 만 `right = mid` 로 바꾸고 한 반복씩 따라가면 이렇습니다.

| 반복 | 남은 범위 | mid | nums[mid] | 판정 | 옮긴 뒤 |
|---|---|---|---|---|---|
| 1 | 0~5 | 2 | 3 | 3 > 2 | right = 2 |
| 2 | 0~2 | 1 | 0 | 0 < 2 | left = 2 |
| 3 | 2~2 | 2 | 3 | 3 > 2 | right = 2, 그대로 |
| 4 | 2~2 | 2 | 3 | 3 > 2 | right = 2, 그대로 |

셋째 반복에서 남은 칸이 하나가 되자 mid 가 그 칸을 가리키고 그 값이 target 보다 커서 `right = mid` 가 right 를 그대로 둡니다. 넷째 반복부터는 같은 남은 범위에서 같은 mid 를 보고 같은 판정을 하므로 반복이 끝나지 않습니다. 아래 코드는 같은 (left, right) 가 다시 나오면 되풀이로 보고 멈추는 장치를 두고 `mid - 1` 과 `mid` 를 같은 target 들에 돌립니다.

```python
# 하는 일: 704 의 풀이에서 right = mid - 1 과 right = mid 를 target 2 와 -5 에 돌려 right = mid 일 때 같은 남은 범위가 되풀이되는 것을 찾고, 배열에 있는 값과 없는 값 가운데 어느 쪽에서 되풀이되는지 본다.

# 1단계: right 를 옮기는 식만 다른 탐색을 만든다
# shrink 가 1 이면 right = mid - 1, 0 이면 right = mid 다. 같은 (left, right) 가 다시 나오면 그 뒤로도 똑같이 돌므로 거기서 멈춘다.
def search(nums, target, shrink):                          # 결과, 본 mid, 끝날 때의 left, right 를 돌려준다
    left, right = 0, len(nums) - 1                         # 남은 범위를 배열 전체로 둔다
    seen = set()                                           # 옮긴 뒤의 (left, right) 를 적는다
    mids = []                                              # 본 mid 를 차례로 적는다
    while left <= right:                                   # 닫힌 구간의 반복 조건
        mid = left + (right - left) // 2                   # 남은 범위의 가운데 인덱스
        mids.append(mid)                                   # 본 mid 를 적는다
        if nums[mid] == target:                            # 찾으면
            return mid, mids, left, right                  # 답을 돌려준다
        if nums[mid] < target:                             # 가운데 값이 작으면
            left = mid + 1                                 # mid 와 그 왼쪽을 버린다
        else:                                              # 가운데 값이 크면
            right = mid - shrink                           # shrink 가 0 이면 mid 가 남은 범위에 남는다
        if (left, right) in seen:                          # 같은 남은 범위가 다시 나오면
            return '되풀이', mids, left, right             # 끝나지 않는 반복이다
        seen.add((left, right))                            # 이번 남은 범위를 적는다
    return -1, mids, left, right                           # 남은 범위가 비어 끝났다

# 2단계: 두 식을 배열에 없는 두 target 에 돌린다
nums = [-1, 0, 3, 5, 9, 12]                                # 2절의 배열
for shrink, name in ((1, 'right = mid - 1'), (0, 'right = mid')):   # 두 식을 차례로
    for target in (2, -5):                                 # 배열에 없는 값 둘
        result, mids, left, right = search(nums, target, shrink)   # 결과를 받는다
        print(f'{name}, target {target}: 결과 {result}, 본 mid {mids}, 끝날 때 left {left}, right {right}')   # 나란히 찍는다

# 3단계: right = mid 로 있는 값 6개와 없는 값 6개를 모두 찾아 본다
absent = [-5, 2, 4, 7, 10, 13]                             # 배열의 값 사이와 바깥에 있는 값
print(f'있는 값 {nums}: {[search(nums, t, 0)[0] for t in nums]}')       # 찾은 인덱스
print(f'없는 값 {absent}: {[search(nums, t, 0)[0] for t in absent]}')   # -1 이면 끝났고 되풀이면 끝나지 않는다

# 출력:
# 2단계 뜻: mid - 1 은 두 target 모두 -1 로 끝나고, mid 는 남은 범위가 한 칸이 된 뒤 같은 칸을 되풀이한다.
# right = mid - 1, target 2: 결과 -1, 본 mid [2, 0, 1], 끝날 때 left 2, right 1
# right = mid - 1, target -5: 결과 -1, 본 mid [2, 0], 끝날 때 left 0, right -1
# right = mid, target 2: 결과 되풀이, 본 mid [2, 1, 2], 끝날 때 left 2, right 2
# right = mid, target -5: 결과 되풀이, 본 mid [2, 1, 0, 0], 끝날 때 left 0, right 0
# 3단계 뜻: right = mid 는 있는 값을 모두 찾고, 없는 값은 가장 큰 값보다 큰 13 만 빼고 되풀이한다.
# 있는 값 [-1, 0, 3, 5, 9, 12]: [0, 1, 2, 3, 4, 5]
# 없는 값 [-5, 2, 4, 7, 10, 13]: ['되풀이', '되풀이', '되풀이', '되풀이', '되풀이', -1]
```

`right = mid - 1` 은 두 target 모두 남은 범위가 비어 -1 을 돌려줬고 `right = mid` 는 두 target 모두 남은 칸이 하나이고 그 값이 target 보다 큰 자리에 머물렀습니다. 3단계에서 `right = mid` 는 배열에 있는 값을 모두 맞게 찾았고 없는 값 가운데서는 가장 큰 값보다 큰 13 만 오른쪽 끝을 지나 -1 로 끝났습니다. 있는 값으로만 확인하면 이 실수는 보이지 않습니다. LeetCode 의 둘째 예제처럼 없는 값이 들어와야 시간 초과로 나타납니다.

반열린 구간의 bisect 는 `hi = mid` 로 옮기지만 되풀이하지 않습니다. hi 번 칸은 처음부터 남은 범위에 들지 않아서 `hi = mid` 만으로 mid 가 남은 범위에서 빠지고 남은 칸 수 hi - lo 가 반복마다 줄어듭니다. mid 를 빼는 식이 `mid - 1` 이냐 `mid` 냐도 3절의 부등호처럼 구간을 잡은 방식에 따라 정해집니다.

셋째 자리는 mid 를 구하는 식입니다. 과외에서 저는 C++ 와 Java 에서 `(left + right) / 2` 를 하면 두 큰 수를 더하다 32비트 최대치를 넘어 오버플로(정수가 표현 범위를 넘는 것)가 난다고 했는데, int 가 32비트일 때의 이야기입니다. Java 의 int 는 32비트이고 범위를 넘은 덧셈 결과는 2^32 로 나눈 나머지로 돌아가 음수가 될 수 있습니다. C++ 의 int 도 흔히 32비트인데 부호 있는 정수가 넘치면 정의되지 않은 동작(undefined behavior)이라 어떤 값이 나올지 정해져 있지 않습니다. 파이썬의 int 는 크기에 한계가 없어 넘치지 않습니다. 그때 저는 면접에서 이 식을 쓰면 기본기가 탄탄하다는 인상을 주어 감점을 피한다고도 했는데 근거가 없는 말이라 지웁니다.

아래 코드는 파이썬에서 Java 의 32비트 int 덧셈을 흉내 내 설명을 위해 고른 큰 인덱스 두 개에서 두 식을 비교합니다.

```python
# 하는 일: Java 의 32비트 int 덧셈을 흉내 내 left = 1,500,000,000, right = 1,600,000,000 에서 (left + right) / 2 가 음수가 되는 것을 보고, left + (right - left) // 2 와 파이썬의 (left + right) // 2 를 계산한다.

# 1단계: 32비트 int 로 자르는 함수를 만든다
# Java 의 32비트 int 는 -2,147,483,648 부터 2,147,483,647 까지이고 넘친 값은 2^32 로 나눈 나머지로 돌아간다.
INT_MAX = 2 ** 31 - 1                                      # 32비트 int 의 가장 큰 값
def to_int32(x):                                           # 파이썬 정수를 32비트 int 로 자른다
    x &= 0xFFFFFFFF                                        # 아래 32비트만 남긴다
    return x - 2 ** 32 if x > INT_MAX else x               # 맨 위 비트가 1 이면 음수로 읽는다

# 2단계: 두 인덱스를 32비트 int 로 더한다
left, right = 1_500_000_000, 1_600_000_000                 # 설명을 위해 고른 큰 인덱스
total = left + right                                       # 파이썬에서 더한 값
print(f'left + right = {total:,}, INT_MAX = {INT_MAX:,} 보다 큼 {total > INT_MAX}')   # 32비트 범위를 넘는가
wrapped = to_int32(total)                                  # 32비트 int 의 덧셈 결과
print(f'32비트 int 의 left + right = {wrapped:,}, 2 로 나누면 {int(wrapped / 2):,}')   # Java 의 / 처럼 0 쪽으로 자른다

# 3단계: 넘치지 않는 식과 파이썬의 식을 계산한다
print(f'left + (right - left) // 2 = {left + (right - left) // 2:,}')   # 차이의 절반을 left 에 더한다
print(f'파이썬 (left + right) // 2 = {(left + right) // 2:,}')         # 파이썬 int 는 넘치지 않는다

# 출력:
# 2단계 뜻: 두 인덱스의 합이 32비트 int 의 가장 큰 값을 넘어 음수가 되고, 2 로 나눠도 음수다.
# left + right = 3,100,000,000, INT_MAX = 2,147,483,647 보다 큼 True
# 32비트 int 의 left + right = -1,194,967,296, 2 로 나누면 -597,483,648
# 3단계 뜻: 넘치지 않는 식과 파이썬의 식이 같은 1,550,000,000 을 낸다.
# left + (right - left) // 2 = 1,550,000,000
# 파이썬 (left + right) // 2 = 1,550,000,000
```

Java 의 32비트 int 로 흉내 낸 합은 음수가 됐고 2 로 나눈 mid 도 음수라 배열의 인덱스로 쓸 수 없습니다. `left + (right - left) // 2` 는 두 인덱스의 차이 100,000,000 의 절반을 left 에 더하므로 넘치지 않고 파이썬에서는 두 식이 같은 값을 냅니다. 그래서 이 글의 코드는 다른 언어로 옮겨도 맞도록 `left + (right - left) // 2` 를 쓰고 파이썬에서만 쓴다면 어느 식을 써도 됩니다. 2절의 풀이를 직접 짜는 대신 표준 라이브러리를 쓸 수 있는지는 지훈 씨의 다음 질문이었습니다.

## 5. bisect_left 와 bisect_right

**bisect 모듈의 `bisect_left(a, x)` 는 정렬된 a 에 x 를 넣어도 정렬이 유지되는 넣을 자리(insertion point) 가운데 같은 값들의 왼쪽을, `bisect_right(a, x)` 는 오른쪽을 돌려줍니다. 두 함수 모두 반열린 구간 [lo, hi) 에서 `while lo < hi` 와 `hi = mid` 로 도는 이진 탐색입니다. 같은 값의 개수는 bisect_right - bisect_left 입니다.**

2절의 코드를 보고 지훈 씨가 물었습니다. 「이진 탐색은 직접 구현하기보다는 bisect 를 주로 쓰는 거예요? 아니면 위에처럼 구현하는 거예요?」 둘 다 씁니다. 정렬된 배열에서 넣을 자리나 같은 값의 개수를 구할 때는 bisect 를 쓰고 배열이 아니라 답의 범위를 좁히는 문제처럼 bisect 가 비교할 값이 배열에 없는 문제는 while 문을 직접 짭니다. 지훈 씨의 질문을 다시 말하면 「표준 라이브러리가 있는데 2절의 while 문을 직접 짤 일이 남아 있는가」입니다. 아래 표에 bisect 를 쓰는 자리와 직접 짜는 자리를 적었습니다. 과외에서는 LeetCode Medium 의 이진 탐색 문제는 대부분 배열 없이 나온다며 비율을 붙였고 면접에서 직접 구현하겠다고 말하면 점수를 더 받는다고도 했는데, 둘 다 근거가 없어 이 글에서는 쓰지 않습니다.

| 문제 | 도구 | 까닭 |
|---|---|---|
| 정렬된 배열에서 x 를 넣을 자리, x 이상인 값이 처음 나오는 자리 | `bisect_left(a, x)` | 돌려주는 값이 그 자리 그대로. ± 1 을 직접 쓰지 않는 코드 |
| 정렬된 배열에서 x 의 개수 | `bisect_right(a, x) - bisect_left(a, x)` | x 가 놓인 칸이 두 넣을 자리 사이 |
| 정렬된 배열에서 x 가 있는지와 그 인덱스 (LeetCode 704) | 2절의 직접 구현, 또는 `bisect_left` 뒤 `i < len(a) and a[i] == x` 확인 | x 가 없어도 넣을 자리를 돌려주는 bisect |
| 배열 없이 답의 범위를 좁히는 문제 (LeetCode 875) | 직접 구현. Python 3.10 이상은 `key` 인자를 넘긴 bisect 도 가능 | 배열에 없는 비교 값. 조건을 계산한 결과 |
| 회전된 정렬 배열 (LeetCode 33) | 직접 구현 | 전체가 정렬되지 않은 배열 |

[공식 문서](https://docs.python.org/3/library/bisect.html)는 bisect_left 를 정렬 순서를 지키며 x 를 넣을 자리를 찾는 함수로 정의하고 x 가 이미 있으면 넣을 자리는 같은 값들의 앞(왼쪽)이라고 적습니다. 돌려준 넣을 자리 ip 는 배열을 두 조각으로 나눠 왼쪽 조각 a[lo:ip] 의 값은 모두 x 보다 작고 오른쪽 조각 a[ip:hi] 의 값은 모두 x 이상입니다. bisect_right 는 넣을 자리가 같은 값들의 뒤(오른쪽)이고 왼쪽 조각은 모두 x 이하, 오른쪽 조각은 모두 x 보다 큽니다. 두 함수 모두 값을 찾는 함수가 아니라 넣을 자리를 찾는 함수라서 x 가 배열에 없어도 값을 돌려줍니다.

CPython 3.9 의 [bisect.py](https://github.com/python/cpython/blob/3.9/Lib/bisect.py) 는 두 함수를 lo = 0, hi = len(a) 에서 시작해 `while lo < hi` 로 도는 반열린 구간 이진 탐색으로 적어 두고 파일 끝에서 C 로 만든 `_bisect` 모듈이 있으면 그 함수로 덮어씁니다. bisect_left 는 `a[mid] < x` 이면 `lo = mid + 1`, 아니면 `hi = mid` 이고 bisect_right 는 `x < a[mid]` 이면 `hi = mid`, 아니면 `lo = mid + 1` 입니다. 두 함수는 a[mid] 가 x 와 같을 때만 다르게 움직여서, bisect_left 는 hi 를 내려 같은 값의 왼쪽 끝을 찾고 bisect_right 는 lo 를 올려 같은 값의 오른쪽 끝 다음 칸을 찾습니다.

과외에서 쓴 배열은 `[1, 2, 4, 4, 4, 5, 8]` 이고 4 가 2~4번 칸에 세 개 있습니다. 아래 코드는 bisect.py 와 같은 두 함수를 반복마다 mid 를 적게 만들어 x 4 와 배열에 없는 x 3 에 돌리고 표준 라이브러리의 값과 같은지 본 뒤 넣을 자리로 나눈 세 조각을 찍습니다.

```python
# 하는 일: bisect.py 3.9 와 같은 반열린 구간 이진 탐색으로 [1, 2, 4, 4, 4, 5, 8] 에서 x 4 와 3 의 넣을 자리를 구해 본 mid 를 찍고, 표준 라이브러리 bisect 와 같은지 본 뒤 같은 값의 개수를 센다.
import bisect                                              # 표준 라이브러리와 비교한다

# 1단계: bisect.py 와 같은 두 함수를 만든다
# 남은 범위는 반열린 구간 [lo, hi) 다. hi 번 칸은 남은 범위에 들지 않는다.
def bisect_left_trace(a, x):                               # 같은 값들의 왼쪽 넣을 자리
    lo, hi = 0, len(a)                                     # hi 는 마지막 인덱스 다음 자리
    mids = []                                              # 본 mid 를 차례로 적는다
    while lo < hi:                                         # 남은 칸 수 hi - lo 가 1 이상인 동안
        mid = (lo + hi) // 2                               # bisect.py 와 같은 식
        mids.append(mid)                                   # 본 mid 를 적는다
        if a[mid] < x:                                     # mid 의 값이 x 보다 작으면
            lo = mid + 1                                   # mid 와 그 왼쪽을 버린다
        else:                                              # mid 의 값이 x 이상이면
            hi = mid                                       # mid 와 그 오른쪽을 버린다. hi 는 남은 범위 밖이다
    return lo, mids                                        # lo = hi 가 넣을 자리

def bisect_right_trace(a, x):                              # 같은 값들의 오른쪽 넣을 자리
    lo, hi = 0, len(a)                                     # hi 는 마지막 인덱스 다음 자리
    mids = []                                              # 본 mid 를 차례로 적는다
    while lo < hi:                                         # 남은 칸 수 hi - lo 가 1 이상인 동안
        mid = (lo + hi) // 2                               # bisect.py 와 같은 식
        mids.append(mid)                                   # 본 mid 를 적는다
        if x < a[mid]:                                     # x 가 mid 의 값보다 작으면
            hi = mid                                       # mid 와 그 오른쪽을 버린다
        else:                                              # mid 의 값이 x 이하면 x 와 같아도
            lo = mid + 1                                   # mid 와 그 왼쪽을 버린다
    return lo, mids                                        # lo = hi 가 넣을 자리

# 2단계: x 4 와 3 의 넣을 자리를 구한다
a = [1, 2, 4, 4, 4, 5, 8]                                  # 과외에서 쓴 배열. 4 가 2~4번 칸에 있다
for x in (4, 3):                                           # 배열에 있는 값과 없는 값
    left, left_mids = bisect_left_trace(a, x)              # 왼쪽 넣을 자리와 본 mid
    right, right_mids = bisect_right_trace(a, x)           # 오른쪽 넣을 자리와 본 mid
    same = (left, right) == (bisect.bisect_left(a, x), bisect.bisect_right(a, x))   # 표준 라이브러리와 같은가
    print(f'x {x}: bisect_left {left} (본 mid {left_mids}), bisect_right {right} (본 mid {right_mids}), 표준 라이브러리와 같음 {same}')   # 두 자리
    print(f'x {x}: 개수 {right} - {left} = {right - left}, 왼쪽 조각 {a[:left]}, 같은 값 {a[left:right]}, 오른쪽 조각 {a[right:]}')   # 넣을 자리로 나눈 세 조각

# 출력:
# 2단계 뜻: 4 의 넣을 자리는 2 와 5 라 개수가 3 이고, 없는 3 은 두 자리가 모두 2 라 개수가 0 이다.
# x 4: bisect_left 2 (본 mid [3, 1, 2]), bisect_right 5 (본 mid [3, 5, 4]), 표준 라이브러리와 같음 True
# x 4: 개수 5 - 2 = 3, 왼쪽 조각 [1, 2], 같은 값 [4, 4, 4], 오른쪽 조각 [5, 8]
# x 3: bisect_left 2 (본 mid [3, 1, 2]), bisect_right 2 (본 mid [3, 1, 2]), 표준 라이브러리와 같음 True
# x 3: 개수 2 - 2 = 0, 왼쪽 조각 [1, 2], 같은 값 [], 오른쪽 조각 [4, 4, 4, 5, 8]
```

x 4 에서 두 함수는 첫 mid 3 의 4 를 같이 봤지만 bisect_left 는 hi 를 내려 왼쪽을, bisect_right 는 lo 를 올려 오른쪽을 남겼고 두 넣을 자리의 차가 4 의 개수 3 입니다. bisect_right 의 5 는 마지막 4 가 있는 칸이 아니라 그다음 자리입니다. 세 조각은 공식 문서의 정의대로 x 보다 작은 값, x 와 같은 값, x 보다 큰 값으로 나뉘었습니다. 배열에 없는 3 은 두 자리가 같아 개수가 0 이라, bisect 로 값이 있는지 보려면 두 자리를 비교합니다.

아래 데모의 「bisect_left 와 bisect_right」 탭은 x 4 를 한 단계씩 보여 줍니다. 값 7칸 뒤의 점선 칸은 인덱스 7 로, 배열 밖이고 hi 가 처음 가리키는 자리입니다. 「다음 반복」을 한 번 누르면 이번 단계 칸에 「bisect_left, lo 0, hi 7, mid 3. nums[3] = 4가 4와 같아 hi 를 3으로 옮깁니다. 같은 값은 넣을 자리를 더 왼쪽에서 찾습니다.」가 나옵니다. 세 번째로 누르면 「lo = hi = 2. 반복이 끝났고 bisect_left 의 넣을 자리는 2입니다.」가 나오고 네 번째로 누르면 「bisect_right, lo 0, hi 7, mid 3. nums[3] = 4가 4와 같아도 lo 를 4로 옮깁니다. 같은 값은 넣을 자리를 더 오른쪽에서 찾습니다.」가 나와 같은 mid 3 에서 반대쪽을 남깁니다. 「끝까지」를 누르면 단계 8 / 8 에서 결과 칸에 「bisect_left 2, bisect_right 5」와 「4의 개수 5 - 2 = 3」이 나오고 2~4번 칸이 범례의 「같은 값이 놓인 칸」 색으로 바뀝니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-lesson-binary-search.html?embed=1&mode=bisect&preset=dup-4" height="870" loading="lazy" title="같은 값이 여럿일 때 bisect 두 자리 미니 데모"></iframe>
<a class="demo-embed-open" href="demo-lesson-binary-search.html?mode=bisect&preset=dup-4" target="_blank" rel="noopener">↗ 전체 데모로 열기</a>
</div>

과외에서 저는 bisect 는 단순한 대소 비교만 해서 7절 같은 파라메트릭 서치를 풀지 못한다고 했는데, 공식 문서를 보면 Python 3.10 에서 bisect_left 와 bisect_right 에 `key` 인자가 생겼습니다(「Changed in version 3.10: Added the key parameter.」). key 는 배열의 값마다 비교할 값을 꺼내는 함수라서 3.10 이상에서는 조건을 계산하는 함수를 key 로 넘겨 bisect 로도 답의 범위를 좁힐 수 있습니다. 이 블로그의 코드가 도는 Python 3.9 에는 이 인자가 없고 아래 코드처럼 넘기면 TypeError 가 납니다.

```python
# 하는 일: Python 3.9 의 bisect_left 에 key 인자를 넘기면 TypeError 가 나는 것을 본다.
import bisect                                              # 넣을 자리를 찾는 표준 라이브러리
import sys                                                 # 돌리는 파이썬 버전을 읽는다

print(f'Python {sys.version_info.major}.{sys.version_info.minor}')   # 이 블록을 돌린 버전
try:                                                       # 오류를 받아 찍는다
    bisect.bisect_left([1, 2, 3], 2, key=lambda v: v)      # 3.10 에서 생긴 key 인자를 넘긴다
except TypeError as e:                                     # 3.9 에는 key 인자가 없다
    print(f'TypeError: {e}')                               # 오류 문구를 찍는다

# 출력:
# 뜻: 3.9 의 bisect_left 는 key 를 모르는 인자로 보고 TypeError 를 낸다.
# Python 3.9
# TypeError: 'key' is an invalid keyword argument for bisect_left()
```

이 글은 3.9 에서 도는 직접 구현을 쓰고 key 로 쓰는 모양은 7절에서 한 줄로만 적습니다. 넣을 자리 두 개로 바로 풀리는 LeetCode 문제가 6절의 34 입니다.

## 6. Find First and Last Position of Element in Sorted Array (LeetCode 34, Medium)

**오름차순으로 정렬돼 같은 값이 여럿 있을 수 있는 배열에서 target 이 처음과 마지막으로 나오는 인덱스를 돌려주고 없으면 [-1, -1] 을 돌려줍니다. bisect_left 가 처음 자리를, bisect_right 의 바로 앞 칸이 마지막 자리를 주므로 bisect 를 두 번 부르고 두 넣을 자리가 같으면 target 이 없습니다.**

[LeetCode 34. Find First and Last Position of Element in Sorted Array](https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/) 는 비내림차순(앞의 값이 뒤의 값보다 크지 않은 순서)으로 정렬된 정수 배열 `nums` 와 `target` 을 주고 target 이 처음 나오는 인덱스와 마지막으로 나오는 인덱스를 `[처음, 마지막]` 으로 돌려 달라고 합니다. target 이 없으면 `[-1, -1]` 이고 O(log n) 시간에 도는 풀이를 요구합니다. 첫 예제 `nums = [5, 7, 7, 8, 8, 10]`, `target = 8` 은 8 이 3번과 4번 칸에 있어 `[3, 4]`, 둘째 예제 같은 nums 에서 `target = 6` 은 `[-1, -1]`, 셋째 예제 `nums = []`, `target = 0` 도 `[-1, -1]` 입니다. nums 의 길이는 0 부터 100,000 까지입니다.

5절의 표에서 처음 자리는 bisect_left, 같은 값의 마지막 칸은 bisect_right 의 바로 앞 칸이었습니다. 배열이 정렬돼 있고 O(log n) 을 요구하므로 넣을 자리 두 개를 이진 탐색으로 구합니다. bisect_left 로 처음 자리를 찾은 뒤 오른쪽으로 한 칸씩 가며 마지막 target 을 찾는 방법도 떠올리기 쉽지만 값이 모두 target 인 길이 100,000 의 배열이면 100,000칸을 모두 지나 O(N) 이 됩니다. bisect 두 번은 각각 반복이 많아야 floor(log2 100,000) + 1 = 17번입니다.

1. `first = bisect_left(nums, target)` 로 target 이상인 값이 처음 나오는 자리를 구합니다.
2. `after = bisect_right(nums, target)` 로 target 보다 큰 값이 처음 나오는 자리를 구합니다.
3. first 와 after 가 같으면 두 자리 사이에 칸이 없어 `[-1, -1]` 을 돌려줍니다.
4. 다르면 `[first, after - 1]` 을 돌려줍니다.

```python
# 하는 일: LeetCode 34 를 bisect_left 와 bisect_right 로 풀어 세 예제에서 두 넣을 자리와 답을 찍는다.
from bisect import bisect_left, bisect_right               # 5절의 두 함수
from typing import List                                    # LeetCode 화면의 List[int] 주석에 쓴다

# 1단계: 풀이를 만든다
# 처음 자리는 bisect_left, 마지막 자리는 bisect_right 바로 앞 칸이다. 두 자리가 같으면 target 이 없다.
class Solution:                                            # LeetCode 가 정해 둔 클래스 이름 그대로 둔다
    def searchRange(self, nums: List[int], target: int, trace: bool = False) -> List[int]:   # trace 는 이 글이 붙인 인자
        first = bisect_left(nums, target)                  # target 이상인 값이 처음 나오는 자리
        after = bisect_right(nums, target)                 # target 보다 큰 값이 처음 나오는 자리
        if trace:                                          # 따라가기를 켰으면
            print(f'nums {nums}, target {target}: bisect_left {first}, bisect_right {after}')   # 두 넣을 자리
        if first == after:                                 # 두 자리 사이에 칸이 없으면
            return [-1, -1]                                # target 이 없다
        return [first, after - 1]                          # 마지막 target 은 bisect_right 바로 앞 칸

# 2단계: 세 예제를 돌린다
for nums, target in (([5, 7, 7, 8, 8, 10], 8), ([5, 7, 7, 8, 8, 10], 6), ([], 0)):   # LeetCode 의 세 예제
    print(f'답 {Solution().searchRange(nums, target, trace=True)}')   # 두 자리를 찍고 답을 찍는다

# 출력:
# 2단계 뜻: 8 은 두 자리가 3 과 5 라 [3, 4] 이고, 6 과 빈 배열은 두 자리가 같아 [-1, -1] 이다.
# nums [5, 7, 7, 8, 8, 10], target 8: bisect_left 3, bisect_right 5
# 답 [3, 4]
# nums [5, 7, 7, 8, 8, 10], target 6: bisect_left 1, bisect_right 1
# 답 [-1, -1]
# nums [], target 0: bisect_left 0, bisect_right 0
# 답 [-1, -1]
```

첫 예제의 bisect_right 5 는 마지막 8 다음 자리라 답의 마지막 인덱스는 5 - 1 = 4 입니다. 배열에 없는 6 과 빈 배열은 두 넣을 자리가 같아 `[-1, -1]` 을 돌려줬고 두 함수가 hi = 0 에서 반복 없이 0 을 돌려주므로 빈 배열을 따로 처리하지 않아도 됩니다. 시간 복잡도는 bisect 두 번이라 O(log N) 이고 넣을 자리 두 개만 담으므로 공간 복잡도는 O(1) 입니다.

이 문제도 5절 데모의 「bisect_left 와 bisect_right」 탭과 같은 계산이라서, 데모의 입력을 x 3 으로 바꾸면 target 6 처럼 두 자리가 같은 경우를 볼 수 있습니다. 「끝까지」를 누르면 결과 칸에 「bisect_left 2, bisect_right 2」와 「3은 없어 개수 0」이 나옵니다. 34 까지는 찾는 곳이 배열이었고 7절의 문제는 배열 대신 답이 될 수 있는 수의 범위에서 찾습니다.

## 7. Koko Eating Bananas (LeetCode 875, Medium)

**바나나 더미마다 piles[i] 개가 있고 h 시간 안에 다 먹어야 할 때 한 시간에 k 개씩 먹는 속도 k 의 가장 작은 값을 구합니다. 찾는 곳이 배열이 아니라 속도 1 부터 max(piles) 까지의 범위입니다. 속도가 오르면 걸리는 시간이 늘지 않으므로 가운데 속도가 h 시간 안이면 답 후보로 두고 더 느린 쪽을, 아니면 더 빠른 쪽을 남깁니다.**

[LeetCode 875. Koko Eating Bananas](https://leetcode.com/problems/koko-eating-bananas/) 는 바나나 더미의 바나나 수 `piles` 와 시간 `h` 를 줍니다. Koko 는 한 시간에 더미 하나를 골라 바나나를 k 개 먹고 그 더미에 k 개보다 적게 남았으면 남은 것을 다 먹고 그 시간에는 더 먹지 않습니다. h 시간 안에 모든 더미를 다 먹을 수 있는 가장 작은 정수 k 를 돌려 달라고 합니다. 첫 예제 `piles = [3, 6, 7, 11]`, `h = 8` 은 4, 둘째 예제 `piles = [30, 11, 23, 4, 20]`, `h = 5` 는 30, 셋째 예제 같은 piles 에 `h = 6` 은 23 이 답입니다. piles 의 길이는 1 부터 10,000 까지, 더미의 바나나 수는 1 부터 1,000,000,000 까지이고 h 는 piles 의 길이 이상 1,000,000,000 이하입니다.

속도 k 로 바나나 p 개인 더미 하나를 먹는 데는 p / k 를 올림한 시간이 듭니다. 이 글은 더미마다 든 시간을 더한 값을 걸리는 시간이라고 부릅니다. 첫 예제의 속도마다 걸리는 시간은 이렇습니다.

| 속도 k | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 걸리는 시간 | 27 | 15 | 10 | 8 | 8 | 6 | 5 | 5 | 5 | 5 | 4 |
| 8시간 안 | 아니오 | 아니오 | 아니오 | 예 | 예 | 예 | 예 | 예 | 예 | 예 | 예 |

속도가 오르면 더미마다 든 시간이 늘지 않으므로 걸리는 시간도 늘지 않고 4 와 5 처럼 같은 값이 이어질 수는 있어도 앞보다 커지는 일은 없습니다. 그래서 「8시간 안」 줄은 속도 1~3 의 「아니오」 다음에 속도 4 부터 「예」만 이어지고 1절의 정렬된 배열처럼 가운데 속도 하나의 답으로 한쪽 속도들을 모두 버릴 수 있습니다. 가운데 속도가 8시간 안이면 그 속도보다 빠른 속도는 시간 안이어도 가장 느린 속도가 아니므로 버리고 8시간을 넘으면 그 속도보다 느린 속도도 모두 넘으므로 버립니다. 이렇게 답이 될 수 있는 값의 범위를 남은 범위로 두고 가운데 값이 조건을 지키는지로 범위를 좁히는 방법을 코딩테스트에서는 파라메트릭 서치(parametric search)라고 부릅니다.

과외의 코드는 right 를 1,000,000,000 으로 두었는데, 속도가 max(piles) 면 가장 큰 더미도 1시간에 끝나 더미마다 1시간씩 piles 의 길이만큼 걸리고 문제가 h 를 piles 의 길이 이상으로 주므로 늘 시간 안입니다. 그래서 right 는 max(piles) 로 둡니다. 답은 같지만 반복의 상한이 floor(log2 1,000,000,000) + 1 = 30번에서 첫 예제의 floor(log2 11) + 1 = 4번으로 줄어듭니다.

속도를 1 부터 하나씩 올리며 확인하는 방법도 있지만 첫 예제는 속도 4 에서 4번 만에 끝나도 답이 max(piles) 근처인 입력에서는 많아야 1,000,000,000번 걸리는 시간을 계산해야 합니다. 걸리는 시간을 한 번 계산하는 데 더미 수만큼 나눗셈을 하므로, 더미가 10,000개면 하나씩 올리는 방법은 많아야 1,000,000,000 × 10,000 = 10,000,000,000,000번, 이진 탐색은 많아야 30 × 10,000 = 300,000번의 나눗셈을 합니다.

1. left 를 1, right 를 `max(piles)` 로 두고 답 후보를 `max(piles)` 로 둡니다.
2. left <= right 인 동안 가운데 속도 mid 의 걸리는 시간을 구합니다.
3. 걸리는 시간이 h 이하면 답 후보를 mid 로 바꾸고 `right = mid - 1` 로 더 느린 속도를 봅니다.
4. h 를 넘으면 `left = mid + 1` 로 더 빠른 속도를 봅니다.
5. 반복이 끝나면 답 후보를 돌려줍니다.

```python
# 하는 일: LeetCode 875 를 속도 1 ~ max(piles) 의 이진 탐색으로 풀어 첫 예제의 속도마다 걸리는 시간을 찍고, 반복마다 속도와 걸리는 시간을 따라간 뒤 세 예제의 답을 찍는다.
from typing import List                                    # LeetCode 화면의 List[int] 주석에 쓴다

# 1단계: 첫 예제의 속도마다 걸리는 시간을 찍는다
# 더미 p 개를 속도 k 로 먹는 시간은 p / k 의 올림이고 (p + k - 1) // k 로 정수만 써서 구한다.
piles = [3, 6, 7, 11]                                      # 첫 예제의 더미
print({k: sum((p + k - 1) // k for p in piles) for k in range(1, max(piles) + 1)})   # 속도: 걸리는 시간

# 2단계: 풀이를 만든다
# 시간 안이면 답 후보로 두고 더 느린 속도를, 시간을 넘으면 더 빠른 속도를 본다.
class Solution:                                            # LeetCode 가 정해 둔 클래스 이름 그대로 둔다
    def minEatingSpeed(self, piles: List[int], h: int, trace: bool = False) -> int:   # trace 는 이 글이 붙인 인자
        def hours(k):                                      # 속도 k 의 걸리는 시간
            return sum((p + k - 1) // k for p in piles)    # 더미마다 p / k 를 올림해 더한다
        left, right = 1, max(piles)                        # 속도의 남은 범위. max(piles) 면 더미마다 1시간이다
        answer = right                                     # 답 후보. h 가 더미 수 이상이라 max(piles) 는 늘 시간 안이다
        while left <= right:                               # 남은 범위에 속도가 하나라도 있는 동안
            mid = left + (right - left) // 2               # 가운데 속도
            spent = hours(mid)                             # 그 속도의 걸리는 시간
            if trace:                                      # 따라가기를 켰으면
                print(f'left {left}, right {right}, mid {mid}: 걸리는 시간 {spent}, {"시간 안" if spent <= h else "시간 넘음"}')   # 이번 반복
            if spent <= h:                                 # h 시간 안이면
                answer = mid                               # 답 후보로 둔다
                right = mid - 1                            # 더 느린 속도를 본다
            else:                                          # h 시간을 넘으면
                left = mid + 1                             # 더 빠른 속도를 본다
        return answer                                      # 마지막 답 후보가 가장 느린 속도다

# 3단계: 첫 예제를 따라간다
print(f'답 {Solution().minEatingSpeed(piles, 8, trace=True)}')   # 반복마다 찍고 답을 찍는다

# 4단계: 나머지 두 예제를 돌린다
print(f'[30, 11, 23, 4, 20], h 5 → {Solution().minEatingSpeed([30, 11, 23, 4, 20], 5)}')   # 더미마다 1시간이어야 한다
print(f'[30, 11, 23, 4, 20], h 6 → {Solution().minEatingSpeed([30, 11, 23, 4, 20], 6)}')   # 한 더미만 2시간이 된다

# 출력:
# 1단계 뜻: 속도가 오르면 걸리는 시간이 줄거나 그대로이고 커지지 않는다.
# {1: 27, 2: 15, 3: 10, 4: 8, 5: 8, 6: 6, 7: 5, 8: 5, 9: 5, 10: 5, 11: 4}
# 3단계 뜻: mid 6 과 4 는 시간 안이라 답 후보가 되고, mid 3 은 시간을 넘어 버려져 답은 4 다.
# left 1, right 11, mid 6: 걸리는 시간 6, 시간 안
# left 1, right 5, mid 3: 걸리는 시간 10, 시간 넘음
# left 4, right 5, mid 4: 걸리는 시간 8, 시간 안
# 답 4
# 4단계 뜻: h 5 는 더미 5개를 1시간씩 먹어야 해서 30, h 6 은 23 이다.
# [30, 11, 23, 4, 20], h 5 → 30
# [30, 11, 23, 4, 20], h 6 → 23
```

1단계의 줄은 위 표와 같고 3단계는 속도 11개 가운데 mid 로 본 6, 3, 4 의 걸리는 시간만 계산했습니다. 시간 안이던 6 과 4 가 차례로 답 후보가 됐고 시간을 넘은 3 에서는 3 과 그보다 느린 속도를 버렸습니다. 둘째 예제는 h 가 더미 수와 같아 더미마다 1시간에 끝내야 해서 가장 큰 더미의 바나나 수가 답입니다. 셋째 예제는 한 더미에만 2시간을 쓸 수 있어 가장 큰 더미에 2시간을 쓰면 두 번째로 큰 더미는 1시간에 먹어야 하므로 그 더미의 바나나 수 23 이 답입니다.

반복은 많아야 floor(log2 M) + 1 번(M = max(piles))이고 반복마다 걸리는 시간을 더미 N 개로 계산하므로 시간 복잡도는 O(N log M) 입니다. 변수 몇 개만 쓰므로 공간 복잡도는 O(1) 입니다. Python 3.10 이상에서는 5절의 key 인자를 써서 맨 위에 `from bisect import bisect_left` 를 더하고 minEatingSpeed 안의 while 문과 `return answer` 를 `return 1 + bisect_left(range(1, max(piles) + 1), True, key=lambda k: hours(k) <= h)` 한 줄로 바꿀 수 있습니다. 저는 Python 3.12 에서 세 예제의 답 4, 30, 23 을 확인했습니다.

아래 데모의 「답의 범위를 좁히는 탐색」 탭은 첫 예제를 보여 줍니다. 「한 칸」을 처음 누르면 이번 단계 칸에 「left 1, right 11, mid 6. 속도 6이면 1 + 1 + 2 + 2 = 6시간이라 8시간 안입니다.」가 나오고 표 아랫줄의 속도 6 열에 6 이 채워집니다. 한 번 더 누르면 「답 후보를 6으로 두고 속도 7~11을 버립니다. right 를 5로 옮깁니다.」로 바뀌고 속도 6 열은 범례의 「답 후보」, 속도 7~11 열은 「버린 속도」 모양이 됩니다. 세 번째로 누르면 「left 1, right 5, mid 3. 속도 3이면 1 + 2 + 3 + 4 = 10시간이라 8시간을 넘습니다.」가 나옵니다. 「끝까지」를 누르면 단계 6 / 6 에서 결과 칸에 「가장 느린 속도 4」와 「반복 3번. 속도를 1부터 하나씩 올려 확인하면 4번째에 찾습니다.」가 나오고 표 아랫줄에는 mid 로 본 속도 6, 3, 4 의 걸리는 시간 6, 10, 8 만 채워져 있습니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-lesson-binary-search.html?embed=1&mode=param&preset=koko-8" height="900" loading="lazy" title="LeetCode 875 답의 범위를 좁히는 탐색 미니 데모"></iframe>
<a class="demo-embed-open" href="demo-lesson-binary-search.html?mode=param&preset=koko-8" target="_blank" rel="noopener">↗ 전체 데모로 열기</a>
</div>

표의 11개 속도 가운데 걸리는 시간을 계산한 속도는 3개뿐이었습니다. 데모의 입력 목록에서 h 5 를 고르고 「끝까지」를 누르면 결과 칸이 「가장 느린 속도 7」과 「반복 3번. 속도를 1부터 하나씩 올려 확인하면 7번째에 찾습니다.」로, h 4 를 고르면 「가장 느린 속도 11」과 「반복 4번. 속도를 1부터 하나씩 올려 확인하면 11번째에 찾습니다.」로 바뀝니다. 속도를 하나씩 올리는 방법은 답이 클수록 확인할 속도가 늘지만 이진 탐색은 속도의 범위가 1~11 그대로라 반복이 많아야 floor(log2 11) + 1 = 4번입니다.

## 한눈 정리

| 문제 | 남은 범위 | 반복 조건 | 옮기는 식 | 돌려주는 값 | 시간 | 이 글의 예 |
|---|---|---|---|---|---|---|
| 값 찾기 (704) | 닫힌 구간 [left, right] | left <= right | `left = mid + 1`, `right = mid - 1` | 인덱스, 없으면 -1 | O(log N) | `[-1, 0, 3, 5, 9, 12]`, 9 → 4 |
| bisect_left | 반열린 구간 [lo, hi) | lo < hi | `lo = mid + 1`, `hi = mid` | x 이상인 값이 처음 나오는 넣을 자리 | O(log N) | `[1, 2, 4, 4, 4, 5, 8]`, 4 → 2 |
| bisect_right | 반열린 구간 [lo, hi) | lo < hi | `lo = mid + 1`, `hi = mid` | x 보다 큰 값이 처음 나오는 넣을 자리 | O(log N) | 같은 배열, 4 → 5 |
| 처음과 마지막 자리 (34) | bisect 두 번 | | | [bisect_left, bisect_right - 1], 없으면 [-1, -1] | O(log N) | `[5, 7, 7, 8, 8, 10]`, 8 → [3, 4] |
| 가장 느린 속도 (875) | 속도의 닫힌 구간 [1, max(piles)] | left <= right | 시간 안이면 답 후보 = mid, `right = mid - 1` | 마지막 답 후보 | O(N log M) | `[3, 6, 7, 11]`, h = 8 → 4 |

표의 O(log N) 은 정렬된 배열에서 값 하나를 비교하는 데 O(1) 일 때입니다. 875 의 M 은 max(piles) 입니다. 닫힌 구간은 `<=` 와 `mid ± 1`, 반열린 구간은 `<` 와 `hi = mid` 가 짝입니다. 875 는 배열이 아니라 속도의 범위를 남은 범위로 두지만 704 와 같은 닫힌 구간 탐색에 답 후보를 적는 줄 하나가 붙었습니다.

## 헷갈리기 쉬운 점

- **부등호와 갱신식은 구간을 잡은 방식에 따라 짝을 맞춥니다.** 닫힌 구간 [left, right] 는 `while left <= right` 와 `mid ± 1`, 반열린 구간 [lo, hi) 는 `while lo < hi` 와 `hi = mid` 입니다. 닫힌 구간에 `<` 를 쓰면 마지막 칸의 12 를 못 찾고 `right = mid` 를 쓰면 같은 남은 범위가 되풀이됩니다.
- **「100만 개면 20번」은 반복 수의 상한입니다.** 반복은 많아야 floor(log2 N) + 1 번이고 시간이 O(log N) 이 되려면 값 하나를 비교하는 데 O(1) 이어야 합니다. 정렬하지 않은 배열에서도 반복은 이 상한 안에서 끝나지만 오류 없이 틀린 답을 냅니다.
- **bisect_right 는 마지막 같은 값의 자리가 아니라 그다음 자리를 돌려줍니다.** `[1, 2, 4, 4, 4, 5, 8]` 에서 마지막 4 는 4번 칸이고 bisect_right 는 5 라서, LeetCode 34 의 마지막 자리는 bisect_right - 1 로 구합니다.
- **bisect 는 x 가 없어도 넣을 자리를 돌려줍니다.** x 3 은 두 자리가 모두 2 라 개수가 0 이고 있는지는 두 자리를 비교하거나 `a[i] == x` 로 따로 확인합니다.
- **mid 를 구하는 두 식은 32비트 int 에서만 결과가 다릅니다.** 파이썬에서는 `(left + right) // 2` 와 `left + (right - left) // 2` 가 같고 int 가 32비트인 언어에서 두 인덱스의 합이 2,147,483,647 을 넘으면 앞의 식이 Java 에서는 음수가 되고 C++ 에서는 정의되지 않은 동작입니다.
- **875 의 right 는 max(piles) 면 충분합니다.** 그 속도면 더미마다 1시간이라 h 가 더미 수 이상인 이 문제에서는 늘 시간 안에 끝납니다.
- **bisect 의 key 인자는 Python 3.10 에서 생겼습니다.** 3.9 에서는 TypeError 가 나므로 875 같은 문제는 while 문을 직접 짭니다.

## 더 깊이 보기

- 값 자체를 찾는 변형과 경계를 찾는 세 변형을 배열 [1, 3, 3, 3, 7] 하나에서 비교하는 예는 [이분 탐색과 스택](post.html?id=algorithm-binary-search-stack) 편 2절에, 나무를 같은 높이에서 잘라 원하는 양을 얻는 가장 높은 높이를 찾는 파라메트릭 서치는 4절에, 회전된 정렬 배열에서 값을 찾는 탐색은 5절에 있습니다.
- 정확히 찾기, 왼쪽 경계, 오른쪽 경계를 같은 배열에서 바꿔 가며 보는 데모는 [이분 탐색 회차 보기](demo-binary-search.html) 입니다.
- 정렬 여부에 따라 값 하나 찾기, Two Sum, 3Sum 에 쓰는 도구를 나란히 놓은 표는 [투 포인터](post.html?id=algorithm-lesson-two-pointers) 편 1절에 있습니다.
- 펼친 배열이 정렬되는 이진 탐색 트리(BST)와 그 탐색 경로가 이진 탐색의 mid 순서와 같아지는 경우는 [트리와 BST](post.html?id=algorithm-lesson-tree-bst) 편 7절에 있습니다.
- 이 글의 데모는 [이진 탐색: 버린 칸, bisect 의 두 자리, 답의 범위](demo-lesson-binary-search.html) 한 페이지에서 탭과 입력을 바꿔 가며 볼 수 있습니다.
- 예시 문제는 [Binary Search](https://leetcode.com/problems/binary-search/)(704), [Find First and Last Position of Element in Sorted Array](https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/)(34), [Koko Eating Bananas](https://leetcode.com/problems/koko-eating-bananas/)(875) 입니다.
- bisect 의 정의와 key 인자는 [공식 문서](https://docs.python.org/3/library/bisect.html)에, CPython 3.9 의 구현은 [bisect.py](https://github.com/python/cpython/blob/3.9/Lib/bisect.py) 에 있습니다.
