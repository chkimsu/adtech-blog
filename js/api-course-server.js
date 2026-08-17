// ===================================================================
// API 코스 1페이지 — 가짜 서버
//   js/api-course-server.js
//
// DOM 을 모른다. node 에서 require 되어 scripts/test-course-logic.js 가
// 시험한다. 화면은 js/api-course-demo.js 가 맡는다.
//
// 판정은 위에서부터 내려오고 먼저 걸리는 것이 이긴다. 순서가 곧 뜻이다 —
// 장비가 죽었으면 인증을 볼 기회조차 없다.
// ===================================================================
(function (root, factory) {
  const api = factory(
    typeof require === 'function' ? require('./course-data.js') : root.CourseData
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ApiCourseServer = api;
})(typeof self !== 'undefined' ? self : globalThis, function (CourseData) {
  'use strict';

  const V = CourseData.val;
  const REQUIRED = ['req_id', 'ad_id', 'event'];

  // 부르는 쪽마다 받는 쪽이 요구하는 자격증명이 다르다.
  // 앱은 비밀키를 못 실으므로 아예 안 받고 값을 다시 검사한다.
  const WANT_AUTH = { app: 'none', server: 'apikey' };
  const AUTH_LABEL = { none: '자격증명 없음', token: '사용자 토큰', apikey: 'API 키' };

  // 401 은 두 가지 다른 실패를 하나로 뭉치지 않는다 — 아예 안 실었는지,
  // 실었는데 이 주소가 받는 종류가 아닌지를 갈라 말한다.
  function authMessage(s) {
    const want = WANT_AUTH[s.caller];
    if (s.auth === 'none') return '자격증명을 안 실었습니다. 이 주소가 원하는 것은 ' + AUTH_LABEL[want] + '입니다';
    if (want === 'none') return '지금 실은 자격증명은 ' + AUTH_LABEL[s.auth] + '입니다. 이 주소는 앱이 부를 때 자격증명을 받지 않습니다';
    return '지금 실은 자격증명은 ' + AUTH_LABEL[s.auth] + '입니다. 이 주소가 원하는 것은 ' + AUTH_LABEL[want] + '입니다';
  }

  // 🔴 본문의 키 이름과 순서는 posts/log-hops-to-kafka.md 60행이 정본이다.
  //    `ts` 이지 `event_ts` 가 아니다. 둘은 6바이트 차이라 85 B 가 안 나온다.
  //    (`event_ts` 와 `app_ver` 는 앱이 따로 남기는 이벤트 로그 쪽 이름이다 —
  //     api-basics 8절의 그 줄이고, 3절의 B 방식이 그것을 쓴다)
  const BODY_ORDER = ['event', 'ad_id', 'slot', 'req_id', 'ts'];

  function defaultState() {
    return {
      caller: 'app',
      method: 'POST',
      path: '/v1/events',
      ctype: true,
      auth: 'none',
      server: 'ok',
      body: {
        event: 'click',
        ad_id: V.adId,
        slot: V.slot,
        req_id: V.reqId,
        ts: 1786002501234,
      },
    };
  }

  function verdict(status, reason, message, missing) {
    return { status: status, reason: reason, message: message, missing: missing || [] };
  }

  function evaluate(s) {
    if (s.server === 'hostdown') return verdict(0, 'no-response', '서버 장비가 안 떠 있습니다. 요청이 닿지 못했습니다');
    if (s.server === 'appdown') return verdict(502, 'appdown', 'nginx 는 살아 있는데 뒤의 앱이 죽었습니다');
    if (s.auth !== WANT_AUTH[s.caller]) return verdict(401, 'auth', authMessage(s));
    if (s.method !== 'POST') return verdict(405, 'method', '이 주소는 POST 만 받습니다');
    if (!s.ctype) return verdict(415, 'ctype', 'Content-Type 이 없어 본문을 어떻게 읽을지 모릅니다');

    const missing = REQUIRED.filter(function (k) {
      const v = s.body[k];
      return v === '' || v === null || v === undefined;
    });
    if (missing.length) return verdict(400, 'field', '필수 필드가 빠졌습니다', missing);

    if (s.server === 'slow') return verdict(204, 'timeout', '서버는 저장했는데 앱은 기다리다 포기했습니다');
    return verdict(204, 'ok', '받았습니다. 본문은 안 돌려줍니다');
  }

  // 같은 한 건인데 앱이 아는 것과 서버가 아는 것이 갈린다.
  // 갈리는 자리는 둘뿐이다 — 안 닿았을 때와 앱이 먼저 포기했을 때.
  function appView(v) {
    if (v.reason === 'no-response') return { ok: false, label: 'connect failed' };
    if (v.reason === 'timeout') return { ok: false, label: 'timeout' };
    if (v.status === 204) return { ok: true, label: 'ok' };
    return { ok: false, label: 'got ' + v.status };
  }

  function bodyText(s) {
    const out = {};
    BODY_ORDER.forEach(function (k) {
      const v = s.body[k];
      if (v !== '' && v !== null && v !== undefined) out[k] = v;
    });
    return JSON.stringify(out);
  }

  function requestText(s) {
    const lines = [s.method + ' ' + s.path + ' HTTP/1.1', 'Host: api.example.com'];
    if (s.ctype) lines.push('Content-Type: application/json');
    if (s.auth === 'token') lines.push('Authorization: Bearer u-9f31c0');
    if (s.auth === 'apikey') lines.push('X-Api-Key: k-7712');
    return lines.join('\n') + '\n\n' + bodyText(s);
  }

  const REASON_TEXT = {
    204: '204 No Content',
    400: '400 Bad Request',
    401: '401 Unauthorized',
    405: '405 Method Not Allowed',
    415: '415 Unsupported Media Type',
    502: '502 Bad Gateway',
  };

  function responseText(v) {
    if (v.reason === 'no-response') return null;
    const head = 'HTTP/1.1 ' + REASON_TEXT[v.status];
    if (v.status === 204) return head;
    const body = {
      error: {
        code: v.reason.toUpperCase(),
        message: v.message,
        request_id: V.reqId,
        retryable: v.status >= 500,
      },
    };
    if (v.missing.length) body.error.fields = v.missing;
    return head + '\nContent-Type: application/json\n\n' + JSON.stringify(body);
  }

  function byteLen(str) {
    if (typeof TextEncoder === 'function') return new TextEncoder().encode(str).length;
    return Buffer.byteLength(str, 'utf8');
  }

  return {
    defaultState: defaultState,
    evaluate: evaluate,
    appView: appView,
    bodyText: bodyText,
    requestText: requestText,
    responseText: responseText,
    byteLen: byteLen,
    WANT_AUTH: WANT_AUTH,
    REQUIRED: REQUIRED,
  };
});
