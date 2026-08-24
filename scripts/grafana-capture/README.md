# Grafana 화면 캡쳐 하니스

`posts/serving-latency-throughput.md` 에 실린 Grafana 패널 그림을 다시 만드는 도구다.
글의 시뮬레이션을 실제 Prometheus·Grafana 에 먹여 캡쳐하므로, 화면에 뜨는 값이 글의
숫자와 같다.

🔴 **회사 Grafana 를 캡쳐하지 않는다.** 이 저장소는 공개된 GitHub Pages 다. 대시보드
캡쳐 한 장에 패널 제목·메트릭 이름·job 라벨·실측 트래픽이 같이 들어간다. 여기서 쓰는
데이터는 전부 글의 가상 값이다.

## 한 번만 — 설치

```bash
brew install prometheus grafana     # promtool 은 prometheus 에 같이 들어 있다
```

## 실행

```bash
WORK=/tmp/gfx
scripts/grafana-capture/run.sh  $WORK    # 데이터 생성 → 백필 → 두 서버 실행
scripts/grafana-capture/shoot.sh $WORK   # 그림 6장을 images/ 에 씀
scripts/grafana-capture/stop.sh $WORK    # 내리기
```

`$WORK` 안에만 파일이 생긴다. 사용자 시스템의 Grafana 설정(`/opt/homebrew/etc/grafana`)은
건드리지 않는다 — 데이터·설정·로그 경로를 전부 환경변수로 덮어쓴다.

## 무엇이 어떻게 만들어지나

| 단계 | 파일 | 하는 일 |
|---|---|---|
| 1 | `gen-openmetrics.py` | 글 5절 시뮬레이션(자리 12개·중앙값 3.0ms·흩어짐 0.55·seed 20260823)을 히스토그램 메트릭으로 바꾼다. 1시간·5초 간격 |
| 2 | `promtool tsdb create-blocks-from openmetrics` | 과거 1시간을 블록으로 만든다. 실시간으로 기다리지 않는다 |
| 3 | `make-dashboards.py` | 대시보드 JSON 을 라이트·다크 두 벌씩 만든다. 쿼리는 글에 실린 PromQL 그대로 |
| 4 | `run.sh` | Prometheus(:9099) · Grafana(:3099) 실행 |
| 5 | `shoot.sh` | 헤드리스 크롬으로 `d-solo`·`kiosk` 화면을 캡쳐 |

타임라인에 얹은 사건은 글의 절과 짝이 맞는다.

| 시각 | 무슨 일 | 글의 어디 |
|---|---|---|
| 0~20분 | 평시 2,639 QPS | 5절 |
| 20~25분 | 3,300 QPS 피크 — 예산 초과 35% | 5절 절벽 |
| 30~35분 | `pctr-07` 한 대만 응답 3.4배 | 10절 둘째 함정 |
| 40~43분 | 배포 3분, 12대 → 10대 | 8절 |
| 50분 | 30초 동안 오류율 40% | 10절 셋째 함정 |

## 지킬 것

- **시리즈 색은 저장소 정본 계열색으로 못 박는다.** `make-dashboards.py` 의 `LIGHT`·`DARK`
  가 그것이다. Grafana 기본 초록·노랑 팔레트가 그대로 들어오면 17색 안에서 튄다.
  `check-design.js` 는 PNG 를 못 읽으니 이건 눈으로 지키는 규칙이다.
- **캡쳐 폭은 1100px.** 글 본문(`.post-content`)의 최대 폭과 같다. 더 넓게 잡으면 화면에서
  줄어들어 글자가 안 읽힌다.
- **라이트·다크 두 벌을 만든다.** 캡쳐는 인라인 SVG 처럼 테마 토큰을 못 따라간다.
  `css/style.css` 의 `.fig-light`·`.fig-dark` 규칙이 테마에 맞는 한 장만 보여 준다.
- **범례에 값을 찍는다**(`legend_calcs`). 그림만 봐도 숫자를 읽을 수 있어야 한다.
- 값이 글과 어긋나면 **글을 캡쳐에 맞춘다.** 실제로 한 번 그랬다 — 창 길이 그림의 1분 창이
  산식대로면 20.05% 인데 화면에는 21.9% 로 뜬다. `rate()` 가 창 안 표본의 첫 값과 끝 값
  사이만 재기 때문이고, 5초 간격이면 1분 창이 덮는 것은 55초다.
