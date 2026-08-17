// ===================================================================
// 파이프라인 코스 2페이지 — 자리와 흐름
//   js/pipeline-course-model.js
//
// DOM 을 모른다. 자리 7칸의 바이트와 머무는 시간은 전부
// js/course-data.js 를 거쳐 posts/log-hops-to-kafka.md 에서 온다.
// 여기서 숫자를 새로 만들지 않는다.
//
// 머무는 시간의 합이 1,112 가 되어야 한다. 자리를 더하거나 빼면
// 그 합이 깨지고 scripts/test-course-logic.js 가 걸어 준다. totalMs() 는
// 그래서 1,112 를 직접 들고 있지 않고 HOPS 를 매번 더해서 만든다.
// ===================================================================
(function (root, factory) {
  const api = factory(
    typeof require === 'function' ? require('./course-data.js') : root.CourseData
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PipelineCourseModel = api;
})(typeof self !== 'undefined' ? self : globalThis, function (CourseData) {
  'use strict';

  const V = CourseData.val;
  const CONSUMERS = CourseData.CONSUMERS;

  // ------------------------------------------------------------------
  // 「누가 쓰나」·「흔히 쓰는 제품」 — 스펙 5.1 의 제품표는 수집 에이전트·
  // 변환기·줄 저장 셋에만 있다. 앱 SDK·웹서버·로컬 파일은 갈아 끼울 「제품
  // 군」자체가 없는 자리라 표에도 없다 — 그 자리는 '—' 로 비운다. ENDPOINTS
  // 의 deadlineMs·rate 가 null 일 때 '—' 로 비우는 것과 같은 규칙이다.
  //
  // 「누가 쓰나」도 표가 없기는 마찬가지다. 나머지 여섯 자리는 이 저장소
  // 글이 이미 쓰는 팀 이름을 그대로 옮긴다 — 'api-basics.md' 의 앱 팀,
  // 'data-distribution-layer.md' 1행의 데이터 팀. 새 조직 이름을 짓지
  // 않는다. 아무도 손대지 않는 로컬 파일 자리는 '—' 다.
  //
  // 읽는 쪽 넷(readers)만 예외로, who·products 를 손으로 적지 않고
  // CONSUMERS 에서 그대로 계산한다 — CONSUMERS 가 바뀌면 여기도 같이
  // 바뀐다.
  // ------------------------------------------------------------------
  const READER_WHO = CONSUMERS.map(function (c) { return c.name; }).join(', ');
  const READER_PRODUCTS = Array.from(new Set(
    CONSUMERS.reduce(function (acc, c) { return acc.concat(c.product.split(', ')); }, [])
  )).join(', ');

  // Filebeat 봉투 실물. 고정 메타 넷(@timestamp·host·log.file.path·log.offset)은
  // posts/log-hops-to-kafka.md 154행의 그 줄을 그대로 옮긴 값이고, message 칸만
  // V.collectLine 이다 — 그 글이 바뀌면 이 줄도 같이 바뀐다. 바이트 수가 346 이
  // 되는지는 이 파일이 만들 때마다 스스로 참이 되고(문자열을 새로 짓지 않고
  // JSON.stringify 로 만들므로), check-course-data.js 가 이미 지키는
  // V.byteEnvelope=346 과 별도로 다시 셀 필요가 없다.
  const FILEBEAT_ENVELOPE = JSON.stringify({
    '@timestamp': '2026-08-16T07:48:22.104Z',
    host: { name: 'web-03' },
    log: { file: { path: '/var/log/nginx/event.log' }, offset: 88213 },
    message: V.collectLine,
  });

  const HOPS = [
    {
      key: 'sdk', name: '앱 SDK',
      inBytes: V.byteObject, outBytes: V.byteHttpBody, dwellMs: 8,
      does: '객체에서 보낼 것만 골라 본문을 만듭니다',
      who: '앱 팀', products: '—',
    },
    {
      key: 'nginx', name: '웹서버 (nginx)',
      inBytes: V.byteHttpBody, outBytes: V.byteAccess, dwellMs: 170,
      does: '받은 시각, IP, 상태코드를 앞에 붙여 한 줄로 적습니다',
      who: '데이터 팀', products: '—',
    },
    {
      key: 'file', name: '로컬 파일',
      inBytes: V.byteAccess, outBytes: V.byteAccess, dwellMs: 640,
      does: '아무것도 안 합니다. 다음 자리가 가지러 올 때까지 기다립니다',
      who: '—', products: '—',
    },
    {
      key: 'beat', name: '수집 에이전트 (Filebeat)',
      inBytes: V.byteAccess, outBytes: V.byteEnvelope, dwellMs: 120,
      does: '원문을 한 글자도 안 바꾸고 봉투에 담습니다',
      who: '데이터 팀', products: 'Filebeat, Fluent Bit, Vector',
    },
    {
      key: 'logstash', name: '변환기 (Logstash)',
      inBytes: V.byteEnvelope, outBytes: V.byteFinal, dwellMs: 138,
      does: '한 줄을 필드로 쪼개고 DB 를 보고 값을 붙입니다',
      who: '데이터 팀', products: 'Logstash, Fluentd, Vector',
    },
    {
      key: 'kafka', name: 'Kafka',
      inBytes: V.byteFinal, outBytes: V.byteFinal, dwellMs: 36,
      does: '값을 안 바꿉니다. 주소만 붙습니다',
      who: '데이터 팀', products: 'Kafka, Kinesis, Pub/Sub',
    },
    {
      key: 'readers', name: '읽는 쪽 넷',
      inBytes: V.byteFinal, outBytes: V.byteFinal, dwellMs: 0,
      does: '넷이 각자 다른 주기로 읽어 갑니다',
      who: READER_WHO, products: READER_PRODUCTS,
    },
  ];

  // 자리마다 「데이터 모양」 문자열. sdk 만 예외로 나가는 것(85 B 본문)이
  // 아니라 들어오는 것(110 B 앱 안 객체)을 보여 준다 — 브리프가 지정한
  // 그대로다. 나머지 여섯은 그 자리를 지나며 실제로 나가는 모양이다.
  const HOP_TEXT = {
    sdk: V.eventLine,
    nginx: V.collectLine,
    file: V.collectLine,
    beat: FILEBEAT_ENVELOPE,
    logstash: V.finalLine,
    kafka: 'topic ' + V.topicClick + ' / partition ' + V.partitionOf +
      ' / offset ' + V.offsetOf.toLocaleString('en-US') + '\n' + V.finalLine,
    readers: CONSUMERS.map(function (c) {
      return c.name + ' (' + c.deadline + ') → ' + c.store;
    }).join('\n'),
  };

  function textAt(key) {
    return HOP_TEXT[key];
  }

  function totalMs() {
    return HOPS.reduce(function (sum, h) { return sum + h.dwellMs; }, 0);
  }

  return { HOPS: HOPS, textAt: textAt, totalMs: totalMs };
});
