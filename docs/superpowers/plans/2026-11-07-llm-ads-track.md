# LLM 광고 응용 트랙 13편 (묶음 3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 설계 문서의 묶음 3, LLM 광고 응용 트랙 13편(글, 카드 데크 13장, 놀이터 1장, 기록을 쓰는 글 여섯, 공용 데이터 생성기, 트랙 통합)을 블로그에 올릴 수 있는 상태로 만든다.

**Architecture:** 글의 꼴은 묶음 2 와 같다. `posts/<slug>.md` + `js/posts.js` 엔트리 하나, 절마다 카드 iframe(`demo-<이름>-cards.html?embed=1&card=<키>`), 표준 라이브러리 파이썬, 진짜 답은 기록 재생, 구조는 가짜 LLM. 묶음 3 은 여러 글이 같은 회원 2,000명과 키워드 120개를 쓰므로 Task 0 이 공용 생성기 `scripts/gen-ads-data.py` 를 만든다. 기록을 쓰는 글은 프롬프트 파일을 생성기가 쓰고, `--check` 가 프롬프트 파일, 글의 리터럴, 놀이터 데이터가 생성기와 같은지 본다. 앞 기록의 답으로 다음 프롬프트를 만드는 두 단계 기록(관심사 사전의 심판, 판정 체계의 캐스케이드)은 생성기가 앞 기록을 읽어 뒤 프롬프트를 쓴다.

**Tech Stack:** 마크다운(marked.js 렌더), vanilla JS 카드 데크(`card-kit.js`), Chart.js 놀이터, Python 3.9 표준 라이브러리, Ollama `qwen3.5:27b`(`http://localhost:11434/api/chat`), 검사 스크립트(`scripts/`).

**Spec:** `docs/superpowers/specs/2026-11-03-llm-tracks-design.md` (묶음 3 은 3-3절, 표준 데이터는 4절, 기록 형식과 가짜 LLM 은 5절, 카드와 놀이터는 6절, 통합 자리는 7절, 검증은 8절)

## 이 계획에서 정한 것 (설계와 다른 점, 사용자 확인 필요)

1. **카피 생성 글(Task 8)만 기록 출력에 한국어 카피를 받는다.** 설계 2절은 기록 출력을 영어 라벨과 숫자로 받는다. 카피는 한국어 문장이 목적이라 이 글의 `copy`, `quote` 두 값만 예외로 둔다. 시스템 메시지가 말투(명사나 「~합니다」로 끝, 가운뎃점, 이모지, 「저희」 없음, 아라비아 숫자)를 정하고, 그 기록이 든 글은 말투 검사 0건이어야 한다. 걸리면 형식 실패로 보고 시스템 메시지를 고쳐 다시 기록한다. Task 9 는 그 카피를 사용자 메시지로 받고 출력은 영어다.
2. **코딩 에이전트 글(Task 13)의 세션 발췌는 이 묶음을 만드는 작업에서 뽑는다.** 실험은 Task 4 의 두 단계 기록(투표 두 번, 답이 다른 키워드만 심판)이다. 브리프, 구현자가 돌린 명령과 그 출력, 보고, 검토 판정, 커밋, 검사 결과를 경로, 계정, 세션 id 를 지우고 싣는다. 훅은 이 저장소의 커밋 규칙(파일을 하나씩 명시, `git add -A` 금지, main 직접 push 금지, `--force` 금지)을 막는 PreToolUse 훅 스크립트 하나를 글의 파이썬으로 두고, 예시 입력 다섯으로 돌린 결과를 싣는다. 사용자 환경의 설정 파일은 바꾸지 않는다.
3. **말투 검사기에 「어색한 낱말」 범주를 더한다(Task 0).** 얹다, 견주다, 훑다, 줄을 세우다, 굳은 같은 말이다. 옛 글에 있는 곳은 기준표에 지금 수로 적어 두고, 새 글은 0건이어야 한다.

## Global Constraints

- 글은 합쇼체(`~입니다`, `~합니다`). 코드 블록 안 주석은 평서체(`~한다`). 1인칭은 「저」(「내」, 「저희」 금지). 절 제목은 합쇼체 문장이다(평서체 제목 금지).
- 가운뎃점 없음(쉼표). 비유 없음. 낱말 `실측`, `실체`, `축`(그래프 축 제외), `가른다`, `갈린다` 없음. 이모지와 장식 글자 없음. 해요체 없음. 작은 수가 아니면 아라비아 숫자. 지훈 씨의 주 수는 「28주째」처럼 숫자로.
- 어색한 낱말을 쓰지 않는다. 얹다 → 추가하다, 붙이다. 가리다 → 숨기다, 안 보이다. 굳은 값 → 고정된 값. 품다 → 처리하다, 담다. 줄을 세우다 → 정렬하다, 순위를 매기다. 견주다 → 비교하다. 훑다 → 스캔하다, 살펴보다. 실어 보내다 → 담아 보내다. 「~인 셈이다」, 「드러나다」, 「어긋나다」, 「통째로」, 본문 문장 안의 줄표(—)는 줄인다.
- 결론 목록은 `**제목.** 설명` 꼴로 쓴다. 제목은 원래 말투를 그대로 둔다.
- 제목은 「주제어: 무엇을 알게 되나」, 콜론 하나, 55자 이하. 설계 3-3절의 제목을 글자 그대로 쓴다.
- 구조: 도입 장면(400~500자, 문단 4개, 표 0개, 개념어 없이) → `> 한 줄 요약:` → 「골라 읽는 법」 글머리표 → 본문 절 → 끝에서 두 번째 절은 「두 무대」(### 소제목 둘에 `[무대: 닫힌 생태계]`, `[무대: 열린 RTB]`) → `## 한눈 정리`(표 하나) → `## 헷갈리기 쉬운 점`(셋) → `## 더 깊이 보기`(`:::deep` 3개 이하) → `## 참고문헌`(공개 출처만). 광고 응용 트랙의 「두 무대」는 묶음 1 처럼 정식 절이다. 두 소제목을 합쳐 문단 4~6 이고, 「표 1개 또는 파이썬 1개」 규칙에서는 뺀다(Ruling B2-7 과 같게 표 총수는 글 전체로 센다).
- 절마다 굵은 요약 한 줄 + 문단 4~6개(굵은 요약, 표, 코드, 임베드, 제목은 세지 않는다) + 표 1개 또는 파이썬 1개. 둘 다 있어도 된다(Ruling B2-11). 표 총 5~7개. 문장 80자 상한(「」 인용 안의 문장, 글머리표, 참고문헌, posts.js 의 excerpt, worldNote, worldPractical, 데크 캡션, 데크 메타 설명까지. 공개 출처 원제가 그 자체로 80자를 넘는 줄만 예외), 목표 평균 44~56자. 산문 15KB 이상. 표준 용어는 첫 쓰임에 짧은 풀이를 붙이고 다시 풀지 않는다. 앞 묶음 글에서 푼 용어는 링크하고 다시 풀지 않는다.
- 파이썬은 표준 라이브러리만, 3.9 문법, 글마다 1~3개. 모든 난수는 `random.Random(7)` 또는 `random.seed(7)`. 블록은 `# 하는 일:` 한 줄, `# N단계:` 제목과 풀이, `# 출력:` 아래 `# N단계 뜻:` 과 찍힌 줄(`python3 scripts/check-python-outputs.py --post <slug> --show` 가 뽑은 것을 그대로 붙인다). 꼬리표는 `python` 하나. 상용 API 나 네트워크를 부르는 코드는 `# (발췌 — 그대로 실행되지 않습니다.)` 상태 표시로 한 글에 한 번만. 찍는 값에 실행 시간(측정한 ms)을 넣지 않는다. 시간은 기록의 USAGE 나 설계 4절의 값으로 센다.
- 기록을 쓰는 블록은 `# 하는 일:` 바로 다음 줄에 `# 기록 data/llm-records/<slug>.json 에서 옮김` 주석을 두고, `python3 scripts/llm-record.py --export-constant [--with-usage] --slug <slug>` 가 찍은 `RECORD = ` 줄(과 `USAGE = ` 줄)을 글자 그대로 붙인다. 손으로 고치거나 더하지 않는다. 한 블록에 기록 하나다. 기록 둘을 견줄 때는 앞 블록이 값을 다른 이름에 옮겨 두고 뒤 블록이 `# (앞 블록에 이어서 돌린다.)` 로 잇는다. `python3 scripts/check-llm-constants.py` 가 통과해야 한다.
- 기록 출력은 JSON 이고 문자열 값은 영어, 숫자, 입력에 있던 id 뿐이다(한국어 0자). 예외는 위 「이 계획에서 정한 것」 1 하나다. 한국어 문장은 산문의 「」 안에만 둔다. 기록 항목의 `user` 와 `system` 은 한국어여도 된다.
- LLM 행동에 관한 숫자(정답률, 바뀐 비율, 토큰, 시간, 일치도)는 기록 파일에서 블록이 센 값이나 USAGE 에 있는 값만 쓴다. 기록 밖에서 센 수는 적지 않는다. 숫자 없는 과정 설명은 된다.
- 프롬프트 손질과 재기록은 temperature 0 의 기준 답이 스키마대로 파싱되지 않을 때만 한다(Task 8 은 말투 검사에 걸리는 것도 형식 실패로 친다). 기록이 기대와 다르면 기록을 그대로 두고 글이 그 사실을 가르친다(Ruling B2-3). 파싱 안 되는 답은 「읽지 못한 답」으로 세고 틀린 답으로 친다.
- 두 단계 기록은 앞 기록을 끝낸 뒤 생성기로 뒤 프롬프트 파일을 쓰고 뒤 기록을 한다. 앞 기록을 다시 하면 뒤 프롬프트와 뒤 기록도 다시 한다. `--check` 가 뒤 프롬프트를 앞 기록에서 다시 만들어 대조한다.
- 기록 모델은 하나(`qwen3.5:27b`)다. 「작은 모델」과 「큰 모델」을 나눠 보여야 하는 자리(Task 4 의 투표와 심판, Task 9 의 캐스케이드)는 thinking 끔을 싼 판정자, thinking 켬을 비싼 판정자로 두고 글에서 한 번 밝힌다.
- 같은 기록 안에서는 temperature 0 의 반복이 글자까지 같았다. 같은 설정으로 다시 기록하면 답은 같아도 글자가 달라진 예가 하나 있다(27주째 글의 p17). temperature 0.7 은 seed 를 고정해도 다시 기록할 때 답이 달라질 수 있다. 흔들림은 두 설정을 나란히 두어 측정한다.
- 가상 값은 글에서 한 번 「가상 데이터」라고 밝힌다. 설계 4절의 값을 그대로 쓴다. 회원 1,400만 명, 서연 씨 러닝화 캠페인(나이 25~39, 서울 경기, 하루 300만 원, 구매 1건 입찰 2만 원), 세그먼트 317(160만 명, 표본 2,000명 중 229명), Lookalike 6001 10%(140만 명, 표본 200명), 회원 A 와 B 의 30일 행동, 후보풀 캠페인 셋, 에이전트 과제 값(목표 ROAS 러닝화 400%, 여행사 300%, 객단가 12만 / 60만 / 8천 원, 입찰가 한 번에 20% 넘게 못 바꿈), LLM 요청 한 건 1,200 + 150 토큰, 가상 단가(작은 모델 입력 400원, 출력 1,600원, 큰 모델 4,000원, 20,000원, 100만 토큰당), 유저 벡터 64차원과 1,400만 명 3.58GB, 모델 서버 예산 8ms와 API 예산 12ms, 하루 노출 2억 2,800만, CPU 서버 시간당 480원(287 QPS)과 GPU 서버 3,800원(2,300 QPS), 광고주 자산 텍스트(200자, 쿠션 폼, 무게 240g, 입문자용, 카피 5개, 40자 상한, 금지어는 근거 없는 최상급), 학생 모델(로지스틱 회귀, 피처 6개, 경사 하강 200회), Semantic ID(상품 300건, 3단 코드북, 단마다 16개). 실제 상용 단가는 적지 않고 문서 링크로만.
- 민감한 예시는 건강 하나만 쓴다(Ruling: 묶음 2 Task 4). 종교, 소득, 정치, 성적 지향은 예시 요청, 키워드, 광고에 넣지 않는다. 시스템 메시지의 민감 정보 정의 줄은 자연어 오디언스 편의 문장을 그대로 둔다.
- 앞 글을 링크할 때는 `js/posts.js` 에서 id 를 확인한다. 문서와 API 를 서술할 때는 그 문서를 열어 본 문장만 쓴다.
- 회사 안 시스템 이름, 숫자, 문장, 사람 이름은 어디에도 넣지 않는다. 브랜드와 회사 이름이 필요한 자리는 가상 이름이다. 올리기 전에 `grep -rnE "$(grep -v '^#' $NAMES_FILE | tr '\n' '|' | sed 's/|$//')" posts/ docs/ js/ data/ scripts/ *.html` 이 0건이어야 한다(대소문자 구분). `NAMES_FILE` 은 저장소 밖에 둔 이름 목록 파일이다.
- 커밋은 `chkimsu` 계정(GitHub no-reply 메일)으로, 파일을 하나씩 명시한다. `git add -A` 금지. 커밋 메시지는 한국어 conventional commit. 구현자 커밋 꼬리는 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`(Sonnet 구현자는 `Claude Sonnet 5.5`).
- 새 파일은 `node scripts/check-wording.js` 에서 0건. 기준표(`scripts/wording-baseline.json`)는 Task 0 의 새 범주를 적는 것 말고는 늘리지 않는다.
- 각 Task 의 「엔트리와 검사 전부」 단계는 excerpt, worldNote, worldPractical 을 채운 뒤 검사 여섯(`validate-posts`, `check-content-standard <slug>`, `check-wording`, `check-code-blocks`, `check-python-outputs --post <slug>`, `test-long-sentences`), 기록이 있으면 `check-llm-constants` 와 그 생성기의 `--check`, 민감어 grep(`종교|소득|연봉|정치|religion|income` 0건), 이름 목록 grep(0건)을 말한다. 글머리표와 참고문헌 줄은 손으로 측정한다.
- 날짜는 글 N 이 2026-11-18 에서 N 일 뒤(글 1 은 11-19, 글 12 는 11-30, 글 13 은 12-01), 주 수는 글 N 이 `(27+N)주째`. `world: 'both'`, `series: 'llm-ads-track'`, 첫째 카테고리 `LLM & Agents`, 둘째 카테고리와 태그는 Task 마다 적었다.

## 모델 나누기 (컨트롤러가 디스패치마다 적용)

| 역할 | 모델 |
|---|---|
| Task 0 과 Task 14 의 기계적인 부분(시리즈, 단계, 검사기, 기록 도구, 데모 목록, 표지, 색인) | Sonnet |
| 글 산문과 파이썬, 기록 설계와 기록 실행, 데크(Task 1~13), 공용 생성기(Task 0), 놀이터 | Opus |
| 글 검토 | Opus |
| 고침 뒤 재검토, 작은 diff 검토 | Sonnet. Important 가 0 이면 재검토를 생략한다(Ruling B2-2). 산문만 고친 라운드와 스크립트로 다 확인되는 고침은 컨트롤러가 확인한다(Ruling B2-8, B2-9) |
| 마지막 브랜치 전체 검토 | Fable |

## Review Focus

- **공용 데이터가 글마다 달라지는 것.** 회원 2,000명과 키워드 120개는 글 2, 3, 4, 7 과 놀이터가 같은 값을 써야 한다. `gen-ads-data.py --check` 가 글의 `KEYWORDS` 리터럴, 프롬프트 파일, 놀이터 데이터 파일을 생성기와 글자까지 대조한다(Task 0 Step 4, Task 2~4, 7 의 `--check` 단계, Task 14 Step 1).
- **두 단계 기록의 뒤 프롬프트가 앞 기록과 맞지 않는 것.** 관심사 사전의 심판 프롬프트와 판정 체계의 캐스케이드 프롬프트는 생성기가 앞 기록에서 만들고 `--check` 가 다시 만들어 대조한다(Task 4 Step 4, Task 9 Step 4). 앞 기록에 error 가 남으면 뒤 프롬프트를 만들지 않는다.
- **잘린 답이 기록에서 빠지는 것.** 리스트 한 번에 30개를 맡기는 기록은 출력 상한에 걸려 잘린 답을 그대로 남겨야 한다. `allow_length` 가 그 답을 남기는지 도구 시험이 보고(Task 0 Step 5), 블록이 그 답을 「읽지 못한 답」으로 센다(Task 5 Step 6).
- **기록 출력의 한국어.** Task 8 의 `copy`, `quote` 말고는 0자다. 기록마다 `python3 -c` 로 outputs 의 한글 수를 센다(Task 1, 3, 4, 5, 9 의 기록 단계). Task 8, 9 의 글은 말투 검사 0건이다(Task 8 Step 7).
- **민감한 예시와 회사 이름.** 예시 요청과 키워드의 민감 정보는 건강뿐이고 브랜드는 가상 이름이다. 글마다 `grep -nE "종교|소득|연봉|정치|religion|income"` 이 0건인지 본다(각 Task 의 엔트리와 검사 단계).
- **기록 밖에서 센 수.** LLM 행동 숫자가 블록 출력에 없는데 산문에 있으면 고친다. 검토자는 산문의 숫자마다 블록 출력의 같은 값을 찾는다(모든 글 검토).
- **가짜 LLM 응답 꼴.** 묶음 2 의 꼴(`stop_reason`, content 블록 목록, `tool_use`, `tool_result`)을 그대로 쓴다. Task 10, 11 의 블록 출력에 그 필드 이름이 찍힌다(Task 10 Step 4, Task 11 Step 4).
- **놀이터 기본값과 글의 숫자.** 놀이터를 처음 열었을 때의 숫자가 글 2 의 블록 출력과 같아야 한다(Task 14 Step 1).

---

### Task 0: 공통 기반 — 트랙과 7단계, 공용 생성기, 기록 도구의 잘린 답, 어색한 낱말 검사

**Files:**
- Modify: `js/posts.js`(`series['llm-ads-track']`, `mlTrack.stages` 에 7단계)
- Modify: `js/topics.js`(`TRACK_ORDER` 의 `'llm-basics-track'` 뒤에 `'llm-ads-track'`)
- Create: `scripts/gen-ads-data.py`, `js/ads-users-data.js`(생성기가 쓴다)
- Modify: `scripts/llm-record.py`, `scripts/test-llm-record.py`, `data/llm-records/README.md`
- Modify: `scripts/check-wording.js`, `scripts/wording-baseline.json`
- Modify: `MARKDOWN_GUIDE.md`(「말투와 낱말」 절에 두 줄)
- Modify: `.github/workflows/validate.yml`(`gen-ads-data.py --check` 한 단계)
- Test: `node scripts/validate-posts.js`, `python3 scripts/gen-ads-data.py --check`, `python3 scripts/test-llm-record.py`, `node scripts/check-wording.js`, `node scripts/check-design.js`

**Interfaces:**
- Produces: `series['llm-ads-track'] = { title: 'LLM 광고 응용 트랙', desc, posts: [13개 id 설계 3-3절 순서] }`. `mlTrack.stages[6] = { id: 'stage-7', title: '7단계, LLM 광고 응용 — 자연어 타겟부터 에이전트까지', goal, posts: [13개 id] }`.
- Produces (`scripts/gen-ads-data.py`): `KEYWORDS`(아래), `ASSET_RUNNING`(서연 씨 러닝화 자산 텍스트, 200자 안팎, 문장 넷, 쿠션 폼과 무게 240g 과 입문자용이 든다), `make_members(n, seed=7)` 와 `ages`, `regions`(앞 글의 코드 그대로), `extend(members) -> members`(검색 기록과 다음 30일 구매), `user_doc(m) -> str`. CLI `--json keywords`, `--json summary`, `--write`, `--check`. 뒤 Task 가 자기 프롬프트 빌더와 대조 항목을 이 스크립트에 더한다(Task 3, 4).
- Produces (기록 도구): 프롬프트 파일 키 `allow_length`. 참이면 done_reason 이 `length` 인 답을 error 로 두지 않고 기록하고 그 항목에만 `"done_reason": "length"` 를 둔다.

`KEYWORDS`: 120개, 항목 `("k001", "러닝화", "running", "direct", 52000)` 꼴의 튜플(id, 검색어, 주제, 전략, 하루 검색 수). 한 줄에 여러 항목을 넣어 글 블록에 그대로 옮길 수 있게 쓴다. 주제는 관심사 글 200건의 라벨 8개(running, camping, travel, cafe, parenting, finance, game, beauty)와 `health`(민감, 거를 대상), `noise`(상업 의도 없음, 예: 날씨, 뉴스). 개수는 running 40, 다른 일곱 주제 합 60, health 6, noise 14. 전략은 서연 씨 러닝화 광고 기준의 가상 정답이다. `direct`, `category`, `co_purchase`, `problem_goal`, `persona`, `brand`, `product_line` 일곱과 `none`. running 40개가 전략 일곱에 4~8개씩 나뉘고, problem_goal 에는 health 키워드와 이웃한 것(무릎 보호대처럼 상품인 것)과 health 자체(무릎 통증처럼 증상인 것)가 같이 있게 한다. brand 의 브랜드는 가상 이름이다. 하루 검색 수는 300~60,000 의 정수다.

회원: `posts/user-profile-features.md` 의 `KEYS`, `MEMBER_A`, `MEMBER_B`, `TENDENCY`, `make_members` 와 `posts/natural-language-audience.md` 의 `ages`, `regions` 를 글자 그대로 복사해 같은 2,000명을 만든다(세그먼트 317 은 229명). `extend` 는 그 뒤에 따로 만든 `random.Random(7)` 로 회원마다 `searches`(키워드 id → 30일 검색 횟수)와 `buys_next_30d`(다음 30일 러닝화 구매, 가상 정답)를 붙인다. 규칙: `search_running_shoes` 의 사건 수는 k001 의 횟수와 같다. `camping_search` 의 사건 수는 camping 키워드들에 나눈다. 러닝 성향 회원(세그먼트 317)은 running 키워드를, `travel_posts`, `cafe_posts`, `camping_posts` 가 있는 회원은 그 주제 키워드를 더 검색하고, 모두가 noise 를 조금 검색한다. 회원 A 와 B 는 설계 4절의 행동만 갖는다(더한 검색 없음). `buys_next_30d` 는 러닝 성향이면서 최근 사건이 많을수록 확률이 크고, 나머지는 작다. 구매자 수는 생성기 출력대로 쓴다.

`user_doc(m)`: 검색어는 그 문자열을 횟수만큼, 행동 필드는 낱말 하나(`러닝글`, `운동앱`, `운동용품구매`, `여행글`, `카페글`, `캠핑글`)를 횟수만큼 공백으로 잇는다. 낱말 나누기는 공백이다. 회원 A 의 문서는 러닝화 12, 운동앱 8, 러닝글 9, 운동용품구매 1, 여행글 4, 카페글 3 이다.

`--write` 는 `js/ads-users-data.js` 에 `window.ADS_USERS = {...}` 한 줄을 쓴다. keywords 는 `[id, 검색어, 주제, 하루 검색 수]`, members 는 `[세그먼트 317 여부 0|1, 구매 0|1, [[키워드 번호, 횟수], ...], [행동 필드 8개의 횟수]]` 이고 300KB 이하다. `--check` 는 (1) 그 파일이 지금 생성 결과와 같은지, (2) `posts/` 에서 `KEYWORDS = [` 리터럴을 가진 글이 스크립트의 리터럴과 글자까지 같은지, (3) 뒤 Task 가 등록한 프롬프트 파일이 있으면 그 `items[].user` 가 생성 결과와 같은지 보고, 몇 건 대조했는지 찍는다. 없는 파일은 건너뛴다.

- [ ] **Step 1: 지금 상태** — Run: `node scripts/validate-posts.js && node -e "const m=require('./js/posts.js');console.log(Object.keys(m.series).length, m.mlTrack.stages.length)"` Expected: 통과, `15 6`.
- [ ] **Step 2: 트랙과 단계** — `series` 의 `'llm-basics-track'` 바로 뒤에 `'llm-ads-track'`. desc 「지훈 씨가 28주째부터 서연 씨 캠페인에 LLM 을 붙입니다. 타겟 조건, 유저 검색, 키워드, 라벨과 랭커, 카피와 판정, 에이전트를 한 주에 하나씩 엽니다」. posts 는 `nl-to-targeting-query, users-as-documents, keyword-expansion-strategies, interest-audience-library, llm-labels-code-ranker, llm-labeling-distillation, llm-user-embedding-features, grounded-ad-copy-generation, generated-copy-judging-system, advertiser-agent-mcp, workflow-vs-autonomous-loop, generative-retrieval-semantic-id, coding-agent-experiments`. 7단계 goal 「이 단계를 마치면: 자연어 요청을 조건과 명단으로 바꾸고, 키워드와 오디언스를 LLM 으로 넓힐 수 있습니다. LLM 라벨로 랭커와 학생 모델을 만들고, 카피를 쓰고 판정할 수 있습니다.」(문장마다 80자 이하). `TRACK_ORDER` 에 `'llm-ads-track'`.
- [ ] **Step 3: 없는 글 열셋을 잡는지** — Run: `node scripts/validate-posts.js; echo exit=$?` Expected: series 의 글 13개가 없다는 오류로 exit 1, 열세 id 가 다 나온다.
- [ ] **Step 4: 공용 생성기** — 위 사양대로. Run: `python3 scripts/gen-ads-data.py --json summary` Expected: 회원 2000, 세그먼트 317 229, 키워드 120(주제별 수가 위와 같음), 회원 A 와 B 의 문서 낱말 수가 위와 같음, 구매자 수 한 줄. `python3 scripts/gen-ads-data.py --write && python3 scripts/gen-ads-data.py --check` Expected: 통과, 「대조 1건」(데이터 파일). `ls -l js/ads-users-data.js` 가 300KB 이하. 회원 2,000명의 `KEYS` 횟수가 `posts/user-profile-features.md` 블록이 만든 것과 같은지 그 글의 생성 코드를 따로 돌려 비교하고 보고서에 적는다.
- [ ] **Step 5: 기록 도구의 잘린 답** — 시험 먼저: `scripts/test-llm-record.py` 에 `test_allow_length_keeps_cut_answer`(가짜 서버가 `done_reason: "length"` 를 돌려주고 프롬프트에 `allow_length: true` 가 있으면 항목에 error 가 없고 `done_reason == "length"`, output 은 받은 글자 그대로)와 `test_cut_answer_is_error_without_allow_length`(같은 응답에 키가 없으면 지금처럼 error)를 더해 실패를 본다. 그다음 `llm-record.py` 의 프롬프트 검사(PROMPT_KEYS)와 기록 쓰기에 키를 더한다. `--export-constant` 는 이 항목도 RECORD 에 넣는다. Run: `python3 scripts/test-llm-record.py` Expected: 80개 통과(78 + 2). README 의 프롬프트 필드 표에 `allow_length` 한 줄.
- [ ] **Step 6: 어색한 낱말 검사** — `check-wording.js` RULES 끝에 `{ key: 'awkward', label: '어색한 낱말', re: /얹[습는어었고은]|가립니다|가린다|가리기 때문|굳은 |품습니다|줄을 세[우웠워]|순으로 세워|견줍니다|훑습니다|훑어 |실어 보|실려 온/g, fix: '추가하다, 숨기다, 고정된, 처리하다, 정렬하다, 비교하다, 스캔하다, 담아 보내다' }`. `node scripts/check-wording.js --update` 뒤 `git diff scripts/wording-baseline.json` 에서 늘어난 것이 `awkward` 값뿐인지 본다. Run: `node scripts/check-wording.js && node scripts/check-wording.js --list awkward | tail -1` Expected: 통과, 옛 글의 수가 한 줄로 찍힘(170곳 안팎).
- [ ] **Step 7: 글 규칙 두 줄** — `MARKDOWN_GUIDE.md` 의 「말투와 낱말」 절에 (1) 결론 목록은 `**제목.** 설명` 꼴이고 제목은 원래 말투를 그대로 둔다, (2) 어색한 낱말과 바꿀 말(위 Global Constraints 의 목록)을 더한다. validate.yml 의 `gen-judge-pairs.py --check` 옆에 `python3 scripts/gen-ads-data.py --check`.
- [ ] **Step 8: 디자인과 말투 게이트** — Run: `node scripts/check-design.js && node scripts/check-wording.js && node scripts/test-long-sentences.js` Expected: 통과.
- [ ] **Step 9: 커밋** — 파일을 이름으로. `feat(tracks): LLM 광고 응용 트랙과 7단계, 공용 회원과 키워드 생성기, 기록 도구의 잘린 답, 어색한 낱말 검사`. (validate-posts 가 글 열셋이 없다고 실패하는 상태로 커밋해도 된다.)

---

### Task 1: 자연어 → 타겟 조건 (`nl-to-targeting-query`, 28주째, 2026-11-19)

**Files:**
- Create: `posts/nl-to-targeting-query.md`, `demo-nl-query-cards.html`, `js/nl-query-cards-demo.js`, `scripts/gen-nl-requests.py`
- Create: `data/llm-records/prompts/nl-to-targeting-query-oneshot.json`, `-verdict.json`, `-extract.json` 와 같은 이름의 기록 셋
- Modify: `js/posts.js`, `js/demo-edu-content.js`, `.github/workflows/validate.yml`(`gen-nl-requests.py --check`)
- Test: 검사 여섯(`validate-posts`, `check-content-standard <slug>`, `check-wording`, `check-code-blocks`, `check-python-outputs --post <slug>` 두 번, `test-long-sentences`) + `check-llm-constants` + `gen-nl-requests.py --check`

**Interfaces:**
- Consumes: 자연어 오디언스 편(18주째)의 필드 10개와 reason_code 넷(시스템 메시지 문장 그대로), Task 0 의 회원 2,000명과 `ages`, `regions`.
- Produces: `REQUESTS`(30개, 항목마다 id, 한국어 요청, 정답 verdict, 정답 reason_code, 정답 conditions), `to_query(conditions) -> str`(코드가 쓰는 쿼리 문자열), `audience_size(conditions, members) -> int`, `TEMPLATES`(reason_code → 고정 한국어 답). Task 11 은 `nl-to-targeting-query-verdict` 의 USAGE 를 호출 한 번의 시간으로 쓴다.

요청 30개(`scripts/gen-nl-requests.py` 의 리터럴): supported 12, partial 10, unsupported 8(sensitive_attribute 2 는 둘 다 건강, unknown_field 3, exposure_history_unavailable 3). 앞 세 개는 자연어 오디언스 편의 요청 셋을 글자 그대로 쓴다. 정답 conditions 는 필드 10개로 적는다.

기록 셋, 모두 think 끔, temperature 0, 요청 30개씩: (1) `-oneshot` 은 자연어 오디언스 편의 시스템 메시지 그대로(판정과 조건을 한 번에). (2) `-verdict` 는 판정만(`{"verdict": "...", "reason_code": "..."}`). (3) `-extract` 는 조건만(`{"conditions": [...], "unsupported_parts": ["..."]}`). 워크플로 코드는 (2) 가 supported 나 partial 로 낸 요청에만 (3) 의 답을 쓴다. 기록은 30개를 다 해 두어 앞뒤 기록이 서로 기대지 않게 한다.

파이썬 셋(이어서): (1) `-oneshot` 기록 상수로 판정 정답 수와 reason_code 정답 수, 조건 필드 단위 맞은 수. (2) `-verdict` 기록 상수로 같은 판정 정답 수와 혼동표(정답 셋 × 답 셋). (3) `-extract` 기록 상수로 워크플로의 조건 맞은 수, `to_query` 가 쓴 쿼리 세 줄, 회원 2,000명에서 센 `audience_size`(1,400만 명으로 늘린 값을 함께), 일부 지원과 불가의 고정 답 `TEMPLATES` 대응. 쿼리는 LLM 이 쓰지 않고 코드가 필드 이름과 비교 연산을 허용 목록으로 확인한 뒤 쓴다.

데크(`nq-`, 4장): `steps` 의도 → 조건 → 쿼리 → 명단 / `verdict` 판정 셋의 혼동표 / `query` 조건 JSON → 코드가 쓴 쿼리 → 회원 수 / `reply` reason_code → 고정 템플릿.

절: 1 한 번에 하던 변환을 단계로 나눕니다(표: 단계, 입력, 출력, 맡는 것(LLM 또는 코드), 카드 steps) / 2 첫 단계는 판정입니다(파이썬 1, 2, 카드 verdict) / 3 조건은 필드 이름과 값만 받습니다(파이썬 3 앞부분, 표: 필드 단위 맞은 수) / 4 쿼리는 코드가 씁니다(파이썬 3 뒷부분, 카드 query) / 5 거절과 일부 지원은 고정 템플릿으로 답합니다(표: reason_code 와 「」 대사, 카드 reply) / 6 두 무대 / 한눈 정리 / 헷갈리기 쉬운 점(불가도 정상 답이다, 민감 정보는 비슷한 행동 필드로 바꿔 옮기지도 않는다, LLM 이 쿼리를 쓰게 하지 않는 이유) / 더 깊이 보기(시스템 메시지 셋 전문, 템플릿 전문) / 참고문헌(구조화 출력 공식 문서 둘, Text-to-SQL 공개 논문 하나, 광고 플랫폼의 민감 카테고리 정책 문서 하나. 열어 본 것만).

카테고리 `LLM & Agents`, `Targeting & Audience`. 태그 `LLM`, `Targeting`, `Prompting`.

- [ ] Step 1 스캐폴드 `node scripts/new-post.js nl-to-targeting-query "자연어 → 타겟 조건: 의도 분류와 조건 추출로 쿼리를 만드는 워크플로" "LLM & Agents" "LLM,Targeting,Prompting" both`, 날짜와 series, 둘째 카테고리 → Step 2 생성기와 프롬프트 파일 셋(`--check` 는 프롬프트의 user 가 리터럴과 같은지, 글의 `REQUESTS = [` 가 리터럴과 같은지 본다) → Step 3 기록 셋(각 30개, error 0, outputs 한글 0자) → Step 4 데크(`nq-`, `'nl-query-cards'`) → Step 5 글 본문(도입은 지훈 씨가 28주째에 서연 씨의 요청 30개를 받는 장면, 18주째 자연어 오디언스 편을 한 문장으로 잇는다) → Step 6 출력 두 번 통과, 상수 검사(기록 셋) → Step 7 엔트리와 검사 전부, 민감어 grep → Step 8 커밋 `feat(posts): 자연어 → 타겟 조건 — 의도 분류와 조건 추출로 쿼리를 만드는 워크플로. 기록 90건`.

---

### Task 2: 유저를 문서로 (`users-as-documents`, 29주째, 2026-11-20)

**Files:**
- Create: `posts/users-as-documents.md`, `demo-user-docs-cards.html`, `js/user-docs-cards-demo.js`
- Modify: `js/posts.js`, `js/demo-edu-content.js`
- Test: 검사 여섯 + `gen-ads-data.py --check`(글의 `KEYWORDS` 리터럴 대조가 1건 늘어난다)

**Interfaces:**
- Consumes: Task 0 의 `KEYWORDS`, `make_members`, `extend`, `user_doc`(블록에 복사), Elasticsearch 편의 RRF(두 목록용이라 여러 목록용으로 다시 쓴다).
- Produces: `bm25_scores(query_terms, docs, k1=1.2, b=0.75) -> list[float]`, `rrf(ranked_lists, k=60) -> list[int]`, 전략 셋의 질의(`direct`, `category`, `co_purchase` 전략 정답 키워드의 검색어), 자르는 수 200(표본의 10%, Lookalike 6001 과 같은 몫). Task 14 의 놀이터가 같은 기본값을 쓴다.

파이썬 셋(이어서): (1) 회원 2,000명과 문서를 만들고 회원 A 의 문서(낱말과 횟수), 문서 길이의 평균과 최댓값. (2) 전략 셋의 질의로 BM25 를 돌려 목록마다 상위 5명, RRF 로 합쳐 200명에서 자른다. 회원 A 의 순위, 회원 B 가 없는 것. (3) 세그먼트 317(229명)과 검색 200명을 나란히: 크기, 겹치는 수, 다음 30일 구매자 수와 그 비율, 세그먼트에 없는데 검색에 든 사람 수.

데크(`ud-`, 4장): `doc` 회원 A 가 글 한 편이 되는 그림 / `bm25` 질의 낱말과 문서 점수 / `rrf` 목록 셋을 순위로 합치기 / `cut` 200명과 세그먼트 317 의 겹침.

절: 1 세그먼트는 규칙이고 검색은 낱말입니다(표) / 2 회원 한 명을 글 한 편으로 씁니다(파이썬 1, 카드 doc) / 3 광고 키워드로 BM25 검색을 합니다(파이썬 2 앞부분, 카드 bm25) / 4 전략별 목록을 RRF 로 합치고 200명에서 자릅니다(파이썬 2 뒷부분, 카드 rrf) / 5 세그먼트 317 과 나란히 봅니다(파이썬 3, 표, 카드 cut) / 6 이 색인이 뒤 글에서 쓰이는 자리(표: 키워드 확장, 관심사 사전, 유저 벡터) / 7 두 무대 / 한눈 정리 / 헷갈리기 쉬운 점(문서는 사람이 쓴 글이 아니라 행동을 이은 낱말이다, BM25 점수는 같은 질의 안에서만 비교한다, 자르는 수는 예산과 도달로 정한다) / 더 깊이 보기(BM25 식, RRF 식) / 참고문헌(Robertson and Zaragoza 2009 BM25, Cormack et al. 2009 RRF, Elasticsearch similarity 문서).

카테고리 `LLM & Agents`, `Targeting & Audience`. 태그 `Targeting`, `Segmentation`, `Elasticsearch`.

- [ ] Step 1 스캐폴드(11-20) → Step 2 데크(`ud-`, `'user-docs-cards'`) → Step 3 글 본문(블록 셋 이어서, 블록 1 이 생성 코드와 `KEYWORDS` 리터럴을 글자 그대로 담는다) → Step 4 출력 두 번 통과, `gen-ads-data.py --check` 가 이 글을 대조 → Step 5 엔트리와 검사 전부 → Step 6 커밋 `feat(posts): 유저를 문서로 — 광고 키워드로 사람을 검색하는 역방향 검색`.

---

### Task 3: 키워드 확장 전략 (`keyword-expansion-strategies`, 30주째, 2026-11-21)

**Files:**
- Create: `posts/keyword-expansion-strategies.md`, `demo-keyword-expansion-cards.html`, `js/keyword-expansion-cards-demo.js`
- Create: `data/llm-records/prompts/keyword-expansion-strategies-all.json`, `-each.json` 와 기록 둘
- Modify: `scripts/gen-ads-data.py`(두 프롬프트 파일의 빌더와 대조), `js/posts.js`, `js/demo-edu-content.js`
- Test: 검사 여섯 + 기록 둘 + `gen-ads-data.py --check`

**Interfaces:**
- Consumes: Task 0 의 `KEYWORDS`(전략 정답, health, 하루 검색 수)와 `ASSET_RUNNING`.
- Produces: 전략 일곱의 영어 이름과 한 줄 정의, 정책 거르기 `policy_filter(ids) -> (kept, dropped_by_reason)`. Task 4 가 같은 거르기 기준(health 는 민감, noise 는 상업 의도 없음)을 쓴다.

자유 생성 대신 사전에서 고르게 한다. 검색 광고는 검색량이 있는 키워드만 살 수 있고, 고른 id 로 코드가 정답과 검색 수를 셀 수 있기 때문이다. 사용자 메시지는 `ASSET_RUNNING` 과 키워드 120개 목록(`k001 러닝화` 꼴 한 줄씩). 출력은 `{"picks": [{"strategy": "<전략>", "ids": ["k001", ...], "reason": "<영어 짧은 구, 6낱말 이하>"}]}`.

기록 둘: (1) `-all` 은 한 번에 일곱 전략, 항목 1개, `think: "both"` 로 2개. (2) `-each` 는 전략마다 따로 7개, `think: "both"` 로 14개. 두 파일의 user 는 생성기가 쓴다.

파이썬 셋(이어서): (1) `-all` 기록 상수로 전략마다 고른 수, 정답 전략과 맞은 수, health 와 noise 를 고른 수, 서로 다른 키워드 수와 하루 검색 수 합. (2) `-each` 기록 상수로 같은 표와 전략 사이에 겹친 id 수, think 끔과 켬의 출력 토큰과 시간(USAGE). (3) 코드 거르기: health 와 noise 를 빼고 전략 사이 겹침을 하나로 남긴 최종 목록의 수와 하루 검색 수 합, 빠진 이유별 수.

데크(`ke-`, 4장): `strategies` 전략 일곱과 예 / `one_vs_each` 한 번과 일곱 번 / `overlap` 전략 사이 겹침 / `filter` 정책 거르기와 겹침 빼기.

절: 1 광고 하나에서 출발하는 전략 일곱(표, 카드 strategies) / 2 만들게 하지 않고 사전에서 고르게 합니다(표: 자유 생성과 사전 선택) / 3 한 번에 일곱 전략을 맡기면(파이썬 1) / 4 전략마다 따로 부르면(파이썬 2, 카드 one_vs_each, overlap) / 5 정책 거르기와 겹침 빼기는 코드가 합니다(파이썬 3, 카드 filter) / 6 두 무대 / 한눈 정리 / 헷갈리기 쉬운 점(문제와 목표 전략은 건강 키워드를 끌어온다, 이유 구절은 사람이 확인하는 값이다, 검색 수 합은 도달이 아니다) / 더 깊이 보기(시스템 메시지 둘 전문) / 참고문헌(Jagerman et al. 2023 Query Expansion by Prompting LLMs, 검색 광고 키워드 일치 유형 문서, 맞춤 광고의 건강 정책 문서. 열어 본 것만).

카테고리 `LLM & Agents`, `Targeting & Audience`. 태그 `LLM`, `Prompting`, `Targeting`.

- [ ] Step 1 스캐폴드(11-21) → Step 2 생성기에 빌더 둘과 대조 → Step 3 기록 둘(2 + 14개, error 0, 한글 0자, 출력 id 가 모두 사전 안인지) → Step 4 데크(`ke-`, `'keyword-expansion-cards'`) → Step 5 글 본문 → Step 6 출력 두 번 통과, 상수 검사 → Step 7 엔트리와 검사 전부 → Step 8 커밋 `feat(posts): 키워드 확장 전략 — 광고 하나에서 전략 일곱으로 키워드를 넓히기. 기록 16건`.

---

### Task 4: 관심사 사전 만들기 (`interest-audience-library`, 31주째, 2026-11-22)

**Files:**
- Create: `posts/interest-audience-library.md`, `demo-interest-library-cards.html`, `js/interest-library-cards-demo.js`
- Create: `data/llm-records/prompts/interest-audience-library-voters.json`, `-referee.json`, `-groups.json` 와 기록 셋
- Modify: `scripts/gen-ads-data.py`(빌더 셋, 심판 빌더는 voters 기록을 읽는다), `js/posts.js`, `js/demo-edu-content.js`
- Test: 검사 여섯 + 기록 셋 + `gen-ads-data.py --check`

**Interfaces:**
- Consumes: Task 0 의 `KEYWORDS`, 회원과 `searches`, Task 3 의 거르기 기준.
- Produces: 투표 규칙(두 답이 같으면 그대로, 다르거나 읽지 못하면 심판), 다시 나누기와 합치기 규칙, 최소 크기 20명(표본의 1%, 1,400만 명이면 14만 명). Task 13 이 이 Task 의 기록 과정을 세션 발췌로 쓴다.

단계 다섯: 거르기(LLM 투표) → 심판(답이 다른 것만) → 묶기(LLM 이 이름을 붙임) → 다시 나누기와 합치기(코드) → 최소 크기(코드, 회원 수).

기록 셋: (1) `-voters` 는 키워드 120개를 20개씩 6묶음, 출력 `{"decisions": [{"id": "k001", "keep": true, "reason_code": "<commercial_interest|sensitive_health|no_commercial_intent|too_broad>"}]}`. 맨 위 temperature 0 이 투표자 A(run 1), `repeat_subset` 으로 6묶음 모두 temperature 0.7 한 번이 투표자 B(run 2). 12개. (2) `-referee` 는 생성기가 voters 기록에서 두 답이 다르거나 읽지 못한 키워드만 20개씩 묶어 쓴다. think 켬, temperature 0. 개수는 기록대로. 다른 답이 0개면 referee 프롬프트와 기록을 만들지 않고 블록과 글이 「심판 0번」을 적는다. (3) `-groups` 는 투표와 심판을 거쳐 남은 키워드를 한 번에 주고 `{"groups": [{"name": "<영어 snake_case>", "ids": [...]}]}`, think 끔. 1개.

파이썬 셋(이어서): (1) voters 기록 상수로 두 투표가 같은 수와 다른 키워드 id, 읽지 못한 답. (2) referee 기록 상수로 최종 남김과 거름, 정답 주제(health 와 noise 는 거름)와 맞은 수, 비용 비교(USAGE 의 출력 토큰과 시간: 투표 둘 + 심판 일부, 그리고 심판 하나로 120개를 다 볼 때의 어림을 「심판의 키워드당 토큰 × 120」으로 가정을 밝혀 센다). (3) groups 기록 상수로 묶음마다 회원 수(그 묶음 키워드를 한 번 이상 검색한 회원), 정답 주제 순도, 한 묶음이 남은 키워드의 절반을 넘으면 정답과 무관하게 코드가 둘로 나누는 규칙, 20명 미만을 이웃 묶음에 합치거나 버리는 규칙, 최종 사전(이름, 키워드 수, 회원 수, 1,400만 명으로 늘린 수).

데크(`il-`, 5장): `filter` 다섯 단계 / `vote` 두 번 묻기 / `referee` 답이 다른 것만 심판 / `group` 이름 붙이기와 다시 나누기 / `size` 최소 크기.

절: 1 로그 키워드 120개가 이름 붙은 오디언스가 되기까지(표, 카드 filter) / 2 거르기는 두 번 묻고 같으면 그대로 둡니다(파이썬 1, 카드 vote) / 3 답이 다른 것만 심판에게 보냅니다(파이썬 2, 카드 referee) / 4 묶고 이름을 붙이는 것은 LLM, 다시 나누고 합치는 것은 코드입니다(파이썬 3, 카드 group) / 5 최소 크기 아래는 오디언스가 아닙니다(표, 카드 size) / 6 두 무대 / 한눈 정리 / 헷갈리기 쉬운 점(투표자 둘이 같은 모델이면 같은 실수를 같이 한다, 심판 비용은 다른 답의 비율이 정한다, 이름은 LLM 이 붙여도 크기는 회원 수로 센다) / 더 깊이 보기(투표와 심판 규칙 전문, 다시 나누기 규칙) / 참고문헌(Wan et al. 2024 TnT-LLM, Wang et al. 2022 Self-Consistency, Chen et al. 2023 FrugalGPT, IAB Audience Taxonomy 문서).

카테고리 `LLM & Agents`, `Targeting & Audience`. 태그 `LLM`, `Segmentation`, `LLM Evaluation`.

- [ ] Step 1 스캐폴드(11-22) → Step 2 voters 빌더와 기록(12개, error 0, 한글 0자) → Step 3 referee 빌더 실행(다른 답 목록을 보고서에 적음)과 기록(think 켬) → Step 4 groups 빌더와 기록, `gen-ads-data.py --check` 가 셋을 대조(referee 는 voters 기록에서 다시 만들어 대조) → Step 5 데크(`il-`, `'interest-library-cards'`) → Step 6 글 본문 → Step 7 출력 두 번 통과, 상수 검사 → Step 8 엔트리와 검사 전부 → Step 9 커밋 `feat(posts): 관심사 사전 만들기 — 로그 키워드가 이름 붙은 오디언스가 되기까지. 기록 두 단계`. 구현자는 명령과 출력의 순서를 보고서에 그대로 적는다(Task 13 의 발췌 재료).

---

### Task 5: LLM 라벨과 코드 랭커 (`llm-labels-code-ranker`, 32주째, 2026-11-23)

**Files:**
- Create: `posts/llm-labels-code-ranker.md`, `demo-label-ranker-cards.html`, `js/label-ranker-cards-demo.js`, `scripts/gen-ranker-data.py`
- Create: `data/llm-records/prompts/llm-labels-code-ranker.json`, `llm-labels-code-ranker-listwise.json` 와 기록 둘
- Modify: `js/posts.js`, `js/demo-edu-content.js`, `.github/workflows/validate.yml`(`gen-ranker-data.py --check`)
- Test: 검사 여섯 + 기록 둘 + `--check`

**Interfaces:**
- Consumes: LLM-as-a-Judge 편의 `cohen_kappa(a, b)`(복사), Task 0 의 `allow_length`.
- Produces: 후보 30개(`CANDIDATES`: id `a01`~`a30`, 한국어 상품 문장 셋 `s1`~`s3`, pCTR, 입찰가 원, 정답 라벨), 라벨 가중치(high 1.0, mid 0.5, low 0.1, exclude 0), `rank(labels, candidates, top=5)`. Task 6 이 이 기록의 RECORD 와 USAGE 를 교사 30건의 값으로 쓴다.

질의는 「러닝화 추천」 하나. 후보 30개의 정답 라벨은 high 6, mid 8, low 10, exclude 6(가상). a01 은 서연 씨 러닝화. exclude 는 질의와 무관하거나 근거 없는 효능을 내세우는 광고이고 건강 효능은 넣지 않는다.

기록 둘: (1) 포인트와이즈 30개, think 끔. 출력 `{"label": "<high|mid|low|exclude>", "reason_code": "<exact_match|related_use|weak_relation|off_topic|policy_risk>", "evidence": ["s1"]}`. (2) 리스트와이즈 1항목(후보 30개를 한 번에, `{"ranking": [{"id": "a01", "label": "...", "evidence": [...]}]}`). run 1 은 상한 없이, `repeat_subset` 의 options `{"num_predict": 400}` 이 run 2. 파일에 `allow_length: true`. 2개. run 2 가 400 토큰 안에 끝나 잘리지 않으면 기록대로 적는다.

파이썬 셋(이어서): (1) 포인트와이즈 기록 상수로 정답 라벨과 맞은 수, 혼동표, kappa, evidence 가 그 후보의 문장 id 안인지. (2) 코드 랭커: 점수 = 가중치 × pCTR × 입찰가. 상위 5개와 근거 문장(노출되는 5개만 문장을 붙인다), 라벨 없이 pCTR × 입찰가로만 정렬했을 때 상위 5개와 바뀐 수. (3) 리스트와이즈 기록 상수로 run 1 의 빠진 id, 겹친 id, 사전 밖 id, run 2 가 읽지 못한 답이 되었는지(잘린 출력의 끝 글자 수), USAGE 로 포인트와이즈 30번 합과 리스트 한 번의 출력 토큰과 시간.

데크(`lr-`, 4장): `label` 후보 하나에 라벨 하나 / `rank` 순위는 코드가 섞는다 / `evidence` 근거는 노출된 것에만 / `listwise` 한 번에 다 맡기면 잘리는 자리.

절: 1 판정은 LLM, 순위는 코드(표, 카드 label) / 2 후보마다 라벨과 이유 코드를 받습니다(파이썬 1) / 3 순위는 상업 가치와 섞어 코드가 정합니다(파이썬 2, 카드 rank) / 4 근거 문장은 노출된 광고에만 붙입니다(표: 근거를 다 만들 때와 5개만 만들 때의 출력 토큰, 카드 evidence) / 5 한 번에 30개를 맡기면(파이썬 3, 카드 listwise) / 6 두 무대 / 한눈 정리 / 헷갈리기 쉬운 점(LLM 순위와 광고 순위는 목적이 다르다, 잘린 JSON 은 틀린 답과 같다, 이유 코드는 사람이 확인하려고 받는다) / 더 깊이 보기(점수 식, 가중치를 정하는 법) / 참고문헌(Sun et al. 2023 RankGPT, Qin et al. 2023 Pairwise Ranking Prompting, Thomas et al. 2023 LLM relevance labels, Liu et al. 2023 Lost in the Middle).

카테고리 `LLM & Agents`, `Measurement & Modeling`. 태그 `LLM`, `Ad Ranking`, `LLM Evaluation`.

- [ ] Step 1 스캐폴드(11-23) → Step 2 생성기(`--check` 는 프롬프트 user 와 글의 `CANDIDATES = [` 리터럴 대조) → Step 3 기록 둘(32개, error 0, 한글 0자, run 2 에 `done_reason` 이 남았는지) → Step 4 데크(`lr-`, `'label-ranker-cards'`) → Step 5 글 본문 → Step 6 출력 두 번 통과(잘린 답이 「읽지 못한 답」 한 줄로 찍힘), 상수 검사 → Step 7 엔트리와 검사 전부 → Step 8 커밋 `feat(posts): LLM 라벨과 코드 랭커 — 판정은 LLM 이, 순위는 코드가. 기록 32건`.

---

### Task 6: LLM 라벨링과 증류 (`llm-labeling-distillation`, 33주째, 2026-11-24)

**Files:**
- Create: `posts/llm-labeling-distillation.md`, `demo-distillation-cards.html`, `js/distillation-cards-demo.js`
- Modify: `js/posts.js`, `js/demo-edu-content.js`
- Test: 검사 여섯 + 상수 검사

**Interfaces:**
- Consumes: Task 5 의 기록(`--with-usage`), `cohen_kappa`, 설계 4절의 학생 모델과 가상 단가와 CPU 서버 값.
- Produces: 교사와 학생의 비용표 꼴(라벨 100만 건의 원, 건당 시간). Task 7 이 증류를 링크한다.

파이썬 셋(이어서): (1) Task 5 기록 상수(RECORD, USAGE)로 진짜 교사 30건의 건당 입력과 출력 토큰, 시간의 평균과 가상 단가로 센 라벨 100만 건의 값. 이어서 가짜 교사(규칙 + 5% 뒤집기, 「가짜 교사」라고 밝힘)가 (질의, 광고) 1만 쌍에 라벨을 붙인다. 피처 여섯은 질의와 광고의 낱말 겹침, 카테고리 일치, 가격대, pCTR, 브랜드 일치, 문장 길이. (2) 학생 로지스틱 회귀(피처 6개, 경사 하강 200회, 학습 8,000 / 시험 2,000)의 교사 일치율과 kappa, 가중치 여섯. 실무의 LightGBM 학습 코드는 이 글의 발췌 한 번으로 보인다(설계 4절). (3) 비용과 시간 표(교사는 USAGE 평균, 학생은 CPU 서버 287 QPS 와 시간당 480원으로 센 100만 건의 값)와 성과 라벨과의 차이(가짜 클릭은 관련성 말고 가격과 브랜드에도 기대게 만들고, 교사 라벨과 클릭이 다른 비율, 학생과 클릭의 일치율).

데크(`ds-`, 4장): `teacher_student` 교사 라벨로 학생 학습 / `agreement` 일치율과 kappa / `cost` 라벨 100만 건의 값과 시간 / `click_gap` 관련성 라벨과 클릭의 차이.

절: 1 라벨 1만 건을 LLM 에 맡기면 드는 값(파이썬 1 앞부분, 표) / 2 교사 라벨로 학생을 학습합니다(파이썬 1 뒷부분과 2, 카드 teacher_student) / 3 학생은 교사와 얼마나 맞나(표, 카드 agreement) / 4 서빙은 학생이 합니다(파이썬 3 앞부분, 카드 cost) / 5 관련성 라벨과 성과 라벨은 다릅니다(파이썬 3 뒷부분, 카드 click_gap) / 6 두 무대 / 한눈 정리 / 헷갈리기 쉬운 점(학생이 교사를 넘을 수 없는 이유, 교사 라벨의 흔들림도 학습된다, 증류한 모델은 교사가 바뀌면 다시 학습한다) / 더 깊이 보기(로지스틱 회귀 갱신 식, 소프트 라벨 한 문단) / 참고문헌(Hinton et al. 2015 Distilling the Knowledge, Hsieh et al. 2023 Distilling step-by-step, Thomas et al. 2023 LLM relevance labels).

카테고리 `LLM & Agents`, `Measurement & Modeling`. 태그 `LLM`, `Fine-tuning`, `Ad Ranking`.

- [ ] Step 1 스캐폴드(11-24) → Step 2 데크(`ds-`, `'distillation-cards'`) → Step 3 글 본문(블록 1 이 Task 5 의 기록 상수) → Step 4 출력 두 번 통과(블록 실행 10초 안), 상수 검사 → Step 5 엔트리와 검사 전부 → Step 6 커밋 `feat(posts): LLM 라벨링과 증류 — 관련성 라벨 1만 건으로 작은 랭커를 학습하기`.

---

### Task 7: LLM 유저 임베딩을 pCTR 피처로 (`llm-user-embedding-features`, 34주째, 2026-11-25)

**Files:**
- Create: `posts/llm-user-embedding-features.md`, `demo-user-embedding-cards.html`, `js/user-embedding-cards-demo.js`
- Modify: `js/posts.js`, `js/demo-edu-content.js`
- Test: 검사 여섯 + 상수 검사 + `gen-ads-data.py --check`

**Interfaces:**
- Consumes: Task 0 의 회원과 `user_doc`(복사, `KEYWORDS` 리터럴 포함), LLM 호출 한 번 편의 기록(`llm-first-call`, `--with-usage`), 설계 4절의 유저 벡터와 서빙 값.
- Produces: 없음(뒤 글은 링크만).

파이썬 셋(이어서): (1) 장난감 인코더(문서 낱말을 해시로 64칸에 더하고 정규화. 「행동 시퀀스로 학습한 작은 LLM 인코더 대신 쓰는 장난감」이라고 밝힘)로 2,000명의 벡터를 새벽 배치처럼 한 번에 만들어 사전(피처 저장소 흉내)에 넣는다. 1,400만 명 × 64 × 4바이트 = 3.58GB. (2) 가짜 클릭(숨은 관심과 광고의 거리에 기대게 생성)으로 기본 피처만 쓴 로지스틱 회귀와 유저-광고 코사인 피처를 더한 것의 logloss 와 AUC(표준 라이브러리로 계산). (3) 기록 상수로 LLM 실시간 호출 한 번의 시간(USAGE elapsed_ms)과 모델 서버 예산 8ms 의 배수, 하루 노출 2억 2,800만 번마다 부를 때의 토큰 값(가상 단가), GPU 서버 2,300 QPS 로 1,400만 명을 새벽에 다 만드는 시간과 값.

데크(`ue-`, 4장): `batch` 새벽 배치 / `store` 피처 저장소의 키와 벡터 / `ranker` 랭커가 읽는 자리 / `budget` 8ms 와 실시간 호출.

절: 1 유저 벡터는 랭커의 피처 하나입니다(표) / 2 벡터는 새벽에 미리 만듭니다(파이썬 1, 카드 batch, store) / 3 피처 하나를 더한 랭커의 logloss 와 AUC 를 봅니다(파이썬 2, 카드 ranker) / 4 실시간으로 LLM 을 부르지 않는 이유(파이썬 3, 카드 budget) / 5 큰 인코더를 작은 모델로 옮기는 자리(표, 증류 편 링크) / 6 두 무대 / 한눈 정리 / 헷갈리기 쉬운 점(벡터의 신선도는 배치 주기가 정한다, 코사인 피처 하나와 벡터 64칸을 다 넣는 것의 차이, 오프라인 AUC 개선과 온라인 성과) / 더 깊이 보기(해시 인코더 식, AUC 계산) / 참고문헌(Ning et al. 2024 User-LLM, Pancha et al. 2022 PinnerFormer, Feast 문서).

카테고리 `LLM & Agents`, `ML Infrastructure`. 태그 `Embedding`, `pCTR`, `Model Serving`.

- [ ] Step 1 스캐폴드(11-25) → Step 2 데크(`ue-`, `'user-embedding-cards'`) → Step 3 글 본문 → Step 4 출력 두 번 통과, 상수 검사, `gen-ads-data.py --check` → Step 5 엔트리와 검사 전부 → Step 6 커밋 `feat(posts): LLM 유저 임베딩을 pCTR 피처로 — 들어가는 자리와 얻는 것`.

---

### Task 8: 광고 카피 생성 (`grounded-ad-copy-generation`, 35주째, 2026-11-26)

**Files:**
- Create: `posts/grounded-ad-copy-generation.md`, `demo-copy-gen-cards.html`, `js/copy-gen-cards-demo.js`, `scripts/gen-copy-data.py`
- Create: `data/llm-records/prompts/grounded-ad-copy-generation.json` 와 기록
- Modify: `js/posts.js`, `js/demo-edu-content.js`, `.github/workflows/validate.yml`(`gen-copy-data.py --check`)
- Test: 검사 여섯 + 기록 + `--check`

**Interfaces:**
- Consumes: Task 0 의 `ASSET_RUNNING`(생성기가 `gen-ads-data.py` 에서 읽는다).
- Produces: 자산 10개(`ASSETS`: id `x01`~`x10`, 한국어 120~200자. x01 은 `ASSET_RUNNING`, x09 와 x10 은 상품 사실이 없는 얇은 자산), 게이트 넷 `gate_grounding`, `gate_length(max_len=40)`, `gate_duplicate`, `gate_superlative`. Task 9 가 게이트를 통과한 카피를 쓴다.

기록: 자산 10개, think 끔, temperature 0. 출력 `{"status": "<ok|no_generation>", "candidates": [{"copy": "<한국어 40자 이하>", "quote": "<자산에서 그대로 옮긴 구절>"}]}`, 카피는 5개까지. 시스템 메시지: 카피의 사실은 quote 안에 있어야 한다, 숫자는 자산에 있는 것만, 근거 없는 최상급 금지, 사실이 부족하면 `no_generation`, 문장 끝은 명사나 「~합니다」, 가운뎃점과 이모지와 「저희」 금지, 숫자는 아라비아 숫자.

게이트(코드): 근거(quote 가 자산의 부분 문자열이고 카피의 숫자가 모두 자산에 있음), 길이 40자 이하, 중복(같은 자산 안에서 글자 두 개씩 묶은 집합의 Jaccard 0.8 이상), 최상급(최고, 최초, 1위, 유일, 가장, 국내 최대 가운데 자산에 없는 낱말).

파이썬 셋(이어서): (1) 기록 상수로 자산마다 status 와 카피 수, 얇은 자산 둘이 `no_generation` 인지. (2) 게이트 넷을 차례로 지나며 걸린 이유별 수와 남은 수. (3) 서연 씨 자산 x01 의 카피와 quote, 각 게이트 결과 표.

데크(`cg-`, 4장): `quote` 자산에서 인용 / `generate` 카피 후보 다섯 / `gates` 게이트 넷 / `none` 생성 없음도 정상 답.

절: 1 카피는 자산 텍스트에서 출발합니다(표, 카드 quote) / 2 인용 구절을 같이 받습니다(파이썬 1, 카드 generate) / 3 게이트 넷은 코드입니다(파이썬 2, 카드 gates) / 4 서연 씨 자산의 카피 다섯(파이썬 3, 표, 카피는 「」 대사로도 보인다) / 5 생성 없음도 정상 답입니다(표, 카드 none) / 6 두 무대 / 한눈 정리 / 헷갈리기 쉬운 점(인용이 있어도 카피가 과장일 수 있다, 길이는 글자 수로 센다, 게이트를 지나도 좋은 카피라는 뜻은 아니다. 다음 글로) / 더 깊이 보기(시스템 메시지 전문, 게이트 식) / 참고문헌(Gao et al. 2023 RARR, Bohnet et al. 2022 Attributed QA, 검색 광고 반응형 광고 문구 길이 문서, 표시 광고 관련 공정거래위원회 심사지침).

카테고리 `LLM & Agents`, `Targeting & Audience`. 태그 `LLM`, `RAG`, `Prompting`.

- [ ] Step 1 스캐폴드(11-26) → Step 2 생성기(`--check` 는 프롬프트 user 와 글의 `ASSETS = [` 대조) → Step 3 기록(10개, error 0, `copy` 와 `quote` 밖의 한글 0자) → Step 4 데크(`cg-`, `'copy-gen-cards'`) → Step 5 글 본문 → Step 6 출력 두 번 통과, 상수 검사 → Step 7 엔트리와 검사 전부, 이 글의 말투 검사 0건(기록 상수 줄 포함). 걸리면 시스템 메시지의 말투 문장을 고쳐 다시 기록하고 보고서에 적는다 → Step 8 커밋 `feat(posts): 광고 카피 생성 — 근거를 인용해 쓰고 코드 게이트가 거른다. 기록 10건`.

---

### Task 9: 생성 문구 판정 체계 (`generated-copy-judging-system`, 36주째, 2026-11-27)

**Files:**
- Create: `posts/generated-copy-judging-system.md`, `demo-copy-judge-cards.html`, `js/copy-judge-cards-demo.js`
- Create: `data/llm-records/prompts/generated-copy-judging-system-score.json`, `-pairs.json`, `-cascade.json` 와 기록 셋
- Modify: `scripts/gen-copy-data.py`(판정 빌더 셋, cascade 는 score 와 pairs 기록을 읽는다, 가상 사람 라벨 리터럴), `js/posts.js`, `js/demo-edu-content.js`
- Test: 검사 여섯 + 기록 셋 + `gen-copy-data.py --check`

**Interfaces:**
- Consumes: Task 8 의 기록과 게이트(통과한 카피), `cohen_kappa`.
- Produces: 판정 세 겹의 표(노출 전 게이트, 오프라인 비교, 사후 원인 귀속). 묶음 4 의 보상 모델 글이 링크한다.

판정 대상은 Task 8 에서 게이트를 통과한 카피 전부다(수는 기록대로). 사람 라벨(1~5, 가상)은 판정 기록 전에 구현자가 채점표대로 매겨 생성기 리터럴로 둔다.

기록 셋, 출력은 모두 영어와 숫자: (1) `-score` 는 카피마다 채점표 1~5, temperature 0.7 로 5번(`repeat: 5`), think 끔. 출력 `{"score": 1~5}`. (2) `-pairs` 는 같은 자산의 카피 쌍(최대 20쌍) × 좌우 2번, temperature 0, 출력 `{"winner": "A" | "B"}`. (3) `-cascade` 는 생성기가 두 기록에서 고른 불확실한 것(점수 다섯의 최댓값과 최솟값이 2 이상 차이 나는 카피, 좌우를 바꾸면 승자가 바뀐 쌍)을 think 켬, temperature 0 으로 다시 본다. 고른 것이 0개면 cascade 프롬프트와 기록을 만들지 않고 블록과 글이 「넘긴 것 0개」를 적는다.

파이썬 셋(이어서): (1) score 기록 상수로 카피마다 다섯 점수의 범위, 중앙값과 사람 라벨의 일치율과 kappa. (2) pairs 기록 상수로 좌우를 바꾸면 승자가 바뀐 쌍 수, 바뀌지 않은 쌍에서 사람 라벨과 맞은 수. (3) cascade 기록 상수로 비싼 판정자로 넘긴 비율, 넘긴 것의 결과, 비용(USAGE: 싼 판정자만, 캐스케이드, 비싼 판정자로 다 볼 때의 어림을 가정을 밝혀).

데크(`cj-`, 4장): `layers` 판정 세 겹 / `spread` 같은 카피의 점수 다섯 / `swap` 좌우 바꾸기 / `cascade` 싼 판정자 먼저.

절: 1 판정은 세 겹입니다(표, 카드 layers) / 2 필수 항목은 통과와 탈락, 품질은 점수(표: 게이트가 보는 것과 판정자가 보는 것) / 3 절대 점수는 같은 카피에도 흔들립니다(파이썬 1, 카드 spread) / 4 그래서 짝비교로 갑니다(파이썬 2, 카드 swap) / 5 싼 판정자를 먼저 쓰는 캐스케이드(파이썬 3, 카드 cascade) / 6 온라인 CTR 이 못 잡는 것과 사후 원인 귀속(표) / 7 두 무대 / 한눈 정리 / 헷갈리기 쉬운 점(점수 평균과 짝비교 승률은 다른 값이다, 캐스케이드의 문턱은 비용과 오판의 교환이다, CTR 이 오른 카피가 좋은 카피라는 뜻은 아니다) / 더 깊이 보기(채점표 전문, 캐스케이드 규칙) / 참고문헌(Zheng et al. 2023 Judging LLM-as-a-Judge, Wang et al. 2023 not Fair Evaluators, Liu et al. 2023 G-Eval, Chen et al. 2023 FrugalGPT).

카테고리 `LLM & Agents`, `Measurement & Modeling`. 태그 `LLM Evaluation`, `LLM`.

- [ ] Step 1 스캐폴드(11-27) → Step 2 사람 라벨 리터럴, score 와 pairs 빌더와 기록(error 0, 한글은 user 에만) → Step 3 cascade 빌더 실행(고른 목록을 보고서에 적음)과 기록 → Step 4 `gen-copy-data.py --check` 가 셋을 대조(cascade 는 두 기록에서 다시 만들어 대조) → Step 5 데크(`cj-`, `'copy-judge-cards'`) → Step 6 글 본문 → Step 7 출력 두 번 통과, 상수 검사 → Step 8 엔트리와 검사 전부 → Step 9 커밋 `feat(posts): 생성 문구 판정 체계 — 노출 전 게이트, 오프라인 비교, 사후 원인 귀속. 기록 세 벌`.

---

### Task 10: 광고주 에이전트 (`advertiser-agent-mcp`, 37주째, 2026-11-28)

**Files:**
- Create: `posts/advertiser-agent-mcp.md`, `demo-advertiser-agent-cards.html`, `js/advertiser-agent-cards-demo.js`
- Modify: `js/posts.js`, `js/demo-edu-content.js`
- Test: 검사 여섯

**Interfaces:**
- Consumes: Tool use 편의 도구 정의 꼴(`get_campaigns`, `get_stats`, `set_bid`), 가짜 LLM 응답 꼴, `run_agent` 의 멈춤 조건 셋, 설계 4절의 후보풀 캠페인 셋과 에이전트 과제 값.
- Produces: JSON-RPC 메시지 꼴(`initialize`, `tools/list`, `tools/call`)과 승인 단계 함수 `approve(call) -> bool`. Task 11 이 같은 도구와 서버를 쓴다.

파이썬 셋(이어서): (1) 한 프로세스 안의 MCP 서버. JSON-RPC 2.0 요청 셋을 받아 응답을 돌려주고, 도구 목록에 읽기 도구 둘과 쓰기 도구 하나(입찰가)를 둔다. 도구 설명의 주석 칸(읽기 전용 여부 같은 힌트)은 MCP 명세 문서를 열어 본 이름만 쓴다. 쓰기를 끈 서버의 `tools/list` 에는 읽기 도구만 나온다. (2) 클라이언트와 가짜 LLM: 서연 씨의 요청 「여행사 캠페인 ROAS 가 목표보다 낮습니다」 → 읽기 → 입찰가 10% 내리기 제안 → 승인 → 적용. 메시지 목록에 `stop_reason`, `tool_use`, `tool_result` 가 찍힌다. (3) 막히는 길 셋: 승인 없이 쓰기, 35% 변경(서버의 가드레일이 거부하고 거부를 결과로 돌려줌), 쓰기를 끈 서버.

데크(`aa-`, 4장): `mcp` 클라이언트와 서버 / `tools` 읽기와 쓰기 / `approval` 승인 단계 / `guard` 서버의 가드레일.

절: 1 대화로 캠페인을 설정하면 열리는 것과 막히는 것(표, 카드 mcp) / 2 MCP 서버는 도구 목록을 내놓습니다(파이썬 1, 카드 tools) / 3 읽기는 바로, 쓰기는 승인 뒤에(파이썬 2, 카드 approval) / 4 가드레일은 서버에 둡니다(파이썬 3, 카드 guard) / 5 무엇을 도구로 내놓지 않나(표) / 6 두 무대 / 한눈 정리 / 헷갈리기 쉬운 점(MCP 는 모델이 아니라 도구를 내놓는 약속이다, 승인은 프롬프트가 아니라 코드다, 읽기 도구도 정보 노출 범위를 정해야 한다) / 더 깊이 보기(메시지 전문) / 참고문헌(Model Context Protocol 명세 문서, JSON-RPC 2.0 명세, Anthropic tool use 문서, OWASP Top 10 for LLM Applications).

카테고리 `LLM & Agents`, `Bidding & Auction`. 태그 `Agent`, `LLM`, `Auto-Bidding`.

- [ ] Step 1 스캐폴드(11-28) → Step 2 데크(`aa-`, `'advertiser-agent-cards'`) → Step 3 글 본문 → Step 4 출력 두 번 통과(출력에 `jsonrpc`, `stop_reason`, `tool_use`, `tool_result` 가 찍힘) → Step 5 엔트리와 검사 전부 → Step 6 커밋 `feat(posts): 광고주 에이전트 — 캠페인 설정을 대화로 하면 무엇이 열리고 막히나`.

---

### Task 11: 워크플로와 자율 루프 (`workflow-vs-autonomous-loop`, 38주째, 2026-11-29)

**Files:**
- Create: `posts/workflow-vs-autonomous-loop.md`, `demo-workflow-loop-cards.html`, `js/workflow-loop-cards-demo.js`
- Modify: `js/posts.js`, `js/demo-edu-content.js`
- Test: 검사 여섯 + 상수 검사

**Interfaces:**
- Consumes: Task 10 의 도구와 서버, 가짜 LLM 꼴, Task 1 의 `nl-to-targeting-query-verdict` 기록(`--with-usage`, 호출 한 번의 시간 분포).
- Produces: 없음.

같은 일(캠페인 셋의 ROAS 를 보고 목표보다 낮은 캠페인의 입찰가를 가드레일 안에서 내리기)을 두 방식으로 돌린다. 자율 루프의 가짜 LLM 은 다음 도구를 확률로 고른다(`random.Random(7)` 에서 run 마다 다른 시드). 워크플로는 코드가 순서를 정하고 LLM 은 마지막 요약 한 번만 부른다.

파이썬 셋(이어서): (1) 두 방식을 각 10번 돌려 LLM 호출 수와 단계 수의 최솟값, 중앙값, 최댓값. (2) 기록 상수(USAGE 의 elapsed_ms 30개)를 호출마다 차례로 대응시켜 센 run 별 전체 시간, 10번의 최종 입찰가가 서로 다른 수. (3) 오케스트레이터가 에이전트 둘(타겟 에이전트, 카피 에이전트)에게 일을 맡기는 A2A 꼴 메시지(에이전트 카드, 작업 상태)와 실패 경로. 작업 상태 이름은 A2A 명세 문서를 열어 본 것만 쓴다.

데크(`wl-`, 4장): `two_ways` 두 방식 / `calls` 호출 수와 시간 / `variance` 10번의 결과 / `a2a` 오케스트레이터와 상태.

절: 1 같은 일을 두 방식으로 돌립니다(표, 카드 two_ways) / 2 호출 수와 시간(파이썬 1, 2 앞부분, 카드 calls) / 3 결과가 흔들리는 것(파이썬 2 뒷부분, 카드 variance) / 4 고르는 기준 셋: 비용, 지연, 예측 가능성(표) / 5 여러 에이전트를 잇는 자리와 상태 코드(파이썬 3, 카드 a2a) / 6 두 무대 / 한눈 정리 / 헷갈리기 쉬운 점(워크플로에도 LLM 이 있다, 자율 루프의 흔들림은 모델 탓만이 아니다, A2A 와 MCP 는 맡는 자리가 다르다) / 더 깊이 보기(두 방식의 코드 차이, 상태 전이) / 참고문헌(Anthropic 「Building effective agents」, A2A 명세 문서, Yao et al. 2022 ReAct, LangGraph 문서).

카테고리 `LLM & Agents`, `Software Engineering`. 태그 `Agent`, `Workflow`, `System Design`.

- [ ] Step 1 스캐폴드(11-29) → Step 2 데크(`wl-`, `'workflow-loop-cards'`) → Step 3 글 본문(블록 2 가 기록 상수) → Step 4 출력 두 번 통과(출력에 `stop_reason`, `tool_use` 가 찍힘), 상수 검사 → Step 5 엔트리와 검사 전부 → Step 6 커밋 `feat(posts): 워크플로와 자율 루프 — 비용, 지연, 예측 가능성으로 고르는 기준`.

---

### Task 12: 생성형 검색과 Semantic ID (`generative-retrieval-semantic-id`, 39주째, 2026-11-30)

**Files:**
- Create: `posts/generative-retrieval-semantic-id.md`, `demo-semantic-id-cards.html`, `js/semantic-id-cards-demo.js`
- Modify: `js/posts.js`, `js/demo-edu-content.js`
- Test: 검사 여섯

**Interfaces:**
- Consumes: 임베딩과 벡터 검색 편의 `embed`, `make_products`(복사, 상품 300건).
- Produces: `rq_codes(vectors, levels=3, k=16, iters=20) -> list[tuple]`(잔차 양자화), 코드 나무와 빔 탐색 `beam(history, width=3)`.

파이썬 셋(이어서): (1) 상품 300건의 벡터를 단마다 16개 중심의 k-means 로 3단 양자화한다(잔차를 다음 단으로). 상품마다 코드 셋, 같은 코드를 받은 상품 수와 넷째 자리로 구분하는 규칙, 단마다 줄어든 잔차의 크기. (2) 생성: 회원 A 가 본 상품 셋의 평균 벡터로 단마다 가까운 코드를 빔 3으로 고르고 코드 나무에서 상품을 꺼낸다. 같은 평균 벡터의 전수 코사인 상위와 겹치는 수. (3) 콜드 스타트: 새 상품 10건이 내용 벡터만으로 바로 코드를 받는 것과, 상품 id 임베딩 방식이 노출 기록이 쌓일 때까지 벡터가 없는 것(표).

데크(`si-`, 4장): `codebook` 3단 코드북 / `tree` 코드 나무 / `beam` 단마다 고르기 / `cold` 새 상품.

절: 1 광고를 코드 셋으로 적습니다(표, 카드 codebook) / 2 잔차 양자화 한 번(파이썬 1) / 3 코드 나무에서 생성해 꺼냅니다(파이썬 2, 카드 tree, beam) / 4 전수 검색과 겹치는 수를 셉니다(표) / 5 새 상품에 강한 이유(파이썬 3, 카드 cold) / 6 두 무대 / 한눈 정리 / 헷갈리기 쉬운 점(Semantic ID 는 임베딩을 버리는 것이 아니다, 코드 충돌은 넷째 자리로 푼다, 생성형 검색도 후보를 고르는 단계다) / 더 깊이 보기(k-means 갱신, 빔 탐색) / 참고문헌(Rajput et al. 2023 TIGER, Deng et al. 2025 OneRec, Lee et al. 2022 RQ-VAE, Tay et al. 2022 DSI).

카테고리 `LLM & Agents`, `Measurement & Modeling`. 태그 `Embedding`, `LLM`, `Two-Tower`.

- [ ] Step 1 스캐폴드(11-30) → Step 2 데크(`si-`, `'semantic-id-cards'`) → Step 3 글 본문 → Step 4 출력 두 번 통과(블록 실행 10초 안) → Step 5 엔트리와 검사 전부 → Step 6 커밋 `feat(posts): 생성형 검색과 Semantic ID — 광고를 코드 몇 개로 적고 생성해 꺼내기`.

---

### Task 13: 코딩 에이전트로 실험 돌리기 (`coding-agent-experiments`, 40주째, 2026-12-01)

**Files:**
- Create: `posts/coding-agent-experiments.md`, `demo-coding-agent-cards.html`, `js/coding-agent-cards-demo.js`
- Modify: `js/posts.js`, `js/demo-edu-content.js`
- Test: 검사 여섯 + 발췌 점검(아래)

**Interfaces:**
- Consumes: Task 4 구현자 보고의 명령과 출력 순서, Task 4 의 브리프 머리, 검토 판정 한 줄, 커밋 한 줄, 로컬에서 돌린 검사 결과 한 줄(컨트롤러가 구현자에게 넘긴다).
- Produces: 없음.

이 글만 기록 대신 세션 발췌를 쓴다(설계 5절). 발췌는 위 「이 계획에서 정한 것」 2 대로 Task 4 의 기록 과정에서 뽑는다. 경로는 `<repo>` 로, 계정과 세션 id 와 시각은 지우고, 시간은 시작부터 지난 분으로 적는다. 발췌는 언어 없는 코드 블록(```text)에 두고 말투 검사 0건이다.

파이썬 둘(이어서): (1) PreToolUse 훅의 판단 함수 `decide(payload: dict) -> tuple[int, str]`. 이 저장소의 규칙(`git add -A` 금지, `--force` 금지, main 에 직접 push 금지, 커밋은 파일을 이름으로)을 막고, 예시 입력 다섯(허용 둘, 막힘 셋)의 종료 코드(0 또는 2)와 메시지를 찍는다. 훅의 입력과 종료 코드 뜻은 Claude Code 훅 문서를 열어 본 것만 쓴다. (2) 발췌의 사건 목록(단계, 도구, 지난 분)을 리터럴로 두고 단계별 시간, 도구 호출 수, 사람이 승인한 자리를 센다.

데크(`ca-`, 4장): `steps` 계획, 구현, 실행, 보고 / `skill` 스킬이 정하는 순서 / `hook` 훅이 막는 것 / `ledger` 장부와 보고.

절: 1 실험 하나를 네 단계로 나눕니다(표, 카드 steps) / 2 계획은 스킬이 정한 틀로 씁니다(표: 계획서의 칸) / 3 구현과 실행의 발췌(발췌, 카드 skill) / 4 훅은 정책을 코드로 막습니다(파이썬 1, 카드 hook) / 5 보고와 장부(파이썬 2, 카드 ledger) / 6 두 무대 / 한눈 정리 / 헷갈리기 쉬운 점(에이전트가 쓴 숫자도 검사기가 다시 센다, 훅은 권한 설정과 다르다, 사람의 승인은 병합과 push 자리에 둔다) / 더 깊이 보기(훅 입력 전문, 발췌를 다듬은 규칙) / 참고문헌(Claude Code 문서의 hooks, skills, subagents 절, Jimenez et al. 2023 SWE-bench).

카테고리 `LLM & Agents`, `Software Engineering`. 태그 `Agent`, `Workflow`, `Git`.

- [ ] Step 1 스캐폴드(12-01) → Step 2 컨트롤러가 넘긴 재료로 발췌를 만든다. 점검: `grep -nE "/Users/|chkimsu|@users.noreply|[0-9a-f]{8}-[0-9a-f]{4}-" posts/coding-agent-experiments.md` 0건, 이름 목록 grep 0건 → Step 3 데크(`ca-`, `'coding-agent-cards'`) → Step 4 글 본문 → Step 5 출력 두 번 통과 → Step 6 엔트리와 검사 전부 → Step 7 커밋 `feat(posts): 코딩 에이전트로 실험 돌리기 — 계획, 구현, 실행, 보고를 스킬과 훅으로`.

---

### Task 14: 놀이터, 데모 목록, 용어, 표지, 최종 검증

**Files:**
- Create: `demo-users-as-documents.html`, `js/users-as-documents-demo.js`
- Modify: `demos.html`(바로가기 줄 「LLM 광고 응용」, 주제 절 `demo-topic-llm-ads`, 난이도별과 주제별 개수), `js/demo-edu-content.js`(`'users-as-documents'`), `js/glossary.js`(용어), `index.html`(글 편수 123 → 136, 태그별 수), `README.md`(136 posts), `posts/users-as-documents.md`(놀이터 링크 한 줄), `search-index.json`(재생성)
- Test: 검사 전부 + 스크린샷

**Interfaces:**
- Consumes: Task 0 의 `js/ads-users-data.js`, Task 2 의 BM25, RRF, 기본값(전략 셋, k 60, 200명), Task 1~13 의 데크와 글.
- Produces: 없음(마지막 Task).

놀이터: 전략 일곱의 체크 상자(기본은 direct, category, co_purchase), BM25 의 k1(0.5~2.0, 기본 1.2)과 b(0~1, 기본 0.75), RRF k(1~100, 기본 60), 자르는 수(50~400, 기본 200). 지표 카드 넷(고른 회원 수, 세그먼트 317 과 겹친 수, 다음 30일 구매자 비율, 회원 A 의 순위), 판정 한 줄, 해설 패널(BM25 와 RRF 식, 「가상 회원 2,000명」 한 문장). 형식은 `demo-lookalike-ratio.html`(Chart.js, `cssVar()`, `?embed=1`, aria-label, 프리셋 뒤 `input` 이벤트). JS 의 BM25 와 RRF 는 글의 파이썬과 같은 식이다.

용어(겹치는 이름이 없는지 먼저 본다): `BM25`, `RRF`, `역방향 검색`, `키워드 확장`, `판정 캐스케이드`, `포인트와이즈와 리스트와이즈`, `지식 증류`, `근거 인용`, `짝비교 판정`, `A2A`, `Semantic ID`, `훅`. body 두 문장, 파일의 다른 항목과 같은 평서체.

- [ ] **Step 1: 놀이터** — 위 사양대로, `'users-as-documents'` 엔트리. 기본값에서 지표 넷이 글 2 블록 3 의 출력과 같은지 node 로 다시 계산해 보고서에 적는다.
- [ ] **Step 2: 데모 목록** — 바로가기 줄에 `<a class="demos-jump-item" href="#demo-topic-llm-ads">LLM 광고 응용<b>14</b></a>` 를 「LLM 기초」 뒤에, 주제 절 `demo-topic-llm-ads`(데크 13장 + 놀이터 1장, 설명 한 문단, 문장 80자 이하)를 「LLM 기초」 절 뒤에. 「난이도별 N개 데모」와 「주제별 N개, 주제 N개」를 14 와 1 늘리고, 로드맵은 묶음 2 와 같은 규칙(입문 태그 글의 데크는 입문, 나머지는 중급)으로 합을 맞춘다. `node scripts/check-page-sentences.js` 통과.
- [ ] **Step 3: 용어** — `js/glossary.js` 끝에.
- [ ] **Step 4: 표지와 README** — `index.html` 「글 136편 전체」, 태그별 수는 `node -e` 로 posts.js 를 세어 모두 맞춘다(`validate-posts` 의 표지 검사 통과). README 의 글 수.
- [ ] **Step 5: 검사 전부** — Run: `node scripts/validate-posts.js && node scripts/check-content-standard.js <13개 slug> && node scripts/check-wording.js && node scripts/check-code-blocks.js && node scripts/check-page-sentences.js && for s in <13개 slug>; do python3 scripts/check-python-outputs.py --post $s || exit 1; done && python3 scripts/check-llm-constants.py && python3 scripts/test-llm-record.py && python3 scripts/gen-llm-problems.py --check && python3 scripts/gen-rag-docs.py --check && python3 scripts/gen-judge-pairs.py --check && python3 scripts/gen-ads-data.py --check && python3 scripts/gen-nl-requests.py --check && python3 scripts/gen-ranker-data.py --check && python3 scripts/gen-copy-data.py --check && node scripts/test-long-sentences.js && node scripts/check-design.js && node scripts/test-code-steps.js && node scripts/check-course-pages.js && node scripts/build-search-index.js && grep -rnE "$(grep -v '^#' $NAMES_FILE | tr '\n' '|' | sed 's/|$//')" posts/ docs/ js/ data/ scripts/ *.html; echo "names grep exit=$?"` Expected: 전부 통과, 마지막 grep 은 출력 없이 `exit=1`. 열세 글의 글머리표와 참고문헌 줄을 손으로 측정해 80자 초과가 원제뿐인지 본다. 기록의 outputs 한글 수를 센다(Task 8 의 copy, quote 말고 0).
- [ ] **Step 6: 화면 확인** — 헤드리스 크롬으로 글 13편을 1440 과 390 폭으로(카드 iframe 로드, 가로 스크롤 없음), 데크 13장과 놀이터를 라이트와 다크로, `demos.html`, `topics.html`, `ml-track.html`(7단계 열세 편), `index.html` 을 찍는다. 스크린샷은 저장소 밖 작업 폴더에.
- [ ] **Step 7: 커밋** — 파일을 이름으로. `feat(demos): 유저 문서 검색 놀이터와 LLM 광고 응용 데모 절, 용어, 표지 136편`.

---

## 묶음 끝 (컨트롤러)

1. 글마다 미룬 minor 를 한 브리프로 모아 고친다(구현 Opus, 검토 Sonnet). 파이썬을 고치면 출력이 글자까지 같아야 하고 기록과 계획서는 건드리지 않는다.
2. 브랜치 전체 검토(Fable). Critical 과 Important 를 고친다.
3. main 병합과 push 는 사용자에게 묻는다(묶음 3 은 미리 승인받지 않았다). 승인 뒤 빨리 감기 병합, push, Validate posts 와 sitemap 봇과 Pages 배포 success, 공개 주소에서 새 글 열기. Pages 가 20분 넘게 building 이면 `gh api -X POST repos/chkimsu/adtech-blog/pages/builds`.
4. 장부를 저장소 밖으로 옮기고 블로그의 작업 폴더와 브랜치를 지운다.
