# 파이썬 코드 블록 개편 — 넷째 묶음 실행 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 경매 분류 13편과 밴딧 분류 7편, 글 20편의 파이썬 블록 44개를 하는 일, 단계, 뜻 형식으로 옮긴다. 검사와 화면 코드는 바꾸지 않는다.

**Architecture:** 글만 옮기는 묶음이다. 셋째 묶음의 도우미를 이어받은 저장소 밖 도우미 `migrate_batch4.py` 가 이 계획 부록의 새 블록 전문을 읽어 바꾼다. 도우미는 원본 블록의 해시, 코드 줄, 옛 출력의 찍힌 줄을 먼저 견주고, 하나라도 다르면 아무것도 바꾸지 않는다. 옛 출력이 코드가 찍는 값과 달라 설계 문서 8-1 이 고치라고 한 블록 4개는 표시 줄 끝에 `old=run` 을 붙인다. 도우미는 그 넷의 찍힌 줄 비교를 건너뛰고, 그 찍힌 줄은 실행 검사가 본다.

**Tech Stack:** Python 3.9 표준 라이브러리(로컬 `python3` 는 3.9.7 이고 numpy 1.26.4, scipy 1.11.4 도 있다), node 20, GitHub Actions(`runs-on: ubuntu-24.04` 고정, 파이썬 3.9), 브라우저 도구(Chrome DevTools MCP. Playwright MCP 는 연결되지 않는다).

**Spec:** `docs/superpowers/specs/2026-10-13-python-code-blocks-design.md` (8-1 블록 상태, 8-2 묶음, 8-3 옮길 때 지킬 것). 꼴과 관례는 셋째 묶음 계획 `docs/superpowers/plans/2026-10-14-python-code-blocks-batch3.md` 를 따른다.

> 새 블록 44개의 전문은 태스크 앞의 「부록: 새 블록 44개」 절에 있다. 태스크는 그 뒤에 Task 1 부터 Task 6 까지 이어진다.

> 이 계획의 새 블록 44개, 도우미, 기대 출력은 계획을 쓸 때 저장소 사본(main `52c4de3`, 셋째 묶음의 글 옮기기와 본문 고침까지 들어간 상태)에 그대로 적용해 돌려 본 것이다. CI 검사 12가지, 20편의 형식 검사와 실행 검사, 표준 라이브러리만 있는 파이썬 3.9 의 실행 검사, 1440, 1280, 1024, 390 폭의 배치 숫자, 390 폭의 숫자 줄바꿈 훑기가 통과했다. 셋째 묶음 리뷰 고침이 들어간 `b2e1b77` 의 복제본에서도 Task 1~5 와 Task 6 Step 1, 5 의 셸 명령을 이 문서 그대로 돌려 기대 출력과 같았다. 셋째 묶음이 올라간 뒤(새 형식 76개, 옛 형식 171개, 68편)에서 시작한다. Task 1 Step 1 이 이 상태를 먼저 본다.

## Global Constraints

- 공개 저장소다. 사내 시스템, 플랫폼 이름을 블록 안 글, 커밋 메시지 어디에도 쓰지 않는다.
- 이 묶음은 글만 옮긴다. 바꾸는 파일은 `posts/` 의 20편과 `scripts/code-blocks-baseline.json` 뿐이다. 검사, 시험, `js/`, `css/`, `.github/` 는 바꾸지 않는다.
- 블록 안 글(하는 일, 단계 제목, 풀이, 메모, 뜻)은 평서체 `~한다, ~이다` 로 쓴다. 숫자 뒤에 조사나 「이다」가 오면 한 칸 띄운다(`0.7257 로`, `154 다`). 개수를 세는 말은 붙인다(`8건`, `5번`).
- 해요체, `저희`, 가운뎃점, `실측`, `실체`, `축`, `가른다`, `갈린다`, 열하나 이상의 말로 쓴 숫자, 지어낸 말을 쓰지 않는다. 블록 안에 새 비유를 넣지 않는다. `node scripts/check-wording.js` 가 posts/ 의 코드 블록 안까지 센다.
- 실행되는 코드 줄은 바꾸지 않는다(spec 8-3). 줄 끝 주석도 그대로 둔다. 원래 주석의 내용은 하는 일, 풀이, 메모, 뜻으로 나눠 옮기고 버리지 않는다. 예외는 아래 「고칠 곳 다섯」의 ltv-ad-ranking 줄 끝 주석 하나다.
- 블록 밖의 본문은 바꾸지 않는다(사용자 결정 「본문은 그대로 둔다」). 예외는 사용자가 이 계획을 확인하며 이번 묶음에서 고치기로 한 「고칠 곳 다섯」뿐이고, Task 5 Step 7 이 글 커밋 하나로 고친다. 그 밖에 새로 찾은 사실 오류는 고치지 않고 Task 6 의 확인 페이지 「여쭤볼 것」에서 사용자에게 묻는다.
- 표시 꼴은 spec 그대로다 — `# 하는 일: …`, `# N단계: …`, `# 출력:`, `# N단계 뜻: …` 또는 `# 뜻: …`. 이 묶음의 44개에는 상태 표시와 `# 출력 (…):` 머리가 없다.
- 실행 검사는 파이썬 3.9 로 돌린다(`python3 --version` 이 `Python 3.9.7`). 3.12 이상에서는 두 블록이 다른 값을 찍는다(아래 Review Focus 1).
- 이 계획 문서는 Task 1 전에 `docs/superpowers/plans/2026-10-14-python-code-blocks-batch4.md` 로 커밋돼 있어야 한다. 임시 폴더 도구를 뽑는 명령과 글 옮기기 도우미가 이 파일을 읽는다.
- 이 계획의 코드 블록(네 백틱 울타리)은 손으로 옮겨 적지 않는다. 도우미가 부록을 그대로 읽는다. 리뷰에서 블록 글을 고칠 때만 Edit 로 고치고, 찾을 글은 파일에 꼭 한 번 있어야 한다.
- 커밋은 git 사용자 `chkimsu` 로 한다. 파일을 이름으로 stage 한다(`git add -A` 금지). 글 커밋 제목은 `feat(posts): 경매와 밴딧 글 — …` 이나 `fix(posts): 경매와 밴딧 글 — …` 로 시작한다. 마지막 줄은 그 커밋을 만든 모델의 Co-Authored-By 줄이다(예: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`).
- push 는 Task 6 에서 사용자 확인을 받은 뒤에만 한다. push 전에 `git fetch origin && git rebase origin/main` 을 한다(CI 가 sitemap 과 feed 를 다시 커밋한다).
- 임시 파일은 저장소 밖에 둔다. 아래 명령의 `$SCRATCH` 는 `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch4"; mkdir -p "$SCRATCH"` 로 정한다. 셸 변수는 명령마다 다시 정한다. 화면 그림은 저장소 안의 `.playwright-mcp/batch4/` 에 둔다(`.gitignore` 에 있다. 브라우저 도구는 저장소 밖에 그림을 쓰지 못한다). 서버는 8772 포트로 띄운다.

## Review Focus

1. **파이썬 버전에 따라 달라지는 블록** — adtech-dev-layers 첫 블록은 `random.binomialvariate` 가 있으면 그것을 쓰고, disjoint-LinUCB 셋째 블록은 내적을 `sum` 으로 구하는데 3.12 부터 실수 `sum` 의 더하는 방식이 바뀌었다. 파이썬 3.12 이상에서는 앞 블록의 12번째 찍힌 줄이 `95,835회   +54.3%` 로, 뒤 블록의 4번째 찍힌 줄이 `2.78e-17` 로 나와 실행 검사가 실패한다(계획을 쓸 때 3.12 와 3.14 로 확인했다). CI 와 로컬 `python3` 는 3.9 라 통과해야 한다. Task 1 Step 1 이 버전을 보고, Task 3 Step 4 와 Task 5 Step 4 가 두 글을 3.9 로 돌린다.
2. **CI 에 없는 라이브러리** — bid-shading-censored 첫째, 다섯째 블록(numpy, scipy)과 auto-bidding-pacing 둘째, 셋째 블록(numpy)은 CI 의 표준 라이브러리 파이썬에서 「라이브러리 없음」으로 건너뛴다. 실패가 아니라 건너뜀이어야 한다. 이 넷의 뜻 줄은 로컬 실행 검사만 본다. Task 1 Step 5 와 Task 4 Step 4 가 표준 라이브러리만 있는 venv 로 두 글을 돌리고, Task 6 Step 1 이 `통과 112, 건너뜀 8 (라이브러리 없음 7, 실행 안 됨 1)` 을 본다.
3. **옛 출력과 다른 블록** — ecpm-ranking 세 블록과 ltv-ad-ranking 첫 블록은 도우미가 찍힌 줄을 옛 출력과 견주지 않는다(`old=run`). 이 넷의 찍힌 줄을 지키는 것은 실행 검사 하나다. ecpm-ranking 첫째, 둘째 블록은 출력 영역이 새로 생기고, ltv-ad-ranking 첫 블록은 13줄이 9줄로 준다. Task 3 Step 3 과 Task 4 Step 3 이 찍힌 줄 수를 세고, 같은 태스크의 Step 4 가 실행 검사를 돌린다.
4. **마지막 코드 줄 뒤에 있던 주석** — bid-shading-censored 첫째, 다섯째, ecpm-ranking 첫째, 둘째 블록은 마지막 코드 줄 뒤에, ltv-ad-ranking 첫 블록은 옛 출력 끝에 해설 주석이 있었다. 그 내용은 뜻 줄이나 풀이로 옮겼다. 내용이 사라지거나 옛 주석이 출력 영역 앞에 홀로 남으면 안 된다. Task 1 Step 4, Task 3 Step 3, Task 4 Step 3 이 옮긴 말이 있고 옛 줄이 없는지 본다.
5. **휴대폰 폭의 긴 찍힌 줄** — bid-shading-censored 넷째 블록의 화살표 줄, ab-test-vs-mab 의 신뢰구간 줄처럼 긴 찍힌 줄이 390 폭에서 옆으로 넘치거나 숫자 중간에서 끊기면 안 된다. Task 1 Step 7 이 첫 글을 390 폭으로 재고, Task 6 Step 2 가 글 전부를 390 폭으로 훑는다.

## 이 계획에서 정한 것

| 정한 것 | 왜 | 틀렸다면 |
|---|---|---|
| 넷째 묶음은 경매 분류 13편(블록 30개)과 밴딧 분류 7편(블록 14개)이다 | 사용자가 승인한 「검사나 코드 고침이 필요 없는 묶음은 20편 안팎, 트랙 둘까지」. 두 분류의 글은 모두 표준 라이브러리나 로컬의 numpy, scipy 로 돌고 코드 고침이 필요 없다 | 다음 묶음에 글을 더하거나 뺀다 |
| 첫 글은 bid-shading-censored 다 | 블록이 5개로 가장 많고, CI 에서 건너뛰는 블록 둘, 마지막 코드 줄 뒤 주석을 옮긴 블록 둘, 단계 여섯의 블록, 화살표로 찍는 긴 줄이 다 있다 | 화면 확인 글만 바뀐다 |
| 옛 출력이 찍히는 값과 다른 4개는 찍힌 줄을 돌려 받아 적는다. 표시 줄 끝의 `old=run` 이 도우미의 찍힌 줄 비교를 건너뛰게 한다 | spec 8-1 이 이 넷을 고치라고 한다 — 찍는데 안 적은 ecpm-ranking 첫째, 둘째, 공백만 다른 ecpm-ranking 셋째, 13줄 대 9줄인 ltv-ad-ranking 첫째. 찍힌 줄은 실행 검사가 본다 | 표시 줄 넷 |
| ecpm-ranking 셋째 블록의 찍힌 줄은 이름 칸 뒤 공백이 바뀐다(`순수 eCPM :` → `순수 eCPM   :`) | 파이썬이 찍은 그대로다(spec 8-3 「찍힌 줄은 실행 검사가 낸 그대로」). 한글 이름은 글자 수로 채워 콜론 자리가 줄마다 조금 다르다 | 찍힌 줄 세 줄 |
| ltv-ad-ranking 첫 블록 옛 출력 끝의 해설 세 줄은 뜻 줄로 옮긴다 | 찍히는 줄이 아니라 해설이다. spec 8-3 이 내용을 버리지 말라고 한다 | 뜻 줄 하나 |
| 마지막 코드 줄 뒤의 주석(bid-shading-censored 첫째, ecpm-ranking 첫째, 둘째)은 뜻 줄로, bid-shading-censored 다섯째는 2단계 풀이로 옮긴다 | 그 자리의 주석은 단계 풀이도 메모도 아니라 출력 영역 앞에 홀로 남는다 | 주석 몇 줄 |
| bid-shading-censored 다섯째 블록의 「Grid Search(500개) 대비 수십 배 빠른 수렴」은 「Grid Search(500개)가 Surplus 를 500번 계산할 때, 이 탐색은 반복마다 두 번씩만 계산한다」로 옮긴다 | 이 코드는 13번 반복하며 Surplus 를 26번 계산한다. 500번의 약 19분의 1 이라 「수십 배」가 코드와 맞지 않는다. 본문의 같은 말은 「고칠 곳 다섯」대로 고친다 | 풀이 한 줄 |
| bid-shading-censored 본문은 「스무 배 가까이」가 아니라 「20배 가까이」로 고친다 | 글쓰기 규칙이 열하나 이상의 수를 숫자로 쓰게 한다 | 낱말 하나 |
| disjoint-LinUCB 10절 「한눈 정리」 표의 「오차 $10^{-16}$대(사실상 동일)」는 그대로 둔다 | 「전부」가 없어 가장 큰 오차를 말하는 요약으로 읽힌다. 다섯 회차 가운데 가장 큰 값은 `2.22e-16` 이다 | 표 칸 하나 |
| `# ── … ──`, `# (a) …`, `# 1) …`, `# --- 효과 1 ---` 꼴의 머리 주석은 단계 제목으로 바꾸고, 담긴 말은 풀이에 남긴다 | spec 8-3 「`# 1. …` 꼴의 주석은 `# N단계:` 로」 | 주석 몇 줄 |
| 「표준 라이브러리만 쓴다」는 1단계 풀이의 마지막 문장으로 남긴다 | spec 8-3 내용 보존. 글마다 적힌 자리가 달랐다 | 풀이 한 줄 |
| 뜻 줄은 그 아래 찍힌 줄에 보이는 값만, 찍힌 꼴 그대로 쓴다(`20260원`, `x=[0.25, 0.5, 1]`) | 둘째 묶음 리뷰가 찾은 블록 설명 오류가 모두 계획 부록의 글에서 왔다 | 뜻 줄 몇 개 |
| 블록 안에 새 비유를 넣지 않는다. 글이 이미 쓰는 말(「두뇌 층」, 「고리」)은 adtech-ecosystem-map 셋째 블록 풀이에 한 번 쓴다 | 사용자 결정 「비유는 쓰지마」 | 풀이 한 줄 |
| 글 커밋 머리는 `feat(posts): 경매와 밴딧 글 —` 와 `fix(posts): 경매와 밴딧 글 —` 이고, 올리기 직전에 하나로 합친다 | 셋째 묶음과 같다 | 합치기를 건너뛰고 그대로 올린다 |
| push 는 사용자가 `! git push origin main` 으로 한다 | 앞 묶음들에서 자동 권한 검사가 `git push` 를 막았다 | 사용자에게 부탁하는 줄 하나 |
| 화면 확인은 Chrome DevTools MCP 로 하고, 390 폭은 숨긴 iframe 으로 잰다. 서버는 8772 포트다 | Playwright MCP 가 연결되지 않는다. 창은 500px 아래로 줄지 않는다. 8771 은 셋째 묶음이 썼다 | 도구와 포트만 바뀐다 |

## 파일 지도

| 파일 | 맡는 일 | 태스크 |
|---|---|---|
| `posts/bid-shading-censored.md` | 블록 5개 | 1 |
| `posts/header-bidding.md`, `posts/second-price-auction.md`, `posts/dsp-ssp-exchange.md`, `posts/ad-network-vs-exchange.md`, `posts/walled-garden.md` | 블록 1, 1, 1, 3, 1개 | 2 |
| `posts/adtech-30min-primer.md`, `posts/ad-serving-flow.md`, `posts/adtech-ecosystem-map.md`, `posts/adtech-dev-layers.md`, `posts/ecpm-ranking.md` | 블록 1, 1, 3, 2, 3개 | 3 |
| `posts/ltv-ad-ranking.md`, `posts/auto-bidding-pacing.md`, `posts/exploration-exploitation.md`, `posts/mab.md`, `posts/ab-test-vs-mab.md` | 블록 4, 4, 3, 1, 2개 | 4 |
| `posts/ucb_ts.md`, `posts/TS-linTS.md`, `posts/ucb-family.md`, `posts/disjoint-LinUCB.md` | 블록 2, 2, 1, 3개 | 5 |
| `posts/mab.md`, `posts/ltv-ad-ranking.md`, `posts/ucb_ts.md`, `posts/disjoint-LinUCB.md`, `posts/bid-shading-censored.md` | 고칠 곳 다섯(본문 넷, 줄 끝 주석 하나). 한 편에 한 줄씩 | 5 (Step 7) |
| `scripts/code-blocks-baseline.json` | 171개 68편 → 166개 67편 → 159개 62편 → 149개 57편 → 135개 52편 → 127개 48편 | 1~5 |
| `$SCRATCH/migrate_batch4.py`, `$SCRATCH/nocache_server.py` | 글 옮기기 도우미와 캐시 없는 서버. 저장소에 넣지 않는다 | 1~6 |

글 파일 이름과 글 id 가 다른 글이 셋 있다. 도우미와 `--post` 는 파일 이름을, 화면의 `post.html?id=` 는 id 를 쓴다.

| 파일 이름 | 글 id |
|---|---|
| `mab` | `mab-summary` |
| `ucb_ts` | `ucb-vs-ts` |
| `disjoint-LinUCB` | `disjoint-linucb` |

## 뺀 글과 넘긴 항목

| 무엇 | 블록 | 왜 | 어디서 |
|---|---|---|---|
| 카카오 광고 시리즈 3편(kakao-ads-products, kakao-ads-bidding-measurement, kakao-ads-prediction-targeting) | 1, 2, 1 | 셋째 트랙이 된다. 한 편이 타겟팅 분류라 시리즈 셋을 한 묶음에 모은다 | 타겟팅 분류가 든 묶음 |
| 밴딧 분류가 함께 붙은 판단 트랙 3편(doubly-robust, feedback-loop-bias, feedback-loop-remedies) | 1, 3, 2 | 첫째 분류가 측정과 모델링이고 판단 트랙에 속한다. feedback-loop-remedies 는 앞 글에 이어서 돌리는 사슬(C → B → A)이 필요하다. 둘째 묶음부터 넘겨 온 일이다 | 판단 트랙이 든 묶음 |
| deep-ctr-models | 5 | 긴 글이라 배치 읽기와 쓰기 묶기가 필요하다. 둘째 묶음부터 그 글이 든 묶음으로 넘겨 온 일이다 | 그 글이 든 묶음 |
| 새 블록 글의 자체 확인(뜻 줄 값, 하는 일과 단계) | — | 둘째 묶음에서 배운 것 | 아래 「부록 자체 확인」 |

넷째 묶음 뒤에 남는 것은 옛 형식 블록 127개, 글 48편이다.

## 고칠 곳 다섯

글 20편을 블록마다 읽으며 찾은 사실 오류다. 넷은 블록 밖 본문이고, 하나는 바꾸지 않는 코드 줄의 줄 끝 주석이다. 사용자가 이 계획을 확인하며 이번 묶음에서 고치기로 했다. Task 5 Step 7 이 글 옮기기가 다 끝난 뒤 글 커밋 하나로 고친다. 고칠 글은 아래 「고칠 글」 칸 그대로이고, 도우미를 쓰지 않는다. 계획을 확인한 뒤 컨트롤러가 mab 과 ucb_ts 의 셈을 다시 돌려 「맞는 것」 칸과 같음을 확인했다.

| 어디 | 지금 적힌 것 | 맞는 것 | 고칠 글 |
|---|---|---|---|
| mab, 블록 바로 뒤 문단 | 「소재1, 소재2, 소재3, 소재5는 공교롭게 전부 2번씩 클릭돼 관측 CTR이 똑같이 10%로 동률이 났다」, 「그리디는 이 동률 중 맨 처음(소재1, 진짜 3%)을 골라 나머지 900회를 그 소재 하나에 몰아줬다.」 | 이 시드(19)의 100회 탐색에서 넷은 1번씩 클릭돼 관측 CTR 이 5% 로 같았다(소재4 는 0번). 그리디는 소재1 부터 고르지만 관측 평균이 떨어질 때마다 다음 1등으로 옮겨, 나머지 900회 가운데 776회를 소재5(진짜 5%)에, 102회를 소재1 에, 11회씩을 소재2 와 소재3 에 썼다 | 「소재1, 소재2, 소재3, 소재5는 공교롭게 전부 1번씩 클릭돼 관측 CTR이 똑같이 5%로 동률이 났다」, 「그리디는 이 동률 중 맨 처음(소재1)부터 고르다가 관측 평균이 떨어질 때마다 옮겨 다녀, 나머지 900회 가운데 776회를 소재5(진짜 5%)에 몰아줬다. 진짜 1등 소재2는 11회뿐이었다.」 |
| ltv-ad-ranking 둘째 블록, 코드 줄의 줄 끝 주석 | `# 양수면 LTV로 갈수록 순위가 내려간 것` | delta 는 eCPM 순위에서 LTV 순위를 뺀 값이다. 기저귀는 4위에서 1위로 올라 `+3` 이다. 양수면 LTV 로 보면 순위가 올라간 것이다. 새 블록의 뜻 줄은 부호를 다시 말하지 않는다 | `# 양수면 LTV로 보면 순위가 올라간 것`. 주석 앞의 코드와 공백은 그대로 둔다 |
| ucb_ts, 둘째 블록 뒤 둘째 문단 | 「톰슨 샘플링의 누적 후회가 매번 UCB1의 절반을 넘지 않았다」 | 시드 1~20 으로 돌리면 17개는 절반 아래지만 3개(7, 11, 18)는 넘는다. 가장 큰 것은 시드 11 의 0.90배다 | 「톰슨 샘플링의 누적 후회가 대부분 UCB1의 절반을 넘지 않았다」 |
| disjoint-LinUCB, 7절 접힌 블록 바로 뒤 문단 | 「오차는 전부 $10^{-16}$대다.」 | 4회차가 `4.16e-17` 로 $10^{-17}$ 대다 | 「오차는 전부 $10^{-16}$ 이하다.」 |
| bid-shading-censored, 4절 황금 비율 탐색 블록 바로 뒤 문단 | 「Grid Search($N = 500$개 그리드)보다 수십 배 빠릅니다.」 | 이 블록의 탐색은 13번 반복하며 Surplus 를 26번 계산해 500번의 약 19분의 1 이다. 한 점을 다시 쓰게 짜면 15번쯤이라 30배를 넘는다 | 「Grid Search($N = 500$개 그리드)보다 20배 가까이 빠릅니다.」 |

## 부록 자체 확인

계획을 쓰며 블록마다 돌린 확인이다.

- 뜻 줄 61개(블록 44개, 모두 찍는 것이 있다)의 숫자 307개를 그 아래 찍힌 줄에서 찾았다. 찍힌 줄에 없는 값은 0개다. 한 자리 숫자 55개는 눈으로 맞췄다. 처음 쓴 글 가운데 header-bidding 의 「1순위 A」는 찍힌 줄에 없어 「SSP 1개만 물어」로 바꿨다. auto-bidding-pacing 둘째 블록의 「낮 트래픽이 몰리는 6시」는 찍힌 줄이 아니라 코드에서 온 해석이라 뺐다. 셋째 블록은 찍힌 값이 네 라운드뿐이라 「25라운드마다 찍은」을 더했다.
- 하는 일 44줄을 단계마다 맞춰 읽었다. adtech-dev-layers 첫 블록의 「날수와 클릭 수를 견준다」는 날수를 A/B 만 센다. 그래서 「날수를 구한 뒤, 같은 노출에서 A/B 와 밴딧의 클릭 수를 견준다」로 바꿨다. ltv-ad-ranking 셋째 블록은 예측 LTV 가 낮은 이어폰이 비타민보다 앞선다. 그 까닭인 「순위는 LTV 가 아니라 pCTR 에 LTV 를 곱한 점수로 매긴다」를 2단계 풀이에 더했다.
- 옮긴 뒤 값이나 고친 뒤 값을 찍는 표가 있는지 봤다. 학습한 뒤의 θ(disjoint-LinUCB 첫 블록), 최종 사후분포(TS-linTS 첫 블록), 최종 트래픽 배분(ab-test-vs-mab 둘째 블록), 할인 뒤 순위(ltv-ad-ranking 넷째 블록)는 단계 제목이나 뜻 줄이 그 시점을 말한다.
- 본문이 블록의 줄 수를 말하는 곳은 disjoint-LinUCB 4절의 「50줄 안쪽」 하나다. 하는 일과 단계 줄이 붙어 클래스 끝이 49번째에서 55번째 줄로 옮겨 가지만, 코드 줄은 41줄이라 그대로 둔다.
- 쓰지 않는 낱말은 0개다. 처음 쓴 adtech-ecosystem-map 첫 블록의 하는 일과 뜻에 그 부류의 낱말이 있어 「몇 건 나가는지」, 「300건을 만든다」로 바꿨다. 새 블록 44개 전부(바꾸지 않는 코드 줄 포함)에 가운뎃점이 없다.
- 새 블록 44개를 저장소 사본에 도우미로 넣었다. 손으로 맞춘 사본과 바이트까지 같다. CI 검사 12가지가 통과했다(형식 검사 새 형식 120개, 옛 형식 127개, 문제 0건, 실행 검사 통과 119, 실행 안 됨 1). 표준 라이브러리만 있는 파이썬 3.9 로는 통과 112, 건너뜀 8 이다(셋째 묶음보다 numpy 와 scipy 블록 4개가 더 건너뛴다).
- 도우미는 sha, 코드 줄, 찍힌 줄이 하나라도 다르면 글을 그대로 두고 멈춘다(셋 다 시험했다). `old=run` 블록의 찍힌 줄을 틀리게 넣으면 도우미는 옮기고, 실행 검사가 `실패 1` 로 잡는다(시험했다).
- 네 폭에서 20편의 값 80개가 모두 「블록 수 true 0 0 false 0 0 0」이었다. 390 폭 훑기는 108편, 숫자 2,219개, 넘침 0, 끊김 0 이다.
- 본문 단락을 블록마다 읽어 숫자를 찍힌 줄과 맞췄다. 맞지 않는 다섯 곳을 「고칠 곳 다섯」에 적었다. mab 의 그리디 단락과 ucb_ts 의 다른 시드 단락은 저장소 밖 사본에서 코드를 따로 돌려 셌다.

---

## 부록: 새 블록 44개

Task 1~5 의 도우미가 이 절을 읽는다(태스크 설명에 넣지 않으려고 태스크 앞에 둔다). 블록마다 `<!-- cb4 post=<글 파일 이름> block=<0부터 센 파이썬 블록 번호> sha=<원본 블록 sha256 앞 16자> -->` 줄 바로 아래 네 백틱 울타리 안이 새 블록 전체다. 표시 줄 끝의 ` old=run` 은 찍힌 줄을 돌려서 받아 적은 블록이라는 표시다(4개). 표시 줄과 울타리 모양을 바꾸지 않는다. 블록 제목의 번호는 1부터 센다. 부록 번호는 태스크 차례다.

### 부록 1: bid-shading-censored (블록 5개, Task 1)

#### 블록 1

<!-- cb4 post=bid-shading-censored block=0 sha=b0424ab1f3e7af68 -->
````python
# 하는 일: 진짜 가치 $5 인 노출에서 시장 가격이 로그정규를 따를 때, 이익 × 낙찰 확률(Surplus)이 가장 큰 입찰가 b* 를 찾는다.
import numpy as np
from scipy.stats import lognorm

# 1단계: Surplus 함수를 만든다
# Surplus 는 이익 (V - b) 에 낙찰 확률 F(b) 를 곱한 값이다.
def surplus(b, V, mu, sigma):
    """Surplus = (V - b) × F(b|x): 이익 × 낙찰 확률"""
    if b <= 0 or b >= V:
        return 0.0
    win_prob = lognorm.cdf(b, s=sigma, scale=np.exp(mu))
    return (V - b) * win_prob

# 2단계: 입찰가 50개로 Surplus 가 가장 큰 곳을 찾는다
# True Value 는 $5, 시장 가격은 Log-normal(μ=0.8, σ=0.5)이다. $0.1 에서 $4.9 까지 입찰가 50개를 잰다.
V, mu, sigma = 5.0, 0.8, 0.5
bids = np.linspace(0.1, V - 0.1, 50)
surpluses = [surplus(b, V, mu, sigma) for b in bids]

best_idx = np.argmax(surpluses)
print(f"  최적 입찰가 b* = ${bids[best_idx]:.2f}")
print(f"  최대 Surplus  = ${surpluses[best_idx]:.3f}")
print(f"  Shading 비율  = {(1 - bids[best_idx]/V)*100:.0f}% 할인")

# 출력:
# 2단계 뜻: 입찰가를 $2.65 로 47% 깎을 때 Surplus 가 $1.496 으로 가장 크다. 입찰가를 올리면 낙찰 확률은 오르지만 이익이 줄고, 내리면 반대라서 그 균형점이 b* 다.
#   최적 입찰가 b* = $2.65
#   최대 Surplus  = $1.496
#   Shading 비율  = 47% 할인
````

#### 블록 2

<!-- cb4 post=bid-shading-censored block=1 sha=8a20f9d7395fc977 -->
````python
# 하는 일: 가치 1,000원인 노출에서 입찰가를 0% 부터 50% 까지 깎으며, 평상시와 경쟁 과열 시장의 승률과 기대이익을 견준다.
import random

V = 1000  # 이 노출의 진짜 가치(원). pCTR x 전환가치로 계산된 값.

# 1단계: 가상의 시장 분포를 만든다
# 가상 데이터: 경쟁자 최고가를 20,000번 뽑아 '진짜 시장 분포'를 만든다.
# 로그정규를 쓰는 이유는 입찰가가 늘 양수이고 오른쪽 꼬리가 길기 때문이다.
def market(mu):
    random.seed(42)
    return [random.lognormvariate(mu, 0.45) for _ in range(20000)]

# 2단계: 입찰가별 승률과 기대이익을 구하는 함수를 만든다
# 경쟁가가 내 입찰가보다 낮으면 이긴다. 기대이익은 승률 x (가치 - 입찰가)다.
def profit(bid, prices):
    wins = sum(1 for p in prices if p < bid)   # 경쟁가가 내 입찰가보다 낮으면 내가 이김
    win_rate = wins / len(prices)
    return win_rate, win_rate * (V - bid)      # 기대이익 = 승률 x (가치 - 입찰가)

# 3단계: 두 시장에서 깎는 비율별로 찍는다
# 평상시는 μ=6.2, 경쟁 과열은 μ=7.0 이다.
for label, mu in [("평상시", 6.2), ("경쟁 과열", 7.0)]:
    prices = market(mu)
    print("%s: 시장 평균 %.0f원" % (label, sum(prices) / len(prices)))
    print("  깎기 |   입찰 |   승률 | 기대이익")
    best = (0, 0.0)
    for cut in (0, 10, 20, 30, 40, 50):
        bid = V * (100 - cut) // 100
        wr, ep = profit(bid, prices)
        print("  %2d%% | %4d원 | %5.1f%% | %6.1f원" % (cut, bid, wr * 100, ep))
        if ep > best[1]:
            best = (cut, ep)
    print("  -> 최적은 %d%% 깎기" % best[0])

# 출력:
# 3단계 뜻: 평상시에는 40% 깎은 600원이 기대이익 267.6원으로 가장 크다. 경쟁이 과열돼 시장 평균이 1215원으로 오르면, 20% 만 깎은 800원이 48.3원으로 가장 크다.
# 평상시: 시장 평균 546원
#   깎기 |   입찰 |   승률 | 기대이익
#    0% | 1000원 |  94.0% |    0.0원
#   10% |  900원 |  90.7% |   90.7원
#   20% |  800원 |  85.9% |  171.7원
#   30% |  700원 |  78.1% |  234.4원
#   40% |  600원 |  66.9% |  267.6원
#   50% |  500원 |  51.3% |  256.4원
#   -> 최적은 40% 깎기
# 경쟁 과열: 시장 평균 1215원
#   깎기 |   입찰 |   승률 | 기대이익
#    0% | 1000원 |  41.8% |    0.0원
#   10% |  900원 |  32.9% |   32.9원
#   20% |  800원 |  24.2% |   48.3원
#   30% |  700원 |  16.1% |   48.2원
#   40% |  600원 |   9.2% |   36.7원
#   50% |  500원 |   4.2% |   21.0원
#   -> 최적은 20% 깎기
````

#### 블록 3

<!-- cb4 post=bid-shading-censored block=2 sha=0417974d4857467f -->
````python
# 하는 일: 이긴 경매의 낙찰가만 보고 시장 분포를 추정하면, 회차를 거듭할수록 시장을 낮게 보고 입찰가를 더 깎아 기대이익을 잃는 과정을 본다.
import math, random, statistics

# 1단계: 1절과 같은 시장을 만든다
# 가치 1,000원에 경쟁자 최고가 20,000개를 뽑는다.
V = 1000
random.seed(42)
TRUE = [random.lognormvariate(6.2, 0.45) for _ in range(20000)]  # 1절과 같은 시장(진짜 평균 546원)

# 2단계: 최적 입찰가와 실제 성적을 구하는 함수를 만든다
# best_bid 는 어떤 승률 함수를 주든 그 함수 기준의 최적 입찰가를 고른다.
def best_bid(win_prob):
    """승률 함수를 받아 기대이익이 가장 큰 입찰가를 10원 단위로 고른다."""
    return max(range(200, 1000, 10), key=lambda b: win_prob(b) * (V - b))

def real(bid):
    """실제 시장에서의 승률과 기대이익 — 독자만 볼 수 있는 정답."""
    wr = sum(1 for p in TRUE if p < bid) / len(TRUE)
    return wr, wr * (V - bid)

# 3단계: 시장을 다 알 때의 정답을 구한다
bid = best_bid(lambda b: real(b)[0])   # 시장을 다 안다고 가정한 최적값 = 비교 기준
print("정답: 입찰 %d원 | 승률 %.1f%% | 기대이익 %.1f원" % (bid, real(bid)[0] * 100, real(bid)[1]))

# 4단계: 이긴 경매만 보고 세 번 다시 추정한다
# 이긴 경매의 낙찰가에 로그정규를 그대로 맞추고, 그 분포로 다시 최적화한다.
for rnd in (1, 2, 3):
    won = [math.log(p) for p in TRUE if p < bid]        # 이긴 경매의 낙찰가만 관측된다
    m, s = statistics.mean(won), statistics.stdev(won)  # 그 표본에 로그정규를 그대로 적합
    fit = statistics.NormalDist(m, s)
    bid = best_bid(lambda b: fit.cdf(math.log(b)))      # 편향된 분포로 다시 최적화
    print("%d회차: 추정평균 %d원 -> 입찰 %d원 | 승률 %.1f%% | 기대이익 %.1f원"
          % (rnd, math.exp(m + s * s / 2), bid, real(bid)[0] * 100, real(bid)[1]))

# 출력:
# 3단계 뜻: 시장을 다 알면 570원을 불러 승률 62.5%, 기대이익 268.9원을 얻는다.
# 정답: 입찰 570원 | 승률 62.5% | 기대이익 268.9원
# 4단계 뜻: 이긴 경매만 보면 시장 평균을 392원, 360원, 345원으로 점점 낮게 보고, 입찰가도 460원까지 내려가 기대이익이 237.6원으로 준다.
# 1회차: 추정평균 392원 -> 입찰 500원 | 승률 51.3% | 기대이익 256.4원
# 2회차: 추정평균 360원 -> 입찰 470원 | 승률 45.9% | 기대이익 243.0원
# 3회차: 추정평균 345원 -> 입찰 460원 | 승률 44.0% | 기대이익 237.6원
````

#### 블록 4

<!-- cb4 post=bid-shading-censored block=3 sha=69e6040dfbdfdc0d -->
````python
# 하는 일: 입찰가 570원에서 잘린 낙찰가 데이터로 시장을 추정할 때, 이긴 것만 평균한 값과 Kaplan-Meier 추정을 정답과 견준다.

# 1단계: 가상 시장과 내 입찰가를 둔다
# 내가 입찰가 b 를 내면, 이길 때는 낙찰가를 보고 질 때는 b 보다 높았다는 것만 안다.
import random
random.seed(42)

N = 20_000
MEAN_LOG, SIGMA_LOG = 6.2, 0.6      # 시장가를 로그정규로 가정(가상 데이터)
MY_BID = 570                        # 내 입찰가 — 이보다 비싸면 패찰

market = [random.lognormvariate(MEAN_LOG, SIGMA_LOG) for _ in range(N)]
true_mean = sum(market) / N

# 2단계: 관측 데이터를 만든다
# 관측 데이터: 이기면 (낙찰가, 관측됨), 지면 (내 입찰가, 잘림=censored)
obs = [(p, True) if p <= MY_BID else (MY_BID, False) for p in market]
lost = sum(1 for _, seen in obs if not seen)

# 3단계: 이긴 것만 평균한다
# 흔히 저지르는 계산이다. 비싼 경매가 통째로 빠지니 시장을 실제보다 싸게 본다.
won = [p for p, seen in obs if seen]
naive_mean = sum(won) / len(won)

# 4단계: Kaplan-Meier 생존함수로 추정한다
# 패찰도 「적어도 b 는 넘었다」는 정보라서, 버리지 않고 계산에 넣는다.

# S(t) = "낙찰가가 t를 넘을 확률". 가격을 오름차순으로 훑으며
# 관측된 지점마다 (1 - 그 가격에서 끝난 수 / 아직 남은 수) 를 곱해 간다.
# 잘린 항목은 '끝났다'로 세지 않지만, 그 전까지 '남은 수'에는 들어간다 —
# 이게 패찰 정보를 계산에 참여시키는 방식이다.
events = sorted(obs, key=lambda x: x[0])
at_risk = len(events)
surv = 1.0
prev = 0.0
km_restricted = 0.0                  # 생존함수 아래 면적 = E[min(가격, MY_BID)]
i = 0
while i < len(events):
    price = events[i][0]
    tied = [e for e in events[i:] if e[0] == price]
    deaths = sum(1 for _, seen in tied if seen)
    km_restricted += surv * (price - prev)      # 구간 [prev, price) 의 면적
    if at_risk > 0 and deaths > 0:
        surv *= (1 - deaths / at_risk)
    at_risk -= len(tied)
    prev = price
    i += len(tied)

# 5단계: 정답도 같은 방식으로 잘라 둔다
# KM이 가정 없이 맞힐 수 있는 건 "내 입찰가까지 자른 평균"이다.
# 정답도 같은 방식으로 잘라서 비교해야 공정하다.
true_restricted = sum(min(p, MY_BID) for p in market) / N

# 6단계: 정답과 두 추정을 견주어 찍는다
print(f"경매 {N:,}건, 내 입찰가 {MY_BID}원, 패찰 {lost/N*100:.1f}%")
print()
print("[내 입찰가까지 자른 평균] — KM이 가정 없이 맞힐 수 있는 구간")
print(f"  정답                    {true_restricted:7.1f}원")
print(f"  Kaplan-Meier            {km_restricted:7.1f}원   ({(km_restricted/true_restricted-1)*100:+.2f}%)")
print()
print("[전체 시장 평균] — 내 입찰가 위쪽은 관측이 아예 없다")
print(f"  정답                    {true_mean:7.1f}원")
print(f"  이긴 것만 평균          {naive_mean:7.1f}원   ({(naive_mean/true_mean-1)*100:+.1f}%)")
print()
print("→ 이긴 것만 보면 시장을 40% 싸게 본다. 비싼 경매가 통째로 빠지니까.")
print("→ KM은 패찰을 '적어도 내 입찰가는 넘었다'로 써서, 관측 구간을 오차 0.1% 안에 맞힌다.")
print("→ 하지만 내 입찰가 위쪽은 되살릴 수 없다. 그건 데이터가 아니라 가정의 영역이다.")
print("→ 그래서 실무는 일부 트래픽에 일부러 높게 입찰해 꼬리를 사 온다(탐색 비용).")

# 출력:
# 6단계 뜻: 패찰이 40.6% 인 데이터에서 이긴 것만 평균하면 355.9원으로, 정답 591.0원보다 39.8% 싸게 본다. Kaplan-Meier 는 내 입찰가까지 자른 평균을 442.9원으로 정답과 똑같이 맞힌다.
# 경매 20,000건, 내 입찰가 570원, 패찰 40.6%
#
# [내 입찰가까지 자른 평균] — KM이 가정 없이 맞힐 수 있는 구간
#   정답                      442.9원
#   Kaplan-Meier              442.9원   (+0.00%)
#
# [전체 시장 평균] — 내 입찰가 위쪽은 관측이 아예 없다
#   정답                      591.0원
#   이긴 것만 평균            355.9원   (-39.8%)
#
# → 이긴 것만 보면 시장을 40% 싸게 본다. 비싼 경매가 통째로 빠지니까.
# → KM은 패찰을 '적어도 내 입찰가는 넘었다'로 써서, 관측 구간을 오차 0.1% 안에 맞힌다.
# → 하지만 내 입찰가 위쪽은 되살릴 수 없다. 그건 데이터가 아니라 가정의 영역이다.
# → 그래서 실무는 일부 트래픽에 일부러 높게 입찰해 꼬리를 사 온다(탐색 비용).
````

#### 블록 5

<!-- cb4 post=bid-shading-censored block=4 sha=dd78e92cfaaa721a -->
````python
# 하는 일: 황금 비율 탐색으로, 진짜 가치 $5 에 시장 가격이 Log-normal(μ=0.8, σ=0.5)인 경매의 최적 입찰가 b* 를 구한다.
import numpy as np
from scipy.stats import lognorm

# 1단계: 황금 비율 탐색 함수를 만든다
# 구간 양 끝에서 황금 비율만큼 안쪽의 두 점을 견주어, Surplus 가 작은 쪽 구간을 버린다.
def golden_section_search(V, mu, sigma, tol=0.01):
    """황금 비율 탐색으로 최적 입찰가 b* 계산"""
    def surplus(b):
        return (V - b) * lognorm.cdf(b, s=sigma, scale=np.exp(mu))

    gr = (np.sqrt(5) + 1) / 2  # 황금 비율 ≈ 1.618
    a, b = 1e-6, V - 1e-6

    iters = 0
    while (b - a) > tol:
        x1 = b - (b - a) / gr
        x2 = a + (b - a) / gr
        if surplus(x1) > surplus(x2):
            b = x2
        else:
            a = x1
        iters += 1

    optimal_bid = (a + b) / 2
    print(f"  b* = ${optimal_bid:.4f}  ({iters}회 반복, 구간 < ${tol})")
    return optimal_bid

# 2단계: 같은 경매로 돌린다
# 첫 블록과 같은 경매(V=$5.00, 시장 가격 Log-normal(μ=0.8, σ=0.5))다.
# Grid Search(500개)가 Surplus 를 500번 계산할 때, 이 탐색은 반복마다 두 번씩만 계산한다.
b_star = golden_section_search(V=5.0, mu=0.8, sigma=0.5, tol=0.01)

# 출력:
# 2단계 뜻: 13번 반복하면 구간이 $0.01 보다 좁아져 b* = $2.6788 에 닿는다.
#   b* = $2.6788  (13회 반복, 구간 < $0.01)
````

### 부록 2: header-bidding (블록 1개, Task 2)

#### 블록 1

<!-- cb4 post=header-bidding block=0 sha=0ab62d6d8b89b192 -->
````python
# 하는 일: 같은 SSP 6곳의 응답을 두고, Waterfall(순서대로 한 곳씩)과 헤더비딩(동시에 여러 곳)이 받아 내는 값을 견준다.

# 1단계: 바닥값과 SSP 6곳의 응답을 둔다
# SSP 6곳은 본문 1절 표 그대로이고, 줄마다 이름, Waterfall 우선순위, 입찰가(CPM), 응답 시간(ms)이다. 표준 라이브러리만 쓴다.
FLOOR = 900  # 바닥값(reserve price, CPM) — 이 값 밑으로는 팔지 않는다

ssps = [
    {"name": "A", "priority": 1, "bid": 1000, "ms": 120},
    {"name": "B", "priority": 2, "bid": 1250, "ms": 180},
    {"name": "C", "priority": 3, "bid": 980, "ms": 90},
    {"name": "D", "priority": 4, "bid": 1420, "ms": 260},
    {"name": "E", "priority": 5, "bid": 1100, "ms": 150},
    {"name": "F", "priority": 6, "bid": 860, "ms": 110},
]

# 2단계: 두 방식의 낙찰 규칙을 함수로 만든다
# Waterfall 은 우선순위대로 묻다가 바닥값을 넘는 첫 응답에 판다. 헤더비딩은 타임아웃 안에 온 응답을 모아 가장 높은 값에 판다.
def waterfall(ssps, floor):
    """우선순위 순서대로 하나씩 묻다가, 바닥값을 넘는 첫 응답에서 즉시 판다.
    반환값: (낙찰가, 물어본 SSP 수, 낙찰자 이름). 뒤 순번은 아예 묻지 않는다."""
    asked = 0
    for s in sorted(ssps, key=lambda s: s["priority"]):
        asked += 1
        if s["bid"] >= floor:
            return s["bid"], asked, s["name"]
    return None, asked, None  # 아무도 바닥값을 못 넘기면 유찰

def header_bidding(bids, timeout_ms, rule):
    """타임아웃(ms) 안에 응답한 SSP를 모으고, 그중 바닥값을 넘는 것만 낙찰 후보로 삼는다.
    rule='first'면 1등가(자기 값 그대로), 'second'면 2등가(2등이 없으면 바닥값)."""
    responded = [s for s in bids if s["ms"] <= timeout_ms]   # 시간 안에 도착한 응답 전부
    qualified = [s for s in responded if s["bid"] >= FLOOR]  # 그중 바닥값 넘는 낙찰 후보만
    if not qualified:
        return None, None, responded
    ranked = sorted(qualified, key=lambda s: -s["bid"])
    if rule == "first":
        price = ranked[0]["bid"]
    else:
        price = ranked[1]["bid"] if len(ranked) > 1 else FLOOR
    return price, ranked[0]["name"], responded

# 3단계: Waterfall 과 타임아웃별 헤더비딩을 견준다
# 타임아웃을 100ms 에서 300ms 까지 늘리며, 응답한 SSP 와 낙찰가를 찍는다.
wf_price, wf_asked, wf_winner = waterfall(ssps, FLOOR)
print(f"Waterfall        낙찰 {wf_winner}  ₩{wf_price:,}   (물어본 SSP {wf_asked}개)")

print("\n타임아웃별 헤더비딩(1등가 규칙):")
for timeout in (100, 150, 200, 300):
    price, winner, responded = header_bidding(ssps, timeout, rule="first")
    names = ", ".join(s["name"] for s in sorted(responded, key=lambda s: s["priority"]))
    diff_pct = (price - wf_price) / wf_price * 100
    print(f"  {timeout:>3}ms  응답 {names:<17} 낙찰 {winner} ₩{price:,}   Waterfall 대비 {diff_pct:+.0f}%")

# 4단계: 같은 응답에 2등가 규칙을 쓴다
# 전부 응답한 300ms 에서 규칙만 2등가로 바꾸면 얼마가 되는지 본다. 본문 3절이 견주는 값이다.
price_2nd, winner_2nd, _ = header_bidding(ssps, 300, rule="second")
print(f"\n300ms, 2등가 규칙  낙찰 {winner_2nd}  ₩{price_2nd:,}")

# 출력:
# 3단계 뜻: Waterfall 은 SSP 1개만 물어 A 의 1,000원에 판다. 헤더비딩은 100ms 면 C 하나만 와서 2% 덜 받지만, 300ms 면 여섯 곳이 다 와서 D 가 1,420원에 낙찰되고 42% 를 더 받는다.
# Waterfall        낙찰 A  ₩1,000   (물어본 SSP 1개)
#
# 타임아웃별 헤더비딩(1등가 규칙):
#   100ms  응답 C                 낙찰 C ₩980   Waterfall 대비 -2%
#   150ms  응답 A, C, E, F        낙찰 E ₩1,100   Waterfall 대비 +10%
#   200ms  응답 A, B, C, E, F     낙찰 B ₩1,250   Waterfall 대비 +25%
#   300ms  응답 A, B, C, D, E, F  낙찰 D ₩1,420   Waterfall 대비 +42%
# 4단계 뜻: 같은 300ms 라도 2등가 규칙이면 D 가 이기되 2등 값인 1,250원을 낸다.
#
# 300ms, 2등가 규칙  낙찰 D  ₩1,250
````

### 부록 3: second-price-auction (블록 1개, Task 2)

#### 블록 1

<!-- cb4 post=second-price-auction block=0 sha=17d68d345191a6a9 -->
````python
# 하는 일: DSP 5곳의 진짜 가치로 2등가 경매에서 정직, 과대, 과소 입찰의 이익을 견주고, 같은 상황을 1등가로 돌리면 정직 입찰의 이익이 0 이 되는 것까지 본다.

# 1단계: 진짜 가치를 둔다
# DSP 5곳의 진짜 가치는 본문 2절 표 그대로다. 표준 라이브러리만 쓴다.
TRUE_VALUES = {"A": 1400, "B": 1150, "C": 1000, "D": 870, "E": 790}  # 2절 표 그대로

# 2단계: 낙찰과 이익을 구하는 함수를 만든다
# 2등가는 2등의 입찰가를, 1등가는 자기 입찰가를 낸다. 이익은 이겼을 때만 진짜 가치에서 낸 값을 뺀 것이다.
def clearing(bids, rule):
    """bids: {이름: 입찰가}. rule='second'면 2등가, 'first'면 1등가.
    반환: (낙찰자, 지불액)."""
    ranked = sorted(bids.items(), key=lambda kv: -kv[1])
    winner, top_bid = ranked[0]
    runner_up_bid = ranked[1][1]
    price = runner_up_bid if rule == "second" else top_bid
    return winner, price

def profit(name, value, bids, rule):
    winner, price = clearing(bids, rule)
    return (value - price) if winner == name else 0.0

# 3단계: 본문 3절의 두 경우를 다시 돌린다
# 이미 이기는 A 와 원래 지는 C 가 정직하게, 또는 다르게 불렀을 때의 이익을 본다.
others_for_A = {"B": 1150, "C": 1000, "D": 870, "E": 790}
others_for_C = {"A": 1400, "B": 1150, "D": 870, "E": 790}

print("[A, 진짜가치 1400] 정직/과대/과소 (2등가)")
for label, bid in [("정직", 1400), ("과대 x1.2", 1400 * 1.2), ("과소 x0.8", 1400 * 0.8)]:
    bids = {**others_for_A, "A": bid}
    print(f"  {label:<10} 입찰 {bid:>7,.0f}  →  이익 {profit('A', 1400, bids, 'second'):+8,.0f}")

print("\n[C, 진짜가치 1000] 정직/소폭 과대/무리한 과대 (2등가)")
for label, bid in [("정직", 1000), ("과대 x1.2", 1000 * 1.2), ("무리한 과대(A 추월)", 1500)]:
    bids = {**others_for_C, "C": bid}
    print(f"  {label:<18} 입찰 {bid:>7,.0f}  →  이익 {profit('C', 1000, bids, 'second'):+8,.0f}")

# 4단계: 상대 값을 모를 때의 기대 이익을 구한다
# 상대의 최고 입찰가를 모른다고 놓고, 시나리오 5개에 걸친 평균 이익을 2등가로 견준다.
RIVAL_SCENARIOS = [790, 870, 1150, 1300, 1600]

def expected_profit(value, bid, rule):
    outcomes = [profit("나", value, {"나": bid, "상대": p}, rule) for p in RIVAL_SCENARIOS]
    return sum(outcomes) / len(outcomes)

print("\n(a) 2등가 — 시나리오 5개 평균 기대 이익")
for value, label in [(1000, "C 자리(1000)"), (1400, "A 자리(1400)")]:
    honest = expected_profit(value, value, "second")
    over   = expected_profit(value, value * 1.2, "second")
    under  = expected_profit(value, value * 0.8, "second")
    print(f"  {label:<12} 정직 {honest:>6,.1f}   과대 {over:>6,.1f}   과소 {under:>6,.1f}")
    assert honest >= over and honest >= under  # 정직이 항상 최선이어야 한다 — 2등가의 핵심 성질

# 5단계: 같은 시나리오를 1등가로 돌린다
# 같은 시나리오 5개를 1등가 규칙으로 돌려, 정직 입찰과 깎아 부른 입찰을 견준다.
print("\n(b) 1등가로 바꾸면 — 정직의 기대 이익")
for value, label in [(1000, "C 자리(1000)"), (1400, "A 자리(1400)")]:
    honest_1st = expected_profit(value, value, "first")
    shaded_1st = expected_profit(value, value * 0.8, "first")
    print(f"  {label:<12} 정직 {honest_1st:>6,.1f}   과소(=shading) {shaded_1st:>6,.1f}")
    assert honest_1st == 0.0  # 1등가에서 정직 입찰은 이기든 지든 이익이 정확히 0

# 출력:
# 3단계 뜻: 2등가에서는 A 가 정직하게 불러도 과대로 불러도 이익 250 이 같고, 과소로 부르면 져서 0 이다. C 는 A 를 앞지르려 1,500 을 부르면 이기고도 400 을 잃는다.
# [A, 진짜가치 1400] 정직/과대/과소 (2등가)
#   정직         입찰   1,400  →  이익     +250
#   과대 x1.2    입찰   1,680  →  이익     +250
#   과소 x0.8    입찰   1,120  →  이익       +0
#
# [C, 진짜가치 1000] 정직/소폭 과대/무리한 과대 (2등가)
#   정직                 입찰   1,000  →  이익       +0
#   과대 x1.2            입찰   1,200  →  이익       +0
#   무리한 과대(A 추월)       입찰   1,500  →  이익     -400
# 4단계 뜻: 시나리오 5개 평균으로도 정직이 가장 크다. C 자리는 68.0, A 자리는 298.0 으로 과대와 과소보다 높다.
#
# (a) 2등가 — 시나리오 5개 평균 기대 이익
#   C 자리(1000)   정직   68.0   과대   38.0   과소   42.0
#   A 자리(1400)   정직  298.0   과대  258.0   과소  228.0
# 5단계 뜻: 1등가로 바꾸면 정직 입찰의 이익은 두 자리 모두 0.0 이다. 깎아 부르는 과소 입찰은 40.0 과 112.0 이 남는다.
#
# (b) 1등가로 바꾸면 — 정직의 기대 이익
#   C 자리(1000)   정직    0.0   과소(=shading)   40.0
#   A 자리(1400)   정직    0.0   과소(=shading)  112.0
````

### 부록 4: dsp-ssp-exchange (블록 1개, Task 2)

#### 블록 1

<!-- cb4 post=dsp-ssp-exchange block=0 sha=883b69474662d4a7 -->
````python
# 하는 일: 광고주가 쓴 1,000원이 중개 몇 곳을 거쳐 매체에 얼마로 도착하는지 계산한다.

# 1단계: 지출과 수수료를 떼는 함수를 둔다
# 중개마다 남은 금액에서 자기 몫을 떼고 넘긴다. 수수료율은 이 글에서 쓰는 예시값이고, 특정 회사의 공개 요율이 아니다.
SPEND = 1_000  # 광고주가 이 노출 1건에 쓴 돈(원)

def take_home(spend, fee_rates):
    """각 단계가 '남은 금액'에서 fee_rate만큼 뗀 뒤 다음 단계로 넘긴다.
    반환값: (매체가 최종적으로 받는 금액, 단계별 잔액 리스트)."""
    remaining = spend
    trail = [remaining]
    for rate in fee_rates:
        remaining *= (1 - rate)
        trail.append(remaining)
    return remaining, trail

def effective_take_rate(spend, publisher_revenue):
    # 광고주 지출 대비, 중간에서 사라진 비율
    return (spend - publisher_revenue) / spend

# 2단계: 중개 세 곳을 거친 잔액을 찍는다
# DSP 20%, Exchange 15%, SSP 20% 는 예시 수치다.
base_rates = [0.20, 0.15, 0.20]
publisher_revenue, trail = take_home(SPEND, base_rates)

print("기본 3단계 검산")
for step, amount in enumerate(trail):
    print(f"  단계 {step}   잔액 {amount:8,.0f}원")
print(f"실효 take rate {effective_take_rate(SPEND, publisher_revenue):.1%}")

# 3단계: 중개 수를 바꿔 견준다
# 리셀러가 하나 끼어 넷이 되거나, Exchange 를 빼고 PMP 로 직거래해 둘이 되는 경우다.
scenarios = {
    "기본 3단계(DSP, Exchange, SSP)": [0.20, 0.15, 0.20],
    "리셀러 추가 4단계(+10%p 단계)": [0.20, 0.15, 0.10, 0.20],
    "Exchange 생략 2단계(PMP 직거래)": [0.20, 0.20],
}

print()
print("중개 단계별 비교")
for name, rates in scenarios.items():
    revenue, _ = take_home(SPEND, rates)
    rate = effective_take_rate(SPEND, revenue)
    print(f"  {name:<28} 매체 실수령 {revenue:6,.0f}원   take rate {rate:5.1%}")

# 출력:
# 2단계 뜻: 남은 돈에서 차례로 떼니 1,000원이 800원, 680원을 거쳐 544원이 된다. 중간에서 45.6% 가 사라진다.
# 기본 3단계 검산
#   단계 0   잔액    1,000원
#   단계 1   잔액      800원
#   단계 2   잔액      680원
#   단계 3   잔액      544원
# 실효 take rate 45.6%
# 3단계 뜻: 리셀러가 끼면 매체 몫이 490원으로 줄고, Exchange 를 빼면 640원으로 는다. 중개가 하나 늘 때마다 take rate 가 오른다.
#
# 중개 단계별 비교
#   기본 3단계(DSP, Exchange, SSP)   매체 실수령    544원   take rate 45.6%
#   리셀러 추가 4단계(+10%p 단계)         매체 실수령    490원   take rate 51.0%
#   Exchange 생략 2단계(PMP 직거래)     매체 실수령    640원   take rate 36.0%
````

### 부록 5: ad-network-vs-exchange (블록 3개, Task 2)

#### 블록 1

<!-- cb4 post=ad-network-vs-exchange block=0 sha=9d5aeb491aca65e4 -->
````python
# 하는 일: 지면 5종을 고정 CPM 하나로 묶어 팔 때와 노출마다 경매로 팔 때의 실효 CPM 을 견준다.
# 1단계: 가상 지면 5종을 둔다
# 가상 데이터다. 지면마다 이름, 노출 비중, 진짜 가치 CPM 을 담는다.
INV = [("메인 상단", .05, 4200), ("기사 상단", .15, 2400), ("기사 중간", .25, 1100),
       ("사이드바", .30, 620), ("스크롤 하단", .25, 280)]

# 2단계: 고정가로 묶어 팔 때를 계산하는 함수를 만든다
# 진짜 가치가 고정가 이상인 지면만 팔리고, 나머지는 유찰된다.
def bundle(price):
    """고정 CPM 하나로 묶어 팔 때의 (실효 CPM, 헐값 손실, 유찰 손실).
    진짜 가치가 그 값 이상인 지면만 팔리고, 나머지는 유찰된다."""
    rev = cheap = unsold = 0.0
    for _, share, v in INV:
        if v >= price:
            rev += share * price          # 매체가 실제로 받는 값
            cheap += share * (v - price)  # 더 받을 수 있었는데 못 받은 몫
        else:
            unsold += share * v           # 팔 수 있었는데 못 판 몫
    return rev, cheap, unsold

# 3단계: 경매와 고정가 셋, 최선의 고정가를 견준다
# 노출마다 제 값으로 파는 경매가 쪼갰을 때의 상한이다.
auc = sum(share * v for _, share, v in INV)
print(f"노출 단위 경매   실효 CPM ₩{auc:,.0f}")
for price in (620, 1100, 2400):
    rev, cheap, unsold = bundle(price)
    print(f"고정 ₩{price:>5,}    실효 ₩{rev:>3,.0f}"
          f"  (헐값 {cheap:>3,.0f}, 유찰 {unsold:>3,.0f})  경매 대비 {rev/auc-1:+.0%}")
best = max((bundle(v)[0], v) for _, _, v in INV)
print(f"최선의 고정가 ₩{best[1]:,}조차 경매의 {best[0]/auc:.0%}밖에 못 번다")

# 출력:
# 3단계 뜻: 노출마다 제 값으로 파는 경매는 실효 CPM 이 1,101원이다. 고정가는 620원, 1,100원, 2,400원 어느 것이든 헐값이나 유찰로 잃어, 최선인 1,100원조차 경매의 45% 만 번다.
# 노출 단위 경매   실효 CPM ₩1,101
# 고정 ₩  620    실효 ₩465  (헐값 566, 유찰  70)  경매 대비 -58%
# 고정 ₩1,100    실효 ₩495  (헐값 350, 유찰 256)  경매 대비 -55%
# 고정 ₩2,400    실효 ₩480  (헐값  90, 유찰 531)  경매 대비 -56%
# 최선의 고정가 ₩1,100조차 경매의 45%밖에 못 번다
````

#### 블록 2

<!-- cb4 post=ad-network-vs-exchange block=1 sha=c5c0e097c570da34 -->
````python
# 하는 일: Ad Network 5곳을 Waterfall 로 한 곳씩 물을 때, 120가지 순서의 평균 CPM 을 동시 입찰(경매)과 견준다.
import itertools, random
random.seed(42)

# 1단계: 바닥값과 Network 5곳의 입찰을 만든다
# 가상 데이터다. 노출 2,000건마다 다섯 곳이 부를 값을 미리 뽑아 둔다.
FLOOR = 900   # 바닥값(CPM). 이 값을 못 넘는 응답은 No Fill로 센다.
# 가상 데이터: Ad Network 5곳의 (평균 CPM, 표준편차). 평균은 비슷한데 노출마다 크게 흔들린다.
NET = {"A": (1500, 700), "B": (1400, 900), "C": (1300, 400),
       "D": (1250, 1100), "E": (1100, 600)}
# 노출 2,000건. 매 건마다 5곳이 각자 값을 부른다(음수는 0).
rounds = [{n: max(0.0, random.gauss(*p)) for n, p in NET.items()} for _ in range(2000)]

# 2단계: 두 방식의 낙찰가를 계산한다
# Waterfall 은 정한 순서로 한 곳씩 묻고, 동시 입찰은 다섯 곳의 최고가에 판다. Waterfall 은 5! = 120가지 순서를 전부 돌린다.
def waterfall(bids, order):
    """정한 순서로 한 곳씩 묻고, 바닥값을 넘는 첫 응답에서 판다. 뒤 순번은 안 묻는다."""
    for n in order:
        if bids[n] >= FLOOR:
            return bids[n]
    return 0.0   # 다섯 곳 다 못 넘기면 유찰

# 동시에 물으면 그중 최고가가 낙찰가다. '순서'라는 개념 자체가 없다.
auc = sum(t for t in (max(b.values()) for b in rounds) if t >= FLOOR) / len(rounds)
# 5! = 120가지 순서를 전부 돌린다. 같은 수요인데 순서만으로 성적이 어디까지 벌어지나?
sc = {o: sum(waterfall(b, o) for b in rounds) / len(rounds)
      for o in itertools.permutations(NET)}
hi, lo = max(sc, key=sc.get), min(sc, key=sc.get)

# 3단계: 최선과 최악의 순서, 실무 관행을 찍는다
# 실무 관행은 평균 CPM 1위인 A 를 맨 앞에 세우는 것이다.
print(f"동시 입찰(경매)   평균 CPM ₩{auc:,.0f}")
for tag, o in (("최선", hi), ("최악", lo)):
    print(f"Waterfall {tag}  ₩{sc[o]:,.0f}  ({', '.join(o)})  경매 대비 {sc[o]/auc-1:+.0%}")
# '평균 CPM 1위' A를 맨 앞에 세운 24가지 순서의 평균 — 실무 관행
print(f"A를 1순위로 세움  ₩{sum(v for o, v in sc.items() if o[0] == 'A')/24:,.0f}")

# 출력:
# 3단계 뜻: 동시 입찰의 평균 CPM 은 2,217원이다. Waterfall 은 순서만 바꿔도 1,847원에서 1,435원까지 오가고, 최선의 순서도 17% 를 덜 받는다. A 를 1순위로 세우는 관행은 1,711원이다.
# 동시 입찰(경매)   평균 CPM ₩2,217
# Waterfall 최선  ₩1,847  (D, B, A, E, C)  경매 대비 -17%
# Waterfall 최악  ₩1,435  (C, E, A, D, B)  경매 대비 -35%
# A를 1순위로 세움  ₩1,711
````

#### 블록 3

<!-- cb4 post=ad-network-vs-exchange block=2 sha=1cd8a7f8ba8292bb -->
````python
# 하는 일: Network 5곳을 순차로 물을 때와 동시에 물을 때의 대기 시간과 사용자 이탈을 견준다.
RESP, FILL, N = 120, 0.45, 5     # 한 곳 응답 ms, 한 곳이 채울 확률, Network 수
leave = lambda ms: 0.015 * ms / 100    # 100ms 기다릴수록 이탈 +1.5%p라는 가정
# k번째에서 채워질 확률 × 그때까지 기다린 시간을 다 더하면 평균 대기 시간이 나온다
wait = sum((1 - FILL) ** (k - 1) * FILL * k * RESP for k in range(1, N + 1))
wait += (1 - FILL) ** N * N * RESP     # 다 실패해도 기다린 시간은 그대로 쓴다
fill = 1 - (1 - FILL) ** N             # 채움 비율. 순차든 동시든 수요가 같으니 똑같다
print(f"순차 대기 {wait:.0f}ms, 이탈 {leave(wait):.1%}"
      f"   (최악 {N*RESP}ms, 이탈 {leave(N*RESP):.0%})")
print(f"동시 대기 {RESP}ms, 이탈 {leave(RESP):.1%}   채움은 양쪽 다 {fill:.1%}")
print(f"하루 1,000만 노출이면 사라지는 노출 "
      f"{(leave(wait) - leave(RESP)) * fill * 1e7:,.0f}건")

# 출력:
# 뜻: 순차로 물으면 평균 253ms 를 기다려 이탈이 3.8% 이고, 동시에 물으면 120ms 에 1.8% 다. 채움은 95.0% 로 같아서, 하루 1,000만 노출이면 189,810건이 그 차이로 사라진다.
# 순차 대기 253ms, 이탈 3.8%   (최악 600ms, 이탈 9%)
# 동시 대기 120ms, 이탈 1.8%   채움은 양쪽 다 95.0%
# 하루 1,000만 노출이면 사라지는 노출 189,810건
````

### 부록 6: walled-garden (블록 1개, Task 2)

#### 블록 1

<!-- cb4 post=walled-garden block=0 sha=a69ee042949b18de -->
````python
# 하는 일: 같은 광고 예산이 담장 안(Walled Garden)과 열린 RTB 에서 얼마나 다르게 쓰이는지, 수수료 구조와 예측 정확도 두 효과로 나눠 구하고 곱한다.
# 1단계: 예산을 둔다
# 모든 요율과 숫자는 예시를 위한 가상값이다. 표준 라이브러리만 쓴다.
import random

random.seed(7)

BUDGET = 10_000_000  # 광고주가 한 달에 쓰는 예산(원) — 가상값

# 2단계: 효과 1, 중개 수수료 구조를 구한다
# 열린 RTB 는 광고주 지출 -> DSP -> Ad Exchange -> SSP -> 매체로 가며 단계마다 수수료를 뗀다. 경유하는 회사 수만큼 수수료가 곱으로 쌓인다.
OPEN_RTB_FEES = [0.15, 0.10, 0.15]  # DSP, Ad Exchange, SSP 수수료율(가상)
# 담장 안: 회사가 하나뿐이라 '수수료'가 아니라 내부 운영비만 나간다(가상).
WALLED_GARDEN_COST = 0.03

def take_home(budget, rates):
    remaining = budget
    for rate in rates:
        remaining *= (1 - rate)
    return remaining

open_rtb_revenue = take_home(BUDGET, OPEN_RTB_FEES)
walled_garden_revenue = take_home(BUDGET, [WALLED_GARDEN_COST])
structural_ratio = walled_garden_revenue / open_rtb_revenue

# 3단계: 효과 2, 예측 정확도 차이를 구한다
# 경매마다 후보 광고 5개를 pCTR 예측치로 줄 세워 1등을 노출한다. 진짜 클릭 확률은 아무도 모르니, 예측이 정확할수록 더 좋은 광고를 고른다.
# 예측치는 진짜값 x (1 + 노이즈)다. 담장 안은 1st-party 데이터가 풍부해 노이즈가 더 작다(가상).
N_AUCTIONS = 50_000
N_CANDIDATES = 5
NOISE_OPEN_RTB = 0.40       # 예측 오차의 상대 표준편차 — 데이터가 부족할수록 큼(가상)
NOISE_WALLED_GARDEN = 0.15  # 1st-party 데이터가 풍부해 오차가 작음(가상)

def avg_true_ctr_of_winners(noise_sd):
    total = 0.0
    for _ in range(N_AUCTIONS):
        true_ctrs = [random.uniform(0.01, 0.05) for _ in range(N_CANDIDATES)]
        predicted = [t * (1 + random.gauss(0, noise_sd)) for t in true_ctrs]
        winner = predicted.index(max(predicted))  # 예측 1등을 낙찰시켜 노출
        total += true_ctrs[winner]                # 실제 클릭은 '진짜' CTR을 따른다
    return total / N_AUCTIONS

avg_ctr_open = avg_true_ctr_of_winners(NOISE_OPEN_RTB)
avg_ctr_walled = avg_true_ctr_of_winners(NOISE_WALLED_GARDEN)
prediction_ratio = avg_ctr_walled / avg_ctr_open

# 4단계: 두 효과를 곱해 찍는다
# 같은 예산 1원의 최종 효율 격차를 본다.
combined_ratio = structural_ratio * prediction_ratio

print(f"열린 RTB 매체 실수령      {open_rtb_revenue:>12,.0f}원  ({open_rtb_revenue/BUDGET:.1%})")
print(f"담장 안 플랫폼 실수령     {walled_garden_revenue:>12,.0f}원  ({walled_garden_revenue/BUDGET:.1%})")
print(f"효과1: 구조적 격차        {structural_ratio:.2f}배")
print(f"열린 RTB 평균 진짜 CTR    {avg_ctr_open:.4%}")
print(f"담장 안 평균 진짜 CTR     {avg_ctr_walled:.4%}")
print(f"효과2: 예측 정확도 격차   {prediction_ratio:.2f}배")
print(f"두 효과를 곱한 최종 격차  {combined_ratio:.2f}배")

# 출력:
# 4단계 뜻: 열린 RTB 는 매체에 65.0% 만 닿고 담장 안은 97.0% 가 닿아 구조 격차가 1.49배다. 예측도 정확해 고른 광고의 진짜 CTR 이 4.2076% 로 1.06배 높고, 둘을 곱하면 1.59배다.
# 열린 RTB 매체 실수령         6,502,500원  (65.0%)
# 담장 안 플랫폼 실수령        9,700,000원  (97.0%)
# 효과1: 구조적 격차        1.49배
# 열린 RTB 평균 진짜 CTR    3.9513%
# 담장 안 평균 진짜 CTR     4.2076%
# 효과2: 예측 정확도 격차   1.06배
# 두 효과를 곱한 최종 격차  1.59배
````

### 부록 7: adtech-30min-primer (블록 1개, Task 3)

#### 블록 1

<!-- cb4 post=adtech-30min-primer block=0 sha=4f6bf4ba502060f8 -->
````python
# 하는 일: 광고 노출 한 번이 얼마짜리인지 노출, 클릭, 전환의 곱셈으로 계산한다.

# 1단계: 지면 단가와 두 확률을 둔다
# 광고판의 거의 모든 돈 계산은 노출 -> 클릭 -> 전환으로 이어지는 이 곱셈 하나로 통한다.
CPM = 3_000                # 이 지면의 노출 단가: 1,000회 노출에 3,000원(매체가 부르는 값)
cost_per_impression = CPM / 1000     # 노출 1회의 원가

pCTR = 0.01                # 이 유저가 이 광고를 클릭할 확률(pCTR 모델의 출력)
pCVR = 0.05                # 클릭 후 실제로 구매할 확률(pCVR 모델의 출력)
conversion_value = 20_000  # 전환 1건이 광고주에게 주는 가치(예: 마진)

# 2단계: CPM 을 CPC 와 CPA 로 환산한다
# 이 지면을 클릭 기준으로 사면 얼마인 셈인지(CPC), 전환 기준으로 사면 얼마인 셈인지(CPA) 구한다.
equivalent_cpc = cost_per_impression / pCTR

# CPC -> CPA 환산
equivalent_cpa = equivalent_cpc / pCVR

# 3단계: 거꾸로 최대 입찰가를 구한다
# 전환 1건에 20,000원까지는 낼 만하다고 정했다면, 이 노출 한 번의 기대가치(= 부를 수 있는 최대 입찰가)가 얼마인지 구한다.
max_bid = conversion_value * pCTR * pCVR

# 4단계: 다섯 값을 찍는다
# 원가와 기대가치를 나란히 놓아 노출 한 번에 남는 돈을 본다.
print(f"노출당 원가                  {cost_per_impression:,.1f}원")
print(f"환산 CPC                     {equivalent_cpc:,.0f}원")
print(f"환산 CPA                     {equivalent_cpa:,.0f}원")
print(f"이 노출의 기대가치(최대 입찰가)  {max_bid:,.1f}원")
print(f"이문(기대가치 - 원가)          {max_bid - cost_per_impression:+,.1f}원")

# 출력:
# 4단계 뜻: 노출 한 번의 원가는 3.0원이고, 클릭 기준으로는 300원, 전환 기준으로는 6,000원인 셈이다. 기대가치가 10.0원이라 노출마다 7.0원이 남는다.
# 노출당 원가                  3.0원
# 환산 CPC                     300원
# 환산 CPA                     6,000원
# 이 노출의 기대가치(최대 입찰가)  10.0원
# 이문(기대가치 - 원가)          +7.0원
````

### 부록 8: ad-serving-flow (블록 1개, Task 3)

#### 블록 1

<!-- cb4 post=ad-serving-flow block=0 sha=3867dbbcc6ed0a70 -->
````python
# 하는 일: 광고 요청 1건의 후보가 필터 네 개를 지나며 줄어드는 과정을 보고, 필터 순서를 바꾸면 처리 비용(=지연)이 어떻게 달라지는지 견준다.

# 1단계: 후보 수와 필터 네 개를 둔다
# 본문의 여덟 단계 코드 경로 가운데 필터링 단계다. 후보 수, 통과율, 비용은 이 글의 가데이터 표와 맞춘 예시값이고, 표준 라이브러리만 쓴다.
CANDIDATES_START = 120_000

# (필터 이름, 통과율, 후보 1건 검사 비용ns) — 순서는 실제 파이프라인 순서.
# 통과율은 '독립'이라고 가정한다: 각 필터는 다른 필터와 무관하게 후보를 받아들이거나 뺀다.
# 비용(ns)은 필터 하나가 후보 1건을 검사하는 데 드는 상대적 비용의 예시치다.
PIPELINE = [
    ("타겟 조건(세그먼트, 지면, 연령)", 0.035,     10),  # 인덱스/비트마스크 조회 — 가장 싸다
    ("예산 소진 제외",               0.55,       8),  # 카운터 비교 — 싸다
    ("빈도 제한",                    0.50,      25),  # 캐시 조회 — 중간
    ("브랜드 안전",                  800 / 1155, 80),  # 카테고리 매칭 — 가장 비싸다
]


# 2단계: 필터를 차례로 적용하는 함수를 만든다
# 필터마다 지금 남은 후보 전부를 검사하므로, 비용은 남은 후보 수에 1건 검사 비용을 곱해 쌓인다.
def run_funnel(pipeline, start):
    """단계를 순서대로 적용해 (단계별 남은 후보 수, 총 검사 비용ns)을 반환한다."""
    remaining = start
    counts = [remaining]
    total_cost_ns = 0
    for _name, rate, cost_ns in pipeline:
        total_cost_ns += remaining * cost_ns  # 이 단계는 '지금 남은 후보 전부'를 검사해야 한다
        remaining = round(remaining * rate)
        counts.append(remaining)
    return counts, total_cost_ns


# 3단계: 실제 순서로 후보 수 변화를 본다
# 싼 필터에서 비싼 필터 순서다.
counts, cost_actual = run_funnel(PIPELINE, CANDIDATES_START)
print("(a) 실제 순서 — 단계별 남은 후보 수")
labels = ["시작(전체 캠페인 후보)"] + [name for name, _r, _c in PIPELINE]
for label, n in zip(labels, counts):
    print(f"    {label:<28} {n:>7,}건")

# 4단계: 순서를 뒤집어 비용을 견준다
# 비싼 필터를 먼저 두면, 필터가 독립이라 최종 생존자는 같아도 처리 비용은 달라진다.
reversed_pipeline = list(reversed(PIPELINE))
counts_rev, cost_reversed = run_funnel(reversed_pipeline, CANDIDATES_START)

print("\n(b) 필터 순서 비교 — 최종 생존자는 같아도 비용은 다르다")
print(f"    실제 순서(싼 필터 먼저)    최종 {counts[-1]:>4,}건   비용 {cost_actual/1e6:6.3f}ms")
print(f"    거꾸로 순서(비싼 필터 먼저) 최종 {counts_rev[-1]:>4,}건   비용 {cost_reversed/1e6:6.3f}ms")
print(f"    비용 배율: {cost_reversed/cost_actual:.2f}배")

# 검산: 필터가 독립이라면 최종 생존자 수는 순서와 무관해야 한다(반올림 오차 정도만 허용)
assert abs(counts[-1] - counts_rev[-1]) <= 1

# 출력:
# 3단계 뜻: 가장 싼 타겟 조건이 120,000건을 4,200건으로 줄이고, 브랜드 안전까지 지나면 800건이 남는다.
# (a) 실제 순서 — 단계별 남은 후보 수
#     시작(전체 캠페인 후보)                120,000건
#     타겟 조건(세그먼트, 지면, 연령)            4,200건
#     예산 소진 제외                       2,310건
#     빈도 제한                          1,155건
#     브랜드 안전                           800건
# 4단계 뜻: 순서를 뒤집어도 최종 800건은 같지만, 비싼 필터가 후보를 전부 검사해 비용이 1.384ms 에서 12.239ms 로 8.84배가 된다.
#
# (b) 필터 순서 비교 — 최종 생존자는 같아도 비용은 다르다
#     실제 순서(싼 필터 먼저)    최종  800건   비용  1.384ms
#     거꾸로 순서(비싼 필터 먼저) 최종  800건   비용 12.239ms
#     비용 배율: 8.84배
````

### 부록 9: adtech-ecosystem-map (블록 3개, Task 3)

#### 블록 1

<!-- cb4 post=adtech-ecosystem-map block=0 sha=c42dec1c444b53fe -->
````python
# 하는 일: 페이지가 한 번 열릴 때 지도의 「SSP → Exchange → DSP」 화살표 하나에서 Bid Request 가 몇 건 나가는지 세고, 하루와 초당으로 늘려 본다.
SLOTS, SSP_PER_SLOT, DSP_PER_AUCTION = 5, 3, 20  # 지면 수, 지면당 SSP, 경매당 DSP
PAGEVIEW = 10_000_000                            # 이 매체의 하루 페이지뷰

per_page = SLOTS * SSP_PER_SLOT * DSP_PER_AUCTION  # 페이지 1회의 Bid Request
daily = per_page * PAGEVIEW                        # 하루 총건
avg = daily / 86_400                               # 초당 평균(하루 = 86,400초)

for label, n in [("페이지 1회", per_page), ("하루 전체", daily), ("초당 평균", avg),
                 ("초당 피크(평균×3)", avg * 3), ("DSP 1곳 몫", avg / DSP_PER_AUCTION),
                 ("매체 100곳이면", avg * 100)]:
    print(f"{n:>15,.0f} 건  {label}")

# 출력:
# 뜻: 페이지 한 번이 Bid Request 300건을 만든다. 하루면 3,000,000,000건이고, 초당 평균 34,722건에 피크는 104,167건이다. 매체가 100곳이면 초당 3,472,222건이다.
#             300 건  페이지 1회
#   3,000,000,000 건  하루 전체
#          34,722 건  초당 평균
#         104,167 건  초당 피크(평균×3)
#           1,736 건  DSP 1곳 몫
#       3,472,222 건  매체 100곳이면
````

#### 블록 2

<!-- cb4 post=adtech-ecosystem-map block=1 sha=4f95db650a0b445b -->
````python
# 하는 일: 지도의 모듈을 이웃 관계로 잇고, 각 모듈이 pCTR 에서 화살표 몇 개 떨어져 있는지 센다.
from collections import deque

# 1단계: 지도의 화살표를 옮겨 적는다
# 지도의 화살표를 짧은 이름으로 옮겨 적었다(방향은 빼고 이웃 관계만 본다).
TRADE = ("user-pub pub-ssp ssp-ex ex-dsp dsp-adv ex-auc ex-pub pub-hb hb-ssp user-log "
         "pub-log log-mmp mmp-adv dmp-dsp dco-dsp brand-adv cmp-dmp journey-log journey-cmp")
BRAIN = "fs-train train-serve serve-mon mon-train fs-serve cand-serve serve-pctr pctr-calib calib-bid"
CROSS = "dsp-pctr dsp-serve dsp-cand dmp-cand auc-pctr bid-dsp log-fs"  # 두 층을 잇는 화살표

# 2단계: 이웃 관계 그래프를 만든다
# 화살표 양 끝을 서로의 이웃으로 담는다.
g = {}
for pair in f"{TRADE} {BRAIN} {CROSS}".split():
    a, b = pair.split("-")
    g.setdefault(a, set()).add(b)   # 이웃 관계는 양방향으로 담는다
    g.setdefault(b, set()).add(a)

# 3단계: pCTR 에서 너비 우선 탐색으로 거리를 잰다
# pCTR 에서 출발해 화살표 몇 개를 건너면 닿는지를 다리 수로 센다.
dist, q = {"pctr": 0}, deque(["pctr"])  # 심장에서 출발하는 너비 우선 탐색
while q:
    n = q.popleft()
    for m in sorted(g[n]):              # sorted로 출력 순서를 고정
        if m not in dist:
            dist[m] = dist[n] + 1
            q.append(m)

print(f"모듈 {len(g)}개, 두 층을 잇는 화살표 {len(CROSS.split())}개")
for k in range(max(dist.values()) + 1):
    same = sorted(n for n, v in dist.items() if v == k)
    print(f"{k}다리 {len(same):2d}개  {' '.join(same)}")

# 출력:
# 3단계 뜻: 모듈 23개 가운데 pCTR 에 바로 닿는 것이 4개, 두 다리가 9개, 세 다리가 6개다. 가장 먼 hb, journey, user 도 네 다리다.
# 모듈 23개, 두 층을 잇는 화살표 7개
# 0다리  1개  pctr
# 1다리  4개  auc calib dsp serve
# 2다리  9개  adv bid cand dco dmp ex fs mon train
# 3다리  6개  brand cmp log mmp pub ssp
# 4다리  3개  hb journey user
````

#### 블록 3

<!-- cb4 post=adtech-ecosystem-map block=2 sha=86a07946310b6f65 -->
````python
# 하는 일: 로그가 학습을 거쳐 다시 서빙 모델에 닿기까지 한 바퀴 걸리는 시간을 더하고, 하루 학습 횟수마다 서빙 모델이 평균 몇 시간 전 데이터를 보는지 구한다.
# 1단계: 고리의 단계와 시간을 둔다
# 두뇌 층은 로그가 한 바퀴 돌아 다시 모델에 닿는 고리다. 단계마다 걸리는 시간(시간 단위)을 둔다.
STAGES = [
    ("로그 수집, 조인", 0.5),   # 노출, 클릭 로그가 모여 붙기까지
    ("전환 라벨 대기", 24.0),  # 전환은 클릭보다 한참 늦게 온다
    ("학습셋 만들기", 1.5),    # Feature Store에서 피처를 붙인다
    ("모델 학습", 4.0),        # Training
    ("오프라인 검증", 1.0),    # AUC, LogLoss가 기준을 넘는지
    ("배포, 워밍업", 0.5),      # Model Serving 교체
]
# 2단계: 한 바퀴 시간을 더해 찍는다
# 단계마다 한 바퀴에서 차지하는 몫을 함께 찍는다.
loop = sum(h for _, h in STAGES)
for name, h in STAGES:
    print(f"{h:5.1f}시간 ({h / loop:3.0%})  {name}")
print(f"{loop:5.1f}시간         한 바퀴 전체")

# 3단계: 학습 횟수별 모델 나이를 구한다
# 학습을 하루 n번 돌리면 지금 서빙 중인 모델이 평균 몇 시간 전 세상을 보는지 구한다.
# 모델 나이는 한 주기 안에서 loop ~ loop+24/n을 오가니 평균은 loop+12/n이다.
for n in (1, 4, 24):
    print(f"하루 {n:2d}회 학습 → 모델 나이 평균 {loop + 12 / n:.1f}시간")

# 출력:
# 2단계 뜻: 한 바퀴는 31.5시간이고, 그중 전환 라벨 대기 24.0시간이 76% 를 차지한다. 모델 학습은 4.0시간, 13% 다.
#   0.5시간 ( 2%)  로그 수집, 조인
#  24.0시간 (76%)  전환 라벨 대기
#   1.5시간 ( 5%)  학습셋 만들기
#   4.0시간 (13%)  모델 학습
#   1.0시간 ( 3%)  오프라인 검증
#   0.5시간 ( 2%)  배포, 워밍업
#  31.5시간         한 바퀴 전체
# 3단계 뜻: 하루 24회 학습해도 모델 나이는 32.0시간으로, 1회의 43.5시간에서 크게 줄지 않는다. 4회만 돌려도 34.5시간이다.
# 하루  1회 학습 → 모델 나이 평균 43.5시간
# 하루  4회 학습 → 모델 나이 평균 34.5시간
# 하루 24회 학습 → 모델 나이 평균 32.0시간
````

### 부록 10: adtech-dev-layers (블록 2개, Task 3)

#### 블록 1

<!-- cb4 post=adtech-dev-layers block=0 sha=39b8026634b995d8 -->
````python
# 하는 일: DCO 가 제목, 이미지, CTA, 배경색으로 만드는 소재 조합 수를 세고, 그 조합을 A/B 로 다 검증하는 데 드는 날수를 구한 뒤, 같은 노출에서 A/B 와 밴딧의 클릭 수를 견준다.

# 1단계: 소재 요소의 조합 수를 센다
# DCO 는 제목, 이미지, CTA, 배경색을 조합해 소재를 자동으로 만든다. 소재 조합을 사람이 다 못 고르는 까닭을 개수부터 센다.
import random
random.seed(42)

SLOTS = {"제목": 5, "이미지": 4, "CTA 문구": 3, "배경색": 3}

combos = 1
parts = []
for name, n in SLOTS.items():
    combos *= n
    parts.append(f"{name} {n}")
print("소재 요소:", " × ".join(parts))
print(f"만들 수 있는 조합  {combos}개")
print()

# 2단계: A/B 로 전 조합을 검증하는 데 드는 날을 센다
# 「다 만들어서 A/B 를 돌리면 되지 않나?」가 왜 안 통하는지 본다. 기준 CTR 2% 에서 상대 10% 차이를 잡으려면 변형마다 약 8만 노출이 든다(RCT 글의 표본 크기 계산과 같은 뼈대다).
PER_VARIANT = 80_680
DAILY_IMPRESSIONS = 500_000

print(f"A/B로 전 조합 검증하려면 (변형당 {PER_VARIANT:,}회 필요, 하루 {DAILY_IMPRESSIONS:,}회 노출)")
for label, slots in [("작게 잡아도", SLOTS), ("실무 규모라면", {"제목": 8, "이미지": 6, "CTA 문구": 4, "배경색": 3})]:
    n = 1
    for v in slots.values():
        n *= v
    need = n * PER_VARIANT
    d = need / DAILY_IMPRESSIONS
    print(f"  {label:<10} 조합 {n:>4}개 → {need:>12,}회 → {d:>5.0f}일")
print("  → 캠페인이 보통 2~4주인데, 작게 잡아도 그 기간을 다 써야 첫 결론이 나온다.")
print("  → 요소를 조금만 늘리면 석 달이 넘는다. 그동안 얻는 정보는 0이다.")
print()

# 3단계: 밴딧으로 좋은 조합을 찾아 쓴다
# 나쁜 조합을 일찍 접고 좋은 조합에 노출을 몰아준다.
# 전 조합을 '검증'하지 않고, 좋은 걸 '찾아' 쓴다.
true_ctr = {}
for i in range(combos):
    # 조합마다 진짜 CTR을 만든다. 대부분 평범하고 몇 개만 좋다(현실의 모양).
    true_ctr[i] = max(0.002, random.gauss(0.020, 0.006))
best_i = max(true_ctr, key=true_ctr.get)

def run_ab(impressions):
    """모든 조합에 노출을 똑같이 나눈다."""
    per = impressions // combos
    return sum(true_ctr[i] * per for i in range(combos))

def run_bandit(impressions, explore_share=0.15):
    """앞부분만 탐색에 쓰고, 그 뒤엔 그때까지 1등에 몰아준다."""
    explore = int(impressions * explore_share)
    per = explore // combos
    clicks = sum(true_ctr[i] * per for i in range(combos))
    # 탐색 구간의 관측으로 1등을 고른다(노출이 적으면 잘못 고를 수도 있다)
    observed = {i: random.binomialvariate(per, true_ctr[i]) if hasattr(random, 'binomialvariate')
                   else sum(1 for _ in range(per) if random.random() < true_ctr[i])
                for i in range(combos)}
    picked = max(observed, key=observed.get)
    clicks += true_ctr[picked] * (impressions - explore)
    return clicks, picked

# 4단계: 노출 3백만 회로 두 방식의 클릭을 견준다
# A/B 는 노출을 모든 조합에 똑같이 나누고, 밴딧은 15% 만 탐색에 쓴다.
TOTAL = 3_000_000
ab = run_ab(TOTAL)
bandit, picked = run_bandit(TOTAL)
print(f"노출 {TOTAL:,}회를 쓸 때 클릭 수")
print(f"  A/B (전 조합 균등)   {ab:>10,.0f}회")
print(f"  밴딧 (탐색 15%)      {bandit:>10,.0f}회   {(bandit/ab-1)*100:+.1f}%")
print(f"  진짜 1등 조합 #{best_i} (CTR {true_ctr[best_i]:.2%})"
      f" / 밴딧이 고른 조합 #{picked} (CTR {true_ctr[picked]:.2%})")
print()
print("→ 조합이 180개면 A/B로는 다 못 재본다. 시간이 안 된다.")
print("→ 밴딧은 '전부 검증'을 포기하고 '좋은 걸 빨리 쓰기'를 택한다.")
print("→ 소재 레이어에서 밴딧이 잘 통하는 이유는, 실패가 다음 학습을 오염시키지 않기 때문이다.")

# 출력:
# 1단계 뜻: 요소 넷을 곱하면 만들 수 있는 조합이 180개다.
# 소재 요소: 제목 5 × 이미지 4 × CTA 문구 3 × 배경색 3
# 만들 수 있는 조합  180개
#
# 2단계 뜻: 변형마다 80,680회씩이면 작게 잡아도 29일, 실무 규모 576개면 93일이 걸린다.
# A/B로 전 조합 검증하려면 (변형당 80,680회 필요, 하루 500,000회 노출)
#   작게 잡아도     조합  180개 →   14,522,400회 →    29일
#   실무 규모라면    조합  576개 →   46,471,680회 →    93일
#   → 캠페인이 보통 2~4주인데, 작게 잡아도 그 기간을 다 써야 첫 결론이 나온다.
#   → 요소를 조금만 늘리면 석 달이 넘는다. 그동안 얻는 정보는 0이다.
#
# 4단계 뜻: 같은 노출 3,000,000회로 밴딧이 클릭을 40.1% 더 얻는다. 진짜 1등 #53 은 못 골랐지만 CTR 3.05% 인 #132 를 골라 쓴다.
# 노출 3,000,000회를 쓸 때 클릭 수
#   A/B (전 조합 균등)       62,111회
#   밴딧 (탐색 15%)          87,027회   +40.1%
#   진짜 1등 조합 #53 (CTR 3.40%) / 밴딧이 고른 조합 #132 (CTR 3.05%)
#
# → 조합이 180개면 A/B로는 다 못 재본다. 시간이 안 된다.
# → 밴딧은 '전부 검증'을 포기하고 '좋은 걸 빨리 쓰기'를 택한다.
# → 소재 레이어에서 밴딧이 잘 통하는 이유는, 실패가 다음 학습을 오염시키지 않기 때문이다.
````

#### 블록 2

<!-- cb4 post=adtech-dev-layers block=1 sha=c8ce6bde48df911b -->
````python
# 하는 일: 광고 레이어 가운데 무엇부터 손볼지, 한 레이어가 10% 틀릴 때 줄어드는 매출과 그 오차가 번지는 층 수로 견준다.

# 1단계: 기대수익 곱셈 사슬을 둔다
# 광고 하나의 기대수익은 도달가능유저 × pCTR × pCVR × 전환가치 × (소재계수) × (측정신뢰도)로, 레이어 결과가 곱해져 만들어진다. 무엇부터 손볼지는 이 사슬에서 어디에 있느냐로 정해진다.
BASE = {
    "도달 유저(타겟팅)":   1_000_000,   # 이 캠페인이 닿을 수 있는 유저 수
    "pCTR":                0.020,       # 노출→클릭
    "pCVR":                0.050,       # 클릭→전환
    "전환가치(원)":         30_000,
    "소재계수":             1.00,        # 소재가 평균일 때 1.0
    "측정신뢰도":           1.00,        # 성과를 얼마나 정확히 세는가
}

def revenue(d):
    """기대 매출 = 도달 × pCTR × pCVR × 전환가치 × 소재계수. 측정은 매출이 아니라 '판단'에 곱해진다."""
    return (d["도달 유저(타겟팅)"] * d["pCTR"] * d["pCVR"]
            * d["전환가치(원)"] * d["소재계수"])

base_rev = revenue(BASE)
print(f"기준 기대매출  {base_rev:,.0f}원")
print(f"  = 도달 {BASE['도달 유저(타겟팅)']:,}명 × pCTR {BASE['pCTR']:.1%}"
      f" × pCVR {BASE['pCVR']:.1%} × 전환가치 {BASE['전환가치(원)']:,}원")
print()

# 2단계: 한 레이어만 10% 나빠뜨린다
# 곱셈이므로 어느 한 칸이 10% 틀리면 결과도 10% 틀린다.
print("한 레이어만 10% 나빠질 때")
print(f"{'레이어':<20}{'매출':>16}{'감소':>10}")
rows = []
for k in ["도달 유저(타겟팅)", "pCTR", "pCVR", "소재계수"]:
    d = dict(BASE)
    d[k] = d[k] * 0.9
    r = revenue(d)
    rows.append((k, r, (r / base_rev - 1) * 100))
    print(f"{k:<20}{r:>14,.0f}원{(r/base_rev-1)*100:>9.1f}%")
print("  → 곱셈 사슬이라 어느 칸이든 10%면 매출도 10%. 여기까진 같다.")
print()

# 3단계: 오차가 번지는 층 수를 견준다
# 차이는 그 오차가 몇 칸을 타고 번지는가에서 생긴다.

# 타겟팅이 틀리면 잘못된 유저에게 노출된다. 그 노출로 만든 클릭, 전환 로그가
# 다시 모델 학습 데이터가 되므로, 오차가 다음 학습에 실려 되돌아온다.
# pCTR이 틀리면 입찰가가 틀리고, 낙찰 결과가 다시 로그가 된다.
# 소재는 그 라운드에서만 손해가 나고 다음 학습을 오염시키지 않는다.
CASCADE = {
    "타겟팅":   3,   # 서빙 → 예측 학습 → 입찰. 세 층으로 번진다
    "예측":     2,   # 입찰 → 측정
    "입찰":     1,   # 낙찰 결과에만
    "소재":     0,   # 그 라운드에서 끝
    "측정":     3,   # 모든 판단의 근거라, 틀리면 위 전부를 잘못 고친다
}
print("같은 10% 오차가 몇 개 층으로 번지나 (1라운드 뒤 누적 영향)")
print(f"{'레이어':<8}{'번지는 층':>10}{'누적 영향':>12}")
for k, hops in sorted(CASCADE.items(), key=lambda x: -x[1]):
    # 한 층 지날 때마다 오차가 0.9배씩 더 실린다고 단순 가정
    cumulative = (0.9 ** (1 + hops) - 1) * 100
    print(f"{k:<8}{hops:>8}층{cumulative:>11.1f}%")
print()
print("→ 매출 감소만 보면 모든 레이어가 같아 보인다.")
print("→ 하지만 타겟팅, 측정 오차는 다음 학습을 오염시켜 몇 배로 되돌아온다.")
print("→ 그래서 '먼저 고칠 곳'은 사슬 앞쪽(타겟팅)과 판단 근거(측정)다.")
print("→ 소재는 되돌아오지 않으니 마음껏 실험해도 된다 — 그래서 밴딧을 쓴다.")

# 출력:
# 1단계 뜻: 도달 1,000,000명에 pCTR 2.0%, pCVR 5.0%, 전환가치 30,000원을 곱하면 기준 기대매출은 30,000,000원이다.
# 기준 기대매출  30,000,000원
#   = 도달 1,000,000명 × pCTR 2.0% × pCVR 5.0% × 전환가치 30,000원
#
# 2단계 뜻: 어느 레이어를 10% 나빠뜨려도 매출은 똑같이 27,000,000원으로 10.0% 준다.
# 한 레이어만 10% 나빠질 때
# 레이어                               매출        감소
# 도달 유저(타겟팅)              27,000,000원    -10.0%
# pCTR                    27,000,000원    -10.0%
# pCVR                    27,000,000원    -10.0%
# 소재계수                    27,000,000원    -10.0%
#   → 곱셈 사슬이라 어느 칸이든 10%면 매출도 10%. 여기까진 같다.
#
# 3단계 뜻: 같은 10% 오차라도 타겟팅과 측정은 3층으로 번져 누적 영향이 -34.4% 이고, 소재는 번지지 않아 -10.0% 에서 멈춘다.
# 같은 10% 오차가 몇 개 층으로 번지나 (1라운드 뒤 누적 영향)
# 레이어          번지는 층       누적 영향
# 타겟팅            3층      -34.4%
# 측정             3층      -34.4%
# 예측             2층      -27.1%
# 입찰             1층      -19.0%
# 소재             0층      -10.0%
#
# → 매출 감소만 보면 모든 레이어가 같아 보인다.
# → 하지만 타겟팅, 측정 오차는 다음 학습을 오염시켜 몇 배로 되돌아온다.
# → 그래서 '먼저 고칠 곳'은 사슬 앞쪽(타겟팅)과 판단 근거(측정)다.
# → 소재는 되돌아오지 않으니 마음껏 실험해도 된다 — 그래서 밴딧을 쓴다.
````

### 부록 11: ecpm-ranking (블록 3개, Task 3)

#### 블록 1

<!-- cb4 post=ecpm-ranking block=0 sha=6791368e2440ce41 old=run -->
````python
# 하는 일: 과금 방식이 다른 캠페인 셋(CPM, CPC, CPA)의 입찰을 eCPM 으로 바꿔 한 지면에서 견준다.
# 1단계: 과금 방식별 eCPM 함수를 만든다
# eCPM 은 1,000회 노출당 기대 수익이다. CPC 는 클릭 확률을, CPA 는 전환 확률까지 곱해 같은 단위로 맞춘다.
def compute_ecpm(bid_type, bid, pCTR=None, pCVR=None):
    """과금 모델별 eCPM 정규화: 1,000회 노출당 기대 수익"""
    if bid_type == "CPM":
        return bid                            # CPM은 그대로
    elif bid_type == "CPC":
        return pCTR * bid * 1000              # 클릭 확률 × CPC × 1000
    elif bid_type == "CPA":
        return pCTR * pCVR * bid * 1000       # 클릭 × 전환 확률 × CPA × 1000
    raise ValueError(f"Unknown: {bid_type}")

# 2단계: 세 캠페인을 같은 지면에서 견준다
campaigns = [
    {"name": "캠페인A(CPM)", "type": "CPM", "bid": 8000},
    {"name": "캠페인B(CPC)", "type": "CPC", "bid": 2000, "pCTR": 0.05},
    {"name": "캠페인C(CPA)", "type": "CPA", "bid": 50000,
     "pCTR": 0.03, "pCVR": 0.10},
]

results = []
for c in campaigns:
    ecpm = compute_ecpm(c["type"], c["bid"], c.get("pCTR"), c.get("pCVR"))
    results.append((c["name"], ecpm))
    print(f"  {c['name']}: eCPM = {ecpm:,.0f}원")

winner = max(results, key=lambda x: x[1])
print(f"\n  승자: {winner[0]} (eCPM {winner[1]:,.0f}원)")

# 출력:
# 2단계 뜻: eCPM 으로 바꾸면 A 는 8,000원, B 는 100,000원, C 는 150,000원이라 CPA 캠페인 C 가 이긴다. 과금 모델이 달라도 eCPM 으로 공정하게 견줄 수 있다.
#   캠페인A(CPM): eCPM = 8,000원
#   캠페인B(CPC): eCPM = 100,000원
#   캠페인C(CPA): eCPM = 150,000원
#
#   승자: 캠페인C(CPA) (eCPM 150,000원)
````

#### 블록 2

<!-- cb4 post=ecpm-ranking block=1 sha=bbb4ed99264f505c old=run -->
````python
# 하는 일: 고품질 광고 A 와 고입찰 광고 B 를 세 시장 유형의 랭킹 식으로 점수 매겨, 누가 이기는지 견준다.
def ranking_comparison():
    """세 시장 유형에서 동일 광고주의 랭킹 결과 비교"""
    ads = {
        "A(고품질)": {"cpc": 1000, "pCTR": 0.10, "cpm": 8000},
        "B(고입찰)": {"cpc": 3000, "pCTR": 0.01, "cpm": 25000},
    }
    markets = {
        "Open RTB":      lambda a: a["cpm"],                  # 입찰가만
        "CPC Exchange":  lambda a: a["pCTR"] * a["cpc"] * 1000,  # eCPM
        "Walled Garden": lambda a: a["pCTR"] * a["cpc"],      # pCTR × Bid
    }

    for market, score_fn in markets.items():
        scores = {name: score_fn(ad) for name, ad in ads.items()}
        winner = max(scores, key=scores.get)
        parts = "  ".join(f"{n}={s:,.0f}" + (" ← 승" if n == winner else "")
                         for n, s in scores.items())
        print(f"  {market:15s}: {parts}")

ranking_comparison()

# 출력:
# 뜻: 입찰가만 보는 Open RTB 에서는 고입찰 B 가 25,000 으로 이기고, pCTR 을 곱하는 CPC Exchange 와 Walled Garden 에서는 고품질 A 가 이긴다. 돈이 결정하느냐, 품질이 결정하느냐의 차이다.
#   Open RTB       : A(고품질)=8,000  B(고입찰)=25,000 ← 승
#   CPC Exchange   : A(고품질)=100,000 ← 승  B(고입찰)=30,000
#   Walled Garden  : A(고품질)=100 ← 승  B(고입찰)=30
````

#### 블록 3

<!-- cb4 post=ecpm-ranking block=2 sha=6d8ae311c79e1851 old=run -->
````python
# 하는 일: 같은 광고 후보 4개에 랭킹 기준 셋을 적용해 1등이 바뀌는지 본다.
# 1단계: 광고 후보 4개를 둔다
# 광고마다 pCTR, CPC, 품질계수, 사용자 비용(beta)을 담는다.
ads = {
    "A(반짝세일 쿠폰)": {"pctr": 0.080, "cpc": 500,  "quality": 0.60, "beta": 32_000},
    "B(구독 서비스)":   {"pctr": 0.025, "cpc": 1400, "quality": 0.90, "beta": 500},
    "C(대출 광고)":     {"pctr": 0.030, "cpc": 2400, "quality": 0.40, "beta": 48_000},
    "D(지역 맛집)":     {"pctr": 0.050, "cpc": 750,  "quality": 1.20, "beta": 6_000},
}

# 2단계: 세 랭킹 기준을 만든다
# 기준은 순수 eCPM(돈), 품질 가중(eCPM x 품질계수), LTV 기준(eCPM - 사용자 비용) 셋이다.
def ecpm(a):
    return a["pctr"] * a["cpc"] * 1000   # 순수 eCPM: pCTR x Bid x 1,000 (1절)

criteria = {
    # 세 기준 모두 같은 eCPM에서 출발하지만, 그 위에 더하는 항이 다르다.
    "순수 eCPM": lambda a: ecpm(a),                    # eCPM 그대로 -- 돈이 전부
    "품질 가중":  lambda a: ecpm(a) * a["quality"],    # x 품질계수(③ Final Score 아이디어 단순화)
    "LTV 기준":  lambda a: ecpm(a) - a["beta"],        # - 사용자 비용(beta) -> LTV 포스트 참고
}

# 3단계: 기준마다 순위를 찍는다
for name, score_fn in criteria.items():
    scores = {ad: score_fn(v) for ad, v in ads.items()}
    ranked = sorted(scores, key=scores.get, reverse=True)
    line = "  ".join(f"{ad}={scores[ad]:,.0f}" + (" <- 1위" if ad == ranked[0] else "")
                     for ad in ranked)
    print(f"{name:10s}: {line}")

# 출력:
# 3단계 뜻: 돈만 보면 대출 광고 C 가 72,000 으로 1위지만, 품질을 곱하면 지역 맛집 D 가, 사용자 비용을 빼면 구독 서비스 B 가 1위다. 기준만 바꿔도 1위가 셋 다 다르다.
# 순수 eCPM   : C(대출 광고)=72,000 <- 1위  A(반짝세일 쿠폰)=40,000  D(지역 맛집)=37,500  B(구독 서비스)=35,000
# 품질 가중     : D(지역 맛집)=45,000 <- 1위  B(구독 서비스)=31,500  C(대출 광고)=28,800  A(반짝세일 쿠폰)=24,000
# LTV 기준    : B(구독 서비스)=34,500 <- 1위  D(지역 맛집)=31,500  C(대출 광고)=24,000  A(반짝세일 쿠폰)=8,000
````

### 부록 12: ltv-ad-ranking (블록 4개, Task 4)

#### 블록 1

<!-- cb4 post=ltv-ad-ranking block=0 sha=155edd475c15ee8b old=run -->
````python
# 하는 일: 검색어 「여행 가방」에 나온 광고 셋의 eCPM 에서 사용자 비용 β 를 빼 LTV 를 구하고, LTV 가 음수인 광고는 빼고 순위를 정한다.
# 1단계: LTV 를 구하는 함수를 만든다
# LTV 는 eCPM 에서 그 노출이 사용자에게 지우는 비용 β 를 뺀 값이다.
def compute_ltv(pCTR, bid, beta):
    """LTV = eCPM - β"""
    ecpm = pCTR * bid * 1000
    ltv = ecpm - beta
    return ecpm, ltv

# 2단계: 광고 셋을 둔다
# 광고마다 pCTR, 입찰가, 사용자 비용 β 를 담는다.
ads = [
    {"name": "광고A(명품 가방)",   "pCTR": 0.02, "bid": 3000, "beta": 25000},
    {"name": "광고B(여행용 캐리어)", "pCTR": 0.05, "bid": 1500, "beta": 5000},
    {"name": "광고C(다이어트 약)",  "pCTR": 0.003, "bid": 5000, "beta": 20000},
]

# 3단계: 광고마다 LTV 를 구하고 순위를 찍는다
# LTV 가 음수인 광고는 노출에서 뺀다.
print("  검색어: '여행 가방'\n")
ranked = []
for ad in ads:
    ecpm, ltv = compute_ltv(ad["pCTR"], ad["bid"], ad["beta"])
    status = "노출" if ltv > 0 else "제외 (LTV < 0)"
    print(f"  {ad['name']}: eCPM={ecpm:,.0f}원, β={ad['beta']:,.0f}원, "
          f"LTV={ltv:,.0f}원 → {status}")
    if ltv > 0:
        ranked.append((ad["name"], ltv))

ranked.sort(key=lambda x: -x[1])
print(f"\n  최종 랭킹:")
for i, (name, ltv) in enumerate(ranked, 1):
    print(f"    {i}위: {name} (LTV {ltv:,.0f}원)")

# 출력:
# 3단계 뜻: eCPM 만 보면 A 의 60,000원이 C 의 15,000원보다 훨씬 앞이고 셋 다 노출 후보다. 사용자 비용 β 를 빼면 C 는 LTV 가 -5,000원으로 음수가 되어 빠지고, B 가 70,000원으로 1위다. 지금 버는 돈보다 그 노출이 사용자를 얼마나 지치게 하는지가 순위를 정한다.
#   검색어: '여행 가방'
#
#   광고A(명품 가방): eCPM=60,000원, β=25,000원, LTV=35,000원 → 노출
#   광고B(여행용 캐리어): eCPM=75,000원, β=5,000원, LTV=70,000원 → 노출
#   광고C(다이어트 약): eCPM=15,000원, β=20,000원, LTV=-5,000원 → 제외 (LTV < 0)
#
#   최종 랭킹:
#     1위: 광고B(여행용 캐리어) (LTV 70,000원)
#     2위: 광고A(명품 가방) (LTV 35,000원)
````

#### 블록 2

<!-- cb4 post=ltv-ad-ranking block=1 sha=6b6d75d2b7ebc154 -->
````python
# 하는 일: 광고 5개의 단기 eCPM 순위와 90일 LTV 순위를 각각 계산해 견준다.
# 1단계: 광고 5개를 둔다
# 표준 라이브러리만 쓰니 그대로 복붙해 돌려 볼 수 있다.
ads = [
    # 광고명, 입찰가(CPC,원), pCTR, 예상 재구매율(90일), 90일 LTV(원)
    {"name": "반값특가 무선이어폰",   "bid": 1500, "pctr": 0.080, "repurchase": 0.05, "ltv90": 25_000},
    {"name": "미스터리박스 반짝특가", "bid": 1100, "pctr": 0.060, "repurchase": 0.08, "ltv90": 30_000},
    {"name": "브랜드 비타민 3개월분", "bid": 1000, "pctr": 0.040, "repurchase": 0.50, "ltv90": 52_000},
    {"name": "유아용 기저귀 정기배송", "bid": 700,  "pctr": 0.035, "repurchase": 0.60, "ltv90": 180_000},
    {"name": "원두커피 정기구독",     "bid": 800,  "pctr": 0.030, "repurchase": 0.55, "ltv90": 150_000},
]

# 2단계: 단기 점수와 장기 점수를 구한다
# 단기 eCPM 은 이번 클릭이 지금 버는 돈이고, LTV 점수는 이번 클릭이 남기는 손님의 90일 가치다.
for ad in ads:
    ad["ecpm"] = ad["pctr"] * ad["bid"] * 1000         # 단기: 이번 클릭이 지금 버는 돈
    ad["ltv_score"] = ad["pctr"] * ad["ltv90"] * 1000  # 장기: 이번 클릭이 남기는 손님의 90일 가치

def rank_by(key):                                       # 점수 내림차순으로 순위 매기기
    ordered = sorted(ads, key=lambda a: -a[key])
    return {a["name"]: i + 1 for i, a in enumerate(ordered)}

ecpm_rank = rank_by("ecpm")
ltv_rank = rank_by("ltv_score")

# 3단계: 두 순위를 나란히 찍는다
# 단기 eCPM 순위대로 줄 세우고 LTV 순위와 변동을 함께 찍는다.
print(f"{'광고':<22}{'단기eCPM':>10}{'eCPM순위':>9}{'LTV점수':>13}{'LTV순위':>8}  변동")
for ad in sorted(ads, key=lambda a: ecpm_rank[a["name"]]):
    name = ad["name"]
    delta = ecpm_rank[name] - ltv_rank[name]            # 양수면 LTV로 갈수록 순위가 내려간 것
    mark = f"{delta:+d}" if delta else "-"
    print(f"{name:<22}{ad['ecpm']:>9,.0f}원{ecpm_rank[name]:>7}위{ad['ltv_score']:>12,.0f}{ltv_rank[name]:>7}위  {mark}")

# 출력:
# 3단계 뜻: 단기 eCPM 1, 2위인 무선이어폰과 미스터리박스는 LTV 로 보면 4, 5위로 내려가고, 4, 5위였던 기저귀 정기배송과 원두커피 정기구독이 1, 2위로 올라온다. 비타민만 3위 그대로다.
# 광고                        단기eCPM   eCPM순위        LTV점수   LTV순위  변동
# 반값특가 무선이어폰              120,000원      1위   2,000,000      4위  -3
# 미스터리박스 반짝특가              66,000원      2위   1,800,000      5위  -3
# 브랜드 비타민 3개월분             40,000원      3위   2,080,000      3위  -
# 유아용 기저귀 정기배송             24,500원      4위   6,300,000      1위  +3
# 원두커피 정기구독                24,000원      5위   4,500,000      2위  +3
````

#### 블록 3

<!-- cb4 post=ltv-ad-ranking block=2 sha=4489a42fc2d385df -->
````python
# 하는 일: 7일 초기 신호로 90일 LTV 를 예측한다고 놓고, 그 예측 오차가 광고 5개의 순위를 얼마나 흔드는지 본다.
# 1단계: 광고 5개와 예측 오차를 둔다
# 표준 라이브러리만 쓰고, 노이즈는 seed 를 고정해 누가 돌려도 같게 만든다.
import random
random.seed(6)

ads = [
    {"name": "반값특가 무선이어폰",   "pctr": 0.080, "ltv90_true": 25_000},
    {"name": "미스터리박스 반짝특가", "pctr": 0.060, "ltv90_true": 30_000},
    {"name": "브랜드 비타민 3개월분", "pctr": 0.040, "ltv90_true": 52_000},
    {"name": "유아용 기저귀 정기배송", "pctr": 0.035, "ltv90_true": 180_000},
    {"name": "원두커피 정기구독",     "pctr": 0.030, "ltv90_true": 150_000},
]
NOISE = 0.35   # 7일 신호만으로 90일 값을 맞히는 모델의 예측 오차(표준편차 비율). 이 정도도 낙관적이다.

# 2단계: 실제 점수와 예측 점수로 순위를 매긴다
# 예측 LTV 는 실제 LTV 에 (1 + 노이즈)를 곱한 값이고, 노이즈는 평균 0, 표준편차 0.35 다.
# 순위는 LTV 가 아니라 pCTR 에 LTV 를 곱한 점수로 매긴다.
def rank_by(data, key):
    ordered = sorted(data, key=lambda a: -a[key])
    return {a["name"]: i + 1 for i, a in enumerate(ordered)}

for ad in ads:
    ad["score_true"] = ad["pctr"] * ad["ltv90_true"] * 1000
    predicted = max(ad["ltv90_true"] * (1 + random.gauss(0, NOISE)), 0)  # 예측이 음수일 순 없다
    ad["ltv90_pred"] = predicted
    ad["score_pred"] = ad["pctr"] * predicted * 1000

true_rank = rank_by(ads, "score_true")
pred_rank = rank_by(ads, "score_pred")

# 3단계: 두 순위를 견주어 찍는다
# 예측 순위가 실제와 다르면 표시한다.
print(f"{'광고':<22}{'실제 LTV':>11}{'예측 LTV':>11}{'실제순위':>8}{'예측순위':>8}")
for ad in sorted(ads, key=lambda a: true_rank[a["name"]]):
    name = ad["name"]
    flag = "  <- 순위 오류" if pred_rank[name] != true_rank[name] else ""
    print(f"{name:<22}{ad['ltv90_true']:>10,.0f}{ad['ltv90_pred']:>11,.0f}{true_rank[name]:>7}위{pred_rank[name]:>7}위{flag}")

# 출력:
# 3단계 뜻: 실제 순위로는 기저귀가 1위지만, 예측이 원두커피의 LTV 를 227,413 으로 부풀려 1위와 2위가 뒤집힌다. 광고 5개 가운데 4개의 순위가 틀린다.
# 광고                         실제 LTV     예측 LTV    실제순위    예측순위
# 유아용 기저귀 정기배송             180,000    184,607      1위      2위  <- 순위 오류
# 원두커피 정기구독                150,000    227,413      2위      1위  <- 순위 오류
# 브랜드 비타민 3개월분              52,000     37,888      3위      4위  <- 순위 오류
# 반값특가 무선이어폰                25,000     29,372      4위      3위  <- 순위 오류
# 미스터리박스 반짝특가               30,000     11,212      5위      5위
````

#### 블록 4

<!-- cb4 post=ltv-ad-ranking block=3 sha=e1af4808b51e42b8 -->
````python
# 하는 일: 90일 LTV 를 이미 확정된 최초 구매분과 아직 안 온 재구매분으로 나누고, 재구매분만 현재가치(PV)로 할인해 세 번째 순위를 만든다.
# 1단계: 광고 5개를 둔다
# 앞 표와 같은 광고 5개다.
ads = [
    {"name": "반값특가 무선이어폰",   "pctr": 0.080, "repurchase": 0.05, "ltv90": 25_000},
    {"name": "미스터리박스 반짝특가", "pctr": 0.060, "repurchase": 0.08, "ltv90": 30_000},
    {"name": "브랜드 비타민 3개월분", "pctr": 0.040, "repurchase": 0.50, "ltv90": 52_000},
    {"name": "유아용 기저귀 정기배송", "pctr": 0.035, "repurchase": 0.60, "ltv90": 180_000},
    {"name": "원두커피 정기구독",     "pctr": 0.030, "repurchase": 0.55, "ltv90": 150_000},
]

# 2단계: 할인율을 정한다
# 재구매분은 대략 3개월 뒤에 들어오니 월 5% 로 세 번 할인한다.
MONTHLY_RATE = 0.05   # 월 5% -- "미래 가치를 얼마나 믿는가"를 나타내는 값
MONTHS_OUT = 3        # 재구매분은 대략 90일(3개월) 시점에 들어온다고 가정
discount = 1 / (1 + MONTHLY_RATE) ** MONTHS_OUT   # ≈ 0.864

def rank_by(data, key):
    ordered = sorted(data, key=lambda a: -a[key])
    return {a["name"]: i + 1 for i, a in enumerate(ordered)}

# 3단계: 할인 전과 후의 점수로 순위를 매긴다
# 최초 구매분은 이미 확정이라 그대로 두고, 재구매분만 할인한다.
for ad in ads:
    ad["ltv_score"] = ad["pctr"] * ad["ltv90"] * 1000             # 할인 전(위 표의 LTV 점수와 동일)
    immediate = ad["ltv90"] * (1 - ad["repurchase"])              # 최초 구매분 -- 이미 확정, 할인 없음
    future = ad["ltv90"] * ad["repurchase"]                       # 재구매분 -- 아직 안 왔으니 할인 대상
    ad["ltv90_pv"] = immediate + future * discount
    ad["ltv_score_pv"] = ad["pctr"] * ad["ltv90_pv"] * 1000       # 할인 후

before_rank = rank_by(ads, "ltv_score")
after_rank = rank_by(ads, "ltv_score_pv")

# 4단계: 두 순위를 찍는다
print(f"{'광고':<22}{'LTV순위(할인전)':>16}{'LTV순위(할인후)':>16}")
for ad in sorted(ads, key=lambda a: before_rank[a["name"]]):
    name = ad["name"]
    flag = "  <- 순위 변동" if after_rank[name] != before_rank[name] else ""
    print(f"{name:<22}{before_rank[name]:>15}위{after_rank[name]:>15}위{flag}")

# 출력:
# 4단계 뜻: 할인하면 비타민이 3위에서 4위로, 무선이어폰이 4위에서 3위로 자리를 바꾼다. 1, 2위와 5위는 그대로다.
# 광고                          LTV순위(할인전)      LTV순위(할인후)
# 유아용 기저귀 정기배송                        1위              1위
# 원두커피 정기구독                           2위              2위
# 브랜드 비타민 3개월분                        3위              4위  <- 순위 변동
# 반값특가 무선이어폰                          4위              3위  <- 순위 변동
# 미스터리박스 반짝특가                         5위              5위
````

### 부록 13: auto-bidding-pacing (블록 4개, Task 4)

#### 블록 1

<!-- cb4 post=auto-bidding-pacing block=0 sha=edf59616acc11dc7 -->
````python
# 하는 일: 같은 하루 예산 100만 원을 시간대 6구간에 아침 몰아쓰기, 균등, 전환율 가중 셋으로 나눠 쓰고 전환과 CPA 를 견준다.
# 1단계: 예산과 시간대 구간을 둔다
# 예산으로 살 수 있는 클릭은 2,000개이고, 구간마다 시장에 있는 클릭에 상한이 있다.
BUDGET, CPC, SUPPLY = 1000000, 500, 4000   # 예산 100만 원, 클릭 단가 500원, 시장 물량 4천 클릭
# 가상 데이터: (트래픽 비중, 전환율) — 위 표와 같은 값
SLOTS = [(0.05, 0.008), (0.10, 0.010), (0.20, 0.016),
         (0.25, 0.026), (0.25, 0.032), (0.15, 0.018)]
BUYABLE = BUDGET / CPC                  # 예산으로 살 수 있는 클릭 = 2,000
CAP = [SUPPLY * s[0] for s in SLOTS]    # 구간마다 시장에 있는 클릭 상한

# 2단계: 아침 몰아쓰기로 나눈다
# 이른 구간부터 살 수 있는 만큼 사고, 예산이 떨어지면 끝낸다.
left, rush = BUYABLE, []
for cap in CAP:
    rush.append(min(cap, left))
    left -= rush[-1]

# 3단계: 시간대 균등으로 나눈다
# 예산을 6등분한다. 새벽엔 살 물량이 없어 상한에 걸린다.
even = [min(cap, BUYABLE / 6) for cap in CAP]

# 4단계: 전환율 가중으로 나눈다
# 구간 가치를 트래픽 비중 x 전환율로 보고, 그 비율대로 나눈다.
w = [s[0] * s[1] for s in SLOTS]
smart = [min(cap, BUYABLE * wi / sum(w)) for cap, wi in zip(CAP, w)]

# 5단계: 세 방식의 소진, 전환, CPA 를 찍는다
for name, clicks in [("(a) 아침 몰아쓰기", rush), ("(b) 균등", even), ("(c) 가중", smart)]:
    spend = sum(clicks) * CPC
    conv = sum(c * s[1] for c, s in zip(clicks, SLOTS))  # 클릭 x 그 구간 전환율
    print("%s 소진 %.1f%% / 전환 %.1f건 / CPA %d원"
          % (name, spend / BUDGET * 100, conv, spend / conv))

# 출력:
# 5단계 뜻: 세 방식이 예산을 거의 다 쓰지만, 전환율 가중이 전환 49.4건으로 가장 많고 CPA 도 20260원으로 가장 낮다. 균등은 새벽 상한에 걸려 93.3% 만 쓴다.
# (a) 아침 몰아쓰기 소진 100.0% / 전환 34.0건 / CPA 29411원
# (b) 균등 소진 93.3% / 전환 35.6건 / CPA 26217원
# (c) 가중 소진 100.0% / 전환 49.4건 / CPA 20260원
````

#### 블록 2

<!-- cb4 post=auto-bidding-pacing block=1 sha=12dfe17d10638953 -->
````python
# 하는 일: PID 컨트롤러로 하루 예산 1,000달러의 소진 속도를 시간마다 조절하는 과정을 시뮬레이션한다.
import numpy as np

# 1단계: PID 페이싱 함수를 만든다
# 시간마다 목표 소진 속도와 실제 소진의 차이를 오차로 보고, 그 오차로 입찰 배수 λ 를 고친다.
def pid_pacing_simulation(budget=1000, hours=24, Kp=0.04, Ki=0.01, Kd=0.02):
    """PID Controller: 하루 예산 Pacing 시뮬레이션"""
    target_rate = budget / hours
    lam, cum_error, prev_error = 1.0, 0.0, 0.0
    remaining = budget

    for t in range(hours):
        # 트래픽 패턴: 낮 시간대 1.2배, 밤 0.8배
        traffic = 1.2 if 6 <= t <= 14 else 0.8
        noise = np.random.normal(0, 5)
        spend = np.clip(target_rate * lam * traffic + noise, 0, remaining)
        remaining -= spend

        # PID 오차 계산 및 λ 업데이트
        error = target_rate - spend
        cum_error += error
        lam += Kp * error + Ki * cum_error + Kd * (error - prev_error)
        lam = np.clip(lam, 0.1, 1.0)
        prev_error = error

        if t % 6 == 0:
            print(f"  t={t:2d}h  잔여=${remaining:6.0f}  λ={lam:.3f}")

    print(f"  최종 소진율: {(budget - remaining) / budget * 100:.1f}%")

# 2단계: seed 를 고정하고 돌린다
# 6시간마다 잔여 예산과 λ 를 찍는다.
np.random.seed(42)
pid_pacing_simulation()

# 출력:
# 2단계 뜻: 6시에는 λ 가 0.100 까지 떨어지고, 18시에는 1.000 으로 돌아온다. 하루가 끝날 때 소진율은 85.6% 로, 예산을 다 쓰지 못한다.
#   t= 0h  잔여=$   964  λ=1.000
#   t= 6h  잔여=$   732  λ=0.100
#   t=12h  잔여=$   505  λ=0.949
#   t=18h  잔여=$   303  λ=1.000
#   최종 소진율: 85.6%
````

#### 블록 3

<!-- cb4 post=auto-bidding-pacing block=2 sha=f66bfde14bdcb44f -->
````python
# 하는 일: 예산의 그림자 가격 μ 를 라운드마다 고쳐 입찰 배수 λ 를 정하는 Lagrangian Dual 페이싱을 100라운드 돌린다.
import numpy as np

# 1단계: Lagrangian Dual 갱신 함수를 만든다
# μ 는 예산의 shadow price 이고 λ = 1 / (1 + μ) 다. 라운드 지출이 목표를 넘으면 μ 를 올리고, 남으면 내린다.
def lagrangian_dual_update(budget=1000, n_rounds=100, lr=0.05):
    """Lagrangian Dual: μ(shadow price) 업데이트로 λ(pacing) 도출"""
    mu = 0.0  # 예산의 shadow price

    for t in range(1, n_rounds + 1):
        lam = 1.0 / (1.0 + mu)  # μ → λ 변환

        # 이번 라운드의 시뮬레이션된 지출
        n_bids = np.random.randint(80, 120)
        values = np.random.exponential(0.5, n_bids)
        spend = np.sum(values * lam)
        budget_per_round = budget / n_rounds

        # Subgradient: 초과 → μ↑(보수적), 여유 → μ↓(적극적)
        mu = max(0, mu + lr * (spend - budget_per_round))

        if t % 25 == 0:
            print(f"  Round {t:3d}: μ={mu:.3f}, λ={lam:.3f}, "
                  f"지출=${spend:.1f} (목표=${budget_per_round:.1f})")

    print(f"  최종: μ={mu:.3f} → λ={1/(1+mu):.3f}")

# 2단계: seed 를 고정하고 돌린다
# 25라운드마다 μ, λ, 지출을 찍는다.
np.random.seed(42)
lagrangian_dual_update()

# 출력:
# 2단계 뜻: 25라운드마다 찍은 μ 는 3.775 에서 4.164 사이이고, λ 는 0.2 안팎이다. 지출은 목표 $10.0 위아래로 $9.4 에서 $12.3 사이를 오가고, 끝에 λ 는 0.194 다.
#   Round  25: μ=3.933, λ=0.205, 지출=$11.2 (목표=$10.0)
#   Round  50: μ=3.795, λ=0.207, 지출=$9.4 (목표=$10.0)
#   Round  75: μ=3.775, λ=0.215, 지출=$12.3 (목표=$10.0)
#   Round 100: μ=4.164, λ=0.198, 지출=$12.1 (목표=$10.0)
#   최종: μ=4.164 → λ=0.194
````

#### 블록 4

<!-- cb4 post=auto-bidding-pacing block=3 sha=9744e8433e649540 -->
````python
# 하는 일: 같은 하루 트래픽에서 목표 CPA 를 6000원, 5000원, 3000원으로 바꿔, 승률과 예산 소진, 전환, CPA 가 어떻게 달라지는지 견준다.
import math, random

# 1단계: 예산과 시장 값을 둔다
# 예산과 하루 입찰 기회, 전환율 예측과 이겨야 하는 금액의 중앙값이다.
BUDGET, N = 1000000, 40000       # 예산 100만 원, 하루에 들어오는 입찰 기회 4만 건
CVR_MED, MKT_MED = 0.015, 90.0   # 전환율 예측 중앙값 1.5%, 이겨야 하는 금액 중앙값 90원

# 2단계: 하루를 돌리는 함수를 만든다
# 입찰가는 전환확률 x 목표 CPA 이고, 넘기면 이기는 데 드는 금액만 낸다. 예산이 떨어지면 그날은 거기서 끝난다.
def day(target):
    random.seed(42)              # 목표만 바꿔 비교하려면 같은 트래픽을 봐야 한다
    left, wins, conv = BUDGET, 0, 0.0
    for seen in range(1, N + 1):
        pcvr = random.lognormvariate(math.log(CVR_MED), 0.6)
        price = random.lognormvariate(math.log(MKT_MED), 0.5)
        if price < pcvr * target:   # 입찰가 = 전환확률 x 목표 CPA. 넘겼으면 낙찰
            left -= price           # 내는 건 입찰가가 아니라 이기는 데 드는 금액
            wins, conv = wins + 1, conv + pcvr
            if left <= 0:
                break               # 예산 소진 — 하루가 끝나기 전에 문이 닫힌다
    spend = BUDGET - max(left, 0)
    print("목표 %5d원 승률 %4.1f%% 소진 %5.1f%% 전환 %5.1f건 CPA %5d원 소화 %3.0f%%"
          % (target, wins / seen * 100, spend / BUDGET * 100, conv,
             spend / conv, seen / N * 100))

# 3단계: 목표 CPA 셋으로 돌린다
for t in (6000, 5000, 3000):
    day(t)

# 출력:
# 3단계 뜻: 목표를 6000원으로 높게 잡으면 승률 50.4% 로 예산을 다 쓰지만 하루의 65% 만 소화하고 CPA 가 3149원이다. 3000원으로 낮추면 CPA 는 1941원이지만 예산의 46.4% 만 쓰고 전환도 239.1건으로 준다.
# 목표  6000원 승률 50.4% 소진 100.0% 전환 317.5건 CPA  3149원 소화  65%
# 목표  5000원 승률 41.0% 소진 100.0% 전환 357.0건 CPA  2801원 소화  84%
# 목표  3000원 승률 18.8% 소진  46.4% 전환 239.1건 CPA  1941원 소화 100%
````

### 부록 14: exploration-exploitation (블록 3개, Task 4)

#### 블록 1

<!-- cb4 post=exploration-exploitation block=0 sha=0d0597d397ef1e4a -->
````python
# 하는 일: 신규 소재 하나를 검증하는 데 필요한 최소 노출 수와 그 탐색 비용을, 검증하려는 향상폭마다 계산한다.
from statistics import NormalDist

# 1단계: 기준 CTR 과 검정 조건을 둔다
# 표준 라이브러리만 쓴다(statistics.NormalDist 는 3.8+ 표준 라이브러리다).
BASE_CTR = 0.020                  # 지금 쓰고 있는 소재의 CTR (검증 기준선)
CPC = 500                         # 클릭 1회의 가치(원) - 이 절 전체에서 통일해서 쓴다
CONFIDENCE = 0.95                 # 95% 신뢰수준(양측 검정)
POWER = 0.80                      # 80% 검정력
MONTHLY_IMPRESSIONS = 1_000_000   # 이 지면/캠페인의 월간 노출 규모

z_a = NormalDist().inv_cdf(1 - (1 - CONFIDENCE) / 2)   # 신뢰수준 → z값 (약 1.96)
z_b = NormalDist().inv_cdf(POWER)                       # 검정력 → z값 (약 0.84)

# 2단계: 필요 표본 수 공식을 만든다
# 2-표본 비율 검정 공식으로, 두 CTR 차이를 검출하는 데 arm 마다 필요한 노출 수를 구한다.
def required_n(p1, p2):
    """두 CTR(p1, p2) 차이를 통계적으로 검출하는 데 필요한 표본 수(arm당). 2-표본 비율 검정 공식."""
    pooled_var = p1 * (1 - p1) + p2 * (1 - p2)
    return (z_a + z_b) ** 2 * pooled_var / (p2 - p1) ** 2

# 3단계: 향상폭마다 필요 노출과 두 비용을 찍는다
# 탐색비용은 새 소재가 반대로 그만큼 나쁠 때의 손실이고, 기회비용은 진짜 승자를 1년 내내 안 써 봤을 때의 손실이다.
print(f"{'검증 향상폭':>8} {'신규 CTR':>8} {'필요노출/arm':>12} {'탐색비용(최악)':>13} {'미탐색 기회비용/년':>17}")
for lift in [0.10, 0.20, 0.30, 0.50, 1.00, 2.00]:      # 검증하려는 상대 향상폭(10%~200%)
    p2 = BASE_CTR * (1 + lift)
    n = required_n(BASE_CTR, p2)
    delta = p2 - BASE_CTR
    explore_cost = n * delta * CPC                             # 새 소재가 반대로 그만큼 나쁠 때의 손실
    yearly_opportunity_cost = delta * MONTHLY_IMPRESSIONS * 12 * CPC   # 진짜 승자인데 평생 안 써봤을 때
    print(f"{lift:>7.0%} {p2:>7.1%} {n:>12,.0f} {explore_cost:>12,.0f}원 {yearly_opportunity_cost:>16,.0f}원")

# 출력:
# 3단계 뜻: 10% 향상을 검증하려면 arm 마다 80,679회가 들지만, 200% 향상은 373회면 된다. 최악의 탐색비용은 많아야 80,679원인데, 진짜 승자를 안 써 보면 1년에 12,000,000원에서 240,000,000원을 놓친다.
#   검증 향상폭   신규 CTR     필요노출/arm      탐색비용(최악)        미탐색 기회비용/년
#     10%    2.2%       80,679       80,679원       12,000,000원
#     20%    2.4%       21,106       42,211원       24,000,000원
#     30%    2.6%        9,795       29,384원       36,000,000원
#     50%    3.0%        3,822       19,112원       60,000,000원
#    100%    4.0%        1,138       11,381원      120,000,000원
#    200%    6.0%          373        7,456원      240,000,000원
````

#### 블록 2

<!-- cb4 post=exploration-exploitation block=1 sha=7e03dc10b423422c -->
````python
# 하는 일: 탐색 비율(엡실론) 0%, 5%, 20%, 50% 를 같은 조건에서 돌려, 평균 수익과 진짜 좋은 소재를 찾아낼 확률을 견준다.
import random

# 1단계: 소재 5개와 실험 조건을 둔다
# 숨은 1등 D 를 찾아내는지 본다.
CPC = 500                 # 클릭 1회의 가치(원) - 위 표와 같은 단위
TRUE_CTR = {"A": 0.020, "B": 0.021, "C": 0.018, "D": 0.032, "E": 0.015}  # D가 숨은 1등
ARMS = list(TRUE_CTR)
BEST = max(ARMS, key=lambda a: TRUE_CTR[a])
T = 3000                  # 소재 1세트가 서비스되는 동안의 노출 수
REPEATS = 300              # 같은 실험을 300번 반복해 '확률'을 추정한다

# 2단계: ε-greedy 한 번을 돌리는 함수를 만든다
# 처음엔 소재를 하나씩 돌아가며 찔러 보고, 그 뒤엔 ε 확률로 무작위 탐색을, 나머지는 지금까지의 1등을 쓴다.
def run_once(epsilon, rng):
    counts = {a: 0 for a in ARMS}
    sums = {a: 0 for a in ARMS}
    clicks = 0
    for t in range(T):
        unseen = [a for a in ARMS if counts[a] == 0]
        if unseen:
            arm = unseen[0]                                     # 처음엔 하나씩 돌아가며 찔러본다
        elif rng.random() < epsilon:
            arm = rng.choice(ARMS)                               # 탐색: 무작위 소재
        else:
            arm = max(ARMS, key=lambda a: sums[a] / counts[a])   # 활용: 지금까지 1등
        reward = 1 if rng.random() < TRUE_CTR[arm] else 0
        counts[arm] += 1
        sums[arm] += reward
        clicks += reward
    believed_best = max(ARMS, key=lambda a: sums[a] / counts[a] if counts[a] else 0)
    return clicks, believed_best == BEST

# 3단계: 탐색 비율마다 300번 반복한다
master = random.Random(7)
print(f"진짜 1등: {BEST} (CTR {TRUE_CTR[BEST]:.1%}), 노출 {T:,}회 x {REPEATS}회 반복 평균\n")
print(f"{'탐색비율':>8} {'평균수익':>12} {'좋은 소재 발견확률':>18}")
for epsilon in [0.0, 0.05, 0.2, 0.5]:
    total_clicks = 0
    found = 0
    for _ in range(REPEATS):
        rng = random.Random(master.randrange(10**9))
        clicks, ok = run_once(epsilon, rng)
        total_clicks += clicks
        found += ok
    avg_revenue = total_clicks / REPEATS * CPC
    print(f"{epsilon:>7.0%} {avg_revenue:>11,.0f}원 {found/REPEATS:>17.1%}")

# 출력:
# 3단계 뜻: 탐색을 안 하면 숨은 1등 D 를 2.3% 만 찾고 평균 수익도 30,085원으로 가장 낮다. 20% 탐색이 37,303원으로 수익이 가장 크고, 50% 는 D 를 80.0% 찾지만 수익은 36,415원으로 조금 준다.
# 진짜 1등: D (CTR 3.2%), 노출 3,000회 x 300회 반복 평균
#
#     탐색비율         평균수익         좋은 소재 발견확률
#      0%      30,085원              2.3%
#      5%      33,865원             40.7%
#     20%      37,303원             74.3%
#     50%      36,415원             80.0%
````

#### 블록 3

<!-- cb4 post=exploration-exploitation block=2 sha=06342ad675ac2451 -->
````python
# 하는 일: 소재 수, 트래픽 규모, 소재 수명을 하나씩 바꿔 가며, 후보 탐색 비율 가운데 평균 수익을 가장 크게 하는 값을 찾는다.
import random

# 1단계: 후보 탐색 비율을 둔다
# 최적 탐색 비율은 고정된 값이 아니라 상황에 따라 달라진다.
CPC = 500
CANDIDATES = [0.0, 0.05, 0.1, 0.2, 0.35, 0.5]   # 후보 탐색 비율
REPEATS = 60

# 2단계: 한 번 돌리는 함수를 만든다
# 소재 k 개 가운데 하나만 CTR 이 50% 높은 숨은 1등이고, 수명이 있으면 그 주기마다 1등이 바뀐다.
def run_once(rng, k, t_total, epsilon, lifetime):
    ctr = [0.02] * k
    ctr[rng.randrange(k)] = 0.03            # k개 중 1개만 CTR 50% 높은 '숨은 1등'
    counts = [0] * k
    sums = [0.0] * k
    clicks = 0
    for t in range(t_total):
        if lifetime and t > 0 and t % lifetime == 0:
            ctr = [0.02] * k                # 소재 수명 만료 - 승자가 다른 소재로 바뀐다(비정상성)
            ctr[rng.randrange(k)] = 0.03
        if 0 in counts:
            arm = counts.index(0)
        elif rng.random() < epsilon:
            arm = rng.randrange(k)
        else:
            means = [sums[i] / counts[i] for i in range(k)]
            arm = means.index(max(means))
        reward = 1 if rng.random() < ctr[arm] else 0
        counts[arm] += 1
        sums[arm] += reward
        clicks += reward
    return clicks * CPC

# 3단계: 후보마다 60번 돌려 최적값을 고른다
def best_epsilon(k, t_total, lifetime, seed):
    master = random.Random(seed)
    scored = []
    for epsilon in CANDIDATES:
        total = 0.0
        for _ in range(REPEATS):
            rng = random.Random(master.randrange(10**9))
            total += run_once(rng, k, t_total, epsilon, lifetime)
        scored.append((epsilon, total / REPEATS))
    return max(scored, key=lambda x: x[1]), scored

# 4단계: 상황 여섯 가지에서 찾는다
scenarios = [
    ("소재 3개",                 dict(k=3,  t_total=3000,  lifetime=None), 1),
    ("소재 20개",                dict(k=20, t_total=3000,  lifetime=None), 2),
    ("트래픽 소규모(500회)",       dict(k=5,  t_total=500,   lifetime=None), 3),
    ("트래픽 대규모(20,000회)",    dict(k=5,  t_total=20000, lifetime=None), 4),
    ("소재 수명 김(사실상 무한)",   dict(k=5,  t_total=3000,  lifetime=None), 5),
    ("소재 수명 짧음(300회마다 교체)", dict(k=5, t_total=3000, lifetime=300), 6),
]

print(f"{'상황':<24} {'최적 탐색비율':>10} {'그 수익':>12}   {'0% 탐색 대비'}")
for name, params, seed in scenarios:
    (best_eps, best_rev), scored = best_epsilon(seed=seed, **params)
    zero_rev = dict(scored)[0.0]
    lift = (best_rev - zero_rev) / zero_rev
    print(f"{name:<24} {best_eps:>9.0%} {best_rev:>11,.0f}원   {lift:+.0%}")

# 출력:
# 4단계 뜻: 트래픽이 20,000회로 크면 10% 탐색으로 수익이 22% 늘고, 500회로 작으면 최적인 50% 도 2% 만 는다. 소재가 3개면 20%, 20개면 10% 가 최적이라, 최적 탐색 비율은 상황마다 다르다.
# 상황                          최적 탐색비율         그 수익   0% 탐색 대비
# 소재 3개                          20%      40,658원   +14%
# 소재 20개                         10%      33,283원   +10%
# 트래픽 소규모(500회)                  50%       5,675원   +2%
# 트래픽 대규모(20,000회)               10%     266,875원   +22%
# 소재 수명 김(사실상 무한)                 5%      35,808원   +11%
# 소재 수명 짧음(300회마다 교체)            20%      33,817원   +3%
````

### 부록 15: mab (블록 1개, Task 4)

#### 블록 1

<!-- cb4 post=mab block=0 sha=855e3b66598d422a -->
````python
# 하는 일: 광고 소재 5개에 다섯 가지 배정 방법을 같은 1,000회씩 붙여, 총 클릭 수, 누적 후회, 최적 소재 선택률을 견준다.
import random
import math

random.seed(19)  # 재현 가능하도록 고정 — 위 표의 숫자가 이 시드에서 나온 값이다

# 1단계: 소재 5개의 진짜 CTR 을 둔다
# 진짜 CTR 은 이렇게 정해 두지만, 알고리즘은 이 값을 모른 채 시작한다.
TRUE_CTR = {"소재1": 0.03, "소재2": 0.15, "소재3": 0.08, "소재4": 0.01, "소재5": 0.05}
ARMS = list(TRUE_CTR)
BEST = max(ARMS, key=lambda a: TRUE_CTR[a])   # 소재2 — 우리는 이걸 모르는 채로 실험을 시작한다
BEST_CTR = TRUE_CTR[BEST]
ROUNDS = 1000

# 2단계: 공통 실행 루프를 만든다
# 전략마다 다른 건 고르는 법과 기록 갱신법뿐이다. 누적 후회는 최적 소재를 알았다면 얻었을 CTR 과의 차이를 더한 값이다.
def simulate(select_arm, update):
    """공통 실행 루프. 전략마다 다른 건 '고르는 법'과 '기록 갱신법'뿐이다."""
    clicks = regret = optimal = 0
    for t in range(1, ROUNDS + 1):
        arm = select_arm(t)
        reward = 1 if random.random() < TRUE_CTR[arm] else 0
        update(arm, reward)
        clicks += reward
        regret += BEST_CTR - TRUE_CTR[arm]        # 최적을 알았다면 얻었을 CTR과의 차이를 누적
        optimal += (arm == BEST)
    return clicks, regret, optimal / ROUNDS * 100

# 3단계: 다섯 가지 배정 방법을 만든다
# 균등분배, 그리디, 그리고 밴딧 셋(ε-greedy, UCB1, 톰슨 샘플링)이다.
def uniform_strategy():                            # 균등분배: 5개를 순서대로 그대로 반복
    return (lambda t: ARMS[t % len(ARMS)]), (lambda arm, r: None)

def greedy_strategy(explore=100):                   # 그리디: 첫 100회만 골고루, 이후 900회는 1등 고정
    counts = {a: 0 for a in ARMS}
    sums = {a: 0 for a in ARMS}
    def select(t):
        if t <= explore:
            return ARMS[t % len(ARMS)]
        return max(ARMS, key=lambda a: sums[a] / counts[a] if counts[a] else 0)
    def update(arm, r):
        counts[arm] += 1
        sums[arm] += r
    return select, update

def epsilon_greedy_strategy(epsilon=0.1):           # 밴딧: 10% 확률로 무작위, 90%는 지금까지 1등
    counts = {a: 0 for a in ARMS}
    sums = {a: 0 for a in ARMS}
    def select(t):
        unseen = [a for a in ARMS if counts[a] == 0]
        if unseen:
            return unseen[0]
        if random.random() < epsilon:
            return random.choice(ARMS)
        return max(ARMS, key=lambda a: sums[a] / counts[a])
    def update(arm, r):
        counts[arm] += 1
        sums[arm] += r
    return select, update

def ucb1_strategy():                                # 밴딧: 관측 평균 + 탐색 보너스가 가장 큰 소재
    counts = {a: 0 for a in ARMS}
    sums = {a: 0 for a in ARMS}
    def select(t):
        unseen = [a for a in ARMS if counts[a] == 0]
        if unseen:
            return unseen[0]
        return max(ARMS, key=lambda a: sums[a] / counts[a] + math.sqrt(2 * math.log(t) / counts[a]))
    def update(arm, r):
        counts[arm] += 1
        sums[arm] += r
    return select, update

def thompson_strategy():                            # 밴딧: 베타 분포에서 뽑은 표본이 가장 큰 소재
    alpha = {a: 1 for a in ARMS}
    beta = {a: 1 for a in ARMS}
    def select(t):
        samples = {a: random.betavariate(alpha[a], beta[a]) for a in ARMS}
        return max(samples, key=lambda a: samples[a])
    def update(arm, r):
        if r:
            alpha[arm] += 1
        else:
            beta[arm] += 1
    return select, update

# 4단계: 같은 1,000회로 다섯 방법을 돌린다
strategies = {
    "균등분배":                 uniform_strategy(),
    "그리디(100회 탐색 후 고정)":   greedy_strategy(),
    "밴딧: ε-greedy":           epsilon_greedy_strategy(),
    "밴딧: UCB1":               ucb1_strategy(),
    "밴딧: 톰슨 샘플링":           thompson_strategy(),
}

print(f"실제 최적 소재: {BEST} ({BEST_CTR:.0%})")
print()
for name, (select, update) in strategies.items():
    clicks, regret, optimal_pct = simulate(select, update)
    print(f"{name:<22} 총 클릭 {clicks:3d}회   누적후회 {regret:5.1f}   최적소재 선택률 {optimal_pct:4.1f}%")

# 출력:
# 4단계 뜻: 진짜 최적은 CTR 15% 인 소재2 다. 톰슨 샘플링이 클릭 144회에 누적후회 19.3 으로 가장 낫고, 최적 소재를 80.8% 고른다. 100회 뒤로 탐색을 멈춘 그리디는 37회로 균등분배의 60회보다도 못하다.
# 실제 최적 소재: 소재2 (15%)
#
# 균등분배                   총 클릭  60회   누적후회  86.0   최적소재 선택률 20.0%
# 그리디(100회 탐색 후 고정)      총 클릭  37회   누적후회  99.2   최적소재 선택률  3.1%
# 밴딧: ε-greedy           총 클릭  81회   누적후회  60.5   최적소재 선택률 49.1%
# 밴딧: UCB1               총 클릭  96회   누적후회  59.8   최적소재 선택률 41.6%
# 밴딧: 톰슨 샘플링             총 클릭 144회   누적후회  19.3   최적소재 선택률 80.8%
````

### 부록 16: ab-test-vs-mab (블록 2개, Task 4)

#### 블록 1

<!-- cb4 post=ab-test-vs-mab block=0 sha=457402731ebc1567 -->
````python
# 하는 일: 진짜 CTR 2.0% 인 소재 A 와 3.0% 인 B 에 노출 10만 건을 A/B 와 밴딧으로 각각 태워, 총 클릭과 후회, 소재별 추정치와 95% 신뢰구간을 견준다.
import random, math

# 1단계: 노출 수와 진짜 CTR 을 둔다
# 표준 라이브러리만 쓴다.
N = 100_000
TRUE_CTR = {"A": 0.02, "B": 0.03}   # 우리는 이 값을 모른 채 실험을 시작한다
BEST_CTR = max(TRUE_CTR.values())

# 2단계: A/B, 밴딧, 신뢰구간 함수를 만든다
# A/B 는 끝까지 50:50 으로 고정하고, 밴딧(톰슨 샘플링)은 매번 베타 분포 표본이 큰 쪽에 배정한다.
def run_ab(n, true_ctr, seed):
    """A/B 테스트: 끝까지 50:50 고정 배정."""
    rng = random.Random(seed)
    imps = {"A": 0, "B": 0}
    clicks = {"A": 0, "B": 0}
    for i in range(n):
        arm = "A" if i % 2 == 0 else "B"
        imps[arm] += 1
        clicks[arm] += rng.random() < true_ctr[arm]
    return imps, clicks

def run_bandit(n, true_ctr, seed):
    """밴딧(톰슨 샘플링): 매번 베타 분포에서 표본을 뽑아 큰 쪽에 배정."""
    rng = random.Random(seed)
    alpha = {"A": 1, "B": 1}
    beta = {"A": 1, "B": 1}
    imps = {"A": 0, "B": 0}
    clicks = {"A": 0, "B": 0}
    for _ in range(n):
        sample = {a: rng.betavariate(alpha[a], beta[a]) for a in true_ctr}
        arm = max(sample, key=sample.get)
        imps[arm] += 1
        if rng.random() < true_ctr[arm]:
            clicks[arm] += 1
            alpha[arm] += 1
        else:
            beta[arm] += 1
    return imps, clicks

def ci95(clicks, imps):
    """관측 CTR과 95% 신뢰구간 절반폭(정규근사, 퍼센트포인트)."""
    p = clicks / imps
    return p, 1.96 * math.sqrt(p * (1 - p) / imps) * 100

# 3단계: 같은 seed 로 두 실험을 돌린다
SEED = 3   # A/B와 밴딧 모두 같은 시드로 돌려 공정하게 비교한다
imps_ab, clicks_ab = run_ab(N, TRUE_CTR, SEED)
imps_bd, clicks_bd = run_bandit(N, TRUE_CTR, SEED)

total_ab, total_bd = sum(clicks_ab.values()), sum(clicks_bd.values())
best_possible = N * BEST_CTR

# 4단계: 총 클릭과 후회를 찍는다
print(f"이론상 최선(전부 B에게 몰아줬을 때 기대 클릭): {best_possible:,.0f}")
print(f"A/B   총 클릭 {total_ab:,}   후회 {best_possible - total_ab:6.1f}")
print(f"밴딧  총 클릭 {total_bd:,}   후회 {best_possible - total_bd:6.1f}")
print()

# 5단계: 소재별 추정치와 신뢰구간을 찍는다
for label, imps, clicks in [("A/B", imps_ab, clicks_ab), ("밴딧", imps_bd, clicks_bd)]:
    for arm in ("A", "B"):
        p_hat, half_width = ci95(clicks[arm], imps[arm])
        print(f"  [{label}] 소재{arm}: n={imps[arm]:6,}   관측CTR={p_hat*100:5.2f}%   95%CI=±{half_width:.3f}pp")

# 출력:
# 4단계 뜻: 전부 B 에 몰아줬다면 클릭 3,000 을 기대한다. 밴딧은 2,980 으로 후회가 20.0 뿐이고, 끝까지 반반 나눈 A/B 는 후회가 479.0 이다.
# 이론상 최선(전부 B에게 몰아줬을 때 기대 클릭): 3,000
# A/B   총 클릭 2,521   후회  479.0
# 밴딧  총 클릭 2,980   후회   20.0
#
# 5단계 뜻: A/B 는 두 소재를 50,000건씩 봐서 신뢰구간이 ±0.124pp 와 ±0.149pp 다. 밴딧은 A 를 4,171건만 봐서 A 의 신뢰구간이 ±0.453pp 로 넓다.
#   [A/B] 소재A: n=50,000   관측CTR= 2.06%   95%CI=±0.124pp
#   [A/B] 소재B: n=50,000   관측CTR= 2.99%   95%CI=±0.149pp
#   [밴딧] 소재A: n= 4,171   관측CTR= 2.28%   95%CI=±0.453pp
#   [밴딧] 소재B: n=95,829   관측CTR= 3.01%   95%CI=±0.108pp
````

#### 블록 2

<!-- cb4 post=ab-test-vs-mab block=1 sha=32d4af5544521034 -->
````python
# 하는 일: 진짜 차이가 0.1%p 로 작을 때(A 2.0%, B 2.1%) 같은 비교를 다시 돌려 밴딧이 어떻게 되는지 본다.
import random, math

# 1단계: 노출 수와 진짜 CTR 을 둔다
# 이번에는 B 가 0.1%p 만 높다.
N = 100_000
TRUE_CTR = {"A": 0.02, "B": 0.021}   # 이번엔 차이가 0.1%p뿐이다
BEST_CTR = max(TRUE_CTR.values())

# 2단계: 앞 블록과 같은 함수를 둔다
# 함수는 위 코드와 같고, TRUE_CTR 과 시드만 바꿔 같은 비교를 반복한다.
def run_ab(n, true_ctr, seed):
    rng = random.Random(seed)
    imps = {"A": 0, "B": 0}
    clicks = {"A": 0, "B": 0}
    for i in range(n):
        arm = "A" if i % 2 == 0 else "B"
        imps[arm] += 1
        clicks[arm] += rng.random() < true_ctr[arm]
    return imps, clicks

def run_bandit(n, true_ctr, seed):
    rng = random.Random(seed)
    alpha = {"A": 1, "B": 1}
    beta = {"A": 1, "B": 1}
    imps = {"A": 0, "B": 0}
    clicks = {"A": 0, "B": 0}
    for _ in range(n):
        sample = {a: rng.betavariate(alpha[a], beta[a]) for a in true_ctr}
        arm = max(sample, key=sample.get)
        imps[arm] += 1
        if rng.random() < true_ctr[arm]:
            clicks[arm] += 1
            alpha[arm] += 1
        else:
            beta[arm] += 1
    return imps, clicks

def ci95(clicks, imps):
    p = clicks / imps
    return p, 1.96 * math.sqrt(p * (1 - p) / imps) * 100

# 3단계: seed 2 로 두 실험을 돌린다
SEED = 2
imps_ab, clicks_ab = run_ab(N, TRUE_CTR, SEED)
imps_bd, clicks_bd = run_bandit(N, TRUE_CTR, SEED)

total_ab, total_bd = sum(clicks_ab.values()), sum(clicks_bd.values())
best_possible = N * BEST_CTR

# 4단계: 총 클릭과 후회, 밴딧의 배분을 찍는다
print(f"이론상 최선(전부 B에게 몰아줬을 때 기대 클릭): {best_possible:,.0f}")
print(f"A/B   총 클릭 {total_ab:,}   후회 {best_possible - total_ab:6.1f}")
print(f"밴딧  총 클릭 {total_bd:,}   후회 {best_possible - total_bd:6.1f}")
print()
print(f"밴딧 최종 트래픽 배분 — 소재A(열세) {imps_bd['A']:,} : 소재B(우세) {imps_bd['B']:,}")
print()

# 5단계: 소재별 추정치와 신뢰구간을 찍는다
for label, imps, clicks in [("A/B", imps_ab, clicks_ab), ("밴딧", imps_bd, clicks_bd)]:
    for arm in ("A", "B"):
        p_hat, half_width = ci95(clicks[arm], imps[arm])
        print(f"  [{label}] 소재{arm}: n={imps[arm]:6,}   관측CTR={p_hat*100:5.2f}%   95%CI=±{half_width:.3f}pp")

# 출력:
# 4단계 뜻: 차이가 작으면 밴딧이 열세인 A 에 94,014건을 몰아줘, 후회가 78.0 으로 A/B 의 15.0 보다 크다.
# 이론상 최선(전부 B에게 몰아줬을 때 기대 클릭): 2,100
# A/B   총 클릭 2,085   후회   15.0
# 밴딧  총 클릭 2,022   후회   78.0
#
# 밴딧 최종 트래픽 배분 — 소재A(열세) 94,014 : 소재B(우세) 5,986
#
# 5단계 뜻: A/B 로는 B 가 2.12% 로 A 의 2.05% 보다 높게 나오지만, 밴딧은 B 를 5,986건만 봐서 1.85% 로 낮게 본다.
#   [A/B] 소재A: n=50,000   관측CTR= 2.05%   95%CI=±0.124pp
#   [A/B] 소재B: n=50,000   관측CTR= 2.12%   95%CI=±0.126pp
#   [밴딧] 소재A: n=94,014   관측CTR= 2.03%   95%CI=±0.090pp
#   [밴딧] 소재B: n= 5,986   관측CTR= 1.85%   95%CI=±0.342pp
````

### 부록 17: ucb_ts (블록 2개, Task 5)

#### 블록 1

<!-- cb4 post=ucb_ts block=0 sha=86d9efa84217cf10 -->
````python
# 하는 일: 같은 누적 기록표로 UCB1 을 세 번 계산하고 톰슨 샘플링을 100번 뽑아, UCB1 은 늘 같은 소재를 고르고 톰슨은 고르는 소재가 흔들린다는 것을 본다.
import random
import math

random.seed(7)  # 재현 가능하도록 고정

# 1단계: 소재 4개의 누적 기록을 둔다
# 소재 4개의 누적 기록 (지금까지의 노출, 클릭) — 1절의 표
data = {
    "A": {"impressions": 1000, "clicks": 50},
    "B": {"impressions": 1000, "clicks": 30},
    "C": {"impressions": 500,  "clicks": 30},
    "D": {"impressions": 150,  "clicks": 9},
}
t = sum(d["impressions"] for d in data.values())  # 전체 노출 수 = 2,650

# 2단계: UCB1 점수 함수를 만든다
# 점수는 관측 평균에 탐색 보너스 sqrt(2 ln t / 노출)을 더한 값이다.
def ucb1_score(clicks, impressions, t):
    mean = clicks / impressions
    bonus = math.sqrt(2 * math.log(t) / impressions)
    return mean, bonus, mean + bonus

# 3단계: UCB1 을 세 번 계산한다
# 몇 번을 다시 계산해도 같은 소재가 1등인지 본다.
print("=== UCB1: 반복 계산 ===")
for trial in range(3):
    scores = {name: ucb1_score(d["clicks"], d["impressions"], t) for name, d in data.items()}
    winner = max(scores, key=lambda k: scores[k][2])
    print(f"  {trial+1}번째 계산 -> 1등: 소재 {winner}")

for name, d in data.items():
    mean, bonus, score = ucb1_score(d["clicks"], d["impressions"], t)
    print(f"  소재 {name}: 평균 {mean:.4f} + 보너스 {bonus:.4f} = {score:.4f}")

# 4단계: 톰슨 샘플링으로 100번 뽑는다
# 같은 표에서 소재마다 베타 분포 표본을 뽑아, 1등이 된 횟수를 센다.
print()
print("=== 톰슨 샘플링: 100회 반복 ===")
win_count = {name: 0 for name in data}
for _ in range(100):
    samples = {
        name: random.betavariate(d["clicks"] + 1, d["impressions"] - d["clicks"] + 1)
        for name, d in data.items()
    }
    winner = max(samples, key=lambda k: samples[k])
    win_count[winner] += 1

for name in data:
    print(f"  소재 {name}: {win_count[name]:3d}/100회 선택 ({win_count[name]}%)")

# 출력:
# 3단계 뜻: UCB1 은 세 번 다 D 를 고른다. D 는 평균이 C 와 같은 0.0600 이지만 보너스가 0.3242 로 가장 커서, 점수 0.3842 로 앞선다.
# === UCB1: 반복 계산 ===
#   1번째 계산 -> 1등: 소재 D
#   2번째 계산 -> 1등: 소재 D
#   3번째 계산 -> 1등: 소재 D
#   소재 A: 평균 0.0500 + 보너스 0.1256 = 0.1756
#   소재 B: 평균 0.0300 + 보너스 0.1256 = 0.1556
#   소재 C: 평균 0.0600 + 보너스 0.1776 = 0.2376
#   소재 D: 평균 0.0600 + 보너스 0.3242 = 0.3842
# 4단계 뜻: 톰슨 샘플링은 같은 표에서도 D 를 50회, C 를 41회, A 를 9회 고른다. 기록이 적은 소재일수록 표본이 넓게 퍼져 가끔 1등이 된다.
#
# === 톰슨 샘플링: 100회 반복 ===
#   소재 A:   9/100회 선택 (9%)
#   소재 B:   0/100회 선택 (0%)
#   소재 C:  41/100회 선택 (41%)
#   소재 D:  50/100회 선택 (50%)
````

#### 블록 2

<!-- cb4 post=ucb_ts block=1 sha=2b1e2c484c781bcb -->
````python
# 하는 일: 진짜 CTR 을 정해 둔 소재 4개에서 UCB1 과 톰슨 샘플링을 1,000회씩 돌려, 누적 후회와 소재별 선택 횟수를 견준다.
import random
import math

random.seed(42)

# 1단계: 소재 4개의 진짜 CTR 을 둔다
# 데모(demo-compare-bandits.html)와 같은 '진짜' CTR — 알고리즘은 이 값을 모른다
TRUE_CTR = {"A": 0.18, "B": 0.10, "C": 0.06, "D": 0.02}
BEST_CTR = max(TRUE_CTR.values())
ARMS = list(TRUE_CTR.keys())
ROUNDS = 1000

# 2단계: UCB1 과 톰슨 샘플링을 함수로 만든다
# 둘 다 매회 소재 하나를 고르고, 누적 후회에 진짜 1등과의 CTR 차이를 더한다.
def run_ucb1():
    counts = {a: 0 for a in ARMS}
    sums = {a: 0 for a in ARMS}
    regret = 0.0
    for t in range(1, ROUNDS + 1):
        unseen = [a for a in ARMS if counts[a] == 0]
        arm = unseen[0] if unseen else max(   # 초기 라운드엔 한 번씩 먼저 본다
            ARMS,
            key=lambda a: sums[a] / counts[a] + math.sqrt(2 * math.log(t) / counts[a])
        )
        reward = 1 if random.random() < TRUE_CTR[arm] else 0
        counts[arm] += 1
        sums[arm] += reward
        regret += BEST_CTR - TRUE_CTR[arm]
    return regret, counts

def run_thompson():
    alpha = {a: 1 for a in ARMS}
    beta = {a: 1 for a in ARMS}
    regret = 0.0
    for t in range(1, ROUNDS + 1):
        samples = {a: random.betavariate(alpha[a], beta[a]) for a in ARMS}
        arm = max(samples, key=lambda k: samples[k])
        reward = 1 if random.random() < TRUE_CTR[arm] else 0
        if reward:
            alpha[arm] += 1
        else:
            beta[arm] += 1
        regret += BEST_CTR - TRUE_CTR[arm]
    return regret, {a: alpha[a] + beta[a] - 2 for a in ARMS}

# 3단계: 두 방식을 돌려 찍는다
ucb_regret, ucb_counts = run_ucb1()
ts_regret, ts_counts = run_thompson()

print(f"1,000회 후 누적 후회 — UCB1: {ucb_regret:.2f}, 톰슨 샘플링: {ts_regret:.2f}")
print(f"UCB1 소재별 선택 횟수: {ucb_counts}")
print(f"톰슨 샘플링 소재별 선택 횟수: {ts_counts}")

# 출력:
# 3단계 뜻: 1,000회 뒤 누적 후회는 UCB1 이 59.96, 톰슨 샘플링이 16.24 다. 톰슨은 A 를 837회 골라 1등에 일찍 몰아주고, UCB1 은 A 를 476회만 고르며 다른 소재도 꾸준히 확인한다.
# 1,000회 후 누적 후회 — UCB1: 59.96, 톰슨 샘플링: 16.24
# UCB1 소재별 선택 횟수: {'A': 476, 'B': 218, 'C': 161, 'D': 145}
# 톰슨 샘플링 소재별 선택 횟수: {'A': 837, 'B': 111, 'C': 24, 'D': 28}
````

### 부록 18: TS-linTS (블록 2개, Task 5)

#### 블록 1

<!-- cb4 post=TS-linTS block=0 sha=735e11d1c1c89b4f -->
````python
# 하는 일: 기본 톰슨 샘플링을 돌리며, 노출이 쌓일수록 선택이 진짜 1등 소재로 모이는 과정을 노출 10, 50, 200, 1000회에서 센다.
import random

random.seed(9)

# 1단계: 소재 3개의 진짜 CTR 과 멈출 시점을 둔다
# 멈출 시점은 2절 표와 같은 노출 구간이다.
TRUE_CTR = {"소재1": 0.04, "소재2": 0.06, "소재3": 0.11}  # 알고리즘은 모르는 진짜 값
ARMS = list(TRUE_CTR)
CHECKPOINTS = [10, 50, 200, 1000]

# 2단계: 톰슨 샘플링을 돌리며 시점마다 선택 비율을 찍는다
# 매회 소재마다 베타 분포에서 표본을 뽑아 가장 큰 소재를 고르고, 클릭이면 α 를, 아니면 β 를 1 올린다.
alpha = {a: 1 for a in ARMS}   # 사전분포 Beta(1,1) — 아무 정보 없음
beta = {a: 1 for a in ARMS}
choice_count = {a: 0 for a in ARMS}

t = 0
for checkpoint in CHECKPOINTS:
    while t < checkpoint:
        samples = {a: random.betavariate(alpha[a], beta[a]) for a in ARMS}
        arm = max(samples, key=lambda a: samples[a])
        reward = 1 if random.random() < TRUE_CTR[arm] else 0
        if reward:
            alpha[arm] += 1
        else:
            beta[arm] += 1
        choice_count[arm] += 1
        t += 1
    total = sum(choice_count.values())
    dist = "  ".join(f"{a} {choice_count[a] / total:5.1%}" for a in ARMS)
    print(f"노출 {checkpoint:5d}회 누적 -> 이 시점까지 선택 비율: {dist}")

# 3단계: 최종 사후분포를 찍는다
print()
print("최종 사후분포:")
for a in ARMS:
    post_mean = alpha[a] / (alpha[a] + beta[a])
    print(f"  {a}: Beta({alpha[a]},{beta[a]})  사후평균 {post_mean:.1%}  (진짜 CTR {TRUE_CTR[a]:.0%})")

# 출력:
# 2단계 뜻: 처음 10회에는 소재3 을 20.0% 만 고르지만, 1000회까지 쌓이면 84.6% 를 소재3 에 몰아준다.
# 노출    10회 누적 -> 이 시점까지 선택 비율: 소재1 40.0%  소재2 40.0%  소재3 20.0%
# 노출    50회 누적 -> 이 시점까지 선택 비율: 소재1 18.0%  소재2 26.0%  소재3 56.0%
# 노출   200회 누적 -> 이 시점까지 선택 비율: 소재1 11.0%  소재2 19.0%  소재3 70.0%
# 노출  1000회 누적 -> 이 시점까지 선택 비율: 소재1  6.7%  소재2  8.7%  소재3 84.6%
# 3단계 뜻: 가장 많이 고른 소재3 은 사후평균 12.3% 로 진짜 CTR 11% 에 가깝다. 적게 고른 소재1 과 소재2 는 사후평균이 5.8% 와 5.6% 로, 진짜 CTR 4%, 6% 와 순서가 뒤바뀌어 있다.
#
# 최종 사후분포:
#   소재1: Beta(4,65)  사후평균 5.8%  (진짜 CTR 4%)
#   소재2: Beta(5,84)  사후평균 5.6%  (진짜 CTR 6%)
#   소재3: Beta(104,744)  사후평균 12.3%  (진짜 CTR 11%)
````

#### 블록 2

<!-- cb4 post=TS-linTS block=1 sha=76f2a80349c02e26 -->
````python
# 하는 일: 기본 톰슨(컨텍스트 무시)과 컨텍스트별 톰슨(Linear TS 의 가장 단순한 형태)을 3,000회씩 돌려 누적 클릭을 견준다.
import random

# 1단계: 조합 5개의 진짜 CTR 을 둔다
# 5절 표의 지면×연령대 5개 조합과 소재 A, B 의 진짜 CTR 을 그대로 쓴다.
TRUE_CTR = {
    "피드/20대":     {"A": 0.09, "B": 0.03},
    "피드/30대":     {"A": 0.06, "B": 0.04},
    "피드/40대":     {"A": 0.02, "B": 0.07},
    "검색결과/20대": {"A": 0.04, "B": 0.05},
    "검색결과/40대": {"A": 0.01, "B": 0.08},
}
CONTEXTS = list(TRUE_CTR)
ARMS = ["A", "B"]
ROUNDS = 3000


# 2단계: 두 톰슨을 함수로 만든다
# 기본 톰슨은 소재별 사후분포를 하나씩만, 컨텍스트별 톰슨은 조합마다 따로 학습한다.
def basic_ts():
    """컨텍스트를 무시하고 소재별로 베타 사후분포 하나씩만 학습"""
    alpha = {a: 1 for a in ARMS}
    beta = {a: 1 for a in ARMS}
    total_reward = 0
    for _ in range(ROUNDS):
        ctx = random.choice(CONTEXTS)
        samples = {a: random.betavariate(alpha[a], beta[a]) for a in ARMS}
        arm = max(samples, key=lambda a: samples[a])
        reward = 1 if random.random() < TRUE_CTR[ctx][arm] else 0
        if reward:
            alpha[arm] += 1
        else:
            beta[arm] += 1
        total_reward += reward
    return total_reward


def contextual_ts():
    """조합(지면×연령대)마다 독립된 베타 사후분포를 따로 학습"""
    alpha = {(c, a): 1 for c in CONTEXTS for a in ARMS}
    beta = {(c, a): 1 for c in CONTEXTS for a in ARMS}
    total_reward = 0
    for _ in range(ROUNDS):
        ctx = random.choice(CONTEXTS)
        samples = {a: random.betavariate(alpha[(ctx, a)], beta[(ctx, a)]) for a in ARMS}
        arm = max(samples, key=lambda a: samples[a])
        reward = 1 if random.random() < TRUE_CTR[ctx][arm] else 0
        if reward:
            alpha[(ctx, arm)] += 1
        else:
            beta[(ctx, arm)] += 1
        total_reward += reward
    return total_reward


# 3단계: 같은 seed 로 두 방식을 돌린다
random.seed(3)
r_basic = basic_ts()
random.seed(3)
r_ctx = contextual_ts()

# 이론상 최선: 매 라운드 그 조합의 진짜 1등만 골랐을 때 기대되는 클릭 수(트래픽 균등 가정)
best_possible = sum(max(v.values()) for v in TRUE_CTR.values()) / len(CONTEXTS) * ROUNDS

# 4단계: 이론상 최선과 함께 찍는다
print(f"이론상 최선(기대값, 매번 정답만 골랐다면): {best_possible:.1f}회 클릭")
print(f"기본 톰슨(컨텍스트 무시):              {r_basic}회 클릭")
print(f"컨텍스트별 톰슨(Linear TS 간이형):       {r_ctx}회 클릭")
print(f"컨텍스트별 톰슨이 기본 톰슨보다 {r_ctx - r_basic}회 더 클릭 획득")

# 출력:
# 4단계 뜻: 매번 정답만 골랐다면 기대 클릭이 210.0회다. 컨텍스트별 톰슨은 196회로 그에 가깝고, 컨텍스트를 무시한 기본 톰슨보다 52회 더 얻는다.
# 이론상 최선(기대값, 매번 정답만 골랐다면): 210.0회 클릭
# 기본 톰슨(컨텍스트 무시):              144회 클릭
# 컨텍스트별 톰슨(Linear TS 간이형):       196회 클릭
# 컨텍스트별 톰슨이 기본 톰슨보다 52회 더 클릭 획득
````

### 부록 19: ucb-family (블록 1개, Task 5)

#### 블록 1

<!-- cb4 post=ucb-family block=0 sha=6a52a1883457db27 -->
````python
# 하는 일: UCB1 을 컨텍스트 무시와 컨텍스트별 분리 두 방식으로 4,000회 돌려 누적 클릭을 견준다.
import random
import math

random.seed(3)

# 1단계: 컨텍스트 4종의 진짜 클릭률을 둔다
# 1절 표와 같은 '진짜' 클릭률. 지면 2종 x 시간대 2종, 소재 2개.
TRUE_CTR = {
    ("뉴스", "오전"):    {"A": 0.08, "B": 0.03},
    ("뉴스", "저녁"):    {"A": 0.02, "B": 0.06},
    ("커뮤니티", "오전"): {"A": 0.03, "B": 0.07},
    ("커뮤니티", "저녁"): {"A": 0.06, "B": 0.04},
}
CONTEXTS = list(TRUE_CTR)
ARMS = ["A", "B"]
ROUNDS = 4000

# 2단계: UCB1 고르기 함수를 만든다
# 관측 평균에 탐색 보너스를 더한 값이 가장 큰 소재를 고른다.
def ucb1_pick(counts, sums, t):
    unseen = [a for a in ARMS if counts[a] == 0]
    if unseen:
        return unseen[0]
    return max(ARMS, key=lambda a: sums[a] / counts[a] + math.sqrt(2 * math.log(t) / counts[a]))

# 3단계: 두 방식의 통계를 둔다
# 행렬 역행렬 없이 컨텍스트별 카운터 분리만으로 충분하다. 표준 라이브러리만 쓴다.

# (a) 컨텍스트를 무시한다 — 소재별 통계를 딱 하나만 쓴다.
blind_counts = {a: 0 for a in ARMS}
blind_sums = {a: 0 for a in ARMS}
blind_clicks = 0

# (b) 컨텍스트별로 UCB1을 따로 돌린다 — 조합마다 독립된 통계.
sep_counts = {c: {a: 0 for a in ARMS} for c in CONTEXTS}
sep_sums = {c: {a: 0 for a in ARMS} for c in CONTEXTS}
sep_clicks = 0

# 4단계: 4,000회 돌린다
# 매회 컨텍스트 하나가 무작위로 오고, 두 방식이 각자 소재를 고른다.
for _ in range(1, ROUNDS + 1):
    ctx = random.choice(CONTEXTS)

    t_blind = sum(blind_counts.values()) + 1
    arm_b = ucb1_pick(blind_counts, blind_sums, t_blind)
    reward_b = 1 if random.random() < TRUE_CTR[ctx][arm_b] else 0
    blind_counts[arm_b] += 1
    blind_sums[arm_b] += reward_b
    blind_clicks += reward_b

    t_sep = sum(sep_counts[ctx].values()) + 1
    arm_s = ucb1_pick(sep_counts[ctx], sep_sums[ctx], t_sep)
    reward_s = 1 if random.random() < TRUE_CTR[ctx][arm_s] else 0
    sep_counts[ctx][arm_s] += 1
    sep_sums[ctx][arm_s] += reward_s
    sep_clicks += reward_s

# 5단계: 두 방식의 누적 클릭을 찍는다
gain = (sep_clicks / blind_clicks - 1) * 100
print(f"{ROUNDS}회 후 누적 클릭 — 컨텍스트 무시: {blind_clicks}회, 컨텍스트별 분리: {sep_clicks}회")
print(f"분리 방식이 {sep_clicks - blind_clicks}회 더 많음 ({gain:.1f}% 더 많음)")
print(f"컨텍스트 무시 방식의 소재 선택 횟수: {blind_counts}")

# 출력:
# 5단계 뜻: 컨텍스트별로 나누면 클릭이 245회로, 무시할 때의 192회보다 53회(27.6%) 많다. 무시하면 A 와 B 를 1943회와 2057회로 거의 반반 고른다.
# 4000회 후 누적 클릭 — 컨텍스트 무시: 192회, 컨텍스트별 분리: 245회
# 분리 방식이 53회 더 많음 (27.6% 더 많음)
# 컨텍스트 무시 방식의 소재 선택 횟수: {'A': 1943, 'B': 2057}
````

### 부록 20: disjoint-LinUCB (블록 3개, Task 5)

#### 블록 1

<!-- cb4 post=disjoint-LinUCB block=0 sha=d5e9d81042e65979 -->
````python
# 하는 일: 2절 표의 학습 로그 8건으로 스포츠와 육아 arm 의 계수 θ 를 따로 학습하고, 새 요청 두 개에서 arm 마다 예측, 탐색 보너스, UCB 점수를 계산한다.
import math

# 1단계: 역행렬과 벡터 계산 함수를 만든다
# 가우스-조던 소거법으로 역행렬을 구하는 mat_inv 와, 내적(dot), 행렬-벡터 곱(matvec), 이차형식(quad)을 둔다.
def mat_inv(A):
    """가우스-조던 소거법으로 n x n 역행렬을 구한다. numpy 없이 리스트만으로."""
    n = len(A)
    aug = [row[:] + [1.0 if i == j else 0.0 for j in range(n)] for i, row in enumerate(A)]
    for i in range(n):
        pivot = aug[i][i]
        aug[i] = [v / pivot for v in aug[i]]          # 피벗 행을 1로 정규화
        for k in range(n):
            if k != i:
                factor = aug[k][i]
                aug[k] = [v - factor * w for v, w in zip(aug[k], aug[i])]  # 다른 행에서 소거
    return [row[n:] for row in aug]                    # 오른쪽 절반이 역행렬

def dot(u, v):
    return sum(ui * vi for ui, vi in zip(u, v))

def matvec(M, v):
    return [dot(row, v) for row in M]

def quad(M, x):                                        # x^T M x, 신뢰상한에 쓰는 이차형식
    return dot(x, matvec(M, x))

# 2단계: arm 마다 A 와 b 를 따로 두는 클래스를 만든다
# 처음 보는 arm 은 A 를 항등행렬, b 를 0 으로 두고 시작한다.
# score 는 예측(θ = A^-1 b 와 x 의 내적)에 탐색 보너스 alpha * sqrt(x^T A^-1 x) 를 더해 UCB 를 낸다.
class DisjointLinUCB:
    """arm마다 A(공분산 누적), b(보상 가중합)를 따로 갖는다 — 이름 그대로 'disjoint'."""
    def __init__(self, d, alpha):
        self.d, self.alpha = d, alpha
        self.A, self.b = {}, {}

    def _ensure(self, arm):
        if arm not in self.A:
            self.A[arm] = [[1.0 if i == j else 0.0 for j in range(self.d)] for i in range(self.d)]
            self.b[arm] = [0.0] * self.d

    def score(self, arm, x):
        self._ensure(arm)
        A_inv = mat_inv(self.A[arm])
        theta = matvec(A_inv, self.b[arm])
        pred = dot(theta, x)
        bonus = self.alpha * math.sqrt(quad(A_inv, x))
        return pred, bonus, pred + bonus

    def update(self, arm, x, reward):
        self._ensure(arm)
        for i in range(self.d):
            for j in range(self.d):
                self.A[arm][i][j] += x[i] * x[j]
            self.b[arm][i] += reward * x[i]

# 3단계: 학습 로그 8건으로 두 arm 을 학습시킨다
# 학습 로그 — 유저 컨텍스트(연령대, 관심사, 저녁여부)와 노출된 arm, 클릭여부
log = [
    (0.20, 0.90, 0, "스포츠", 1), (0.30, 0.80, 1, "스포츠", 1),
    (0.20, 0.20, 1, "스포츠", 0), (0.40, 0.70, 0, "스포츠", 1),
    (0.80, 0.20, 1, "육아",   1), (0.90, 0.10, 0, "육아",   1),
    (0.70, 0.30, 1, "육아",   0), (0.85, 0.15, 0, "육아",   1),
]
model = DisjointLinUCB(d=3, alpha=1.0)
for age, interest, evening, arm, click in log:
    model.update(arm, [age, interest, evening], click)

# 4단계: 학습한 θ 를 찍는다
# θ 의 세 값은 (연령대, 관심사, 저녁) 계수 순서다.
for arm in ("스포츠", "육아"):
    theta = matvec(mat_inv(model.A[arm]), model.b[arm])
    print(f"theta[{arm}] = {[round(v, 4) for v in theta]}")

# 5단계: 새 요청 두 개에서 arm 마다 점수를 찍는다
# 첫 요청은 관심사 0.50 인 저녁 요청이고, 둘째는 연령대 0.85 인 낮 요청이다.
print()
for x in ([0.25, 0.50, 1], [0.85, 0.15, 0]):
    print(f"x={x}")
    for arm in ("스포츠", "육아"):
        pred, bonus, ucb = model.score(arm, x)
        print(f"  {arm}: 예측={pred:.4f} + 보너스={bonus:.4f} = UCB {ucb:.4f}")

# 출력:
# 4단계 뜻: 스포츠 arm 은 관심사 계수가 0.7257 로 가장 크고, 육아 arm 은 연령대 계수가 0.6988 로 가장 크다.
# theta[스포츠] = [0.2545, 0.7257, 0.049]
# theta[육아] = [0.6988, 0.044, -0.0234]
# 5단계 뜻: 첫 요청 x=[0.25, 0.5, 1] 에서는 스포츠가 UCB 1.0636 으로 육아의 0.8669 를 앞선다. 둘째 요청에서는 육아의 예측이 0.6006 으로 스포츠의 0.3252 보다 높지만, 스포츠의 보너스가 0.7771 로 커서 UCB 가 1.1023 대 1.1012 로 거의 같다.
#
# x=[0.25, 0.5, 1]
#   스포츠: 예측=0.4755 + 보너스=0.5881 = UCB 1.0636
#   육아: 예측=0.1733 + 보너스=0.6935 = UCB 0.8669
# x=[0.85, 0.15, 0]
#   스포츠: 예측=0.3252 + 보너스=0.7771 = UCB 1.1023
#   육아: 예측=0.6006 + 보너스=0.5006 = UCB 1.1012
````

#### 블록 2

<!-- cb4 post=disjoint-LinUCB block=1 sha=918e3d3e8f9b58e1 -->
````python
# 하는 일: 진짜 클릭 확률을 정해 둔 arm 3개에서 Disjoint LinUCB 와 컨텍스트를 안 보는 UCB1 을 같은 800번, 같은 시드로 돌려 누적 클릭을 견주고, alpha 를 0.1, 1.0, 3.0 으로 바꿔 다시 돌린다.
import random
import math

# 1단계: 역행렬과 벡터 계산 함수를 둔다
# 4절 코드와 같은 함수다.
def mat_inv(A):
    n = len(A)
    aug = [row[:] + [1.0 if i == j else 0.0 for j in range(n)] for i, row in enumerate(A)]
    for i in range(n):
        pivot = aug[i][i]
        aug[i] = [v / pivot for v in aug[i]]
        for k in range(n):
            if k != i:
                factor = aug[k][i]
                aug[k] = [v - factor * w for v, w in zip(aug[k], aug[i])]
    return [row[n:] for row in aug]

def dot(u, v):
    return sum(ui * vi for ui, vi in zip(u, v))

def matvec(M, v):
    return [dot(row, v) for row in M]

# 2단계: arm 3개와 진짜 클릭 확률을 둔다
# 스포츠는 관심사 점수가, 육아는 연령대 점수가 높을수록 잘 클릭되고, 가전은 컨텍스트와 상관없이 0.08 이다.
ARMS = ["스포츠", "육아", "가전"]

def true_ctr(arm, x):                     # 알고리즘은 모르는 '진짜' 클릭 확률
    age, interest, evening = x
    if arm == "스포츠":
        p = 0.03 + 0.30 * interest - 0.05 * age
    elif arm == "육아":
        p = 0.03 + 0.30 * age - 0.05 * interest
    else:                                  # 가전 — 컨텍스트와 거의 무관한 대조군
        p = 0.08
    return min(0.4, max(0.01, p))

# 3단계: 두 알고리즘을 클래스로 만든다
# DisjointLinUCB 는 arm 마다 A 와 b 를 따로 두고, UCB1ContextBlind 는 arm 마다 관측 평균과 시도 횟수 보너스만 본다.
class DisjointLinUCB:
    def __init__(self, d, alpha):
        self.d, self.alpha = d, alpha
        self.A = {a: [[1.0 if i == j else 0.0 for j in range(d)] for i in range(d)] for a in ARMS}
        self.b = {a: [0.0] * d for a in ARMS}
    def choose(self, x):
        def s(a):
            A_inv = mat_inv(self.A[a])
            pred = dot(matvec(A_inv, self.b[a]), x)
            bonus = self.alpha * math.sqrt(dot(x, matvec(A_inv, x)))
            return pred + bonus
        return max(ARMS, key=s)
    def update(self, arm, x, r):
        for i in range(self.d):
            for j in range(self.d):
                self.A[arm][i][j] += x[i] * x[j]
            self.b[arm][i] += r * x[i]

class UCB1ContextBlind:                    # 컨텍스트를 아예 안 보는 대조 알고리즘
    def __init__(self):
        self.counts = {a: 0 for a in ARMS}
        self.sums = {a: 0 for a in ARMS}
        self.t = 0
    def choose(self, x):
        self.t += 1
        unseen = [a for a in ARMS if self.counts[a] == 0]
        if unseen:
            return unseen[0]
        return max(ARMS, key=lambda a: self.sums[a] / self.counts[a]
                   + math.sqrt(2 * math.log(self.t) / self.counts[a]))
    def update(self, arm, x, r):
        self.counts[arm] += 1
        self.sums[arm] += r

# 4단계: 한 번 돌리는 함수를 만든다
# 매 라운드 무작위 유저 컨텍스트를 만들고, 고른 arm 의 진짜 클릭 확률로 클릭 여부를 뽑아 누적 클릭과 arm 별 선택 횟수를 센다.
def run(policy, rounds, seed):
    random.seed(seed)
    total, picks = 0, {a: 0 for a in ARMS}
    for _ in range(rounds):
        x = [random.random(), random.random(), random.choice([0, 1])]
        arm = policy.choose(x)
        reward = 1 if random.random() < true_ctr(arm, x) else 0
        policy.update(arm, x, reward)
        total += reward
        picks[arm] += 1
    return total, picks

# 5단계: 같은 800번, 같은 시드로 두 알고리즘을 견준다
ROUNDS, SEED = 800, 2026

lin_total, lin_picks = run(DisjointLinUCB(d=3, alpha=1.0), ROUNDS, SEED)
ucb_total, ucb_picks = run(UCB1ContextBlind(), ROUNDS, SEED)
print(f"LinUCB(a=1.0)  누적클릭 {lin_total:3d}  {lin_picks}")
print(f"UCB1(무맥락)    누적클릭 {ucb_total:3d}  {ucb_picks}")
print(f"LinUCB가 {lin_total - ucb_total}건 더 획득 ({(lin_total/ucb_total - 1)*100:.1f}% 더)")

# 6단계: alpha 를 바꿔 LinUCB 를 다시 돌린다
print()
for alpha in (0.1, 1.0, 3.0):
    total, picks = run(DisjointLinUCB(d=3, alpha=alpha), ROUNDS, SEED)
    print(f"alpha={alpha:<4}  누적클릭 {total:3d}  {picks}")

# 출력:
# 5단계 뜻: LinUCB 는 누적 클릭 172 로 UCB1 의 124 보다 48건, 38.7% 더 얻는다. 대조군 가전은 LinUCB 가 90번, UCB1 이 167번 고른다.
# LinUCB(a=1.0)  누적클릭 172  {'스포츠': 388, '육아': 322, '가전': 90}
# UCB1(무맥락)    누적클릭 124  {'스포츠': 250, '육아': 383, '가전': 167}
# LinUCB가 48건 더 획득 (38.7% 더)
# 6단계 뜻: alpha 0.1 은 스포츠를 6번만 골라 누적 클릭이 137 이고, 3.0 은 가전을 175번 골라 154 다. 1.0 은 5단계의 LinUCB 와 같은 172 로 가장 많다.
#
# alpha=0.1   누적클릭 137  {'스포츠': 6, '육아': 646, '가전': 148}
# alpha=1.0   누적클릭 172  {'스포츠': 388, '육아': 322, '가전': 90}
# alpha=3.0   누적클릭 154  {'스포츠': 283, '육아': 342, '가전': 175}
````

#### 블록 3

<!-- cb4 post=disjoint-LinUCB block=2 sha=66e1aced2a2c7088 -->
````python
# 하는 일: 항등행렬에서 시작해 A 에 xx^T 를 5번 더하며, 역행렬을 매번 처음부터 구한 값과 Sherman-Morrison 으로 갱신한 값의 최대 오차를 잰다.
import random

# 1단계: 역행렬과 벡터 계산 함수를 둔다
# 4절 코드와 같은 함수다.
def mat_inv(A):
    n = len(A)
    aug = [row[:] + [1.0 if i == j else 0.0 for j in range(n)] for i, row in enumerate(A)]
    for i in range(n):
        pivot = aug[i][i]
        aug[i] = [v / pivot for v in aug[i]]
        for k in range(n):
            if k != i:
                factor = aug[k][i]
                aug[k] = [v - factor * w for v, w in zip(aug[k], aug[i])]
    return [row[n:] for row in aug]

def dot(u, v):
    return sum(ui * vi for ui, vi in zip(u, v))

def matvec(M, v):
    return [dot(row, v) for row in M]

# 2단계: Sherman-Morrison 갱신 함수를 만든다
# 위 공식대로, 이전 역행렬과 새 x 만으로 다음 역행렬을 구한다.
def sherman_morrison_update(A_inv, x):
    """(A + xx^T)^-1 를 O(d^2)로 갱신 — 전체 역행렬 재계산 없이."""
    Ax = matvec(A_inv, x)
    denom = 1.0 + dot(x, Ax)
    d = len(x)
    return [[A_inv[i][j] - (Ax[i] * Ax[j]) / denom for j in range(d)] for i in range(d)]

# 3단계: 두 방식 모두 항등행렬에서 시작한다
random.seed(3)
d = 3
A = [[1.0 if i == j else 0.0 for j in range(d)] for i in range(d)]
A_inv_sm = mat_inv(A)                    # 시작은 둘 다 항등행렬의 역행렬(자기 자신)

# 4단계: 5번 갱신하며 두 방식을 견준다
# 매번 무작위 x 로 A 를 직접 갱신한 뒤, 처음부터 구한 역행렬과 갱신한 역행렬의 원소별 최대 차이를 찍는다.
for step in range(1, 6):
    x = [random.uniform(-1, 1) for _ in range(d)]
    for i in range(d):                   # A를 직접 갱신
        for j in range(d):
            A[i][j] += x[i] * x[j]
    A_inv_direct = mat_inv(A)            # 방법 1: 매번 처음부터 재계산
    A_inv_sm = sherman_morrison_update(A_inv_sm, x)   # 방법 2: 이전 값에서 갱신

    diff = max(abs(A_inv_direct[i][j] - A_inv_sm[i][j]) for i in range(d) for j in range(d))
    print(f"갱신 {step}회차 — 두 방식의 최대 오차: {diff:.2e}")

# 출력:
# 4단계 뜻: 5번 모두 최대 오차가 4.16e-17 에서 2.22e-16 사이로, 부동소수점 반올림 수준이다.
# 갱신 1회차 — 두 방식의 최대 오차: 1.11e-16
# 갱신 2회차 — 두 방식의 최대 오차: 1.11e-16
# 갱신 3회차 — 두 방식의 최대 오차: 2.22e-16
# 갱신 4회차 — 두 방식의 최대 오차: 4.16e-17
# 갱신 5회차 — 두 방식의 최대 오차: 1.11e-16
````

---

### Task 1: bid-shading-censored 블록 5개 옮기기와 화면 확인

**Files:**
- Modify: `posts/bid-shading-censored.md` (파이썬 블록 5개를 새 블록으로)
- Modify: `scripts/code-blocks-baseline.json`
- 임시: `$SCRATCH/migrate_batch4.py`, `$SCRATCH/nocache_server.py`, `$SCRATCH/venv` (저장소에 넣지 않는다. Task 2~6 도 쓴다)

**Interfaces:**
- Consumes: 셋째 묶음이 올라간 main(새 형식 76개, 옛 형식 171개, 68편), 이 계획 부록 1 의 새 블록 5개
- Produces: 새 형식 블록 81개, 옛 형식 166개(67편). Task 2~5 가 같은 도우미를 `python3 "$SCRATCH/migrate_batch4.py" <계획 문서> posts <글 파일 이름>` 으로 쓴다. 옮기면 `<글 파일 이름>: 블록 N개를 옮겼습니다` 를 찍고 종료 코드 0 이다. 멈추면 `<글 파일 이름>: 바꾸지 않고 멈춥니다` 와 까닭 줄을 찍고 종료 코드 1 이며, 글은 그대로다.

CI 에서 건너뛰는 블록은 첫째(numpy, scipy)와 다섯째(numpy, scipy)다. 마지막 코드 줄 뒤의 주석을 옮긴 블록도 이 둘이다.

- [ ] **Step 1: 시작 상태를 본다**

Run (저장소 루트에서):

````bash
python3 --version
git status --short
node scripts/check-code-blocks.js | tail -1
````

Expected: `Python 3.9.7`(3.9 대면 된다), `git status` 는 아무것도 찍지 않는다, `✓ 새 형식 블록 76개, 옛 형식 블록 171개, 문제 0건`. 파이썬이 3.12 이상이면 멈추고 알린다(Review Focus 1). 블록 수가 다르면 멈추고 알린다. 셋째 묶음이 덜 올라갔거나 다른 일이 끼어든 것이다.

- [ ] **Step 2: 도우미와 서버 파일을 저장소 밖에 둔다**

`$SCRATCH/migrate_batch4.py` 는 아래 내용이다. 새 블록 글은 이 계획 문서의 부록에서 읽는다.

<!-- file $SCRATCH/migrate_batch4.py -->
````python
#!/usr/bin/env python3
"""넷째 묶음(경매와 밴딧 글 20편)의 파이썬 블록을 새 형식(하는 일, 단계, 뜻)으로 옮기는 일회용 도우미. 저장소에 넣지 않는다.

새 블록 글은 계획 문서에 있다. 블록마다 표시 줄
  <!-- cb4 post=<글 파일 이름> block=<0부터 센 파이썬 블록 번호> sha=<원본 블록 sha256 앞 16자> -->
바로 아래 네 백틱 python 울타리 안이 새 블록 전체다. 표시 줄 끝에 old=run 이 붙은 블록은
옛 출력이 코드가 찍는 값과 달라서(설계 문서 8-1) 찍힌 줄을 돌려서 받아 적은 블록이다.

바꾸기 전에 셋을 본다. 하나라도 어긋나면 아무것도 바꾸지 않고 멈춘다.
  1. 원본 블록이 계획을 쓸 때와 같다 (sha)
  2. 새 블록의 코드 줄(빈 줄과 # 로 시작하는 줄을 뺀 줄)이 원본과 글자까지 같다
  3. 새 블록의 찍힌 줄(뜻 줄을 뺀 출력 영역)이 원본 블록의 옛 출력과 글자까지 같다.
     old=run 블록은 이 비교를 건너뛴다. 그 블록의 찍힌 줄은 실행 검사가 본다
그다음 파이썬 블록 안의 글만 새 블록으로 바꾼다. 블록 밖의 글은 건드리지 않는다.

  python3 migrate_batch4.py <계획 문서> <posts 폴더> <글 파일 이름>
"""
import hashlib
import re
import sys

PLAN, POSTS, POST = sys.argv[1], sys.argv[2], sys.argv[3]
TICKS = '`' * 4  # 계획 문서의 네 백틱 울타리
MARK = re.compile(r'^<!-- cb4 post=(\S+) block=(\d+) sha=([0-9a-f]{16})( old=run)? -->\n'
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
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch4"; mkdir -p "$SCRATCH"
python3 - migrate_batch4.py nocache_server.py <<'EOF'
import os, re, sys
T = '`' * 4
plan = open('docs/superpowers/plans/2026-10-14-python-code-blocks-batch4.md', encoding='utf-8').read()
for name in sys.argv[1:]:
    m = re.search(r'^<!-- file \$SCRATCH/' + re.escape(name) + r' -->\n' + T + r'[a-z]*\n(.*?)^' + T + r'\n', plan, re.S | re.M)
    dest = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'code-steps-batch4', name)
    if not os.path.exists(dest):
        open(dest, 'w', encoding='utf-8').write(m.group(1))
    print(dest)
EOF
````

Expected: 파일 경로 두 줄. 이미 있는 파일은 그대로 둔다.

- [ ] **Step 3: 옮긴다**

Run: `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch4"; python3 "$SCRATCH/migrate_batch4.py" docs/superpowers/plans/2026-10-14-python-code-blocks-batch4.md posts bid-shading-censored`
Expected: `bid-shading-censored: 블록 5개를 옮겼습니다`. `바꾸지 않고 멈춥니다` 로 끝나면 이 태스크를 멈추고 까닭 줄을 그대로 알린다.

- [ ] **Step 4: 코드 줄과 블록 밖 글이 그대로인지, 옮긴 주석이 남았는지 본다**

Run:

````bash
python3 - bid-shading-censored <<'EOF'
import re, subprocess, sys
PY = re.compile(r'^```python[^\n]*\n(.*?)^```[ \t]*$', re.S | re.M)
code = lambda b: [l for l in b.split('\n') if l.strip() and not l.lstrip().startswith('#')]
# (글, 0부터 센 블록, 새 블록에 있어야 할 말, 새 블록에 없어야 할 옛 주석 줄)
MOVED = [
    ('bid-shading-censored', 0, '그 균형점이 b* 다', '# b를 올리면 Win Rate↑ but 이익↓, 내리면 반대 — 이 균형이 b*'),
    ('bid-shading-censored', 4, 'Grid Search(500개)가 Surplus 를 500번 계산할 때', '# Grid Search(500개) 대비 수십 배 빠른 수렴'),
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

Expected: 세 줄

````text
bid-shading-censored: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다
  1번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
  5번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
````

- [ ] **Step 5: 검사를 돌린다**

Run: `node scripts/check-code-blocks.js`
Expected: 두 줄

````text
  기준표보다 줄어든 글 1편 (bid-shading-censored.md 5→0) — node scripts/check-code-blocks.js --update 로 기준표를 줄입니다
✓ 새 형식 블록 81개, 옛 형식 블록 166개, 문제 0건
````

Run: `python3 scripts/check-python-outputs.py --post bid-shading-censored`
Expected: `✓ 통과 5, 건너뜀 0 (라이브러리 없음 0, 실행 안 됨 0), 실패 0`

CI 와 같은 표준 라이브러리 파이썬으로도 돌린다(Review Focus 2):

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch4"; python3 -m venv --without-pip "$SCRATCH/venv"
"$SCRATCH/venv/bin/python" scripts/check-python-outputs.py --post bid-shading-censored | tail -1
````

Expected: `✓ 통과 3, 건너뜀 2 (라이브러리 없음 2, 실행 안 됨 0), 실패 0` — 첫째, 다섯째 블록이 numpy 가 없어 건너뛴다. 실패로 세면 멈추고 알린다.

Run: `node scripts/check-wording.js`
Expected: 종료 코드 0

- [ ] **Step 6: 기준표를 줄인다**

Run: `node scripts/check-code-blocks.js --update`
Expected: `기준표를 다시 적었습니다 — 옛 형식 블록 166개, 글 67편`

- [ ] **Step 7: 첫 글을 화면으로 본다**

서버를 백그라운드로 띄우고(저장소 루트에서 `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch4"; python3 "$SCRATCH/nocache_server.py" "$(pwd)" 8772`, 파일은 Step 2 가 뽑았다) `http://127.0.0.1:8772/post.html?id=bid-shading-censored` 를 새 캐시(`new_page` 에 `isolatedContext` 이름)로 연다. 이후 브라우저 도구를 부를 때마다 그 페이지의 `pageId` 를 넘긴다. 아래 함수를 돌린다. 숨긴 iframe 을 네 폭으로 바꿔 가며 잰다. 목록의 앞은 글 id, 뒤는 파일 이름이다.

````js
async () => {
  const POSTS = [['bid-shading-censored', 'bid-shading-censored']];
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

Expected: 네 값 모두 `"5 true 0 0 false 0 0 0"` — 블록 5개, 원문과 같다, 출력 없는 블록 0, 바로 뒤에 남은 다른 코드 블록 0, 넘침 없음, 메모 겹침 0, 배치 빠짐 0, 용어 풀이와 수식이 끼어든 곳 0.

그림을 `.playwright-mcp/batch4/` 에 찍는다. 1440 폭(창 1440×1000)과 390 폭(390px iframe 하나만 둔 감싸는 페이지), 라이트와 다크(`document.documentElement.setAttribute('data-theme','dark')`)다. 넷째 블록(단계 여섯, 화살표 줄, 6단계 뜻), 둘째 블록(두 시장 표), 다섯째 블록(2단계 풀이 두 줄)을 담는다. 블록이 길면 머리와 출력 영역으로 나눠 찍고 이름에 `-top`, `-out` 을 붙인다. 390 폭에서 파란 메뉴 단추(`#sidebar-toggle`)가 코드를 가리면 감싸는 페이지의 iframe 안에서만 숨긴다.

볼 것: 넷째 블록의 6단계 뜻이 첫 찍힌 줄 옆에서 시작한다. 첫째, 다섯째 블록의 출력 영역 앞에 홀로 남은 주석이 없다. 390 폭에서 화살표 줄이 옆으로 넘치지 않는다. 서버를 끈다.

- [ ] **Step 8: 커밋**

````bash
git add posts/bid-shading-censored.md scripts/code-blocks-baseline.json
git commit -F - <<'EOF'
feat(posts): 경매와 밴딧 글 — Bid Shading 글의 파이썬 블록 5개를 하는 일, 단계, 뜻 형식으로

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

리뷰에서 블록 글을 고치게 되면 그 글을 직접 고친다(도우미는 원본 블록에만 돈다). 고친 커밋의 제목도 `fix(posts): 경매와 밴딧 글 — …` 으로 시작한다. Task 6 이 이 머리로 글 커밋을 찾아 하나로 합친다. Task 2~5 도 같다.

---

### Task 2: 경매 구조 다섯 편 블록 7개 옮기기

**Files:**
- Modify: `posts/header-bidding.md` (1개), `posts/second-price-auction.md` (1개), `posts/dsp-ssp-exchange.md` (1개), `posts/ad-network-vs-exchange.md` (3개), `posts/walled-garden.md` (1개)
- Modify: `scripts/code-blocks-baseline.json`

**Interfaces:**
- Consumes: `$SCRATCH/migrate_batch4.py`(Task 1 이 만든 것. Step 1 이 없으면 계획에서 다시 뽑는다), 이 계획 부록 2~6 의 새 블록 7개
- Produces: 새 형식 블록 88개, 옛 형식 블록 159개(62편)

다섯 편 모두 표준 라이브러리로 돈다. `old=run` 블록과 마지막 코드 줄 뒤 주석을 옮긴 블록은 없다.

- [ ] **Step 1: 도우미가 있는지 본다**

Run (저장소 루트에서):

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch4"; mkdir -p "$SCRATCH"
python3 - migrate_batch4.py <<'EOF'
import os, re, sys
T = '`' * 4
plan = open('docs/superpowers/plans/2026-10-14-python-code-blocks-batch4.md', encoding='utf-8').read()
for name in sys.argv[1:]:
    m = re.search(r'^<!-- file \$SCRATCH/' + re.escape(name) + r' -->\n' + T + r'[a-z]*\n(.*?)^' + T + r'\n', plan, re.S | re.M)
    dest = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'code-steps-batch4', name)
    if not os.path.exists(dest):
        open(dest, 'w', encoding='utf-8').write(m.group(1))
    print(dest)
EOF
````

Expected: 파일 경로 한 줄. Task 1 이 뽑아 둔 파일이 있으면 그대로 두고, 없으면 계획에서 다시 뽑는다.

- [ ] **Step 2: 다섯 편을 차례로 옮긴다**

Run:

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch4"
for p in header-bidding second-price-auction dsp-ssp-exchange ad-network-vs-exchange walled-garden; do
  python3 "$SCRATCH/migrate_batch4.py" docs/superpowers/plans/2026-10-14-python-code-blocks-batch4.md posts "$p" || break
done
````

Expected: 다섯 줄

````text
header-bidding: 블록 1개를 옮겼습니다
second-price-auction: 블록 1개를 옮겼습니다
dsp-ssp-exchange: 블록 1개를 옮겼습니다
ad-network-vs-exchange: 블록 3개를 옮겼습니다
walled-garden: 블록 1개를 옮겼습니다
````

`바꾸지 않고 멈춥니다` 가 나오면 거기서 멈추고, 까닭 줄과 그때까지 옮긴 글을 그대로 알린다. 그 글을 손으로 고치지 않는다.

- [ ] **Step 3: 코드 줄과 블록 밖 글이 그대로인지 본다**

Run:

````bash
python3 - header-bidding second-price-auction dsp-ssp-exchange ad-network-vs-exchange walled-garden <<'EOF'
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

Expected: 다섯 편 모두 `코드 줄이 바뀐 블록 [], 블록 밖 글 같다` (다섯 줄)

- [ ] **Step 4: 실행 검사를 돌린다**

Run:

````bash
for p in header-bidding second-price-auction dsp-ssp-exchange ad-network-vs-exchange walled-garden; do
  python3 scripts/check-python-outputs.py --post "$p"; echo "  exit=$?"
done
````

Expected: 차례로 `✓ 통과 1`, `✓ 통과 1`, `✓ 통과 1`, `✓ 통과 3`, `✓ 통과 1` 로 시작하는 다섯 줄(건너뜀 0, 실패 0)과 `exit=0` 다섯 줄

- [ ] **Step 5: 형식 검사, 말투 검사, 기준표**

Run: `node scripts/check-code-blocks.js | tail -1`
Expected: `✓ 새 형식 블록 88개, 옛 형식 블록 159개, 문제 0건`

Run: `node scripts/check-wording.js`
Expected: 종료 코드 0

Run: `node scripts/check-code-blocks.js --update`
Expected: `기준표를 다시 적었습니다 — 옛 형식 블록 159개, 글 62편`

- [ ] **Step 6: 커밋**

````bash
git add posts/header-bidding.md posts/second-price-auction.md posts/dsp-ssp-exchange.md \
        posts/ad-network-vs-exchange.md posts/walled-garden.md scripts/code-blocks-baseline.json
git commit -F - <<'EOF'
feat(posts): 경매와 밴딧 글 — 헤더비딩, 2등가 경매, DSP와 SSP, 광고 네트워크, 담장 안 글의 파이썬 블록 7개를 하는 일, 단계, 뜻 형식으로

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

---

### Task 3: 입문, 지도, 랭킹 다섯 편 블록 10개 옮기기

**Files:**
- Modify: `posts/adtech-30min-primer.md` (1개), `posts/ad-serving-flow.md` (1개), `posts/adtech-ecosystem-map.md` (3개), `posts/adtech-dev-layers.md` (2개), `posts/ecpm-ranking.md` (3개)
- Modify: `scripts/code-blocks-baseline.json`

**Interfaces:**
- Consumes: `$SCRATCH/migrate_batch4.py`(Step 1 이 없으면 계획에서 다시 뽑는다), 이 계획 부록 7~11 의 새 블록 10개
- Produces: 새 형식 블록 98개, 옛 형식 블록 149개(57편)

ecpm-ranking 세 블록은 `old=run` 이다(spec 8-1). 첫째, 둘째 블록은 찍는데 출력을 안 적었던 블록이라 출력 영역이 새로 생기고, 셋째 블록은 공백만 바뀐다. 첫째, 둘째 블록의 마지막 코드 줄 뒤 주석은 뜻 줄로 옮겼다. adtech-dev-layers 첫 블록은 파이썬 3.9 로 돌려야 한다(Review Focus 1).

- [ ] **Step 1: 도우미가 있는지 본다**

Run (저장소 루트에서):

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch4"; mkdir -p "$SCRATCH"
python3 - migrate_batch4.py <<'EOF'
import os, re, sys
T = '`' * 4
plan = open('docs/superpowers/plans/2026-10-14-python-code-blocks-batch4.md', encoding='utf-8').read()
for name in sys.argv[1:]:
    m = re.search(r'^<!-- file \$SCRATCH/' + re.escape(name) + r' -->\n' + T + r'[a-z]*\n(.*?)^' + T + r'\n', plan, re.S | re.M)
    dest = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'code-steps-batch4', name)
    if not os.path.exists(dest):
        open(dest, 'w', encoding='utf-8').write(m.group(1))
    print(dest)
EOF
````

Expected: 파일 경로 한 줄

- [ ] **Step 2: 다섯 편을 차례로 옮긴다**

Run:

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch4"
for p in adtech-30min-primer ad-serving-flow adtech-ecosystem-map adtech-dev-layers ecpm-ranking; do
  python3 "$SCRATCH/migrate_batch4.py" docs/superpowers/plans/2026-10-14-python-code-blocks-batch4.md posts "$p" || break
done
````

Expected: 다섯 줄

````text
adtech-30min-primer: 블록 1개를 옮겼습니다
ad-serving-flow: 블록 1개를 옮겼습니다
adtech-ecosystem-map: 블록 3개를 옮겼습니다
adtech-dev-layers: 블록 2개를 옮겼습니다
ecpm-ranking: 블록 3개를 옮겼습니다
````

`바꾸지 않고 멈춥니다` 가 나오면 거기서 멈추고, 까닭 줄과 그때까지 옮긴 글을 그대로 알린다. 그 글을 손으로 고치지 않는다.

- [ ] **Step 3: 코드 줄, 블록 밖 글, 옮긴 주석, 찍힌 줄 수를 본다**

Run:

````bash
python3 - adtech-30min-primer ad-serving-flow adtech-ecosystem-map adtech-dev-layers ecpm-ranking <<'EOF'
import re, subprocess, sys
PY = re.compile(r'^```python[^\n]*\n(.*?)^```[ \t]*$', re.S | re.M)
OUT = re.compile(r'^# 출력(?=[\s(:]|$)')
MEAN = re.compile(r'^# (?:\d+단계 )?뜻: ')
code = lambda b: [l for l in b.split('\n') if l.strip() and not l.lstrip().startswith('#')]
# (글, 0부터 센 블록, 새 블록에 있어야 할 말, 새 블록에 없어야 할 옛 주석 줄)
MOVED = [
    ('ecpm-ranking', 0, '과금 모델이 달라도 eCPM 으로 공정하게 견줄 수 있다', '# 과금 모델이 달라도 eCPM으로 공정 비교 가능'),
    ('ecpm-ranking', 1, '돈이 결정하느냐, 품질이 결정하느냐의 차이다', '# Open RTB: 돈이 결정 → B 승리'),
]
COUNT = ['ecpm-ranking']   # 찍힌 줄을 돌려서 받아 적은 글(old=run)


def printed(b, new):
    """출력 영역의 줄 수. 새 블록은 뜻 줄을 뺀다. 출력 영역이 없으면 None."""
    ls = b.rstrip('\n').split('\n')
    k = next((i for i, l in enumerate(ls) if OUT.match(l)), None)
    if k is None:
        return None
    r = [l for l in ls[k + 1:] if not (new and MEAN.match(l))]
    while r and r[-1].strip() in ('', '#'):
        r.pop()
    return len(r)


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
    if post in COUNT:
        print(f'  찍힌 줄 수 — 옛 출력 {[printed(b, False) for b in ob]}, 새 블록 {[printed(b, True) for b in nb]}')
sys.exit(1 if fail else 0)
EOF
````

Expected: 여덟 줄

````text
adtech-30min-primer: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다
ad-serving-flow: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다
adtech-ecosystem-map: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다
adtech-dev-layers: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다
ecpm-ranking: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다
  1번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
  2번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
  찍힌 줄 수 — 옛 출력 [None, None, 3], 새 블록 [5, 3, 3]
````

찍힌 줄 수가 다르면 멈추고 알린다. 이 셋의 찍힌 줄이 맞는지는 Step 4 의 실행 검사가 본다.

- [ ] **Step 4: 실행 검사를 돌린다**

Run:

````bash
python3 --version
for p in adtech-30min-primer ad-serving-flow adtech-ecosystem-map adtech-dev-layers ecpm-ranking; do
  python3 scripts/check-python-outputs.py --post "$p"; echo "  exit=$?"
done
````

Expected: `Python 3.9.7`, 그다음 차례로 `✓ 통과 1`, `✓ 통과 1`, `✓ 통과 3`, `✓ 통과 2`, `✓ 통과 3` 으로 시작하는 다섯 줄(건너뜀 0, 실패 0)과 `exit=0` 다섯 줄. adtech-dev-layers 가 `12번째 찍힌 줄이 다릅니다` 로 실패하면 파이썬이 3.12 이상인 것이다(Review Focus 1). 3.9 로 다시 돌린다.

- [ ] **Step 5: 형식 검사, 말투 검사, 기준표**

Run: `node scripts/check-code-blocks.js | tail -1`
Expected: `✓ 새 형식 블록 98개, 옛 형식 블록 149개, 문제 0건`

Run: `node scripts/check-wording.js`
Expected: 종료 코드 0

Run: `node scripts/check-code-blocks.js --update`
Expected: `기준표를 다시 적었습니다 — 옛 형식 블록 149개, 글 57편`

- [ ] **Step 6: 커밋**

````bash
git add posts/adtech-30min-primer.md posts/ad-serving-flow.md posts/adtech-ecosystem-map.md \
        posts/adtech-dev-layers.md posts/ecpm-ranking.md scripts/code-blocks-baseline.json
git commit -F - <<'EOF'
feat(posts): 경매와 밴딧 글 — 30분 입문, 광고 서빙 흐름, 생태계 지도, 개발 레이어, eCPM 랭킹 글의 파이썬 블록 10개를 하는 일, 단계, 뜻 형식으로

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

---

### Task 4: LTV, 자동입찰, 밴딧 기초 다섯 편 블록 14개 옮기기

**Files:**
- Modify: `posts/ltv-ad-ranking.md` (4개), `posts/auto-bidding-pacing.md` (4개), `posts/exploration-exploitation.md` (3개), `posts/mab.md` (1개), `posts/ab-test-vs-mab.md` (2개)
- Modify: `scripts/code-blocks-baseline.json`

**Interfaces:**
- Consumes: `$SCRATCH/migrate_batch4.py`, `$SCRATCH/venv`(Step 1 과 Step 4 가 없으면 다시 만든다), 이 계획 부록 12~16 의 새 블록 14개
- Produces: 새 형식 블록 112개, 옛 형식 블록 135개(52편)

ltv-ad-ranking 첫 블록은 `old=run` 이다(spec 8-1 「적힌 13줄, 찍힌 9줄」). 옛 출력 끝의 해설 세 줄은 뜻 줄로 옮겼다. auto-bidding-pacing 둘째, 셋째 블록은 numpy 를 써서 CI 에서 건너뛴다(Review Focus 2). 경매 분류 둘과 밴딧 분류 셋이 한 태스크에 든다.

- [ ] **Step 1: 도우미가 있는지 본다**

Run (저장소 루트에서):

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch4"; mkdir -p "$SCRATCH"
python3 - migrate_batch4.py <<'EOF'
import os, re, sys
T = '`' * 4
plan = open('docs/superpowers/plans/2026-10-14-python-code-blocks-batch4.md', encoding='utf-8').read()
for name in sys.argv[1:]:
    m = re.search(r'^<!-- file \$SCRATCH/' + re.escape(name) + r' -->\n' + T + r'[a-z]*\n(.*?)^' + T + r'\n', plan, re.S | re.M)
    dest = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'code-steps-batch4', name)
    if not os.path.exists(dest):
        open(dest, 'w', encoding='utf-8').write(m.group(1))
    print(dest)
EOF
````

Expected: 파일 경로 한 줄

- [ ] **Step 2: 다섯 편을 차례로 옮긴다**

Run:

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch4"
for p in ltv-ad-ranking auto-bidding-pacing exploration-exploitation mab ab-test-vs-mab; do
  python3 "$SCRATCH/migrate_batch4.py" docs/superpowers/plans/2026-10-14-python-code-blocks-batch4.md posts "$p" || break
done
````

Expected: 다섯 줄

````text
ltv-ad-ranking: 블록 4개를 옮겼습니다
auto-bidding-pacing: 블록 4개를 옮겼습니다
exploration-exploitation: 블록 3개를 옮겼습니다
mab: 블록 1개를 옮겼습니다
ab-test-vs-mab: 블록 2개를 옮겼습니다
````

`바꾸지 않고 멈춥니다` 가 나오면 거기서 멈추고, 까닭 줄과 그때까지 옮긴 글을 그대로 알린다. 그 글을 손으로 고치지 않는다.

- [ ] **Step 3: 코드 줄, 블록 밖 글, 옮긴 해설, 찍힌 줄 수를 본다**

Run:

````bash
python3 - ltv-ad-ranking auto-bidding-pacing exploration-exploitation mab ab-test-vs-mab <<'EOF'
import re, subprocess, sys
PY = re.compile(r'^```python[^\n]*\n(.*?)^```[ \t]*$', re.S | re.M)
OUT = re.compile(r'^# 출력(?=[\s(:]|$)')
MEAN = re.compile(r'^# (?:\d+단계 )?뜻: ')
code = lambda b: [l for l in b.split('\n') if l.strip() and not l.lstrip().startswith('#')]
# (글, 0부터 센 블록, 새 블록에 있어야 할 말, 새 블록에 없어야 할 옛 주석 줄)
MOVED = [
    ('ltv-ad-ranking', 0, '지금 버는 돈보다 그 노출이 사용자를 얼마나 지치게 하는지가 순위를 정한다',
     '# 사용자 비용 β를 빼면 C는 LTV가 음수가 되어 아예 탈락한다.'),
]
COUNT = ['ltv-ad-ranking']   # 찍힌 줄을 돌려서 받아 적은 글(old=run)


def printed(b, new):
    """출력 영역의 줄 수. 새 블록은 뜻 줄을 뺀다. 출력 영역이 없으면 None."""
    ls = b.rstrip('\n').split('\n')
    k = next((i for i, l in enumerate(ls) if OUT.match(l)), None)
    if k is None:
        return None
    r = [l for l in ls[k + 1:] if not (new and MEAN.match(l))]
    while r and r[-1].strip() in ('', '#'):
        r.pop()
    return len(r)


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
    if post in COUNT:
        print(f'  찍힌 줄 수 — 옛 출력 {[printed(b, False) for b in ob]}, 새 블록 {[printed(b, True) for b in nb]}')
sys.exit(1 if fail else 0)
EOF
````

Expected: 일곱 줄

````text
ltv-ad-ranking: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다
  1번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
  찍힌 줄 수 — 옛 출력 [13, 6, 6, 6], 새 블록 [9, 6, 6, 6]
auto-bidding-pacing: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다
exploration-exploitation: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다
mab: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다
ab-test-vs-mab: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다
````

- [ ] **Step 4: 실행 검사를 돌린다**

Run:

````bash
for p in ltv-ad-ranking auto-bidding-pacing exploration-exploitation mab ab-test-vs-mab; do
  python3 scripts/check-python-outputs.py --post "$p"; echo "  exit=$?"
done
````

Expected: 차례로 `✓ 통과 4`, `✓ 통과 4`, `✓ 통과 3`, `✓ 통과 1`, `✓ 통과 2` 로 시작하는 다섯 줄(건너뜀 0, 실패 0)과 `exit=0` 다섯 줄

CI 와 같은 표준 라이브러리 파이썬으로 auto-bidding-pacing 을 돌린다(Review Focus 2):

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch4"; python3 -m venv --without-pip "$SCRATCH/venv"
"$SCRATCH/venv/bin/python" scripts/check-python-outputs.py --post auto-bidding-pacing | tail -1
````

Expected: `✓ 통과 2, 건너뜀 2 (라이브러리 없음 2, 실행 안 됨 0), 실패 0` — 둘째, 셋째 블록이 numpy 가 없어 건너뛴다.

- [ ] **Step 5: 형식 검사, 말투 검사, 기준표**

Run: `node scripts/check-code-blocks.js | tail -1`
Expected: `✓ 새 형식 블록 112개, 옛 형식 블록 135개, 문제 0건`

Run: `node scripts/check-wording.js`
Expected: 종료 코드 0

Run: `node scripts/check-code-blocks.js --update`
Expected: `기준표를 다시 적었습니다 — 옛 형식 블록 135개, 글 52편`

- [ ] **Step 6: 커밋**

````bash
git add posts/ltv-ad-ranking.md posts/auto-bidding-pacing.md posts/exploration-exploitation.md \
        posts/mab.md posts/ab-test-vs-mab.md scripts/code-blocks-baseline.json
git commit -F - <<'EOF'
feat(posts): 경매와 밴딧 글 — LTV 랭킹, 자동입찰, 탐색과 활용, MAB, A/B 와 MAB 글의 파이썬 블록 14개를 하는 일, 단계, 뜻 형식으로

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

---

### Task 5: UCB 와 톰슨, 컨텍스트 밴딧 네 편 블록 8개 옮기기와 고칠 곳 다섯

**Files:**
- Modify: `posts/ucb_ts.md` (2개), `posts/TS-linTS.md` (2개), `posts/ucb-family.md` (1개), `posts/disjoint-LinUCB.md` (3개)
- Modify: `scripts/code-blocks-baseline.json`
- Modify (Step 7, 고칠 곳 다섯): `posts/mab.md`, `posts/ltv-ad-ranking.md`, `posts/ucb_ts.md`, `posts/disjoint-LinUCB.md`, `posts/bid-shading-censored.md` 한 곳씩

**Interfaces:**
- Consumes: `$SCRATCH/migrate_batch4.py`(Step 1 이 없으면 계획에서 다시 뽑는다), 이 계획 부록 17~20 의 새 블록 8개
- Produces: 새 형식 블록 120개, 옛 형식 블록 127개(48편)

네 편 모두 표준 라이브러리로 돈다. disjoint-LinUCB 셋째 블록은 파이썬 3.9 로 돌려야 한다(Review Focus 1).

- [ ] **Step 1: 도우미가 있는지 본다**

Run (저장소 루트에서):

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch4"; mkdir -p "$SCRATCH"
python3 - migrate_batch4.py <<'EOF'
import os, re, sys
T = '`' * 4
plan = open('docs/superpowers/plans/2026-10-14-python-code-blocks-batch4.md', encoding='utf-8').read()
for name in sys.argv[1:]:
    m = re.search(r'^<!-- file \$SCRATCH/' + re.escape(name) + r' -->\n' + T + r'[a-z]*\n(.*?)^' + T + r'\n', plan, re.S | re.M)
    dest = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'code-steps-batch4', name)
    if not os.path.exists(dest):
        open(dest, 'w', encoding='utf-8').write(m.group(1))
    print(dest)
EOF
````

Expected: 파일 경로 한 줄

- [ ] **Step 2: 네 편을 차례로 옮긴다**

Run:

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch4"
for p in ucb_ts TS-linTS ucb-family disjoint-LinUCB; do
  python3 "$SCRATCH/migrate_batch4.py" docs/superpowers/plans/2026-10-14-python-code-blocks-batch4.md posts "$p" || break
done
````

Expected: 네 줄

````text
ucb_ts: 블록 2개를 옮겼습니다
TS-linTS: 블록 2개를 옮겼습니다
ucb-family: 블록 1개를 옮겼습니다
disjoint-LinUCB: 블록 3개를 옮겼습니다
````

`바꾸지 않고 멈춥니다` 가 나오면 거기서 멈추고, 까닭 줄과 그때까지 옮긴 글을 그대로 알린다. 그 글을 손으로 고치지 않는다.

- [ ] **Step 3: 코드 줄과 블록 밖 글이 그대로인지 본다**

Run:

````bash
python3 - ucb_ts TS-linTS ucb-family disjoint-LinUCB <<'EOF'
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

Expected: 네 편 모두 `코드 줄이 바뀐 블록 [], 블록 밖 글 같다` (네 줄)

- [ ] **Step 4: 실행 검사를 돌린다**

Run:

````bash
python3 --version
for p in ucb_ts TS-linTS ucb-family disjoint-LinUCB; do
  python3 scripts/check-python-outputs.py --post "$p"; echo "  exit=$?"
done
````

Expected: `Python 3.9.7`, 그다음 차례로 `✓ 통과 2`, `✓ 통과 2`, `✓ 통과 1`, `✓ 통과 3` 으로 시작하는 네 줄(건너뜀 0, 실패 0)과 `exit=0` 네 줄. disjoint-LinUCB 가 `4번째 찍힌 줄이 다릅니다` 로 실패하면 파이썬이 3.12 이상인 것이다(Review Focus 1). 3.9 로 다시 돌린다.

- [ ] **Step 5: 형식 검사, 말투 검사, 기준표**

Run: `node scripts/check-code-blocks.js | tail -1`
Expected: `✓ 새 형식 블록 120개, 옛 형식 블록 127개, 문제 0건`

Run: `node scripts/check-wording.js`
Expected: 종료 코드 0

Run: `node scripts/check-code-blocks.js --update`
Expected: `기준표를 다시 적었습니다 — 옛 형식 블록 127개, 글 48편`

- [ ] **Step 6: 커밋**

````bash
git add posts/ucb_ts.md posts/TS-linTS.md posts/ucb-family.md posts/disjoint-LinUCB.md scripts/code-blocks-baseline.json
git commit -F - <<'EOF'
feat(posts): 경매와 밴딧 글 — UCB 와 톰슨, Linear TS, UCB 계열, Disjoint LinUCB 글의 파이썬 블록 8개를 하는 일, 단계, 뜻 형식으로

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

- [ ] **Step 7: 고칠 곳 다섯을 고친다**

사용자가 이 계획을 확인하며 고치기로 한 사실 오류다(위 「고칠 곳 다섯」). 다섯 편은 Task 1, 4, 5 에서 이미 옮겼다. 도우미를 쓰지 않고 아래 명령으로 고친다. 찾을 글이 파일에 꼭 한 번 있어야 하고, 고친 뒤 글이 파일에 이미 있으면 안 된다. 하나라도 어긋나면 아무 파일도 쓰지 않고 멈춘다.

Run (저장소 루트에서):

````bash
python3 - <<'EOF'
import sys
FIX = [
    ('posts/mab.md',
     '소재1, 소재2, 소재3, 소재5는 공교롭게 전부 2번씩 클릭돼 관측 CTR이 똑같이 10%로 동률이 났다',
     '소재1, 소재2, 소재3, 소재5는 공교롭게 전부 1번씩 클릭돼 관측 CTR이 똑같이 5%로 동률이 났다'),
    ('posts/mab.md',
     '그리디는 이 동률 중 맨 처음(소재1, 진짜 3%)을 골라 나머지 900회를 그 소재 하나에 몰아줬다.',
     '그리디는 이 동률 중 맨 처음(소재1)부터 고르다가 관측 평균이 떨어질 때마다 옮겨 다녀, 나머지 900회 가운데 776회를 소재5(진짜 5%)에 몰아줬다. 진짜 1등 소재2는 11회뿐이었다.'),
    ('posts/ltv-ad-ranking.md',
     '# 양수면 LTV로 갈수록 순위가 내려간 것',
     '# 양수면 LTV로 보면 순위가 올라간 것'),
    ('posts/ucb_ts.md',
     '톰슨 샘플링의 누적 후회가 매번 UCB1의 절반을 넘지 않았다',
     '톰슨 샘플링의 누적 후회가 대부분 UCB1의 절반을 넘지 않았다'),
    ('posts/disjoint-LinUCB.md',
     '오차는 전부 $10^{-16}$대다.',
     '오차는 전부 $10^{-16}$ 이하다.'),
    ('posts/bid-shading-censored.md',
     'Grid Search($N = 500$개 그리드)보다 수십 배 빠릅니다.',
     'Grid Search($N = 500$개 그리드)보다 20배 가까이 빠릅니다.'),
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

Expected: `6곳을 고쳤습니다 (5편)` (mab 은 한 문단의 두 문장이라 두 곳으로 센다)

- [ ] **Step 8: 고친 것만 바뀌었는지 보고 커밋한다**

Run:

````bash
git diff --stat | tail -1
node scripts/check-wording.js; echo "wording exit=$?"
node scripts/check-code-blocks.js | tail -1
for p in mab ltv-ad-ranking ucb_ts disjoint-LinUCB bid-shading-censored; do
  python3 scripts/check-python-outputs.py --post "$p"; echo "  exit=$?"
done
````

Expected: ` 5 files changed, 5 insertions(+), 5 deletions(-)` (mab 의 두 문장은 한 줄에 있다), `wording exit=0`, `✓ 새 형식 블록 120개, 옛 형식 블록 127개, 문제 0건`, 그다음 차례로 `✓ 통과 1`, `✓ 통과 4`, `✓ 통과 2`, `✓ 통과 3`, `✓ 통과 5` 로 시작하는 다섯 줄(실패 0)과 `exit=0` 다섯 줄. bid-shading-censored 는 numpy, scipy 가 있는 로컬 python3 에서 돌린다. 기준표는 바뀌지 않는다. `git diff` 로 다섯 줄을 눈으로도 본다 — 바뀐 것은 「고칠 곳 다섯」의 「고칠 글」뿐이어야 한다.

````bash
git add posts/mab.md posts/ltv-ad-ranking.md posts/ucb_ts.md posts/disjoint-LinUCB.md posts/bid-shading-censored.md
git commit -F - <<'EOF'
fix(posts): 경매와 밴딧 글 — 사용자가 고치기로 한 사실 오류 다섯 곳을 코드가 찍는 값과 맞게 고친다

mab 의 그리디 단락(1번씩 5%, 776회 소재5), ucb_ts 의 「매번」을 「대부분」으로,
disjoint-LinUCB 의 「10^-16대」를 「10^-16 이하」로, bid-shading-censored 의 「수십 배」를 「20배 가까이」로,
ltv-ad-ranking 둘째 블록 코드 줄의 줄 끝 주석을 「양수면 LTV로 보면 순위가 올라간 것」으로.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

---

### Task 6: 넷째 묶음 확인과 올리기

**Files:** 없음 (확인, 커밋 합치기, push)

**Interfaces:**
- Consumes: Task 1~5 의 커밋
- Produces: 사용자 확인, 그 뒤 main 에 올린 넷째 묶음. 올리는 커밋은 계획 문서 1개와 글 옮기기 1개다(합치기 전에는 글 커밋 6개와 리뷰 고침. 옮기기 5개와 고칠 곳 다섯 1개).

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

Expected: 마지막 줄 `ALL-OK`. 그 위 줄들 가운데 `✓ 새 형식 블록 120개, 옛 형식 블록 127개, 문제 0건`, `94 통과, 0 실패`, `22 통과, 0 실패`, `21 통과, 0 실패`, `✓ 통과 119, 건너뜀 1 (라이브러리 없음 0, 실행 안 됨 1), 실패 0` 이 있다.

CI 와 같은 표준 라이브러리 파이썬으로도 돌린다:

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch4"; python3 -m venv --without-pip "$SCRATCH/venv"
"$SCRATCH/venv/bin/python" scripts/test-python-outputs.py | tail -1
"$SCRATCH/venv/bin/python" scripts/check-python-outputs.py | tail -1
````

Expected: `21 통과, 0 실패` 와 `✓ 통과 112, 건너뜀 8 (라이브러리 없음 7, 실행 안 됨 1), 실패 0` (셋째 묶음의 셋에 이 묶음의 numpy, scipy 블록 4개가 더해졌다)

- [ ] **Step 2: 숫자로 재고 그림을 찍는다**

서버 파일이 있는지 보고, 없으면 계획에서 뽑는다(저장소 루트에서).

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch4"; mkdir -p "$SCRATCH"
python3 - nocache_server.py <<'EOF'
import os, re, sys
T = '`' * 4
plan = open('docs/superpowers/plans/2026-10-14-python-code-blocks-batch4.md', encoding='utf-8').read()
for name in sys.argv[1:]:
    m = re.search(r'^<!-- file \$SCRATCH/' + re.escape(name) + r' -->\n' + T + r'[a-z]*\n(.*?)^' + T + r'\n', plan, re.S | re.M)
    dest = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'code-steps-batch4', name)
    if not os.path.exists(dest):
        open(dest, 'w', encoding='utf-8').write(m.group(1))
    print(dest)
EOF
````

서버를 백그라운드로 띄운다: `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch4"; python3 "$SCRATCH/nocache_server.py" "$(pwd)" 8772`. 아무 글이나 새 캐시로 연 뒤 아래 함수를 돌린다. 목록의 앞은 글 id, 뒤는 파일 이름이다.

````js
async () => {
  const POSTS = [
    ['bid-shading-censored', 'bid-shading-censored'],
    ['header-bidding', 'header-bidding'],
    ['second-price-auction', 'second-price-auction'],
    ['dsp-ssp-exchange', 'dsp-ssp-exchange'],
    ['ad-network-vs-exchange', 'ad-network-vs-exchange'],
    ['walled-garden', 'walled-garden'],
    ['adtech-30min-primer', 'adtech-30min-primer'],
    ['ad-serving-flow', 'ad-serving-flow'],
    ['adtech-ecosystem-map', 'adtech-ecosystem-map'],
    ['adtech-dev-layers', 'adtech-dev-layers'],
    ['ecpm-ranking', 'ecpm-ranking'],
    ['ltv-ad-ranking', 'ltv-ad-ranking'],
    ['auto-bidding-pacing', 'auto-bidding-pacing'],
    ['exploration-exploitation', 'exploration-exploitation'],
    ['mab-summary', 'mab'],
    ['ab-test-vs-mab', 'ab-test-vs-mab'],
    ['ucb-vs-ts', 'ucb_ts'],
    ['TS-linTS', 'TS-linTS'],
    ['ucb-family', 'ucb-family'],
    ['disjoint-linucb', 'disjoint-LinUCB'],
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

Expected: 네 폭 모두 글마다 `"<블록 수> true 0 0 false 0 0 0"` 이다(값 80개). 블록 수는 목록 차례로 5, 1, 1, 1, 3, 1, 1, 1, 3, 2, 3, 4, 4, 3, 1, 2, 2, 2, 1, 3 이다. 44개 모두 찍는 것이 있어 출력 없는 블록은 0 이다.

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

Expected: `{"posts":108,"numbers":2219,"overflow":[],"broken":[]}` (계획을 쓸 때 잰 값. 셋째 묶음의 마지막 리뷰가 블록을 고쳤다면 `numbers` 만 조금 다를 수 있다. 보고서에 그대로 적는다)

그림을 `.playwright-mcp/batch4/` 에 찍는다. 20편을 1440 폭 라이트로 한 장씩(20장), 아래 표에서 390 이라 적은 6편은 390 폭 라이트로도(6장), bid-shading-censored 와 disjoint-LinUCB 는 1440 폭 다크로도(2장) 찍는다. 블록이 길면 머리와 출력 영역으로 나눠 찍고 이름에 `-top`, `-out` 을 붙인다. 담을 블록은 아래와 같다.

| 글 | 블록 | 390 |
|---|---|---|
| bid-shading-censored | 넷째 (Kaplan-Meier, 단계 여섯, 화살표 줄) | 390 |
| header-bidding | 첫째 (Waterfall 과 헤더비딩, 뜻 둘) | |
| second-price-auction | 첫째 (정직, 과대, 과소, 뜻 셋) | |
| dsp-ssp-exchange | 첫째 (take rate 검산, 뜻 둘) | |
| ad-network-vs-exchange | 첫째 (고정가와 경매) | |
| walled-garden | 첫째 (두 효과의 곱) | |
| adtech-30min-primer | 첫째 (다섯 값) | |
| ad-serving-flow | 첫째 (필터 순서, 뜻 둘) | 390 |
| adtech-ecosystem-map | 셋째 (고리 한 바퀴, 뜻 둘) | |
| adtech-dev-layers | 둘째 (레이어 오차, 뜻 셋) | |
| ecpm-ranking | 첫째 (새로 생긴 출력 영역) | 390 |
| ltv-ad-ranking | 첫째 (9줄로 고친 출력, 해설을 옮긴 뜻) | 390 |
| auto-bidding-pacing | 첫째 (예산 세 방식, 단계 다섯) | |
| exploration-exploitation | 둘째 (탐색 비율 표) | 390 |
| mab | 첫째 (배정 방법 다섯) | |
| ab-test-vs-mab | 둘째 (차이가 작을 때, 뜻 둘) | |
| ucb_ts | 첫째 (UCB1 과 톰슨, 뜻 둘) | |
| TS-linTS | 첫째 (선택 비율과 사후분포, 뜻 둘) | |
| ucb-family | 첫째 (컨텍스트 분리) | |
| disjoint-LinUCB | 둘째 (alpha 셋, 뜻 둘) | 390 |

서버를 끈다.

- [ ] **Step 3: 확인 페이지를 만든다** (컨트롤러)

셋째 묶음처럼 비공개 artifact 한 장에 담는다. 바뀌는 것(글 20편, 블록 44개, 코드와 검사는 그대로), 그림, 검사 결과(로컬과 표준 라이브러리 파이썬 둘 다), 올리면 하는 일(커밋 수, 합치는 글 커밋, rebase, `ubuntu-24.04` 에서 도는 글 검사), 「이 계획에서 정한 것」 가운데 독자가 보는 것(마지막 코드 줄 뒤 주석을 뜻 줄로 옮긴 블록, 찍힌 줄을 돌려 받아 적은 블록 4개, 「수십 배」를 고쳐 쓴 풀이), 「고친 본문」 절(이 계획의 「고칠 곳 다섯」 다섯 줄의 전후)을 쓴다. 블록을 옮기며 새로 찾은 사실 오류가 있으면 「여쭤볼 것」 절에 따로 쓴다.

- [ ] **Step 4: 사용자 확인을 받는다** (컨트롤러)

그림과 함께 바뀐 것을 짧게 알린다. 고친 다섯 곳은 전후를 보인다. 새로 찾은 「여쭤볼 것」이 있으면 고칠지 함께 묻고, 고치기로 하면 글 커밋(`fix(posts): 경매와 밴딧 글 — …`)으로 고친 뒤 Step 1 부터 다시 한다. 사용자가 올려도 된다고 하기 전에는 push 하지 않는다.

- [ ] **Step 5: 글 커밋을 하나로 합친다** (사용자 확인 뒤)

Run:

````bash
FIRST=$(git log --reverse --format=%H --fixed-strings --grep='(posts): 경매와 밴딧 글 —' origin/main..HEAD | head -1)
BASE=$(git rev-parse "$FIRST^")
git log --format='%h %s' "$BASE..HEAD"
git diff --stat "$BASE" HEAD
````

Expected: `git log` 의 줄이 모두 `feat(posts): 경매와 밴딧 글 —` 이나 `fix(posts): 경매와 밴딧 글 —` 로 시작한다. `git diff --stat` 의 파일이 Task 1~5 의 글 20편과 `scripts/code-blocks-baseline.json` 뿐이다. 다른 커밋이 끼어 있으면 합치지 않고 그대로 올린다고 사용자에게 알린다.

위 결과가 맞을 때만 합친다. 셸 변수는 명령마다 사라지므로 `FIRST` 와 `BASE` 를 이 명령 안에서 다시 구한다. 하나라도 실패하면 거기서 멈춘다.

Run:

````bash
FIRST=$(git log --reverse --format=%H --fixed-strings --grep='(posts): 경매와 밴딧 글 —' origin/main..HEAD | head -1)
test -n "$FIRST" || { echo '글 커밋을 못 찾았다'; exit 1; }
BASE=$(git rev-parse "$FIRST^") || exit 1
TREE=$(git rev-parse 'HEAD^{tree}')
git reset --soft "$BASE" || exit 1
git commit -F - <<'EOF' || exit 1
feat(posts): 경매와 밴딧 글 20편의 파이썬 블록 44개를 하는 일, 단계, 뜻 형식으로

경매 13편 30개, 밴딧 7편 14개. 실행되는 코드 줄과 블록 밖 본문은 아래 다섯 곳 말고는 그대로다.
ecpm-ranking 세 블록과 ltv-ad-ranking 첫 블록은 설계 문서 8-1 대로 찍힌 줄을 돌려 받아 적었다.
사용자가 고치기로 한 사실 오류 다섯 곳도 고쳤다. mab, ucb_ts, disjoint-LinUCB, bid-shading-censored 의 본문 한 곳씩과
ltv-ad-ranking 둘째 블록 코드 줄의 줄 끝 주석 하나다. 코드가 찍는 값과 맞게 고쳤다.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
test "$(git rev-parse 'HEAD^{tree}')" = "$TREE" && echo '트리 같음'
git log --format='%h %s' origin/main..HEAD
````

Expected: `트리 같음` 과 두 줄 — 맨 위가 방금 합친 `feat(posts): 경매와 밴딧 글 20편의 …` 이고, 그 아래가 계획 문서 커밋이다(계획을 고친 커밋이 있으면 그만큼 더). Step 4 에서 새 「여쭤볼 것」을 고치기로 해 본문을 더 바꿨으면 커밋 글의 둘째 문단 끝에 그 사실을 한 줄 더 적는다.

- [ ] **Step 6: 올린다** (컨트롤러)

Run: `git fetch origin && git rebase origin/main && git status -sb | head -1 && git log --format='%h %ae %s' origin/main..HEAD`
Expected: 내 커밋만 있고 작성자가 모두 `37789148+chkimsu@users.noreply.github.com` 이다. 다른 세션의 커밋이 있으면 멈추고 알린다. rebase 로 들어온 커밋이 있으면 Step 1 의 검사를 다시 돌린다.

자동 권한 검사가 `git push` 를 막으므로, 사용자에게 프롬프트에 `! git push origin main` 을 입력해 달라고 부탁한다.

- [ ] **Step 7: 글 검사를 본다** (컨트롤러)

Run: `gh run list --workflow validate.yml --limit 1 --json databaseId,headSha,status` 로 push 한 커밋의 run id 를 찾고 `gh run watch <id> --exit-status`
Expected: 종료 코드 0. `actions/setup-python@v5` 의 3.9 설치 단계와 `코드 블록 형식 검사 시험` 단계를 포함해 모든 단계에 ✓ 가 붙는다. run 의 로그는 읽지 않는다(관리자 권한이 필요하고 로컬 gh 는 github.com 에 로그인돼 있지 않다). `gh api repos/chkimsu/adtech-blog/actions/runs/<id>/jobs --jq '.jobs[].labels'` 가 `["ubuntu-24.04"]` 다.

같은 커밋의 `Update sitemap.xml + feed.xml` 과 `pages-build-deployment` 도 `gh run watch <id> --exit-status` 로 끝까지 본다. 봇의 사이트맵 커밋이 새 배포를 띄우면 앞 배포는 취소될 수 있다. 그때는 새 배포의 결과를 본다.

- [ ] **Step 8: 공개 블로그에서 본다** (컨트롤러)

페이지 배포가 끝나면 새 캐시로 `https://chkimsu.github.io/adtech-blog/post.html?id=bid-shading-censored` 을 연다. Step 2 의 목록 20편을 숨긴 iframe 으로 차례로 열어 `.post-content .cb` 수(5, 1, 1, 1, 3, 1, 1, 1, 3, 2, 3, 4, 4, 3, 1, 2, 2, 2, 1, 3)와 콘솔 오류 0 을 확인한다. 글 id 는 파일 이름이 아니라 목록 앞쪽 값(`mab-summary`, `ucb-vs-ts`, `disjoint-linucb`)을 쓴다. 접힌 절 안의 블록 글은 `innerText` 에 안 잡히니 `textContent` 로 본다.
