알고리즘 트랙의 앞선 글들로 배열, 해시, 정렬, 이분 탐색, 스택, 트리, 힙, 그래프, DP, 그리디까지 연습을 마치고 모의 면접을 봤는데, 첫 문제가 「연결 리스트를 뒤집으세요」였습니다. 노드의 `next` 를 바꾸는 순서를 한 번 헷갈리자 리스트 뒤쪽이 사라졌고, 고치는 데 10분을 썼습니다.

돌아보면 그 문제는 어렵지 않았고, 처음 보는 모양이었을 뿐입니다. 연결 리스트, 문자열 다루기, Union-Find, Trie, 구간 문제는 풀이 길이가 20줄 안팎이지만 손에 익지 않으면 포인터 순서나 경계 시각 같은 작은 자리에서 시간이 새어 나갑니다.

**시리즈에서 다루지 않은 다섯 가지 구조는 각각 어떤 문제에 쓰이고, 손에 익혀 둘 코드는 무엇일까요?**

이 글은 다섯 가지를 절 하나씩 다루며, 절마다 지어낸 광고 데이터로 돌려 본 코드와 출력을 붙였습니다. 다섯 가지 모두 표준 라이브러리만으로 30줄 안쪽에 쓸 수 있어서, 한 번 손으로 짜 두면 면접에서 구조를 떠올리는 시간을 풀이와 설명에 쓸 수 있습니다.

> **한 줄 요약:** 연결 리스트는 포인터 두 개(prev 와 cur, 또는 한 칸과 두 칸씩 가는 둘)로, 문자열은 Counter 와 슬라이딩 윈도우와 join 으로, 연결된 그룹은 Union-Find 로, 접두어는 Trie 나 정렬과 bisect 로, 구간은 시작 정렬과 사건 정렬로 풉니다. 이 글의 예에서 두 기법이 없는 Union-Find 는 찾기 1,000번에 499,500걸음을 걸었고, 크기 기준 합치기를 넣으면 999걸음으로 줄었습니다.

> **골라 읽는 법** — 절이 여덟 개인 글입니다.
>
> - 왜 이 다섯 가지인가 → 1절
> - 연결 리스트 → 2절
> - 문자열 → 3~4절
> - Union-Find, Trie → 5~6절
> - 구간 → 7절
> - 지문 신호로 구조 고르기 → 8절

---

## 1. 다섯 가지 구조와 고른 까닭

**이 다섯 가지는 앞선 일곱 편의 자료구조 위에 규칙 하나를 더한 모양이라, 그 규칙만 손에 익히면 됩니다.**

앞선 글들이 다룬 것은 배열, 해시, 정렬, 이분 탐색, 스택, 트리, 힙, 그래프, DP, 그리디입니다. 이 글의 다섯 가지는 그것들과 따로 떨어진 개념이 아니라, 연결 리스트는 배열 대신 노드를 포인터로 잇고, Union-Find 는 트리를 「대표 찾기」에만 쓰고, Trie 는 트리의 가지를 글자로 정하고, 구간 문제는 정렬 뒤에 한 번 순회하는 모양입니다. 그래서 풀이의 뼈대는 익숙하고, 틀리는 자리는 대개 그 구조에만 있는 작은 규칙(포인터를 바꾸는 순서, 같은 시각의 시작과 끝)입니다.

이 다섯 가지를 고른 것은 이 글의 판단입니다. LeetCode 의 주제 태그에 Linked List, String, Union Find, Trie 가 따로 있고 구간 합치기(Merge Intervals) 같은 문제가 면접 준비 문제 목록에 자주 보여서 골랐지만, 회사마다 어떤 유형을 내는지 집계한 공개 자료는 찾지 못했습니다.

| 절 | 구조 | 이 글의 가상 데이터 | 손에 익힐 규칙 |
|---|---|---|---|
| 2 | 연결 리스트 | 광고 5개를 거친 클릭 경로 | 포인터를 바꾸기 전에 다음 노드를 받아 둔다 |
| 3~4 | 문자열 | 검색어와 광고 ID 조각 2만 개 | 창 왼쪽 끝은 앞으로만 간다, 붙이기는 마지막에 한 번 |
| 5 | Union-Find | 기기를 같이 쓴 계정 8개 | 작은 그룹을 큰 그룹 밑에 붙인다 |
| 6 | Trie | 검색 키워드 7개 | 낱말이 끝나는 노드에 표시를 둔다 |
| 7 | 구간 | 광고 노출 구간 6개 | 같은 시각이면 끝을 먼저 뺀다 |

표와 코드의 숫자는 모두 이 글이 설명을 위해 지어낸 가상 데이터이고, 코드는 Python 3.9 표준 라이브러리로 돌린 출력을 그대로 붙였습니다.

## 2. 연결 리스트: 뒤집기, 가운데, 순환

**연결 리스트 문제는 대개 포인터 두 개로 풉니다. 뒤집기는 prev 와 cur, 가운데와 순환은 한 칸씩 가는 slow 와 두 칸씩 가는 fast 입니다.**

연결 리스트(linked list)는 값과 다음 노드를 가리키는 포인터 `next` 를 든 노드들이 사슬처럼 이어진 구조이고, 배열과 달리 인덱스로 바로 갈 수 없어서 맨 앞(head)부터 `next` 를 따라가야 합니다. 그래서 「가운데 원소」나 「끝에서 k 번째」를 구하려면 길이를 먼저 세는 한 번과 다시 가는 한 번, 두 번을 돌기 쉬운데, 두 포인터를 다른 속도로 움직이면 한 번에 끝납니다. 면접 편집기가 `ListNode` 를 주지 않으면 세 줄짜리 클래스를 직접 써야 하는데, 그 경우는 [풀이 템플릿](post.html?id=algorithm-solving-steps) 편 8절에서 다뤘으므로 여기서는 같은 필드 이름(`val`, `next`)을 그대로 씁니다.

뒤집기에서 틀리는 자리는 순서 하나입니다. `cur.next = prev` 로 화살표를 바꾸는 순간 `cur` 뒤의 노드로 가는 길이 사라지므로, 바꾸기 전에 `nxt = cur.next` 로 받아 두어야 하고, 이 줄을 빠뜨리면 리스트가 첫 노드에서 끊깁니다. 가운데 찾기는 fast 가 두 칸씩 가서 끝에 닿을 때 slow 가 절반을 왔다는 성질을 쓰고, 순환 찾기는 순환 안에서는 fast 가 slow 를 한 바퀴 돌아 따라잡는다는 성질을 씁니다. 이 순환 찾기를 플로이드(Floyd)의 순환 탐지라고 부르고, 거북이와 토끼 알고리즘이라고도 합니다.

아래 블록은 클릭 경로 `ad1 → ad2 → ad3 → ad4 → ad5` 를 리스트로 만들어 세 가지를 차례로 돌리고, 마지막에 `ad5` 의 `next` 를 `ad3` 에 이어 순환을 만듭니다.

```python
# 하는 일: 광고 5개를 거친 가상 클릭 경로를 연결 리스트로 만들고, 뒤집기, 가운데 찾기, 순환 찾기를 한다.
# 1단계: 노드 클래스와 도우미를 만든다
# 노드는 값 val 과 다음 노드 next 만 든다. build 는 목록을 노드 사슬로 잇고, show 는 사슬을 화살표로 찍는다.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val, self.next = val, next

def build(vals):
    head = None
    for v in reversed(vals):
        head = ListNode(v, head)
    return head

def show(head):
    out = []
    while head:
        out.append(head.val)
        head = head.next
    return ' -> '.join(out) if out else '(빈 목록)'

# 2단계: 뒤집기
# prev, cur 두 포인터로 화살표 방향을 하나씩 바꾼다. 바꾸기 전에 다음 노드를 nxt 에 받아 두어야 사슬이 끊기지 않는다.
def reverse(head):
    prev, cur = None, head
    while cur:
        nxt = cur.next
        cur.next = prev
        prev, cur = cur, nxt
    return prev

path = ['ad1', 'ad2', 'ad3', 'ad4', 'ad5']   # 가상 데이터
print('원래  ', show(build(path)))
print('뒤집음', show(reverse(build(path))))
print('빈 목록', show(reverse(build([]))))

# 3단계: 가운데 찾기
# slow 는 한 칸, fast 는 두 칸씩 간다. fast 가 끝에 닿으면 slow 는 가운데다. 짝수 길이면 두 가운데 중 뒤쪽이다.
def middle(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    return slow.val

print('가운데 (5개)', middle(build(path)))
print('가운데 (4개)', middle(build(path[:4])))

# 4단계: 순환 찾기
# 같은 두 포인터를 돌리다가 둘이 같은 노드에서 만나면 순환이 있다. fast 가 끝(None)에 닿으면 순환이 없다.
def has_cycle(head):
    slow = fast = head
    steps = 0
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        steps += 1
        if slow is fast:
            return True, steps
    return False, steps

head = build(path)
print('순환 없음', has_cycle(head))
tail = head
while tail.next:
    tail = tail.next
tail.next = head.next.next          # ad5 다음을 ad3 으로 이어 순환을 만든다
print('순환 있음', has_cycle(head))

# 출력:
# 2단계 뜻: 뒤집으면 순서가 거꾸로 되고, 빈 목록을 넣어도 오류 없이 빈 목록이 나온다.
# 원래   ad1 -> ad2 -> ad3 -> ad4 -> ad5
# 뒤집음 ad5 -> ad4 -> ad3 -> ad2 -> ad1
# 빈 목록 (빈 목록)
# 3단계 뜻: 5개면 정가운데 ad3, 4개면 두 가운데 ad2 와 ad3 중 뒤쪽인 ad3 이 나온다.
# 가운데 (5개) ad3
# 가운데 (4개) ad3
# 4단계 뜻: 순환이 없으면 2번 움직인 뒤 fast 가 끝에 닿고, 순환이 있으면 3번째 움직임에서 둘이 만난다.
# 순환 없음 (False, 2)
# 순환 있음 (True, 3)
```

순환이 있을 때 3번 만에 만난 과정을 손으로 따라가면, 1번째 움직임에서 slow 는 ad2, fast 는 ad3 이고, 2번째에서 slow 는 ad3, fast 는 ad5 이며, 3번째에서 slow 는 ad4 로 가고 fast 는 ad5 다음인 ad3 을 지나 ad4 로 가서 같은 노드가 됩니다. 순환이 없을 때는 5개짜리 리스트에서 fast 가 ad1, ad3, ad5 로 2번 움직이고 ad5 의 `next` 가 `None` 이라 멈추므로 `(False, 2)` 가 찍혔습니다.

세 함수 모두 리스트를 한 번 지나므로 시간은 O(n) 이고, 포인터 몇 개만 쓰므로 추가 공간은 O(1) 입니다. 순환 찾기는 지나간 노드를 `set` 에 넣는 방법으로도 풀 수 있는데, 그 방법은 공간이 O(n) 이라 면접에서 「추가 공간 없이」라는 조건이 붙으면 두 포인터 쪽을 씁니다. 같은 문제가 LeetCode 에서는 206번(뒤집기), 876번(가운데, 짝수면 뒤쪽 가운데를 답으로 받습니다), 141번(순환)입니다.

## 3. 문자열: 개수 세기, 애너그램, 슬라이딩 윈도우

**문자열 문제의 다수는 「문자마다 몇 번 나왔나」를 dict 로 세거나, 연속한 부분 문자열을 창(window)으로 밀며 보는 두 가지로 풀립니다.**

문자열은 글자의 배열이라 배열 편의 도구가 그대로 통하지만, 「같은 글자」, 「연속한 부분」 같은 조건이 붙어 해시와 슬라이딩 윈도우를 함께 쓰는 일이 많습니다. `collections.Counter` 는 반복 가능한 값을 받아 원소마다 나온 횟수를 dict 로 돌려주는 표준 라이브러리 클래스이고, 세는 법 세 가지의 비교는 [해시와 정렬](post.html?id=algorithm-hash-sort) 편 6절에 있으므로 여기서는 문자열 문제에 쓰는 모양만 봅니다. 애너그램(anagram)은 글자 구성은 같고 순서만 다른 두 낱말이고(`listen` 과 `silent`), 두 낱말의 Counter 가 같으면 애너그램입니다.

같은 문자가 없는 가장 긴 부분 문자열(LeetCode 3번)은 모든 시작과 끝을 보면 O(n^2) 개의 부분 문자열을 확인해야 하지만, 창의 왼쪽 끝을 앞으로만 움직이면 O(n) 에 끝납니다. 오른쪽 끝을 한 글자씩 늘리다가 창 안에 이미 있는 글자를 만나면, 그 글자가 마지막으로 나온 위치 다음으로 왼쪽 끝을 옮겨 중복을 없애는데, 글자마다 마지막 위치를 dict `last` 에 적어 두므로 왼쪽 끝을 한 칸씩 당기지 않고 한 번에 옮길 수 있습니다. 이때 `last[ch] >= left` 조건이 빠지면 창 밖으로 이미 나간 옛 위치로 왼쪽 끝을 되돌리는 실수가 생깁니다.

아래 블록의 3단계는 가상 검색어 조각 `'adsadsx'` 를 한 글자씩 읽으며 창의 위치를 찍습니다.

```python
# 하는 일: 가상 검색어로 문자 개수를 세고, 애너그램을 두 방법으로 확인하고, 같은 문자가 없는 가장 긴 부분 문자열을 슬라이딩 윈도우로 구한다.
from collections import Counter

# 1단계: 문자 개수를 센다
# Counter 는 문자마다 나온 횟수를 dict 로 돌려준다. most_common(2) 는 많이 나온 둘이다.
word = 'banana'
c = Counter(word)
print('개수', dict(c), '많은 둘', c.most_common(2))

# 2단계: 애너그램을 확인한다
# 두 낱말의 문자 개수가 모두 같으면 애너그램이다. 정렬해서 비교하는 방법은 O(k log k), Counter 비교는 O(k) 다.
pairs = [('listen', 'silent'), ('ad', 'da'), ('click', 'clock')]
for a, b in pairs:
    print(f'{a:6} {b:6}  Counter {Counter(a) == Counter(b)}  정렬 {sorted(a) == sorted(b)}')

# 3단계: 같은 문자가 없는 가장 긴 부분 문자열을 구한다
# last 에 문자마다 마지막으로 본 위치를 적는다. 창 안에서 같은 문자를 다시 만나면 왼쪽 끝을 그 위치 다음으로 옮긴다.
def longest_unique(s, trace=False):
    last = {}
    left = best = 0
    for right, ch in enumerate(s):
        if ch in last and last[ch] >= left:
            left = last[ch] + 1
        last[ch] = right
        best = max(best, right - left + 1)
        if trace:
            print(f'  {right}번 {ch!r}  창 [{left}, {right}] {s[left:right+1]!r:7} 최고 {best}')
    return best

print('답', longest_unique('adsadsx', trace=True))
for s in ['', 'aaaa', 'abcd']:
    print(f'{s!r:7} -> {longest_unique(s)}')

# 출력:
# 1단계 뜻: banana 에서 a 가 3번, n 이 2번, b 가 1번 나왔다.
# 개수 {'b': 1, 'a': 3, 'n': 2} 많은 둘 [('a', 3), ('n', 2)]
# 2단계 뜻: listen 과 silent, ad 와 da 는 애너그램이고 click 과 clock 은 아니다. 두 방법의 답이 같다.
# listen silent  Counter True  정렬 True
# ad     da      Counter True  정렬 True
# click  clock   Counter False  정렬 False
# 3단계 뜻: 3번 글자 a 에서 왼쪽 끝이 1로 옮겨 가고, 6번 글자 x 에서 창 adsx 의 길이 4 가 가장 길다.
#   0번 'a'  창 [0, 0] 'a'     최고 1
#   1번 'd'  창 [0, 1] 'ad'    최고 2
#   2번 's'  창 [0, 2] 'ads'   최고 3
#   3번 'a'  창 [1, 3] 'dsa'   최고 3
#   4번 'd'  창 [2, 4] 'sad'   최고 3
#   5번 's'  창 [3, 5] 'ads'   최고 3
#   6번 'x'  창 [3, 6] 'adsx'  최고 4
# 답 4
# 3단계 뜻: 빈 문자열은 0, 같은 글자만 있으면 1, 모두 다르면 문자열 길이다.
# ''      -> 0
# 'aaaa'  -> 1
# 'abcd'  -> 4
```

3번 글자 `a` 에서 무슨 일이 있었는지 계산해 보면, `last['a']` 는 0 이고 왼쪽 끝 0 이상이라 창 안의 중복이므로 왼쪽 끝을 0 + 1 = 1 로 옮기고, 창 `[1, 3]` 은 `'dsa'` 로 길이 3 입니다. 4번과 5번 글자도 같은 이유로 왼쪽 끝이 2, 3 으로 한 칸씩 가고, 6번 글자 `x` 는 처음 나온 글자라 창이 `[3, 6]` 의 `'adsx'` 로 늘어나 최고 길이가 4 가 됩니다. 오른쪽 끝은 7번, 왼쪽 끝은 많아야 7번 움직이므로 전체 시간은 O(n) 이고, `last` 는 나온 글자 종류 수만큼만 커집니다.

애너그램 확인에서 정렬은 글자 수 k 에 대해 O(k log k), Counter 비교는 O(k) 라 이론상 Counter 가 빠르지만, 짧은 낱말에서는 어느 쪽이든 차이가 작으므로 면접에서는 읽기 쉬운 쪽을 쓰고 복잡도만 말하면 됩니다. 창을 쓰는 다른 문제(합이 S 이상인 가장 짧은 구간)는 [복잡도와 배열 순회](post.html?id=algorithm-complexity-array) 편과 [풀이 템플릿](post.html?id=algorithm-solving-steps) 편에 있고, 문자열에서도 「왼쪽 끝은 앞으로만」이라는 같은 규칙으로 풉니다.

## 4. 문자열 이어 붙이기: join 과 +=

**반복문 안에서 문자열을 이어 붙일 때는 조각을 list 에 모았다가 마지막에 `''.join(list)` 로 한 번 붙입니다. CPython 에서는 `s += piece` 도 빠를 때가 많지만, 그것은 특정 조건에서만 켜지는 최적화 덕분입니다.**

Python 의 문자열은 한 번 만들면 바꿀 수 없는(immutable) 값이라, `s += piece` 는 원칙적으로 `s` 와 `piece` 를 합친 새 문자열을 만들고 앞의 글자를 모두 새 자리에 복사합니다. 조각 n 개를 이렇게 붙이면 k 번째 붙이기에서 그때까지의 글자를 다시 복사하므로 전체 복사량이 n^2 에 비례하는데, Python 공식 문서도 바꿀 수 없는 시퀀스를 반복해서 이어 붙이면 전체 길이의 제곱에 비례하는 비용이 든다고 적고 있습니다. `join` 은 조각들의 길이를 먼저 더해 한 번에 자리를 잡고 한 번씩만 복사하므로 O(전체 길이) 입니다.

다만 CPython(공식 Python 구현)은 `s` 를 가리키는 이름이 하나뿐일 때 `+=` 를 새로 만들지 않고 제자리에서 늘리는 최적화를 하므로, 단순한 반복문에서는 `+=` 도 제곱으로 느려지지 않고 `join` 과 큰 차이가 나지 않습니다. 이 최적화는 다른 이름이 같은 문자열을 가리키는 순간 꺼지고 PyPy 같은 다른 구현에는 없을 수 있어서, Python 공식 문서가 `join` 을 권하는 까닭도 제곱 비용을 피하는 방법이 구현과 상황에 상관없이 통하게 하려는 데 있고, PEP 8 은 이 최적화에 기대는 코드를 쓰지 말고 성능이 중요한 곳에서는 `join` 을 쓰라고 권합니다.

아래 블록은 8글자짜리 가상 광고 ID 조각 2만 개를 세 방법으로 붙입니다. `plus_kept` 는 `keep = s` 한 줄로 직전 문자열을 가리키는 이름을 하나 더 만들어 최적화를 끈 경우입니다.

```python
# 하는 일: 문자열 조각 2만 개를 += 와 join 으로 이어 붙여 시간을 측정하고, += 가 새 문자열을 만들 때마다 복사하는 글자 수를 계산한다.
import timeit

# 1단계: 세 방법을 만든다
# plus 는 반복문 안에서 s += piece 를 한다. plus_kept 는 같은 일을 하되 직전 문자열을 keep 이 한 번 더 가리킨다. join 은 조각을 list 에 모았다가 마지막에 한 번 붙인다.
pieces = [f'ad{i:05d},' for i in range(20_000)]   # 조각 하나가 8글자인 가상 광고 ID

def plus():
    s = ''
    for p in pieces:
        s += p
    return s

def plus_kept():
    s = ''
    for p in pieces:
        keep = s          # 직전 문자열을 가리키는 이름이 하나 더 생긴다
        s += p
    return s

def join():
    out = []
    for p in pieces:
        out.append(p)
    return ''.join(out)

print('같은 결과', plus() == plus_kept() == join(), '길이', len(join()))

# 2단계: 시간을 측정한다
# CPython 은 s 를 가리키는 이름이 하나뿐이면 += 를 제자리에서 늘린다. keep 이 있으면 이 최적화가 꺼져 매번 새 문자열을 만든다.
times = {}
for f in (join, plus, plus_kept):
    t = timeit.timeit(f, number=5) / 5
    times[f.__name__] = t
    print(f'{f.__name__:9} {t * 1000:6.2f} ms')
print('plus_kept 가 join 보다 10배 넘게 느림', times['plus_kept'] > 10 * times['join'])

# 3단계: 매번 새 문자열을 만들 때 복사하는 글자 수를 계산한다
# k 번째 += 는 앞에서 만든 8(k-1) 글자와 새 조각 8글자, 모두 8k 글자를 새 자리에 복사한다.
n, k = len(pieces), 8
copy_plus = sum(k * i for i in range(1, n + 1))
copy_join = k * n
print(f'+= 복사 {copy_plus:,}글자  join 복사 {copy_join:,}글자  {copy_plus // copy_join:,}배')

# 출력 (시간은 돌릴 때마다 다르다):
# 1단계 뜻: 세 방법이 같은 16만 글자 문자열을 만든다.
# 같은 결과 True 길이 160000
# 2단계 뜻: ms 값은 돌릴 때마다 다르다. 이 기계에서 plus 는 join 과 같은 자릿수였고, 최적화가 꺼진 plus_kept 만 join 보다 10배 넘게 느렸다.
# join        0.50 ms
# plus        0.73 ms
# plus_kept  38.22 ms
# plus_kept 가 join 보다 10배 넘게 느림 True
# 3단계 뜻: 매번 새로 만들면 16억 글자를 복사하고, join 은 16만 글자만 복사해 1만 배 차이다.
# += 복사 1,600,080,000글자  join 복사 160,000글자  10,000배
```

3단계의 숫자를 따라가면, k 번째 `+=` 는 앞에서 만든 8(k − 1) 글자와 새 조각 8글자, 모두 8k 글자를 복사하므로 전체는 8 × (1 + 2 + … + 20,000) = 8 × 20,000 × 20,001 / 2 = 1,600,080,000 글자이고, `join` 은 조각마다 한 번씩 8 × 20,000 = 160,000 글자를 복사하므로 둘의 비는 (n + 1) / 2 = 10,000 배입니다. 2단계의 ms 값은 기계와 Python 판, 돌린 때에 따라 달라지므로 숫자 자체는 보지 않아도 되고, 이 글을 쓸 때 몇 번 돌려도 바뀌지 않은 것은 두 가지였습니다. 하나는 `plus` 가 `join` 과 같은 자릿수라는 점으로, CPython 의 제자리 최적화가 켜져 3단계의 제곱 복사가 실제로는 일어나지 않았다는 뜻입니다. 다른 하나는 이름을 하나 더 둔 `plus_kept` 만 `join` 보다 10배 넘게 느렸다는 점으로, 최적화가 꺼지면 3단계의 계산대로 복사가 늘어난다는 뜻입니다.

면접에서 이 질문이 나오면 「문자열은 바꿀 수 없다」는 성질과 그 결과를 말하면 되고, 답은 「매번 새 문자열을 만들면 복사가 제곱으로 늘어납니다. CPython 은 조건이 맞을 때 제자리에서 늘려 이를 피하지만 다른 구현이나 이름이 둘인 경우에는 안 되므로 join 을 씁니다」 정도면 충분합니다. 같은 이유로 문자열을 한 글자씩 바꾸는 문제는 `list(s)` 로 바꿔 고친 뒤 마지막에 `''.join` 으로 돌려놓습니다.

## 5. Union-Find: 경로 압축과 크기 기준 합치기

**「이 둘이 같은 그룹인가」와 「그룹이 몇 개인가」만 묻고 경로는 묻지 않으면, 원소마다 부모만 적어 두는 Union-Find 로 거의 상수 시간에 답합니다.**

Union-Find(서로소 집합, disjoint set union)는 원소마다 부모 `parent` 를 적어 두고, 부모를 따라 올라가 닿는 맨 위 원소를 그 그룹의 대표로 삼는 구조입니다. `find(x)` 는 x 의 대표를 찾고, `union(a, b)` 는 두 대표가 다르면 한쪽 대표를 다른 쪽 밑에 붙여 그룹을 합칩니다. [그래프 탐색](post.html?id=algorithm-graph-search) 편의 접힌 블록에서 찾기와 합치기를 짧게 보였는데, 거기서는 지나가며 한 칸씩 당기는 방법만 썼으므로 이 절에서는 면접에서 흔히 같이 쓰는 두 기법을 둘 다 넣고 각각 무엇을 줄이는지 셉니다.

두 기법이 없으면 합치는 순서에 따라 트리가 한 줄로 늘어서고, 그러면 맨 아래 원소의 `find` 가 원소 수만큼 걸어 올라가야 합니다. 경로 압축(path compression)은 `find` 가 대표를 찾은 뒤 지나온 원소를 모두 대표에 바로 붙여 다음 `find` 를 한 걸음으로 만들고, 크기 기준 합치기(union by size)는 작은 그룹의 대표를 큰 그룹의 대표 밑에 붙여 트리의 높이가 많아야 log n 이 되게 합니다. 둘을 같이 쓰면 연산 한 번의 분할 상환 비용(amortized cost, 연산 여러 번의 총비용을 횟수로 나눈 값)이 역 아커만 함수 α(n) 에 비례한다는 것이 알려져 있고, 이 값은 현실적인 n 에서 5 를 넘지 않아 거의 상수로 봅니다.

아래 블록의 2단계는 같은 기기에서 로그인한 가상 계정 쌍 6개로 그룹을 세고, 3단계는 일부러 한 줄로 늘어서게 합친 원소 1,000개에서 두 기법을 켜고 끄며 걸음 수를 셉니다.

```python
# 하는 일: 기기를 같이 쓴 가상 계정 8개를 Union-Find 로 묶어 그룹 수와 크기를 세고, 줄로 늘어선 1,000개에서 두 기법이 찾기 걸음 수를 얼마나 줄이는지 센다.
# 1단계: Union-Find 를 만든다
# parent 는 각 원소의 부모, size 는 대표마다 그룹 크기다. find 는 대표를 찾으며 지나온 원소를 모두 대표에 바로 붙이고(경로 압축), union 은 작은 그룹의 대표를 큰 그룹의 대표 밑에 붙인다(크기 기준 합치기).
class UnionFind:
    def __init__(self, n, compress=True, by_size=True):
        self.parent = list(range(n))
        self.size = [1] * n
        self.groups = n
        self.compress, self.by_size = compress, by_size
        self.steps = 0                      # find 가 부모를 따라 올라간 걸음 수

    def find(self, x):
        root = x
        while self.parent[root] != root:
            root = self.parent[root]
            self.steps += 1
        if self.compress:
            while self.parent[x] != root:   # 지나온 원소를 대표에 바로 붙인다
                self.parent[x], x = root, self.parent[x]
        return root

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False
        if self.by_size and self.size[ra] < self.size[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra
        self.size[ra] += self.size[rb]
        self.groups -= 1
        return True

# 2단계: 기기를 같이 쓴 계정 쌍으로 그룹을 센다
# 계정 0~7, 같은 기기에서 로그인한 쌍 6개다. 이미 같은 그룹인 쌍은 union 이 False 를 돌려준다.
links = [(0, 1), (1, 2), (3, 4), (2, 0), (5, 6), (4, 6)]   # 가상 데이터
uf = UnionFind(8)
for a, b in links:
    print(f'{a}-{b}  {"합침" if uf.union(a, b) else "이미 같은 그룹"}  그룹 {uf.groups}개')
by_root = {}
for x in range(8):
    by_root.setdefault(uf.find(x), []).append(x)
print('그룹', sorted(by_root.values()))

# 3단계: 줄로 늘어선 경우의 걸음 수를 센다
# 0-1, 0-2, ... 처럼 이으면 두 기법이 없을 때 트리가 한 줄로 늘어선다. 그 뒤 모든 원소를 한 번씩 find 한다.
n = 1_000
for compress, by_size in [(False, False), (True, False), (False, True), (True, True)]:
    u = UnionFind(n, compress, by_size)
    for i in range(1, n):
        u.union(i, 0)
    u.steps = 0
    for x in range(n):
        u.find(x)
    print(f'경로 압축 {compress!s:5} 크기 기준 {by_size!s:5}  찾기 1,000번의 걸음 {u.steps:,}')

# 출력:
# 2단계 뜻: 쌍 6개 중 2-0 은 이미 같은 그룹이라 합치지 않았고, 계정 8개가 그룹 3개가 된다.
# 0-1  합침  그룹 7개
# 1-2  합침  그룹 6개
# 3-4  합침  그룹 5개
# 2-0  이미 같은 그룹  그룹 5개
# 5-6  합침  그룹 4개
# 4-6  합침  그룹 3개
# 그룹 [[0, 1, 2], [3, 4, 5, 6], [7]]
# 3단계 뜻: 두 기법이 없으면 499,500걸음이고, 둘 중 하나만 있어도 2천 걸음 안쪽으로 준다.
# 경로 압축 False 크기 기준 False  찾기 1,000번의 걸음 499,500
# 경로 압축 True  크기 기준 False  찾기 1,000번의 걸음 1,997
# 경로 압축 False 크기 기준 True   찾기 1,000번의 걸음 999
# 경로 압축 True  크기 기준 True   찾기 1,000번의 걸음 999
```

2단계의 그룹 수는 「처음 원소 수에서 실제로 합친 횟수를 뺀 값」이라, 8 − 5 = 3 입니다. `2-0` 은 `0-1`, `1-2` 를 거쳐 이미 같은 대표를 가지므로 `union` 이 `False` 를 돌려주었고, 그래프 편에서 본 것처럼 이 `False` 가 「이 간선을 더하면 순환이 생긴다」는 신호이기도 합니다. 그룹에 들지 못한 계정 7은 혼자 그룹 하나로 남았습니다.

3단계의 첫 줄을 계산하면, 두 기법이 없을 때 원소 0~999 가 깊이 999, 998, …, 0 으로 한 줄에 늘어서므로 모든 원소를 한 번씩 찾는 걸음은 0 + 1 + … + 999 = 999 × 1,000 / 2 = 499,500 입니다. 크기 기준 합치기를 켜면 새 원소가 늘 큰 그룹의 대표 밑에 붙어 모두 깊이 1 이 되므로 999걸음이고, 경로 압축만 켜면 늘어선 줄을 처음 끝까지 걸어 올라가는 `find` 한 번이 1,000걸음 가까이 걸리지만, 그때 지나온 원소를 모두 대표에 바로 붙이므로 나머지 찾기는 거의 한 걸음씩 걸려 모두 1,997걸음입니다. 이 입력에서는 크기 기준 합치기가 이미 높이를 1 로 만들어 경로 압축을 더해도 999걸음 그대로인데, 합치는 순서가 섞인 입력에서는 둘을 같이 쓸 때 이득이 커질 수 있습니다.

면접에서는 「그룹 수」(LeetCode 547번 Number of Provinces), 「간선을 더할 때 처음 순환이 생기는 간선」(684번 Redundant Connection), 크루스칼의 최소 신장 트리에 Union-Find 를 씁니다. BFS 나 DFS 로도 그룹 수는 셀 수 있지만, 간선이 하나씩 들어오며 그때마다 그룹 수를 물으면 매번 다시 탐색해야 하므로 Union-Find 가 맞습니다.

## 6. Trie: 접두어 검색과 bisect

**「이 글자로 시작하는 낱말」을 반복해서 찾으면 Trie 를 쓰고, 낱말 목록이 바뀌지 않으면 정렬된 list 와 `bisect` 로도 같은 답이 나옵니다.**

Trie(트라이, 접두어 트리)는 루트에서 아래로 한 글자씩 가지를 나누는 트리로, 같은 접두어를 가진 낱말이 같은 경로를 같이 씁니다. Python 에서는 노드를 dict 하나로 두고 키를 다음 글자, 값을 다음 노드로 하면 클래스 없이 쓸 수 있고, `run` 과 `runner` 처럼 한 낱말이 다른 낱말의 접두어일 때 어디서 낱말이 끝나는지 알 수 있게 끝 노드에 `'$'` 같은 표시를 둡니다. 이 표시를 빠뜨리면 `runner` 만 넣었는데 `run` 도 있는 낱말로 답하는 실수가 생깁니다.

Trie 에 낱말 하나를 넣거나 찾는 비용은 낱말 길이 L 에 대해 O(L) 이라 목록 크기와 상관이 없습니다. 정렬된 list 에서는 같은 접두어로 시작하는 낱말이 붙어 있으므로, `bisect.bisect_left(words, prefix)` 로 접두어가 들어갈 첫 자리를 찾고 `startswith` 가 거짓이 될 때까지 읽으면 같은 결과가 나오고, 비용은 낱말 수 n 에 대해 비교 O(log n) 번과 결과 m 개를 읽는 시간입니다. `bisect` 는 정렬된 list 에서 값이 들어갈 자리를 이분 탐색으로 찾는 표준 라이브러리 모듈이고, 자세한 쓰임은 [이분 탐색과 스택](post.html?id=algorithm-binary-search-stack) 편에 있습니다.

아래 블록은 가상 검색 키워드 7개(`run` 이 두 번 들어 있습니다)로 Trie 를 만들고, 같은 접두어 넷을 두 방법으로 찾습니다.

```python
# 하는 일: 가상 검색 키워드 7개로 중첩 dict Trie 를 만들어 접두어 검색을 하고, 정렬된 list 와 bisect 로 같은 답을 구한다.
import bisect

# 1단계: Trie 에 넣는 함수를 만든다
# 노드는 dict 하나다. 키는 다음 글자, 값은 다음 노드다. 낱말이 끝나는 노드에는 '$' 키를 둔다.
END = '$'

def insert(root, word):
    node = root
    for ch in word:
        node = node.setdefault(ch, {})
    node[END] = True

keywords = ['run', 'runner', 'running shoes', 'rain', 'rainbow', 'red', 'run']   # 가상 데이터, run 은 두 번
root = {}
for w in keywords:
    insert(root, w)
print('맨 위 글자', sorted(root), " 'r' 아래", sorted(root['r']))

# 2단계: 접두어로 시작하는 낱말을 모은다
# 접두어 글자를 따라 내려간 뒤, 그 노드 아래를 깊이 우선으로 돌며 '$' 를 만난 경로를 모은다.
def starts_with(root, prefix):
    node = root
    for ch in prefix:
        if ch not in node:
            return []
        node = node[ch]
    out, stack = [], [(node, prefix)]
    while stack:
        node, path = stack.pop()
        for ch, child in node.items():
            if ch == END:
                out.append(path)
            else:
                stack.append((child, path + ch))
    return sorted(out)

for p in ['run', 'rai', 're', 'x']:
    print(f'Trie   {p!r:6} {starts_with(root, p)}')

# 3단계: 정렬된 list 와 bisect 로 같은 일을 한다
# 정렬하면 같은 접두어로 시작하는 낱말이 붙어 있다. bisect_left 로 첫 자리를 찾고 startswith 가 거짓이 될 때까지 읽는다.
words = sorted(set(keywords))

def starts_with_sorted(words, prefix):
    i = bisect.bisect_left(words, prefix)
    out = []
    while i < len(words) and words[i].startswith(prefix):
        out.append(words[i])
        i += 1
    return out

print('정렬', words)
for p in ['run', 'rai', 're', 'x']:
    print(f'bisect {p!r:6} {starts_with_sorted(words, p)}')

# 출력:
# 1단계 뜻: 모든 낱말이 r 로 시작해 맨 위 가지는 r 하나이고, 그 아래에서 a, e, u 셋으로 나뉜다.
# 맨 위 글자 ['r']  'r' 아래 ['a', 'e', 'u']
# 2단계 뜻: run 으로 시작하는 낱말 셋, rai 로 시작하는 둘, re 로 시작하는 하나를 찾고 x 는 없다.
# Trie   'run'  ['run', 'runner', 'running shoes']
# Trie   'rai'  ['rain', 'rainbow']
# Trie   're'   ['red']
# Trie   'x'    []
# 3단계 뜻: 정렬된 list 와 bisect 로도 네 접두어의 답이 Trie 와 같다.
# 정렬 ['rain', 'rainbow', 'red', 'run', 'runner', 'running shoes']
# bisect 'run'  ['run', 'runner', 'running shoes']
# bisect 'rai'  ['rain', 'rainbow']
# bisect 're'   ['red']
# bisect 'x'    []
```

`'run'` 을 bisect 로 찾는 과정을 따라가면, 정렬된 6개 `['rain', 'rainbow', 'red', 'run', 'runner', 'running shoes']` 에서 `bisect_left` 가 `'run'` 이 들어갈 자리 3 을 돌려주고, 3번 `run`, 4번 `runner`, 5번 `running shoes` 가 모두 `run` 으로 시작하며 6번은 목록 끝이라 멈춥니다. `run` 이 두 번 들어갔어도 Trie 는 같은 끝 노드에 표시를 다시 적을 뿐이라 결과에 한 번만 나오고, 정렬 쪽은 `set` 으로 중복을 먼저 지웠습니다.

어느 쪽을 쓸지는 이 글의 판단으로 정리하면, 낱말 목록이 처음에 한 번 주어지고 바뀌지 않으면 정렬과 `bisect` 가 코드가 짧고 틀릴 자리가 적습니다. 낱말을 넣는 일과 찾는 일이 번갈아 많이 오거나, 글자를 하나씩 따라가며 「여기까지 맞는 낱말이 있나」를 물어야 하면(LeetCode 208번 Implement Trie, 212번 Word Search II 처럼 격자를 걸으며 낱말을 찾는 문제) Trie 가 맞습니다. 정렬된 list 에 낱말을 하나 넣으면 뒤의 원소를 한 칸씩 밀어야 해서 O(n) 이 들기 때문입니다.

## 7. 구간: 합치기와 최대 겹침

**구간 문제는 먼저 정렬합니다. 겹치는 구간 합치기는 시작 시각으로 정렬해 한 번 지나고, 가장 많이 겹친 개수는 시작과 끝을 사건으로 나눠 시각 순서로 정렬해 더합니다.**

구간(interval)은 `(시작, 끝)` 쌍이고, 회의실 예약, 광고 노출 기간, 서버가 바빴던 시간처럼 시간 위의 범위를 다루는 문제에 나옵니다. 정렬하지 않은 채로 겹치는지 보려면 모든 쌍 O(n^2) 개를 비교해야 하지만, 시작 시각으로 정렬하면 「다음 구간의 시작이 지금까지 합친 구간의 끝 이하인가」만 보면 되므로, 정렬 O(n log n) 뒤에 한 번 순회 O(n) 으로 끝납니다. 이때 끝을 `max(지금 끝, 새 끝)` 으로 늘려야 하는데, 새 끝으로 덮어쓰면 `(1, 10)` 안에 든 `(2, 3)` 을 만났을 때 끝이 3 으로 줄어드는 실수가 생깁니다.

가장 많이 겹친 개수(동시에 열린 회의 수, 필요한 회의실 수)는 구간마다 「시작 시각에 +1」과 「끝 시각에 −1」 두 사건을 만들어 시각 순서로 정렬하고, 앞에서부터 더한 누적값의 최댓값으로 구합니다. 이런 방법을 스위프(sweep, 쓸고 지나가기)라고 부르는데, 같은 시각에 끝과 시작이 함께 있을 때 어느 쪽을 먼저 처리하느냐에 따라 답이 달라지므로 구간을 `[시작, 끝)` 으로 볼지(끝 시각에는 이미 끝난 것으로 볼지)를 면접관에게 먼저 묻습니다. Python 은 튜플을 앞 원소부터 비교하므로 `(6, -1)` 이 `(6, 1)` 보다 앞에 정렬되어, 따로 정렬 키를 쓰지 않아도 끝을 먼저 뺍니다.

아래 블록은 가상 광고 노출 구간 6개(단위는 시)로 두 문제를 풀고, 3단계에서 끝과 시작이 같은 시각인 경계 입력을 따로 봅니다.

```python
# 하는 일: 가상 광고 노출 구간 6개에서 겹치는 구간을 합치고, 시작과 끝 사건을 정렬해 한 시각에 가장 많이 겹친 개수를 구한다.
# 1단계: 겹치는 구간을 합친다
# 시작 시각으로 정렬한 뒤, 다음 구간의 시작이 지금 합친 구간의 끝 이하이면 끝을 늘리고, 아니면 새 구간을 연다.
slots = [(9, 11), (1, 5), (15, 18), (4, 7), (10, 12), (2, 6)]   # 가상 데이터, 단위는 시

def merge(intervals):
    out = []
    for s, e in sorted(intervals):
        if out and s <= out[-1][1]:
            out[-1][1] = max(out[-1][1], e)
        else:
            out.append([s, e])
    return out

print('정렬', sorted(slots))
print('합침', merge(slots))
print('빈 입력', merge([]))

# 2단계: 최대 겹침을 센다
# 구간마다 (시작, +1) 과 (끝, -1) 사건을 만들어 정렬하고 앞에서부터 더한다. 같은 시각이면 -1 이 +1 보다 먼저 정렬되어, 끝나는 구간을 먼저 뺀다.
def max_overlap(intervals, trace=False):
    events = []
    for s, e in intervals:
        events.append((s, 1))
        events.append((e, -1))
    events.sort()
    cur = best = 0
    for t, d in events:
        cur += d
        best = max(best, cur)
        if trace:
            print(f'  {t:2d}시 {"+1" if d > 0 else "-1"}  지금 {cur}  최대 {best}')
    return best

print('최대 겹침', max_overlap(slots, trace=True))

# 3단계: 끝과 시작이 같은 시각인 경계 입력을 본다
# 3시에 끝나는 구간과 3시에 시작하는 구간이다. 끝을 먼저 빼면 1, 시작을 먼저 더하면 2 가 된다.
touch = [(1, 3), (3, 5)]
print('끝 먼저', max_overlap(touch))
events = sorted([(s, 1) for s, e in touch] + [(e, -1) for s, e in touch], key=lambda x: (x[0], -x[1]))
cur = best = 0
for t, d in events:
    cur += d
    best = max(best, cur)
print('시작 먼저', best)

# 출력:
# 1단계 뜻: 6개가 1~7시, 9~12시, 15~18시 세 덩어리로 합쳐지고, 빈 입력은 빈 목록이 된다.
# 정렬 [(1, 5), (2, 6), (4, 7), (9, 11), (10, 12), (15, 18)]
# 합침 [[1, 7], [9, 12], [15, 18]]
# 빈 입력 []
# 2단계 뜻: 4시에 세 구간이 동시에 열려 최대 겹침이 3 이다.
#    1시 +1  지금 1  최대 1
#    2시 +1  지금 2  최대 2
#    4시 +1  지금 3  최대 3
#    5시 -1  지금 2  최대 3
#    6시 -1  지금 1  최대 3
#    7시 -1  지금 0  최대 3
#    9시 +1  지금 1  최대 3
#   10시 +1  지금 2  최대 3
#   11시 -1  지금 1  최대 3
#   12시 -1  지금 0  최대 3
#   15시 +1  지금 1  최대 3
#   18시 -1  지금 0  최대 3
# 최대 겹침 3
# 3단계 뜻: 3시에 끝나는 구간과 3시에 시작하는 구간은 끝을 먼저 빼면 1, 시작을 먼저 더하면 2 다.
# 끝 먼저 1
# 시작 먼저 2
```

1단계를 따라가면, 정렬한 첫 구간 `(1, 5)` 로 시작해 `(2, 6)` 의 시작 2 가 끝 5 이하라 끝을 max(5, 6) = 6 으로 늘리고, `(4, 7)` 의 시작 4 도 6 이하라 끝을 7 로 늘리며, `(9, 11)` 의 시작 9 는 7 보다 커서 새 구간을 엽니다. 2단계에서는 1시와 2시에 하나씩 열려 2 가 되고, 4시에 `(4, 7)` 이 열릴 때 `(1, 5)` 와 `(2, 6)` 이 아직 끝나지 않았으므로 누적값이 3 이 되며, 5시부터 하나씩 끝나 7시에 0 으로 돌아갑니다.

합치기는 끝과 시작이 같은 `(1, 3)` 과 `(3, 5)` 를 `s <= 끝` 조건 때문에 하나로 합치는데(LeetCode 56번 Merge Intervals 가 이렇게 정의합니다), 겹침 세기는 같은 시각에 끝을 먼저 빼서 둘을 겹치지 않는 것으로 셉니다. 한 글 안에서 두 규칙이 다른 것은 두 문제의 정의가 다르기 때문이고, 면접 문제마다 맞닿은 구간을 어떻게 볼지가 다를 수 있으므로 3단계처럼 경계 입력 하나를 직접 돌려 보고 답합니다. 필요한 회의실 수를 묻는 문제(LeetCode 253번 Meeting Rooms II)는 시작 정렬과 끝 시각을 담은 힙으로도 풀 수 있고, 힙 쪽 풀이는 [트리와 힙](post.html?id=algorithm-tree-heap) 편의 도구로 씁니다.

## 8. 지문 신호와 구조

**지문의 낱말이 구조를 알려 줍니다. 「노드」와 「next」는 연결 리스트, 「같은 그룹」은 Union-Find, 「로 시작하는」은 Trie 나 정렬, 「시작 시각과 끝 시각」은 구간 정렬입니다.**

[풀이 템플릿](post.html?id=algorithm-solving-steps) 편의 신호표가 배열, 해시, 힙, 그래프, DP 를 다뤘으므로, 아래 표는 이 글의 다섯 가지만 같은 모양으로 더합니다. 비용 칸은 n 을 원소 수, L 을 낱말 길이, m 을 결과 수로 두었고, 표는 후보를 좁히는 데 쓰는 어림 기준이라 한 지문에 신호가 둘 이상이면 n 의 범위로 계산한 목표 복잡도에 맞는 쪽을 고릅니다.

| 지문 신호 | 구조 | 접근 방법 | 대표 비용 |
|---|---|---|---|
| 「ListNode」, 「head」, 뒤집기, k 개씩 묶어 뒤집기 | 연결 리스트 | prev, cur 두 포인터 | 시간 O(n), 공간 O(1) |
| 가운데, 끝에서 k 번째, 순환 | 연결 리스트 | slow, fast 두 포인터 | 시간 O(n), 공간 O(1) |
| 애너그램, 글자 개수가 같은가 | 해시(Counter) | 개수 세고 비교 | O(k) |
| 반복 없는, 최대 k 종류의, 가장 긴 부분 문자열 | 해시 + 창 | 슬라이딩 윈도우 | O(n) |
| 문자열을 여러 번 이어 붙여 만든다 | list | 모았다가 `join` | O(전체 길이) |
| 같은 그룹인가, 그룹 수, 처음 순환을 만드는 간선 | Union-Find | 경로 압축 + 크기 기준 합치기 | 연산마다 분할 상환 O(α(n)) |
| 로 시작하는 낱말, 자동 완성, 격자에서 낱말 찾기 | Trie | 글자마다 한 칸 내려가기 | 넣기와 찾기 O(L) |
| 고정된 낱말 목록에서 접두어 찾기 | 정렬된 list | `bisect` 후 순서대로 읽기 | O(log n) 비교 + O(m) |
| 겹치는 구간 합치기, 빈 시간 찾기 | 정렬된 구간 | 시작으로 정렬 후 한 번 순회 | O(n log n) |
| 동시에 가장 많이, 필요한 방 수 | 사건 목록 | 시작 +1, 끝 −1 정렬 후 누적 | O(n log n) |

표의 첫 칸에 「ListNode」가 보이면 대개 편집기가 노드 클래스를 이미 주었다는 뜻이고, 빈 편집기라면 2절의 세 줄 클래스를 먼저 씁니다. 이 표를 외우기보다는, 각 줄의 접근 방법을 한 번씩 손으로 짜 보고 경계 입력(빈 목록, 원소 하나, 같은 시각, 접두어 자체가 낱말인 경우)을 돌려 보는 편이 면접에서 떠올리기 쉽습니다. 문제를 받고 이 표를 소리 내어 적용하는 순서는 [말하며 풀기](post.html?id=algorithm-think-aloud) 편에 있습니다.

## 한눈 정리

| 구조 | 손에 익힐 규칙 | 이 글의 예에서 |
|---|---|---|
| 연결 리스트 | 바꾸기 전에 `nxt` 를 받는다, slow 한 칸 fast 두 칸 | 5개 뒤집기, 가운데 ad3, 순환은 3번째 움직임에서 만남 |
| 문자열 세기, 창 | `last[ch] >= left` 일 때만 왼쪽 끝을 옮긴다 | `'adsadsx'` 에서 `'adsx'` 길이 4 |
| 문자열 붙이기 | 반복문에서는 list 에 모았다가 `join` | 조각 2만 개에서 복사 16억 글자 대 16만 글자 |
| Union-Find | 작은 그룹을 큰 그룹 밑에, 찾을 때 경로 압축 | 계정 8개가 그룹 3개, 1,000개 찾기 499,500걸음 → 999걸음 |
| Trie | 끝 노드에 `'$'` 표시 | `run` 으로 시작하는 낱말 셋, bisect 와 같은 답 |
| 구간 | 시작으로 정렬, 같은 시각이면 끝을 먼저 | 합쳐서 3덩어리, 최대 겹침 3 |

## 헷갈리기 쉬운 점

- **연결 리스트를 뒤집을 때 `cur.next = prev` 를 먼저 쓰면 뒤가 사라집니다.** `nxt = cur.next` 로 다음 노드를 받은 뒤에 화살표를 바꾸고, 함수가 돌려줄 새 head 는 반복이 끝났을 때의 `prev` 입니다.
- **짝수 길이 리스트의 가운데는 정의에 따라 다릅니다.** 이 글의 `while fast and fast.next` 는 뒤쪽 가운데를 돌려주고, 앞쪽 가운데가 필요하면 조건을 `while fast.next and fast.next.next` 로 바꿉니다. 면접에서는 어느 쪽인지 먼저 묻습니다.
- **슬라이딩 윈도우의 왼쪽 끝은 뒤로 가지 않습니다.** `last[ch]` 가 창보다 앞에 있으면 무시해야 하고, 이 조건이 빠지면 `'abba'` 같은 입력에서 답이 커집니다.
- **CPython 에서 `+=` 가 빨랐다고 join 이 필요 없는 것은 아닙니다.** 단순한 반복문에서 `+=` 가 제곱으로 느려지지 않는 것은 최적화 덕분이고, 이 최적화는 이름이 하나일 때만 켜지며 다른 Python 구현에는 없을 수 있어서, 반복문에서는 `join` 을 씁니다.
- **Union-Find 의 그룹 수는 `union` 이 True 를 돌려준 횟수로 셉니다.** 간선 수를 빼면 이미 같은 그룹인 쌍까지 빼서 그룹 수가 모자랍니다.
- **Trie 에서 끝 표시가 없으면 접두어가 낱말로 잡힙니다.** `runner` 만 넣었으면 `run` 은 경로는 있지만 낱말이 아닙니다.
- **구간에서 맞닿은 끝과 시작을 겹친 것으로 볼지는 문제마다 다릅니다.** 이 글의 합치기는 맞닿으면 합치고 겹침 세기는 맞닿으면 겹치지 않는 것으로 보았으므로, 문제의 정의를 먼저 확인합니다.

## 더 깊이 보기

- 바꿀 수 없는 시퀀스를 반복해서 이어 붙이면 제곱 비용이 든다는 설명은 Python 공식 문서 [Common Sequence Operations](https://docs.python.org/3/library/stdtypes.html#common-sequence-operations) 의 주석에 있고, CPython 의 제자리 이어 붙이기 최적화에 기대지 말라는 권고는 [PEP 8 Programming Recommendations](https://peps.python.org/pep-0008/#programming-recommendations) 에 있습니다.
- Union-Find 의 두 기법과 α(n) 비용은 Wikipedia 의 [Disjoint-set data structure](https://en.wikipedia.org/wiki/Disjoint-set_data_structure) 에, 플로이드의 순환 탐지는 [Cycle detection](https://en.wikipedia.org/wiki/Cycle_detection) 에, Trie 의 구조는 [Trie](https://en.wikipedia.org/wiki/Trie) 에 있습니다.
- 표준 라이브러리 문서는 [collections.Counter](https://docs.python.org/3/library/collections.html#collections.Counter), [bisect](https://docs.python.org/3/library/bisect.html) 입니다.
- 연습 문제는 LeetCode 의 [Reverse Linked List](https://leetcode.com/problems/reverse-linked-list/), [Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters/), [Number of Provinces](https://leetcode.com/problems/number-of-provinces/), [Implement Trie](https://leetcode.com/problems/implement-trie-prefix-tree/), [Merge Intervals](https://leetcode.com/problems/merge-intervals/) 입니다.
- 유니온 파인드로 순환을 찾는 짧은 예는 [그래프 탐색](post.html?id=algorithm-graph-search) 편, Counter 와 세는 법 비교는 [해시와 정렬](post.html?id=algorithm-hash-sort) 편에 있습니다.
- 지문에서 구조를 고르는 전체 순서는 [풀이 템플릿](post.html?id=algorithm-solving-steps) 편, 상태가 있는 작은 클래스와 요구가 늘어나는 문제는 [실무형 라이브 코딩](post.html?id=algorithm-practical-live-coding) 편, 풀이를 말로 설명하는 순서는 [말하며 풀기](post.html?id=algorithm-think-aloud) 편에 있습니다.
