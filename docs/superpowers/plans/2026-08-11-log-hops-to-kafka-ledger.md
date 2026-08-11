# SDD ledger — plan: docs/superpowers/plans/2026-08-11-log-hops-to-kafka.md

Setup: main 브랜치에서 진행. 사용자가 승인한 플랜 Task 9 Step 6 이 `git push origin main` 이고,
이 저장소의 글 추가는 전부 main 직행이다(MARKDOWN_GUIDE.md "새 글 추가 — 한 흐름").
Setup: 사전 점검에서 플랜 내부 모순 4건을 고침 (커밋 예정)
  - 1절 96 B → 102 B, 2절 78 B → 79 B (실제로 세어 확정)
  - 4절 "Kafka 도달까지 906 ms vs 5~50 ms" → "수집 서버가 받은 뒤 942 ms vs 256 ms"
  - 8절 고정 표 41 B → 숫자 빼기 (Task 6 Step 3 권장과 일치시킴)
  - 데모 층 5개 vs HOPS 6개 → 층 6개로 통일 (transform 층 추가)
Task 1: complete (commits 9c0103f..df9526b, review clean — 스펙 ✅)
Task 1: minor (deferred): js/posts.js 새 객체에 `series: 'engineering-foundations'` 필드 없음.
  형제 5편은 전부 갖고 있음. 동작엔 무해(getSeriesForPost 폴백 확인, .series 직접 읽는 스크립트 없음).
  원인은 브리프 Step 2 예시 자체의 누락. 한 줄 추가면 끝 — 최종 리뷰 fix wave 에서 처리.
Task 2: 리뷰 1회차 — 스펙 ✅ / 품질 이슈 3 (Critical 1, Important 1, Minor 1)
  - [Critical] 2절 74줄: 2.28 GB 계산이 1절의 배치 규칙(10건 또는 5초)과 충돌.
    묶어 보내면 응답 수가 노출 수보다 적다
  - [Important] 2절 74줄: `{"ok":true}` 는 11 B 인데 본문이 10 B 라고 적힘
Task 2: minor (deferred): 63줄 "같은 SDK 안에서 두 이벤트의 값이 다르다" — 위가 수치라
  "값"이 숫자로 읽힌다. "한 건을 잃었을 때 잃는 것이 다르다" 쪽이 낫다
Task 2: minor (deferred): js/posts.js 이 글 객체에 `worldPractical` 없음 → 전체 요약에서
  `practical없음` 플래그. Task 1 의 `series` 누락과 같은 묶음, 최종 fix wave 에서 함께 처리
Task 2: 컨트롤러가 플랜 잔재 7곳 수정 (커밋 별도) — 9절 지도표 96/78 B, 데모 HOPS sdk 상수.
  Task 2 리뷰가 잡음. 안 고쳤으면 Task 6·7 이 옛 값을 옮길 뻔했다
Task 2: 뒤 절에 넘길 확정값 — collect_ts 16:48:21.402 (왕복 168 ms 를 전부 가는 쪽에 몰았다고
  본문에 명시함, 뒤 절에서 다시 쪼개면 충돌) / `tz`·`sdk` 는 요청 헤더로 올렸다고 2절이 확정.
  `sdk` 는 User-Agent → app_ver 로 회수되나 `tz` 는 3·6절에 안 나옴 → Task 3 이 한 줄 처리
Task 2: fix round 1/5 진행 중
Task 2: fix round 1/5 (2 addressed, 0 open; commits 4580d09..4c72aea)
  - 응답 트래픽 2.28 GB → 652 MB (배치 계수 4 명시, 요청 5,928만 × 11 B)
  - {"ok":true} 10 B → 11 B
Task 2: 재리뷰가 짚은 교차-태스크 사실 — 컨트롤러 판정
  사실: 배치 계수 4 → 요청 초당 686건. 뒤 절이 쓰는 이벤트 초당 2,665건과 3.9배 차이.
  판정: 액세스 로그 줄 수는 요청 기준(686/s), Kafka 레코드 수는 이벤트 기준(2,665/s).
        Kafka 는 이벤트마다 레코드 하나라 예제 2(볼륨·디스크)는 영향 없음.
        4절 예제 3 의 450 KB/s 는 "이벤트마다 한 줄이라고 본 상한" 으로 명시한다.
        3절이 "노출 요청 한 줄에 4건이 실리고 5절 파서가 쪼갠다"를 한 문장으로 밝힌다.
  → Task 3 디스패치에 이 판정을 넣는다
Task 2: complete (commits df9526b..4c72aea, review clean)
Task 3: 리뷰 1회차 — 스펙 ✅ / Critical 0 · Important 3 · Minor 5
  리뷰어가 942·256·686·61.7h·10.4분·356배·450KB/s·194줄·686/s·5,928만 전부 독립 검산 → 일치
  파이썬 실행 diff 0줄. 형제 글 79~93줄 인용 원문 일치
  구현자 이탈(대비 표 행 이름 "요청 처리를 끝낸 뒤") → 리뷰어 판정 "맞다, 그대로 두라"
  [Important] 홉 세는 수가 넷 (도입 다섯 / 파이썬 일곱 / 대비 표 3 / 제목 아홉)
  [Important] 3절 124줄 "로그 쓰기가 응답을 안 붙잡는다" vs 4절 292줄 "쓰기 실패가 요청까지 흔든다"
  [Important] 126줄 91자 — 검사기가 코드 스팬을 1글자로 접어(check-content-standard.js:69) 놓침
Task 3: minor (deferred) x5
  - 686 이 두 뜻 (초당 686줄 / 686 ms) — 4절 153줄
  - "깠다 / 깐 것은" 구어체 (151줄). 저장소 40편에 이 용법 없음
  - "686 ms 짜리 중간 기착" (155줄) — "기착"이 이 글에서 가장 낯선 한자어
  - 파이썬 주석 "수집 서버가 초당 받는 줄" PER_SEC=2,665 vs 3절 표 686 (185줄).
    코드는 못 고치게 돼 있고 279줄 해설이 덮음. 뒤 절이 이 코드를 다시 인용하면 되돌아옴
  - 서버 처리 2 ms 이중 계산 여지 (190~198줄 vs 2절 93줄). collect_ts .402 는 안 깨짐
Task 3: 뒤 절에 넘길 것
  - 6절 파이썬이 이 글의 **두 번째** 블록이어야 함 (4절 블록 186줄이 "예제 2에서 잰"으로 앞을 가리킴)
  - collect_ts 밀리초가 액세스 로그에 안 남음 ($time_iso8601 은 초까지). 6절이 .402 를 쓰려면 출처 한 줄 필요
  - 파일·에이전트 구간 686줄/s, Kafka 안 2,665건/s. 5절 파서가 그 사이에서 4배로 늘림
Task 3: 확인 불가 2건 — mermaid 다크 렌더(Task 9 테마 확인으로), 예제 2 전방 참조(Task 4 가 만듦)
Task 3: fix round 1/5 진행 중
Task 3: fix round 1/5 (3 addressed, 0 open; commits 3907da0..4d88736)
  - 홉 세는 수 넷 갈랐음 (279줄). 재리뷰어가 다섯/일곱/셋/아홉을 직접 세어 전부 실측 일치 확인
  - nginx 모순: 표 칸을 "쓰기가 실패해 로그가 끊긴다"로 낮추고 300줄에 갈라 쓰는 문단 추가.
    4절 결론(302줄)은 "디스크가 차면" 행을 근거로 안 써서 안 흔들림
  - 91자 → 두 문장. 재리뷰어 자체 측정기로 글 전체 80자 초과 0건, 최장 71자(118줄)
Task 3: complete (commits 4c72aea..4d88736, review clean)
저장소 이슈 (이 플랜 범위 밖, 사용자에게 최종 보고할 것):
  scripts/check-content-standard.js 의 장문 검사가 두 군데서 샌다 —
  (1) 69줄: 인라인 코드 스팬을 '…' 한 글자로 접어 센다
  (2) 63줄 줄 필터가 67줄의 `**` 제거보다 먼저 돌아, `**굵게**` 로 시작하는 산문 줄을 통째로 뺀다
  두 재리뷰어가 각각 독립 재현함. 40편 전체가 이 방식으로 측정돼 왔다.
  고치면 기존 글에서 새 경고가 쏟아질 수 있으므로 사용자 판단 사항.
  재사용 가능한 독립 측정기: scratchpad/measure.js
Task 4: 리뷰 1회차 — 스펙 ✅ / Critical 2 · Important 1 · Minor 4
  산술(686→2,665)·파이썬 두 블록·4칸 표·문장 길이·비유 전부 통과
  [Critical] 노출 배치의 rid 가 r-7c04 인데 클릭은 r-8f21 → 형제 글 432줄의 유일한 약속
    ("같은 요청의 노출과 클릭이 같은 partition")을 깬다
  [Critical] 391줄 "노출은 ad.impression 으로 나간다" → 형제 글은 그 topic 을 producer
    하나짜리로 놓고 하루 2.28억·보존 용량을 계산. 확인 줄을 더 넣으면 4.56억이 되어 깨진다
  [Important] pos.db 는 SQLite 파일이라 405~409줄 텍스트 형식이 그대로 안 나온다
Task 4: 컨트롤러 판정 — 노출 확인은 `ad.impression.confirm` 으로 나간다
  ad.impression 에 넣는 곳은 형제 글대로 bidder 하나. 두 줄이 req_id 로 이어 붙어야
  "노출됐다"가 완성되고 그것이 형제 글 도입 11줄이 말한 두 줄이다.
  두 topic 은 같은 key(req_id)·같은 partition 수(12)를 써야 조인이 partition 안에서 끝난다
  (형제 글 778줄 partitioner 함정이 여기 그대로 걸린다).
  → 7절 예제 2 의 ROWS=2.3028억(확인 2.28억 + 클릭 228만)과 정확히 맞는다. 볼륨 계산 영향 없음
Task 4: Minor 3건을 컨트롤러가 fix 로 올림 — 근거는 저장소 규칙
  "예시가 도식이더라도 독자가 복사해 갈 줄은 문법이 맞아야 한다" (lua script 누락, Match *)
  "본문에 쓴 것은 보여 준 데이터로 검산이 돼야 한다" (타입 붙이기가 이 줄에선 빈 작업)
Task 4: minor (deferred): 554줄이 y=0 토큰을 안 씀. 9절이 받아 쓰기 쉽게 y=0 으로 적으면 좋음
Task 4: fix round 1/5 진행 중
Task 4: fix round 1/5 (6 addressed, 0 open; commits f1a3f18..a5c9735)
  - rid 를 배치 건마다 부여, 첫 건 r-8f21. r-7c04 grep 0건. 멱등키(seq 다름)/조인키(rid 같음) 한 쌍에서 정리
  - ad.impression.confirm 으로 갈랐고 세 문단으로 근거. 형제 글 771·776·778줄과 표현까지 일치,
    4억 5,600만 검산 통과. 형제 글에 없는 내용을 지어내지 않음
  - pos.db SQLite / lua script / Match ad.click / 타입 붙이기 본문 정리 전부 해소
  - 파이썬 두 블록 코드 변경 0, 출력 diff 0
Task 4: complete (commits 4d88736..a5c9735, review clean)
Task 4: 뒤 절에 넘길 것 — 형제 글 도입 11줄("노출됐다는 확인만 매체가 log-collector 로 따로
  보내고, 두 줄은 req_id 로 이어 붙는다")이 ad.impression.confirm 논지의 직접 근거인데
  이 글이 아직 인용 안 함. 7절이 인용하면 두 글이 정확히 맞물린다
Task 5: 구현자가 컨트롤러의 Avro 바이트 예시 오류를 잡음 — event 필드 통째 누락 + varint 첫
  바이트 오류(\xa6 -> \x0aclick\x96). 플랜·스펙 둘 다 수정 커밋함
Task 5: 리뷰 1회차 — 스펙 ✅ / Critical 3 · Important 1 · Minor 3
  파이썬 16줄 완전 일치(gzip 재현), SVG 규칙 전부 통과, 계약 논지 유지, 형제 글 11줄 인용 정확
  [Critical] 594·621줄 JSON 화면에 "event":"click" 누락 → 627줄 Avro 화면엔 \x0aclick 이 있어
    630줄의 "click 만 겨우 보인다" 비교가 어긋남. 같은 결함 3곳 중 1곳만 고쳐져 있었음
  [Critical] 841줄이 조건 셋 중 둘만 들고 "그래서 partition 5" 단정 → 5절 402줄이 막아 둔 추론
  [Critical] 799~803·853줄 브로커 디스크 30GB(6%) vs 형제 글 6절 161.2GB(32%). 차이는 한 줄
    바이트(200 B 가정 vs 36.6 B 실측). 853줄이 하필 그 절로 보내는데, 36.6 B 로 재면 30일도
    대당 126GB(25%)라 들어가서 형제 글의 "30일은 안 들어간다" 근거가 무너진 채 링크만 걸림
  [Important] 694줄 파이썬 주석이 유입을 ad.impression 이라 부름 → ad.impression.confirm 이어야
  [Important] 640줄 Avro 명세 범위를 "순서까지"로 좁게 씀 → 바로 아래 varint 구현과 어긋남
Task 5: minor (deferred): 614줄 CREATE_TIME 표기(설정 값은 CreateTime), 831줄 "들고 있는다"
Task 5: 뒤 절에 넘길 것 — 스키마 번호 17, partition 5 / offset 8412, headers 2개,
  marker id 접두사는 lh8-·lh9- 로. 7절은 시간을 쌓는 홉이 아니라 브로커에 놓인 상태를 보는 절이라
  9절이 홉으로 더하면 4절의 1,112 ms 와 어긋남
Task 5: fix round 1/5 진행 중
Task 5: fix round 1/5 (5 addressed, 0 open; commits 995da14..754e0d3)
  event 삽입 2곳(정렬 유지 확인), partitioner 셋째 조건 명시, 보존 근거 정리(형제 글 743줄
  인용 문자열 완전 일치, 161.2GB 독립 재계산 일치, 깎아내림 없음), 주석 topic 이름, Avro 범위
  파이썬 출력 diff 0, 문장 80자 초과 0건, 비유 없음, hunk 전부 7절 안
Task 5: complete (commits a5c9735..754e0d3, review clean)
Task 6: 리뷰 1회차 — 스펙 ✅ / Critical 0 · Important 3 · Minor 4
  9절 표 아홉 칸 전부 앞 절 본문과 일치. 형제 글 762·772줄 참조 확인. SVG 전부 통과
  (막대 좌표가 바이트에 비례: 308=150px, 102=50, 79=38, 169=82, 36.6=18)
  구현자 이탈 3건(text 블록 / X 를 ad.impression 으로 못박기 / 원문자 풀어 쓰기) 전부 "맞다" 판정
  [Important] 969줄 시계 가르기가 ⑨(수개월)을 ⑦(7일)과 반대편에 넣음
  [Important] 971~976줄 표 시간 합 1,076 ms 인데 본문은 1,112 ms. producer→브로커 36 ms 가 표에 없음
  [Important] 869줄 "봉투째다" 가 비유 — 컨트롤러 브리프가 만든 실수. 규칙이 브리프보다 위
  [Important, Minor 에서 승격] 1075줄 "8절이 만든 X 쪽" — 8절 자신이 937줄에서 X 는 bidder 것이라 못박음
Task 6: minor (deferred): 957줄 ③ 크기 칸 "—"(3절은 169 B), 919줄이 6절 567줄과 겹침,
  967줄 닫는 문장이 4절 279줄과 글자까지 같음, 888줄 "꼬리표" vs 7절 600줄 "이름표"
Task 6: 확인 불가 — 375px 실렌더 안 함(좌표로 겹침 없음 계산). viewBox 510·12.5px 는
  이미 배포된 gateway-ingress-router(500)·kafka-log-pipeline(500·520)과 같은 조건
Task 6: fix round 1/5 진행 중
Task 6: fix round 1/5 (4 addressed, 0 open; commits ee12a68..1714dc8)
  시계 가르기(⑦+⑨), 36 ms 검산 성립(재리뷰어 직접 검산 1,076+36=1,112, SVG 라벨도 확인),
  봉투/꼬리표 grep 0건, X 쪽 → "조인한". 구현자가 꼬리표를 이름표로 안 묶은 판단도 "맞다" 판정
  (7절 이름표는 headers 한 칸, 8절은 여섯 칸이라 범위가 겹침)
  957줄 Minor 도 같이 닫음
Task 6: complete (commits 754e0d3..1714dc8, review clean)
=== 글 본문 완성: 1,078줄 86.1KB, 파이썬 3블록·SVG 2장·mermaid 1장 ===
Task 7: 데모 제작 완료 (bb5ee41) — demo-log-hops.html 573줄 + js/log-hops-demo.js 693줄
  브라우저 8항목 실제 확인, 네 테마 조합, 375px OK, 콘솔 0
Task 7: 리뷰 1회차 — 스펙 ❌ / Critical 1 · Important 1 · Minor 1
  값 6개·topic·누적 1,808 ms·배치 바이트 전부 검산 일치. 이탈 3건(#lh-reset, 라벨, ms:null) 다 맞음
  [Critical] 클릭 변환기 JSON 이 16필드 — os_ver 누락. 같은 화면 층 설명은 "17개로 늘고"
  [Critical, 승격] 노출 경로 변환기 JSON 에도 os·os_ver 누락
  [Important] 임베드 높이 실측 1,700~1,750px. 저장소 관행 520~620px 의 약 3배
    리뷰어 실측 압축안: lane-note -241 / queue -55 / scale -230 / track -40 = -565px → ~1,150px
    목표는 900px 이하. 컨트롤러가 지시함
컨트롤러 정정: 리뷰어가 "postMessage 수신부 없음" 이라 했으나 틀림.
  js/main.js:1831-1841 이 frame.style.height 를 실제 콘텐츠 높이로 덮어씀.
  즉 height 속성을 낮게 적어도 본문에서 자라남 → 압축이 유일한 해법
Task 7: fix round 1/5 진행 중
Task 7: fix round 1/5 (2 addressed, 1 open; commits bb5ee41..6a26e67)
  [ADDRESSED] 클릭·노출 변환기 JSON 둘 다 17필드, 이름·순서가 글 6절 파이썬 출력과 일치
  [NOT ADDRESSED] 임베드 높이 — 한 값이 아니라 재생 중 흔들린다는 것을 재리뷰어가 발견
    760px: 70표본 중 804~916px (21%가 900 초과) / 375px: 996~1,189px / 정지 시 898px
    원인: .lh-detail 내용 길이가 층마다 달라 선택이 옮겨 다니면 칸 높이가 변함
    js/main.js:1836 이 상한·디바운스 없이 즉시 반영 → 글 중간 iframe 이 재생 내내 위아래로 움직임
  [Low] js/log-hops-demo.js:365-366 드랍 안내 문구 축소가 is-embed 스코프가 아니라 전체 페이지에도 샘
Task 7: fix round 2/5 진행 중 — .lh-detail 고정 높이로 흔들림 제거 + 스코프 누수 수정
Task 7: fix round 2/5 (2 addressed, 1 new; commits 6a26e67..969e9b3)
  높이 흔들림 해소 — .lh-detail 임베드 고정, 넘치는 것은 .lh-shape 코드 블록 안에서만 스크롤
  (산문이 잘리면 문장이 끊긴 것처럼 보인다는 구현자 판단이 맞았음). 스코프 누수도 해소
  재리뷰 실측: 760px 80회 전부 889.69px / 375px 70회 전부 1,112.45px
  실제 본문 폭은 760 이 아니라 1020px (.post-content max-width 1100 - 패딩) → 그 폭에서 820px
  [새 Important] 임베드에서 #lh-loss 를 접었는데 앱 SDK 층엔 쌓임 배지가 없어(drawQueue 가
    collector·agent·transform 셋만 봄) 쌓이는 중인지 사라지는 중인지 구별 불가. 4절 주제가 유실
Task 7: fix round 3/5 (1 addressed, 0 open; commits 969e9b3..dbd6382)
  ※ 원 구현자 transcript 소실로 재개 불가 → 보고서를 기억으로 삼아 새 구현자 디스패치(opus, 동급)
  앱 SDK 층 이름 뒤에 `⚠ 버림 N건` 배지(.lh-lane.is-dropping + data-drop). 층 이름 칸에 nowrap
  으로 높이를 구조로 못 박음. 재리뷰 실측 760px·375px 각 34회 전부 같은 값, 12자리 넣어도 불변
  대비 6.42~6.85:1 (팔레트 2 x 테마 2), 점선 테두리 동반. 전체 페이지 무손상 확인
Task 7: minor (deferred): 375px 임베드에서 버림 건수가 7자리(1,234,567)면 배지 글자가 이름 칸
  150px 을 1.6px 넘쳐 끝 글자가 옆 칸에 가려 잘림. 높이는 안 변함. 760px 이상은 안 잘림.
  16배속+멈춤 유지 시 몇 분~수십 분 방치하면 닿는 범위. scrollWidth 검사로는 안 잡힘(overflow:visible)
Task 7: complete (commits 1714dc8..dbd6382, review clean)
Task 7: 다음 사람에게 — iframe height="890" (로드 전 폴백). embedKeep 넷만, embedHide 불필요.
  anchor 는 '.lh-controls'. 접히는 셀렉터에 #lh-loss·.lh-lane[data-hop="sdk"].is-dropping 포함
Task 8: 등록·임베드 완료 (47f4839) — demo-edu-content.js 엔트리 / demos.html 카드+로드맵 /
  7절 group 표 뒤에 iframe. 리뷰 1회차 스펙 ✅ / Important 1
  구현자 이탈 2건 다 맞음:
   - 체크박스 explain 을 라벨에 걸었음 (demo-edu.js:157 이 input 클릭을 걸러내 브리프대로면 안 울림)
   - 카드 문구 "9홉/다섯 층" → "여섯 층" (브리프의 두 값이 낡았던 것. 구현자가 스스로 잡음)
  재리뷰 실측: 데스크톱 63회 전부 890px, 375px 90회 전부 1,290px, 흔들림 0
  explain 숫자 3개(61.7시간·10.4분·2,665건) 4절 출력과 문자 그대로 일치
  [Important] 7절 857줄 링크가 "(가이드 투어 포함)" 인데 이 데모엔 tour 필드가 없음.
    20개 엔트리 중 tour 없는 것이 log-hops 하나뿐
Task 8: 사용자에게 보고할 것 — log-hops 는 20개 데모 중 유일하게 가이드 투어가 없다.
  투어 추가는 플랜 범위 밖이라 문구만 맞췄다. 원하면 별도 작업
Task 8: 본문 안 375px iframe 은 1,290px — 본문 여백 때문에 iframe 폭이 244px 로 좁아져서
  데모 담당자가 375px 로 직접 열어 잰 1,113px 보다 큼. 안 흔들리고 안 깨짐
Task 8: fix round 1/5 진행 중
Task 8: fix round 1/5 (1 addressed, 0 open; commits 47f4839..45d90e1)
  "(가이드 투어 포함)" 제거. diff 가 그 한 줄뿐, iframe 블록 규칙 셋 다 유지, 검증 통과
Task 8: complete (commits dbd6382..45d90e1, review clean)
컨트롤러 결정: Task 9 는 검증·색인 재생성·커밋까지만 하고 **push 는 하지 않는다.**
  플랜 Task 9 Step 6 에 push 가 있지만, 스킬 흐름은 전체 태스크 → 최종 whole-branch 리뷰 →
  finishing-a-development-branch 순이다. 공개 배포를 최종 리뷰 앞에 두지 않는다.
Task 9: complete (commits 45d90e1..a7da363, 8항목 전부 통과, 고친 것 없음)
  형제 글 숫자 대조 / 파이썬 3개 문자 그대로 일치 / 375px 가로 스크롤 없음 /
  테마 4조합 스크린샷 16장 / mermaid 다크 가독 / 검증 3종 / 80자 초과 0건 /
  데모 임베드 890px 고정(12회 샘플). search-index.json 재생성만 커밋. push 안 함
Task 9: 최종 리뷰로 넘길 판단 — world: 'both' 인데 worldPractical 없음.
  같은 분류 44/45편은 그 필드가 있고, 형제 글은 world:'na' 라 애초에 필요 없음.
  'na' 로 맞출지 'both' 유지하고 단락을 채울지는 콘텐츠 판단

=== 최종 whole-branch 리뷰 (902b6d9..a7da363) ===
미룬 지적 8건 triage 결과: 배포 전 수정 8건 / 나중에 해도 됨 6건
worldPractical 판정: (가) world 를 'na' 로 — engineering-foundations 5편 전부 'na',
  taxonomy 의 both 정의는 담장 안 vs 열린 RTB 대비를 요구하는데 이 글엔 그 대비가 없고
  [무대: …] 배지도 0개. main.js:337 이 worldPractical 을 "담장 안에서 일한다면 —" 으로 렌더함
새로 찾은 것 [Important]: 데모 임베드가 누적 1,808 ms 를 보여 주는데 아홉 줄 위 표는 2,012 ms.
  둘을 잇는 데모 설명 두 줄이 하필 임베드에서 숨는 셀렉터(li:nth-child 2,3,5)에 걸려 있었음
최종 fix wave (a7da363..0856627, 8건 일괄): 재리뷰 전부 ADDRESSED, 새 문제 없음, 배포 판정 OK
  974줄 셈을 "다섯"으로 정정 — 재리뷰어가 직접 세어 확인(도입 5·파이썬 7·대비표 3·데모 6·9절 9)
  파이썬 3블록 출력 문자 단위 MATCH, 80자 초과 0건, practical없음 플래그 사라짐, diff 는 두 파일뿐

parked (배포 후에 해도 되는 것) 6건 — 최종 리뷰가 "나중에 해도 됨" 으로 판정:
  1. 30·962줄 102 B 의 재는 기준을 밝히는 한 구절 (숫자·논지는 맞음. 8필드를 JSON 으로 쓴 값)
  2. 545줄 "끝까지 문자열로 남는 것" → 다음 문장이 "지운다" 라 어긋남. "숫자가 끝내 안 되는 것"
  3. 11·853줄 "Kafka에"·"Kafka를" 만 붙여 씀 (본문 산문은 "Kafka 가"·"Kafka 에" 로 띄어 씀)
  4. 6절 565~567 과 8절 924~926 이 겹침 (8절이 S3 경로 hour=16 설명에 필요해 되짚는 것)
  5. 279줄과 974줄이 같은 닫는 문장 (도입이 "9절로 바로 가라" 안내하니 되짚는 것은 맞음)
  6. 375px 임베드에서 버림 건수 7자리면 끝 글자 1.6px 잘림 (높이 불변, 760px 이상은 안 잘림)

저장소 이슈 (이 플랜 범위 밖, 사용자 판단 사항) 2건:
  A. scripts/check-content-standard.js 장문 검사가 두 군데서 샘 —
     69줄이 인라인 코드 스팬을 '…' 한 글자로 접고, 63줄 줄 필터가 67줄의 `**` 제거보다 먼저 돌아
     `**굵게**` 로 시작하는 산문 줄을 통째로 뺀다. 두 리뷰어가 독립 재현. 40편 전체가 이 방식으로
     측정돼 왔다. 고치면 기존 글에서 새 경고가 쏟아질 수 있다
  B. log-hops 는 demo-edu-content.js 20개 엔트리 중 유일하게 tour 필드가 없다.
     링크 문구는 사실에 맞게 고쳤으나 투어 자체는 안 만들었다(플랜 범위 밖)

=== 상태: push 대기 (커밋 0856627 까지 로컬) ===
