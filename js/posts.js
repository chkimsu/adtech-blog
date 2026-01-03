// Blog Posts Data Structure
// All blog posts are stored here as JavaScript objects

const posts = [

  {
    id: 'my-markdown-post',
    title: 'pCVR 모델링 학습 시 주요 고려사항 및 중복 전환(Deduplication) 이슈 정리',
    excerpt: '이 글은 Markdown으로 작성되었습니다',
    date: '2026-01-10',
    categories: ['Tutorial'],
    tags: ['markdown', 'tutorial'],
    isMarkdown: true,  // ⭐ 중요: 이 플래그 추가!
    content: `## 1. pCVR 모델링이 pCTR과 다른 점 (Precautions)
pCTR 모델링 경험을 바탕으로 pCVR로 확장할 때 직면하는 주요 챌린지들을 정리함.

### ① 샘플 선택 편향 (Sample Selection Bias, SSB)
- **현상:** 모델은 '클릭된 데이터'만 학습하지만, 실제 서빙 시에는 '전체 노출' 컨텍스트에서 예측을 수행해야 함.
- **해결:** **ESMM(Entire Space Multi-Task Model)** 구조를 도입하여 $P(z=1|y=1, x)$가 아닌 전체 공간에서 $P(y=1, z=1|x)$를 학습하도록 유도하는 것이 정석임.

### ② 데이터 희소성 (Data Sparsity)
- **현상:** Click 대비 Conversion은 발생 빈도가 현저히 낮아 양성 샘플(Positive Sample) 확보가 어려움.
- **해결:** CTR 태스크와의 **Multi-task Learning**을 통해 로우 레벨 임베딩 층을 공유하거나, 사전 학습된 CTR 모델의 가중치를 Transfer 하는 방식이 유효함.

### ③ 지연된 피드백 (Delayed Feedback)
- **현상:** 클릭은 즉각적이나 전환은 며칠 뒤에도 발생함. 학습 시점에 미전환된 데이터를 단순 Negative로 처리하면 노이즈가 됨.
  - **해결:** 적절한 **Attribution Window** 설정이 필수이며, 윈도우 내 미전환 데이터를 처리하는 알고리즘적 보정 검토가 필요함.

  ### ④ Last Click Attribution의 한계 
  - 현재 실무에서 많이 쓰는 Last Click 방식은 구매 직전의 매체에만 기여도를 몰아주는 경향이 있음. 모델이 특정 시점의 광고만 과대평가하지 않도록 비즈니스 로직에 따른 라벨링 검증이 중요함.

  ---

  ## 2. 중복 전환 (Duplicated Conversion) 이슈와 대응
  데이터 파이프라인 및 모델의 신뢰도를 저해하는 '중복 전환' 문제를 심층 분석함.

  ### ① 중복 발생 원인
  - **기술적 요인:** 사용자 페이지 새로고침, 뒤로 가기 액션, 중복 설치된 트래킹 태그 등.
  - **비즈니스 요인:** 여러 광고 채널을 거쳐 들어온 유저에 대해 각 플랫폼이 독자적으로 전환을 집계할 때 발생.

  ### ② 모델에 미치는 영향
  - **라벨 노이즈:** 동일 액션이 중복 학습되어 특정 피처에 과도한 가중치가 부여됨.
  - **예측값 왜곡:** 실제 확률보다 pCVR이 높게 튀어 비딩 로직에서 오버비딩(Over-bidding) 유발 및 광고주 ROAS 저하.

  ### ③ 실무적 해결 방안 (Deduplication)
  - **Transaction ID (Order ID) 활용:** 결제 고유 번호를 Key로 잡아 파이프라인 상단에서 중복을 제거함 (가장 권장됨).
  - **Click ID 기반 1:1 매핑:** 클릭 시 부여한 고유 ID를 전환 시점에 매칭하여 유일성을 보장함.
  - **Time-window 기반 필터링:** 동일 유저가 단시간 내 동일 상품에 발생시킨 전환을 하나로 합침.

  ---

  ## 3. 개인적인 인사이트 (Summary)
  pCVR은 모델의 아키텍처 개선만큼이나 **'얼마나 깨끗하고 편향 없는 정답지(Label)를 구축하느냐'**라는 데이터 엔지니어링 측면의 완성도가 성능을 좌우함. 특히 중복 제거 로직은 모델 학습 전 단계인 데이터 전처리 파이프라인에서 완결성을 가져야 함.

  `
  },
  {
    id: 'intro-to-programmatic',
    title: 'Introduction to Programmatic Advertising',
    excerpt: 'Discover how programmatic advertising revolutionizes digital marketing through automated ad buying and real-time optimization.',
    date: '2026-01-01',
    categories: ['Programmatic', 'Basics'],
    tags: ['programmatic', 'automation', 'ad-buying', 'rtb'],
    content: `
      <h2>What is Programmatic Advertising?</h2>
      <p>Programmatic advertising is the automated buying and selling of online advertising space. Instead of traditional manual negotiations and insertion orders, programmatic uses algorithms and data to purchase ad inventory in real-time.</p>
      
      <h3>Key Components</h3>
      <ul>
        <li><strong>Demand-Side Platforms (DSP):</strong> Tools that allow advertisers to buy ad inventory from multiple sources</li>
        <li><strong>Supply-Side Platforms (SSP):</strong> Enable publishers to sell their ad inventory programmatically</li>
        <li><strong>Ad Exchanges:</strong> Digital marketplaces where DSPs and SSPs meet to trade inventory</li>
        <li><strong>Data Management Platforms (DMP):</strong> Collect and analyze audience data to improve targeting</li>
      </ul>
      
      <h3>How It Works</h3>
      <p>When a user visits a website, the following happens in milliseconds:</p>
      <ol>
        <li>The publisher's website sends an ad request to an SSP</li>
        <li>The SSP sends bid requests to multiple ad exchanges</li>
        <li>DSPs receive the bid request and evaluate it based on targeting criteria</li>
        <li>DSPs submit bids through the exchange</li>
        <li>The highest bidder wins and their ad is displayed</li>
        <li>The entire process happens in under 100 milliseconds</li>
      </ol>
      
      <h2>Benefits of Programmatic Advertising</h2>
      
      <h3>Efficiency and Scale</h3>
      <p>Programmatic advertising allows marketers to reach audiences across thousands of websites simultaneously, eliminating the need for individual negotiations with each publisher.</p>
      
      <h3>Precise Targeting</h3>
      <p>Leverage first-party, second-party, and third-party data to target specific audiences based on demographics, behaviors, interests, and intent signals.</p>
      
      <h3>Real-Time Optimization</h3>
      <p>Campaign performance can be monitored and adjusted in real-time, allowing for continuous improvement and better ROI.</p>
      
      <h3>Cost Effectiveness</h3>
      <p>By automating the buying process and using real-time bidding, advertisers can optimize their spending and reduce wasted impressions.</p>
      
      <h2>Types of Programmatic Buying</h2>
      
      <h3>Real-Time Bidding (RTB)</h3>
      <p>The most common form of programmatic advertising, where ad impressions are auctioned in real-time to the highest bidder.</p>
      
      <h3>Private Marketplace (PMP)</h3>
      <p>Invitation-only auctions where premium publishers offer their inventory to select advertisers at negotiated prices.</p>
      
      <h3>Preferred Deals</h3>
      <p>Direct deals between publishers and advertisers at a fixed price, without an auction.</p>
      
      <h3>Programmatic Guaranteed</h3>
      <p>Combines the automation of programmatic with the certainty of traditional direct deals, guaranteeing inventory at a fixed price.</p>
      
      <h2>Challenges and Considerations</h2>
      
      <blockquote>
        "The programmatic ecosystem is complex, and success requires understanding both the technology and the business dynamics at play."
      </blockquote>
      
      <h3>Ad Fraud</h3>
      <p>Invalid traffic, bot networks, and domain spoofing can waste advertising budgets. Implementing fraud detection and working with trusted partners is essential.</p>
      
      <h3>Brand Safety</h3>
      <p>Ensuring ads don't appear next to inappropriate content requires robust filtering and whitelist/blacklist management.</p>
      
      <h3>Data Privacy</h3>
      <p>Compliance with regulations like GDPR and CCPA is crucial. The industry is moving toward privacy-first solutions and alternative targeting methods.</p>
      
      <h2>The Future of Programmatic</h2>
      <p>As the digital advertising landscape evolves, programmatic advertising continues to adapt:</p>
      
      <ul>
        <li><strong>Connected TV (CTV):</strong> Programmatic is expanding beyond display and video on the web to streaming platforms</li>
        <li><strong>Digital Out-of-Home (DOOH):</strong> Billboards and public displays are becoming programmatically tradeable</li>
        <li><strong>AI and Machine Learning:</strong> Advanced algorithms are improving targeting, creative optimization, and fraud detection</li>
        <li><strong>Privacy-First Solutions:</strong> Cookieless targeting methods, contextual advertising, and first-party data strategies</li>
      </ul>
      
      <h2>Getting Started</h2>
      <p>For marketers new to programmatic advertising:</p>
      
      <ol>
        <li>Start with a clear understanding of your target audience</li>
        <li>Choose the right DSP for your needs and budget</li>
        <li>Begin with a small test budget to learn the platform</li>
        <li>Focus on quality over quantity - not all impressions are equal</li>
        <li>Monitor and optimize continuously</li>
        <li>Stay informed about industry developments and best practices</li>
      </ol>
      
      <p>Programmatic advertising represents the future of digital marketing, offering unprecedented scale, efficiency, and targeting capabilities. As the technology continues to evolve, staying informed and adaptable is key to success.</p>
    `
  },

  {
    id: 'rtb-explained',
    title: 'Real-Time Bidding (RTB): A Deep Dive',
    excerpt: 'Understand the technical architecture and auction mechanics that power real-time bidding in the ad tech ecosystem.',
    date: '2026-01-02',
    categories: ['RTB', 'Technical'],
    tags: ['rtb', 'auction', 'bidding', 'ad-exchange'],
    content: `
      <h2>Understanding Real-Time Bidding</h2>
      <p>Real-Time Bidding (RTB) is an auction-based system for buying and selling ad impressions in real-time. Each time a user loads a webpage or app, an auction takes place to determine which ad will be shown.</p>
      
      <h2>The RTB Auction Flow</h2>
      
      <h3>Step 1: User Visits a Page</h3>
      <p>When a user loads a webpage that has ad slots, the publisher's ad server recognizes the need to fill these positions.</p>
      
      <h3>Step 2: Bid Request Generation</h3>
      <p>The Supply-Side Platform (SSP) generates a bid request containing:</p>
      
      <pre><code>{
  "id": "impression-12345",
  "site": {
    "domain": "example.com",
    "page": "https://example.com/article"
  },
  "device": {
    "ua": "Mozilla/5.0...",
    "ip": "123.456.789.0",
    "devicetype": 2
  },
  "user": {
    "id": "user-abc123"
  },
  "imp": [{
    "id": "1",
    "banner": {
      "w": 300,
      "h": 250
    },
    "bidfloor": 0.50
  }]
}</code></pre>
      
      <h3>Step 3: Bid Request Distribution</h3>
      <p>The bid request is sent to multiple ad exchanges and DSPs simultaneously. This happens through server-to-server connections using OpenRTB protocol.</p>
      
      <h3>Step 4: Bid Evaluation</h3>
      <p>Each DSP evaluates the bid request based on:</p>
      
      <ul>
        <li><strong>Targeting Criteria:</strong> Does the impression match campaign requirements?</li>
        <li><strong>User Data:</strong> What do we know about this user from DMPs?</li>
        <li><strong>Historical Performance:</strong> How have similar impressions performed?</li>
        <li><strong>Budget Pacing:</strong> Do we have budget remaining for this campaign?</li>
        <li><strong>Frequency Capping:</strong> Have we shown this user too many ads already?</li>
      </ul>
      
      <h3>Step 5: Bid Submission</h3>
      <p>DSPs that want to compete submit a bid response:</p>
      
      <pre><code>{
  "id": "impression-12345",
  "seatbid": [{
    "bid": [{
      "id": "bid-xyz789",
      "impid": "1",
      "price": 2.50,
      "adid": "creative-456",
      "adm": "&lt;ad markup here&gt;",
      "crid": "creative-456"
    }]
  }],
  "cur": "USD"
}</code></pre>
      
      <h3>Step 6: Auction Resolution</h3>
      <p>The ad exchange runs an auction, typically using a second-price auction mechanism where:</p>
      
      <ul>
        <li>The highest bidder wins</li>
        <li>They pay the second-highest bid price plus $0.01</li>
        <li>This encourages truthful bidding</li>
      </ul>
      
      <h3>Step 7: Ad Delivery</h3>
      <p>The winning ad creative is delivered to the user's browser and displayed. This entire process happens in 100-200 milliseconds.</p>
      
      <h2>OpenRTB Protocol</h2>
      <p>OpenRTB is the industry standard protocol for RTB communication. It defines:</p>
      
      <ul>
        <li>Bid request and response formats</li>
        <li>Required and optional fields</li>
        <li>Enumerated values for standard fields</li>
        <li>Extension mechanisms for custom data</li>
      </ul>
      
      <h3>Current Version</h3>
      <p>OpenRTB 2.5 is widely adopted, while OpenRTB 3.0 introduces improvements like:</p>
      
      <ul>
        <li>Layered architecture separating transport from domain objects</li>
        <li>Support for emerging channels (audio, native, CTV)</li>
        <li>Enhanced privacy features</li>
      </ul>
      
      <h2>Auction Mechanics</h2>
      
      <h3>First-Price vs Second-Price Auctions</h3>
      <p>The industry has largely shifted from second-price to first-price auctions:</p>
      
      <h4>Second-Price Auction (Historic)</h4>
      <ul>
        <li>Winner pays second-highest bid + $0.01</li>
        <li>Encourages bidders to bid their true value</li>
        <li>Reduces need for bid shading</li>
      </ul>
      
      <h4>First-Price Auction (Current Standard)</h4>
      <ul>
        <li>Winner pays their actual bid</li>
        <li>Requires bid shading algorithms</li>
        <li>More transparent pricing</li>
        <li>Better for publishers' revenue</li>
      </ul>
      
      <h3>Bid Shading</h3>
      <p>In first-price auctions, DSPs use bid shading to avoid overpaying:</p>
      
      <pre><code>// Simplified bid shading logic
function calculateShadedBid(trueValue, historicalData) {
  const competitionLevel = analyzeCompetition(historicalData);
  const shadingFactor = calculateShadingFactor(competitionLevel);
  return trueValue * shadingFactor;
}</code></pre>
      
      <h2>Latency and Performance</h2>
      
      <h3>Time Budget Breakdown</h3>
      <p>A typical RTB auction must complete in ~100ms:</p>
      
      <ul>
        <li>Network latency (SSP to DSP): 10-20ms</li>
        <li>Bid request processing: 10-20ms</li>
        <li>Decision making: 20-40ms</li>
        <li>Bid response generation: 5-10ms</li>
        <li>Network latency (DSP to SSP): 10-20ms</li>
        <li>Auction resolution: 5-10ms</li>
        <li>Ad delivery: 10-20ms</li>
      </ul>
      
      <h3>Optimization Strategies</h3>
      <p>To meet these tight latency requirements:</p>
      
      <ul>
        <li><strong>Geographic Distribution:</strong> Deploy bidders close to exchanges</li>
        <li><strong>Connection Pooling:</strong> Maintain persistent HTTP/2 connections</li>
        <li><strong>Caching:</strong> Cache user data and campaign targeting rules</li>
        <li><strong>Parallel Processing:</strong> Evaluate multiple campaigns simultaneously</li>
        <li><strong>Early Termination:</strong> Stop processing if timeout is approaching</li>
      </ul>
      
      <h2>QPS and Scale</h2>
      
      <blockquote>
        "Major ad exchanges handle millions of bid requests per second, requiring sophisticated infrastructure and optimization."
      </blockquote>
      
      <h3>Handling High QPS</h3>
      <p>Large DSPs must handle hundreds of thousands of QPS:</p>
      
      <ul>
        <li>Distributed systems architecture</li>
        <li>Load balancing across data centers</li>
        <li>Efficient serialization (Protocol Buffers, Avro)</li>
        <li>In-memory data stores (Redis, Aerospike)</li>
        <li>Sampling and throttling mechanisms</li>
      </ul>
      
      <h2>Privacy and RTB</h2>
      
      <h3>Cookie Deprecation Impact</h3>
      <p>The phase-out of third-party cookies affects RTB by:</p>
      
      <ul>
        <li>Reducing the availability of user identifiers</li>
        <li>Limiting cross-site tracking capabilities</li>
        <li>Shifting focus to contextual signals</li>
        <li>Increasing importance of first-party data</li>
      </ul>
      
      <h3>Privacy-Safe Alternatives</h3>
      <ul>
        <li><strong>Unified ID 2.0:</strong> Email-based identity solution</li>
        <li><strong>Contextual Targeting:</strong> Bid based on page content, not user history</li>
        <li><strong>First-Party Data:</strong> Publisher-provided audience segments</li>
        <li><strong>Privacy Sandbox:</strong> Google's proposed APIs (Topics, FLEDGE)</li>
      </ul>
      
      <h2>Advanced RTB Concepts</h2>
      
      <h3>Header Bidding</h3>
      <p>Header bidding (or pre-bid) allows publishers to offer inventory to multiple ad exchanges before calling their ad server, increasing competition and revenue.</p>
      
      <h3>Server-to-Server (S2S) Bidding</h3>
      <p>Moving auction logic from client-side (browser) to server-side reduces latency and improves performance, though it may reduce bid participation.</p>
      
      <h3>Bid Caching</h3>
      <p>Some systems cache bids for similar impressions to reduce latency and computational costs.</p>
      
      <h2>Best Practices</h2>
      
      <ol>
        <li><strong>Optimize for Latency:</strong> Every millisecond counts in RTB</li>
        <li><strong>Monitor QPS:</strong> Sudden spikes can indicate issues or opportunities</li>
        <li><strong>Validate Traffic:</strong> Implement anti-fraud measures</li>
        <li><strong>Test Thoroughly:</strong> Use staging environments to test bid logic</li>
        <li><strong>Log Everything:</strong> Detailed logs are crucial for debugging and optimization</li>
        <li><strong>Stay Updated:</strong> RTB protocols and standards evolve continuously</li>
      </ol>
      
      <p>Real-Time Bidding is the backbone of modern programmatic advertising, enabling efficient, data-driven ad transactions at massive scale. Understanding its technical intricacies is essential for anyone working in ad tech.</p>
    `
  },

  {
    id: 'ad-analytics',
    title: 'Ad Analytics & Attribution: Measuring Success',
    excerpt: 'Learn how to measure, track, and optimize advertising campaigns using modern analytics and attribution models.',
    date: '2026-01-03',
    categories: ['Analytics', 'Attribution'],
    tags: ['analytics', 'attribution', 'metrics', 'measurement', 'roi'],
    content: `
      <h2>The Importance of Ad Analytics</h2>
      <p>In digital advertising, you can't optimize what you don't measure. Ad analytics provides the insights needed to understand campaign performance, user behavior, and return on investment (ROI).</p>
      
      <h2>Key Metrics and KPIs</h2>
      
      <h3>Impression Metrics</h3>
      <ul>
        <li><strong>Impressions:</strong> Number of times an ad is displayed</li>
        <li><strong>Viewable Impressions:</strong> Impressions that meet viewability standards (50% of pixels visible for 1+ seconds)</li>
        <li><strong>CPM (Cost Per Mille):</strong> Cost per 1,000 impressions</li>
        <li><strong>Viewability Rate:</strong> Percentage of impressions that are viewable</li>
      </ul>
      
      <h3>Engagement Metrics</h3>
      <ul>
        <li><strong>Clicks:</strong> Number of times users click on an ad</li>
        <li><strong>CTR (Click-Through Rate):</strong> Clicks divided by impressions</li>
        <li><strong>CPC (Cost Per Click):</strong> Total spend divided by clicks</li>
        <li><strong>Video Completion Rate:</strong> Percentage of video ads watched to completion</li>
        <li><strong>Time Spent:</strong> Average time users engage with rich media ads</li>
      </ul>
      
      <h3>Conversion Metrics</h3>
      <ul>
        <li><strong>Conversions:</strong> Number of desired actions completed (purchase, signup, etc.)</li>
        <li><strong>Conversion Rate:</strong> Conversions divided by clicks</li>
        <li><strong>CPA (Cost Per Acquisition):</strong> Total spend divided by conversions</li>
        <li><strong>ROAS (Return on Ad Spend):</strong> Revenue divided by ad spend</li>
        <li><strong>LTV (Lifetime Value):</strong> Total value a customer brings over their lifetime</li>
      </ul>
      
      <h2>Attribution Models</h2>
      <p>Attribution determines which touchpoints get credit for a conversion. Different models distribute credit differently.</p>
      
      <h3>Single-Touch Attribution</h3>
      
      <h4>Last-Click Attribution</h4>
      <p>Gives 100% credit to the last touchpoint before conversion.</p>
      
      <pre><code>User Journey: Display Ad → Social Ad → Search Ad → Conversion
Credit:       0%           0%          100%</code></pre>
      
      <p><strong>Pros:</strong> Simple to implement and understand<br>
      <strong>Cons:</strong> Ignores upper-funnel touchpoints</p>
      
      <h4>First-Click Attribution</h4>
      <p>Gives 100% credit to the first touchpoint.</p>
      
      <pre><code>User Journey: Display Ad → Social Ad → Search Ad → Conversion
Credit:       100%         0%          0%</code></pre>
      
      <p><strong>Pros:</strong> Values awareness and discovery<br>
      <strong>Cons:</strong> Ignores nurturing touchpoints</p>
      
      <h3>Multi-Touch Attribution</h3>
      
      <h4>Linear Attribution</h4>
      <p>Distributes credit equally across all touchpoints.</p>
      
      <pre><code>User Journey: Display Ad → Social Ad → Search Ad → Conversion
Credit:       33.3%        33.3%       33.3%</code></pre>
      
      <h4>Time-Decay Attribution</h4>
      <p>Gives more credit to touchpoints closer to conversion.</p>
      
      <pre><code>User Journey: Display Ad → Social Ad → Search Ad → Conversion
Credit:       10%          30%         60%</code></pre>
      
      <h4>Position-Based Attribution</h4>
      <p>Gives 40% to first and last touchpoints, 20% to middle touchpoints.</p>
      
      <pre><code>User Journey: Display Ad → Social Ad → Search Ad → Conversion
Credit:       40%          20%         40%</code></pre>
      
      <h4>Data-Driven Attribution</h4>
      <p>Uses machine learning to assign credit based on actual impact. This is the most sophisticated approach:</p>
      
      <ul>
        <li>Analyzes thousands of conversion paths</li>
        <li>Identifies patterns in successful conversions</li>
        <li>Assigns credit based on incremental contribution</li>
        <li>Continuously learns and adapts</li>
      </ul>
      
      <h2>Tracking Implementation</h2>
      
      <h3>Pixel-Based Tracking</h3>
      <p>The traditional method uses tracking pixels on websites:</p>
      
      <pre><code>&lt;!-- Conversion Pixel Example --&gt;
&lt;img src="https://tracker.example.com/pixel?
  event=purchase&
  value=99.99&
  currency=USD&
  order_id=12345&
  user_id=abc123" 
  width="1" height="1" style="display:none" /&gt;</code></pre>
      
      <h3>JavaScript Tags</h3>
      <p>More flexible tracking using JavaScript:</p>
      
      <pre><code>&lt;script&gt;
(function() {
  window.adTracker = window.adTracker || [];
  adTracker.push({
    event: 'conversion',
    type: 'purchase',
    value: 99.99,
    currency: 'USD',
    orderId: '12345',
    items: [
      { id: 'SKU1', name: 'Product 1', price: 49.99, quantity: 1 },
      { id: 'SKU2', name: 'Product 2', price: 50.00, quantity: 1 }
    ]
  });
})();
&lt;/script&gt;</code></pre>
      
      <h3>Server-Side Tracking</h3>
      <p>Increasingly important for privacy and accuracy:</p>
      
      <pre><code>// Server-side conversion reporting
const reportConversion = async (conversionData) => {
  const response = await fetch('https://api.adplatform.com/conversions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      click_id: conversionData.clickId,
      conversion_time: new Date().toISOString(),
      conversion_value: conversionData.value,
      currency: 'USD',
      conversion_type: 'purchase'
    })
  });
  return response.json();
};</code></pre>
      
      <h2>Cross-Device Tracking</h2>
      <p>Users often interact with ads on multiple devices before converting. Cross-device tracking attempts to link these touchpoints:</p>
      
      <h3>Deterministic Matching</h3>
      <ul>
        <li>Based on authenticated user data (login)</li>
        <li>High accuracy but limited coverage</li>
        <li>Requires user authentication across devices</li>
      </ul>
      
      <h3>Probabilistic Matching</h3>
      <ul>
        <li>Uses signals like IP address, user agent, browsing patterns</li>
        <li>Broader coverage but lower accuracy</li>
        <li>Privacy concerns with increasing regulations</li>
      </ul>
      
      <h2>Incrementality Testing</h2>
      <p>Measures the true incremental impact of advertising by comparing exposed vs. control groups.</p>
      
      <h3>Ghost Bid Approach</h3>
      <pre><code>// Simplified ghost bid logic
function shouldServeAd(userId, campaignId) {
  const hash = hashFunction(userId + campaignId);
  const testGroup = hash % 100;
  
  // 90% test group (see ads), 10% control group (no ads)
  if (testGroup < 90) {
    return { serve: true, group: 'test' };
  } else {
    return { serve: false, group: 'control' };
  }
}</code></pre>
      
      <h3>Analysis</h3>
      <p>Compare conversion rates between groups:</p>
      
      <pre><code>Incrementality = (Test Conversion Rate - Control Conversion Rate) / Control Conversion Rate
True Incremental Conversions = Total Conversions × Incrementality Percentage</code></pre>
      
      <h2>Privacy-First Analytics</h2>
      
      <h3>Challenges Post-Cookie Era</h3>
      <ul>
        <li>Reduced ability to track users across sites</li>
        <li>Attribution windows becoming shorter</li>
        <li>Less granular audience data</li>
        <li>Difficulty with cross-device measurement</li>
      </ul>
      
      <h3>Solutions</h3>
      <ul>
        <li><strong>First-Party Data:</strong> Build direct relationships with customers</li>
        <li><strong>Conversion APIs:</strong> Server-side event tracking (e.g., Meta CAPI)</li>
        <li><strong>Privacy-Safe IDs:</strong> Email-based unified IDs with user consent</li>
        <li><strong>Aggregated Reporting:</strong> Privacy-preserving aggregate measurements</li>
        <li><strong>Modeling:</strong> Use statistical modeling to fill gaps in tracking</li>
      </ul>
      
      <h2>Analytics Platforms and Tools</h2>
      
      <h3>Web Analytics</h3>
      <ul>
        <li>Google Analytics 4 (GA4)</li>
        <li>Adobe Analytics</li>
        <li>Mixpanel</li>
        <li>Amplitude</li>
      </ul>
      
      <h3>Ad Platform Analytics</h3>
      <ul>
        <li>Google Ads reporting</li>
        <li>Meta Ads Manager</li>
        <li>Amazon Advertising Console</li>
        <li>The Trade Desk reporting</li>
      </ul>
      
      <h3>Attribution Platforms</h3>
      <ul>
        <li>AppsFlyer</li>
        <li>Adjust</li>
        <li>Branch</li>
        <li>Google Attribution</li>
      </ul>
      
      <h2>Data Visualization and Reporting</h2>
      
      <h3>Essential Dashboards</h3>
      <p>Create dashboards that answer key questions:</p>
      
      <ol>
        <li><strong>Performance Overview:</strong> High-level KPIs and trends</li>
        <li><strong>Channel Comparison:</strong> Performance across channels</li>
        <li><strong>Campaign Deep-Dive:</strong> Detailed metrics by campaign</li>
        <li><strong>Audience Analysis:</strong> Performance by audience segment</li>
        <li><strong>Creative Performance:</strong> Which ads drive results</li>
        <li><strong>Attribution Analysis:</strong> Understanding the customer journey</li>
      </ol>
      
      <h3>Automated Reporting</h3>
      <pre><code>// Example: Daily performance report generation
const generateDailyReport = async () => {
  const data = await fetchCampaignMetrics({
    startDate: 'yesterday',
    endDate: 'yesterday',
    metrics: ['impressions', 'clicks', 'conversions', 'spend', 'revenue']
  });
  
  const report = {
    date: new Date().toISOString().split('T')[0],
    summary: {
      spend: data.spend,
      revenue: data.revenue,
      roas: data.revenue / data.spend,
      conversions: data.conversions,
      cpa: data.spend / data.conversions
    },
    campaigns: data.campaigns.map(c => ({
      name: c.name,
      performance: calculatePerformance(c),
      alerts: identifyAlerts(c)
    }))
  };
  
  await sendReport(report);
};</code></pre>
      
      <h2>Best Practices</h2>
      
      <blockquote>
        "In God we trust. All others must bring data." - W. Edwards Deming
      </blockquote>
      
      <ol>
        <li><strong>Define Clear Goals:</strong> Know what success looks like before launching</li>
        <li><strong>Choose Appropriate Metrics:</strong> Vanity metrics vs. actionable metrics</li>
        <li><strong>Implement Proper Tracking:</strong> Test and verify all tracking codes</li>
        <li><strong>Use Multiple Attribution Models:</strong> Understand different perspectives</li>
        <li><strong>Monitor Data Quality:</strong> Watch for tracking issues and anomalies</li>
        <li><strong>Regular Reporting:</strong> Consistent cadence for reviewing performance</li>
        <li><strong>Act on Insights:</strong> Analytics is useless without action</li>
        <li><strong>Continuous Testing:</strong> Always be testing and learning</li>
      </ol>
      
      <h2>Conclusion</h2>
      <p>Effective ad analytics and attribution are critical for optimizing advertising performance and proving ROI. As privacy regulations evolve and tracking becomes more challenging, focusing on first-party data, server-side tracking, and privacy-safe measurement solutions will be key to success.</p>
    `
  },

  {
    id: 'privacy-compliance',
    title: 'Privacy & Compliance in Ad Tech',
    excerpt: 'Navigate the complex landscape of privacy regulations including GDPR, CCPA, and the transition to a cookieless future.',
    date: '2026-01-03',
    categories: ['Privacy', 'Compliance'],
    tags: ['privacy', 'gdpr', 'ccpa', 'compliance', 'cookies'],
    content: `
      <h2>The Privacy Landscape</h2>
      <p>Privacy regulations have fundamentally changed how ad tech operates. Understanding and complying with these regulations is not just a legal requirement—it's essential for maintaining user trust and business continuity.</p>
      
      <h2>Major Privacy Regulations</h2>
      
      <h3>GDPR (General Data Protection Regulation)</h3>
      <p>Effective: May 25, 2018 | Jurisdiction: European Union</p>
      
      <h4>Key Principles</h4>
      <ul>
        <li><strong>Lawfulness, Fairness, and Transparency:</strong> Data processing must be legal, fair, and transparent</li>
        <li><strong>Purpose Limitation:</strong> Data collected for specified, explicit purposes</li>
        <li><strong>Data Minimization:</strong> Only collect necessary data</li>
        <li><strong>Accuracy:</strong> Keep personal data accurate and up to date</li>
        <li><strong>Storage Limitation:</strong> Don't keep data longer than necessary</li>
        <li><strong>Integrity and Confidentiality:</strong> Ensure appropriate security</li>
        <li><strong>Accountability:</strong> Demonstrate compliance</li>
      </ul>
      
      <h4>Legal Bases for Processing</h4>
      <ol>
        <li><strong>Consent:</strong> User explicitly agrees to data processing</li>
        <li><strong>Contract:</strong> Processing necessary to fulfill a contract</li>
        <li><strong>Legal Obligation:</strong> Required by law</li>
        <li><strong>Vital Interests:</strong> Necessary to protect someone's life</li>
        <li><strong>Public Task:</strong> Performing official functions</li>
        <li><strong>Legitimate Interest:</strong> Necessary for legitimate interests (with balancing test)</li>
      </ol>
      
      <h4>User Rights</h4>
      <ul>
        <li>Right to access</li>
        <li>Right to rectification</li>
        <li>Right to erasure ("right to be forgotten")</li>
        <li>Right to restrict processing</li>
        <li>Right to data portability</li>
        <li>Right to object</li>
        <li>Rights related to automated decision-making</li>
      </ul>
      
      <h4>Penalties</h4>
      <p>Up to €20 million or 4% of global annual revenue, whichever is higher.</p>
      
      <h3>CCPA/CPRA (California Consumer Privacy Act)</h3>
      <p>CCPA Effective: January 1, 2020<br>
      CPRA Effective: January 1, 2023<br>
      Jurisdiction: California, USA</p>
      
      <h4>Consumer Rights</h4>
      <ul>
        <li><strong>Right to Know:</strong> What personal information is collected</li>
        <li><strong>Right to Delete:</strong> Request deletion of personal information</li>
        <li><strong>Right to Opt-Out:</strong> Opt-out of sale of personal information</li>
        <li><strong>Right to Non-Discrimination:</strong> Equal service regardless of privacy choices</li>
        <li><strong>Right to Correct:</strong> Correct inaccurate information (CPRA)</li>
        <li><strong>Right to Limit:</strong> Limit use of sensitive personal information (CPRA)</li>
      </ul>
      
      <h4>Penalties</h4>
      <p>Up to $7,500 per intentional violation, $2,500 per unintentional violation.</p>
      
      <h3>Other Important Regulations</h3>
      <ul>
        <li><strong>ePrivacy Directive:</strong> EU cookie law</li>
        <li><strong>LGPD:</strong> Brazil's data protection law</li>
        <li><strong>PIPEDA:</strong> Canada's privacy law</li>
        <li><strong>PDPA:</strong> Singapore's data protection act</li>
        <li><strong>State Laws:</strong> Virginia CDPA, Colorado CPA, Connecticut CTDPA, Utah UCPA</li>
      </ul>
      
      <h2>Consent Management</h2>
      
      <h3>IAB's Transparency & Consent Framework (TCF)</h3>
      <p>Industry standard for obtaining and communicating user consent in a GDPR-compliant manner.</p>
      
      <h4>Key Components</h4>
      <ul>
        <li><strong>Consent Management Platforms (CMPs):</strong> Collect and store user consent</li>
        <li><strong>TC String:</strong> Encoded consent information passed to ad tech vendors</li>
        <li><strong>Global Vendor List (GVL):</strong> List of registered ad tech vendors</li>
        <li><strong>Purpose Definitions:</strong> Standardized categories of data processing</li>
      </ul>
      
      <h4>TCF Purposes</h4>
      <ol>
        <li>Store and/or access information on a device</li>
        <li>Select basic ads</li>
        <li>Create a personalized ads profile</li>
        <li>Select personalized ads</li>
        <li>Create a personalized content profile</li>
        <li>Select personalized content</li>
        <li>Measure ad performance</li>
        <li>Measure content performance</li>
        <li>Apply market research to generate audience insights</li>
        <li>Develop and improve products</li>
      </ol>
      
      <h3>Implementing a CMP</h3>
      <pre><code>&lt;!-- Example CMP Implementation --&gt;
&lt;script&gt;
window.__tcfapi = window.__tcfapi || function() {
  (window.__tcfapi.a = window.__tcfapi.a || []).push(arguments);
};

// Check consent status
__tcfapi('addEventListener', 2, function(tcData, success) {
  if (success && tcData.eventStatus === 'useractioncomplete') {
    if (tcData.purpose.consents[1]) {
      // User consented to "Store and/or access information"
      initializeAdvertising();
    } else {
      // User did not consent
      showNonPersonalizedAds();
    }
  }
});
&lt;/script&gt;</code></pre>
      
      <h3>USP/CCPA Compliance String</h3>
      <pre><code>// IAB's US Privacy String for CCPA
// Example: "1YNN" means:
// 1 = Version
// Y = Notice given
// N = User opted out: No
// N = LSPA covered: No

__uspapi('getUSPData', 1, function(uspData, success) {
  if (success) {
    const optedOut = uspData.uspString[2] === 'Y';
    if (optedOut) {
      // User opted out of sale
      disablePersonalizedAds();
    }
  }
});</code></pre>
      
      <h2>The Cookieless Future</h2>
      
      <h3>Third-Party Cookie Deprecation</h3>
      <p>Timeline of major browser changes:</p>
      
      <ul>
        <li><strong>Safari (ITP):</strong> Started blocking third-party cookies in 2017</li>
        <li><strong>Firefox:</strong> Enhanced Tracking Protection since 2019</li>
        <li><strong>Chrome:</strong> Plans to phase out third-party cookies (ongoing)</li>
      </ul>
      
      <h3>Impact on Ad Tech</h3>
      <ul>
        <li>Reduced ability to track users across sites</li>
        <li>Limited frequency capping across publishers</li>
        <li>Challenges with attribution</li>
        <li>Decreased effectiveness of retargeting</li>
        <li>Need for new identity solutions</li>
      </ul>
      
      <h2>Privacy-Preserving Alternatives</h2>
      
      <h3>First-Party Data Strategies</h3>
      <p>Collecting data directly from your own properties:</p>
      
      <ul>
        <li>User registrations and logins</li>
        <li>Email subscriptions</li>
        <li>Purchase history</li>
        <li>Website behavior (on your domain)</li>
        <li>CRM data</li>
      </ul>
      
      <pre><code>// First-party data collection example
const collectUserData = (userId, event) => {
  // Data stays within your domain
  fetch('/api/analytics', {
    method: 'POST',
    credentials: 'include', // Include first-party cookies
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: userId,
      event: event.type,
      timestamp: new Date().toISOString(),
      properties: event.properties
    })
  });
};</code></pre>
      
      <h3>Unified ID Solutions</h3>
      
      <h4>Unified ID 2.0</h4>
      <ul>
        <li>Email-based identity framework</li>
        <li>User-consented and transparent</li>
        <li>Encrypted and pseudonymized</li>
        <li>User controls and opt-out capability</li>
      </ul>
      
      <h4>ID5</h4>
      <ul>
        <li>Deterministic and probabilistic matching</li>
        <li>Privacy-by-design approach</li>
        <li>Built for post-cookie ecosystem</li>
      </ul>
      
      <h3>Google's Privacy Sandbox</h3>
      
      <h4>Topics API</h4>
      <p>Browser-based interest targeting without cross-site tracking:</p>
      
      <pre><code>// Topics API example
document.browsingTopics().then(topics => {
  // Returns user's top interests (e.g., "Fitness", "Travel")
  // Based on browsing history, calculated locally in browser
  console.log('User interests:', topics);
});</code></pre>
      
      <h4>Protected Audience API (formerly FLEDGE)</h4>
      <p>Retargeting without cross-site tracking:</p>
      
      <ul>
        <li>Browsers store interest groups locally</li>
        <li>On-device ad auctions</li>
        <li>No individual user data leaves the device</li>
      </ul>
      
      <h4>Attribution Reporting API</h4>
      <p>Privacy-preserving conversion measurement:</p>
      
      <ul>
        <li>Event-level reports (with noise added)</li>
        <li>Aggregate reports (anonymized groups)</li>
        <li>No individual user tracking</li>
      </ul>
      
      <h3>Contextual Targeting</h3>
      <p>Target based on page content, not user behavior:</p>
      
      <pre><code>// Contextual analysis example
const analyzePageContext = (pageContent) => {
  return {
    topics: extractTopics(pageContent),
    sentiment: analyzeSentiment(pageContent),
    entities: extractEntities(pageContent),
    categories: classifyContent(pageContent),
    brandSafety: checkBrandSafety(pageContent)
  };
};

const selectAd = (context) => {
  // Choose ad based on page context, not user history
  return findRelevantAd({
    topics: context.topics,
    categories: context.categories,
    brandSafe: context.brandSafety.safe
  });
};</code></pre>
      
      <h2>Technical Implementation</h2>
      
      <h3>Privacy-Compliant Tracking</h3>
      
      <h4>Consent Before Tracking</h4>
      <pre><code>// Wait for consent before initializing trackers
const initializeTracking = () => {
  checkConsent().then(consents => {
    if (consents.analytics) {
      initializeAnalytics();
    }
    if (consents.advertising) {
      initializeAdvertising();
    }
    if (consents.personalization) {
      initializePersonalization();
    }
  });
};</code></pre>
      
      <h4>Data Minimization</h4>
      <pre><code>// Only collect necessary data
const trackEvent = (eventName, properties) => {
  const minimizedData = {
    event: eventName,
    // Don't include PII
    timestamp: Math.floor(Date.now() / 1000), // Second precision, not millisecond
    // Aggregate location data
    region: getRegion(), // e.g., "California", not exact coordinates
    // No individual identifiers in analytics
    sessionId: getAnonymousSessionId()
  };
  
  sendToAnalytics(minimizedData);
};</code></pre>
      
      <h4>Data Retention Policies</h4>
      <pre><code>// Automated data deletion
const enforceRetentionPolicy = async () => {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - 13); // 13-month retention
  
  await database.deleteWhere({
    table: 'user_events',
    condition: { timestamp: { lt: cutoffDate } }
  });
  
  console.log('Deleted data older than', cutoffDate);
};</code></pre>
      
      <h3>Privacy-Safe Data Sharing</h3>
      
      <h4>Differential Privacy</h4>
      <p>Add noise to aggregate data to protect individuals:</p>
      
      <pre><code>// Simplified differential privacy example
const addLaplaceNoise = (value, sensitivity, epsilon) => {
  const scale = sensitivity / epsilon;
  const u = Math.random() - 0.5;
  const noise = -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
  return value + noise;
};

const getAggregateMetric = (data) => {
  const trueValue = calculateMetric(data);
  // Add noise to protect individual privacy
  const noisyValue = addLaplaceNoise(trueValue, 1, 0.1);
  return Math.round(noisyValue);
};</code></pre>
      
      <h2>Compliance Checklist</h2>
      
      <h3>For Advertisers</h3>
      - [ ] Implement consent management (CMP)
      - [ ] Maintain consent records
      - [ ] Honor opt-out requests
      - [ ] Provide clear privacy policy
      - [ ] Enable user data access and deletion
      - [ ] Conduct regular privacy audits
      - [ ] Train staff on privacy requirements
      - [ ] Implement data protection by design
      - [ ] Establish data processing agreements with vendors
      - [ ] Monitor third-party compliance
      
      <h3>For Publishers</h3>
      - [ ] Deploy TCF-compliant CMP
      - [ ] Only load vendors with consent
      - [ ] Provide clear cookie policy
      - [ ] Implement server-side privacy controls
      - [ ] Regular vendor list audits
      - [ ] Secure data transmission
      - [ ] Maintain audit logs
      - [ ] Establish DPA with ad tech partners
      
      <h3>For Ad Tech Platforms</h3>
      - [ ] Register with IAB (TCF, GPP)
      - [ ] Implement consent signal processing
      - [ ] Respect privacy strings (TC String, US Privacy String)
      - [ ] Provide user opt-out mechanisms
      - [ ] Implement data retention policies
      - [ ] Enable GDPR/CCPA data subject requests
      - [ ] Security measures (encryption, access controls)
      - [ ] Privacy impact assessments
      - [ ] Incident response procedures
      
      <h2>Best Practices</h2>
      
      <blockquote>
        "Privacy is not an option, and it shouldn't be the price we accept for just getting on the Internet." - Gary Kovacs
      </blockquote>
      
      <ol>
        <li><strong>Privacy by Design:</strong> Build privacy into systems from the start</li>
        <li><strong>Transparency:</strong> Be clear about data collection and use</li>
        <li><strong>User Control:</strong> Give users meaningful choices</li>
        <li><strong>Data Minimization:</strong> Only collect what you need</li>
        <li><strong>Security:</strong> Protect data with appropriate safeguards</li>
        <li><strong>Accountability:</strong> Document compliance efforts</li>
        <li><strong>Stay Updated:</strong> Privacy laws are constantly evolving</li>
        <li><strong>Legal Counsel:</strong> Work with privacy attorneys</li>
      </ol>
      
      <h2>The Future of Privacy in Ad Tech</h2>
      
      <p>The ad tech industry is moving toward a privacy-first future:</p>
      
      <ul>
        <li><strong>Regulation Expansion:</strong> More countries and states adopting privacy laws</li>
        <li><strong>Technology Evolution:</strong> Privacy-enhancing technologies (PETs) becoming standard</li>
        <li><strong>Consumer Expectations:</strong> Users demanding more control over their data</li>
        <li><strong>Industry Adaptation:</strong> Shift from individual tracking to aggregate measurement</li>
        <li><strong>Innovation:</strong> New solutions that balance privacy and effectiveness</li>
      </ul>
      
      <p>Success in this new landscape requires embracing privacy not as a constraint, but as a foundation for building sustainable, trustworthy advertising ecosystems.</p>
    `
  }
];

// Helper function to get a post by ID
function getPostById(id) {
  return posts.find(post => post.id === id);
}

// Helper function to filter posts
function filterPosts(searchTerm = '', selectedCategory = '', selectedTag = '') {
  return posts.filter(post => {
    const matchesSearch = !searchTerm ||
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !selectedCategory ||
      post.categories.includes(selectedCategory);

    const matchesTag = !selectedTag ||
      post.tags.includes(selectedTag);

    return matchesSearch && matchesCategory && matchesTag;
  });
}

// Get all unique categories
function getAllCategories() {
  const categories = new Set();
  posts.forEach(post => {
    post.categories.forEach(cat => categories.add(cat));
  });
  return Array.from(categories).sort();
}

// Get all unique tags
function getAllTags() {
  const tags = new Set();
  posts.forEach(post => {
    post.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
}

// Calculate reading time based on content
function calculateReadTime(content) {
  // Remove HTML tags for accurate counting
  const plainText = content.replace(/<[^>]*>/g, '');

  // Count Korean characters (한글)
  const koreanChars = (plainText.match(/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g) || []).length;

  // Count English words (approximate)
  const englishWords = plainText.split(/\s+/).filter(word =>
    word.match(/[a-zA-Z]/)
  ).length;

  // Average reading speed:
  // Korean: 500 characters per minute
  // English: 200 words per minute
  const koreanMinutes = koreanChars / 500;
  const englishMinutes = englishWords / 200;

  const totalMinutes = Math.ceil(koreanMinutes + englishMinutes);

  return totalMinutes < 1 ? '1 min read' : `${totalMinutes} min read`;
}

// Auto-calculate readTime for all posts
posts.forEach(post => {
  if (!post.readTime) {
    post.readTime = calculateReadTime(post.content);
  }
});
