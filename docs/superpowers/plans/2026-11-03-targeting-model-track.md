# 타겟팅 모델 트랙 6편 (묶음 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 설계 문서의 묶음 1, 타겟팅 모델 트랙 6편(글, 카드 데크 6장, 놀이터 1장, 기록 3벌, 트랙과 목록 통합)을 블로그에 올릴 수 있는 상태로 만든다.

**Architecture:** 글은 `posts/<slug>.md` 마크다운 + `js/posts.js` 엔트리 하나. 절마다 카드 한 장을 `demo-<이름>-cards.html?embed=1&card=<키>` iframe 으로 넣고, 데크는 `js/card-kit.js` 부품으로 `js/<이름>-cards-demo.js` 가 그린다. 파이썬은 표준 라이브러리만 쓰고 검사기가 실제로 돌린다. LLM 출력이 필요한 세 글은 `scripts/llm-record.py` 가 Ollama 로 한 번 기록한 `data/llm-records/<slug>.json` 의 값을 상수로 옮겨 쓴다.

**Tech Stack:** 마크다운(marked.js 렌더), vanilla JS 카드 데크(`card-kit.js`), Chart.js 놀이터, Python 3.9 표준 라이브러리, Ollama `qwen3.5:27b`(`http://localhost:11434/api/chat`), 검사 스크립트 8개(`scripts/`).

**Spec:** `docs/superpowers/specs/2026-11-03-llm-tracks-design.md` (묶음 1 은 3-1절, 표준 데이터는 4절, 기록 형식은 5절, 카드와 놀이터는 6절)

## Global Constraints

- 글은 합쇼체(`~입니다`, `~합니다`). 코드 블록 안 주석은 평서체(`~한다`). 1인칭은 「저」.
- 가운뎃점 없음(쉼표). 비유 없음. 낱말 `실측`, `실체`, `축`(그래프 축 제외), `가른다`, `갈린다` 없음. 이모지와 장식 글자 없음. 해요체 없음. 작은 수가 아니면 아라비아 숫자. 지훈 씨의 주 수는 「13주째」처럼 숫자로.
- 제목은 「주제어: 무엇을 알게 되나」, 콜론 하나, 55자 이하. 설계 3-1절의 제목을 글자 그대로 쓴다.
- 구조: 도입 장면(400~500자, 문단 4개, 표 0개, 개념어 없이) → `> 한 줄 요약:` → 본문 절 → 끝에서 두 번째 절은 「두 무대」(### 소제목에 `[무대: 닫힌 생태계]`, `[무대: 열린 RTB]`) → `## 한눈 정리`(표 하나) → `## 헷갈리기 쉬운 점` → `## 더 깊이 보기`(`:::deep` 3개 이하) → `## 참고문헌`(공개 출처만).
- 절마다 굵은 요약 한 줄 + 문단 4~6개 + 표 1개 또는 파이썬 1개. 표 총 5~7개. 데이터는 글에 1~2벌. 문장 80자 상한, 목표 평균 44~56자. 산문 15KB 이상.
- 파이썬은 표준 라이브러리만, 3.9 문법, 모든 난수는 `random.seed(7)`. 블록은 `# 하는 일:` 한 줄, `# N단계:` 제목과 풀이, `# 출력:` 아래 `# N단계 뜻:` 과 찍힌 줄(`python3 scripts/check-python-outputs.py --post <slug> --show` 가 뽑은 것을 그대로 붙인다). 꼬리표는 `python` 하나. 상용 API 코드는 `# (발췌 — 그대로 실행되지 않습니다.)`.
- 기록을 쓰는 블록은 기록 파일의 값을 문자열 상수로 담고 `# 하는 일:` 바로 다음 줄에 `# 기록 data/llm-records/<slug>.json 에서 옮김` 주석을 단다(블록 첫 줄은 상태 표시나 하는 일이어야 형식 검사를 지난다). 기록 출력은 JSON, 영어 enum 라벨, 숫자만. 한국어 문장은 산문의 「」 안에만.
- 가상 값은 글에서 한 번 「가상 데이터」라고 밝힌다. 다른 글의 숫자(회원 1,400만, 세그먼트 317 160만, 맞춤타겟 8만, Lookalike 140만, 타겟 방식별 전환율 표, 후보풀 캠페인 셋)와 어긋나지 않는다. 설계 4절의 값을 그대로 쓴다.
- 회사 안 시스템 이름, 숫자, 문장, 사람 이름은 어디에도 넣지 않는다. 올리기 전에 `grep -rnE "$(grep -v '^#' ~/Downloads/job-search/공통/사내-이름-목록.txt | tr '\n' '|' | sed 's/|$//')" posts/ docs/ js/ data/ *.html` 이 0건이어야 한다.
- 커밋은 `chkimsu` 계정(GitHub no-reply 메일)으로, 파일을 하나씩 명시한다. `git add -A` 금지. push 전에 `git fetch origin && git merge origin/main`. 커밋 메시지는 한국어 conventional commit, 끝에 `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- 새 파일은 `node scripts/check-wording.js` 에서 0건. 기준표(`scripts/wording-baseline.json`)를 늘리지 않는다.

## Review Focus

- 표본 생성 블록이 시드 없이 돌면 출력이 매번 달라 실행 검사가 실패한다. 모든 블록 첫 단계에 `random.seed(7)` 을 두고, 검사 2회 연속 같은 출력인지 본다(Task 1 Step 6, Task 3 Step 6).
- 기록 상수가 기록 파일과 어긋나면 글의 숫자가 거짓이 된다. 상수는 손으로 치지 않고 `python3 scripts/llm-record.py --slug <slug> --export-constant` 가 뽑은 문자열을 붙이고, 블록이 센 값과 기록 파일의 값을 같은 단계에서 두 번 찍어 맞춘다(Task 2 Step 7, Task 5 Step 7, Task 6 Step 6).
- 표본 2,000명(Lookalike 는 20,000명)에서 센 비율이 전체 표(세그먼트 317 160만 = 11.4%)와 어긋나면 독자가 두 숫자를 맞춰 보다 걸린다. 생성기에 비율을 직접 넣고, 글은 「표본 2,000명 중 229명」처럼 표본임을 매번 밝힌다(Task 1 Step 6).
- 「불가」 예시 요청이 실제 차별 문장이 되면 공개 글에 남는다. 불가 예는 설계 4절의 「건강 상태로 골라 달라」 하나만 쓰고, 거절 응답은 고정 템플릿 문장 하나로 둔다(Task 6 Step 4).
- 카드 iframe 블록 앞뒤 빈 줄이 없거나 안에 `$`, `**` 가 들어가면 렌더가 깨진다. 글마다 1440 폭과 390 폭 화면을 찍어 카드 여섯 장이 다 보이는지 본다(Task 7 Step 6).

---

### Task 0: 공통 기반 — 트랙, 태그, 기록 도구, 작성 안내

**Files:**
- Modify: `data/taxonomy.json` (tags 배열)
- Modify: `js/posts.js:1394` 근처 `series` 객체, `js/posts.js:1474` 근처 `mlTrack.stages[2].posts`
- Modify: `js/topics.js` `TRACK_ORDER`
- Create: `scripts/llm-record.py`
- Create: `data/llm-records/prompts/.gitkeep`, `data/llm-records/README.md`
- Modify: `MARKDOWN_GUIDE.md` (「LLM 글의 기록 재생과 가짜 LLM」 절 추가)
- Test: `node scripts/validate-posts.js`, `python3 scripts/llm-record.py --selftest`

**Interfaces:**
- Produces: `series['targeting-model-track'] = { title: '타겟팅 모델 트랙', desc, posts: [6개 id 순서대로] }`. 태그 `LLM`. `scripts/llm-record.py` 의 CLI 와 기록 파일 형식(아래). 뒤 Task 는 이 셋을 그대로 쓴다.

기록 파일 형식 `data/llm-records/<slug>.json`:

```json
{"model": "qwen3.5:27b", "recorded_at": "2026-11-05", "host": "http://localhost:11434",
 "options": {"temperature": 0, "seed": 7},
 "items": [{"id": "a001", "think": false, "run": 1, "system": "…", "user": "…",
            "output": "{\"label\":\"running\"}", "thinking_chars": 0,
            "prompt_tokens": 412, "output_tokens": 9, "elapsed_ms": 1830,
            "options": {"temperature": 0, "seed": 7}}]}
```

프롬프트 파일 형식 `data/llm-records/prompts/<slug>.json`: `{"system": "…", "items": [{"id": "a001", "user": "…"}], "think": "off" | "on" | "both", "repeat": 1, "repeat_subset": {"ids": ["a001"], "repeat": 3}, "think_subset": {"ids": ["a001"], "think": "on"}}`. 뒤의 두 필드는 선택이다. `repeat_subset` 은 그 id 들만 지정한 횟수만큼 더 보내고(`run` 2, 3…), `think_subset` 은 그 id 들만 지정한 think 로 한 번 더 보낸다. `options` 도 선택이다. 파일 맨 위에 두면 기본값 `{"temperature": 0, "seed": 7}` 을 덮고, `repeat_subset` 과 `think_subset` 안에 두면 그 묶음에만 적용된다. 반복 묶음에서 `temperature` 가 0 보다 크고 `seed` 가 없으면 run 마다 `seed = 7 + run` 을 써서 돌릴 때마다 다르되 다시 기록해도 같게 한다. 기록 항목마다 실제로 쓴 `options` 를 적는다. 그래서 흔들림은 temperature 0(같은 답)과 0.7(바뀌는 답)을 견주어 잰다. Ollama 에 temperature 0 과 고정 seed 로 보내면 같은 답이 돌아오므로, 설계 4절의 「같은 입력 10회」 측정은 이 두 설정을 나란히 두는 것으로 읽는다.

CLI: `python3 scripts/llm-record.py --slug <slug> [--model qwen3.5:27b] [--host http://localhost:11434] [--limit N]` 은 프롬프트 파일을 읽어 기록 파일을 쓴다(있으면 덮어쓴다). `--export-constant` 는 기록의 `items[].output` 을 `id` 순서로 `RECORD = {...}` 파이썬 상수 문자열로 찍는다(`id → output` 딕셔너리, `think` 와 `run` 이 여럿이면 키를 `id|on|2` 꼴로). `--selftest` 는 서버 버전을 묻고 한 줄짜리 요청 하나를 보내 형식 필드가 다 있는지 확인하고 0 으로 끝난다. 표준 라이브러리 `urllib.request`, `json`, `time`, `argparse`, `datetime` 만 쓴다. 요청은 `POST /api/chat`, 본문 `{"model", "messages": [{"role":"system"},{"role":"user"}], "stream": false, "think": bool, "options": {"temperature": 0, "seed": 7}}`. 응답의 `message.content`, `message.thinking`(없으면 빈 문자열), `prompt_eval_count`, `eval_count`, `total_duration`(ns → ms) 을 옮긴다. 한 항목이 실패하면 3번까지 다시 보내고 그래도 실패면 그 항목만 `"error"` 필드로 남기고 계속한다.

- [ ] **Step 1: 지금 상태를 확인한다**

Run: `node scripts/validate-posts.js && node -e "const m=require('./js/posts.js');console.log(Object.keys(m.series).length, m.mlTrack.stages.length)"`
Expected: 검증 통과, `13 5`

- [ ] **Step 2: 태그와 트랙을 더한다**

`data/taxonomy.json` tags 에 `"LLM"` 을 더한다(`"Elasticsearch"` 뒤). `js/posts.js` 의 `series` 에 `'targeting-model-track'` 을 `'targeting-track'` 바로 뒤에 넣는다. title `타겟팅 모델 트랙`, desc 는 「마케터 서연 씨가 화면에서 본 타겟팅의 뒤에서 모델이 하는 일. 지훈 씨가 13주째부터 유저 프로파일 피처, 관심사 분류, Lookalike 계산, 전환 예측 타겟, 컨텍스추얼, 자연어 오디언스를 한 주에 하나씩 엽니다」, posts 는 `user-profile-features, interest-classification, lookalike-computation, pcvr-based-targeting, contextual-targeting, natural-language-audience`. `mlTrack.stages[2].posts` 끝에 `lookalike-computation`, `pcvr-based-targeting` 을 더하고 그 단계의 goal 끝에 「타겟팅 모델 두 편도 여기서 읽습니다」 한 문장을 더한다. `js/topics.js` `TRACK_ORDER` 의 `'targeting-track'` 바로 뒤에 `'targeting-model-track'`.

- [ ] **Step 3: 검증이 「없는 글」을 잡는지 본다**

Run: `node scripts/validate-posts.js; echo exit=$?`
Expected: series 가 가리키는 글 6개가 없다는 오류로 exit 1 (글은 뒤 Task 에서 만든다). 오류 문구에 여섯 id 가 다 나오는지 본다.

- [ ] **Step 4: `scripts/llm-record.py` 를 위 CLI 대로 만든다**

파일 맨 위 docstring 에 사용법 세 줄(기록, 상수 뽑기, 자체 점검)과 「Ollama 는 `ollama serve` 로 먼저 띄운다」를 적는다. `data/llm-records/README.md` 에 형식 두 가지와 「숫자를 손으로 고치지 않는다. 다시 기록하면 파일 전체를 바꾼다」를 적는다.

- [ ] **Step 5: 서버가 떠 있는지와 자체 점검**

Run: `curl -s http://localhost:11434/api/version && ollama list | grep qwen3.5:27b && python3 scripts/llm-record.py --selftest`
Expected: 버전 JSON, 모델 한 줄, `selftest ok: model=qwen3.5:27b prompt_tokens=… output_tokens=… elapsed_ms=…`. 서버가 없으면 `ollama serve` 를 띄우고, 모델이 없으면 `ollama pull qwen3.5:27b` 가 끝날 때까지 이 Task 를 멈춘다.

- [ ] **Step 6: `MARKDOWN_GUIDE.md` 에 절을 더한다**

「### 타겟팅 기초 7편도 같은 형식입니다」 절 앞에 `### LLM 글의 기록 재생과 가짜 LLM` 절을 넣는다. 내용은 설계 5절을 그대로 옮기되 명령 세 줄(기록, 상수 뽑기, 자체 점검)과 기록 상수 블록의 첫 줄 주석 규칙을 더한다. 표준 용어는 그대로 쓴다.

- [ ] **Step 7: 커밋**

```bash
git add data/taxonomy.json js/posts.js js/topics.js scripts/llm-record.py data/llm-records/README.md data/llm-records/prompts/.gitkeep MARKDOWN_GUIDE.md
git commit -m "feat(tracks): 타겟팅 모델 트랙과 LLM 태그, Ollama 기록 도구 llm-record.py

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

(검증이 아직 글 6개가 없다고 실패하는 상태로 커밋해도 된다. CI 는 push 때 돈다.)

---

### Task 1: 유저 프로파일 피처 (`user-profile-features`, 13주째)

**Files:**
- Create: `posts/user-profile-features.md`
- Modify: `js/posts.js` (엔트리, `node scripts/new-post.js` 가 만든 것을 채운다)
- Create: `demo-profile-cards.html`, `js/profile-cards-demo.js`
- Modify: `js/demo-edu-content.js` (`'profile-cards'` 엔트리)
- Test: `node scripts/validate-posts.js`, `node scripts/check-content-standard.js user-profile-features`, `node scripts/check-wording.js`, `node scripts/check-code-blocks.js`, `python3 scripts/check-python-outputs.py --post user-profile-features`, `node scripts/test-long-sentences.js`

**Interfaces:**
- Consumes: Task 0 의 series. 설계 4절의 회원 A, B 행동, 표본 2,000명, 세그먼트 317 비율 11.4%.
- Produces: 세그먼트 317 규칙(아래)과 표본 생성 방식. Task 3, 4, 6 이 같은 규칙과 같은 표본 생성 코드를 복사해 쓴다.

세그먼트 317 규칙은 새로 정하지 않고 `posts/audience-and-segments.md` 가 이미 적어 둔 조건 셋(글, 앱, 검색의 문턱값)을 글자 그대로 가져온다. 그 글의 조건별 인원(글 110만, 앱 62만, 검색 41만, 겹침 빼면 160만)과 방향이 맞게 표본을 만든다. 표본 생성기 `make_members(n, seed=7)` 는 회원 n 명에게 행동 8종(검색어 러닝화, 운동 앱 실행 일수, 러닝 글, 운동 용품 구매, 여행 글, 카페 글, 캠핑 글, 캠핑 용품 검색)을 주되 사건마다 경과일을 뽑아(최근성 가중에 쓴다) 30일 합계는 `counts(m)` 으로 센다. 키 이름은 Task 6 의 스키마 필드(`search_running_shoes`, `sports_app_days`, `running_posts`, `sports_goods_buy`, `travel_posts`, `cafe_posts`, `camping_posts`, `camping_search`)와 같다. 난수는 함수 안의 `random.Random(seed)` 로 만들어 어디서 불러도 같은 표본이 나온다. 표본은 317 조건을 만족하는 사람이 정확히 229명이 되게 「러닝 성향 229명 / 나머지 1,771명」을 먼저 나누고 성향별 분포에서 뽑는다. 회원 A 는 표본의 0번, 회원 B 는 1번으로 설계 4절의 값을 그대로 넣는다.

피처 벡터(8차원): 행동 8종의 30일 합계에 최근성 가중(반감기 7일, 날짜별 값 × 0.5^(경과일/7))을 곱해 더한 뒤, 표본 평균과 표준편차로 표준화한다.

데크 `demo-profile-cards.html`(접두어 `pf-`, 카드 4장): `logs` 회원 A 의 30일 행동 표가 날짜별로 쌓이는 그림 / `agg` 합계와 최근성 가중이 다른 값을 내는 자리(같은 러닝 글 9편이 최근이면 7.2, 오래됐으면 2.1 같은 식, 값은 글의 파이썬 출력에서 옮긴다) / `vector` 회원 A, B 의 8차원 벡터 막대 / `rule` 317 조건 셋 중 A 는 셋 다, B 는 0개가 맞는 그림. 카드 `h2` 는 영어 대문자 짧은 제목, `tg-k` 한 줄, `tg-easy` 「쉽게 말하면」 띠, `tg-cap` 한 줄. 마크업은 `demo-targeting-cards.html` 의 `.tg-card` 그대로(클래스 이름도 `tg-`), 범례 한 줄, `?card=` 필터 코드는 `targeting-cards-demo.js` 끝의 것을 복사.

글의 절(## 번호 제목): 1 회원 A 의 30일 행동은 표 한 장입니다(표, 카드 logs) / 2 합계만 보면 오래된 관심과 지금 관심을 못 가릅니다(파이썬 1, 카드 agg) / 3 8개 숫자가 벡터 하나가 되고 표준화로 자가 맞춰집니다(표, 카드 vector) / 4 세그먼트 317 은 규칙 셋이고 표본 2,000명 중 229명에게 붙습니다(파이썬 2, 카드 rule) / 5 이 벡터가 다음 글들에서 쓰이는 자리(표: Lookalike, pCVR 피처, 자연어 조건) / 6 두 무대 / 한눈 정리 / 헷갈리기 쉬운 점(세그먼트 번호와 피처 벡터는 다른 물건, 집계 창 30일과 반감기 7일의 차이, 비로그인 C 는 행동이 없다) / 더 깊이 보기(반감기 식, 표준화 식) / 참고문헌.

파이썬 블록: (1) `# 하는 일: 회원 A 의 30일 행동을 합계와 최근성 가중 합으로 집계해 8차원 벡터로 만든다.` 단계 셋(행동 표를 둔다, 합계와 가중합을 센다, 표준화한다). (2) `# 하는 일: 표본 2,000명을 만들어 세그먼트 317 규칙을 적용하고 몇 명에게 붙는지 센다.` 단계 셋(생성기, 규칙, 센다). 출력에 `229명 (11.4%)` 이 찍혀야 한다.

- [ ] **Step 1: 스캐폴드**

Run: `node scripts/new-post.js user-profile-features "유저 프로파일 피처: 행동 로그 30일이 세그먼트 번호와 벡터가 되기까지" "Targeting & Audience" "Targeting,Segmentation,입문" both`
Expected: `posts/user-profile-features.md` stub 과 `js/posts.js` 엔트리 생성. `series: 'targeting-model-track'` 을 엔트리에 손으로 더한다.

- [ ] **Step 2: 검사기가 빈 글을 잡는지 본다**

Run: `node scripts/check-content-standard.js user-profile-features`
Expected: KB 작음, `코드없음`, `표없음`, `practical없음` 플래그.

- [ ] **Step 3: 데크를 만든다**

`js/profile-cards-demo.js` 에 카드 4장을 `window.CardKit` 부품으로 그린다(함수 이름 `svg('pf-logs', s)` 처럼 접두어 `pf-`). `demo-profile-cards.html` 은 `demo-targeting-cards.html` 을 복사해 제목 「유저 프로파일 카드 네 장」, 설명, 범례, 카드 4장으로 바꾼다. `js/demo-edu-content.js` 에 `'profile-cards'` 엔트리(`analogy` 칸에는 비유가 아니라 한 줄 요약, `anchor: '.tg-host'`, `embedKeep: ['.tg-grid']`, `embedHide: ['.tg-hero', '.tg-real']`, `explain` 에 카드 4장의 「헷갈리는 것」 한 문장씩).

- [ ] **Step 4: 데크를 브라우저로 확인한다**

Run: 헤드리스 크롬으로 `demo-profile-cards.html` 과 `demo-profile-cards.html?embed=1&card=agg` 를 1440 폭으로 찍어 본다.
Expected: 카드 4장이 겹침 없이 보이고, `card=agg` 는 한 장만 남는다.

- [ ] **Step 5: 글 본문을 쓴다**

위 절 구성대로 `posts/user-profile-features.md` 를 쓴다. 도입은 지훈 씨가 13주째 월요일에 세그먼트 317 의 정의 코드를 열어 보는 장면. 카드 iframe 은 `MARKDOWN_GUIDE.md` 의 데모 임베드 블록 그대로(`src="demo-profile-cards.html?embed=1&card=logs"`). 두 무대 절: 담장 안은 로그인 회원의 행동이 한 계정에 쌓여 30일 집계가 가능, 열린 RTB 는 쿠키가 바뀌어 집계 창이 짧고 비어 있는 사람이 많다. 참고문헌은 공개 자료만(예: Meta 「Sequence learning」 글, DMP 와 CDP 일반 문서).

- [ ] **Step 6: 파이썬 출력을 뽑아 붙이고 두 번 같은지 본다**

Run: `python3 scripts/check-python-outputs.py --post user-profile-features --show`
Expected: 블록 둘의 찍힌 줄과 뜻 자리. `# 출력:` 아래에 그대로 붙이고 뜻을 쓴다. 다시 `python3 scripts/check-python-outputs.py --post user-profile-features` 를 두 번 돌려 둘 다 통과(시드가 있어 같은 출력). 둘째 블록 출력에 `229명 (11.4%)` 이 있어야 한다.

- [ ] **Step 7: 엔트리를 채우고 검사 전부**

`js/posts.js` 엔트리의 `excerpt`(도입 장면과 숫자 셋), `worldNote`, `worldPractical` 을 채운다.

Run: `node scripts/validate-posts.js && node scripts/check-content-standard.js user-profile-features && node scripts/check-wording.js && node scripts/check-code-blocks.js && node scripts/test-long-sentences.js`
Expected: validate 는 아직 남은 글 5개가 없다는 오류만, 나머지는 통과. 내용 표준 행에 플래그 없음, 15KB 이상, 표 5~7개.

- [ ] **Step 8: 커밋**

```bash
git add posts/user-profile-features.md js/posts.js demo-profile-cards.html js/profile-cards-demo.js js/demo-edu-content.js
git commit -m "feat(posts): 유저 프로파일 피처 — 행동 로그 30일이 세그먼트 번호와 벡터가 되기까지. 타겟팅 모델 트랙 첫째 글

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: 관심사 분류 (`interest-classification`, 14주째)

**Files:**
- Create: `posts/interest-classification.md`, `demo-interest-cards.html`, `js/interest-cards-demo.js`
- Create: `data/llm-records/prompts/interest-classification.json`, `data/llm-records/interest-classification.json`(기록 결과)
- Modify: `js/posts.js`, `js/demo-edu-content.js`
- Test: Task 1 과 같은 검사 여섯 + `python3 scripts/llm-record.py --slug interest-classification`

**Interfaces:**
- Consumes: Task 0 의 `llm-record.py`, 기록 형식.
- Produces: 글 200건 생성기(제목 템플릿 × 관심사 8개, 시드 7)와 라벨 enum 8개 `running, camping, travel, cafe, parenting, finance, gaming, beauty`. Task 5 가 같은 enum 방식(영어 소문자 라벨)을 쓴다.

글 200건(가상): 관심사 8개 × 25건. 제목 템플릿 5개 × 명사 사전으로 만들되 20건은 두 관심사 낱말이 섞인 「헷갈리는 글」로 둔다(사람 라벨은 하나). 사람 라벨 200개는 생성기가 아는 정답.

세 방법: 규칙은 관심사별 키워드 사전(3~5개)으로 첫 매칭. 분류 모델은 단어 가방 + 로지스틱 회귀(표준 라이브러리, 경사 하강 200회, 학습 160건 평가 40건, 8개 클래스는 one-vs-rest). LLM 라벨은 기록(시스템 메시지: 「제목과 첫 문장을 읽고 관심사 하나를 enum 에서 골라 JSON `{"label": "..."}` 으로만 답한다」, 항목 200건, `think: off`, `repeat: 1`) + 흔들림 측정(같은 40건을 `repeat: 3`). 비용은 설계 4절 단가(작은 상용 모델 입력 400원, 출력 1,600원 / 100만 토큰)와 기록의 토큰 수로 센다.

데크 `demo-interest-cards.html`(`ic-`, 4장): `rule` 키워드 사전과 첫 매칭 / `model` 단어 가방이 가중치를 지나 8개 점수가 되는 그림 / `llm` 프롬프트 한 장과 JSON 답 한 줄 / `compare` precision, recall, 건당 비용 막대 셋.

절: 1 글 200건과 라벨 8개(표) / 2 규칙: 사전에 있는 낱말만 잡습니다(파이썬 1, 카드 rule) / 3 분류 모델: 단어 가방과 로지스틱 회귀(파이썬 2, 카드 model) / 4 LLM 라벨: 프롬프트 하나로 200건, 다만 세 번 물으면 답이 바뀌는 글이 있습니다(파이썬 3 기록 상수, 카드 llm) / 5 셋을 한 표에: precision, recall, 건당 비용, 지연(표, 카드 compare) / 6 섞어 쓰기: 규칙으로 거르고 모델로 매기고 LLM 은 애매한 것만(표) / 7 두 무대 / 한눈 정리 / 헷갈리기 쉬운 점(precision 과 recall 중 무엇이 타겟팅에 비싼가, LLM 라벨의 흔들림은 오류가 아니라 재야 하는 값, 라벨 비용과 서빙 비용은 다르다) / 더 깊이 보기(one-vs-rest 식, 토큰 비용 식) / 참고문헌(Walmart 관련성 판정 LLM arXiv 2406.00247, Pinterest 검색 관련성 arXiv 2410.17152, Bing LLM 라벨링 arXiv 2309.10621).

- [ ] **Step 1: 스캐폴드**

Run: `node scripts/new-post.js interest-classification "관심사 분류: 같은 글 200건에 규칙, 분류 모델, LLM 라벨을 나란히" "Targeting & Audience" "Targeting,Segmentation,LLM,입문" both`
Expected: stub 과 엔트리. `series: 'targeting-model-track'` 추가.

- [ ] **Step 2: 프롬프트 파일을 쓰고 기록한다**

`data/llm-records/prompts/interest-classification.json` 에 시스템 메시지, 200건(`id` 는 `a001`~`a200`, `user` 는 제목과 첫 문장), `"think": "off"`, `"repeat": 1`. 글 200건은 글의 파이썬 1 블록과 같은 생성기로 만들어 두 곳이 같아야 한다(생성기 코드를 `scripts/gen-interest-articles.py` 로 두고 블록은 그 코드를 그대로 담는다). 흔들림용으로 같은 파일에 `"repeat_subset": {"ids": ["a001"…"a040"], "repeat": 3, "options": {"temperature": 0.7}}` 을 둔다. 반복 묶음은 run 마다 seed 가 7+run 으로 달라진다. 글은 「temperature 0 과 고정 seed 는 다시 기록해도 같은 파일이 나오고(재기록 diff 0), 0.7 에서는 40건 중 N건이 바뀜」으로 쓰고 N 은 기록에서 센다. N 이 0 이면 0 이라고 쓰고, 라벨 하나짜리 답은 자유 문장보다 안 바뀐다는 점을 그대로 적는다.

Run: `python3 scripts/llm-record.py --slug interest-classification`
Expected: `data/llm-records/interest-classification.json` 에 항목 200 + 120 = 320개, `error` 0개. 걸린 시간을 적어 둔다.

- [ ] **Step 3: 기록을 상수로 뽑는다**

Run: `python3 scripts/llm-record.py --slug interest-classification --export-constant | head -5`
Expected: `RECORD = {"a001": "{\"label\":\"running\"}", …` 로 시작하는 파이썬 상수.

- [ ] **Step 4: 데크를 만든다** (Task 1 Step 3 과 같은 방식, 접두어 `ic-`, `'interest-cards'` 엔트리)

- [ ] **Step 5: 글 본문을 쓴다**

파이썬 1 은 생성기 + 규칙 분류 + precision/recall. 파이썬 2 는 `# (앞 블록에 이어서 돌린다.)` 로 로지스틱 회귀 학습과 평가. 파이썬 3 은 첫 줄 `# (앞 블록에 이어서 돌린다.)`, 둘째 줄 `# 하는 일: …`, 셋째 줄 `# 기록 data/llm-records/interest-classification.json 에서 옮김` 순서로 RECORD 상수를 담고 사람 라벨과의 precision/recall, 40건 3회 중 답이 바뀐 글 수, 토큰 합 × 단가 = 건당 비용을 찍는다.

- [ ] **Step 6: 출력을 뽑아 붙인다**

Run: `python3 scripts/check-python-outputs.py --post interest-classification --show`
Expected: 블록 셋의 찍힌 줄. 붙이고 다시 돌려 통과.

- [ ] **Step 7: 상수와 기록이 같은지 본다**

Run: `python3 -c "import json;r=json.load(open('data/llm-records/interest-classification.json'));print(len(r['items']), sum(i['output_tokens'] for i in r['items']))"` 와 파이썬 3 블록이 찍은 「항목 수, 출력 토큰 합」 줄을 비교.
Expected: 두 값이 같다.

- [ ] **Step 8: 엔트리를 채우고 검사 전부** (Task 1 Step 7 과 같다. 기록 모델 이름과 기록한 날짜가 글에 한 번 적혀 있는지 `grep -n "qwen3.5:27b" posts/interest-classification.md` 로 본다.)

- [ ] **Step 9: 커밋**

```bash
git add posts/interest-classification.md js/posts.js demo-interest-cards.html js/interest-cards-demo.js js/demo-edu-content.js data/llm-records/prompts/interest-classification.json data/llm-records/interest-classification.json scripts/gen-interest-articles.py
git commit -m "feat(posts): 관심사 분류 — 같은 글 200건에 규칙, 분류 모델, LLM 라벨을 나란히. 첫 Ollama 기록

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Lookalike 계산 (`lookalike-computation`, 15주째)

**Files:**
- Create: `posts/lookalike-computation.md`, `demo-lookalike-batch-cards.html`, `js/lookalike-batch-cards-demo.js`
- Modify: `js/posts.js`, `js/demo-edu-content.js`, `docs/superpowers/specs/2026-11-03-llm-tracks-design.md`(4절 표본 행에 한 줄)
- Test: Task 1 과 같은 검사 여섯

**Interfaces:**
- Consumes: Task 1 의 피처 벡터 8차원과 표준화, 표본 생성기(여기서는 20,000명으로 키운다).
- Produces: Lookalike 점수 = 시드 중심 벡터와의 코사인 유사도. 확장 비율 1, 5, 10% 의 정밀도 표. Task 4 가 같은 표본 20,000명 생성기를 쓴다.

표본은 20,000명(시드 7). 맞춤타겟 비율 8만/1,400만 = 0.57% 라 시드 114명, 10% 확장은 2,000명. 설계 4절의 표본 행에 「Lookalike 와 pCVR 타겟 글은 20,000명(시드 114명)」 한 줄을 더한다. 시드 114명의 피처 평균이 설계의 시드 피처(러닝 글 12회, 운동 앱 8일, 운동 용품 1.5회, 나이 33세)에 맞도록 생성기의 시드 성향 분포 평균을 그 값으로 둔다. 정밀도는 「뽑힌 사람 중 러닝 성향인 비율」로 정의하고, 1, 5, 10% 에서 타겟 방식별 전환율 표(3.20%, 1.50%, 0.90%)와 방향이 맞게(비율이 커질수록 떨어지게) 나와야 한다. 숫자 자체는 가상이라 글에서 밝힌다.

근사 검색은 랜덤 투영 해시(8차원 → 부호 비트 6개, 테이블 4개)를 표준 라이브러리로 짜고, 전수 검색 상위 2,000명과 겹치는 비율(재현율)과 거리 계산 횟수를 비교한다.

데크(`lb-`, 4장): `seed` 시드 114명의 피처 평균 넷 / `centroid` 중심 벡터와 거리 / `search` 전수 대 근사(계산 횟수) / `cut` 1, 5, 10% 자르기와 정밀도.

절: 1 시드 8만 명은 어떤 사람들인가(표, 카드 seed) / 2 중심 벡터 하나와 거리로 줄을 세웁니다(파이썬 1, 카드 centroid) / 3 전수로 재면 1,400만 × 8 이고 근사 검색은 그중 일부만 봅니다(파이썬 2, 카드 search) / 4 확장 비율을 올리면 도달은 늘고 정밀도는 내려갑니다(표, 카드 cut) / 5 번호 6001 이 적히는 두 자리(프로필과 캠페인 조건, 표) / 6 두 무대 / 한눈 정리 / 헷갈리기 쉬운 점(분모는 전체 회원, 중심 하나로 되는 시드와 안 되는 시드, 근사 검색의 재현율은 품질이 아니라 누락) / 더 깊이 보기(코사인 식, 랜덤 투영 해시의 충돌 확률) / 참고문헌(Walmart Lookalike arXiv 2301.03147, HNSW arXiv 1603.09320, Faiss arXiv 2401.08281).

- [ ] **Step 1: 스캐폴드** — `node scripts/new-post.js lookalike-computation "Lookalike 계산: 시드 8만 명에서 140만 명을 뽑는 실제 순서" "Targeting & Audience" "Lookalike,Targeting,Segmentation" both`, series 추가.
- [ ] **Step 2: 설계 문서 4절 표본 행에 20,000명 한 줄을 더한다.**
- [ ] **Step 3: 데크 4장** (`lb-`, `'lookalike-batch-cards'` 엔트리).
- [ ] **Step 4: 글 본문** — 파이썬 1 은 생성기 20,000명 + 시드 114 + 중심 + 코사인 + 1, 5, 10% 정밀도 표. 파이썬 2 는 `# (앞 블록에 이어서 돌린다.)` 로 랜덤 투영 해시 재현율과 계산 횟수.
- [ ] **Step 5: 출력을 뽑아 붙인다** — `--show` 뒤 두 번 통과. 정밀도가 1% > 5% > 10% 순인지 출력에서 확인.
- [ ] **Step 6: 두 번 돌려 같은 출력인지 본다** — `for i in 1 2; do python3 scripts/check-python-outputs.py --post lookalike-computation; done` 둘 다 통과.
- [ ] **Step 7: 엔트리와 검사 전부** (Task 1 Step 7).
- [ ] **Step 8: 커밋** — 파일 다섯(글, posts.js, 데크 html, 데크 js, demo-edu-content.js) + 설계 문서. 메시지 `feat(posts): Lookalike 계산 — 시드 8만 명에서 140만 명을 뽑는 실제 순서`.

---

### Task 4: 전환 예측으로 타겟 고르기 (`pcvr-based-targeting`, 16주째)

**Files:**
- Create: `posts/pcvr-based-targeting.md`, `demo-pcvr-target-cards.html`, `js/pcvr-target-cards-demo.js`
- Modify: `js/posts.js`, `js/demo-edu-content.js`
- Test: Task 1 과 같은 검사 여섯

**Interfaces:**
- Consumes: Task 3 의 표본 20,000명 생성기, Task 1 의 317 규칙.
- Produces: 가상 pCVR 생성식(피처 벡터의 선형 결합 + 로지스틱 + 잡음, 전체 평균 전환율 0.60% 가 세그먼트 317 안에서 나오게 절편을 맞춘다). 전환은 pCVR 을 확률로 한 번 뽑는다.

비교 셋(표본 20,000명 기준, 글은 전체 숫자로 환산해 함께 적는다): 세그먼트 317(11.45%, 2,290명), pCVR 상위 같은 크기(2,280명), pCVR 상위 5%(1,000명), 상위 1%(200명). 표 칸은 크기, 전환율, 전환 수, 전환 1건당 비용(하루 예산 300만 원을 전체 노출 비용으로 두고 크기에 비례해 쓴다). 증분은 「광고 없이도 살 확률」을 가상 기저(전환율의 60%)로 두고 두 방식의 증분 전환 수를 비교한다.

데크(`pt-`, 4장): `segment` 317 로 고른 사람과 그들의 pCVR 분포 / `topn` 상위 N 자르기 / `tradeoff` 크기 대 전환율 곡선 / `lift` 기저 전환과 증분.

절: 1 서연 씨의 부탁 「살 사람에게만」(표, 카드 segment) / 2 같은 크기로 자르면 전환율이 어떻게 달라지나(파이썬 1, 카드 topn) / 3 작게 자를수록 전환율은 오르고 전환 수는 줄어듭니다(표, 카드 tradeoff) / 4 어차피 살 사람을 빼면 남는 증분(파이썬 2, 카드 lift) / 5 pCVR 을 타겟에 쓰면 생기는 두 문제: 노출된 사람만 라벨이 있고, 상위만 보이면 다음 학습이 굳습니다(표, 피드백 루프 글과 uplift 글 링크) / 6 두 무대 / 한눈 정리 / 헷갈리기 쉬운 점(전환율과 전환 수, pCVR 상위와 Lookalike 의 차이, 증분은 실험 없이는 추정) / 더 깊이 보기(가상 pCVR 생성식, 기저 가정) / 참고문헌(uplift 와 incrementality 공개 자료, Meta Advantage+ audience 도움말).

- [ ] **Step 1: 스캐폴드** — `node scripts/new-post.js pcvr-based-targeting "전환 예측으로 타겟 고르기: 세그먼트 대신 pCVR 상위를 쓰면 무엇이 달라지나" "Targeting & Audience" "pCVR,Targeting,Incrementality" both`, 카테고리에 `Measurement & Modeling` 을 둘째로 더하고 series 추가.
- [ ] **Step 2: 데크 4장** (`pt-`, `'pcvr-target-cards'` 엔트리).
- [ ] **Step 3: 글 본문** — 파이썬 1 은 생성기 + pCVR + 전환 뽑기 + 비교 표 넷. 파이썬 2 는 `# (앞 블록에 이어서 돌린다.)` 로 기저와 증분.
- [ ] **Step 4: 출력을 뽑아 붙인다** — 세그먼트 317 의 전환율이 0.55~0.65% 사이인지 확인(설계 표 0.60% 와 맞춰야 한다. 벗어나면 절편을 고치고 다시).
- [ ] **Step 5: 엔트리와 검사 전부.**
- [ ] **Step 6: 커밋** — `feat(posts): 전환 예측으로 타겟 고르기 — 세그먼트 대신 pCVR 상위를 쓰면 무엇이 달라지나`.

---

### Task 5: 컨텍스추얼 타겟팅 (`contextual-targeting`, 17주째)

**Files:**
- Create: `posts/contextual-targeting.md`, `demo-contextual-cards.html`, `js/contextual-cards-demo.js`, `scripts/gen-context-pages.py`
- Create: `data/llm-records/prompts/contextual-targeting.json`, `data/llm-records/contextual-targeting.json`
- Modify: `js/posts.js`, `js/demo-edu-content.js`
- Test: 검사 여섯 + 기록

**Interfaces:**
- Consumes: Task 0 의 기록 도구, Task 2 의 enum 라벨 방식.
- Produces: 지면 50개 생성기와 IAB 상위 카테고리 10개 enum(`automotive, business, education, family, food, health, hobbies, sports, style, travel` 로 두고 글에서 IAB Content Taxonomy 의 상위 범주를 줄인 것이라고 밝힌다).

세 방법: 키워드(카테고리별 사전 4개, 첫 매칭), 임베딩(단어 가방 TF-IDF 벡터와 카테고리 중심 벡터의 코사인. 글에서 「문장 임베딩 384차원의 단순한 형태」라고 밝히고 Elasticsearch 글로 링크), LLM 분류(기록: 50개 × think off × 1회, 그중 10개는 think on 으로도 1회 더 받아 토큰과 시간을 비교). 광고 셋(서연 러닝화, 여행사, 카페)을 카테고리 규칙으로 지면에 붙여 비로그인 C 가 본 지면에 어느 광고가 나가는지 표로.

데크(`cx-`, 4장): `page` 지면 글 한 편과 뽑힌 낱말 / `keyword` 사전 매칭 / `embedding` 벡터와 중심의 각도 / `llm` 프롬프트와 JSON 라벨, think 켰을 때의 토큰.

절: 1 비로그인 C 에게는 번호가 없고 지면 글만 있습니다(표) / 2 지면 50개와 카테고리 10개(표, 카드 page) / 3 키워드 사전(파이썬 1, 카드 keyword) / 4 TF-IDF 벡터와 중심의 코사인(파이썬 2, 카드 embedding) / 5 LLM 분류: 50개를 한 프롬프트로, thinking 을 켜면 무엇이 달라지나(파이썬 3 기록 상수, 카드 llm) / 6 세 방법 비교와 광고 셋이 붙는 지면(표) / 7 두 무대(열린 RTB 는 쿠키 없이 지면만으로, 담장 안은 회원 번호와 지면을 같이) / 한눈 정리 / 헷갈리기 쉬운 점(컨텍스추얼은 사람이 아니라 자리를 고른다, 분류 정확도와 광고 성과는 다르다, thinking 은 정확도보다 비용을 먼저 바꾼다) / 더 깊이 보기(TF-IDF 식, IAB 분류 체계 소개) / 참고문헌(Amazon Ads 문맥 타겟팅 기고 4A's 2025-03, IAB Content Taxonomy 문서, LLM 분류 벤치마크 arXiv 2510.13885).

- [ ] **Step 1: 스캐폴드** — `node scripts/new-post.js contextual-targeting "컨텍스추얼 타겟팅: 지면 글만으로 광고를 고르는 세 방법" "Targeting & Audience" "Targeting,LLM,입문" both`, series 추가.
- [ ] **Step 2: 지면 50개 생성기 `scripts/gen-context-pages.py` 와 프롬프트 파일** — `"think": "off"`, `"repeat": 1`, `"think_subset": {"ids": [처음 10개], "think": "on"}`.
- [ ] **Step 3: 기록** — `python3 scripts/llm-record.py --slug contextual-targeting`. 항목 60개, error 0.
- [ ] **Step 4: 데크 4장** (`cx-`, `'contextual-cards'` 엔트리).
- [ ] **Step 5: 글 본문** — 파이썬 1 생성기 + 키워드 정확도, 파이썬 2 TF-IDF 코사인 정확도(이어서), 파이썬 3 기록 상수 + 정확도 + think 켠 10개의 토큰과 시간 비교(이어서).
- [ ] **Step 6: 출력을 뽑아 붙인다** — 두 번 통과.
- [ ] **Step 7: 상수와 기록 일치 확인** (Task 2 Step 7 방식).
- [ ] **Step 8: 엔트리와 검사 전부.**
- [ ] **Step 9: 커밋** — 글, posts.js, 데크 둘, demo-edu-content.js, 생성기, 프롬프트, 기록. `feat(posts): 컨텍스추얼 타겟팅 — 지면 글만으로 광고를 고르는 세 방법`.

---

### Task 6: 자연어 오디언스 (`natural-language-audience`, 18주째)

**Files:**
- Create: `posts/natural-language-audience.md`, `demo-nl-audience-cards.html`, `js/nl-audience-cards-demo.js`
- Create: `data/llm-records/prompts/natural-language-audience.json`, `data/llm-records/natural-language-audience.json`
- Modify: `js/posts.js`, `js/demo-edu-content.js`
- Test: 검사 여섯 + 기록

**Interfaces:**
- Consumes: Task 1 의 표본 2,000명 생성기와 행동 8종, Task 0 의 기록 도구.
- Produces: 조건 JSON 스키마(아래). 묶음 3 의 `nl-to-targeting-query` 가 같은 스키마를 넓혀 쓴다.

조건 JSON 스키마(기록의 출력 형식): `{"verdict": "supported" | "partial" | "unsupported", "conditions": [{"field": "search_running_shoes" | "sports_app_days" | "running_posts" | "sports_goods_buy" | "travel_posts" | "cafe_posts" | "camping_posts" | "camping_search" | "age" | "region", "op": ">=" | "<=" | "==", "value": 숫자 또는 문자열}], "unsupported_parts": ["…"], "reason_code": "none" | "sensitive_attribute" | "unknown_field" | "exposure_history_unavailable"}`. 시스템 메시지는 이 스키마와 「지원하지 않는 조건은 conditions 에 넣지 말고 unsupported_parts 에 영어 짧은 구로 적는다」를 담는다. 요청 셋은 설계 4절 그대로(지원, 일부 지원, 불가). 기록은 셋 × think off × 1회(temperature 0, 기준) + 셋을 `repeat_subset` 으로 5회 반복(temperature 0.7, run 마다 seed 7+run) + 「일부 지원」 요청만 think on 1회 더. 항목 3 + 15 + 1 = 19개.

거절 응답은 코드가 고른 고정 템플릿 한 문장: 「요청에 건강 상태처럼 민감한 정보로 고르는 조건이 있어 만들 수 없습니다. 관심사나 행동 조건으로 바꿔 주시면 다시 만들겠습니다.」 LLM 이 쓴 문장은 광고주에게 가지 않는다.

데크(`na-`, 4장): `intent` 세 요청과 판정 셋 / `slots` 「러닝화 살 사람」이 조건 둘(`search_running_shoes >= 2`, `sports_goods_buy == 0` 같은 식, 값은 기록에서)로 나뉘는 그림 / `query` 조건이 코드 필터가 되어 표본에서 몇 명이 남는지 / `bridge` 어디가 LLM(판정, 조건 추출)이고 어디가 코드(필터, 크기, 응답 템플릿)인가.

절: 1 새 과제의 첫 화면은 문장 하나입니다(도입 뒤 첫 절, 표) / 2 첫 단계는 판정: 지원, 일부 지원, 불가(표, 카드 intent) / 3 조건 추출: 문장이 JSON 이 됩니다(기록, 카드 slots) / 4 조건이 쿼리가 되고 명단 크기가 나옵니다(파이썬 1 기록 상수 + 필터, 카드 query) / 5 같은 문장을 다섯 번 보내면(표: temperature 0 은 같은 답, 0.7 에서 조건이 바뀐 횟수, think 켠 것과의 차이) / 6 거절은 LLM 이 아니라 템플릿이 말합니다(표) / 7 어디까지 LLM 이고 어디부터 코드인가(표, 카드 bridge. LLM 기초 트랙 예고) / 8 두 무대 / 한눈 정리 / 헷갈리기 쉬운 점(「살 사람」은 조건이 아니라 예측이라 pCVR 글로, 노출 이력 조건은 데이터가 없어 불가가 아니라 일부 지원, 판정과 추출을 한 번에 시키지 않는 이유) / 더 깊이 보기(스키마 전문, 흔들림 측정 방법) / 참고문헌(Amazon Ads AMC SQL generator 보도자료 2025-01, Zeotap NL Audience Builder 문서, Anthropic Structured outputs 문서).

- [ ] **Step 1: 스캐폴드** — `node scripts/new-post.js natural-language-audience "자연어 오디언스: 「러닝화 살 사람」 한 문장이 조건과 명단이 되기까지" "Targeting & Audience" "Targeting,LLM,Segmentation" both`, series 추가.
- [ ] **Step 2: 프롬프트 파일과 기록** — 항목 19개. `python3 scripts/llm-record.py --slug natural-language-audience`. 출력이 스키마대로 파싱되는지 `python3 -c` 로 16개 전부 `json.loads` 해 본다. 파싱이 안 되는 항목이 있으면 시스템 메시지를 고쳐 다시 기록한다(기록 파일은 통째로 바뀐다).
- [ ] **Step 3: 데크 4장** (`na-`, `'nl-audience-cards'` 엔트리).
- [ ] **Step 4: 글 본문** — 거절 템플릿은 위 문장 하나만. 파이썬 1 은 기록 상수(요청 셋의 1회차 출력) → `json.loads` → 필드별 필터 함수 → 표본 2,000명에서 남는 수와 전체 환산(× 7,000). 「일부 지원」은 unsupported_parts 를 빼고 센다.
- [ ] **Step 5: 출력을 뽑아 붙인다** — 두 번 통과.
- [ ] **Step 6: 상수와 기록 일치 확인** — 블록이 찍는 「조건 수, 바뀐 횟수」와 기록 파일에서 직접 센 값 비교.
- [ ] **Step 7: 엔트리와 검사 전부.**
- [ ] **Step 8: 커밋** — `feat(posts): 자연어 오디언스 — 한 문장이 조건과 명단이 되기까지. 타겟팅 모델 트랙 여섯째 글`.

---

### Task 7: 놀이터, 데모 목록, 용어, 표지, 최종 검증과 올리기

**Files:**
- Create: `demo-lookalike-ratio.html`, `js/lookalike-ratio-demo.js`
- Modify: `demos.html`(바로가기 줄, 주제 절 「타겟팅 모델」, 난이도 로드맵 개수), `js/demo-edu-content.js`(`'lookalike-ratio'`), `js/glossary.js`, `index.html`(표지 편수), `README.md`(글 수, 트랙 설명), `search-index.json`(재생성), `sitemap.xml`과 `feed.xml`(CI 가 만든다. 손대지 않는다)
- Test: 검사 전부 + 스크린샷

**Interfaces:**
- Consumes: Task 1~6 의 데크 6장과 글 6편, Task 3 의 정밀도 표.
- Produces: 없음(마지막 Task).

놀이터 `demo-lookalike-ratio.html`: 슬라이더 셋(확장 비율 1~20%, 시드 크기 1만~20만 명, 정밀도 감쇠 계수)과 지표 카드 넷(도달 명수, 정밀도, 예상 전환율, 예상 전환 수), 판정 한 줄(「전환 수가 가장 많은 비율은 N% 입니다」), 해설 패널. 곡선은 설계 표의 세 점(1% 3.20%, 5% 1.50%, 10% 0.90%)을 지나는 감쇠식으로 두고 그 식을 패널에 적는다. 형식은 `demo-frequency-capping.html`(Chart.js, `cssVar()` 헬퍼와 폴백 상수, `?embed=1`).

- [ ] **Step 1: 놀이터를 만든다** — 위 사양대로. `js/demo-edu-content.js` 에 `'lookalike-ratio'` 엔트리.
- [ ] **Step 2: 데모 목록** — `demos.html` 바로가기 줄에 `<a class="demos-jump-item" href="#demo-topic-targeting-model">타겟팅 모델<b>7</b></a>` 을 「타겟팅과 오디언스」 뒤에, 주제 절 `demo-topic-targeting-model`(데크 6장 + 놀이터 1장, 설명 한 문단)을 「타겟팅과 오디언스」 절 뒤에, 맨 위 「난이도별 N개 데모」와 로드맵 개수를 7 늘린다.
- [ ] **Step 3: 용어 여섯** — `js/glossary.js` 에 `관심사 분류`, `컨텍스추얼 타겟팅`, `IAB 콘텐츠 분류`, `최근성 가중(반감기)`, `pCVR 타겟팅`, `의도 판정과 조건 추출`. 각 body 는 두 문장, 표준 용어 그대로.
- [ ] **Step 4: 표지와 README** — `index.html` 의 글 편수 108 → 114. `README.md` Content 절의 95 posts 를 114 로, Targeting 줄에 「유저 프로파일 피처, 관심사 분류, Lookalike 계산, 전환 예측 타겟, 컨텍스추얼, 자연어 오디언스」를 더한다.
- [ ] **Step 5: 검사 전부**

Run: `node scripts/validate-posts.js && node scripts/check-content-standard.js user-profile-features interest-classification lookalike-computation pcvr-based-targeting contextual-targeting natural-language-audience && node scripts/check-wording.js && node scripts/check-code-blocks.js && for s in user-profile-features interest-classification lookalike-computation pcvr-based-targeting contextual-targeting natural-language-audience; do python3 scripts/check-python-outputs.py --post $s || exit 1; done && node scripts/test-long-sentences.js && node scripts/check-design.js && node scripts/build-search-index.js && grep -rnE "$(grep -v '^#' ~/Downloads/job-search/공통/사내-이름-목록.txt | tr '\n' '|' | sed 's/|$//')" posts/ docs/ js/ data/ *.html; echo "names grep exit=$?"`
Expected: 전부 통과, 마지막 grep 은 출력 없이 `exit=1`.

- [ ] **Step 6: 화면 확인** — 헤드리스 크롬으로 글 6편(`post.html?id=<slug>`)을 1440 폭, 390 폭으로 찍어 카드 iframe 이 다 뜨고 가로 스크롤이 없는지(`document.scrollWidth == clientWidth`), 데크 6장과 놀이터를 라이트와 다크로 찍어 겹침이 없는지 본다. `topics.html` 에 트랙이 타겟팅 주제 안에 보이고, `ml-track.html` 3단계에 두 편이 있는지 본다.
- [ ] **Step 7: 커밋과 올리기**

```bash
git add demo-lookalike-ratio.html js/lookalike-ratio-demo.js demos.html js/demo-edu-content.js js/glossary.js index.html README.md search-index.json
git commit -m "feat(demos): Lookalike 확장 비율 놀이터와 타겟팅 모델 데모 절, 용어 여섯, 표지 114편

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git config user.email   # chkimsu 의 users.noreply.github.com 주소여야 한다. 아니면 멈추고 묻는다
git fetch origin && git merge origin/main && git push origin main
```

Expected: push 뒤 GitHub Actions 의 validate 와 sitemap 이 초록. 몇 분 뒤 `https://chkimsu.github.io/adtech-blog/post.html?id=user-profile-features` 가 열린다.
