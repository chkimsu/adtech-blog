/* Ecosystem 쉬운 버전 — 광고 생태계 5가지 이야기 허브 (해시 라우팅, 자동재생 없음) */
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
    // 확성기 (파는 쪽이 내놓는다)
    megaphone: SVG_OPEN +
      '<path d="M10 26 L38 15 V45 L10 34 Z"/>' +
      '<path d="M10 26 H6 V34 H10"/>' +
      '<path d="M44 23 q7 9 0 18"/>' +
      '<path d="M50 19 q11 13 0 26"/></svg>',
    // 입찰 패들 여럿 (여러 입찰자 / 사람들)
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
    // 휴대폰 + 채워진 배너 (광고 노출 / 개인화)
    phonebanner: SVG_OPEN +
      '<rect x="19" y="5" width="26" height="54" rx="5"/>' +
      '<line x1="28" y1="11" x2="36" y2="11"/>' +
      '<line x1="25" y1="20" x2="45" y2="20"/>' +
      '<rect x="25" y="27" width="14" height="10" rx="1.5" fill="currentColor" fill-opacity="0.16"/>' +
      '<line x1="25" y1="43" x2="42" y2="43"/>' +
      '<circle cx="32" cy="52" r="1.6"/></svg>',
    // 순환 화살표 (피드백 루프 / 매일 반복)
    recycle: SVG_OPEN +
      '<path d="M18 23 a16 16 0 0 1 28 -2"/><path d="M46 11 l1 9 -9 -1"/>' +
      '<path d="M46 41 a16 16 0 0 1 -28 2"/><path d="M18 53 l-1 -9 9 1"/></svg>',
    // 저울 (비교 / 판정 / 보정)
    scale: SVG_OPEN +
      '<line x1="32" y1="14" x2="32" y2="48"/><circle cx="32" cy="12" r="2.4"/>' +
      '<line x1="14" y1="20" x2="50" y2="20"/>' +
      '<path d="M14 20 L9 31"/><path d="M14 20 L19 31"/><path d="M8 31 a6 4 0 0 0 12 0"/>' +
      '<path d="M50 20 L45 31"/><path d="M50 20 L55 31"/><path d="M44 31 a6 4 0 0 0 12 0"/>' +
      '<line x1="22" y1="50" x2="42" y2="50"/></svg>',
    // 열린 책 (학습)
    book: SVG_OPEN +
      '<path d="M32 16 C24 11 14 11 8 13 V49 C14 47 24 47 32 52 C40 47 50 47 56 49 V13 C50 11 40 11 32 16 Z"/>' +
      '<line x1="32" y1="16" x2="32" y2="52"/></svg>',
    // 쌓인 층 (로그 / 기록 / 데이터 창고)
    stack: SVG_OPEN +
      '<path d="M32 8 L56 19 L32 30 L8 19 Z"/>' +
      '<path d="M8 30 L32 41 L56 30"/>' +
      '<path d="M8 41 L32 52 L56 41"/></svg>',
    // 깔때기 (원시 로그를 피처로 가공)
    funnel: SVG_OPEN +
      '<path d="M10 14 H54 L38 34 V52 L26 46 V34 Z"/></svg>',
    // 메달 (기여 / 공)
    medal: SVG_OPEN +
      '<path d="M22 27 L14 9 M42 27 L50 9"/>' +
      '<circle cx="32" cy="38" r="13"/>' +
      '<path d="M26 38 l4 4 8 -9"/></svg>',
    // 영수증 (성적표 / ROAS 리포트)
    receipt: SVG_OPEN +
      '<path d="M16 8 H48 V56 L42 51 L37 56 L32 51 L27 56 L22 51 L16 56 Z"/>' +
      '<line x1="23" y1="22" x2="41" y2="22"/>' +
      '<line x1="23" y1="30" x2="41" y2="30"/>' +
      '<line x1="23" y1="38" x2="34" y2="38"/></svg>',
    // 평행 화살표 (병렬 동시 경쟁)
    parallel: SVG_OPEN +
      '<line x1="16" y1="12" x2="16" y2="48"/><line x1="32" y1="12" x2="32" y2="48"/><line x1="48" y1="12" x2="48" y2="48"/>' +
      '<path d="M11 43 l5 6 5 -6"/><path d="M27 43 l5 6 5 -6"/><path d="M43 43 l5 6 5 -6"/></svg>',
    // 과녁 (타겟)
    target: SVG_OPEN +
      '<circle cx="32" cy="32" r="20"/><circle cx="32" cy="32" r="11"/>' +
      '<circle cx="32" cy="32" r="3" fill="currentColor" stroke="none"/></svg>',
    // 방패 + 체크 (동의 / 프라이버시)
    shield: SVG_OPEN +
      '<path d="M32 7 L53 15 V31 C53 43 44 52 32 57 C20 52 11 43 11 31 V15 Z"/>' +
      '<path d="M24 31 l6 6 11 -13"/></svg>'
  };

  var STORY_ORDER = ['rtb', 'modeling', 'attribution', 'hb', 'targeting'];

  var STORIES = {
    /* ── 1. RTB (기존 9장, 그대로 보존) ── */
    rtb: {
      id: 'rtb', icon: 'phone',
      label: '광고가 뜨기까지',
      dek: '앱을 켠 0.1초 사이, 화면 뒤에서 광고 경매가 열린다.',
      slides: [
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
          example: '해외: Google Ad Manager · PubMatic · Magnite',
          exampleKr: '국내: 카카오 애드핏',
          note: '네이버·카카오는 ‘울타리 친 생태계’ — 자기 지면을 자기 플랫폼에서 직접 판다.'
        },
        {
          icon: 'bidders',
          title: '사는 쪽엔 ‘DSP’ — 광고주의 구매 대리인',
          body: '광고주는 수많은 경매를 일일이 못 쫓는다. DSP가 광고주의 예산·타겟을 받아, 여러 거래소 경매에 동시에 입찰해 그 지면을 산다. SSP의 정반대 — ‘광고주’ 편이다.',
          relation: { side: '사는 쪽 · 값을 부른다', nodes: ['광고주', 'DSP', '거래소 경매'], key: 1 },
          term: 'DSP = Demand-Side Platform · 광고주(사는 쪽)의 대리인',
          example: '해외: The Trade Desk · Google DV360 · Criteo',
          exampleKr: '국내: 카카오모먼트 · 네이버 GFA',
          note: '카카오모먼트·네이버 GFA는 닫힌 생태계의 ‘사는 쪽’ 도구 — 한 회사 안에서 사고팔린다.'
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
            text: '‘모델이 배우는 법’ 이야기로 →',
            href: '#modeling',
            note: '방금 쌓인 로그가 어떻게 더 똑똑한 모델이 되는지 이어서 볼 수 있어요.'
          }
        }
      ]
    },

    /* ── 2. 모델이 배우는 법 ── */
    modeling: {
      id: 'modeling', icon: 'book',
      label: '모델이 배우는 법',
      dek: '어제 본 것이 오늘 더 똑똑한 광고가 된다.',
      slides: [
        {
          icon: 'book',
          title: '광고는 매일 밤 ‘공부’한다',
          body: '어제 사람들이 무엇을 보고 눌렀는지가, 오늘 더 똑똑한 광고를 만드는 교재가 된다. 그 공부 과정을 따라가 보자.'
        },
        {
          icon: 'stack',
          title: '어제의 기록이 교재다',
          body: '하루 동안 쌓인 노출·클릭 기록이 통째로 모인다. 모델이 배울 ‘문제와 정답’의 원재료다.',
          term: '기록 = 로그 (Log Pipeline)',
          example: '어제: 노출 1.2억 · 클릭 240만'
        },
        {
          icon: 'funnel',
          title: '원재료를 ‘피처’로 손질한다',
          body: '날것의 로그를 “이 사람의 최근 7일 클릭률” 같은 숫자(피처)로 가공해 창고에 채워 둔다. 모델이 바로 꺼내 쓸 수 있게.',
          term: '피처 창고 = Feature Store',
          example: '피처 312개 · 시간당 갱신'
        },
        {
          icon: 'brainpct',
          title: '문제집을 풀며 모델이 학습한다',
          body: '피처(문제)에 ‘클릭했나 안 했나’(정답)를 붙여 8.5억 개짜리 문제집을 만들고, 모델이 푼다. 어제의 트렌드가 모델 안에 스며드는 순간.',
          term: '예측 모델 = DeepFM 등 · 성적은 AUC로',
          example: 'AUC 0.781 → 0.792'
        },
        {
          icon: 'scale',
          title: '예측을 현실에 맞춘다 — Calibration',
          body: '모델이 전반적으로 너무 낮게(또는 높게) 보면 입찰가 전체가 틀어진다. 그래서 예측 평균을 실제 평균에 맞춰 살짝 보정한다.',
          term: 'Calibration = 예측값 보정',
          compare: {
            shared: '보정을 안 하면 입찰가 전체가 부풀거나 쪼그라든다',
            left: { head: '보정 전', sub: 'Raw', pay: '2.1%', desc: '실제보다 낮게 봄 → 너무 싸게 입찰' },
            right: { head: '보정 후', sub: 'Calibrated', pay: '2.4%', desc: '실제와 일치 → 제값에 입찰' }
          }
        },
        {
          icon: 'recycle',
          title: '새 모델을 올리면, 오늘 입찰이 달라진다',
          body: '검증을 통과한 새 모델을 일부 트래픽부터 조심스레 올린다(카나리). 문제없으면 전체 적용 — 오늘 입찰부터 더 똑똑해진다. 광고는 매일 이 순환을 돈다.',
          term: '조심스런 배포 = 카나리(Canary)',
          example: '5% → 100% · ROAS +4%',
          link: { text: 'pCTR·보정 데모 보기 →', href: 'demo-calibration.html' },
          cta: {
            text: '‘누구 공이냐’ 이야기로 →',
            href: '#attribution',
            note: '그럼 이 광고가 정말 효과가 있었는지는 어떻게 알까요?'
          }
        }
      ]
    },

    /* ── 3. 누구 공이냐 (어트리뷰션) ── */
    attribution: {
      id: 'attribution', icon: 'medal',
      label: '누구 공이냐',
      dek: '전환 하나, 어느 광고의 공일까.',
      slides: [
        {
          icon: 'phonebanner',
          title: '민지가 드디어 운동화를 샀다',
          body: '그런데 며칠 전부터 여러 광고를 봤다. 이 구매는 ‘누구의 공’일까? 그걸 따지는 일이 어트리뷰션이다.'
        },
        {
          icon: 'stack',
          title: '민지의 여정엔 여러 접점이 있었다',
          body: '월요일에 보고, 수요일에 누르고, 목요일에 샀다. 이 접점들이 시간 순서대로 전부 기록에 남아 있다.',
          relation: { side: '민지의 3일', nodes: ['월: 노출', '수: 클릭', '목: 구매'], key: 2 },
          term: '접점 기록 = Impression · Click · Conversion 로그'
        },
        {
          icon: 'medal',
          title: '누구에게 공을 줄까? — 규칙이 가른다',
          body: '거쳐 온 광고 중 누구를 칭찬할지는 ‘규칙’이 정한다. 규칙에 따라 성적표가 완전히 달라진다.',
          compare: {
            shared: '같은 여정(노출 → 클릭 → 구매), 공을 주는 방식만 다름',
            left: { head: '라스트클릭', sub: 'Last-Click', pay: '100%', desc: '마지막 클릭이 공을 다 가져감' },
            right: { head: '멀티터치', sub: 'Multi-Touch', pay: '나눠', desc: '거쳐 온 광고들이 나눠 가짐' }
          },
          term: '기여도 판정 = MMP / 어트리뷰션'
        },
        {
          icon: 'receipt',
          title: '광고주는 ‘성적표’를 받는다 — ROAS',
          body: '쓴 광고비 대비 번 매출이 ROAS다. 광고비 100만 원으로 매출 300만 원을 냈으면 ROAS 300%. 이 한 숫자로 캠페인이 평가된다.',
          term: 'ROAS = 매출 ÷ 광고비 (쓴 돈 대비 번 돈)',
          example: '광고비 ₩100만 → 매출 ₩300만 = 300%'
        },
        {
          icon: 'scale',
          title: '성적표를 보고 예산을 옮긴다',
          body: '잘 나온 캠페인엔 예산을 더 싣고, 부진한 건 줄이거나 끈다. 측정이 곧장 다음 행동을 바꾼다.',
          example: 'A캠 예산 +50% · B캠 중단'
        },
        {
          icon: 'recycle',
          title: '그 조정이 다음 입찰에 반영된다',
          body: '측정 결과가 다시 입찰을 바꾼다. 광고는 한 방향 파이프가 아니라, 측정과 입찰이 맞물려 빙글빙글 도는 고리다.',
          term: '성과 피드백 루프',
          link: { text: '어트리뷰션 기간 바꿔보기 →', href: 'demo-attribution-window.html' },
          cta: {
            text: '‘더 비싸게 파는 법’ 이야기로 →',
            href: '#hb',
            note: '이번엔 매체(파는 쪽)가 수익을 끌어올리는 방법을 볼까요?'
          }
        }
      ]
    },

    /* ── 4. 더 비싸게 파는 법 (헤더비딩) ── */
    hb: {
      id: 'hb', icon: 'parallel',
      label: '더 비싸게 파는 법',
      dek: '같은 자리를 +10~30% 비싸게 — 헤더비딩.',
      slides: [
        {
          icon: 'megaphone',
          title: '같은 광고 자리, 더 비싸게 파는 법',
          body: '매체는 같은 지면을 팔아도 ‘방법’에 따라 수익이 크게 달라진다. 평균 +10~30%를 끌어올리는 방법이 헤더비딩이다.'
        },
        {
          icon: 'bidders',
          title: '예전엔 한 줄로 세워 차례차례 물었다',
          body: '구매자들을 한 줄로 세우고 “너 살래? 아니면 다음…”을 순서대로 물었다. 느리고, 뒤에 있던 더 비싼 값을 놓치기 쉬웠다.',
          term: '순차 방식 = Waterfall(폭포수)'
        },
        {
          icon: 'parallel',
          title: '헤더비딩은 ‘동시에’ 다 물어본다',
          body: '한 줄로 세우는 대신 모두에게 한꺼번에 묻는다. 경쟁이 세지니 값이 올라간다. 이 한 끗 차이가 핵심이다.',
          compare: {
            shared: '같은 지면, 부르는 ‘순서’만 다름',
            left: { head: 'Waterfall', sub: '순차', pay: '느림·저가', desc: '한 곳씩 차례로 → 비싼 값 놓침' },
            right: { head: 'Header Bidding', sub: '동시', pay: '+10~30%', desc: '모두 동시에 경쟁 → 최고가' }
          },
          note: '이름 유래: 페이지 ‘머리(header)’에 심은 코드(Prebid.js 등)가 본문보다 먼저 깨어나 경매를 열어서 ‘헤더’ 비딩.'
        },
        {
          icon: 'gavel',
          title: '동시에 부르니 값이 올라간다',
          body: '5개 구매처를 한꺼번에 부르자, 같은 자리 하나에 여러 값이 동시에 들어온다. 그중 최고가가 이긴다.',
          example: '동시 입찰 ₩1,100 · ₩1,250 · ₩980'
        },
        {
          icon: 'receipt',
          title: '결과: 순차로 팔 때보다 +18% 더 받았다',
          body: '최고가 ₩1,250에 낙찰. 예전 순차(Waterfall) 방식으로 팔았을 때보다 18% 더 받았다. 매체들이 헤더비딩을 쓰는 이유다.',
          term: '바닥값 = Floor Price (이 밑으론 안 팜)',
          example: '낙찰 ₩1,250 · vs Waterfall +18%',
          link: { text: '헤더비딩 시뮬레이터 →', href: 'demo-header-bidding.html' },
          cta: {
            text: '‘누구에게 보여줄까’ 이야기로 →',
            href: '#targeting',
            note: '마지막으로, 누구에게 어떤 광고를 보여줄지 고르는 법을 볼까요?'
          }
        }
      ]
    },

    /* ── 5. 누구에게 보여줄까 (데이터·타겟팅) ── */
    targeting: {
      id: 'targeting', icon: 'target',
      label: '누구에게 보여줄까',
      dek: '동의받은 데이터가 광고를 고른다.',
      slides: [
        {
          icon: 'target',
          title: '왜 내가 본 운동화가 자꾸 따라올까?',
          body: '광고는 아무에게나 같은 걸 뿌리지 않는다. ‘동의받은 데이터’로 누구에게 무엇을 보여줄지 고른다. 그 길을 따라가 보자.'
        },
        {
          icon: 'shield',
          title: '출발은 ‘동의’다',
          body: '사이트 첫 방문에 뜨는 “쿠키를 허용할까요?” 팝업이 출발점. 여기서 허락한 데이터만 쓸 수 있다. 안 누르면 이 길은 막힌다.',
          term: '동의 관리 = CMP (GDPR · CCPA)'
        },
        {
          icon: 'stack',
          title: '동의된 데이터가 창고에 모인다',
          body: '허락받은 쿠키·디바이스 ID·검색 이력이 오디언스 데이터 창고에 쌓인다.',
          term: '데이터 창고 = DMP / CDP',
          example: '예: 쿠키 + 운동화 검색 이력'
        },
        {
          icon: 'bidders',
          title: '개인이 아니라 ‘묶음’으로 다룬다',
          body: '한 명씩이 아니라 “2030 · 스포츠 관심” 같은 묶음(세그먼트)으로 가공된다. 민지는 42만 명 묶음의 한 명으로 광고주에게 전달된다.',
          term: '묶음 = 세그먼트(Segment) · 비슷한 사람 더 찾기 = Lookalike',
          example: '세그먼트: 2030 스포츠 · 42만 명'
        },
        {
          icon: 'scale',
          title: '내 타겟이면 더 비싸게 부른다',
          body: '데이터가 곧 입찰가 차이를 만든다. 내 타겟과 딱 맞는 사람이 나타나면 평소보다 훨씬 높이 부른다.',
          compare: {
            shared: '같은 지면, 보는 ‘사람’만 다름',
            left: { head: '아무나', sub: '일반', pay: '₩900', desc: '평범한 기본 입찰가' },
            right: { head: '내 타겟', sub: '세그먼트 일치', pay: '₩1,400', desc: '딱 맞아서 더 비싸게' }
          }
        },
        {
          icon: 'phonebanner',
          title: '그래서 사람마다 다른 광고를 본다',
          body: '같은 자리라도 민지는 운동화 광고를, 옆 사람은 전혀 다른 광고를 본다. 이게 개인화 광고다. 단, 모든 건 처음의 ‘동의’ 위에서만 작동한다.',
          term: '개인화 노출 (Personalization)',
          link: { text: '비슷한 사람 찾기(Lookalike) 읽기 →', href: 'post.html?id=lookalike-modeling' },
          cta: {
            text: '전체 지도(자세히)로 →',
            href: 'ecosystem.html',
            note: '5가지 이야기를 다 봤어요. 이제 18개 모듈 전체 지도도 한눈에 볼까요?'
          }
        }
      ]
    }
  };

  function init() {
    var stage = document.getElementById('ecoeasy-stage');
    if (!stage) return;

    var elHero = document.getElementById('ecoeasy-hero');
    var elHub = document.getElementById('ecoeasy-hub');
    var elStoryHeader = document.getElementById('ecoeasy-story-header');
    var elStoryKicker = document.getElementById('ecoeasy-story-kicker');
    var elStoryTitle = document.getElementById('ecoeasy-story-title');
    var elStoryDek = document.getElementById('ecoeasy-story-dek');
    var elBack = document.getElementById('ecoeasy-back');

    var elIcon = document.getElementById('ecoeasy-icon');
    var elStep = document.getElementById('ecoeasy-step');
    var elTitle = document.getElementById('ecoeasy-title');
    var elBody = document.getElementById('ecoeasy-body');
    var elTerm = document.getElementById('ecoeasy-term');
    var elExample = document.getElementById('ecoeasy-example');
    var elExampleKr = document.getElementById('ecoeasy-example-kr');
    var elNote = document.getElementById('ecoeasy-note');
    var elRelation = document.getElementById('ecoeasy-relation');
    var elCompare = document.getElementById('ecoeasy-compare');
    var elLink = document.getElementById('ecoeasy-link');
    var elCta = document.getElementById('ecoeasy-cta');
    var elCard = document.getElementById('ecoeasy-card');
    var btnPrev = document.getElementById('ecoeasy-prev');
    var btnNext = document.getElementById('ecoeasy-next');
    var elDots = document.getElementById('ecoeasy-dots');

    var slides = [];
    var N = 0;
    var i = 0;
    var dotBtns = [];
    var mounted = false;

    function buildDots() {
      elDots.innerHTML = '';
      dotBtns = [];
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
    }

    function paint() {
      var s = slides[i];

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

      // 좌우 비교 카드
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

      // 예시 chip (해외)
      if (s.example) {
        elExample.hidden = false;
        elExample.textContent = s.example;
      } else {
        elExample.hidden = true;
        elExample.textContent = '';
      }

      // 예시 chip (국내)
      if (s.exampleKr) {
        elExampleKr.hidden = false;
        elExampleKr.textContent = s.exampleKr;
      } else {
        elExampleKr.hidden = true;
        elExampleKr.textContent = '';
      }

      // 보조 주석
      if (s.note) {
        elNote.hidden = false;
        elNote.textContent = s.note;
      } else {
        elNote.hidden = true;
        elNote.textContent = '';
      }

      // 슬라이드별 보조 링크 (예: 데모)
      if (s.link) {
        elLink.hidden = false;
        elLink.innerHTML = '<a class="ecoeasy-link-a" href="' + s.link.href + '">' + escapeHtml(s.link.text) + '</a>';
      } else {
        elLink.hidden = true;
        elLink.innerHTML = '';
      }

      // 마지막 카드의 CTA (다음 이야기 / 전체 지도 등)
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
      if (!mounted) return;
      n = Math.max(0, Math.min(N - 1, n));
      if (n === i) return;
      i = n;
      paint();
    }

    function renderStory(id) {
      var st = STORIES[id];
      if (!st) { renderHub(); return; }
      slides = st.slides;
      N = slides.length;
      i = 0;
      mounted = true;

      var pos = STORY_ORDER.indexOf(id) + 1;
      elStoryKicker.textContent = '이야기 ' + pos + ' / ' + STORY_ORDER.length;
      elStoryTitle.textContent = st.label;
      elStoryDek.textContent = st.dek;

      buildDots();
      if (elHero) elHero.hidden = true;
      elHub.hidden = true;
      elStoryHeader.hidden = false;
      stage.hidden = false;
      paint();
    }

    function renderHub() {
      mounted = false;
      if (elHero) elHero.hidden = false;
      var html = '';
      for (var idx = 0; idx < STORY_ORDER.length; idx++) {
        var st = STORIES[STORY_ORDER[idx]];
        html += '<a class="ecoeasy-hub-card" href="#' + st.id + '">' +
          '<span class="ecoeasy-hub-icon">' + (ICONS[st.icon] || '') + '</span>' +
          '<span class="ecoeasy-hub-num">이야기 ' + (idx + 1) + '</span>' +
          '<span class="ecoeasy-hub-title">' + escapeHtml(st.label) + '</span>' +
          '<span class="ecoeasy-hub-dek">' + escapeHtml(st.dek) + '</span>' +
          '<span class="ecoeasy-hub-count">' + st.slides.length + '장</span>' +
          '</a>';
      }
      elHub.innerHTML = html;
      elHub.hidden = false;
      elStoryHeader.hidden = true;
      stage.hidden = true;
    }

    function getStoryIdFromHash() {
      var h = (location.hash || '').replace(/^#/, '');
      return STORIES[h] ? h : null;
    }

    function route() {
      var id = getStoryIdFromHash();
      if (id) { renderStory(id); } else { renderHub(); }
    }

    btnPrev.addEventListener('click', function () { goTo(i - 1); });
    btnNext.addEventListener('click', function () { goTo(i + 1); });
    elBack.addEventListener('click', function () {
      if (location.hash) { location.hash = ''; } else { renderHub(); }
    });
    window.addEventListener('hashchange', route);

    // 키보드 ← / → 로 이동 (스토리 보는 중에만)
    document.addEventListener('keydown', function (e) {
      if (!mounted) return;
      var tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(i + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(i - 1); }
    });

    route();
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
