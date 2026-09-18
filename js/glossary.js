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
    body: '"1,000회 노출 시 기대 수익"으로 환산한 지표. CPM·CPC·CPA 광고를 한 줄에 비교하는 공통 통화. <strong>eCPM<sub>CPC</sub> = CPC × 예상 CTR × 1,000</strong>. 여기서 예상 CTR이 곧 pCTR 모델의 출력.'
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
    body: '<strong>예측 클릭률·전환율</strong>. 머신러닝 모델이 출력하는 확률값으로, 입찰가 계산의 입력이 된다. 정확도와 Calibration(보정)이 직접적으로 수익과 직결된다.'
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
    body: 'UCB1을 <strong>Context Vector(유저 특성·시간대 등)</strong>로 확장. 개별 광고 ID가 아닌 피처 가중치를 학습해, 처음 보는 유저·광고에도 일반화 가능. Disjoint LinUCB가 가장 단순한 형태.'
  },
  {
    term: 'Regret',
    abbr: '후회값',
    body: '"매 라운드 최적 광고를 알았더라면 얻었을 수익" − "실제 얻은 수익"의 누적. 좋은 밴딧 알고리즘은 Regret이 <strong>O(log t) 또는 O(√t)</strong>로 증가 — 시간이 갈수록 최적에 점근.'
  },
  {
    term: 'Calibration',
    abbr: '확률 보정',
    body: 'pCTR 모델이 "1%"라고 출력한 광고들의 실제 CTR도 1%가 되어야 한다. AUC는 순서만 보지만 입찰가는 절대값을 쓰므로 <strong>Platt Scaling·Isotonic Regression</strong> 같은 보정이 필수.'
  },
  {
    term: 'Attribution',
    abbr: '어트리뷰션',
    body: '전환(구매·설치)이 어느 광고 접점 덕분인지 공로를 배분. <strong>Last-click</strong>(단순·편향), <strong>MTA</strong>(Multi-Touch), <strong>MMM</strong>(시계열 회귀), iOS ATT 시대의 <strong>SKAdNetwork</strong>가 공존.'
  },
  {
    term: 'Walled Garden',
    abbr: '폐쇄형 생태계',
    body: '네이버·카카오·Meta·Google처럼 <strong>DSP부터 매체까지 한 회사가 다 소유</strong>한 구조. Open RTB의 외부 DSP는 들어올 수 없고, 내부에서만 경매·측정이 완결된다. 데이터 독점 vs 효율의 트레이드오프.'
  },

  // 2026-09-18 추가 — 글에서 세 번 이상 나오면서 한 번도 안 풀리던 용어들
  {
    term: 'Sample Selection Bias',
    abbr: '배운 자리와 쓰는 자리가 다른 편향',
    body: '모델이 <strong>클릭한 노출에서만 배우고</strong> 노출 전체에 쓰이는 어긋남. 배운 칸과 쓰는 칸이 달라서, 노출은 많고 클릭은 적은 자리에서 크게 틀린다. ESMM 이 노출 전체에서 배우게 해 이 문제를 피한다.',
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
    body: '누를 광고를 안 누를 광고보다 <strong>높은 점수로 세우는</strong> 능력. AUC 가 재는 것이 이것이다. 확률의 크기가 맞는지는 따로 재야 하고, 그것이 Calibration 이다.'
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
    body: '그래프에서 아는 사람의 라벨을 <strong>연결된 이웃으로 번지게</strong> 하는 방식. 씨앗과 직접 닿지 않은 사람까지 닮음이 전해진다.'
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
    body: '채울 광고가 없어 <strong>아무것도 안 뜬</strong> 경우. 노출 로그에는 안 남으므로 요청 로그가 유일한 단서다. Fill Rate 를 재는 분모가 여기서 나온다.'
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
    abbr: 'SQL 을 받아 주는 문',
    body: '지훈 씨가 붙는 <strong>접속 창구</strong>. SQL 을 받아 계획을 세우고 실행 엔진에 넘긴다. 세는 일은 Tez 나 Spark 가 한다.'
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
          ${g.term}${g.abbr ? `<span class="glossary-term-abbrev">· ${g.abbr}</span>` : ''}
        </span>
      </summary>
      <div class="glossary-body">${g.body}</div>
    </details>
  `).join('');
});
