// Blog Posts Data Structure
// All blog posts are stored here as JavaScript objects
// Content is loaded dynamically from Markdown files in the posts/ directory

// Category/tag 표준 목록은 data/taxonomy.json 이 단일 소스다.
// 새 글은 `node scripts/new-post.js` 로 추가하고, 추가 후
// `node scripts/validate-posts.js` 를 돌린다.

const posts = [
  {
    id: 'attribution-basics',
    world: 'both',
    worldNote: '닫힌 생태계는 클릭·구매를 자기 데이터로 한 회사 안에서 다 이어 붙여 ‘누구 공인지’ 나눈다. 열린 RTB는 흩어진 기록을 쿠키·외부 측정업체로 억지로 꿰매야 해 훨씬 지저분하다.',
    title: '어트리뷰션: 그 전환은 누구 공인가 — 라스트클릭부터 멀티터치·증분까지',
    excerpt: '민지가 운동화를 샀다 — 며칠 전 인스타 광고, 어제 검색광고, 스쳐 간 유튜브 중 누구 공일까? 하나의 전환에 공을 나눠 주는 규칙(라스트클릭·멀티터치)과 어트리뷰션 윈도우, 실제 도구(AppsFlyer·Adjust·Airbridge)와 iOS ATT의 벽, 그리고 ‘공 나누기’와 ‘진짜 효과(증분)’가 왜 다른지를 예시로 푼다.',
    date: '2026-06-21',
    categories: ['Measurement & Modeling'],
    tags: ['Attribution', 'Incrementality', 'Causal Inference', '입문'],
    contentUrl: 'posts/attribution-basics.md',
  },
  {
    id: 'header-bidding',
    world: 'open-rtb',
    worldNote: '헤더비딩은 여러 구매자를 동시에 불러 값을 올리는, 열린 RTB의 기술이다. 네이버·카카오 같은 닫힌 생태계는 자기 광고 자리를 자기가 파니 밖에서 경쟁을 붙일 일이 없어 이 기술 자체가 필요 없다.',
    title: '헤더비딩: 한 줄로 세우지 말고 동시에 — 매체 수익을 +10~30% 올리는 법',
    excerpt: '같은 광고 자리를 파는 방법만 바꿔 매체 수익을 평균 +10~30% 올린 기술. 구매처를 순서대로 부르던 Waterfall의 손해, 페이지 머리(header)의 Prebid.js가 동시에 부르며 가격을 끌어올리는 원리, 클라이언트 vs 서버 사이드(Google Open Bidding·Amazon TAM), 그리고 1st-price 전환과의 관계까지 숫자 예시로 정리한다.',
    date: '2026-06-21',
    categories: ['Bidding & Auction'],
    tags: ['RTB', 'SSP', 'Ad Ecosystem', '입문'],
    contentUrl: 'posts/header-bidding.md',
  },
  {
    id: 'pctr-prediction',
    world: 'both',
    worldNote: '누를 확률을 맞히는 건 양쪽 다 똑같이 중요하다. 닫힌 생태계는 자기 로그인 데이터로 더 정확히 맞히고, 열린 RTB의 광고주는 남의 지면 신호와 쿠키만으로 맞혀야 해 불리하다.',
    title: 'pCTR: ‘이 사람이 누를까?’를 맞히는 확률, 그리고 그게 왜 돈이 되나',
    excerpt: 'DSP가 “₩1,200 내겠다”고 부를 때 그 값은 단 하나의 숫자에서 나온다 — ‘이 사람이 이 광고를 누를 확률(pCTR)’. pCTR이 무엇이고, 왜 입찰가와 광고 줄 세우기를 모두 좌우하는 ‘광고의 심장’인지, 어떻게 그 확률을 맞히고 왜 보정(Calibration)이 필요한지를 수식 없이 예시로 푼다.',
    date: '2026-06-21',
    categories: ['Measurement & Modeling'],
    tags: ['pCTR', 'pCVR', 'Calibration', 'Ad Ranking', '입문'],
    contentUrl: 'posts/pctr-prediction.md',
  },
  {
    id: 'second-price-auction',
    world: 'open-rtb',
    worldNote: '네이버·카카오 같은 닫힌 생태계는 경매를 자기가 직접 연다. 그래서 모든 입찰가를 다 볼 수 있어, ‘져서 남이 얼마 썼는지 못 보는’ 문제 자체가 없다.',
    title: '2등 가격 경매(Second-Price): 이겨도 왜 2등 값만 낼까 — 그리고 광고판은 왜 1등 가격으로 옮겨갔나',
    excerpt: '경매에서 이겼는데 왜 2등이 적어낸 값만 낼까? 솔직하게 부르는 게 이득이 되도록 설계된 2등 가격 경매(Vickrey)의 직관을 eBay 자동입찰·숫자 예시로 풀고, 광고판이 2019년 1등 가격으로 옮겨가며 Bid Shading이 등장한 이유까지 정리한다.',
    date: '2026-06-21',
    categories: ['Bidding & Auction'],
    tags: ['RTB', 'Bid Shading', 'Ad Ecosystem', '입문'],
    contentUrl: 'posts/second-price-auction.md',
  },
  {
    id: 'dsp-ssp-exchange',
    world: 'open-rtb',
    worldNote: '열린 RTB에선 광고를 사는 쪽·파는 쪽·경매장이 서로 다른 회사다. 닫힌 생태계는 이 셋을 한 회사가 다 가져 경계가 안 보인다 — 네이버 GFA·카카오모먼트가 그 ‘사는 쪽’ 도구다.',
    title: 'DSP·SSP·Ad Exchange: 각각 뭐 하는 곳인가 — 실제 예시로',
    excerpt: '광고주와 사용자 사이엔 세 명의 중개인이 있다 — 파는 쪽 대리인 SSP, 사는 쪽 대리인 DSP, 둘이 만나는 경매장 Ad Exchange. 각각이 무슨 일을 하는지, 어떤 실제 회사(DV360·The Trade Desk·Magnite·네이버 GFA·카카오모먼트…)가 그 역할인지, 그리고 0.1초 한 장면으로 어떻게 맞물리는지 수식 없이 풀고 한눈 비교표로 닫는다.',
    date: '2026-06-21',
    categories: ['Bidding & Auction'],
    tags: ['Ad Ecosystem', 'DSP', 'SSP', 'RTB', '입문'],
    contentUrl: 'posts/dsp-ssp-exchange.md',
  },
  {
    id: 'kakao-ads-products',
    world: 'walled-garden',
    worldNote: '카카오 광고는 사는 쪽 도구처럼 보여도 밖의 경매장을 거치지 않는다. 광고를 사고파는 곳과 실을 자리가 모두 카카오 한 회사라, 자기 안에서만 경매가 돈다.',
    title: '카카오 광고 상품 지도: 비즈보드·모먼트·키워드광고는 우리가 배운 무엇인가',
    excerpt: '카카오톡 채팅탭 위 비즈보드 배너 한 칸은, 우리가 배운 디스플레이 경매·eCPM 랭킹의 실물이다. 비즈보드·카카오모먼트·키워드광고·톡채널 메시지 같은 실제 상품을 하나씩 짚어, 각각이 블로그가 다룬 어떤 개념의 응용인지 연결하는 카카오 광고 3부작의 1편 — 무엇이 팔리고 어떻게 줄 세워지는가.',
    date: '2026-06-13',
    categories: ['Bidding & Auction'],
    tags: ['Ad Ecosystem', 'DSP', 'SSP', 'eCPM', '입문'],
    contentUrl: 'posts/kakao-ads-products.md',
    featured: true,
    series: 'kakao-adtech'
  },
  {
    id: 'kakao-ads-prediction-targeting',
    world: 'walled-garden',
    worldNote: '열린 RTB의 광고주는 여러 사이트를 따라다니는 남의 쿠키로 사람을 추정한다. 카카오는 톡·다음에 로그인한 자기 데이터로 맞히니, 예측의 출발점부터 다르다.',
    title: '카카오는 무엇으로 광고를 고르나: pCTR·톡 데이터·맞춤/유사타겟',
    excerpt: '비즈보드·모먼트는 무엇으로 광고를 고르나? 줄 세우기의 심장인 pCTR·pCVR 예측, 돈과 직결되는 보정(Calibration), 데모·맞춤·유사타겟, 그리고 톡·다음·맵을 합친 1st-party 데이터의 힘까지 — 카카오의 예측·타겟팅 층을 Deep CTR·멀티태스크·세그멘테이션·룩얼라이크·포지션 편향 글과 잇는 2편.',
    date: '2026-06-13',
    categories: ['Targeting & Audience', 'Measurement & Modeling'],
    tags: ['pCTR', 'Targeting', 'Segmentation', 'Lookalike', 'DMP'],
    contentUrl: 'posts/kakao-ads-prediction-targeting.md',
    series: 'kakao-adtech'
  },
  {
    id: 'kakao-ads-bidding-measurement',
    world: 'walled-garden',
    worldNote: '열린 RTB에선 경매에서 지면 남이 얼마 썼는지 못 봐서, 얼마 낼지 어림짐작으로 깎아야 한다. 카카오의 자동입찰은 플랫폼이 모든 입찰가를 다 보고 대신 정해주니 어림짐작이 필요 없다.',
    title: '카카오에서 캠페인이 굴러가는 법: 자동입찰·예산 페이싱·성과 측정',
    excerpt: '광고를 골랐으면 얼마를 입찰하고, 예산을 어떻게 나누며, 효과가 진짜였는지 재야 한다. 카카오의 자동입찰(=플랫폼이 대신 깎아주는 Bid Shading)·예산 페이싱·픽셀/SDK 전환 추적·증분효과 측정을, Auto-Bidding·로그 파이프라인·인과추론 글과 잇는 카카오 광고 3부작의 마지막 편.',
    date: '2026-06-13',
    categories: ['Bidding & Auction', 'Measurement & Modeling'],
    tags: ['Auto-Bidding', 'Bid Shading', 'Attribution', 'Incrementality', 'eCPM'],
    contentUrl: 'posts/kakao-ads-bidding-measurement.md',
    series: 'kakao-adtech'
  },
  {
    id: 'software-architecture-patterns',
    world: 'na',
    title: '소프트웨어 아키텍처 패턴 6가지 쉽게 이해하기: 이벤트 기반·계층형·모놀리식·마이크로서비스·MVC·마스터-슬레이브',
    excerpt: '집을 짓는 방식이 여러 가지이듯, 소프트웨어도 \'어떻게 짜맞출지\'의 정형화된 설계도가 있다. 컴포넌트가 \'사건\'으로 대화하는 이벤트 기반, 책임을 층층이 쌓는 계층형, 한 덩어리로 만드는 모놀리식, 잘게 쪼개는 마이크로서비스, 화면·로직·데이터를 나누는 MVC, 읽기/쓰기를 분산하는 마스터-슬레이브까지 — 6가지 대표 패턴을 일상 비유와 도식으로 풀고, 언제 무엇을 고를지까지 정리한다.',
    date: '2026-06-07',
    categories: ['Software Engineering'],
    tags: ['Software Architecture', 'System Design', 'Microservices', 'Event-Driven', '입문'],
    contentUrl: 'posts/software-architecture-patterns.md',
    featured: true,
    series: 'engineering-foundations'
  },
  {
    id: 'kubernetes-networking',
    world: 'na',
    title: '쿠버네티스 네트워킹 쉽게 이해하기: Pods → Services → Ingress, 트래픽은 어떻게 흐르는가',
    excerpt: '사용자의 요청 한 건이 쿠버네티스 클러스터 안에서 어떻게 앱까지 도착할까? 앱이 도는 \'집\' Pod, 그 집들을 안정적으로 이어주는 \'길\' Service, 도시 밖에서 들어오는 입구 \'성문\' Ingress — 이 세 가지가 어떻게 협력하는지 비유와 트래픽 흐름 도식으로 풀어낸다. Pod는 왜 자꾸 바뀌고(ephemeral), 그래서 왜 안정적 주소(Service)와 입구(Ingress)가 필요한지까지.',
    date: '2026-06-07',
    categories: ['Software Engineering'],
    tags: ['Kubernetes', 'Networking', 'DevOps', 'System Design', '입문'],
    contentUrl: 'posts/kubernetes-networking.md',
    series: 'engineering-foundations'
  },
  {
    id: 'causal-inference-101',
    world: 'both',
    worldNote: '광고의 ‘진짜 효과’를 재는 방법은 양쪽 공통이다. 닫힌 생태계는 자기 유저를 광고 보임/안 보임으로 직접 나눠 깨끗이 잴 수 있고, 노출을 통제 못 하는 열린 RTB는 이런 우회 기법에 더 기댄다.',
    title: '인과추론 입문: 상관과 인과는 왜 다른가 — 반사실, 교란변수, 그리고 \'안 일어난 세계\'의 문제',
    excerpt: '아이스크림이 많이 팔린 날 익사 사고도 많다 — 그렇다고 아이스크림이 익사를 부르나? 상관과 인과를 가르는 \'숨은 원인(교란변수)\', 같은 사람의 두 세계를 동시에 못 보는 반사실의 근본 난제, 두 무리가 원래 다를 때 생기는 선택편향까지. 광고 효과 측정이 왜 인과추론 문제인지, 그리고 그걸 푸는 두 갈래 길(랜덤 실험 vs 준실험)을 비유와 그림으로 풀어내는 인과추론 트랙의 출발점.',
    date: '2026-06-07',
    categories: ['Measurement & Modeling'],
    tags: ['Causal Inference'],
    contentUrl: 'posts/causal-inference-101.md',
    series: 'causal-inference-track'
  },
  {
    id: 'rct-randomized-experiment',
    world: 'both',
    worldNote: '누구에게 광고를 보일지 동전 던지듯 나누는 방법은 양쪽 공통이다. 닫힌 생태계는 자기 유저를 직접 그렇게 나눌 수 있고, 최종 노출을 매체가 쥔 열린 RTB의 광고주는 깔끔한 랜덤 배정이 어렵다.',
    title: '랜덤 실험(RCT): 동전 던지기 하나가 어떻게 \'진짜 효과\'를 증명하는가',
    excerpt: '약을 먹은 사람이 빨리 나았다 — 약 덕분인가, 원래 건강해서인가? 누가 처치를 받을지 동전 던지기로 정하면 교란변수가 양쪽에 골고루 섞여 두 그룹이 \'쌍둥이\'가 된다. 그래서 차이가 곧 순수 효과다. A/B 테스트가 왜 인과추론의 황금기준인지, 랜덤화가 편향을 없애는 원리와 그 한계(못 하는 경우)를 비유와 수식으로 풀어낸다.',
    date: '2026-06-07',
    categories: ['Measurement & Modeling'],
    tags: ['Causal Inference', 'A/B Testing'],
    contentUrl: 'posts/rct-randomized-experiment.md',
    series: 'causal-inference-track'
  },
  {
    id: 'difference-in-differences',
    world: 'both',
    worldNote: '이런 우회 기법은 깔끔한 랜덤 실험이 안 될 때 쓴다. 자기 유저를 직접 나눌 수 있는 닫힌 생태계는 덜 필요하고, 노출을 통제 못 하는 열린 RTB에서 더 요긴하다.',
    title: '이중차분법(DiD) 쉽게 이해하기: 차이를 두 번 빼서 \'진짜 효과\'만 남기는 법',
    excerpt: '광고를 켠 뒤 매출이 올랐다 — 광고 덕분일까, 그냥 성수기일까? 단순 전후 비교는 시간 효과에, 단순 그룹 비교는 원래 차이에 속는다. 광고를 안 한 옆 동네를 \'대역 배우\'로 세워 (처치군 변화)−(대조군 변화)로 자연 증가를 걷어내는 이중차분의 직관을, 서울/부산 숫자와 평행추세 그림으로 풀어낸다. 교차항 회귀식의 β₃가 왜 곧 효과인지, 그리고 A/B를 못 돌릴 때 증분효과(incrementality)를 재는 도구로서의 DiD까지.',
    date: '2026-06-07',
    categories: ['Measurement & Modeling'],
    tags: ['Causal Inference', 'Incrementality', 'A/B Testing'],
    contentUrl: 'posts/difference-in-differences.md',
    series: 'causal-inference-track'
  },
  {
    id: 'regression-discontinuity',
    world: 'both',
    worldNote: '기준선 양옆을 비교하는 이 트릭도 랜덤 실험이 안 될 때의 우회로다. 노출을 직접 나눌 수 있는 닫힌 생태계는 덜 필요하고, 통제가 어려운 열린 RTB에서 더 자주 쓴다.',
    title: '회귀불연속(RDD): 합격컷 1점 차이가 만드는 자연 실험',
    excerpt: '79점과 80점, 사실상 같은 사람인데 한 명만 합격선을 넘었다. 이 \'컷오프 바로 위/아래\'를 비교하면 거의 실험에 가까운 비교가 된다. 어떤 기준선에서 처치가 갈릴 때 그 경계의 점프로 인과효과를 읽어내는 회귀불연속 설계 — 직관, 컷오프 국소효과 수식, 조작 없음 가정과 국소성 한계, 그리고 입찰가·빈도 캡 같은 광고 임계값 사례까지.',
    date: '2026-06-07',
    categories: ['Measurement & Modeling'],
    tags: ['Causal Inference'],
    contentUrl: 'posts/regression-discontinuity.md',
    series: 'causal-inference-track'
  },
  {
    id: 'instrumental-variables',
    world: 'both',
    worldNote: '원인을 직접 못 흔들 때 쓰는 우회 기법이다. 실험으로 직접 흔들 수 있는 닫힌 생태계는 덜 필요하고, 노출을 통제 못 하는 열린 RTB에서 더 자주 쓴다.',
    title: '도구변수(IV): 직접 못 흔드는 원인을, 바람을 빌려 미는 법',
    excerpt: '교란변수 때문에 X가 Y에 주는 진짜 효과를 못 볼 때, X를 \'우연히\' 흔드는 외부 손잡이(도구변수 Z)를 찾는다. 직접 못 미는 그네를 바람이 밀어준 만큼만 보고 효과를 추정하는 셈. 2SLS와 Wald 추정량의 직관, 도구가 갖춰야 할 세 조건(관련성·배제·독립성)과 약한 도구 문제, 그리고 광고 노출을 무작위화 못 할 때의 encouragement design 사례까지.',
    date: '2026-06-07',
    categories: ['Measurement & Modeling'],
    tags: ['Causal Inference'],
    contentUrl: 'posts/instrumental-variables.md',
    series: 'causal-inference-track'
  },
  {
    id: 'ab-test-vs-mab',
    world: 'both',
    worldNote: '여러 광고 중 승자를 고르는 실험은 양쪽 다 한다. 닫힌 생태계는 자기 트래픽을 마음대로 쪼개 직접 돌리고, 열린 RTB의 광고주는 트래픽을 매체가 쥐고 있어 자기 입찰·소재 범위 안에서만 실험한다.',
    title: 'A/B 테스트 vs 멀티암드 밴딧: 고정 트래픽과 적응형 트래픽, 그리고 Contextual은 왜 필요한가',
    excerpt: '50:50으로 나눠 기다리는 A/B 테스트와, 데이터가 쌓이는 대로 트래픽을 옮기는 밴딧은 무엇이 다른가? 광고 3개·하루 100노출·10일이라는 구체적 숫자와 일상 비유로 고정 트래픽 vs 적응형, 그리고 같은 광고라도 사람마다 다르게 보여주는 Contextual Bandit까지 쉽게 풀어냅니다.',
    date: '2026-06-05',
    categories: ['Bandits & Personalization'],
    tags: ['MAB', 'A/B Testing', 'Contextual Bandit', 'Exploration', 'Online Learning'],
    contentUrl: 'posts/ab-test-vs-mab.md',
    featured: true,
    series: 'bandits-track'
  },
  {
    id: 'adtech-30min-primer',
    world: ['open-rtb', 'walled-garden'],
    worldNote: '이 글이 그리는 ‘여러 회사가 경매로 주고받는’ 사슬은 열린 RTB의 모습이다. 네이버·카카오 같은 닫힌 생태계에선 그 사슬 전체가 한 회사 안으로 들어와 있다.',
    title: '30분만에 이해하는 광고 시스템: 생태계·경매·랭킹·측정 전체 지도 (입문 가이드)',
    excerpt: '완전 초보자를 위한 올인원 입문서. 생태계(DSP/SSP/Ad Exchange), 1st Price 경매와 Bid Shading, eCPM·pCTR·pCVR·Calibration, Attribution과 iOS ATT, 타겟팅·인프라까지 — 수식 없이 비유와 숫자로 한 번에 훑고, 이 블로그의 30편 포스트로 연결해 주는 허브입니다.',
    date: '2026-04-20',
    categories: ['Bidding & Auction'],
    tags: ['입문', 'Ad Ecosystem', 'RTB', 'DSP', 'SSP', 'pCTR', 'pCVR', 'Attribution', 'eCPM'],
    contentUrl: 'posts/adtech-30min-primer.md',
    featured: true,
    series: 'getting-started'
  },
  {
    id: 'audience-segmentation',
    world: ['open-rtb', 'walled-garden'],
    worldNote: '이 글은 두 종류의 데이터 창고를 나눠 다룬다. 열린 RTB는 여러 사이트에서 긁어모은 남의 데이터 창고(DMP)를, 닫힌 생태계는 자기 고객 데이터 창고(CDP)를 쓴다.',
    title: '오디언스 세그멘테이션: 광고 타겟팅의 첫 번째 질문 — 누구에게 보여줄 것인가',
    excerpt: 'Demographic, Behavioral, RFM, Lifecycle 세그멘트 분류 체계부터 Rule-based SQL, ML Clustering(K-Means, GMM), 실시간 스트리밍 할당, Feature Store 연동, DMP vs CDP, GDPR/CCPA까지 — 세그멘테이션 전체를 해부합니다.',
    date: '2026-04-13',
    categories: ['Targeting & Audience'],
    tags: ['Segmentation', 'Targeting', 'Ad Ecosystem', 'DMP', 'CDP', 'ML Infra'],
    contentUrl: 'posts/audience-segmentation.md',
  },
  {
    id: 'lookalike-modeling',
    world: ['open-rtb', 'walled-garden'],
    worldNote: '닮은 유저를 대량으로 찾는 기법은 양쪽 다 쓴다. 메타·네이버는 자기 고객 데이터로, 열린 RTB의 광고주는 여러 사이트를 따라다니는 쿠키로 찾는 게 차이다.',
    title: 'Lookalike Modeling: 전환 유저 100명에서 100만 유사 유저를 발굴하는 법',
    excerpt: 'Seed Audience 선정부터 Embedding 유사도, Propensity Score, Graph Expansion까지 — 3대 접근법과 Expansion Ratio 트레이드오프, 멀티 플랫폼 비교, 프로덕션 아키텍처를 해부합니다.',
    date: '2026-04-13',
    categories: ['Targeting & Audience'],
    tags: ['Lookalike', 'Targeting', 'Ad Ecosystem', 'ML Infra', 'Two-Tower'],
    contentUrl: 'posts/lookalike-modeling.md',
  },
  {
    id: 'git-practical-guide',
    world: 'na',
    title: '실무에서 바로 쓰는 Git 완전 가이드: 시각적으로 이해하는 fetch, merge, rebase, stash',
    excerpt: 'Working Directory → Staging → Local Repo → Remote Repo 멘탈 모델부터 fetch vs pull, merge vs rebase 비교, stash 활용, 충돌 해결, 실무 브랜치 전략까지 — 다이어그램으로 완전 해부합니다.',
    date: '2026-04-12',
    categories: ['DevOps & Tooling'],
    tags: ['Git', 'DevOps', 'Workflow', 'Collaboration'],
    contentUrl: 'posts/git-practical-guide.md',
    series: 'engineering-foundations'
  },
  {
    id: 'ad-log-pipeline',
    world: 'both',
    worldNote: '로그가 곧 학습 데이터라는 본질은 양쪽 같다. 닫힌 생태계는 한 회사가 모든 입찰을 다 찍어 로그 잇기가 단순하고, 열린 RTB는 이기고 진 기록이 여러 회사에 흩어져 훨씬 복잡하다.',
    title: '광고 시스템 로그 파이프라인: 한 번의 입찰에서 10개의 로그가 만들어지는 구조',
    excerpt: 'Request Log부터 Attribution Log까지 — 광고 시스템의 10가지 핵심 로그가 언제, 어디서, 무엇을 기록하고, ML 학습 데이터로 어떻게 합류하는지 전체 파이프라인을 해부합니다.',
    date: '2026-04-12',
    categories: ['ML Infrastructure'],
    tags: ['ML Infra', 'pCTR', 'Ad Ecosystem', 'DSP'],
    contentUrl: 'posts/ad-log-pipeline.md',
  },
  {
    id: 'ltv-ad-ranking',
    world: 'walled-garden',
    worldNote: '노출당 수익만 보면 광고를 자꾸 띄워 유저가 떠나는 손해가 안 보인다. 지면·유저를 다 가진 닫힌 생태계만 그 손해까지 빼서 ‘오래 남을 유저’ 기준으로 순위를 매길 수 있다.',
    title: 'LTV(Long Term Value): eCPM 너머, 광고 랭킹의 진짜 기준',
    excerpt: 'eCPM만으로 광고를 정렬하면 왜 위험한가? 사용자 비용(β), Squashing Function까지 — 광고 플랫폼이 "돈"과 "경험"을 동시에 최적화하는 LTV 랭킹의 원리를 해부합니다.',
    date: '2026-04-11',
    categories: ['Bidding & Auction'],
    tags: ['eCPM', 'Ad Ranking', 'Ad Ecosystem', 'pCTR'],
    contentUrl: 'posts/ltv-ad-ranking.md',
  },
  {
    id: 'ad-log-system',
    world: 'both',
    worldNote: '요청·노출·클릭·전환 로그가 곧 학습 데이터라는 건 양쪽 공통이다. 닫힌 생태계는 한 회사가 다 찍어 로그가 한 줄로 이어지고, 열린 RTB는 여러 회사에 흩어지고 진 입찰가는 안 보여 잇기가 훨씬 어렵다.',
    title: '광고 로그 시스템 완전 해부: Request Log에서 Candidate Log까지',
    excerpt: 'Request, Impression, Click, Conversion, Candidate Log의 역할과 차이를 정리하고, 실시간 피처 파이프라인(Redis), Candidate Log 유무에 따른 모델 품질 차이, 멀티슬롯 rank=1 추론 문제까지 해부합니다.',
    date: '2026-04-11',
    categories: ['ML Infrastructure'],
    tags: ['ML Infra', 'pCTR', 'pCVR', 'Ad Ecosystem', 'Online Learning'],
    contentUrl: 'posts/ad-log-system.md',
  },
  {
    id: 'adtech-dev-layers',
    world: ['open-rtb', 'walled-garden'],
    worldNote: '여기 나오는 ‘입찰 최적화’ 층은 열린 RTB 얘기다 — 남의 경매에 얼마 낼지 정하는 일. 닫힌 생태계에선 이 층이 자기 안의 경매·순위 매기기로 바뀐다.',
    title: 'Ad Tech 개발 레이어 맵: 광고 요청 하나가 유저에게 도달하기까지',
    excerpt: '타겟팅, 서빙, 예측 모델링, 입찰 최적화, 소재 최적화, 측정까지 — 광고 시스템을 구성하는 8개 레이어의 역할과 요청 흐름을 전체 지도로 해부합니다.',
    date: '2026-04-11',
    categories: ['Bidding & Auction'],
    tags: ['Ad Ecosystem', 'pCTR', 'Auto-Bidding', 'ML Infra', 'RTB'],
    contentUrl: 'posts/adtech-dev-layers.md',
  },
  {
    id: 'negative-sampling-bias',
    world: 'both',
    worldNote: '학습 데이터가 ‘과거에 보여준 광고’에서만 생겨 처음부터 편향된다는 문제는 양쪽 공통이다. 닫힌 생태계는 자기 지면 노출을 다 봐서 편향이 단순하고, 이긴 노출만 보이는 열린 RTB는 보정이 더 까다롭다.',
    title: 'Negative Sampling & Sample Selection Bias: 광고 CTR 모델의 학습 데이터는 처음부터 편향되어 있다',
    excerpt: 'Class Imbalance, Negative Downsampling, Log-odds Correction, IPS, Doubly Robust Estimator까지 — 광고 CTR 모델 학습 데이터의 구조적 편향과 보정 기법을 해부합니다.',
    date: '2026-04-11',
    categories: ['Measurement & Modeling'],
    tags: ['pCTR', 'Ad Ecosystem', 'ML Infra'],
    contentUrl: 'posts/negative-sampling-bias.md',
  },
  {
    id: 'two-tower-retrieval',
    world: 'both',
    worldNote: '수백만 후보를 순식간에 추리는 기법은 양쪽 공통이다. 닫힌 생태계는 자기 지면에 여러 광고를 줄 세우려 크게 돌리고, 열린 RTB의 광고주는 노출 한 자리에 낼 입찰 후보를 추리는 데 쓴다.',
    title: 'Two-Tower Model & 광고 후보 생성: 수백만 광고에서 10ms 안에 후보를 추리는 법',
    excerpt: 'Rule-based Retrieval의 한계부터 Two-Tower(DSSM) 아키텍처, Negative Sampling 전략, ANN 인덱스 비교, Multi-Interest Model까지 — 수백만 광고 후보에서 10ms 이내에 개인화된 후보를 추리는 Retrieval 시스템을 해부합니다.',
    date: '2026-04-11',
    categories: ['ML Infrastructure'],
    tags: ['Model Serving', 'ML Infra', 'pCTR'],
    contentUrl: 'posts/two-tower-retrieval.md',
  },
  {
    id: 'multi-task-learning',
    world: 'both',
    worldNote: '클릭과 전환을 한 모델로 함께 학습하는 기법은 양쪽 공통이다. 닫힌 생태계는 클릭·전환을 자사 로그로 끝까지 이어 정답이 깨끗하고, 열린 RTB는 전환이 외부에 있어 잇기 어렵고 늦게·일부만 도착한다.',
    title: 'Multi-Task Learning: pCTR과 pCVR을 동시에 학습하면 왜 더 좋은가',
    excerpt: 'Sample Selection Bias를 해결하는 ESMM, Negative Transfer를 완화하는 MMoE, Seesaw 현상을 해소하는 PLE까지 — 광고 시스템 Multi-Task Learning 아키텍처의 진화와 실무 선택 가이드를 해부합니다.',
    date: '2026-04-11',
    categories: ['Measurement & Modeling'],
    tags: ['pCTR', 'pCVR', 'Model Serving'],
    contentUrl: 'posts/multi-task-learning.md',
  },
  {
    id: 'exploration-exploitation',
    world: 'both',
    worldNote: '‘잘 되는 광고를 더 쓸까, 새 광고를 시험할까’라는 딜레마는 양쪽 공통이다. 닫힌 생태계는 자기 트래픽으로 새 광고에 노출을 직접 배정해 시험하고, 열린 RTB의 광고주는 노출을 못 줘 입찰가·소재 안에서만 시험한다.',
    title: '탐색과 활용(Exploration & Exploitation): 광고 시스템의 근본적 딜레마',
    excerpt: 'Epsilon-Greedy, UCB, Thompson Sampling, Contextual Bandit의 탐색 전략을 비교하고, 새 광고·새 유저의 Cold-Start 문제 해법과 프로덕션 탐색 시스템 설계까지 다룹니다.',
    date: '2026-04-11',
    categories: ['Bandits & Personalization'],
    tags: ['MAB', 'Contextual Bandit', 'UCB', 'Thompson Sampling'],
    contentUrl: 'posts/exploration-exploitation.md',
  },
  {
    id: 'deep-ctr-models',
    world: 'both',
    worldNote: '클릭 예측 모델의 구조 자체는 양쪽 그대로다. 닫힌 생태계는 자기 로그인 기반 행동 기록을 풍부히 넣고, 열린 RTB는 쿠키·광고 요청 신호로 제한적으로 넣는 게 차이다.',
    title: 'Deep CTR 모델의 진화: LR에서 DIN까지, 광고 클릭률 예측의 핵심 아키텍처',
    excerpt: 'LR, FM, Wide&Deep, DeepFM, DCN-v2, DIN, DIEN — CTR 예측 모델이 "어떤 문제를 풀려고 했는가" 관점으로 진화 과정을 추적하고, 프로덕션 선택 가이드까지 제시합니다.',
    date: '2026-04-11',
    categories: ['Measurement & Modeling'],
    tags: ['pCTR', 'Model Serving', 'ML Infra'],
    contentUrl: 'posts/deep-ctr-models.md',
  },
  {
    id: 'calibration',
    world: 'both',
    worldNote: '예측 확률을 실제에 맞게 바로잡는 건 양쪽 다 중요하다. 열린 RTB는 그 확률이 입찰가에 바로 곱해져 틀리면 곧 손해고, 닫힌 생태계도 과금·리포트 정확도 때문에 여전히 중요하다.',
    title: 'Calibration: AUC가 높아도 돈을 잃는 이유 — 광고 모델의 확률 보정',
    excerpt: 'AUC는 순서만 평가하고 확률값의 정확도는 평가하지 않습니다. Platt Scaling, Isotonic Regression, Temperature Scaling으로 pCTR을 보정하고, 프로덕션 Calibration 파이프라인을 구축하는 방법을 해부합니다.',
    date: '2026-04-11',
    categories: ['Measurement & Modeling'],
    tags: ['pCTR', 'Bid Shading', 'Auto-Bidding'],
    contentUrl: 'posts/calibration.md',
  },
  {
    id: 'ad-network-vs-exchange',
    world: 'open-rtb',
    worldNote: '애드네트워크·거래소는 광고주와 매체를 이어주는 중개상이다. 구글·메타·네이버·카카오처럼 한 회사가 다 가진 닫힌 생태계에선 중개할 상대가 없어 이 구분이 사라진다.',
    title: 'Ad Network vs Ad Exchange: 디지털 광고 유통 구조의 진화',
    excerpt: 'Waterfall에서 RTB, Header Bidding까지 — Ad Network과 Ad Exchange의 구조적 차이, 기술 아키텍처, 진화 과정을 해부합니다.',
    date: '2026-04-11',
    categories: ['Bidding & Auction'],
    tags: ['Ad Ecosystem', 'RTB', 'SSP', 'DSP'],
    contentUrl: 'posts/ad-network-vs-exchange.md',
  },
  {
    id: 'position-bias-ultr',
    world: 'walled-garden',
    worldNote: '위에 있는 광고가 더 눌리는 건 좋아서가 아니라 위에 있어서다 — 이 착시를 걷어내는 게 이 글의 주제다. 열린 RTB는 광고가 보통 한 개라 덜 중요하지만, 검색·피드에 광고가 여러 개 줄 서는 닫힌 생태계에선 핵심 문제다.',
    title: 'Position Bias & Unbiased Learning to Rank: 위치가 만드는 착각을 제거하는 법',
    excerpt: 'Examination Hypothesis, IPS(Inverse Propensity Scoring), DLA(Dual Learning Algorithm)로 Position Bias를 보정하고 광고 랭킹의 공정성을 확보하는 방법을 해부합니다.',
    date: '2026-04-10',
    categories: ['Measurement & Modeling'],
    tags: ['pCTR', 'Ad Ecosystem', 'MAB'],
    contentUrl: 'posts/position-bias-ultr.md',
  },
  {
    id: 'model-serving-architecture',
    world: 'both',
    worldNote: '예시는 열린 RTB 말투(0.01초 안에 응답, 낙찰률)로 쓰였지만, 여러 단계로 후보를 걸러 순식간에 점수 매기는 기법은 양쪽 그대로다. 닫힌 생태계에선 ‘경매에서 진다’ 대신 ‘내부 응답 시간’이 제약이 된다.',
    title: '광고 모델 서빙 아키텍처: 10ms 안에 수백 개 광고를 스코어링하는 법',
    excerpt: 'Multi-Stage Ranking, 모델 경량화(Distillation/Quantization), Embedding 최적화, GPU/CPU 추론 전략, Canary 배포까지 — 프로덕션 광고 ML 서빙의 전체 아키텍처를 해부합니다.',
    date: '2026-04-10',
    categories: ['ML Infrastructure'],
    tags: ['Model Serving', 'ML Infra', 'pCTR'],
    contentUrl: 'posts/model-serving-architecture.md',
  },
  {
    id: 'online-learning-delayed-feedback',
    world: 'both',
    worldNote: '모델이 시간이 지나 낡는 문제는 양쪽 다 겪는다. 닫힌 생태계는 전환 결과가 자사 로그로 바로 들어와 덜 낡고, 열린 RTB는 결과가 늦게·여기저기서 와서 더 빨리 낡는다.',
    title: 'Online Learning & Delayed Feedback: 광고 모델은 왜 매일 낡아지는가',
    excerpt: 'Concept Drift, Batch vs Online Learning, Delayed Feedback 보정(FSIW, Delay Model), 프로덕션 하이브리드 아키텍처, 모델 Staleness 모니터링까지 — 광고 ML 모델을 최신 상태로 유지하는 전체 파이프라인을 해부합니다.',
    date: '2026-04-10',
    categories: ['ML Infrastructure'],
    tags: ['Online Learning', 'ML Infra', 'pCTR', 'pCVR'],
    contentUrl: 'posts/online-learning-delayed-feedback.md',
  },
  {
    id: 'auto-bidding-pacing',
    world: 'open-rtb',
    worldNote: '이 글은 남의 경매에 참여하는 열린 RTB의 자동입찰·예산 배분을 다룬다. 닫힌 생태계는 플랫폼이 경매를 직접 쥐고 있어, 남들이 얼마 쓸지 추정할 필요 없이 자기 신호만으로 예산 속도를 조절한다.',
    title: 'Auto-Bidding & Budget Pacing: 일 예산 제약 하에서 수십만 번 입찰을 최적화하는 법',
    excerpt: 'PID Controller, Lagrangian Dual, 강화학습(RL)으로 일 예산을 하루 전체에 걸쳐 균등하게 분배하는 Budget Pacing의 이론과 실전을 해부합니다.',
    date: '2026-04-10',
    categories: ['Bidding & Auction'],
    tags: ['Auto-Bidding', 'Bid Shading', 'RTB'],
    contentUrl: 'posts/auto-bidding-pacing.md',
  },
  {
    id: 'feature-store-serving',
    world: 'both',
    worldNote: '예시는 열린 RTB 말투(광고 요청·낙찰)로 쓰였지만, 예측 재료를 모아두고 실시간으로 꺼내 쓰는 방식은 양쪽 그대로다. 데이터가 어디서 오느냐만 다르다.',
    title: 'Feature Store & Real-Time Serving: 광고 ML 시스템의 데이터 공급망 전체 지도',
    excerpt: 'Batch·Streaming·Real-Time 세 갈래 파이프라인이 Feature Store로 합류하고, 10ms 안에 Feature Vector로 조합되어 모델 추론에 공급되는 전체 아키텍처를 해부합니다.',
    date: '2026-04-10',
    categories: ['ML Infrastructure'],
    tags: ['ML Infra', 'DSP', 'pCTR'],
    contentUrl: 'posts/feature-store-serving.md',
  },
  {
    id: 'ecpm-ranking',
    world: ['open-rtb', 'walled-garden'],
    worldNote: '노출당 기대수익(eCPM)으로 순위를 매기는 건 공통이지만 시장마다 계산이 다르다. 이 글은 열린 RTB·클릭당 과금 거래소·닫힌 생태계 세 시장의 순위 매기기를 나란히 비교한다.',
    title: 'eCPM과 광고 랭킹: 서로 다른 시장에서 1등을 결정하는 기준',
    excerpt: 'eCPM의 정의와 계산법을 정리하고, Open RTB·CPC Exchange·Walled Garden 세 가지 시장에서 광고 랭킹이 어떻게 달라지는지 구체적 시나리오로 비교합니다.',
    date: '2026-04-11',
    categories: ['Bidding & Auction'],
    tags: ['Ad Ecosystem', 'pCTR', 'RTB'],
    contentUrl: 'posts/ecpm-ranking.md',
  },
  {
    id: 'walled-garden',
    world: ['walled-garden', 'open-rtb'],
    worldNote: '이 글이 바로 ‘닫힌 생태계 vs 열린 RTB’ 개념의 기준점이다. 한 회사가 경매를 직접 열어 모든 입찰가를 다 보니, 열린 RTB처럼 ‘져서 남 값을 못 보는’ 일이 없다.',
    title: 'Walled Garden: 네이버·카카오는 왜 DSP부터 Publisher까지 다 가지고 있는가',
    excerpt: 'Open RTB와 Walled Garden(폐쇄형 생태계)의 구조적 차이를 분석하고, pCTR 모델링·경매 구조·데이터 활용이 어떻게 달라지는지 해부합니다.',
    date: '2026-04-06',
    categories: ['Bidding & Auction'],
    tags: ['Ad Ecosystem', 'DSP', 'SSP', 'RTB', 'pCTR'],
    contentUrl: 'posts/walled-garden.md',
  },
  {
    id: 'adtech-ecosystem-map',
    world: ['open-rtb', 'walled-garden'],
    worldNote: '이 글이 그리는 ‘사는 쪽-경매장-파는 쪽’ 사슬은 열린 RTB의 모습이다. 닫힌 생태계에선 이 사슬이 한 회사로 접혀, 이기고 진 기록 없이 자기 데이터만으로 예측·순위를 돌린다.',
    title: 'pCTR 모델러를 위한 광고 기술 생태계 전체 지도',
    excerpt: '광고주의 캠페인 등록부터 유저의 전환까지 — DSP, SSP, Ad Exchange, pCTR, pCVR, 자동입찰, Bid Shading의 관계를 6개 다이어그램으로 완전 해부합니다.',
    date: '2026-04-06',
    categories: ['Bidding & Auction'],
    tags: ['Ad Ecosystem', 'pCTR', 'pCVR', 'Auto-Bidding', 'Bid Shading'],
    contentUrl: 'posts/adtech-ecosystem-map.md',
    featured: true
  },
  {
    id: 'bid-shading-censored',
    world: 'open-rtb',
    worldNote: '이 글의 문제 — 얼마 낼지 몰라 입찰가를 깎는 일 — 은 ‘져도 남 값을 못 보는’ 열린 RTB에서만 생긴다. 닫힌 생태계는 모든 입찰가를 실제로 다 보고 경매를 직접 여니 이런 고민이 아예 없다.',
    title: 'Bid Shading & Censored Data: 1st Price Auction에서 최적 입찰가를 찾는 법',
    excerpt: 'Right-Censored 데이터에서 시장 분포를 추정하고, Surplus를 극대화하는 최적 입찰가를 실시간으로 계산하는 End-to-End 파이프라인을 두 편의 논문과 함께 해부합니다.',
    date: '2026-04-06',
    categories: ['Bidding & Auction'],
    tags: ['Bid Shading', 'RTB', 'pCTR'],
    contentUrl: 'posts/bid-shading-censored.md',
  },
  {
    id: 'my-markdown-post',
    world: 'both',
    worldNote: '클릭한 것만 학습해 생기는 편향, 같은 전환이 여러 번 잡히는 문제는 양쪽 공통이다. 닫힌 생태계는 전환을 자사 로그로 직접 봐 걸러내기 쉽고, 열린 RTB는 전환이 외부 여러 경로로 들어와 중복 걸러내기가 훨씬 어렵다.',
    title: 'pCVR 모델링 학습 시 주요 고려사항 및 중복 전환(Deduplication) 이슈 정리',
    excerpt: 'pCVR 모델 학습에서 발생하는 중복 전환(Deduplication) 이슈와 주요 고려사항을 정리합니다.',
    date: '2026-01-10',
    categories: ['Measurement & Modeling'],
    tags: ['pCVR', 'pCTR'],
    contentUrl: 'posts/pCVR-modeling.md',
  },
  {
    id: 'TS-linTS',
    world: 'both',
    worldNote: '톰슨 샘플링 같은 탐색·활용 알고리즘은 무대를 안 가린다. 닫힌 생태계는 자기 지면에 어떤 광고를 띄울지 고르는 데 쓰고, 열린 RTB의 광고주는 어떤 입찰에 참여할지 고르는 데 쓴다 — 적용 지점만 다르다.',
    title: 'Standard TS vs Linear TS',
    excerpt: '개별 광고 ID를 학습하는 Standard TS와 Feature 가중치를 학습하는 Linear TS의 핵심 차이를 비교합니다.',
    date: '2026-01-03',
    categories: ['Bandits & Personalization'],
    tags: ['Thompson Sampling', 'MAB', 'Contextual Bandit'],
    contentUrl: 'posts/TS-linTS.md',
  },
  {
    id: 'mab-summary',
    world: 'both',
    worldNote: '여기 모은 밴딧 알고리즘들은 무대를 안 가리는 순수 기법이다. 닫힌 생태계는 자기 지면 노출을 직접 배정하며 쓰고, 열린 RTB의 광고주는 어떤 입찰에 참여할지 고르는 데 쓴다.',
    title: '[Summary] AdTech MAB Algorithm Collection',
    excerpt: 'AdTech 엔지니어의 시각에서 정리한 MAB 알고리즘 총정리 (Context-Free, Contextual, Hybrid)',
    date: '2026-01-17',
    categories: ['Bandits & Personalization'],
    tags: ['MAB', 'LinUCB', 'Thompson Sampling', 'UCB'],
    contentUrl: 'posts/mab.md',
  },
  {
    id: 'ucb-vs-ts',
    world: 'both',
    worldNote: 'UCB든 톰슨 샘플링이든 탐색·활용 원리는 무대를 안 가린다. 닫힌 생태계는 자기 지면에 띄울 광고를 고르는 데, 열린 RTB의 광고주는 참여할 입찰을 고르는 데 쓴다 — 적용 지점만 다르다.',
    title: 'UCB vs Thompson Sampling: 결정적(Deterministic) vs 확률적(Stochastic)',
    excerpt: 'UCB는 계산기, TS는 주사위? MAB의 두 거대 산맥인 UCB와 Thompson Sampling의 결정적인 차이를 직관적으로 비교합니다.',
    date: '2026-01-17',
    categories: ['Bandits & Personalization'],
    tags: ['UCB', 'Thompson Sampling', 'MAB'],
    contentUrl: 'posts/ucb_ts.md',
  },
  {
    id: 'disjoint-linucb',
    world: 'both',
    worldNote: 'LinUCB 같은 밴딧 기법은 무대를 안 가린다. 닫힌 생태계는 자기 지면 노출을 직접 배정하며 쓰고, 열린 RTB의 광고주는 어떤 입찰에 참여할지 고르는 데 쓴다.',
    title: 'Disjoint LinUCB 모델 상세 해석',
    excerpt: 'LinUCB의 핵심 공식인 "최종 점수 = 예측(Exploitation) + 불확실성(Exploration)"을 시각화와 함께 해석합니다.',
    date: '2026-01-20',
    categories: ['Bandits & Personalization'],
    tags: ['LinUCB', 'Contextual Bandit', 'MAB'],
    contentUrl: 'posts/disjoint-LinUCB.md',
  },
  {
    id: 'ad-serving-flow',
    world: 'open-rtb',
    worldNote: '이 글은 여러 회사(사는 쪽·경매장·파는 쪽)를 거쳐 광고가 뜨는 열린 RTB 흐름을 그린다. 닫힌 생태계는 이 셋이 한 회사라, 중간 단계 없이 자기 안에서 순위를 매겨 바로 광고를 띄운다.',
    title: 'Ad Serving Flow: 광고가 유저에게 도달하는 전체 과정',
    excerpt: 'DSP, SSP, Ad Exchange, DMP의 역할과 RTB Auction 플로우를 도식도와 함께 정리합니다.',
    date: '2026-01-25',
    categories: ['Bidding & Auction'],
    tags: ['Ad Ecosystem', 'DSP', 'SSP', 'RTB'],
    contentUrl: 'posts/ad-serving-flow.md',
    series: 'getting-started'
  },
  {
    id: 'ucb-family',
    world: 'both',
    worldNote: 'UCB 계열 알고리즘은 무대를 안 가리는 순수 기법이다. 닫힌 생태계는 자기 지면에 띄울 광고를 고르는 데, 열린 RTB의 광고주는 참여할 입찰을 고르는 데 쓴다 — 적용 지점만 다르다.',
    title: 'UCB 알고리즘 패밀리: UCB1 vs LinUCB vs Hybrid LinUCB',
    excerpt: 'UCB 계열 알고리즘 3종의 수식, 작동 방식, Cold Start 대응력을 상세 비교합니다.',
    date: '2026-02-01',
    categories: ['Bandits & Personalization'],
    tags: ['UCB', 'LinUCB', 'MAB', 'Contextual Bandit'],
    contentUrl: 'posts/ucb-family.md',
  },
];

// 읽는 순서(시리즈). 순서는 여기 한 곳에서만 관리한다(데모 learning-path와 동일 사상).
const series = {
  'kakao-adtech': {
    title: '카카오 광고 사례 트랙',
    desc: '비즈보드·모먼트·키워드광고 같은 실제 카카오 광고 상품을, 블로그가 다룬 광고 기술 개념과 하나씩 연결해 읽는 응용 트랙(상품 → 예측·타겟팅 → 입찰·측정)',
    posts: ['kakao-ads-products', 'kakao-ads-prediction-targeting', 'kakao-ads-bidding-measurement'],
  },
  'causal-inference-track': {
    title: '인과추론 트랙',
    desc: '상관과 인과의 차이부터, 실험을 못 할 때 효과를 캐내는 도구들(RCT·DiD·RDD·IV)까지',
    posts: ['causal-inference-101', 'rct-randomized-experiment', 'difference-in-differences', 'regression-discontinuity', 'instrumental-variables'],
  },
  'getting-started': {
    title: '광고 시스템 입문 경로',
    desc: '배경지식 없이 시작해 광고 생태계 전체를 한 바퀴',
    posts: ['adtech-30min-primer', 'ad-serving-flow', 'ad-network-vs-exchange', 'ecpm-ranking', 'ltv-ad-ranking'],
  },
  'bandits-track': {
    title: '밴딧 & 개인화 트랙',
    desc: 'A/B vs 밴딧 → MAB 기초 → UCB/TS → Contextual',
    posts: ['ab-test-vs-mab', 'mab-summary', 'exploration-exploitation', 'ucb-vs-ts', 'ucb-family', 'TS-linTS', 'disjoint-linucb'],
  },
  'modeling-track': {
    title: '예측 모델링 트랙',
    desc: 'CTR 모델 진화 → 보정 → 멀티태스크 → 편향 보정',
    posts: ['deep-ctr-models', 'calibration', 'multi-task-learning', 'negative-sampling-bias', 'position-bias-ultr'],
  },
  'ml-infra-track': {
    title: 'ML 인프라 트랙',
    desc: '로그 수집 → 피처스토어 → 검색 → 서빙 → 온라인 학습, 데이터에서 모델까지',
    posts: ['ad-log-pipeline', 'ad-log-system', 'feature-store-serving', 'two-tower-retrieval', 'model-serving-architecture', 'online-learning-delayed-feedback'],
  },
  'targeting-track': {
    title: '타겟팅 & 오디언스 트랙',
    desc: '세그멘테이션에서 룩얼라이크 확장까지',
    posts: ['audience-segmentation', 'lookalike-modeling'],
  },
  'advanced-bidding-track': {
    title: '입찰·생태계 심화 트랙',
    desc: '생태계 구조 → 개발 레이어 → 자동입찰·페이싱 → 입찰 셰이딩',
    posts: ['walled-garden', 'adtech-dev-layers', 'auto-bidding-pacing', 'bid-shading-censored'],
  },
  'engineering-foundations': {
    title: '엔지니어링 기초 트랙',
    desc: '협업 도구(Git)부터 시스템 설계(아키텍처 패턴)와 운영(쿠버네티스)까지 — 백엔드/인프라 엔지니어의 기본기',
    posts: ['git-practical-guide', 'software-architecture-patterns', 'kubernetes-networking'],
  },
};

// 홈 "시작하기" 레일 순서(큐레이션). featured와 독립적으로 시퀀스를 정한다.
const startHere = ['adtech-30min-primer', 'adtech-ecosystem-map', 'ad-serving-flow'];

// ML 엔지니어 트랙 — pCTR/pCVR 실무 커리큘럼 (ml-track.html 렌더용).
// posts의 id만 참조한다(검증기가 존재 여부 확인). 3단계는 신규 글이 늘며 채워진다.
// 주의: pCVR 글의 id는 레거시 'my-markdown-post' (URL 안정성 때문에 유지 — P3에서 별칭 처리 검토).
const mlTrack = {
  title: 'ML 엔지니어 트랙',
  subtitle: 'pCTR/pCVR 실무 커리큘럼 — 광고 ML의 심장을 입문부터 심화까지. 일반 독자도 지도처럼 훑어보세요.',
  stages: [
    {
      id: 'stage-1',
      title: '1단계 · 입문 — 예측이 돈이 되는 원리',
      goal: '이 단계를 마치면: pCTR/pCVR이 무엇이고, 왜 절대값(보정)이 중요하며, 어떤 모델로 맞히는지 큰 그림이 잡힙니다.',
      posts: ['pctr-prediction', 'ecpm-ranking', 'calibration', 'my-markdown-post', 'deep-ctr-models'],
    },
    {
      id: 'stage-2',
      title: '2단계 · 실무 — 데이터에서 서빙까지',
      goal: '이 단계를 마치면: 로그가 모델이 되기까지의 파이프라인과, 실서비스의 편향·지연 문제를 다룰 수 있습니다.',
      posts: ['ad-log-pipeline', 'feature-store-serving', 'model-serving-architecture', 'negative-sampling-bias',
        'online-learning-delayed-feedback', 'position-bias-ultr', 'multi-task-learning', 'two-tower-retrieval'],
    },
    {
      id: 'stage-3',
      title: '3단계 · 심화 — 탐색과 확장',
      goal: '이 단계를 마치면: 탐색-활용부터 피처 실전·지표 운영·랭킹 캐스케이드까지 실무 전체가 이어집니다. (신규 글 12편이 이 단계를 채워갑니다)',
      posts: ['exploration-exploitation'],
    },
  ],
};

// 글의 "무대"(경매 위치) 렌더용 메타. 값(id)은 data/taxonomy.json 의 worlds 와 동일(단일 소스).
// 'na'(광고 경매 무관)는 배지를 그리지 않으므로 여기 없음 → getWorldMeta 가 null 반환.
const WORLD_META = {
  'open-rtb':      { label: '열린 RTB', short: '경매 바깥',    tip: '외부 DSP가 남의 실시간 경매에 입찰. 패찰하면 경쟁가를 못 봄(censored).' },
  'walled-garden': { label: '닫힌 생태계',  short: '한 회사가 소유',    tip: '한 회사가 인벤토리·경매·데이터를 소유. 경매를 직접 돌려 모든 입찰을 관측.' },
  'both':          { label: '공통',     short: '두 세계',      tip: '두 세계 다 쓰는 기법. 데이터·전제만 다름.' },
};
function getWorldMeta(world) { return WORLD_META[world] || null; }
// post.world 는 문자열('open-rtb') 또는 배열(['open-rtb','walled-garden']) 둘 다 허용.
// 렌더용으로 항상 배열 반환('na'·미지정은 배지 없음 → 제외). 여러 세계를 다루는 글은 배지 여러 개.
function getWorldList(post) {
  if (!post || post.world == null) return [];
  const arr = Array.isArray(post.world) ? post.world : [post.world];
  return arr.filter(w => w && w !== 'na');
}

// Helper functions for data access
function getAllPosts() {
  return posts.slice().sort((a, b) => new Date(b.date) - new Date(a.date)); // slice로 원본 보존
}

function getPostById(id) {
  return posts.find(post => post.id === id);
}

function getAllCategories() {
  const categories = new Set();
  posts.forEach(post => {
    post.categories.forEach(category => categories.add(category));
  });
  return Array.from(categories).sort();
}

function getAllTags() {
  const tags = new Set();
  posts.forEach(post => {
    post.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
}

function toList(v) { return !v ? [] : (Array.isArray(v) ? v.filter(Boolean) : [v]); }

// searchTerm + category/tag(문자열 또는 배열). facet 안에서는 OR, facet 사이에서는 AND.
function filterPosts(searchTerm, category, tag) {
  const cats = toList(category);
  const tags = toList(tag);
  const q = (searchTerm || '').toLowerCase();
  return posts.filter(post => {
    const matchesSearch = !q
      || post.title.toLowerCase().includes(q)
      || (post.excerpt || '').toLowerCase().includes(q)
      || (post.tags || []).some(t => t.toLowerCase().includes(q));
    const matchesCategory = cats.length === 0 || cats.some(c => post.categories.includes(c));
    const matchesTag      = tags.length === 0 || tags.some(t => post.tags.includes(t));
    return matchesSearch && matchesCategory && matchesTag;
  });
}

function sortPosts(list, mode) {
  const arr = list.slice();
  if (mode === 'oldest')   return arr.sort((a, b) => new Date(a.date) - new Date(b.date));
  return arr.sort((a, b) => new Date(b.date) - new Date(a.date)); // newest 기본
}

function getFeaturedPosts() { return posts.filter(p => p.featured); }

function getStartHerePosts() {
  const ordered = (typeof startHere !== 'undefined' ? startHere : []).map(getPostById).filter(Boolean);
  return ordered.length ? ordered : getFeaturedPosts();
}

function getSeries(id) {
  const s = series[id];
  if (!s) return null;
  return { id, ...s, posts: s.posts.map(getPostById).filter(Boolean) };
}

function getSeriesForPost(post) {
  if (!post) return null;
  const id = post.series || Object.keys(series).find(k => series[k].posts.includes(post.id));
  if (!id) return null;
  const r = getSeries(id);
  const i = r.posts.findIndex(p => p.id === post.id);
  if (i === -1) return null;
  return { ...r, index: i, position: i + 1, total: r.posts.length,
    prev: i > 0 ? r.posts[i - 1] : null, next: i < r.posts.length - 1 ? r.posts[i + 1] : null };
}

// Node(tooling) interop — 브라우저에선 module이 undefined라 no-op.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { posts, getAllPosts, getPostById, getAllCategories, getAllTags, filterPosts,
    sortPosts, getFeaturedPosts, getStartHerePosts, getSeries, getSeriesForPost, series, startHere,
    WORLD_META, getWorldMeta, getWorldList, mlTrack };
}
