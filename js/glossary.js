// ==========================================================================
// Ad Tech Glossary — 데모 및 포스트에서 자주 등장하는 핵심 용어 사전
// demos.html 하단에 아코디언으로 자동 렌더링
// ==========================================================================

const GLOSSARY = [
  {
    term: 'RTB',
    abbr: 'Real-Time Bidding',
    body: '광고 노출 요청이 발생할 때마다 DSP들이 <strong>100ms 이내에</strong> 실시간으로 입찰가를 써내 가장 높은 입찰자가 노출을 가져가는 프로토콜. 업계 표준 규격은 <strong>OpenRTB</strong>. 한 번의 페이지 로드가 수십~수백 개의 Bid Request를 만들어낸다.'
  },
  {
    term: 'DSP',
    abbr: 'Demand-Side Platform',
    body: '광고주를 대신해 <strong>경매에 참가하고 입찰가를 결정</strong>하는 플랫폼. pCTR/pCVR 모델, Budget Pacer, Bid Shading 같은 기술 스택이 모두 DSP 내부에 있다. 예: Google DV360, The Trade Desk, 네이버 GFA.'
  },
  {
    term: 'SSP',
    abbr: 'Supply-Side Platform',
    body: '매체사(Publisher)를 대신해 <strong>경매를 운영</strong>하고 매체 수익을 최적화하는 플랫폼. Floor Price 설정, Header Bidding, Ad Exchange 연동을 담당. 예: Google Ad Manager, Magnite, PubMatic.'
  },
  {
    term: 'Ad Exchange',
    abbr: '광고 거래소',
    body: '다수의 DSP와 SSP를 연결해 <strong>경매를 실행하는 중앙 거래소</strong>. Bid Request를 DSP들에게 뿌리고 최고가 낙찰자를 결정한다. 예: Google AdX, OpenX.'
  },
  {
    term: '1st Price Auction',
    abbr: '최고가 경매',
    body: '1등이 <strong>자기가 쓴 금액 그대로 지불</strong>하는 경매. 2020년 전후로 디지털 광고의 사실상 표준이 됨. "진짜 가치보다 비싸게 내면 손해"라 Bid Shading이 필수.'
  },
  {
    term: '2nd Price Auction',
    abbr: '차가 경매',
    body: '1등이 이겨도 <strong>2등 가격 + 약간</strong>만 지불하는 경매. 진정한 최고 가치를 써내는 것이 우월전략이라 통계적으로 아름답지만, 수익 투명성 문제로 1st Price로 이동함.'
  },
  {
    term: 'Header Bidding',
    abbr: '헤더 비딩',
    body: '전통적 Waterfall(네트워크 순차 호출)을 대체한 구조. 매체가 <strong>여러 SSP/Exchange에 동시에 경매</strong>를 요청해 최고가를 뽑아 광고 서버로 보낸다. 매체 수익이 평균 10~30% 증가.'
  },
  {
    term: 'eCPM',
    abbr: 'effective CPM',
    body: '"1,000회 노출 시 기대 수익"으로 환산한 지표. CPM, CPC, CPA 광고를 한 줄에 비교하는 공통 통화. <strong>eCPM<sub>CPC</sub> = CPC × 예상 CTR × 1,000</strong>. 여기서 예상 CTR이 곧 pCTR 모델의 출력.'
  },
  {
    term: 'CPM / CPC / CPA',
    match: ['CPM', 'CPC', 'CPA'],
    abbr: '비용 과금 단위',
    body: '<strong>CPM</strong>(Cost Per Mille) = 1,000회 노출당 비용, <strong>CPC</strong>(Cost Per Click) = 클릭당, <strong>CPA</strong>(Cost Per Action) = 전환당. 광고주가 원하는 KPI에 따라 선택. 퍼포먼스 마케팅은 CPA 중심, 브랜딩은 CPM 중심.'
  },
  {
    term: 'CTR / CVR',
    match: ['CTR', 'CVR'],
    abbr: 'Click / Conversion Rate',
    body: '<strong>CTR</strong> = 클릭 ÷ 노출, <strong>CVR</strong> = 전환 ÷ 클릭. 광고 성과의 두 핵심 깔때기. 디스플레이 CTR은 0.1~1% 수준, 검색광고는 3~20% 수준.'
  },
  {
    term: 'pCTR / pCVR',
    match: ['pCTR', 'pCVR'],
    abbr: 'predicted CTR/CVR',
    body: '<strong>예측 클릭률, 전환율</strong>. 머신러닝 모델이 출력하는 확률값으로, 입찰가 계산의 입력이 된다. 정확도와 Calibration(보정)이 직접적으로 수익과 직결된다.'
  },
  {
    term: 'Bid Shading',
    abbr: '입찰가 깎기',
    body: '1st Price 경매에서 True Value를 그대로 내면 낙찰률은 100%여도 이익이 0. <strong>시장 분포를 추정해 "이길 최소 금액"만 내는 기술</strong>. 경쟁자 가격을 못 보는 Censored Data 문제를 동반.'
  },
  {
    term: 'Surplus',
    abbr: '잉여',
    body: '입찰자가 낙찰 시 얻는 이익. <strong>Surplus(b) = (V - b) × P(win|b)</strong> — V는 True Value, b는 입찰가, P는 낙찰 확률. 이 함수를 최대화하는 것이 최적 입찰 전략.'
  },
  {
    term: 'Win Rate',
    abbr: '낙찰률',
    body: '내가 입찰한 경매 중 이긴 비율. 입찰가가 오르면 Win Rate는 시그모이드 곡선으로 증가하지만, 그만큼 비용도 따라 올라 Profit은 어느 지점에서 꺾인다.'
  },
  {
    term: 'Floor Price',
    abbr: '최저 입찰가',
    body: 'SSP/매체가 설정하는 <strong>경매 최저 지불선</strong>. 이 아래는 자동 탈락. 매체가 낮은 입찰로 노출 품질이 떨어지지 않도록 설정하며, 높을수록 입찰 참여자가 줄어든다.'
  },
  {
    term: 'Censored Data',
    abbr: '검열 데이터',
    body: '내가 패찰한 경매에서는 <strong>경쟁자 가격(Clearing Price)을 관측할 수 없다</strong>. 이로 인한 시장 분포 추정 편향(Selection Bias)을 Survival Analysis와 같은 Censored Regression 기법으로 보정한다.'
  },
  {
    term: 'Exploration vs Exploitation',
    abbr: '탐색과 활용',
    body: '"지금까지 최고였던 광고"(Exploitation)만 고집하면 더 나은 광고를 못 찾고, "새 광고만 시도"(Exploration)하면 손실이 큼. 이 딜레마의 해법이 <strong>밴딧(Multi-Armed Bandit) 알고리즘</strong>.'
  },
  {
    term: 'UCB (Upper Confidence Bound)',
    match: ['UCB'],
    abbr: '상한 신뢰 구간',
    body: '각 광고에 "평균 CTR + 불확실성 보너스"를 더한 점수로 선택. 데이터가 적을수록 보너스가 커져 자연스럽게 탐색 유도. <strong>UCB1 공식: x̄ + √(2 ln t / n)</strong>.'
  },
  {
    term: 'Thompson Sampling',
    abbr: 'TS',
    body: '각 광고의 CTR에 Beta 분포로 불확실성을 표현하고, 매 라운드 그 분포에서 샘플링해 최고 샘플값을 선택하는 <strong>확률적 밴딧</strong>. UCB와 비슷한 수렴 성능에 구현은 더 간결.'
  },
  {
    term: 'LinUCB',
    abbr: 'Contextual Bandit',
    body: 'UCB1을 <strong>Context Vector(유저 특성, 시간대 등)</strong>로 확장. 개별 광고 ID가 아닌 피처 가중치를 학습해, 처음 보는 유저, 광고에도 일반화 가능. Disjoint LinUCB가 가장 단순한 형태.'
  },
  {
    term: 'Regret',
    abbr: '후회값',
    body: '"매 라운드 최적 광고를 알았더라면 얻었을 수익" − "실제 얻은 수익"의 누적. 좋은 밴딧 알고리즘은 Regret이 <strong>O(log t) 또는 O(√t)</strong>로 증가 — 시간이 갈수록 최적에 점근.'
  },
  {
    term: 'Calibration',
    abbr: '확률 보정',
    body: 'pCTR 모델이 "1%"라고 출력한 광고들의 실제 CTR도 1%가 되어야 한다. AUC는 순서만 보지만 입찰가는 절대값을 쓰므로 <strong>Platt Scaling, Isotonic Regression</strong> 같은 보정이 필수.'
  },
  {
    term: 'Attribution',
    abbr: '어트리뷰션',
    body: '전환(구매, 설치)이 어느 광고 접점 덕분인지 공로를 배분. <strong>Last-click</strong>(단순, 편향), <strong>MTA</strong>(Multi-Touch), <strong>MMM</strong>(시계열 회귀), iOS ATT 시대의 <strong>SKAdNetwork</strong>가 공존.'
  },
  {
    term: 'Walled Garden',
    abbr: '폐쇄형 생태계',
    body: '네이버, 카카오, Meta, Google처럼 <strong>DSP부터 매체까지 한 회사가 다 소유</strong>한 구조. Open RTB의 외부 DSP는 들어올 수 없고, 내부에서만 경매, 측정이 완결된다. 데이터 독점 vs 효율의 트레이드오프.'
  },

  // 2026-09-18 추가 — 글에서 세 번 이상 나오면서 한 번도 안 풀리던 용어들
  {
    term: 'Sample Selection Bias',
    abbr: '표본 선택 편향',
    body: '모델이 <strong>클릭한 노출에서만 배우고</strong> 노출 전체에 쓰이는 어긋남. 학습 표본과 추론 표본이 달라서, 노출은 많고 클릭은 적은 자리에서 크게 틀린다. ESMM 이 노출 전체에서 배우게 해 이 문제를 피한다.',
    match: ['Sample Selection Bias', 'SSB']
  },
  {
    term: 'MMoE',
    abbr: 'Multi-gate Mixture-of-Experts',
    body: '태스크마다 <strong>다른 전문가 조합</strong>을 쓰는 구조. 클릭과 전환처럼 성격이 다른 태스크가 같은 바닥을 쓰면 서로 방해하는데, 게이트가 태스크별로 전문가 비중을 달리 준다.'
  },
  {
    term: 'PLE',
    abbr: 'Progressive Layered Extraction',
    body: '공용 전문가와 <strong>태스크 전용 전문가</strong>를 층으로 나눈 구조. MMoE 에서 전문가가 섞여 생기는 간섭을 층으로 떼어 줄인다.'
  },
  {
    term: 'Feature Interaction',
    abbr: '피처 조합',
    body: '피처를 따로 보는 대신 <strong>둘 이상을 곱해</strong> 보는 것. "20대"만으로는 뜻이 없지만 "20대 × 저녁 × 화장품"이 되면 뜻이 생긴다. 이 조합을 누가 만드느냐가 CTR 모델 계보의 축이다.'
  },
  {
    term: 'Cross Network',
    abbr: '피처 조합을 층마다 쌓는 부분',
    body: 'DCN 의 한 갈래로, 층을 하나 올릴 때마다 <strong>조합의 차수가 하나 올라간다</strong>. DNN 보다 파라미터가 적게 들면서 고차 조합을 명시적으로 배운다.'
  },
  {
    term: 'DIEN',
    abbr: 'Deep Interest Evolution Network',
    body: '유저 행동의 <strong>변해 가는 관심</strong>을 읽는 구조. DIN 이 관련성만 보는 데 비해, GRU 로 순서를 읽어 1주 전 운동화에서 어제 트레일 러닝화로 옮겨 간 흐름을 잡는다.'
  },
  {
    term: 'Discrimination',
    abbr: '순서를 맞히는 능력',
    body: '누를 광고를 안 누를 광고보다 <strong>높은 점수로 세우는</strong> 능력. AUC 가 측정하는 것이 이것이다. 확률의 크기가 맞는지는 따로 측정해야 하고, 그것이 Calibration 이다.'
  },
  {
    term: 'Reliability Diagram',
    abbr: '보정 그림',
    body: '예측 확률을 가로축에, 그 구간에서 <strong>실제로 일어난 빈도</strong>를 세로축에 찍은 그림. 점선(y=x)에 붙을수록 잘 보정된 모델이다.'
  },
  {
    term: 'ECE',
    abbr: 'Expected Calibration Error',
    body: '보정 그림을 <strong>숫자 하나</strong>로 요약한 값. 예측과 실제의 평균 격차이고, 작을수록 확률이 맞는다.'
  },
  {
    term: 'Examination Hypothesis',
    abbr: '먼저 봐야 누른다는 전제',
    body: '클릭이 두 단계라는 가정. <strong>그 자리를 봤나</strong>와 <strong>보고 눌렀나</strong>다. 앞은 자리에만 달렸고 뒤가 광고 품질이라, 둘을 나눠야 자리 효과가 걷힌다.'
  },
  {
    term: 'MNAR',
    abbr: 'Missing Not At Random',
    body: '빠진 데이터가 <strong>무작위로 빠진 게 아닌</strong> 상태. 광고 로그가 그렇다. 모델이 좋게 본 광고만 노출되니, 안 보인 것은 이유가 있어서 안 보인 것이다.'
  },
  {
    term: 'Concept Drift',
    abbr: '세상이 변해 모델이 낡는 것',
    body: '유저 취향, 경쟁 상황, 계절이 바뀌면 <strong>어제의 정답이 오늘 틀린다</strong>. 코드도 데이터 파이프라인도 멀쩡한데 성능만 조용히 내려간다.'
  },
  {
    term: 'Delayed Feedback',
    abbr: '라벨이 늦게 도착하는 것',
    body: '클릭은 즉시 찍히지만 전환은 <strong>몇 시간에서 며칠 뒤</strong>에 온다. 안 기다리고 학습하면 아직 안 온 전환이 "안 샀다"로 들어가 pCVR 이 낮게 배워진다.'
  },
  {
    term: 'GMM',
    abbr: 'Gaussian Mixture Model',
    body: '한 사람이 <strong>여러 무리에 확률로</strong> 걸리는 묶기 방법. K-Means 가 한 무리에만 넣는 것과 달리, 패션 0.7 스포츠 0.3 처럼 나눠 담는다.'
  },
  {
    term: 'Propensity Model',
    abbr: '살 것 같은 정도를 점수로 매기는 모델',
    body: '유저마다 <strong>전환할 확률</strong>을 찍어 순위를 매긴다. Lookalike 에서 임베딩으로 후보를 넓게 뽑고, 이 점수로 순위를 다시 매기는 조합을 많이 쓴다.'
  },
  {
    term: 'Label Propagation',
    abbr: '이웃에게 표를 퍼뜨리는 방법',
    body: '그래프에서 아는 사람의 라벨을 <strong>연결된 이웃으로 번지게</strong> 하는 방식. 시드와 직접 닿지 않은 사람까지 닮음이 전해진다.'
  },
  {
    term: 'Censored Regression',
    abbr: '보이지 않는 절반을 감안해 맞추는 회귀',
    body: '1등 가격 경매에서 <strong>패찰하면 경쟁가를 못 본다</strong>. 이긴 것만 보고 맞추면 시장가를 낮게 보게 되므로, 못 본 쪽이 내 입찰가보다 높았다는 사실만이라도 넣어 맞춘다.'
  },
  {
    term: 'PID',
    abbr: '되돌려 잡는 제어 방식',
    body: '목표에서 <strong>벗어난 만큼</strong>, 그리고 <strong>벗어난 채 흘러온 시간</strong>과 <strong>벗어나는 속도</strong>를 같이 봐서 되돌린다. 예산 페이싱에서 하루 예산을 24시간에 고르게 태우는 데 쓴다.'
  },
  {
    term: 'Feature Vector',
    abbr: '모델에 넣는 숫자 묶음',
    body: '한 요청에 대해 모아 온 피처를 <strong>정해진 순서의 숫자 줄</strong>로 만든 것. 이 줄의 자리가 학습과 서빙에서 어긋나면 모델이 조용히 틀린다.'
  },
  {
    term: 'Candidate Log',
    abbr: '후보 로그',
    body: '후보로 <strong>뽑힌 광고</strong>를 남기는 기록. 이것이 있으면 안 뽑힌 광고까지 학습의 음성 표본으로 쓸 수 있어, 요청당 음성이 한 건에서 수백 건으로 넓어진다.'
  },
  {
    term: 'No-Fill',
    abbr: '빈 자리로 끝난 요청',
    body: '채울 광고가 없어 <strong>아무것도 안 뜬</strong> 경우. 노출 로그에는 안 남으므로 요청 로그가 유일한 단서다. Fill Rate 를 측정하는 분모가 여기서 나온다.'
  },
  {
    term: 'Multi-Stage Ranking',
    abbr: '단계마다 줄이며 고르는 구조',
    body: '후보 수십만 개에 정밀 모델을 다 돌릴 수 없어서, <strong>가벼운 모델로 줄이고 무거운 모델로 고른다</strong>. 뒤로 갈수록 후보는 적어지고 모델은 무거워진다.'
  },
  {
    term: 'QPS',
    abbr: 'Queries Per Second',
    body: '<strong>초당 요청 수</strong>. 서버 한 대가 받아 낼 수 있는 양과 필요한 서버 대수를 정하는 값이다.'
  },
  {
    term: 'DAG',
    abbr: 'Directed Acyclic Graph',
    body: '<strong>순서가 있고 되돌아오지 않는</strong> 작업 그림. A 가 끝나야 B 를 돌린다는 관계를 적어 두면 스케줄러가 순서대로 실행한다.'
  },
  {
    term: 'Airflow',
    abbr: '작업 순서를 짜고 돌리는 도구',
    body: '작업 사이의 순서를 파이썬으로 적어 두면 <strong>정해진 시각에 순서대로</strong> 돌려 주고, 실패한 것만 다시 돌릴 수 있다.'
  },
  {
    term: 'Flink',
    abbr: '실시간 처리 도구',
    body: '흘러오는 데이터를 <strong>쌓아 두지 않고 지나가며</strong> 처리한다. 최근 10분 클릭 수 같은 값을 몇 초 안에 갱신할 때 쓴다.'
  },
  {
    term: 'Metastore',
    abbr: '표의 목록과 모양을 적어 둔 곳',
    body: '어떤 테이블이 있고, 칸 이름이 무엇이고, 파일이 <strong>어느 경로에 어떤 형식</strong>으로 있는지를 담는다. Hive 와 Spark 가 같은 표를 보는 것은 이것을 같이 쓰기 때문이다.'
  },
  {
    term: 'HiveServer2',
    abbr: 'SQL 을 받는 서버',
    body: '지훈 씨가 <strong>접속하는 서버</strong>. SQL 을 받아 계획을 세우고 실행 엔진에 넘긴다. 실제 계산은 Tez 나 Spark 가 한다.'
  },
  {
    term: 'ZooKeeper',
    abbr: '서버들을 맞춰 주는 조정 서비스',
    body: '서버 여럿 중 <strong>누가 살아 있고 누가 대표인지</strong>를 맞춘다. 접속 주소에 여러 서버가 적혀 있는 이유가 여기 있다.'
  },
  {
    term: 'NameNode',
    abbr: '파일이 어디에 있는지 적어 둔 서버',
    body: 'HDFS 에서 <strong>파일 조각이 어느 서버에 있는지</strong>를 기억한다. 데이터 자체는 담지 않고 위치만 담는다.'
  },
  {
    term: 'DataNode',
    abbr: '파일 조각을 담는 서버',
    body: 'HDFS 에서 <strong>실제 데이터 조각</strong>을 담는다. 워커 한 대에 NodeManager 와 같이 있어서, 데이터가 있는 자리에서 바로 계산한다.'
  },
  {
    term: 'HEAD',
    abbr: '지금 서 있는 자리',
    body: 'Git 에서 <strong>현재 체크아웃한 곳</strong>을 가리킨다. 보통 브랜치를 가리키고, 커밋을 직접 가리키면 detached HEAD 가 된다.'
  },
  {
    term: 'Staging Area',
    abbr: '커밋에 담을 것을 골라 두는 자리',
    body: '작업 폴더와 저장소 사이의 <strong>중간 칸</strong>. <code>git add</code> 로 여기에 올린 것만 커밋에 들어간다.'
  },
  {
    term: 'DAG',
    abbr: '순서가 있는 작업 그림',
    body: '학습 파이프라인의 <strong>태스크 일곱 개가 어떤 순서로 도는지</strong>를 적은 것. Airflow 가 이 그림대로 매일 정해진 시각에 태스크를 하나씩 돌리고, 실패한 태스크부터 다시 돌릴 수 있다.'
  },
  {
    term: '백필',
    abbr: 'Backfill',
    body: '고친 코드로 <strong>지난 날짜의 결과를 다시 만드는 일</strong>. 30일을 한 날씩 다시 돌리며, 정상 파이프라인과 클러스터를 나눠 쓰니 한산한 시간대나 별도 클러스터로 민다.'
  },
  {
    term: '멱등',
    abbr: 'Idempotent',
    body: '같은 작업을 <strong>두 번 돌려도 결과가 한 번 돌린 것과 같은</strong> 성질. 출력 파티션을 덮어쓰면 멱등이고, 덧붙이면 재실행 때 행이 두 배가 된다.'
  },
  {
    term: '모델 레지스트리',
    abbr: 'Model Registry',
    body: '학습된 모델마다 <strong>버전, 만든 시각, 재료(코드 해시, 데이터 스냅샷, 설정, 환경), 평가 값, 상태</strong>를 적어 두는 표. 어느 모델이 운영 중이고 어느 것이 후보인지 여기서 정한다.'
  },
  {
    term: '카나리',
    abbr: 'Canary',
    body: '새 모델을 <strong>트래픽의 작은 비율(1%, 10%)에만</strong> 먼저 태우고 게이트를 통과하면 비율을 올리는 배포 방식. 게이트웨이 가중치로 나누므로 되돌리기는 초 단위다.'
  },
  {
    term: '섀도 배포',
    abbr: 'Shadow',
    body: '요청을 복사해 <strong>새 모델도 계산하되 응답에는 쓰지 않는</strong> 단계. 로그에 두 모델의 예측값이 나란히 남아 지연과 분포를 비교할 수 있다. 모델 서버 비용은 두 배.'
  },
  {
    term: '롤백',
    abbr: 'Rollback',
    body: '새 모델이 게이트를 못 넘으면 <strong>이전 모델로 되돌리는 일</strong>. 모델 배포와 코드 배포를 나눠 두면 가중치 하나로 몇 초 만에 돌아간다.'
  },
  {
    term: '워터마크',
    abbr: 'Watermark',
    body: '스트림 처리에서 <strong>「이 시각보다 이른 이벤트는 더 안 온다」고 보는 선</strong>. 워터마크가 2분이면 윈도우는 끝나고 2분 뒤에 닫히고, 그보다 늦게 온 클릭은 윈도우에서 빠진다.'
  },
  {
    term: '슬라이딩 윈도우',
    abbr: 'Sliding Window',
    body: '<strong>길이는 고정하고 시작점을 조금씩 미는 윈도우</strong>. 60분 윈도우를 1분마다 밀면 「최근 1시간」이 된다. 시작점이 고정된 텀블링 윈도우와 다르다.'
  },
  {
    term: '데이터 병렬',
    abbr: 'Data Parallel',
    body: '<strong>같은 모델을 GPU 마다 한 벌씩 두고 데이터를 나눠</strong> 학습한 뒤 기울기를 합치는 방식. 임베딩 표처럼 한 장에 안 들어가는 부분은 따로 쪼갠다.'
  },
  {
    term: '파라미터 서버',
    abbr: 'Parameter Server',
    body: '<strong>큰 임베딩 표를 여러 대에 나눠 들고</strong> 학습 워커가 필요한 줄만 읽고 쓰게 하는 서버. Adam 이면 값 하나가 숫자 셋이라 27.7GB 표가 83.2GB 가 된다.'
  },
  {
    term: 'DMP',
    abbr: 'Data Management Platform',
    match: ['DMP'],
    body: '여러 사이트에서 모은 <strong>남의 데이터(3자 데이터)</strong>를 쿠키 단위로 쌓아 「자동차에 관심 있는 사람」 같은 세그먼트로 묶어 파는 곳. 광고주는 자기가 모르는 사람까지 타겟팅할 수 있었다. 브라우저가 3자 쿠키를 막으면서 쓰임이 크게 줄었고, 자사 데이터를 다루는 <strong>CDP</strong> 로 무게가 옮겨 갔다.'
  },
  {
    term: 'CDP',
    abbr: 'Customer Data Platform',
    match: ['CDP'],
    body: '광고주가 <strong>자기 고객 데이터(1자 데이터)</strong>를 한곳에 모아 두는 곳. 구매 기록, 앱 로그, 회원 정보를 한 사람으로 이어 붙여 세그먼트를 만든다. 남의 쿠키에 기대지 않아 3자 쿠키가 막혀도 그대로 돌아간다. 대신 자기 고객 밖으로는 넓히지 못해 <strong>Lookalike</strong> 가 필요해진다.'
  },
  {
    term: 'GAM',
    abbr: 'Google Ad Manager',
    body: '구글이 만든 <strong>매체 쪽 광고 서버이자 SSP</strong>. 매체가 자기 지면의 광고 자리를 등록해 두고, 직접 판 광고와 경매로 파는 광고를 한 화면에서 굴린다. 안에 광고 거래소 AdX 가 붙어 있다. 개념 이름이 아니라 제품 이름이라 SSP 를 하는 회사의 예로 든다. 옛 이름은 DFP 다.'
  },
  {
    term: '관심사 분류',
    abbr: 'Interest Classification',
    body: '글 한 편에 <strong>관심사 라벨 하나를 붙이는 일</strong>. 키워드 규칙, 라벨이 붙은 글로 배운 분류 모델, LLM 이 같은 일을 하고, 평가 40건에서는 뒤의 둘이 똑같이 38건을 맞혔다.'
  },
  {
    term: '컨텍스추얼 타겟팅',
    abbr: 'Contextual Targeting',
    body: '사람 대신 <strong>지금 읽는 지면의 글로 광고를 고르는</strong> 방식. 회원 번호가 없는 요청에 남는 근거가 지면뿐이라, 다른 회사의 쿠키가 막힐수록 쓰임이 커진다.'
  },
  {
    term: 'IAB 콘텐츠 분류',
    abbr: 'IAB Content Taxonomy',
    body: 'IAB Tech Lab 이 정한 <strong>지면 주제의 표준 목록</strong>. 3.1 버전은 4단계에 카테고리가 704개이고, 입찰 요청은 그 ID 를 <code>site.cat</code> 에, 버전을 <code>cattax</code> 에 적는다.'
  },
  {
    term: '최근성 가중(반감기)',
    abbr: 'Recency Weighting, Half-life',
    body: '사건마다 <strong>지난 날짜만큼 덜 쳐서 더하는</strong> 집계. 반감기 7일이면 7일마다 가중치가 절반이 되어, 러닝 글 9편이 이번 주면 7.21, 모두 2주 전이면 1.80 이다.'
  },
  {
    term: 'pCVR 타겟팅',
    abbr: 'pCVR-based Targeting',
    body: '세그먼트 번호 대신 <strong>모델이 매긴 전환 확률이 높은 순서로</strong> 보여 줄 사람을 고르는 방식. 표본에서 317 과 같은 2,290명을 이렇게 고르면 기대 전환이 1.55배가 되지만, 증분은 대조군으로 따로 측정한다.'
  },
  {
    term: '의도 판정과 조건 추출',
    abbr: 'Intent Classification, Slot Filling',
    body: '문장으로 받은 요청이 <strong>받을 수 있는 것인지 정하고 「무엇이 몇 이상」 꼴의 조건으로 옮기는</strong> 두 단계. 자연어 오디언스에서는 이 둘만 LLM 이 JSON 으로 답하고, 필터와 명단 크기는 코드가 맡는다.'
  },
  {
    term: '토큰',
    abbr: 'Token',
    body: '모델이 글을 읽고 쓰는 <strong>조각 하나</strong>. 입력과 출력을 토큰 수로 세고, 단가도 100만 토큰당 값으로 매긴다.'
  },
  {
    term: '컨텍스트 윈도',
    abbr: 'Context Window',
    body: '모델이 다음 토큰을 고를 때 <strong>한꺼번에 볼 수 있는 토큰의 상한</strong>. 이 블로그의 글은 컨텍스트 길이라고 부르고, 모델 카드마다 다른 값이 적혀 있다.'
  },
  {
    term: 'thinking(reasoning)',
    abbr: 'Thinking, Reasoning Tokens',
    body: '모델이 <strong>답 앞에 쓰는 풀이</strong>. 풀이 토큰도 출력 토큰이라 값을 내고, 같은 요청에서 출력 토큰이 6개에서 505개로 늘어난 기록이 있다.'
  },
  {
    term: '임베딩',
    abbr: 'Embedding',
    body: '글 한 줄을 <strong>정해진 길이의 숫자 목록으로 바꾼 것</strong>. 뜻이 가까운 글은 숫자도 가깝게 놓이게 만들고, 코사인으로 가까움을 측정한다.'
  },
  {
    term: 'RAG',
    abbr: 'Retrieval-Augmented Generation',
    body: '질문과 가까운 <strong>문서 조각을 찾아 프롬프트에 넣고 답하게 하는</strong> 방식. 답의 문장이 넣어 준 조각에 근거가 있는지는 따로 센다.'
  },
  {
    term: 'Context Recall 과 Precision',
    abbr: 'Context Recall, Context Precision',
    body: 'RAG 의 <strong>검색이 정답 문서를 얼마나 가져왔나</strong>를 측정하는 두 값. Recall 은 정답 조각이 상위 k 에 든 질문의 몫이고, Precision 은 상위 k 가운데 정답 조각의 몫이다.'
  },
  {
    term: 'tool use',
    abbr: 'Tool Use, Function Calling',
    body: 'LLM 이 답 대신 <strong>부를 함수와 인자를 고르게 하는</strong> 방식. 함수는 코드가 실행하고, 결과를 다시 넘겨 멈춤 조건이 올 때까지 되풀이하는 것을 에이전트 루프라고 부른다.'
  },
  {
    term: 'MCP',
    abbr: 'Model Context Protocol',
    body: '도구를 서버가 내놓고 <strong>여러 LLM 앱이 같은 꼴로 찾아 부르게 하는</strong> 공개 프로토콜. 도구의 이름, 설명, 인자 스키마를 주고받는 꼴을 명세가 정한다.'
  },
  {
    term: 'LLM-as-a-Judge',
    abbr: 'LLM-as-a-Judge',
    body: '<strong>LLM 에게 채점을 맡기는</strong> 방법. 점수마다 뜻을 적은 채점표를 건네고, 그 점수가 사람 라벨과 얼마나 맞는지 측정하고 나서 쓴다.'
  },
  {
    term: 'Cohen\'s kappa',
    abbr: 'Cohen\'s Kappa',
    body: '두 채점자의 일치에서 <strong>우연히 맞을 몫을 뺀 뒤에 남는</strong> 일치의 크기. 모두 상이라 답하는 판정은 일치율이 0.90 이어도 kappa 가 0.00 이 된다.'
  },
  {
    term: 'BM25',
    abbr: 'Best Matching 25',
    body: '질의 낱말마다 <strong>idf(역문서 빈도)와 TF 항을 곱해 더하는</strong> 검색 점수. TF 항은 낱말이 문서에 든 횟수가 늘수록 커지지만 일정 값에 다가갈 뿐이고, b 가 0 보다 크면 평균보다 긴 문서에서 작아진다.'
  },
  {
    term: 'RRF',
    abbr: 'Reciprocal Rank Fusion',
    body: '여러 순위 목록을 <strong>점수 대신 순위로 합치는</strong> 방법. 목록마다 1 ÷ (k + 순위) 를 더하며, 이 식을 낸 2009년 논문은 시험 삼아 돌린 실험에서 k 를 60 으로 정했다.'
  },
  {
    term: '역방향 검색',
    abbr: 'Users as Documents',
    body: '보통의 검색과 방향을 바꿔 <strong>광고의 키워드로 사람을 찾는</strong> 검색. 회원마다 30일 행동을 문서 한 편으로 적어 두고, 광고 키워드를 질의로 그 문서를 검색해 점수 순으로 회원을 고른다.'
  },
  {
    term: '키워드 확장',
    abbr: 'Keyword Expansion',
    body: '광고 하나에서 <strong>살 만한 검색어를 늘리는</strong> 일. 이 블로그는 전략 일곱의 키워드를 LLM 이 사전의 id 로 고르게 하고, health 와 noise 주제는 코드가 거른다.'
  },
  {
    term: '판정 캐스케이드',
    abbr: 'LLM Cascade',
    body: '모두를 <strong>싼 판정자에게 먼저 보이고, 답을 믿기 어려운 것만 비싼 판정자에게 넘기는</strong> 순서. 생성 문구 판정 체계 편은 점수 다섯의 폭이 2 이상인 카피와 좌우를 바꾸면 승자가 바뀐 쌍을 넘겼다.'
  },
  {
    term: '포인트와이즈와 리스트와이즈',
    abbr: 'Pointwise, Listwise',
    body: '후보를 <strong>하나씩 따로 보느냐, 목록 전체를 한 번에 보느냐</strong>로 나눈 두 방식. LLM 라벨과 코드 랭커 편의 포인트와이즈는 후보 30개를 한 번씩 묻고, 리스트와이즈는 30개를 한 번에 주고 정렬한 목록을 받았다.'
  },
  {
    term: '지식 증류',
    abbr: 'Knowledge Distillation',
    body: '큰 모델(교사)의 답이나 확률로 <strong>작은 모델(학생)을 학습하는</strong> 일. 학생이 교사를 잘 따라 할수록 판정을 싸게 맡길 수 있고, 교사가 바뀌면 라벨을 다시 받아 학생도 다시 학습한다.'
  },
  {
    term: '근거 인용',
    abbr: 'Grounding, Quote',
    body: '모델이 쓴 문장마다 <strong>기댄 구절을 원문에서 그대로 옮겨 적게 하는</strong> 방법. 광고 카피 생성 편은 그 구절을 quote 필드로 받아 자산 텍스트에 있는지 코드가 보고, 카피가 자산의 뜻을 넘는지는 보지 않는다.'
  },
  {
    term: '짝비교 판정',
    abbr: 'Pairwise Comparison',
    body: '둘 가운데 <strong>나은 쪽만 고르게 하는</strong> 판정. 점수 척도를 쓰지 않는 대신, 자리를 바꿔 한 번 더 물어야 자리로 승자를 정하는 위치 편향이 보인다.'
  },
  {
    term: 'A2A',
    abbr: 'Agent2Agent Protocol',
    body: '오케스트레이터가 다른 에이전트에게 <strong>일을 맡기고 결과를 받는 메시지의 꼴을 정한</strong> 공개 명세. MCP 가 에이전트와 도구를 잇는다면 A2A 는 에이전트와 에이전트를 잇고, 에이전트마다 자기를 소개하는 에이전트 카드를 내놓는다.'
  },
  {
    term: 'Semantic ID',
    abbr: 'Semantic ID',
    body: '상품의 내용 벡터에서 만드는 <strong>짧은 코드 묶음</strong>. 비슷한 상품이 앞자리 코드를 나눠 갖게 만들고, 생성 모델이 이 코드를 한 자리씩 생성해 후보를 꺼내는 방법을 생성형 검색이라고 부른다.'
  },
  {
    term: '훅',
    abbr: 'Hook',
    body: '프로그램이 <strong>정해진 자리에서 저절로 실행하도록 걸어 두는</strong> 사용자 코드. Claude Code 의 PreToolUse 훅은 도구 호출이 실행되기 전에 그 입력을 받고, 종료 코드 2 로 호출을 막을 수 있다.'
  },
  {
    term: 'SFT',
    abbr: 'Supervised Fine-Tuning',
    body: '좋은 답 하나를 정답으로 주고 <strong>그 답의 로그 확률을 올리는</strong> 학습. 손실은 좋은 답 하나만 보지만, 낱말을 함께 쓰는 나쁜 답의 로그 확률도 같이 오를 수 있다.'
  },
  {
    term: 'DPO',
    abbr: 'Direct Preference Optimization',
    body: '선호 쌍의 chosen 과 rejected 를 함께 보고 <strong>정책을 참조 모델보다 chosen 쪽으로 미는</strong> 학습. 보상 모델과 강화학습 없이, 정책과 참조 모델이 두 답에 준 로그 확률 넷으로 손실을 센다.'
  },
  {
    term: 'RLHF',
    abbr: 'Reinforcement Learning from Human Feedback',
    body: '선호 쌍으로 <strong>보상 모델을 먼저 배우고 그 점수로 정책을 강화학습하는</strong> 방법. InstructGPT 논문은 PPO 로 정책을 고쳤고, 보상 모델의 과최적화를 줄이려고 SFT 모델과의 KL 벌점을 더했다.'
  },
  {
    term: 'RLAIF',
    abbr: 'Reinforcement Learning from AI Feedback',
    body: '선호 쌍의 라벨을 <strong>사람 대신 LLM 판정자가 붙이는</strong> RLHF. 라벨을 얻은 뒤의 보상 모델 학습과 강화학습은 RLHF 와 같고, 판정자의 버릇은 라벨을 거쳐 보상 모델에 그대로 들어간다.'
  },
  {
    term: 'GRPO',
    abbr: 'Group Relative Policy Optimization',
    body: '같은 프롬프트로 답을 여럿 뽑아 <strong>묶음의 보상 평균을 기준으로 이점을 세는</strong> 강화학습. 묶음 평균이 대신하는 것은 PPO 의 가치 모델이고, 답마다의 보상은 여전히 보상 모델이 매긴다.'
  },
  {
    term: '보상 모델',
    abbr: 'Reward Model',
    body: '답 하나를 받아 <strong>점수 하나를 내는</strong> 모델. chosen 점수가 rejected 보다 높도록 Bradley-Terry 손실로 배우고, 차이만 배워 점수의 기준점은 정해지지 않는다.'
  },
  {
    term: '보상 해킹',
    abbr: 'Reward Hacking',
    body: '정책이 보상 모델의 버릇을 이용해 점수를 올리는 사이 <strong>정말 원하는 값은 떨어지는</strong> 일. RLHF, RLAIF, GRPO 와 보상 모델 편에서는 KL 을 약하게 걸수록 보상은 올랐지만, 통과율은 한 번 오른 뒤 0.000 이 되었다.'
  },
  {
    term: 'LoRA',
    abbr: 'Low-Rank Adaptation',
    body: '원래 행렬 W0 를 고정하고 <strong>작은 행렬 둘의 곱 BA 만 학습해 더하는</strong> 파인튜닝 방법. 4096 × 4096 행렬 하나에서 r 이 8 이면 학습할 가중치는 65,536개로, 행렬의 0.39% 이다.'
  },
  {
    term: '로짓 증류',
    abbr: 'Logit Distillation',
    body: '교사의 로짓을 온도 T 로 나눠 소프트맥스에 넣은 <strong>확률을 학생이 그대로 맞히는</strong> 증류. 온도를 올려도 가장 큰 라벨은 그대로이고, 그 밖의 라벨에 가는 몫이 커진다.'
  },
  {
    term: 'contrastive 학습',
    abbr: 'Contrastive Learning',
    body: '가까워야 할 쌍은 <strong>당기고 아닌 쌍은 밀어</strong> 벡터를 배우는 방법. 임베딩 모델 파인튜닝 편은 같은 묶음의 두 낱말을 양성 쌍으로 두고, 배치 안의 다른 쌍의 짝을 음성으로 썼다.'
  },
  {
    term: 'in-batch negatives',
    abbr: 'In-batch Negatives',
    body: '배치 안에서 <strong>다른 쌍의 짝을 음성으로 쓰는</strong> 방법. 점수표의 대각선 칸이 정답이고 나머지 칸이 음성이라, 음성은 저장하지 않고 학습할 때 배치 안에서 만든다.'
  },
  {
    term: 'recall@k',
    abbr: 'Recall at k',
    body: '정답 가운데 <strong>상위 k 개 안에 든 몫</strong>. 임베딩 모델 파인튜닝 편은 검증 쌍의 짝이 위 k 개에 든 비율로 세고, 재현율@10, Recall@500 과는 정답이 달라 비교하지 않는다.'
  }
];

// Render glossary accordion when the container is present
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('glossary-grid');
  if (!grid) return;

  grid.innerHTML = GLOSSARY.map(g => `
    <details class="glossary-item">
      <summary>
        <span>
          ${g.term}${g.abbr ? `<span class="glossary-term-abbrev">/ ${g.abbr}</span>` : ''}
        </span>
      </summary>
      <div class="glossary-body">${g.body}</div>
    </details>
  `).join('');
});
