# 파이썬 코드 블록 개편 — 마지막 묶음 실행 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 아직 옛 형식인 글 17편의 파이썬 블록 49개(딥 CTR 6편 23개, 타겟팅과 카카오 5편 8개, 판단 3편 6개, 인터뷰 3편 12개)를 하는 일, 단계, 뜻 형식으로 옮겨 옛 형식 블록을 0개로 만든다. 인터뷰 3편의 별도 출력 블록 12개는 블록 안 출력 영역으로 들어간다. 검사와 화면 코드는 바꾸지 않는다.

**Architecture:** 글만 옮기는 묶음이다. 여섯째 묶음의 도우미에 별도 출력 블록 옮기기(둘째 묶음의 방식)를 더한 저장소 밖 도우미 `migrate_batch7.py` 가 이 계획 부록의 새 블록 전문을 읽어 바꾼다. 도우미는 원본 블록의 해시, 코드 줄, 옛 출력(블록 안이거나 바로 아래 별도 블록)의 찍힌 줄을 먼저 견주고, 하나라도 다르면 아무것도 바꾸지 않는다. 옛 출력이 찍히는 값과 다른 블록 둘은 `old=run` 이다(설계 문서 8-1). 마지막 태스크가 기준표를 `{}` 로 비워, 옛 형식 블록이 하나라도 생기면 형식 검사가 실패한다(설계 문서 8-2 「마지막」).

**Tech Stack:** Python 3.9 표준 라이브러리(로컬 `python3` 는 3.9.7 이고 numpy 1.26.4, scipy 1.11.4, scikit-learn, faiss, xgboost 도 있다. 표준 라이브러리만 있는 파이썬에서 라이브러리 때문에 건너뛰는 블록은 negative-sampling-bias 첫째와 다섯째, lookalike-modeling 둘이다), node 20, GitHub Actions(`runs-on: ubuntu-24.04` 고정, 파이썬 3.9), 브라우저 도구(Chrome DevTools MCP. Playwright MCP 는 연결되지 않는다).

**Spec:** `docs/superpowers/specs/2026-10-13-python-code-blocks-design.md` (5-1 표시, 5-2 상태 표시, 5-4 쓰는 규칙, 7-2 실행 검사, 8-1 블록 상태, 8-2 묶음, 8-3 옮길 때 지킬 것). 꼴과 관례는 여섯째 묶음 계획 `docs/superpowers/plans/2026-10-16-python-code-blocks-batch6.md` 를 따른다.

> 새 블록 49개의 전문은 태스크 앞의 「부록: 새 블록 49개」 절에 있다. 태스크는 그 뒤에 Task 1 부터 Task 7 까지 이어진다.

> 이 계획의 새 블록 49개, 도우미, 기대 출력은 계획을 쓸 때 저장소 사본에 그대로 적용해 돌려 본 것이다. 사본은 main `aa5353c`(여섯째 묶음 계획이 커밋된 때)에 여섯째 묶음 계획의 새 블록 36개와 Task 5 Step 7 의 고침 넷을 그 계획의 도우미와 고침 명령으로 넣어, 여섯째 묶음이 올라간 뒤의 상태(새 형식 198개, 옛 형식 49개, 17편)로 만든 것이다. CI 검사 12가지, 17편의 형식 검사와 실행 검사, 표준 라이브러리만 있는 파이썬 3.9 의 실행 검사, 파이썬 3.12 와 3.14 의 실행 검사, 1440, 1280, 1024, 390 폭의 배치 숫자, 390 폭의 숫자 줄바꿈 훑기를 돌렸다. 같은 사본에서 이 계획에서 뽑은 도우미로 17편을 옮기고 Task 6 Step 7 의 고침을 돌려, 아래 Expected 를 그대로 받았다.

## Global Constraints

- 공개 저장소다. 사내 시스템, 플랫폼 이름을 블록 안 글, 커밋 메시지 어디에도 쓰지 않는다.
- 이 묶음은 글만 옮긴다. 바꾸는 파일은 `posts/` 의 17편과 `scripts/code-blocks-baseline.json` 뿐이다. 검사, 시험, `js/`, `css/`, `.github/`, `MARKDOWN_GUIDE.md` 는 바꾸지 않는다.
- 블록 안 글(하는 일, 단계 제목, 풀이, 메모, 뜻)은 평서체 `~한다, ~이다` 로 쓴다. 숫자 뒤에 조사나 「이다」가 오면 한 칸 띄운다(`0.0300% 다`, `15% 를`). 개수를 세는 말은 붙인다(`5,000번`, `8개`). 원래 주석이 합쇼체인 블록(audience-segmentation 첫째의 「돌아갑니다」, 「목적입니다」)은 풀이로 옮길 때 평서체로 바꾼다. 줄 끝 주석과 docstring 은 코드 줄의 일부라 그대로 둔다.
- 해요체, `저희`, 가운뎃점, `실측`, `실체`, `축`, `가른다`, `갈린다`, 열하나 이상의 말로 쓴 숫자, 지어낸 말을 쓰지 않는다. 블록 안에 새 비유를 넣지 않는다. `node scripts/check-wording.js` 가 posts/ 의 코드 블록 안까지 센다.
- 실행되는 코드 줄은 바꾸지 않는다(spec 8-3). 줄 끝 주석도 그대로 둔다. 원래 주석의 내용은 하는 일, 풀이, 메모, 뜻으로 나눠 옮기고 버리지 않는다.
- 상태 표시는 spec 5-2 의 꼴 그대로다 — `# (<무엇> — 그대로 실행되지 않습니다.)`, `# (앞 블록에 이어서 돌린다.)`, `# (<글 id> 글의 코드에 이어서 돌린다.)`.
- 블록 밖의 본문은 바꾸지 않는다(사용자 결정 「본문은 그대로 둔다」). 본문에서 찾은 사실 오류는 아래 「여쭤볼 것 후보」에 적는다. 사용자가 이 계획을 확인하며 고치기로 한 곳만 Task 6 Step 7 이 글 커밋 하나로 고치고, 나머지는 Task 7 확인 페이지의 「여쭤볼 것」에서 다시 묻는다.
- 표시 꼴은 spec 그대로다 — `# 하는 일: …`, `# N단계: …`, `# 출력:` 또는 `# 출력 (<괄호 안 글>):`, `# N단계 뜻: …` 또는 `# 뜻: …`. 이 묶음에서 괄호 안 글이 있는 출력 머리는 deep-ctr-models 셋째 블록의 `# 출력 (파이썬 3.9):` 하나다.
- 실행 검사는 파이썬 3.9 로 돌린다(`python3 --version` 이 `Python 3.9.7`).
- 이 계획 문서는 Task 1 전에 `docs/superpowers/plans/2026-10-16-python-code-blocks-batch7.md` 로 커밋돼 있어야 한다. 임시 폴더 도구를 뽑는 명령과 글 옮기기 도우미가 이 파일을 읽는다.
- 이 계획의 코드 블록(네 백틱 울타리)은 손으로 옮겨 적지 않는다. 도우미가 부록을 그대로 읽는다. 리뷰에서 블록 글을 고칠 때만 Edit 로 고치고, 찾을 글은 파일에 꼭 한 번 있어야 한다.
- 커밋은 git 사용자 `chkimsu` 로 한다. 파일을 이름으로 stage 한다(`git add -A` 금지). 글 커밋 제목은 `feat(posts): 마지막 묶음 글 — …` 이나 `fix(posts): 마지막 묶음 글 — …` 로 시작한다. 마지막 줄은 그 커밋을 만든 모델의 Co-Authored-By 줄이다(예: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`).
- push 는 Task 7 에서 사용자 확인을 받은 뒤에만 한다. push 전에 `git fetch origin && git rebase origin/main` 을 한다(CI 가 sitemap 과 feed 를 다시 커밋한다).
- 임시 파일은 저장소 밖에 둔다. 아래 명령의 `$SCRATCH` 는 `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch7"; mkdir -p "$SCRATCH"` 로 정한다. 셸 변수는 명령마다 다시 정한다. 화면 그림은 저장소 안의 `.playwright-mcp/batch7/` 에 둔다(`.gitignore` 에 있다). 서버는 8776 포트로 띄우고, 브라우저 도구의 새 페이지는 `isolatedContext` 이름을 `b7` 로 시작한다.
- 파이썬 3.9.7 은 한글이 든 한 줄이 1,000바이트를 넘는 스크립트를 「SyntaxError: Non-UTF-8 code」로 못 읽는다. 고침 스크립트를 새로 쓰면 줄을 1,000바이트 아래로 나눈다.
- `gh` 는 github.com 에 로그인돼 있지 않아 API 를 시간당 60번만 쓸 수 있다. `gh run watch` 는 `--interval 60` 이상으로 돌리거나, 몇 분 기다린 뒤 `gh run list` 한 번으로 본다.

## Review Focus

1. **이어서 돌리는 사슬과 실행 시간** — feedback-loop-remedies 둘째 블록은 실행 검사가 그 글의 첫째 블록과 feedback-loop-bias 세 블록을 먼저 돌린 뒤 돌린다. 로컬에서 블록 하나에 37초쯤 걸린다(첫째 블록 12초, feedback-loop-bias 셋째 12초). 다섯째 묶음에서 CI 의 실행 검사 단계는 로컬보다 2배 남짓 느렸다(로컬 48초, CI 111초). 블록 한도 120초에 가까울 수 있다. Task 5 Step 4 가 로컬 시간을 재고, Task 7 Step 7 이 CI 의 단계 시간을 적는다. CI 에서 시간 초과가 나면 코드를 바꾸지 말고 멈춰 알린다.
2. **블록 안으로 들어오는 별도 출력 블록 12개** — 인터뷰 3편은 파이썬 블록마다 바로 아래에 별도 출력 블록이 있다. 새 블록의 출력 영역으로 옮기고 별도 블록은 지운다(spec 8-3). 그 자리에 빈 코드 상자나 같은 출력이 두 번 남으면 안 된다. Task 6 Step 3 이 「파이썬 블록 바로 뒤 별도 출력 블록 0개」와 「블록 밖 글 같다」를 보고, Task 7 Step 2 의 넷째 값(바로 뒤 다른 코드 블록)이 0 이다.
3. **새로 붙는 상태 표시 일곱** — audience-segmentation 첫째 `# (실무 파이프라인 — 그대로 실행되지 않습니다.)`(없는 파일을 읽는다), 둘째 `# (의사코드 — 그대로 실행되지 않습니다.)`, negative-sampling-bias 다섯째 `# (앞 블록에 이어서 돌린다.)`(첫 블록이 부른 numpy 를 쓴다), feedback-loop-bias 둘째와 셋째, feedback-loop-remedies 둘째 `# (앞 블록에 이어서 돌린다.)`, feedback-loop-remedies 첫째 `# (feedback-loop-bias 글의 코드에 이어서 돌린다.)`. 꼴이 틀리면 형식 검사가 잡고, 표시가 빠지면 실행 검사가 NameError 로 실패한다. Task 3 Step 4, Task 4 Step 4, Task 5 Step 4 가 글마다 건너뜀과 통과 수를 본다.
4. **옛 출력과 다른 블록 둘(old=run)** — lookalike-modeling 둘째 블록은 적힌 `[82]` 대신 찍히는 `[83]` 을 받아 적었다(spec 8-1). 실행 검사로 돌리면 늘 `[83]` 이고, 파일로 돌리면 xgboost 가 콜백을 도는 순서 때문에 `[82]` 가 찍히기도 한다. negative-sampling-bias 일곱째 블록은 함수가 돌려주는 값을 「# 출력 예시:」로 적어 두었던 것을 메모 한 줄로 옮겨 출력 영역이 없다(spec 8-1). 도우미는 이 둘의 찍힌 줄 비교를 건너뛰므로 실행 검사가 본다. lookalike-modeling 둘은 xgboost, faiss 가 있는 로컬에서만 돈다.
5. **파이썬 버전에 따라 다른 찍힌 줄** — deep-ctr-models 셋째 블록의 「차이 4.4e-16」은 파이썬 3.9 의 값이다. 3.12 부터는 `sum` 이 부동소수점 오차를 보정해 `0.0e+00` 이 찍힌다. 출력 머리 `# 출력 (파이썬 3.9):` 와 4단계 풀이가 이것을 알린다. CI 는 3.9 로 고정돼 있어 통과한다. 이 블록 말고 17편의 블록은 3.12, 3.14 에서도 같은 값을 찍는다.

## 이 계획에서 정한 것

| 정한 것 | 왜 | 틀렸다면 |
|---|---|---|
| 남은 17편, 블록 49개를 이 묶음 하나로 끝낸다 | 사용자가 「최종까지 얼마나남았어? 엄청오래걸리네」라고 했다. 승인된 「20편 안팎, 트랙 둘까지」보다 트랙이 많아서, 둘로 나눌 수 있게 짰다. Task 1~4(딥 CTR, 타겟팅과 카카오 11편 31개)가 한 덩어리, Task 5~6(판단, 인터뷰 6편 18개)이 한 덩어리다 | Task 5, 6 을 다음 계획으로 옮긴다 |
| 실행 검사는 고치지 않는다 | 판단 트랙의 「앞 글에 이어서」는 지금 실행 검사로 돈다. feedback-loop-remedies 첫째 블록이 「feedback-loop-bias 글의 코드에 이어서」이고 둘째 블록은 「앞 블록에 이어서」다. 실행 검사(`prefix_of`)는 같은 글 앞 블록들에 붙은 「글의 코드에 이어서」 표시를 모두 모아 그 글의 블록을 먼저 돌리고, feedback-loop-bias 는 다른 글에 기대지 않는다. 여섯째 묶음 계획의 「C → B → A 사슬은 한 단계만 따라간다」는 사실과 달랐다. 사본에서 여섯 블록이 모두 통과했다 | Task 5 Step 4 가 NameError 로 멈춘다 |
| 도우미는 표시 줄 끝의 `sep` 도 읽는다 | 인터뷰 3편의 별도 출력 블록 12개를 둘째 묶음처럼 블록 안으로 옮기고 지운다(spec 8-3). `sep` 블록의 찍힌 줄은 별도 블록과 글자까지 견준다. 12개 모두 찍히는 값과 같았다 | 도우미 한 파일 |
| audience-segmentation 첫째 블록 맨 위에 `# (실무 파이프라인 — 그대로 실행되지 않습니다.)` 를 붙인다 | 이 블록은 없는 파일 `user_embeddings.npy` 를 읽는다(spec 8-1 「없는 파일 1」). 원래 괄호 줄 「(실무 파이프라인 형태 — 자기 임베딩 파일이 있어야 그대로 돌아갑니다. …)」는 import 줄 아래에 있어 상태 표시로 읽히지 않는다. 나머지 말은 1단계 풀이로, 평서체로 옮긴다 | 표시 줄 하나 |
| negative-sampling-bias 일곱째 블록의 「# 출력 예시:」 세 줄은 메모 한 줄로 옮긴다(old=run) | 함수가 돌려주는 값을 출력처럼 적은 것이라 찍히지 않는다(spec 8-1 「print 를 더하거나, 출력 대신 메모로」). `print` 를 더하면 코드 줄이 바뀌고, 가상 값(n 2,340,000 등)을 찍으려면 데이터를 지어내야 한다. 「# 출력 예시:」는 형식 검사가 출력 표시로 잘못 읽는 꼴이기도 하다 | 메모 한 줄 |
| lookalike-modeling 둘째 블록은 찍히는 `[83]` 을 받아 적는다(old=run) | spec 8-1 「다시 돌려 고치고 본문 숫자를 맞춘다」. 본문에는 82 를 말하는 문장이 없어 본문은 그대로다. 실행 검사로 돌리면 늘 [83] 이고 파일로 돌리면 [82] 가 찍히기도 해서, 블록 풀이에 그 말을 한 문장 더했다. CI 에는 xgboost 가 없어 건너뛴다 | 찍힌 줄 하나 |
| negative-sampling-bias 다섯째 블록에만 「앞 블록에 이어서」를 붙인다 | 예시 줄 `propensities = np.array(...)` 가 첫 블록이 부른 `np` 를 쓴다(spec 8-1 「negative-sampling-bias 1」). 넷째, 여섯째, 일곱째 블록도 함수 안에서 `np` 를 쓰지만 정의만 하므로 혼자 돈다 | 표시 줄 하나 |
| deep-ctr-models 셋째 블록의 출력 머리를 `# 출력 (파이썬 3.9):` 로 쓰고, 4단계 풀이에 3.12 의 `sum` 을 적는다 | 파이썬 3.12 부터 찍히는 차이가 `0.0e+00` 으로 달라진다(Review Focus 5). 독자가 돌려 본 값이 다를 때 까닭을 블록 안에서 알 수 있다. 뜻 줄은 찍힌 값만 말하므로 3.12 의 값은 풀이에 둔다 | 출력 머리와 풀이 한 줄 |
| 출력 영역이 없는 블록은 7개다 | negative-sampling-bias 첫째, 넷째, 다섯째, 여섯째(함수와 예시 값만 둔다), 일곱째(위 메모), audience-segmentation 둘(그대로 실행되지 않는다). 찍는 것이 있는데 출력 영역이 없으면 실행 검사가 실패한다 | 블록 일곱 |
| 마지막 코드 줄 뒤의 주석은 단계 풀이로 옮긴다 | negative-sampling-bias 첫째의 「다운샘플링 후: …」 두 줄, 둘째의 「15%를 그대로 쓰면 …」, 다섯째의 「자주 노출(0.8) → …」 두 줄이다. 마지막 코드 줄 아래 메모로 두면 두 줄이 한 메모로 이어 붙거나, 출력 영역 바로 위에 떠 있게 된다. 다섯째의 「(높임, but clipped)」는 propensity 를 0.01 아래로 자른다는 말로 풀었다(0.02 는 자르는 범위 안이다) | 풀이 세 줄 |
| `# ── N. … ──`, `# N. …`, `# (a) …`, `# 예시` 꼴의 머리 주석은 단계 제목으로 바꾸고 담긴 말은 풀이에 남긴다. 머리 주석이 없던 블록은 읽는 사람이 나눠 읽을 자리마다 단계를 새로 둔다 | spec 8-3, spec 5-4 | 주석 몇 줄 |
| 들여 쓴 `# ── 규칙 N: … ──` 주석(audience-segmentation 둘째)은 꾸밈 선만 지우고 메모로 남긴다 | 들여쓰기가 있어 단계 줄이 될 수 없다(spec 5-1). 단계 없이 쓰는 의사코드다 | 메모 세 줄 |
| 함수나 클래스만 만드는 단계의 제목은 「…함수를 만든다」로 쓴다 | 넷째 묶음 리뷰가 찾은 것이다. behavior-sequence-attention 첫째 2단계는 함수 둘이라 「…함수 둘을 만든다」다 | 단계 제목 몇 줄 |
| 「표준 라이브러리만 쓴다」와 「가상 데이터다」는 1단계 풀이에 남긴다 | spec 8-3 내용 보존 | 풀이 한 줄 |
| 뜻 줄은 그 아래 찍힌 줄에 보이는 값만, 찍힌 꼴 그대로 쓴다(`200,000건`, `10000건`, `50000명`) | 둘째 묶음 리뷰가 찾은 블록 설명 오류가 모두 계획 부록의 글에서 왔다. 넷째 묶음은 「가장」, 「크게」 같은 비교하는 말이 찍힌 값과 어긋난 것도 찾았다 | 뜻 줄 몇 개 |
| 기준표는 `{}` 로 비우고 검사 코드는 고치지 않는다 | spec 8-2 「마지막: 기준표를 비우고, 옛 형식 블록이 하나라도 있으면 실패하게 합니다」. 기준표가 비면 지금 형식 검사가 기준표에 없는 글의 옛 형식 블록을 실패로 친다(`scripts/test-check-code-blocks.js` 의 「기준표에 없는 글의 옛 형식 블록은 실패」). 기준표 파일과 `--update`, `--legacy` 를 지우는 정리는 넣지 않는다 | 검사 코드 정리를 따로 한다 |
| 글쓰기 규칙 문서는 고치지 않는다 | `MARKDOWN_GUIDE.md` 의 상태 표시 줄은 「의사코드」, 「발췌」 두 예만 든다. 여섯째 묶음의 「Spark 예시」, 「DAG 예시」와 이 묶음의 「실무 파이프라인」도 spec 5-2 의 `<무엇>` 꼴이라 형식 검사가 받는다. 고칠지는 Task 7 확인 페이지에서 알린다 | 규칙 문서 한 줄 |
| 확인 페이지 그림은 3편, 1440 과 390 폭 라이트만 찍는다 | 사용자가 오래 걸린다고 했다. 네 폭의 배치 숫자와 390 폭 훑기가 글 전부를 숫자로 본다 | 그림 몇 장 |

## 파일 지도

| 파일 | 맡는 일 | 태스크 |
|---|---|---|
| `posts/deep-ctr-models.md` | 블록 5개 | 1 |
| `posts/behavior-sequence-attention.md`, `posts/din-architecture.md`, `posts/dcn-vs-din-slot.md` | 블록 6, 1, 1개 | 2 |
| `posts/multi-task-learning.md`, `posts/negative-sampling-bias.md` | 블록 3, 7개 | 3 |
| `posts/audience-segmentation.md`, `posts/lookalike-modeling.md`, `posts/kakao-ads-prediction-targeting.md`, `posts/kakao-ads-products.md`, `posts/kakao-ads-bidding-measurement.md` | 블록 2, 2, 1, 1, 2개 | 4 |
| `posts/doubly-robust.md`, `posts/feedback-loop-bias.md`, `posts/feedback-loop-remedies.md` | 블록 1, 3, 2개 | 5 |
| `posts/interview-experiment-metrics.md`, `posts/interview-ml-modeling.md`, `posts/interview-system-design.md` | 블록 5, 4, 3개와 바로 아래 별도 출력 블록 5, 4, 3개 | 6 |
| `posts/interview-experiment-metrics.md`, `posts/multi-task-learning.md`, `posts/negative-sampling-bias.md`, `posts/deep-ctr-models.md`, `posts/dcn-vs-din-slot.md`, `posts/kakao-ads-products.md`, `posts/interview-system-design.md` | 「여쭤볼 것 후보」 가운데 사용자가 고치기로 한 곳. interview-experiment-metrics 는 두 줄, 나머지는 한 줄씩 | 6 (Step 7) |
| `scripts/code-blocks-baseline.json` | 49개 17편 → 44개 16편 → 36개 13편 → 26개 11편 → 18개 6편 → 12개 3편 → `{}` | 1~6 |
| `$SCRATCH/migrate_batch7.py`, `$SCRATCH/nocache_server.py` | 글 옮기기 도우미와 캐시 없는 서버. 저장소에 넣지 않는다 | 1~7 |

17편 모두 글 파일 이름과 글 id 가 같다.

## 뺀 글과 넘긴 항목

없다. 이 묶음이 끝나면 옛 형식 파이썬 블록은 0개이고 기준표는 `{}` 다. 블록 247개가 모두 새 형식이다.

## 여쭤볼 것 후보

글 17편을 블록마다 읽으며 찾은 본문의 오류다. 여덟 곳 다 블록 밖 본문이다. 이 계획은 고치지 않는다. 사용자가 계획을 확인하며 고치기로 한 곳만 Task 6 Step 7 이 글 커밋 하나로 고친다. 고칠 글은 아래 「고칠 글」 칸 그대로이고, 도우미를 쓰지 않는다. 고치지 않기로 한 곳은 Task 7 확인 페이지의 「여쭤볼 것」에 다시 올린다. 사용자는 계획을 확인하며 여덟 곳 다 고치기로 했다(Task 6 Step 7 의 `FIX` 목록 그대로).

| 어디 | 지금 적힌 것 | 맞는 것 | 고칠 글 |
|---|---|---|---|
| interview-experiment-metrics, 1절 접는 절 「기간을 줄이는 방법 — 실험 전 데이터를 쓴다」의 CUPED 블록 뒤 둘째 문단 | 「실제 효과는 3%이고 평균 지출을 생각하면 140 언저리인데」 | 블록을 다시 돌리면 실험군 사용자가 3% 로 더 쓴 몫의 평균이 154.3 이고, 대조군 평균 지출 5,268.6 의 3% 는 158.1 이다. CUPED 의 139 는 여전히 그냥 비교의 30 보다 훨씬 가깝다 | 「실제 효과는 3%이고 평균 지출을 생각하면 150 남짓인데」 |
| interview-experiment-metrics, 3절 「지표를 여러 개 보면 생기는 일」 블록 바로 뒤 첫 문단 | 「시뮬레이션 값이 이론값과 소수점 첫째 자리까지 맞는다.」 | 찍힌 넷 가운데 22.6% 만 이론값과 소수점 첫째 자리까지 같다. 4.9% 와 5.0%, 40.3% 와 40.1%, 64.7% 와 64.2% 는 다르다. 가장 큰 차이가 0.5%p 다 | 「시뮬레이션 값이 이론값과 0.5%p 안쪽으로 맞는다.」 |
| multi-task-learning, 11절 「파이썬으로 확인하기 ③」 블록 뒤 셋째 문단 | 「정확히 한쪽이 오르면 한쪽이 내리는 현상 현상입니다.」 | 「현상」이 두 번 들어갔다. 예전에 낱말을 일괄로 바꾸며 남은 흔적으로 보인다 | 「정확히 한쪽이 오르면 한쪽이 내리는 현상입니다.」 |
| negative-sampling-bias, 3절의 「숫자로 확인하기」 결과 표 아래 둘째 문단 | 「진짜 값 1.99%와 소수점 둘째 자리에서 만납니다.」 | 보정 후 1.98% 와 진짜 1.99% 는 소수점 둘째 자리가 다르다. 0.01%p 차이다 | 「진짜 값 1.99%와 0.01%p 차이입니다.」 |
| kakao-ads-products, 2절 표① 아래 문단 | 「A는 입찰가만 보면 9,000원으로 두 번째로 높다.」 | 표①과 코드의 입찰가는 A 9,000원, E 2,200원, B 1,500원, D 900원, C 700원이다. A 의 9,000원이 가장 높다 | 「A는 입찰가만 보면 9,000원으로 가장 높다.」 |
| deep-ctr-models, 「헷갈리기 쉬운 점」 셋째 항목 | 「6절에서 DIN의 어텐션은 전체의 0.0133%였습니다.」 | 6절 블록이 찍는 줄은 「embedding table의 0.0133%」다(8,481개 ÷ 64,000,000개). 모델 전체 64,345,282개로 나누면 0.0132% 다 | 「6절에서 DIN의 어텐션은 embedding table의 0.0133%였습니다.」 |
| dcn-vs-din-slot, 3절 블록 바로 뒤 첫 문단 | 「DIN 모듈의 관심 벡터는 러닝화 광고 앞에서 첫 번째 값이 4.911, 커피머신 광고 앞에서 둘째 값이 1.897 로 서로 다릅니다.」 | 첫 번째 값과 둘째 값을 견주어 서로 다른 자리를 비교한 문장이다. 같은 첫 번째 자리의 값은 러닝화 광고 앞에서 4.911, 커피머신 광고 앞에서 0.495 이고, 블록이 둘 다 찍는다 | 「DIN 모듈의 관심 벡터는 첫 번째 값이 러닝화 광고 앞에서 4.911, 커피머신 광고 앞에서 0.495 로 서로 다릅니다.」 |
| interview-system-design, 2절 「요청 하나가 지나가는 길」 그림의 aria-label 첫 문장 | 「왼쪽에서 오른쪽으로 이어지는 여섯 단계 흐름도.」 | 그림의 상자는 요청 받기, 후보 생성, 피처 조회, 점수 매기기, 경매와 응답 다섯이다 | 「왼쪽에서 오른쪽으로 이어지는 다섯 단계 흐름도.」 |

## 부록 자체 확인

계획을 쓰며 블록마다 돌린 확인이다.

- 뜻 줄 73개의 숫자 325개를 그 뜻 줄의 묶음에 찍힌 줄에서 찾았다. 찍힌 줄에 없는 값은 0개다. 쓰면서 그 묶음에 없는 값 다섯을 걸러 냈다. behavior-sequence-attention 첫째 5단계 뜻의 「4차원」, feedback-loop-remedies 둘째 2단계 뜻의 「시드 100개」, interview-ml-modeling 셋째 4단계 뜻의 「노출 20만 건」(찍힌 꼴은 `200,000건`), kakao-ads-bidding-measurement 첫째 4단계 뜻의 「100만 원」, lookalike-modeling 둘째 4단계 뜻의 「1등」이다.
- 비교하는 말(가장, 크게, 더, 배, 가깝다, 낮다, 높다, 똑같다)이 든 뜻 줄을 찍힌 값과 하나씩 맞췄다. multi-task-learning 첫째 5단계 뜻의 「클릭이 적은 세그먼트일수록 3.00% 쪽으로 끌려가」는 참값에서 3.00% 쪽으로 끌려간 비율이 클릭 500건, 250건, 125건, 25건에서 0.17, 0.29, 0.44, 0.80 으로 커지는 것을 셌다. interview-experiment-metrics 넷째 3단계 뜻은 4.9% 와 5.0% 를 「같다」가 아니라 「가깝다」로 썼다.
- 하는 일 49줄의 숫자(유저 수, 노출 수, 반복 수, 예산, 고르는 수)를 코드 값과 맞췄다.
- 함수나 클래스만 만드는 단계는 제목을 「…함수를 만든다」나 「…함수 둘을 만든다」로 끝냈다. 상수와 함수를 함께 두는 단계(feedback-loop-bias 셋째 1단계 「…표 칸 너비를 맞추는 함수를 둔다」 등)는 「둔다」로 썼다.
- 옛 주석 줄마다 그 내용이 새 블록(하는 일, 풀이, 메모, 뜻)에 남았는지 견줬다. 처음 쓸 때 빠진 둘(audience-segmentation 첫째 「세그먼트 테이블 생성」, interview-experiment-metrics 다섯째 「어트리뷰션」)을 다시 넣었다. 줄 끝 주석과 들여 쓴 주석은 그대로 남았다.
- 숫자 뒤 조사 띄어 쓰기를 새로 쓴 주석 316줄에서 훑었다. negative-sampling-bias 둘째 풀이의 「15%를」을 「15% 를」로 고쳤다. kakao-ads-prediction-targeting 하는 일의 「표2의」는 본문이 쓰는 표 이름이라 그대로 둔다.
- 쓰지 않는 낱말은 0개다. 새 블록 49개 전부(바꾸지 않는 코드 줄 포함)에 가운뎃점이 없다.
- 새 블록 49개를 이 계획에서 뽑은 도우미로 사본에 넣었다. 17편 모두 「블록 N개를 옮겼습니다」였고, 인터뷰 3편은 별도 출력 블록 12개를 지웠다. CI 검사 12가지가 통과했다(형식 검사 새 형식 247개, 옛 형식 0개, 문제 0건, 실행 검사 통과 236, 실행 안 됨 11). 표준 라이브러리만 있는 파이썬 3.9 로는 통과 222, 건너뜀 25(라이브러리 없음 14, 실행 안 됨 11)다. 파이썬 3.12 와 3.14 로는 17편 가운데 deep-ctr-models 셋째 블록만 다르다(Review Focus 5).
- 도우미는 sha, 코드 줄, 찍힌 줄이 하나라도 다르면 글을 그대로 두고 멈춘다(여섯째 묶음 도우미에 `sep` 처리만 더했다).
- 네 폭에서 17편의 값 68개가 모두 「블록 수 true <출력 없는 블록> 0 false 0 0 0」이었다. 390 폭 훑기는 108편, 숫자 5,232개, 넘침 0, 끊김 0 이다. 17편을 열 때 콘솔 오류와 경고는 0이었다.
- 본문 단락을 블록마다 읽어 숫자를 찍힌 줄과 맞췄다. 맞지 않는 여덟 곳을 「여쭤볼 것 후보」에 적었다. 그 밖에 반올림해 쓴 곳(「37TB」는 37,253 GB, 「5만 6천 배」는 56,818배, 「5,434억 번」은 543,360,000,000번, 「7,870만 건」은 78,722,689건, 「79일」은 78.7일, 「46배쯤」은 0.979 / 0.021)은 맞는 것으로 봤다. feedback-loop-bias 의 「B 와 C 가 각각 234,500건, E 가 208,500건, F 가 102,500건」은 찍히지 않는 값이라 사본에서 따로 셌고, 맞았다.
- 블록마다 돈 시간을 쟀다(글마다 `--jobs 1`). feedback-loop-remedies 두 블록이 50.1초(둘째 블록 37초쯤), feedback-loop-bias 세 블록이 24.9초, lookalike-modeling 이 5.0초, 나머지 글은 3.2초 아래다. 실행 검사의 한도 120초와 CI 의 느림은 Review Focus 1 에 적었다.

---

## 부록: 새 블록 49개

블록마다 표시 줄과 네 백틱 울타리가 한 쌍이다. 표시 줄의 `block` 은 그 글의 파이썬 블록을 0부터 센 번호다. 도우미가 이 절을 그대로 읽으니 손으로 옮겨 적지 않는다.

### 부록 1: deep-ctr-models (블록 5개, Task 1)

#### 블록 1

<!-- cb7 post=deep-ctr-models block=0 sha=7f8ead685af98dd9 -->
````python
# 하는 일: 유저 1,000만 명과 광고 100만 개로 one-hot 교차 weight 와 embedding 파라미터를 곱해 개수와 FP32 메모리를 견주고, one-hot 교차에서 배울 수 있는 조합의 비율을 구한다.
# 1단계: 유저 수, 광고 수, embedding 차원을 둔다
# 표준 라이브러리만 쓰고, 무작위성도 없다. 그냥 산수다.
N_USER = 10_000_000   # 유저 1,000만 명 (중견 서비스의 월간 활성 유저 규모)
N_AD   = 1_000_000    # 광고 100만 개 (크리에이티브 단위로 세면 이 정도가 된다)
K      = 16           # embedding 차원. 실무에서 8~128 사이를 쓴다.

# 2단계: 두 방법의 파라미터 수를 곱한다
# 방법 A 는 조합마다, 방법 B 는 유저와 광고마다 값을 둔다. 그 차이가 그대로 파라미터 수의 차이다.

# 방법 A: "이 유저 × 이 광고" 조합마다 weight를 하나씩 준다.
#   LR로 유저-광고 상호작용을 배우려면 이 방법밖에 없다.
onehot_cross = N_USER * N_AD

# 방법 B: 유저와 광고에 각각 embedding을 주고, 상호작용은 내적으로 만든다.
#   조합을 미리 만들지 않으므로 파라미터는 '유저 수 + 광고 수'에만 비례한다.
emb_params = N_USER * K + N_AD * K

print(f"A. one-hot 교차 weight : {onehot_cross:,} 개")
print(f"B. embedding 파라미터  : {emb_params:,} 개")
print(f"   B가 A보다 {onehot_cross / emb_params:,.0f}배 적다")

# 3단계: FP32 로 저장했을 때 메모리를 구한다
# 값 하나가 4바이트다. 서버에 올라가는지가 여기서 정해진다.
GB = 1024 ** 3
print(f"A 메모리(FP32): {onehot_cross * 4 / GB:,.0f} GB")
print(f"B 메모리(FP32): {emb_params * 4 / GB:,.2f} GB")

# 4단계: one-hot 교차에서 배울 수 있는 조합의 비율을 구한다
# 파라미터가 줄어드는 것만 이득이 아니다. '배울 수 있느냐'가 더 큰 차이다.
# A는 그 유저와 그 광고가 함께 등장한 로그가 있어야 weight를 배운다.
# 실제로 한 유저가 평생 만나는 광고는 많아야 수백 개다.
seen_per_user = 300
coverage = seen_per_user * N_USER / onehot_cross
print(f"A에서 학습 가능한 조합 비율: {coverage * 100:.4f}%")

# 출력:
# 2단계 뜻: one-hot 교차는 weight 가 10,000,000,000,000개이고 embedding 은 176,000,000개라, B 가 A 보다 56,818배 적다.
# A. one-hot 교차 weight : 10,000,000,000,000 개
# B. embedding 파라미터  : 176,000,000 개
#    B가 A보다 56,818배 적다
# 3단계 뜻: FP32 로 담으면 A 는 37,253 GB, B 는 0.66 GB 다.
# A 메모리(FP32): 37,253 GB
# B 메모리(FP32): 0.66 GB
# 4단계 뜻: one-hot 교차 weight 가운데 학습할 로그가 생기는 조합은 0.0300% 다. 나머지는 값을 한 번도 배우지 못한다.
# A에서 학습 가능한 조합 비율: 0.0300%
````

#### 블록 2

<!-- cb7 post=deep-ctr-models block=1 sha=b6a19da7f4f898ed -->
````python
# 하는 일: 가상 로그 4만 건에서 나이와 시간대만 넣은 LR 과 교차 피처를 하나 붙인 LR 을 학습해, LR 이 「20대 × 저녁」 같은 조합을 스스로 배우지 못하는 것을 AUC 와 LogLoss 로 확인한다.
import random, math
from collections import Counter

random.seed(42)

# 1단계: 조합에만 신호가 있는 가상 로그 4만 건을 만든다
# 조합이 맞으면 4.5%, 어긋나면 0.5%. 나이별 평균은 (4.5+0.5)/2 = 2.5% 로
# 두 나이대가 똑같다. 시간대도 같은 이유로 똑같다. 단독 신호가 0 인 설계다.
# 표준 라이브러리만 쓴다.
TRUE_CTR = {("20대", "저녁"): 0.045, ("20대", "아침"): 0.005,
            ("40대", "아침"): 0.045, ("40대", "저녁"): 0.005}

N = 40000
rows = []
for _ in range(N):
    age  = random.choice(["20대", "40대"])
    hour = random.choice(["아침", "저녁"])
    y = 1 if random.random() < TRUE_CTR[(age, hour)] else 0   # 노출 1건의 클릭 여부
    rows.append((age, hour, y))

base = sum(r[2] for r in rows) / N
print(f"표본 전체 클릭률: {base*100:.2f}%")
for key in ["20대", "40대", "아침", "저녁"]:            # 단독 피처의 클릭률
    n_imp = sum(1 for a, h, _ in rows if key in (a, h))
    n_clk = sum(y for a, h, y in rows if key in (a, h))
    print(f"  {key} 단독: {n_clk/n_imp*100:.2f}%")

# 2단계: 피처를 만드는 두 방식을 함수로 만든다
# 두 방식은 교차 피처 하나가 있고 없고만 다르다.
def plain(a, h):                 # A: 나이, 시간을 따로따로 (LR이 흔히 받는 형태)
    return [f"age={a}", f"hour={h}"]

def cross(a, h):                 # B: A + "나이_시간" 교차 피처 하나를 손으로 붙임
    return plain(a, h) + [f"age_x_hour={a}_{h}"]

# 3단계: 같은 조합끼리 노출과 클릭을 미리 접는다
# 광고 로그는 조합 수가 유한하므로, 4만 행을 (노출, 클릭) 4행으로 접을 수 있다.
# 접어도 로지스틱 손실은 완전히 같다. 대신 학습이 정확하고 빨라진다.
imp, clk = Counter(), Counter()
for a, h, y in rows:
    imp[(a, h)] += 1
    clk[(a, h)] += y

# 4단계: 전체 배치 경사하강으로 학습하는 함수를 만든다
# 접은 네 칸으로 기울기를 구해 3000번 내려간다.
def train(featfn, steps=3000, lr=2.0):
    """전체 배치 경사하강. 파라미터는 '피처 이름 → weight' 딕셔너리다."""
    w = {}
    b = math.log(base / (1 - base))       # bias를 base CTR의 logit에서 출발
    for _ in range(steps):
        gb, gw = 0.0, {}
        for cell, n in imp.items():
            z = b + sum(w.get(nm, 0.0) for nm in featfn(*cell))
            p = 1 / (1 + math.exp(-z))
            g = (n * p - clk[cell]) / N    # 로지스틱 손실의 기울기 = 예측합 - 실제합
            gb += g
            for nm in featfn(*cell):       # sparse 피처는 값이 1이라 g를 그대로 쓴다
                gw[nm] = gw.get(nm, 0.0) + g
        b -= lr * gb
        for nm, g in gw.items():
            w[nm] = w.get(nm, 0.0) - lr * g
    return w, b

# 5단계: AUC 와 LogLoss 로 채점하는 함수를 만든다
# LogLoss 는 확률의 절대값을, AUC 는 순위만 잰다.
def evaluate(featfn, w, b):
    preds = []
    for a, h, y in rows:
        z = b + sum(w.get(nm, 0.0) for nm in featfn(a, h))
        preds.append((1 / (1 + math.exp(-z)), y))
    # LogLoss: 확률의 '절대값'을 재는 지표. 낮을수록 좋다.
    ll = -sum(y*math.log(p) + (1-y)*math.log(1-p) for p, y in preds) / len(preds)
    # AUC: '순위'만 재는 지표. 순위합으로 계산하고, 동점은 평균 순위로 센다.
    preds.sort(key=lambda t: t[0])
    i, rank_sum, npos = 0, 0.0, 0
    while i < len(preds):
        j = i
        while j < len(preds) and preds[j][0] == preds[i][0]:   # 동점 구간 묶기
            j += 1
        avg_rank = (i + 1 + j) / 2
        for k in range(i, j):
            if preds[k][1] == 1:
                rank_sum += avg_rank
                npos += 1
        i = j
    nneg = len(preds) - npos
    return (rank_sum - npos*(npos+1)/2) / (npos*nneg), ll

# 6단계: 두 방식으로 학습하고 채점한다
# B 는 네 조합의 예측을 표본 클릭률과 나란히 찍는다.
for label, fn in [("A 원 피처만", plain), ("B 교차 피처 추가", cross)]:
    w, b = train(fn)
    auc, ll = evaluate(fn, w, b)
    print(f"{label}  AUC {auc:.3f}  LogLoss {ll:.4f}  weight {len(w)}개")
    if fn is cross:
        for cell in imp:
            z = b + sum(w.get(nm, 0.0) for nm in fn(*cell))
            print(f"   {cell[0]} x {cell[1]}: 예측 {1/(1+math.exp(-z))*100:5.2f}%"
                  f"  표본 {clk[cell]/imp[cell]*100:5.2f}%")

# 출력:
# 1단계 뜻: 전체 클릭률은 2.43% 이고, 나이나 시간대 하나만 보면 2.37% 에서 2.48% 사이라 단독 피처에는 신호가 거의 없다.
# 표본 전체 클릭률: 2.43%
#   20대 단독: 2.48%
#   40대 단독: 2.37%
#   아침 단독: 2.42%
#   저녁 단독: 2.43%
# 6단계 뜻: 원 피처만 넣은 A 는 AUC 0.506 으로 순위를 세우지 못하고, 교차 피처를 붙인 B 는 AUC 0.707, LogLoss 0.1050 이다. B 의 예측은 네 조합 모두 표본 클릭률과 같다.
# A 원 피처만  AUC 0.506  LogLoss 0.1141  weight 4개
# B 교차 피처 추가  AUC 0.707  LogLoss 0.1050  weight 8개
#    20대 x 아침: 예측  0.51%  표본  0.51%
#    40대 x 아침: 예측  4.29%  표본  4.29%
#    20대 x 저녁: 예측  4.40%  표본  4.40%
#    40대 x 저녁: 예측  0.42%  표본  0.42%
````

#### 블록 3

<!-- cb7 post=deep-ctr-models block=2 sha=01c97ac347c3db3b -->
````python
# 하는 일: FM 의 2차 상호작용을 모든 쌍을 도는 O(k×n²) 방법과 트릭을 쓴 O(k×n) 방법으로 계산해 값이 같은지 보고, 피처 수에 따라 두 방법이 도는 개수를 견준다.
import random

random.seed(42)

# 1단계: 피처 5개의 latent vector 와 sparse 입력을 만든다
# 표준 라이브러리만 쓴다.
n, k = 5, 4                                                    # 피처 5개, latent 차원 4
V = [[random.gauss(0, 1) for _ in range(k)] for _ in range(n)]  # 피처별 latent vector
x = [1.0, 0.0, 1.0, 1.0, 0.0]                                  # sparse 입력: 1, 3, 4번만 켜짐

# 2단계: 모든 피처 쌍을 직접 도는 함수를 만든다
def naive(V, x):
    """모든 피처 쌍을 직접 돌면서 내적을 더한다 — 쌍의 개수만큼 반복한다."""
    total, pairs = 0.0, 0
    for i in range(len(x)):
        for j in range(i + 1, len(x)):
            dot = sum(V[i][f] * V[j][f] for f in range(len(V[i])))
            total += dot * x[i] * x[j]
            pairs += 1
    return total, pairs

# 3단계: 합의 제곱에서 제곱의 합을 빼는 트릭 함수를 만든다
def fast(V, x):
    """(합의 제곱 - 제곱의 합) / 2. 쌍을 한 번도 만들지 않는다."""
    total = 0.0
    for f in range(len(V[0])):                                  # latent 차원마다 한 번
        s  = sum(V[i][f] * x[i] for i in range(len(x)))          # 그 차원의 가중합
        sq = sum((V[i][f] * x[i]) ** 2 for i in range(len(x)))    # 제곱들의 합
        total += s * s - sq                                      # 대각선 항을 걷어낸다
    return 0.5 * total

# 4단계: 두 방법으로 계산해 값을 견준다
# 파이썬 3.12 부터는 sum 이 부동소수점 오차를 보정해 차이가 0.0e+00 으로 찍힌다.
a, pairs = naive(V, x)
b = fast(V, x)
print(f"naive O(k n^2) = {a:.6f}   (피처 쌍 {pairs}개를 직접 돌았다)")
print(f"fast  O(k n)   = {b:.6f}   (쌍을 만들지 않았다)")
print(f"차이 {abs(a-b):.1e} — 부동소수점 오차 수준")

# 5단계: 피처 수를 늘려 쌍의 개수와 트릭이 훑는 개수를 견준다
# 피처가 늘어나면 두 방법의 격차가 벌어진다. 서빙에 올릴 수 있는지가 이 차이로 정해진다.
for nn in (10, 100, 1000, 10000):
    print(f"  피처 {nn:5d}개 → 쌍 {nn*(nn-1)//2:>11,}개  vs  트릭은 {nn:,}개 훑기")

# 출력 (파이썬 3.9):
# 4단계 뜻: 두 방법이 모두 -1.423433 을 내고, 차이 4.4e-16 은 부동소수점 오차다. 나이브 방법은 피처 쌍 10개를 직접 돌았다.
# naive O(k n^2) = -1.423433   (피처 쌍 10개를 직접 돌았다)
# fast  O(k n)   = -1.423433   (쌍을 만들지 않았다)
# 차이 4.4e-16 — 부동소수점 오차 수준
# 5단계 뜻: 피처 10000개면 쌍이 49,995,000개지만 트릭은 10,000개만 훑는다.
#   피처    10개 → 쌍          45개  vs  트릭은 10개 훑기
#   피처   100개 → 쌍       4,950개  vs  트릭은 100개 훑기
#   피처  1000개 → 쌍     499,500개  vs  트릭은 1,000개 훑기
#   피처 10000개 → 쌍  49,995,000개  vs  트릭은 10,000개 훑기
````

#### 블록 4

<!-- cb7 post=deep-ctr-models block=3 sha=916794bde79438cd -->
````python
# 하는 일: 같은 유저의 최근 행동 5개를 러닝화 광고와 노트북 광고로 각각 채점해, DIN 의 attention 가중치가 후보 광고에 따라 어떻게 달라지는지 mean pooling 과 견준다.
import random, math

random.seed(42)

# 1단계: 차원과 온도를 두고 가상 embedding 함수를 만든다
# 같은 유저라도 '어떤 광고를 채점하느냐'에 따라 유저 표현이 달라지는 것을 본다. 표준 라이브러리만 쓴다.
D = 8      # embedding 차원
T = 3.0    # 점수를 누그러뜨리는 온도. 낮추면 가중치 차이가 더 벌어진다.

def emb(axis):
    """가상 embedding. axis 자리에 +2.0을 얹어 '카테고리 방향'을 만든다.
       실제 모델에서는 이 벡터를 클릭 로그로 학습한다."""
    v = [random.gauss(0, 0.4) for _ in range(D)]
    v[axis] += 2.0
    return v

# 2단계: 유저가 최근에 본 상품 5개를 카테고리 방향으로 만든다
AXIS = {"운동": 0, "전자기기": 2, "여행": 3}     # 카테고리마다 쓰는 자리를 다르게
behaviors = {                                     # 이 유저가 최근에 본 상품 5개
    "운동화": emb(AXIS["운동"]),
    "노트북": emb(AXIS["전자기기"]),
    "러닝화": emb(AXIS["운동"]),
    "여행팩": emb(AXIS["여행"]),
    "운동복": emb(AXIS["운동"]),
}

# 3단계: 방향과 거리로 가중치를 내는 attention 함수를 만든다
def attention(behavior_vecs, candidate):
    """DIN의 attention. 실제로는 학습된 MLP가 행동마다 가중치를 내지만, 여기서는
       '방향이 맞고 거리가 가까우면 관련 있다'는 손 계산으로 대신한다.
       논문처럼 가중치를 합이 1이 되게 나누지 않는다. 비중은 읽기 쉽게 따로 계산한다."""
    raw = []
    for v in behavior_vecs:
        dot  = sum(a*b for a, b in zip(v, candidate))            # 방향이 얼마나 맞나
        dist = sum((a-b)**2 for a, b in zip(v, candidate))       # 얼마나 떨어져 있나
        raw.append(math.exp((dot - 0.5*dist) / T))               # 양수 가중치, 나누지 않은 값
    total = sum(raw)
    return [x/total for x in raw], total              # (읽기용 비중, 나누지 않은 가중치의 합)

# 4단계: 러닝화 광고와 노트북 광고로 같은 유저를 채점한다
SPORTS = ["운동화", "러닝화", "운동복"]
for ad_name, axis in [("러닝화 광고", "운동"), ("노트북 광고", "전자기기")]:
    ws, total = attention(list(behaviors.values()), emb(AXIS[axis]))
    print(f"[{ad_name}] 채점 — 같은 유저, 같은 행동 5개")
    for name, w in zip(behaviors, ws):
        print(f"   {name}: {w:.3f} {'█' * round(w*40)}")
    share = sum(w for n, w in zip(behaviors, ws) if n in SPORTS)
    print(f"   운동 관련 3개가 가져간 비중: {share*100:.1f}%")
    print(f"   나누지 않은 가중치의 합: {total:.2f}")

# 5단계: mean pooling 의 고정 비중과 견준다
print(f"mean pooling이라면 5개 모두 {1/len(behaviors):.3f} — 운동 관련 비중은 60.0% 고정")

# 출력:
# 4단계 뜻: 러닝화 광고를 채점하면 운동 관련 3개가 비중 91.3% 를 가져가고, 노트북 광고로 바꾸면 9.1% 로 떨어진다. 나누지 않은 가중치의 합은 8.41 과 3.89 다.
# [러닝화 광고] 채점 — 같은 유저, 같은 행동 5개
#    운동화: 0.376 ███████████████
#    노트북: 0.026 █
#    러닝화: 0.370 ███████████████
#    여행팩: 0.061 ██
#    운동복: 0.167 ███████
#    운동 관련 3개가 가져간 비중: 91.3%
#    나누지 않은 가중치의 합: 8.41
# [노트북 광고] 채점 — 같은 유저, 같은 행동 5개
#    운동화: 0.029 █
#    노트북: 0.846 ██████████████████████████████████
#    러닝화: 0.022 █
#    여행팩: 0.063 ███
#    운동복: 0.040 ██
#    운동 관련 3개가 가져간 비중: 9.1%
#    나누지 않은 가중치의 합: 3.89
# 5단계 뜻: mean pooling 은 5개에 0.200 씩 주어, 운동 관련 비중이 어느 광고에서나 60.0% 다.
# mean pooling이라면 5개 모두 0.200 — 운동 관련 비중은 60.0% 고정
````

#### 블록 5

<!-- cb7 post=deep-ctr-models block=4 sha=34e9300f52468ded -->
````python
# 하는 일: 해시 버킷 400만 개, 차원 16 으로 LR 부터 DIEN 까지 모델 9개의 파라미터 수를 부품별로 더해, embedding table 이 모델 크기의 대부분을 차지하는지 본다.
# 1단계: 해시 버킷, 차원, 필드, 교차 피처 수를 둔다
# 위 가상 표의 '파라미터 수' 열을 그대로 계산한다. 구조를 바꿔도 DeepFM, DCN-v2, DIN, DIEN 의 크기가 거의 안 변하는 까닭이 여기서 보인다. 표준 라이브러리만 쓴다.
V      = 4_000_000     # 해시 버킷 400만 (hashing trick으로 vocabulary를 고정)
K      = 16            # embedding 차원
FIELDS = 40            # 필드(피처 그룹) 수. 유저ID, 광고ID, 시간대, 디바이스 등
CROSS_KINDS, CROSS_BUCKETS = 200, 65_536   # 손으로 만든 cross feature 200종

# 2단계: embedding table, 1차항, Wide 파트의 크기를 센다
emb_table   = V * K                          # embedding table — 여기가 몸통이다
lr_weight   = V                              # LR/FM 1차항: 피처마다 스칼라 하나
wide_weight = CROSS_KINDS * CROSS_BUCKETS    # Wide 파트의 cross feature weight

# 3단계: MLP 의 파라미터 수를 세는 함수를 만든다
def mlp(dims):
    """dims를 순서대로 잇는 fully-connected MLP의 파라미터 수 (weight + bias)"""
    return sum(dims[i]*dims[i+1] + dims[i+1] for i in range(len(dims)-1))

# 4단계: MLP, cross layer, attention, GRU, 트리의 크기를 센다
deep_mlp = mlp([FIELDS*K, 400, 200, 1])      # 640 → 400 → 200 → 1
cross_v2 = 3 * (FIELDS*K * 64 * 2)           # DCN-v2 cross layer 3장 (rank 64로 분해)
att_mlp  = mlp([4*K, 80, 40, 1])             # DIN attention: 입력 4종(행동, 후보, 차, 곱)
gru      = 2 * 3 * (K*K + K*K + K)           # GRU + AUGRU, gate 3개씩
gbdt     = 500 * 63 * 2                      # 트리 500개, 노드 63개, 분기점+출력값

# 5단계: 모델 9개를 부품 조합으로 적는다
models = [
    ("LR (원 피처)",    {"linear": lr_weight}),
    ("LR + 수동 cross", {"linear": lr_weight, "wide": wide_weight}),
    ("GBDT + LR",       {"linear": lr_weight, "wide": wide_weight, "tree": gbdt}),
    ("FM",              {"linear": lr_weight, "embedding": emb_table}),
    ("Wide & Deep",     {"linear": lr_weight, "wide": wide_weight,
                         "embedding": emb_table, "mlp": deep_mlp}),
    ("DeepFM",          {"linear": lr_weight, "embedding": emb_table, "mlp": deep_mlp}),
    ("DCN-v2",          {"embedding": emb_table, "mlp": deep_mlp, "cross": cross_v2}),
    ("DIN",             {"embedding": emb_table, "mlp": deep_mlp, "attention": att_mlp}),
    ("DIEN",            {"embedding": emb_table, "mlp": deep_mlp,
                         "attention": att_mlp, "gru": gru}),
]

# 6단계: 모델마다 총 파라미터, embedding 비중, FP32 크기를 찍는다
def pad(s, width):
    """한글은 표시 폭이 2칸이다. 글자 수로 맞추면 표가 어긋나므로 폭으로 맞춘다."""
    w = sum(2 if ord(c) > 0x2E80 else 1 for c in s)
    return s + " " * max(0, width - w)

print(pad("모델", 18) + "   총 파라미터   embedding   FP32 크기")
for name, parts in models:
    total = sum(parts.values())
    share = parts.get("embedding", 0) / total * 100
    print(f"{pad(name, 18)} {total:>13,} {share:>10.1f}% {total*4/1024**2:>8.0f} MB")

# 7단계: embedding table 과 DIN 의 attention MLP 크기를 견준다
print()
print(f"embedding table 하나 = {emb_table:,}개 ({emb_table*4/1024**2:.0f} MB)")
print(f"DIN이 DCN-v2 위에 더한 attention MLP = {att_mlp:,}개")
print(f"  → embedding table의 {att_mlp/emb_table*100:.4f}%")

# 출력:
# 6단계 뜻: embedding 을 쓰는 여섯 모델은 총 파라미터의 78.6% 에서 99.5% 가 embedding 이다. DCN-v2, DIN, DIEN 의 FP32 크기는 246 MB, 245 MB, 245 MB 로 거의 같다.
# 모델                 총 파라미터   embedding   FP32 크기
# LR (원 피처)           4,000,000        0.0%       15 MB
# LR + 수동 cross       17,107,200        0.0%       65 MB
# GBDT + LR             17,170,200        0.0%       65 MB
# FM                    68,000,000       94.1%      259 MB
# Wide & Deep           81,444,001       78.6%      311 MB
# DeepFM                68,336,801       93.7%      261 MB
# DCN-v2                64,582,561       99.1%      246 MB
# DIN                   64,345,282       99.5%      245 MB
# DIEN                  64,348,450       99.5%      245 MB
# 7단계 뜻: embedding table 하나가 64,000,000개(244 MB)이고, DIN 이 더한 attention MLP 8,481개는 그 0.0133% 다.
#
# embedding table 하나 = 64,000,000개 (244 MB)
# DIN이 DCN-v2 위에 더한 attention MLP = 8,481개
#   → embedding table의 0.0133%
````

### 부록 2: behavior-sequence-attention (블록 6개, Task 2)

#### 블록 1

<!-- cb7 post=behavior-sequence-attention block=0 sha=5446b2e75212e0ff -->
````python
# 하는 일: 오늘 행동 네 개를 4차원 벡터로 만들어 평균을 내고, 러닝화 광고와 커피머신 광고에 대해 평균과의 점수를 가장 맞는 행동 하나와의 점수와 견준다.
# 1단계: 상품, 카테고리, 시간 간격 표를 둔다
# 평균은 어떤 광고를 채점하든 같은 벡터다. 숫자는 설명을 위해 정한 가상의 임베딩이다. 실제로는 클릭 로그로 학습된다.
# 표준 라이브러리만 쓴다.
ITEM = {                      # 상품 id 표: 상품마다 숫자 두 개
    "러닝화 A": [0.9, 0.1], "러닝화 B": [0.8, 0.2],
    "커피 원두": [0.1, 0.9], "러닝 양말": [0.7, 0.1],
    "러닝화 C": [0.85, 0.15], "커피머신": [0.15, 0.8],   # 광고 상품 둘
}
CATEGORY = {"러닝화": 0.8, "러닝 용품": 0.6, "커피": -0.7}    # 카테고리 표: 숫자 하나
TIME = [(2, 0.9), (10, 0.5), (24 * 30, 0.2), (float("inf"), 0.05)]   # 시간 간격 표: 몇 시간 안이면 이 값

# 2단계: 행동 하나를 4차원 벡터로 만드는 함수 둘을 만든다
def time_value(hours):
    return next(v for limit, v in TIME if hours <= limit)

def to_vector(item, category, hours):
    """행동 하나 = 상품 숫자 2개 + 카테고리 숫자 1개 + 시간 숫자 1개를 이어 붙인 4차원."""
    return ITEM[item] + [CATEGORY[category], time_value(hours)]

# 3단계: 오늘 행동 네 개와 광고 둘을 벡터로 만든다
# 21시 14분 요청이다. 행동마다 요청까지 남은 시간을 함께 둔다.
behaviors = [("러닝화 A", "러닝화", 12.2), ("러닝화 B", "러닝화", 12.15),
             ("커피 원두", "커피", 8.57), ("러닝 양말", "러닝 용품", 1.73)]
E = [to_vector(*b) for b in behaviors]
ads = {"러닝화 광고": to_vector("러닝화 C", "러닝화", 0),     # 광고는 '지금'이라 시간 간격 0
       "커피머신 광고": to_vector("커피머신", "커피", 0)}

# 4단계: 내적을 구하는 함수를 만든다
def dot(a, b):
    return sum(x * y for x, y in zip(a, b))

# 5단계: 행동 벡터 넷과 평균 사용자 벡터를 찍는다
for (name, _, _), e in zip(behaviors, E):
    print(f"{name:6} → {e}")
mean = [sum(col) / len(E) for col in zip(*E)]
print("평균 사용자 벡터 →", [round(x, 3) for x in mean])

# 6단계: 광고마다 평균과의 점수와 가장 맞는 행동 하나와의 점수를 견준다
for ad, v in ads.items():
    best = max(E, key=lambda e: dot(e, v))
    print(f"{ad}: 평균과의 점수 {dot(mean, v):.3f}"
          f" / 가장 맞는 행동 하나와의 점수 {dot(best, v):.3f}"
          f" ({dot(mean, v) / dot(best, v) * 100:.0f}% 만 남음)")

# 출력:
# 5단계 뜻: 행동 넷이 저마다 벡터가 되고, 차원마다 평균을 낸 사용자 벡터는 [0.625, 0.325, 0.375, 0.45] 다.
# 러닝화 A  → [0.9, 0.1, 0.8, 0.2]
# 러닝화 B  → [0.8, 0.2, 0.8, 0.2]
# 커피 원두  → [0.1, 0.9, -0.7, 0.5]
# 러닝 양말  → [0.7, 0.1, 0.6, 0.9]
# 평균 사용자 벡터 → [0.625, 0.325, 0.375, 0.45]
# 6단계 뜻: 평균과의 점수는 가장 맞는 행동 하나와의 점수에 견주어 러닝화 광고에서 68% 만, 커피머신 광고에서는 30% 만 남는다.
# 러닝화 광고: 평균과의 점수 1.285 / 가장 맞는 행동 하나와의 점수 1.900 (68% 만 남음)
# 커피머신 광고: 평균과의 점수 0.496 / 가장 맞는 행동 하나와의 점수 1.675 (30% 만 남음)
````

#### 블록 2

<!-- cb7 post=behavior-sequence-attention block=1 sha=f7124931edc28431 -->
````python
# 하는 일: DIN 의 target attention 으로 러닝화 광고와 커피머신 광고마다 행동 네 개에 가중치를 매겨 사용자 벡터를 만들고, softmax 로 나눴을 때의 가중치와 견준다.
import math

# 1단계: 2절의 행동 벡터 넷과 광고 벡터 둘을 둔다
# 가중치는 학습이 끝났다고 치고 정한 가상의 값이다. 표준 라이브러리만 쓴다.
E = {"러닝화 A": [0.9, 0.1, 0.8, 0.2], "러닝화 B": [0.8, 0.2, 0.8, 0.2],
     "커피 원두": [0.1, 0.9, -0.7, 0.5], "러닝 양말": [0.7, 0.1, 0.6, 0.9]}   # 2절의 벡터
ADS = {"러닝화 광고": [0.85, 0.15, 0.8, 0.9], "커피머신 광고": [0.15, 0.8, -0.7, 0.9]}

# 2단계: 은닉 유닛 하나짜리 MLP 의 가중치를 둔다
# 은닉 유닛 하나짜리 MLP. 실제 모델은 16차원 전부에 학습된 가중치가 붙고 은닉 유닛이 수십 개다.
# 여기서는 '원소별 곱 네 값의 합이 0.3 을 넘는 만큼 1.5배'를 내도록 배웠다고 가정한다.
W1 = [0.0] * 12 + [1.0] * 4      # 앞 12차원(행동, 광고, 차이)은 0, 곱 4차원만 1
B1, W2, B2 = -0.3, 1.5, 0.0

# 3단계: activation unit 함수를 만든다
# 작은 MLP 다. 입력은 [행동, 광고, 행동-광고, 행동×광고] 16차원이고, 나누지 않은 가중치 하나를 낸다.
def activation_unit(e, v):
    x = e + v + [a - b for a, b in zip(e, v)] + [a * b for a, b in zip(e, v)]  # 16차원
    h = max(0.0, sum(w * xi for w, xi in zip(W1, x)) + B1)                     # ReLU
    return W2 * h + B2                                     # 가중치 하나. 나누지 않는다

# 4단계: 광고마다 가중치를 매겨 사용자 벡터를 내고 softmax 와 견준다
for ad, v in ADS.items():
    w = {name: activation_unit(e, v) for name, e in E.items()}
    user = [sum(w[n] * E[n][k] for n in E) for k in range(4)]     # 가중치를 곱해 더한다
    print(f"[{ad}]")
    print("  가중치:", {n: round(x, 3) for n, x in w.items()}, f"합 {sum(w.values()):.2f}")
    print("  사용자 벡터:", [round(x, 3) for x in user])
    exp = {n: math.exp(x) for n, x in w.items()}                  # 비교용 softmax
    tot = sum(exp.values())
    print("  softmax 였다면:", {n: round(x / tot, 3) for n, x in exp.items()}, "합 1.00")

# 출력:
# 4단계 뜻: 러닝화 광고 앞에서는 커피 원두가, 커피머신 광고 앞에서는 러닝화 둘이 가중치 0.0 을 받는다. 사용자 벡터는 광고마다 다르다. 가중치 합은 6.20 과 2.48 이고, softmax 로 나누면 둘 다 1.00 이 된다.
# [러닝화 광고]
#   가중치: {'러닝화 A': 1.95, '러닝화 B': 1.845, '커피 원두': 0.0, '러닝 양말': 2.4} 합 6.20
#   사용자 벡터: [4.911, 0.804, 4.476, 2.919]
#   softmax 였다면: {'러닝화 A': 0.277, '러닝화 B': 0.249, '커피 원두': 0.039, '러닝 양말': 0.434} 합 1.00
# [커피머신 광고]
#   가중치: {'러닝화 A': 0.0, '러닝화 B': 0.0, '커피 원두': 2.062, '러닝 양말': 0.413} 합 2.48
#   사용자 벡터: [0.495, 1.897, -1.196, 1.403]
#   softmax 였다면: {'러닝화 A': 0.088, '러닝화 B': 0.088, '커피 원두': 0.691, '러닝 양말': 0.133} 합 1.00
````

#### 블록 3

<!-- cb7 post=behavior-sequence-attention block=2 sha=a5a899e0bb8e5b13 -->
````python
# 하는 일: BST 방식대로 행동 네 개 끝에 커피머신 광고를 붙여 self-attention 가중치 표를 구하고, 커피 원두와 광고 위치의 벡터가 어떻게 다시 쓰이는지 본다.
import math

# 1단계: 행동 넷과 광고 하나의 벡터를 시퀀스로 둔다
# BST 처럼 후보 광고도 시퀀스 끝에 붙인다. 시간 값(4번째 차원)이 위치 신호 역할을 한다. 표준 라이브러리만 쓴다.
names = ["러닝화 A", "러닝화 B", "커피 원두", "러닝 양말", "커피머신 광고"]
X = [[0.9, 0.1, 0.8, 0.2], [0.8, 0.2, 0.8, 0.2], [0.1, 0.9, -0.7, 0.5],
     [0.7, 0.1, 0.6, 0.9], [0.15, 0.8, -0.7, 0.9]]          # 2절의 벡터 + 광고 하나
d = len(X[0])

# 2단계: 내적 함수를 만들고 Q, K, V 를 둔다
# W_Q, W_K, W_V 는 학습되는 행렬인데, 여기서는 W_Q = 2I, W_K = W_V = I 로 둔 가정이다.
def dot(a, b):
    return sum(x * y for x, y in zip(a, b))

Q = [[2 * x for x in row] for row in X]          # Q = X W_Q
K, V = X, X                                      # K = X W_K, V = X W_V

# 3단계: 위치마다 softmax 가중치를 구한다
A = []                                           # 줄 i = i번째 위치가 누구를 얼마나 보나
for q in Q:
    s = [dot(q, k) / math.sqrt(d) for k in K]    # scaled dot-product
    m = max(s)
    e = [math.exp(x - m) for x in s]
    A.append([x / sum(e) for x in e])            # Transformer 는 softmax 를 쓴다

# 4단계: 가중치 표를 찍는다
tags = ["b1", "b2", "b3", "b4", "ad"]          # 한글은 칸 폭이 달라 표에는 짧은 이름을 쓴다
print("      " + "".join(f"{t:>6}" for t in tags))
for t, row in zip(tags, A):
    print(f"{t:>6}" + "".join(f"{x:6.2f}" for x in row))
print("(" + ", ".join(f"{t} {n}" for t, n in zip(tags, names)) + ")")

# 5단계: 가중치로 V 를 섞어 커피 원두와 광고 위치의 새 벡터를 낸다
out = [[sum(A[i][j] * V[j][k] for j in range(len(X))) for k in range(d)] for i in range(len(X))]
for i in (2, 4):
    print(f"{names[i]}: {X[i]} → {[round(x, 3) for x in out[i]]}")

# 출력:
# 4단계 뜻: 러닝 행동 셋(b1, b2, b4)은 서로를 크게 보고, 커피 원두(b3)는 자기에게 0.37, 광고에 0.41 을 준다. 광고 위치(ad)는 커피 원두에 0.33 을 준다.
#           b1    b2    b3    b4    ad
#     b1  0.32  0.30  0.05  0.26  0.06
#     b2  0.31  0.29  0.06  0.26  0.07
#     b3  0.06  0.06  0.37  0.09  0.41
#     b4  0.24  0.22  0.08  0.34  0.12
#     ad  0.05  0.06  0.33  0.11  0.45
# (b1 러닝화 A, b2 러닝화 B, b3 커피 원두, b4 러닝 양말, ad 커피머신 광고)
# 5단계 뜻: 커피 원두의 새 벡터 [0.268, 0.692, -0.395, 0.667] 와 광고 위치의 새 벡터 [0.271, 0.684, -0.391, 0.69] 가 거의 같아진다. 둘이 서로를 크게 보았기 때문이다.
# 커피 원두: [0.1, 0.9, -0.7, 0.5] → [0.268, 0.692, -0.395, 0.667]
# 커피머신 광고: [0.15, 0.8, -0.7, 0.9] → [0.271, 0.684, -0.391, 0.69]
````

#### 블록 4

<!-- cb7 post=behavior-sequence-attention block=3 sha=f6a5441b8ea6657e -->
````python
# 하는 일: 이력이 2만 개인 사용자에게 후보 광고 800개가 올 때 이력 전부에 attention 을 하는 곱셈 수와 200개만 고른 곱셈 수를 세고, 커피머신 광고의 hard search 가 남기는 행동을 본다.
# 1단계: 이력 수, 후보 수, 남길 수, 층 크기를 둔다
# 숨은 층은 널리 쓰이는 구현(DeepCTR)의 기본값 (80, 40) 을, 행동 벡터는 상품 32 + 카테고리 32 + 시간 32 = 96차원을 가정한다.
# 이력 수와 카테고리 분포는 가상 값이다. 표준 라이브러리만 쓴다.
HISTORY = 20_000          # 이 사용자의 평생 이력
CANDIDATES = 800          # Model Serving 에 오는 후보 수(생태계 지도의 값)
K = 200                   # 고르는 단계가 남기는 수(SIM 논문이 카테고리마다 자른 길이)
D = 96
LAYERS = [4 * D, 80, 40, 1]          # [행동, 광고, 차이, 곱] → 80 → 40 → 가중치 하나

# 2단계: 이력 전부, 고른 200개, soft search 의 곱셈 수를 센다
macs_per_pair = sum(a * b for a, b in zip(LAYERS, LAYERS[1:]))
full = CANDIDATES * HISTORY * macs_per_pair
picked = CANDIDATES * K * macs_per_pair
soft = CANDIDATES * HISTORY * 32     # soft search 를 인덱스 없이: 상품 임베딩 32차원 내적
print(f"행동 하나와 광고 하나: 곱셈 {macs_per_pair:,}번")
print(f"이력 전부에 attention: {full:,}번")
print(f"고른 {K}개에만: {picked:,}번 ({full // picked}분의 1)")
print(f"soft search 로 고르는 데 드는 곱셈: {soft:,}번")

# 3단계: 카테고리 분포로 hard search 가 남기는 행동을 센다
by_category = {"러닝화": 6000, "러닝 용품": 3000, "전자기기": 4000, "여행": 2500,
               "커피": 900, "주방가전": 400, "외식": 1200, "기타": 2000}
assert sum(by_category.values()) == HISTORY
coffee = by_category["커피"]
print(f"커피머신 광고의 hard search: 커피 카테고리 {coffee}개 중 최근 {min(K, coffee)}개,"
      f" 그 밖의 {HISTORY - coffee:,}개는 보지 않는다")

# 출력:
# 2단계 뜻: 행동 하나와 광고 하나에 곱셈이 33,960번 들어, 이력 전부면 543,360,000,000번이고 200개만 고르면 그 100분의 1 이다. soft search 로 고르는 데는 512,000,000번이 든다.
# 행동 하나와 광고 하나: 곱셈 33,960번
# 이력 전부에 attention: 543,360,000,000번
# 고른 200개에만: 5,433,600,000번 (100분의 1)
# soft search 로 고르는 데 드는 곱셈: 512,000,000번
# 3단계 뜻: hard search 는 커피 카테고리 900개 가운데 최근 200개만 남기고, 그 밖의 19,100개는 보지 않는다.
# 커피머신 광고의 hard search: 커피 카테고리 900개 중 최근 200개, 그 밖의 19,100개는 보지 않는다
````

#### 블록 5

<!-- cb7 post=behavior-sequence-attention block=4 sha=17a9e711bd077cfa -->
````python
# 하는 일: 이력 10개에서 최대 3개를 먼저 고르는 기준 셋(같은 카테고리, 따로 학습한 임베딩, attention 과 같은 점수)마다 남는 가중치와 사용자 벡터의 점수를, 10개 전부로 낸 값과 견준다.
# 1단계: 상품, 카테고리, 시간 표와 soft search 임베딩을 둔다
# 긴 이력에서 K개를 먼저 고르고 그 안에서만 target attention 을 한다. 이력 10개와 모든 숫자는 설명을 위한 가상 값이다. 표준 라이브러리만 쓴다.
ITEM = {"러닝화 A": [0.9, 0.1], "러닝화 B": [0.8, 0.2], "커피 원두": [0.1, 0.9],
        "러닝 양말": [0.7, 0.1], "커피 그라인더": [0.2, 0.9], "카페 쿠폰": [0.1, 0.7],
        "드립백 커피": [0.15, 0.85], "노트북": [0.0, 0.1], "여행 가방": [0.3, 0.2],
        "커피 머그": [0.2, 0.6], "커피머신": [0.15, 0.8]}
CATEGORY = {"러닝화": 0.8, "러닝 용품": 0.6, "커피": -0.7, "주방가전": -0.6,
            "외식": -0.3, "전자기기": 0.1, "여행": 0.2, "주방용품": -0.2}
TIME = [(2, 0.9), (10, 0.5), (24 * 30, 0.2), (float("inf"), 0.05)]
# soft search 가 쓰는 임베딩은 본 모델과 따로 학습됐다. 그라인더를 주방가전 쪽으로 본다.
SOFT = {"러닝화 A": [0.9, 0.05], "러닝화 B": [0.9, 0.05], "커피 원두": [0.1, 0.95],
        "러닝 양말": [0.8, 0.1], "커피 그라인더": [0.6, 0.3], "카페 쿠폰": [0.2, 0.7],
        "드립백 커피": [0.15, 0.9], "노트북": [0.5, 0.0], "여행 가방": [0.4, 0.1],
        "커피 머그": [0.3, 0.5], "커피머신": [0.1, 0.9]}

# 2단계: 벡터, 내적, 가중치 함수 셋을 만든다
def vec(item, cat, hours):
    return ITEM[item] + [CATEGORY[cat], next(v for h, v in TIME if hours <= h)]

def dot(a, b):
    return sum(x * y for x, y in zip(a, b))

def weight(e, v):                    # 4절의 activation unit 과 같은 손 계산
    return 1.5 * max(0.0, dot(e, v) - 0.3)

# 3단계: 이력 10개와 커피머신 광고로 행동마다 가중치를 구한다
history = [("러닝화 A", "러닝화", 12.2), ("러닝화 B", "러닝화", 12.15),
           ("커피 원두", "커피", 8.57), ("러닝 양말", "러닝 용품", 1.73),
           ("커피 그라인더", "주방가전", 23), ("카페 쿠폰", "외식", 72),
           ("드립백 커피", "커피", 960), ("노트북", "전자기기", 48),
           ("여행 가방", "여행", 240), ("커피 머그", "주방용품", 25)]
ad, ad_cat = "커피머신", "커피"
v = vec(ad, ad_cat, 0)
W = {h[0]: weight(vec(*h), v) for h in history}
full_total = sum(W.values())
K = 3

# 4단계: 세 기준으로 최대 3개씩 고른다
# 카테고리(hard search), 따로 학습한 임베딩의 내적(soft search), attention 과 같은 점수(TWIN 방식)다.
picks = {
    "hard (같은 카테고리)": [h[0] for h in history if h[1] == ad_cat][:K],
    "soft (따로 학습한 임베딩)": sorted(W, key=lambda n: -dot(SOFT[n], SOFT[ad]))[:K],
    "TWIN (attention 과 같은 점수)": sorted(W, key=lambda n: -W[n])[:K],
}

# 5단계: 10개 전부와 기준마다 사용자 벡터와 점수를 견준다
full_user = [sum(W[h[0]] * vec(*h)[k] for h in history) for k in range(4)]
print(f"전체 10개로 낸 사용자 벡터: {[round(x, 2) for x in full_user]}, 점수 {dot(full_user, v):.2f}")
for name, chosen in picks.items():
    kept = sum(W[n] for n in chosen)
    user = [sum(W[h[0]] * vec(*h)[k] for h in history if h[0] in chosen) for k in range(4)]
    print(f"{name}: {chosen}")
    print(f"   남은 가중치 {kept / full_total * 100:.1f}%, 사용자 벡터 {[round(x, 2) for x in user]},"
          f" 점수 {dot(user, v):.2f}")

# 출력:
# 5단계 뜻: 10개 전부로 낸 점수는 9.18 이다. 같은 카테고리로 고르면 둘만 남아 가중치 47.9% 에 점수 5.19, 따로 학습한 임베딩은 61.6% 에 6.16, attention 과 같은 점수로 고르면 69.6% 에 7.32 다.
# 전체 10개로 낸 사용자 벡터: [1.28, 5.69, -3.58, 2.15], 점수 9.18
# hard (같은 카테고리): ['커피 원두', '드립백 커피']
#    남은 가중치 47.9%, 사용자 벡터 [0.42, 3.05, -2.43, 1.1], 점수 5.19
# soft (따로 학습한 임베딩): ['커피 원두', '드립백 커피', '카페 쿠폰']
#    남은 가중치 61.6%, 사용자 벡터 [0.52, 3.75, -2.73, 1.3], 점수 6.16
# TWIN (attention 과 같은 점수): ['커피 원두', '커피 그라인더', '드립백 커피']
#    남은 가중치 69.6%, 사용자 벡터 [0.73, 4.47, -3.37, 1.42], 점수 7.32
````

#### 블록 6

<!-- cb7 post=behavior-sequence-attention block=5 sha=4594b567480572a7 -->
````python
# 하는 일: [사용자 벡터, 광고 벡터, 문맥] 을 이어 붙여 위층에 넣고 러닝화 광고의 pCTR 을 내며, 노출 뒤 구매가 시퀀스에 섞일 때와 클릭 하나로 학습 한 걸음을 갈 때 숫자가 어떻게 움직이는지 본다.
import math

# 1단계: 상품, 카테고리, 시간 표와 오늘 로그, 위층 가중치를 둔다
# 위층은 설명을 위해 로지스틱 하나로 줄였고, 모든 가중치는 가상 값이다. 표준 라이브러리만 쓴다.
ITEM = {"러닝화 A": [0.9, 0.1], "러닝화 B": [0.8, 0.2], "커피 원두": [0.1, 0.9],
        "러닝 양말": [0.7, 0.1], "러닝화 C": [0.85, 0.15]}
CATEGORY = {"러닝화": 0.8, "러닝 용품": 0.6, "커피": -0.7}
TIME = [(2, 0.9), (10, 0.5), (24 * 30, 0.2), (float("inf"), 0.05)]
LOG = [("09:02", "러닝화 A", "러닝화"), ("09:05", "러닝화 B", "러닝화"),
       ("12:40", "커피 원두", "커피"), ("19:30", "러닝 양말", "러닝 용품"),
       ("21:20", "러닝화 C", "러닝화")]          # 마지막 줄은 노출 6분 뒤의 구매
IMPRESSION = "21:14"
W_TOP = [0.12, 0.05, 0.10, 0.08] + [0.2, 0.1, 0.1, 0.0] + [0.3, 0.2]   # 사용자 4, 광고 4, 문맥 2
CONTEXT = [0.9, 0.3]                              # 저녁 시간대, 뉴스앱 320×100

# 2단계: 시각을 시간으로 바꾸고 pCTR 을 내는 함수 둘을 만든다
def hours(t):
    h, m = map(int, t.split(":"))
    return h + m / 60

def predict(p, leak=False):
    seq = [r for r in LOG if leak or r[0] < IMPRESSION]       # 노출 전 행동만 넣는다
    item = dict(ITEM, **{"러닝 양말": [p["양말0"], 0.1]})
    vec = lambda name, cat, gap: item[name] + [CATEGORY[cat], next(v for h, v in TIME if gap <= h)]
    ad = vec("러닝화 C", "러닝화", 0)
    user = [0.0] * 4
    for t, name, cat in seq:
        e = vec(name, cat, max(0.0, hours(IMPRESSION) - hours(t)))
        w = p["W2"] * max(0.0, sum(a * b for a, b in zip(e, ad)) + p["B1"])   # activation unit
        user = [u + w * x for u, x in zip(user, e)]
    x = user + ad + CONTEXT
    z = sum(a * b for a, b in zip(W_TOP, x)) + p["b"]
    return 1 / (1 + math.exp(-z))

# 3단계: 노출 전 행동만 넣을 때와 노출 뒤 구매까지 섞을 때의 pCTR 을 견준다
params = {"W2": 1.5, "B1": -0.3, "b": -5.75, "양말0": 0.7}
print(f"pCTR {predict(params) * 100:.2f}% (노출 전 행동 4개)")
print(f"pCTR {predict(params, leak=True) * 100:.2f}% (노출 뒤 구매까지 섞으면)")

# 4단계: 클릭됐을 때와 안 됐을 때 학습 한 걸음을 간다
# 클릭 하나가 들어오면 같은 손실이 위층, activation unit, 임베딩까지 함께 고친다.
for label in (1, 0):                             # 이 노출이 클릭됐을 때와 안 됐을 때
    loss = lambda p, y=label: -math.log(predict(p) if y else 1 - predict(p))
    grad = {}
    for k in params:                             # 숫자로 미분: 조금 올렸을 때와 내렸을 때
        up, down = dict(params), dict(params)
        up[k] += 1e-5; down[k] -= 1e-5
        grad[k] = (loss(up) - loss(down)) / 2e-5
    new = {k: params[k] - 0.05 * grad[k] for k in params}    # 학습률 0.05 로 한 걸음
    moved = ", ".join(f"{k} {params[k]:.3f}→{new[k]:.3f}" for k in params)
    print(f"라벨 {label}: {moved} | pCTR {predict(new) * 100:.2f}%")

# 출력:
# 3단계 뜻: 노출 전 행동 4개로 낸 pCTR 은 2.10% 인데, 노출 뒤 구매까지 섞으면 4.31% 로 뛴다.
# pCTR 2.10% (노출 전 행동 4개)
# pCTR 4.31% (노출 뒤 구매까지 섞으면)
# 4단계 뜻: 클릭되면 W2, B1, b, 양말0 이 모두 올라 pCTR 이 2.42% 가 되고, 클릭되지 않으면 조금씩 내려가 2.09% 가 된다.
# 라벨 1: W2 1.500→1.543, B1 -0.300→-0.254, b -5.750→-5.701, 양말0 0.700→0.728 | pCTR 2.42%
# 라벨 0: W2 1.500→1.499, B1 -0.300→-0.301, b -5.750→-5.751, 양말0 0.700→0.699 | pCTR 2.09%
````

### 부록 3: din-architecture (블록 1개, Task 2)

#### 블록 1

<!-- cb7 post=din-architecture block=0 sha=cdc867c1335fa52d -->
````python
# 하는 일: DIN 의 activation unit 을 손으로 돌려 러닝화 광고와 커피머신 광고마다 행동 네 개의 가중치와 관심 벡터를 내고, 행동이 하나뿐인 사람을 빈칸과 mask 로 같은 배치에 넣어 본다.
import math

# 1단계: 행동 벡터 넷과 광고 벡터 둘을 둔다
# 숫자는 행동 시퀀스 Attention 글과 같은 가상 값이다.
E = {"러닝화 A": [0.9, 0.1, 0.8, 0.2], "러닝화 B": [0.8, 0.2, 0.8, 0.2],
     "커피 원두": [0.1, 0.9, -0.7, 0.5], "러닝 양말": [0.7, 0.1, 0.6, 0.9]}
ADS = {"러닝화 광고": [0.85, 0.15, 0.8, 0.9], "커피머신 광고": [0.15, 0.8, -0.7, 0.9]}


# 2단계: activation unit 함수를 만든다
def activation_unit(e, v):
    """[행동, 광고, 차이, 곱] 16차원 → 가중치 하나. 곱 부분의 합이 0.3 을 넘는 만큼 1.5배라고 배웠다고 놓는다."""
    x = e + v + [a - b for a, b in zip(e, v)] + [a * b for a, b in zip(e, v)]
    h = max(0.0, sum(x[12:]) - 0.3)            # 앞 12차원에 붙은 가중치는 0 이라고 놓았다
    return 1.5 * h


# 3단계: 가중치를 곱해 더하는 함수를 만든다
def pool(history, ad):
    w = [activation_unit(e, ad) for e in history]
    user = [sum(wi * e[k] for wi, e in zip(w, history)) for k in range(4)]   # 길이는 늘 4차원
    return w, user


# 4단계: 광고마다 가중치와 관심 벡터를 내고 softmax 와 견준다
for name, v in ADS.items():
    w, user = pool(list(E.values()), v)
    soft = [math.exp(x) for x in w]
    print(f"{name}: 가중치 {[round(x, 3) for x in w]} 합 {sum(w):.2f}"
          f" / softmax {[round(x / sum(soft), 3) for x in soft]}")
    print(f"  관심 벡터 {[round(x, 3) for x in user]}")

# 5단계: 행동이 하나뿐인 사람을 빈칸 셋과 mask 로 채운다
# 기록 길이가 다른 두 사람을 한 배치에 넣는다. 짧은 쪽은 빈칸을 채우고 mask 로 그 가중치를 0 으로 만든다.
PAD = [0.0, 0.0, 0.0, 0.0]
short = [E["커피 원두"]]                                  # 행동 하나뿐인 사람
padded, mask = short + [PAD] * 3, [1, 0, 0, 0]
w = [activation_unit(e, ADS["커피머신 광고"]) * m for e, m in zip(padded, mask)]
user = [sum(wi * e[k] for wi, e in zip(w, padded)) for k in range(4)]
print(f"행동 1개 + 빈칸 3개: 가중치 {[round(x, 3) for x in w]} 관심 벡터 {[round(x, 3) for x in user]}")

# 출력:
# 4단계 뜻: 러닝화 광고 앞에서는 커피 원두가, 커피머신 광고 앞에서는 러닝화 둘이 가중치 0.0 을 받는다. 가중치 합은 6.20 과 2.48 이고, 관심 벡터는 광고마다 다르다.
# 러닝화 광고: 가중치 [1.95, 1.845, 0.0, 2.4] 합 6.20 / softmax [0.277, 0.249, 0.039, 0.434]
#   관심 벡터 [4.911, 0.804, 4.476, 2.919]
# 커피머신 광고: 가중치 [0.0, 0.0, 2.062, 0.413] 합 2.48 / softmax [0.088, 0.088, 0.691, 0.133]
#   관심 벡터 [0.495, 1.897, -1.196, 1.403]
# 5단계 뜻: 빈칸 셋의 가중치는 0.0 이고, 관심 벡터 [0.206, 1.856, -1.444, 1.031] 은 커피 원두 하나로만 만들어진다.
# 행동 1개 + 빈칸 3개: 가중치 [2.062, 0.0, 0.0, 0.0] 관심 벡터 [0.206, 1.856, -1.444, 1.031]
````

### 부록 4: dcn-vs-din-slot (블록 1개, Task 2)

#### 블록 1

<!-- cb7 post=dcn-vs-din-slot block=0 sha=315d17c96f95d81f -->
````python
# 하는 일: 같은 행동 네 개를 DCN 만 쓰는 모델의 미리 센 숫자와 DIN 모듈의 가중치, 관심 벡터로 바꿔 광고 둘 앞에서 견주고, 요청 한 건의 가중치 계산 수를 센다.
# 1단계: 행동 네 개와 광고 둘을 둔다
# 숫자는 DIN 모델 구조 글과 같은 가상 값이다. 표준 라이브러리만 쓴다.
BEHAVIORS = [  # (이름, 종류, 카테고리, 4차원 벡터)
    ("러닝화 A", "클릭", "러닝", [0.9, 0.1, 0.8, 0.2]),
    ("러닝화 B", "클릭", "러닝", [0.8, 0.2, 0.8, 0.2]),
    ("커피 원두", "구매", "커피", [0.1, 0.9, -0.7, 0.5]),
    ("러닝 양말", "클릭", "러닝", [0.7, 0.1, 0.6, 0.9]),
]
ADS = {"러닝화 광고": [0.85, 0.15, 0.8, 0.9], "커피머신 광고": [0.15, 0.8, -0.7, 0.9]}


# 2단계: 사람이 정한 규칙으로 미리 센 숫자를 내는 함수를 만든다
def counted_features(behaviors):
    """DCN 만 쓰는 모델: 사람이 정한 규칙으로 미리 센 숫자. 광고를 보지 않는다."""
    return {"행동 수": len(behaviors),
            "러닝 수": sum(b[2] == "러닝" for b in behaviors),
            "커피 수": sum(b[2] == "커피" for b in behaviors)}


# 3단계: DIN 모듈의 가중치와 관심 벡터를 내는 함수를 만든다
def din_slot(behaviors, ad):
    """DIN 모듈: 행동마다 광고와 비교해 가중치를 내고 곱해 더한다. 가중치를 내는 신경망은 학습이 끝났다고 놓는다."""
    w = [1.5 * max(0.0, sum(a * b for a, b in zip(e, ad)) - 0.3) for *_, e in behaviors]
    user = [round(sum(wi * b[3][k] for wi, b in zip(w, behaviors)), 3) for k in range(4)]
    return [round(x, 3) for x in w], user


# 4단계: 광고 둘 앞에서 두 모델에 들어가는 행동 정보를 나란히 찍는다
for ad, v in ADS.items():
    print(f"[{ad}]")
    print("  DCN 만 :", counted_features(BEHAVIORS))
    w, user = din_slot(BEHAVIORS, v)
    print("  DIN 모듈 : 가중치", w, "관심 벡터", user)

# 5단계: 요청 한 건의 가중치 계산 수를 센다
CANDIDATES, KEEP = 800, 50          # 설명용 값
print(f"요청 한 건의 가중치 계산: {CANDIDATES} × {KEEP} = {CANDIDATES * KEEP:,}번")

# 출력:
# 4단계 뜻: DCN 만 쓰는 쪽의 숫자는 두 광고 앞에서 행동 수 4, 러닝 수 3, 커피 수 1 로 똑같다. DIN 모듈의 관심 벡터는 첫 값이 러닝화 광고 앞에서 4.911, 커피머신 광고 앞에서 0.495 로 서로 다르다.
# [러닝화 광고]
#   DCN 만 : {'행동 수': 4, '러닝 수': 3, '커피 수': 1}
#   DIN 모듈 : 가중치 [1.95, 1.845, 0.0, 2.4] 관심 벡터 [4.911, 0.804, 4.476, 2.919]
# [커피머신 광고]
#   DCN 만 : {'행동 수': 4, '러닝 수': 3, '커피 수': 1}
#   DIN 모듈 : 가중치 [0.0, 0.0, 2.062, 0.413] 관심 벡터 [0.495, 1.897, -1.196, 1.403]
# 5단계 뜻: 후보 800개마다 행동 50개의 가중치를 다시 계산하면 요청 한 건에 40,000번이다.
# 요청 한 건의 가중치 계산: 800 × 50 = 40,000번
````

### 부록 5: multi-task-learning (블록 3개, Task 3)

#### 블록 1

<!-- cb7 post=multi-task-learning block=0 sha=3e04c3f36bbbaeea -->
````python
# 하는 일: 노출 100,000건, 클릭 2,000건, 전환 60건을 세그먼트 6개로 쪼갠 가상 데이터로, 클릭만 보고 배운 pCVR 과 ESMM 방식으로 얻은 pCVR 을 같은 세기의 정규화 아래에서 참 CVR 과 견준다.
import random

random.seed(42)  # 이 계산엔 난수가 없지만, 재현성 관례를 지킨다

# 1단계: 세그먼트 6개의 노출, 클릭, 전환을 둔다
# (세그먼트 이름, 노출, 클릭, 전환) 가상 데이터다. 노이즈를 일부러 넣지 않아 참 CVR 이 전환/클릭으로 딱 떨어지고, 두 방식의 차이만 남는다.
# 클릭이 잘 나는 자리일수록 전환도 잘 난다. SSB(샘플 선택 편향)가 생기는 바로 그 조건이다. 표준 라이브러리만 쓴다.
SEGMENTS = [
    ("재방문 고관여", 5_000, 500, 25),   # CTR 10.0%  CVR 5.0%
    ("관심 카테고리", 10_000, 600, 18),  # CTR  6.0%  CVR 3.0%
    ("일반 사용자", 20_000, 500, 10),    # CTR  2.5%  CVR 2.0%
    ("신규 사용자", 25_000, 250, 5),     # CTR  1.0%  CVR 2.0%
    ("저관여 지면", 25_000, 125, 2),     # CTR  0.5%  CVR 1.6%
    ("신규 지면", 15_000, 25, 0),        # CTR  0.17% CVR 0.0%  <- 클릭이 거의 없는 자리
]

# 2단계: 전체 합계와 두 평균 전환율을 찍는다
IMP = sum(s[1] for s in SEGMENTS)
CLK = sum(s[2] for s in SEGMENTS)
CVS = sum(s[3] for s in SEGMENTS)
print(f"전체   노출 {IMP:,}, 클릭 {CLK:,}, 전환 {CVS}")
print(f"클릭 가중 평균 전환율(클릭 데이터가 보는 값)  {CVS / CLK:.2%}")
print(f"노출 가중 평균 전환율(전체 노출의 실제 평균)  "
      f"{sum(i * (c / k) for _, i, k, c in SEGMENTS) / IMP:.2%}")
print()

# 3단계: 두 방식에 같은 세기의 정규화를 건다
# 정규화(선험 평균 쪽으로 끌어당기는 힘)를 두 방식에 '똑같이' 100 표본만큼 건다.
# 실무의 weight decay나 베이지안 스무딩이 하는 일을 가장 단순하게 흉내낸 것이다.
ALPHA = 100
PRIOR_CVR = CVS / CLK      # 클릭 공간의 선험값 = 3.00%
PRIOR_CTR = CLK / IMP      # 노출 공간의 선험값 = 2.00%
PRIOR_CTCVR = CVS / IMP    # 노출 공간의 선험값 = 0.06%


# 4단계: 한글 폭을 맞추는 표 칸 함수를 만든다
def cell(s, w, right=True):
    """한글을 폭 2칸으로 세서 표 칸을 맞춘다."""
    gap = " " * max(0, w - sum(2 if ord(c) > 0x2000 else 1 for c in s))
    return gap + s if right else s + gap


# 5단계: 세그먼트마다 두 방식의 pCVR 을 참 CVR 과 나란히 찍는다
print(cell("세그먼트", 16, False) + cell("노출", 7) + cell("클릭", 6)
      + cell("참CVR", 8) + cell("(a)클릭만", 11) + cell("(b)ESMM", 10))

err_a = err_b = 0.0
for name, imp, clk, cnv in SEGMENTS:
    true_cvr = cnv / clk                    # 이 가상 데이터의 참값

    # (a) 클릭만 보고 학습: 분모가 '클릭 수'다. 클릭 25건짜리 세그먼트는
    #     표본 100의 힘에 눌려 값이 거의 통째로 3.00%(클릭 평균)로 끌려간다.
    pcvr_a = (cnv + ALPHA * PRIOR_CVR) / (clk + ALPHA)

    # (b) ESMM 방식: 노출 전체에서 pCTR과 pCTCVR을 각각 학습하고, 나눠서 pCVR을 얻는다.
    #     분모가 '노출 수'라서 같은 세기의 정규화가 훨씬 약하게 작용한다.
    pctr = (clk + ALPHA * PRIOR_CTR) / (imp + ALPHA)
    pctcvr = (cnv + ALPHA * PRIOR_CTCVR) / (imp + ALPHA)
    pcvr_b = pctcvr / pctr                  # 항등식을 거꾸로 쓴 것

    err_a += imp * abs(pcvr_a - true_cvr)   # 노출 수로 가중한 절대오차
    err_b += imp * abs(pcvr_b - true_cvr)
    print(cell(name, 16, False)
          + f"{imp:>7,}{clk:>6,}{true_cvr:>8.2%}{pcvr_a:>11.2%}{pcvr_b:>10.2%}")

# 6단계: 노출로 가중한 평균 절대오차를 견준다
print()
print(f"노출 가중 평균 절대오차   (a) {err_a / IMP * 100:.3f}%p   (b) {err_b / IMP * 100:.3f}%p")
print(f"(b)의 오차가 (a)보다 {err_a / err_b:.1f}배 작다")

# 출력:
# 2단계 뜻: 클릭 데이터가 보는 평균 전환율은 3.00% 인데, 전체 노출의 실제 평균은 1.85% 다.
# 전체   노출 100,000, 클릭 2,000, 전환 60
# 클릭 가중 평균 전환율(클릭 데이터가 보는 값)  3.00%
# 노출 가중 평균 전환율(전체 노출의 실제 평균)  1.85%
#
# 5단계 뜻: 클릭만 보고 배운 (a) 는 클릭이 적은 세그먼트일수록 3.00% 쪽으로 끌려가, 신규 지면에서 참 CVR 0.00% 를 2.40% 로 낸다. ESMM 방식의 (b) 는 신규 지면에서도 0.22% 로 참값에 가깝다.
# 세그먼트           노출  클릭   참CVR  (a)클릭만   (b)ESMM
# 재방문 고관여     5,000   500   5.00%      4.67%     4.99%
# 관심 카테고리    10,000   600   3.00%      3.00%     3.00%
# 일반 사용자      20,000   500   2.00%      2.17%     2.00%
# 신규 사용자      25,000   250   2.00%      2.29%     2.01%
# 저관여 지면      25,000   125   1.60%      2.22%     1.62%
# 신규 지면        15,000    25   0.00%      2.40%     0.22%
# 6단계 뜻: 노출로 가중한 평균 절대오차는 (a) 0.637%p, (b) 0.042%p 로, (b) 가 15.2배 작다.
#
# 노출 가중 평균 절대오차   (a) 0.637%p   (b) 0.042%p
# (b)의 오차가 (a)보다 15.2배 작다
````

#### 블록 2

<!-- cb7 post=multi-task-learning block=1 sha=c5ad22df6d5fb489 -->
````python
# 하는 일: 광고 200개, 노출 10만 건의 가상 데이터로 전환을 직접 배우는 단독 학습과 CTR 에서 배운 표현을 빌려 쓰는 공유를, 클릭과 전환이 같은 방향인 세계 A 와 무관한 세계 B 에서 LogLoss 로 견준다.
import math
import random

random.seed(42)

# 1단계: 광고 200개와 광고별 두 힘을 둔다
# 가상 데이터다. 광고마다 배울 임베딩 값이 1개씩 있으니 배울 파라미터가 200개다. 표준 라이브러리만 쓴다.
ADS, IMPS = 200, 100_000
pull = [random.gauss(0, 1) for _ in range(ADS)]   # 광고별 '클릭을 부르는 힘'
sell = [random.gauss(0, 1) for _ in range(ADS)]   # 광고별 '사게 만드는 힘' (pull과 독립)


# 2단계: 참 클릭률과 두 세계의 참 전환율을 내는 함수를 만든다
# 세계 A(정렬)는 클릭을 잘 받는 광고가 전환도 잘 시키고, 세계 B(상충)는 전환을 잘 시키는 광고가 클릭 성적과 아무 상관이 없다.
def sigmoid(z):
    return 1.0 / (1.0 + math.exp(-max(-30.0, min(30.0, z))))


# 참 모델. 상수(-5.6, -6.8, -5.0)는 클릭 2%, 전환 3%가 나오게 맞춘 값이다.
def true_ctr(ad):
    return sigmoid(2.0 * pull[ad] - 5.6)


WORLDS = {
    "A 정렬": lambda ad: sigmoid(1.8 * pull[ad] - 6.8),   # 클릭과 같은 힘을 본다
    "B 상충": lambda ad: sigmoid(1.8 * sell[ad] - 5.0),   # 클릭과 무관한 힘을 본다
}


# 3단계: 표 칸을 맞추고 LogLoss 를 재는 함수를 만든다
def pad(s, w):
    """한글은 폭 2칸으로 세서 표를 맞춘다."""
    return s + " " * max(0, w - sum(2 if ord(c) > 0x2000 else 1 for c in s))


def logloss(rows, predict):
    tot = 0.0
    for ad, z in rows:
        p = min(max(predict(ad), 1e-9), 1 - 1e-9)
        tot += -(z * math.log(p) + (1 - z) * math.log(1 - p))
    return tot / len(rows)


# 4단계: 광고별 값을 직접 배우는 함수를 만든다
def fit_emb(rows, epochs, lr=0.1, l2=0.002):
    """pXX = sigmoid(e[광고] + b) 를 SGD로 학습한다. 광고별 값 e를 직접 배우는 방식.
    l2는 값이 무한히 커지는 것을 막는 정규화(weight decay)다."""
    e, b = [0.0] * ADS, -3.5
    idx = list(range(len(rows)))
    rnd = random.Random(7)
    for _ in range(epochs):
        rnd.shuffle(idx)
        for i in idx:
            ad, y = rows[i]
            d = sigmoid(e[ad] + b) - y            # BCE 미분은 (예측 - 라벨)로 딱 떨어진다
            e[ad] -= lr * (d + l2 * e[ad])
            b -= lr * d
    return e, b


# 5단계: 공유 표현을 얼리고 2개만 배우는 함수를 만든다
def fit_head(rows, z, steps=300, lr=1.0):
    """공유 표현 z를 얼려 놓고 sigmoid(u*z[광고] + b)의 u, b 2개만 배운다.
    배울 게 200개에서 2개로 줄었으니, 전체 배치 경사하강으로 안정적으로 정해진다."""
    u, b, n = 0.0, -3.5, len(rows)
    for _ in range(steps):
        gu = gb = 0.0
        for ad, y in rows:
            d = sigmoid(u * z[ad] + b) - y
            gu += d * z[ad]
            gb += d
        u -= lr * gu / n
        b -= lr * gb / n
    return u, b


# 6단계: 학습용과 평가용 노출을 10만 건씩 만든다
tr = [(ad, 1 if random.random() < true_ctr(ad) else 0)
      for ad in (random.randrange(ADS) for _ in range(IMPS))]
te = [(ad, 1 if random.random() < true_ctr(ad) else 0)
      for ad in (random.randrange(ADS) for _ in range(IMPS))]
tr_clk = [ad for ad, y in tr if y == 1]
te_clk = [ad for ad, y in te if y == 1]

# 7단계: 공유할 표현을 CTR 태스크로 학습한다
# CTR 태스크를 노출 10만 건에서 학습한다. 이 결과가 '공유할 표현'이다.
# 클릭 2,000건은 CVR 입장에선 적지만, 광고 200개에 10건씩이면 임베딩을 채울 만하다.
ctr_emb, _ = fit_emb(tr, epochs=3)
mu = sum(ctr_emb) / ADS
sd = (sum((v - mu) ** 2 for v in ctr_emb) / ADS) ** 0.5
shared = [(v - mu) / sd for v in ctr_emb]   # 평균 0, 표준편차 1로 맞춰 넘긴다
print(f"노출 {len(tr):,}, 클릭 {len(tr_clk):,}, 광고 {ADS}개 (평가용 클릭 {len(te_clk):,})")

# 8단계: 두 세계에서 네 모델의 LogLoss 를 견준다
# 공유가 정말 이득인지, 어떤 조건에서 그 이득이 사라지는지 본다. 전환 60건쯤으로 200개를 채우면 값 하나하나가 흔들린다. 클릭 2,000건쯤이면 훨씬 단단하다.
for name, p_cvr in WORLDS.items():
    tr_c = [(ad, 1 if random.random() < p_cvr(ad) else 0) for ad in tr_clk]
    te_c = [(ad, 1 if random.random() < p_cvr(ad) else 0) for ad in te_clk]
    rate = sum(z for _, z in tr_c) / len(tr_c)
    solo_e, solo_b = fit_emb(tr_c, epochs=40)   # 전환 60건으로 200개를 직접 배운다
    u, b = fit_head(tr_c, shared)               # 표현은 CTR에서 빌려 온다
    base = logloss(te_c, lambda ad: rate)
    print(f"\n세계 {name} — 학습 데이터 전환 {sum(z for _, z in tr_c)}건 (전환율 {rate:.2%})")
    for label, fn in (("상수 예측(전체 평균)", lambda ad: rate),
                      ("단독 학습(임베딩까지)", lambda ad: sigmoid(solo_e[ad] + solo_b)),
                      ("공유(CTR 표현 고정)", lambda ad: sigmoid(u * shared[ad] + b)),
                      ("이상적 모델(참 확률)", p_cvr)):
        ll = logloss(te_c, fn)
        print("  " + pad(label, 24) + f"LogLoss {ll:.4f}"
              f"   상수 대비 {(ll - base) / base:+6.1%}")

# 출력:
# 7단계 뜻: 학습용 노출 100,000건에서 클릭이 1,994건, 평가용에서 1,983건 나왔다.
# 노출 100,000, 클릭 1,994, 광고 200개 (평가용 클릭 1,983)
# 8단계 뜻: 세계 A 에서는 공유가 상수 대비 -8.5% 로 단독 학습의 -6.8% 보다 낫다. 세계 B 에서는 공유가 +0.1% 로 이득이 없고, 단독 학습이 -11.6% 로 낫다.
#
# 세계 A 정렬 — 학습 데이터 전환 61건 (전환율 3.06%)
#   상수 예측(전체 평균)    LogLoss 0.1165   상수 대비  +0.0%
#   단독 학습(임베딩까지)   LogLoss 0.1085   상수 대비  -6.8%
#   공유(CTR 표현 고정)     LogLoss 0.1066   상수 대비  -8.5%
#   이상적 모델(참 확률)    LogLoss 0.1049   상수 대비  -9.9%
#
# 세계 B 상충 — 학습 데이터 전환 65건 (전환율 3.26%)
#   상수 예측(전체 평균)    LogLoss 0.1357   상수 대비  +0.0%
#   단독 학습(임베딩까지)   LogLoss 0.1200   상수 대비 -11.6%
#   공유(CTR 표현 고정)     LogLoss 0.1359   상수 대비  +0.1%
#   이상적 모델(참 확률)    LogLoss 0.1068   상수 대비 -21.3%
````

#### 블록 3

<!-- cb7 post=multi-task-learning block=2 sha=12b78223b933eb7c -->
````python
# 하는 일: 공유 표현이 숫자 하나뿐인 Shared-Bottom 모델을 태스크 가중치 1:1, 1:5, 5:1 로 학습해, 두 태스크의 LogLoss 가 단독 학습과 얼마나 달라지는지 본다.
import math
import random

random.seed(42)

# 1단계: 피처 수와 두 태스크의 참 모델을 둔다
# 모델은 가장 극단적인 Shared-Bottom 이다. 공유 표현이 숫자 하나 h 뿐이고, 두 태스크는 그 h 를 각자 배율, 절편만 바꿔 쓴다. 표준 라이브러리만 쓴다.
D = 4  # 피처 4개

# 참 모델(가상). x0에서 두 태스크가 정면으로 상충한다 -- CTR엔 +2.0, CVR엔 -1.8.
# '낚시성 크리에이티브'를 숫자로 옮긴 것이다: 누르게는 만들지만 사게는 못 만든다.
W_CTR, B_CTR = [2.0, 1.5, 0.0, 0.0], -2.2   # 노출 기준 클릭 확률
W_CVR, B_CVR = [-1.8, 0.0, 2.0, 0.0], -1.2  # 클릭한 다음의 전환 확률


# 2단계: sigmoid 와 내적 함수를 만든다
def sigmoid(z):
    z = max(-30.0, min(30.0, z))            # overflow 방지
    return 1.0 / (1.0 + math.exp(-z))


def dot(a, b):
    return sum(ai * bi for ai, bi in zip(a, b))


# 3단계: 학습용 노출 4만 건과 평가용 2만 건을 만든다
def make_rows(n):
    """노출 n건. 각 행은 (피처, 클릭여부 y, 전환여부 z).
    z는 '클릭했다면 전환했을까'이고, 실제 관측은 y==1인 행에서만 가능하다."""
    rows = []
    for _ in range(n):
        x = [random.gauss(0, 1) for _ in range(D)]
        y = 1 if random.random() < sigmoid(dot(W_CTR, x) + B_CTR) else 0
        z = 1 if random.random() < sigmoid(dot(W_CVR, x) + B_CVR) else 0
        rows.append((x, y, z))
    return rows


TRAIN, TEST = make_rows(40_000), make_rows(20_000)


# 4단계: 두 손실을 가중해 SGD 로 학습하는 함수를 만든다
# 공유 표현이 하나뿐이니, 두 태스크가 다른 방향을 원하면 반드시 한쪽이 양보해야 한다.
def train(w1, w2, epochs=5, lr=0.02):
    """손실 = w1*CTR손실 + w2*CVR손실 을 SGD로 최소화한다.
    CVR 손실은 클릭이 있었던 행(y==1)에서만 계산된다 -- 실무의 pCVR 학습과 같다."""
    rnd = random.Random(7)                  # 초기값, 셔플을 세 실험에서 똑같이 맞춘다
    ws = [rnd.gauss(0, 0.3) for _ in range(D)]   # 공유 파라미터
    cs = 0.0
    u1, b1 = rnd.gauss(0, 0.3), 0.0         # CTR 타워 (h -> pCTR)
    u2, b2 = rnd.gauss(0, 0.3), 0.0         # CVR 타워 (h -> pCVR)
    order = list(range(len(TRAIN)))
    for _ in range(epochs):
        rnd.shuffle(order)
        for i in order:
            x, y, z = TRAIN[i]
            h = math.tanh(dot(ws, x) + cs)  # 공유 표현 (1차원 병목)
            p1 = sigmoid(u1 * h + b1)
            d1 = w1 * (p1 - y)              # BCE 미분은 (예측 - 라벨)로 딱 떨어진다
            gh = d1 * u1                    # 공유 표현으로 흘러갈 gradient
            d2 = 0.0
            if y == 1:                      # CVR은 클릭된 행에서만 신호가 온다
                p2 = sigmoid(u2 * h + b2)
                d2 = w2 * (p2 - z)
                gh += d2 * u2               # 두 태스크의 gradient가 여기서 합쳐진다
            u1 -= lr * d1 * h
            b1 -= lr * d1
            if y == 1:
                u2 -= lr * d2 * h
                b2 -= lr * d2
            gz = gh * (1.0 - h * h)         # tanh의 미분
            for j in range(D):
                ws[j] -= lr * gz * x[j]
            cs -= lr * gz
    return ws, cs, u1, b1, u2, b2


# 5단계: 태스크별 테스트 LogLoss 를 재는 함수를 만든다
def losses(p):
    """테스트셋 LogLoss를 태스크별로 잰다. 낮을수록 좋다."""
    ws, cs, u1, b1, u2, b2 = p
    l1 = n1 = l2 = n2 = 0.0
    for x, y, z in TEST:
        h = math.tanh(dot(ws, x) + cs)
        q1 = min(max(sigmoid(u1 * h + b1), 1e-12), 1 - 1e-12)
        l1 += -(y * math.log(q1) + (1 - y) * math.log(1 - q1))
        n1 += 1
        if y == 1:
            q2 = min(max(sigmoid(u2 * h + b2), 1e-12), 1 - 1e-12)
            l2 += -(z * math.log(q2) + (1 - z) * math.log(1 - q2))
            n2 += 1
    return l1 / n1, l2 / n2


# 6단계: 단독 학습 기준선과 가중치 셋의 LogLoss 를 견준다
# 이것이 Negative Transfer 를 눈으로 보는 가장 작은 실험이다.
print(f"학습 노출 {len(TRAIN):,}건, 그중 클릭 {sum(r[1] for r in TRAIN):,}건")
solo_ctr = losses(train(1, 0))[0]           # 단독 학습된 CTR 모델
solo_cvr = losses(train(0, 1))[1]           # 단독 학습된 CVR 모델
print(f"단독 학습 기준선   CTR {solo_ctr:.4f}   CVR {solo_cvr:.4f}")
print(f"{'w1:w2':>7}{'CTR LogLoss':>14}{'CVR LogLoss':>14}   단독 대비")
for w1, w2 in [(1, 1), (1, 5), (5, 1)]:
    # 가중치 합을 2로 맞춘다. 안 그러면 가중치를 키운 쪽이 '학습률'까지 같이 커져,
    # 상충 때문에 나빠진 건지 보폭이 커서 나빠진 건지 구분할 수 없다.
    k = 2.0 / (w1 + w2)
    lc, lv = losses(train(w1 * k, w2 * k))
    print(f"{w1}:{w2:<5}{lc:>14.4f}{lv:>14.4f}   "
          f"CTR {lc - solo_ctr:+.4f} / CVR {lv - solo_cvr:+.4f}")

# 출력:
# 6단계 뜻: 단독 학습 기준선은 CTR 0.3370, CVR 0.3061 이다. 1:1 이면 CTR 은 -0.0042 로 조금 좋아지지만 CVR 은 +0.1557 나빠지고, 1:5 는 CVR 손해가 +0.0208 로 줄어드는 대신 CTR 이 +0.0783 나빠진다.
# 학습 노출 40,000건, 그중 클릭 9,454건
# 단독 학습 기준선   CTR 0.3370   CVR 0.3061
#   w1:w2   CTR LogLoss   CVR LogLoss   단독 대비
# 1:1            0.3328        0.4618   CTR -0.0042 / CVR +0.1557
# 1:5            0.4152        0.3269   CTR +0.0783 / CVR +0.0208
# 5:1            0.3439        0.4687   CTR +0.0069 / CVR +0.1626
````

### 부록 6: negative-sampling-bias (블록 7개, Task 3)

#### 블록 1

<!-- cb7 post=negative-sampling-bias block=0 sha=44bffab4bc68d24c -->
````python
# 하는 일: positive 는 모두 두고 negative 만 비율 r 로 뽑는 Random Negative Downsampling 함수를 만들고, CTR 0.2% 인 로그 1,000만 건을 예로 둔다.
import numpy as np

# 1단계: negative 만 비율 r 로 남기는 함수를 만든다
def negative_downsample(labels, features, ratio=0.1, seed=42):
    """Negative 샘플을 ratio 비율로 랜덤 다운샘플링.
    
    Args:
        labels: 클릭 여부 (0 or 1)
        features: 피처 행렬
        ratio: negative 샘플링 비율 (e.g., 0.1 = 10%만 유지)
    Returns:
        샘플링된 (labels, features)
    """
    rng = np.random.RandomState(seed)
    pos_mask = labels == 1
    neg_mask = labels == 0
    
    # Positive 전부 유지
    pos_indices = np.where(pos_mask)[0]
    
    # Negative에서 ratio 비율만 랜덤 추출
    neg_indices = np.where(neg_mask)[0]
    n_keep = int(len(neg_indices) * ratio)
    sampled_neg = rng.choice(neg_indices, size=n_keep, replace=False)
    
    keep = np.concatenate([pos_indices, sampled_neg])
    return labels[keep], features[keep]

# 2단계: CTR 0.2% 인 로그 1,000만 건을 예로 둔다
# negative 를 10% 만 남기면 positive 20,000 + negative 998,000 = 1,018,000행이 남는다. 데이터 크기는 약 10배 줄고, positive 비율은 0.2% 에서 약 2% 로 오른다.
n_total = 10_000_000
n_pos = 20_000    # 0.2%
n_neg = 9_980_000 # 99.8%
````

#### 블록 2

<!-- cb7 post=negative-sampling-bias block=1 sha=88eeb627a1c6365a -->
````python
# 하는 일: negative 를 10% 만 남겨 학습한 모델이 15% 로 예측했을 때, 보정식으로 원래 확률을 되찾는다.
# 1단계: 다운샘플링한 모델의 출력을 원래 확률로 되돌리는 함수를 만든다
def calibrate_downsampling(q, r):
    """Downsampling된 모델 출력 q를 원래 확률 p로 보정.
    
    Args:
        q: 모델 예측 확률 (downsampled 데이터에서 학습)
        r: negative sampling ratio
    Returns:
        p: 보정된 확률
    """
    return q / (q + (1 - q) / r)

# 2단계: r = 0.1 로 학습한 모델이 15% 로 예측한 값을 보정한다
# 15% 를 그대로 쓰면 입찰가가 8.65배 과대 평가된다(0.15 / 0.017341 = 8.65).
r = 0.1  # negative 10%만 사용
q = 0.15 # 모델이 15%로 예측

p = calibrate_downsampling(q, r)
print(f"모델 출력 q = {q:.2%}")
print(f"보정 후   p = {p:.4%}")

# 출력:
# 2단계 뜻: 모델이 낸 15.00% 는 보정하면 1.7341% 다.
# 모델 출력 q = 15.00%
# 보정 후   p = 1.7341%
````

#### 블록 3

<!-- cb7 post=negative-sampling-bias block=2 sha=8e85b8da660c2dee -->
````python
# 하는 일: 진짜 CTR 2.0% 로 만든 가상 로그 50만 행에서 무클릭만 비율 r 로 줄여 학습하고, r 이 1.0, 0.1, 0.01 일 때 평균 예측이 얼마나 부풀고 보정식이 얼마나 되돌리는지 센다.
import random

random.seed(42)  # 시드 고정 — 몇 번 돌려도 같은 숫자가 나오게

# 1단계: 진짜 클릭률을 아는 가상 로그 50만 행을 만든다
# 세그먼트 3개. 오른쪽 숫자가 '진짜 클릭률'이다.
# 우리는 정답을 알고 시작하지만, 모델은 로그만 보고 이 값을 맞혀야 한다.
SEG_CTR = {"morning_mobile": 0.005, "evening_mobile": 0.020, "search_intent": 0.050}

# 노출이 세그먼트에 나뉘는 비중.
# 가중평균이 정확히 2.0%가 되게 잡았다: 0.50*0.5% + 0.25*2.0% + 0.25*5.0% = 2.0%
SEG_SHARE = {"morning_mobile": 0.50, "evening_mobile": 0.25, "search_intent": 0.25}

N = 500_000               # 하루치 노출 로그라고 치자 (가상 데이터)
names = list(SEG_CTR)     # 세그먼트 이름 순서를 한 번 고정해 둔다
shares = [SEG_SHARE[s] for s in names]

# 로그 한 줄 = (세그먼트, 클릭했나 0/1). 실제 impression log를 흉내낸 것.
log = []
for _ in range(N):
    seg = random.choices(names, weights=shares, k=1)[0]  # 이 노출이 난 세그먼트
    y = 1 if random.random() < SEG_CTR[seg] else 0       # 진짜 확률로 클릭 추첨
    log.append((seg, y))

n_click = sum(y for _, y in log)
print(f"원본 로그 {len(log):,}행, 클릭 {n_click:,}건, CTR {n_click / len(log):.2%}")

# 세그먼트별 실제 노출 수. 서빙에서 만나는 트래픽 분포다 — 평균 예측의 가중치로 쓴다.
real_imp = {s: 0 for s in names}
for seg, _ in log:
    real_imp[seg] += 1


# 2단계: negative 만 비율 r 로 남기는 함수를 만든다
def downsample(rows, r, seed=42):
    """클릭은 전부 살리고, 무클릭은 확률 r로만 살린다.
    r=0.1이면 무클릭 10건 중 평균 1건만 학습 데이터에 남는다."""
    rng = random.Random(seed)  # 바깥 난수 상태를 건드리지 않도록 별도 난수기
    return [row for row in rows if row[1] == 1 or rng.random() < r]


# 3단계: 세그먼트별 평균 클릭률을 외우는 모델 함수를 만든다
def fit(rows):
    """세그먼트별 평균 클릭률을 그대로 외우는, 가장 정직한 모델.
    학습 데이터 안에서는 완벽히 보정된 모델이다 — 그런데도 부푼다는 게 이 절의 요점."""
    imp, clk = {}, {}
    for seg, y in rows:                      # 전체를 한 번 훑는다 = 학습 1에폭에 해당
        imp[seg] = imp.get(seg, 0) + 1       # 세그먼트별 노출 수
        clk[seg] = clk.get(seg, 0) + y       # 세그먼트별 클릭 수
    return {s: clk[s] / imp[s] for s in imp}


# 4단계: 보정식과 트래픽 가중 평균 예측 함수를 만든다
# 보정식이 이 글의 핵심 한 줄이다.
def correct(q, r):
    """다운샘플링 데이터로 학습한 예측 q를 원래 확률로 되돌린다."""
    return q / (q + (1 - q) / r)


def avg_pred(model, r=None):
    """실제 트래픽 분포로 가중평균한 평균 예측. r을 주면 보정 후 값."""
    total = sum(real_imp.values())
    return sum(real_imp[s] * (model[s] if r is None else correct(model[s], r))
               for s in names) / total


# 5단계: 샘플링 비율 셋으로 학습해 보정 전후를 나란히 본다
for r in (1.0, 0.1, 0.01):
    train = downsample(log, r)
    model = fit(train)
    train_ctr = sum(y for _, y in train) / len(train)
    print(f"r={r:<5} 행 {len(train):>7,}, 학습셋 CTR {train_ctr:6.2%}"
          f", 보정 전 {avg_pred(model):6.2%}, 보정 후 {avg_pred(model, r):6.2%}")

# 6단계: r = 0.1 에서 세그먼트별로 뜯어본다
model = fit(downsample(log, 0.1))
print("\n[r=0.1] 세그먼트별, 진짜 CTR, 모델 출력, 보정 후")
for s in names:
    q = model[s]
    print(f"  {s:<15} 진짜 {SEG_CTR[s]:6.2%}, 모델 {q:6.2%}, 보정 {correct(q, 0.1):6.2%}")

ratio = avg_pred(model) / avg_pred(model, 0.1)
print(f"\n보정을 빼먹으면 평균 예측이 진짜의 {ratio:.1f}배 → 입찰가도 그만큼 부푼다")

# 출력:
# 1단계 뜻: 가상 로그 500,000행에서 클릭이 9,937건 나와 CTR 이 1.99% 다.
# 원본 로그 500,000행, 클릭 9,937건, CTR 1.99%
# 5단계 뜻: 무클릭을 줄일수록 학습셋 CTR 이 16.86%, 67.05% 로 부풀고 보정 전 평균 예측도 15.14%, 54.43% 로 뜬다. 보정하면 1.98%, 1.96% 로 원래의 1.99% 근처로 돌아온다.
# r=1.0   행 500,000, 학습셋 CTR  1.99%, 보정 전  1.99%, 보정 후  1.99%
# r=0.1   행  58,931, 학습셋 CTR 16.86%, 보정 전 15.14%, 보정 후  1.98%
# r=0.01  행  14,821, 학습셋 CTR 67.05%, 보정 전 54.43%, 보정 후  1.96%
# 6단계 뜻: r = 0.1 이면 세 세그먼트 모두 모델 출력이 진짜의 몇 배로 뜨고, 보정하면 0.49%, 2.05%, 4.88% 로 돌아온다. 보정을 빼먹으면 평균 예측이 진짜의 7.7배다.
#
# [r=0.1] 세그먼트별, 진짜 CTR, 모델 출력, 보정 후
#   morning_mobile  진짜  0.50%, 모델  4.69%, 보정  0.49%
#   evening_mobile  진짜  2.00%, 모델 17.33%, 보정  2.05%
#   search_intent   진짜  5.00%, 모델 33.90%, 보정  4.88%
#
# 보정을 빼먹으면 평균 예측이 진짜의 7.7배 → 입찰가도 그만큼 부푼다
````

#### 블록 4

<!-- cb7 post=negative-sampling-bias block=3 sha=93c7e4c6027758b1 -->
````python
# 하는 일: 지금 학습 중인 모델이 positive 로 착각하는 negative 를 점수 순으로 먼저 뽑고, 나머지는 무작위로 채우는 Hard Negative Mining 함수를 만든다.
def hard_negative_sampling(model, neg_features, neg_labels, k, mix_ratio=0.5):
    """Hard Negative Mining: 모델이 헷갈려하는 negative 우선 추출.
    
    Args:
        model: 현재 학습된 모델
        neg_features: negative 샘플 피처
        neg_labels: negative 샘플 레이블 (모두 0)
        k: 추출할 총 샘플 수
        mix_ratio: hard negative 비율 (나머지는 random)
    Returns:
        선택된 인덱스
    """
    scores = model.predict_proba(neg_features)[:, 1]
    
    n_hard = int(k * mix_ratio)
    n_random = k - n_hard
    
    # 상위 스코어 negative: 모델이 positive로 착각하는 샘플
    hard_indices = np.argsort(scores)[-n_hard:]
    
    # 나머지는 랜덤 (분포 다양성 유지)
    remaining = np.setdiff1d(np.arange(len(neg_labels)), hard_indices)
    random_indices = np.random.choice(remaining, size=n_random, replace=False)
    
    return np.concatenate([hard_indices, random_indices])
````

#### 블록 5

<!-- cb7 post=negative-sampling-bias block=4 sha=1e5e72f528043fa9 -->
````python
# (앞 블록에 이어서 돌린다.)
# 하는 일: propensity 의 역수로 손실을 가중하는 IPS 가중 Cross-Entropy 함수를 만들고, 노출 확률 다섯 개를 예로 둔다.
# 1단계: propensity 의 역수로 가중한 Cross-Entropy 함수를 만든다
def ips_weighted_loss(predictions, labels, propensities, clip_range=(0.01, 1.0)):
    """IPS 가중 Cross-Entropy Loss.
    
    Args:
        predictions: 모델 예측 확률
        labels: 실제 클릭 여부 (0 or 1)
        propensities: 각 샘플의 노출 확률 P(O=1|X)
        clip_range: propensity clipping 범위 (분산 제어)
    Returns:
        가중 평균 loss
    """
    # Propensity Clipping: 극단적 가중치 방지
    clipped = np.clip(propensities, clip_range[0], clip_range[1])
    weights = 1.0 / clipped
    
    # Weighted Cross-Entropy
    eps = 1e-7
    ce = -(labels * np.log(predictions + eps) +
           (1 - labels) * np.log(1 - predictions + eps))
    
    return np.mean(weights * ce)

# 2단계: 노출 확률 다섯 개를 예로 둔다
# 자주 노출되는 0.8 은 가중치 1.25 로 낮추고, 드물게 노출되는 0.02 는 가중치 50 으로 높인다. 가중치가 끝없이 커지지 않게 propensity 는 0.01 아래를 자른다.
# numpy 는 이 글의 첫 블록이 불러온다.
propensities = np.array([0.8, 0.05, 0.3, 0.9, 0.02])
````

#### 블록 6

<!-- cb7 post=negative-sampling-bias block=5 sha=c2d024bf45eda87b -->
````python
# 하는 일: 직접 모델의 기대 손실에, 노출된 샘플의 잔차를 IPS 로 보정해 더하는 Doubly Robust 손실 함수를 만든다.
def doubly_robust_loss(predictions, labels, propensities, 
                       imputed_outcomes, observed_mask):
    """Doubly Robust Loss Estimator.
    
    Args:
        predictions: 현재 모델의 예측 (학습 대상)
        labels: 실제 레이블
        propensities: P(O=1|X)
        imputed_outcomes: 직접 모델의 기대 손실 예측
        observed_mask: 노출 여부 (0 or 1)
    Returns:
        DR loss
    """
    eps = 1e-7
    # 개별 샘플 loss
    ce = -(labels * np.log(predictions + eps) +
           (1 - labels) * np.log(1 - predictions + eps))
    
    # 잔차 = 실제 loss - imputed loss
    residual = ce - imputed_outcomes
    
    # DR = imputed + IPS-corrected residual
    dr = imputed_outcomes + observed_mask / np.clip(propensities, 0.01, 1.0) * residual
    
    return np.mean(dr)
````

#### 블록 7

<!-- cb7 post=negative-sampling-bias block=6 sha=553039aea33d1831 old=run -->
````python
# 하는 일: 세그먼트마다 예측 평균을 실제 평균으로 나눈 P/O Ratio 를 구하고, 1 에서 threshold 넘게 벗어나면 알림을 거는 모니터링 함수를 만든다.
def monitor_po_ratio(predictions, actuals, segments, threshold=0.2):
    """세그먼트별 P/O Ratio 모니터링.
    
    Args:
        predictions: 모델 예측 pCTR
        actuals: 실제 클릭 여부
        segments: 세그먼트 레이블
        threshold: 알림 기준 (|P/O - 1| > threshold)
    Returns:
        세그먼트별 P/O Ratio 및 알림 여부
    """
    results = {}
    for seg in np.unique(segments):
        mask = segments == seg
        p = predictions[mask].mean()
        o = actuals[mask].mean()
        if o > 0:
            po_ratio = p / o
            alert = abs(po_ratio - 1.0) > threshold
            results[seg] = {"P/O": po_ratio, "n": mask.sum(), "alert": alert}
    return results

# 돌려주는 값의 예(가상): mobile_ios(n 2,340,000)는 P/O 1.05 로 알림이 없고, new_publisher(n 12,000)는 1.45 로 과대추정, desktop_win(n 890,000)은 0.72 로 과소추정이라 둘 다 알림이 선다.
````

### 부록 7: audience-segmentation (블록 2개, Task 4)

#### 블록 1

<!-- cb7 post=audience-segmentation block=0 sha=a8afd971bb93159f -->
````python
# (실무 파이프라인 — 그대로 실행되지 않습니다.)
# 하는 일: Two-Tower 의 유저 임베딩을 정규화하고 PCA 로 32차원까지 줄인 뒤, K-Means 와 GMM 으로 세그먼트 8개를 할당하고, GMM 확률로 유저마다 주 세그먼트와 둘째 세그먼트를 적는다.
import numpy as np
from sklearn.cluster import KMeans
from sklearn.mixture import GaussianMixture
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

# 1단계: 유저 임베딩을 읽는다
# Two-Tower User Tower 의 출력이다. 자기 임베딩 파일이 있어야 그대로 돌아간다. K 선택 기준과 라벨 붙이는 순서를 보는 게 이 코드의 목적이다.
user_embeddings = np.load('user_embeddings.npy')  # shape: (N, 128)
user_ids = np.load('user_ids.npy')                # shape: (N,)

# 2단계: 정규화하고 32차원으로 줄인다
scaler = StandardScaler()
X = scaler.fit_transform(user_embeddings)

pca = PCA(n_components=32)
X_reduced = pca.fit_transform(X)
print(f"PCA 누적 설명 분산: {pca.explained_variance_ratio_.sum():.2%}")

# 3단계: K-Means 로 세그먼트를 하나씩 할당한다
# Hard Assignment 다.
kmeans = KMeans(n_clusters=8, random_state=42, n_init=10)
hard_labels = kmeans.fit_predict(X_reduced)

# 4단계: GMM 으로 세그먼트마다 확률을 할당한다
# Soft Assignment 다. 유저마다 세그먼트 8개에 대한 확률 행렬이 나온다.
gmm = GaussianMixture(n_components=8, covariance_type='full', random_state=42)
gmm.fit(X_reduced)
soft_probs = gmm.predict_proba(X_reduced)   # shape: (N, 8) 확률 행렬
primary_labels = gmm.predict(X_reduced)

# 5단계: 세그먼트 테이블을 만든다
# 유저마다 주 세그먼트와 둘째 세그먼트를 확률과 함께 적는다.
segment_records = []
for i, uid in enumerate(user_ids):
    primary_seg = primary_labels[i]
    top2_segs = np.argsort(soft_probs[i])[-2:][::-1]
    top2_probs = soft_probs[i][top2_segs]
    
    segment_records.append({
        'user_id': uid,
        'primary_segment': int(primary_seg),
        'primary_prob': float(top2_probs[0]),
        'secondary_segment': int(top2_segs[1]),
        'secondary_prob': float(top2_probs[1]),
    })
    # → DMP/CDP 또는 Feature Store에 적재
````

#### 블록 2

<!-- cb7 post=audience-segmentation block=1 sha=7167ed859ea4b5b1 -->
````python
# (의사코드 — 그대로 실행되지 않습니다.)
# 하는 일: Kafka 로 들어오는 유저 이벤트마다 규칙 셋을 확인해 실시간 세그먼트를 할당하고 해제하는 Flink CEP 처리 클래스의 구조를 보여 준다.
class SegmentAssigner(ProcessFunction):
    """
    Kafka에서 유저 이벤트를 수신하고,
    규칙 기반으로 실시간 세그먼트를 할당/해제합니다.
    세그먼트 상태는 Redis에 저장되어 Feature Store에서 서빙됩니다.
    """
    
    def process_element(self, event, ctx):
        user_id = event.user_id
        
        # 규칙 1: 최근 1시간 내 3회 이상 검색 → "active_searcher"
        search_count = self.state.get_search_count(user_id, window='1h')
        if event.type == 'search':
            search_count += 1
            self.state.update_search_count(user_id, search_count)
        if search_count >= 3:
            self.emit_segment(user_id, 'active_searcher', ttl=3600)
        
        # 규칙 2: 장바구니 추가 후 10분 내 미구매 → "cart_abandoner_rt"
        if event.type == 'add_to_cart':
            ctx.timer_service().register_event_time_timer(
                event.timestamp + 600_000  # 10분 후 트리거
            )
        
        # 규칙 3: 구매 이벤트 → "converter" 세그먼트 즉시 할당
        if event.type == 'purchase':
            self.emit_segment(user_id, 'converter', ttl=86400 * 30)
            # 장바구니 이탈 타이머가 있으면 취소
            self.cancel_cart_abandon_timer(user_id)
            # cart_abandoner 세그먼트 해제
            self.remove_segment(user_id, 'cart_abandoner_rt')
    
    def on_timer(self, timestamp, ctx):
        """10분 타이머 만료 — 구매 없었으면 cart_abandoner_rt 할당"""
        user_id = ctx.get_current_key()
        if not self.state.has_recent_purchase(user_id, window='10m'):
            self.emit_segment(user_id, 'cart_abandoner_rt', ttl=86400)
````

### 부록 8: lookalike-modeling (블록 2개, Task 4)

#### 블록 1

<!-- cb7 post=lookalike-modeling block=0 sha=fe825ccb2ad0f7fc -->
````python
# 하는 일: 가짜 유저 20만 명의 임베딩에서 전환 유저 3,000명을 서브클러스터 3개로 나누고, 중심점마다 FAISS 로 검색해 Seed 를 뺀 Lookalike 오디언스 50,000명을 뽑는다.
import numpy as np
import faiss
from sklearn.cluster import KMeans

# 1단계: Seed 임베딩을 만든다
# 실전에서는 np.load(...) 로 읽고, 여기서는 재현 가능한 가짜 데이터를 쓴다.
rng = np.random.default_rng(42)
N, DIM, N_SEED = 200_000, 128, 3_000
centers = rng.normal(size=(3, DIM)).astype('float32')      # 숨어 있는 3개 취향 군집
all_embeddings = rng.normal(size=(N, DIM)).astype('float32')
all_embeddings[:12_000] += 2.0 * centers[rng.integers(0, 3, 12_000)]
all_user_ids = np.arange(N)
seed_user_ids = np.arange(N_SEED)                          # 앞 3,000명이 전환 유저
seed_embeddings = all_embeddings[seed_user_ids].copy()

# 2단계: L2 정규화로 cosine 유사도를 내적으로 바꾼다
faiss.normalize_L2(seed_embeddings)
faiss.normalize_L2(all_embeddings)

# 3단계: Multi-Centroid 로 Seed 를 서브클러스터 3개로 나눈다
K_SUB = 3
kmeans_seed = KMeans(n_clusters=K_SUB, random_state=42, n_init=10)
kmeans_seed.fit(seed_embeddings)
centroids = kmeans_seed.cluster_centers_.astype('float32')  # (K, 128)
faiss.normalize_L2(centroids)

# 4단계: FAISS 내적 인덱스를 만든다
dim = all_embeddings.shape[1]
index = faiss.IndexFlatIP(dim)
index.add(all_embeddings)

# 5단계: 중심점마다 ANN 검색을 하고 유저마다 최대 유사도를 남긴다
TOP_K = 50000  # 확장 대상 유저 수
all_scores = np.full(len(all_embeddings), -1.0)

for j in range(K_SUB):
    query = centroids[j:j+1]
    scores, indices = index.search(query, TOP_K)
    for rank in range(TOP_K):
        idx = indices[0][rank]
        score = scores[0][rank]
        all_scores[idx] = max(all_scores[idx], score)

# 6단계: Seed 를 빼고 상위 50,000명을 뽑는다
seed_user_set = set(seed_user_ids)
candidates = [
    (all_user_ids[i], all_scores[i])
    for i in range(len(all_scores))
    if all_scores[i] > 0 and all_user_ids[i] not in seed_user_set
]
candidates.sort(key=lambda x: -x[1])
lookalike_audience = candidates[:TOP_K]

print(f"Lookalike audience size: {len(lookalike_audience)}")
print(f"Top similarity: {lookalike_audience[0][1]:.4f}")
print(f"Bottom similarity: {lookalike_audience[-1][1]:.4f}")

# 출력:
# 6단계 뜻: 확장 대상은 50000명이고, 유사도는 맨 위가 0.9435, 맨 아래가 0.1246 이다.
# Lookalike audience size: 50000
# Top similarity: 0.9435
# Bottom similarity: 0.1246
````

#### 블록 2

<!-- cb7 post=lookalike-modeling block=1 sha=2803316a94c45d7b old=run -->
````python
# 하는 일: 가짜 유저 20만 명과 Seed 3,000명으로 Seed 와 일반 유저를 구분하는 XGBoost 를 학습하고, 전체 유저를 점수 매겨 Seed 를 뺀 상위 10만 명을 Lookalike 로 뽑는다.
import xgboost as xgb
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score

# 1단계: Seed 와 무작위 표본으로 학습 데이터를 만든다
# Seed 는 label=1, 무작위 표본은 label=0 이다. 실전에서는 np.load(...) 로 읽고, 여기서는 재현 가능한 가짜 피처를 쓴다.
np.random.seed(42)
rng = np.random.default_rng(42)
population_features = rng.normal(size=(200_000, 32))  # (n_pop, d)
seed_features = rng.normal(size=(3_000, 32))          # (n_seed, d)
seed_features[:, :8] += 0.8      # 32개 중 8개 피처가 Seed와 일반 유저를 나눈다

# Negative sampling: 1:10 비율 (seed 대비 10배)
n_neg = len(seed_features) * 10
neg_indices = np.random.choice(len(population_features), n_neg, replace=False)
neg_features = population_features[neg_indices]

X = np.vstack([seed_features, neg_features])
y = np.array([1] * len(seed_features) + [0] * n_neg)

X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

# 2단계: XGBoost 를 학습한다
# 50라운드마다 검증 AUC 를 찍고, 20라운드 동안 나아지지 않으면 멈춘다. 돌리는 방식에 따라 마지막 줄이 [82] 로 찍히기도 하지만 학습은 83번째 라운드까지 간다.
dtrain = xgb.DMatrix(X_train, label=y_train)
dval = xgb.DMatrix(X_val, label=y_val)

params = {
    'objective': 'binary:logistic',
    'eval_metric': 'auc',
    'max_depth': 6,
    'learning_rate': 0.1,
    'scale_pos_weight': n_neg / len(seed_features),
    'subsample': 0.8,
    'colsample_bytree': 0.8,
}

model = xgb.train(
    params, dtrain,
    num_boost_round=200,
    evals=[(dval, 'val')],
    early_stopping_rounds=20,
    verbose_eval=50
)

# 3단계: 전체 유저를 점수 매긴다
all_features = population_features
dall = xgb.DMatrix(all_features)
propensity_scores = model.predict(dall)

# 4단계: Seed 를 빼고 상위 10만 명을 뽑는다
top_k = 100000
ranked_indices = np.argsort(-propensity_scores)
seed_index_set = set(range(len(seed_features)))  # Seed 유저 인덱스
lookalike_indices = [i for i in ranked_indices if i not in seed_index_set][:top_k]

print(f"AUC: {roc_auc_score(y_val, model.predict(dval)):.4f}")
print(f"Lookalike top propensity: {propensity_scores[lookalike_indices[0]]:.4f}")

# 출력:
# 2단계 뜻: 검증 AUC 는 0번째 라운드 0.82460 에서 50번째 0.93412 로 오르고, 더 나아지지 않아 83번째 라운드에서 학습이 멈춘다.
# [0]	val-auc:0.82460
# [50]	val-auc:0.93412
# [83]	val-auc:0.93408
# 4단계 뜻: 검증 AUC 는 0.9341 이고, Seed 를 뺀 맨 위 유저의 성향 점수는 0.9900 이다.
# AUC: 0.9341
# Lookalike top propensity: 0.9900
````

### 부록 9: kakao-ads-prediction-targeting (블록 1개, Task 4)

#### 블록 1

<!-- cb7 post=kakao-ads-prediction-targeting block=0 sha=98b834f07ad2e170 -->
````python
# 하는 일: 카카오모먼트의 타겟 방식 6개를 표2의 가상 도달과 전환율로 견주어 가장 정확한 타겟이 총 전환 수로도 최선인지 보고, 예산 2천만 원을 세 전략으로 나눠 총 전환을 견준다.
# 1단계: 타겟 방식 6개의 도달, 전환율, CPM 을 둔다
# 표준 라이브러리만 쓴다.

# 타겟 방식 | 도달 규모(명) | 전환율(CVR) | CPM(노출 1,000명당 비용, 원) - 전부 가상 수치.
targets = [
    ("데모그래픽",    5_000_000, 0.0025,  3_000),
    ("관심사",        1_600_000, 0.0060,  4_000),
    ("유사타겟 10%",  1_400_000, 0.0090,  5_000),
    ("유사타겟 5%",     700_000, 0.0150,  6_500),
    ("유사타겟 1%",     150_000, 0.0320,  9_000),
    ("맞춤타겟",         80_000, 0.0450, 12_000),
]

# 2단계: 타겟마다 다 소진했을 때의 전환 수와 CPA 를 구한다
def full_stats(name, reach, cvr, cpm):
    max_conv = reach * cvr            # 이 타겟을 100% 소진했을 때 전환 수
    max_cost = reach / 1000 * cpm     # 100% 소진에 드는 비용
    cpa = max_cost / max_conv         # 전환 1건당 비용
    return {"name": name, "reach": reach, "cvr": cvr, "cpm": cpm,
            "max_conv": max_conv, "max_cost": max_cost, "cpa": cpa}

stats = [full_stats(*t) for t in targets]

print("[표2 그대로 - 타겟 방식별 총 전환 수와 CPA]")
for s in stats:
    print(f"  {s['name']:<10s} 도달 {s['reach']:>9,}명  전환율 {s['cvr']*100:4.2f}%  "
          f"총전환 {s['max_conv']:>7,.0f}건  CPA {s['cpa']:>7,.1f}원")

# 3단계: CPA 1등과 총전환 1등을 견준다
# (a) 가장 정확한 타겟이 최선인가를 본다. CPA 가 가장 좋은 맞춤타겟과 총 전환이 가장 많은 유사10% 를 견준다.
best_cpa = min(stats, key=lambda s: s["cpa"])
best_volume = max(stats, key=lambda s: s["max_conv"])
print(f"\n[정리] CPA 1등: {best_cpa['name']}(전환 {best_cpa['max_conv']:,.0f}건) "
      f"vs 총전환 1등: {best_volume['name']}(전환 {best_volume['max_conv']:,.0f}건)")

# 4단계: CPA 낮은 순으로 예산을 채우는 그리디 함수를 만든다
# (b) 예산이 고정일 때 최적 조합을 찾는다. 각 타겟의 최대 소진 한도까지 채운다.
def greedy_allocate(stats, budget):
    order = sorted(stats, key=lambda s: s["cpa"])  # 효율(CPA) 좋은 순
    remaining = budget
    total_conv = 0.0
    plan = []
    for s in order:
        if remaining <= 0:
            plan.append((s["name"], 0, 0.0))
            continue
        spend = min(remaining, s["max_cost"])          # 이 타겟에 쓸 돈(한도 내)
        reach_used = spend / (s["cpm"] / 1000)         # 그 돈으로 사는 도달 인원
        conv = reach_used * s["cvr"]
        total_conv += conv
        remaining -= spend
        plan.append((s["name"], spend, conv))
    return plan, total_conv, budget - remaining

# 5단계: 예산 2천만 원으로 그리디 배분을 돌린다
BUDGET = 20_000_000  # 가상의 고정 예산(원)
plan, total_conv, spent = greedy_allocate(stats, BUDGET)

# 6단계: 전략 1, 맞춤타겟에만 몰아준다
print(f"\n[전략 1] 정확도 최우선 - 맞춤타겟에만 예산 {BUDGET:,}원을 몰아준다")
custom = next(s for s in stats if s["name"] == "맞춤타겟")
spend_custom = min(BUDGET, custom["max_cost"])
conv_custom = spend_custom / (custom["cpm"] / 1000) * custom["cvr"]
print(f"  실제로 쓴 돈 {spend_custom:,.0f}원 (나머지 {BUDGET - spend_custom:,.0f}원은 살 사람이 없어 못 씀)")
print(f"  전환 {conv_custom:,.0f}건")

# 7단계: 전략 2, 데모그래픽에만 몰아준다
print(f"\n[전략 2] 도달 최우선 - 데모그래픽에만 예산 {BUDGET:,}원을 몰아준다")
demo = next(s for s in stats if s["name"] == "데모그래픽")
spend_demo = min(BUDGET, demo["max_cost"])
conv_demo = spend_demo / (demo["cpm"] / 1000) * demo["cvr"]
print(f"  실제로 쓴 돈 {spend_demo:,.0f}원 (나머지 {BUDGET - spend_demo:,.0f}원은 도달이 다 차서 못 씀)")
print(f"  전환 {conv_demo:,.0f}건")

# 8단계: 전략 3, 효율순 그리디 배분의 결과를 찍는다
print(f"\n[전략 3] 효율순 그리디 배분 - CPA 낮은 타겟부터 한도까지 채우고 다음으로 넘어간다")
for name, spend, conv in plan:
    print(f"  {name:<10s} 배정 {spend:>11,.0f}원  전환 {conv:>8,.1f}건")
print(f"  -> 총 소진 {spent:,.0f}원 / 예산 {BUDGET:,}원, 총 전환 {total_conv:,.1f}건, "
      f"블렌디드 CPA {spent/total_conv:,.1f}원")

# 출력:
# 2단계 뜻: 타겟을 다 소진하면 총 전환은 유사타겟 10% 가 12,600건으로 가장 많고, CPA 는 맞춤타겟이 266.7원으로 가장 낮다.
# [표2 그대로 - 타겟 방식별 총 전환 수와 CPA]
#   데모그래픽      도달 5,000,000명  전환율 0.25%  총전환  12,500건  CPA 1,200.0원
#   관심사        도달 1,600,000명  전환율 0.60%  총전환   9,600건  CPA   666.7원
#   유사타겟 10%   도달 1,400,000명  전환율 0.90%  총전환  12,600건  CPA   555.6원
#   유사타겟 5%    도달   700,000명  전환율 1.50%  총전환  10,500건  CPA   433.3원
#   유사타겟 1%    도달   150,000명  전환율 3.20%  총전환   4,800건  CPA   281.2원
#   맞춤타겟       도달    80,000명  전환율 4.50%  총전환   3,600건  CPA   266.7원
# 3단계 뜻: CPA 1등인 맞춤타겟은 전환이 3,600건뿐이고, 총전환 1등은 유사타겟 10% 의 12,600건이다.
#
# [정리] CPA 1등: 맞춤타겟(전환 3,600건) vs 총전환 1등: 유사타겟 10%(전환 12,600건)
# 6단계 뜻: 맞춤타겟에만 몰아주면 960,000원만 쓰고 19,040,000원이 남아, 전환이 3,600건에 그친다.
#
# [전략 1] 정확도 최우선 - 맞춤타겟에만 예산 20,000,000원을 몰아준다
#   실제로 쓴 돈 960,000원 (나머지 19,040,000원은 살 사람이 없어 못 씀)
#   전환 3,600건
# 7단계 뜻: 데모그래픽에만 몰아주면 15,000,000원을 쓰고 도달이 다 차서, 전환은 12,500건이다.
#
# [전략 2] 도달 최우선 - 데모그래픽에만 예산 20,000,000원을 몰아준다
#   실제로 쓴 돈 15,000,000원 (나머지 5,000,000원은 도달이 다 차서 못 씀)
#   전환 12,500건
# 8단계 뜻: CPA 낮은 순으로 채우면 예산 20,000,000원을 다 쓰고 총 전환이 40,710.0건, 블렌디드 CPA 가 491.3원이다. 데모그래픽에는 0원이 간다.
#
# [전략 3] 효율순 그리디 배분 - CPA 낮은 타겟부터 한도까지 채우고 다음으로 넘어간다
#   맞춤타겟       배정     960,000원  전환  3,600.0건
#   유사타겟 1%    배정   1,350,000원  전환  4,800.0건
#   유사타겟 5%    배정   4,550,000원  전환 10,500.0건
#   유사타겟 10%   배정   7,000,000원  전환 12,600.0건
#   관심사        배정   6,140,000원  전환  9,210.0건
#   데모그래픽      배정           0원  전환      0.0건
#   -> 총 소진 20,000,000원 / 예산 20,000,000원, 총 전환 40,710.0건, 블렌디드 CPA 491.3원
````

### 부록 10: kakao-ads-products (블록 1개, Task 4)

#### 블록 1

<!-- cb7 post=kakao-ads-products block=0 sha=d0b4959be5e33311 -->
````python
# 하는 일: 비즈보드 한 칸을 두고 겨루는 후보 5개의 eCPM 으로 낙찰자를 뽑고, 1위 광고의 실제 pCTR 이 예측보다 10% 낮았다면 낙찰자가 바뀌고 플랫폼이 얼마를 놓치는지 센다.
# 1단계: 과금방식에 따라 eCPM 을 내는 함수를 만든다
# 표준 라이브러리만 쓴다.
def ecpm(billing, bid, pctr=None):
    """billing이 CPM이면 입찰가 그대로, CPC면 pCTR × 입찰가 × 1000."""
    if billing == "CPM":
        return bid
    if billing == "CPC":
        return pctr * bid * 1000
    raise ValueError(f"알 수 없는 과금방식: {billing}")

# 2단계: 후보 5개의 과금방식, 입찰가, pCTR 을 둔다
# 가상의 예시 숫자다 — 실제 카카오 비즈보드 단가, 낙찰 사례가 아니다.
candidates = [
    {"name": "A(뷰티)",      "billing": "CPM", "bid": 9000, "pctr": None},
    {"name": "B(카드사)",    "billing": "CPC", "bid": 1500, "pctr": 0.016},
    {"name": "C(모바일게임)", "billing": "CPC", "bid": 700,  "pctr": 0.032},
    {"name": "D(이커머스)",  "billing": "CPC", "bid": 900,  "pctr": 0.025},
    {"name": "E(교육앱)",    "billing": "CPC", "bid": 2200, "pctr": 0.009},
]

# 3단계: eCPM 순으로 줄 세우는 함수를 만든다
def rank(cands, pctr_key="pctr"):
    scored = [(c["name"], ecpm(c["billing"], c["bid"], c[pctr_key])) for c in cands]
    return sorted(scored, key=lambda x: x[1], reverse=True)

# 4단계: 예측 pCTR 로 랭킹을 매긴다
# (a) 실시간 서빙이 실제로 쓰는 값이다.
predicted = rank(candidates)
print("[예측 pCTR 기준 랭킹 - 실시간 서빙이 실제로 쓰는 값]")
for i, (name, score) in enumerate(predicted, 1):
    print(f"  {i}위 {name:10s} eCPM {score:8,.0f}원")
print(f"  -> 낙찰자: {predicted[0][0]}\n")

# 5단계: B 의 pCTR 을 실제 값으로 바꿔 다시 매긴다
# (b) 사실 B(카드사)의 진짜 pCTR 은 예측보다 10% 낮았다(모델이 과대예측). 예측 1.6% 가 실제로는 1.6% * 0.9 = 1.44% 다.
true_candidates = [dict(c) for c in candidates]
for c in true_candidates:
    if c["name"] == "B(카드사)":
        c["true_pctr"] = c["pctr"] * 0.9   # 예측보다 10% 낮은 실제값
    else:
        c["true_pctr"] = c["pctr"]

actual = rank(true_candidates, pctr_key="true_pctr")
print("[실제(참값) pCTR 기준 랭킹 - B의 예측이 10% 과대했다고 밝혀진 뒤]")
for i, (name, score) in enumerate(actual, 1):
    print(f"  {i}위 {name:10s} eCPM {score:8,.0f}원")
print(f"  -> '진짜' 승자였어야 할 광고: {actual[0][0]}\n")

# 6단계: 낙찰자가 바뀌었는지와 플랫폼이 놓친 몫을 센다
# 낙찰자가 B 에서 바뀌었는지, 바뀌었다면 플랫폼이 얼마를 손해봤는지 계산한다.
predicted_winner, predicted_top_score = predicted[0]
true_score_of_predicted_winner = next(
    score for name, score in actual if name == predicted_winner
)
true_winner, true_top_score = actual[0]

print("[정리]")
print(f"  예측 기준 낙찰자         : {predicted_winner} (예측 eCPM {predicted_top_score:,.0f}원)")
print(f"  같은 광고의 실제 eCPM    : {true_score_of_predicted_winner:,.0f}원")
print(f"  10% 오차가 드러난 뒤 1위 : {true_winner} (eCPM {true_top_score:,.0f}원)")
loss = true_top_score - true_score_of_predicted_winner
print(f"  플랫폼이 노출 1,000회당 놓친 몫 : {loss:,.0f}원 ({loss / true_top_score:.1%})")
assert predicted_winner != true_winner  # 이 예시는 낙찰자가 바뀌는 경우를 보여주기 위한 것

# 출력:
# 4단계 뜻: 예측 pCTR 로는 B(카드사)가 eCPM 24,000원으로 1위라 낙찰자가 된다. D 와 C 는 22,500원과 22,400원으로 바짝 뒤에 있다.
# [예측 pCTR 기준 랭킹 - 실시간 서빙이 실제로 쓰는 값]
#   1위 B(카드사)     eCPM   24,000원
#   2위 D(이커머스)    eCPM   22,500원
#   3위 C(모바일게임)   eCPM   22,400원
#   4위 E(교육앱)     eCPM   19,800원
#   5위 A(뷰티)      eCPM    9,000원
#   -> 낙찰자: B(카드사)
#
# 5단계 뜻: B 의 pCTR 을 10% 낮추면 B 는 21,600원으로 3위가 되고, D(이커머스)가 22,500원으로 1위에 오른다.
# [실제(참값) pCTR 기준 랭킹 - B의 예측이 10% 과대했다고 밝혀진 뒤]
#   1위 D(이커머스)    eCPM   22,500원
#   2위 C(모바일게임)   eCPM   22,400원
#   3위 B(카드사)     eCPM   21,600원
#   4위 E(교육앱)     eCPM   19,800원
#   5위 A(뷰티)      eCPM    9,000원
#   -> '진짜' 승자였어야 할 광고: D(이커머스)
#
# 6단계 뜻: 플랫폼은 노출 1,000회당 900원, 1위 eCPM 의 4.0% 를 놓친다.
# [정리]
#   예측 기준 낙찰자         : B(카드사) (예측 eCPM 24,000원)
#   같은 광고의 실제 eCPM    : 21,600원
#   10% 오차가 드러난 뒤 1위 : D(이커머스) (eCPM 22,500원)
#   플랫폼이 노출 1,000회당 놓친 몫 : 900원 (4.0%)
````

### 부록 11: kakao-ads-bidding-measurement (블록 2개, Task 4)

#### 블록 1

<!-- cb7 post=kakao-ads-bidding-measurement block=0 sha=b6834b42e039c777 -->
````python
# 하는 일: 하루 예산 100만 원을 아침 소진, 균등 분배, 성과 가중 배분 세 가지로 시간대 6개에 나눠 쓸 때 총 전환 수를 견준다.
# 1단계: 예산, CPC, 시간대별 전환율을 둔다
# 모든 수치는 가상의 예시다(실제 카카오 데이터 아님). 표준 라이브러리만 쓴다.
BUDGET = 1_000_000          # 하루 예산(원) - 가상
CPC = 500                   # 클릭당 비용(원) - 전 시간대 동일하다고 가정(단순화, 가상)

# 4시간 단위 6개 시간대의 전환율(CVR). 저녁(16-20시) 피크, 새벽 저조 - 가상.
dayparts = [
    ("00-04시(심야)", 0.008),
    ("04-08시(새벽)", 0.010),
    ("08-12시(오전)", 0.015),
    ("12-16시(오후)", 0.022),
    ("16-20시(저녁)", 0.026),
    ("20-24시(밤)",   0.018),
]

# 2단계: 배분액으로 총 전환 수를 구하는 함수를 만든다
def total_conversions(alloc):
    """시간대별 배분액(alloc, 원)으로 총 전환 수를 계산."""
    total = 0.0
    for (name, cvr), budget_i in zip(dayparts, alloc):
        clicks = budget_i / CPC
        total += clicks * cvr
    return total

# 3단계: 세 전략의 배분을 만든다
# 배분 방식만 다르고, 총 전환은 같은 함수로 센다.

# 전략 A: 아침에 다 소진 - 00~12시 세 구간에 몰아쓰고 12시 이후는 0
alloc_a = [BUDGET / 3, BUDGET / 3, BUDGET / 3, 0, 0, 0]
# 전략 B: 균등 분배 - 6개 시간대에 똑같이
alloc_b = [BUDGET / 6] * 6
# 전략 C: 성과 좋은 시간대 가중 - CVR에 비례해서 배분
cvr_sum = sum(cvr for _, cvr in dayparts)
alloc_c = [BUDGET * (cvr / cvr_sum) for _, cvr in dayparts]

# 4단계: 전략마다 총 전환을 찍고 가중 배분의 차이를 견준다
for label, alloc in [("아침에 다 소진", alloc_a), ("균등 분배", alloc_b), ("성과 가중 배분", alloc_c)]:
    total = total_conversions(alloc)
    print(f"{label:<12} 총 전환 {total:5.2f}건")

total_a, total_b, total_c = (total_conversions(a) for a in (alloc_a, alloc_b, alloc_c))
print(f"\n가중 배분이 균등 대비 {(total_c/total_b - 1)*100:+.1f}%,"
      f" 아침 소진 대비 {(total_c/total_a - 1)*100:+.1f}%")

# 출력:
# 4단계 뜻: 아침에 다 쓰면 22.00건, 균등 분배는 33.00건, 성과 가중 배분은 37.84건이다. 가중 배분은 균등보다 +14.7%, 아침 소진보다 +72.0% 많다.
# 아침에 다 소진     총 전환 22.00건
# 균등 분배        총 전환 33.00건
# 성과 가중 배분     총 전환 37.84건
#
# 가중 배분이 균등 대비 +14.7%, 아침 소진 대비 +72.0%
````

#### 블록 2

<!-- cb7 post=kakao-ads-bidding-measurement block=1 sha=bd004f5377028f8c -->
````python
# 하는 일: 하루 광고 요청 20만 건에 목표 CPA 를 3,000원, 6,000원, 10,000원, 15,000원으로 걸어 승률, 예산 소진율, 전환 수, 실제 CPA 가 어떻게 움직이는지 시뮬레이션한다.
import random
random.seed(3)

# 1단계: 시장가와 예측 pCVR 분포를 두고 요청 20만 건을 만든다
# 전부 가상의 예시 모델이다. 카카오 실제 자동입찰 알고리즘이 아니라 업계에서 흔히 쓰는 방식을 본떴다. 매 요청마다 이기는 데 필요한 시장가(market clearing price)가 있다고 둔다. 표준 라이브러리만 쓰고 시드를 고정한다.
N = 200_000                      # 하루 광고 요청 수(가상)
MU, SIGMA = 5.0106, 0.5          # 시장가 로그정규분포 파라미터 - 중앙값 약 150원(가상)
CVR_MEAN, CVR_SD = 0.02, 0.003   # 요청별 예측 pCVR 평균/표준편차(가상)

market_price = [random.lognormvariate(MU, SIGMA) for _ in range(N)]
pcvr = [max(0.002, random.gauss(CVR_MEAN, CVR_SD)) for _ in range(N)]

# 2단계: 목표 CPA 하나로 하루를 시뮬레이션하는 함수를 만든다
# 자동입찰은 bid = 목표CPA x 예측 pCVR 로 입찰가를 정한다(2편의 pCVR 예측이 재료). 시장가보다 bid 가 높으면 낙찰이고, 담장 안 자동입찰은 딱 필요한 만큼만 낸다고 가정한다.
def simulate(target_cpa):
    wins = spend = conv = 0.0
    for price, p in zip(market_price, pcvr):
        bid = target_cpa * p           # bid = 목표CPA x pCVR
        if bid >= price:                # 시장가를 넘으면 낙찰
            wins += 1
            spend += price              # 딱 필요한 만큼만 지불(가정)
            conv += p
    return wins, spend, conv

# 3단계: 목표 CPA 넷으로 돌려 표를 찍는다
targets = [3_000, 6_000, 10_000, 15_000]
results = [(t,) + simulate(t) for t in targets]
baseline_spend = results[-1][2]   # 가장 느슨한 시나리오의 지출 = 가상의 예산 기준선

print("목표CPA   승률     예산소진율   전환수     실제CPA")
for target, wins, spend, conv in results:
    print(f"{target:>7,}원  {wins/N:>6.1%}   {spend/baseline_spend:>8.1%}   "
          f"{conv:>7.1f}건   {spend/conv:>9,.0f}원")

# 출력:
# 3단계 뜻: 목표를 3,000원으로 낮추면 승률 3.7%, 예산소진율 1.5% 에 그친다. 15,000원까지 풀면 승률 90.3% 에 예산을 100.0% 쓰지만, 실제 CPA 는 7,405원으로 목표보다 낮다.
# 목표CPA   승률     예산소진율   전환수     실제CPA
#   3,000원    3.7%       1.5%     162.9건       2,469원
#   6,000원   32.9%      22.5%    1378.5건       4,396원
#  10,000원   70.3%      65.7%    2874.9건       6,167원
#  15,000원   90.3%     100.0%    3643.5건       7,405원
````

### 부록 12: doubly-robust (블록 1개, Task 5)

#### 블록 1

<!-- cb7 post=doubly-robust block=0 sha=0ac54c01e430dda8 -->
````python
# 하는 일: 성향점수와 보상 모델이 각각 맞거나 틀린 네 경우를 다 만들어, 400주 동안 DM, IPS, DR 세 추정치의 평균과 편차를 새 정책의 진짜 값과 견준다.
import math, random

# 1단계: 후보 수, 탐색 비율, 온도, 지면 다섯 곳을 둔다
# DR(이중 강건)은 보상 모델과 성향점수 중 하나만 맞아도 값이 산다. (성향점수 맞음/틀림) x (보상 모델 맞음/틀림) 넷을 다 만들어 본다.
K, EPS, TAU = 8, 0.10, 0.0014
SLOTS = [("main_top", 2600, 0.024, 0.044, 0.000), ("search_top", 1400, 0.016, 0.032, 0.003),
         ("feed_mid", 3100, 0.007, 0.018, 0.010), ("feed_low", 2000, 0.004, 0.012, 0.014),
         ("detail_side", 900, 0.003, 0.009, 0.018)]

# 2단계: 지난주 로그를 만드는 함수를 만든다
def build_log(seed=7):                          # 2절과 같은 함수다
    random.seed(seed); log = []
    for name, n, lo, hi, bonus in SLOTS:
        for _ in range(n):
            base = [random.uniform(lo, hi) for _ in range(K)]
            ctr = [b + bonus * (1 if random.random() < 0.2 else 0) for b in base]
            old_s = [b + random.gauss(0, 0.004) for b in base]
            new_s = [c + random.gauss(0, 0.002) for c in ctr]
            m = max(old_s); ex = [math.exp((s - m) / TAU) for s in old_s]; Z = sum(ex)
            p = [(1 - EPS) * (x / Z) + EPS / K for x in ex]
            u, acc, a = random.random(), 0.0, K - 1
            for i, pi in enumerate(p):
                acc += pi
                if u <= acc: a = i; break
            log.append((name, ctr, p, a, 1 if random.random() < ctr[a] else 0,
                        max(range(K), key=lambda i: new_s[i])))
    return log

# 3단계: 노출마다 진짜 성향, 잘못 기록된 성향, 진짜 CTR, 뭉갠 예측을 모은다
MEAN = {n: (lo + hi) / 2 + 0.2 * bonus for n, _, lo, hi, bonus in SLOTS}   # 지면 평균 CTR
pool = []      # (진짜 성향, 잘못 기록된 성향, 진짜 CTR, 지면 평균으로 뭉갠 예측)
for name, ctr, p, a, r, e in build_log():
    soft = (p[e] - EPS / K) / (1 - EPS)                # softmax 성분만 되꺼낸다
    pool.append((p[e], 0.80 * soft + 0.20 / K, ctr[e], MEAN[name]))
N = len(pool)
V = sum(c for _, _, c, _ in pool) / N
DM = {1: sum(c for _, _, c, _ in pool) / N, 0: sum(q for _, _, _, q in pool) / N}

# 4단계: 400주 동안 네 경우마다 IPS 와 DR 을 낸다
est = {(tp, tq): {"ips": [], "dr": []} for tp in (1, 0) for tq in (1, 0)}
for wk in range(400):
    rng = random.Random(1000 + wk)
    rows = [(pe, pw, ce, qm, 1 if rng.random() < ce else 0)
            for pe, pw, ce, qm in pool if rng.random() < pe]     # 겹친 건만 남는다
    for (tp, tq), box in est.items():
        ips = corr = 0.0
        for pe, pw, ce, qm, r in rows:
            ph = pe if tp else pw                                # 우리가 믿는 성향점수
            q = ce if tq else qm                                 # 보상 모델의 예측
            ips += r / ph
            corr += (r - q) / ph                                 # DR은 잔차에 가중한다
        box["ips"].append(ips / N)
        box["dr"].append(DM[tq] + corr / N)

# 5단계: 네 경우의 평균과 편차를 표로 찍는다
def sd(v):
    mu = sum(v) / len(v)
    return (sum((x - mu) ** 2 for x in v) / (len(v) - 1)) ** 0.5

print(f"새 정책의 진짜 값 = {V:.3%}   (400주 평균)\n")
print(f"{'성향점수':<10}{'보상 모델':<12}{'DM':>9}{'IPS':>9}{'DR':>9}{'IPS 편차':>10}{'DR 편차':>10}")
for (tp, tq) in ((1, 1), (1, 0), (0, 1), (0, 0)):
    b = est[(tp, tq)]
    print(f"{'맞음' if tp else '틀림':<10}{'맞음' if tq else '틀림':<12}{DM[tq]:>9.3%}"
          f"{sum(b['ips'])/400:>9.3%}{sum(b['dr'])/400:>9.3%}"
          f"{sd(b['ips']):>10.3%}{sd(b['dr']):>10.3%}")

# 출력:
# 5단계 뜻: 새 정책의 진짜 값은 2.807% 다. DR 은 성향점수와 보상 모델 가운데 하나만 맞아도 2.774% 에서 2.797% 로 진짜 값 가까이 남고, 둘 다 틀리면 2.671% 로 내려간다. 성향점수가 틀리면 IPS 는 2.442% 로 내려간다.
# 새 정책의 진짜 값 = 2.807%   (400주 평균)
#
# 성향점수      보상 모델              DM      IPS       DR    IPS 편차     DR 편차
# 맞음        맞음             2.807%   2.776%   2.775%    0.809%    0.806%
# 맞음        틀림             1.980%   2.776%   2.774%    0.809%    0.805%
# 틀림        맞음             2.807%   2.442%   2.797%    0.526%    0.521%
# 틀림        틀림             1.980%   2.442%   2.671%    0.526%    0.521%
````

### 부록 13: feedback-loop-bias (블록 3개, Task 5)

#### 블록 1

<!-- cb7 post=feedback-loop-bias block=0 sha=fed314b4b9660b99 -->
````python
# 하는 일: 진짜 CTR 을 아는 광고 8개에 첫날 똑같이 500건, 2,000건, 10,000건씩 노출하는 상황을 1,000번씩 되풀이해, 진짜 1위 광고가 관측 CTR 로도 1위에 오르는 비율을 센다.
import random

# 1단계: 광고 8개의 진짜 CTR 을 둔다
# 광고 8개의 '진짜' CTR. 시스템은 이 값을 모른다 — 우리만 안다.
TRUE = {9931: .0260, 9932: .0240, 9933: .0230, 9934: .0220,
        9935: .0210, 9936: .0190, 9937: .0170, 9938: .0150}
ADS = list(TRUE)


# 2단계: 똑같이 노출한 뒤 관측 CTR 로 순위를 매기는 함수를 만든다
def cold_start_rank(rng, n):
    """8개에 n건씩 똑같이 노출한 뒤 관측 CTR 로 순위를 매긴다.
    돌려주는 값은 진짜 1위 광고 9931(=A) 이 몇 위로 추정됐나 다."""
    est = {}
    for ad in ADS:
        clicks = sum(rng.random() < TRUE[ad] for _ in range(n))
        est[ad] = (clicks + 1) / (n + 2)      # 분모가 0이 되지 않게 1과 2를 더한다
    order = sorted(ADS, key=lambda a: -est[a])
    return order.index(9931) + 1


# 3단계: 첫날 노출 수 셋으로 1,000번씩 돌린다
rng = random.Random(7)
for n in (500, 2000, 10000):
    ranks = [cold_start_rank(rng, n) for _ in range(1000)]
    top1 = sum(r == 1 for r in ranks) / 10          # 1000번 중 %
    out4 = sum(r >= 5 for r in ranks) / 10          # 상위 4자리 밖으로 밀린 %
    print('첫날 %5d건 → 1위로 맞힘 %4.1f%%, 5위 밖 %4.1f%%, 평균 순위 %.2f'
          % (n, top1, out4, sum(ranks) / len(ranks)))

# 출력:
# 3단계 뜻: 첫날 500건이면 진짜 1위를 1위로 맞히는 비율이 35.4% 이고 17.4% 는 5위 밖으로 밀린다. 10000건이 되어야 79.2% 를 맞힌다.
# 첫날   500건 → 1위로 맞힘 35.4%, 5위 밖 17.4%, 평균 순위 2.69
# 첫날  2000건 → 1위로 맞힘 50.3%, 5위 밖  6.6%, 평균 순위 2.03
# 첫날 10000건 → 1위로 맞힘 79.2%, 5위 밖  0.1%, 평균 순위 1.28
````

#### 블록 2

<!-- cb7 post=feedback-loop-bias block=1 sha=dbe9824bcde2bdda -->
````python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 어제까지의 로그로 오늘 예산을 정하는 고리를 40세대 돌려, 1, 2, 3, 4, 5, 10, 20, 40세대의 광고 8개 노출 배분, 클릭, 누적 지니를 찍고 진짜 1위 광고가 다시 노출되는지 본다.
import random

# 1단계: 하루 노출, 광고당 상한, 세대 수를 둔다
# 앞 블록의 TRUE, ADS 를 그대로 쓴다.
N, CAP, GENS = 20000, 6000, 40      # 하루 노출, 광고당 하루 상한, 세대 수


# 2단계: 추정 CTR 이 높은 광고부터 상한까지 채우는 함수를 만든다
def allocate(est, total=N):
    """추정 CTR 이 높은 광고부터 상한까지 채운다. 나눠 줄 몫이 떨어지면 끝이다.
    아래로 밀린 광고는 그날 노출이 0건이고, 그래서 로그도 0줄이다."""
    a, left = {ad: 0 for ad in ADS}, total
    for ad in sorted(ADS, key=lambda x: -est[x]):
        a[ad] = min(CAP, left)
        left -= a[ad]
        if left == 0:
            break
    return a


# 3단계: 노출 쏠림을 재는 지니 함수를 만든다
def gini(vals):
    """노출이 한쪽으로 쏠린 정도. 0이면 8개가 똑같이 나눠 가진 상태다."""
    v = sorted(vals)
    n, s = len(v), sum(v)
    return 2 * sum((i + 1) * x for i, x in enumerate(v)) / (n * s) - (n + 1) / n


# 4단계: 고리를 40세대 돌리는 함수를 만든다
def run(seed, mode='기본', eps=0.05, slot=1600, pm=None, pk=None):
    """고리를 40세대 돌린다. mode 가 '기본' 이면 처방 없이 그대로 돈다.
    ε탐색, 강제슬롯, 낙관(pm) 은 처방 글에서 걸어 볼 스위치다."""
    rng = random.Random(seed)
    imps = {ad: 0 for ad in ADS}
    clicks = {ad: 0 for ad in ADS}
    hist = []
    for g in range(1, GENS + 1):
        if g == 1:
            a = {ad: 500 for ad in ADS}                 # 신규 광고는 첫날 500건까지
        else:
            if pm is None:
                est = {ad: (clicks[ad] + 1) / (imps[ad] + 2) for ad in ADS}
            else:   # 낙관: 아직 안 본 광고를 pm(=3.5%) 이라고 우기고 시작한다
                est = {ad: (pm * pk + clicks[ad]) / (pk + imps[ad]) for ad in ADS}
            if mode == 'ε탐색':                      # 8개에 똑같이 흩뿌린다
                per = int(N * eps) // 8
                a = allocate(est, N - per * 8)
                for ad in ADS:
                    a[ad] += per
            elif mode == '강제슬롯':                  # 그날 0건이 된 광고에게만 준다
                a = allocate(est, N - slot)
                out = [ad for ad in ADS if a[ad] == 0]
                for ad in out:
                    a[ad] += slot // len(out)
            else:
                a = allocate(est)                     # 어제까지의 로그로 오늘을 정한다
        got = {ad: sum(rng.random() < TRUE[ad] for _ in range(a[ad])) for ad in ADS}
        for ad in ADS:
            imps[ad] += a[ad]
            clicks[ad] += got[ad]
        hist.append((g, a, got, gini([imps[x] for x in ADS])))
    return hist, imps, clicks


# 5단계: 시드 37 로 40세대를 돌려 세대별 배분을 찍는다
hist, imps, clicks = run(37)
print('세대  배분 9931 9932 9933 9934 9935 9936 9937 9938        클릭   CTR     누적지니')
for g, a, got, gi in hist:
    c = sum(got.values())
    if g in (1, 2, 3, 4, 5, 10, 20, 40):
        print('%3d       %s  %5d  %.3f%%   %.3f'
              % (g, ' '.join('%4d' % a[x] for x in ADS), c, 100 * c / sum(a.values()), gi))
print('40세대째 노출을 받는 광고:', [x for x in ADS if hist[-1][1][x] > 0])
print('9931 누적 노출 %d건, 40세대 누적 클릭 %d건' % (imps[9931], sum(clicks.values())))

# 출력:
# 5단계 뜻: 첫날 똑같이 500건씩 받은 뒤 둘째 날부터 9931 의 노출은 0 이고, 40세대째에는 9932, 9933, 9935, 9936 넷만 노출을 받는다. 9931 은 누적 노출 500건에 머물고, 누적 지니는 0.563 까지 오른다.
# 세대  배분 9931 9932 9933 9934 9935 9936 9937 9938        클릭   CTR     누적지니
#   1        500  500  500  500  500  500  500  500     77  1.925%   0.000
#   2          0 6000 6000    0    0 6000 2000    0    441  2.205%   0.479
#   3          0 6000 6000    0 2000 6000    0    0    421  2.105%   0.511
#   4          0 6000 6000    0 6000 2000    0    0    428  2.140%   0.516
#   5          0 6000 6000    0 2000 6000    0    0    446  2.230%   0.530
#  10          0 6000 6000    0 6000 2000    0    0    444  2.220%   0.543
#  20          0 6000 6000    0 6000 2000    0    0    470  2.350%   0.551
#  40          0 6000 6000    0 6000 2000    0    0    479  2.395%   0.563
# 40세대째 노출을 받는 광고: [9932, 9933, 9935, 9936]
# 9931 누적 노출 500건, 40세대 누적 클릭 17350건
````

#### 블록 3

<!-- cb7 post=feedback-loop-bias block=2 sha=d63c5f3b6d6f6471 -->
````python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 고리가 굳은 로그로 광고 8개를 똑같이 노출했을 때의 평균 CTR 을 되찾을 수 있는지, 로그 그대로와 IPS 가중 두 방법을 윈도우와 처방이 다른 설정 넷에서 시드 30개로 잰다.
import statistics

# 1단계: 진짜 균등 평균 CTR 과 표 칸 너비를 맞추는 함수를 둔다
# 앞 블록의 TRUE, ADS, run 을 그대로 쓴다.
TRUE_MEAN = 100 * sum(TRUE.values()) / 8      # 2.0875% — 8개를 똑같이 노출했을 때의 평균


def pad(s, w):   # 한글은 터미널에서 두 칸을 먹는다 — 표를 맞추려고 센다
    return s + ' ' * max(0, w - sum(2 if ord(c) > 0x2000 else 1 for c in s))


# 2단계: 윈도우 안의 로그로 평균 CTR 을 두 방법으로 재는 함수를 만든다
def measure(hist, window):
    """윈도우(window) 안의 로그만으로 평균 CTR 을 두 가지 방법으로 잰다.
    raw = 클릭 합 ÷ 노출 합. 로그를 그대로 믿는 값이다.
    ips = 광고마다 1/성향점수 로 가중. 성향점수가 0이면 나눌 수가 없어 빠진다."""
    win = hist[-window:] if window else hist
    imps = {ad: sum(a[ad] for _, a, _, _ in win) for ad in ADS}
    clk = {ad: sum(got[ad] for _, _, got, _ in win) for ad in ADS}
    live = [ad for ad in ADS if imps[ad] > 0]         # 성향점수 > 0 인 광고만
    tot = sum(imps.values())
    w = {ad: tot / imps[ad] for ad in live}           # 1 / 성향점수
    raw = 100 * sum(clk.values()) / tot
    ips = (100 * sum(w[ad] * clk[ad] for ad in live)
           / sum(w[ad] * imps[ad] for ad in live))
    return raw, ips, 8 - len(live)


# 3단계: 설정 넷마다 시드 30개로 두 방법을 잰다
print('진짜 균등 평균 CTR %.4f%%' % TRUE_MEAN)
print(pad('설정', 26) + '로그 그대로      IPS 가중        성향점수 0')
for label, kw, win in [('기본, 전체 이력', {}, None),
                       ('기본, 최근 7세대', {}, 7),
                       ('ε탐색 5%, 최근 7세대', {'mode': 'ε탐색'}, 7),
                       ('강제슬롯 8%, 최근 7세대', {'mode': '강제슬롯'}, 7)]:
    raws, ipss, dead = [], [], []
    for seed in range(1, 31):
        r, i, d = measure(run(seed, **kw)[0], win)
        raws.append(r), ipss.append(i), dead.append(d)
    print(pad(label, 26) + '%.3f±%.3f    %.3f±%.3f    %.1f개'
          % (statistics.mean(raws), statistics.pstdev(raws),
             statistics.mean(ipss), statistics.pstdev(ipss), statistics.mean(dead)))

# 출력:
# 3단계 뜻: 진짜 균등 평균은 2.0875% 다. 로그를 그대로 믿으면 어느 설정이든 2.369 에서 2.399 로 진짜보다 높다. IPS 가중은 기본 설정에서 전체 이력이면 1.880 으로 진짜보다 낮고, 최근 7세대면 성향점수 0 인 광고 4.0개가 빠져 2.331 로 진짜보다 높고, ε탐색과 강제슬롯을 걸면 2.085, 2.081 로 진짜 값에 가깝다.
# 진짜 균등 평균 CTR 2.0875%
# 설정                      로그 그대로      IPS 가중        성향점수 0
# 기본, 전체 이력           2.369±0.042    1.880±0.105    0.0개
# 기본, 최근 7세대          2.379±0.052    2.331±0.061    4.0개
# ε탐색 5%, 최근 7세대      2.399±0.039    2.085±0.118    0.0개
# 강제슬롯 8%, 최근 7세대   2.372±0.041    2.081±0.069    0.0개
````

### 부록 14: feedback-loop-remedies (블록 2개, Task 5)

#### 블록 1

<!-- cb7 post=feedback-loop-remedies block=0 sha=068d7febff177590 -->
````python
# (feedback-loop-bias 글의 코드에 이어서 돌린다.)
# 하는 일: 앞 글의 고리를 처방 없이 돌린 기본과 처방 셋(ε탐색 5%, 낙관 초기값, 강제슬롯 8%)을 건 경우를 시드 37 로 40세대씩 돌려, 굳는 세대, 9931 이 돌아오는 세대, 클릭 수, 지니를 견준다.
import random


# 1단계: 표 칸 너비를 맞추는 함수와 굳은 세대, 9931 이 돌아온 세대를 재는 함수를 만든다
# 앞 글의 TRUE, ADS, N, CAP, GENS, allocate, gini, run 을 그대로 쓴다. 그 글의 코드를 먼저 붙여 놓고 아래를 이어 붙이면 그대로 돌아간다.
def pad(s, w):   # 한글은 터미널에서 두 칸을 먹는다 — 표를 맞추려고 센다
    return s + ' ' * max(0, w - sum(2 if ord(c) > 0x2000 else 1 for c in s))


def lock_gen(hist):
    """노출을 받는 광고 집합이 마지막으로 바뀐 세대. 8개 전부가 받으면 '없음'."""
    served = [frozenset(x for x in ADS if a[x] > 0) for _, a, _, _ in hist]
    last = 1
    for i in range(1, len(served)):
        if served[i] != served[i - 1]:
            last = i + 1
    return '없음' if len(served[-1]) == 8 else '%d세대' % last


def revived(hist):
    """9931(=A) 이 처음으로 노출 상위 셋에 든 세대."""
    for g, a, _, _ in hist[1:]:
        if 9931 in sorted(ADS, key=lambda x: -a[x])[:3]:
            return '%d세대' % g
    return '없음'


# 2단계: 기본과 처방 셋으로 시드 37 을 40세대 돌려 견준다
print(pad('처방', 14) + pad('굳음', 10) + pad('9931 복귀', 12)
      + '9931 노출  40세대 클릭  1~5세대 클릭   지니')
for name, kw in [('기본', {}), ('ε탐색 5%', {'mode': 'ε탐색'}),
                 ('낙관 초기값', {'pm': .035, 'pk': 2000}),
                 ('강제슬롯 8%', {'mode': '강제슬롯'})]:
    h, imps, clicks = run(37, **kw)
    first5 = sum(sum(got.values()) for g, a, got, gi in h[:5])
    print(pad(name, 14) + pad(lock_gen(h), 10) + pad(revived(h), 12)
          + '%9d %12d %13d %6.3f'
          % (imps[9931], sum(clicks.values()), first5, h[-1][3]))

# 3단계: 진짜 CTR 을 알고 배분했을 때의 클릭을 센다
rng = random.Random(37)                       # 진짜 CTR 을 처음부터 알았다면
best = allocate(TRUE)                         # 6000, 6000, 6000, 2000 으로 고정 배분
tot = sum(sum(rng.random() < TRUE[ad] for _ in range(500 if g == 1 else best[ad]))
          for g in range(1, GENS + 1) for ad in ADS)
print('참고 — 진짜 CTR 을 알고 배분했다면 40세대 클릭 %d건' % tot)

# 출력:
# 2단계 뜻: 기본은 3세대에 굳고 9931 이 돌아오지 않아, 9931 노출 500건에 40세대 클릭 17350건이다. 처방 셋은 모두 9931 을 되살리고, 40세대 클릭은 18515건에서 18546건 사이, 지니는 0.510 에서 0.522 다.
# 처방          굳음      9931 복귀   9931 노출  40세대 클릭  1~5세대 클릭   지니
# 기본          3세대     없음              500        17350          1813  0.563
# ε탐색 5%      없음      8세대          204375        18541          1844  0.522
# 낙관 초기값   31세대    3세대          222500        18546          1812  0.510
# 강제슬롯 8%   없음      3세대          223300        18515          1914  0.510
# 3단계 뜻: 진짜 CTR 을 알고 배분했다면 40세대 클릭은 18831건이다.
# 참고 — 진짜 CTR 을 알고 배분했다면 40세대 클릭 18831건
````

#### 블록 2

<!-- cb7 post=feedback-loop-remedies block=1 sha=435b1dac044a5c2d -->
````python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 기본과 처방 설정 넷을 시드 100개로 40세대씩 돌려 평균 클릭과 기본보다 나쁜 시드 수를 세고, 기본이 진짜 상위 셋을 맞힌 시드와 틀린 시드에서 ε탐색이 얻고 잃는 것을 나눠 본다.
import statistics

# 1단계: 기본과 처방 설정 넷을 시드 100개로 돌린다
# 앞 블록의 run 과 pad 를 그대로 쓴다. 100번 돌리므로 30초 안팎 걸린다.
res, right, out2, out40 = {}, [], [], []
for name, kw in [('기본', {}), ('ε탐색 5%', {'mode': 'ε탐색'}),
                 ('낙관 초기값', {'pm': .035, 'pk': 2000}),
                 ('강제슬롯 8%', {'mode': '강제슬롯'}),
                 ('강제슬롯 5%', {'mode': '강제슬롯', 'slot': 1000})]:
    c40, c05 = [], []
    for seed in range(1, 101):
        h, imps, clicks = run(seed, **kw)
        c40.append(sum(clicks.values()))
        c05.append(sum(sum(got.values()) for g, a, got, gi in h[:5]))
        if name == '기본':      # 마지막 세대 상위 3이 진짜 상위 3과 같은가
            top3 = sorted(ADS, key=lambda x: -h[-1][1][x])[:3]
            right.append(set(top3) == {9931, 9932, 9933})
            out2.append(h[1][1][9931] == 0)      # 2세대에 9931 이 밀려났나
            out40.append(h[-1][1][9931] == 0)    # 40세대에도 여전히 0건인가
    res[name] = (c40, c05)

# 2단계: 처방마다 평균 클릭과 기본보다 나쁜 시드 수를 찍는다
base = res['기본'][0]
print(pad('처방', 14) + '40세대 클릭  1~5세대 클릭  기본보다 나쁜 시드')
for name, (c40, c05) in res.items():
    worse = sum(1 for i in range(100) if c40[i] < base[i])
    print(pad(name, 14) + '%11.0f %13.0f %13d개'
          % (statistics.mean(c40), statistics.mean(c05), worse))

# 3단계: 9931 이 밀려난 시드와 기본이 맞힌 시드를 나눠 본다
print('9931 이 2세대에 밀려난 시드 %d개, 그중 40세대까지 못 돌아온 시드 %d개'
      % (sum(out2), sum(1 for i in range(100) if out2[i] and out40[i])))
eps = res['ε탐색 5%'][0]
ok = [i for i in range(100) if right[i]]
no = [i for i in range(100) if not right[i]]
print('기본이 진짜 상위 3을 맞힌 시드 %d개, 틀린 시드 %d개' % (len(ok), len(no)))
print('맞힌 시드만: 기본 %.0f → ε탐색 %.0f'
      % (statistics.mean(base[i] for i in ok), statistics.mean(eps[i] for i in ok)))
print('틀린 시드만: 기본 %.0f → ε탐색 %.0f'
      % (statistics.mean(base[i] for i in no), statistics.mean(eps[i] for i in no)))

# 출력:
# 2단계 뜻: 평균으로는 ε탐색 5% 가 18665건으로 기본 18513건보다 많지만, 기본보다 나쁜 시드도 38개다. 강제슬롯 8% 는 평균 18507건으로 기본보다 적다.
# 처방          40세대 클릭  1~5세대 클릭  기본보다 나쁜 시드
# 기본                18513          1938             0개
# ε탐색 5%            18665          1941            38개
# 낙관 초기값         18653          1869            52개
# 강제슬롯 8%         18507          1928            68개
# 강제슬롯 5%         18581          1934            59개
# 3단계 뜻: 9931 이 2세대에 밀려난 시드는 12개이고 그중 6개는 40세대까지 돌아오지 못했다. 기본이 상위 셋을 맞힌 시드 60개에서는 ε탐색이 18754 에서 18738 로 조금 잃고, 틀린 시드 40개에서는 18152 에서 18555 로 크게 얻는다.
# 9931 이 2세대에 밀려난 시드 12개, 그중 40세대까지 못 돌아온 시드 6개
# 기본이 진짜 상위 3을 맞힌 시드 60개, 틀린 시드 40개
# 맞힌 시드만: 기본 18754 → ε탐색 18738
# 틀린 시드만: 기본 18152 → ε탐색 18555
````

### 부록 15: interview-experiment-metrics (블록 5개, Task 6)

#### 블록 1

<!-- cb7 post=interview-experiment-metrics block=0 sha=ba2fa904475e2d08 sep -->
````python
# 하는 일: 기준 CTR 셋과 상대 개선 넷마다 양측 5%, 검정력 80% 로 한 쪽에 필요한 노출 수를 구하고, 하루 노출 200만 건을 반씩 쓸 때 며칠이 걸리는지 센다.
import math

# 1단계: 두 비율의 차이를 잡는 데 필요한 표본 수 함수를 만든다
def 표본수(기준율, 상대개선, 유의수준=0.05, 검정력=0.8):
    z_a = 1.959963985                       # 양측 5%
    z_b = 0.8416212336                      # 검정력 80%
    p1 = 기준율
    p2 = 기준율 * (1 + 상대개선)
    p_bar = (p1 + p2) / 2
    분자 = (z_a * math.sqrt(2 * p_bar * (1 - p_bar)) + z_b * math.sqrt(p1*(1-p1) + p2*(1-p2))) ** 2
    return math.ceil(분자 / (p2 - p1) ** 2)

# 2단계: 기준 CTR 과 개선 폭마다 필요한 노출 수를 찍는다
일일노출 = 2_000_000
print(f"한 쪽에 필요한 노출 수 (유의수준 5%, 검정력 80%)")
print(f"{'기준 CTR':>10}{'+1%':>14}{'+3%':>14}{'+5%':>14}{'+10%':>14}")
for 기준 in (0.002, 0.01, 0.05):
    칸 = "".join(f"{표본수(기준, d):>14,}" for d in (0.01, 0.03, 0.05, 0.10))
    print(f"{기준:>10.1%}{칸}")

# 3단계: 하루 노출을 반씩 쓸 때 걸리는 날수를 찍는다
print(f"\n하루 노출 {일일노출:,}건을 반씩 나눠 쓴다면 (한 쪽 {일일노출//2:,}건/일)")
print(f"{'기준 CTR':>10}{'+1%':>12}{'+3%':>12}{'+5%':>12}{'+10%':>12}")
for 기준 in (0.002, 0.01, 0.05):
    칸 = "".join(f"{표본수(기준, d)/(일일노출/2):>11.1f}일" for d in (0.01, 0.03, 0.05, 0.10))
    print(f"{기준:>10.1%}{칸}")

# 출력:
# 2단계 뜻: 기준 CTR 0.2% 에서 +1% 를 잡으려면 한 쪽에 78,722,689건이 들고, 5.0% 에서 +10% 면 31,234건이다. 기준 CTR 이 낮고 개선 폭이 작을수록 필요한 노출이 크게 는다.
# 한 쪽에 필요한 노출 수 (유의수준 5%, 검정력 80%)
#     기준 CTR           +1%           +3%           +5%          +10%
#       0.2%    78,722,689     8,833,822     3,211,443       822,401
#       1.0%    15,617,696     1,752,389       637,010       163,095
#       5.0%     2,996,698       336,102       122,124        31,234
# 3단계 뜻: 한 쪽에 하루 1,000,000건씩 쓰면 기준 CTR 0.2% 의 +1% 는 78.7일이 걸리고, 5.0% 의 +10% 는 0.0일로 하루 안에 끝난다.
#
# 하루 노출 2,000,000건을 반씩 나눠 쓴다면 (한 쪽 1,000,000건/일)
#     기준 CTR         +1%         +3%         +5%        +10%
#       0.2%       78.7일        8.8일        3.2일        0.8일
#       1.0%       15.6일        1.8일        0.6일        0.2일
#       5.0%        3.0일        0.3일        0.1일        0.0일
````

#### 블록 2

<!-- cb7 post=interview-experiment-metrics block=1 sha=0bc86d8c0651c126 sep -->
````python
# 하는 일: 사용자 2만 명의 실험 전 지출과 실험 중 지출로 실험군이 3% 더 쓰는 효과를 그냥 비교와 CUPED 로 재고, 표준오차가 얼마나 줄어드는지 본다.
import random, statistics

random.seed(5)

# 1단계: 사용자 2만 명의 실험 전 지출과 실험 중 지출을 만든다
N = 20_000
효과 = 0.03                                  # 실험군이 3% 더 쓴다

# 사용자마다 원래 씀씀이가 다르다. 실험 전 지출과 실험 중 지출은 상관이 높다.
전 = [max(0, random.lognormvariate(8, 1.0)) for _ in range(N)]
군 = [i % 2 for i in range(N)]               # 0=대조 1=실험
후 = [t * random.lognormvariate(0, 0.35) * (1 + 효과 if g else 1) for t, g in zip(전, 군)]

# 2단계: 평균 차이와 표준오차로 그냥 비교한다
def 차이(값):
    a = [v for v, g in zip(값, 군) if g == 0]
    b = [v for v, g in zip(값, 군) if g == 1]
    d = statistics.mean(b) - statistics.mean(a)
    se = (statistics.variance(a)/len(a) + statistics.variance(b)/len(b)) ** 0.5
    return d, se

d1, se1 = 차이(후)                            # 그냥 비교

# 3단계: CUPED 로 실험 전 지출이 설명하는 부분을 빼고 비교한다
평균전, 평균후 = statistics.mean(전), statistics.mean(후)
공분산 = sum((x - 평균전) * (y - 평균후) for x, y in zip(전, 후)) / (N - 1)
세타 = 공분산 / statistics.variance(전)
보정후 = [y - 세타 * (x - 평균전) for x, y in zip(전, 후)]
d2, se2 = 차이(보정후)

# 4단계: 두 방법의 차이와 표준오차를 찍는다
상관 = 공분산 / (statistics.stdev(전) * statistics.stdev(후))
print(f"실험 전 지출과 실험 중 지출의 상관 {상관:.2f}")
print(f"{'방법':<12}{'차이':>12}{'표준오차':>12}{'차이/표준오차':>14}")
print(f"{'그냥 비교':<11}{d1:>12,.0f}{se1:>12,.0f}{d1/se1:>14.2f}")
print(f"{'CUPED':<12}{d2:>12,.0f}{se2:>12,.0f}{d2/se2:>14.2f}")
print(f"\n표준오차가 {se1/se2:.1f}배 줄었다. 같은 확신을 얻는 데 필요한 표본이 {(se2/se1)**2:.2f}배로 준다.")

# 출력:
# 4단계 뜻: 실험 전 지출과 실험 중 지출의 상관이 0.91 이라, CUPED 의 표준오차가 45 로 그냥 비교의 107 보다 2.4배 작다. 차이/표준오차도 0.28 에서 3.11 로 올라 효과가 보인다.
# 실험 전 지출과 실험 중 지출의 상관 0.91
# 방법                    차이        표준오차       차이/표준오차
# 그냥 비교                30         107          0.28
# CUPED                139          45          3.11
#
# 표준오차가 2.4배 줄었다. 같은 확신을 얻는 데 필요한 표본이 0.18배로 준다.
````

#### 블록 3

<!-- cb7 post=interview-experiment-metrics block=2 sha=94014bab655d7e2f sep -->
````python
# 하는 일: A 와 B 가 실제로 똑같은 실험을 2만 번 되풀이해, 14일을 다 채우고 한 번만 볼 때와 매일 보다가 유의하면 멈출 때 「차이 있다」고 결론 내는 비율을 견준다.
import random, math

random.seed(99)

# 1단계: 정규 근사로 이항 표본을 뽑는 함수와 p값 함수를 만든다
def 이항(n, p):
    """n 번 시행에서 성공 횟수. n 이 커서 정규 근사를 쓴다 — 한 건씩 돌리면 백 배 느리다."""
    m, s = n * p, math.sqrt(n * p * (1 - p))
    return max(0, min(n, round(random.gauss(m, s))))

def p값(a클릭, a노출, b클릭, b노출):
    p1, p2 = a클릭 / a노출, b클릭 / b노출
    p = (a클릭 + b클릭) / (a노출 + b노출)
    se = math.sqrt(p * (1 - p) * (1 / a노출 + 1 / b노출))
    if se == 0: return 1.0
    z = (p2 - p1) / se
    return 2 * (1 - 0.5 * (1 + math.erf(abs(z) / math.sqrt(2))))

# 2단계: CTR, 하루 노출, 일수를 두고 실험 하나를 돌리는 함수를 만든다
CTR, 하루, 일수 = 0.01, 50_000, 14

def 한실험(엿보기):
    a = b = 0
    for 날 in range(1, 일수 + 1):
        a += 이항(하루, CTR)
        b += 이항(하루, CTR)          # A 와 B 는 실제로 똑같다
        if 엿보기 and p값(a, 하루*날, b, 하루*날) < 0.05:
            return True               # "유의하다!" 하고 멈춘다
    return (not 엿보기) and p값(a, 하루*일수, b, 하루*일수) < 0.05

# 3단계: 두 방식으로 2만 번씩 실험한다
반복 = 20_000
끝까지 = sum(한실험(False) for _ in range(반복))
엿보며 = sum(한실험(True) for _ in range(반복))

print(f"A 와 B 가 실제로 똑같을 때, {반복:,}번 실험해서 '차이 있다'고 결론 낸 비율")
print(f"  {'14일 다 채우고 한 번만 본다':<28}{끝까지/반복:>8.1%}")
print(f"  {'매일 보다가 유의하면 멈춘다':<28}{엿보며/반복:>8.1%}")
print("\n둘 다 진짜 차이는 0인데, 매일 엿본 쪽은 헛것을 볼 확률이 몇 배로 뛴다.")

# 출력:
# 3단계 뜻: 14일을 다 채우고 한 번만 보면 「차이 있다」고 결론 내는 비율이 5.0% 로 유의수준 그대로지만, 매일 보다가 멈추면 21.6% 로 뛴다.
# A 와 B 가 실제로 똑같을 때, 20,000번 실험해서 '차이 있다'고 결론 낸 비율
#   14일 다 채우고 한 번만 본다               5.0%
#   매일 보다가 유의하면 멈춘다                21.6%
#
# 둘 다 진짜 차이는 0인데, 매일 엿본 쪽은 헛것을 볼 확률이 몇 배로 뛴다.
````

#### 블록 4

<!-- cb7 post=interview-experiment-metrics block=3 sha=a8ebdd5fb0fec3c0 sep -->
````python
# 하는 일: A 와 B 가 실제로 똑같을 때 지표를 1개, 5개, 10개, 20개 동시에 보면 하나라도 유의하게 나올 확률을 2만 번 실험으로 세고 이론값과 견준다.
import random, math

random.seed(2026)

# 1단계: 이항 표본 함수와 p값 함수를 만든다
def 이항(n, p):
    m, s = n * p, math.sqrt(n * p * (1 - p))
    return max(0, min(n, round(random.gauss(m, s))))

def p값(a, b, n):
    p1, p2 = a / n, b / n
    p = (a + b) / (2 * n)
    se = math.sqrt(p * (1 - p) * 2 / n)
    if se == 0: return 1.0
    z = (p2 - p1) / se
    return 2 * (1 - 0.5 * (1 + math.erf(abs(z) / math.sqrt(2))))

# 2단계: 한 쪽 노출 수, CTR, 반복 수를 두고 지표 여러 개 가운데 하나라도 유의한지 보는 함수를 만든다
N, CTR, 반복 = 20_000, 0.01, 20_000

def 하나라도(지표수):
    return any(p값(이항(N, CTR), 이항(N, CTR), N) < 0.05 for _ in range(지표수))

# 3단계: 지표 수마다 2만 번 실험해 이론값과 견준다
print("A 와 B 가 실제로 똑같은데, 지표를 여러 개 보면")
print(f"{'동시에 보는 지표 수':>18}{'하나라도 유의할 확률':>22}{'이론값':>10}")
for k in (1, 5, 10, 20):
    친것 = sum(하나라도(k) for _ in range(반복))
    print(f"{k:>18}{친것/반복:>20.1%}{1 - 0.95**k:>10.1%}")
print("\n진짜 차이가 하나도 없는데도, 지표를 20개 보면 열에 여섯 번은 뭔가 유의하게 나온다.")

# 출력:
# 3단계 뜻: 지표 하나면 4.9% 로 이론값 5.0% 에 가깝고, 20개를 보면 64.7% 로 이론값 64.2% 에 가까워 열에 여섯 번은 뭔가 유의하게 나온다.
# A 와 B 가 실제로 똑같은데, 지표를 여러 개 보면
#        동시에 보는 지표 수           하나라도 유의할 확률       이론값
#                  1                4.9%      5.0%
#                  5               22.6%     22.6%
#                 10               40.3%     40.1%
#                 20               64.7%     64.2%
#
# 진짜 차이가 하나도 없는데도, 지표를 20개 보면 열에 여섯 번은 뭔가 유의하게 나온다.
````

#### 블록 5

<!-- cb7 post=interview-experiment-metrics block=4 sha=c5c1619979f3ead1 sep -->
````python
# 하는 일: 디스플레이, 동영상, 디스플레이, 검색광고로 이어진 여정의 전환 한 건(10만 원)을 어트리뷰션 규칙 넷(마지막 클릭, 첫 클릭, 균등 배분, 시간 가중)으로 나눠 매체마다 받는 몫을 견준다.
# 1단계: 클릭 여정과 전환값을 둔다
여정 = [
    ("디스플레이", 1), ("동영상", 3), ("디스플레이", 5), ("검색광고", 9),   # 클릭 시점(일)
]
전환값 = 100_000

# 2단계: 마지막 클릭, 첫 클릭, 균등 배분 규칙을 만든다
규칙 = {}
규칙["마지막 클릭"] = {여정[-1][0]: 전환값}
규칙["첫 클릭"]     = {여정[0][0]: 전환값}
균등 = {}
for 매체, _ in 여정:
    균등[매체] = 균등.get(매체, 0) + 전환값 / len(여정)
규칙["균등 배분"] = 균등

# 3단계: 시간 가중 규칙을 만든다
# 전환에 가까울수록 크게 준다. 반감기는 3일이다.
반감기 = 3.0
가중 = [0.5 ** ((여정[-1][1] - t) / 반감기) for _, t in 여정]
합 = sum(가중)
시간 = {}
for (매체, _), w in zip(여정, 가중):
    시간[매체] = 시간.get(매체, 0) + 전환값 * w / 합
규칙["시간 가중"] = 시간

# 4단계: 네 규칙의 몫을 매체별로 찍는다
매체들 = ["디스플레이", "동영상", "검색광고"]
print("전환 한 건(10만원)을 네 규칙으로 나눠 본다")
print(f"{'규칙':<14}" + "".join(f"{m:>12}" for m in 매체들))
for 이름, 배분 in 규칙.items():
    print(f"{이름:<13}" + "".join(f"{배분.get(m, 0):>12,.0f}" for m in 매체들))

print("\n같은 전환인데 검색광고 몫이 0원에서 10만원까지 달라진다.")
print("규칙을 바꾸면 어느 매체에 예산을 더 줄지가 통째로 바뀐다.")

# 출력:
# 4단계 뜻: 같은 전환 한 건인데 검색광고 몫이 마지막 클릭에서는 100,000, 첫 클릭에서는 0, 시간 가중에서는 55,422 다.
# 전환 한 건(10만원)을 네 규칙으로 나눠 본다
# 규칙                   디스플레이         동영상        검색광고
# 마지막 클릭                  0           0     100,000
# 첫 클릭              100,000           0           0
# 균등 배분              50,000      25,000      25,000
# 시간 가중              30,723      13,855      55,422
#
# 같은 전환인데 검색광고 몫이 0원에서 10만원까지 달라진다.
# 규칙을 바꾸면 어느 매체에 예산을 더 줄지가 통째로 바뀐다.
````

### 부록 16: interview-ml-modeling (블록 4개, Task 6)

#### 블록 1

<!-- cb7 post=interview-ml-modeling block=0 sha=634360c505f1ee95 sep -->
````python
# 하는 일: CTR 0.2% 인 노출 10만 건에서 전부 안 누른다고 답하는 모델 A 와 실제로 구분하는 모델 B 의 정확도를 견준다.
import random

random.seed(20260815)

# 1단계: 노출 10만 건의 클릭 라벨을 만든다
N = 100_000
CTR = 0.002                                    # 0.2% — 광고에서 흔한 값

라벨 = [1 if random.random() < CTR else 0 for _ in range(N)]
클릭수 = sum(라벨)

# 2단계: 두 모델의 예측을 만든다
예측A = [0.0] * N                              # 무조건 "안 누른다"
예측B = [min(0.999, max(0.001, (0.006 if y else 0.0015) + random.gauss(0, 0.001))) for y in 라벨]

# 3단계: 임계값 0.5 로 두 모델의 정확도를 견준다
# B 의 예측값은 모두 0.5 보다 작아서, B 도 전부 안 누른다고 답한 것과 같아진다.
def 정확도(pred):
    return sum((p >= 0.5) == (y == 1) for p, y in zip(pred, 라벨)) / N

print(f"노출 {N:,}건, 클릭 {클릭수:,}건 ({클릭수/N:.3%})")
print(f"{'모델':<26}{'정확도':>10}")
print(f"{'A: 전부 안 누른다고 답':<24}{정확도(예측A):>10.4%}")
print(f"{'B: 실제로 구분하는 모델':<24}{정확도(예측B):>10.4%}")
print("\n둘 다 99.8% 다. 정확도로는 두 모델을 나눌 수 없다.")

# 출력:
# 3단계 뜻: 클릭이 202건(0.202%)뿐이라 전부 안 누른다고 답해도 정확도가 99.7980% 이고, B 도 같은 99.7980% 다. 정확도로는 두 모델을 나눌 수 없다.
# 노출 100,000건, 클릭 202건 (0.202%)
# 모델                               정확도
# A: 전부 안 누른다고 답            99.7980%
# B: 실제로 구분하는 모델            99.7980%
#
# 둘 다 99.8% 다. 정확도로는 두 모델을 나눌 수 없다.
````

#### 블록 2

<!-- cb7 post=interview-ml-modeling block=1 sha=21e7f012f122173c sep -->
````python
# 하는 일: CTR 0.2% 인 노출 50만 건에서 안 누른 건을 5% 만 남기면 CTR 이 몇 배로 부푸는지 보고, 되돌리는 공식으로 원래 CTR 을 되찾는다.
import random

random.seed(7)

# 1단계: 노출 50만 건의 클릭 라벨을 만든다
N, CTR = 500_000, 0.002
라벨 = [1 if random.random() < CTR else 0 for _ in range(N)]
클릭 = sum(라벨)
비클릭 = N - 클릭

# 2단계: 안 누른 건을 5% 만 남기고 CTR 을 견준다
r = 0.05                                    # 안 누른 건을 5% 만 남긴다
남긴비클릭 = int(비클릭 * r)
샘플크기 = 클릭 + 남긴비클릭

원래CTR = 클릭 / N
샘플CTR = 클릭 / 샘플크기

print(f"원본      노출 {N:>9,}  클릭 {클릭:>6,}  CTR {원래CTR:.4%}")
print(f"5% 샘플링 노출 {샘플크기:>9,}  클릭 {클릭:>6,}  CTR {샘플CTR:.4%}")
print(f"→ 샘플에서 CTR 이 {샘플CTR/원래CTR:.1f}배로 부푼다\n")

# 3단계: 샘플에서 낸 값을 되돌리는 함수로 원래 CTR 을 되찾는다
def 되돌리기(p, r):
    return p / (p + (1 - p) / r)

print(f"{'샘플에서 모델이 낸 값':>20}{'그대로 쓰면':>12}{'되돌리면':>12}")
for p in (0.01, 0.03, 0.05, 0.1):
    print(f"{p:>20.3f}{p:>12.4f}{되돌리기(p, r):>12.4f}")

print(f"\n샘플 평균 {샘플CTR:.4f} 를 되돌리면 {되돌리기(샘플CTR, r):.5f}, 원래 CTR {원래CTR:.5f}")
print("두 값이 같다 — 공식이 맞다는 뜻이다.")

# 출력:
# 2단계 뜻: 원본 CTR 0.2010% 가 5% 샘플링 뒤에는 3.8722% 로, 19.3배 부푼다.
# 원본      노출   500,000  클릭  1,005  CTR 0.2010%
# 5% 샘플링 노출    25,954  클릭  1,005  CTR 3.8722%
# → 샘플에서 CTR 이 19.3배로 부푼다
#
# 3단계 뜻: 샘플에서 0.010 을 낸 모델은 되돌리면 0.0005 다. 샘플 평균 0.0387 을 되돌린 0.00201 이 원래 CTR 0.00201 과 같다.
#         샘플에서 모델이 낸 값      그대로 쓰면        되돌리면
#                0.010      0.0100      0.0005
#                0.030      0.0300      0.0015
#                0.050      0.0500      0.0026
#                0.100      0.1000      0.0055
#
# 샘플 평균 0.0387 를 되돌리면 0.00201, 원래 CTR 0.00201
# 두 값이 같다 — 공식이 맞다는 뜻이다.
````

#### 블록 3

<!-- cb7 post=interview-ml-modeling block=2 sha=11c8743ecb33f1c7 sep -->
````python
# 하는 일: 노출 20만 건에서 평균값만 답하는 모델 A, 구분도 하고 값도 맞는 모델 B, B 와 순위는 같고 값만 3배인 모델 C 를 AUC, 로그로스, COPC 로 견준다.
import random, math, bisect

random.seed(20260815)
N = 200_000

# 1단계: 노출마다 진짜 클릭 확률과 라벨을 만든다
# 노출마다 "진짜 클릭 확률"이 있고, 라벨은 그 확률로 뽑힌다.
진짜 = [min(0.05, max(0.0002, random.lognormvariate(-6.4, 0.9))) for _ in range(N)]
라벨 = [1 if random.random() < p else 0 for p in 진짜]
평균 = sum(라벨) / N

# 2단계: 세 모델의 예측을 만든다
예측A = [평균] * N                                              # 전부 평균값만 답한다
예측B = [min(0.5, max(1e-5, p * math.exp(random.gauss(0, 0.35)))) for p in 진짜]
예측C = [min(0.9, p * 3) for p in 예측B]                        # B 와 순위는 같고 값만 3배

# 3단계: AUC, 로그로스, COPC 함수를 만든다
def auc(pred):
    양 = sorted(p for p, y in zip(pred, 라벨) if y == 1)
    음 = sorted(p for p, y in zip(pred, 라벨) if y == 0)
    합 = 0.0
    for p in 양:
        아래 = bisect.bisect_left(음, p)
        같음 = bisect.bisect_right(음, p) - 아래
        합 += 아래 + 같음 / 2
    return 합 / (len(양) * len(음))

def 로그로스(pred):
    return -sum(math.log(p) if y else math.log(1 - p) for p, y in zip(pred, 라벨)) / N

def copc(pred):
    return sum(라벨) / sum(pred)

# 4단계: 세 모델을 세 지표로 견준다
print(f"노출 {N:,}건, 클릭 {sum(라벨):,}건 ({평균:.3%})")
print(f"{'모델':<30}{'AUC':>8}{'로그로스':>12}{'COPC':>9}")
for 이름, p in (("A: 평균값만 답한다", 예측A),
                ("B: 구분도 하고 값도 맞다", 예측B),
                ("C: B 와 순위 같고 값만 3배", 예측C)):
    print(f"{이름:<28}{auc(p):>8.4f}{로그로스(p):>12.5f}{copc(p):>9.3f}")

print("\nCOPC = 실제 클릭 ÷ 예측 합. 1 이면 잘 맞고, 1 보다 작으면 과대예측이다.")
print("C 는 AUC 가 B 와 똑같은데 COPC 만 어긋났다 — 줄 세우기는 같고 값이 틀렸다.")

# 출력:
# 4단계 뜻: 클릭률 0.251% 인 노출 200,000건에서 B 와 C 는 AUC 가 0.7180 으로 똑같지만, COPC 는 B 가 0.952, C 가 0.317 이고 로그로스도 C 가 0.01922 로 가장 나쁘다.
# 노출 200,000건, 클릭 501건 (0.251%)
# 모델                                 AUC        로그로스     COPC
# A: 평균값만 답한다                   0.5000     0.01751    1.000
# B: 구분도 하고 값도 맞다               0.7180     0.01667    0.952
# C: B 와 순위 같고 값만 3배            0.7180     0.01922    0.317
#
# COPC = 실제 클릭 ÷ 예측 합. 1 이면 잘 맞고, 1 보다 작으면 과대예측이다.
# C 는 AUC 가 B 와 똑같은데 COPC 만 어긋났다 — 줄 세우기는 같고 값이 틀렸다.
````

#### 블록 4

<!-- cb7 post=interview-ml-modeling block=3 sha=619d7aaf9a5b4cb1 sep -->
````python
# 하는 일: 날마다 인기 소재가 바뀌는 30일치 로그 6만 건에서 「그 날 그 소재의 CTR」 피처를 쓸 때, 무작위로 나눈 검증과 날짜로 나눈 검증의 AUC 를 견준다.
import random, bisect

random.seed(11)
N = 60_000                                   # 30일치, 하루 2,000건

# 1단계: AUC 함수를 만든다
def auc(pred, 라벨):
    양 = sorted(p for p, y in zip(pred, 라벨) if y == 1)
    음 = sorted(p for p, y in zip(pred, 라벨) if y == 0)
    합 = 0.0
    for p in 양:
        아래 = bisect.bisect_left(음, p); 같음 = bisect.bisect_right(음, p) - 아래
        합 += 아래 + 같음 / 2
    return 합 / (len(양) * len(음))

# 2단계: 날마다 인기 소재가 바뀌는 로그 6만 건을 만든다
데이터 = []
for i in range(N):
    날 = i // 2000
    소재 = random.randrange(50)
    인기 = (소재 == (날 * 7) % 50)
    데이터.append((날, 소재, 1 if random.random() < (0.20 if 인기 else 0.03) else 0))

# 3단계: 그 날 그 소재의 CTR 표를 학습하는 함수를 만든다
# 피처는 "그 날 그 소재의 CTR" 이다. 실무에서 흔히 쓰는 일자별 통계다.
def 학습(train):
    표 = {}
    for 날, 소재, y in train:
        n, c = 표.get((날, 소재), (0, 0))
        표[(날, 소재)] = (n + 1, c + y)
    평균 = sum(y for _, _, y in train) / len(train)
    return {k: (c + 20 * 평균) / (n + 20) for k, (n, c) in 표.items()}, 평균

# 4단계: 무작위로 8:2 로 나눠 검증한다
섞은것 = 데이터[:]
random.shuffle(섞은것)
경계 = int(N * 0.8)
표1, 평균1 = 학습(섞은것[:경계])
검증1 = 섞은것[경계:]
a1 = auc([표1.get((d, s), 평균1) for d, s, _ in 검증1], [y for _, _, y in 검증1])

# 5단계: 날짜로 24일과 6일로 나눠 검증한다
앞 = [d for d in 데이터 if d[0] < 24]
뒤 = [d for d in 데이터 if d[0] >= 24]
표2, 평균2 = 학습(앞)
a2 = auc([표2.get((d, s), 평균2) for d, s, _ in 뒤], [y for _, _, y in 뒤])

# 6단계: 두 검증 AUC 를 견준다
print(f"피처: 그 날 그 소재의 CTR")
print(f"{'나누는 방법':<24}{'검증 AUC':>10}")
print(f"{'무작위로 8:2':<23}{a1:>10.4f}")
print(f"{'날짜로 24일 / 6일':<22}{a2:>10.4f}")
print(f"\n같은 데이터, 같은 코드인데 {a1-a2:.3f} 만큼 벌어진다.")
print("무작위로 나누면 검증에 쓸 날의 통계가 학습에 들어간다 — 답을 미리 본 셈이다.")
print("서비스에서는 오늘 통계를 오늘 쓸 수 없으니, 실제 성능은 아래쪽에 가깝다.")

# 출력:
# 6단계 뜻: 무작위로 나누면 검증 AUC 가 0.5576 이지만 날짜로 나누면 0.5000 이라 0.058 만큼 벌어진다. 무작위 분할은 검증에 쓸 날의 통계를 학습에서 미리 본 셈이다.
# 피처: 그 날 그 소재의 CTR
# 나누는 방법                      검증 AUC
# 무작위로 8:2                   0.5576
# 날짜로 24일 / 6일              0.5000
#
# 같은 데이터, 같은 코드인데 0.058 만큼 벌어진다.
# 무작위로 나누면 검증에 쓸 날의 통계가 학습에 들어간다 — 답을 미리 본 셈이다.
# 서비스에서는 오늘 통계를 오늘 쓸 수 없으니, 실제 성능은 아래쪽에 가깝다.
````

### 부록 17: interview-system-design (블록 3개, Task 6)

#### 블록 1

<!-- cb7 post=interview-system-design block=0 sha=0a7289b4f3fbb2ab sep -->
````python
# 하는 일: 광고 응답 예산 100ms 를 네트워크 왕복과 여섯 단계가 얼마씩 쓰는지 누적해 보고, 모델 추론을 두 배로 무겁게 해도 예산 안에 드는지 본다.
# 1단계: 예산, 단계별 시간, 네트워크 왕복을 둔다
예산 = 100                                    # 광고 응답 전체에 주어진 시간(ms)

단계 = [
    ("요청 파싱, 검증",        2),
    ("후보 광고 가져오기",     12),
    ("피처 조회",             25),
    ("모델 추론",             18),
    ("입찰가 계산, 경매",       8),
    ("응답 만들기",            3),
]
네트워크 = 15                                  # 앞뒤 왕복

# 2단계: 단계마다 누적 시간과 남은 예산을 찍는다
쓴것 = sum(t for _, t in 단계) + 네트워크
print(f"{'단계':<20}{'ms':>6}{'누적':>8}{'남은 예산':>10}")
누적 = 네트워크
print(f"{'네트워크 왕복':<19}{네트워크:>6}{누적:>8}{예산-누적:>10}")
for 이름, t in 단계:
    누적 += t
    print(f"{이름:<19}{t:>6}{누적:>8}{예산-누적:>10}")

# 3단계: 합계와 가장 큰 몫을 찍는다
print(f"\n합계 {쓴것}ms, 예산 {예산}ms, 여유 {예산-쓴것}ms")
print(f"가장 큰 몫은 피처 조회 {단계[2][1]}ms 로 전체의 {단계[2][1]/쓴것:.0%} 다.")

# 4단계: 모델을 두 배로 무겁게 했을 때 여유를 본다
print("\n같은 예산에서 모델을 두 배 무겁게 하려면(18 → 36ms)")
남는여유 = 예산 - (쓴것 + 18)
print(f"  여유가 {예산-쓴것}ms 에서 {남는여유}ms 가 된다 — {'가능' if 남는여유 >= 0 else '불가능, 다른 데서 줄여야 한다'}")

# 출력:
# 2단계 뜻: 네트워크 왕복 15ms 부터 응답 만들기까지 쌓으면 83ms 를 쓰고 17ms 가 남는다.
# 단계                      ms      누적     남은 예산
# 네트워크 왕복                15      15        85
# 요청 파싱, 검증               2      17        83
# 후보 광고 가져오기             12      29        71
# 피처 조회                  25      54        46
# 모델 추론                  18      72        28
# 입찰가 계산, 경매              8      80        20
# 응답 만들기                  3      83        17
# 3단계 뜻: 합계 83ms 가운데 피처 조회 25ms 가 30% 로 가장 크다.
#
# 합계 83ms, 예산 100ms, 여유 17ms
# 가장 큰 몫은 피처 조회 25ms 로 전체의 30% 다.
# 4단계 뜻: 모델 추론을 18ms 에서 36ms 로 늘리면 여유가 -1ms 가 되어, 다른 데서 줄여야 한다.
#
# 같은 예산에서 모델을 두 배 무겁게 하려면(18 → 36ms)
#   여유가 17ms 에서 -1ms 가 된다 — 불가능, 다른 데서 줄여야 한다
````

#### 블록 2

<!-- cb7 post=interview-system-design block=1 sha=15f322815cbe5a84 sep -->
````python
# 하는 일: 로그정규 분포로 요청 처리 시간 20만 건을 뽑아 중앙값, p90 부터 p99.9 까지와 평균을 견주고, 서버를 여러 대 거치면 하나라도 p99 를 넘을 확률을 구한다.
import random, statistics

random.seed(3)

# 1단계: 요청 처리 시간 20만 건을 뽑는다
# 서버 한 대가 요청 하나를 처리하는 데 걸리는 시간(ms). 대부분 빠르고 가끔 느리다.
def 한건():
    return random.lognormvariate(2.7, 0.55)

표본 = sorted(한건() for _ in range(200_000))
def 분위(p): return 표본[int(len(표본) * p)]

# 2단계: 분위수와 평균을 찍는다
평균 = statistics.mean(표본)
print(f"{'지표':<10}{'ms':>8}")
for 이름, p in (("중앙값", 0.50), ("p90", 0.90), ("p95", 0.95), ("p99", 0.99), ("p99.9", 0.999)):
    print(f"{이름:<10}{분위(p):>8.1f}")
print(f"{'평균':<10}{평균:>8.1f}")

print(f"\n중앙값은 {분위(0.5):.0f}ms 인데 p99 는 {분위(0.99):.0f}ms 로 {분위(0.99)/분위(0.5):.1f}배다.")
print("평균만 보면 느린 꼬리가 안 보인다.\n")

# 3단계: 거치는 서버 수마다 p99 를 만날 확률을 구한다
# 하나의 요청이 서버 여러 대를 거치면 꼬리가 커진다
print(f"{'거치는 서버 수':>14}{'하나라도 p99 를 넘을 확률':>26}")
for k in (1, 5, 10, 30):
    print(f"{k:>14}{1 - 0.99**k:>24.1%}")
print("\n서버 30대를 거치면 요청 넷 중 하나가 어딘가에서 p99 를 만난다.")

# 출력:
# 2단계 뜻: 중앙값은 14.9ms 인데 p99 는 53.2ms 로 3.6배이고, 평균 17.3ms 는 느린 꼬리를 보여 주지 못한다.
# 지표              ms
# 중앙값           14.9
# p90           30.2
# p95           36.8
# p99           53.2
# p99.9         81.4
# 평균            17.3
#
# 중앙값은 15ms 인데 p99 는 53ms 로 3.6배다.
# 평균만 보면 느린 꼬리가 안 보인다.
#
# 3단계 뜻: 서버 30대를 거치면 하나라도 p99 를 넘을 확률이 26.0% 로, 요청 넷 중 하나가 어딘가에서 p99 를 만난다.
#       거치는 서버 수          하나라도 p99 를 넘을 확률
#              1                    1.0%
#              5                    4.9%
#             10                    9.6%
#             30                   26.0%
#
# 서버 30대를 거치면 요청 넷 중 하나가 어딘가에서 p99 를 만난다.
````

#### 블록 3

<!-- cb7 post=interview-system-design block=2 sha=3749effbc8eee9ec sep -->
````python
# 하는 일: 사용자 최근 클릭 수 피처를 학습 때는 정확히 세고 서빙 때는 늦거나 빠진 값으로 받을 때, 같은 모델의 AUC 와 COPC 가 얼마나 달라지는지 노출 10만 건으로 견준다.
import random, math, bisect

random.seed(42)
N = 100_000

# 1단계: 진짜 클릭 수와 클릭 라벨을 만든다
# 사용자 최근 클릭 수라는 피처가 있다.
# 학습 때는 하루치 로그를 다 모아 정확히 세지만,
# 서빙 때는 실시간 카운터라 늦게 반영되거나 일부가 빠진다.
진짜카운트 = [max(0, int(random.expovariate(1/3))) for _ in range(N)]
클릭확률 = [min(0.4, 0.005 + 0.02 * c) for c in 진짜카운트]
라벨 = [1 if random.random() < p else 0 for p in 클릭확률]

# 2단계: 학습 피처와 서빙 피처를 만든다
학습피처 = 진짜카운트                              # 정확한 값
서빙피처 = [0 if random.random() < 0.10 else max(0, c - 1) for c in 진짜카운트]

# 3단계: 모델, AUC, COPC 함수를 만든다
def 모델(c):                                   # 학습 데이터로 맞춘 아주 단순한 모델
    return min(0.4, 0.005 + 0.02 * c)

def auc(pred):
    양 = sorted(p for p, y in zip(pred, 라벨) if y == 1)
    음 = sorted(p for p, y in zip(pred, 라벨) if y == 0)
    합 = 0.0
    for p in 양:
        아래 = bisect.bisect_left(음, p); 같음 = bisect.bisect_right(음, p) - 아래
        합 += 아래 + 같음 / 2
    return 합 / (len(양) * len(음))

def copc(pred):
    return sum(라벨) / sum(pred)

# 4단계: 두 피처로 같은 모델을 채점한다
print(f"{'피처를 어디서 가져왔나':<24}{'AUC':>8}{'COPC':>9}")
for 이름, f in (("학습 때와 같은 값", 학습피처), ("서빙에서 실제로 오는 값", 서빙피처)):
    p = [모델(c) for c in f]
    print(f"{이름:<22}{auc(p):>8.4f}{copc(p):>9.3f}")

같은값 = sum(a == b for a, b in zip(학습피처, 서빙피처)) / N
print(f"\n두 피처가 같은 비율 {같은값:.1%}")
print("모델은 그대로인데 들어가는 값이 달라 오프라인 지표가 그대로 안 나온다.")

# 출력:
# 4단계 뜻: 학습 때와 같은 값을 넣으면 AUC 0.7828, COPC 1.006 인데, 서빙에서 실제로 오는 값을 넣으면 AUC 0.7404, COPC 1.482 로 어긋난다. 두 피처가 같은 비율은 28.4% 뿐이다.
# 피처를 어디서 가져왔나                 AUC     COPC
# 학습 때와 같은 값              0.7828    1.006
# 서빙에서 실제로 오는 값           0.7404    1.482
#
# 두 피처가 같은 비율 28.4%
# 모델은 그대로인데 들어가는 값이 달라 오프라인 지표가 그대로 안 나온다.
````

---

### Task 1: deep-ctr-models 블록 5개 옮기기와 화면 확인

**Files:**
- Modify: `posts/deep-ctr-models.md` (파이썬 블록 5개를 새 블록으로)
- Modify: `scripts/code-blocks-baseline.json`
- 임시: `$SCRATCH/migrate_batch7.py`, `$SCRATCH/nocache_server.py`, `$SCRATCH/venv` (저장소에 넣지 않는다. Task 2~7 도 쓴다)

**Interfaces:**
- Consumes: 여섯째 묶음이 올라간 main(새 형식 198개, 옛 형식 49개, 17편), 이 계획 부록 1 의 새 블록 5개
- Produces: 새 형식 블록 203개, 옛 형식 44개(16편). Task 2~6 이 같은 도우미를 `python3 "$SCRATCH/migrate_batch7.py" <계획 문서> posts <글 파일 이름>` 으로 쓴다. 옮기면 `<글 파일 이름>: 블록 N개를 옮겼습니다` 를 찍고(별도 출력 블록을 옮긴 글은 ` (별도 출력 블록 N개를 안으로 옮겨 지웠습니다)` 가 붙는다) 종료 코드 0 이다. 멈추면 `<글 파일 이름>: 바꾸지 않고 멈춥니다` 와 까닭 줄을 찍고 종료 코드 1 이며, 글은 그대로다.

블록 5개 모두 표준 라이브러리로 돈다. 넷째 블록은 `█` 막대를 찍어 접지 않고 블록 안에서 옆으로 민다(spec 4-7). 셋째 블록의 출력 머리는 `# 출력 (파이썬 3.9):` 다(Review Focus 5).

- [ ] **Step 1: 시작 상태를 본다**

Run (저장소 루트에서):

````bash
python3 --version
git status --short
node scripts/check-code-blocks.js | tail -1
````

Expected: `Python 3.9.7`(3.9 대면 된다), `git status` 는 아무것도 찍지 않는다, `✓ 새 형식 블록 198개, 옛 형식 블록 49개, 문제 0건`. 블록 수가 다르면 멈추고 알린다. 여섯째 묶음이 덜 올라갔거나 다른 일이 끼어든 것이다.

- [ ] **Step 2: 도우미와 서버 파일을 저장소 밖에 둔다**

`$SCRATCH/migrate_batch7.py` 는 아래 내용이다. 여섯째 묶음 도우미에 표시 줄 이름(`cb7`)과 `sep`(바로 아래 별도 출력 블록을 안으로 옮기고 지운다) 처리를 더했다. 새 블록 글은 이 계획 문서의 부록에서 읽는다.

<!-- file $SCRATCH/migrate_batch7.py -->
````python
#!/usr/bin/env python3
"""마지막 묶음(딥 CTR, 판단, 타겟팅과 카카오, 인터뷰 글 17편)의 파이썬 블록을 새 형식(하는 일, 단계, 뜻)으로 옮기는 일회용 도우미. 저장소에 넣지 않는다.

새 블록 글은 계획 문서에 있다. 블록마다 표시 줄
  <!-- cb7 post=<글 파일 이름> block=<0부터 센 파이썬 블록 번호> sha=<원본 블록 sha256 앞 16자> -->
바로 아래 네 백틱 python 울타리 안이 새 블록 전체다. 표시 줄 끝에
  old=run 이 붙은 블록은 옛 출력이 코드가 찍는 값과 달라서(설계 문서 8-1) 찍힌 줄을 돌려서 받아 적은 블록이고,
  sep 이 붙은 블록은 출력이 블록 바로 아래 별도 블록에 있던 블록이다. 그 별도 블록은 블록 안 출력 영역으로 들어가고 지워진다.

바꾸기 전에 셋을 본다. 하나라도 어긋나면 아무것도 바꾸지 않고 멈춘다.
  1. 원본 블록이 계획을 쓸 때와 같다 (sha)
  2. 새 블록의 코드 줄(빈 줄과 # 로 시작하는 줄을 뺀 줄)이 원본과 글자까지 같다
  3. 새 블록의 찍힌 줄(뜻 줄을 뺀 출력 영역)이 옛 출력과 글자까지 같다. 옛 출력은 원본 블록 안의 출력이거나,
     sep 블록이면 바로 아래 별도 출력 블록이다. old=run 블록은 이 비교를 건너뛴다. 그 블록의 찍힌 줄은 실행 검사가 본다
그다음 파이썬 블록 안의 글을 새 블록으로 바꾸고, sep 블록은 바로 아래 별도 출력 블록을 지운다. 그 밖의 글은 건드리지 않는다.

  python3 migrate_batch7.py <계획 문서> <posts 폴더> <글 파일 이름>
"""
import hashlib
import re
import sys

PLAN, POSTS, POST = sys.argv[1], sys.argv[2], sys.argv[3]
TICKS = '`' * 4  # 계획 문서의 네 백틱 울타리
MARK = re.compile(r'^<!-- cb7 post=(\S+) block=(\d+) sha=([0-9a-f]{16})( old=run)?( sep)? -->\n'
                  + TICKS + r'python\n(.*?)^' + TICKS + r'[ \t]*$', re.S | re.M)
FENCE = re.compile(r'^```([^\n`]*)\n(.*?)^```[ \t]*$', re.S | re.M)
OUT = re.compile(r'^# 출력(?=[\s(:]|$)')     # 실행 검사(scripts/check-python-outputs.py)와 같은 출력 표시
MEAN = re.compile(r'^# (?:\d+단계 )?뜻: ')


def code_lines(src):
    return [l for l in src.split('\n') if l.strip() and not l.lstrip().startswith('#')]


def trimmed(lines):
    lines = [l.rstrip() for l in lines]
    while lines and not lines[-1]:
        lines.pop()
    return lines


def printed(src, new):
    """출력 영역의 찍힌 줄들. 새 블록은 뜻 줄을 뺀다. 출력 영역이 없으면 빈 목록."""
    lines = src.rstrip('\n').split('\n')
    k = next((i for i, l in enumerate(lines) if OUT.match(l)), None)
    if k is None:
        return []
    rest = [l for l in lines[k + 1:] if not (new and MEAN.match(l))]
    return trimmed([l[2:] if l.startswith('# ') else l[1:] if l.startswith('#') else l for l in rest])


plan = open(PLAN, encoding='utf-8').read()
want = {int(m.group(2)): (m.group(3), bool(m.group(4)), bool(m.group(5)), m.group(6))
        for m in MARK.finditer(plan) if m.group(1) == POST}
if not want:
    sys.exit(f'{POST}: 계획 문서에 이 글의 블록이 없습니다')

path = f'{POSTS}/{POST}.md'
text = open(path, encoding='utf-8').read()
fences = list(FENCE.finditer(text))
py = [k for k, f in enumerate(fences) if f.group(1).strip() == 'python']
problems, edits = [], []
if len(py) != len(want):
    problems.append(f'글의 파이썬 블록은 {len(py)}개인데 계획에는 {len(want)}개입니다')
for n, (sha, from_run, sep, new) in sorted(want.items()):
    if n >= len(py):
        problems.append(f'{n}번 블록이 글에 없습니다')
        continue
    f = fences[py[n]]
    got = hashlib.sha256(f.group(2).encode('utf-8')).hexdigest()[:16]
    if got != sha:
        problems.append(f'{n}번 블록이 계획을 쓸 때와 다릅니다 (기대 {sha}, 실제 {got})')
        continue
    if code_lines(new) != code_lines(f.group(2)):
        problems.append(f'{n}번 블록의 코드 줄이 원본과 다릅니다')
        continue
    s = None
    if sep:
        s = fences[py[n] + 1] if py[n] + 1 < len(fences) else None
        if s is None or s.group(1).strip() or text[f.end():s.start()].strip():
            problems.append(f'{n}번 블록 바로 뒤에 별도 출력 블록이 없습니다')
            continue
        old = trimmed(s.group(2).split('\n'))
    else:
        old = printed(f.group(2), False)
    if not from_run and printed(new, True) != old:
        problems.append(f'{n}번 블록의 찍힌 줄이 옛 출력과 다릅니다')
        continue
    edits.append((f.start(2), f.end(2), new, f.end(), s.end() if s else None))
if problems:
    sys.exit(f'{POST}: 바꾸지 않고 멈춥니다\n  ' + '\n  '.join(problems))

# 뒤에서부터 바꿔야 앞쪽 자리가 그대로다. sep 블록은 닫는 울타리 뒤부터 별도 출력 블록 끝까지를 지운다.
for a, b, new, close, sep_end in reversed(edits):
    text = text[:a] + new + (text[b:close] + text[sep_end:] if sep_end else text[b:])
open(path, 'w', encoding='utf-8').write(text)
moved = sum(1 for e in edits if e[4])
print(f'{POST}: 블록 {len(edits)}개를 옮겼습니다' + (f' (별도 출력 블록 {moved}개를 안으로 옮겨 지웠습니다)' if moved else ''))
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
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch7"; mkdir -p "$SCRATCH"
python3 - migrate_batch7.py nocache_server.py <<'EOF'
import os, re, sys
T = '`' * 4
plan = open('docs/superpowers/plans/2026-10-16-python-code-blocks-batch7.md', encoding='utf-8').read()
for name in sys.argv[1:]:
    m = re.search(r'^<!-- file \$SCRATCH/' + re.escape(name) + r' -->\n' + T + r'[a-z]*\n(.*?)^' + T + r'\n', plan, re.S | re.M)
    dest = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'code-steps-batch7', name)
    if not os.path.exists(dest):
        open(dest, 'w', encoding='utf-8').write(m.group(1))
    print(dest)
EOF
````

Expected: 파일 경로 두 줄. 이미 있는 파일은 그대로 둔다.

- [ ] **Step 3: 옮긴다**

Run: `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch7"; python3 "$SCRATCH/migrate_batch7.py" docs/superpowers/plans/2026-10-16-python-code-blocks-batch7.md posts deep-ctr-models`
Expected: `deep-ctr-models: 블록 5개를 옮겼습니다`. `바꾸지 않고 멈춥니다` 로 끝나면 이 태스크를 멈추고 까닭 줄을 그대로 알린다.

- [ ] **Step 4: 코드 줄과 블록 밖 글이 그대로인지, 표시 줄과 옮긴 주석을 본다**

Run:

````bash
python3 - deep-ctr-models <<'EOF'
import re, subprocess, sys
PY = re.compile(r'^```python[^\n]*\n(.*?)^```[ \t]*$', re.S | re.M)
# 파이썬 블록과 바로 뒤 별도 출력 블록 한 쌍
PAIR = re.compile(r'^```python[^\n]*\n.*?^```[ \t]*\n\s*```[ \t]*\n.*?^```[ \t]*$', re.S | re.M)
code = lambda b: [l for l in b.split('\n') if l.strip() and not l.lstrip().startswith('#')]
SEP = {}   # 별도 출력 블록이 있던 글
# (글, 0부터 센 블록, 새 블록에 있어야 할 말, 새 블록에 없어야 할 옛 주석 줄 또는 None)
MOVED = [
    ('deep-ctr-models', 0, '# 1단계: 유저 수, 광고 수, embedding 차원을 둔다', '# One-hot 교차 vs Embedding — 파라미터 수를 실제로 곱해 본다.'),
    ('deep-ctr-models', 1, '# 1단계: 조합에만 신호가 있는 가상 로그 4만 건을 만든다', '# LR은 "20대 × 저녁" 같은 조합을 스스로 배울 수 없다.'),
    ('deep-ctr-models', 2, '# 출력 (파이썬 3.9):', '# FM의 2차 상호작용을 두 방법으로 계산해 결과가 같은지 확인한다.'),
    ('deep-ctr-models', 4, "위 가상 표의 '파라미터 수' 열을 그대로 계산한다", "# 위 가상 표의 '파라미터 수' 열을 그대로 계산해 본다. 표준 라이브러리만 사용한다."),
]
fail = False
for post in sys.argv[1:]:
    old = subprocess.run(['git', 'show', f'HEAD:posts/{post}.md'], capture_output=True, text=True, check=True).stdout
    new = open(f'posts/{post}.md', encoding='utf-8').read()
    ob, nb = [m.group(1) for m in PY.finditer(old)], [m.group(1) for m in PY.finditer(new)]
    assert len(ob) == len(nb), (post, len(ob), len(nb))
    bad = [i for i, (a, b) in enumerate(zip(ob, nb)) if code(a) != code(b)]
    same = (PAIR if post in SEP else PY).sub('@', old) == PY.sub('@', new)
    left = len(PAIR.findall(new))
    print(f'{post}: 코드 줄이 바뀐 블록 {bad}, 블록 밖 글 {"같다" if same else "다르다"}, 파이썬 블록 바로 뒤 별도 출력 블록 {left}개')
    fail = fail or bool(bad or not same or left)
    for p, n, want, gone in MOVED:
        if p != post:
            continue
        has = want in nb[n]
        stay = gone is not None and gone in nb[n].split('\n')
        print(f'  {n + 1}번째 블록: 옮긴 말 {"있다" if has else "없다"}, 옛 주석 줄 {"남았다" if stay else "없다"}')
        fail = fail or not has or stay
sys.exit(1 if fail else 0)
EOF
````

Expected: 다섯 줄

````text
deep-ctr-models: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다, 파이썬 블록 바로 뒤 별도 출력 블록 0개
  1번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
  2번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
  3번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
  5번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
````

- [ ] **Step 5: 검사를 돌린다**

Run: `node scripts/check-code-blocks.js`
Expected: 두 줄

````text
  기준표보다 줄어든 글 1편 (deep-ctr-models.md 5→0) — node scripts/check-code-blocks.js --update 로 기준표를 줄입니다
✓ 새 형식 블록 203개, 옛 형식 블록 44개, 문제 0건
````

Run: `python3 scripts/check-python-outputs.py --post deep-ctr-models`
Expected: `✓ 통과 5, 건너뜀 0 (라이브러리 없음 0, 실행 안 됨 0), 실패 0`

CI 와 같은 표준 라이브러리 파이썬으로도 돌린다:

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch7"; python3 -m venv --without-pip "$SCRATCH/venv"
"$SCRATCH/venv/bin/python" scripts/check-python-outputs.py --post deep-ctr-models | tail -1
````

Expected: `✓ 통과 5, 건너뜀 0 (라이브러리 없음 0, 실행 안 됨 0), 실패 0`

Run: `node scripts/check-wording.js`
Expected: 종료 코드 0

- [ ] **Step 6: 기준표를 줄인다**

Run: `node scripts/check-code-blocks.js --update`
Expected: `기준표를 다시 적었습니다 — 옛 형식 블록 44개, 글 16편`

- [ ] **Step 7: 첫 글을 화면으로 본다**

서버를 백그라운드로 띄우고(저장소 루트에서 `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch7"; python3 "$SCRATCH/nocache_server.py" "$(pwd)" 8776`, 파일은 Step 2 가 뽑았다) `http://127.0.0.1:8776/post.html?id=deep-ctr-models` 를 새 캐시(`new_page` 에 `isolatedContext` 이름 `b7t1`)로 연다. 이후 브라우저 도구를 부를 때마다 그 페이지의 `pageId` 를 넘긴다. 아래 함수를 돌린다. 숨긴 iframe 을 네 폭으로 바꿔 가며 잰다.

````js
async () => {
  const POSTS = [
    'deep-ctr-models',
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

Expected: 네 값 모두 `"5 true 0 0 false 0 0 0"` — 블록 5개, 원문과 같다, 출력 없는 블록 0, 바로 뒤에 남은 다른 코드 블록 0, 넘침 없음, 메모 겹침 0, 배치 빠짐 0, 용어 풀이와 수식이 끼어든 곳 0.

그림을 `.playwright-mcp/batch7/` 에 두 장 찍는다. 넷째 블록(DIN 가중치 막대, 뜻 둘)을 1440 폭(창 1440×1000) 라이트와 390 폭(390px iframe 하나만 둔 감싸는 페이지) 라이트로 담는다. 390 폭에서 파란 메뉴 단추(`#sidebar-toggle`)가 코드를 가리면 감싸는 페이지의 iframe 문서에 `#sidebar-toggle{display:none !important}` 를 넣은 `<style>` 을 붙여 숨긴다. 문서에 `scroll-behavior: smooth` 가 있어 `scrollTo` 에는 `behavior: 'instant'` 를 준다.

볼 것: 막대 줄은 접히지 않고 블록 안에서만 옆으로 밀리며, 390 폭에서도 페이지는 넘치지 않는다. 뜻 줄 둘이 각자 자기 찍힌 줄 묶음에 붙는다. 서버를 끈다.

- [ ] **Step 8: 커밋**

````bash
git add posts/deep-ctr-models.md scripts/code-blocks-baseline.json
git commit -F - <<'EOF'
feat(posts): 마지막 묶음 글 — Deep CTR 모델 글의 파이썬 블록 5개를 하는 일, 단계, 뜻 형식으로

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

리뷰에서 블록 글을 고치게 되면 그 글을 직접 고친다(도우미는 원본 블록에만 돈다). 고친 커밋의 제목도 `fix(posts): 마지막 묶음 글 — …` 으로 시작한다. Task 7 이 이 머리로 글 커밋을 찾아 하나로 합친다. Task 2~6 도 같다.

---

### Task 2: 행동 시퀀스, DIN, DCN 세 편 블록 8개 옮기기

**Files:**
- Modify: `posts/behavior-sequence-attention.md` (6개), `posts/din-architecture.md` (1개), `posts/dcn-vs-din-slot.md` (1개)
- Modify: `scripts/code-blocks-baseline.json`

**Interfaces:**
- Consumes: `$SCRATCH/migrate_batch7.py`(Step 1 이 없으면 계획에서 다시 뽑는다), 이 계획 부록 2~4 의 새 블록 8개
- Produces: 새 형식 블록 211개, 옛 형식 블록 36개(13편)

블록 8개 모두 표준 라이브러리로 돈다.

- [ ] **Step 1: 도우미가 있는지 본다**

Run (저장소 루트에서):

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch7"; mkdir -p "$SCRATCH"
python3 - migrate_batch7.py <<'EOF'
import os, re, sys
T = '`' * 4
plan = open('docs/superpowers/plans/2026-10-16-python-code-blocks-batch7.md', encoding='utf-8').read()
for name in sys.argv[1:]:
    m = re.search(r'^<!-- file \$SCRATCH/' + re.escape(name) + r' -->\n' + T + r'[a-z]*\n(.*?)^' + T + r'\n', plan, re.S | re.M)
    dest = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'code-steps-batch7', name)
    if not os.path.exists(dest):
        open(dest, 'w', encoding='utf-8').write(m.group(1))
    print(dest)
EOF
````

Expected: 파일 경로 한 줄

- [ ] **Step 2: 세 편을 차례로 옮긴다**

Run:

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch7"
for p in behavior-sequence-attention din-architecture dcn-vs-din-slot; do
  python3 "$SCRATCH/migrate_batch7.py" docs/superpowers/plans/2026-10-16-python-code-blocks-batch7.md posts "$p" || break
done
````

Expected: 세 줄

````text
behavior-sequence-attention: 블록 6개를 옮겼습니다
din-architecture: 블록 1개를 옮겼습니다
dcn-vs-din-slot: 블록 1개를 옮겼습니다
````

`바꾸지 않고 멈춥니다` 가 나오면 거기서 멈추고, 까닭 줄과 그때까지 옮긴 글을 그대로 알린다. 그 글을 손으로 고치지 않는다.

- [ ] **Step 3: 코드 줄과 블록 밖 글이 그대로인지, 옮긴 주석을 본다**

Run:

````bash
python3 - behavior-sequence-attention din-architecture dcn-vs-din-slot <<'EOF'
import re, subprocess, sys
PY = re.compile(r'^```python[^\n]*\n(.*?)^```[ \t]*$', re.S | re.M)
# 파이썬 블록과 바로 뒤 별도 출력 블록 한 쌍
PAIR = re.compile(r'^```python[^\n]*\n.*?^```[ \t]*\n\s*```[ \t]*\n.*?^```[ \t]*$', re.S | re.M)
code = lambda b: [l for l in b.split('\n') if l.strip() and not l.lstrip().startswith('#')]
SEP = {}   # 별도 출력 블록이 있던 글
# (글, 0부터 센 블록, 새 블록에 있어야 할 말, 새 블록에 없어야 할 옛 주석 줄 또는 None)
MOVED = [
    ('behavior-sequence-attention', 0, '평균은 어떤 광고를 채점하든 같은 벡터다', '# 행동 네 개를 벡터로 만들고 평균을 낸다. 평균은 어떤 광고를 채점하든 같은 벡터다.'),
    ('behavior-sequence-attention', 3, '숨은 층은 널리 쓰이는 구현(DeepCTR)의 기본값 (80, 40) 을', '# activation unit 의 곱셈이 몇 번 필요한가. 숨은 층은 널리 쓰이는 구현(DeepCTR)의'),
    ('din-architecture', 0, '기록 길이가 다른 두 사람을 한 배치에 넣는다', '# 기록 길이가 다른 두 사람을 한 배치에: 짧은 쪽은 빈칸을 채우고 mask 로 가중치를 0 으로'),
    ('dcn-vs-din-slot', 0, '숫자는 DIN 모델 구조 글과 같은 가상 값이다', '# DCN 만 쓰는 모델과 DIN 모듈을 더한 모델에 들어가는 행동 정보를 나란히 만든다.'),
]
fail = False
for post in sys.argv[1:]:
    old = subprocess.run(['git', 'show', f'HEAD:posts/{post}.md'], capture_output=True, text=True, check=True).stdout
    new = open(f'posts/{post}.md', encoding='utf-8').read()
    ob, nb = [m.group(1) for m in PY.finditer(old)], [m.group(1) for m in PY.finditer(new)]
    assert len(ob) == len(nb), (post, len(ob), len(nb))
    bad = [i for i, (a, b) in enumerate(zip(ob, nb)) if code(a) != code(b)]
    same = (PAIR if post in SEP else PY).sub('@', old) == PY.sub('@', new)
    left = len(PAIR.findall(new))
    print(f'{post}: 코드 줄이 바뀐 블록 {bad}, 블록 밖 글 {"같다" if same else "다르다"}, 파이썬 블록 바로 뒤 별도 출력 블록 {left}개')
    fail = fail or bool(bad or not same or left)
    for p, n, want, gone in MOVED:
        if p != post:
            continue
        has = want in nb[n]
        stay = gone is not None and gone in nb[n].split('\n')
        print(f'  {n + 1}번째 블록: 옮긴 말 {"있다" if has else "없다"}, 옛 주석 줄 {"남았다" if stay else "없다"}')
        fail = fail or not has or stay
sys.exit(1 if fail else 0)
EOF
````

Expected: 일곱 줄

````text
behavior-sequence-attention: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다, 파이썬 블록 바로 뒤 별도 출력 블록 0개
  1번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
  4번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
din-architecture: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다, 파이썬 블록 바로 뒤 별도 출력 블록 0개
  1번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
dcn-vs-din-slot: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다, 파이썬 블록 바로 뒤 별도 출력 블록 0개
  1번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
````

- [ ] **Step 4: 실행 검사를 돌린다**

Run:

````bash
python3 --version
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch7"; test -x "$SCRATCH/venv/bin/python" || python3 -m venv --without-pip "$SCRATCH/venv"
for p in behavior-sequence-attention din-architecture dcn-vs-din-slot; do
  python3 scripts/check-python-outputs.py --post "$p"; echo "  exit=$?"
  "$SCRATCH/venv/bin/python" scripts/check-python-outputs.py --post "$p" | tail -1
done
````

Expected: `Python 3.9.7`, 그다음 글마다 같은 줄 두 번(로컬과 표준 라이브러리 venv)과 `exit=0` 이다. 차례로 `✓ 통과 6, 건너뜀 0 (라이브러리 없음 0, 실행 안 됨 0), 실패 0`, `✓ 통과 1, …`, `✓ 통과 1, …` 이다.

- [ ] **Step 5: 형식 검사, 말투 검사, 기준표**

Run: `node scripts/check-code-blocks.js | tail -1`
Expected: `✓ 새 형식 블록 211개, 옛 형식 블록 36개, 문제 0건`

Run: `node scripts/check-wording.js`
Expected: 종료 코드 0

Run: `node scripts/check-code-blocks.js --update`
Expected: `기준표를 다시 적었습니다 — 옛 형식 블록 36개, 글 13편`

- [ ] **Step 6: 커밋**

````bash
git add posts/behavior-sequence-attention.md posts/din-architecture.md posts/dcn-vs-din-slot.md scripts/code-blocks-baseline.json
git commit -F - <<'EOF'
feat(posts): 마지막 묶음 글 — 행동 시퀀스 Attention, DIN 모델 구조, DCN 과 DIN 자리 글의 파이썬 블록 8개를 하는 일, 단계, 뜻 형식으로

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

---

### Task 3: 멀티태스크와 네거티브 샘플링 두 편 블록 10개 옮기기

**Files:**
- Modify: `posts/multi-task-learning.md` (3개), `posts/negative-sampling-bias.md` (7개)
- Modify: `scripts/code-blocks-baseline.json`

**Interfaces:**
- Consumes: `$SCRATCH/migrate_batch7.py`, 이 계획 부록 5~6 의 새 블록 10개
- Produces: 새 형식 블록 221개, 옛 형식 블록 26개(11편)

negative-sampling-bias 첫째 블록은 numpy 를 부르고, 다섯째 블록은 「앞 블록에 이어서」 그 numpy 를 쓴다. 로컬에서는 둘 다 돌고, 표준 라이브러리 venv 에서는 「라이브러리 없음」으로 건너뛴다(Review Focus 3). 일곱째 블록은 old=run 이다. 출력 예시를 메모로 옮겨 출력 영역이 없다(Review Focus 4). 이 글의 블록 7개 가운데 출력 영역이 없는 블록은 첫째, 넷째, 다섯째, 여섯째, 일곱째다.

- [ ] **Step 1: 도우미가 있는지 본다**

Run (저장소 루트에서):

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch7"; mkdir -p "$SCRATCH"
python3 - migrate_batch7.py <<'EOF'
import os, re, sys
T = '`' * 4
plan = open('docs/superpowers/plans/2026-10-16-python-code-blocks-batch7.md', encoding='utf-8').read()
for name in sys.argv[1:]:
    m = re.search(r'^<!-- file \$SCRATCH/' + re.escape(name) + r' -->\n' + T + r'[a-z]*\n(.*?)^' + T + r'\n', plan, re.S | re.M)
    dest = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'code-steps-batch7', name)
    if not os.path.exists(dest):
        open(dest, 'w', encoding='utf-8').write(m.group(1))
    print(dest)
EOF
````

Expected: 파일 경로 한 줄

- [ ] **Step 2: 두 편을 차례로 옮긴다**

Run:

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch7"
for p in multi-task-learning negative-sampling-bias; do
  python3 "$SCRATCH/migrate_batch7.py" docs/superpowers/plans/2026-10-16-python-code-blocks-batch7.md posts "$p" || break
done
````

Expected: 두 줄

````text
multi-task-learning: 블록 3개를 옮겼습니다
negative-sampling-bias: 블록 7개를 옮겼습니다
````

`바꾸지 않고 멈춥니다` 가 나오면 거기서 멈추고, 까닭 줄과 그때까지 옮긴 글을 그대로 알린다.

- [ ] **Step 3: 코드 줄과 블록 밖 글이 그대로인지, 표시 줄과 옮긴 주석을 본다**

Run:

````bash
python3 - multi-task-learning negative-sampling-bias <<'EOF'
import re, subprocess, sys
PY = re.compile(r'^```python[^\n]*\n(.*?)^```[ \t]*$', re.S | re.M)
# 파이썬 블록과 바로 뒤 별도 출력 블록 한 쌍
PAIR = re.compile(r'^```python[^\n]*\n.*?^```[ \t]*\n\s*```[ \t]*\n.*?^```[ \t]*$', re.S | re.M)
code = lambda b: [l for l in b.split('\n') if l.strip() and not l.lstrip().startswith('#')]
SEP = {}   # 별도 출력 블록이 있던 글
# (글, 0부터 센 블록, 새 블록에 있어야 할 말, 새 블록에 없어야 할 옛 주석 줄 또는 None)
MOVED = [
    ('multi-task-learning', 0, 'SSB(샘플 선택 편향)가 생기는 바로 그 조건이다', '# 클릭이 잘 나는 자리일수록 전환도 잘 난다 -- SSB(샘플 선택 편향)가 생기는 바로 그 조건이다.'),
    ('multi-task-learning', 2, '이것이 Negative Transfer 를 눈으로 보는 가장 작은 실험이다', '# 이것이 Negative Transfer를 눈으로 보는 가장 작은 실험이다. 표준 라이브러리만 쓴다.'),
    ('negative-sampling-bias', 0, 'positive 비율은 0.2% 에서 약 2% 로 오른다', '# → 데이터 크기 약 10배 감소, positive 비율 0.2% → 약 2%로 상승'),
    ('negative-sampling-bias', 4, '# (앞 블록에 이어서 돌린다.)\n# 하는 일: ', '# 드물게 노출(0.02) → 가중치 50 (높임, but clipped)'),
    ('negative-sampling-bias', 6, '# 돌려주는 값의 예(가상): mobile_ios(n 2,340,000)', '# 출력 예시:'),
]
fail = False
for post in sys.argv[1:]:
    old = subprocess.run(['git', 'show', f'HEAD:posts/{post}.md'], capture_output=True, text=True, check=True).stdout
    new = open(f'posts/{post}.md', encoding='utf-8').read()
    ob, nb = [m.group(1) for m in PY.finditer(old)], [m.group(1) for m in PY.finditer(new)]
    assert len(ob) == len(nb), (post, len(ob), len(nb))
    bad = [i for i, (a, b) in enumerate(zip(ob, nb)) if code(a) != code(b)]
    same = (PAIR if post in SEP else PY).sub('@', old) == PY.sub('@', new)
    left = len(PAIR.findall(new))
    print(f'{post}: 코드 줄이 바뀐 블록 {bad}, 블록 밖 글 {"같다" if same else "다르다"}, 파이썬 블록 바로 뒤 별도 출력 블록 {left}개')
    fail = fail or bool(bad or not same or left)
    for p, n, want, gone in MOVED:
        if p != post:
            continue
        has = want in nb[n]
        stay = gone is not None and gone in nb[n].split('\n')
        print(f'  {n + 1}번째 블록: 옮긴 말 {"있다" if has else "없다"}, 옛 주석 줄 {"남았다" if stay else "없다"}')
        fail = fail or not has or stay
sys.exit(1 if fail else 0)
EOF
````

Expected: 일곱 줄

````text
multi-task-learning: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다, 파이썬 블록 바로 뒤 별도 출력 블록 0개
  1번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
  3번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
negative-sampling-bias: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다, 파이썬 블록 바로 뒤 별도 출력 블록 0개
  1번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
  5번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
  7번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
````

- [ ] **Step 4: 실행 검사를 돌린다**

Run:

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch7"; test -x "$SCRATCH/venv/bin/python" || python3 -m venv --without-pip "$SCRATCH/venv"
for p in multi-task-learning negative-sampling-bias; do
  python3 scripts/check-python-outputs.py --post "$p"; echo "  exit=$?"
  "$SCRATCH/venv/bin/python" scripts/check-python-outputs.py --post "$p" | tail -1
done
````

Expected: 여섯 줄

````text
✓ 통과 3, 건너뜀 0 (라이브러리 없음 0, 실행 안 됨 0), 실패 0
  exit=0
✓ 통과 3, 건너뜀 0 (라이브러리 없음 0, 실행 안 됨 0), 실패 0
✓ 통과 7, 건너뜀 0 (라이브러리 없음 0, 실행 안 됨 0), 실패 0
  exit=0
✓ 통과 5, 건너뜀 2 (라이브러리 없음 2, 실행 안 됨 0), 실패 0
````

로컬이 negative-sampling-bias 다섯째 블록을 NameError 로 실패하면 「앞 블록에 이어서」 표시가 빠진 것이다. 멈추고 알린다. venv 의 건너뜀 둘은 첫째와 다섯째 블록이다.

- [ ] **Step 5: 형식 검사, 말투 검사, 기준표**

Run: `node scripts/check-code-blocks.js | tail -1`
Expected: `✓ 새 형식 블록 221개, 옛 형식 블록 26개, 문제 0건`

Run: `node scripts/check-wording.js`
Expected: 종료 코드 0

Run: `node scripts/check-code-blocks.js --update`
Expected: `기준표를 다시 적었습니다 — 옛 형식 블록 26개, 글 11편`

- [ ] **Step 6: 커밋**

````bash
git add posts/multi-task-learning.md posts/negative-sampling-bias.md scripts/code-blocks-baseline.json
git commit -F - <<'EOF'
feat(posts): 마지막 묶음 글 — 멀티태스크 학습, 네거티브 샘플링 편향 글의 파이썬 블록 10개를 하는 일, 단계, 뜻 형식으로

negative-sampling-bias 일곱째 블록은 함수가 돌려주는 값을 출력처럼 적은 「# 출력 예시:」 세 줄을
설계 문서 8-1 대로 메모 한 줄로 옮겼다. 코드 줄은 그대로다.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

---

### Task 4: 타겟팅과 카카오 다섯 편 블록 8개 옮기기

**Files:**
- Modify: `posts/audience-segmentation.md` (2개), `posts/lookalike-modeling.md` (2개), `posts/kakao-ads-prediction-targeting.md` (1개), `posts/kakao-ads-products.md` (1개), `posts/kakao-ads-bidding-measurement.md` (2개)
- Modify: `scripts/code-blocks-baseline.json`

**Interfaces:**
- Consumes: `$SCRATCH/migrate_batch7.py`, 이 계획 부록 7~11 의 새 블록 8개
- Produces: 새 형식 블록 229개, 옛 형식 블록 18개(6편)

audience-segmentation 두 블록은 「실무 파이프라인」과 「의사코드」 표시로 돌리지 않는다(Review Focus 3). lookalike-modeling 두 블록은 numpy, faiss, scikit-learn, xgboost 를 써서 venv 에서 건너뛰고, 둘째 블록은 old=run 이다(Review Focus 4). 카카오 세 편의 블록 4개는 표준 라이브러리로 돈다.

- [ ] **Step 1: 도우미가 있는지 본다**

Run (저장소 루트에서):

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch7"; mkdir -p "$SCRATCH"
python3 - migrate_batch7.py <<'EOF'
import os, re, sys
T = '`' * 4
plan = open('docs/superpowers/plans/2026-10-16-python-code-blocks-batch7.md', encoding='utf-8').read()
for name in sys.argv[1:]:
    m = re.search(r'^<!-- file \$SCRATCH/' + re.escape(name) + r' -->\n' + T + r'[a-z]*\n(.*?)^' + T + r'\n', plan, re.S | re.M)
    dest = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'code-steps-batch7', name)
    if not os.path.exists(dest):
        open(dest, 'w', encoding='utf-8').write(m.group(1))
    print(dest)
EOF
````

Expected: 파일 경로 한 줄

- [ ] **Step 2: 다섯 편을 차례로 옮긴다**

Run:

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch7"
for p in audience-segmentation lookalike-modeling kakao-ads-prediction-targeting kakao-ads-products kakao-ads-bidding-measurement; do
  python3 "$SCRATCH/migrate_batch7.py" docs/superpowers/plans/2026-10-16-python-code-blocks-batch7.md posts "$p" || break
done
````

Expected: 다섯 줄

````text
audience-segmentation: 블록 2개를 옮겼습니다
lookalike-modeling: 블록 2개를 옮겼습니다
kakao-ads-prediction-targeting: 블록 1개를 옮겼습니다
kakao-ads-products: 블록 1개를 옮겼습니다
kakao-ads-bidding-measurement: 블록 2개를 옮겼습니다
````

`바꾸지 않고 멈춥니다` 가 나오면 거기서 멈추고, 까닭 줄과 그때까지 옮긴 글을 그대로 알린다.

- [ ] **Step 3: 코드 줄과 블록 밖 글이 그대로인지, 표시 줄과 옮긴 주석을 본다**

Run:

````bash
python3 - audience-segmentation lookalike-modeling kakao-ads-prediction-targeting kakao-ads-products kakao-ads-bidding-measurement <<'EOF'
import re, subprocess, sys
PY = re.compile(r'^```python[^\n]*\n(.*?)^```[ \t]*$', re.S | re.M)
# 파이썬 블록과 바로 뒤 별도 출력 블록 한 쌍
PAIR = re.compile(r'^```python[^\n]*\n.*?^```[ \t]*\n\s*```[ \t]*\n.*?^```[ \t]*$', re.S | re.M)
code = lambda b: [l for l in b.split('\n') if l.strip() and not l.lstrip().startswith('#')]
SEP = {}   # 별도 출력 블록이 있던 글
# (글, 0부터 센 블록, 새 블록에 있어야 할 말, 새 블록에 없어야 할 옛 주석 줄 또는 None)
MOVED = [
    ('audience-segmentation', 0, '# (실무 파이프라인 — 그대로 실행되지 않습니다.)\n# 하는 일: ', '#  아래 K 선택 기준과 라벨 붙이는 순서를 보는 게 이 코드의 목적입니다.)'),
    ('audience-segmentation', 1, '# (의사코드 — 그대로 실행되지 않습니다.)\n# 하는 일: ', '# Flink CEP 의사코드: 실시간 세그먼트 할당'),
    ('lookalike-modeling', 0, '실전에서는 np.load(...) 로 읽고, 여기서는 재현 가능한 가짜 데이터를 쓴다', '# 1. Seed 임베딩 로드 — 실전에서는 np.load(...), 여기서는 재현 가능한 가짜 데이터'),
    ('lookalike-modeling', 1, '# [83]\tval-auc:0.93408', '# [82]\tval-auc:0.93408'),
    ('kakao-ads-prediction-targeting', 0, '(a) 가장 정확한 타겟이 최선인가를 본다', '# (a) "가장 정확한 타겟이 최선인가?" - CPA가 가장 좋은 맞춤타겟과, 총 전환이 가장 많은 유사10%를 비교.'),
    ('kakao-ads-products', 0, '예측 1.6% 가 실제로는 1.6% * 0.9 = 1.44% 다', '#     예측 1.6% -> 실제 1.6% * 0.9 = 1.44%.'),
    ('kakao-ads-bidding-measurement', 1, '매 요청마다 이기는 데 필요한 시장가(market clearing price)가 있다고 둔다', "#   - 매 요청마다 '이기는 데 필요한 시장가(market clearing price)'가 존재"),
]
fail = False
for post in sys.argv[1:]:
    old = subprocess.run(['git', 'show', f'HEAD:posts/{post}.md'], capture_output=True, text=True, check=True).stdout
    new = open(f'posts/{post}.md', encoding='utf-8').read()
    ob, nb = [m.group(1) for m in PY.finditer(old)], [m.group(1) for m in PY.finditer(new)]
    assert len(ob) == len(nb), (post, len(ob), len(nb))
    bad = [i for i, (a, b) in enumerate(zip(ob, nb)) if code(a) != code(b)]
    same = (PAIR if post in SEP else PY).sub('@', old) == PY.sub('@', new)
    left = len(PAIR.findall(new))
    print(f'{post}: 코드 줄이 바뀐 블록 {bad}, 블록 밖 글 {"같다" if same else "다르다"}, 파이썬 블록 바로 뒤 별도 출력 블록 {left}개')
    fail = fail or bool(bad or not same or left)
    for p, n, want, gone in MOVED:
        if p != post:
            continue
        has = want in nb[n]
        stay = gone is not None and gone in nb[n].split('\n')
        print(f'  {n + 1}번째 블록: 옮긴 말 {"있다" if has else "없다"}, 옛 주석 줄 {"남았다" if stay else "없다"}')
        fail = fail or not has or stay
sys.exit(1 if fail else 0)
EOF
````

Expected: 열두 줄

````text
audience-segmentation: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다, 파이썬 블록 바로 뒤 별도 출력 블록 0개
  1번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
  2번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
lookalike-modeling: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다, 파이썬 블록 바로 뒤 별도 출력 블록 0개
  1번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
  2번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
kakao-ads-prediction-targeting: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다, 파이썬 블록 바로 뒤 별도 출력 블록 0개
  1번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
kakao-ads-products: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다, 파이썬 블록 바로 뒤 별도 출력 블록 0개
  1번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
kakao-ads-bidding-measurement: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다, 파이썬 블록 바로 뒤 별도 출력 블록 0개
  2번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
````

lookalike-modeling 2번째 블록의 「옛 주석 줄」은 옛 출력 `# [82]	val-auc:0.93408` 이다. 남아 있으면 old=run 블록이 바뀌지 않은 것이다.

- [ ] **Step 4: 실행 검사를 돌린다**

Run:

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch7"; test -x "$SCRATCH/venv/bin/python" || python3 -m venv --without-pip "$SCRATCH/venv"
for p in audience-segmentation lookalike-modeling kakao-ads-prediction-targeting kakao-ads-products kakao-ads-bidding-measurement; do
  echo "== $p"
  python3 scripts/check-python-outputs.py --post "$p" | tail -1
  "$SCRATCH/venv/bin/python" scripts/check-python-outputs.py --post "$p" | tail -1
done
````

Expected: 열다섯 줄

````text
== audience-segmentation
✓ 통과 0, 건너뜀 2 (라이브러리 없음 0, 실행 안 됨 2), 실패 0
✓ 통과 0, 건너뜀 2 (라이브러리 없음 0, 실행 안 됨 2), 실패 0
== lookalike-modeling
✓ 통과 2, 건너뜀 0 (라이브러리 없음 0, 실행 안 됨 0), 실패 0
✓ 통과 0, 건너뜀 2 (라이브러리 없음 2, 실행 안 됨 0), 실패 0
== kakao-ads-prediction-targeting
✓ 통과 1, 건너뜀 0 (라이브러리 없음 0, 실행 안 됨 0), 실패 0
✓ 통과 1, 건너뜀 0 (라이브러리 없음 0, 실행 안 됨 0), 실패 0
== kakao-ads-products
✓ 통과 1, 건너뜀 0 (라이브러리 없음 0, 실행 안 됨 0), 실패 0
✓ 통과 1, 건너뜀 0 (라이브러리 없음 0, 실행 안 됨 0), 실패 0
== kakao-ads-bidding-measurement
✓ 통과 2, 건너뜀 0 (라이브러리 없음 0, 실행 안 됨 0), 실패 0
✓ 통과 2, 건너뜀 0 (라이브러리 없음 0, 실행 안 됨 0), 실패 0
````

로컬에서 lookalike-modeling 둘째 블록이 「3번째 찍힌 줄이 다릅니다」로 실패하면 로컬 xgboost 가 계획을 쓸 때와 다른 판이다. 찍힌 줄을 손으로 고치지 말고 멈춰 알린다.

- [ ] **Step 5: 형식 검사, 말투 검사, 기준표**

Run: `node scripts/check-code-blocks.js | tail -1`
Expected: `✓ 새 형식 블록 229개, 옛 형식 블록 18개, 문제 0건`

Run: `node scripts/check-wording.js`
Expected: 종료 코드 0

Run: `node scripts/check-code-blocks.js --update`
Expected: `기준표를 다시 적었습니다 — 옛 형식 블록 18개, 글 6편`

- [ ] **Step 6: 커밋**

````bash
git add posts/audience-segmentation.md posts/lookalike-modeling.md posts/kakao-ads-prediction-targeting.md posts/kakao-ads-products.md posts/kakao-ads-bidding-measurement.md scripts/code-blocks-baseline.json
git commit -F - <<'EOF'
feat(posts): 마지막 묶음 글 — 오디언스 세분화, Lookalike, 카카오 광고 세 편의 파이썬 블록 8개를 하는 일, 단계, 뜻 형식으로

lookalike-modeling 둘째 블록은 설계 문서 8-1 대로 다시 돌려 찍힌 [83] 을 받아 적었다.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````


---

### Task 5: 판단 트랙 세 편 블록 6개 옮기기

**Files:**
- Modify: `posts/doubly-robust.md` (1개), `posts/feedback-loop-bias.md` (3개), `posts/feedback-loop-remedies.md` (2개)
- Modify: `scripts/code-blocks-baseline.json`

**Interfaces:**
- Consumes: `$SCRATCH/migrate_batch7.py`, 이 계획 부록 12~14 의 새 블록 6개
- Produces: 새 형식 블록 235개, 옛 형식 블록 12개(3편)

feedback-loop-bias 둘째와 셋째 블록은 「앞 블록에 이어서」, feedback-loop-remedies 첫째 블록은 「feedback-loop-bias 글의 코드에 이어서」, 둘째 블록은 「앞 블록에 이어서」 돈다(Review Focus 1, 3). feedback-loop-remedies 를 돌리면 실행 검사가 feedback-loop-bias 세 블록을 먼저 돌린다. 그래서 feedback-loop-bias 를 먼저 옮기고, 실행 검사는 옮긴 뒤 두 글을 함께 본다.

- [ ] **Step 1: 도우미가 있는지 본다**

Run (저장소 루트에서):

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch7"; mkdir -p "$SCRATCH"
python3 - migrate_batch7.py <<'EOF'
import os, re, sys
T = '`' * 4
plan = open('docs/superpowers/plans/2026-10-16-python-code-blocks-batch7.md', encoding='utf-8').read()
for name in sys.argv[1:]:
    m = re.search(r'^<!-- file \$SCRATCH/' + re.escape(name) + r' -->\n' + T + r'[a-z]*\n(.*?)^' + T + r'\n', plan, re.S | re.M)
    dest = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'code-steps-batch7', name)
    if not os.path.exists(dest):
        open(dest, 'w', encoding='utf-8').write(m.group(1))
    print(dest)
EOF
````

Expected: 파일 경로 한 줄

- [ ] **Step 2: 세 편을 차례로 옮긴다**

Run:

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch7"
for p in doubly-robust feedback-loop-bias feedback-loop-remedies; do
  python3 "$SCRATCH/migrate_batch7.py" docs/superpowers/plans/2026-10-16-python-code-blocks-batch7.md posts "$p" || break
done
````

Expected: 세 줄

````text
doubly-robust: 블록 1개를 옮겼습니다
feedback-loop-bias: 블록 3개를 옮겼습니다
feedback-loop-remedies: 블록 2개를 옮겼습니다
````

`바꾸지 않고 멈춥니다` 가 나오면 거기서 멈추고, 까닭 줄과 그때까지 옮긴 글을 그대로 알린다.

- [ ] **Step 3: 코드 줄과 블록 밖 글이 그대로인지, 표시 줄과 옮긴 주석을 본다**

Run:

````bash
python3 - doubly-robust feedback-loop-bias feedback-loop-remedies <<'EOF'
import re, subprocess, sys
PY = re.compile(r'^```python[^\n]*\n(.*?)^```[ \t]*$', re.S | re.M)
# 파이썬 블록과 바로 뒤 별도 출력 블록 한 쌍
PAIR = re.compile(r'^```python[^\n]*\n.*?^```[ \t]*\n\s*```[ \t]*\n.*?^```[ \t]*$', re.S | re.M)
code = lambda b: [l for l in b.split('\n') if l.strip() and not l.lstrip().startswith('#')]
SEP = {}   # 별도 출력 블록이 있던 글
# (글, 0부터 센 블록, 새 블록에 있어야 할 말, 새 블록에 없어야 할 옛 주석 줄 또는 None)
MOVED = [
    ('doubly-robust', 0, 'DR(이중 강건)은 보상 모델과 성향점수 중 하나만 맞아도 값이 산다', '# DR(이중 강건) — 보상 모델과 성향점수 중 하나만 맞아도 값이 산다.'),
    ('feedback-loop-bias', 1, '# (앞 블록에 이어서 돌린다.)\n# 하는 일: ', None),
    ('feedback-loop-bias', 2, '# (앞 블록에 이어서 돌린다.)\n# 하는 일: ', None),
    ('feedback-loop-remedies', 0, '# (feedback-loop-bias 글의 코드에 이어서 돌린다.)\n# 하는 일: ', '# 앞 글([피드백 루프 편향](post.html?id=feedback-loop-bias))의'),
    ('feedback-loop-remedies', 1, '# (앞 블록에 이어서 돌린다.)\n# 하는 일: ', None),
]
fail = False
for post in sys.argv[1:]:
    old = subprocess.run(['git', 'show', f'HEAD:posts/{post}.md'], capture_output=True, text=True, check=True).stdout
    new = open(f'posts/{post}.md', encoding='utf-8').read()
    ob, nb = [m.group(1) for m in PY.finditer(old)], [m.group(1) for m in PY.finditer(new)]
    assert len(ob) == len(nb), (post, len(ob), len(nb))
    bad = [i for i, (a, b) in enumerate(zip(ob, nb)) if code(a) != code(b)]
    same = (PAIR if post in SEP else PY).sub('@', old) == PY.sub('@', new)
    left = len(PAIR.findall(new))
    print(f'{post}: 코드 줄이 바뀐 블록 {bad}, 블록 밖 글 {"같다" if same else "다르다"}, 파이썬 블록 바로 뒤 별도 출력 블록 {left}개')
    fail = fail or bool(bad or not same or left)
    for p, n, want, gone in MOVED:
        if p != post:
            continue
        has = want in nb[n]
        stay = gone is not None and gone in nb[n].split('\n')
        print(f'  {n + 1}번째 블록: 옮긴 말 {"있다" if has else "없다"}, 옛 주석 줄 {"남았다" if stay else "없다"}')
        fail = fail or not has or stay
sys.exit(1 if fail else 0)
EOF
````

Expected: 여덟 줄

````text
doubly-robust: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다, 파이썬 블록 바로 뒤 별도 출력 블록 0개
  1번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
feedback-loop-bias: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다, 파이썬 블록 바로 뒤 별도 출력 블록 0개
  2번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
  3번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
feedback-loop-remedies: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다, 파이썬 블록 바로 뒤 별도 출력 블록 0개
  1번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
  2번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
````

- [ ] **Step 4: 실행 검사를 돌리고 시간을 잰다**

Run:

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch7"; test -x "$SCRATCH/venv/bin/python" || python3 -m venv --without-pip "$SCRATCH/venv"
for p in doubly-robust feedback-loop-bias feedback-loop-remedies; do
  start=$(date +%s)
  python3 scripts/check-python-outputs.py --post "$p" --jobs 1 | tail -1
  echo "  $p 로컬 $(( $(date +%s) - start ))초"
  "$SCRATCH/venv/bin/python" scripts/check-python-outputs.py --post "$p" | tail -1
done
````

Expected: 아홉 줄. 글마다 `✓ 통과 1, …`, `✓ 통과 3, …`, `✓ 통과 2, 건너뜀 0 (라이브러리 없음 0, 실행 안 됨 0), 실패 0` 이 로컬과 venv 에서 한 번씩 나오고, 그 사이에 시간 줄이 있다. 계획을 쓸 때 잰 로컬 시간은 doubly-robust 2초, feedback-loop-bias 25초, feedback-loop-remedies 50초다(블록 하나씩 돌려서). feedback-loop-remedies 가 90초를 넘으면 보고서에 적고 알린다. CI 의 블록 한도 120초에 닿을 수 있다(Review Focus 1). NameError 로 실패하면 이어서 돌리는 표시가 빠진 것이다. 멈추고 알린다.

- [ ] **Step 5: 형식 검사, 말투 검사, 기준표**

Run: `node scripts/check-code-blocks.js | tail -1`
Expected: `✓ 새 형식 블록 235개, 옛 형식 블록 12개, 문제 0건`

Run: `node scripts/check-wording.js`
Expected: 종료 코드 0

Run: `node scripts/check-code-blocks.js --update`
Expected: `기준표를 다시 적었습니다 — 옛 형식 블록 12개, 글 3편`

- [ ] **Step 6: 커밋**

````bash
git add posts/doubly-robust.md posts/feedback-loop-bias.md posts/feedback-loop-remedies.md scripts/code-blocks-baseline.json
git commit -F - <<'EOF'
feat(posts): 마지막 묶음 글 — Doubly Robust, 피드백 루프 편향과 처방 글의 파이썬 블록 6개를 하는 일, 단계, 뜻 형식으로

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

---

### Task 6: 인터뷰 세 편 블록 12개와 별도 출력 블록 12개 옮기기, 여쭤볼 것

**Files:**
- Modify: `posts/interview-experiment-metrics.md` (5개), `posts/interview-ml-modeling.md` (4개), `posts/interview-system-design.md` (3개). 파이썬 블록마다 바로 아래의 별도 출력 블록을 지운다
- Modify: `scripts/code-blocks-baseline.json` (`{}` 가 된다)
- Modify (Step 7, 사용자가 고치기로 한 곳만): `posts/interview-experiment-metrics.md`, `posts/multi-task-learning.md`, `posts/negative-sampling-bias.md`, `posts/deep-ctr-models.md`, `posts/dcn-vs-din-slot.md`, `posts/kakao-ads-products.md`, `posts/interview-system-design.md`

**Interfaces:**
- Consumes: `$SCRATCH/migrate_batch7.py`, 이 계획 부록 15~17 의 새 블록 12개
- Produces: 새 형식 블록 247개, 옛 형식 블록 0개, 기준표 `{}`

12개 모두 표준 라이브러리로 돈다. 표시 줄 끝의 `sep` 를 본 도우미가 바로 아래 별도 출력 블록을 블록 안 출력 영역으로 옮기고 지운다(Review Focus 2).

- [ ] **Step 1: 도우미가 있는지 본다**

Run (저장소 루트에서):

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch7"; mkdir -p "$SCRATCH"
python3 - migrate_batch7.py <<'EOF'
import os, re, sys
T = '`' * 4
plan = open('docs/superpowers/plans/2026-10-16-python-code-blocks-batch7.md', encoding='utf-8').read()
for name in sys.argv[1:]:
    m = re.search(r'^<!-- file \$SCRATCH/' + re.escape(name) + r' -->\n' + T + r'[a-z]*\n(.*?)^' + T + r'\n', plan, re.S | re.M)
    dest = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'code-steps-batch7', name)
    if not os.path.exists(dest):
        open(dest, 'w', encoding='utf-8').write(m.group(1))
    print(dest)
EOF
````

Expected: 파일 경로 한 줄

- [ ] **Step 2: 세 편을 차례로 옮긴다**

Run:

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch7"
for p in interview-experiment-metrics interview-ml-modeling interview-system-design; do
  python3 "$SCRATCH/migrate_batch7.py" docs/superpowers/plans/2026-10-16-python-code-blocks-batch7.md posts "$p" || break
done
````

Expected: 세 줄

````text
interview-experiment-metrics: 블록 5개를 옮겼습니다 (별도 출력 블록 5개를 안으로 옮겨 지웠습니다)
interview-ml-modeling: 블록 4개를 옮겼습니다 (별도 출력 블록 4개를 안으로 옮겨 지웠습니다)
interview-system-design: 블록 3개를 옮겼습니다 (별도 출력 블록 3개를 안으로 옮겨 지웠습니다)
````

`바꾸지 않고 멈춥니다` 가 나오면 거기서 멈추고, 까닭 줄과 그때까지 옮긴 글을 그대로 알린다.

- [ ] **Step 3: 코드 줄과 블록 밖 글이 그대로인지, 별도 출력 블록이 남지 않았는지 본다**

Run:

````bash
python3 - interview-experiment-metrics interview-ml-modeling interview-system-design <<'EOF'
import re, subprocess, sys
PY = re.compile(r'^```python[^\n]*\n(.*?)^```[ \t]*$', re.S | re.M)
# 파이썬 블록과 바로 뒤 별도 출력 블록 한 쌍
PAIR = re.compile(r'^```python[^\n]*\n.*?^```[ \t]*\n\s*```[ \t]*\n.*?^```[ \t]*$', re.S | re.M)
code = lambda b: [l for l in b.split('\n') if l.strip() and not l.lstrip().startswith('#')]
SEP = {'interview-experiment-metrics', 'interview-ml-modeling', 'interview-system-design'}   # 별도 출력 블록이 있던 글
# (글, 0부터 센 블록, 새 블록에 있어야 할 말, 새 블록에 없어야 할 옛 주석 줄 또는 None)
MOVED = [
    ('interview-experiment-metrics', 1, '# 3단계: CUPED 로 실험 전 지출이 설명하는 부분을 빼고 비교한다', '# CUPED — 실험 전 지출로 설명되는 부분을 빼고 비교한다'),
    ('interview-experiment-metrics', 4, '어트리뷰션 규칙 넷', '# 어트리뷰션 — 같은 전환을 규칙에 따라 다르게 나눈다'),
    ('interview-ml-modeling', 3, '실무에서 흔히 쓰는 일자별 통계다', '# 피처: "그 날 그 소재의 CTR" — 실무에서 흔히 쓰는 일자별 통계'),
    ('interview-system-design', 1, '# 1단계: 요청 처리 시간 20만 건을 뽑는다', None),
]
fail = False
for post in sys.argv[1:]:
    old = subprocess.run(['git', 'show', f'HEAD:posts/{post}.md'], capture_output=True, text=True, check=True).stdout
    new = open(f'posts/{post}.md', encoding='utf-8').read()
    ob, nb = [m.group(1) for m in PY.finditer(old)], [m.group(1) for m in PY.finditer(new)]
    assert len(ob) == len(nb), (post, len(ob), len(nb))
    bad = [i for i, (a, b) in enumerate(zip(ob, nb)) if code(a) != code(b)]
    same = (PAIR if post in SEP else PY).sub('@', old) == PY.sub('@', new)
    left = len(PAIR.findall(new))
    print(f'{post}: 코드 줄이 바뀐 블록 {bad}, 블록 밖 글 {"같다" if same else "다르다"}, 파이썬 블록 바로 뒤 별도 출력 블록 {left}개')
    fail = fail or bool(bad or not same or left)
    for p, n, want, gone in MOVED:
        if p != post:
            continue
        has = want in nb[n]
        stay = gone is not None and gone in nb[n].split('\n')
        print(f'  {n + 1}번째 블록: 옮긴 말 {"있다" if has else "없다"}, 옛 주석 줄 {"남았다" if stay else "없다"}')
        fail = fail or not has or stay
sys.exit(1 if fail else 0)
EOF
````

Expected: 일곱 줄

````text
interview-experiment-metrics: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다, 파이썬 블록 바로 뒤 별도 출력 블록 0개
  2번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
  5번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
interview-ml-modeling: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다, 파이썬 블록 바로 뒤 별도 출력 블록 0개
  4번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
interview-system-design: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다, 파이썬 블록 바로 뒤 별도 출력 블록 0개
  2번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
````

「블록 밖 글 같다」는 옛 글에서 파이썬 블록과 바로 아래 별도 출력 블록 한 쌍을, 새 글에서 파이썬 블록 하나를 지우고 견준 결과다.

- [ ] **Step 4: 실행 검사를 돌린다**

Run:

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch7"; test -x "$SCRATCH/venv/bin/python" || python3 -m venv --without-pip "$SCRATCH/venv"
for p in interview-experiment-metrics interview-ml-modeling interview-system-design; do
  python3 scripts/check-python-outputs.py --post "$p"; echo "  exit=$?"
  "$SCRATCH/venv/bin/python" scripts/check-python-outputs.py --post "$p" | tail -1
done
````

Expected: 글마다 같은 줄 두 번과 `exit=0`. 차례로 `✓ 통과 5, 건너뜀 0 (라이브러리 없음 0, 실행 안 됨 0), 실패 0`, `✓ 통과 4, …`, `✓ 통과 3, …` 이다.

- [ ] **Step 5: 형식 검사, 말투 검사, 기준표를 비운다**

Run: `node scripts/check-code-blocks.js | tail -1`
Expected: `✓ 새 형식 블록 247개, 옛 형식 블록 0개, 문제 0건`

Run: `node scripts/check-wording.js`
Expected: 종료 코드 0

Run: `node scripts/check-code-blocks.js --update && cat scripts/code-blocks-baseline.json`
Expected: 두 줄 `기준표를 다시 적었습니다 — 옛 형식 블록 0개, 글 0편` 과 `{}`. 이제 옛 형식 파이썬 블록이 어느 글에 하나라도 생기면 형식 검사가 실패한다(spec 8-2 「마지막」).

- [ ] **Step 6: 커밋**

````bash
git add posts/interview-experiment-metrics.md posts/interview-ml-modeling.md posts/interview-system-design.md scripts/code-blocks-baseline.json
git commit -F - <<'EOF'
feat(posts): 마지막 묶음 글 — 실험과 지표, ML 모델링, 시스템 설계 인터뷰 글의 파이썬 블록 12개를 하는 일, 단계, 뜻 형식으로

블록 바로 아래의 별도 출력 블록 12개는 블록 안 출력 영역으로 옮기고 지웠다.
옛 형식 블록이 남지 않아 기준표를 비웠다.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

- [ ] **Step 7: 사용자가 고치기로 한 「여쭤볼 것 후보」를 고친다**

사용자가 이 계획을 확인하며 고치기로 한 곳만 고친다. 하나도 고치지 않기로 했으면 Step 7, 8 을 건너뛴다. 컨트롤러는 태스크를 보내기 전에 아래 `FIX` 목록에서 고치지 않기로 한 줄을 지우고, 그 수에 맞게 Expected 와 Step 8 의 줄 수를 고친다. 찾을 글이 파일에 꼭 한 번 있어야 하고, 고친 뒤 글이 파일에 이미 있으면 안 된다. 하나라도 어긋나면 아무 파일도 쓰지 않고 멈춘다.

Run (저장소 루트에서):

````bash
python3 - <<'EOF'
import sys
FIX = [
    ('posts/interview-experiment-metrics.md',
     '실제 효과는 3%이고 평균 지출을 생각하면 140 언저리인데',
     '실제 효과는 3%이고 평균 지출을 생각하면 150 남짓인데'),
    ('posts/interview-experiment-metrics.md',
     '시뮬레이션 값이 이론값과 소수점 첫째 자리까지 맞는다.',
     '시뮬레이션 값이 이론값과 0.5%p 안쪽으로 맞는다.'),
    ('posts/multi-task-learning.md',
     '정확히 한쪽이 오르면 한쪽이 내리는 현상 현상입니다.',
     '정확히 한쪽이 오르면 한쪽이 내리는 현상입니다.'),
    ('posts/negative-sampling-bias.md',
     '진짜 값 1.99%와 소수점 둘째 자리에서 만납니다.',
     '진짜 값 1.99%와 0.01%p 차이입니다.'),
    ('posts/kakao-ads-products.md',
     'A는 입찰가만 보면 9,000원으로 두 번째로 높다.',
     'A는 입찰가만 보면 9,000원으로 가장 높다.'),
    ('posts/deep-ctr-models.md',
     '6절에서 DIN의 어텐션은 전체의 0.0133%였습니다.',
     '6절에서 DIN의 어텐션은 embedding table의 0.0133%였습니다.'),
    ('posts/dcn-vs-din-slot.md',
     'DIN 모듈의 관심 벡터는 러닝화 광고 앞에서 첫 번째 값이 4.911, 커피머신 광고 앞에서 둘째 값이 1.897 로 서로 다릅니다.',
     'DIN 모듈의 관심 벡터는 첫 번째 값이 러닝화 광고 앞에서 4.911, 커피머신 광고 앞에서 0.495 로 서로 다릅니다.'),
    ('posts/interview-system-design.md',
     '왼쪽에서 오른쪽으로 이어지는 여섯 단계 흐름도.',
     '왼쪽에서 오른쪽으로 이어지는 다섯 단계 흐름도.'),
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

Expected: `8곳을 고쳤습니다 (7편)` (여덟 곳 다 고치기로 했을 때. interview-experiment-metrics 는 두 곳이다)

- [ ] **Step 8: 고친 것만 바뀌었는지 보고 커밋한다**

Run:

````bash
git diff --stat | tail -1
node scripts/check-wording.js; echo "wording exit=$?"
node scripts/check-code-blocks.js | tail -1
for p in interview-experiment-metrics multi-task-learning negative-sampling-bias deep-ctr-models dcn-vs-din-slot kakao-ads-products interview-system-design; do
  python3 scripts/check-python-outputs.py --post "$p"; echo "  exit=$?"
done
````

Expected: ` 7 files changed, 8 insertions(+), 8 deletions(-)`, `wording exit=0`, `✓ 새 형식 블록 247개, 옛 형식 블록 0개, 문제 0건`, 그다음 차례로 `✓ 통과 5`, `✓ 통과 3`, `✓ 통과 7`, `✓ 통과 5`, `✓ 통과 1`, `✓ 통과 1`, `✓ 통과 3` 로 시작하는 일곱 줄(실패 0)과 `exit=0` 일곱 줄. 기준표는 바뀌지 않는다. `git diff` 로 바뀐 줄을 눈으로도 본다 — 바뀐 것은 「여쭤볼 것 후보」의 「고칠 글」뿐이어야 한다. 고친 글만 stage 한다.

````bash
git add posts/interview-experiment-metrics.md posts/multi-task-learning.md posts/negative-sampling-bias.md posts/deep-ctr-models.md posts/dcn-vs-din-slot.md posts/kakao-ads-products.md posts/interview-system-design.md
git commit -F - <<'EOF'
fix(posts): 마지막 묶음 글 — 사용자가 고치기로 한 본문 여덟 곳을 코드가 찍는 값과 맞게 고친다

interview-experiment-metrics 의 「140 언저리」를 「150 남짓」으로, 「소수점 첫째 자리까지 맞는다」를 「0.5%p 안쪽으로 맞는다」로,
multi-task-learning 의 「현상 현상」을 「현상」으로,
negative-sampling-bias 의 「소수점 둘째 자리에서 만납니다」를 「0.01%p 차이입니다」로,
kakao-ads-products 의 「두 번째로 높다」를 「가장 높다」로,
deep-ctr-models 의 「전체의 0.0133%」를 「embedding table의 0.0133%」로,
dcn-vs-din-slot 의 「둘째 값이 1.897」을 같은 자리의 값 「0.495」로,
interview-system-design 의 그림 설명 「여섯 단계 흐름도」를 「다섯 단계 흐름도」로.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

---

### Task 7: 마지막 묶음 확인과 올리기

**Files:** 없음 (확인, 커밋 합치기, push)

**Interfaces:**
- Consumes: Task 1~6 의 커밋
- Produces: 사용자 확인, 그 뒤 main 에 올린 마지막 묶음. 올리는 커밋은 계획 문서 1개와 글 옮기기 1개다(합치기 전에는 글 커밋 6개, Task 6 Step 7 을 했으면 7개, 그리고 리뷰 고침).

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

Expected: 마지막 줄 `ALL-OK`. 그 위 줄들 가운데 `✓ 새 형식 블록 247개, 옛 형식 블록 0개, 문제 0건`, `94 통과, 0 실패`, `22 통과, 0 실패`, `21 통과, 0 실패`, `✓ 통과 236, 건너뜀 11 (라이브러리 없음 0, 실행 안 됨 11), 실패 0` 이 있다.

CI 와 같은 표준 라이브러리 파이썬으로도 돌린다:

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch7"; test -x "$SCRATCH/venv/bin/python" || python3 -m venv --without-pip "$SCRATCH/venv"
"$SCRATCH/venv/bin/python" scripts/test-python-outputs.py | tail -1
"$SCRATCH/venv/bin/python" scripts/check-python-outputs.py | tail -1
````

Expected: `21 통과, 0 실패` 와 `✓ 통과 222, 건너뜀 25 (라이브러리 없음 14, 실행 안 됨 11), 실패 0` (여섯째 묶음의 라이브러리 없음 10 에 negative-sampling-bias 둘과 lookalike-modeling 둘이 더해지고, 실행 안 됨 9 에 audience-segmentation 둘이 더해졌다)

- [ ] **Step 2: 숫자로 재고 그림을 찍는다**

서버 파일이 있는지 보고, 없으면 계획에서 뽑는다(저장소 루트에서).

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch7"; mkdir -p "$SCRATCH"
python3 - nocache_server.py <<'EOF'
import os, re, sys
T = '`' * 4
plan = open('docs/superpowers/plans/2026-10-16-python-code-blocks-batch7.md', encoding='utf-8').read()
for name in sys.argv[1:]:
    m = re.search(r'^<!-- file \$SCRATCH/' + re.escape(name) + r' -->\n' + T + r'[a-z]*\n(.*?)^' + T + r'\n', plan, re.S | re.M)
    dest = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'code-steps-batch7', name)
    if not os.path.exists(dest):
        open(dest, 'w', encoding='utf-8').write(m.group(1))
    print(dest)
EOF
````

서버를 백그라운드로 띄운다: `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch7"; python3 "$SCRATCH/nocache_server.py" "$(pwd)" 8776`. 아무 글이나 새 캐시(`isolatedContext` 이름 `b7t7`)로 연 뒤 아래 함수를 돌린다. 17편 모두 글 id 와 파일 이름이 같다.

````js
async () => {
  const POSTS = [
    'deep-ctr-models', 'behavior-sequence-attention', 'din-architecture', 'dcn-vs-din-slot',
    'multi-task-learning', 'negative-sampling-bias', 'audience-segmentation', 'lookalike-modeling',
    'kakao-ads-prediction-targeting', 'kakao-ads-products', 'kakao-ads-bidding-measurement', 'doubly-robust',
    'feedback-loop-bias', 'feedback-loop-remedies', 'interview-experiment-metrics', 'interview-ml-modeling',
    'interview-system-design',
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

Expected: 네 폭 모두 글마다 `"<블록 수> true <출력 없는 블록> 0 false 0 0 0"` 이다(값 68개). 블록 수는 목록 차례로 5, 6, 1, 1, 3, 7, 2, 2, 1, 1, 2, 1, 3, 2, 5, 4, 3 이고, 출력 없는 블록은 negative-sampling-bias 5, audience-segmentation 2, 나머지 0 이다. 넷째 값(바로 뒤 다른 코드 블록)이 0 이 아니면 별도 출력 블록이 남은 것이다(Review Focus 2).

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

Expected: `{"posts":108,"numbers":5232,"overflow":[],"broken":[]}` (계획을 쓸 때 잰 값. 이 묶음의 리뷰가 블록 글을 고쳤다면 `numbers` 만 조금 다를 수 있다. 보고서에 그대로 적는다)

그림을 `.playwright-mcp/batch7/` 에 여섯 장 찍는다. 아래 세 편을 1440 폭 라이트와 390 폭 라이트로 한 장씩이다. 블록이 길면 머리와 출력 영역으로 나눠 찍고 이름에 `-top`, `-out` 을 붙인다. 390 폭에서 파란 메뉴 단추(`#sidebar-toggle`)가 코드를 가리면 감싸는 페이지의 iframe 문서에 `#sidebar-toggle{display:none !important}` 를 넣은 `<style>` 을 붙여 숨긴다. 문서에 `scroll-behavior: smooth` 가 있어 `scrollTo` 에는 `behavior: 'instant'` 를 준다.

| 글 | 블록 | 볼 것 |
|---|---|---|
| interview-ml-modeling | 셋째 (모델 셋의 AUC, 로그로스, COPC) | 별도 출력 블록에 있던 줄이 출력 영역에 4단계 뜻과 함께 있고, 그 아래 본문이 원래 순서로 이어진다. 빈 코드 상자가 없다 |
| feedback-loop-remedies | 첫째 (기본과 처방 셋의 표) | 머리에 「앞 글에 이어서」 라벨과 feedback-loop-bias 로 가는 링크가 선다 |
| negative-sampling-bias | 일곱째 (P/O 모니터링 함수) | 출력 영역 없이 끝나고, 마지막 메모 한 줄이 돌려주는 값의 예를 말한다 |

서버를 끈다.

- [ ] **Step 3: 확인 페이지를 만든다** (컨트롤러)

여섯째 묶음처럼 비공개 artifact 한 장에 담는다. 바뀌는 것(글 17편, 블록 49개, 별도 출력 블록 12개가 블록 안으로, 기준표가 비어 옛 형식 블록 0개, 코드와 검사는 그대로), 그림, 검사 결과(로컬과 표준 라이브러리 파이썬 둘 다), 올리면 하는 일(커밋 수, 합치는 글 커밋, rebase, `ubuntu-24.04` 에서 도는 글 검사와 가장 오래 도는 블록), 「이 계획에서 정한 것」 가운데 독자가 보는 것(새 상태 표시 일곱, 메모로 옮긴 출력 예시, 다시 돌려 받아 적은 `[83]`, 출력 머리 「(파이썬 3.9)」, 글쓰기 규칙 문서의 상태 표시 예), 「고친 본문」 절(Task 6 Step 7 로 고친 곳의 전후)과 「여쭤볼 것」 절(고치지 않기로 한 후보와 블록을 옮기며 새로 찾은 것)을 쓴다.

- [ ] **Step 4: 사용자 확인을 받는다** (컨트롤러)

그림과 함께 바뀐 것을 짧게 알린다. 고친 곳이 있으면 전후를 보인다. 「여쭤볼 것」이 있으면 고칠지 함께 묻고, 고치기로 하면 글 커밋(`fix(posts): 마지막 묶음 글 — …`)으로 고친 뒤 Step 1 부터 다시 한다. 사용자가 올려도 된다고 하기 전에는 push 하지 않는다.

- [ ] **Step 5: 글 커밋을 하나로 합친다** (사용자 확인 뒤)

합치기 전에 무엇을 합칠지 본다.

Run:

````bash
FIRST=$(git log --reverse --format=%H --fixed-strings --grep='(posts): 마지막 묶음 글 —' origin/main..HEAD | head -1)
BASE=$(git rev-parse "$FIRST^")
git log --format='%h %s' "$BASE..HEAD"
git diff --stat "$BASE" HEAD | tail -1
````

Expected: `git log` 의 줄이 모두 `feat(posts): 마지막 묶음 글 —` 이나 `fix(posts): 마지막 묶음 글 —` 로 시작한다. `git diff --stat` 의 마지막 줄은 `18 files changed` 로 시작한다(글 17편과 `scripts/code-blocks-baseline.json`). 다른 커밋이 끼어 있으면 합치지 않고 그대로 올린다고 사용자에게 알린다.

위 결과가 맞을 때만 합친다. 셸 변수는 명령마다 사라지므로 아래 한 명령 안에서 `FIRST` 와 `BASE` 를 다시 구하고, 그 사이 커밋이 모두 글 커밋인지 다시 본 뒤 합친다. 하나라도 어긋나면 거기서 멈춘다. Task 6 Step 7 로 본문을 고치지 않았으면 아래 커밋 글의 「블록 밖 본문은 사용자가 고치기로 한 여덟 곳만 고쳤다(…).」를 「블록 밖 본문은 그대로다.」로 바꿔 넣고, 일부만 고쳤으면 그 수와 글 이름으로 바꾼다.

Run:

````bash
FIRST=$(git log --reverse --format=%H --fixed-strings --grep='(posts): 마지막 묶음 글 —' origin/main..HEAD | head -1)
test -n "$FIRST" || { echo '글 커밋을 못 찾았다'; exit 1; }
BASE=$(git rev-parse "$FIRST^") || exit 1
OTHER=$(git log --format='%s' "$BASE..HEAD" | grep -v -e '^feat(posts): 마지막 묶음 글 —' -e '^fix(posts): 마지막 묶음 글 —')
test -z "$OTHER" || { echo "글 커밋이 아닌 커밋이 끼어 있다: $OTHER"; exit 1; }
TREE=$(git rev-parse 'HEAD^{tree}')
git reset --soft "$BASE" || exit 1
git commit -F - <<'EOF' || exit 1
feat(posts): 마지막 묶음 글 17편의 파이썬 블록 49개를 하는 일, 단계, 뜻 형식으로 — 옛 형식 블록 0개

딥 CTR 6편 23개, 타겟팅과 카카오 5편 8개, 판단 3편 6개, 인터뷰 3편 12개.
인터뷰 3편의 별도 출력 블록 12개는 블록 안 출력 영역으로 옮겼다. 옛 형식 블록이 남지 않아 기준표를 비웠다.
실행되는 코드 줄은 그대로이고, 블록 밖 본문은 사용자가 고치기로 한 여덟 곳만 고쳤다(interview-experiment-metrics 두 곳, multi-task-learning, negative-sampling-bias, kakao-ads-products, deep-ctr-models, dcn-vs-din-slot, interview-system-design).
lookalike-modeling 둘째 블록은 설계 문서 8-1 대로 찍힌 줄을 돌려 받아 적었고,
negative-sampling-bias 일곱째 블록의 출력 예시는 메모로 옮겼다.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
test "$(git rev-parse 'HEAD^{tree}')" = "$TREE" && echo '트리 같음'
git log --format='%h %s' origin/main..HEAD
````

Expected: `트리 같음` 과 두 줄 — 맨 위가 방금 합친 `feat(posts): 마지막 묶음 글 17편의 …` 이고, 그 아래가 계획 문서 커밋이다(계획을 고친 커밋이 있으면 그만큼 더).

- [ ] **Step 6: 올린다** (컨트롤러)

Run: `git fetch origin && git rebase origin/main && git status -sb | head -1 && git log --format='%h %ae %s' origin/main..HEAD`
Expected: 내 커밋만 있고 작성자가 모두 `37789148+chkimsu@users.noreply.github.com` 이다. 다른 세션의 커밋이 있으면 멈추고 알린다. rebase 로 들어온 커밋이 있으면 Step 1 의 검사를 다시 돌린다.

자동 권한 검사가 `git push` 를 막으므로, 사용자에게 프롬프트에 `! git push origin main` 을 입력해 달라고 부탁한다.

- [ ] **Step 7: 글 검사를 본다** (컨트롤러)

push 뒤 5분쯤 기다렸다가 `gh run list --limit 5 --json databaseId,name,status,conclusion,headSha` 를 한 번 돌려 push 한 커밋의 run 셋(Validate posts, Update sitemap.xml + feed.xml, pages build and deployment)을 찾는다. 아직 돌고 있으면 몇 분 더 기다려 한 번 더 본다. `gh run watch` 를 쓰면 `--interval 60` 이상으로 둔다(API 가 시간당 60번이다).

Expected: Validate posts 가 success 다. `gh api repos/chkimsu/adtech-blog/actions/runs/<id>/jobs --jq '.jobs[] | "labels=\(.labels) conclusion=\(.conclusion)", (.steps[] | [.name, .conclusion, .started_at, .completed_at] | @tsv)'` 로 `["ubuntu-24.04"]` 와 단계마다 success 를 보고, `파이썬 블록 실행 (표준 라이브러리, 찍힌 줄과 단계)` 단계에 걸린 시간을 적는다(Review Focus 1). run 의 로그는 읽지 않는다(관리자 권한이 필요하고 로컬 gh 는 github.com 에 로그인돼 있지 않다). 실행 검사 단계가 실패하면 시간 초과일 수 있다. 코드를 바꾸지 말고 멈춰 알린다.

봇의 사이트맵 커밋이 새 배포를 띄우면 앞 배포는 「cancelled」로 남는다. 그때는 새 배포의 결과를 본다.

- [ ] **Step 8: 공개 블로그에서 본다** (컨트롤러)

페이지 배포가 끝나면 새 캐시로 `https://chkimsu.github.io/adtech-blog/post.html?id=deep-ctr-models` 를 연다. Step 2 의 목록 17편을 숨긴 iframe 으로 차례로 열어 `.post-content .cb` 수(5, 6, 1, 1, 3, 7, 2, 2, 1, 1, 2, 1, 3, 2, 5, 4, 3)와 옛 형식 파이썬 블록(`.cb` 밖의 `pre code.language-python`) 0개, 콘솔 오류 0 을 확인한다. 인터뷰 3편은 파이썬 블록 바로 뒤에 다른 코드 블록이 없는지도 본다. Task 6 Step 7 로 고친 문장이 있으면 그 글에서 고친 문장이 보이고 고치기 전 문장이 없는지도 본다.
