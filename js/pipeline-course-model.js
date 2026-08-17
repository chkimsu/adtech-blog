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
    beat: V.filebeatEnvelope,
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

  // ------------------------------------------------------------------
  // 한글 조사 — 완성형 한글의 마지막 글자에 받침이 있는지로 이/가, 은/는,
  // 와/과 를 고른다. 읽는 쪽 이름을 그때그때 문장에 끼워 넣어야 해서
  // (예: "예산 소진 확인이" vs "실시간 대시보드가") 고정 조사 하나로는
  // 넷 다 자연스럽게 못 쓴다. 라틴 문자(Kafka)는 이 저장소 관행대로
  // 조사 앞에 띄어쓰기를 둬 별도로 쓴다(범위 밖이면 이 함수는 안 쓴다).
  //
  // (Task 10 에서 js/pipeline-course-sections.js 로부터 옮겨 왔다. 완성형
  // 받침 판정은 진짜 로직이라 시험이 필요한데, 그 파일은 브라우저 전용
  // IIFE 라 require() 가 안 됐다. 이 파일은 이미 UMD 라 옮기는 쪽이 맞았다.
  // 4절이 3절보다 이 함수들로 문장을 더 많이 짓기 때문에 더 미룰 수 없었다.)
  // ------------------------------------------------------------------
  function hasBatchim(w) {
    const c = w.charCodeAt(w.length - 1);
    if (c < 0xAC00 || c > 0xD7A3) return false;
    return (c - 0xAC00) % 28 !== 0;
  }
  function iGa(w) { return hasBatchim(w) ? '이' : '가'; }
  function eunNeun(w) { return hasBatchim(w) ? '은' : '는'; }
  function waGwa(w) { return hasBatchim(w) ? '과' : '와'; }

  // ------------------------------------------------------------------
  // 4절 — 커서 넷이 각자 속도로 topic 을 따라간다.
  //
  // 한 회(tick)에 얼마나 당기는지는 마감 초 수에 비례한 것이 아니라
  // 「붙어 있나 아닌가」다 — CONSUMERS[i].mode 가 그 하나를 정한다.
  //   stream 은 매번 끝까지, micro 는 5회마다 한 번에 끝까지,
  //   batch 는 tick 으로는 전혀 안 움직이고 [새벽이 왔다] 로만 움직인다
  //   (그 버튼은 화면 쪽 코드가 CONSUMERS 의 mode==='batch' 를 보고 만든다,
  //   이 모듈은 tick() 하나만 내놓는다).
  //
  // LAG0 는 화면이 처음 그릴 때 커서를 어디서 시작시킬지 — 실제로 밀린
  // 정도를 재는 값이 아니라, "대시보드는 끝, 예산 소진은 거의 끝, 리포트는
  // 한참 뒤, 학습은 훨씬 더 뒤"라는 스펙 5.2 4절의 표를 그림으로 옮긴
  // 것이다. 그래서 CourseData 에 등록하지 않는다 — 글에서 검증할 "사실"이
  // 아니라 이 위젯의 처음 모양을 정하는 값이다.
  // ------------------------------------------------------------------
  const LAG0 = { budget: 2, dash: 0, report: 40, train: 260 };

  function initialCursors() {
    const head = V.offsetOf;
    return CONSUMERS.map(function (c) {
      return { key: c.key, offset: head - LAG0[c.key] };
    });
  }

  // 회차가 모듈에 남는 유일한 상태다. 시험과 [처음으로] 버튼이 되돌린다 —
  // 되돌리지 않으면 이전 시험이나 이전 클릭이 남긴 microTicks 때문에
  // "다섯 번째에서 확 당긴다"는 실행 순서에 따라 달라져 버린다.
  let microTicks = 0;
  function resetTicks() { microTicks = 0; }

  function tick(cursors, head) {
    microTicks++;
    return cursors.map(function (c) {
      const mode = CONSUMERS.filter(function (x) { return x.key === c.key; })[0].mode;
      if (mode === 'stream') return { key: c.key, offset: head };
      if (mode === 'micro') return { key: c.key, offset: (microTicks % 5 === 0) ? head : c.offset };
      return { key: c.key, offset: c.offset };     // batch — 새벽 버튼으로만 움직인다
    });
  }

  // 4-2 — 읽는 방식은 셋. who 는 CONSUMERS 의 이름을 다시 손으로 적은 것이
  // 아니라 문장 그대로다(스펙 5.2 4-2 표) — 화면 쪽이 who 를 다시 쓸 필요가
  // 있으면 CONSUMERS.filter(mode===key) 로 이 문자열과 같은 답을 얻는다.
  // jobHours 는 stream 만 안다(24시간 상시). micro·batch 의 "5분마다 몇
  // 초"·"새벽 20분"은 6절 몫이라 여기서 앞당겨 쓰지 않는다 — null 로 두고
  // 화면은 ENDPOINTS.deadlineMs 가 null 일 때처럼 '—' 로 비운다.
  const READ_MODES = [
    { key: 'stream', name: '계속 붙어 있기', how: '새 줄이 생기면 바로 받습니다', who: '대시보드, 예산 소진', jobHours: 24 },
    { key: 'micro', name: '주기로 몰아 읽기', how: '5분마다 그동안 쌓인 것을', who: '광고주 리포트', jobHours: null },
    { key: 'batch', name: '하루 한 번', how: '새벽에 하루치를 파일로', who: '모델 학습', jobHours: null },
  ];

  // 1절 — Kafka 가 멈추면 어디에 쌓이나. 값은 글이 계산해 둔 것을 그대로 쓴다.
  // capacity 는 hours·mins 가 전제하는 용량이다 — "237시간"만 보여주면 그 시간이
  // 어디서 나왔는지 안 보이므로, 근거 용량(V.fileGB·V.directMB)을 같이 들려 보낸다.
  const HOLD = {
    file: { where: '로컬 파일', hours: V.fileHours, mins: null, capacity: V.fileGB + 'GB',
      note: '앞단(앱, 웹서버)은 아무 영향을 안 받습니다' },
    direct: { where: '서버 메모리', hours: null, mins: V.directMins, capacity: V.directMB + 'MB',
      note: '광고 서버가 같이 위험해집니다' },
  };
  function holdTime(route) { return HOLD[route]; }

  return {
    HOPS: HOPS, textAt: textAt, totalMs: totalMs, holdTime: holdTime,
    hasBatchim: hasBatchim, iGa: iGa, eunNeun: eunNeun, waGwa: waGwa,
    initialCursors: initialCursors, tick: tick, resetTicks: resetTicks, READ_MODES: READ_MODES,
  };
});
