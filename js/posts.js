// Blog Posts Data Structure
// All blog posts are stored here as JavaScript objects
// Content is loaded dynamically from Markdown files in the posts/ directory

// Category/tag 표준 목록은 data/taxonomy.json 이 단일 소스다.
// 새 글은 `node scripts/new-post.js` 로 추가하고, 추가 후
// `node scripts/validate-posts.js` 를 돌린다.

const posts = [
  {
    id: 'gateway-ingress-router',
    world: 'na',
    title: '광고 요청 하나가 서비스까지 가는 길 — LB · Ingress · API Gateway · 라우터',
    excerpt: '매체가 보낸 입찰 요청 한 건은 12ms 안에 bidder까지 도착해야 한다. 그 길에 LB·Ingress·API Gateway·라우터가 차례로 서 있는데, 넷 다 "요청을 어디로 보낼지 정하는" 일을 한다. 왜 넷으로 나뉘어 있을까. 서버 한 대에서 시작해 서비스 12개까지 키우면서, 각 부품이 어떤 문제 때문에 생겼는지를 실제 설정과 숫자로 따라간다.',
    date: '2026-08-07',
    categories: ['Software Engineering'],
    tags: ['Microservices', 'Networking', 'System Design'],
    contentUrl: 'posts/gateway-ingress-router.md',
    series: 'engineering-foundations'
  },
  {
    id: 'model-monitoring',
    world: 'both',
    worldNote: '층을 나눠 재고 세그먼트로 쪼개 보는 원칙은 양쪽 공통이다. 다른 건 라벨이 언제 도착하는지다. 담장 안은 전환이 자사 로그로 바로 들어와 라벨 기반 지표를 빨리 볼 수 있지만, 열린 RTB는 외부 포스트백을 기다려야 하고 일부는 아예 안 온다.',
    worldPractical: '담장 안은 노출·클릭·전환 로그가 모두 자사에 있어 라벨이 빨리 도착하고 지면·세그먼트 구분도 확실해서 감시가 촘촘하다. 그래서 예측 분포와 라벨 지표를 나란히 놓고 볼 수 있고, 지면별로 쪼개 보는 것도 쿼리 한 줄이다. 열린 RTB의 DSP는 전환이 광고주·MMP 포스트백으로 늦게 들어오고 일부는 유실된다. 라벨 기반 지표를 믿기 전에 “며칠까지 기다릴지”를 먼저 정해야 하고, 그동안은 예측 분포 감시가 사실상 유일한 조기 신호가 된다.',
    title: '모델 모니터링 — 조용히 나빠지는 것을 어떻게 알아채나',
    excerpt: '서버가 죽으면 알람이 울리지만 모델이 나빠지면 아무 알람도 없습니다. 200 OK로 답하고 그럴듯한 숫자를 내놓는데 그 숫자가 틀린 것입니다. 60일 시뮬레이션에서 40일차에 사고를 넣어 보면, 예측 분포를 보는 쪽은 사고 1일 뒤에 알람이 울리고 라벨 확정을 기다리는 쪽은 8일 뒤에 울립니다. 세그먼트를 쪼개는 것도 필수입니다 — 전체 COPC가 1.000으로 완벽한데 지면별로는 0.42에서 1.50까지 흩어져, 예측 클릭의 7.1%가 엉뚱한 지면에 얹혀 있는 상황이 만들어집니다. PSI 임계값 0.1도 표본에 따라 뜻이 달라져서, 표본 300건이면 아무 문제 없어도 평균 0.029가 나옵니다.',
    date: '2026-08-02',
    categories: ['Measurement & Modeling', 'ML Infrastructure'],
    tags: ['Calibration', 'ML Infra', 'Online Learning'],
    contentUrl: 'posts/model-monitoring.md'
  },
  {
    id: 'ctr-feature-engineering',
    world: 'both',
    worldNote: '해싱·집계·라벨 누출은 양쪽 세계 공통의 문제다. 다른 건 시퀀스 피처가 성립하는지다. 담장 안은 로그인 ID로 행동이 한 줄로 이어지지만, 열린 RTB는 쿠키가 며칠 만에 바뀌어 시퀀스가 두세 개에 그친다.',
    worldPractical: '담장 안은 로그인 ID가 있어 유저 행동이 한 줄로 이어진다. 시퀀스 중앙값이 23개라 “최근 본 20개” 피처가 실제로 이득을 낸다. 열린 RTB는 쿠키가 며칠 만에 바뀌어 79%가 3개 이하이고 중앙값이 2개라, 20칸을 만들면 대부분이 패딩이다. 그래서 무게 중심이 입찰 요청에 그대로 담겨 오는 지면·도메인·문맥 피처와 세그먼트로 옮겨간다.',
    title: 'CTR 피처 엔지니어링 실전: 무엇을 모델에 넣나 — 해싱·시퀀스·집계 피처를 만드는 법',
    excerpt: '광고 ID 100만 개를 one-hot으로 넣으면 배치 하나가 3.8GB, 해싱 2^18과 16차원 임베딩으로 접으면 테이블 전체가 16MB입니다. 100만 개를 26만 칸에 밀어 넣으면 ID의 97.8%가 남과 칸을 나눠 쓰는데, 노출로 가중한 예측 오차는 상위 1만 광고에서 1.59%뿐입니다. 진짜 사고는 머리끼리 부딪친 200쌍에서 나고(오차 19.0%), 전용 칸 0.6MB를 주면 0.00%로 사라집니다. “같은 날 CTR”을 피처로 쓰면 오프라인 AUC가 0.8938까지 부풀지만 실서빙에서는 0.7786으로 무너집니다.',
    date: '2026-07-26',
    categories: ['Measurement & Modeling', 'ML Infrastructure'],
    tags: ['pCTR', 'ML Infra', 'Model Serving'],
    contentUrl: 'posts/ctr-feature-engineering.md'
  },
  {
    id: 'embedding-table-ops',
    world: 'both',
    worldNote: '테이블을 쪼개고 퇴출하고 정밀도를 줄이는 기술 자체는 양쪽 공통이다. 다른 건 어느 테이블에 예산을 쓰느냐다. 담장 안은 로그인 ID가 몇 년을 살아 유저 테이블이 값지지만, 열린 RTB는 쿠키가 매번 달라 유저 줄이 학습되지 않는다.',
    worldPractical: '담장 안은 로그인 ID가 몇 년을 살아서 유저 줄이 수백 번 등장하며 제대로 학습되고, 미리 계산한 벡터를 찾아올 키도 흔들리지 않아 캐시에 얹어 둘 수 있다. 그래서 테이블 예산이 유저 쪽으로 쏠려 전체의 80% 이상을 먹고, 퇴출 기준도 트래픽이 아니라 탈퇴·장기 휴면 같은 계정 상태가 된다. 열린 RTB의 DSP는 쿠키가 매번 달라 유저 줄이 한두 번만 등장해 초기값에서 거의 안 움직이고, 서빙에서도 어제 만든 줄을 찾을 키가 없다. 그래서 수명이 긴 광고 소재·지면(도메인·슬롯)·문맥 테이블로 자원을 옮기는 편이 같은 메모리로 훨씬 많이 배우는 길이다.',
    title: '대규모 임베딩 테이블 운영 — 수억 개 ID를 학습하고 서빙하기',
    excerpt: '유저 2억 줄 × 32차원이면 서빙 테이블은 23.8GB인데, Adam으로 학습하면 옵티마이저 상태 때문에 83.2GB가 됩니다. 배치 1,024건이 건드리는 줄은 전체의 0.0005%뿐이라 희소 갱신이 전제인데, 밀집으로 짜면 하루치 스텝에 6.6일이 걸려 아예 못 돌립니다. 퇴출 정책은 빈도 컷·LRU·TTL의 커버율 차이가 0.7%p 이내라, 진짜 갈림은 남긴 줄이 아직 살아 있는지(81% vs 96.8%)와 크기를 통제할 수 있는지입니다. 사전과 행렬의 버전이 어긋나면 점수 평균·표준편차는 정상인데 Top-10 겹침이 0개가 되는, 에러 하나 없는 사고가 납니다.',
    date: '2026-07-19',
    categories: ['ML Infrastructure'],
    tags: ['ML Infra', 'Model Serving', 'pCTR'],
    contentUrl: 'posts/embedding-table-ops.md'
  },
  {
    id: 'conversion-definition',
    world: 'both',
    worldNote: '무엇을 전환으로 셀지는 양쪽 세계 공통의 정책 문제다. 다른 건 그 정의를 확인하고 통제할 수 있는지다. 담장 안은 결제 로그가 자사 것이라 정의와 확정 시점을 직접 정하지만, 열린 RTB는 광고주 포스트백으로 들어와 정의도 지연도 남이 정한다.',
    worldPractical: '담장 안에서는 광고주가 많고 업종이 넓어 전환 정의의 스펙트럼이 그만큼 넓다. 보험·게임·쇼핑·교육을 한 플랫폼이 받으니 기저 전환율이 50배 벌어지고, 유형별 보정이나 유형 피처가 사실상 필수가 된다. 대신 결제 로그가 자사 것이라 확정 시점을 직접 정하고 정의도 스키마를 열어 확인할 수 있다. 열린 RTB의 DSP는 전환이 광고주·MMP 포스트백으로 들어와 지연이 광고주마다 다르고 일부는 아예 안 온다. 안 온 것과 전환이 없었던 것을 구분할 수 없으니, 지연 보정을 걸면 없는 전환까지 되살릴 위험이 있다.',
    title: '전환 정의와 라벨 지연 — 어디까지가 전환이고, 언제 확정하나',
    excerpt: 'pCVR 모델을 만들라는 일을 받으면 첫 줄을 쓰기 전에 막힙니다. “전환”이 무엇인지 광고주가 고르는데 모델은 하나입니다. 상담 신청은 클릭한 사람의 15%가 하고 재구매는 0.3%만 해서 50배 차이가 나니, 유형을 구분하지 않은 모델은 어떤 광고주에게 2.5배 과소예측하고 어떤 광고주에게 20배 과대예측합니다. 그런데 전체 COPC는 1.00으로 완벽해 보입니다. 유형별 보정으로 평균은 잡히지만 개별 오차는 3.70%에서 0.70%까지만 줄고, 유형을 피처로 넣어야 0이 됩니다. 라벨을 1일에 확정하면 -58% 편향이 생기고, 늦은 전환을 과거에 반영하면 하루 1,740건의 라벨이 바뀌어 같은 코드가 다른 모델을 냅니다.',
    date: '2026-07-12',
    categories: ['Measurement & Modeling'],
    tags: ['pCVR', 'Attribution', 'Calibration'],
    contentUrl: 'posts/conversion-definition.md'
  },
  {
    id: 'model-ab-testing',
    world: 'both',
    worldNote: '트래픽을 쪼개 두 모델을 비교하는 일 자체는 양쪽 공통이다. 다른 건 쪼갤 수 있는 범위다. 담장 안은 경매를 직접 열어 조건을 맞출 수 있지만, 열린 RTB의 DSP는 자기 입찰만 쪼갤 수 있고 최종 노출은 매체가 쥐고 있다.',
    worldPractical: '담장 안은 광고주와 매체를 동시에 들고 있어 지켜야 할 가드레일이 양쪽으로 늘어난다. 광고주 CPA도 지키고 자사 지면의 유저 경험도 지켜야 해서, 실험 하나에 지표가 열 개를 넘기도 한다. 열린 RTB의 DSP는 유저 경험 책임이 매체 쪽이라 가드레일이 적은 대신, 패찰하면 관측이 없어 두 팔의 트래픽 구성 자체가 달라진다. 쿠키가 매번 달라 유저 단위 쪼개기도 안 되므로, 낙찰률을 먼저 맞춘 뒤에야 성과를 비교할 수 있다.',
    title: '모델 온라인 A/B 설계 — 같은 데이터로 +24.9%와 -13.2%가 나오는 이유',
    excerpt: '모델 A/B는 소재 A/B와 다른 종목입니다. 예측이 높아진 모델은 입찰가도 높게 부르니 낙찰을 더 많이 하고 예산도 빨리 씁니다. 즉 두 팔이 같은 양을 사지 않습니다. 진짜 모델 차이가 8%인 실험에서, 요청당 전환으로 재면 +24.9%가 나오고 예산이 구속되면 -13.2%가 나옵니다 — 새 모델이 14시에 예산을 다 써 저녁 값진 시간을 놓치기 때문입니다. 요청 단위로 쪼개면 유저의 80.2%가 빈도 상한을 넘고, 5일차 +6.0%였던 차이가 주말이 들어온 7일차에 +8.9%로 뜁니다. 가드레일을 20개 두면 아무 문제 없는 실험의 64.2%가 어딘가에서 빨간불이 됩니다.',
    date: '2026-07-05',
    categories: ['Measurement & Modeling'],
    tags: ['A/B Testing', 'pCTR', 'Ad Ranking'],
    contentUrl: 'posts/model-ab-testing.md'
  },
  {
    id: 'cold-start-pctr',
    world: 'both',
    worldNote: '이력이 0인 광고에 어떤 확률을 줄지는 양쪽 세계 공통의 문제다. 다른 건 빌려 올 계층의 품질이다. 담장 안은 광고주·캠페인 구조가 플랫폼 소유라 계층이 확실하지만, 열린 RTB는 유저 쪽 계층이 아예 없어 문맥 피처에 기댄다.',
    worldPractical: '담장 안에서는 광고주 계정과 캠페인 구조가 플랫폼 소유라 “누가 무엇을 올렸는지” 계층이 확실하다. 같은 광고주의 지난 1년 이력을 전부 볼 수 있어, 실무 관심사가 “계층을 어떻게 만들까”가 아니라 “몇 층까지 내려갈까”로 옮겨간다. 대개 광고주 층이 표본과 유사성의 균형점이다. 열린 RTB의 DSP는 쿠키가 매번 달라 유저 쪽 계층이 없고, 그래서 유저 콜드스타트가 예외가 아니라 기본값이다. 담장 안이 “이 사람을 안다”로 푸는 문제를 열린 RTB는 “이 자리를 안다”로 푼다 — 도메인·슬롯 크기·시간대 같은 문맥 피처로.',
    title: 'Cold Start: 이력이 0인 광고에 pCTR을 얼마로 줄까',
    excerpt: '새 광고에 “모르니까 0”을 주면 영원히 노출을 못 받고, 노출이 없으니 데이터도 안 쌓입니다. 모르는 상태가 스스로를 유지하는 것입니다. 답은 남의 이력을 빌려 오는 것인데, 광고주별 CTR이 2.44%와 0.53%로 4.6배 차이 나서 어느 계층에서 빌리는지가 곧 정확도입니다. 얼마나 세게 빌릴지는 손으로 찍지 않고 기존 광고들의 흩어짐에서 계산합니다 — 소재가 비슷한 광고주는 강도 42,744, 천차만별인 곳은 213으로 200배 차이가 납니다. 새 광고 2,000개를 굴려 보면 강도가 약할 때는 흔들림이 0.66%p, 셀 때는 0.06%p로 줄지만 추정이 진짜의 절반까지 눌립니다.',
    date: '2026-06-28',
    categories: ['Measurement & Modeling'],
    tags: ['pCTR', 'Exploration', 'Ad Ranking'],
    contentUrl: 'posts/cold-start-pctr.md'
  },
  {
    id: 'attribution-basics',
    world: 'both',
    worldNote: '닫힌 생태계는 클릭·구매를 자기 데이터로 한 회사 안에서 다 이어 붙여 ‘누구 공인지’ 나눈다. 열린 RTB는 흩어진 기록을 쿠키·외부 측정업체로 억지로 꿰매야 해 훨씬 지저분하다.',
    worldPractical: '담장 안에서는 로그인 기준이라 기기가 바뀌어도 사람 단위로 이어 붙는다. 그래서 이 글의 규칙 싸움은 “우리 채널 안에서 어떻게 나눌까”가 된다. 대신 밖에서 그 사람이 본 광고는 안 보이니, 채널 간 비교는 결국 증분 실험으로만 답이 난다.',
    title: '어트리뷰션: 그 전환은 누구 공인가 — 라스트클릭부터 멀티터치·증분까지',
    excerpt: '민지가 ₩89,000 운동화를 샀다. 2주간 인스타 노출 3번, 검색광고 클릭, 브랜드검색 클릭 — 이 매출은 누구 공일까? 실제 여정 로그에 라스트클릭·퍼스트클릭·선형·시간감쇠·U자형 다섯 규칙을 그대로 적용해 보면, 같은 여정에서 네이버 검색광고의 성과가 ₩0과 ₩89,000 사이를 오간다. 윈도우를 7일에서 2일로 줄이면 또 달라지고, 홀드아웃으로 재 보면 어트리뷰션이 말하는 2,500건 중 실제 광고가 만든 건 500건뿐이다(5배 과대). 파이썬 코드로 직접 나눠 보고, 겉보기 CPA ₩4,000과 증분 CPA ₩20,000이 왜 정반대 결론을 주는지까지.',
    date: '2026-06-21',
    categories: ['Measurement & Modeling'],
    tags: ['Attribution', 'Incrementality', 'Causal Inference', '입문'],
    contentUrl: 'posts/attribution-basics.md',
  },
  {
    id: 'header-bidding',
    world: 'open-rtb',
    worldNote: '헤더비딩은 여러 구매자를 동시에 불러 값을 올리는, 열린 RTB의 기술이다. 네이버·카카오 같은 닫힌 생태계는 자기 광고 자리를 자기가 파니 밖에서 경쟁을 붙일 일이 없어 이 기술 자체가 필요 없다.',
    worldPractical: '담장 안에서 일하면 이 기술을 직접 만질 일은 없다. 다만 “같은 자리를 여럿이 동시에 겨루게 해 가격을 발견한다”는 원리는 내부 통합 경매(보장형 vs 성과형)와 같으니, 그 대응 관계로 읽으면 쓸모가 있다.',
    title: '헤더비딩: 한 줄로 세우지 말고 동시에 — 매체 수익을 +10~30% 올리는 법',
    excerpt: '매체가 광고 자리 하나를 파는데, 6개 SSP의 입찰가 중 가장 비싼 ₩1,420짜리는 순서에 밀려 아예 질문도 받지 못한다 — Waterfall이 흘리는 돈은 정확히 ₩420, 42%다. 페이지 머리(header)의 Prebid.js가 SSP들을 동시에 불러 그 손실을 되찾는 원리, 타임아웃을 100ms에서 300ms로 늘릴 때 낙찰가가 ₩980에서 ₩1,420까지 움직이는 트레이드오프, 클라이언트 vs 서버 사이드(Google Open Bidding·Amazon TAM), 그리고 1st-price 전환과 Bid Shading까지 파이썬 시뮬레이터로 직접 확인한다.',
    date: '2026-06-21',
    categories: ['Bidding & Auction'],
    tags: ['RTB', 'SSP', 'Ad Ecosystem', '입문'],
    contentUrl: 'posts/header-bidding.md',
  },
  {
    id: 'pctr-prediction',
    world: 'both',
    worldNote: '누를 확률을 맞히는 건 양쪽 다 똑같이 중요하다. 닫힌 생태계는 자기 로그인 데이터로 더 정확히 맞히고, 열린 RTB의 광고주는 남의 지면 신호와 쿠키만으로 맞혀야 해 불리하다.',
    worldPractical: '담장 안에서는 로그인 기반 1st-party 피처가 넉넉해 같은 모델 구조로도 정확도가 잘 나온다. 대신 자기 트래픽 분포만 배우니, 새 지면·새 소재가 들어올 때의 cold start와 탐색 설계가 실무의 절반을 차지한다.',
    title: 'pCTR: ‘이 사람이 누를까?’를 맞히는 확률, 그리고 그게 왜 돈이 되나',
    excerpt: 'DSP가 “₩1,200 내겠다”고 부를 때 그 값은 단 하나의 숫자에서 나온다 — ‘이 사람이 이 광고를 누를 확률(pCTR)’. 가장 비싸게 부른 광고(₩2,000)가 꼴찌, 가장 싸게 부른 광고(₩600)가 1등이 되는 eCPM 랭킹 표로 pCTR이 왜 돈인지 보이고, 순위는 완벽한데 전 구간에서 13% 낮게 보는 보정(Calibration) 사례(COPC 1.13)를 짚는다. 그리고 모든 예측에 0.5를 곱해도 AUC는 소수점까지 그대로인데 LogLoss만 나빠진다는 걸 파이썬으로 직접 증명해, 순위 지표만으로는 이 사고를 못 잡는 이유를 보인다.',
    date: '2026-06-21',
    categories: ['Measurement & Modeling'],
    tags: ['pCTR', 'pCVR', 'Calibration', 'Ad Ranking', '입문'],
    contentUrl: 'posts/pctr-prediction.md',
  },
  {
    id: 'second-price-auction',
    world: 'open-rtb',
    worldNote: '네이버·카카오 같은 닫힌 생태계는 경매를 자기가 직접 연다. 그래서 모든 입찰가를 다 볼 수 있어, ‘져서 남이 얼마 썼는지 못 보는’ 문제 자체가 없다.',
    worldPractical: '담장 안에서 일하면 ‘정직하게 부를까 말까’라는 계산 자체가 낯설다 — 네이버·카카오는 경매를 직접 열어 모든 입찰가를 이미 다 보기 때문이다. 대신 광고주가 신경 쓰지 않아도, 자동입찰이 이베이 자동입찰(proxy bidding)과 같은 원리로 입찰가를 알아서 조절해 준다. 그래서 실무의 관심사는 ‘얼마나 솔직하게 부를까’가 아니라 ‘자동입찰 알고리즘이 목표 성과를 얼마나 잘 맞추는가’로 옮겨간다.',
    title: '2등 가격 경매(Second-Price): 이겨도 왜 2등 값만 낼까 — 그리고 광고판은 왜 1등 가격으로 옮겨갔나',
    excerpt: '경매에서 이겼는데 왜 2등이 부른 값만 낼까. DSP 5곳의 가상 입찰표를 놓고 계산해 보면, 2등 가격 경매에서는 정직하게 부르는 쪽이 과대입찰(₩1,500을 불러 −₩400 손해)이나 과소입찰(놓친 이익 ₩250)보다 기대 이익이 항상 앞선다. 그런데 같은 데이터를 1등 가격으로 돌리면 정직 입찰의 이익이 정확히 0이 되고, 20% 낮춰 부르는 Bid Shading이 오히려 이긴다. 헤더비딩으로 ‘2등’이라는 개념 자체가 무의미해지며 2017년 무렵부터 주요 거래소가, 2019년 무렵엔 Google Ad Manager까지 1등 가격으로 갈아탄 배경까지 정리한다.',
    date: '2026-06-21',
    categories: ['Bidding & Auction'],
    tags: ['RTB', 'Bid Shading', 'Ad Ecosystem', '입문'],
    contentUrl: 'posts/second-price-auction.md',
  },
  {
    id: 'dsp-ssp-exchange',
    world: 'open-rtb',
    worldNote: '열린 RTB에선 광고를 사는 쪽·파는 쪽·경매장이 서로 다른 회사다. 닫힌 생태계는 이 셋을 한 회사가 다 가져 경계가 안 보인다 — 네이버 GFA·카카오모먼트가 그 ‘사는 쪽’ 도구다.',
    worldPractical: '담장 안에서 일하면 SSP·Exchange를 직접 다룰 일은 없고, GFA·카카오모먼트 같은 ‘사는 쪽’ 화면만 만진다. 그래서 이 글의 단계별 take rate 표는 그대로 적용되지 않는다. 다만 외부 매체 연동을 검토할 때는, 이 글의 0.1초 타임라인과 수수료 누적 구조를 참고선으로 삼을 수 있다.',
    title: 'DSP·SSP·Ad Exchange: 각각 뭐 하는 곳인가 — 실제 예시로',
    excerpt: '광고주와 사용자 사이엔 세 명의 중개인이 있다 — 파는 쪽 대리인 SSP, 사는 쪽 대리인 DSP, 둘이 만나는 경매장 Ad Exchange. 노출 1건이 뜨기까지 데이터가 오가는 0.1초를 8단계 타임라인으로 재구성하고, 광고주가 낸 ₩1,000 중 매체에 도착하는 몫(예시 계산 ₩544, take rate 45.6%)을 파이썬으로 직접 계산해 본다. DV360·The Trade Desk·Magnite·네이버 GFA·카카오모먼트 같은 실제 회사 이름과, 열린 RTB·닫힌 생태계에서 이 구조가 어떻게 달라지는지도 함께 짚는다.',
    date: '2026-06-21',
    categories: ['Bidding & Auction'],
    tags: ['Ad Ecosystem', 'DSP', 'SSP', 'RTB', '입문'],
    contentUrl: 'posts/dsp-ssp-exchange.md',
  },
  {
    id: 'kakao-ads-products',
    world: 'walled-garden',
    worldNote: '카카오 광고는 사는 쪽 도구처럼 보여도 밖의 경매장을 거치지 않는다. 광고를 사고파는 곳과 실을 자리가 모두 카카오 한 회사라, 자기 안에서만 경매가 돈다.',
    worldPractical: '열린 RTB 경험이 있다면, 이 글의 표처럼 ‘패찰가까지 다 보이는’ 랭킹표는 담장 밖에서는 절대 못 만든다는 점부터 새기면 된다. censored data나 bid shading을 고민할 필요는 없어지는 대신, pCTR 예측 오차가 그대로 낙찰 결과와 매출로 번지니 캘리브레이션 점검이 실무의 핵심이 된다. 같은 지면에 보장형(CPT)과 성과형 물량이 공존한다는 것도 알아두면 쓸모 있다.',
    title: '카카오 광고 상품 지도: 비즈보드·모먼트·키워드광고는 우리가 배운 무엇인가',
    excerpt: '카카오톡 채팅 목록 위 비즈보드 배너 한 칸은, 우리가 배운 eCPM 랭킹이 실제로 돌아가는 현장이다. 가상의 입찰 후보 5개로 낙찰자를 뽑아 보고, pCTR 예측이 단 10%만 틀려도 낙찰자가 통째로 바뀌는 걸 파이썬으로 확인한다. 비즈보드·카카오모먼트·키워드광고·톡채널 메시지를 상품 지도로 엮고, 같은 자리가 열린 RTB였다면 무엇이 달랐을지, 예약(CPT) 물량과 경매 물량은 어떻게 공존하는지까지 짚는 카카오 광고 3부작의 1편.',
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
    worldPractical: '열린 RTB에서 Custom Audience·Lookalike Audience를 다뤄봤다면 표와 배분 로직이 낯익을 것이다. 씨앗에서 확장한다는 틀도, ‘좁을수록 정확하지만 도달이 준다’는 트레이드오프도 같다. 다른 건 재료의 품질이다. 카카오는 로그인 기반 결정론적 매칭으로 씨앗을 붙이지만, 열린 RTB는 쿠키·MAID 같은 확률적 신호에 기대야 해서 같은 확장 비율이라도 정확도가 더 빨리 무너진다. CPA 낮은 순으로 예산을 채우는 그리디 배분 감각만은 세계와 무관하게 그대로 쓸 수 있다.',
    title: '카카오는 무엇으로 광고를 고르나: pCTR·톡 데이터·맞춤/유사타겟',
    excerpt: '카카오는 로그인 데이터로 pCTR을 어떻게 다르게 맞히나? 익명 트래픽과 로그인 기반 피처가 붙었을 때 pCTR이 어떻게 갈리는지, 데모·관심사·맞춤·유사타겟의 도달-전환율 트레이드오프를 가상 데이터로 뜯어본다. CPA만 보면 맞춤타겟이 1등이지만 도달이 8만 명뿐이라 예산 2,000만 원 중 96만 원밖에 못 쓴다 — ‘가장 정확한 타겟이 최선은 아닌’ 이유와 고정 예산의 최적 배분을 파이썬으로 계산한다. 유사타겟이 씨앗에서 확장되는 원리, 예측이 좋아도 보정이 없으면 낙찰자가 바뀌는 이유까지 잇는 카카오 광고 3부작의 2편.',
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
    worldPractical: '열린 RTB의 DSP에서 Bid Shading을 다뤄봤다면, 목표 CPA 자동입찰의 ‘입찰가 ≈ 목표 × pCVR’ 골격이 낯익을 것이다. 다른 건 정보가 끊기는 지점이다. 열린 RTB는 패찰하면 경쟁가를 못 봐 시장 분포를 추정해야 하지만, 카카오 안에서는 플랫폼이 모든 입찰가를 이미 보고 있어 그 추정 자체가 필요 없다. 대신 광고주는 그 계산 과정을 들여다볼 수 없다는 대가가 붙는다.',
    title: '카카오에서 캠페인이 굴러가는 법: 자동입찰·예산 페이싱·성과 측정',
    excerpt: '광고를 골랐으면 얼마를 부를지, 하루 예산을 언제 쓸지, 그리고 그 성과가 진짜인지 정해야 한다. 가상의 시간대별 전환율 데이터로 예산 페이싱 세 전략(아침 몰빵·균등·성과 가중)을 비교하면 같은 100만 원으로 22건에서 37.8건까지 벌어진다. 목표 CPA를 3,000원까지 조이면 승률 3.7%, 예산의 1.5%만 쓰고 마는 것도 파이썬 시뮬레이션으로 확인한다. 자동입찰이 결국 목표(CPA·ROAS)를 받아 매 요청의 입찰가를 정하는 일이라는 것, 그리고 픽셀·SDK가 잡은 전환 수는 어트리뷰션이지 증분이 아니라는 것까지 — 카카오 광고 3부작을 완결하는 마지막 편.',
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
    worldPractical: '담장 안에서는 노출을 직접 통제할 수 있어 RCT 홀드아웃을 1급 시민으로 쓸 수 있다. 그래도 캠페인 성과를 노출군 vs 비노출군으로 naive하게 보고하기 전에, 타겟팅이 특정 세그먼트에 노출을 몰아주진 않았는지부터 층별로 갈라 확인하는 습관을 들이자. 홀드아웃을 실제로 어떻게 설계하고 증분을 계산하는지는 어트리뷰션 입문 글에서 이어 다룬다.',
    title: '인과추론 입문: 상관과 인과는 왜 다른가 — 반사실, 교란변수, 그리고 \'안 일어난 세계\'의 문제',
    excerpt: '광고를 본 사람의 구매율(17.0%)이 안 본 사람(4.4%)보다 훨씬 높다 — 그런데 이 naive 비교, 참값보다 6~7배나 부풀려진 착시다. 유저를 ‘원래 구매 의향’ 층으로 나눠 보면 naive 효과는 +12.7%p지만, 층별 보정과 무작위 배정(RCT) 시뮬레이션은 둘 다 +2%p 근처로 수렴한다. 같은 사람의 ‘광고 안 본 세계’를 절대 볼 수 없다는 반사실의 근본 문제, 아이스크림-익사부터 계절성·프로모션·브랜드 검색량까지 교란변수의 실제 얼굴, 그리고 이 빈칸을 채우는 두 갈래 길(랜덤 실험 vs 준실험)까지 파이썬 시뮬레이션과 표로 풀어내는 인과추론 트랙의 출발점.',
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
    worldPractical: '담장 안에서는 홀드아웃을 직접 설계할 수 있는 만큼, 표본 크기 계산과 조기 중단 규칙을 먼저 정하고 시작하는 습관이 실무의 절반이다. 대조군 비율을 얼마나 작게 잡아야 기회비용과 검출력 사이에서 절충이 되는지가 매 실험마다 반복되는 질문이다. 오염(다른 채널 노출)과 스필오버(친구 추천 등 연결된 서비스)는 배정 로직보다 먼저 의심해야 할 지점이다.',
    title: '랜덤 실험(RCT): 동전 던지기 하나가 어떻게 \'진짜 효과\'를 증명하는가',
    excerpt: '약을 먹은 사람이 빨리 나았다 — 약 덕분인가, 원래 건강해서인가? 무작위 배정은 동전 던지기 하나로 이 질문에 답한다. 배정을 특성과 무관하게 만들면, 아는 특성도 모르는 특성도 두 집단에서 평균적으로 같아진다. 기저 전환율 2.0%에서 리프트 +5%·+10%·+20%를 잡으려면 각각 315,207명·80,680명·21,106명이 필요하고, 표본을 반으로 줄이면 검출력이 80.5%에서 50.8%로 급락한다는 걸 5,000회 반복 실험으로 실측한다. 아무 차이 없는 A/A 테스트에서도 5.1%는 ‘유의하다’고 나온다.',
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
    worldPractical: '열린 RTB에서는 노출을 직접 배정할 수 없으니 지역·기간 단위로 쪼개는 DiD가 사실상 기본 도구가 된다. 담장 안에서는 유저 단위 홀드아웃을 바로 설계할 수 있어 DiD가 차선책에 머물지만, 검색 랭킹 알고리즘이나 수수료 정책처럼 유저를 절반으로 가를 수 없는 변경이라면 얘기가 다르다. 이런 경우엔 담장 안에서도 비슷한 다른 카테고리·지면을 대조군으로 빌려 이중차분하는 것이 실무적으로 유일한 답이 된다.',
    title: '이중차분법(DiD) 쉽게 이해하기: 차이를 두 번 빼서 \'진짜 효과\'만 남기는 법',
    excerpt: '서울·경기에만 배너 광고 캠페인을 켜고 나머지 지역은 그대로 뒀다 — 캠페인 후 매출이 뛰었다면, 광고 효과일까 계절 효과일까 원래 지역 차이일까? 같은 2×2 가데이터에서 단순 전후비교(+19.79억)·단순 지역비교(+35.36억)·이중차분(+15.40억) 세 값을 나란히 계산해, 참값(15억)을 잡는 건 DiD뿐임을 보인다. 광고 전 넉 달의 추이로 평행추세를 확인하고, 그 추세가 깨진 가짜 데이터를 파이썬으로 만들어 DiD가 27% 과대추정으로 틀리는 과정까지 시뮬레이션한다. 회귀식의 교차항 계수가 왜 정확히 DiD 추정량인지, 그리고 유저를 가를 수 없는 플랫폼 정책 변경처럼 담장 안에서도 DiD가 필요해지는 예외까지 다룬다.',
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
    worldPractical: '담장 안에서는 홀드아웃을 직접 설계할 수 있으니 앞으로의 질문이라면 RDD보다 RCT부터 돌리는 게 맞다. 다만 등급 컷·점수 임계값처럼 이미 굴러가고 있던 규칙은 데이터에 화석처럼 남아 있어, 새 실험 없이도 과거 로그만으로 그 경계의 효과를 사후에 읽어낼 수 있다. 컷오프 규칙을 새로 만들기 전에, 지금 규칙이 이미 만들어 둔 자연 실험부터 확인하는 습관을 들이면 좋다.',
    title: '회귀불연속(RDD): 합격컷 1점 차이가 만드는 자연 실험',
    excerpt: '품질점수 6.95점과 7.00점, 광고 실력은 사실상 같은데 한쪽만 프리미엄 지면을 받는다. 이 컷오프 바로 위·아래를 비교하면 거의 실험에 가까운 비교가 된다. 품질점수 컷·예산 소진율·입찰 바닥값처럼 광고 시스템 곳곳의 칼같은 규칙이 만드는 자연 실험 — 컷 근처 가데이터로 보는 점프, 밴드폭을 넓힐수록 단순 평균차의 편향이 0.05에서 1.20으로 커지는 반면 local linear는 0.01 근처에 머무는 파이썬 시뮬레이션, 조작(manipulation)과 밀도 검정, 그리고 sharp RDD와 fuzzy RDD가 도구변수(IV)로 이어지는 지점까지.',
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
    worldPractical: '담장 안에서는 노출을 직접 배정할 수 있으니 도구변수를 실무에서 쓸 일은 드물다 — RCT로 바로 흔들면 되기 때문이다. 그래도 배정(푸시 발송, 노출 대상 지정)과 실제 노출 사이엔 앱 미실행 같은 틈이 늘 있다. 실험 결과를 ‘배정군 vs 대조군’ 차이로만 보고할 때, 그게 배정 효과(ITT)이지 실제 노출자에 대한 효과(LATE)가 아니라는 점을 구분하는 습관이 필요하다. 순응률만 로그로 정확히 잴 수 있다면 이 글의 나눗셈 한 번으로 LATE를 복원할 수 있다.',
    title: '도구변수(IV): 직접 못 흔드는 원인을, 바람을 빌려 미는 법',
    excerpt: '캠페인을 10만 명에게 배정해도 실제로 광고를 본 건 4만 명뿐이다 — 나머지는 앱을 안 열었거나 노출에 실패했다. 실제로 본 사람과 안 본 사람을 그냥 비교하면 naive 효과가 참값(2.5%p)의 거의 두 배(+4.86%p)로 부풀지만, 배정 효과(ITT, +1.0%p)를 실제 노출 비율(순응률 40%)로 나누면 실제 노출자에 대한 참 효과(LATE, +2.5%p)가 그대로 복원된다. 이게 도구변수(IV)의 핵심 트릭이다. 좋은 도구가 갖춰야 할 조건(관련성·배제 제약·독립성), 순응률이 10%로 떨어지면 추정치의 흩어짐이 6배 넘게 커지는 약한 도구 문제, 2SLS가 이 나눗셈의 일반형이라는 사실까지 파이썬으로 확인한다.',
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
    worldPractical: '담장 안에서는 자기 트래픽이니 A/B든 밴딧이든 원하는 설계 그대로 돌릴 수 있다. 대신 밴딧으로 트래픽을 몰아준 소재는 나중에 되짚어 볼 표본이 부족해지므로, 중요한 소재엔 최소 표본 하한선을 남겨 두는 게 안전하다. 열린 RTB의 광고주는 자기 입찰·소재 범위 안에서만 실험할 수 있고, 매체 쪽 랭킹 알고리즘도 이미 일종의 밴딧으로 돌고 있어 광고주가 보는 성과에는 매체의 최적화가 이미 섞여 들어온다.',
    title: 'A/B 테스트 vs 멀티암드 밴딧: 고정 트래픽과 적응형 트래픽, 그리고 Contextual은 왜 필요한가',
    excerpt: '소재 2개(진짜 CTR 2.0%·3.0%)에 노출 10만 건을 쓰면, A/B 테스트(50:50 고정)는 2,521클릭에 그치지만 두 소재 모두 ±0.15%p 안팎의 깨끗한 신뢰구간을 남긴다. 밴딧(적응형)은 2,980클릭까지 벌지만, 진 소재의 신뢰구간은 ±0.453%p로 3.7배 넓어진다. 진짜 차이가 2.0%에서 2.1%로 작아지면 밴딧은 트래픽의 94%를 오히려 열세 소재에 몰아주며 A/B보다도 못한 결과를 낸다. 목적·소재 수·트래픽 규모·효과 크기·보고 대상·비정상성 여섯 기준으로 무엇을 고를지 정리하고, ‘전체 1등’ 하나로는 부족해 Contextual Bandit이 필요해지는 지점까지 다룬다.',
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
    worldPractical: '담장 안(네이버·카카오)에서 일한다면 DSP·Exchange·SSP가 갈리는 사슬 대부분은 실무에서 직접 만날 일이 없다. 그 사슬 전체가 한 회사 안으로 접혀 들어와 있기 때문이다. 그래도 eCPM·pCTR·pCVR로 입찰가를 계산하는 곱셈 하나는 담장 안에서도 그대로 쓰인다. 이 글에서 처음 나오는 ‘무대’ 배지를 기준 삼아, 어느 절이 남의 회사 얘기이고 어느 절이 내 실무와 바로 이어지는지 구분하며 읽으면 나머지 글이 훨씬 빨리 읽힌다.',
    title: '30분만에 이해하는 광고 시스템: 생태계·경매·랭킹·측정 전체 지도 (입문 가이드)',
    excerpt: '완전 초보자를 위한 올인원 입문 지도. 생태계(DSP·SSP·Ad Exchange)와 1st Price 경매·Bid Shading부터, eCPM·pCTR·pCVR로 입찰가를 계산하는 파이썬 실습(CPM ₩3,000 지면에서 노출당 원가 ₩3, 기대가치 ₩10, 이문 ₩7), Attribution과 iOS ATT, 타겟팅·인프라까지 수식 없이 비유와 숫자로 훑는다. 열린 RTB·닫힌 생태계 두 무대를 이 글에서 처음 구분해 주고, RTB 경매 데모와 함께 이 블로그 40여 편으로 연결하는 허브다.',
    date: '2026-04-20',
    categories: ['Bidding & Auction'],
    tags: ['입문', 'Ad Ecosystem', 'RTB', 'DSP', 'SSP', 'pCTR', 'pCVR', 'Attribution', 'eCPM'],
    contentUrl: 'posts/adtech-30min-primer.md',
    featured: true,
    series: 'getting-started'
  },
  {
    id: 'audience-segmentation',
    worldPractical: '담장 안에서는 로그인 ID가 있어 세그먼트가 확정 기반이고, 크로스디바이스 매칭도 95% 이상으로 붙는다. 내부 시스템이라 세그먼트를 실시간으로 갱신해 그 즉시 랭킹에 반영할 수 있고, 쿠키 폐지 영향도 상대적으로 적다. 대신 광고주는 플랫폼이 제공하는 옵션만 고를 수 있고 집계 리포트만 받는다. 열린 RTB는 반대다. 광고주가 세그먼트를 직접 정의하고 유저 레벨 로그까지 볼 수 있지만, 쿠키·MAID 기반이라 해상도가 낮고 크로스디바이스가 60~70%에 그치며 세그먼트 동기화에 시간~일 지연이 붙는다. 통제권을 얻는 대신 정밀도를 내주는 구조다.',
    world: ['open-rtb', 'walled-garden'],
    worldNote: '이 글은 두 종류의 데이터 창고를 나눠 다룬다. 열린 RTB는 여러 사이트에서 긁어모은 남의 데이터 창고(DMP)를, 닫힌 생태계는 자기 고객 데이터 창고(CDP)를 쓴다.',
    title: '오디언스 세그멘테이션: 광고 타겟팅의 첫 번째 질문 — 누구에게 보여줄 것인가',
    excerpt: '“25~34세 서울 여성”은 수백만 명입니다. 그 안에 운동화를 찾는 사람과 유아용품을 찾는 사람이 섞여 있으니, 인구통계만으로는 광고 반응을 가를 수 없습니다. 이 글은 규칙 기반 SQL·RFM(5×5×5=125셀)·K-Means·GMM·실시간 스트리밍 다섯 접근법을 갱신 지연(초~주)과 해석 가능성으로 비교하고, 세그먼트를 pCTR 모델의 피처로 넣을 때 단순 0/1 플래그보다 임베딩이 나은 이유를 짚습니다. 세그먼트 크기 ±30%, P/O Ratio ±20%, 커버리지 70% 같은 건강성 경보 기준과, 3rd-party 쿠키가 사라지며 DMP에서 CDP로 넘어가는 전환까지 이어집니다.',
    date: '2026-04-13',
    categories: ['Targeting & Audience'],
    tags: ['Segmentation', 'Targeting', 'Ad Ecosystem', 'DMP', 'CDP', 'ML Infra'],
    contentUrl: 'posts/audience-segmentation.md',
  },
  {
    id: 'lookalike-modeling',
    worldPractical: '담장 안에서는 로그인 ID로 씨앗을 결정론적으로 붙일 수 있어, 같은 확장 비율에서도 정확도가 훨씬 늦게 무너진다. 친구·팔로우 같은 관계 데이터까지 있으면 그래프 확장이 실제로 쓸 만해진다(이 글의 5절이 담장 안 전용인 이유다). 열린 RTB에서는 쿠키·MAID 같은 확률적 신호로 씨앗을 매칭해야 하고 크로스디바이스 정확도가 60~70%에 그친다. 같은 3% 확장이라도 씨앗 자체에 이미 잡음이 섞여 들어가는 셈이다. 그래서 열린 RTB일수록 확장 비율을 보수적으로 잡고, 증분 리프트를 홀드아웃으로 직접 재는 습관이 더 중요해진다.',
    world: ['open-rtb', 'walled-garden'],
    worldNote: '닮은 유저를 대량으로 찾는 기법은 양쪽 다 쓴다. 메타·네이버는 자기 고객 데이터로, 열린 RTB의 광고주는 여러 사이트를 따라다니는 쿠키로 찾는 게 차이다.',
    title: 'Lookalike Modeling: 전환 유저 100명에서 100만 유사 유저를 발굴하는 법',
    excerpt: '“우리 단골손님과 닮은 사람을 더 찾아 달라” — 이게 유사타겟(Lookalike)입니다. 문제는 얼마나 넓게 닮음을 인정하냐입니다. 모집단 1,000만 명에서 확장 비율을 1%에서 10%로 늘리면 도달은 10만 → 100만 명으로 10배 커지지만, 증분 리프트는 +120%에서 +20%로 6분의 1이 됩니다. 128차원 공간에서는 10배 많은 사람을 담는 데 반경이 1.018배만 늘면 충분하고, 그 1.8%짜리 확장에 유사도 꼬리의 유저가 쏟아져 들어오기 때문입니다. 임베딩·성향점수·그래프 세 접근법과, 1% → 3% → 5%로 올리며 CPA가 목표를 넘는 지점을 최적 경계로 잡는 실무 절차까지 다룹니다.',
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
    worldPractical: '담장 안에서는 노출·클릭·전환이 모두 자사 서버에 남아 조인 키가 확실하다. 결제 시스템이 발급한 주문번호를 그대로 신뢰할 수 있어 중복 제거도 상대적으로 깨끗하다. 열린 RTB는 노출이 SSP, 클릭이 자사, 전환이 광고주 포스트백으로 흩어져 조인 자체가 추정이 된다. 그래서 담장 안의 실무 자원은 “로그를 어떻게 이을까”보다 “이 많은 로그를 어디까지 남길까”라는 비용 결정 쪽으로 옮겨간다. 요청 로그를 샘플링할 때 요청 ID 기준으로 일관되게 뽑는 습관은 양쪽 세계 모두에 필요하다 — 무작위로 행을 버리면 같은 요청의 후보 일부만 남아 체인이 끊긴다.',
    world: 'both',
    worldNote: '로그가 곧 학습 데이터라는 본질은 양쪽 같다. 닫힌 생태계는 한 회사가 모든 입찰을 다 찍어 로그 잇기가 단순하고, 열린 RTB는 이기고 진 기록이 여러 회사에 흩어져 훨씬 복잡하다.',
    title: '광고 시스템 로그 파이프라인: 한 번의 입찰에서 10개의 로그가 만들어지는 구조',
    excerpt: '광고 요청 하나가 남기는 로그 10종을 따라가며, 그 로그가 어떻게 pCTR 모델의 학습 데이터가 되는지 봅니다. 통과율을 순서대로 곱해 보면 요청 대비 전환은 1/31,328입니다. 3만 건이 넘는 요청이 있어야 전환 한 건이 나오니, pCVR 모델이 늘 데이터 부족에 시달리는 이유가 여기 있습니다. 저장량 1위는 보존이 30일뿐인 Bid 로그(23.4TB)이고, 1년을 남기는 노출 로그가 16.6TB입니다. 그래서 비용을 줄일 때는 보존 기간이 아니라 위쪽 로그의 샘플링을 먼저 봐야 합니다. request_id 하나가 요청부터 전환까지를 잇는 유일한 끈이라는 것, 그리고 조용히 지나가는 파이프라인 함정들이 모델을 어느 방향으로 틀어 놓는지까지 다룹니다.',
    date: '2026-04-12',
    categories: ['ML Infrastructure'],
    tags: ['ML Infra', 'pCTR', 'Ad Ecosystem', 'DSP'],
    contentUrl: 'posts/ad-log-pipeline.md',
  },
  {
    id: 'ltv-ad-ranking',
    worldPractical: '담장 안에서 일한다면 이 글의 LTV 계산 대부분이 실무 그대로다. 재구매·이탈을 자체 로그로 실측할 수 있어 90일 LTV를 실제로 예측 모델에 태울 수 있기 때문이다. 다만 그 예측이 가입 후 7일 신호에 기댈 수밖에 없어 오차가 랭킹에 그대로 번진다는 점, 할인율이라는 정책 다이얼이 랭킹을 또 바꾼다는 점은 직접 챙겨야 한다. 열린 RTB의 value-based bidding 절은 직접 만질 일은 없지만, 광고주가 넘기는 전환값의 신빙성을 가늠할 때 참고가 된다.',
    world: 'walled-garden',
    worldNote: '노출당 수익만 보면 광고를 자꾸 띄워 유저가 떠나는 손해가 안 보인다. 지면·유저를 다 가진 닫힌 생태계만 그 손해까지 빼서 ‘오래 남을 유저’ 기준으로 순위를 매길 수 있다.',
    title: 'LTV(Long Term Value): eCPM 너머, 광고 랭킹의 진짜 기준',
    excerpt: '단기 eCPM 1위였던 ‘반값특가 이어폰’ 광고가, 재구매율을 반영한 90일 LTV 기준으로는 4위까지 밀립니다. 대신 5위였던 기저귀 정기배송이 1위로 올라옵니다. 사용자 비용(β)과 Squashing Function부터, 월 5% 할인율로 미래 가치를 현재가치로 환산하면 3·4위가 또 한 번 뒤집히는 과정까지 파이썬으로 직접 계산합니다. 90일을 기다릴 수 없어 가입 후 7일 신호로 LTV를 예측하면 5개 중 4개의 순위가 틀리고, 그 오차가 랭킹에 그대로 번지는 것도 시뮬레이션으로 확인합니다.',
    date: '2026-04-11',
    categories: ['Bidding & Auction'],
    tags: ['eCPM', 'Ad Ranking', 'Ad Ecosystem', 'pCTR'],
    contentUrl: 'posts/ltv-ad-ranking.md',
  },
  {
    id: 'ad-log-system',
    worldPractical: '담장 안에서는 노출·클릭·전환이 모두 자사 서버에 남아, 스키마를 한 팀이 통제하고 request_id도 내가 만든 것이라 조인이 확실하다. 필드를 바꿔야 하면 사내 합의 한 번으로 끝나고, 깨지는 지점도 우리 코드 안이라 배포 전에 잡힌다. 열린 RTB는 로그가 SSP·자사·광고주 포스트백으로 흩어져 스키마 합의 자체가 회사 간 협상이 되고, 남이 보내주는 필드가 예고 없이 바뀐다. 그래서 내가 만드는 필드와 남이 주는 필드를 스키마에서 갈라 두고 남이 주는 쪽은 전부 nullable로 잡으며, 전환 포스트백은 재시도 규약을 문서로 합의하고 일별 대조로 누락을 잡는다.',
    world: 'both',
    worldNote: '요청·노출·클릭·전환 로그가 곧 학습 데이터라는 건 양쪽 공통이다. 닫힌 생태계는 한 회사가 다 찍어 로그가 한 줄로 이어지고, 열린 RTB는 여러 회사에 흩어지고 진 입찰가는 안 보여 잇기가 훨씬 어렵다.',
    title: '광고 로그 시스템 완전 해부: Request Log에서 Candidate Log까지',
    excerpt: '로그 시스템을 수집 계층·스키마 진화·저장소 선택·품질 감시 네 갈래로 설계합니다. 재전송이 있는 곳에는 반드시 중복이 있어서, 노출 1건이 로그 2건이 되면 CTR 분모가 부풀고 pCTR이 실제보다 낮게 학습됩니다. 그래서 최소 1회 전송 + 멱등키로 짜고, 저장소는 스트림(며칠)·원본 보관(수개월~수년)·질의용(집계본) 3단으로 나눕니다. 스키마 변경 3종을 어제 로그에 직접 넣어 보면, 필드 추가와 이름 변경은 KeyError로 크게 터지지만 타입 변경은 조용히 5,000자짜리 문자열을 피처로 흘려보냅니다. Candidate Log 유무가 만드는 negative sample 차이(요청당 1건 → 수십~수백 건)와 멀티슬롯 rank=1 추론 문제까지 다룹니다.',
    date: '2026-04-11',
    categories: ['ML Infrastructure'],
    tags: ['ML Infra', 'pCTR', 'pCVR', 'Ad Ecosystem', 'Online Learning'],
    contentUrl: 'posts/ad-log-system.md',
  },
  {
    id: 'adtech-dev-layers',
    worldPractical: '레이어 중 타겟팅이 두 무대에서 가장 크게 갈린다. 담장 안은 로그인 ID로 “이 사람이 이 사람”을 확정할 수 있고 기기를 바꿔도 이어지지만, 열린 RTB는 쿠키·기기 ID에 기대 크로스디바이스 매칭이 60~70%에 그친다. 이 차이가 단발성이 아니라는 게 핵심이다. 타겟팅 오차는 잘못된 노출을 만들고 그 로그가 다시 학습 데이터가 되므로, 재료가 부실한 쪽은 부실함이 시간이 갈수록 누적된다. 반대로 예측·입찰·소재 레이어의 작업 내용 자체는 양쪽이 거의 같다.',
    world: ['open-rtb', 'walled-garden'],
    worldNote: '여기 나오는 ‘입찰 최적화’ 층은 열린 RTB 얘기다 — 남의 경매에 얼마 낼지 정하는 일. 닫힌 생태계에선 이 층이 자기 안의 경매·순위 매기기로 바뀐다.',
    title: 'Ad Tech 개발 레이어 맵: 광고 요청 하나가 유저에게 도달하기까지',
    excerpt: '광고 하나가 뜨기까지 8개 레이어를 통과합니다. 문제는 “다 중요하다”는 말이 우선순위를 못 정해 준다는 것입니다. 기대수익이 곱셈 사슬이라 어느 칸이 10% 나빠져도 매출은 똑같이 10% 줄어드니까요. 갈리는 지점은 오차가 몇 층으로 번지는가입니다. 타겟팅·측정 오차는 다음 학습을 오염시켜 10%가 34.4%로 커지지만, 소재 오차는 그 라운드에서 10%로 끝납니다. 소재 조합이 180개면 A/B로 전부 검증하는 데 29일이 걸리는데, 밴딧은 진짜 1등(CTR 3.40%)을 못 찾고 3.05%를 골라도 클릭을 40.1% 더 벌어들입니다.',
    date: '2026-04-11',
    categories: ['Bidding & Auction'],
    tags: ['Ad Ecosystem', 'pCTR', 'Auto-Bidding', 'ML Infra', 'RTB'],
    contentUrl: 'posts/adtech-dev-layers.md',
  },
  {
    id: 'negative-sampling-bias',
    worldPractical: '담장 안에서는 다운샘플링 비율 r을 내가 정하고 떨어진 후보의 점수까지 다 로깅되니, 보정이 사실상 산수로 끝난다. 대신 재학습이 r을 바꿨는데 서빙 보정 상수가 안 따라가는 사고가 잦아, r은 코드 상수가 아니라 모델 메타데이터에 박아 함께 배포한다. 열린 RTB의 DSP는 이긴 노출만 로그가 되고 패찰 원인이 경쟁사 입찰가라, propensity에 추정 불가능한 부분이 남는다. 그래서 ‘노출됐는데 클릭 안 됨’과 ‘입찰했는데 패찰’을 한 통에 담지 말고, 보정은 이긴 노출에만 적용하고 패찰은 낙찰확률 모델로 따로 다룬다.',
    world: 'both',
    worldNote: '학습 데이터가 ‘과거에 보여준 광고’에서만 생겨 처음부터 편향된다는 문제는 양쪽 공통이다. 닫힌 생태계는 자기 지면 노출을 다 봐서 편향이 단순하고, 이긴 노출만 보이는 열린 RTB는 보정이 더 까다롭다.',
    title: 'Negative Sampling & Sample Selection Bias: 광고 CTR 모델의 학습 데이터는 처음부터 편향되어 있다',
    excerpt: '안 눌린 로그를 1/10로 줄여 학습하면 진짜 2%인 클릭률이 학습셋에서 16.86%로, 실제 트래픽 평균 예측은 진짜의 7.7배로 부풉니다. 되돌리는 공식은 한 줄, p = q / (q + (1-q)/r) 입니다. 가상 로그 50만 행으로 직접 세어 보면 보정 후 1.98%로 정확히 돌아옵니다. 여기에 노출 자체가 편향된 Sample Selection Bias(IPS·Doubly Robust)와, 담장 안·열린 RTB에서 갈리는 실무 난이도까지 다룹니다.',
    date: '2026-04-11',
    categories: ['Measurement & Modeling'],
    tags: ['pCTR', 'Ad Ecosystem', 'ML Infra'],
    contentUrl: 'posts/negative-sampling-bias.md',
  },
  {
    id: 'two-tower-retrieval',
    worldPractical: '담장 안은 로그인 ID가 안정적이라 유저 임베딩까지 미리 계산해 캐시에 얹어 둘 수 있다. 요청 때는 꺼내 쓰기만 하니 유저 타워 추론 0.8ms를 아예 안 낸다. 열린 RTB의 DSP는 쿠키가 매번 달라 미리 구운 벡터를 찾을 키가 없어, 요청마다 유저 타워를 실시간으로 돌린다. 대신 뽑을 후보가 노출 한 자리용 수십 개라 ANN 없이 전수 내적으로 버티는 경우가 많고, 콜드 유저와 패찰 데이터 소실이 더 큰 골칫거리다.',
    world: 'both',
    worldNote: '수백만 후보를 순식간에 추리는 기법은 양쪽 공통이다. 닫힌 생태계는 자기 지면에 여러 광고를 줄 세우려 크게 돌리고, 열린 RTB의 광고주는 노출 한 자리에 낼 입찰 후보를 추리는 데 쓴다.',
    title: 'Two-Tower Model & 광고 후보 생성: 수백만 광고에서 10ms 안에 후보를 추리는 법',
    excerpt: '광고 10만 개에 정밀 랭킹 모델(1건 0.3ms)을 다 돌리면 30초입니다. 100ms 예산의 300배죠. 같은 10만 개를 유저 벡터와 광고 벡터의 내적으로 훑으면 13.6ms, 2,206배 빨라집니다. 후보가 100만 개로 늘면 전수 내적도 128.8ms로 예산을 넘고, 그때 ANN이 전체의 2%만 훑어 3.4ms로 떨어뜨립니다. in-batch negative를 log-Q로 보정하지 않으면 인기 광고가 negative로 11.4배 자주 등장해, 적합도 1위 광고가 4위로 밀립니다.',
    date: '2026-04-11',
    categories: ['ML Infrastructure'],
    tags: ['Model Serving', 'ML Infra', 'pCTR'],
    contentUrl: 'posts/two-tower-retrieval.md',
  },
  {
    id: 'multi-task-learning',
    worldPractical: '담장 안에서는 노출·클릭·전환이 한 회사 로그에서 끝나, 노출 한 줄에 “클릭했고 전환까지 갔다”는 라벨을 직접 붙일 수 있다. ESMM이 요구하는 라벨이 정확히 이것이라 구조를 그대로 쓸 수 있고, 좋아요·저장·체류 시간까지 태스크를 5~6개로 늘리기도 쉽다. 열린 RTB에서는 클릭 라벨만 깨끗하고 전환은 MMP·픽셀·포스트백을 통해 남의 시스템에서 뒤늦게 들어온다. 노출과 전환을 이을 키가 없으면 그 라벨을 못 매기고, 라벨이 절반만 관측되면 곱셈 구조를 타고 pCVR까지 아래로 눌린다. 그래서 태스크마다 라벨 신뢰도를 다르게 보고 손실 가중치를 낮추는 것이 실무의 출발점이다.',
    world: 'both',
    worldNote: '클릭과 전환을 한 모델로 함께 학습하는 기법은 양쪽 공통이다. 닫힌 생태계는 클릭·전환을 자사 로그로 끝까지 이어 정답이 깨끗하고, 열린 RTB는 전환이 외부에 있어 잇기 어렵고 늦게·일부만 도착한다.',
    title: 'Multi-Task Learning: pCTR과 pCVR을 동시에 학습하면 왜 더 좋은가',
    excerpt: '클릭과 전환을 한 모델에서 같이 배우는 이유는 둘입니다. 하나는 pCVR이 배우는 공간을 서빙 공간과 맞추는 것(ESMM), 다른 하나는 데이터가 적은 태스크가 많은 태스크의 표현을 빌려 쓰는 것(Shared-Bottom·MMoE·PLE)입니다. 노출 10만·클릭 2천·전환 60의 가상 데이터로 재보면, 클릭만 보고 배운 pCVR의 노출 가중 오차는 0.637%p인데 ESMM 방식은 0.042%p로 15.2배 차이가 납니다. 표현 공유는 태스크가 정렬돼 있으면 상수 예측 대비 -8.5%를 얻지만, 상충하면 +0.1%로 이득이 통째로 사라집니다.',
    date: '2026-04-11',
    categories: ['Measurement & Modeling'],
    tags: ['pCTR', 'pCVR', 'Model Serving'],
    contentUrl: 'posts/multi-task-learning.md',
  },
  {
    id: 'exploration-exploitation',
    worldPractical: '담장 안에서는 탐색 비율을 정책으로 직접 정할 수 있다. 소재 수·트래픽 규모·소재 수명별로 탐색 비율을 다르게 세팅하는 실무가 가능하고, 실제로 필요하다(하나의 숫자로 고정하면 어떤 캠페인은 과소, 어떤 캠페인은 과다 탐색이 된다). 다만 계산대로 실행하는 건 또 다른 문제다. 캠페인 담당자가 분기 성과 때문에 탐색 비율을 낮춰 달라고 요청하는 조직 인센티브 문제가, 실무에서는 알고리즘 튜닝보다 자주 발목을 잡는다.',
    world: 'both',
    worldNote: '‘잘 되는 광고를 더 쓸까, 새 광고를 시험할까’라는 딜레마는 양쪽 공통이다. 닫힌 생태계는 자기 트래픽으로 새 광고에 노출을 직접 배정해 시험하고, 열린 RTB의 광고주는 노출을 못 줘 입찰가·소재 안에서만 시험한다.',
    title: '탐색과 활용(Exploration & Exploitation): 광고 시스템의 근본적 딜레마',
    excerpt: '신규 소재 하나를 검증하려면 최소 몇 번의 노출이 필요할까요? 10% 향상을 확인하려면 80,679회가 필요하고, 실패하면 80,679원 손해지만 안 해보면 연 1,200만원을 놓칩니다. 탐색 비율을 0%·5%·20%·50%로 시뮬레이션하면 수익이 가장 높은 지점은 20%이고, 이 최적값은 소재 수·트래픽 규모·소재 수명에 따라 5%~50%까지 움직입니다. Cold-Start 해법과 함께, 조직의 인센티브·브랜드 리스크처럼 알고리즘으로는 안 풀리는 탐색의 한계까지 다룹니다.',
    date: '2026-04-11',
    categories: ['Bandits & Personalization'],
    tags: ['MAB', 'Contextual Bandit', 'UCB', 'Thompson Sampling'],
    contentUrl: 'posts/exploration-exploitation.md',
  },
  {
    id: 'deep-ctr-models',
    worldPractical: '담장 안에서는 로그인 계정에 검색·클릭·장바구니·구매가 한 줄로 쌓여 유저당 행동 50~100개를 꺼낼 수 있고, 그래서 DIN·DIEN의 attention이 실제로 이득을 낸다(유저 ID를 hashing 없이 그대로 embedding하고, 비광고 로그까지 학습에 쓴다). 열린 RTB의 DSP는 Bid Request에 도메인·슬롯·디바이스만 오고 쿠키·기기 ID 매칭률이 낮아, 시퀀스가 붙어도 3~4개라 attention이 mean pooling과 같아진다. 그래서 열린 RTB는 도메인 × 슬롯 위치 × 시간대 교차와 도메인 단위 집계 피처에 예산을 쓰고, 시퀀스 모듈이 없는 DCN-v2가 DIN보다 유리하다. 한마디로 담장 안은 “유저를 아는 것”, 열린 RTB는 “자리를 아는 것”이 무기다.',
    world: 'both',
    worldNote: '클릭 예측 모델의 구조 자체는 양쪽 그대로다. 닫힌 생태계는 자기 로그인 기반 행동 기록을 풍부히 넣고, 열린 RTB는 쿠키·광고 요청 신호로 제한적으로 넣는 게 차이다.',
    title: 'Deep CTR 모델의 진화: LR에서 DIN까지, 광고 클릭률 예측의 핵심 아키텍처',
    excerpt: 'LR은 ‘20대 × 저녁’을 배울 수 없습니다. 나이·시간 단독 클릭률이 둘 다 2.43%인 가상 로그에서 원 피처만 쓴 LR은 AUC 0.506·LogLoss 0.1141로 동전 던지기 수준이지만, 교차 피처 하나를 손으로 붙이면 AUC 0.707·LogLoss 0.1050이 됩니다. 이 ‘조합을 누가 만드나’라는 질문이 FM → Wide & Deep → DeepFM → DCN-v2를, ‘유저 행동을 어떻게 압축하나’가 DIN → DIEN을 낳았습니다. one-hot 교차는 37TB인데 16차원 embedding은 0.66GB(5만 6천 배)이고, DIN의 attention은 전체 파라미터의 0.0133%뿐입니다 — 정확도는 파라미터가 아니라 연산 순서에서 나옵니다.',
    date: '2026-04-11',
    categories: ['Measurement & Modeling'],
    tags: ['pCTR', 'Model Serving', 'ML Infra'],
    contentUrl: 'posts/deep-ctr-models.md',
  },
  {
    id: 'calibration',
    worldPractical: '담장 안에서는 요청·랭킹·노출·클릭 로그가 한 회사에 다 남아, 세그먼트별 P/O Ratio를 시간 단위로 갱신할 수 있다. 대신 보정 오차로 1등이 바뀌면 그 손실이 곧 자기 매출이고, CPC·CPM·예약(CPT) 물량을 eCPM으로 환산해 비교하니 확률의 절댓값이 반드시 필요하다. 열린 RTB의 DSP는 낙찰된 노출만 보이기 때문에 보정용 데이터부터 승자 편향에 걸린다. 과대 예측한 세그먼트는 더 자주 이겨 데이터가 쌓이고, 과소 예측한 세그먼트는 계속 패찰해 보정할 기회조차 오지 않는다.',
    world: 'both',
    worldNote: '예측 확률을 실제에 맞게 바로잡는 건 양쪽 다 중요하다. 열린 RTB는 그 확률이 입찰가에 바로 곱해져 틀리면 곧 손해고, 닫힌 생태계도 과금·리포트 정확도 때문에 여전히 중요하다.',
    title: 'Calibration: AUC가 높아도 돈을 잃는 이유 — 광고 모델의 확률 보정',
    excerpt: 'AUC 0.85 모델이 왜 돈을 잃는지 가상 데이터 후보 5개로 직접 계산합니다. 보정 없이 뽑은 1등은 A인데, 세그먼트별로 보정하면 1등이 C로 바뀝니다. 전체 COPC를 0.893에서 1.000으로 맞춰도 순위는 그대로 A라서, 노출 1,000회당 3,500원(하루 1,000만 노출이면 3,500만 원)의 손실은 한 푼도 줄지 않습니다. COPC는 실제÷예측이라 1보다 크면 과소예측이고, P/O Ratio는 그 역수입니다.',
    date: '2026-04-11',
    categories: ['Measurement & Modeling'],
    tags: ['pCTR', 'Bid Shading', 'Auto-Bidding'],
    contentUrl: 'posts/calibration.md',
  },
  {
    id: 'ad-network-vs-exchange',
    worldPractical: '열린 RTB에서는 매체가 Network 순서·바닥값·타임아웃을 직접 튜닝하고, DSP는 Exchange마다 다른 Bid Request 스펙과 1등 가격 규칙을 감당해야 한다. 담장 안(네이버·카카오)은 지면도 광고주 계정도 자기 것이어서 중개를 맡길 Network이 없었고, 그래서 Waterfall도 헤더비딩도 겪지 않았다. 대신 같은 자리를 두고 내부 보장형·성과형을 어떤 기대수익으로 저울질할지가 처음부터 숙제였다. 실무에서는 이 차이가 “트래픽 소스를 피처로 넣을 것인가”로 나타난다 — Exchange 트래픽은 피처가 풍부하고 낙찰가를 관측할 수 있지만, Network 경유 트래픽은 세그먼트 레벨이라 같은 pCTR 모델에 섞으면 정확도가 깎인다.',
    world: 'open-rtb',
    worldNote: '애드네트워크·거래소는 광고주와 매체를 이어주는 중개상이다. 구글·메타·네이버·카카오처럼 한 회사가 다 가진 닫힌 생태계에선 중개할 상대가 없어 이 구분이 사라진다.',
    title: 'Ad Network vs Ad Exchange: 디지털 광고 유통 구조의 진화',
    excerpt: '고정 CPM 하나로 지면을 묶어 팔면 프리미엄은 헐값에 넘기고 롱테일은 유찰됩니다. 가상 데이터로 계산하면 최선의 고정가 1,100원조차 노출 단위 경매(실효 CPM 1,101원)의 45%밖에 못 법니다. Waterfall은 순서가 수익을 정합니다. 같은 Network 5곳·같은 입찰가로 120가지 순서를 전부 돌려 보면 최선 1,847원과 최악 1,435원이 29% 갈리고, 최선조차 경매보다 17% 낮습니다. 순차 호출의 지연 누적까지 더하면 하루 1,000만 노출에서 19만 건이 이탈로 사라집니다.',
    date: '2026-04-11',
    categories: ['Bidding & Auction'],
    tags: ['Ad Ecosystem', 'RTB', 'SSP', 'DSP'],
    contentUrl: 'posts/ad-network-vs-exchange.md',
  },
  {
    id: 'position-bias-ultr',
    world: 'walled-garden',
    worldNote: '위에 있는 광고가 더 눌리는 건 좋아서가 아니라 위에 있어서다 — 이 착시를 걷어내는 게 이 글의 주제다. 열린 RTB는 광고가 보통 한 개라 덜 중요하지만, 검색·피드에 광고가 여러 개 줄 서는 닫힌 생태계에선 핵심 문제다.',
    worldPractical: '담장 안에서 일하면 위치 로그가 정확하고, 트래픽 일부를 떼어 순서를 무작위로 섞는 실험도 직접 설계할 수 있다. 그래서 이 글의 IPS·DLA는 바로 랭킹 모델 학습에 들어가는 실전 도구다. 대신 그만큼 ‘위치 편향을 안 재는 것’이 변명이 안 된다 — 잴 수 있는데 안 잰 것이 되기 때문이다.',
    title: 'Position Bias & Unbiased Learning to Rank: 위치가 만드는 착각을 제거하는 법',
    excerpt: '같은 광고를 1위와 5위에 놓으면 CTR이 6.7배 차이 난다 — 품질이 아니라 위치 때문이다. 다섯 광고의 가상 데이터에서 위치 효과(Examination Probability)를 역산하는 IPW 코드를 직접 돌려 보면, 관측 순위는 그냥 위치 순서(A~E)인데 보정 후에는 4위였던 광고가 1위로 올라선다. 위치별 프로브 실험으로 편향을 추정하는 방법(2위 실제 75.0% 대 추정 74.4%), IPS·DLA로 이어지는 ULTR 보정 기법, 그리고 이 가정이 깨지는 경우까지 다룬다.',
    date: '2026-04-10',
    categories: ['Measurement & Modeling'],
    tags: ['pCTR', 'Ad Ecosystem', 'MAB'],
    contentUrl: 'posts/position-bias-ultr.md',
  },
  {
    id: 'model-serving-architecture',
    worldPractical: '담장 안은 트래픽이 자기 것이라 어제 이 시간의 요청량이 오늘도 맞고, 그래서 서버 대수를 미리 계산해 용량을 잡을 수 있다. 로그인 ID가 안정적이니 유저 피처와 임베딩을 미리 구워 캐시에 얹어 두면 실제로 적중해서, 튜닝이 “예산 안에 들어가기”보다 “같은 예산으로 더 무거운 모델 돌리기”로 간다. 열린 RTB의 DSP는 요청이 거래소에서 밀려와 평시의 몇 배가 예고 없이 튀고, 쿠키가 매번 달라 미리 구운 유저 피처를 찾을 키 자체가 흔들린다. 같은 하드웨어인데 유저 임베딩 조회가 0.453ms 대 1.062ms로 2.3배 느려, 유저 피처를 적게 쓰고 광고·문맥 피처에 더 기대는 설계로 밀린다.',
    world: 'both',
    worldNote: '예시는 열린 RTB 말투(0.01초 안에 응답, 낙찰률)로 쓰였지만, 여러 단계로 후보를 걸러 순식간에 점수 매기는 기법은 양쪽 그대로다. 닫힌 생태계에선 ‘경매에서 진다’ 대신 ‘내부 응답 시간’이 제약이 된다.',
    title: '광고 모델 서빙 아키텍처: 10ms 안에 수백 개 광고를 스코어링하는 법',
    excerpt: '단건 0.02ms인 가벼운 모델도 후보가 2,000개면 40ms입니다. 배치 크기를 1에서 32로 키우면 같은 트래픽을 서버 41대가 아니라 3대로 받지만, 128까지 키우면 p99가 14.75ms가 되어 10ms 예산에서 탈락합니다. 인기 광고 상위 1%가 요청의 66.6%를 먹으니 상위 10%를 6.1MB로 캐시하면 조회 지연이 1.2ms에서 0.241ms로 5배 줄어듭니다. 조회 하나의 1% 꼬리도 100번 fan-out하면 요청의 63.4%를 물들인다는 계산까지 붙였습니다.',
    date: '2026-04-10',
    categories: ['ML Infrastructure'],
    tags: ['Model Serving', 'ML Infra', 'pCTR'],
    contentUrl: 'posts/model-serving-architecture.md',
  },
  {
    id: 'online-learning-delayed-feedback',
    worldPractical: '담장 안에서 pCVR을 만들면 전환이 자사 결제 로그로 바로 들어온다. 유실이 없으니 1~6시간 창으로 자주 학습하면서 아직 안 들어온 전환은 역수 가중으로 되돌리는 게 실제로 먹힌다. 열린 RTB의 DSP는 포스트백이 광고주·MMP에서 넘어오니 지연이 광고주마다 다르고 일부는 영원히 안 온다. 유실을 지연으로 착각해 가중치를 부풀리면 pCVR이 반대로 과대추정된다. 담장 안은 “언제 오나”만 풀면 되고, 열린 RTB는 “오기는 하나”를 먼저 풀어야 한다.',
    world: 'both',
    worldNote: '모델이 시간이 지나 낡는 문제는 양쪽 다 겪는다. 닫힌 생태계는 전환 결과가 자사 로그로 바로 들어와 덜 낡고, 열린 RTB는 결과가 늦게·여기저기서 와서 더 빨리 낡는다.',
    title: 'Online Learning & Delayed Feedback: 광고 모델은 왜 매일 낡아지는가',
    excerpt: '6시간만 기다려 학습하면 전환의 59.7%만 잡힙니다. 7일을 기다리면 97.2%를 잡지만 학습 데이터는 평균 252시간 묵습니다. 대기 시간을 1시간·6시간·1일·7일로 바꿔 가며 돌려 보면 최적점이 하나가 아님이 드러납니다. 지연을 무시하고 학습하면 참 CVR 3%가 1.89%로 보이고 입찰가도 참값의 63%로 주저앉는데, 도착 확률의 역수로 되돌리면 2.94%까지 복원됩니다. 마지막 코드는 4주치 평일·주말 CTR 급변을 굴려, 요일 피처가 없는 학습기 넷은 주말을 세 번 겪고도 매번 1.9% 부근에서 다시 배운다는 걸 보여 줍니다.',
    date: '2026-04-10',
    categories: ['ML Infrastructure'],
    tags: ['Online Learning', 'ML Infra', 'pCTR', 'pCVR'],
    contentUrl: 'posts/online-learning-delayed-feedback.md',
  },
  {
    id: 'auto-bidding-pacing',
    worldPractical: '담장 안에서는 플랫폼이 모든 입찰을 직접 보고 지면의 트래픽 총량도 알아, 시간대별 페이싱 계획을 추정이 아니라 계산으로 세운다. 그래서 실무 관심사가 “얼마나 올까”가 아니라 “같은 예산을 어느 캠페인에 먼저 줄까”라는 내부 배분 정책으로 옮겨간다. 열린 RTB의 DSP는 패찰하면 경쟁가를 못 보고 인벤토리 총량도 남의 것이라, 남은 시간의 기회 수부터 틀리면 페이싱이 통째로 흔들린다. 다만 목표 CPA를 조일 때 물량이 사라지는 절벽과, 제어 계수를 잘못 잡아 λ가 상·하한을 왕복하는 문제는 양쪽 공통이다.',
    world: 'open-rtb',
    worldNote: '이 글은 남의 경매에 참여하는 열린 RTB의 자동입찰·예산 배분을 다룬다. 닫힌 생태계는 플랫폼이 경매를 직접 쥐고 있어, 남들이 얼마 쓸지 추정할 필요 없이 자기 신호만으로 예산 속도를 조절한다.',
    title: 'Auto-Bidding & Budget Pacing: 일 예산 제약 하에서 수십만 번 입찰을 최적화하는 법',
    excerpt: '목표 CPA와 하루 예산을 받아 매 요청의 입찰가를 정하고, 그 예산을 하루 중 언제 쓸지 배분하는 층을 다룹니다. 하루 100만 원을 아침에 몰아 쓰면 전환 34.0건, 시간대 균등이면 35.6건인데, 시간대별 기대 전환율로 가중하면 49.4건이 됩니다 — 같은 예산으로 CPA가 29,411원에서 20,260원으로 내려갑니다. 목표 CPA를 6,000원에서 3,000원으로 조이면 승률이 50.4%에서 18.8%로, 예산 소진율이 100%에서 46.4%로 무너집니다. CPA는 지켜지지만 물량이 사라지는 것입니다. PID·라그랑주 승수·강화학습 세 방식을 비교하고, 입찰가가 왜 가치를 (1+μ)로 나눈 값이 되는지도 유도합니다.',
    date: '2026-04-10',
    categories: ['Bidding & Auction'],
    tags: ['Auto-Bidding', 'Bid Shading', 'RTB'],
    contentUrl: 'posts/auto-bidding-pacing.md',
  },
  {
    id: 'feature-store-serving',
    worldPractical: '담장 안에서는 로그인 ID가 안정적이라 유저 피처를 미리 계산해 캐시에 얹어 두고 꺼내 쓰기만 하면 된다. 조회 시간이 거의 안 들어 100밀리초 예산이 훨씬 여유롭다. 열린 RTB의 DSP는 쿠키가 매번 달라 미리 구운 피처를 찾을 키 자체가 흔들리고, 그래서 요청 시점에 만들어야 하는 피처가 훨씬 많다. 같은 신선도를 원하면 담장 안보다 비싸게 사야 하는 구조다. 다만 training-serving skew 자체는 양쪽 공통이고, 재학습이 피처 정의를 바꿨는데 서빙 쪽이 안 따라가는 사고는 담장 안에서도 똑같이 난다.',
    world: 'both',
    worldNote: '예시는 열린 RTB 말투(광고 요청·낙찰)로 쓰였지만, 예측 재료를 모아두고 실시간으로 꺼내 쓰는 방식은 양쪽 그대로다. 데이터가 어디서 오느냐만 다르다.',
    title: 'Feature Store & Real-Time Serving: 광고 ML 시스템의 데이터 공급망 전체 지도',
    excerpt: '학습에 쓴 피처와 서빙에서 쓰는 피처가 다르면 모델은 조용히 틀립니다. 시험 문제를 냈던 교과서와 실제 시험지가 다른 상황입니다. “지난 7일 클릭 수”라는 피처 하나로 재 보면, 학습은 자정 기준 배치값을 쓰고 서빙은 실시간 카운터를 쓰는 것만으로 평균 3.366%p가 어긋납니다. 가장 심한 유저는 pCTR이 3.4%에서 14.2%로, 입찰가가 34원에서 142원으로 4배 벌어집니다. 어긋남의 방향이 한쪽이라는 게 더 문제입니다 — 배치값은 항상 과거라서 지금 가장 반응이 좋은 유저를 항상 과소평가합니다. Batch·Streaming·Real-Time 세 파이프라인을 신선도로 나누는 이유와, Point-in-Time Join으로 미래 정보 누출을 막는 방법까지 다룹니다.',
    date: '2026-04-10',
    categories: ['ML Infrastructure'],
    tags: ['ML Infra', 'DSP', 'pCTR'],
    contentUrl: 'posts/feature-store-serving.md',
  },
  {
    id: 'ecpm-ranking',
    world: ['open-rtb', 'walled-garden'],
    worldNote: '노출당 기대수익(eCPM)으로 순위를 매기는 건 공통이지만 시장마다 계산이 다르다. 이 글은 열린 RTB·클릭당 과금 거래소·닫힌 생태계 세 시장의 순위 매기기를 나란히 비교한다.',
    worldPractical: '담장 안에서는 eCPM 계산 주체가 플랫폼 자신이라 랭킹 기준을 코드로 직접 확인할 수 있다. 그래서 실무의 관심사는 ‘기준이 뭘까’가 아니라 ‘품질계수·페이싱 가중치를 얼마로 정할까’라는 정책 결정 쪽으로 옮겨간다. 열린 RTB의 DSP라면 반대로 남이 정한 최종 CPM 하나만 보고 이겨야 하니, 이 글의 Bid Shading·True Value 계산이 훨씬 더 직접적인 실무 문제가 된다.',
    title: 'eCPM과 광고 랭킹: 서로 다른 시장에서 1등을 결정하는 기준',
    excerpt: 'eCPM(1,000회 노출당 기대수익)의 정의와 계산법을 정리하고, Open RTB·CPC Exchange·Walled Garden 세 시장에서 같은 광고가 전혀 다른 순위를 받는 이유를 구체적 숫자로 비교한다. 파스타집이 떡볶이집보다 입찰가가 3배 낮아도 이기는 이유(랭킹 점수 100 대 30), DSP가 내부 가치와 다른 입찰가를 제출하는 이유까지 다룬다. 마지막에는 같은 광고 후보 4개에 순수 eCPM·품질 가중·LTV 기준을 각각 적용해, 기준을 바꿀 때마다 1등이 대출 광고에서 지역 맛집으로, 다시 구독 서비스로 바뀌는 것을 직접 계산해 보인다.',
    date: '2026-04-11',
    categories: ['Bidding & Auction'],
    tags: ['Ad Ecosystem', 'pCTR', 'RTB'],
    contentUrl: 'posts/ecpm-ranking.md',
  },
  {
    id: 'walled-garden',
    world: ['walled-garden', 'open-rtb'],
    worldNote: '이 글이 바로 ‘닫힌 생태계 vs 열린 RTB’ 개념의 기준점이다. 한 회사가 경매를 직접 열어 모든 입찰가를 다 보니, 열린 RTB처럼 ‘져서 남 값을 못 보는’ 일이 없다.',
    worldPractical: '담장 안에서 일하면 이 글의 수수료 계산이 실무 감각과 맞아떨어진다 — 중개 수수료가 없는 대신, pCTR 캘리브레이션 오차가 그대로 매출과 유저 경험에 번진다. 그래서 실무 자원은 Bid Shading보다 위치 편향 보정이나 반사실 평가처럼 ‘내가 노출을 직접 결정하는’ 데서 오는 문제에 더 쏠린다. 열린 RTB 쪽 기술(Censored Regression·밴딧)도 하이브리드 구조 때문에 완전히 남의 일은 아니다.',
    title: 'Walled Garden: 네이버·카카오는 왜 DSP부터 Publisher까지 다 가지고 있는가',
    excerpt: '네이버·카카오·구글·메타는 왜 DSP부터 Publisher까지 다 갖고 있을까. 월 예산 ₩10,000,000이 열린 RTB에서는 DSP·Exchange·SSP 수수료를 거쳐 매체에 ₩6,502,500(65.0%)만 도착하지만, 담장 안에서는 내부 운영비만 떼고 ₩9,700,000(97.0%)이 그대로 남는다 — 구조만으로 1.49배 차이다. 여기에 담장 안의 데이터 우위로 pCTR 예측이 더 정확해지는 효과(평균 진짜 CTR 4.21% 대 3.95%)까지 곱하면 격차는 1.59배로 벌어진다. 프라이버시 규제(쿠키 축소·ATT)가 왜 오히려 이 격차를 더 키우는지, 담장 안 플랫폼이 열린 RTB 시장까지 잠식하는 방식까지 파이썬으로 확인한다.',
    date: '2026-04-06',
    categories: ['Bidding & Auction'],
    tags: ['Ad Ecosystem', 'DSP', 'SSP', 'RTB', 'pCTR'],
    contentUrl: 'posts/walled-garden.md',
  },
  {
    id: 'adtech-ecosystem-map',
    worldPractical: '열린 RTB에서는 지도의 상자 대부분이 남의 회사다. 경계를 넘을 때마다 수수료가 곱으로 쌓이고, 패찰 시 경쟁자 입찰가처럼 아예 넘어오지 않는 정보가 생긴다. 그래서 실무 난이도가 가로 화살표(회사 사이)에 몰린다 — OpenRTB Bid Request에 실린 필드만으로 예측해야 한다. 담장 안(네이버·카카오)에서는 매체·SSP·Exchange·DSP가 대부분 한 회사여서 수수료 칸과 정보 단절 칸이 함께 사라지고, 승부는 세로선(두뇌 층 ↔ 거래 층, 예측→입찰가)에서 갈린다.',
    world: ['open-rtb', 'walled-garden'],
    worldNote: '이 글이 그리는 ‘사는 쪽-경매장-파는 쪽’ 사슬은 열린 RTB의 모습이다. 닫힌 생태계에선 이 사슬이 한 회사로 접혀, 이기고 진 기록 없이 자기 데이터만으로 예측·순위를 돌린다.',
    title: 'pCTR 모델러를 위한 광고 기술 생태계 전체 지도',
    excerpt: '광고 생태계 21개 모듈을 두 층(위=두뇌 층, 아래=거래 층)으로 읽는 법을 정리하고, 직접 재생해 보는 지도 페이지로 안내합니다. 지면 5개짜리 페이지가 한 번 열리면 Bid Request 300건, 하루 1,000만 PV면 30억 건, 그런 매체 100곳이면 초당 347만 건이 됩니다. 지도를 그래프로 옮겨 세어 보면 21개 모듈 전부가 심장(pCTR/pCVR)에서 4다리 안에 있고, 두뇌 층 고리는 한 바퀴에 31.5시간(그중 76%가 전환 라벨 대기)이 걸립니다. 열린 RTB는 구간마다 10~20% 수수료와 정보 단절이 쌓이지만, 담장 안에서는 그 두 칸이 함께 사라집니다.',
    date: '2026-04-06',
    categories: ['Bidding & Auction'],
    tags: ['Ad Ecosystem', 'pCTR', 'pCVR', 'Auto-Bidding', 'Bid Shading'],
    contentUrl: 'posts/adtech-ecosystem-map.md',
    featured: true
  },
  {
    id: 'bid-shading-censored',
    worldPractical: '열린 RTB의 DSP는 경매 바깥에 있어 패찰한 입찰의 상대 가격을 볼 수 없다. 그래서 시장 가격 분포를 Censored Regression으로 추정하는 일이 실무의 절반을 차지한다. 담장 안(네이버·카카오)은 경매를 직접 열어 모든 입찰가가 로그에 남으니 이 추정 문제 자체가 없다. 대신 정보의 비대칭이 뒤집힌다 — 플랫폼이 입찰가를 깎아 준 근거를 광고주가 볼 수 없다. 꼬리를 알려면 일부러 높게 입찰해 사 와야 한다는 점(탐색 비용)은 열린 RTB 쪽만의 숙제다.',
    world: 'open-rtb',
    worldNote: '이 글의 문제 — 얼마 낼지 몰라 입찰가를 깎는 일 — 은 ‘져도 남 값을 못 보는’ 열린 RTB에서만 생긴다. 닫힌 생태계는 모든 입찰가를 실제로 다 보고 경매를 직접 여니 이런 고민이 아예 없다.',
    title: 'Bid Shading & Censored Data: 1st Price Auction에서 최적 입찰가를 찾는 법',
    excerpt: '1st price 경매에서 진짜 가치를 그대로 부르면 이익이 정확히 0입니다. 가치 1,000원 노출에서 0·20·40·50%를 깎아 보면 기대이익이 0원·171.7원·267.6원·256.4원으로 움직여, 최적점이 양 끝이 아니라 가운데에 있음이 드러납니다. 문제는 패찰하면 경쟁가를 영영 못 본다는 것(censored)입니다. 이긴 경매만 모아 평균을 내면 시장 591원을 356원으로 40% 싸게 보고, 그 편향이 세 바퀴 도는 사이 기대이익이 268.9원에서 237.6원으로 깎입니다. Kaplan-Meier로 패찰을 “적어도 내 입찰가는 넘었다”는 정보로 쓰면 관측 구간은 오차 0.00%로 복원되지만, 내 입찰가 위쪽은 되살릴 수 없습니다 — 그건 데이터가 아니라 가정의 영역입니다.',
    date: '2026-04-06',
    categories: ['Bidding & Auction'],
    tags: ['Bid Shading', 'RTB', 'pCTR'],
    contentUrl: 'posts/bid-shading-censored.md',
  },
  {
    id: 'pcvr-modeling',
    world: 'both',
    worldNote: '클릭한 것만 학습해 생기는 편향, 같은 전환이 여러 번 잡히는 문제는 양쪽 공통이다. 닫힌 생태계는 전환을 자사 로그로 직접 봐 걸러내기 쉽고, 열린 RTB는 전환이 외부 여러 경로로 들어와 중복 걸러내기가 훨씬 어렵다.',
    worldPractical: '담장 안에서는 결제 시스템이 발급한 주문번호를 그대로 신뢰할 수 있어 중복 제거 자체는 상대적으로 깨끗하다. 그래서 실무 자원은 지연 전환 보정(라벨이 아직 안 붙은 클릭을 어떻게 다룰지)과 ESMM류 구조로 클릭 편향(SSB)을 우회하는 쪽에 더 쏠린다.',
    title: 'pCVR: ‘누른 다음 살까?’를 맞히는 확률, 그런데 정답지부터 흔들린다',
    excerpt: '같은 캠페인의 전환 로그 10건에 ‘주문키·시간창·기기’ 세 가지 중복 제거 규칙을 각각 적용하면, 학습에 들어갈 전환 수가 5건·6건·5건으로 갈린다. 지연 전환 분포를 보면 클릭 당일 학습 시 관측 전환율이 최종 전환율의 42%만 잡혀, pCVR이 실제보다 2.38배 낮게 추정된다. 클릭한 노출에서만 배우고 전체 노출에 서빙하는 불일치(SSB)를 ESMM이 어떻게 우회하는지도 개념으로 짚는다.',
    date: '2026-01-10',
    categories: ['Measurement & Modeling'],
    tags: ['pCVR', 'pCTR'],
    contentUrl: 'posts/pCVR-modeling.md',
  },
  {
    id: 'TS-linTS',
    world: 'both',
    worldNote: '톰슨 샘플링 같은 탐색·활용 알고리즘은 무대를 안 가린다. 닫힌 생태계는 자기 지면에 어떤 광고를 띄울지 고르는 데 쓰고, 열린 RTB의 광고주는 어떤 입찰에 참여할지 고르는 데 쓴다 — 적용 지점만 다르다.',
    worldPractical: '담장 안에서는 노출마다 클릭 여부가 항상 관측돼 사후분포가 빠르고 예측 가능하게 좁아지고, 유저·지면 컨텍스트도 로그인 기반이라 Linear TS가 쓸 특징이 안정적이다. 열린 RTB의 DSP는 패찰하면 그 라운드의 관측 자체가 없어 사후분포가 갱신되지 않고, 지연 전환까지 겹치면 진짜 보상에 대한 믿음이 한참 늦게 따라온다 — 같은 톰슨 샘플링이라도 확신이 쌓이는 속도 자체가 다르다.',
    title: '톰슨 샘플링: 믿음을 갱신하며 뽑는다 — 기본형에서 Linear TS까지',
    excerpt: '톰슨 샘플링은 소재의 클릭률을 숫자 하나가 아니라 베타 분포(믿음)로 들고 있다가, 매번 그 분포에서 표본을 뽑아 결정한다. 노출이 10회에서 1,000회로 늘면 95% 구간이 [2.3%, 41.3%]에서 [4.8%, 7.8%]로 좁아지고, 선택도 진짜 1등 소재 쪽으로 84.6%까지 쏠린다. 하지만 지면·연령대에 따라 같은 소재의 성적이 갈리면 기본 톰슨은 전체 평균만 보고 한쪽에 발이 묶인다. 계수 자체에 대한 믿음에서 표본을 뽑는 Linear TS가 필요한 지점이다 — 시뮬레이션에서 컨텍스트별 학습(196회 클릭)이 컨텍스트를 무시한 방식(144회)보다 이론상 최선(210회)에 훨씬 가깝게 따라붙었다.',
    date: '2026-01-03',
    categories: ['Bandits & Personalization'],
    tags: ['Thompson Sampling', 'MAB', 'Contextual Bandit'],
    contentUrl: 'posts/TS-linTS.md',
  },
  {
    id: 'mab-summary',
    world: 'both',
    worldNote: '여기 모은 밴딧 알고리즘들은 무대를 안 가리는 순수 기법이다. 닫힌 생태계는 자기 지면 노출을 직접 배정하며 쓰고, 열린 RTB의 광고주는 어떤 입찰에 참여할지 고르는 데 쓴다.',
    worldPractical: '담장 안에서는 노출을 직접 배정해 교과서적 밴딧 조건에 가장 가깝고, 탐색 비용도 스스로 감당한다. 열린 RTB의 광고주는 입찰에 이겨야만 피드백을 얻고, 패찰하면 그 라운드는 데이터 자체가 없어 같은 알고리즘이라도 정보가 모이는 속도 자체가 다르다.',
    title: '멀티암드 밴딧: 어느 광고를 더 보여줄까 — 알고리즘 계보 지도',
    excerpt: '광고 소재 5개, 진짜 클릭률은 아무도 모른다. 균등분배·그리디(100회 탐색 후 고정)·밴딧(ε-greedy·UCB1·톰슨 샘플링) 다섯 전략을 같은 1,000회에 붙이면, 그리디는 누적 후회 99.2로 균등분배(86.0)보다도 나쁜 결과를 냈고 톰슨 샘플링이 19.3으로 가장 낮았다. ε-greedy에서 출발해 UCB 계열·톰슨 샘플링·컨텍스추얼(LinUCB·LinTS)로 갈라지는 알고리즘 계보와, 지연 보상·비정상성·예산 제약·패찰 시 피드백 부재처럼 밴딧이 광고 현실에서 안 통하는 지점까지 정리했다.',
    date: '2026-01-17',
    categories: ['Bandits & Personalization'],
    tags: ['MAB', 'LinUCB', 'Thompson Sampling', 'UCB'],
    contentUrl: 'posts/mab.md',
  },
  {
    id: 'ucb-vs-ts',
    world: 'both',
    worldNote: 'UCB든 톰슨 샘플링이든 탐색·활용 원리는 무대를 안 가린다. 닫힌 생태계는 자기 지면에 띄울 광고를 고르는 데, 열린 RTB의 광고주는 참여할 입찰을 고르는 데 쓴다 — 적용 지점만 다르다.',
    worldPractical: '담장 안에서는 노출을 직접 배정하니 탐색 비용도 스스로 감당하고, 클릭 여부도 항상 관측된다. 다만 트래픽이 몰리는 순간에는 UCB의 결정성이 오히려 같은 소재로의 쏠림을 만들 수 있어, 대규모 서빙에서는 톰슨 샘플링이나 UCB에 무작위 타이브레이크를 더하는 방안을 함께 검토할 만하다.',
    title: 'UCB vs Thompson Sampling: 결정적(Deterministic) vs 확률적(Stochastic)',
    excerpt: 'UCB는 관측 CTR에 탐색 보너스를 더한 점수로 소재를 고르는 계산기라, 노출 1,000·1,000·500·150에 클릭 50·30·30·9인 소재 A~D 표에서 몇 번을 다시 계산해도 항상 소재 D(점수 0.3842)를 뽑는다. 톰슨 샘플링은 같은 표의 베타 사후분포에서 매번 표본을 뽑는 주사위라, 100번 중 D 50번·C 41번·A 9번·B 0번으로 갈린다. 1,000회 시뮬레이션에서는 톰슨 샘플링의 누적 후회(16.24)가 UCB1(59.96)의 3분의 1 이하였다. 재현성이 중요하면 UCB, 동시 요청이 몰리거나 피드백이 지연되면 톰슨 샘플링이 유리하다.',
    date: '2026-01-17',
    categories: ['Bandits & Personalization'],
    tags: ['UCB', 'Thompson Sampling', 'MAB'],
    contentUrl: 'posts/ucb_ts.md',
  },
  {
    id: 'disjoint-linucb',
    world: 'both',
    worldNote: 'LinUCB 같은 밴딧 기법은 무대를 안 가린다. 닫힌 생태계는 자기 지면 노출을 직접 배정하며 쓰고, 열린 RTB의 광고주는 어떤 입찰에 참여할지 고르는 데 쓴다.',
    worldPractical: '담장 안에서는 로그인 기반 컨텍스트가 넉넉하고 노출을 직접 배정해 피드백도 항상 관측돼, Disjoint LinUCB가 상정하는 조건에 가장 가깝다. 열린 RTB에서는 패찰하면 그 요청의 재료 자체가 사라지고, 캠페인·소재 교체가 잦아 계수가 쓸 만해지기 전에 arm이 먼저 사라지기도 한다. 그래서 열린 RTB일수록 캠페인 간 지식을 공유하는 Hybrid LinUCB 쪽으로 넘어갈 유인이 커진다.',
    title: 'Disjoint LinUCB 모델 상세 해석',
    excerpt: 'Disjoint LinUCB는 광고(arm)마다 계수를 따로 학습한다. 컨텍스트(연령대·관심사·저녁여부) 8건을 학습시키면 스포츠 광고는 관심사 계수 0.73, 육아 광고는 연령대 계수 0.70을 배워 같은 유저에게도 다른 점수를 낸다. 표준 라이브러리만으로 가우스-조던 소거법을 직접 짜 800회를 돌리면, 컨텍스트를 무시하는 UCB1보다 클릭이 38.7% 더 많다. 탐색 강도를 0.1·1.0·3.0으로 바꾸면 누적 클릭이 137·172·154건으로 갈린다. Sherman-Morrison 갱신·콜드스타트·피처 스케일 문제까지 다룬다.',
    date: '2026-01-20',
    categories: ['Bandits & Personalization'],
    tags: ['LinUCB', 'Contextual Bandit', 'MAB'],
    contentUrl: 'posts/disjoint-LinUCB.md',
  },
  {
    id: 'ad-serving-flow',
    world: 'open-rtb',
    worldNote: '이 글은 여러 회사(사는 쪽·경매장·파는 쪽)를 거쳐 광고가 뜨는 열린 RTB 흐름을 그린다. 닫힌 생태계는 이 셋이 한 회사라, 중간 단계 없이 자기 안에서 순위를 매겨 바로 광고를 띄운다.',
    worldPractical: '담장 안에서 일해도 이 글의 코드 경로(후보 조회 → 필터링 → 점수 계산 → 랭킹 → 낙찰 → 소재 조립 → 로그 적재)는 거의 그대로 적용된다. 다만 네트워크 홉이 짧아 지연 예산 대부분을 계산 자체에 쓸 수 있고, 그만큼 더 무거운 모델을 돌릴 여유가 생긴다. 대신 필터 순서 최적화와 비동기 로깅은 오히려 담장 안에서 더 직접적인 압력으로 작동한다 — 늦어지면 네트워크나 남의 회사를 탓할 수 없기 때문이다.',
    title: 'Ad Serving Flow: 광고가 유저에게 도달하는 전체 과정',
    excerpt: '광고 요청 1건이 응답으로 나가기까지, 서버 코드는 후보 조회 → 필터링 → 점수 계산 → 랭킹 → 낙찰 → 소재 조립 → 로그 적재 순서를 통과한다. 이 글은 후보 120,000건이 필터링을 거쳐 800건까지 좁혀지는 깔때기와, 여덟 단계가 나눠 쓰는 45ms 지연 예산을 가데이터로 재구성한다. 파이썬으로 필터 순서를 바꿔 보면 최종 결과는 같아도 처리 비용이 8.84배 벌어지고, 나쁜 순서 하나로 45ms 타임아웃을 넘긴다는 것까지 직접 계산해 확인한다.',
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
    worldPractical: '담장 안에서는 로그인 데이터 덕에 컨텍스트 피처가 풍부해, LinUCB·Hybrid LinUCB가 이론이 아니라 실제로 이득을 낸다. 신규 소재가 잦은 지면이라면 Hybrid의 공유 파라미터로 콜드스타트를 줄이는 설계를 검토할 만하다. 다만 소재 몇 개짜리 배너처럼 컨텍스트가 별 의미 없는 자리에서는, 굳이 행렬 연산을 늘리지 않고 UCB1만으로 충분한 경우도 많다.',
    title: 'UCB 알고리즘 패밀리: UCB1 vs LinUCB vs Hybrid LinUCB',
    excerpt: '소재 하나가 어느 지면·어느 시간대에 걸리느냐에 따라 클릭률이 달라지는데, UCB1은 그 맥락을 아예 못 본다. 그래서 ‘평균적으로 좋은’ 소재 하나만 계속 밀고, 4,000회를 돌려도 두 소재를 1,943 대 2,057로 거의 반씩 나눠 쓴다. 맥락별로 따로 배우게 하면 같은 4,000회에서 클릭이 192회에서 245회로 27.6% 늘어난다. 이 격차가 LinUCB를 부른 이유다. 여기에 arm마다 데이터가 흩어져 새 소재가 오래 헤매는 문제를 공유 파라미터로 푸는 Hybrid LinUCB까지, UCB1에서 갈라져 나온 계보를 문제에서 해법으로 짚는다.',
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
const mlTrack = {
  title: 'ML 엔지니어 트랙',
  subtitle: 'pCTR/pCVR 실무 커리큘럼 — 광고 ML의 심장을 입문부터 심화까지. 일반 독자도 지도처럼 훑어보세요.',
  stages: [
    {
      id: 'stage-1',
      title: '1단계 · 입문 — 예측이 돈이 되는 원리',
      goal: '이 단계를 마치면: pCTR/pCVR이 무엇이고, 왜 절대값(보정)이 중요하며, 어떤 모델로 맞히는지 큰 그림이 잡힙니다.',
      posts: ['pctr-prediction', 'ecpm-ranking', 'calibration', 'pcvr-modeling', 'deep-ctr-models'],
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
      goal: '이 단계를 마치면: 탐색-활용부터 피처 실전·지표 운영·실험 설계까지 실무 전체가 이어집니다. 앞 두 단계가 “무엇을 어떻게 만드나”였다면, 여기는 “만든 것을 어떻게 굴리고 판단하나”입니다.',
      posts: ['exploration-exploitation', 'cold-start-pctr', 'ctr-feature-engineering',
        'embedding-table-ops', 'model-monitoring',
        'model-ab-testing', 'conversion-definition',
        'bid-shading-censored', 'auto-bidding-pacing', 'ltv-ad-ranking'],
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

// 옛 주소 → 현재 id. 한번 밖으로 나간 링크는 계속 살려 둔다(북마크·검색엔진 인덱스).
// 'my-markdown-post'는 템플릿 기본 id가 그대로 굳어 버린 자리였다.
const POST_ID_ALIASES = {
  'my-markdown-post': 'pcvr-modeling',
};

function getPostById(id) {
  const resolved = POST_ID_ALIASES[id] || id;
  return posts.find(post => post.id === resolved);
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
