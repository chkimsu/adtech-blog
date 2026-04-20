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
    abbr: '비용 과금 단위',
    body: '<strong>CPM</strong>(Cost Per Mille) = 1,000회 노출당 비용, <strong>CPC</strong>(Cost Per Click) = 클릭당, <strong>CPA</strong>(Cost Per Action) = 전환당. 광고주가 원하는 KPI에 따라 선택. 퍼포먼스 마케팅은 CPA 중심, 브랜딩은 CPM 중심.'
  },
  {
    term: 'CTR / CVR',
    abbr: 'Click / Conversion Rate',
    body: '<strong>CTR</strong> = 클릭 ÷ 노출, <strong>CVR</strong> = 전환 ÷ 클릭. 광고 성과의 두 핵심 깔때기. 디스플레이 CTR은 0.1~1% 수준, 검색광고는 3~20% 수준.'
  },
  {
    term: 'pCTR / pCVR',
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
