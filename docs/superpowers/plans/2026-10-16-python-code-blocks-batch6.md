# 파이썬 코드 블록 개편 — 여섯째 묶음 실행 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ML 인프라 분류 8편과 소프트웨어 공학 분류 4편, 글 12편의 파이썬 블록 36개를 하는 일, 단계, 뜻 형식으로 옮긴다. 검사와 화면 코드는 바꾸지 않는다.

**Architecture:** 글만 옮기는 묶음이다. 다섯째 묶음의 도우미를 이어받은 저장소 밖 도우미 `migrate_batch6.py` 가 이 계획 부록의 새 블록 전문을 읽어 바꾼다. 도우미는 원본 블록의 해시, 코드 줄, 옛 출력의 찍힌 줄을 먼저 견주고, 하나라도 다르면 아무것도 바꾸지 않는다. 이 묶음에는 `old=run` 블록이 없다. 옛 출력이 있는 블록 24개는 모두 찍힌 줄이 옛 출력과 글자까지 같다.

**Tech Stack:** Python 3.9 표준 라이브러리(로컬 `python3` 는 3.9.7 이고 numpy 1.26.4, scipy 1.11.4 도 있다. 이 묶음의 블록은 표준 라이브러리만 쓴다), node 20, GitHub Actions(`runs-on: ubuntu-24.04` 고정, 파이썬 3.9), 브라우저 도구(Chrome DevTools MCP. Playwright MCP 는 연결되지 않는다).

**Spec:** `docs/superpowers/specs/2026-10-13-python-code-blocks-design.md` (5-1 표시, 5-2 상태 표시, 5-4 쓰는 규칙, 8-1 블록 상태, 8-2 묶음, 8-3 옮길 때 지킬 것). 꼴과 관례는 다섯째 묶음 계획 `docs/superpowers/plans/2026-10-15-python-code-blocks-batch5.md` 를 따른다.

> 새 블록 36개의 전문은 태스크 앞의 「부록: 새 블록 36개」 절에 있다. 태스크는 그 뒤에 Task 1 부터 Task 6 까지 이어진다.

> 이 계획의 새 블록 36개, 도우미, 기대 출력은 계획을 쓸 때 저장소 사본에 그대로 적용해 돌려 본 것이다. 사본은 main `0acfd73`(넷째 묶음이 올라간 뒤)에 다섯째 묶음 계획의 새 블록 42개와 Task 5 Step 7 의 고침 셋을 그 계획의 도우미와 고침 명령으로 넣어, 다섯째 묶음이 올라간 뒤의 상태(새 형식 162개, 옛 형식 85개, 29편)로 만든 것이다. CI 검사 12가지, 12편의 형식 검사와 실행 검사, 표준 라이브러리만 있는 파이썬 3.9 의 실행 검사, 파이썬 3.12 와 3.14 의 실행 검사, 1440, 1280, 1024, 390 폭의 배치 숫자, 390 폭의 숫자 줄바꿈 훑기가 통과했다. 같은 사본에서 Task 1~5 와 Task 6 Step 1, 5 의 셸 명령을 이 문서 그대로 돌려 기대 출력과 같았다. 다섯째 묶음이 올라간 뒤에서 시작한다. Task 1 Step 1 이 이 상태를 먼저 본다.

## Global Constraints

- 공개 저장소다. 사내 시스템, 플랫폼 이름을 블록 안 글, 커밋 메시지 어디에도 쓰지 않는다.
- 이 묶음은 글만 옮긴다. 바꾸는 파일은 `posts/` 의 12편과 `scripts/code-blocks-baseline.json` 뿐이다. 검사, 시험, `js/`, `css/`, `.github/` 는 바꾸지 않는다.
- 블록 안 글(하는 일, 단계 제목, 풀이, 메모, 뜻)은 평서체 `~한다, ~이다` 로 쓴다. 숫자 뒤에 조사나 「이다」가 오면 한 칸 띄운다(`27.719 GB 이고`, `0.228337 이다`). 개수를 세는 말은 붙인다(`360번`, `6대`). 원래 주석이 합쇼체인 블록(model-serving-architecture 셋째와 다섯째의 「가상 수치입니다」)은 풀이로 옮길 때 평서체로 바꾼다. 줄 끝 주석과 docstring 은 코드 줄의 일부라 그대로 둔다.
- 해요체, `저희`, 가운뎃점, `실측`, `실체`, `축`, `가른다`, `갈린다`, 열하나 이상의 말로 쓴 숫자, 지어낸 말을 쓰지 않는다. 블록 안에 새 비유를 넣지 않는다. `node scripts/check-wording.js` 가 posts/ 의 코드 블록 안까지 센다.
- 실행되는 코드 줄은 바꾸지 않는다(spec 8-3). 줄 끝 주석도 그대로 둔다. 원래 주석의 내용은 하는 일, 풀이, 메모, 뜻으로 나눠 옮기고 버리지 않는다.
- 상태 표시는 spec 5-2 의 꼴 그대로다. 형식 검사가 읽는 꼴은 `# (<무엇> — 그대로 실행되지 않습니다.)` 하나뿐이라, 지금 의사코드 블록 5개의 첫 줄 `# (의사코드 — 구조만 보여 줍니다. …)` 은 `# (의사코드 — 그대로 실행되지 않습니다.)` 로 바꾸고, 「구조만 보여 준다」 같은 나머지 말은 하는 일로 옮긴다(아래 「이 계획에서 정한 것」).
- 블록 밖의 본문은 바꾸지 않는다(사용자 결정 「본문은 그대로 둔다」). 본문에서 찾은 사실 오류는 아래 「여쭤볼 것 후보」에 적는다. 사용자가 이 계획을 확인하며 고치기로 한 곳만 Task 5 Step 7 이 글 커밋 하나로 고치고, 나머지는 Task 6 확인 페이지의 「여쭤볼 것」에서 다시 묻는다.
- 표시 꼴은 spec 그대로다 — `# 하는 일: …`, `# N단계: …`, `# 출력:`, `# N단계 뜻: …` 또는 `# 뜻: …`. 이 묶음의 36개에는 `# 출력 (…):` 머리와 「이어서 돌린다」 표시가 없다.
- 실행 검사는 파이썬 3.9 로 돌린다(`python3 --version` 이 `Python 3.9.7`). 이 묶음의 블록은 3.12 와 3.14 에서도 같은 값을 찍는다(계획을 쓸 때 확인했다).
- 이 계획 문서는 Task 1 전에 `docs/superpowers/plans/2026-10-16-python-code-blocks-batch6.md` 로 커밋돼 있어야 한다. 임시 폴더 도구를 뽑는 명령과 글 옮기기 도우미가 이 파일을 읽는다.
- 이 계획의 코드 블록(네 백틱 울타리)은 손으로 옮겨 적지 않는다. 도우미가 부록을 그대로 읽는다. 리뷰에서 블록 글을 고칠 때만 Edit 로 고치고, 찾을 글은 파일에 꼭 한 번 있어야 한다.
- 커밋은 git 사용자 `chkimsu` 로 한다. 파일을 이름으로 stage 한다(`git add -A` 금지). 글 커밋 제목은 `feat(posts): ML 인프라와 소프트웨어 공학 글 — …` 이나 `fix(posts): ML 인프라와 소프트웨어 공학 글 — …` 로 시작한다. 마지막 줄은 그 커밋을 만든 모델의 Co-Authored-By 줄이다(예: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`).
- push 는 Task 6 에서 사용자 확인을 받은 뒤에만 한다. push 전에 `git fetch origin && git rebase origin/main` 을 한다(CI 가 sitemap 과 feed 를 다시 커밋한다).
- 임시 파일은 저장소 밖에 둔다. 아래 명령의 `$SCRATCH` 는 `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch6"; mkdir -p "$SCRATCH"` 로 정한다. 셸 변수는 명령마다 다시 정한다. 화면 그림은 저장소 안의 `.playwright-mcp/batch6/` 에 둔다(`.gitignore` 에 있다. 브라우저 도구는 저장소 밖에 그림을 쓰지 못한다). 서버는 8774 포트로 띄운다.
- `gh` 는 github.com 에 로그인돼 있지 않아 API 를 시간당 60번만 쓸 수 있다. `gh run watch` 는 `--interval 60` 이상으로 돌린다.

## Review Focus

1. **고쳐 쓰는 상태 표시와 새로 붙이는 상태 표시** — 의사코드 블록 5개(model-serving-architecture 첫째와 넷째, ad-log-system 첫째와 둘째, online-learning-delayed-feedback 첫째)의 첫 줄은 지금 꼴로는 형식 검사가 「상태 표시는 정해진 세 가지 꼴 가운데 하나로 씁니다」로 잡는다. 새 블록은 `# (의사코드 — 그대로 실행되지 않습니다.)` 로 바꾸고 나머지 말은 하는 일로 옮겼다. pyspark 블록 2개(ad-log-pipeline 첫째와 넷째)와 팀 도구로 DAG 를 만드는 블록 1개(data-engineer-first-six-months)에는 `# (Spark 예시 — 그대로 실행되지 않습니다.)`, `# (DAG 예시 — 그대로 실행되지 않습니다.)` 를 새로 붙였다. 여덟 블록 모두 실행 검사가 「실행 안 됨」으로 센다. 「라이브러리 없음」이나 실패로 세면 안 된다. Task 1 Step 4, Task 2 Step 3, Task 4 Step 3, Task 5 Step 3 이 표시 줄을 보고, Task 6 Step 1 이 `통과 189, 건너뜀 9 (라이브러리 없음 0, 실행 안 됨 9)` 를 본다.
2. **출력 영역이 없는 블록** — 36개 가운데 12개는 출력 영역이 없다. 그중 4개(ad-log-pipeline 셋째의 dataclass, ad-log-system 셋째와 feature-store-serving 첫째의 피처 벡터, git-practical-guide)는 실행되며 아무것도 찍지 않아야 한다. 무엇이든 찍으면 실행 검사가 「찍힌 줄이 N줄 있는데 출력 영역이 없습니다」로 실패한다. 나머지 8개는 1번의 상태 표시 블록이다. Task 6 Step 2 의 셋째 값이 글마다 출력 없는 블록 수를 센다.
3. **선 글자로 막대를 찍는 블록** — model-serving-architecture 둘째 블록은 `█` 막대를 찍는다. spec 4-7 대로 선 글자가 든 블록은 접지 않고 블록 안에서 옆으로 민다. 390 폭에서도 페이지 전체가 옆으로 넘치면 안 된다. Task 1 Step 7 이 네 폭으로 재고, Task 6 Step 2 가 글 전부를 390 폭으로 훑는다.
4. **마지막 코드 줄 뒤에 있던 주석** — ad-log-pipeline 첫째 블록의 「# 결과: …」 세 줄은 출력 영역이 없는 블록이라 2단계 풀이로 옮겼다. feature-store-serving 첫째 블록의 「# → …」 두 줄은 한 문장으로 이어 마지막 코드 줄 아래 메모 한 줄로 남겼다. 내용이 사라지거나 옛 줄이 남으면 안 된다. Task 2 Step 3 과 Task 3 Step 3 이 옮긴 말이 있고 옛 줄이 없는지 본다.
5. **휴대폰 폭의 긴 찍힌 줄** — software-architecture-patterns 셋째 블록의 읽기 비율 표, online-learning-delayed-feedback 둘째 블록의 학습기 표, kubernetes-networking 둘째 블록의 비용 표처럼 긴 찍힌 줄이 390 폭에서 옆으로 넘치거나 숫자 중간에서 끊기면 안 된다. Task 1 Step 7 이 첫 글을 네 폭으로 재고, Task 6 Step 2 가 글 전부를 390 폭으로 훑는다.

## 이 계획에서 정한 것

| 정한 것 | 왜 | 틀렸다면 |
|---|---|---|
| 여섯째 묶음은 ML 인프라 분류 8편(블록 29개)과 소프트웨어 공학 분류 4편(블록 7개)이다 | 사용자가 승인한 「검사나 코드 고침이 필요 없는 묶음은 20편 안팎, 트랙 둘까지」. 두 분류의 글은 모두 표준 라이브러리로 돌거나 상태 표시로 건너뛰고, 앞 블록이나 다른 글에 기대지 않는다. 남은 다른 분류는 코드 고침이나 별도 출력 블록 옮기기가 필요하다(아래 「뺀 글과 넘긴 항목」) | 다음 묶음에 글을 더하거나 뺀다 |
| 첫 글은 model-serving-architecture 다 | 블록이 5개로 가장 많고, 고쳐 쓰는 의사코드 표시 둘, 선 글자 막대를 찍는 블록, 찍힌 줄이 긴 캐시 블록이 다 있다 | 화면 확인 글만 바뀐다 |
| 의사코드 블록 5개의 첫 줄은 `# (의사코드 — 그대로 실행되지 않습니다.)` 로 바꾸고, 「구조만 보여 준다」와 「DeepFM 같은 클래스 이름은 예시다」는 하는 일로 옮긴다 | 형식 검사(`js/code-steps.js` 의 상태 표시 꼴)는 「— 그대로 실행되지 않습니다.)」 바로 앞까지를 `<무엇>` 으로 읽는다. 지금 첫 줄은 그 사이에 「구조만 보여 줍니다.」가 끼어 형식 오류다. spec 8-1 의 「지금 의사코드 6개는 첫 줄이 이미 이 꼴이라 그대로 두고」는 이 다섯과 맞지 않는다. 표시 줄은 주석이라 도우미의 코드 줄 비교에 걸리지 않는다 | 표시 줄 다섯 |
| pyspark 블록 2개에 `# (Spark 예시 — 그대로 실행되지 않습니다.)`, 팀 도구로 DAG 를 만드는 블록 1개에 `# (DAG 예시 — 그대로 실행되지 않습니다.)` 를 붙인다 | spec 8-1 은 이 셋을 「없는 라이브러리」로 셌다. 그런데 셋 다 라이브러리가 있어도 돌지 않는다. pyspark 블록은 `spark` 세션과 `s3://` 로그가 있어야 하고, DAG 블록은 팀이 만들어 둔 도구가 있어야 한다. 표시가 없으면 라이브러리를 깐 환경에서 실행 검사가 실패로 센다. 표시를 붙이면 어디서든 「실행 안 됨」으로 센다 | 표시 줄 셋, 실행 검사의 건너뜀 사유 셋 |
| ad-log-system 셋째 블록 첫 줄의 「(구조 예시 — 자리만 보여 줍니다. 그대로 실행해도 출력은 없습니다.)」는 상태 표시가 아니라 하는 일로 옮긴다 | 이 블록은 실제로 돈다(`...` 는 파이썬의 Ellipsis 다). 「그대로 실행되지 않습니다」 표시를 붙이면 안 되고, 괄호 줄을 그 자리에 두면 형식 검사가 상태 표시 오류로 잡는다 | 하는 일 한 줄 |
| 의사코드와 피처 벡터처럼 함수나 사전 하나로 된 블록은 단계 없이 쓰고, 안쪽의 들여 쓴 주석은 메모로 둔다 | spec 5-1 단계 줄은 들여쓰기 없는 줄이다. spec 5-4 「본체가 짧고 한 가지 일만 하면 단계 없이」 | 단계 줄 몇 개 |
| online-learning-delayed-feedback 첫째 블록(의사코드)의 `# 1. …`, `# 2. …`, `# 3. …` 은 1~3단계로 바꾼다 | spec 8-3 「`# 1. …` 꼴의 주석은 `# N단계:` 로」. 이 셋은 들여쓰기 없는 줄이라 단계가 될 수 있다 | 단계 줄 셋 |
| ad-log-pipeline 첫째 블록의 `# 1. …`, `# 2. …`, `# 3. …`(로그 셋 읽기)은 1단계 하나로 묶고 담긴 말은 풀이에 남긴다 | 셋이 한 줄씩 읽기만 해서 단계 셋으로 나누면 설명 칸이 코드보다 길어진다(spec 5-4 「단계는 읽는 사람이 나눠 읽을 자리에만」) | 단계 줄 둘 |
| `# ── … ──`, `# (a) …`, `# 1. …` 꼴의 머리 주석은 단계 제목으로 바꾸고, 담긴 말은 풀이에 남긴다. 머리 주석이 없던 블록은 읽는 사람이 나눠 읽을 자리마다 단계를 새로 둔다 | spec 8-3, spec 5-4 | 주석 몇 줄 |
| 함수나 클래스만 정의하는 단계의 제목은 「…하는 함수를 만든다」, 「…클래스로 만든다」로 쓴다 | 넷째 묶음 리뷰가 「돌려 고른다」처럼 뒤 단계가 하는 일을 정의 단계 제목에 쓴 것을 찾았다 | 단계 제목 몇 줄 |
| 「표준 라이브러리만 쓴다」와 「가상 데이터다」는 1단계 풀이에 남긴다 | spec 8-3 내용 보존. 글마다 적힌 자리가 달랐다 | 풀이 한 줄 |
| ad-log-pipeline 첫째 블록의 마지막 코드 줄 뒤 「# 결과: …」 세 줄은 2단계 풀이로, feature-store-serving 첫째 블록의 「# → …」 두 줄은 메모 한 줄로 옮긴다 | 출력 영역이 없는 블록이라 뜻 줄로 옮길 수 없다. 메모 두 줄은 화면에서 한 메모로 이어 붙어 「→ … → …」로 읽혀 한 문장으로 잇는다 | 풀이 한 줄, 메모 한 줄 |
| kubernetes-networking 첫째 블록 1단계 풀이의 「"집 주소를 그냥 외워 두면 안 되나?"」는 원래 주석과 본문이 쓰는 물음이라 한 번 남긴다 | 새 비유를 넣지 않는다는 규칙은 블록 안에 없던 비유를 막는 것이다. 이 말은 원래 주석의 첫 줄이고 spec 8-3 이 내용을 버리지 말라고 한다 | 풀이 한 줄 |
| 뜻 줄은 그 아래 찍힌 줄에 보이는 값만, 찍힌 꼴 그대로 쓴다(`5,000,000,000건`, `100백만`, `$900`) | 둘째 묶음 리뷰가 찾은 블록 설명 오류가 모두 계획 부록의 글에서 왔다. 넷째 묶음은 「가장」, 「크게」 같은 비교하는 말이 찍힌 값과 어긋난 것도 찾았다 | 뜻 줄 몇 개 |
| 코드가 해설을 직접 찍는 줄(「→ …」)은 그 묶음의 뜻 줄 하나가 함께 맡는다 | spec 5-4 「여러 줄을 한 뜻으로 묶어도 됩니다」 | 뜻 줄 몇 개 |
| 블록 안에 새 비유를 넣지 않는다 | 사용자 결정 「비유는 쓰지마」 | 풀이 한 줄 |
| 글 커밋 머리는 `feat(posts): ML 인프라와 소프트웨어 공학 글 —` 와 `fix(posts): ML 인프라와 소프트웨어 공학 글 —` 이고, 올리기 직전에 하나로 합친다 | 다섯째 묶음과 같다 | 합치기를 건너뛰고 그대로 올린다 |
| push 는 사용자가 `! git push origin main` 으로 한다 | 앞 묶음들에서 자동 권한 검사가 `git push` 를 막았다 | 사용자에게 부탁하는 줄 하나 |
| 화면 확인은 Chrome DevTools MCP 로 하고, 390 폭은 숨긴 iframe 으로 잰다. 서버는 8774 포트다 | Playwright MCP 가 연결되지 않는다. 창은 500px 아래로 줄지 않는다. 8773 은 다섯째 묶음이 썼다 | 도구와 포트만 바뀐다 |

## 파일 지도

| 파일 | 맡는 일 | 태스크 |
|---|---|---|
| `posts/model-serving-architecture.md` | 블록 5개 | 1 |
| `posts/ad-log-pipeline.md`, `posts/ad-log-system.md` | 블록 4, 4개 | 2 |
| `posts/embedding-table-ops.md`, `posts/two-tower-retrieval.md`, `posts/feature-store-serving.md` | 블록 5, 3, 2개 | 3 |
| `posts/online-learning-delayed-feedback.md`, `posts/serving-latency-throughput.md` | 블록 4, 2개 | 4 |
| `posts/data-engineer-first-six-months.md`, `posts/git-practical-guide.md`, `posts/kubernetes-networking.md`, `posts/software-architecture-patterns.md` | 블록 1, 1, 2, 3개 | 5 |
| `posts/model-serving-architecture.md`, `posts/ad-log-pipeline.md`, `posts/software-architecture-patterns.md` | 「여쭤볼 것 후보」 가운데 사용자가 고치기로 한 곳. ad-log-pipeline 은 두 줄, 나머지는 한 줄씩 | 5 (Step 7) |
| `scripts/code-blocks-baseline.json` | 85개 29편 → 80개 28편 → 72개 26편 → 62개 23편 → 56개 21편 → 49개 17편 | 1~5 |
| `$SCRATCH/migrate_batch6.py`, `$SCRATCH/nocache_server.py` | 글 옮기기 도우미와 캐시 없는 서버. 저장소에 넣지 않는다 | 1~6 |

12편 모두 글 파일 이름과 글 id 가 같다.

## 뺀 글과 넘긴 항목

| 무엇 | 블록 | 왜 | 어디서 |
|---|---|---|---|
| 측정과 모델링의 딥 CTR 모델 글 6편(deep-ctr-models, behavior-sequence-attention, din-architecture, dcn-vs-din-slot, multi-task-learning, negative-sampling-bias) | 5, 6, 1, 1, 3, 7 | deep-ctr-models 는 긴 글이라 배치 읽기와 쓰기 묶기가 필요하다. negative-sampling-bias 는 다섯째 블록이 앞 블록에 이어서 돌고, 일곱째 블록은 적힌 출력이 찍히지 않아 spec 8-1 의 고침이 필요하다. 같은 주제라 한 묶음에 모은다 | deep-ctr-models 가 든 묶음 |
| 판단 트랙 3편(doubly-robust, feedback-loop-bias, feedback-loop-remedies) | 1, 3, 2 | feedback-loop-bias 둘째, 셋째 블록은 앞 블록에 이어서, feedback-loop-remedies 는 앞 글에 이어서 돌린다. 앞 글이 다시 그 앞 글에 기대는 사슬(C → B → A)은 실행 검사가 아직 한 단계만 따라간다 | 실행 검사를 고치는 묶음 |
| 타겟팅 3편과 카카오 광고 시리즈 2편(audience-segmentation, lookalike-modeling, kakao-ads-prediction-targeting, kakao-ads-products, kakao-ads-bidding-measurement) | 2, 2, 1, 1, 2 | audience-segmentation 첫 블록은 없는 파일을 읽어 「그대로 실행되지 않습니다」 표시가 필요하고, lookalike-modeling 둘째 블록은 `[82]` 가 `[83]` 으로 찍혀 다시 돌려 고치고 본문 숫자를 맞춰야 한다(spec 8-1). 카카오 시리즈는 셋을 한 묶음에 모은다 | 타겟팅 분류가 든 묶음 |
| 인터뷰 3편(interview-experiment-metrics, interview-ml-modeling, interview-system-design) | 5, 4, 3 | 별도 출력 블록 12개를 블록 안으로 옮기고 지워야 한다. 이 계획의 도우미는 파이썬 블록 안만 바꾼다 | 인터뷰 글이 든 묶음 |
| 새 블록 글의 자체 확인(뜻 줄 값, 비교하는 말, 하는 일과 단계, 옛 주석의 말) | — | 둘째, 넷째 묶음에서 배운 것 | 아래 「부록 자체 확인」 |

여섯째 묶음 뒤에 남는 것은 옛 형식 블록 49개, 글 17편이다.

## 여쭤볼 것 후보

글 12편을 블록마다 읽으며 찾은 사실 오류다. 셋 다 블록 밖 본문이다. 이 계획은 고치지 않는다. 사용자가 계획을 확인하며 고치기로 한 곳만 Task 5 Step 7 이 글 커밋 하나로 고친다. 고칠 글은 아래 「고칠 글」 칸 그대로이고, 도우미를 쓰지 않는다. 고치지 않기로 한 곳은 Task 6 확인 페이지의 「여쭤볼 것」에 다시 올린다. 사용자는 계획을 확인하며 셋 다 고치기로 했다(Task 5 Step 7 의 `FIX` 목록 그대로).

| 어디 | 지금 적힌 것 | 맞는 것 | 고칠 글 |
|---|---|---|---|
| model-serving-architecture, 2절 「예산을 어디서 넘나」 블록 바로 뒤 둘째 문단 | 「후보 2,000개면 40ms로 예산의 43.7%를 먹습니다.」 | 43.7% 는 그때의 합계 91.5ms 에서 모델 추론 40.0ms 가 차지하는 몫이다. 예산 100ms 로 나누면 40% 다 | 「후보 2,000개면 40ms로 전체 91.5ms의 43.7%를 먹습니다.」 |
| ad-log-pipeline, 6절 「더 깊이 — 로그 스키마 실제 정의」 접는 절의 제목과 첫 문단 | 「(dataclass 5종)」, 「`request_id`가 다섯 스키마에 전부 들어 있다는 것입니다. 이 칼럼 하나가 요청부터 전환까지를 잇는 유일한 끈입니다.」 | 블록의 dataclass 는 RequestLog, ImpressionLog, ClickLog, ConversionLog, WinLossLog, BidLog 여섯이다. request_id 는 ConversionLog 를 뺀 다섯에 들어 있고, 전환 로그는 click_id 나 impression_id 로 이어진다. 그래서 request_id 하나가 요청부터 전환까지를 잇는다는 말도 맞지 않다 | 「(dataclass 6종)」, 「`request_id`가 전환 로그를 뺀 다섯 스키마에 다 들어 있다는 것입니다. 이 칼럼 하나가 요청부터 클릭까지를 잇는 끈이고, 전환 로그는 click_id 나 impression_id 로 이어집니다.」 |
| software-architecture-patterns, 1절 블록 바로 뒤 첫 문단 | 「99.9%짜리 서비스 셋을 사슬로 엮으면 99.2%가 됩니다.」 | 99.9% 셋(주문, 결제, 재고)만 엮으면 99.7% 다. 99.202% 는 99.5%짜리 알림까지 넷을 곱한 값이다(0.999 × 0.999 × 0.999 × 0.995) | 「99.9%짜리 셋에 99.5%짜리 알림까지 넷을 사슬로 엮으면 99.2%가 됩니다.」 |

## 부록 자체 확인

계획을 쓰며 블록마다 돌린 확인이다.

- 뜻 줄 58개(출력이 있는 블록 24개)의 숫자 269개를 그 뜻 줄의 묶음에 찍힌 줄에서 찾았다. 찍힌 줄에 없는 값은 0개다. 쓰면서 그 묶음에 없는 값을 다섯 걸러 냈다. embedding-table-ops 둘째 블록 4단계 뜻의 「왕복 6번」(코드 주석의 값), 넷째 블록 2단계 뜻의 「3%」(1단계 코드의 값), feature-store-serving 둘째 블록 4단계 뜻의 「4배」(찍히지 않는 비)와 5단계 뜻의 「33.66원」(4단계 묶음의 값), serving-latency-throughput 둘째 블록 4단계 뜻의 「99%」와 「15ms」(찍히지 않는 값)다.
- 비교하는 말(가장, 크게, 거의, 배, 더)이 든 뜻 줄 21개를 찍힌 값과 하나씩 맞췄다. online-learning-delayed-feedback 둘째 블록 6단계 뜻의 「급변 직후 오차가 0.675%p 에서 1.227%p 로 커지고」는 학습기 넷의 범위를 늘어난 값처럼 읽게 해서 「0.675%p 에서 1.227%p 사이로 크고」로 바꿨다.
- 하는 일 36줄과 단계 제목, 풀이를 단계마다 맞춰 읽었다. 함수나 클래스를 만드는 단계 16개는 제목을 「…함수를 만든다」나 「…클래스로 만든다」로 끝냈다. 상수와 함수를 함께 두는 feature-store-serving 둘째 블록 2단계만 「…함수와 클릭당 가치를 둔다」다. serving-latency-throughput 두 블록의 정의 단계 제목은 설명 칸에 맞게 줄였다.
- 옛 주석 줄마다 그 내용이 새 블록(하는 일, 풀이, 메모, 뜻)에 남았는지 견줬다. 옛 머리 주석과 마지막 코드 줄 뒤 주석은 모두 하는 일이나 풀이, 메모로 옮겼고, 줄 끝 주석과 들여 쓴 주석은 그대로 남았다.
- 숫자 뒤 조사 띄어 쓰기를 블록 안 글 전부에서 훑었다(`1 에서 32 로`, `14.75ms 로`, `27.719 GB 이고`).
- 쓰지 않는 낱말은 0개다. 새 블록 36개 전부(바꾸지 않는 코드 줄 포함)에 가운뎃점이 없다.
- 새 블록 36개를 저장소 사본에 도우미로 넣었다. CI 검사 12가지가 통과했다(형식 검사 새 형식 198개, 옛 형식 49개, 문제 0건, 실행 검사 통과 189, 실행 안 됨 9). 표준 라이브러리만 있는 파이썬 3.9 로는 통과 179, 건너뜀 19(라이브러리 없음 10, 실행 안 됨 9)다. 파이썬 3.12 와 3.14 로도 12편이 모두 통과했다.
- 도우미는 sha, 코드 줄, 찍힌 줄이 하나라도 다르면 글을 그대로 두고 멈춘다(다섯째 묶음 도우미와 표시 줄 이름만 다르다).
- 네 폭에서 12편의 값 48개가 모두 「블록 수 true <출력 없는 블록> 0 false 0 0 0」이었다. 390 폭 훑기는 108편, 숫자 4,200개, 넘침 0, 끊김 0 이다.
- 본문 단락을 블록마다 읽어 숫자를 찍힌 줄과 맞췄다. 맞지 않는 세 곳을 「여쭤볼 것 후보」에 적었다. 그 밖에 반올림해 쓴 곳(「4배 차이」는 141.85 / 34.22 = 4.15, 「여덟 배」는 196.5 / 25.0 = 7.86, 「12만 배」는 124,257)은 맞는 것으로 봤다. two-tower-retrieval 의 「내적으로 재면 +0.771로 밀려 6위」는 찍히지 않는 순위라 사본에서 따로 셌고, 맞았다.
- 블록마다 돈 시간을 쟀다. 가장 오래 걸린 것은 serving-latency-throughput 첫째 블록(2.1초)과 embedding-table-ops 셋째 블록(1.6초)이다. 실행되는 28개를 하나씩 돌리는 데 로컬에서 6초 걸렸다. 다른 검사를 함께 돌리던 때는 같은 두 블록이 4초 넘게 걸렸다. 어느 쪽이든 실행 검사의 한도 120초보다 한참 짧다.

---

## 부록: 새 블록 36개

Task 1~5 의 도우미가 이 절을 읽는다(태스크 설명에 넣지 않으려고 태스크 앞에 둔다). 블록마다 `<!-- cb6 post=<글 파일 이름> block=<0부터 센 파이썬 블록 번호> sha=<원본 블록 sha256 앞 16자> -->` 줄 바로 아래 네 백틱 울타리 안이 새 블록 전체다. 이 묶음에는 표시 줄 끝의 ` old=run` 이 붙은 블록이 없다. 표시 줄과 울타리 모양을 바꾸지 않는다. 블록 제목의 번호는 1부터 센다. 부록 번호는 태스크 차례다.

### 부록 1: model-serving-architecture (블록 5개, Task 1)

#### 블록 1

<!-- cb6 post=model-serving-architecture block=0 sha=952d06cec0b3bf3d -->
````python
# (의사코드 — 그대로 실행되지 않습니다.)
# 하는 일: 수천 개 후보를 네 단계로 줄여 광고 1개를 고르는 Multi-Stage Ranking Pipeline 이 10ms 예산 안에서 도는 구조만 보여 준다.

def multi_stage_ranking(bid_request, budget_ms=10):
    """광고 랭킹: 단계별 후보 축소 + 모델 복잡도 증가"""

    # Stage 1: Retrieval (수천 → 수백, ~0.1ms, 규칙 기반)
    candidates = retrieval(bid_request)       # 타겟팅, 예산 필터

    # Stage 2: Pre-Ranking (수백 → 50, ~1ms, 경량 모델)
    feats = extract_features(candidates, light=True)
    scores = lightweight_model.predict(feats)  # LR / 작은 MLP
    candidates = top_k(candidates, scores, k=50)

    # Stage 3: Ranking (50 → 5, ~5ms, 풀 모델)
    feats = extract_features(candidates, light=False)
    pCTR = ranking_model.predict(feats)        # DeepFM / DIN
    value = pCTR * conversion_value
    candidates = top_k(candidates, value, k=5)

    # Stage 4: Re-Ranking (5 → 1, ~0.5ms, 비즈니스 로직)
    final = apply_rules(candidates)            # 다양성, 빈도 제한
    return final, bid_shading(final, value)
````

#### 블록 2

<!-- cb6 post=model-serving-architecture block=1 sha=3f778d462cd10e27 -->
````python
# 하는 일: 요청당 고정 비용과 후보 1개당 비용을 더해, 후보 수마다 100ms 예산을 넘는지와 예산 안에 드는 최대 후보 수를 구한다.

# 1단계: 예산과 두 종류의 비용을 둔다
# 광고 요청 하나가 응답까지 쓸 수 있는 시간은 대략 100ms 다. 그 안에 피처 조회, 전처리, 모델 추론, 후처리(보정, 랭킹)가 다 들어가야 한다. 수치는 전부 가상값이다. 자리 크기만 맞췄고 사내에서 잰 값이 아니다.
BUDGET_MS = 100.0

# 후보 수와 무관하게 한 번만 드는 비용 (요청당 고정)
FIXED = [
    ("네트워크 왕복(거래소↔우리)", 12.0),
    ("유저 피처 조회 (캐시 미스 섞임)", 8.0),
    ("요청 파싱, 검증", 1.5),
]

# 후보 1개당 드는 비용 (후보 수에 비례해 늘어난다)
PER_CANDIDATE = [
    ("광고 피처 조회", 0.008),
    ("피처 전처리(정규화, 해싱)", 0.004),
    ("모델 추론", 0.020),
    ("보정 + eCPM 랭킹", 0.003),
]

# 2단계: 후보 수마다 합계를 예산과 견준다
# 고정 비용은 후보 수와 상관없이 같고, 후보 비례 비용은 후보 1개당 비용의 합에 후보 수를 곱한다.
print(f"예산 {BUDGET_MS:.0f}ms, 아래 수치는 모두 가상값\n")
fixed_total = sum(ms for _, ms in FIXED)
print(f"{'후보 수':>8}{'고정 비용':>12}{'후보 비례':>12}{'합계':>10}{'예산 대비':>11}   판정")
for n in (100, 500, 2000, 5000):
    per = sum(ms for _, ms in PER_CANDIDATE) * n
    total = fixed_total + per
    verdict = "통과" if total <= BUDGET_MS else f"초과 {total - BUDGET_MS:.1f}ms"
    print(f"{n:>8,}{fixed_total:>10.1f}ms{per:>10.1f}ms{total:>8.1f}ms{total/BUDGET_MS*100:>10.0f}%   {verdict}")

# 3단계: 후보 2,000개일 때 구간별 내역을 찍는다
# 구간을 큰 순서로 세우고, 막대 길이는 합계에서 차지하는 몫이다.
print()
N = 2000
print(f"후보 {N:,}개일 때 구간별 내역")
rows = [(name, ms, False) for name, ms in FIXED] + [(name, ms * N, True) for name, ms in PER_CANDIDATE]
rows.sort(key=lambda r: -r[1])
total = sum(ms for _, ms, _ in rows)
for name, ms, scales in rows:
    bar = '█' * max(1, round(ms / total * 40))
    tag = '후보에 비례' if scales else '고정'
    print(f"  {name:<26}{ms:>7.1f}ms  {ms/total*100:>5.1f}%  {bar}  ({tag})")
print(f"  {'합계':<26}{total:>7.1f}ms")

# 4단계: 예산에 맞추려면 후보를 몇 개까지 줄여야 하는지 구한다
# 예산에서 고정 비용을 빼고 남은 시간을 후보 1개당 비용으로 나눈다.
print()
per_one = sum(ms for _, ms in PER_CANDIDATE)
max_n = int((BUDGET_MS - fixed_total) / per_one)
print(f"예산 안에 들어가는 최대 후보 수  {max_n:,}개")
print(f"  고정 비용 {fixed_total:.1f}ms를 빼면 후보에 쓸 수 있는 시간은 {BUDGET_MS - fixed_total:.1f}ms")
print(f"  후보 1개당 {per_one:.3f}ms 이므로 {BUDGET_MS - fixed_total:.1f} / {per_one:.3f} = {max_n:,}개")
print()
print("→ 후보를 무한히 늘릴 수 없다. 그래서 정밀 랭킹 앞에 후보를 좁히는 단계가 반드시 온다.")
print("→ 그 좁히는 단계가 Two-Tower 같은 retrieval이다.")

# 출력:
# 2단계 뜻: 고정 비용 21.5ms 는 후보 수와 상관없이 같다. 후보 비례 비용이 후보 수만큼 늘어 2,000개까지는 91.5ms 로 통과하고, 5,000개는 196.5ms 로 예산을 96.5ms 넘는다.
# 예산 100ms, 아래 수치는 모두 가상값
#
#     후보 수       고정 비용       후보 비례        합계      예산 대비   판정
#      100      21.5ms       3.5ms    25.0ms        25%   통과
#      500      21.5ms      17.5ms    39.0ms        39%   통과
#    2,000      21.5ms      70.0ms    91.5ms        92%   통과
#    5,000      21.5ms     175.0ms   196.5ms       197%   초과 96.5ms
# 3단계 뜻: 후보 2,000개면 모델 추론이 40.0ms 로 합계 91.5ms 의 43.7% 를 차지해 가장 크다.
#
# 후보 2,000개일 때 구간별 내역
#   모델 추론                        40.0ms   43.7%  █████████████████  (후보에 비례)
#   광고 피처 조회                     16.0ms   17.5%  ███████  (후보에 비례)
#   네트워크 왕복(거래소↔우리)              12.0ms   13.1%  █████  (고정)
#   유저 피처 조회 (캐시 미스 섞임)           8.0ms    8.7%  ███  (고정)
#   피처 전처리(정규화, 해싱)               8.0ms    8.7%  ███  (후보에 비례)
#   보정 + eCPM 랭킹                  6.0ms    6.6%  ███  (후보에 비례)
#   요청 파싱, 검증                     1.5ms    1.6%  █  (고정)
#   합계                           91.5ms
# 4단계 뜻: 고정 비용 21.5ms 를 빼고 남는 78.5ms 를 후보 1개당 0.035ms 로 나누면, 예산 안에 드는 후보는 2,242개까지다.
#
# 예산 안에 들어가는 최대 후보 수  2,242개
#   고정 비용 21.5ms를 빼면 후보에 쓸 수 있는 시간은 78.5ms
#   후보 1개당 0.035ms 이므로 78.5 / 0.035 = 2,242개
#
# → 후보를 무한히 늘릴 수 없다. 그래서 정밀 랭킹 앞에 후보를 좁히는 단계가 반드시 온다.
# → 그 좁히는 단계가 Two-Tower 같은 retrieval이다.
````

#### 블록 3

<!-- cb6 post=model-serving-architecture block=2 sha=bf25094eefc0a077 -->
````python
# 하는 일: 배치를 1, 8, 32, 128건으로 묶을 때 추론 시간, 배치 대기, p99, 필요한 서버 수를 구해 p99 상한 10ms 와 견준다.
import math

# 1단계: 도착률과 배치 비용, p99 상한을 둔다
# 크게 묶으면 처리량은 오르고, 먼저 온 요청은 배치가 찰 때까지 기다린다. 수치는 가상값이다. 사내에서 잰 값이 아니라 자리 크기만 맞춘 대략치다.
ARRIVAL_QPS = 20000.0    # 서비스 전체 도착률
KERNEL_MS = 2.0          # 배치 1회당 고정 오버헤드(커널 실행, 텐서 복사)
PER_ITEM_MS = 0.05       # 후보 1개당 순수 연산
P99_BUDGET_MS = 10.0     # 모델 서버가 지켜야 할 p99 상한

# 2단계: 배치 크기마다 p99 와 필요한 서버 수를 구한다
# p99 는 배치 대기와 추론 시간을 더한 꼬리 지연이다. 서버 수는 도착률을 서버 1대가 감당하는 QPS 로 나눠 올린다.
print("배치   추론    배치대기   p99      서버1대QPS  필요서버  판정")
for B in (1, 8, 32, 128):
    infer = KERNEL_MS + PER_ITEM_MS * B        # 배치 1회 추론에 걸리는 시간
    wait = (B - 1) / ARRIVAL_QPS * 1000        # 먼저 온 요청이 배치가 찰 때까지 기다리는 시간
    p99 = wait + infer                         # 꼬리 지연 = 대기 + 추론
    qps = B / infer * 1000                     # 서버 1대가 감당하는 QPS
    servers = math.ceil(ARRIVAL_QPS / qps)     # 도착률을 다 받으려면 몇 대 필요한가
    ok = "통과" if p99 <= P99_BUDGET_MS else "탈락"
    print("%4d %6.2fms %7.2fms %6.2fms %10.0f %8d대  %s"
          % (B, infer, wait, p99, qps, servers, ok))

# 출력:
# 2단계 뜻: 배치를 1 에서 32 로 키우면 필요한 서버가 41대에서 3대로 줄어든다. 128 로 키우면 서버는 2대로 하나만 더 줄고, p99 가 14.75ms 로 상한을 넘어 탈락한다.
# 배치   추론    배치대기   p99      서버1대QPS  필요서버  판정
#    1   2.05ms    0.00ms   2.05ms        488       41대  통과
#    8   2.40ms    0.35ms   2.75ms       3333        6대  통과
#   32   3.60ms    1.55ms   5.15ms       8889        3대  통과
#  128   8.40ms    6.35ms  14.75ms      15238        2대  탈락
````

#### 블록 4

<!-- cb6 post=model-serving-architecture block=3 sha=c6be318e6fd26f2c -->
````python
# (의사코드 — 그대로 실행되지 않습니다.)
# 하는 일: 모델 장애에도 입찰 기회를 놓치지 않는 방어 계층인 Timeout Fallback 이 정확도를 한 단계씩 포기하는 구조만 보여 준다.

def score_with_fallback(user, candidates, timeout_ms=10):
    """다단계 Fallback: 정확도를 점진적으로 포기하되 입찰은 유지"""
    start = now()

    # Level 1: Ranking Model (최고 정확도, ~3ms)
    try:
        return ranking_model.predict(candidates, timeout=5)
    except TimeoutError:
        pass

    # Level 2: Pre-Ranking 점수 (덜 정확, 개인화 유지)
    if elapsed(start) < 8:
        log_fallback("preranking")
        return preranking_model.predict(candidates)

    # Level 3: 캐시된 평균 pCTR (개인화 없음, 입찰은 유지)
    if elapsed(start) < 10:
        log_fallback("cache")
        return [user_cache.get(user.id, GLOBAL_AVG)] * len(candidates)

    # Level 4: 전체 타임아웃 → 이 임프레션 건너뜀
    log_fallback("skip")
    raise BidSkipException("전체 장애 — 기회 손실")
````

#### 블록 5

<!-- cb6 post=model-serving-architecture block=4 sha=fcfe44211aaa01e0 -->
````python
# 하는 일: 요청 20만 건이 인기 광고에 쏠리게 뽑아, 상위 몇 % 를 캐시할 때의 적중률과 조회 지연을 구하고 유저 임베딩 캐시를 두 무대에서 견준다.
import random
random.seed(42)

# 1단계: 광고 100만 개와 요청 20만 건, 조회 비용을 둔다
# 수치는 가상값이다. 임베딩 1회 조회는 캐시에 있으면 0.05ms, 없으면 1.20ms 가 든다.
N_ADS = 1_000_000              # 살아 있는 광고 소재 100만 개
REQUESTS = 200_000             # 요청 20만 건을 굴려 본다
HIT_MS, MISS_MS = 0.05, 1.20   # 임베딩 1회 조회: 캐시 적중 / 미스
DIM, FP32 = 16, 4              # 임베딩 16차원, FP32 = 4바이트

# 2단계: 요청이 인기 광고에 쏠리게 뽑는다
# 요청 쏠림을 log-uniform 으로 근사한다. rank = N^u (u 는 0~1 균등)이면 P(rank <= k) = log k / log N 이 되어 Zipf 와 비슷한 모양이 나온다.
ranks = [int(N_ADS ** random.random()) + 1 for _ in range(REQUESTS)]

# 3단계: 상위 0.1%, 1%, 10% 를 캐시할 때 적중률, 평균 지연, 메모리를 구한다
# 적중률은 상위 k개가 차지하는 요청 비율이고, 평균 지연은 적중과 미스를 그 비율로 섞은 값이다.
for pct in (0.001, 0.01, 0.1):
    k = int(N_ADS * pct)
    hit = sum(1 for r in ranks if r <= k) / REQUESTS   # 적중률 = 상위 k개가 먹는 요청 비율
    avg = hit * HIT_MS + (1 - hit) * MISS_MS           # 적중/미스를 섞은 기대 지연
    mem = k * DIM * FP32 / 1024 / 1024                 # 캐시가 먹는 메모리(MB)
    print("상위 %4.1f%%(%6d개) 캐시 | 적중 %4.1f%% | 평균 %5.3fms | %5.1fMB | %.1f배 빠름"
          % (pct * 100, k, hit * 100, avg, mem, MISS_MS / avg))

# 4단계: 같은 캐시를 유저 임베딩에 쓸 때 두 무대를 견준다
# 같은 캐시라도 무대에 따라 다르다. 담장 안은 로그인 ID 라 같은 사람이 다시 오고, 열린 RTB 는 쿠키가 매번 달라 거의 다 미스다. 적중률 65% 와 12% 도 가상 수치다.
walled = 0.65 * HIT_MS + 0.35 * MISS_MS     # 로그인 ID라 같은 사람이 다시 온다
open_rtb = 0.12 * HIT_MS + 0.88 * MISS_MS   # 쿠키가 매번 달라 거의 다 미스
print("유저 임베딩 | 담장 안 적중 65%% -> %5.3fms | 열린 RTB 적중 12%% -> %5.3fms | %.1f배 차이"
      % (walled, open_rtb, open_rtb / walled))

# 출력:
# 3단계 뜻: 상위 1.0% 만 캐시해도 요청의 66.6% 가 적중한다. 상위 10.0% 를 캐시하면 메모리 6.1MB 로 조회가 5.0배 빨라진다.
# 상위  0.1%(  1000개) 캐시 | 적중 49.9% | 평균 0.626ms |   0.1MB | 1.9배 빠름
# 상위  1.0%( 10000개) 캐시 | 적중 66.6% | 평균 0.434ms |   0.6MB | 2.8배 빠름
# 상위 10.0%(100000개) 캐시 | 적중 83.3% | 평균 0.241ms |   6.1MB | 5.0배 빠름
# 4단계 뜻: 같은 캐시를 유저 임베딩에 쓰면 담장 안은 0.453ms, 열린 RTB 는 1.062ms 로 2.3배 차이 난다.
# 유저 임베딩 | 담장 안 적중 65% -> 0.453ms | 열린 RTB 적중 12% -> 1.062ms | 2.3배 차이
````

### 부록 2: ad-log-pipeline (블록 4개, Task 2)

#### 블록 1

<!-- cb6 post=ad-log-pipeline block=0 sha=843d43910b6345c0 -->
````python
# (Spark 예시 — 그대로 실행되지 않습니다.)
# 하는 일: 노출 로그에 클릭 로그와 피처 로그를 이어 붙여, 노출된 (user, ad) 쌍마다 서빙 시점 피처와 클릭 라벨이 한 줄인 pCTR 학습 데이터를 만든다.

import pyspark.sql.functions as F

# 1단계: 세 로그를 읽는다
# 한 줄의 학습 데이터는 Impression Log, Click Log, Feature Log 를 JOIN 해서 만든다. Impression Log 는 노출된 (user, ad) 쌍, 곧 샘플이다. Click Log 는 클릭 여부, 곧 라벨 y 다. Feature Log 는 서빙 시점의 피처, 곧 X 다.
impression = spark.read.parquet("s3://logs/impression/dt=2026-04-11")
click = spark.read.parquet("s3://logs/click/dt=2026-04-11")
feature = spark.read.parquet("s3://logs/feature/dt=2026-04-11")

# 2단계: 라벨을 붙이고 서빙 시점 피처를 잇는다
# Impression 에 Click 을 LEFT JOIN 해서 Click 이 있으면 y=1, 없으면 y=0 으로 라벨을 만든다. 결과는 노출된 모든 (user, ad) 쌍에 대해 X = feature_vector(서빙 시점 그대로), y = clicked(0 or 1) 다.
training_data = (
    impression
    .join(click, on="impression_id", how="left")
    .withColumn("label", F.when(F.col("click_id").isNotNull(), 1).otherwise(0))
    # Feature Log JOIN → 서빙 시점 피처 복원
    .join(feature, on=["request_id", "ad_id"], how="inner")
    .select(
        "request_id", "user_id", "ad_id",
        "feature_vector",   # X: 서빙 시점 그대로의 피처
        "label",            # y: 클릭 여부 (0 or 1)
        "position"          # Position Bias 보정용
    )
)
````

#### 블록 2

<!-- cb6 post=ad-log-pipeline block=1 sha=95a1b461f7d1a6df -->
````python
# 하는 일: 하루 입찰 요청 50억 건이 로그 일곱 단계를 지나며 통과율대로 줄어드는 행 수와 저장량을 구하고, 저장량이 가장 큰 로그와 가장 작은 로그를 견준다.

# 1단계: 하루 요청 수와 로그 일곱 단계를 둔다
# 로그 볼륨이 왜 1,000배 넘게 벌어지는지 깔때기를 직접 곱해 본다. 각 단계의 통과율(가상)을 순서대로 곱하면 하루 행 수가 나온다. 행 크기(저장 단가)는 Parquet 압축 뒤의 대략치이고, 실제 값은 회사와 리전마다 다르다.
DAILY_REQUESTS = 5_000_000_000        # 하루 입찰 요청 50억 건 (대형 DSP 가정)

# (로그 이름, 이전 단계 대비 통과율, 행 1건당 크기(bytes), 보존일수)
STAGES = [
    ("Request",     1.0,      420,   7),   # 요청 그 자체 — 통과율 1.0
    ("Candidate",   1.0,      180,   7),   # 요청당 후보 여러 개지만 샘플링해 1:1로 남긴다고 가정
    ("Bid",         0.60,     260,  30),   # 40%는 입찰 자체를 포기(예산, 타겟 미스)
    ("Win",         0.08,     150,  90),   # 낙찰률 8%
    ("Impression",  0.95,     200, 365),   # 낙찰 중 5%는 실제 노출 실패
    ("Click",       0.01,     160, 365),   # CTR 1%
    ("Conversion",  0.07,     240, 730),   # 클릭 중 7% 전환
]

# 2단계: 로그마다 하루 행 수와 보존 기간 전체의 저장량을 구한다
# 앞 단계 행 수에 통과율을 곱해 행 수를 내고, 행 크기와 보존일수를 곱해 저장량을 낸다.
rows = DAILY_REQUESTS
print(f"{'로그':<12}{'하루 행 수':>18}{'요청 대비':>12}{'일 용량':>12}{'보존':>7}{'총 저장량':>13}")
first_rows = None
results = []
for name, rate, size, keep in STAGES:
    rows = int(rows * rate)
    if first_rows is None:
        first_rows = rows
    daily_gb = rows * size / 1e9                  # 하루 몇 GB인가
    total_gb = daily_gb * keep                    # 보존 기간 전체로 몇 GB인가
    ratio = first_rows / rows                     # 요청 대비 몇 분의 1인가
    results.append((name, rows, total_gb))
    # GB가 1000 을 넘으면 TB로 바꿔 읽기 쉽게 한다
    unit = f"{total_gb/1000:,.1f}TB" if total_gb >= 1000 else f"{total_gb:,.1f}GB"
    print(f"{name:<12}{rows:>18,}{'1/' + f'{ratio:,.0f}':>12}"
          f"{daily_gb:>10.1f}GB{keep:>6}일{unit:>12}")

# 3단계: 요청 대비 전환 비율과 저장량 합계를 구한다
req_rows = results[0][1]
conv_rows = results[-1][1]
print()
print(f"요청 대비 전환 로그   1 / {req_rows / conv_rows:,.0f}")
print(f"저장량 합계          {sum(t for _, _, t in results)/1000:,.1f}TB")

# 4단계: 저장량이 가장 큰 로그와 가장 작은 로그를 견준다
big = max(results, key=lambda r: r[2])
small = min(results, key=lambda r: r[2])
print(f"저장량 1위           {big[0]} {big[2]/1000:,.1f}TB (보존 30일뿐인데도 1위)")
print(f"저장량 최소          {small[0]} {small[2]:,.1f}GB (2년 남겨도 이 정도)")
print(f"둘의 차이            {big[2]/small[2]:,.0f}배")
print()
print("→ 위쪽은 '양이 많아 못 남기고', 아래쪽은 '적어서 오래 남긴다'.")
print("→ 그래서 보존 정책이 로그마다 다르다. 한 규칙으로 통일하면 둘 다 손해다.")

# 출력:
# 2단계 뜻: 통과율을 곱할수록 행 수가 줄어 Request 5,000,000,000건이 Conversion 에서는 159,600건이 된다. 저장량은 보존이 30일인 Bid 가 23.4TB 로 가장 크다.
# 로그                      하루 행 수       요청 대비        일 용량     보존        총 저장량
# Request          5,000,000,000         1/1    2100.0GB     7일      14.7TB
# Candidate        5,000,000,000         1/1     900.0GB     7일       6.3TB
# Bid              3,000,000,000         1/2     780.0GB    30일      23.4TB
# Win                240,000,000        1/21      36.0GB    90일       3.2TB
# Impression         228,000,000        1/22      45.6GB   365일      16.6TB
# Click                2,280,000     1/2,193       0.4GB   365일     133.2GB
# Conversion             159,600    1/31,328       0.0GB   730일      28.0GB
# 3단계 뜻: 요청 31,328건에 전환이 1건꼴이고, 위 표의 로그 전부의 저장량을 다 더하면 64.4TB 다.
#
# 요청 대비 전환 로그   1 / 31,328
# 저장량 합계          64.4TB
# 4단계 뜻: 저장량 1위인 Bid 23.4TB 는 가장 작은 Conversion 28.0GB 의 837배다.
# 저장량 1위           Bid 23.4TB (보존 30일뿐인데도 1위)
# 저장량 최소          Conversion 28.0GB (2년 남겨도 이 정도)
# 둘의 차이            837배
#
# → 위쪽은 '양이 많아 못 남기고', 아래쪽은 '적어서 오래 남긴다'.
# → 그래서 보존 정책이 로그마다 다르다. 한 규칙으로 통일하면 둘 다 손해다.
````

#### 블록 3

<!-- cb6 post=ad-log-pipeline block=2 sha=ebee08644ab401ff -->
````python
# 하는 일: 요청, 노출, 클릭, 전환, 경매 결과, 입찰 로그 6종의 칼럼을 dataclass 로 정의하고, 로그끼리 잇는 키를 칼럼 옆에 적는다.
from dataclasses import dataclass
from typing import Optional, List
from datetime import datetime

# 1단계: 요청 로그를 정의한다
# Bid Request 를 받자마자 남긴다. 여기서 생긴 request_id 가 뒤에 오는 로그를 잇는 JOIN key 다.
@dataclass
class RequestLog:
    """① Bid Request 수신 즉시 기록"""
    request_id: str               # 모든 후속 로그의 JOIN key
    timestamp: datetime
    user_id: Optional[str]        # 3rd-party cookie 또는 device_id
    device_type: str              # mobile, desktop, tablet
    os: str                       # iOS 18, Android 14
    geo_country: str
    geo_region: Optional[str]
    publisher_id: str
    slot_id: str
    slot_size: str                # "300x250", "728x90"
    bid_floor: float              # Exchange가 설정한 최저가
    exchange_id: str

# 2단계: 노출, 클릭, 전환 로그를 정의한다
# 광고가 그려질 때 노출을, 유저가 누를 때 클릭을, 전환이 일어날 때 전환을 남긴다. 클릭은 impression_id 로 노출에, 전환은 click_id 나 impression_id 로 클릭이나 노출에 이어진다.
@dataclass
class ImpressionLog:
    """⑦ 광고 렌더링 확인 시점에 기록"""
    impression_id: str            # Click/Conversion JOIN key
    request_id: str               # → RequestLog JOIN
    timestamp: datetime
    user_id: Optional[str]
    ad_id: str
    campaign_id: str
    creative_id: str
    position: int
    win_price: float              # 실제 지불 가격
    exchange_id: str
    viewability: str              # "viewable", "not_viewable", "unknown"

@dataclass
class ClickLog:
    """⑧ 유저 클릭 시점에 기록"""
    click_id: str
    impression_id: str            # → ImpressionLog JOIN
    request_id: str
    timestamp: datetime
    user_id: Optional[str]
    ad_id: str
    time_since_impression_ms: int # 노출 후 몇 ms 만에 클릭했는가
    is_valid: bool                # Fraud Detection 결과

@dataclass
class ConversionLog:
    """⑨ 전환 이벤트 발생 시점에 기록"""
    conversion_id: str
    click_id: Optional[str]       # → ClickLog JOIN (click-through)
    impression_id: Optional[str]  # → ImpressionLog JOIN (view-through)
    user_id: Optional[str]
    conversion_type: str          # purchase, signup, install
    conversion_value: float       # 전환 금액
    timestamp: datetime
    attribution_window: str       # 7d_click, 1d_view

# 3단계: 경매 결과와 입찰 로그를 정의한다
# 경매 결과를 받을 때와 입찰 응답을 보낼 때 남기고, 둘 다 request_id 로 요청 로그에 이어진다. 입찰 로그는 내부 가치(true_value)와 깎은 비율(shading_ratio)을 함께 남긴다.
@dataclass
class WinLossLog:
    """⑥ 경매 결과 수신 시점에 기록"""
    request_id: str               # → RequestLog JOIN
    result: str                   # "win" or "loss"
    bid_price: float              # DSP가 제출한 입찰가
    win_price: Optional[float]    # 실제 지불가 (win 시에만)
    exchange_id: str
    auction_type: str             # first_price, second_price
    loss_reason: Optional[str]    # outbid, bid_below_floor (loss 시)

@dataclass
class BidLog:
    """⑤ Bid Response 전송 시점에 기록"""
    request_id: str
    ad_id: str
    bid_price: float
    true_value: float             # pCTR × pCVR × ConvValue
    shading_ratio: float          # bid_price / true_value
    pctr: float
    pcvr: float
    budget_remaining: float
    pacing_multiplier: float      # Budget Pacing 계수
````

#### 블록 4

<!-- cb6 post=ad-log-pipeline block=3 sha=b2a04611a0cd4350 -->
````python
# (Spark 예시 — 그대로 실행되지 않습니다.)
# 하는 일: 하루치 노출, 클릭, 요청 로그로 노출 중복률, 노출 없는 클릭 비율, 요청 대비 노출 비율을 재서 로그 파이프라인이 건전한지 매일 배치로 본다.
import pyspark.sql.functions as F

# 1단계: 하루치 로그 셋을 읽는다
dt = "2026-04-11"
impression = spark.read.parquet(f"s3://logs/impression/dt={dt}")
click = spark.read.parquet(f"s3://logs/click/dt={dt}")
request = spark.read.parquet(f"s3://logs/request/dt={dt}")

# 2단계: 노출 중복률을 잰다
# 전체 노출 행 가운데 같은 impression_id 로 겹쳐 남은 행의 비율이다.
total_imp = impression.count()
unique_imp = impression.select("impression_id").distinct().count()
dup_rate = 1 - unique_imp / total_imp
print(f"Impression 중복률: {dup_rate:.4%}")  # 정상: < 0.1%

# 3단계: 노출 없는 클릭(Orphan Click)의 비율을 잰다
# 노출 로그에 짝이 없는 클릭의 비율이다.
orphan_clicks = (
    click.join(impression, on="impression_id", how="left_anti")
    .count()
)
orphan_rate = orphan_clicks / click.count()
print(f"Orphan Click 비율: {orphan_rate:.4%}")  # 정상: < 0.5%

# 4단계: 요청 대비 노출 비율을 잰다
# 요청 가운데 노출까지 간 비율로, Win Rate 를 어림한 값이다.
req_count = request.count()
imp_count = unique_imp
win_rate_approx = imp_count / req_count
print(f"Request→Impression 전환율: {win_rate_approx:.2%}")  # 보통: 10-30%
````

### 부록 3: ad-log-system (블록 4개, Task 2)

#### 블록 1

<!-- cb6 post=ad-log-system block=0 sha=6fae1f47725faf21 -->
````python
# (의사코드 — 그대로 실행되지 않습니다.)
# 하는 일: 광고 요청 1건마다 한 건씩 남는 Request Log 가 유저 컨텍스트, 지면 정보, 요청 메타, 응답 결과를 한 행에 담는 구조만 보여 준다.
{
  "request_id": "req_abc123",           # 모든 다운스트림 로그의 조인 키
  "timestamp": "2026-04-11T14:30:00Z",

  # 유저 컨텍스트
  "user_id": "u_789",
  "device": "mobile", "os": "iOS 17.2", "browser": "Safari",
  "geo": {"country": "KR", "region": "Seoul", "city": "Gangnam"},

  # 지면 정보
  "slot_id": "slot_main_1",
  "publisher_id": "pub_news_001",
  "page_url": "https://news.example.com/tech/article-123",
  "page_category": "news/tech",
  "slot_size": "320x50", "slot_position": "above_fold",

  # 요청 메타
  "request_type": "display",            # display, video, native 등
  "frequency_cap_status": {              # 빈도 캡 상태
    "user_daily_impressions": 12,
    "user_hourly_impressions": 3
  },

  # 응답 결과
  "response_status": "filled",          # filled, no_fill, timeout, error
  "candidate_count": 47,                # 후보 광고 수
  "latency_ms": 23,                     # 응답 시간
  "filtering_reason": null               # no_fill인 경우 사유
}
````

#### 블록 2

<!-- cb6 post=ad-log-system block=1 sha=32070e9517051acb -->
````python
# (의사코드 — 그대로 실행되지 않습니다.)
# 하는 일: 광고 요청 1건마다 한 건씩 남는 Candidate Log 가 점수를 받은 후보 광고 전체를 candidates 목록에 담는 구조만 보여 준다.
{
  "request_id": "req_abc123",
  "timestamp": "2026-04-11T14:30:00Z",

  # 유저 컨텍스트
  "user_id": "u_789",
  "user_features": {
    "device": "mobile", "os": "iOS", "age_bucket": "30s", "gender": "M",
    "recent_click_categories": ["tech", "sports"]
  },

  # 지면 정보
  "slot_id": "slot_main_1",
  "page_category": "news",

  # 후보 광고 리스트 (수십~수백 개)
  "candidates": [
    {
      "ad_id": "ad_001", "advertiser_id": "adv_A",
      "ad_features": {"category": "tech", "creative_type": "image"},
      "pCTR": 0.045, "pCVR": 0.012, "eCPM": 540,
      "bid_price": 500, "rank": 1, "is_winner": true
    },
    {
      "ad_id": "ad_002", "advertiser_id": "adv_B",
      "ad_features": {"category": "fashion", "creative_type": "video"},
      "pCTR": 0.032, "pCVR": 0.008, "eCPM": 380,
      "bid_price": 450, "rank": 2, "is_winner": false
    },
    # ... 수십~수백 개 후보
  ]
}
````

#### 블록 3

<!-- cb6 post=ad-log-system block=2 sha=71a3836ad7816fd9 -->
````python
# 하는 일: 세 갈래 피처가 합쳐진 피처 벡터에서 피처마다 어느 갈래에 속하고 어디서 얼마나 자주 갱신되는지 자리만 보여 주며, 돌려도 찍는 것은 없다.
feature_vector = {
    "user_30d_purchase_count": 5,        # Batch — Feature Store, 1일 1회
    "ad_embedding": [0.12, -0.34, ...],  # Batch — 모델 배포 때 갱신
    "ad_1h_ctr": 0.032,                  # Streaming — Redis, 분 단위
    "ad_budget_spent_ratio": 0.45,       # Streaming — Redis, 분 단위
    "user_10min_click_count": 3,         # Real-Time — Redis, 초 단위
}
````

#### 블록 4

<!-- cb6 post=ad-log-system block=3 sha=c117c48f0ce5b708 -->
````python
# 하는 일: 스키마를 세 가지로 고친 뒤 새 코드로 어제 로그를 읽어 어디서 오류가 나는지 보고, 규칙을 지킨 리더로 어제 것과 오늘 것을 함께 읽는다.

# 1단계: 어제 로그와 오늘 로그를 둔다
# 어제 찍힌 v1 로그는 저장소에 그대로 있다. 고칠 수도, 지울 수도 없다.
OLD = {"request_id": "req-1", "slot_id": "slot_A", "pctr": "0.045"}   # 어제 것
NEW = {"request_id": "req-9", "placement_id": "slot_A",               # 오늘 것
       "pctr": 0.048, "creative_type": "video"}

# 2단계: 바꾼 필드 셋을 새 코드로 어제 로그에서 읽는다
# 오늘 (A) creative_type 을 더하고, (B) slot_id 를 placement_id 로 이름을 바꾸고, (C) pctr 을 문자열에서 실수로 바꿨다. 새 코드로 어제 것을 읽는다.
CHANGES = [
    ("(A) 추가   creative_type 를 읽는다", lambda r: r["creative_type"]),
    ("(B) 이름   placement_id 를 읽는다 ", lambda r: r["placement_id"]),
    ("(C) 타입   pctr * 1000 을 계산한다", lambda r: r["pctr"] * 1000),
]
for label, read_one in CHANGES:
    try:
        got = read_one(OLD)
        # 오류가 안 나는 쪽이 더 위험하다. 문자열 * 1000 은 파이썬에서 '반복'이다
        print(f"{label} -> 오류가 안 난다. 타입 {type(got).__name__}, 길이 {len(str(got))}")
    except KeyError as err:
        print(f"{label} -> KeyError: {err}")


# 3단계: 규칙을 지킨 리더 함수를 만든다
# 이름을 바꾼 필드, 더한 필드, 타입을 바꾼 필드를 하나씩 줄 끝의 규칙대로 읽는다.
def read_safe(row):
    slot = row.get("placement_id") or row.get("slot_id")     # 옛 이름을 한 버전 더 본다
    ctype = row.get("creative_type", "unknown")              # 추가 필드는 기본값으로
    return slot, ctype, round(float(row["pctr"]) * 1000, 1)  # 타입은 읽는 쪽에서 통일


# 4단계: 규칙을 지킨 리더로 두 로그를 읽는다
print()
for row in (OLD, NEW):
    print("규칙 지킨 리더", row["request_id"], read_safe(row))
print()
print("→ 추가는 안전하다. 단 nullable + 기본값을 스키마에 같이 박아야 한다.")
print("→ 이름 변경은 삭제 + 추가다. 옛 이름을 한 버전 더 살려 둬야 한다.")
print("→ 타입 변경은 오류 없이 틀린 값을 흘려보낸다. 새 필드를 만들고 옛 필드는 그대로 둔다.")

# 출력:
# 2단계 뜻: 더한 필드와 이름을 바꾼 필드는 어제 로그에 없어 곧바로 KeyError 가 난다. 타입을 바꾼 pctr 은 오류 없이 문자열을 1000번 이어 붙여 길이가 5000 인 str 이 된다.
# (A) 추가   creative_type 를 읽는다 -> KeyError: 'creative_type'
# (B) 이름   placement_id 를 읽는다  -> KeyError: 'placement_id'
# (C) 타입   pctr * 1000 을 계산한다 -> 오류가 안 난다. 타입 str, 길이 5000
# 4단계 뜻: 규칙을 지킨 리더는 어제 것(req-1)과 오늘 것(req-9)을 모두 읽는다. 어제 것에 없는 creative_type 은 'unknown' 으로 채우고, 세 번째 값은 pctr 의 타입이 달라도 둘 다 실수 45.0 과 48.0 으로 통일된다.
#
# 규칙 지킨 리더 req-1 ('slot_A', 'unknown', 45.0)
# 규칙 지킨 리더 req-9 ('slot_A', 'video', 48.0)
#
# → 추가는 안전하다. 단 nullable + 기본값을 스키마에 같이 박아야 한다.
# → 이름 변경은 삭제 + 추가다. 옛 이름을 한 버전 더 살려 둬야 한다.
# → 타입 변경은 오류 없이 틀린 값을 흘려보낸다. 새 필드를 만들고 옛 필드는 그대로 둔다.
````

### 부록 4: embedding-table-ops (블록 5개, Task 3)

#### 블록 1

<!-- cb6 post=embedding-table-ops block=0 sha=906db4091100fef7 -->
````python
# 하는 일: 임베딩 테이블 넷의 파라미터 메모리를 곱해 더하고, 옵티마이저마다 학습 메모리와 샤드 수를 구한 뒤, 유저 수와 차원을 바꿔 서버 한 대 한계를 어디서 넘는지 본다.
import math

# 1단계: 서버 한 대의 몫과 테이블 넷을 둔다
# 서빙은 파라미터만 들면 되지만 학습은 옵티마이저 상태까지 든다. 표준 라이브러리만 쓴다.
GB = 1024 ** 3
SERVER_GB = 64        # 서버 한 대가 임베딩에 내줄 수 있는 몫(가상). 램 전부는 못 쓴다.

# 가상 테이블 구성 — (이름, 행 수, 차원). 자리 크기만 맞춘 값이고 사내에서 잰 값이 아니다.
tables = [("유저 ID", 200_000_000, 32), ("광고 소재", 30_000_000, 32),
          ("지면 슬롯", 5_000_000, 16), ("카테고리", 50_000, 16)]


# 2단계: 행 수와 차원으로 GB 를 구하는 함수를 만든다
def gb(rows, dim, nbytes):
    """행 수 × 차원 × 값 하나의 바이트 → GB."""
    return rows * dim * nbytes / GB


# 3단계: 테이블마다 파라미터 메모리를 구해 더한다
total = 0.0
for name, rows, dim in tables:
    g = gb(rows, dim, 4)                       # FP32 = 값 하나에 4바이트
    total += g
    print("%13s행 x %2d차원 = %7.3f GB  %s" % (format(rows, ","), dim, g, name))
print("파라미터 합계 %20.3f GB" % total)

# 4단계: 옵티마이저마다 학습 메모리와 샤드 수를 구한다
# 학습 때는 옵티마이저가 값 하나마다 상태를 더 들고 있어서, 그 개수가 그대로 배수가 된다. SGD 는 상태가 없어 1배, Adagrad 는 누적 제곱합 1개로 2배, Adam 은 모멘트 2개로 3배다.
for opt, mult in (("SGD", 1), ("Adagrad", 2), ("Adam", 3)):
    need = total * mult
    print("학습 %-8s x%d → %6.1f GB, 샤드 %d대" % (opt, mult, need, math.ceil(need / SERVER_GB)))

# 5단계: 유저 수와 차원을 바꿔 한계선을 본다
# 유저 테이블만 건드려 서버 한 대의 한계선을 어디서 넘는지 본다. 기준은 학습(Adam)이다.
rest = total - gb(200_000_000, 32, 4)
for users in (100_000_000, 200_000_000, 500_000_000):
    cells = []
    for dim in (16, 32, 64):
        need = (gb(users, dim, 4) + rest) * 3
        cells.append("%2d차원 %6.1fGB %s" % (dim, need, "OK" if need <= SERVER_GB else "쪼갠다"))
    print("유저 %3d백만 | %s" % (users // 1_000_000, " | ".join(cells)))

# 출력:
# 3단계 뜻: FP32 로 담으면 파라미터만 27.719 GB 이고, 그중 유저 ID 테이블이 23.842 GB 로 가장 크다.
#   200,000,000행 x 32차원 =  23.842 GB  유저 ID
#    30,000,000행 x 32차원 =   3.576 GB  광고 소재
#     5,000,000행 x 16차원 =   0.298 GB  지면 슬롯
#        50,000행 x 16차원 =   0.003 GB  카테고리
# 파라미터 합계               27.719 GB
# 4단계 뜻: SGD 와 Adagrad 는 샤드 1대에 들어가고, Adam 은 83.2 GB 가 되어 샤드 2대로 나눠야 한다.
# 학습 SGD      x1 →   27.7 GB, 샤드 1대
# 학습 Adagrad  x2 →   55.4 GB, 샤드 1대
# 학습 Adam     x3 →   83.2 GB, 샤드 2대
# 5단계 뜻: Adam 기준으로 유저 100백만은 32차원까지, 200백만은 16차원까지 한 대에 들어가고, 500백만은 16차원으로도 쪼갠다.
# 유저 100백만 | 16차원   29.5GB OK | 32차원   47.4GB OK | 64차원   83.2GB 쪼갠다
# 유저 200백만 | 16차원   47.4GB OK | 32차원   83.2GB 쪼갠다 | 64차원  154.7GB 쪼갠다
# 유저 500백만 | 16차원  101.0GB 쪼갠다 | 32차원  190.4GB 쪼갠다 | 64차원  369.3GB 쪼갠다
````

#### 블록 2

<!-- cb6 post=embedding-table-ops block=1 sha=976f899601731d77 -->
````python
# 하는 일: 학습 배치 1,024건이 임베딩 테이블의 몇 줄을 건드리는지 세고, 건드린 줄만 고치는 희소 갱신과 전체를 훑는 밀집 갱신의 하루 비용을 견준다.
import random

random.seed(42)

# 1단계: 테이블 크기와 배치, 대역폭, 하루 스텝 수를 둔다
# 배치가 건드리는 줄의 비율이 곧 희소 갱신과 밀집 갱신의 비용 차이다. 수치는 가상이고, 표준 라이브러리만 쓴다.
USER_ROWS = 200_000_000    # 유저 테이블 행 수 (가상)
AD_ROWS = 30_000_000       # 광고 소재 테이블 행 수 (가상)
DIM = 32
BATCH = 1_024              # 배치 한 번에 들어가는 노출 로그 수
BW_GBPS = 50               # 서버 메모리 대역폭 50GB/s (가상)
STEPS = 172_800            # 초당 2스텝을 하루 내내 돌린다고 하자

# 2단계: 배치 하나가 건드리는 유저 줄과 광고 줄을 센다
# 같은 줄을 여러 번 뽑으면 한 줄로 센다.
# 유저는 배치 안에서 거의 겹치지 않으니 균등하게 뽑는다.
users = [random.randrange(USER_ROWS) for _ in range(BATCH)]
# 광고는 인기 쏠림이 심하다. rank = N^u (u는 0~1 균등)로 상위 쏠림을 흉내 낸다.
ads = [int(AD_ROWS ** random.random()) for _ in range(BATCH)]

u, a = len(set(users)), len(set(ads))
print("배치 %s건이 건드리는 줄" % format(BATCH, ","))
print("  유저 %4d줄 / %s줄 = %.7f%%" % (u, format(USER_ROWS, ","), 100 * u / USER_ROWS))
print("  광고 %4d줄 / %s줄 = %.7f%%  (인기 소재가 겹쳐 %d건이 중복)"
      % (a, format(AD_ROWS, ","), 100 * a / AD_ROWS, BATCH - a))

# 3단계: 옵티마이저가 한 스텝에서 만지는 값의 개수를 두 방식으로 센다
sparse = (u + a) * DIM                        # 건드린 줄만
dense = (USER_ROWS + AD_ROWS) * DIM           # 테이블 전체
print("\n한 스텝에서 만지는 값 %s개(희소) vs %s개(밀집) → %s배"
      % (format(sparse, ","), format(dense, ","), format(round(dense / sparse), ",")))

# 4단계: 메모리를 오가는 바이트로 하루치 시간을 구한다
# 시간을 좌우하는 것은 곱셈이 아니라 메모리를 오가는 바이트다. Adam 은 값 하나에 파라미터, 1차 모멘트, 2차 모멘트를 각각 읽고 써서 메모리 이동이 6번이다.
for label, values in (("희소", sparse), ("밀집", dense)):
    sec = values * 4 * 6 / 1024 ** 3 / BW_GBPS
    print("%s 갱신 %10.4f GB 이동 → %9.3f ms/스텝 → 하루 %s스텝에 %8.1f초"
          % (label, values * 4 * 6 / 1024 ** 3, sec * 1000, format(STEPS, ","), sec * STEPS))
print("밀집은 하루치가 %.1f일 걸린다 — 학습이 트래픽을 영원히 못 따라잡는다"
      % (dense * 4 * 6 / 1024 ** 3 / BW_GBPS * STEPS / 86_400))

# 출력:
# 2단계 뜻: 배치 1,024건이 건드리는 유저 줄은 1024줄로 전체의 0.0005120% 다. 광고는 인기 소재가 겹쳐 827줄뿐이다.
# 배치 1,024건이 건드리는 줄
#   유저 1024줄 / 200,000,000줄 = 0.0005120%
#   광고  827줄 / 30,000,000줄 = 0.0027567%  (인기 소재가 겹쳐 197건이 중복)
# 3단계 뜻: 건드린 줄만 고치면 한 스텝에 59,232개, 테이블 전체를 훑으면 7,360,000,000개라 124,257배 차이 난다.
#
# 한 스텝에서 만지는 값 59,232개(희소) vs 7,360,000,000개(밀집) → 124,257배
# 4단계 뜻: 하루 172,800스텝에 희소 갱신은 4.6초, 밀집 갱신은 568542.5초가 든다. 밀집은 하루치가 6.6일 걸려 학습이 트래픽을 따라잡지 못한다.
# 희소 갱신     0.0013 GB 이동 →     0.026 ms/스텝 → 하루 172,800스텝에      4.6초
# 밀집 갱신   164.5088 GB 이동 →  3290.176 ms/스텝 → 하루 172,800스텝에 568542.5초
# 밀집은 하루치가 6.6일 걸린다 — 학습이 트래픽을 영원히 못 따라잡는다
````

#### 블록 3

<!-- cb6 post=embedding-table-ops block=2 sha=0a690ca2399105a3 -->
````python
# 하는 일: 30일치 로그로 소재 테이블을 3만 줄로 줄일 때 빈도 컷, LRU, TTL, 무작위가 남긴 줄이 다음 날 노출을 얼마나 덮는지 견준다.
import random

random.seed(42)

# 1단계: 소재 풀과 기간, 하루 노출 수, 목표 크기, TTL 을 둔다
# 테이블을 목표 크기로 줄일 때 어떤 줄을 버려야 손해가 적은지 본다. 수치는 가상이다.
N_IDS = 300_000          # 광고 소재 풀 (가상)
DAYS = 30                # 30일 동안 로그를 쌓는다
REQ = 50_000             # 하루 노출 5만 건 (빨리 끝나는 규모로 줄였다)
TARGET = 30_000          # 목표 테이블 크기
TTL = 3                  # TTL 정책: 최근 3일 안에 등장한 줄만 남긴다

# 2단계: 소재마다 인기도와 생긴 날, 끝나는 날을 정한다
# 인기도는 1/rank^1.1 이고, 수명은 캠페인 길이라 제각각이다. 생긴 날이 다르다는 게 중요하다. 소재는 계속 새로 생기고 캠페인이 끝나면 안 나온다.
pop, born, died = [], [], []
for i in range(N_IDS):
    pop.append(1.0 / (i + 10) ** 1.1)
    b = random.randrange(-60, DAYS)
    born.append(b)
    died.append(b + random.choice([7, 14, 30, 90, 365]))

# 3단계: 등장 횟수와 마지막 등장 일을 담을 목록과, 그날 살아 있는 소재를 뽑는 함수를 만든다
seen = [0] * N_IDS       # 총 등장 횟수 → 빈도 컷의 기준
last = [-999] * N_IDS    # 마지막 등장 일 → LRU, TTL의 기준


def sample(day, n):
    """그날 살아 있는 소재만 인기도에 비례해 n건 뽑는다."""
    alive = [i for i in range(N_IDS) if born[i] <= day < died[i]]
    return random.choices(alive, weights=[pop[i] for i in alive], k=n)


# 4단계: 30일 동안 로그를 쌓고 등장한 소재 수를 찍는다
for day in range(DAYS):
    for i in sample(day, REQ):
        seen[i] += 1
        last[i] = day

logged = [i for i in range(N_IDS) if seen[i] > 0]
print("30일 로그에 등장한 소재 %s개 → %s개만 남긴다(%.0f%%)"
      % (format(len(logged), ","), format(TARGET, ","), 100 * TARGET / len(logged)))

# 5단계: 정책 넷으로 남길 집합을 만든다
# 정책마다 남기는 기준이 다르다. 빈도 컷은 총 등장 횟수, LRU 는 마지막 등장 일이 큰 순으로 목표 크기만큼 남기고, TTL 은 최근 3일 안에 나온 줄을 전부 남기며, 무작위는 목표 크기만큼 임의로 뽑는다.
policies = [("빈도 컷", sorted(logged, key=lambda i: (-seen[i], i))[:TARGET]),
            ("LRU", sorted(logged, key=lambda i: (-last[i], -seen[i], i))[:TARGET]),
            ("TTL %d일" % TTL, [i for i in logged if last[i] >= DAYS - TTL]),
            ("무작위", random.sample(logged, TARGET))]

# 6단계: 다음 날 트래픽으로 정책을 채점한다
# 과거를 맞히는 게 아니라 미래를 덮는 게 목표라서, 31일째 노출로 채점한다.
future = sample(DAYS, REQ)
print("31일째 노출 %s건, 서로 다른 소재 %s개\n" % (format(len(future), ","), format(len(set(future)), ",")))
print("정책        남긴 줄   커버   못 찾음   평균 등장   31일에 살아 있음")
for name, keep in policies:
    ks = set(keep)
    hit = sum(1 for i in future if i in ks)
    alive = sum(1 for i in keep if died[i] > DAYS)
    print("%-9s %7s개 %5.1f%% %8s건 %8.1f회 %14.1f%%"
          % (name, format(len(keep), ","), 100 * hit / len(future), format(len(future) - hit, ","),
             sum(seen[i] for i in keep) / len(keep), 100 * alive / len(keep)))

# 출력:
# 4단계 뜻: 30일 동안 등장한 소재는 122,788개이고, 그중 30,000개(24%)만 남긴다.
# 30일 로그에 등장한 소재 122,788개 → 30,000개만 남긴다(24%)
# 6단계 뜻: 무작위는 31일째 노출의 25.2% 만 덮지만, 나머지 정책 셋은 85.3% 에서 86.0% 를 덮는다. 빈도 컷이 남긴 줄은 31일에 81.0% 만 살아 있고, LRU 는 96.8% 가 살아 있다.
# 31일째 노출 50,000건, 서로 다른 소재 14,736개
#
# 정책        남긴 줄   커버   못 찾음   평균 등장   31일에 살아 있음
# 빈도 컷       30,000개  86.0%    6,984건     44.9회           81.0%
# LRU        30,000개  85.3%    7,357건     37.8회           96.8%
# TTL 3일     32,001개  85.5%    7,263건     35.5회           96.7%
# 무작위        30,000개  25.2%   37,387건     13.6회           77.2%
````

#### 블록 4

<!-- cb6 post=embedding-table-ops block=3 sha=7c81fa60cd588ab0 -->
````python
# 하는 일: 소재 3% 가 끝나고 매핑을 다시 만든 날, 어제 매핑으로 오늘 행렬을 읽으면 점수 분포와 상위 순위가 어떻게 되는지 견준다.
import random

random.seed(42)

# 1단계: 어제 ID 10만 개와 어제 매핑을 만든다
# 매핑과 행렬의 버전이 어긋나도 예외는 안 난다. 값만 남의 것이 된다. 그걸 보려고 어제 매핑부터 둔다.
N, DIM, DIE, BORN = 100_000, 16, 0.03, 5_000   # 어제 ID 10만 개, 3% 종료, 신규 5천 (가상)

old = ["ad_%06d" % i for i in range(N)]
v1 = {ad: r for r, ad in enumerate(sorted(old))}          # 어제 매핑: 정렬해 0번부터 번호를 준다

# 2단계: 하루 뒤 매핑을 다시 만들고, 행 번호가 그대로인 ID 를 센다
# 하루가 지나 일부가 죽고 새 ID 가 들어온다. 매핑을 다시 만들며 빈 행을 없앤다(압축).
dead = set(random.sample(old, int(N * DIE)))
alive = [a for a in old if a not in dead] + ["ad_%06d" % (N + i) for i in range(BORN)]
v2 = {ad: r for r, ad in enumerate(sorted(alive))}        # 오늘 매핑

sur = [a for a in old if a not in dead]                   # 죽지 않고 살아남은 ID
same = sum(1 for a in sur if v1[a] == v2[a])
print("살아남은 %s개 중 행 번호가 그대로인 것 %d개 (%.2f%%)"
      % (format(len(sur), ","), same, 100 * same / len(sur)))

# 3단계: 오늘 매핑 기준의 행렬과 유저 벡터를 만들고, 점수를 매기는 함수를 만든다
# 행렬은 v2 기준으로 학습됐다고 하자. 매핑만 v1 이면 조회가 남의 줄을 읽어 온다.
table = [[random.gauss(0, 0.5) for _ in range(DIM)] for _ in range(len(alive))]
user = [random.gauss(0, 0.5) for _ in range(DIM)]
score = lambda row: sum(x * y for x, y in zip(user, row))

# 4단계: 후보 2,000개를 두 매핑으로 채점해 점수 분포를 견준다
cands = random.sample(sur, 2_000)                         # 이번 요청의 후보 광고 2,000개
right = [score(table[v2[a]]) for a in cands]              # 매핑도 v2 — 정상
wrong = [score(table[v1[a]]) for a in cands]              # 매핑만 v1 — 어긋남

for label, v in (("정상 ", right), ("어긋남", wrong)):
    m = sum(v) / len(v)
    sd = (sum((x - m) ** 2 for x in v) / len(v)) ** 0.5
    print("%s 평균 %+.4f, 표준편차 %.4f, 최댓값 %+.4f" % (label, m, sd, max(v)))

# 5단계: 두 순위의 상위가 얼마나 겹치는지 센다
# 분포는 정상과 같아 보이는데 순위가 남의 것인지 확인한다.
rt = sorted(range(len(cands)), key=lambda i: -right[i])
wt = sorted(range(len(cands)), key=lambda i: -wrong[i])
print("Top-10 겹침 %d개, Top-100 겹침 %d개"
      % (len(set(rt[:10]) & set(wt[:10])), len(set(rt[:100]) & set(wt[:100]))))

# 출력:
# 2단계 뜻: 다시 번호를 매기면, 살아남은 97,000개 가운데 행 번호가 그대로인 것은 53개, 0.05% 뿐이다.
# 살아남은 97,000개 중 행 번호가 그대로인 것 53개 (0.05%)
# 4단계 뜻: 어긋난 매핑으로 채점해도 평균 -0.0004, 표준편차 0.6980 으로 정상(-0.0024, 0.6933)과 거의 같아, 분포로는 사고를 알아챌 수 없다.
# 정상  평균 -0.0024, 표준편차 0.6933, 최댓값 +2.0844
# 어긋남 평균 -0.0004, 표준편차 0.6980, 최댓값 +2.4388
# 5단계 뜻: 그런데 상위 10개는 하나도 겹치지 않고 상위 100개도 3개만 겹친다. 내보내는 광고가 남의 광고다.
# Top-10 겹침 0개, Top-100 겹침 3개
````

#### 블록 5

<!-- cb6 post=embedding-table-ops block=4 sha=f96665affa0d605a -->
````python
# 하는 일: 광고 벡터 2,000개를 FP32, FP16, int8(행별, 공용) 넷으로 담아 테이블 크기, 점수 오차, 상위 순위 유지를 견준다.
import math
import random
import struct

random.seed(42)

# 1단계: 유저 벡터 하나와 길이가 제각각인 광고 벡터 2,000개를 만들고, 길이 범위와 공용 스케일을 찍는다
# FP32 에서 FP16, int8 로 갈수록 메모리는 값 크기에 비례해 줄어드는데, 점수는 어디서 어긋나는지 본다. 공용 스케일은 테이블에서 가장 큰 값 하나로 정한다.
DIM = 32
N = 2_000                # 광고 벡터 2,000개를 유저 벡터 하나로 채점한다
ROWS = 235_000_000       # 전체 테이블 행 수 (가상)

user = [random.gauss(0, 0.5) for _ in range(DIM)]
# 실제 테이블은 행마다 벡터 길이가 크게 다르다. 자주 학습된 ID일수록 길어지는 경향이 있다.
ads = []
for _ in range(N):
    mag = math.exp(random.gauss(0, 1.0))                     # 이 행 전체의 길이를 정하는 배수
    ads.append([mag * random.gauss(0, 0.5) for _ in range(DIM)])
norms = [math.sqrt(sum(x * x for x in a)) for a in ads]
shared = max(abs(x) for row in ads for x in row) / 127.0     # 공용 스케일은 최댓값 하나가 정한다
print("행 벡터 길이 최소 %.3f, 최대 %.1f → %.0f배 차이, 공용 스케일 %.6f"
      % (min(norms), max(norms), max(norms) / min(norms), shared))


# 2단계: FP16, int8 로 바꾸는 함수와 내적 함수를 만든다
# struct 의 'e' 포맷이 IEEE 754 반정밀도(FP16)라 실제 반올림을 그대로 재현한다.
def fp16(v):
    """FP16으로 반올림했다 다시 읽는다. 유효 자리가 소수 3~4자리로 줄어든다."""
    return [struct.unpack("e", struct.pack("e", x))[0] for x in v]


def int8(v, scale=None):
    """스케일이 없으면 그 행의 최댓값으로 잡는다(행별). 주면 그 값을 쓴다(공용)."""
    s = scale or max(abs(x) for x in v) / 127.0
    return [max(-127, min(127, round(x / s))) * s for x in v]


def dot(a, b):
    return sum(x * y for x, y in zip(a, b))


# 3단계: FP32 로 매긴 기준 순위를 둔다
# 상위 10, 100, 500 의 집합과, 길이가 긴 절반의 집합을 미리 만든다.
base = [dot(user, a) for a in ads]
rank0 = sorted(range(N), key=lambda i: -base[i])
tops = {k: set(rank0[:k]) for k in (10, 100, 500)}
long_half = set(sorted(range(N), key=lambda i: -norms[i])[:N // 2])

# 4단계: 정밀도 넷으로 크기, 상대오차, 순위 유지, 긴 벡터와 짧은 벡터의 오차를 견준다
# 행 하나에 저장되는 바이트. 행별 스케일은 스케일(FP32 4바이트)도 같이 저장해야 한다.
variants = [("FP32 (기준)", DIM * 4, ads), ("FP16", DIM * 2, [fp16(a) for a in ads]),
            ("int8 행별", DIM + 4, [int8(a) for a in ads]),
            ("int8 공용", DIM, [int8(a, shared) for a in ads])]

print("\n정밀도        크기   상대오차   Top-10 Top-100 Top-500   긴 벡터  짧은 벡터")
for name, row_bytes, table in variants:
    score = [dot(user, a) for a in table]
    rel = [abs(s - b) / abs(b) for s, b in zip(score, base)]
    rank = sorted(range(N), key=lambda i: -score[i])
    keep = [len(tops[k] & set(rank[:k])) for k in (10, 100, 500)]
    # 같은 오차를 긴 벡터 절반과 짧은 벡터 절반으로 나눠 본다. 여기서 정체가 드러난다.
    hi = sum(rel[i] for i in long_half) / len(long_half)
    lo = sum(rel[i] for i in set(range(N)) - long_half) / (N - len(long_half))
    print("%-11s %5.1fGB %8.2f%%  %3d/10 %4d/100 %4d/500 %8.2f%% %8.2f%%"
          % (name, ROWS * row_bytes / 1024 ** 3, 100 * sum(rel) / N,
             keep[0], keep[1], keep[2], 100 * hi, 100 * lo))

# 출력:
# 1단계 뜻: 행 벡터 길이가 0.072 에서 59.6 까지 824배 차이 나는데, 공용 스케일은 가장 큰 값 하나가 정해 0.228337 이다.
# 행 벡터 길이 최소 0.072, 최대 59.6 → 824배 차이, 공용 스케일 0.228337
# 4단계 뜻: FP16 은 크기가 14.0GB 로 반인데 상대오차 0.15% 에 순위가 그대로다. int8 은 행별 스케일이면 상대오차 4.00% 에 Top-500 의 499개를 지키지만, 공용 스케일이면 상대오차가 158.34% 로 커지고 짧은 벡터는 273.74% 에 이른다.
#
# 정밀도        크기   상대오차   Top-10 Top-100 Top-500   긴 벡터  짧은 벡터
# FP32 (기준)    28.0GB     0.00%   10/10  100/100  500/500     0.00%     0.00%
# FP16         14.0GB     0.15%   10/10  100/100  500/500     0.14%     0.17%
# int8 행별       7.9GB     4.00%   10/10  100/100  499/500     3.59%     4.40%
# int8 공용       7.0GB   158.34%   10/10   98/100  475/500    42.95%   273.74%
````

### 부록 5: two-tower-retrieval (블록 3개, Task 3)

#### 블록 1

<!-- cb6 post=two-tower-retrieval block=0 sha=2bc55aa0bdb52991 -->
````python
# 하는 일: 후보 1만, 10만, 100만 개를 정밀 모델로 다 채점할 때와 투 타워 내적으로 훑을 때, ANN 으로 2% 만 훑을 때의 시간을 구해 100ms 예산과 견준다.

# 1단계: 예산과 방식별 시간을 둔다
# 왜 후보 전체에 정밀 모델을 못 돌리는지 곱셈 횟수를 직접 세어 본다. 숫자는 가상이지만 실제 범위에서 크게 벗어나지 않게 잡았다. 표준 라이브러리만 쓴다.
BUDGET_MS      = 100.0   # 광고 요청 하나에 허용된 전체 시간 (가상)
RANK_MS_PER_AD = 0.3     # 정밀 랭킹 모델이 광고 1건을 채점하는 시간 (가상)
USER_TOWER_MS  = 0.8     # 유저 타워(경량 MLP) 1회 추론 시간 (가상)
DIM            = 64      # 임베딩 차원 = 내적 1건에 필요한 곱셈 횟수
MULADD_PER_SEC = 5e8     # 최적화된 C 라이브러리가 1초에 처리하는 곱셈-덧셈 쌍 (가상)


# 2단계: 표의 칸을 맞추는 함수와 두 방식의 시간을 구하는 함수를 만든다
# 정밀 모델은 후보 수에 정비례한다. 투 타워는 유저 타워를 한 번 돌리고, 후보마다 내적 곱셈만 더한다.
def cell(s, width, right=True):
    """한글은 화면에서 두 칸을 차지한다. 그만큼 빼서 표 자리를 맞춘다."""
    gap = " " * max(0, width - len(s) - sum(1 for c in s if ord(c) > 0x2000))
    return gap + s if right else s + gap


def rank_all_ms(n_ads):
    """후보 n_ads개를 전부 정밀 랭킹 모델로 채점할 때 걸리는 시간(ms).
    후보 수에 정비례한다. 이 정비례가 문제의 핵심이다."""
    return n_ads * RANK_MS_PER_AD


def two_tower_ms(n_ads, scan_ratio=1.0):
    """투 타워로 n_ads개를 훑을 때 걸리는 시간(ms).

    scan_ratio=1.0  → 후보 전체와 내적을 다 해보는 경우 (brute force)
    scan_ratio=0.02 → ANN 인덱스가 전체의 2%만 골라 훑는 경우
    """
    muladds = n_ads * scan_ratio * DIM        # 내적 1건 = 곱셈-덧셈 DIM쌍
    dot_ms = muladds / MULADD_PER_SEC * 1000  # 초 단위를 ms로 바꾼다
    return USER_TOWER_MS + dot_ms             # 유저 타워는 후보 수와 무관하게 딱 1회


# 3단계: 후보 수마다 세 방식의 시간을 견준다
print(cell("후보 수", 12) + cell("정밀모델 전수", 16)
      + cell("투타워 전수내적", 17) + cell("투타워+ANN 2%", 16) + cell("절감 배수", 11))
for n in (10_000, 100_000, 1_000_000):
    full = rank_all_ms(n)          # 정밀 모델을 후보 전체에 돌리는 경우
    brute = two_tower_ms(n)        # 내적만 전수로 도는 경우
    ann = two_tower_ms(n, 0.02)    # ANN으로 2%만 훑는 경우
    print(f"{n:>12,}{full:>14,.0f}ms{brute:>15.1f}ms{ann:>14.1f}ms"
          f"{full / brute:>10,.0f}배")

# 4단계: 100ms 예산을 넘는지 하나씩 확인한다
# 넘으면 그 방식은 애초에 못 쓴다.
print()
for label, ms in (("정밀모델 전수 (10만 개)", rank_all_ms(100_000)),
                  ("투타워 전수내적 (10만 개)", two_tower_ms(100_000)),
                  ("투타워 전수내적 (100만 개)", two_tower_ms(1_000_000)),
                  ("투타워+ANN 2% (100만 개)", two_tower_ms(1_000_000, 0.02))):
    verdict = "예산 초과" if ms > BUDGET_MS else "통과"
    print(cell(label, 27, right=False)
          + f"{ms:>10,.1f}ms   예산의 {ms / BUDGET_MS:>8.1%}  → {verdict}")

# 출력:
# 3단계 뜻: 정밀 모델은 후보 수에 정비례해 1,000,000개면 300,000ms 가 든다. 같은 후보를 투 타워 내적으로 다 훑으면 128.8ms, ANN 으로 2% 만 훑으면 3.4ms 다.
#      후보 수   정밀모델 전수  투타워 전수내적   투타워+ANN 2%  절감 배수
#       10,000         3,000ms            2.1ms           0.8ms     1,442배
#      100,000        30,000ms           13.6ms           1.1ms     2,206배
#    1,000,000       300,000ms          128.8ms           3.4ms     2,329배
# 4단계 뜻: 예산 안에 드는 것은 10만 개를 내적으로 다 훑는 경우(13.6ms)와 100만 개를 ANN 으로 2% 만 훑는 경우(3.4ms)뿐이다. 10만 개를 정밀 모델로 다 채점하면 예산의 30000.0% 다.
#
# 정밀모델 전수 (10만 개)      30,000.0ms   예산의 30000.0%  → 예산 초과
# 투타워 전수내적 (10만 개)        13.6ms   예산의    13.6%  → 통과
# 투타워 전수내적 (100만 개)      128.8ms   예산의   128.8%  → 예산 초과
# 투타워+ANN 2% (100만 개)          3.4ms   예산의     3.4%  → 통과
````

#### 블록 2

<!-- cb6 post=two-tower-retrieval block=1 sha=4a566118cffdfe6c -->
````python
# 하는 일: 4차원 유저 벡터 1개로 광고 벡터 20개를 내적과 코사인으로 각각 채점해 상위 5개를 뽑고, 두 기준이 다르게 뽑은 광고의 벡터 길이를 견준다.
import math
import random

# 1단계: 유저 벡터 1개와 광고 벡터 20개를 만든다
# 투 타워의 '검색' 부분을 직접 구현해 본다. 차원은 눈으로 볼 수 있게 4 로 줄였다(실무는 64~128).
random.seed(42)                      # 돌릴 때마다 같은 결과가 나오게 고정
DIM = 4
N_ADS = 20

# 유저 타워가 뽑아낸 유저 임베딩 (가상). 실제로는 MLP의 마지막 층 출력이다.
user_vec = [round(random.uniform(-1, 1), 3) for _ in range(DIM)]

# 광고 타워가 미리 계산해 둔 광고 임베딩 20개 (가상).
# 벡터 길이가 광고마다 다르다는 점을 눈여겨보자. 실제 학습에서도 자주 등장한 광고일수록
# 벡터가 길어지는 경향이 있고, 그 길이가 내적 점수에 그대로 실린다.
ads = {}
for i in range(N_ADS):
    ads[f"ad_{i:02d}"] = [round(random.uniform(-1, 1), 3) for _ in range(DIM)]


# 2단계: 내적, 길이, 코사인, 상위 k개를 구하는 함수를 만든다
# 내적은 벡터의 길이에도 영향을 받고, 코사인은 길이를 나눠 버려 방향만 본다.
def dot(a, b):
    """내적 = 같은 자리끼리 곱해서 전부 더한다. 투 타워의 점수 계산은 이게 전부다."""
    return sum(x * y for x, y in zip(a, b))


def norm(a):
    """벡터의 길이. 각 원소를 제곱해 더한 뒤 제곱근을 씌운다."""
    return math.sqrt(sum(x * x for x in a))


def cosine(a, b):
    """코사인 유사도 = 내적을 두 벡터의 길이로 나눈 값. 길이를 지우고 '방향'만 본다."""
    return dot(a, b) / (norm(a) * norm(b))


def top_k(score_fn, k=5):
    """광고 전부를 점수 매겨 상위 k개만 남긴다. 이게 가장 단순한 전수 검색이다."""
    scored = [(name, score_fn(user_vec, v)) for name, v in ads.items()]
    scored.sort(key=lambda pair: pair[1], reverse=True)
    return scored[:k]


# 3단계: 두 기준으로 상위 5개를 뽑아 나란히 찍는다
print(f"유저 임베딩 u = {user_vec}  (길이 {norm(user_vec):.3f})")
print(f"광고 후보 {N_ADS}개, 차원 {DIM} → 곱셈 {N_ADS * DIM}번으로 검색이 끝난다\n")

by_dot = top_k(dot)
by_cos = top_k(cosine)

print("순위  내적 기준          코사인 기준")
for rank, (d, c) in enumerate(zip(by_dot, by_cos), start=1):
    print(f" {rank}    {d[0]}  {d[1]:+.3f}     {c[0]}  {c[1]:+.3f}")

# 4단계: 두 기준이 다르게 뽑은 광고를 들여다본다
# 두 방식이 고른 상위 5개 집합이 같은지 확인하고, 다르면 어디서 달라졌는지 본다.
set_dot, set_cos = {n for n, _ in by_dot}, {n for n, _ in by_cos}
print(f"\n내적만 뽑은 광고   : {sorted(set_dot - set_cos)}")
print(f"코사인만 뽑은 광고 : {sorted(set_cos - set_dot)}")
for name in sorted(set_dot ^ set_cos):
    print(f"  {name}: 벡터 길이 {norm(ads[name]):.3f}, "
          f"내적 {dot(user_vec, ads[name]):+.3f}, 코사인 {cosine(user_vec, ads[name]):+.3f}")

# 출력:
# 3단계 뜻: 광고 20개를 곱셈 80번으로 채점해 검색이 끝난다. 두 기준 모두 ad_09 가 1위지만, 2위부터 순서가 달라진다.
# 유저 임베딩 u = [0.279, -0.95, -0.45, -0.554]  (길이 1.221)
# 광고 후보 20개, 차원 4 → 곱셈 80번으로 검색이 끝난다
#
# 순위  내적 기준          코사인 기준
#  1    ad_09  +1.455     ad_09  +0.985
#  2    ad_05  +1.379     ad_11  +0.851
#  3    ad_01  +1.097     ad_01  +0.812
#  4    ad_10  +0.878     ad_05  +0.752
#  5    ad_18  +0.802     ad_18  +0.607
# 4단계 뜻: 내적만 뽑은 ad_10 은 벡터 길이가 1.351 로 길어, 코사인이 +0.533 인데도 내적 +0.878 로 내적 기준 상위에 든다. 코사인만 뽑은 ad_11 은 길이가 0.743 으로 짧아, 방향이 잘 맞는데도(코사인 +0.851) 내적은 +0.771 에 그친다.
#
# 내적만 뽑은 광고   : ['ad_10']
# 코사인만 뽑은 광고 : ['ad_11']
#   ad_10: 벡터 길이 1.351, 내적 +0.878, 코사인 +0.533
#   ad_11: 벡터 길이 0.743, 내적 +0.771, 코사인 +0.851
````

#### 블록 3

<!-- cb6 post=two-tower-retrieval block=2 sha=48bb02437965beb9 -->
````python
# 하는 일: 크기 8인 배치 2,000개를 클릭 점유율대로 뽑아 광고마다 negative 로 쓰인 횟수를 세고, log-Q 보정 전과 후의 점수와 순위를 견준다.
import math
import random

# 1단계: 배치 크기와 배치 수, 광고 8개의 점유율, 진짜 적합도를 둔다
# in-batch negative 의 함정을 숫자로 확인한다. 배치 안의 '남의 정답'을 negative 로 쓰면, 인기 광고가 negative 자리에 훨씬 자주 들어간다.
random.seed(42)
BATCH = 8            # 배치 크기. 한 행의 negative는 나머지 BATCH-1개다.
N_BATCH = 2_000      # 학습 배치 수

# 가상 데이터: 광고 8개의 클릭 점유율과, 이 유저에게 매긴 '진짜 적합도' 점수.
# 진짜 적합도는 편향이 하나도 없다면 모델이 배웠어야 할 값이다.
share = {"ad_A": 0.35, "ad_B": 0.20, "ad_C": 0.14, "ad_D": 0.10,
         "ad_E": 0.08, "ad_F": 0.06, "ad_G": 0.04, "ad_H": 0.03}
true_score = {"ad_A": 3.0, "ad_B": 2.2, "ad_C": 1.6, "ad_D": 1.5,
              "ad_E": 1.4, "ad_F": 1.3, "ad_G": 1.2, "ad_H": 2.4}

names = list(share)
weights = [share[n] for n in names]

# 2단계: 클릭 로그를 점유율대로 뽑아 배치를 만들고, negative 로 쓰인 횟수를 세고 표집 확률 q 를 추정한다
# 배치 안에 몇 번 들어갔는지만 센다.
seen = {n: 0 for n in names}
for _ in range(N_BATCH):
    for pick in random.choices(names, weights=weights, k=BATCH):
        seen[pick] += 1

total_rows = N_BATCH * BATCH
# 한 배치에 한 번 들어가면, 그 배치의 다른 BATCH-1개 행에 대해 negative로 쓰인다.
neg_count = {n: seen[n] * (BATCH - 1) for n in names}
# 표집 확률 q는 관측된 등장 비율로 추정한다. 실무에서도 이렇게 스트리밍 카운트로 센다.
q_hat = {n: seen[n] / total_rows for n in names}

# 3단계: 보정 전과 보정 후의 점수를 구한다
# 보정을 안 하면, 학습이 수렴한 모델의 점수는 진짜 점수에서 log q 만큼 밀린다(보정 전 점수 = 진짜 점수 - log q). q 가 큰 인기 광고는 빼 주는 값이 작고, q 가 작은 롱테일은 크게 부풀려진다. 결과는 순위 왜곡이다.
biased = {n: true_score[n] - math.log(q_hat[n]) for n in names}
# log-Q 보정은 학습 loss의 logit에 -log(q)를 미리 더해 이 밀림을 상쇄한다.
#   보정 후 점수 = 진짜 점수
fixed = dict(true_score)


# 4단계: 점수 높은 순으로 등수를 매기는 함수를 만든다
def rank_of(scores):
    """점수 높은 순으로 1위부터 등수를 매긴다."""
    order = sorted(scores, key=lambda n: scores[n], reverse=True)
    return {n: i + 1 for i, n in enumerate(order)}


# 5단계: 광고마다 negative 등장 횟수와 두 점수의 순위를 찍는다
r_biased, r_fixed = rank_of(biased), rank_of(fixed)

print(f"배치 {N_BATCH}개 × 크기 {BATCH} = 학습 행 {total_rows:,}개\n")
print("광고   점유율 negative등장 진짜점수 보정전점수(순위) 보정후점수(순위)")
for n in names:
    print(f"{n}   {q_hat[n]:>6.1%} {neg_count[n]:>12,}  "
          f"{true_score[n]:>7.2f}   {biased[n]:>8.2f} ({r_biased[n]}위)   "
          f"{fixed[n]:>8.2f} ({r_fixed[n]}위)")

# 6단계: 두 Top-3 를 견주고, 인기 광고가 밀린 폭을 찍는다
top3_biased = sorted(biased, key=lambda n: biased[n], reverse=True)[:3]
top3_fixed = sorted(fixed, key=lambda n: fixed[n], reverse=True)[:3]
print(f"\n보정 전 Top-3 : {top3_biased}")
print(f"보정 후 Top-3 : {top3_fixed}")
print(f"겹치는 광고   : {sorted(set(top3_biased) & set(top3_fixed))}")

gap = neg_count["ad_A"] / neg_count["ad_H"]
print(f"\nad_A는 ad_H보다 negative로 {gap:.1f}배 자주 등장 → "
      f"보정 전 순위 {r_fixed['ad_A']}위에서 {r_biased['ad_A']}위로 밀렸다")

# 출력:
# 5단계 뜻: 점유율 35.0% 인 ad_A 는 negative 로 39,207번 쓰이고, 3.1% 인 ad_H 는 3,430번 쓰인다. 보정 전에는 ad_A 가 4위로 밀리고, 진짜 점수가 가장 낮은 ad_G(1.20)가 2위로 오른다.
# 배치 2000개 × 크기 8 = 학습 행 16,000개
#
# 광고   점유율 negative등장 진짜점수 보정전점수(순위) 보정후점수(순위)
# ad_A    35.0%       39,207     3.00       4.05 (4위)       3.00 (1위)
# ad_B    19.6%       21,952     2.20       3.83 (6위)       2.20 (3위)
# ad_C    14.3%       15,981     1.60       3.55 (8위)       1.60 (4위)
# ad_D    10.1%       11,354     1.50       3.79 (7위)       1.50 (5위)
# ad_E     8.3%        9,338     1.40       3.88 (5위)       1.40 (6위)
# ad_F     5.5%        6,209     1.30       4.19 (3위)       1.30 (7위)
# ad_G     4.0%        4,529     1.20       4.41 (2위)       1.20 (8위)
# ad_H     3.1%        3,430     2.40       5.89 (1위)       2.40 (2위)
# 6단계 뜻: 보정 전과 보정 후의 Top-3 가 겹치는 광고는 ad_H 하나다. ad_A 는 ad_H 보다 negative 로 11.4배 자주 쓰여, 보정 후 1위에서 보정 전 4위로 밀렸다.
#
# 보정 전 Top-3 : ['ad_H', 'ad_G', 'ad_F']
# 보정 후 Top-3 : ['ad_A', 'ad_H', 'ad_B']
# 겹치는 광고   : ['ad_H']
#
# ad_A는 ad_H보다 negative로 11.4배 자주 등장 → 보정 전 순위 1위에서 4위로 밀렸다
````

### 부록 6: feature-store-serving (블록 2개, Task 3)

#### 블록 1

<!-- cb6 post=feature-store-serving block=0 sha=41d5694329a82805 -->
````python
# 하는 일: 유저, 광고, 지면, 컨텍스트 피처를 pCTR 모델에 넣을 피처 벡터 하나로 합친 모양을 간략히 보여 주며, 돌려도 찍는 것은 없다.
feature_vector = {
    # 유저 피처 (Batch + Streaming)
    "user_ctr_7d": 0.023,
    "user_click_count_5m": 3,
    "user_interest_auto": 1,    # one-hot
    "user_interest_finance": 1, # one-hot
    "user_embedding": [0.12, -0.34, ...],  # 128dim

    # 광고 피처 (Batch)
    "ad_historical_ctr": 0.045,
    "ad_creative_embedding": [0.08, 0.21, ...],  # 64dim
    "ad_budget_remain_ratio": 0.73,

    # 지면 피처 (Batch)
    "slot_category_news": 1,    # one-hot
    "slot_avg_ctr": 0.031,
    "slot_position_above_fold": 1,

    # 컨텍스트 피처 (Real-Time)
    "device_mobile": 1,
    "os_ios": 1,
    "hour_of_day": 14,
    "is_weekday": 1,
}
# 이 벡터가 pCTR 모델에 들어가 pCTR(user=U98712, ad=A001) = 0.038 같은 값을 낸다.
````

#### 블록 2

<!-- cb6 post=feature-store-serving block=1 sha=81034a180904a077 -->
````python
# 하는 일: 학습은 어젯밤 자정 기준 배치값으로, 서빙은 지금 이 순간 값으로 같은 피처를 계산할 때, 유저 10명의 pCTR 과 입찰가가 얼마나 어긋나는지 구한다.
import math

# 1단계: 유저 10명의 배치값과 오늘 클릭을 둔다
# 피처는 "이 유저의 지난 7일 클릭 수" 하나다. 학습 때는 하루 한 번 배치로 계산해 어젯밤 자정 기준 값이 하루 종일 쓰이고, 서빙 때는 Redis 카운터로 실시간 집계한 지금 값을 쓴다. 정의는 같은데 기준 시점이 다르다. 이게 training-serving skew 다.
# 행마다 (유저, 자정 기준 7일 클릭수, 자정 이후 오늘 추가된 클릭수)를 적는다.
users = [
    ("u01",  2, 0),   # 조용한 유저 — 어긋남 없음
    ("u02",  5, 1),
    ("u03",  1, 4),   # 오늘 갑자기 활발해진 유저
    ("u04", 12, 0),
    ("u05",  3, 7),   # 오늘 폭발 — 어긋남 최대
    ("u06",  8, 2),
    ("u07",  0, 3),   # 어제까지 클릭 0 → 배치값은 0
    ("u08", 15, 1),
    ("u09",  6, 0),
    ("u10",  4, 5),
]

# 2단계: 클릭수로 pCTR 을 내는 로지스틱 함수와 클릭당 가치를 둔다
# 클릭수가 많을수록 pCTR 이 오르게 학습된 아주 단순한 모델이다. logit = -4.0 + 0.22 * clicks_7d 이고, 계수 0.22 는 클릭수 1회가 늘 때 오즈가 약 1.25배가 되는 정도의 세기다.
W0, W_CLICKS = -4.0, 0.22

def pctr(clicks):
    """로지스틱 함수로 확률을 만든다. 1/(1+e^-z)."""
    z = W0 + W_CLICKS * clicks
    return 1.0 / (1.0 + math.exp(-z))

# 입찰가 = pCTR × 클릭당가치(1,000원) × 1000 / 1000  → 노출당 기대수익(원)
CLICK_VALUE = 1000

# 3단계: 유저마다 배치값과 실제값으로 pCTR 과 입찰가를 견준다
print("유저   배치값  실제값  학습가정pCTR  서빙실제pCTR   입찰가(배치)  입찰가(실제)   차이")
gap_sum = bid_gap_sum = 0.0
worst = None
for uid, batch_clicks, today_clicks in users:
    real_clicks = batch_clicks + today_clicks   # 서빙 시점의 진짜 값
    p_batch = pctr(batch_clicks)                # 배치값으로 예측하면
    p_real  = pctr(real_clicks)                 # 진짜 값으로 예측하면
    bid_batch = p_batch * CLICK_VALUE
    bid_real  = p_real * CLICK_VALUE
    gap = (p_real - p_batch) * 100              # %p 차이
    gap_sum += abs(gap)
    bid_gap_sum += abs(bid_real - bid_batch)
    if worst is None or abs(gap) > abs(worst[1]):
        worst = (uid, gap, bid_batch, bid_real)
    print(f"{uid}    {batch_clicks:5d}  {real_clicks:5d}    {p_batch*100:8.3f}%    {p_real*100:8.3f}%"
          f"    {bid_batch:9.2f}원  {bid_real:9.2f}원  {gap:+7.3f}%p")

# 4단계: 평균 오차와 가장 심한 유저를 찍는다
n = len(users)
print()
print(f"평균 절대 오차       {gap_sum/n:.3f}%p")
print(f"평균 입찰가 오차     {bid_gap_sum/n:.2f}원 (노출 1건당)")
print(f"가장 심한 유저       {worst[0]} — pCTR {worst[1]:+.3f}%p, 입찰가 {worst[2]:.2f}원 → {worst[3]:.2f}원")

# 5단계: 하루 1,000만 노출이면 이 오차가 얼마가 되는지 구한다
print()
DAILY = 10_000_000
print(f"하루 {DAILY:,}회 노출 기준 입찰가 왜곡 총량 {bid_gap_sum/n*DAILY/100_000_000:.1f}억원")
print("→ 피처 정의가 같아도 '기준 시점'이 다르면 이만큼 어긋난다.")

# 출력:
# 3단계 뜻: 오늘 클릭이 없는 u01, u04, u09 는 어긋남이 +0.000%p 다. 배치값 3, 실제값 10 인 u05 는 배치값으로 pCTR 3.422% 를 찍지만 실제로는 14.185% 다.
# 유저   배치값  실제값  학습가정pCTR  서빙실제pCTR   입찰가(배치)  입찰가(실제)   차이
# u01        2      2       2.765%       2.765%        27.65원      27.65원   +0.000%p
# u02        5      6       5.215%       6.416%        52.15원      64.16원   +1.201%p
# u03        1      5       2.231%       5.215%        22.31원      52.15원   +2.984%p
# u04       12     12      20.424%      20.424%       204.24원     204.24원   +0.000%p
# u05        3     10       3.422%      14.185%        34.22원     141.85원  +10.763%p
# u06        8     10       9.622%      14.185%        96.22원     141.85원   +4.564%p
# u07        0      3       1.799%       3.422%        17.99원      34.22원   +1.624%p
# u08       15     16      33.181%      38.225%       331.81원     382.25원   +5.044%p
# u09        6      6       6.416%       6.416%        64.16원      64.16원   +0.000%p
# u10        4      9       4.229%      11.712%        42.29원     117.12원   +7.483%p
# 4단계 뜻: 평균 절대 오차는 3.366%p 로 작아 보이지만, 가장 심한 u05 는 입찰가가 34.22원에서 141.85원으로 오른다.
#
# 평균 절대 오차       3.366%p
# 평균 입찰가 오차     33.66원 (노출 1건당)
# 가장 심한 유저       u05 — pCTR +10.763%p, 입찰가 34.22원 → 141.85원
# 5단계 뜻: 하루 10,000,000회 노출이면 입찰가 왜곡이 모두 3.4억원이 된다.
#
# 하루 10,000,000회 노출 기준 입찰가 왜곡 총량 3.4억원
# → 피처 정의가 같아도 '기준 시점'이 다르면 이만큼 어긋난다.
````

### 부록 7: online-learning-delayed-feedback (블록 4개, Task 4)

#### 블록 1

<!-- cb6 post=online-learning-delayed-feedback block=0 sha=dfc8f8fd4efa244b -->
````python
# (의사코드 — 그대로 실행되지 않습니다.)
# 하는 일: 하루 한 번 다시 학습하는 Base Model 에 수 분마다 갱신하는 Online Calibration 을 더하는 하이브리드 구조만 간략히 보여 주며, DeepFM 같은 클래스 이름은 예시다.

# 1단계: Base Model 을 하루 한 번 Batch 로 다시 학습한다
# Spark 와 GPU 로 최근 30일 전체 데이터를 학습한다.
base_pctr = DeepFM.train(
    data=last_30days_logs,    # 최근 30일 전체 데이터
    features=all_features,
    epochs=3
)

# 2단계: 수 분마다 Online Calibration 을 갱신한다
# 가벼운 작업이다. Base Model 의 출력을 Platt Scaling 으로 보정한다.
calibrator = PlattScaling()
calibrator.update(
    predictions=base_pctr.predict(recent_1hour),
    actuals=recent_1hour.labels    # 최근 1시간 실제 CTR
)

# 3단계: 서빙할 때 Base Model 예측을 보정해 돌려주는 함수를 만든다
# 서빙은 Base Model 과 Calibration 을 차례로 지난다.
def serve(x):
    raw_pctr = base_pctr.predict(x)      # Base Model 예측
    calibrated = calibrator.transform(raw_pctr)  # 보정
    return calibrated
````

#### 블록 2

<!-- cb6 post=online-learning-delayed-feedback block=1 sha=c3bf45500592fad7 -->
````python
# 하는 일: 평일 CTR 1.8%, 주말 CTR 3.2% 인 4주치 관측을 1시간마다 학습기 다섯 개에 넣어, 급변 직후와 안정 구간의 예측 오차, 4주차 주말 진입 직후의 예측을 견준다.
import random

# 1단계: 4주치 시간과 평일, 주말의 참 CTR 을 둔다
# 가상 데이터다. 1스텝은 1시간이고, 한 시간마다 노출 2천 건의 관측이 들어온다.
random.seed(42)

HOURS = 4 * 7 * 24        # 4주치, 1스텝 = 1시간
IMPS_PER_HOUR = 2_000     # 한 시간에 노출 2천 건
CTR_WEEKDAY = 0.018       # 가상 데이터: 평일 CTR 1.8%
CTR_WEEKEND = 0.032       # 가상 데이터: 주말 CTR 3.2%


# 2단계: 표 칸을 맞추는 함수와 요일, 참 CTR 을 구하는 함수를 만든다
def pad(s, w):
    """한글은 두 칸을 차지한다고 보고 표 폭을 맞춘다."""
    width = sum(2 if ord(c) > 0x2000 else 1 for c in s)
    return s + " " * max(0, w - width)


def is_weekend(hour):
    """0=월 … 5=토, 6=일. 토, 일이면 True."""
    return (hour // 24) % 7 >= 5


def true_ctr(hour):
    return CTR_WEEKEND if is_weekend(hour) else CTR_WEEKDAY


# 3단계: 학습기 세 종류를 클래스로 만든다
# 지수 이동평균, 최근 N시간 평균, 평일과 주말을 따로 두는 지수 이동평균이다. 앞의 둘에는 '요일'이라는 개념이 아예 없다.
class Ema:
    """지수 이동평균. lr이 크면 최근 데이터를 세게 반영한다."""
    def __init__(self, lr):
        self.lr, self.p = lr, 0.02      # 초기 예측 2%
    def predict(self, hour):
        return self.p
    def update(self, hour, obs):
        self.p += self.lr * (obs - self.p)


class Window:
    """최근 N시간 관측만 평균. 그보다 오래된 건 통째로 잊는다."""
    def __init__(self, size):
        self.size, self.buf = size, []
    def predict(self, hour):
        return sum(self.buf) / len(self.buf) if self.buf else 0.02
    def update(self, hour, obs):
        self.buf.append(obs)
        if len(self.buf) > self.size:
            self.buf.pop(0)             # 오래된 관측 버리기 = 망각


class WeekdayEma:
    """평일용, 주말용 EMA를 따로 둔다. 요일이 '피처'로 들어간 셈."""
    def __init__(self, lr):
        self.lr, self.p = lr, {True: 0.02, False: 0.02}
    def predict(self, hour):
        return self.p[is_weekend(hour)]
    def update(self, hour, obs):
        k = is_weekend(hour)
        self.p[k] += self.lr * (obs - self.p[k])


# 4단계: 학습기 다섯 개를 두고 급변 구간을 정한다
# 학습률이 느린 것과 빠른 것, 24시간과 168시간 윈도우, 요일을 피처로 가진 것이다.
models = {
    "EMA lr=0.02(느림)": Ema(0.02),
    "EMA lr=0.30(빠름)": Ema(0.30),
    "윈도우 24시간": Window(24),
    "윈도우 168시간": Window(168),
    "요일피처+EMA 0.30": WeekdayEma(0.30),
}

# 참 CTR이 바뀌는 시각들. 그 직후 6시간을 '급변 구간'으로 본다.
switches = [h for h in range(1, HOURS) if true_ctr(h) != true_ctr(h - 1)]
shock = {h + k for h in switches for k in range(6)}

err_all = {n: [] for n in models}
err_shock = {n: [] for n in models}
err_calm = {n: [] for n in models}
last_weekend_track = {n: [] for n in models}   # 4주차 주말 진입 6시간 예측값

# 5단계: 4주 동안 시간마다 관측을 만들며 예측 오차를 모은다
# 학습기마다 갱신하기 전에 먼저 예측해서, 진짜 예측 오차를 잰다.
for hour in range(HOURS):
    p_true = true_ctr(hour)
    # 노출 2천 건을 확률대로 하나씩 뽑아 관측 CTR을 만든다 → 통계적 잡음 포함
    clicks = sum(1 for _ in range(IMPS_PER_HOUR) if random.random() < p_true)
    obs = clicks / IMPS_PER_HOUR
    for name, m in models.items():
        pred = m.predict(hour)          # 갱신 전에 예측 → 진짜 예측 오차
        e = abs(pred - p_true)
        err_all[name].append(e)
        (err_shock if hour in shock else err_calm)[name].append(e)
        if switches[-1] <= hour < switches[-1] + 6:   # 마지막 주말 진입 직후
            last_weekend_track[name].append(pred)
        m.update(hour, obs)

# 6단계: 학습기마다 전체, 급변 직후, 안정 구간의 오차를 찍는다
print(pad("학습기", 22) + "전체오차  급변직후  안정구간")
for n in models:
    a = sum(err_all[n]) / len(err_all[n]) * 100
    s = sum(err_shock[n]) / len(err_shock[n]) * 100
    c = sum(err_calm[n]) / len(err_calm[n]) * 100
    print(pad(n, 22) + f"{a:6.3f}%p {s:6.3f}%p {c:6.3f}%p")

# 7단계: 4주차 주말 진입 직후 6시간의 예측을 찍는다
print()
print("4주차 주말 진입 직후 6시간의 예측 CTR (참값 3.20%)")
for n in models:
    track = " ".join(f"{v*100:.2f}" for v in last_weekend_track[n])
    print("  " + pad(n, 22) + track)

# 출력:
# 6단계 뜻: 요일을 피처로 가진 학습기가 전체 0.107%p, 급변 직후 0.165%p 로 가장 작다. 요일 피처가 없는 넷은 급변 직후 오차가 0.675%p 에서 1.227%p 사이로 크고, 그중 윈도우 24시간이 1.227%p 로 가장 크다.
# 학습기                전체오차  급변직후  안정구간
# EMA lr=0.02(느림)      0.440%p  1.080%p  0.397%p
# EMA lr=0.30(빠름)      0.141%p  0.675%p  0.105%p
# 윈도우 24시간          0.220%p  1.227%p  0.153%p
# 윈도우 168시간         0.524%p  0.795%p  0.506%p
# 요일피처+EMA 0.30      0.107%p  0.165%p  0.104%p
# 7단계 뜻: 4주차 주말에 들어선 직후에도 요일 피처가 없는 넷은 참값 3.20% 에 한참 못 미치는 1.69 에서 2.21 사이에서 출발한다. 요일피처+EMA 0.30 은 3.03 에서 출발해 참값 근처에 머문다.
#
# 4주차 주말 진입 직후 6시간의 예측 CTR (참값 3.20%)
#   EMA lr=0.02(느림)     1.89 1.93 1.96 1.99 2.01 2.03
#   EMA lr=0.30(빠름)     1.69 2.24 2.63 2.88 2.87 3.00
#   윈도우 24시간         1.84 1.89 1.96 2.01 2.04 2.12
#   윈도우 168시간        2.21 2.21 2.21 2.21 2.21 2.21
#   요일피처+EMA 0.30     3.03 3.17 3.28 3.33 3.19 3.22
````

#### 블록 3

<!-- cb6 post=online-learning-delayed-feedback block=2 sha=c109784466c2311d -->
````python
# 하는 일: 참 CVR 3% 인 클릭 30만 건을 지연 분포대로 시뮬레이션해, 지금 학습할 때 경과 시간대별로 보이는 관측 CVR 과 도착 확률로 나눠 되돌린 보정 CVR, 음성 가중치를 구한다.
import random

# 1단계: 지연 분포와 참 CVR, 클릭 수, 학습 시각을 둔다
# 지금 학습을 돌린다고 할 때, 클릭 30만 건은 지난 24시간 사이에 흩어져 있다.
random.seed(42)

# 앞 타임라인과 같은 가상 지연 분포 (구간 상한 시각, 그 구간 비율)
DELAY_BUCKETS = [(0.5, 0.35), (6.0, 0.25), (24.0, 0.20),
                 (72.0, 0.12), (168.0, 0.05), (720.0, 0.03)]
TRUE_CVR = 0.03
N_CLICKS = 300_000
TRAIN_AT = 24.0   # 학습을 도는 시각. 클릭은 지난 24시간 사이에 흩어져 있다.


# 2단계: 표 칸을 맞추는 함수와, 도착 확률 F(t)와 지연을 뽑는 함수를 만든다
def pad(s, w):
    """한글은 두 칸을 차지한다고 보고 표 폭을 맞춘다."""
    width = sum(2 if ord(c) > 0x2000 else 1 for c in s)
    return s + " " * max(0, w - width)


def delay_cdf(t):
    """클릭 후 t시간 안에 전환이 도착할 확률 F(t). 구간 안은 균등이라고 본다."""
    acc, lo = 0.0, 0.0
    for hi, share in DELAY_BUCKETS:
        if t >= hi:
            acc += share                         # 구간을 통째로 지났다
        elif t > lo:
            acc += share * (t - lo) / (hi - lo)  # 구간 안에서 비례 배분
            return acc
        else:
            return acc
        lo = hi
    return acc


def draw_delay():
    r, acc, lo = random.random(), 0.0, 0.0
    for hi, share in DELAY_BUCKETS:
        acc += share
        if r <= acc:
            return random.uniform(lo, hi)
        lo = hi
    return lo


# 3단계: 클릭 30만 건이 언제 눌렸는지, 전환하는지, 얼마 뒤 전환하는지 뽑는다
clicks = []
for _ in range(N_CLICKS):
    elapsed = random.uniform(0.0, TRAIN_AT)      # 학습 시각까지 지난 시간
    delay = draw_delay() if random.random() < TRUE_CVR else None
    clicks.append((elapsed, delay))

# 4단계: 경과 시간대별로 관측 CVR 과 보정 CVR 을 구한다
# 각 전환을 '그 시점까지 도착할 확률' F(t) 로 나누면 원래 크기로 돌아온다. 확률이 작을수록 크게 부풀리는 셈이다.
BINS = [(0, 1), (1, 3), (3, 6), (6, 12), (12, 24)]
print(pad("경과시간", 10) + pad("클릭수", 10) + pad("관측전환", 11)
      + pad("관측CVR", 10) + pad("F(t)", 8) + "보정CVR")
tot_naive = tot_fixed = 0.0
for lo, hi in BINS:
    grp = [c for c in clicks if lo <= c[0] < hi]
    # 학습 시점에 이미 도착한 전환만 positive로 보인다. 나머지는 Fake Negative.
    pos = [c for c in grp if c[1] is not None and c[1] <= c[0]]
    naive = len(pos) / len(grp)
    # 각 전환을 "그 시점까지 도착할 확률"로 나눠 되돌린다 (역수 가중)
    w_sum = sum(1.0 / delay_cdf(c[0]) for c in pos)
    tot_naive += len(pos)
    tot_fixed += w_sum
    print(pad(f"{lo}~{hi}h", 10) + pad(f"{len(grp):,}", 10)
          + pad(f"{len(pos):,}", 11) + pad(f"{naive*100:.2f}%", 10)
          + pad(f"{delay_cdf((lo+hi)/2)*100:.1f}%", 8)
          + f"{w_sum/len(grp)*100:.2f}%")

# 5단계: 전체 클릭의 관측 CVR 과 보정 CVR 을 참값과 견준다
print()
print(f"전체 관측 CVR (지연 무시) {tot_naive/N_CLICKS*100:.2f}%")
print(f"전체 보정 CVR (역수 가중) {tot_fixed/N_CLICKS*100:.2f}%")
print(f"참 CVR                    {TRUE_CVR*100:.2f}%")
print(f"→ 지연을 무시하면 입찰가가 참값의 {tot_naive/N_CLICKS/TRUE_CVR*100:.0f}%로 주저앉는다")

# 6단계: 전환하지 않은 샘플의 음성 가중치를 본다
# FSIW 의 음성 가중치다.
print()
print(pad("경과시간", 10) + pad("F(t)", 9) + "음성 가중치")
for t in [0.5, 2, 6, 24, 168, 720]:
    f = delay_cdf(t)
    w_neg = (1 - TRUE_CVR * (1 - f)) / (1 - TRUE_CVR)
    print(pad(f"{t:.1f}h", 10) + pad(f"{f*100:.1f}%", 9) + f"{w_neg:.5f}")

# 출력:
# 4단계 뜻: 방금 누른 0~1h 클릭은 관측 CVR 이 0.72% 이고, 12~24h 클릭은 2.15% 다. 전환을 F(t) 로 나눠 되돌리면 구간마다 2.40% 에서 3.16% 사이가 된다.
# 경과시간  클릭수    관측전환   관측CVR   F(t)    보정CVR
# 0~1h      12,469    90         0.72%     35.0%   2.40%
# 1~3h      25,103    294        1.17%     41.8%   2.79%
# 3~6h      37,332    629        1.68%     53.2%   3.16%
# 6~12h     74,882    1,421      1.90%     63.3%   2.99%
# 12~24h    150,214   3,226      2.15%     73.3%   2.93%
# 5단계 뜻: 지연을 무시하면 전체 관측 CVR 은 1.89% 로 참 CVR 3.00% 의 63% 에 머물고, 역수 가중으로 2.94% 까지 되돌린다.
#
# 전체 관측 CVR (지연 무시) 1.89%
# 전체 보정 CVR (역수 가중) 2.94%
# 참 CVR                    3.00%
# → 지연을 무시하면 입찰가가 참값의 63%로 주저앉는다
# 6단계 뜻: 전환하지 않은 샘플의 음성 가중치는 F(t) 가 35.0% 에서 100.0% 로 커져도 1.01082 에서 1.03093 까지만 움직인다. 한 건씩 크게 고치지 않는 셈이다.
#
# 경과시간  F(t)     음성 가중치
# 0.5h      35.0%    1.01082
# 2.0h      41.8%    1.01293
# 6.0h      60.0%    1.01856
# 24.0h     80.0%    1.02474
# 168.0h    97.0%    1.03000
# 720.0h    100.0%   1.03093
````

#### 블록 4

<!-- cb6 post=online-learning-delayed-feedback block=3 sha=d96111bf4e36bb01 -->
````python
# 하는 일: 클릭 20만 건을 지연 분포대로 시뮬레이션해, 전환을 1시간, 6시간, 1일, 7일 기다릴 때 잡히는 전환 비율과 학습 데이터의 나이를 견준다.
import random

# 1단계: 전환 지연 분포와 참 CVR, 클릭 수를 둔다
# 가상 데이터다. 행마다 (구간 상한 시각, 그 구간에 들어올 전환 비율)이고, 본문 타임라인과 같은 값이다.
random.seed(42)

DELAY_BUCKETS = [
    (0.5, 0.35),    # 30분 안에 35%
    (6.0, 0.25),    # 30분~6시간에 25%
    (24.0, 0.20),   # 6~24시간에 20%
    (72.0, 0.12),   # 1~3일에 12%
    (168.0, 0.05),  # 3~7일에 5%
    (720.0, 0.03),  # 7일 이후에 3% (30일까지 꼬리)
]
TRUE_CVR = 0.03      # 참 전환율 3%
N_CLICKS = 200_000


# 2단계: 표 칸을 맞추는 함수와 전환 지연을 뽑는 함수를 만든다
def pad(s, w):
    """한글은 두 칸을 차지한다고 보고 표 폭을 맞춘다."""
    width = sum(2 if ord(c) > 0x2000 else 1 for c in s)
    return s + " " * max(0, w - width)


def draw_delay():
    """전환 1건이 클릭 후 몇 시간 뒤에 들어오는지 뽑는다."""
    r = random.random()          # 0~1 균등 난수
    acc, lo = 0.0, 0.0           # acc=누적 비율, lo=이 구간의 하한 시각
    for hi, share in DELAY_BUCKETS:
        acc += share
        if r <= acc:
            return random.uniform(lo, hi)   # 구간 안은 균등하게 흩어진다고 본다
        lo = hi
    return lo


# 3단계: 클릭 20만 건을 만들고 전환 수를 센다
# 전환하면 지연 시간을, 안 하면 None 을 둔다.
clicks = [draw_delay() if random.random() < TRUE_CVR else None
          for _ in range(N_CLICKS)]
n_conv = sum(1 for d in clicks if d is not None)

# 4단계: 기다리는 시간을 바꿔 가며 잡히는 전환 비율, 관측 CVR, 데이터 나이를 잰다
# (a) 잡히는 전환 비율은 기다리는 동안 도착한 전환을 전체 전환으로 나눈 값이다. (b) 데이터 나이는 학습이 W시간 뒤처져 돌 때 쓰는 데이터가 평균 몇 시간 전 것인지로, 1.5W 시간이다.
print(pad("대기", 8) + pad("잡힌전환", 11) + pad("관측CVR", 10)
      + pad("데이터나이", 12) + "한 줄 평")
for label, wait_h in [("1시간", 1), ("6시간", 6), ("1일", 24), ("7일", 168)]:
    caught = sum(1 for d in clicks if d is not None and d <= wait_h)
    catch_rate = caught / n_conv                # (a)
    observed_cvr = caught / N_CLICKS            # 지연 무시하면 보이는 CVR
    data_age = wait_h * 1.5                     # (b)
    note = "신선한데 라벨이 없다" if wait_h <= 6 else "라벨은 맞는데 낡았다"
    print(pad(label, 8) + pad(f"{catch_rate*100:.1f}%", 11)
          + pad(f"{observed_cvr*100:.2f}%", 10)
          + pad(f"{data_age:.0f}h", 12) + note)

# 5단계: 참 CVR 과 한 줄 결론을 찍는다
print()
print(f"참 CVR {TRUE_CVR*100:.2f}%  (전환 {n_conv:,}건 / 클릭 {N_CLICKS:,}건)")
print("최적점은 하나가 아니다. 대기를 늘리면 라벨은 맞아지고 모델은 낡는다.")

# 출력:
# 4단계 뜻: 대기를 1시간에서 7일로 늘리면 잡히는 전환이 38.3% 에서 97.2% 로 오르지만, 데이터 나이도 2h 에서 252h 로 늘어난다.
# 대기    잡힌전환   관측CVR   데이터나이  한 줄 평
# 1시간   38.3%      1.13%     2h          신선한데 라벨이 없다
# 6시간   59.7%      1.77%     9h          신선한데 라벨이 없다
# 1일     80.7%      2.39%     36h         라벨은 맞는데 낡았다
# 7일     97.2%      2.87%     252h        라벨은 맞는데 낡았다
# 5단계 뜻: 클릭 200,000건 가운데 전환이 5,913건 나왔고, 정해 둔 참 CVR 은 3.00% 다.
#
# 참 CVR 3.00%  (전환 5,913건 / 클릭 200,000건)
# 최적점은 하나가 아니다. 대기를 늘리면 라벨은 맞아지고 모델은 낡는다.
````

### 부록 8: serving-latency-throughput (블록 2개, Task 4)

#### 블록 1

<!-- cb6 post=serving-latency-throughput block=0 sha=5843e4f82f1cfdb5 -->
````python
# 하는 일: 모델 서버 12대에 들어오는 요청량을 1,200 QPS 에서 3,300 QPS 로 올려 가며, p50 과 p99 같은 체류 시간 분위수와 8ms 예산을 넘는 비율을 견준다.
import random, math, heapq

# 1단계: 서버 12대와 추론 시간 분포, 예산을 둔다
# 모델 서버 12대가 한 번에 한 건(후보 120개를 한 배치로)씩 처리한다고 둔다. 요청 도착은 포아송, 추론 시간은 로그정규(중앙값 3.0ms)로 잡았다. 전부 가상 값이다.
SLOTS  = 12     # 동시에 처리되는 요청 수 = 서버 대수
MED_MS = 3.0    # 추론 시간 중앙값
SIGMA  = 0.55   # 추론 시간이 흩어진 정도
BUDGET = 8.0    # 모델이 받은 예산(ms)

# 2단계: 체류 시간을 재는 함수와 분위수 함수를 만든다
# 요청을 도착 순서대로 가장 먼저 비는 자리에 넣는다. 자리가 다 차면 뒤에 온 요청은 기다리고, 기다린 시간이 응답 시간에 그대로 더해진다.
def simulate(qps, seconds=120, seed=20260823):
    """초당 qps 로 들어오는 요청의 체류 시간(대기 + 추론, ms)과 대기 시간을 돌려준다."""
    rnd = random.Random(seed)
    now = 0.0
    free = [0.0] * SLOTS          # free[i] = i번 자리가 비는 시각(초)
    heapq.heapify(free)
    mu = math.log(MED_MS / 1000)
    stay, queue = [], []
    for _ in range(int(qps * seconds)):
        now += rnd.expovariate(qps)               # 다음 요청이 도착한 시각
        svc = rnd.lognormvariate(mu, SIGMA)       # 이 요청의 추론 시간
        start = max(heapq.heappop(free), now)     # 가장 먼저 비는 자리를 기다린다
        heapq.heappush(free, start + svc)
        queue.append((start - now) * 1000)
        stay.append((start + svc - now) * 1000)
    return stay, queue

def pct(xs, q):
    s = sorted(xs)
    return s[min(len(s) - 1, int(q * len(s)))]

# 3단계: 처리 한계를 구하고, 요청량을 올려 가며 분위수와 예산 초과를 찍는다
# 처리 한계는 서버 대수를 평균 추론 시간으로 나눈 값이다.
mean_svc = MED_MS * math.exp(SIGMA ** 2 / 2)      # 로그정규의 평균
cap = SLOTS / (mean_svc / 1000)                   # 이론 처리 한계
print(f"평균 추론 {mean_svc:.2f}ms, 처리 한계 {cap:,.0f} QPS")
print("  QPS  부하율    p50    p90    p99  p99.9   큐p99  예산초과")
for qps in (1200, 1800, 2639, 3000, 3300):
    stay, queue = simulate(qps)
    bad = 100 * sum(1 for x in stay if x > BUDGET) / len(stay)
    print(f"{qps:5,}    {qps/cap:.2f}  {pct(stay,.50):5.2f}  {pct(stay,.90):5.2f}"
          f"  {pct(stay,.99):5.2f}  {pct(stay,.999):5.2f}   {pct(queue,.99):5.2f}   {bad:5.2f}%")

# 출력:
# 3단계 뜻: 요청량이 1,200 에서 2,639 로 늘어도 p50 은 3.00 에서 3.27 로 거의 그대로다. 처리 한계 3,439 QPS 의 0.96 을 쓰는 3,300 에서는 큐 p99 가 19.65 로, 예산 초과가 35.76% 로 오른다.
# 평균 추론 3.49ms, 처리 한계 3,439 QPS
#   QPS  부하율    p50    p90    p99  p99.9   큐p99  예산초과
# 1,200    0.35   3.00   6.05  10.79  16.54    0.00    3.69%
# 1,800    0.52   3.01   6.08  10.78  16.48    0.52    3.76%
# 2,639    0.77   3.27   6.49  11.19  16.97    2.97    4.62%
# 3,000    0.87   3.84   7.74  13.12  18.58    6.97    8.93%
# 3,300    0.96   6.25  14.28  23.95  31.20   19.65   35.76%
````

#### 블록 2

<!-- cb6 post=serving-latency-throughput block=1 sha=70a7c25a95a9b46a -->
````python
# 하는 일: 2,639 QPS 표본을 히스토그램에 담아, 널리 쓰는 기본 버킷과 예산에 맞춘 버킷으로 낸 p99 를 원본에서 직접 센 p99 와 견준다.
import random, math, heapq

# 1단계: 5절과 같은 표본 함수와 Prometheus 식 분위수 함수를 만든다
# Grafana 가 그리는 p99 는 원본 값이 아니라 버킷 경계 사이를 직선으로 이어 낸 값이다.
def samples(qps=2639, slots=12, med=3.0, sigma=0.55, seconds=120, seed=20260823):
    """5절과 같은 시뮬레이션. 체류 시간(ms) 목록을 돌려준다."""
    rnd = random.Random(seed)
    now, free = 0.0, [0.0] * slots
    heapq.heapify(free)
    mu, out = math.log(med / 1000), []
    for _ in range(int(qps * seconds)):
        now += rnd.expovariate(qps)
        svc = rnd.lognormvariate(mu, sigma)
        start = max(heapq.heappop(free), now)
        heapq.heappush(free, start + svc)
        out.append((start + svc - now) * 1000)
    return out

def histogram_quantile(q, buckets, xs):
    """Prometheus 가 하는 계산 그대로 — 목표가 걸린 버킷 안을 직선으로 잇는다."""
    total, target = len(xs), q * len(xs)
    lo_b, lo_c = 0.0, 0
    for b in buckets:
        c = sum(1 for x in xs if x <= b * 1000)        # le=b 이하 누적 건수
        if c >= target:
            if c == lo_c:
                return b * 1000
            return (lo_b + (b - lo_b) * (target - lo_c) / (c - lo_c)) * 1000
        lo_b, lo_c = b, c
    return buckets[-1] * 1000

# 2단계: 기본 버킷과 맞춘 버킷을 둔다
# 경계는 초 단위다. 맞춘 버킷은 예산 근처를 촘촘히 나눈다.
DEFAULT = [.005, .01, .025, .05, .075, .1, .25, .5, .75, 1, 2.5, 5, 10]   # 널리 쓰는 기본값
TUNED   = [.002, .003, .004, .005, .006, .008, .010, .012, .015, .020, .030, .050, .100]

# 3단계: 원본 p99 와 두 버킷으로 낸 p99 를 견준다
xs = samples()
real = sorted(xs)[int(0.99 * len(xs))]
print(f"표본 {len(xs):,}건, 원본에서 직접 센 p99   {real:.2f} ms\n")
for name, bk in (("기본 버킷", DEFAULT), ("맞춘 버킷", TUNED)):
    got = histogram_quantile(0.99, bk, xs)
    print(f"{name}으로 낸 p99   {got:6.2f} ms   ({100 * (got / real - 1):+.1f}%)")

# 4단계: 기본 버킷이 p99 근처를 어떻게 덮는지 본다
print("\n기본 버킷이 이 구간을 어떻게 덮고 있나")
for b in (.005, .01, .025):
    cum = 100 * sum(1 for x in xs if x <= b * 1000) / len(xs)
    print(f"  le={b:<5} ({b * 1000:>2.0f}ms 이하)   누적 {cum:6.3f}%")

# 출력:
# 3단계 뜻: 원본에서 센 p99 는 11.19 ms 다. 기본 버킷으로 내면 16.43 ms 로 46.8% 부풀고, 맞춘 버킷은 11.42 ms 로 2.0% 차이다.
# 표본 316,680건, 원본에서 직접 센 p99   11.19 ms
#
# 기본 버킷으로 낸 p99    16.43 ms   (+46.8%)
# 맞춘 버킷으로 낸 p99    11.42 ms   (+2.0%)
# 4단계 뜻: 10ms 이하가 이미 98.255% 이고 25ms 이하가 99.993% 라서, p99 는 10ms 와 25ms 사이의 넓은 버킷 안을 직선으로 이어 낸 값이 된다.
#
# 기본 버킷이 이 구간을 어떻게 덮고 있나
#   le=0.005 ( 5ms 이하)   누적 78.441%
#   le=0.01  (10ms 이하)   누적 98.255%
#   le=0.025 (25ms 이하)   누적 99.993%
````

### 부록 9: data-engineer-first-six-months (블록 1개, Task 5)

#### 블록 1

<!-- cb6 post=data-engineer-first-six-months block=0 sha=f6bda375405362aa -->
````python
# (DAG 예시 — 그대로 실행되지 않습니다.)
# 하는 일: 원천 표 하나를 매일 00시 05분에 어제 날짜 기준으로 웨어하우스에 복사하는 DAG 를, 팀이 만들어 둔 도구로 정의한다.
from datetime import datetime
from dateutil.relativedelta import relativedelta

from cosmos_ext.builder.dbt_source_dag import DbtSourceDag
from custom_timetable import CronTimeDeltaTimetable

dag = DbtSourceDag(
    dag_id="extract.community.raw_category",
    start_date=datetime(2026, 1, 1),
    schedule=CronTimeDeltaTimetable(cron="5 0 * * *", time_delta=relativedelta(days=-1)),
    source_names={"community.raw_category"},
    catchup=True,
)
dag.create_airflow_dag()
````

### 부록 10: git-practical-guide (블록 1개, Task 5)

#### 블록 1

<!-- cb6 post=git-practical-guide block=0 sha=55301c907e282fff -->
````python
# 하는 일: 두 브랜치가 다르게 고친 learning_rate 를 둘 다 참고해 0.005 로 정한, 충돌을 푼 뒤의 줄이다.
learning_rate = 0.005  # 둘 다 참고하여 결정
````

### 부록 11: kubernetes-networking (블록 2개, Task 5)

#### 블록 1

<!-- cb6 post=kubernetes-networking block=0 sha=a7d8f8cf8d482914 -->
````python
# 하는 일: Pod 3개짜리 앱이 하루 4번 배포할 때, 클라이언트가 Pod IP 를 직접 외우는 경우와 Service 주소 하나만 외우는 경우의 한 달 실패 요청을 견준다.
import random
random.seed(42)

# 1단계: 앱의 Pod 수와 배포, 요청량, 캐시 시간을 둔다
# "집 주소를 그냥 외워 두면 안 되나?"에 숫자로 답한다. 배포할 때마다 Pod 가 새로 만들어지고, Pod 가 새로 만들어지면 IP 가 바뀐다. 가상 데이터다.
PODS = 3                # Pod 3개
DEPLOYS_PER_DAY = 4     # 하루 배포 4번
DAYS = 30               # 한 달
RPS = 100               # 초당 요청 100건
ROLLING_SEC = 40        # 롤링 배포 1회에 걸리는 시간(초) — 한 채씩 교체
CACHE_TTL_SEC = 300     # 클라이언트가 IP를 5분간 외워 둔다고 가정

# 2단계: 한 달 동안 Pod IP 가 바뀌는 횟수를 센다
total_ip_changes = PODS * DEPLOYS_PER_DAY * DAYS
print(f"한 달 동안 Pod IP가 바뀌는 횟수  {total_ip_changes}회")
print(f"  = Pod {PODS}개 × 배포 {DEPLOYS_PER_DAY}회/일 × {DAYS}일")
print()

# 3단계: Pod IP 를 직접 외울 때의 실패를 센다
# 방식 A 다. 배포 중에는 외워 둔 IP 가운데 일부가 이미 사라진 Pod 를 가리키고, 최악이면 캐시 TTL 이 다 지나기 전까지 그 IP 로 계속 요청을 보낸다. 롤링 배포는 Pod 를 하나씩 교체하므로, 배포 중 평균적으로 전체 Pod 의 1/PODS 가 방금 사라진 Pod 이고 그 IP 를 외운 클라이언트는 실패한다.
stale_window = min(CACHE_TTL_SEC, ROLLING_SEC + CACHE_TTL_SEC)  # 낡은 주소를 들고 있는 시간
fail_share = 1 / PODS                                            # 그 시간에 실패하는 요청 비율
fails_per_deploy = RPS * stale_window * fail_share
fails_a = fails_per_deploy * DEPLOYS_PER_DAY * DAYS

# 4단계: Service 주소 하나만 외울 때의 실패를 센다
# 방식 B 다. Service 의 IP 는 배포와 무관하게 그대로이고, Service 가 살아 있는 Pod 만 골라 보낸다. 실패는 교체 순간에 이미 연결이 진행 중이던 요청 정도로 줄어든다.
INFLIGHT_SEC = 1.0                                               # 교체 순간의 진행 중 요청 구간
fails_b = RPS * INFLIGHT_SEC * PODS * DEPLOYS_PER_DAY * DAYS

total_requests = RPS * 60 * 60 * 24 * DAYS

# 5단계: 두 방식의 한 달 실패를 견준다
print("방식 A — Pod IP를 직접 외운다")
print(f"  배포 1회당 실패 요청   {fails_per_deploy:>12,.0f}건")
print(f"  한 달 실패 요청        {fails_a:>12,.0f}건  (전체의 {fails_a/total_requests*100:.3f}%)")
print()
print("방식 B — Service 주소 하나만 외운다")
print(f"  한 달 실패 요청        {fails_b:>12,.0f}건  (전체의 {fails_b/total_requests*100:.3f}%)")
print()
print(f"차이  {fails_a/fails_b:,.0f}배")
print()
print("→ Pod 주소를 외우면 배포마다 실패가 쏟아진다. 사라진 Pod의 주소를 들고 찾아가니까.")
print("→ Service 주소는 배포와 무관하게 그대로다. 그래서 외울 값은 이거 하나여야 한다.")

# 출력:
# 2단계 뜻: Pod 3개가 하루 4번 배포할 때마다 새로 만들어져서, 한 달에 Pod IP 가 360번 바뀐다.
# 한 달 동안 Pod IP가 바뀌는 횟수  360회
#   = Pod 3개 × 배포 4회/일 × 30일
#
# 5단계 뜻: Pod IP 를 외우면 배포 1회마다 10,000건, 한 달에 1,200,000건(0.463%)이 실패한다. Service 주소만 외우면 36,000건(0.014%)으로 33배 적다.
# 방식 A — Pod IP를 직접 외운다
#   배포 1회당 실패 요청         10,000건
#   한 달 실패 요청           1,200,000건  (전체의 0.463%)
#
# 방식 B — Service 주소 하나만 외운다
#   한 달 실패 요청              36,000건  (전체의 0.014%)
#
# 차이  33배
#
# → Pod 주소를 외우면 배포마다 실패가 쏟아진다. 사라진 Pod의 주소를 들고 찾아가니까.
# → Service 주소는 배포와 무관하게 그대로다. 그래서 외울 값은 이거 하나여야 한다.
````

#### 블록 2

<!-- cb6 post=kubernetes-networking block=1 sha=cea3c7d46bca1c31 -->
````python
# 하는 일: 마이크로서비스 12개를 바깥에 낼 때 서비스마다 LoadBalancer 를 붙이는 경우와 Ingress 하나로 경로를 나누는 경우의 월 비용, 공인 IP, 인증서 관리 시간을 견준다.

# 1단계: 서비스 수와 LoadBalancer 요금, 인증서 관리 시간을 둔다
# "Ingress 없이 서비스마다 입구를 내면 안 되나?"에 비용으로 답한다. 요금은 대략치이고 공급자마다 다르다.
SERVICES = 12                 # 마이크로서비스 12개
LB_MONTHLY_USD = 18           # 클라우드 LoadBalancer 1개 월 요금(대략치, 공급자마다 다름)
CERT_MANAGE_MIN = 20          # 인증서 하나를 갱신, 점검하는 데 드는 시간(분/월)

# 2단계: 서비스마다 LoadBalancer 를 붙일 때를 센다
# 방식 A 다. 입구를 서비스 수만큼 여러 개 낸다.
a_cost = SERVICES * LB_MONTHLY_USD
a_ips = SERVICES               # 공인 IP도 그만큼 필요하다
a_certs = SERVICES             # 도메인, 인증서도 그만큼
a_minutes = SERVICES * CERT_MANAGE_MIN

# 3단계: Ingress 하나를 둘 때를 센다
# 방식 B 다. 입구 하나에서 경로로 나눈다.
b_cost = 1 * LB_MONTHLY_USD    # Ingress 컨트롤러 앞에 LB 하나만
b_ips = 1
b_certs = 1                    # 와일드카드 인증서 하나로 서브경로를 덮는다
b_minutes = 1 * CERT_MANAGE_MIN

# 4단계: 두 방식을 표로 견준다
print(f"마이크로서비스 {SERVICES}개를 바깥에 노출한다면\n")
print(f"{'':22}{'A) LB 여러 개':>16}{'B) Ingress 하나':>18}")
print(f"{'월 비용':22}{'$' + str(a_cost):>16}{'$' + str(b_cost):>18}")
print(f"{'공인 IP 개수':20}{a_ips:>16}{b_ips:>18}")
print(f"{'관리할 인증서':20}{a_certs:>16}{b_certs:>18}")
print(f"{'인증서 관리 시간':19}{str(a_minutes) + '분/월':>16}{str(b_minutes) + '분/월':>18}")
print()
print(f"월 비용 차이   ${a_cost - b_cost}  (연 ${(a_cost - b_cost) * 12})")
print(f"관리 시간 차이 {a_minutes - b_minutes}분/월  (연 {(a_minutes - b_minutes) * 12 / 60:.1f}시간)")
print()

# 5단계: 서비스 수가 늘 때 격차를 본다
# 서비스가 늘어나면 격차는 선형으로 벌어진다.
for n in (3, 12, 50):
    print(f"  서비스 {n:>2}개 → A) ${n * LB_MONTHLY_USD:>4}/월   B) ${LB_MONTHLY_USD}/월   ({n}배 차이)")
print()
print("→ 입구를 서비스마다 내면 입구 개수만큼 돈과 관리가 늘어난다.")
print("→ Ingress는 입구 하나에서 경로(/api, /admin)로 나누니, 서비스가 늘어도 입구는 하나다.")

# 출력:
# 4단계 뜻: 서비스 12개를 LoadBalancer 로 하나씩 내면 월 $216, Ingress 하나면 $18 이라 월 $198, 연 $2376 차이 난다. 관리할 인증서도 12개와 1개로, 관리 시간이 연 44.0시간 차이 난다.
# 마이크로서비스 12개를 바깥에 노출한다면
#
#                             A) LB 여러 개     B) Ingress 하나
# 월 비용                              $216               $18
# 공인 IP 개수                          12                 1
# 관리할 인증서                           12                 1
# 인증서 관리 시간                    240분/월             20분/월
#
# 월 비용 차이   $198  (연 $2376)
# 관리 시간 차이 220분/월  (연 44.0시간)
#
# 5단계 뜻: A) 는 서비스 수만큼 요금이 늘어 50개면 월 $900 이고, B) 는 서비스가 몇 개든 월 $18 이다.
#   서비스  3개 → A) $  54/월   B) $18/월   (3배 차이)
#   서비스 12개 → A) $ 216/월   B) $18/월   (12배 차이)
#   서비스 50개 → A) $ 900/월   B) $18/월   (50배 차이)
#
# → 입구를 서비스마다 내면 입구 개수만큼 돈과 관리가 늘어난다.
# → Ingress는 입구 하나에서 경로(/api, /admin)로 나누니, 서비스가 늘어도 입구는 하나다.
````

### 부록 12: software-architecture-patterns (블록 3개, Task 5)

#### 블록 1

<!-- cb6 post=software-architecture-patterns block=0 sha=642d158652bee0f7 -->
````python
# 하는 일: 주문 서비스가 결제, 재고, 알림을 직접 차례로 부를 때와 이벤트로 알릴 때의 주문 성공 확률과 연간 멈춤 시간을 견주고, 이벤트 방식에서 밀리는 알림을 센다.

# 1단계: 서비스 셋과 주문 서비스의 가용성을 둔다
# 주문 서비스가 결제, 재고, 알림 세 서비스를 써야 한다. 확률은 가상 수치다.
SERVICES = {
    "결제": 0.999,   # 각 서비스가 정상일 확률 (연간 99.9% = 약 8.8시간 장애)
    "재고": 0.999,
    "알림": 0.995,   # 알림은 외부 업체를 쓴다고 가정 — 좀 더 자주 흔들린다
}
ORDER_SELF = 0.999   # 주문 서비스 자신의 가용성

# 2단계: 가용성으로 연간 멈춤 시간을 구하는 함수를 만든다
def hours_down(availability):
    """연간 몇 시간 멈추나."""
    return (1 - availability) * 365 * 24

# 3단계: 직접 호출로 사슬을 엮어 확률을 곱한다
# 방식 A 다. 주문 → 결제 → 재고 → 알림 을 차례로 부르고 답을 기다려서, 하나라도 죽으면 주문이 실패한다.
a = ORDER_SELF
for v in SERVICES.values():
    a *= v
print("방식 A — 직접 호출 (하나라도 죽으면 주문 실패)")
print(f"  주문 성공 확률  {a*100:.3f}%")
print(f"  연간 멈춤 시간  {hours_down(a):.1f}시간")
print(f"  계산: {ORDER_SELF} × " + " × ".join(str(v) for v in SERVICES.values()))
print()

# 4단계: 이벤트로 알릴 때의 확률을 구하고, 직접 호출과의 차이를 찍는다
# 방식 B 다. 주문은 "주문됨" 한 줄만 남기고 끝내고, 나머지는 각자 그 줄을 읽고 알아서 한다.
# 주문 성공은 주문 서비스 + 메시지 큐만 살아 있으면 된다.
QUEUE = 0.9995
b = ORDER_SELF * QUEUE
print("방식 B — 이벤트 (주문은 기록만 하고 끝)")
print(f"  주문 성공 확률  {b*100:.3f}%")
print(f"  연간 멈춤 시간  {hours_down(b):.1f}시간")
print()
print(f"차이  연간 {hours_down(a) - hours_down(b):.1f}시간 = {hours_down(a)/hours_down(b):.1f}배")
print()

# 5단계: 알림이 죽은 동안 밀리는 알림을 센다
# 공짜가 아니다. 이벤트 방식에는 "주문은 됐는데 알림이 아직 안 갔다"는 상태가 있다. 알림 서비스가 30분 죽어 있으면, 그동안 쌓인 주문은 나중에 한꺼번에 처리된다.
ORDERS_PER_MIN = 200
for down_min in (5, 30, 120):
    backlog = ORDERS_PER_MIN * down_min
    print(f"  알림이 {down_min:>3}분 죽으면  주문 {backlog:>6,}건의 알림이 밀린다"
          f" (주문 자체는 전부 성공)")
print()
print("→ 직접 호출은 '전부 성공 아니면 실패'라 깔끔하지만, 사슬이 길수록 약해진다.")
print("→ 이벤트는 주문을 지켜내는 대신, '아직 안 된 일'이 시스템에 남는 걸 받아들인다.")
print("→ 그래서 고를 기준은 이것이다: 이 일은 '지금 당장' 끝나야 하나, '언젠가' 끝나면 되나.")

# 출력:
# 3단계 뜻: 주문 0.999 에 결제 0.999, 재고 0.999, 알림 0.995 를 곱하면 주문 성공 확률이 99.202% 로, 연간 69.9시간을 멈춘다.
# 방식 A — 직접 호출 (하나라도 죽으면 주문 실패)
#   주문 성공 확률  99.202%
#   연간 멈춤 시간  69.9시간
#   계산: 0.999 × 0.999 × 0.999 × 0.995
#
# 4단계 뜻: 이벤트로 끊으면 주문 성공 확률이 99.850% 로 연간 13.1시간만 멈춰, 직접 호출보다 56.8시간, 5.3배 적다.
# 방식 B — 이벤트 (주문은 기록만 하고 끝)
#   주문 성공 확률  99.850%
#   연간 멈춤 시간  13.1시간
#
# 차이  연간 56.8시간 = 5.3배
#
# 5단계 뜻: 대신 알림이 죽은 동안 알림이 밀린다. 30분이면 주문 6,000건의 알림이 밀리지만, 주문 자체는 전부 성공한다.
#   알림이   5분 죽으면  주문  1,000건의 알림이 밀린다 (주문 자체는 전부 성공)
#   알림이  30분 죽으면  주문  6,000건의 알림이 밀린다 (주문 자체는 전부 성공)
#   알림이 120분 죽으면  주문 24,000건의 알림이 밀린다 (주문 자체는 전부 성공)
#
# → 직접 호출은 '전부 성공 아니면 실패'라 깔끔하지만, 사슬이 길수록 약해진다.
# → 이벤트는 주문을 지켜내는 대신, '아직 안 된 일'이 시스템에 남는 걸 받아들인다.
# → 그래서 고를 기준은 이것이다: 이 일은 '지금 당장' 끝나야 하나, '언젠가' 끝나면 되나.
````

#### 블록 2

<!-- cb6 post=software-architecture-patterns block=1 sha=1771ec7136735906 -->
````python
# 하는 일: 기능 8개를 한 덩어리로 배포할 때와 기능별 서비스로 배포할 때, 월 사고 건수와 영향받는 사용자, 서비스 사이 호출 경로를 견준다.

# 1단계: 기능 수와 배포 횟수, 사고 확률, 사용자 수를 둔다
# 흔한 오해는 "마이크로서비스가 더 안전하다"이다. 실제로는 "장애가 미치는 범위가 좁아지는 대신, 장애가 날 기회가 많아진다"가 정확하다. 수치는 가상이다.
FEATURES = 8            # 기능(도메인) 8개
DEPLOYS_PER_FEATURE = 4 # 기능마다 한 달에 4번 배포
FAIL_RATE = 0.02        # 배포 1회가 사고로 이어질 확률 2%
USERS = 1_000_000

# 2단계: 모놀리식의 월 사고와 영향을 센다
# 한 덩이라 기능 하나만 고쳐도 전체를 배포한다.
mono_deploys = FEATURES * DEPLOYS_PER_FEATURE      # 배포 횟수는 같다
mono_blast = USERS                                  # 장애가 나면 전체 사용자
mono_incidents = mono_deploys * FAIL_RATE
mono_affected = mono_incidents * mono_blast

# 3단계: 마이크로서비스의 월 사고와 영향을 센다
# 기능별로 따로 배포한다.
micro_deploys = FEATURES * DEPLOYS_PER_FEATURE
micro_blast = USERS / FEATURES                      # 그 기능을 쓰는 사용자만
# 대신 서비스 간 호출이 늘어 배포 1회의 위험이 조금 커진다고 가정
MICRO_FAIL_RATE = 0.025
micro_incidents = micro_deploys * MICRO_FAIL_RATE
micro_affected = micro_incidents * micro_blast

# 4단계: 두 구조의 월 배포와 사고, 영향을 표로 견준다
print(f"기능 {FEATURES}개, 기능당 월 {DEPLOYS_PER_FEATURE}회 배포, 사용자 {USERS:,}명\n")
print(f"{'':16}{'월 배포':>8}{'사고 건수':>11}{'1건당 영향':>13}{'월 영향 사용자':>16}")
print(f"{'모놀리식':16}{mono_deploys:>8}{mono_incidents:>10.1f}건{mono_blast:>12,.0f}{mono_affected:>15,.0f}")
print(f"{'마이크로서비스':14}{micro_deploys:>8}{micro_incidents:>10.1f}건{micro_blast:>12,.0f}{micro_affected:>15,.0f}")
print(f"\n월 영향 사용자 차이  {mono_affected/micro_affected:.1f}배\n")

# 5단계: 기능 하나만 고치는 배포 한 번을 견준다
print("기능 1개를 고치는 배포 한 번을 비교하면")
print(f"  모놀리식        전체를 다시 올린다 → 위험에 노출되는 사용자 {USERS:,}명")
print(f"  마이크로서비스   그 서비스만 올린다 → 위험에 노출되는 사용자 {micro_blast:,.0f}명")
print(f"  → 같은 한 줄 수정인데 영향 범위가 {USERS/micro_blast:.0f}배 다르다\n")

# 6단계: 서비스가 늘 때 얽히는 호출 경로를 센다
# 공짜가 아닌 부분이다. 서비스가 늘면 서비스 간 호출이 늘고, 그만큼 새로운 실패 지점이 생긴다.
print("대가: 서비스가 늘면 '사이'가 늘어난다")
print(f"{'서비스 수':>10}{'가능한 호출 경로':>18}{'설명':>10}")
for n in (1, 4, 8, 20):
    pairs = n * (n - 1) // 2
    print(f"{n:>9}개{pairs:>16}개")
print("  → 서비스 20개면 서로 얽힐 수 있는 짝이 190개다.")
print("  → 코드가 아니라 '사이'를 관리하는 일이 새로 생긴다(추적, 재시도, 타임아웃).")
print()
print("→ 마이크로서비스는 '더 안전한 구조'가 아니다. 장애가 미치는 범위를 좁히는 구조다.")
print("→ 기능이 적고 팀이 작다면 모놀리식이 오히려 사고가 적다. 관리할 '사이'가 없으니까.")

# 출력:
# 4단계 뜻: 배포는 둘 다 월 32번이지만, 사고 1건의 영향이 1,000,000명과 125,000명으로 달라 월 영향 사용자가 6.4배 차이 난다. 사고 건수는 마이크로서비스가 0.8건으로 더 많다.
# 기능 8개, 기능당 월 4회 배포, 사용자 1,000,000명
#
#                     월 배포      사고 건수       1건당 영향        월 영향 사용자
# 모놀리식                  32       0.6건   1,000,000        640,000
# 마이크로서비스             32       0.8건     125,000        100,000
#
# 월 영향 사용자 차이  6.4배
#
# 5단계 뜻: 기능 한 줄을 고칠 때 모놀리식은 1,000,000명을, 마이크로서비스는 125,000명을 위험에 노출해 8배 다르다.
# 기능 1개를 고치는 배포 한 번을 비교하면
#   모놀리식        전체를 다시 올린다 → 위험에 노출되는 사용자 1,000,000명
#   마이크로서비스   그 서비스만 올린다 → 위험에 노출되는 사용자 125,000명
#   → 같은 한 줄 수정인데 영향 범위가 8배 다르다
#
# 6단계 뜻: 서비스가 늘면 서로 얽힐 수 있는 호출 경로가 빠르게 늘어, 8개면 28개, 20개면 190개다.
# 대가: 서비스가 늘면 '사이'가 늘어난다
#      서비스 수         가능한 호출 경로        설명
#         1개               0개
#         4개               6개
#         8개              28개
#        20개             190개
#   → 서비스 20개면 서로 얽힐 수 있는 짝이 190개다.
#   → 코드가 아니라 '사이'를 관리하는 일이 새로 생긴다(추적, 재시도, 타임아웃).
#
# → 마이크로서비스는 '더 안전한 구조'가 아니다. 장애가 미치는 범위를 좁히는 구조다.
# → 기능이 적고 팀이 작다면 모놀리식이 오히려 사고가 적다. 관리할 '사이'가 없으니까.
````

#### 블록 3

<!-- cb6 post=software-architecture-patterns block=2 sha=4addeabb4b9e05f3 -->
````python
# 하는 일: 초당 12,000건 가운데 95% 가 읽기인 서비스에 원본 하나와 복사본 몇 대가 필요한지 구하고, 읽기 비율이 바뀔 때와 복제 지연의 대가를 본다.

# 1단계: 요청 총량과 읽기 비율, 서버 한 대의 처리량을 두고 읽기와 쓰기 요청량을 구한다
# 원본(primary)은 쓰기를 받고, 복사본(replica)은 읽기만 받는다. 웹 서비스는 대개 읽기가 압도적으로 많아서 이 구조가 잘 통한다.
TOTAL_QPS = 12_000          # 초당 요청 총량
READ_SHARE = 0.95           # 그중 95%가 읽기 (게시글 보기, 목록 등)
CAPACITY_PER_NODE = 2_000   # 서버 한 대가 감당하는 초당 요청 (가상 수치)

reads = TOTAL_QPS * READ_SHARE
writes = TOTAL_QPS - reads

print(f"총 {TOTAL_QPS:,} QPS, 읽기 {reads:,.0f} ({READ_SHARE:.0%}), 쓰기 {writes:,.0f}")
print(f"서버 1대 처리량 {CAPACITY_PER_NODE:,} QPS (가상 수치)\n")

# 2단계: 원본 1대로만 버틸 때를 본다
print("① 원본 1대만 쓸 때")
print(f"   필요 처리량 {TOTAL_QPS:,} vs 가능 {CAPACITY_PER_NODE:,}"
      f"  →  {TOTAL_QPS/CAPACITY_PER_NODE:.1f}배 초과")
print("   서버를 더 크게 사는 방법밖에 없다(수직 확장). 한계가 금방 온다.\n")

# 3단계: 복사본을 둘 때 필요한 대수를 구한다
import math
replicas = math.ceil(reads / CAPACITY_PER_NODE)
print("② 원본 1대 + 복사본 N대")
print(f"   쓰기 {writes:,.0f} QPS → 원본 1대로 충분 (여유 {CAPACITY_PER_NODE - writes:,.0f})")
print(f"   읽기 {reads:,.0f} QPS → 복사본 {replicas}대 필요"
      f" ({reads:,.0f} ÷ {CAPACITY_PER_NODE:,} = {reads/CAPACITY_PER_NODE:.1f} → 올림)")
print(f"   합계 {1 + replicas}대\n")

# 4단계: 읽기 비율마다 필요한 대수와 원본 여유를 본다
print("읽기 비율이 바뀌면 필요한 대수도 바뀐다")
print(f"{'읽기 비율':>10}{'복사본':>8}{'원본 여유':>12}{'판정':>18}")
for share in (0.50, 0.80, 0.95, 0.99):
    r = TOTAL_QPS * share
    w = TOTAL_QPS - r
    need = math.ceil(r / CAPACITY_PER_NODE)
    slack = CAPACITY_PER_NODE - w
    verdict = "원본이 먼저 한계에 닿는다" if slack < 0 else "복사본으로 해결"
    print(f"{share:>9.0%}{need:>8}대{slack:>10,.0f}{verdict:>18}")
print()
print("→ 읽기가 많을수록 이 구조가 잘 통한다. 복사본만 늘리면 되니까.")
print("→ 쓰기가 절반이면 원본이 먼저 한계에 닿는다. 그때는 복사본이 아니라 샤딩(쪼개기)이 답이다.")
print()

# 5단계: 복제 지연이라는 대가를 찍는다
LAG_MS = 150
print(f"대가는 복제 지연이다. 원본에 쓴 값이 복사본에 도착하기까지 약 {LAG_MS}ms 걸린다면,")
print(f"  글을 쓴 직후 새로고침하면 {LAG_MS}ms 안에는 '방금 쓴 글이 없다'고 나올 수 있다.")
print("  그래서 '내가 쓴 것'은 원본에서 읽고, '남이 쓴 것'만 복사본에서 읽는 규칙을 둔다.")

# 출력:
# 1단계 뜻: 12,000 QPS 가운데 95% 인 11,400 이 읽기이고 쓰기는 600 이다. 서버 1대는 2,000 QPS 를 감당한다.
# 총 12,000 QPS, 읽기 11,400 (95%), 쓰기 600
# 서버 1대 처리량 2,000 QPS (가상 수치)
#
# 2단계 뜻: 원본 1대로는 필요한 12,000 이 감당할 수 있는 2,000 의 6.0배라, 서버를 더 크게 사는 수직 확장밖에 없다.
# ① 원본 1대만 쓸 때
#    필요 처리량 12,000 vs 가능 2,000  →  6.0배 초과
#    서버를 더 크게 사는 방법밖에 없다(수직 확장). 한계가 금방 온다.
#
# 3단계 뜻: 쓰기 600 QPS 는 원본 1대로 충분하고, 읽기 11,400 QPS 는 복사본 6대가 받아 모두 7대면 된다.
# ② 원본 1대 + 복사본 N대
#    쓰기 600 QPS → 원본 1대로 충분 (여유 1,400)
#    읽기 11,400 QPS → 복사본 6대 필요 (11,400 ÷ 2,000 = 5.7 → 올림)
#    합계 7대
#
# 4단계 뜻: 읽기가 50%, 80% 면 원본 여유가 -4,000, -400 으로 원본이 먼저 한계에 닿는다. 95% 부터는 복사본 6대로 해결된다.
# 읽기 비율이 바뀌면 필요한 대수도 바뀐다
#      읽기 비율     복사본       원본 여유                판정
#       50%       3대    -4,000    원본이 먼저 한계에 닿는다
#       80%       5대      -400    원본이 먼저 한계에 닿는다
#       95%       6대     1,400          복사본으로 해결
#       99%       6대     1,880          복사본으로 해결
#
# → 읽기가 많을수록 이 구조가 잘 통한다. 복사본만 늘리면 되니까.
# → 쓰기가 절반이면 원본이 먼저 한계에 닿는다. 그때는 복사본이 아니라 샤딩(쪼개기)이 답이다.
#
# 5단계 뜻: 복사본이 원본을 150ms 늦게 따라오면 방금 쓴 글이 안 보일 수 있어서, 내가 쓴 것은 원본에서 읽는 규칙을 둔다.
# 대가는 복제 지연이다. 원본에 쓴 값이 복사본에 도착하기까지 약 150ms 걸린다면,
#   글을 쓴 직후 새로고침하면 150ms 안에는 '방금 쓴 글이 없다'고 나올 수 있다.
#   그래서 '내가 쓴 것'은 원본에서 읽고, '남이 쓴 것'만 복사본에서 읽는 규칙을 둔다.
````

---

### Task 1: model-serving-architecture 블록 5개 옮기기와 화면 확인

**Files:**
- Modify: `posts/model-serving-architecture.md` (파이썬 블록 5개를 새 블록으로)
- Modify: `scripts/code-blocks-baseline.json`
- 임시: `$SCRATCH/migrate_batch6.py`, `$SCRATCH/nocache_server.py`, `$SCRATCH/venv` (저장소에 넣지 않는다. Task 2~6 도 쓴다)

**Interfaces:**
- Consumes: 다섯째 묶음이 올라간 main(새 형식 162개, 옛 형식 85개, 29편), 이 계획 부록 1 의 새 블록 5개
- Produces: 새 형식 블록 167개, 옛 형식 80개(28편). Task 2~5 가 같은 도우미를 `python3 "$SCRATCH/migrate_batch6.py" <계획 문서> posts <글 파일 이름>` 으로 쓴다. 옮기면 `<글 파일 이름>: 블록 N개를 옮겼습니다` 를 찍고 종료 코드 0 이다. 멈추면 `<글 파일 이름>: 바꾸지 않고 멈춥니다` 와 까닭 줄을 찍고 종료 코드 1 이며, 글은 그대로다.

첫째와 넷째 블록은 의사코드라 실행 검사가 「실행 안 됨」으로 센다(Review Focus 1). 둘째 블록은 선 글자 막대를 찍는다(Review Focus 3). 나머지 셋은 표준 라이브러리로 돈다.

- [ ] **Step 1: 시작 상태를 본다**

Run (저장소 루트에서):

````bash
python3 --version
git status --short
node scripts/check-code-blocks.js | tail -1
````

Expected: `Python 3.9.7`(3.9 대면 된다), `git status` 는 아무것도 찍지 않는다, `✓ 새 형식 블록 162개, 옛 형식 블록 85개, 문제 0건`. 블록 수가 다르면 멈추고 알린다. 다섯째 묶음이 덜 올라갔거나 다른 일이 끼어든 것이다.

- [ ] **Step 2: 도우미와 서버 파일을 저장소 밖에 둔다**

`$SCRATCH/migrate_batch6.py` 는 아래 내용이다. 다섯째 묶음 도우미와 표시 줄 이름(`cb6`)과 머리 설명만 다르다. 새 블록 글은 이 계획 문서의 부록에서 읽는다.

<!-- file $SCRATCH/migrate_batch6.py -->
````python
#!/usr/bin/env python3
"""여섯째 묶음(ML 인프라 글 8편과 소프트웨어 공학 글 4편)의 파이썬 블록을 새 형식(하는 일, 단계, 뜻)으로 옮기는 일회용 도우미. 저장소에 넣지 않는다.

새 블록 글은 계획 문서에 있다. 블록마다 표시 줄
  <!-- cb6 post=<글 파일 이름> block=<0부터 센 파이썬 블록 번호> sha=<원본 블록 sha256 앞 16자> -->
바로 아래 네 백틱 python 울타리 안이 새 블록 전체다. 표시 줄 끝에 old=run 이 붙은 블록은
옛 출력이 코드가 찍는 값과 달라서(설계 문서 8-1) 찍힌 줄을 돌려서 받아 적은 블록이다.

바꾸기 전에 셋을 본다. 하나라도 어긋나면 아무것도 바꾸지 않고 멈춘다.
  1. 원본 블록이 계획을 쓸 때와 같다 (sha)
  2. 새 블록의 코드 줄(빈 줄과 # 로 시작하는 줄을 뺀 줄)이 원본과 글자까지 같다
  3. 새 블록의 찍힌 줄(뜻 줄을 뺀 출력 영역)이 원본 블록의 옛 출력과 글자까지 같다.
     old=run 블록은 이 비교를 건너뛴다. 그 블록의 찍힌 줄은 실행 검사가 본다
그다음 파이썬 블록 안의 글만 새 블록으로 바꾼다. 블록 밖의 글은 건드리지 않는다.

  python3 migrate_batch6.py <계획 문서> <posts 폴더> <글 파일 이름>
"""
import hashlib
import re
import sys

PLAN, POSTS, POST = sys.argv[1], sys.argv[2], sys.argv[3]
TICKS = '`' * 4  # 계획 문서의 네 백틱 울타리
MARK = re.compile(r'^<!-- cb6 post=(\S+) block=(\d+) sha=([0-9a-f]{16})( old=run)? -->\n'
                  + TICKS + r'python\n(.*?)^' + TICKS + r'[ \t]*$', re.S | re.M)
FENCE = re.compile(r'^```([^\n`]*)\n(.*?)^```[ \t]*$', re.S | re.M)
OUT = re.compile(r'^# 출력(?=[\s(:]|$)')     # 실행 검사(scripts/check-python-outputs.py)와 같은 출력 표시
MEAN = re.compile(r'^# (?:\d+단계 )?뜻: ')


def code_lines(src):
    return [l for l in src.split('\n') if l.strip() and not l.lstrip().startswith('#')]


def printed(src, new):
    """출력 영역의 찍힌 줄들. 새 블록은 뜻 줄을 뺀다. 출력 영역이 없으면 빈 목록."""
    lines = src.rstrip('\n').split('\n')
    k = next((i for i, l in enumerate(lines) if OUT.match(l)), None)
    if k is None:
        return []
    rest = [l for l in lines[k + 1:] if not (new and MEAN.match(l))]
    rest = [l[2:] if l.startswith('# ') else l[1:] if l.startswith('#') else l for l in rest]
    rest = [l.rstrip() for l in rest]
    while rest and not rest[-1]:
        rest.pop()
    return rest


plan = open(PLAN, encoding='utf-8').read()
want = {int(m.group(2)): (m.group(3), bool(m.group(4)), m.group(5))
        for m in MARK.finditer(plan) if m.group(1) == POST}
if not want:
    sys.exit(f'{POST}: 계획 문서에 이 글의 블록이 없습니다')

path = f'{POSTS}/{POST}.md'
text = open(path, encoding='utf-8').read()
py = [f for f in FENCE.finditer(text) if f.group(1).strip() == 'python']
problems, edits = [], []
if len(py) != len(want):
    problems.append(f'글의 파이썬 블록은 {len(py)}개인데 계획에는 {len(want)}개입니다')
for n, (sha, from_run, new) in sorted(want.items()):
    if n >= len(py):
        problems.append(f'{n}번 블록이 글에 없습니다')
        continue
    f = py[n]
    got = hashlib.sha256(f.group(2).encode('utf-8')).hexdigest()[:16]
    if got != sha:
        problems.append(f'{n}번 블록이 계획을 쓸 때와 다릅니다 (기대 {sha}, 실제 {got})')
        continue
    if code_lines(new) != code_lines(f.group(2)):
        problems.append(f'{n}번 블록의 코드 줄이 원본과 다릅니다')
        continue
    if not from_run and printed(new, True) != printed(f.group(2), False):
        problems.append(f'{n}번 블록의 찍힌 줄이 원본 블록의 옛 출력과 다릅니다')
        continue
    edits.append((f.start(2), f.end(2), new))
if problems:
    sys.exit(f'{POST}: 바꾸지 않고 멈춥니다\n  ' + '\n  '.join(problems))

# 뒤에서부터 바꿔야 앞쪽 자리가 그대로다
for a, b, new in reversed(edits):
    text = text[:a] + new + text[b:]
open(path, 'w', encoding='utf-8').write(text)
print(f'{POST}: 블록 {len(edits)}개를 옮겼습니다')
````

서버 파일은 아래 내용이다.

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

계획에서 뽑아 둔다(저장소 루트에서, 계획 문서가 커밋돼 있어야 한다).

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch6"; mkdir -p "$SCRATCH"
python3 - migrate_batch6.py nocache_server.py <<'EOF'
import os, re, sys
T = '`' * 4
plan = open('docs/superpowers/plans/2026-10-16-python-code-blocks-batch6.md', encoding='utf-8').read()
for name in sys.argv[1:]:
    m = re.search(r'^<!-- file \$SCRATCH/' + re.escape(name) + r' -->\n' + T + r'[a-z]*\n(.*?)^' + T + r'\n', plan, re.S | re.M)
    dest = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'code-steps-batch6', name)
    if not os.path.exists(dest):
        open(dest, 'w', encoding='utf-8').write(m.group(1))
    print(dest)
EOF
````

Expected: 파일 경로 두 줄. 이미 있는 파일은 그대로 둔다.

- [ ] **Step 3: 옮긴다**

Run: `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch6"; python3 "$SCRATCH/migrate_batch6.py" docs/superpowers/plans/2026-10-16-python-code-blocks-batch6.md posts model-serving-architecture`
Expected: `model-serving-architecture: 블록 5개를 옮겼습니다`. `바꾸지 않고 멈춥니다` 로 끝나면 이 태스크를 멈추고 까닭 줄을 그대로 알린다.

- [ ] **Step 4: 코드 줄과 블록 밖 글이 그대로인지, 표시 줄과 옮긴 주석을 본다**

Run:

````bash
python3 - model-serving-architecture <<'EOF'
import re, subprocess, sys
PY = re.compile(r'^```python[^\n]*\n(.*?)^```[ \t]*$', re.S | re.M)
code = lambda b: [l for l in b.split('\n') if l.strip() and not l.lstrip().startswith('#')]
# (글, 0부터 센 블록, 새 블록에 있어야 할 말, 새 블록에 없어야 할 옛 주석 줄)
MOVED = [
    ('model-serving-architecture', 0, '# (의사코드 — 그대로 실행되지 않습니다.)\n# 하는 일: ', '# (의사코드 — 구조만 보여 줍니다. 그대로 실행되지 않습니다.)'),
    ('model-serving-architecture', 0, 'Multi-Stage Ranking Pipeline 이 10ms 예산 안에서 도는 구조만 보여 준다', '# 수천 후보 → 1개 선택, 총 10ms 이내'),
    ('model-serving-architecture', 1, '자리 크기만 맞췄고 사내에서 잰 값이 아니다', '# 100ms 예산을 어디서 넘나 — 구간을 더해 본다.'),
    ('model-serving-architecture', 2, '사내에서 잰 값이 아니라 자리 크기만 맞춘 대략치다', '# (가상 수치입니다. 사내에서 잰 값이 아니라 자리 크기만 맞춘 대략치입니다.)'),
    ('model-serving-architecture', 3, '# (의사코드 — 그대로 실행되지 않습니다.)\n# 하는 일: ', '# (의사코드 — 구조만 보여 줍니다. 그대로 실행되지 않습니다.)'),
    ('model-serving-architecture', 3, '모델 장애에도 입찰 기회를 놓치지 않는 방어 계층인 Timeout Fallback', '# 모델 장애에도 입찰 기회를 놓치지 않는 방어 계층'),
]
fail = False
for post in sys.argv[1:]:
    old = subprocess.run(['git', 'show', f'HEAD:posts/{post}.md'], capture_output=True, text=True, check=True).stdout
    new = open(f'posts/{post}.md', encoding='utf-8').read()
    ob, nb = [m.group(1) for m in PY.finditer(old)], [m.group(1) for m in PY.finditer(new)]
    assert len(ob) == len(nb), (post, len(ob), len(nb))
    bad = [i for i, (a, b) in enumerate(zip(ob, nb)) if code(a) != code(b)]
    same = PY.sub('@', old) == PY.sub('@', new)
    print(f'{post}: 코드 줄이 바뀐 블록 {bad}, 블록 밖 글 {"같다" if same else "다르다"}')
    fail = fail or bool(bad or not same)
    for p, n, want, gone in MOVED:
        if p != post:
            continue
        has = want in nb[n]
        left = gone in nb[n].split('\n')
        print(f'  {n + 1}번째 블록: 옮긴 말 {"있다" if has else "없다"}, 옛 주석 줄 {"남았다" if left else "없다"}')
        fail = fail or not has or left
sys.exit(1 if fail else 0)
EOF
````

Expected: 일곱 줄

````text
model-serving-architecture: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다
  1번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
  1번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
  2번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
  3번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
  4번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
  4번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
````

- [ ] **Step 5: 검사를 돌린다**

Run: `node scripts/check-code-blocks.js`
Expected: 두 줄

````text
  기준표보다 줄어든 글 1편 (model-serving-architecture.md 5→0) — node scripts/check-code-blocks.js --update 로 기준표를 줄입니다
✓ 새 형식 블록 167개, 옛 형식 블록 80개, 문제 0건
````

Run: `python3 scripts/check-python-outputs.py --post model-serving-architecture`
Expected: `✓ 통과 3, 건너뜀 2 (라이브러리 없음 0, 실행 안 됨 2), 실패 0` — 첫째와 넷째 블록이 의사코드라 돌리지 않는다. 「라이브러리 없음」이나 실패로 세면 멈추고 알린다.

CI 와 같은 표준 라이브러리 파이썬으로도 돌린다(이 묶음의 블록은 표준 라이브러리만 써서 결과가 같아야 한다):

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch6"; python3 -m venv --without-pip "$SCRATCH/venv"
"$SCRATCH/venv/bin/python" scripts/check-python-outputs.py --post model-serving-architecture | tail -1
````

Expected: `✓ 통과 3, 건너뜀 2 (라이브러리 없음 0, 실행 안 됨 2), 실패 0`

Run: `node scripts/check-wording.js`
Expected: 종료 코드 0

- [ ] **Step 6: 기준표를 줄인다**

Run: `node scripts/check-code-blocks.js --update`
Expected: `기준표를 다시 적었습니다 — 옛 형식 블록 80개, 글 28편`

- [ ] **Step 7: 첫 글을 화면으로 본다**

서버를 백그라운드로 띄우고(저장소 루트에서 `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch6"; python3 "$SCRATCH/nocache_server.py" "$(pwd)" 8774`, 파일은 Step 2 가 뽑았다) `http://127.0.0.1:8774/post.html?id=model-serving-architecture` 를 새 캐시(`new_page` 에 `isolatedContext` 이름)로 연다. 이후 브라우저 도구를 부를 때마다 그 페이지의 `pageId` 를 넘긴다. 아래 함수를 돌린다. 숨긴 iframe 을 네 폭으로 바꿔 가며 잰다. 목록의 앞은 글 id, 뒤는 파일 이름이다.

````js
async () => {
  const POSTS = [['model-serving-architecture', 'model-serving-architecture']];
  const f = document.createElement('iframe');
  f.style.cssText = 'position:absolute;left:-10000px;top:0;height:900px;border:0';
  document.body.appendChild(f);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const out = {};
  for (const w of [1440, 1280, 1024, 390]) {
    f.style.width = w + 'px';
    for (const [id, file] of POSTS) {
      await new Promise(r => { f.onload = r; f.src = `post.html?id=${id}&w=${w}&t=${Date.now()}`; });
      const d = f.contentDocument;
      for (let i = 0; i < 40 && !d.querySelector('.cb-row'); i++) await wait(250);
      await d.fonts.ready;
      await wait(700);
      const md = await (await fetch(`posts/${file}.md`)).text();
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

Expected: 네 값 모두 `"5 true 2 0 false 0 0 0"` — 블록 5개, 원문과 같다, 출력 없는 블록 2(의사코드 둘), 바로 뒤에 남은 다른 코드 블록 0, 넘침 없음, 메모 겹침 0, 배치 빠짐 0, 용어 풀이와 수식이 끼어든 곳 0.

그림을 `.playwright-mcp/batch6/` 에 찍는다. 1440 폭(창 1440×1000)과 390 폭(390px iframe 하나만 둔 감싸는 페이지), 라이트와 다크(`document.documentElement.setAttribute('data-theme','dark')`)다. 둘째 블록(선 글자 막대, 뜻 셋), 다섯째 블록(캐시 표, 뜻 둘), 첫째 블록(의사코드 표시)을 담는다. 블록이 길면 머리와 출력 영역으로 나눠 찍고 이름에 `-top`, `-out` 을 붙인다. 390 폭에서 파란 메뉴 단추(`#sidebar-toggle`)가 코드를 가리면 감싸는 페이지의 iframe 문서에 `#sidebar-toggle{display:none !important}` 를 넣은 `<style>` 을 붙여 숨긴다(인라인 `display:none` 은 글의 스크롤 처리가 되살린다). 글 안의 데모 iframe 은 `loading="lazy"` 라 스크롤하며 뒤 블록을 밀어내니, 위치를 재기 전에 `eager` 로 바꾸고 3초쯤 기다린다. 문서에 `scroll-behavior: smooth` 가 있어 `scrollTo` 에는 `behavior: 'instant'` 를 준다.

볼 것: 첫째 블록 머리에 「의사코드」 라벨이 서고 하는 일이 그 아래 굵게 선다. 둘째 블록의 막대 줄은 접히지 않고 블록 안에서만 옆으로 밀리며, 390 폭에서도 페이지는 넘치지 않는다. 다섯째 블록은 뜻 줄 둘이 각자 자기 찍힌 줄 묶음에 붙는다. 서버를 끈다.

- [ ] **Step 8: 커밋**

````bash
git add posts/model-serving-architecture.md scripts/code-blocks-baseline.json
git commit -F - <<'EOF'
feat(posts): ML 인프라와 소프트웨어 공학 글 — 모델 서빙 아키텍처 글의 파이썬 블록 5개를 하는 일, 단계, 뜻 형식으로

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

리뷰에서 블록 글을 고치게 되면 그 글을 직접 고친다(도우미는 원본 블록에만 돈다). 고친 커밋의 제목도 `fix(posts): ML 인프라와 소프트웨어 공학 글 — …` 으로 시작한다. Task 6 이 이 머리로 글 커밋을 찾아 하나로 합친다. Task 2~5 도 같다.

---

### Task 2: 로그 글 두 편 블록 8개 옮기기

**Files:**
- Modify: `posts/ad-log-pipeline.md` (4개), `posts/ad-log-system.md` (4개)
- Modify: `scripts/code-blocks-baseline.json`

**Interfaces:**
- Consumes: `$SCRATCH/migrate_batch6.py`(Step 1 이 없으면 계획에서 다시 뽑는다), 이 계획 부록 2~3 의 새 블록 8개
- Produces: 새 형식 블록 175개, 옛 형식 블록 72개(26편)

ad-log-pipeline 첫째와 넷째 블록은 pyspark 를 쓰는 Spark 예시라, ad-log-system 첫째와 둘째 블록은 의사코드라 돌리지 않는다(Review Focus 1). ad-log-pipeline 셋째 블록과 ad-log-system 셋째 블록은 돌지만 찍는 것이 없다(Review Focus 2).

- [ ] **Step 1: 도우미가 있는지 본다**

Run (저장소 루트에서):

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch6"; mkdir -p "$SCRATCH"
python3 - migrate_batch6.py <<'EOF'
import os, re, sys
T = '`' * 4
plan = open('docs/superpowers/plans/2026-10-16-python-code-blocks-batch6.md', encoding='utf-8').read()
for name in sys.argv[1:]:
    m = re.search(r'^<!-- file \$SCRATCH/' + re.escape(name) + r' -->\n' + T + r'[a-z]*\n(.*?)^' + T + r'\n', plan, re.S | re.M)
    dest = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'code-steps-batch6', name)
    if not os.path.exists(dest):
        open(dest, 'w', encoding='utf-8').write(m.group(1))
    print(dest)
EOF
````

Expected: 파일 경로 한 줄

- [ ] **Step 2: 두 편을 차례로 옮긴다**

Run:

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch6"
for p in ad-log-pipeline ad-log-system; do
  python3 "$SCRATCH/migrate_batch6.py" docs/superpowers/plans/2026-10-16-python-code-blocks-batch6.md posts "$p" || break
done
````

Expected: 두 줄

````text
ad-log-pipeline: 블록 4개를 옮겼습니다
ad-log-system: 블록 4개를 옮겼습니다
````

`바꾸지 않고 멈춥니다` 가 나오면 거기서 멈추고, 까닭 줄과 그때까지 옮긴 글을 그대로 알린다. 그 글을 손으로 고치지 않는다.

- [ ] **Step 3: 코드 줄과 블록 밖 글이 그대로인지, 표시 줄과 옮긴 주석을 본다**

Run:

````bash
python3 - ad-log-pipeline ad-log-system <<'EOF'
import re, subprocess, sys
PY = re.compile(r'^```python[^\n]*\n(.*?)^```[ \t]*$', re.S | re.M)
code = lambda b: [l for l in b.split('\n') if l.strip() and not l.lstrip().startswith('#')]
# (글, 0부터 센 블록, 새 블록에 있어야 할 말, 새 블록에 없어야 할 옛 주석 줄)
MOVED = [
    ('ad-log-pipeline', 0, '# (Spark 예시 — 그대로 실행되지 않습니다.)\n# 하는 일: ', '# pCTR 학습 데이터 = Impression Log + Click Log + Feature Log JOIN'),
    ('ad-log-pipeline', 0, '결과는 노출된 모든 (user, ad) 쌍에 대해 X = feature_vector(서빙 시점 그대로), y = clicked(0 or 1) 다', '# 결과: 노출된 모든 (user, ad) 쌍에 대해'),
    ('ad-log-pipeline', 1, '행 크기(저장 단가)는 Parquet 압축 뒤의 대략치이고', '# 저장 단가는 Parquet 압축 후 대략치다. 실제 값은 회사와 리전마다 다르다.'),
    ('ad-log-pipeline', 3, '# (Spark 예시 — 그대로 실행되지 않습니다.)\n# 하는 일: ', '# 로그 파이프라인 건전성 체크: 일일 배치'),
    ('ad-log-system', 0, '# (의사코드 — 그대로 실행되지 않습니다.)\n# 하는 일: ', '# (의사코드 — 구조만 보여 줍니다. 그대로 실행되지 않습니다.)'),
    ('ad-log-system', 1, '# (의사코드 — 그대로 실행되지 않습니다.)\n# 하는 일: ', '# (의사코드 — 구조만 보여 줍니다. 그대로 실행되지 않습니다.)'),
    ('ad-log-system', 2, '자리만 보여 주며, 돌려도 찍는 것은 없다', '# (구조 예시 — 자리만 보여 줍니다. 그대로 실행해도 출력은 없습니다.)'),
    ('ad-log-system', 3, '스키마를 세 가지로 고친 뒤 새 코드로 어제 로그를 읽어 어디서 오류가 나는지 보고', "# 스키마를 고치면 '어제 로그'를 읽다가 어디서 오류가 나나 — 직접 읽어 본다."),
]
fail = False
for post in sys.argv[1:]:
    old = subprocess.run(['git', 'show', f'HEAD:posts/{post}.md'], capture_output=True, text=True, check=True).stdout
    new = open(f'posts/{post}.md', encoding='utf-8').read()
    ob, nb = [m.group(1) for m in PY.finditer(old)], [m.group(1) for m in PY.finditer(new)]
    assert len(ob) == len(nb), (post, len(ob), len(nb))
    bad = [i for i, (a, b) in enumerate(zip(ob, nb)) if code(a) != code(b)]
    same = PY.sub('@', old) == PY.sub('@', new)
    print(f'{post}: 코드 줄이 바뀐 블록 {bad}, 블록 밖 글 {"같다" if same else "다르다"}')
    fail = fail or bool(bad or not same)
    for p, n, want, gone in MOVED:
        if p != post:
            continue
        has = want in nb[n]
        left = gone in nb[n].split('\n')
        print(f'  {n + 1}번째 블록: 옮긴 말 {"있다" if has else "없다"}, 옛 주석 줄 {"남았다" if left else "없다"}')
        fail = fail or not has or left
sys.exit(1 if fail else 0)
EOF
````

Expected: 열 줄

````text
ad-log-pipeline: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다
  1번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
  1번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
  2번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
  4번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
ad-log-system: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다
  1번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
  2번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
  3번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
  4번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
````

- [ ] **Step 4: 실행 검사를 돌린다**

Run:

````bash
python3 --version
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch6"; test -x "$SCRATCH/venv/bin/python" || python3 -m venv --without-pip "$SCRATCH/venv"
for p in ad-log-pipeline ad-log-system; do
  python3 scripts/check-python-outputs.py --post "$p"; echo "  exit=$?"
  "$SCRATCH/venv/bin/python" scripts/check-python-outputs.py --post "$p" | tail -1
done
````

Expected: `Python 3.9.7`, 그다음 글마다 같은 줄 두 번(로컬과 표준 라이브러리 venv)과 `exit=0` 이다. ad-log-pipeline 과 ad-log-system 모두 `✓ 통과 2, 건너뜀 2 (라이브러리 없음 0, 실행 안 됨 2), 실패 0` 이다. pyspark 블록이 「라이브러리 없음」으로 세면 표시 줄이 빠진 것이다. 멈추고 알린다(Review Focus 1).

- [ ] **Step 5: 형식 검사, 말투 검사, 기준표**

Run: `node scripts/check-code-blocks.js | tail -1`
Expected: `✓ 새 형식 블록 175개, 옛 형식 블록 72개, 문제 0건`

Run: `node scripts/check-wording.js`
Expected: 종료 코드 0

Run: `node scripts/check-code-blocks.js --update`
Expected: `기준표를 다시 적었습니다 — 옛 형식 블록 72개, 글 26편`

- [ ] **Step 6: 커밋**

````bash
git add posts/ad-log-pipeline.md posts/ad-log-system.md scripts/code-blocks-baseline.json
git commit -F - <<'EOF'
feat(posts): ML 인프라와 소프트웨어 공학 글 — 로그 파이프라인, 로그 시스템 설계 글의 파이썬 블록 8개를 하는 일, 단계, 뜻 형식으로

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

---

### Task 3: 임베딩, 투 타워, 피처 스토어 세 편 블록 10개 옮기기

**Files:**
- Modify: `posts/embedding-table-ops.md` (5개), `posts/two-tower-retrieval.md` (3개), `posts/feature-store-serving.md` (2개)
- Modify: `scripts/code-blocks-baseline.json`

**Interfaces:**
- Consumes: `$SCRATCH/migrate_batch6.py`(Step 1 이 없으면 계획에서 다시 뽑는다), 이 계획 부록 4~6 의 새 블록 10개
- Produces: 새 형식 블록 185개, 옛 형식 블록 62개(23편)

세 편 모두 표준 라이브러리로 돈다. feature-store-serving 첫째 블록은 돌지만 찍는 것이 없다(Review Focus 2). 그 블록의 마지막 코드 줄 뒤 「# → …」 두 줄은 메모 한 줄로 이었다(Review Focus 4).

- [ ] **Step 1: 도우미가 있는지 본다**

Run (저장소 루트에서):

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch6"; mkdir -p "$SCRATCH"
python3 - migrate_batch6.py <<'EOF'
import os, re, sys
T = '`' * 4
plan = open('docs/superpowers/plans/2026-10-16-python-code-blocks-batch6.md', encoding='utf-8').read()
for name in sys.argv[1:]:
    m = re.search(r'^<!-- file \$SCRATCH/' + re.escape(name) + r' -->\n' + T + r'[a-z]*\n(.*?)^' + T + r'\n', plan, re.S | re.M)
    dest = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'code-steps-batch6', name)
    if not os.path.exists(dest):
        open(dest, 'w', encoding='utf-8').write(m.group(1))
    print(dest)
EOF
````

Expected: 파일 경로 한 줄

- [ ] **Step 2: 세 편을 차례로 옮긴다**

Run:

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch6"
for p in embedding-table-ops two-tower-retrieval feature-store-serving; do
  python3 "$SCRATCH/migrate_batch6.py" docs/superpowers/plans/2026-10-16-python-code-blocks-batch6.md posts "$p" || break
done
````

Expected: 세 줄

````text
embedding-table-ops: 블록 5개를 옮겼습니다
two-tower-retrieval: 블록 3개를 옮겼습니다
feature-store-serving: 블록 2개를 옮겼습니다
````

`바꾸지 않고 멈춥니다` 가 나오면 거기서 멈추고, 까닭 줄과 그때까지 옮긴 글을 그대로 알린다. 그 글을 손으로 고치지 않는다.

- [ ] **Step 3: 코드 줄과 블록 밖 글이 그대로인지, 옮긴 주석을 본다**

Run:

````bash
python3 - embedding-table-ops two-tower-retrieval feature-store-serving <<'EOF'
import re, subprocess, sys
PY = re.compile(r'^```python[^\n]*\n(.*?)^```[ \t]*$', re.S | re.M)
code = lambda b: [l for l in b.split('\n') if l.strip() and not l.lstrip().startswith('#')]
# (글, 0부터 센 블록, 새 블록에 있어야 할 말, 새 블록에 없어야 할 옛 주석 줄)
MOVED = [
    ('embedding-table-ops', 0, '서빙은 파라미터만 들면 되지만 학습은 옵티마이저 상태까지 든다', '# 임베딩 테이블이 메모리를 얼마나 먹는지 직접 곱해 본다.'),
    ('two-tower-retrieval', 0, '숫자는 가상이지만 실제 범위에서 크게 벗어나지 않게 잡았다', '# 왜 후보 전체에 정밀 모델을 못 돌리는가 — 곱셈 횟수를 직접 세어 본다.'),
    ('feature-store-serving', 0, '# 이 벡터가 pCTR 모델에 들어가 pCTR(user=U98712, ad=A001) = 0.038 같은 값을 낸다.', '# → pCTR(user=U98712, ad=A001) = 0.038'),
    ('feature-store-serving', 0, '피처 벡터 하나로 합친 모양을 간략히 보여 주며', '# Feature Vector 조합 (간략화)'),
    ('feature-store-serving', 1, '이게 training-serving skew 다', '# 정의는 같은데 기준 시점이 다르다. 이게 training-serving skew다.'),
]
fail = False
for post in sys.argv[1:]:
    old = subprocess.run(['git', 'show', f'HEAD:posts/{post}.md'], capture_output=True, text=True, check=True).stdout
    new = open(f'posts/{post}.md', encoding='utf-8').read()
    ob, nb = [m.group(1) for m in PY.finditer(old)], [m.group(1) for m in PY.finditer(new)]
    assert len(ob) == len(nb), (post, len(ob), len(nb))
    bad = [i for i, (a, b) in enumerate(zip(ob, nb)) if code(a) != code(b)]
    same = PY.sub('@', old) == PY.sub('@', new)
    print(f'{post}: 코드 줄이 바뀐 블록 {bad}, 블록 밖 글 {"같다" if same else "다르다"}')
    fail = fail or bool(bad or not same)
    for p, n, want, gone in MOVED:
        if p != post:
            continue
        has = want in nb[n]
        left = gone in nb[n].split('\n')
        print(f'  {n + 1}번째 블록: 옮긴 말 {"있다" if has else "없다"}, 옛 주석 줄 {"남았다" if left else "없다"}')
        fail = fail or not has or left
sys.exit(1 if fail else 0)
EOF
````

Expected: 여덟 줄

````text
embedding-table-ops: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다
  1번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
two-tower-retrieval: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다
  1번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
feature-store-serving: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다
  1번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
  1번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
  2번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
````

- [ ] **Step 4: 실행 검사를 돌리고 걸린 시간을 적는다**

Run:

````bash
python3 --version
for p in embedding-table-ops two-tower-retrieval feature-store-serving; do
  s=$SECONDS; python3 scripts/check-python-outputs.py --post "$p"; e=$?; echo "  exit=$e $((SECONDS - s))초"
done
````

Expected: `Python 3.9.7`, 그다음 차례로 `✓ 통과 5`, `✓ 통과 3`, `✓ 통과 2` 로 시작하는 세 줄(건너뜀 0, 실패 0)과 `exit=0` 세 줄. 계획을 쓸 때 찍힌 시간은 차례로 `1초`, `0초`, `1초` 였다. 초 단위로 끊어 찍으므로 1초쯤 오르내린다. 가장 오래 걸리는 embedding-table-ops 셋째 블록이 혼자 1.6초쯤이다. 걸린 시간을 보고서에 그대로 적는다.

- [ ] **Step 5: 형식 검사, 말투 검사, 기준표**

Run: `node scripts/check-code-blocks.js | tail -1`
Expected: `✓ 새 형식 블록 185개, 옛 형식 블록 62개, 문제 0건`

Run: `node scripts/check-wording.js`
Expected: 종료 코드 0

Run: `node scripts/check-code-blocks.js --update`
Expected: `기준표를 다시 적었습니다 — 옛 형식 블록 62개, 글 23편`

- [ ] **Step 6: 커밋**

````bash
git add posts/embedding-table-ops.md posts/two-tower-retrieval.md posts/feature-store-serving.md scripts/code-blocks-baseline.json
git commit -F - <<'EOF'
feat(posts): ML 인프라와 소프트웨어 공학 글 — 임베딩 테이블 운영, Two-Tower Retrieval, Feature Store 글의 파이썬 블록 10개를 하는 일, 단계, 뜻 형식으로

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

---

### Task 4: 온라인 학습과 서빙 지연 두 편 블록 6개 옮기기

**Files:**
- Modify: `posts/online-learning-delayed-feedback.md` (4개), `posts/serving-latency-throughput.md` (2개)
- Modify: `scripts/code-blocks-baseline.json`

**Interfaces:**
- Consumes: `$SCRATCH/migrate_batch6.py`(Step 1 이 없으면 계획에서 다시 뽑는다), 이 계획 부록 7~8 의 새 블록 6개
- Produces: 새 형식 블록 191개, 옛 형식 블록 56개(21편)

online-learning-delayed-feedback 첫째 블록은 의사코드라 돌리지 않고(Review Focus 1), `# 1. …`, `# 2. …`, `# 3. …` 을 1~3단계로 바꿨다. 나머지 다섯은 표준 라이브러리로 돈다.

- [ ] **Step 1: 도우미가 있는지 본다**

Run (저장소 루트에서):

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch6"; mkdir -p "$SCRATCH"
python3 - migrate_batch6.py <<'EOF'
import os, re, sys
T = '`' * 4
plan = open('docs/superpowers/plans/2026-10-16-python-code-blocks-batch6.md', encoding='utf-8').read()
for name in sys.argv[1:]:
    m = re.search(r'^<!-- file \$SCRATCH/' + re.escape(name) + r' -->\n' + T + r'[a-z]*\n(.*?)^' + T + r'\n', plan, re.S | re.M)
    dest = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'code-steps-batch6', name)
    if not os.path.exists(dest):
        open(dest, 'w', encoding='utf-8').write(m.group(1))
    print(dest)
EOF
````

Expected: 파일 경로 한 줄

- [ ] **Step 2: 두 편을 차례로 옮긴다**

Run:

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch6"
for p in online-learning-delayed-feedback serving-latency-throughput; do
  python3 "$SCRATCH/migrate_batch6.py" docs/superpowers/plans/2026-10-16-python-code-blocks-batch6.md posts "$p" || break
done
````

Expected: 두 줄

````text
online-learning-delayed-feedback: 블록 4개를 옮겼습니다
serving-latency-throughput: 블록 2개를 옮겼습니다
````

`바꾸지 않고 멈춥니다` 가 나오면 거기서 멈추고, 까닭 줄과 그때까지 옮긴 글을 그대로 알린다. 그 글을 손으로 고치지 않는다.

- [ ] **Step 3: 코드 줄과 블록 밖 글이 그대로인지, 표시 줄과 옮긴 주석을 본다**

Run:

````bash
python3 - online-learning-delayed-feedback serving-latency-throughput <<'EOF'
import re, subprocess, sys
PY = re.compile(r'^```python[^\n]*\n(.*?)^```[ \t]*$', re.S | re.M)
code = lambda b: [l for l in b.split('\n') if l.strip() and not l.lstrip().startswith('#')]
# (글, 0부터 센 블록, 새 블록에 있어야 할 말, 새 블록에 없어야 할 옛 주석 줄)
MOVED = [
    ('online-learning-delayed-feedback', 0, '# (의사코드 — 그대로 실행되지 않습니다.)\n# 하는 일: ', '# (의사코드 — 구조만 보여 줍니다. DeepFM 같은 클래스 이름은 예시이고 그대로 실행되지 않습니다.)'),
    ('online-learning-delayed-feedback', 0, 'DeepFM 같은 클래스 이름은 예시다', '# 하이브리드 구조 (간략화)'),
    ('online-learning-delayed-feedback', 0, '# 1단계: Base Model 을 하루 한 번 Batch 로 다시 학습한다', '# 1. Base Model: 일 1회 Batch 재학습 (Spark + GPU)'),
    ('serving-latency-throughput', 0, '전부 가상 값이다', '# 부하를 올릴 때 p50 과 p99 가 각각 어떻게 움직이는지 본다.'),
    ('serving-latency-throughput', 1, '표본을 히스토그램에 담아, 널리 쓰는 기본 버킷과 예산에 맞춘 버킷으로 낸 p99', '# 5절과 같은 표본을 히스토그램에 담아, 버킷 경계를 바꿔 가며 p99 를 다시 내 본다.'),
]
fail = False
for post in sys.argv[1:]:
    old = subprocess.run(['git', 'show', f'HEAD:posts/{post}.md'], capture_output=True, text=True, check=True).stdout
    new = open(f'posts/{post}.md', encoding='utf-8').read()
    ob, nb = [m.group(1) for m in PY.finditer(old)], [m.group(1) for m in PY.finditer(new)]
    assert len(ob) == len(nb), (post, len(ob), len(nb))
    bad = [i for i, (a, b) in enumerate(zip(ob, nb)) if code(a) != code(b)]
    same = PY.sub('@', old) == PY.sub('@', new)
    print(f'{post}: 코드 줄이 바뀐 블록 {bad}, 블록 밖 글 {"같다" if same else "다르다"}')
    fail = fail or bool(bad or not same)
    for p, n, want, gone in MOVED:
        if p != post:
            continue
        has = want in nb[n]
        left = gone in nb[n].split('\n')
        print(f'  {n + 1}번째 블록: 옮긴 말 {"있다" if has else "없다"}, 옛 주석 줄 {"남았다" if left else "없다"}')
        fail = fail or not has or left
sys.exit(1 if fail else 0)
EOF
````

Expected: 일곱 줄

````text
online-learning-delayed-feedback: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다
  1번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
  1번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
  1번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
serving-latency-throughput: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다
  1번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
  2번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
````

- [ ] **Step 4: 실행 검사를 돌리고 걸린 시간을 적는다**

Run:

````bash
python3 --version
for p in online-learning-delayed-feedback serving-latency-throughput; do
  s=$SECONDS; python3 scripts/check-python-outputs.py --post "$p"; e=$?; echo "  exit=$e $((SECONDS - s))초"
done
````

Expected: `Python 3.9.7`, 그다음 `✓ 통과 3, 건너뜀 1 (라이브러리 없음 0, 실행 안 됨 1), 실패 0` 과 `✓ 통과 2, 건너뜀 0 (라이브러리 없음 0, 실행 안 됨 0), 실패 0`, 그리고 `exit=0` 두 줄. 계획을 쓸 때 찍힌 시간은 차례로 `0초`, `2초` 였다. 초 단위로 끊어 찍으므로 1초쯤 오르내린다. serving-latency-throughput 첫째 블록은 요청량 다섯 가지를 120초어치씩 시뮬레이션해 혼자 2초쯤 걸린다. 걸린 시간을 보고서에 그대로 적는다.

- [ ] **Step 5: 형식 검사, 말투 검사, 기준표**

Run: `node scripts/check-code-blocks.js | tail -1`
Expected: `✓ 새 형식 블록 191개, 옛 형식 블록 56개, 문제 0건`

Run: `node scripts/check-wording.js`
Expected: 종료 코드 0

Run: `node scripts/check-code-blocks.js --update`
Expected: `기준표를 다시 적었습니다 — 옛 형식 블록 56개, 글 21편`

- [ ] **Step 6: 커밋**

````bash
git add posts/online-learning-delayed-feedback.md posts/serving-latency-throughput.md scripts/code-blocks-baseline.json
git commit -F - <<'EOF'
feat(posts): ML 인프라와 소프트웨어 공학 글 — Online Learning 과 지연 피드백, 서빙 지연과 처리량 글의 파이썬 블록 6개를 하는 일, 단계, 뜻 형식으로

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

---

### Task 5: 소프트웨어 공학 네 편 블록 7개 옮기기와 여쭤볼 것

**Files:**
- Modify: `posts/data-engineer-first-six-months.md` (1개), `posts/git-practical-guide.md` (1개), `posts/kubernetes-networking.md` (2개), `posts/software-architecture-patterns.md` (3개)
- Modify: `scripts/code-blocks-baseline.json`
- Modify (Step 7, 사용자가 고치기로 한 곳만): `posts/model-serving-architecture.md` 한 줄, `posts/ad-log-pipeline.md` 두 줄, `posts/software-architecture-patterns.md` 한 줄

**Interfaces:**
- Consumes: `$SCRATCH/migrate_batch6.py`(Step 1 이 없으면 계획에서 다시 뽑는다), 이 계획 부록 9~12 의 새 블록 7개, 위 「여쭤볼 것 후보」
- Produces: 새 형식 블록 198개, 옛 형식 블록 49개(17편)

data-engineer-first-six-months 블록은 팀 도구로 DAG 를 만드는 예시라 돌리지 않는다(Review Focus 1). git-practical-guide 블록은 한 줄짜리라 단계 없이 쓰고, 돌지만 찍는 것이 없다(Review Focus 2). 나머지 다섯은 표준 라이브러리로 돈다.

- [ ] **Step 1: 도우미가 있는지 본다**

Run (저장소 루트에서):

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch6"; mkdir -p "$SCRATCH"
python3 - migrate_batch6.py <<'EOF'
import os, re, sys
T = '`' * 4
plan = open('docs/superpowers/plans/2026-10-16-python-code-blocks-batch6.md', encoding='utf-8').read()
for name in sys.argv[1:]:
    m = re.search(r'^<!-- file \$SCRATCH/' + re.escape(name) + r' -->\n' + T + r'[a-z]*\n(.*?)^' + T + r'\n', plan, re.S | re.M)
    dest = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'code-steps-batch6', name)
    if not os.path.exists(dest):
        open(dest, 'w', encoding='utf-8').write(m.group(1))
    print(dest)
EOF
````

Expected: 파일 경로 한 줄

- [ ] **Step 2: 네 편을 차례로 옮긴다**

Run:

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch6"
for p in data-engineer-first-six-months git-practical-guide kubernetes-networking software-architecture-patterns; do
  python3 "$SCRATCH/migrate_batch6.py" docs/superpowers/plans/2026-10-16-python-code-blocks-batch6.md posts "$p" || break
done
````

Expected: 네 줄

````text
data-engineer-first-six-months: 블록 1개를 옮겼습니다
git-practical-guide: 블록 1개를 옮겼습니다
kubernetes-networking: 블록 2개를 옮겼습니다
software-architecture-patterns: 블록 3개를 옮겼습니다
````

`바꾸지 않고 멈춥니다` 가 나오면 거기서 멈추고, 까닭 줄과 그때까지 옮긴 글을 그대로 알린다. 그 글을 손으로 고치지 않는다.

- [ ] **Step 3: 코드 줄과 블록 밖 글이 그대로인지, 표시 줄과 옮긴 주석을 본다**

옛 블록에 주석이 없던 두 블록은 없어야 할 옛 줄을 빈 글로 둔다.

Run:

````bash
python3 - data-engineer-first-six-months git-practical-guide kubernetes-networking software-architecture-patterns <<'EOF'
import re, subprocess, sys
PY = re.compile(r'^```python[^\n]*\n(.*?)^```[ \t]*$', re.S | re.M)
code = lambda b: [l for l in b.split('\n') if l.strip() and not l.lstrip().startswith('#')]
# (글, 0부터 센 블록, 새 블록에 있어야 할 말, 새 블록에 없어야 할 옛 주석 줄. 빈 글이면 보지 않는다)
MOVED = [
    ('data-engineer-first-six-months', 0, '# (DAG 예시 — 그대로 실행되지 않습니다.)\n# 하는 일: ', ''),
    ('git-practical-guide', 0, '# 하는 일: 두 브랜치가 다르게 고친 learning_rate 를', ''),
    ('kubernetes-networking', 0, '"집 주소를 그냥 외워 두면 안 되나?"에 숫자로 답한다', '# 질문: 클라이언트가 Pod IP를 직접 외워 두면 요청이 얼마나 실패하나?'),
    ('kubernetes-networking', 1, '"Ingress 없이 서비스마다 입구를 내면 안 되나?"에 비용으로 답한다', '#   A) 서비스마다 LoadBalancer를 하나씩 붙인다 (입구를 여러 개 낸다)'),
    ('software-architecture-patterns', 0, '방식 A 다. 주문 → 결제 → 재고 → 알림 을 차례로 부르고', '#   방식 A(직접 호출): 주문 → 결제 → 재고 → 알림 을 차례로 부르고 답을 기다린다.'),
    ('software-architecture-patterns', 1, '흔한 오해는 "마이크로서비스가 더 안전하다"이다', '# 흔한 오해: "마이크로서비스가 더 안전하다"'),
    ('software-architecture-patterns', 2, '원본(primary)은 쓰기를 받고, 복사본(replica)은 읽기만 받는다', '# 원본(primary)은 쓰기를 받는다. 복사본은 읽기만 받는다.'),
]
fail = False
for post in sys.argv[1:]:
    old = subprocess.run(['git', 'show', f'HEAD:posts/{post}.md'], capture_output=True, text=True, check=True).stdout
    new = open(f'posts/{post}.md', encoding='utf-8').read()
    ob, nb = [m.group(1) for m in PY.finditer(old)], [m.group(1) for m in PY.finditer(new)]
    assert len(ob) == len(nb), (post, len(ob), len(nb))
    bad = [i for i, (a, b) in enumerate(zip(ob, nb)) if code(a) != code(b)]
    same = PY.sub('@', old) == PY.sub('@', new)
    print(f'{post}: 코드 줄이 바뀐 블록 {bad}, 블록 밖 글 {"같다" if same else "다르다"}')
    fail = fail or bool(bad or not same)
    for p, n, want, gone in MOVED:
        if p != post:
            continue
        has = want in nb[n]
        left = bool(gone) and gone in nb[n].split('\n')
        print(f'  {n + 1}번째 블록: 옮긴 말 {"있다" if has else "없다"}, 옛 주석 줄 {"남았다" if left else "없다"}')
        fail = fail or not has or left
sys.exit(1 if fail else 0)
EOF
````

Expected: 열한 줄

````text
data-engineer-first-six-months: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다
  1번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
git-practical-guide: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다
  1번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
kubernetes-networking: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다
  1번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
  2번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
software-architecture-patterns: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다
  1번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
  2번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
  3번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
````

- [ ] **Step 4: 실행 검사를 돌린다**

Run:

````bash
python3 --version
for p in data-engineer-first-six-months git-practical-guide kubernetes-networking software-architecture-patterns; do
  python3 scripts/check-python-outputs.py --post "$p"; echo "  exit=$?"
done
````

Expected: `Python 3.9.7`, 그다음 차례로 아래 네 줄과 `exit=0` 네 줄.

````text
✓ 통과 0, 건너뜀 1 (라이브러리 없음 0, 실행 안 됨 1), 실패 0
✓ 통과 1, 건너뜀 0 (라이브러리 없음 0, 실행 안 됨 0), 실패 0
✓ 통과 2, 건너뜀 0 (라이브러리 없음 0, 실행 안 됨 0), 실패 0
✓ 통과 3, 건너뜀 0 (라이브러리 없음 0, 실행 안 됨 0), 실패 0
````

data-engineer-first-six-months 가 「라이브러리 없음」으로 세면 표시 줄이 빠진 것이다. 멈추고 알린다(Review Focus 1).

- [ ] **Step 5: 형식 검사, 말투 검사, 기준표**

Run: `node scripts/check-code-blocks.js | tail -1`
Expected: `✓ 새 형식 블록 198개, 옛 형식 블록 49개, 문제 0건`

Run: `node scripts/check-wording.js`
Expected: 종료 코드 0

Run: `node scripts/check-code-blocks.js --update`
Expected: `기준표를 다시 적었습니다 — 옛 형식 블록 49개, 글 17편`

- [ ] **Step 6: 커밋**

````bash
git add posts/data-engineer-first-six-months.md posts/git-practical-guide.md posts/kubernetes-networking.md \
        posts/software-architecture-patterns.md scripts/code-blocks-baseline.json
git commit -F - <<'EOF'
feat(posts): ML 인프라와 소프트웨어 공학 글 — 데이터 엔지니어 첫 6개월, Git 실무 가이드, 쿠버네티스 네트워킹, 소프트웨어 아키텍처 패턴 글의 파이썬 블록 7개를 하는 일, 단계, 뜻 형식으로

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

- [ ] **Step 7: 사용자가 고치기로 한 「여쭤볼 것 후보」를 고친다**

사용자가 이 계획을 확인하며 고치기로 한 곳만 고친다. 하나도 고치지 않기로 했으면 Step 7, 8 을 건너뛴다. 컨트롤러는 태스크를 보내기 전에 아래 `FIX` 목록에서 고치지 않기로 한 줄을 지우고, 그 수에 맞게 Expected 와 Step 8 의 줄 수를 고친다. ad-log-pipeline 의 두 줄은 한 후보라 함께 남기거나 함께 지운다. 찾을 글이 파일에 꼭 한 번 있어야 하고, 고친 뒤 글이 파일에 이미 있으면 안 된다. 하나라도 어긋나면 아무 파일도 쓰지 않고 멈춘다.

Run (저장소 루트에서):

````bash
python3 - <<'EOF'
import sys
FIX = [
    ('posts/model-serving-architecture.md',
     '후보 2,000개면 40ms로 예산의 43.7%를 먹습니다.',
     '후보 2,000개면 40ms로 전체 91.5ms의 43.7%를 먹습니다.'),
    ('posts/ad-log-pipeline.md',
     '(dataclass 5종)',
     '(dataclass 6종)'),
    ('posts/ad-log-pipeline.md',
     '`request_id`가 다섯 스키마에 전부 들어 있다는 것입니다. 이 칼럼 하나가 요청부터 전환까지를 잇는 유일한 끈입니다.',
     '`request_id`가 전환 로그를 뺀 다섯 스키마에 다 들어 있다는 것입니다. 이 칼럼 하나가 요청부터 클릭까지를 잇는 끈이고, 전환 로그는 click_id 나 impression_id 로 이어집니다.'),
    ('posts/software-architecture-patterns.md',
     '99.9%짜리 서비스 셋을 사슬로 엮으면 99.2%가 됩니다.',
     '99.9%짜리 셋에 99.5%짜리 알림까지 넷을 사슬로 엮으면 99.2%가 됩니다.'),
]
text = {}
for path, old, new in FIX:
    s = text.setdefault(path, open(path, encoding='utf-8').read())
    if s.count(old) != 1 or new in s:
        sys.exit(f'{path}: 찾을 글 {s.count(old)}번, 고친 글 {s.count(new)}번 — 바꾸지 않고 멈춥니다')
    text[path] = s.replace(old, new)
for path, s in text.items():
    open(path, 'w', encoding='utf-8').write(s)
print(f'{len(FIX)}곳을 고쳤습니다 ({len(text)}편)')
EOF
````

Expected: `4곳을 고쳤습니다 (3편)` (셋 다 고치기로 했을 때. ad-log-pipeline 은 두 곳이다)

- [ ] **Step 8: 고친 것만 바뀌었는지 보고 커밋한다**

Run:

````bash
git diff --stat | tail -1
node scripts/check-wording.js; echo "wording exit=$?"
node scripts/check-code-blocks.js | tail -1
for p in model-serving-architecture ad-log-pipeline software-architecture-patterns; do
  python3 scripts/check-python-outputs.py --post "$p"; echo "  exit=$?"
done
````

Expected: ` 3 files changed, 4 insertions(+), 4 deletions(-)`, `wording exit=0`, `✓ 새 형식 블록 198개, 옛 형식 블록 49개, 문제 0건`, 그다음 차례로 `✓ 통과 3`, `✓ 통과 2`, `✓ 통과 3` 으로 시작하는 세 줄(실패 0)과 `exit=0` 세 줄. 기준표는 바뀌지 않는다. `git diff` 로 바뀐 줄을 눈으로도 본다 — 바뀐 것은 「여쭤볼 것 후보」의 「고칠 글」뿐이어야 한다. 고친 글만 stage 한다.

````bash
git add posts/model-serving-architecture.md posts/ad-log-pipeline.md posts/software-architecture-patterns.md
git commit -F - <<'EOF'
fix(posts): ML 인프라와 소프트웨어 공학 글 — 사용자가 고치기로 한 본문 사실 오류를 코드가 찍는 값과 맞게 고친다

model-serving-architecture 의 「예산의 43.7%」를 「전체 91.5ms의 43.7%」로,
ad-log-pipeline 의 「dataclass 5종」을 「6종」으로, 「다섯 스키마에 전부」를 「전환 로그를 뺀 다섯 스키마에」로, 「요청부터 전환까지를 잇는 유일한 끈」을 「요청부터 클릭까지를 잇는 끈」으로,
software-architecture-patterns 의 「99.9%짜리 서비스 셋」을 「99.9%짜리 셋에 99.5%짜리 알림까지 넷」으로.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

---

### Task 6: 여섯째 묶음 확인과 올리기

**Files:** 없음 (확인, 커밋 합치기, push)

**Interfaces:**
- Consumes: Task 1~5 의 커밋
- Produces: 사용자 확인, 그 뒤 main 에 올린 여섯째 묶음. 올리는 커밋은 계획 문서 1개와 글 옮기기 1개다(합치기 전에는 글 커밋 5개, Task 5 Step 7 을 했으면 6개, 그리고 리뷰 고침).

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

Expected: 마지막 줄 `ALL-OK`. 그 위 줄들 가운데 `✓ 새 형식 블록 198개, 옛 형식 블록 49개, 문제 0건`, `94 통과, 0 실패`, `22 통과, 0 실패`, `21 통과, 0 실패`, `✓ 통과 189, 건너뜀 9 (라이브러리 없음 0, 실행 안 됨 9), 실패 0` 이 있다.

CI 와 같은 표준 라이브러리 파이썬으로도 돌린다:

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch6"; test -x "$SCRATCH/venv/bin/python" || python3 -m venv --without-pip "$SCRATCH/venv"
"$SCRATCH/venv/bin/python" scripts/test-python-outputs.py | tail -1
"$SCRATCH/venv/bin/python" scripts/check-python-outputs.py | tail -1
````

Expected: `21 통과, 0 실패` 와 `✓ 통과 179, 건너뜀 19 (라이브러리 없음 10, 실행 안 됨 9), 실패 0` (다섯째 묶음의 라이브러리 없음 10 에 이 묶음은 더하지 않는다. 실행 안 됨은 의사코드 다섯과 새 표시 셋이 더해져 9 다)

- [ ] **Step 2: 숫자로 재고 그림을 찍는다**

서버 파일이 있는지 보고, 없으면 계획에서 뽑는다(저장소 루트에서).

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch6"; mkdir -p "$SCRATCH"
python3 - nocache_server.py <<'EOF'
import os, re, sys
T = '`' * 4
plan = open('docs/superpowers/plans/2026-10-16-python-code-blocks-batch6.md', encoding='utf-8').read()
for name in sys.argv[1:]:
    m = re.search(r'^<!-- file \$SCRATCH/' + re.escape(name) + r' -->\n' + T + r'[a-z]*\n(.*?)^' + T + r'\n', plan, re.S | re.M)
    dest = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'code-steps-batch6', name)
    if not os.path.exists(dest):
        open(dest, 'w', encoding='utf-8').write(m.group(1))
    print(dest)
EOF
````

서버를 백그라운드로 띄운다: `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch6"; python3 "$SCRATCH/nocache_server.py" "$(pwd)" 8774`. 아무 글이나 새 캐시로 연 뒤 아래 함수를 돌린다. 목록의 앞은 글 id, 뒤는 파일 이름이다(이 묶음은 둘이 같다).

````js
async () => {
  const POSTS = [
    ['model-serving-architecture', 'model-serving-architecture'],
    ['ad-log-pipeline', 'ad-log-pipeline'],
    ['ad-log-system', 'ad-log-system'],
    ['embedding-table-ops', 'embedding-table-ops'],
    ['two-tower-retrieval', 'two-tower-retrieval'],
    ['feature-store-serving', 'feature-store-serving'],
    ['online-learning-delayed-feedback', 'online-learning-delayed-feedback'],
    ['serving-latency-throughput', 'serving-latency-throughput'],
    ['data-engineer-first-six-months', 'data-engineer-first-six-months'],
    ['git-practical-guide', 'git-practical-guide'],
    ['kubernetes-networking', 'kubernetes-networking'],
    ['software-architecture-patterns', 'software-architecture-patterns'],
  ];
  const f = document.createElement('iframe');
  f.style.cssText = 'position:absolute;left:-10000px;top:0;height:900px;border:0';
  document.body.appendChild(f);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const out = {};
  for (const w of [1440, 1280, 1024, 390]) {
    f.style.width = w + 'px';
    for (const [id, file] of POSTS) {
      await new Promise(r => { f.onload = r; f.src = `post.html?id=${id}&w=${w}&t=${Date.now()}`; });
      const d = f.contentDocument;
      for (let i = 0; i < 40 && !d.querySelector('.cb-row'); i++) await wait(250);
      await d.fonts.ready;
      await wait(700);
      const md = await (await fetch(`posts/${file}.md`)).text();
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

Expected: 네 폭 모두 글마다 `"<블록 수> true <출력 없는 블록> 0 false 0 0 0"` 이다(값 48개). 블록 수는 목록 차례로 5, 4, 4, 5, 3, 2, 4, 2, 1, 1, 2, 3 이고, 출력 없는 블록은 차례로 2, 3, 3, 0, 0, 1, 1, 0, 1, 1, 0, 0 이다(모두 12개, Review Focus 2).

숫자 줄바꿈도 다시 훑는다.

````js
async () => {
  const js = await (await fetch('js/posts.js?t=' + Date.now())).text();
  const ids = [...js.matchAll(/^\s*id:\s*['"]([^'"]+)['"]/gm)].map(m => m[1]);
  const f = document.createElement('iframe');
  f.style.cssText = 'position:absolute;left:-10000px;top:0;width:390px;height:900px;border:0';
  document.body.appendChild(f);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const overflow = [], broken = [];
  let nums = 0;
  for (const id of ids) {
    await new Promise(r => { f.onload = r; f.src = `post.html?id=${id}&t=${Date.now()}`; });
    const d = f.contentDocument;
    for (let i = 0; i < 40 && !d.querySelector('.post-content pre, .post-content p'); i++) await wait(150);
    await d.fonts.ready;
    await wait(400);
    if (d.documentElement.scrollWidth > d.documentElement.clientWidth) overflow.push(id);
    const els = [...d.querySelectorAll('.cb-n, pre.cb-wrap .hljs-number')];
    nums += els.length;
    const b = els.filter(e => e.getClientRects().length > 1).length;
    if (b) broken.push(id + ':' + b);
  }
  f.remove();
  return { posts: ids.length, numbers: nums, overflow, broken };
}
````

Expected: `{"posts":108,"numbers":4200,"overflow":[],"broken":[]}` (계획을 쓸 때 잰 값. 다섯째 묶음이나 이 묶음의 리뷰가 블록 글을 고쳤다면 `numbers` 만 조금 다를 수 있다. 보고서에 그대로 적는다)

그림을 `.playwright-mcp/batch6/` 에 찍는다. 12편을 1440 폭 라이트로 한 장씩(12장), 아래 표에서 390 이라 적은 5편은 390 폭 라이트로도(5장), model-serving-architecture 와 software-architecture-patterns 는 1440 폭 다크로도(2장) 찍는다. 블록이 길면 머리와 출력 영역으로 나눠 찍고 이름에 `-top`, `-out` 을 붙인다. 담을 블록은 아래와 같다.

| 글 | 블록 | 390 |
|---|---|---|
| model-serving-architecture | 둘째 (선 글자 막대, 뜻 셋) | 390 |
| ad-log-pipeline | 첫째 (Spark 예시 표시, 출력 없음) | |
| ad-log-system | 넷째 (스키마 고치기, 뜻 둘) | |
| embedding-table-ops | 셋째 (정책 넷의 표) | 390 |
| two-tower-retrieval | 셋째 (보정 전후 순위 표, 뜻 둘) | |
| feature-store-serving | 둘째 (유저 10명 표, 뜻 셋) | 390 |
| online-learning-delayed-feedback | 첫째 (의사코드 단계 셋) | |
| serving-latency-throughput | 첫째 (분위수 표) | 390 |
| data-engineer-first-six-months | 첫째 (DAG 예시 표시) | |
| git-practical-guide | 첫째 (한 줄 블록) | |
| kubernetes-networking | 첫째 (두 방식의 실패, 뜻 둘) | |
| software-architecture-patterns | 셋째 (복사본 표, 뜻 다섯) | 390 |

서버를 끈다.

- [ ] **Step 3: 확인 페이지를 만든다** (컨트롤러)

다섯째 묶음처럼 비공개 artifact 한 장에 담는다. 바뀌는 것(글 12편, 블록 36개, 코드와 검사는 그대로), 그림, 검사 결과(로컬과 표준 라이브러리 파이썬 둘 다), 올리면 하는 일(커밋 수, 합치는 글 커밋, rebase, `ubuntu-24.04` 에서 도는 글 검사), 「이 계획에서 정한 것」 가운데 독자가 보는 것(고쳐 쓴 의사코드 표시 다섯, 새로 붙인 Spark 예시와 DAG 예시 표시 셋, 출력 영역이 없는 블록 열둘, 마지막 코드 줄 뒤 주석을 풀이와 메모로 옮긴 블록 둘), 「고친 본문」 절(Task 5 Step 7 로 고친 곳의 전후)과 「여쭤볼 것」 절(고치지 않기로 한 후보와 블록을 옮기며 새로 찾은 것)을 쓴다.

- [ ] **Step 4: 사용자 확인을 받는다** (컨트롤러)

그림과 함께 바뀐 것을 짧게 알린다. 고친 곳이 있으면 전후를 보인다. 「여쭤볼 것」이 있으면 고칠지 함께 묻고, 고치기로 하면 글 커밋(`fix(posts): ML 인프라와 소프트웨어 공학 글 — …`)으로 고친 뒤 Step 1 부터 다시 한다. 사용자가 올려도 된다고 하기 전에는 push 하지 않는다.

- [ ] **Step 5: 글 커밋을 하나로 합친다** (사용자 확인 뒤)

합치기 전에 무엇을 합칠지 본다.

Run:

````bash
FIRST=$(git log --reverse --format=%H --fixed-strings --grep='(posts): ML 인프라와 소프트웨어 공학 글 —' origin/main..HEAD | head -1)
BASE=$(git rev-parse "$FIRST^")
git log --format='%h %s' "$BASE..HEAD"
git diff --stat "$BASE" HEAD | tail -1
````

Expected: `git log` 의 줄이 모두 `feat(posts): ML 인프라와 소프트웨어 공학 글 —` 이나 `fix(posts): ML 인프라와 소프트웨어 공학 글 —` 로 시작한다. `git diff --stat` 의 마지막 줄은 `13 files changed` 로 시작한다(글 12편과 `scripts/code-blocks-baseline.json`). 다른 커밋이 끼어 있으면 합치지 않고 그대로 올린다고 사용자에게 알린다.

위 결과가 맞을 때만 합친다. 셸 변수는 명령마다 사라지므로 아래 한 명령 안에서 `FIRST` 와 `BASE` 를 다시 구하고, 그 사이 커밋이 모두 글 커밋인지 다시 본 뒤 합친다. 하나라도 어긋나면 거기서 멈춘다. Task 5 Step 7 로 본문을 고쳤으면 아래 커밋 글의 「실행되는 코드 줄과 블록 밖 본문은 그대로다.」를 「실행되는 코드 줄은 그대로이고, 블록 밖 본문은 사용자가 고치기로 한 N곳만 고쳤다(글 이름).」로 바꿔 넣는다.

Run:

````bash
FIRST=$(git log --reverse --format=%H --fixed-strings --grep='(posts): ML 인프라와 소프트웨어 공학 글 —' origin/main..HEAD | head -1)
test -n "$FIRST" || { echo '글 커밋을 못 찾았다'; exit 1; }
BASE=$(git rev-parse "$FIRST^") || exit 1
OTHER=$(git log --format='%s' "$BASE..HEAD" | grep -v -e '^feat(posts): ML 인프라와 소프트웨어 공학 글 —' -e '^fix(posts): ML 인프라와 소프트웨어 공학 글 —')
test -z "$OTHER" || { echo "글 커밋이 아닌 커밋이 끼어 있다: $OTHER"; exit 1; }
TREE=$(git rev-parse 'HEAD^{tree}')
git reset --soft "$BASE" || exit 1
git commit -F - <<'EOF' || exit 1
feat(posts): ML 인프라 글 8편과 소프트웨어 공학 글 4편의 파이썬 블록 36개를 하는 일, 단계, 뜻 형식으로

ML 인프라 8편 29개, 소프트웨어 공학 4편 7개.
실행되는 코드 줄과 블록 밖 본문은 그대로다. 의사코드 블록 다섯의 첫 줄은 형식 검사가 읽는 상태 표시 꼴로 고치고,
pyspark 블록 둘과 DAG 블록 하나에는 「그대로 실행되지 않습니다」 표시를 붙였다.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
test "$(git rev-parse 'HEAD^{tree}')" = "$TREE" && echo '트리 같음'
git log --format='%h %s' origin/main..HEAD
git rev-list --count origin/main..HEAD
````

Expected: `트리 같음`, 두 줄 — 맨 위가 방금 합친 `feat(posts): ML 인프라 글 8편과 …` 이고, 그 아래가 계획 문서 커밋이다(계획을 고친 커밋이 있으면 그만큼 더). 마지막 줄은 그 줄 수와 같은 `2` 다.

- [ ] **Step 6: 올린다** (컨트롤러)

Run: `git fetch origin && git rebase origin/main && git status -sb | head -1 && git log --format='%h %ae %s' origin/main..HEAD`
Expected: 내 커밋만 있고 작성자가 모두 `37789148+chkimsu@users.noreply.github.com` 이다. 다른 세션의 커밋이 있으면 멈추고 알린다. rebase 로 들어온 커밋이 있으면 Step 1 의 검사를 다시 돌린다.

자동 권한 검사가 `git push` 를 막으므로, 사용자에게 프롬프트에 `! git push origin main` 을 입력해 달라고 부탁한다.

- [ ] **Step 7: 글 검사를 본다** (컨트롤러)

로그인하지 않은 `gh` 는 API 를 시간당 60번만 쓴다. 간격을 짧게 두고 지켜보면 한 번에 다 써서 나머지 확인을 한 시간 가까이 못 한다.

Run: `gh run list --workflow validate.yml --limit 1 --json databaseId,headSha,status` 로 push 한 커밋의 run id 를 찾고 `gh run watch <id> --exit-status --interval 60`
Expected: 종료 코드 0. `gh api repos/chkimsu/adtech-blog/actions/runs/<id>/jobs --jq '.jobs[] | "\(.labels) \(.conclusion) \([.steps[] | select(.conclusion != "success" and .conclusion != "skipped")] | length)"'` 가 `["ubuntu-24.04"] success 0` 이다. run 의 로그는 읽지 않는다(관리자 권한이 필요하고 로컬 gh 는 github.com 에 로그인돼 있지 않다). 남은 횟수는 `gh api rate_limit --jq .resources.core` 로 본다(이 조회는 횟수에 들지 않는다).

같은 커밋의 `Update sitemap.xml + feed.xml` 과 `pages-build-deployment` 는 몇 분 뒤 `gh run list --limit 5 --json databaseId,headSha,status,conclusion,workflowName` 한 번으로 본다. 봇의 사이트맵 커밋이 새 배포를 띄우면 앞 배포는 「취소」로 남는다. 그때는 새 배포의 결과를 본다.

- [ ] **Step 8: 공개 블로그에서 본다** (컨트롤러)

페이지 배포가 끝나면 새 캐시로 `https://chkimsu.github.io/adtech-blog/post.html?id=model-serving-architecture` 를 연다. Step 2 의 목록 12편을 숨긴 iframe 으로 차례로 열어 `.post-content .cb` 수(5, 4, 4, 5, 3, 2, 4, 2, 1, 1, 2, 3)와 콘솔 오류 0 을 확인한다. 접힌 절 안의 블록 글은 `innerText` 에 안 잡히니 `textContent` 로 본다. Task 5 Step 7 로 고친 문장이 있으면 그 글에서 고친 문장이 보이는지도 본다.
