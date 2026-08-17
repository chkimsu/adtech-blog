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
    fileHours:   v(237,  L, '디스크 100GB 면 237시간입니다'),
    directMins:  v(10.9, L, '512MB 가 10.9분에 찹니다'),
    nginxBufLoss: v(179, L, '없어질 수 있는 최대치는 **179줄**'),
    dailyClicks: v('하루 클릭 228만 건', P),

    // --- Kafka ---
    topicClick:    v('ad.click', K),
    partitionOf:   v(5,    K, '`partition` 은 5, `offset` 은 8,412'),
    offsetOf:      v(8412, K, '`partition` 은 5, `offset` 은 8,412'),
    partitionN:    v(12,   K, '우리는 12개로 잡습니다'),
    retentionDays: v(7,    K, '우리 답은 7일입니다'),
    joinHours:     v(3,    K, '우리 답은 3시간입니다'),
    ctr:           v('1.00%', K),

    // --- API ---
    reportInflated: v(1180, C, '리포트에 1,180건으로 잡힙니다'),
    cpaInflated:    v(4237, C, '리포트에는 ₩4,237로 뜹니다'),
    bidBudgetMs:    v(12,   G, '12ms 안에 답해야 하는 입찰 요청'),
    trackBudgetMs:  v(100,  G, '100ms 가 걸려도 됩니다'),
    deployStacked:  v(52780, K, '52,780줄이 `bidder` 메모리에 쌓입니다'),

    // --- 실물 줄 (값 자체가 근거다) ---
    accessLineStd: v('"POST /v1/events HTTP/1.1" 204 0', A),
    eventLine:     v('{"req_id":"r-8f21","event":"click","ad_id":9931,"slot":"main_top","event_ts":1786002501234,"app_ver":"3.2.1"}', A),
    collectLine:   v('121.130.8.24 2026-08-16T16:48:21+09:00 POST /v1/events 204 0.002 "AdSDK/3.2.1 (iPhone; iOS 19.2)" {"event":"click","ad_id":9931,"slot":"main_top","req_id":"r-8f21","ts":1786002501234}', L),
    finalLine:     v('{"event":"click","ad_id":9931,"slot":"main_top","req_id":"r-8f21","campaign_id":5502,"advertiser_id":311,"cost":182.4,"media":"A앱","client_ip":"121.130.8.24","device":"iPhone","os":"iOS 19.2","event_time":"2026-08-16T16:48:21+09:00","ingest_time":"2026-08-16T16:48:22.104+09:00","status":204,"latency_ms":2}', L),
    impLine:       v('{"req_id":"r-8f21","ad_id":9931,"slot":"main_top","media":"A앱","pctr":0.0213,"bid":182.4,"ts":1786000101}', K),
    labelLine:     v('{"req_id":"r-8f21","ad_id":9931,"slot":"main_top","media":"A앱","bid":182.4,"y":1}', K),
    logFormat:     v("log_format collect '$remote_addr $time_iso8601 $request_method $uri $status '", L),
  };

  // 값만 꺼내 쓰는 지름길 — 화면 코드는 이쪽을 쓴다
  const val = {};
  for (const k of Object.keys(FACTS)) val[k] = FACTS[k].value;

  // 읽는 쪽 넷. 마감은 kafka-log-pipeline 1절, consumer 수는 4절, 저장소는
  // data-distribution-layer 1절이다. why/late/faster 는 그 글들의 서술을
  // 한 줄로 줄인 것이라 FACTS 대조 대상이 아니다.
  const CONSUMERS = [
    {
      key: 'budget', name: '예산 소진 확인', deadline: '5초', deadlineSec: 5,
      consumers: 6, store: '집계 결과', product: 'Flink', mode: 'stream',
      why: '돈이 샙니다. 예산을 다 쓴 캠페인이 계속 나가면 그 광고비는 우리가 뭅니다',
      late: '5초 늦으면 노출 13,195건이 더 나갑니다',
      faster: '이득이 큽니다. 넷 중 여기가 제일 급합니다',
    },
    {
      key: 'dash', name: '실시간 대시보드', deadline: '2초', deadlineSec: 2,
      consumers: 6, store: 'ClickHouse', product: 'Flink, Kafka Streams', mode: 'stream',
      why: '운영자가 화면을 보며 지금 잘 나가는지 판단합니다',
      late: '멈춘 화면으로 보입니다',
      faster: '이득 없습니다. 사람 눈이 2초 아래를 못 가립니다',
    },
    {
      key: 'report', name: '광고주 리포트', deadline: '5분', deadlineSec: 300,
      consumers: 12, store: '리포트용 DB', product: 'Spark 마이크로배치', mode: 'micro',
      why: '그대로 청구서가 됩니다. 빠른 것보다 정확한 것이 먼저입니다',
      late: '광고주 문의가 옵니다',
      faster: '필요 없습니다',
    },
    {
      key: 'train', name: '모델 학습', deadline: '다음 날 새벽', deadlineSec: 86400,
      consumers: 4, store: 'Iceberg + 스토리지', product: 'Spark, Airflow', mode: 'batch',
      why: '하루치가 다 모여야 라벨이 확정됩니다',
      late: '어제 데이터로 오늘 모델을 못 만듭니다',
      faster: '불가능합니다. 라벨이 아직 안 왔습니다',
    },
  ];

  // 13,195 = 초당 2,639 × 5초. 위 late 문구가 이 곱셈과 맞는지 지킨다.
  const BUDGET_LATE_IMPRESSIONS = FACTS.perSecImp.value * 5;
  // 52,780 = 초당 2,639 × 20초 배포. 3절이 쓴다. 숫자를 손으로 박지 않는다.
  const DEPLOY_STACKED_ROWS = FACTS.perSecImp.value * 20;

  return { FACTS, val, CONSUMERS, BUDGET_LATE_IMPRESSIONS, DEPLOY_STACKED_ROWS };
});
