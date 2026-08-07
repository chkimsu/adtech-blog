# 개발 인프라 글 2편 설계 — 게이트웨이 경로 · Kafka

작성일: 2026-08-07

## 무엇을 만드나

새 글 2편을 추가한다. 둘 다 그림이 주인공인 글이다.

| # | slug | 제목 | 주제 |
|---|---|---|---|
| 1 | `gateway-ingress-router` | 광고 요청 하나가 서비스까지 가는 길 — LB · Ingress · API Gateway · 라우터 | 요청이 바깥에서 서비스 코드까지 도달하는 경로의 부품들 |
| 2 | `kafka-log-pipeline` | Kafka는 왜 있나 — 노출 로그 한 줄이 학습 데이터가 되기까지 | 로그 수집·전달의 구조와 그것이 학습 데이터가 되는 과정 |

데모 2개(`demo-request-path.html`, `demo-kafka-partition.html`)를 새로 만들어 본문에 임베드한다.

## 왜 이 두 편인가 — 지금 블로그에 있는 것

| 요청 주제 | 현재 상태 |
|---|---|
| Ingress | `kubernetes-networking.md`(30KB)에 있음. Pod·Service·Ingress를 인라인 SVG 2장 + 파이썬 계산 2개로 |
| 마이크로서비스 | `software-architecture-patterns.md`(50KB) 4절에 있음. 인라인 SVG 1장 |
| API Gateway | 위 글에 한 문단뿐 — 한 줄 설명 + SVG 안 상자 하나 |
| Router | 없음 |
| Kafka | 전용 글 없음. `ad-log-pipeline`·`ad-log-system`·`feature-store-serving` 등 5편에서 이름만 스침 |
| producer · topic · partition · offset | 없음 |

Kafka는 통째로 빈칸이고, 게이트웨이 계열은 Ingress만 차 있다.

## 확정된 결정 (2026-08-07 사용자 선택)

| 항목 | 결정 | 무엇을 뜻하나 |
|---|---|---|
| 기존 글과의 관계 | **독립적으로 다시 쓴다** | 새 글 하나만 읽어도 이해되게 쓴다. 기존 글과 30%쯤 겹치는 것을 받아들인다. 끝에 "더 깊이는 저 글로" 링크만 단다 |
| 예제 소재 | **광고 서빙** | 쇼핑몰 예제가 아니라 `POST /v1/bid`·`ad.impression` 으로 끝까지 간다. `ad-log-pipeline`·`feature-store-serving`과 한 줄로 이어진다 |
| 글 1 뼈대 | **서비스가 늘면서 하나씩 생긴다** | 서버 1대에서 시작해 절마다 칸이 하나씩 는다. "왜 있는지"에 직접 답한다 |
| 글 2 뼈대 | **로그 한 줄을 끝까지 따라간다** | 노출 발생 → producer → partition → consumer → offset → 학습 데이터 |
| 도식 방식 | **인라인 SVG + mermaid 둘 다** | SVG는 지도·성장 그림, mermaid는 시간 순서·분기 |
| mermaid 팔레트 | **블로그 색으로 바꾼다 (전역)** | `theme:'neutral'` → `theme:'base'` + 크림·잉크·벽돌. **기존 26편의 mermaid 그림이 전부 같이 바뀐다.** 사용자가 이 영향을 알고 승인함 |
| 문체 | **비유 없이 실제 설정·값으로** | CLAUDE.md의 "비유 사용 금지"를 따른다. 성문·집·길 같은 표현을 쓰지 않고 규칙표·JSON·설정 파일을 직접 보인다 |
| 데모 | **두 글에 1개씩** | 정적 그림으로 안 잡히는 감각만 데모로 |

### 문체 결정의 배경 (다시 논의하지 말 것)

블로그 가이드(`MARKDOWN_GUIDE.md`, 2026-08-02)는 "모든 절이 일상 비유 → 구체 숫자 순서"라고 적혀 있고 기존 39편이 그렇게 쓰였다(Pod=집, Ingress=성문, 마이크로서비스=푸드코트). 사용자 CLAUDE.md(2026-08-05)는 "비유 사용 금지, 실제 값·이름·표로 구체화"다. 두 문서가 반대다.

**사용자가 새 글 2편은 비유 없이 쓰기로 확정했다.** 기존 39편과 톤이 튀는 것을 받아들인다. 인프라 주제는 보여줄 실물(Ingress 규칙표, Kafka JSON 한 줄, 설정 파일)이 있어서 비유 없이도 구체적으로 쓸 수 있다는 것이 근거다.

기존 39편을 소급해 고치지 않는다. `MARKDOWN_GUIDE.md`의 해당 문장은 이 작업 끝에 "새 글은 비유 없이"로 갱신한다.

## 글 1 — `gateway-ingress-router`

### 메타데이터

```
id:         'gateway-ingress-router'
title:      '광고 요청 하나가 서비스까지 가는 길 — LB · Ingress · API Gateway · 라우터'
categories: ['Software Engineering']
tags:       ['Microservices', 'Networking', 'System Design']
world:      'na'
series:     'engineering-foundations'   (4번째)
```

`world: 'na'` 인 이유: 열린 RTB냐 담장 안이냐로 갈리는 주제가 아니다. 기존 SE 글 2편과 같다. 광고를 예제로 쓸 뿐 기법 자체는 경매 위치와 무관하다.

### 절 구성

도입은 개념어 없이 시작한다 — bidder 한 대가 매체 한 곳의 요청을 받고 있는 장면.

> 한 줄 요약: LB·Ingress·API Gateway·라우터는 한꺼번에 설계된 것이 아니다. 서비스가 늘 때마다 생긴 문제에 하나씩 답한 결과다.

절이 8개이므로 `> 골라 읽는 법` 안내 블록을 요약 바로 뒤에 붙인다.

| 절 | 무엇이 터지나 | 무엇이 생기나 | 실물로 보이는 것 |
|---|---|---|---|
| 1 | bidder 1대. 매체가 `10.0.3.14:8080`을 직접 부른다 | — | 배포 중 요청 실패. 가용성 숫자 |
| 2 | 3대로 늘렸다. 매체가 IP 3개를 다 알아야 하나 | **LB** | 대상 그룹 설정, 헬스체크 5초·연속 2회 실패 시 제외. L4는 IP·포트만 본다 |
| 3 | bidder·pctr·feature-store·log-collector로 쪼갬 | **Ingress** | Ingress 규칙 YAML 몇 줄. 위에서부터 매칭, 없으면 404 |
| 4 | 매체가 10곳. 인증키·초당 제한·v1/v2 분기가 필요 | **API Gateway** | 매체별 쿼터 표, Gateway route + 정책 설정 |
| 5 | 서비스 12개. "밖에서 안으로"가 아니라 "안에서 안으로"가 문제 | **서비스 메시** | 사이드카 지연이 12ms 예산을 얼마나 먹나 |
| 6 | — | 완성된 지도 한 장 | 다섯 부품 정리표 |
| 7 | — | 헷갈리기 쉬운 점 | — |
| 8 | — | 더 깊이 보기 (링크) | — |

3절 안에 **"라우터라는 말의 세 용법"** 을 넣는다. 이 말이 문맥마다 다른 것을 가리켜서 사용자가 혼란을 겪는 지점이다.

| 어디서 쓰는 말인가 | 무엇을 가리키나 |
|---|---|
| 쿠버네티스 | Ingress Controller(nginx 등). 규칙표를 실제로 실행하는 프로세스 |
| OpenShift | `Route` 오브젝트. Ingress에 해당하는 자체 리소스 |
| 앱 코드 안 | 프레임워크의 URL 라우터. `@app.route("/v1/bid")` |

7절 "헷갈리기 쉬운 점"에 넣을 것:

- "Ingress랑 API Gateway랑 같은 것 아닌가" — 둘 다 L7 경로를 본다는 점이 같다. 다른 것은 정책(인증·쿼터·변환)을 갖느냐다. Gateway API로 둘을 합치는 흐름도 짧게
- "LB가 있으면 Ingress는 필요 없나" — Ingress도 결국 LB 하나를 앞에 둔다. 대체가 아니라 그 뒤에 붙는 것
- "Gateway를 넣으면 느려지지 않나" — 넣는 대가를 숫자로. 12ms 예산에서 Gateway가 1.1ms를 먹는다면 남는 것이 얼마인지

### 파이썬 블록 2개 (둘 다 실제 실행 후 `# 출력:` 부착)

| # | 절 | 무엇을 계산하나 |
|---|---|---|
| ① | 4절 | 인증·쿼터를 서비스마다 각각 구현할 때 vs Gateway에 한 번 구현할 때 — 코드 벌수, 정책 1회 변경 시 배포 횟수, 구현 불일치가 생길 확률, 사고 시 영향 범위 |
| ② | 5절 | 서비스 수가 늘 때 호출 짝 수, 그리고 사이드카 왕복 지연이 12ms 입찰 예산을 얼마나 먹는지. 언제부터 메시가 손해를 넘어서는지 |

②는 `software-architecture-patterns`의 "서비스 20개면 짝이 190개" 계산과 이어지되, **12ms 예산**이라는 광고 특유의 제약을 얹어 결론이 달라지는 지점을 만든다. 그냥 반복하지 않는다.

가데이터 표 최소 2개: 3절(서비스 4개를 바깥에 노출하는 두 방법 비교), 4절(매체 10곳의 인증·쿼터 정책).

## 글 2 — `kafka-log-pipeline`

### 메타데이터

```
id:         'kafka-log-pipeline'
title:      'Kafka는 왜 있나 — 노출 로그 한 줄이 학습 데이터가 되기까지'
categories: ['Software Engineering', 'ML Infrastructure']
tags:       ['Event-Driven', 'System Design', 'ML Infra', 'Kafka']
world:      'na'
series:     'engineering-foundations'   (5번째)
```

`Kafka` 태그는 `data/taxonomy.json`에 없다. **먼저 taxonomy에 추가한 뒤** posts.js에 쓴다. 순서를 지키지 않으면 `validate-posts.js`가 막는다.

`world: 'na'` 인 이유: 로그를 모아 옮기는 구조 자체는 경매 위치와 무관하다. 7절이 pCTR 학습 데이터까지 가지만, 거기서 쓰는 기법이 열린 RTB냐 담장 안이냐로 갈리지 않는다. `'na'` 인 글은 `worldNote`·`worldPractical`을 쓰지 않는다(기존 `software-architecture-patterns`·`kubernetes-networking`과 같다).

두 글 다 `excerpt`를 반드시 채운다. 빈 필드는 `validate-posts.js`가 막는다.

### 절 구성

도입: 광고가 한 번 노출됐다. 그 사실을 알아야 하는 곳이 네 군데다 — 학습팀, 정산팀, 대시보드, 광고주 리포트.

> 한 줄 요약: Kafka는 한 번 쓰고 여러 팀이 각자 읽는 로그 보관소다. 보내는 쪽과 읽는 쪽을 떼어 놓는 것이 전부다.

절이 8개이므로 `> 골라 읽는 법` 블록을 붙인다.

| 절 | 내용 | 핵심 |
|---|---|---|
| 1 | **Kafka 없이 하면 어디서 터지나** | 직접 HTTP 4번 → 한 팀이 배포하면 광고가 느려진다 / 파일에 쓰기 → 서버가 죽으면 사라진다 / DB에 바로 넣기 → 초당 5만 건에서 눕는다. 표로 정리 |
| 2 | **producer** | producer는 bidder 안에 들어가는 라이브러리다. 별도 서버가 아니다. 실제 JSON 한 줄, key를 무엇으로 잡나, `acks` 0/1/all이 유실·지연을 어떻게 바꾸나 |
| 3 | **topic · partition** | 칸 수가 처리량 상한을 정한다. `hash(key) % 칸수`. **순서 보장은 칸 안에서만**. key를 `req_id`로 잡으면 같은 요청의 노출·클릭이 같은 칸에 간다 |
| 4 | **consumer · consumer group** | 다른 group은 같은 줄을 각자 통째로 읽는다. group 안에서는 칸을 나눠 맡는다. consumer가 partition보다 많으면 남는 사람은 논다 |
| 5 | **offset** | commit 시점이 만드는 두 사고: 중복 처리 vs 유실. at-least-once / at-most-once를 이 두 사고로 설명. 광고에서 중복이 과금과 학습 라벨을 어떻게 망가뜨리나 |
| 6 | **보관 기간** | 읽어도 지우지 않는다. 기간·용량으로 지운다. retention 7일이면 학습이 3일 멈춰도 복구된다. `ad.impression` 하루 볼륨으로 실제 용량 계산 |
| 7 | **학습 데이터로** | impression + click을 `req_id`로 조인 → (X, y). click이 늦게 오는 것과 조인 창. `ad-log-pipeline`·`feature-store-serving`·`demo-log-to-model`로 연결 |
| 8 | 지뢰 · 더 깊이 보기 | "Kafka는 큐다"가 반만 맞는 이유, key 없이 보내면 순서가 깨지는 것, consumer lag을 봐야 하는 이유, partition 수를 나중에 늘리면 배정이 전부 바뀌는 것 |

### 파이썬 코드 처리 방침 (중요)

Kafka 코드는 브로커 없이 실행되지 않는다. 블로그 규칙은 "파이썬은 반드시 실제로 실행해 `# 출력:`을 붙일 것"이다. 두 종류로 나눈다.

| 종류 | 표시 | 예 |
|---|---|---|
| 실제 Kafka API 호출 | 첫 줄에 `# (의사코드 — 그대로 실행되지 않습니다.)` | `producer.send('ad.impression', key=..., value=...)`, consumer 루프, `acks` 설정 |
| 동작 재현 (표준 라이브러리) | 실제 실행하고 `# 출력:` 부착 | partition 배정 분포, offset commit 시점별 중복·유실 건수, retention 용량 계산 |

의사코드 표시는 `MARKDOWN_GUIDE.md`에 이미 있는 규칙이다("실행이 안 되는 구조 스케치라면 첫 줄에 (의사코드)를 달아"). 새로 만드는 예외가 아니다.

실행하는 파이썬 3개:
- 3절: key 종류별(`req_id` / `ad_id` / 없음) partition 분포. 쏠림이 얼마나 생기나
- 5절: commit을 처리 전에 하느냐 후에 하느냐로 중복·유실 건수가 어떻게 갈리나
- 6절: `ad.impression` 하루 볼륨 × 보존일수 = 디스크. 보존을 늘릴 때 비용이 어떻게 느나

## 그림 — 무엇을 몇 장, 어떤 방식으로

### 글 1

| 위치 | 방식 | 내용 |
|---|---|---|
| 1~5절 | 인라인 SVG 5장 | 같은 캔버스가 절마다 한 칸씩 자란다. 이번 절에서 새로 생긴 칸만 벽돌색으로 강조 |
| 3절 | mermaid 1개 | 요청이 Ingress 규칙표를 위에서부터 훑다가 첫 매칭에서 멈추는 분기 흐름 |
| 6절 | 인라인 SVG 1장 | 완성된 전체 지도. 5장의 누적 결과 |
| 6절 또는 7절 앞 | 데모 임베드 | `demo-request-path.html` |

### 글 2

| 위치 | 방식 | 내용 |
|---|---|---|
| 1절 | 인라인 SVG 1장 | 세 방법이 각각 어디서 끊기는지 |
| 3절 | 인라인 SVG 1장 | topic 안의 partition 칸과 offset 번호 구조 |
| 3절 | 데모 임베드 | `demo-kafka-partition.html` |
| 4절 | mermaid 시퀀스 1개 | producer → broker → 두 consumer group. 같은 줄을 각자 읽는 것 |
| 5절 | mermaid 1개 | commit 시점에 따라 중복이냐 유실이냐로 갈리는 분기 |
| 6절 | 인라인 SVG 1장 | 시간축 위의 보관 기간. 학습이 멈춘 구간과 복구 가능 구간 |
| 7절 | 인라인 SVG 1장 | impression + click 조인 창 |

### SVG 작성 규칙 (기존 SE 글 2편과 동일)

- `<figure>` + `<figcaption>` 으로 감싸고 `role="img"` + `aria-label` 필수
- 색은 전부 `var(--...)` CSS 변수. hex 하드코딩 금지 — 다크 테마에서 깨진다
- `viewBox` + `style="width:100%; max-width:NNNpx; height:auto"` 로 반응형
- **모바일 375px에서 `document.scrollWidth == clientWidth` 인지 확인.** 넓은 SVG는 `overflow-x:auto` 상자에 담는다

### mermaid 팔레트 (전역 변경)

`post.html`과 `js/main.js` 두 곳의 `mermaid.initialize`를 바꾼다.

| 지금 | 바꿀 것 |
|---|---|
| `theme: 'neutral'` (라이트) / `'dark'` (다크) | `theme: 'base'` + `themeVariables` 2벌(라이트·다크) |

themeVariables는 블로그 토큰을 그대로 옮긴다 — 노드 배경 `#fffdf8`, 테두리 `rgba(32,29,26,0.22)`, 글자 `#201d1a`, 선 `#8a6a3a`(bronze), 묶음 배경 `#f4efe4`, 폰트 Pretendard. 다크는 `#232020` / `#f1ece3` / `#c9a36b` 계열.

강조가 필요한 노드는 다이어그램 안에서 `classDef` 로 벽돌색을 준다.

**기존 26편의 mermaid 그림이 전부 같이 바뀐다.** 팔레트를 바꾼 뒤 대표 3~4편(`git-practical-guide`가 13개로 가장 많다)을 눈으로 확인한다.

## 데모 2개

기존 20편의 데모와 같은 구조를 따른다 — `demo-*.html` + `js/*-demo.js` + `js/demo-edu-content.js`의 `embedKeep` 엔트리.

### `demo-request-path.html` — 부품을 끄고 요청을 보내 본다

글 1의 뼈대가 "하나씩 생긴다"이므로, 데모는 그 역방향을 시킨다.

- 토글 4개: LB / Ingress / API Gateway / 서비스 메시
- 슬라이더: 서비스 수 1~12, 매체 수 1~10
- 요청을 하나 던지면 경로가 순서대로 점등되고, 없는 부품 때문에 어디서 실패하는지 표시
- 같이 뜨는 숫자: 매체가 알아야 할 주소 개수, 공인 IP 개수, 관리할 인증서 개수, 정책 구현 벌수

`kubernetes-networking`의 LB 비용 파이썬과 겹치지 않게 한다. 그 글은 "얼마 드나"를 계산하고, 이 데모는 **"무엇이 없으면 무엇이 터지나"** 를 보인다.

### `demo-kafka-partition.html` — 칸과 읽는 사람

- 슬라이더: partition 수 1~12, consumer 수 1~6
- 선택: key를 `req_id` / `ad_id` / 없음 중 무엇으로 잡나
- 노출 로그 12줄이 칸에 나뉘는 것을 보여주고, 각 칸을 어느 consumer가 맡는지 색으로
- 판정 문구: consumer가 partition보다 많으면 "몇 명이 논다", key가 `ad_id`면 "한 칸에 쏠린다", key가 없으면 "순서가 안 지켜진다"
- partition 수를 바꾸면 같은 key가 다른 칸으로 가는 것을 보이기 — 나중에 칸을 늘리면 안 되는 이유

브레인스토밍에서 만든 프로토타입이 `.superpowers/brainstorm/34199-1786078328/content/demo-question.html` 에 있다. 배정·판정 로직을 여기서 가져다 쓴다.

## 손대야 할 파일

| 파일 | 무엇을 |
|---|---|
| `posts/gateway-ingress-router.md` | 새로 작성 |
| `posts/kafka-log-pipeline.md` | 새로 작성 |
| `js/posts.js` | 글 2편 엔트리 추가 + `engineering-foundations` 시리즈에 2편 추가 |
| `data/taxonomy.json` | 태그 `Kafka` 추가 (**posts.js보다 먼저**) |
| `post.html` · `js/main.js` | mermaid 팔레트 (2곳 다 고쳐야 함) |
| `demo-request-path.html` · `js/request-path-demo.js` | 새로 작성 |
| `demo-kafka-partition.html` · `js/kafka-partition-demo.js` | 새로 작성 |
| `js/demo-edu-content.js` | `embedKeep` 엔트리 2개 추가 |
| `demos.html` | 데모 2개 등록 |
| `MARKDOWN_GUIDE.md` | 문체 규칙 갱신 (새 글은 비유 없이) |
| `search-index.json` | 재생성 |

## 검증

작업 순서상 마지막이 아니라 **글을 한 편 끝낼 때마다** 돌린다.

```bash
node scripts/validate-posts.js           # 분류·빈 필드·없는 .md·죽은 링크
node scripts/check-content-standard.js   # 내용 표준
node scripts/build-search-index.js       # 검색 색인
```

기계가 못 잡는 것은 따로 확인한다.

| 확인할 것 | 어떻게 |
|---|---|
| 파이썬 출력이 본문 숫자와 맞나 | 블록을 실제로 실행해 `# 출력:` 과 대조 |
| 모바일에서 가로 스크롤이 안 생기나 | 375px 폭에서 `document.scrollWidth == clientWidth` |
| mermaid 팔레트가 기존 글을 깨지 않았나 | `git-practical-guide`(13개) 등 3~4편 눈으로 |
| 데모 임베드가 라이트·다크 양쪽에서 읽히나 | 두 테마에서 열어 보기 |
| 내부 링크의 글 id | `node -e "require('./js/posts.js').posts.forEach(p=>console.log(p.id))"` 로 확인 |

검사기 경고는 **글을 고치라는 신호이지 경고를 없애라는 신호가 아니다.** 80자 초과가 뜨면 그 문장을 진짜로 나눈다.

시뮬레이션이 서술을 반박하면 **서술을 고친다.** 코드를 결론에 맞추지 않는다.

## 커밋

```bash
git add posts/<slug>.md js/posts.js data/taxonomy.json ...   # 파일을 명시. git add -A 금지
git commit -m "feat(posts): …"
git fetch origin && git merge origin/main                     # CI가 sitemap·feed를 되커밋
git push origin main
```

`chkimsu` 계정으로 커밋한다. 회사 이메일을 쓰지 않는다.

## 범위에서 뺀 것

- 기존 39편의 비유를 걷어내는 소급 작업 — 하지 않는다
- `kubernetes-networking`·`software-architecture-patterns` 본문 수정 — 하지 않는다. 새 글에서 링크만 건다
- 서비스 메시를 깊게 다루는 것 — 글 1의 5절에서 "언제부터 필요한가"까지만. 별도 글감으로 남긴다
- Kafka 운영(브로커 수, 복제 계수, ISR, 장애 대응) — 글 2의 범위 밖. 8절에서 이름만 짚고 넘어간다
