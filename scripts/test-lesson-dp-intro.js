#!/usr/bin/env node
// 과외 DP 입문 데모(js/lesson-dp-intro-model.js)의 계산 시험.
// 기대값은 Python 3.9.7 로 센 값이다.
//
//   node scripts/test-lesson-dp-intro.js
const M = require('../js/lesson-dp-intro-model.js');

let pass = 0, fail = 0;
function eq(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`   ${ok ? '✓' : '✗'} ${name}${ok ? '' : `\n       기대 ${JSON.stringify(want)}\n       실제 ${JSON.stringify(got)}`}`);
}
const P = M.PRESETS;
const steps = (t, type) => t.events.filter((e) => e.type === type).map((e) => e.step);
const a = M.callTrace(P['climb-5'].n, false);
eq('n 5 그냥 재귀 답과 호출', [a.answer, a.calls], [8, 9]);
eq('n 5 그냥 재귀 호출 순서', steps(a, 'call'), [5, 4, 3, 2, 1, 2, 3, 2, 1]);
eq('n 5 그냥 재귀 바닥과 계산', [steps(a, 'base'), a.events.filter((e) => e.type === 'return').map((e) => [e.step, e.value])], [[2, 1, 2, 2, 1], [[3, 3], [4, 5], [3, 3], [5, 8]]]);
eq('n 5 그냥 재귀 그룹 수', a.events[a.events.length - 1].group + 1, 9);
eq('n 5 호출 트리', [a.nodes.c0, a.nodes.c1, a.nodes.c6], [{ step: 5, left: 'c1', right: 'c6' }, { step: 4, left: 'c2', right: 'c5' }, { step: 3, left: 'c7', right: 'c8' }]);
const m = M.callTrace(P['climb-5'].n, true);
eq('n 5 메모 재귀 답과 호출', [m.answer, m.calls, m.memo], [8, 7, { 3: 3, 4: 5, 5: 8 }]);
eq('n 5 메모 재귀 순서', m.events.map((e) => e.type), ['call', 'call', 'call', 'call', 'base', 'call', 'base', 'return', 'call', 'base', 'return', 'call', 'hit', 'return']);
eq('n 5 메모에서 꺼낸 값', m.events.filter((e) => e.type === 'hit').map((e) => [e.id, e.step, e.value]), [['c6', 3, 3]]);
eq('n 6 호출 수', [M.callTrace(6, false).calls, M.callTrace(6, true).calls], [15, 9]);
const tc = M.tableClimb(5);
eq('계단 표', [tc.answer, tc.dp, tc.events.map((e) => e.group)], [8, [null, 1, 2, 3, 5, 8], ['base', 'base', 3, 4, 5]]);
eq('계단 두 변수', tc.events.filter((e) => e.type === 'fill').map((e) => e.prev), [[2, 3], [3, 5], [5, 8]]);
const r5 = M.tableRob(P['rob-5'].nums);
eq('집 털기 표', [r5.answer, r5.dp, r5.picks, r5.houses], [12, [2, 7, 11, 11, 12], ['take', 'skip', 'take'], [0, 2, 4]]);
eq('집 털기 비교 값', r5.events.filter((e) => e.type === 'fill').map((e) => [e.i, e.take, e.skip]), [[2, 11, 7], [3, 10, 11], [4, 12, 11]]);
const r4 = M.tableRob(P['rob-4'].nums);
eq('집 털기 예제 1', [r4.answer, r4.dp, r4.picks, r4.houses], [4, [1, 2, 4, 4], ['take', 'skip'], [0, 2]]);
eq('해설 칸 문장', [M.describe('table', 'climb-5'), M.describe('table', 'climb-6')], [
  '계단 5칸을 오르는 방법은 8가지입니다. 기저 칸 dp[1], dp[2] 를 적은 뒤 나머지 칸 3개를 점화식으로 한 번씩 계산합니다.',
  '계단 6칸을 오르는 방법은 13가지입니다. 기저 칸 dp[1], dp[2] 를 적은 뒤 나머지 칸 4개를 점화식으로 한 번씩 계산합니다.',
]);

// ---- 화면 문장 ----
// 데모 JS(js/lesson-dp-intro-demo.js)를 가짜 DOM 위에서 돌려 탭과 입력마다 「한 칸」을 끝까지 한 단계씩 누르고,
// 단계마다 화면에 적힌 글자에 null, undefined, NaN 이 없는지 본다. LessonKit 은 진짜 파일을 쓴다.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function fakeDom() {
  const byId = {};
  function el(tag) {
    const e = {
      tagName: tag, id: '', className: '', children: [], listeners: {}, dataset: {}, attrs: {}, value: '', disabled: false, type: '', title: '',
      _text: '',
      style: { setProperty() {} },
      classList: { add(c) { e.className = `${e.className} ${c}`.trim(); } },
      get textContent() { return e._text + e.children.map((c) => c.textContent).join(' '); },
      set textContent(t) { e._text = String(t); e.children = []; },
      appendChild(c) { e.children.push(c); return c; },
      replaceChildren(...cs) { e._text = ''; e.children = cs; },
      setAttribute(k, v) { e.attrs[k] = v; },
      addEventListener(type, fn) { (e.listeners[type] = e.listeners[type] || []).push(fn); },
      fire(type) { (e.listeners[type] || []).forEach((fn) => fn({ target: e })); },
    };
    return e;
  }
  const ids = ['lk-tabs', 'lk-preset', 'lk-note', 'lk-reset', 'lk-step', 'lk-group', 'lk-end', 'lk-count', 'dp-hint', 'lk-board', 'dp-tree', 'dp-nums', 'dp-table',
    'lk-legend', 'lk-result-main', 'lk-result-sub', 'lk-now', 'lk-state-label', 'lk-state', 'lk-state-note'];
  ids.forEach((id) => { byId[id] = el('div'); byId[id].id = id; });
  return {
    byId,
    document: { getElementById: (id) => byId[id] || null, createElement: (tag) => el(tag), createElementNS: (ns, tag) => el(tag) },
  };
}

function loadDemo(search) {
  const dom = fakeDom();
  const ctx = { document: dom.document, location: { search }, URLSearchParams, console };
  ctx.window = ctx;
  vm.createContext(ctx);
  ['lesson-kit.js', 'lesson-dp-intro-model.js', 'lesson-dp-intro-demo.js'].forEach((f) => {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8'), ctx, { filename: f });
  });
  return dom.byId;
}

const SHOWN = ['lk-note', 'lk-count', 'lk-group', 'dp-hint', 'dp-tree', 'dp-nums', 'dp-table', 'lk-legend', 'lk-result-main', 'lk-result-sub', 'lk-now', 'lk-state-label', 'lk-state', 'lk-state-note'];
const screen = (ui) => Object.fromEntries(SHOWN.map((id) => [id, ui[id].textContent]));
const BAD = /null|undefined|NaN|\[object/;

// 탭과 입력마다 「한 칸」으로 끝까지 가며 단계별 화면을 모은다
function walk(mode, key) {
  const ui = loadDemo(`?mode=${mode}&preset=${key}`);
  const shots = [screen(ui)];
  for (let guard = 0; !ui['lk-step'].disabled && guard < 200; guard++) {
    ui['lk-step'].fire('click');
    shots.push(screen(ui));
  }
  return shots;
}

const walks = {};
M.MODES.forEach((mode) => Object.keys(P).filter((k) => M.PRESET_MODES[k].includes(mode)).forEach((key) => { walks[`${mode} ${key}`] = walk(mode, key); }));
const badSteps = [];
Object.keys(walks).forEach((name) => walks[name].forEach((s, at) => {
  Object.keys(s).forEach((id) => { if (BAD.test(s[id])) badSteps.push(`${name} 단계 ${at} #${id}: ${s[id]}`); });
}));
eq(`탭과 입력 ${Object.keys(walks).length}벌의 모든 단계에 null, undefined, NaN 이 없음`, badSteps, []);
eq('단계 수', Object.keys(walks).map((n) => `${n} ${walks[n].length - 1}`), ['calls climb-5 18', 'calls climb-6 30', 'memo climb-5 14', 'memo climb-6 18', 'table climb-5 5', 'table climb-6 6', 'table rob-5 5', 'table rob-4 4']);

// 집 털기 표의 「한 칸」 두 단계 — 기저 칸을 하나씩 적는다
eq('집 털기 rob-5 단계 1, 2 의 이번 단계 칸', [walks['table rob-5'][1]['lk-now'], walks['table rob-5'][2]['lk-now']], [
  '0번 집까지만 보면 그 집을 털어 dp[0] = nums[0] = 2를 적습니다.',
  '1번 집까지 보면 둘 중 큰 쪽을 털어 dp[1] = max(2, 7) = 7을 적습니다. 기저 칸 dp[0], dp[1] 은 점화식 없이 이렇게 먼저 적습니다.',
]);
// 기저 칸을 채운 뒤의 상태 칸 — 「아직 채운 칸이 없습니다」가 아니다
const st = (name, at) => [walks[name][at]['lk-state-label'], walks[name][at]['lk-state'], walks[name][at]['lk-state-note']];
eq('계단 표 상태 칸(단계 1, 2, 3)', [st('table climb-5', 1), st('table climb-5', 2), st('table climb-5', 3)], [
  ['다음 칸이 읽을 두 칸', '다음 칸 dp[2] 도 기저 칸입니다', '기저 칸 dp[1] 을 적었습니다.'],
  ['다음 칸이 읽을 두 칸', 'dp[i - 1] 1 dp[i] 2', 'i = 2. 다음 칸은 이 두 값만 있으면 구할 수 있습니다.'],
  ['다음 칸이 읽을 두 칸', 'dp[i - 1] 2 dp[i] 3', 'i = 3. 다음 칸은 이 두 값만 있으면 구할 수 있습니다.'],
]);
eq('집 털기 표 상태 칸(단계 2, 4)', [st('table rob-5', 2), st('table rob-5', 4)], [
  ['두 경우', '2번 집부터 나옵니다', '기저 칸 dp[0], dp[1] 을 적었습니다.'],
  ['두 경우', '턴 경우 10 쉰 경우 11', 'i = 3. 큰 쪽 11을 dp[3] 에 적었습니다.'],
]);
// 메모 재귀의 조사 — 값에 따라 이/가, 을/를
const nowAll = (name) => walks[name].map((s) => s['lk-now']).join('\n');
eq('메모 재귀 문장의 조사', [
  /메모에 5가 없어/.test(nowAll('memo climb-5')), /메모에 4: 5를 적습니다/.test(nowAll('memo climb-5')), /메모에 4: 5가 있습니다/.test(nowAll('memo climb-6')), /메모에 3: 3이 있어/.test(nowAll('memo climb-5')),
  /[0-9] (이|을) /.test(nowAll('memo climb-5') + nowAll('memo climb-6')),
], [true, true, true, true, false]);

console.log(`\n${pass} 통과, ${fail} 실패`);
process.exit(fail ? 1 : 0);
