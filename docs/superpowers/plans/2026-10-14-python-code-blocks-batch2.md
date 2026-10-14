# 파이썬 코드 블록 개편 — 둘째 묶음 실행 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 첫 묶음 마지막 검토에서 넘긴 검사와 화면 고침을 넣고, 알고리즘 글 5편의 파이썬 블록 46개를 하는 일, 단계, 뜻 형식으로 옮긴다. 블록마다 바로 아래에 있던 별도 출력 블록 46개는 블록 안 출력 영역으로 들어간다.

**Architecture:** 고침은 첫 묶음이 만든 파일 안에서 한다. 파서와 그리기는 `js/code-steps.js`, 형식 검사는 `scripts/check-code-blocks.js`(새 시험 파일 하나와 함께), 실행 검사는 `scripts/check-python-outputs.py` 다. 글 옮기기는 이 계획 맨 끝 부록에 적은 새 블록 전문을 저장소 밖 도우미가 읽어 바꾼다. 도우미는 원본 블록의 해시, 코드 줄, 지울 별도 출력 블록의 찍힌 줄을 먼저 견주고, 하나라도 다르면 아무것도 바꾸지 않는다.

**Tech Stack:** 바닐라 JS(브라우저, node 20), Python 3.9 표준 라이브러리(로컬에는 numpy 1.26.4, torch 2.7.0 도 있다), GitHub Actions(`runs-on: ubuntu-24.04` 고정), 브라우저 도구(Chrome DevTools MCP 또는 Playwright MCP).

**Spec:** `docs/superpowers/specs/2026-10-13-python-code-blocks-design.md` (8-1 블록 상태, 8-2 묶음, 8-3 옮길 때 지킬 것). 꼴과 관례는 첫 묶음 계획 `docs/superpowers/plans/2026-10-13-python-code-blocks-batch1.md` 를 따른다.

> 새 블록 46개의 전문은 태스크 앞의 「부록: 새 블록 46개」 절에 있다. 태스크는 그 뒤에 Task 1 부터 Task 8 까지 이어진다.

> 이 계획의 코드, 시험, 새 블록 46개, 기대 출력은 계획을 쓸 때 저장소 사본(main `c6cd528`)에 그대로 적용해 돌려 본 것이다. 단위 테스트 89개, 형식 검사 시험 16개, 실행 검사 시험 17개, CI 검사 12가지, 다섯 편의 형식 검사와 실행 검사, 1440, 1280, 1024, 390 폭의 배치 숫자가 통과했다.

## Global Constraints

- 공개 저장소다. 사내 시스템, 플랫폼 이름을 코드, 주석, 블록 안 글, 커밋 메시지 어디에도 쓰지 않는다.
- 블록 안 글(하는 일, 단계 제목, 풀이, 메모, 뜻)은 평서체 `~한다, ~이다` 로 쓴다. 숫자 뒤에 조사나 「이다」가 오면 한 칸 띄운다(`0.011 이다`, `28 이`). 개수를 세는 말은 붙인다(`8개`, `4회`).
- 해요체, `저희`, 가운뎃점, `실측`, `실체`, `축`, `가른다`, `갈린다`, 열하나 이상의 말로 쓴 숫자, 지어낸 말(`출력 칸` 등)을 쓰지 않는다. `node scripts/check-wording.js` 가 posts/ 의 코드 블록 안과 `js/*.js` 의 문자열까지 센다.
- 모서리는 `border-radius: 0`, 그림자 없음, 색은 디자인 토큰만 쓴다(새 hex 없음). `node scripts/check-design.js` 가 통과해야 한다.
- 실행되는 코드 줄은 바꾸지 않는다(spec 8-3). 줄 끝 주석도 그대로 둔다. spec 8-1 의 「적힌 출력과 다른 3개」는 이 묶음에 없으니 예외도 없다.
- 표시 꼴은 spec 그대로다 — `# 하는 일: …`, `# N단계: …`, `# 출력:` 또는 `# 출력 (…):`, `# N단계 뜻: …` 또는 `# 뜻: …`, 상태 표시 `# (<무엇> — 그대로 실행되지 않습니다.)`, `# (앞 블록에 이어서 돌린다.)`, `# (<글 id> 글의 코드에 이어서 돌린다.)`.
- 이 계획 문서는 Task 1 전에 `docs/superpowers/plans/2026-10-14-python-code-blocks-batch2.md` 로 커밋돼 있어야 한다. 임시 폴더 도구를 뽑는 명령과 글 옮기기 도우미가 이 파일을 읽는다.
- 이 계획의 코드 블록(네 백틱 울타리)은 손으로 옮겨 적지 않는다. 파일 전체는 울타리 안 글을 그대로 쓰고, Edit 은 찾을 글과 바꿀 글을 그대로 쓴다. 찾을 글은 파일에 꼭 한 번 있어야 한다.
- `js/main.js` 에는 NUL 바이트가 4개 있다. 찾을 때 `grep -a` 를 쓰고, 고칠 때는 Edit 로 해당 줄만 바꾼다. 고친 뒤 `python3 -c "print(open('js/main.js','rb').read().count(b'\x00'))"` 가 `4` 여야 한다.
- `.github/workflows/validate.yml` 은 Task 3 에서 단계 하나만 더한다. `runs-on: ubuntu-24.04` 와 `python-version: '3.9'` 는 건드리지 않는다.
- 커밋은 git 사용자 `chkimsu` 로 한다. 파일을 이름으로 stage 한다(`git add -A` 금지). 메시지는 기존 꼴 `feat|fix|docs(범위): …` 이고, 마지막 줄은 그 커밋을 만든 모델의 Co-Authored-By 줄이다(예: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`).
- push 는 Task 8 에서 사용자 확인을 받은 뒤에만 한다. push 전에 `git fetch origin && git rebase origin/main` 을 한다(CI 가 sitemap 과 feed 를 다시 커밋한다).
- 임시 파일은 저장소 밖에 둔다. 아래 명령의 `$SCRATCH` 는 `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch2"; mkdir -p "$SCRATCH"` 로 정한다. 셸 변수는 명령마다 다시 정한다. 화면 그림은 저장소 안의 `.playwright-mcp/batch2/` 에 둔다(`.gitignore` 에 있다. 브라우저 도구는 저장소 밖에 그림을 쓰지 못한다).

## Review Focus

1. **옮긴 출력 뒤의 본문** — 별도 출력 블록을 지운 자리 바로 뒤 본문이 그대로 남고 읽는 순서가 맞아야 한다. Task 6 Step 3 과 Task 7 Step 2 의 검사가 「블록 밖 글 같다, 파이썬 블록 바로 뒤 별도 출력 블록 0개」를 보고, Task 6 Step 6 이 화면으로 본다.
2. **시간을 재는 블록 6개의 숫자** — 본문이 그 숫자를 말한다(「7초 가까이」, 「0.4밀리초」). 새 블록은 원래 적힌 숫자를 그대로 두고, 도우미가 지울 별도 출력 블록과 글자까지 견준다(Task 6 Step 2). 뜻 줄은 적힌 숫자를 말한다.
3. **몸통의 괄호 주석** — algorithm-dp-greedy 여섯째 블록은 하는 일 줄 바로 아래에 `# (이름, 시작, 끝)` 이 온다. 상태 표시가 아니라 메모로 읽혀야 한다. Task 1 의 시험 「몸통의 괄호 주석은 상태 표시가 아니라 메모」가 붙잡는다.
4. **「1단계」로 시작하는 찍힌 줄** — algorithm-hash-sort 여덟째 블록이 `  1단계 반` 을 찍는다. 찍힌 줄로 남아야 하고 뜻 줄로 읽히면 안 된다. Task 1 의 시험 「「1단계」 로 시작하는 찍힌 줄은 찍힌 줄」이 붙잡는다.
5. **휴대폰 폭** — 표 모양 출력이 많은 다섯 편이 390 폭에서 옆으로 넘치면 안 된다. Task 6 Step 6 과 Task 8 Step 2 가 `scrollWidth` 를 잰다.

## 이 계획에서 정한 것

| 정한 것 | 왜 | 틀렸다면 |
|---|---|---|
| 둘째 묶음은 알고리즘 글 5편(블록 46개)이다 | spec 8-2 가 알고리즘 글을 별도 출력 블록이 많아 한 묶음으로 둔다. 편수는 10편보다 적지만 블록은 첫 묶음의 네 배다 | 다음 묶음에 글을 더 넣는다 |
| 첫 글은 algorithm-hash-sort 다 | 트랙 순서가 complexity-array(첫 묶음) 다음이 해시와 정렬이다. 시간 재는 블록, 단계 없는 블록, 빈 줄 든 출력이 다 있다 | 화면 확인 글만 바뀐다 |
| 검사와 화면 고침은 태스크마다 커밋한다. 글 옮기기는 태스크 둘이 따로 커밋하고, 올리기 직전에 하나로 합친다 | spec 8-2 의 「커밋은 묶음마다 하나」는 글 옮기기를 두고 한 말로 첫 묶음에서 정했다. 코드 고침은 리뷰 단위가 따로다 | 합치기를 건너뛰고 둘 그대로 올린다 |
| 넘긴 것 가운데 긴 글 배치 묶기는 하지 않는다 | 548줄 글(deep-ctr-models)이 이 묶음에 없다. 이 묶음에서 그리는 줄이 가장 많은 글(graph-search, 옮긴 뒤 308줄)도 1280 과 1440 폭을 오갈 때 배치 한 번이 1~2ms 였다 | 그 글이 든 묶음 계획이 맡는다 |
| 꼬리표 검사는 `python3`, `python 제목` 에 더해 `py`, `py3` 도 막는다 | 그 꼬리표는 화면이 새 형식으로 그리지 않고, 검사 둘이 아예 보지 않는다 | 정규식 한 줄 |
| 기준표보다 줄어든 글은 실패가 아니라 알림이다 | 옮기는 태스크마다 `--update` 를 돌린다. 리뷰어도 「알림」을 권했다 | 조건 하나로 실패로 바꾼다 |
| 「<글 id> 글의 코드에 이어서」의 글 id 는 `js/posts.js` 의 id 다. 표시는 대문자와 밑줄을 받고, 맞는지는 형식 검사가 본다 | 화면 링크가 `post.html?id=<글 id>` 로 간다. 파일 이름과 id 가 다른 글이 넷 있다(`mab.md` 는 `mab-summary`) | 표시 정규식과 검사 한 곳 |
| `--show` 는 통과한 블록도 보여 준다. 옛 형식 블록은 `--legacy` 와 같이 쓴다 | 쓰는 사람이 찍힌 줄을 손으로 맞추지 않게 하려는 기능이다 | 출력 조건 하나 |
| Copy 단추의 숨은 textarea 에 `focus()` 를 더한다 | `select()` 만으로는 포커스가 가지 않는 브라우저가 있어, 복사 처리의 비켜서기가 듣지 않는다 | `js/main.js` 한 줄 |
| 메모 자리 CSS 는 주석 글만 고친다 | 동작은 첫 묶음에서 확인받은 그대로다. 주석이 「같은 자리」라고 틀리게 말했을 뿐이다 | 주석 한 줄 |
| 숫자 토큰(`.cb-n`)은 줄 끝에서 끊지 않는다 | 휴대폰에서 `lr=3e-3` 이 `3e-` 에서 끊겼다. 숫자는 길어야 열몇 자라 넘치지 않는다 | CSS 한 줄 |
| tree-heap 첫 블록의 트리 그림 주석 4줄은 2단계 풀이 글로 옮긴다 | 이어 쓴 주석 줄은 메모 하나로 이어져 그림 모양이 깨진다. 글 바로 위 그림이 같은 트리를 보인다. 같은 규칙을 글쓰기 규칙에 더한다 | 풀이 한 줄 |
| hash-sort 여덟째 블록(안정 정렬)은 단계 없이 쓴다 | 코드가 「1단계 반」, 「2단계 점수」를 찍어 블록의 단계 번호와 헷갈린다 | 단계 줄 둘 |
| 시간 재는 블록 6개는 원래 적힌 숫자를 그대로 둔다 | 본문이 그 숫자를 말한다. 실행 검사는 「돌릴 때마다」 머리 덕에 숫자를 빼고 견준다 | 숫자 몇 개 |
| 도우미는 끼울 줄 목록 대신 부록의 새 블록 전문을 읽는다 | 리뷰어가 새 블록을 그대로 읽는다. 코드 줄이 원본과 같은지는 도우미가 본다 | 도우미 하나 |
| 화면 확인은 Chrome DevTools MCP 또는 Playwright MCP 로 하고, 390 폭은 숨긴 iframe 으로 잰다 | 첫 묶음에서 Playwright MCP 가 끊겼다. 창은 500px 아래로 줄지 않는다 | 도구만 바뀐다 |
| push 는 사용자가 `! git push origin main` 으로 한다 | 첫 묶음에서 자동 권한 검사가 `git push` 를 막았다 | 사용자에게 부탁하는 줄 하나 |

## 파일 지도

| 파일 | 맡는 일 | 태스크 |
|---|---|---|
| `js/code-steps.js` | 하는 일과 단계 오타, 빈 줄만 있는 묶음, 글 id 꼴(파서). 빈 줄, 복사, 경고 한 번(그리기) | 1, 2 |
| `scripts/test-code-steps.js` | 단위 테스트 76 → 89 | 1, 2 |
| `js/main.js` | Copy 단추의 숨은 textarea 에 포커스 | 2 |
| `css/style.css` | 숫자 토큰 줄바꿈, 주석 둘 | 2 |
| `scripts/check-code-blocks.js` | 꼬리표, 글 id, 줄어든 기준표 알림, posts/ 없는 폴더 | 3 |
| `scripts/test-check-code-blocks.js` (새) | 형식 검사 시험 16개 | 3 |
| `.github/workflows/validate.yml` | 위 시험을 도는 단계 하나 | 3 |
| `scripts/check-python-outputs.py` | `--show`, 없는 글, 이어서 돌릴 글의 파일, 임시 폴더 지우기 | 4 |
| `scripts/test-python-outputs.py` | 실행 검사 시험 10 → 17 | 4 |
| `MARKDOWN_GUIDE.md` | 글 id, `--show`, 주석 그림, 꼬리표 | 5 |
| `posts/algorithm-hash-sort.md` | 블록 10개 | 6 |
| `posts/algorithm-binary-search-stack.md`, `posts/algorithm-tree-heap.md`, `posts/algorithm-graph-search.md`, `posts/algorithm-dp-greedy.md` | 블록 10, 10, 9, 7개 | 7 |
| `scripts/code-blocks-baseline.json` | 236개 82편 → 226개 81편 → 190개 77편 | 6, 7 |

## 넘긴 항목과 이 계획

첫 묶음 마지막 검토가 「둘째 묶음 전에」, 「둘째 묶음이나 그 뒤에」로 넘긴 것이다.

| 넘긴 것 | 어디서 |
|---|---|
| 뜻 줄 아래 빈 줄만 있는 묶음이 검사를 지나고 빈칸으로 그려진다 | Task 1 |
| 단계 줄 바로 아래의 단계 오타(`#2단계: 둘`, `# 2단계 : 둘`)가 풀이로 넘어간다 | Task 1 |
| 하는 일 줄 오타가 옛 형식으로 넘어가 아무 말이 없다 | Task 1 |
| 「<글 id> 글의 코드에 이어서」가 파일 이름과 id 가 다른 글(disjoint-LinUCB.md, pCVR-modeling.md, ucb_ts.md, mab.md)과 대문자 id(TS-linTS)를 가리키지 못한다 | Task 1, 3, 4 |
| 여러 줄 span 안의 빈 줄이 높이 0 으로 사라진다(interview-system-design 넷째 블록) | Task 2 |
| 클립보드가 거부되면 Copy 단추의 숨은 textarea 복사를 문서에 남은 선택이 가로챈다 | Task 2 |
| 실패한 블록이 배치할 때마다 경고를 낸다(한 블록에 세 번) | Task 2 |
| 메모 자리 CSS 주석이 「같은 자리」라고 틀리게 말한다, `pre.cb-wrap code.hljs` 규칙에 까닭 주석이 없다 | Task 2 |
| 휴대폰에서 `lr=3e-3` 이 `3e-` 에서 끊긴다 | Task 2 |
| `python` 이 아닌 꼬리표가 검사를 지나 화면에서 옛 모양이 된다 | Task 3 |
| 기준표보다 줄어도 말이 없다 | Task 3 |
| `check-code-blocks.js` 시험이 없다, `--root` 에 posts/ 가 없으면 stack trace | Task 3 |
| 실행 검사가 찍힌 줄 전부를 보여 주지 않는다(`--show`) | Task 4, 5 |
| 없는 `--post` 가 아무것도 안 돌리고 통과로 끝난다 | Task 4 |
| 시험이 없는 실행 검사 규칙 다섯(블록 예외, 앞 블록 예외, 발췌 블록 빼기, 다른 글에 이어서, 번호 없는 뜻) | Task 4 |
| 실행 검사의 임시 폴더가 남는다 | Task 4 |
| 긴 글의 배치 읽기와 쓰기 묶기 | 다음 묶음(deep-ctr-models 가 든 묶음) |
| 그 밖의 「나중에」 — 오류 모델 그리기 시험, 정규식의 날 유니코드, `narrow` 의 테두리 폭, 오류 순서, `--json` 의 ok 와 cont-post, 끝 빈 줄 자르기, 앞 블록의 SystemExit, http 에서의 클립보드, 펜스 보관 전 치환, 휴대폰 여백 넷 | 다음 계획 |

---

## 부록: 새 블록 46개

Task 6, 7 의 도우미가 이 절을 읽는다(태스크 설명에 넣지 않으려고 태스크 앞에 둔다). 블록마다 `<!-- cb2 post=<글 파일 이름> block=<0부터 센 파이썬 블록 번호> sha=<원본 블록 sha256 앞 16자> -->` 줄 바로 아래 네 백틱 울타리 안이 새 블록 전체다. 표시 줄과 울타리 모양을 바꾸지 않는다. 블록 제목의 번호는 1부터 센다.

### 부록 1: algorithm-hash-sort (블록 10개, Task 6)

#### 블록 1

<!-- cb2 post=algorithm-hash-sort block=0 sha=0cf56da079be20d9 -->
````python
# 하는 일: 값 20만 개를 리스트와 딕셔너리에 담아 두고, 2천 개를 찾는 데 걸린 시간을 견준다.
import time, random

# 1단계: 담을 값 20만 개와 찾을 값 2천 개를 뽑는다
# 같은 값 20만 개를 리스트와 딕셔너리 두 곳에 담는다.
random.seed(42)
haystack = random.sample(range(1, 1_000_000), 200_000)
needles  = random.sample(range(1, 1_000_000), 2_000)

as_list = haystack
as_dict = {v: i for i, v in enumerate(haystack)}

# 2단계: 두 곳에서 2천 번씩 찾는다
# 리스트는 앞에서부터 훑고, 딕셔너리는 자리를 계산한다.
t = time.perf_counter()
for x in needles:
    x in as_list
list_ms = (time.perf_counter() - t) * 1000

t = time.perf_counter()
for x in needles:
    x in as_dict
dict_ms = (time.perf_counter() - t) * 1000

# 3단계: 걸린 시간과 배수를 찍는다
print(f"{'담은 곳':<10}{'2,000번 찾기(ms)':>18}")
print(f"{'리스트':<10}{list_ms:>18.1f}")
print(f"{'딕셔너리':<9}{dict_ms:>18.3f}")
print(f"\n딕셔너리가 {list_ms/dict_ms:,.0f}배 빠르다")

# 출력 (시간은 돌릴 때마다 다르다):
# 3단계 뜻: 같은 2천 번 찾기에 리스트는 7초 가까이, 딕셔너리는 0.4밀리초쯤 걸린다. 배수는 돌릴 때마다 만 배 안팎에서 오르내린다.
# 담은 곳           2,000번 찾기(ms)
# 리스트                   6902.2
# 딕셔너리                  0.381
#
# 딕셔너리가 18,140배 빠르다
````

#### 블록 2

<!-- cb2 post=algorithm-hash-sort block=1 sha=e2413079f3138fbc -->
````python
# 하는 일: 해시값이 값마다 다른 키와 늘 7 인 키를 만들어 딕셔너리에 5천 개씩 담고, 담는 데 걸린 시간을 견준다.
import time

# 1단계: 좋은 키와 나쁜 키를 만든다
# 나쁜 키는 해시값을 일부러 7 로 고정해서 모든 값이 한 슬롯에 몰리게 만든다.
class GoodKey:
    def __init__(self, v): self.v = v
    def __hash__(self):    return hash(self.v)      # 값마다 다른 번호
    def __eq__(self, o):   return self.v == o.v

class BadKey:
    def __init__(self, v): self.v = v
    def __hash__(self):    return 7                 # 전부 같은 번호
    def __eq__(self, o):   return self.v == o.v

# 2단계: 키마다 5천 개를 담으며 시간을 잰다
print(f"{'키':<8}{'담는 데 걸린 시간(ms)':>22}")
for name, K in (("좋은", GoodKey), ("나쁜", BadKey)):
    t = time.perf_counter()
    d = {K(i): i for i in range(5_000)}
    ms = (time.perf_counter() - t) * 1000
    print(f"{name:<8}{ms:>22.1f}")

# 출력 (시간은 돌릴 때마다 다르다):
# 2단계 뜻: 같은 5천 개인데 나쁜 키는 수백 배 오래 걸린다. 넣을 때마다 한 슬롯에 몰린 앞의 값들을 전부 지나치기 때문이다.
# 키               담는 데 걸린 시간(ms)
# 좋은                         1.6
# 나쁜                       701.9
````

#### 블록 3

<!-- cb2 post=algorithm-hash-sort block=2 sha=181f95b377050247 -->
````python
# 하는 일: 튜플과 리스트를 딕셔너리 키로 넣어 보고, 3 과 3.0 을 같은 딕셔너리에 넣으면 무슨 일이 생기는지 본다.
# 1단계: 튜플과 리스트를 키로 넣어 본다
# 키는 넣은 뒤에 바뀌면 안 된다. 튜플은 못 바꾸니 되고, 리스트는 바꿀 수 있으니 막힌다.
좌표 = {}
좌표[(3, 5)] = "가"          # 튜플은 된다
print("튜플 키 ", 좌표)

try:
    좌표[[3, 5]] = "나"      # 리스트는 안 된다
except TypeError as e:
    print("리스트 키", type(e).__name__, "-", e)

# 2단계: 3 과 3.0 을 키로 넣는다
print()
print("hash(3) =", hash(3), " hash(3.0) =", hash(3.0), " 3 == 3.0 :", 3 == 3.0)
d = {3: "정수로 넣음"}
d[3.0] = "실수로 덮어씀"
print("d =", d, " 항목 수", len(d))

# 출력:
# 1단계 뜻: 튜플 키는 들어가고, 리스트 키는 해시값을 못 구해 TypeError 가 난다.
# 튜플 키  {(3, 5): '가'}
# 리스트 키 TypeError - unhashable type: 'list'
# 2단계 뜻: 3 과 3.0 은 같고 해시값도 같아서 같은 키로 본다. 3.0 으로 넣은 값이 3 의 값을 덮어써 항목이 하나만 남는다.
#
# hash(3) = 3  hash(3.0) = 3  3 == 3.0 : True
# d = {3: '실수로 덮어씀'}  항목 수 1
````

#### 블록 4

<!-- cb2 post=algorithm-hash-sort block=3 sha=998496688ed10414 -->
````python
# 하는 일: 값 6개에서 더해 10 이 되는 두 칸을, 지금까지 본 값을 딕셔너리에 적어 두며 한 번만 훑어서 찾는다.
ARR, TARGET = [8, 3, 11, 7, 2, 15], 10

print("칸  값   지금까지 본 값→칸        찾는 짝    있나")
seen = {}
for i, v in enumerate(ARR):
    need = TARGET - v
    hit  = need in seen
    print(f"{i}  {v:>3}   {str(seen):<24} {need:>4}    {'있다 → 답 ' + str((seen.get(need), i)) if hit else '없다'}")
    if hit:
        break
    seen[v] = i

# 출력:
# 뜻: 칸마다 짝(10 에서 지금 값을 뺀 수)이 이미 적혀 있는지 본다. 3번 칸의 7 에서 짝 3 이 1번 칸에 적혀 있어 멈춘다.
# 칸  값   지금까지 본 값→칸        찾는 짝    있나
# 0    8   {}                          2    없다
# 1    3   {8: 0}                      7    없다
# 2   11   {8: 0, 3: 1}               -1    없다
# 3    7   {8: 0, 3: 1, 11: 2}         3    있다 → 답 (1, 3)
````

#### 블록 5

<!-- cb2 post=algorithm-hash-sort block=4 sha=af89eb40cc2eb2af -->
````python
# 하는 일: 낱말 6개가 몇 번 나왔는지를 get, defaultdict, Counter 세 방법으로 센다.
from collections import Counter, defaultdict

WORDS = ["사과", "배", "사과", "귤", "배", "사과"]

# 1단계: get 으로 센다
# 처음 나온 낱말은 get 이 0 을 돌려주니 if 로 따로 확인하지 않는다.
count = {}
for w in WORDS:
    count[w] = count.get(w, 0) + 1
print("get 으로     ", count)

# 2단계: defaultdict 로 칸 번호를 모은다
# 처음 나온 낱말에는 빈 리스트가 저절로 생긴다.
bag = defaultdict(list)
for i, w in enumerate(WORDS):
    bag[w].append(i)
print("defaultdict ", dict(bag))

# 3단계: Counter 로 센다
c = Counter(WORDS)
print("Counter     ", dict(c))
print("가장 많은 둘 ", c.most_common(2))

# 출력:
# 1단계 뜻: 사과 3번, 배 2번, 귤 1번이다.
# get 으로      {'사과': 3, '배': 2, '귤': 1}
# 2단계 뜻: 낱말마다 나온 칸 번호를 모았다. 사과는 0, 2, 5번 칸에 있다.
# defaultdict  {'사과': [0, 2, 5], '배': [1, 4], '귤': [3]}
# 3단계 뜻: get 으로 센 것과 같다. most_common(2) 는 가장 많이 나온 둘을 개수와 함께 준다.
# Counter      {'사과': 3, '배': 2, '귤': 1}
# 가장 많은 둘  [('사과', 3), ('배', 2)]
````

#### 블록 6

<!-- cb2 post=algorithm-hash-sort block=5 sha=e720084e6654cfaa -->
````python
# 하는 일: 어제 온 4명과 오늘 온 4명을 집합 연산 다섯 가지로 견주고, 어제 왔다가 오늘 안 온 비율을 구한다.
어제 = {"지훈", "민서", "서연", "도윤"}
오늘 = {"민서", "서연", "하준", "지우"}

print("둘 다 왔다 (교집합)  ", sorted(어제 & 오늘))
print("어제만 (차집합)      ", sorted(어제 - 오늘))
print("오늘 새로 온 사람     ", sorted(오늘 - 어제))
print("한 번이라도 (합집합) ", sorted(어제 | 오늘))
print("한쪽에만 (대칭차)    ", sorted(어제 ^ 오늘))
print()
print("이탈률", f"{len(어제 - 오늘) / len(어제):.1%}")

# 출력:
# 뜻: 기호 하나가 질문 하나다. & 는 둘 다, - 는 이쪽에만, | 는 한 번이라도, ^ 는 한쪽에만 있는 사람이다.
# 둘 다 왔다 (교집합)   ['민서', '서연']
# 어제만 (차집합)       ['도윤', '지훈']
# 오늘 새로 온 사람      ['지우', '하준']
# 한 번이라도 (합집합)  ['도윤', '민서', '서연', '지우', '지훈', '하준']
# 한쪽에만 (대칭차)     ['도윤', '지우', '지훈', '하준']
# 뜻: 어제 온 4명 가운데 지훈과 도윤 2명이 오늘 안 왔다.
#
# 이탈률 50.0%
````

#### 블록 7

<!-- cb2 post=algorithm-hash-sort block=6 sha=43b068c6aca1e4ff -->
````python
# 하는 일: 학생 4명을 점수 오름차순과 내림차순으로 정렬해 이름 순서를 찍는다.
학생 = [("지훈", 3, 88), ("민서", 1, 92), ("서연", 3, 92), ("도윤", 1, 88)]
# (이름, 반, 점수)

print("원본        ", [s[0] for s in 학생])
print("점수만 정렬  ", [s[0] for s in sorted(학생, key=lambda s: s[2])])
print("점수 내림차순", [s[0] for s in sorted(학생, key=lambda s: -s[2])])

# 출력:
# 뜻: sorted 는 key 가 돌려준 점수로 비교한다. 내림차순은 key 에서 점수에 - 를 붙여 만들었다.
# 원본         ['지훈', '민서', '서연', '도윤']
# 점수만 정렬   ['지훈', '도윤', '민서', '서연']
# 점수 내림차순 ['민서', '서연', '지훈', '도윤']
````

#### 블록 8

<!-- cb2 post=algorithm-hash-sort block=7 sha=dc8d505dab366f1e -->
````python
# 하는 일: 「점수 높은 순, 점수가 같으면 반 번호 작은 순」을 두 번 나눠 정렬하는 방법과 튜플 key 로 한 번에 정렬하는 방법으로 만들어 견준다.
학생 = [("지훈", 3, 88), ("민서", 1, 92), ("서연", 3, 92), ("도윤", 1, 88)]

print("반 먼저 정렬 후 점수로 다시 정렬:")
tmp = sorted(학생, key=lambda s: s[1])
print("  1단계 반   ", [(s[0], s[1]) for s in tmp])
tmp = sorted(tmp, key=lambda s: -s[2])
print("  2단계 점수 ", [(s[0], s[2], s[1]) for s in tmp])
print()
print("한 번에 (점수 내림, 반 오름):")
one = sorted(학생, key=lambda s: (-s[2], s[1]))
print("            ", [(s[0], s[2], s[1]) for s in one])

# 출력:
# 뜻: 반으로 먼저 세운 뒤 점수로 다시 세웠다. 점수가 같은 학생끼리는 첫 정렬에서 만든 반 순서를 그대로 지킨다.
# 반 먼저 정렬 후 점수로 다시 정렬:
#   1단계 반    [('민서', 1), ('도윤', 1), ('지훈', 3), ('서연', 3)]
#   2단계 점수  [('민서', 92, 1), ('서연', 92, 3), ('도윤', 88, 1), ('지훈', 88, 3)]
# 뜻: 기준 둘을 튜플로 묶어 한 번에 정렬해도 결과가 글자 하나까지 같다.
#
# 한 번에 (점수 내림, 반 오름):
#              [('민서', 92, 1), ('서연', 92, 3), ('도윤', 88, 1), ('지훈', 88, 3)]
````

#### 블록 9

<!-- cb2 post=algorithm-hash-sort block=8 sha=be1b8998a559387e -->
````python
# 하는 일: 구간 5개를 시작점 순으로 정렬한 뒤 한 번만 훑으며 겹치는 구간을 합친다.
구간 = [(13, 15), (1, 4), (9, 12), (3, 6), (14, 18)]

# 1단계: 시작점 순으로 정렬한다
# 튜플은 앞 원소부터 비교하니 sorted 한 번이면 시작점 순서가 된다.
정렬 = sorted(구간)
print("정렬 전", 구간)
print("정렬 후", 정렬)
print()

# 2단계: 마지막 묶음 하나와만 견주며 합친다
# 지금 구간의 시작이 마지막 묶음의 끝보다 작거나 같으면 겹친 것이라 끝을 늘린다. 크면 새 묶음을 연다.
merged = [정렬[0]]
print(f"{'보는 구간':<10}{'마지막 묶음':<12}{'판정':<22}{'결과'}")
for s, e in 정렬[1:]:
    ls, le = merged[-1]
    if s <= le:
        merged[-1] = (ls, max(le, e))
        판정 = f"{s} ≤ {le} 겹친다"
    else:
        merged.append((s, e))
        판정 = f"{s} > {le} 떨어졌다"
    print(f"{str((s,e)):<10}{str((ls,le)):<12}{판정:<22}{merged}")
print()
print("답", merged)

# 출력:
# 1단계 뜻: 정렬하면 겹칠 수 있는 구간끼리 옆에 붙는다.
# 정렬 전 [(13, 15), (1, 4), (9, 12), (3, 6), (14, 18)]
# 정렬 후 [(1, 4), (3, 6), (9, 12), (13, 15), (14, 18)]
#
# 2단계 뜻: 네 번 견줘 겹친 두 곳을 합쳤다. 구간 5개가 묶음 3개가 된다.
# 보는 구간     마지막 묶음      판정                    결과
# (3, 6)    (1, 4)      3 ≤ 4 겹친다             [(1, 6)]
# (9, 12)   (1, 6)      9 > 6 떨어졌다            [(1, 6), (9, 12)]
# (13, 15)  (9, 12)     13 > 12 떨어졌다          [(1, 6), (9, 12), (13, 15)]
# (14, 18)  (13, 15)    14 ≤ 15 겹친다           [(1, 6), (9, 12), (13, 18)]
#
# 답 [(1, 6), (9, 12), (13, 18)]
````

#### 블록 10

<!-- cb2 post=algorithm-hash-sort block=9 sha=e254a370142f10b4 -->
````python
# 하는 일: 정렬한 값 6개에서 하나를 고정하고 나머지 둘을 양 끝에서 좁혀, 더해서 0 이 되는 세 수를 모두 찾는다.
ARR = [-4, -1, -1, 0, 1, 2]
ARR.sort()
답, n = [], len(ARR)
for i in range(n - 2):
    if i > 0 and ARR[i] == ARR[i-1]:
        print(f"i={i} 값 {ARR[i]:>2}  앞과 같아서 건너뜀")
        continue
    L, R = i + 1, n - 1
    while L < R:
        s = ARR[i] + ARR[L] + ARR[R]
        기호 = "=" if s == 0 else ("<" if s < 0 else ">")
        움직임 = "찾음" if s == 0 else ("L을 민다" if s < 0 else "R을 당긴다")
        print(f"i={i} 값 {ARR[i]:>2}  L={L}({ARR[L]:>2}) R={R}({ARR[R]:>2})  합 {s:>2} {기호} 0  {움직임}")
        if s == 0:
            답.append((ARR[i], ARR[L], ARR[R]))
            L += 1; R -= 1
            while L < R and ARR[L] == ARR[L-1]: L += 1
        elif s < 0: L += 1
        else:       R -= 1
print("\n답", 답)

# 출력:
# 뜻: i 로 하나를 고정하고 L, R 을 양 끝에서 좁힌다. i=2 는 앞 값과 같아 건너뛰어서 같은 조합이 두 번 나오지 않는다.
# i=0 값 -4  L=1(-1) R=5( 2)  합 -3 < 0  L을 민다
# i=0 값 -4  L=2(-1) R=5( 2)  합 -3 < 0  L을 민다
# i=0 값 -4  L=3( 0) R=5( 2)  합 -2 < 0  L을 민다
# i=0 값 -4  L=4( 1) R=5( 2)  합 -1 < 0  L을 민다
# i=1 값 -1  L=2(-1) R=5( 2)  합  0 = 0  찾음
# i=1 값 -1  L=3( 0) R=4( 1)  합  0 = 0  찾음
# i=2 값 -1  앞과 같아서 건너뜀
# i=3 값  0  L=4( 1) R=5( 2)  합  3 > 0  R을 당긴다
# 뜻: 합이 0 인 세 수는 두 조합이다.
#
# 답 [(-1, -1, 2), (-1, 0, 1)]
````

### 부록 2: algorithm-binary-search-stack (블록 10개, Task 7)

#### 블록 1

<!-- cb2 post=algorithm-binary-search-stack block=0 sha=a1e7536a433de31d -->
````python
# 하는 일: 정렬된 값 12개에서 38 을 이분 탐색으로 찾으며, 회차마다 가운데 값과 남은 후보 수를 찍는다.
ARR = [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91, 100]
TARGET = 38

# 1단계: 가운데를 보고 절반을 지운다
# 가운데 값이 찾는 값보다 작으면 왼쪽 절반을, 크면 오른쪽 절반을 버린다.
print(f"찾는 값 {TARGET}, 값 {len(ARR)}개")
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
# 2단계: 앞에서부터 훑을 때와 회차를 견준다
print(f"\n{len(ARR)}개를 {k}회에 찾았다, 앞에서부터 훑었다면 {ARR.index(TARGET)+1}회")

# 출력:
# 1단계 뜻: 값 12개에서 3회 만에 38 을 찾는다. 회차마다 남은 후보가 6개, 2개로 준다.
# 찾는 값 38, 값 12개
# 회차     lo  hi  mid  ARR[mid]   판정          남은 후보
# 1       6  11    5        23   작다 → 오른쪽    6개
# 2       6   7    8        56   크다 → 왼쪽     2개
# 3       6   7    6        38   같다 → 찾음     -
# 2단계 뜻: 38 은 7번째 값이라 앞에서부터 훑으면 7회가 걸린다.
#
# 12개를 3회에 찾았다, 앞에서부터 훑었다면 7회
````

#### 블록 2

<!-- cb2 post=algorithm-binary-search-stack block=1 sha=67939fc0584c3aa7 -->
````python
# 하는 일: 값 200만 개에서 맨 끝, 가운데, 맨 앞 값을 앞에서부터 훑기와 이분 탐색으로 찾아 걸린 시간을 견준다.
import time

N = 2_000_000
ARR = list(range(N))
찾을것 = [N - 1, N // 2, 0]

# 1단계: 두 방법을 만든다
# 훑기는 앞에서부터 하나씩 견주고, 이분은 남은 구간의 가운데를 보고 절반을 버린다.
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

# 2단계: 세 값을 두 방법으로 찾으며 시간을 잰다
print(f"{'찾는 값':>10}{'훑기(ms)':>12}{'이분(ms)':>12}")
for t in 찾을것:
    s = time.perf_counter(); 훑기(ARR, t); a = (time.perf_counter()-s)*1000
    s = time.perf_counter(); 이분(ARR, t); b = (time.perf_counter()-s)*1000
    print(f"{t:>10}{a:>12.1f}{b:>12.4f}")
# 3단계: 이분 탐색이 넘지 않는 회차를 찍는다
print(f"\n값 {N:,}개 → 이분은 최대 {N.bit_length()}회면 끝난다")

# 출력 (시간은 돌릴 때마다 다르다):
# 2단계 뜻: 찾는 값이 맨 끝이면 훑기가 가장 오래 걸리고, 맨 앞이면 훑기가 오히려 빠르다. 이분은 어디에 있든 비슷하다.
#       찾는 값      훑기(ms)      이분(ms)
#    1999999        40.1      0.0041
#    1000000        20.2      0.0048
#          0         0.0      0.0044
# 3단계 뜻: 값 200만 개도 이분 탐색은 21회를 넘지 않는다.
#
# 값 2,000,000개 → 이분은 최대 21회면 끝난다
````

#### 블록 3

<!-- cb2 post=algorithm-binary-search-stack block=2 sha=84e1290765dd46b6 -->
````python
# 하는 일: 배열 [1, 3, 3, 3, 7] 에서 이분 탐색 네 변형을 찾는 값 다섯 개로 돌려, 같은 값에 답이 어떻게 다른지 견준다.
ARR = [1, 3, 3, 3, 7]

# 1단계: 네 변형을 만든다
# 하나는 값 자체를 찾고 셋은 경계를 찾는다. hi 의 처음 값, while 의 부등호, mid 의 올림과 내림이 서로 맞물린다.
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

# 2단계: 찾는 값 다섯 개로 네 변형을 돌린다
print("배열", ARR)
print(f"{'찾는 값':>7}{'정확히':>8}{'왼쪽경계':>9}{'오른쪽경계':>11}{'≤ 마지막':>10}")
for t in (0, 3, 5, 7, 9):
    print(f"{t:>7}{정확히(ARR,t):>8}{왼쪽경계(ARR,t):>9}{오른쪽경계(ARR,t):>11}{마지막으로작거나같은(ARR,t):>10}")

# 출력:
# 2단계 뜻: 3 처럼 같은 값이 여럿이면 네 변형이 서로 다른 칸(2, 1, 4, 3)을 낸다. 서로 다른 질문에 답하기 때문이다.
# 배열 [1, 3, 3, 3, 7]
#    찾는 값     정확히     왼쪽경계      오른쪽경계     ≤ 마지막
#       0      -1        0          0         0
#       3       2        1          4         3
#       5      -1        4          4         3
#       7       4        4          5         4
#       9      -1        5          5         4
````

#### 블록 4

<!-- cb2 post=algorithm-binary-search-stack block=3 sha=6959db9e266c5328 -->
````python
# 하는 일: 「이하인 마지막 자리」 변형에서 mid 를 내림으로 두면 lo 와 hi 가 멈춰 버리는 것을 6회만 돌려 본다.
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

# 출력:
# 뜻: 3회차부터 lo=3, hi=4, mid=3 이 그대로 되풀이된다. 내림으로 구한 mid 가 늘 lo 라서 lo = mid 가 아무것도 바꾸지 않는다.
# mid 를 내림으로 두고 lo = mid 를 쓰면:
#   1회차  lo=2 hi=4 mid=2
#   2회차  lo=3 hi=4 mid=3
#   3회차  lo=3 hi=4 mid=3
#   4회차  lo=3 hi=4 mid=3
#   5회차  lo=3 hi=4 mid=3
#   6회차  lo=3 hi=4 mid=3
#   ... 6회를 돌아도 lo 와 hi 가 그대로다 (무한 루프)
````

#### 블록 5

<!-- cb2 post=algorithm-binary-search-stack block=4 sha=9a12b7b27d3d4e8e -->
````python
# 하는 일: 값 6개가 든 배열에서 bisect_left 와 bisect_right 로 값의 개수, 넣을 자리, 작은 것과 이하인 것의 개수를 구한다.
from bisect import bisect_left, bisect_right

# 1단계: 값마다 bisect_left 와 bisect_right 를 구한다
# 두 함수의 차가 그 값의 개수다. 값이 없으면 둘이 같은 칸을 내고, 그 칸이 정렬을 깨지 않고 넣을 자리다.
ARR = [10, 20, 20, 20, 30, 40]
print("배열", ARR, " 칸 번호", list(range(len(ARR))))
print()
print(f"{'찾는 값':>7}{'bisect_left':>13}{'bisect_right':>14}   {'뜻'}")
for t in (5, 20, 25, 40, 50):
    l, r = bisect_left(ARR, t), bisect_right(ARR, t)
    뜻 = f"{t} 이 {r-l}개 있다" if r > l else f"{t} 은 없다, {l}번 칸에 넣으면 된다"
    print(f"{t:>7}{l:>13}{r:>14}   {뜻}")
# 2단계: 20 을 두고 자주 쓰는 네 가지를 구한다
print()
print("20 의 개수      ", bisect_right(ARR, 20) - bisect_left(ARR, 20))
print("20 미만 개수    ", bisect_left(ARR, 20))
print("20 이하 개수    ", bisect_right(ARR, 20))
print("20 보다 큰 첫 값 ", ARR[bisect_right(ARR, 20)])

# 출력:
# 1단계 뜻: 20 은 1번 칸부터 3번 칸까지 3개 있다. 25 처럼 없는 값은 두 함수가 같은 칸 4 를 낸다.
# 배열 [10, 20, 20, 20, 30, 40]  칸 번호 [0, 1, 2, 3, 4, 5]
#
#    찾는 값  bisect_left  bisect_right   뜻
#       5            0             0   5 은 없다, 0번 칸에 넣으면 된다
#      20            1             4   20 이 3개 있다
#      25            4             4   25 은 없다, 4번 칸에 넣으면 된다
#      40            5             6   40 이 1개 있다
#      50            6             6   50 은 없다, 6번 칸에 넣으면 된다
# 2단계 뜻: bisect_left 는 그 값보다 작은 것의 개수이고, bisect_right 는 이하인 것의 개수다.
#
# 20 의 개수       3
# 20 미만 개수     1
# 20 이하 개수     4
# 20 보다 큰 첫 값  30
````

#### 블록 6

<!-- cb2 post=algorithm-binary-search-stack block=5 sha=bba027b0d03d0f21 -->
````python
# 하는 일: 나무 4그루를 같은 높이에서 잘라 1000 이상을 얻을 수 있는 가장 높은 높이를, 높이를 반씩 좁혀 찾는다.
길이 = [802, 743, 457, 539]
목표 = 1000

# 1단계: 높이 h 에서 얻는 양을 구하는 함수를 만든다
# 높이를 올리면 얻는 양은 줄기만 한다. 이 단조성이 있어서 이분 탐색이 통한다.
def 얻는양(h):
    return sum(x - h for x in 길이 if x > h)

# 2단계: 1000 이상을 얻는 가장 높은 높이를 찾는다
# 조건을 만족하는 가장 큰 값을 찾으니 mid 를 올림으로 구한다.
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
print(f"\n답 {lo}, 이때 얻는 양 {얻는양(lo)}")

# 출력:
# 2단계 뜻: 높이 0~802 를 10회 만에 좁힌다. 1000 이상이면 더 높여 보고, 미만이면 낮춘다.
# 회차       lo    hi   mid     얻는 양   판정
# 1         0   400   401      937   1000 미만 → 낮춰야 한다
# 2       200   400   200     1741   1000 이상 → 더 높여 본다
# 3       300   400   300     1341   1000 이상 → 더 높여 본다
# 4       350   400   350     1141   1000 이상 → 더 높여 본다
# 5       375   400   375     1041   1000 이상 → 더 높여 본다
# 6       375   387   388      989   1000 미만 → 낮춰야 한다
# 7       381   387   381     1017   1000 이상 → 더 높여 본다
# 8       384   387   384     1005   1000 이상 → 더 높여 본다
# 9       384   385   386      997   1000 미만 → 낮춰야 한다
# 10      385   385   385     1001   1000 이상 → 더 높여 본다
# 2단계 뜻: 높이 385 에서 얻는 양이 1001 로 1000 을 넘는다. 한 칸 더 높은 386 에서는 997 이다.
#
# 답 385, 이때 얻는 양 1001
````

#### 블록 7

<!-- cb2 post=algorithm-binary-search-stack block=6 sha=84996afea705e88a -->
````python
# 하는 일: 회전된 배열 9칸에서 5 를 찾으며, 회차마다 어느 반쪽이 정렬돼 있는지 먼저 보고 갈 쪽을 정한다.
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

# 출력:
# 뜻: 1회차에 ARR[lo] 30 이 ARR[mid] 2 보다 커서 오른쪽 반이 정렬된 쪽이다. 5 가 그 범위 2~16 안이라 오른쪽으로 가고, 3회차에 찾는다.
# 배열 [30, 38, 45, 56, 2, 5, 8, 12, 16]  찾는 값 5
# 회차     lo  hi  mid    값   정렬된 반쪽      판정
# 1       5   8    4    2   오른쪽 2~16    그 안에 있다 → 오른쪽
# 2       5   5    6    8   왼쪽 5~8      그 안에 있다 → 왼쪽
# 3       5   5    5    5   -           찾음
````

#### 블록 8

<!-- cb2 post=algorithm-binary-search-stack block=7 sha=8e80660aba038c7f -->
````python
# 하는 일: 괄호 문자열 두 개가 짝이 맞는지 스택으로 확인하며, 글자마다 스택이 어떻게 바뀌는지 찍는다.
쌍 = {")": "(", "]": "[", "}": "{"}

# 1단계: 괄호를 한 글자씩 보며 스택에 쌓고 뺀다
# 닫는 괄호의 짝은 늘 가장 최근에 연 괄호다. 끝까지 본 뒤 스택이 비어 있어야 맞다.
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

# 2단계: 두 문자열을 확인한다
for s in ("([]{})", "([)]"):
    print(f"'{s}'")
    r = 확인(s)
    print(f"  → {'맞다' if r else '틀리다'}\n")

# 출력:
# 2단계 뜻: 여는 괄호를 쌓고, 닫는 괄호를 만나면 맨 위의 짝을 뺀다. 끝에 스택이 비어 맞다.
# '([]{})'
#   글자   하는 일                  스택
#   (    여는 괄호 → 쌓는다         ['(']
#   [    여는 괄호 → 쌓는다         ['(', '[']
#   ]    짝이 맞는다 → 뺀다         ['(']
#   {    여는 괄호 → 쌓는다         ['(', '{']
#   }    짝이 맞는다 → 뺀다         ['(']
#   )    짝이 맞는다 → 뺀다         []
#   → 맞다
#
# 2단계 뜻: ) 를 만났을 때 맨 위가 [ 라 짝이 안 맞는다. 괄호 개수는 맞아도 틀린 문자열이다.
# '([)]'
#   글자   하는 일                  스택
#   (    여는 괄호 → 쌓는다         ['(']
#   [    여는 괄호 → 쌓는다         ['(', '[']
#   )    짝이 안 맞는다 → 실패      ['(', '[']
#   → 틀리다
````

#### 블록 9

<!-- cb2 post=algorithm-binary-search-stack block=8 sha=4cbfb457492a07c3 -->
````python
# 하는 일: 7일치 기온에서 날마다 며칠 뒤에 처음으로 더 더워지는지를 단조 스택으로 구한다.
기온 = [30, 28, 33, 31, 29, 35, 32]
답 = [0] * len(기온)
스택 = []                       # 아직 답을 못 찾은 칸 번호를 쌓아 둔다

# 1단계: 날마다 그보다 낮은 날들을 스택에서 꺼낸다
# 스택에는 아직 답을 못 찾은 날의 칸 번호가 기온이 내려가는 순서로 남는다. 새 날이 더 더우면 꺼내며 답을 적는다.
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

# 2단계: 기온과 답을 나란히 찍는다
print(f"\n기온 {기온}")
print(f"답   {답}   (0 은 끝까지 더 높은 날이 없다는 뜻)")

# 출력:
# 1단계 뜻: 5번 칸의 35도가 세 날을 한꺼번에 꺼낸다. 칸마다 스택에 한 번 들어가고 한 번 나오니 전체는 O(n) 이다.
# 칸   기온    하는 일                              스택(칸번호)
# 0   30    더 높은 게 없다 → 쌓기만                   [0]
# 1   28    더 높은 게 없다 → 쌓기만                   [0, 1]
# 2   33    1번은 1일 뒤, 0번은 2일 뒤                [2]
# 3   31    더 높은 게 없다 → 쌓기만                   [2, 3]
# 4   29    더 높은 게 없다 → 쌓기만                   [2, 3, 4]
# 5   35    4번은 1일 뒤, 3번은 2일 뒤, 2번은 3일 뒤      [5]
# 6   32    더 높은 게 없다 → 쌓기만                   [5, 6]
# 2단계 뜻: 칸마다 며칠 뒤에 처음 더 더워지는지다. 끝까지 더 높은 날이 없는 칸은 0 이다.
#
# 기온 [30, 28, 33, 31, 29, 35, 32]
# 답   [2, 1, 3, 2, 1, 0, 0]   (0 은 끝까지 더 높은 날이 없다는 뜻)
````

#### 블록 10

<!-- cb2 post=algorithm-binary-search-stack block=9 sha=3bb9a2d14df69a73 -->
````python
# 하는 일: 값 8개에서 크기 3 인 윈도우를 한 칸씩 옮기며, 단조 덱으로 윈도우마다 최댓값을 구한다.
from collections import deque

ARR, K = [1, 3, -1, -3, 5, 3, 6, 7], 3
덱, 답 = deque(), []

# 1단계: 칸마다 덱을 고치고 윈도우 최댓값을 읽는다
# 새 값보다 작은 것은 뒤에서 버리고, 윈도우 밖으로 나간 것은 앞에서 버린다. 그러면 덱의 맨 앞이 늘 지금 윈도우의 최댓값이다.
print(f"{'칸':<4}{'값':<5}{'덱(칸번호)':<18}{'윈도우':<16}{'최댓값'}")
for i, v in enumerate(ARR):
    while 덱 and ARR[덱[-1]] <= v:
        덱.pop()                       # 뒤에서 작은 것들을 버린다
    덱.append(i)
    if 덱[0] <= i - K:
        덱.popleft()                   # 윈도우 밖으로 나간 것을 버린다
    if i >= K - 1:
        답.append(ARR[덱[0]])
        윈도우 = ARR[i-K+1:i+1]
        print(f"{i:<4}{v:<5}{str(list(덱)):<18}{str(윈도우):<16}{ARR[덱[0]]}")
    else:
        print(f"{i:<4}{v:<5}{str(list(덱)):<18}{'아직 윈도우가 안 참':<14}-")
# 2단계: 윈도우마다 구한 최댓값을 찍는다
print(f"\n답 {답}")

# 출력:
# 1단계 뜻: 덱에는 칸 번호가 값이 줄어드는 순서로 남고, 맨 앞 칸의 값이 그 윈도우의 최댓값이다. 4번 칸의 5 가 들어오며 덱에 있던 셋을 모두 버린다.
# 칸   값    덱(칸번호)            윈도우             최댓값
# 0   1    [0]               아직 윈도우가 안 참   -
# 1   3    [1]               아직 윈도우가 안 참   -
# 2   -1   [1, 2]            [1, 3, -1]      3
# 3   -3   [1, 2, 3]         [3, -1, -3]     3
# 4   5    [4]               [-1, -3, 5]     5
# 5   3    [4, 5]            [-3, 5, 3]      5
# 6   6    [6]               [5, 3, 6]       6
# 7   7    [7]               [3, 6, 7]       7
# 2단계 뜻: 윈도우 6개의 최댓값이다.
#
# 답 [3, 3, 5, 5, 6, 7]
````

### 부록 3: algorithm-tree-heap (블록 10개, Task 7)

#### 블록 1

<!-- cb2 post=algorithm-tree-heap block=0 sha=aedaa071006af822 -->
````python
# 하는 일: 값 9개로 이진 트리 하나를 만들고 뿌리와 두 자식을 찍는다.
# 1단계: 마디를 만든다
# 마디 하나는 값 하나와, 왼쪽과 오른쪽 자식을 가리킬 자리 둘을 갖는다.
class Node:
    def __init__(self, val):
        self.val, self.left, self.right = val, None, None

# 2단계: 그림의 트리를 잇고 뿌리를 찍는다
# 뿌리 8 의 왼쪽은 3, 오른쪽은 10 이다. 3 아래에 1 과 6, 6 아래에 4 와 7 이 있고, 10 의 오른쪽에 14, 14 의 왼쪽에 13 이 있다.
def build():
    n = {v: Node(v) for v in (8, 3, 10, 1, 6, 14, 4, 7, 13)}
    n[8].left,  n[8].right  = n[3], n[10]
    n[3].left,  n[3].right  = n[1], n[6]
    n[6].left,  n[6].right  = n[4], n[7]
    n[10].right = n[14]
    n[14].left  = n[13]
    return n[8]

root = build()
print(f"뿌리 {root.val}, 왼쪽 {root.left.val}, 오른쪽 {root.right.val}")

# 출력:
# 2단계 뜻: 뿌리 8 의 왼쪽 자식이 3, 오른쪽 자식이 10 이다.
# 뿌리 8, 왼쪽 3, 오른쪽 10
````

#### 블록 2

<!-- cb2 post=algorithm-tree-heap block=1 sha=3b1ba849c863e5b6 -->
````python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 1절의 트리를 전위, 중위, 후위 세 순서로 훑어 값을 찍는다.
# 1단계: 세 순서를 만든다
# 세 함수는 나를 적기, 왼쪽 훑기, 오른쪽 훑기 세 일의 순서만 다르다.
def 전위(t, out):
    if t: out.append(t.val); 전위(t.left, out); 전위(t.right, out)

def 중위(t, out):
    if t: 중위(t.left, out); out.append(t.val); 중위(t.right, out)

def 후위(t, out):
    if t: 후위(t.left, out); 후위(t.right, out); out.append(t.val)

# 2단계: 1절의 트리를 세 순서로 훑는다
for 이름, fn in (("전위 (뿌리 먼저)", 전위), ("중위 (왼쪽 먼저)", 중위), ("후위 (뿌리 나중)", 후위)):
    out = []
    fn(root, out)
    print(f"{이름:<18}{out}")

# 출력:
# 2단계 뜻: 중위 결과만 정렬돼 있다. 뿌리 8 이 전위에서는 맨 앞에, 후위에서는 맨 뒤에 온다.
# 전위 (뿌리 먼저)        [8, 3, 1, 6, 4, 7, 10, 14, 13]
# 중위 (왼쪽 먼저)        [1, 3, 4, 6, 7, 8, 10, 13, 14]
# 후위 (뿌리 나중)        [1, 4, 7, 6, 3, 13, 14, 10, 8]
````

#### 블록 3

<!-- cb2 post=algorithm-tree-heap block=2 sha=d94ad804239ac09b -->
````python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 1절의 트리를 재귀 없이 스택 하나로 전위 순서로 훑는다.
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

# 출력:
# 뜻: 재귀로 훑은 전위 결과와 같다. 오른쪽을 먼저 넣어야 왼쪽이 먼저 나온다.
# [8, 3, 1, 6, 4, 7, 10, 14, 13]
````

#### 블록 4

<!-- cb2 post=algorithm-tree-heap block=3 sha=825ed9e2d36f1f9f -->
````python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 1절의 트리를 큐로 한 층씩 훑으며, 층마다 꺼낸 것과 넣은 것과 큐 상태를 찍는다.
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

# 출력:
# 뜻: 반복문에 들어가기 전의 큐 길이가 그 층의 크기다. 그만큼만 꺼내니 층마다 한 줄씩 나온다.
# 층   큐에서 꺼낸 것        큐에 넣은 것         큐 상태
# 0   [8]             [3, 10]         [3, 10]
# 1   [3, 10]         [1, 6, 14]      [1, 6, 14]
# 2   [1, 6, 14]      [4, 7, 13]      [4, 7, 13]
# 3   [4, 7, 13]      []              []
````

#### 블록 5

<!-- cb2 post=algorithm-tree-heap block=4 sha=d8bb8423ff10bd71 -->
````python
# 하는 일: 파이썬의 재귀 한계를 확인하고, 깊이 900 과 3000 의 재귀를 한계를 올리기 전과 뒤에 돌려 본다.
import sys

print("파이썬 기본 재귀 한계", sys.getrecursionlimit())

# 1단계: 깊이 n 까지 재귀하는 함수를 만든다
def 깊이(n):
    if n == 0: return 0
    return 1 + 깊이(n - 1)

# 2단계: 기본 한계에서 900 과 3000 을 돌린다
for n in (900, 3000):
    try:
        print(f"깊이 {n:>5} → {깊이(n)}")
    except RecursionError:
        print(f"깊이 {n:>5} → RecursionError")

# 3단계: 한계를 10,000 으로 올려 다시 돌린다
sys.setrecursionlimit(10_000)
print("한계를 10,000 으로 올린 뒤")
print(f"깊이  3000 → {깊이(3000)}")

# 출력:
# 뜻: 기본 한계는 1000 이다.
# 파이썬 기본 재귀 한계 1000
# 2단계 뜻: 깊이 900 은 한계 안이라 돌고, 3000 은 한계를 넘어 RecursionError 가 난다.
# 깊이   900 → 900
# 깊이  3000 → RecursionError
# 3단계 뜻: 한계를 올리면 같은 깊이 3000 이 돈다.
# 한계를 10,000 으로 올린 뒤
# 깊이  3000 → 3000
````

#### 블록 6

<!-- cb2 post=algorithm-tree-heap block=5 sha=d9141a290d657b35 -->
````python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 같은 값 9개를 두 순서로 이진 탐색 트리에 넣고, 13 을 찾는 데 몇 회 걸리는지 견준다.
# 1단계: 넣기와 찾기를 만든다
# 작으면 왼쪽, 크면 오른쪽으로 내려간다. 찾기는 회차마다 지금 마디와 갈 방향을 찍는다.
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

# 2단계: 같은 값을 두 순서로 넣는다
# 하나는 1절의 그림과 같은 순서로, 하나는 정렬된 순서로 넣는다.
균형 = None
for v in (8, 3, 10, 1, 6, 14, 4, 7, 13):
    균형 = 넣기(균형, v)

한줄 = None
for v in (1, 3, 4, 6, 7, 8, 10, 13, 14):       # 정렬된 순서로 넣는다
    한줄 = 넣기(한줄, v)

# 3단계: 두 트리에서 13 을 찾는다
print("균형 잡힌 트리에서 13 찾기")
a = 찾기(균형, 13)
print("\n정렬된 순서로 넣어 한 줄이 된 트리에서 13 찾기")
b = 찾기(한줄, 13)
print(f"\n같은 값 아홉 개인데 {a}회 vs {b}회")

# 출력:
# 3단계 뜻: 균형 잡힌 트리에서는 비교할 때마다 갈래 하나를 버려 4회 만에 찾는다.
# 균형 잡힌 트리에서 13 찾기
#   1회  지금  8  13 > 8  → 오른쪽
#   2회  지금 10  13 > 10  → 오른쪽
#   3회  지금 14  13 < 14  → 왼쪽
#   4회  지금 13  13 = 13  → 찾음
# 3단계 뜻: 정렬된 순서로 넣으면 오른쪽으로만 이어진 한 줄이 되어, 앞에서부터 훑듯이 8회가 걸린다.
#
# 정렬된 순서로 넣어 한 줄이 된 트리에서 13 찾기
#   1회  지금  1  13 > 1  → 오른쪽
#   2회  지금  3  13 > 3  → 오른쪽
#   3회  지금  4  13 > 4  → 오른쪽
#   4회  지금  6  13 > 6  → 오른쪽
#   5회  지금  7  13 > 7  → 오른쪽
#   6회  지금  8  13 > 8  → 오른쪽
#   7회  지금 10  13 > 10  → 오른쪽
#   8회  지금 13  13 = 13  → 찾음
# 3단계 뜻: 같은 값인데 넣은 순서만 달라 회차가 두 배가 됐다.
#
# 같은 값 아홉 개인데 4회 vs 8회
````

#### 블록 7

<!-- cb2 post=algorithm-tree-heap block=6 sha=b6fb4fa164b85beb -->
````python
# 하는 일: 값 8개를 힙에 하나씩 넣으며 힙 안쪽과 맨 앞을 찍고, 작은 것부터 모두 꺼내 정렬한 것과 견준다.
import heapq

# 1단계: 값을 하나씩 힙에 넣는다
값 = [23, 5, 38, 2, 45, 8, 16, 12]
힙 = []
print(f"{'넣는 값':<8}{'힙 안쪽(리스트 그대로)':<34}{'맨 앞(가장 작은 값)'}")
for v in 값:
    heapq.heappush(힙, v)
    print(f"{v:<8}{str(힙):<34}{힙[0]}")

# 2단계: 작은 것부터 모두 꺼낸다
print()
print("작은 것부터 꺼내기")
꺼낸것 = []
while 힙:
    꺼낸것.append(heapq.heappop(힙))
print(" ", 꺼낸것)
print(" 정렬한 것과 같나:", 꺼낸것 == sorted(값))

# 출력:
# 1단계 뜻: 힙 안쪽은 정렬돼 있지 않지만 맨 앞은 늘 가장 작은 값이다. 2 가 들어온 뒤로 맨 앞은 2 다.
# 넣는 값    힙 안쪽(리스트 그대로)                     맨 앞(가장 작은 값)
# 23      [23]                              23
# 5       [5, 23]                           5
# 38      [5, 23, 38]                       5
# 2       [2, 5, 38, 23]                    2
# 45      [2, 5, 38, 23, 45]                2
# 8       [2, 5, 8, 23, 45, 38]             2
# 16      [2, 5, 8, 23, 45, 38, 16]         2
# 12      [2, 5, 8, 12, 45, 38, 16, 23]     2
# 2단계 뜻: 하나씩 꺼내면 작은 것부터 나와 정렬한 것과 같다.
#
# 작은 것부터 꺼내기
#   [2, 5, 8, 12, 16, 23, 38, 45]
#  정렬한 것과 같나: True
````

#### 블록 8

<!-- cb2 post=algorithm-tree-heap block=7 sha=eb038fc9d45b1808 -->
````python
# 하는 일: 7절의 힙 8칸에서 칸 번호로 부모와 자식 칸을 계산해 찍고, 부모 값이 내 값 이하인지 본다.
힙 = [2, 5, 8, 12, 45, 38, 16, 23]

print(f"{'칸':<4}{'값':<5}{'부모 칸':<9}{'왼쪽 자식':<11}{'오른쪽 자식':<12}{'부모 값 ≤ 내 값'}")
for i, v in enumerate(힙):
    부모 = (i - 1) // 2 if i > 0 else None
    왼, 오 = 2*i + 1, 2*i + 2
    왼 = 왼 if 왼 < len(힙) else None
    오 = 오 if 오 < len(힙) else None
    지킴 = "-" if 부모 is None else ("예" if 힙[부모] <= v else "아니오")
    print(f"{i:<4}{v:<5}{str(부모):<9}{str(왼):<11}{str(오):<12}{지킴}")

print("\n칸 번호만으로 부모, 자식을 계산하니 연결선을 따로 안 들고 있어도 된다.")

# 출력:
# 뜻: 칸 i 의 자식은 2i+1, 2i+2 이고 부모는 (i-1)//2 다. 모든 칸에서 부모 값이 내 값 이하라 힙 규칙을 지킨다.
# 칸   값    부모 칸     왼쪽 자식      오른쪽 자식      부모 값 ≤ 내 값
# 0   2    None     1          2           -
# 1   5    0        3          4           예
# 2   8    0        5          6           예
# 3   12   1        7          None        예
# 4   45   1        None       None        예
# 5   38   2        None       None        예
# 6   16   2        None       None        예
# 7   23   3        None       None        예
# 뜻: 연결선 없이 계산만으로 트리를 오간다.
#
# 칸 번호만으로 부모, 자식을 계산하니 연결선을 따로 안 들고 있어도 된다.
````

#### 블록 9

<!-- cb2 post=algorithm-tree-heap block=8 sha=a4ec9d0d3d0dc27b -->
````python
# 하는 일: heapq 로 값 5개를 큰 것부터 꺼내고, 순위와 이름을 묶은 작업 4개를 급한 것부터 꺼낸다.
import heapq

값 = [23, 5, 38, 2, 45]

# 1단계: 부호를 뒤집어 큰 것부터 꺼낸다
# 파이썬 heapq 는 작은 것부터만 꺼낸다. 큰 것부터 꺼내려면 부호를 뒤집는다.
최대힙 = []
for v in 값:
    heapq.heappush(최대힙, -v)
print("큰 것부터", [-heapq.heappop(최대힙) for _ in range(len(값))])

# 2단계: 튜플로 묶어 급한 것부터 꺼낸다
# 값 말고 딸린 정보도 같이 넣으려면 튜플로 — 앞 원소부터 비교한다
작업 = [(2, "리포트"), (1, "장애 대응"), (3, "회의"), (1, "배포 롤백")]
h = []
for 순위, 이름 in 작업:
    heapq.heappush(h, (순위, 이름))
print("급한 것부터")
while h:
    순위, 이름 = heapq.heappop(h)
    print(f"  {순위}순위  {이름}")

# 출력:
# 1단계 뜻: -v 로 넣고 꺼낼 때 다시 뒤집으니 큰 것부터 나온다.
# 큰 것부터 [45, 38, 23, 5, 2]
# 2단계 뜻: 튜플은 앞 원소부터 견주니 순위가 낮은 것부터 나온다. 순위가 같은 둘은 이름의 가나다순으로 배포 롤백이 먼저다.
# 급한 것부터
#   1순위  배포 롤백
#   1순위  장애 대응
#   2순위  리포트
#   3순위  회의
````

#### 블록 10

<!-- cb2 post=algorithm-tree-heap block=9 sha=78576e590560dc01 -->
````python
# 하는 일: 값 20만 개에서 큰 것 10개를 전부 정렬, 직접 짠 힙, heapq.nlargest 세 방법으로 구해 걸린 시간을 견준다.
import heapq, random, time

random.seed(7)
값 = [random.randint(1, 1_000_000) for _ in range(200_000)]
K = 10

# 1단계: 세 방법을 만든다
# 직접 짠 힙은 10칸만 들고 있다가 11개가 되면 가장 작은 것을 버린다.
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

# 2단계: 세 방법을 재고 답을 견준다
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

# 출력 (시간은 돌릴 때마다 다르다):
# 2단계 뜻: 계산 횟수는 힙이 적지만, 파이썬으로 한 줄씩 도는 직접 짠 힙이 C 로 도는 전부 정렬보다 느리다. nlargest 는 같은 힙 방법을 C 로 돌려 가장 빠르다.
# 값 200,000개 중 큰 것 10개
# 방법                  시간(ms)       들고 있는 칸
# 전부 정렬                 21.9       200,000
# 힙 K칸 직접               31.9            10
# heapq.nlargest         2.2            10
#
# 세 답이 모두 같나 True
````

### 부록 4: algorithm-graph-search (블록 9개, Task 7)

#### 블록 1

<!-- cb2 post=algorithm-graph-search block=0 sha=6b774a0e4205665f -->
````python
# 하는 일: 마디 6개를 간선 5개로 이으며 유니온 파인드로 대표를 합치고, 이미 같은 덩어리인 두 마디를 잇는 간선에서 순환을 찾아낸다.
부모 = {}

# 1단계: 찾기와 합치기를 만든다
# 마디마다 내 대표가 누구인지만 적어 둔다. 두 마디를 이을 때 대표가 같으면 이미 같은 덩어리다.
def 찾기(x):
    부모.setdefault(x, x)
    while 부모[x] != x:
        부모[x] = 부모[부모[x]]      # 지나가는 김에 지름길을 만든다
        x = 부모[x]
    return x

def 합치기(a, b):
    ra, rb = 찾기(a), 찾기(b)
    if ra == rb: return False        # 이미 같은 덩어리
    부모[ra] = rb
    return True

# 2단계: 간선을 하나씩 이으며 합친다
간선D = [("A","B"), ("A","C"), ("B","D"), ("C","D"), ("E","F")]
for u, v in 간선D:
    새로 = 합치기(u, v)
    print(f"{u}-{v}  {'합쳤다' if 새로 else '이미 같은 덩어리 — 여기가 순환'}")

# 3단계: 덩어리 수를 센다
덩어리 = {찾기(x) for x in 부모}
print(f"\n덩어리 {len(덩어리)}개")

# 출력:
# 2단계 뜻: C-D 를 이으려 할 때 C 와 D 가 이미 같은 덩어리라 여기서 순환이 생긴다.
# A-B  합쳤다
# A-C  합쳤다
# B-D  합쳤다
# C-D  이미 같은 덩어리 — 여기가 순환
# E-F  합쳤다
# 3단계 뜻: A, B, C, D 가 한 덩어리, E, F 가 한 덩어리다.
#
# 덩어리 2개
````

#### 블록 2

<!-- cb2 post=algorithm-graph-search block=1 sha=d1a7ef7308b836e0 -->
````python
# 하는 일: 마디 7개와 간선 8개로 된 그래프를 인접 리스트와 인접 행렬 두 가지로 담고, 각각 들고 있는 칸 수를 견준다.
from collections import defaultdict

간선 = [("A","B"), ("A","C"), ("B","D"), ("C","D"), ("C","E"), ("D","F"), ("E","F"), ("F","G")]

# 1단계: 인접 리스트를 만든다
# 마디마다 이웃 목록만 든다. 양방향이라 간선 하나를 두 마디에 다 넣는다.
이웃 = defaultdict(list)
for u, v in 간선:
    이웃[u].append(v)
    이웃[v].append(u)          # 양방향이면 둘 다 넣는다

print("인접 리스트 — 마디마다 이웃 목록만 들고 있다")
for n in sorted(이웃):
    print(f"  {n}  {이웃[n]}")

# 2단계: 인접 행렬을 만든다
# 모든 마디 짝에 대해 이어져 있으면 1, 아니면 0 을 둔다.
마디 = sorted(이웃)
자리 = {n: i for i, n in enumerate(마디)}
행렬 = [[0] * len(마디) for _ in 마디]
for u, v in 간선:
    행렬[자리[u]][자리[v]] = 행렬[자리[v]][자리[u]] = 1

print("\n인접 행렬 — 모든 짝에 대해 있나 없나")
print("   " + " ".join(마디))
for n in 마디:
    print(f" {n} " + " ".join(str(x) for x in 행렬[자리[n]]))

# 3단계: 두 방법이 들고 있는 칸 수를 견준다
간선수 = len(간선)
print(f"\n마디 {len(마디)}개, 간선 {간선수}개")
print(f"인접 리스트가 들고 있는 칸  {2*간선수}")
print(f"인접 행렬이 들고 있는 칸    {len(마디)**2}")

# 출력:
# 1단계 뜻: 마디마다 이웃 목록이다. C, D, F 는 이웃이 셋이다.
# 인접 리스트 — 마디마다 이웃 목록만 들고 있다
#   A  ['B', 'C']
#   B  ['A', 'D']
#   C  ['A', 'D', 'E']
#   D  ['B', 'C', 'F']
#   E  ['C', 'F']
#   F  ['D', 'E', 'G']
#   G  ['F']
# 2단계 뜻: 7 × 7 칸에서 1 은 간선이 있는 자리다. 양방향이라 대각선을 기준으로 대칭이다.
#
# 인접 행렬 — 모든 짝에 대해 있나 없나
#    A B C D E F G
#  A 0 1 1 0 0 0 0
#  B 1 0 0 1 0 0 0
#  C 1 0 0 1 1 0 0
#  D 0 1 1 0 0 1 0
#  E 0 0 1 0 0 1 0
#  F 0 0 0 1 1 0 1
#  G 0 0 0 0 0 1 0
# 3단계 뜻: 인접 리스트는 간선 수의 두 배, 인접 행렬은 마디 수의 제곱만큼 칸을 든다.
#
# 마디 7개, 간선 8개
# 인접 리스트가 들고 있는 칸  16
# 인접 행렬이 들고 있는 칸    49
````

#### 블록 3

<!-- cb2 post=algorithm-graph-search block=2 sha=160c22c15b1254dc -->
````python
# 하는 일: 2절과 같은 그래프를 스택으로 A 부터 깊이 우선으로 훑으며, 꺼낼 때마다 스택과 방문 순서를 찍는다.
from collections import defaultdict

간선 = [("A","B"), ("A","C"), ("B","D"), ("C","D"), ("C","E"), ("D","F"), ("E","F"), ("F","G")]
이웃 = defaultdict(list)
for u, v in 간선:
    이웃[u].append(v); 이웃[v].append(u)
for n in 이웃: 이웃[n].sort()

# 1단계: 스택으로 훑는 함수를 만든다
# 꺼낸 마디가 이미 본 것이면 버린다. 같은 마디가 여러 경로로 스택에 들어오기 때문이다.
def dfs(시작):
    본것, 스택, 순서 = set(), [시작], []
    print(f"  {'꺼낸 것':<8}{'스택':<22}{'순서'}")
    while 스택:
        n = 스택.pop()
        if n in 본것: continue          # 이미 본 것이면 버린다
        본것.add(n); 순서.append(n)
        for m in reversed(이웃[n]):     # 뒤집어 넣어야 알파벳 순으로 나온다
            if m not in 본것: 스택.append(m)
        print(f"  {n:<8}{str(스택):<22}{순서}")
    return 순서

# 2단계: A 부터 훑는다
print("깊이 우선 (스택) — 한 갈래를 끝까지")
a = dfs("A")

# 출력:
# 2단계 뜻: A 다음 B, D 로 깊이 들어갔다가 C 로 돌아온다. 스택에 'C' 와 'F' 가 두 번씩 들어간다.
# 깊이 우선 (스택) — 한 갈래를 끝까지
#   꺼낸 것    스택                    순서
#   A       ['C', 'B']            ['A']
#   B       ['C', 'D']            ['A', 'B']
#   D       ['C', 'F', 'C']       ['A', 'B', 'D']
#   C       ['C', 'F', 'E']       ['A', 'B', 'D', 'C']
#   E       ['C', 'F', 'F']       ['A', 'B', 'D', 'C', 'E']
#   F       ['C', 'F', 'G']       ['A', 'B', 'D', 'C', 'E', 'F']
#   G       ['C', 'F']            ['A', 'B', 'D', 'C', 'E', 'F', 'G']
````

#### 블록 4

<!-- cb2 post=algorithm-graph-search block=3 sha=e8451e21a119a53f -->
````python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 3절의 그래프를 큐로 A 부터 너비 우선으로 훑으며, 꺼낼 때마다 큐와 방문 순서를 찍는다.
from collections import deque

# 1단계: 큐로 훑는 함수를 만든다
# 스택을 큐로 바꾸면 가까운 마디부터 나온다. 방문 표시는 큐에 넣을 때 한다.
def bfs(시작):
    본것, 큐, 순서 = {시작}, deque([시작]), []
    print(f"  {'꺼낸 것':<8}{'큐':<22}{'순서'}")
    while 큐:
        n = 큐.popleft(); 순서.append(n)
        for m in 이웃[n]:
            if m not in 본것:
                본것.add(m); 큐.append(m)      # 넣을 때 표시한다
        print(f"  {n:<8}{str(list(큐)):<22}{순서}")
    return 순서

# 2단계: A 부터 훑는다
print("너비 우선 (큐) — 가까운 것부터")
b = bfs("A")

# 출력:
# 2단계 뜻: A 에서 한 칸 거리인 B 와 C 를 먼저 다 보고, 그다음 두 칸 거리인 D 와 E 를 본다.
# 너비 우선 (큐) — 가까운 것부터
#   꺼낸 것    큐                     순서
#   A       ['B', 'C']            ['A']
#   B       ['C', 'D']            ['A', 'B']
#   C       ['D', 'E']            ['A', 'B', 'C']
#   D       ['E', 'F']            ['A', 'B', 'C', 'D']
#   E       ['F']                 ['A', 'B', 'C', 'D', 'E']
#   F       ['G']                 ['A', 'B', 'C', 'D', 'E', 'F']
#   G       []                    ['A', 'B', 'C', 'D', 'E', 'F', 'G']
````

#### 블록 5

<!-- cb2 post=algorithm-graph-search block=4 sha=943c8514d95c7379 -->
````python
# (앞 블록에 이어서 돌린다.)
# 하는 일: A 부터 너비 우선으로 한 층씩 훑으며 마디마다 거리와 어디서 왔는지를 적고, G 까지의 최단 경로를 거슬러 올라가 찾는다.
# 1단계: 층별로 훑으며 거리와 앞마디를 적는다
# 처음 닿았을 때의 거리가 최단이다. 그보다 가까운 길은 이미 다 봤기 때문이다.
거리 = {"A": 0}
앞마디 = {}
큐 = deque(["A"])
print(f"{'층':<4}{'그 층의 마디':<16}{'A 에서의 거리'}")
층 = 0
while 큐:
    이번층 = []
    for _ in range(len(큐)):
        n = 큐.popleft(); 이번층.append(n)
        for m in 이웃[n]:
            if m not in 거리:
                거리[m] = 거리[n] + 1
                앞마디[m] = n              # 어디서 왔는지 적어 둔다
                큐.append(m)
    print(f"{층:<4}{str(이번층):<16}{층}")
    층 += 1

# 2단계: 마디별 최단 거리를 찍는다
print("\n마디별 A 에서의 최단 거리")
for n in sorted(거리):
    print(f"  {n}  {거리[n]}")

# 3단계: G 에서 앞마디를 거슬러 올라가 경로를 만든다
길 = ["G"]
while 길[-1] in 앞마디:
    길.append(앞마디[길[-1]])
print("\nA 에서 G 까지 최단 경로", " → ".join(reversed(길)) + f", {거리['G']}칸")

# 출력:
# 1단계 뜻: 층 번호가 곧 A 에서의 거리다.
# 층   그 층의 마디         A 에서의 거리
# 0   ['A']           0
# 1   ['B', 'C']      1
# 2   ['D', 'E']      2
# 3   ['F']           3
# 4   ['G']           4
# 2단계 뜻: 마디마다 처음 닿았을 때 적은 거리다.
#
# 마디별 A 에서의 최단 거리
#   A  0
#   B  1
#   C  1
#   D  2
#   E  2
#   F  3
#   G  4
# 3단계 뜻: G 에서 앞마디를 따라 A 까지 올라간 뒤 뒤집은 길이다. 4칸이 최단이다.
#
# A 에서 G 까지 최단 경로 A → B → D → F → G, 4칸
````

#### 블록 6

<!-- cb2 post=algorithm-graph-search block=5 sha=5184d51430f3a2b8 -->
````python
# 하는 일: 갈래 8개가 퍼졌다가 한 마디로 다시 모이는 그래프를 BFS 로 훑으며, 방문 표시를 넣을 때 하는 경우와 꺼낼 때 하는 경우의 큐 횟수를 견준다.
from collections import defaultdict, deque

# 1단계: 퍼졌다가 다시 모이는 그래프를 만든다
# 갈래가 퍼졌다가 한 마디로 다시 모이는 모양 — 실제 문제에서 흔하다
이웃2 = defaultdict(list)
for i in range(1, 9):
    이웃2["시작"].append(f"중간{i}")
    이웃2[f"중간{i}"].append("끝")

# 2단계: 표시 시점만 다른 BFS 를 만든다
# 「꺼낼 때」는 표시 없이 넣으니 같은 마디가 큐에 여러 번 들어간다.
def bfs2(표시시점):
    큐, 방문, 넣은횟수 = deque(["시작"]), {"시작"}, 0
    꺼낸횟수 = 0
    while 큐:
        n = 큐.popleft(); 꺼낸횟수 += 1
        if 표시시점 == "꺼낼 때":
            if n in 방문 and n != "시작":
                continue                       # 이미 본 것 — 버린다
            방문.add(n)
        for m in 이웃2[n]:
            if 표시시점 == "넣을 때":
                if m not in 방문:
                    방문.add(m); 큐.append(m); 넣은횟수 += 1
            else:
                if m not in 방문:
                    큐.append(m); 넣은횟수 += 1   # 표시를 안 하고 넣는다
    return 넣은횟수, 꺼낸횟수

# 3단계: 두 시점의 횟수를 견준다
print(f"{'표시 시점':<12}{'큐에 넣은 횟수':>14}{'큐에서 꺼낸 횟수':>16}")
for 시점 in ("넣을 때", "꺼낼 때"):
    넣은, 꺼낸 = bfs2(시점)
    print(f"{시점:<12}{넣은:>14}{꺼낸:>16}")
print("\n마디는 10개뿐인데 '꺼낼 때' 쪽은 그보다 훨씬 많이 큐를 거친다.")

# 출력:
# 3단계 뜻: 「넣을 때」는 마디마다 한 번씩 거친다. 「꺼낼 때」는 끝 마디가 큐에 8번 들어가 16번 넣고 17번 꺼낸다.
# 표시 시점             큐에 넣은 횟수       큐에서 꺼낸 횟수
# 넣을 때                     9              10
# 꺼낼 때                    16              17
#
# 마디는 10개뿐인데 '꺼낼 때' 쪽은 그보다 훨씬 많이 큐를 거친다.
````

#### 블록 7

<!-- cb2 post=algorithm-graph-search block=6 sha=eddd55d0d4acb07a -->
````python
# 하는 일: 5 × 5 격자 미로에서 왼쪽 위 칸부터 BFS 로 칸마다 거리를 구하고, 오른쪽 아래까지 몇 칸인지 찍는다.
from collections import deque

# 1단계: 격자를 둔다
# 1 은 벽이다. 한 칸의 이웃은 위, 아래, 왼쪽, 오른쪽 네 칸이라 이웃 목록을 따로 만들지 않는다.
격자 = [
    "0 0 1 0 0",
    "1 0 1 0 1",
    "0 0 0 0 1",
    "0 1 1 0 0",
    "0 0 0 0 0",
]
판 = [줄.split() for 줄 in 격자]
H, W = len(판), len(판[0])

# 2단계: 왼쪽 위에서 BFS 로 거리를 채운다
# 거리 판이 방문 표시를 겸한다. -1 이면 아직 안 간 칸이다.
거리 = [[-1]*W for _ in range(H)]
거리[0][0] = 0
큐 = deque([(0, 0)])
while 큐:
    r, c = 큐.popleft()
    for dr, dc in ((-1,0), (1,0), (0,-1), (0,1)):      # 위, 아래, 왼, 오
        nr, nc = r+dr, c+dc
        if 0 <= nr < H and 0 <= nc < W and 판[nr][nc] == "0" and 거리[nr][nc] == -1:
            거리[nr][nc] = 거리[r][c] + 1
            큐.append((nr, nc))

# 3단계: 판과 거리를 찍는다
print("판 (1 은 벽)")
for 줄 in 판: print("  " + " ".join(줄))
print("\n왼쪽 위에서의 거리 (. 은 못 감)")
for 줄 in 거리:
    print("  " + " ".join(f"{x:>2}" if x >= 0 else " ." for x in 줄))
print(f"\n오른쪽 아래까지 {거리[H-1][W-1]}칸")

# 출력:
# 3단계 뜻: 입력 판이다. 1 은 벽이라 못 지나간다.
# 판 (1 은 벽)
#   0 0 1 0 0
#   1 0 1 0 1
#   0 0 0 0 1
#   0 1 1 0 0
#   0 0 0 0 0
# 3단계 뜻: 칸마다 왼쪽 위에서 몇 칸 거리인지다. 오른쪽 위 구석의 7 과 8 은 벽을 아래로 크게 돌아 닿은 값이고, 오른쪽 아래까지는 8칸이다.
#
# 왼쪽 위에서의 거리 (. 은 못 감)
#    0  1  .  7  8
#    .  2  .  6  .
#    4  3  4  5  .
#    5  .  .  6  7
#    6  7  8  7  8
#
# 오른쪽 아래까지 8칸
````

#### 블록 8

<!-- cb2 post=algorithm-graph-search block=7 sha=860d40cb1eddd0fb -->
````python
# 하는 일: 가중치가 있는 간선 9개의 그래프에서 다익스트라로 A 부터 마디마다 최단 거리를 구하며, 힙에서 꺼낼 때마다 고친 이웃과 힙을 찍는다.
import heapq
from collections import defaultdict

# 1단계: 가중치 그래프를 만든다
간선W = [("A","B",4), ("A","C",1), ("C","B",2), ("B","D",5),
         ("C","D",8), ("C","E",10), ("D","E",2), ("D","F",6), ("E","F",3)]
이웃W = defaultdict(list)
for u, v, w in 간선W:
    이웃W[u].append((v, w)); 이웃W[v].append((u, w))

# 2단계: 거리가 가장 짧은 것부터 힙에서 꺼낸다
# 꺼낸 거리가 적어 둔 거리보다 크면 낡은 값이라 버린다. 파이썬 힙은 안에 든 값을 고치거나 지울 수 없기 때문이다.
무한 = float("inf")
거리W = {"A": 0}
힙 = [(0, "A")]
print(f"{'꺼낸 것':<9}{'고친 이웃':<20}{'힙 (거리, 마디)'}")
while 힙:
    d, n = heapq.heappop(힙)
    if d > 거리W.get(n, 무한):
        print(f"{n+' 낡음':<9}{'-':<20}{sorted(힙)}")
        continue
    고친것 = []
    for m, w in 이웃W[n]:
        if d + w < 거리W.get(m, 무한):
            거리W[m] = d + w
            고친것.append(f"{m}={d+w}")
            heapq.heappush(힙, (거리W[m], m))
    print(f"{n:<9}{(', '.join(고친것) or '없음'):<20}{sorted(힙)}")

# 3단계: 최단 거리를 찍는다
print("\nA 에서의 최단 거리")
print("  " + "  ".join(f"{n}={거리W[n]}" for n in sorted(거리W)))
print("\n칸 수로 세면 A→B 가 1칸이지만, 가중치로 세면 A→C→B 가 3 으로 더 싸다.")

# 출력:
# 2단계 뜻: C 를 꺼낸 2회차에 B 의 거리가 4 에서 3 으로 고쳐진다. 힙에 남은 (4, 'B') 는 나중에 낡음으로 버려진다.
# 꺼낸 것     고친 이웃               힙 (거리, 마디)
# A        B=4, C=1            [(1, 'C'), (4, 'B')]
# C        B=3, D=9, E=11      [(3, 'B'), (4, 'B'), (9, 'D'), (11, 'E')]
# B        D=8                 [(4, 'B'), (8, 'D'), (9, 'D'), (11, 'E')]
# B 낡음     -                   [(8, 'D'), (9, 'D'), (11, 'E')]
# D        E=10, F=14          [(9, 'D'), (10, 'E'), (11, 'E'), (14, 'F')]
# D 낡음     -                   [(10, 'E'), (11, 'E'), (14, 'F')]
# E        F=13                [(11, 'E'), (13, 'F'), (14, 'F')]
# E 낡음     -                   [(13, 'F'), (14, 'F')]
# F        없음                  [(14, 'F')]
# F 낡음     -                   []
# 3단계 뜻: A 에서 마디마다의 최단 거리다. 한 칸짜리 A→B 보다 A→C→B 가 더 싸다.
#
# A 에서의 최단 거리
#   A=0  B=3  C=1  D=8  E=10  F=13
#
# 칸 수로 세면 A→B 가 1칸이지만, 가중치로 세면 A→C→B 가 3 으로 더 싸다.
````

#### 블록 9

<!-- cb2 post=algorithm-graph-search block=8 sha=7dac0a34d6ed7345 -->
````python
# 하는 일: 선수 과목 관계 7개로 과목 6개의 수강 순서를 정하며, 회차마다 들을 수 있는 과목과 고른 과목을 찍는다.
from collections import defaultdict, deque

# 1단계: 선후 관계로 과목마다 앞에 남은 수를 센다
# 선수 과목 — (먼저, 나중)
선후 = [("기초수학","선형대수"), ("기초수학","확률"), ("선형대수","머신러닝"),
        ("확률","머신러닝"), ("확률","통계"), ("머신러닝","추천시스템"), ("통계","추천시스템")]

다음 = defaultdict(list)
들어오는수 = defaultdict(int)
과목 = set()
for a, b in 선후:
    다음[a].append(b)
    들어오는수[b] += 1
    과목 |= {a, b}
for x in 과목:
    들어오는수.setdefault(x, 0)

# 2단계: 앞에 남은 수가 0 인 과목부터 꺼낸다
# 하나를 꺼낼 때마다 그 뒤 과목들의 앞에 남은 수를 하나씩 줄인다. 0 이 된 과목이 다음 차례다.
큐2 = deque(sorted(x for x in 과목 if 들어오는수[x] == 0))
순서 = []
print(f"{'들을 수 있는 것':<24}{'고른 것':<12}{'0 이 된 과목'}")
while 큐2:
    가능 = list(큐2)
    n = 큐2.popleft(); 순서.append(n)
    새로0 = []
    for m in 다음[n]:
        들어오는수[m] -= 1
        if 들어오는수[m] == 0:
            큐2.append(m); 새로0.append(m)
    print(f"{str(가능):<24}{n:<12}{새로0 or '없음'}")

# 3단계: 수강 순서를 찍고 순환이 없는지 본다
print(f"\n수강 순서 {' → '.join(순서)}")
print(f"과목 {len(과목)}개 중 {len(순서)}개가 순서에 들어갔다 — 같으면 순환이 없다는 뜻")

# 출력:
# 2단계 뜻: 회차마다 들을 수 있는 과목 가운데 맨 앞을 고른다. 둘째 회차처럼 들을 수 있는 과목이 둘이면 답이 여럿일 수 있다.
# 들을 수 있는 것               고른 것        0 이 된 과목
# ['기초수학']                기초수학        ['선형대수', '확률']
# ['선형대수', '확률']          선형대수        없음
# ['확률']                  확률          ['머신러닝', '통계']
# ['머신러닝', '통계']          머신러닝        없음
# ['통계']                  통계          ['추천시스템']
# ['추천시스템']               추천시스템       없음
# 3단계 뜻: 6개가 모두 순서에 들어갔으니 서로를 기다리는 순환이 없다.
#
# 수강 순서 기초수학 → 선형대수 → 확률 → 머신러닝 → 통계 → 추천시스템
# 과목 6개 중 6개가 순서에 들어갔다 — 같으면 순환이 없다는 뜻
````

### 부록 5: algorithm-dp-greedy (블록 7개, Task 7)

#### 블록 1

<!-- cb2 post=algorithm-dp-greedy block=0 sha=36e4c675f63f7d33 -->
````python
# 하는 일: 피보나치를 그냥 재귀로 구하며 n 마다 함수를 몇 번 불렀는지 세고, n 이 20, 25, 30 일 때 걸린 시간과 부른 횟수를 찍는다.
import time

부른횟수 = {}

# 1단계: 부를 때마다 세는 재귀를 만든다
def 그냥(n):
    부른횟수[n] = 부른횟수.get(n, 0) + 1
    if n < 2: return n
    return 그냥(n-1) + 그냥(n-2)

# 2단계: f(20) 을 구하며 n 마다 부른 횟수를 센다
그냥(20)
print("피보나치 20 을 그냥 재귀로 구할 때, 각 n 을 몇 번 불렀나")
for n in (20, 18, 15, 10, 5, 2, 1):
    print(f"  n={n:<4}{부른횟수[n]:>7}번")
print(f"  전부 합치면 {sum(부른횟수.values()):,}번")

# 3단계: n 을 20, 25, 30 으로 키우며 시간과 횟수를 잰다
print()
print(f"{'n':>5}{'그냥 재귀(ms)':>15}{'부른 횟수':>12}")
for n in (20, 25, 30):
    부른횟수.clear()
    t = time.perf_counter()
    그냥(n)
    ms = (time.perf_counter() - t) * 1000
    print(f"{n:>5}{ms:>15.1f}{sum(부른횟수.values()):>12,}")

# 출력 (시간은 돌릴 때마다 다르다):
# 2단계 뜻: 답이 늘 1 인 f(1) 을 6,765번 불렀다. 같은 계산을 그만큼 되풀이한 것이다.
# 피보나치 20 을 그냥 재귀로 구할 때, 각 n 을 몇 번 불렀나
#   n=20        1번
#   n=18        2번
#   n=15        8번
#   n=10       89번
#   n=5       987번
#   n=2      4181번
#   n=1      6765번
#   전부 합치면 21,891번
# 3단계 뜻: n 이 5 늘 때마다 부른 횟수가 11배쯤 는다. 밀리초는 기계마다 다르지만 부른 횟수는 어디서 돌려도 같다.
#
#     n      그냥 재귀(ms)       부른 횟수
#    20            2.2      21,891
#    25           24.5     242,785
#    30          265.7   2,692,537
````

#### 블록 2

<!-- cb2 post=algorithm-dp-greedy block=1 sha=620465d07a073370 -->
````python
# 하는 일: 피보나치 30 을 그냥 재귀, 적어 두기, 아래에서 쌓기 세 방법으로 구해 답, 걸린 시간, 부른 횟수를 견준다.
import time

# 1단계: 세 방법을 만든다
# 적어 두기는 그냥 재귀에 이미 구한 값을 딕셔너리에서 꺼내는 줄 하나를 더한 것이다. 아래에서 쌓기는 표의 앞 두 칸을 더해 채운다.
def 그냥(n):
    if n < 2: return n
    return 그냥(n-1) + 그냥(n-2)

적어둔것 = {}
불린횟수 = [0]
def 적어두기(n):
    불린횟수[0] += 1
    if n < 2: return n
    if n in 적어둔것: return 적어둔것[n]     # 이미 구한 것은 다시 안 구한다
    적어둔것[n] = 적어두기(n-1) + 적어두기(n-2)
    return 적어둔것[n]

def 아래에서(n):
    표 = [0, 1] + [0] * (n - 1)
    for i in range(2, n + 1):
        표[i] = 표[i-1] + 표[i-2]
    return 표[n]

# 2단계: 세 방법을 재고 답을 견준다
N = 30
print(f"{'방법':<14}{'답':>10}{'시간(ms)':>12}{'부른 횟수':>12}")
t = time.perf_counter(); a = 그냥(N); ms = (time.perf_counter()-t)*1000
print(f"{'그냥 재귀':<14}{a:>10,}{ms:>12.1f}{'2,692,537':>12}")
t = time.perf_counter(); b = 적어두기(N); ms = (time.perf_counter()-t)*1000
print(f"{'적어 두기':<14}{b:>10,}{ms:>12.4f}{불린횟수[0]:>12,}")
t = time.perf_counter(); c = 아래에서(N); ms = (time.perf_counter()-t)*1000
print(f"{'아래에서 쌓기':<13}{c:>10,}{ms:>12.4f}{N-1:>12,}")
print(f"\n세 답이 같나 {a == b == c}")

# 출력 (시간은 돌릴 때마다 다르다):
# 2단계 뜻: 269만 번이 59번이 된다. 적어 두기는 f(0) 부터 f(30) 까지 31개를 한 번씩만 진짜로 계산한다.
# 방법                     답      시간(ms)       부른 횟수
# 그냥 재귀            832,040       126.1   2,692,537
# 적어 두기            832,040      0.0116          59
# 아래에서 쌓기         832,040      0.0045          29
#
# 세 답이 같나 True
````

#### 블록 3

<!-- cb2 post=algorithm-dp-greedy block=2 sha=5fe2c6036bab540f -->
````python
# 하는 일: 물건 4개와 무게 한도 5 로 배낭 표를 채우고, 얻는 최대값과 고른 물건을 표를 거꾸로 따라가 찾는다.
물건 = [("노트북", 3, 9), ("카메라", 2, 6), ("책", 1, 2), ("렌즈", 2, 5)]
한도 = 5

# 1단계: 표를 채운다
# 표[i][w] 는 앞의 i 개 물건만 쓰고 무게 한도가 w 일 때의 최대값이다. i 번째 물건을 안 넣은 값과 넣은 값 가운데 큰 쪽을 적는다.
표 = [[0] * (한도 + 1) for _ in range(len(물건) + 1)]

for i, (이름, 무게, 값) in enumerate(물건, 1):
    for w in range(한도 + 1):
        안넣기 = 표[i-1][w]
        넣기 = 표[i-1][w-무게] + 값 if w >= 무게 else -1
        표[i][w] = max(안넣기, 넣기)

# 2단계: 표를 찍는다
print(f"{'':<8}" + "".join(f"{w:>5}" for w in range(한도 + 1)) + "   ← 남은 무게")
print(f"{'없음':<7}" + "".join(f"{x:>5}" for x in 표[0]))
for i, (이름, 무게, 값) in enumerate(물건, 1):
    print(f"{이름:<7}" + "".join(f"{x:>5}" for x in 표[i]) + f"   (무게 {무게}, 값 {값})")

print(f"\n무게 {한도} 까지 담아 얻는 최대값 {표[len(물건)][한도]}")

# 3단계: 표를 거꾸로 따라가 고른 물건을 찾는다
# 위 줄과 값이 다르면 그 물건을 넣었다는 뜻이다.
고른것, w = [], 한도
for i in range(len(물건), 0, -1):
    if 표[i][w] != 표[i-1][w]:          # 값이 달라졌다 = 이 물건을 넣었다
        이름, 무게, 값 = 물건[i-1]
        고른것.append(이름)
        w -= 무게
print("고른 것", 고른것[::-1])

# 출력:
# 2단계 뜻: 카메라 줄의 무게 5 칸 15 는 노트북과 카메라를 둘 다 넣은 값이다. 렌즈 줄이 책 줄과 같은 것은 렌즈가 어느 무게에서도 도움이 안 됐다는 뜻이다.
#             0    1    2    3    4    5   ← 남은 무게
# 없음         0    0    0    0    0    0
# 노트북        0    0    0    9    9    9   (무게 3, 값 9)
# 카메라        0    0    6    9    9   15   (무게 2, 값 6)
# 책          0    2    6    9   11   15   (무게 1, 값 2)
# 렌즈         0    2    6    9   11   15   (무게 2, 값 5)
#
# 무게 5 까지 담아 얻는 최대값 15
# 3단계 뜻: 15 를 만든 물건은 노트북과 카메라다.
# 고른 것 ['노트북', '카메라']
````

#### 블록 4

<!-- cb2 post=algorithm-dp-greedy block=3 sha=dd281951a6c89b42 -->
````python
# 하는 일: 같은 물건 4개로 무게 한도 6 의 배낭 문제를 한 줄짜리 표로 풀고, 무게를 앞에서 뒤로 돌면 왜 틀리는지 견준다.
물건 = [("노트북", 3, 9), ("카메라", 2, 6), ("책", 1, 2), ("렌즈", 2, 5)]
한도 = 6

# 1단계: 한 줄을 뒤에서 앞으로 덮어쓴다
# 한줄[w] 를 고칠 때 읽는 한줄[w-무게] 는 이번 물건을 넣기 전 값이어야 한다. 뒤에서 앞으로 돌면 아직 안 건드린 자리라 안전하다.
한줄 = [0] * (한도 + 1)
print(f"{'넣은 물건':<8}" + "".join(f"{w:>5}" for w in range(한도 + 1)))
print(f"{'시작':<7}" + "".join(f"{x:>5}" for x in 한줄))
for 이름, 무게, 값 in 물건:
    for w in range(한도, 무게 - 1, -1):        # 뒤에서 앞으로
        한줄[w] = max(한줄[w], 한줄[w-무게] + 값)
    print(f"{이름:<7}" + "".join(f"{x:>5}" for x in 한줄))

# 2단계: 최대값과 들고 있는 칸 수를 찍는다
print(f"\n최대값 {한줄[한도]}, 들고 있는 칸 {len(한줄)}개 (두 줄짜리 표는 {(len(물건)+1)*(한도+1)}칸)")

# 3단계: 앞에서 뒤로 돌려 본다
# 앞에서 뒤로 돌면 같은 물건을 여러 번 넣게 된다
틀린것 = [0] * (한도 + 1)
for 이름, 무게, 값 in 물건:
    for w in range(무게, 한도 + 1):            # 앞에서 뒤로 — 틀린 방향
        틀린것[w] = max(틀린것[w], 틀린것[w-무게] + 값)
print(f"앞에서 뒤로 돌면 {틀린것[한도]} — 같은 물건을 여러 번 담은 값이라 틀리다")

# 출력:
# 1단계 뜻: 물건을 하나 넣을 때마다 한 줄을 덮어쓴다. 마지막 줄의 무게 6 칸 17 이 답이다.
# 넣은 물건       0    1    2    3    4    5    6
# 시작         0    0    0    0    0    0    0
# 노트북        0    0    0    9    9    9    9
# 카메라        0    0    6    9    9   15   15
# 책          0    2    6    9   11   15   17
# 렌즈         0    2    6    9   11   15   17
# 2단계 뜻: 표 전체 35칸 대신 7칸만 들고도 같은 최대값 17 을 낸다.
#
# 최대값 17, 들고 있는 칸 7개 (두 줄짜리 표는 35칸)
# 3단계 뜻: 앞에서 뒤로 돌면 같은 물건을 여러 번 담아 18 이 나온다. 물건마다 하나씩만 담는 이 문제의 답이 아니다.
# 앞에서 뒤로 돌면 18 — 같은 물건을 여러 번 담은 값이라 틀리다
````

#### 블록 5

<!-- cb2 post=algorithm-dp-greedy block=4 sha=cc67dec65c90f51f -->
````python
# 하는 일: 4 × 4 판에 퀸 4개를 서로 공격하지 못하게 놓는 방법을 백트래킹으로 모두 찾고, 놓아 보다 막혀 되돌아가는 과정의 앞 16줄을 찍는다.
N = 4
답 = []
시도횟수 = [0]

# 1단계: 한 줄씩 놓아 보고 막히면 되돌리는 함수를 만든다
# 내려갈 때 놓은자리에 넣고 올라올 때 뺀다. 이 짝이 백트래킹의 전부다.
def 놓기(줄, 놓은자리, 로그):
    시도횟수[0] += 1
    if 줄 == N:
        답.append(list(놓은자리)); 로그.append(f"{놓은자리} 완성")
        return
    for 칸 in range(N):
        안전 = all(칸 != c and abs(칸 - c) != 줄 - r for r, c in enumerate(놓은자리))
        if not 안전:
            로그.append(f"{'  '*줄}{줄}줄 {칸}칸 → 막힘, 되돌린다")
            continue
        로그.append(f"{'  '*줄}{줄}줄 {칸}칸 놓음")
        놓은자리.append(칸)
        놓기(줄 + 1, 놓은자리, 로그)
        놓은자리.pop()                      # 되돌린다
# 2단계: 0줄부터 놓아 보고 과정을 찍는다
로그 = []
놓기(0, [], 로그)
for 줄 in 로그[:16]:
    print(줄)
print("  ...")
print(f"\n답 {답}")
print(f"부른 횟수 {시도횟수[0]}회, 가지치기 없이 전부 놓으면 {N**N}회")

# 출력:
# 2단계 뜻: 들여쓰기가 깊어졌다 얕아졌다 하는 것이 되돌아오는 모양이다. 1줄 2칸에 놓았다가 2줄의 네 칸이 모두 막히자 1줄로 올라와 3칸을 놓는다.
# 0줄 0칸 놓음
#   1줄 0칸 → 막힘, 되돌린다
#   1줄 1칸 → 막힘, 되돌린다
#   1줄 2칸 놓음
#     2줄 0칸 → 막힘, 되돌린다
#     2줄 1칸 → 막힘, 되돌린다
#     2줄 2칸 → 막힘, 되돌린다
#     2줄 3칸 → 막힘, 되돌린다
#   1줄 3칸 놓음
#     2줄 0칸 → 막힘, 되돌린다
#     2줄 1칸 놓음
#       3줄 0칸 → 막힘, 되돌린다
#       3줄 1칸 → 막힘, 되돌린다
#       3줄 2칸 → 막힘, 되돌린다
#       3줄 3칸 → 막힘, 되돌린다
#     2줄 2칸 → 막힘, 되돌린다
#   ...
# 2단계 뜻: 답은 2가지이고 함수는 17회 불렀다. 막힌 갈래를 일찍 버려서 전부 놓는 256회보다 훨씬 적다.
#
# 답 [[1, 3, 0, 2], [2, 0, 3, 1]]
# 부른 횟수 17회, 가지치기 없이 전부 놓으면 256회
````

#### 블록 6

<!-- cb2 post=algorithm-dp-greedy block=5 sha=40ca1360f8bad017 -->
````python
# 하는 일: 회의 신청 6개를 세 가지 기준으로 정렬해 겹치지 않게 차례로 잡아 보고, 어느 기준이 가장 많이 잡는지 견준다.
# (이름, 시작, 끝)
회의 = [("A", 9, 16), ("B", 10, 12), ("C", 11, 13), ("D", 12, 15), ("E", 13, 14), ("F", 15, 17)]

for 기준, 정렬키 in (("시작이 빠른 순", lambda m: m[1]),
                    ("길이가 짧은 순", lambda m: m[2] - m[1]),
                    ("끝이 빠른 순",  lambda m: m[2])):
    잡힌것, 끝난시각 = [], 0
    for 이름, s, e in sorted(회의, key=정렬키):
        if s >= 끝난시각:
            잡힌것.append(이름); 끝난시각 = e
    print(f"{기준:<14}{len(잡힌것)}개  {잡힌것}")

print("\n끝이 빠른 순이 가장 많이 잡는다 — 방을 가장 일찍 비워 주니 뒤에 남는 시간이 가장 많다.")

# 출력:
# 뜻: 셋 다 그리디인데 잡은 수가 1개, 2개, 3개로 다르다.
# 시작이 빠른 순      1개  ['A']
# 길이가 짧은 순      2개  ['E', 'F']
# 끝이 빠른 순       3개  ['B', 'E', 'F']
# 뜻: 끝나는 시각이 빠른 회의부터 잡으면 방이 가장 일찍 비어 뒤에 남는 시간이 가장 많다.
#
# 끝이 빠른 순이 가장 많이 잡는다 — 방을 가장 일찍 비워 주니 뒤에 남는 시간이 가장 많다.
````

#### 블록 7

<!-- cb2 post=algorithm-dp-greedy block=6 sha=09b0c1a32cd4ed2d -->
````python
# 하는 일: 동전 두 벌로 금액을 가장 적은 수의 동전으로 만들며, 큰 것부터 쓰는 그리디와 전부 따지는 DP 의 답을 견준다.
# 1단계: 큰 것부터 쓰는 그리디를 만든다
def 그리디(동전, 금액):
    남은, 쓴것 = 금액, []
    for c in sorted(동전, reverse=True):
        while 남은 >= c:
            남은 -= c; 쓴것.append(c)
    return (쓴것 if 남은 == 0 else None)

# 2단계: 금액마다 가장 적은 동전 수를 구하는 DP 를 만든다
# 표[금] 은 금을 만드는 가장 적은 동전 수다. 고른[금] 에 마지막으로 쓴 동전을 적어 두고, 거꾸로 따라가 쓴 동전을 꺼낸다.
def 최적(동전, 금액):
    무한 = float("inf")
    표 = [0] + [무한] * 금액
    고른 = [None] * (금액 + 1)
    for 금 in range(1, 금액 + 1):
        for c in 동전:
            if c <= 금 and 표[금-c] + 1 < 표[금]:
                표[금] = 표[금-c] + 1
                고른[금] = c
    if 표[금액] == 무한: return None
    쓴것, 남은 = [], 금액
    while 남은:
        쓴것.append(고른[남은]); 남은 -= 고른[남은]
    return 쓴것

# 3단계: 동전 두 벌로 견준다
for 동전, 금액 in (([500, 100, 50, 10], 1260), ([4, 3, 1], 6)):
    g, o = 그리디(동전, 금액), 최적(동전, 금액)
    같나 = "같다" if (g and o and len(g) == len(o)) else "다르다"
    print(f"동전 {동전}, 금액 {금액}")
    print(f"  큰 것부터 (그리디)  {len(g)}개  {g}")
    print(f"  전부 따져 (DP)     {len(o)}개  {o}")
    print(f"  → {같나}\n")

# 출력:
# 3단계 뜻: 우리가 쓰는 동전에서는 그리디와 DP 가 같은 6개를 낸다.
# 동전 [500, 100, 50, 10], 금액 1260
#   큰 것부터 (그리디)  6개  [500, 500, 100, 100, 50, 10]
#   전부 따져 (DP)     6개  [500, 500, 100, 100, 50, 10]
#   → 같다
#
# 3단계 뜻: 동전이 4, 3, 1 이면 그리디는 4 를 먼저 써서 3개가 되지만, DP 는 3 두 개로 끝낸다.
# 동전 [4, 3, 1], 금액 6
#   큰 것부터 (그리디)  3개  [4, 1, 1]
#   전부 따져 (DP)     2개  [3, 3]
#   → 다르다
````

---

### Task 1: 파서 다지기 — `js/code-steps.js`

**Files:**
- Modify: `js/code-steps.js` (하는 일 오타, 단계 오타, 빈 줄만 있는 뜻 묶음, 「글의 코드에 이어서」의 글 id 꼴)
- Test: `scripts/test-code-steps.js` (시험 10개를 더한다)

**Interfaces:**
- Consumes: 첫 묶음의 `CodeSteps.parse(src)` → `{ format, ok, errors: [{ line, msg }], labels, head, rows, stepLines, codeEnd, out, src }`
- Produces:
  - 하는 일 줄 오타(`#하는 일:`, `# 하는일:`, 들여쓴 하는 일)가 있으면 `{ format: 'steps', ok: false, errors, src }` 를 돌려준다. 오류 글은 ``하는 일 줄은 들여쓰기 없이 `# 하는 일: …` 꼴로 씁니다`` 다(`labels` 등은 없다. 쓰는 곳은 모두 `|| []` 로 받는다).
  - 단계 줄 바로 아래 풀이 자리의 단계 오타에 오류 ``단계 표시는 들여쓰기 없이 `# N단계: 제목` 꼴로 씁니다``.
  - 빈 찍힌 줄만 있는 뜻 묶음에 오류 `뜻 줄 아래에 빈 줄만 있습니다. 빈 줄은 앞이나 뒤 묶음에 붙입니다`.
  - 상태 표시 `# (<글 id> 글의 코드에 이어서 돌린다.)` 의 글 id 자리가 `[A-Za-z0-9_-]+` 를 받는다. 레이블은 지금 꼴 그대로 `{ kind: 'cont-post', post: <쓴 글자>, text: '앞 글에 이어서' }` 다. 글 id 가 `js/posts.js` 에 있는지는 Task 3 이 본다.

- [ ] **Step 1: 시험 10개를 먼저 더한다**

**Edit 1.1 — `scripts/test-code-steps.js`**

찾을 글:

````js
eq('「# 출력을 …」 같은 주석은 출력 표시가 아니다', C.parse(block('# 하는 일: x.', '# 출력을 정리한다', 'print(1)')).out, null);
````

바꿀 글:

````js
eq('「# 출력을 …」 같은 주석은 출력 표시가 아니다', C.parse(block('# 하는 일: x.', '# 출력을 정리한다', 'print(1)')).out, null);
eq('뜻 줄 아래 빈 줄만', msgs(block('# 하는 일: x.', 'print()', '# 출력:', '# 뜻: 빈 줄이다.', '#')),
  ['4:뜻 줄 아래에 빈 줄만 있습니다. 빈 줄은 앞이나 뒤 묶음에 붙입니다']);
eq('단계 줄 바로 아래의 단계 오타', msgs(block('# 하는 일: x.', '# 1단계: 하나', '#2단계: 둘', 'a = 1')),
  ['3:단계 표시는 들여쓰기 없이 `# N단계: 제목` 꼴로 씁니다']);
eq('쌍점 앞에 띄어 쓴 단계 오타', msgs(block('# 하는 일: x.', '# 1단계: 하나', '# 2단계 : 둘', 'a = 1')),
  ['3:단계 표시는 들여쓰기 없이 `# N단계: 제목` 꼴로 씁니다']);
eq('풀이 속 「2단계에서」 는 오타가 아니다', msgs(block('# 하는 일: x.', '# 1단계: 하나', '# 2단계에서 쓸 값이다.', 'a = 1')), []);
eq('띄어쓰기가 틀린 하는 일은 옛 형식으로 넘기지 않는다', [C.parse(block('#하는 일: x.', 'print(1)')).format, msgs(block('#하는 일: x.', 'print(1)'))],
  ['steps', ['1:하는 일 줄은 들여쓰기 없이 `# 하는 일: …` 꼴로 씁니다']]);
eq('「하는일」 도 잡는다', msgs(block('# 하는일: x.', 'print(1)')), ['1:하는 일 줄은 들여쓰기 없이 `# 하는 일: …` 꼴로 씁니다']);
eq('들여쓴 하는 일도 잡는다', msgs(block('if True:', '    # 하는 일: x.', '    print(1)')), ['2:하는 일 줄은 들여쓰기 없이 `# 하는 일: …` 꼴로 씁니다']);
const paren = C.parse(block('# 하는 일: x.', '# (이름, 시작, 끝)', 'print(1)'));
eq('몸통의 괄호 주석은 상태 표시가 아니라 메모', [paren.ok, paren.labels, paren.rows[0].items[0].kind], [true, [], 'note']);
const printedStep = C.parse(block('# 하는 일: x.', '# 1단계: 찍는다', 'print("  1단계 반")', '# 출력:', '# 1단계 뜻: 앞에 공백이 있는 찍힌 줄이다.', '#   1단계 반'));
eq('「1단계」 로 시작하는 찍힌 줄은 찍힌 줄', [printedStep.ok, printedStep.out.groups[0].lines], [true, ['  1단계 반']]);
eq('대문자가 든 글 id', C.parse(block('# (TS-linTS 글의 코드에 이어서 돌린다.)', '# 하는 일: 앞 글에 이어서 돈다.', 'run()')).labels,
  [{ kind: 'cont-post', post: 'TS-linTS', text: '앞 글에 이어서' }]);
````

- [ ] **Step 2: 시험이 실패하는지 본다**

Run: `node scripts/test-code-steps.js`
Expected: 마지막 줄 `79 통과, 7 실패`. 실패는 `뜻 줄 아래 빈 줄만`, `단계 줄 바로 아래의 단계 오타`, `쌍점 앞에 띄어 쓴 단계 오타`, `띄어쓰기가 틀린 하는 일은 옛 형식으로 넘기지 않는다`, `「하는일」 도 잡는다`, `들여쓴 하는 일도 잡는다`, `대문자가 든 글 id` 일곱이다. 나머지 셋은 지금도 맞는 동작을 붙잡아 둔다.

- [ ] **Step 3: 파서를 고친다**

**Edit 1.2 — `js/code-steps.js`**

찾을 글:

````js
  const HEAD = /^# 하는 일:(.*)$/;
````

바꿀 글:

````js
  const HEAD = /^# 하는 일:(.*)$/;
  // 띄어쓰기나 들여쓰기가 틀린 하는 일 줄. 옛 형식으로 넘어가 아무 말 없이 지나가지 않게 잡는다.
  const HEAD_LOOSE = /^\s*#\s*하는\s*일\s*:/;
````

**Edit 1.3 — `js/code-steps.js`**

찾을 글:

````js
    { re: /^# \(([a-z0-9-]+) 글의 코드에 이어서 돌린다\.\)\s*$/, make: m => ({ kind: 'cont-post', post: m[1], text: '앞 글에 이어서' }) },
````

바꿀 글:

````js
    // <글 id> 는 js/posts.js 의 id 다. TS-linTS 처럼 대문자가 든 id 도 있다. 글 id 가 맞는지는 형식 검사가 본다.
    { re: /^# \(([A-Za-z0-9_-]+) 글의 코드에 이어서 돌린다\.\)\s*$/, make: m => ({ kind: 'cont-post', post: m[1], text: '앞 글에 이어서' }) },
````

**Edit 1.4 — `js/code-steps.js`**

찾을 글:

````js
      if (stray < 0) return { format: 'legacy', ok: true, errors: [], src: text };
````

바꿀 글:

````js
      if (stray < 0) {
        const loose = lines.findIndex((l, j) => isComment(j) && HEAD_LOOSE.test(l));
        if (loose < 0) return { format: 'legacy', ok: true, errors: [], src: text };
        err(loose, '하는 일 줄은 들여쓰기 없이 `# 하는 일: …` 꼴로 씁니다');
        return { format: 'steps', ok: false, errors, src: text };
      }
````

**Edit 1.5 — `js/code-steps.js`**

찾을 글:

````js
        for (; k < bodyEnd && isCol0(k) && !STEP.test(lines[k]) && !HEAD.test(lines[k]); k++) {
          const t = lines[k].replace(/^#\s?/, '').trim();
````

바꿀 글:

````js
        for (; k < bodyEnd && isCol0(k) && !STEP.test(lines[k]) && !HEAD.test(lines[k]); k++) {
          // 단계 줄 바로 아래의 「#2단계: 둘」, 「# 2단계 : 둘」 같은 오타는 풀이로 넘어가 아무 말 없이 지나가니 여기서 잡는다
          if (STEP_LOOSE.test(lines[k])) err(k, '단계 표시는 들여쓰기 없이 `# N단계: 제목` 꼴로 씁니다');
          const t = lines[k].replace(/^#\s?/, '').trim();
````

**Edit 1.6 — `js/code-steps.js`**

찾을 글:

````js
        if (!gg.lines.length) err(gg.from, '뜻 줄 아래에 찍힌 줄이 없습니다');
````

바꿀 글:

````js
        if (!gg.lines.length) err(gg.from, '뜻 줄 아래에 찍힌 줄이 없습니다');
        else if (!gg.lines.some(t => t.trim())) err(gg.from, '뜻 줄 아래에 빈 줄만 있습니다. 빈 줄은 앞이나 뒤 묶음에 붙입니다');
````

- [ ] **Step 4: 시험과 형식 검사를 돌린다**

Run: `node scripts/test-code-steps.js`
Expected: 마지막 줄 `86 통과, 0 실패`

Run: `node scripts/check-code-blocks.js`
Expected: `✓ 새 형식 블록 11개, 옛 형식 블록 236개, 문제 0건` — 지금 글의 파이썬 블록 247개에는 하는 일 오타도 단계 오타도 없다.

- [ ] **Step 5: 커밋**

````bash
git add js/code-steps.js scripts/test-code-steps.js
git commit -F - <<'EOF'
fix(js): 파이썬 블록 파서가 하는 일과 단계 줄의 오타, 빈 줄만 있는 뜻 묶음을 잡는다 — 이어서 돌릴 글 id 에 대문자와 밑줄을 받는다

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

---

### Task 2: 그리기, 복사, 숫자 줄바꿈 — `js/code-steps.js`, `js/main.js`, `css/style.css`

**Files:**
- Modify: `js/code-steps.js` (`wrapLines` 의 빈 줄, 복사 처리의 비켜서기 `inTextField`, 실패한 블록의 경고 한 번)
- Modify: `js/main.js` (Copy 단추의 숨은 textarea 에 포커스, 한 줄)
- Modify: `css/style.css` (숫자 토큰 줄바꿈, 주석 둘)
- Test: `scripts/test-code-steps.js` (시험 3개를 더한다)
- 임시: `$SCRATCH/nocache_server.py` (Task 6, 8 도 쓴다)

**Interfaces:**
- Consumes: Task 1 의 `js/code-steps.js`
- Produces:
  - `CodeSteps.inTextField(el) → boolean` — `el` 이 TEXTAREA 나 INPUT 이면 `true`. 복사 처리(`onCopy`)는 `document.activeElement` 가 그러면 끼어들지 않는다.
  - `wrapLines(html, raw)` — 글자가 없는 줄의 `.cb-src` 는 공백 하나다(닫고 다시 연 빈 span 을 남기지 않는다).
  - `mount(root)` — 배치에 실패한 블록은 처음 한 번만 `console.warn` 한다.

- [ ] **Step 1: 시험 3개를 먼저 더한다**

**Edit 2.1 — `scripts/test-code-steps.js`**

찾을 글:

````js
eq('선 글자 그림', [C.hasDrawing('┌─┐'), C.hasDrawing('a -> b')], [true, false]);
````

바꿀 글:

````js
eq('선 글자 그림', [C.hasDrawing('┌─┐'), C.hasDrawing('a -> b')], [true, false]);
eq('여러 줄 span 안의 빈 줄은 공백 하나', C.wrapLines('<span class="c">a\n\nb</span>', 'a\n\nb'),
  '<span class="cb-ln" data-ln="0" style="--ind:0"><span class="cb-src"><span class="c">a</span></span></span>' +
  '<span class="cb-ln" data-ln="1" style="--ind:0"><span class="cb-src"> </span></span>' +
  '<span class="cb-ln" data-ln="2" style="--ind:0"><span class="cb-src"><span class="c">b</span></span></span>');
````

**Edit 2.2 — `scripts/test-code-steps.js`**

찾을 글:

````js
console.log(`\n${pass} 통과, ${fail} 실패`);
````

바꿀 글:

````js
console.log('\n복사와 배치 — 브라우저 밖에서 볼 수 있는 것');
eq('textarea 와 input 에 포커스가 있으면 복사 처리가 비켜선다',
  [C.inTextField({ tagName: 'TEXTAREA' }), C.inTextField({ tagName: 'INPUT' }), C.inTextField({ tagName: 'DIV' }), C.inTextField(null)],
  [true, true, false, false]);
{
  // 배치가 실패하는 블록 하나를 두고 두 번 배치한다. 화면에서는 글꼴과 창 크기가 바뀔 때마다 다시 배치한다.
  const warns = [];
  const realWarn = console.warn;
  console.warn = msg => warns.push(msg);
  global.document = { addEventListener() {} };
  const bad = { querySelector() { throw new Error('일부러'); }, addEventListener() {} };
  const root = { querySelectorAll: sel => (sel === '.cb' ? [bad] : []) };
  C.mount(root);
  C.mount(root);
  console.warn = realWarn;
  delete global.document;
  eq('실패한 블록은 다시 배치해도 한 번만 알린다', warns, ['코드 블록 하나를 배치하지 못했습니다']);
}

console.log(`\n${pass} 통과, ${fail} 실패`);
````

- [ ] **Step 2: 시험이 실패하는지 본다**

Run: `node scripts/test-code-steps.js`
Expected: `✗ 여러 줄 span 안의 빈 줄은 공백 하나` 가 찍힌 뒤 `TypeError: C.inTextField is not a function` 으로 멈춘다(종료 코드 1).

- [ ] **Step 3: `js/code-steps.js` 를 고친다**

**Edit 2.3 — `js/code-steps.js`**

찾을 글:

````js
      return `<span class="cb-ln" data-ln="${i}" style="--ind:${ind}"><span class="cb-src">${stripIndent(h, ind) || ' '}</span></span>`;
````

바꿀 글:

````js
      // 여러 줄에 걸친 span 안의 빈 줄은 닫고 다시 연 빈 span 만 남는다. 글자가 없으면 공백 하나를 둬야 줄 높이가 산다.
      const body = stripIndent(h, ind);
      return `<span class="cb-ln" data-ln="${i}" style="--ind:${ind}"><span class="cb-src">${body.replace(/<[^>]*>/g, '') ? body : ' '}</span></span>`;
````

**Edit 2.4 — `js/code-steps.js`**

찾을 글:

````js
  // 고른 자리가 블록 하나(.cb 또는 pre.cb-wrap) 안에 있을 때만 끼어든다. 원문은 Copy 버튼이 복사하는 data-src 다.
  function onCopy(e) {
    const sel = document.getSelection();
````

바꿀 글:

````js
  // 글자를 넣는 칸(textarea, input)에 포커스가 있으면 그 칸이 복사하는 것이다. Copy 버튼은 클립보드가 막히면
  // 숨은 textarea 를 골라 복사하는데, 그때 문서에 남아 있던 블록 선택을 가로채지 않게 비켜선다.
  const inTextField = el => !!el && /^(TEXTAREA|INPUT)$/.test(el.tagName);

  // 고른 자리가 블록 하나(.cb 또는 pre.cb-wrap) 안에 있을 때만 끼어든다. 원문은 Copy 버튼이 복사하는 data-src 다.
  function onCopy(e) {
    if (inTextField(document.activeElement)) return;
    const sel = document.getSelection();
````

**Edit 2.5 — `js/code-steps.js`**

찾을 글:

````js
  let copyOn = false;
  function mount(root) {
````

바꿀 글:

````js
  let copyOn = false;
  // 배치는 창 크기와 글꼴이 바뀔 때마다 다시 돈다. 실패한 블록은 처음 한 번만 알린다.
  const warned = new WeakSet();
  function mount(root) {
````

**Edit 2.6 — `js/code-steps.js`**

찾을 글:

````js
      try { fn(el); } catch (err) { console.warn('코드 블록 하나를 배치하지 못했습니다', err); }
````

바꿀 글:

````js
      try { fn(el); } catch (err) {
        if (!warned.has(el)) { warned.add(el); console.warn('코드 블록 하나를 배치하지 못했습니다', err); }
      }
````

**Edit 2.7 — `js/code-steps.js`**

찾을 글:

````js
  return { scan, parse, render, splitLines, wrapLines, hasDrawing, widthCounts, noteColumn, fitsNote, outputLayout, copySource, mount };
````

바꿀 글:

````js
  return { scan, parse, render, splitLines, wrapLines, hasDrawing, widthCounts, noteColumn, fitsNote, outputLayout, copySource, inTextField, mount };
````

- [ ] **Step 4: `js/main.js` 를 고친다 — NUL 바이트가 있는 파일이라 Edit 로 이 줄만 바꾼다**

**Edit 2.8 — `js/main.js`**

찾을 글:

````js
    document.body.appendChild(ta);
    ta.select();
````

바꿀 글:

````js
    document.body.appendChild(ta);
    ta.focus();                  // 포커스가 있어야 js/code-steps.js 의 복사 처리가 이 칸을 알아보고 비켜선다
    ta.select();
````

Run: `python3 -c "print(open('js/main.js','rb').read().count(b'\x00'))"`
Expected: `4`

- [ ] **Step 5: `css/style.css` 를 고친다**

**Edit 2.9 — `css/style.css`**

찾을 글:

````css
pre.cb-wrap code.hljs { overflow: visible; }
````

바꿀 글:

````css
/* 접힌 줄 막대는 줄 왼쪽 10px 바깥에 그린다. hljs 의 code 는 가로 스크롤 상자라 그 막대를 잘라 버려서 넘침을 보이게 둔다.
   줄을 접으니 가로 스크롤은 쓰지 않는다. */
pre.cb-wrap code.hljs { overflow: visible; }
````

**Edit 2.10 — `css/style.css`**

찾을 글:

````css
/* 줄 아래 메모와 줄 사이 메모는 들여쓰기 자리에서 시작하고, 위의 코드 줄과 같은 자리에서 멈춘다(들여쓰기를 줄인 줄과 떨어지지 않게) */
````

바꿀 글:

````css
/* 줄 아래 메모와 줄 사이 메모는 그 줄의 들여쓰기 자리에서 시작하고, 들여쓰기를 줄인 코드 줄처럼 글자 24자 자리를 남기는 곳에서 멈춘다.
   메모의 ch 는 본문 글꼴의 폭이라 코드 줄과 몇 px 어긋난다(390 화면의 깊은 들여쓰기에서 14px 쯤). */
````

**Edit 2.11 — `css/style.css`**

찾을 글:

````css
.cb-n { color: var(--series-5); }
````

바꿀 글:

````css
/* 숫자 한 덩어리(3e-3, 1_000)는 줄 끝에서 끊지 않는다. 휴대폰에서 lr=3e-3 이 3e- 에서 끊겼다 */
.cb-n { color: var(--series-5); white-space: nowrap; }
````

- [ ] **Step 6: 시험과 검사를 돌린다**

Run: `node scripts/test-code-steps.js`
Expected: 마지막 줄 `89 통과, 0 실패`

Run: `node scripts/check-design.js && node scripts/check-wording.js`
Expected: `✓ 78개 파일 디자인 게이트 통과` 와 `✓ 261개 파일 말투와 낱말 검사 통과 …`(종료 코드 0)

- [ ] **Step 7: 브라우저에서 숫자 줄바꿈과 빈 줄을 본다**

`$SCRATCH/nocache_server.py` 는 아래 내용이다(첫 묶음과 같다). 손으로 옮겨 적지 말고 그 아래 명령으로 계획에서 뽑아 쓴다.

<!-- file $SCRATCH/nocache_server.py -->
````python
import http.server
import socketserver
import sys

ROOT = sys.argv[1]
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8766


class H(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        '.html': 'text/html; charset=utf-8',
        '.js': 'text/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.md': 'text/markdown; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
    }

    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def log_message(self, *a):
        pass


socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("127.0.0.1", PORT), H) as s:
    s.serve_forever()
````

Run (저장소 루트에서):

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch2"; mkdir -p "$SCRATCH"
python3 - nocache_server.py <<'EOF'
import os, re, sys
name = sys.argv[1]
T = '`' * 4
plan = open('docs/superpowers/plans/2026-10-14-python-code-blocks-batch2.md', encoding='utf-8').read()
m = re.search(r'^<!-- file \$SCRATCH/' + re.escape(name) + r' -->\n' + T + r'[a-z]*\n(.*?)^' + T + r'\n', plan, re.S | re.M)
dest = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'code-steps-batch2', name)
if not os.path.exists(dest):
    open(dest, 'w', encoding='utf-8').write(m.group(1))
print(dest)
EOF
````

Expected: 만든(또는 이미 있던) 파일 경로 한 줄.

Run (백그라운드, 저장소 루트에서): `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch2"; python3 "$SCRATCH/nocache_server.py" "$(pwd)" 8771`

브라우저 도구로 `http://127.0.0.1:8771/post.html?id=two-tower-training` 을 연다(Chrome DevTools MCP 는 `new_page`, 새 캐시가 되게 `isolatedContext` 를 준다). 아래 함수를 돌린다. 숨긴 390 폭 iframe 에 두 글을 차례로 열어 잰다.

````js
async () => {
  const f = document.createElement('iframe');
  f.style.cssText = 'position:absolute;left:-10000px;top:0;width:390px;height:900px;border:0';
  document.body.appendChild(f);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const open = async id => {
    await new Promise(r => { f.onload = r; f.src = `post.html?id=${id}&t=${Date.now()}`; });
    const d = f.contentDocument;
    for (let i = 0; i < 40 && !d.querySelector('.cb-row, pre.cb-wrap'); i++) await wait(250);
    await d.fonts.ready;
    await wait(700);
    return d;
  };
  let d = await open('two-tower-training');
  const lr = [...d.querySelectorAll('.cb .cb-n')].filter(s => s.textContent === '3e-3')
    .map(s => ({ rects: s.getClientRects().length, ws: getComputedStyle(s).whiteSpace }));
  const overflow = d.documentElement.scrollWidth > d.documentElement.clientWidth;
  d = await open('interview-system-design');
  const zeroHeightLines = [...d.querySelectorAll('pre.cb-wrap .cb-ln')]
    .filter(l => l.getBoundingClientRect().height === 0).map(l => l.dataset.ln);
  f.remove();
  return { lr, overflow, zeroHeightLines };
}
````

Expected: `{"lr":[{"rects":1,"ws":"nowrap"}],"overflow":false,"zeroHeightLines":[]}`. 고치기 전에는 `rects` 가 2(`3e-` 에서 끊김), `ws` 가 `pre-wrap`, `zeroHeightLines` 가 `["16"]` 이었다(interview-system-design 넷째 블록의 빈 줄). 서버를 끈다.

- [ ] **Step 8: 커밋**

````bash
git add js/code-steps.js js/main.js css/style.css scripts/test-code-steps.js
git commit -F - <<'EOF'
fix(js): 여러 줄 span 안의 빈 줄이 사라지지 않게, Copy 단추의 숨은 칸 복사를 가로채지 않게, 실패한 블록은 한 번만 알린다 — 숫자 한 덩어리는 줄 끝에서 끊지 않는다

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

---

### Task 3: 형식 검사 다지기 — `scripts/check-code-blocks.js`

**Files:**
- Modify: `scripts/check-code-blocks.js` (파일 전체를 바꾼다)
- Create: `scripts/test-check-code-blocks.js` (시험 16개)
- Modify: `.github/workflows/validate.yml` (단계 하나)

**Interfaces:**
- Consumes: Task 1 의 `parse` (하는 일 오타 오류, 넓힌 글 id 꼴)
- Produces:
  - `node scripts/check-code-blocks.js --json` 의 블록마다 `labels` 가운데 `kind: 'cont-post'` 인 것에 `file`(그 글 id 의 파일 이름, `.md` 뺌)이 붙는다. Task 4 의 실행 검사가 이것으로 앞 글의 블록을 찾는다. 다른 필드는 그대로다(`post` 는 파일 이름, `index` 는 그 글의 파이썬 블록 순서).
  - 꼬리표가 정확히 `python` 이 아니면서 파이썬처럼 보이는 블록(`python3`, `python 제목`, `py`, `py3`, `Python…`)은 ``✗ posts/<파일>:<여는 울타리 줄>  파이썬 블록의 꼬리표는 `python` 하나로 씁니다 (지금 `<꼬리표>`)`` 로 실패한다. 이 블록은 `--json` 에 넣지 않는다.
  - 글 id 와 파일 이름은 `<root>/js/posts.js` 의 `posts[].id` 와 `contentUrl` 로 잇는다. `js/posts.js` 가 없는 폴더(시험용)에서는 파일 이름을 글 id 로 본다.
  - 기준표보다 줄어든 글이 있으면 실패하지 않고 `  기준표보다 줄어든 글 N편 (파일 옛수→지금수, …) — node scripts/check-code-blocks.js --update 로 기준표를 줄입니다` 를 찍는다.
  - `<root>/posts` 가 없으면 `✗ posts/ 폴더가 없습니다: …` 를 찍고 종료 코드 2.

- [ ] **Step 1: 시험 파일을 먼저 만든다**

`scripts/test-check-code-blocks.js` 를 아래 내용으로 만든다.

<!-- file scripts/test-check-code-blocks.js -->
````js
#!/usr/bin/env node
// 형식 검사(scripts/check-code-blocks.js) 시험. 임시 폴더에 작은 글을 만들어 --root 로 돌려 본다.
//
//   node scripts/test-check-code-blocks.js
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const CHECK = path.join(__dirname, 'check-code-blocks.js');
const F = '`'.repeat(3);
let pass = 0, fail = 0;
function eq(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`   ${ok ? '✓' : '✗'} ${name}${ok ? '' : `\n       기대 ${JSON.stringify(want)}\n       실제 ${JSON.stringify(got)}`}`);
}

// posts 는 { 파일 이름: [[꼬리표, 줄, 줄, ...], ...] }. ids 가 있으면 [[글 id, 파일 이름], ...] 로 js/posts.js 를 둔다.
const roots = [];
function site(posts, baseline, ids) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cb-test-'));
  roots.push(root);
  fs.mkdirSync(path.join(root, 'posts'));
  fs.mkdirSync(path.join(root, 'scripts'));
  for (const [name, blocks] of Object.entries(posts)) {
    const body = blocks.map(([tag, ...lines]) => `${F}${tag}\n${lines.join('\n')}\n${F}`).join('\n\n');
    fs.writeFileSync(path.join(root, 'posts', `${name}.md`), `# 시험\n\n${body}\n`);
  }
  if (baseline) fs.writeFileSync(path.join(root, 'scripts', 'code-blocks-baseline.json'), JSON.stringify(baseline));
  if (ids) {
    fs.mkdirSync(path.join(root, 'js'));
    const list = ids.map(([id, file]) => `{ id: '${id}', contentUrl: 'posts/${file}.md' }`).join(', ');
    fs.writeFileSync(path.join(root, 'js', 'posts.js'), `const posts = [${list}];\nmodule.exports = { posts };\n`);
  }
  return root;
}
function run(root, ...more) {
  const r = spawnSync(process.execPath, [CHECK, '--root', root, ...more], { encoding: 'utf8' });
  return { code: r.status, out: r.stdout + r.stderr };
}

const NEW = ['python', '# 하는 일: 한 줄을 찍는다.', 'print(1)', '', '# 출력:', '# 뜻: 하나다.', '# 1'];
const OLD = ['python', 'print(1)'];

console.log('기준표');
let r = run(site({ a: [NEW] }, {}));
eq('새 형식 블록은 통과', [r.code, r.out.trim().split('\n').pop()], [0, '✓ 새 형식 블록 1개, 옛 형식 블록 0개, 문제 0건']);
r = run(site({ a: [OLD] }, {}));
eq('기준표에 없는 글의 옛 형식 블록은 실패', [r.code, r.out.includes('posts/a.md  옛 형식 파이썬 블록 1개 (기준표 0개)')], [1, true]);
r = run(site({ a: [OLD, OLD] }, { 'a.md': 1 }));
eq('기준표보다 늘면 실패', [r.code, r.out.includes('옛 형식 파이썬 블록 2개 (기준표 1개)')], [1, true]);
r = run(site({ a: [OLD] }, { 'a.md': 2 }));
eq('기준표보다 줄면 통과하고 알려 준다', [r.code, r.out.includes('기준표보다 줄어든 글 1편 (a.md 2→1)')], [0, true]);
const up = site({ a: [OLD], b: [NEW] }, { 'a.md': 3 });
r = run(up, '--update');
eq('--update 는 지금 수를 기준표로 적는다',
  [r.code, JSON.parse(fs.readFileSync(path.join(up, 'scripts', 'code-blocks-baseline.json'), 'utf8'))], [0, { 'a.md': 1 }]);

console.log('\n형식 오류는 파일의 줄 번호로 알린다');
// 글 맨 위가 「# 시험」, 빈 줄, 여는 울타리라서 블록 첫 줄이 파일 4번째 줄이다
r = run(site({ a: [['python', '# 하는 일: x.', '# 1단계: 하나', 'a = 1', '# 3단계: 셋', 'b = 2']] }, {}));
eq('건너뛴 단계 번호', [r.code, r.out.includes('posts/a.md:7  단계 번호는 2 이어야 합니다')], [1, true]);
r = run(site({ a: [['python', '#하는 일: x.', 'print(1)']] }, {}));
eq('하는 일 오타는 옛 형식으로 넘어가지 않는다', [r.code, r.out.includes('posts/a.md:4  하는 일 줄은 들여쓰기 없이')], [1, true]);

console.log('\n꼬리표');
r = run(site({ a: [['python3', ...NEW.slice(1)]] }, {}));
eq('python3 은 실패', [r.code, r.out.includes('posts/a.md:3  파이썬 블록의 꼬리표는 `python` 하나로 씁니다 (지금 `python3`)')], [1, true]);
r = run(site({ a: [['py', 'print(1)']] }, {}));
eq('py 도 실패', [r.code, r.out.includes('(지금 `py`)')], [1, true]);
r = run(site({ a: [['python title', 'print(1)']] }, {}));
eq('python 뒤에 글을 붙여도 실패', [r.code, r.out.includes('(지금 `python title`)')], [1, true]);
r = run(site({ a: [['text', 'print(1)'], ['pyramid', 'x = 1']] }, {}));
eq('파이썬이 아닌 꼬리표는 보지 않는다', r.code, 0);

console.log('\n이어서 돌릴 글은 글 id 로 쓴다');
const cont = id => ['python', `# (${id} 글의 코드에 이어서 돌린다.)`, '# 하는 일: 앞 글에 이어서 돈다.', 'print(y)', '', '# 출력:', '# 뜻: 앞 글의 y 다.', '# 6'];
const idSite = id => site({ B_File: [['python', 'y = 6']], c: [cont(id)] }, { 'B_File.md': 1 }, [['b-id', 'B_File'], ['c', 'c']]);
r = run(idSite('b-id'));
eq('글 id 로 쓰면 통과', r.code, 0);
r = run(idSite('b-id'), '--json');
eq('--json 은 이어서 돌릴 글의 파일 이름을 같이 낸다', JSON.parse(r.out).find(b => b.post === 'c').labels,
  [{ kind: 'cont-post', post: 'b-id', text: '앞 글에 이어서', file: 'B_File' }]);
r = run(idSite('B_File'));
eq('파일 이름으로 쓰면 글 id 를 알려 준다', [r.code, r.out.includes('posts/B_File.md 의 글 id 는 b-id 입니다')], [1, true]);
r = run(idSite('nope'));
eq('없는 글', [r.code, r.out.includes('이어서 돌릴 글 nope 가 js/posts.js 에 없습니다')], [1, true]);

console.log('\n폴더');
r = run(path.join(os.tmpdir(), 'cb-test-no-such-folder'));
eq('posts/ 가 없으면 멈춘다', [r.code, r.out.includes('posts/ 폴더가 없습니다')], [2, true]);

for (const d of roots) fs.rmSync(d, { recursive: true, force: true });
console.log(`\n${pass} 통과, ${fail} 실패`);
process.exit(fail ? 1 : 0);
````

- [ ] **Step 2: 시험이 실패하는지 본다**

Run: `node scripts/test-check-code-blocks.js`
Expected: 마지막 줄 `7 통과, 9 실패`. 실패는 `기준표보다 줄면 통과하고 알려 준다`, 꼬리표 셋(`python3`, `py`, `python 뒤에 글`), 글 id 넷, `posts/ 가 없으면 멈춘다` 다.

- [ ] **Step 3: 형식 검사를 바꾼다**

`scripts/check-code-blocks.js` 파일 전체를 아래 내용으로 바꾼다.

<!-- file scripts/check-code-blocks.js -->
````js
#!/usr/bin/env node
// 파이썬 코드 블록 형식 검사. 설계: docs/superpowers/specs/2026-10-13-python-code-blocks-design.md
//   node scripts/check-code-blocks.js            → 새 형식 블록의 표시 오류와, 기준표보다 늘어난 옛 형식 블록을 알린다 (CI)
//   node scripts/check-code-blocks.js --update   → 지금 옛 형식 블록 수를 기준표로 다시 적는다
//   node scripts/check-code-blocks.js --json     → 블록마다 읽은 결과를 JSON 으로 낸다 (scripts/check-python-outputs.py 가 쓴다)
//   --root <폴더>                                → posts/ 와 기준표, js/posts.js 를 그 폴더에서 찾는다 (시험용)
//
// 블록 읽기는 js/code-steps.js 한 곳에 있다. 화면도 같은 파일로 읽는다.
// 옛 형식(하는 일 줄이 없는 블록)은 옮기는 동안 글마다 수를 scripts/code-blocks-baseline.json 에 적어 둔다.
// 기준표보다 늘거나 기준표에 없는 글에 있으면 실패한다. 새 글은 처음부터 새 형식이어야 한다.
// 시험: scripts/test-check-code-blocks.js
const fs = require('fs');
const path = require('path');
const CodeSteps = require('../js/code-steps.js');

const args = process.argv.slice(2);
const rootAt = args.indexOf('--root');
const root = rootAt >= 0 ? path.resolve(args[rootAt + 1]) : path.join(__dirname, '..');
const BASELINE = path.join(root, 'scripts', 'code-blocks-baseline.json');
// 울타리 하나. 꼬리표(info)와 안의 글을 같이 읽는다.
const FENCE = /^```([^\n`]*)\n([\s\S]*?)^```[ \t]*$/gm;
// 파이썬처럼 보이는 꼬리표. 화면은 꼬리표가 정확히 python 일 때만 새 형식으로 그리고, 검사 둘도 그 블록만 본다.
const PYLIKE = /^(?:py|py3|python\S*)(?:\s|$)/i;

if (!fs.existsSync(path.join(root, 'posts'))) {
  console.error(`✗ posts/ 폴더가 없습니다: ${path.join(root, 'posts')}`);
  process.exit(2);
}

function blocksOf(file) {
  const text = fs.readFileSync(path.join(root, 'posts', file), 'utf8');
  const out = [];
  FENCE.lastIndex = 0;
  let m;
  // fence 는 여는 울타리의 줄 번호다. 블록 안 k 번째 줄은 파일의 fence + k 번째 줄이다.
  while ((m = FENCE.exec(text))) {
    const tag = m[1].trim();
    const fence = text.slice(0, m.index).split('\n').length;
    if (tag === 'python') out.push({ fence, src: m[2] });
    else if (PYLIKE.test(tag)) out.push({ fence, src: m[2], badTag: tag });
  }
  return out;
}

// 글 id 와 파일 이름은 js/posts.js 가 잇는다. 대개 같지만 다른 글이 있다(mab-summary 는 mab.md).
// 「<글 id> 글의 코드에 이어서」 표시는 글 id 로 쓴다. 화면의 링크가 post.html?id=<글 id> 로 가기 때문이다.
// js/posts.js 가 없는 폴더(시험용)에서는 파일 이름을 글 id 로 본다.
function idsOf(files) {
  const ids = new Map();
  const js = path.join(root, 'js', 'posts.js');
  if (fs.existsSync(js)) {
    for (const p of require(js).posts) {
      const m = /^posts\/(.+)\.md$/.exec(p.contentUrl || '');
      if (m) ids.set(p.id, m[1]);
    }
  } else {
    for (const f of files) ids.set(f.replace(/\.md$/, ''), f.replace(/\.md$/, ''));
  }
  return ids;
}

const files = fs.readdirSync(path.join(root, 'posts')).filter(f => f.endsWith('.md')).sort();
const stems = new Set(files.map(f => f.replace(/\.md$/, '')));
const ids = idsOf(files);
const all = files.map(file => {
  const found = blocksOf(file);
  return {
    file,
    blocks: found.filter(b => !b.badTag).map(b => Object.assign(b, { model: CodeSteps.parse(b.src) })),
    badTags: found.filter(b => b.badTag),
  };
});
const sum = o => Object.values(o).reduce((a, b) => a + b, 0);

// 이어서 돌릴 글의 파일 이름. 글 id 가 아니면 null.
const fileOf = label => (ids.has(label.post) ? ids.get(label.post) : null);

function json() {
  const out = [];
  for (const { file, blocks } of all) {
    blocks.forEach((b, index) => {
      const m = b.model;
      out.push({
        post: file.replace(/\.md$/, ''), index, format: m.format, ok: m.ok, src: m.src,
        labels: (m.labels || []).map(l => (l.kind === 'cont-post' ? Object.assign({}, l, { file: fileOf(l) || l.post }) : l)),
        stepLines: m.stepLines || [], codeEnd: m.codeEnd === undefined ? null : m.codeEnd,
        out: m.out ? { varying: m.out.varying, groups: m.out.groups.map(g => ({ n: g.n, lines: g.lines })) } : null,
      });
    });
  }
  // process.exit 를 부르면 파이프로 나가던 큰 출력이 잘린다. 다 쓸 때까지 저절로 끝나게 둔다.
  process.stdout.write(JSON.stringify(out));
}

function contPostErrors(b) {
  const errors = [];
  const lines = b.src.split('\n');
  for (const l of b.model.labels || []) {
    if (l.kind !== 'cont-post') continue;
    const line = lines.findIndex(x => x.startsWith(`# (${l.post} 글의 코드에 이어서`)) + 1;
    const file = fileOf(l);
    if (file === null) {
      const byFile = [...ids].find(([, f]) => f === l.post);
      errors.push({ line, msg: byFile
        ? `이어서 돌릴 글은 글 id 로 씁니다 — posts/${l.post}.md 의 글 id 는 ${byFile[0]} 입니다`
        : `이어서 돌릴 글 ${l.post} 가 js/posts.js 에 없습니다` });
    } else if (!stems.has(file)) {
      errors.push({ line, msg: `이어서 돌릴 글 ${l.post} 의 파일 posts/${file}.md 가 없습니다` });
    }
  }
  return errors;
}

function check() {
  const legacy = {};
  for (const { file, blocks } of all) {
    const c = blocks.filter(b => b.model.format === 'legacy').length;
    if (c) legacy[file] = c;
  }
  if (args.includes('--update')) {
    fs.writeFileSync(BASELINE, JSON.stringify(legacy, null, 2) + '\n');
    console.log(`기준표를 다시 적었습니다 — 옛 형식 블록 ${sum(legacy)}개, 글 ${Object.keys(legacy).length}편`);
    return;
  }
  const base = fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')) : {};
  let fail = 0, steps = 0;
  const shrunk = [];
  for (const { file, blocks, badTags } of all) {
    for (const b of badTags) {
      fail++;
      console.log(`✗ posts/${file}:${b.fence}  파이썬 블록의 꼬리표는 \`python\` 하나로 씁니다 (지금 \`${b.badTag}\`)`);
    }
    for (const b of blocks) {
      const m = b.model;
      if (m.format !== 'steps') continue;
      steps++;
      for (const e of m.errors.concat(contPostErrors(b))) {
        fail++;
        console.log(`✗ posts/${file}:${b.fence + e.line}  ${e.msg}`);
      }
    }
    const c = legacy[file] || 0;
    if (c > (base[file] || 0)) {
      fail++;
      console.log(`✗ posts/${file}  옛 형식 파이썬 블록 ${c}개 (기준표 ${base[file] || 0}개). 새 블록은 「# 하는 일:」 형식으로 씁니다`);
    } else if (c < (base[file] || 0)) {
      shrunk.push(`${file} ${base[file]}→${c}`);
    }
  }
  if (shrunk.length) {
    console.log(`  기준표보다 줄어든 글 ${shrunk.length}편 (${shrunk.join(', ')}) — node scripts/check-code-blocks.js --update 로 기준표를 줄입니다`);
  }
  console.log(`${fail ? '✗' : '✓'} 새 형식 블록 ${steps}개, 옛 형식 블록 ${sum(legacy)}개, 문제 ${fail}건`);
  process.exitCode = fail ? 1 : 0;
}

if (args.includes('--json')) json();
else check();
````

- [ ] **Step 4: 시험과 지금 글을 돌린다**

Run: `node scripts/test-check-code-blocks.js`
Expected: 마지막 줄 `16 통과, 0 실패`

Run: `node scripts/check-code-blocks.js`
Expected: `✓ 새 형식 블록 11개, 옛 형식 블록 236개, 문제 0건` (줄어든 글 알림 없음)

Run: `node scripts/check-code-blocks.js --json | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).length))"`
Expected: `247` — 블록 수가 바꾸기 전과 같다(꼬리표가 `python` 이 아닌 블록이 지금은 없다).

Run: `python3 scripts/check-python-outputs.py`
Expected: `✓ 통과 11, 건너뜀 0 (라이브러리 없음 0, 실행 안 됨 0), 실패 0` — `--json` 을 읽는 실행 검사가 그대로 돈다.

- [ ] **Step 5: CI 에 시험을 넣는다**

**Edit 3.1 — `.github/workflows/validate.yml`**

찾을 글:

````yaml
      - name: 코드 블록 파서 단위 테스트
        run: node scripts/test-code-steps.js
````

바꿀 글:

````yaml
      - name: 코드 블록 파서 단위 테스트
        run: node scripts/test-code-steps.js
      - name: 코드 블록 형식 검사 시험
        run: node scripts/test-check-code-blocks.js
````

`runs-on: ubuntu-24.04` 와 `python-version: '3.9'` 줄은 그대로 둔다.

- [ ] **Step 6: 커밋**

````bash
git add scripts/check-code-blocks.js scripts/test-check-code-blocks.js .github/workflows/validate.yml
git commit -F - <<'EOF'
feat(scripts): 형식 검사가 python 이 아닌 꼬리표와 이어서 돌릴 글의 id 를 보고, 줄어든 기준표를 알린다 — 시험 16개와 CI 한 단계

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

---

### Task 4: 실행 검사 다지기 — `scripts/check-python-outputs.py`

**Files:**
- Modify: `scripts/check-python-outputs.py` (파일 전체를 바꾼다)
- Test: `scripts/test-python-outputs.py` (시험 7개를 더한다)

**Interfaces:**
- Consumes: Task 3 의 `--json` (cont-post 레이블의 `file`)
- Produces:
  - `--show` — 돌린 블록마다 `── posts/<파일>.md 의 N번째 파이썬 블록 — 찍힌 줄` 다음에, 찍힌 줄을 그 줄을 찍은 단계마다 묶어 `# N단계 뜻: …`(첫 단계 앞 코드와 단계 없는 블록, 옛 형식 블록은 `# 뜻: …`) 아래 `# <찍힌 줄>`(빈 줄은 `#`)로 찍는다. 출력 영역에 그대로 붙이고 `…` 에 뜻을 쓰면 된다.
  - `--post <파일 이름>` 이 posts/ 에 없으면 `✗ posts/<이름>.md 가 없습니다. --post 에는 posts/ 의 파일 이름을 .md 없이 씁니다` 를 찍고 종료 코드 2.
  - 「글의 코드에 이어서」는 `label.file`(없으면 `label.post`)로 앞 글의 블록을 찾는다.
  - 실행기와 블록마다 쓰는 작업 폴더는 `tempfile.TemporaryDirectory` 안에 두고 끝나면 지운다.

- [ ] **Step 1: 시험 7개를 먼저 더한다**

**Edit 4.1 — `scripts/test-python-outputs.py`**

찾을 글:

````python
    'norun': [
        '# (발췌 — 그대로 실행되지 않습니다.)',
        '# 하는 일: 조각이다.',
        '    return x',
    ],
}
````

바꿀 글:

````python
    'norun': [
        '# (발췌 — 그대로 실행되지 않습니다.)',
        '# 하는 일: 조각이다.',
        '    return x',
    ],
    'raise': [
        '# 하는 일: 일부러 예외를 낸다.',
        'raise ValueError("일부러")',
    ],
    'step0-mean': [
        '# 하는 일: 단계가 찍은 줄에 번호 없는 뜻을 붙였다.',
        '# 1단계: 하나를 찍는다',
        'print("하나")',
        '',
        '# 출력:',
        '# 뜻: 번호 없는 뜻은 첫 단계 앞 코드가 찍은 줄에만 붙인다.',
        '# 하나',
    ],
}
````

**Edit 4.2 — `scripts/test-python-outputs.py`**

찾을 글:

````python
    ['# (앞 블록에 이어서 돌린다.)', '# 하는 일: 앞 블록의 x 를 쓴다.', 'print(x + 1)', '', '# 출력:', '# 뜻: 앞 블록이 x 를 만들었다.', '# 42'],
]
````

바꿀 글:

````python
    ['# (앞 블록에 이어서 돌린다.)', '# 하는 일: 앞 블록의 x 를 쓴다.', 'print(x + 1)', '', '# 출력:', '# 뜻: 앞 블록이 x 를 만들었다.', '# 42'],
]
# 앞 블록이 예외를 내면 이어지는 블록은 실패한다
CONT_RAISE = [
    ['x = 1 / 0'],
    ['# (앞 블록에 이어서 돌린다.)', '# 하는 일: 앞 블록의 x 를 쓴다.', 'print(x)', '', '# 출력:', '# 뜻: 앞 블록이 x 를 만든다.', '# 1'],
]
# 그대로 실행되지 않는 블록은 앞 코드에서 뺀다. 빼지 않으면 들여쓴 조각이 IndentationError 를 낸다
CONT_NORUN = [
    ['# (발췌 — 그대로 실행되지 않습니다.)', '# 하는 일: 조각이다.', '    return x'],
    ['x = 41'],
    ['# (앞 블록에 이어서 돌린다.)', '# 하는 일: 앞 블록의 x 를 쓴다.', 'print(x + 1)', '', '# 출력:', '# 뜻: 발췌 블록을 빼고 돌렸다.', '# 42'],
]
# 다른 글에 이어서 — 글 id(other-id)와 파일 이름(Other_File)이 다른 글을 js/posts.js 로 잇는다
OTHER = [['y = 6']]
CONT_POST = [
    ['# (other-id 글의 코드에 이어서 돌린다.)', '# 하는 일: 앞 글의 y 를 쓴다.', 'print(y * 7)', '', '# 출력:', '# 뜻: 앞 글의 블록을 먼저 돌렸다.', '# 42'],
]
````

**Edit 4.3 — `scripts/test-python-outputs.py`**

찾을 글:

````python
root = tempfile.mkdtemp(prefix='pyout-test-')
os.makedirs(os.path.join(root, 'posts'))
for pid, lines in POSTS.items():
    write_post(root, pid, [lines])
write_post(root, 'cont', CONT)
````

바꿀 글:

````python
tmp = tempfile.TemporaryDirectory(prefix='pyout-test-')
root = tmp.name
os.makedirs(os.path.join(root, 'posts'))
os.makedirs(os.path.join(root, 'js'))
with open(os.path.join(root, 'js', 'posts.js'), 'w', encoding='utf-8') as f:
    f.write("const posts = [{ id: 'other-id', contentUrl: 'posts/Other_File.md' }];\nmodule.exports = { posts };\n")
for pid, lines in POSTS.items():
    write_post(root, pid, [lines])
write_post(root, 'cont', CONT)
write_post(root, 'cont-raise', CONT_RAISE)
write_post(root, 'cont-norun', CONT_NORUN)
write_post(root, 'Other_File', OTHER)
write_post(root, 'cont-post', CONT_POST)
````

**Edit 4.4 — `scripts/test-python-outputs.py`**

찾을 글:

````python
print('\n%d 통과, %d 실패' % (pass_, fail))
````

바꿀 글:

````python
print('\n예외와 앞 코드')
code, out = run(root, 'raise')
eq('블록이 예외를 내면 실패', (code, 'ValueError: 일부러' in out), (1, True))
code, out = run(root, 'cont-raise')
eq('앞 블록이 예외를 내면 실패', (code, '앞 블록에서 ZeroDivisionError' in out), (1, True))
eq('그대로 실행되지 않는 블록은 앞 코드에서 뺀다', run(root, 'cont-norun')[0], 0)
eq('다른 글의 코드에 이어서 (글 id 를 파일 이름으로)', run(root, 'cont-post')[0], 0)
code, out = run(root, 'step0-mean')
eq('번호 없는 뜻 아래 줄은 첫 단계 앞 코드가 찍어야 한다',
   (code, '1번째 찍힌 줄은 1단계가 찍었는데 뜻 줄은 첫 단계 앞 코드입니다' in out), (1, True))

print('\n글 이름과 보여 주기')
r = subprocess.run([sys.executable, CHECK, '--root', root, '--post', 'no-such-post'], capture_output=True, text=True)
eq('없는 글을 주면 멈춘다', (r.returncode, 'posts/no-such-post.md 가 없습니다' in r.stdout), (2, True))
r = subprocess.run([sys.executable, CHECK, '--root', root, '--post', 'ok', '--show'], capture_output=True, text=True)
eq('--show 는 찍힌 줄을 단계마다 뜻 줄 자리와 함께 보여 준다', '# 1단계 뜻: …\n# 하나\n# 2단계 뜻: …\n# 둘' in r.stdout, True)

tmp.cleanup()
print('\n%d 통과, %d 실패' % (pass_, fail))
````

- [ ] **Step 2: 시험이 실패하는지 본다**

Run: `python3 scripts/test-python-outputs.py`
Expected: 마지막 줄 `14 통과, 3 실패`. 실패는 `다른 글의 코드에 이어서 (글 id 를 파일 이름으로)`, `없는 글을 주면 멈춘다`, `--show 는 찍힌 줄을 단계마다 뜻 줄 자리와 함께 보여 준다` 셋이다. 블록 예외, 앞 블록 예외, 발췌 블록 빼기, 번호 없는 뜻은 지금도 맞게 돌아 시험이 그것을 붙잡아 둔다.

- [ ] **Step 3: 실행 검사를 바꾼다**

`scripts/check-python-outputs.py` 파일 전체를 아래 내용으로 바꾼다. 바뀐 곳은 머리 설명 두 줄, 앞 글 블록 찾기 한 줄, `show_lines` 함수, `main()` 이다.

<!-- file scripts/check-python-outputs.py -->
````python
#!/usr/bin/env python3
"""파이썬 블록을 실제로 돌려 적힌 출력과 같은지 본다. 설계: docs/superpowers/specs/2026-10-13-python-code-blocks-design.md

  python3 scripts/check-python-outputs.py              새 형식 블록을 돌린다 (CI)
  python3 scripts/check-python-outputs.py --legacy     옛 형식 블록도 돌린다 (옮길 때 로컬에서)
  python3 scripts/check-python-outputs.py --post <글>   글 하나만 돌린다 (posts/ 의 파일 이름, .md 는 뺀다)
  python3 scripts/check-python-outputs.py --jobs <n>   동시에 돌릴 수 (기본 4)
  python3 scripts/check-python-outputs.py --root <폴더> posts/ 를 그 폴더에서 찾는다 (시험용)
  python3 scripts/check-python-outputs.py --show       블록마다 찍힌 줄을 뜻 줄 자리와 함께 보여 준다 (옮길 때 붙여 쓴다)

블록 읽기는 js/code-steps.js 한 곳에 있다. node scripts/check-code-blocks.js --json 으로 받아 쓴다.
표준 라이브러리만 쓴다. import 할 수 없는 라이브러리를 쓰는 블록은 실패로 치지 않고 건너뛴다.
찍힌 줄마다 그 줄을 쓸 때 실행 중이던 모듈 최상위 문장을 찾아, 그 문장이 속한 단계와 뜻 줄의 번호를 견준다.
"""
import argparse
import concurrent.futures as cf
import json
import os
import re
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TIMEOUT = 120
OUT_MARK = re.compile(r'^# 출력(?=[\s(:]|$)')
NUM = re.compile(r'\d+(?:[.,]\d+)*')

# 블록마다 새 프로세스에서 돈다. stdin 으로 {prefix: [앞 코드...], code: 블록 코드} 를 받는다.
HARNESS = r'''
import io, json, sys, types
job = json.load(sys.stdin)
real = sys.stdout
class W(io.TextIOBase):
    def __init__(self):
        self.lines, self.buf, self.at = [], '', None
    def writable(self):
        return True
    def write(self, s):
        f, top = sys._getframe(1), None
        while f is not None:
            if f.f_code.co_filename == '<block>':
                top = f.f_lineno
            f = f.f_back
        parts = s.split('\n')
        for p in parts[:-1]:
            if not self.buf:
                self.at = top
            self.lines.append([self.buf + p, self.at])
            self.buf, self.at = '', None
        if parts[-1]:
            if not self.buf:
                self.at = top
            self.buf += parts[-1]
        return len(s)
mod = types.ModuleType('__main__')
sys.modules['__main__'] = mod
g = mod.__dict__
res = {'lines': [], 'err': None, 'missing': None}
sys.stdout = sys.stderr = io.StringIO()
try:
    for i, code in enumerate(job['prefix']):
        exec(compile(code, '<prefix-%d>' % i, 'exec'), g)
except ModuleNotFoundError as e:
    res['missing'] = e.name
except BaseException as e:
    res['err'] = ('앞 블록에서 %s: %s' % (type(e).__name__, e))[:300]
if res['missing'] is None and res['err'] is None:
    w = W()
    sys.stdout = sys.stderr = w
    try:
        exec(compile(job['code'], '<block>', 'exec'), g)
    except SystemExit:
        pass
    except ModuleNotFoundError as e:
        res['missing'] = e.name
    except BaseException as e:
        res['err'] = ('%s: %s' % (type(e).__name__, e))[:300]
    if w.buf:
        w.lines.append([w.buf, w.at])
    res['lines'] = w.lines
sys.stdout, sys.stderr = real, sys.__stderr__
print(json.dumps(res, ensure_ascii=False))
'''


def load_blocks(root):
    js = os.path.join(ROOT, 'scripts', 'check-code-blocks.js')
    cmd = ['node', js, '--json'] + (['--root', root] if root else [])
    return json.loads(subprocess.run(cmd, capture_output=True, text=True, check=True).stdout)


def code_of(b):
    lines = b['src'].split('\n')
    end = b['codeEnd'] if b['format'] == 'steps' else next((i for i, l in enumerate(lines) if OUT_MARK.match(l)), len(lines))
    return '\n'.join(lines[:end]) + '\n'


def declared_of(b):
    """[(뜻 줄 번호 또는 None, 찍힌 줄)] — 출력 영역이 없으면 None."""
    if b['format'] == 'steps':
        if not b['out']:
            return None
        return [(g['n'], t) for g in b['out']['groups'] for t in g['lines']]
    lines = b['src'].split('\n')
    k = next((i for i, l in enumerate(lines) if OUT_MARK.match(l)), None)
    if k is None:
        return None
    return [(None, (l[2:] if l.startswith('# ') else l[1:] if l.startswith('#') else l).rstrip()) for l in lines[k + 1:]]


def labelled(b, kind):
    return any(l['kind'] == kind for l in b['labels'])


def norun(b):
    if b['format'] == 'legacy':
        return any('의사코드' in l for l in b['src'].split('\n')[:2])
    return labelled(b, 'norun')


def prefix_of(b, by_post):
    """이어지는 블록 앞에 먼저 돌릴 코드. 다른 글의 블록들, 그다음 이 글의 앞 블록들 차례."""
    if not (labelled(b, 'cont') or labelled(b, 'cont-post')):
        return []
    mine = by_post[b['post']]
    other = []
    for x in mine[:b['index'] + 1]:
        for l in x['labels']:
            if l['kind'] == 'cont-post':
                # 글 id 에 맞는 파일 이름은 형식 검사가 file 에 넣어 준다 (mab-summary 는 mab.md)
                other += by_post.get(l.get('file') or l['post'], [])
    seen, codes = set(), []
    for x in other + mine[:b['index']]:
        key = (x['post'], x['index'])
        if key not in seen and not norun(x):
            seen.add(key)
            codes.append(code_of(x))
    return codes


def step_of(b, lineno):
    if lineno is None:
        return None
    step = 0
    for s in b['stepLines']:
        if s['from'] <= lineno - 1:
            step = s['n']
    return step


def trim(xs, text):
    while xs and not text(xs[-1]).strip():
        xs = xs[:-1]
    return xs


def check(b, res):
    varying = bool(b['format'] == 'steps' and b['out'] and b['out']['varying'])
    norm = (lambda s: ' '.join(NUM.sub('0', s).split())) if varying else (lambda s: s.rstrip())
    actual = trim(res['lines'], lambda x: x[0])
    declared = declared_of(b)
    if declared is None:
        if actual and b['format'] == 'steps':
            return ['찍힌 줄이 %d줄 있는데 출력 영역이 없습니다' % len(actual)]
        return []
    declared = trim(declared, lambda x: x[1])
    a = [norm(x[0]) for x in actual]
    d = [norm(t) for _, t in declared]
    if a != d:
        i = next((k for k, (x, y) in enumerate(zip(a, d)) if x != y), min(len(a), len(d)))
        return ['%d번째 찍힌 줄이 다릅니다\n      적힌 줄: %s\n      찍힌 줄: %s' % (
            i + 1, d[i] if i < len(d) else '(없음)', a[i] if i < len(a) else '(없음)')]
    if b['format'] == 'steps' and b['stepLines']:
        for k, ((n, _), (_, lineno)) in enumerate(zip(declared, actual)):
            got, want = step_of(b, lineno), (n if n is not None else 0)
            if got != want:
                name = lambda s: '첫 단계 앞 코드' if s == 0 else '알 수 없는 곳' if s is None else '%d단계' % s
                return ['%d번째 찍힌 줄은 %s가 찍었는데 뜻 줄은 %s입니다' % (k + 1, name(got), name(want))]
    return []


def show_lines(b, res):
    """찍힌 줄을 그 줄을 찍은 단계마다 묶어 출력 영역에 붙일 꼴로 돌려준다. 뜻은 … 자리에 쓴다."""
    out, last = [], object()
    steps = b['format'] == 'steps' and bool(b['stepLines'])
    for text, lineno in trim(res['lines'], lambda x: x[0]):
        s = step_of(b, lineno) if steps else 0
        if s != last:
            out.append('# %d단계 뜻: …' % s if s else '# 뜻: …')
            last = s
        out.append('# ' + text if text else '#')
    return out


def main():
    ap = argparse.ArgumentParser(description='파이썬 블록을 돌려 적힌 출력과 견준다')
    ap.add_argument('--legacy', action='store_true', help='옛 형식 블록도 돌린다')
    ap.add_argument('--post', help='글 하나만 (posts/ 의 파일 이름, .md 는 뺀다)')
    ap.add_argument('--jobs', type=int, default=4, help='동시에 돌릴 수')
    ap.add_argument('--root', help='posts/ 가 있는 폴더 (시험용)')
    ap.add_argument('--show', action='store_true', help='블록마다 찍힌 줄을 뜻 줄 자리와 함께 보여 준다')
    args = ap.parse_args()

    # 없는 글을 주면 아무것도 안 돌리고 통과로 끝나던 것을 막는다
    if args.post and not os.path.exists(os.path.join(args.root or ROOT, 'posts', args.post + '.md')):
        print('✗ posts/%s.md 가 없습니다. --post 에는 posts/ 의 파일 이름을 .md 없이 씁니다' % args.post)
        sys.exit(2)

    blocks = load_blocks(args.root)
    by_post = {}
    for b in blocks:
        by_post.setdefault(b['post'], []).append(b)
    todo = [b for b in blocks
            if (args.post is None or b['post'] == args.post)
            and ((b['format'] == 'steps' and b['ok']) or (args.legacy and b['format'] == 'legacy'))]
    env = dict(os.environ, PYTHONHASHSEED='0', PYTHONIOENCODING='utf-8', MPLBACKEND='Agg')

    # 실행기와 블록마다 쓰는 작업 폴더는 끝나면 지운다
    with tempfile.TemporaryDirectory(prefix='pyblocks-') as work:
        harness = os.path.join(work, 'harness.py')
        with open(harness, 'w', encoding='utf-8') as f:
            f.write(HARNESS)

        def run(b):
            if norun(b):
                return b, 'norun', None, None
            job = json.dumps({'prefix': prefix_of(b, by_post), 'code': code_of(b)})
            try:
                r = subprocess.run([sys.executable, harness], input=job, cwd=tempfile.mkdtemp(dir=work),
                                   capture_output=True, text=True, timeout=TIMEOUT, env=env)
            except subprocess.TimeoutExpired:
                return b, 'fail', ['%d초 안에 끝나지 않았습니다' % TIMEOUT], None
            try:
                res = json.loads(r.stdout.strip().splitlines()[-1])
            except (ValueError, IndexError):
                return b, 'fail', ['실행기가 결과를 내지 못했습니다: ' + r.stderr[-300:]], None
            if res['missing']:
                return b, 'missing', res['missing'], None
            if res['err']:
                return b, 'fail', [res['err']], res
            errs = check(b, res)
            return b, ('fail' if errs else 'pass'), errs, res

        with cf.ThreadPoolExecutor(max(1, args.jobs)) as ex:
            results = list(ex.map(run, todo))

    count = {'pass': 0, 'fail': 0, 'missing': 0, 'norun': 0}
    for b, status, detail, res in results:
        count[status] += 1
        where = 'posts/%s.md 의 %d번째 파이썬 블록' % (b['post'], b['index'] + 1)
        if status == 'fail':
            for e in detail:
                print('✗ %s — %s' % (where, e))
        elif status == 'missing':
            print('  건너뜀 %s (%s 없음)' % (where, detail))
        if args.show and res is not None:
            print('── %s — 찍힌 줄' % where)
            for line in show_lines(b, res):
                print(line)
    skipped = count['missing'] + count['norun']
    print('%s 통과 %d, 건너뜀 %d (라이브러리 없음 %d, 실행 안 됨 %d), 실패 %d' % (
        '✗' if count['fail'] else '✓', count['pass'], skipped, count['missing'], count['norun'], count['fail']))
    sys.exit(1 if count['fail'] else 0)


if __name__ == '__main__':
    main()
````

- [ ] **Step 4: 시험과 지금 글을 돌린다**

Run: `python3 scripts/test-python-outputs.py`
Expected: 마지막 줄 `17 통과, 0 실패`

Run: `python3 scripts/check-python-outputs.py`
Expected: `✓ 통과 11, 건너뜀 0 (라이브러리 없음 0, 실행 안 됨 0), 실패 0` (torch 가 없으면 `통과 10, 건너뜀 1`)

Run: `python3 scripts/check-python-outputs.py --post algorithm-complexity-array --show | head -2`
Expected:

````text
── posts/algorithm-complexity-array.md 의 1번째 파이썬 블록 — 찍힌 줄
# 3단계 뜻: …
````

Run: `python3 scripts/check-python-outputs.py --post no-such-post; echo "exit=$?"`
Expected: `✗ posts/no-such-post.md 가 없습니다. …` 와 `exit=2`

Run: `S="${TMPDIR:-/tmp}"; a=$(ls "$S" | grep -c pyblocks-); python3 scripts/check-python-outputs.py --post algorithm-complexity-array > /dev/null; b=$(ls "$S" | grep -c pyblocks-); echo "$a $b"`
Expected: 두 수가 같다 — 돌린 뒤 임시 폴더가 남지 않는다.

- [ ] **Step 5: 커밋**

````bash
git add scripts/check-python-outputs.py scripts/test-python-outputs.py
git commit -F - <<'EOF'
feat(scripts): 실행 검사에 --show 를 더하고, 없는 글은 멈추고, 이어서 돌릴 글을 파일 이름으로 찾는다 — 임시 폴더를 지우고 시험 7개를 더함

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

---

### Task 5: 글쓰기 규칙 — `MARKDOWN_GUIDE.md`

**Files:**
- Modify: `MARKDOWN_GUIDE.md` (「파이썬 블록 쓰는 법」 절에 네 줄)

**Interfaces:**
- Consumes: Task 3 의 글 id 와 꼬리표 검사, Task 4 의 `--show`, 이 계획의 「주석 그림은 글로」 결정
- Produces: 다음 묶음부터 글쓴이가 읽는 규칙

- [ ] **Step 1: 네 줄을 더한다**

**Edit 5.1 — `MARKDOWN_GUIDE.md`**

찾을 글:

````markdown
- 상태 표시는 넷입니다. `# (의사코드 — 그대로 실행되지 않습니다.)`, `# (발췌 — 그대로 실행되지 않습니다.)`, `# (앞 블록에 이어서 돌린다.)`, `# (<글 id> 글의 코드에 이어서 돌린다.)`. 실행 검사는 앞의 둘을 건너뛰고, 뒤의 둘은 앞 코드를 먼저 돌린 뒤 돌립니다.
````

바꿀 글:

````markdown
- 상태 표시는 넷입니다. `# (의사코드 — 그대로 실행되지 않습니다.)`, `# (발췌 — 그대로 실행되지 않습니다.)`, `# (앞 블록에 이어서 돌린다.)`, `# (<글 id> 글의 코드에 이어서 돌린다.)`. 실행 검사는 앞의 둘을 건너뛰고, 뒤의 둘은 앞 코드를 먼저 돌린 뒤 돌립니다.
- `<글 id>` 는 `js/posts.js` 의 `id` 입니다. 대개 파일 이름과 같지만 다른 글이 넷 있습니다(`mab.md` 의 id 는 `mab-summary`). 파일 이름을 쓰면 형식 검사가 글 id 를 알려 줍니다.
````

**Edit 5.2 — `MARKDOWN_GUIDE.md`**

찾을 글:

````markdown
- 찍힌 줄은 블록을 돌렸을 때 찍히는 그대로 붙입니다. 빈 줄은 `#` 한 글자로 씁니다.
````

바꿀 글:

````markdown
- 찍힌 줄은 블록을 돌렸을 때 찍히는 그대로 붙입니다. 빈 줄은 `#` 한 글자로 씁니다.
- 찍힌 줄은 손으로 옮겨 적지 않습니다. 하는 일과 단계까지 쓰고 `python3 scripts/check-python-outputs.py --post <slug> --show` 를 돌리면, 블록마다 찍힌 줄이 그 줄을 찍은 단계의 뜻 줄 자리(`# 2단계 뜻: …`)와 함께 나옵니다. `# 출력:` 아래에 그대로 붙이고 `…` 자리에 뜻을 씁니다. 옛 형식 블록은 `--legacy` 를 더하면 나옵니다.
````

**Edit 5.3 — `MARKDOWN_GUIDE.md`**

찾을 글:

````markdown
- 단계는 읽는 사람이 나눠 읽을 자리에만 둡니다. 짧고 한 가지 일만 하면 단계 없이 씁니다.
````

바꿀 글:

````markdown
- 단계는 읽는 사람이 나눠 읽을 자리에만 둡니다. 짧고 한 가지 일만 하면 단계 없이 씁니다.
- 코드 줄 사이에 이어 쓴 주석 줄은 화면에서 메모 하나로 이어집니다. 주석으로 그린 그림(트리 모양 같은 것)은 모양이 깨지니 단계 풀이에 글로 풀어 씁니다.
- 블록 꼬리표는 `python` 하나로 씁니다. `python3`, `py`, `python 제목` 같은 꼬리표는 화면이 새 형식으로 그리지 않아 형식 검사가 막습니다.
````

- [ ] **Step 2: 말투와 장문 검사를 돌린다**

Run: `node scripts/check-wording.js && node scripts/test-long-sentences.js`
Expected: `✓ 261개 파일 말투와 낱말 검사 통과 …` 와 `✓ 전부 통과`

- [ ] **Step 3: 커밋**

````bash
git add MARKDOWN_GUIDE.md
git commit -F - <<'EOF'
docs: 글쓰기 규칙의 파이썬 블록 절에 글 id, --show, 주석으로 그린 그림, 꼬리표 규칙을 더함

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

---

### Task 6: algorithm-hash-sort 블록 10개 옮기기와 화면 확인

**Files:**
- Modify: `posts/algorithm-hash-sort.md` (파이썬 블록 10개를 새 블록으로, 바로 뒤 별도 출력 블록 10개를 지운다)
- Modify: `scripts/code-blocks-baseline.json`
- 임시: `$SCRATCH/migrate_batch2.py` (저장소에 넣지 않는다. Task 7 도 쓴다)

**Interfaces:**
- Consumes: Task 1~5 의 검사, 이 계획 부록 1 의 새 블록 10개
- Produces: 새 형식 블록 10개(합 21개). 별도 출력 블록을 블록 안으로 옮긴 첫 글이다. Task 7 이 같은 도우미를 쓴다.

- [ ] **Step 1: 옮기는 도우미를 저장소 밖에 둔다**

`$SCRATCH/migrate_batch2.py` 는 아래 내용이다. 새 블록 글은 이 계획 문서의 부록에서 읽는다. 원본 블록이 계획을 쓸 때와 다르거나, 새 블록의 코드 줄이 원본과 다르거나, 새 블록의 찍힌 줄이 지울 별도 출력 블록과 글자까지 같지 않으면 아무것도 바꾸지 않고 멈춘다.

<!-- file $SCRATCH/migrate_batch2.py -->
````python
#!/usr/bin/env python3
"""둘째 묶음(알고리즘 글 5편)의 파이썬 블록을 새 형식(하는 일, 단계, 뜻)으로 옮기는 일회용 도우미. 저장소에 넣지 않는다.

새 블록 글은 계획 문서에 있다. 블록마다 표시 줄
  <!-- cb2 post=<글 파일 이름> block=<0부터 센 파이썬 블록 번호> sha=<원본 블록 sha256 앞 16자> -->
바로 아래 네 백틱 python 울타리 안이 새 블록 전체다.

바꾸기 전에 셋을 본다. 하나라도 어긋나면 아무것도 바꾸지 않고 멈춘다.
  1. 원본 블록이 계획을 쓸 때와 같다 (sha)
  2. 새 블록의 코드 줄(빈 줄과 # 로 시작하는 줄을 뺀 줄)이 원본과 글자까지 같다
  3. 새 블록의 찍힌 줄이 지울 별도 출력 블록과 글자까지 같다. 시간을 잰 블록의 숫자도 원래 적힌 그대로다
그다음 파이썬 블록을 새 블록으로 바꾸고, 바로 뒤의 별도 출력 블록을 지운다. 그 밖의 글은 건드리지 않는다.

  python3 migrate_batch2.py <계획 문서> <posts 폴더> <글 파일 이름>
"""
import hashlib
import re
import sys

PLAN, POSTS, POST = sys.argv[1], sys.argv[2], sys.argv[3]
TICKS = '`' * 4  # 계획 문서의 네 백틱 울타리
MARK = re.compile(r'^<!-- cb2 post=(\S+) block=(\d+) sha=([0-9a-f]{16}) -->\n' + TICKS + r'python\n(.*?)^' + TICKS + r'[ \t]*$',
                  re.S | re.M)
FENCE = re.compile(r'^```([^\n`]*)\n(.*?)^```[ \t]*$', re.S | re.M)
OUT = re.compile(r'^# 출력(?: \((.+)\))?:\s*$')
MEAN = re.compile(r'^# (?:\d+단계 )?뜻: ')


def code_lines(src):
    return [l for l in src.split('\n') if l.strip() and not l.lstrip().startswith('#')]


def printed(src):
    """새 블록 출력 영역의 찍힌 줄들 (뜻 줄을 뺀다)."""
    lines = src.rstrip('\n').split('\n')
    k = next(i for i, l in enumerate(lines) if OUT.match(l))
    return ['' if l == '#' else l[2:] for l in lines[k + 1:] if not MEAN.match(l)]


def trimmed(ls):
    ls = [l.rstrip() for l in ls]
    while ls and not ls[-1]:
        ls.pop()
    return ls


plan = open(PLAN, encoding='utf-8').read()
want = {int(m.group(2)): (m.group(3), m.group(4)) for m in MARK.finditer(plan) if m.group(1) == POST}
if not want:
    sys.exit(f'{POST}: 계획 문서에 이 글의 블록이 없습니다')

path = f'{POSTS}/{POST}.md'
text = open(path, encoding='utf-8').read()
fences = list(FENCE.finditer(text))
py = [k for k, f in enumerate(fences) if f.group(1).strip() == 'python']
problems, edits = [], []
for n, (sha, new) in sorted(want.items()):
    if n >= len(py):
        problems.append(f'{n}번 블록이 글에 없습니다')
        continue
    f = fences[py[n]]
    got = hashlib.sha256(f.group(2).encode('utf-8')).hexdigest()[:16]
    if got != sha:
        problems.append(f'{n}번 블록이 계획을 쓸 때와 다릅니다 (기대 {sha}, 실제 {got})')
        continue
    sep = fences[py[n] + 1] if py[n] + 1 < len(fences) else None
    if sep is None or sep.group(1).strip() or text[f.end():sep.start()].strip():
        problems.append(f'{n}번 블록 바로 뒤에 별도 출력 블록이 없습니다')
        continue
    if code_lines(new) != code_lines(f.group(2)):
        problems.append(f'{n}번 블록의 코드 줄이 원본과 다릅니다')
        continue
    if trimmed(printed(new)) != trimmed(sep.group(2).split('\n')):
        problems.append(f'{n}번 블록의 찍힌 줄이 별도 출력 블록과 다릅니다')
        continue
    edits.append((f.start(2), f.end(2), new, f.end(), sep.end()))
if problems:
    sys.exit(f'{POST}: 바꾸지 않고 멈춥니다\n  ' + '\n  '.join(problems))

# 뒤에서부터 바꿔야 앞쪽 자리가 그대로다. 파이썬 블록의 닫는 울타리 뒤부터 별도 출력 블록 끝까지를 지운다.
for a, b, new, close, sep_end in reversed(edits):
    text = text[:a] + new + text[b:close] + text[sep_end:]
open(path, 'w', encoding='utf-8').write(text)
print(f'{POST}: 블록 {len(edits)}개를 옮기고 별도 출력 블록 {len(edits)}개를 지웠습니다')
````

Run (저장소 루트에서, 계획 문서가 커밋돼 있어야 한다):

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch2"; mkdir -p "$SCRATCH"
python3 - migrate_batch2.py <<'EOF'
import os, re, sys
name = sys.argv[1]
T = '`' * 4
plan = open('docs/superpowers/plans/2026-10-14-python-code-blocks-batch2.md', encoding='utf-8').read()
m = re.search(r'^<!-- file \$SCRATCH/' + re.escape(name) + r' -->\n' + T + r'[a-z]*\n(.*?)^' + T + r'\n', plan, re.S | re.M)
dest = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'code-steps-batch2', name)
if not os.path.exists(dest):
    open(dest, 'w', encoding='utf-8').write(m.group(1))
print(dest)
EOF
````

Expected: 파일 경로 한 줄. 서버 파일도 같은 명령에서 이름만 `nocache_server.py` 로 바꿔 둔다(Step 6 이 쓴다).
- [ ] **Step 2: 옮긴다**

Run: `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch2"; python3 "$SCRATCH/migrate_batch2.py" docs/superpowers/plans/2026-10-14-python-code-blocks-batch2.md posts algorithm-hash-sort`
Expected: `algorithm-hash-sort: 블록 10개를 옮기고 별도 출력 블록 10개를 지웠습니다`. `바꾸지 않고 멈춥니다` 로 끝나면 이 태스크를 멈추고 까닭 줄을 그대로 알린다.

- [ ] **Step 3: 코드 줄과 블록 밖 글이 그대로인지 본다**

Run:

````bash
python3 - algorithm-hash-sort <<'EOF'
import re, subprocess, sys
PY = re.compile(r'^```python[^\n]*\n(.*?)^```[ \t]*$', re.S | re.M)
# 파이썬 블록과 바로 뒤 별도 출력 블록 한 쌍
PAIR = re.compile(r'^```python[^\n]*\n.*?^```[ \t]*\n\s*```[ \t]*\n.*?^```[ \t]*$', re.S | re.M)
code = lambda b: [l for l in b.split('\n') if l.strip() and not l.lstrip().startswith('#')]
fail = False
for post in sys.argv[1:]:
    old = subprocess.run(['git', 'show', f'HEAD:posts/{post}.md'], capture_output=True, text=True, check=True).stdout
    new = open(f'posts/{post}.md', encoding='utf-8').read()
    ob, nb = [m.group(1) for m in PY.finditer(old)], [m.group(1) for m in PY.finditer(new)]
    assert len(ob) == len(nb), (post, len(ob), len(nb))
    bad = [i for i, (a, b) in enumerate(zip(ob, nb)) if code(a) != code(b)]
    same = PAIR.sub('@', old) == PY.sub('@', new)
    left = len(PAIR.findall(new))
    print(f'{post}: 코드 줄이 바뀐 블록 {bad}, 블록 밖 글 {"같다" if same else "다르다"}, 파이썬 블록 바로 뒤 별도 출력 블록 {left}개')
    fail = fail or bool(bad or not same or left)
sys.exit(1 if fail else 0)
EOF
````

Expected: `algorithm-hash-sort: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다, 파이썬 블록 바로 뒤 별도 출력 블록 0개`

- [ ] **Step 4: 검사를 돌린다**

Run: `node scripts/check-code-blocks.js`
Expected: 두 줄

````text
  기준표보다 줄어든 글 1편 (algorithm-hash-sort.md 10→0) — node scripts/check-code-blocks.js --update 로 기준표를 줄입니다
✓ 새 형식 블록 21개, 옛 형식 블록 226개, 문제 0건
````

Run: `python3 scripts/check-python-outputs.py --post algorithm-hash-sort`
Expected: `✓ 통과 10, 건너뜀 0 (라이브러리 없음 0, 실행 안 됨 0), 실패 0`

Run: `node scripts/check-wording.js`
Expected: 종료 코드 0

- [ ] **Step 5: 기준표를 줄인다**

Run: `node scripts/check-code-blocks.js --update`
Expected: `기준표를 다시 적었습니다 — 옛 형식 블록 226개, 글 81편`

- [ ] **Step 6: 별도 출력 블록을 옮긴 첫 글을 화면으로 본다** (spec 8-2)

서버를 띄우고(백그라운드, 저장소 루트에서 `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch2"; python3 "$SCRATCH/nocache_server.py" "$(pwd)" 8771`) `http://127.0.0.1:8771/post.html?id=algorithm-hash-sort` 를 새 캐시로 연다. 아래 함수를 돌린다. 숨긴 iframe 을 네 폭으로 바꿔 가며 잰다.

````js
async () => {
  const POSTS = ['algorithm-hash-sort'];
  const f = document.createElement('iframe');
  f.style.cssText = 'position:absolute;left:-10000px;top:0;height:900px;border:0';
  document.body.appendChild(f);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const out = {};
  for (const w of [1440, 1280, 1024, 390]) {
    f.style.width = w + 'px';
    for (const id of POSTS) {
      await new Promise(r => { f.onload = r; f.src = `post.html?id=${id}&w=${w}&t=${Date.now()}`; });
      const d = f.contentDocument;
      for (let i = 0; i < 40 && !d.querySelector('.cb-row'); i++) await wait(250);
      await d.fonts.ready;
      await wait(700);
      const md = await (await fetch(`posts/${id}.md`)).text();
      const fences = [...md.matchAll(/^```python[^\n]*\n([\s\S]*?)^```[ \t]*$/gm)].map(m => m[1].replace(/\s+$/, ''));
      const cbs = [...d.querySelectorAll('.post-content .cb')];
      let overlap = 0;
      cbs.forEach(cb => cb.querySelectorAll('.cb-ln.has-note:not(.is-drop)').forEach(l => {
        if (l.querySelector('.cb-note').getBoundingClientRect().left < l.querySelector('.cb-t').getBoundingClientRect().right - 0.5) overlap++;
      }));
      // 블록 수, 원문과 같나, 출력 없는 블록, 바로 뒤 다른 코드 블록, 옆 넘침, 메모 겹침, 배치 빠짐, 용어 풀이와 수식
      out[`${id}@${w}`] = [
        cbs.length,
        cbs.every((cb, i) => cb.dataset.src === fences[i]),
        cbs.filter(cb => !cb.querySelector('.cb-out')).length,
        cbs.filter(cb => { const n = cb.nextElementSibling; return n && n.classList.contains('code-block-wrapper'); }).length,
        d.documentElement.scrollWidth > d.documentElement.clientWidth,
        overlap,
        cbs.filter(cb => [...cb.querySelectorAll('.cb-code')].some(c => c.style.getPropertyValue('--nc') === '')).length,
        d.querySelectorAll('.cb .demo-term, .cb .katex').length,
      ].join(' ');
    }
  }
  f.remove();
  return out;
}
````

Expected: 네 값 모두 `"10 true 0 0 false 0 0 0"` — 블록 10개, 원문과 같다, 출력 없는 블록 0, 바로 뒤에 남은 다른 코드 블록 0, 넘침 없음, 메모 겹침 0, 배치 빠짐 0, 용어 풀이와 수식이 끼어든 곳 0.

그림 넷을 `.playwright-mcp/batch2/` 에 찍는다. 1440 폭(창 1440×1000)과 390 폭(390px iframe 하나만 둔 감싸는 페이지), 라이트와 다크(`document.documentElement.setAttribute('data-theme','dark')`)다. 셋째 블록(빈 줄로 나뉜 두 묶음)과 아홉째 블록(넓은 표가 휴대폰에서 두 열로)을 담는다. 머리 메뉴가 가리면 `document.querySelectorAll('header, nav, .navbar').forEach(h => h.style.position = 'static')` 를 먼저 돌린다.

볼 것: 출력 영역이 코드 바로 아래 붙어 있고, 그 아래 본문 문단이 원래 순서로 이어진다. 지운 별도 블록 자리에 빈 코드 상자가 남지 않았다. 첫째, 둘째 블록의 출력 머리에 「시간은 돌릴 때마다 다르다」가 있다. 셋째 블록의 2단계 묶음은 빈 줄 없이 시작한다(묶음 맨 앞 빈 줄은 그리지 않는다). 서버를 끈다.

- [ ] **Step 7: 커밋**

````bash
git add posts/algorithm-hash-sort.md scripts/code-blocks-baseline.json
git commit -F - <<'EOF'
feat(posts): 알고리즘 글 — 해시와 정렬 글의 파이썬 블록 10개를 하는 일, 단계, 뜻 형식으로, 별도 출력 블록 10개는 블록 안으로

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

리뷰에서 블록 글을 고치게 되면 `posts/algorithm-hash-sort.md` 를 직접 고친다(도우미는 원본 블록에만 돈다). 고친 커밋의 제목도 `fix(posts): 알고리즘 글 — …` 으로 시작한다. Task 8 이 이 머리로 글 커밋을 찾아 하나로 합친다.

---

### Task 7: 나머지 네 편 블록 36개 옮기기

**Files:**
- Modify: `posts/algorithm-binary-search-stack.md` (10개), `posts/algorithm-tree-heap.md` (10개), `posts/algorithm-graph-search.md` (9개), `posts/algorithm-dp-greedy.md` (7개)
- Modify: `scripts/code-blocks-baseline.json`

**Interfaces:**
- Consumes: `$SCRATCH/migrate_batch2.py`(Task 6 이 만든 것. Step 1 이 없으면 계획에서 다시 뽑는다), 이 계획 부록 2~5 의 새 블록 36개
- Produces: 새 형식 블록 57개, 옛 형식 블록 190개(77편)

블록마다 상태 표시가 붙는 것은 tree-heap 의 2, 3, 4, 6번째와 graph-search 의 4, 5번째다(`# (앞 블록에 이어서 돌린다.)`, spec 8-1 의 「앞 블록에 이어서」 6개). tree-heap 첫 블록은 트리 그림 주석 4줄을 지우고 같은 내용을 2단계 풀이 글로 둔다(「이 계획에서 정한 것」).

- [ ] **Step 1: 네 편을 차례로 옮긴다**

도우미가 임시 폴더에 있는지 보고, 없으면 계획에서 다시 뽑는다.

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch2"; mkdir -p "$SCRATCH"
python3 - migrate_batch2.py <<'EOF'
import os, re, sys
name = sys.argv[1]
T = '`' * 4
plan = open('docs/superpowers/plans/2026-10-14-python-code-blocks-batch2.md', encoding='utf-8').read()
m = re.search(r'^<!-- file \$SCRATCH/' + re.escape(name) + r' -->\n' + T + r'[a-z]*\n(.*?)^' + T + r'\n', plan, re.S | re.M)
dest = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'code-steps-batch2', name)
if not os.path.exists(dest):
    open(dest, 'w', encoding='utf-8').write(m.group(1))
print(dest)
EOF
````

Run:

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch2"
for p in algorithm-binary-search-stack algorithm-tree-heap algorithm-graph-search algorithm-dp-greedy; do
  python3 "$SCRATCH/migrate_batch2.py" docs/superpowers/plans/2026-10-14-python-code-blocks-batch2.md posts "$p" || break
done
````

Expected: 네 줄

````text
algorithm-binary-search-stack: 블록 10개를 옮기고 별도 출력 블록 10개를 지웠습니다
algorithm-tree-heap: 블록 10개를 옮기고 별도 출력 블록 10개를 지웠습니다
algorithm-graph-search: 블록 9개를 옮기고 별도 출력 블록 9개를 지웠습니다
algorithm-dp-greedy: 블록 7개를 옮기고 별도 출력 블록 7개를 지웠습니다
````

`바꾸지 않고 멈춥니다` 가 나오면 거기서 멈추고 까닭 줄을 알린다. 앞서 옮긴 글은 그대로 둔다.

- [ ] **Step 2: 코드 줄과 블록 밖 글이 그대로인지 본다**

Run:

````bash
python3 - algorithm-binary-search-stack algorithm-tree-heap algorithm-graph-search algorithm-dp-greedy <<'EOF'
import re, subprocess, sys
PY = re.compile(r'^```python[^\n]*\n(.*?)^```[ \t]*$', re.S | re.M)
# 파이썬 블록과 바로 뒤 별도 출력 블록 한 쌍
PAIR = re.compile(r'^```python[^\n]*\n.*?^```[ \t]*\n\s*```[ \t]*\n.*?^```[ \t]*$', re.S | re.M)
code = lambda b: [l for l in b.split('\n') if l.strip() and not l.lstrip().startswith('#')]
fail = False
for post in sys.argv[1:]:
    old = subprocess.run(['git', 'show', f'HEAD:posts/{post}.md'], capture_output=True, text=True, check=True).stdout
    new = open(f'posts/{post}.md', encoding='utf-8').read()
    ob, nb = [m.group(1) for m in PY.finditer(old)], [m.group(1) for m in PY.finditer(new)]
    assert len(ob) == len(nb), (post, len(ob), len(nb))
    bad = [i for i, (a, b) in enumerate(zip(ob, nb)) if code(a) != code(b)]
    same = PAIR.sub('@', old) == PY.sub('@', new)
    left = len(PAIR.findall(new))
    print(f'{post}: 코드 줄이 바뀐 블록 {bad}, 블록 밖 글 {"같다" if same else "다르다"}, 파이썬 블록 바로 뒤 별도 출력 블록 {left}개')
    fail = fail or bool(bad or not same or left)
sys.exit(1 if fail else 0)
EOF
````

Expected: 네 편 모두 `코드 줄이 바뀐 블록 [], 블록 밖 글 같다, 파이썬 블록 바로 뒤 별도 출력 블록 0개` (네 줄)

- [ ] **Step 3: 실행 검사를 돌린다**

Run: `for p in algorithm-binary-search-stack algorithm-tree-heap algorithm-graph-search algorithm-dp-greedy; do python3 scripts/check-python-outputs.py --post "$p" | tail -1; done`
Expected: 차례로 `✓ 통과 10`, `✓ 통과 10`, `✓ 통과 9`, `✓ 통과 7` 로 시작하는 네 줄(건너뜀 0, 실패 0)

- [ ] **Step 4: 형식 검사, 말투 검사, 기준표**

Run: `node scripts/check-code-blocks.js | tail -1`
Expected: `✓ 새 형식 블록 57개, 옛 형식 블록 190개, 문제 0건`

Run: `node scripts/check-wording.js`
Expected: 종료 코드 0

Run: `node scripts/check-code-blocks.js --update`
Expected: `기준표를 다시 적었습니다 — 옛 형식 블록 190개, 글 77편`

- [ ] **Step 5: 커밋**

````bash
git add posts/algorithm-binary-search-stack.md posts/algorithm-tree-heap.md posts/algorithm-graph-search.md posts/algorithm-dp-greedy.md scripts/code-blocks-baseline.json
git commit -F - <<'EOF'
feat(posts): 알고리즘 글 — 이분 탐색, 트리와 힙, 그래프, DP 글의 파이썬 블록 36개를 하는 일, 단계, 뜻 형식으로, 별도 출력 블록 36개는 블록 안으로

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

리뷰에서 고치는 커밋도 `fix(posts): 알고리즘 글 — …` 으로 시작한다.

---

### Task 8: 둘째 묶음 확인과 올리기

**Files:** 없음 (확인, 커밋 합치기, push)

**Interfaces:**
- Consumes: Task 1~7 의 커밋
- Produces: 사용자 확인, 그 뒤 main 에 올린 둘째 묶음. 올리는 커밋은 계획 문서 1개, 검사와 화면 고침 5개(리뷰 고침이 있으면 더), 글 옮기기 1개다.

Step 1, 2 는 서브에이전트가, Step 3 부터는 컨트롤러가 직접 한다.

- [ ] **Step 1: CI 가 돌리는 검사를 로컬에서 모두 돌린다**

Run:

````bash
node scripts/validate-posts.js && node scripts/test-long-sentences.js && node scripts/check-design.js \
  && node scripts/check-wording.js && node scripts/check-course-data.js && node scripts/test-course-logic.js \
  && node scripts/check-course-pages.js && node scripts/check-code-blocks.js && node scripts/test-code-steps.js \
  && node scripts/test-check-code-blocks.js && python3 scripts/test-python-outputs.py \
  && python3 scripts/check-python-outputs.py && echo ALL-OK
````

Expected: 마지막 줄 `ALL-OK`. 그 위 줄들 가운데 `✓ 새 형식 블록 57개, 옛 형식 블록 190개, 문제 0건`, `89 통과, 0 실패`, `16 통과, 0 실패`, `17 통과, 0 실패`, `✓ 통과 57, 건너뜀 0 …`(torch 가 없으면 `통과 56, 건너뜀 1`)이 있다.

- [ ] **Step 2: 숫자로 재고 그림을 찍는다**

서버를 띄우고(백그라운드, 저장소 루트에서 `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch2"; python3 "$SCRATCH/nocache_server.py" "$(pwd)" 8771`. 서버 파일이 없으면 아래 명령으로 계획에서 다시 뽑는다) 아무 글이나 새 캐시로 연 뒤 아래 함수를 돌린다.

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch2"; mkdir -p "$SCRATCH"
python3 - nocache_server.py <<'EOF'
import os, re, sys
name = sys.argv[1]
T = '`' * 4
plan = open('docs/superpowers/plans/2026-10-14-python-code-blocks-batch2.md', encoding='utf-8').read()
m = re.search(r'^<!-- file \$SCRATCH/' + re.escape(name) + r' -->\n' + T + r'[a-z]*\n(.*?)^' + T + r'\n', plan, re.S | re.M)
dest = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'code-steps-batch2', name)
if not os.path.exists(dest):
    open(dest, 'w', encoding='utf-8').write(m.group(1))
print(dest)
EOF
````


````js
async () => {
  const POSTS = ['algorithm-hash-sort', 'algorithm-binary-search-stack', 'algorithm-tree-heap', 'algorithm-graph-search', 'algorithm-dp-greedy'];
  const f = document.createElement('iframe');
  f.style.cssText = 'position:absolute;left:-10000px;top:0;height:900px;border:0';
  document.body.appendChild(f);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const out = {};
  for (const w of [1440, 1280, 1024, 390]) {
    f.style.width = w + 'px';
    for (const id of POSTS) {
      await new Promise(r => { f.onload = r; f.src = `post.html?id=${id}&w=${w}&t=${Date.now()}`; });
      const d = f.contentDocument;
      for (let i = 0; i < 40 && !d.querySelector('.cb-row'); i++) await wait(250);
      await d.fonts.ready;
      await wait(700);
      const md = await (await fetch(`posts/${id}.md`)).text();
      const fences = [...md.matchAll(/^```python[^\n]*\n([\s\S]*?)^```[ \t]*$/gm)].map(m => m[1].replace(/\s+$/, ''));
      const cbs = [...d.querySelectorAll('.post-content .cb')];
      let overlap = 0;
      cbs.forEach(cb => cb.querySelectorAll('.cb-ln.has-note:not(.is-drop)').forEach(l => {
        if (l.querySelector('.cb-note').getBoundingClientRect().left < l.querySelector('.cb-t').getBoundingClientRect().right - 0.5) overlap++;
      }));
      // 블록 수, 원문과 같나, 출력 없는 블록, 바로 뒤 다른 코드 블록, 옆 넘침, 메모 겹침, 배치 빠짐, 용어 풀이와 수식
      out[`${id}@${w}`] = [
        cbs.length,
        cbs.every((cb, i) => cb.dataset.src === fences[i]),
        cbs.filter(cb => !cb.querySelector('.cb-out')).length,
        cbs.filter(cb => { const n = cb.nextElementSibling; return n && n.classList.contains('code-block-wrapper'); }).length,
        d.documentElement.scrollWidth > d.documentElement.clientWidth,
        overlap,
        cbs.filter(cb => [...cb.querySelectorAll('.cb-code')].some(c => c.style.getPropertyValue('--nc') === '')).length,
        d.querySelectorAll('.cb .demo-term, .cb .katex').length,
      ].join(' ');
    }
  }
  f.remove();
  return out;
}
````

Expected: 네 폭 모두 hash-sort, binary-search-stack, tree-heap 은 `"10 true 0 0 false 0 0 0"`, graph-search 는 `"9 true 0 0 false 0 0 0"`, dp-greedy 는 `"7 true 0 0 false 0 0 0"`(값 20개).

그림을 `.playwright-mcp/batch2/` 에 찍는다. 다섯 편을 1440 과 390 폭 라이트로 한 장씩(10장), hash-sort 와 graph-search 는 다크로도 한 장씩(4장)이다. 담을 블록은 아래와 같다.

| 글 | 블록 |
|---|---|
| algorithm-hash-sort | 첫째 (시간을 재는 블록, 머리의 「시간은 돌릴 때마다 다르다」) |
| algorithm-binary-search-stack | 여덟째 (괄호 짝, 두 묶음이 같은 2단계) |
| algorithm-tree-heap | 첫째 (그림 주석을 풀이 글로 옮긴 블록), 여섯째 (「앞 블록에 이어서」) |
| algorithm-graph-search | 둘째 (인접 행렬, 넓은 표) |
| algorithm-dp-greedy | 다섯째 (백트래킹, 들여쓴 찍힌 줄) |

서버를 끈다.

- [ ] **Step 3: 확인 페이지를 만든다** (컨트롤러)

첫 묶음처럼 비공개 artifact 한 장에 담는다. 바뀌는 것(글 다섯 편, 블록 46개, 별도 출력 블록 46개가 블록 안으로, 검사 고침), 그림, 검사 결과, 올리면 하는 일(커밋 수, 합치는 글 커밋, rebase, 고정한 `ubuntu-24.04` 에서 처음 도는 글 검사), 「이 계획에서 정한 것」 가운데 독자가 보는 것(트리 그림 주석, 안정 정렬 블록의 단계, 숫자 줄바꿈, 시간 재는 블록의 숫자)을 쓴다.

- [ ] **Step 4: 사용자 확인을 받는다** (컨트롤러)

그림과 함께 바뀐 것을 짧게 알린다. 고칠 곳을 말하면 그 태스크로 돌아가 고치고 Step 1 부터 다시 한다. 사용자가 올려도 된다고 하기 전에는 push 하지 않는다.

- [ ] **Step 5: 글 커밋을 하나로 합친다** (사용자 확인 뒤)

Run:

````bash
FIRST=$(git log --reverse --format=%H --fixed-strings --grep='(posts): 알고리즘 글 —' origin/main..HEAD | head -1)
BASE=$(git rev-parse "$FIRST^")
git log --format='%h %s' "$BASE..HEAD"
git diff --stat "$BASE" HEAD
````

Expected: `git log` 의 줄이 모두 `feat(posts): 알고리즘 글 —` 이나 `fix(posts): 알고리즘 글 —` 로 시작한다. `git diff --stat` 의 파일이 `posts/algorithm-*.md` 다섯과 `scripts/code-blocks-baseline.json` 뿐이다. 다른 커밋이 끼어 있으면 합치지 않고 두 커밋 그대로 올린다고 사용자에게 알린다.

Run:

````bash
TREE=$(git rev-parse 'HEAD^{tree}')
git reset --soft "$BASE"
git commit -F - <<'EOF'
feat(posts): 알고리즘 글 5편의 파이썬 블록 46개를 하는 일, 단계, 뜻 형식으로 — 블록 바로 아래의 별도 출력 블록 46개는 블록 안 출력 영역으로

해시와 정렬 10개, 이분 탐색과 스택 10개, 트리와 힙 10개, 그래프 탐색 9개, DP와 그리디 7개.
실행되는 코드 줄과 블록 밖 본문은 그대로다. 시간을 잰 블록 6개는 원래 적힌 숫자를 둔다.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
test "$(git rev-parse 'HEAD^{tree}')" = "$TREE" && echo '트리 같음'
````

Expected: `트리 같음`

- [ ] **Step 6: 올린다** (컨트롤러)

Run: `git fetch origin && git rebase origin/main && git status -sb | head -1 && git log --format='%h %ae %s' origin/main..HEAD`
Expected: 내 커밋만 있고 작성자가 모두 `37789148+chkimsu@users.noreply.github.com` 이다. 다른 세션의 커밋이 있으면 멈추고 알린다. rebase 로 들어온 커밋이 있으면 Step 1 의 검사를 다시 돌린다.

첫 묶음에서 자동 권한 검사가 `git push` 를 막았다. 사용자에게 프롬프트에 `! git push origin main` 을 입력해 달라고 부탁한다.

- [ ] **Step 7: 고정한 실행 환경의 첫 글 검사를 본다** (컨트롤러)

`validate.yml` 은 `runs-on: ubuntu-24.04` 로 고정돼 있다(`c6cd528`, origin/main 에 있다). 그 커밋은 workflow 파일만 바꿔 paths 필터에 걸리지 않았으니, 이 push 가 고정한 환경에서 처음 도는 Validate posts 다. 사용자와 이때 확인하기로 했다.

Run: `gh run list --workflow validate.yml --limit 1 --json databaseId,headSha,status` 로 push 한 커밋의 run id 를 찾고 `gh run watch <id> --exit-status`
Expected: 종료 코드 0. `actions/setup-python@v5` 의 3.9 설치 단계를 포함해 모든 단계에 ✓ 가 붙는다(`gh run watch` 출력에 단계마다 찍힌다). run 의 로그는 읽지 않는다(관리자 권한이 필요하고 로컬 gh 는 github.com 에 로그인돼 있지 않다). setup-python 단계가 실패하면 그 사실을 알리고, 어떻게 할지 사용자와 정한다(spec 7-2).

같은 커밋의 `Update sitemap.xml + feed.xml` 과 `pages-build-deployment` 도 `gh run watch <id> --exit-status` 로 끝까지 본다.

- [ ] **Step 8: 공개 블로그에서 본다** (컨트롤러)

페이지 배포가 끝나면 새 캐시로 `https://chkimsu.github.io/adtech-blog/post.html?id=algorithm-hash-sort` 를 열고, 다섯 편을 숨긴 iframe 으로 차례로 열어 `.post-content .cb` 수(10, 10, 10, 9, 7)와 콘솔 오류 0 을 확인한다.

---

