/**
 * 과외 슬라이딩 윈도우 데모 — 화면
 *   js/lesson-sliding-window-demo.js
 *
 * 계산은 js/lesson-sliding-window-model.js 의 LessonSlidingWindow, 단계 재생과 부품은 js/lesson-kit.js 의 LessonKit 이 한다.
 * 화면 상태는 「이벤트를 몇 개까지 보였나」(at) 하나이고, render(at) 가 그때마다 이벤트를 처음부터 다시 쌓아 그린다.
 * 「다음 윈도우」 버튼(#lk-group)은 이벤트의 group 이 같은 동안을 한 번에 넘긴다.
 *
 * 주소 약속 — demo-lesson-sliding-window.html?embed=1&mode=<slide|resum|distinct>&preset=<PRESETS 키>
 *   인자가 없으면 slide 모드의 max-sum 이다. 입력 목록은 지금 모드에서 쓸 수 있는 입력만 보인다.
 *   블로그 글이 이 주소 넷을 iframe 으로 쓴다: slide + max-sum, resum + longer, slide + leetcode-643, distinct + pwwkew.
 */
(function () {
  'use strict';

  const W = window.LessonSlidingWindow;
  const K = window.LessonKit;
  if (!W || !K) return;

  const $ = (id) => document.getElementById(id);
  const { list } = W;
  const P = (text, withFinal, withoutFinal) => K.particle(String(text), withFinal, withoutFinal);
  const fmt = (v) => (v < 0 ? `(${v})` : String(v));
  const comma = (n) => n.toLocaleString('en-US');

  const MODE_LABEL = { slide: '빼고 더하는 풀이', resum: '매번 다 더하는 풀이', distinct: '중복 없는 부분 문자열' };

  const LEGEND = {
    slide: [['is-window', '윈도우'], ['is-in', '들어온 값'], ['is-out', '나간 값'], ['is-hit', '최대 합 윈도우']],
    resum: [['is-window', '윈도우'], ['is-in', '방금 더한 값'], ['is-hit', '최대 합 윈도우']],
    distinct: [['is-window', '윈도우'], ['is-now', '지금 보는 글자'], ['is-in', '넣은 글자'], ['is-out', '뺀 글자'], ['is-hit', '가장 긴 윈도우']],
  };

  const SPEC = { modes: W.MODES, modeDefault: W.MODE_DEFAULT, presetModes: W.PRESET_MODES };

  const S = { mode: 'slide', key: 'max-sum', nums: [], k: 0, s: '', trace: null, events: [], player: null };

  // 해설 칸 문장 (js/demo-edu-content.js 의 lesson-sliding-window 항목이 부른다). 지금 모드로 그 입력의 결과를 적는다.
  window.lessonSlidingWindowDescribe = (key) => W.describe(S.mode, key);

  const presetLabel = (key) => {
    const p = W.PRESETS[key];
    return p.s !== undefined ? `s "${p.s}"` : `nums ${list(p.nums)}, k ${p.k}`;
  };

  const note = () => {
    if (S.mode === 'slide') return `크기가 ${S.k}인 윈도우를 한 칸 옮길 때 나간 값 하나를 빼고 들어온 값 하나를 더합니다. 첫 윈도우만 ${S.k}개를 모두 더합니다.`;
    if (S.mode === 'resum') return `크기가 ${S.k}인 윈도우를 한 칸 옮길 때마다 윈도우 안의 ${S.k}개를 처음부터 다시 더합니다.`;
    return '오른쪽 끝 r 을 한 칸씩 늘립니다. 새 글자가 윈도우에 이미 있으면 왼쪽 끝 l 의 글자를 중복이 사라질 때까지 뺍니다. 윈도우가 지금까지보다 길 때만 best 를 바꿉니다.';
  };

  function retrace() {
    const p = W.PRESETS[S.key];
    if (S.mode === 'distinct') {
      S.s = p.s;
      S.nums = p.s.split('');
      S.k = 0;
      S.trace = W.distinctTrace(p.s);
    } else {
      S.nums = p.nums;
      S.k = p.k;
      S.trace = S.mode === 'slide' ? W.slideTrace(p.nums, p.k) : W.resumTrace(p.nums, p.k);
    }
    S.events = S.trace.events;
  }

  function fillPresets() {
    const sel = $('lk-preset');
    sel.replaceChildren();
    Object.keys(W.PRESETS).filter((k) => W.PRESET_MODES[k].includes(S.mode)).forEach((k) => {
      const o = document.createElement('option');
      o.value = k;
      o.textContent = presetLabel(k);
      sel.appendChild(o);
    });
    sel.value = S.key;
  }

  function drawTabs() {
    K.tabs($('lk-tabs'), W.MODES.map((m) => ({ key: m, label: MODE_LABEL[m] })), S.mode, (m) => {
      S.mode = m;
      if (!W.PRESET_MODES[S.key].includes(m)) S.key = W.MODE_DEFAULT[m];
      change();
    });
  }

  // 입력이나 모드가 바뀌면 처음부터 다시 쌓는다
  function change() {
    retrace();
    fillPresets();
    drawTabs();
    $('lk-note').textContent = note();
    K.legend($('lk-legend'), LEGEND[S.mode]);
    $('lk-state-label').textContent = S.mode === 'distinct' ? '윈도우 안의 글자 set' : '윈도우 합과 연산 수';
    S.player.restart();
  }

  const win = (start) => S.nums.slice(start, start + S.k);

  // 지금 이벤트까지 보였을 때 최대 합 (아직 완성된 윈도우가 없으면 null)
  function bestSoFar(shown) {
    const done = shown.filter((ev) => (S.mode === 'slide'
      ? (ev.type === 'move' || ev.idx === S.k - 1)
      : ev.idx === ev.start + S.k - 1));
    if (!done.length) return null;
    return Math.max(...done.map((ev) => (ev.type === 'move' ? ev.sum : ev.partial)));
  }

  // ---- 이번 단계 문장 ----
  function nowText(e, shown) {
    if (!e) return '「한 칸」이나 「다음 윈도우」를 누르면 시작합니다.';
    if (S.mode === 'distinct') return distinctNow(e, shown);
    const before = bestSoFar(shown.slice(0, -1));
    const after = bestSoFar(shown);
    if (e.type === 'move') {
      const prev = S.trace.sums[e.start - 1];
      const bestText = e.sum > before
        ? `최대 합이 ${before}에서 ${P(e.sum, '으로', '로')} 바뀝니다.`
        : `최대 합은 ${before} 그대로입니다.`;
      return `윈도우가 ${list(win(e.start - 1))}에서 ${P(list(win(e.start)), '으로', '로')} 옮겨 갑니다. ` +
        `나간 ${P(e.out, '을', '를')} 빼고 들어온 ${P(e.in, '을', '를')} 더해 ${prev} - ${fmt(e.out)} + ${fmt(e.in)} = ${e.sum}입니다. ` +
        `이 한 번에 연산이 2번 듭니다. ${bestText}`;
    }
    const v = S.nums[e.idx];
    const prevPartial = e.partial - v;
    const plus = `${prevPartial} + ${fmt(v)} = ${e.partial}`;
    const last = e.idx === e.start + S.k - 1;
    if (S.mode === 'slide') {
      return `첫 윈도우를 만듭니다. 인덱스 ${e.idx}의 ${P(v, '을', '를')} 더해 ${plus}입니다.` +
        (last ? ` 첫 윈도우 ${list(win(0))}의 합이 ${P(e.partial, '으로', '로')} 정해졌습니다. 연산은 ${S.k}번 들었습니다.` : '');
    }
    let tail = '';
    if (last) {
      tail = ` 윈도우 합은 ${e.partial}이고 이 윈도우에 연산이 ${S.k}번 들었습니다.`;
      if (e.start > 0) {
        tail += e.partial > before
          ? ` 최대 합이 ${before}에서 ${P(e.partial, '으로', '로')} 바뀝니다.`
          : ` 최대 합은 ${after} 그대로입니다.`;
      }
    }
    return `윈도우 ${list(win(e.start))}의 합을 처음부터 ${e.start > 0 ? '다시 ' : ''}더합니다. 인덱스 ${e.idx}의 ${P(v, '을', '를')} 더해 ${plus}입니다.${tail}`;
  }

  function distinctNow(e, shown) {
    const prevBest = shown.slice(0, -1).reduce((b, ev) => (ev.type === 'add' ? ev.best : b), 0);
    const r = e.group;
    const nw = S.s[r];
    if (e.type === 'drop') {
      const left = e.set.includes(nw)
        ? `윈도우에 ${P(nw, '이', '가')} 아직 남아 있어 더 뺍니다.`
        : '이제 중복이 사라졌습니다.';
      return `r = ${r}, 새 글자 ${P(nw, '이', '가')} 윈도우에 이미 있습니다. 맨 왼쪽의 ${P(e.ch, '을', '를')} 빼고 l 을 ${e.l}에서 ${P(e.l + 1, '으로', '로')} 옮깁니다. ${left}`;
    }
    const len = e.set.length;
    const dup = shown.length > 1 && shown[shown.length - 2].type === 'drop' && shown[shown.length - 2].group === r;
    const bestText = len > prevBest
      ? `best 가 ${prevBest}에서 ${P(len, '으로', '로')} 바뀝니다.`
      : `best 는 ${e.best} 그대로입니다.`;
    const put = dup ? `중복이 사라져 새 글자 ${P(nw, '을', '를')} 넣습니다.` : `새 글자 ${P(nw, '은', '는')} 윈도우에 없어 그대로 넣습니다.`;
    return `r = ${r}, ${put} 윈도우는 "${e.set.join('')}", 길이는 ${len}입니다. ${bestText}`;
  }

  // ---- 보드 ----
  function drawBoard(shown, done) {
    const e = shown[shown.length - 1];
    const cls = {};
    const ptr = {};
    let range = null;
    if (done) {
      // 끝에서는 답인 윈도우를 보인다
      if (S.mode === 'distinct') {
        const [l, r] = S.trace.bestRange;
        if (r >= l) range = [l, r];
      } else if (S.trace.bestStart >= 0) {
        range = [S.trace.bestStart, S.trace.bestStart + S.k - 1];
      }
      if (range) for (let i = range[0]; i <= range[1]; i++) cls[i] = 'is-hit';
    } else if (e && S.mode === 'distinct') {
      const r = e.group;
      if (e.type === 'drop') {
        cls[e.l] = 'is-out';
        cls[r] = 'is-now';
        range = [e.l + 1, r - 1];
        ptr[e.l + 1] = 'l';
        ptr[r] = ptr[r] ? `${ptr[r]}, r` : 'r';
      } else {
        cls[r] = 'is-in';
        range = [e.l, r];
        ptr[e.l] = 'l';
        ptr[r] = ptr[r] ? `${ptr[r]}, r` : 'r';
      }
    } else if (e && e.type === 'move') {
      range = [e.start, e.start + S.k - 1];
      cls[e.start - 1] = 'is-out';
      cls[e.start + S.k - 1] = 'is-in';
      ptr[e.start - 1] = '뺌';
      ptr[e.start + S.k - 1] = '더함';
    } else if (e) {
      range = S.mode === 'slide' ? [0, e.idx] : [e.start, e.start + S.k - 1];
      cls[e.idx] = 'is-in';
      ptr[e.idx] = '더함';
    }
    K.array($('lk-board'), S.nums, { cls, ptr, range });
  }

  // ---- 상태 칸 ----
  function drawState(shown) {
    const e = shown[shown.length - 1];
    const stateNote = $('lk-state-note');
    if (S.mode === 'distinct') {
      const items = e ? e.set.map((c, i) => ({ text: c, cls: e.type === 'add' && i === e.set.length - 1 ? 'is-in' : '' })) : [];
      K.chips($('lk-state'), items, '비어 있음');
      const best = shown.reduce((b, ev) => (ev.type === 'add' ? ev.best : b), 0);
      stateNote.textContent = `윈도우 안에 같은 글자가 둘 들어가지 않게 set 으로 중복을 확인합니다. 지금 윈도우 길이는 ${e ? e.set.length : 0}, best 는 ${best}입니다.`;
      return;
    }
    const best = bestSoFar(shown);
    const items = [];
    if (e) {
      items.push({ text: `윈도우 합 ${e.type === 'move' ? e.sum : e.partial}` });
      items.push({ text: `연산 수 ${e.ops}번` });
      if (best !== null) items.push({ text: `최대 합 ${best}` });
    }
    K.chips($('lk-state'), items, '아직 더하지 않았습니다');
    stateNote.textContent = S.mode === 'slide'
      ? `첫 윈도우에만 연산이 ${S.k}번 들고, 윈도우를 한 번 옮길 때마다 빼기 1번과 더하기 1번, 모두 2번입니다.`
      : `윈도우를 한 번 옮길 때마다 윈도우 안의 ${S.k}개를 처음부터 더하므로 연산이 ${S.k}번씩 듭니다.`;
  }

  // ---- 결과 칸 ----
  function lines(sub, texts) {
    sub.replaceChildren();
    texts.forEach((t) => {
      const d = document.createElement('div');
      d.textContent = t;
      sub.appendChild(d);
    });
  }

  function drawResult(shown, done) {
    const main = $('lk-result-main');
    const sub = $('lk-result-sub');
    const e = shown[shown.length - 1];
    if (!done) {
      main.textContent = '아직 답이 없습니다';
      if (S.mode === 'distinct') {
        lines(sub, [`지금까지 best ${shown.reduce((b, ev) => (ev.type === 'add' ? ev.best : b), 0)}`]);
      } else {
        lines(sub, [`지금까지 연산 ${e ? e.ops : 0}번`]);
      }
      return;
    }
    if (S.mode === 'distinct') {
      const { best, bestRange: [l, r] } = S.trace;
      const drops = S.events.filter((ev) => ev.type === 'drop').length;
      const ties = S.events.filter((ev) => ev.type === 'add' && ev.r > r && ev.set.length === best).length;
      main.textContent = `best ${best}`;
      lines(sub, [
        `가장 긴 중복 없는 부분 문자열은 인덱스 ${l}부터 ${r}까지의 "${S.s.slice(l, r + 1)}"입니다.`,
        ties ? `길이 ${best}의 윈도우가 ${ties}개 더 나왔지만 더 길지 않아 best 를 바꾸지 않았습니다.` : '',
        `r 은 ${S.s.length}번, l 은 ${drops}번 움직였습니다. 둘 다 앞으로만 가서 합이 글자 수 ${S.s.length}의 두 배를 넘지 않습니다.`,
      ].filter(Boolean));
      return;
    }
    const { best, bestStart, sums } = S.trace;
    const slideOps = W.slideTrace(S.nums, S.k).ops;
    const resumOps = W.resumTrace(S.nums, S.k).ops;
    const big = W.opsCount(100000, 50000);
    const same = sums.filter((v) => v === best).length - 1;
    main.textContent = S.key === 'leetcode-643' ? `최대 합 ${best}, 평균 ${best} / ${S.k} = ${best / S.k}` : `최대 합 ${best}`;
    lines(sub, [
      `최대 합 윈도우는 인덱스 ${bestStart}부터 ${bestStart + S.k - 1}까지의 ${list(win(bestStart))}입니다.` + (same ? ` 같은 합의 윈도우가 ${same}개 더 있어 먼저 나온 윈도우를 보입니다.` : ''),
      `같은 입력에서 빼고 더하기 ${slideOps}번, 다 더하기 ${resumOps}번입니다.`,
      `데이터 10만 개, 윈도우 크기 5만이면 다 더하기 ${comma(big.resum)}번, 빼고 더하기 ${comma(big.slide)}번입니다.`,
    ]);
  }

  // 끝에서는 보드가 마지막 단계 대신 답인 윈도우를 칠하므로, 마지막 단계 문장 뒤에 그것을 적는다
  function doneText() {
    if (S.mode === 'distinct') {
      const [l, r] = S.trace.bestRange;
      return ` 마지막 글자라 여기서 끝납니다. 배열에는 가장 긴 윈도우 ${P(`"${S.s.slice(l, r + 1)}"`, '을', '를')} 표시했습니다.`;
    }
    return ` 마지막 윈도우라 여기서 끝납니다. 배열에는 최대 합 윈도우 ${P(list(win(S.trace.bestStart)), '을', '를')} 표시했습니다.`;
  }

  function render(at) {
    const shown = S.events.slice(0, at);
    const e = shown[shown.length - 1];
    const done = at >= S.events.length && at > 0;
    drawBoard(shown, done);
    drawState(shown);
    drawResult(shown, done);
    $('lk-now').textContent = nowText(e, shown) + (done ? doneText() : '');
  }

  // ==========================================
  // 시작
  // ==========================================

  const params = K.parseParams(location.search, SPEC);
  S.mode = params.mode;
  S.key = params.preset;
  S.player = K.player({ total: () => S.events.length, events: () => S.events, render });
  $('lk-preset').addEventListener('change', (ev) => {
    S.key = ev.target.value;
    change();
  });
  change();
})();
