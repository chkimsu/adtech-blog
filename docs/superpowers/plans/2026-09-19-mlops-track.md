# 모델 운영 트랙 — 실행 계획

설계는 `docs/superpowers/specs/2026-09-19-mlops-track-design.md`. 숫자와 카드 목록은 거기가 정본이고 여기 옮겨 적지 않는다.

## 나누기 — 일곱 갈래가 동시에, 공용 파일은 한 사람이 마지막에

| 갈래 | 만드는 것 | 손대는 글 |
|---|---|---|
| A | 글 1(학습 파이프라인), 글 2(모델 버전) + 데크 `pipeline-cards`, `version-cards` | 새 글만 |
| B | 글 3(Docker 와 CI), 글 4(추론 서버) + 데크 `ci-cards`, `inference-cards` | 새 글만 |
| C | 글 5(배포와 롤백) + 데크 `deploy-cards` + 놀이터 `canary` | 새 글만 |
| D | 글 6(스트림 집계) + 데크 `window-cards` + 놀이터 `window` | 새 글만 |
| E | 글 7(배치 추론), 글 8(분산 학습) + 데크 `batch-infer-cards`, `distributed-cards` + 놀이터 `serving-cost` | 새 글만 |
| F | 데크 `ops-cards` 여섯 장 + 그 카드를 넣을 기존 글 다섯 편 | serving-latency-throughput, model-monitoring, feature-store-serving, online-learning-delayed-feedback, kubernetes-networking |
| G | 데크 `data-model-cards` 여덟 장 + 그 카드를 넣을 기존 글 일곱 편 + 있는 카드 가져다 넣기 일곱 편 | ad-log-system, data-distribution-layer, ctr-feature-engineering, deep-ctr-models, two-tower-retrieval, lookalike-modeling, audience-segmentation, ad-serving-flow, walled-garden, pCVR-modeling, kakao-ads-prediction-targeting, interview-system-design |

**갈래가 손대지 않는 공용 파일** — `js/posts.js`, `js/demo-edu-content.js`, `demos.html`, `data/taxonomy.json`, `css/style.css`, `js/card-kit.js`, `index.html`, `js/topics.js`, `js/glossary.js`. 갈래는 대신 세션 scratchpad 의 `integration/<갈래>.md` 에 붙일 조각(posts.js 엔트리, demo-edu-content 엔트리, demos.html 카드 조각, 용어 제안)을 적어 둔다. 통합은 마지막에 한 사람이 한다.

**갈래가 하는 검증** — 만든 글은 `node scripts/check-content-standard.js <id>` 를 통과할 수 있게 쓴다(엔트리가 없어 도구가 못 돌면 산문 길이 18KB 이상, 절마다 300자 이상, 80자 넘는 문장 0개를 직접 센다). 파이썬은 실행해 출력을 붙인다. 데크와 놀이터는 로컬 서버(캐시 끔, charset 실음, 갈래마다 다른 포트 8801~8807)로 띄워 헤드리스 크롬으로 찍어 겹침을 고친다. 글 안 임베드도 1440 폭으로 한 번 찍는다.

## 순서

1. 설계와 계획 커밋
2. 일곱 갈래 동시 진행
3. 통합 — 공용 파일 9개, 검색 색인, 표지 편수 대조
4. 검증 스크립트 전부, 데크 스크린샷 재확인
5. `chkimsu` 계정으로 커밋, fetch 와 merge 뒤 push
