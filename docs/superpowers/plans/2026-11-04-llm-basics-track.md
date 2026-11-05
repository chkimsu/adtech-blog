# LLM 기초 트랙 9편 (묶음 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 설계 문서의 묶음 2, LLM 기초 트랙 9편(글, 카드 데크 9장, 놀이터 1장, 기록 6벌, 새 카테고리 `LLM & Agents` 와 트랙 통합)을 블로그에 올릴 수 있는 상태로 만든다.

**Architecture:** 글은 `posts/<slug>.md` + `js/posts.js` 엔트리 하나. 절마다 카드 한 장을 `demo-<이름>-cards.html?embed=1&card=<키>` iframe 으로 넣고, 데크는 `js/card-kit.js` 부품으로 `js/<이름>-cards-demo.js` 가 그린다. 파이썬은 표준 라이브러리만 쓰고 검사기가 실제로 돌린다. 진짜 LLM 답이 필요한 여섯 글은 `scripts/llm-record.py` 가 Ollama 로 한 번 기록한 `data/llm-records/<slug>.json` 을 `--export-constant [--with-usage]` 줄로 옮겨 쓰고, `scripts/check-llm-constants.py` 가 일치를 본다. 구조를 보이는 글(구조화 출력, 에이전트 루프, RAG 조립)은 규칙으로 답하는 가짜 LLM 을 블록 안에 둔다. 세 글(모델 고르기, 프롬프트, 비결정성)이 같은 문제 20개를 쓰도록 생성기 `scripts/gen-llm-problems.py` 를 Task 0 이 만든다.

**Tech Stack:** 마크다운(marked.js 렌더), vanilla JS 카드 데크(`card-kit.js`), Chart.js 놀이터, Python 3.9 표준 라이브러리, Ollama `qwen3.5:27b`(`http://localhost:11434/api/chat`), 검사 스크립트(`scripts/`, 기록 상수 검사 포함).

**Spec:** `docs/superpowers/specs/2026-11-03-llm-tracks-design.md` (묶음 2 는 3-2절, 표준 데이터는 4절, 기록 형식과 가짜 LLM 은 5절, 카드와 놀이터는 6절, 통합 자리는 7절)

## Global Constraints

- 글은 합쇼체(`~입니다`, `~합니다`). 코드 블록 안 주석은 평서체(`~한다`). 1인칭은 「저」(「내」, 「저희」 금지).
- 가운뎃점 없음(쉼표). 비유 없음. 낱말 `실측`, `실체`, `축`(그래프 축 제외), `가른다`, `갈린다` 없음. 이모지와 장식 글자 없음. 해요체 없음. 작은 수가 아니면 아라비아 숫자. 지훈 씨의 주 수는 「19주째」처럼 숫자로.
- 제목은 「주제어: 무엇을 알게 되나」, 콜론 하나, 55자 이하. 설계 3-2절의 제목을 글자 그대로 쓴다.
- 구조: 도입 장면(400~500자, 문단 4개, 표 0개, 개념어 없이) → `> 한 줄 요약:` → 「골라 읽는 법」 글머리표 → 본문 절 → 끝에서 두 번째 절은 「두 무대」(### 소제목에 `[무대: 닫힌 생태계]`, `[무대: 열린 RTB]`, 이 트랙은 갈래마다 한 문단씩 짧게) → `## 한눈 정리`(표 하나) → `## 헷갈리기 쉬운 점`(셋) → `## 더 깊이 보기`(`:::deep` 3개 이하) → `## 참고문헌`(공개 출처만).
- 절마다 굵은 요약 한 줄 + 문단 4~6개(굵은 요약, 표, 코드, 임베드, 제목은 세지 않는다) + 표 1개 또는 파이썬 1개. 표 총 5~7개. 문장 80자 상한(글머리표, 참고문헌, posts.js 의 excerpt·worldNote·worldPractical, 데크 캡션, 데크 메타 설명까지. 공개 출처 원제가 그 자체로 80자를 넘는 줄만 예외), 목표 평균 44~56자. 산문 15KB 이상. 표준 용어는 첫 쓰임에 짧은 풀이를 붙이고 다시 풀지 않는다.
- 파이썬은 표준 라이브러리만, 3.9 문법, 모든 난수는 `random.Random(7)` 또는 `random.seed(7)`. 블록은 `# 하는 일:` 한 줄, `# N단계:` 제목과 풀이, `# 출력:` 아래 `# N단계 뜻:` 과 찍힌 줄(`python3 scripts/check-python-outputs.py --post <slug> --show` 가 뽑은 것을 그대로 붙인다). 꼬리표는 `python` 하나. 상용 API 나 네트워크를 부르는 코드는 `# (발췌 — 그대로 실행되지 않습니다.)` 상태 표시로 한 글에 한 번만.
- 기록을 쓰는 블록은 `# 하는 일:` 바로 다음 줄에 `# 기록 data/llm-records/<slug>.json 에서 옮김` 주석을 두고, `python3 scripts/llm-record.py --export-constant [--with-usage] --slug <slug>` 가 찍은 `RECORD = ` 줄(과 `USAGE = ` 줄)을 글자 그대로 붙인다. 손으로 고치거나 더하지 않는다. `python3 scripts/check-llm-constants.py` 가 통과해야 한다.
- 기록 출력은 JSON 이고 문자열 값은 영어와 숫자만이다(한국어 0자). 시스템 메시지가 그렇게 요구한다. 한국어 문장은 산문의 「」 안에만. 기록 항목의 `user` 와 `system` 은 한국어여도 된다.
- LLM 행동에 관한 숫자(정답률, 바뀐 비율, 토큰, 시간, 일치도)는 기록 파일에서 블록이 센 값이나 USAGE 에 있는 값만 쓴다. 기록 밖에서 센 수는 적지 않는다. 숫자 없는 과정 설명은 된다.
- 프롬프트 손질과 재기록은 temperature 0 의 기준 답이 스키마대로 파싱되지 않을 때만 한다. 기록이 기대와 다르면(정확도가 안 오르거나 떨어짐) 기록을 그대로 두고 글이 그 사실을 가르친다. 파싱 안 되는 답은 「읽지 못한 답」으로 세고 틀린 답으로 친다.
- 같은 기록 안에서는 temperature 0 의 10번이 글자까지 같았다. 같은 설정으로 다시 기록하면 답은 같아도 글자가 달라진 예가 하나 있다(27주째 글의 p17, 21주째 steps 기록과 비교. 둘 다 2026-11-05 기록). temperature 0.7 은 seed 를 고정해도 다시 기록할 때 답이 달라질 수 있다(자연어 오디언스 편에서 확인). 흔들림은 두 설정을 나란히 두어 잰다.
- 가상 값은 글에서 한 번 「가상 데이터」라고 밝힌다. 설계 4절의 값(후보풀 캠페인 셋, 에이전트 과제 값, 상품 100건, 질의와 광고 쌍 50개, LLM 요청 한 건 1,200 + 150 토큰, 가상 단가, 하루 100만 요청 비용 72만 / 780만 / 420만 원)을 그대로 쓴다. 실제 상용 단가는 적지 않고 문서 링크로만.
- 회사 안 시스템 이름, 숫자, 문장, 사람 이름은 어디에도 넣지 않는다. 올리기 전에 `grep -rnE "$(grep -v '^#' $NAMES_FILE | tr '\n' '|' | sed 's/|$//')" posts/ docs/ js/ data/ *.html` 이 0건이어야 한다(대소문자 구분). `NAMES_FILE` 은 저장소 밖에 둔 사내 이름 목록 파일이다.
- 커밋은 `chkimsu` 계정(GitHub no-reply 메일)으로, 파일을 하나씩 명시한다. `git add -A` 금지. 커밋 메시지는 한국어 conventional commit. 구현자 커밋 꼬리는 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`(Sonnet 구현자는 `Claude Sonnet 5.5`).
- 새 파일은 `node scripts/check-wording.js` 에서 0건. 기준표(`scripts/wording-baseline.json`)를 늘리지 않는다.
- 날짜는 글 N 이 `2026-11-(09+N)`(글 1 은 11-10, 글 9 는 11-18), 주 수는 글 N 이 `(18+N)주째`. `world: 'both'`, `series: 'llm-basics-track'`, 카테고리 `LLM & Agents`.

## 모델 나누기 (컨트롤러가 디스패치마다 적용)

| 역할 | 모델 |
|---|---|
| Task 0 과 Task 10 의 기계적인 부분(분류, 시리즈, CSS 규칙 복제, 색인, 표지 수) | Sonnet |
| 글 산문과 파이썬, 기록 설계, 데크(Task 1~9), 놀이터 | Opus |
| 글 검토 | Opus |
| 고침 뒤 재검토, 작은 diff 검토 | Sonnet. Important 가 0 이면 재검토를 생략한다 |
| 마지막 브랜치 전체 검토 | Fable |

## Review Focus

- thinking 을 켠 기록 항목은 한 건에 몇 분 걸릴 수 있다. 느리다고 문제 수를 줄이지 않는다. think 켠 항목은 글마다 10개 이하로 미리 정해 두고(Task 2), 한 번 기록해 그대로 둔다.
- 정답률은 기록 답과 생성기의 정답을 블록이 견준 값만 쓴다. 파싱 안 되는 답은 빼지 않고 틀린 답으로 센다(Task 2 Step 6, Task 3 Step 5).
- 기록 출력에 한국어가 한 글자라도 들어가면 말투 검사와 「영어와 숫자만」 규칙에 걸린다. 기록 뒤 `python3 -c` 로 outputs 의 한글을 센다. 0 이 아니면 시스템 메시지를 고쳐 다시 기록한다(Task 1~9 의 기록 단계).
- 가짜 LLM 은 진짜 SDK 응답 꼴(`stop_reason`, 내용 블록 목록, 도구 호출 블록)을 지켜야 뒤 묶음이 같은 꼴을 쓴다. 블록 출력에 그 필드 이름이 찍히는지 본다(Task 4, 6, 7).
- 비용 숫자는 설계 4절의 셋(72만, 780만, 420만 원)과 글의 블록, 놀이터의 기본값이 모두 같아야 한다(Task 2 Step 5, Task 9 Step 5, Task 10 Step 1).
- 카드 iframe 블록 앞뒤 빈 줄이 없거나 안에 `$`, `**` 가 들어가면 렌더가 깨진다. 글마다 1440 폭과 390 폭 화면을 찍어 카드가 다 보이는지 본다(Task 10 Step 6).

---

### Task 0: 공통 기반 — 카테고리 `LLM & Agents`, 태그 여섯, 트랙, 6단계, 문제 20개 생성기

**Files:**
- Modify: `data/taxonomy.json`(categories 에 여덟째, tags 여섯)
- Modify: `css/style.css`(`Interview & Algorithms` 가 나오는 규칙 넷을 `LLM & Agents` 로 복제)
- Modify: `js/posts.js`(`series['llm-basics-track']`, `mlTrack.stages` 에 6단계)
- Modify: `js/topics.js`(`TOPICS` 에 LLM 주제, `TRACK_ORDER`)
- Create: `scripts/gen-llm-problems.py`
- Modify: `.github/workflows/validate.yml`(`gen-llm-problems.py --check` 한 단계)
- Test: `node scripts/validate-posts.js`, `node scripts/check-design.js`, `python3 scripts/gen-llm-problems.py --check`(아직 대조할 글이 없어 「대조 0건」으로 통과)

**Interfaces:**
- Produces: 카테고리 id `LLM & Agents`(label 같음, description 「LLM 호출, 프롬프트, RAG, 에이전트, 판정, 비용」). 태그 `RAG`, `Agent`, `Embedding`, `LLM Evaluation`, `Fine-tuning`, `Prompting`(`LLM` 은 이미 있다). `series['llm-basics-track'] = { title: 'LLM 기초 트랙', desc, posts: [9개 id 순서대로] }`. `mlTrack.stages[5]` = `{ id: 'stage-6', title: '6단계, LLM — 호출 한 번부터 판정과 비용까지', goal, posts: [9개 id] }`. 문제 20개 `PROBLEMS`(아래). Task 2, 3, 9 가 그대로 쓴다.

문제 20개(`scripts/gen-llm-problems.py` 의 리터럴 `PROBLEMS`): 광고 운영 숫자 문제 20개를 손으로 적는다. 각 항목 `{"id": "p01", "question": "…", "answer": 정수, "level": "easy" | "hard"}`. easy 10개(`p01`~`p10`)는 한 단계 계산(예: 노출 120,000건에 클릭 1,440건이면 클릭률은 몇 %인가 → 답이 정수가 되게 값을 고른다), hard 10개(`p11`~`p20`)는 두세 단계(예: 하루 예산 300만 원, 클릭당 250원, 전환율 2% 면 하루 전환은 몇 건인가 → 240). 모든 답은 정수, 모든 값은 가상이고 설계 4절의 캠페인 값(하루 300만 원, 구매 2만 원, pCTR 1.2%, pCVR 3.0%)을 쓸 수 있다. 사람 이름과 회사 이름은 넣지 않는다. 스크립트는 `--json` 으로 목록을 찍고, `--check` 로 대조 목록의 프롬프트 파일(`data/llm-records/prompts/` 의 `llm-model-selection.json`, `prompting-chain-of-thought-plain.json`, `prompting-chain-of-thought-fewshot.json`, `prompting-chain-of-thought-steps.json`, `llm-cost-cache-nondeterminism.json`)이 있으면 그 `items[].user` 끝부분이 `question` 과 같은지, `posts/` 의 세 글(`llm-model-selection`, `prompting-chain-of-thought`, `llm-cost-cache-nondeterminism`)이 있으면 블록 안 `PROBLEMS = [` 리터럴이 스크립트의 리터럴과 글자까지 같은지 본다(없는 파일은 건너뛰고 몇 건 대조했는지 찍는다).

- [ ] **Step 1: 지금 상태** — Run: `node scripts/validate-posts.js && node -e "const m=require('./js/posts.js');console.log(Object.keys(m.series).length, m.mlTrack.stages.length)"` Expected: 통과, `14 5`.
- [ ] **Step 2: 분류** — `data/taxonomy.json` categories 끝에 `{ "id": "LLM & Agents", "label": "LLM & Agents", "description": "LLM 호출, 프롬프트, RAG, 에이전트, 판정, 비용. 이름에 콤마를 넣지 말 것" }`, tags 의 `"LLM"` 뒤에 여섯 태그. `css/style.css` 에서 `data-category="Interview & Algorithms"` 가 든 규칙 넷(카드 카테고리 칩, 카드 왼쪽 테두리, 레일 점, 레일 점 글자)을 바로 아래에 `LLM & Agents` 로 복제하되 색은 `--oxide`, `--oxide-bd`, 레일 글자는 `L`. 다른 파일에 카테고리 이름이 하드코딩된 곳이 있는지 `grep -rn "Interview & Algorithms" js/ *.html` 로 보고, 있으면 같은 꼴로 더한다(`js/topics.js` 의 TOPICS 는 Step 3).
- [ ] **Step 3: 트랙과 단계** — `js/posts.js` `series` 에 `'llm-basics-track'` 을 `'targeting-model-track'` 바로 뒤에. title `LLM 기초 트랙`, desc 「지훈 씨가 19주째부터 LLM 을 처음 만집니다. 호출 한 번, 모델 고르기, 프롬프트, 구조화 출력, 임베딩, RAG, 에이전트 루프, 판정, 비용을 한 주에 하나씩 엽니다」, posts 는 `llm-first-call, llm-model-selection, prompting-chain-of-thought, structured-output, embeddings-vector-search, rag-basics, tool-use-agent-loop, llm-as-a-judge, llm-cost-cache-nondeterminism`. `mlTrack.stages` 끝에 6단계(위 Interfaces, goal 은 「이 단계를 마치면: LLM 을 부르고, 답을 JSON 으로 받아 코드가 검사하고, 문서를 넣어 답하게 하고, 도구를 고르게 하고, 답을 채점하고, 하루 비용을 셀 수 있습니다. 묶음 4 의 학습 네 편이 뒤에 붙습니다.」). `js/topics.js` `TOPICS` 의 `Targeting & Audience` 바로 뒤에 `{ id: 'LLM & Agents', label: 'LLM 과 에이전트', desc: 'LLM 호출부터 프롬프트, 구조화 출력, 임베딩과 RAG, 도구 호출 루프, 판정, 비용까지. 광고 응용과 학습 글이 뒤에 붙습니다.' }`, `TRACK_ORDER` 의 `'targeting-model-track'` 뒤에 `'llm-basics-track'`.
- [ ] **Step 4: 검증이 없는 글 아홉을 잡는지** — Run: `node scripts/validate-posts.js; echo exit=$?` Expected: series 의 글 9개가 없다는 오류로 exit 1, 아홉 id 가 다 나온다.
- [ ] **Step 5: 문제 생성기** — 위 사양대로 `scripts/gen-llm-problems.py`. `python3 scripts/gen-llm-problems.py --json | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d), sum(1 for p in d if p['level']=='hard'), all(isinstance(p['answer'], int) for p in d))"` → `20 10 True`. 답 20개를 손으로 다시 계산해 보고서에 적는다. validate.yml 에 `--check` 단계를 `gen-context-pages.py --check` 옆에 더한다.
- [ ] **Step 6: 디자인 게이트** — Run: `node scripts/check-design.js && node scripts/check-wording.js` Expected: 통과(CSS 변경은 규칙 복제뿐).
- [ ] **Step 7: 커밋** — 파일 다섯 + validate.yml. `feat(tracks): LLM & Agents 카테고리와 태그 여섯, LLM 기초 트랙과 6단계, 문제 20개 생성기`. (validate-posts 가 글 아홉이 없다고 실패하는 상태로 커밋해도 된다.)

---

### Task 1: LLM 호출 한 번 (`llm-first-call`, 19주째, 2026-11-10)

**Files:**
- Create: `posts/llm-first-call.md`, `demo-first-call-cards.html`, `js/first-call-cards-demo.js`
- Create: `data/llm-records/prompts/llm-first-call.json`, `data/llm-records/llm-first-call.json`
- Modify: `js/posts.js`, `js/demo-edu-content.js`
- Test: `node scripts/validate-posts.js`, `node scripts/check-content-standard.js llm-first-call`, `node scripts/check-wording.js`, `node scripts/check-code-blocks.js`, `python3 scripts/check-python-outputs.py --post llm-first-call`(두 번), `python3 scripts/check-llm-constants.py`, `node scripts/test-long-sentences.js`

**Interfaces:**
- Consumes: Task 0 의 series 와 카테고리. `scripts/llm-record.py` 의 프롬프트 파일 형식(`think: "both"` 면 끈 것과 켠 것을 한 번씩).
- Produces: 「요청 JSON 의 칸」과 「응답 JSON 의 칸」 설명. 뒤 글들은 이 글을 링크하고 다시 풀지 않는다.

기록: 요청 하나. 시스템 메시지 「광고 캠페인 설명을 읽고 목표를 enum 에서 하나 골라 JSON `{"objective": "..."}` 으로만 답한다. enum 은 `awareness, traffic, conversion, retention`」(한국어로 적되 enum 은 영어). 사용자 메시지는 서연 씨 캠페인 한 줄(「러닝화 신상품 출시. 첫 구매를 늘리고 싶다. 하루 300만 원」). `"think": "both"`, `"repeat": 1`. 항목 2개(`c001`, `c001|on|1`). 글은 응답의 칸(출력, prompt_tokens, output_tokens, elapsed_ms, thinking_chars)을 표로 보이고, 원본 Ollama 응답에서 도구가 옮긴 칸이 무엇인지 적는다.

파이썬 둘: (1) `# (발췌 — 그대로 실행되지 않습니다.)` 상태 표시로 `urllib.request` 요청 코드(본문 `{"model", "messages", "stream": false, "think", "options"}`) — 네트워크라 검사기는 실행하지 않는다. (2) 기록 상수(RECORD, USAGE)로 두 답을 읽어 토큰 수와 시간을 견주고 `objective` 가 enum 안인지 코드가 확인한다. 출력에 `prompt_tokens`, `output_tokens`, `elapsed_ms`, `thinking_chars` 네 칸이 찍힌다.

데크(`fc-`, 4장): `request` 요청 JSON 의 칸(model, messages 둘, think, options) / `tokens` 사용자 문장이 토큰 조각으로 쪼개지는 그림(개수는 기록의 prompt_tokens 를 쓰고 조각 경계는 「그림일 뿐」이라고 캡션) / `response` 응답 JSON 의 칸 / `think` 끈 답과 켠 답의 출력 토큰과 시간 막대.

절: 1 지훈 씨가 보내는 첫 요청은 JSON 한 덩이입니다(표, 카드 request) / 2 프롬프트는 토큰이 되어 들어갑니다(표: 토큰, 컨텍스트, 시스템 메시지와 사용자 메시지의 역할, 카드 tokens) / 3 요청 코드 한 벌(파이썬 1 발췌) / 4 답은 JSON 한 줄과 칸 몇 개로 돌아옵니다(파이썬 2 기록 상수, 카드 response) / 5 thinking 을 켜면 같은 답에 토큰이 붙습니다(표, 카드 think) / 6 두 무대(짧게) / 한눈 정리 / 헷갈리기 쉬운 점(토큰은 글자가 아니다, 시스템 메시지는 사용자 메시지와 다른 자리다, thinking 글자는 답이 아니다) / 더 깊이 보기(Ollama 응답 필드 전문, 기록 도구가 옮기는 칸) / 참고문헌(Ollama API 문서 `docs/api.md`, Anthropic Messages API 문서, Qwen3 Technical Report arXiv 2505.09388).

- [ ] **Step 1: 스캐폴드** — `node scripts/new-post.js llm-first-call "LLM 호출 한 번: 프롬프트가 토큰이 되고 답이 돌아오는 길" "LLM & Agents" "LLM,입문" both`, 날짜 2026-11-10, `series: 'llm-basics-track'`.
- [ ] **Step 2: 프롬프트 파일과 기록** — `python3 scripts/llm-record.py --slug llm-first-call`. 항목 2, error 0. `python3 -c` 로 두 출력이 `json.loads` 되고 enum 안인지, 출력에 한글이 0자인지 본다.
- [ ] **Step 3: 데크 4장**(`fc-`, `'first-call-cards'` 엔트리. 마크업은 `demo-nl-audience-cards.html` 을 복사해 바꾼다).
- [ ] **Step 4: 글 본문** — 도입은 지훈 씨가 19주째 월요일에 노트북의 공개 모델에 첫 요청을 보내는 장면(자연어 오디언스 편을 한 문장으로 잇는다).
- [ ] **Step 5: 출력을 뽑아 붙인다** — `--show` 뒤 두 번 통과. 상수 검사 통과.
- [ ] **Step 6: 엔트리와 검사 전부** — excerpt, worldNote, worldPractical 문장 80자 이하. 글머리표와 참고문헌은 손으로 잰다.
- [ ] **Step 7: 커밋** — 글, posts.js, 데크 둘, demo-edu-content.js, 프롬프트, 기록. `feat(posts): LLM 호출 한 번 — 프롬프트가 토큰이 되고 답이 돌아오는 길. LLM 기초 트랙 첫째 글`.

---

### Task 2: LLM 모델 고르기 (`llm-model-selection`, 20주째, 2026-11-11)

**Files:**
- Create: `posts/llm-model-selection.md`, `demo-model-selection-cards.html`, `js/model-selection-cards-demo.js`
- Create: `data/llm-records/prompts/llm-model-selection.json`, `data/llm-records/llm-model-selection.json`
- Modify: `js/posts.js`, `js/demo-edu-content.js`
- Test: Task 1 과 같은 검사 + `python3 scripts/gen-llm-problems.py --check`

**Interfaces:**
- Consumes: Task 0 의 `PROBLEMS` 20개(블록에 리터럴 그대로), 기록 도구.
- Produces: 비용 계산 함수 `cost_won(in_tokens, out_tokens, price_in, price_out, cached_tokens=0)`(100만 토큰당 단가, 캐시 읽기는 입력 단가의 0.1배). Task 9 와 놀이터가 같은 식을 쓴다.

기록: 문제 20개 × think 끔(temperature 0) 20개 + hard 10개(`p11`~`p20`)를 `think_subset` 으로 think 켬 10개 = 30개. 시스템 메시지 「문제를 읽고 정수 답 하나를 JSON `{"answer": 정수}` 로만 답한다. 설명을 쓰지 않는다」. 정답률은 블록이 `PROBLEMS` 의 answer 와 견준다. thinking 의 효과는 hard 10개의 끔/켬 정답률과 USAGE 의 출력 토큰, 시간으로만 말한다(easy 10개는 켠 기록이 없으므로 말하지 않는다). 기록이 「켜도 정답률이 같다」로 나오면 그대로 적는다.

비용(파이썬): 설계 4절 단가로 요청 한 건(1,200 + 150 토큰)과 하루 100만 요청을 센다. 출력에 `720,000원`, `7,800,000원`, `4,200,000원` 이 찍혀야 한다(작은 모델, 큰 모델, 큰 모델 + 시스템 1,000 토큰 캐시).

모델 표(산문): 상용 API(Claude, GPT, Gemini 계열)와 공개 가중치(Qwen, Llama, Gemma, DeepSeek 계열)를 「어디서 도나, 가중치를 받나, 크기와 활성 파라미터(MoE), 컨텍스트 길이, thinking 지원」 다섯 칸으로. 수치는 각 공개 문서나 기술 보고서에 적힌 것만, 가격은 적지 않는다. reasoning 과 thinking 은 「답 앞에 모델이 쓰는 풀이 토큰」으로 풀고, 켜고 끄는 방법(Ollama `think`, API 의 thinking 파라미터)을 적는다.

데크(`ms-`, 4장): `landscape` 상용 API 대 공개 가중치 / `size` 크기, 활성 파라미터, 컨텍스트 / `thinking` hard 10개의 끔과 켬 정답 수, 토큰, 시간 / `cost` 요청 한 건의 비용 세 모델.

절: 1 고를 것은 모델 이름이 아니라 네 가지입니다(표, 카드 landscape) / 2 크기, 활성 파라미터, 컨텍스트(표, 카드 size) / 3 reasoning 과 thinking 은 답 앞의 풀이입니다(표) / 4 같은 문제 20개에 thinking 을 켜고 끄면(파이썬 1 기록 상수, 카드 thinking) / 5 요청 한 건과 하루 100만 건의 값(파이썬 2, 카드 cost) / 6 지훈 씨의 선택: 기록에는 공개 모델, 서비스는 숫자로 정한다(표) / 7 두 무대 / 한눈 정리 / 헷갈리기 쉬운 점(파라미터 수와 활성 파라미터, thinking 토큰은 출력 토큰으로 값을 낸다, 정답률은 문제 묶음에 달려 있다) / 더 깊이 보기(MoE 한 문단, 비용 식) / 참고문헌(Qwen3 Technical Report arXiv 2505.09388, DeepSeek-R1 arXiv 2501.12948, Ollama thinking 문서, Anthropic extended thinking 문서).

- [ ] **Step 1: 스캐폴드** — `node scripts/new-post.js llm-model-selection "LLM 모델 고르기: 자주 쓰는 모델, reasoning 과 thinking 이 뜻하는 것" "LLM & Agents" "LLM,입문" both`, 날짜 2026-11-11, series.
- [ ] **Step 2: 프롬프트 파일** — items 20개(`id` 는 `p01`~`p20`, `user` 는 「문제: 」 + question), `"think": "off"`, `"repeat": 1`, `"options": {"temperature": 0}`, `"think_subset": {"ids": ["p11",…,"p20"], "think": "on"}`. `python3 scripts/gen-llm-problems.py --check` 가 이 파일을 대조한다.
- [ ] **Step 3: 기록** — `python3 scripts/llm-record.py --slug llm-model-selection`. 항목 30, error 0, 한글 0자. think 켠 10개가 오래 걸려도 기다린다.
- [ ] **Step 4: 데크 4장**(`ms-`, `'model-selection-cards'`).
- [ ] **Step 5: 글 본문** — 파이썬 1 은 `PROBLEMS` 리터럴 + RECORD/USAGE 로 정답률(끔 20, 켬 10, 끔 10 같은 문제)과 토큰, 시간. 파이썬 2 는 `cost_won` 과 표 셋(72만, 780만, 420만).
- [ ] **Step 6: 출력** — `--show` 뒤 두 번 통과. 읽지 못한 답이 있으면 틀린 답으로 센 것이 출력에 보여야 한다.
- [ ] **Step 7: 상수와 생성기 대조** — `python3 scripts/check-llm-constants.py && python3 scripts/gen-llm-problems.py --check`.
- [ ] **Step 8: 엔트리와 검사 전부.**
- [ ] **Step 9: 커밋** — `feat(posts): LLM 모델 고르기 — 자주 쓰는 모델, reasoning 과 thinking. 기록 30건`.

---

### Task 3: 프롬프트와 Chain-of-Thought (`prompting-chain-of-thought`, 21주째, 2026-11-12)

**Files:**
- Create: `posts/prompting-chain-of-thought.md`, `demo-prompting-cards.html`, `js/prompting-cards-demo.js`
- Create: `data/llm-records/prompts/prompting-chain-of-thought-{plain,fewshot,steps}.json`, `data/llm-records/prompting-chain-of-thought-{plain,fewshot,steps}.json`
- Modify: `js/posts.js`, `js/demo-edu-content.js`, 필요하면 `scripts/check-llm-constants.py`(한 글의 기록 주석 여럿)
- Test: Task 2 와 같은 검사

**Interfaces:**
- Consumes: Task 0 의 `PROBLEMS`(20개 리터럴 전체를 블록 1 에 글자 그대로 둔다. `gen-llm-problems.py --check` 가 글에서 리터럴 전체를 찾는다), Task 2 의 정답률 세는 방식(같은 코드 꼴).
- Produces: 프롬프트 세 벌의 이름 `plain`, `fewshot`, `steps` 와 `steps` 출력 꼴 `{"steps": [...], "answer": 정수}`. Task 9 가 `steps` 꼴을 쓴다.

기록: 문제 20개 × 프롬프트 세 벌 = 60개, think 끔, temperature 0. 도구가 파일 하나에 시스템 메시지 하나만 받으므로 슬러그 셋으로 나눈다: `prompting-chain-of-thought-plain`(시스템 메시지는 Task 2 와 같음), `prompting-chain-of-thought-fewshot`(`plain` 에 「예시 셋」, 곧 PROBLEMS 밖의 문제 셋과 답을 같은 JSON 꼴로 더한 것), `prompting-chain-of-thought-steps`(「먼저 steps 에 영어 짧은 구로 단계를 적고(최대 5개) 마지막에 answer 를 적는다. JSON `{"steps": [...], "answer": 정수}` 로만 답한다」). 각 20개. 글의 블록 셋이 각각 `# 기록 data/llm-records/<슬러그>.json 에서 옮김` 과 `RECORD = `, `USAGE = `(`--export-constant --with-usage --slug <슬러그>`)를 둔다(블록 1 plain, 블록 2 fewshot 이어서, 블록 3 steps 이어서 + 세 벌 비교 표). 비교는 정답률 셋, 출력 토큰 합 셋, 읽지 못한 답 수 셋. 기록이 어느 쪽이든 그대로 적는다.

데크(`pc-`, 4장): `system` 시스템 메시지의 자리와 역할 / `fewshot` 예시 셋이 들어간 프롬프트 / `cot` 「단계별로」가 답 앞에 steps 를 만드는 그림 / `result` 세 벌의 정답 수와 토큰 막대.

절: 1 같은 질문에 답이 달라지는 자리는 셋입니다(표: 시스템 메시지, 예시, 지시 한 줄, 카드 system) / 2 plain: 문제만 보냅니다(파이썬 1 기록) / 3 fewshot: 예시 셋을 앞에 둡니다(파이썬 2 기록, 카드 fewshot) / 4 steps: 단계를 먼저 쓰게 합니다(파이썬 3 기록 + 비교 표, 카드 cot) / 5 토큰은 늘고 정답은 어디서 느나(표, 카드 result) / 6 두 무대 / 한눈 정리 / 헷갈리기 쉬운 점(CoT 는 thinking 과 다른 자리, 예시는 답을 알려 주는 것이 아니라 꼴을 보여 주는 것, 정답률 차이는 20문제에서는 작아 보일 수 있다) / 더 깊이 보기(self-consistency 한 문단, 프롬프트 세 벌 전문) / 참고문헌(Wei et al. CoT arXiv 2201.11903, Kojima et al. Large Language Models are Zero-Shot Reasoners arXiv 2205.11916, Wang et al. Self-Consistency arXiv 2203.11171).

- [ ] **Step 1: 스캐폴드** — `node scripts/new-post.js prompting-chain-of-thought "프롬프트와 Chain-of-Thought: 같은 질문에 답이 달라지는 자리" "LLM & Agents" "LLM,Prompting" both`, 날짜 2026-11-12, series.
- [ ] **Step 2: 프롬프트 파일 셋과 기록 셋** — `for s in plain fewshot steps; do python3 scripts/llm-record.py --slug prompting-chain-of-thought-$s; done`. 각 20개, error 0, 한글 0자. `python3 scripts/gen-llm-problems.py --check` 가 셋을 대조한다.
- [ ] **Step 3: 데크 4장**(`pc-`, `'prompting-cards'`).
- [ ] **Step 4: 글 본문** — 블록 셋(이어서), 블록 3 이 비교 표를 찍는다.
- [ ] **Step 5: 출력** — 두 번 통과. `python3 scripts/check-llm-constants.py` 가 한 글의 기록 주석 셋을 모두 대조하는지 확인한다. 안 되면 검사기를 「글 하나에 기록 주석 여럿」을 보도록 고치고(`scripts/test-llm-record.py` 나 스크래치에서 한 번 어긋나게 돌려 종료 1 확인) 같은 커밋에 넣는다.
- [ ] **Step 6: 엔트리와 검사 전부.**
- [ ] **Step 7: 커밋** — `feat(posts): 프롬프트와 Chain-of-Thought — 같은 질문에 답이 달라지는 자리. 기록 60건`.

---

### Task 4: 구조화 출력 (`structured-output`, 22주째, 2026-11-13)

**Files:**
- Create: `posts/structured-output.md`, `demo-structured-output-cards.html`, `js/structured-output-cards-demo.js`
- Modify: `js/posts.js`, `js/demo-edu-content.js`
- Test: 검사 여섯(기록 없음)

**Interfaces:**
- Consumes: 자연어 오디언스 편의 조건 JSON 스키마(verdict, conditions, unsupported_parts, reason_code)를 예로 든다. Task 1 의 enum 꼴.
- Produces: 검증 함수 `validate(obj, schema) -> list[str]`(틀린 자리 목록)와 가짜 LLM 응답 꼴 `{"stop_reason": "end_turn", "content": [{"type": "text", "text": "..."}]}`. Task 6, 7 이 같은 꼴을 쓴다.

가짜 LLM: 규칙으로 답하는 함수가 요청 12건에 네 가지 꼴로 답한다(정상 JSON 6, JSON 앞뒤에 설명 문장이 붙은 것 2, 필드 누락 2, enum 밖 값 2). 코드는 (1) 자유 문장 파싱(첫 `{` 부터 마지막 `}` 까지) → (2) 스키마 검증(필수 필드, 자료형, enum) → (3) 누락 항목만 다시 묻기(가짜 LLM 이 두 번째 요청에는 누락 필드만 채워 답한다) → (4) 그래도 틀리면 `review` 로. 출력에 네 꼴의 건수와 단계별로 살아남은 건수가 찍힌다. 글은 「진짜 모델은 이 자리에서 시스템 메시지와 대화를 읽고 스스로 답한다」고 한 번 말하고, 상용 API 의 구조화 출력 옵션(JSON 스키마 강제)은 발췌 한 번으로 보인다.

데크(`so-`, 4장): `freeform` 자유 문장을 파싱하다 깨지는 자리 / `schema` 스키마와 enum / `validate` 검증 단계 셋 / `retry` 누락 항목만 다시 묻기.

절: 1 자유 문장을 받으면 코드가 깨집니다(표, 카드 freeform) / 2 스키마가 먼저입니다(표, 카드 schema) / 3 코드가 검증하는 세 단계(파이썬 1 가짜 LLM, 카드 validate) / 4 누락 항목만 다시 묻기(파이썬 2 이어서, 카드 retry) / 5 상용 API 의 스키마 강제와 그래도 남는 검증(파이썬 3 발췌 + 표) / 6 두 무대 / 한눈 정리 / 헷갈리기 쉬운 점(JSON 이 나왔다고 맞은 것은 아니다, 다시 묻기와 재시도는 다르다, 스키마 강제는 값의 뜻을 보장하지 않는다) / 더 깊이 보기(스키마 전문, 자연어 오디언스 편의 스키마와 비교) / 참고문헌(OpenAI Structured Outputs 문서, Anthropic Structured outputs 문서, JSON Schema 명세).

- [ ] Step 1 스캐폴드(`"LLM & Agents" "LLM,입문"`, 11-13) → Step 2 데크(`so-`, `'structured-output-cards'`) → Step 3 글 본문(블록 셋: 가짜 LLM + 파싱 + 검증 / 다시 묻기 이어서 / 발췌) → Step 4 출력 두 번 통과 → Step 5 엔트리와 검사 전부 → Step 6 커밋 `feat(posts): 구조화 출력 — JSON 으로 받아 코드가 검증하는 이유`.

---

### Task 5: 임베딩과 벡터 검색 (`embeddings-vector-search`, 23주째, 2026-11-14)

**Files:**
- Create: `posts/embeddings-vector-search.md`, `demo-embedding-cards.html`, `js/embedding-cards-demo.js`
- Modify: `js/posts.js`, `js/demo-edu-content.js`
- Test: 검사 여섯

**Interfaces:**
- Consumes: 설계 4절의 상품과 임베딩(상품 3만 건, 384차원, 질의 셋 캠핑 의자, 헤드셋, 스니커즈). Lookalike 계산 편의 랜덤 투영 해시.
- Produces: 장난감 임베딩 `embed(text) -> list[float]`(384차원: 글자 2개 단위 n-gram 을 해시로 384칸에 더하고 L2 정규화, 시드 7), 상품 생성기 `make_products(n=3000, seed=7)`(이름 템플릿 × 카테고리 8개), `cosine(a, b)`, 전수 검색 `topk_brute(q, items, k)`, 근사 검색 `topk_lsh(q, index, k)`(랜덤 투영 부호 비트 10개, 테이블 6개). Task 6 이 `embed`, `cosine`, `make_products` 를 그대로 복사해 쓴다.

글은 「진짜 문장 임베딩 모델(Sentence-BERT 류)이 내는 384차원과 같은 길이의 장난감」이라고 밝히고, Elasticsearch 글(진짜 384차원 벡터 색인)과 Two-Tower 글로 링크한다. 표본은 3,000건(3만 건은 파이썬 검사 시간 때문에 1/10, 글에서 밝힌다). 질의 셋으로 전수 검색 상위 10 과 근사 검색 상위 10 의 겹침(재현율@10)과 거리 계산 횟수를 견준다.

데크(`ev-`, 4장): `vector` 문장 하나가 384개 숫자가 되는 그림 / `cosine` 두 벡터의 각도 / `bruteforce` 3,000건 전수 / `ann` 해시 묶음만 보는 근사 검색과 재현율.

절: 1 문장이 숫자 384개가 됩니다(파이썬 1, 카드 vector) / 2 가까움은 코사인으로 잽니다(표, 카드 cosine) / 3 전수 검색은 3,000 × 384 번 곱합니다(파이썬 2 이어서, 카드 bruteforce) / 4 근사 검색은 일부만 보고 조금 놓칩니다(파이썬 3 이어서, 카드 ann) / 5 임베딩이 광고에서 쓰이는 자리(표: 후보 검색, Lookalike, RAG, 유저 벡터) / 6 두 무대 / 한눈 정리 / 헷갈리기 쉬운 점(임베딩 차원 수와 품질, 코사인과 내적, 재현율은 누락이지 품질이 아니다) / 더 깊이 보기(해시 임베딩 식, HNSW 한 문단) / 참고문헌(Sentence-BERT arXiv 1908.10084, HNSW arXiv 1603.09320, Faiss arXiv 2401.08281).

- [ ] Step 1 스캐폴드(`"LLM & Agents" "Embedding,LLM,입문"`, 11-14) → Step 2 데크(`ev-`, `'embedding-cards'`) → Step 3 글 본문(블록 셋 이어서) → Step 4 출력 두 번 통과(재현율@10 이 세 질의에서 찍히고 1.0 이 아닌 것이 하나는 있어야 「조금 놓친다」가 성립. 전부 1.0 이면 테이블 수를 4 로 줄여 다시) → Step 5 엔트리와 검사 전부 → Step 6 커밋 `feat(posts): 임베딩과 벡터 검색 — 문장 하나가 384개 숫자가 되고 이웃을 찾기까지`.

---

### Task 6: RAG (`rag-basics`, 24주째, 2026-11-15)

**Files:**
- Create: `posts/rag-basics.md`, `demo-rag-cards.html`, `js/rag-cards-demo.js`, `scripts/gen-rag-docs.py`
- Create: `data/llm-records/prompts/rag-basics.json`, `data/llm-records/rag-basics.json`
- Modify: `js/posts.js`, `js/demo-edu-content.js`, `.github/workflows/validate.yml`(`gen-rag-docs.py --check` 한 단계)
- Test: 검사 여섯 + 기록 + `python3 scripts/gen-rag-docs.py --check`

**Interfaces:**
- Consumes: Task 5 의 `embed`, `cosine`, `make_products`(그대로 복사). 기록 도구.
- Produces: 문서 100건 생성기(`scripts/gen-rag-docs.py`, 상품 100건의 설명문 각 3~4문장, 속성 넷: 무게 g, 가격 원, 색 영어 enum, 소재 영어 enum. 질문 20개와 정답 문서 id, 정답 값), 청킹 함수 `chunk(doc, size=2)`(문장 2개씩), 검색 `retrieve(q, chunks, k=3)`, 근거 대조 `grounded(answer, chunks) -> bool`.

기록: 질문 20개 × 1(think 끔, temperature 0). 사용자 메시지는 「문서 조각 셋」(검색 상위 3 청크, 각 조각 앞에 `[d012]` 같은 id)과 질문. 시스템 메시지 「문서 조각에 있는 값만으로 답한다. JSON `{"value": "…", "doc_ids": ["…"]}` 로만 답하고 value 는 숫자나 영어 낱말만 쓴다. 조각에 답이 없으면 `{"value": "not_found", "doc_ids": []}`」. 질문 20개 중 15개는 답이 조각 안에 있고 5개는 일부러 검색이 놓치게(정답 문서가 상위 3 밖) 만든다. 블록은 (1) 검색 품질 Context Recall(정답 문서가 상위 k 에 든 비율)과 Context Precision(상위 k 중 정답 문서 비율), (2) 답 품질: value 가 정답과 같은 수, `doc_ids` 가 실제로 value 를 담은 조각인지(근거 대조), 조각에 없는 값을 지어낸 수(근거 없는 답), not_found 를 맞게 낸 수를 찍는다.

데크(`rg-`, 4장): `chunk` 문서가 조각이 되는 그림 / `retrieve` 질문 벡터와 상위 3 / `prompt` 조각 셋을 넣은 프롬프트 / `grounding` 답과 조각의 대조, recall 과 precision.

절: 1 모델은 상품 문서를 모릅니다(표) / 2 문서를 조각내고 벡터로 둡니다(파이썬 1, 카드 chunk) / 3 질문과 가까운 조각 셋을 찾습니다(파이썬 2 이어서 + Context Recall/Precision, 카드 retrieve) / 4 조각을 넣고 답하게 합니다(파이썬 3 기록 상수, 카드 prompt) / 5 근거 없는 문장을 셉니다(표, 카드 grounding) / 6 RAG 가 광고에서 쓰이는 자리(표: 광고주 자산 문서, 정책 문서, 캠페인 설정 도움말) / 7 두 무대 / 한눈 정리 / 헷갈리기 쉬운 점(검색이 놓치면 모델 탓이 아니다, 근거 대조는 코드가 한다, Context Recall 과 답 정확도는 다른 값) / 더 깊이 보기(RAGAS 의 두 지표 정의, 청크 크기) / 참고문헌(Lewis et al. RAG arXiv 2005.11401, RAGAS arXiv 2309.15217, Liu et al. Lost in the Middle arXiv 2307.03172).

- [ ] Step 1 스캐폴드(`"LLM & Agents" "RAG,LLM,Embedding"`, 11-15) → Step 2 생성기와 프롬프트 파일(검색 상위 3 은 블록과 같은 코드로 생성기가 만든다. `--check` 는 프롬프트 파일의 user 가 생성기 출력과 같은지 본다) → Step 3 기록(20개, error 0, 한글 0자) → Step 4 데크(`rg-`, `'rag-cards'`) → Step 5 글 본문(블록 셋 이어서, 블록 3 이 기록 상수) → Step 6 출력 두 번 통과, 상수 검사 → Step 7 엔트리와 검사 전부 → Step 8 커밋 `feat(posts): RAG — 검색한 문서를 넣고 답하게 하기, 근거 없는 문장 세기. 기록 20건`.

---

### Task 7: Tool use 와 에이전트 루프 (`tool-use-agent-loop`, 25주째, 2026-11-16)

**Files:**
- Create: `posts/tool-use-agent-loop.md`, `demo-tool-loop-cards.html`, `js/tool-loop-cards-demo.js`
- Modify: `js/posts.js`, `js/demo-edu-content.js`
- Test: 검사 여섯

**Interfaces:**
- Consumes: Task 4 의 가짜 LLM 응답 꼴(`stop_reason`, `content` 블록 목록). 설계 4절의 후보풀 캠페인 셋과 에이전트 과제 값(목표 ROAS 러닝화 400%, 여행사 300%, 객단가 12만 / 60만 / 8천 원, 입찰가 한 번에 20% 넘게 못 바꿈).
- Produces: 도구 정의 꼴 `{"name", "description", "input_schema"}` 셋(`get_campaigns`, `get_stats`, `set_bid`), 루프 함수 `run_agent(task, max_steps=6)`, 멈춤 조건 셋(`end_turn`, 단계 상한, 같은 도구 호출 반복). 묶음 3 의 광고주 에이전트 글이 같은 꼴을 넓혀 쓴다.

가짜 LLM 은 대화 기록을 읽어 다음 도구를 규칙으로 고른다(캠페인 목록 → 캠페인마다 통계 → ROAS 가 목표보다 낮으면 입찰가 10% 내리기 → 끝). 가드레일은 코드: `set_bid` 가 20% 넘는 변경을 거부하고 거부도 결과로 돌려준다(「실패도 결과」). 한 바퀴의 메시지 목록을 출력에 찍고(도구 호출 블록, 도구 결과 블록, 마지막 텍스트), 호출 수와 단계 수를 센다. 두 번째 블록은 무한 루프가 될 과제(목표를 못 맞추는 캠페인)에서 단계 상한이 멈추는 것을 보인다.

데크(`tl-`, 4장): `tools` 도구 셋 정의 / `loop` 한 바퀴(LLM 이 고르고 코드가 실행하고 결과가 다시 들어감) / `stop` 멈춤 조건 셋 / `guard` 가드레일은 코드.

절: 1 에이전트는 루프이고 고르는 것만 LLM 이 합니다(표, 카드 tools) / 2 도구 셋을 정의합니다(파이썬 1) / 3 한 바퀴를 돌립니다(파이썬 2 이어서, 카드 loop) / 4 멈춤 조건 셋(파이썬 3 이어서, 카드 stop) / 5 가드레일은 프롬프트가 아니라 코드입니다(표, 카드 guard) / 6 MCP 는 도구를 서버로 내놓는 약속입니다(표, 짧게) / 7 두 무대 / 한눈 정리 / 헷갈리기 쉬운 점(도구 호출은 LLM 이 실행하는 것이 아니다, 실패도 결과로 돌려준다, 자율 루프와 정해진 순서의 워크플로는 다르다) / 더 깊이 보기(ReAct 한 문단, 도구 정의 전문) / 참고문헌(Yao et al. ReAct arXiv 2210.03629, Schick et al. Toolformer arXiv 2302.04761, Model Context Protocol 명세 문서, Anthropic tool use 문서).

- [ ] Step 1 스캐폴드(`"LLM & Agents" "Agent,LLM"`, 11-16) → Step 2 데크(`tl-`, `'tool-loop-cards'`) → Step 3 글 본문(블록 셋 이어서) → Step 4 출력 두 번 통과(출력에 `stop_reason`, `tool_use`, `tool_result` 가 찍힘) → Step 5 엔트리와 검사 전부 → Step 6 커밋 `feat(posts): Tool use 와 에이전트 루프 — LLM 이 고르고 코드가 실행한다`.

---

### Task 8: LLM-as-a-Judge (`llm-as-a-judge`, 26주째, 2026-11-17)

**Files:**
- Create: `posts/llm-as-a-judge.md`, `demo-judge-cards.html`, `js/judge-cards-demo.js`, `scripts/gen-judge-pairs.py`
- Create: `data/llm-records/prompts/llm-as-a-judge.json`, `data/llm-records/llm-as-a-judge.json`, `data/llm-records/prompts/llm-as-a-judge-pairs.json`, `data/llm-records/llm-as-a-judge-pairs.json`
- Modify: `js/posts.js`, `js/demo-edu-content.js`, `.github/workflows/validate.yml`(`gen-judge-pairs.py --check`)
- Test: 검사 여섯 + 기록 둘 + `--check`

**Interfaces:**
- Consumes: Task 6 의 상품 문서 100건(생성기 복사), 설계 4절의 질의 셋과 쌍 50개, 사람 라벨 상, 중, 하(가상 정답).
- Produces: `cohen_kappa(a, b) -> float`, 사람 라벨과 점수의 대응(상 = 4~5, 중 = 3, 하 = 1~2), 위치 편향 측정 꼴. 묶음 3 의 판정 체계 글이 같은 함수를 쓴다.

기록 둘: (1) 채점 50건. 시스템 메시지는 채점표(1~5, 질의와 상품의 관련성, 각 점수의 뜻 한 줄), 출력 `{"score": 1~5}`. (2) 짝비교 20쌍 × 좌우 2회 = 40건(슬러그 `llm-as-a-judge-pairs`), 출력 `{"winner": "A" | "B"}`. 블록은 점수 → 상, 중, 하 대응으로 사람 라벨과의 일치율과 Cohen's kappa, 점수 분포, 짝비교에서 좌우를 바꿨을 때 승자가 바뀐 쌍 수(위치 편향)를 찍는다. 「자기 선호 편향」은 기록할 수 없으므로 숫자 없이 설명만 한다(같은 모델이 쓴 답을 같은 모델이 채점하는 문제).

데크(`jd-`, 4장): `rubric` 채점표 / `score` LLM 점수 대 사람 라벨 / `swap` 좌우 바꿔 재채점 / `kappa` 일치율과 kappa 의 차이.

절: 1 사람이 50쌍을 다 볼 수 없어 모델에게 채점표를 줍니다(표, 카드 rubric) / 2 채점 50건과 사람 라벨(파이썬 1 기록 상수, 카드 score) / 3 일치율이 아니라 kappa 로 봅니다(파이썬 2 이어서, 카드 kappa) / 4 순서를 바꾸면 승자가 바뀌는 쌍(파이썬 3 기록 상수 둘째, 카드 swap) / 5 판정을 어디에 쓰고 어디에 못 쓰나(표: 오프라인 비교, 노출 전 게이트, 학습 보상) / 6 두 무대 / 한눈 정리 / 헷갈리기 쉬운 점(절대 점수와 짝비교, kappa 가 0.4 면 무엇인가, 판정 모델을 학습 중에 바꾸면 안 되는 이유는 묶음 4 로) / 더 깊이 보기(kappa 식, 채점표 전문) / 참고문헌(Zheng et al. Judging LLM-as-a-Judge arXiv 2306.05685, Wang et al. Large Language Models are not Fair Evaluators arXiv 2305.17926, Cohen 1960 kappa).

- [ ] Step 1 스캐폴드(`"LLM & Agents" "LLM Evaluation,LLM"`, 11-17) → Step 2 생성기(쌍 50개, 사람 라벨, 짝비교 20쌍의 좌우 두 벌)와 프롬프트 파일 둘 → Step 3 기록 둘(50 + 40, error 0, 한글 0자) → Step 4 데크(`jd-`, `'judge-cards'`) → Step 5 글 본문(블록 셋, 블록 1 과 3 이 기록 상수) → Step 6 출력 두 번 통과, 상수 검사(한 글에 기록 둘) → Step 7 엔트리와 검사 전부 → Step 8 커밋 `feat(posts): LLM-as-a-Judge — 채점표로 채점하고 사람과 얼마나 맞는지 재기. 기록 90건`.

---

### Task 9: 비용, 캐시, 비결정성 (`llm-cost-cache-nondeterminism`, 27주째, 2026-11-18)

**Files:**
- Create: `posts/llm-cost-cache-nondeterminism.md`, `demo-llm-cost-cards.html`, `js/llm-cost-cards-demo.js`
- Create: `data/llm-records/prompts/llm-cost-cache-nondeterminism.json`, `data/llm-records/llm-cost-cache-nondeterminism.json`
- Modify: `js/posts.js`, `js/demo-edu-content.js`
- Test: 검사 여섯 + 기록 + `gen-llm-problems.py --check`

**Interfaces:**
- Consumes: Task 2 의 `cost_won`, Task 0 의 `PROBLEMS`(20개 리터럴 전체를 블록에 글자 그대로 두고 그중 hard 5개 `p16`~`p20` 만 쓴다. `gen-llm-problems.py --check` 가 글에서 리터럴 전체를 찾는다), Task 3 의 `steps` 시스템 메시지.
- Produces: 캐시 몫 계산(시스템 1,000 토큰이 캐시에 맞을 때 입력 비용이 어떻게 깎이나), 흔들림 지표(문제마다 서로 다른 답의 수, answer 가 바뀐 비율, steps 가 바뀐 비율). 놀이터가 같은 식을 쓴다.

기록: hard 5개 × temperature 0 반복 10회(맨 위 `"repeat": 10`, `"options": {"temperature": 0}`, seed 는 적지 않는다 → 기본 7) + 같은 5개를 `repeat_subset` 으로 temperature 0.7 10회(seed 7 + run) = 100개. 시스템 메시지는 Task 3 의 `steps` 꼴(steps 는 영어 짧은 구). 블록은 문제마다 (1) temperature 0 의 10개 답이 모두 같은지, (2) 0.7 의 10개에서 answer 가 서로 다른 수와 steps 가 서로 다른 수를 찍는다. 관심사 분류 편이 약속한 「긴 답의 흔들림」이 여기다(steps 의 흔들림). 기록이 0 이면 0 으로 적는다.

비용(파이썬): 하루 100만 요청의 세 값(72만, 780만, 420만)과 캐시 비율을 0, 50, 90, 100% 로 바꿀 때의 큰 모델 하루 비용. 월 비용은 × 30.

데크(`cc-`, 4장): `tokens` 요청 한 건의 토큰 셋(시스템 1,000, 사용자 200, 출력 150) / `cache` 캐시가 깎는 몫 / `daily` 하루 100만 요청 비용 셋 / `variance` 같은 입력 10번의 답.

절: 1 하루 100만 요청의 값은 토큰 셋으로 셉니다(파이썬 1, 카드 tokens) / 2 캐시는 시스템 메시지 값을 깎습니다(표, 카드 cache) / 3 같은 입력 10번: temperature 0 과 0.7(파이썬 2 기록 상수, 카드 variance) / 4 긴 답은 더 흔들립니다(표: answer 와 steps 의 바뀐 비율, 관심사 분류 편 링크) / 5 지훈 씨의 계산표(표, 카드 daily) / 6 두 무대 / 한눈 정리 / 헷갈리기 쉬운 점(캐시는 답을 캐시하는 것이 아니다, temperature 0 이 결정적인 것은 같은 서버와 같은 설정에서다, 비용은 출력 토큰이 좌우할 때가 많다) / 더 깊이 보기(비용 식 전문, 비결정성의 다른 원인 한 문단: 배치와 부동소수점) / 참고문헌(Anthropic prompt caching 문서, OpenAI prompt caching 문서, Thinking Machines 「Defeating Nondeterminism in LLM Inference」 2025 글).

- [ ] Step 1 스캐폴드(`"LLM & Agents" "LLM,입문"`, 11-18) → Step 2 프롬프트 파일과 기록(100개, error 0, 한글 0자. `gen-llm-problems.py --check` 가 이 파일도 대조한다) → Step 3 데크(`cc-`, `'llm-cost-cards'`) → Step 4 글 본문 → Step 5 출력 두 번 통과(세 비용 값이 찍힘), 상수 검사 → Step 6 엔트리와 검사 전부 → Step 7 커밋 `feat(posts): 비용, 캐시, 비결정성 — 하루 100만 요청의 값과 같은 입력에 다른 답. 기록 100건`.

---

### Task 10: 놀이터, 데모 목록, 용어, 표지, 최종 검증

**Files:**
- Create: `demo-llm-cost.html`, `js/llm-cost-demo.js`
- Modify: `demos.html`(바로가기 줄 「LLM 기초」, 주제 절 `demo-topic-llm`, 난이도별과 주제별 개수), `js/demo-edu-content.js`(`'llm-cost'`), `js/glossary.js`(용어 열), `index.html`(글 편수 114 → 123. 태그별 여덟 수는 posts.js 로 다시 세어 맞춘다), `README.md`(114 → 123 posts, 카테고리 7 → 8, LLM 줄), `search-index.json`(재생성)
- Test: 검사 전부 + 스크린샷

**Interfaces:**
- Consumes: Task 1~9 의 데크 9장과 글 9편, Task 2 와 9 의 비용 식.
- Produces: 없음(마지막 Task).

놀이터 `demo-llm-cost.html`: 슬라이더 다섯(시스템 토큰 0~4,000 기본 1,000, 사용자 토큰 0~2,000 기본 200, 출력 토큰 0~1,000 기본 150, 캐시 적중 비율 0~100% 기본 100, 하루 요청 수 1만~1,000만 기본 100만)과 모델 토글(작은 모델, 큰 모델. 단가는 설계 4절 가상 값), 지표 카드 넷(요청 한 건, 하루, 한 달, 캐시가 깎은 몫), 판정 한 줄(「캐시가 하루 N원을 깎습니다」), 해설 패널에 비용 식과 「가상 단가」 한 문장. 기본값에서 큰 모델은 하루 `4,200,000원`, 캐시 0% 면 `7,800,000원`, 작은 모델 캐시 0% 면 `720,000원` 이 나와야 한다. 형식은 `demo-lookalike-ratio.html`(Chart.js, `cssVar()`, `?embed=1`, aria-label, 프리셋 뒤 `input` 이벤트).

용어 열: `토큰`, `컨텍스트 윈도`, `thinking(reasoning)`, `임베딩`, `RAG`, `Context Recall 과 Precision`, `tool use`, `MCP`, `LLM-as-a-Judge`, `Cohen's kappa`. 각 body 두 문장, 파일의 다른 항목과 같은 평서체.

- [ ] **Step 1: 놀이터** — 위 사양대로. `'llm-cost'` 엔트리. 기본값 셋을 node 로 다시 계산해 보고서에 적는다.
- [ ] **Step 2: 데모 목록** — `demos.html` 바로가기 줄에 `<a class="demos-jump-item" href="#demo-topic-llm">LLM 기초<b>10</b></a>` 을 「타겟팅 모델」 뒤에, 주제 절 `demo-topic-llm`(데크 9장 + 놀이터 1장, 설명 한 문단)을 「타겟팅 모델」 절 뒤에. 「난이도별 N개 데모」와 「주제별 N개, 주제 N개」를 10 과 1 늘리고, 로드맵은 짝 글의 「입문」 태그를 기준으로(입문 태그 글의 데크와 놀이터는 입문, 나머지는 중급) 배정해 합이 맞게 한다.
- [ ] **Step 3: 용어 열** — `js/glossary.js` 끝에, 기존 항목과 겹치는 이름이 없는지 먼저 본다.
- [ ] **Step 4: 표지와 README** — `index.html` 「글 123편 전체」, 태그별 여덟 수는 `node -e` 로 `posts.js` 의 tags 를 세어 모두 맞춘다. `README.md` 의 글 수, 카테고리 수(8), LLM 줄(영어).
- [ ] **Step 5: 검사 전부** — Run: `node scripts/validate-posts.js && node scripts/check-content-standard.js llm-first-call llm-model-selection prompting-chain-of-thought structured-output embeddings-vector-search rag-basics tool-use-agent-loop llm-as-a-judge llm-cost-cache-nondeterminism && node scripts/check-wording.js && node scripts/check-code-blocks.js && for s in llm-first-call llm-model-selection prompting-chain-of-thought structured-output embeddings-vector-search rag-basics tool-use-agent-loop llm-as-a-judge llm-cost-cache-nondeterminism; do python3 scripts/check-python-outputs.py --post $s || exit 1; done && python3 scripts/check-llm-constants.py && python3 scripts/test-llm-record.py && python3 scripts/gen-llm-problems.py --check && python3 scripts/gen-rag-docs.py --check && python3 scripts/gen-judge-pairs.py --check && node scripts/test-long-sentences.js && node scripts/check-design.js && node scripts/test-code-steps.js && node scripts/build-search-index.js && grep -rnE "$(grep -v '^#' $NAMES_FILE | tr '\n' '|' | sed 's/|$//')" posts/ docs/ js/ data/ *.html; echo "names grep exit=$?"` Expected: 전부 통과, 마지막 grep 은 출력 없이 `exit=1`. 아홉 글의 글머리표와 참고문헌 줄을 손으로 재어 80자 초과가 원제뿐인지 본다. 기록 여섯 벌의 outputs 에 한글이 0자인지 `python3 -c` 로 센다.
- [ ] **Step 6: 화면 확인** — 헤드리스 크롬으로 글 9편을 1440 과 390 폭으로(카드 iframe 로드, 가로 스크롤 없음), 데크 9장과 놀이터를 라이트와 다크로, `demos.html`, `topics.html`(LLM 주제와 트랙), `ml-track.html`(6단계 아홉 편), `index.html`, `posts-browse.html?category=LLM%20%26%20Agents`(새 카테고리 칩 색) 를 찍는다. 스크린샷은 저장소 밖 작업 폴더에.
- [ ] **Step 7: 커밋** — 파일 여덟을 이름으로. `feat(demos): LLM 비용 놀이터와 LLM 기초 데모 절, 용어 열, 표지 123편`. 병합과 push 는 컨트롤러가 브랜치 전체 검토 뒤에 한다(이번 묶음은 사용자가 2026-11-04 밤 미리 승인했다).
