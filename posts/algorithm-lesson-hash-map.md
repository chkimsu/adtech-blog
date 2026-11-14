지훈 씨는 코딩테스트를 준비하며 저와 1:1 로 문제를 풀고 있습니다. 해시 맵(hash map, 키로 값을 바로 꺼내는 자료구조)을 배울 차례가 되자 지훈 씨가 Two Sum(LeetCode 1, 더해서 target 이 되는 두 값의 인덱스를 찾는 문제)을 골라 물었습니다. 「two sum 문제를 풀고, 어떤 방법을 쓴 건지랑 코드 설명 좀 해 주세요.」

제가 쓴 방법은 해시 맵이고 파이썬에서는 dict 입니다. 배열을 한 번 순회하며 지나온 숫자를 dict 에 적어 두고 지금 숫자의 짝(더해서 target 이 되는 수)이 이미 적혀 있는지 봅니다.

**지나온 숫자를 dict 에 어떤 순서로 적어야 짝을 한 번에 찾을 수 있을까요?**

이 글은 그 dict 를 과외 코드 그대로 seen 이라고 부릅니다. seen 이 없으면 모든 짝을 더해 봐야 해서 값 10,000개에서 49,995,000번을 비교하지만 seen 이 있으면 값마다 한 번씩만 확인해 10,000번을 넘지 않습니다.

> **한 줄 요약:** Two Sum 은 값마다 짝(target - num)이 seen 에 있는지 먼저 확인하고 짝이 없을 때만 지금 숫자를 키로, 그 인덱스를 값으로 seen 에 적으며 배열을 한 번 순회합니다. 확인하기 전에 모든 숫자를 적어 두면 nums = [3, 2, 4], target = 6 에서 0번 칸의 3 이 자기 자신과 짝이 되어 틀린 답 [0, 0] 이 나옵니다. 값마다 뺄셈, dict 확인, 적기가 한 번씩이라 시간 복잡도는 O(N) 이고 모든 짝을 더해 보는 이중 for 문은 N(N-1)/2 번 비교합니다.

> **골라 읽는 법** — 절이 9개인 긴 글입니다. 처음부터 다 읽지 않아도 됩니다.
>
> - Two Sum 을 푸는 두 방법과 seen 에 적는 순서 → 1~3절
> - seen 이 dict 인 이유와 key in dict → 4~5절
> - 해시의 비용과 set, dict 선택 → 6~7절
> - 같은 틀로 푸는 LeetCode 문제 2개 → 8~9절

---

## 1. Two Sum 과 이중 for 문 (LeetCode 1, Easy)

**Two Sum 은 더해서 target 이 되는 두 값의 인덱스를 찾는 문제입니다. 가장 먼저 떠오르는 풀이는 i < j 인 두 인덱스의 짝을 모두 더해 보는 이중 for 문이고 값이 N개면 짝이 N(N-1)/2 개라 답이 맨 끝에 있으면 그만큼 비교합니다.**

[LeetCode 1. Two Sum](https://leetcode.com/problems/two-sum/) 은 정수 배열 `nums` 와 정수 `target` 을 주고 더해서 `target` 이 되는 두 값의 인덱스를 돌려 달라고 합니다. 답은 정확히 하나 있고 같은 칸을 두 번 쓸 수 없으며 두 인덱스의 순서는 상관없습니다. 첫 예제 `nums = [2, 7, 11, 15]`, `target = 9` 는 2 + 7 = 9 라서 답이 `[0, 1]` 입니다.

모든 경우를 다 해 보는 완전 탐색(brute force)이 먼저 떠오릅니다. 첫째 값의 인덱스 i 를 앞에서부터 고르고 둘째 값의 인덱스 j 는 i 보다 뒤에서만 골라 `nums[i] + nums[j]` 를 `target` 과 비교합니다. j 를 i 뒤에서만 고르므로 (0, 3) 과 (3, 0) 처럼 순서만 바꾼 짝을 두 번 더하지 않고 (2, 2) 처럼 같은 칸을 두 번 쓰지도 않습니다. 값이 N개면 i = 0 일 때 j 가 N - 1 개, i = 1 일 때 N - 2 개이고 마지막 i 에서 1개라서 i < j 인 짝은 (N - 1) + (N - 2) + … + 1 = N(N-1)/2 개입니다.

아래 코드는 설명을 위해 만든 값 8개 `[4, 9, 1, 7, 12, 3, 10, 8]` 과 `target = 18` 로 이 풀이를 돌립니다. 답이 마지막 두 칸의 10 과 8 이라 짝을 모두 비교하고 나서야 멈춥니다. 비교 수를 세려고 `self.comparisons` 를 붙였고 LeetCode 에 낼 때는 이 줄을 지워도 답은 같습니다.

```python
# 하는 일: LeetCode 1 을 이중 for 문으로 풀어 값 8개에서 답과 비교 수를 찍고, 값이 10,000개일 때 짝의 수를 식으로 구한다.
from typing import List                                    # LeetCode 화면의 List[int] 주석에 쓴다

# 1단계: 풀이를 만든다
# j 를 i 뒤에서만 고르므로 같은 짝을 두 번 비교하지 않고 같은 칸을 두 번 쓰지도 않는다.
class Solution:                                            # LeetCode 가 정해 둔 클래스 이름 그대로 둔다
    def twoSum(self, nums: List[int], target: int) -> List[int]:   # LeetCode 가 부르는 함수
        self.comparisons = 0                               # 짝을 더해 target 과 비교한 횟수. 세려고 이 글이 붙인 값
        for i in range(len(nums)):                         # 첫째 값의 인덱스
            for j in range(i + 1, len(nums)):              # 둘째 값은 i 뒤에서만 고른다
                self.comparisons += 1                      # 짝 하나를 비교한다
                if nums[i] + nums[j] == target:            # 두 값의 합이 target 이면
                    return [i, j]                          # 두 인덱스를 돌려준다
        return []                                          # 끝까지 짝이 없으면 빈 목록

# 2단계: 답이 맨 끝에 있는 입력을 푼다
# 설명을 위해 만든 입력이다. 10 + 8 = 18 이 마지막 짝이다.
s = Solution()                                             # 풀이 객체
answer = s.twoSum([4, 9, 1, 7, 12, 3, 10, 8], 18)          # 값 8개, target 18
print(f'답 {answer}, 비교 {s.comparisons}번')              # 답과 비교 수
print(f'i < j 인 짝 8 × 7 / 2 = {8 * 7 // 2}개')           # 식으로 센 짝의 수

# 3단계: 값이 10,000개일 때 짝의 수를 구한다
n = 10_000                                                 # 값의 개수
print(f'N = {n:,}  짝 N(N-1)/2 = {n * (n - 1) // 2:,}개  N² = {n * n:,}')   # 짝의 수와 N² 을 나란히 찍는다

# 출력:
# 2단계 뜻: 답이 마지막 짝이라 i < j 인 짝 28개를 모두 비교하고 [6, 7] 에서 멈췄다.
# 답 [6, 7], 비교 28번
# i < j 인 짝 8 × 7 / 2 = 28개
# 3단계 뜻: 값 10,000개의 짝은 49,995,000개로 N² 의 절반보다 조금 적다.
# N = 10,000  짝 N(N-1)/2 = 49,995,000개  N² = 100,000,000
```

출력의 비교 28번은 짝의 수 8 × 7 / 2 = 28 과 같습니다. 값이 10,000개면 짝은 10,000 × 9,999 / 2 = 49,995,000개입니다. 과외에서 제가 「O(N²) 이라 1억 번」, 「10,000개라면 최대 1억 번」이라고 설명했는데, 1억은 N² = 100,000,000 이라서 (3, 0) 처럼 순서만 바꾼 짝과 (2, 2) 처럼 같은 칸을 고른 짝까지 센 수입니다. i < j 인 짝만 세면 그 절반보다 조금 적은 49,995,000번이고 둘 다 N 의 제곱에 비례해 늘어나므로 시간 복잡도는 똑같이 O(N²) 입니다. 따로 쓰는 메모리는 i, j 와 비교 수뿐이라 공간 복잡도는 O(1) 입니다.

이중 for 문이 짝을 하나씩 비교하는 모습은 아래 데모에서 봅니다. 「한 칸」을 누르면 짝 하나를 비교하고 이번 단계 칸에 「i = 0, j = 1. 4 + 9 = 13, target 18과 다릅니다.」가 나옵니다. 「다음 값」은 지금 i 의 짝을 끝까지 비교하는 버튼이라 처음부터 누르면 단계 7 / 28 에서 i = 0 의 짝 7개가 끝나고 비교한 짝 칸에 4 + 9 = 13 부터 4 + 8 = 12 까지 7개가 보입니다. 한 번 더 누르면 단계 13 / 28 에서 i = 1 의 짝 6개가 끝나고 0번 칸이 i 로 끝낸 칸으로 흐려집니다. 「끝까지」를 누르면 단계 28 / 28 에서 결과 칸에 [6, 7] 이 나오고 그 아랫줄에 「seen 확인 8번, 이중 for 문 비교 28번」이 함께 나옵니다. 8번은 다음 절의 풀이가 같은 입력에서 seen 을 확인한 횟수입니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-lesson-hash-map.html?embed=1&mode=brute&preset=late-pair" height="940" loading="lazy" title="Two Sum 이중 for 문 비교 미니 데모"></iframe>
<a class="demo-embed-open" href="demo-lesson-hash-map.html?mode=brute&preset=late-pair" target="_blank" rel="noopener">↗ 전체 데모로 열기</a>
</div>

이중 for 문이 짝을 다시 찾는 까닭은 i 를 하나 옮길 때마다 앞에서 본 값을 하나도 기억하지 않기 때문입니다. 지나온 값을 기억해 두면 값마다 짝을 한 번만 확인하면 되는데, 다음 절의 seen 이 그 기록입니다.

## 2. seen 에 적으며 한 번 순회

**값마다 짝(complement) target - num 을 계산해 seen 에 있으면 짝의 인덱스와 지금 인덱스를 돌려줍니다. 짝이 없으면 지금 숫자를 키로, 그 인덱스를 값으로 seen 에 적고 다음 값으로 넘어가므로 배열을 한 번 순회하면 끝납니다.**

지훈 씨는 제가 보인 해시 맵 풀이를 그대로 붙여 넣고 말했습니다. 「요거 순차적으로 설명 좀 해 주세요. 잘 이해가 안 가요.」 값 하나씩 따라가 보겠습니다. 과외에서 쓴 입력은 `nums = [2, 11, 7, 15]`, `target = 9` 이고 답은 0번 칸의 2 와 2번 칸의 7 입니다. 짝(complement)은 지금 값과 더해 target 이 되는 수인 target - num 이라서 2 의 짝은 7, 11 의 짝은 -2 입니다. 아래 표는 값마다 짝을 확인하는 순간의 seen 과 그 값을 처리한 뒤의 seen 을 적었습니다.

| i | num | 짝 9 - num | 확인할 때 seen | seen 에서 찾은 짝 | 한 일 | 그 뒤 seen |
|---|---|---|---|---|---|---|
| 0 | 2 | 7 | `{}` | 없음 | 2 → 0 을 적음 | `{2: 0}` |
| 1 | 11 | -2 | `{2: 0}` | 없음 | 11 → 1 을 적음 | `{2: 0, 11: 1}` |
| 2 | 7 | 2 | `{2: 0, 11: 1}` | 2 → 0 | `[0, 2]` 를 돌려줌 | `{2: 0, 11: 1}` |

seen 에는 확인하는 순간까지 지나온 숫자만 들어 있습니다. i = 2 에서 7 을 볼 때 seen 에는 앞의 2 와 11 만 적혀 있고 짝 2 가 그 가운데 있으므로 `seen[2]` 인 0 과 지금 인덱스 2 로 `[0, 2]` 를 돌려줍니다. 짝을 찾는 순간 함수가 끝나서 7 과 15 는 seen 에 적히지 않습니다.

지훈 씨는 표를 보고 「그럼 2 봤으니 2 적고, 7 봤으니 7 적고, … 이런 건가요?」라고 물었습니다. 반은 맞습니다. 지훈 씨 말대로 2 를 보고 2 를 적는 것은 맞지만 적기 전에 짝을 먼저 확인합니다. 7 은 적기 전의 확인에서 짝 2 를 찾아 끝나므로 seen 에 들어가지 않습니다. seen 에는 값을 보자마자 적지 않고 짝을 확인한 뒤 짝이 없을 때만 적습니다. 아래 코드는 같은 입력에서 확인할 때의 seen 을 찍고 1절의 값 8개에서 seen 을 확인한 횟수를 셉니다. `trace` 는 단계를 찍으려고 이 글이 붙인 인자라 LeetCode 에 낼 때는 지워도 됩니다.

```python
# 하는 일: LeetCode 1 을 seen 한 번 순회로 풀어 [2, 11, 7, 15] 에서 값마다 짝과 확인할 때의 seen 을 찍고, 1절의 값 8개에서 seen 을 확인한 횟수를 이중 for 문의 비교 수와 나란히 찍는다.
from typing import List                                    # LeetCode 화면의 List[int] 주석에 쓴다

# 1단계: 풀이를 만든다
# 짝을 먼저 확인하고 없을 때만 지금 숫자를 적는다.
class Solution:                                            # LeetCode 가 정해 둔 클래스 이름 그대로 둔다
    def twoSum(self, nums: List[int], target: int, trace: bool = False) -> List[int]:   # trace 는 이 글이 붙인 인자
        seen = {}                                          # 지나온 숫자 → 그 숫자의 인덱스
        self.checks = 0                                    # seen 을 확인한 횟수. 세려고 이 글이 붙인 값
        for i, num in enumerate(nums):                     # 앞에서부터 인덱스와 값을 하나씩 꺼낸다
            complement = target - num                      # 지금 값의 짝
            self.checks += 1                               # seen 을 한 번 확인한다
            if trace:                                      # 따라가기를 켰으면
                print(f'i = {i}, num = {num}, 짝 {complement}, 확인할 때 seen {seen}')   # 확인하기 직전 상태
            if complement in seen:                         # 짝이 지나온 숫자 가운데 있으면
                return [seen[complement], i]               # 짝의 인덱스와 지금 인덱스
            seen[num] = i                                  # 없으면 지금 숫자를 키로, 인덱스를 값으로 적는다
        return []                                          # 끝까지 짝이 없으면 빈 목록

# 2단계: [2, 11, 7, 15], target 9 를 따라간다
s = Solution()                                             # 풀이 객체
answer = s.twoSum([2, 11, 7, 15], 9, trace=True)           # 값마다 seen 을 찍으며 푼다
print(f'답 {answer}, seen 확인 {s.checks}번')              # 답과 확인 횟수

# 3단계: 1절의 값 8개에서 확인 횟수를 센다
# 1절의 이중 for 문은 답이 마지막 짝이라 짝 8 × 7 / 2 개를 모두 비교했다.
s = Solution()                                             # 새 풀이 객체
answer = s.twoSum([4, 9, 1, 7, 12, 3, 10, 8], 18)          # 1절과 같은 입력
print(f'답 {answer}, seen 확인 {s.checks}번, 이중 for 문 비교 {8 * 7 // 2}번')   # 두 풀이의 횟수를 나란히

# 출력:
# 2단계 뜻: 확인할 때 seen 에는 앞 칸의 숫자만 있고, 7 에서 짝 2 를 찾아 확인 3번에 끝난다.
# i = 0, num = 2, 짝 7, 확인할 때 seen {}
# i = 1, num = 11, 짝 -2, 확인할 때 seen {2: 0}
# i = 2, num = 7, 짝 2, 확인할 때 seen {2: 0, 11: 1}
# 답 [0, 2], seen 확인 3번
# 3단계 뜻: 같은 입력에서 seen 은 값마다 한 번씩 8번 확인하고 이중 for 문은 28번 비교한다.
# 답 [6, 7], seen 확인 8번, 이중 for 문 비교 28번
```

첫 세 줄이 위 표의 「확인할 때 seen」 열과 같고 seen 확인은 3번입니다. 1절의 값 8개에서는 마지막 값 8 의 짝 10 이 6번 칸에 적혀 있어 8 에서 멈추므로 확인이 8번입니다. 같은 입력에서 이중 for 문이 28번 비교한 것과 달리 seen 은 값마다 한 번씩만 확인했습니다.

아래 데모는 `[2, 11, 7, 15]` 를 한 동작씩 보여 줍니다. 「한 칸」을 처음 누르면 이번 단계 칸에 「i = 0, num = 2. 짝 9 - 2 = 7이 seen 에 없습니다.」가 나오고 seen 칸은 아직 「비어 있음」입니다. 한 번 더 누르면 「seen 에 2 → 0을 적습니다.」와 함께 seen 칸에 2 → 0 이 생깁니다. 「다음 값」은 값 하나의 확인과 적기를 한 번에 넘기는 버튼이라 처음부터 세 번 누르면 단계 2, 4, 5 에서 멈추고 마지막에 결과 칸에 [0, 2] 가 나오며 seen 칸의 2 → 0 이 찾은 짝으로 표시됩니다. 이때 결과 아랫줄은 「seen 확인 3번, 이중 for 문 비교 2번」이라 이 입력에서는 이중 for 문의 횟수가 더 적습니다. 답이 앞쪽 칸이라 이중 for 문이 (0, 1), (0, 2) 두 짝만 비교하고 멈추기 때문입니다. 「입력」에서 nums [4, 9, 1, 7, 12, 3, 10, 8], target 18 을 고르고 「끝까지」를 누르면 결과 아랫줄이 「seen 확인 8번, 이중 for 문 비교 28번」으로 바뀝니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-lesson-hash-map.html?embed=1&mode=seen&preset=two-sum" height="940" loading="lazy" title="Two Sum seen 한 번 순회 미니 데모"></iframe>
<a class="demo-embed-open" href="demo-lesson-hash-map.html?mode=seen&preset=two-sum" target="_blank" rel="noopener">↗ 전체 데모로 열기</a>
</div>

두 입력을 함께 보면 확인 횟수의 차이는 답이 뒤에 있을수록 커집니다. 답이 앞에 있으면 이중 for 문도 금방 끝나지만 코딩테스트는 답이 어디 있든 시간 제한 안에 끝나야 하므로 seen 으로 한 번 순회하는 풀이를 고릅니다. 다음 절은 seen 에 적는 순서를 바꾸면 무엇이 틀리는지 봅니다.

## 3. 확인한 뒤 적는 순서

**seen 에는 짝을 확인한 뒤에 지금 값을 적습니다. 모든 숫자를 먼저 적어 두고 확인하면 지금 값도 이미 seen 에 들어 있어서 짝이 자기 자신으로 나올 수 있습니다. `nums = [3, 2, 4]`, `target = 6` 에서 먼저 다 적으면 틀린 답 `[0, 0]`, 확인한 뒤 적으면 `[1, 2]` 입니다.**

for 문 안에서 숫자를 하나씩 적는 대신 처음에 dict 를 한 번에 만들어 두면 코드가 더 단순해 보입니다. `seen = {num: i for i, num in enumerate(nums)}` 한 줄로 seen 을 다 채우고 for 문에서는 확인만 하는 방식입니다. 과외에서 seen 의 역할을 설명하며 제가 든 이유 가운데 하나가 이 방식이 틀리는 자리였습니다. LeetCode 의 둘째 예제 `nums = [3, 2, 4]`, `target = 6` 에서 그 자리가 보입니다.

먼저 다 적으면 seen 이 `{3: 0, 2: 1, 4: 2}` 로 시작합니다. 0번 칸의 3 을 볼 때 짝은 6 - 3 = 3 이고 seen 에 3 이 있으므로 `[seen[3], 0]` 인 `[0, 0]` 을 돌려줍니다. 0번 칸의 3 을 두 번 쓴 답이라 같은 칸을 두 번 쓸 수 없다는 조건을 어깁니다. 확인한 뒤 적으면 0번 칸의 3 을 볼 때 seen 이 비어 있어 짝이 없고 1번 칸의 2 를 볼 때도 짝 4 가 아직 적혀 있지 않습니다. 2번 칸의 4 를 볼 때 seen 에 짝 2 가 2 → 1 로 적혀 있어 `[1, 2]` 가 나옵니다.

확인한 뒤 적으면 확인하는 순간의 seen 에는 지금 칸보다 앞 칸의 숫자만 있으므로 짝이 자기 자신으로 나올 수 없습니다. 같은 숫자가 두 칸에 있으면 뒤 칸에서 앞 칸의 숫자를 짝으로 찾습니다. LeetCode 의 셋째 예제 `[3, 3]`, `target = 6` 은 0번 칸의 3 을 적은 뒤 1번 칸의 3 이 그 3 을 짝으로 찾아 `[0, 1]` 입니다.

먼저 다 적는 방식도 짝의 인덱스가 지금 인덱스와 다른지 한 번 더 확인하면 맞는 답을 냅니다. 배열을 두 번 순회하는 이 풀이가 아래 코드의 2단계입니다. 확인한 뒤 적는 풀이는 이 인덱스 확인 없이 순서만으로 자기 자신을 거르고 배열도 한 번만 순회합니다.

```python
# 하는 일: [3, 2, 4], target 6 을 먼저 다 적는 풀이, 인덱스를 한 번 더 확인하는 풀이, 확인한 뒤 적는 풀이로 풀어 답을 비교하고, 같은 숫자가 두 칸에 있는 [3, 3] 을 확인한 뒤 적는 풀이로 푼다.

# 1단계: 먼저 다 적는 풀이를 만든다
# 모든 숫자를 seen 에 적은 뒤에 짝을 찾는다. 0번 칸의 3 을 볼 때 짝 3 은 자기 자신이다.
def prefill(nums, target):                                 # 먼저 모두 적고 나서 확인한다
    seen = {num: i for i, num in enumerate(nums)}          # 숫자 → 인덱스를 한 번에 채운다
    print(f'먼저 적은 seen {seen}')                        # 확인을 시작하기 전 seen
    for i, num in enumerate(nums):                         # 앞에서부터 확인한다
        complement = target - num                          # 지금 값의 짝
        if complement in seen:                             # 짝이 seen 에 있으면 자기 자신이어도
            return [seen[complement], i]                   # 그대로 돌려준다
    return []                                              # 짝이 없으면 빈 목록

# 2단계: 인덱스를 한 번 더 확인하는 풀이를 만든다
# 짝의 인덱스가 지금 인덱스와 같으면 자기 자신이라 건너뛴다.
def prefill_checked(nums, target):                         # 먼저 모두 적고, 인덱스까지 확인한다
    seen = {num: i for i, num in enumerate(nums)}          # 숫자 → 인덱스를 한 번에 채운다
    for i, num in enumerate(nums):                         # 앞에서부터 확인한다
        complement = target - num                          # 지금 값의 짝
        if complement in seen and seen[complement] != i:   # 짝이 있고 다른 칸이면
            return [seen[complement], i]                   # 짝의 인덱스와 지금 인덱스
    return []                                              # 짝이 없으면 빈 목록

# 3단계: 확인한 뒤 적는 풀이를 만든다
# 2절의 풀이와 같다. 확인할 때 seen 에는 앞 칸의 숫자만 있다.
def check_then_store(nums, target):                        # 확인하고 나서 적는다
    seen = {}                                              # 빈 seen 으로 시작한다
    for i, num in enumerate(nums):                         # 앞에서부터 하나씩
        complement = target - num                          # 지금 값의 짝
        if complement in seen:                             # 짝이 앞 칸에 있으면
            return [seen[complement], i]                   # 짝의 인덱스와 지금 인덱스
        seen[num] = i                                      # 없으면 지금 숫자를 적는다
    return []                                              # 짝이 없으면 빈 목록

# 4단계: 세 풀이를 돌린다
print(f'먼저 다 적기 {prefill([3, 2, 4], 6)}')             # 0번 칸의 3 을 두 번 쓴다
print(f'인덱스 확인 {prefill_checked([3, 2, 4], 6)}')     # 자기 자신을 건너뛴다
print(f'확인한 뒤 적기 {check_then_store([3, 2, 4], 6)}') # 2번 칸의 4 에서 짝 2 를 찾는다
print(f'[3, 3] 확인한 뒤 적기 {check_then_store([3, 3], 6)}')   # 뒤 칸의 3 이 앞 칸의 3 을 찾는다

# 출력:
# 4단계 뜻: 먼저 다 적으면 0번 칸의 3 을 두 번 쓴 [0, 0] 이 나오고, 다른 두 풀이는 1번 칸과 2번 칸을 찾는다.
# 먼저 적은 seen {3: 0, 2: 1, 4: 2}
# 먼저 다 적기 [0, 0]
# 인덱스 확인 [2, 1]
# 확인한 뒤 적기 [1, 2]
# [3, 3] 확인한 뒤 적기 [0, 1]
```

먼저 다 적는 풀이는 `{3: 0, 2: 1, 4: 2}` 에서 시작해 `[0, 0]` 을 돌려줬습니다. 인덱스를 확인하는 풀이의 `[2, 1]` 은 2번 칸의 4 와 1번 칸의 2 라서 확인한 뒤 적는 풀이의 `[1, 2]` 와 같은 두 칸이고 순서만 다릅니다. 문제가 답의 순서를 따지지 않으므로 둘 다 맞는 답입니다. 마지막 줄의 `[0, 1]` 처럼 같은 숫자 3 이 두 칸에 있어도 확인한 뒤 적는 풀이는 서로 다른 두 칸을 짝으로 찾습니다.

아래 데모의 「미리 다 적기」는 먼저 다 적는 풀이를 한 동작씩 보여 줍니다. 「한 칸」을 세 번 누르면 3 → 0, 2 → 1, 4 → 2 가 차례로 seen 칸에 적히고 결과 아랫줄이 「적은 값 3개, 확인 0번」이 됩니다. 네 번째 「한 칸」에서 이번 단계 칸에 「i = 0, num = 3. 짝 6 - 3 = 3이 seen 에 있어 [0, 0]을 돌려줍니다. 0번 칸의 3을 두 번 쓴 틀린 답입니다.」가 나오고 0번 칸이 두 번 쓴 칸으로 표시되며 결과 칸에 [0, 0] 이 나옵니다. 결과 아랫줄은 「0번 칸의 3을 두 번 썼으므로 틀린 답입니다. 순서대로 확인한 뒤 적으면 [1, 2] 입니다.」입니다. 「seen 한 번 순회」 탭으로 바꿔 「끝까지」를 누르면 같은 입력에서 결과 칸에 [1, 2] 가 나옵니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-lesson-hash-map.html?embed=1&mode=prefill&preset=self-pair" height="940" loading="lazy" title="Two Sum 미리 다 적기 미니 데모"></iframe>
<a class="demo-embed-open" href="demo-lesson-hash-map.html?mode=prefill&preset=self-pair" target="_blank" rel="noopener">↗ 전체 데모로 열기</a>
</div>

데모의 미리 다 적기는 위 코드의 1단계처럼 짝이 seen 에 있는 첫 값에서 멈춥니다. 그래서 늘 틀리지는 않습니다. 미리 다 적기 탭에서 「입력」을 nums [2, 11, 7, 15], target 9 로 고르고 「끝까지」를 누르면 0번 칸의 2 에서 짝 7 을 2번 칸에서 찾아 결과 칸에 [2, 0] 이 나오고 결과 아랫줄은 서로 다른 두 칸이라 맞는 답이라고 적습니다. 반대로 nums [4, 9, 1, 7, 12, 3, 10, 8], target 18 을 고르면 1번 칸의 9 가 짝 9 로 자기 자신을 찾아 [1, 1] 이 나옵니다. 자기 자신이 짝인 값이 진짜 짝보다 앞에 나오면 틀리는 방식이라 입력에 따라 맞기도 하는 이 풀이 대신 순서만으로 늘 맞는 확인한 뒤 적기를 씁니다.

## 4. seen 이 dict 인 이유

**Two Sum 은 짝이 있는지만이 아니라 짝의 인덱스를 돌려 달라고 하므로 seen 은 숫자를 키로, 인덱스를 값으로 적는 dict 입니다. 값마다 하는 일은 뺄셈, 확인, 적기 세 가지이고 셋 다 평균 O(1) 이라 전체 시간 복잡도는 O(N) 입니다.**

지훈 씨가 다음으로 물은 것은 seen 자체였습니다. 「여기서 이 seen 의 역할은 뭐예요? 지나간 숫자들을 적는 게 어떤 의미일까요?」 seen 은 지나온 숫자와 그 숫자가 있던 인덱스를 적어 두는 기록입니다. seen 이 없으면 새 값을 볼 때마다 앞의 값을 처음부터 다시 살펴봐야 하고 그렇게 앞을 다시 살펴보는 풀이가 1절의 이중 for 문입니다.

답이 짝의 값이 아니라 인덱스라서 seen 은 set 이 아니라 dict 입니다. 7 을 볼 때 「2 를 본 적이 있다」만 알면 답을 만들 수 없고 「2 는 0번 칸에 있었다」까지 알아야 `[0, 2]` 를 돌려줍니다. 그래서 찾을 숫자를 키에, 돌려줄 인덱스를 값에 둡니다. 짝이 있는지만 묻는 문제였다면 값이 필요 없어 set 으로 충분하며 8절의 Contains Duplicate 가 그런 문제입니다.

지훈 씨는 이어서 자기 말로 다시 확인했습니다. 「어… 예를 들어 6 이 있어요. 6 봤으면 9 - 6 = 3 이니까 이전에 3 이 있는지 본다, 이거죠? 이렇게 하면 O(N) 이고요?」 맞습니다. 6 을 보면 짝 3 이 seen 에 있는지 봅니다. 있으면 3 의 인덱스와 6 의 인덱스를 돌려주고 없으면 6 과 그 인덱스를 적은 뒤 다음 값으로 넘어갑니다. 값마다 하는 일은 아래 세 가지뿐입니다.

| 하는 일 | 코드 줄 | 한 번에 걸리는 시간 |
|---|---|---|
| 짝 계산 | `complement = target - num` | O(1) |
| 짝 확인 | `complement in seen` | 평균 O(1) |
| 적기 | `seen[num] = i` | 평균 O(1) |

값이 N개면 이 세 가지를 많아야 N번 하므로 시간 복잡도는 O(N) 이고 seen 에는 많아야 N - 1 개가 적히므로 공간 복잡도도 O(N) 입니다. dict 는 키의 해시값(키를 정수 하나로 바꾼 값)으로 저장할 자리인 슬롯(slot)을 계산해 그 슬롯으로 바로 갑니다. 서로 다른 키가 같은 슬롯으로 몰리면 확인 한 번에 여러 슬롯을 살펴보므로 확인과 적기의 O(1) 은 평균입니다. 이 비용은 6절에서 봅니다. 과외에서 제가 dict 확인에 걸리는 시간을 초 단위 숫자로 말했는데 측정한 값이 아니어서 이 글에서는 지우고 다음 절에서 직접 측정합니다.

## 5. key in dict 와 values()

**`x in d` 는 dict 의 키만 봅니다. 값 가운데 x 가 있는지 보는 `x in d.values()` 는 해시값을 쓰지 않고 값을 앞에서부터 하나씩 비교하므로 키 수에 비례해 느려집니다. 그래서 Two Sum 은 찾을 숫자를 키에 둡니다.**

지훈 씨가 물었습니다. 「key in dict 이런 식으로 쓰던데, 이렇게 하면 dict 에 있는 key(value 말고)만 있는지 찾아 주나요?」 맞습니다. `in` 은 왼쪽의 값을 dict 의 키와만 비교하고 값은 보지 않습니다. `x in d.keys()` 도 같은 답을 내는데, CPython 3.9 소스에서 keys 뷰의 `in` 은 dict 의 키 찾기(`PyDict_Contains`)를 그대로 부릅니다([dictobject.c](https://github.com/python/cpython/blob/3.9/Objects/dictobject.c)). CPython 은 python.org 에서 내려받아 쓰는 표준 파이썬 구현입니다.

값을 찾는 `in d.values()` 는 다릅니다. 같은 소스에서 values 뷰는 `in` 을 처리하는 함수 자리(`sq_contains`)를 비워 두었고 그런 객체에 `in` 을 쓰면 파이썬이 값을 하나씩 꺼내 `==` 로 비교합니다. 찾는 값이 앞에 있으면 금방 끝나지만 맨 뒤에 있거나 없으면 모든 값을 비교합니다. 아래 코드는 과외에서 쓴 `{'apple': 1000, 'banana': 2000}` 로 `in` 이 무엇을 보는지 확인하고 키 10,000개와 100,000개인 dict 에서 맨 뒤 키를 찾는 `in d` 와 맨 뒤 값을 찾는 `in d.values()` 의 시간을 측정합니다. 측정한 환경은 Python 3.9.7 이고 시간은 돌릴 때마다 다릅니다.

```python
# 하는 일: 과외에서 쓴 dict 로 in 이 키만 보는 것을 확인하고, 키 10,000개와 100,000개인 dict 에서 맨 뒤 키를 찾는 in d 와 맨 뒤 값을 찾는 in d.values() 의 시간을 측정한다.
import timeit                                              # 짧은 코드를 여러 번 돌려 시간을 측정한다

# 1단계: 키와 값에 in 을 써 본다
# 1000 은 'apple' 의 값이라 키에는 없다.
d = {'apple': 1000, 'banana': 2000}                        # 과외에서 쓴 dict
print(f"'apple' in d        {'apple' in d}")               # 키라 True
print(f"1000 in d           {1000 in d}")                  # 값이라 False
print(f"1000 in d.keys()    {1000 in d.keys()}")           # keys() 도 키만 본다
print(f"1000 in d.values()  {1000 in d.values()}")         # 값을 보려면 values()

# 2단계: 키 수를 10배로 늘리며 두 확인의 시간을 측정한다
# 키는 0 부터 n - 1, 값은 키의 2배다. 맨 뒤 키와 맨 뒤 값을 찾게 해서 values() 가 값을 모두 비교하게 한다.
for n in (10_000, 100_000):                                # 키 1만 개와 10만 개
    big = {k: k * 2 for k in range(n)}                     # 설명을 위해 만든 dict
    env = {'big': big, 'key': n - 1, 'value': (n - 1) * 2} # 측정할 코드가 쓰는 이름
    t_key = timeit.timeit('key in big', globals=env, number=10_000) / 10_000             # 키 확인 한 번의 평균(초)
    t_value = timeit.timeit('value in big.values()', globals=env, number=100) / 100     # 값 확인 한 번의 평균(초)
    print(f'키 {n:>7,}개  in d {t_key * 1e6:.3f}µs  in d.values() {t_value * 1e6:.1f}µs')   # 마이크로초로 찍는다

# 출력 (시간은 돌릴 때마다 다르다):
# 1단계 뜻: in 은 키만 보므로 값 1000 은 values() 로만 찾는다.
# 'apple' in d        True
# 1000 in d           False
# 1000 in d.keys()    False
# 1000 in d.values()  True
# 2단계 뜻: 키가 10배로 늘어도 in d 는 그대로이고 in d.values() 는 10배쯤 늘었다.
# 키  10,000개  in d 0.027µs  in d.values() 74.6µs
# 키 100,000개  in d 0.027µs  in d.values() 765.2µs
```

'apple' 은 키라서 True 이고 1000 은 값이라서 `in d` 와 `in d.keys()` 는 False, `in d.values()` 만 True 입니다. 이번에 측정한 시간은 키가 10배로 늘 때 `in d` 가 0.027µs 그대로였고 `in d.values()` 는 74.6µs 에서 765.2µs 로 10배쯤 늘었습니다. 키 확인은 키 수와 상관없이 해시값으로 슬롯을 계산하고 값 확인은 값을 모두 비교하기 때문입니다.

Two Sum 이 숫자를 값에, 인덱스를 키에 두었다면 짝을 찾을 때마다 `complement in seen.values()` 를 써야 했습니다. 그러면 값마다 지나온 값을 모두 비교하므로 1절의 이중 for 문과 같은 O(N²) 이 됩니다. dict 는 찾을 것을 키에, 찾은 뒤 꺼낼 것을 값에 두고 씁니다. 다음 절은 그 dict 가 키를 넣을 때 치르는 비용을 봅니다.

## 6. 해시의 비용

**dict 는 키를 넣을 때 해시값을 구하고 충돌이 나면 다른 슬롯을 더 살펴보며 테이블이 차면 더 큰 테이블을 만들어 들어 있던 키를 모두 옮깁니다. 빈 슬롯을 남겨 두므로 같은 정수 100개를 담아도 list 의 5배가 넘는 메모리를 씁니다.**

지훈 씨가 물었습니다. 「혹시 해시맵은… 해시 만드는 데 비용이 가장 큰 거죠?」 꼭 그렇지는 않습니다. dict 는 키를 해시값으로 바꾸고 그 값으로 해시 테이블(hash table, 슬롯을 늘어놓은 배열)의 슬롯을 계산해 키를 적습니다. 이 과정에서 드는 비용은 아래 네 가지이고 해시값 계산은 그 가운데 하나입니다.

| 비용 | 드는 때 | 이 글과 시리즈에서 본 곳 |
|---|---|---|
| 해시값 계산 | 키를 넣거나 찾을 때 키의 해시값이 필요함 | 작은 정수 키는 해시값이 그 정수 자신이라 계산할 것이 거의 없음 ([해시와 정렬](post.html?id=algorithm-hash-sort) 편 2절) |
| 충돌 | 서로 다른 키가 같은 슬롯을 가리키면 다른 슬롯을 더 살펴보며 `==` 로 비교함 | 해시값을 일부러 7 로 고정한 키를 담으면 몇백 배 느려짐 (해시와 정렬 편 3절) |
| 테이블 키우기 | 적을 자리가 없을 때 새 키가 오면 더 큰 테이블을 만들어 들어 있던 키를 모두 옮김 | 아래 코드 1~2단계 |
| 메모리 | 빈 슬롯을 남겨 두고 키마다 해시값, 키, 값을 함께 적음 | 아래 코드 3단계 |

과외에서 저는 테이블이 얼마나 차면 몇 배로 키우는지와 키 100개일 때의 슬롯 수를 숫자로 말했는데, 출처가 없는 숫자라 이 글에서는 지우고 CPython 3.9 소스와 측정한 값으로 다시 씁니다. 「기존 데이터를 전부 다시 해싱해서 옮긴다」는 설명도 소스와 다릅니다. [dictobject.c](https://github.com/python/cpython/blob/3.9/Objects/dictobject.c) 에서 테이블의 슬롯 수는 8 부터 시작하는 2의 거듭제곱이고 키는 슬롯 수의 2/3 까지만 적습니다(`USABLE_FRACTION`). 적을 자리가 없을 때 새 키가 오면 들어 있는 키 수 × 3 이상인 가장 작은 2의 거듭제곱으로 테이블을 새로 만듭니다(`GROWTH_RATE`). 지우지 않고 넣기만 하면 이 규칙으로 테이블이 2배씩 커진다고 소스 주석이 적고 있습니다. 키를 옮길 때는 키마다 적어 둔 해시값을 그대로 복사해 새 슬롯을 계산하므로 해시값을 다시 구하지 않습니다.

아래 코드는 이 규칙이 실제 크기와 맞는지 봅니다. 빈 dict 에 정수 키를 하나씩 넣으며 `sys.getsizeof` 가 바뀌는 자리를 찾고 소스의 규칙으로 계산한 자리와 비교합니다. `sys.getsizeof` 는 객체 자체의 크기만 세고 그 안에 든 정수 객체의 크기는 세지 않습니다([sys 문서](https://docs.python.org/3/library/sys.html#sys.getsizeof)). 측정한 환경은 Python 3.9.7 입니다.

```python
# 하는 일: 빈 dict 에 정수 키를 하나씩 넣으며 sys.getsizeof 가 바뀌는 자리를 찍고, CPython 3.9 소스의 키우는 규칙으로 계산한 자리와 같은지 본 뒤, 같은 정수 100개를 담은 list, dict, set 의 크기를 찍는다.
import sys                                                 # getsizeof 로 객체 자체의 크기를 본다

# 1단계: 키를 넣으며 크기가 바뀌는 자리를 찾는다
# 크기가 바뀐 자리가 dict 가 더 큰 테이블을 만들어 키를 옮긴 자리다.
d = {}                                                     # 빈 dict
print(f'빈 dict {sys.getsizeof(d)}바이트')                 # 키를 넣기 전 크기
measured = []                                              # 크기가 바뀐 자리(몇 번째 키에서)
before = sys.getsizeof(d)                                  # 직전 크기
for k in range(1, 200):                                    # 1번째부터 199번째 키까지
    d[k] = k                                               # 키를 하나 넣는다
    after = sys.getsizeof(d)                               # 넣은 뒤 크기
    if after != before:                                    # 크기가 바뀌었으면
        measured.append(k)                                 # 그 자리를 적는다
        print(f'{k:>3}번째 키  {before:>5,} → {after:>5,}바이트')   # 바뀐 자리와 전후 크기
        before = after                                     # 다음 비교의 기준

# 2단계: 소스의 규칙으로 같은 자리를 계산한다
# 슬롯 수의 2/3 까지만 키를 적는다. 자리가 없을 때 새 키가 오면 키 수 × 3 이상인 가장 작은 2의 거듭제곱(최소 8)으로 새로 만든다.
rule, used, room, moved = [], 0, 0, 0                      # 계산한 자리, 들어 있는 키, 남은 자리, 옮긴 키 합계
for k in range(1, 200):                                    # 1단계와 같은 199개
    if room == 0:                                          # 적을 자리가 없으면 새 테이블을 만든다
        size = 8                                           # 가장 작은 테이블의 슬롯 수
        while size < used * 3:                             # 키 수 × 3 이상이 될 때까지
            size *= 2                                      # 2배씩 늘린다
        rule.append(k)                                     # 테이블을 새로 만든 자리
        moved += used                                      # 들어 있던 키를 모두 옮긴다
        room = size * 2 // 3 - used                        # 새 테이블에 남은 자리
        print(f'{k:>3}번째 키  슬롯 {size:>3}개, 키 {size * 2 // 3:>3}개까지, 옮긴 키 {used:>3}개')   # 새 테이블의 크기
    room -= 1                                              # 이번 키가 자리 하나를 쓴다
    used += 1                                              # 들어 있는 키가 하나 는다
print(f'측정한 자리와 같은가 {rule == measured}, 키 199개를 넣는 동안 옮긴 키 {moved}개')   # 두 자리 목록을 비교한다

# 3단계: 같은 정수 100개를 세 자료구조에 담는다
nums = range(100)                                          # 0 부터 99 까지
print(f'키 100개  list {sys.getsizeof(list(nums)):,}바이트  dict {sys.getsizeof({n: n for n in nums}):,}바이트  set {sys.getsizeof(set(nums)):,}바이트')   # 세 자료구조의 크기

# 출력:
# 1단계 뜻: 빈 dict 는 64바이트이고 크기는 1, 6, 11, 22, 43, 86, 171번째 키에서 바뀐다.
# 빈 dict 64바이트
#   1번째 키     64 →   232바이트
#   6번째 키    232 →   360바이트
#  11번째 키    360 →   640바이트
#  22번째 키    640 → 1,176바이트
#  43번째 키  1,176 → 2,272바이트
#  86번째 키  2,272 → 4,696바이트
# 171번째 키  4,696 → 9,312바이트
# 2단계 뜻: 소스의 규칙으로 계산한 자리가 측정한 자리와 같고, 슬롯 수는 8 에서 2배씩 커진다.
#   1번째 키  슬롯   8개, 키   5개까지, 옮긴 키   0개
#   6번째 키  슬롯  16개, 키  10개까지, 옮긴 키   5개
#  11번째 키  슬롯  32개, 키  21개까지, 옮긴 키  10개
#  22번째 키  슬롯  64개, 키  42개까지, 옮긴 키  21개
#  43번째 키  슬롯 128개, 키  85개까지, 옮긴 키  42개
#  86번째 키  슬롯 256개, 키 170개까지, 옮긴 키  85개
# 171번째 키  슬롯 512개, 키 341개까지, 옮긴 키 170개
# 측정한 자리와 같은가 True, 키 199개를 넣는 동안 옮긴 키 333개
# 3단계 뜻: 같은 정수 100개를 담아도 dict 는 list 의 5배가 넘고 set 은 그보다 크다.
# 키 100개  list 856바이트  dict 4,696바이트  set 8,408바이트
```

빈 dict 는 64바이트이고 크기는 1, 6, 11, 22, 43, 86, 171번째 키를 넣을 때 바뀌었습니다. 소스의 규칙으로 계산한 자리도 이와 같습니다. 첫 키에서 슬롯 8개짜리 테이블을 만들고 8 × 2 / 3 의 소수점을 버린 5개까지 적은 뒤 6번째 키에서 키 5개 × 3 = 15 이상인 16슬롯으로 키우는 식입니다. 키가 100개면 86번째 키에서 만든 256슬롯 테이블에 들어 있습니다.

테이블을 새로 만들 때마다 들어 있던 키를 모두 옮기지만 테이블이 2배씩 커지므로 옮기는 일은 갈수록 드물어집니다. 키 199개를 넣는 동안 옮긴 키는 모두 333개로 넣은 키 수의 2배를 넘지 않습니다. 테이블이 2배씩 커지면 키를 N개 넣는 동안 옮긴 키를 다 더해도 N 에 비례합니다. 그래서 키 하나를 넣는 비용의 평균은 상수로 남습니다. 이것을 amortized O(1) 이라고 부릅니다. 해시와 정렬 편 3절의 접기에도 같은 이야기가 있습니다.

메모리는 3단계의 키 100개에서 list 가 856바이트, dict 가 4,696바이트입니다. dict 는 키마다 해시값, 키, 값 세 가지를 적고 슬롯의 1/3 이상을 비워 두므로 같은 정수 100개를 담아도 list 의 5배가 넘습니다. 해시 맵은 이 메모리로 확인 한 번을 평균 O(1) 로 만드는 자료구조입니다. 과외에서 저는 추가 메모리를 쓸 수 없으면 배열을 정렬한 뒤 투 포인터로 푼다고 덧붙였는데, 그 방법과 Two Sum 에 쓸 때 드는 메모리는 다음 글인 투 포인터 편에서 다룹니다. set 이 8,408바이트로 dict 보다 큰 까닭은 다음 절에서 봅니다.

## 7. set 과 dict

**set 과 dict 는 둘 다 해시 테이블이라 `in` 확인이 평균 O(1) 입니다. 있는지만 알면 되면 set 을, 키마다 인덱스나 깊이 같은 값을 함께 적어야 하면 dict 를 씁니다. 어느 쪽이 메모리를 덜 쓰는지는 키 수에 따라 바뀌므로 고르는 기준이 되지 않습니다.**

BFS 를 배울 때 지훈 씨가 물었습니다. 「visited = set() 이렇게 썼는데, 이것도 해시라고 했잖아요? 그럼 dict 를 써도 되나요?」 됩니다. set 과 dict 는 둘 다 키의 해시값으로 슬롯을 계산하는 해시 테이블이라 `(r, c) in visited` 가 어느 쪽이든 평균 O(1) 입니다. set 은 방문했다는 사실만 적고 dict 는 칸마다 깊이 같은 값을 함께 적으므로 깊이가 필요하면 dict 를 씁니다. visited 가 필요한 경우와 필요 없는 경우는 [BFS](post.html?id=algorithm-lesson-bfs) 편 5절에 경우마다 정리했습니다.

과외에서 저는 set 을 「Value 를 버리고 Key 만 남긴 dict」라고 설명했습니다. 같은 해시 테이블 원리를 쓴다는 뜻으로는 맞지만 CPython 은 set 을 dict 와 다른 파일인 [setobject.c](https://github.com/python/cpython/blob/3.9/Objects/setobject.c) 에 따로 구현합니다. 그 파일의 머리 주석은 Lib/sets.py 와 dictobject.c 에서 가져와 만들었다고 적고 있습니다. set 의 슬롯은 키와 해시값 두 가지만 담습니다([setobject.h](https://github.com/python/cpython/blob/3.9/Include/setobject.h) 의 `setentry`). dict 는 키마다 해시값, 키, 값 세 가지를 적는 배열과 그 배열의 몇 번째에 적었는지만 담는 해시 테이블을 따로 둡니다(dictobject.c 의 `dk_entries` 와 `dk_indices`).

과외에서 함께 말한 「set 은 Value 가 없어 메모리가 더 절약된다」는 측정해 보면 키 수에 따라 다릅니다. 아래 코드는 BFS 편 5절 미로의 앞 두 칸으로 set 과 dict 의 `in` 을 비교하고 같은 정수 키를 100개, 1,000개, 10,000개 담은 set 과 dict 의 크기를 측정합니다. 측정한 환경은 Python 3.9.7 입니다.

```python
# 하는 일: 방문한 칸을 set 과 dict 에 적어 in 확인을 비교하고, 키 수를 100, 1,000, 10,000개로 바꾸며 set 과 dict 의 크기를 측정한다.
import sys                                                 # getsizeof 로 객체 자체의 크기를 본다

# 1단계: 방문한 칸을 set 과 dict 에 적는다
# BFS 편 5절 미로의 앞 두 칸이다. set 은 방문 여부만, dict 는 칸마다 깊이를 함께 적는다.
visited_set = {(0, 0), (0, 1)}                             # 방문한 칸
visited_dict = {(0, 0): 0, (0, 1): 1}                      # 방문한 칸 → 깊이
for cell in [(0, 1), (1, 1)]:                              # 방문한 칸과 아직 안 간 칸
    print(f'{cell} in set {cell in visited_set}, in dict {cell in visited_dict}, dict 에 적은 깊이 {visited_dict.get(cell)}')   # set 과 dict 의 답과 깊이

# 2단계: 키 수를 바꾸며 set 과 dict 의 크기를 비교한다
# 같은 정수 키를 담는다. dict 의 값은 키와 같은 정수다.
for n in (100, 1_000, 10_000):                             # 키 100개, 1,000개, 10,000개
    s, d = set(range(n)), {k: k for k in range(n)}         # 같은 키를 담은 set 과 dict
    size_s, size_d = sys.getsizeof(s), sys.getsizeof(d)    # 객체 자체의 크기(바이트)
    print(f'키 {n:>6,}개  set {size_s:>7,}바이트  dict {size_d:>7,}바이트  더 작은 쪽 {"set" if size_s < size_d else "dict"}')   # 두 크기와 작은 쪽

# 출력:
# 1단계 뜻: set 과 dict 의 in 은 같은 답을 내고, 깊이는 dict 에서만 꺼낸다.
# (0, 1) in set True, in dict True, dict 에 적은 깊이 1
# (1, 1) in set False, in dict False, dict 에 적은 깊이 None
# 2단계 뜻: 키 100개와 10,000개에서는 dict 가, 1,000개에서는 set 이 작다.
# 키    100개  set   8,408바이트  dict   4,696바이트  더 작은 쪽 dict
# 키  1,000개  set  32,984바이트  dict  36,960바이트  더 작은 쪽 set
# 키 10,000개  set 524,504바이트  dict 295,000바이트  더 작은 쪽 dict
```

set 과 dict 의 `in` 은 같은 답을 내고 dict 만 깊이 1 을 꺼낼 수 있습니다. 크기는 키 100개와 10,000개에서 set 이 dict 보다 크고 1,000개에서는 set 이 작은데, 두 자료구조가 테이블을 키우는 규칙이 다르기 때문입니다. setobject.c 의 set 은 슬롯의 3/5 쯤이 차면 키 수 × 4 보다 큰 가장 작은 2의 거듭제곱으로 키웁니다(키가 50,000개를 넘으면 × 2). dict 는 6절처럼 슬롯의 2/3 가 차면 키 수 × 3 이상으로 키웁니다. set 은 빈 슬롯을 더 많이 남기고 dict 는 키마다 적는 것이 하나 더 많아서 어느 쪽이 큰지가 키 수마다 바뀝니다.

그래서 set 과 dict 는 메모리가 아니라 무엇을 적어야 하는지로 고릅니다. 방문 여부나 중복 여부만 필요하면 set 이고 Two Sum 의 인덱스나 BFS 의 깊이처럼 키마다 꺼낼 값이 있으면 dict 입니다. 8절과 9절은 이 기준으로 자료구조를 하나씩 골라 LeetCode 문제를 풉니다.

## 8. Contains Duplicate (LeetCode 217, Easy)

**값을 앞에서부터 하나씩 보며 그 값이 이미 set 에 있으면 True 를 돌려주고 없으면 set 에 넣습니다. 끝까지 없으면 모든 값이 서로 다르므로 False 입니다.**

[LeetCode 217. Contains Duplicate](https://leetcode.com/problems/contains-duplicate/) 는 정수 배열에서 같은 값이 두 번 이상 나오면 True, 모든 값이 서로 다르면 False 를 돌려 달라고 합니다. 인덱스를 묻지 않고 앞에서 본 값인지만 알면 되므로 7절의 기준대로 set 을 씁니다. Two Sum 이 「짝이 seen 에 있나」를 본 자리에서 「지금 값이 seen 에 있나」를 보는 문제라 순서가 같습니다.

1. 빈 set `seen` 을 만듭니다.
2. 값을 앞에서부터 하나씩 봅니다.
3. 지금 값이 이미 `seen` 에 있으면 두 번째로 나온 것이므로 True 를 돌려줍니다.
4. 없으면 `seen` 에 넣고 다음 값으로 넘어갑니다. 끝까지 돌면 False 를 돌려줍니다.

`len(set(nums)) != len(nums)` 한 줄로도 같은 답이 나옵니다. 다만 이 한 줄은 중복이 맨 앞에 있어도 값을 모두 set 에 넣고 나서 비교합니다. 아래 코드는 LeetCode 의 세 예제를 두 풀이로 돌리고 순서대로 넣는 풀이가 몇 번째 값에서 멈췄는지 셉니다.

```python
# 하는 일: LeetCode 217 을 set 으로 풀어 세 예제에서 답과 멈출 때까지 본 값 수를 찍고, 한 줄 풀이 len(set(nums)) != len(nums) 와 답이 같은지 본다.
from typing import List                                    # LeetCode 화면의 List[int] 주석에 쓴다

# 1단계: 풀이를 만든다
# 이미 본 값은 seen 에 있다. 지금 값이 seen 에 있으면 두 번째로 나온 것이다.
class Solution:                                            # LeetCode 가 정해 둔 클래스 이름 그대로 둔다
    def containsDuplicate(self, nums: List[int]) -> bool:  # LeetCode 가 부르는 함수
        seen = set()                                       # 지나온 값. 인덱스가 필요 없어 set 이다
        self.looked = 0                                    # 본 값의 수. 세려고 이 글이 붙인 값
        for num in nums:                                   # 앞에서부터 하나씩
            self.looked += 1                               # 값 하나를 본다
            if num in seen:                                # 앞에서 본 값이면
                return True                                # 중복이 있다
            seen.add(num)                                  # 처음 본 값이면 넣는다
        return False                                       # 끝까지 중복이 없다

# 2단계: 세 예제를 두 풀이로 돌린다
for nums in ([1, 2, 3, 1], [1, 2, 3, 4], [1, 1, 1, 3, 3, 4, 3, 2, 4, 2]):   # LeetCode 의 세 예제
    s = Solution()                                         # 풀이 객체
    answer = s.containsDuplicate(nums)                     # 순서대로 넣는 풀이
    one_line = len(set(nums)) != len(nums)                 # set 으로 줄어든 개수를 비교하는 한 줄 풀이
    print(f'{nums} → {answer}, 값 {len(nums)}개 가운데 {s.looked}개를 봄, 한 줄 풀이 {one_line}')   # 두 답과 본 값 수

# 출력:
# 2단계 뜻: 두 풀이의 답이 같고, 순서대로 넣는 풀이는 중복을 만난 자리에서 멈춘다.
# [1, 2, 3, 1] → True, 값 4개 가운데 4개를 봄, 한 줄 풀이 True
# [1, 2, 3, 4] → False, 값 4개 가운데 4개를 봄, 한 줄 풀이 False
# [1, 1, 1, 3, 3, 4, 3, 2, 4, 2] → True, 값 10개 가운데 2개를 봄, 한 줄 풀이 True
```

세 예제의 답은 True, False, True 이고 한 줄 풀이도 같습니다. 첫 예제는 넷째 값 1 에서 0번 칸의 1 을 찾아 멈췄고 셋째 예제는 둘째 값에서 바로 멈춰 값 10개 가운데 2개만 봤습니다. 둘째 예제는 중복이 없어 끝까지 봤습니다. 시간 복잡도는 값마다 set 확인과 넣기가 한 번씩이라 O(N), 공간 복잡도는 set 에 많아야 N개를 넣으므로 O(N) 입니다.

## 9. Group Anagrams (LeetCode 49, Medium)

**같은 글자를 같은 개수만큼 쓴 문자열은 글자를 정렬하면 같은 문자열이 됩니다. 그 정렬한 문자열을 dict 의 키로 두고 원래 문자열을 그 키의 목록에 모읍니다. list 는 dict 의 키가 될 수 없으므로 정렬한 글자를 `''.join` 으로 문자열로 만들거나 tuple 로 바꿉니다.**

[LeetCode 49. Group Anagrams](https://leetcode.com/problems/group-anagrams/) 는 문자열 목록을 주고 애너그램(같은 글자를 같은 개수만큼 써서 순서만 바꾼 문자열)끼리 모은 그룹의 목록을 돌려 달라고 합니다. 그룹의 순서와 그룹 안 문자열의 순서는 상관없습니다. 'eat', 'tea', 'ate' 는 모두 a, e, t 를 한 번씩 쓴 애너그램입니다.

같은 그룹인지 알려면 문자열마다 그룹을 대표하는 값이 있어야 합니다. 글자를 정렬하면 'eat' 과 'tea' 와 'ate' 가 모두 'aet' 가 되므로 이 값을 키로 두면 dict 가 키마다 문자열 목록을 모아 줍니다. Two Sum 의 seen 이 숫자를 키로 인덱스를 꺼냈듯이 이 문제는 정렬한 글자를 키로 문자열 목록을 꺼냅니다.

1. 키가 처음 나오면 빈 list 를 만들어 주는 `defaultdict(list)` 를 둡니다.
2. 문자열마다 `sorted(s)` 로 글자를 정렬하고 `''.join` 으로 이어 키를 만듭니다. `sorted` 가 돌려주는 list 는 키가 될 수 없어 문자열로 바꿉니다.
3. 그 키의 목록 끝에 원래 문자열을 붙입니다.
4. dict 의 값들을 목록으로 돌려줍니다.

```python
# 하는 일: LeetCode 49 를 정렬한 글자를 키로 쓰는 dict 로 풀어 첫 예제의 키와 세 예제의 그룹을 찍고, list 를 키로 넣으면 TypeError 가 나는 것을 본다.
from collections import defaultdict                       # 없는 키를 처음 쓰면 빈 값을 만들어 주는 dict
from typing import List                                    # LeetCode 화면의 List[str] 주석에 쓴다

# 1단계: 풀이를 만든다
# 애너그램끼리는 글자를 정렬하면 같은 문자열이 된다. 그 문자열을 키로 원래 문자열을 모은다.
class Solution:                                            # LeetCode 가 정해 둔 클래스 이름 그대로 둔다
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:   # LeetCode 가 부르는 함수
        groups = defaultdict(list)                         # 정렬한 글자 → 원래 문자열 목록
        for s in strs:                                     # 문자열을 앞에서부터 하나씩
            key = ''.join(sorted(s))                       # 'eat' → ['a', 'e', 't'] → 'aet'
            groups[key].append(s)                          # 그 키의 목록 끝에 붙인다
        return list(groups.values())                       # 키를 처음 넣은 순서대로 그룹을 꺼낸다

# 2단계: 첫 예제의 키를 본다
strs = ["eat", "tea", "tan", "ate", "nat", "bat"]          # LeetCode 의 첫 예제
print({s: ''.join(sorted(s)) for s in strs})               # 문자열마다 만든 키

# 3단계: 세 예제를 돌린다
print(Solution().groupAnagrams(strs))                      # 그룹 3개
print(Solution().groupAnagrams([""]))                      # 빈 문자열 하나
print(Solution().groupAnagrams(["a"]))                     # 한 글자 하나

# 4단계: list 를 키로 넣어 본다
# 키는 해시값을 구할 수 있어야 한다. 바꿀 수 있는 list 는 해시값이 없다.
try:                                                       # 오류가 나도 블록이 끝까지 돌게 잡는다
    bad = {['a']: 1}                                       # list 를 키로 넣는다
except TypeError as e:                                     # 해시값이 없으면 TypeError 다
    print(f'TypeError: {e}')                               # 오류 내용을 찍는다
print({tuple(sorted('eat')): 1})                           # tuple 은 바꿀 수 없어 키가 된다

# 출력:
# 2단계 뜻: 애너그램끼리 같은 키가 되어 키는 'aet', 'ant', 'abt' 세 가지다.
# {'eat': 'aet', 'tea': 'aet', 'tan': 'ant', 'ate': 'aet', 'nat': 'ant', 'bat': 'abt'}
# 3단계 뜻: 키마다 그룹 하나가 되고, 빈 문자열과 한 글자도 그룹 하나씩이다.
# [['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]
# [['']]
# [['a']]
# 4단계 뜻: list 는 해시값이 없어 키가 되지 못하고 tuple 은 키가 된다.
# TypeError: unhashable type: 'list'
# {('a', 'e', 't'): 1}
```

첫 줄을 보면 'eat', 'tea', 'ate' 의 키는 모두 'aet' 이고 'tan' 과 'nat' 의 키는 'ant', 'bat' 의 키는 'abt' 입니다. 그래서 그룹이 3개이고 dict 는 키를 처음 넣은 순서를 지키므로 'aet' 그룹이 먼저 나옵니다. LeetCode 예시 답과 그룹 순서가 달라도 순서를 따지지 않으므로 맞는 답입니다. 빈 문자열은 정렬해도 빈 문자열이라 키 '' 하나의 그룹이 됩니다. 넷째 단계에서 list 를 키로 넣자 `unhashable type: 'list'` 가 났고 같은 글자를 tuple 로 바꾸면 `('a', 'e', 't')` 가 키로 들어갑니다. 무엇을 키로 쓸 수 있는지는 해시와 정렬 편 4절에 더 있습니다.

문자열이 N개이고 가장 긴 문자열이 K글자면 문자열마다 정렬에 O(K log K) 가 들어 시간 복잡도는 O(N K log K) 이고 dict 에 모든 문자열과 키를 적으므로 공간 복잡도는 O(N K) 입니다.

## 한눈 정리

| 문제 | 자료구조 | 키 | 값 | 확인한 뒤 하는 일 | 이 글의 예 |
|---|---|---|---|---|---|
| Two Sum (1) | dict `seen` | 지나온 숫자 | 그 숫자의 인덱스 | 짝이 없을 때만 지금 숫자를 적음 | `[2, 11, 7, 15]`, 9 → `[0, 2]` |
| Contains Duplicate (217) | set `seen` | 지나온 값 | 없음 | 지금 값이 없을 때만 넣음 | `[1, 2, 3, 1]` → True |
| Group Anagrams (49) | dict `groups` | 글자를 정렬한 문자열 | 그 키의 문자열 목록 | 목록 끝에 지금 문자열을 붙임 | 그룹 3개 |
| BFS 의 visited | set 또는 dict | 칸 (r, c) | 없음 또는 깊이 | 큐에 넣을 때 적음 | BFS 편 5절 |

네 경우 모두 지금 값을 볼 때 자료구조를 먼저 확인하고 그다음에 적습니다. 키에는 찾을 것을 두고 찾은 뒤 꺼낼 것이 있으면 dict 의 값에 둡니다. 이중 for 문은 짝 N(N-1)/2 개를 비교하고 seen 은 많아야 N번 확인합니다.

## 헷갈리기 쉬운 점

- **Two Sum 은 슬라이딩 윈도우가 아닙니다.** 지훈 씨가 「혹시 이게 슬라이딩 윈도우 방식인 거예요?」라고 물었습니다. 아닙니다. 슬라이딩 윈도우는 붙어 있는 구간을 한 칸씩 밀며 보는 방법인데 Two Sum 의 두 값은 붙어 있지 않아도 됩니다. `[2, 5, 8, 7]`, target 9 의 짝은 0번 칸의 2 와 3번 칸의 7 이라 사이에 두 칸이 있습니다. 슬라이딩 윈도우는 이 시리즈의 슬라이딩 윈도우 편에서 다룹니다.
- **이중 for 문의 비교 수는 N² 이 아니라 N(N-1)/2 입니다.** i < j 인 짝만 비교하므로 값 10,000개면 49,995,000번입니다. 시간 복잡도는 둘 다 O(N²) 입니다.
- **seen 에는 확인한 뒤에 적습니다.** 먼저 다 적으면 `[3, 2, 4]`, target 6 에서 0번 칸의 3 이 자기 자신과 짝이 되어 `[0, 0]` 이 나옵니다.
- **`x in d` 는 키만 봅니다.** 값을 찾는 `x in d.values()` 는 값을 하나씩 비교해서 키 수에 비례해 느려집니다. 찾을 것을 키에 둡니다.
- **dict 확인의 O(1) 은 평균입니다.** 서로 다른 키가 같은 슬롯으로 몰리면 확인 한 번이 여러 슬롯을 살펴봅니다.
- **테이블을 키울 때 해시값을 다시 구하지 않습니다.** CPython 3.9 의 dict 는 적어 둔 해시값을 복사해 새 슬롯을 계산합니다. 테이블이 2배씩 커지므로 옮기는 비용의 평균은 상수입니다.
- **set 이 dict 보다 늘 작지는 않습니다.** 키 100개에서 set 8,408바이트, dict 4,696바이트였습니다. 메모리가 아니라 적을 값이 있는지로 고릅니다.
- **list 는 dict 의 키가 될 수 없습니다.** `sorted` 가 돌려준 list 는 `''.join` 으로 문자열로 만들거나 tuple 로 바꿔 키로 씁니다.

## 더 깊이 보기

- 해시값으로 슬롯을 계산하는 그림, 충돌이 심할 때 느려지는 정도, 키가 될 수 있는 것과 Counter, defaultdict 로 세는 일은 [해시와 정렬](post.html?id=algorithm-hash-sort) 편 2~4절과 6절에 있습니다.
- 시간 복잡도를 직접 측정해 보는 방법은 [복잡도와 배열 순회](post.html?id=algorithm-complexity-array) 편에 있습니다.
- visited 를 set 으로 둘 때와 dict 로 둘 때, visited 가 필요한 경우는 [BFS](post.html?id=algorithm-lesson-bfs) 편 5절에 있습니다.
- 이 글의 세 데모는 [해시 맵: seen 으로 짝 찾기와 이중 for 문](demo-lesson-hash-map.html) 한 페이지에서 모드와 입력을 바꿔 가며 볼 수 있습니다.
- 예시 문제는 [Two Sum](https://leetcode.com/problems/two-sum/)(1), [Contains Duplicate](https://leetcode.com/problems/contains-duplicate/)(217), [Group Anagrams](https://leetcode.com/problems/group-anagrams/)(49) 입니다.
- dict 와 set 의 CPython 3.9 구현은 [dictobject.c](https://github.com/python/cpython/blob/3.9/Objects/dictobject.c) 와 [setobject.c](https://github.com/python/cpython/blob/3.9/Objects/setobject.c) 에 있습니다.
