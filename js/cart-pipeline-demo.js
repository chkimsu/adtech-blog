// ===================================================================
// 장바구니 한 건의 여섯 자리 — js/cart-pipeline-demo.js
//
// 담기 버튼 한 번이 브라우저에서 소비자 넷까지 여섯 자리를 지난다.
// 자리를 누르면 그 자리에 무엇이 들어와서 무엇이 나갔는지가 나란히 나온다.
//
// 값은 전부 posts/pipeline-push-and-pull.md 에서 가져왔다. 바이트는 지어내지
// 않고 그 글이 적어 둔 문자열을 여기서 다시 세어 쓴다(아래 b()).
//
// 색 값은 이 파일에 하나도 없다. 상태는 CSS 클래스로만 표시하고, 붙은 줄과
// 바뀐 줄은 색 말고 글리프(+ ~ -)로도 갈린다(흑백·색맹에서도 읽히게).
//
// 파일 구성은 셋이다.
//   0) 데이터 — 글에서 가져온 문자열과 값
//   1) 상태 — DOM 을 모른다
//   2) 그리기 — state 를 읽어 DOM 에 반영한다. state 를 바꾸지 않는다
//   3) 바인딩 — 이벤트를 받아 state 를 바꾸고 draw* 를 부른다
// ===================================================================

(function () {
  'use strict';

  // ==========================================
  // 0) 글에서 가져온 값
  // ==========================================

  // UTF-8 바이트. 글의 표와 같은 방식으로 센다.
  function b(s) {
    return new TextEncoder().encode(s).length;
  }

  var BROWSER_JSON = '{"e":"cart_add","sku":"SKU-4417","qty":2,"cart":"c-9f31"}';
  var NGINX_PREFIX = '121.130.8.24 2026-08-16T16:48:21+09:00 POST /api/cart 200 0.003 ' +
    '"Mozilla/5.0 (iPhone; CPU iPhone OS 19_2)" ';
  var NGINX_LINE = NGINX_PREFIX + BROWSER_JSON;
  var AGENT_JSON = '{"@timestamp":"2026-08-16T07:48:22.104Z","host":{"name":"web-03"},' +
    '"log":{"file":{"path":"/var/log/nginx/event.log"},"offset":88213},' +
    '"message":' + JSON.stringify(NGINX_LINE) + '}';
  var XFORM_JSON = '{"event":"cart_add","sku":"SKU-4417","qty":2,"cart_id":"c-9f31",' +
    '"unit_price":24800,"amount":49600,"category":"운동화",' +
    '"client_ip":"121.130.8.24","device":"iPhone","os":"iOS 19.2",' +
    '"event_time":"2026-08-16T16:48:21+09:00",' +
    '"ingest_time":"2026-08-16T16:48:22.104+09:00",' +
    '"status":200,"latency_ms":3,"source_host":"web-03"}';

  // 줄 하나 = {m: 마크, k: 이름, v: 값, n: 옆에 붙는 설명}
  // m 은 ' '(그대로) · '+'(붙었다) · '~'(바뀌었다) · '-'(사라졌다)
  function L(m, k, v, n) { return { m: m, k: k, v: v, n: n || '' }; }

  var CLICK = [
    L(' ', '화면', '장바구니에 담기 버튼', '손님이 누른 것'),
    L(' ', '상품', 'SKU-4417 · 수량 2', '화면에 떠 있던 것')
  ];

  var BROWSER_OUT = [
    L('+', 'e', 'cart_add', '무슨 일이 있었나'),
    L('+', 'sku', 'SKU-4417', '어떤 상품인가'),
    L('+', 'qty', '2', '몇 개인가'),
    L('+', 'cart', 'c-9f31', '어느 장바구니인가')
  ];

  var NGINX_OUT = [
    L('+', '보낸 곳', '121.130.8.24', '브라우저는 자기 주소를 모른다'),
    L('+', '닿은 시각', '2026-08-16T16:48:21+09:00', '믿을 수 있는 시계'),
    L('+', '요청', 'POST /api/cart', ''),
    L('+', '응답 코드', '200', '답한 쪽만 안다'),
    L('+', '처리 시간', '0.003', '답한 쪽만 안다'),
    L('+', '브라우저 이름표', '"Mozilla/5.0 (iPhone; CPU iPhone OS 19_2)"', ''),
    L(' ', '본문', BROWSER_JSON, '2절의 57 B 가 그대로')
  ];

  var AGENT_OUT = [
    L('+', '@timestamp', '2026-08-16T07:48:22.104Z', '일어난 시각이 아니라 읽은 시각'),
    L('+', 'host.name', 'web-03', '어느 기계의 파일인가'),
    L('+', 'log.file.path', '/var/log/nginx/event.log', ''),
    L('+', 'log.file.offset', '88213', '여기까지 읽었다'),
    L(' ', 'message', NGINX_LINE, '한 글자도 안 바꾸고 통째로 넣는다')
  ];

  var XFORM_OUT = [
    L('~', 'event', 'cart_add', 'e 에서 이름이 풀렸다'),
    L(' ', 'sku', 'SKU-4417', ''),
    L('~', 'qty', '2', '글자가 숫자가 됐다 — 더할 수 있다'),
    L('~', 'cart_id', 'c-9f31', ''),
    L('+', 'unit_price', '24800', '상품 표를 조회해 붙였다'),
    L('+', 'amount', '49600', 'qty 곱하기 unit_price'),
    L('+', 'category', '운동화', '상품 표에서'),
    L('~', 'client_ip', '121.130.8.24', ''),
    L('+', 'device', 'iPhone', '이름표에서 뽑았다'),
    L('+', 'os', 'iOS 19.2', '이름표에서 뽑았다'),
    L('+', 'event_time', '2026-08-16T16:48:21+09:00', '담긴 시각'),
    L('+', 'ingest_time', '2026-08-16T16:48:22.104+09:00', '우리가 받은 시각'),
    L('~', 'status', '200', '글자가 숫자가 됐다'),
    L('+', 'latency_ms', '3', ''),
    L('~', 'source_host', 'web-03', ''),
    L('-', 'message', '(통짜 문자열)', '쪼갰으니 원본 한 줄은 안 들고 간다')
  ];

  var KAFKA_OUT = [
    L('+', 'topic', 'shop.cart', '어느 이름에 담기나'),
    L('+', 'partition', '1', 'key "c-9f31" 의 해시로 정해졌다'),
    L('+', 'offset', '88,214', '이 갈래에서 몇 번째 줄인가'),
    L(' ', 'value', '필드 15개 (4절 결과 그대로)', '내용은 한 글자도 안 바뀐다')
  ];

  // ⑥ 소비자 넷 — 같은 한 줄에서 넷이 다른 것을 만든다
  var CONSUMERS = [
    {
      key: 'dash', label: '실시간 대시보드', poll: '1초마다', due: '2초',
      out: [
        L('+', 'minute', '16:48', '1분 창으로 묶는다'),
        L('+', 'cart_adds', '1841', '그 창에서 센 건수'),
        L('+', 'amount_sum', '42,690,000', '금액을 더한 값'),
        L('-', '나머지 12개 필드', '', '세는 데 필요 없으니 안 들고 간다')
      ],
      note: '건수와 금액만 남기고 버린다. 몇 건 늦게 반영돼도 다음 갱신에 맞춰진다'
    },
    {
      key: 'stock', label: '재고 서비스', poll: '1초마다', due: '5초',
      out: [
        L('+', 'sku', 'SKU-4417', '어느 상품을 줄이나'),
        L('+', 'delta', '-2', 'qty 를 부호만 뒤집었다'),
        L('+', 'cart_id', 'c-9f31', '같은 줄을 두 번 세지 않으려고 들고 간다')
      ],
      note: '같은 장바구니 담기를 두 번 처리하면 재고가 4 줄어든다. 그래서 cart_id 로 이미 본 것인지 확인한다'
    },
    {
      key: 'wh', label: '창고 적재', poll: '1시간마다', due: '다음 날 새벽',
      out: [
        L(' ', '필드 15개 전부', '', '하나도 안 버린다'),
        L('+', 'dt', '2026-08-16', 'event_time 으로 자른 날짜 칸'),
        L('+', '파일', 'cart/dt=2026-08-16/part-07.parquet', '하루치를 한 벌로')
      ],
      note: '나중에 무엇을 물어볼지 모르니 다 남긴다. Kafka 는 기한이 지나면 지우므로 오래 보관은 여기가 한다'
    },
    {
      key: 'reco', label: '추천 모델 학습', poll: '하루 한 번', due: '하루',
      out: [
        L('+', 'user_seq', 'SKU-2210 → SKU-4417', '이 손님이 담은 순서'),
        L('+', 'label', '1', '담았으니 1'),
        L('-', 'client_ip · status · latency_ms', '', '학습에 안 쓰는 것은 뺀다')
      ],
      note: '어제 담긴 것이 몇 건 빠지면 모델이 그만큼 어긋난다. 그래서 빠진 게 없는지 세어 보고 학습한다'
    }
  ];

  var STAGES = [
    {
      key: 'browser', label: '브라우저', sub: '담기 버튼',
      recv: 'make', recvLabel: '만든다',
      did: '화면에서 일어난 일에 이름을 붙인다. 여기 없는 것이 넷이다 — 누가·어디서·언제·얼마.',
      inTitle: '화면에서 일어난 일', outTitle: '서버로 보낸 것',
      before: CLICK, after: BROWSER_OUT,
      inBytes: null, outBytes: b(BROWSER_JSON), outFields: 4,
      ms: 0, hold: '브라우저 안 · 메모리',
      holdNote: '여기서 막히면 그 담기는 사라진다. 손님이 탭을 닫으면 다시 보낼 주체가 없다'
    },
    {
      key: 'nginx', label: '웹서버', sub: 'nginx',
      recv: 'push', recvLabel: '밀려 온다',
      did: '요청을 받으며 알게 된 넷을 앞에 붙여 파일 끝에 한 줄로 쓴다. 107바이트가 늘었다.',
      inTitle: '브라우저가 보낸 것', outTitle: '파일에 적힌 한 줄',
      before: BROWSER_OUT.map(function (l) { return L(' ', l.k, l.v, ''); }),
      after: NGINX_OUT,
      inBytes: b(BROWSER_JSON), outBytes: b(NGINX_LINE), outFields: null,
      ms: 3, hold: '로그 파일 · 디스크',
      holdNote: '뒤가 다 막혀도 웹서버는 파일에 계속 쓴다. 디스크가 찰 때까지 며칠을 버틴다'
    },
    {
      key: 'agent', label: '수집 에이전트', sub: 'Filebeat',
      recv: 'pull', recvLabel: '가지러 간다',
      did: '내용은 한 글자도 안 건드리고 봉투에만 셋을 적는다 — 언제 읽었나, 어느 기계, 어디까지.',
      inTitle: '파일에서 읽은 한 줄', outTitle: '봉투에 담아 보낸 것',
      before: [L(' ', '텍스트 한 줄', NGINX_LINE, '3절이 만든 그 줄')],
      after: AGENT_OUT,
      inBytes: b(NGINX_LINE), outBytes: b(AGENT_JSON), outFields: 4,
      ms: 40, hold: '로그 파일 · 디스크',
      holdNote: '에이전트가 죽어도 웹서버는 멀쩡하다. 살아나면 offset 88,213 부터 이어 읽는다'
    },
    {
      key: 'xform', label: '변환기', sub: 'Logstash',
      recv: 'push', recvLabel: '밀려 온다',
      did: '통짜 문자열을 필드로 쪼갠다. 크기는 5바이트 줄었는데 쓸 수 있는 필드가 4개에서 15개가 된다.',
      inTitle: '봉투째 받은 것', outTitle: '쪼개고 채운 것',
      before: AGENT_OUT.map(function (l) { return L(' ', l.k, l.v, ''); }),
      after: XFORM_OUT,
      inBytes: b(AGENT_JSON), outBytes: b(XFORM_JSON), outFields: 15,
      ms: 190, hold: '로그 파일까지 되밀린다 · 디스크',
      holdNote: '변환기가 막히면 에이전트가 못 보내고, 밀림은 파일에서 멈춘다'
    },
    {
      key: 'kafka', label: 'Kafka', sub: 'shop.cart',
      recv: 'push', recvLabel: '밀려 온다 · 들고 있는다',
      did: '내용은 안 바꾸고 주소만 붙인다. 여기서부터 한 번 쓰이고 여럿이 읽는다.',
      inTitle: '변환기가 민 것', outTitle: '브로커에 놓인 자리',
      before: [L(' ', '필드 15개', '4절 결과', b(XFORM_JSON) + ' B')],
      after: KAFKA_OUT,
      inBytes: b(XFORM_JSON), outBytes: b(XFORM_JSON), outFields: 15,
      ms: 34, hold: '브로커 · 디스크',
      holdNote: '소비자가 다 죽어도 브로커는 보존 기간만큼 들고 있는다. 읽혔는지가 아니라 나이로 지운다'
    },
    {
      key: 'consumer', label: '소비자 넷', sub: '각자 읽어 간다',
      recv: 'pull', recvLabel: '가지러 간다',
      did: '넷이 같은 한 줄을 읽어 네 개의 다른 결과를 만든다. 아래 칩을 눌러 갈아 보세요.',
      inTitle: '브로커에서 읽은 것', outTitle: '',
      before: [L(' ', '필드 15개', 'shop.cart / partition 1 / offset 88,214', '넷이 같은 줄을 읽는다')],
      after: null,
      inBytes: b(XFORM_JSON), outBytes: null, outFields: null,
      ms: null, hold: '브로커 · 디스크',
      holdNote: '넷이 각자 어디까지 읽었는지만 따로 기억한다. 하나가 죽어도 나머지 셋은 영향이 없다'
    }
  ];

  // 보존 슬라이더 계산에 쓰는 값 (글 8절과 같은 가데이터)
  var IN_SEC = 3800000 / 86400;   // 초당 들어오는 건수
  var RATE = 2000;                // 재고 서비스 초당 처리량

  // ==========================================
  // 1) 상태
  // ==========================================

  var state = {
    stage: 0,        // 지금 보고 있는 자리
    consumer: 0,     // ⑥에서 고른 소비자
    keepDays: 7,     // 보존 기간
    stallHours: 3    // 소비자 하나가 멈춘 시간
  };

  // ---- 순수 계산 ----

  // 멈췄다 살아났을 때 무엇을 잃고 얼마나 걸려 따라잡나.
  // 보존 창 밖은 이미 지워졌으니 읽을 수 있는 만큼만 센다 — 글 8절의 그 계산이다.
  function recovery(stallH, keepD) {
    var keepH = keepD * 24;
    var readable = Math.min(stallH, keepH);
    var lostH = Math.max(0, stallH - keepH);
    var drain = RATE - IN_SEC;
    return {
      lostH: lostH,
      lostRows: Math.round(lostH * 3600 * IN_SEC),
      backlog: Math.round(readable * 3600 * IN_SEC),
      catchMin: readable * 3600 * IN_SEC / drain / 60
    };
  }

  function num(n) { return n.toLocaleString('ko-KR'); }

  // ==========================================
  // 2) 그리기
  // ==========================================

  var $ = function (sel) { return document.querySelector(sel); };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  var MARK_CLASS = { '+': 'is-add', '~': 'is-chg', '-': 'is-del', ' ': 'is-same' };
  var MARK_WORD = { '+': '붙었다', '~': '바뀌었다', '-': '사라졌다', ' ': '그대로다' };

  // 고른 자리만 바꾼다. 띠를 통째로 다시 그리면 방금 누른 버튼이 DOM 에서
  // 떨어져 나가고, 그걸 붙들고 있던 쪽(투어·테스트)이 다음 클릭을 잃는다.
  function markRail() {
    var btns = $('#cp-rail-list').children;
    for (var i = 0; i < btns.length; i++) {
      var on = i === state.stage;
      btns[i].classList.toggle('is-on', on);
      btns[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }

  function drawRail() {
    var rail = $('#cp-rail-list');
    rail.textContent = '';
    STAGES.forEach(function (s, i) {
      var btn = el('button', 'cp-step');
      btn.type = 'button';
      btn.dataset.stage = String(i);
      btn.setAttribute('aria-pressed', i === state.stage ? 'true' : 'false');
      if (i === state.stage) btn.classList.add('is-on');
      btn.appendChild(el('span', 'cp-step-idx', String(i + 1)));
      btn.appendChild(el('span', 'cp-step-label', s.label));
      btn.appendChild(el('span', 'cp-step-sub', s.sub));
      var badge = el('span', 'cp-step-badge cp-recv-' + s.recv, s.recvLabel);
      btn.appendChild(badge);
      rail.appendChild(btn);
    });
  }

  function drawLines(host, lines) {
    host.textContent = '';
    lines.forEach(function (l) {
      var row = el('div', 'cp-line ' + MARK_CLASS[l.m]);
      var mark = el('span', 'cp-line-mark');
      mark.textContent = l.m === ' ' ? ' ' : l.m;
      // 마크는 색 말고 글자로도 읽혀야 한다. 스크린리더에는 말로 넣는다.
      mark.setAttribute('aria-label', MARK_WORD[l.m]);
      row.appendChild(mark);
      var body = el('span', 'cp-line-body');
      body.appendChild(el('span', 'cp-line-key', l.k));
      if (l.v) body.appendChild(el('span', 'cp-line-val', l.v));
      if (l.n) body.appendChild(el('span', 'cp-line-note', l.n));
      row.appendChild(body);
      host.appendChild(row);
    });
  }

  // 이/가 를 앞 글자의 받침에 맞춘다. '학습가' 가 아니라 '학습이' 여야 한다.
  function subj(word) {
    var c = word.charCodeAt(word.length - 1);
    var hasJong = c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 !== 0;
    return word + (hasJong ? '이' : '가');
  }

  function sizeText(bytes, fields) {
    if (bytes === null) return '';
    var t = num(bytes) + ' B';
    if (fields) t += ' · 필드 ' + fields + '개';
    return t;
  }

  function drawPanes() {
    var s = STAGES[state.stage];
    $('#cp-in-title').textContent = s.inTitle;
    $('#cp-in-size').textContent = sizeText(s.inBytes, null);
    drawLines($('#cp-in-body'), s.before);

    var c = CONSUMERS[state.consumer];
    var isLast = s.key === 'consumer';
    $('#cp-out-title').textContent = isLast ? subj(c.label) + ' 만든 것' : s.outTitle;
    $('#cp-out-size').textContent = isLast ? c.due + ' 안에' : sizeText(s.outBytes, s.outFields);
    drawLines($('#cp-out-body'), isLast ? c.out : s.after);

    // 크기가 어떻게 변했나 — 늘었나 줄었나를 말로도 적는다
    var delta = $('#cp-delta');
    if (s.inBytes === null || s.outBytes === null) {
      delta.textContent = '';
      delta.hidden = true;
    } else {
      var d = s.outBytes - s.inBytes;
      delta.hidden = false;
      delta.textContent = d === 0
        ? '크기 그대로 ' + num(s.outBytes) + ' B'
        : num(s.inBytes) + ' B 에서 ' + num(s.outBytes) + ' B 로 ' +
          (d > 0 ? num(d) + ' B 늘었다' : num(-d) + ' B 줄었다');
      delta.classList.toggle('is-down', d < 0);
    }

    $('#cp-did').textContent = s.did;
    $('#cp-hold').textContent = s.hold;
    $('#cp-hold-note').textContent = s.holdNote;
    $('#cp-recv').textContent = s.recvLabel;
    $('#cp-recv').className = 'cp-fact-val cp-recv-' + s.recv;
    $('#cp-ms').textContent = s.ms === null ? '소비자마다 다르다' : s.ms + ' ms';

    $('#cp-consumers').hidden = !isLast;
    $('#cp-consumer-note').textContent = isLast ? c.note : '';
  }

  function markConsumers() {
    var btns = $('#cp-consumer-list').children;
    for (var i = 0; i < btns.length; i++) {
      var on = i === state.consumer;
      btns[i].classList.toggle('is-on', on);
      btns[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }

  function drawConsumers() {
    var host = $('#cp-consumer-list');
    host.textContent = '';
    CONSUMERS.forEach(function (c, i) {
      var btn = el('button', 'cp-chip');
      btn.type = 'button';
      btn.dataset.consumer = String(i);
      btn.setAttribute('aria-pressed', i === state.consumer ? 'true' : 'false');
      if (i === state.consumer) btn.classList.add('is-on');
      btn.appendChild(el('span', 'cp-chip-name', c.label));
      btn.appendChild(el('span', 'cp-chip-meta', c.poll + ' · 마감 ' + c.due));
      host.appendChild(btn);
    });
  }

  function drawRetention() {
    var r = recovery(state.stallHours, state.keepDays);
    $('#cp-keep-out').textContent = state.keepDays + '일';
    $('#cp-stall-out').textContent = state.stallHours + '시간';

    var verdict = $('#cp-verdict');
    verdict.classList.toggle('is-lost', r.lostH > 0);
    if (r.lostH > 0) {
      verdict.textContent = '앞 ' + r.lostH + '시간치 ' + num(r.lostRows) +
        '건이 이미 지워졌다. 보존 창 밖이라 되감을 수가 없다';
    } else {
      verdict.textContent = '전부 되감을 수 있다. 밀린 ' + num(r.backlog) +
        '건을 ' + r.catchMin.toFixed(1) + '분에 따라잡는다';
    }

    $('#cp-detail').textContent = '멈춘 동안 나머지 소비자 셋은 계속 읽었다. ' +
      '넷이 다 읽어도 브로커의 줄은 안 줄어든다 — 지우는 기준은 나이지 읽혔는지가 아니다.';
  }

  function drawAll() {
    drawRail();
    drawPanes();
    drawConsumers();
    drawRetention();
  }

  // ==========================================
  // 3) 바인딩
  // ==========================================

  function bind() {
    $('#cp-rail-list').addEventListener('click', function (e) {
      var btn = e.target.closest('.cp-step');
      if (!btn) return;
      var i = +btn.dataset.stage;
      if (i === state.stage) return;
      state.stage = i;
      markRail();
      drawPanes();
    });

    $('#cp-consumer-list').addEventListener('click', function (e) {
      var btn = e.target.closest('.cp-chip');
      if (!btn) return;
      var i = +btn.dataset.consumer;
      if (i === state.consumer) return;
      state.consumer = i;
      markConsumers();
      drawPanes();
    });

    $('#cp-keep').addEventListener('input', function (e) {
      state.keepDays = +e.target.value;
      drawRetention();
    });

    $('#cp-stall').addEventListener('input', function (e) {
      state.stallHours = +e.target.value;
      drawRetention();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { drawAll(); bind(); });
  } else {
    drawAll();
    bind();
  }
})();
