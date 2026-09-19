# 모델 운영 트랙 8편, 카드 데크 10장, 놀이터 3장 — 설계

작성 2026-09-19. 사용자 승인 *"응 모두 진행해줘"* (제안서의 새 글 8편, 형식 추천안, 새 트랙, 시각자료 전부).

---

## 1. 왜 만드나

ML 인프라 쪽 글 23편은 「모델을 만드는 일」을 다루고 「만든 모델을 매일 굴리는 일」이 비어 있었습니다. 학습 파이프라인 운영은 Airflow 언급이 3편, 백필 1편, 멱등 2편뿐이고, 배포는 서빙 글의 한 절, 모델 버전과 재현은 0편, 스트림 창과 워터마크는 한 줄씩, 추론 서버와 모델 포맷 1편, 분산 학습 1편, 컨테이너와 CI 는 사실상 0편이었습니다. 카드나 데모가 하나도 없는 글이 25편이었고 그중 절반이 ML 인프라 글이었습니다.

## 2. 확정된 결정

| 무엇 | 어떻게 |
|---|---|
| 새 글 | 8편. 새 트랙 `mlops-track` 「모델 운영 트랙」으로 묶고, `topics.js` 의 트랙 순서에서 ML 인프라 트랙 바로 뒤. `mlTrack` 에 5단계 「운영」을 새로 만들어 8편을 넣는다 |
| 형식 | 타겟팅 기초 4편과 같다. 존댓말, 절마다 카드 한 장(iframe), 계산은 표 위에 가정 한 줄과 계산식 한 줄. 여기에 **실행 검증한 짧은 파이썬 1~2개**(본체 45줄 이하, 표준 라이브러리, `# 출력:` 붙임)를 더한다. `NO_PYTHON_BY_DESIGN` 에 넣지 않는다 |
| 이야기 | 엔지니어링 기초 트랙의 **지훈 씨**가 입사 석 달째에 모델 팀으로 옮겨 여덟 주를 겪는다. 시간은 앞으로만 간다 |
| 무대 | `world: 'both'`. 글마다 끝에서 두 번째 절이 「담장 안 / 열린 RTB」 두 갈래(### 소제목에 배지). `worldNote`, `worldPractical` 을 채운다 |
| 카드 | 새 글 8편에 데크 8장(카드 33장). 기존 글에 데크 2장(카드 14장). 있는 카드 가져다 넣기 7편. 부품은 `js/card-kit.js` 그대로, CSS 는 `css/style.css` 「카드 데모 공용 부품」 블록 그대로(새 CSS 없음) |
| 놀이터 | 인터랙티브 데모 3장 — 카나리, 창 집계, 서빙 비용 계산기. 형식은 `demo-frequency-capping.html` 을 따른다(Chart.js, 슬라이더, 지표 카드, 판정 한 줄, 해설 패널) |
| 데모 목록 | `demos.html` 에 주제 「모델 운영」 절을 새로 만들어 13장을 넣고, 바로가기 줄과 난이도 로드맵의 개수를 고친다 |
| 분류 | 카테고리 `ML Infrastructure`(컨테이너와 CI 는 `Software Engineering` 도). 태그에 `MLOps` 를 새로 더한다(`data/taxonomy.json`). 8편 모두 `MLOps`, `ML Infra`, `입문` 을 갖는다 |
| 낱말 | 가운뎃점 없음(쉼표). 비유 없음. 실측, 실체, 축, 가른다, 갈린다 없음. 이모지 없음. 제목은 「주제어: 무엇을 알게 되나」 55자 이하 |

## 3. 여덟 편 — 순서, 제목, 지훈 씨의 자리

| 순서 | id | 제목 | 지훈 씨가 있는 자리 | 데크 |
|---|---|---|---|---|
| 1 | `training-pipeline-dag` | 학습 파이프라인: 새벽 4시에 모델이 다시 만들어지는 길 | 옮긴 첫 주 월요일 05:12 알람 「pctr_daily 실패」 | `demo-pipeline-cards.html` 5장 |
| 2 | `model-versioning-reproducibility` | 모델 버전과 재현: 지난주 모델을 오늘 똑같이 다시 만들 수 있나 | 둘째 주. 팀장 「9월 3일 모델이 제일 좋았는데 다시 만들어 볼 수 있어요?」 | `demo-version-cards.html` 4장 |
| 3 | `container-ci-pipeline` | Docker 와 CI: 고친 코드가 서버에 오르기까지의 검문 세 곳 | 셋째 주. 피처 하나 더한 코드를 올린다 | `demo-ci-cards.html` 4장 |
| 4 | `inference-server` | 추론 서버: 학습한 모델 파일이 요청에 답하기까지 | 넷째 주. 첫 배포를 앞두고 서버가 모델을 어떻게 싣나 본다 | `demo-inference-cards.html` 4장 |
| 5 | `model-deployment-rollback` | 모델 배포와 롤백: 1% 로 시작해 15분 안에 되돌리는 순서 | 다섯째 주. 첫 배포. 10% 단계에서 게이트 탈락, 14분 만에 되돌림 | `demo-deploy-cards.html` 5장 + `demo-canary.html` |
| 6 | `stream-window-aggregation` | 스트림 집계: 최근 1시간 클릭 수는 누가 어떻게 세나 | 여섯째 주. 실시간 피처 「광고별 최근 1시간 클릭 수」 요청 | `demo-window-cards.html` 4장 + `demo-window.html` |
| 7 | `batch-vs-realtime-inference` | 배치 추론과 실시간 추론: 무엇을 미리 계산해 두나 | 일곱째 주. 유저 벡터 1,400만 명을 새벽에 미리 | `demo-batch-infer-cards.html` 3장 + `demo-serving-cost.html` |
| 8 | `distributed-training` | 분산 학습: 임베딩이 큰 광고 모델은 왜 다르게 나누나 | 여덟째 주. 학습 6시간 20분을 GPU 넷으로 | `demo-distributed-cards.html` 4장 |

날짜는 트랙 순서대로 2026-09-25 부터 하루씩(10-02 까지).

## 4. 표준 데이터 한 벌 — 여덟 편이 같은 값을 쓴다

기존 글에서 물려받은 값은 출처를 적었다. 새로 정한 값은 전부 가상 값이고 글마다 그렇게 밝힌다.

| 값 | 얼마 | 출처 |
|---|---|---|
| 하루 노출, 클릭 | 노출 2억 2,800만(초당 2,639), 클릭 228만(초당 26.4) | 엔지니어링 트랙 |
| 학습 행 | 비클릭을 1/10 로 줄여 **하루 2,485만 행**(비클릭 2,257만 + 클릭 228만). 학습 창 30일 = 7억 4,550만 행 | 새로(negative-sampling 의 1/10) |
| 모델 | pCTR 모델. 운영 중 **v417**(9월 8일 학습), 새 모델 **v418**(9월 15일). 팀장이 찾는 좋은 모델 **v412**(9월 3일, COPC 0.98) | 새로 |
| 모델 파일 | 신경망 가중치 38MB(ONNX 로 바꿔 서버에 싣는다). 임베딩 표 27.7GB 는 임베딩 서비스에 따로 | embedding-table-ops(27.7GB) |
| 서빙 | API 서버 예산 12ms, 모델 호출 예산 8ms. 모델 서버 **12대**. 8ms 초과율 평소 4.62%. 새 서버가 뜬 뒤 30초간 2.5배 느림 | serving-latency-throughput |
| 후보 | 요청 하나에 후보 800건을 한 번에 보낸다 | ad-serving-flow |
| DAG `pctr_daily` | 04:00 시작. ① 로그 도착 확인 3분 ② 라벨 붙이기 25분 ③ 피처 만들기 38분 ④ 학습 55분 ⑤ 평가 게이트 7분 ⑥ 등록 1분 ⑦ 배포 요청. **06:09 완료** | 새로 |
| 실패 장면 | ③ 이 05:12 에 실패. 원인은 광고 메타 표 스냅샷이 아직 안 만들어짐(다른 팀 DAG 지연). 05:40 에 ③ 부터 재실행, 07:20 완료 | 새로 |
| 백필 | ②③ 만 다시(한 날 63분). 30일 직렬 31시간 30분, **6개 동시 5시간 15분** | 새로 |
| 멱등 | 출력 파티션 `dt=2026-09-15` 를 덮어쓴다. 덧붙이면 재실행 때 4,970만 행(2배) | 새로 |
| 평가 게이트 | AUC 가 어제보다 0.002 넘게 떨어지지 않을 것, COPC 0.95~1.05 | 새로 |
| 재현 재료 넷 | 코드 해시 `a3f9c21`, 데이터 스냅샷(파티션 목록 `dt=2026-08-04 … 2026-09-02`), 설정(`lr=0.002, dim=32, epochs=1, seed=417`), 환경(학습 이미지 `pctr-train:1.14`) | 새로 |
| 재현 실패 원인 | 8월 20일 파티션이 9월 5일 백필로 다시 써짐(「최근 30일」이라 적으면 다른 데이터), 라이브러리 2.3 → 2.4, 시드 없음 | 새로 |
| 레지스트리 | v412 AUC 0.8119 COPC 0.98 폐기, v417 AUC 0.8123 COPC 0.99 운영, v418 AUC 0.8131 COPC 1.06 후보 | 새로 |
| 이미지 | 학습 이미지 4.6GB(GPU 라이브러리 포함), 추론 이미지 1.1GB. CI 빌드 6분 20초. 태그 `pctr-serve:2026.09.17-a3f9c21` | 새로 |
| 검문 셋 | 유닛 테스트 214개 48초, 계약 테스트(요청 응답 스키마 12개, 1,000건 부하에서 8ms 초과율 6% 이하), 이미지 검사(심각 취약점 0, 1.5GB 이하) | 새로 |
| 서버가 뜨는 순서 | 이미지 시작 12초, 모델 내려받기 6초, 적재 3초, 웜업 200건 20초, **준비 신호 41초** | 새로 |
| 배치 추론 | 후보 800건을 한 텐서로 한 번에 3.0ms. 하나씩 800번이면 96ms | 새로 |
| 카나리 | 게이트웨이 가중치 1%(5분) → 10%(30분) → 50%(30분) → 100%. 새 버전은 파드 2대를 더 띄운다 | 새로 |
| 게이트 넷 | 8ms 초과율 6% 이하, 오류율 0.1% 이하, COPC 0.95~1.05(10% 단계부터, 클릭 4,750건이 모여야), 클릭률 차이 -2% 이상 | 새로 |
| 롤백 장면 | 06:31 10% 시작 → 07:01 평가 → COPC 1.09 → 07:04 알람 → 07:09 판단 → 07:10 가중치 0% → 07:11 트래픽 복귀 → 07:18 파드 내리고 확인. **알람부터 14분** | 새로 |
| 섀도 | 요청을 복사해 새 모델도 계산하되 응답에는 안 쓴다. 로그에 예측값 둘. 모델 서버 비용 2배 | 새로 |
| 클릭 도착 지연 | 노출 뒤 5초 안 95%, 2분 안 99.9%, 2분 넘음 0.1%(하루 2,280건), 그중 30분 넘음 0.02%(456건) | 새로 |
| 스트림 잡 | `ad_click_1h`. 입력 topic `ad.click`(partition 12, key `req_id`). 슬라이딩 60분 창을 1분마다. 워터마크 2분 | 엔지니어링 트랙(topic) |
| 스트림 결과 | 광고 9931 의 14:00~15:00 클릭: 스트림 1,203, 배치 1,204. 하루 전체 차이 2,280건(0.1%). Redis 키 `ad:9931:clk_1h`, TTL 2분 | 새로 |
| 유저 벡터 | 64차원 × 1,400만 명 × 4B = 3.58GB. 새벽 배치 워커 8개 25분. 활성 유저(오늘 로그인) 12% = 168만 명이 요청의 80% | two-tower(64차원), 타겟팅 트랙(1,400만) |
| 서빙 비용(가상) | CPU 서버 시간당 480원, 한 대 287 QPS. GPU 서버 시간당 3,800원, 한 대 2,300 QPS. 12대 CPU 한 달 4,147,200원. GPU 는 3대(예비 1) 8,208,000원 | 새로 |
| 분산 학습 | GPU 1장 6시간 20분(초당 32,700행). 4장 1시간 50분(효율 86%), 8장 1시간 5분(효율 73%). 임베딩은 Adam 이면 83.2GB 라 GPU 80GB 한 장에 안 들어가 파라미터 서버 2대 | embedding-table-ops(83.2GB, 샤드 2대) |

## 5. 카드 목록

색 범례는 데크마다 페이지 위에 한 줄. 기본은 학습 데이터 카드와 같다 — 파랑 놓여 있는 데이터(표, 파일, 목록), 벽돌색 지금 오는 것(요청, 클릭, 알람), 먹색 모델과 서버, 회색 만드는 작업(학습, 빌드, 집계), 점선 적어 둔 것(설정, 게이트 조건). 데크가 색에 다른 뜻을 주면 그 페이지 범례가 이긴다.

### 5-1. 새 글의 데크 8장 (카드 33장)

| 데크 | 파일 | 카드 key 와 내용 |
|---|---|---|
| 학습 파이프라인 카드 다섯 장 | `demo-pipeline-cards.html`, `js/pipeline-cards-demo.js`, 접두어 `pl-` | `dag` 일곱 칸이 04:00 부터 06:09 까지 순서로 / `sensor` 파티션 24개 중 23개 도착, 하나를 기다림 / `rerun` ③ 만 붉게, ①② 는 그대로, ③~⑦ 재실행 / `backfill` 30칸 격자, 6개 동시, 5시간 15분 / `idempotent` 덮어쓰기와 덧붙이기, 2,485만 대 4,970만 |
| 모델 버전 카드 네 장 | `demo-version-cards.html`, `js/version-cards-demo.js`, `vr-` | `recipe` 재료 넷(코드, 데이터, 설정, 환경)이 학습으로 모여 모델 하나 / `registry` 레지스트리 표(v412, v417, v418, 상태) / `lineage` 데이터 → 학습 실행 → 모델 → 배포 사슬 / `diff` 9월 3일 모델과 오늘 재현본이 다른 자리 셋 |
| Docker 와 CI 카드 네 장 | `demo-ci-cards.html`, `js/ci-cards-demo.js`, `ci-` | `image` 이미지 한 장의 층(OS, 파이썬, 라이브러리, 코드), 모델 파일은 밖 / `gates` 검문 셋 / `pipeline` 커밋 → CI 빌드 → 이미지 저장소 → 배포 요청 / `envdrift` 노트북 2.3 과 서버 2.4 가 다른 예측값 |
| 추론 서버 카드 네 장 | `demo-inference-cards.html`, `js/inference-cards-demo.js`, `in-` | `format` 학습 파일 → ONNX 변환, 크기와 로드 시간 / `load` 서버가 뜨는 41초 / `batch` 후보 800건 한 번에 3.0ms 대 하나씩 96ms / `twoversions` 두 버전 동시 적재, 전환은 가리키는 곳 바꾸기 |
| 배포 카드 다섯 장 | `demo-deploy-cards.html`, `js/deploy-cards-demo.js`, `dp-` | `shadow` 요청 복사, 응답은 옛 모델 / `canary` 1 → 10 → 50 → 100 과 단계 시간 / `gates` 게이트 넷 통과 탈락 / `rollback` 07:04 부터 07:18 까지 시간선 / `warmup` 웜업 없이 30초 2.5배 |
| 스트림 집계 카드 네 장 | `demo-window-cards.html`, `js/window-cards-demo.js`, `wd-` | `windows` 텀블링과 슬라이딩 / `watermark` 이벤트 시각과 도착 시각, 2분 뒤 창 닫힘 / `late` 30분 뒤 온 클릭은 닫힌 창 / `batchvs` 스트림 1,203 배치 1,204 |
| 배치 추론 카드 세 장 | `demo-batch-infer-cards.html`, `js/batch-infer-cards-demo.js`, `bi-` | `precompute` 1,400만 명 벡터를 새벽에, 서빙은 조회만 / `cache` 활성 12% 가 요청 80% / `cost` QPS → 대수 → 월 비용 |
| 분산 학습 카드 네 장 | `demo-distributed-cards.html`, `js/distributed-cards-demo.js`, `dt-` | `dataparallel` 같은 모델 넷, 데이터 사등분, 기울기 합침 / `embshard` 임베딩만 파라미터 서버 2대로 / `sync` 동기와 비동기 / `speedup` 1, 4, 8장의 시간과 효율 |

### 5-2. 기존 글의 데크 2장 (카드 14장) — 숫자는 그 글의 값을 그대로

| 데크 | 파일 | 카드 key, 어느 글의 어느 절 |
|---|---|---|
| 서빙과 감시 카드 여섯 장 | `demo-ops-cards.html`, `js/ops-cards-demo.js`, `op-` | `fourplaces` 서빙 지연 4절(네 자리, 3.72% → 19.42%) / `retry` 서빙 지연 7절(2,750 과 2,800 QPS 의 절벽) / `fourlayers` 모델 모니터링 2절(네 층) / `threefeeds` 피처 스토어 1~2절(세 갈래가 한 벡터로) / `onlineloop` 온라인 학습 5절(층층이 쌓기) / `k8spath` 쿠버네티스 네트워킹(Pod, Service, Ingress 를 지나는 요청) |
| 데이터와 모델 카드 여덟 장 | `demo-data-model-cards.html`, `js/data-model-cards-demo.js`, `dm-` | `logjoin` 광고 로그 시스템 4절(조인을 언제 돌리나) / `rank1` 같은 글 6절 / `fanout` 데이터 유통 층 1~2절(목적지 여섯, 곱셈이 덧셈) / `aggwindow` CTR 피처 엔지니어링 6절(창과 라벨 시각) / `din` Deep CTR 4절(후보에 따라 이력 가중치) / `ann` Two-Tower 4-3(전수 대 근사) / `centroid` Lookalike 심화 3-2(중심점에서 검색) / `rtsegment` 세그멘테이션 심화 5절(실시간 할당) |

### 5-3. 있는 카드 가져다 넣기 (그리기 없음)

| 글 | 절 | 카드 |
|---|---|---|
| `ad-serving-flow` | 3. 필터링 | `demo-targeting-cards.html?card=funnel` |
| `walled-garden` | 2. ① 데이터 통합 | `demo-targeting-cards.html?card=signal` |
| `pCVR-modeling` | 2. 중복 제거, 3. 지연 전환 | `demo-training-cards.html?card=convdef`, `?card=delay` |
| `lookalike-modeling` | 6. 확장 비율 | `demo-targeting-cards.html?card=lookalike` |
| `audience-segmentation` | 3. Rule-Based | `demo-targeting-cards.html?card=segment` |
| `kakao-ads-prediction-targeting` | 맞춤타겟, 유사타겟 절 | `demo-targeting-cards.html?card=custom`, `?card=lookalike` |
| `interview-system-design` | 4. 피처, 5. 불일치 | `demo-serving-cards.html?card=batch`, `?card=skew` |

## 6. 놀이터 3장

| 파일 | 조작 | 보여 주는 것 |
|---|---|---|
| `demo-canary.html`, `js/canary-demo.js` | 트래픽 비율(1, 10, 50, 100), 새 모델의 8ms 초과율, 오류율, COPC, 클릭률 차이 슬라이더 | 게이트 넷의 통과 탈락, 자동 되돌림 판정, 단계별 시간선 그림. 표준 값이 기본값 |
| `demo-window.html`, `js/window-demo.js` | 워터마크(0~10분), 창 종류(텀블링, 슬라이딩), 늦게 오는 비율 | 창마다 센 값과 진짜 값의 차이, 버려진 클릭 수, 시간선 위 이벤트 점 |
| `demo-serving-cost.html`, `js/serving-cost-demo.js` | QPS, 부하율 상한, CPU 와 GPU 한 대 처리량과 시간당 값 | 필요 대수, 월 비용, CPU 와 GPU 가 뒤집히는 QPS |

## 7. 통합 자리 (한 사람이 마지막에)

`data/taxonomy.json`(태그 `MLOps`), `js/posts.js`(엔트리 8, `series['mlops-track']`, `mlTrack` 5단계), `js/topics.js`(`TRACK_ORDER`), `js/demo-edu-content.js`(엔트리 13), `demos.html`(주제 절, 바로가기 줄, 로드맵 개수 45 → 58), `index.html`(표지 편수), `js/glossary.js`(용어 몇 개), `search-index.json` 재생성.

## 8. 검증

`node scripts/validate-posts.js`, `node scripts/check-content-standard.js <8편>`, `node scripts/test-long-sentences.js`, `node scripts/check-design.js`, 코스 검사 셋, `node scripts/build-search-index.js`. 파이썬 블록은 전부 실행해 출력과 본문 숫자를 맞춘다. 금지 낱말과 가운뎃점을 grep 으로 센다. 데크 10장과 놀이터 3장은 브라우저로 열어 스크린샷으로 겹침을 본다. 글 안 임베드는 1440 폭에서 본다.
