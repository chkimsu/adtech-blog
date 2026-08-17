#!/usr/bin/env node
// 코스 두 장의 순수 로직 시험. DOM 이 없어도 도는 부분만 본다.
//
//   node scripts/test-course-logic.js
const S = require('../js/api-course-server.js');
const D = require('../js/course-data.js');
const M = require('../js/pipeline-course-model.js');

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

console.log('\n4절 — 재시도가 리포트를 부풀리는 것이 글의 숫자와 맞나');
const noKey = S.retryInflation(false);
eq('회차별로 보낸 건수',   noKey.rounds.map(r => r.sent), [1000, 150, 25, 5]);
eq('회차별 유실',          noKey.rounds.map(r => r.lost), [150, 25, 5, 0]);
eq('리포트 누적은 1,180',   noKey.reported, D.val.reportInflated);
eq('실제는 1,000 그대로',   noKey.real, 1000);
eq('CPA 가 4,237 로 싸 보임', noKey.cpa, D.val.cpaInflated);

const withKey = S.retryInflation(true);
eq('요청 번호를 붙이면 1,000', withKey.reported, 1000);
eq('그때 CPA 는 5,000',        withKey.cpa, 5000);
eq('회차표 자체는 useKey 와 무관하다', withKey.rounds, noKey.rounds);

console.log('\n2페이지 — 자리 7칸의 바이트가 글의 사슬과 맞나');
eq('자리는 일곱',            M.HOPS.length, 7);
eq('자리 이름 순서',          M.HOPS.map(h => h.key), ['sdk', 'nginx', 'file', 'beat', 'logstash', 'kafka', 'readers']);
eq('앱 SDK 는 110 에서 85',   [M.HOPS[0].inBytes, M.HOPS[0].outBytes], [D.val.byteObject, D.val.byteHttpBody]);
eq('nginx 는 85 에서 183',    [M.HOPS[1].inBytes, M.HOPS[1].outBytes], [D.val.byteHttpBody, D.val.byteAccess]);
eq('파일은 그대로 지나간다',    [M.HOPS[2].inBytes, M.HOPS[2].outBytes], [D.val.byteAccess, D.val.byteAccess]);
eq('에이전트는 183 에서 346', [M.HOPS[3].inBytes, M.HOPS[3].outBytes], [D.val.byteAccess, D.val.byteEnvelope]);
eq('변환기는 346 에서 309',   [M.HOPS[4].inBytes, M.HOPS[4].outBytes], [D.val.byteEnvelope, D.val.byteFinal]);
eq('Kafka 는 값을 안 바꾼다',  [M.HOPS[5].inBytes, M.HOPS[5].outBytes], [D.val.byteFinal, D.val.byteFinal]);

console.log('\n앞 자리의 나간 것이 다음 자리의 들어온 것과 이어지나');
for (let i = 1; i < M.HOPS.length; i++) {
  eq(`${M.HOPS[i - 1].key} → ${M.HOPS[i].key}`, M.HOPS[i].inBytes, M.HOPS[i - 1].outBytes);
}

console.log('\n머무는 시간의 합이 글의 1,112 ms 와 맞나');
eq('탭에서 Kafka 까지',        M.totalMs(), D.val.msToKafka);
eq('가장 오래 머무는 자리는 파일', M.HOPS[2].dwellMs, D.val.msInFile);
// 총합 1,112 만 지키면 앞 다섯을 아무렇게나 재배분해도 통과한다 — 그러면
// 글이 밝힌 "1,076 + Kafka 자신의 36" 이라는 쪼갬이 조용히 깨진다. 두 조각을
// 같이 pin 해서 그 재배분 자체를 막는다.
eq('앞 다섯(sdk~logstash) 합은 1,076, Kafka 자신의 몫은 36',
   [M.HOPS.slice(0, 5).reduce((sum, h) => sum + h.dwellMs, 0), M.HOPS[5].dwellMs],
   [1076, 36]);

console.log('\n자리마다 실제 줄이 나오나');
eq('nginx 자리의 줄은 글의 그 줄',  M.textAt('nginx'), D.val.collectLine);
eq('변환기 자리의 줄은 글의 그 줄', M.textAt('logstash'), D.val.finalLine);
eq('Filebeat 봉투 자리도 글의 346 바이트', S.byteLen(M.textAt('beat')), D.val.byteEnvelope);

console.log('\n1절 — Kafka 가 멈췄을 때 어디에 얼마나 버티나');
eq('파일 경유는 100GB 로 237시간', M.holdTime('file').hours, D.val.fileHours);
eq('직행은 512MB 로 10.9분',       M.holdTime('direct').mins, D.val.directMins);
eq('파일 경유는 파일에 쌓인다',      M.holdTime('file').where, '로컬 파일');
eq('직행은 서버 메모리에 쌓인다',    M.holdTime('direct').where, '서버 메모리');
eq('파일 경유가 가정하는 용량은 100GB', M.holdTime('file').capacity, D.val.fileGB + 'GB');
eq('직행이 가정하는 용량은 512MB',      M.holdTime('direct').capacity, D.val.directMB + 'MB');

console.log('\n한글 조사 — 받침 유무로 이/가·은/는·와/과 를 고르나 (3절 리뷰에서 model.js 로 옮김)');
eq('예산 소진 확인 — 받침 있음 → 이',     M.iGa('예산 소진 확인'), '이');
eq('실시간 대시보드 — 받침 없음 → 가',    M.iGa('실시간 대시보드'), '가');
eq('광고주 리포트 — 받침 없음 → 가',      M.iGa('광고주 리포트'), '가');
eq('모델 학습 — 받침 있음 → 이',          M.iGa('모델 학습'), '이');
eq('마감 5초 — 받침 없음 → 는',          M.eunNeun('5초'), '는');
eq('마감 2초 — 받침 없음 → 는',          M.eunNeun('2초'), '는');
eq('마감 5분 — 받침 있음 → 은',          M.eunNeun('5분'), '은');
eq('마감 다음 날 새벽 — 받침 있음 → 은',  M.eunNeun('다음 날 새벽'), '은');
eq('모음으로 끝나면(바나나) 가',          M.iGa('바나나'), '가');
eq('자음 받침으로 끝나면(사람) 이',       M.iGa('사람'), '이');
eq('모음으로 끝나면(바나나) 는',          M.eunNeun('바나나'), '는');
eq('자음 받침으로 끝나면(사람) 은',       M.eunNeun('사람'), '은');
eq('모음으로 끝나면(바나나) 와',          M.waGwa('바나나'), '와');
eq('자음 받침으로 끝나면(사람) 과',       M.waGwa('사람'), '과');

console.log('\n4절 — topic 커서가 각자 속도로 따라가나');
M.resetTicks();                                     // 회차가 남아 있으면 결과가 달라진다
const head0 = D.val.offsetOf;                       // 8,412 가 지금 끝이다
const c0 = M.initialCursors();
eq('커서는 넷',                c0.length, 4);
eq('커서 순서는 읽는 쪽 넷과 같다', c0.map(c => c.key), D.CONSUMERS.map(x => x.key));
eq('대시보드는 끝에 붙어 있다',   c0.find(c => c.key === 'dash').offset, head0);
eq('학습은 한참 뒤에 있다',       c0.find(c => c.key === 'train').offset < head0 - 100, true);

const c1 = M.tick(c0, head0 + 10);
eq('한 회 흐르면 대시보드는 새 끝', c1.find(c => c.key === 'dash').offset, head0 + 10);
eq('학습은 안 움직인다',           c1.find(c => c.key === 'train').offset, c0.find(c => c.key === 'train').offset);
eq('커서는 끝을 못 넘는다',        c1.every(c => c.offset <= head0 + 10), true);

console.log('\n4절 — 회차가 남아 있으면 다섯 번째에서 리포트가 확 당기나 (resetTicks 로 초기화하고 시작)');
M.resetTicks();
let rc = M.initialCursors();
let rHead = head0;
for (let i = 0; i < 4; i++) { rHead++; rc = M.tick(rc, rHead); }
eq('네 번째 회까지는 리포트가 안 움직인다', rc.find(c => c.key === 'report').offset, c0.find(c => c.key === 'report').offset);
rHead++; rc = M.tick(rc, rHead);
eq('다섯 번째 회에서 리포트가 head 로 확 당긴다', rc.find(c => c.key === 'report').offset, rHead);

console.log('\n4절 — 읽는 방식은 셋');
eq('방식 셋의 키',      M.READ_MODES.map(m => m.key), ['stream', 'micro', 'batch']);
// 예전엔 M.READ_MODES[0].jobHours 를 24 와 비교했는데, 그건 리터럴을 자기
// 자신과 비교하는 것이라 값이 틀려도 못 잡는다. 대신 실제 구분 — 계속 붙어
// 있는 방식만 잡이 도는 시간을 알고 나머지 둘은 6절 몫으로 비워 둔다 — 을 본다.
eq('계속 붙어 있는 방식만 잡이 도는 시간을 안다', M.READ_MODES.map(m => m.jobHours != null), [true, false, false]);

console.log('\n4절 — 예산 소진이 늦으면 잃는 노출이 곱셈과 맞나');
eq('5초에 13,195건', D.BUDGET_LATE_IMPRESSIONS, 13195);

console.log('\n4절 — lateFor 세 갈래 (Task 11 에서 js/pipeline-course-sections.js 로부터 model.js 로 옮김)');
const dashC = D.CONSUMERS.find(c => c.key === 'dash');     // 실제 방식: stream
const reportC = D.CONSUMERS.find(c => c.key === 'report'); // 실제 방식: micro
const trainC = D.CONSUMERS.find(c => c.key === 'train');   // 실제 방식: batch

eq('활성 읽는 쪽이 아니면 미리 보는 방식과 무관하게 실제 late',
   M.lateFor(dashC, 'report', 'batch'), dashC.late);
eq('활성인데 미리 보는 방식이 없으면 실제 late',
   M.lateFor(dashC, 'dash', null), dashC.late);
eq('미리 보는 방식이 실제 방식과 같으면 실제 late',
   M.lateFor(dashC, 'dash', 'stream'), dashC.late);
eq('미리 본 방식이 실제보다 뜸하면(batch) late',
   M.lateFor(dashC, 'dash', 'batch'), dashC.late);
eq('미리 본 방식이 실제보다 잦으면(stream) faster',
   M.lateFor(trainC, 'train', 'stream'), trainC.faster);
eq('리포트가 활성 — 더 뜸한 batch 를 미리 보면 late',
   M.lateFor(reportC, 'report', 'batch'), reportC.late);
eq('리포트가 활성 — 더 잦은 stream 을 미리 보면 faster',
   M.lateFor(reportC, 'report', 'stream'), reportC.faster);

console.log('\n5절 — 보존과 되감기');
eq('디스크 표는 네 줄',        M.DISK.map(d => d.days), [3, 7, 14, 30]);
eq('7일이면 32%',              M.DISK.find(d => d.days === 7).percent, 32);
eq('30일은 안 들어간다',        M.DISK.find(d => d.days === 30).percent > 100, true);
eq('보존 7일에 3일 멈추면 산다', M.retentionVerdict(7, 3), { safe: true, lostDays: 0 });
eq('보존 2일에 3일 멈추면 하루를 잃는다', M.retentionVerdict(2, 3), { safe: false, lostDays: 1 });
eq('보존 3일에 정확히 3일 멈추면(경계) 그래도 안 잃는다', M.retentionVerdict(3, 3), { safe: true, lostDays: 0 });
eq('되감기 두 점',              M.CATCHUP.map(c => c.consumers), [4, 12]);
eq('4명이면 14.1일',            M.CATCHUP[0].days, 14.1);
eq('12명이면 1.1일',            M.CATCHUP[1].days, 1.1);
eq('디스크 표 머리가 가정하는 용량은 500GB', M.DISK_CAPACITY_GB, 500);
eq('새벽 잡은 20분짜리 예시(6절 구조 상수)', M.READ_MODES.find(m => m.key === 'batch').dawnMinutes, 20);

console.log('\n6절 — 읽는 쪽마다 어떻게 읽는지와 목적지 여섯');
eq('읽는 쪽 how 넷', D.CONSUMERS.map(c => c.how),
   ['붙어서 합계만', '붙어서 한 건씩', '5분마다 모아서', '하루치를 파일로']);
eq('목적지는 여섯', D.DESTINATIONS.length, 6);
eq('목적지 이름 순서', D.DESTINATIONS.map(d => d.name),
   ['스토리지 + Iceberg', 'ClickHouse', 'OpenSearch', '리포트용 DB', '다른 팀 Kafka', '피처 스토어']);

console.log('\n7절 — req_id 로 붙여 라벨이 생기나');
const j3 = M.joinRows(D.val.joinHours);
eq('노출 여섯에 클릭 하나',  [j3.rows.length, j3.rows.filter(r => r.y === 1).length], [6, 1]);
eq('붙은 클릭은 r-8f21',     j3.rows.filter(r => r.y === 1)[0].req_id, D.val.reqId);
eq('창을 0 으로 두면 안 붙는다', M.joinRows(0).rows.filter(r => r.y === 1).length, 0);

const allPass = fail === 0;
console.log(`\n${allPass ? `✓ 전부 통과 (${pass}건)` : `✗ ${fail}건 실패 / ${pass + fail}건`}`);
process.exit(allPass ? 0 : 1);
