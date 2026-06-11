/**
 * demo-edu-content.js — 데모별 교육 콘텐츠 (중앙 선언)
 *
 * demo-edu.js 엔진이 location.pathname에서 키(demo-<key>.html)를 뽑아 이 객체를 조회한다.
 * demos.html 카드의 비유 한 줄(analogy)도 이 파일을 단일 소스로 재사용한다.
 *
 * 스키마:
 *   analogy   : 카드/허브용 한 줄 비유 (데모 페이지 자체의 비유 블록은 정적 HTML)
 *   anchor    : 해설 패널을 삽입할 컨테이너 셀렉터 (폴백: .demo-container → main)
 *   embedKeep : ?embed=1 모드에서 남길 main 직계 자식 셀렉터들
 *   explain   : { 컨트롤 셀렉터: ({value, prev, el}) => html } — 실시간 해설 룰.
 *               슬라이더는 드래그 종료 시 1회, value/prev는 숫자로 파싱되어 전달.
 *               주의: 동적 해설 텍스트의 $...$ 수식은 패널 한정 KaTeX 재렌더됨.
 *   tour      : [{ el, title, body, waitFor?: 'click'|'input' }] — 가이드 투어 스텝.
 *               waitFor가 있으면 "다음" 대신 사용자의 실제 행동을 기다린다.
 */
window.DEMO_EDU = {

    // ==========================================
    // 베타 분포 샘플링 (입문)
    // ==========================================
    'beta-sampling': {
        analogy: '분포 곡선은 땅의 높낮이, 샘플은 높은 곳에 더 자주 떨어지는 빗방울',
        anchor: '.control-panel',
        embedKeep: ['.demo-container'],
        embedHide: ['.axis-note'],
        explain: {
            '#slider-alpha': ({ value, prev }) =>
                `α(클릭+1)를 <strong>${prev} → ${value}</strong>로 ${value > prev ? '올렸' : '내렸'}어요. ` +
                `성공 데이터가 ${value > prev ? '늘어난' : '줄어든'} 셈이라 봉우리가 ` +
                `<strong>${value > prev ? '오른쪽(높은 CTR 쪽)' : '왼쪽(낮은 CTR 쪽)'}</strong>으로 움직입니다. ` +
                `분포가 바뀌어 쌓인 샘플은 초기화됐어요.`,
            '#slider-beta': ({ value, prev }) =>
                `β(무시+1)를 <strong>${prev} → ${value}</strong>로 ${value > prev ? '올렸' : '내렸'}어요. ` +
                `실패 데이터가 ${value > prev ? '늘어난' : '줄어든'} 셈이라 봉우리가 ` +
                `<strong>${value > prev ? '왼쪽(낮은 CTR 쪽)' : '오른쪽(높은 CTR 쪽)'}</strong>으로 움직입니다. ` +
                `α+β가 클수록 곡선이 좁아져 "확신"이 커져요.`,
            '#btn-one': () =>
                '분포에서 <strong>딱 1개</strong>를 뽑았어요. 세로 표시가 찍힌 위치를 보세요 — ' +
                '봉우리 근처일 확률이 높습니다. 톰슨 샘플링이 매 라운드 하는 행위가 바로 이거예요.',
            '#btn-hundred': () =>
                '<strong>100개</strong>를 한 번에 뽑았어요. 막대(히스토그램)가 곡선 모양을 닮아가기 시작하죠? ' +
                '많이 뽑을수록 더 비슷해집니다.',
            '#btn-auto': ({ el }) => el.textContent.includes('⏸')
                ? '자동 샘플링 시작! 5,000개까지 쌓이면 히스토그램이 곡선과 거의 일치합니다 — ' +
                  '이게 <strong>큰 수의 법칙</strong>이에요.'
                : '자동 샘플링을 멈췄어요. 지금까지 쌓인 막대와 곡선 모양을 비교해 보세요.',
            '#btn-reset': () =>
                '쌓인 샘플을 모두 비웠어요. 곡선(믿음)은 그대로니까, 다시 뽑으면 같은 패턴이 또 나타납니다.'
        },
        tour: [
            {
                el: '.chart-panel',
                title: '믿음의 곡선',
                body: '이 곡선은 "CTR이 얼마쯤일까?"에 대한 <strong>믿음의 높낮이</strong>예요. ' +
                    '곡선이 높은 곳일수록 그 값일 가능성이 크다고 믿는 겁니다.'
            },
            {
                el: '#btn-one',
                title: '직접 뽑아보기',
                body: '<strong>샘플 1번</strong> 버튼을 눌러보세요. 분포에서 값 하나를 무작위로 뽑습니다.',
                waitFor: 'click'
            },
            {
                el: '.control-panel .control-card:last-child',
                title: '방금 뽑힌 값',
                body: '"마지막 샘플"이 방금 분포에서 뽑힌 값이에요. 여러 번 뽑으면 ' +
                    '봉우리 근처 값이 더 자주 나오는 걸 확인할 수 있습니다.'
            },
            {
                el: '#slider-alpha',
                title: '데이터가 쌓인다면?',
                body: 'α 슬라이더를 움직여 보세요. 클릭(성공)이 쌓일수록 곡선이 어떻게 변하는지 볼 수 있어요.',
                waitFor: 'input'
            },
            {
                el: '#demo-edu-explain',
                title: '해설 패널',
                body: '조작할 때마다 여기에 "지금 일어난 일"이 쉬운 말로 표시됩니다. ' +
                    '이제 자유롭게 실험해 보세요!'
            }
        ]
    },

    // ==========================================
    // UCB1 시뮬레이터 (입문)
    // ==========================================
    'ucb1': {
        analogy: 'c값은 호기심 수준 — 크면 안 가본 식당도 들르는 모험가, 작으면 단골집만 가는 보수파',
        anchor: '.control-panel',
        embedKeep: ['.demo-container'],
        embedHide: ['.chart-panel > div', '.control-panel > div:last-child'],
        explain: {
            '#slider-c': ({ value, prev }) =>
                `탐색 상수 c를 <strong>${prev.toFixed(1)} → ${value.toFixed(1)}</strong>로 ${value > prev ? '올렸' : '내렸'}어요. ` +
                `c가 클수록 회색 막대(불확실성 보너스)가 커져 <strong>덜 검증된 광고</strong>에도 기회가 갑니다. ` +
                `${value > prev ? '호기심이 늘어난 셈이에요' : '검증된 광고에 더 집중하게 됩니다'}. 차트에 즉시 반영돼요.`,
            'button[onclick="runOneRound()"]': () =>
                '한 라운드 진행! <strong>색깔+회색 막대의 합이 가장 길었던 광고</strong>가 선택돼 노출됐어요. ' +
                '클릭 여부에 따라 평균(색깔)이 갱신되고, 선택된 광고의 보너스(회색)는 줄어듭니다. ' +
                '표에서 [Selected] 행을 확인해 보세요.',
            'button[onclick="autoRun(50)"]': () =>
                '50라운드 자동 진행 중이에요. 초반엔 모든 광고가 한 번씩 뽑히고(보너스 INF), ' +
                '점점 <strong>평균이 좋은 광고에 선택이 몰리는</strong> 과정을 지켜보세요.',
            'button[onclick="autoRun(200)"]': () =>
                '200라운드 장기전! 회색 보너스가 충분히 작아지면 사실상 <strong>평균 CTR 경쟁</strong>이 됩니다. ' +
                '표의 Mean이 실제 CTR에 수렴하는지, Hidden Gem(Ad D)이 발견됐는지 확인해 보세요.',
            'button[onclick="resetDemo()"]': () =>
                '모든 기록을 지웠어요. 보너스가 다시 INF(무한대)가 되어, 다음 라운드부터 모든 광고가 한 번씩 선택됩니다.',
            '.demo-mode-toggle button': ({ el }) => el.dataset.mode === 'pro'
                ? '고급 모드로 전환! 탐색 상수 <strong>c 슬라이더</strong>가 열렸어요. c를 0.5로 낮추고 Reset 후 ' +
                  '다시 돌려 보세요 — 탐색 부족으로 Hidden Gem을 놓치는 패턴이 보입니다.'
                : '쉬운 모드로 돌아왔어요. 파라미터는 표준값(c=2)으로 두고 핵심 흐름에 집중합니다.'
        },
        tour: [
            {
                el: '.chart-panel',
                title: '점수는 두 조각',
                body: '막대 하나가 광고 하나예요. <strong>색깔 부분</strong>은 지금까지 관측된 평균 클릭률(실력), ' +
                    '<strong>회색 부분</strong>은 "아직 잘 모르니 주는 가산점"(호기심)입니다. 둘을 합쳐 가장 긴 광고가 선택돼요.'
            },
            {
                el: 'button[onclick="runOneRound()"]',
                title: '한 라운드 돌려보기',
                body: '<strong>Select Best Arm</strong>을 눌러 보세요. 합산 점수 1등 광고가 노출되고 클릭 결과가 반영됩니다.',
                waitFor: 'click'
            },
            {
                el: '#stats-container',
                title: '숫자로 확인',
                body: 'Pulls는 선택 횟수, Bonus는 가산점이에요. 한 번도 안 뽑힌 광고는 Bonus가 <strong>INF(무한대)</strong> — ' +
                    '그래서 초반엔 모든 광고가 반드시 한 번씩 선택됩니다.'
            },
            {
                el: 'button[onclick="autoRun(50)"]',
                title: '빨리 감기',
                body: '50라운드를 자동으로 돌려 보세요. 회색 가산점이 줄어들며 <strong>진짜 실력자에게 선택이 몰리는</strong> 과정이 보입니다.',
                waitFor: 'click'
            },
            {
                el: '#demo-edu-explain',
                title: '해설 패널',
                body: '조작할 때마다 여기에 "지금 일어난 일"이 쉬운 말로 표시됩니다. 고급 모드에서 c를 바꿔가며 자유롭게 실험해 보세요!'
            }
        ]
    },

    // ==========================================
    // Thompson Sampling 시뮬레이터 (입문)
    // ==========================================
    'ts': {
        analogy: 'Beta(1,1)은 백지 상태 — 클릭이 쌓일수록 봉우리가 좁아지며 확신이 생긴다',
        anchor: '.control-panel',
        embedKeep: ['.demo-container'],
        embedHide: ['.chart-panel > div', '.control-panel > div:last-child'],
        explain: {
            '.btn-success': ({ el }) => {
                const card = el.closest('.control-card');
                const name = card ? card.querySelector('h3').textContent : '이 광고';
                return `<strong>${name}</strong>의 클릭(성공)을 기록 → α가 1 올랐어요. 곡선이 ` +
                    `<strong>오른쪽(높은 CTR 쪽)으로 살짝 움직이며 좁아집니다</strong>. 데이터가 늘었으니 확신도 커진 거예요.`;
            },
            '.btn-fail': ({ el }) => {
                const card = el.closest('.control-card');
                const name = card ? card.querySelector('h3').textContent : '이 광고';
                return `<strong>${name}</strong>의 무시(실패)를 기록 → β가 1 올랐어요. 곡선이 ` +
                    `<strong>왼쪽(낮은 CTR 쪽)으로 움직입니다</strong>. 실패도 정보라서 곡선은 역시 좁아져요.`;
            },
            '#slider-prior-a': ({ value, prev }) =>
                `초기 믿음 α₀를 <strong>${prev} → ${value}</strong>로 바꿨어요. 시작부터 "성공을 ${value}번 본 셈" 치는 것이라, ` +
                `값이 클수록 첫 곡선이 좁고 새 데이터에 둔감해집니다. <strong>모델은 자동 리셋</strong>됐어요.`,
            '#slider-prior-b': ({ value, prev }) =>
                `초기 믿음 β₀를 <strong>${prev} → ${value}</strong>로 바꿨어요. "실패를 ${value}번 본 셈"으로 시작하는 것 — ` +
                `Prior가 강할수록 같은 클릭 수로도 곡선이 덜 움직입니다. <strong>모델은 자동 리셋</strong>됐어요.`,
            'button[onclick="resetTS()"]': () =>
                '모든 광고가 초기 Prior 상태로 돌아갔어요. 곡선이 다시 넓어진 건 "다시 모른다"는 뜻입니다.',
            '.demo-mode-toggle button': ({ el }) => el.dataset.mode === 'pro'
                ? '고급 모드! <strong>Prior(α₀, β₀) 슬라이더</strong>가 열렸어요. 10, 10으로 올려 보세요 — ' +
                  '같은 클릭 수로도 곡선이 훨씬 덜 움직이는 "선입견 강한 모델"이 됩니다.'
                : '쉬운 모드로 돌아왔어요. Prior는 Beta(1, 1) 백지 상태가 기본입니다.'
        },
        tour: [
            {
                el: '.chart-panel',
                title: '곡선 = 믿음',
                body: '곡선 3개가 광고 3개의 "CTR이 얼마쯤일까"에 대한 <strong>믿음</strong>이에요. ' +
                    '넓게 퍼져 있으면 "잘 모른다", 좁고 높으면 "꽤 확신한다"는 뜻입니다.'
            },
            {
                el: '#controls-container .btn-success',
                title: '직접 가르쳐 보기',
                body: '광고의 <strong>Click</strong> 버튼을 눌러 보세요. "유저가 클릭했다"는 피드백 1건이 모델에 들어갑니다.',
                waitFor: 'click'
            },
            {
                el: '#stats-container',
                title: '분포의 재료',
                body: '방금 누른 광고의 α(성공) 또는 β(실패)가 1 올랐어요. Mean CTR은 α/(α+β) — 곡선의 중심이 이 값 근처에 옵니다.'
            },
            {
                el: '.demo-mode-toggle',
                title: '더 실험하기',
                body: '고급 모드에서는 <strong>초기 Prior</strong>를 바꿀 수 있어요. 선입견이 강한 모델이 같은 클릭에 얼마나 둔하게 반응하는지 비교해 보세요.'
            },
            {
                el: '#demo-edu-explain',
                title: '해설 패널',
                body: 'Click·Ignore를 누를 때마다 곡선이 왜 그렇게 움직였는지 여기에 표시됩니다. 한 광고만 집중 클릭하면 어떻게 되는지 실험해 보세요!'
            }
        ]
    },

    // ==========================================
    // A/B vs Bandit 트래픽 시뮬레이터 (입문)
    // ==========================================
    'ab-vs-bandit': {
        analogy: 'A/B는 모든 메뉴를 똑같이 깔아두는 시식 코너, 밴딧은 잘 팔리는 메뉴에 매대를 점점 내주는 상인',
        anchor: '.ab-sim',
        embedKeep: ['.ab-sim', '.ab-summary', '.ab-charts'],
        explain: {
            '#ab-controls input[type="range"]': ({ value, prev, el }) => {
                const names = { 'ab-ctr-0': '광고 A', 'ab-ctr-1': '광고 B', 'ab-ctr-2': '광고 C' };
                const name = names[el.id] || '광고';
                return `<strong>${name}</strong>의 진짜 CTR을 <strong>${prev.toFixed(1)}% → ${value.toFixed(1)}%</strong>로 바꿨어요. ` +
                    `알고리즘은 이 값을 모른 채 노출 결과로만 추측해야 합니다. 정답이 바뀌었으니 <strong>시뮬레이션은 처음부터 다시</strong> 시작돼요.`;
            },
            '#ab-step': () =>
                '하루(150명 노출)가 지났어요. A/B는 정확히 50명씩 균등하게, 밴딧은 <strong>그때까지의 성적을 보고</strong> ' +
                '더 좋아 보이는 광고에 더 많이 노출했습니다. 오른쪽 막대 차트에서 배분을 확인해 보세요.',
            '#ab-auto': () =>
                '10일 자동 진행! 왼쪽 그래프에서 <strong>밴딧 선이 A/B 선 위로 벌어지는 지점</strong>과, ' +
                '오른쪽에서 트래픽이 한 광고로 쏠리는 속도를 함께 보세요.',
            '#ab-reset': () =>
                '처음으로 되돌렸어요. 밴딧의 학습 기억도 백지(모든 광고 동등)가 됐습니다. CTR 설정을 바꿔 다른 시나리오를 실험해 보세요.'
        },
        tour: [
            {
                el: '#ab-controls',
                title: '정답을 정하는 곳',
                body: '여기서 각 광고의 <strong>진짜 클릭률</strong>을 정해요. 우리는 정답을 알지만, ' +
                    'A/B와 밴딧 둘 다 정답을 모른 채 노출 결과로만 배워야 합니다.'
            },
            {
                el: '#ab-auto',
                title: '10일 돌려보기',
                body: '<strong>10일 자동 ▶▶</strong>을 눌러 보세요. 하루 150명씩, 열흘짜리 캠페인이 자동으로 진행됩니다.',
                waitFor: 'click'
            },
            {
                el: '.ab-summary',
                title: '점수판',
                body: '같은 기간, 같은 노출 수인데 누적 클릭이 달라요. 그 차이의 정체는 <strong>나쁜 광고에 묶여 있던 트래픽</strong> — ' +
                    'A/B 테스트가 치르는 "실험 비용"입니다.'
            },
            {
                el: '.ab-charts',
                title: '왜 차이가 났나',
                body: '오른쪽 막대를 보세요. 밴딧은 며칠 만에 클릭률 높은 광고로 노출을 옮깁니다. A/B는 10일 내내 3분의 1씩 고정이고요.'
            },
            {
                el: '#demo-edu-explain',
                title: '해설 패널',
                body: '버튼·슬라이더를 조작할 때마다 여기에 해설이 나타납니다. 광고들의 CTR 차이를 좁혀 보세요 — ' +
                    '밴딧의 이득이 줄어드는 것도 중요한 관찰입니다!'
            }
        ]
    },

    // ==========================================
    // UCB1 vs TS Head-to-Head (중급)
    // ==========================================
    'compare-bandits': {
        analogy: '계산기(UCB)와 주사위(TS)가 같은 무대에서 1등 광고를 먼저 찾는 경주 — Regret 곡선이 낮은 쪽이 승자',
        anchor: '.cmp-sim',
        embedKeep: ['.cmp-sim'],
        embedHide: ['.demo-prereq', '.demo-tldr-analogy', '.demo-intro', '.demo-steps', '.cmp-intro', '.linucb-note', '.demo-practice', '.demo-tldr', '.demo-next'],
        explain: {
            '#btn-step': () =>
                '한 라운드 진행 — 두 알고리즘이 <strong>각자</strong> 광고 하나를 고르고 클릭 피드백을 받았어요. ' +
                '같은 데이터를 보고도 다른 선택을 할 수 있습니다. UCB는 점수 계산 결과대로, TS는 분포에서 뽑힌 샘플대로 고르거든요.',
            '#btn-100': () =>
                '100라운드 진행! Regret 곡선의 <strong>기울기</strong>를 보세요. 기울기가 눕는다는 건 ' +
                '"최적 광고를 찾아서 더 이상 손해를 안 본다"는 뜻입니다.',
            '#btn-500': () =>
                '500라운드 장기전. 둘 다 결국 최적 광고에 정착하지만 <strong>가는 길이 달라요</strong> — ' +
                'TS는 초반에 더 다양하게 시도하고, UCB는 보너스 수식이 정한 순서대로 차근차근 탐색합니다.',
            '#btn-reveal': ({ el }) => el.textContent.includes('숨기기')
                ? '정답 공개! 두 표의 "선택" 열에서 누가 최적 광고(OPTIMAL)에 더 빨리, 더 많이 몰렸는지 비교해 보세요.'
                : '정답을 다시 숨겼어요. 알고리즘의 입장으로 돌아가 "모르는 채로" 관찰해 봅시다.',
            '#btn-reset': () =>
                '리셋 완료. 두 알고리즘 모두 백지에서 다시 시작합니다 — 다시 돌리면 TS는 매번 다른 경로를, ' +
                'UCB는 (클릭 운만 빼면) 비슷한 경로를 갑니다. 이게 확률적 vs 결정적의 차이예요.'
        },
        tour: [
            {
                el: '#ads-panel',
                title: '무대 설정',
                body: '광고 4개의 실제 CTR은 숨겨져 있어요. OPTIMAL 표시는 관전자인 우리만 보는 정답 — 두 알고리즘은 모릅니다.'
            },
            {
                el: '.cmp-algos',
                title: '두 명의 도전자',
                body: '왼쪽 <strong>UCB1</strong>은 "평균 + 보너스"를 계산해 1등을 고르는 계산기형, ' +
                    '오른쪽 <strong>TS</strong>는 분포에서 샘플을 뽑아 고르는 주사위형이에요. 받는 피드백 조건은 같습니다.'
            },
            {
                el: '#btn-step',
                title: '한 라운드 진행',
                body: '<strong>▶ 1 Round</strong>를 눌러 보세요. 두 알고리즘이 동시에 각자의 선택을 합니다.',
                waitFor: 'click'
            },
            {
                el: '.cmp-chart-card',
                title: '성적표 — Regret',
                body: '"정답만 골랐을 때 대비 얼마나 손해 봤나"의 누적이에요. <strong>낮을수록 잘한 것</strong>. ' +
                    '100·500라운드를 돌려 두 곡선이 어떻게 갈리는지 보세요.'
            },
            {
                el: '#demo-edu-explain',
                title: '해설 패널',
                body: '버튼을 누를 때마다 여기에 해설이 나타납니다. 리셋하고 여러 번 돌려 보세요 — ' +
                    'TS는 돌릴 때마다 경로가 달라지는 게 포인트입니다!'
            }
        ]
    },

    // ==========================================
    // LinUCB (중급 — Contextual Bandit)
    // ==========================================
    'linucb': {
        analogy: 'UCB1 + 유저 정보 — "어떤 광고가 좋은가"가 아니라 "이 유저에게 어떤 광고가 좋은가"를 학습',
        anchor: '.interaction-area',
        embedKeep: ['.demo-container'],
        embedHide: ['.chart-container > div'],
        explain: {
            '[onclick^="handleAdClick"]': ({ el }) => {
                const card = el.closest('.ad-card');
                const name = card ? card.querySelector('h3').textContent : '이 광고';
                return `<strong>${name}</strong>의 클릭(보상 1)을 학습했어요. 이 광고의 <strong>색깔 막대(예측)는 올라가고, ` +
                    `회색 막대(불확실성)는 줄어듭니다</strong>. 아래 θ(가중치) 표도 함께 바뀐 걸 확인해 보세요.`;
            },
            '[onclick^="handleAdIgnore"]': ({ el }) => {
                const card = el.closest('.ad-card');
                const name = card ? card.querySelector('h3').textContent : '이 광고';
                return `<strong>${name}</strong>의 무시(보상 0)를 학습했어요. 예측 점수는 내려가지만 ` +
                    `<strong>회색 막대는 역시 줄어듭니다</strong> — 무시당한 것도 데이터가 쌓인 것이라, 모델의 궁금증은 해소됐거든요.`;
            },
            '#slider-alpha': ({ value, prev }) =>
                `호기심 계수 α를 <strong>${prev.toFixed(2)} → ${value.toFixed(2)}</strong>로 ${value > prev ? '올렸' : '내렸'}어요. ` +
                `α가 클수록 회색 막대(불확실성 보너스)가 커져 <strong>덜 알려진 광고가 추천을 더 자주 가져갑니다</strong>. ` +
                `학습 상태(A, b)는 그대로 유지돼요.`,
            '.btn-reset': () =>
                '모델을 초기화했어요. 모든 광고의 학습이 지워져 다시 동일 선상 — 예측은 0, 불확실성은 최대로 돌아갑니다.'
        },
        tour: [
            {
                el: '.chart-container',
                title: '점수의 해부도',
                body: '막대 = <strong>색깔(예측: 이 유저가 클릭할 것 같은 정도) + 회색(불확실성: 아직 몰라서 주는 가산점)</strong>. ' +
                    '합이 가장 높은 광고가 추천됩니다.'
            },
            {
                el: '#ad-cards-container',
                title: 'Recommended 배지',
                body: '지금 합산 점수 1등인 광고에 배지가 붙어요. 학습이 진행되면 배지의 주인이 바뀌는 걸 볼 수 있습니다.'
            },
            {
                el: '[onclick^="handleAdClick"]',
                title: '유저가 되어 보기',
                body: '광고의 <strong>Click</strong>을 눌러 보세요. "이런 특징(피처)의 광고가 클릭됐다"는 학습이 일어납니다.',
                waitFor: 'click'
            },
            {
                el: '#slider-alpha',
                title: '호기심 조절 노브',
                body: 'α를 올리면 모델이 모험적으로(새 광고 자주 시도), 내리면 보수적으로(익숙한 광고 집중) 변해요. ' +
                    '실무에서 트래픽 규모에 따라 돌리는 운영 노브가 바로 이것입니다.'
            },
            {
                el: '#demo-edu-explain',
                title: '해설 패널',
                body: '클릭·무시·슬라이더 조작마다 여기에 해설이 나타납니다. 한 광고만 집중 클릭해 보세요 — ' +
                    '회색이 빨리 줄어든 광고가 역전당하는 순간이 옵니다!'
            }
        ]
    },

    // ==========================================
    // RTB 경매 시뮬레이터 (입문)
    // ==========================================
    'rtb': {
        analogy: 'First Price는 부른 값을 그대로 내는 경매장, Second Price는 이겨도 2등 가격만 내는 eBay',
        anchor: '.control-panel',
        embedKeep: ['.demo-container'],
        embedHide: ['.chart-panel > div'],
        explain: {
            '#btn-first-price': () =>
                '<strong>First Price</strong>로 바꿨어요. 낙찰자는 자기가 써낸 금액을 그대로 냅니다. ' +
                '높게 부를수록 그대로 비싸지니까, DSP C는 <strong>Bid Shading</strong>(가치의 50~65%만 입찰) 전략으로 전환했어요. 배지를 확인하세요.',
            '#btn-second-price': () =>
                '<strong>Second Price</strong>로 바꿨어요. 낙찰자는 2등 입찰가에 1센트만 더해 냅니다. ' +
                '솔직하게 불러도 손해가 없어서, DSP C도 가치에 가깝게(85~95%) 입찰하도록 전략을 바꿨어요.',
            '#floor-slider': ({ value, prev }) =>
                `Floor Price(최저 판매가)를 <strong>${prev.toFixed(2)} → ${value.toFixed(2)}달러</strong>로 ${value > prev ? '올렸' : '내렸'}어요. ` +
                (value > prev
                    ? '이 선 아래 입찰은 자동 탈락합니다. 낙찰 단가는 오르지만, 아무도 못 넘으면 광고가 안 팔릴 수도 있어요(미판매 위험).'
                    : '문턱이 낮아져 더 많은 DSP가 경매에 참여합니다. 경쟁은 늘지만 낙찰 단가는 낮아질 수 있어요.'),
            '#btn-run': () =>
                '경매 1회 실행! 막대가 이번 라운드 각 DSP의 입찰가예요. <strong>흰 테두리</strong>가 낙찰자, ' +
                '초록 점선이 실제 지불가(Paid)입니다. Activity Log에서 결과를 확인하세요.',
            '#btn-auto': () =>
                '10라운드를 자동으로 돌립니다. DSP Statistics에 누적 성적(Wins·Avg Spend·Surplus)이 쌓여요. ' +
                '같은 시장인데도 전략(공격적/보수적/Shading)에 따라 성적표가 완전히 달라집니다.',
            '#btn-reset': () =>
                '통계를 초기화했어요. 직전 기록은 아래 <strong>Auction Type Comparison</strong>에 스냅샷으로 저장됩니다. ' +
                '경매 방식을 바꿔 다시 돌리면 두 방식을 나란히 비교할 수 있어요.'
        },
        tour: [
            {
                el: '.chart-panel',
                title: '경매장 한눈에 보기',
                body: '막대 하나가 DSP(광고주 쪽 입찰 시스템) 하나예요. 막대 높이가 입찰가, ' +
                    '빨간 점선이 Floor Price(이 아래는 자동 탈락)입니다.'
            },
            {
                el: '.auction-type-group',
                title: '두 가지 경매 방식',
                body: '<strong>First Price</strong>는 써낸 값 그대로 지불, <strong>Second Price</strong>는 2등 가격만 지불해요. ' +
                    '이 차이 하나가 입찰 전략 전체를 바꿉니다.'
            },
            {
                el: '#btn-run',
                title: '직접 경매 돌려보기',
                body: '<strong>Run Auction</strong>을 눌러보세요. 4개 DSP가 동시에 입찰하고 승자가 결정됩니다.',
                waitFor: 'click'
            },
            {
                el: '#demo-log',
                title: '방금 무슨 일이?',
                body: '이번 라운드 전원의 입찰가와 낙찰자, 실제 지불가가 기록됐어요. ' +
                    'Second Price에서는 낙찰자가 아낀 금액(Saved)도 표시됩니다.'
            },
            {
                el: '#demo-edu-explain',
                title: '해설 패널',
                body: '조작할 때마다 여기에 "지금 일어난 일"이 쉬운 말로 표시됩니다. ' +
                    'Floor Price를 바꾸거나 Auto Run으로 자유롭게 실험해 보세요!'
            }
        ]
    },

    // ==========================================
    // Header Bidding vs Waterfall (입문)
    // ==========================================
    'header-bidding': {
        analogy: '여러 가게에 동시 전화(HB) vs 한 곳씩 차례로 전화(Waterfall) — 동시에 물어야 최고가를 찾는다',
        anchor: '.hb-controls',
        embedKeep: ['.hb-container'],
        embedHide: ['.demo-prereq', '.demo-tldr-analogy', '.demo-intro', '.demo-steps', '.hb-intro', '.demo-tldr', '.demo-practice', '.demo-next'],
        explain: {
            '#btn-single': () =>
                '경매 1회! 왼쪽 Waterfall은 막대가 <strong>계단처럼 이어지고</strong>(순차 호출, 지연 = 합), ' +
                '오른쪽 Header Bidding은 <strong>전부 0ms에서 동시 출발</strong>해요(지연 = 최댓값). 초록 테두리가 낙찰 SSP입니다.',
            '#btn-100': () =>
                '<strong>100회</strong>를 한 번에 돌렸어요. 아래 요약에서 평균 CPM과 수익 증가율을 보세요. ' +
                '한두 번은 운에 좌우되지만, 반복할수록 Header Bidding의 우위가 안정적으로 드러납니다.',
            '#btn-1000': () =>
                '<strong>1,000회</strong> 누적! 이 정도면 분포가 안정됩니다. 지금 보이는 평균 수익 증가율이 ' +
                '업계에서 말하는 "HB 도입 시 매체 수익 +10~30%"의 근거예요. 분포 차트에서 HB가 오른쪽(높은 CPM)에 치우친 것도 확인하세요.',
            '#btn-reset': () =>
                '통계를 비웠어요. SSP 구성(가격 분포·지연·응답률)은 그대로니까, 다시 돌리면 같은 경향이 재현됩니다.'
        },
        tour: [
            {
                el: '#ssp-panel',
                title: '4개의 SSP',
                body: '광고 자리를 사 줄 후보 4곳이에요. 각자 가격 분포(CPM), 응답 속도(지연), 응답률이 다릅니다. ' +
                    'Premium은 비싸게 사 주지만 가끔 응답이 없어요.'
            },
            {
                el: '#btn-single',
                title: '직접 1회 돌려보기',
                body: '<strong>1회 시뮬레이션</strong>을 눌러보세요. 같은 요청 하나를 두 방식이 동시에 처리합니다.',
                waitFor: 'click'
            },
            {
                el: '.hb-compare-grid',
                title: '타임라인 비교',
                body: '왼쪽 Waterfall은 한 곳씩 차례로(첫 성공에서 멈춤), 오른쪽 HB는 전부 동시에 호출해요. ' +
                    '낙찰 CPM과 총 지연이 어떻게 다른지 비교해 보세요.'
            },
            {
                el: '.hb-stats-card',
                title: '반복해야 보이는 진실',
                body: '1회 결과는 운이에요. <strong>1000회 반복</strong>을 누르면 평균 CPM 차이(수익 증가율)가 ' +
                    '안정적인 숫자로 나타납니다.'
            },
            {
                el: '#demo-edu-explain',
                title: '해설 패널',
                body: '버튼을 누를 때마다 여기에 "지금 일어난 일"이 표시됩니다. 자유롭게 실험해 보세요!'
            }
        ]
    },

    // ==========================================
    // Bid Landscape Explorer (입문)
    // ==========================================
    'bid-landscape': {
        analogy: '고객을 데려오는 비용 vs 그 고객이 가져올 매출 — 입찰가의 정답은 그 사이 이익 곡선의 봉우리',
        anchor: '.control-panel',
        embedKeep: ['.chart-full', '.controls-stats-grid'],
        embedHide: ['.chart-legend'],
        explain: {
            '#slider-bid': ({ value, prev }) =>
                `입찰가를 <strong>${prev.toFixed(2)} → ${value.toFixed(2)}달러</strong>로 ${value > prev ? '올렸' : '내렸'}어요. ` +
                '차트의 세로 점선이 따라 움직이고 Stats가 실시간으로 바뀝니다. ' +
                (value > prev
                    ? '초록 곡선의 봉우리(Optimal Bid)를 지나치면, 더 자주 이겨도 이익은 오히려 줄어요.'
                    : '너무 내리면 비용은 아끼지만 낙찰 기회 자체를 놓쳐서 전체 이익이 줄어요.'),
            '#slider-median': ({ value, prev }) =>
                `시장 중앙값(경쟁자들의 평균 입찰 수준)을 <strong>${prev.toFixed(2)} → ${value.toFixed(2)}달러</strong>로 바꿨어요. ` +
                `${value > prev ? '시장이 비싸진' : '시장이 싸진'} 셈이라 낙찰률 S자 곡선 전체가 <strong>${value > prev ? '오른쪽' : '왼쪽'}</strong>으로 밀립니다. ` +
                'Optimal Bid도 같이 움직였는지 확인하세요.',
            '#slider-competition': ({ value, prev }) =>
                `경쟁 강도 k를 <strong>${prev.toFixed(1)} → ${value.toFixed(1)}</strong>로 바꿨어요. ` +
                (value > prev
                    ? 'k가 클수록 경쟁자들이 비슷한 가격에 몰려 있다는 뜻 — S자 곡선이 가팔라져서, 조금만 낮게 불러도 낙찰률이 급락합니다.'
                    : 'k가 작으면 경쟁자 가격이 넓게 퍼져 있다는 뜻 — 곡선이 완만해져서 가격에 덜 민감해집니다.'),
            '#slider-pctr': ({ value, prev }) =>
                `pCTR(클릭 확률 예측값)을 <strong>${prev.toFixed(2)} → ${value.toFixed(2)}</strong>로 바꿨어요. ` +
                `이 노출의 기대 가치가 ${value > prev ? '커져서 이익 곡선이 위로 올라가고, 더 공격적으로 입찰해도 이익이 남습니다' : '작아져서 이익 곡선이 가라앉습니다. 너무 낮으면 아예 입찰을 안 하는 게 합리적이에요'}.`,
            '#slider-convvalue': ({ value, prev }) =>
                `전환 가치(클릭 1번의 기대 매출)를 <strong>${prev} → ${value}달러</strong>로 바꿨어요. ` +
                'pCTR과 곱해져 기대 수익이 되니까, 효과는 pCTR을 움직일 때와 같습니다. ' +
                `${value > prev ? '보험·금융처럼 전환 단가가 높은 업종이 공격적으로 입찰하는 이유예요.' : '가치가 낮은 캠페인은 입찰가 상한도 낮아져야 해요.'}`
        },
        tour: [
            {
                el: '.chart-full',
                title: '세 개의 곡선',
                body: '파란 S자 = 낙찰률, 빨간 = 예상 비용, <strong>초록 = 예상 이익</strong>이에요. ' +
                    '세로 점선이 지금 내 입찰가의 위치입니다.'
            },
            {
                el: '#slider-bid',
                title: '직접 움직여보기',
                body: '<strong>Bid Price</strong> 슬라이더를 움직여 보세요. 점선이 따라 움직이고 Stats가 실시간으로 바뀝니다.',
                waitFor: 'input'
            },
            {
                el: '.stats-panel',
                title: '최적 입찰가',
                body: '<strong>Optimal Bid</strong>가 초록 곡선의 봉우리 위치예요. ' +
                    '내 입찰가를 이 값 근처로 맞추면 Expected Profit이 최대가 됩니다.'
            },
            {
                el: '.demo-mode-toggle',
                title: '고급 모드',
                body: '<strong>고급 모드</strong>를 켜면 경쟁 강도(k)와 pCTR 슬라이더가 열려요. ' +
                    '시장 조건이 바뀌면 봉우리가 어디로 이동하는지 실험해 보세요.'
            },
            {
                el: '#demo-edu-explain',
                title: '해설 패널',
                body: '슬라이더를 조작할 때마다 여기에 해설이 나타납니다. 자유롭게 실험해 보세요!'
            }
        ]
    },

    // ==========================================
    // Bid Shading Visualizer (중급)
    // ==========================================
    'bid-shading': {
        analogy: '부른 값을 그대로 내는 경매에서는 조금 깎아 불러야 차익이 남는다 — 얼마나 깎을지가 Shading',
        anchor: '.demo-grid .panel',
        embedKeep: ['.demo-grid'],
        explain: {
            '#slider-truevalue': ({ value, prev }) =>
                `True Value(이 노출의 진짜 가치)를 <strong>${prev.toFixed(2)} → ${value.toFixed(2)}달러</strong>로 바꿨어요. ` +
                'pCTR과 전환 가치의 곱으로 계산되는 값이라, pCTR 모델이 틀리면 여기서부터 틀어집니다. ' +
                'Shaded Bid도 같은 비율로 따라 움직였어요.',
            '#slider-shading': ({ value, prev }) =>
                `Shading Factor를 <strong>${prev}% → ${value}%</strong>로 ${value > prev ? '올렸' : '내렸'}어요. ` +
                (value > prev
                    ? '더 깎아 부르니 이길 확률(Win Rate)은 내려가지만, 이길 때마다 남는 이익은 커집니다. 아래 Sweep 곡선의 봉우리와 비교해 보세요.'
                    : '덜 깎으니 더 자주 이기지만 회당 이익은 줄어요. 0%가 되면 이겨도 남는 게 없습니다(이익 0).'),
            '#slider-market-mu': ({ value, prev }) =>
                `시장 분포의 위치(뮤)를 <strong>${prev.toFixed(2)} → ${value.toFixed(2)}</strong>로 바꿨어요. ` +
                `경쟁자들의 입찰가 중앙값이 ${value > prev ? '올라갑니다. 시장이 비싸지면 깎을 여지가 줄어 최적 Shading이 작아져요' : '내려갑니다. 시장이 싸지면 깎을 여지가 늘어 최적 Shading이 커져요'}. ` +
                '슬라이더 아래의 시장 중앙값 표시를 확인하세요.',
            '#slider-market-sigma': ({ value, prev }) =>
                `시장 분포의 폭(시그마)을 <strong>${prev.toFixed(2)} → ${value.toFixed(2)}</strong>로 바꿨어요. ` +
                (value > prev
                    ? '경쟁자 가격이 넓게 퍼집니다. 가끔 아주 낮은 경쟁자가 나오니, 공격적으로 깎아도 "거저 줍는 낙찰"이 가능해져요.'
                    : '경쟁자 가격이 촘촘해집니다. 조금만 깎아도 낙찰률이 뚝 떨어져서, 깎는 폭을 줄여야 해요.'),
            '#btn-censored-toggle': ({ el }) => el.textContent.includes('God View')
                ? '<strong>Censored View</strong> — 실제 DSP의 시점이에요. 패찰한 경매의 경쟁자 가격(내 입찰가보다 높은 영역)은 ' +
                  '물음표로 가려집니다. 분홍 점선(관측 데이터만으로 한 추정)이 실제보다 왼쪽에 있죠 — 시장가를 과소추정하는 거예요.'
                : '<strong>God View</strong> — 모든 경쟁자 가격이 보이는 이론적 시점으로 돌아왔어요. ' +
                  '실제 현장에서는 절대 볼 수 없는 화면입니다.'
        },
        tour: [
            {
                el: '.bid-visual',
                title: '깎아서 부르기',
                body: 'True Value가 이 노출의 진짜 가치, <strong>Shaded Bid</strong>가 실제로 써내는 금액이에요. ' +
                    '이 둘의 차이만큼이 이겼을 때 남는 이익입니다.'
            },
            {
                el: '#slider-shading',
                title: '직접 깎아보기',
                body: '<strong>Shading Factor</strong> 슬라이더를 움직여 보세요. 많이 깎을수록 덜 이기지만, 이길 때 더 남습니다.',
                waitFor: 'input'
            },
            {
                el: '#sweepChart',
                title: '최적점은 봉우리',
                body: '초록 곡선이 "깎는 비율별 기대 이익"이에요. 0%(안 깎음)는 이익 0, 너무 깎으면 못 이겨서 다시 0. ' +
                    '그 사이 봉우리가 최적 Shading입니다.'
            },
            {
                el: '#btn-censored-toggle',
                title: '실제 DSP의 시야',
                body: '이 버튼을 눌러보세요. 실제 DSP는 <strong>패찰한 경매의 가격을 볼 수 없습니다</strong> — ' +
                    '데이터의 절반이 가려진 채 추정해야 해요.',
                waitFor: 'click'
            },
            {
                el: '#demo-edu-explain',
                title: '해설 패널',
                body: '조작할 때마다 여기에 해설이 나타납니다. 시장 조건(위치·폭)을 바꿔 봉우리가 이동하는 것도 실험해 보세요!'
            }
        ]
    },

    // ==========================================
    // Calibration Explorer (중급)
    // ==========================================
    'calibration': {
        analogy: '"90% 확신"이라면서 10번 중 8번만 맞는 모델 — 순위는 맞아도 그 확률로 만든 입찰가는 어긋난다',
        anchor: '.cal-controls',
        embedKeep: ['.cal-container'],
        embedHide: ['.demo-prereq', '.demo-tldr-analogy', '.demo-intro', '.demo-steps', '.cal-intro', '.demo-tldr', '.demo-practice', '.demo-next'],
        explain: {
            '#cal-slope': ({ value, prev }) =>
                `기울기(slope)를 <strong>${(+prev).toFixed(2)} → ${(+value).toFixed(2)}</strong>로 바꿨어요. ` +
                (value > 1.05
                    ? '1보다 크면 <strong>과신</strong> — 모델이 확률을 0과 1 쪽으로 밀어붙입니다. 신뢰도 곡선이 S자로 휘고, 높은 pCTR 구간에서 과대입찰이 생겨요.'
                    : value < 0.95
                        ? '1보다 작으면 <strong>과소</strong> — 확률이 가운데로 움츠러듭니다. 좋은 트래픽에 소심하게 입찰해 기회를 놓쳐요.'
                        : '1 근처면 거의 <strong>완벽 보정</strong> — 두 곡선이 겹치고 입찰 왜곡이 사라집니다.'),
            '#cal-bias': ({ value, prev }) =>
                `편향(bias)을 <strong>${(+prev).toFixed(2)} → ${(+value).toFixed(2)}</strong>로 바꿨어요. ` +
                (value > 0.1
                    ? '0보다 크면 <strong>전반적 과대예측</strong> — 모든 구간에서 실제보다 높게 봐서 입찰선이 통째로 위로 뜹니다(과지출).'
                    : value < -0.1
                        ? '0보다 작으면 <strong>전반적 과소예측</strong> — 모든 구간에서 보수적으로 입찰해 노출 기회를 놓칩니다.'
                        : '0 근처면 위아래 치우침은 거의 없어요. 이제 왜곡의 주범은 기울기(slope)입니다.'),
            '[data-preset="1,0"]': () =>
                '<strong>완벽 보정</strong> 프리셋. 신뢰도 곡선이 대각선에 붙고 ECE가 0에 가깝습니다 — 예측 확률을 그대로 입찰에 써도 안전한 상태예요.',
            '[data-preset="1.6,0"]': () =>
                '<strong>과신</strong> 프리셋. "90%"라고 말하지만 실제는 그보다 낮은 상태예요. 신뢰도 곡선이 S자로 휘고, 비싼(높은 pCTR) 트래픽에 과대입찰합니다 — 입찰 왜곡 지표가 +로 튀는 걸 보세요.',
            '[data-preset="0.6,0"]': () =>
                '<strong>과소(underconfident)</strong> 프리셋. 모델이 자신이 없어 확률을 가운데로 모읍니다. 좋은 트래픽엔 과소입찰해 기회를 놓치고, 나쁜 트래픽엔 과대입찰해요.',
            '[data-preset="1,0.6"]': () =>
                '<strong>양성 편향</strong> 프리셋. 모든 구간에서 확률이 부풀어, 입찰선 전체가 적정선 위로 뜹니다 — 전 구간 과지출. ECE와 두 왜곡 지표를 확인하세요.'
        },
        tour: [
            {
                el: '.cal-chart-card:first-child',
                title: '신뢰도 곡선 읽는 법',
                body: '가로축은 모델이 말한 확률, 세로축은 실제로 일어난 빈도예요. ' +
                    '점선(대각선)에 붙을수록 "말한 만큼 맞는" 정직한 모델입니다.'
            },
            {
                el: '[data-preset="1.6,0"]',
                title: '과신 모델 만들기',
                body: '<strong>과신</strong> 버튼을 눌러보세요. 순위(AUC)는 그대로인데 확률만 어긋난 모델이 됩니다.',
                waitFor: 'click'
            },
            {
                el: '.cal-metrics',
                title: '어긋남을 숫자로',
                body: 'ECE는 예측과 실제의 평균 격차, 옆의 두 칸은 예측 90%·10% 지점에서 입찰가가 몇 % 어긋나는지예요. ' +
                    '과신 모델은 높은 확률 구간에서 크게 과대입찰합니다.'
            },
            {
                el: '#cal-slope',
                title: '직접 움직여 보기',
                body: '기울기 슬라이더를 움직여 곡선이 휘는 방향을 관찰해 보세요.',
                waitFor: 'input'
            },
            {
                el: '#demo-edu-explain',
                title: '해설 패널',
                body: '조작할 때마다 "지금 일어난 일"이 여기 쉬운 말로 표시됩니다. 자유롭게 실험해 보세요!'
            }
        ]
    },

    // ==========================================
    // pCTR Model Quality Impact (중급)
    // ==========================================
    'pctr-impact': {
        analogy: '예측이 1% 틀리면 입찰가가 1% 틀리고, 매출은 3~5% 흔들린다 — 오차가 증폭되는 회로',
        anchor: '.pq-controls',
        embedKeep: ['.pq-container'],
        embedHide: ['.demo-prereq', '.demo-tldr-analogy', '.demo-intro', '.demo-steps', '.pq-intro', '.demo-tldr', '.demo-practice', '.demo-next'],
        explain: {
            '#slider-bias': ({ value, prev }) =>
                `pCTR 편향을 <strong>${prev > 0 ? '+' : ''}${prev}% → ${value > 0 ? '+' : ''}${value}%</strong>로 바꿨어요. ` +
                (value > 0
                    ? '모델이 클릭 확률을 실제보다 높게 봅니다 → 입찰가가 부풀어 낙찰은 늘지만, 적정가보다 비싸게 사서 Surplus가 깎여요.'
                    : value < 0
                        ? '모델이 클릭 확률을 실제보다 낮게 봅니다 → 입찰가가 낮아져 좋은 노출을 놓치지만, 산 것은 싸게 사서 손실은 과대입찰보다 작아요.'
                        : '편향 0 — 예측이 정확해 Surplus 곡선의 꼭대기(최적점)에 서 있습니다.'),
            '#slider-market': ({ value, prev }) =>
                `시장 경쟁도를 <strong>${(+prev).toFixed(3)} → ${(+value).toFixed(3)}달러</strong>로 바꿨어요. ` +
                (value > prev
                    ? '경쟁자들의 입찰가 중앙값이 올라가 같은 입찰가로는 덜 이깁니다(Win Rate 하락). 성수기 광고 시장이 이런 상태예요.'
                    : '경쟁이 느슨해져 같은 입찰가로 더 자주 이깁니다. 같은 편향이라도 손실 금액은 시장 상황에 따라 달라져요.'),
            '#slider-shade': ({ value, prev }) =>
                `Shading을 <strong>${Math.round(prev * 100)}% → ${Math.round(value * 100)}%</strong>로 바꿨어요. ` +
                '예측 가치에서 그만큼 깎아서 입찰합니다. 많이 깎으면 이겼을 때 남는 게 크지만 덜 이기고, ' +
                '안 깎으면 자주 이기지만 남는 게 없어요 — 그 사이의 최적점을 찾는 게 Bid Shading입니다.'
        },
        tour: [
            {
                el: '.pq-summary',
                title: '핵심 숫자 3개',
                body: '왼쪽부터 모델이 매긴 노출 1회의 가치, 경매에서 이긴 비율, 그리고 1000번 노출당 남긴 이익(Surplus)이에요. ' +
                    '모든 조작의 결과가 이 세 숫자로 모입니다.'
            },
            {
                el: '#slider-bias',
                title: '모델을 일부러 틀리게',
                body: '편향 슬라이더를 <strong>+10%</strong>쯤으로 올려보세요. 모델이 클릭 확률을 10% 부풀려 보는 상황입니다.',
                waitFor: 'input'
            },
            {
                el: '.pq-chart-wrap',
                title: 'Surplus 곡선',
                body: '점이 곡선 꼭대기(편향 0)에서 멀어졌죠? 왼쪽(과소)보다 오른쪽(과대)이 더 가파르게 떨어집니다 — ' +
                    '과대입찰이 더 아픈 이유예요.'
            },
            {
                el: '#demo-edu-explain',
                title: '해설 패널',
                body: '슬라이더를 움직일 때마다 "지금 일어난 일"이 여기 표시됩니다. 시장 경쟁도·Shading도 바꿔 보세요!'
            }
        ]
    },

    // ==========================================
    // Censored Data in RTB (중급)
    // ==========================================
    'censored-data': {
        analogy: '시험에서 떨어진 학생 점수는 "60점 미만"만 안다 — 패찰 경매의 시장가도 "내 입찰가 이상"만 안다',
        anchor: '.panel',
        embedKeep: ['.step-progress', '.demo-layout'],
        explain: {
            '#slider-my-bid': ({ value, prev }) =>
                `내 입찰가를 <strong>${(+prev).toFixed(2)} → ${(+value).toFixed(2)}달러</strong>로 바꿨어요. ` +
                '입찰가는 곧 <strong>관측의 커튼</strong> — 높이면 더 자주 이겨서 시장가를 더 많이 보고, ' +
                '낮추면 가려지는 데이터가 늘어요. Run Auctions를 눌러야 반영됩니다.',
            '#slider-mu': ({ value, prev }) =>
                `시장 μ를 <strong>${(+prev).toFixed(2)} → ${(+value).toFixed(2)}</strong>로 바꿨어요. ` +
                `시장 가격의 전반적 수준이 ${value > prev ? '올라갑니다' : '내려갑니다'}(중앙값이 슬라이더 아래 표시돼요). ` +
                'Run Auctions를 눌러 새 시장에서 다시 경매해 보세요.',
            '#slider-sigma': ({ value, prev }) =>
                `시장 σ를 <strong>${(+prev).toFixed(2)} → ${(+value).toFixed(2)}</strong>로 바꿨어요. ` +
                (value > prev
                    ? '클수록 가격이 들쭉날쭉해집니다 — 불확실한 시장일수록 Naive 추정의 편향도 커져요. Run Auctions로 확인해 보세요.'
                    : '작을수록 가격이 한 곳에 몰려 추정이 쉬워집니다. Run Auctions로 확인해 보세요.'),
            '#btn-run': () =>
                '경매를 새로 돌렸어요. 차트의 <strong>초록 막대</strong>는 이겨서 가격을 본 경매, ' +
                '그 오른쪽은 져서 가격을 못 본 경매입니다. 세로선(My Bid)이 그 경계예요.',
            '#btn-god-view': () =>
                '<strong>God View</strong> — 모든 경매의 시장가가 보이는 가상의 시점입니다. ' +
                '현실에는 존재하지 않지만, 추정이 얼마나 맞았는지 채점할 기준이 돼요.',
            '#btn-engineer-view': () =>
                '<strong>Engineer View</strong> — 실제 DSP가 보는 화면입니다. 패찰 경매의 가격이 ???로 가려졌어요. ' +
                '아는 건 "내 입찰가보다 높았다"는 사실뿐 — 이게 Right-Censoring입니다.',
            '#btn-reveal': () =>
                '가려진 경매 하나의 진짜 가격을 잠깐 보여드렸어요. 실전에서는 <strong>영원히 알 수 없는</strong> 값입니다. ' +
                '3초 뒤 다시 ???로 돌아가요.'
        },
        tour: [
            {
                el: '.step-progress',
                title: '5단계로 배웁니다',
                body: '전지적 시점(God View)에서 출발해, 실제 엔지니어가 보는 가려진 데이터, 그로 인한 편향, ' +
                    '그리고 복구 방법까지 한 단계씩 갑니다. 점을 눌러 이동할 수도 있어요.'
            },
            {
                el: '#btn-run',
                title: '경매 1,000번 돌리기',
                body: '<strong>Run Auctions</strong>를 눌러 보세요. 시장 가격 분포에서 1,000번의 경매가 시뮬레이션됩니다.',
                waitFor: 'click'
            },
            {
                el: '#dist-chart-panel',
                title: '시장 가격 분포',
                body: '초록 막대는 내가 이겨서 가격을 본 경매, 붉은 영역은 져서 못 본 경매예요. ' +
                    '세로선(My Bid)이 그 경계 — 이 선이 곧 "관측의 커튼"입니다.'
            },
            {
                el: '#btn-next-1',
                title: '다음 단계로',
                body: '이 버튼으로 Step 2(Engineer View)로 넘어가면, 방금 본 붉은 영역이 ???로 가려집니다. ' +
                    '실제 DSP가 보는 세상이에요.'
            },
            {
                el: '#demo-edu-explain',
                title: '해설 패널',
                body: '버튼·슬라이더를 조작할 때마다 여기에 해설이 나타납니다. 5단계를 차례로 진행해 보세요!'
            }
        ]
    },

    // ==========================================
    // Attribution Window Playground (입문)
    // ==========================================
    'attribution-window': {
        analogy: '축구 골 하나의 공로를 누구에게? 마지막 패스만? 첫 드리블도? — 규칙에 따라 채널 평가가 뒤바뀐다',
        anchor: '.aw-controls',
        embedKeep: ['.aw-container'],
        embedHide: ['.demo-prereq', '.demo-tldr-analogy', '.demo-intro', '.demo-steps', '.aw-intro', '.demo-tldr', '.demo-practice', '.demo-next'],
        explain: {
            '[data-window]': ({ el }) => {
                const w = +el.dataset.window;
                if (w >= 9999) return '윈도우를 <strong>전체 기간</strong>으로 넓혔어요. 4개 터치(Display·Search·Social·Email)가 전부 공로 후보가 됩니다. 빗금 영역이 사라진 걸 보세요.';
                if (w === 7) return '윈도우 <strong>7일</strong> — 전환 7일 전까지만 인정합니다. Display(D-20)와 Search(D-9)가 회색으로 빠지며 공로 0%가 됐어요. 윈도우 하나로 채널 두 개의 성과가 사라진 겁니다.';
                if (w === 14) return '윈도우 <strong>14일</strong> — Search(D-9)까지는 살아남고 Display(D-20)만 제외됩니다. 윈도우 경계가 어디냐에 따라 채널의 생사가 갈려요.';
                return '윈도우 <strong>30일</strong> — 이 여정의 터치 4개가 모두 안에 들어옵니다. 이제 공로 배분은 순전히 모델 규칙에 달렸어요.';
            },
            '[data-model="last"]': () =>
                '<strong>마지막 터치</strong> — 전환 직전 채널이 공로 100%를 독식합니다. 구현이 쉬워 오랫동안 표준이었지만, 마무리 채널(리타게팅 등)만 과대평가돼요.',
            '[data-model="first"]': () =>
                '<strong>첫 터치</strong> — 여정을 시작하게 한 발견 채널이 100%를 가져갑니다. 인지 채널이 떠오르지만, 이번엔 마무리 노력이 0이 되죠.',
            '[data-model="linear"]': () =>
                '<strong>선형</strong> — 윈도우 안 모든 터치가 공로를 균등하게 나눠 갖습니다. 공평해 보이지만 "스쳐 지나간 터치"도 같은 몫이라는 게 약점이에요.',
            '[data-model="position"]': () =>
                '<strong>위치 기반</strong> — 첫 터치 40%·마지막 터치 40%·중간이 나머지 20%를 나눕니다. "발견"과 "마무리"를 모두 인정하는 절충안이에요.'
        },
        tour: [
            {
                el: '#aw-track',
                title: '한 유저의 여정',
                body: '이 유저는 전환(★)까지 Display → Search → Social → Email 순서로 광고를 만났어요. ' +
                    '질문은 하나 — 이 전환의 공로는 누구 몫일까요?'
            },
            {
                el: '[data-window="7"]',
                title: '윈도우 좁혀보기',
                body: '<strong>7일</strong> 버튼을 눌러 보세요. 전환 7일 전보다 오래된 터치는 공로 후보에서 아예 제외됩니다.',
                waitFor: 'click'
            },
            {
                el: '#aw-credit-chart',
                title: '공로가 재배분됐어요',
                body: 'Display와 Search 막대가 0이 됐죠? 타임라인의 빗금 영역(윈도우 밖)에 있기 때문이에요. ' +
                    '윈도우 설정 하나가 채널 평가를 바꿉니다.'
            },
            {
                el: '[data-model="linear"]',
                title: '나누는 규칙 바꾸기',
                body: '이번엔 <strong>선형</strong>을 눌러 보세요. 같은 여정인데 공로가 똑같이 나뉩니다.',
                waitFor: 'click'
            },
            {
                el: '#demo-edu-explain',
                title: '해설 패널',
                body: '버튼을 누를 때마다 "지금 일어난 일"이 여기 표시됩니다. 윈도우×모델 조합을 자유롭게 실험해 보세요!'
            }
        ]
    },

    // ==========================================
    // Golden Section Search (중급)
    // ==========================================
    'golden-section': {
        analogy: '단봉 산의 정상 찾기 — 구간을 황금비 0.618배로 잘라내며 적은 평가로 빠르게 수렴',
        anchor: '.demo-grid > div:first-child',
        embedKeep: ['.demo-grid'],
        embedHide: ['.insight-box'],
        explain: {
            '#slider-V': ({ value, prev }) =>
                `광고의 진짜 가치 V를 <strong>${prev} → ${value.toFixed(1)}달러</strong>로 ${value > prev ? '올렸' : '내렸'}어요. ` +
                `V가 ${value > prev ? '커지면 입찰에 여유가 생겨 최적 입찰가도 올라가고 봉우리도 높아집니다' : '작아지면 깎을 여지가 줄어 봉우리가 낮고 좁아집니다'}. ` +
                `파라미터가 바뀌어 탐색은 처음부터 다시 시작했어요.`,
            '#slider-mu': ({ value, prev }) =>
                `시장 중심 μ를 <strong>${prev} → ${value.toFixed(2)}</strong>로 ${value > prev ? '올렸' : '내렸'}어요. ` +
                `경쟁자들이 평균적으로 ${value > prev ? '더 비싸게' : '더 싸게'} 입찰하는 시장이 된 셈이라, ` +
                `봉우리(최적 입찰가)가 <strong>${value > prev ? '오른쪽으로 밀리고 기대 이익은 줄어듭니다' : '왼쪽으로 내려오고 기대 이익은 커집니다'}</strong>.`,
            '#slider-sigma': ({ value, prev }) =>
                `시장 변동성 σ를 <strong>${prev} → ${value.toFixed(2)}</strong>로 ${value > prev ? '키웠' : '줄였'}어요. ` +
                `경쟁자 가격이 ${value > prev ? '들쭉날쭉해져 곡선이 <strong>넓고 완만</strong>해집니다 — 대충 입찰해도 손해가 적은 시장' : '비슷비슷해져 곡선이 <strong>뾰족</strong>해집니다 — 정밀한 입찰가가 중요한 시장'}이에요.`,
            '#slider-tol': ({ value, prev }) =>
                `수렴 정밀도 ε를 <strong>${prev.toFixed(3)} → ${value.toFixed(3)}달러</strong>로 ${value > prev ? '느슨하게' : '빡빡하게'} 했어요. ` +
                `${value > prev ? '일찍 멈추는 대신 답이 거칠어집니다' : '반복이 늘지만 더 정확한 답을 얻습니다'}. ` +
                `구간이 0.618배씩 줄어드니, ε를 10배 좁혀도 반복은 5번쯤만 늘어요.`,
            '#btn-step': () =>
                '한 번 반복했어요. x₁과 x₂ 두 점의 기대 이익(Surplus)을 비교해 ' +
                '<strong>봉우리가 있을 수 없는 쪽 구간을 잘라냈습니다</strong>. ' +
                'Bracket(b−a)이 직전의 0.618배가 된 것을 Iteration Log에서 확인해 보세요.',
            '#btn-play': ({ el }) => el.classList.contains('playing')
                ? '자동 재생 시작! 회색 Bracket 띠가 봉우리를 향해 <strong>양쪽에서 조여드는</strong> 모습을 보세요. ' +
                  '구간이 ε보다 좁아지면 자동으로 멈춥니다.'
                : '자동 재생을 멈췄어요. 지금까지 구간이 얼마나 좁아졌는지 Convergence 차트로 확인해 보세요. ' +
                  '이미 수렴했다면 Reset 후 다시 돌릴 수 있어요.',
            '#btn-skip': () =>
                '수렴할 때까지 한 번에 실행했어요. Results에서 <strong>최적 입찰가 b*</strong>와 ' +
                '<strong>Speedup</strong>을 보세요 — 같은 정밀도를 Grid Search로 얻으려면 수백 번 평가해야 합니다.'
        },
        tour: [
            {
                el: '.chart-wrap',
                title: '봉우리가 하나뿐인 산',
                body: '이 곡선은 입찰가별 <strong>기대 이익(Surplus)</strong>이에요. 너무 싸게 부르면 못 이기고, ' +
                    '너무 비싸게 부르면 남는 게 없어서 <strong>봉우리가 정확히 하나</strong> 생깁니다. 우리의 목표는 이 정상 찾기.'
            },
            {
                el: '#btn-step',
                title: '직접 한 칸 좁혀보기',
                body: '<strong>Step</strong> 버튼을 눌러보세요. 두 비교점의 이익을 재서 봉우리가 없는 쪽 구간을 버립니다.',
                waitFor: 'click'
            },
            {
                el: '.iter-info',
                title: '구간이 줄어드는 속도',
                body: 'Bracket(b−a)이 방금 <strong>0.618배</strong>로 줄었어요. 몇 번만 반복해도 구간이 ' +
                    '기하급수적으로 좁아집니다 — 이게 황금비 탐색의 힘이에요.'
            },
            {
                el: '.chart-wrap-sm',
                title: '수렴을 한눈에',
                body: '이 차트는 반복마다의 구간 폭이에요. 세로축이 로그 스케일이라 ' +
                    '<strong>직선으로 떨어지면 기하급수 수렴</strong>이라는 뜻. Play로 끝까지 돌려 확인해 보세요.'
            },
            {
                el: '#demo-edu-explain',
                title: '해설 패널',
                body: '슬라이더와 버튼을 조작할 때마다 여기에 "지금 일어난 일"이 쉬운 말로 표시됩니다. ' +
                    '이제 자유롭게 실험해 보세요!'
            }
        ]
    },

    // ==========================================
    // Frequency Capping Simulator (입문)
    // ==========================================
    'frequency-capping': {
        analogy: '같은 광고도 다섯 번째부터는 그냥 스쳐 지나간다 — 추가 반응이 비용보다 작아지면 멈출 때',
        anchor: '.fc-controls',
        embedKeep: ['.fc-controls'],
        embedHide: ['.demo-prereq', '.demo-tldr-analogy', '.demo-intro', '.demo-steps', '.fc-intro', '.demo-tldr', '.demo-next', '.demo-practice'],
        explain: {
            '#fc-p0': ({ value, prev }) =>
                `첫 노출 반응률을 <strong>${(prev * 100).toFixed(1)}% → ${(value * 100).toFixed(1)}%</strong>로 ${value > prev ? '올렸' : '내렸'}어요. ` +
                `모든 노출의 한계 반응이 함께 ${value > prev ? '커져서, 비용선을 넘는 노출이 늘어 <strong>최적 cap이 커집니다</strong>' : '작아져서, 일찍 비용이 반응을 앞질러 <strong>최적 cap이 작아집니다</strong>'}.`,
            '#fc-r': ({ value, prev }) =>
                `피로 감쇠 r를 <strong>${prev.toFixed(2)} → ${value.toFixed(2)}</strong>로 바꿨어요. ` +
                `${value > prev ? '1.0에 가까워질수록 반응이 <strong>천천히 식는</strong>(피로가 약한) 광고 — 더 여러 번 보여줄 가치가 생깁니다' : '값이 작아질수록 반응이 <strong>빨리 식는</strong>(피로가 강한) 광고 — 최적 cap이 왼쪽으로 이동합니다'}.`,
            '#fc-value': ({ value, prev }) =>
                `전환 1건의 가치를 <strong>${prev} → ${value}달러</strong>로 ${value > prev ? '올렸' : '내렸'}어요. ` +
                `${value > prev ? '비싼 상품일수록 식어가는 작은 반응도 돈이 되니, 같은 사람에게 <strong>몇 번 더</strong> 보여줄 가치가 있습니다' : '전환 가치가 낮으면 몇 번만 보여주고 멈추는 게 이득입니다'}.`,
            '#fc-cost': ({ value, prev }) =>
                `노출당 비용을 <strong>${prev.toFixed(2)} → ${value.toFixed(2)}달러</strong>로 ${value > prev ? '올렸' : '내렸'}어요. ` +
                `${value > prev ? '비싼 지면일수록 <strong>짧고 굵게</strong> — 한계 반응이 비용 아래로 빨리 떨어져 최적 cap이 작아집니다' : '노출이 싸지면 식은 반응도 비용을 넘기 쉬워 최적 cap이 커집니다'}. 오른쪽 차트의 점(●)이 어디로 갔는지 보세요.`,
            '.fc-preset-btn': ({ el }) =>
                `<strong>${el.textContent.trim()}</strong> 프리셋을 적용했어요. ` +
                '두 차트가 함께 바뀝니다 — 왼쪽 막대가 식는 속도, 오른쪽 봉우리(최적 cap)의 위치를 기본값과 비교해 보세요.'
        },
        tour: [
            {
                el: '.fc-chart-card',
                title: '광고 피로를 눈으로',
                body: '막대 하나가 "k번째 노출이 만드는 <strong>추가</strong> 반응"이에요. ' +
                    '뒤로 갈수록 빠르게 줄어드는 것 — 이게 광고 피로입니다.'
            },
            {
                el: '.fc-chart-card:last-child',
                title: '역U자 곡선과 최적점',
                body: 'cap을 늘리면 순가치가 오르다가 <strong>정점을 지나 떨어집니다</strong>. ' +
                    '추가 반응의 가치가 노출 비용보다 작아지는 순간부터 손해거든요. 점(●)이 그 최적 cap이에요.'
            },
            {
                el: '#fc-cost',
                title: '직접 움직여보기',
                body: '<strong>노출당 비용</strong> 슬라이더를 올려보세요. 점(●)이 왼쪽으로 이동하는 걸 볼 수 있어요.',
                waitFor: 'input'
            },
            {
                el: '.fc-metrics',
                title: '숫자로 읽기',
                body: '최적 cap, 그때의 유저당 순가치, 그리고 <strong>cap 없이 무제한 노출했을 때 대비 이득</strong>이 ' +
                    '여기 요약됩니다. 프리셋 버튼으로 여러 상황을 비교해 보세요.'
            },
            {
                el: '#demo-edu-explain',
                title: '해설 패널',
                body: '슬라이더와 프리셋을 조작할 때마다 여기에 "지금 일어난 일"이 표시됩니다. ' +
                    '이제 자유롭게 실험해 보세요!'
            }
        ]
    },

    // ==========================================
    // Multi-Auction Portfolio Optimization (고급)
    // ==========================================
    'portfolio': {
        analogy: '여러 가게에 예산 나누기 — 마지막 1원의 이익이 모든 가게에서 같아질 때 전체 이익 최대',
        anchor: '.po-top-controls',
        embedKeep: ['.po-top-controls'],
        embedHide: ['.demo-prereq', '.demo-tldr-analogy', '.demo-intro', '.demo-steps', '.po-intro', '.demo-tldr', '.demo-next', '.demo-practice'],
        explain: {
            '#btn-equal': () =>
                '총 예산 500달러를 5개 지면에 <strong>100달러씩 균등</strong>하게 나눴어요. 나쁘지 않지만 최적은 아닙니다 — ' +
                '지면마다 가치(V)와 포화 속도(K)가 다르니까요. 지금의 Total Profit을 기억해 두세요.',
            '#btn-greedy': () =>
                '가치가 가장 높은 <strong>Slot A에 전부</strong> 몰았어요. 그런데 Total Profit이 오히려 줄지 않았나요? ' +
                '한 지면에 계속 부으면 포화 때문에 <strong>마지막 예산의 추가 이익이 0에 가까워집니다</strong>. ' +
                '다른 지면의 초반 큰 기울기를 통째로 버린 셈이에요.',
            '#btn-optimize': () =>
                '<strong>등한계효용</strong> 분배를 찾았어요 — 모든 지면에서 "마지막 1달러의 추가 이익(Marginal)"이 ' +
                '같아지는 지점입니다. 각 카드의 <strong>Marginal 값이 거의 같아진 것</strong>을 확인해 보세요. ' +
                '어디서 1달러를 빼 어디에 더해도 이익이 늘지 않는 상태 — 이보다 나은 분배는 없습니다.',
            '#btn-reset': () =>
                '모든 예산을 회수해 0으로 돌렸어요. 이제 슬라이더로 직접 나눠 보세요 — ' +
                'Total Profit을 자동 최적화 결과("최적 대비"가 최적이 되는 지점)에 얼마나 가깝게 만들 수 있나요?',
            '.po-slot-slider': ({ value, prev, el }) => {
                const name = 'ABCDE'[+el.dataset.slotIdx] || '?';
                return `Slot ${name}의 예산을 <strong>${Math.round(prev)} → ${Math.round(value)}달러</strong>로 바꿨어요. ` +
                    `카드의 <strong>Marginal</strong>이 이 지면에서 마지막 1달러가 벌어주는 추가 이익입니다 — ` +
                    `다른 지면보다 낮다면 그 돈은 다른 곳에 쓰는 게 이득이에요. 합계가 총 예산 500달러를 넘지 않게 조절하세요.`;
            }
        },
        tour: [
            {
                el: '.po-slots',
                title: '성격이 다른 5개의 지면',
                body: '각 지면은 <strong>가치(V)</strong>와 <strong>포화 속도(K)</strong>가 달라요. ' +
                    '비싸지만 금방 포화되는 곳, 싸지만 용량이 큰 곳 — 어디에 얼마를 줄지가 이 데모의 문제입니다.'
            },
            {
                el: '#btn-greedy',
                title: '직관을 시험해보기',
                body: '"제일 좋은 데 몰아주면 되지 않나?" — <strong>고가치 몰빵</strong> 버튼을 눌러 확인해 보세요.',
                waitFor: 'click'
            },
            {
                el: '.po-summary',
                title: '몰빵의 성적표',
                body: 'Total Profit과 <strong>최적 대비</strong>를 보세요. 몰빵은 최적 분배보다 한참 적게 법니다. ' +
                    '포화된 지면의 마지막 예산은 거의 일을 안 하거든요.'
            },
            {
                el: '#btn-optimize',
                title: '정답 보기',
                body: '<strong>자동 최적화</strong>를 눌러보세요. 모든 슬롯 카드의 Marginal이 같아지는 균형 분배를 찾아줍니다.',
                waitFor: 'click'
            },
            {
                el: '#demo-edu-explain',
                title: '해설 패널',
                body: '버튼과 슬라이더를 조작할 때마다 여기에 "지금 일어난 일"이 표시됩니다. ' +
                    '슬라이더만으로 자동 최적화에 도전해 보세요!'
            }
        ]
    }

};
