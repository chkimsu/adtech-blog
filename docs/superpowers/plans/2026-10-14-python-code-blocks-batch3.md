# 파이썬 코드 블록 개편 — 셋째 묶음 실행 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 둘째 묶음 마지막 검토에서 넘긴 검사와 화면 고침을 넣고, 모델 운영 트랙 9편의 파이썬 블록 19개를 하는 일, 단계, 뜻 형식으로 옮긴다.

**Architecture:** 고침은 첫째, 둘째 묶음이 만든 파일 안에서 한다. 파서는 `js/code-steps.js`, 복사 단추는 `js/main.js`, 숫자 줄바꿈은 `css/style.css`, 형식 검사는 `scripts/check-code-blocks.js`, 실행 검사는 `scripts/check-python-outputs.py` 다. 글 옮기기는 이 계획 부록의 새 블록 전문을 저장소 밖 도우미가 읽어 바꾼다. 도우미는 원본 블록의 해시, 코드 줄, 옛 출력의 찍힌 줄을 먼저 견주고, 하나라도 다르면 아무것도 바꾸지 않는다.

**Tech Stack:** 바닐라 JS(브라우저, node 20), Python 3.9 표준 라이브러리(로컬에는 numpy 1.26.4, torch 2.7.0, bentoml 1.4.29 도 있다), GitHub Actions(`runs-on: ubuntu-24.04` 고정), 브라우저 도구(Chrome DevTools MCP. Playwright MCP 는 이 세션에서 연결되지 않았다).

**Spec:** `docs/superpowers/specs/2026-10-13-python-code-blocks-design.md` (8-1 블록 상태, 8-2 묶음, 8-3 옮길 때 지킬 것). 꼴과 관례는 둘째 묶음 계획 `docs/superpowers/plans/2026-10-14-python-code-blocks-batch2.md` 를 따른다.

> 새 블록 19개의 전문은 태스크 앞의 「부록: 새 블록 19개」 절에 있다. 태스크는 그 뒤에 Task 1 부터 Task 8 까지 이어진다.

> 이 계획의 코드, 시험, 새 블록 19개, 기대 출력은 계획을 쓸 때 저장소 사본(main `32bcf46`)에 그대로 적용해 돌려 본 것이다. 단위 테스트 94개, 형식 검사 시험 22개, 실행 검사 시험 21개, CI 검사 12가지, 아홉 편의 형식 검사와 실행 검사, 1440, 1280, 1024, 390 폭의 배치 숫자, 390 폭의 숫자 줄바꿈 훑기가 통과했다.

## Global Constraints

- 공개 저장소다. 사내 시스템, 플랫폼 이름을 코드, 주석, 블록 안 글, 커밋 메시지 어디에도 쓰지 않는다.
- 블록 안 글(하는 일, 단계 제목, 풀이, 메모, 뜻)은 평서체 `~한다, ~이다` 로 쓴다. 숫자 뒤에 조사나 「이다」가 오면 한 칸 띄운다(`0.011 이다`, `28 이`). 개수를 세는 말은 붙인다(`8개`, `4회`).
- 해요체, `저희`, 가운뎃점, `실측`, `실체`, `축`, `가른다`, `갈린다`, 열하나 이상의 말로 쓴 숫자, 지어낸 말(`출력 칸` 등)을 쓰지 않는다. `node scripts/check-wording.js` 가 posts/ 의 코드 블록 안과 `js/*.js` 의 문자열까지 센다.
- 모서리는 `border-radius: 0`, 그림자 없음, 색은 디자인 토큰만 쓴다(새 hex 없음). `node scripts/check-design.js` 가 통과해야 한다.
- 실행되는 코드 줄은 바꾸지 않는다(spec 8-3). 줄 끝 주석도 그대로 둔다. 원래 주석의 내용은 하는 일, 풀이, 메모로 나눠 옮기고 버리지 않는다.
- 블록 밖의 본문은 바꾸지 않는다(사용자 결정 「본문은 그대로 둔다」). 본문에서 찾은 사실 오류는 아래 「여쭤볼 것 후보」에 적고 Task 8 의 확인 페이지에서 사용자에게 묻는다.
- 표시 꼴은 spec 그대로다 — `# 하는 일: …`, `# N단계: …`, `# 출력:` 또는 `# 출력 (…):`, `# N단계 뜻: …` 또는 `# 뜻: …`, 상태 표시 `# (<무엇> — 그대로 실행되지 않습니다.)`, `# (앞 블록에 이어서 돌린다.)`, `# (<글 id> 글의 코드에 이어서 돌린다.)`.
- 이 계획 문서는 Task 1 전에 `docs/superpowers/plans/2026-10-14-python-code-blocks-batch3.md` 로 커밋돼 있어야 한다. 임시 폴더 도구를 뽑는 명령과 글 옮기기 도우미가 이 파일을 읽는다.
- 이 계획의 코드 블록(네 백틱 울타리)은 손으로 옮겨 적지 않는다. 파일 전체는 울타리 안 글을 그대로 쓰고, Edit 은 찾을 글과 바꿀 글을 그대로 쓴다. 찾을 글은 파일에 꼭 한 번 있어야 한다.
- `js/main.js` 에는 NUL 바이트가 4개 있다. 찾을 때 `grep -a` 를 쓰고, 고칠 때는 Edit 로 해당 줄만 바꾼다. 고친 뒤 `python3 -c "print(open('js/main.js','rb').read().count(b'\x00'))"` 가 `4` 여야 한다.
- `.github/workflows/validate.yml` 은 Task 5 에서 가운뎃점 두 곳만 고친다. `runs-on: ubuntu-24.04` 와 `python-version: '3.9'` 와 단계 수(15개)는 건드리지 않는다.
- 커밋은 git 사용자 `chkimsu` 로 한다. 파일을 이름으로 stage 한다(`git add -A` 금지). 메시지는 기존 꼴 `feat|fix|docs(범위): …` 이고, 마지막 줄은 그 커밋을 만든 모델의 Co-Authored-By 줄이다(예: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`).
- push 는 Task 8 에서 사용자 확인을 받은 뒤에만 한다. push 전에 `git fetch origin && git rebase origin/main` 을 한다(CI 가 sitemap 과 feed 를 다시 커밋한다).
- 임시 파일은 저장소 밖에 둔다. 아래 명령의 `$SCRATCH` 는 `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch3"; mkdir -p "$SCRATCH"` 로 정한다. 셸 변수는 명령마다 다시 정한다. 화면 그림은 저장소 안의 `.playwright-mcp/batch3/` 에 둔다(`.gitignore` 에 있다. 브라우저 도구는 저장소 밖에 그림을 쓰지 못한다).

## Review Focus

1. **줄 수를 본문이 말하는 블록** — bentoml-model-serving 첫 블록 바로 뒤 본문이 「주석까지 21줄입니다」라고 쓴다. 새 블록도 21줄이어야 한다. 그래서 이 블록만 단계 줄 앞에 빈 줄을 두지 않는다. Task 6 Step 3 이 줄 수를 센다.
2. **CI 에 없는 라이브러리** — bentoml-model-serving 의 첫 블록(`import bentoml`)과 다섯째 블록(앞 블록에 이어서)은 CI 의 표준 라이브러리 파이썬에서 「bentoml 없음」으로 건너뛴다. 실패가 아니라 건너뜀이어야 한다. Task 8 Step 1 이 표준 라이브러리만 있는 venv 로 `통과 72, 건너뜀 4 (라이브러리 없음 3, 실행 안 됨 1)` 를 본다.
3. **돌릴 때마다 달라지는 줄** — container-ci-pipeline 첫 블록은 unittest 가 `Ran 3 tests in 0.000s` 를 찍는다. 느린 기계에서는 0.001s 가 될 수 있다. 출력 머리를 `# 출력 (시간은 돌릴 때마다 다르다):` 로 써서 실행 검사가 숫자를 빼고 견준다. Task 7 Step 4 의 실행 검사가 붙잡는다.
4. **휴대폰 폭의 숫자** — 파이썬이 아닌 블록의 숫자가 줄 끝에서 끊기지 않고, 어느 글도 옆으로 넘치지 않아야 한다. Task 2 가 글 전부를 390 폭으로 훑고(고치기 전 3편에서 4곳, 고친 뒤 0곳), Task 8 Step 2 가 다시 훑는다.
5. **Copy 단추의 대체 경로** — 클립보드가 막혀 숨은 textarea 로 복사할 때, 블록 안에 남은 선택이 그 복사를 가로채지 않고, 끝나면 포커스가 Copy 단추로 돌아와야 한다. Task 2 Step 1 의 시험과 Step 3 의 바꿔 보기 확인이 붙잡는다.

## 이 계획에서 정한 것

| 정한 것 | 왜 | 틀렸다면 |
|---|---|---|
| 셋째 묶음은 모델 운영 트랙 9편(블록 19개)이다 | spec 8-2 가 같은 트랙끼리 10편 안팎을 묶는다. 이 트랙은 9편 모두 옛 형식 블록이 있고, BentoML 서비스 파일을 빼면 모두 표준 라이브러리로 돈다 | 다음 묶음에 글을 더한다 |
| 첫 글은 bentoml-model-serving 이다 | 찍는 것이 없는 블록, 발췌 블록, 앞 블록에 이어서 도는 블록, 본문이 줄 수를 말하는 블록이 다 있다 | 화면 확인 글만 바뀐다 |
| 들여쓴 메서드 조각(둘째 블록)은 `# (발췌 — 그대로 실행되지 않습니다.)` 다 | 맨 앞이 들여쓴 줄이라 그대로 돌리면 IndentationError 가 난다(spec 8-1 의 「코드 조각 1」) | 표시 한 줄 |
| `workers=4` 블록(다섯째)은 `# (앞 블록에 이어서 돌린다.)` 다 | `bentoml` 을 첫 블록이 import 한다. 혼자 돌리면 NameError 다(spec 8-1 의 「앞 블록에 이어서 1」) | 표시 한 줄 |
| 서비스 파일(첫 블록)은 표시 없이 둔다 | 파일 하나가 그대로 돈다. 로컬에서는 돌고, CI 에서는 bentoml 이 없어 건너뛴다 | 표시 한 줄 |
| 블록 머리 주석은 하는 일, 풀이, 메모로 나눠 옮긴다. 「전부 가상 값이다」 같은 말은 풀이에 남긴다 | spec 8-3 「내용을 버리지 않습니다」 | 주석 몇 줄 |
| 하는 일 오타 검사는 블록 전체를 그대로 훑고, 출력 영역 안에서 찾으면 「자리」 문구를 낸다 | 훑는 범위를 몸통으로 줄이면 출력 영역에 잘못 둔 하는 일 줄이 옛 형식으로 조용히 넘어간다 | 문구 하나 |
| Copy 단추의 숨은 textarea 는 `readOnly` 로 두고, 복사가 끝나면 `btn.focus()` 로 포커스를 돌려준다 | 휴대폰에서 포커스가 가도 자판이 뜨지 않는다. `select()` 가 포커스를 주지 않는 엔진에서 키보드 사용자가 자리를 잃지 않는다 | `js/main.js` 두 줄 |
| 파이썬이 아닌 블록(pre.cb-wrap)의 `.hljs-number` 도 줄 끝에서 끊지 않는다 | 390 폭에서 api-basics 2곳, pipeline-push-and-pull 1곳, log-hops-to-kafka 1곳이 숫자 중간에서 끊겼다. 고친 뒤 0곳이고 넘침도 0편이다 | CSS 한 줄 |
| 실행 검사는 형식 오류가 있는 새 형식 블록을 실패로 센다 | 쓰는 사람이 `--show` 로 블록을 쓰다가 아무것도 안 찍히고 「✓ 통과 0」 을 받았다. CI 는 형식 검사가 먼저 걸러 바뀌지 않는다 | 실패 조건 하나 |
| 넘긴 것 가운데 긴 글 배치 묶기와 글을 건너 잇는 사슬은 하지 않는다 | deep-ctr-models 와 feedback-loop-remedies 가 이 묶음에 없다 | 그 글이 든 묶음 계획이 맡는다 |
| 검사와 화면 고침, 글쓰기 규칙은 태스크마다 커밋한다. 글 옮기기 커밋(Task 6, 7 과 리뷰 고침)은 올리기 직전에 하나로 합친다 | 둘째 묶음과 같다. 글 커밋 머리는 `feat(posts): 모델 운영 글 —` 와 `fix(posts): 모델 운영 글 —` 다 | 합치기를 건너뛰고 그대로 올린다 |
| push 는 사용자가 `! git push origin main` 으로 한다 | 첫째, 둘째 묶음에서 자동 권한 검사가 `git push` 를 막았다 | 사용자에게 부탁하는 줄 하나 |
| 화면 확인은 Chrome DevTools MCP 로 하고, 390 폭은 숨긴 iframe 으로 잰다 | Playwright MCP 가 연결되지 않는다. 창은 500px 아래로 줄지 않는다 | 도구만 바뀐다 |

## 파일 지도

| 파일 | 맡는 일 | 태스크 |
|---|---|---|
| `js/code-steps.js` | 출력 영역 안의 하는 일 줄에 「자리」 문구 | 1 |
| `scripts/test-code-steps.js` | 단위 테스트 89 → 93 → 94 (하는 일 넷, 복사 비켜서기 하나, 시험 정리) | 1, 2 |
| `js/main.js` | Copy 단추의 숨은 textarea 를 readOnly 로, 끝나면 단추로 포커스 | 2 |
| `css/style.css` | 파이썬이 아닌 블록의 숫자 줄바꿈 | 2 |
| `scripts/check-code-blocks.js` | js/posts.js 모양 오류, contentUrl 꼴 오류, 머리 주석 | 3 |
| `scripts/test-check-code-blocks.js` | 형식 검사 시험 16 → 22, 임시 폴더를 늘 지운다 | 3 |
| `scripts/check-python-outputs.py` | 형식 오류 블록을 실패로, 빈 `--post` 에서 멈춤 | 4 |
| `scripts/test-python-outputs.py` | 실행 검사 시험 17 → 21, 이어서 도는 시험 둘이 통과 수까지 본다 | 4 |
| `MARKDOWN_GUIDE.md` | `--show` 첫 실행, `--post` 의 파일 이름 | 5 |
| `docs/superpowers/specs/2026-10-13-python-code-blocks-design.md` | 7-2 의 `--post` 설명 | 5 |
| `.github/workflows/validate.yml` | 주석 하나와 단계 이름 하나의 가운뎃점 | 5 |
| `posts/bentoml-model-serving.md` | 블록 6개 | 6 |
| `posts/distributed-training.md`, `posts/batch-vs-realtime-inference.md`, `posts/stream-window-aggregation.md`, `posts/model-deployment-rollback.md`, `posts/inference-server.md`, `posts/container-ci-pipeline.md`, `posts/model-versioning-reproducibility.md`, `posts/training-pipeline-dag.md` | 블록 2, 2, 1, 1, 2, 2, 1, 2개 | 7 |
| `scripts/code-blocks-baseline.json` | 190개 77편 → 184개 76편 → 171개 68편 | 6, 7 |

## 넘긴 항목과 이 계획

둘째 묶음 마지막 검토가 「셋째 계획」으로 넘긴 것이다.

| 넘긴 것 | 어디서 |
|---|---|
| 하는 일 오타 검사가 출력 영역까지 훑어 「들여쓰기」 문구를 낸다 | Task 1 |
| 문자열 속 하는 일, 밑줄이 든 글 id, 쌍점 앞에 띄운 하는 일의 시험이 없다 | Task 1 |
| onCopy 비켜서기를 지워도 시험이 통과한다 | Task 2 |
| 숨은 textarea 복사 뒤 포커스가 단추로 돌아오지 않는다, 휴대폰에서 자판이 뜰 수 있다 | Task 2 |
| 시험이 console.warn 과 document 를 try/finally 밖에서 되돌린다 | Task 2 |
| 파이썬이 아닌 블록의 숫자(.hljs-number)가 줄 끝에서 끊긴다 | Task 2 |
| check-code-blocks 의 시험 밖 가지(--json 이 틀린 꼬리표를 빼는 것, 파일이 없는 글 id, py3 와 대문자, 여러 편 줄어든 알림) | Task 3 |
| js/posts.js 모양이 다르면 TypeError, contentUrl 이 꼴에 안 맞으면 틀린 문구 | Task 3 |
| 시험이 중간에 던지면 임시 폴더가 남는다 | Task 3 |
| `--show` 가 형식 오류 블록에서 아무것도 안 찍고 통과, 빈 `--post` 가 조용히 통과 | Task 4 |
| `--show` 시험이 한 가지뿐, 이어서 도는 시험이 종료 코드만 본다 | Task 4 |
| `--show` 첫 실행의 ✗ 와 `--post` 의 파일 이름이 글쓰기 규칙에 없다 | Task 5 |
| 설계 문서 7-2 가 `--post <id>` 라고 쓴다 | Task 5 |
| validate.yml 의 옛 가운뎃점 두 곳 | Task 5 |
| 새 블록 글의 자체 확인(뜻 줄 값, 하는 일과 단계) | 아래 「부록 자체 확인」 |
| 긴 글의 배치 읽기와 쓰기 묶기 | deep-ctr-models 가 든 묶음 |
| 글을 건너 이어서 돌리는 사슬(C → B → A) | feedback-loop-remedies 가 든 묶음 |
| 울타리와 펜스가 섞인 낱말, check-code-blocks 의 표시 줄 다시 찾기 | 하지 않는다. 낱말은 뜻이 같고, 표시 줄은 파서가 엄격한 꼴만 받아 늘 찾는다 |

## 여쭤볼 것 후보

글 아홉 편을 읽으며 찾은 본문의 사실 오류다. 블록 밖이라 이 계획은 고치지 않는다. Task 8 의 확인 페이지 「여쭤볼 것」 절에 그대로 올린다.

| 어디 | 지금 적힌 것 | 맞는 것 | 고친다면 |
|---|---|---|---|
| stream-window-aggregation, 블록 바로 뒤 문단 | 「5초에서 2분 사이에 오는 4.9% 가 통째로 잘리기 때문입니다」 | 워터마크 1분이면 그 4.9% 가운데 1분을 넘겨 오는 쪽만 잘린다. 블록이 찍은 1분 손실은 2.657% 이고, 2분 밖의 0.1% 를 빼면 2.557% 로 4.9% 의 절반쯤이다. 같은 문단의 「26배」는 60,569 ÷ 2,280 = 26.6 이다 | 「4.9% 가운데 1분을 넘겨 오는 절반쯤이 잘리기 때문입니다」, 「27배 가까이입니다」 |
| distributed-training, 첫 블록 바로 뒤 문단 | 「13% 가 기다림입니다」 | 블록은 「혼자보다 13.0% 깁니다」를 찍는다. 기다린 32.5초는 동기 283.1초의 11.5% 다 | 「혼자보다 13% 깁니다」 |
| model-deployment-rollback, 블록 바로 뒤 문단 | 「게이트 폭 ±0.05 보다 잡음이 네 배 큽니다」 | ±0.225 는 ±0.05 의 4.5배다 | 「네 배 넘게 큽니다」 |

## 부록 자체 확인

계획을 쓰며 블록마다 돌린 확인이다.

- 뜻 줄 31개(출력이 있는 블록 16개)의 숫자를 그 아래 찍힌 줄에서 찾았다. 찍힌 줄에 없는 값은 0개다. 처음 쓴 글의 두 곳(「30일 가운데」, 「2, 3 만」)이 찍힌 줄에 없어 글을 바꿨다.
- 하는 일 19줄을 단계마다 맞춰 읽었다. training-pipeline-dag 첫 블록의 「같은 식으로 계산한다」는 백필이 시각표 함수를 쓰지 않아 「시각표를 정상 실행과 실패 뒤 재실행으로 찍고, 30일 백필에 걸리는 시간을 센다」로 바꿨다.
- 옮긴 뒤 값이나 고친 뒤 값을 찍는 표가 있는지 봤다. 없다. 시각표의 시각은 태스크가 끝나는 시각이고 뜻 줄도 「끝난다」로 쓴다.
- 새 블록 19개를 저장소 사본에 넣고 형식 검사(새 형식 76개, 옛 형식 171개, 문제 0건), 실행 검사(통과 75, 실행 안 됨 1), 말투 검사를 돌렸다. 표준 라이브러리만 있는 파이썬 3.9 로는 통과 72, 건너뜀 4(bentoml 2, torch 1, 발췌 1)다.
- 도우미로 옮긴 아홉 편이 손으로 맞춘 사본과 바이트까지 같다. 도우미는 sha, 코드 줄, 찍힌 줄이 하나라도 다르면 글을 그대로 두고 멈춘다(셋 다 시험했다).

---

## 부록: 새 블록 19개

Task 6, 7 의 도우미가 이 절을 읽는다(태스크 설명에 넣지 않으려고 태스크 앞에 둔다). 블록마다 `<!-- cb3 post=<글 파일 이름> block=<0부터 센 파이썬 블록 번호> sha=<원본 블록 sha256 앞 16자> -->` 줄 바로 아래 네 백틱 울타리 안이 새 블록 전체다. 표시 줄과 울타리 모양을 바꾸지 않는다. 블록 제목의 번호는 1부터 센다.

### 부록 1: bentoml-model-serving (블록 6개, Task 6)

#### 블록 1

<!-- cb3 post=bentoml-model-serving block=0 sha=f17e0d4192d51b16 -->
````python
# 하는 일: service.py 파일 하나로 BentoML 서비스 하나를 만든다.
import bentoml
import numpy as np
import torch
# 1단계: 클래스를 서비스로 만든다
# 클래스에 붙인 @bentoml.service 가 서비스를 만든다.
@bentoml.service(
    resources={"cpu": "2"},            # 이 서비스가 쓰는 CPU
    traffic={"timeout": 30},           # 30초를 넘기는 요청은 끊는다
)
class PcvrPreview:
    def __init__(self) -> None:
        # 모델 저장소에서 태그로 불러온다. 코드에 파일 경로를 적지 않는다.
        self.model = bentoml.pytorch.load_model("pcvr_preview:latest")
# 2단계: 메서드를 API 엔드포인트로 만든다
# 메서드에 붙인 @bentoml.api 가 API 엔드포인트 하나를 만든다.
    @bentoml.api
    def predict(self, feats: np.ndarray) -> np.ndarray:
        """입력 변환을 거친 피처 배열을 모델에 넣고 확률을 돌려준다."""
        with torch.no_grad():
            return self.model(torch.from_numpy(feats)).numpy()
````

#### 블록 2

<!-- cb3 post=bentoml-model-serving block=1 sha=1e995be93e7e80e5 -->
````python
# (발췌 — 그대로 실행되지 않습니다.)
# 하는 일: predict 의 데코레이터에 배치 최대 크기 32건과 최대 지연 2ms 를 적어 동적 배칭을 켠다.
    @bentoml.api(batchable=True, max_batch_size=32, max_latency_ms=2)
    def predict(self, feats: np.ndarray) -> np.ndarray:
        with torch.no_grad():
            return self.model(torch.from_numpy(feats)).numpy()
````

#### 블록 3

<!-- cb3 post=bentoml-model-serving block=2 sha=eb93e8d8fa7d9005 -->
````python
# 하는 일: 가상 요청 세 경우로, 동적 배칭(요청 여러 개를 모아 한 번에 추론)이 건당 계산을 얼마나 줄이는지 센다.
import random

# 1단계: 추론 시간과 배치 규칙을 둔다
# 추론 시간은 고정 0.116ms 에 후보 한 건당 0.0036ms 를 더한다(추론 서버 편의 값). 2ms 가 지나거나 32건이 모이면 보낸다.
FIXED, PER = 0.116, 0.0036
WINDOW, MAXB, N = 2.0, 32, 60_000

# 2단계: 요청이 모였다가 나가는 모습을 흉내 낸다
# 요청은 푸아송 과정으로 들어온다. 배치마다 크기를, 요청마다 기다린 시간을 모은다.
def run(qps, cand):
    """cand 는 요청 하나에 실려 오는 후보 수. 평균 배치 크기와 평균 대기를 돌려준다."""
    random.seed(4104)
    lam = qps / 1000.0
    waits, sizes, done = [], [], 0
    while done < N:
        t, n, arrivals = 0.0, 1, [0.0]
        while n < MAXB:
            gap = random.expovariate(lam)
            if t + gap > WINDOW:
                break
            t += gap; n += 1; arrivals.append(t)
        close = t if n == MAXB else WINDOW
        waits += [close - a for a in arrivals]
        sizes.append(n); done += n
    size = sum(sizes) / len(sizes)
    return size, sum(waits) / len(waits)

# 3단계: 세 경우를 견준다
# 얻는 것은 건당 계산이 줄어드는 몫이고, 드는 것은 요청이 모이기를 기다리는 시간이다.
print('경우 / 배치 크기 / 대기 / 건당 계산 (하나씩 → 배치) / 판정')
for name, qps, cand in [('내부 화면 40 QPS, 요청에 후보 1건', 40, 1),
                        ('내부 화면 2,000 QPS, 후보 1건', 2000, 1),
                        ('광고 서빙 2,639 QPS, 후보 800건', 2639, 800)]:
    size, wait = run(qps, cand)
    alone = FIXED + PER * cand                      # 하나씩 보낼 때 건당
    batched = (FIXED + PER * cand * size) / size    # 배치로 보낼 때 건당
    cut = (1 - batched / alone) * 100
    verdict = '이득이 크다' if cut > 40 else '거의 안 줄어든다' if cut < 10 else '반반이다'
    print(f'  {name}')
    print(f'    배치 {size:.1f}건, 대기 {wait:.2f}ms, 건당 {alone:.3f} → {batched:.3f}ms '
          f'({cut:.0f}% 절감) — {verdict}')

print('\n요청 하나가 이미 크면 배치로 묶어도 건당 계산이 거의 안 줄어든다. 대기만 붙는다')
print('요청 하나가 작고 지연 예산이 넉넉할 때만 동적 배칭이 이득이다')

# 출력:
# 3단계 뜻: 후보 1건짜리 요청이 2,000 QPS 로 들어오면 배치가 5.0건으로 커져 건당 계산이 78% 준다. 40 QPS 는 배치가 1.1건뿐이고, 후보 800건짜리 요청은 이미 커서 3% 만 준다.
# 경우 / 배치 크기 / 대기 / 건당 계산 (하나씩 → 배치) / 판정
#   내부 화면 40 QPS, 요청에 후보 1건
#     배치 1.1건, 대기 1.93ms, 건당 0.120 → 0.111ms (7% 절감) — 거의 안 줄어든다
#   내부 화면 2,000 QPS, 후보 1건
#     배치 5.0건, 대기 1.20ms, 건당 0.120 → 0.027ms (78% 절감) — 이득이 크다
#   광고 서빙 2,639 QPS, 후보 800건
#     배치 6.3건, 대기 1.16ms, 건당 2.996 → 2.899ms (3% 절감) — 거의 안 줄어든다
#
# 요청 하나가 이미 크면 배치로 묶어도 건당 계산이 거의 안 줄어든다. 대기만 붙는다
# 요청 하나가 작고 지연 예산이 넉넉할 때만 동적 배칭이 이득이다
````

#### 블록 4

<!-- cb3 post=bentoml-model-serving block=3 sha=096ca881cf4c8e25 -->
````python
# 하는 일: 같은 모델을 직접 짠 서버와 BentoML 서버로 서빙했다고 놓고, 요청 20만 건의 시간을 뽑아 지연 예산을 넘는 비율을 견준다.
import random

# 1단계: 추론 시간과 지연 스파이크를 정한다
# 추론 계산은 두 서버가 같다. 수치는 전부 가상 값이고 시드를 고정해 누가 돌려도 같은 값이 나온다.
N = 200_000
INFER_MU, INFER_SD = 2.80, 0.45      # 추론 계산 자체 (후보 800건을 텐서 하나로)
JITTER_P, JITTER_MU = 0.15, 3.5      # 가끔 생기는 지연 스파이크 — GC, 다른 요청과 겹침

# 2단계: 요청 한 건의 시간을 뽑는 함수를 만든다
# 다른 것은 추론 앞뒤에서 HTTP 요청을 처리하는 서빙 코드다. 직접 짠 서버는 컴파일된 코드가, BentoML 서버는 파이썬이 맡는다.
def draw(fixed, extra_p, extra_mu):
    """서빙 오버헤드 + 추론 + 지연 스파이크. extra 는 파이썬 서빙 코드에서 더 자주 생기는 스파이크다."""
    t = fixed + max(0.4, random.gauss(INFER_MU, INFER_SD))
    if random.random() < JITTER_P:
        t += random.expovariate(1 / JITTER_MU)
    if random.random() < extra_p:
        t += random.expovariate(1 / extra_mu)
    return t

def stats(name, fixed, extra_p, extra_mu):
    random.seed(4104)
    xs = sorted(draw(fixed, extra_p, extra_mu) for _ in range(N))
    p50, p99 = xs[N // 2], xs[int(N * 0.99)]
    return name, p50, p99, sum(1 for x in xs if x > 8) / N * 100, sum(1 for x in xs if x > 200) / N * 100

# 3단계: 두 서버의 지연을 찍는다
rows = [stats('직접 짠 서버', 0.12, 0.0, 1.0),
        stats('BentoML 서버', 1.80, 0.09, 6.0)]

print('서버 / p50 / p99 / 8ms 초과 / 200ms 초과')
for n, p50, p99, o8, o200 in rows:
    print(f'  {n}  {p50:.2f}ms  {p99:.2f}ms  {o8:.2f}%  {o200:.2f}%')

# 4단계: 지연 예산 둘로 읽는다
print(f'\n지연 예산 8ms: 초과율이 {rows[0][3]:.2f}% 에서 {rows[1][3]:.2f}% 로 {rows[1][3] / rows[0][3]:.1f}배')
print(f'지연 예산 200ms: 둘 다 {rows[1][4]:.2f}% 다. 예산이 넉넉하면 이 차이가 안 보인다')
print(f'파이썬 서빙 코드가 더하는 오버헤드 {1.80 - 0.12:.2f}ms 는 예산 8ms 의 {(1.80 - 0.12) / 8 * 100:.0f}% 다')

# 출력:
# 3단계 뜻: 추론은 같은데 BentoML 서버가 p50 4.75ms, p99 20.08ms 로 직접 짠 서버의 3.01ms, 12.64ms 보다 길다. 8ms 를 넘는 요청도 3.53% 에서 10.69% 로 는다.
# 서버 / p50 / p99 / 8ms 초과 / 200ms 초과
#   직접 짠 서버  3.01ms  12.64ms  3.53%  0.00%
#   BentoML 서버  4.75ms  20.08ms  10.69%  0.00%
# 4단계 뜻: 예산 8ms 에서는 초과율이 3.0배로 벌어지고 200ms 에서는 둘 다 0.00% 다. 어느 서버가 맞는지는 지연 예산이 정한다.
#
# 지연 예산 8ms: 초과율이 3.53% 에서 10.69% 로 3.0배
# 지연 예산 200ms: 둘 다 0.00% 다. 예산이 넉넉하면 이 차이가 안 보인다
# 파이썬 서빙 코드가 더하는 오버헤드 1.68ms 는 예산 8ms 의 21% 다
````

#### 블록 5

<!-- cb3 post=bentoml-model-serving block=4 sha=39ca77699df50c15 -->
````python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 서비스 데코레이터에 워커 4개를 적어, 파이썬 프로세스 4개가 요청을 나눠 받게 한다.
@bentoml.service(
    workers=4,                         # 파이썬 프로세스를 4개 띄운다
    resources={"cpu": "4"},
)
class PcvrPreview:
    ...
````

#### 블록 6

<!-- cb3 post=bentoml-model-serving block=5 sha=d6fadddb2b1c1438 -->
````python
# 하는 일: 워커(파이썬 프로세스) 수를 1개에서 16개까지 바꿔 가며, 서버 한 대의 최대 처리량과 대기 시간이 어떻게 바뀌는지 센다.
import math

# 1단계: 요청량과 처리 시간을 둔다
# 요청 한 건의 처리 시간은 앞 절에서 뽑은 값 그대로 둔다. 전부 가상 값이다.
QPS_PER_SERVER = 2639 / 12          # 서버 12대가 나눠 받는 요청 (건/초)
SERVICE_MS = 4.75                   # BentoML 서버의 요청 한 건 p50
OVERHEAD_MS = 1.68                  # 그중 파이썬 서빙 코드가 더하는 오버헤드

# 2단계: 요청이 대기열에 설 확률을 구하는 식을 만든다
# 대기행렬 이론의 간단한 모형(M/M/c)으로 근사한다.
def erlang_c(c, a):
    """워커 c 개에 부하 a 일 때 요청이 대기열에 서게 될 확률."""
    s = sum(a ** k / math.factorial(k) for k in range(c))
    last = a ** c / math.factorial(c) * (c / (c - a))
    return last / (s + last)

# 3단계: 워커 수마다 처리량과 대기를 찍는다
# 워커 수만 바꿔 가며 무엇이 바뀌고 무엇이 그대로인지 본다.
print('워커 / 최대 처리량 / 부하율 / 대기 시간 / 한 건의 처리 시간')
mu = 1000 / SERVICE_MS              # 워커 하나가 초당 처리하는 건수
for c in (1, 2, 4, 8, 16):
    cap = mu * c
    rho = QPS_PER_SERVER / cap
    if rho >= 1:
        print(f'  {c:>2}개  {cap:7.0f} 건/초  부하율 {rho:.2f}  대기열이 계속 쌓인다')
        continue
    a = QPS_PER_SERVER / mu
    wq = erlang_c(c, a) / (c * mu - QPS_PER_SERVER) * 1000 if c > a else float('inf')
    print(f'  {c:>2}개  {cap:7.0f} 건/초  부하율 {rho:.2f}  {wq:6.3f}ms 대기  '
          f'처리 시간은 그대로 {SERVICE_MS:.2f}ms')

# 4단계: 워커가 몇 개면 되는지 정리한다
need = math.ceil(QPS_PER_SERVER / mu / 0.77)
print(f'\n부하율을 0.77 아래로 두려면 워커 {need}개면 되는데, 그때 대기가 1.78ms 붙는다')
print('4개로 늘리면 대기가 0.04ms 로 거의 사라지고, 그 뒤로는 늘려도 얻을 것이 없다')
print(f'바뀌지 않는 것 둘 — 한 건의 처리 시간 {SERVICE_MS:.2f}ms 와 그 안의 오버헤드 {OVERHEAD_MS:.2f}ms')
print('그래서 8ms 초과율 10.69% 는 워커를 몇 개로 늘려도 그대로다')

# 출력:
# 3단계 뜻: 워커 1개는 부하율 1.04 라 대기열이 쌓이고, 2개면 1.782ms, 4개면 0.038ms 를 기다린다. 한 건의 처리 시간은 몇 개든 4.75ms 다.
# 워커 / 최대 처리량 / 부하율 / 대기 시간 / 한 건의 처리 시간
#    1개      211 건/초  부하율 1.04  대기열이 계속 쌓인다
#    2개      421 건/초  부하율 0.52   1.782ms 대기  처리 시간은 그대로 4.75ms
#    4개      842 건/초  부하율 0.26   0.038ms 대기  처리 시간은 그대로 4.75ms
#    8개     1684 건/초  부하율 0.13   0.000ms 대기  처리 시간은 그대로 4.75ms
#   16개     3368 건/초  부하율 0.07   0.000ms 대기  처리 시간은 그대로 4.75ms
# 4단계 뜻: 워커를 늘려 줄어드는 것은 대기뿐이다. 처리 시간과 그 안의 오버헤드 1.68ms 가 그대로라 8ms 초과율 10.69% 도 그대로다.
#
# 부하율을 0.77 아래로 두려면 워커 2개면 되는데, 그때 대기가 1.78ms 붙는다
# 4개로 늘리면 대기가 0.04ms 로 거의 사라지고, 그 뒤로는 늘려도 얻을 것이 없다
# 바뀌지 않는 것 둘 — 한 건의 처리 시간 4.75ms 와 그 안의 오버헤드 1.68ms
# 그래서 8ms 초과율 10.69% 는 워커를 몇 개로 늘려도 그대로다
````

### 부록 2: distributed-training (블록 2개, Task 7)

#### 블록 1

<!-- cb3 post=distributed-training block=0 sha=5bd15adb7e70b6d4 -->
````python
# 하는 일: GPU 4장이 2,000스텝을 동기와 비동기로 돈다고 놓고, 동기가 기다리는 시간과 비동기에서 기울기가 낡는 정도를 견준다.
import random, math

# 1단계: 장마다 스텝마다 걸린 시간을 뽑는다
# 스텝 하나의 중앙값은 4,096행 ÷ 초당 32,700행 = 0.125초이고, 흔들림은 로그정규로 준다. 전부 가상 값이다.
random.seed(7)
GPUS, STEPS = 4, 2_000
MED, SIGMA = 0.125, 0.12
mu = math.log(MED)

# 장마다 스텝마다 걸린 시간. 배치가 건드리는 임베딩 줄 수와 서버 상태가 달라 흔들린다.
times = [[random.lognormvariate(mu, SIGMA) for _ in range(STEPS)] for _ in range(GPUS)]

# 2단계: 동기로 돌린 시간을 센다
# 스텝마다 넷이 기울기를 합치므로 그 스텝의 가장 늦은 장에 맞춰진다.
alone = sum(times[0])
sync = sum(max(times[g][s] for g in range(GPUS)) for s in range(STEPS))
print(f"한 장이 혼자 {STEPS:,}스텝을 돌면 {alone:.1f}초")
print(f"동기 네 장은 스텝마다 늦은 장을 기다려 {sync:.1f}초, 혼자보다 {sync / alone - 1:.1%} 깁니다")
waited = sync - alone
print(f"기다린 {waited:.1f}초는 네 장 모두에게 붙어 {GPUS * waited:.0f}초의 GPU 시간이 됩니다")

# 3단계: 비동기로 돌려 기울기가 몇 스텝 낡는지 센다
# 각자 제 속도로 간다. 내가 기울기를 보내는 사이 남이 몇 번 갱신했나가 낡음이다.
ends = []
for g in range(GPUS):
    t = 0.0
    for s in range(STEPS):
        t += times[g][s]
        ends.append((t, g))
ends.sort()                      # 네 장의 갱신을 시각순으로 한 줄에 세운다

last, stale = {}, []
for i, (t, g) in enumerate(ends):
    if g in last:
        stale.append(i - last[g] - 1)    # 내 직전 갱신과 이번 갱신 사이에 끼어든 남의 갱신 수
    last[g] = i
print(f"비동기 네 장은 기다림이 0초입니다. 대신 기울기가 평균 {sum(stale) / len(stale):.1f}스텝 낡습니다"
      f" (최대 {max(stale)}스텝)")

# 출력:
# 2단계 뜻: 동기는 스텝마다 가장 늦은 장에 맞춰져 혼자보다 13.0% 길다. 기다린 32.5초 동안 나머지 셋도 쉬어서 GPU 시간 130초가 버려진다.
# 한 장이 혼자 2,000스텝을 돌면 250.6초
# 동기 네 장은 스텝마다 늦은 장을 기다려 283.1초, 혼자보다 13.0% 깁니다
# 기다린 32.5초는 네 장 모두에게 붙어 130초의 GPU 시간이 됩니다
# 3단계 뜻: 비동기는 기다리지 않는 대신, 기울기를 보내는 사이 다른 장이 평균 3.0번 갱신해 그만큼 낡은 기울기로 배운다.
# 비동기 네 장은 기다림이 0초입니다. 대신 기울기가 평균 3.0스텝 낡습니다 (최대 6스텝)
````

#### 블록 2

<!-- cb3 post=distributed-training block=1 sha=fda4dcd0c9c68600 -->
````python
# 하는 일: GPU 를 1장에서 32장까지 늘릴 때 30일치 학습 시간이 얼마나 주는지 센다.
# 1단계: 학습 시간 식을 만든다
# 계산은 장수만큼 나뉘지만, 기울기를 합치고 늦은 장을 기다리는 시간은 장수에 비례해 붙는다. 전부 가상 값이다.
ROWS = 745_500_000        # 30일 학습 행 (하루 2,485만 행 × 30일)
ROWS_PER_SEC = 32_700     # GPU 한 장이 초당 넘기는 행
OVERHEAD = 0.053          # 장이 하나 늘 때마다 스텝마다 더 붙는 몫

def train_time(gpus):
    compute = ROWS / ROWS_PER_SEC / gpus          # 계산은 장수만큼 나뉜다
    return compute * (1 + OVERHEAD * (gpus - 1))  # 합치기와 기다림은 장수에 비례해 붙는다

def hm(sec):
    m = round(sec / 60)
    return f"{m // 60}시간 {m % 60:02d}분" if m >= 60 else f"{m}분"

# 2단계: 장수마다 학습 시간, 배속, 효율을 찍는다
base = train_time(1)
print("GPU   학습 시간      배속   효율   줄어드는 시간")
prev = base
for g in (1, 2, 4, 8, 16, 32):
    t = train_time(g)
    saved = "%d분" % int((prev - t) // 60) if g > 1 else "-"
    print("%3d장 %10s %6.1f배 %5.0f%% %10s" % (g, hm(t), base / t, 100 * base / t / g, saved))
    prev = t

# 3단계: 붙은 시간이 어디서 왔는지 나눠 본다
print()
for g in (4, 8):                                  # 붙은 시간이 어디서 왔는지 나눠 본다
    comp = ROWS / ROWS_PER_SEC / g
    print("%d장: 계산 %s + 합치기와 기다림 %s = %s"
          % (g, hm(comp), hm(train_time(g) - comp), hm(train_time(g))))

# 출력:
# 2단계 뜻: 장수를 두 배로 늘려도 학습 시간은 절반까지 줄지 않는다. 효율이 2장 95% 에서 32장 38% 까지 떨어지고, 줄어드는 시간도 179분에서 11분으로 준다.
# GPU   학습 시간      배속   효율   줄어드는 시간
#   1장    6시간 20분    1.0배   100%          -
#   2장    3시간 20분    1.9배    95%       179분
#   4장    1시간 50분    3.5배    86%        89분
#   8장    1시간 05분    5.8배    73%        44분
#  16장        43분    8.9배    56%        22분
#  32장        31분   12.1배    38%        11분
# 3단계 뜻: 4장에서 8장으로 가면 계산은 1시간 35분에서 47분으로 절반이 되지만, 합치기와 기다림은 15분에서 18분으로 는다.
#
# 4장: 계산 1시간 35분 + 합치기와 기다림 15분 = 1시간 50분
# 8장: 계산 47분 + 합치기와 기다림 18분 = 1시간 05분
````

### 부록 3: batch-vs-realtime-inference (블록 2개, Task 7)

#### 블록 1

<!-- cb3 post=batch-vs-realtime-inference block=0 sha=166c5e2d4ff2ce1e -->
````python
# 하는 일: 유저 벡터를 요청마다 계산할 때와 새벽에 미리 만들어 둘 때를 하루 계산 시간, 온라인 저장소 메모리, 캐시 적중률로 견준다.
# 1단계: 요청량과 걸리는 시간을 둔다
# 전부 설명용 가상 값이다.
REQ_PER_DAY = 228_000_000      # 하루 광고 요청 (노출 수와 같다고 둔다)
USERS = 14_000_000             # 전체 회원
DIM, NBYTES = 64, 4            # 유저 벡터 64차원, 값 하나 4바이트
TOWER_MS = 0.8                 # 요청 때 유저 타워 한 번 (Two-Tower 글의 값)
FEAT_MS = 1.2                  # 그 입력 피처를 읽어 오는 시간
LOOKUP_MS = 0.2                # 미리 만든 벡터를 온라인 저장소에서 읽는 시간
WORKERS, BATCH_MIN = 8, 25     # 새벽 배치의 워커 수와 걸리는 시간
ACTIVE, ACTIVE_SHARE = 0.12, 0.80   # 활성 유저 비율, 그들이 만드는 요청 비율

# 2단계: 표 크기와 하루 계산 시간을 센다
make_ms = TOWER_MS + FEAT_MS                       # 그 자리에서 만들면 드는 시간
table_gb = USERS * DIM * NBYTES / 1e9
print(f"유저 벡터 표: {USERS:,}명 x {DIM}차원 x {NBYTES}B = {table_gb:.2f} GB")
print(f"새벽 배치: 워커 {WORKERS}개가 {BATCH_MIN}분 "
      f"= 한 명에 {WORKERS * BATCH_MIN * 60_000 / USERS:.2f} ms")

online_h = REQ_PER_DAY * make_ms / 1000 / 3600     # 요청마다 만들 때의 하루 계산 시간
batch_h = WORKERS * BATCH_MIN / 60                 # 새벽 배치가 쓴 워커 시간
print(f"하루 계산: 요청마다 {online_h:,.1f}시간, 새벽에 한 번 {batch_h:.1f}시간"
      f" -> {online_h / batch_h:.0f}배")
print(f"같은 사람이 하루 평균 {REQ_PER_DAY / USERS:.1f}번 요청한다\n")

# 3단계: 온라인 저장소에 누구의 벡터를 올릴지 견준다
# 올리지 않은 사람의 벡터는 요청 때 그 자리에서 만든다.
print("온라인 저장소에 누구의 벡터를 올리나")
for label, share, hit in (("전원 ", 1.0, 1.0), ("활성만", ACTIVE, ACTIVE_SHARE)):
    n = round(USERS * share)
    mem = n * DIM * NBYTES / 1e6
    avg = hit * LOOKUP_MS + (1 - hit) * make_ms    # 못 찾으면 그 자리에서 만든다
    print(f"  {label} {n:>10,}명  {mem:>5,.0f}MB  적중 {hit:>4.0%}  요청당 {avg:.2f}ms")
print(f"  안 올림 {0:>10}명  {0:>5}MB  적중   0%  요청당 {make_ms:.2f}ms")

# 출력:
# 2단계 뜻: 요청마다 만들면 하루 126.7시간, 새벽에 한 번 만들면 3.3시간으로 38배 차이다. 같은 사람이 하루 16.3번 요청해 같은 계산을 되풀이하기 때문이다.
# 유저 벡터 표: 14,000,000명 x 64차원 x 4B = 3.58 GB
# 새벽 배치: 워커 8개가 25분 = 한 명에 0.86 ms
# 하루 계산: 요청마다 126.7시간, 새벽에 한 번 3.3시간 -> 38배
# 같은 사람이 하루 평균 16.3번 요청한다
#
# 3단계 뜻: 전원을 올리면 3,584MB 로 요청당 0.20ms 다. 활성만 올리면 메모리는 430MB 로 줄지만, 못 찾은 요청은 그 자리에서 만들어 요청당 0.56ms 가 된다.
# 온라인 저장소에 누구의 벡터를 올리나
#   전원  14,000,000명  3,584MB  적중 100%  요청당 0.20ms
#   활성만  1,680,000명    430MB  적중  80%  요청당 0.56ms
#   안 올림          0명      0MB  적중   0%  요청당 2.00ms
````

#### 블록 2

<!-- cb3 post=batch-vs-realtime-inference block=1 sha=3b515f1cdc638b54 -->
````python
# 하는 일: 요청량에 맞춰 서버가 몇 대 필요한지, 한 달에 얼마인지 CPU 와 GPU 로 센다.
import math

# 1단계: 요청량과 서버 값을 둔다
# 가상 값이다.
QPS = 2_639           # 평시 요청량 (서빙 지연 글의 값)
LOAD_CAP = 0.77       # 부하율 상한. 평시에 이 선을 넘지 않게 대수를 잡는다 (같은 글)
SPARE = 1             # 예비 대수. 이만큼 빠져도 요청을 받아 낸다
HOURS = 720           # 한 달 (30일 x 24시간)
KINDS = {"CPU": (287, 480), "GPU": (2_300, 3_800)}   # (한 대 처리량 QPS, 시간당 원)

# 2단계: 대수와 한 달 값을 구하는 식을 만든다
# 평시에 부하율 상한을 지키는 대수와, 예비가 빠져도 요청을 받아 내는 대수를 견준다.
def machines(qps, cap):
    """평시 조건과 고장 조건 중 큰 쪽이 대수다."""
    normal = math.ceil(qps / (cap * LOAD_CAP))       # 평시에 부하율 상한을 지키는 대수
    failover = math.ceil(qps / cap) + SPARE          # 예비가 빠져도 요청을 받아 내는 대수
    return max(normal, failover), normal, failover

def cost(qps, cap, won):
    return machines(qps, cap)[0] * HOURS * won

# 3단계: 지금 요청량에서 CPU 와 GPU 를 견준다
print(f"요청 {QPS:,} QPS, 부하율 상한 {LOAD_CAP}, 예비 {SPARE}대")
for name, (cap, won) in KINDS.items():
    n, normal, failover = machines(QPS, cap)
    print(f"  {name}: 평시 {normal}대, 고장 {failover}대 -> {n}대"
          f" = 한 달 {cost(QPS, cap, won):,}원  (한 대 {cap:,} QPS, 시간당 {won:,}원)")
print(f"  차액 {cost(QPS, *KINDS['GPU']) - cost(QPS, *KINDS['CPU']):,}원\n")

# 4단계: 요청량을 바꿔 가며 싼 쪽을 찾는다
print(f"{'QPS':>7}{'CPU 대수':>8}{'CPU 한 달':>13}{'GPU 대수':>8}{'GPU 한 달':>13}  싼 쪽")
for q in (500, 2_639, 5_000, 10_000, 20_000):
    c, g = cost(q, *KINDS["CPU"]), cost(q, *KINDS["GPU"])
    print(f"{q:>7,}{machines(q, 287)[0]:>8}{c:>13,}{machines(q, 2_300)[0]:>8}{g:>13,}"
          f"  {'GPU' if g < c else 'CPU'}")

flip = next((q for q in range(500, 20_001)
             if cost(q, *KINDS["GPU"]) < cost(q, *KINDS["CPU"])), None)
print(f"\nGPU 가 처음 싸지는 요청량: {flip:,} QPS" if flip
      else "\n20,000 QPS 까지 GPU 가 싸지는 자리가 없다")
for k, (cap, won) in KINDS.items():
    print(f"  {k} 는 QPS 하나를 한 시간 받는 데 {won / cap:.2f}원")

# 출력:
# 3단계 뜻: 2,639 QPS 에서는 CPU 12대가 한 달 4,147,200원으로, GPU 3대의 8,208,000원보다 4,060,800원 싸다.
# 요청 2,639 QPS, 부하율 상한 0.77, 예비 1대
#   CPU: 평시 12대, 고장 11대 -> 12대 = 한 달 4,147,200원  (한 대 287 QPS, 시간당 480원)
#   GPU: 평시 2대, 고장 3대 -> 3대 = 한 달 8,208,000원  (한 대 2,300 QPS, 시간당 3,800원)
#   차액 4,060,800원
#
# 4단계 뜻: 표의 다섯 요청량에서는 모두 CPU 가 싸지만 6,851 QPS 에서는 GPU 가 싸진다. QPS 하나를 한 시간 받는 값이 1.67원과 1.65원으로 거의 같아서, 대수를 올림하는 데서 싼 쪽이 오간다.
#     QPS  CPU 대수      CPU 한 달  GPU 대수      GPU 한 달  싼 쪽
#     500       3    1,036,800       2    5,472,000  CPU
#   2,639      12    4,147,200       3    8,208,000  CPU
#   5,000      23    7,948,800       4   10,944,000  CPU
#  10,000      46   15,897,600       6   16,416,000  CPU
#  20,000      91   31,449,600      12   32,832,000  CPU
#
# GPU 가 처음 싸지는 요청량: 6,851 QPS
#   CPU 는 QPS 하나를 한 시간 받는 데 1.67원
#   GPU 는 QPS 하나를 한 시간 받는 데 1.65원
````

### 부록 4: stream-window-aggregation (블록 1개, Task 7)

#### 블록 1

<!-- cb3 post=stream-window-aggregation block=0 sha=080d0d3972ea93eb -->
````python
# 하는 일: 워터마크 값마다 하루 클릭 가운데 몇 건이 윈도우에서 빠지는지, 도착 지연을 뽑아 센 값과 식으로 구한 값으로 견준다.
import random

# 1단계: 도착 지연 분포를 둔다
# 분포는 4절 표와 같은 가상 값이다. 5초 안 95%, 2분 안 99.9%, 2분 넘음 0.1% 다.
N_DAY = 2_280_000                 # 하루 클릭 (엔지니어링 트랙의 값)
P_LATE = 0.001                    # 2분 넘게 늦는 비율

base = (1 - P_LATE) / 0.999       # 2분 안에 오는 99.9% 를 두 구간에 나눈다

# 2분을 넘는 0.1% 는 2~10분, 10~30분, 30분~2시간에 6:2:2 로 퍼져 있다고 둔다.
GROUPS = [                        # (몫, 지연 시작 초, 지연 끝 초). 구간 안은 고르게 퍼져 있다고 본다
    (0.95 * base, 0, 5), (0.049 * base, 5, 120),
    (P_LATE * 0.6, 120, 600), (P_LATE * 0.2, 600, 1800), (P_LATE * 0.2, 1800, 7200),
]

# 2단계: 늦을 확률을 구하는 식과 지연을 뽑는 함수를 만든다
def p_later(sec):
    """도착 지연이 sec 를 넘을 확률 — 구간마다 넘는 쪽 몫을 더한다."""
    total = 0.0
    for share, lo, hi in GROUPS:
        if sec <= lo:
            total += share
        elif sec < hi:
            total += share * (hi - sec) / (hi - lo)
    return total

def sample_delay(rnd):
    """구간 하나를 몫대로 고르고 그 안에서 고르게 하나 뽑는다 (초)."""
    u = rnd.random()
    for share, lo, hi in GROUPS:
        if u < share:
            return lo + rnd.random() * (hi - lo)
        u -= share
    return 7200.0

# 3단계: 하루치 지연을 뽑아 워터마크마다 센다
# 시드를 고정해 도착 지연을 하루 클릭 수만큼 뽑는다.
rnd = random.Random(20260930)                        # 시드 고정 — 몇 번을 돌려도 같은 값
delays = [sample_delay(rnd) for _ in range(N_DAY)]

print("워터마크   뽑아서 센 것    식으로 계산     하루 클릭 중")
for minute in (0.5, 1, 2, 5, 10, 30):
    drawn = sum(1 for d in delays if d > minute * 60)
    calc = N_DAY * p_later(minute * 60)
    print(f"{minute:>5}분 {drawn:>12,} {round(calc):>13,} {p_later(minute * 60):>15.3%}")

# 4단계: 2분과 10분을 견준다
gain = round(N_DAY * p_later(120)) - round(N_DAY * p_later(600))
print(f"\n2분에서 10분으로 늘리면 {gain:,}건을 더 건지고 값은 8분 더 묵는다")

# 출력:
# 3단계 뜻: 뽑아서 센 값과 식으로 구한 값이 거의 같다. 워터마크 2분이면 하루 2,280건(0.100%)이 빠지고, 1분으로 줄이면 60,569건으로 뛴다.
# 워터마크   뽑아서 센 것    식으로 계산     하루 클릭 중
#   0.5분       89,681        89,713          3.935%
#     1분       60,521        60,569          2.657%
#     2분        2,278         2,280          0.100%
#     5분        1,773         1,767          0.077%
#    10분          880           912          0.040%
#    30분          420           456          0.020%
# 4단계 뜻: 10분으로 늘려 더 건지는 1,368건 때문에 모든 값이 8분씩 더 묵는다.
#
# 2분에서 10분으로 늘리면 1,368건을 더 건지고 값은 8분 더 묵는다
````

### 부록 5: model-deployment-rollback (블록 1개, Task 7)

#### 블록 1

<!-- cb3 post=model-deployment-rollback block=0 sha=b97bc0898d494aba -->
````python
# 하는 일: 배포 단계마다 판정 윈도우에 모이는 요청과 클릭을 세고, COPC 가 우연으로 흔들리는 폭을 게이트 ±0.05 와 견준다.
import math

# 1단계: 요청량과 배포 단계를 둔다
# 요청 초당 2,639건, 클릭률 1% 로 가정한다. 전부 가상 값이다.
QPS, CTR, GATE = 2639, 0.01, 0.05          # 게이트는 1 에서 ±0.05
stages = [("1%  5분", 0.01, 300), ("10%  5분", 0.10, 300),
          ("10% 30분", 0.10, 1800), ("50% 30분", 0.50, 1800)]

# 2단계: 단계마다 클릭 수와 COPC 흔들림 폭을 찍는다
# COPC 는 실제 클릭 ÷ 예측 클릭이다. 모델이 완벽해도 클릭은 확률로 오므로, 클릭 n 건에서 표준오차가 대략 1/sqrt(n) 이고 그 2배를 흔들림 폭으로 본다.
print("단계          요청        클릭   COPC 흔들림   판정")
for name, share, sec in stages:
    req = QPS * share * sec
    clicks = req * CTR
    band = 2 / math.sqrt(clicks)             # 2 × 표준오차
    ok = "읽을 수 있음" if band <= GATE else "못 읽음 (잡음이 게이트보다 큼)"
    print(f"{name}  {req:>10,.0f}  {clicks:>8,.0f}   ±{band:.3f}       {ok}")

# 3단계: 게이트 안에 넣는 데 필요한 클릭 수를 구한다
need = math.ceil((2 / GATE) ** 2)            # 흔들림이 게이트 안에 들어오는 최소 클릭
print(f"\n흔들림을 ±{GATE} 안에 넣으려면 클릭 {need:,}건이 필요하다")

# 출력:
# 2단계 뜻: 1% 단계 5분에는 클릭이 79건뿐이라 COPC 흔들림 ±0.225 가 게이트보다 크다. 10% 로 30분을 모으면 클릭 4,750건에 흔들림이 ±0.029 로 줄어 읽을 수 있다.
# 단계          요청        클릭   COPC 흔들림   판정
# 1%  5분       7,917        79   ±0.225       못 읽음 (잡음이 게이트보다 큼)
# 10%  5분      79,170       792   ±0.071       못 읽음 (잡음이 게이트보다 큼)
# 10% 30분     475,020     4,750   ±0.029       읽을 수 있음
# 50% 30분   2,375,100    23,751   ±0.013       읽을 수 있음
# 3단계 뜻: 흔들림이 ±0.05 안에 들려면 클릭이 1,600건은 모여야 한다.
#
# 흔들림을 ±0.05 안에 넣으려면 클릭 1,600건이 필요하다
````

### 부록 6: inference-server (블록 2개, Task 7)

#### 블록 1

<!-- cb3 post=inference-server block=0 sha=155e61f2cac674f4 -->
````python
# 하는 일: 측정 두 개로 호출 오버헤드와 후보 한 건의 계산 비용을 풀고, 후보를 한 텐서로 넣을 때와 하나씩 부를 때의 시간을 견준다.
# 1단계: 측정 둘에서 오버헤드와 건당 비용을 푼다
# 측정값(가상)은 한 텐서 800건 3.0ms, 후보 1건 한 번 0.12ms 다. 시간 = 오버헤드 + 후보 수 × 건당 비용 이라고 두면 미지수 둘이 풀린다.
BUDGET = 8.0
T_800, T_1 = 3.0, 0.12
per_row = (T_800 - T_1) / 799          # 후보 한 건의 계산 비용
fixed = T_1 - per_row                   # 호출 한 번의 오버헤드
print(f"호출 오버헤드 {fixed:.4f}ms, 건당 계산 {per_row:.4f}ms")
# 2단계: 후보 수마다 두 방식의 시간을 예산과 견준다
# 모델 호출 예산은 8ms 다.
print(f"{'후보 수':>7}  {'한 텐서':>8}  {'하나씩':>9}   판정 (예산 {BUDGET:.0f}ms)")
for n in (1, 100, 800, 2000):
    one = fixed + n * per_row           # 한 번 부르고 n 줄 계산
    each = n * (fixed + per_row)        # n 번 부르고 매번 1줄 계산
    v1 = "통과" if one <= BUDGET else "초과"
    v2 = "통과" if each <= BUDGET else "초과"
    print(f"{n:>7,}  {one:>7.2f}ms  {each:>8.2f}ms   한 텐서 {v1}, 하나씩 {v2}")

# 출력:
# 1단계 뜻: 호출 한 번의 오버헤드 0.1164ms 가 후보 한 건의 계산 0.0036ms 보다 훨씬 크다.
# 호출 오버헤드 0.1164ms, 건당 계산 0.0036ms
# 2단계 뜻: 하나씩 부르면 오버헤드가 후보마다 붙어 100건에서 이미 12.00ms 로 예산을 넘는다. 한 텐서로 넣으면 2,000건도 7.33ms 로 통과한다.
#    후보 수      한 텐서        하나씩   판정 (예산 8ms)
#       1     0.12ms      0.12ms   한 텐서 통과, 하나씩 통과
#     100     0.48ms     12.00ms   한 텐서 통과, 하나씩 초과
#     800     3.00ms     96.00ms   한 텐서 통과, 하나씩 초과
#   2,000     7.33ms    240.00ms   한 텐서 통과, 하나씩 초과
````

#### 블록 2

<!-- cb3 post=inference-server block=1 sha=1bdebfbd0c94be04 -->
````python
# 하는 일: 웜업 없이 새 서버 2대를 열면 첫 30초 동안 폴백이 평소보다 몇 건 더 나가는지 센다.
# 1단계: 서버 수와 초과율을 둔다
# 서버 12대가 초당 2,639건을 나눠 받는다. 새 서버는 첫 30초 동안 2.5배 느려 8ms 초과율이 4.62% 에서 11.74% 가 된다(서빙 지연과 처리량 편 8절 값).
QPS, SERVERS, COLD_SEC = 2639, 12, 30
NORMAL, COLD = 0.0462, 0.1174
# 2단계: 새 2대가 느린 동안 더 넘긴 요청을 센다
# 배포는 2대씩 여섯 번 한다.
per_server = QPS / SERVERS                      # 서버 한 대가 받는 초당 요청
cold_reqs = per_server * 2 * COLD_SEC           # 새 2대가 느린 30초 동안 받는 요청
extra = cold_reqs * (COLD - NORMAL)             # 평소보다 더 넘긴 요청
print(f"서버 한 대 초당 {per_server:.0f}건. 새 2대가 첫 30초 동안 받는 요청 {cold_reqs:,.0f}건")
print(f"그중 예산을 넘겨 폴백으로 나간 요청이 평소보다 {extra:,.0f}건 더 (2대 한 번 바꿀 때)")
print(f"12대를 2대씩 여섯 번 바꾸면 {extra * 6:,.0f}건. 웜업 200건을 먼저 보내면 0건")

# 출력:
# 2단계 뜻: 새 2대를 한 번 열 때마다 폴백이 939건 더 나가고, 12대를 다 바꾸는 여섯 번이면 5,637건이다. 웜업 요청 200건을 먼저 보내면 0건이 된다.
# 서버 한 대 초당 220건. 새 2대가 첫 30초 동안 받는 요청 13,195건
# 그중 예산을 넘겨 폴백으로 나간 요청이 평소보다 939건 더 (2대 한 번 바꿀 때)
# 12대를 2대씩 여섯 번 바꾸면 5,637건. 웜업 200건을 먼저 보내면 0건
````

### 부록 7: container-ci-pipeline (블록 2개, Task 7)

#### 블록 1

<!-- cb3 post=container-ci-pipeline block=0 sha=f7d9174d11bbca13 -->
````python
# 하는 일: 광고별 최근 7일 클릭률 피처를 만들고, 그 유닛 테스트 셋을 돌린다.
import unittest

# 1단계: 피처 함수를 만든다
# 다른 광고의 로그와 윈도우 밖의 로그는 세지 않는다.
def ad_ctr_7d(logs, ad_id, today):
    """today 를 뺀 앞 7일(D-7 ~ D-1) 로그로 광고 하나의 클릭률을 낸다. 노출이 없으면 0."""
    imp = clk = 0
    for day, aid, is_click in logs:
        if aid != ad_id or not (today - 7 <= day <= today - 1):
            continue                       # 다른 광고이거나 윈도우 밖이면 세지 않는다
        imp += 1
        clk += is_click
    return clk / imp if imp else 0.0

# 2단계: 가상 로그를 만든다
# 로그 값은 전부 가상이다.
LOGS = [(day, 9931, 0) for day in range(1, 11)]   # 광고 9931: 1~10일 노출 10건
LOGS += [(3, 9931, 1), (9, 9931, 1)]             # 그중 3일과 9일에 클릭 (노출 12건, 클릭 2)
LOGS += [(5, 7720, 1)]                            # 다른 광고 7720 의 클릭 하나

# 3단계: 테스트 셋을 만들어 돌린다
# CI 는 이런 테스트 214개를 커밋마다 돌린다. 하나라도 틀리면 이미지가 만들어지지 않는다.
class TestAdCtr7d(unittest.TestCase):
    def test_window_only(self):
        # today=10 이면 윈도우는 3~9일. 그 안의 9931 노출 9건, 클릭 2건 → 2/9
        self.assertAlmostEqual(ad_ctr_7d(LOGS, 9931, today=10), 2 / 9)
    def test_other_ad_excluded(self):
        # 7720 의 클릭은 9931 의 분자에 들어가면 안 된다
        self.assertAlmostEqual(ad_ctr_7d(LOGS, 7720, today=10), 1.0)
    def test_no_impression(self):
        # 윈도우 안에 노출이 없으면 나누지 않고 0
        self.assertEqual(ad_ctr_7d(LOGS, 9931, today=30), 0.0)

unittest.main(argv=["x"], verbosity=2, exit=False)

# 출력 (시간은 돌릴 때마다 다르다):
# 3단계 뜻: 세 테스트가 모두 ok 이고, 마지막 줄의 OK 가 테스트 셋 전체가 통과했다는 뜻이다.
# test_no_impression (__main__.TestAdCtr7d) ... ok
# test_other_ad_excluded (__main__.TestAdCtr7d) ... ok
# test_window_only (__main__.TestAdCtr7d) ... ok
#
# ----------------------------------------------------------------------
# Ran 3 tests in 0.000s
#
# OK
````

#### 블록 2

<!-- cb3 post=container-ci-pipeline block=1 sha=593dd331393c5d8c -->
````python
# 하는 일: 계약 테스트의 부하 부분으로 요청 1,000건의 8ms 초과율을 세고, 새 피처가 더하는 시간마다 기준 6% 를 넘는지 본다.
import random, math

# 1단계: 예산과 통과 기준을 둔다
# 통과 기준은 6% 이하다. 전부 가상 값이다.
BUDGET_MS = 8.0
LIMIT_PCT = 6.0
N = 1000

# 2단계: 초과율을 세는 함수를 만든다
# 추론 시간은 로그정규(중앙값 3.0ms, 흩어짐 0.55)로 잡는다.
def exceed_rate(extra_ms, seed=20260917):
    """요청 N 건 중 예산 8ms 를 넘긴 비율(%). extra_ms 는 새 피처가 더하는 시간."""
    rnd = random.Random(seed)
    mu = math.log(3.0)
    over = 0
    for _ in range(N):
        t = rnd.lognormvariate(mu, 0.55) + extra_ms
        over += t > BUDGET_MS
    return 100 * over / N

# 3단계: 더하는 시간을 바꿔 가며 판정한다
# 새 피처의 조회가 요청마다 더하는 시간을 0 부터 1.0ms 까지 바꿔 본다.
print(f"{'새 피처가 더하는 시간':>14}  {'8ms 초과율':>8}  판정 (기준 {LIMIT_PCT}% 이하)")
for extra in (0.0, 0.2, 0.5, 1.0):
    rate = exceed_rate(extra)
    verdict = "통과" if rate <= LIMIT_PCT else "탈락"
    print(f"{extra:>12.1f}ms  {rate:>7.1f}%  {verdict}")

# 출력:
# 3단계 뜻: 새 피처가 0.5ms 를 더하면 초과율이 3.2% 에서 4.8% 로 올라도 통과하고, 1.0ms 를 더하면 6.3% 로 기준을 넘어 탈락한다.
#   새 피처가 더하는 시간   8ms 초과율  판정 (기준 6.0% 이하)
#          0.0ms      3.2%  통과
#          0.2ms      3.6%  통과
#          0.5ms      4.8%  통과
#          1.0ms      6.3%  탈락
````

### 부록 8: model-versioning-reproducibility (블록 1개, Task 7)

#### 블록 1

<!-- cb3 post=model-versioning-reproducibility block=0 sha=4f15130e6bc5f2ca -->
````python
# 하는 일: 같은 코드로 모델을 다시 만들면 같은 값이 나오는지, 시드와 데이터 버전을 하나씩 바꿔 가며 본다.
import random, math

# 1단계: 데이터 버전을 만드는 함수를 둔다
# 데이터는 전부 가상이고 크기는 설명용으로 작게 잡았다.
def make_data(seed, days=30, per_day=600):
    """30일치 가상 로그. seed 가 데이터 버전(스냅샷)을 정한다. 날마다 바탕 클릭률이 조금 다르다."""
    rng = random.Random(seed)
    rows = []
    for d in range(days):
        base = 0.02 + 0.004 * math.sin(d / 5)
        for _ in range(per_day):
            x1, x2 = rng.random(), rng.random()          # 피처 둘
            p = base * (1 + 2 * x1) * (1 + x2)
            rows.append((d, x1, x2, 1 if rng.random() < p else 0))
    return rows

# 2단계: 학습과 눈금 확인 함수를 만든다
# 로지스틱 회귀를 SGD 로 3에폭 학습한다.
def train(rows, seed, lr=0.02, epochs=3):
    """SGD 3에폭. seed 가 섞는 순서를 정한다. 시드를 안 적으면 매번 다른 값이 걸리는 것과 같다."""
    rng = random.Random(seed)
    w = [0.0, 0.0, -3.0]
    for _ in range(epochs):
        order = rows[:]
        rng.shuffle(order)
        for _, x1, x2, y in order:
            p = 1 / (1 + math.exp(-(w[0] * x1 + w[1] * x2 + w[2])))
            g = p - y
            w = [w[0] - lr * g * x1, w[1] - lr * g * x2, w[2] - lr * g]
    return w

def copc(w, rows):
    """실제 클릭 ÷ 예측 합. 1 이면 눈금이 맞고, 1 보다 크면 과소예측이다."""
    pred = sum(1 / (1 + math.exp(-(w[0] * x1 + w[1] * x2 + w[2]))) for _, x1, x2, _ in rows)
    return sum(r[3] for r in rows) / pred

def show(label, w, rows):
    print(f"{label}  w = {[round(v, 4) for v in w]}  COPC {copc(w, rows):.4f}")

# 3단계: 같은 재료로 두 번 학습한다
data = make_data(seed=2016)                       # 9월 3일에 쓴 데이터 버전
show("9월 3일 v412 (시드 417)     ", train(data, 417), data)
show("재료 넷 같고 시드도 417     ", train(data, 417), data)

# 4단계: 시드만 바꿔 본다
for s in (1, 2, 3):
    show(f"시드만 다름 ({s})            ", train(data, s), data)

# 5단계: 하루 파티션만 다른 데이터 버전으로 학습한다
# 08-20 파티션(d=16)만 9월 5일 백필로 다시 써진 버전이다. 그 날 행만 다른 난수로 다시 만든다.
data2 = [r for r in data if r[0] != 16] + [r for r in make_data(seed=2017) if r[0] == 16]
show("08-20 한 날만 다른 버전 (417)", train(data2, 417), data2)

# 출력:
# 3단계 뜻: 재료 넷과 시드가 같으면 가중치 세 개와 COPC 0.9647 이 그대로 다시 나온다.
# 9월 3일 v412 (시드 417)       w = [1.0103, 0.8028, -3.7022]  COPC 0.9647
# 재료 넷 같고 시드도 417       w = [1.0103, 0.8028, -3.7022]  COPC 0.9647
# 4단계 뜻: 데이터와 코드가 같아도 시드만 바꾸면 COPC 가 0.9490 에서 0.9530 사이로 흔들린다.
# 시드만 다름 (1)              w = [0.9241, 0.8324, -3.652]  COPC 0.9490
# 시드만 다름 (2)              w = [1.0022, 0.7662, -3.6611]  COPC 0.9505
# 시드만 다름 (3)              w = [0.932, 0.8628, -3.6781]  COPC 0.9530
# 5단계 뜻: 08-20 하루 파티션만 다른 버전으로 바꾸면 COPC 가 1.0206 으로 가장 크게 달라진다.
# 08-20 한 날만 다른 버전 (417)  w = [0.9766, 0.8329, -3.7592]  COPC 1.0206
````

### 부록 9: training-pipeline-dag (블록 2개, Task 7)

#### 블록 1

<!-- cb3 post=training-pipeline-dag block=0 sha=c931d49ee9208787 -->
````python
# 하는 일: pctr_daily 의 시각표를 정상 실행과 실패 뒤 재실행으로 찍고, 30일 백필에 걸리는 시간을 센다.
from datetime import datetime, timedelta

# 1단계: 태스크와 걸리는 시간을 둔다
# 걸리는 시간은 전부 설명용 가상 값이다.
STEPS = [                       # (태스크 이름, 걸리는 분)
    ("1 로그 도착 확인", 3),
    ("2 라벨 붙이기", 25),
    ("3 피처 만들기", 38),
    ("4 학습", 55),
    ("5 평가 게이트", 7),
    ("6 등록", 1),
    ("7 배포 요청", 0),
]

# 2단계: 시각표를 찍는 함수를 만든다
def timetable(start, steps):
    """start 부터 steps 를 차례로 돌려 태스크마다 끝나는 시각을 찍는다."""
    t = start
    for name, minutes in steps:
        t += timedelta(minutes=minutes)
        print(f"  {name:<9} {minutes:>3}분 → {t:%H:%M}")
    return t

# 3단계: 04:00 에 시작한 정상 실행의 시각표를 찍는다
day = datetime(2026, 9, 15, 4, 0)
print("정상 실행 (04:00 시작)")
end = timetable(day, STEPS)
print(f"  완료 {end:%H:%M}, 한 바퀴 {int((end - day).total_seconds() // 60)}분\n")

# 4단계: 3번 태스크가 실패한 뒤 그 태스크부터 다시 돌린다
print("3 이 05:12 에 실패 → 05:40 에 3 부터 재실행 (1, 2 는 건너뜀)")
rerun = [("3 피처 만들기", 37)] + STEPS[3:]      # 메타 표가 이미 있어 1분 빠르다
end2 = timetable(datetime(2026, 9, 15, 5, 40), rerun)
print(f"  완료 {end2:%H:%M}, 재실행 {int((end2 - datetime(2026, 9, 15, 5, 40)).total_seconds() // 60)}분\n")

# 5단계: 30일 백필에 걸리는 시간을 센다
DAYS, PARALLEL = 30, 6
per_day = 25 + 38                                # 백필은 2, 3 만 다시 만든다
serial = DAYS * per_day
para = serial // PARALLEL
print(f"백필 30일: 하루 {per_day}분 × {DAYS} = {serial}분 = {serial // 60}시간 {serial % 60}분 (직렬)")
print(f"          {PARALLEL}개 동시 → {para}분 = {para // 60}시간 {para % 60}분")

# 출력:
# 3단계 뜻: 태스크 일곱 개가 차례로 돌아 06:09 에 끝난다. 한 바퀴는 129분이다.
# 정상 실행 (04:00 시작)
#   1 로그 도착 확인   3분 → 04:03
#   2 라벨 붙이기   25분 → 04:28
#   3 피처 만들기   38분 → 05:06
#   4 학습       55분 → 06:01
#   5 평가 게이트    7분 → 06:08
#   6 등록        1분 → 06:09
#   7 배포 요청     0분 → 06:09
#   완료 06:09, 한 바퀴 129분
#
# 4단계 뜻: 1, 2 를 건너뛰고 3 부터 다시 돌리면 100분이 걸려 07:20 에 끝난다.
# 3 이 05:12 에 실패 → 05:40 에 3 부터 재실행 (1, 2 는 건너뜀)
#   3 피처 만들기   37분 → 06:17
#   4 학습       55분 → 07:12
#   5 평가 게이트    7분 → 07:19
#   6 등록        1분 → 07:20
#   7 배포 요청     0분 → 07:20
#   완료 07:20, 재실행 100분
#
# 5단계 뜻: 백필은 라벨 붙이기와 피처 만들기만 다시 해 하루 63분이다. 30일을 직렬로 돌리면 31시간 30분, 6개를 동시에 돌리면 5시간 15분이다.
# 백필 30일: 하루 63분 × 30 = 1890분 = 31시간 30분 (직렬)
#           6개 동시 → 315분 = 5시간 15분
````

#### 블록 2

<!-- cb3 post=training-pipeline-dag block=1 sha=05ec695db95be1ad -->
````python
# 하는 일: 같은 날 파티션을 두 번 만들면 행이 몇 개가 되는지, 덮어쓰기와 덧붙이기를 나란히 센다.
# 1단계: 하루 학습 행을 센다
# 노출 2억 2,800만, 클릭 228만은 이 블로그의 표준 가상 값이다.
IMP, CLK = 228_000_000, 2_280_000
SAMPLE = 10                                   # 비클릭은 10줄에 1줄만 남긴다
rows = (IMP - CLK) // SAMPLE + CLK            # 하루 학습 행
print(f"하루 학습 행 {rows:,} = 비클릭 {(IMP - CLK) // SAMPLE:,} + 클릭 {CLK:,}")
print(f"학습 행 안의 클릭 비율 {CLK / rows:.2%}\n")

# 2단계: 1회차가 절반에서 죽은 뒤 다시 만든다
half = rows // 2                              # 1회차가 절반을 쓰고 죽었다고 하자
cases = [("덮어쓰기", rows), ("덧붙이기", half + rows)]
for mode, after in cases:
    dup = after - rows                        # 진짜 행 수보다 많은 만큼이 중복
    print(f"{mode}: 1회차 {half:,} 행에서 실패 → 2회차 뒤 {after:,} 행, 중복 {dup:,} ({dup / after:.1%})")

# 3단계: 1회차가 다 쓴 뒤 다시 돌린 경우를 센다
print(f"\n덧붙이기인데 1회차가 다 쓴 뒤 다시 돌렸다면 {rows * 2:,} 행 (2배)")

# 출력:
# 1단계 뜻: 비클릭을 덜어 낸 하루 학습 행이 24,852,000 이고, 그 안의 클릭 비율은 9.17% 다.
# 하루 학습 행 24,852,000 = 비클릭 22,572,000 + 클릭 2,280,000
# 학습 행 안의 클릭 비율 9.17%
#
# 2단계 뜻: 덮어쓰기는 다시 만들어도 24,852,000 행 그대로다. 덧붙이기는 1회차가 쓴 12,426,000 행이 중복으로 남아 파티션의 33.3% 가 중복이다.
# 덮어쓰기: 1회차 12,426,000 행에서 실패 → 2회차 뒤 24,852,000 행, 중복 0 (0.0%)
# 덧붙이기: 1회차 12,426,000 행에서 실패 → 2회차 뒤 37,278,000 행, 중복 12,426,000 (33.3%)
# 3단계 뜻: 덧붙이기에서 1회차가 다 쓴 뒤 다시 돌렸다면 행이 두 배인 49,704,000 이 된다.
#
# 덧붙이기인데 1회차가 다 쓴 뒤 다시 돌렸다면 49,704,000 행 (2배)
````

---

### Task 1: 파서 — 출력 영역 안의 하는 일 줄은 자리를 알린다 — `js/code-steps.js`

**Files:**
- Modify: `js/code-steps.js` (하는 일 오타 문구를 자리에 따라 고른다)
- Test: `scripts/test-code-steps.js` (시험 4개를 더한다)

**Interfaces:**
- Consumes: 둘째 묶음의 `CodeSteps.parse(src)` → `{ format, ok, errors: [{ line, msg }], labels, head, rows, stepLines, codeEnd, out, src }`
- Produces: 하는 일 모양의 줄이 출력 영역 안에만 있으면 `{ format: 'steps', ok: false, errors: [{ line, msg: '하는 일 줄은 블록 맨 위, 상태 표시 바로 다음 줄에 둡니다' }], src }`. 몸통 안의 오타는 지금처럼 `하는 일 줄은 들여쓰기 없이 \`# 하는 일: …\` 꼴로 씁니다` 다. 블록 247개의 읽은 결과는 바뀌지 않는다.

- [ ] **Step 1: 시험 4개를 먼저 더한다**

**Edit 1.1 — `scripts/test-code-steps.js`**

찾을 글:

````js
eq('대문자가 든 글 id', C.parse(block('# (TS-linTS 글의 코드에 이어서 돌린다.)', '# 하는 일: 앞 글에 이어서 돈다.', 'run()')).labels,
  [{ kind: 'cont-post', post: 'TS-linTS', text: '앞 글에 이어서' }]);
````

바꿀 글:

````js
eq('대문자가 든 글 id', C.parse(block('# (TS-linTS 글의 코드에 이어서 돌린다.)', '# 하는 일: 앞 글에 이어서 돈다.', 'run()')).labels,
  [{ kind: 'cont-post', post: 'TS-linTS', text: '앞 글에 이어서' }]);
eq('밑줄이 든 글 id', C.parse(block('# (ucb_ts 글의 코드에 이어서 돌린다.)', '# 하는 일: 앞 글에 이어서 돈다.', 'run()')).labels,
  [{ kind: 'cont-post', post: 'ucb_ts', text: '앞 글에 이어서' }]);
eq('쌍점 앞에 띄어 쓴 하는 일도 잡는다', msgs(block('# 하는 일 : x.', 'print(1)')), ['1:하는 일 줄은 들여쓰기 없이 `# 하는 일: …` 꼴로 씁니다']);
eq('출력 영역 안의 하는 일 줄은 자리가 틀렸다고 알린다', msgs(block('print(1)', '# 출력:', '# 뜻: 하나.', '# 1', '# 하는 일: x.')),
  ['5:하는 일 줄은 블록 맨 위, 상태 표시 바로 다음 줄에 둡니다']);
eq('문자열 속 하는 일 줄은 옛 형식 그대로', C.parse(block('s = """', '# 하는 일: 문자열 안이다.', '"""', 'print(s)')).format, 'legacy');
````

- [ ] **Step 2: 시험이 실패하는지 본다**

Run: `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch3"; mkdir -p "$SCRATCH"; node scripts/check-code-blocks.js --json | shasum > "$SCRATCH/json-before-1.txt"; node scripts/test-code-steps.js | tail -3`
Expected: 마지막 줄 `92 통과, 1 실패`. 실패는 `출력 영역 안의 하는 일 줄은 자리가 틀렸다고 알린다` 하나다(지금은 「들여쓰기 없이」 문구가 나온다). 나머지 셋은 지금 동작을 붙잡는 시험이라 이미 통과한다.

- [ ] **Step 3: 파서를 고친다**

**Edit 1.2 — `js/code-steps.js`**

찾을 글:

````js
        if (loose < 0) return { format: 'legacy', ok: true, errors: [], src: text };
        err(loose, '하는 일 줄은 들여쓰기 없이 `# 하는 일: …` 꼴로 씁니다');
````

바꿀 글:

````js
        if (loose < 0) return { format: 'legacy', ok: true, errors: [], src: text };
        // 출력 영역 안의 하는 일 줄은 꼴이 아니라 자리가 틀린 것이다
        err(loose, loose < bodyEnd ? '하는 일 줄은 들여쓰기 없이 `# 하는 일: …` 꼴로 씁니다' : '하는 일 줄은 블록 맨 위, 상태 표시 바로 다음 줄에 둡니다');
````

- [ ] **Step 4: 시험과 형식 검사를 돌린다**

Run: `node scripts/test-code-steps.js | tail -1`
Expected: `93 통과, 0 실패`

Run: `node scripts/check-code-blocks.js | tail -1`
Expected: `✓ 새 형식 블록 57개, 옛 형식 블록 190개, 문제 0건`

Run: `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch3"; node scripts/check-code-blocks.js --json | shasum | diff - "$SCRATCH/json-before-1.txt" && echo 같다`
Expected: `같다` — 지금 블록 247개를 읽은 결과가 그대로다.

- [ ] **Step 5: 커밋**

````bash
git add js/code-steps.js scripts/test-code-steps.js
git commit -F - <<'EOF'
fix(js): 출력 영역 안의 하는 일 줄은 꼴이 아니라 자리가 틀렸다고 알린다 — 밑줄 글 id, 쌍점 앞 띄어쓰기, 문자열 속 하는 일 시험을 더함

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

---

### Task 2: 복사와 숫자 줄바꿈 — `scripts/test-code-steps.js`, `js/main.js`, `css/style.css`

**Files:**
- Test: `scripts/test-code-steps.js` (배치 시험이 복사 처리기도 붙잡아 비켜서기를 본다. 되돌리기를 try/finally 안으로)
- Modify: `js/main.js` (Copy 단추의 숨은 textarea, 두 줄)
- Modify: `css/style.css` (파이썬이 아닌 블록의 숫자, 한 줄과 주석)
- 임시: `$SCRATCH/nocache_server.py` (Task 6, 8 도 쓴다)

**Interfaces:**
- Consumes: Task 1 의 `scripts/test-code-steps.js`, 둘째 묶음의 `onCopy` 비켜서기(`if (inTextField(document.activeElement)) return;`)
- Produces: `copyText(text, btn)` 의 대체 경로가 `ta.readOnly = true` 로 칸을 만들고, 지운 뒤 `btn.focus()` 를 부른다. `pre.cb-wrap .hljs-number { white-space: nowrap; }`.

- [ ] **Step 1: 시험을 고친다**

**Edit 2.1 — `scripts/test-code-steps.js`**

찾을 글:

````js
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
````

바꿀 글:

````js
{
  // 배치가 실패하는 블록 하나를 두고 두 번 배치한다. 화면에서는 글꼴과 창 크기가 바뀔 때마다 다시 배치한다.
  // 첫 mount 가 문서에 붙이는 복사 처리기도 여기서 붙잡는다. 처리기는 문서에 한 번만 붙는다.
  const warns = [];
  const realWarn = console.warn;
  let onCopy = null, asked = 0;
  console.warn = msg => warns.push(msg);
  global.document = {
    activeElement: null,
    addEventListener(type, fn) { if (type === 'copy') onCopy = fn; },
    getSelection() { asked++; return null; },
  };
  try {
    const bad = { querySelector() { throw new Error('일부러'); }, addEventListener() {} };
    const root = { querySelectorAll: sel => (sel === '.cb' ? [bad] : []) };
    C.mount(root);
    C.mount(root);
    eq('실패한 블록은 다시 배치해도 한 번만 알린다', warns, ['코드 블록 하나를 배치하지 못했습니다']);
    const ev = { clipboardData: { setData() {} }, preventDefault() {} };
    document.activeElement = { tagName: 'TEXTAREA' };
    onCopy(ev);
    const inField = asked;
    document.activeElement = { tagName: 'DIV' };
    onCopy(ev);
    eq('글자 칸에 포커스가 있으면 복사 처리가 고른 자리를 보지 않는다', [inField, asked], [0, 1]);
  } finally {
    console.warn = realWarn;
    delete global.document;
  }
}
````

- [ ] **Step 2: 시험을 돌린다**

Run: `node scripts/test-code-steps.js | tail -1`
Expected: `94 통과, 0 실패` — 새 시험은 둘째 묶음이 넣은 비켜서기를 붙잡는 시험이라 코드를 고치기 전에도 통과한다. 다음 단계가 이 시험이 그 줄을 실제로 잡는지 본다.

- [ ] **Step 3: 그 시험이 비켜서기 줄을 잡는지 본다** (사본에서만)

Run:

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch3"; M="$SCRATCH/mut"; mkdir -p "$M/js" "$M/scripts"
cp js/code-steps.js "$M/js/"; cp scripts/test-code-steps.js "$M/scripts/"
grep -c '    if (inTextField(document.activeElement)) return;' "$M/js/code-steps.js"
sed -i.bak '/    if (inTextField(document.activeElement)) return;/d' "$M/js/code-steps.js"
node "$M/scripts/test-code-steps.js" | grep -E '✗|통과,'
````

Expected: `1`, 그다음 `✗ 글자 칸에 포커스가 있으면 복사 처리가 고른 자리를 보지 않는다` 와 `93 통과, 1 실패`. 저장소의 파일은 그대로다(`git status --short` 에 Step 1 의 시험 파일만 보인다).

- [ ] **Step 4: `js/main.js` 를 고친다 — NUL 바이트가 있는 파일이라 Edit 로 이 줄들만 바꾼다**

**Edit 2.2 — `js/main.js`**

찾을 글:

````js
    ta.style.opacity = '0';
    document.body.appendChild(ta);
````

바꿀 글:

````js
    ta.style.opacity = '0';
    ta.readOnly = true;          // 휴대폰에서 포커스가 가도 자판이 뜨지 않게 한다
    document.body.appendChild(ta);
````

**Edit 2.3 — `js/main.js`**

찾을 글:

````js
    document.body.removeChild(ta);
    done();
````

바꿀 글:

````js
    document.body.removeChild(ta);
    btn.focus();                 // 숨은 칸으로 옮겨 간 포커스를 Copy 단추에 돌려준다
    done();
````

Run: `python3 -c "print(open('js/main.js','rb').read().count(b'\x00'))"`
Expected: `4`

- [ ] **Step 5: 고치기 전 숫자 줄바꿈을 잰다**

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
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch3"; mkdir -p "$SCRATCH"
python3 - nocache_server.py <<'EOF'
import os, re, sys
T = '`' * 4
plan = open('docs/superpowers/plans/2026-10-14-python-code-blocks-batch3.md', encoding='utf-8').read()
for name in sys.argv[1:]:
    m = re.search(r'^<!-- file \$SCRATCH/' + re.escape(name) + r' -->\n' + T + r'[a-z]*\n(.*?)^' + T + r'\n', plan, re.S | re.M)
    dest = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'code-steps-batch3', name)
    if not os.path.exists(dest):
        open(dest, 'w', encoding='utf-8').write(m.group(1))
    print(dest)
EOF
````

Expected: 파일 경로 한 줄.

서버를 백그라운드로 띄운다: `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch3"; python3 "$SCRATCH/nocache_server.py" "$(pwd)" 8771`

`http://127.0.0.1:8771/post.html?id=api-basics` 를 새 캐시(`new_page` 에 `isolatedContext` 이름)로 열고 아래 함수를 돌린다. 글 전부를 390px iframe 으로 차례로 열어, 숫자 토큰이 두 줄에 걸린 곳과 옆으로 넘친 글을 센다.

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

Expected (계획을 쓸 때 잰 값): `{"posts":108,"numbers":1048,"overflow":[],"broken":["pipeline-push-and-pull:1","api-basics:2","log-hops-to-kafka:1"]}`. `broken` 은 글꼴에 따라 조금 다를 수 있다. 보고서에 그대로 적는다.

- [ ] **Step 6: CSS 를 고친다**

**Edit 2.4 — `css/style.css`**

찾을 글:

````css
/* 숫자 한 덩어리(3e-3, 1_000)는 줄 끝에서 끊지 않는다. 휴대폰에서 lr=3e-3 이 3e- 에서 끊겼다 */
.cb-n { color: var(--series-5); white-space: nowrap; }
````

바꿀 글:

````css
/* 숫자 한 덩어리(3e-3, 1_000)는 줄 끝에서 끊지 않는다. 휴대폰에서 lr=3e-3 이 3e- 에서 끊겼다.
   파이썬이 아닌 블록(pre.cb-wrap)의 숫자도 같다 */
.cb-n { color: var(--series-5); white-space: nowrap; }
pre.cb-wrap .hljs-number { white-space: nowrap; }
````

- [ ] **Step 7: 고친 뒤 다시 잰다**

같은 함수를 새 캐시로 다시 돌린다.
Expected: `{"posts":108,"numbers":1048,"overflow":[],"broken":[]}` — `overflow` 와 `broken` 이 둘 다 비어 있어야 한다. 서버를 끈다.

- [ ] **Step 8: 시험과 검사를 돌린다**

Run: `node scripts/test-code-steps.js | tail -1 && node scripts/check-design.js | tail -1 && node scripts/check-wording.js | tail -1`
Expected: `94 통과, 0 실패`, `✓ 78개 파일 디자인 게이트 통과`, `✓ 261개 파일 말투와 낱말 검사 통과 …`

- [ ] **Step 9: 커밋**

````bash
git add scripts/test-code-steps.js js/main.js css/style.css
git commit -F - <<'EOF'
fix(js): Copy 단추의 숨은 칸이 휴대폰 자판을 띄우지 않고 포커스를 단추에 돌려준다 — 파이썬이 아닌 블록의 숫자도 줄 끝에서 끊지 않고, 복사 처리의 비켜서기를 시험으로 묶음

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

---

### Task 3: 형식 검사 다지기 — `scripts/check-code-blocks.js`

**Files:**
- Modify: `scripts/check-code-blocks.js` (js/posts.js 모양, contentUrl 꼴, 머리 주석)
- Test: `scripts/test-check-code-blocks.js` (시험 6개를 더하고, 임시 폴더를 끝날 때 늘 지운다)

**Interfaces:**
- Consumes: Task 1 의 `parse`
- Produces:
  - `<root>/js/posts.js` 의 `posts` 가 배열이 아니면 `✗ js/posts.js 에서 글 목록(posts 배열)을 읽지 못했습니다: <경로>` 를 찍고 종료 코드 2.
  - contentUrl 이 `posts/<파일 이름>.md` 꼴이 아닌 글 id 에 이어서 돌리면 `이어서 돌릴 글 <글 id> 의 contentUrl 이 posts/<파일 이름>.md 꼴이 아닙니다`.
  - `--json` 의 모양은 그대로다(Task 4 와 둘째 묶음의 실행 검사가 읽는다).

- [ ] **Step 1: 시험 6개를 먼저 더한다**

**Edit 3.1 — `scripts/test-check-code-blocks.js`**

찾을 글:

````js
const roots = [];
function site(posts, baseline, ids) {
````

바꿀 글:

````js
const roots = [];
// 시험이 중간에 던져도 임시 폴더를 지운다
process.on('exit', () => { for (const d of roots) fs.rmSync(d, { recursive: true, force: true }); });
function site(posts, baseline, ids) {
````

**Edit 3.2 — `scripts/test-check-code-blocks.js`**

찾을 글:

````js
    const list = ids.map(([id, file]) => `{ id: '${id}', contentUrl: 'posts/${file}.md' }`).join(', ');
````

바꿀 글:

````js
    // [글 id, 파일 이름] 이고, 셋째 값이 있으면 그것을 contentUrl 로 그대로 쓴다
    const list = ids.map(([id, file, url]) => `{ id: '${id}', contentUrl: '${url || `posts/${file}.md`}' }`).join(', ');
````

**Edit 3.3 — `scripts/test-check-code-blocks.js`**

찾을 글:

````js
r = run(up, '--update');
eq('--update 는 지금 수를 기준표로 적는다',
  [r.code, JSON.parse(fs.readFileSync(path.join(up, 'scripts', 'code-blocks-baseline.json'), 'utf8'))], [0, { 'a.md': 1 }]);
````

바꿀 글:

````js
r = run(up, '--update');
eq('--update 는 지금 수를 기준표로 적는다',
  [r.code, JSON.parse(fs.readFileSync(path.join(up, 'scripts', 'code-blocks-baseline.json'), 'utf8'))], [0, { 'a.md': 1 }]);
r = run(site({ a: [OLD], b: [OLD] }, { 'a.md': 2, 'b.md': 3 }));
eq('줄어든 글이 여럿이면 쉼표로 잇는다', [r.code, r.out.includes('기준표보다 줄어든 글 2편 (a.md 2→1, b.md 3→1)')], [0, true]);
````

**Edit 3.4 — `scripts/test-check-code-blocks.js`**

찾을 글:

````js
r = run(site({ a: [['text', 'print(1)'], ['pyramid', 'x = 1']] }, {}));
eq('파이썬이 아닌 꼬리표는 보지 않는다', r.code, 0);
````

바꿀 글:

````js
r = run(site({ a: [['text', 'print(1)'], ['pyramid', 'x = 1']] }, {}));
eq('파이썬이 아닌 꼬리표는 보지 않는다', r.code, 0);
r = run(site({ a: [['Python', 'print(1)'], ['py3', 'print(2)']] }, {}));
eq('대문자 Python 과 py3 도 실패', [r.code, r.out.includes('(지금 `Python`)'), r.out.includes('(지금 `py3`)')], [1, true, true]);
r = run(site({ a: [['python3', 'print(0)'], NEW] }, {}), '--json');
eq('--json 은 꼬리표가 틀린 블록을 빼고 파이썬 블록 차례를 센다', JSON.parse(r.out).map(b => [b.post, b.index]), [['a', 0]]);
````

**Edit 3.5 — `scripts/test-check-code-blocks.js`**

찾을 글:

````js
r = run(idSite('nope'));
eq('없는 글', [r.code, r.out.includes('이어서 돌릴 글 nope 가 js/posts.js 에 없습니다')], [1, true]);
````

바꿀 글:

````js
r = run(idSite('nope'));
eq('없는 글', [r.code, r.out.includes('이어서 돌릴 글 nope 가 js/posts.js 에 없습니다')], [1, true]);
r = run(site({ c: [cont('b-id')] }, {}, [['b-id', 'Gone'], ['c', 'c']]));
eq('글 id 는 있는데 파일이 없다', [r.code, r.out.includes('이어서 돌릴 글 b-id 의 파일 posts/Gone.md 가 없습니다')], [1, true]);
r = run(site({ c: [cont('b-id')] }, {}, [['b-id', null, 'https://example.com/b'], ['c', 'c']]));
eq('contentUrl 이 꼴에 안 맞는 글', [r.code, r.out.includes('이어서 돌릴 글 b-id 의 contentUrl 이 posts/<파일 이름>.md 꼴이 아닙니다')], [1, true]);
const noList = site({ c: [cont('b-id')] }, {});
fs.mkdirSync(path.join(noList, 'js'));
fs.writeFileSync(path.join(noList, 'js', 'posts.js'), 'module.exports = {};\n');
r = run(noList);
eq('js/posts.js 에 글 목록이 없으면 멈춘다', [r.code, r.out.includes('js/posts.js 에서 글 목록(posts 배열)을 읽지 못했습니다')], [2, true]);
````

**Edit 3.6 — `scripts/test-check-code-blocks.js`**

찾을 글:

````js
for (const d of roots) fs.rmSync(d, { recursive: true, force: true });
console.log(`\n${pass} 통과, ${fail} 실패`);
````

바꿀 글:

````js
console.log(`\n${pass} 통과, ${fail} 실패`);
````

- [ ] **Step 2: 시험이 실패하는지 본다**

Run: `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch3"; mkdir -p "$SCRATCH"; node scripts/check-code-blocks.js --json | shasum > "$SCRATCH/json-before-3.txt"; node scripts/test-check-code-blocks.js | grep -E '✗|[0-9]+ 통과,'`
Expected: 마지막 줄 `20 통과, 2 실패`. 실패는 `contentUrl 이 꼴에 안 맞는 글`(지금은 「js/posts.js 에 없습니다」 문구) 과 `js/posts.js 에 글 목록이 없으면 멈춘다`(지금은 TypeError 로 종료 코드 1) 다. 나머지 넷은 지금 동작을 붙잡는 시험이라 이미 통과한다.

- [ ] **Step 3: 형식 검사를 고친다**

**Edit 3.7 — `scripts/check-code-blocks.js`**

찾을 글:

````js
//   node scripts/check-code-blocks.js            → 새 형식 블록의 표시 오류와, 기준표보다 늘어난 옛 형식 블록을 알린다 (CI)
````

바꿀 글:

````js
//   node scripts/check-code-blocks.js            → 새 형식 블록의 표시 오류, python 이 아닌 파이썬 꼬리표, 이어서 돌릴 글의 id,
//                                                   기준표보다 늘어난 옛 형식 블록을 알린다 (CI). 기준표보다 줄면 --update 를 권한다
````

**Edit 3.8 — `scripts/check-code-blocks.js`**

찾을 글:

````js
  if (fs.existsSync(js)) {
    for (const p of require(js).posts) {
      const m = /^posts\/(.+)\.md$/.exec(p.contentUrl || '');
      if (m) ids.set(p.id, m[1]);
    }
  } else {
````

바꿀 글:

````js
  if (fs.existsSync(js)) {
    const list = require(js).posts;
    if (!Array.isArray(list)) {
      console.error(`✗ js/posts.js 에서 글 목록(posts 배열)을 읽지 못했습니다: ${js}`);
      process.exit(2);
    }
    for (const p of list) {
      // contentUrl 이 posts/<파일 이름>.md 꼴이 아니면 파일 이름을 '' 로 둔다. 그 글에 이어서 돌리면 아래에서 알린다.
      const m = /^posts\/(.+)\.md$/.exec(p.contentUrl || '');
      ids.set(p.id, m ? m[1] : '');
    }
  } else {
````

**Edit 3.9 — `scripts/check-code-blocks.js`**

찾을 글:

````js
        : `이어서 돌릴 글 ${l.post} 가 js/posts.js 에 없습니다` });
    } else if (!stems.has(file)) {
````

바꿀 글:

````js
        : `이어서 돌릴 글 ${l.post} 가 js/posts.js 에 없습니다` });
    } else if (file === '') {
      errors.push({ line, msg: `이어서 돌릴 글 ${l.post} 의 contentUrl 이 posts/<파일 이름>.md 꼴이 아닙니다` });
    } else if (!stems.has(file)) {
````

- [ ] **Step 4: 시험과 지금 글을 돌린다**

Run: `node scripts/test-check-code-blocks.js | tail -1`
Expected: `22 통과, 0 실패`

Run: `node scripts/check-code-blocks.js | tail -1`
Expected: `✓ 새 형식 블록 57개, 옛 형식 블록 190개, 문제 0건`

Run: `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch3"; node scripts/check-code-blocks.js --json | shasum | diff - "$SCRATCH/json-before-3.txt" && echo 같다`
Expected: `같다`

Run: `ls -d "${TMPDIR:-/tmp}"/cb-test-* 2>/dev/null | wc -l`
Expected: `0` — 시험이 만든 임시 폴더가 남지 않는다.

- [ ] **Step 5: 커밋**

````bash
git add scripts/check-code-blocks.js scripts/test-check-code-blocks.js
git commit -F - <<'EOF'
fix(scripts): 형식 검사가 js/posts.js 모양이 틀리면 멈추고, contentUrl 이 꼴에 안 맞는 글을 알린다 — 시험 6개를 더하고 임시 폴더를 늘 지움

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

---

### Task 4: 실행 검사 다지기 — `scripts/check-python-outputs.py`

**Files:**
- Modify: `scripts/check-python-outputs.py` (형식 오류 블록, 빈 `--post`)
- Test: `scripts/test-python-outputs.py` (시험 4개를 더하고, 이어서 도는 시험 둘이 통과 수까지 본다)

**Interfaces:**
- Consumes: `node scripts/check-code-blocks.js --json` (모양 그대로)
- Produces:
  - 형식 오류가 있는 새 형식 블록(`format: 'steps'`, `ok: false`)마다 `✗ posts/<파일>.md 의 N번째 파이썬 블록 — 형식 오류가 있어 돌리지 않았습니다. node scripts/check-code-blocks.js 로 먼저 고칩니다` 를 찍고 실패로 센다.
  - `--post ''` 는 `✗ posts/.md 가 없습니다. …` 를 찍고 종료 코드 2.

- [ ] **Step 1: 시험을 먼저 고친다**

**Edit 4.1 — `scripts/test-python-outputs.py`**

찾을 글:

````python
    'step0-mean': [
````

바꿀 글:

````python
    'broken': [
        '# 하는 일: 단계 번호를 건너뛰었다.',
        '# 1단계: 하나를 찍는다',
        'print("하나")',
        '# 3단계: 셋을 찍는다',
        'print("셋")',
    ],
    'blank': [
        '# 하는 일: 두 줄 사이에 빈 줄을 찍는다.',
        'print("하나")',
        'print()',
        'print("둘")',
        '',
        '# 출력:',
        '# 뜻: 가운데가 빈 줄이다.',
        '# 하나',
        '#',
        '# 둘',
    ],
    'step0-mean': [
````

**Edit 4.2 — `scripts/test-python-outputs.py`**

찾을 글:

````python
eq('그대로 실행되지 않는 블록은 앞 코드에서 뺀다', run(root, 'cont-norun')[0], 0)
eq('다른 글의 코드에 이어서 (글 id 를 파일 이름으로)', run(root, 'cont-post')[0], 0)
````

바꿀 글:

````python
code, out = run(root, 'cont-norun')
eq('그대로 실행되지 않는 블록은 앞 코드에서 뺀다', (code, '✓ 통과 1,' in out), (0, True))
code, out = run(root, 'cont-post')
eq('다른 글의 코드에 이어서 (글 id 를 파일 이름으로)', (code, '✓ 통과 1,' in out), (0, True))
code, out = run(root, 'broken')
eq('형식 오류가 있는 블록은 돌리지 않고 실패로 알린다', (code, '형식 오류가 있어 돌리지 않았습니다' in out), (1, True))
````

**Edit 4.3 — `scripts/test-python-outputs.py`**

찾을 글:

````python
eq('--show 는 찍힌 줄을 단계마다 뜻 줄 자리와 함께 보여 준다', '# 1단계 뜻: …\n# 하나\n# 2단계 뜻: …\n# 둘' in r.stdout, True)
````

바꿀 글:

````python
eq('--show 는 찍힌 줄을 단계마다 뜻 줄 자리와 함께 보여 준다', '# 1단계 뜻: …\n# 하나\n# 2단계 뜻: …\n# 둘' in r.stdout, True)
r = subprocess.run([sys.executable, CHECK, '--root', root, '--post', 'blank', '--show'], capture_output=True, text=True)
eq('--show 는 단계 없는 블록을 번호 없는 뜻으로, 빈 줄을 # 로 보여 준다', '# 뜻: …\n# 하나\n#\n# 둘' in r.stdout, True)
r = subprocess.run([sys.executable, CHECK, '--root', root, '--post', ''], capture_output=True, text=True)
eq('--post 를 비워 주면 멈춘다', (r.returncode, 'posts/.md 가 없습니다' in r.stdout), (2, True))
private = tempfile.mkdtemp(prefix='pyout-tmpdir-')
subprocess.run([sys.executable, CHECK, '--root', root, '--post', 'ok'], capture_output=True, text=True,
               env=dict(os.environ, TMPDIR=private))
eq('돌린 뒤 임시 폴더가 남지 않는다', os.listdir(private), [])
os.rmdir(private)
````

- [ ] **Step 2: 시험이 실패하는지 본다**

Run: `python3 scripts/test-python-outputs.py | grep -E '✗|[0-9]+ 통과,'`
Expected: 마지막 줄 `19 통과, 2 실패`. 실패는 `형식 오류가 있는 블록은 돌리지 않고 실패로 알린다`(지금은 조용히 「✓ 통과 0」) 와 `--post 를 비워 주면 멈춘다`(지금은 종료 코드 0) 다.

- [ ] **Step 3: 실행 검사를 고친다**

**Edit 4.4 — `scripts/check-python-outputs.py`**

찾을 글:

````python
    if args.post and not os.path.exists(os.path.join(args.root or ROOT, 'posts', args.post + '.md')):
````

바꿀 글:

````python
    if args.post is not None and not os.path.exists(os.path.join(args.root or ROOT, 'posts', args.post + '.md')):
````

**Edit 4.5 — `scripts/check-python-outputs.py`**

찾을 글:

````python
            and ((b['format'] == 'steps' and b['ok']) or (args.legacy and b['format'] == 'legacy'))]
````

바꿀 글:

````python
            and ((b['format'] == 'steps' and b['ok']) or (args.legacy and b['format'] == 'legacy'))]
    # 형식 오류가 있는 새 형식 블록은 돌리지 않는다. 통과로 세지 않고 실패로 알린다
    broken = [b for b in blocks
              if (args.post is None or b['post'] == args.post) and b['format'] == 'steps' and not b['ok']]
````

**Edit 4.6 — `scripts/check-python-outputs.py`**

찾을 글:

````python
    count = {'pass': 0, 'fail': 0, 'missing': 0, 'norun': 0}
````

바꿀 글:

````python
    count = {'pass': 0, 'fail': 0, 'missing': 0, 'norun': 0}
    for b in broken:
        count['fail'] += 1
        print('✗ posts/%s.md 의 %d번째 파이썬 블록 — 형식 오류가 있어 돌리지 않았습니다. '
              'node scripts/check-code-blocks.js 로 먼저 고칩니다' % (b['post'], b['index'] + 1))
````

- [ ] **Step 4: 시험과 지금 글을 돌린다**

Run: `python3 scripts/test-python-outputs.py | tail -1`
Expected: `21 통과, 0 실패`

Run: `python3 scripts/check-python-outputs.py | tail -1`
Expected: `✓ 통과 57, 건너뜀 0 (라이브러리 없음 0, 실행 안 됨 0), 실패 0` (torch 가 없으면 `통과 56, 건너뜀 1`)

Run: `python3 scripts/check-python-outputs.py --post ''; echo "exit=$?"`
Expected: `✗ posts/.md 가 없습니다. --post 에는 posts/ 의 파일 이름을 .md 없이 씁니다` 와 `exit=2`

- [ ] **Step 5: 커밋**

````bash
git add scripts/check-python-outputs.py scripts/test-python-outputs.py
git commit -F - <<'EOF'
fix(scripts): 실행 검사가 형식 오류 블록을 실패로 알리고 빈 --post 에서 멈춘다 — 빈 줄과 단계 없는 블록의 --show, 임시 폴더 시험을 더함

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

---

### Task 5: 글쓰기 규칙, 설계 문서, CI 글자 — `MARKDOWN_GUIDE.md`, 설계 문서, `.github/workflows/validate.yml`

**Files:**
- Modify: `MARKDOWN_GUIDE.md` (「파이썬 블록 쓰는 법」 절, 한 줄 고치고 두 줄 더함)
- Modify: `docs/superpowers/specs/2026-10-13-python-code-blocks-design.md` (7-2 의 `--post` 한 문장)
- Modify: `.github/workflows/validate.yml` (주석 하나, 단계 이름 하나)

**Interfaces:**
- Consumes: Task 4 의 형식 오류 문구, 둘째 묶음의 `--show`
- Produces: 다음 묶음부터 글쓴이가 읽는 규칙. CI 의 단계 이름이 `디자인 정합 (각진, 무그림자, 팔레트, serif 없음, 장식글자 없음)` 이 된다.

- [ ] **Step 1: 다섯 곳을 고친다**

**Edit 5.1 — `MARKDOWN_GUIDE.md`**

찾을 글:

````markdown
- 찍힌 줄은 손으로 옮겨 적지 않습니다. 하는 일과 단계까지 쓰고 `python3 scripts/check-python-outputs.py --post <slug> --show` 를 돌리면,
````

바꿀 글:

````markdown
- 찍힌 줄은 손으로 옮겨 적지 않습니다. 하는 일과, 필요하면 단계까지 쓰고 `python3 scripts/check-python-outputs.py --post <slug> --show` 를 돌리면,
````

**Edit 5.2 — `MARKDOWN_GUIDE.md`**

찾을 글:

````markdown
- 들여쓰기 없는 주석이 `# 출력` 으로 시작하면 그 줄부터 출력 영역이 됩니다.
````

바꿀 글:

````markdown
- `--show` 를 처음 돌리면 아직 출력 영역이 없어 `✗ … 출력 영역이 없습니다` 가 먼저 나오고, 그 아래에 찍힌 줄이 나옵니다. 붙이고 나면 사라집니다. 형식 오류가 있는 블록은 돌리지 않고 `형식 오류가 있어 돌리지 않았습니다` 로 알리니 형식 검사부터 고칩니다.
- `--post` 에는 글 id 가 아니라 posts/ 의 파일 이름을 `.md` 없이 씁니다(`mab.md` 는 `--post mab`).
- 들여쓰기 없는 주석이 `# 출력` 으로 시작하면 그 줄부터 출력 영역이 됩니다.
````

**Edit 5.3 — `docs/superpowers/specs/2026-10-13-python-code-blocks-design.md`**

찾을 글:

````markdown
`--post <id>` 는 글 하나만 돌립니다.
````

바꿀 글:

````markdown
`--post <파일 이름>` 은 글 하나만 돌립니다(글 id 가 아니라 posts/ 의 파일 이름을 `.md` 없이 씁니다).
````

**Edit 5.4 — `.github/workflows/validate.yml`**

찾을 글:

````yaml
# 디자인 규칙(각진 모서리·무그림자·팔레트·serif 없음)이 깨져도 실패.
````

바꿀 글:

````yaml
# 디자인 규칙(각진 모서리, 무그림자, 팔레트, serif 없음)이 깨져도 실패.
````

**Edit 5.5 — `.github/workflows/validate.yml`**

찾을 글:

````yaml
      - name: 디자인 정합 (각진·무그림자·팔레트·serif 없음·장식글자 없음)
````

바꿀 글:

````yaml
      - name: 디자인 정합 (각진, 무그림자, 팔레트, serif 없음, 장식글자 없음)
````

- [ ] **Step 2: 검사를 돌린다**

Run: `node scripts/check-wording.js | tail -1 && node scripts/test-long-sentences.js | tail -1 && grep -c '·' .github/workflows/validate.yml`
Expected: `✓ 261개 파일 말투와 낱말 검사 통과 …`, `✓ 전부 통과`, `0`

Run: `ruby -ryaml -e 'y = YAML.load_file(".github/workflows/validate.yml"); puts y["jobs"]["validate"]["runs-on"] + " " + y["jobs"]["validate"]["steps"].length.to_s'`
Expected: `ubuntu-24.04 15`

- [ ] **Step 3: 커밋**

````bash
git add MARKDOWN_GUIDE.md docs/superpowers/specs/2026-10-13-python-code-blocks-design.md .github/workflows/validate.yml
git commit -F - <<'EOF'
docs: 글쓰기 규칙에 --show 첫 실행과 --post 의 파일 이름을 적고, 설계 문서의 --post 설명과 CI 의 가운뎃점을 고침

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

---

### Task 6: bentoml-model-serving 블록 6개 옮기기와 화면 확인

**Files:**
- Modify: `posts/bentoml-model-serving.md` (파이썬 블록 6개를 새 블록으로)
- Modify: `scripts/code-blocks-baseline.json`
- 임시: `$SCRATCH/migrate_batch3.py` (저장소에 넣지 않는다. Task 7 도 쓴다)

**Interfaces:**
- Consumes: Task 1~5 의 검사, 이 계획 부록 1 의 새 블록 6개
- Produces: 새 형식 블록 6개(합 63개). 찍는 것이 없는 블록 둘(첫째, 다섯째)과 발췌 블록 하나(둘째)가 있는 첫 글이다. Task 7 이 같은 도우미를 쓴다.

- [ ] **Step 1: 옮기는 도우미를 저장소 밖에 둔다**

`$SCRATCH/migrate_batch3.py` 는 아래 내용이다. 새 블록 글은 이 계획 문서의 부록에서 읽는다.

<!-- file $SCRATCH/migrate_batch3.py -->
````python
#!/usr/bin/env python3
"""셋째 묶음(모델 운영 글 9편)의 파이썬 블록을 새 형식(하는 일, 단계, 뜻)으로 옮기는 일회용 도우미. 저장소에 넣지 않는다.

새 블록 글은 계획 문서에 있다. 블록마다 표시 줄
  <!-- cb3 post=<글 파일 이름> block=<0부터 센 파이썬 블록 번호> sha=<원본 블록 sha256 앞 16자> -->
바로 아래 네 백틱 python 울타리 안이 새 블록 전체다.

바꾸기 전에 셋을 본다. 하나라도 어긋나면 아무것도 바꾸지 않고 멈춘다.
  1. 원본 블록이 계획을 쓸 때와 같다 (sha)
  2. 새 블록의 코드 줄(빈 줄과 # 로 시작하는 줄을 뺀 줄)이 원본과 글자까지 같다
  3. 새 블록의 찍힌 줄(뜻 줄을 뺀 출력 영역)이 원본 블록의 옛 출력과 글자까지 같다. 찍는 것이 없는 블록은 둘 다 비어 있다
그다음 파이썬 블록 안의 글만 새 블록으로 바꾼다. 블록 밖의 글은 건드리지 않는다.

  python3 migrate_batch3.py <계획 문서> <posts 폴더> <글 파일 이름>
"""
import hashlib
import re
import sys

PLAN, POSTS, POST = sys.argv[1], sys.argv[2], sys.argv[3]
TICKS = '`' * 4  # 계획 문서의 네 백틱 울타리
MARK = re.compile(r'^<!-- cb3 post=(\S+) block=(\d+) sha=([0-9a-f]{16}) -->\n' + TICKS + r'python\n(.*?)^' + TICKS + r'[ \t]*$',
                  re.S | re.M)
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
want = {int(m.group(2)): (m.group(3), m.group(4)) for m in MARK.finditer(plan) if m.group(1) == POST}
if not want:
    sys.exit(f'{POST}: 계획 문서에 이 글의 블록이 없습니다')

path = f'{POSTS}/{POST}.md'
text = open(path, encoding='utf-8').read()
py = [f for f in FENCE.finditer(text) if f.group(1).strip() == 'python']
problems, edits = [], []
if len(py) != len(want):
    problems.append(f'글의 파이썬 블록은 {len(py)}개인데 계획에는 {len(want)}개입니다')
for n, (sha, new) in sorted(want.items()):
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
    if printed(new, True) != printed(f.group(2), False):
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

Run (저장소 루트에서, 계획 문서가 커밋돼 있어야 한다):

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch3"; mkdir -p "$SCRATCH"
python3 - migrate_batch3.py nocache_server.py <<'EOF'
import os, re, sys
T = '`' * 4
plan = open('docs/superpowers/plans/2026-10-14-python-code-blocks-batch3.md', encoding='utf-8').read()
for name in sys.argv[1:]:
    m = re.search(r'^<!-- file \$SCRATCH/' + re.escape(name) + r' -->\n' + T + r'[a-z]*\n(.*?)^' + T + r'\n', plan, re.S | re.M)
    dest = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'code-steps-batch3', name)
    if not os.path.exists(dest):
        open(dest, 'w', encoding='utf-8').write(m.group(1))
    print(dest)
EOF
````

Expected: 파일 경로 두 줄. 이미 있는 파일은 그대로 둔다(서버 파일은 Task 2 가 뽑아 두었다).

- [ ] **Step 2: 옮긴다**

Run: `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch3"; python3 "$SCRATCH/migrate_batch3.py" docs/superpowers/plans/2026-10-14-python-code-blocks-batch3.md posts bentoml-model-serving`
Expected: `bentoml-model-serving: 블록 6개를 옮겼습니다`. `바꾸지 않고 멈춥니다` 로 끝나면 이 태스크를 멈추고 까닭 줄을 그대로 알린다.

- [ ] **Step 3: 코드 줄과 블록 밖 글이 그대로인지, 첫 블록이 21줄인지 본다**

Run:

````bash
python3 - bentoml-model-serving <<'EOF'
import re, subprocess, sys
PY = re.compile(r'^```python[^\n]*\n(.*?)^```[ \t]*$', re.S | re.M)
code = lambda b: [l for l in b.split('\n') if l.strip() and not l.lstrip().startswith('#')]
fail = False
for post in sys.argv[1:]:
    old = subprocess.run(['git', 'show', f'HEAD:posts/{post}.md'], capture_output=True, text=True, check=True).stdout
    new = open(f'posts/{post}.md', encoding='utf-8').read()
    ob, nb = [m.group(1) for m in PY.finditer(old)], [m.group(1) for m in PY.finditer(new)]
    assert len(ob) == len(nb), (post, len(ob), len(nb))
    bad = [i for i, (a, b) in enumerate(zip(ob, nb)) if code(a) != code(b)]
    same = PY.sub('@', old) == PY.sub('@', new)
    print(f'{post}: 코드 줄이 바뀐 블록 {bad}, 블록 밖 글 {"같다" if same else "다르다"}')
    if post == 'bentoml-model-serving':
        print(f'  첫 블록 {len(nb[0].rstrip(chr(10)).split(chr(10)))}줄')
    fail = fail or bool(bad or not same)
sys.exit(1 if fail else 0)
EOF
````

Expected: `bentoml-model-serving: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다` 와 `  첫 블록 21줄` — 본문이 「주석까지 21줄입니다」라고 쓴다.

- [ ] **Step 4: 검사를 돌린다**

Run: `node scripts/check-code-blocks.js`
Expected: 두 줄

````text
  기준표보다 줄어든 글 1편 (bentoml-model-serving.md 6→0) — node scripts/check-code-blocks.js --update 로 기준표를 줄입니다
✓ 새 형식 블록 63개, 옛 형식 블록 184개, 문제 0건
````

Run: `python3 scripts/check-python-outputs.py --post bentoml-model-serving`
Expected: `✓ 통과 5, 건너뜀 1 (라이브러리 없음 0, 실행 안 됨 1), 실패 0`. bentoml 이 없는 파이썬이면 `✓ 통과 3, 건너뜀 3 (라이브러리 없음 2, 실행 안 됨 1), 실패 0` 이다(첫째와 다섯째 블록이 「bentoml 없음」).

Run: `node scripts/check-wording.js`
Expected: 종료 코드 0

- [ ] **Step 5: 기준표를 줄인다**

Run: `node scripts/check-code-blocks.js --update`
Expected: `기준표를 다시 적었습니다 — 옛 형식 블록 184개, 글 76편`

- [ ] **Step 6: 첫 글을 화면으로 본다**

서버를 백그라운드로 띄우고(저장소 루트에서 `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch3"; python3 "$SCRATCH/nocache_server.py" "$(pwd)" 8771`, 파일은 Step 1 이 뽑았다) `http://127.0.0.1:8771/post.html?id=bentoml-model-serving` 를 새 캐시로 연다. 아래 함수를 돌린다. 숨긴 iframe 을 네 폭으로 바꿔 가며 잰다.

````js
async () => {
  const POSTS = ['bentoml-model-serving'];
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

Expected: 네 값 모두 `"6 true 3 0 false 0 0 0"` — 블록 6개, 원문과 같다, 출력 없는 블록 3개(찍는 것이 없는 첫째와 다섯째, 발췌인 둘째), 바로 뒤에 남은 다른 코드 블록 0, 넘침 없음, 메모 겹침 0, 배치 빠짐 0, 용어 풀이와 수식이 끼어든 곳 0.

그림을 `.playwright-mcp/batch3/` 에 찍는다. 1440 폭(창 1440×1000)과 390 폭(390px iframe 하나만 둔 감싸는 페이지), 라이트와 다크(`document.documentElement.setAttribute('data-theme','dark')`)다. 첫째 블록(클래스 안에 단계 둘), 둘째 블록(「발췌」 표시), 다섯째 블록(「앞 블록에 이어서」 표시), 여섯째 블록(워커 표와 뜻 둘)을 담는다. 390 폭에서 파란 메뉴 단추(`#sidebar-toggle`)가 코드를 가리면 감싸는 페이지의 iframe 안에서만 숨긴다.

볼 것: 첫째 블록의 2단계가 클래스 몸통 중간에서 시작해도 코드 들여쓰기가 그대로 보인다. 둘째, 다섯째 블록의 머리 옆에 상태 표시가 보인다. 찍는 것이 없는 블록에 빈 출력 영역이 없다. 서버를 끈다.

- [ ] **Step 7: 커밋**

````bash
git add posts/bentoml-model-serving.md scripts/code-blocks-baseline.json
git commit -F - <<'EOF'
feat(posts): 모델 운영 글 — BentoML 글의 파이썬 블록 6개를 하는 일, 단계, 뜻 형식으로

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

리뷰에서 블록 글을 고치게 되면 `posts/bentoml-model-serving.md` 를 직접 고친다(도우미는 원본 블록에만 돈다). 고친 커밋의 제목도 `fix(posts): 모델 운영 글 — …` 으로 시작한다. Task 8 이 이 머리로 글 커밋을 찾아 하나로 합친다.

---

### Task 7: 나머지 여덟 편 블록 13개 옮기기

**Files:**
- Modify: `posts/distributed-training.md` (2개), `posts/batch-vs-realtime-inference.md` (2개), `posts/stream-window-aggregation.md` (1개), `posts/model-deployment-rollback.md` (1개), `posts/inference-server.md` (2개), `posts/container-ci-pipeline.md` (2개), `posts/model-versioning-reproducibility.md` (1개), `posts/training-pipeline-dag.md` (2개)
- Modify: `scripts/code-blocks-baseline.json`

**Interfaces:**
- Consumes: `$SCRATCH/migrate_batch3.py`(Task 6 이 만든 것. Step 1 이 없으면 계획에서 다시 뽑는다), 이 계획 부록 2~9 의 새 블록 13개
- Produces: 새 형식 블록 76개, 옛 형식 블록 171개(68편)

시간을 재는 블록은 container-ci-pipeline 첫 블록 하나다(`# 출력 (시간은 돌릴 때마다 다르다):`). 상태 표시가 붙는 블록은 없다.

- [ ] **Step 1: 도우미가 있는지 본다**

Run (저장소 루트에서):

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch3"; mkdir -p "$SCRATCH"
python3 - migrate_batch3.py <<'EOF'
import os, re, sys
T = '`' * 4
plan = open('docs/superpowers/plans/2026-10-14-python-code-blocks-batch3.md', encoding='utf-8').read()
for name in sys.argv[1:]:
    m = re.search(r'^<!-- file \$SCRATCH/' + re.escape(name) + r' -->\n' + T + r'[a-z]*\n(.*?)^' + T + r'\n', plan, re.S | re.M)
    dest = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'code-steps-batch3', name)
    if not os.path.exists(dest):
        open(dest, 'w', encoding='utf-8').write(m.group(1))
    print(dest)
EOF
````

Expected: 파일 경로 한 줄. Task 6 이 뽑아 둔 파일이 있으면 그대로 두고, 없으면 계획에서 다시 뽑는다.

- [ ] **Step 2: 여덟 편을 차례로 옮긴다**

Run:

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch3"
for p in distributed-training batch-vs-realtime-inference stream-window-aggregation model-deployment-rollback \
         inference-server container-ci-pipeline model-versioning-reproducibility training-pipeline-dag; do
  python3 "$SCRATCH/migrate_batch3.py" docs/superpowers/plans/2026-10-14-python-code-blocks-batch3.md posts "$p" || break
done
````

Expected: 여덟 줄

````text
distributed-training: 블록 2개를 옮겼습니다
batch-vs-realtime-inference: 블록 2개를 옮겼습니다
stream-window-aggregation: 블록 1개를 옮겼습니다
model-deployment-rollback: 블록 1개를 옮겼습니다
inference-server: 블록 2개를 옮겼습니다
container-ci-pipeline: 블록 2개를 옮겼습니다
model-versioning-reproducibility: 블록 1개를 옮겼습니다
training-pipeline-dag: 블록 2개를 옮겼습니다
````

`바꾸지 않고 멈춥니다` 가 나오면 거기서 멈추고, 까닭 줄과 그때까지 옮긴 글을 그대로 알린다. 그 글을 손으로 고치지 않는다.

- [ ] **Step 3: 코드 줄과 블록 밖 글이 그대로인지 본다**

Run:

````bash
python3 - distributed-training batch-vs-realtime-inference stream-window-aggregation model-deployment-rollback \
    inference-server container-ci-pipeline model-versioning-reproducibility training-pipeline-dag <<'EOF'
import re, subprocess, sys
PY = re.compile(r'^```python[^\n]*\n(.*?)^```[ \t]*$', re.S | re.M)
code = lambda b: [l for l in b.split('\n') if l.strip() and not l.lstrip().startswith('#')]
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
sys.exit(1 if fail else 0)
EOF
````

Expected: 여덟 편 모두 `코드 줄이 바뀐 블록 [], 블록 밖 글 같다` (여덟 줄)

- [ ] **Step 4: 실행 검사를 돌린다**

Run:

````bash
for p in distributed-training batch-vs-realtime-inference stream-window-aggregation model-deployment-rollback \
         inference-server container-ci-pipeline model-versioning-reproducibility training-pipeline-dag; do
  python3 scripts/check-python-outputs.py --post "$p"; echo "  exit=$?"
done
````

Expected: 차례로 `✓ 통과 2`, `✓ 통과 2`, `✓ 통과 1`, `✓ 통과 1`, `✓ 통과 2`, `✓ 통과 2`, `✓ 통과 1`, `✓ 통과 2` 로 시작하는 여덟 줄(건너뜀 0, 실패 0)과 `exit=0` 여덟 줄

- [ ] **Step 5: 형식 검사, 말투 검사, 기준표**

Run: `node scripts/check-code-blocks.js | tail -1`
Expected: `✓ 새 형식 블록 76개, 옛 형식 블록 171개, 문제 0건`

Run: `node scripts/check-wording.js`
Expected: 종료 코드 0

Run: `node scripts/check-code-blocks.js --update`
Expected: `기준표를 다시 적었습니다 — 옛 형식 블록 171개, 글 68편`

- [ ] **Step 6: 커밋**

````bash
git add posts/distributed-training.md posts/batch-vs-realtime-inference.md posts/stream-window-aggregation.md \
        posts/model-deployment-rollback.md posts/inference-server.md posts/container-ci-pipeline.md \
        posts/model-versioning-reproducibility.md posts/training-pipeline-dag.md scripts/code-blocks-baseline.json
git commit -F - <<'EOF'
feat(posts): 모델 운영 글 — 분산 학습, 배치 추론, 스트림 집계, 배포, 추론 서버, CI, 버전, DAG 글의 파이썬 블록 13개를 하는 일, 단계, 뜻 형식으로

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

---

### Task 8: 셋째 묶음 확인과 올리기

**Files:** 없음 (확인, 커밋 합치기, push)

**Interfaces:**
- Consumes: Task 1~7 의 커밋
- Produces: 사용자 확인, 그 뒤 main 에 올린 셋째 묶음. 올리는 커밋은 계획 문서 1개, 검사와 화면 고침, 글쓰기 규칙 5개(리뷰 고침이 있으면 더), 글 옮기기 1개다.

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

Expected: 마지막 줄 `ALL-OK`. 그 위 줄들 가운데 `✓ 새 형식 블록 76개, 옛 형식 블록 171개, 문제 0건`, `94 통과, 0 실패`, `22 통과, 0 실패`, `21 통과, 0 실패`, `✓ 통과 75, 건너뜀 1 (라이브러리 없음 0, 실행 안 됨 1), 실패 0` 이 있다.

CI 와 같은 표준 라이브러리 파이썬으로도 돌린다:

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch3"; python3 -m venv --without-pip "$SCRATCH/venv"
"$SCRATCH/venv/bin/python" scripts/test-python-outputs.py | tail -1
"$SCRATCH/venv/bin/python" scripts/check-python-outputs.py | tail -1
````

Expected: `21 통과, 0 실패` 와 `✓ 통과 72, 건너뜀 4 (라이브러리 없음 3, 실행 안 됨 1), 실패 0` (bentoml 블록 2개와 two-tower 의 torch 블록 1개가 「없음」으로 건너뛴다)

- [ ] **Step 2: 숫자로 재고 그림을 찍는다**

서버 파일이 있는지 보고, 없으면 계획에서 뽑는다(저장소 루트에서).

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch3"; mkdir -p "$SCRATCH"
python3 - nocache_server.py <<'EOF'
import os, re, sys
T = '`' * 4
plan = open('docs/superpowers/plans/2026-10-14-python-code-blocks-batch3.md', encoding='utf-8').read()
for name in sys.argv[1:]:
    m = re.search(r'^<!-- file \$SCRATCH/' + re.escape(name) + r' -->\n' + T + r'[a-z]*\n(.*?)^' + T + r'\n', plan, re.S | re.M)
    dest = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'code-steps-batch3', name)
    if not os.path.exists(dest):
        open(dest, 'w', encoding='utf-8').write(m.group(1))
    print(dest)
EOF
````

서버를 백그라운드로 띄운다: `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch3"; python3 "$SCRATCH/nocache_server.py" "$(pwd)" 8771`. 아무 글이나 새 캐시로 연 뒤 아래 함수를 돌린다.

````js
async () => {
  const POSTS = [
    'bentoml-model-serving',
    'distributed-training',
    'batch-vs-realtime-inference',
    'stream-window-aggregation',
    'model-deployment-rollback',
    'inference-server',
    'container-ci-pipeline',
    'model-versioning-reproducibility',
    'training-pipeline-dag',
  ];
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

Expected: 네 폭 모두 bentoml-model-serving 은 `"6 true 3 0 false 0 0 0"`, distributed-training, batch-vs-realtime-inference, inference-server, container-ci-pipeline, training-pipeline-dag 는 `"2 true 0 0 false 0 0 0"`, stream-window-aggregation, model-deployment-rollback, model-versioning-reproducibility 는 `"1 true 0 0 false 0 0 0"` (값 36개).

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

Expected: `{"posts":108,"numbers":1342,"overflow":[],"broken":[]}` (`numbers` 는 블록을 옮겨 Task 2 보다 늘었다)

그림을 `.playwright-mcp/batch3/` 에 찍는다. 아홉 편을 1440 과 390 폭 라이트로 한 장씩(18장), bentoml-model-serving 과 container-ci-pipeline 은 다크로도 한 장씩(4장)이다. 블록이 길면 머리와 출력 영역으로 나눠 찍고 이름에 `-top`, `-out` 을 붙인다. 담을 블록은 아래와 같다.

| 글 | 블록 |
|---|---|
| bentoml-model-serving | 셋째 (동적 배칭, 표와 뜻) |
| distributed-training | 첫째 (동기와 비동기, 뜻 둘) |
| batch-vs-realtime-inference | 둘째 (CPU 와 GPU, 넓은 표) |
| stream-window-aggregation | 첫째 (워터마크 표) |
| model-deployment-rollback | 첫째 (배포 단계 표) |
| inference-server | 첫째 (오버헤드와 한 텐서) |
| container-ci-pipeline | 첫째 (unittest, 「시간은 돌릴 때마다 다르다」) |
| model-versioning-reproducibility | 첫째 (뜻 셋) |
| training-pipeline-dag | 첫째 (시각표, 뜻 셋) |

서버를 끈다.

- [ ] **Step 3: 확인 페이지를 만든다** (컨트롤러)

둘째 묶음처럼 비공개 artifact 한 장에 담는다. 바뀌는 것(글 아홉 편, 블록 19개, 검사와 화면 고침), 그림, 검사 결과(로컬과 표준 라이브러리 파이썬 둘 다), 올리면 하는 일(커밋 수, 합치는 글 커밋, rebase, `ubuntu-24.04` 에서 도는 글 검사), 「이 계획에서 정한 것」 가운데 독자가 보는 것(발췌와 앞 블록 표시, 21줄 블록, 숫자 줄바꿈, Copy 단추), 「여쭤볼 것」 절(이 계획의 「여쭤볼 것 후보」 세 줄)을 쓴다.

- [ ] **Step 4: 사용자 확인을 받는다** (컨트롤러)

그림과 함께 바뀐 것을 짧게 알린다. 「여쭤볼 것」 세 곳은 고칠지 함께 묻는다. 고치기로 하면 글 커밋(`fix(posts): 모델 운영 글 — …`)으로 고치고 Step 1 부터 다시 한다. 사용자가 올려도 된다고 하기 전에는 push 하지 않는다.

- [ ] **Step 5: 글 커밋을 하나로 합친다** (사용자 확인 뒤)

Run:

````bash
FIRST=$(git log --reverse --format=%H --fixed-strings --grep='(posts): 모델 운영 글 —' origin/main..HEAD | head -1)
BASE=$(git rev-parse "$FIRST^")
git log --format='%h %s' "$BASE..HEAD"
git diff --stat "$BASE" HEAD
````

Expected: `git log` 의 줄이 모두 `feat(posts): 모델 운영 글 —` 이나 `fix(posts): 모델 운영 글 —` 로 시작한다. `git diff --stat` 의 파일이 Task 6, 7 의 글 아홉 편과 `scripts/code-blocks-baseline.json` 뿐이다. 다른 커밋이 끼어 있으면 합치지 않고 그대로 올린다고 사용자에게 알린다.

Run:

````bash
TREE=$(git rev-parse 'HEAD^{tree}')
git reset --soft "$BASE"
git commit -F - <<'EOF'
feat(posts): 모델 운영 글 9편의 파이썬 블록 19개를 하는 일, 단계, 뜻 형식으로

BentoML 6개, 분산 학습 2개, 배치 추론 2개, 스트림 집계 1개, 배포 1개, 추론 서버 2개, CI 2개, 버전 1개, DAG 2개.
실행되는 코드 줄과 블록 밖 본문은 그대로다. 들여쓴 메서드 조각은 발췌로, workers=4 블록은 앞 블록에 이어서로 표시한다.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
test "$(git rev-parse 'HEAD^{tree}')" = "$TREE" && echo '트리 같음'
````

Expected: `트리 같음`. 사용자가 「여쭤볼 것」을 고치기로 해 본문을 바꿨으면 둘째 줄에 그 사실을 한 줄 더 적는다.

- [ ] **Step 6: 올린다** (컨트롤러)

Run: `git fetch origin && git rebase origin/main && git status -sb | head -1 && git log --format='%h %ae %s' origin/main..HEAD`
Expected: 내 커밋만 있고 작성자가 모두 `37789148+chkimsu@users.noreply.github.com` 이다. 다른 세션의 커밋이 있으면 멈추고 알린다. rebase 로 들어온 커밋이 있으면 Step 1 의 검사를 다시 돌린다.

자동 권한 검사가 `git push` 를 막으므로, 사용자에게 프롬프트에 `! git push origin main` 을 입력해 달라고 부탁한다.

- [ ] **Step 7: 글 검사를 본다** (컨트롤러)

Run: `gh run list --workflow validate.yml --limit 1 --json databaseId,headSha,status` 로 push 한 커밋의 run id 를 찾고 `gh run watch <id> --exit-status`
Expected: 종료 코드 0. `actions/setup-python@v5` 의 3.9 설치 단계와 `코드 블록 형식 검사 시험` 단계를 포함해 모든 단계에 ✓ 가 붙는다. run 의 로그는 읽지 않는다(관리자 권한이 필요하고 로컬 gh 는 github.com 에 로그인돼 있지 않다). `gh api repos/chkimsu/adtech-blog/actions/runs/<id>/jobs --jq '.jobs[].labels'` 가 `["ubuntu-24.04"]` 다.

같은 커밋의 `Update sitemap.xml + feed.xml` 과 `pages-build-deployment` 도 `gh run watch <id> --exit-status` 로 끝까지 본다. 봇의 사이트맵 커밋이 새 배포를 띄우면 앞 배포는 취소될 수 있다. 그때는 새 배포의 결과를 본다.

- [ ] **Step 8: 공개 블로그에서 본다** (컨트롤러)

페이지 배포가 끝나면 새 캐시로 `https://chkimsu.github.io/adtech-blog/post.html?id=bentoml-model-serving` 을 열고, 아홉 편을 숨긴 iframe 으로 차례로 열어 `.post-content .cb` 수(6, 2, 2, 1, 1, 2, 2, 1, 2)와 콘솔 오류 0 을 확인한다. 접힌 절 안의 블록 글은 `innerText` 에 안 잡히니 `textContent` 로 본다.
