/* 로그 → ML 학습 루프 — 경량 SVG 파이프라인 다이어그램 + 단계 재생 (자동재생 수동) */
(function () {
  'use strict';

  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // viewBox 600 x 1010, 박스: x=60 w=350 (center 235), 오른쪽은 순환 화살표 여백
  var BX = 60, BW = 350, CX = 235;

  // 위→아래 파이프라인. y=윗변, h=높이
  var NODES = [
    { id: 'user',    y: 24,  h: 58,  t: '사용자 행동',        s: '광고를 보고 · 누르고 · 산다' },
    { id: 'logs',    y: 112, h: 134, t: '로그가 쌓인다',       s: '', logs: true },
    { id: 'join',    y: 286, h: 70,  t: '조인 · 라벨링',       s: '노출⨝클릭 = pCTR 정답 · 클릭⨝전환 = pCVR 정답' },
    { id: 'feature', y: 396, h: 58,  t: 'Feature Store (피처 창고)', s: '원시 로그를 숫자 피처로 — 312개' },
    { id: 'dataset', y: 494, h: 58,  t: '학습 데이터셋',       s: '피처 + 정답(라벨) — 8.5억 행' },
    { id: 'train',   y: 592, h: 58,  t: '모델 학습',           s: 'DeepFM 재학습 · AUC 0.781 → 0.792' },
    { id: 'calib',   y: 690, h: 58,  t: 'Calibration (보정)',  s: '예측 평균 2.1% → 실제 2.4%' },
    { id: 'deploy',  y: 788, h: 58,  t: '배포 (Canary)',       s: '트래픽 5% → 100%' },
    { id: 'serve',   y: 886, h: 62,  t: '입찰 · 서빙',         s: '새 모델 반영 · ROAS +4%' }
  ];
  var NODE_BY = {};
  NODES.forEach(function (n) { NODE_BY[n.id] = n; });

  var STEPS = [
    { id: 'user',    cap: '사용자가 광고를 보고·누르고·산다. 모든 로그의 시작점이다.' },
    { id: 'logs',    cap: '그 행동이 노출·클릭·전환 로그로 통째로 쌓인다. (어제 노출 1.2억 · 클릭 240만)', count: true },
    { id: 'join',    cap: '로그를 이어 붙여 ‘정답’을 만든다 — 노출⨝클릭으로 눌렀나(pCTR), 클릭⨝전환으로 샀나(pCVR). 전환은 며칠 뒤 도착해 라벨이 늦는다(지연 피드백).' },
    { id: 'feature', cap: '원시 로그를 “최근 7일 클릭률” 같은 숫자(피처)로 가공해 Feature Store에 312개.' },
    { id: 'dataset', cap: '피처에 정답을 붙여 학습 데이터셋을 만든다 — 8.5억 행.' },
    { id: 'train',   cap: '새 데이터로 모델을 다시 학습한다 — DeepFM, 검증 AUC 0.781 → 0.792.' },
    { id: 'calib',   cap: '예측을 실제 분포에 맞게 보정한다 — 평균 2.1% → 2.4%. 안 하면 입찰가가 통째로 틀어진다.' },
    { id: 'deploy',  cap: '검증 통과한 새 모델을 일부 트래픽부터 조심스레 올린다 — 카나리 5% → 100%.' },
    { id: 'serve',   cap: '새 모델로 입찰·서빙(ROAS +4%). 그 입찰이 다시 새 로그를 만든다 → 매일 이 순환을 돈다.', loop: true }
  ];

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // 줄바꿈 지원 텍스트(<tspan>)
  function textLines(x, y, cls, lines, lh) {
    var out = '<text class="' + cls + '" x="' + x + '" y="' + y + '" text-anchor="middle">';
    for (var i = 0; i < lines.length; i++) {
      out += '<tspan x="' + x + '" dy="' + (i === 0 ? 0 : lh) + '">' + esc(lines[i]) + '</tspan>';
    }
    return out + '</text>';
  }

  function nodeSVG(n) {
    var g = '<g class="logml-node" data-node="' + n.id + '">';
    g += '<rect class="box" x="' + BX + '" y="' + n.y + '" width="' + BW + '" height="' + n.h + '" rx="10"/>';
    g += '<rect class="bar" x="' + BX + '" y="' + n.y + '" width="5" height="' + n.h + '" rx="2.5"/>';

    if (n.logs) {
      // 제목 + 3개 로그 칩(노출/클릭/전환)
      g += textLines(CX, n.y + 26, 't', ['로그가 쌓인다'], 0);
      var chips = [
        { lbl: '노출 (Impression)', id: 'cnt-imp', val: '0' },
        { lbl: '클릭 (Click)', id: 'cnt-click', val: '0' },
        { lbl: '전환 (Conversion)', id: 'cnt-conv', val: '며칠 뒤 ⏳' }
      ];
      var cw = 108, gap = 13, total = cw * 3 + gap * 2, startX = CX - total / 2;
      var cy = n.y + 44, ch = 62;
      for (var i = 0; i < chips.length; i++) {
        var cxp = startX + i * (cw + gap);
        g += '<g class="logml-chip">';
        g += '<rect x="' + cxp + '" y="' + cy + '" width="' + cw + '" height="' + ch + '" rx="7"/>';
        g += '<text class="lbl" x="' + (cxp + cw / 2) + '" y="' + (cy + 22) + '" text-anchor="middle">' + esc(chips[i].lbl) + '</text>';
        g += '<text class="val" id="' + chips[i].id + '" x="' + (cxp + cw / 2) + '" y="' + (cy + 45) + '" text-anchor="middle">' + esc(chips[i].val) + '</text>';
        g += '</g>';
      }
    } else {
      var lines = n.s ? [n.t] : [n.t];
      g += textLines(CX, n.y + (n.s ? n.h / 2 - 4 : n.h / 2 + 5), 't', [n.t], 0);
      if (n.s) g += textLines(CX, n.y + n.h / 2 + 17, 's', [n.s], 0);
    }
    g += '</g>';
    return g;
  }

  function buildSVG() {
    var svg = '<svg id="logml-svg" class="logml-svg" viewBox="0 0 600 1010" preserveAspectRatio="xMidYMid meet" role="img" aria-label="로그가 쌓여 ML 모델이 학습되는 순환 다이어그램">';
    svg += '<defs><marker id="logml-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z"/></marker></defs>';

    // 연결선(세로) — 박스 사이
    var edges = '';
    for (var i = 0; i < NODES.length - 1; i++) {
      var a = NODES[i], b = NODES[i + 1];
      var y1 = a.y + a.h, y2 = b.y;
      edges += '<line class="logml-edge" data-edge="' + b.id + '" x1="' + CX + '" y1="' + y1 + '" x2="' + CX + '" y2="' + y2 + '"/>';
      // 작은 화살촉(아래 방향)
      edges += '<path class="logml-tip" d="M' + (CX - 5) + ' ' + (y2 - 7) + ' L' + CX + ' ' + (y2 - 1) + ' L' + (CX + 5) + ' ' + (y2 - 7) + '"/>';
    }

    // 순환 화살표: serve 오른쪽 → 위로 → user 오른쪽으로
    var sv = NODE_BY.serve, us = NODE_BY.user;
    var sy = sv.y + sv.h / 2, uy = us.y + us.h / 2;
    var loop = '<path id="logml-loop" class="logml-loop" marker-end="url(#logml-ah)" d="M' + (BX + BW) + ' ' + sy +
      ' C 560 ' + sy + ' 560 ' + uy + ' ' + (BX + BW) + ' ' + uy + '"/>';
    loop += '<text class="logml-loop-label" x="556" y="' + ((sy + uy) / 2) + '" text-anchor="middle" transform="rotate(90 556 ' + ((sy + uy) / 2) + ')">다시 입찰 → 새 로그 · 매일 반복</text>';

    var nodes = '';
    NODES.forEach(function (n) { nodes += nodeSVG(n); });

    svg += edges + loop + nodes + '</svg>';
    return svg;
  }

  function init() {
    var diagram = document.getElementById('logml-diagram');
    if (!diagram) return;
    diagram.innerHTML = buildSVG();

    var svg = document.getElementById('logml-svg');
    var elStep = document.getElementById('logml-step');
    var elCap = document.getElementById('logml-caption');
    var btnPrev = document.getElementById('logml-prev');
    var btnNext = document.getElementById('logml-next');
    var btnPlay = document.getElementById('logml-play');
    var elDots = document.getElementById('logml-dots');

    var N = STEPS.length;
    var i = 0;
    var playing = false;
    var timer = null;
    var countDone = false;

    var nodeEls = {}, edgeEls = {};
    svg.querySelectorAll('.logml-node').forEach(function (g) { nodeEls[g.getAttribute('data-node')] = g; });
    svg.querySelectorAll('.logml-edge').forEach(function (e) { edgeEls[e.getAttribute('data-edge')] = e; });
    var loopEl = document.getElementById('logml-loop');

    // dots
    var dots = [];
    for (var d = 0; d < N; d++) {
      (function (idx) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'ecoeasy-dot';
        b.setAttribute('aria-label', (idx + 1) + '단계로');
        b.addEventListener('click', function () { stop(); go(idx); });
        elDots.appendChild(b); dots.push(b);
      })(d);
    }

    function setCounts(impT, clkT) {
      var imp = document.getElementById('cnt-imp'), clk = document.getElementById('cnt-click');
      if (imp) imp.textContent = impT;
      if (clk) clk.textContent = clkT;
    }
    function animateCounts() {
      var imp = document.getElementById('cnt-imp'), clk = document.getElementById('cnt-click');
      if (!imp || !clk) return;
      if (REDUCED) { setCounts('1.2억', '240만'); return; }
      var start = null, dur = 900;
      function frame(ts) {
        if (start === null) start = ts;
        var p = Math.min(1, (ts - start) / dur);
        var e = p * (2 - p); // easeOutQuad
        imp.textContent = (e * 1.2).toFixed(1) + '억';
        clk.textContent = Math.round(e * 240) + '만';
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
    // logs는 STEP 2(index 1). 그 전이면 0, 처음 도착하면 애니메이션, 이후 단계면 최종값 고정.
    function updateCounts() {
      if (i < 1) { setCounts('0', '0'); countDone = false; }
      else if (i === 1) { if (!countDone) { countDone = true; animateCounts(); } else setCounts('1.2억', '240만'); }
      else { countDone = true; setCounts('1.2억', '240만'); }
    }

    function render() {
      var s = STEPS[i];
      // 단계 텍스트
      elStep.textContent = 'STEP ' + (i + 1) + ' / ' + N;
      elCap.textContent = s.cap;

      // 노드 상태
      for (var k = 0; k < NODES.length; k++) {
        var id = NODES[k].id, g = nodeEls[id];
        g.classList.remove('is-active', 'is-done', 'is-future');
        if (k < i) g.classList.add('is-done');
        else if (k === i) g.classList.add('is-active');
        else g.classList.add('is-future');
      }
      // 엣지 상태 (현재 노드로 들어오는 엣지 active, 그 이전 done)
      for (var e2 = 0; e2 < NODES.length; e2++) {
        var eid = NODES[e2].id, el = edgeEls[eid];
        if (!el) continue;
        el.classList.remove('is-active', 'is-done');
        if (e2 < i) el.classList.add('is-done');
        else if (e2 === i) el.classList.add('is-active');
      }
      // 순환 화살표
      loopEl.classList.toggle('is-active', !!s.loop);

      // dots
      for (var t = 0; t < dots.length; t++) dots[t].classList.toggle('is-active', t === i);

      updateCounts();
    }

    function go(n) {
      i = Math.max(0, Math.min(N - 1, n));
      render();
    }

    function stop() {
      playing = false;
      if (timer) { clearTimeout(timer); timer = null; }
      btnPlay.textContent = '▶ 재생';
      btnPlay.classList.remove('is-primary');
    }
    function tick() {
      if (i >= N - 1) { stop(); return; }
      go(i + 1);
      timer = setTimeout(tick, 2100);
    }
    function play() {
      if (i >= N - 1) go(0);
      playing = true;
      btnPlay.textContent = '⏸ 정지';
      btnPlay.classList.add('is-primary');
      timer = setTimeout(tick, 1400);
    }

    btnPrev.addEventListener('click', function () { stop(); go(i - 1); });
    btnNext.addEventListener('click', function () { stop(); go(i + 1); });
    btnPlay.addEventListener('click', function () { playing ? stop() : play(); });

    document.addEventListener('keydown', function (ev) {
      var tag = (ev.target && ev.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (ev.key === 'ArrowRight') { ev.preventDefault(); stop(); go(i + 1); }
      else if (ev.key === 'ArrowLeft') { ev.preventDefault(); stop(); go(i - 1); }
    });

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
