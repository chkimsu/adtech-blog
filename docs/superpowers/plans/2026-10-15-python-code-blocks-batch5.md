# 파이썬 코드 블록 개편 — 다섯째 묶음 실행 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 측정과 모델링 분류의 글 19편, 파이썬 블록 42개를 하는 일, 단계, 뜻 형식으로 옮긴다. 검사와 화면 코드는 바꾸지 않는다.

**Architecture:** 글만 옮기는 묶음이다. 넷째 묶음의 도우미를 이어받은 저장소 밖 도우미 `migrate_batch5.py` 가 이 계획 부록의 새 블록 전문을 읽어 바꾼다. 도우미는 원본 블록의 해시, 코드 줄, 옛 출력의 찍힌 줄을 먼저 견주고, 하나라도 다르면 아무것도 바꾸지 않는다. 옛 출력이 코드가 찍는 값과 공백만 달라 설계 문서 8-1 이 고치라고 한 블록 1개(instrumental-variables 둘째)는 표시 줄 끝에 `old=run` 을 붙인다. 도우미는 그 블록의 찍힌 줄 비교를 건너뛰고, 그 찍힌 줄은 실행 검사가 본다.

**Tech Stack:** Python 3.9 표준 라이브러리(로컬 `python3` 는 3.9.7 이고 numpy 1.26.4, scipy 1.11.4 도 있다), node 20, GitHub Actions(`runs-on: ubuntu-24.04` 고정, 파이썬 3.9), 브라우저 도구(Chrome DevTools MCP. Playwright MCP 는 연결되지 않는다).

**Spec:** `docs/superpowers/specs/2026-10-13-python-code-blocks-design.md` (5-3 예, 5-4 쓰는 규칙, 8-1 블록 상태, 8-2 묶음, 8-3 옮길 때 지킬 것). 꼴과 관례는 넷째 묶음 계획 `docs/superpowers/plans/2026-10-14-python-code-blocks-batch4.md` 를 따른다.

> 새 블록 42개의 전문은 태스크 앞의 「부록: 새 블록 42개」 절에 있다. 태스크는 그 뒤에 Task 1 부터 Task 6 까지 이어진다.

> 이 계획의 새 블록 42개, 도우미, 기대 출력은 계획을 쓸 때 저장소 사본에 그대로 적용해 돌려 본 것이다. 사본은 main `5e488fb`(넷째 묶음 계획 커밋)에 넷째 묶음 계획의 새 블록 44개와 「고칠 곳 다섯」을 그 계획의 도우미와 고침 명령으로 넣어, 넷째 묶음이 올라간 뒤의 상태(새 형식 120개, 옛 형식 127개, 48편)로 만든 것이다. CI 검사 12가지, 19편의 형식 검사와 실행 검사, 표준 라이브러리만 있는 파이썬 3.9 의 실행 검사, 파이썬 3.12 와 3.14 의 실행 검사, 1440, 1280, 1024, 390 폭의 배치 숫자, 390 폭의 숫자 줄바꿈 훑기가 통과했다. 같은 사본에서 Task 1~5 와 Task 6 Step 1, 5 의 셸 명령을 이 문서 그대로 돌려 기대 출력과 같았다. 넷째 묶음이 올라간 뒤에서 시작한다. Task 1 Step 1 이 이 상태를 먼저 본다.

## Global Constraints

- 공개 저장소다. 사내 시스템, 플랫폼 이름을 블록 안 글, 커밋 메시지 어디에도 쓰지 않는다.
- 이 묶음은 글만 옮긴다. 바꾸는 파일은 `posts/` 의 19편과 `scripts/code-blocks-baseline.json` 뿐이다. 검사, 시험, `js/`, `css/`, `.github/` 는 바꾸지 않는다.
- 블록 안 글(하는 일, 단계 제목, 풀이, 메모, 뜻)은 평서체 `~한다, ~이다` 로 쓴다. 숫자 뒤에 조사나 「이다」가 오면 한 칸 띄운다(`0.893 이고`, `3 을 곱해`). 개수를 세는 말은 붙인다(`4,556명`, `5건`). 원래 주석이 합쇼체인 블록(calibration, stats-confidence-interval-ttest)은 풀이와 뜻으로 옮길 때 평서체로 바꾼다. 줄 끝 주석과 docstring 은 코드 줄의 일부라 그대로 둔다.
- 해요체, `저희`, 가운뎃점, `실측`, `실체`, `축`, `가른다`, `갈린다`, 열하나 이상의 말로 쓴 숫자, 지어낸 말을 쓰지 않는다. 블록 안에 새 비유를 넣지 않는다. `node scripts/check-wording.js` 가 posts/ 의 코드 블록 안까지 센다. instrumental-variables 첫 블록의 줄 끝 주석 두 개에 「가른」이 있는데, 바꾸지 않는 코드 줄이라 그대로 둔다.
- 실행되는 코드 줄은 바꾸지 않는다(spec 8-3). 줄 끝 주석도 그대로 둔다. 원래 주석의 내용은 하는 일, 풀이, 메모, 뜻으로 나눠 옮기고 버리지 않는다.
- 블록 밖의 본문은 바꾸지 않는다(사용자 결정 「본문은 그대로 둔다」). 본문에서 찾은 사실 오류는 아래 「여쭤볼 것 후보」에 적는다. 사용자가 이 계획을 확인하며 고치기로 한 곳만 Task 5 Step 7 이 글 커밋 하나로 고치고, 나머지는 Task 6 확인 페이지의 「여쭤볼 것」에서 다시 묻는다.
- 표시 꼴은 spec 그대로다 — `# 하는 일: …`, `# N단계: …`, `# 출력:`, `# N단계 뜻: …` 또는 `# 뜻: …`. 이 묶음의 42개에는 상태 표시와 `# 출력 (…):` 머리가 없다. 한 단계가 찍은 줄을 뜻 여럿으로 나눌 때는 같은 번호의 뜻 줄을 이어 쓴다(spec 5-3 의 예와 같다).
- 실행 검사는 파이썬 3.9 로 돌린다(`python3 --version` 이 `Python 3.9.7`). 이 묶음의 블록은 3.12 와 3.14 에서도 같은 값을 찍는다(계획을 쓸 때 확인했다).
- 이 계획 문서는 Task 1 전에 `docs/superpowers/plans/2026-10-15-python-code-blocks-batch5.md` 로 커밋돼 있어야 한다. 임시 폴더 도구를 뽑는 명령과 글 옮기기 도우미가 이 파일을 읽는다.
- 이 계획의 코드 블록(네 백틱 울타리)은 손으로 옮겨 적지 않는다. 도우미가 부록을 그대로 읽는다. 리뷰에서 블록 글을 고칠 때만 Edit 로 고치고, 찾을 글은 파일에 꼭 한 번 있어야 한다.
- 커밋은 git 사용자 `chkimsu` 로 한다. 파일을 이름으로 stage 한다(`git add -A` 금지). 글 커밋 제목은 `feat(posts): 측정과 모델링 글 — …` 이나 `fix(posts): 측정과 모델링 글 — …` 로 시작한다. 마지막 줄은 그 커밋을 만든 모델의 Co-Authored-By 줄이다(예: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`).
- push 는 Task 6 에서 사용자 확인을 받은 뒤에만 한다. push 전에 `git fetch origin && git rebase origin/main` 을 한다(CI 가 sitemap 과 feed 를 다시 커밋한다).
- 임시 파일은 저장소 밖에 둔다. 아래 명령의 `$SCRATCH` 는 `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch5"; mkdir -p "$SCRATCH"` 로 정한다. 셸 변수는 명령마다 다시 정한다. 화면 그림은 저장소 안의 `.playwright-mcp/batch5/` 에 둔다(`.gitignore` 에 있다. 브라우저 도구는 저장소 밖에 그림을 쓰지 못한다). 서버는 8773 포트로 띄운다.

## Review Focus

1. **오래 도는 블록** — privacy-signal-loss 둘째 블록은 로컬에서 33초쯤, ctr-feature-engineering 첫 블록은 13초쯤 돈다. 이 묶음 앞에 CI 가 돌리던 표준 라이브러리 블록 가운데 가장 오래 걸린 것은 로컬에서 9초 아래였다(exploration-exploitation 셋째 블록 8.4초). 실행 검사는 블록마다 120초 안에 끝나야 한다(`scripts/check-python-outputs.py` 의 `TIMEOUT = 120`). Task 3 Step 4 와 Task 4 Step 4 가 두 글을 돌린 시간을 보고서에 적고, Task 6 Step 7 이 CI 의 글 검사가 통과하는지 본다. CI 에서 시간이 넘쳐 실패하면 코드를 바꾸지 말고 멈춰 알린다.
2. **CI 에 없는 라이브러리** — calibration 둘째, 셋째 블록(numpy)과 넷째 블록(numpy, scipy)은 CI 의 표준 라이브러리 파이썬에서 「라이브러리 없음」으로 건너뛴다. 실패가 아니라 건너뜀이어야 한다. 이 셋의 뜻 줄은 로컬 실행 검사만 본다. Task 1 Step 5 가 표준 라이브러리만 있는 venv 로 calibration 을 돌리고, Task 6 Step 1 이 `통과 151, 건너뜀 11 (라이브러리 없음 10, 실행 안 됨 1)` 을 본다.
3. **옛 출력과 공백만 다른 블록** — instrumental-variables 둘째 블록은 머리 줄의 공백만 옛 출력과 달라 도우미가 찍힌 줄을 견주지 않는다(`old=run`). 이 블록의 찍힌 줄을 지키는 것은 실행 검사 하나다. Task 2 Step 3 이 찍힌 줄 수(옛 출력 4줄, 새 블록 4줄)를 세고, 같은 태스크의 Step 4 가 실행 검사를 돌린다.
4. **본문이 블록의 단계를 말하는 글** — position-bias-ultr 본문은 이 블록을 두고 「코드는 딱 세 단계입니다. 1단계는 … 2단계는 … 3단계는 …」이라 쓴다. 새 블록은 그 세 단계를 1~3단계로 그대로 두고, 결과를 찍는 줄도 3단계에 둔다. 단계를 하나라도 더하면 본문과 어긋난다. Task 5 Step 3 이 단계 수를 센다. instrumental-variables 본문의 「1단계, 2단계」는 2SLS 의 단계라 블록 번호와 뜻이 다르지만, 본문이 「도구가 원인을 얼마나 세게 흔드는지(1단계의 힘)」처럼 풀어 써서 그대로 둔다.
5. **휴대폰 폭의 긴 찍힌 줄** — regression-discontinuity 의 밴드폭 줄, uplift-incrementality 의 누적점 줄, ctr-feature-engineering 의 ids 배열처럼 아주 긴 찍힌 줄이 390 폭에서 옆으로 넘치거나 숫자 중간에서 끊기면 안 된다. Task 1 Step 7 이 첫 글을 네 폭으로 재고, Task 6 Step 2 가 글 전부를 390 폭으로 훑는다.

## 이 계획에서 정한 것

| 정한 것 | 왜 | 틀렸다면 |
|---|---|---|
| 다섯째 묶음은 측정과 모델링 분류 19편(블록 42개)이다. 인과추론 5편(7개), 실험과 측정 5편(11개), 보정과 pCTR, pCVR 모델링 6편(17개), 평가와 모니터링 3편(7개)이다 | 사용자가 승인한 「검사나 코드 고침이 필요 없는 묶음은 20편 안팎, 트랙 둘까지」. 19편 모두 표준 라이브러리나 로컬의 numpy, scipy 로 돌고, 앞 블록이나 다른 글에 기대지 않는다 | 다음 묶음에 글을 더하거나 뺀다 |
| 첫 글은 calibration 이다 | 블록이 4개이고, CI 에서 건너뛰는 블록 셋, 마지막 코드 줄 뒤 주석을 옮긴 블록 둘, 단계 일곱의 블록, 합쇼체 주석을 평서체로 옮긴 블록이 다 있다 | 화면 확인 글만 바뀐다 |
| instrumental-variables 둘째 블록은 찍힌 줄을 돌려 받아 적는다. 표시 줄 끝의 `old=run` 이 도우미의 찍힌 줄 비교를 건너뛰게 한다 | spec 8-1 이 공백만 다른 이 블록을 찍힌 그대로 고치라고 한다(`   순응률   IV 추정치 평균` 이 찍히면 `   순응률       IV 추정치 평균`). 찍힌 줄은 실행 검사가 본다 | 찍힌 줄 한 줄 |
| 마지막 코드 줄 뒤의 주석 둘(calibration 둘째의 「대각선 위 = Under-confident, 아래 = Over-confident」, 넷째의 「서빙 시: calibrated_pCTR = …」)은 뜻 줄로 옮긴다 | 그 자리의 주석은 단계 풀이도 메모도 아니라 출력 영역 앞에 홀로 남는다 | 주석 두 줄 |
| `# --- N단계: … ---`, `# ── … ──`, `# (A) …` 꼴의 머리 주석은 단계 제목으로 바꾸고, 담긴 말은 풀이에 남긴다. 머리 주석이 없던 블록은 읽는 사람이 나눠 읽을 자리마다 단계를 새로 둔다 | spec 8-3 「`# 1. …` 과 `# --- N단계: … ---` 꼴의 주석은 `# N단계:` 로」, spec 5-4 「단계는 읽는 사람이 나눠 읽을 자리에만」 | 주석 몇 줄 |
| calibration 첫 블록은 원래 단계 다섯 앞에 「가상 후보 5개를 둔다」, 「eCPM 으로 줄 세우는 함수를 만든다」를 더해 단계가 일곱이다. 원래 1~5단계는 3~7단계가 된다 | 데이터와 함수 30줄을 설명 칸이 빈 행으로 두지 않으려고. 본문은 이 블록의 단계 번호를 말하지 않는다 | 단계 제목 두 줄 |
| position-bias-ultr 는 원래 세 단계를 그대로 둔다. 원래 1단계 주석 앞에 있던 `simulate_clicks` 는 1단계에 넣는다 | 본문이 「코드는 딱 세 단계」라 부른다(Review Focus 4) | 단계 줄 하나 |
| 한 단계가 찍은 줄이 길면 뜻을 여럿으로 나누고, 같은 번호의 뜻 줄을 이어 쓴다 | spec 5-3 의 예가 같은 번호의 뜻 둘을 쓴다. 실행 검사는 찍힌 줄마다 찍은 단계를 견주니 번호만 맞으면 된다 | 뜻 줄 몇 개 |
| 코드가 해설을 직접 찍는 줄(model-ab-testing 세 블록, conversion-definition 둘째와 셋째, cold-start-pctr 둘째와 셋째의 「읽는 법」, 「→ …」 줄)에는 「코드가 찍는 해설이다」로 시작하는 한 줄 뜻을 붙인다 | 뜻 줄 없이 찍힌 줄은 둘 수 없다(spec 5-4). 찍힌 해설을 되풀이하지 않으려고 한 줄 요약만 둔다 | 뜻 줄 몇 개 |
| 「표준 라이브러리만 쓴다」와 「시드 고정」은 1단계 풀이에 남긴다 | spec 8-3 내용 보존. 글마다 적힌 자리가 달랐다 | 풀이 한 줄 |
| 합쇼체 주석(calibration, stats-confidence-interval-ttest)은 풀이와 뜻으로 옮길 때 평서체로 바꾼다. 줄 끝 주석과 docstring 은 코드라 그대로 둔다 | spec 5-4 「블록 안의 글은 평서체」 | 풀이 몇 줄 |
| 뜻 줄은 그 아래 찍힌 줄에 보이는 값만, 찍힌 꼴 그대로 쓴다(`+- 19.6%`, `10000`, `12.9 Gbps`) | 둘째 묶음 리뷰가 찾은 블록 설명 오류가 모두 계획 부록의 글에서 왔다 | 뜻 줄 몇 개 |
| cold-start-pctr 셋째 블록의 적률법 식(평균 m, 분산 v, 강도 s)은 1단계 풀이가 아니라 `s = m * (1 - m) / v - 1` 줄 앞의 메모로 옮긴다 | 260px 설명 칸에서는 식이 여러 줄로 끊긴다. 그 식을 계산하는 줄 옆이 읽기 쉽다 | 메모 한 줄 |
| 블록 안에 새 비유를 넣지 않는다 | 사용자 결정 「비유는 쓰지마」 | 풀이 한 줄 |
| 글 커밋 머리는 `feat(posts): 측정과 모델링 글 —` 와 `fix(posts): 측정과 모델링 글 —` 이고, 올리기 직전에 하나로 합친다 | 넷째 묶음과 같다 | 합치기를 건너뛰고 그대로 올린다 |
| push 는 사용자가 `! git push origin main` 으로 한다 | 앞 묶음들에서 자동 권한 검사가 `git push` 를 막았다 | 사용자에게 부탁하는 줄 하나 |
| 화면 확인은 Chrome DevTools MCP 로 하고, 390 폭은 숨긴 iframe 으로 잰다. 서버는 8773 포트다 | Playwright MCP 가 연결되지 않는다. 창은 500px 아래로 줄지 않는다. 8772 는 넷째 묶음이 썼다 | 도구와 포트만 바뀐다 |

## 파일 지도

| 파일 | 맡는 일 | 태스크 |
|---|---|---|
| `posts/calibration.md` | 블록 4개 | 1 |
| `posts/causal-inference-101.md`, `posts/rct-randomized-experiment.md`, `posts/difference-in-differences.md`, `posts/instrumental-variables.md`, `posts/regression-discontinuity.md` | 블록 1, 2, 1, 2, 1개 | 2 |
| `posts/uplift-incrementality.md`, `posts/stats-confidence-interval-ttest.md`, `posts/model-ab-testing.md`, `posts/attribution-basics.md`, `posts/privacy-signal-loss.md` | 블록 2, 2, 3, 2, 2개 | 3 |
| `posts/pctr-prediction.md`, `posts/pCVR-modeling.md`, `posts/conversion-definition.md`, `posts/cold-start-pctr.md`, `posts/ctr-feature-engineering.md` | 블록 1, 2, 3, 3, 4개 | 4 |
| `posts/offline-metrics-gauc.md`, `posts/position-bias-ultr.md`, `posts/model-monitoring.md` | 블록 2, 1, 4개 | 5 |
| `posts/rct-randomized-experiment.md`, `posts/regression-discontinuity.md`, `posts/model-ab-testing.md` | 「여쭤볼 것 후보」 가운데 사용자가 고치기로 한 곳. 한 편에 한 줄씩 | 5 (Step 7) |
| `scripts/code-blocks-baseline.json` | 127개 48편 → 123개 47편 → 116개 42편 → 105개 37편 → 92개 32편 → 85개 29편 | 1~5 |
| `$SCRATCH/migrate_batch5.py`, `$SCRATCH/nocache_server.py` | 글 옮기기 도우미와 캐시 없는 서버. 저장소에 넣지 않는다 | 1~6 |

글 파일 이름과 글 id 가 다른 글이 하나 있다. 도우미와 `--post` 는 파일 이름을, 화면의 `post.html?id=` 는 id 를 쓴다.

| 파일 이름 | 글 id |
|---|---|
| `pCVR-modeling` | `pcvr-modeling` |

## 뺀 글과 넘긴 항목

| 무엇 | 블록 | 왜 | 어디서 |
|---|---|---|---|
| 측정과 모델링의 딥 CTR 모델 글 6편(deep-ctr-models, behavior-sequence-attention, din-architecture, dcn-vs-din-slot, multi-task-learning, negative-sampling-bias) | 5, 6, 1, 1, 3, 7 | deep-ctr-models 는 긴 글이라 배치 읽기와 쓰기 묶기가 필요하다. negative-sampling-bias 는 다섯째 블록이 앞 블록에 이어서 돌고, 일곱째 블록은 적힌 출력이 찍히지 않아 spec 8-1 의 고침이 필요하다. 같은 주제라 한 묶음에 모은다 | deep-ctr-models 가 든 묶음 |
| 판단 트랙 3편(doubly-robust, feedback-loop-bias, feedback-loop-remedies) | 1, 3, 2 | feedback-loop-bias 둘째, 셋째 블록은 앞 블록에 이어서, feedback-loop-remedies 는 앞 글에 이어서 돌린다(C → B → A 사슬). 둘째 묶음부터 넘겨 온 일이다 | 판단 트랙이 든 묶음 |
| ML Infrastructure 8편, Software Engineering 4편 | 29, 7 | 분류가 둘 더 붙는다. ad-log-pipeline 의 pyspark 블록 2개와 data-engineer-first-six-months 의 cosmos_ext 블록 1개는 로컬에도 라이브러리가 없어 찍힌 줄을 실행 검사로 확인할 수 없다 | 다음 글만 옮기는 묶음 |
| 타겟팅 3편과 카카오 광고 시리즈 2편(audience-segmentation, lookalike-modeling, kakao-ads-prediction-targeting, kakao-ads-products, kakao-ads-bidding-measurement) | 2, 2, 1, 1, 2 | audience-segmentation 첫 블록은 없는 파일을 읽어 「그대로 실행되지 않습니다」 표시가 필요하고, lookalike-modeling 둘째 블록은 `[82]` 가 `[83]` 으로 찍혀 다시 돌려 고치고 본문 숫자를 맞춰야 한다(spec 8-1). 카카오 시리즈는 셋을 한 묶음에 모은다 | 타겟팅 분류가 든 묶음 |
| 인터뷰 3편(interview-experiment-metrics, interview-ml-modeling, interview-system-design) | 5, 4, 3 | 별도 출력 블록 12개를 블록 안으로 옮겨야 한다 | 인터뷰 글이 든 묶음 |
| 새 블록 글의 자체 확인(뜻 줄 값, 하는 일과 단계, 옛 주석의 말) | — | 둘째 묶음에서 배운 것 | 아래 「부록 자체 확인」 |

다섯째 묶음 뒤에 남는 것은 옛 형식 블록 85개, 글 29편이다.

## 여쭤볼 것 후보

글 19편을 블록마다 읽으며 찾은 사실 오류다. 셋 다 블록 밖 본문이다. 이 계획은 고치지 않는다. 사용자가 계획을 확인하며 고치기로 한 곳만 Task 5 Step 7 이 글 커밋 하나로 고친다. 고칠 글은 아래 「고칠 글」 칸 그대로이고, 도우미를 쓰지 않는다. 고치지 않기로 한 곳은 Task 6 확인 페이지의 「여쭤볼 것」에 다시 올린다. 사용자는 계획을 확인하며 셋 다 고치기로 했다(Task 5 Step 7 의 `FIX` 목록 그대로).

| 어디 | 지금 적힌 것 | 맞는 것 | 고칠 글 |
|---|---|---|---|
| rct-randomized-experiment, 5절 시뮬레이션 블록 바로 뒤 둘째 문단 | 「유의 비율이 80.5%에서 50.8%로 반토막 났다.」 | 50.8% 는 80.5% 의 63% 다. 줄어든 폭은 29.7%p 다. 바로 뒤 문장의 「거의 동전 던지기 수준」은 맞다 | 「유의 비율이 80.5%에서 50.8%로 30%p 가까이 떨어졌다.」 |
| regression-discontinuity, 4절 밴드폭 블록 바로 뒤 둘째 문단 | 「대신 sd는 단순평균차보다 항상 조금 더 크다.」 | h=±2.00 까지는 local-linear 의 sd 가 더 크다(±0.05 에서 0.043 대 0.021 로 두 배다). h=±3.00 에서는 둘 다 0.006 으로 찍히고, 찍는 자리만 늘려 같은 난수로 다시 돌리면 local-linear 0.00599, 단순평균차 0.00613 으로 오히려 작다 | 「대신 sd는 h=±2.00까지 단순평균차보다 크고, h=±3.00에서야 둘 다 0.006으로 같아진다.」 |
| model-ab-testing, 1절 블록 바로 뒤 넷째 문단 | 「B가 노출마다 12% 더 비싸게 사니 같은 돈으로 살 수 있는 양이 적습니다.」 | 12% 는 입찰가다. 경매는 2등 가격으로 경쟁가를 내게 해서, 노출 1건 비용(찍힌 지출 ÷ 낙찰)은 ① 에서 A 0.696원, B 0.746원으로 7.2% 높고 ② 에서도 7.2% 높다 | 「B가 입찰가를 12% 높게 불러 노출 1건을 7% 남짓 더 비싸게 사니 같은 돈으로 살 수 있는 양이 적습니다.」 |

## 부록 자체 확인

계획을 쓰며 블록마다 돌린 확인이다.

- 뜻 줄 110개(블록 42개, 모두 찍는 것이 있다)의 숫자 487개를 그 아래 찍힌 줄에서 찾았다. 찍힌 줄에 없는 값은 0개다. 처음 쓴 글 가운데 넷이 찍힌 줄에 없어 고쳤다. stats-confidence-interval-ttest 첫 블록의 「95% 구간이 약속한 비율」은 「구간 이름이 약속한 비율」로, ctr-feature-engineering 둘째 블록의 「빈 17자리」는 「나머지 자리」로 바꿨다. offline-metrics-gauc 첫 블록 5단계 뜻의 「0.7778 보다 0.1778 낮다」는 그 값이 4단계 묶음에 찍혀 「한 통에 섞어 잰 점수보다 낮다」로, uplift-incrementality 첫 블록의 「4만 명」은 「노출 38,026명」으로 바꿨다.
- 하는 일 42줄과 단계 풀이를 단계마다 맞춰 읽었다. difference-in-differences 의 「평행추세가 성립할 때와 깨질 때 단순 비교 둘과 DiD 가」는 시나리오 B 가 DiD 만 찍어서 「평행추세가 깨지면 DiD 가 얼마나 틀리는지 본다」로 나눴다. model-ab-testing 첫 블록 1단계 풀이의 「같은 요청을 받고」는 그룹마다 요청을 절반씩 받아 「시간당 같은 수의 요청을 받고」로 바꿨다. calibration 넷째 블록의 「hold-out 데이터로 맞춘다」는 코드가 데이터를 나누지 않아 「실무에서는 … 맞춘다」로 바꿨다.
- 옛 주석 줄마다 그 낱말이 새 블록(하는 일, 풀이, 메모, 뜻)에 남았는지 견줬고, 덜 남은 줄은 하나씩 읽었다. 처음 쓴 글에서 빠졌던 「Over-confident」(calibration 넷째), 「도구의 힘」(instrumental-variables 둘째), 「컷 양옆으로 얼마나 넓게 볼지」와 트레이드오프(regression-discontinuity), 「더 잘 고르는 동시에 더 많이 사는」(model-ab-testing 첫째), 「몇 번 연달아 위반해야 부를까」(model-monitoring 넷째), `p_half`(pctr-prediction)를 되살렸다.
- 숫자 뒤 조사 띄어 쓰기를 블록 안 글 전부에서 훑었다. 처음 쓴 글의 `0.5를`, `3을`, `1을`, `0에서 1로`, `1에 가까울수록` 을 띄웠다.
- 쓰지 않는 낱말은 0개다. 처음 쓴 ctr-feature-engineering 넷째 블록 뜻의 「미리 구워 두면」은 말투 검사의 지어낸 말에 걸려 「미리 계산해 두면」으로 바꿨다. 새 블록 42개 전부(바꾸지 않는 코드 줄 포함)에 가운뎃점이 없다.
- 새 블록 42개를 저장소 사본에 도우미로 넣었다. CI 검사 12가지가 통과했다(형식 검사 새 형식 162개, 옛 형식 85개, 문제 0건, 실행 검사 통과 161, 실행 안 됨 1). 표준 라이브러리만 있는 파이썬 3.9 로는 통과 151, 건너뜀 11 이다(넷째 묶음보다 numpy, scipy 블록 3개가 더 건너뛴다). 파이썬 3.12 와 3.14 로도 19편이 모두 통과했다.
- 도우미는 sha, 코드 줄, 찍힌 줄이 하나라도 다르면 글을 그대로 두고 멈춘다(셋 다 시험했다. 넷째 묶음 도우미와 표시 줄 이름만 다르다).
- 네 폭에서 19편의 값 76개가 모두 「블록 수 true 0 0 false 0 0 0」이었다. 390 폭 훑기는 108편, 숫자 3,581개, 넘침 0, 끊김 0 이다.
- 본문 단락을 블록마다 읽어 숫자를 찍힌 줄과 맞췄다. 맞지 않는 세 곳을 「여쭤볼 것 후보」에 적었다. 표나 문장이 블록이 찍지 않는 값을 말하는 곳(causal-inference-101 표 ①의 구매율, privacy-signal-loss 의 「상위 1% 구매가 매출의 9.2%」, uplift-incrementality 의 「절반가량이 헛짚었다」, stats-confidence-interval-ttest 의 「다섯 번 모두 클릭이 423건에서 442건」, model-monitoring 의 「절반쯤 울린다」)은 저장소 밖 사본에서 같은 난수로 따로 셌고, 모두 맞았다.
- 블록마다 돈 시간을 쟀다(Review Focus 1). 42개를 한 번씩 돌리는 데 로컬에서 68초 걸렸다.

---

## 부록: 새 블록 42개

Task 1~5 의 도우미가 이 절을 읽는다(태스크 설명에 넣지 않으려고 태스크 앞에 둔다). 블록마다 `<!-- cb5 post=<글 파일 이름> block=<0부터 센 파이썬 블록 번호> sha=<원본 블록 sha256 앞 16자> -->` 줄 바로 아래 네 백틱 울타리 안이 새 블록 전체다. 표시 줄 끝의 ` old=run` 은 찍힌 줄을 돌려서 받아 적은 블록이라는 표시다(1개). 표시 줄과 울타리 모양을 바꾸지 않는다. 블록 제목의 번호는 1부터 센다. 부록 번호는 태스크 차례다.

### 부록 1: calibration (블록 4개, Task 1)

#### 블록 1

<!-- cb5 post=calibration block=0 sha=0d89bfe744bff26d -->
````python
# 하는 일: 광고 후보 5개를 모델 pCTR 로 줄 세울 때, 보정하지 않을 때와 전체 COPC 로 보정할 때, 지면별로 보정할 때의 1등과 노출 1,000회 실제 매출을 견준다.

# 1단계: 가상 후보 5개를 둔다
# 한 번의 노출 기회에 광고 후보 5개가 들어오고, 하나만 보여 줄 수 있다. 각 행은 (광고, 지면 세그먼트, 모델이 내놓은 pCTR, 나중에 확인된 실제 CTR, CPC 입찰가(원))이다. 표준 라이브러리만 쓴다.
CANDIDATES = [
    ("A", "앱 하단 배너", 0.024, 0.015, 300),
    ("B", "웹 인피드",   0.012, 0.014, 500),
    ("C", "앱 인피드",   0.010, 0.020, 400),
    ("D", "웹 상단 배너", 0.018, 0.016, 350),
    ("E", "앱 리워드",   0.020, 0.010, 250),
]
IMPRESSIONS = 1000              # 이 지면에 노출 기회가 1,000회 있다고 가정
DAILY_IMPRESSIONS = 10_000_000  # 서비스 전체 하루 노출 규모 (환산용)

CPC = {ad: cpc for ad, _s, _p, _r, cpc in CANDIDATES}    # 광고별 클릭 단가
# '실제 CTR'은 로그가 충분히 쌓인 뒤에야 알 수 있는 값이다. 랭킹을 매기는 순간 손에 있는 건 모델 pCTR 뿐이고, 그게 이 문제의 핵심이다.
REAL = {ad: real for ad, _s, _p, real, _c in CANDIDATES}  # 광고별 실제 CTR


# 2단계: eCPM 으로 줄 세우는 함수를 만든다
# 플랫폼은 eCPM(노출 1,000회당 기대 매출)이 가장 큰 후보를 고른다. eCPM 계산의 상세는 eCPM 랭킹 글에 있고, 여기서는 '1등이 바뀌는가'만 본다.
def ranking(pctr_by_ad):
    """주어진 pCTR로 eCPM을 매겨 큰 순서대로 돌려줍니다.
    eCPM = pCTR x CPC x 1000. 클릭당 과금이라 pCTR을 곱해야 노출 가치가 됩니다."""
    board = [(pctr_by_ad[ad] * CPC[ad] * 1000, ad) for ad in pctr_by_ad]
    board.sort(reverse=True)    # 맨 앞이 1등
    return board


def show(title, board):
    """랭킹을 보기 좋게 출력합니다."""
    print(title)
    for i, (score, ad) in enumerate(board, 1):
        print(f"  {i}위 {ad}  eCPM {score:,.0f}원")


# 3단계: 후보별로 예측이 얼마나 틀렸는지 본다
# COPC(Click Over Predicted Click)는 실제 클릭 / 예측 클릭이다. 1보다 크면 실제가 더 많았으니 모델이 과소예측한 것이고, 1보다 작으면 과대예측한 것이다.
print("광고  모델pCTR  실제CTR   COPC  판정        지면")
pred_clicks = 0.0   # 예측 클릭 총합 (COPC의 분모)
real_clicks = 0.0   # 실제 클릭 총합 (COPC의 분자)
for ad, seg, pctr, real_ctr, _cpc in CANDIDATES:
    copc = real_ctr / pctr                    # 후보 하나의 COPC
    pred_clicks += IMPRESSIONS * pctr         # 노출 x 예측 CTR = 예측 클릭 수
    real_clicks += IMPRESSIONS * real_ctr     # 노출 x 실제 CTR = 실제 클릭 수
    verdict = "과소예측" if copc > 1 else "과대예측"
    print(f" {ad}   {pctr:6.2%}  {real_ctr:6.2%}  {copc:5.3f}  {verdict}    {seg}")

global_copc = real_clicks / pred_clicks       # 전체를 뭉쳐서 본 COPC
print(f"\n전체 COPC = {real_clicks:.0f} / {pred_clicks:.0f} = {global_copc:.3f}"
      f"  (1보다 작으니 전체적으로 과대예측)")
print(f"뒤집어 본 P/O Ratio = 예측/실제 = {1 / global_copc:.3f}")

# 4단계: 보정 없이 랭킹을 매긴다
raw = {ad: pctr for ad, _s, pctr, _r, _c in CANDIDATES}
board_raw = ranking(raw)
show("\n[보정 없음] eCPM 랭킹", board_raw)

# 5단계: 전체 COPC 로 한 번에 보정한다
# 가장 흔한 첫 시도다. 모든 예측에 같은 배수(global_copc)를 곱해 전체 평균만 맞춘다. 같은 배수를 곱하는 건 단조 변환이라 순서를 절대 바꾸지 못한다.
scaled = {ad: pctr * global_copc for ad, _s, pctr, _r, _c in CANDIDATES}
after = real_clicks / sum(IMPRESSIONS * p for p in scaled.values())
show(f"\n[전체 보정] 보정 후 전체 COPC = {after:.3f}  <- 지표는 완벽해졌다",
     ranking(scaled))

# 6단계: 지면 세그먼트별로 보정한다
# 지면마다 틀리는 방향이 달랐으니 지면별 배수를 따로 쓴다. 이 예시는 세그먼트마다 광고가 하나씩이라 보정값이 곧 실제 CTR 이 된다. 실제로는 한 세그먼트에 광고가 수천 개 있고, 세그먼트 배수는 그 평균 오차만 걷어낸다.
by_segment = {ad: pctr * (REAL[ad] / pctr) for ad, _s, pctr, _r, _c in CANDIDATES}
board_seg = ranking(by_segment)
show("\n[세그먼트별 보정] eCPM 랭킹", board_seg)

# 7단계: 1등이 바뀐 만큼의 손해를 돈으로 센다
# 그래서 얼마 손해인가를 본다. 뽑힌 광고가 다르면 실제로 들어오는 돈도 달라진다. 실제 매출은 노출 수 x 실제 CTR x CPC 로, 예측이 아니라 실제 CTR 로 계산한다.
bad = board_raw[0][1]    # 보정 안 하고 뽑은 1등
good = board_seg[0][1]   # 제대로 보정하고 뽑은 1등
rev_bad = IMPRESSIONS * REAL[bad] * CPC[bad]
rev_good = IMPRESSIONS * REAL[good] * CPC[good]
gap = rev_good - rev_bad
print(f"\n1등 비교: 보정 없음 → {bad} / 세그먼트 보정 → {good}")
print(f"노출 1,000회 실제 매출: {bad} {rev_bad:,.0f}원 vs {good} {rev_good:,.0f}원")
print(f"차이 {gap:,.0f}원 = {gap / rev_good:.1%} 손실")
print(f"하루 {DAILY_IMPRESSIONS:,}회 노출이면 {gap / IMPRESSIONS * DAILY_IMPRESSIONS:,.0f}원/일")

# 출력:
# 3단계 뜻: COPC 가 1보다 작은 A, D, E 는 과대예측, 1보다 큰 B, C 는 과소예측이다. 다섯을 뭉치면 실제 클릭 75 에 예측 클릭 84 라 전체 COPC 는 0.893 이고, 뒤집은 P/O Ratio 는 1.120 이다.
# 광고  모델pCTR  실제CTR   COPC  판정        지면
#  A    2.40%   1.50%  0.625  과대예측    앱 하단 배너
#  B    1.20%   1.40%  1.167  과소예측    웹 인피드
#  C    1.00%   2.00%  2.000  과소예측    앱 인피드
#  D    1.80%   1.60%  0.889  과대예측    웹 상단 배너
#  E    2.00%   1.00%  0.500  과대예측    앱 리워드
#
# 전체 COPC = 75 / 84 = 0.893  (1보다 작으니 전체적으로 과대예측)
# 뒤집어 본 P/O Ratio = 예측/실제 = 1.120
# 4단계 뜻: 보정하지 않으면 A 가 eCPM 7,200원으로 1위, C 가 4,000원으로 5위다.
#
# [보정 없음] eCPM 랭킹
#   1위 A  eCPM 7,200원
#   2위 D  eCPM 6,300원
#   3위 B  eCPM 6,000원
#   4위 E  eCPM 5,000원
#   5위 C  eCPM 4,000원
# 5단계 뜻: 전체 COPC 는 1.000 으로 맞았지만 eCPM 이 모두 같은 비율로 줄어 순서는 A, D, B, E, C 그대로다. 지표는 완벽해졌는데 1위는 여전히 A 다.
#
# [전체 보정] 보정 후 전체 COPC = 1.000  <- 지표는 완벽해졌다
#   1위 A  eCPM 6,429원
#   2위 D  eCPM 5,625원
#   3위 B  eCPM 5,357원
#   4위 E  eCPM 4,464원
#   5위 C  eCPM 3,571원
# 6단계 뜻: 지면마다 따로 보정하면 C 가 eCPM 8,000원으로 1위가 되고, A 는 4,500원으로 4위로 내려간다.
#
# [세그먼트별 보정] eCPM 랭킹
#   1위 C  eCPM 8,000원
#   2위 B  eCPM 7,000원
#   3위 D  eCPM 5,600원
#   4위 A  eCPM 4,500원
#   5위 E  eCPM 2,500원
# 7단계 뜻: 노출 1,000회에 A 를 보이면 실제 매출이 4,500원, C 를 보였다면 8,000원이다. 3,500원, 곧 C 매출의 43.8% 를 잃고, 하루 10,000,000회 노출이면 35,000,000원이다.
#
# 1등 비교: 보정 없음 → A / 세그먼트 보정 → C
# 노출 1,000회 실제 매출: A 4,500원 vs C 8,000원
# 차이 3,500원 = 43.8% 손실
# 하루 10,000,000회 노출이면 35,000,000원/일
````

#### 블록 2

<!-- cb5 post=calibration block=1 sha=c29a72d2c64e0e6c -->
````python
# 하는 일: 실제 CTR 3% 인 노출 10,000건에 그와 상관없는 예측을 붙이고, 예측을 10구간으로 나눠 구간마다 평균 예측과 실제 클릭 비율을 견준다.
import numpy as np

# 1단계: 구간마다 평균 예측과 실제 비율을 내는 함수를 만든다
# 예측을 [0, 0.1), [0.1, 0.2), … 10구간으로 나누고, 비어 있는 구간은 건너뛴다. 이 쌍을 점으로 찍은 것이 보정 그림(Reliability Diagram)이다.
def reliability_diagram_data(y_true, y_prob, n_bins=10):
    """Reliability Diagram 데이터: (평균 예측, 실제 비율) 쌍"""
    bin_edges = np.linspace(0, 1, n_bins + 1)
    centers, accs, counts = [], [], []
    for i in range(n_bins):
        mask = (y_prob >= bin_edges[i]) & (y_prob < bin_edges[i + 1])
        if mask.sum() == 0:
            continue
        centers.append(y_prob[mask].mean())
        accs.append(y_true[mask].mean())
        counts.append(mask.sum())
    return centers, accs, counts

# 2단계: 과대예측하는 모델의 예측을 만들어 구간마다 찍는다
# 실제 클릭은 3% 확률로 뽑고, 예측은 그와 상관없이 Beta(2, 50) 에서 뽑는다. 예측 평균이 실제보다 높은 과대예측(Over-confident) 모델이다.
np.random.seed(42)
y_true = np.random.binomial(1, 0.03, size=10000)
y_prob = np.clip(np.random.beta(2, 50, size=10000), 0, 1)

centers, accs, counts = reliability_diagram_data(y_true, y_prob)
for c, a, n in zip(centers, accs, counts):
    gap = "Over ↓" if c > a else "Under ↑"
    print(f"  예측={c:.3f}  실제={a:.3f}  (n={n:,})  {gap}")

# 출력:
# 2단계 뜻: 두 구간 모두 평균 예측(0.036, 0.120)이 실제 비율(0.026, 0.032)보다 높아 Over 다. 보정 그림에서 점이 대각선 아래에 앉는 과대예측이고, 대각선 위에 뜨면 Under 다. 예측 0.120 인 280건은 실제가 0.032 라 차이가 가장 크다.
#   예측=0.036  실제=0.026  (n=9,720)  Over ↓
#   예측=0.120  실제=0.032  (n=280)  Over ↓
````

#### 블록 3

<!-- cb5 post=calibration block=2 sha=dc669471ef9b10e2 -->
````python
# 하는 일: 실제 CTR 2% 인 노출 10,000건에 과대예측한 예측을 붙이고, 구간마다 예측과 실제의 차이를 샘플 수로 가중 평균한 ECE 를 잰다.
import numpy as np

# 1단계: ECE 를 구하는 함수를 만든다
# 예측을 10구간으로 나눠 구간마다 |실제 양성 비율 - 평균 예측 확률| 을 구하고, 구간의 샘플 비율을 곱해 더한다.
def expected_calibration_error(y_true, y_prob, n_bins=10):
    """ECE: 예측 확률과 실제 비율의 가중 평균 차이"""
    bin_edges = np.linspace(0, 1, n_bins + 1)
    ece = 0.0
    for i in range(n_bins):
        mask = (y_prob >= bin_edges[i]) & (y_prob < bin_edges[i + 1])
        if mask.sum() == 0:
            continue
        bin_acc = y_true[mask].mean()    # 실제 양성 비율
        bin_conf = y_prob[mask].mean()   # 평균 예측 확률
        ece += (mask.sum() / len(y_true)) * abs(bin_acc - bin_conf)
    return ece

# 2단계: 과대예측하는 모델로 ECE 를 잰다
# 예측은 실제와 상관없이 Beta(2, 30) 에서 뽑는다. 평균이 2% 보다 높은 과대예측(Over-confident) 모델이다.
np.random.seed(42)
y_true = np.random.binomial(1, 0.02, size=10000)   # 실제 CTR 2%
y_prob = np.clip(np.random.beta(2, 30, size=10000), 0, 1)

print(f"  ECE = {expected_calibration_error(y_true, y_prob):.4f}")
print(f"  (0에 가까울수록 보정이 잘 된 모델)")

# 출력:
# 2단계 뜻: ECE 가 0.0443 이다. 구간마다 예측과 실제의 차이를 샘플 수로 가중 평균한 값이 이만큼이고, 0 에 가까울수록 보정이 잘 된 모델이다.
#   ECE = 0.0443
#   (0에 가까울수록 보정이 잘 된 모델)
````

#### 블록 4

<!-- cb5 post=calibration block=3 sha=b9d33ea8d689eff0 -->
````python
# 하는 일: 과대예측하는 모델의 logit 5,000개에 Platt Scaling 의 A, B 를 학습하고, 보정 전후 평균 예측을 실제 양성 비율과 견준다.
import numpy as np
from scipy.optimize import minimize
from scipy.special import expit  # sigmoid

# 1단계: NLL 을 최소로 하는 A, B 를 찾는 함수를 만든다
# 보정된 확률은 q = sigmoid(A x logit + B) 이다. 실무에서는 모델 학습에 쓰지 않은 hold-out 데이터로 맞춘다.
def platt_scaling_fit(logits, y_true):
    """Platt Scaling: NLL 최소화로 A, B 학습"""
    def nll(params):
        A, B = params
        q = expit(A * logits + B)           # q = sigmoid(A * f(x) + B)
        q = np.clip(q, 1e-7, 1 - 1e-7)
        return -np.mean(y_true * np.log(q) + (1 - y_true) * np.log(1 - q))
    return minimize(nll, x0=[1.0, 0.0], method="L-BFGS-B").x

# 2단계: 과대예측하는 모델의 logit 을 만든다
# 실제 확률은 sigmoid(0.7 x logit) 이라, 모델이 내놓는 sigmoid(logit) 은 실제보다 양 끝으로 치우친 과대예측(Over-confident)이다.
np.random.seed(42)
logits = np.random.randn(5000) * 0.5
y_true = (np.random.rand(5000) < expit(logits * 0.7)).astype(float)

# 3단계: A, B 를 학습하고 보정 전후 평균을 견준다
A, B = platt_scaling_fit(logits, y_true)
print(f"  학습된 파라미터: A={A:.3f}, B={B:.3f}")
print(f"  보정 전 평균 예측: {expit(logits).mean():.4f}")
print(f"  보정 후 평균 예측: {expit(A * logits + B).mean():.4f}")
print(f"  실제 양성 비율:    {y_true.mean():.4f}")

# 출력:
# 3단계 뜻: A=0.761 로 logit 을 줄여 양 끝으로 치우친 예측을 가운데로 당긴다. 보정 전 평균 예측 0.5007 이 보정 후 0.5158 이 되어 실제 양성 비율 0.5158 과 같아졌다. 서빙할 때는 calibrated_pCTR = sigmoid(A x model_logit + B) 로 쓴다.
#   학습된 파라미터: A=0.761, B=0.063
#   보정 전 평균 예측: 0.5007
#   보정 후 평균 예측: 0.5158
#   실제 양성 비율:    0.5158
````

### 부록 2: causal-inference-101 (블록 1개, Task 2)

#### 블록 1

<!-- cb5 post=causal-inference-101 block=0 sha=7006ff02ed0501b7 -->
````python
# 하는 일: 노출이 구매 의향 높은 층에 쏠린 가짜 캠페인 20만 명으로, naive 비교와 층별 보정, 무작위 배정 시뮬레이션이 잰 광고 효과를 견준다.
import random
random.seed(42)

# 1단계: 가짜 캠페인의 설정을 둔다
# 유저는 '원래 구매 의향' 높음/낮음 두 층으로 나뉜다. 광고가 실제로 올리는 구매율은 두 층이 같다. 표준 라이브러리만 쓴다.
N = 200_000                        # 전체 유저 수
HIGH_SHARE = 0.2                   # 의향 높은 층 비중 20%
BASE_HIGH, BASE_LOW = 0.20, 0.04   # 광고가 없었을 때 각 층의 '원래' 구매율
TRUE_LIFT = 0.02                   # 광고가 실제로 올리는 구매율(참값, 두 층 동일)

# 2단계: 유저를 만들고 구매율 차이를 재는 함수를 만든다
# make_users 는 층별 노출 확률만 받아 유저를 만든다. gap 은 노출군과 비노출군의 구매율 차이와 두 군의 인원을 돌려준다.
def make_users(p_expose_high, p_expose_low):
    """층별 노출 확률만 받아 유저 (의향, 노출여부, 구매여부) 리스트를 만든다."""
    rows = []
    for _ in range(N):
        high = random.random() < HIGH_SHARE
        exposed = random.random() < (p_expose_high if high else p_expose_low)
        p_buy = (BASE_HIGH if high else BASE_LOW) + (TRUE_LIFT if exposed else 0.0)
        rows.append((high, exposed, random.random() < p_buy))
    return rows

def rate(rows):
    return sum(r[2] for r in rows) / len(rows) if rows else 0.0

def gap(rows):
    """노출군 구매율 - 비노출군 구매율."""
    e = [r for r in rows if r[1]]
    c = [r for r in rows if not r[1]]
    return rate(e) - rate(c), len(e), len(c)

# 3단계: 노출이 쏠린 관측 데이터로 naive 와 층별 보정 효과를 구한다
# 타겟팅 탓에 광고 노출은 의향 높은 층에 쏠린다(교란). 관측 데이터는 그 상태 그대로다(90% vs 10%). 층별 보정은 층 안에서 비교한 차이를 인구 비중으로 가중평균한다.
obs = make_users(p_expose_high=0.9, p_expose_low=0.1)

naive_gap, n_exp, n_unexp = gap(obs)                     # (a) 층을 무시하고 그냥 비교

layers = {"의향 높음": [r for r in obs if r[0]], "의향 낮음": [r for r in obs if not r[0]]}
layer_gaps = {name: gap(rows) for name, rows in layers.items()}
weights = [len(rows) for rows in layers.values()]
stratified_gap = sum(g[0] * w for g, w in zip(layer_gaps.values(), weights)) / sum(weights)  # (b)

# 4단계: 노출을 무작위로 다시 배정해 참값을 구한다
# 노출되는 비율은 그대로 두고, 누가 노출되는지만 무작위로 바꾼다.
p_rct = n_exp / N                                          # 같은 노출 비율을 유지한 채 배정만 랜덤화
rct = make_users(p_expose_high=p_rct, p_expose_low=p_rct)   # 노출이 의향과 무관해진다
rct_gap, _, _ = gap(rct)                                    # (c) 무작위 배정 시뮬레이션 참값

# 5단계: 층별 차이와 세 효과를 찍는다
for name, (g, ne, nc) in layer_gaps.items():
    print(f"[{name}] 노출 {ne:,}명 / 비노출 {nc:,}명, 차이 {g*100:+.1f}%p")
print(f"[전체, naive] 노출 {n_exp:,}명 / 비노출 {n_unexp:,}명, 차이 {naive_gap*100:+.1f}%p")
print()
print(f"(a) naive 효과          {naive_gap*100:+.2f}%p")
print(f"(b) 층별 보정 효과       {stratified_gap*100:+.2f}%p")
print(f"(c) RCT 시뮬레이션 참값  {rct_gap*100:+.2f}%p")
print(f"naive는 층별 보정 대비 {naive_gap/stratified_gap:.1f}배, RCT 참값 대비 {naive_gap/rct_gap:.1f}배 부풀렸다")

# 6단계: 결과를 스스로 검증한다
# naive 가 층별 보정의 3배를 넘는지, 층별 보정과 RCT 시뮬레이션이 참값에서 0.01 안쪽인지 본다.
assert naive_gap > stratified_gap * 3          # 착시가 몇 배 이상임을 스스로 검증
assert abs(stratified_gap - TRUE_LIFT) < 0.01   # 층별 보정은 참값 근처로 돌아온다
assert abs(rct_gap - TRUE_LIFT) < 0.01          # RCT 시뮬레이션도 참값 근처로 돌아온다

# 출력:
# 5단계 뜻: 층 안에서 비교하면 차이가 +1.6%p, +2.0%p 인데, 층을 무시하면 +12.7%p 로 튄다. 노출된 51,976명 가운데 35,827명이 원래 잘 사는 의향 높은 층이라서다.
# [의향 높음] 노출 35,827명 / 비노출 3,881명, 차이 +1.6%p
# [의향 낮음] 노출 16,149명 / 비노출 144,143명, 차이 +2.0%p
# [전체, naive] 노출 51,976명 / 비노출 148,024명, 차이 +12.7%p
#
# 5단계 뜻: 층별 보정 +1.90%p 와 RCT 시뮬레이션 +2.00%p 는 거의 같고, naive 는 그 둘보다 6.7배, 6.3배 부풀렸다.
# (a) naive 효과          +12.65%p
# (b) 층별 보정 효과       +1.90%p
# (c) RCT 시뮬레이션 참값  +2.00%p
# naive는 층별 보정 대비 6.7배, RCT 참값 대비 6.3배 부풀렸다
````

### 부록 3: rct-randomized-experiment (블록 2개, Task 2)

#### 블록 1

<!-- cb5 post=rct-randomized-experiment block=0 sha=e3be45bf9c704dcc -->
````python
# 하는 일: 기저 전환율 2.0% 에서 리프트별 필요 표본 수를 구하고, 참 리프트 +10% 인 홀드아웃 실험을 한 번 돌려 리프트, z값, p값을 계산한다.
import random, math
random.seed(7)

# 1단계: 리프트별 필요 표본 수를 구한다
# 양측 5% 유의수준과 검출력 80% 로, 상대 리프트를 잡는 데 필요한 집단당 인원을 표 ② 처럼 다시 구한다. 표준 라이브러리(random, math)만 쓰고 시드를 고정한다.
Z_ALPHA2 = 1.96    # 양측 5% 유의수준의 임계값
Z_BETA   = 0.8416  # 검출력 80%에 해당하는 값

def required_n(p0, lift, z_a2=Z_ALPHA2, z_b=Z_BETA):
    """기저 전환율 p0에서 상대 리프트를 잡는 데 필요한 집단당 표본 수."""
    p1 = p0 * (1 + lift)
    var_sum = p0 * (1 - p0) + p1 * (1 - p1)
    n = (z_a2 + z_b) ** 2 * var_sum / (p1 - p0) ** 2
    return p1, math.ceil(n)

P0 = 0.02   # 기저 전환율 2.0%

print("표2 재현 - 리프트별 필요 표본 수(집단당)")
for lift in (0.05, 0.10, 0.20):
    p1, n = required_n(P0, lift)
    print(f"  상대 리프트 +{lift:.0%}  ->  전환율 {p1:.2%}  ->  집단당 {n:,}명")

# 2단계: 참 리프트 +10% 실험을 한 번 돌린다
# 필요 표본 수만큼 유저를 모았다고 가정하고, 한 명씩 독립적으로 전환 여부를 굴린다.
TRUE_LIFT = 0.10
p1_true, n = required_n(P0, TRUE_LIFT)

def run_group(n, p):
    """n명에게 각각 독립적으로 전환 여부를 굴려 구매자 수를 센다."""
    return sum(1 for _ in range(n) if random.random() < p)

buy_control  = run_group(n, P0)       # 대조군: 광고 노출 없음
buy_treat    = run_group(n, p1_true)  # 처치군: 광고 노출

# 3단계: 리프트와 z값, p값을 구해 찍는다
p_c = buy_control / n
p_t = buy_treat / n
lift_obs = (p_t - p_c) / p_c

se = math.sqrt(p_c * (1 - p_c) / n + p_t * (1 - p_t) / n)   # 두 비율 차의 표준오차
z = (p_t - p_c) / se
p_value = 2 * (1 - 0.5 * (1 + math.erf(abs(z) / math.sqrt(2))))   # 양측 p값

print()
print(f"집단당 표본 수 n = {n:,}")
print(f"대조군 구매자   {buy_control:,}명 / {n:,}명  (전환율 {p_c:.3%})")
print(f"처치군 구매자   {buy_treat:,}명 / {n:,}명  (전환율 {p_t:.3%})")
print(f"관측 리프트     {lift_obs:+.1%}  (참값 +{TRUE_LIFT:.0%})")
print(f"z값             {z:.2f}")
print(f"p값             {p_value:.4f}")
print(f"유의(5% 기준)?  {'예' if p_value < 0.05 else '아니오'}")

# 출력:
# 1단계 뜻: 리프트가 클수록 필요한 인원이 빠르게 준다. +5% 는 집단당 315,207명, +10% 는 80,680명, +20% 는 21,106명이다.
# 표2 재현 - 리프트별 필요 표본 수(집단당)
#   상대 리프트 +5%  ->  전환율 2.10%  ->  집단당 315,207명
#   상대 리프트 +10%  ->  전환율 2.20%  ->  집단당 80,680명
#   상대 리프트 +20%  ->  전환율 2.40%  ->  집단당 21,106명
# 3단계 뜻: 80,680명씩 모은 실험 한 번에서 관측 리프트는 +11.5% 로 참값 +10% 와 조금 다르다. z값이 3.20, p값이 0.0014 라 5% 기준으로 유의하다.
#
# 집단당 표본 수 n = 80,680
# 대조군 구매자   1,599명 / 80,680명  (전환율 1.982%)
# 처치군 구매자   1,783명 / 80,680명  (전환율 2.210%)
# 관측 리프트     +11.5%  (참값 +10%)
# z값             3.20
# p값             0.0014
# 유의(5% 기준)?  예
````

#### 블록 2

<!-- cb5 post=rct-randomized-experiment block=1 sha=7389fd242d4f5424 -->
````python
# 하는 일: 같은 참 효과로 실험을 5,000번씩 되풀이해, 다섯 시나리오에서 |z| 가 1.96 이상으로 유의하게 나오는 비율(검출력)을 직접 센다.
import random, math
random.seed(11)

# 1단계: 실험 한 번의 유의 여부를 빠르게 흉내 내는 함수를 만든다
# 관측 전환율을 정규근사로 바로 뽑아 z값을 구한다. 같은 실험을 REPS 번 돌려 유의하게 나온 비율이 검출력이다. 표준 라이브러리(random, math)만 쓰고 시드를 고정한다.
Z_CRIT = 1.96      # 양측 5% 유의수준 임계값
REPS = 5000        # 반복 실험 횟수

def phat_sample(n, p):
    # 정규근사로 관측 전환율을 즉시 뽑는다 - 표본이 커서(np, n(1-p) 모두 충분히 큼)
    # 개인 단위로 n번씩 루프를 도는 것과 결과 분포가 사실상 같다(중심극한정리).
    return random.gauss(p, math.sqrt(p * (1 - p) / n))

def run_once(n, p0, p1):
    """실험 1회: 두 군의 관측 전환율로 z값을 구하고 유의 여부(|z|>=1.96)를 반환."""
    pc, pt = phat_sample(n, p0), phat_sample(n, p1)
    se = math.sqrt(pc * (1 - pc) / n + pt * (1 - pt) / n)
    z = (pt - pc) / se
    return abs(z) >= Z_CRIT

def power_of(n, p0, p1, reps=REPS):
    hits = sum(run_once(n, p0, p1) for _ in range(reps))
    return hits / reps

# 2단계: 다섯 시나리오를 둔다
# 표 ② 의 설계 표본 셋에, 10% 리프트용 표본을 절반만 쓴 경우와 참 효과가 0 인 A/A 를 더한다.
P0 = 0.02
N_5, N_10, N_20 = 315_207, 80_680, 21_106   # 표2에서 계산한 필요 표본 수

scenarios = [
    ("리프트 +5%,  설계 표본 그대로",   N_5,       P0, P0 * 1.05),
    ("리프트 +10%, 설계 표본 그대로",   N_10,      P0, P0 * 1.10),
    ("리프트 +20%, 설계 표본 그대로",   N_20,      P0, P0 * 1.20),
    ("리프트 +10%인데 표본은 절반만",   N_10 // 2, P0, P0 * 1.10),
    ("A/A (참 리프트 0%)",             N_10,      P0, P0),
]

# 3단계: 시나리오마다 5,000번 실험해 유의 비율을 찍는다
print(f"{REPS:,}회 반복 시뮬레이션 - |z|>=1.96로 '유의'가 나온 비율")
for label, n, p0, p1 in scenarios:
    power = power_of(n, p0, p1)
    print(f"  {label:<26} n={n:>7,}   유의 비율 {power:.1%}")

# 출력:
# 3단계 뜻: 설계 표본 그대로인 세 경우는 유의 비율이 80.3%, 80.5%, 79.8% 로, 표본 공식이 노린 검출력에 거의 그대로 맞는다.
# 5,000회 반복 시뮬레이션 - |z|>=1.96로 '유의'가 나온 비율
#   리프트 +5%,  설계 표본 그대로        n=315,207   유의 비율 80.3%
#   리프트 +10%, 설계 표본 그대로        n= 80,680   유의 비율 80.5%
#   리프트 +20%, 설계 표본 그대로        n= 21,106   유의 비율 79.8%
# 3단계 뜻: 표본을 40,340명으로 줄이면 같은 +10% 효과도 50.8% 만 유의하게 잡힌다. 참 리프트가 0% 인 A/A 도 5.1% 는 유의하게 나온다.
#   리프트 +10%인데 표본은 절반만         n= 40,340   유의 비율 50.8%
#   A/A (참 리프트 0%)             n= 80,680   유의 비율 5.1%
````

### 부록 4: difference-in-differences (블록 1개, Task 2)

#### 블록 1

<!-- cb5 post=difference-in-differences block=0 sha=daf1ab6426aa1409 -->
````python
# 하는 일: 대리점 60곳씩인 두 지역의 다섯 달 매출을 만들어, 평행추세가 성립할 때 단순 비교 둘과 DiD 가 참 효과 15억을 얼마나 맞히는지 보고, 평행추세가 깨지면 DiD 가 얼마나 틀리는지 본다.
import random
random.seed(2)

# 1단계: 다섯 달과 대리점의 설정을 둔다
# 처치지역(서울, 경기)에만 5월부터 광고를 켜고, 대조지역(나머지)은 그대로 둔다. 매출 단위는 억원이다. 표준 라이브러리(random)만 쓰고 시드를 고정한다.
MONTHS = ["1월", "2월", "3월", "4월", "5월"]   # 5월부터 광고 시작(post)
POST_IDX = 4                                    # 5월의 인덱스 (0부터 시작)
N_STORES = 60           # 지역 안의 대리점 수 — 그 지역 '평균' 매출은 이만큼의 평균
NOISE_SD = 5.0          # 대리점별 매출 잡음(억원) 표준편차
TRUE_EFFECT = 15.0      # 광고가 실제로 만드는 참 효과(억원/월) — 우리만 몰래 아는 값

# 2단계: 월 매출을 만들고 세 추정치를 계산하는 함수를 만든다
# run 은 두 지역의 다섯 달 평균 매출을 만들고, 4월과 5월로 단순 전후비교, 단순 지역비교, DiD 를 계산한다.
def true_mean(is_treat, month_idx, treat_trend, control_trend):
    """월별 '참' 평균 매출. 처치지역에만 post월(5월)에 TRUE_EFFECT를 더한다."""
    base, trend = (95.0, treat_trend) if is_treat else (75.0, control_trend)
    val = base + trend * month_idx
    if is_treat and month_idx == POST_IDX:
        val += TRUE_EFFECT
    return val

def simulate_month(is_treat, month_idx, treat_trend, control_trend):
    """그 달 대리점 N_STORES개의 매출을 잡음 섞어 만들고 지역 평균을 반환한다."""
    mu = true_mean(is_treat, month_idx, treat_trend, control_trend)
    stores = [random.gauss(mu, NOISE_SD) for _ in range(N_STORES)]
    return sum(stores) / len(stores)

def run(treat_trend, control_trend):
    treat = [simulate_month(True, i, treat_trend, control_trend) for i in range(5)]
    control = [simulate_month(False, i, treat_trend, control_trend) for i in range(5)]
    before, after = treat[POST_IDX - 1], treat[POST_IDX]
    c_before, c_after = control[POST_IDX - 1], control[POST_IDX]
    naive_before_after = after - before
    naive_group = after - c_after
    did = (after - before) - (c_after - c_before)
    return treat, control, naive_before_after, naive_group, did

# 3단계: 평행추세가 성립하는 시나리오 A 를 돌린다
# 처치지역과 대조지역 모두 월 +5억씩 자연스럽게 큰다. 끝의 assert 는 DiD 가 참값 근처이고, 두 단순 비교가 더 크게 잡는지 본다.
treat_a, control_a, nba_a, ng_a, did_a = run(treat_trend=5.0, control_trend=5.0)

print("[시나리오 A: 평행추세 O -- 처치지역과 대조지역 모두 월 +5억 자연 성장]")
for m, t, c in zip(MONTHS, treat_a, control_a):
    print(f"  {m}  처치지역 {t:7.2f}억   대조지역 {c:7.2f}억   격차 {t - c:+6.2f}억")
print(f"  단순 전후비교(처치만) = {nba_a:+.2f}억")
print(f"  단순 지역비교(사후만) = {ng_a:+.2f}억")
print(f"  DiD                  = {did_a:+.2f}억   (참값 {TRUE_EFFECT:+.0f}억)")

assert abs(did_a - TRUE_EFFECT) < 2.5   # DiD는 노이즈가 있어도 참값 근처로 돌아온다
assert nba_a > TRUE_EFFECT + 2          # 단순 전후비교는 계절 효과만큼 더 크게 잡는다
assert ng_a > nba_a                     # 단순 지역비교가 셋 중 가장 크게 과대추정한다

# 4단계: 평행추세가 깨진 시나리오 B 를 돌린다
# 처치지역 자연 추세만 대조지역의 2배(월 +10억)로 바꾼다. 참 효과는 시나리오 A 와 같은 15억이다.
treat_b, control_b, nba_b, ng_b, did_b = run(treat_trend=10.0, control_trend=5.0)

print()
print("[시나리오 B: 평행추세 X -- 처치지역만 월 +10억(대조지역의 2배)으로 원래 더 가파름]")
for m, t, c in zip(MONTHS, treat_b, control_b):
    print(f"  {m}  처치지역 {t:7.2f}억   대조지역 {c:7.2f}억   격차 {t - c:+6.2f}억")
print(f"  DiD = {did_b:+.2f}억   (참값 {TRUE_EFFECT:+.0f}억, 오차 {did_b - TRUE_EFFECT:+.2f}억)")

assert did_b > TRUE_EFFECT + 3   # 평행추세가 깨지면 DiD가 체계적으로 더 크게 과대추정된다

# 출력:
# 3단계 뜻: 두 지역이 매달 비슷하게 커서 4월까지 격차가 +18.11억에서 +21.59억 사이에 머물다가, 광고를 켠 5월에 +35.36억으로 벌어진다.
# [시나리오 A: 평행추세 O -- 처치지역과 대조지역 모두 월 +5억 자연 성장]
#   1월  처치지역   93.01억   대조지역   74.90억   격차 +18.11억
#   2월  처치지역  100.92억   대조지역   79.32억   격차 +21.59억
#   3월  처치지역  104.88억   대조지역   85.07억   격차 +19.80억
#   4월  처치지역  110.30억   대조지역   90.35억   격차 +19.95억
#   5월  처치지역  130.10억   대조지역   94.74억   격차 +35.36억
# 3단계 뜻: 단순 전후비교 +19.79억과 단순 지역비교 +35.36억은 참값 +15억에서 멀고, DiD 만 +15.40억으로 참값에 붙는다.
#   단순 전후비교(처치만) = +19.79억
#   단순 지역비교(사후만) = +35.36억
#   DiD                  = +15.40억   (참값 +15억)
# 4단계 뜻: 처치지역이 원래 더 빨리 커서 광고 전에도 격차가 1월 +19.93억에서 4월 +34.56억으로 벌어진다. 같은 DiD 를 쓰면 +19.06억으로, 참값보다 +4.06억 크게 잡힌다.
#
# [시나리오 B: 평행추세 X -- 처치지역만 월 +10억(대조지역의 2배)으로 원래 더 가파름]
#   1월  처치지역   95.28억   대조지역   75.34억   격차 +19.93억
#   2월  처치지역  104.75억   대조지역   80.55억   격차 +24.20억
#   3월  처치지역  115.40억   대조지역   85.03억   격차 +30.37억
#   4월  처치지역  125.38억   대조지역   90.81억   격차 +34.56억
#   5월  처치지역  148.32억   대조지역   94.70억   격차 +53.62억
#   DiD = +19.06억   (참값 +15억, 오차 +4.06억)
````

### 부록 5: instrumental-variables (블록 2개, Task 2)

#### 블록 1

<!-- cb5 post=instrumental-variables block=0 sha=58c026942887babb -->
````python
# 하는 일: 광고 배정(encouragement)을 받은 유저 20만 명을 시뮬레이션해, naive, ITT, IV(Wald) 세 추정치를 참 효과 +2.5%p 와 견준다.
import random
random.seed(42)

# 1단계: 캠페인 대상 20만 명의 설정을 둔다
# 활동적인 층은 기본 전환율도, 배정됐을 때 실제로 노출될 비율도 높다. 그래서 실제 노출 여부가 활동성과 얽힌다. 표준 라이브러리만 쓴다.
N = 200_000                          # 캠페인 대상 유저 수
HIGH_SHARE = 0.3                     # '원래 활동적인'(앱을 자주 여는) 유저 비중
BASE_HIGH, BASE_LOW = 0.08, 0.01     # 광고가 없어도 이 사람들이 사는 기본 전환율(교란 요인)
TRUE_EFFECT = 0.025                  # 광고를 '실제로 봤을 때'의 참 효과 — 두 층 동일(+2.5%p)
COMPLY_HIGH, COMPLY_LOW = 0.80, 0.25 # 배정돼도 실제 노출로 이어지는 비율(활동성과 상관)

# 2단계: 배정과 노출, 구매를 유저마다 굴린다
# 배정(Z)은 무작위이고, 실제 노출(X)은 배정되고 순응해야만 일어난다.
def simulate():
    rows = []
    for _ in range(N):
        high = random.random() < HIGH_SHARE
        z = random.random() < 0.5                    # 배정(Z): 무작위. 활동성과 무관하다
        comply_p = COMPLY_HIGH if high else COMPLY_LOW
        x = z and (random.random() < comply_p)        # 실제 노출(X): 배정+순응 모두 있어야 함(one-sided)
        p_buy = (BASE_HIGH if high else BASE_LOW) + (TRUE_EFFECT if x else 0.0)
        y = random.random() < p_buy                   # 실제 구매 여부
        rows.append((high, z, x, y))
    return rows

def rate(rows):
    return sum(r[3] for r in rows) / len(rows) if rows else 0.0

data = simulate()

# 3단계: naive, ITT, IV 를 구한다
# naive 는 실제 노출 여부로, ITT 는 배정 여부로 나눠 구매율 차이를 본다. IV 는 ITT 를 순응률로 나눈다.
exposed, unexposed = [r for r in data if r[2]], [r for r in data if not r[2]]
naive_gap = rate(exposed) - rate(unexposed)                       # (a) 실제 노출 여부로만 가른 naive

assigned, unassigned = [r for r in data if r[1]], [r for r in data if not r[1]]
itt_gap = rate(assigned) - rate(unassigned)                       # (b) 배정 여부로 가른 ITT

compliance = sum(r[2] for r in assigned) / len(assigned)          # P(노출=1 | 배정=1)
iv_gap = itt_gap / compliance                                      # (c) Wald 추정량 = ITT ÷ 순응률

# 4단계: 세 추정치를 참값과 견주고 스스로 검증한다
print(f"naive(노출 vs 비노출)      {naive_gap*100:+.2f}%p")
print(f"ITT(배정 vs 비배정)        {itt_gap*100:+.2f}%p")
print(f"순응률 P(노출=1|배정=1)     {compliance*100:.1f}%")
print(f"IV/LATE (=ITT÷순응률)      {iv_gap*100:+.2f}%p")
print(f"참값(TRUE_EFFECT)          {TRUE_EFFECT*100:+.2f}%p")
print(f"naive는 참값 대비 {naive_gap/TRUE_EFFECT:.2f}배, IV는 참값 대비 {iv_gap/TRUE_EFFECT:.2f}배")

assert abs(iv_gap - TRUE_EFFECT) < 0.005          # IV는 참값 근처로 돌아온다
assert naive_gap > TRUE_EFFECT * 1.5              # naive는 뚜렷하게 부풀어 있다

# 출력:
# 4단계 뜻: naive 는 +4.86%p 로 부풀고, 배정 기준 ITT 는 +1.01%p 로 작다. 배정된 사람 가운데 41.5% 만 실제로 노출돼 효과가 그만큼 묽어진다.
# naive(노출 vs 비노출)      +4.86%p
# ITT(배정 vs 비배정)        +1.01%p
# 순응률 P(노출=1|배정=1)     41.5%
# 4단계 뜻: ITT 를 순응률로 나눈 IV 는 +2.43%p 로 참값 +2.50%p 에 붙는다. naive 는 참값의 1.95배, IV 는 0.97배다.
# IV/LATE (=ITT÷순응률)      +2.43%p
# 참값(TRUE_EFFECT)          +2.50%p
# naive는 참값 대비 1.95배, IV는 참값 대비 0.97배
````

#### 블록 2

<!-- cb5 post=instrumental-variables block=1 sha=de5027812cf84b30 old=run -->
````python
# 하는 일: 4,000명짜리 캠페인을 순응률(도구의 힘) 10%, 40%, 80% 로 300번씩 되풀이해, IV(Wald) 추정치의 평균과 흩어짐을 견준다.
import random
import statistics

# 1단계: 캠페인 한 번의 IV 추정치를 구하는 함수를 만든다
# 배정은 순응률과 무관하게 늘 반반이고, 순응 여부는 배정군 안에서만 나뉜다. 대조군은 노출되지 않는다. 표준 라이브러리만 쓴다.
N_PER_TRIAL = 4_000     # 캠페인 1회당 유저 수(반복 시행 속도를 위해 위 시뮬보다 작게 잡음)
N_TRIALS = 300          # 같은 조건의 캠페인을 300번 반복한다고 생각하면 됨
BASE_RATE = 0.02        # 광고 없이도 사는 기본 전환율(층 구분 없이 단순화)
TRUE_EFFECT = 0.025     # 실제 노출됐을 때의 참 효과(+2.5%p) — 세 조건 모두 동일

def one_trial(comply_rate, rng):
    conv_z1 = conv_z0 = n_z1 = n_z0 = exposed_n = 0
    for _ in range(N_PER_TRIAL):
        z = rng.random() < 0.5                       # 배정: 순응률과 무관하게 항상 반반
        if z:
            n_z1 += 1
            x = rng.random() < comply_rate            # 배정군 안에서만 순응 여부가 나뉨
            exposed_n += x
            p_buy = BASE_RATE + (TRUE_EFFECT if x else 0.0)
            conv_z1 += rng.random() < p_buy
        else:
            n_z0 += 1
            conv_z0 += rng.random() < BASE_RATE        # 대조군은 노출 0, 기본 전환율만

    itt = conv_z1 / n_z1 - conv_z0 / n_z0
    compliance_hat = exposed_n / n_z1
    return itt / compliance_hat                        # Wald 추정량

# 2단계: 순응률마다 300번 반복해 평균과 표준편차를 찍는다
# 조건마다 같은 난수 시퀀스로 시작해 순응률만 다르게 한다.
print(f"{'순응률':>6}  {'IV 추정치 평균':>14}  {'표준편차':>8}")
for comply_rate in (0.10, 0.40, 0.80):
    rng = random.Random(42)      # 조건마다 같은 난수 시퀀스로 시작 — 비교의 공정성
    estimates = [one_trial(comply_rate, rng) for _ in range(N_TRIALS)]
    mean = statistics.mean(estimates)
    sd = statistics.pstdev(estimates)
    print(f"{comply_rate:>5.0%}  {mean*100:>+13.2f}%p  {sd*100:>7.2f}%p")

# 출력:
# 2단계 뜻: 세 순응률 모두 평균이 +2.52%p 에서 +2.68%p 로 참값 근처다. 표준편차는 순응률 10% 에서 4.68%p 로 평균 +2.68%p 보다도 크고, 80% 에서는 0.69%p 로 준다.
#    순응률       IV 추정치 평균      표준편차
#   10%          +2.68%p     4.68%p
#   40%          +2.53%p     1.24%p
#   80%          +2.52%p     0.69%p
````

### 부록 6: regression-discontinuity (블록 1개, Task 2)

#### 블록 1

<!-- cb5 post=regression-discontinuity block=0 sha=77b58796f56789c2 -->
````python
# 하는 일: 품질점수 7.0점 컷오프 주변 광고그룹 6만 개를 만들고, 밴드폭을 0.05점부터 3.00점까지 바꿔 가며 단순 평균차와 local linear 의 편향과 흔들림을 견준다.
import random
import statistics
random.seed(42)

# 1단계: 광고그룹 6만 개를 만든다
# 7.0점부터 프리미엄 지면에 노출되고, 그 효과는 CTR +0.6%p 다. 컷과 무관하게 점수가 오를수록 CTR 이 살짝 휘며 오르는 추세와 노출수에 따른 표집오차도 넣는다. 표준 라이브러리만 쓰고 시드를 고정한다.
N = 60_000            # 광고그룹 수
CUTOFF = 7.0           # 품질점수 컷오프 -- 이 점수부터 프리미엄 지면 노출
BASE_CTR = 0.020       # 컷오프 지점의 기저 CTR
SLOPE = 0.004          # 품질점수 1점마다 CTR이 원래 +0.4%p씩 오르는 연속 추세(광고 자체 품질)
CURVE = 0.0015         # 살짝 휘어지는 곡률 -- 컷에서 멀수록 완만한 직선이 아님을 흉내
TRUE_TAU = 0.006       # 진짜 효과: 프리미엄 지면 노출이 주는 CTR 상승분(+0.6%p)

def make_ad_group():
    score = random.uniform(4.0, 10.0)                # 품질점수(running variable)
    d = score - CUTOFF
    treated = score >= CUTOFF
    true_ctr = max(0.0005, BASE_CTR + SLOPE*d + CURVE*d*d + (TRUE_TAU if treated else 0.0))
    impressions = random.randint(500, 5_000)
    sd = (impressions * true_ctr * (1 - true_ctr)) ** 0.5
    clicks = min(impressions, max(0, round(random.gauss(impressions*true_ctr, sd))))
    return score, impressions, clicks

groups = [make_ad_group() for _ in range(N)]

# 2단계: 두 추정 방법과 흔들림을 재는 함수를 만든다
# 단순 평균차는 컷 양옆 평균 CTR 을 그냥 빼고, local linear 는 양옆에 직선을 적합해 컷에서의 차이를 본다. 흔들림은 부트스트랩 150번의 표준편차로 잰다.
def window(rows, lo, hi):                            # [lo, hi) 구간 안 (점수, CTR) 쌍
    return [(s, c/i) for s, i, c in rows if lo <= s < hi and i > 0]

def mean_diff(rows, h):                               # 단순 평균차: 양쪽 평균 CTR의 차이
    L, R = window(rows, CUTOFF-h, CUTOFF), window(rows, CUTOFF, CUTOFF+h)
    return sum(y for _, y in R)/len(R) - sum(y for _, y in L)/len(L), len(L)+len(R)

def fit_at_cutoff(pts):                               # OLS 직선을 적합해 x=CUTOFF에서의 적합값을 반환
    n = len(pts)
    xbar = sum(x for x, _ in pts)/n
    ybar = sum(y for _, y in pts)/n
    den = sum((x-xbar)**2 for x, _ in pts) or 1e-9
    slope = sum((x-xbar)*(y-ybar) for x, y in pts)/den
    return ybar + slope*(CUTOFF - xbar)

def local_linear(rows, h):                            # local linear: 양옆 직선의 절편 차이
    L, R = window(rows, CUTOFF-h, CUTOFF), window(rows, CUTOFF, CUTOFF+h)
    return fit_at_cutoff(R) - fit_at_cutoff(L), len(L)+len(R)

def boot_sd(rows, h, estimator, B=150):               # 부트스트랩으로 추정치의 흔들림(표준편차)을 잰다
    L, R = window(rows, CUTOFF-h, CUTOFF), window(rows, CUTOFF, CUTOFF+h)
    ests = []
    for _ in range(B):
        bl = random.choices(L, k=len(L))
        br = random.choices(R, k=len(R))
        ests.append(estimator(bl, br))
    return statistics.pstdev(ests)

md_fn = lambda l, r: sum(y for _, y in r)/len(r) - sum(y for _, y in l)/len(l)
ll_fn = lambda l, r: fit_at_cutoff(r) - fit_at_cutoff(l)

# 3단계: 밴드폭 일곱 개로 두 추정치를 찍는다
# 밴드폭은 컷 양옆으로 얼마나 넓게 볼지다. 좁히면 표본이 적어 흔들리고, 넓히면 추세가 섞여 편향이 커지는 트레이드오프가 있다.
for h in [0.05, 0.1, 0.2, 0.5, 1.0, 2.0, 3.0]:
    md, n = mean_diff(groups, h)
    ll, _ = local_linear(groups, h)
    sd_md = boot_sd(groups, h, md_fn)
    sd_ll = boot_sd(groups, h, ll_fn)
    print(f"h=±{h:.2f}  n={n:6,d}  단순평균차 {md*100:+.3f}%p (편향 {(md-TRUE_TAU)*100:+.3f}, sd {sd_md*100:.3f})"
          f"   local-linear {ll*100:+.3f}%p (편향 {(ll-TRUE_TAU)*100:+.3f}, sd {sd_ll*100:.3f})")

# 출력:
# 3단계 뜻: 단순 평균차는 밴드폭을 넓힐수록 편향이 +0.047 에서 +1.202 로 커진다. local-linear 는 어느 밴드폭에서나 편향이 +0.033 이하다. 표본이 996개로 가장 적은 h=±0.05 에서는 두 방법 모두 sd 가 가장 크다(0.021, 0.043).
# h=±0.05  n=   996  단순평균차 +0.647%p (편향 +0.047, sd 0.021)   local-linear +0.631%p (편향 +0.031, sd 0.043)
# h=±0.10  n= 2,006  단순평균차 +0.663%p (편향 +0.063, sd 0.015)   local-linear +0.633%p (편향 +0.033, sd 0.030)
# h=±0.20  n= 3,949  단순평균차 +0.691%p (편향 +0.091, sd 0.010)   local-linear +0.625%p (편향 +0.025, sd 0.022)
# h=±0.50  n= 9,851  단순평균차 +0.804%p (편향 +0.204, sd 0.006)   local-linear +0.616%p (편향 +0.016, sd 0.014)
# h=±1.00  n=19,943  단순평균차 +1.009%p (편향 +0.409, sd 0.005)   local-linear +0.606%p (편향 +0.006, sd 0.010)
# h=±2.00  n=39,948  단순평균차 +1.405%p (편향 +0.805, sd 0.005)   local-linear +0.606%p (편향 +0.006, sd 0.007)
# h=±3.00  n=60,000  단순평균차 +1.802%p (편향 +1.202, sd 0.006)   local-linear +0.607%p (편향 +0.007, sd 0.006)
````

### 부록 7: uplift-incrementality (블록 2개, Task 3)

#### 블록 1

<!-- cb5 post=uplift-incrementality block=0 sha=0beb73dfe378d1a2 -->
````python
# 하는 일: 사람마다 참 증분을 심은 4만 명(홀드아웃 5%)으로 S-learner, T-learner, X-learner 를 학습해, 추정한 증분을 참값과 견준다.
import random, math
random.seed(11)

# 1단계: 사람마다 참 증분을 심은 데이터를 만드는 함수를 둔다
# 관심도 점수(x1)가 1 에 가까울수록 증분이 오르고, 최근 구매자(x2)는 증분이 깎인다. 광고를 안 봤을 때 살 확률은 다른 계수로 따로 정해, 원래 잘 살 사람과 광고가 잘 먹는 사람이 어긋나게 했다.
SIG = lambda z: 1 / (1 + math.exp(-max(-30, min(30, z))))
E = 0.95                                   # 노출 비율 (홀드아웃 5%)

def make(n):
    d = []
    for _ in range(n):
        x1, x2, x3 = random.random(), int(random.random() < .15), int(random.random() < .30)
        p0 = SIG(-4.6 + 2.2 * x1 + 1.4 * x2 - 0.4 * x3)
        tau = 0.013 * x1 - 0.010 * x2      # 참 증분: 관심도는 +, 최근 구매자는 -
        p1 = min(max(p0 + tau, 0.0002), .99)
        t = int(random.random() < E)
        y = int(random.random() < (p1 if t else p0))
        d.append(([1.0, x1, x2, x3], t, y, tau))
    return d

# 2단계: 학습 함수를 만든다
# sgd 는 확률적 경사하강으로 선형 모델의 계수를 맞춘다. logit 은 전환율로 절편을 시작하는 로지스틱 회귀다.
def sgd(rows, link, epochs=25, lr0=.5, lam=1e-6, b0=0.0):
    w = [b0] + [0.0] * (len(rows[0][0]) - 1); rows = rows[:]; n = len(rows); k = 0
    for _ in range(epochs):
        random.shuffle(rows)
        for x, y in rows:
            k += 1; lr = lr0 / (1 + 3 * k / n)
            e = link(sum(a * b for a, b in zip(w, x))) - y
            for j in range(len(w)): w[j] -= lr * (e * x[j] + lam * w[j])
    return w

ident = lambda z: z
dot = lambda w, x: sum(a * b for a, b in zip(w, x))
def logit(rows):
    m = sum(y for _, y in rows) / len(rows)
    return sgd(rows, SIG, b0=math.log(m / (1 - m)))

# 3단계: 세 학습법으로 사람마다 증분을 추정한다
# S-learner 는 노출 여부를 피처로 넣은 모델 하나로, T-learner 는 노출군과 대조군의 모델 둘로 예측의 차이를 낸다. X-learner 는 상대 모델로 만든 가짜 증분 라벨에 회귀를 하나씩 맞추고, 노출 비율 E 로 섞는다.
D = make(40000)
tr = [r for r in D if r[1] == 1]; ct = [r for r in D if r[1] == 0]
ws = logit([(x + [float(t)], y) for x, t, y, _ in D])          # S-learner
s_hat = [SIG(dot(ws, x + [1.0])) - SIG(dot(ws, x + [0.0])) for x, _, _, _ in D]
w1 = logit([(x, y) for x, t, y, _ in tr]); w0 = logit([(x, y) for x, t, y, _ in ct])
t_hat = [SIG(dot(w1, x)) - SIG(dot(w0, x)) for x, _, _, _ in D]  # T-learner
a1 = sgd([(x, y - SIG(dot(w0, x))) for x, t, y, _ in tr], ident, lr0=.2)
a0 = sgd([(x, SIG(dot(w1, x)) - y) for x, t, y, _ in ct], ident, lr0=.2)
x_hat = [E * dot(a0, x) + (1 - E) * dot(a1, x) for x, _, _, _ in D]  # X-learner

# 4단계: 데이터 규모와 S-learner 의 처치 계수를 찍는다
true = [r[3] for r in D]
def corr(a, b):
    ma, mb = sum(a) / len(a), sum(b) / len(b)
    ca = [v - ma for v in a]; cb = [v - mb for v in b]
    return sum(p * q for p, q in zip(ca, cb)) / math.sqrt(sum(v * v for v in ca) * sum(v * v for v in cb))
neg = sum(1 for v in true if v < 0)
print(f"노출 {len(tr):,}명, 홀드아웃 {len(ct):,}명, 참 평균 증분 {sum(true)/len(true)*100:+.3f}%p, 참 음수 {neg:,}명")
print(f"대조군 전환 {sum(r[2] for r in ct):,}건, 노출군 전환 {sum(r[2] for r in tr):,}건")
print(f"S-learner 처치 계수 {ws[-1]:+.3f}")

# 5단계: 학습법마다 성적을 찍는다
# 상관은 참 증분과의 상관, 오차는 평균 절대 오차다. 상위20% 참증분은 그 점수로 상위 20% 를 골랐을 때 그 사람들의 참 증분 평균이다.
for name, h in (("S-learner", s_hat), ("T-learner", t_hat), ("X-learner", x_hat), ("참값(상한)", true)):
    top = sorted(range(len(h)), key=lambda i: -h[i])[:len(h) // 5]
    mae = sum(abs(v - t0) for v, t0 in zip(h, true)) / len(h)
    print(f"{name} | 평균 {sum(h)/len(h)*100:+.3f}%p | 상관 {corr(h, true):+.3f} | 오차 {mae*100:.3f}%p "
          f"| 상위20% 참증분 {sum(true[i] for i in top)/len(top)*100:+.3f}%p "
          f"| 음수판정 {sum(1 for v in h if v < 0):,}명")

# 출력:
# 4단계 뜻: 노출 38,026명에 홀드아웃은 1,974명이고, 그 안의 전환은 77건뿐이다. 참 평균 증분은 +0.500%p 이고, 광고를 보면 오히려 덜 사는 참 음수가 4,556명이다.
# 노출 38,026명, 홀드아웃 1,974명, 참 평균 증분 +0.500%p, 참 음수 4,556명
# 대조군 전환 77건, 노출군 전환 1,903건
# 4단계 뜻: S-learner 가 노출 여부에 준 계수는 +0.240 하나뿐이다. 노출과 다른 피처를 곱한 항이 없어, 사람마다 증분이 다른 것을 거의 담지 못한다.
# S-learner 처치 계수 +0.240
# 5단계 뜻: 참값으로 상위 20% 를 고르면 참 증분이 +1.144%p 다. 상관 +0.905, +0.911 인 T-learner 와 X-learner 는 +1.132%p, +1.105%p 로 붙고, 상관 +0.105 인 S-learner 는 +0.589%p 에 그치는데도 오차는 0.451%p 로 가장 작다.
# S-learner | 평균 +0.900%p | 상관 +0.105 | 오차 0.451%p | 상위20% 참증분 +0.589%p | 음수판정 0명
# T-learner | 평균 +1.248%p | 상관 +0.905 | 오차 1.564%p | 상위20% 참증분 +1.132%p | 음수판정 5,963명
# X-learner | 평균 +0.479%p | 상관 +0.911 | 오차 1.205%p | 상위20% 참증분 +1.105%p | 음수판정 8,565명
# 참값(상한) | 평균 +0.500%p | 상관 +1.000 | 오차 0.000%p | 상위20% 참증분 +1.144%p | 음수판정 4,556명
````

#### 블록 2

<!-- cb5 post=uplift-incrementality block=1 sha=046e6f6a3138a877 -->
````python
# 하는 일: 세그먼트 여섯 개의 가데이터로 uplift 순과 pCVR 순의 Qini 곡선, AUUC, Qini 계수를 구하고, 두 점수의 AUC 와 나란히 본다.

# 1단계: 세그먼트 여섯 개를 둔다
# 각 행은 (세그먼트, 노출군 인원=대조군 인원, 노출군 전환, 대조군 전환)이다.
SEG = [
    ("A 장바구니 담고 미구매", 25000, 3000, 2500),
    ("B 상품 상세 3회 이상",   30000, 1500, 1050),
    ("C 브랜드 검색 유입",     50000, 4500, 4350),
    ("D 앱 설치 30일 내",      50000, 1000,  600),
    ("E 저관여 열람",         200000, 1550,  870),
    ("F 최근 구매 3일 내",     45000,  450,  630),
]
TOT_N = sum(s[1] for s in SEG)
TOT_INC = sum(s[2] - s[3] for s in SEG)

# 2단계: Qini 곡선과 면적, AUC 를 구하는 함수를 만든다
# curve 는 고른 순서대로 세그먼트를 더해 가며 누적 도달 인원과 누적 증분 전환을 낸다. auc 는 노출군에서 전환 여부를 점수로 얼마나 잘 나누는지 잰다.
def curve(order):                      # 누적 도달 인원 → 누적 증분 전환
    pts, x, y = [(0, 0)], 0, 0
    for name in order:
        n, t, c = next((s[1], s[2], s[3]) for s in SEG if s[0].startswith(name))
        x, y = x + n, y + (t - c)
        pts.append((x, y))
    return pts

def area(pts):                          # 사다리꼴 적분
    return sum((pts[i+1][0] - pts[i][0]) * (pts[i][1] + pts[i+1][1]) / 2
               for i in range(len(pts) - 1))

def auc(score):                         # 노출군에서 '전환 여부'를 얼마나 잘 나누나
    cells = sorted((score[s[0][0]], s[2], s[1] - s[2]) for s in SEG)
    pos = sum(c[1] for c in cells); neg = sum(c[2] for c in cells)
    hit, below = 0.0, 0
    for _, p, n in cells:              # 점수 오름차순
        hit += p * (below + n / 2)     # 같은 칸 안은 동점 → 0.5점
        below += n
    return hit / (pos * neg)

# 3단계: 두 순서로 Qini 곡선을 그려 AUUC 를 잰다
# AUUC 는 곡선 아래 면적을 전체 도달 인원과 전체 증분의 곱으로 나눈 값이고, 아무 순서로나 고르면 0.5 다. 거기서 0.5 를 뺀 값이 Qini 계수다.
up_order = ["A", "B", "D", "E", "C", "F"]      # 실제 uplift 내림차순
cv_order = ["A", "C", "B", "D", "F", "E"]      # 노출군 전환율(pCVR) 내림차순
for label, order in (("uplift 순", up_order), ("pCVR 순", cv_order)):
    pts = curve(order)
    norm = area(pts) / (TOT_N * TOT_INC)
    print(f"[{label}] 누적점 " + " → ".join(f"({x:,},{y:+,})" for x, y in pts))
    print(f"   AUUC(정규화) {norm:.4f}, 랜덤 0.5000, Qini 계수 {norm - 0.5:+.4f}")
    print(f"   최고점 {max(y for _, y in pts):+,}건 (도달 {max(pts, key=lambda p: p[1])[0]:,}명)")

# 4단계: 두 점수의 AUC 를 견준다
pcvr = {s[0][0]: s[2] / s[1] for s in SEG}
uplf = {s[0][0]: (s[2] - s[3]) / s[1] for s in SEG}
print(f"\nAUC(전환 예측) — pCVR 점수 {auc(pcvr):.4f} vs uplift 점수 {auc(uplf):.4f}")
print(f"전체 증분 {TOT_INC:,}건, 도달 {TOT_N:,}명")

# 출력:
# 3단계 뜻: 실제 uplift 순으로 고르면 355,000명에서 +2,180건으로 정점을 찍고, 400,000명 전원이면 +2,000건으로 내려온다. AUUC 는 0.7785, Qini 계수는 +0.2785 다.
# [uplift 순] 누적점 (0,+0) → (25,000,+500) → (55,000,+950) → (105,000,+1,350) → (305,000,+2,030) → (355,000,+2,180) → (400,000,+2,000)
#    AUUC(정규화) 0.7785, 랜덤 0.5000, Qini 계수 +0.2785
#    최고점 +2,180건 (도달 355,000명)
# 3단계 뜻: pCVR 순으로 고르면 AUUC 0.6521, Qini 계수 +0.1521 이고, 전원에 쓴 +2,000건이 최고점이다.
# [pCVR 순] 누적점 (0,+0) → (25,000,+500) → (75,000,+650) → (105,000,+1,100) → (155,000,+1,500) → (200,000,+1,320) → (400,000,+2,000)
#    AUUC(정규화) 0.6521, 랜덤 0.5000, Qini 계수 +0.1521
#    최고점 +2,000건 (도달 400,000명)
# 4단계 뜻: AUC 로 재면 거꾸로 pCVR 점수가 0.7851, uplift 점수가 0.5537 이다. 전체 증분은 2,000건이다.
#
# AUC(전환 예측) — pCVR 점수 0.7851 vs uplift 점수 0.5537
# 전체 증분 2,000건, 도달 400,000명
````

### 부록 8: stats-confidence-interval-ttest (블록 2개, Task 3)

#### 블록 1

<!-- cb5 post=stats-confidence-interval-ttest block=0 sha=baf0410c07779aa8 -->
````python
# 하는 일: 참 클릭률이 1.21% 인 소재 B 를 노출 40,000 으로 1,000번 재고, 그때마다 그린 95% 구간이 참값 1.21% 를 품은 횟수를 센다.
import math, random

# 1단계: 한 번 재고 95% 구간을 그리는 함수를 만든다
# 노출 40,000건을 한 건씩 1.21% 확률로 클릭시킨다. 표준 라이브러리만 쓰고, 노출 4,000만 건을 하나씩 뽑으므로 몇 초 걸린다.
TRUE_P, N, RUNS = 0.0121, 40_000, 1_000
random.seed(9)                                    # 시드를 고정해 누가 돌려도 같은 값이 나옵니다

def one_measurement():
    """노출 N 건마다 1.21% 확률로 클릭. 잰 클릭률과 그 95% 구간을 돌려줍니다."""
    clicks = sum(random.random() < TRUE_P for _ in range(N))
    p_hat = clicks / N
    se = math.sqrt(p_hat * (1 - p_hat) / N)       # 표준오차 — 잰 값이 흔들리는 폭
    return p_hat, p_hat - 1.96 * se, p_hat + 1.96 * se

# 2단계: 1,000번 재며 구간이 참값을 품었는지 센다
# 처음 다섯 번은 구간을 찍어 눈으로 보고, 끝에 품은 구간과 놓친 구간의 수를 찍는다.
covered = 0
for i in range(RUNS):
    p_hat, lo, hi = one_measurement()
    ok = lo <= TRUE_P <= hi                       # 이번에 그린 구간이 참값을 품었나
    covered += ok
    if i < 5:                                     # 처음 다섯 번만 눈으로 봅니다
        print(f"{i + 1}번째: 잰 값 {p_hat:.2%}, 구간 [{lo:.2%}, {hi:.2%}] → {'품음' if ok else '놓침'}")

print(f"\n{RUNS:,}번 중 참값을 품은 구간 {covered}개 ({covered / RUNS:.1%}), 놓친 구간 {RUNS - covered}개")

# 출력:
# 2단계 뜻: 처음 다섯 번은 잰 값이 1.15% 에서 1.30% 사이로 흔들리고, 구간은 모두 참값을 품는다.
# 1번째: 잰 값 1.30%, 구간 [1.19%, 1.41%] → 품음
# 2번째: 잰 값 1.28%, 구간 [1.17%, 1.39%] → 품음
# 3번째: 잰 값 1.20%, 구간 [1.09%, 1.31%] → 품음
# 4번째: 잰 값 1.15%, 구간 [1.05%, 1.25%] → 품음
# 5번째: 잰 값 1.26%, 구간 [1.16%, 1.37%] → 품음
#
# 2단계 뜻: 1,000번 가운데 949개(94.9%)가 참값을 품고 51개는 놓친다. 구간 이름이 약속한 비율과 거의 같다.
# 1,000번 중 참값을 품은 구간 949개 (94.9%), 놓친 구간 51개
````

#### 블록 2

<!-- cb5 post=stats-confidence-interval-ttest block=1 sha=6d0ea07e2d8b7881 -->
````python
# 하는 일: 두 클릭률의 차이(z), 주문 금액 평균의 차이(t), 두 무리의 분산(F), 세 소재의 분산분석(F)을 한 번에 낸다.
import math

# 1단계: 두 클릭률 차이의 z 와 p 값을 구하는 함수를 만든다
# p 값은 정규분포에서 math.erfc 로 낸다. 숫자는 전부 설명을 위한 가상 값이다.
def z_test(k1, n1, k2, n2):
    """두 클릭률의 차이를 그 차이의 흔들림으로 나눈 z 와 양쪽 p 값."""
    p1, p2 = k1 / n1, k2 / n2
    se = math.sqrt(p1 * (1 - p1) / n1 + p2 * (1 - p2) / n2)   # 차이의 표준오차
    return p2 - p1, se, (p2 - p1) / se, math.erfc(abs((p2 - p1) / se) / math.sqrt(2))

# 2단계: 노출을 4배로 늘려 z 를 견준다
# 클릭률은 그대로 두고 노출만 40,000 에서 160,000 으로 늘린다.
for n in (40_000, 160_000):                          # 노출이 4배면 표준오차는 절반
    k1, k2 = round(n * 0.0108), round(n * 0.0121)     # 클릭률은 그대로 1.08% 와 1.21%
    d, se, z, p = z_test(k1, n, k2, n)
    print(f"노출 {n:>7,}씩: 차이 {d*100:.2f}%p, 표준오차 {se*100:.4f}%p, z {z:.2f}, p {p:.4f}")

# 3단계: B 하나의 구간과 차이의 구간을 그린다
p_b = 484 / 40_000                                    # 소재 B 하나만 볼 때의 구간
se_b = math.sqrt(p_b * (1 - p_b) / 40_000)
print(f"B 클릭률의 95% 구간 [{(p_b - 1.96*se_b)*100:.2f}%, {(p_b + 1.96*se_b)*100:.2f}%]")
d, se, _, _ = z_test(432, 40_000, 484, 40_000)
print(f"차이의 95% 구간 [{(d - 1.96*se)*100:.3f}, {(d + 1.96*se)*100:.3f}]%p\n")

# 4단계: 주문 금액 평균의 차이를 t 검정한다
# 두 무리 각 30건, 표준편차 18,000원이다. t 와 F 는 표준 라이브러리에 분포 함수가 없어 p 값 대신 통계표의 문턱값과 견준다. 자유도 58 의 문턱은 표 값 2.00 이다.
m_a, m_b, sd, n = 42_300, 47_900, 18_000, 30
se_t = sd * math.sqrt(2 / n)                          # 두 평균 차이의 표준오차
t = (m_b - m_a) / se_t
print(f"주문 금액: 차이 {m_b - m_a:,}원, 표준오차 {se_t:,.0f}원, t {t:.2f}"
      f" (자유도 {2*n-2}, 문턱 2.00) → {'확인' if abs(t) > 2.00 else '확인 못 함'}")

# 5단계: 두 무리의 분산이 같은지 F 검정한다
# 같으면 합친 분산으로 t 검정을 하고, 다르면 Welch 로 간다. 자유도 29, 29 의 문턱은 표 값 2.10 이다.
for sd_b in (18_000, 27_000):
    F = sd_b ** 2 / sd ** 2
    print(f"  B 의 표준편차가 {sd_b:,}원이면 F {F:.2f} (자유도 29, 29, 문턱 2.10) → "
          f"{'다르다 — Welch' if F > 2.10 else '같다 — 합친 분산 t 검정'}")
print()

# 6단계: 세 소재를 분산분석한다
# 무리 사이 차이를 무리 안 흔들림으로 나눈 값이 F 다. 문턱은 표 값 3.00 이다.
groups = [(432, 40_000), (484, 40_000), (460, 40_000)]   # (클릭, 노출)
N, K = sum(n for _, n in groups), len(groups)
p_all = sum(k for k, _ in groups) / N
between = sum(n * (k / n - p_all) ** 2 for k, n in groups) / (K - 1)
within = sum(n * (k / n) * (1 - k / n) for k, n in groups) / (N - K)   # 클릭 1, 아니면 0
print(f"세 소재: 전체 {p_all:.3%}, 무리 사이 {between:.4f}, 무리 안 {within:.4f},"
      f" F {between/within:.2f} (문턱 3.00) → {'확인' if between/within > 3.00 else '확인 못 함'}")

# 출력:
# 2단계 뜻: 클릭률 차이 0.13%p 는 같은데, 노출을 40,000 에서 160,000 으로 늘리면 표준오차가 0.0752%p 에서 0.0376%p 로 절반이 되어 z 가 1.73 에서 3.46 으로 커진다. p 는 0.0840 에서 0.0005 로 준다.
# 노출  40,000씩: 차이 0.13%p, 표준오차 0.0752%p, z 1.73, p 0.0840
# 노출 160,000씩: 차이 0.13%p, 표준오차 0.0376%p, z 3.46, p 0.0005
# 3단계 뜻: 소재 B 하나의 95% 구간은 [1.10%, 1.32%] 다. 두 소재 차이의 95% 구간 [-0.017, 0.277]%p 는 0 을 품어, 아직 B 가 낫다고 말할 수 없다.
# B 클릭률의 95% 구간 [1.10%, 1.32%]
# 차이의 95% 구간 [-0.017, 0.277]%p
#
# 4단계 뜻: 차이 5,600원을 표준오차 4,648원으로 나눈 t 가 1.20 이라 문턱 2.00 을 못 넘는다.
# 주문 금액: 차이 5,600원, 표준오차 4,648원, t 1.20 (자유도 58, 문턱 2.00) → 확인 못 함
# 5단계 뜻: B 의 표준편차가 18,000원이면 F 1.00 으로 합친 분산 t 검정을 하고, 27,000원이면 F 2.25 가 문턱 2.10 을 넘어 Welch 로 간다.
#   B 의 표준편차가 18,000원이면 F 1.00 (자유도 29, 29, 문턱 2.10) → 같다 — 합친 분산 t 검정
#   B 의 표준편차가 27,000원이면 F 2.25 (자유도 29, 29, 문턱 2.10) → 다르다 — Welch
#
# 6단계 뜻: 무리 사이 0.0169 를 무리 안 0.0113 으로 나눈 F 1.49 가 문턱 3.00 을 못 넘는다. 셋 중에 다른 것이 있다고 말할 근거가 아직 없다.
# 세 소재: 전체 1.147%, 무리 사이 0.0169, 무리 안 0.0113, F 1.49 (문턱 3.00) → 확인 못 함
````

### 부록 9: model-ab-testing (블록 3개, Task 3)

#### 블록 1

<!-- cb5 post=model-ab-testing block=0 sha=9f7b6ea2efd362bf -->
````python
# 하는 일: 전환을 8% 더 만들고 12% 높게 부르는 모델 B 를 A 와 하루 동안 경매에 붙여, 예산이 남을 때와 구속될 때 요청당 전환과 같은 돈당 전환을 견준다.

import random
random.seed(42)

# 1단계: 시간대와 시장, 두 그룹의 설정을 둔다
# 두 그룹은 시간당 같은 수의 요청을 받고 같은 시장에서 경쟁한다. 다른 것은 실력과 입찰가뿐이다.
HOURS = 24
REQ_PER_HOUR = 4_000          # 시간당 요청. 절반씩 두 그룹에 배정
MARKET_MEAN = 900             # 경쟁 낙찰가 평균(원 CPM). 로그정규로 흩어진다
MARKET_SIGMA = 0.45

# 시간대별 전환 가치 지수(가상). 저녁이 값지다.
VALUE_IDX = [0.4,0.3,0.3,0.3,0.4,0.6, 0.9,1.1,1.0,0.9,0.9,1.0,
             1.1,1.0,1.0,1.1,1.3,1.5, 1.8,2.0,1.9,1.5,1.0,0.6]

# 두 그룹의 진짜 실력. B는 같은 노출에서 전환을 8% 더 만든다.
# 그리고 예측이 높으니 자동입찰이 12% 높게 부른다 — 실력과 입찰가는 붙어 다닌다.
ARMS = {"A (기존)": dict(cvr=0.050, bid=1000), "B (신규)": dict(cvr=0.054, bid=1120)}

# 2단계: 하루 24시간의 경매를 돌리는 함수를 만든다
# 'split' 은 예산을 그룹마다 절반씩 나누고, 'shared' 는 하나를 함께 쓴다. 예산이 떨어진 시각을 마름으로 적는다.
def simulate(budget_mode, total_budget=70_000):
    """budget_mode: 'split' = 그룹마다 절반씩, 'shared' = 하나를 공유"""
    st = {k: dict(req=0, win=0, spend=0.0, conv=0.0, dry=None) for k in ARMS}
    pool = total_budget
    caps = {k: total_budget / 2 for k in ARMS}
    for h in range(HOURS):
        for name, cfg in ARMS.items():
            for _ in range(REQ_PER_HOUR // 2):
                st[name]["req"] += 1
                left = pool if budget_mode == 'shared' else caps[name] - st[name]["spend"]
                if left <= 0:
                    if st[name]["dry"] is None: st[name]["dry"] = h
                    continue
                # 경매: 경쟁가보다 높으면 낙찰, 2nd price로 경쟁가를 낸다
                rival = random.lognormvariate(0, MARKET_SIGMA) * MARKET_MEAN
                if cfg["bid"] <= rival:
                    continue                       # 패찰 — 비용도 없다
                cost = rival / 1000                # 노출 1건 비용(원)
                if cost > left:
                    if st[name]["dry"] is None: st[name]["dry"] = h
                    continue
                st[name]["win"] += 1
                st[name]["spend"] += cost
                st[name]["conv"] += cfg["cvr"] * VALUE_IDX[h]
                if budget_mode == 'shared': pool -= cost
    return st

# 3단계: 예산 두 가지로 실험을 돌려 두 기준을 견준다
# 소재 A/B 에서는 두 소재가 같은 조건으로 노출되지만 모델 A/B 는 다르다. 좋은 모델은 "이건 값지다"고 판단해 더 높게 부르고, 그래서 낙찰을 더 많이 한다. 즉 B 는 '더 잘 고르는 동시에 더 많이 사는' 그룹이라, "요청당 전환"으로 재면 더 많이 산 효과까지 실력으로 계산된다. 무엇으로 나누어 재는가가 승자를 바꾼다.
print(f"요청 시간당 {REQ_PER_HOUR:,}건(그룹당 절반), 예산 총 70,000원, 경쟁가 평균 {MARKET_MEAN}원 CPM")
print("진짜 차이: B가 같은 노출에서 전환을 8.0% 더 만든다 (입찰가는 12% 높다)\n")

for total, label in ((70_000, '① 예산이 남는 상태 (전량 소화에 44,292원 필요)'),
                     (30_000, '② 예산이 구속되는 상태 (30,000원만 있다)')):
    st = simulate('split', total)
    print(label)
    print(f"  {'그룹':<10}{'낙찰':>8}{'낙찰률':>8}{'지출':>10}{'전환':>9}{'요청당':>10}{'만원당':>10}{'마름':>7}")
    for n, v in st.items():
        wr = v["win"] / v["req"]
        per_req = v["conv"] / v["req"]
        per_won = v["conv"] / v["spend"] * 10_000 if v["spend"] else 0
        dry = f"{v['dry']}시" if v["dry"] is not None else "—"
        print(f"  {n:<10}{v['win']:>8,}{wr:>7.1%}{v['spend']:>9,.0f}원{v['conv']:>8.1f}{per_req:>10.5f}{per_won:>10.1f}{dry:>7}")
    a, b = st["A (기존)"], st["B (신규)"]
    m_req = (b["conv"]/b["req"]) / (a["conv"]/a["req"]) - 1
    m_won = (b["conv"]/b["spend"]) / (a["conv"]/a["spend"]) - 1
    print(f"  → 요청당으로 재면 B가 {m_req*100:+.1f}%, 같은 돈으로 재면 {m_won*100:+.1f}%\n")

# 4단계: 읽는 법을 찍는다
print("읽는 법 — 진짜 모델 실력 차이는 8.0%다. 그런데 측정값은 기준에 따라 크게 달라진다.")
print("  - 요청당 전환: B가 크게 이긴다. 하지만 그 안에는 'B가 더 많이 샀다'가 섞여 있다.")
print("    B의 낙찰률이 A보다 9%p 높은 건 실력이 아니라 입찰가를 12% 높게 부른 결과다.")
print("  - 같은 돈당 전환: 차이가 확 줄어든다. 더 산 만큼 돈을 더 썼기 때문이다.")
print()
print("어느 쪽이 맞나 — 예산이 남는가로 나뉜다.")
print("  예산이 남는다면(①) 요청당이 맞다. 더 사서 더 버는 것도 실력이다.")
print("  예산이 구속된다면(②) 같은 돈당이 맞다. 어차피 다 쓸 돈이니 효율만 남는다.")
print("  실험 설계 전에 '우리 캠페인이 예산을 다 쓰고 있나'를 먼저 확인해야 하는 이유다.")

# 출력:
# 3단계 뜻: 두 그룹은 요청을 시간당 절반씩 받는다. B 는 같은 노출에서 전환을 8.0% 더 만들고, 입찰가는 12% 높다.
# 요청 시간당 4,000건(그룹당 절반), 예산 총 70,000원, 경쟁가 평균 900원 CPM
# 진짜 차이: B가 같은 노출에서 전환을 8.0% 더 만든다 (입찰가는 12% 높다)
#
# 3단계 뜻: 예산이 남으면 B 가 낙찰률 68.5% 로 A 의 59.2% 보다 많이 사서, 요청당으로는 +24.9% 이기지만 같은 돈당으로는 +0.7% 다.
# ① 예산이 남는 상태 (전량 소화에 44,292원 필요)
#   그룹              낙찰     낙찰률        지출       전환       요청당       만원당     마름
#   A (기존)      28,401  59.2%   19,770원  1413.4   0.02944     714.9      —
#   B (신규)      32,877  68.5%   24,522원  1765.0   0.03677     719.8      —
#   → 요청당으로 재면 B가 +24.9%, 같은 돈으로 재면 +0.7%
#
# 3단계 뜻: 예산을 30,000원으로 묶으면 B 는 14시, A 는 18시에 예산이 마른다. 값진 저녁을 놓친 B 가 두 기준 모두 -13.2% 로 진다.
# ② 예산이 구속되는 상태 (30,000원만 있다)
#   그룹              낙찰     낙찰률        지출       전환       요청당       만원당     마름
#   A (기존)      21,576  45.0%   15,000원   925.7   0.01928     617.1    18시
#   B (신규)      20,123  41.9%   15,000원   803.1   0.01673     535.4    14시
#   → 요청당으로 재면 B가 -13.2%, 같은 돈으로 재면 -13.2%
#
# 4단계 뜻: 코드가 찍는 해설이다. 진짜 실력 차이 8.0% 를 어느 기준으로 잴지는 예산이 남는가에 달렸다.
# 읽는 법 — 진짜 모델 실력 차이는 8.0%다. 그런데 측정값은 기준에 따라 크게 달라진다.
#   - 요청당 전환: B가 크게 이긴다. 하지만 그 안에는 'B가 더 많이 샀다'가 섞여 있다.
#     B의 낙찰률이 A보다 9%p 높은 건 실력이 아니라 입찰가를 12% 높게 부른 결과다.
#   - 같은 돈당 전환: 차이가 확 줄어든다. 더 산 만큼 돈을 더 썼기 때문이다.
#
# 어느 쪽이 맞나 — 예산이 남는가로 나뉜다.
#   예산이 남는다면(①) 요청당이 맞다. 더 사서 더 버는 것도 실력이다.
#   예산이 구속된다면(②) 같은 돈당이 맞다. 어차피 다 쓸 돈이니 효율만 남는다.
#   실험 설계 전에 '우리 캠페인이 예산을 다 쓰고 있나'를 먼저 확인해야 하는 이유다.
````

#### 블록 2

<!-- cb5 post=model-ab-testing block=1 sha=7abf11169493fba5 -->
````python
# 하는 일: 유저 20,000명에게 빈도 상한 하루 3회를 걸고, 트래픽을 유저 단위와 요청 단위로 쪼갤 때 상한을 넘긴 유저와 총 노출을 견준다.

import random
random.seed(42)

# 1단계: 유저와 빈도 상한을 둔다
# 소재 A/B 는 대개 유저로 쪼갠다. 모델 A/B 는 트래픽을 반씩 나누기만 하면 되는 요청 단위가 편하고, 같은 유저가 양쪽을 다 겪어도 상관없어 보인다. 그런데 상관이 있다. 유저 단위 규칙이 깨진다.
USERS = 20_000
REQ_PER_USER_MEAN = 6        # 유저당 평균 요청 수
FREQ_CAP = 3                # 같은 유저에게 하루 최대 3번까지만 노출

# 2단계: 쪼개는 단위마다 상한을 넘긴 유저를 세는 함수를 만든다
# 요청 단위면 요청마다 그룹을 새로 뽑고, 유저 단위면 유저의 그룹이 정해져 있다. 두 그룹은 빈도 카운터를 따로 든다.
def run(split_by):
    """split_by='request' 또는 'user'. 그룹마다 빈도 카운터를 따로 들고 있다고 가정."""
    over = 0            # 빈도 상한을 넘긴 유저 수
    shown_total = 0
    for u in range(USERS):
        n_req = max(1, int(random.gauss(REQ_PER_USER_MEAN, 2)))
        # 그룹별 노출 횟수
        count = {'A': 0, 'B': 0}
        arm_of_user = 'A' if random.random() < 0.5 else 'B'
        for _ in range(n_req):
            arm = (('A' if random.random() < 0.5 else 'B')
                   if split_by == 'request' else arm_of_user)
            if count[arm] < FREQ_CAP:      # 각 그룹이 자기 카운터로만 판단한다
                count[arm] += 1
        shown = count['A'] + count['B']
        shown_total += shown
        if shown > FREQ_CAP:
            over += 1
    return over, shown_total

# 3단계: 두 단위로 돌려 견준다
print(f"유저 {USERS:,}명, 유저당 평균 요청 {REQ_PER_USER_MEAN}건, 빈도 상한 하루 {FREQ_CAP}회\n")
print(f"{'쪼개는 단위':<12}{'상한 초과 유저':>14}{'비율':>8}{'총 노출':>10}{'유저당 평균':>12}")
for mode, label in (('user', '유저 단위'), ('request', '요청 단위')):
    over, total = run(mode)
    print(f"{label:<12}{over:>14,}{over/USERS:>7.1%}{total:>10,}{total/USERS:>12.2f}")

# 4단계: 읽는 법을 찍는다
print()
print("→ 요청 단위로 쪼개면 같은 유저가 A와 B를 번갈아 만난다.")
print("  각 그룹은 자기 카운터로만 3회를 세니, 유저는 최대 6번까지 볼 수 있다.")
print("  빈도 상한이 사실상 두 배가 되고, 그 초과 노출이 두 그룹의 성과에 섞여 들어간다.")
print("→ 유저 단위로 쪼개면 상한이 지켜진다. 대신 같은 표본 수를 모으는 데 더 오래 걸린다.")
print()
print("판단 기준: 실험이 건드리는 것이 '유저 경험'이면 유저 단위여야 한다.")
print("  빈도 상한, 시퀀스 피처, 리타게팅 주기처럼 유저 이력에 기대는 것이 있으면 전부 여기 해당한다.")

# 출력:
# 3단계 뜻: 유저 단위로 쪼개면 상한을 넘긴 유저가 0명이다. 요청 단위로 쪼개면 16,036명(80.2%)이 넘기고, 유저당 평균 노출이 2.91회에서 4.54회로 는다.
# 유저 20,000명, 유저당 평균 요청 6건, 빈도 상한 하루 3회
#
# 쪼개는 단위            상한 초과 유저      비율      총 노출      유저당 평균
# 유저 단위                    0   0.0%    58,142        2.91
# 요청 단위               16,036  80.2%    90,829        4.54
# 4단계 뜻: 코드가 찍는 해설이다. 요청 단위에서는 그룹마다 3회를 따로 세어 상한이 사실상 두 배가 되니, 유저 이력에 기대는 실험은 유저 단위로 쪼갠다.
#
# → 요청 단위로 쪼개면 같은 유저가 A와 B를 번갈아 만난다.
#   각 그룹은 자기 카운터로만 3회를 세니, 유저는 최대 6번까지 볼 수 있다.
#   빈도 상한이 사실상 두 배가 되고, 그 초과 노출이 두 그룹의 성과에 섞여 들어간다.
# → 유저 단위로 쪼개면 상한이 지켜진다. 대신 같은 표본 수를 모으는 데 더 오래 걸린다.
#
# 판단 기준: 실험이 건드리는 것이 '유저 경험'이면 유저 단위여야 한다.
#   빈도 상한, 시퀀스 피처, 리타게팅 주기처럼 유저 이력에 기대는 것이 있으면 전부 여기 해당한다.
````

#### 블록 3

<!-- cb5 post=model-ab-testing block=2 sha=009d821a091349de -->
````python
# 하는 일: 전환이 며칠 늦게 오고 B 가 주말에 특히 강할 때, 결과를 읽는 시점을 2일부터 21일까지 바꿔 측정된 CVR 차이를 참값과 견준다.

# 1단계: 전환 도착 분포와 요일 지수, 두 그룹의 CVR 을 둔다
# 모델 실험에는 두 지연이 겹친다. 전환은 며칠 늦게 오고, 요일 주기를 한 바퀴 돌아야 모든 날을 본다. 둘은 성질이 다르고 아래 계산이 그 차이를 보여 준다. ARRIVAL 은 클릭 후 며칠에 몇 %가 도착하나를 적은 가상 분포다.
ARRIVAL = [0.42, 0.23, 0.13, 0.08, 0.06, 0.05, 0.03]   # 1~7일차, 합 1.00
# 요일별 전환율 지수(가상). 주말이 다르다.
DOW_IDX = [1.00, 0.98, 1.02, 1.05, 1.15, 0.80, 0.75]   # 월~일

# 두 그룹의 진짜 CVR. B가 6% 낫다. 단 B는 주말에 특히 강하다고 하자
# (예: 주말 트래픽에 많은 세그먼트를 더 잘 잡는다).
TRUE = {'A': 0.0500, 'B': 0.0530}
WEEKEND_BOOST = {'A': 1.00, 'B': 1.18}

CLICKS_PER_DAY = 4_000

# 2단계: 평일만 볼 때와 한 주 전체를 볼 때의 참값을 찍는다
# 주말에는 B 의 CVR 에 1.18배를 곱하니, 평일만 볼 때와 한 주 전체를 볼 때 참값이 다르다.
def true_ratio(days):
    num = den = 0.0
    for d in range(days):
        dow = d % 7
        w = dow >= 5
        den += TRUE['A'] * DOW_IDX[dow]
        num += TRUE['B'] * DOW_IDX[dow] * (WEEKEND_BOOST['B'] if w else 1.0)
    return num / den - 1

print(f"클릭 하루 {CLICKS_PER_DAY:,}건씩")
print(f"전환 도착: 1일차 {ARRIVAL[0]:.0%}, 3일 누적 {sum(ARRIVAL[:3]):.0%}, 7일 누적 {sum(ARRIVAL):.0%}")
print(f"참값: 평일만 보면 B가 {true_ratio(5)*100:+.1f}%, 한 주 전체로 보면 {true_ratio(7)*100:+.1f}%")
print("  (B가 주말 트래픽에 특히 강하다고 가정했다 — 세그먼트 구성이 달라서)\n")

# 3단계: 읽는 시점마다 도착한 전환만으로 차이를 잰다
# 그날까지 도착한 몫만 세어 측정 CVR 을 낸다. 차이가 3% 를 넘으면 B 승으로 판정한다.
def read_at(day_cut):
    """day_cut일째에 결과를 읽는다. 그때까지 도착한 전환만 센다."""
    got = {'A': 0.0, 'B': 0.0}
    clicks = {'A': 0, 'B': 0}
    for d in range(day_cut):                      # 실험 d일차에 발생한 클릭
        dow = d % 7
        weekend = dow >= 5
        for arm in TRUE:
            cvr = TRUE[arm] * DOW_IDX[dow] * (WEEKEND_BOOST[arm] if weekend else 1.0)
            c = CLICKS_PER_DAY
            clicks[arm] += c
            # 이 클릭들의 전환 중, 읽는 시점까지 도착한 몫만 센다
            days_elapsed = day_cut - d
            arrived = sum(ARRIVAL[:min(days_elapsed, len(ARRIVAL))])
            got[arm] += c * cvr * arrived
    return {a: got[a] / clicks[a] for a in got}

print(f"{'읽는 시점':>10}{'A 측정 CVR':>12}{'B 측정 CVR':>12}{'측정된 차이':>12}{'판정':>16}")
for cut in (2, 3, 5, 7, 10, 14, 21):
    r = read_at(cut)
    diff = r['B'] / r['A'] - 1
    verdict = ("B 승" if diff > 0.03 else ("차이 없음" if abs(diff) <= 0.03 else "A 승"))
    print(f"{cut:>8}일{r['A']:>11.4%}{r['B']:>11.4%}{diff*100:>+11.1f}%{verdict:>16}")

# 4단계: 읽는 법을 찍는다
print()
print("두 지연이 서로 다르게 작용한다.")
print()
print("① 전환 도착 지연 — 절대값은 흔들지만 비교는 안 흔든다.")
print("  2일차 측정 CVR은 2.65%로 21일차 4.53%의 60%에 불과하다.")
print("  그런데 두 그룹이 똑같이 늦게 도착하므로 비율에서는 상쇄된다.")
print("  2, 3, 5일차 측정 차이가 모두 +6.0%로, 평일 참값과 정확히 같다.")
print("  → 그래서 'CVR이 몇 %인가'를 보고할 때는 도착을 기다려야 하지만,")
print("     'A와 B 중 누가 나은가'만 볼 거라면 도착 지연은 문제가 아니다.")
print()
print("② 요일 커버리지 — 비교 자체를 흔든다.")
print("  5일차까지는 +6.0%인데 7일차에 +8.9%로 뛴다. 주말이 들어왔기 때문이다.")
print("  5일차에 멈췄다면 B의 실력을 3%p 가까이 과소평가한 채 결론을 냈을 것이다.")
print("  → 그룹마다 잘하는 날이 다르면, 한 주기를 다 돌기 전에는 승자를 정할 수 없다.")
print()
print("그래서 최소 기간은 세 조건의 최댓값이다.")
print("  (1) 표본 크기가 차는 데 걸리는 시간")
print("  (2) 요일 주기 한 바퀴 — 7일. 월초, 월말 효과가 의심되면 더")
print("  (3) 절대 CVR을 보고해야 한다면 전환 도착이 끝나는 시간까지 — 위 분포면 7일")

# 출력:
# 2단계 뜻: 전환은 1일차에 42%, 3일 누적 78% 가 도착하고 7일이면 모두 온다. 참 차이는 평일만 보면 +6.0%, 주말까지 넣은 한 주 전체로 보면 +10.4% 다.
# 클릭 하루 4,000건씩
# 전환 도착: 1일차 42%, 3일 누적 78%, 7일 누적 100%
# 참값: 평일만 보면 B가 +6.0%, 한 주 전체로 보면 +10.4%
#   (B가 주말 트래픽에 특히 강하다고 가정했다 — 세그먼트 구성이 달라서)
#
# 3단계 뜻: 측정 CVR 은 전환이 도착하는 만큼 2일 2.6540% 에서 21일 4.5295% 로 오른다. 측정된 차이는 5일까지 +6.0% 로 평일 참값과 같다가, 주말이 들어온 7일에 +8.9% 로 뛴다.
#      읽는 시점    A 측정 CVR    B 측정 CVR      측정된 차이              판정
#        2일    2.6540%    2.8132%       +6.0%             B 승
#        3일    3.0757%    3.2602%       +6.0%             B 승
#        5일    3.7239%    3.9473%       +6.0%             B 승
#        7일    3.9457%    4.2963%       +8.9%             B 승
#       10일    4.1960%    4.5795%       +9.1%             B 승
#       14일    4.3836%    4.8091%       +9.7%             B 승
#       21일    4.5295%    4.9801%       +9.9%             B 승
# 4단계 뜻: 코드가 찍는 해설이다. 도착 지연은 두 그룹이 같이 겪어 비율에서 상쇄되지만, 요일 커버리지는 비교 자체를 흔든다.
#
# 두 지연이 서로 다르게 작용한다.
#
# ① 전환 도착 지연 — 절대값은 흔들지만 비교는 안 흔든다.
#   2일차 측정 CVR은 2.65%로 21일차 4.53%의 60%에 불과하다.
#   그런데 두 그룹이 똑같이 늦게 도착하므로 비율에서는 상쇄된다.
#   2, 3, 5일차 측정 차이가 모두 +6.0%로, 평일 참값과 정확히 같다.
#   → 그래서 'CVR이 몇 %인가'를 보고할 때는 도착을 기다려야 하지만,
#      'A와 B 중 누가 나은가'만 볼 거라면 도착 지연은 문제가 아니다.
#
# ② 요일 커버리지 — 비교 자체를 흔든다.
#   5일차까지는 +6.0%인데 7일차에 +8.9%로 뛴다. 주말이 들어왔기 때문이다.
#   5일차에 멈췄다면 B의 실력을 3%p 가까이 과소평가한 채 결론을 냈을 것이다.
#   → 그룹마다 잘하는 날이 다르면, 한 주기를 다 돌기 전에는 승자를 정할 수 없다.
#
# 그래서 최소 기간은 세 조건의 최댓값이다.
#   (1) 표본 크기가 차는 데 걸리는 시간
#   (2) 요일 주기 한 바퀴 — 7일. 월초, 월말 효과가 의심되면 더
#   (3) 절대 CVR을 보고해야 한다면 전환 도착이 끝나는 시간까지 — 위 분포면 7일
````

### 부록 10: attribution-basics (블록 2개, Task 3)

#### 블록 1

<!-- cb5 post=attribution-basics block=0 sha=6bd6e08ec8ed31ce -->
````python
# 하는 일: 민지의 2주 여정에 어트리뷰션 규칙 5개를 각각 적용해, 클릭 3건에 매출 89,000원을 나눠 본다.
from datetime import date

# 1단계: 매출과 여정 로그를 둔다
# 표준 라이브러리만 쓰니 그대로 복붙해 돌려볼 수 있다.
REVENUE = 89_000        # 전환 1건의 매출(원)
CONV_DAY = date(2026, 3, 12)   # 구매가 일어난 날
HALF_LIFE_DAYS = 7      # 시간감쇠 반감기: 7일 전 접점은 절반의 공만 받는다

# 여정 로그. 크레딧은 '클릭'에만 준다(노출 기여는 규칙마다 다르므로 여기선 제외).
touchpoints = [
    {"day": date(2026, 3,  4), "channel": "인스타그램",     "kind": "impression"},
    {"day": date(2026, 3,  5), "channel": "인스타그램",     "kind": "impression"},
    {"day": date(2026, 3,  7), "channel": "유튜브",         "kind": "impression"},
    {"day": date(2026, 3,  9), "channel": "네이버 검색광고", "kind": "click"},
    {"day": date(2026, 3, 11), "channel": "인스타그램",     "kind": "click"},
    {"day": date(2026, 3, 12), "channel": "브랜드 검색광고", "kind": "click"},
]
clicks = [t for t in touchpoints if t["kind"] == "click"]   # 크레딧 대상 3건

# 2단계: 규칙 다섯을 가중치 함수로 만든다
# 규칙마다 클릭 n 건에 줄 가중치 목록을 돌려준다. 가중치를 어떻게 만드느냐가 규칙의 전부다.
def last_click(n):                      # 마지막 클릭이 전부 가져간다
    return [0.0] * (n - 1) + [1.0]

def first_click(n):                     # 첫 클릭이 전부 가져간다
    return [1.0] + [0.0] * (n - 1)

def linear(n):                          # 거쳐 온 모두에게 똑같이
    return [1.0 / n] * n

def time_decay(days_before):            # 전환에 가까울수록 더 — 반감기 7일
    w = [0.5 ** (d / HALF_LIFE_DAYS) for d in days_before]
    total = sum(w)
    return [x / total for x in w]       # 합이 1이 되도록 정규화

def u_shaped(n):                        # 첫, 마지막을 40%씩, 중간은 남은 20%를 나눠
    if n == 1:
        return [1.0]
    if n == 2:
        return [0.5, 0.5]
    mid = [0.2 / (n - 2)] * (n - 2)
    return [0.4] + mid + [0.4]

# 3단계: 클릭 3건에 규칙마다 가중치를 매긴다
# 시간감쇠는 클릭이 전환 며칠 전이었는지로 가중치를 정한다.
n = len(clicks)
days_before = [(CONV_DAY - t["day"]).days for t in clicks]   # [3, 1, 0]

rules = {
    "라스트클릭":   last_click(n),
    "퍼스트클릭":   first_click(n),
    "선형(균등)":   linear(n),
    "시간감쇠(7일)": time_decay(days_before),
    "U자형(40/20/40)": u_shaped(n),
}

# 4단계: 규칙마다 매출을 나눠 찍고 합을 검산한다
for name, weights in rules.items():
    cells = " | ".join(f"{w*100:5.1f}% {round(w*REVENUE):>8,}원" for w in weights)
    # 어떤 규칙이든 배분의 합은 매출과 같아야 한다 — 규칙의 기본 성질
    assert abs(sum(w * REVENUE for w in weights) - REVENUE) < 1e-6
    print(f"{name:<18}{cells}")

# 출력:
# 4단계 뜻: 칸은 클릭 차례대로 네이버 검색광고, 인스타그램, 브랜드 검색광고다. 같은 89,000원을 라스트클릭은 마지막 클릭에, 퍼스트클릭은 첫 클릭에 모두 주고, 시간감쇠는 전환에 가까운 클릭일수록 24,966원, 30,433원, 33,601원으로 늘린다.
# 라스트클릭               0.0%        0원 |   0.0%        0원 | 100.0%   89,000원
# 퍼스트클릭             100.0%   89,000원 |   0.0%        0원 |   0.0%        0원
# 선형(균등)             33.3%   29,667원 |  33.3%   29,667원 |  33.3%   29,667원
# 시간감쇠(7일)           28.1%   24,966원 |  34.2%   30,433원 |  37.8%   33,601원
# U자형(40/20/40)      40.0%   35,600원 |  20.0%   17,800원 |  40.0%   35,600원
````

#### 블록 2

<!-- cb5 post=attribution-basics block=1 sha=be68406821c7e800 -->
````python
# 하는 일: 노출군과 대조군 10만 명씩의 홀드아웃 결과로 광고가 실제로 만든 전환을 계산하고, 어트리뷰션(회계)이 말하는 숫자와 나란히 본다.
import math

# 1단계: 홀드아웃 실험 결과를 둔다
n_exposed,  buy_exposed  = 100_000, 2_500   # 노출군: 광고를 봤다
n_control,  buy_control  = 100_000, 2_000   # 대조군: 일부러 안 보여줬다(홀드아웃)
SPEND = 10_000_000                          # 이 캠페인에 쓴 광고비(원)

# 2단계: 증분과 lift, 두 CPA 를 구한다
p_e = buy_exposed / n_exposed               # 0.025
p_c = buy_control / n_control               # 0.020

incremental = buy_exposed - buy_control * (n_exposed / n_control)  # 두 군 크기가 같으면 단순 차이
lift = (p_e - p_c) / p_c                    # 대조군 대비 몇 % 더 샀나

# 겉보기 CPA는 라스트클릭이 잡은 전환 전부(2,500)를 광고 공으로 치고 계산한다.
cpa_apparent    = SPEND / buy_exposed
cpa_incremental = SPEND / incremental

# 3단계: 차이가 우연인지 z 로 대충 본다
# 두 비율 차이의 표준오차를 정규 근사로 구한다.
se = math.sqrt(p_e * (1 - p_e) / n_exposed + p_c * (1 - p_c) / n_control)
z  = (p_e - p_c) / se                       # |z| >= 1.96 이면 95% 수준에서 유의

# 4단계: 결과를 찍는다
print(f"증분 전환      {incremental:,.0f}건  (어트리뷰션이 말하는 건수: {buy_exposed:,}건)")
print(f"과대 배수      {buy_exposed / incremental:.1f}배")
print(f"증분율(lift)   {lift:+.1%}")
print(f"겉보기 CPA     {cpa_apparent:,.0f}원")
print(f"증분 CPA       {cpa_incremental:,.0f}원")
print(f"z = {z:.2f}")

# 출력:
# 4단계 뜻: 광고가 실제로 만든 전환은 500건인데 어트리뷰션은 2,500건이라 말해 5.0배 부풀린다. 같은 광고비가 겉보기로는 전환당 4,000원, 증분으로는 20,000원이다. z = 7.54 라 차이가 우연일 가능성은 거의 없다.
# 증분 전환      500건  (어트리뷰션이 말하는 건수: 2,500건)
# 과대 배수      5.0배
# 증분율(lift)   +25.0%
# 겉보기 CPA     4,000원
# 증분 CPA       20,000원
# z = 7.54
````

### 부록 11: privacy-signal-loss (블록 2개, Task 3)

#### 블록 1

<!-- cb5 post=privacy-signal-loss block=0 sha=c252c00555cf0d50 -->
````python
# 하는 일: 구매 20만 건의 금액을 전환값 64개(6비트)에 선형 간격과 로그 간격으로 접어, 되돌린 금액이 얼마나 남고 얼마나 뭉개지나 본다.
import random, math, statistics

# 1단계: 중앙값 28,000원인 구매 20만 건을 만든다
random.seed(3)
N = 200000
MU, SIGMA = math.log(28000), 1.0          # 중앙값 28,000원짜리 구매 분포

amounts = [random.lognormvariate(MU, SIGMA) for _ in range(N)]

# 2단계: 금액을 구간 64개에 접는 두 방식을 만든다
# 선형은 5,000원 간격이고, 로그는 금액이 커질수록 간격이 넓어진다. 둘 다 구간 번호와 그 구간에서 되돌릴 금액을 돌려준다.
def linear(a):
    """5,000원 간격 구간 64개. 315,000원 이상은 전부 63번 값."""
    b = min(int(a // 5000), 63)
    return b, b * 5000 + 2500

LO, HI = 1000.0, 1000000.0
STEP = (math.log(HI) - math.log(LO)) / 64

def logscale(a):
    """1,000원~1,000,000원을 로그 간격 구간 64개로. 복원값은 구간의 기하 중앙."""
    b = min(max(int((math.log(max(a, LO)) - math.log(LO)) / STEP), 0), 63)
    return b, math.exp(math.log(LO) + (b + 0.5) * STEP)

# 3단계: 실제 총매출과 상위 1% 경계를 찍는다
true_sum = sum(amounts)
cut = sorted(amounts)[int(N * 0.99)]        # 상위 1% 경계
print(f"구매 {N:,}건, 실제 총매출 {true_sum/1e8:.2f}억원, "
      f"평균 {true_sum/N:,.0f}원, 상위 1% 경계 {cut:,.0f}원")

# 4단계: 두 방식으로 접었다 되돌린 금액을 실제와 견준다
for name, f in (("선형 5천원", linear), ("로그 간격", logscale)):
    est = [f(a)[1] for a in amounts]
    rel = [abs(e - a) / a for e, a in zip(est, amounts)]
    top = [(e, a) for e, a in zip(est, amounts) if a >= cut]
    full = sum(1 for a in amounts if f(a)[0] == 63)
    print(f"{name}: 총매출 {sum(est)/1e8:>5.2f}억원 "
          f"({(sum(est)/true_sum-1)*100:+5.1f}%), 건당 오차 중앙값 "
          f"{statistics.median(rel)*100:>4.1f}%, 상위 1% 매출 "
          f"{(sum(e for e, _ in top)/sum(a for _, a in top)-1)*100:+6.1f}%, "
          f"마지막 구간 {full/N*100:.2f}%")

# 5단계: 전환 여부 1비트만 받는 경우와 견준다
# 금액은 학습 시점에 하나로 가정할 수밖에 없어, 여기서는 평균 금액으로 둔다.
flat = true_sum / N
print(f"1비트(전환 여부)만: 건당 오차 중앙값 "
      f"{statistics.median([abs(flat - a) / a for a in amounts])*100:.1f}%")

# 출력:
# 3단계 뜻: 구매 200,000건의 실제 총매출은 92.29억원, 평균은 46,145원이고, 상위 1% 는 284,231원부터다.
# 구매 200,000건, 실제 총매출 92.29억원, 평균 46,145원, 상위 1% 경계 284,231원
# 4단계 뜻: 선형 5천원은 마지막 구간에 0.77% 가 몰려 상위 1% 매출을 -26.5% 깎고, 총매출을 -2.5% 덜 잡는다. 로그 간격은 총매출 -0.1%, 상위 1% 매출 -1.8% 다.
# 선형 5천원: 총매출 90.01억원 ( -2.5%), 건당 오차 중앙값  3.8%, 상위 1% 매출  -26.5%, 마지막 구간 0.77%
# 로그 간격: 총매출 92.18억원 ( -0.1%), 건당 오차 중앙값  2.7%, 상위 1% 매출   -1.8%, 마지막 구간 0.03%
# 5단계 뜻: 금액 없이 전환 여부만 받으면 모든 구매를 평균 금액으로 쳐서, 건당 오차 중앙값이 76.4% 로 벌어진다.
# 1비트(전환 여부)만: 건당 오차 중앙값 76.4%
````

#### 블록 2

<!-- cb5 post=privacy-signal-loss block=1 sha=e36e9e4a1c08b394 -->
````python
# 하는 일: 버킷 40개에 500줄씩 담은 데이터를 30번 만들어, 개인 라벨과 버킷 합계(집계 라벨)로 배운 로지스틱 회귀 계수의 평균과 흔들림을 견준다.
import random, math, statistics

# 1단계: 참 계수와 버킷 데이터를 만드는 함수를 둔다
# 버킷(bag) 하나는 캠페인 하루치이고, 버킷마다 피처 구성비가 다르다. 구성비가 달라야 버킷 합계로도 계수가 되살아난다.
random.seed(7)
TRUE = (-3.0, 1.2, 0.8)          # 절편, x1(리타겟 여부), x2(고관여 지면)
CELLS = [(0, 0), (0, 1), (1, 0), (1, 1)]

def sigmoid(z):
    return 1.0 / (1.0 + math.exp(-z))

def make_bags(n_bags=40, per_bag=500):
    """버킷(bag) 하나 = 캠페인 하루치. 버킷마다 피처 구성비가 다르다."""
    bags = []
    for _ in range(n_bags):
        r1, r2 = random.uniform(0.1, 0.9), random.uniform(0.1, 0.9)
        cnt = {c: 0 for c in CELLS}
        pos = {c: 0 for c in CELLS}
        for _ in range(per_bag):
            x1 = 1 if random.random() < r1 else 0
            x2 = 1 if random.random() < r2 else 0
            p = sigmoid(TRUE[0] + TRUE[1] * x1 + TRUE[2] * x2)
            cnt[(x1, x2)] += 1
            pos[(x1, x2)] += 1 if random.random() < p else 0
        bags.append((cnt, pos))
    return bags

# 2단계: 두 가지 라벨로 계수를 맞추는 함수를 만든다
# 개인 라벨은 줄마다 y 가 있는 표준 로지스틱 회귀다. 집계 라벨은 버킷마다 전환 합계만 있어, 예측 합계가 관측 합계에 맞도록 민다.
def fit_individual(bags, steps=800, lr=4.0):
    """개인 라벨: 줄마다 y가 있다. 표준 로지스틱 회귀."""
    w = [0.0, 0.0, 0.0]
    n = sum(sum(c.values()) for c, _ in bags)
    for _ in range(steps):
        g = [0.0, 0.0, 0.0]
        for cnt, pos in bags:
            for (x1, x2) in CELLS:
                p = sigmoid(w[0] + w[1] * x1 + w[2] * x2)
                e = p * cnt[(x1, x2)] - pos[(x1, x2)]
                g[0] += e; g[1] += e * x1; g[2] += e * x2
        for j in range(3):
            w[j] -= lr * g[j] / n
    return w

def fit_aggregate(bags, steps=8000, lr=4.0):
    """집계 라벨: 버킷마다 전환 '합계'만 있다. 합계를 맞추도록 민다."""
    w = [0.0, 0.0, 0.0]
    nb = len(bags)
    for _ in range(steps):
        g = [0.0, 0.0, 0.0]
        for cnt, pos in bags:
            m = sum(cnt.values())
            s = sum(sigmoid(w[0] + w[1] * x1 + w[2] * x2) * cnt[(x1, x2)]
                    for (x1, x2) in CELLS)
            d = (s - sum(pos.values())) / m          # 버킷 하나의 오차(비율)
            for (x1, x2) in CELLS:
                p = sigmoid(w[0] + w[1] * x1 + w[2] * x2)
                q = d * p * (1 - p) * cnt[(x1, x2)] / m
                g[0] += q; g[1] += q * x1; g[2] += q * x2
        for j in range(3):
            w[j] -= lr * g[j] / nb
    return w

# 3단계: 같은 실험을 30번 되풀이한다
ind, agg = [], []
for _ in range(30):                                  # 같은 실험을 30번
    bags = make_bags()
    ind.append(fit_individual(bags))
    agg.append(fit_aggregate(bags))

# 4단계: 계수마다 평균과 표준편차를 찍는다
for name, res in (("개인 라벨", ind), ("집계 라벨", agg)):
    for j, label in enumerate(("절편", "x1", "x2")):
        col = [r[j] for r in res]
        print(f"{name} {label}: 평균 {statistics.mean(col):+.3f} "
              f"(참값 {TRUE[j]:+.1f}), 표준편차 {statistics.pstdev(col):.3f}")

# 5단계: 흔들림의 배수와 필요한 데이터 배수를 찍는다
# 흔들림은 데이터 양의 제곱근에 반비례해서, 배수를 제곱한 만큼 데이터가 더 필요하다.
r = [statistics.pstdev([a[j] for a in agg]) / statistics.pstdev([i[j] for i in ind])
     for j in range(3)]
print("표준편차 배수(집계÷개인):", " ".join(f"{x:.1f}배" for x in r))
print("같은 흔들림까지 줄이려면 데이터가:", " ".join(f"{x*x:.0f}배" for x in r))

# 출력:
# 4단계 뜻: 개인 라벨로 배운 계수는 평균이 -2.999, +1.210, +0.795 로 참값에 붙고, 표준편차는 0.036, 0.040, 0.045 다.
# 개인 라벨 절편: 평균 -2.999 (참값 -3.0), 표준편차 0.036
# 개인 라벨 x1: 평균 +1.210 (참값 +1.2), 표준편차 0.040
# 개인 라벨 x2: 평균 +0.795 (참값 +0.8), 표준편차 0.045
# 4단계 뜻: 집계 라벨도 평균은 -3.015, +1.219, +0.808 로 참값을 비틀지 않지만, 표준편차가 0.120, 0.132, 0.117 로 커진다.
# 집계 라벨 절편: 평균 -3.015 (참값 -3.0), 표준편차 0.120
# 집계 라벨 x1: 평균 +1.219 (참값 +1.2), 표준편차 0.132
# 집계 라벨 x2: 평균 +0.808 (참값 +0.8), 표준편차 0.117
# 5단계 뜻: 집계 라벨의 흔들림은 개인 라벨의 3.3배, 3.3배, 2.6배라, 같은 흔들림까지 줄이려면 데이터가 11배, 11배, 7배 필요하다.
# 표준편차 배수(집계÷개인): 3.3배 3.3배 2.6배
# 같은 흔들림까지 줄이려면 데이터가: 11배 11배 7배
````

### 부록 12: pctr-prediction (블록 1개, Task 4)

#### 블록 1

<!-- cb5 post=pctr-prediction block=0 sha=bc3a9b46431b1858 -->
````python
# 하는 일: 노출 12건(클릭 3건)의 pCTR 예측과 그 예측에 전부 0.5 를 곱한 예측으로, AUC 는 그대로인데 LogLoss 와 입찰가가 달라지는 것을 직접 확인한다.
import math

# 1단계: 노출 12건의 예측을 둔다
# (노출 번호, 실제 클릭 여부 y, 모델이 낸 pCTR 예측 p) — 클릭 3건, 무클릭 9건.
# 일부러 "낮은 p인데 클릭"(#2), "높은 p인데 무클릭"(#6)을 하나씩 섞어
# AUC가 1.0(완벽)이 아니게 만들었다 — 실제 모델도 이 정도 노이즈는 흔하다.
# 표준 라이브러리만 쓰고, 값은 하드코딩해 실행할 때마다 같은 결과가 나오게 한다.
data = [
    (1,  0, 0.05), (2,  1, 0.12), (3,  1, 0.35), (4,  0, 0.08),
    (5,  0, 0.20), (6,  0, 0.30), (7,  0, 0.15), (8,  1, 0.45),
    (9,  0, 0.10), (10, 0, 0.25), (11, 0, 0.18), (12, 0, 0.22),
]


# 2단계: AUC 와 LogLoss 를 직접 구하는 함수를 만든다
# AUC(줄 세우기 점수)는 예측값의 순위만 보고, LogLoss 는 예측 확률의 절댓값까지 본다.
def auc(rows):
    """순위 기반 AUC를 직접 센다 (사이킷런 없이).
    모든 (클릭, 무클릭) 쌍을 하나씩 비교해, 클릭 쪽 예측이 더 높으면 1점,
    같으면 0.5점을 주고, 전체 쌍 수로 나눈다. 이게 AUC의 원래 정의(Mann-Whitney)다."""
    pos = [p for _, y, p in rows if y == 1]   # 클릭 3건의 예측
    neg = [p for _, y, p in rows if y == 0]   # 무클릭 9건의 예측
    win = 0.0
    for pp in pos:
        for pn in neg:
            if pp > pn:
                win += 1.0
            elif pp == pn:
                win += 0.5
    return win / (len(pos) * len(neg))        # 3*9 = 27쌍


def logloss(rows):
    """binary cross-entropy(로그 손실). row는 (id, y, p) 형태."""
    eps = 1e-12  # p가 0이나 1에 붙어 log(0)이 나는 사고 방지
    total = 0.0
    for _, y, p in rows:
        p = min(max(p, eps), 1 - eps)
        total += -(y * math.log(p) + (1 - y) * math.log(1 - p))
    return total / len(rows)


# 3단계: 예측을 절반으로 깎아 두 지표를 견준다
# half 는 원래 예측 p 에 전부 0.5 를 곱한 버전(p_half)이다. 보정이 어긋나 예측이 통째로 눌린 상황이다.
half = [(i, y, 0.5 * p) for i, y, p in data]   # 모든 예측에 0.5를 곱한 버전

auc_orig, auc_half = auc(data), auc(half)
ll_orig, ll_half = logloss(data), logloss(half)

print(f"AUC       원본 {auc_orig:.4f}  ->  절반 {auc_half:.4f}   (차이 {auc_orig - auc_half:.10f})")
print(f"LogLoss   원본 {ll_orig:.4f}  ->  절반 {ll_half:.4f}   ({ll_half - ll_orig:+.4f})")

# 4단계: 노출 #3 의 입찰가를 견준다
# 입찰가는 관례상 '가치 × pCTR'에 비례한다. 예측을 절반으로 깎으면
# 이 12건 전부에서 입찰가도 정확히 절반이 된다 — 경매에서 조용히 밀린다.
CLICK_VALUE = 1_000  # 클릭 1회의 가치를 편의상 ₩1,000이라 두면
i, y, p = data[2]     # 노출 #3 (p=0.35, 실제로 클릭까지 된 건)
print(f"노출 #{i} 입찰가   원본 ₩{CLICK_VALUE * p:.0f}  ->  절반 ₩{CLICK_VALUE * 0.5 * p:.0f}")

# 출력:
# 3단계 뜻: 모든 예측에 0.5 를 곱해도 순서는 그대로라 AUC 는 0.7778 로 소수점 열 자리까지 같다. LogLoss 는 0.4738 에서 0.5713 으로 +0.0975 나빠진다.
# AUC       원본 0.7778  ->  절반 0.7778   (차이 0.0000000000)
# LogLoss   원본 0.4738  ->  절반 0.5713   (+0.0975)
# 4단계 뜻: 실제로 클릭된 노출 #3 의 입찰가가 ₩350 에서 ₩175 로 절반이 된다. AUC 는 그대로인데 경매에서는 조용히 밀린다.
# 노출 #3 입찰가   원본 ₩350  ->  절반 ₩175
````

### 부록 13: pCVR-modeling (블록 2개, Task 4)

#### 블록 1

<!-- cb5 post=pCVR-modeling block=0 sha=1f20e8c83e98768a -->
````python
# 하는 일: 표 ①의 원본 전환 로그 10건에 중복 규칙 3가지를 적용해 전환 수를 세어 본다.
from datetime import datetime as dt

# 1단계: 전환 로그 10건을 둔다
# (행, 유저, 주문번호, 채널, 클릭여부, 전환기록시각, 매출)
# 6번 행은 클릭 없이 노출만 있다가 전환 픽셀만 찍힌 경우다(주문번호 없음).
rows = [
    (1,  "U1001", "O-8842", "앱", True,  dt(2026, 8, 1, 9, 3),   42_000),
    (2,  "U1001", "O-8842", "웹", True,  dt(2026, 8, 1, 9, 5),   42_000),
    (3,  "U1001", "O-8842", "앱", True,  dt(2026, 8, 1, 9, 41),  42_000),
    (4,  "U1002", "O-9910", "웹", True,  dt(2026, 8, 1, 10, 16), 18_500),
    (5,  "U1002", "O-9910", "웹", True,  dt(2026, 8, 2, 8, 0),   18_500),
    (6,  "U1003", None,     "앱", False, dt(2026, 8, 1, 11, 2),  25_000),
    (7,  "U1004", "O-7773", "웹", True,  dt(2026, 8, 1, 12, 4),  55_000),
    (8,  "U1004", "O-7774", "웹", True,  dt(2026, 8, 3, 9, 0),   12_000),
    (9,  "U1005", "O-6650", "앱", True,  dt(2026, 8, 1, 13, 32), 31_000),
    (10, "U1005", "O-6650", "앱", True,  dt(2026, 8, 6, 10, 0),  31_000),
]

# 2단계: 클릭 필터와 중복 규칙 셋을 만든다
# 세 규칙은 무엇을 같은 키로 묶느냐만 다르다. 주문번호, 같은 유저의 24시간 안, (유저, 채널) 쌍이다.
clicked = [r for r in rows if r[4]]  # 클릭 필터: 6번(노출만) 제외 — 어떤 규칙도 이건 대신 안 걸러준다

def by_order_key(rs):                # 주문번호가 같으면 하나로 합친다
    seen, count = set(), 0
    for r in rs:
        if r[2] not in seen:
            seen.add(r[2])
            count += 1
    return count

def by_time_window(rs, hours=24):    # 같은 유저 안에서 window 시간 이내 재발생은 합친다
    by_user = {}
    for r in rs:
        by_user.setdefault(r[1], []).append(r)
    count = 0
    for user, urows in by_user.items():
        urows.sort(key=lambda r: r[5])
        clusters = []
        for r in urows:
            if clusters and (r[5] - clusters[-1][-1][5]).total_seconds() <= hours * 3600:
                clusters[-1].append(r)
            else:
                clusters.append([r])
        count += len(clusters)
    return count

def by_device(rs):                   # 같은 유저, 같은 기기(채널)면 합친다 — 기기가 다르면 별개
    seen, count = set(), 0
    for r in rs:
        key = (r[1], r[3])
        if key not in seen:
            seen.add(key)
            count += 1
    return count

# 3단계: 규칙마다 전환 수를 센다
print(f"원본 {len(rows)}건 -> 클릭 필터 후 {len(clicked)}건")
print(f"주문키 기준               : {by_order_key(clicked)}건")
print(f"시간 윈도우 기준(24시간)  : {by_time_window(clicked)}건")
print(f"기기 기준                 : {by_device(clicked)}건")

# 출력:
# 3단계 뜻: 클릭 없이 노출만 있던 6번을 빼면 9건이다. 같은 9건도 주문키와 기기 기준으로는 5건, 24시간 윈도우로는 6건으로 센다.
# 원본 10건 -> 클릭 필터 후 9건
# 주문키 기준               : 5건
# 시간 윈도우 기준(24시간)  : 6건
# 기기 기준                 : 5건
````

#### 블록 2

<!-- cb5 post=pCVR-modeling block=1 sha=7d798731ed04fd65 -->
````python
# 하는 일: 표 ②의 D+0~D+7 누적 전환 관측 비율로, 오늘 학습하면 pCVR 이 얼마나 과소추정되는지 경과일마다 계산한다.

# 1단계: 오늘 클릭한 코호트와 누적 관측 비율을 둔다
CLICKS = 10_000       # 오늘 클릭한 노출 수(코호트)
FINAL_CVR = 0.05      # 충분히 기다리면(D+30 등) 이 코호트가 도달하는 '최종' 전환율

cum_pct_by_day = {     # 표 ②: 경과일별 누적 전환 관측 비율
    0: 0.42, 1: 0.61, 2: 0.74, 3: 0.83,
    4: 0.89, 5: 0.93, 6: 0.96, 7: 0.98,
}

# 2단계: 경과일마다 관측 CVR 과 과소추정 배수를 찍는다
# 그 시점까지 보이는 전환만으로 학습하면 그때의 관측 CVR 이 정답이 된다.
final_conversions = CLICKS * FINAL_CVR
print(f"최종 전환(충분히 기다리면): {final_conversions:.0f}건 / 최종 CVR {FINAL_CVR:.2%}")

for day, pct in cum_pct_by_day.items():
    observed = final_conversions * pct        # 그 시점까지 실제로 '보이는' 전환 수
    observed_cvr = observed / CLICKS          # 그래서 그 시점에 학습하면 나오는 CVR
    underestimate = FINAL_CVR / observed_cvr  # 최종 대비 몇 배 낮게 보고 있나
    print(f"D+{day}  관측 {observed:.0f}건  관측CVR {observed_cvr:.2%}  실제/관측 {underestimate:.2f}배")

# 출력:
# 2단계 뜻: 충분히 기다리면 이 코호트의 전환은 500건, 최종 CVR 은 5.00% 다.
# 최종 전환(충분히 기다리면): 500건 / 최종 CVR 5.00%
# 2단계 뜻: 당일(D+0)에 학습하면 관측 CVR 2.10% 를 정답으로 믿어 실제보다 2.38배 낮게 본다. 일주일을 기다려도(D+7) 1.02배만큼 낮다.
# D+0  관측 210건  관측CVR 2.10%  실제/관측 2.38배
# D+1  관측 305건  관측CVR 3.05%  실제/관측 1.64배
# D+2  관측 370건  관측CVR 3.70%  실제/관측 1.35배
# D+3  관측 415건  관측CVR 4.15%  실제/관측 1.20배
# D+4  관측 445건  관측CVR 4.45%  실제/관측 1.12배
# D+5  관측 465건  관측CVR 4.65%  실제/관측 1.08배
# D+6  관측 480건  관측CVR 4.80%  실제/관측 1.04배
# D+7  관측 490건  관측CVR 4.90%  실제/관측 1.02배
````

### 부록 14: conversion-definition (블록 3개, Task 4)

#### 블록 1

<!-- cb5 post=conversion-definition block=0 sha=7e25511e6e3f8012 -->
````python
# 하는 일: 전환 정의가 다른 여섯 유형을 한 통에 담아 pCVR 모델 하나로 예측할 때, 유형마다 얼마나 과소예측하고 과대예측하는지 센다.

# 1단계: 전환 유형 여섯의 기저 전환율과 트래픽 비중을 둔다
# 플랫폼은 광고주 수천 곳을 함께 서비스하는데, 전환 정의는 광고주가 고른다. 보험사는 "상담 신청"을, 쇼핑몰은 "구매 완료"를, 게임사는 "앱 설치"를 전환으로 잡는다.
# 가상 데이터: 전환 유형별 기저 전환율(클릭 → 전환)과 트래픽 비중
TYPES = [
    ("상담 신청",   0.150, 0.15),   # 문턱이 낮다 — 자주 일어난다
    ("앱 설치",     0.080, 0.25),
    ("회원가입",    0.045, 0.20),
    ("장바구니",    0.030, 0.15),
    ("구매 완료",   0.020, 0.20),
    ("재구매",      0.003, 0.05),   # 문턱이 아주 높다
]

# 2단계: 섞은 평균과 유형별 배수를 찍는다
total_w = sum(w for _, _, w in TYPES)
mixed = sum(cvr * w for _, cvr, w in TYPES) / total_w   # 전체를 섞은 평균 전환율

print(f"{'전환 유형':<10}{'기저 전환율':>12}{'트래픽 비중':>12}{'섞은 평균 대비':>15}")
for name, cvr, w in TYPES:
    print(f"{name:<10}{cvr:>11.1%}{w:>11.0%}{cvr/mixed:>14.2f}배")
print(f"{'— 섞은 평균':<10}{mixed:>11.1%}{'':>11}{'1.0배':>14}")
print()
print(f"가장 높은 유형(상담 신청 {TYPES[0][1]:.1%})과 가장 낮은 유형(재구매 {TYPES[-1][1]:.1%})의 차이"
      f"  {TYPES[0][1]/TYPES[-1][1]:.0f}배")
print()

# 3단계: 유형을 구분하지 않은 모델의 오차를 찍는다
# 모델이 다른 정보를 전혀 못 쓴다고 하면, 최선의 예측은 섞은 평균이다.
print("유형을 피처로 안 넣은 모델의 예측 = 섞은 평균 (모두에게 같은 값)")
print(f"{'전환 유형':<10}{'예측':>9}{'실제':>9}{'COPC':>8}{'판정':>16}")
for name, cvr, w in TYPES:
    copc = cvr / mixed          # COPC = 실제 ÷ 예측
    verdict = "심하게 과소예측" if copc > 2 else ("과소예측" if copc > 1.2 else
              ("심하게 과대예측" if copc < 0.5 else ("과대예측" if copc < 0.8 else "괜찮음")))
    print(f"{name:<10}{mixed:>8.1%}{cvr:>8.1%}{copc:>8.2f}{verdict:>16}")
print()

# 4단계: 결론을 찍는다
worst_under = max(TYPES, key=lambda t: t[1] / mixed)
worst_over = min(TYPES, key=lambda t: t[1] / mixed)
print(f"→ 같은 모델이 '{worst_under[0]}' 광고주에게는 {worst_under[1]/mixed:.1f}배 과소예측하고,")
print(f"   '{worst_over[0]}' 광고주에게는 {mixed/worst_over[1]:.0f}배 과대예측한다.")
print("→ 전체 COPC는 1.00으로 완벽해 보인다. 유형별로 나눠 봐야 드러난다.")
print("→ 입찰가는 pCVR에 비례하니 이 오차가 그대로 입찰가 오차가 된다.")
print(f"   '{worst_over[0]}'를 전환으로 잡은 광고주는 예산을 {mixed/worst_over[1]:.0f}배 빨리 태우고 CPA가 크게 오른다.")

# 출력:
# 2단계 뜻: 트래픽 비중으로 섞은 평균 전환율은 6.0% 다. 상담 신청은 그 2.49배, 재구매는 0.05배다.
# 전환 유형           기저 전환율      트래픽 비중       섞은 평균 대비
# 상담 신청           15.0%        15%          2.49배
# 앱 설치             8.0%        25%          1.33배
# 회원가입             4.5%        20%          0.75배
# 장바구니             3.0%        15%          0.50배
# 구매 완료            2.0%        20%          0.33배
# 재구매              0.3%         5%          0.05배
# — 섞은 평균          6.0%                     1.0배
# 2단계 뜻: 가장 높은 상담 신청 15.0% 와 가장 낮은 재구매 0.3% 는 50배 차이 난다.
#
# 가장 높은 유형(상담 신청 15.0%)과 가장 낮은 유형(재구매 0.3%)의 차이  50배
#
# 3단계 뜻: 유형을 모르는 모델은 모두에게 섞은 평균 6.0% 를 예측한다. 상담 신청은 COPC 2.49 로 심하게 과소예측하고, 장바구니부터 재구매까지는 COPC 0.50 이하로 심하게 과대예측한다.
# 유형을 피처로 안 넣은 모델의 예측 = 섞은 평균 (모두에게 같은 값)
# 전환 유형            예측       실제    COPC              판정
# 상담 신청         6.0%   15.0%    2.49        심하게 과소예측
# 앱 설치          6.0%    8.0%    1.33            과소예측
# 회원가입          6.0%    4.5%    0.75            과대예측
# 장바구니          6.0%    3.0%    0.50        심하게 과대예측
# 구매 완료         6.0%    2.0%    0.33        심하게 과대예측
# 재구매           6.0%    0.3%    0.05        심하게 과대예측
#
# 4단계 뜻: 같은 모델이 상담 신청은 2.5배 과소예측하고 재구매는 20배 과대예측하는데, 전체 COPC 는 1.00 으로 완벽해 보인다. 재구매를 전환으로 잡은 광고주는 예산을 20배 빨리 태운다.
# → 같은 모델이 '상담 신청' 광고주에게는 2.5배 과소예측하고,
#    '재구매' 광고주에게는 20배 과대예측한다.
# → 전체 COPC는 1.00으로 완벽해 보인다. 유형별로 나눠 봐야 드러난다.
# → 입찰가는 pCVR에 비례하니 이 오차가 그대로 입찰가 오차가 된다.
#    '재구매'를 전환으로 잡은 광고주는 예산을 20배 빨리 태우고 CPA가 크게 오른다.
````

#### 블록 2

<!-- cb5 post=conversion-definition block=1 sha=18a4fdf3977fb25d -->
````python
# 하는 일: 관심도에 반응하는 세기가 유형마다 다른 학습 행 20만 건으로, 섞어 학습, 유형별 보정, 유형을 피처로 넣기 세 방법의 오차를 유형별 평균과 개별 수준으로 견준다.

import random
random.seed(42)

# 1단계: 유형 여섯의 기저 전환율과 관심도 민감도를 둔다
# 핵심은 유형마다 '관심도'가 전환에 미치는 세기가 다르다는 것이다. 재구매는 관심도에 아주 민감하고(단골만 한다), 상담 신청은 둔감하다(가볍게 누른다). 이 차이가 있으면 평균만 맞추는 보정으로는 부족하다. 각 행은 (유형, 기저 전환율, 트래픽 비중, 관심도 민감도)이다.
TYPES = [
    ("상담 신청", 0.150, 0.15, 0.3),   # 민감도 낮음 — 누구나 누른다
    ("앱 설치",   0.080, 0.25, 0.6),
    ("회원가입",  0.045, 0.20, 0.9),
    ("장바구니",  0.030, 0.15, 1.2),
    ("구매 완료", 0.020, 0.20, 1.6),
    ("재구매",    0.003, 0.05, 2.4),   # 민감도 높음 — 관심 많은 사람만
]
N = 200_000

# 2단계: 관심도에 따라 기운 참 전환율로 학습 행 20만 건을 만든다
def true_cvr(base, sens, interest):
    """관심도가 평균(0.5)일 때 기저 전환율이 되고, 민감도만큼 기울어진다."""
    return base * (1 + sens * (interest - 0.5))

rows = []
for _ in range(N):
    r, acc = random.random(), 0.0
    for name, base, w, sens in TYPES:
        acc += w
        if r <= acc:
            it = random.random()
            rows.append((name, base, sens, it, true_cvr(base, sens, it)))
            break

# 3단계: 세 방법의 예측을 만든다
# ① 섞어 학습은 유형을 못 보고 전체 평균 민감도만 배운다.
overall_base = sum(r[4] for r in rows) / len(rows)
avg_sens = sum(t[3] * t[2] for t in TYPES) / sum(t[2] for t in TYPES)
def m1(name, base, sens, it):
    return overall_base * (1 + avg_sens * (it - 0.5))

# ② 유형별 보정: ①의 출력에 유형별 계수를 곱한다(평균만 맞춘다)
scale = {}
for name, base, w, sens in TYPES:
    sub = [r for r in rows if r[0] == name]
    p = sum(m1(*r[:4]) for r in sub) / len(sub)
    t = sum(r[4] for r in sub) / len(sub)
    scale[name] = t / p
def m2(name, base, sens, it):
    return m1(name, base, sens, it) * scale[name]

# ③ 유형을 피처로: 유형별 기저와 민감도를 각각 배운다
def m3(name, base, sens, it):
    return true_cvr(base, sens, it)

# 4단계: 개별 수준과 유형별 평균 오차를 재는 함수를 만든다
def errors(fn):
    """개별 수준 평균 절대오차와, 유형별 평균 오차를 함께 낸다."""
    ind = 0.0
    per = {}
    for name, base, sens, it, t in rows:
        p = fn(name, base, sens, it)
        ind += abs(p - t)
        a = per.setdefault(name, [0.0, 0.0, 0])
        a[0] += p; a[1] += t; a[2] += 1
    return ind / len(rows), {k: abs(v[0]/v[2] - v[1]/v[2]) for k, v in per.items()}

# 5단계: 유형마다 세 방법의 평균 예측을 찍는다
print(f"학습 행 {len(rows):,}건, 전환 유형 {len(TYPES)}가지")
print("유형마다 '관심도'가 전환에 미치는 세기가 다르다 (민감도 0.3~2.4)\n")

i1, p1 = errors(m1); i2, p2 = errors(m2); i3, p3 = errors(m3)
print(f"{'유형':<10}{'민감도':>7}{'참 평균':>9}{'① 섞어':>9}{'② 보정':>9}{'③ 피처':>9}")
for name, base, w, sens in TYPES:
    sub = [r for r in rows if r[0] == name]
    t = sum(r[4] for r in sub) / len(sub)
    print(f"{name:<10}{sens:>7.1f}{t:>8.2%}{sum(m1(*r[:4]) for r in sub)/len(sub):>8.2%}"
          f"{sum(m2(*r[:4]) for r in sub)/len(sub):>8.2%}{sum(m3(*r[:4]) for r in sub)/len(sub):>8.2%}")

# 6단계: 두 오차를 견준다
print()
print(f"{'유형별 평균 오차':<18}{sum(p1.values())/len(p1):>10.4%}{sum(p2.values())/len(p2):>9.4%}{sum(p3.values())/len(p3):>9.4%}")
print(f"{'개별 수준 평균 오차':<17}{i1:>10.4%}{i2:>9.4%}{i3:>9.4%}")
print(f"{'① 대비 개선(개별)':<18}{'—':>10}{(1-i2/i1)*100:>8.1f}%{(1-i3/i1)*100:>8.1f}%")

# 7단계: 읽는 법을 찍는다
print()
print("읽는 법 — 두 오차를 나눠 봐야 한다.")
print("  - 유형별 평균 오차: ②도 0에 가깝다. 평균만 맞추는 보정으로 충분히 잡힌다.")
print("  - 개별 수준 오차: ②는 ①보다 크게 낫지만 ③에는 못 미친다.")
print("    유형마다 관심도 반응이 다른데, ②는 그 기울기를 못 고치고 높이만 맞추기 때문이다.")
print()
print("실무 판단")
print("  랭킹만 신경 쓴다면(같은 유형 안에서 순서) ②로도 상당 부분 해결된다.")
print("  입찰가 절댓값이 걸린다면 ③이 필요하다. 유형을 학습과 서빙 양쪽 피처에 넣어야 한다.")
print("  ②는 기존 모델을 못 고칠 때(재학습 일정, 비용) 쓰는 현실적 수단이다.")

# 출력:
# 5단계 뜻: 유형 여섯이 섞인 학습 행 200,000건이다. 관심도가 전환에 미치는 민감도는 0.3 에서 2.4 까지 다르다.
# 학습 행 200,000건, 전환 유형 6가지
# 유형마다 '관심도'가 전환에 미치는 세기가 다르다 (민감도 0.3~2.4)
#
# 5단계 뜻: ① 섞어 학습은 어느 유형이든 6.01% 에서 6.04% 를 예측한다. ② 보정과 ③ 피처는 유형마다 참 평균(15.01% 에서 0.30%)을 그대로 맞춘다.
# 유형            민감도     참 평균     ① 섞어     ② 보정     ③ 피처
# 상담 신청         0.3  15.01%   6.04%  15.01%  15.01%
# 앱 설치          0.6   8.01%   6.03%   8.01%   8.01%
# 회원가입          0.9   4.50%   6.02%   4.50%   4.50%
# 장바구니          1.2   2.99%   6.01%   2.99%   2.99%
# 구매 완료         1.6   2.00%   6.03%   2.00%   2.00%
# 재구매           2.4   0.30%   6.01%   0.30%   0.30%
# 6단계 뜻: 유형별 평균 오차는 ② 도 0.0000% 로 ③ 과 같다. 개별 수준 오차는 ② 가 0.7003% 로 ① 의 3.7004% 보다 81.1% 낫지만, ③ 의 0.0000% 에는 못 미친다.
#
# 유형별 평균 오차            4.2054%  0.0000%  0.0000%
# 개별 수준 평균 오차         3.7004%  0.7003%  0.0000%
# ① 대비 개선(개별)                —    81.1%   100.0%
# 7단계 뜻: 코드가 찍는 해설이다. ② 는 유형별 높이만 맞추고 관심도 기울기는 못 고치니, 입찰가 절댓값이 걸리면 ③ 이 필요하다.
#
# 읽는 법 — 두 오차를 나눠 봐야 한다.
#   - 유형별 평균 오차: ②도 0에 가깝다. 평균만 맞추는 보정으로 충분히 잡힌다.
#   - 개별 수준 오차: ②는 ①보다 크게 낫지만 ③에는 못 미친다.
#     유형마다 관심도 반응이 다른데, ②는 그 기울기를 못 고치고 높이만 맞추기 때문이다.
#
# 실무 판단
#   랭킹만 신경 쓴다면(같은 유형 안에서 순서) ②로도 상당 부분 해결된다.
#   입찰가 절댓값이 걸린다면 ③이 필요하다. 유형을 학습과 서빙 양쪽 피처에 넣어야 한다.
#   ②는 기존 모델을 못 고칠 때(재학습 일정, 비용) 쓰는 현실적 수단이다.
````

#### 블록 3

<!-- cb5 post=conversion-definition block=2 sha=743504916d755bbb -->
````python
# 하는 일: 전환 도착이 7일에 걸칠 때, 라벨을 T+n일에 확정하는 정책과 늦게 온 전환으로 과거 라벨을 고치는 정책의 대가를 센다.

# 1단계: 전환 도착 비율과 하루 클릭 수를 둔다
# 전환은 늦게 오니 "이 클릭은 전환 안 함(y=0)"이라고 찍는 시점을 정해야 한다. 선택은 둘이다. (A) 확정은 T+n일에 라벨을 정하고 그 뒤에 온 전환은 버리고, (B) 재수정은 늦게 온 전환을 과거 라벨에 반영해 고친다. 둘 다 대가가 있다.
ARRIVAL = [0.42, 0.23, 0.13, 0.08, 0.06, 0.05, 0.03]   # 1~7일차 도착 비율
LATE_TAIL = 0.00                                        # 7일 뒤 도착은 없다고 가정
TRUE_CVR = 0.030
CLICKS_PER_DAY = 100_000

# 2단계: 누적 도착 비율 함수를 두고 설정을 찍는다
def cum(n):
    return sum(ARRIVAL[:min(n, len(ARRIVAL))])

print(f"진짜 CVR {TRUE_CVR:.1%}, 클릭 하루 {CLICKS_PER_DAY:,}건")
print(f"전환 도착: 1일 {cum(1):.0%}, 3일 {cum(3):.0%}, 7일 {cum(7):.0%}\n")

# 3단계: (A) 확정 시점마다 잡는 전환과 라벨 CVR 을 찍는다
print("(A) T+n일에 라벨을 확정하고 그 뒤 전환은 버린다")
print(f"{'확정 시점':>10}{'잡는 전환 비율':>14}{'학습 라벨 CVR':>15}{'참값 대비':>11}{'데이터 나이':>12}")
for n in (1, 2, 3, 5, 7):
    caught = cum(n)
    label_cvr = TRUE_CVR * caught
    print(f"{n:>8}일{caught:>13.0%}{label_cvr:>14.3%}{(label_cvr/TRUE_CVR-1)*100:>+10.0f}%{n:>10}일")
print()
print("→ 빨리 확정하면 전환을 놓쳐 라벨 CVR이 참값보다 낮다. 모델은 전환을 과소예측하게 배운다.")
print("→ 늦게 확정하면 정확하지만 학습 데이터가 그만큼 낡는다.")
print("→ 놓친 비율을 알면 보정할 수 있다. 도착 확률의 역수로 가중하는 방법이 그것이다.")
print()

# 4단계: (B) 재수정할 때 날마다 바뀌는 라벨을 찍는다
# 정확도는 좋아지지만, 어제 만든 학습셋이 오늘 달라진다.
print("(B) 늦게 온 전환을 과거 라벨에 반영한다 — 학습셋이 매일 바뀐다")
print(f"{'대상 날짜':>10}{'어제 본 CVR':>13}{'오늘 본 CVR':>13}{'바뀐 라벨 수':>14}{'변동률':>9}")
for age in range(1, 7):
    y_caught = cum(age)          # 어제 시점에는 age일 지난 상태였다
    t_caught = cum(age + 1)      # 오늘은 하루 더 지났다
    y_cvr = TRUE_CVR * y_caught
    t_cvr = TRUE_CVR * t_caught
    changed = CLICKS_PER_DAY * TRUE_CVR * (t_caught - y_caught)
    print(f"{age:>8}일전{y_cvr:>12.3%}{t_cvr:>12.3%}{changed:>13,.0f}건{(t_cvr/y_cvr-1)*100:>+8.1f}%")
print()
total_changed = CLICKS_PER_DAY * TRUE_CVR * (cum(7) - cum(1))
print(f"→ 1주일 치를 매일 다시 만들면 하루에 {total_changed:,.0f}건의 라벨이 0에서 1로 바뀐다.")
print("→ 그래서 '같은 코드 + 같은 날짜'로 돌려도 어제와 다른 모델이 나온다. 재현이 안 된다.")
print("→ 실무의 절충: 학습셋을 만든 시점을 데이터에 함께 기록해 둔다(스냅샷).")
print("   그러면 '3월 1일 데이터를 3월 8일에 본 버전'을 나중에도 그대로 되살릴 수 있다.")

# 출력:
# 2단계 뜻: 진짜 CVR 3.0% 인 클릭이 하루 100,000건이다. 전환은 1일에 42%, 3일에 78% 가 도착하고 7일이면 모두 온다.
# 진짜 CVR 3.0%, 클릭 하루 100,000건
# 전환 도착: 1일 42%, 3일 78%, 7일 100%
#
# 3단계 뜻: 1일에 확정하면 전환의 42% 만 잡아 라벨 CVR 이 1.260% 로 참값보다 -58% 낮다. 7일을 기다려야 3.000% 로 맞지만 데이터가 7일 낡는다.
# (A) T+n일에 라벨을 확정하고 그 뒤 전환은 버린다
#      확정 시점      잡는 전환 비율      학습 라벨 CVR      참값 대비      데이터 나이
#        1일          42%        1.260%       -58%         1일
#        2일          65%        1.950%       -35%         2일
#        3일          78%        2.340%       -22%         3일
#        5일          92%        2.760%        -8%         5일
#        7일         100%        3.000%        +0%         7일
# 3단계 뜻: 코드가 찍는 해설이다. 놓친 비율을 알면 도착 확률의 역수로 가중해 보정할 수 있다.
#
# → 빨리 확정하면 전환을 놓쳐 라벨 CVR이 참값보다 낮다. 모델은 전환을 과소예측하게 배운다.
# → 늦게 확정하면 정확하지만 학습 데이터가 그만큼 낡는다.
# → 놓친 비율을 알면 보정할 수 있다. 도착 확률의 역수로 가중하는 방법이 그것이다.
#
# 4단계 뜻: 하루 전 날짜는 어제 1.260% 로 보였던 CVR 이 오늘 1.950% 로 +54.8% 뛰고, 라벨 690건이 바뀐다. 오래된 날짜일수록 바뀌는 라벨이 준다.
# (B) 늦게 온 전환을 과거 라벨에 반영한다 — 학습셋이 매일 바뀐다
#      대상 날짜     어제 본 CVR     오늘 본 CVR       바뀐 라벨 수      변동률
#        1일전      1.260%      1.950%          690건   +54.8%
#        2일전      1.950%      2.340%          390건   +20.0%
#        3일전      2.340%      2.580%          240건   +10.3%
#        4일전      2.580%      2.760%          180건    +7.0%
#        5일전      2.760%      2.910%          150건    +5.4%
#        6일전      2.910%      3.000%           90건    +3.1%
# 4단계 뜻: 1주일 치를 매일 다시 만들면 하루에 1,740건의 라벨이 0 에서 1 로 바뀌어, 같은 코드로 돌려도 어제와 다른 모델이 나온다. 실무는 학습셋을 만든 시점을 함께 기록해 둔다(스냅샷).
#
# → 1주일 치를 매일 다시 만들면 하루에 1,740건의 라벨이 0에서 1로 바뀐다.
# → 그래서 '같은 코드 + 같은 날짜'로 돌려도 어제와 다른 모델이 나온다. 재현이 안 된다.
# → 실무의 절충: 학습셋을 만든 시점을 데이터에 함께 기록해 둔다(스냅샷).
#    그러면 '3월 1일 데이터를 3월 8일에 본 버전'을 나중에도 그대로 되살릴 수 있다.
````

### 부록 15: cold-start-pctr (블록 3개, Task 4)

#### 블록 1

<!-- cb5 post=cold-start-pctr block=0 sha=66603547f7e08166 -->
````python
# 하는 일: 광고주 3곳의 광고 이력으로 전체와 광고주별 평균 CTR 을 구하고, 이력이 0 인 새 광고에 어느 계층의 값을 빌려 줄지 견준다.

# 1단계: 광고주 3곳의 광고 이력을 둔다
# 새 광고는 노출도 클릭도 없는데, 랭킹에 넣으려면 숫자가 있어야 한다. 실무의 답은 계층을 타고 빌려 오는 것이다(전체 → 카테고리 → 광고주 → 이 광고).
# 가상 데이터: 광고주 3곳, 각자 광고 여러 개. (노출, 클릭)
DATA = {
    "패션몰A": [("A-1", 50_000, 1_250), ("A-2", 30_000, 690), ("A-3", 20_000, 500)],
    "게임사B": [("B-1", 80_000, 800), ("B-2", 40_000, 360)],
    "보험사C": [("C-1", 60_000, 300), ("C-2", 25_000, 150), ("C-3", 15_000, 75)],
}

# 2단계: 전체와 광고주별 평균 CTR 을 구해 찍는다
def ctr(imp, clk):
    return clk / imp if imp else 0.0

total_imp = total_clk = 0
adv_stats = {}
for adv, ads in DATA.items():
    i = sum(a[1] for a in ads)
    c = sum(a[2] for a in ads)
    adv_stats[adv] = (i, c)
    total_imp += i
    total_clk += c
global_ctr = ctr(total_imp, total_clk)

print(f"전체 평균 CTR  {global_ctr:.3%}  (노출 {total_imp:,}, 클릭 {total_clk:,})")
print("\n광고주별 평균 CTR")
for adv, (i, c) in adv_stats.items():
    print(f"  {adv:<8} {ctr(i, c):.3%}  (광고 {len(DATA[adv])}개)")
print()

# 3단계: 새 광고에 줄 사전 CTR 을 계층별로 견준다
# "모르니까 0" 은 영원히 노출을 못 받는다는 뜻이고, "모르니까 평균" 은 너무 거칠다.
# 같은 광고주의 다른 광고들이 얼마나 비슷한지가 '빌려도 되는가'를 결정한다.
print("새 광고에 줄 사전 CTR (계층별로 빌릴 때)")
print(f"{'새 광고':<14}{'전체에서':>10}{'광고주에서':>12}{'차이':>10}")
for adv in DATA:
    a_ctr = ctr(*adv_stats[adv])
    print(f"{adv + '의 새 광고':<14}{global_ctr:>9.3%}{a_ctr:>11.3%}{(a_ctr/global_ctr - 1)*100:>+9.1f}%")
print()
print("→ 광고주마다 CTR이 2.4%와 0.5%로 4.6배 차이 난다.")
print("→ 전체 평균을 주면 보험사 새 광고는 2.5배 과대평가, 패션몰 새 광고는 절반 가까이 과소평가된다.")
print("→ 그래서 가능한 한 가까운 계층에서 빌려야 한다.")

# 출력:
# 2단계 뜻: 광고 8개를 합친 전체 평균 CTR 은 1.289% 다. 광고주별로는 패션몰A 2.440%, 게임사B 0.967%, 보험사C 0.525% 로 크게 다르다.
# 전체 평균 CTR  1.289%  (노출 320,000, 클릭 4,125)
#
# 광고주별 평균 CTR
#   패션몰A     2.440%  (광고 3개)
#   게임사B     0.967%  (광고 2개)
#   보험사C     0.525%  (광고 3개)
#
# 3단계 뜻: 전체 평균 1.289% 를 그대로 주면 패션몰A 의 새 광고는 광고주 평균보다 낮게, 보험사C 의 새 광고는 높게 시작한다. 광고주에서 빌린 값은 전체에서 빌린 값과 +89.3% 에서 -59.3% 까지 차이 난다.
# 새 광고에 줄 사전 CTR (계층별로 빌릴 때)
# 새 광고                전체에서       광고주에서        차이
# 패션몰A의 새 광고       1.289%     2.440%    +89.3%
# 게임사B의 새 광고       1.289%     0.967%    -25.0%
# 보험사C의 새 광고       1.289%     0.525%    -59.3%
#
# → 광고주마다 CTR이 2.4%와 0.5%로 4.6배 차이 난다.
# → 전체 평균을 주면 보험사 새 광고는 2.5배 과대평가, 패션몰 새 광고는 절반 가까이 과소평가된다.
# → 그래서 가능한 한 가까운 계층에서 빌려야 한다.
````

#### 블록 2

<!-- cb5 post=cold-start-pctr block=1 sha=eac27bb2fedc6078 -->
````python
# 하는 일: 사전 CTR 2% 를 사전 강도 500 으로 빌린 새 광고가 노출을 받을수록 수축 CTR 이 진짜 CTR 5% 에 다가가는 과정을 보고, 사전 강도 다섯 가지의 오차와 흔들림을 견준다.

# 1단계: 사전 CTR 과 사전 강도를 α, β 로 바꾼다
# 노출 100회에 클릭 4번이면 CTR 4% 인가. 표본이 100회면 우연히 4번 눌릴 수도 있어 사전확률 쪽으로 끌어당긴다. 이것이 수축이고, 베타-이항 모형으로 추정 CTR = (클릭 + α) / (노출 + α + β) 한 줄에 담긴다. α, β 는 사전확률을 가상의 노출과 클릭으로 바꾼 값이라, 사전 CTR = α / (α + β), 사전 강도 = α + β(가상 노출 수)다.
PRIOR_CTR = 0.02        # 광고주 평균에서 빌린 사전 CTR 2%
STRENGTH = 500          # 사전 강도 = 가상 노출 500회로 치겠다

alpha = PRIOR_CTR * STRENGTH
beta = STRENGTH - alpha
print(f"사전 CTR {PRIOR_CTR:.1%}, 사전 강도 {STRENGTH}회  →  α={alpha:.0f}, β={beta:.0f}")
print("  (\"노출 500회에 클릭 10번 본 셈으로 시작한다\"는 뜻)\n")

# 2단계: 진짜 CTR 5% 인 광고가 노출을 쌓는 과정을 본다
# 노출마다 딱 기대만큼 눌렸다고 두고, 추정값에서 사전확률이 차지하는 몫도 찍는다.
def shrunk(clicks, imps, a=alpha, b=beta):
    return (clicks + a) / (imps + a + b)

# 진짜 CTR이 5%인 좋은 광고가 들어왔다고 하자. 노출이 쌓이는 과정을 본다.
TRUE = 0.05
print(f"진짜 CTR {TRUE:.0%}인 광고가 들어왔을 때")
print(f"{'노출':>8}{'클릭':>6}{'날것 CTR':>11}{'수축 CTR':>11}{'사전 비중':>11}")
for imps in (0, 50, 200, 1_000, 5_000, 20_000, 100_000):
    clicks = round(imps * TRUE)                    # 딱 기대만큼 눌렸다고 가정
    raw = clicks / imps if imps else float('nan')
    s = shrunk(clicks, imps)
    prior_weight = STRENGTH / (imps + STRENGTH)    # 추정값에서 사전확률이 차지하는 몫
    raw_txt = f"{raw:.3%}" if imps else "   —"
    print(f"{imps:>8,}{clicks:>6,}{raw_txt:>11}{s:>10.3%}{prior_weight:>10.1%}")
print()

# 3단계: 사전 비중이 절반으로 떨어지는 지점을 찍는다
# 자기 데이터가 절반을 넘는 때는 노출이 사전 강도를 넘는 순간이다.
print(f"사전확률의 비중이 절반으로 떨어지는 지점  노출 {STRENGTH:,}회")
print("  → 사전 강도가 곧 '자기 데이터를 믿기 시작하는 문턱'이다.\n")

# 4단계: 사전 강도 다섯 가지로 새 광고 2,000개를 굴린다
# 위 표는 "딱 기대만큼 눌렸다"고 가정했다. 실제로는 운이 섞인다.
# 그래서 새 광고 2,000개를 굴려 오차의 크기와 흔들림을 함께 본다.
import random
random.seed(42)

TRIALS = 2_000
IMPS = 1_000            # 새 광고마다 노출 1,000회를 준다

print(f"새 광고 {TRIALS:,}개를 노출 {IMPS:,}회씩 굴렸을 때 (진짜 CTR {TRUE:.0%})")
print(f"{'사전 강도':>10}{'평균 추정':>11}{'평균 오차':>11}{'흔들림(표준편차)':>18}{'최악':>9}")
for st in (50, 200, 500, 2_000, 10_000):
    a = PRIOR_CTR * st
    b = st - a
    ests = []
    for _ in range(TRIALS):
        clicks = sum(1 for _ in range(IMPS) if random.random() < TRUE)
        ests.append(shrunk(clicks, IMPS, a, b))
    mean = sum(ests) / TRIALS
    var = sum((e - mean) ** 2 for e in ests) / TRIALS
    sd = var ** 0.5
    worst = max(abs(e - TRUE) for e in ests)
    print(f"{st:>10,}{mean:>10.3%}{(mean/TRUE-1)*100:>+10.1f}%{sd:>17.4%}{worst:>8.2%}")

# 5단계: 읽는 법을 찍는다
print()
print("→ 강도가 약하면 평균은 진짜에 가깝지만 흔들림이 크다. 같은 광고가 운에 따라 크게 다르게 평가된다.")
print("→ 강도가 세면 흔들림은 작아지지만 평균이 사전확률 쪽으로 눌린다. 좋은 광고를 오래 못 알아본다.")
print("→ 노출을 못 받으면 데이터도 안 쌓이니, 과소평가는 스스로를 강화한다. 이게 콜드스타트의 덤이다.")
print("→ 그래서 강도는 '이 계층 안에서 광고들이 얼마나 비슷한가'로 정한다. 비슷할수록 세게 빌려도 된다.")

# 출력:
# 1단계 뜻: 사전 CTR 2.0% 를 강도 500 으로 빌리면 α=10, β=490 이다. 노출 500회에 클릭 10번을 본 셈으로 시작한다.
# 사전 CTR 2.0%, 사전 강도 500회  →  α=10, β=490
#   ("노출 500회에 클릭 10번 본 셈으로 시작한다"는 뜻)
#
# 2단계 뜻: 노출 0회에는 사전 CTR 2.000% 그대로이고, 200회에서도 사전 비중이 71.4% 라 2.857% 에 머문다. 노출이 쌓일수록 진짜 값 쪽으로 붙어 100,000회에 4.985% 가 된다.
# 진짜 CTR 5%인 광고가 들어왔을 때
#       노출    클릭     날것 CTR     수축 CTR      사전 비중
#        0     0          —    2.000%    100.0%
#       50     2     4.000%    2.182%     90.9%
#      200    10     5.000%    2.857%     71.4%
#    1,000    50     5.000%    4.000%     33.3%
#    5,000   250     5.000%    4.727%      9.1%
#   20,000 1,000     5.000%    4.927%      2.4%
#  100,000 5,000     5.000%    4.985%      0.5%
#
# 3단계 뜻: 노출이 사전 강도 500회를 넘으면 사전확률의 비중이 절반 아래로 떨어진다.
# 사전확률의 비중이 절반으로 떨어지는 지점  노출 500회
#   → 사전 강도가 곧 '자기 데이터를 믿기 시작하는 문턱'이다.
#
# 4단계 뜻: 강도 50 은 평균 오차 -3.0% 로 정확하지만 흔들림이 0.6565% 로 크다. 강도 10,000 은 흔들림이 0.0631% 로 작지만 평균이 2.274%(-54.5%)까지 눌린다.
# 새 광고 2,000개를 노출 1,000회씩 굴렸을 때 (진짜 CTR 5%)
#      사전 강도      평균 추정      평균 오차         흔들림(표준편차)       최악
#         50    4.851%      -3.0%          0.6565%   2.24%
#        200    4.513%      -9.7%          0.5780%   2.25%
#        500    3.980%     -20.4%          0.4595%   2.40%
#      2,000    2.998%     -40.0%          0.2278%   2.60%
#     10,000    2.274%     -54.5%          0.0631%   2.95%
# 5단계 뜻: 코드가 찍는 해설이다. 강도는 이 계층 안에서 광고들이 얼마나 비슷한가로 정한다.
#
# → 강도가 약하면 평균은 진짜에 가깝지만 흔들림이 크다. 같은 광고가 운에 따라 크게 다르게 평가된다.
# → 강도가 세면 흔들림은 작아지지만 평균이 사전확률 쪽으로 눌린다. 좋은 광고를 오래 못 알아본다.
# → 노출을 못 받으면 데이터도 안 쌓이니, 과소평가는 스스로를 강화한다. 이게 콜드스타트의 덤이다.
# → 그래서 강도는 '이 계층 안에서 광고들이 얼마나 비슷한가'로 정한다. 비슷할수록 세게 빌려도 된다.
````

#### 블록 3

<!-- cb5 post=cold-start-pctr block=2 sha=0d0f026cb045e3c9 -->
````python
# 하는 일: 광고주 3곳의 기존 광고 CTR 이 흩어진 정도로 사전 강도를 구하고(경험적 베이즈), 그 강도로 노출 500회에 클릭 25회인 새 광고를 평가한다.

# 1단계: CTR 목록에서 사전 평균과 강도를 구하는 함수를 만든다
# 앞에서 강도는 이 계층 안에서 광고들이 얼마나 비슷한가로 정한다고 했다. 같은 광고주의 기존 광고 CTR 이 촘촘히 모여 있으면 새 광고도 그 근처일 테니 세게 빌리고(강도 큼), 널찍이 흩어져 있으면 어디일지 모르니 약하게 빌린다(강도 작음). 베타 분포의 평균과 분산을 관측된 CTR 들에 맞추면(적률법) α, β 가 나온다.
def fit_strength(ctrs):
    """관측된 CTR 목록에서 사전 평균과 강도를 구한다."""
    n = len(ctrs)
    m = sum(ctrs) / n
    # 표본분산(자유도 n-1). 광고가 2개 미만이면 강도를 못 구한다.
    if n < 2:
        return m, None
    v = sum((c - m) ** 2 for c in ctrs) / (n - 1)
    if v <= 0:
        return m, None                      # 전부 같은 값 → 무한히 세게 빌려도 됨
    # 평균 m = α/(α+β), 분산 v = m(1-m)/(α+β+1) 이니 강도 s = α+β = m(1-m)/v - 1 이다.
    s = m * (1 - m) / v - 1
    return m, s

# 2단계: 광고주 3곳의 강도를 구해 찍는다
# 가상 데이터: 광고주 3곳의 기존 광고 CTR
GROUPS = {
    "패션몰A (소재가 다 비슷)":   [0.0244, 0.0231, 0.0250, 0.0238, 0.0246],
    "게임사B (장르가 섞임)":      [0.0097, 0.0180, 0.0042, 0.0131, 0.0068],
    "보험사C (상품마다 천차만별)": [0.0052, 0.0009, 0.0140, 0.0021, 0.0095],
}

print(f"{'광고주':<24}{'평균 CTR':>10}{'흩어짐(표준편차)':>18}{'구한 강도':>12}{'해석':>16}")
fitted = {}
for name, ctrs in GROUPS.items():
    m, s = fit_strength(ctrs)
    sd = (sum((c - m) ** 2 for c in ctrs) / (len(ctrs) - 1)) ** 0.5
    fitted[name] = (m, s)
    note = "세게 빌려도 됨" if s and s > 2000 else ("약하게" if s and s < 300 else "중간")
    print(f"{name:<24}{m:>9.3%}{sd:>17.4%}{s:>11,.0f}{note:>16}")
print()

# 3단계: 구한 강도로 새 광고를 평가한다
TRUE_NEW = 0.05          # 새 광고가 실제로는 아주 좋다고 하자
IMPS, CLICKS = 500, 25   # 노출 500회에 클릭 25회 (관측 CTR 5%)

print(f"새 광고: 노출 {IMPS}회, 클릭 {CLICKS}회 (관측 {CLICKS/IMPS:.1%}, 진짜 {TRUE_NEW:.0%})")
print(f"{'광고주':<24}{'추정 CTR':>10}{'진짜와 차이':>13}")
for name, (m, s) in fitted.items():
    a = m * s
    b = s - a
    est = (CLICKS + a) / (IMPS + a + b)
    print(f"{name:<24}{est:>9.3%}{(est/TRUE_NEW-1)*100:>+12.1f}%")

# 4단계: 읽는 법을 찍는다
print()
print("→ 소재가 비슷한 광고주(패션몰A)는 강도가 세게 나온다. 새 광고도 그 근처일 거라 믿는 것이다.")
print("→ 대신 이 광고주에서 진짜 튀는 광고가 나오면 알아보는 데 오래 걸린다.")
print("→ 상품마다 천차만별인 광고주(보험사C)는 강도가 약하게 나와 자기 데이터를 빨리 믿는다.")
print("→ 즉 강도를 손으로 찍을 필요가 없다. 기존 광고들의 흩어짐이 알려 준다.")

# 출력:
# 2단계 뜻: 패션몰A 는 CTR 이 2.418% 둘레에 촘촘해 강도가 42,744 로 세고, 보험사C 는 흩어짐이 0.5421% 로 커서 213 으로 약하다.
# 광고주                         평균 CTR         흩어짐(표준편차)       구한 강도              해석
# 패션몰A (소재가 다 비슷)            2.418%          0.0743%     42,744        세게 빌려도 됨
# 게임사B (장르가 섞임)              1.036%          0.5407%        350              중간
# 보험사C (상품마다 천차만별)           0.634%          0.5421%        213             약하게
#
# 3단계 뜻: 같은 새 광고도 패션몰A 소속이면 2.448% 로 진짜보다 -51.0% 낮게, 보험사C 소속이면 3.694%(-26.1%)로 평가된다. 강도가 셀수록 자기 데이터를 늦게 믿는다.
# 새 광고: 노출 500회, 클릭 25회 (관측 5.0%, 진짜 5%)
# 광고주                         추정 CTR       진짜와 차이
# 패션몰A (소재가 다 비슷)            2.448%       -51.0%
# 게임사B (장르가 섞임)              3.369%       -32.6%
# 보험사C (상품마다 천차만별)           3.694%       -26.1%
# 4단계 뜻: 코드가 찍는 해설이다. 강도를 손으로 찍지 않아도 기존 광고들의 흩어짐이 알려 준다.
#
# → 소재가 비슷한 광고주(패션몰A)는 강도가 세게 나온다. 새 광고도 그 근처일 거라 믿는 것이다.
# → 대신 이 광고주에서 진짜 튀는 광고가 나오면 알아보는 데 오래 걸린다.
# → 상품마다 천차만별인 광고주(보험사C)는 강도가 약하게 나와 자기 데이터를 빨리 믿는다.
# → 즉 강도를 손으로 찍을 필요가 없다. 기존 광고들의 흩어짐이 알려 준다.
````

### 부록 16: ctr-feature-engineering (블록 4개, Task 4)

#### 블록 1

<!-- cb5 post=ctr-feature-engineering block=0 sha=459e32294b4fcb8e -->
````python
# 하는 일: 광고 100만 개를 해싱 트릭으로 버킷에 넣어 충돌을 세고, 버킷 크기와 상위 광고 전용 버킷에 따라 노출 가중 예측 오차가 어떻게 달라지는지 본다.
import random, hashlib

# 1단계: 광고 수와 해싱 함수를 둔다
# 노트북에서 15초쯤 걸린다. 100만 개를 버킷 크기 네 가지로 돌려 보기 때문이다.
random.seed(42)
N, IMP, TOP = 1_000_000, 100_000_000, 10_000   # 광고 100만, 하루 노출 1억, '머리' 상위 1만

def bucket(ad_id, m):
    """해싱 트릭의 전부. 문자열을 정수로 뭉갠 뒤 버킷 수로 나머지를 딴다.
       md5는 암호용이 아니라 '골고루 섞이는 함수'로만 쓴다(실무는 murmurhash3)."""
    return int.from_bytes(hashlib.md5(ad_id.encode()).digest()[:4], "little") % m

# 2단계: 광고마다 진짜 CTR 과 노출을 만든다
ids = [f"ad_{i:07d}" for i in range(N)]
# 진짜 CTR은 로그정규분포 — 대부분 1% 근처, 소수가 훨씬 높다.
true_ctr = [random.lognormvariate(-4.6, 0.6) for _ in range(N)]
# 노출은 지프 분포. 인기 i번째가 1/i 만큼 받는다. 광고 트래픽은 늘 머리가 무겁다.
harm = sum(1.0 / (i + 1) for i in range(N))
imps = [max(1, round(IMP / harm / (i + 1))) for i in range(N)]
print(f"상위 1,000개가 먹는 노출 {sum(imps[:1000])/sum(imps)*100:.1f}%, "
      f"상위 1만 개 {sum(imps[:TOP])/sum(imps)*100:.1f}%, 꼴찌 광고 {imps[-1]}회\n")

# 3단계: 버킷에 넣고 오차를 재는 함수를 만든다
# 모델은 버킷 단위로만 배우니, 한 버킷의 예측값은 그 버킷에 든 광고들의 노출 가중 평균 CTR 이다. 오차는 노출로 가중한 평균 상대오차다.
def analyze(m, dedicated=0):
    """버킷 m개에 넣는다. dedicated>0이면 상위 그만큼은 전용 버킷을 준다.
       모델은 버킷 단위로만 배운다. 그래서 한 버킷의 예측값은 그 버킷에 들어온 광고들의
       '노출 가중 평균 CTR'이 된다(LR을 끝까지 학습시킨 값과 같다)."""
    slot = [i if i < dedicated else dedicated + bucket(ids[i], m) for i in range(N)]
    clk, shw, mem = {}, {}, {}
    for i in range(N):
        s = slot[i]
        clk[s] = clk.get(s, 0.0) + imps[i] * true_ctr[i]      # 그 버킷의 클릭 합
        shw[s] = shw.get(s, 0) + imps[i]                      # 그 버킷의 노출 합
        mem[s] = mem.get(s, 0) + 1                            # 그 버킷을 쓰는 ID 수
    pred = [clk[slot[i]] / shw[slot[i]] for i in range(N)]

    seen, hit = {}, set()                     # 상위 TOP개끼리 부딪친 광고를 표시한다
    for i in range(TOP):
        if slot[i] in seen: hit.add(i); hit.add(seen[slot[i]])
        seen[slot[i]] = i

    def werr(idx):
        """노출로 가중한 평균 상대오차. |예측-진짜|/진짜 를 노출 수로 가중한다."""
        return sum(imps[i] * abs(pred[i] - true_ctr[i]) / true_ctr[i]
                   for i in idx) / sum(imps[i] for i in idx) * 100

    return dict(used=len(shw), pairs=len(hit) // 2,
                shared=sum(1 for i in range(N) if mem[slot[i]] > 1) / N * 100,
                all=werr(range(N)), head=werr(range(TOP)), tail=werr(range(TOP, N)),
                hit=werr(sorted(hit)) if hit else 0.0,
                ok=werr([i for i in range(TOP) if i not in hit]))

# 4단계: 버킷 크기 네 가지를 견준다
print("  버킷    쓴 버킷    겹친ID  전체오차  상위1만   꼬리   (이론 예상 버킷)")
for e in (16, 18, 20, 22):
    m, r = 2 ** e, analyze(2 ** e)
    print(f"  2^{e} {r['used']:>9,}  {r['shared']:>5.1f}%  {r['all']:>7.1f}%"
          f"  {r['head']:>6.2f}%  {r['tail']:>5.1f}%   ({m*(1-(1-1/m)**N):,.0f})")

# 5단계: 2^18 에서 상위 1만 개끼리 부딪친 쌍을 센다
r = analyze(2 ** 18)
print(f"\n2^18에서 상위 1만 중 서로 부딪친 쌍 {r['pairs']}쌍 "
      f"(생일 문제 예상 {TOP*(TOP-1)/2/2**18:.0f}쌍)")
print(f"  부딪친 광고 오차 {r['hit']:.1f}%  vs  안 부딪친 광고 {r['ok']:.2f}%")

# 6단계: 상위 광고에 전용 버킷을 준다
print("\n상위 ID에 전용 버킷을 주면 (해시는 2^18 고정)")
for d in (0, 10_000, 50_000):
    r = analyze(2 ** 18, dedicated=d)
    print(f"  전용 {d:>6,}개 -> 상위1만 오차 {r['head']:5.2f}%  전체 {r['all']:5.1f}%"
          f"  테이블 {(2**18+d)*16*4/1024**2:5.1f} MB")

# 출력:
# 2단계 뜻: 노출은 머리에 쏠려 상위 1,000개가 52.0%, 상위 1만 개가 68.0% 를 먹고, 꼴찌 광고는 7회뿐이다.
# 상위 1,000개가 먹는 노출 52.0%, 상위 1만 개 68.0%, 꼴찌 광고 7회
#
# 4단계 뜻: 2^18 버킷이면 광고의 97.8% 가 남과 버킷을 나눠 쓰는데도 노출 가중 오차는 전체 14.1%, 상위 1만 1.59% 다. 버킷이 늘수록 오차가 줄고, 쓴 버킷 수는 이론 예상과 맞는다.
#   버킷    쓴 버킷    겹친ID  전체오차  상위1만   꼬리   (이론 예상 버킷)
#   2^16    65,536  100.0%     22.2%    4.95%   58.7%   (65,536)
#   2^18   256,224   97.8%     14.1%    1.59%   40.6%   (256,365)
#   2^20   643,792   61.6%      6.1%    0.42%   18.2%   (644,536)
#   2^22   889,593   21.3%      1.9%    0.13%    5.6%   (889,726)
# 5단계 뜻: 2^18 에서 상위 1만 개끼리 200쌍이 부딪쳤고(생일 문제 예상 191쌍), 부딪친 광고의 오차는 19.0% 로 안 부딪친 광고 1.15% 의 열 배가 넘는다.
#
# 2^18에서 상위 1만 중 서로 부딪친 쌍 200쌍 (생일 문제 예상 191쌍)
#   부딪친 광고 오차 19.0%  vs  안 부딪친 광고 1.15%
# 6단계 뜻: 상위 1만 개에 전용 버킷을 주면 그 오차가 0.00% 가 되고, 테이블은 16.0 MB 에서 16.6 MB 로 늘 뿐이다.
#
# 상위 ID에 전용 버킷을 주면 (해시는 2^18 고정)
#   전용      0개 -> 상위1만 오차  1.59%  전체  14.1%  테이블  16.0 MB
#   전용 10,000개 -> 상위1만 오차  0.00%  전체  12.5%  테이블  16.6 MB
#   전용 50,000개 -> 상위1만 오차  0.00%  전체   9.7%  테이블  19.1 MB
````

#### 블록 2

<!-- cb5 post=ctr-feature-engineering block=1 sha=f9f7e6bd886d0321 -->
````python
# 하는 일: 최근 본 것 20개를 고정 길이 배열로 만드는 자르기, 채우기, 마스크, 최근성 가중을 이력 27개인 로그인 유저와 3개인 쿠키에 적용해 '운동' 비중을 견준다.

# 1단계: 시퀀스 길이와 두 사람의 이력을 둔다
# 두 사람의 이력 길이가 크게 달라야 자르기와 채우기가 둘 다 보인다.
L, PAD, HALF = 20, 0, 24.0   # 시퀀스 길이 20 / 빈 자리 번호 0 / 최근성 반감기 24시간
CAT = {"운동": 11, "전자기기": 12, "여행": 13}   # 카테고리 -> ID (실무에선 상품 ID)

# 담장 안 로그인 유저. 최근엔 운동용품을 몰아 봤고, 예전엔 전자기기를 봤다.
cats = (["운동"]*3 + ["전자기기"] + ["운동"]*2 + ["여행"] + ["운동"] + ["전자기기"]*4
        + ["여행"]*2 + ["전자기기"]*5 + ["여행"]*3 + ["전자기기"]*5)
# 조회 시각은 최근이 촘촘하고 옛날이 듬성듬성하다. 실제 행동 로그가 이런 모양이다.
login = [(round(0.5 * 1.35 ** i, 1), c) for i, c in enumerate(cats)]
# 열린 RTB의 쿠키. 어제 만들어진 쿠키라 남은 흔적이 3개뿐이다.
cookie = [(0.7, "운동"), (3.1, "여행"), (9.4, "전자기기")]

# 2단계: 고정 길이 배열을 만드는 함수를 만든다
def build(events):
    """1) 최근 순 정렬 2) L개 넘으면 오래된 것을 잘라낸다 3) 부족하면 PAD로 채운다
       4) 진짜 값의 자리를 mask로 표시한다 5) 자리마다 최근성 가중을 계산한다."""
    ev = sorted(events, key=lambda e: e[0])          # age가 작을수록 최근
    kept, dropped = ev[:L], ev[L:]
    pad = L - len(kept)
    ids  = [CAT[c] for _, c in kept] + [PAD] * pad
    mask = [1] * len(kept) + [0] * pad
    w    = [0.5 ** (a / HALF) for a, _ in kept] + [0.0] * pad
    return ids, mask, w, dropped

# 3단계: 두 사람에게 적용해 '운동' 비중을 견준다
# '운동' 비중을 패딩 포함 평균, 마스크를 적용한 평균, 최근성 가중 평균으로 세 번 잰다.
for gap, name, ev in [("", "담장 안 로그인 유저", login), ("\n", "열린 RTB 쿠키", cookie)]:
    ids, mask, w, dropped = build(ev)
    print(f"{gap}[{name}] 원본 {len(ev)}개 -> 잘라낸 것 {len(dropped)}개")
    print(f"  ids  : {ids}")
    print(f"  mask : {mask}")
    print(f"  가중 : {[round(x, 3) for x in w[:8]]} ... (앞 8자리만)")
    sp = [1.0 if i == CAT["운동"] else 0.0 for i in ids]        # '운동' 자리만 1
    print(f"  '운동' 비중 — 패딩 포함 {sum(sp)/L*100:5.1f}% / "        # 잘못된 평균
          f"마스크 적용 {sum(sp)/sum(mask)*100:5.1f}% / "              # 진짜 자리만
          f"최근성 가중 {sum(s*x for s, x in zip(sp, w))/sum(w)*100:5.1f}%")
    if dropped:
        wd = sum(0.5 ** (a / HALF) for a, _ in dropped)
        print(f"  잘라낸 {len(dropped)}개의 가중 합 {wd:.4f} — "
              f"남긴 20개 합 {sum(w):.2f}의 {wd/sum(w)*100:.2f}%")

# 출력:
# 3단계 뜻: 로그인 유저는 27개 가운데 오래된 7개를 잘라내도 그 가중 합이 남긴 20개의 0.03% 뿐이다. '운동' 비중은 단순 평균 30.0% 가 최근성 가중으로 44.9% 가 된다.
# [담장 안 로그인 유저] 원본 27개 -> 잘라낸 것 7개
#   ids  : [11, 11, 11, 12, 11, 11, 13, 11, 12, 12, 12, 12, 13, 13, 12, 12, 12, 12, 12, 13]
#   mask : [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
#   가중 : [0.986, 0.98, 0.974, 0.966, 0.952, 0.938, 0.917, 0.888] ... (앞 8자리만)
#   '운동' 비중 — 패딩 포함  30.0% / 마스크 적용  30.0% / 최근성 가중  44.9%
#   잘라낸 7개의 가중 합 0.0033 — 남긴 20개 합 12.74의 0.03%
# 3단계 뜻: 쿠키는 이력이 3개라 나머지 자리를 PAD 0 으로 채운다. 마스크를 빼고 패딩까지 세면 '운동' 비중이 33.3% 가 아니라 5.0% 로 나온다.
#
# [열린 RTB 쿠키] 원본 3개 -> 잘라낸 것 0개
#   ids  : [11, 13, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
#   mask : [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
#   가중 : [0.98, 0.914, 0.762, 0.0, 0.0, 0.0, 0.0, 0.0] ... (앞 8자리만)
#   '운동' 비중 — 패딩 포함   5.0% / 마스크 적용  33.3% / 최근성 가중  36.9%
````

#### 블록 3

<!-- cb5 post=ctr-feature-engineering block=2 sha=d312391e2077aa0e -->
````python
# 하는 일: (광고, 지면) 조합 1만 개의 CTR 을 같은 날 로그, 자기 행만 뺀 같은 날 로그, 과거 7일 로그로 만들어 학습하고, 오프라인 AUC 와 다음 날 실서빙 AUC 를 견준다.
import random, math

# 1단계: 광고와 지면, 스무딩 설정을 둔다
# 같은 날 로그로 조합 CTR 을 만들면 피처 안에 그날의 클릭 결과가 섞인다(라벨 누출). 노출이 적은 조합의 CTR 은 0% 나 100% 로 튀어, 사전 CTR 을 섞어 스무딩한다.
random.seed(42)
N_AD, N_SLOT, IMP = 500, 20, 60_000     # 광고 500 x 지면 20 = 조합 1만, 하루 노출 6만
PRIOR, ALPHA = 0.02, 5.0                # 스무딩: 사전 CTR 2%를 노출 5건어치 가중치로 섞는다
sig = lambda z: 1.0 / (1.0 + math.exp(-max(-30.0, min(30.0, z))))
lg  = lambda p: math.log(p / (1 - p))

# 광고와 지면 모두 인기가 지프 분포다. 상위 몇 개가 트래픽을 독식한다.
ad_w, slot_w = [1/(i+1) for i in range(N_AD)], [1/(i+1) for i in range(N_SLOT)]
ad_q   = [lg(random.lognormvariate(-4.0, 0.5)) for _ in range(N_AD)]   # 광고 실력
slot_q = [random.gauss(0, 0.4) for _ in range(N_SLOT)]                 # 지면 실력

# 2단계: 노출을 만들고 조합별로 집계하는 함수를 만든다
def draw(n):
    """노출 n건을 만든다. 클릭 확률은 광고 실력 + 지면 실력 + 유저 친화도로 정해진다.
       친화도가 우리가 진짜 배우게 하고 싶은 신호다. 조합 CTR엔 그게 안 들어 있다."""
    out = []
    for ad, sl in zip(random.choices(range(N_AD), ad_w, k=n),
                      random.choices(range(N_SLOT), slot_w, k=n)):
        aff = random.gauss(0, 1)
        p = sig(ad_q[ad] + slot_q[sl] + 1.2 * aff)
        out.append((ad * N_SLOT + sl, aff, 1 if random.random() < p else 0))
    return out

def agg(days):
    """조합별 클릭, 노출을 센다. 여러 날을 한꺼번에 넘길 수 있다."""
    c, n = [0.0] * (N_AD * N_SLOT), [0.0] * (N_AD * N_SLOT)
    for rows in days:
        for key, _, y in rows: c[key] += y; n[key] += 1
    return c, n

# 3단계: 과거 7일과 오늘, 내일의 노출을 만든다
# 오늘(D)은 학습에 쓰고, 내일(D+1)은 실서빙에 해당한다.
past  = [draw(IMP) for _ in range(7)]    # D-7 ~ D-1
today, tmrw = draw(IMP), draw(IMP)       # D = 학습에 쓸 날 / D+1 = 실서빙에 해당
A = agg([today])                         # 누출 피처의 재료 — 오늘 하루
C = agg(past)                            # 정상 피처의 재료 — 과거 7일
S = agg(past[1:] + [today])              # 서빙 시점에 존재하는 값(D-6 ~ D)
print(f"하루 노출 1건뿐인 조합 {sum(1 for x in A[1] if x == 1):,}개, "
      f"한 번이라도 뜬 조합 {sum(1 for x in A[1] if x > 0):,}개\n")

# 4단계: 피처와 학습, AUC 를 구하는 함수를 만든다
def feat(rows, mode):
    """모델 입력 두 개 — (1) 조합 CTR의 로짓 (2) 유저 친화도.
       loo는 자기 행의 라벨만 빼고 집계한 값이다."""
    c, n = {"leak": A, "loo": A, "past": C, "serve": S}[mode]
    out = []
    for key, aff, y in rows:
        if mode == "loo": v = (c[key] - y + PRIOR*ALPHA) / (n[key] - 1 + ALPHA)
        else:             v = (c[key] + PRIOR*ALPHA) / (n[key] + ALPHA)
        out.append(([lg(min(0.9, max(1e-4, v))), aff], y))
    return out

def train(data, epochs=4, lr=0.06):
    """로지스틱 회귀를 SGD로 직접 학습한다. 파라미터는 3개(가중치 2 + 절편)."""
    w, b, idx = [0.0, 0.0], 0.0, list(range(len(data)))
    for _ in range(epochs):
        random.shuffle(idx)
        for i in idx:
            x, y = data[i]
            g = sig(w[0]*x[0] + w[1]*x[1] + b) - y
            w[0] -= lr*g*x[0]; w[1] -= lr*g*x[1]; b -= lr*g
    return w, b

def auc(data, w, b):
    """AUC를 직접 구현한다. 클릭한 노출의 점수가 안 한 노출보다 높았는지만 센다.
       점수가 실수라 동점이 없어, 순위 합만으로 계산할 수 있다."""
    s = sorted((w[0]*x[0] + w[1]*x[1] + b, y) for x, y in data)
    rank = sum(i + 1 for i, (_, y) in enumerate(s) if y == 1)
    pos = sum(y for _, y in s); neg = len(s) - pos
    return (rank - pos * (pos + 1) / 2) / (pos * neg)

# 5단계: 세 가지 피처로 학습해 오프라인과 실서빙 AUC 를 견준다
random.shuffle(today)                     # 같은 날에서 20%를 홀드아웃으로 뗀다
cut = int(len(today) * 0.8)
tr, ho = today[:cut], today[cut:]

out = {}
for tag, mode in [("A 같은 날 CTR(누출)", "leak"),
                  ("B 같은 날 CTR, 자기 행만 제외", "loo"),
                  ("C 과거 7일 CTR(시간 분리)", "past")]:
    w, b = train(feat(tr, mode))
    off, on = auc(feat(ho, mode), w, b), auc(feat(tmrw, "serve"), w, b)
    out[tag] = (off, on)
    print(f"[{tag}] 가중치 조합CTR {w[0]:5.2f} / 유저친화도 {w[1]:5.2f}")
    print(f"   오프라인 AUC {off:.4f} -> 실서빙 AUC {on:.4f}  ({on-off:+.4f})")

# 6단계: A 와 C 의 차이를 찍는다
a, c = out["A 같은 날 CTR(누출)"], out["C 과거 7일 CTR(시간 분리)"]
print(f"\n오프라인에선 A가 C보다 {a[0]-c[0]:+.4f} — 이 숫자로 배포를 결정한다")
print(f"실서빙에선 A가 C보다 {a[1]-c[1]:+.4f} — 개선은 없었다")

# 출력:
# 3단계 뜻: 오늘 한 번이라도 뜬 조합 6,926개 가운데 2,321개는 노출이 1건뿐이다. 그런 조합의 같은 날 CTR 은 자기 라벨과 거의 같다.
# 하루 노출 1건뿐인 조합 2,321개, 한 번이라도 뜬 조합 6,926개
#
# 5단계 뜻: 같은 날 CTR 을 그대로 쓴 A 는 오프라인 AUC 가 0.8938 인데 실서빙에서 0.7786 으로 -0.1152 떨어진다.
# [A 같은 날 CTR(누출)] 가중치 조합CTR  1.55 / 유저친화도  1.55
#    오프라인 AUC 0.8938 -> 실서빙 AUC 0.7786  (-0.1152)
# 5단계 뜻: 자기 행만 뺀 B 는 부풀림이 사라지지만, 조합CTR 가중치가 0.23 으로 낮아져 좋은 피처를 덜 믿는다.
# [B 같은 날 CTR, 자기 행만 제외] 가중치 조합CTR  0.23 / 유저친화도  1.40
#    오프라인 AUC 0.7795 -> 실서빙 AUC 0.7966  (+0.0171)
# 5단계 뜻: 과거 7일로 만든 C 는 오프라인 0.7767, 실서빙 0.7978 로 셋 가운데 실서빙 AUC 가 가장 높다.
# [C 과거 7일 CTR(시간 분리)] 가중치 조합CTR  0.58 / 유저친화도  1.14
#    오프라인 AUC 0.7767 -> 실서빙 AUC 0.7978  (+0.0210)
# 6단계 뜻: 오프라인에서는 A 가 C 보다 +0.1170 앞서 배포가 결정되지만, 실서빙에서는 -0.0192 로 진다.
#
# 오프라인에선 A가 C보다 +0.1170 — 이 숫자로 배포를 결정한다
# 실서빙에선 A가 C보다 -0.0192 — 개선은 없었다
````

#### 블록 4

<!-- cb5 post=ctr-feature-engineering block=3 sha=581761e0b69b57ed -->
````python
# 하는 일: 피처를 20개에서 320개까지 늘릴 때 임베딩 테이블, 요청당 전송, 필요 대역폭, 조회 지연을 셈해, 서버 예산 가운데 무엇이 먼저 넘치는지 본다.

# 1단계: 후보 수와 서버 예산을 둔다
# 전부 산수라 난수가 없다. 정확도가 아니라 메모리와 대역폭이 먼저 한계를 넘는지 본다.
CAND, QPS, DIM, BUCKET, VAL_B = 200, 50_000, 16, 2**18, 8
#     후보 200개, 초당 5만 요청, 임베딩 16차원, 해시 2^18, 집계값 하나 8바이트
MISS_NS = 100          # 임베딩 테이블은 커서 캐시에 안 들어간다. 랜덤 접근 1회 100ns
GB = 1024 ** 3
RAM_GB, NIC_GBPS, FETCH_MS = 4.0, 10.0, 3.0   # 서버 예산: 램 4GB / 10Gbps / 조회 3ms

# 2단계: 피처 수마다 네 값을 셈해 먼저 넘친 것을 찍는다
print("피처수  테이블   요청당 전송   필요 대역폭   조회지연   먼저 한계를 넘는 것")
for n in (20, 40, 80, 160, 320):
    ad, user = n // 2, n - n // 2      # 절반은 후보마다 달라지고, 절반은 요청당 하나다

    table_gb = n * BUCKET * DIM * 4 / GB          # 피처 하나당 임베딩 테이블 하나
    req_b = user * VAL_B + CAND * ad * VAL_B      # 광고 피처는 후보 수만큼 곱해진다
    gbps = req_b * QPS * 8 / 1e9
    ms = (CAND * ad + user) * MISS_NS / 1e6       # 유저 임베딩은 후보 전체에 재사용

    broke = "+".join(x for x, bad in
                     [("램", table_gb > RAM_GB), ("대역폭", gbps > NIC_GBPS),
                      ("지연", ms > FETCH_MS)] if bad)
    print(f"{n:>5}  {table_gb:6.2f} GB  {req_b/1024:8.1f} KB  {gbps:8.1f} Gbps"
          f"  {ms:6.2f} ms   {broke or '아직 여유 있음'}")

# 3단계: 광고 쪽 피처를 미리 계산해 둘 때를 셈한다
print("\n광고 쪽 피처를 서버에 미리 계산해 두면 — 요청 때 가져올 건 유저 쪽뿐이다")
for n in (40, 80, 160):
    req_b = (n - n // 2) * VAL_B
    gbps = req_b * QPS * 8 / 1e9
    print(f"  피처 {n:>3}개 -> 요청당 {req_b:>4} B, 대역폭 {gbps:5.2f} Gbps "
          f"({NIC_GBPS/gbps:>5.1f}배 여유)")

# 출력:
# 2단계 뜻: 피처 40개에서 대역폭이 12.9 Gbps 로 서버 예산을 먼저 넘는다. 그때 조회 지연은 0.40 ms 로 여유가 있고, 320개가 되어서야 램과 지연까지 넘친다.
# 피처수  테이블   요청당 전송   필요 대역폭   조회지연   먼저 한계를 넘는 것
#    20    0.31 GB      15.7 KB       6.4 Gbps    0.20 ms   아직 여유 있음
#    40    0.62 GB      31.4 KB      12.9 Gbps    0.40 ms   대역폭
#    80    1.25 GB      62.8 KB      25.7 Gbps    0.80 ms   대역폭
#   160    2.50 GB     125.6 KB      51.5 Gbps    1.61 ms   대역폭
#   320    5.00 GB     251.2 KB     102.9 Gbps    3.22 ms   램+대역폭+지연
# 3단계 뜻: 광고 쪽 피처를 서버에 미리 계산해 두면 요청 때 가져올 것이 유저 쪽뿐이라, 피처 40개의 전송이 160 B, 대역폭 0.06 Gbps 로 156.2배 여유가 생긴다.
#
# 광고 쪽 피처를 서버에 미리 계산해 두면 — 요청 때 가져올 건 유저 쪽뿐이다
#   피처  40개 -> 요청당  160 B, 대역폭  0.06 Gbps (156.2배 여유)
#   피처  80개 -> 요청당  320 B, 대역폭  0.13 Gbps ( 78.1배 여유)
#   피처 160개 -> 요청당  640 B, 대역폭  0.26 Gbps ( 39.1배 여유)
````

### 부록 17: offline-metrics-gauc (블록 2개, Task 5)

#### 블록 1

<!-- cb5 post=offline-metrics-gauc block=0 sha=cba19168d1e69a03 -->
````python
# 하는 일: 노출 여덟 건과 요청 6건(노출 30건)으로 클릭한 것과 안 눌린 것의 짝을 세어, 한 통에 섞은 순위 점수와 요청 안 순위 점수를 견준다.

# 1단계: 짝을 세는 함수를 만든다
# 규칙은 하나뿐이다. 클릭한 것 하나와 안 눌린 것 하나를 붙여, 클릭한 쪽 예측이 더 높으면 이긴 짝이다.
def pairs(rows):                 # -> (이긴 짝 수, 전체 짝 수). 두 예측이 같으면 반 개
    pos = [p for p, y in rows if y == 1]
    neg = [p for p, y in rows if y == 0]
    win = sum(1.0 if a > b else 0.5 if a == b else 0.0 for a in pos for b in neg)
    return win, len(pos) * len(neg)

# 2단계: 노출 여덟 건의 순위 점수를 재고 예측에 3 을 곱해 본다
eight = [(0.082, 1), (0.061, 0), (0.055, 1), (0.040, 0),      # 노출 여덟 건
         (0.034, 0), (0.028, 1), (0.019, 0), (0.011, 0)]

win, total = pairs(eight)
print(f"이긴 짝 {win:.0f} / 전체 짝 {total} -> 순위 점수 {win / total:.4f}")

w3, t3 = pairs([(p * 3, y) for p, y in eight])   # 모든 예측에 3을 곱해도
print(f"3배 후 순위 점수 {w3 / t3:.4f} (소수점까지 같다)")

# 3단계: 요청 6건의 노출 30건을 둔다
# 요청 6건에 자리가 5개씩이고, 요청 안에서는 예측 내림차순이다.
requests = {
    "메인상단 A": [(3.52, 0), (3.04, 1), (2.60, 1), (2.20, 0), (1.84, 0)],
    "메인상단 B": [(2.88, 1), (2.44, 0), (2.08, 0), (1.76, 1), (1.48, 0)],
    "피드중간 A": [(2.32, 0), (2.00, 0), (1.52, 1), (1.40, 0), (1.16, 0)],
    "피드중간 B": [(1.92, 0), (1.64, 0), (1.44, 1), (1.16, 0), (0.96, 0)],
    "검색상단 A": [(1.56, 0), (1.32, 0), (1.12, 0), (0.92, 0), (0.76, 0)],
    "검색상단 B": [(1.24, 0), (1.04, 0), (0.88, 0), (0.72, 0), (0.60, 0)],
}

# 4단계: 요청 구분을 지우고 한 통에 섞어 잰다
flat = [r for rows in requests.values() for r in rows]   # 요청 구분을 지운다
w, t = pairs(flat)
print(f"한 통에 섞어서 = {w:.0f}/{t} = {w / t:.4f}")

# 5단계: 요청마다 재서 짝 수만큼 가중해 합친다
gw = gt = 0.0
for name, rows in requests.items():
    w, t = pairs(rows)
    if t == 0:                       # 클릭이 없으면 짝을 하나도 못 만든다
        print(f"  {name}: 클릭 0건 -> 잴 수 없다, 버린다")
        continue
    gw, gt = gw + w, gt + t
    print(f"  {name}: {w:.0f}/{t} = {w / t:.3f}")
print(f"요청 안 순위 점수 = {gw:.0f}/{gt:.0f} = {gw / gt:.4f}")

# 출력:
# 2단계 뜻: 여덟 건에서 짝 15개 가운데 11개를 이겨 순위 점수가 0.7333 이다. 모든 예측에 3 을 곱해도 순서가 같아 0.7333 그대로다.
# 이긴 짝 11 / 전체 짝 15 -> 순위 점수 0.7333
# 3배 후 순위 점수 0.7333 (소수점까지 같다)
# 4단계 뜻: 요청 구분을 지우고 한 통에 섞으면 짝 144개 가운데 112개를 이겨 0.7778 이다.
# 한 통에 섞어서 = 112/144 = 0.7778
# 5단계 뜻: 요청 안에서만 짝을 지으면 0.500 에서 0.667 이고, 클릭이 없는 검색상단 두 건은 짝을 못 만들어 빠진다. 짝 수만큼 가중해 합친 요청 안 순위 점수는 12/20 = 0.6000 으로, 한 통에 섞어 잰 점수보다 낮다.
#   메인상단 A: 4/6 = 0.667
#   메인상단 B: 4/6 = 0.667
#   피드중간 A: 2/4 = 0.500
#   피드중간 B: 2/4 = 0.500
#   검색상단 A: 클릭 0건 -> 잴 수 없다, 버린다
#   검색상단 B: 클릭 0건 -> 잴 수 없다, 버린다
# 요청 안 순위 점수 = 12/20 = 0.6000
````

#### 블록 2

<!-- cb5 post=offline-metrics-gauc block=1 sha=b3f7e346a00191e4 -->
````python
# 하는 일: 뉴스피드와 검색 지면에서 20만 건씩 뽑은 예측으로 확률 벌점을 기저엔트로피로 나눈 정규화 엔트로피를 견주고, 뉴스피드 예측에 3 을 곱하면 무엇이 바뀌는지 본다.
import math, random

# 1단계: 지면마다 예측과 클릭을 뽑는 함수를 둔다
# 지면 두 곳에서 20만 건씩 뽑았다고 하자. base 는 평균 클릭률,
# spread 가 클수록 예측이 넓게 퍼진다(순서를 잘 나눈다). 전부 지어낸 값이다.
rnd = random.Random(20260814)

def sample(n, base, spread):
    out = []
    for _ in range(n):
        z = rnd.gauss(0, 1)
        p = base * math.exp(spread * z - spread * spread / 2)  # 평균이 base 로 남는다
        p = min(p, 0.9)
        out.append((p, 1 if rnd.random() < p else 0))
    return out

# 2단계: 확률 벌점과 기저엔트로피를 구하는 함수를 만든다
# 기저엔트로피는 늘 평균 클릭률 하나만 답하는 모델의 벌점이다. 확률 벌점을 이것으로 나눈 값이 정규화 엔트로피다.
def logloss(rows):
    s = 0.0
    for p, y in rows:
        s += -(y * math.log(p) + (1 - y) * math.log(1 - p))
    return s / len(rows)

def entropy(p):                # 늘 같은 값만 답하는 모델의 벌점
    return -(p * math.log(p) + (1 - p) * math.log(1 - p))

# 3단계: 두 지면의 정규화 엔트로피를 견준다
feed = sample(200_000, 0.040, 0.9)     # 뉴스피드 — 평균 4%, 잘 나누는 모델
search = sample(200_000, 0.010, 0.5)   # 검색 — 평균 1%, 덜 나누는 모델

for name, rows in (("뉴스피드", feed), ("검색", search)):
    ctr = sum(y for _, y in rows) / len(rows)
    ll, h = logloss(rows), entropy(ctr)
    print(f"{name}: 평균클릭률 {ctr * 100:.3f}%  확률벌점 {ll:.5f}"
          f"  기저엔트로피 {h:.5f}  정규화엔트로피 {ll / h:.4f}")

# 4단계: 뉴스피드 예측에 3 을 곱해 본다
# 순서는 그대로 두고 크기만 바꾼다.
tripled = [(min(p * 3, 0.999), y) for p, y in feed]   # 1에 닿지 않게 0.999 에서 자른다
ctr = sum(y for _, y in feed) / len(feed)
h = entropy(ctr)
print(f"뉴스피드 3배: 확률벌점 {logloss(tripled):.5f}"
      f"  정규화엔트로피 {logloss(tripled) / h:.4f}")
print(f"뉴스피드 예측총합대실제: {ctr / (sum(p for p, _ in feed) / len(feed)):.3f}"
      f" -> {ctr / (sum(p for p, _ in tripled) / len(tripled)):.3f}")

# 출력:
# 3단계 뜻: 확률 벌점만 보면 검색 0.05418 이 뉴스피드 0.15296 보다 좋다. 기저엔트로피로 나누면 뉴스피드가 0.8989, 검색이 0.9788 로 순서가 뒤집힌다.
# 뉴스피드: 평균클릭률 4.070%  확률벌점 0.15296  기저엔트로피 0.17016  정규화엔트로피 0.8989
# 검색: 평균클릭률 0.986%  확률벌점 0.05418  기저엔트로피 0.05536  정규화엔트로피 0.9788
# 4단계 뜻: 예측에 3 을 곱하면 순서는 같은데 정규화 엔트로피가 1.2093 으로 1 을 넘는다. 예측 총합 대 실제도 1.018 에서 0.342 로 떨어진다.
# 뉴스피드 3배: 확률벌점 0.20577  정규화엔트로피 1.2093
# 뉴스피드 예측총합대실제: 1.018 -> 0.342
````

### 부록 18: position-bias-ultr (블록 1개, Task 5)

#### 블록 1

<!-- cb5 post=position-bias-ultr block=0 sha=788c2eb9e7ca1db9 -->
````python
# 하는 일: 위치만 바꿔 보여 준 프로브 광고로 위치마다 Examination 확률을 추정하고, 그 확률로 광고 5개의 관측 CTR 을 IPW 로 되돌려 진짜 순위를 되찾는다.
import random

random.seed(42)

# 1단계: 같은 광고를 위치만 바꿔 보여 주는 실험에서 Examination 확률을 추정한다
# 표준 라이브러리만 쓴다. 그대로 복붙해 돌리면 2절 표의 "보정 CTR" "보정 순위"가 똑같이 나온다.
def simulate_clicks(n_impressions, click_prob):
    # 노출 하나하나에 동전을 던져(무작위) 클릭 여부를 정하고, 클릭 수를 센다.
    return sum(1 for _ in range(n_impressions) if random.random() < click_prob)

# 진짜 Examination 확률(TRUE_EXAM)은 세상만 알고, 우리는 노출, 클릭만 본다고 가정한다.
TRUE_EXAM = {1: 1.00, 2: 0.75, 3: 0.50, 4: 0.30, 5: 0.15}   # 검증용 정답 -- 코드는 모르는 척한다
PROBE_TRUE_RELEVANCE = 0.05      # 프로브 광고의 진짜 품질(위치를 바꿔도 불변)
PROBE_IMPRESSIONS = 50_000       # 위치마다 이만큼 무작위로 노출

probe_ctr = {}
for pos, exam in TRUE_EXAM.items():
    clicks = simulate_clicks(PROBE_IMPRESSIONS, PROBE_TRUE_RELEVANCE * exam)
    probe_ctr[pos] = clicks / PROBE_IMPRESSIONS

# 1위를 기준(100%)으로 삼아 상대 비율로 Examination 확률을 추정한다.
est_exam = {pos: ctr / probe_ctr[1] for pos, ctr in probe_ctr.items()}

# 2단계: 서로 다른 5개 광고가 각자 자기 위치에서 낸 관측 데이터를 만든다
ads = {
    #  광고: (위치, 노출수, 진짜 품질 -- 실무에선 아무도 모르는 값)
    "A": (1, 10_000, 0.0300),
    "B": (2, 10_000, 0.0280),
    "C": (3, 10_000, 0.0260),
    "D": (4, 10_000, 0.0400),   # 위치는 4위지만 진짜 품질은 다섯 광고 중 가장 높다
    "E": (5, 10_000, 0.0100),
}

observed = {}
for ad, (pos, n, true_relevance) in ads.items():
    exam = TRUE_EXAM[pos]                                # 세상은 이 확률로 실제 노출을 만든다
    clicks = simulate_clicks(n, true_relevance * exam)
    observed[ad] = {"pos": pos, "n": n, "clicks": clicks, "ctr": clicks / n}

# 3단계: 관측 CTR 을 추정 Examination 확률로 나눠 되돌린다
# 이것이 IPW 다. 추정한 확률과 관측 순위, 보정 순위를 함께 찍는다.
for ad, row in observed.items():
    row["corrected"] = row["ctr"] / est_exam[row["pos"]]

raw_rank = sorted(observed, key=lambda a: -observed[a]["ctr"])
corrected_rank = sorted(observed, key=lambda a: -observed[a]["corrected"])

print("추정 Examination 확률 (실제 vs 추정):")
for pos in sorted(est_exam):
    print(f"  {pos}위  실제 {TRUE_EXAM[pos]*100:5.1f}%   추정 {est_exam[pos]*100:5.1f}%")
print()
print(f"{'광고':<4}{'위치':<6}{'관측 CTR':>10}{'보정 CTR':>10}")
for ad in "ABCDE":
    row = observed[ad]
    print(f"{ad:<4}{row['pos']:<6}{row['ctr']*100:>9.2f}%{row['corrected']*100:>9.2f}%")
print()
print("관측 순위(그냥 CTR 순)  :", " > ".join(raw_rank))
print("보정 순위(IPW 적용 후)  :", " > ".join(corrected_rank))

# 출력:
# 3단계 뜻: 프로브 광고로 추정한 Examination 확률은 2위 74.4%, 5위 16.4% 처럼 실제 값에 가깝다.
# 추정 Examination 확률 (실제 vs 추정):
#   1위  실제 100.0%   추정 100.0%
#   2위  실제  75.0%   추정  74.4%
#   3위  실제  50.0%   추정  49.4%
#   4위  실제  30.0%   추정  29.5%
#   5위  실제  15.0%   추정  16.4%
#
# 3단계 뜻: 관측 CTR 은 위치 순서대로 A 2.77% 에서 E 0.17% 로 떨어진다. 추정 확률로 나누면 4위 D 가 4.06% 로 가장 높다.
# 광고  위치        관측 CTR    보정 CTR
# A   1          2.77%     2.77%
# B   2          1.92%     2.58%
# C   3          1.46%     2.95%
# D   4          1.20%     4.06%
# E   5          0.17%     1.03%
#
# 3단계 뜻: 관측 순위는 A > B > C > D > E 인데, 위치 효과를 걷어낸 보정 순위는 D > C > A > B > E 다.
# 관측 순위(그냥 CTR 순)  : A > B > C > D > E
# 보정 순위(IPW 적용 후)  : D > C > A > B > E
````

### 부록 19: model-monitoring (블록 4개, Task 5)

#### 블록 1

<!-- cb5 post=model-monitoring block=0 sha=d1a2b6d03a00492a -->
````python
# 하는 일: 학습 때 본 피처 하나의 십분위 경계로 PSI(Population Stability Index)를 재, 평균이 밀린 정도와 표본 크기에 따라 값이 어떻게 달라지는지 본다.
import random
import math

random.seed(42)  # 돌릴 때마다 같은 결과가 나오게 고정

# 1단계: 경계와 비율, PSI 를 구하는 함수를 만든다
# PSI 는 학습 때 본 입력과 오늘 입력이 얼마나 다른지를 한 숫자로 나타낸다. 경계는 학습 표본의 십분위로 한 번만 정한다.
def make_edges(sample, n_bins=10):
    """학습 표본을 같은 개수씩 담는 십분위로 자르고 그 경계만 돌려준다."""
    s = sorted(sample)
    # 경계는 학습 때 한 번만 정하고 모델과 함께 저장한다. 매일 다시 자르면 PSI가 늘 0이 된다.
    return [s[len(s) * i // n_bins] for i in range(1, n_bins)]

def to_shares(sample, edges):
    """표본을 구간별 '비율'로 바꾼다. PSI는 개수가 아니라 비율로 잰다."""
    counts = [0] * (len(edges) + 1)
    for x in sample:
        k = 0
        while k < len(edges) and x >= edges[k]:
            k += 1                       # x가 몇 번째 구간인지 찾는다
        counts[k] += 1
    return [c / len(sample) for c in counts]

def psi(base, now, floor=1e-4):
    """구간마다 (오늘비율 - 학습비율) x ln(오늘비율/학습비율) 을 더한다."""
    total = 0.0
    for b, a in zip(base, now):
        b, a = max(b, floor), max(a, floor)   # 비율 0이면 로그가 발산하므로 바닥을 깐다
        total += (a - b) * math.log(a / b)
    return total

# 2단계: 학습 때 본 피처의 경계와 비율을 정한다
# 학습 때 본 피처 하나를 '유저의 최근 7일 광고 반응 점수'라 하자(평균 0, 표준편차 1).
N = 200_000
train = [random.gauss(0.0, 1.0) for _ in range(N)]
edges = make_edges(train, 10)
base = to_shares(train, edges)

# 3단계: 평균이 밀린 네 경우를 같은 경계로 잰다
# 오늘 입력의 평균이 조금씩 밀린 네 경우다. PSI 와 함께, PSI 가 감추는 구간별 실제 차이도 찍는다.
print("평균이동   PSI    구간별최대차이  10%에서 2%p 이상 벗어난 구간")
for shift in (0.10, 0.23, 0.40, 0.57):
    now = to_shares([random.gauss(shift, 1.0) for _ in range(N)], edges)
    max_gap = max(abs(a - b) * 100 for b, a in zip(base, now))   # PSI가 감추는 실제 차이
    off = sum(1 for a in now if abs(a - 0.10) > 0.02)            # 10%에서 크게 벗어난 구간 수
    print(f"  {shift:+.2f}   {psi(base, now):.3f}      {max_gap:4.1f}%p        {off}개 / 10개")

# 4단계: 사고가 없을 때 표본 크기별 PSI 를 잰다
# 사고가 없어도 표본이 작으면 PSI 가 저절로 올라간다. 임계값의 함정이 여기다.
print()
print("표본크기   사고가 없는데도 나오는 PSI (같은 분포에서 20번 뽑아 비교)")
for n in (100, 300, 1_000, 10_000, 200_000):
    vals = sorted(psi(base, to_shares([random.gauss(0.0, 1.0) for _ in range(n)], edges))
                  for _ in range(20))
    print(f"{n:7d}    평균 {sum(vals) / len(vals):.3f}   최댓값 {vals[-1]:.3f}")

# 출력:
# 3단계 뜻: 평균이 +0.10 밀리면 PSI 가 0.009 로 조용하고, +0.23 이면 0.050 에 구간별 최대 4.5%p 차이다. +0.57 이면 0.303 으로 구간 8개가 10% 에서 2%p 넘게 벗어난다.
# 평균이동   PSI    구간별최대차이  10%에서 2%p 이상 벗어난 구간
#   +0.10   0.009       1.7%p        0개 / 10개
#   +0.23   0.050       4.5%p        4개 / 10개
#   +0.40   0.149       8.7%p        6개 / 10개
#   +0.57   0.303      13.6%p        8개 / 10개
# 4단계 뜻: 같은 분포끼리 비교해도 표본이 100 이면 PSI 평균이 0.098, 최댓값이 0.169 로 나온다. 표본이 10000 이면 평균 0.001 로 준다.
#
# 표본크기   사고가 없는데도 나오는 PSI (같은 분포에서 20번 뽑아 비교)
#     100    평균 0.098   최댓값 0.169
#     300    평균 0.029   최댓값 0.065
#    1000    평균 0.009   최댓값 0.019
#   10000    평균 0.001   최댓값 0.002
#  200000    평균 0.000   최댓값 0.000
````

#### 블록 2

<!-- cb5 post=model-monitoring block=1 sha=9bc2663efa01a27d -->
````python
# 하는 일: 60일 가운데 40일차에 사고가 나는 시뮬레이션으로, 예측 평균 감시, 성숙도 보정 감시, 7일 확정 감시가 사고를 며칠 만에 잡고 오탐이 몇 건인지 견준다.
import random
import math

random.seed(42)

# 1단계: 사고 전후의 전환율과 예측, 전환 지연 곡선을 둔다
# 40일차에 피처가 깨져 예측 평균이 2.00% 에서 1.56% 로, 진짜 전환율이 2.00% 에서 1.40% 로 떨어진다.
DAYS, INCIDENT, CLICKS = 60, 40, 20_000   # 60일 시뮬, 40일차에 사고, 하루 클릭 2만
CVR_OK, CVR_BAD = 0.0200, 0.0140          # 진짜 전환율 2.00% -> 1.40%
PRED_OK, PRED_BAD = 0.0200, 0.0156        # 모델 예측 평균 2.00% -> 1.56%
# 클릭 뒤 k일째 도착하는 전환 비율. 금요일과 토요일 클릭은 결제가 주말 뒤로 밀려 앞쪽이 느리다.
DELAY_WEEKDAY = [0.37, 0.23, 0.15, 0.10, 0.06, 0.04, 0.03, 0.02]   # 합 1.00
DELAY_WEEKEND = [0.28, 0.18, 0.16, 0.13, 0.10, 0.07, 0.05, 0.03]   # 합 1.00
MATURITY_1D = 0.57      # 감시 코드가 쓰는 '하루 지나면 57%는 온다'는 고정 가정
BASELINE, TOL = 0.0200, 0.10   # 기준선 2.00%, 기준선보다 10% 이상 낮으면 그날은 위반

# 2단계: 날마다 전환이 도착하는 과정을 만든다
# binom 은 numpy 없이 이항 표본을 흉내 내고, curve 는 금요일과 토요일 클릭에 느린 곡선을 준다.
def binom(n, p):
    """이항 표본을 정규근사로 뽑는다. numpy 없이 표본 노이즈만 흉내낸다."""
    return max(0, round(random.gauss(n * p, math.sqrt(n * p * (1 - p)))))

def curve(day):
    """그 날 클릭의 지연 곡선. 0=월요일이므로 금(4), 토(5)가 느린 곡선을 쓴다."""
    return DELAY_WEEKEND if day % 7 in (4, 5) else DELAY_WEEKDAY

# 날마다 진짜 전환 수를 뽑고, 지연 곡선에 따라 도착일로 흘려 놓는다.
arrived = [[0.0] * (DAYS + 8) for _ in range(DAYS)]    # arrived[클릭일][도착일]
pred_mean = [0.0] * DAYS
for d in range(DAYS):
    conv = binom(CLICKS, CVR_BAD if d >= INCIDENT else CVR_OK)
    for k, share in enumerate(curve(d)):
        arrived[d][d + k] = conv * share
    base = PRED_BAD if d >= INCIDENT else PRED_OK
    pred_mean[d] = base + random.gauss(0, 0.00008)      # 예측 평균은 흔들림이 아주 작다

# 3단계: 감시 방식 세 가지를 만든다
# 예측 평균은 그날 바로 보고, 확정 윈도우는 7일 전 클릭을, 성숙도 보정은 어제 클릭을 도착률 57% 로 나눠 본다.
def cum(click_day, upto):
    """click_day에 누른 클릭 중 upto 날까지 도착한 전환 수."""
    return sum(arrived[click_day][:upto + 1])

# 감시 방식 세 가지. 각 함수는 관측일 D에서 '지금 볼 수 있는 값'만 돌려준다.
def watch_pred(D):
    return pred_mean[D]                                # 라벨이 없어도 그날 값을 그날 본다

def watch_settled(D):
    d = D - 7                                          # 7일 지나 전환이 다 들어온 클릭일
    return None if d < 0 else cum(d, D) / CLICKS

def watch_corrected(D):
    d = D - 1                                          # 어제 클릭을 도착률로 나눠 되돌린다
    return None if d < 0 else cum(d, D) / (CLICKS * MATURITY_1D)

# 4단계: 감시 방식마다 알람을 울려 본다
# 최근 3일 가운데 2일이 기준선보다 10% 이상 낮으면 알람이다.
def run(name, fn):
    """최근 3일 중 2일이 위반이면 알람. 연달아 울린 것은 한 건으로 묶어 센다."""
    bad = []
    for D in range(DAYS):
        v = fn(D)
        bad.append(v is not None and v < BASELINE * (1 - TOL))
    fired = [D for D in range(2, DAYS) if sum(bad[D - 2:D + 1]) >= 2]
    after = [D for D in fired if D >= INCIDENT]
    false_events = sum(1 for D in fired if D < INCIDENT and (D - 1) not in fired)
    day = f"{after[0]}일차" if after else "-"
    lag = f"{after[0] - INCIDENT}일 뒤" if after else "못 잡음"
    print(f"{name:22s} {day:>7s}  {lag:>7s}   사고 전 오탐 {false_events}건")

print("감시 방식                 알람일   사고 후   (60일 시뮬, 사고는 40일차)")
run("예측 평균 (라벨 불필요)", watch_pred)
run("성숙도 보정 (어제 윈도우)", watch_corrected)
run("확정 윈도우 (7일 대기)", watch_settled)

# 5단계: 관측일마다 세 방식이 본 숫자를 나란히 찍는다
print()
print("관측일  예측평균   보정CVR   확정CVR")
for D in (39, 40, 41, 45, 47, 48):
    s = watch_settled(D)
    print(f"{D:5d}   {watch_pred(D) * 100:6.3f}%   {watch_corrected(D) * 100:6.3f}%   "
          f"{'-' if s is None else format(s * 100, '6.3f') + '%'}")

# 출력:
# 4단계 뜻: 예측 평균은 사고 1일 뒤인 41일차에 오탐 없이 잡는다. 성숙도 보정도 41일차에 잡지만 사고 전 오탐이 5건이고, 확정 윈도우는 8일 뒤인 48일차에야 잡는다.
# 감시 방식                 알람일   사고 후   (60일 시뮬, 사고는 40일차)
# 예측 평균 (라벨 불필요)            41일차     1일 뒤   사고 전 오탐 0건
# 성숙도 보정 (어제 윈도우)           41일차     1일 뒤   사고 전 오탐 5건
# 확정 윈도우 (7일 대기)            48일차     8일 뒤   사고 전 오탐 0건
# 5단계 뜻: 40일차에 예측 평균은 이미 1.558% 로 내려왔는데, 확정 CVR 은 7일 전 클릭을 보느라 2.005% 로 멀쩡하다. 확정 CVR 은 47일차에야 1.340% 로 떨어진다.
#
# 관측일  예측평균   보정CVR   확정CVR
#    39    2.006%    2.205%    2.095%
#    40    1.558%    1.610%    2.005%
#    41    1.551%    1.081%    1.970%
#    45    1.567%    1.495%    2.095%
#    47    1.563%    1.150%    1.340%
#    48    1.560%    1.190%    1.245%
````

#### 블록 3

<!-- cb5 post=model-monitoring block=2 sha=52f31954626eb673 -->
````python
# 하는 일: 지면 6곳의 예측 클릭과 실제 클릭으로, 전체 COPC 는 1.000 인데 지면별로는 0.42 에서 1.50 으로 흩어지는 상황을 계산하고 무엇을 대신 올릴지 본다.
import math

# 1단계: 지면 6곳의 예측과 실제를 둔다
# COPC 는 실제 클릭 / 예측 클릭이다. 1보다 크면 모델이 과소예측한 것이다.
# 가상 데이터: (지면 이름, 노출 수, 예측 CTR, 실제 CTR)
placements = [
    ("뉴스 피드",     4_000_000, 0.0200, 0.0190),
    ("검색 상단",     1_500_000, 0.0500, 0.0573),
    ("앱 배너",       2_000_000, 0.0100, 0.0062),
    ("동영상 인스트림",  800_000, 0.0080, 0.0120),
    ("쇼핑 추천",     1_200_000, 0.0300, 0.0315),
    ("신규 지면 X",     300_000, 0.0250, 0.0105),
]
# 지면마다 (이름, 노출, 예측 클릭, 실제 클릭, COPC)로 펼친다.
rows = [(n, imp, imp * pc, imp * ac, ac / pc) for n, imp, pc, ac in placements]
total_pred = sum(r[2] for r in rows)
total_act = sum(r[3] for r in rows)

# 2단계: 지면별 COPC 와 합계를 찍는다
print("지면              예측클릭    실제클릭   COPC   차이(클릭)")
for name, imp, pred, act, copc in rows:
    print(f"{name:14s} {pred:9,.0f} {act:10,.0f}  {copc:5.3f}  {act - pred:+9,.0f}")
print(f"{'합계':14s} {total_pred:9,.0f} {total_act:10,.0f}  {total_act / total_pred:5.3f}")

# 3단계: 과대예측 몫과 과소예측 몫을 센다
# 합계가 멀쩡해 보이는 이유는 두 몫이 서로를 지우기 때문이다.
over = sum(r[2] - r[3] for r in rows if r[4] < 1)      # 예측이 실제보다 많았던 클릭 수
under = sum(r[3] - r[2] for r in rows if r[4] > 1)     # 예측이 실제보다 적었던 클릭 수
print()
print(f"과대예측 합계 {over:,.0f} 클릭 / 과소예측 합계 {under:,.0f} 클릭")
print(f"전체 예측 클릭의 {over / total_pred * 100:.1f}%가 엉뚱한 지면에 얹혀 있다")

# 4단계: 전체 지표 대신 올릴 숫자를 구한다
# 가중 절대 편차는 상쇄가 일어나지 않는다.
wmad = sum(r[2] / total_pred * abs(r[4] - 1) for r in rows)   # 예측 클릭을 가중치로 쓴다
worst = max(rows, key=lambda r: abs(r[4] - 1))
breach = [r for r in rows if abs(r[4] - 1) > 0.10]            # 10% 넘게 틀어진 지면
print()
print(f"전체 COPC 편차          : {abs(total_act / total_pred - 1) * 100:.1f}%  (알람 안 울림)")
print(f"가중 평균 절대 편차     : {wmad * 100:.1f}%  (알람 울림)")
print(f"최악 세그먼트           : {worst[0]} COPC {worst[4]:.3f}")
print(f"10% 넘게 틀어진 지면    : {len(breach)}개, "
      f"예측 클릭의 {sum(r[2] for r in breach) / total_pred * 100:.1f}%")

# 5단계: 세그먼트를 잘게 쪼갤 때의 바닥 노이즈를 잰다
# 실제 클릭이 포아송이면 COPC의 표준편차는 대략 1/sqrt(예측 클릭 수)다.
print()
print("예측클릭   COPC 노이즈 폭(95%)   10% 임계값이 잡는 것")
for n in (100, 400, 10_000):
    band = 1.96 / math.sqrt(n)
    print(f"{n:8,d}   +-{band * 100:5.1f}%            {'노이즈' if band > 0.10 else '실제 이상'}")
print(f"임계값 10%가 노이즈에 안 걸리는 최소 클릭 수: {math.ceil((1.96 / 0.10) ** 2):,d}건")

# 출력:
# 2단계 뜻: 합계는 예측 224,900 과 실제 224,900 이 같아 COPC 1.000 이다. 지면별로는 신규 지면 X 0.420 부터 동영상 인스트림 1.500 까지 흩어진다.
# 지면              예측클릭    실제클릭   COPC   차이(클릭)
# 뉴스 피드             80,000     76,000  0.950     -4,000
# 검색 상단             75,000     85,950  1.146    +10,950
# 앱 배너              20,000     12,400  0.620     -7,600
# 동영상 인스트림           6,400      9,600  1.500     +3,200
# 쇼핑 추천             36,000     37,800  1.050     +1,800
# 신규 지면 X            7,500      3,150  0.420     -4,350
# 합계               224,900    224,900  1.000
# 3단계 뜻: 과대예측한 클릭 15,950 과 과소예측한 클릭 15,950 이 서로를 지운다. 전체 예측 클릭의 7.1% 가 엉뚱한 지면에 얹혀 있다.
#
# 과대예측 합계 15,950 클릭 / 과소예측 합계 15,950 클릭
# 전체 예측 클릭의 7.1%가 엉뚱한 지면에 얹혀 있다
# 4단계 뜻: 전체 COPC 편차는 0.0% 인데 가중 평균 절대 편차는 14.2% 다. 10% 넘게 틀어진 지면이 4개이고, 예측 클릭의 48.4% 를 차지한다.
#
# 전체 COPC 편차          : 0.0%  (알람 안 울림)
# 가중 평균 절대 편차     : 14.2%  (알람 울림)
# 최악 세그먼트           : 신규 지면 X COPC 0.420
# 10% 넘게 틀어진 지면    : 4개, 예측 클릭의 48.4%
# 5단계 뜻: 예측 클릭이 100건이면 아무 일이 없어도 COPC 가 +- 19.6% 안에서 흔들려, 10% 임계값은 노이즈를 잰다. 노이즈에 안 걸리려면 예측 클릭이 385건은 있어야 한다.
#
# 예측클릭   COPC 노이즈 폭(95%)   10% 임계값이 잡는 것
#      100   +- 19.6%            노이즈
#      400   +-  9.8%            실제 이상
#   10,000   +-  2.0%            실제 이상
# 임계값 10%가 노이즈에 안 걸리는 최소 클릭 수: 385건
````

#### 블록 4

<!-- cb5 post=model-monitoring block=3 sha=9631755f930be8a4 -->
````python
# 하는 일: 사고 8건이 섞인 30일치 시간당 COPC 에 임계값과 '연속 몇 번' 규칙을 바꿔 가며 알람을 걸어, 오탐과 적발, 감지 지연을 견준다.
import random
import math

random.seed(42)

# 1단계: 30일치 감시 윈도우와 사고 8건을 둔다
# 지표는 시간당 COPC(실제 클릭 / 예측 클릭)이고, 정상이면 1.00 근처다.
DAYS, PER_DAY = 30, 24
N = DAYS * PER_DAY                       # 감시 윈도우 720개 = 30일 x 시간당 1개
PRED_CLICKS = 4_000                      # 윈도우 하나에 담기는 예측 클릭 수
MIX_SD = 0.030                           # 트래픽 믹스가 시간마다 흔들리는 폭(사고 아님)
SAMPLE_SD = 1 / math.sqrt(PRED_CLICKS)   # 클릭 수가 유한해서 생기는 표본 노이즈
# 실제로 일어난 사고 8건: (시작 윈도우, 지속 윈도우 수, COPC 낙폭). 절반은 -7%, 절반은 -16%다.
INCIDENTS = [(72, 6, 0.07), (180, 6, 0.16), (300, 6, 0.07), (408, 6, 0.16),
             (504, 6, 0.07), (576, 6, 0.16), (636, 6, 0.07), (684, 6, 0.16)]

# 2단계: 진짜 COPC 와 대시보드에 찍히는 값을 만든다
# 사고 윈도우에서는 진짜 COPC 를 낙폭만큼 낮춘다.
truth = [1.0] * N                        # 사고가 없을 때의 진짜 COPC
incident_windows = set()
for start, length, drop in INCIDENTS:
    for i in range(start, start + length):
        truth[i] -= drop
        incident_windows.add(i)

# 대시보드에 찍히는 값 = 진짜 값 + 믹스 변동 + 표본 노이즈
observed = [truth[i] + random.gauss(0, MIX_SD) + random.gauss(0, SAMPLE_SD)
            for i in range(N)]

# 3단계: 규칙마다 오탐과 적발, 감지 지연을 세는 함수를 만든다
# 임계값 th 를 넘는 윈도우를 위반으로 보고, 최근 span 개 가운데 need 개가 위반이면 울린다.
def score(th, need=1, span=1):
    """임계값 th, '최근 윈도우 span개 중 need개 위반' 규칙일 때의 오탐, 적발, 감지 지연."""
    breach = [abs(v - 1.0) > th for v in observed]
    fired = [i for i in range(span - 1, N) if sum(breach[i - span + 1:i + 1]) >= need]
    fset = set(fired)
    # 사고 윈도우가 아닌데 울린 것은 오탐. 연달아 울린 것은 한 건으로 묶는다.
    false_events = sum(1 for i in fired
                       if i not in incident_windows and (i - 1) not in fset)
    small = big = 0
    lags = []
    for start, length, drop in INCIDENTS:
        # 사고 윈도우 안이나 끝난 뒤 2시간 안에 울렸으면 그 사고를 잡은 것으로 본다.
        hit = [i for i in fired if start <= i < start + length + 2]
        if hit:
            lags.append(hit[0] - start)
            if drop < 0.10:
                small += 1               # 작은 사고(-7%)를 잡은 횟수
            else:
                big += 1                 # 큰 사고(-16%)를 잡은 횟수
    lag = f"{sum(lags) / len(lags):.1f}시간" if lags else "-"
    return false_events, small, big, lag

# 4단계: 임계값 여섯 가지를 견준다
print(f"윈도우 {N}개(30일), 사고 8건, 사고 윈도우 {len(incident_windows)}개")
print("임계값  오탐  하루알람   작은사고(-7%)  큰사고(-16%)  평균감지")
for th in (0.03, 0.05, 0.08, 0.10, 0.15, 0.20):
    fe, small, big, lag = score(th)
    print(f" {th:.2f}  {fe:4d}건  {fe / DAYS:5.2f}회   {small:6d}/4건      "
          f"{big:4d}/4건    {lag:>6s}")

# 5단계: 임계값을 5% 로 고정하고 규칙만 바꾼다
# '몇 번 연달아 위반해야 부를까'만 바꿔 본다.
print()
print("임계값 5% 고정, 알람 규칙만 교체")
print("규칙          오탐   작은사고  큰사고  평균감지")
for name, need, span in (("1회 즉시", 1, 1), ("3회 중 2회", 2, 3),
                         ("3회 연속", 3, 3), ("6회 중 4회", 4, 6)):
    fe, small, big, lag = score(0.05, need, span)
    print(f"{name:11s} {fe:4d}건   {small:4d}/4건  {big:3d}/4건  {lag:>6s}")

# 출력:
# 4단계 뜻: 임계값 0.03 은 사고를 다 잡지만 오탐이 153건, 하루 5.10회다. 0.08 은 하루 0.47회에 사고 8건을 다 잡고, 0.15 는 오탐이 없지만 작은 사고를 0/4건 잡는다.
# 윈도우 720개(30일), 사고 8건, 사고 윈도우 48개
# 임계값  오탐  하루알람   작은사고(-7%)  큰사고(-16%)  평균감지
#  0.03   153건   5.10회        4/4건         4/4건     0.1시간
#  0.05    80건   2.67회        4/4건         4/4건     0.2시간
#  0.08    14건   0.47회        4/4건         4/4건     0.6시간
#  0.10     1건   0.03회        3/4건         4/4건     0.4시간
#  0.15     0건   0.00회        0/4건         4/4건     0.0시간
#  0.20     0건   0.00회        0/4건         3/4건     2.7시간
# 5단계 뜻: 임계값 5% 에서 1회 즉시는 오탐 80건이고, 3회 중 2회는 26건으로 줄면서 사고 8건을 다 잡고 평균 1.1시간에 감지한다. 3회 연속은 오탐 0건이지만 작은 사고 하나를 놓친다.
#
# 임계값 5% 고정, 알람 규칙만 교체
# 규칙          오탐   작은사고  큰사고  평균감지
# 1회 즉시         80건      4/4건    4/4건   0.2시간
# 3회 중 2회       26건      4/4건    4/4건   1.1시간
# 3회 연속          0건      3/4건    4/4건   2.3시간
# 6회 중 4회        1건      3/4건    4/4건   2.9시간
````

---

### Task 1: calibration 블록 4개 옮기기와 화면 확인

**Files:**
- Modify: `posts/calibration.md` (파이썬 블록 4개를 새 블록으로)
- Modify: `scripts/code-blocks-baseline.json`
- 임시: `$SCRATCH/migrate_batch5.py`, `$SCRATCH/nocache_server.py`, `$SCRATCH/venv` (저장소에 넣지 않는다. Task 2~6 도 쓴다)

**Interfaces:**
- Consumes: 넷째 묶음이 올라간 main(새 형식 120개, 옛 형식 127개, 48편), 이 계획 부록 1 의 새 블록 4개
- Produces: 새 형식 블록 124개, 옛 형식 123개(47편). Task 2~5 가 같은 도우미를 `python3 "$SCRATCH/migrate_batch5.py" <계획 문서> posts <글 파일 이름>` 으로 쓴다. 옮기면 `<글 파일 이름>: 블록 N개를 옮겼습니다` 를 찍고 종료 코드 0 이다. 멈추면 `<글 파일 이름>: 바꾸지 않고 멈춥니다` 와 까닭 줄을 찍고 종료 코드 1 이며, 글은 그대로다.

CI 에서 건너뛰는 블록은 둘째, 셋째(numpy)와 넷째(numpy, scipy)다. 마지막 코드 줄 뒤의 주석을 옮긴 블록은 둘째와 넷째다. 첫째 블록은 단계가 일곱이고, 찍힌 줄의 묶음도 다섯이다.

- [ ] **Step 1: 시작 상태를 본다**

Run (저장소 루트에서):

````bash
python3 --version
git status --short
node scripts/check-code-blocks.js | tail -1
````

Expected: `Python 3.9.7`(3.9 대면 된다), `git status` 는 아무것도 찍지 않는다, `✓ 새 형식 블록 120개, 옛 형식 블록 127개, 문제 0건`. 블록 수가 다르면 멈추고 알린다. 넷째 묶음이 덜 올라갔거나 다른 일이 끼어든 것이다.

- [ ] **Step 2: 도우미와 서버 파일을 저장소 밖에 둔다**

`$SCRATCH/migrate_batch5.py` 는 아래 내용이다. 넷째 묶음 도우미와 표시 줄 이름(`cb5`)만 다르다. 새 블록 글은 이 계획 문서의 부록에서 읽는다.

<!-- file $SCRATCH/migrate_batch5.py -->
````python
#!/usr/bin/env python3
"""다섯째 묶음(측정과 모델링 글 19편)의 파이썬 블록을 새 형식(하는 일, 단계, 뜻)으로 옮기는 일회용 도우미. 저장소에 넣지 않는다.

새 블록 글은 계획 문서에 있다. 블록마다 표시 줄
  <!-- cb5 post=<글 파일 이름> block=<0부터 센 파이썬 블록 번호> sha=<원본 블록 sha256 앞 16자> -->
바로 아래 네 백틱 python 울타리 안이 새 블록 전체다. 표시 줄 끝에 old=run 이 붙은 블록은
옛 출력이 코드가 찍는 값과 달라서(설계 문서 8-1) 찍힌 줄을 돌려서 받아 적은 블록이다.

바꾸기 전에 셋을 본다. 하나라도 어긋나면 아무것도 바꾸지 않고 멈춘다.
  1. 원본 블록이 계획을 쓸 때와 같다 (sha)
  2. 새 블록의 코드 줄(빈 줄과 # 로 시작하는 줄을 뺀 줄)이 원본과 글자까지 같다
  3. 새 블록의 찍힌 줄(뜻 줄을 뺀 출력 영역)이 원본 블록의 옛 출력과 글자까지 같다.
     old=run 블록은 이 비교를 건너뛴다. 그 블록의 찍힌 줄은 실행 검사가 본다
그다음 파이썬 블록 안의 글만 새 블록으로 바꾼다. 블록 밖의 글은 건드리지 않는다.

  python3 migrate_batch5.py <계획 문서> <posts 폴더> <글 파일 이름>
"""
import hashlib
import re
import sys

PLAN, POSTS, POST = sys.argv[1], sys.argv[2], sys.argv[3]
TICKS = '`' * 4  # 계획 문서의 네 백틱 울타리
MARK = re.compile(r'^<!-- cb5 post=(\S+) block=(\d+) sha=([0-9a-f]{16})( old=run)? -->\n'
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
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch5"; mkdir -p "$SCRATCH"
python3 - migrate_batch5.py nocache_server.py <<'EOF'
import os, re, sys
T = '`' * 4
plan = open('docs/superpowers/plans/2026-10-15-python-code-blocks-batch5.md', encoding='utf-8').read()
for name in sys.argv[1:]:
    m = re.search(r'^<!-- file \$SCRATCH/' + re.escape(name) + r' -->\n' + T + r'[a-z]*\n(.*?)^' + T + r'\n', plan, re.S | re.M)
    dest = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'code-steps-batch5', name)
    if not os.path.exists(dest):
        open(dest, 'w', encoding='utf-8').write(m.group(1))
    print(dest)
EOF
````

Expected: 파일 경로 두 줄. 이미 있는 파일은 그대로 둔다.

- [ ] **Step 3: 옮긴다**

Run: `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch5"; python3 "$SCRATCH/migrate_batch5.py" docs/superpowers/plans/2026-10-15-python-code-blocks-batch5.md posts calibration`
Expected: `calibration: 블록 4개를 옮겼습니다`. `바꾸지 않고 멈춥니다` 로 끝나면 이 태스크를 멈추고 까닭 줄을 그대로 알린다.

- [ ] **Step 4: 코드 줄과 블록 밖 글이 그대로인지, 옮긴 주석이 남았는지 본다**

Run:

````bash
python3 - calibration <<'EOF'
import re, subprocess, sys
PY = re.compile(r'^```python[^\n]*\n(.*?)^```[ \t]*$', re.S | re.M)
code = lambda b: [l for l in b.split('\n') if l.strip() and not l.lstrip().startswith('#')]
# (글, 0부터 센 블록, 새 블록에 있어야 할 말, 새 블록에 없어야 할 옛 주석 줄)
MOVED = [
    ('calibration', 1, '대각선 위에 뜨면 Under 다', '# 대각선 위 = Under-confident, 아래 = Over-confident'),
    ('calibration', 3, '서빙할 때는 calibrated_pCTR = sigmoid(A x model_logit + B) 로 쓴다', '# 서빙 시: calibrated_pCTR = sigmoid(A * model_logit + B)'),
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
calibration: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다
  2번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
  4번째 블록: 옮긴 말 있다, 옛 주석 줄 없다
````

- [ ] **Step 5: 검사를 돌린다**

Run: `node scripts/check-code-blocks.js`
Expected: 두 줄

````text
  기준표보다 줄어든 글 1편 (calibration.md 4→0) — node scripts/check-code-blocks.js --update 로 기준표를 줄입니다
✓ 새 형식 블록 124개, 옛 형식 블록 123개, 문제 0건
````

Run: `python3 scripts/check-python-outputs.py --post calibration`
Expected: `✓ 통과 4, 건너뜀 0 (라이브러리 없음 0, 실행 안 됨 0), 실패 0`

CI 와 같은 표준 라이브러리 파이썬으로도 돌린다(Review Focus 2):

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch5"; python3 -m venv --without-pip "$SCRATCH/venv"
"$SCRATCH/venv/bin/python" scripts/check-python-outputs.py --post calibration | tail -1
````

Expected: `✓ 통과 1, 건너뜀 3 (라이브러리 없음 3, 실행 안 됨 0), 실패 0` — 둘째, 셋째, 넷째 블록이 numpy 가 없어 건너뛴다. 실패로 세면 멈추고 알린다.

Run: `node scripts/check-wording.js`
Expected: 종료 코드 0

- [ ] **Step 6: 기준표를 줄인다**

Run: `node scripts/check-code-blocks.js --update`
Expected: `기준표를 다시 적었습니다 — 옛 형식 블록 123개, 글 47편`

- [ ] **Step 7: 첫 글을 화면으로 본다**

서버를 백그라운드로 띄우고(저장소 루트에서 `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch5"; python3 "$SCRATCH/nocache_server.py" "$(pwd)" 8773`, 파일은 Step 2 가 뽑았다) `http://127.0.0.1:8773/post.html?id=calibration` 을 새 캐시(`new_page` 에 `isolatedContext` 이름)로 연다. 이후 브라우저 도구를 부를 때마다 그 페이지의 `pageId` 를 넘긴다. 아래 함수를 돌린다. 숨긴 iframe 을 네 폭으로 바꿔 가며 잰다. 목록의 앞은 글 id, 뒤는 파일 이름이다.

````js
async () => {
  const POSTS = [['calibration', 'calibration']];
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

Expected: 네 값 모두 `"4 true 0 0 false 0 0 0"` — 블록 4개, 원문과 같다, 출력 없는 블록 0, 바로 뒤에 남은 다른 코드 블록 0, 넘침 없음, 메모 겹침 0, 배치 빠짐 0, 용어 풀이와 수식이 끼어든 곳 0.

그림을 `.playwright-mcp/batch5/` 에 찍는다. 1440 폭(`emulate` 로 1440×1000)과 390 폭(390px iframe 하나만 둔 감싸는 페이지), 라이트와 다크(`document.documentElement.setAttribute('data-theme','dark')`)다. 첫째 블록(단계 일곱, 출력 묶음 다섯), 둘째 블록(옮긴 뜻), 넷째 블록(옮긴 뜻)을 담는다. 블록이 길면 머리와 출력 영역으로 나눠 찍고 이름에 `-top`, `-out` 을 붙인다. 390 폭에서 파란 메뉴 단추(`#sidebar-toggle`)가 코드를 가리면 감싸는 페이지의 iframe 안에서만 숨긴다.

볼 것: 첫째 블록의 3단계부터 7단계까지 뜻이 그 단계가 찍은 줄 옆에서 시작한다. 둘째, 넷째 블록의 출력 영역 앞에 홀로 남은 주석이 없다. 390 폭에서 표 줄이 옆으로 넘치지 않는다. 서버를 끈다.

- [ ] **Step 8: 커밋**

````bash
git add posts/calibration.md scripts/code-blocks-baseline.json
git commit -F - <<'EOF'
feat(posts): 측정과 모델링 글 — Calibration 글의 파이썬 블록 4개를 하는 일, 단계, 뜻 형식으로

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

리뷰에서 블록 글을 고치게 되면 그 글을 직접 고친다(도우미는 원본 블록에만 돈다). 고친 커밋의 제목도 `fix(posts): 측정과 모델링 글 — …` 으로 시작한다. Task 6 이 이 머리로 글 커밋을 찾아 하나로 합친다. Task 2~5 도 같다.

---

### Task 2: 인과추론 다섯 편 블록 7개 옮기기

**Files:**
- Modify: `posts/causal-inference-101.md` (1개), `posts/rct-randomized-experiment.md` (2개), `posts/difference-in-differences.md` (1개), `posts/instrumental-variables.md` (2개), `posts/regression-discontinuity.md` (1개)
- Modify: `scripts/code-blocks-baseline.json`

**Interfaces:**
- Consumes: `$SCRATCH/migrate_batch5.py`(Step 1 이 없으면 계획에서 다시 뽑는다), 이 계획 부록 2~6 의 새 블록 7개
- Produces: 새 형식 블록 131개, 옛 형식 블록 116개(42편)

다섯 편 모두 표준 라이브러리로 돈다. instrumental-variables 둘째 블록은 `old=run` 이다(spec 8-1, Review Focus 3). 머리 줄의 공백만 바뀐다.

- [ ] **Step 1: 도우미가 있는지 본다**

Run (저장소 루트에서):

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch5"; mkdir -p "$SCRATCH"
python3 - migrate_batch5.py <<'EOF'
import os, re, sys
T = '`' * 4
plan = open('docs/superpowers/plans/2026-10-15-python-code-blocks-batch5.md', encoding='utf-8').read()
for name in sys.argv[1:]:
    m = re.search(r'^<!-- file \$SCRATCH/' + re.escape(name) + r' -->\n' + T + r'[a-z]*\n(.*?)^' + T + r'\n', plan, re.S | re.M)
    dest = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'code-steps-batch5', name)
    if not os.path.exists(dest):
        open(dest, 'w', encoding='utf-8').write(m.group(1))
    print(dest)
EOF
````

Expected: 파일 경로 한 줄

- [ ] **Step 2: 다섯 편을 차례로 옮긴다**

Run:

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch5"
for p in causal-inference-101 rct-randomized-experiment difference-in-differences instrumental-variables regression-discontinuity; do
  python3 "$SCRATCH/migrate_batch5.py" docs/superpowers/plans/2026-10-15-python-code-blocks-batch5.md posts "$p" || break
done
````

Expected: 다섯 줄

````text
causal-inference-101: 블록 1개를 옮겼습니다
rct-randomized-experiment: 블록 2개를 옮겼습니다
difference-in-differences: 블록 1개를 옮겼습니다
instrumental-variables: 블록 2개를 옮겼습니다
regression-discontinuity: 블록 1개를 옮겼습니다
````

`바꾸지 않고 멈춥니다` 가 나오면 거기서 멈추고, 까닭 줄과 그때까지 옮긴 글을 그대로 알린다. 그 글을 손으로 고치지 않는다.

- [ ] **Step 3: 코드 줄, 블록 밖 글, 찍힌 줄 수를 본다**

Run:

````bash
python3 - causal-inference-101 rct-randomized-experiment difference-in-differences instrumental-variables regression-discontinuity <<'EOF'
import re, subprocess, sys
PY = re.compile(r'^```python[^\n]*\n(.*?)^```[ \t]*$', re.S | re.M)
OUT = re.compile(r'^# 출력(?=[\s(:]|$)')
MEAN = re.compile(r'^# (?:\d+단계 )?뜻: ')
code = lambda b: [l for l in b.split('\n') if l.strip() and not l.lstrip().startswith('#')]
COUNT = ['instrumental-variables']   # 찍힌 줄을 돌려서 받아 적은 글(old=run)


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
    if post in COUNT:
        print(f'  찍힌 줄 수 — 옛 출력 {[printed(b, False) for b in ob]}, 새 블록 {[printed(b, True) for b in nb]}')
sys.exit(1 if fail else 0)
EOF
````

Expected: 여섯 줄

````text
causal-inference-101: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다
rct-randomized-experiment: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다
difference-in-differences: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다
instrumental-variables: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다
  찍힌 줄 수 — 옛 출력 [6, 4], 새 블록 [6, 4]
regression-discontinuity: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다
````

찍힌 줄 수가 다르면 멈추고 알린다. instrumental-variables 둘째 블록의 찍힌 줄이 맞는지는 Step 4 의 실행 검사가 본다.

- [ ] **Step 4: 실행 검사를 돌린다**

Run:

````bash
python3 --version
for p in causal-inference-101 rct-randomized-experiment difference-in-differences instrumental-variables regression-discontinuity; do
  python3 scripts/check-python-outputs.py --post "$p"; echo "  exit=$?"
done
````

Expected: `Python 3.9.7`, 그다음 차례로 `✓ 통과 1`, `✓ 통과 2`, `✓ 통과 1`, `✓ 통과 2`, `✓ 통과 1` 로 시작하는 다섯 줄(건너뜀 0, 실패 0)과 `exit=0` 다섯 줄. regression-discontinuity 는 부트스트랩 때문에 몇 초 걸린다.

- [ ] **Step 5: 형식 검사, 말투 검사, 기준표**

Run: `node scripts/check-code-blocks.js | tail -1`
Expected: `✓ 새 형식 블록 131개, 옛 형식 블록 116개, 문제 0건`

Run: `node scripts/check-wording.js`
Expected: 종료 코드 0

Run: `node scripts/check-code-blocks.js --update`
Expected: `기준표를 다시 적었습니다 — 옛 형식 블록 116개, 글 42편`

- [ ] **Step 6: 커밋**

````bash
git add posts/causal-inference-101.md posts/rct-randomized-experiment.md posts/difference-in-differences.md \
        posts/instrumental-variables.md posts/regression-discontinuity.md scripts/code-blocks-baseline.json
git commit -F - <<'EOF'
feat(posts): 측정과 모델링 글 — 인과추론 입문, 랜덤 실험, 이중차분, 도구변수, 회귀불연속 글의 파이썬 블록 7개를 하는 일, 단계, 뜻 형식으로

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

---

### Task 3: 실험과 측정 다섯 편 블록 11개 옮기기

**Files:**
- Modify: `posts/uplift-incrementality.md` (2개), `posts/stats-confidence-interval-ttest.md` (2개), `posts/model-ab-testing.md` (3개), `posts/attribution-basics.md` (2개), `posts/privacy-signal-loss.md` (2개)
- Modify: `scripts/code-blocks-baseline.json`

**Interfaces:**
- Consumes: `$SCRATCH/migrate_batch5.py`(Step 1 이 없으면 계획에서 다시 뽑는다), 이 계획 부록 7~11 의 새 블록 11개
- Produces: 새 형식 블록 142개, 옛 형식 블록 105개(37편)

다섯 편 모두 표준 라이브러리로 돈다. privacy-signal-loss 둘째 블록은 30초 넘게 돈다(Review Focus 1). stats-confidence-interval-ttest 의 원래 주석은 합쇼체였고, 새 블록의 풀이와 뜻은 평서체다.

- [ ] **Step 1: 도우미가 있는지 본다**

Run (저장소 루트에서):

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch5"; mkdir -p "$SCRATCH"
python3 - migrate_batch5.py <<'EOF'
import os, re, sys
T = '`' * 4
plan = open('docs/superpowers/plans/2026-10-15-python-code-blocks-batch5.md', encoding='utf-8').read()
for name in sys.argv[1:]:
    m = re.search(r'^<!-- file \$SCRATCH/' + re.escape(name) + r' -->\n' + T + r'[a-z]*\n(.*?)^' + T + r'\n', plan, re.S | re.M)
    dest = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'code-steps-batch5', name)
    if not os.path.exists(dest):
        open(dest, 'w', encoding='utf-8').write(m.group(1))
    print(dest)
EOF
````

Expected: 파일 경로 한 줄

- [ ] **Step 2: 다섯 편을 차례로 옮긴다**

Run:

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch5"
for p in uplift-incrementality stats-confidence-interval-ttest model-ab-testing attribution-basics privacy-signal-loss; do
  python3 "$SCRATCH/migrate_batch5.py" docs/superpowers/plans/2026-10-15-python-code-blocks-batch5.md posts "$p" || break
done
````

Expected: 다섯 줄

````text
uplift-incrementality: 블록 2개를 옮겼습니다
stats-confidence-interval-ttest: 블록 2개를 옮겼습니다
model-ab-testing: 블록 3개를 옮겼습니다
attribution-basics: 블록 2개를 옮겼습니다
privacy-signal-loss: 블록 2개를 옮겼습니다
````

`바꾸지 않고 멈춥니다` 가 나오면 거기서 멈추고, 까닭 줄과 그때까지 옮긴 글을 그대로 알린다. 그 글을 손으로 고치지 않는다.

- [ ] **Step 3: 코드 줄과 블록 밖 글이 그대로인지 본다**

Run:

````bash
python3 - uplift-incrementality stats-confidence-interval-ttest model-ab-testing attribution-basics privacy-signal-loss <<'EOF'
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

- [ ] **Step 4: 실행 검사를 돌리고 걸린 시간을 적는다**

Run:

````bash
python3 --version
for p in uplift-incrementality stats-confidence-interval-ttest model-ab-testing attribution-basics privacy-signal-loss; do
  s=$SECONDS; python3 scripts/check-python-outputs.py --post "$p"; e=$?; echo "  exit=$e $((SECONDS - s))초"
done
````

Expected: `Python 3.9.7`, 그다음 차례로 `✓ 통과 2`, `✓ 통과 2`, `✓ 통과 3`, `✓ 통과 2`, `✓ 통과 2` 로 시작하는 다섯 줄(건너뜀 0, 실패 0)과 `exit=0` 다섯 줄. privacy-signal-loss 는 계획을 쓸 때 32초 걸렸다. 걸린 시간을 보고서에 그대로 적는다. 90초를 넘으면 실패가 아니어도 알린다(Review Focus 1).

- [ ] **Step 5: 형식 검사, 말투 검사, 기준표**

Run: `node scripts/check-code-blocks.js | tail -1`
Expected: `✓ 새 형식 블록 142개, 옛 형식 블록 105개, 문제 0건`

Run: `node scripts/check-wording.js`
Expected: 종료 코드 0

Run: `node scripts/check-code-blocks.js --update`
Expected: `기준표를 다시 적었습니다 — 옛 형식 블록 105개, 글 37편`

- [ ] **Step 6: 커밋**

````bash
git add posts/uplift-incrementality.md posts/stats-confidence-interval-ttest.md posts/model-ab-testing.md \
        posts/attribution-basics.md posts/privacy-signal-loss.md scripts/code-blocks-baseline.json
git commit -F - <<'EOF'
feat(posts): 측정과 모델링 글 — Uplift, 신뢰구간과 t 검정, 모델 A/B, 어트리뷰션, 프라이버시 신호 손실 글의 파이썬 블록 11개를 하는 일, 단계, 뜻 형식으로

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

---

### Task 4: pCTR, pCVR 모델링 다섯 편 블록 13개 옮기기

**Files:**
- Modify: `posts/pctr-prediction.md` (1개), `posts/pCVR-modeling.md` (2개), `posts/conversion-definition.md` (3개), `posts/cold-start-pctr.md` (3개), `posts/ctr-feature-engineering.md` (4개)
- Modify: `scripts/code-blocks-baseline.json`

**Interfaces:**
- Consumes: `$SCRATCH/migrate_batch5.py`(Step 1 이 없으면 계획에서 다시 뽑는다), 이 계획 부록 12~16 의 새 블록 13개
- Produces: 새 형식 블록 155개, 옛 형식 블록 92개(32편)

다섯 편 모두 표준 라이브러리로 돈다. ctr-feature-engineering 첫 블록은 10초 넘게 돈다(Review Focus 1). pCVR-modeling 의 글 id 는 `pcvr-modeling` 이다. cold-start-pctr 셋째 블록은 적률법 식을 함수 안 메모로 옮겼다.

- [ ] **Step 1: 도우미가 있는지 본다**

Run (저장소 루트에서):

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch5"; mkdir -p "$SCRATCH"
python3 - migrate_batch5.py <<'EOF'
import os, re, sys
T = '`' * 4
plan = open('docs/superpowers/plans/2026-10-15-python-code-blocks-batch5.md', encoding='utf-8').read()
for name in sys.argv[1:]:
    m = re.search(r'^<!-- file \$SCRATCH/' + re.escape(name) + r' -->\n' + T + r'[a-z]*\n(.*?)^' + T + r'\n', plan, re.S | re.M)
    dest = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'code-steps-batch5', name)
    if not os.path.exists(dest):
        open(dest, 'w', encoding='utf-8').write(m.group(1))
    print(dest)
EOF
````

Expected: 파일 경로 한 줄

- [ ] **Step 2: 다섯 편을 차례로 옮긴다**

Run:

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch5"
for p in pctr-prediction pCVR-modeling conversion-definition cold-start-pctr ctr-feature-engineering; do
  python3 "$SCRATCH/migrate_batch5.py" docs/superpowers/plans/2026-10-15-python-code-blocks-batch5.md posts "$p" || break
done
````

Expected: 다섯 줄

````text
pctr-prediction: 블록 1개를 옮겼습니다
pCVR-modeling: 블록 2개를 옮겼습니다
conversion-definition: 블록 3개를 옮겼습니다
cold-start-pctr: 블록 3개를 옮겼습니다
ctr-feature-engineering: 블록 4개를 옮겼습니다
````

`바꾸지 않고 멈춥니다` 가 나오면 거기서 멈추고, 까닭 줄과 그때까지 옮긴 글을 그대로 알린다. 그 글을 손으로 고치지 않는다.

- [ ] **Step 3: 코드 줄과 블록 밖 글이 그대로인지 본다**

Run:

````bash
python3 - pctr-prediction pCVR-modeling conversion-definition cold-start-pctr ctr-feature-engineering <<'EOF'
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

- [ ] **Step 4: 실행 검사를 돌리고 걸린 시간을 적는다**

Run:

````bash
python3 --version
for p in pctr-prediction pCVR-modeling conversion-definition cold-start-pctr ctr-feature-engineering; do
  s=$SECONDS; python3 scripts/check-python-outputs.py --post "$p"; e=$?; echo "  exit=$e $((SECONDS - s))초"
done
````

Expected: `Python 3.9.7`, 그다음 차례로 `✓ 통과 1`, `✓ 통과 2`, `✓ 통과 3`, `✓ 통과 3`, `✓ 통과 4` 로 시작하는 다섯 줄(건너뜀 0, 실패 0)과 `exit=0` 다섯 줄. ctr-feature-engineering 은 계획을 쓸 때 13초 걸렸다. 걸린 시간을 보고서에 그대로 적는다.

- [ ] **Step 5: 형식 검사, 말투 검사, 기준표**

Run: `node scripts/check-code-blocks.js | tail -1`
Expected: `✓ 새 형식 블록 155개, 옛 형식 블록 92개, 문제 0건`

Run: `node scripts/check-wording.js`
Expected: 종료 코드 0

Run: `node scripts/check-code-blocks.js --update`
Expected: `기준표를 다시 적었습니다 — 옛 형식 블록 92개, 글 32편`

- [ ] **Step 6: 커밋**

````bash
git add posts/pctr-prediction.md posts/pCVR-modeling.md posts/conversion-definition.md \
        posts/cold-start-pctr.md posts/ctr-feature-engineering.md scripts/code-blocks-baseline.json
git commit -F - <<'EOF'
feat(posts): 측정과 모델링 글 — pCTR, pCVR, 전환 정의, Cold Start, CTR 피처 엔지니어링 글의 파이썬 블록 13개를 하는 일, 단계, 뜻 형식으로

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

---

### Task 5: 평가와 모니터링 세 편 블록 7개 옮기기와 여쭤볼 것

**Files:**
- Modify: `posts/offline-metrics-gauc.md` (2개), `posts/position-bias-ultr.md` (1개), `posts/model-monitoring.md` (4개)
- Modify: `scripts/code-blocks-baseline.json`
- Modify (Step 7, 사용자가 고치기로 한 곳만): `posts/rct-randomized-experiment.md`, `posts/regression-discontinuity.md`, `posts/model-ab-testing.md` 한 줄씩

**Interfaces:**
- Consumes: `$SCRATCH/migrate_batch5.py`(Step 1 이 없으면 계획에서 다시 뽑는다), 이 계획 부록 17~19 의 새 블록 7개, 위 「여쭤볼 것 후보」
- Produces: 새 형식 블록 162개, 옛 형식 블록 85개(29편)

세 편 모두 표준 라이브러리로 돈다. position-bias-ultr 는 본문이 「코드는 딱 세 단계」라 부르는 블록이라 단계가 셋이어야 한다(Review Focus 4).

- [ ] **Step 1: 도우미가 있는지 본다**

Run (저장소 루트에서):

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch5"; mkdir -p "$SCRATCH"
python3 - migrate_batch5.py <<'EOF'
import os, re, sys
T = '`' * 4
plan = open('docs/superpowers/plans/2026-10-15-python-code-blocks-batch5.md', encoding='utf-8').read()
for name in sys.argv[1:]:
    m = re.search(r'^<!-- file \$SCRATCH/' + re.escape(name) + r' -->\n' + T + r'[a-z]*\n(.*?)^' + T + r'\n', plan, re.S | re.M)
    dest = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'code-steps-batch5', name)
    if not os.path.exists(dest):
        open(dest, 'w', encoding='utf-8').write(m.group(1))
    print(dest)
EOF
````

Expected: 파일 경로 한 줄

- [ ] **Step 2: 세 편을 차례로 옮긴다**

Run:

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch5"
for p in offline-metrics-gauc position-bias-ultr model-monitoring; do
  python3 "$SCRATCH/migrate_batch5.py" docs/superpowers/plans/2026-10-15-python-code-blocks-batch5.md posts "$p" || break
done
````

Expected: 세 줄

````text
offline-metrics-gauc: 블록 2개를 옮겼습니다
position-bias-ultr: 블록 1개를 옮겼습니다
model-monitoring: 블록 4개를 옮겼습니다
````

`바꾸지 않고 멈춥니다` 가 나오면 거기서 멈추고, 까닭 줄과 그때까지 옮긴 글을 그대로 알린다. 그 글을 손으로 고치지 않는다.

- [ ] **Step 3: 코드 줄, 블록 밖 글, 단계 수를 본다**

Run:

````bash
python3 - offline-metrics-gauc position-bias-ultr model-monitoring <<'EOF'
import re, subprocess, sys
PY = re.compile(r'^```python[^\n]*\n(.*?)^```[ \t]*$', re.S | re.M)
STEP = re.compile(r'^# \d+단계: ', re.M)
code = lambda b: [l for l in b.split('\n') if l.strip() and not l.lstrip().startswith('#')]
STEPS = {'position-bias-ultr': [3]}   # 본문이 블록의 단계를 말하는 글
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
    if post in STEPS:
        got = [len(STEP.findall(b)) for b in nb]
        print(f'  단계 수 {got}')
        fail = fail or got != STEPS[post]
sys.exit(1 if fail else 0)
EOF
````

Expected: 네 줄

````text
offline-metrics-gauc: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다
position-bias-ultr: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다
  단계 수 [3]
model-monitoring: 코드 줄이 바뀐 블록 [], 블록 밖 글 같다
````

- [ ] **Step 4: 실행 검사를 돌린다**

Run:

````bash
python3 --version
for p in offline-metrics-gauc position-bias-ultr model-monitoring; do
  python3 scripts/check-python-outputs.py --post "$p"; echo "  exit=$?"
done
````

Expected: `Python 3.9.7`, 그다음 차례로 `✓ 통과 2`, `✓ 통과 1`, `✓ 통과 4` 로 시작하는 세 줄(건너뜀 0, 실패 0)과 `exit=0` 세 줄.

- [ ] **Step 5: 형식 검사, 말투 검사, 기준표**

Run: `node scripts/check-code-blocks.js | tail -1`
Expected: `✓ 새 형식 블록 162개, 옛 형식 블록 85개, 문제 0건`

Run: `node scripts/check-wording.js`
Expected: 종료 코드 0

Run: `node scripts/check-code-blocks.js --update`
Expected: `기준표를 다시 적었습니다 — 옛 형식 블록 85개, 글 29편`

- [ ] **Step 6: 커밋**

````bash
git add posts/offline-metrics-gauc.md posts/position-bias-ultr.md posts/model-monitoring.md scripts/code-blocks-baseline.json
git commit -F - <<'EOF'
feat(posts): 측정과 모델링 글 — GAUC, Position Bias, 모델 모니터링 글의 파이썬 블록 7개를 하는 일, 단계, 뜻 형식으로

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
    ('posts/rct-randomized-experiment.md',
     '유의 비율이 80.5%에서 50.8%로 반토막 났다.',
     '유의 비율이 80.5%에서 50.8%로 30%p 가까이 떨어졌다.'),
    ('posts/regression-discontinuity.md',
     '대신 sd는 단순평균차보다 항상 조금 더 크다.',
     '대신 sd는 h=±2.00까지 단순평균차보다 크고, h=±3.00에서야 둘 다 0.006으로 같아진다.'),
    ('posts/model-ab-testing.md',
     'B가 노출마다 12% 더 비싸게 사니 같은 돈으로 살 수 있는 양이 적습니다.',
     'B가 입찰가를 12% 높게 불러 노출 1건을 7% 남짓 더 비싸게 사니 같은 돈으로 살 수 있는 양이 적습니다.'),
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

Expected: `3곳을 고쳤습니다 (3편)` (셋 다 고치기로 했을 때)

- [ ] **Step 8: 고친 것만 바뀌었는지 보고 커밋한다**

Run:

````bash
git diff --stat | tail -1
node scripts/check-wording.js; echo "wording exit=$?"
node scripts/check-code-blocks.js | tail -1
for p in rct-randomized-experiment regression-discontinuity model-ab-testing; do
  python3 scripts/check-python-outputs.py --post "$p"; echo "  exit=$?"
done
````

Expected: ` 3 files changed, 3 insertions(+), 3 deletions(-)`, `wording exit=0`, `✓ 새 형식 블록 162개, 옛 형식 블록 85개, 문제 0건`, 그다음 차례로 `✓ 통과 2`, `✓ 통과 1`, `✓ 통과 3` 으로 시작하는 세 줄(실패 0)과 `exit=0` 세 줄. 기준표는 바뀌지 않는다. `git diff` 로 바뀐 줄을 눈으로도 본다 — 바뀐 것은 「여쭤볼 것 후보」의 「고칠 글」뿐이어야 한다. 고친 글만 stage 한다.

````bash
git add posts/rct-randomized-experiment.md posts/regression-discontinuity.md posts/model-ab-testing.md
git commit -F - <<'EOF'
fix(posts): 측정과 모델링 글 — 사용자가 고치기로 한 본문 사실 오류를 코드가 찍는 값과 맞게 고친다

rct-randomized-experiment 의 「반토막」을 「30%p 가까이 떨어졌다」로,
regression-discontinuity 의 「sd는 항상 조금 더 크다」를 h=±3.00 에서 같아진다는 문장으로,
model-ab-testing 의 「노출마다 12% 더 비싸게」를 「입찰가 12%, 노출 1건 7% 남짓」으로.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
````

---

### Task 6: 다섯째 묶음 확인과 올리기

**Files:** 없음 (확인, 커밋 합치기, push)

**Interfaces:**
- Consumes: Task 1~5 의 커밋
- Produces: 사용자 확인, 그 뒤 main 에 올린 다섯째 묶음. 올리는 커밋은 계획 문서 1개와 글 옮기기 1개다(합치기 전에는 글 커밋 5개, Task 5 Step 7 을 했으면 6개, 그리고 리뷰 고침).

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

Expected: 마지막 줄 `ALL-OK`. 그 위 줄들 가운데 `✓ 새 형식 블록 162개, 옛 형식 블록 85개, 문제 0건`, `94 통과, 0 실패`, `22 통과, 0 실패`, `21 통과, 0 실패`, `✓ 통과 161, 건너뜀 1 (라이브러리 없음 0, 실행 안 됨 1), 실패 0` 이 있다.

CI 와 같은 표준 라이브러리 파이썬으로도 돌린다:

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch5"; python3 -m venv --without-pip "$SCRATCH/venv"
"$SCRATCH/venv/bin/python" scripts/test-python-outputs.py | tail -1
"$SCRATCH/venv/bin/python" scripts/check-python-outputs.py | tail -1
````

Expected: `21 통과, 0 실패` 와 `✓ 통과 151, 건너뜀 11 (라이브러리 없음 10, 실행 안 됨 1), 실패 0` (넷째 묶음의 여덟에 이 묶음의 numpy, scipy 블록 3개가 더해졌다)

- [ ] **Step 2: 숫자로 재고 그림을 찍는다**

서버 파일이 있는지 보고, 없으면 계획에서 뽑는다(저장소 루트에서).

````bash
SCRATCH="${TMPDIR:-/tmp}/code-steps-batch5"; mkdir -p "$SCRATCH"
python3 - nocache_server.py <<'EOF'
import os, re, sys
T = '`' * 4
plan = open('docs/superpowers/plans/2026-10-15-python-code-blocks-batch5.md', encoding='utf-8').read()
for name in sys.argv[1:]:
    m = re.search(r'^<!-- file \$SCRATCH/' + re.escape(name) + r' -->\n' + T + r'[a-z]*\n(.*?)^' + T + r'\n', plan, re.S | re.M)
    dest = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'code-steps-batch5', name)
    if not os.path.exists(dest):
        open(dest, 'w', encoding='utf-8').write(m.group(1))
    print(dest)
EOF
````

서버를 백그라운드로 띄운다: `SCRATCH="${TMPDIR:-/tmp}/code-steps-batch5"; python3 "$SCRATCH/nocache_server.py" "$(pwd)" 8773`. 아무 글이나 새 캐시로 연 뒤 아래 함수를 돌린다. 목록의 앞은 글 id, 뒤는 파일 이름이다.

````js
async () => {
  const POSTS = [
    ['calibration', 'calibration'],
    ['causal-inference-101', 'causal-inference-101'],
    ['rct-randomized-experiment', 'rct-randomized-experiment'],
    ['difference-in-differences', 'difference-in-differences'],
    ['instrumental-variables', 'instrumental-variables'],
    ['regression-discontinuity', 'regression-discontinuity'],
    ['uplift-incrementality', 'uplift-incrementality'],
    ['stats-confidence-interval-ttest', 'stats-confidence-interval-ttest'],
    ['model-ab-testing', 'model-ab-testing'],
    ['attribution-basics', 'attribution-basics'],
    ['privacy-signal-loss', 'privacy-signal-loss'],
    ['pctr-prediction', 'pctr-prediction'],
    ['pcvr-modeling', 'pCVR-modeling'],
    ['conversion-definition', 'conversion-definition'],
    ['cold-start-pctr', 'cold-start-pctr'],
    ['ctr-feature-engineering', 'ctr-feature-engineering'],
    ['offline-metrics-gauc', 'offline-metrics-gauc'],
    ['position-bias-ultr', 'position-bias-ultr'],
    ['model-monitoring', 'model-monitoring'],
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

Expected: 네 폭 모두 글마다 `"<블록 수> true 0 0 false 0 0 0"` 이다(값 76개). 블록 수는 목록 차례로 4, 1, 2, 1, 2, 1, 2, 2, 3, 2, 2, 1, 2, 3, 3, 4, 2, 1, 4 이다. 42개 모두 찍는 것이 있어 출력 없는 블록은 0 이다.

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

Expected: `{"posts":108,"numbers":3581,"overflow":[],"broken":[]}` (계획을 쓸 때 잰 값. 넷째 묶음의 마지막 리뷰가 블록을 고쳤거나 이 묶음의 리뷰가 블록 글을 고쳤다면 `numbers` 만 조금 다를 수 있다. 보고서에 그대로 적는다)

그림을 `.playwright-mcp/batch5/` 에 찍는다. 19편을 1440 폭 라이트로 한 장씩(19장), 아래 표에서 390 이라 적은 6편은 390 폭 라이트로도(6장), calibration 과 model-monitoring 은 1440 폭 다크로도(2장) 찍는다. 블록이 길면 머리와 출력 영역으로 나눠 찍고 이름에 `-top`, `-out` 을 붙인다. 담을 블록은 아래와 같다.

| 글 | 블록 | 390 |
|---|---|---|
| calibration | 첫째 (단계 일곱, 출력 묶음 다섯) | 390 |
| causal-inference-101 | 첫째 (같은 번호의 뜻 둘) | |
| rct-randomized-experiment | 둘째 (5,000번 반복, 뜻 둘) | |
| difference-in-differences | 첫째 (시나리오 둘, 뜻 셋) | |
| instrumental-variables | 둘째 (돌려 받아 적은 머리 줄) | 390 |
| regression-discontinuity | 첫째 (밴드폭 일곱 줄) | 390 |
| uplift-incrementality | 둘째 (누적점 줄) | 390 |
| stats-confidence-interval-ttest | 둘째 (단계 여섯) | |
| model-ab-testing | 첫째 (예산 두 상태, 코드가 찍는 해설) | |
| attribution-basics | 첫째 (규칙 다섯) | |
| privacy-signal-loss | 둘째 (계수의 흔들림, 뜻 셋) | |
| pctr-prediction | 첫째 (단계 넷) | |
| pCVR-modeling | 둘째 (경과일 여덟 줄, 뜻 둘) | |
| conversion-definition | 둘째 (단계 일곱) | |
| cold-start-pctr | 셋째 (함수 안 메모로 옮긴 식) | |
| ctr-feature-engineering | 둘째 (ids 배열) | 390 |
| offline-metrics-gauc | 첫째 (요청 안 순위 점수) | |
| position-bias-ultr | 첫째 (세 단계, 3단계 뜻 셋) | 390 |
| model-monitoring | 넷째 (알람 규칙 두 표) | |

서버를 끈다.

- [ ] **Step 3: 확인 페이지를 만든다** (컨트롤러)

넷째 묶음처럼 비공개 artifact 한 장에 담는다. 바뀌는 것(글 19편, 블록 42개, 코드와 검사는 그대로), 그림, 검사 결과(로컬과 표준 라이브러리 파이썬 둘 다), 올리면 하는 일(커밋 수, 합치는 글 커밋, rebase, `ubuntu-24.04` 에서 도는 글 검사, 오래 도는 블록 둘), 「이 계획에서 정한 것」 가운데 독자가 보는 것(마지막 코드 줄 뒤 주석을 뜻 줄로 옮긴 블록 둘, 찍힌 줄을 돌려 받아 적은 블록 1개, 단계를 새로 둔 블록, 코드가 찍는 해설에 붙인 한 줄 뜻), 「고친 본문」 절(Task 5 Step 7 로 고친 곳의 전후)과 「여쭤볼 것」 절(고치지 않기로 한 후보와 블록을 옮기며 새로 찾은 것)을 쓴다.

- [ ] **Step 4: 사용자 확인을 받는다** (컨트롤러)

그림과 함께 바뀐 것을 짧게 알린다. 고친 곳이 있으면 전후를 보인다. 「여쭤볼 것」이 있으면 고칠지 함께 묻고, 고치기로 하면 글 커밋(`fix(posts): 측정과 모델링 글 — …`)으로 고친 뒤 Step 1 부터 다시 한다. 사용자가 올려도 된다고 하기 전에는 push 하지 않는다.

- [ ] **Step 5: 글 커밋을 하나로 합친다** (사용자 확인 뒤)

Run:

````bash
FIRST=$(git log --reverse --format=%H --fixed-strings --grep='(posts): 측정과 모델링 글 —' origin/main..HEAD | head -1)
BASE=$(git rev-parse "$FIRST^")
git log --format='%h %s' "$BASE..HEAD"
git diff --stat "$BASE" HEAD
````

Expected: `git log` 의 줄이 모두 `feat(posts): 측정과 모델링 글 —` 이나 `fix(posts): 측정과 모델링 글 —` 로 시작한다. `git diff --stat` 의 파일이 Task 1~5 의 글 19편과 `scripts/code-blocks-baseline.json` 뿐이다. 다른 커밋이 끼어 있으면 합치지 않고 그대로 올린다고 사용자에게 알린다.

위 결과가 맞을 때만 합친다. 셸 변수는 명령마다 사라지므로 `FIRST` 와 `BASE` 를 이 명령 안에서 다시 구한다. 하나라도 실패하면 거기서 멈춘다. Task 5 Step 7 로 본문을 고쳤으면 아래 커밋 글의 「실행되는 코드 줄과 블록 밖 본문은 그대로다.」를 「실행되는 코드 줄은 그대로이고, 블록 밖 본문은 사용자가 고치기로 한 N곳만 고쳤다(글 이름).」로 바꿔 넣는다.

Run:

````bash
FIRST=$(git log --reverse --format=%H --fixed-strings --grep='(posts): 측정과 모델링 글 —' origin/main..HEAD | head -1)
test -n "$FIRST" || { echo '글 커밋을 못 찾았다'; exit 1; }
BASE=$(git rev-parse "$FIRST^") || exit 1
TREE=$(git rev-parse 'HEAD^{tree}')
git reset --soft "$BASE" || exit 1
git commit -F - <<'EOF' || exit 1
feat(posts): 측정과 모델링 글 19편의 파이썬 블록 42개를 하는 일, 단계, 뜻 형식으로

인과추론 5편 7개, 실험과 측정 5편 11개, 보정과 pCTR, pCVR 모델링 6편 17개, 평가와 모니터링 3편 7개.
실행되는 코드 줄과 블록 밖 본문은 그대로다. instrumental-variables 둘째 블록은 설계 문서 8-1 대로 찍힌 줄을 돌려 받아 적었다.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
test "$(git rev-parse 'HEAD^{tree}')" = "$TREE" && echo '트리 같음'
git log --format='%h %s' origin/main..HEAD
````

Expected: `트리 같음` 과 두 줄 — 맨 위가 방금 합친 `feat(posts): 측정과 모델링 글 19편의 …` 이고, 그 아래가 계획 문서 커밋이다(계획을 고친 커밋이 있으면 그만큼 더).

- [ ] **Step 6: 올린다** (컨트롤러)

Run: `git fetch origin && git rebase origin/main && git status -sb | head -1 && git log --format='%h %ae %s' origin/main..HEAD`
Expected: 내 커밋만 있고 작성자가 모두 `37789148+chkimsu@users.noreply.github.com` 이다. 다른 세션의 커밋이 있으면 멈추고 알린다. rebase 로 들어온 커밋이 있으면 Step 1 의 검사를 다시 돌린다.

자동 권한 검사가 `git push` 를 막으므로, 사용자에게 프롬프트에 `! git push origin main` 을 입력해 달라고 부탁한다.

- [ ] **Step 7: 글 검사를 본다** (컨트롤러)

Run: `gh run list --workflow validate.yml --limit 1 --json databaseId,headSha,status` 로 push 한 커밋의 run id 를 찾고 `gh run watch <id> --exit-status`
Expected: 종료 코드 0. `actions/setup-python@v5` 의 3.9 설치 단계와 `코드 블록 형식 검사 시험` 단계를 포함해 모든 단계에 ✓ 가 붙는다. run 의 로그는 읽지 않는다(관리자 권한이 필요하고 로컬 gh 는 github.com 에 로그인돼 있지 않다). `gh api repos/chkimsu/adtech-blog/actions/runs/<id>/jobs --jq '.jobs[].labels'` 가 `["ubuntu-24.04"]` 다. `gh api repos/chkimsu/adtech-blog/actions/runs/<id>/jobs --jq '.jobs[].steps[] | [.name, .started_at, .completed_at] | @tsv'` 로 실행 검사 단계에 걸린 시간을 적는다(Review Focus 1). 실행 검사 단계가 실패하면 시간 초과일 수 있다. 코드를 바꾸지 말고 멈춰 알린다.

같은 커밋의 `Update sitemap.xml + feed.xml` 과 `pages-build-deployment` 도 `gh run watch <id> --exit-status` 로 끝까지 본다. 봇의 사이트맵 커밋이 새 배포를 띄우면 앞 배포는 취소될 수 있다. 그때는 새 배포의 결과를 본다.

- [ ] **Step 8: 공개 블로그에서 본다** (컨트롤러)

페이지 배포가 끝나면 새 캐시로 `https://chkimsu.github.io/adtech-blog/post.html?id=calibration` 을 연다. Step 2 의 목록 19편을 숨긴 iframe 으로 차례로 열어 `.post-content .cb` 수(4, 1, 2, 1, 2, 1, 2, 2, 3, 2, 2, 1, 2, 3, 3, 4, 2, 1, 4)와 콘솔 오류 0 을 확인한다. 글 id 는 파일 이름이 아니라 목록 앞쪽 값(`pcvr-modeling`)을 쓴다. 접힌 절 안의 블록 글은 `innerText` 에 안 잡히니 `textContent` 로 본다. Task 5 Step 7 로 고친 문장이 있으면 그 글에서 고친 문장이 보이는지도 본다.
