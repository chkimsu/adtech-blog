#!/usr/bin/env node
// 과외 데모 공용 틀(js/lesson-kit.js)의 순수 함수 시험. DOM 이 없어도 도는 부분만 본다.
//
//   node scripts/test-lesson-kit.js
const K = require('../js/lesson-kit.js');

let pass = 0, fail = 0;
function eq(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`   ${ok ? '✓' : '✗'} ${name}${ok ? '' : `\n       기대 ${JSON.stringify(want)}\n       실제 ${JSON.stringify(got)}`}`);
}

console.log('공용 틀 — 주소 인자, 그룹 끝, clamp');
const spec = { modes: ['a', 'b'], modeDefault: { a: 'p1', b: 'p2' }, presetModes: { p1: ['a', 'b'], p2: ['b'], p3: ['a'] } };
eq('인자 없음', K.parseParams('', spec), { embed: false, mode: 'a', preset: 'p1' });
eq('embed 와 mode', K.parseParams('?embed=1&mode=b', spec), { embed: true, mode: 'b', preset: 'p2' });
eq('mode 에 쓸 수 있는 preset', K.parseParams('?mode=b&preset=p1', spec), { embed: false, mode: 'b', preset: 'p1' });
eq('mode 에 쓸 수 없는 preset', K.parseParams('?mode=b&preset=p3', spec), { embed: false, mode: 'b', preset: 'p2' });
eq('preset 만', K.parseParams('?preset=p2', spec), { embed: false, mode: 'b', preset: 'p2' });
eq('모르는 mode', K.parseParams('?mode=zz&preset=p3', spec), { embed: false, mode: 'a', preset: 'p3' });
eq('모르는 preset', K.parseParams('?mode=a&preset=zz', spec), { embed: false, mode: 'a', preset: 'p1' });
const ev = [{ group: 0 }, { group: 0 }, { group: 1 }, { group: 2 }, { group: 2 }];
eq('첫 그룹 끝', K.nextGroupEnd(ev, 0), 2);
eq('그룹 가운데에서', K.nextGroupEnd(ev, 1), 2);
eq('한 칸짜리 그룹', K.nextGroupEnd(ev, 2), 3);
eq('마지막 그룹', K.nextGroupEnd(ev, 3), 5);
eq('끝에서', K.nextGroupEnd(ev, 5), 5);
eq('clamp 음수', K.clamp(-1, 5), 0);
eq('clamp 넘침', K.clamp(9, 5), 5);

console.log('\n공용 틀 — 조사 고르기(particle)');
eq('목록 뒤 을', K.particle('[6, 7]', '을', '를'), '[6, 7]을');
eq('목록 뒤 를', K.particle('[0, 2]', '을', '를'), '[0, 2]를');
eq('영문 n 은 받침', K.particle('seen', '이', '가'), 'seen이');
eq('7 은 ㄹ 받침이라 로', K.particle('7', '으로', '로'), '7로');
eq('3 은 으로', K.particle('3', '으로', '로'), '3으로');
eq('한글 받침 은', K.particle('창', '은', '는'), '창은');
eq('한글 겹받침 과', K.particle('값', '과', '와'), '값과');
eq('받침 없는 한글 와', K.particle('키', '과', '와'), '키와');
eq('2 는 받침 없음', K.particle('2', '이', '가'), '2가');
eq('0 은 받침 있음', K.particle('0', '을', '를'), '0을');
eq('괄호와 따옴표는 건너뜀', K.particle('(3)', '을', '를'), '(3)을');
eq('한글 ㄹ 받침 으로', K.particle('물', '으로', '로'), '물로');
eq('빈 글자', K.particle('', '을', '를'), '를');

const allPass = fail === 0;
console.log(`\n${allPass ? `✓ 전부 통과 (${pass}건)` : `✗ ${fail}건 실패 / ${pass + fail}건`}`);
process.exit(allPass ? 0 : 1);
