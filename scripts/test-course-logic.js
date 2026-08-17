#!/usr/bin/env node
// 코스 두 장의 순수 로직 시험. DOM 이 없어도 도는 부분만 본다.
//
//   node scripts/test-course-logic.js
const S = require('../js/api-course-server.js');

let pass = 0, fail = 0;
function eq(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`   ${ok ? '✓' : '✗'} ${name}${ok ? '' : `\n       기대 ${JSON.stringify(want)}\n       실제 ${JSON.stringify(got)}`}`);
}

// s(덮어쓸 것) — 통과하는 기본 상태에서 한 군데만 바꾼다
const s = (over) => Object.assign(S.defaultState(), over || {});
const sBody = (over) => {
  const st = S.defaultState();
  st.body = Object.assign({}, st.body, over);
  return st;
};

console.log('판정 8단계 — 위에서부터 먼저 걸리는 것이 이긴다');
eq('통과하면 204',                    S.evaluate(s()).status, 204);
eq('장비가 안 뜨면 응답 없음',          S.evaluate(s({ server: 'hostdown' })).status, 0);
eq('앱 프로세스가 죽으면 502',          S.evaluate(s({ server: 'appdown' })).status, 502);
eq('앱이 부르는데 API 키를 달면 401',   S.evaluate(s({ auth: 'apikey' })).status, 401);
eq('GET 이면 405',                     S.evaluate(s({ method: 'GET' })).status, 405);
eq('Content-Type 이 없으면 415',       S.evaluate(s({ ctype: false })).status, 415);
eq('req_id 가 비면 400',               S.evaluate(sBody({ req_id: '' })).status, 400);
eq('느리면 서버는 204',                 S.evaluate(s({ server: 'slow' })).status, 204);

console.log('\n순서가 지켜지나 — 두 조건이 같이 틀렸을 때 앞의 것이 이긴다');
eq('장비가 죽었으면 인증은 안 본다',     S.evaluate(s({ server: 'hostdown', auth: 'apikey' })).reason, 'no-response');
eq('인증이 틀리면 필드는 안 본다',       S.evaluate(Object.assign(sBody({ req_id: '' }), { auth: 'apikey' })).status, 401);

console.log('\n빠진 필드를 다 짚어 주나');
eq('req_id 와 ad_id 가 같이 비면 둘 다', S.evaluate(sBody({ req_id: '', ad_id: null })).missing, ['req_id', 'ad_id']);

console.log('\n앱이 아는 것과 서버가 아는 것이 갈리는 두 자리');
eq('느릴 때 앱은 실패로 안다',           S.appView(S.evaluate(s({ server: 'slow' }))), { ok: false, label: 'timeout' });
eq('장비가 죽으면 앱은 연결 실패',        S.appView(S.evaluate(s({ server: 'hostdown' }))), { ok: false, label: 'connect failed' });
eq('통과하면 앱도 성공으로 안다',         S.appView(S.evaluate(s())), { ok: true, label: 'ok' });
eq('400 이면 앱은 코드를 안다',           S.appView(S.evaluate(sBody({ req_id: '' }))).label, 'got 400');

console.log('\n서버가 부를 때는 요구 인증이 바뀐다');
eq('서버가 API 키를 달면 통과',          S.evaluate(s({ caller: 'server', auth: 'apikey' })).status, 204);
eq('서버가 인증 없이 부르면 401',        S.evaluate(s({ caller: 'server', auth: 'none' })).status, 401);

console.log('\n요청 본문 바이트가 글의 85 와 맞나');
eq('다 채운 본문은 85 B',               S.byteLen(S.bodyText(S.defaultState())), 85);

const allPass = fail === 0;
console.log(`\n${allPass ? `✓ 전부 통과 (${pass}건)` : `✗ ${fail}건 실패 / ${pass + fail}건`}`);
process.exit(allPass ? 0 : 1);
