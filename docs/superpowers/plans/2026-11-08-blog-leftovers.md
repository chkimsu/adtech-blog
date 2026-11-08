# 블로그 나머지 일 다섯 가지 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 묶음 1~4 검토가 남긴 후속 일 다섯 가지를 닫아 블로그 전체의 남은 경고를 0 으로 만든다. 생성기 검사 구멍 둘, 옛 데크의 정적 점, 어색한 낱말 182곳, 옛 글의 80자 넘는 문장 26개, 짧은 절 3곳이다.

**Architecture:** 브랜치 `chore/blog-leftovers` 하나에서 Task 여섯으로 고친다. 검사 코드(생성기 둘)와 데크를 먼저 고치고, 낱말은 파일 묶음 셋으로 나눠 고친다. 낱말을 바꾸면 문장이 길어질 수 있어 긴 문장과 짧은 절은 맨 뒤 Task 가 닫는다. 파이썬의 찍힌 출력, 글의 숫자, 글이 말하는 내용은 바꾸지 않는다.

**Tech Stack:** 마크다운 글(`posts/*.md`), vanilla JS 카드 데크(`js/*-demo.js`, `css/style.css`), Python 3.9 표준 라이브러리 생성기(`scripts/gen-*.py`, `ast`), 검사 스크립트(`scripts/check-*.js`, `scripts/check-python-outputs.py`).

**Spec:** 따로 없다. 묶음 1~4 의 검토가 장부에 남긴 후속 일 다섯 가지가 요구 사항이고, 아래 「정한 것」과 각 Task 에 옮겨 적었다. 판정은 이 계획서를 근거로 한다.

**시작 조건:** main `05e8e48`(묶음 4 병합 뒤 sitemap 봇 커밋)에서 `chore/blog-leftovers` 를 만든다. 첫 커밋은 이 계획서다(컨트롤러).

**시작 확인 (2026-11-08):**

| 무엇 | 센 명령 | 값 |
|---|---|---|
| 어색한 낱말 | `node scripts/check-wording.js` | 182곳, 82개 파일(글 56개 127곳, 글 밖 26개 55곳) |
| 80자 초과 문장 | `node scripts/check-content-standard.js <글 전부>` | 26개, 14편 |
| 짧은 섹션 | 같은 명령 | 3개, 2편(algorithm-coding-test-toolkit 2, adtech-dev-layers 1) |
| 정적 점을 `class="dot"` 으로 그린 데크 | `grep -nE 'class="dot' js/*.js` 에서 움직이지 않는 원 | 2개(`js/profile-cards-demo.js`, `js/causal-cards-demo.js`) |
| 생성기 검사 | `python3 scripts/gen-copy-data.py --check`, `python3 scripts/gen-ads-data.py --check` | 「대조 30건」, 「대조 133건」. 다시 대입 검사는 없다 |

## 이 계획에서 정한 것

1. **승인.** 사용자 2026-11-08 「모두 진행해줘」. 계획서를 쓰고 바로 진행한다. 병합과 push 는 브랜치 전체 검토를 통과한 뒤 사용자에게 묻는다. 11-08 의 「묻지 않고 병합」 승인은 묶음 3, 4 에만 걸렸다.
2. **바꾸지 않는 것.** 파이썬 블록의 찍힌 출력, 글의 숫자, 기록 파일(`data/llm-records/`)과 블록의 `RECORD =`, `USAGE =` 줄, 논문과 문서의 원제, 「」 와 따옴표 안의 대사. 낱말을 고치려면 찍힌 출력이 바뀌어야 하는 자리는 고치지 않고 보고서에 남긴다.
3. **어색한 낱말은 뜻으로 고친다.** 범위는 `node scripts/check-wording.js --list awkward` 의 182곳이다. 같은 낱말의 다른 활용(얹힌, 견주어, 훑으면 같은 꼴)도 그 파일을 고칠 때 같이 고친다. 「가리키다」처럼 다른 낱말은 고치지 않는다.

   | 낱말 | 그 자리의 뜻 | 바꿀 말 |
   |---|---|---|
   | 얹다 | 위에 더하다 | 추가하다, 더하다, 붙이다, 올리다 |
   | 가리다 | 덮어서 안 보이게 하다 | 숨기다, 안 보이게 하다 |
   | 가리다 | 둘 이상을 구분하다 | 구분하다, 고르다, 판별하다 |
   | 굳은 | 바뀌지 않는 | 고정된 |
   | 품다 | 안에 두다, 맡다 | 담다, 포함하다, 처리하다 |
   | 줄을 세우다, 순으로 세우다 | 순서대로 놓다 | 정렬하다, 순위를 매기다 |
   | 견주다 | 비교하다 | 비교하다 |
   | 훑다 | 처음부터 끝까지 보다 | 스캔하다, 살펴보다, 순회하다(코드) |
   | 실어 보내다, 실려 오다 | 담아서 보내다 | 담아 보내다, 담겨 오다 |

4. **기준표.** 낱말 Task 마다 끝에 `node scripts/check-wording.js --update` 로 기준표를 줄인다. Task 5 뒤 기준표의 `awkward` 는 빈 객체다. 해요체 8곳(5개 파일)은 모두 HTML 과 JS 안의 큰따옴표 대사라 이 계획 밖이다.
5. **긴 문장은 맨 뒤.** Task 1~5 는 80자 초과 문장 수(26)를 늘리지 않는다. 늘면 그 Task 안에서 나눈다. Task 6 이 남은 것을 0 으로 만든다.
6. **생성기 검사의 범위.** 묶음 3 minor 묶음이 적은 두 구멍(카피 생성기의 ASSETS 가 뒤 블록에서 다시 대입되는 것, 광고 생성기의 공용 정의가 `+=` 와 함수 안에서 바뀌는 것)을 닫는다. 같은 김에 공용 이름이 가리키는 객체를 고치는 줄(첨자 대입, 속성 대입, 목록과 사전과 집합의 고치는 메서드)도 잡는다. 함수 안에서 `global` 없이 같은 이름에 대입하는 것은 지역 이름이라 잡지 않는다. 다른 이름을 거친 고침(별칭, 함수 인자, `globals()`)은 잡지 않고 docstring 에 한계로 적는다. `scripts/gen-training-data.py` 의 docstring 에 적은 한계와 같은 꼴이다.
7. **정적 점.** 움직이지 않는 점은 `.dot` 대신 새 클래스 `.pt`(배경색 테두리 1.5px)와 채움 클래스(`f-k`, `f-a`, `f-b`, `f-c`)로 그린다. `.dot` 은 움직임 줄이기 설정에서 숨는 움직이는 점 전용으로 남긴다. `.pt` 는 2026-11-08 에 `css/`, `js/`, `demo-*.html` 에서 쓰지 않는 이름이었다.
8. **짧은 절은 글 안의 사실로 채운다.** 절의 표나 목록을 읽는 법과 까닭을 풀어 300자를 넘긴다. 새 숫자와 새 바깥 주장을 넣지 않는다.

## Global Constraints

- 글 산문은 합쇼체(`~입니다`, `~합니다`), 코드 블록 안 주석은 평서체(`~한다`). 1인칭은 「저」(「내」, 「저희」 금지).
- 가운뎃점 없음(쉼표). 비유 없음. 낱말 `실측`, `실체`, `축`(그래프 축 제외), `가른다`, `갈린다` 없음. 이모지와 장식 글자 없음. 해요체 없음.
- 문장 80자 상한. 「」 인용 안의 문장, 글머리표, 참고문헌, posts.js 의 excerpt, worldNote, worldPractical, 데크 캡션과 메타 설명까지 잰다. 원제가 그 자체로 80자를 넘는 줄만 예외.
- 표준 용어를 순한글로 바꾸지 않는다. 지금까지 돌려보낸 말은 횟수 몫, 가운데값, 지어낸 답, 끝 상태, 처음 중심, 칸(필드를 가리킬 때), 컨텍스트 창, 값 모델이다.
- 수필 동사를 새로 쓰지 않는다. 위 표의 낱말과 「드러나다」, 「어긋나다」, 「통째로」, 「~인 셈이다」를 새 문장에 넣지 않는다.
- 파이썬 블록이 있는 글을 고치면 `python3 scripts/check-python-outputs.py --post <slug>` 가 통과해야 한다. 고친 글이 데크를 실으면 데크 iframe 이 뜨는지 본다.
- 기준표(`scripts/wording-baseline.json`, `scripts/code-blocks-baseline.json`)를 늘리지 않는다.
- 회사 안 시스템 이름, 숫자, 문장, 사람 이름은 어디에도 넣지 않는다. 커밋 전에 `grep -rnE "$(grep -v '^#' $NAMES_FILE | tr '\n' '|' | sed 's/|$//')" posts/ docs/ js/ data/ scripts/ css/ *.html` 이 출력 없이 끝나야 한다(대소문자 구분). `NAMES_FILE` 은 저장소 밖 이름 목록이고 컨트롤러가 디스패치에 적는다. 목록의 줄은 ERE 대안이라 `grep -F -f` 로는 세지 않는다. 16진수 색 코드 안의 글자가 걸리면 `sed -E 's/#[0-9A-Fa-f]{6}//g'` 로 색 코드를 지우고 다시 센다.
- 커밋은 저장소의 기존 커밋과 같은 계정(`chkimsu <37789148+chkimsu@users.noreply.github.com>`)으로, 파일을 하나씩 명시한다. `git add -A` 금지. 메시지는 한국어 conventional commit. 꼬리는 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`(Sonnet 구현자는 `Claude Sonnet 5.5`). push 하지 않는다.
- 파이썬은 `PYTHONDONTWRITEBYTECODE=1` 로 돌리고, 시험용 사본과 스크린샷은 저장소 밖에 둔다. 표준 모듈 이름(`math.py` 같은)으로 임시 파일을 만들지 않는다.
- 각 Task 의 「검사 전부」 단계는 아래를 모두 뜻한다.
  - CI 단계 전부: `( grep -E "^[[:space:]]+run: " .github/workflows/validate.yml | sed -E 's/^[[:space:]]*run: //; s/^python /python3 /' | while read -r c; do echo "== $c"; eval "$c" || exit 1; done )` 가 끝까지 통과.
  - 내용 표준: `node scripts/check-content-standard.js $(node -e "const {posts}=require('./js/posts.js');console.log(posts.map(p=>p.id).join(' '))") | grep -E '⚠|✗'` 의 줄 수와 80자 초과 문장 합이 Task 시작 때보다 늘지 않음. Task 6 뒤에는 출력 없음.
  - 색인: `node scripts/build-search-index.js` 를 돌려 `search-index.json` 이 바뀌면 같은 커밋에 넣는다.
  - 이름 grep 출력 없음.

## 모델 나누기 (컨트롤러가 디스패치마다 적용)

| 역할 | 모델 |
|---|---|
| Task 1(생성기 검사) 구현과 검토 | Opus |
| Task 2(데크의 정적 점) 구현과 검토 | Sonnet |
| Task 3~5(어색한 낱말) 구현 | Opus |
| Task 3~5 검토 | Sonnet |
| Task 6(긴 문장과 짧은 절) 구현과 검토 | Opus |
| 고침 뒤 재검토 | Sonnet. 산문만 고친 라운드와 스크립트로 다 확인되는 고침은 컨트롤러가 확인한다 |
| 마지막 브랜치 전체 검토 | Fable |

## Review Focus

- **뜻이 바뀐 낱말 교체.** 「가리다」는 두 뜻이고, 「품다」, 「얹다」도 자리마다 맞는 말이 다르다. Task 3~5 의 보고서가 자리마다 고른 뜻을 적고(각 Task 의 보고 단계), 검토자가 문장을 앞뒤와 함께 읽는다.
- **교체나 나누기로 생긴 조사 오류와 80자 초과.** 「얹은」을 「추가한」으로 바꾸면 앞의 조사가 맞는지 다시 봐야 한다. 각 Task 의 「검사 전부」가 80자 초과 수를 세고, 보고서에 바꾼 문장 전체를 싣는다.
- **코드 블록 안 글자를 바꿔 찍힌 출력이 달라지는 것.** 파이썬 블록이 있는 글은 Task 마다 `check-python-outputs.py --post <slug>` 를 돌린다(Task 3~6 의 검사 단계).
- **새 검사가 지금 글을 잘못 실패로 치는 것.** 광고 생성기의 공용 이름(`counts`, `TEXT`, `POOL`, `WORDS`)은 흔한 이름이다. Task 1 의 시연에 함수 안 지역 이름 경우를 넣고, 지금 트리에서 대조 수가 그대로인지 본다.
- **정적 점 고침이 다른 자리의 점을 잃게 하는 것.** Task 2 가 저장소 전체를 찾아 움직이는 점과 정적 점을 나누고, 움직임 줄이기 설정의 라이트와 다크에서 찍는다.

---

### Task 1: 생성기 둘의 다시 대입 검사

**Files:**
- Modify: `scripts/gen-copy-data.py`(docstring 의 `--check` 설명, 검사 함수 추가, `check()` 연결)
- Modify: `scripts/gen-ads-data.py`(같은 셋)
- Read only: `scripts/gen-training-data.py` 의 `name_writes`, `alias_lines`, `rebind_errors`, docstring 의 한계 문단. `scripts/gen-ranker-data.py` 의 `name_writes`, `rebind_errors`.

**Interfaces:**
- Consumes: 카피 생성기의 `POST`, `LATER`, `SHARED`, `JUDGE_SHARED`, `JUDGE_POST`. 광고 생성기의 `SHARED`, `ANCHORS`, `FENCE`, `definitions()`, `shared_errors()` 의 글 고르기(ANCHORS 정의나 「KEYWORDS = [」 리터럴이 있는 글).
- Produces: 두 `--check` 가 지킬 이름을 정의 밖에서 바꾸는 줄을 만나면 1 로 끝나고 `posts/<slug>: 파이썬 N번째 블록 M번째 줄이 <이름> 을 정의 밖에서 바꿉니다(<꼴>)` 꼴의 줄을 찍는다. 통과 줄은 지금 문장에 「python 블록 K개에 정의 밖에서 공용 이름을 바꾸는 줄이 없고」 꼴을 더한다. 대조 수(30건, 133건)는 그대로다.

지킬 이름과 글:

| 생성기 | 글 | 이름 |
|---|---|---|
| 카피 | `POST` 와 `LATER` 의 글 | `ASSETS`, 그 글이 정의한 `SHARED` 의 이름 |
| 카피 | `JUDGE_POST` | `JUDGE_SHARED` 의 이름 |
| 광고 | `shared_errors()` 가 고르는 글 | 그 글이 정의한 `SHARED` 의 이름 |

잡는 꼴(정한 것 6):
- 맨 위 수준에서 지금 대조하는 정의 문장 밖의 묶기. `+=` 같은 증강 대입, 주석 달린 대입, `for` 와 `with` 의 대상, `import ... as`, `del`, `:=`, 그리고 맨 위 수준의 `if`, `for`, `while`, `try`, `with` 안에 든 대입과 `def`.
- 카피 생성기의 `ASSETS` 는 리터럴 머리 줄(줄 맨 앞의 「ASSETS = [」)에서 시작하는 문장 하나만 정의다. 그 밖의 `ASSETS = ...` 는 블록과 위치에 상관없이 잡는다.
- 함수 안에서 `global <이름>` 을 쓴 뒤의 묶기.
- 모듈의 그 이름이 가리키는 객체를 고치는 줄. `<이름>[...] =`, `<이름>.x =`, `del <이름>[...]`, `<이름>.append(...)` 처럼 고치는 메서드(`append`, `extend`, `insert`, `remove`, `pop`, `clear`, `sort`, `reverse`, `update`, `setdefault`, `popitem`, `add`, `discard`). 다만 그 함수 안에서 같은 이름이 지역 이름(인자이거나 `global` 없이 대입)이면 잡지 않는다.

- [ ] **Step 1: 지금 출력 적기** — Run: `PYTHONDONTWRITEBYTECODE=1 python3 scripts/gen-copy-data.py --check; PYTHONDONTWRITEBYTECODE=1 python3 scripts/gen-ads-data.py --check` Expected: 둘 다 exit 0, 「대조 30건(프롬프트 파일 4, 기록 4, 글의 ASSETS 리터럴 1, 글의 공용 정의 13, 판정 글의 공용 정의 8)」과 「대조 133건(데이터 파일 1, 글의 KEYWORDS 리터럴 4, 글 9편의 공용 정의 118, 프롬프트 파일 5, 기록 5)」. 보고서에 그대로 옮긴다.
- [ ] **Step 2: 결함을 심을 사본** — `W=$(mktemp -d)` 에 `git archive HEAD | tar -x -C "$W"`. 아래 일곱 경우를 사본의 글 끝에 python 블록 하나로 하나씩 더한다(경우마다 새 사본이나 되돌리기).

  | 경우 | 글 | 더할 블록 | 새 검사 |
  |---|---|---|---|
  | c1 | `posts/grounded-ad-copy-generation.md` | `ASSETS = ASSETS[:5]` | 실패 |
  | c2 | 같은 글 | `def f():`, 다음 줄 `    ASSETS.append(('x99', 'a'))` | 실패 |
  | c3 | `posts/generated-copy-judging-system.md` | `HUMAN \|= {}`(`JUDGE_SHARED` 의 사전 리터럴. 맨 위 수준의 첨자 대입은 지금 `definitions()` 가 정의로 이어 붙여 이미 잡히므로 증강 대입을 쓴다) | 실패 |
  | a1 | `shared_errors()` 가 고르는 글 하나 | `KEYS += ['x']` | 실패 |
  | a2 | 같은 글 | `def g():`, `    global POOL`, `    POOL = []` | 실패 |
  | a3 | 같은 글 | `def h():`, `    TENDENCY['x'] = 1` | 실패 |
  | n1 | 같은 글 | `def k():`, `    counts = {}`, `    counts['a'] = 1`, `    return counts` | 통과 |

- [ ] **Step 3: 옛 검사로 돌리기** — 사본에서 경우마다 두 생성기의 `--check`. Expected: c1~a3 이 모두 exit 0(구멍이 있다는 증거). 경우마다 한 줄씩 보고서에.
- [ ] **Step 4: 검사 함수 만들기** — 두 파일에 각각 `def rebind_errors(slug, text, names) -> tuple[list[str], int]` 를 둔다(틀린 줄 목록, 본 python 블록 수). 이름 찾기는 `gen-training-data.py` 의 `name_writes` 처럼 `ast` 노드 꼴을 돌려주게 하고, 위 「잡는 꼴」대로 범위(맨 위, 함수, `global`)를 본다. 두 생성기는 지금처럼 따로 선 파일이라 함수를 각 파일에 둔다. 읽지 못한 블록은 지금 `shared_errors()` 처럼 실패로 알린다. `check()` 의 통과 줄과 docstring 의 `--check` 설명에 새 대조를 더하고, docstring 에 잡지 않는 길(별칭, 함수 인자로 넘겨 고치기, `globals()`, 다른 이름의 메서드 호출)을 한 문단으로 적는다.
- [ ] **Step 5: 새 검사로 돌리기** — 사본에서 c1~a3 은 exit 1 과 그 경우를 가리키는 줄 하나, n1 은 exit 0. 되돌린 사본은 exit 0. 일곱 경우의 명령과 출력 줄을 보고서에.
- [ ] **Step 6: 실제 트리** — Step 1 의 명령. Expected: 둘 다 exit 0, 대조 수 30건과 133건 그대로, 통과 줄에 새 문구.
- [ ] **Step 7: 검사 전부** — Global Constraints 의 「검사 전부」. Expected: 모두 통과.
- [ ] **Step 8: 커밋** — `scripts/gen-copy-data.py`, `scripts/gen-ads-data.py`. `fix(scripts): 카피와 광고 생성기 검사가 정의 밖의 다시 대입과 고침을 잡는다`.

### Task 2: 옛 데크의 정적 점

**Files:**
- Modify: `css/style.css`(`.dot` 규칙 바로 뒤에 `.pt` 한 줄)
- Modify: `js/profile-cards-demo.js`(감쇠 곡선의 점), `js/causal-cards-demo.js`(`dot` 도우미)
- Modify: Step 1 이 더 찾은 정적 점의 파일

**Interfaces:**
- Consumes: `css/style.css` 의 `.f-k`, `.f-a`, `.f-b`, `.f-c`, `--bg-primary`.
- Produces: `.pt { stroke: var(--bg-primary); stroke-width: 1.5; }`. 정적 점은 `class="pt f-<색>"`.

- [ ] **Step 1: 저장소 전체 찾기** — Run: `grep -rnE 'class="dot|class=\\"dot|dot \$\{' js/ posts/ demo-*.html *.html` 와 `grep -rn "dots(" js/*.js`. 원마다 움직이는지(같은 `<circle>` 안 `animateMotion`, 또는 `js/card-kit.js` 의 `dots()`) 정적인지 표로 적는다. Expected: 정적은 `js/profile-cards-demo.js` 와 `js/causal-cards-demo.js` 둘. 더 나오면 같이 고친다.
- [ ] **Step 2: 고치기 전 화면** — 로컬 `python3 -m http.server` 와 Playwright 로 `demo-profile-cards.html` 과 `demo-causal-cards.html` 을 연다. 움직임 줄이기를 켜고(`page.emulateMedia({reducedMotion: 'reduce'})`) 정적 점 원의 `getComputedStyle(el).display` 를 센다. Expected: 정적 점이 모두 `none`.
- [ ] **Step 3: 고치기** — `.pt` 한 줄을 더하고 정적 원의 클래스를 `dot <색>` 에서 `pt f-<색>` 으로 바꾼다. 반지름과 좌표는 그대로 둔다. 움직이는 점은 건드리지 않는다.
- [ ] **Step 4: 고친 뒤 화면** — Step 2 를 다시. Expected: 정적 점이 모두 보이고(`display` 가 `none` 이 아님) 개수가 고치기 전 원 수와 같음. 라이트와 다크, 1280 과 375 로 찍고, 움직임 줄이기를 끈 화면이 고치기 전과 같아 보이는지 본다. 두 데크를 싣는 글(`user-profile-features`, `difference-in-differences`, `instrumental-variables`, `rct-randomized-experiment` 와 Step 1 이 찾은 글)에서 카드 iframe 이 뜨는지 본다.
- [ ] **Step 5: 검사 전부** — Global Constraints 의 「검사 전부」. Expected: 모두 통과(`check-design.js` 포함).
- [ ] **Step 6: 커밋** — 고친 파일을 이름으로. `fix(demos): 옛 데크 둘의 정적 점이 움직임 줄이기 설정에서도 보이게`.

### Task 3: 어색한 낱말 — 글 앞쪽 29개 파일(64곳)

**Files:** `posts/` 의 이 29개. ad-log-system(1), ad-serving-flow(1), algorithm-graph-search(1), algorithm-tree-heap(1), api-basics(1), api-kinds-and-contracts(4), audience-and-segments(1), batch-vs-realtime-inference(2), calibration(1), contextual-targeting(4), ctr-feature-engineering(1), deep-ctr-models(3), distributed-training(1), doubly-robust(1), elasticsearch-hybrid-retrieval(1), embedding-table-ops(4), embeddings-vector-search(2), feature-store-serving(1), feedback-loop-bias(13), feedback-loop-remedies(10), gateway-ingress-router(1), git-practical-guide(1), hadoop-hive-basics(1), hadoop-hive-spark-roles(1), inference-server(1), interest-classification(2), interview-ml-modeling(1), kafka-log-pipeline(1), kakao-ads-prediction-targeting(1). 괄호는 기준표의 수다.

**Interfaces:**
- Consumes: 정한 것 3 의 표.
- Produces: 이 29개 파일의 어색한 낱말 0, 줄어든 기준표.

- [ ] **Step 1: 자리 뽑기** — Run: `node scripts/check-wording.js --list awkward` 에서 위 파일의 줄. Expected: 64줄.
- [ ] **Step 2: 같은 낱말의 다른 활용 찾기** — Run: `grep -nE '얹|견주|훑|품[고은어으]|굳[은어]|실어 |실려 |줄을 세|순으로 세' <29개 파일>`. 어색한 뜻인 자리만 Step 3 에 더한다.
- [ ] **Step 3: 고치기** — 자리마다 문장을 앞뒤와 함께 읽고 정한 것 3 의 표에서 뜻에 맞는 말을 고른다. 조사와 어미를 새 낱말에 맞춘다. 코드 블록 안이면 주석과 찍히지 않는 글만 고친다. 찍히는 글이면 정한 것 2 대로 두고 보고서에 남긴다.
- [ ] **Step 4: 낱말 검사와 기준표** — Run: `node scripts/check-wording.js --list awkward | grep -cE '^posts/(ad-log-system|ad-serving-flow|algorithm-graph-search|algorithm-tree-heap|api-basics|api-kinds-and-contracts|audience-and-segments|batch-vs-realtime-inference|calibration|contextual-targeting|ctr-feature-engineering|deep-ctr-models|distributed-training|doubly-robust|elasticsearch-hybrid-retrieval|embedding-table-ops|embeddings-vector-search|feature-store-serving|feedback-loop-bias|feedback-loop-remedies|gateway-ingress-router|git-practical-guide|hadoop-hive-basics|hadoop-hive-spark-roles|inference-server|interest-classification|interview-ml-modeling|kafka-log-pipeline|kakao-ads-prediction-targeting)\.md'` → `0`. 그다음 `node scripts/check-wording.js --update` 와 `node scripts/check-wording.js` → 통과, 어색한 낱말 118.
- [ ] **Step 5: 출력 검사** — 고친 글 가운데 파이썬 블록이 있는 글마다 `PYTHONDONTWRITEBYTECODE=1 python3 scripts/check-python-outputs.py --post <slug>`. Expected: 모두 통과.
- [ ] **Step 6: 검사 전부** — Global Constraints 의 「검사 전부」. Expected: 모두 통과, 80자 초과 합 26 이하.
- [ ] **Step 7: 보고** — 보고서에 자리마다 한 줄: 파일과 줄, 고치기 전 문장, 고친 뒤 문장, 고른 뜻. 남긴 자리는 까닭과 함께.
- [ ] **Step 8: 커밋** — 고친 글, `scripts/wording-baseline.json`, 바뀌었으면 `search-index.json`. `fix(posts): 글 29편의 어색한 낱말을 표준 낱말로`.

### Task 4: 어색한 낱말 — 글 뒤쪽 27개 파일(63곳)

**Files:** `posts/` 의 이 27개. kakao-ads-products(1), llm-as-a-judge(3), llm-cost-cache-nondeterminism(1), llm-first-call(3), llm-model-selection(2), log-hops-to-kafka(3), lookalike-basics(6), lookalike-computation(13), model-api-from-training-script(1), model-monitoring(1), model-serving-architecture(2), multi-task-learning(2), natural-language-audience(1), online-learning-delayed-feedback(1), pCVR-modeling(1, id 는 pcvr-modeling), pctr-prediction(2), pcvr-based-targeting(3), pipeline-push-and-pull(1), position1-pairwise-ltr(1), rag-basics(1), regression-discontinuity(1), serving-latency-throughput(1), structured-output(2), targeting-basics(2), two-tower-retrieval(5), ucb-family(1), ucb_ts(2).

**Interfaces:** Task 3 과 같다. 이 Task 뒤 어색한 낱말은 55.

- [ ] **Step 1~8:** Task 3 과 같은 차례다. 다른 점은 파일 목록, Step 1 의 63줄, 커밋 메시지 `fix(posts): 글 27편의 어색한 낱말을 표준 낱말로`, 그리고 Step 4 의 명령과 남은 수다. Step 4 는 `node scripts/check-wording.js --list awkward | grep -cE '^posts/(kakao-ads-products|llm-as-a-judge|llm-cost-cache-nondeterminism|llm-first-call|llm-model-selection|log-hops-to-kafka|lookalike-basics|lookalike-computation|model-api-from-training-script|model-monitoring|model-serving-architecture|multi-task-learning|natural-language-audience|online-learning-delayed-feedback|pCVR-modeling|pctr-prediction|pcvr-based-targeting|pipeline-push-and-pull|position1-pairwise-ltr|rag-basics|regression-discontinuity|serving-latency-throughput|structured-output|targeting-basics|two-tower-retrieval|ucb-family|ucb_ts)\.md'` → `0`, 기준표를 줄인 뒤 어색한 낱말 55. 기록을 재생하는 글(llm-*, natural-language-audience, interest-classification 같은 글)의 `RECORD =` 줄과 찍힌 줄은 낱말 검사가 세지 않으므로 건드리지 않는다.

### Task 5: 어색한 낱말 — 글 밖 26개 파일(55곳)

**Files:** demo-api-course.html(1), demo-bfs-dfs.html(1), demo-data-model-cards.html(2), demo-distributed-cards.html(1), demo-feedback-loop.html(5), demo-hadoop-boxes.html(1), demo-http-methods.html(1), demo-judge-cards.html(2), demo-kafka-partition.html(1), demo-lookalike-batch-cards.html(1), demo-lookalike-ratio.html(4), demo-metrics-lab.html(1), demo-pcvr-target-cards.html(1), demo-serving-cards.html(1), demo-targeting-cards.html(1), demos.html(1), js/contextual-cards-demo.js(1), js/course-data.js(1), js/demo-edu-content.js(6), js/ecosystem-easy.js(1), js/hadoop-boxes-demo.js(1), js/hadoop-cards-demo.js(1), js/inference-cards-demo.js(1), js/interest-cards-demo.js(1), js/posts.js(16), js/stats-cards-demo.js(1).

**Interfaces:** Task 3 과 같다. 이 Task 뒤 어색한 낱말은 0, 기준표의 `awkward` 는 `{}`.

- [ ] **Step 1~3:** Task 3 의 Step 1~3 과 같다(Step 1 은 55줄). 데크 SVG 의 글자를 바꾸면 길이가 바뀌므로 viewBox 안에 머무는지 본다.
- [ ] **Step 4: 낱말 검사와 기준표** — `node scripts/check-wording.js --update` 뒤 `node scripts/check-wording.js` → 통과, 「어색한 낱말 0」. `node -e "console.log(JSON.stringify(require('./scripts/wording-baseline.json').awkward))"` → `{}`.
- [ ] **Step 5: 필드와 페이지 문장** — posts.js 를 고친 엔트리마다 excerpt, worldNote, worldPractical 의 80자: `node -e "const {overLong}=require('./scripts/check-content-standard.js');const {posts}=require('./js/posts.js');let n=0;for(const p of posts)for(const f of ['excerpt','worldNote','worldPractical'])for(const s of overLong(p[f]||'')){n++;console.log(p.id,f,s.length)}console.log('80자 초과',n)"` → `80자 초과 0`. `node scripts/check-page-sentences.js`, `node scripts/check-course-data.js` 통과. 고친 데크는 1280 과 375 에서 글자가 viewBox 안에 있는지 찍어 본다.
- [ ] **Step 6~8:** Task 3 의 Step 6~8 과 같다. 커밋 메시지 `fix(demos): 데크, 놀이터, 글 목록의 어색한 낱말을 표준 낱말로`.

### Task 6: 옛 글의 80자 넘는 문장과 짧은 절

**Files:**
- Modify: `posts/` 의 position1-pairwise-ltr, model-api-from-training-script, dcn-vs-din-slot, din-architecture, two-tower-training, inference-server, data-engineer-first-six-months, algorithm-coding-test-toolkit, offline-metrics-gauc, header-bidding, second-price-auction, rct-randomized-experiment, pCVR-modeling(id pcvr-modeling), mab-summary, adtech-dev-layers. Task 1~5 뒤 새로 걸린 글이 있으면 그 글도.

**Interfaces:**
- Consumes: Task 3~5 가 고친 글.
- Produces: 글 전부에서 `check-content-standard` 의 ⚠ 와 ✗ 0, 요약 「표준 충족 140 / 140편」.

- [ ] **Step 1: 자리 뽑기** — Run: `node scripts/check-content-standard.js $(node -e "const {posts}=require('./js/posts.js');console.log(posts.map(p=>p.id).join(' '))") | grep -B3 -E '⚠|✗'`. Expected: 80자 초과 26개(Task 1~5 가 늘리지 않았다면)와 짧은 섹션 셋 — algorithm-coding-test-toolkit 의 「문제를 읽고 바로 고르는 표」와 「7. 제출 전에 세 가지」(167자), adtech-dev-layers 의 「5. 입찰 최적화 — 얼마에 입찰할까」(295자).
- [ ] **Step 2: 긴 문장 나누기** — 문장마다 한 생각씩 80자 이하로 나눈다. 숫자, 링크, 용어, 말투는 그대로 둔다. 글머리표는 그 항목 안에서 나누고, 긴 「」 인용은 인용 둘로 나눈다.
- [ ] **Step 3: 짧은 절 채우기** — 절마다 산문이 300자를 넘게 문단을 더한다. 「문제를 읽고 바로 고르는 표」는 표를 어떻게 읽어 문제 유형을 고르는지, 「7. 제출 전에 세 가지」는 세 가지를 왜 보는지, 「5. 입찰 최적화」는 그 절이 글의 다른 절과 어떻게 이어지는지를 글 안의 사실로 쓴다. 새 숫자와 새 바깥 주장은 넣지 않는다(정한 것 8).
- [ ] **Step 4: 출력 검사** — 고친 글 가운데 파이썬 블록이 있는 글마다 `check-python-outputs.py --post <slug>`. Expected: 모두 통과.
- [ ] **Step 5: 검사 전부** — Global Constraints 의 「검사 전부」. Expected: 모두 통과. 내용 표준 grep 은 출력 없음. `node scripts/check-content-standard.js` 의 요약 끝 줄이 「표준 충족 140 / 140편」.
- [ ] **Step 6: 보고** — 나눈 문장마다 전과 후, 짧은 절마다 더한 문단 전체와 그 사실이 글의 어디에서 왔는지.
- [ ] **Step 7: 커밋** — 고친 글을 이름으로, 바뀌었으면 `search-index.json`. `fix(posts): 옛 글의 80자 넘는 문장 26개를 나누고 짧은 절 셋을 채운다`.

## 브랜치 끝 (컨트롤러)

1. 브랜치 전체 검토(Fable). 범위는 `05e8e48..HEAD`. 지적이 있으면 고침 한 번과 범위 재검토.
2. 사용자에게 병합과 push 를 묻는다(정한 것 1). 승인되면 main 에 빨리 감기 병합과 push, 그 뒤 Validate posts, sitemap 봇, Pages 배포가 success 인지 보고 공개 주소에서 고친 글 몇 편을 연다. 봇 커밋이 생기면 로컬 main 을 `git merge --ff-only origin/main` 으로 맞춘다.
3. 장부를 저장소 밖 백업 폴더로 옮기고 작업 폴더와 브랜치를 지운다.
