// ===================================================================
// Kafka Partition 놀이터 — js/kafka-partition-demo.js
// 노출 로그 12줄을 칸에 나눠 넣고, 그 칸을 같은 consumer group 안의
// consumer들에게 나눠 준다. 여기서 드러나는 것은 두 가지다.
//   1) partition 수가 처리량 상한을 정한다 (한 칸은 그룹 안에서 한 명만 맡는다)
//   2) key가 순서 보장 범위를 정한다 (같은 key = 같은 칸 = 순서 유지)
// 덤으로, 칸 수를 나중에 바꾸면 같은 key가 다른 칸으로 옮겨가는 것을 표시한다.
//
// 색 값은 이 파일에 하나도 없다. 상태는 CSS 클래스로만 표시한다
// (팔레트 2종 × 테마 2종 = 4가지 조합에서 전부 살아 있어야 하므로).
// 흙톤 6색도 CSS 쪽 .kp-tone-N 규칙에 있고 여기서는 번호만 붙인다.
// ===================================================================
(function () {
  'use strict';

  // 샘플 노출 로그 — ad_id 가 일부러 쏠려 있다(9931 이 4건).
  // 한 줄이 들고 있는 것은 key 로 고를 수 있는 두 가지뿐이다. 화면에도 이 둘만 찍는다.
  var RECORDS = [
    { req: 'r-8f21', ad: 9931 }, { req: 'r-3c07', ad: 1204 },
    { req: 'r-b19e', ad: 9931 }, { req: 'r-77aa', ad: 5510 },
    { req: 'r-0d42', ad: 3388 }, { req: 'r-e6c1', ad: 1204 },
    { req: 'r-5b90', ad: 9931 }, { req: 'r-a238', ad: 7702 },
    { req: 'r-cc15', ad: 5510 }, { req: 'r-14f3', ad: 3388 },
    { req: 'r-9e88', ad: 7702 }, { req: 'r-2af6', ad: 9931 }
  ];

  // consumer 이름 — 칸 번호(0,1,2…)와 헷갈리지 않게 글자로 부른다.
  // 이 길이 6은 consumer 슬라이더의 max 6, 그리고 CSS 의 .kp-tone-0…5 여섯 벌과 같아야 한다.
  var CONSUMER_NAME = ['A', 'B', 'C', 'D', 'E', 'F'];

  // ==========================================
  // 1) 계산 — 어느 줄이 어느 칸으로 가고, 그 칸을 누가 맡나
  // ==========================================

  function hashKey(s) {
    var n = 0;
    for (var i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) >>> 0;
    return n;
  }

  // 로그를 칸에 나눈다. keyKind: 'req_id' | 'ad_id' | 'none'
  function assign(records, partitions, keyKind) {
    var bins = [];
    for (var i = 0; i < partitions; i++) bins.push([]);
    records.forEach(function (r, idx) {
      var p;
      if (keyKind === 'none') p = idx % partitions;                 // 라운드로빈
      else if (keyKind === 'ad_id') p = hashKey(String(r.ad)) % partitions;
      else p = hashKey(r.req) % partitions;
      bins[p].push(r);
    });
    return bins;
  }

  // 칸을 consumer 에게 나눠 준다. 반환: partition index -> consumer index
  function ownerOf(partitionIndex, consumers) { return partitionIndex % consumers; }

  // 지금 구성에서 무엇이 문제인지 한 줄로 판정한다.
  // level 은 색으로도 옮기지만, badge 글자와 테두리 모양이 함께 바뀐다 — 색만으로 알리지 않는다.
  //
  // 돌려주는 것:
  //   level·badge·text — 판정 한 줄
  //   hotSize          — 쏠린 칸의 줄 수. 쏠림이 아니면 null. 칸에 "쏠림" 배지를 붙일 때 이 값을 쓴다
  //   extra            — 판정문이 다른 문제를 말하느라 쏠림을 못 다룬 경우의 둘째 줄
  function verdict(bins, consumers, keyKind) {
    var total = 0;
    var sizes = bins.map(function (b) { total += b.length; return b.length; });
    var max = Math.max.apply(null, sizes), min = Math.min.apply(null, sizes);
    var empty = sizes.filter(function (n) { return n === 0; }).length;

    // 쏠림 판정은 이 한 줄이 전부다. 칸에 붙는 배지도 여기서 나온 hotSize 를 그대로 쓴다.
    // 예전에는 같은 식이 판정문과 칸 그리기 양쪽에 하나씩 있어서, 한쪽만 고치면 글과 그림이 어긋났다.
    var hotSize = (keyKind === 'ad_id' && bins.length > 1 && max >= min * 2 + 1) ? max : null;

    var owned = {};
    bins.forEach(function (_, i) { owned[ownerOf(i, consumers)] = true; });
    var idle = 0;
    for (var c = 0; c < consumers; c++) if (!owned[c]) idle++;

    if (idle > 0) {
      return {
        level: 'bad', badge: '막힘', hotSize: hotSize,
        text: 'consumer ' + consumers + '명 중 ' + idle + '명이 논다. 칸이 ' + bins.length +
          '개뿐이라 맡을 것이 없다. consumer를 늘려도 partition보다 많으면 처리량이 안 는다.',
        // 노는 사람과 쏠림이 한꺼번에 벌어지는 자리다(ad_id 로 칸 3~5개일 때).
        // 이때가 이 데모에서 쏠림이 가장 심한 순간인데, 판정문이 노는 사람만 말하면
        // 칸에 붙은 "쏠림" 배지를 설명하는 문장이 화면 어디에도 없게 된다.
        extra: hotSize === null ? null
          : '한 칸에 ' + hotSize + '줄이 몰려 있기도 하다(전체 ' + total + '줄).' +
            (empty ? ' 빈 칸은 ' + empty + '개다.' : '') +
            ' 칸을 늘리면 노는 사람은 없어진다. 그래도 이 쏠림은 남는다 — 인원이 아니라 key가 만든 것이라서다.'
      };
    }
    if (bins.length === 1) {
      return {
        level: 'warn', badge: '주의', hotSize: hotSize,
        text: '칸이 1개다. ' + total + '줄이 한 줄로 서니 순서는 완벽하게 지켜지지만, ' +
          'consumer를 몇 명 붙이든 처리량은 한 명분이 상한이다.'
      };
    }
    if (keyKind === 'none') {
      return {
        level: 'warn', badge: '주의', hotSize: hotSize,
        text: '가장 고르게 퍼졌다(최대 ' + max + '줄, 최소 ' + min +
          '줄). 대신 key가 없어서 같은 요청의 노출과 클릭이 다른 칸으로 흩어진다 — 순서가 안 지켜진다.'
      };
    }
    if (hotSize !== null) {
      return {
        level: 'warn', badge: '주의', hotSize: hotSize,
        text: '인기 광고 쪽으로 쏠렸다(최대 ' + max + '줄, 최소 ' + min +
          '줄). 그 칸을 맡은 consumer만 밀린다.' + (empty ? ' 빈 칸도 ' + empty + '개다.' : '')
      };
    }
    // 남는 경우: key 가 있고 특정 값으로 쏠리지도 않았다.
    // 표본이 작아 칸마다 줄 수가 딱 고르지는 않으므로 그 수를 그대로 적는다.
    var same = keyKind === 'ad_id' ? '같은 ad_id' : '같은 req_id';
    var use = keyKind === 'ad_id'
      ? '광고별 집계를 한 칸 안에서 끝낼 수 있다'
      : '노출과 클릭을 이어 붙이기 좋은 상태다';
    return {
      level: 'good', badge: '좋음', hotSize: hotSize,
      text: same + '는 언제나 같은 칸으로 간다 — ' + use + '(한 칸에 최대 ' + max + '줄, 최소 ' + min + '줄).' +
        (empty ? ' 빈 칸 ' + empty + '개는 표본이 ' + total + '줄뿐이라 생긴 것이다.' : '')
    };
  }

  // req_id -> 지금 들어간 칸 번호
  function placement(bins) {
    var map = {};
    bins.forEach(function (b, i) { b.forEach(function (r) { map[r.req] = i; }); });
    return map;
  }

  // 기준 배정과 지금 배정을 비교해 옮겨간 줄만 뽑는다.
  // 반환: { 'r-b19e': 2, … } — 값은 그 줄이 예전에 있던 칸 번호
  function movedFrom(base, now) {
    var moved = {};
    Object.keys(now).forEach(function (req) {
      if (base[req] !== undefined && base[req] !== now[req]) moved[req] = base[req];
    });
    return moved;
  }

  // consumer 별로 맡은 칸 수와 줄 수를 센다.
  function loads(bins, consumers) {
    var rows = [];
    for (var c = 0; c < consumers; c++) rows.push({ name: CONSUMER_NAME[c], parts: 0, lines: 0 });
    bins.forEach(function (b, i) {
      var row = rows[ownerOf(i, consumers)];
      row.parts += 1;
      row.lines += b.length;
    });
    return rows;
  }

  // ==========================================
  // 2) 그리기
  // ==========================================

  var $ = function (id) { return document.getElementById(id); };

  // aria-live 영역에 같은 글을 다시 써 넣으면 화면 낭독기가 안 바뀐 문장을 또 읽는다.
  // 슬라이더는 한 번 미는 동안 render() 를 여러 번 부르는데, 판정문은 대개 그대로다
  // (칸을 4→12 로 미는 8 단계 내내 같은 문장인 구간이 있다).
  // 그래서 지난번에 써 넣은 글을 기억해 두고, 같으면 아예 건드리지 않는다.
  var lastLive = {};
  function setLive(el, html) {
    if (lastLive[el.id] === html) return;
    lastLive[el.id] = html;
    el.innerHTML = html;
  }

  // 화면 낭독기용 구분자. 눈으로는 flex 간격이 항목을 갈라 주지만,
  // 낭독기에는 "partition 0consumer A1줄" 처럼 죄다 붙어서 읽힌다.
  // 범례가 눈에 보이게 쓰는 " · " 와 같은 글자를, 여기서는 안 보이게 끼워 넣는다.
  var SEP = '<span class="sr-only"> · </span>';

  // "칸 수를 바꾸면 배정이 뒤집힌다" 를 보여주기 위한 기준점.
  // 사용자가 슬라이더를 밀 때마다 기준이 따라 움직이면 한 칸 차이밖에 안 보여서,
  // key를 바꾸거나 버튼을 누를 때까지 기준을 고정해 둔다.
  var base = null;   // { parts: 4, place: { 'r-8f21': 0, … } }

  function keyKind() {
    var checked = document.querySelector('input[name="kp-key"]:checked');
    return checked ? checked.value : 'req_id';
  }

  function resetBase(partitions, kind) {
    base = { parts: partitions, place: placement(assign(RECORDS, partitions, kind)) };
  }

  function recHTML(r, fromPartition) {
    var moved = fromPartition !== undefined;
    return '<div class="kp-rec' + (moved ? ' is-moved' : '') + '">' +
      '<span>' + r.req + '</span>' + SEP +
      '<span class="kp-rec-ad">ad ' + r.ad + '</span>' +
      (moved
        ? SEP + '<span class="kp-rec-from"><span aria-hidden="true">↰ p' + fromPartition + '</span>' +
          '<span class="sr-only">partition ' + fromPartition + '에서 옮겨옴</span></span>'
        : '') +
      '</div>';
  }

  // hotSize: 쏠림으로 표시할 줄 수. 없으면 null. verdict() 가 정해 준 값을 그대로 받는다 —
  // 여기서 다시 재지 않으므로 칸의 배지와 판정문이 어긋날 수가 없다.
  function renderGrid(bins, consumers, moved, hotSize) {
    $('kp-grid').innerHTML = bins.map(function (b, i) {
      var owner = ownerOf(i, consumers);
      var hot = hotSize !== null && b.length === hotSize;
      // owner 는 언제나 0~5 다(consumer 슬라이더의 max 가 CONSUMER_NAME 길이와 같다).
      // 범례도 같은 이유로 번호를 그대로 붙인다.
      var cls = 'kp-card kp-tone-' + owner;
      if (b.length === 0) cls += ' is-empty';
      if (hot) cls += ' is-hot';

      var head = '<div class="kp-card-head">' +
        '<span class="kp-card-name">partition ' + i + '</span>' + SEP +
        '<span class="kp-card-owner"><span class="kp-swatch" aria-hidden="true"></span>consumer ' +
          CONSUMER_NAME[owner] + '</span>' + SEP +
        (hot ? '<span class="kp-card-hot">쏠림</span>' + SEP : '') +
        '<span class="kp-card-count">' + b.length + '줄</span>' +
        '</div>';

      var body = b.length
        ? b.map(function (r) { return recHTML(r, moved[r.req]); }).join('')
        : '<span class="kp-empty">비어 있음</span>';

      return '<div class="' + cls + '">' + head + body + '</div>';
    }).join('');
  }

  function renderLegend(bins, consumers) {
    $('kp-legend').innerHTML = loads(bins, consumers).map(function (row, c) {
      var idle = row.parts === 0;
      return '<span class="kp-legend-item kp-tone-' + c + (idle ? ' is-idle' : '') + '">' +
        '<span class="kp-swatch" aria-hidden="true"></span>' +
        'consumer ' + row.name + ' · ' +
        (idle ? '맡은 칸 없음' : row.parts + '칸 · ' + row.lines + '줄') +
        '</span>';
    }).join('');
  }

  function renderVerdict(v) {
    var box = $('kp-verdict');
    var cls = 'kp-verdict is-' + v.level;
    if (box.className !== cls) box.className = cls;
    // 둘째 줄은 줄을 떼고, 칸에 붙는 것과 똑같은 "쏠림" 배지를 앞에 세운다.
    // 첫 줄 뒤에 이어 붙이면 긴 문장 끝에 묻혀 버린다.
    //
    // 배지 뒤에도 구분자가 붙는다. 특히 "쏠림" 다음이 "한 칸에…" 라서,
    // 구분자가 없으면 낭독기에서 "쏠림한" 이라는 없는 낱말로 붙어 읽힌다.
    setLive(box,
      '<span class="kp-verdict-badge">' + v.badge + '</span>' + SEP + v.text +
      (v.extra
        ? '<span class="kp-verdict-extra"><span class="kp-verdict-hot">쏠림</span>' + SEP + v.extra + '</span>'
        : ''));
  }

  function renderShuffle(partitions, movedCount) {
    var box = $('kp-shuffle');
    if (!base || base.parts === partitions) {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    var head = '<strong>칸 ' + base.parts + '개 → ' + partitions + '개.</strong> ';
    var body = movedCount > 0
      ? '같은 ' + RECORDS.length + '줄인데 ' + movedCount + '줄이 다른 칸으로 옮겨갔다(아래에서 ↰ 로 표시, p뒤 숫자가 예전 칸). ' +
        '칸 수가 나눗셈에 들어가므로, 바꾸는 순간부터 그 줄들은 예전 칸에 남은 줄과 순서가 이어지지 않는다.'
      : '이번에는 옮겨간 줄이 없다. 표본 ' + RECORDS.length + '줄이 우연히 제자리를 지킨 경우로, 칸 수를 바꿔도 안전하다는 뜻은 아니다.';
    // 여기도 aria-live 안이다. 칸 수를 한 칸씩 밀 때 같은 문장이 반복되면 안 쓴다.
    setLive($('kp-shuffle-text'), head + body);
  }

  function syncKeyPills() {
    Array.prototype.forEach.call(document.querySelectorAll('.kp-key-row label'), function (label) {
      var input = label.querySelector('input');
      if (input) label.classList.toggle('is-on', input.checked);
    });
  }

  function render() {
    var partitions = +$('kp-part').value;
    var consumers = +$('kp-cons').value;
    var kind = keyKind();

    $('kp-part-v').textContent = partitions;
    $('kp-cons-v').textContent = consumers;
    syncKeyPills();

    var bins = assign(RECORDS, partitions, kind);
    var moved = base && base.parts !== partitions ? movedFrom(base.place, placement(bins)) : {};
    var v = verdict(bins, consumers, kind);

    renderVerdict(v);
    renderShuffle(partitions, Object.keys(moved).length);
    renderLegend(bins, consumers);
    renderGrid(bins, consumers, moved, v.hotSize);
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!$('kp-grid')) return;

    $('kp-part').addEventListener('input', render);
    $('kp-cons').addEventListener('input', render);

    // key 를 바꾸면 배정이 통째로 달라진다. 예전 기준과 비교하는 것이 의미가 없어 기준을 다시 잡는다.
    Array.prototype.forEach.call(document.querySelectorAll('input[name="kp-key"]'), function (input) {
      input.addEventListener('change', function () {
        resetBase(+$('kp-part').value, keyKind());
        render();
      });
    });

    $('kp-shuffle-reset').addEventListener('click', function () {
      resetBase(+$('kp-part').value, keyKind());
      render();
    });

    resetBase(+$('kp-part').value, keyKind());
    render();
  });
})();
