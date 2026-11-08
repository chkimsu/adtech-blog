모델 팀 40주째 월요일, 지훈 씨는 31주째 관심사 사전의 작업 기록을 다시 열었습니다. 검색어 120개를 모델에게 두 번 묻고, 답이 다른 4개만 다시 물은 실험입니다. 그 명령을 친 것은 지훈 씨가 아니라, 계획을 읽고 혼자 명령을 치는 프로그램이었습니다.

첫 명령에서 약 44분 뒤에 결과가 올라왔습니다. 그사이 모델 기록이 세 번 돌았고, 숫자를 다시 세는 검사가 여러 번 지나갔습니다. 그 44분 안에 사람의 승인은 없었습니다. 사람은 시작 전에 계획을 승인했고, 결과를 합치는 일은 마지막 검토 뒤로 미리 승인했습니다.

**실험 하나를 계획부터 마무리까지 맡기면, 순서와 규칙은 무엇이 지키고 결과는 어떻게 믿을까요?**

계획을 읽고 명령을 치며 파일을 고치는 프로그램을 코딩 에이전트라고 부릅니다. 이 글은 Claude Code 로 돌린 그 세션을 계획, 구현, 실행, 보고로 나눠 봅니다. 그 실험의 숫자는 서연 씨의 하루 300만 원이 쓰일 이름을 정했습니다.

> **한 줄 요약:** 계획을 읽고 명령을 치며 파일을 고치는 프로그램을 코딩 에이전트라고 부릅니다. 이 글은 31주째 관심사 사전 실험을 맡긴 Claude Code 세션의 발췌로 네 단계를 봅니다. 계획서의 칸과 Task 마다의 순서는 스킬이 정했고, 구현자는 Task 4 의 브리프 하나만 받았습니다. 모델 기록 셋은 기록 도구가 잰 662초 동안 돌았고, 시작에서 커밋까지는 약 44분이었습니다. 이 저장소의 git 규칙 넷은 PreToolUse 훅의 판단 함수로 옮겼습니다. 예시 다섯 가운데 둘은 종료 코드 0, 셋은 2 를 받았습니다. 권한 문서가 `Bash(git push *)` 규칙으로는 막지 못한다고 적은 꼴 셋도 이 함수는 막았습니다. 브랜치 이름이 없는 push, 끝에 / 가 없는 디렉터리 이름, bash -c 안의 명령은 놓쳤습니다. Task 4 구현자의 사건에 사람의 승인은 없었습니다. 사람은 계획서를 승인했고, 병합과 push 는 마지막 전체 검토 뒤에 하도록 미리 승인했습니다.

> **골라 읽는 법** — 절이 6개입니다. 절마다 표나 코드나 카드가 있어 그것만 보고 넘어가도 됩니다.
>
> - 실험 하나를 계획, 구현, 실행, 보고로 나누기 → 1절
> - 계획서의 칸을 정하는 스킬과 브리프 → 2절
> - Task 4 세션의 명령과 출력 발췌 → 3절
> - git 규칙을 막는 PreToolUse 훅 → 4절
> - 보고서, 장부, 단계별 시간과 명령 수 → 5절
> - 담장 안과 열린 RTB 에서 달라지는 것 → 6절

이 글만 모델 기록 대신 Claude Code 세션의 발췌를 씁니다. 발췌는 이 블로그 저장소에서 31주째 [관심사 사전 만들기](post.html?id=interest-audience-library) 편을 만든 세션에서 뽑았습니다. 이 트랙의 기록은 맥에서 공개 모델 하나로 받았고, API 키는 쓰지 않았습니다. 이 글이 그 규칙의 유일한 예외입니다. 발췌의 저장소 경로는 `<repo>` 로 바꾸고, 계정과 메일, 세션 id, 벽시계 시각은 지웠습니다. 그 세션이 다룬 키워드 120개와 회원 2,000명은 생성기가 만든 가상 데이터입니다. 4절의 훅 입력도 세션 id 와 경로를 자리표시로 둔 예시입니다. 카드의 파랑은 저장소에 놓인 파일, 벽돌색은 에이전트가 보낸 도구 호출, 먹색은 Claude Code 와 검사 스크립트입니다. 회색은 막힌 호출과 기록이 도는 시간, 점선 상자는 적어 둔 규칙과 사람의 승인입니다.

---

## 1. 실험 하나를 네 단계로 나눕니다

**코딩 에이전트에게 실험 하나를 맡기면 계획, 구현, 실행, 보고의 네 단계를 지납니다. 단계마다 순서와 규칙을 지키는 것이 다릅니다. 31주째의 관심사 사전 실험은 이 묶음의 Task 4 로 네 단계를 지났습니다.**

이 글의 코딩 에이전트는 Claude Code 입니다. Claude Code 는 모델이 고른 도구를 실행하는 프로그램입니다. 셸 명령을 돌리는 Bash, 파일을 고치는 Edit 와 Write, 파일을 읽는 Read 같은 도구가 들어 있습니다. 모델이 도구를 고르고 코드가 실행하는 구조는 25주째 [Tool use 와 에이전트 루프](post.html?id=tool-use-agent-loop) 편에서 보았습니다. 이 글의 실험은 그 루프가 저장소 하나에서 약 44분 동안 돈 일입니다.

실험은 31주째 편의 두 단계 기록입니다. 키워드 120개를 20개씩 6묶음으로 나눠 temperature 0 과 0.7 로 한 번씩 물었습니다. 두 답의 keep 이 다르거나 읽지 못한 키워드만 thinking 을 켠 같은 모델에게 다시 물었습니다. 남은 키워드는 모델이 묶어 이름을 붙였습니다. 이 묶음의 계획서는 이 실험을 Task 4 라고 부릅니다. 계획서 하나에 Task 가 0번부터 14번까지 있고, 이 글은 13번입니다.

네 단계는 이렇게 나뉩니다. 계획은 무엇을 만들고 어떻게 확인할지 글로 적는 단계입니다. 구현은 실험에 쓸 코드를 고치는 단계이고, 실행은 실험을 돌려 기록을 남기는 단계입니다. 보고는 기록을 숫자와 글로 옮기고 검사한 뒤, 커밋하고 결과를 적는 단계입니다.

단계마다 지키는 것이 다릅니다. 계획의 틀과 Task 의 순서는 스킬이 정합니다(2절, 3절). 실험의 순서는 저장소의 코드가 지켰습니다. Task 4 의 생성기는 앞 기록이 없으면 뒤 프롬프트를 만들지 않았습니다. git 규칙은 Task 4 때 글로만 있었고, 4절은 그 규칙을 훅으로 옮깁니다. 결과는 검사 스크립트와 검토자가 다시 셉니다(5절). 아래 표는 Task 4 가 단계마다 만든 것과 그 단계를 지킨 것입니다.

| 단계 | 하는 일 | Task 4 에서 | 지키는 것 |
|---|---|---|---|
| 계획 | 무엇을 만들고 어떻게 확인할지 적는다 | 브리프 한 절. 파일, 받는 것과 내는 것, 단계 아홉 | 계획서를 쓰는 스킬, 사람의 승인 |
| 구현 | 실험에 쓸 코드를 고친다 | 생성기에 프롬프트 빌더 셋과 파일 대조를 더함 | 앞 기록이 없으면 멈추는 빌더, `--check` |
| 실행 | 실험을 돌려 기록을 남긴다 | 요청 14개, 기록 도구가 잰 662초 | 기록 도구, 출력의 한글 수 세기 |
| 보고 | 기록을 숫자로 옮기고 검사한 뒤 커밋한다 | 블록 셋, 커밋 하나, 보고서, 검토 판정 | 검사 스크립트, 검토자, 장부 |

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-coding-agent-cards.html?embed=1&card=steps" height="480" loading="lazy" title="실험 하나가 계획, 구현, 실행, 보고를 지나는 과정과 단계별 시간"></iframe>
<a class="demo-embed-open" href="demo-coding-agent-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 2. 계획은 스킬이 정한 틀로 씁니다

**스킬은 Claude 가 일을 할 때 따를 지시를 적어 둔 SKILL.md 파일입니다. 이 묶음의 계획서는 계획을 쓰는 스킬이 정한 칸으로 쓰였고, 사람이 승인한 뒤에 일이 시작되었습니다. Task 4 의 구현자는 그 계획서에서 잘라 낸 브리프 한 절만 받았습니다.**

Claude Code 문서는 스킬을 SKILL.md 파일 하나로 설명합니다. 파일 맨 위 `---` 사이의 frontmatter 에는 Claude 가 언제 쓸지 알 수 있게 description 을 적습니다. 그 아래에는 스킬이 돌 때 따를 지시를 마크다운으로 씁니다. Claude 는 필요할 때 스킬을 불러오고, 사람은 `/스킬이름` 으로 직접 부를 수 있습니다. 문서는 같은 지시나 체크리스트, 여러 단계의 절차를 대화에 거듭 붙여 넣을 때 스킬을 만들라고 권합니다. CLAUDE.md 의 한 절이 사실이 아니라 절차로 자랐을 때도 그렇습니다. 부른 스킬의 내용은 메시지 하나로 대화에 들어가 다음 차례에도 남습니다.

이 묶음은 공개 플러그인 superpowers 7.0.0 의 스킬 둘을 썼습니다. writing-plans 는 계획서를 쓰는 스킬입니다. subagent-driven-development 는 그 계획서를 Task 하나씩 맡기는 스킬입니다. writing-plans 는 계획서 머리에 칸 여섯을 두게 합니다. Goal, Architecture, Tech Stack, Spec, Global Constraints, Review Focus 입니다. Task 마다 Files 와 Interfaces 칸, 체크 상자가 달린 단계를 적게 합니다. 이 묶음의 계획서는 저장소의 `docs/superpowers/plans` 폴더에 있습니다.

아래 표는 그 칸과 이 묶음의 계획서에 적힌 것입니다. 스킬은 Global Constraints 가 모든 Task 의 요구 사항에 함께 든다고 적었습니다. 그래서 합쇼체, 80자, 표준 라이브러리 같은 규칙은 Task 마다 다시 적지 않고 머리에 한 번 적었습니다. Interfaces 칸은 앞뒤 Task 가 주고받는 이름을 적는 자리입니다. Task 4 의 Produces 칸에는 Task 13 이 그 기록 과정을 세션 발췌로 쓴다는 줄까지 있었습니다.

| 칸 | 스킬이 정한 뜻 | 이 묶음의 계획서에서 |
|---|---|---|
| Goal, Architecture, Tech Stack, Spec | 무엇을 만드나, 어떤 방식인가, 무슨 기술인가, 근거 문서 | 13편과 데크, 공용 생성기, 표준 라이브러리 파이썬, 설계 문서의 3-3절 |
| Global Constraints | 모든 Task 가 지킬 값을 설계에서 글자 그대로 | 합쇼체, 문장 80자, 표준 라이브러리, 가상 데이터 |
| Review Focus | 어느 Task 의 시험도 닿지 않는데 쓰는 사람이 겪기 쉬운 입력과 실패 | 두 단계 기록의 뒤 프롬프트가 앞 기록과 맞지 않는 것 |
| Files | Task 가 만들고 고치는 파일과 검사 | Task 4 는 글, 데크 둘, 프롬프트 셋, 기록 셋 |
| Interfaces | 앞 Task 에서 받는 것과 뒤 Task 에 내는 것 | Task 4 는 Task 0 의 키워드를 받고 Task 13 에 기록 과정을 낸다 |
| 단계 | 한 단계에 행동 하나와 확인할 결과 | Task 4 는 스캐폴드부터 커밋까지 아홉 단계 |

구현자는 계획서 전체를 읽지 않습니다. subagent-driven-development 는 Task 하나의 글을 파일로 잘라 브리프로 넘기게 합니다. 구현자에게 계획서 전체를 읽히지 말라는 줄도 있습니다. 아래는 Task 4 브리프의 첫 줄과 단계 줄입니다. 구현자는 이 단계 다섯을 기록 셋과 코드의 규칙 둘로 옮겼습니다.

```text
[브리프] task-4-brief.md 의 첫 줄과 단계 줄
  ### Task 4: 관심사 사전 만들기 (`interest-audience-library`, 31주째, 2026-11-22)
  (생략: 가운데 11줄, Files 와 Interfaces 칸)
  단계 다섯: 거르기(LLM 투표) → 심판(답이 다른 것만) → 묶기(LLM 이 이름을 붙임) → 다시 나누기와 합치기(코드) → 최소 크기(코드, 회원 수).
```

writing-plans 는 계획서를 다 쓰면 사람에게 읽고 확인해 달라고 하고, 그 확인을 기다린 뒤에 구현을 시작하게 합니다. 이 묶음도 사람이 계획서를 승인한 뒤에 일을 시작했습니다. 그 뒤 Task 마다의 구현과 검토에는 사람이 끼지 않았습니다. 사람이 다시 나오는 자리는 묶음 끝의 병합과 push 입니다(5절, 헷갈리기 쉬운 점).

## 3. 구현과 실행은 세션 발췌로 봅니다

**Task 4 의 구현자는 자기 컨텍스트에서 도는 서브에이전트였습니다. 발췌에서 생성기는 투표 기록이 없을 때 심판 프롬프트를 만들지 않았습니다. 투표 기록 뒤에는 keep 이 다른 키워드 4개만 심판에게 보냈습니다.**

구현자는 서브에이전트(subagent)입니다. Claude Code 문서는 서브에이전트가 자기 컨텍스트 윈도우(context window)에서 돈다고 적었습니다. 시스템 프롬프트와 쓸 수 있는 도구, 권한도 따로 정합니다. 맡은 일을 혼자 하고 결과를 돌려줍니다. 이 묶음에서는 컨트롤러라고 부르는 바깥 세션이 Task 마다 새 구현자를 불렀습니다. subagent-driven-development 가 정한 순서이고, 이 절 끝의 카드가 그 순서를 그렸습니다.

아래 발췌는 Task 4 구현자가 보고서에 적은 명령과 출력의 순서에서 골랐습니다. 줄 앞의 `[약 4분]` 은 첫 명령에서 지난 시간입니다. 첫 명령의 시각이 대략으로만 남아 있어 약을 붙였습니다. 「구현자 메모」 줄은 구현자가 적은 괄호 줄이고 도구의 출력이 아닙니다. 「생략」 줄은 이 글이 줄인 자리입니다. 줄 맨 앞의 OK, FAIL 은 도구가 찍은 표시를 이 블로그의 표기로 바꿔 적은 것입니다.

```text
# 발췌의 명령은 모두 저장소 맨 위(<repo>)에서 돌았다. [분] 은 첫 명령에서 지난 시간이다.
[0분] $ git status && git log --oneline -5
  On branch feat/llm-ads-track / nothing to commit, working tree clean / 5b16504 feat(posts): 키워드 확장 전략 …
(생략: 명령 1개, python3 scripts/gen-ads-data.py --json summary 와 그 출력 1줄)
(구현자 메모: 생성기에 빌더 셋, read_decisions, NeedRecord, 파일 전체 대조를 더함)
$ python3 scripts/gen-ads-data.py --check
  OK 대조 81건(데이터 파일 1, 글의 KEYWORDS 리터럴 2, 글 7편의 공용 정의 76, 프롬프트 파일 2)이 지금 생성 결과와 같습니다. 키워드 120개와 자산 텍스트 202자의 꼴도 맞습니다
$ python3 scripts/gen-ads-data.py --prompts interest-audience-library-referee > /dev/null
  FAIL interest-audience-library-referee 를 만들 수 없습니다. data/llm-records/interest-audience-library-voters.json 가 없습니다. 먼저 python3 scripts/llm-record.py --slug interest-audience-library-voters 로 기록합니다
  exit=1
(생략: 명령 1개와 구현자 메모 1줄. node scripts/new-post.js 로 글의 뼈대를 만들고 js/posts.js 를 고침)
$ python3 scripts/gen-ads-data.py --prompts interest-audience-library-voters > data/llm-records/prompts/interest-audience-library-voters.json
$ python3 scripts/gen-ads-data.py --check
  OK 대조 82건(데이터 파일 1, 글의 KEYWORDS 리터럴 2, 글 7편의 공용 정의 76, 프롬프트 파일 3)이 지금 생성 결과와 같습니다. 키워드 120개와 자산 텍스트 202자의 꼴도 맞습니다
$ python3 scripts/llm-record.py --selftest
  selftest ok: model=qwen3.5:27b prompt_tokens=28 output_tokens=5 elapsed_ms=16856 with_usage=ok
[약 4분] $ python3 scripts/llm-record.py --slug interest-audience-library-voters
  Ollama 0.40.11 의 qwen3.5:27b 에 요청 12개를 보냅니다
    2/12 보냄, 64초, error 0개
    (가운데 4줄 생략)
    12/12 보냄, 366초, error 0개
  OK data/llm-records/interest-audience-library-voters.json 에 항목 12개를 썼습니다. error 0개, 366초
(생략: 기록이 도는 동안 돌린 도구 호출 9번. 진행 줄을 읽은 Bash 3번, 참고문헌 쪽을 연 WebFetch 5번과 Read 1번)
[약 10분] $ python3 -c "import json,re,sys; d=json.load(open('data/llm-records/interest-audience-library-voters.json')); print(sum(len(re.findall('[가-힣]', it['output'])) for it in d['items']))"
  0
(구현자 메모: 투표 둘을 생성기 함수로 읽어 봄: keep 다름 4 (마라토너, 새벽러닝, 번역기, 러닝크루), reason_code 만 다름 2 (지도, 달력), A 111/120, B 111/120)
$ python3 scripts/gen-ads-data.py --prompts interest-audience-library-referee
  (생략: 시스템 메시지 1줄, 729자)
   "think": "on",
   "repeat": 1,
   "items": [
    {"id": "r1", "user": "키워드 4개:
                          k038 마라토너
                          k063 새벽러닝
                          k069 번역기
                          k101 러닝크루"}
   ]}
$ python3 scripts/gen-ads-data.py --prompts interest-audience-library-referee > data/llm-records/prompts/interest-audience-library-referee.json
$ python3 scripts/gen-ads-data.py --check
  OK 대조 83건(데이터 파일 1, 글의 KEYWORDS 리터럴 2, 글 7편의 공용 정의 76, 프롬프트 파일 4)이 지금 생성 결과와 같습니다. 키워드 120개와 자산 텍스트 202자의 꼴도 맞습니다
[약 11분] $ python3 scripts/llm-record.py --slug interest-audience-library-referee
  Ollama 0.40.11 의 qwen3.5:27b 에 요청 1개를 보냅니다
    1/1 보냄, 248초, error 0개
  OK data/llm-records/interest-audience-library-referee.json 에 항목 1개를 썼습니다. error 0개, 248초
(생략: 기록이 도는 동안 돌린 Bash 9번. 진행을 읽고, 투표 기록 상수를 뽑아 블록 1 초안을 돌림)
[약 15분] (구현자 메모: 한글 0. r1 True 1 {'temperature': 0, 'seed': 7} 353 3792 248426 14067, 넷 모두 keep true commercial_interest)
$ python3 scripts/gen-ads-data.py --prompts interest-audience-library-groups > data/llm-records/prompts/interest-audience-library-groups.json
(생략: 구현자 메모 1줄, 묶기 프롬프트 user 의 첫 줄 「남은 키워드 94개:」)
$ python3 scripts/gen-ads-data.py --check
  OK 대조 84건(데이터 파일 1, 글의 KEYWORDS 리터럴 2, 글 7편의 공용 정의 76, 프롬프트 파일 5)이 지금 생성 결과와 같습니다. 키워드 120개와 자산 텍스트 202자의 꼴도 맞습니다
[약 15분] $ python3 scripts/llm-record.py --slug interest-audience-library-groups
  Ollama 0.40.11 의 qwen3.5:27b 에 요청 1개를 보냅니다
    1/1 보냄, 48초, error 0개
  OK data/llm-records/interest-audience-library-groups.json 에 항목 1개를 썼습니다. error 0개, 48초
```

구현 단계에서 구현자는 먼저 생성기에 프롬프트 빌더 셋을 더했습니다. 그리고 심판 빌더를 돌려 보자, 투표 기록이 없다며 exit=1 로 멈췄습니다. 앞 기록을 끝내야 뒤 프롬프트를 만든다는 두 단계 기록의 순서를, 에이전트의 기억이 아니라 생성기의 코드가 지켰습니다. 프롬프트 파일을 하나 쓸 때마다 `--check` 의 대조도 81건에서 84건까지 한 건씩 늘었습니다. 새 파일이 생성기의 출력과 글자까지 같은지를 그때마다 다시 본 것입니다.

실행 단계는 시작에서 약 4분 뒤의 투표 기록으로 열렸습니다. 요청 12개는 기록 도구가 잰 366초 동안 돌았고 error 는 0개였습니다. 그동안 구현자는 기다리지 않고 참고문헌 쪽을 열어 읽었습니다. 기록이 끝나자 출력의 한글 수가 0 인지 세고, 생성기 함수로 두 투표를 읽어 keep 이 다른 키워드 4개를 적었습니다. 이어서 돌린 심판 빌더는 투표 기록을 읽어 바로 그 4개만 r1 한 묶음에 담았습니다. 심판 기록은 248초, 묶기 기록은 48초였습니다.

심판에게 간 키워드가 4개인 까닭은 31주째 편의 규칙에 있습니다. 두 답의 keep 이 같으면 그 답을 그대로 쓰고, keep 이 다르거나 읽지 못한 키워드만 심판에게 보냅니다. 지도와 달력은 두 투표가 모두 걸렀고 reason_code 만 달라서 심판에게 가지 않았습니다. 읽지 못한 답은 없었습니다. 아래 표는 심판에게 간 4개의 답입니다. 심판은 넷을 모두 남겼고, 정답과 맞은 것은 셋이었습니다.

| 키워드 | 정답 주제 | 투표자 A (temperature 0) | 투표자 B (temperature 0.7) | 심판 (thinking 켬) |
|---|---|---|---|---|
| k038 마라토너 | running, 남김 | 남김 | 거름 | 남김 |
| k063 새벽러닝 | running, 남김 | 남김 | 거름 | 남김 |
| k069 번역기 | noise, 거름 | 남김 | 거름 | 남김 |
| k101 러닝크루 | running, 남김 | 거름 | 남김 | 남김 |

표의 넷은 모두 두 투표자 가운데 한쪽만 맞힌 키워드입니다. 심판이 번역기를 남긴 일은 뒤에서 다시 나옵니다. 5절의 보고서는 이 번역기가 버너, 토너와 묶여 가장 큰 오디언스가 되었다는 걱정을 적었습니다. 발췌의 기록 셋은 브리프의 단계 차례대로 돌았습니다. 그 차례를 정한 것이 무엇인지는 아래 카드에 있습니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-coding-agent-cards.html?embed=1&card=skill" height="480" loading="lazy" title="계획서 승인부터 Task 마다의 구현과 검토, 병합과 push 까지 스킬이 정하는 순서"></iframe>
<a class="demo-embed-open" href="demo-coding-agent-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 4. 훅은 정책을 코드로 막습니다

**훅(hook)은 Claude Code 의 정해진 자리에서 저절로 도는 사용자 명령입니다. PreToolUse 훅은 도구 호출이 실행되기 전에 그 입력을 받고, 종료 코드 2 로 호출을 막을 수 있습니다. 이 저장소의 git 규칙 넷을 판단 함수 하나로 옮겨 예시 다섯을 넣자 둘은 통과하고 셋은 막혔습니다.**

이 묶음의 공통 규칙에는 커밋할 파일을 하나씩 이름으로 적고 `git add -A` 를 쓰지 않는다는 줄이 있습니다. 계획서는 main 에 직접 push 하지 않고 `--force` 를 쓰지 않는다는 규칙도 적었습니다. Task 4 에서 이 넷은 이렇게 글로 주어졌습니다. 구현자는 파일 13개를 이름으로 add 했고, 보고서에 push 하지 않았다고 적었습니다. Claude Code 의 권한 문서도 프롬프트나 CLAUDE.md 의 지시는 Claude 가 하려는 일을 바꿀 뿐이라고 적었습니다. Claude Code 가 허용하는 일은 바꾸지 않는다는 뜻입니다. 훅은 그 규칙을 코드로 옮기는 자리입니다.

문서는 훅을 Claude Code 가 도는 동안 정해진 자리에서 저절로 실행되는 사용자 정의 명령으로 설명합니다. 셸 명령 말고도 HTTP 엔드포인트, MCP 도구 호출, LLM 프롬프트, 서브에이전트를 훅으로 둘 수 있습니다. 그 자리 가운데 PreToolUse 는 Claude 가 도구의 입력을 만든 뒤, 도구 호출을 처리하기 전입니다. command 훅은 그 자리의 정보를 JSON 하나로 표준 입력(stdin)에서 받습니다. 모든 이벤트에는 session_id, cwd, hook_event_name 같은 공통 필드가 옵니다. PreToolUse 에는 여기에 tool_name, tool_input, tool_use_id 가 더해집니다. Bash 도구라면 `tool_input.command` 에 명령 문자열이 들어 있습니다.

종료 코드는 프로그램이 끝날 때 돌려주는 수이고, 훅이 무엇을 할지는 이 수가 정합니다. 문서에서 종료 코드 0 은 성공이고, 훅이 찍은 JSON 이 막지 않는 한 호출이 그대로 갑니다. 종료 코드 2 는 막는 오류라, PreToolUse 에서는 도구 호출이 막힙니다. 이때 훅이 오류 출력(stderr)에 쓴 글이 거부 까닭으로 Claude 에게 갑니다. 다른 종료 코드는 대개 막지 않는 오류라 호출이 그대로 가서, 문서는 정책을 지키는 훅이면 exit 2 를 쓰라고 경고합니다. onFailure 를 block 으로 둔 훅처럼 실패를 막음으로 치는 예외도 있습니다. 이 글의 함수는 JSON 을 찍지 않고 백그라운드 일도 띄우지 않아, 0 이면 보통의 권한 흐름으로 넘어가고 2 면 막힙니다.

아래 블록의 1단계는 git 규칙 넷을 `decide` 로 둔 것이고, 2단계는 명령 문자열을 셸처럼 읽어 git 명령을 꺼내는 도우미입니다. add 의 -A, -u 와 commit 의 -a 를 막습니다. 경로가 . 이나 .. 이거나, 끝이 / 이거나, : 로 시작하거나, 와일드카드가 들어 있어 파일을 한꺼번에 가리켜도 막습니다. push 의 refspec 은 보내는 쪽과 받는 쪽 브랜치를 적는 낱말이고, 받는 쪽이 main 이면 막습니다. 모든 브랜치를 보내는 `--all` 도 main 을 보내므로 막습니다. `run_hook` 은 실제 훅 파일처럼 JSON 을 읽고, 막을 때는 stderr 에 까닭을 쓴 뒤 종료 코드를 돌려줍니다. JSON 을 읽지 못해도 막습니다. 예시 1 은 5절 발췌에 나오는 Task 4 의 커밋 명령이고, 파일 13개를 이름으로 적어 종료 코드 0 을 받았습니다. 예시 셋은 2 를 받았고, 예시 5 는 `--force` 와 main 규칙에 함께 걸렸습니다. `--force-with-lease` 는 [Git 실무 가이드](post.html?id=git-practical-guide) 편이 사람에게 권한 꼴입니다. 그래도 원격의 기록을 덮어쓰는 push 라서 같은 규칙으로 막았습니다.

```python
# 하는 일: 이 저장소의 git 규칙 넷을 PreToolUse 훅의 판단 함수로 두고, 예시 입력이 받는 종료 코드와 메시지를 찍는다.
import io
import json
import shlex
import sys

# 1단계: 규칙 넷과 판단 함수를 둔다
# decide 는 훅 입력(사전)을 받아 (종료 코드, 까닭) 을 돌려준다. Bash 가 아닌 도구는 (0, '') 이다.
# Bash 명령에서 꺼낸 git 명령마다 규칙을 보고, 하나라도 걸리면 2 와 걸린 규칙의 까닭을, 아니면 0 과 빈 문자열을 돌려준다.
# add 는 -A, -u 와 그 긴 이름(--all, --update)을, commit 은 -a, --all 을 막는다. 둘 다 경로가 ., .., 끝이 / 인 경로,
# : 로 시작하는 경로, *, ?, [ 가 든 경로면 막는다. -- 앞과 뒤를 가리지 않는다. 이런 경로는 파일을 한꺼번에 가리킨다.
# push 는 --force, -f, --force-with-lease, --mirror 와 + 로 시작하는 refspec 을 막고, 받는 쪽이 main, heads/main,
# refs/heads/main 이거나 모든 브랜치를 보내는 --all, --branches, --mirror 면 막는다.
# refspec 은 원격 이름 뒤의 낱말이다. 보내는 쪽:받는 쪽 꼴이면 콜론 뒤가 받는 쪽이다. -o, --push-option, --repo 의 값은 건너뛴다.
# run_hook 은 훅 파일이 하는 일이다. JSON 을 읽어 판단하고, 막으면 stderr 에 까닭을 쓰고, 종료 코드를 돌려준다.
# JSON 을 읽지 못하거나 판단하다 예외가 나면 막는 쪽(2)을 돌려준다.
REASONS = {
    'add': 'git add 는 파일을 하나씩 이름으로 적는다. -A, -u, ., 끝이 / 인 경로, : 로 시작하는 경로, 와일드카드는 쓰지 않는다.',
    'commit': 'git commit 은 -a 나 ., 끝이 / 인 경로, : 로 시작하는 경로, 와일드카드로 파일을 한꺼번에 담지 않는다.',
    'force': 'push 에 --force, -f, --force-with-lease, --mirror, + 를 쓰지 않는다.',
    'main': 'main 에는 직접 push 하지 않는다(--all, --mirror 포함). 병합과 push 는 사람이 승인한 뒤에 한다.',
}
COMMIT_VALUE = ('--message', '--file', '--author', '--date', '--template', '--reuse-message',
                '--reedit-message', '--fixup', '--squash', '--cleanup', '--trailer')


def decide(payload):
    if payload.get('tool_name') != 'Bash':
        return 0, ''
    hits = set()
    for sub, args in git_commands(payload.get('tool_input', {}).get('command', '')):
        if sub == 'add' and add_breaks(args):
            hits.add('add')
        elif sub == 'commit' and commit_breaks(args):
            hits.add('commit')
        elif sub == 'push':
            force, main = push_breaks(args)
            if force:
                hits.add('force')
            if main:
                hits.add('main')
    if not hits:
        return 0, ''
    return 2, ' '.join(REASONS[k] for k in REASONS if k in hits)


def run_hook(stdin_text, stderr):
    try:
        code, reason = decide(json.loads(stdin_text))
    except Exception as error:
        code, reason = 2, f'훅이 입력을 판단하지 못해 막는다 ({type(error).__name__}).'
    if code == 2:
        print(reason, file=stderr)
    return code


def names_many(path):
    return path in ('.', '..') or path.endswith('/') or path.startswith(':') or any(c in path for c in '*?[')


def add_breaks(args):
    paths_only = False
    for w in args:
        if w == '--' and not paths_only:
            paths_only = True
        elif paths_only or not w.startswith('-'):
            if names_many(w):
                return True
        elif long_opt(w, '--all', '--update') or set(short_flags(w)) & set('Au'):
            return True
    return False


def commit_breaks(args):
    paths_only = skip = False
    for w in args:
        if skip:
            skip = False
        elif w == '--' and not paths_only:
            paths_only = True
        elif paths_only or not w.startswith('-') or w == '-':
            if names_many(w):
                return True
        else:
            letters = short_flags(w, 'mFCctSu')
            if long_opt(w, '--all') or 'a' in letters:
                return True
            skip = ('=' not in w and long_opt(w, *COMMIT_VALUE)) or (
                letters != '' and letters == w[1:] and letters[-1] in 'mFCct')
    return False


def push_breaks(args):
    opts, positional, skip = [], [], False
    for w in args:
        if skip:
            skip = False
        elif w in ('-o', '--push-option', '--repo'):
            skip = True
        elif w.startswith('-'):
            opts.append(w)
        else:
            positional.append(w)
    refspecs = positional[1:]
    force = any(long_opt(w, '--force', '--force-with-lease', '--mirror') or 'f' in short_flags(w, 'o') for w in opts)
    force = force or any(r.startswith('+') for r in refspecs)
    every = any(long_opt(w, '--all', '--branches', '--mirror') for w in opts)
    main = every or any(r.lstrip('+').split(':')[-1] in ('main', 'heads/main', 'refs/heads/main') for r in refspecs)
    return force, main


# 2단계: 명령 문자열을 셸이 읽는 단위로 나누는 도우미를 둔다
# shell_lines 는 명령 문자열을 줄로 나눠 줄마다 shlex 로 따옴표를 풀어 낱말로 만든다. 줄 끝 역슬래시는 다음 줄과 잇고,
# 따옴표가 닫히지 않으면 다음 줄을 붙여 다시 읽는다. 끝까지 닫히지 않으면 공백으로만 나눈다.
# shlex 는 ); 나 )) 처럼 붙은 기호를 한 낱말로 내므로, words 가 UNITS 의 기호나 한 글자씩 다시 나눈다.
# << 다음 낱말이 글자나 밑줄로 시작하면 heredoc 의 끝 표시로 보고, 그 표시만 있는 줄까지의 본문은 명령으로 읽지 않는다.
# <<- 꼴이면 본문 줄 앞의 탭을 떼고 끝 표시와 비교한다. chr(9) 가 탭이다.
# git_commands 는 낱말을 &&, ||, ;, |, |&, & 에서 조각으로 끊는다. 조각 맨 앞의 SKIP 낱말(뒤의 명령을 그대로 돌리는
# if, then, do, time, nohup, sudo, env 같은 것)과 NAME=값 은 건너뛰고, 맨 앞 낱말이 git 이거나 /usr/bin/git 처럼
# git 으로 끝나는 경로인 조각만 남긴다. git 뒤의 옵션은 건너뛰고(-C, -c, --git-dir, --work-tree, --namespace 는
# 다음 낱말까지) 그다음 낱말을 하위 명령으로 읽는다.
# short_flags 는 -am 처럼 붙여 쓴 짧은 옵션의 글자를 돌려준다. stop 의 글자를 만나면 그 뒤는 값이라 멈춘다.
# long_opt 는 --al 처럼 앞부분만 쓴 긴 옵션도 그 옵션으로 친다. git 이 긴 옵션의 앞부분만 받아 주기 때문이다.
OPERATORS = {'&&', '||', ';', '|', '|&', '&'}
UNITS = ('&>>', '<<<', '&>', '>&', '<&', '>>', '>|', '<<', '&&', '||', '|&', ';;')
SKIP = {'if', 'then', 'else', 'elif', 'do', 'while', 'until', '!', '{', '(', 'time', 'nohup', 'nice',
        'command', 'builtin', 'noglob', 'exec', 'env', 'sudo', 'xargs'}
GIT_VALUE = ('-C', '-c', '--git-dir', '--work-tree', '--namespace')


def words(text):
    lexer = shlex.shlex(text, posix=True, punctuation_chars=True)
    lexer.whitespace_split = True
    out = []
    for tok in lexer:
        if set(tok) <= set('();<>|&'):
            i = 0
            while i < len(tok):
                unit = next((u for u in UNITS if tok.startswith(u, i)), tok[i])
                out.append(unit)
                i += len(unit)
        else:
            out.append(tok)
    return out


def shell_lines(command):
    rows, i, out = command.splitlines(), 0, []
    while i < len(rows):
        text, i = rows[i], i + 1
        while True:
            if (len(text) - len(text.rstrip('\\'))) % 2 == 1 and i < len(rows):
                text, i = text[:-1] + rows[i], i + 1
                continue
            try:
                toks = words(text)
            except ValueError:
                if i < len(rows):
                    text, i = text + ' ' + rows[i], i + 1
                    continue
                toks = text.split()
            break
        out.append(toks)
        for k in range(len(toks) - 1):
            if toks[k] == '<<':
                tabs = toks[k + 1].startswith('-')
                end = toks[k + 1][1:] if tabs else toks[k + 1]
                if end[:1].isalpha() or end[:1] == '_':
                    while i < len(rows) and (rows[i].lstrip(chr(9)) if tabs else rows[i]) != end:
                        i += 1
                    i += 1
    return out


def git_commands(command):
    found = []
    for toks in shell_lines(command):
        piece = []
        for word in toks + [';']:
            if word not in OPERATORS:
                piece.append(word)
                continue
            while piece and (piece[0] in SKIP or ('=' in piece[0] and not piece[0].startswith('-'))):
                piece.pop(0)
            if piece and piece[0].split('/')[-1] == 'git':
                rest = piece[1:]
                while rest and rest[0].startswith('-'):
                    rest = rest[2:] if rest[0] in GIT_VALUE else rest[1:]
                if rest:
                    found.append((rest[0], rest[1:]))
            piece = []
    return found


def short_flags(word, stop=''):
    if not word.startswith('-') or word.startswith('--') or word == '-':
        return ''
    letters = ''
    for ch in word[1:]:
        letters += ch
        if ch in stop:
            break
    return letters


def long_opt(word, *names):
    head = word.split('=')[0]
    return head.startswith('--') and len(head) > 2 and any(name.startswith(head) for name in names)


# 3단계: 예시 입력 다섯을 넣는다
# 입력의 필드는 Claude Code 훅 문서의 PreToolUse 예시와 같고, 세션 id 와 경로는 자리표시로 둔다.
# 예시 1 은 5절 발췌의 커밋 명령이다. 파일을 이름으로 적었고, 커밋 메시지는 꼬리 줄을 빼고 제목 줄만 둔다.
def payload(command, tool='Bash'):
    return {
        'session_id': '<session id>',
        'prompt_id': '<prompt id>',
        'transcript_path': '<transcript path>',
        'cwd': '<repo>',
        'scratchpad_dir': '<scratchpad>',
        'permission_mode': 'default',
        'hook_event_name': 'PreToolUse',
        'tool_name': tool,
        'tool_input': {'command': command, 'description': '<description>', 'timeout': 120000,
                       'run_in_background': False},
        'tool_use_id': '<tool use id>',
    }


T4_FILES = (['posts/interest-audience-library.md', 'demo-interest-library-cards.html',
             'js/interest-library-cards-demo.js']
            + [f'data/llm-records/prompts/interest-audience-library-{s}.json' for s in ('voters', 'referee', 'groups')]
            + [f'data/llm-records/interest-audience-library-{s}.json' for s in ('voters', 'referee', 'groups')]
            + ['scripts/gen-ads-data.py', 'js/posts.js', 'js/demo-edu-content.js', 'index.html'])
T4_COMMIT = 'git add ' + ' '.join(T4_FILES) + ''' && git status --short && git commit -q -F - <<'EOF'
feat(posts): 관심사 사전 만들기 — 로그 키워드가 이름 붙은 오디언스가 되기까지. 기록 두 단계
EOF'''
MSG = '"feat(posts): 코딩 에이전트 글"'
EXAMPLES = [
    (f"git add (파일 {len(T4_FILES)}개) && git status --short && git commit -q -F - <<'EOF' (제목 줄)", T4_COMMIT),
    ('git push origin feat/llm-ads-track', None),
    ('git add -A && git commit -m ' + MSG, None),
    ('git commit -am ' + MSG, None),
    ('git push --force origin main', None),
]
print('입력의 필드:', ', '.join(payload('').keys()))
codes = []
for n, (shown, command) in enumerate(EXAMPLES, 1):
    err = io.StringIO()
    code = run_hook(json.dumps(payload(command or shown), ensure_ascii=False), err)
    codes.append(code)
    print(f'{n}. exit {code}  {shown}')
    if err.getvalue():
        print(f'   stderr: {err.getvalue().strip()}')
print(f'허용 {codes.count(0)}, 막힘 {codes.count(2)}')

# 4단계: 같은 규칙의 다른 꼴과 놓치는 꼴을 넣는다
# 앞 셋은 권한 문서가 Bash(git push *) 규칙으로는 막지 못한다고 적은 꼴이다. 줄바꿈은 (줄바꿈) 으로 찍는다.
# 끝의 넷은 이 함수가 놓친다. git push 와 git push origin HEAD 는 지금 브랜치가 글자에 없고, posts 는 디렉터리인지
# 파일인지 글자로 알 수 없고, bash -c 는 조각 맨 앞 낱말이 git 이 아니다. 마지막 줄은 JSON 이 아닌 입력을 run_hook 에 넣은 것이다.
VARIANTS = [
    'git -C . push origin main',
    'git -c push.default=current push origin main',
    "git 'push' origin main",
    'git add .',
    'git add posts/',
    "git add '*.md'",
    "git add ':!index.html'",
    'git commit -m x .',
    'git commit -m x -- .',
    'git commit -m "고침" -- posts/coding-agent-experiments.md',
    'git push --force-with-lease origin feat/llm-ads-track',
    'git push --force-w origin feat/llm-ads-track',
    'git push -f origin feat/llm-ads-track',
    'git push origin +HEAD:main',
    'git push --all origin',
    '''git push \\
  --force origin main''',
    '(cd posts && ls); git add -A',
    'time git push --force origin main',
    '''git commit -am "제목

본문"''',
    'git commit -am "제목',
    '''git commit -q -F - <<'EOF'
git push origin main 은 쓰지 않는다
EOF''',
    'git push',
    'git push origin HEAD',
    'git add posts',
    "bash -c 'git push --force origin main'",
]
for command in VARIANTS:
    code, reason = decide(payload(command))
    rules = [k for k in REASONS if REASONS[k] in reason]
    print(f'exit {code}  {", ".join(rules) or "-":12}  {command.replace(chr(10), "(줄바꿈)")}')
code, _ = decide(payload('', tool='Edit'))
print(f'exit {code}  {"-":12}  (Edit 도구의 입력)')
err = io.StringIO()
code = run_hook('{not json', err)
print(f'exit {code}  {"-":12}  (JSON 이 아닌 입력) stderr: {err.getvalue().strip()}')
# 출력:
# 3단계 뜻: 예시 다섯 가운데 둘은 종료 코드 0, 셋은 2 를 받고, 막힌 셋은 걸린 규칙의 까닭을 stderr 에 쓴다.
# 입력의 필드: session_id, prompt_id, transcript_path, cwd, scratchpad_dir, permission_mode, hook_event_name, tool_name, tool_input, tool_use_id
# 1. exit 0  git add (파일 13개) && git status --short && git commit -q -F - <<'EOF' (제목 줄)
# 2. exit 0  git push origin feat/llm-ads-track
# 3. exit 2  git add -A && git commit -m "feat(posts): 코딩 에이전트 글"
#    stderr: git add 는 파일을 하나씩 이름으로 적는다. -A, -u, ., 끝이 / 인 경로, : 로 시작하는 경로, 와일드카드는 쓰지 않는다.
# 4. exit 2  git commit -am "feat(posts): 코딩 에이전트 글"
#    stderr: git commit 은 -a 나 ., 끝이 / 인 경로, : 로 시작하는 경로, 와일드카드로 파일을 한꺼번에 담지 않는다.
# 5. exit 2  git push --force origin main
#    stderr: push 에 --force, -f, --force-with-lease, --mirror, + 를 쓰지 않는다. main 에는 직접 push 하지 않는다(--all, --mirror 포함). 병합과 push 는 사람이 승인한 뒤에 한다.
# 허용 2, 막힘 3
# 4단계 뜻: 문서의 세 꼴, 파일을 한꺼번에 가리키는 경로, 이어 쓴 명령은 막고, 끝의 넷은 놓치며, JSON 이 아닌 입력은 막는다.
# exit 2  main          git -C . push origin main
# exit 2  main          git -c push.default=current push origin main
# exit 2  main          git 'push' origin main
# exit 2  add           git add .
# exit 2  add           git add posts/
# exit 2  add           git add '*.md'
# exit 2  add           git add ':!index.html'
# exit 2  commit        git commit -m x .
# exit 2  commit        git commit -m x -- .
# exit 0  -             git commit -m "고침" -- posts/coding-agent-experiments.md
# exit 2  force         git push --force-with-lease origin feat/llm-ads-track
# exit 2  force         git push --force-w origin feat/llm-ads-track
# exit 2  force         git push -f origin feat/llm-ads-track
# exit 2  force, main   git push origin +HEAD:main
# exit 2  main          git push --all origin
# exit 2  force, main   git push \(줄바꿈)  --force origin main
# exit 2  add           (cd posts && ls); git add -A
# exit 2  force, main   time git push --force origin main
# exit 2  commit        git commit -am "제목(줄바꿈)(줄바꿈)본문"
# exit 2  commit        git commit -am "제목
# exit 0  -             git commit -q -F - <<'EOF'(줄바꿈)git push origin main 은 쓰지 않는다(줄바꿈)EOF
# exit 0  -             git push
# exit 0  -             git push origin HEAD
# exit 0  -             git add posts
# exit 0  -             bash -c 'git push --force origin main'
# exit 0  -             (Edit 도구의 입력)
# exit 2  -             (JSON 이 아닌 입력) stderr: 훅이 입력을 판단하지 못해 막는다 (JSONDecodeError).
```

4단계의 앞 세 줄은 권한 문서가 `Bash(git push *)` 규칙으로는 막지 못한다고 적은 꼴입니다. 이 함수는 git 뒤의 `-C`, `-c` 와 따옴표를 풀어 셋을 모두 막았습니다. 줄 끝 역슬래시로 이은 명령, `(cd posts && ls);` 뒤의 명령, `time` 뒤의 명령도 셸처럼 이어 읽어 막았습니다. 따옴표 안에서 줄을 바꾼 커밋 메시지와, 따옴표가 닫히지 않은 명령에서도 -a 를 찾아 막았습니다. heredoc 본문에 적힌 git 글자는 명령이 아니라서 통과했습니다. 놓치는 것도 있습니다. 브랜치 이름 없이 `git push` 만 치거나 `HEAD` 로 보내면, 지금 브랜치가 main 이어도 글자에는 main 이 없습니다. 끝에 / 가 없는 `posts` 는 디렉터리인지 파일인지 글자로 알 수 없습니다. `bash -c` 안의 명령은 조각 맨 앞이 bash 라서 보지 못했습니다. 그래서 이 함수는 git 규칙을 지키는 장치 하나이고, 모든 꼴을 막지는 못합니다.

이 함수를 훅으로 쓰려면 파일로 저장하고, 설정 파일의 hooks 필드에 PreToolUse 이벤트와 matcher Bash 로 등록합니다. 문서의 표는 훅을 둘 자리로 일곱 곳을 꼽습니다. 사용자 설정, 프로젝트 설정, 로컬 설정, 관리 정책 설정, 플러그인, 스킬과 서브에이전트의 frontmatter 입니다. 이 글은 어느 설정 파일도 바꾸지 않았습니다. 등록하는 꼴과 예시 5 의 입력 전문은 더 깊이 보기에 적었습니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-coding-agent-cards.html?embed=1&card=hook" height="480" loading="lazy" title="PreToolUse 훅이 도구 호출의 입력을 받아 종료 코드 0 또는 2 를 돌려주는 과정"></iframe>
<a class="demo-embed-open" href="demo-coding-agent-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 5. 보고서와 장부로 한 바퀴를 닫습니다

**구현자는 커밋한 뒤 상태와 검사 결과와 걱정을 보고서에 적고, 컨트롤러는 검토 판정을 장부에 적습니다. 발췌의 사건을 세어 보면 실행 단계는 12분 25초였고, 그 가운데 기록 도구가 잰 시간은 662초였습니다. 보고 단계는 27분 20초였습니다.**

보고는 구현자의 마지막 일입니다. subagent-driven-development 에서 구현자는 전체 보고를 파일에 씁니다. 컨트롤러에게는 상태, 커밋, 한 줄 검사 요약, 걱정만 돌려줍니다. 상태는 DONE, DONE_WITH_CONCERNS, NEEDS_CONTEXT, BLOCKED 넷 가운데 하나입니다. Task 4 의 상태는 DONE_WITH_CONCERNS 였고, 보고서는 걱정 여덟을 적었습니다. 셋째 걱정은 심판이 남긴 번역기가 버너, 토너와 묶여 가장 큰 오디언스가 되었다는 것입니다.

```text
[약 16분] (구현자 메모: 한글 0. 묶음 9, office_supplies = 버너, 토너, 번역기, 빠진 키워드 4, 절반 47 을 넘는 묶음 0, 20명 미만 0)
(생략: 기록 상수를 뽑아 블록 셋을 글에 넣은 명령들)
$ python3 scripts/check-python-outputs.py --post interest-audience-library
  OK 통과 3, 건너뜀 0 (라이브러리 없음 0, 실행 안 됨 0), 실패 0
(생략: 명령 1개, node scripts/check-code-blocks.js 와 그 출력 1줄)
$ python3 scripts/check-llm-constants.py
  OK 기록 상수 12개 글 일치
$ python3 scripts/gen-ads-data.py --check
  OK 대조 106건(데이터 파일 1, 글의 KEYWORDS 리터럴 3, 글 8편의 공용 정의 97, 프롬프트 파일 5)이 지금 생성 결과와 같습니다. 키워드 120개와 자산 텍스트 202자의 꼴도 맞습니다
$ node scripts/check-content-standard.js interest-audience-library
  (생략: 머리 2줄)
  WARN 80자 초과 문장 6개:
  (생략: 문장 6줄)
  FAIL 죽은 링크: demo-interest-library-cards.html
(구현자 메모: 문장 여섯을 둘로 나눔, 데크는 아직 없음)
(생략: 구현자 메모 1줄. 데크 html 과 js, edu 엔트리, posts.js 의 excerpt 같은 필드를 씀)
$ node scripts/validate-posts.js 2>&1 | grep -v "존재하지 않는 글 id" | tail -12
  FAIL index.html 표지 전체 버튼: 표지 126편, posts.js 127편 (-1)
(구현자 메모: 127 로 고침)
$ node scripts/validate-posts.js
  exit=1
  OK index.html 표지 편수 10곳(전체 1, 태그별 9)이 posts.js 와 같음
  (생략: 아직 쓰지 않은 이 트랙 글 id 9개를 찾지 못한다는 줄 18개. exit=1 은 이 줄 때문이다)
  (생략: 이 명령은 index.html 을 고친 명령 뒤에 이어 돌렸고, 출력을 스크래치 파일에 받아 걸렀다)
(생략: 구현자 메모 셋. 화면 확인, 생성기 대조 시연, 검사 전부. 커밋 명령 앞부분의 grep 둘은 0건과 0건)
[약 44분] $ git add posts/interest-audience-library.md demo-interest-library-cards.html js/interest-library-cards-demo.js \
      data/llm-records/prompts/interest-audience-library-voters.json \
      data/llm-records/prompts/interest-audience-library-referee.json \
      data/llm-records/prompts/interest-audience-library-groups.json \
      data/llm-records/interest-audience-library-voters.json \
      data/llm-records/interest-audience-library-referee.json \
      data/llm-records/interest-audience-library-groups.json \
      scripts/gen-ads-data.py js/posts.js js/demo-edu-content.js index.html \
    && git status --short && git commit -q -F - <<'EOF'
feat(posts): 관심사 사전 만들기 — 로그 키워드가 이름 붙은 오디언스가 되기까지. 기록 두 단계

Co-Authored-By: Claude Opus 5.5 <메일 지움>
EOF
  (생략: git status --short 13줄)
$ git log --oneline -1 && git show --stat --format='%an <%ae>%n%B' HEAD | head -24 && git status --short | wc -l
  5327bb4 feat(posts): 관심사 사전 만들기 — 로그 키워드가 이름 붙은 오디언스가 되기까지. 기록 두 단계
  (생략: 작성자 줄 1줄, 메시지와 빈 줄 5줄, 파일별 줄 13줄)
   13 files changed, 1566 insertions(+), 18 deletions(-)
         0

[보고서] 구현자가 커밋 뒤 Write 도구로 쓴 task-4-report.md 의 머리
  # Task 4 보고: 관심사 사전 만들기 (`interest-audience-library`, 31주째, 2026-11-22)
  상태: DONE_WITH_CONCERNS (걱정은 맨 아래. 막는 것은 없다)
  (생략: 가운데 절들)
  ## 걱정
  1. **코드의 두 규칙이 이 기록에서 한 번도 걸리지 않았다.** (설명 생략)
  2. **두 투표가 같은 실수 7개.** (설명 생략)
  3. **office_supplies.** (설명 생략)
  (생략: 걱정 4~8)

[장부] 컨트롤러의 progress.md 에 남은 Task 4 의 줄 (에이전트 id 는 지움)
  Task 4: dispatched implementer (opus, agent <id 지움>) BASE 5b16504 — rulings B3-9, B3-10, B3-11 carried
  Task 4: implementer DONE_WITH_CONCERNS (commit 5327bb4, 파일 13). (뒤 생략)
  Task 4: review (opus) dispatched (package review-5b16504..5327bb4-norec.diff)
  Task 4: review (opus) — spec OK, quality Approved, Critical 0, Important 0, Minor 6. (뒤 생략)
  (생략: Task 4: minor (deferred) 줄 5개, 보고서만 고치게 한 줄 1개)
  Task 4: complete (commits 5b16504..5327bb4, review clean)
```

보고서의 숫자는 구현자가 블록 출력에서 옮긴 것이지만, 그 자체로는 구현자의 주장입니다. 그래서 커밋 전에 검사 스크립트가 같은 숫자를 다시 셉니다. check-python-outputs 는 글의 파이썬 블록을 돌려, 찍힌 줄이 글에 적힌 출력과 같은지 봅니다. check-llm-constants 는 글의 기록 상수를 기록 파일에서 다시 뽑아 대조합니다. `gen-ads-data.py --check` 는 106건을 생성기 출력과 맞춰 봤습니다. 데이터 파일, 글의 리터럴과 공용 정의, 프롬프트 파일입니다. check-content-standard 는 80자 넘는 문장 여섯과, 아직 만들지 않은 데크로 가는 죽은 링크를 알렸습니다. validate-posts 는 표지 편수가 하나 모자란다고 알렸고, 구현자가 127 로 고친 뒤 다시 돌리자 표지 검사가 통과했습니다. 보고서는 데크까지 만든 커밋 직전의 검사에서 내용 표준의 경고가 0 이었다고 적었습니다.

커밋 뒤에는 컨트롤러가 검토자 서브에이전트를 따로 불렀습니다. 검토자는 브리프와 보고서와 diff(바뀐 줄 목록)를 읽고, 요구 사항을 지켰는지(spec)와 만듦새(quality)를 나눠 판정합니다. Task 4 의 판정은 spec 통과, quality Approved, Critical 0, Important 0, Minor 6 이었습니다. spec 을 못 지켰거나 Critical, Important 가 있으면 고침 차례가 Task 마다 다섯 번까지 돌아갑니다. 앞 세 번은 같은 구현자가, 뒤 두 번은 적어도 한 단계 위 모델의 새 구현자가 고칩니다. Minor 는 고침 차례에 넣지 않고, 장부에 적어 마지막 전체 검토가 보게 합니다.

장부는 컨트롤러가 쓰는 progress.md 파일입니다. 스킬은 대화의 기억이 압축되면 남지 않으니, 진행을 할 일 목록만이 아니라 장부 파일에 적으라고 합니다. Task 를 마치면 `complete (commits …, review clean)` 꼴의 줄을 남깁니다. 판단을 내리면 `Ruling:` 으로 시작해 정한 것, 까닭, 틀렸을 때 잃는 것을 적습니다. 이 글의 시간을 적는 규칙도 장부의 Ruling 줄 하나로 정해졌습니다. 아래 블록은 발췌의 사건을 단계와 도구와 시간으로 적고, 단계별 시간과 명령 수와 사람의 승인을 셉니다. 발췌의 $ 줄 하나를 명령 하나로 셉니다.

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 3절과 5절 발췌의 사건을 단계, 도구, 지난 시간으로 적고 단계별 시간, 명령 수, 사람이 승인한 자리를 센다.
from collections import Counter

# 1단계: 발췌의 사건을 리터럴로 둔다
# EVENTS 는 Task 4 구현자의 사건이고 (단계, 도구, 시작에서 지난 시간, 무엇) 이다.
# 발췌의 $ 줄 하나를 명령 하나로 센다. 한 Bash 호출에 이어 적은 명령은 발췌에서 줄마다 나눠 실었다.
# 시간은 '분:초' 로, 기록 도구 앞뒤에 찍힌 시각과 커밋 시각에서 셌다. 시각이 남지 않은 사건은 None 이다.
# 시작은 첫 명령 git status 의 시각인데 그 시각만 대략으로 남아 있다. 그래서 시작에서 잰 시각에는 약을 붙이고,
# 시각이 남은 두 사건 사이의 시간은 초까지 적는다.
# 도구는 명령이 부른 프로그램 이름이고, 보고서를 쓴 Write 는 Claude Code 도구다. 메모는 구현자가 적은 괄호 줄이라 세지 않는다.
# RECORDS 는 기록 셋의 (이름, 요청 수, 기록 도구가 찍은 초, 기록이 도는 동안 돌린 Claude Code 도구 호출) 이다.
# CONTROLLER 는 구현자 밖에서 일어난 일이다. 컨트롤러의 Agent 도구 호출과 사람의 승인이 여기 있다.
EVENTS = [
    ('구현', 'git', '0:00', 'git status && git log --oneline -5'),
    ('구현', '메모', None, '생성기에 빌더 셋과 파일 전체 대조를 더함'),
    ('구현', 'gen-ads-data.py', None, '--check, 대조 81건'),
    ('구현', 'gen-ads-data.py', None, '--prompts 심판, 투표 기록이 없어 exit=1'),
    ('구현', 'gen-ads-data.py', None, '--prompts 투표, 프롬프트 파일'),
    ('구현', 'gen-ads-data.py', None, '--check, 대조 82건'),
    ('구현', 'llm-record.py', None, '--selftest'),
    ('실행', 'llm-record.py', '3:52', '기록 투표'),
    ('실행', 'python3 -c', '10:00', '투표 출력의 한글 수 0'),
    ('실행', '메모', None, 'keep 다름 4, reason_code 만 다름 2'),
    ('실행', 'gen-ads-data.py', None, '--prompts 심판, 키워드 4개'),
    ('실행', 'gen-ads-data.py', None, '--prompts 심판, 프롬프트 파일'),
    ('실행', 'gen-ads-data.py', None, '--check, 대조 83건'),
    ('실행', 'llm-record.py', '10:36', '기록 심판'),
    ('실행', '메모', '14:45', '심판 출력의 한글 0, 넷 모두 남김'),
    ('실행', 'gen-ads-data.py', None, '--prompts 묶기, 프롬프트 파일'),
    ('실행', 'gen-ads-data.py', None, '--check, 대조 84건'),
    ('실행', 'llm-record.py', '15:28', '기록 묶기'),
    ('보고', '메모', '16:17', '묶기 출력의 한글 0, 묶음 9'),
    ('보고', 'check-python-outputs.py', None, '통과 3'),
    ('보고', 'check-llm-constants.py', None, '기록 상수 12개 일치'),
    ('보고', 'gen-ads-data.py', None, '--check, 대조 106건'),
    ('보고', 'check-content-standard.js', None, '80자 넘는 문장 6개, 죽은 링크 1'),
    ('보고', '메모', None, '문장 여섯을 둘로 나눔'),
    ('보고', 'validate-posts.js', None, '표지 126편과 posts.js 127편이 다름'),
    ('보고', '메모', None, '표지를 127편으로 고침'),
    ('보고', 'validate-posts.js', None, '다시 돌려 표지 편수가 같음'),
    ('보고', 'git', '43:37', 'git add 파일 13개, git commit, 5327bb4'),
    ('보고', 'git', None, 'git log --oneline -1, git show --stat'),
    ('보고', 'Write', None, '보고서 파일'),
]
RECORDS = [
    ('투표', 12, 366, {'Bash': 3, 'WebFetch': 5, 'Read': 1}),
    ('심판', 1, 248, {'Bash': 9}),
    ('묶기', 1, 48, {}),
]
CONTROLLER = [
    ('작업 전', '사람', '계획서 승인'),
    ('Task 4 앞', 'Agent', '구현자를 부름'),
    ('Task 4 뒤', 'Agent', '검토자를 부름, spec OK, Critical 0, Important 0, Minor 6'),
    ('미리', '사람', '마지막 전체 검토 뒤의 병합과 push 승인'),
]


def sec(t):
    m, s = t.split(':')
    return int(m) * 60 + int(s)


def show(n, rough=False):
    if rough:
        return f'약 {round(n / 60)}분'
    if n < 60:
        return f'{n}초' if n else '0분'
    return f'{n // 60}분 {n % 60}초' if n % 60 else f'{n // 60}분'


commands = [e for e in EVENTS if e[1] not in ('메모', 'Write')]
notes = [e for e in EVENTS if e[1] == '메모']
timed = [e for e in EVENTS if e[2] is not None]
print(f'사건 {len(EVENTS)}개: 명령 {len(commands)}개, Write {len(EVENTS) - len(commands) - len(notes)}번, '
      f'메모 {len(notes)}줄, 시각이 남은 사건 {len(timed)}개')

# 2단계: 단계마다 걸린 시간을 센다
# 단계의 시간은 다음 단계의 첫 사건 시각에서 이 단계의 첫 사건 시각을 뺀 값이고, 마지막 단계는 커밋까지다.
# 기록의 창은 기록 명령의 시각에서 다음 시각이 남은 사건까지다. 창 사이에는 다음 프롬프트를 만드는 명령이 돌았다.
stages = list(dict.fromkeys(e[0] for e in EVENTS))
first = {s: sec(next(e[2] for e in EVENTS if e[0] == s and e[2])) for s in stages}
end = sec(timed[-1][2])
for i, s in enumerate(stages):
    stop = first[stages[i + 1]] if i + 1 < len(stages) else end
    print(f'{s}: {show(first[s], rough=first[s] > 0)} → {show(stop, rough=True)}, {show(stop - first[s], rough=(first[s] == 0))}')
print(f'시작에서 커밋까지 {show(end, rough=True)}')
windows, gaps = [], []
for name, requests, tool_sec, during in RECORDS:
    i = next(k for k, e in enumerate(timed) if e[3] == '기록 ' + name)
    windows.append(sec(timed[i + 1][2]) - sec(timed[i][2]))
    if i + 2 < len(timed) and timed[i + 2][3].startswith('기록 '):
        gaps.append(sec(timed[i + 2][2]) - sec(timed[i + 1][2]))
print('기록의 창: ' + ', '.join(f'{r[0]} {show(w)}' for r, w in zip(RECORDS, windows)))
print('기록 도구가 잰 시간: ' + ', '.join(f'{r[0]} {r[2]}초' for r in RECORDS)
      + f', 합 {sum(r[2] for r in RECORDS)}초, 요청 {sum(r[1] for r in RECORDS)}개')
print('창 사이: ' + ', '.join(f'{g}초' for g in gaps))
print('기록이 도는 동안 돌린 Claude Code 도구 호출: ' + ', '.join(
    f'{r[0]} {sum(r[3].values())}번' + (' (' + ', '.join(f'{t} {n}' for t, n in r[3].items()) + ')' if r[3] else '')
    for r in RECORDS))

# 3단계: 단계마다 명령을 센다
for s in stages:
    count = Counter(e[1] for e in commands if e[0] == s)
    print(f'{s} 명령 {sum(count.values())}개: ' + ', '.join(f'{tool} {n}' for tool, n in count.most_common()))
total = Counter(e[1] for e in commands)
print(f'명령 모두 {sum(total.values())}개, 많은 차례로 ' + ', '.join(f'{tool} {n}' for tool, n in total.most_common(3)))

# 4단계: 사람이 승인한 자리를 센다
# 구현자의 사건과 컨트롤러의 자리에서 도구가 사람인 것을 따로 센다.
inside = [e for e in EVENTS if e[1] == '사람']
agents = [c for c in CONTROLLER if c[1] == 'Agent']
people = [c for c in CONTROLLER if c[1] == '사람']
print(f'구현자의 사건에서 사람이 승인한 자리: {len(inside)}번')
print(f'Task 4 앞뒤의 컨트롤러: Agent {len(agents)}번 (' + ', '.join(c[2].split(',')[0] for c in agents) + ')')
print(f'묶음 전체에서 사람이 승인한 자리: {len(people)}번 (' + ', '.join(f'{c[2]}({c[0]})' for c in people) + ')')
# 출력:
# 1단계 뜻: 발췌의 사건 30개 가운데 명령은 23개이고, 시각이 남은 사건은 8개다.
# 사건 30개: 명령 23개, Write 1번, 메모 6줄, 시각이 남은 사건 8개
# 2단계 뜻: 실행은 12분 25초, 보고는 27분 20초였고, 기록 도구가 잰 시간은 모두 662초다.
# 구현: 0분 → 약 4분, 약 4분
# 실행: 약 4분 → 약 16분, 12분 25초
# 보고: 약 16분 → 약 44분, 27분 20초
# 시작에서 커밋까지 약 44분
# 기록의 창: 투표 6분 8초, 심판 4분 9초, 묶기 49초
# 기록 도구가 잰 시간: 투표 366초, 심판 248초, 묶기 48초, 합 662초, 요청 14개
# 창 사이: 36초, 43초
# 기록이 도는 동안 돌린 Claude Code 도구 호출: 투표 9번 (Bash 3, WebFetch 5, Read 1), 심판 9번 (Bash 9), 묶기 0번
# 3단계 뜻: 모델을 부른 llm-record.py 는 4개이고, 프롬프트를 만들고 대조한 gen-ads-data.py 는 10개다.
# 구현 명령 6개: gen-ads-data.py 4, git 1, llm-record.py 1
# 실행 명령 9개: gen-ads-data.py 5, llm-record.py 3, python3 -c 1
# 보고 명령 8개: validate-posts.js 2, git 2, check-python-outputs.py 1, check-llm-constants.py 1, gen-ads-data.py 1, check-content-standard.js 1
# 명령 모두 23개, 많은 차례로 gen-ads-data.py 10, llm-record.py 4, git 3
# 4단계 뜻: 구현자의 사건에는 사람의 승인이 없고, 사람의 승인은 묶음 전체에 두 번이다.
# 구현자의 사건에서 사람이 승인한 자리: 0번
# Task 4 앞뒤의 컨트롤러: Agent 2번 (구현자를 부름, 검토자를 부름)
# 묶음 전체에서 사람이 승인한 자리: 2번 (계획서 승인(작업 전), 마지막 전체 검토 뒤의 병합과 push 승인(미리))
```

구현 단계는 약 4분, 실행 단계는 12분 25초, 보고 단계는 27분 20초였습니다. 실행 단계에서 기록 도구가 잰 시간은 662초였습니다. 기록 사이의 36초와 43초에는 한글 수 세기와 다음 프롬프트를 만드는 명령이 돌았습니다. 기록이 도는 동안에도 Claude Code 의 도구 호출이 투표 때 9번, 심판 때 9번 있었습니다. 발췌의 명령 23개 가운데는 gen-ads-data.py 가 10개로 가장 많았고, llm-record.py 는 4개였습니다. 모델을 부른 명령보다 프롬프트를 만들고 대조한 명령이 더 많았습니다.

구현자의 사건에서 사람이 승인한 자리는 0번이었습니다. 사람의 승인은 묶음 전체에 두 번 있었습니다. 작업 전에 계획서를 승인했고, 병합과 push 는 마지막 전체 검토 뒤에 하도록 미리 승인했습니다. 결과를 사람이 읽고 믿는 대신 검사로 다시 세는 방식은 코딩 에이전트를 재는 벤치마크도 같습니다. Jimenez 외(2023)의 SWE-bench 는 파이썬 저장소 12곳의 GitHub 이슈와 풀 리퀘스트로 문제 2,294개를 만들었습니다. 모델이 낸 패치가 저장소에 적용되고, 그 문제의 단위 테스트와 시스템 테스트가 모두 통과해야 푼 것으로 셉니다. 논문은 그때 가장 나았던 Claude 2 도 BM25 로 고른 맥락에서 1.96% 만 풀었다고 적었습니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-coding-agent-cards.html?embed=1&card=ledger" height="480" loading="lazy" title="보고서와 검토 판정이 장부에 남고, 발췌의 사건으로 단계별 시간과 명령을 세는 과정"></iframe>
<a class="demo-embed-open" href="demo-coding-agent-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 6. 두 무대는 에이전트가 닿는 기록과 사람이 승인할 자리가 다릅니다

**계획, 구현, 실행, 보고의 순서와 훅의 꼴은 두 무대가 같습니다. 다른 것은 실험이 읽는 기록과, 실험 결과가 광고비에 닿는 자리입니다. 담장 안은 회원 로그와 광고 서버가 한 회사에 있고, 열린 RTB 의 DSP 는 받은 입찰 요청의 기록으로 실험합니다.**

1~5절의 순서와 훅은 두 무대가 같습니다. 두 무대의 이름은 18주째 [자연어 오디언스](post.html?id=natural-language-audience) 편 8절에서 풀었습니다.

### 담장 안에서는 실험이 회원 로그와 광고 서버에 닿습니다 [무대: 닫힌 생태계]

담장 안의 플랫폼은 회원 번호로 이은 로그, 랭킹 모델, 광고 서버를 한 회사가 가집니다. 에이전트가 같은 저장소에서 실험하면 회원 단위의 원본 로그를 여는 명령도 칠 수 있습니다. 그래서 훅의 규칙에 git 규칙 말고도 원본 로그를 여는 명령과 서빙 설정을 바꾸는 명령을 더합니다. 이 글의 Task 4 는 생성기가 만든 가상 회원 2,000명으로 돌았습니다.

담장 안에서는 실험의 숫자를 같은 회원 번호의 온라인 A/B 테스트로 다시 잴 수 있습니다. 결과가 광고비에 닿는 때는 모델과 서빙 설정을 내보낼 때입니다. 그래서 사람의 승인은 병합과 서빙 배포 앞에 둡니다.

### 열린 RTB 에서는 실험이 받은 입찰 요청을 다시 돌립니다 [무대: 열린 RTB]

열린 RTB 의 DSP 가 가진 기록은 거래소에서 받은 입찰 요청과 이긴 경매의 결과입니다. 진 경매의 낙찰가는 보지 못합니다. 그래서 에이전트의 실험도 그 기록을 다시 돌리는 오프라인 실험이 됩니다.

DSP 의 입찰기는 거래소의 요청에 정해진 시간 안에 답해야 합니다. 그래서 입찰 코드를 바꾸면 응답 시간과 지출이 함께 바뀝니다. 훅의 규칙에는 입찰기 설정을 바꾸는 명령을 더하고, 사람의 승인은 입찰기에 새 코드가 올라가기 전에 둡니다. 아래 표는 가상 데이터가 아니라 두 무대의 설계 차이를 적은 것입니다.

| 무엇 | 담장 안 | 열린 RTB |
|---|---|---|
| 실험이 읽는 기록 | 회원 번호로 이은 로그 | 받은 입찰 요청과 이긴 경매 |
| 훅에 더할 규칙 | 원본 로그를 여는 명령, 서빙 설정 변경 | 입찰기 설정 변경 |
| 결과를 다시 재는 법 | 같은 회원 번호의 온라인 A/B 테스트 | 입찰 기록을 다시 돌리는 오프라인 실험 |
| 사람이 승인할 자리 | 병합과 서빙 배포 | 입찰기에 새 코드가 올라가기 전 |

## 한눈 정리

| 자리 | 무엇을 하나 | 이 글의 숫자 |
|---|---|---|
| 계획 | 계획서의 칸과 브리프를 적는다 | 브리프 한 절, 아홉 단계, 사람이 승인 |
| 구현 | 실험 코드를 고친다 | 약 4분, 앞 기록이 없어 심판 빌더가 exit=1 |
| 실행 | 모델 기록을 돌린다 | 12분 25초, 요청 14개, 기록 도구가 잰 662초 |
| 보고 | 검사하고 커밋한 뒤 보고서를 쓴다 | 커밋까지 27분 20초, 커밋 5327bb4, 보고서의 걱정 여덟 |
| 스킬 | 계획서의 칸과 Task 의 순서를 정한다 | 스킬 둘, Task 마다 구현자와 검토자 |
| 훅 | 도구 호출 전에 git 규칙을 코드로 본다 | 예시 다섯 가운데 막힘 셋, 놓친 꼴 넷 |
| 장부와 검토 | 판정과 결정을 파일에 남긴다 | spec 통과, Critical 0, Important 0, Minor 6 |
| 사람의 승인 | 계획서와 병합, push 자리에 둔다 | 구현자의 사건 0번, 묶음 전체 2번 |

## 헷갈리기 쉬운 점

- **에이전트가 쓴 숫자도 검사기가 다시 셉니다.** Task 4 보고서의 숫자는 구현자가 블록 출력에서 옮겼지만, 그대로는 주장입니다. 커밋 전에는 check-python-outputs 가 블록을 다시 돌렸습니다. check-llm-constants 는 기록 상수를 다시 뽑아 대조했습니다. 커밋 뒤에는 검토자가 산문의 숫자마다 블록 출력의 같은 값을 찾습니다. SWE-bench 도 모델의 설명이 아니라, 패치가 적용되고 테스트가 통과했는지로 푼 문제를 셉니다.

- **훅은 권한 설정과 다릅니다.** 권한 규칙은 설정 파일의 allow, ask, deny 목록에 `Bash(git push *)` 같은 꼴로 적습니다. Claude Code 가 deny, ask, allow 차례로 맞춰 보고, 처음 맞은 규칙이 결과를 정합니다. 훅은 입력 전체를 받아 코드로 판단하는 프로그램입니다. 문서에 따르면 종료 코드 2 로 막는 훅은 권한 규칙을 보기 전에 호출을 막아, allow 규칙이 있어도 막힙니다. 거꾸로 훅이 allow 를 돌려줘도 deny 와 ask 규칙은 그대로 적용됩니다. 훅의 if 필터는 Bash 명령을 다 알아보지 못하면 패턴과 상관없이 훅을 돌립니다. 문서는 이 필터가 best-effort 라며, 반드시 막거나 허용할 것은 권한 시스템에 맡기라고 적었습니다. 둘 다 명령의 글자를 보는 장치라서, 파일과 네트워크를 글자와 상관없이 막으려면 sandboxing 을 쓰라고도 했습니다.

- **사람의 승인은 병합과 push 자리에 둡니다.** 구현자의 사건에는 사람이 승인하는 단계가 없었습니다. 사람은 일을 시작하기 전에 계획서를 승인했고, 병합과 push 는 마지막 전체 검토 뒤에 하도록 미리 승인했습니다. subagent-driven-development 는 멈추고 사람에게 물을 일을 넷으로 꼽습니다. 그 가운데 하나가 병합, 공유 브랜치로의 push, 게시입니다. 4절의 함수가 main 으로의 push 를 막는 것도 같은 자리입니다. 문서에 따르면 PreToolUse 훅은 막는 대신 사용자에게 확인을 물을 수도 있습니다. JSON 출력의 permissionDecision 을 ask 로 두는 방법입니다.

## 더 깊이 보기

:::deep 훅 입력 전문과 등록하는 꼴
예시 5 가 `run_hook` 에 넘긴 JSON 입니다. 필드는 Claude Code 문서의 PreToolUse 예시와 같고, 세션 id 와 경로는 자리표시입니다.

```json
{
  "session_id": "<session id>",
  "prompt_id": "<prompt id>",
  "transcript_path": "<transcript path>",
  "cwd": "<repo>",
  "scratchpad_dir": "<scratchpad>",
  "permission_mode": "default",
  "hook_event_name": "PreToolUse",
  "tool_name": "Bash",
  "tool_input": {
    "command": "git push --force origin main",
    "description": "<description>",
    "timeout": 120000,
    "run_in_background": false
  },
  "tool_use_id": "<tool use id>"
}
```

문서의 공통 입력 표에서 필드마다의 뜻은 이렇습니다. session_id 는 지금 세션의 id 이고, prompt_id 는 처리 중인 사용자 프롬프트의 UUID 입니다. prompt_id 는 첫 사용자 입력 전에는 없습니다. transcript_path 는 대화 JSON 의 경로인데, 파일을 비동기로 써서 지금 차례의 마지막 메시지가 아직 없을 수 있습니다. cwd 는 훅이 불릴 때의 작업 폴더이고, scratchpad_dir 은 세션의 임시 폴더입니다. scratchpad_dir 은 Claude Code v2.1.257 이상에서 옵니다. 세션에 임시 폴더가 없거나 임시 디렉터리를 쓸 수 없으면 오지 않습니다.

permission_mode 는 지금의 권한 모드입니다. 값은 default, plan, acceptEdits, auto, dontAsk, bypassPermissions 가운데 하나입니다. 이 필드는 모든 이벤트에 오지는 않습니다. hook_event_name 은 불린 이벤트의 이름입니다. 표에는 이 밖에 effort 필드도 있습니다. effort 는 PreToolUse 처럼 도구 맥락이 있는 이벤트에, effort 를 쓰는 모델일 때 옵니다. 서브에이전트 안에서 불린 훅에는 agent_id 와 agent_type 도 옵니다. Bash 의 tool_input 은 command, description, timeout, run_in_background 넷입니다.

막을 때 Claude 가 받는 글도 문서에 있습니다. 문서의 예시에서 Claude 는 훅의 stderr 를 도구의 오류로 받고, 그 앞에 이벤트 이름과 도구 이름, 훅의 명령이 붙습니다. 예시 5 라면 `PreToolUse:Bash hook error:` 와 훅의 명령 뒤에 stderr 의 까닭이 이어집니다.

등록은 설정 파일의 hooks 필드에 이벤트, matcher, 실행할 명령의 세 겹으로 적습니다. 문서는 경로 자리표시를 쓰는 훅이면 args 를 두는 exec form 을 권합니다. 아래는 그 꼴로 적은 예시이고, 이 글은 이 꼴을 어느 설정 파일에도 넣지 않았습니다.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "python3",
            "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/git_rules.py"],
            "onFailure": "block"
          }
        ]
      }
    ]
  }
}
```

훅 파일은 블록 1 의 import 와 1단계, 2단계를 옮긴 것입니다. 맨 아래에는 `sys.exit(run_hook(sys.stdin.read(), sys.stderr))` 한 줄을 둡니다. 3단계와 4단계는 예시라서 옮기지 않습니다. `run_hook` 은 JSON 을 읽지 못하거나 판단하다 예외가 나면 2 를 돌려주므로, 그때도 호출을 막습니다. 그래도 경로를 잘못 적었거나 python3 를 찾지 못하면 이 코드는 돌지도 않습니다. 문서는 그런 훅이 막지 않는 오류 알림만 남긴다고 경고합니다. 실패로 세는 것은 시작하지 못한 훅, 0 과 2 가 아닌 종료 코드, 시간 초과, 읽을 수 없거나 스키마 검증에 걸린 JSON 출력입니다. 위 설정처럼 onFailure 를 block 으로 두면, 실패한 훅도 그 이벤트의 종료 코드 2 처럼 호출을 막습니다. 이 필드는 Claude Code v2.1.295 이상에서 씁니다. 문서의 경고 하나도 덧붙입니다. command 훅은 사용자의 권한 그대로 셸 명령을 돌리므로, 넣기 전에 명령을 읽고 시험해야 합니다.
:::

:::deep 발췌를 다듬은 규칙
발췌의 재료는 Task 4 보고서의 「명령과 출력의 순서」 절입니다. 그 절은 구현자가 이 글을 위해 줄여 적은 꼴입니다. 그래서 발췌에 실은 명령과 출력은 보고서 끝의 「명령 기록」에서 글자를 맞춰 옮겼습니다. 명령 기록 앞에 있었던 첫 명령 git status 의 출력과 구현자 메모는 「순서」 절의 글을 그대로 실었습니다. 명령 기록에는 첫 빌더 실행부터 커밋 뒤 확인까지의 Bash 호출 70번이 있습니다. 명령은 글자 그대로이고, 긴 출력은 앞뒤 여섯 줄씩입니다. 이 기록은 Task 4 검토의 Minor 하나가 재료의 줄인 꼴을 짚은 뒤, 구현자가 보고서에 붙인 것입니다.

- 경로: 발췌에 실은 명령은 모두 저장소 맨 위에서 돌았습니다. 명령 앞의 `cd` 와 저장소 경로는 지우고, 저장소는 `<repo>` 로 적었습니다.
- 스크래치 폴더: 그 폴더로 출력을 보내던 `tee` 와 그 경로는 명령에서 지웠습니다.
- 시각: 기록 명령 앞뒤의 `date` 와 벽시계 시각은 지우고, 첫 명령에서 지난 분으로 적었습니다.
- 약: 첫 명령의 시각이 대략으로만 남아 있어, 지난 분에는 모두 약을 붙였습니다.
- 커밋 시각: 커밋의 분은 git 이 남긴 커밋 시각에서 셌습니다.
- 지운 것: 계정, 메일, 세션 id, 에이전트 id, 세션 기록 파일의 경로를 지웠습니다.
- 커밋 메시지: 꼬리 줄의 메일은 「메일 지움」으로 바꾸고, 작성자 줄은 생략했습니다.
- 생략: 「순서」 절에서 고르지 않은 명령과 메모, 줄인 출력, 기록이 도는 동안의 호출은 「생략」 줄에 적었습니다.
- 생략하지 않은 것: 「순서」 절에도 없고 명령 기록에만 있는 명령은 기록이 도는 동안의 호출 말고는 따로 적지 않았습니다.
- 줄인 명령: validate-posts 를 다시 돌린 명령은 스크래치 파일 경로가 든 꼴이라 앞부분만 남기고 「생략」 줄에 적었습니다.
- 메모: 「구현자 메모」 줄은 구현자가 적은 괄호 줄입니다. 도구의 출력이 아닙니다.
- 첫 명령: git status 의 출력은 명령 기록에 글자 그대로 남지 않았습니다. 구현자가 줄인 한 줄을 실었습니다.
- 표시: 줄 맨 앞의 체크 표시, 엑스 표시, 경고 표시는 OK, FAIL, WARN 으로 바꿨습니다.
- 판정: 장부의 검토 판정 줄에 있던 통과 표시도 OK 로 바꿨습니다.
- 긴 줄: git add 의 파일 13개는 줄 끝 역슬래시로 나눠 실었습니다. 명령의 뜻은 같습니다.
- 줄바꿈: 심판 프롬프트의 user 문자열에 든 줄바꿈 표시는 실제 줄로 나눠 실었습니다.

올리기 전에 이 글에서 두 grep 을 돌려 0건을 확인했습니다. 하나는 사용자 폴더 경로, 계정 이름, GitHub no-reply 메일, UUID 꼴을 찾습니다. 다른 하나는 저장소 밖에 둔 금지어 목록으로 찾습니다.
:::

- [관심사 사전 만들기](post.html?id=interest-audience-library) — 31주째 편입니다. 이 글의 발췌는 그 편을 만든 세션에서 뽑았습니다.
- [Tool use 와 에이전트 루프](post.html?id=tool-use-agent-loop) — 모델이 고르고 코드가 실행하는 루프와 가드레일을 본 25주째 편입니다.
- [광고주 에이전트](post.html?id=advertiser-agent-mcp) — 쓰기 도구 앞에 승인 단계와 서버의 가드레일을 둔 37주째 편입니다.
- [워크플로와 자율 루프](post.html?id=workflow-vs-autonomous-loop) — 순서를 코드가 정하는 워크플로를 본 38주째 편입니다.
- [Git 실무 가이드](post.html?id=git-practical-guide) — `--force` 와 `--force-with-lease` 의 차이를 다룬 편입니다.
- [코딩 에이전트 카드 네 장](demo-coding-agent-cards.html) — 이 글의 카드 전체입니다. 카드를 누르면 헷갈리는 것 하나가 더 나옵니다.

## 참고문헌

- Anthropic. *Hooks reference* (Claude Code 문서). [code.claude.com](https://code.claude.com/docs/en/hooks). 훅 이벤트, 입력 JSON 의 필드, 종료 코드, 훅을 둘 자리입니다. PreToolUse 훅이 종료 코드 2 로 막으면 Claude 가 stderr 를 거부 까닭으로 받는다고 적었습니다.
- Anthropic. *Extend Claude with skills* (Claude Code 문서). [code.claude.com](https://code.claude.com/docs/en/skills). SKILL.md 의 frontmatter 와 지시, 스킬을 부르는 두 방법입니다. 부른 스킬의 내용이 메시지 하나로 대화에 남는다고 적었습니다.
- Anthropic. *Create custom subagents* (Claude Code 문서). [code.claude.com](https://code.claude.com/docs/en/sub-agents). 서브에이전트는 자기 컨텍스트 윈도우에서 따로 정한 시스템 프롬프트와 도구, 권한으로 돌아갑니다. settings 의 PreToolUse 훅은 서브에이전트의 도구 호출 앞에서도 돈다고 적었습니다.
- Anthropic. *Configure permissions* (Claude Code 문서). [code.claude.com](https://code.claude.com/docs/en/permissions). allow, ask, deny 규칙과 평가 차례, 훅과 규칙 사이의 우선순위입니다. `Bash(git push *)` 규칙이 막지 못하는 꼴의 표가 있습니다.
- Carlos E. Jimenez 외 (2023). *SWE-bench: Can Language Models Resolve Real-World GitHub Issues?* ICLR 2024. arXiv:2310.06770. [arxiv.org](https://arxiv.org/abs/2310.06770). 파이썬 저장소 12곳의 GitHub 이슈와 풀 리퀘스트로 만든 문제 2,294개입니다. 패치가 적용되고 그 문제의 테스트가 모두 통과해야 푼 것으로 셉니다.
- Vincent, J. *superpowers* (7.0.0 버전). [github.com](https://github.com/obra/superpowers/tree/v7.0.0). 이 묶음이 쓴 writing-plans 와 subagent-driven-development 스킬이 든 공개 플러그인입니다. 계획서의 칸, Task 마다 구현자와 검토자를 부르는 순서, 장부의 줄 꼴을 적었습니다.
