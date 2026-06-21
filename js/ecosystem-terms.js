/* 쉬운 용어 사전 — 19개 모듈 + 기본 지표를 한 줄 비유 카드로 (필터 + 해시 딥링크) */
(function () {
  'use strict';

  // 카테고리(역할) 라벨 — 지도와 같은 키 사용 + 'metric' 추가
  var CATS = [
    { key: 'all', label: '전체' },
    { key: 'sell', label: '파는 쪽' },
    { key: 'exchange', label: '거래소' },
    { key: 'buy', label: '사는 쪽' },
    { key: 'ml', label: '예측·모델' },
    { key: 'measurement', label: '측정' },
    { key: 'user', label: '사용자·동의' },
    { key: 'metric', label: '기본 지표' }
  ];
  var CAT_LABEL = {};
  CATS.forEach(function (c) { CAT_LABEL[c.key] = c.label; });

  // id는 지도 노드 id와 동일 → ecosystem.js '쉽게 보기'가 #id로 딥링크
  var TERMS = [
    // ── 파는 쪽 (sell) ──
    { id: 'publisher', cat: 'sell', name: 'Publisher', full: '매체·앱 (Publisher)', easy: '광고 자리를 가진 앱·웹·뉴스. 파는 쪽의 ‘주인’이다.', link: { text: '이야기: 광고가 뜨기까지', href: 'ecosystem-easy.html#rtb' } },
    { id: 'ssp', cat: 'sell', name: 'SSP', full: 'Supply-Side Platform', easy: '매체(파는 쪽)의 판매 대리인. 빈 지면을 모아 경매에 올려 비싸게 판다.', example: '예: Google Ad Manager · 카카오 애드핏', link: { text: '이야기: 광고가 뜨기까지', href: 'ecosystem-easy.html#rtb' } },
    { id: 'header-bidding', cat: 'sell', name: 'Header Bidding', full: '헤더 비딩', easy: '여러 구매처를 동시에 경쟁시켜 지면을 더 비싸게 파는 방법(+10~30%).', link: { text: '이야기: 더 비싸게 파는 법', href: 'ecosystem-easy.html#hb' } },

    // ── 거래소 (exchange) ──
    { id: 'exchange', cat: 'exchange', name: 'Ad Exchange', full: '광고 거래소', easy: '파는 쪽과 사는 쪽을 0.1초 안에 이어 주는 광고 경매장.', link: { text: '이야기: 광고가 뜨기까지', href: 'ecosystem-easy.html#rtb' } },
    { id: 'auction', cat: 'exchange', name: 'Auction Engine', full: '경매 엔진 (1st / 2nd Price)', easy: '여러 입찰 중 승자와 ‘낼 금액’을 정하는 심판. 1등값/2등값 규칙.', link: { text: '데모: RTB 경매', href: 'demo-rtb.html' } },

    // ── 사는 쪽 (buy) ──
    { id: 'dsp', cat: 'buy', name: 'DSP', full: 'Demand-Side Platform', easy: '광고주(사는 쪽)의 구매 대리인. 예측·입찰을 대신 한다.', example: '예: The Trade Desk · 카카오모먼트', link: { text: '이야기: 광고가 뜨기까지', href: 'ecosystem-easy.html#rtb' } },
    { id: 'advertiser', cat: 'buy', name: 'Advertiser', full: '광고주', easy: '광고를 내는 주체. 예산과 목표(ROAS 등)를 정한다.', link: { text: '이야기: 누구 공이냐', href: 'ecosystem-easy.html#attribution' } },
    { id: 'brand', cat: 'buy', name: 'Brand / Agency', full: '브랜드·대행사', easy: '광고주를 대신해 캠페인을 기획·운영하기도 하는 주체.' },
    { id: 'dco', cat: 'buy', name: 'DCO', full: 'Dynamic Creative Optimization', easy: '여러 이미지·문구를 자동으로 바꿔 끼우며 잘 되는 소재를 찾는 기술.', link: { text: '이야기: 누구에게 보여줄까', href: 'ecosystem-easy.html#targeting' } },
    { id: 'dmp', cat: 'buy', name: 'DMP / CDP', full: '오디언스 데이터 창고', easy: '동의받은 데이터를 모아 ‘묶음(세그먼트)’으로 만드는 창고.', link: { text: '이야기: 누구에게 보여줄까', href: 'ecosystem-easy.html#targeting' } },

    // ── 예측·모델 (ml) ──
    { id: 'feature-store', cat: 'ml', name: 'Feature Store', full: '피처 저장소', easy: '광고 모델이 꺼내 쓰는 ‘재료 창고’. 최근 클릭률 같은 숫자(피처)를 모아 둔다.', link: { text: '이야기: 모델이 배우는 법', href: 'ecosystem-easy.html#modeling' } },
    { id: 'model-serving', cat: 'ml', name: 'Model Serving', full: '모델 서빙', easy: '수천 개 후보 광고를 10ms 안에 몇 개로 좁히는 ‘추리는 기계’.', link: { text: '이야기: 모델이 배우는 법', href: 'ecosystem-easy.html#modeling' } },
    { id: 'pctr-cvr', cat: 'ml', name: 'pCTR / pCVR', full: '클릭·전환 확률 예측', easy: '이 사람이 누를 확률·살 확률을 찍어 주는 예측 모델.', example: '예: pCTR 2.3%', link: { text: '이야기: 광고가 뜨기까지', href: 'ecosystem-easy.html#rtb' } },
    { id: 'calibration', cat: 'ml', name: 'Calibration', full: '예측값 보정', easy: '모델 예측이 전반적으로 높거나 낮으면 실제에 맞춰 눈금을 바로잡는 일.', link: { text: '데모: Calibration', href: 'demo-calibration.html' } },

    // ── 측정 (measurement) ──
    { id: 'mmp', cat: 'measurement', name: 'MMP / Attribution', full: '어트리뷰션', easy: '어느 광고가 구매에 ‘공’이 있는지 판정하는 심판.', link: { text: '이야기: 누구 공이냐', href: 'ecosystem-easy.html#attribution' } },
    { id: 'log-pipeline', cat: 'measurement', name: 'Log Pipeline', full: '로그 파이프라인', easy: '노출·클릭·구매 기록을 전부 모으는 ‘기록 파이프’. 모델·측정의 토대.', link: { text: '이야기: 모델이 배우는 법', href: 'ecosystem-easy.html#modeling' } },

    // ── 사용자·동의 (user) ──
    { id: 'user', cat: 'user', name: 'User', full: '사용자', easy: '광고를 보고 누르고 사는 사람. 모든 흐름의 시작이자 끝.' },
    { id: 'user-journey', cat: 'user', name: 'User Journey', full: '사용자 여정', easy: '한 사람이 광고를 본 → 누른 → 산 시간 순서. 어트리뷰션의 바탕.', link: { text: '이야기: 누구 공이냐', href: 'ecosystem-easy.html#attribution' } },
    { id: 'cmp', cat: 'user', name: 'CMP', full: '동의 관리 (Consent Management)', easy: '‘쿠키 허용할까요?’ 동의를 받고 관리하는 곳. 데이터 사용의 출발점.', link: { text: '이야기: 누구에게 보여줄까', href: 'ecosystem-easy.html#targeting' } },

    // ── 기본 지표 (metric) ──
    { id: 'impclickconv', cat: 'metric', name: '노출·클릭·전환', full: 'Impression · Click · Conversion', easy: '광고의 3대 사건 — 봤다(노출) · 눌렀다(클릭) · 샀다(전환).', link: { text: '이야기: 누구 공이냐', href: 'ecosystem-easy.html#attribution' } },
    { id: 'ctr', cat: 'metric', name: 'CTR', full: 'Click-Through Rate', easy: '클릭 ÷ 노출. ‘얼마나 눌렀나’의 비율.', example: '노출 100 중 클릭 2 → CTR 2%' },
    { id: 'cvr', cat: 'metric', name: 'CVR', full: 'Conversion Rate', easy: '클릭 대비 전환 비율. ‘눌러서 얼마나 샀나’.' },
    { id: 'cpm', cat: 'metric', name: 'CPM', full: 'Cost Per Mille', easy: '1,000번 ‘보여주기’당 비용. 노출 기준 단가.' },
    { id: 'cpc', cat: 'metric', name: 'CPC', full: 'Cost Per Click', easy: '클릭 1번당 비용. ‘누를 때만’ 돈을 낸다.' },
    { id: 'cpa', cat: 'metric', name: 'CPA', full: 'Cost Per Action', easy: '전환(가입·구매) 1건당 비용. ‘성과당’ 단가.', link: { text: '이야기: 누구 공이냐', href: 'ecosystem-easy.html#attribution' } },
    { id: 'roas', cat: 'metric', name: 'ROAS', full: 'Return On Ad Spend', easy: '매출 ÷ 광고비. 300%면 1원 써서 3원 벌었다는 뜻.', example: '광고비 100만 → 매출 300만 = 300%', link: { text: '이야기: 누구 공이냐', href: 'ecosystem-easy.html#attribution' } },
    { id: 'ecpm', cat: 'metric', name: 'eCPM', full: 'effective CPM', easy: '어떤 과금이든 1,000노출당 ‘실효 수익’으로 환산한 값. 경매 비교의 공통 잣대.' },
    { id: 'floor', cat: 'metric', name: 'Floor Price', full: '최저 판매가', easy: '매체가 정한 바닥값. 이 밑으로는 팔지 않는다.', link: { text: '이야기: 더 비싸게 파는 법', href: 'ecosystem-easy.html#hb' } },
    { id: 'freq-cap', cat: 'metric', name: 'Frequency Cap', full: '노출 빈도 상한', easy: '한 사람에게 같은 광고를 보여주는 횟수 상한. 너무 자주 보이면 짜증나니까.' }
  ];

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function cardHtml(t) {
    var ex = t.example ? '<span class="terms-card-ex">' + escapeHtml(t.example) + '</span>' : '';
    var link = t.link ? '<a class="terms-card-link" href="' + t.link.href + '">' + escapeHtml(t.link.text) + ' →</a>' : '';
    return '<article class="terms-card" id="' + t.id + '" data-cat="' + t.cat + '">' +
      '<div class="terms-card-head">' +
        '<h3 class="terms-card-name">' + escapeHtml(t.name) + '</h3>' +
        '<span class="terms-tag">' + escapeHtml(CAT_LABEL[t.cat] || t.cat) + '</span>' +
      '</div>' +
      '<p class="terms-card-easy">' + escapeHtml(t.easy) + '</p>' +
      '<p class="terms-card-full"><span class="terms-card-full-label">원래 이름</span> ' + escapeHtml(t.full) + '</p>' +
      ex + link +
    '</article>';
  }

  function init() {
    var grid = document.getElementById('terms-grid');
    var filters = document.getElementById('terms-filters');
    if (!grid || !filters) return;

    // 필터 칩
    var chipHtml = '';
    for (var i = 0; i < CATS.length; i++) {
      chipHtml += '<button type="button" class="terms-filter' + (i === 0 ? ' is-active' : '') + '" data-cat="' + CATS[i].key + '">' + escapeHtml(CATS[i].label) + '</button>';
    }
    filters.innerHTML = chipHtml;

    // 카드 그리드
    grid.innerHTML = TERMS.map(cardHtml).join('');

    var chips = filters.querySelectorAll('.terms-filter');

    function applyFilter(cat) {
      var cards = grid.querySelectorAll('.terms-card');
      for (var k = 0; k < cards.length; k++) {
        var show = (cat === 'all') || (cards[k].getAttribute('data-cat') === cat);
        cards[k].hidden = !show;
      }
      for (var c = 0; c < chips.length; c++) {
        var on = chips[c].getAttribute('data-cat') === cat;
        chips[c].classList.toggle('is-active', on);
        if (on) { chips[c].setAttribute('aria-current', 'true'); } else { chips[c].removeAttribute('aria-current'); }
      }
    }

    for (var j = 0; j < chips.length; j++) {
      chips[j].addEventListener('click', function () { applyFilter(this.getAttribute('data-cat')); });
    }

    // 해시 딥링크 (지도 노드 '쉽게 보기' → #dsp 등): 전체 보기 + 스크롤 + 강조
    function focusHash() {
      var id = (location.hash || '').replace(/^#/, '');
      if (!id) return;
      var card = document.getElementById(id);
      if (!card) return;
      applyFilter('all');
      card.classList.remove('is-highlight');
      void card.offsetWidth;
      card.classList.add('is-highlight');
      card.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }

    window.addEventListener('hashchange', focusHash);
    applyFilter('all');
    focusHash();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
