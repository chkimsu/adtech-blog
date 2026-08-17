// ===================================================================
// API·파이프라인 코스 두 장이 같이 쓰는 표준 데이터 한 벌
//   js/course-data.js
//
// 여기 있는 값은 전부 posts/*.md 에서 가져온 것이고 지어낸 것이 없다.
// 값마다 src(출처 글)와 needle(그 글에 있어야 하는 문장)이 달려 있고,
// scripts/check-course-data.js 가 CI 에서 대조한다. 글이 바뀌면 깨진다.
//
// 새 값이 필요하면 여기에 먼저 등록한다. 페이지에 직접 숫자를 박지 않는다.
// ===================================================================
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CourseData = api;
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  // v(값, 출처글, 근거문장) — 문자열 값은 자기 자신이 근거가 된다
  const v = (value, src, needle) => ({
    value,
    src,
    needle: needle || (typeof value === 'string' ? value : null),
  });

  const L = 'log-hops-to-kafka.md';
  const K = 'kafka-log-pipeline.md';
  const A = 'api-basics.md';
  const C = 'api-kinds-and-contracts.md';
  const G = 'gateway-ingress-router.md';
  const P = 'data-pipeline-design.md';

  const FACTS = {
    // --- 그 클릭 한 건 ---
    reqId:     v('r-8f21', L),
    adId:      v(9931, L, '"ad_id":9931'),
    slot:      v('main_top', L),
    clientIp:  v('121.130.8.24', L),
    userAgent: v('AdSDK/3.2.1 (iPhone; iOS 19.2)', L),

    // --- 바이트 사슬 ---
    byteObject:   v(110, L, '110바이트로 들어와 봉투에서 346바이트로 가장 커지고, 변환기에서 309바이트로 꺼집니다'),
    byteHttpBody: v(85,  L, '뒤쪽 중괄호 85바이트'),
    bytePrefix:   v(98,  L, '앞의 98바이트가 서버가 붙인 것'),
    byteAccess:   v(183, L, '183바이트입니다'),
    byteEnvelope: v(346, L, '봉투에 담으면 346바이트가 됩니다'),
    byteFinal:    v(309, L, '건당 309바이트'),

    // --- 볼륨과 시간 ---
    perSecFile:  v(686,  L, '686줄이 들어와 2,665건이 나갑니다'),
    perSecKafka: v(2665, L, '686줄이 들어와 2,665건이 나갑니다'),
    perSecImp:   v(2639, C, '초당 2,639건'),
    msToKafka:   v(1112, L, '탭에서 Kafka 도달까지 1,112 밀리초'),
    msInFile:    v(640,  L, '1,112 밀리초 중 640이 거기입니다'),
    // fileGB·directMB 는 fileHours·directMins 와 근거 문장이 같다 — 근거를 두 벌
    // 만드는 것이 아니라, 한 문장 안에 이미 같이 적혀 있는 용량과 시간을 각각
    // 뽑아서 값 두 개로 등록하는 것이다("100GB 면 237시간", "512MB 가 10.9분").
    fileGB:      v(100,  L, '디스크 100GB 면 237시간입니다'),
    fileHours:   v(237,  L, '디스크 100GB 면 237시간입니다'),
    directMB:    v(512,  L, '512MB 가 10.9분에 찹니다'),
    directMins:  v(10.9, L, '512MB 가 10.9분에 찹니다'),
    nginxBufLoss: v(179, L, '없어질 수 있는 최대치는 **179줄**'),
    dailyClicks: v('하루 클릭 228만 건', P),

    // --- Kafka ---
    topicClick:    v('ad.click', K),
    partitionOf:   v(5,    K, '`partition` 은 5, `offset` 은 8,412'),
    offsetOf:      v(8412, K, '`partition` 은 5, `offset` 은 8,412'),
    partitionN:    v(12,   K, '우리는 12개로 잡습니다'),
    retentionDays: v(7,    K, '우리 답은 7일입니다'),
    // 5절 — 되감는 속도의 상한(partition 수)을 보여주는 두 점. 이 프로젝트가
    // 특히 지키려던 두 숫자라(리뷰 요청) js/pipeline-course-model.js 의
    // CATCHUP 이 계산식이 아니라 이 값을 그대로 쓴다.
    catchup4Days:  v(14.1, K, '모델 학습이 4명으로 3일치를 따라잡으면 **14.1일**이 걸리고, 12명까지 늘려야 **1.1일**입니다.'),
    catchup12Days: v(1.1,  K, '모델 학습이 4명으로 3일치를 따라잡으면 **14.1일**이 걸리고, 12명까지 늘려야 **1.1일**입니다.'),
    joinHours:     v(3,    K, '우리 답은 3시간입니다'),
    // 7절 — 창을 3시간에서 24시간으로 늘렸을 때. 넷 다 같은 문장 하나("우리
    // 답은 3시간입니다. 24시간으로 늘리면...")에서 온다 — fileGB·fileHours
    // 처럼 근거 문장 하나를 여럿이 나눠 쓴다.
    joinWindowAlt:     v(24,    K, '24시간으로 늘리면 11,400건을 더 건지는데 228만의 0.5% 이고, 그 0.5% 를 사려고 학습 데이터 확정이 21시간 늦어집니다.'),
    joinAltCatch:      v(11400, K, '24시간으로 늘리면 11,400건을 더 건지는데 228만의 0.5% 이고, 그 0.5% 를 사려고 학습 데이터 확정이 21시간 늦어집니다.'),
    joinAltPct:        v('0.5%', K, '24시간으로 늘리면 11,400건을 더 건지는데 228만의 0.5% 이고, 그 0.5% 를 사려고 학습 데이터 확정이 21시간 늦어집니다.'),
    joinAltDelayHours: v(21,    K, '24시간으로 늘리면 11,400건을 더 건지는데 228만의 0.5% 이고, 그 0.5% 를 사려고 학습 데이터 확정이 21시간 늦어집니다.'),
    ctr:           v('1.00%', K),
    // 7절 — CTR 의 분자·분모. ctr(1.00%)과 같은 문장(하루로 세면 노출 2억
    // 2,800만 줄에 클릭 228만 줄이라 1.00% 이고)에서 온다. ctrImpressions 는
    // 그 문장의 "2억 2,800만"을 나누기 표기에 맞춰 억 단위(2.28억)로 다시
    // 적은 것이다 — 같은 값이고 새로 지어낸 수가 아니다.
    ctrClicks:      v('228만', K, '하루로 세면 노출 2억 2,800만 줄에 클릭 228만 줄이라'),
    ctrImpressions: v('2.28억', K, '하루로 세면 노출 2억 2,800만 줄에 클릭 228만 줄이라'),

    // --- API ---
    reportInflated: v(1180, C, '리포트에 1,180건으로 잡힙니다'),
    cpaInflated:    v(4237, C, '리포트에는 ₩4,237로 뜹니다'),
    convDaily:      v(1000, C, '하루 1,000건'),
    bidBudgetMs:    v(12,   G, '12ms 안에 답해야 하는 입찰 요청'),
    trackBudgetMs:  v(100,  G, '100ms 가 걸려도 됩니다'),
    deployStacked:  v(52780, K, '52,780줄이 `bidder` 메모리에 쌓입니다'),
    deploySeconds:  v(20,   K, '20초 배포하는 동안'),

    // --- 실물 줄 (값 자체가 근거다) ---
    accessLineStd: v('10.2.31.7 - - [16/Aug/2026:16:48:21 +0900] "POST /v1/events HTTP/1.1" 204 0 "-" "AdSDK/3.2.1" 0.002', A),
    eventLine:     v('{"req_id":"r-8f21","event":"click","ad_id":9931,"slot":"main_top","event_ts":1786002501234,"app_ver":"3.2.1"}', A),
    collectLine:   v('121.130.8.24 2026-08-16T16:48:21+09:00 POST /v1/events 204 0.002 "AdSDK/3.2.1 (iPhone; iOS 19.2)" {"event":"click","ad_id":9931,"slot":"main_top","req_id":"r-8f21","ts":1786002501234}', L),
    // Filebeat 봉투 실물. collectLine 이 message 칸에 그대로 들어간 형태이고,
    // 이 줄 전체가 posts/log-hops-to-kafka.md 154행에 있다 — 346바이트로
    // FACTS.byteEnvelope 와도 맞는다. js/pipeline-course-model.js 가 조각을
    // 손으로 짜맞추지 않고 이 값을 그대로 쓴다.
    filebeatEnvelope: v('{"@timestamp":"2026-08-16T07:48:22.104Z","host":{"name":"web-03"},"log":{"file":{"path":"/var/log/nginx/event.log"},"offset":88213},"message":"121.130.8.24 2026-08-16T16:48:21+09:00 POST /v1/events 204 0.002 \\"AdSDK/3.2.1 (iPhone; iOS 19.2)\\" {\\"event\\":\\"click\\",\\"ad_id\\":9931,\\"slot\\":\\"main_top\\",\\"req_id\\":\\"r-8f21\\",\\"ts\\":1786002501234}"}', L),
    finalLine:     v('{"event":"click","ad_id":9931,"slot":"main_top","req_id":"r-8f21","campaign_id":5502,"advertiser_id":311,"cost":182.4,"media":"A앱","client_ip":"121.130.8.24","device":"iPhone","os":"iOS 19.2","event_time":"2026-08-16T16:48:21+09:00","ingest_time":"2026-08-16T16:48:22.104+09:00","status":204,"latency_ms":2}', L),
    impLine:       v('{"req_id":"r-8f21","ad_id":9931,"slot":"main_top","media":"A앱","pctr":0.0213,"bid":182.4,"ts":1786000101}', K),
    labelLine:     v('{"req_id":"r-8f21","ad_id":9931,"slot":"main_top","media":"A앱","bid":182.4,"y":1}', K),
    logFormat:     v("log_format collect '$remote_addr $time_iso8601 $request_method $uri $status '\n                   '$request_time \"$http_user_agent\" $request_body';", L),
  };

  // 값만 꺼내 쓰는 지름길 — 화면 코드는 이쪽을 쓴다
  const val = {};
  for (const k of Object.keys(FACTS)) val[k] = FACTS[k].value;

  // 13,195 = 초당 2,639 × 5초. 아래 CONSUMERS 의 budget.late 문구를 이
  // 값에서 직접 만든다 — 숫자가 바뀌면 문구도 같이 바뀌어 갈릴 일이 없다.
  const BUDGET_LATE_IMPRESSIONS = FACTS.perSecImp.value * 5;
  // 52,780 = 초당 2,639 × 20초 배포. 3절이 쓴다. 숫자를 손으로 박지 않는다.
  const DEPLOY_STACKED_ROWS = FACTS.perSecImp.value * FACTS.deploySeconds.value;

  // 읽는 쪽 넷. 마감은 kafka-log-pipeline 1절, consumer 수는 4절, 저장소는
  // data-distribution-layer 1절이다. why/late/faster 는 그 글들의 서술을
  // 한 줄로 줄인 것이라 FACTS 대조 대상이 아니다.
  // how(Task 11, 6절 표 "어떻게 읽나" 칸)도 같은 이유로 FACTS 대상이 아니다 —
  // 숫자가 아니라 그 소비자가 읽는 모양을 문장으로 줄인 것이다.
  const CONSUMERS = [
    {
      key: 'budget', name: '예산 소진 확인', deadline: '5초', deadlineSec: 5,
      consumers: 6, store: '집계 결과', product: 'Flink', mode: 'stream', how: '붙어서 합계만',
      why: '돈이 샙니다. 예산을 다 쓴 캠페인이 계속 나가면 그 광고비는 우리가 뭅니다',
      late: `5초 늦으면 노출 ${BUDGET_LATE_IMPRESSIONS.toLocaleString('en-US')}건이 더 나갑니다`,
      faster: '이득이 큽니다. 넷 중 여기가 제일 급합니다',
    },
    {
      key: 'dash', name: '실시간 대시보드', deadline: '2초', deadlineSec: 2,
      consumers: 6, store: 'ClickHouse', product: 'Flink, Kafka Streams', mode: 'stream', how: '붙어서 한 건씩',
      why: '운영자가 화면을 보며 지금 잘 나가는지 판단합니다',
      late: '멈춘 화면으로 보입니다',
      faster: '이득 없습니다. 사람 눈이 2초 아래를 못 가립니다',
    },
    {
      key: 'report', name: '광고주 리포트', deadline: '5분', deadlineSec: 300,
      consumers: 12, store: '리포트용 DB', product: 'Spark 마이크로배치', mode: 'micro', how: '5분마다 모아서',
      why: '그대로 청구서가 됩니다. 빠른 것보다 정확한 것이 먼저입니다',
      late: '광고주 문의가 옵니다',
      faster: '필요 없습니다',
    },
    {
      key: 'train', name: '모델 학습', deadline: '다음 날 새벽', deadlineSec: 86400,
      consumers: 4, store: 'Iceberg + 스토리지', product: 'Spark, Airflow', mode: 'batch', how: '하루치를 파일로',
      why: '하루치가 다 모여야 라벨이 확정됩니다',
      late: '어제 데이터로 오늘 모델을 못 만듭니다',
      faster: '불가능합니다. 라벨이 아직 안 왔습니다',
    },
  ];

  // 목적지 여섯(Task 11, 6절). posts/data-distribution-layer.md 1절 표를
  // 그대로 옮긴 값이다. CONSUMERS 와 같은 이유로 낱개 숫자를 FACTS 에
  // 등록하지 않는다 — 표 하나가 근거이지, 숫자마다 다른 문장에서 뽑아 온
  // 것이 아니다. write 칸의 "파티션"은 이 페이지가 피하는 Kafka 파티션과는
  // 다른 말(데이터 창고 테이블을 날짜 등으로 잘라 둔 조각)이지만, 화면에서
  // 헷갈리지 않도록 "구간 단위"로 풀어 썼다.
  const DESTINATIONS = [
    { name: '스토리지 + Iceberg', purpose: '학습, 정산 원천', format: 'Parquet', write: '구간 단위로 덮어쓰기', retry: '5회, 2초' },
    { name: 'ClickHouse', purpose: '실시간 대시보드', format: 'RowBinary', write: '같은 키면 덮어쓰기', retry: '3회, 0.2초' },
    { name: 'OpenSearch', purpose: '운영자 검색', format: 'JSON', write: '문서 id 색인', retry: '3회, 1초' },
    { name: '리포트용 DB', purpose: '광고주 리포트', format: '행', write: '배치 insert', retry: '5회, 2초' },
    { name: '다른 팀 Kafka', purpose: '이상 탐지 팀', format: 'Avro', write: 'topic 에 붙이기', retry: '무한' },
    { name: '피처 스토어', purpose: '서빙 피처', format: '키-값', write: '키 덮어쓰기', retry: '3회, 0.5초' },
  ];

  // 주소 다섯. deadline 이 null 인 것은 글에 값이 없다는 뜻이다 — 화면에서는 '—' 로 그린다.
  // 🔴 null 칸을 채우지 말 것 — 초안에서 /v1/events 에 100ms, /v1/feature 에
  //    5ms 를 적었는데 둘 다 지어낸 값이었다. 100ms 는 /v1/track 의 값이다.
  //    숫자는 전부 FACTS 에서 끌어온다 — 여기서 새로 박지 않는다.
  const ENDPOINTS = [
    { path: 'POST /v1/events', caller: '앱 SDK (C2S)', auth: '없음 — 값을 안 믿고 다시 검사',
      deadlineMs: null, rate: '초당 ' + FACTS.perSecFile.value.toLocaleString('en-US') },
    { path: 'POST /v1/bid', caller: '매체 서버 (S2S)', auth: 'API 키',
      deadlineMs: FACTS.bidBudgetMs.value, rate: '초당 ' + FACTS.perSecImp.value.toLocaleString('en-US') },
    { path: 'POST /v1/track', caller: '매체 서버 (S2S)', auth: 'API 키',
      deadlineMs: FACTS.trackBudgetMs.value, rate: null },
    { path: 'POST /v1/conversions', caller: '광고주 서버 (S2S)', auth: 'API 키 + 요청 번호',
      deadlineMs: null, rate: '하루 ' + FACTS.convDaily.value.toLocaleString('en-US') },
    { path: 'POST /v1/feature', caller: '우리 서비스끼리 (내부)', auth: '없음 — 망으로 막음',
      deadlineMs: null, rate: null },
  ];

  // 가르는 방법 다섯. 문 앞에서 무엇을 보고 갈리는지가 splitBy 다. 숫자가 없어
  // check-course-data.js 대조 대상이 아니다 — posts/gateway-ingress-router.md 의
  // 서술을 그대로 옮긴 것이다.
  const NAMING = [
    { how: '자원 이름이 원래 다름', sample: '/v1/events 대 /v1/conversions', common: '가장 흔합니다', splitBy: '경로',
      why: '앱은 클릭을, 광고주 서버는 전환을 보냅니다. 보내는 것이 다르니 주소가 다릅니다' },
    { how: '호스트로', sample: 'api.example.com 대 partner.example.com', common: '흔합니다', splitBy: '호스트',
      why: '인증, 한도, 방화벽을 호스트 단위로 겁니다. 문 앞에서 제일 먼저 갈립니다' },
    { how: '/internal 접두사', sample: '/internal/v1/scores', common: '흔합니다', splitBy: '경로',
      why: '주소만 보고 밖에 안 열려 있다는 것을 압니다' },
    { how: '/s2s 접두사', sample: '/v1/s2s/conversions', common: '드뭅니다', splitBy: '경로',
      why: 's2s 는 우리 사정입니다. 광고주는 그냥 전환 보내는 주소를 원합니다' },
    { how: '헤더로', sample: 'x-api-version: 1', common: '버전 가를 때만', splitBy: '헤더',
      why: '주소를 안 바꿔도 됩니다' },
  ];

  return { FACTS, val, CONSUMERS, BUDGET_LATE_IMPRESSIONS, DEPLOY_STACKED_ROWS, ENDPOINTS, NAMING, DESTINATIONS };
});
