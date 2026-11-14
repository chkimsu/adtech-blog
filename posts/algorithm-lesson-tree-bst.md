지훈 씨는 힙과 Top K(값 N개에서 가장 큰 K개를 고르는 문제)를 배운 뒤 트리로 넘어가며 말했습니다. 「트리는 종류가 너무 많던데 어떤 종류의 트리가 있는지 말해 주세요.」 코딩테스트에 나오는 트리 문제의 유형을 들은 뒤에는 이렇게 물었습니다. 「이런 순회나 트리 구조를 코드로 직접 구현하나요?」

순회(traversal, 모든 노드를 정해진 차례로 한 번씩 방문하는 일)는 직접 짜고 트리 구조는 만들지 않습니다. 트리(tree)는 맨 위 노드인 루트(root)에서 아래로만 갈라지는 자료구조이고 이진 트리(binary tree)는 노드마다 자식이 많아야 2개인 트리입니다. LeetCode 는 트리를 배열로 보여 주고 채점할 때는 그 배열로 만든 트리의 루트 하나를 함수에 넘깁니다.

**root 하나만 받은 함수는 트리를 어떻게 따라 내려가고 어디서 멈출까요?**

이 글은 루트에서 가장 먼 잎(자식이 없는 노드)까지의 층 수를 높이, 비어 있는 자식 자리를 None 자식이라고 부릅니다. 함수는 root.left 와 root.right 로 내려가다 None 자식에서 멈춥니다. 정해진 규칙대로 값을 넣은 이진 탐색 트리(BST)는 비교할 때마다 한쪽을 버리지만 비교 횟수가 높이를 따라가서 같은 값 7개라도 넣는 순서에 따라 80 을 찾는 비교가 3번 또는 7번입니다.

> **한 줄 요약:** LeetCode 는 트리를 층별 순서에 null 을 넣은 배열로 보여 주고 그 배열로 만든 트리의 root 하나를 넘기므로, 풀이는 트리를 만들지 않고 root.left 와 root.right 로 내려가는 재귀나 큐만 씁니다. 재귀의 `if not root` 는 잎이 아니라 None 자식에서 참입니다. 경로를 따라 .val 을 읽다 None 을 만나면 AttributeError 가 납니다. 이진 탐색 트리(BST)는 노드마다 왼쪽 부분 트리의 모든 값이 노드보다 작고 오른쪽 부분 트리의 모든 값이 노드보다 커서 중위 순회로 읽으면 정렬된 배열이 나옵니다. 값 하나를 비교하는 데 O(1) 이면 BST 에서 값을 찾고 넣는 비용은 높이 h 에 비례하는 O(h) 이고 균형이면 O(log N), 정렬된 순서로 넣으면 O(N) 입니다.

> **골라 읽는 법** — 절이 10개인 긴 글입니다. 처음부터 다 읽지 않아도 됩니다.
>
> - 트리의 종류와 높이 → 1절
> - LeetCode 가 주는 트리 입력과 None 에서 나는 오류 → 2~3절
> - root 하나로 푸는 LeetCode 문제 3개(104, 226, 102) → 4~6절
> - BST 와 중위 순회, LeetCode 230 → 7~8절
> - 넣는 순서와 높이, 이진 탐색과 BST 와 힙의 비교 → 9~10절

---

## 1. 트리의 종류와 높이

**트리는 노드가 층마다 차 있는 모양으로 한 번, 노드에 값을 두는 규칙으로 한 번 나눕니다. 모양으로는 이진 트리, 포화 이진 트리, 완전 이진 트리, 편향 트리가 있고 규칙으로는 이진 탐색 트리(BST), 힙, 자가 균형 BST 가 있습니다. 높이는 루트에서 가장 먼 잎까지의 층 수입니다.**

지훈 씨는 이 질문을 처음 할 때 완전 이진 트리에서 두 번째로 큰 값을 찾는 문제를 풀어 봤다고 덧붙였습니다. BST 에서 찾는 방법은 9절에서 봅니다. 과외에서 코딩테스트의 트리가 딱 세 가지로 정리된다며 붙인 비율과 출제 빈도 별점은 출처가 없어 지웁니다.

층은 루트를 0층으로 두고 자식으로 한 번 내려갈 때마다 하나씩 늘어납니다. 아래 네 트리는 모두 이진 트리이고 노드 값은 모든 층이 꽉 찬 트리에서 층별로 매긴 번호입니다.

```text
        A                 B                 C               D
        1                 1                 1               1
      /   \             /   \             /   \              \
     2     3           2     3           2     3              2
    / \   / \         / \   /             \   / \              \
   4   5 6   7       4   5 6               5 6   7              3
```

부분 트리(subtree)는 어떤 노드와 그 아래의 모든 자손으로 된 트리이고 회전(rotation)은 부모와 자식의 위아래를 바꾸고 부분 트리를 옮겨 붙이는 연산입니다. 아래 표가 그림의 네 트리와 규칙으로 나눈 세 트리의 정의입니다.

| 이름 | 기준 | 정의 | 예 |
|---|---|---|---|
| 이진 트리 | 모양 | 노드마다 자식이 많아야 2개 | 그림의 A, B, C, D |
| 포화 이진 트리(perfect) | 모양 | 모든 층이 꽉 차 있다. 높이가 h 면 노드가 2^h - 1 개 | A (높이 3, 노드 7개) |
| 완전 이진 트리(complete) | 모양 | 마지막 층을 빼고 꽉 차 있고 마지막 층은 왼쪽부터 빈칸 없이 채운다 | A, B |
| 편향 트리(skewed) | 모양 | 모든 노드의 자식이 하나 이하이고 한쪽으로만 이어진다 | D |
| 이진 탐색 트리(BST) | 규칙 | 노드마다 왼쪽 부분 트리의 모든 값 < 노드의 값 < 오른쪽 부분 트리의 모든 값 | 7절의 값 7개 |
| 힙 | 규칙 | 완전 이진 트리이고 최소 힙은 부모 ≤ 자식, 최대 힙은 부모 ≥ 자식 | 힙과 Top K 편 |
| 자가 균형 BST | 규칙 | 넣고 뺄 때 회전으로 높이를 O(log N) 으로 지키는 BST | AVL 트리, 레드-블랙 트리 |

완전 이진 트리는 과외의 「위에서 아래로, 왼쪽부터 빈틈없이」가 교과서 정의와 같아서 A 도 완전 이진 트리이고 마지막 층의 맨 왼쪽 자리가 빈 C 는 아닙니다. 영어 full binary tree 는 책에 따라 포화 이진 트리를 뜻하기도 하고 모든 노드의 자식이 0개나 2개인 트리를 뜻하기도 해서 이 글은 쓰지 않습니다. 과외의 BST 규칙 「왼쪽 자식 < 나 < 오른쪽 자식」은 BST 가 아닌 트리도 통과시켜서 7절의 반례로 고칩니다. 힙 규칙 「부모 > 자식」은 heapq [공식 문서](https://docs.python.org/3/library/heapq.html)의 `heap[k] <= heap[2*k+1]` 처럼 같은 값도 되므로 표처럼 고칩니다. 힙을 리스트에 담는 방법은 힙의 내부 글에서 다룹니다. 자가 균형 BST 를 구현하라는 문제는 절대 나오지 않는다는 과외의 말은 출처가 없어 지웁니다.

높이는 LeetCode 104 가 maximum depth 라고 부르는 값이고 문제는 이 값을 루트에서 가장 먼 잎까지 가는 길에 있는 노드 수로 정의합니다. 그림의 네 트리는 모두 높이 3 입니다. 교과서 가운데는 높이를 그 길의 간선(두 노드를 연결하는 선) 수로 세는 책도 있어 그 값은 층 수보다 1 작고 이 시리즈의 [트리와 힙](post.html?id=algorithm-tree-heap) 편도 간선 수로 셉니다. 이 글의 높이는 LeetCode 와 같은 층 수입니다.

## 2. LeetCode 의 트리 입력과 TreeNode

**LeetCode 는 트리를 층별 순서(위층부터, 같은 층은 왼쪽부터)로 적고 자식이 없는 자리에 null 을 넣은 배열로 보여 주며 채점할 때 그 배열로 TreeNode 를 만들어 연결하고 루트 하나를 root 로 넘깁니다. TreeNode 는 val, left, right 를 속성으로 담는 객체라 dict 처럼 키로 읽지 않습니다.**

LeetCode 의 트리 문제는 화면 위쪽에 `TreeNode` 클래스가 주석으로 적혀 있고 풀 함수는 `def maxDepth(self, root: TreeNode | None) -> int:` 처럼 root 하나를 받습니다. `X | None` 꼴은 Python 3.10 에 들어온 문법이라([공식 문서](https://docs.python.org/3/library/stdtypes.html#types-union)의 「Added in version 3.10」) 3.9 에서는 함수를 정의하는 순간 TypeError 가 납니다. 그래서 이 글의 블록은 같은 뜻의 `Optional[TreeNode]` 로 적습니다. 과외의 「LeetCode 나 프로그래머스 같은 플랫폼」은 LeetCode 로 좁힙니다. 채점 쪽이 예제 배열 `[3,9,20,null,null,15,7]` 을 트리로 바꾸므로 LeetCode 에 내는 코드에는 트리를 만드는 줄이 없습니다. 이 글의 블록은 내 컴퓨터에서 돌리려고 같은 일을 하는 `build_tree` 를 둡니다.

지훈 씨가 다시 물었습니다. 「그럼 이진 탐색 트리나 이런 트리들은 모두 구현을 해서 주나요?」 BST 문제도 root 로 받습니다(8절의 230 은 `kthSmallest(self, root, k)`). 다만 정렬된 배열로 높이가 균형 잡힌 BST 를 만드는 LeetCode 108 처럼 트리를 만들어 돌려 달라는 문제는 풀이가 TreeNode 를 직접 만듭니다. 과외에서 108 을 「유일하게」 직접 만드는 예외라고 하며 붙인 비율은 출처가 없어 지웁니다.

배열은 이렇게 트리가 됩니다. 0번 칸으로 루트를 만들어 큐에 넣고 큐에서 노드를 하나 꺼낼 때마다 배열의 다음 두 칸을 그 노드의 왼쪽 자식과 오른쪽 자식으로 붙입니다. 칸이 null 이면 그 자리는 None 자식이고 큐에도 넣지 않습니다. 아래 코드는 LeetCode 104 의 예제 1 배열로 트리를 만들어 값을 읽습니다.

```python
# 하는 일: LeetCode 104 예제 1 의 배열을 build_tree 로 트리로 만들어 root 에서 .left 와 .right 로 내려가며 값을 읽는다.
from collections import deque  # 배열을 층별 순서로 읽는 큐

# 1단계: TreeNode 와 build_tree 를 만든다
# LeetCode 화면의 주석과 같은 TreeNode 를 두고, 채점 쪽이 하는 일을 build_tree 가 대신한다.
class TreeNode:  # LeetCode 화면의 주석과 같은 클래스
    def __init__(self, val=0, left=None, right=None):  # 값과 두 자식을 받는다
        self.val = val  # 노드의 값
        self.left = left  # 왼쪽 자식. 없으면 None
        self.right = right  # 오른쪽 자식. 없으면 None

def build_tree(values):  # LeetCode 배열로 트리를 만든다
    if not values or values[0] is None:  # 빈 배열이면
        return None  # 트리가 없다
    root = TreeNode(values[0])  # 0번 칸이 루트다
    queue, i = deque([root]), 1  # 자식을 붙일 노드와 다음에 읽을 칸
    while queue and i < len(values):  # 둘 다 남아 있는 동안
        node = queue.popleft()  # 자식을 붙일 노드
        if values[i] is not None:  # 왼쪽 칸이 null 이 아니면
            node.left = TreeNode(values[i])  # 왼쪽 자식을 만들고
            queue.append(node.left)  # 큐에 넣는다
        i += 1  # 오른쪽 칸으로
        if i < len(values) and values[i] is not None:  # 오른쪽 칸이 있고 null 이 아니면
            node.right = TreeNode(values[i])  # 오른쪽 자식을 만들고
            queue.append(node.right)  # 큐에 넣는다
        i += 1  # 다음 노드의 왼쪽 칸으로
    return root  # 루트를 돌려준다

# 2단계: 예제 1 을 트리로 만들고 값을 읽는다
root = build_tree([3, 9, 20, None, None, 15, 7])  # 파이썬의 None 이 LeetCode 의 null 이다
print(f'type(root) = {type(root).__name__}, root.val = {root.val}')  # 함수가 받는 것은 노드 하나다
print(f'root.left.val = {root.left.val}, root.right.val = {root.right.val}')  # 1층
print(f'root.right.left.val = {root.right.left.val}, root.right.right.val = {root.right.right.val}')  # 2층
print(f'root.left.left = {root.left.left}, root.left.right = {root.left.right}')  # 배열 3, 4번 칸의 null

# 출력:
# 2단계 뜻: 함수가 받는 root 는 TreeNode 하나이고 .left 와 .right 로 내려가며 층마다 값을 읽는다.
# type(root) = TreeNode, root.val = 3
# root.left.val = 9, root.right.val = 20
# root.right.left.val = 15, root.right.right.val = 7
# root.left.left = None, root.left.right = None
```

함수가 받는 root 는 TreeNode 하나였고 배열 3, 4번 칸의 null 은 9 의 None 자식이 됐습니다. 지훈 씨는 이 코드를 보고 물었습니다. 「아, 트리 노드들이 모두 구현이 되어 있는 게 아니고 값이 할당되어 있다는 거예요?」 맞습니다. 지훈 씨의 말을 다시 하면 TreeNode 는 스스로 찾거나 계산하는 부품이 아니라 값 세 개가 할당된 객체이며 실제로 메서드는 `__init__` 하나뿐입니다. TreeNode 객체를 값 세 개가 든 바구니로 떠올리면 `vars(TreeNode(3))` 가 돌려주는 `{'val': 3, 'left': None, 'right': None}` 이 그 안의 값입니다. 공식 문서의 [데이터 모델](https://docs.python.org/3/reference/datamodel.html#object.__dict__)은 `object.__dict__` 를 객체의 (쓸 수 있는) 속성을 담는 사전이나 다른 매핑 객체로 적고 [vars()](https://docs.python.org/3/library/functions.html#vars) 는 이 `__dict__` 를 돌려줍니다.

과외에서 저는 TreeNode 가 dict 와 완전히 같다고 했는데 값 세 개를 담는다는 점만 같습니다. TreeNode 는 `node.val` 처럼 속성(`.`)으로 읽고 dict 는 `d['val']` 처럼 키(`[]`)로 읽어서 둘을 바꿔 쓰면 오류가 납니다.

```python
# 하는 일: TreeNode 하나와 같은 값을 담은 dict 하나를 만들어 담긴 값을 비교하고, 읽는 법을 바꿔 쓰면 나는 오류를 찍는다.
# 1단계: TreeNode 를 만든다
class TreeNode:  # LeetCode 화면의 주석과 같은 클래스
    def __init__(self, val=0, left=None, right=None):  # 값과 두 자식을 받는다
        self.val = val  # 노드의 값
        self.left = left  # 왼쪽 자식
        self.right = right  # 오른쪽 자식

# 2단계: 담긴 값과 읽는 법을 비교한다
node = TreeNode(3)  # 자식이 없는 노드 하나
as_dict = {'val': 3, 'left': None, 'right': None}  # 같은 값을 담은 dict
print(f'vars(node) = {vars(node)}, as_dict 와 같음 {vars(node) == as_dict}')  # 인스턴스 속성은 __dict__ 에 있다
print(f"node.val = {node.val}, as_dict['val'] = {as_dict['val']}")  # 속성과 키

# 3단계: 읽는 법을 바꿔 쓴다
reads = (("node['val']", lambda: node['val']), ('as_dict.val', lambda: as_dict.val))  # 바꿔 쓴 두 읽기
for text, read in reads:  # 하나씩 돌려 본다
    try:  # 오류가 나면 이름과 문장을 찍는다
        read()  # 읽어 본다
    except (TypeError, AttributeError) as error:  # 두 오류를 받는다
        print(f'{text} → {type(error).__name__}: {error}')  # 오류 이름과 문장

# 출력:
# 2단계 뜻: TreeNode 의 속성은 dict 와 같은 값이지만 TreeNode 는 속성으로, dict 는 키로 읽는다.
# vars(node) = {'val': 3, 'left': None, 'right': None}, as_dict 와 같음 True
# node.val = 3, as_dict['val'] = 3
# 3단계 뜻: 읽는 법을 바꾸면 TreeNode 는 TypeError, dict 는 AttributeError 를 낸다.
# node['val'] → TypeError: 'TreeNode' object is not subscriptable
# as_dict.val → AttributeError: 'dict' object has no attribute 'val'
```

TreeNode 를 키로 읽으면 TypeError, dict 를 속성으로 읽으면 AttributeError 가 났고 LeetCode 의 트리 문제는 `root.val`, `root.left`, `root.right` 꼴만 씁니다.

아래 데모는 같은 배열이 트리가 되는 순서를 보여 줍니다. 「다음 층」을 한 번 누르면 이번 단계 칸에 「배열 0번 칸 3으로 루트를 만듭니다.」가 나오고 상태 칸에 `0층 [3]` 이 생깁니다. 두 번째에는 `1층 [9, 20]` 이, 세 번째에는 null 두 칸이 9 의 None 자식(점선 노드)이 되며 `2층 [15, 7]` 이 생깁니다. 네 번째에는 root.right.left 까지 경로를 따라가 결과 칸에 「root.right.left.val = 15」가 나옵니다. 「한 칸」은 이 경로를 한 노드씩 따라갑니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-lesson-tree-bst.html?embed=1&mode=build&preset=example-1" height="820" loading="lazy" title="LeetCode 배열이 트리가 되는 순서 미니 데모"></iframe>
<a class="demo-embed-open" href="demo-lesson-tree-bst.html?mode=build&preset=example-1" target="_blank" rel="noopener">↗ 전체 데모로 열기</a>
</div>

## 3. None 에서 나는 오류

**`root.right.left.val` 은 LeetCode 104 의 예제 1 에서 15 이지만 예제 2 `[1, null, 2]` 에서는 root.right.left 가 None 이라 .val 을 읽다 `AttributeError: 'NoneType' object has no attribute 'val'` 가 납니다. 재귀 풀이의 첫 줄 `if not root` 는 root 가 None 일 때만 참이라 잎 노드에서는 걸리지 않습니다.**

지훈 씨는 104 화면에서 예제 1 의 그림을 보며 `print(root.right.left.val)` 을 넣고 실행했다가 오류를 보고 물었습니다. 「왜 여기서 에러가 생기죠?」 LeetCode 가 예제 2 `[1, null, 2]` 로도 코드를 돌렸고 그 트리에는 root.right.left 가 없기 때문입니다. 화면 아래의 Last Executed Input 이 `root = [1,null,2]` 였습니다. 예제 2 는 루트 1 의 왼쪽이 None 자식이고 오른쪽 자식 2 는 두 자식이 모두 None 이라서 root.right.left 가 None 이고 None 에는 val 속성이 없습니다.

과외에서 마침표를 이어 찍으면 오류가 난다며 붙인 비율은 출처가 없어 지웁니다. 테스트 예제마다 트리 모양이 달라서 고정된 경로로 .val 을 읽는 코드는 그 경로에 None 이 있는 입력에서 오류가 납니다. 아래 코드는 두 예제의 트리를 `TreeNode(값, 왼쪽, 오른쪽)` 으로 직접 연결해(예제 2 는 `TreeNode(1, None, TreeNode(2))`) 같은 경로를 읽고 `not` 이 참이 되는 값을 찍습니다.

```python
# 하는 일: LeetCode 104 의 두 예제 트리를 TreeNode 로 직접 연결해 root.right.left.val 을 읽고, 잎 노드와 None 자식과 값이 0 인 노드에서 not 이 무엇인지 찍는다.
# 1단계: TreeNode 로 두 예제를 연결한다
# TreeNode(값, 왼쪽, 오른쪽) 으로 만들면 build_tree 가 배열로 만드는 트리와 같다.
class TreeNode:  # LeetCode 화면의 주석과 같은 클래스
    def __init__(self, val=0, left=None, right=None):  # 값과 두 자식을 받는다
        self.val = val  # 노드의 값
        self.left = left  # 왼쪽 자식. 없으면 None
        self.right = right  # 오른쪽 자식. 없으면 None

example1 = TreeNode(3, TreeNode(9), TreeNode(20, TreeNode(15), TreeNode(7)))  # [3, 9, 20, null, null, 15, 7]
example2 = TreeNode(1, None, TreeNode(2))  # [1, null, 2]. 1 의 왼쪽 자식이 없다

# 2단계: 두 예제에서 같은 경로를 읽는다
for name, root in (('예제 1', example1), ('예제 2', example2)):  # 채점 쪽이 넘기는 두 root
    try:  # 오류가 나면 이름과 문장을 찍는다
        print(f'{name}: root.right.left.val = {root.right.left.val}')  # 고정된 경로를 읽는다
    except AttributeError as error:  # None 에서 .val 을 읽으면 난다
        print(f'{name}: root.right.left = {root.right.left}, AttributeError: {error}')  # 경로의 끝이 None 이다

# 3단계: not 이 참이 되는 값을 본다
# TreeNode 는 __bool__ 도 __len__ 도 없어 늘 참이고 None 만 거짓이다.
leaf = example1.right.left  # 자식이 없는 잎 노드 15
for text, node in (('잎 노드 15', leaf), ('15 의 왼쪽 자식', leaf.left), ('값이 0 인 노드', TreeNode(0))):  # 세 값
    print(f'{text}: not node = {not node}')  # if not root 가 걸리는지

# 출력:
# 2단계 뜻: 예제 1 은 15 를 읽고 예제 2 는 root.right.left 가 None 이라 .val 에서 오류가 난다.
# 예제 1: root.right.left.val = 15
# 예제 2: root.right.left = None, AttributeError: 'NoneType' object has no attribute 'val'
# 3단계 뜻: not 은 None 자식에서만 참이고 잎 노드와 값이 0 인 노드에서는 거짓이다.
# 잎 노드 15: not node = False
# 15 의 왼쪽 자식: not node = True
# 값이 0 인 노드: not node = False
```

3단계에서 `not node` 는 None 자식에서만 True 였습니다. [공식 문서](https://docs.python.org/3/library/stdtypes.html#truth-value-testing)는 클래스가 False 를 돌려주는 `__bool__()` 이나 0 을 돌려주는 `__len__()` 을 두지 않으면 객체를 참으로 본다고 적고 TreeNode 는 둘 다 없어서 잎 노드도 값이 0 인 노드도 참입니다. 그래서 `if not root:` 는 「root 가 None 이면」과 같은 뜻입니다.

과외에서 104 풀이의 첫 줄에 단 주석 「노드가 없거나, 자식이 없는 바닥에 도달하면 깊이는 0」은 뒤쪽이 틀렸습니다. 잎은 None 이 아니라서 그 줄을 지나 두 None 자식에서 0 을 받고 1 을 돌려줍니다(4절).

아래 데모는 예제 2 를 같은 경로로 따라갑니다. 「끝까지」를 누르면 root.right.left 인 2 의 None 자식(점선 노드)이 붉게 칠해지고 결과 칸에 `AttributeError: 'NoneType' object has no attribute 'val'` 이 붉은 글자로 나옵니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-lesson-tree-bst.html?embed=1&mode=build&preset=example-2" height="870" loading="lazy" title="예제 2 에서 None 의 val 을 읽는 오류 미니 데모"></iframe>
<a class="demo-embed-open" href="demo-lesson-tree-bst.html?mode=build&preset=example-2" target="_blank" rel="noopener">↗ 전체 데모로 열기</a>
</div>

## 4. Maximum Depth of Binary Tree (LeetCode 104, Easy)

**LeetCode 104 는 이진 트리의 높이를 구하라고 합니다. maxDepth 는 root 가 None 이면 0 을 돌려주고 아니면 root.left 와 root.right 를 차례로 자기 자신에게 넘겨 받은 두 높이 가운데 큰 쪽에 1 을 더해 돌려줍니다. 예제 1 에서는 노드 5개와 None 자식 6개에 한 번씩, 모두 11번 부릅니다.**

[LeetCode 104. Maximum Depth of Binary Tree](https://leetcode.com/problems/maximum-depth-of-binary-tree/) 는 이진 트리의 root 를 주고 높이를 돌려 달라고 합니다. 첫 예제 `root = [3, 9, 20, null, null, 15, 7]` 은 3, 20, 15 를 지나는 길이 가장 길어 3 이 답이고 둘째 예제 `root = [1, null, 2]` 는 2 입니다. 노드는 0개 이상 10,000개 이하입니다.

지훈 씨가 이 풀이를 보고 물었습니다. 「위에 코드에서 root 랑 트리 구조가 어떻게 코드에서 사용된 거예요?」 root 는 노드 하나이고 코드는 그 노드의 두 자식을 같은 함수에 다시 넘깁니다. 노드의 높이는 두 자식을 루트로 하는 부분 트리의 높이 가운데 큰 값에 자기 층 1 을 더한 값이고 None 자식은 노드가 없어 높이가 0 입니다.

1. root 가 None 이면 0 을 돌려줍니다.
2. `self.maxDepth(root.left)` 로 왼쪽 부분 트리의 높이를 받습니다.
3. `self.maxDepth(root.right)` 로 오른쪽 부분 트리의 높이를 받습니다.
4. `1 + max(왼쪽, 오른쪽)` 을 돌려줍니다.

```python
# 하는 일: LeetCode 104 를 재귀로 풀어 예제 1 에서 노드마다 받은 값과 돌려준 값, maxDepth 를 부른 횟수를 찍고 예제 2 와 빈 트리의 답을 찍는다.
from collections import deque  # 배열을 층별 순서로 읽는 큐
from typing import Optional  # LeetCode 화면의 TreeNode | None 을 3.9 에서 쓰는 꼴

# 1단계: TreeNode 와 build_tree 를 만든다
# 2절과 같은 코드다.
class TreeNode:  # LeetCode 화면의 주석과 같은 클래스
    def __init__(self, val=0, left=None, right=None):  # 값과 두 자식을 받는다
        self.val = val  # 노드의 값
        self.left = left  # 왼쪽 자식. 없으면 None
        self.right = right  # 오른쪽 자식. 없으면 None

def build_tree(values):  # LeetCode 배열로 트리를 만든다
    if not values or values[0] is None:  # 빈 배열이면
        return None  # 트리가 없다
    root = TreeNode(values[0])  # 0번 칸이 루트다
    queue, i = deque([root]), 1  # 자식을 붙일 노드와 다음에 읽을 칸
    while queue and i < len(values):  # 둘 다 남아 있는 동안
        node = queue.popleft()  # 자식을 붙일 노드
        if values[i] is not None:  # 왼쪽 칸이 null 이 아니면
            node.left = TreeNode(values[i])  # 왼쪽 자식을 만들고
            queue.append(node.left)  # 큐에 넣는다
        i += 1  # 오른쪽 칸으로
        if i < len(values) and values[i] is not None:  # 오른쪽 칸이 있고 null 이 아니면
            node.right = TreeNode(values[i])  # 오른쪽 자식을 만들고
            queue.append(node.right)  # 큐에 넣는다
        i += 1  # 다음 노드의 왼쪽 칸으로
    return root  # 루트를 돌려준다

# 2단계: 풀이를 만든다
# None 이면 0, 아니면 왼쪽 자식을 먼저 부르고 1 + max(왼쪽, 오른쪽) 을 돌려준다.
class Solution:  # LeetCode 가 정해 둔 클래스 이름 그대로 둔다
    calls = 0  # maxDepth 를 부른 횟수. 이 글이 붙인 값
    def maxDepth(self, root: Optional[TreeNode], trace: bool = False) -> int:  # trace 는 이 글이 붙인 인자
        self.calls += 1  # 부를 때마다 센다
        if not root:  # root 가 None 일 때만 참이다
            return 0  # None 자식은 높이 0
        left = self.maxDepth(root.left, trace)  # 왼쪽 부분 트리의 높이를 먼저 받는다
        right = self.maxDepth(root.right, trace)  # 그다음 오른쪽 부분 트리의 높이
        depth = 1 + max(left, right)  # 더 높은 쪽에 자기 층 1 을 더한다
        if trace:  # 따라가기를 켰으면
            print(f'노드 {root.val}: 1 + max({left}, {right}) = {depth}')  # 받은 값과 돌려줄 값
        return depth  # 부모에게 돌려준다

# 3단계: 예제 1 을 따라간다
solution = Solution()  # 부른 횟수를 셀 객체
answer = solution.maxDepth(build_tree([3, 9, 20, None, None, 15, 7]), trace=True)  # 돌려줄 때마다 찍는다
print(f'답 {answer}, maxDepth 호출 {solution.calls}번')  # 노드 5개와 None 자식 6개

# 4단계: 예제 2 와 빈 트리의 답을 본다
for values in ([1, None, 2], []):  # 노드 2개와 0개
    solution = Solution()  # 입력마다 횟수를 새로 센다
    print(f'{values} → {solution.maxDepth(build_tree(values))}, 호출 {solution.calls}번')  # 답과 부른 횟수

# 출력:
# 3단계 뜻: 잎 9, 15, 7 이 1 을, 20 이 2 를, 루트 3 이 3 을 돌려주고 호출은 11번이다.
# 노드 9: 1 + max(0, 0) = 1
# 노드 15: 1 + max(0, 0) = 1
# 노드 7: 1 + max(0, 0) = 1
# 노드 20: 1 + max(1, 1) = 2
# 노드 3: 1 + max(1, 2) = 3
# 답 3, maxDepth 호출 11번
# 4단계 뜻: 답은 2, 0 이고 호출은 노드가 N개일 때 2N + 1 번이다.
# [1, None, 2] → 2, 호출 5번
# [] → 0, 호출 1번
```

왼쪽 자식을 먼저 부르므로 잎 9, 15, 7 이 먼저 1 을 돌려줬고 20 이 2 를, 루트 3 이 1 + max(1, 2) = 3 을 돌려줬습니다. 노드가 N개인 이진 트리에는 자식 자리가 2N개 있고 그 가운데 N - 1 개가 노드라 None 자식은 N + 1 개이므로 부르는 횟수는 N + (N + 1) = 2N + 1 입니다. 예제 1 은 2 × 5 + 1 = 11번, 노드 2개인 예제 2 는 5번, 빈 트리는 1번입니다. 노드마다 한 번씩 보므로 시간 복잡도는 O(N) 이고 돌려주기 전의 호출이 많아야 높이 + 1 개 쌓이므로 공간 복잡도는 O(h) 입니다.

아래 데모는 같은 재귀를 반환 하나씩 보여 줍니다. 「다음 반환」을 한 번 누르면 단계 5 / 16 에서 이번 단계 칸에 「9의 두 자식이 None 이라 0, 0을 받아 1 + max(0, 0) = 1을 돌려줍니다.」가 나오고 9 아래에 1 이 적힙니다. 상태 칸의 호출 중에는 아직 돌려주지 않은 호출이 칩으로 쌓입니다. 「끝까지」를 누르면 결과 칸에 「높이 3」, 아랫줄에 「maxDepth 호출 11번(노드 5개, None 자식 6개)」이 나옵니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-lesson-tree-bst.html?embed=1&mode=depth&preset=example-1" height="1060" loading="lazy" title="LeetCode 104 높이를 구하는 재귀 미니 데모"></iframe>
<a class="demo-embed-open" href="demo-lesson-tree-bst.html?mode=depth&preset=example-1" target="_blank" rel="noopener">↗ 전체 데모로 열기</a>
</div>

## 5. Invert Binary Tree (LeetCode 226, Easy)

**LeetCode 226 은 이진 트리의 모든 노드에서 왼쪽 자식과 오른쪽 자식을 맞바꾼 트리의 root 를 돌려 달라고 합니다. 두 부분 트리를 재귀로 먼저 뒤집고 그 둘을 맞바꿔 넣은 뒤 root 를 돌려주며 104 와 달리 돌려주는 값이 정수가 아니라 노드입니다.**

[LeetCode 226. Invert Binary Tree](https://leetcode.com/problems/invert-binary-tree/) 는 이진 트리의 root 를 주고 좌우를 뒤집은 트리의 root 를 돌려 달라고 합니다. 첫 예제 `root = [4, 2, 7, 1, 3, 6, 9]` 는 `[4, 7, 2, 9, 6, 3, 1]`, 둘째 예제 `[2, 1, 3]` 은 `[2, 3, 1]`, 셋째 예제 `[]` 는 `[]` 가 답이고 노드는 100개 이하입니다. 과외에서 이 문제에 붙인 면접 일화는 출처가 없어 옮기지 않습니다.

트리 전체를 뒤집으면 루트의 왼쪽 부분 트리는 뒤집힌 채 오른쪽으로 가고 오른쪽 부분 트리는 뒤집힌 채 왼쪽으로 옵니다. 그래서 「부분 트리를 뒤집는다」는 같은 일을 자식에게 넘기고 돌려받은 두 루트를 맞바꿔 붙입니다. 답이 트리라서 아래 코드는 돌려받은 root 를 LeetCode 화면처럼 층별 배열로 바꾸는 `to_list` 를 둡니다.

1. root 가 None 이면 None 을 돌려줍니다.
2. 왼쪽과 오른쪽 부분 트리를 재귀로 뒤집어 두 루트를 받습니다.
3. `root.left` 에 뒤집은 오른쪽을, `root.right` 에 뒤집은 왼쪽을 넣습니다.
4. root 를 돌려줍니다.

과외에서 저는 104 의 마지막 줄만 `root.left, root.right = root.right, root.left` 로 바꾸면 226 이 풀린다고 했는데 그렇지 않습니다. 코드의 4단계가 그 함수를 돌려 봅니다.

```python
# 하는 일: LeetCode 226 을 재귀로 풀어 세 예제의 답을 층별 배열로 찍고, 104 의 마지막 줄만 맞바꾸기로 바꾼 함수가 무엇을 돌려주는지 본다.
from collections import deque  # 배열과 트리를 층별 순서로 읽는 큐
from typing import Optional  # LeetCode 화면의 TreeNode | None 을 3.9 에서 쓰는 꼴

# 1단계: TreeNode, build_tree, to_list 를 만든다
# build_tree 는 2절과 같고 to_list 는 거꾸로 트리를 층별 배열로 바꾼다.
class TreeNode:  # LeetCode 화면의 주석과 같은 클래스
    def __init__(self, val=0, left=None, right=None):  # 값과 두 자식을 받는다
        self.val = val  # 노드의 값
        self.left = left  # 왼쪽 자식. 없으면 None
        self.right = right  # 오른쪽 자식. 없으면 None

def build_tree(values):  # LeetCode 배열로 트리를 만든다
    if not values or values[0] is None:  # 빈 배열이면
        return None  # 트리가 없다
    root = TreeNode(values[0])  # 0번 칸이 루트다
    queue, i = deque([root]), 1  # 자식을 붙일 노드와 다음에 읽을 칸
    while queue and i < len(values):  # 둘 다 남아 있는 동안
        node = queue.popleft()  # 자식을 붙일 노드
        if values[i] is not None:  # 왼쪽 칸이 null 이 아니면
            node.left = TreeNode(values[i])  # 왼쪽 자식을 만들고
            queue.append(node.left)  # 큐에 넣는다
        i += 1  # 오른쪽 칸으로
        if i < len(values) and values[i] is not None:  # 오른쪽 칸이 있고 null 이 아니면
            node.right = TreeNode(values[i])  # 오른쪽 자식을 만들고
            queue.append(node.right)  # 큐에 넣는다
        i += 1  # 다음 노드의 왼쪽 칸으로
    return root  # 루트를 돌려준다

def to_list(root):  # 트리를 LeetCode 화면과 같은 층별 배열로 바꾼다
    values, queue = [], deque([root])  # 적을 값과 읽을 자리
    while queue:  # 읽을 자리가 남아 있는 동안
        node = queue.popleft()  # 층별 순서로 꺼낸다
        if node is None:  # None 자식 자리는
            values.append(None)  # null 로 적고
            continue  # 그 아래 자리는 적지 않는다
        values.append(node.val)  # 노드의 값을 적는다
        queue.extend([node.left, node.right])  # 두 자식 자리. None 이어도 넣는다
    while values and values[-1] is None:  # 끝에 남은 null 은
        values.pop()  # LeetCode 화면처럼 지운다
    return values  # 층별 배열

# 2단계: 풀이를 만든다
# 두 부분 트리를 먼저 뒤집고 맞바꿔 넣은 뒤 root 를 돌려준다.
class Solution:  # LeetCode 가 정해 둔 클래스 이름 그대로 둔다
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:  # 함수 이름과 인자는 화면 그대로
        if not root:  # None 이면
            return None  # 뒤집을 노드가 없다
        left = self.invertTree(root.left)  # 왼쪽 부분 트리를 뒤집은 루트
        right = self.invertTree(root.right)  # 오른쪽 부분 트리를 뒤집은 루트
        root.left, root.right = right, left  # 두 루트를 맞바꿔 넣는다
        return root  # 뒤집은 트리의 루트를 돌려준다

# 3단계: 세 예제를 돌린다
for values in ([4, 2, 7, 1, 3, 6, 9], [2, 1, 3], []):  # LeetCode 의 세 예제
    print(f'{values} → {to_list(Solution().invertTree(build_tree(values)))}')  # 돌려받은 root 를 배열로

# 4단계: 104 의 마지막 줄만 바꾼 함수를 돌린다
# 자식을 먼저 부른 뒤 맞바꾸므로 트리는 뒤집히지만 return 줄이 없다.
def max_depth_swapped(root):  # 104 의 return 줄 자리에 맞바꾸기를 넣은 함수
    if not root:  # 104 그대로
        return 0  # 104 그대로 정수를 돌려준다
    left_depth = max_depth_swapped(root.left)  # 104 그대로 왼쪽을 먼저 부른다
    right_depth = max_depth_swapped(root.right)  # 104 그대로 오른쪽을 부른다
    root.left, root.right = root.right, root.left  # 104 의 return 줄을 바꾼 줄
tree = build_tree([4, 2, 7, 1, 3, 6, 9])  # 첫 예제
print(f'돌려준 값 {max_depth_swapped(tree)}, 처음 만든 트리 {to_list(tree)}')  # 돌려준 값과 그 자리에서 바뀐 트리
print(f'빈 트리에서 돌려준 값 {max_depth_swapped(build_tree([]))}')  # [] 의 답은 None 이어야 한다

# 출력:
# 3단계 뜻: 세 예제 모두 LeetCode 의 답과 같은 층별 배열이 나온다.
# [4, 2, 7, 1, 3, 6, 9] → [4, 7, 2, 9, 6, 3, 1]
# [2, 1, 3] → [2, 3, 1]
# [] → []
# 4단계 뜻: 마지막 줄만 바꾼 함수는 트리를 뒤집지만 root 대신 None 을, 빈 트리에서는 0 을 돌려준다.
# 돌려준 값 None, 처음 만든 트리 [4, 7, 2, 9, 6, 3, 1]
# 빈 트리에서 돌려준 값 0
```

세 예제는 LeetCode 의 답과 같았습니다. 4단계의 함수도 두 자식을 먼저 부른 뒤 맞바꾸므로 트리는 그 자리에서 뒤집혔지만 return 줄이 없어 None 을, 빈 트리에서는 0 을 돌려줬습니다. LeetCode 는 돌려받은 값을 답으로 읽으므로 이 함수는 첫 예제의 답으로 빈 트리를 냅니다. 4단계 함수와 비교하면 226 은 root 가 None 일 때 `return 0` 대신 `return None` 을 하고 맞바꾸기 뒤에 `return root` 가 더 있습니다. 노드마다 한 번씩 맞바꾸므로 시간 복잡도는 O(N), 호출이 많아야 높이 + 1 개 쌓이므로 공간 복잡도는 O(h) 입니다.

## 6. Binary Tree Level Order Traversal (LeetCode 102, Medium)

**LeetCode 102 는 트리의 값을 층마다 왼쪽부터 모은 2차원 리스트를 돌려 달라고 합니다. 큐에 루트를 넣고 `for _ in range(len(queue))` 로 지금 큐에 든 노드 수만큼만 꺼내면 한 번에 한 층을 꺼내고 그 자식들이 다음 층으로 들어갑니다. LeetCode 배열이 층별 순서라서 답은 배열을 층마다 잘라 null 을 뺀 것과 같고 층 수가 104 의 답입니다.**

[LeetCode 102. Binary Tree Level Order Traversal](https://leetcode.com/problems/binary-tree-level-order-traversal/) 은 이진 트리의 root 를 주고 층별 순회(level-order traversal) 결과를 돌려 달라고 합니다. 첫 예제 `root = [3, 9, 20, null, null, 15, 7]` 은 `[[3], [9, 20], [15, 7]]`, 둘째 예제 `[1]` 은 `[[1]]`, 셋째 예제 `[]` 는 `[]` 이고 노드는 2,000개 이하입니다.

큐(queue)는 먼저 넣은 것을 먼저 꺼내는 자료구조입니다. 한 층의 노드를 꺼내며 자식을 큐 뒤에 넣으면 그 층을 다 꺼냈을 때 큐에는 다음 층만 남으므로, 반복을 시작할 때의 `len(queue)` 가 그 층의 노드 수입니다. [BFS](post.html?id=algorithm-lesson-bfs) 편 6절에서 격자를 겹마다 꺼낸 방식이 이 순회와 같은 순서입니다.

1. root 가 None 이면 빈 리스트를 돌려줍니다.
2. 큐에 root 를 넣습니다.
3. 큐가 빌 때까지 지금 큐의 길이만큼 노드를 꺼내 값을 한 층의 리스트에 모으고 None 이 아닌 자식을 큐에 넣습니다.
4. 한 층의 리스트를 결과에 붙입니다.

```python
# 하는 일: LeetCode 102 를 큐로 풀어 세 예제의 층별 값과 층 수를 찍는다.
from collections import deque  # 배열과 트리를 층별 순서로 읽는 큐
from typing import Optional  # LeetCode 화면의 TreeNode | None 을 3.9 에서 쓰는 꼴

# 1단계: TreeNode 와 build_tree 를 만든다
# 2절과 같은 코드다.
class TreeNode:  # LeetCode 화면의 주석과 같은 클래스
    def __init__(self, val=0, left=None, right=None):  # 값과 두 자식을 받는다
        self.val = val  # 노드의 값
        self.left = left  # 왼쪽 자식. 없으면 None
        self.right = right  # 오른쪽 자식. 없으면 None

def build_tree(values):  # LeetCode 배열로 트리를 만든다
    if not values or values[0] is None:  # 빈 배열이면
        return None  # 트리가 없다
    root = TreeNode(values[0])  # 0번 칸이 루트다
    queue, i = deque([root]), 1  # 자식을 붙일 노드와 다음에 읽을 칸
    while queue and i < len(values):  # 둘 다 남아 있는 동안
        node = queue.popleft()  # 자식을 붙일 노드
        if values[i] is not None:  # 왼쪽 칸이 null 이 아니면
            node.left = TreeNode(values[i])  # 왼쪽 자식을 만들고
            queue.append(node.left)  # 큐에 넣는다
        i += 1  # 오른쪽 칸으로
        if i < len(values) and values[i] is not None:  # 오른쪽 칸이 있고 null 이 아니면
            node.right = TreeNode(values[i])  # 오른쪽 자식을 만들고
            queue.append(node.right)  # 큐에 넣는다
        i += 1  # 다음 노드의 왼쪽 칸으로
    return root  # 루트를 돌려준다

# 2단계: 풀이를 만든다
# 반복을 시작할 때 큐에 든 노드가 한 층이다.
class Solution:  # LeetCode 가 정해 둔 클래스 이름 그대로 둔다
    def levelOrder(self, root: Optional[TreeNode]) -> list[list[int]]:  # 함수 이름과 인자는 화면 그대로
        if not root:  # 빈 트리면
            return []  # 층이 없다
        result, queue = [], deque([root])  # 층별 리스트와 0층의 루트
        while queue:  # 아직 꺼내지 않은 층이 있는 동안
            level = []  # 이번 층의 값
            for _ in range(len(queue)):  # 지금 큐에 든 노드 수만큼만 꺼낸다
                node = queue.popleft()  # 이번 층의 노드를 왼쪽부터 꺼낸다
                level.append(node.val)  # 값을 적는다
                if node.left:  # 왼쪽 자식이 있으면
                    queue.append(node.left)  # 다음 층으로 넣는다
                if node.right:  # 오른쪽 자식이 있으면
                    queue.append(node.right)  # 다음 층으로 넣는다
            result.append(level)  # 한 층을 결과에 붙인다
        return result  # 층별 2차원 리스트

# 3단계: 세 예제를 돌린다
for values in ([3, 9, 20, None, None, 15, 7], [1], []):  # LeetCode 의 세 예제
    levels = Solution().levelOrder(build_tree(values))  # 층별 값
    print(f'{values} → {levels}, 층 수 {len(levels)}')  # 층 수는 104 의 답과 같다

# 출력:
# 3단계 뜻: 세 예제 모두 LeetCode 의 답과 같은 층별 값이 나오고 층 수가 104 의 답과 같다.
# [3, 9, 20, None, None, 15, 7] → [[3], [9, 20], [15, 7]], 층 수 3
# [1] → [[1]], 층 수 1
# [] → [], 층 수 0
```

예제 1 의 층 수 3 은 104 의 답입니다. 다음 층의 칸 수는 이번 층에서 null 이 아닌 노드 수의 2배(1 × 2 = 2, 2 × 2 = 4)라서 예제 1 의 배열을 1칸 `[3]`, 2칸 `[9, 20]`, 4칸 `[null, null, 15, 7]` 으로 자르고 null 을 빼도 같은 값이 나옵니다. 노드마다 한 번씩 넣고 꺼내므로 시간 복잡도는 O(N) 이고 큐에는 가장 넓은 층이 한꺼번에 들어가는데 그 층이 N 에 비례할 수 있어 공간 복잡도는 O(N) 입니다.

2절의 데모가 이 순회를 같이 보여 줍니다. 「다음 층」을 누를 때마다 상태 칸에 `0층 [3]`, `1층 [9, 20]`, `2층 [15, 7]` 칩이 하나씩 생기고 결과 칸 아랫줄의 층별 값도 `[[3]]`, `[[3], [9, 20]]`, `[[3], [9, 20], [15, 7]]` 로 한 층씩 늘어납니다.

## 7. 이진 탐색 트리와 중위 순회

**중위 순회(in-order traversal)는 노드마다 왼쪽 부분 트리, 노드, 오른쪽 부분 트리의 차례로 값을 읽는 순회이고 BST 를 중위 순회하면 어느 모양이든 작은 값부터 정렬된 배열이 나옵니다. 이 글은 이 배열을 펼친 배열이라고 부릅니다. BST 에서 값을 찾는 경로는 정렬된 배열의 가운데 값부터 넣은 BST 에서만 이진 탐색이 비교하는 가운데 값의 순서와 같습니다.**

트리 종류를 들은 지훈 씨가 물었습니다. 「이진 탐색 트리를 펼치면 이진 탐색과 똑같은 건가요?」 반은 맞습니다. 펼친 배열은 늘 정렬돼 있지만 BST 에서 값을 찾는 경로가 이진 탐색과 같은 값을 비교하는지는 넣은 순서에 달렸습니다. 과외에서 저는 둘이 「완전히 같은 알고리즘」이고 이진 탐색이 고르는 mid 값을 그리면 「정확히 BST」라고 했는데 이 절에서 두 말을 좁히고 질문에 붙인 칭찬은 지웁니다.

펼친 배열이 정렬되는 까닭은 BST 규칙이 부분 트리 전체에 걸리기 때문입니다. 노드마다 먼저 읽는 왼쪽 부분 트리의 모든 값이 노드보다 작고 나중에 읽는 오른쪽 부분 트리의 모든 값은 노드보다 크며 같은 일이 부분 트리 안에서도 되풀이되므로 읽는 값이 늘 커집니다. 아래 코드는 과외에서 쓴 값 7개로 만든 BST, 부모와 자식만 보면 규칙을 지키는 `[5, 4, 6, null, null, 3, 7]`, 104 의 예제 1 트리를 펼쳐 정렬됐는지 봅니다.

```python
# 하는 일: 값 7개를 넣은 BST, 부모와 자식만 보면 규칙을 지키는 트리, LeetCode 104 예제 1 트리를 중위 순회로 펼쳐 정렬됐는지와 부모와 자식만 보는 검사의 결과를 찍는다.
# 1단계: TreeNode 를 만든다
class TreeNode:  # LeetCode 화면의 주석과 같은 클래스
    def __init__(self, val=0, left=None, right=None):  # 값과 두 자식을 받는다
        self.val = val  # 노드의 값
        self.left = left  # 왼쪽 자식. 없으면 None
        self.right = right  # 오른쪽 자식. 없으면 None

# 2단계: BST 에 넣기, 중위 순회, 부모와 자식만 보는 검사를 만든다
def insert(root, val):  # BST 에 값을 넣고 루트를 돌려준다
    if root is None:  # None 자식에 닿으면
        return TreeNode(val)  # 새 노드가 그 자리에 붙는다
    if val < root.val:  # 노드보다 작으면
        root.left = insert(root.left, val)  # 왼쪽 부분 트리에 넣는다
    else:  # 크면
        root.right = insert(root.right, val)  # 오른쪽 부분 트리에 넣는다
    return root  # 루트는 그대로다

def inorder(root, out):  # 왼쪽 부분 트리, 노드, 오른쪽 부분 트리 차례로 적는다
    if root:  # None 자식이면 적을 것이 없다
        inorder(root.left, out)  # 왼쪽 부분 트리를 먼저 다 적는다
        out.append(root.val)  # 그다음 노드의 값
        inorder(root.right, out)  # 마지막에 오른쪽 부분 트리
    return out  # 펼친 배열

def child_rule(root):  # 과외의 규칙: 부모와 바로 아래 자식만 비교한다
    if root is None:  # None 자식은
        return True  # 비교할 것이 없다
    if root.left and not root.left.val < root.val:  # 왼쪽 자식이 부모보다 작지 않거나
        return False  # 규칙을 어긴다
    if root.right and not root.val < root.right.val:  # 오른쪽 자식이 부모보다 크지 않으면
        return False  # 규칙을 어긴다
    return child_rule(root.left) and child_rule(root.right)  # 모든 부모에서 본다

# 3단계: 세 트리를 펼친다
bst = None  # 빈 BST
for v in [50, 30, 70, 20, 40, 60, 80]:  # 과외에서 쓴 값과 넣는 순서
    bst = insert(bst, v)  # 하나씩 넣는다
fake = TreeNode(5, TreeNode(4), TreeNode(6, TreeNode(3), TreeNode(7)))  # [5, 4, 6, null, null, 3, 7]
example1 = TreeNode(3, TreeNode(9), TreeNode(20, TreeNode(15), TreeNode(7)))  # [3, 9, 20, null, null, 15, 7]
trees = (('넣은 BST', bst), ('[5, 4, 6, null, null, 3, 7]', fake), ('104 예제 1', example1))  # 세 트리
for name, root in trees:  # 트리마다
    flat = inorder(root, [])  # 중위 순회로 펼친다
    print(f'{name}: 펼친 배열 {flat}, 정렬됨 {flat == sorted(flat)}, 부모와 자식 규칙 {child_rule(root)}')  # 두 검사

# 출력:
# 3단계 뜻: BST 만 펼친 배열이 정렬되고 부모와 자식만 보는 검사는 BST 가 아닌 트리도 통과시킨다.
# 넣은 BST: 펼친 배열 [20, 30, 40, 50, 60, 70, 80], 정렬됨 True, 부모와 자식 규칙 True
# [5, 4, 6, null, null, 3, 7]: 펼친 배열 [4, 5, 3, 6, 7], 정렬됨 False, 부모와 자식 규칙 True
# 104 예제 1: 펼친 배열 [9, 3, 15, 20, 7], 정렬됨 False, 부모와 자식 규칙 False
```

넣은 BST 하나만 펼친 배열이 정렬됐습니다. `[5, 4, 6, null, null, 3, 7]` 은 부모와 자식만 보면 규칙을 지키지만 6 의 왼쪽 자식 3 이 5 의 오른쪽 부분 트리에 있어서 5 보다 작은 값이 5 뒤에 나와 `[4, 5, 3, 6, 7]` 이 됐습니다. 104 예제 1 트리는 20 의 오른쪽 자식 7 이 20 보다 작아 `[9, 3, 15, 20, 7]` 이었습니다. 어떤 트리가 BST 인지 보려면 노드마다 부분 트리 전체의 값 범위를 봐야 하고 LeetCode 98(Validate Binary Search Tree)이 그 검사를 묻습니다.

질문의 나머지 반은 찾는 경로입니다. 펼친 배열에서 80 을 이진 탐색하면 mid 가 (0 + 6) // 2 = 3, (4 + 6) // 2 = 5, (6 + 6) // 2 = 6 이라 50, 70, 80 과 비교합니다. 넣는 순서 `[50, 30, 70, 20, 40, 60, 80]` 은 배열의 가운데 값 50, 양쪽 절반의 가운데 값 30 과 70, 그다음 가운데 값들의 차례라서 이 BST 에서 80 을 찾는 경로도 50, 70, 80 입니다. 작은 값부터 넣으면 펼친 배열은 같아도 BST 가 한 줄이 되어 경로가 20 부터 80 까지 7개입니다(9절). 이진 탐색 자체는 [이진 탐색](post.html?id=algorithm-lesson-binary-search) 편 2절에 있습니다.

아래 데모는 가운데 값부터 넣는 순서로 BST 를 만들고 펼칩니다. 「다음 값」을 다섯 번 누르면 이번 단계 칸에 「40을 넣습니다. 50보다 작아 왼쪽, 30보다 커서 오른쪽 빈자리에 둡니다.」가 나옵니다. 이 빈자리가 30 의 오른쪽 None 자식입니다. 두 번 더 누르면 값 7개가 다 들어가고 그다음부터는 누를 때마다 중위 순회로 한 값씩 방문해 트리 밑의 펼친 배열 칸이 왼쪽부터 채워집니다. 「끝까지」를 누르면 결과 칸에 「펼친 배열 [20, 30, 40, 50, 60, 70, 80]」, 아랫줄에 「높이 3, 넣을 때 비교 10번, 80을 찾으면 비교 3번」이 나옵니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-lesson-tree-bst.html?embed=1&mode=bst&preset=balanced" height="860" loading="lazy" title="가운데 값부터 넣은 BST 와 중위 순회 미니 데모"></iframe>
<a class="demo-embed-open" href="demo-lesson-tree-bst.html?mode=bst&preset=balanced" target="_blank" rel="noopener">↗ 전체 데모로 열기</a>
</div>

## 8. Kth Smallest Element in a BST (LeetCode 230, Medium)

**LeetCode 230 은 BST 에서 k번째로 작은 값을 돌려 달라고 합니다. 펼친 배열의 k번째 값이 답이라서 중위 순회를 스택으로 하다가 k번째로 방문한 노드에서 멈추면 펼친 배열 전체를 만들지 않아도 됩니다. 왼쪽 끝까지 내려가는 데 높이만큼, 방문에 k번이 들어 시간 복잡도는 O(h + k) 이고 스택에는 많아야 높이만큼 노드가 쌓여 공간 복잡도는 O(h) 입니다.**

[LeetCode 230. Kth Smallest Element in a BST](https://leetcode.com/problems/kth-smallest-element-in-a-bst/) 는 BST 의 root 와 정수 k 를 주고 모든 노드 값 가운데 k번째로 작은 값(1부터 센다)을 돌려 달라고 합니다. 첫 예제 `root = [3, 1, 4, null, 2]`, `k = 1` 은 1 이, 둘째 예제 `root = [5, 3, 6, 2, 4, null, null, 1]`, `k = 3` 은 3 이 답입니다. 노드 수를 n 이라 하면 1 ≤ k ≤ n ≤ 10,000 입니다.

7절의 재귀 중위 순회는 펼친 배열을 다 만들어야 끝납니다. 스택(stack)은 마지막에 넣은 것을 먼저 꺼내는 자료구조이고 재귀가 호출을 쌓던 일을 스택으로 직접 하면 k번째 방문에서 바로 함수를 끝낼 수 있습니다. 노드를 꺼내는 순간 그 노드의 왼쪽 부분 트리는 이미 다 방문했으므로 꺼낸 노드가 아직 방문하지 않은 값 가운데 가장 작습니다.

1. 지금 노드에서 왼쪽 자식으로 계속 내려가며 지나는 노드를 스택에 넣습니다.
2. 더 내려갈 수 없으면 스택에서 노드를 꺼내 방문 횟수에 1 을 더합니다.
3. 방문 횟수가 k 면 그 노드의 값을 돌려줍니다.
4. 아니면 그 노드의 오른쪽 자식으로 가서 1 부터 되풀이합니다.

```python
# 하는 일: LeetCode 230 을 스택으로 하는 중위 순회로 풀어 둘째 예제에서 방문할 때마다 스택을 찍고, 첫 예제의 답도 찍는다.
from collections import deque  # 배열을 층별 순서로 읽는 큐
from typing import Optional  # LeetCode 화면의 TreeNode | None 을 3.9 에서 쓰는 꼴

# 1단계: TreeNode 와 build_tree 를 만든다
# 2절과 같은 코드다.
class TreeNode:  # LeetCode 화면의 주석과 같은 클래스
    def __init__(self, val=0, left=None, right=None):  # 값과 두 자식을 받는다
        self.val = val  # 노드의 값
        self.left = left  # 왼쪽 자식. 없으면 None
        self.right = right  # 오른쪽 자식. 없으면 None

def build_tree(values):  # LeetCode 배열로 트리를 만든다
    if not values or values[0] is None:  # 빈 배열이면
        return None  # 트리가 없다
    root = TreeNode(values[0])  # 0번 칸이 루트다
    queue, i = deque([root]), 1  # 자식을 붙일 노드와 다음에 읽을 칸
    while queue and i < len(values):  # 둘 다 남아 있는 동안
        node = queue.popleft()  # 자식을 붙일 노드
        if values[i] is not None:  # 왼쪽 칸이 null 이 아니면
            node.left = TreeNode(values[i])  # 왼쪽 자식을 만들고
            queue.append(node.left)  # 큐에 넣는다
        i += 1  # 오른쪽 칸으로
        if i < len(values) and values[i] is not None:  # 오른쪽 칸이 있고 null 이 아니면
            node.right = TreeNode(values[i])  # 오른쪽 자식을 만들고
            queue.append(node.right)  # 큐에 넣는다
        i += 1  # 다음 노드의 왼쪽 칸으로
    return root  # 루트를 돌려준다

# 2단계: 풀이를 만든다
# 왼쪽 끝까지 쌓고 하나 꺼낼 때마다 센다. k번째에서 바로 돌려준다.
class Solution:  # LeetCode 가 정해 둔 클래스 이름 그대로 둔다
    def kthSmallest(self, root: Optional[TreeNode], k: int, trace: bool = False) -> int:  # trace 는 이 글이 붙인 인자
        stack, node, count = [], root, 0  # 왼쪽을 다 보지 않은 노드, 지금 노드, 방문 횟수
        while node or stack:  # 내려갈 노드나 꺼낼 노드가 있는 동안
            while node:  # 왼쪽 자식이 있는 동안
                stack.append(node)  # 지나는 노드를 쌓고
                node = node.left  # 왼쪽으로 내려간다
            node = stack.pop()  # 왼쪽을 다 본 노드. 남은 값 가운데 가장 작다
            count += 1  # 방문 1번
            if trace:  # 따라가기를 켰으면
                print(f'{count}번째 방문 {node.val}, 남은 스택 {[n.val for n in stack]}')  # 방문한 값과 스택
            if count == k:  # k번째면
                return node.val  # 펼친 배열을 다 만들지 않고 돌려준다
            node = node.right  # 오른쪽 부분 트리로 간다
        return -1  # k 가 노드 수 이하라 여기 오지 않는다

# 3단계: 둘째 예제를 따라가고 첫 예제의 답을 본다
print(f'답 {Solution().kthSmallest(build_tree([5, 3, 6, 2, 4, None, None, 1]), 3, trace=True)}')  # 방문마다 찍는다
print(f'[3, 1, 4, None, 2], k = 1 → {Solution().kthSmallest(build_tree([3, 1, 4, None, 2]), 1)}')  # 첫 예제의 답

# 출력:
# 3단계 뜻: 1, 2, 3 을 차례로 꺼내 세 번째 방문에서 멈추고 두 예제의 답은 1 과 3 이다.
# 1번째 방문 1, 남은 스택 [5, 3, 2]
# 2번째 방문 2, 남은 스택 [5, 3]
# 3번째 방문 3, 남은 스택 [5]
# 답 3
# [3, 1, 4, None, 2], k = 1 → 1
```

둘째 예제는 5, 3, 2, 1 을 쌓은 뒤 1, 2, 3 을 차례로 꺼내 세 번째 방문에서 3 을 돌려줬고 4, 5, 6 은 방문하지 않았습니다. 처음 왼쪽 끝까지 내려갈 때 스택에 노드가 높이만큼 쌓이고 그 뒤로 k번 꺼내므로 시간 복잡도는 O(h + k), 공간 복잡도는 O(h) 입니다.

7절의 데모에서 입력 목록의 「넣는 값 [5, 3, 6, 2, 4, 1], k = 3」을 고르면 이 순서로 넣어 둘째 예제와 같은 트리를 만듭니다. 「끝까지」를 누르면 방문 세 번 만에 멈추고 3 이 진한 파란색이 되며 결과 칸에 「3번째로 작은 값 3」, 아랫줄에 「높이 4, 중위 순회 3번째에서 멈춤」이 나옵니다. 같은 장면을 [전체 데모](demo-lesson-tree-bst.html?mode=bst&preset=leetcode-230)로도 열 수 있습니다.

## 9. 넣는 순서와 높이

**같은 값 7개를 가운데 값부터 넣으면 높이 3 인 BST 가 되어 넣을 때 비교 10번, 80 을 찾는 비교 3번이 들고 작은 값부터 넣으면 높이 7 이 되어 21번과 7번이 듭니다. BST 의 비용은 값의 개수가 아니라 높이 h 를 따라가서 O(h) 이고 균형이면 O(log N), 정렬된 순서로 넣으면 O(N) 입니다. 정렬된 리스트에 값 하나를 넣으면 자리는 이진 탐색으로 찾아도 뒤의 값을 미는 데 많아야 N칸이 듭니다.**

과외에서 저는 BST 의 값 찾기, 넣기, 빼기와 두 번째로 큰 값 찾기를 모두 O(log N) 이라 적고 정렬된 배열과 비교한 표에 「압도적 승리」를 붙였는데, 이 절에서 O(h) 로 고칩니다. BST 에서 값을 찾으면 비교 한 번에 한 층씩 내려가므로 비교 횟수는 많아야 높이이고 높이는 넣은 순서가 정합니다.

같은 과외에서 저는 펼친 배열에 35 를 넣으려면 40 부터 80 까지 밀어야 하고 값이 100만 개면 100만 번 밀어야 하지만 BST 는 포인터만 연결하면 되니 O(log N) 이라고 했습니다. BST 에서 가장 큰 값은 루트에서 오른쪽으로만 내려간 끝의 노드입니다. 1절에서 지훈 씨가 말한 두 번째로 큰 값은 BST 에서는 그 노드에 왼쪽 부분 트리가 없을 때 부모, 있을 때 그 왼쪽 부분 트리의 가장 큰 값입니다. 아래 코드는 7절의 값 7개를 두 순서로 넣어 높이와 비교 횟수를 셉니다. 이어서 80 아래에 왼쪽 부분 트리가 생기는 순서 `[50, 30, 80, 70, 60, 75]` 까지 세 BST 에서 두 번째로 큰 값을 찾고 35 를 정렬된 리스트와 BST 에 넣습니다.

```python
# 하는 일: 같은 값 7개를 가운데 값부터와 작은 값부터 BST 에 넣어 높이와 비교 횟수를 세고, 세 BST 에서 두 번째로 큰 값을 찾고, 35 를 정렬된 리스트와 BST 에 넣는 비용을 비교한다.
import bisect  # 정렬된 리스트에 넣는 insort

# 1단계: TreeNode 와 비교를 세는 경로, 넣기, 높이를 만든다
# 비교 횟수는 넣거나 찾으며 값을 비교한 노드 수다.
class TreeNode:  # LeetCode 화면의 주석과 같은 클래스
    def __init__(self, val=0, left=None, right=None):  # 값과 두 자식을 받는다
        self.val = val  # 노드의 값
        self.left = left  # 왼쪽 자식. 없으면 None
        self.right = right  # 오른쪽 자식. 없으면 None

def path_to(root, target):  # target 을 찾거나 None 자식에 닿을 때까지 비교한 노드의 값
    path, parent = [], None  # 비교한 값과 마지막에 비교한 노드
    while root:  # None 자식에 닿기 전까지
        path.append(root.val)  # 이 노드와 비교한다
        if target == root.val:  # 찾았으면
            break  # 멈춘다
        parent, root = root, (root.left if target < root.val else root.right)  # 작으면 왼쪽, 크면 오른쪽
    return path, parent  # 경로와 None 자식의 부모

def build_bst(order):  # order 의 순서로 넣은 BST 와 넣을 때 비교한 횟수
    root, compares = None, 0  # 빈 트리와 비교 횟수
    for v in order:  # 값을 하나씩
        if root is None:  # 첫 값은
            root = TreeNode(v)  # 비교 없이 루트가 된다
            continue  # 다음 값
        path, parent = path_to(root, v)  # None 자식까지 비교한다
        compares += len(path)  # 비교한 노드 수
        if v < parent.val:  # 부모보다 작으면
            parent.left = TreeNode(v)  # 왼쪽 자식으로 연결한다
        else:  # 크면
            parent.right = TreeNode(v)  # 오른쪽 자식으로 연결한다
    return root, compares  # 루트와 비교 횟수

def height(root):  # 104 의 maxDepth 와 같은 높이
    return 0 if root is None else 1 + max(height(root.left), height(root.right))  # None 은 0

# 2단계: 같은 값을 두 순서로 넣어 센다
for name, order in (('가운데 값부터', [50, 30, 70, 20, 40, 60, 80]), ('작은 값부터', [20, 30, 40, 50, 60, 70, 80])):  # 같은 값 7개
    root, compares = build_bst(order)  # 넣으며 비교를 센다
    print(f'{name}: 높이 {height(root)}, 넣을 때 비교 {compares}번, 80 을 찾는 비교 {len(path_to(root, 80)[0])}번')  # 세 값

# 3단계: 두 번째로 큰 값을 찾는다
# 가장 큰 값의 왼쪽 부분 트리가 없으면 부모, 있으면 그 부분 트리의 가장 큰 값이다.
def second_largest(root):  # 두 번째로 큰 값과 지난 노드의 값
    path, parent, node = [root.val], None, root  # 지난 값, 부모, 지금 노드
    while node.right:  # 가장 큰 값은 오른쪽 끝에 있다
        parent, node = node, node.right  # 한 층 내려간다
        path.append(node.val)  # 지난 값
    if node.left is None:  # 왼쪽 부분 트리가 없으면
        return parent.val, path  # 부모가 두 번째로 크다
    node = node.left  # 왼쪽 부분 트리로 가서
    path.append(node.val)  # 지난 값
    while node.right:  # 그 안의 오른쪽 끝까지
        node = node.right  # 한 층 내려간다
        path.append(node.val)  # 지난 값
    return node.val, path  # 왼쪽 부분 트리의 가장 큰 값
for order in ([50, 30, 70, 20, 40, 60, 80], [50, 30, 80, 70, 60, 75], [20, 30, 40, 50, 60, 70, 80]):  # 세 순서
    root, _ = build_bst(order)  # BST 를 만든다
    value, path = second_largest(root)  # 두 번째로 큰 값
    print(f'{order}: 두 번째로 큰 값 {value}, 지난 노드 {path}, 높이 {height(root)}')  # 지난 노드 수와 높이

# 4단계: 35 를 정렬된 리스트와 BST 에 넣는다
nums = [20, 30, 40, 50, 60, 70, 80]  # 7절의 펼친 배열
point = bisect.bisect_left(nums, 35)  # 35 를 넣을 자리
bisect.insort(nums, 35)  # 넣을 자리를 이진 탐색으로 찾고 insert 로 넣는다
print(f'정렬된 리스트: 넣을 자리 {point}, 뒤로 민 칸 {len(nums) - 1 - point}칸, 넣은 뒤 {nums}')  # 넣을 자리 뒤의 값이 한 칸씩 밀린다
root, _ = build_bst([50, 30, 70, 20, 40, 60, 80])  # 가운데 값부터 넣은 BST
path, parent = path_to(root, 35)  # None 자식까지 비교한 노드
parent.left = TreeNode(35)  # 35 < 40 이라 40 의 왼쪽 자식으로 연결한다
print(f'BST: 비교한 노드 {path}, 비교 {len(path)}번, 연결 1번')  # 자리를 찾는 데 높이만큼, 연결은 한 번

# 출력:
# 2단계 뜻: 같은 값 7개인데 넣는 순서에 따라 높이가 3 과 7 이고 비교 횟수도 그만큼 다르다.
# 가운데 값부터: 높이 3, 넣을 때 비교 10번, 80 을 찾는 비교 3번
# 작은 값부터: 높이 7, 넣을 때 비교 21번, 80 을 찾는 비교 7번
# 3단계 뜻: 두 번째로 큰 값을 찾으며 지난 노드 수가 각 BST 의 높이와 같다.
# [50, 30, 70, 20, 40, 60, 80]: 두 번째로 큰 값 70, 지난 노드 [50, 70, 80], 높이 3
# [50, 30, 80, 70, 60, 75]: 두 번째로 큰 값 75, 지난 노드 [50, 80, 70, 75], 높이 4
# [20, 30, 40, 50, 60, 70, 80]: 두 번째로 큰 값 70, 지난 노드 [20, 30, 40, 50, 60, 70, 80], 높이 7
# 4단계 뜻: 정렬된 리스트는 뒤의 값 5개를 밀고 BST 는 50, 30, 40 과 비교한 뒤 연결 한 번으로 붙인다.
# 정렬된 리스트: 넣을 자리 2, 뒤로 민 칸 5칸, 넣은 뒤 [20, 30, 35, 40, 50, 60, 70, 80]
# BST: 비교한 노드 [50, 30, 40], 비교 3번, 연결 1번
```

넣을 때 비교는 값마다 그 값이 붙는 층의 번호만큼이라 가운데 값부터는 0 + 1 + 1 + 2 + 2 + 2 + 2 = 10번, 작은 값부터는 0 + 1 + 2 + 3 + 4 + 5 + 6 = 21번이고 80 을 찾는 비교도 3번과 7번입니다. 두 번째로 큰 값은 높이 3 인 BST 에서 80 의 부모 70, 80 아래에 왼쪽 부분 트리가 있는 BST 에서 그 부분 트리의 가장 큰 값 75, 작은 값부터 넣은 BST 에서 70 이었고 지난 노드 수 3개, 4개, 7개는 세 트리의 높이와 같았습니다.

값이 N개일 때 작은 값부터 넣으면 높이가 N 이라 넣기 전체에 비교가 0 + 1 + … + (N - 1) = N(N - 1)/2 번, 값 하나를 찾는 데 많아야 N번이 듭니다. 가운데 값부터 넣어 층을 꽉 채우면 높이가 floor(log2 N) + 1 이라 값 하나에 O(log N) 입니다. 넣는 순서와 상관없이 높이를 O(log N) 으로 지키려면 1절의 자가 균형 BST 를 씁니다. [트리와 힙](post.html?id=algorithm-tree-heap) 편 5~6절은 다른 값 9개로 같은 차이(13 을 찾는 데 4회와 8회)를 보이고 높이를 간선 수로 세서 한 줄로 이어진 트리의 높이를 8 로 적습니다.

4단계에서 35 를 넣을 자리는 2 였고 그 뒤의 40, 50, 60, 70, 80 5칸이 밀렸으니 과외의 「40 부터 80 까지」는 맞습니다. 값이 100만 개면 맨 앞에 넣을 때 가장 많이 밀어 많아야 100만 칸이고 넣을 자리가 뒤일수록 적습니다. BST 는 50, 30, 40 과 비교해 40 의 왼쪽 None 자식을 찾았고 연결은 한 번이었습니다. 그래서 BST 에 넣는 비용은 자리를 찾는 O(h) 에 연결 O(1) 이고 작은 값부터 넣어 높이가 N 이 되면 자리를 찾는 데 O(N) 이 듭니다.

아래 데모는 작은 값부터 넣는 순서를 보여 줍니다. 「끝까지」를 누르면 트리가 오른쪽으로만 이어진 7층이 되고 결과 칸은 7절 데모와 같은 「펼친 배열 [20, 30, 40, 50, 60, 70, 80]」인데 아랫줄은 「높이 7, 넣을 때 비교 21번, 80을 찾으면 비교 7번」입니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-lesson-tree-bst.html?embed=1&mode=bst&preset=sorted" height="1120" loading="lazy" title="작은 값부터 넣어 높이 7 이 된 BST 미니 데모"></iframe>
<a class="demo-embed-open" href="demo-lesson-tree-bst.html?mode=bst&preset=sorted" target="_blank" rel="noopener">↗ 전체 데모로 열기</a>
</div>

## 10. 이진 탐색, BST, 힙

**이진 탐색은 정렬된 배열에서 쓰는 방법이고 BST 와 힙은 자료구조입니다. BST 는 부분 트리 전체에 대소 규칙을 지켜 값을 O(h) 에 찾고 넣으며 힙은 부모와 자식 사이의 규칙만 지켜 가장 작은 값(최대 힙은 가장 큰 값)만 O(1) 에 읽습니다.**

트리의 종류와 BST 를 들은 지훈 씨가 말했습니다. 「잠깐잠깐, BST, 힙, binary search 관계 다시 정리해 주세요.」 이진 탐색과 이진 탐색 트리는 이름에 「이진」과 「탐색」이 같이 들어가고 힙도 이진 트리 모양이라 헷갈립니다. 이진 탐색은 배열 위에서 도는 방법이고 BST 와 힙은 값을 담는 모양과 규칙입니다. 과외에서 이 셋을 「전산과 전공생들도 가장 많이 헷갈려하는」 3형제라고 부른 말과 표의 일상 비유 칸(국어사전, 도서관 서가, 응급실)은 지웁니다. 표의 비용은 값 하나를 비교하는 데 O(1) 일 때입니다.

| 항목 | 이진 탐색 | BST | 힙 (heapq 의 최소 힙) |
|---|---|---|---|
| 종류 | 방법. 정렬된 배열에서 쓴다 | 자료구조. 노드를 left, right 로 연결한다 | 자료구조. 완전 이진 트리를 리스트에 담는다 |
| 규칙 | 배열이 정렬돼 있다 | 왼쪽 부분 트리의 모든 값 < 노드의 값 < 오른쪽 부분 트리의 모든 값 | 부모 ≤ 자식. 형제끼리는 순서가 없다 |
| 값 찾기 | 많아야 floor(log2 N) + 1 번 비교라 O(log N) | 한 층씩 내려가 O(h) | 버릴 쪽을 정할 규칙이 없어 O(N) |
| 최솟값과 최댓값 | 배열의 양 끝이라 O(1) | 왼쪽 끝과 오른쪽 끝까지 내려가 O(h) | 최솟값은 heap[0] 이라 O(1), 최댓값은 O(N) |
| 넣기와 빼기 | 자리는 O(log N) 에 찾지만 뒤의 값을 밀어 많아야 O(N) | 넣기와 빼기 모두 O(h). 넣기는 None 자식을 찾아 연결 한 번, 두 자식이 있는 노드를 빼면 오른쪽 부분 트리의 가장 작은 값을 찾아(O(h)) 그 자리로 옮긴다 | 넣기와 맨 앞 값 꺼내기가 많아야 O(log N) |

BST 칸의 O(h) 는 균형이면 O(log N), 정렬된 순서로 넣으면 O(N) 입니다. 과외의 표는 힙에서 특정 값을 찾는 일을 「불가능, 전부 다 뒤져야 함」이라고 적었는데 리스트를 처음부터 끝까지 보면 찾으므로 불가능이 아니라 O(N) 입니다. 과외의 힙 규칙 「부모 > 자식」은 1절에서 고쳤습니다. 넣고 꺼내는 비용을 직접 센 값은 [힙과 Top K](post.html?id=algorithm-lesson-heap-top-k) 편 2절에 있습니다.

정렬된 배열에서 값이나 넣을 자리를 찾을 때는 이진 탐색을, 가장 작은 값이나 가장 큰 K개만 필요할 때는 힙을, 값을 넣고 빼면서 정렬된 순서도 유지해야 할 때는 BST 를 고릅니다. 지훈 씨가 푼 문제의 트리가 최대 힙 규칙을 지키는 완전 이진 트리였다면 그 트리에서 두 번째로 큰 값을 찾는 방법은 힙의 내부 글에서 다룹니다.

## 한눈 정리

| 문제와 개념 | 푸는 방법 | 시간 | 공간 | 이 글의 예 |
|---|---|---|---|---|
| LeetCode 의 트리 입력 | 층별 순서 배열을 큐로 읽어 노드를 연결한다(채점 쪽이 한다) | O(N) | O(N) | `[3, 9, 20, null, null, 15, 7]` → root.val 3 |
| 104 높이 | None 이면 0, 아니면 1 + max(왼쪽, 오른쪽) | O(N) | O(h) | 예제 1 → 3, 호출 11번 |
| 226 뒤집기 | 두 부분 트리를 뒤집어 맞바꾸고 root 를 돌려준다 | O(N) | O(h) | `[4, 2, 7, 1, 3, 6, 9]` → `[4, 7, 2, 9, 6, 3, 1]` |
| 102 층별 순회 | 큐에 든 노드 수만큼 꺼내 한 층으로 모은다 | O(N) | O(N) | `[[3], [9, 20], [15, 7]]` |
| BST 중위 순회 | 왼쪽 부분 트리, 노드, 오른쪽 부분 트리 | O(N) | O(h) | 펼친 배열 `[20, 30, 40, 50, 60, 70, 80]` |
| 230 k번째로 작은 값 | 스택으로 중위 순회하다 k번째 방문에서 멈춘다 | O(h + k) | O(h) | 예제 2, k = 3 → 3 |
| BST 에 넣기와 찾기 | 작으면 왼쪽, 크면 오른쪽으로 한 층씩 | O(h) | O(1) | 80 찾기: 가운데 값부터 3번, 작은 값부터 7번 |

표의 h 는 높이이고 균형이면 O(log N), 정렬된 순서로 넣으면 O(N) 입니다. BST 에 넣고 찾는 공간 O(1) 은 9절처럼 반복문으로 내려갈 때이고 재귀로 내려가면 O(h) 입니다.

## 헷갈리기 쉬운 점

- **BST 규칙은 자식이 아니라 부분 트리 전체에 걸립니다.** `[5, 4, 6, null, null, 3, 7]` 은 부모와 자식만 보면 규칙을 지키지만 3 이 5 의 오른쪽 부분 트리에 있어 펼친 배열이 `[4, 5, 3, 6, 7]` 입니다.
- **BST 의 비용은 O(log N) 이 아니라 O(h) 입니다.** 균형이면 O(log N), 정렬된 순서로 넣으면 높이가 N 이 되어 O(N) 입니다. 같은 값 7개에서 80 을 찾는 비교가 3번과 7번이었습니다.
- **`if not root` 는 잎이 아니라 None 에서 참입니다.** 잎 노드 15 도 값이 0 인 노드도 TreeNode 라서 `not` 이 False 이고 maxDepth 는 잎에서 두 None 자식의 0 을 받아 1 을 돌려줍니다.
- **LeetCode 배열은 층별 순서입니다.** 위층부터, 같은 층은 왼쪽부터 적고 자식이 없는 자리는 null 이라서 102 의 답은 배열을 층마다 잘라 null 을 뺀 것과 같습니다.
- **TreeNode 는 dict 가 아닙니다.** 값 세 개를 담는 점만 같고 `root.val` 처럼 속성으로 읽으며 키로 읽으면 TypeError 가 납니다.
- **트리도 간선 목록으로 받으면 visited 나 부모 표시가 필요합니다.** 루트에서 자식으로만 내려갈 때는 필요 없지만 간선 목록으로 받은 트리는 [BFS](post.html?id=algorithm-lesson-bfs) 편 1절과 5절처럼 부모로 되돌아가지 않게 막습니다.

## 더 깊이 보기

- 전위, 중위, 후위 순회 세 가지는 [트리와 힙](post.html?id=algorithm-tree-heap) 편 2절에, 트리가 깊으면 파이썬 재귀가 기본 한계 1000 에서 RecursionError 를 내는 문제는 4절에, 값 9개를 두 순서로 넣어 13 을 찾는 데 4회와 8회가 걸리는 예는 5~6절에 있습니다(높이는 간선 수로 셉니다).
- 층별 순회와 BFS 가 같은 순서라는 설명은 [BFS](post.html?id=algorithm-lesson-bfs) 편 6절에 있습니다.
- 정렬된 배열의 가운데 값과 비교해 절반을 버리는 방법과 bisect 는 [이진 탐색](post.html?id=algorithm-lesson-binary-search) 편에, 최소 힙과 크기 K 힙은 [힙과 Top K](post.html?id=algorithm-lesson-heap-top-k) 편에 있습니다.
- 이 글의 데모는 [트리와 BST: 배열 입력, 높이 재귀, 중위 순회](demo-lesson-tree-bst.html) 한 페이지에서 탭과 입력을 바꿔 가며 볼 수 있습니다.
- 예시 문제는 [Maximum Depth of Binary Tree](https://leetcode.com/problems/maximum-depth-of-binary-tree/)(104), [Invert Binary Tree](https://leetcode.com/problems/invert-binary-tree/)(226), [Binary Tree Level Order Traversal](https://leetcode.com/problems/binary-tree-level-order-traversal/)(102), [Kth Smallest Element in a BST](https://leetcode.com/problems/kth-smallest-element-in-a-bst/)(230) 이고 정렬된 배열로 높이가 균형 잡힌 BST 를 만드는 문제는 [Convert Sorted Array to Binary Search Tree](https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/)(108) 입니다.
- TreeNode 의 속성이 들어 있는 `__dict__` 는 [데이터 모델 문서](https://docs.python.org/3/reference/datamodel.html#object.__dict__)에, vars() 는 [내장 함수 문서](https://docs.python.org/3/library/functions.html#vars)에, `if not root` 가 기대는 참과 거짓 규칙은 [Truth Value Testing](https://docs.python.org/3/library/stdtypes.html#truth-value-testing)에 있습니다.
