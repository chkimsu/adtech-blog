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

const allPass = fail === 0;
console.log(`\n${allPass ? `✓ 전부 통과 (${pass}건)` : `✗ ${fail}건 실패 / ${pass + fail}건`}`);
process.exit(allPass ? 0 : 1);
