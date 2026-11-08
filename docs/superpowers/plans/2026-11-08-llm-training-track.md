# LLM 학습 트랙 4편 (묶음 4) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 설계 문서의 묶음 4, LLM 학습 트랙 4편(글, 카드 데크 4장, 놀이터 1장, 공용 선호 쌍 생성기, 트랙 통합)을 블로그에 올릴 수 있는 상태로 만든다.

**Architecture:** 글의 꼴은 묶음 2, 3 과 같다. `posts/<slug>.md` + `js/posts.js` 엔트리 하나, 절마다 카드 iframe(`demo-<이름>-cards.html?embed=1&card=<키>`), 표준 라이브러리 파이썬. 묶음 4 는 Ollama 를 돌리지 않고 기록 파일이 없다. 숫자는 모두 가상 데이터 위의 파이썬 블록이 찍는다. 글 1(SFT 와 DPO), 글 2(보상 모델), 놀이터가 같은 카피 후보 12개와 선호 쌍 20개를 쓰므로 Task 0 이 생성기 `scripts/gen-training-data.py` 를 만든다. 생성기가 놀이터 데이터 `js/training-dpo-pairs.js` 를 쓰고, `--check` 가 그 파일 전체와 글의 리터럴을 글자까지 대조한다. 글 3 은 자기 가상 교사를, 글 4 는 23주째 편의 `embed` 와 Two-Tower 학습 편의 손실을 글자 그대로 옮겨 쓴다.

**Tech Stack:** 마크다운(marked.js 렌더), vanilla JS 카드 데크(`js/card-kit.js`), Chart.js 놀이터, Python 3.9 표준 라이브러리, 검사 스크립트(`scripts/`).

**Spec:** `docs/superpowers/specs/2026-11-03-llm-tracks-design.md` (묶음 4 는 3-4절, 표준 데이터는 4절, 카드와 놀이터는 6절, 통합 자리는 7절, 검증은 8절. 기록 재생과 가짜 LLM 의 5절은 이 묶음에 쓰지 않는다)

**시작 조건:** 묶음 3 이 main 에 병합된 뒤 main 에서 `feat/llm-training-track` 을 만든다. 첫 커밋은 이 계획서다(컨트롤러). Task 0 Step 1 이 묶음 3 의 병합을 확인한다.

**시작 확인 (2026-11-08):** 묶음 3 이 main 에 병합된 뒤(44cc8a6, 봇 커밋 b6cc96c) main 에서 다시 셌다. `16 7 9 136`, 데모 101 개와 주제 12 개, 접두어 sd, rw, kd, ib, dl 과 edu 키 다섯은 0건, 용어 열둘은 없음(「지식 증류」는 묶음 3 이 더함). 묶음 3 의 CDN 판 고정(Chart.js 4.6.1)도 main 에 있다.

## 이 계획에서 정한 것 (설계가 정하지 않았거나 설계와 다른 점)

1. **승인.** 사용자가 2026-11-08 에 이 묶음을 미리 승인했다. 계획서를 쓰고 바로 진행한다. 브랜치 전체 검토를 통과하면 묻지 않고 main 에 병합하고 push 한 뒤, Validate posts, sitemap 봇, Pages 배포가 success 인지 확인한다(「묶음 끝」). 앞 묶음에서 내려받은 Ollama 모델은 지우지 않는다.
2. **기록 없음.** 설계 3-4절대로 네 편 모두 「파이썬」뿐이다. 기록 규칙(기록 상수, 재기록, 읽지 못한 답)은 Global Constraints 에서 뺐다.
3. **선호 쌍의 세계.** 글 1 과 글 2 는 서연 씨 러닝화 자산(`ASSET_RUNNING`) 하나에 쓴 가상 카피 후보 12개와 그 사이의 선호 쌍 20개를 같이 쓴다. 쌍은 출처 셋(게이트 6, 판정자 짝비교 8, 광고주 편집 6)을 흉내 낸 가상 쌍이다. 묶음 3 의 카피, 게이트, 판정 글과 구조는 잇되, 쌍이 그 기록에서 왔다고 쓰지 않는다. 값은 아래 Task 0 에 고정했다. 계획서가 미리 돌려, 두 글이 보일 현상(과최적화 후퇴, 보상 해킹, 판정자 교체)이 이 값에서 나오는 것을 확인했기 때문이다.
4. **두 글의 장난감 정책.** 정책은 참조 모델이 후보 12개에 준 로그 확률에 피처 셋(글자 수 ÷ 10, 숫자가 자산에 있음, 근거 없는 최상급)의 가중치 합을 더한 것이다. 학습은 가중치 셋만 고친다. 통과율과 보상은 정책이 12개에 둔 확률로 센 기댓값이고 표본이 아니다(GRPO 만 표본을 뽑는다). 두 글은 같은 까닭(판정자 쌍의 긴 카피 선호)을 각자 블록으로 찍는다. 글 1 은 DPO 를 오래 돌릴 때의 후퇴, 글 2 는 보상 모델, KL 세기, GRPO, 판정자 교체를 맡는다.
5. **글 2 의 보상 모델**은 글 1 과 같은 20쌍으로 배운다. 판정자 B 는 판정자 쌍 8개를 뺀 12쌍으로 배운 보상 모델로 흉내 낸다.
6. **글 3 의 교사**는 33주째 편의 가짜 교사를 다시 쓰지 않고 새 가상 교사를 둔다. 그 교사는 라벨 글자만 내서 확률과 벡터가 없기 때문이다. 교사는 관련 정도 넷(상, 중, 하, 무관)을 낸다. 온도가 가장 큰 라벨 밖의 몫을 펼쳐 보이려면 라벨이 셋 이상이어야 하기 때문이다. 그래서 학생은 설계 4절의 로지스틱 회귀(피처 6개, 경사 하강 200회)를 라벨 넷으로 넓힌 다항 로지스틱 회귀다.
7. **글 3 의 서빙 비용표**는 33주째 편과 같은 셈(건수 ÷ QPS ÷ 3,600 × 시간당 값)으로 학생을 세고, 교사 행은 설계 4절의 요청 한 건(1,200 + 150 토큰)과 가상 단가로 센다. 33주째 편은 기록의 토큰으로 셌으므로 배수가 다르다는 것을 글이 한 번 밝힌다.
8. **글 4 의 장난감 임베딩 모델.** 입력은 23주째 편의 `embed`(384칸 해시, 고정)이고, 그 위의 8차원 선형 사상 하나를 양쪽(질의와 짝)에 같이 쓴다(Sentence-BERT 의 siamese 구조). 낱말 50개는 23주째 편 `CATEGORIES` 의 24개에 26개를 더한 묶음 10개 × 5개다. 양성 쌍 200개는 묶음 안 순서쌍 전부(10 × 5 × 4)이고, 묶음마다 짝 둘(순서쌍 넷)을 검증으로 떼어 학습 160, 검증 40 이다. 배치는 묶음마다 한 쌍씩 10쌍이라 같은 묶음이 음성 칸에 앉지 않는다. 그래서 Two-Tower 학습 편의 logQ 와 accidental hit 제거는 넣지 않고, 그 까닭을 글이 밝힌다.
9. **글 4 의 온도.** 주 학습은 설계 값 0.05 다. 블록 3 이 τ 0.05, 0.2, 1.0 을 학습률 0.4τ 로 비교한다. 계획서 계산에서는 0.2 와 1.0 이 검증 쌍을 더 잘 찾았다. 결과를 그대로 적고, 온도는 검증 재현율로 고른다는 Two-Tower 학습 편 4절의 규칙으로 잇는다.
10. **표지 수.** 글 Task 마다 `index.html` 의 「글 N편 전체」를 하나씩 올린다(137, 138, 139, 140). 그래야 커밋마다 `validate-posts` 의 오류가 아직 쓰지 않은 글 id 뿐이다. 네 편의 태그는 표지 칸(ML Infra, Targeting, MAB, pCTR, Calibration, SSP, Ad Ecosystem, DSP, Attribution)에 없어 태그별 수는 바뀌지 않는다. Task 5 가 다시 센다.
11. **6단계 이름과 목표.** 설계의 「LLM 기초와 학습」 13편으로 바꾼다. 값은 Task 0 Step 2. `js/topics.js` 의 LLM 주제 설명 끝 문장 「광고 응용과 학습 글이 뒤에 붙습니다」는 이 묶음으로 끝나는 말이라 고친다.
12. **데크.** 글마다 4장. 접두어와 edu 키는 sd(`'sft-dpo-cards'`), rw(`'reward-loop-cards'`), kd(`'kd-methods-cards'`), ib(`'contrastive-cards'`). 놀이터는 `dl-` 와 `'dpo-loss'`. 2026-11-08 에 `grep -rln "<접두어>-" js/ css/ *.html` 가 다섯 모두 0건이었다(ct 는 18곳에 걸려 ib 로 바꿨다). 실행 때 다시 본다.

## Global Constraints

- 글은 합쇼체(`~입니다`, `~합니다`). 코드 블록 안 주석은 평서체(`~한다`). 1인칭은 「저」(「내」, 「저희」 금지). 절 제목은 합쇼체 문장이다.
- 가운뎃점 없음(쉼표). 비유 없음. 낱말 `실측`, `실체`, `축`(그래프 축 제외), `가른다`, `갈린다` 없음. 이모지와 장식 글자 없음. 해요체 없음. 작은 수가 아니면 아라비아 숫자. 지훈 씨의 주 수는 「41주째」처럼 숫자로.
- 어색한 낱말을 쓰지 않는다. 얹다 → 추가하다, 붙이다. 가리다 → 숨기다, 안 보이다. 굳은 값 → 고정된 값. 품다 → 처리하다, 담다. 줄을 세우다 → 정렬하다, 순위를 매기다. 견주다 → 비교하다. 훑다 → 스캔하다, 살펴보다. 실어 보내다 → 담아 보내다. 「~인 셈이다」, 「드러나다」, 「어긋나다」, 「통째로」, 본문 문장 안의 줄표(—)는 줄인다.
- 결론 목록은 `**제목.** 설명` 꼴로 쓴다. 제목은 원래 말투를 그대로 둔다.
- 제목은 설계 3-4절의 것을 글자 그대로 쓴다(「주제어: 무엇을 알게 되나」, 콜론 하나, 55자 이하. 네 제목은 31~47자).
- 구조: 도입 장면(400~500자, 문단 4개, 표 0개, 개념어 없이) → `> 한 줄 요약:` → 「골라 읽는 법」 글머리표 → 본문 절 → 끝에서 두 번째 절은 「두 무대」 → `## 한눈 정리`(표 하나) → `## 헷갈리기 쉬운 점`(셋) → `## 더 깊이 보기`(`:::deep` 3개 이하와 링크 글머리표) → `## 참고문헌`(공개 출처만).
- 「두 무대」는 묶음 2 처럼 짧게 쓴다. 굵은 요약 한 줄과 `### … [무대: 닫힌 생태계]`, `### … [무대: 열린 RTB]` 소제목 둘에 한 문단씩이다. 소제목도 합쇼체 문장이다. 이 절은 문단 수 규칙과 「표 1개 또는 파이썬 1개」 규칙에서 빼고, 절 산문은 300자 이상(검사기의 짧은 절 기준)이다.
- 다른 절마다 굵은 요약 한 줄 + 문단 4~6개(굵은 요약, 표, 코드, 임베드, 제목은 세지 않는다) + 표 1개 또는 파이썬 1개. 둘 다 있어도 된다. 표 총 5~7개. 산문 15KB 이상.
- 문장 80자 상한. 「」 인용 안의 문장, 글머리표, 참고문헌, posts.js 의 excerpt, worldNote, worldPractical, 데크 캡션, 데크 메타 설명까지 잰다. 공개 출처 원제가 그 자체로 80자를 넘는 줄만 예외. 목표 평균 44~56자.
- 표준 용어는 첫 쓰임에 짧은 풀이를 붙이고 다시 풀지 않는다. 앞 글에서 푼 용어는 그 글을 링크하고 다시 풀지 않는다. 토큰(`llm-first-call`), 임베딩과 코사인(`embeddings-vector-search`), LLM-as-a-Judge 와 kappa(`llm-as-a-judge`), 증류와 교사와 학생(`llm-labeling-distillation`), in-batch negative 와 온도와 소프트맥스(`two-tower-training`)가 그렇다. 로그 확률, 참조 모델, 정책, 보상 모델은 이 묶음에서 처음 푼다. 표준 용어 자리에 지어낸 말을 쓰지 않는다(로짓, 소프트 타깃, KL 발산, 이점(advantage), 참조 모델, 정책).
- 파이썬은 표준 라이브러리만, 3.9 문법, 글마다 1~3개. 모든 난수는 `random.Random(7)`(Task 가 정한 차례로 뽑는다). 블록은 `# 하는 일:` 한 줄, `# N단계:` 제목과 풀이, `# 출력:` 아래 `# N단계 뜻:` 과 찍힌 줄(`python3 scripts/check-python-outputs.py --post <slug> --show` 가 뽑은 것을 그대로 붙인다). 꼬리표는 `python` 하나. 같은 글의 뒤 블록은 `# (앞 블록에 이어서 돌린다.)` 로 잇는다. 이 묶음은 발췌 블록을 쓰지 않는다(라이브러리 API 를 서술하려면 그 문서를 열어야 하고, 네 글 모두 표준 라이브러리로 보일 수 있다).
- 찍는 값에 실행 시간(측정한 ms)을 넣지 않는다. 블록 하나의 실행은 앞 블록을 다시 돌리는 시간을 합쳐 로컬에서 10초 안이다(검사기는 이어지는 블록마다 앞 블록을 다시 돌린다).
- 가상 데이터는 글에서 한 번 「가상 데이터」라고 밝힌다. 설계 4절의 값을 그대로 쓴다. DPO 표본(선호 쌍 20개, 정책과 참조 모델의 로그 확률은 가상 표, β 0.1), 장난감 임베딩 모델(단어 50개, 8차원 선형 사상, 양성 쌍 200개, 온도 0.05, in-batch negatives), 학생 모델(로지스틱 회귀, 피처 6개, 경사 하강 200회), 서빙 비용(CPU 서버 시간당 480원 287 QPS, GPU 서버 3,800원 2,300 QPS), 하루 노출 2억 2,800만, LLM 요청 한 건 1,200 + 150 토큰, 가상 단가(작은 상용 모델 100만 토큰당 입력 400원, 출력 1,600원, 큰 상용 모델 4,000원, 20,000원), 서연 씨 러닝화 자산 텍스트. 실제 상용 단가는 적지 않는다.
- 숫자는 그 글의 블록이 찍은 값만 쓴다. 앞 글의 숫자는 그 글의 블록 출력에 있는 값만, 링크와 함께 쓴다. 숫자 없는 과정 설명은 된다.
- 민감한 예시를 넣지 않는다. 카피와 낱말에 건강이나 몸의 효능을 넣지 않는다. 브랜드는 가상 이름(런솔 라이트 등 앞 묶음의 이름)만 쓴다.
- 앞 글을 링크할 때는 `js/posts.js` 에서 id 를 확인한다. 논문과 문서를 서술할 때는 연 원문에서 확인한 문장만 쓴다. 확인한 문장과 자리(절, 식 번호, 쪽)를 보고서에 적는다.
- 수식(`$…$`, `$$…$$`) 안에 한글을 넣지 않는다.
- 회사 안 시스템 이름, 숫자, 문장, 사람 이름은 어디에도 넣지 않는다. 올리기 전에 `grep -rnE "$(grep -v '^#' $NAMES_FILE | tr '\n' '|' | sed 's/|$//')" posts/ docs/ js/ data/ scripts/ *.html` 이 0건이어야 한다(대소문자 구분). `NAMES_FILE` 은 저장소 밖에 둔 이름 목록 파일이다.
- 커밋은 저장소의 기존 커밋과 같은 계정(GitHub no-reply 메일, `git log -1 --format='%an <%ae>'` 로 확인)으로, 파일을 하나씩 명시한다. `git add -A` 금지. 커밋 메시지는 한국어 conventional commit. 구현자 커밋 꼬리는 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`(Sonnet 구현자는 `Claude Sonnet 5.5`).
- 새 파일은 `node scripts/check-wording.js` 에서 0건. 기준표(`scripts/wording-baseline.json`)를 늘리지 않는다.
- 날짜는 글 N 이 2026-12-01 에서 N 일 뒤(12-02, 12-03, 12-04, 12-05), 주 수는 `(40+N)주째`. `world: 'both'`, `series: 'llm-training-track'`, 첫째 카테고리 `LLM & Agents`, 둘째 카테고리와 태그는 Task 마다 적었다.
- 각 Task 의 「엔트리와 검사 전부」 단계는 아래를 모두 말한다.
  - excerpt, worldNote, worldPractical 을 채우고 `index.html` 의 「글 N편 전체」를 하나 올린다.
  - 검사: `node scripts/validate-posts.js`(오류는 아직 쓰지 않은 글 id 의 series 와 mlTrack 줄뿐), `node scripts/check-content-standard.js <slug>`(⚠ 와 ✗ 없음), `node scripts/check-wording.js`, `node scripts/check-code-blocks.js`, `python3 scripts/check-python-outputs.py --post <slug>`, `node scripts/test-long-sentences.js`, `node scripts/check-design.js`, `node scripts/check-page-sentences.js`, Task 1 과 2 는 `python3 scripts/gen-training-data.py --check`.
  - posts.js 필드 80자: `node -e "const {overLong}=require('./scripts/check-content-standard.js');const {posts}=require('./js/posts.js');let n=0;for(const p of posts.filter(p=>p.id===process.argv[1]))for(const f of ['excerpt','worldNote','worldPractical'])for(const s of overLong(p[f]||'')){n++;console.log(f,s.length,s.slice(0,40))}console.log('80자 초과',n)" <slug>` → `80자 초과 0`.
  - 데크 문장 80자: `node -e "const fs=require('fs');const {overLong}=require('./scripts/check-content-standard.js');let n=0;const h=fs.readFileSync(process.argv[1],'utf8');for(const m of h.matchAll(/<p(?: class=\"tg-(?:cap|easy|k)\")?>([\s\S]*?)<\/p>|<li>([\s\S]*?)<\/li>/g))for(const s of overLong((m[1]||m[2]).replace(/<[^>]+>/g,''))){n++;console.log(s.length,s.slice(0,40))}console.log('80자 초과',n)" demo-<이름>-cards.html` → `80자 초과 0`.
  - 말투 grep 셋이 모두 출력 없음: `grep -nE "(^|[^가-힣])내(가|게| )" posts/<slug>.md`(1인칭), `grep -nE "^## [0-9]+\. " posts/<slug>.md | grep -v "니다$"`(평서체 절 제목), `grep -nE "^### " posts/<slug>.md | grep -vE "니다 \[무대: (닫힌 생태계|열린 RTB)\]$"`.
  - 민감어 grep `grep -nE "종교|소득|연봉|정치|religion|income" posts/<slug>.md` 0건, 이름 목록 grep 0건. 참고문헌 줄은 원제 밖의 문장을 손으로 잰다.

## 브리프에 그대로 옮기는 되풀이 실수

컨트롤러는 글 Task 의 브리프마다 이 절을 그대로 붙인다. 검토자도 이 목록으로 본다.

묶음 2 에서 되풀이된 것:

1. **1인칭 「내」.** 「저」만 쓴다. 위 말투 grep 으로 본다.
2. **블록 밖에서 센 수.** 산문의 숫자마다 블록 출력에서 같은 값을 찾을 수 있어야 한다. 손으로 나누거나 더한 수도 블록이 찍게 한다.
3. **문서와 안 맞는 API 와 논문 서술.** 연 원문의 문장만 쓴다. 기억으로 쓴 값(온도, 계수, 배수)은 원문에서 찾을 때까지 쓰지 않는다.
4. **평서체 절 제목.** `## N. …니다` 꼴이다.
5. **「」 안의 80자 초과.** 검사기는 인용 하나를 한 덩어리로 잰다. 긴 대사는 두 인용으로 나눈다.
6. **민감한 예시.** 건강, 종교, 소득, 정치, 성적 지향을 예시에 넣지 않는다.
7. **틀린 링크 대상.** 링크 글자가 가리키는 내용이 그 글에 실제로 있는지 열어 본다. id 는 `js/posts.js` 에서 확인한다.

묶음 3 검토에서 되풀이된 것:

- (a) **블록이 찍지 않은 원인 문장.** 네 글에서 나왔고 가장 잦은 Important 였다. 「왜 그 수가 나왔나」를 말하는 문장은 블록이 그 원인을 찍거나(이 계획의 블록 사양에 원인 줄을 넣어 두었다), 「~로 보입니다」처럼 가설로 쓴다. 검토자는 원인 문장마다 근거가 된 출력 줄을 적는다.
- (b) **뒤 글이 무엇을 다시 쓴다는 주장.** 계획의 Interfaces 에 적힌 것만 쓴다. 이 묶음에서 뒤 글이 이어 쓰는 것은 셋뿐이다. 글 2 가 글 1 과 같은 20쌍을 쓰고 글 1 블록 3 의 θ 를 인용한다. 글 4 가 글 3 을 링크한다. Task 5 의 놀이터가 글 1 의 d02 줄을 쓴다. 앞 글이 아직 없는 뒤 글을 링크하지 않는다(커밋 때 죽은 링크가 된다).
- (c) **표준 용어 대신 지어낸 말.** 묶음 3 에서 여섯 번 돌려보냈다. BM25 의 TF 항을 「횟수 몫」이라 했고(Task 2), 중앙값을 「가운데값」(Task 9), 환각(hallucination)을 「지어낸 답」(Task 10)이라 했다. 종료 상태(terminal state)는 「끝 상태」(Task 11), 초기 중심(initial centroid)은 「처음 중심」(Task 12)이었다. JSON 의 필드를 「칸」, 컨텍스트 윈도우(context window)를 「컨텍스트 창」(Task 13)이라 했다. 이 묶음은 로짓, 소프트 타깃, 온도, KL 발산, 참조 모델, 정책, 보상 모델, 이점(advantage), in-batch negatives, 양성 쌍을 그대로 쓴다.
- (d) **표준이나 법 문서를 요약하며 조건을 빠뜨림.** 논문의 수치나 주장을 옮길 때 그 조건(모델, 데이터, 비교 대상, 설정)을 같이 옮긴다. 예: 「학습 가중치 수가 1만 분의 1」이면 어느 모델의 어떤 미세 조정과 비교했는지까지.
- (e) **코드가 말하는 갈래를 다 돌려 보지 않음.** Task 11 의 확률표가 약속한 일찍 끝내기 갈래는 뽑히면 KeyError 로 죽었다. 글에 실린 시드가 우연히 피했을 뿐이다. Task 12 는 시드 60개로 돌려 단 수가 3 이 아닐 때의 IndexError 를 찾았다. 난수나 입력에 따라 갈리는 블록은 글에 실린 실행 밖에서도 돌려 보고 보고서에 적는다.
- (f) **그럴듯한 일반 기전을 이번 실행의 까닭으로 씀.** Task 12 는 빔이 가지를 쳐서 상품 6건을 놓쳤다고 썼다. 리프를 모두 세어 보니 빔이 고른 셋이 상위 셋이었고, 6건은 코드 점수에서 졌다.
- (g) **코드가 하지 않는 일을 말함.** Task 10 은 승인 없는 쓰기가 갈 수 없다고 썼지만 우연으로만 성립했다. Task 13 은 훅이 막는다고 쓴 꼴 일부를 통과시켰고, 글이 안내한 훅 파일은 import 하나가 빠져 아무것도 막지 못했다. 「할 수 없다」, 「막는다」는 블록이 시도해 막히는 것을 찍는다. 글이 안내하는 파일은 그대로 만들어 돌려 본다.
- (h) **이름 목록 grep 꼴.** 사내 이름 목록의 줄은 ERE 대안이다. 위 Global Constraints 의 `grep -rnE` 꼴로만 센다. `grep -F -f` 는 늘 0 이 나와 검사가 안 된다(묶음 3 Task 13 검토에서 찾음).

이 묶음에서 미리 막을 것:

- **장난감의 기댓값을 표본처럼 쓰지 않는다.** 글 1, 2 의 통과율과 보상은 후보 12개에 둔 확률로 센 기댓값이다. 글에서 한 번 밝힌다.
- **가상 교사와 가상 판정자를 진짜 LLM 결과처럼 쓰지 않는다.**
- **재현율 셋을 섞지 않는다.** 23주째 편의 재현율@10(근사 검색이 전수 검색의 답을 찾은 몫), Two-Tower 학습 편의 Recall@500(다음 날 클릭이 상위 500 에 든 비율), 글 4 의 recall@k(검증 쌍의 짝이 위 k 개에 든 비율)는 다른 값이다.

## 모델 나누기 (컨트롤러가 디스패치마다 적용)

| 역할 | 모델 |
|---|---|
| Task 0a(트랙, 6단계, 주제)와 Task 5 의 기계적인 부분(데모 목록, 용어, 표지, README, 색인, 검사 전부, 화면 확인) | Sonnet |
| Task 0b(생성기, 데이터 파일, CI 단계), 글 산문과 파이썬과 데크(Task 1~4), 놀이터(Task 5 Step 1~2) | Opus |
| 글 검토 | Opus |
| 고침 뒤 재검토 | Sonnet. Important 가 0 이면 재검토를 생략한다. 산문만 고친 라운드와 스크립트로 다 확인되는 고침은 컨트롤러가 확인한다 |
| 마지막 브랜치 전체 검토 | Fable |

## Review Focus

- **블록이 찍지 않은 원인 문장.** 묶음 3 에서 가장 잦았다. 블록 사양마다 원인 줄을 넣었다(글 1 의 θ 와 c06+c07 확률, 글 2 의 출처별 글자 수 차이와 두 보상 모델, 글 3 의 온도별 확률, 글 4 의 정답 칸 확률). 글 Task 의 검토 단계가 원인 문장과 근거 줄의 짝을 적는다(Task 1~4 의 마지막 전 단계).
- **놀이터 기본값과 글 1 의 d02 줄.** 놀이터를 처음 열었을 때의 margin, 손실, 무게가 글 1 블록 2 가 찍은 d02 줄과 같아야 한다(Task 5 Step 2 의 node 대조).
- **공용 리터럴이 글마다 달라지는 것.** `COPY_POOL`, `PREF_PAIRS` 는 글 1, 글 2, 데이터 파일이 글자까지 같아야 한다. `gen-training-data.py --check` 가 대조하고, 등록하지 않은 파일과 없는 파일에서 실패하는지 Task 0 Step 6 이 시험한다.
- **기댓값과 표본의 혼동.** 글 1, 2 블록의 통과율 주석과 산문 한 문장이 기댓값이라고 밝힌다(Task 1 Step 6, Task 2 Step 6 의 grep).
- **재현율 정의 셋.** 글 4 가 recall@k 를 정의하고, 헷갈리기 쉬운 점 첫째가 23주째 편의 재현율@10 과 다르다고 밝힌다(Task 4 Step 6 의 grep).
- **블록 실행 시간.** 글 3 은 세 블록을 이어 돌리면 계획서 계산으로 약 5초다. `time` 으로 10초 안인지 본다(Task 3 Step 5).

---

### Task 0: 공통 기반 — 트랙과 6단계, 선호 쌍 생성기, 놀이터 데이터, CI 단계

두 번에 나눠 디스패치한다. 0a(Step 1~3, Sonnet)와 0b(Step 4~9, Opus). 커밋도 둘이다.

**Files:**
- Modify: `js/posts.js`(`series['llm-training-track']`, `mlTrack.stages[5]`)
- Modify: `js/topics.js`(`TRACK_ORDER` 의 `'llm-ads-track'` 뒤에 `'llm-training-track'`, LLM 주제 설명 끝 문장)
- Create: `scripts/gen-training-data.py`, `js/training-dpo-pairs.js`(생성기가 쓴다)
- Modify: `.github/workflows/validate.yml`(`gen-copy-data.py --check` 바로 뒤에 한 단계)
- Test: `node scripts/validate-posts.js`, `python3 scripts/gen-training-data.py --check`, `node scripts/check-wording.js`, `node scripts/check-design.js`

**Interfaces:**
- Produces: `series['llm-training-track'] = { title: 'LLM 학습 트랙', desc, posts: ['sft-and-dpo', 'rlhf-rlaif-grpo-reward-model', 'knowledge-distillation', 'embedding-model-finetuning'] }`. `mlTrack.stages[5] = { id: 'stage-6', title, goal, posts: [기존 9개 + 위 4개] }`.
- Produces (`scripts/gen-training-data.py`): 리터럴 `COPY_POOL`(12줄, 줄마다 `(id, 카피, 글자 수, 숫자 일치 0|1, 근거 없는 최상급 0|1, 참조 로그 확률, 정책 로그 확률)`), `PREF_PAIRS`(20줄, 줄마다 `(id, chosen id, rejected id, 출처)`, 출처는 `gate`, `judge`, `edit`), `BETA = 0.1`, `DEFAULT_PAIR = 'd02'`, 등록 목록 `DATA_FILES = ['js/training-dpo-pairs.js']` 와 `POSTS = []`. 뒤 Task 가 `POSTS` 에 자기 글을 더한다(Task 1, 2).
- Produces (`js/training-dpo-pairs.js`): 주석 두세 줄(합쇼체, 「scripts/gen-training-data.py --write 가 쓰고 손으로 고치지 않습니다」와 칸 설명) 아래 `window.DPO_PAIRS = {"beta":0.1,"default":"d02","pairs":[[id, 출처, chosen id, rejected id, chosen 카피, rejected 카피, 정책 chosen, 정책 rejected, 참조 chosen, 참조 rejected], …]};` 한 줄. JSON 은 `ensure_ascii=False`, `separators=(',', ':')`.

`COPY_POOL` 의 값(가상). 글자 수는 공백과 문장 부호를 포함한 `len()`, 숫자 일치는 `numbers(카피) <= numbers(ASSET_RUNNING)`, 최상급은 `not gate_superlative(카피, ASSET_RUNNING)` 이다. 통과(게이트 셋)는 40자 이하, 숫자 일치 1, 최상급 0 이다.

| id | 카피 | 글자 | 숫자 | 최상급 | 참조 | 정책 | 통과 |
|---|---|---|---|---|---|---|---|
| c01 | 입문자용 러닝화 런솔 라이트 | 15 | 1 | 0 | -18.1 | -16.7 | 예 |
| c02 | 한 짝 240g, 처음 달리는 사람을 위한 러닝화 | 27 | 1 | 0 | -19.2 | -16.6 | 예 |
| c03 | 밑창 전체에 쿠션 폼을 깐 입문자용 러닝화 | 23 | 1 | 0 | -18.3 | -16.4 | 예 |
| c04 | 한 짝 240g 에 쿠션 폼을 깐, 처음 달리는 사람을 위한 러닝화 | 37 | 1 | 0 | -20.5 | -17.4 | 예 |
| c05 | 240g 으로 가볍고 앞코가 넉넉한 러닝화, 30일 안에 한 번 교환 | 38 | 1 | 0 | -20.8 | -18.5 | 예 |
| c06 | 한 짝 240g 으로 가볍고 밑창 전체에 쿠션 폼을 깐, 처음 달리는 사람을 위한 러닝화 | 49 | 1 | 0 | -23.3 | -20.5 | 길이 |
| c07 | 한 짝 240g 에 앞코가 넉넉하고 밑창 전체에 쿠션 폼을 깐 입문자용 러닝화 | 43 | 1 | 0 | -22.7 | -21.5 | 길이 |
| c08 | 한 짝 220g, 처음 달리는 사람을 위한 러닝화 | 27 | 0 | 0 | -18.0 | -19.6 | 숫자 |
| c09 | 가장 가벼운 입문자용 러닝화 런솔 라이트 | 22 | 1 | 1 | -16.7 | -14.0 | 최상급 |
| c10 | 입문 러너 1위 러닝화, 쿠션 폼을 깐 런솔 라이트 | 28 | 0 | 1 | -18.7 | -20.8 | 숫자, 최상급 |
| c11 | 한 짝 200g, 쿠션 폼을 깐 입문자용 러닝화 | 26 | 0 | 0 | -18.1 | -19.0 | 숫자 |
| c12 | 가장 편한 쿠션 폼 러닝화, 한 짝 240g 으로 처음 달리는 사람을 위해 만들었습니다 | 48 | 1 | 1 | -22.9 | -22.3 | 길이, 최상급 |

참조 열은 「글자 수 × 0.2 + 13.5」를 뺀 값에 후보마다 작은 차이를 둔 가상 값이다(긴 카피일수록 대체로 낮다). 정책 열은 참조 열에 후보마다 정한 변화를 더한 가상 값이다(DPO 를 조금 돌린 정책을 흉내 낸다. 최상급 카피 c09 를 아직 좋아한다).

`PREF_PAIRS`(가상):
- gate(chosen 은 통과, rejected 는 숫자나 최상급에 걸림): d01 c02>c08, d02 c03>c09, d03 c03>c11, d04 c04>c10, d05 c01>c09, d06 c02>c11.
- judge(둘 다 통과, 긴 카피가 이김. 판정자의 장황함 편향을 흉내 낸다): d07 c04>c01, d08 c05>c02, d09 c04>c03, d10 c05>c03, d11 c02>c01, d12 c05>c01, d13 c03>c01, d14 c04>c02.
- edit(광고주가 고친 카피가 chosen, 원래 카피가 rejected): d15 c05>c12, d16 c02>c10, d17 c04>c12, d18 c01>c10, d19 c03>c08, d20 c05>c09.
- 길이에만 걸리는 c06, c07 은 어느 쌍에도 나오지 않는다. 판정자 쌍이 40자 안에서만 「길수록 낫다」를 가르치고, 정책이 그 밖으로 넘어가는 자리를 두 글이 보이기 때문이다.

- [ ] **Step 1: 시작 상태** — Run: `git log --oneline -1 && node scripts/validate-posts.js && node -e "const m=require('./js/posts.js');console.log(Object.keys(m.series).length, m.mlTrack.stages.length, m.mlTrack.stages[5].posts.length, m.posts.length)" && python3 scripts/gen-copy-data.py --check && python3 scripts/gen-ads-data.py --check` Expected: 통과, `16 7 9 136`. 아니면 묶음 3 이 병합되지 않은 main 이니 멈추고 컨트롤러에게 알린다.
- [ ] **Step 2: 트랙과 단계** — `series` 의 `'llm-ads-track'` 바로 뒤에 `'llm-training-track'`. desc 「지훈 씨가 41주째부터 LLM 과 임베딩 모델을 직접 학습합니다. SFT 와 DPO, 보상 모델과 RLHF, 지식 증류, 임베딩 파인튜닝을 한 주에 하나씩 엽니다」. stage-6 의 title `'6단계, LLM 기초와 학습 — 호출 한 번부터 선호 학습과 증류까지'`, goal 「이 단계를 마치면: LLM 을 부르고, 답을 JSON 으로 받아 코드가 검사하게 할 수 있습니다. 문서를 넣어 답하게 하고, 도구를 고르게 하고, 답을 채점하고, 하루 비용을 셀 수 있습니다. 선호 쌍으로 모델을 학습하고, 보상 모델의 버릇을 찾고, 큰 모델을 작은 모델로 옮길 수 있습니다. 임베딩 모델도 클릭한 쌍으로 파인튜닝할 수 있습니다.」(문장마다 80자 이하, 확인함), posts 끝에 네 id. `js/topics.js` 의 `TRACK_ORDER` 에 `'llm-training-track'`, LLM 주제 desc 의 끝 문장을 「광고 응용 13편과 학습 4편이 뒤에 이어집니다.」로. Run: `node -e "const m=require('./js/posts.js');console.log(Object.keys(m.series).length, m.mlTrack.stages[5].posts.length, m.series['llm-training-track'].posts.join(','))"` Expected: `17 13 sft-and-dpo,rlhf-rlaif-grpo-reward-model,knowledge-distillation,embedding-model-finetuning`.
- [ ] **Step 3: 없는 글 넷을 잡는지, 0a 커밋** — Run: `node scripts/validate-posts.js; echo exit=$?` Expected: exit 1, 오류 8줄(series 넷, mlTrack stage-6 넷)뿐. 커밋 `js/posts.js js/topics.js`, `feat(tracks): LLM 학습 트랙과 6단계 열세 편, LLM 주제 설명`(이 상태로 커밋해도 된다).
- [ ] **Step 4: 생성기의 리터럴과 꼴 검사** — `scripts/gen-training-data.py`(표준 라이브러리, 맨 위 docstring 에 CLI 셋과 `--check` 의 대조 항목을 묶음 3 의 생성기처럼 적는다). `ASSET_RUNNING` 은 `scripts/gen-ads-data.py` 에서, `SUPERLATIVES`, `NUMBER`, `numbers`, `gate_length`, `gate_superlative` 는 `scripts/gen-copy-data.py` 에서 `importlib` 로 읽는다(옮겨 적지 않는다). 리터럴은 `COPY_POOL = [` 줄부터 닫는 `]` 줄까지 한 줄에 한 튜플, 들여쓰기 4칸, 문자열은 큰따옴표, 로그 확률은 소수 한 자리다. 꼴 검사(`--check` 의 0번): id 차례(c01~c12, d01~d20), 글자 수와 숫자 일치와 최상급이 위 정의로 다시 센 값과 같음, 로그 확률이 음수이고 소수 한 자리, chosen 과 rejected 가 다르고 둘 다 있음, 출처 수 6/8/6, gate 와 edit 의 chosen 은 통과하고 rejected 는 숫자나 최상급에 걸림, judge 는 둘 다 통과하고 chosen 이 더 김, c06 과 c07 은 쌍에 없음. 인자 없이 돌리면 후보 12줄(id, 글자, 숫자, 최상급, 통과, 참조, 정책)과 쌍 20줄(id, 출처, chosen>rejected, β 0.1 의 margin)과 요약을 찍는다. Run: `python3 scripts/gen-training-data.py | tail -4` Expected: 요약에 「통과 후보 5개 c01~c05」, 「출처별 글자 수 차이 평균 gate +0.2, judge +14.4, edit -3.8」, 「β 0.1 에서 margin 이 음수인 쌍 4개 d02, d05, d08, d20」.
- [ ] **Step 5: 데이터 파일과 대조** — `--write` 가 `js/training-dpo-pairs.js` 를 쓴다(쌍 차례대로, 카피는 `COPY_POOL` 에서 가져온다). `--check` 는 0번 꼴 검사 뒤 (1) `DATA_FILES` 의 파일마다 있고 지금 생성한 글 전체와 바이트까지 같은지, (2) `POSTS` 의 글마다 있고 그 글의 python 블록에 `COPY_POOL = [` 와 `PREF_PAIRS = [` 리터럴이 생성기의 것과 바이트까지 같은지, (3) `js/` 에 `training-` 으로 시작하는 파일 가운데 `DATA_FILES` 에 없는 것이 없는지, (4) `posts/` 에 `COPY_POOL = [` 나 `PREF_PAIRS = [` 로 시작하는 줄을 가진 글 가운데 `POSTS` 에 없는 것이 없는지 본다. 없는 파일, 다른 글자, 등록하지 않은 파일은 모두 실패이고 첫 다른 자리를 찍는다. 끝에 「대조 N건(데이터 파일 a, 글 b)」. Run: `python3 scripts/gen-training-data.py --write && python3 scripts/gen-training-data.py --check; echo exit=$? && wc -c js/training-dpo-pairs.js` Expected: 「대조 1건(데이터 파일 1, 글 0)」, exit=0, 10KB 이하.
- [ ] **Step 6: 실패해야 할 때 실패하는지** — 셋을 차례로 하고 각각 되돌린다. (a) `printf '//\n' > js/training-zz.js` → `--check` exit 1, 「등록하지 않은 파일 js/training-zz.js」 → `rm js/training-zz.js`. (b) `printf 'x\n' >> js/training-dpo-pairs.js` → exit 1, 「다른 글자」 → `--write`. (c) `posts/zz-check.md` 에 python 블록 하나를 쓰고 그 안에 `PREF_PAIRS = [` 줄과 `]` 줄을 둔다 → exit 1, 「등록하지 않은 글 posts/zz-check.md」 → `rm posts/zz-check.md`. Run: `python3 scripts/gen-training-data.py --check; echo exit=$?; git status --short` Expected: exit=0, 남은 변경은 생성기와 데이터 파일뿐(validate.yml 은 다음 단계).
- [ ] **Step 7: CI 단계** — validate.yml 의 `gen-copy-data.py --check` 단계 바로 뒤에 `- name: LLM 학습 트랙의 카피 후보와 선호 쌍 생성기, 놀이터 데이터, 글의 COPY_POOL 과 PREF_PAIRS 리터럴이 같은가` / `run: python scripts/gen-training-data.py --check`. Run: `grep -n "gen-training-data" .github/workflows/validate.yml` Expected: 한 줄.
- [ ] **Step 8: 디자인과 말투 게이트** — Run: `node scripts/check-wording.js && node scripts/check-design.js && node scripts/test-long-sentences.js` Expected: 통과(데이터 파일의 카피도 말투 검사 대상이다).
- [ ] **Step 9: 0b 커밋** — `scripts/gen-training-data.py js/training-dpo-pairs.js .github/workflows/validate.yml`, `feat(scripts): LLM 학습 트랙의 카피 후보 12개와 선호 쌍 20개 생성기, DPO 놀이터 데이터, CI 대조 단계`.

---

### Task 1: SFT 와 DPO (`sft-and-dpo`, 41주째, 2026-12-02)

**Files:**
- Create: `posts/sft-and-dpo.md`, `demo-sft-dpo-cards.html`, `js/sft-dpo-cards-demo.js`
- Modify: `js/posts.js`, `js/demo-edu-content.js`(`'sft-dpo-cards'`), `index.html`(137), `scripts/gen-training-data.py`(`POSTS` 에 `posts/sft-and-dpo.md`)
- Test: 「엔트리와 검사 전부」 + `gen-training-data.py --check`

**Interfaces:**
- Consumes: Task 0 의 `COPY_POOL`, `PREF_PAIRS` 리터럴(블록 2 에 글자 그대로), `BETA` 0.1.
- Produces: `dpo_numbers(pol_w, pol_l, ref_w, ref_l, beta=0.1) -> (margin, loss, weight)`. margin 은 `beta * ((pol_w - ref_w) - (pol_l - ref_l))`, loss 는 `-log σ(margin)`, weight 는 `σ(-margin)` 이다. Task 5 의 놀이터가 같은 식을 JS 로 옮긴다. 블록 2 의 d02 줄(꼴은 아래)을 Task 5 가 대조한다. 블록 3 이 찍는 θ 를 Task 2 가 링크와 함께 인용한다.

파이썬 셋(이어서):

1. **SFT 한 걸음과 DPO 한 걸음(토큰 장난감).** 다음 토큰 확률이 앞 토큰과 상관없는 가장 작은 언어 모델(유니그램)이다. 어휘 12개 `['240g', '쿠션', '폼', '입문자용', '러닝화', '가장', '가벼운', '한', '짝', '1위', '편한', '교환']`, 토큰 점수(로짓) 모두 0 에서 시작. chosen `'240g 쿠션 폼 입문자용 러닝화'`, rejected `'가장 가벼운 쿠션 폼 러닝화'`(공백으로 나눈 토큰 다섯씩, 셋이 같다). 시퀀스 로그 확률은 토큰 로그 확률의 합이다. SFT 는 chosen 의 로그 확률을 학습률 0.5 로 한 걸음 올린다(기울기는 토큰마다 「chosen 에 든 횟수 − 5 × 확률」). DPO 는 같은 시작점을 참조 모델로 두고 β 0.1, 학습률 5.0 으로 한 걸음 간다. 찍을 것: 시작, SFT 뒤, DPO 뒤의 chosen 과 rejected 로그 확률, 두 걸음의 토큰 점수 변화 12개, 「DPO 걸음에서 공유 토큰 셋의 변화」(원인 줄: 두 카피의 길이가 같으면 확률 항이 지워져 공유 토큰의 기울기가 0 이다).
2. **선호 쌍 20개와 DPO 손실.** `COPY_POOL`, `PREF_PAIRS` 리터럴 + `dpo_numbers`. 찍을 것: 출처별 쌍 수와 chosen − rejected 글자 수 평균(원인 줄), 20쌍마다 한 줄 `f'{pid} {src} {w}>{l} 정책 {pw:.1f} {pl:.1f} 참조 {rw:.1f} {rl:.1f} margin {m:+.3f} 손실 {loss:.3f} 무게 {wt:.3f}'`(줄은 70자 안팎), 평균 손실, margin 이 음수인 쌍 id, β 0.01, 0.1, 0.5, 1.0 의 평균 손실과 평균 무게.
3. **과최적화 후퇴.** 정책은 `참조 로그 확률 + dot(θ, φ)` 를 12개 위에서 소프트맥스한 것, φ = (글자 수 / 10, 숫자 일치, 최상급), θ 는 0 에서 시작(이 묶음의 글과 코드에서 내적은 가운뎃점 대신 `dot` 이나 말로 쓴다). DPO 손실의 기울기는 쌍 20개 평균 `β σ(-β dot(θ, Δφ)) Δφ` 이고(log Z 는 쌍 안에서 지워진다), θ 를 학습률 2.0 으로 300걸음 올린다. 25걸음마다(13줄) 걸음, 손실, θ 셋, 통과율(통과 후보 확률의 합, 기댓값), 쌍에 나오지 않은 c06 과 c07 의 확률 합(원인 줄), 평균 글자 수, KL(정책‖참조), 확률이 가장 큰 후보를 찍는다. 이어서 통과율이 가장 높은 체크포인트(같으면 앞의 것)와 300걸음을 비교하는 줄, 그 체크포인트로 되돌린다는 줄. 끝에 LoRA 의 학습 가중치 수: 4096 × 4096 행렬에 r 4, 8, 16 이면 `r × (4096 + 4096)` 과 그 비율, 그리고 이 블록이 고친 가중치 3개.

계획서가 같은 식과 차례로 미리 돌린 값(다르면 식과 차례를 먼저 맞추고, 그래도 다르면 블록 값을 쓰고 보고서에 적는다):
- 블록 1: 시작 둘 다 -12.425. SFT 뒤 chosen -11.121, rejected -12.121(토큰 점수 +0.292 다섯, -0.208 일곱). DPO 뒤 chosen -11.977, rejected -12.977(+0.250 둘, -0.250 둘, 나머지 0.000).
- 블록 2: 쌍 수 6/8/6, 글자 수 차이 +0.2/+14.4/-3.8. `d02 gate c03>c09 정책 -16.4 -14.0 참조 -18.3 -16.7 margin -0.080 손실 0.734 무게 0.520`. 평균 손실 0.613. 음수 margin d02, d05, d08, d20. β 0.01/0.1/0.5/1.0 의 평균 손실 0.684/0.613/0.431/0.370, 평균 무게 0.496/0.457/0.325/0.256.
- 블록 3: 통과율 0.255(0) → 0.449(25) → 0.597(50, 가장 높음) → 0.473(75) → 0.299(100) → 0.008(300). 손실 0.693 → 0.354 로 내내 줄어든다. θ(300) = (+7.07, +7.78, -9.01). c06+c07 0.002 → 0.992, 평균 글자 23.3 → 48.8, KL 0 → 7.19, 75걸음부터 가장 큰 후보 c06. LoRA 32,768 / 65,536 / 131,072(0.20% / 0.39% / 0.78%).
- 꼭 성립할 것: 손실은 300걸음 내내 줄고, 통과율은 처음보다 올랐다가 300걸음에서 처음보다 낮다.

데크(`sd-`, 4장, 범례: 파랑 참조 모델과 선호 쌍, 벽돌색 학습하는 정책, 먹색 손실과 기울기, 회색 게이트에 걸린 카피, 점선 게이트 조건):
- `sft` SFT STEP 「SFT 한 걸음과 DPO 한 걸음」. 캡션 「SFT 한 걸음에 chosen 은 -12.425 에서 -11.121, rejected 는 -12.121 로 같이 올랐습니다. DPO 한 걸음은 공유 토큰 셋의 점수를 0.000 움직였습니다.」
- `pairs` PAIR SOURCES 「선호 쌍 20개의 출처 셋」. 캡션 「게이트 6쌍, 판정자 8쌍, 광고주 편집 6쌍입니다. 판정자 쌍은 chosen 이 rejected 보다 평균 14.4자 깁니다.」
- `loss` DPO LOSS 「로그 확률 넷으로 세는 손실」. 캡션 「d02 는 정책이 최상급 카피 쪽으로 기울어 margin -0.080, 손실 0.734, 무게 0.520 입니다.」
- `overopt` OVER-OPTIMIZATION 「오래 학습하면 꺾이는 통과율」. 캡션 「손실은 300걸음 내내 0.693 에서 0.354 로 줄었습니다. 통과율은 50걸음의 0.597 에서 300걸음의 0.008 로 떨어졌습니다.」
(캡션의 숫자는 블록 출력과 맞춰 고친다. 위 캡션은 80자 검사를 통과한다.)

절: 1 SFT 는 좋은 답 하나를 따라 쓰게 합니다(파이썬 1, 카드 sft) / 2 선호 쌍 20개를 세 곳에서 모읍니다(파이썬 2, 표: 출처, 쌍 수, chosen 과 rejected 를 정하는 법, 글자 수 차이, 카드 pairs) / 3 DPO 손실은 로그 확률 넷으로 셉니다(표: d02 를 넣은 쌍 다섯의 네 값, 두 비율, margin, 손실, 무게, 카드 loss) / 4 기울기는 정책이 틀린 쌍을 더 세게 밉니다(표: β 넷의 평균 손실과 무게, 음수 margin 쌍) / 5 오래 학습하면 통과율이 후퇴합니다(파이썬 3, 표: 체크포인트 0, 50, 100, 300, 카드 overopt) / 6 LoRA 는 고칠 가중치를 줄입니다(표: 블록 3 끝의 가중치 수) / 7 두 무대(담장 안은 광고주 편집과 심사 결과가 한 회사에 쌓여 쌍을 모으기 쉽다, 열린 RTB 의 DSP 는 매체의 심사 결과를 받지 못할 수 있어 쌍의 출처가 준다) / 한눈 정리 / 헷갈리기 쉬운 점(DPO 손실이 줄어도 카피가 좋아진 것은 아니다, DPO 는 chosen 의 확률을 올리는 것이 아니라 두 비율의 차이를 벌린다(블록 3 에서 쌍에 없는 c06 이 확률을 가져감), β 는 학습률이 아니다) / 더 깊이 보기(`:::deep` DPO 손실과 기울기의 식, SFT 손실과 토큰 점수의 기울기, LoRA 의 식. 링크: LLM-as-a-Judge, 광고 카피 생성, 생성 문구 판정 체계, 데크) / 참고문헌.

도입: 지훈 씨가 41주째에 카피를 쓰는 모델을 직접 고치게 된다. 걸러진 카피와 남은 카피, 판정자가 고른 쪽, 광고주가 고친 문장이 쌓여 있다. 선배는 좋은 카피만 따라 쓰게 하면 나쁜 카피도 같이 늘 수 있다고 말한다(개념어 없이, 40주째 편을 한 문장으로 잇는다).

참고문헌(열어서 확인한 것만 쓴다):
- Ouyang et al. 2022, *Training language models to follow instructions with human feedback*, arXiv:2203.02155. 확인할 것: 세 단계(시연으로 SFT, 비교로 보상 모델, PPO), 라벨러가 답 여럿을 순위 매겨 비교 쌍을 만든 방법.
- Rafailov et al. 2023, *Direct Preference Optimization: Your Language Model is Secretly a Reward Model*, arXiv:2305.18290. 확인할 것: DPO 손실 식, 암묵적 보상 `β log(π/π_ref)`, 기울기의 무게 항과 그 해석, 참조 모델을 SFT 모델로 두는 방법, 과최적화를 다룬 문장.
- Hu et al. 2021, *LoRA: Low-Rank Adaptation of Large Language Models*, arXiv:2106.09685. 확인할 것: `W0 + BA`, 초기값, 학습 가중치와 메모리를 줄인 수치와 그 비교 조건.
- Christiano et al. 2017, *Deep reinforcement learning from human preferences*, arXiv:1706.03741. 확인할 것: 두 조각 가운데 사람이 고른 쪽으로 보상을 배우는 선호 모델.

카테고리 `LLM & Agents`, `Measurement & Modeling`. 태그 `Fine-tuning`, `LLM`.

- [ ] **Step 1: 스캐폴드** — Run: `node scripts/new-post.js sft-and-dpo "SFT 와 DPO: 선호 쌍이 모델을 어느 쪽으로 미는지 손으로 계산" "LLM & Agents" "Fine-tuning,LLM" both` 뒤 date `2026-12-02`, `series: 'llm-training-track'`, 둘째 카테고리. Expected: posts.js 엔트리와 md 뼈대.
- [ ] **Step 2: 생성기 등록** — `POSTS` 에 `posts/sft-and-dpo.md`. Run: `python3 scripts/gen-training-data.py --check; echo exit=$?` Expected: 글의 리터럴이 아직 없어 exit 1(블록을 쓴 뒤 Step 5 에서 통과).
- [ ] **Step 3: 데크 4장** — `'sft-dpo-cards'` 엔트리(analogy, anchor `.tg-host`, embedKeep `['.tg-grid']`, embedHide `['.tg-hero', '.tg-real']`, 카드마다 헷갈리는 것 하나, tour 셋). 마크업은 `demo-copy-judge-cards.html` 을 복사해 바꾼다. Run: `node scripts/check-design.js demo-sft-dpo-cards.html && node scripts/check-page-sentences.js` 와 Global Constraints 의 데크 문장 명령. Expected: 통과, `80자 초과 0`.
- [ ] **Step 4: 글 본문** — 블록 셋(이어서). 블록 2 가 두 리터럴을 생성기와 글자 그대로 담는다. 블록 3 의 첫 주석과 5절 산문에 「통과율은 후보 12개에 둔 확률로 센 기댓값」을 한 번 적는다. 블록 2 의 정책 열은 DPO 를 조금 돌린 정책을 흉내 낸 가상 표이고 블록 3 은 참조 모델(θ = 0)에서 다시 시작한다는 것, 블록 3 의 확률은 후보 12개 안에서만 소프트맥스로 나눈 값이라는 것을 5절 첫 문단에 한 번씩 밝힌다. 가상 데이터를 한 번 밝힌다.
- [ ] **Step 5: 출력** — `--show` 로 뽑아 붙인다. Run: `time python3 scripts/check-python-outputs.py --post sft-and-dpo && python3 scripts/check-python-outputs.py --post sft-and-dpo && python3 scripts/gen-training-data.py --check` Expected: 두 번 통과, real 10초 안, 「대조 2건(데이터 파일 1, 글 1)」.
- [ ] **Step 6: 엔트리와 검사 전부** — Global Constraints 의 목록. 추가로 `grep -c "기댓값" posts/sft-and-dpo.md` 가 1 이상. 원인을 말하는 문장마다 근거 출력 줄을 보고서에 짝지어 적는다(블록 1 의 공유 토큰 0.000, 블록 2 의 출처별 글자 수, 블록 3 의 θ 와 c06+c07).
- [ ] **Step 7: 커밋** — 글, posts.js, index.html, 데크 둘, demo-edu-content.js, 생성기. `feat(posts): SFT 와 DPO — 선호 쌍이 모델을 어느 쪽으로 미는지 손으로 계산. LLM 학습 트랙 첫째 글`.

---

### Task 2: RLHF, RLAIF, GRPO 와 보상 모델 (`rlhf-rlaif-grpo-reward-model`, 42주째, 2026-12-03)

**Files:**
- Create: `posts/rlhf-rlaif-grpo-reward-model.md`, `demo-reward-loop-cards.html`, `js/reward-loop-cards-demo.js`
- Modify: `js/posts.js`, `js/demo-edu-content.js`(`'reward-loop-cards'`), `index.html`(138), `scripts/gen-training-data.py`(`POSTS` 에 이 글)
- Test: 「엔트리와 검사 전부」 + `gen-training-data.py --check`

**Interfaces:**
- Consumes: Task 0 의 두 리터럴(블록 1 에 글자 그대로), Task 1 블록 3 이 찍은 θ 의 길이 가중치 증가(인용만, 링크와 함께), LLM-as-a-Judge 편의 약속 둘(학습 보상은 판정의 버릇까지 따라간다, 판정 모델은 학습 도중에 바꾸지 않는다. 그 편 5절과 헷갈리기 쉬운 점), 생성 문구 판정 체계 편의 세 겹(노출 전 게이트, 오프라인 비교, 사후 원인 귀속).
- Produces: 없음.

파이썬 셋(이어서). φ 와 정책, 통과는 Task 1 과 같은 식이다.

1. **보상 모델.** 선형 보상 `r(c) = dot(w, φ(c))` 를 Bradley-Terry 손실 `-log σ(r(w) - r(l))` 로 배운다. w 는 0 에서 시작, 쌍 평균 기울기, 학습률 1.0, 200걸음. 20쌍 모두로 배운 것이 판정자 A 의 보상 모델 `w_A`, 판정자 쌍 8개를 뺀 gate 와 edit 12쌍으로 배운 것이 판정자 B 의 `w_B` 다. 찍을 것: 출처별 글자 수 차이 평균(원인 줄), `w_A` 와 `w_B`, 각자 맞힌 쌍 수와 평균 손실, 후보 12개의 `r_A`, `r_B`, 통과.
2. **KL 세기와 보상 해킹, GRPO.** RLHF 목적 `E_π[r_A] - β KL(π‖π_ref)` 의 최적 정책은 후보가 12개라 `π_β(c) ∝ π_ref(c) exp(r_A(c)/β)` 로 바로 센다. β 4, 2, 1, 0.5, 0.25 마다 E[r_A], KL, 통과율, 평균 글자 수, 확률이 가장 큰 후보를 찍는다. 이어서 GRPO: `rng = random.Random(7)`, 후보 id 는 `COPY_POOL` 차례, 걸음마다 `rng.choices(ids, weights=[π(c) …], k=8)` 로 묶음 8개를 뽑고, 이점 `A_i = (r_i - 평균) / 모표준편차`(0 이면 0). θ 갱신은 `θ += 0.3 × [ (1/8) Σ A_i (φ(c_i) - E_π φ) - 0.04 × Cov_π(φ) θ ]` 이다(뒤 항은 KL 의 기울기를 12개 위에서 정확히 센 것). 60걸음. 첫 묶음(후보, 보상, 이점)과 평균, 20걸음마다 E[r_A], 통과율, 평균 글자 수를 찍는다.
3. **학습 도중 판정자 바꾸기.** 세 실행: A 만 120걸음, A 60걸음 뒤 B 60걸음, B 만 120걸음. 기울기는 `E_π[(φ - E_π φ)(r - 0.5 log(π/π_ref))]`(β 0.5 의 목적을 정확히 센 것), 학습률 0.05. 20걸음마다 걸음, 쓰는 판정자, 적힌 보상(쓰는 판정자로 잰 값), A 로 잰 값, B 로 잰 값, KL, 통과율, 평균 글자 수. 끝에 요약 셋: 바꾼 실행의 60걸음째 적힌 보상의 변화(정책은 그대로), 120걸음에 B 로 잰 두 실행의 차이, A 로 잰 값이 바꾼 뒤 줄어든 것.

계획서가 미리 돌린 값:
- 블록 1: `w_A` = (+2.79, +4.11, -5.51), 20쌍 모두 맞힘. `w_B` = (-0.32, +4.17, -4.42), 12쌍 모두 맞힘.
- 블록 2: β 4/2/1/0.5/0.25 의 E[r_A] 8.76/11.63/15.56/17.54/17.77, KL 0.29/1.37/4.17/6.83/7.38, 통과율 0.522/0.732/0.506/0.042/0.000, 평균 글자 24.9/29.9/41.2/48.2/49.0, β 1 부터 가장 큰 후보 c06. GRPO 첫 묶음 평균 7.05, c03 이점 +1.75. 통과율 0.255 → 0.481(20) → 0.146(40) → 0.031(60), E[r_A] 6.58 → 17.38.
- 블록 3: A 만은 통과율이 40걸음 0.497 에서 120걸음 0.173. 바꾼 실행은 60걸음째 적힌 보상이 14.95 에서 2.34, 120걸음 B 로 잰 값 2.40, 통과율 0.745, A 로 잰 값 14.95 → 10.70. B 만은 120걸음 B 3.19, 통과율 0.903.
- 꼭 성립할 것: β 가 작을수록 E[r_A] 는 오르고 통과율은 한 번 오른 뒤 0.1 아래로 떨어진다. GRPO 60걸음 끝의 통과율이 처음보다 낮다. 바꾼 실행의 60걸음째 적힌 보상이 10 넘게 떨어지고, 120걸음 B 로 잰 값이 B 만 쓴 실행보다 낮다.

데크(`rw-`, 4장, 범례: 파랑 선호 쌍과 참조 정책, 벽돌색 학습하는 정책, 먹색 보상 모델(판정자 A, B), 회색 게이트에 걸린 카피, 점선 KL 항과 고정할 판정자 버전):
- `loop` REWARD LOOP 「선호 쌍 → 보상 모델 → 정책」. 캡션 「보상 모델은 20쌍을 모두 맞혔고, 글자 10자에 2.79 를 더합니다. 판정자 쌍을 빼고 배우면 -0.32 입니다.」
- `hack` REWARD HACKING 「KL 을 약하게 걸수록」. 캡션 「β 를 2 에서 0.25 로 내리자 보상은 11.63 에서 17.77 로 올랐습니다. 통과율은 0.732 에서 0.000 이 되었습니다.」
- `grpo` GROUP ADVANTAGE 「묶음 평균을 기준으로」. 캡션 「카피 8개의 보상 평균은 7.05 이고, c03 의 이점은 +1.75 입니다. 60걸음 뒤 통과율은 0.255 에서 0.031 로 떨어졌습니다.」
- `switch` JUDGE SWITCH 「학습 도중 판정자를 바꾸면」. 캡션 「60걸음째 정책은 그대로인데 적힌 보상이 14.95 에서 2.34 로 떨어졌습니다. 120걸음에 B 로 잰 값은 2.40 으로, 처음부터 B 를 쓴 3.19 보다 낮습니다.」

절: 1 RLHF 는 선호 쌍으로 보상 모델을 먼저 만듭니다(표: SFT, 보상 모델, PPO 세 단계와 DPO 의 차이, 카드 loop) / 2 보상 모델은 판정자의 버릇까지 배웁니다(파이썬 1. RLAIF 는 선호 라벨을 사람 대신 LLM 판정자가 붙이는 것이고, 이 글의 judge 쌍이 그 자리다) / 3 KL 을 약하게 걸수록 보상 해킹이 커집니다(파이썬 2, 표: β 다섯, 카드 hack) / 4 GRPO 는 값 모델 없이 묶음 평균을 기준으로 씁니다(표: 첫 묶음 8개와 20걸음마다의 값, 카드 grpo) / 5 판정자를 학습 도중에 바꾸면 앞뒤 점수를 비교할 수 없습니다(파이썬 3, 표: 세 실행의 60, 120걸음, 카드 switch) / 6 판정자를 보상으로 쓸 때 고정할 것과 따로 잴 것(표: 판정자 모델, 채점표, temperature, 버전은 한 학습 동안 고정. 노출 전 게이트의 통과율은 보상과 따로 잰다. 체크포인트는 판정자 하나로 다시 잰다. 학습에 쓴 판정자 버전을 카피와 함께 남겨 사후 원인 귀속이 거슬러 가게 한다. 생성 문구 판정 체계 편의 세 겹으로 잇는다) / 7 두 무대(담장 안은 판정자, 정책, 게이트를 한 회사가 굴려 버전을 고정하고 같은 자로 다시 잴 수 있다, 열린 RTB 의 DSP 는 매체와 거래소의 심사를 따로 받아 그 기준이 DSP 밖에서 바뀔 수 있다) / 한눈 정리 / 헷갈리기 쉬운 점(보상이 오르면 좋아진 것이 아니다, RLAIF 의 판정자는 사람보다 덜 틀리는 것이 아니라 사람 대신 라벨을 붙인다, GRPO 의 묶음 평균은 보상 모델을 대신하지 않고 값 모델을 대신한다) / 더 깊이 보기(`:::deep` RLHF 목적과 닫힌 꼴의 최적 정책, 그 식에서 DPO 손실이 나오는 길(41주째 편 링크), GRPO 의 이점과 KL 항, Bradley-Terry 손실. 링크: SFT 와 DPO, LLM-as-a-Judge, 생성 문구 판정 체계, 데크) / 참고문헌.

도입: 42주째 월요일, 지난주 오래 학습한 모델이 긴 카피만 내놓는다. 판정자의 점수는 계속 올랐다. 서연 씨는 40자를 넘어 걸린 카피가 늘었다고 알린다. 지훈 씨는 점수를 준 쪽을 의심한다(개념어 없이).

참고문헌(열어서 확인한 것만):
- Ouyang et al. 2022, arXiv:2203.02155. 확인할 것: 보상 모델의 비교 손실, PPO 단계의 KL 항.
- Bai et al. 2022, *Constitutional AI: Harmlessness from AI Feedback*, arXiv:2212.08073. 확인할 것: AI 피드백으로 선호 라벨을 만드는 단계와 그 이름.
- Lee et al. 2023, *RLAIF: Scaling Reinforcement Learning from Human Feedback with AI Feedback*(판에 따라 제목 앞에 「RLAIF vs. RLHF:」), arXiv:2309.00267. 확인할 것: RLAIF 와 RLHF 를 비교한 과제와 결과, 그 조건.
- Shao et al. 2024, *DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models*, arXiv:2402.03300. 확인할 것: GRPO 의 묶음 이점(평균과 표준편차로 정규화), 값 모델을 두지 않는 까닭, KL 항을 손실에 두는 방법과 계수. 이 글의 0.04 가 논문 값과 같다고 쓰려면 원문에서 찾은 뒤에만 쓴다.
- Gao et al. 2022, *Scaling Laws for Reward Model Overoptimization*, arXiv:2210.10760. 확인할 것: 대리 보상과 금 보상(gold reward)이 KL 에 따라 어떻게 움직이는지, 그 실험 설정.

카테고리 `LLM & Agents`, `Measurement & Modeling`. 태그 `Fine-tuning`, `LLM Evaluation`, `LLM`.

- [ ] **Step 1: 스캐폴드** — `node scripts/new-post.js rlhf-rlaif-grpo-reward-model "RLHF, RLAIF, GRPO 와 보상 모델: 판정자를 보상으로 쓰면 무엇을 배우나" "LLM & Agents" "Fine-tuning,LLM Evaluation,LLM" both`, date `2026-12-03`, series, 둘째 카테고리.
- [ ] **Step 2: 생성기 등록** — `POSTS` 에 이 글. (블록을 쓰기 전에는 `--check` 가 실패한다.)
- [ ] **Step 3: 데크 4장** — `'reward-loop-cards'` 엔트리, 꼴은 Task 1 과 같다. Run: `node scripts/check-design.js demo-reward-loop-cards.html && node scripts/check-page-sentences.js` 와 데크 문장 명령. Expected: 통과, `80자 초과 0`.
- [ ] **Step 4: 글 본문** — 블록 셋(이어서), 블록 1 이 두 리터럴을 글자 그대로 담는다. 블록 2 의 첫 주석과 3절 산문에 「통과율과 보상은 후보 12개에 둔 확률로 센 기댓값이고, GRPO 만 묶음을 뽑는다」를 한 번 적는다. 판정자 B 가 12쌍으로 배운 흉내라는 것을 5절에서 밝힌다.
- [ ] **Step 5: 출력** — Run: `time python3 scripts/check-python-outputs.py --post rlhf-rlaif-grpo-reward-model && python3 scripts/check-python-outputs.py --post rlhf-rlaif-grpo-reward-model && python3 scripts/gen-training-data.py --check` Expected: 두 번 통과, real 10초 안, 「대조 3건(데이터 파일 1, 글 2)」.
- [ ] **Step 6: 엔트리와 검사 전부** — Global Constraints 의 목록. 추가로 `grep -c "기댓값" posts/rlhf-rlaif-grpo-reward-model.md` 1 이상, `grep -c "post.html?id=llm-as-a-judge" posts/rlhf-rlaif-grpo-reward-model.md` 와 `grep -c "post.html?id=generated-copy-judging-system" posts/rlhf-rlaif-grpo-reward-model.md` 각 1 이상. 원인 문장과 근거 줄의 짝을 보고서에 적는다(출처별 글자 수, `w_A` 와 `w_B` 의 길이 가중치, β 표의 평균 글자 수, 세 실행의 A 와 B 로 잰 값).
- [ ] **Step 7: 커밋** — 글, posts.js, index.html, 데크 둘, demo-edu-content.js, 생성기. `feat(posts): RLHF, RLAIF, GRPO 와 보상 모델 — 판정자를 보상으로 쓰면 무엇을 배우나`.

---

### Task 3: 지식 증류 (`knowledge-distillation`, 43주째, 2026-12-04)

**Files:**
- Create: `posts/knowledge-distillation.md`, `demo-kd-methods-cards.html`, `js/kd-methods-cards-demo.js`
- Modify: `js/posts.js`, `js/demo-edu-content.js`(`'kd-methods-cards'`), `index.html`(139)
- Test: 「엔트리와 검사 전부」

**Interfaces:**
- Consumes: LLM 라벨링과 증류 편(33주째, `llm-labeling-distillation`)을 링크한다. 그 편이 다룬 것(LLM 교사의 라벨 1만 건, 하드 라벨로 배운 학생, 일치율과 kappa, 클릭과의 차이, 라벨 100만 건의 값, 더 깊이 보기의 소프트 라벨 한 문단)은 다시 하지 않고 한두 문장과 링크로 잇는다. 설계 4절의 학생 모델, 서빙 비용, LLM 요청 한 건, 가상 단가, 하루 노출.
- Produces: 없음.

가상 교사와 데이터(블록 1, 이 차례로 뽑는다): `rng = random.Random(7)`. 라벨 넷 `['상', '중', '하', '무관']`, `ALPHA = [3.0, 1.0, -1.0, -3.0]`, `BETA = [-2.2, 0.6, 0.6, -2.2]`. 교사 가중치 `A` 8줄, 줄마다 학생이 보는 피처 여섯의 `rng.gauss(0, 0.5)` 여섯과 교사만 보는 피처 둘의 `rng.gauss(0, 0.25)` 둘. 이어서 `V` 8개 `rng.gauss(0, 1.0)`. 이어서 쌍 2,000개, 쌍마다 보이는 피처 `rng.gauss(0, 1)` 여섯과 숨은 피처 `rng.gauss(0, 1)` 둘. 교사 벡터 `h = tanh(A x)`(8개), 관련 점수 `s = dot(V, h)`, 라벨 로짓 `ALPHA × s + BETA`. 학습 1,000(앞), 시험 1,000(뒤), 적은 쌍은 학습 앞 250쌍을 50쌍씩 다섯 벌로 나눠 평균한다. 피처는 이름 없이 「학생이 보는 피처 여섯(표준화한 값)」과 「광고 문장을 읽어야 아는 피처 둘(교사만 본다)」로 쓴다.

학생: 소프트맥스 로지스틱 회귀(피처 6개 + 절편, 라벨 넷, 가중치 0 에서 시작, 경사 하강 200회, 학습률 1.0, 기울기는 쌍 평균). 소프트 타깃은 `softmax(교사 로짓 / T)` 이고 학생도 `/T` 로 학습한다. Hinton 외처럼 손실에 T² 를 곱하므로 코드의 기울기에는 T 가 곱해진다. 평가: 시험 1,000쌍에서 학생과 교사의 가장 큰 라벨이 같은 비율(일치율)과, T=1 의 두 확률의 차이(라벨 넷의 절댓값 차이 합의 절반, 평균).

파이썬 셋(이어서):
1. 교사 라벨의 수, 학습 쌍 가운데 처음으로 교사 라벨이 「중」인 쌍의 확률을 T 1, 2, 4 로(원인 줄: 온도가 가장 큰 라벨 밖의 몫을 펼친다), 라벨 증류(교사의 가장 큰 라벨을 원-핫으로) 학생의 일치율과 확률 차이를 50쌍 다섯 벌 평균과 1,000쌍으로.
2. 로짓 증류 T 1, 2, 4 마다 같은 두 값을 50쌍 다섯 벌 평균과 1,000쌍으로.
3. 임베딩 증류: 학생 인코더는 보이는 피처 여섯(+ 절편)을 8개로 옮기는 선형 사상이고, 교사 벡터 h 에 대한 평균 제곱 오차를 경사 하강 200회, 학습률 0.5 로 줄인다(기울기는 `XᵀX` 와 `XᵀH` 를 한 번 구해 두면 걸음마다 7×8 곱 몇 번이다. 이렇게 해야 10초 안에 든다). 점수는 교사의 머리(`V` 와 `ALPHA`, `BETA`)를 그대로 쓴다. 같은 두 값과 시험 쌍에서 학생 벡터와 교사 벡터의 평균 코사인. 이어서 서빙 비용표: 교사 작은 상용 모델과 큰 상용 모델(요청 한 건 1,200 + 150 토큰), 학생 CPU 서버(287 QPS, 시간당 480원), 학생 GPU 서버(2,300 QPS, 3,800원)의 요청 한 건, 100만 건, 하루 2억 2,800만 건의 값. 학생은 건수 ÷ QPS ÷ 3,600 × 시간당 값으로 센다. 끝에 학습 쌍 1,000개를 교사에게 받는 값과, 작은 상용 모델 교사가 CPU 학생의 몇 배인지.

계획서가 미리 돌린 값(블록 셋을 이어 돌리면 로컬에서 약 5.1초, 블록 2 까지 약 5.0초):
- 교사 라벨 563/445/460/532. 「중」 예(학습 쌍을 0부터 세어 7번): T1 [0.053, 0.567, 0.366, 0.014], T2 [0.135, 0.441, 0.354, 0.070], T4 [0.194, 0.351, 0.315, 0.140].
- 50쌍 다섯 벌 평균 / 1,000쌍의 (일치율, 확률 차이): 라벨 (0.685, 0.245) / (0.783, 0.159), 로짓 T1 (0.739, 0.193) / (0.781, 0.172), T2 (0.755, 0.180) / (0.783, 0.156), T4 (0.754, 0.178) / (0.789, 0.154), 임베딩 (0.758, 0.174) / (0.771, 0.161). 평균 코사인 0.922.
- 비용: 작은 상용 0.72원 / 720,000원 / 164,160,000원, 큰 상용 7.8원 / 7,800,000원 / 1,778,400,000원, CPU 학생 465원 / 105,923원(100만 건 / 하루), GPU 학생 459원 / 104,638원. 학습 쌍 1,000개 720원(작은 상용), 7,800원(큰 상용). 작은 상용 교사는 CPU 학생의 1,550배.
- 꼭 성립할 것: 50쌍에서 로짓 증류(T=2)와 임베딩 증류의 일치율이 라벨 증류보다 0.03 넘게 높다. 1,000쌍에서 다섯 학생의 일치율 차이가 0.03 안이다.
- 원인 문장 주의: 블록은 「적은 쌍에서 소프트 타깃이 앞선다」는 결과만 찍고 그 까닭은 찍지 않는다. 까닭은 Hinton 외가 적은 문장을 출처와 함께 옮기거나 「~로 보입니다」로 쓴다. 라벨이 둘뿐이면 온도가 펼칠 다른 라벨이 없다는 것은 식의 성질이라 써도 되지만, 이 블록의 수로 보였다고 쓰지 않는다.

데크(`kd-`, 4장, 범례: 파랑 교사의 출력, 벽돌색 학생의 답, 먹색 서버와 값, 회색 학생이 못 보는 피처, 점선 온도와 손실):
- `three` THREE TARGETS 「교사에게 받는 것 셋」. 캡션 「같은 쌍 1,000개에서 학생이 맞히는 것만 다릅니다. 라벨 하나, 확률 넷, 숫자 여덟입니다.」
- `soft` SOFT TARGETS 「온도가 펼친 확률」. 캡션 「T=1 에서 0.567 이던 중의 확률이 T=4 에서 0.351 이 되고, 상과 무관에도 몫이 생깁니다.」
- `small_data` FIFTY PAIRS 「쌍 50개로 배울 때」. 캡션 「50쌍에서 일치율은 라벨 0.685, 로짓 T=2 0.755, 임베딩 0.758 입니다. 1,000쌍에서는 셋이 0.771~0.789 입니다.」
- `cost` SERVING COST 「100만 건의 값」. 캡션 「100만 건에 교사는 작은 상용 모델로도 720,000원, 학생은 CPU 서버 한 대로 465원입니다.」

절: 1 교사에게 무엇을 받느냐로 증류가 셋으로 나뉩니다(표: 라벨, 로짓, 임베딩마다 교사에게 받는 것, 학생이 맞히는 것, 받을 수 있는 교사(라벨은 답 글자만 주는 API 로도, 로짓은 출력 확률에 손이 닿는 교사, 임베딩은 속 벡터에 손이 닿는 교사), 33주째 편과의 관계, 카드 three) / 2 라벨 증류는 교사의 답 글자만 배웁니다(파이썬 1) / 3 로짓 증류는 온도로 펼친 확률을 배웁니다(파이썬 2, 표: 「중」 예의 T 셋, 카드 soft) / 4 쌍이 적을 때 차이가 커집니다(표: 다섯 학생의 50쌍과 1,000쌍, 카드 small_data) / 5 임베딩 증류는 교사의 벡터를 따라 씁니다(파이썬 3) / 6 서빙 비용표가 결론입니다(표: 블록 3 의 비용, 카드 cost. 세 학생은 같은 서버 값으로 돌고, 세 방법의 차이는 학습 때 교사에게 받는 것과 적은 쌍의 일치율이다) / 7 두 무대(담장 안은 학생을 경매 점수 계산 안에 둔다, 열린 RTB 의 DSP 는 입찰 응답 시간 안에 학생이 판정한다) / 한눈 정리 / 헷갈리기 쉬운 점(온도는 학습 때만 쓰고 서빙 때 학생은 T=1 이다, 쌍이 많아지면 세 방법의 차이가 준다(1,000쌍 결과), 임베딩 증류의 학생은 교사의 머리와 짝이라 교사의 머리가 바뀌면 다시 배운다) / 더 깊이 보기(`:::deep` 소프트 타깃 손실과 T², DistilBERT 의 세 손실, FitNets 의 힌트. 링크: LLM 라벨링과 증류, LLM 유저 임베딩, 데크. 아직 없는 글 4 는 링크하지 않는다) / 참고문헌.

도입: 43주째, 33주째에 옮긴 학생은 큰 모델의 답 글자만 배웠다. 선배가 묻는다. 큰 모델이 어느 쪽으로 얼마나 기울었는지까지 받으면 무엇이 달라지나, 쌍을 50개밖에 못 받으면 어느 쪽이 낫나(개념어 없이).

참고문헌(열어서 확인한 것만):
- Hinton, Vinyals, Dean 2015, *Distilling the Knowledge in a Neural Network*, arXiv:1503.02531. 확인할 것: 온도를 둔 소프트 타깃, 기울기 크기 때문에 T² 를 곱한다는 문장, 적은 데이터 실험과 그 조건.
- Sanh et al. 2019, *DistilBERT, a distilled version of BERT: smaller, faster, cheaper and lighter*, arXiv:1910.01108. 확인할 것: 손실 셋(증류, 언어 모델, 코사인 거리), 줄인 크기와 속도와 유지한 성능의 수치와 비교 대상.
- Romero et al. 2014, *FitNets: Hints for Thin Deep Nets*, arXiv:1412.6550. 확인할 것: 교사의 중간 표현(힌트)을 학생의 중간 층이 따라 하게 하는 방법.

카테고리 `LLM & Agents`, `ML Infrastructure`. 태그 `Fine-tuning`, `Model Serving`, `LLM`.

- [ ] **Step 1: 스캐폴드** — `node scripts/new-post.js knowledge-distillation "지식 증류: 큰 모델의 답을 작은 모델에 옮기는 세 방법" "LLM & Agents" "Fine-tuning,Model Serving,LLM" both`, date `2026-12-04`, series, 둘째 카테고리.
- [ ] **Step 2: 데크 4장** — `'kd-methods-cards'` 엔트리. Run: `node scripts/check-design.js demo-kd-methods-cards.html && node scripts/check-page-sentences.js` 와 데크 문장 명령. Expected: 통과, `80자 초과 0`.
- [ ] **Step 3: 글 본문** — 블록 셋(이어서). 33주째 편과 다른 교사를 쓰는 까닭(그 교사는 라벨 글자만 낸다)과, 비용표의 교사 행이 설계의 요청 한 건 값이라 33주째 편의 배수와 다르다는 것을 한 번씩 밝힌다. 가상 데이터를 한 번 밝힌다.
- [ ] **Step 4: 출력** — `--show` 로 뽑아 붙인다.
- [ ] **Step 5: 출력 두 번과 시간** — Run: `time python3 scripts/check-python-outputs.py --post knowledge-distillation && python3 scripts/check-python-outputs.py --post knowledge-distillation` Expected: 두 번 통과, real 10초 안. 넘으면 1,000쌍의 T1 학습을 빼고(50쌍은 셋 다 둔다) 그 사실을 보고서에 적는다.
- [ ] **Step 6: 엔트리와 검사 전부** — Global Constraints 의 목록. 추가로 `grep -c "post.html?id=llm-labeling-distillation" posts/knowledge-distillation.md` 1 이상. 원인 문장과 근거 줄의 짝을 보고서에 적는다(온도별 「중」 예의 확률, 50쌍과 1,000쌍의 표, 평균 코사인).
- [ ] **Step 7: 커밋** — 글, posts.js, index.html, 데크 둘, demo-edu-content.js. `feat(posts): 지식 증류 — 큰 모델의 답을 작은 모델에 옮기는 세 방법`.

---

### Task 4: 임베딩 모델 파인튜닝 (`embedding-model-finetuning`, 44주째, 2026-12-05)

**Files:**
- Create: `posts/embedding-model-finetuning.md`, `demo-contrastive-cards.html`, `js/contrastive-cards-demo.js`
- Modify: `js/posts.js`, `js/demo-edu-content.js`(`'contrastive-cards'`), `index.html`(140)
- Test: 「엔트리와 검사 전부」 + 옮긴 함수 대조(Step 5)

**Interfaces:**
- Consumes: 임베딩과 벡터 검색 편(23주째)의 `DIM` 과 `embed`(글자 그대로), Two-Tower 학습 편 3절의 `softmax` 와 `batch_loss`(글자 그대로, 손실 값을 그 함수로 한 번 잰다), 설계 4절의 장난감 임베딩 모델.
- Produces: 없음.

낱말 50개(블록 1 의 리터럴 `GROUPS`, 묶음 이름과 낱말 다섯, 이 차례). 앞 여덟 묶음의 첫 셋은 23주째 편 `CATEGORIES` 의 낱말이다.
- 캠핑: 캠핑의자, 캠핑테이블, 텐트, 타프, 랜턴
- 음향: 헤드폰, 무선이어폰, 블루투스스피커, 헤드셋, 이어버드
- 신발: 운동화, 스니커즈, 러닝화, 조깅화, 마라톤화
- 잡화: 선글라스, 손목시계, 모자, 버킷햇, 스마트워치
- 가방: 백팩, 크로스백, 여행가방, 캐리어, 배낭
- 주방: 프라이팬, 전기포트, 텀블러, 냄비, 전기그릴
- 뷰티: 선크림, 립밤, 핸드크림, 자외선차단제, 보습크림
- 육아: 유모차, 아기띠, 젖병, 기저귀, 아기의자
- 운동복: 운동복, 레깅스, 트레이닝복, 러닝셔츠, 요가복
- 전자: 노트북, 태블릿, 무선마우스, 키보드, 모니터

양성 쌍은 같은 묶음의 두 낱말을 「서로의 검색에서 클릭된 상품」으로 둔 가상 로그다. 200개 = 묶음 안 순서쌍 전부. 검증은 블록 1 의 `rng = random.Random(7)` 로 묶음마다(차례대로) 짝(i < j) 10개에서 `rng.sample(…, 2)`, 그 두 짝의 양쪽 방향 넷이다. 학습 160, 검증 40.

모델: 8차원 선형 사상 `W`(384 × 8). 낱말 벡터는 `embed(낱말)` 의 0 아닌 칸만 `W` 의 줄에 곱해 더한 뒤 길이 1 로 맞춘다. 질의와 짝에 같은 `W` 를 쓴다. 학습 함수 `train(tau, lr, epochs=40, seed=7)` 가 안에서 `random.Random(seed)` 를 만들어 `W` 를 `gauss(0, 0.3)` 로 줄 차례대로 채우고, 에포크마다 묶음 차례대로 묶음의 학습 쌍 16개를 섞는다. 배치는 16개, 배치 b 는 묶음마다 b번째 쌍 하나씩 10쌍이다. 손실은 10×10 점수표(코사인 ÷ τ)에서 줄마다 소프트맥스, 대각선에 -log, 평균(Two-Tower 학습 편과 같은 식). 기울기는 배치 평균 손실의 것이고 길이 맞춤을 거쳐 `W` 의 0 아닌 입력 줄만 SGD 로 고친다. recall@k: 검증 쌍 (a, b) 마다 a 와 다른 낱말 49개를 코사인으로 정렬해(같으면 목록 차례) b 가 위 k 개에 든 비율.

파이썬 셋(이어서):
1. 묶음 안 짝 100개 가운데 `embed` 의 겹친 칸이 0 인 짝 수, 다른 묶음끼리 겹친 칸이 있는 짝 수와 예 셋, 스니커즈와 운동화의 코사인, 쌍 수(200, 160, 40), 검증 40쌍 가운데 겹친 칸이 0 인 쌍 수(원인 줄: 글자 조각만 보는 임베딩은 이 쌍을 찾을 단서가 없다).
2. `train(0.05, 0.02)`. 8에포크마다(0, 8, 16, 24, 32, 39) 평균 손실, 평균 정답 칸 확률, 검증 recall@5 와 @10, 학습 recall@5. 학습 전(초기 `W`)과 뒤의 검증 recall@5, @10, 스니커즈와 운동화의 코사인. 학습 뒤 첫 배치의 점수표를 `batch_loss(table, 0.05)` 로 잰 값과 학습 식으로 잰 값이 같다는 줄. 배치마다 묶음 10개가 한 번씩이라는 줄(logQ 를 넣지 않는 원인 줄).
3. 온도 셋: `{0.05: 0.02, 0.2: 0.08, 1.0: 0.4}`(학습률은 0.4τ, 점수를 τ 로 나누면 기울기도 1/τ 배가 되기 때문이다). τ 마다 마지막 에포크의 평균 손실과 평균 정답 칸 확률(원인 줄), 검증 recall@5, @10, 스니커즈와 운동화의 코사인, 묶음 안 짝 100개의 평균 코사인과 가장 작은 값, 다른 묶음 짝의 평균 코사인(묶음이 한 방향으로 모였는지의 근거 줄). τ 0.05 줄이 블록 2 의 마지막 값과 같아야 한다.

계획서가 미리 돌린 값(블록 셋 이어서 약 1초):
- 블록 1: 겹친 칸 0 인 묶음 안 짝 90/100, 겹친 칸이 있는 다른 묶음 짝 17(캠핑의자와 아기의자, 무선이어폰과 무선마우스, 랜턴과 캐리어 등. 해시 충돌도 섞인다), 스니커즈와 운동화 0.000, 검증 40쌍 가운데 34쌍이 겹친 칸 0.
- 블록 2: 학습 전 검증 recall@5 0.100, @10 0.200. 마지막 손실 0.010, 정답 칸 확률 0.991, 검증 recall@5 0.675, @10 0.850, 학습 recall@5 1.000. 스니커즈와 운동화 -0.397 → 0.685.
- 블록 3: τ 0.05 (손실 0.010, 확률 0.991, 0.675, 0.850, 0.685), τ 0.2 (0.063, 0.939, 1.000, 1.000, 0.966), τ 1.0 (1.388, 0.250, 1.000, 1.000, 1.000). 묶음 안 평균 코사인(가장 작은 값)은 0.736(0.116), 0.957(0.790), 1.000(0.996), 다른 묶음 평균은 -0.063, -0.106, -0.111.
- 꼭 성립할 것: 학습 뒤 검증 recall@5 가 학습 전보다 0.3 넘게 높다. τ 1.0 의 정답 칸 확률이 0.3 아래다. 블록 3 의 τ 0.05 줄이 블록 2 와 같다. τ 0.05 가 가장 높지 않으면 그대로 적는다.

데크(`ib-`, 4장, 범례: 파랑 낱말과 양성 쌍, 벽돌색 배치의 점수표, 먹색 8차원 사상 W, 회색 검증 쌍(학습에 쓰지 않음), 점선 온도와 손실 식):
- `pairs` POSITIVE PAIRS 「묶음 10개와 양성 쌍 200개」. 캡션 「묶음 안의 짝 100개 가운데 90개는 글자 조각을 나누지 않습니다. 학습 160쌍, 검증 40쌍입니다.」
- `batch` IN-BATCH 「배치 하나의 10×10 점수표」. 캡션 「대각선 10칸이 정답이고 나머지 90칸이 음성입니다. 점수를 0.05 로 나눠 줄마다 소프트맥스를 겁니다.」
- `recall` RECALL@5 「학습 전과 뒤」. 캡션 「검증 쌍의 recall@5 가 0.100 에서 0.675 로 올랐습니다. 스니커즈와 운동화의 코사인은 -0.397 에서 0.685 가 되었습니다.」
- `temperature` TEMPERATURE 「온도 셋」. 캡션 「τ 0.05 는 학습 쌍의 정답 확률이 0.991 까지 올랐고 검증 recall@5 는 0.675 입니다. τ 1.0 은 0.250 에 머물렀고 검증 쌍을 모두 찾았습니다.」

절: 1 23주째의 장난감 임베딩은 뜻이 가까운 낱말을 모릅니다(파이썬 1) / 2 양성 쌍 200개와 검증 쌍 40개를 나눕니다(표: 묶음 열의 낱말, 쌍 수, 나누는 법, 카드 pairs) / 3 배치 안의 다른 쌍이 음성이 됩니다(파이썬 2, 카드 batch. Two-Tower 학습 편과 같은 손실이고 다른 점은 같은 W 를 양쪽에 쓰는 것, 묶음마다 한 쌍인 배치라 logQ 와 accidental hit 제거가 필요 없는 것) / 4 학습 뒤 검증 쌍의 recall@k 가 오릅니다(표: 학습 전과 뒤의 recall@5, @10, 스니커즈와 운동화, 카드 recall) / 5 온도가 작을수록 좋은 것은 아닙니다(파이썬 3, 표: 온도 셋, 카드 temperature. τ 1.0 은 묶음 안의 낱말을 한 방향으로 모아 묶음 안의 차이가 사라진다(코사인 1.000)) / 6 Sentence-BERT 에서 contrastive 학습으로 오기까지(표: Sentence-BERT 의 원래 목적들, in-batch negatives 를 쓰는 SimCSE 와 DPR, InfoNCE, 이 글의 장난감) / 7 두 무대(담장 안은 검색 로그의 질의와 클릭이 양성 쌍이 된다, 열린 RTB 의 DSP 는 이긴 노출의 클릭으로만 쌍을 얻어 쌍이 적다) / 한눈 정리 / 헷갈리기 쉬운 점(recall@k 는 23주째 편의 재현율@10 과 다른 값이다, 같은 묶음이 한 배치에 두 번 들면 정답이 음성 칸에 앉는다(Two-Tower 학습 편의 accidental hit), 학습 쌍의 recall 이 1 이어도 검증 쌍은 다르다) / 더 깊이 보기(`:::deep` 손실과 기울기의 식(길이 맞춤을 거치는 기울기 포함), Sentence-BERT 의 원래 목적 셋, 학습률을 온도에 비례하게 두는 까닭. 링크: 임베딩과 벡터 검색, Two-Tower 학습, LLM 유저 임베딩, 지식 증류, 데크) / 참고문헌.

도입: 44주째, 23주째에 짠 장난감 임베딩에서 스니커즈와 운동화가 먼 것이 계속 걸린다. 검색 로그에는 같이 클릭된 낱말 쌍이 쌓여 있다. 지훈 씨는 그 쌍으로 임베딩을 고친다(개념어 없이).

참고문헌(열어서 확인한 것만):
- Reimers, Gurevych 2019, *Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks*, arXiv:1908.10084. 확인할 것: siamese 구조와 평균 풀링, 목적 셋(분류, 회귀, triplet), 비슷한 문장 찾기 시간을 줄인 수치와 그 조건.
- Gao, Yao, Chen 2021, *SimCSE: Simple Contrastive Learning of Sentence Embeddings*, arXiv:2104.08821. 확인할 것: 비지도(드롭아웃)와 지도(NLI) 판, in-batch negatives, 온도 값. 0.05 를 이 논문의 값이라고 쓰려면 원문에서 찾은 뒤에만 쓴다.
- van den Oord, Li, Vinyals 2018, *Representation Learning with Contrastive Predictive Coding*, arXiv:1807.03748. 확인할 것: InfoNCE 손실의 정의.
- Karpukhin et al. 2020, *Dense Passage Retrieval for Open-Domain Question Answering*, arXiv:2004.04906. 확인할 것: 두 인코더, in-batch negatives, BM25 음성을 더한 설정.

카테고리 `LLM & Agents`, `ML Infrastructure`. 태그 `Embedding`, `Fine-tuning`, `Two-Tower`.

- [ ] **Step 1: 스캐폴드** — `node scripts/new-post.js embedding-model-finetuning "임베딩 모델 파인튜닝: sentence-BERT 에서 contrastive 학습으로" "LLM & Agents" "Embedding,Fine-tuning,Two-Tower" both`, date `2026-12-05`, series, 둘째 카테고리.
- [ ] **Step 2: 데크 4장** — `'contrastive-cards'` 엔트리. Run: `node scripts/check-design.js demo-contrastive-cards.html && node scripts/check-page-sentences.js` 와 데크 문장 명령. Expected: 통과, `80자 초과 0`.
- [ ] **Step 3: 글 본문** — 블록 셋(이어서). 블록 1 이 `DIM`, `embed`, `GROUPS` 를, 블록 2 가 `softmax`, `batch_loss` 를 담는다. 가상 데이터를 한 번 밝힌다.
- [ ] **Step 4: 출력** — `--show` 로 뽑아 붙인다. Run: `time python3 scripts/check-python-outputs.py --post embedding-model-finetuning && python3 scripts/check-python-outputs.py --post embedding-model-finetuning` Expected: 두 번 통과, real 10초 안.
- [ ] **Step 5: 옮긴 함수 대조** — Run: `python3 -c "import re;src=lambda p:open(p,encoding='utf-8').read();f=lambda p,n:re.search(r'^(def %s\(.*?)(?=^\S)'%n,src(p),re.M|re.S).group(1).rstrip();me='posts/embedding-model-finetuning.md';print('DIM = 384' in src(me) and all(f(a,n)==f(me,n) for a,n in [('posts/embeddings-vector-search.md','embed'),('posts/two-tower-training.md','softmax'),('posts/two-tower-training.md','batch_loss')]))"` Expected: `True`. (함수마다 처음 나오는 정의를 비교한다. 2026-11-08 에 앞 두 글에서 세 함수가 이 명령으로 뽑히는 것을 확인했다.)
- [ ] **Step 6: 엔트리와 검사 전부** — Global Constraints 의 목록. 추가로 `grep -c "재현율@10" posts/embedding-model-finetuning.md` 1 이상(헷갈리기 쉬운 점 첫째), `grep -c "post.html?id=two-tower-training" posts/embedding-model-finetuning.md` 1 이상. 원인 문장과 근거 줄의 짝을 보고서에 적는다(겹친 칸 0 인 검증 쌍, 정답 칸 확률, 묶음마다 한 쌍인 배치).
- [ ] **Step 7: 커밋** — 글, posts.js, index.html, 데크 둘, demo-edu-content.js. `feat(posts): 임베딩 모델 파인튜닝 — sentence-BERT 에서 contrastive 학습으로`.

---

### Task 5: 놀이터, 데모 목록, 용어, 표지, 최종 검증

**Files:**
- Create: `demo-dpo-loss.html`, `js/dpo-loss-demo.js`
- Modify: `js/demo-edu-content.js`(`'dpo-loss'`), `demos.html`(바로가기 「LLM 학습」, 주제 절 `demo-topic-llm-training`, 난이도별과 주제별 개수), `js/glossary.js`(빠진 용어만), `README.md`(136 → 140 posts), `posts/sft-and-dpo.md` 와 `posts/rlhf-rlaif-grpo-reward-model.md`(더 깊이 보기에 놀이터 링크 한 줄씩), `search-index.json`(재생성)
- Test: 검사 전부 + 놀이터 기본값 대조 + 화면

**Interfaces:**
- Consumes: Task 0 의 `js/training-dpo-pairs.js`(`window.DPO_PAIRS`), Task 1 의 `dpo_numbers` 식과 d02 줄, Task 1~4 의 데크와 글.
- Produces: `js/dpo-loss-demo.js` 맨 위의 순수 함수 `dpoNumbers(pw, pl, rw, rl, beta) -> { margin, loss, weight, push }`(`push = beta * weight`, 정책 chosen 을 올리고 rejected 를 내리는 기울기의 크기). 파일 끝에 `if (typeof module !== 'undefined' && module.exports) module.exports = { dpoNumbers };`, DOM 코드는 `typeof document !== 'undefined'` 일 때만 돈다.

놀이터 `demo-dpo-loss.html`(형식은 `demo-llm-cost.html` 과 `demo-frequency-capping.html`: 한 줄 요약 상자, 이 데모가 보여주는 것, 이렇게 해봅니다, 식 상자, 컨트롤, 지표 카드, 판정 한 줄, 차트 둘, 현업에서는, 다음 배우기, `?embed=1`, aria-label, Chart.js 와 `cssVar()`, 프리셋 뒤 `input` 이벤트):
- 슬라이더 다섯: 정책 chosen, 정책 rejected, 참조 chosen, 참조 rejected(각 -40.0 ~ -5.0, 0.1 칸), β(칸 일곱 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1.0).
- 지표 카드 넷: DPO 손실, 암묵적 보상 차이(margin, 보조 줄에 `r_w = β(정책 chosen − 참조 chosen)` 과 `r_l`), 기울기 무게 σ(−margin)(0.5 보다 크면 정책이 rejected 쪽으로 기운 쌍), 미는 방향(정책 chosen ↑ push, 정책 rejected ↓ push, 참조 둘은 학습하지 않음).
- 프리셋 줄: 쌍 20개 버튼(`d01 gate` 꼴), 누르면 네 슬라이더를 그 쌍의 값으로. 기본은 d02, β 0.1.
- 판정 한 줄: margin < 0 이면 「정책이 rejected 쪽으로 기울어 무게 W 로 세게 밉니다」, |margin| < 0.005 면 「정책이 참조와 같은 자리라 손실은 0.693 입니다」, 아니면 「정책이 chosen 을 참조보다 더 좋아해 무게 W 로 덜 밉니다」.
- 차트 둘: margin -3 ~ 3 의 손실 곡선 `-log σ(x)` 위의 지금 점, 지금 β 에서 쌍 20개의 무게 막대(지금 쌍 강조).
- 해설: 식 상자에 DPO 손실 식(KaTeX, 한글 없이)과 「쌍과 로그 확률은 가상 데이터」 한 문장, 글 1 과 글 2 링크. `'dpo-loss'` 엔트리(analogy, anchor `.dl-controls`, embedKeep `['.dl-controls']`, embedHide 는 llm-cost 와 같은 꼴, 슬라이더와 프리셋마다 explain, tour 넷).

용어(Task 5 를 할 때 `grep -n "term: '이름'" js/glossary.js` 로 먼저 보고 없는 것만 더한다. 묶음 3 이 「지식 증류」를 더했다): `SFT`, `DPO`, `RLHF`, `RLAIF`, `GRPO`, `보상 모델`, `보상 해킹`, `LoRA`, `로짓 증류`, `contrastive 학습`, `in-batch negatives`, `recall@k`. 항목마다 `{ term, abbr, body }`, body 는 두 문장, 파일의 다른 항목과 같은 평서체와 명사 끝, 굵게는 `<strong>` 하나. 숫자를 넣으면 글의 블록 출력에 있는 값만(예: LoRA 의 0.39%).

- [ ] **Step 1: 놀이터** — 위 사양대로 두 파일과 edu 엔트리. `<script>` 차례는 `js/training-dpo-pairs.js` → `js/dpo-loss-demo.js`.
- [ ] **Step 2: 기본값 대조** — Run: `node -e "global.window={};require('./js/training-dpo-pairs.js');const {dpoNumbers}=require('./js/dpo-loss-demo.js');const d=window.DPO_PAIRS;const p=d.pairs.find(x=>x[0]===d.default);const r=dpoNumbers(p[6],p[7],p[8],p[9],d.beta);console.log(p[0],r.margin.toFixed(3),r.loss.toFixed(3),r.weight.toFixed(3))"` Expected: `d02 -0.080 0.734 0.520`, 글 1 블록 2 의 d02 줄과 같은 셋. 다르면 놀이터를 고친다(글과 생성기는 그대로).
- [ ] **Step 3: 데모 목록** — 바로가기 줄의 「LLM 광고 응용」 뒤에 `<a class="demos-jump-item" href="#demo-topic-llm-training">LLM 학습<b>5</b></a>`. 주제 절 `demo-topic-llm-training`(제목 「LLM 학습」, 「5개」)을 `demo-topic-llm-ads` 절 뒤에, 데크 넷과 놀이터 하나의 카드. 설명 「선호 쌍으로 모델을 미는 SFT 와 DPO, 판정자를 보상으로 쓰는 RLHF 와 GRPO 를 봅니다. 큰 모델을 작은 모델로 옮기는 증류와, 클릭한 쌍으로 고치는 임베딩도 봅니다. 숫자는 모두 가상 데이터 위의 파이썬이 찍은 값입니다. 카드 데크 넷과 놀이터 하나입니다.」 놀이터 카드 설명 「선호 쌍 하나의 로그 확률 넷과 β 를 움직여, DPO 손실과 보상 차이와 기울기 무게가 어떻게 바뀌는지 봅니다. 쌍 20개를 버튼으로 불러옵니다.」(둘 다 80자 검사 통과 확인함). 「난이도별 N개 데모」와 「주제별 데모 N개, 주제 N개」(주석 `<!-- 주제별 데모 N개 -->` 포함)는 묶음 3 이 끝난 수에 5 와 1 을 더한다(묶음 3 계획대로면 101 → 106, 주제 12 → 13). 로드맵은 앞 묶음의 규칙(입문 태그 글의 데크는 입문, 나머지는 중급)이라 다섯 모두 중급에 더한다. Run: `node scripts/check-page-sentences.js` Expected: 통과.
- [ ] **Step 4: 용어** — `js/glossary.js` 끝에 빠진 것만. Run: `node -e "const s=require('fs').readFileSync('js/glossary.js','utf8');for(const t of ['SFT','DPO','RLHF','RLAIF','GRPO','보상 모델','보상 해킹','LoRA','로짓 증류','contrastive 학습','in-batch negatives','recall@k','지식 증류'])console.log(t,s.split(\"term: '\"+t+\"'\").length-1)"` Expected: 열세 줄 모두 1. (2026-11-08 의 묶음 3 브랜치에서는 열둘이 0 이었다. 「지식 증류」는 묶음 3 의 마지막 Task 가 더한다.)
- [ ] **Step 5: 표지와 README** — `index.html` 「글 140편 전체」와 태그별 수(바뀌지 않아야 한다), README 의 글 수 140. Run: `node scripts/validate-posts.js` Expected: 오류 없이 통과(아직 없는 글 id 가 더는 없다), 「표지 편수 10곳」 일치.
- [ ] **Step 6: 놀이터 링크** — 글 1 과 글 2 의 더 깊이 보기 링크 글머리표에 `[DPO 손실 놀이터](demo-dpo-loss.html) — …` 한 줄씩(80자 이하).
- [ ] **Step 7: 검사 전부** — Run: `( grep -E "^[[:space:]]+run: " .github/workflows/validate.yml | sed -E 's/^[[:space:]]*run: //; s/^python /python3 /' | while read -r c; do echo "== $c"; eval "$c" || exit 1; done ) && node scripts/check-content-standard.js sft-and-dpo rlhf-rlaif-grpo-reward-model knowledge-distillation embedding-model-finetuning && node scripts/build-search-index.js && grep -rnE "$(grep -v '^#' $NAMES_FILE | tr '\n' '|' | sed 's/|$//')" posts/ docs/ js/ data/ scripts/ *.html; echo "names grep exit=$?"` Expected: CI 의 단계가 모두 통과(`gen-training-data.py --check` 는 「대조 3건」), 네 글에 ⚠ 와 ✗ 없음, 마지막 grep 은 출력 없이 `exit=1`. 네 글의 참고문헌 줄을 손으로 재어 80자 초과가 원제뿐인지 본다.
- [ ] **Step 8: 화면 확인** — 헤드리스 크롬으로 글 4편을 1440 과 390 폭으로(카드 iframe 로드, 가로 스크롤 없음), 데크 4장과 놀이터를 라이트와 다크로(놀이터는 프리셋 하나를 누른 뒤도), `demos.html`, `topics.html`(LLM 주제와 LLM 학습 트랙), `ml-track.html`(6단계 열세 편), `index.html` 을 찍는다. 스크린샷은 저장소 밖 작업 폴더에.
- [ ] **Step 9: 커밋** — 파일을 이름으로. `feat(demos): DPO 손실 놀이터와 LLM 학습 데모 절, 용어, 표지 140편`.

---

## 묶음 끝 (컨트롤러)

1. 글마다 미룬 minor 를 한 브리프로 모아 고친다(구현 Opus, 검토 Sonnet). 파이썬을 고치면 출력이 글자까지 같아야 한다. 생성기의 리터럴을 고쳐야 하면 `--write` 와 두 글의 리터럴을 같은 커밋에서 고치고 `--check` 를 돌린다.
2. 브랜치 전체 검토(Fable). Critical 과 Important 를 고친다.
3. 사용자가 2026-11-08 에 미리 승인했으므로 묻지 않는다. 검토를 통과하면 main 으로 빨리 감기 병합, push, Validate posts 와 sitemap 봇(Update sitemap.xml + feed.xml)과 Pages 배포가 success 인지 `gh run list` 로 보고, 공개 주소에서 새 글 넷과 놀이터를 연다. Pages 가 20분 넘게 building 이면 `gh api -X POST repos/{owner}/{repo}/pages/builds`.
4. 장부를 저장소 밖으로 옮기고 블로그의 작업 폴더와 브랜치를 지운다. Ollama 모델은 지우지 않는다.
