#!/usr/bin/env node
// 코스 두 장의 순수 로직 시험. DOM 이 없어도 도는 부분만 본다.
//
//   node scripts/test-course-logic.js
const S = require('../js/api-course-server.js');
const D = require('../js/course-data.js');

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
eq('앱이 죽었으면 인증보다 먼저 걸린다', S.evaluate(s({ server: 'appdown', auth: 'apikey' })).status, 502);
eq('인증이 틀리면 필드는 안 본다',       S.evaluate(Object.assign(sBody({ req_id: '' }), { auth: 'apikey' })).status, 401);
eq('인증이 틀리면 메서드는 안 본다',     S.evaluate(s({ auth: 'apikey', method: 'GET' })).status, 401);
eq('메서드가 틀리면 Content-Type 은 안 본다', S.evaluate(s({ method: 'GET', ctype: false })).status, 405);
eq('Content-Type 이 없으면 필드는 안 본다',   S.evaluate(Object.assign(sBody({ req_id: '' }), { ctype: false })).status, 415);
eq('필드가 비면 느려도 400',             S.evaluate(Object.assign(sBody({ req_id: '' }), { server: 'slow' })).status, 400);

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

console.log('\n3절 — 방식마다 어느 줄이 남나');
const okV = S.evaluate(s());
const badV = S.evaluate(sBody({ req_id: '' }));
const hostV = S.evaluate(s({ server: 'hostdown' }));
const appV = S.evaluate(s({ server: 'appdown' }));
const slowV = S.evaluate(s({ server: 'slow' }));
const has = (x) => x !== null;

eq('A 는 본문을 아무 데도 안 남긴다', [has(S.logsFor('A', s(), okV).nginx), has(S.logsFor('A', s(), okV).event)], [true, false]);
eq('B 는 nginx 줄과 앱 줄이 둘 다',   [has(S.logsFor('B', s(), okV).nginx), has(S.logsFor('B', s(), okV).event)], [true, true]);
eq('C 는 nginx 줄 하나뿐',            [has(S.logsFor('C', s(), okV).nginx), has(S.logsFor('C', s(), okV).event)], [true, false]);

eq('400 이면 B 의 앱 줄이 안 남는다',   has(S.logsFor('B', sBody({ req_id: '' }), badV).event), false);
eq('400 이어도 nginx 줄은 남는다',      has(S.logsFor('B', sBody({ req_id: '' }), badV).nginx), true);
eq('앱이 죽어도 nginx 줄은 남는다',     has(S.logsFor('C', s({ server: 'appdown' }), appV).nginx), true);
eq('장비가 죽으면 nginx 줄도 없다',     has(S.logsFor('C', s({ server: 'hostdown' }), hostV).nginx), false);
eq('앱이 포기해도 앱 줄은 남아 있다',    has(S.logsFor('B', s({ server: 'slow' }), slowV).event), true);
eq('앱 SDK 줄은 어느 경우에도 있다',    [S.logsFor('A', s({ server: 'hostdown' }), hostV).sdk, S.logsFor('A', s(), okV).sdk], ['connect failed', 'ok']);

console.log('\n3절 — 방식마다 나오는 줄이 글에 실린 그 줄과 같나');
eq('C 방식 nginx 줄은 183 B',     S.byteLen(S.logsFor('C', S.defaultState(), okV).nginx), D.val.byteAccess);
eq('C 방식 줄이 글에 실린 그 줄',   S.logsFor('C', S.defaultState(), okV).nginx, D.val.collectLine);
eq('A 방식 nginx 줄이 글에 실린 그 줄', S.logsFor('A', S.defaultState(), okV).nginx, D.val.accessLineStd);
eq('B 방식 nginx 줄도 A 와 같은 표준 줄', S.logsFor('B', S.defaultState(), okV).nginx, D.val.accessLineStd);
eq('B 방식 앱 줄이 글에 실린 그 줄', S.logsFor('B', S.defaultState(), okV).event, D.val.eventLine);
eq('C 줄에서 본문을 뺀 앞머리가 98 B',
   S.byteLen(S.logsFor('C', S.defaultState(), okV).nginx) - S.byteLen(S.bodyText(S.defaultState())),
   D.val.bytePrefix);

const allPass = fail === 0;
console.log(`\n${allPass ? `✓ 전부 통과 (${pass}건)` : `✗ ${fail}건 실패 / ${pass + fail}건`}`);
process.exit(allPass ? 0 : 1);
