/* Ecosystem 쉬운 버전 — RTB "0.1초 이야기" 단계별 슬라이드 (자동재생 없음) */
(function () {
  'use strict';

  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 손그림 라인아트 아이콘 — currentColor 스트로크라 잉크/벽돌·다크모드에 자동 적응 */
  var SVG_OPEN = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  var ICONS = {
    // 휴대폰 (앱을 켠다)
    phone: SVG_OPEN +
      '<rect x="19" y="5" width="26" height="54" rx="5"/>' +
      '<line x1="28" y1="11" x2="36" y2="11"/>' +
      '<line x1="25" y1="22" x2="45" y2="22"/>' +
      '<line x1="25" y1="29" x2="45" y2="29"/>' +
      '<line x1="25" y1="36" x2="38" y2="36"/>' +
      '<circle cx="32" cy="52" r="1.6"/></svg>',
    // 기사 + 빈 광고 슬롯(점선)
    slot: SVG_OPEN +
      '<rect x="9" y="9" width="46" height="46" rx="4"/>' +
      '<line x1="16" y1="18" x2="48" y2="18"/>' +
      '<line x1="16" y1="24" x2="40" y2="24"/>' +
      '<rect x="16" y="31" width="32" height="16" rx="2" stroke-dasharray="4 3"/></svg>',
    // 확성기 (앱이 외친다 → 경매에 올린다)
    megaphone: SVG_OPEN +
      '<path d="M10 26 L38 15 V45 L10 34 Z"/>' +
      '<path d="M10 26 H6 V34 H10"/>' +
      '<path d="M44 23 q7 9 0 18"/>' +
      '<path d="M50 19 q11 13 0 26"/></svg>',
    // 입찰 패들 여럿 (여러 입찰자)
    bidders: SVG_OPEN +
      '<circle cx="16" cy="20" r="6"/><line x1="16" y1="26" x2="16" y2="49"/>' +
      '<circle cx="32" cy="14" r="6"/><line x1="32" y1="20" x2="32" y2="49"/>' +
      '<circle cx="48" cy="20" r="6"/><line x1="48" y1="26" x2="48" y2="49"/></svg>',
    // 생각하는 머리 + 확률(%) (예측 모델)
    brainpct: SVG_OPEN +
      '<circle cx="23" cy="35" r="14"/>' +
      '<circle cx="20" cy="33" r="1.7" fill="currentColor" stroke="none"/>' +
      '<circle cx="48" cy="16" r="9"/><circle cx="37" cy="26" r="2"/>' +
      '<text x="48" y="20.5" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor" stroke="none" font-family="sans-serif">%</text></svg>',
    // 경매봉 + 단상 (낙찰)
    gavel: SVG_OPEN +
      '<rect x="31" y="9" width="14" height="20" rx="3" transform="rotate(45 38 19)"/>' +
      '<line x1="33" y1="24" x2="19" y2="38"/>' +
      '<rect x="11" y="47" width="30" height="7" rx="2.5"/></svg>',
    // 휴대폰 + 채워진 배너 (광고 노출)
    phonebanner: SVG_OPEN +
      '<rect x="19" y="5" width="26" height="54" rx="5"/>' +
      '<line x1="28" y1="11" x2="36" y2="11"/>' +
      '<line x1="25" y1="20" x2="45" y2="20"/>' +
      '<rect x="25" y="27" width="14" height="10" rx="1.5" fill="currentColor" fill-opacity="0.16"/>' +
      '<line x1="25" y1="43" x2="42" y2="43"/>' +
      '<circle cx="32" cy="52" r="1.6"/></svg>',
    // 순환 화살표 (로그 → 학습, 매일 반복)
    recycle: SVG_OPEN +
      '<path d="M18 23 a16 16 0 0 1 28 -2"/><path d="M46 11 l1 9 -9 -1"/>' +
      '<path d="M46 41 a16 16 0 0 1 -28 2"/><path d="M18 53 l-1 -9 9 1"/></svg>',
    // 저울 (1등 / 2등 경매 비교)
    scale: SVG_OPEN +
      '<line x1="32" y1="14" x2="32" y2="48"/><circle cx="32" cy="12" r="2.4"/>' +
      '<line x1="14" y1="20" x2="50" y2="20"/>' +
      '<path d="M14 20 L9 31"/><path d="M14 20 L19 31"/><path d="M8 31 a6 4 0 0 0 12 0"/>' +
      '<path d="M50 20 L45 31"/><path d="M50 20 L55 31"/><path d="M44 31 a6 4 0 0 0 12 0"/>' +
      '<line x1="22" y1="50" x2="42" y2="50"/></svg>'
  };

  /* 슬라이드 대본 — SSP/DSP·경매 방식·1등vs2등까지. 출처: js/ecosystem.js FLOWS.rtb */
  var SLIDES = [
    {
      icon: 'phone',
      title: '민지가 뉴스앱을 켰다',
      body: '그 순간부터 광고가 뜨기까지 약 0.1초. 그 짧은 사이, 화면 뒤에서 작은 경매가 열린다.'
    },
    {
      icon: 'slot',
      title: '기사 사이, 광고가 들어갈 빈 칸 하나',
      body: '이 빈 칸을 0.1초 안에 누군가의 광고로 채워야 한다. 모든 일은 여기서 시작된다.',
      term: '광고 슬롯 (ad slot)',
      example: '320×100'
    },
    {
      icon: 'megaphone',
      title: '파는 쪽엔 ‘SSP’ — 매체의 판매 대리인',
      body: '매체(앱·뉴스 사이트)는 빈 광고 자리를 직접 팔 손이 없다. SSP가 그 자리(지면)를 모아 거래소 경매에 올려, 가장 비싸게 사는 광고에 판다. 광고주가 아니라 ‘매체’ 편이다.',
      relation: { side: '파는 쪽 · 지면을 내놓는다', nodes: ['매체 (지면 주인)', 'SSP', '거래소 경매'], key: 1 },
      term: 'SSP = Supply-Side Platform · 매체(파는 쪽)의 대리인',
      example: '예: Google Ad Manager · PubMatic · Magnite'
    },
    {
      icon: 'bidders',
      title: '사는 쪽엔 ‘DSP’ — 광고주의 구매 대리인',
      body: '광고주는 수많은 경매를 일일이 못 쫓는다. DSP가 광고주의 예산·타겟을 받아, 여러 거래소 경매에 동시에 입찰해 그 지면을 산다. SSP의 정반대 — ‘광고주’ 편이다.',
      relation: { side: '사는 쪽 · 값을 부른다', nodes: ['광고주', 'DSP', '거래소 경매'], key: 1 },
      term: 'DSP = Demand-Side Platform · 광고주(사는 쪽)의 대리인',
      example: '예: The Trade Desk · Google DV360 · Criteo'
    },
    {
      icon: 'brainpct',
      title: '“민지가 이 광고를 누를까?”를 묻는다',
      body: 'DSP는 얼마를 부를지 정하려고 자기 예측 모델에 물어본다. “2.3% 확률.” 평소보다 높아서, 이 자리엔 값을 더 쳐줄 만하다.',
      term: '예측 모델 = pCTR (클릭 확률 예측, 예: DeepFM)',
      example: 'pCTR 2.3%'
    },
    {
      icon: 'gavel',
      title: '경매는 이렇게 굴러간다',
      body: '부름받은 DSP들이 ‘봉투에 가격을 적어’ 동시에 제출한다. 서로의 값은 모른다(밀봉). 경매장은 그중 가장 높은 값을 0.1초 안에 가린다.',
      term: '동시·밀봉 입찰 → 최고가 낙찰 (Sealed-bid Auction)',
      example: 'A ₩1,200 · B ₩1,150 · C ₩900 …',
      link: { text: '경매를 직접 돌려보기 →', href: 'demo-rtb.html' }
    },
    {
      icon: 'scale',
      title: '그런데 ‘얼마’를 낼까? — 1등 vs 2등 경매',
      body: '신기하게도, 이긴 사람이 내는 돈은 경매 방식에 따라 달라진다.',
      compare: {
        shared: '같은 입찰 — DSP-A ₩1,200(1위) · DSP-B ₩1,150(2위) → A 낙찰',
        left: { head: '1등 경매', sub: 'First-price', pay: '₩1,200', desc: '자기가 적어낸 값을 그대로 낸다' },
        right: { head: '2등 경매', sub: 'Second-price', pay: '₩1,150', desc: '이겨도 2등이 적은 값만 낸다' }
      },
      term: '2등 방식은 “솔직히 적어도 손해 안 보게” 한 설계 — 예전 RTB의 기본. 요즘 많이 쓰는 1등 방식에선 다들 눈치껏 살짝 낮춰 적는다 = Bid Shading'
    },
    {
      icon: 'phonebanner',
      title: '민지 화면에 운동화 배너가 뜬다',
      body: '앱을 켠 지 약 0.1초. 눈 한 번 깜빡일 새에 경매가 끝나고 광고가 도착했다.',
      term: '광고가 보이는 것 = 노출(Impression)',
      example: '소요 ~100ms'
    },
    {
      icon: 'recycle',
      title: '그리고 내일을 위해 — 본 결과가 기록된다',
      body: '민지가 봤는지·눌렀는지가 조용히 쌓인다. 이 기록이 내일 더 똑똑한 광고를 만드는 재료가 된다. 광고는 매일 이 과정을 반복하며 배운다.',
      term: '기록 = 로그(Log) → 모델 학습',
      cta: {
        text: '전체 지도와 다른 이야기도 보기 →',
        href: 'ecosystem.html',
        note: '모델 학습·어트리뷰션·헤더비딩 같은 다른 흐름은 자세한 지도에서.'
      }
    }
  ];

  function init() {
    var stage = document.getElementById('ecoeasy-stage');
    if (!stage) return;

    var elIcon = document.getElementById('ecoeasy-icon');
    var elStep = document.getElementById('ecoeasy-step');
    var elTitle = document.getElementById('ecoeasy-title');
    var elBody = document.getElementById('ecoeasy-body');
    var elTerm = document.getElementById('ecoeasy-term');
    var elExample = document.getElementById('ecoeasy-example');
    var elRelation = document.getElementById('ecoeasy-relation');
    var elCompare = document.getElementById('ecoeasy-compare');
    var elLink = document.getElementById('ecoeasy-link');
    var elCta = document.getElementById('ecoeasy-cta');
    var elCard = document.getElementById('ecoeasy-card');
    var btnPrev = document.getElementById('ecoeasy-prev');
    var btnNext = document.getElementById('ecoeasy-next');
    var elDots = document.getElementById('ecoeasy-dots');

    var N = SLIDES.length;
    var i = 0;

    // 점(dots) 생성 — 클릭 시 해당 단계로 점프
    var dotBtns = [];
    for (var d = 0; d < N; d++) {
      (function (idx) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'ecoeasy-dot';
        b.setAttribute('aria-label', (idx + 1) + '단계로 이동');
        b.addEventListener('click', function () { goTo(idx); });
        elDots.appendChild(b);
        dotBtns.push(b);
      })(d);
    }

    function paint() {
      var s = SLIDES[i];

      elIcon.innerHTML = ICONS[s.icon] || '';
      elStep.textContent = 'STEP ' + (i + 1) + ' / ' + N;
      elTitle.textContent = s.title;
      elBody.textContent = s.body;

      // 관계 한 줄 (예: 매체 → SSP → 거래소)
      if (s.relation) {
        elRelation.hidden = false;
        elRelation.innerHTML = renderRelation(s.relation);
      } else {
        elRelation.hidden = true;
        elRelation.innerHTML = '';
      }

      // 1등 vs 2등 비교 카드
      if (s.compare) {
        var c = s.compare;
        elCompare.hidden = false;
        elCompare.innerHTML =
          '<p class="ecoeasy-compare-shared">' + escapeHtml(c.shared) + '</p>' +
          '<div class="ecoeasy-compare-grid">' +
            compareCol(c.left, false) +
            compareCol(c.right, true) +
          '</div>';
      } else {
        elCompare.hidden = true;
        elCompare.innerHTML = '';
      }

      // 원래 이름(각주)
      if (s.term) {
        elTerm.hidden = false;
        elTerm.innerHTML = '<span class="ecoeasy-term-label">원래 이름</span> ' + escapeHtml(s.term);
      } else {
        elTerm.hidden = true;
        elTerm.innerHTML = '';
      }

      // 예시 chip
      if (s.example) {
        elExample.hidden = false;
        elExample.textContent = s.example;
      } else {
        elExample.hidden = true;
        elExample.textContent = '';
      }

      // 슬라이드별 보조 링크 (예: 경매 데모)
      if (s.link) {
        elLink.hidden = false;
        elLink.innerHTML = '<a class="ecoeasy-link-a" href="' + s.link.href + '">' + escapeHtml(s.link.text) + '</a>';
      } else {
        elLink.hidden = true;
        elLink.innerHTML = '';
      }

      // 마지막 카드의 CTA
      if (s.cta) {
        elCta.hidden = false;
        var note = s.cta.note ? '<span class="ecoeasy-cta-note">' + escapeHtml(s.cta.note) + '</span>' : '';
        elCta.innerHTML = '<a class="ecoeasy-cta-btn" href="' + s.cta.href + '">' + escapeHtml(s.cta.text) + '</a>' + note;
      } else {
        elCta.hidden = true;
        elCta.innerHTML = '';
      }

      // 버튼 활성/비활성
      btnPrev.disabled = (i === 0);
      btnNext.disabled = (i === N - 1);

      // 점 상태
      for (var k = 0; k < dotBtns.length; k++) {
        if (k === i) {
          dotBtns[k].classList.add('is-active');
          dotBtns[k].setAttribute('aria-current', 'true');
        } else {
          dotBtns[k].classList.remove('is-active');
          dotBtns[k].removeAttribute('aria-current');
        }
      }

      // 등장 애니메이션 (reduced-motion이면 생략)
      if (!REDUCED) {
        elCard.classList.remove('is-in');
        void elCard.offsetWidth; // reflow로 애니메이션 재시작
        elCard.classList.add('is-in');
      }
    }

    function goTo(n) {
      n = Math.max(0, Math.min(N - 1, n));
      if (n === i) return;
      i = n;
      paint();
    }

    btnPrev.addEventListener('click', function () { goTo(i - 1); });
    btnNext.addEventListener('click', function () { goTo(i + 1); });

    // 키보드 ← / → 로 이동
    document.addEventListener('keydown', function (e) {
      var tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(i + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(i - 1); }
    });

    paint();
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function compareCol(col, accent) {
    return '<div class="ecoeasy-compare-col' + (accent ? ' is-accent' : '') + '">' +
      '<span class="ecoeasy-compare-head">' + escapeHtml(col.head) +
        '<span class="ecoeasy-compare-sub">' + escapeHtml(col.sub) + '</span></span>' +
      '<span class="ecoeasy-compare-pay">' + escapeHtml(col.pay) + '</span>' +
      '<span class="ecoeasy-compare-desc">' + escapeHtml(col.desc) + '</span>' +
    '</div>';
  }

  function renderRelation(rel) {
    var chain = '';
    for (var n = 0; n < rel.nodes.length; n++) {
      if (n > 0) chain += '<span class="ecoeasy-relation-arrow">→</span>';
      chain += '<span class="ecoeasy-relation-node' + (n === rel.key ? ' is-key' : '') + '">' + escapeHtml(rel.nodes[n]) + '</span>';
    }
    return '<span class="ecoeasy-relation-side">' + escapeHtml(rel.side) + '</span>' +
      '<div class="ecoeasy-relation-chain">' + chain + '</div>';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
