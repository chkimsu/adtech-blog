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
                body: '<strong>10일 자동 ▸▸</strong>을 눌러 보세요. 하루 150명씩, 열흘짜리 캠페인이 자동으로 진행됩니다.',
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
                body: '<strong>▸ 1 Round</strong>를 눌러 보세요. 두 알고리즘이 동시에 각자의 선택을 합니다.',
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
                  '물음표로 가려집니다. 벽돌색 점선(관측 데이터만으로 한 추정)이 실제보다 왼쪽에 있죠 — 시장가를 과소추정하는 거예요.'
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
                body: '이 유저는 전환(▲)까지 Display → Search → Social → Email 순서로 광고를 만났어요. ' +
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
                `${value > prev ? '비싼 지면일수록 <strong>짧고 굵게</strong> — 한계 반응이 비용 아래로 빨리 떨어져 최적 cap이 작아집니다' : '노출이 싸지면 식은 반응도 비용을 넘기 쉬워 최적 cap이 커집니다'}. 오른쪽 차트의 표시점이 어디로 갔는지 보세요.`,
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
                    '추가 반응의 가치가 노출 비용보다 작아지는 순간부터 손해거든요. 표시점이 그 최적 cap이에요.'
            },
            {
                el: '#fc-cost',
                title: '직접 움직여보기',
                body: '<strong>노출당 비용</strong> 슬라이더를 올려보세요. 표시점이 왼쪽으로 이동하는 걸 볼 수 있어요.',
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
    },

    // ==========================================
    // 요청 경로 시뮬레이터 (입문)
    // ==========================================
    'request-path': {
        analogy: '부품을 하나씩 꺼 보면, 그 부품이 무엇을 막고 있었는지가 보인다',
        anchor: '.rp-controls',
        embedKeep: ['.rp-controls', '.rp-path', '.rp-verdict', '.rp-cost'],
        embedHide: ['.demo-prereq', '.demo-tldr-analogy', '.demo-intro', '.demo-steps', '.rp-intro', '.demo-tldr', '.demo-next', '.demo-practice'],
        explain: {
            // 토글은 <label>이 <input>을 감싸고 있다. 그래서 셀렉터를 체크박스(#rp-lb 등)에
            // 걸면 해설이 한 번도 안 나온다 — 엔진의 click 룰은 input 을 건너뛰고,
            // input 룰은 체크박스의 value 가 늘 "on" 이라 "값이 바뀌었나" 검사를 통과 못 한다.
            // 라벨에 걸면 나오지만, 라벨 글자를 누르면 click 이 두 번 온다(라벨에 한 번,
            // 라벨이 넘겨준 체크박스에 한 번). 앞의 것은 아직 체크가 안 바뀐 시점이라
            // 그대로 쓰면 반대로 말한다. 그래서 이미 말한 상태를 라벨에 적어 두고,
            // 상태가 실제로 바뀐 뒤에만 한 번 말한다.
            '.rp-toggles label': ({ el }) => {
                const input = el.querySelector('input');
                if (!input) return '';
                const said = el.dataset.eduSaid !== undefined ? el.dataset.eduSaid : String(input.defaultChecked);
                if (said === String(input.checked)) return '';
                el.dataset.eduSaid = String(input.checked);
                const on = input.checked;
                switch (input.id) {
                    case 'rp-lb':
                        return on
                            ? 'LB를 켰습니다. 매체는 대표 주소 하나만 알면 되고, 죽은 서버는 LB가 빼 줍니다.'
                            : 'LB를 껐습니다. 매체가 서버 주소를 직접 들고 있어야 하고, <strong>배포하는 동안 그 요청은 사라집니다</strong>.';
                    case 'rp-ingress':
                        return on
                            ? 'Ingress를 켰습니다. 매체가 아는 주소가 <strong>하나</strong>로 줄고, 대상 그룹 설정도 한 벌이면 됩니다.'
                            : 'Ingress를 껐습니다. 서비스마다 대표 주소와 대상 그룹 설정이 하나씩 필요해집니다. 서비스가 2개 이상이면 요청이 여기서 멈춥니다.';
                    case 'rp-gateway':
                        return on
                            ? 'API Gateway를 켰습니다. 인증·쿼터를 <strong>한 곳에서</strong> 처리합니다.'
                            : 'API Gateway를 껐습니다. 같은 정책을 서비스마다 따로 구현해야 하고, 정책이 바뀌면 그만큼 배포합니다.';
                    case 'rp-mesh':
                        return on
                            ? '서비스 메시를 켰습니다. 재시도·타임아웃·추적을 코드 없이 얻는 대신, 요청마다 사이드카 지연이 붙습니다.'
                            : '서비스 메시를 껐습니다. 사이드카 지연이 0이 됩니다.';
                    default:
                        return '';
                }
            },
            '#rp-svc': ({ value, prev }) =>
                `서비스를 <strong>${prev}개 → ${value}개</strong>로 바꿨습니다. ` +
                (value > 1
                    ? '2개가 넘는 순간부터 경로로 갈라 줄 수단이 필요합니다 — Ingress를 꺼 보면 요청이 거기서 멈춥니다.'
                    : '1개면 Ingress 없이도 요청이 지나갑니다. 갈라 줄 것이 없으니까요.'),
            '#rp-media': ({ value, prev }) =>
                `매체를 <strong>${prev}곳 → ${value}곳</strong>으로 바꿨습니다. ` +
                (value > 1
                    ? '2곳이 넘는 순간부터 누가 보냈는지 확인하고 초당 허용량을 걸 자리가 필요합니다 — API Gateway를 꺼 보면 요청이 거기서 멈춥니다.'
                    : '1곳이면 API Gateway 없이도 요청이 지나갑니다. 나눠 걸 일이 없으니까요.'),
            '#rp-fire': () =>
                document.querySelector('#rp-verdict.is-stop')
                    ? '요청 한 건을 보냈습니다. 칸이 순서대로 켜지다가 <strong>✕ 표시된 칸에서 멈춥니다</strong> — 그 뒤 칸에는 요청이 오지 않습니다.'
                    : '요청 한 건을 보냈습니다. 칸이 순서대로 켜지며 <strong>bidder까지 도착</strong>합니다.'
        },
        tour: [
            {
                el: '.rp-path',
                title: '요청이 지나는 길',
                body: '매체가 보낸 입찰 요청 한 건이 왼쪽에서 오른쪽으로 지나갑니다. ' +
                    '<strong>✓</strong>는 지나간 칸, <strong>–</strong>는 지금 구성에서는 없어도 되는 칸입니다.'
            },
            {
                el: '.rp-toggles',
                title: '부품을 하나 꺼 보기',
                body: '<strong>Ingress</strong>를 꺼 보세요. 서비스가 4개인 채로 끄면 요청이 어디서 멈추는지 바로 보입니다.',
                waitFor: 'input'
            },
            {
                el: '.rp-cost',
                title: '일은 사라지지 않는다',
                body: '부품을 빼면 그 일이 없어지는 게 아니라 사람 쪽으로 옮겨옵니다. ' +
                    '관리할 주소·설정·정책 벌수에 <strong>▲</strong>가 붙어 늘어난 것을 보세요.'
            },
            {
                el: '#demo-edu-explain',
                title: '해설 패널',
                body: '토글과 슬라이더를 움직일 때마다 여기에 "지금 일어난 일"이 표시됩니다. ' +
                    '이제 자유롭게 꺼 보세요!'
            }
        ]
    },

    // ==========================================
    // Kafka Partition 놀이터 (입문)
    // ==========================================
    'kafka-partition': {
        analogy: 'partition 수가 처리량 상한이고, key가 순서 보장 범위를 정한다',
        anchor: '.kp-controls',
        embedKeep: ['.kp-controls', '.kp-verdict', '.kp-shuffle', '.kp-legend', '.kp-grid'],
        embedHide: ['.demo-prereq', '.demo-tldr-analogy', '.demo-intro', '.demo-steps', '.kp-intro', '.demo-tldr', '.demo-next', '.demo-practice'],
        explain: {
            '#kp-part': ({ value, prev }) => {
                const total = document.querySelectorAll('#kp-grid .kp-rec').length;
                const moved = document.querySelectorAll('#kp-grid .kp-rec.is-moved').length;
                const shuffle = document.querySelector('#kp-shuffle');
                const head = `partition을 <strong>${prev}칸 → ${value}칸</strong>으로 바꿨습니다. `;
                // 칸 수 알림이 숨어 있으면 지금 칸 수가 비교 기준과 같다는 뜻이다.
                // 이때 옮겨간 줄이 0인 것은 우연이 아니라 기준으로 되돌아왔기 때문이므로,
                // 아래의 "우연히 제자리를 지켰다" 를 그대로 쓰면 반대로 말하게 된다.
                if (shuffle && shuffle.hidden) {
                    return head + '비교 기준으로 잡아 둔 칸 수로 되돌아왔습니다. ' +
                        '배정도 기준과 같아져 <strong>↰</strong> 표시가 사라집니다.';
                }
                if (moved) {
                    return head + `같은 ${total}줄인데 <strong>${moved}줄</strong>이 다른 칸으로 옮겨갔습니다(<strong>↰</strong> 표시). ` +
                        '칸 수가 나눗셈에 들어가니, <strong>칸 수를 나중에 바꾸면 그 시점에서 순서 보장이 끊깁니다.</strong>';
                }
                return head + `이번에는 옮겨간 줄이 없습니다. 표본 ${total}줄이 우연히 제자리를 지킨 것이지, 칸 수를 바꿔도 안전하다는 뜻은 아닙니다.`;
            },
            '#kp-cons': ({ value, prev }) => {
                const parts = document.querySelectorAll('#kp-grid .kp-card').length;
                const idle = document.querySelectorAll('#kp-legend .kp-legend-item.is-idle').length;
                return `consumer를 <strong>${prev}명 → ${value}명</strong>으로 바꿨습니다. ` +
                    (idle
                        ? `칸이 ${parts}개뿐이라 <strong>${idle}명은 아무 칸도 못 맡습니다</strong> — 범례에 "맡은 칸 없음"으로 나옵니다. 사람을 더 붙여도 처리량은 그대로입니다.`
                        : `${value}명이 칸 ${parts}개를 나눠 맡았습니다. ` +
                          (value < parts
                              ? '아직 칸이 남아 있어 사람을 더 붙이면 처리량이 늘어납니다.'
                              : '칸 수와 인원이 딱 맞았습니다 — 여기서 더 늘리려면 칸부터 늘려야 합니다.'));
            },
            // 라디오도 <label>이 <input>을 감싸고 있다. 위 .rp-toggles label 과 같은 이유로
            // input 에 직접 걸면 해설이 안 나오고, 라벨에 걸면 라벨 글자를 누를 때 두 번 온다.
            // 앞의 것은 아직 선택이 안 바뀐 시점이라, 이미 말한 값을 fieldset 에 적어 두고
            // 값이 실제로 바뀐 뒤에만 한 번 말한다.
            '.kp-key-row label': ({ el }) => {
                const row = el.closest('.kp-key-row');
                if (!row) return '';
                const inputs = Array.prototype.slice.call(row.querySelectorAll('input[name="kp-key"]'));
                const checked = inputs.filter((i) => i.checked)[0];
                const first = inputs.filter((i) => i.defaultChecked)[0];
                const now = checked ? checked.value : '';
                const said = row.dataset.eduSaid !== undefined ? row.dataset.eduSaid : (first ? first.value : '');
                if (said === now) return '';
                row.dataset.eduSaid = now;
                if (now === 'none') {
                    return 'key를 <strong>없음</strong>으로 바꿨습니다. 줄이 칸에 차례대로 들어가 가장 고르게 퍼집니다. ' +
                        '대신 <strong>같은 요청의 노출과 클릭이 다른 칸으로 흩어져</strong> 순서를 맞출 수 없습니다.';
                }
                if (now === 'ad_id') {
                    return 'key를 <strong>ad_id</strong>로 바꿨습니다. 같은 광고는 늘 같은 칸으로 가서 광고별 집계를 한 칸 안에서 끝낼 수 있습니다. ' +
                        '대신 <strong>4건짜리 인기 광고 9931이 있는 칸만 부풀고</strong>, 그 칸을 맡은 consumer만 밀립니다.';
                }
                return 'key를 <strong>req_id</strong>로 바꿨습니다. 같은 요청의 노출과 클릭이 같은 칸에 모여 순서대로 읽힙니다 — 둘을 이어 붙이기 좋은 상태입니다.';
            },
            '#kp-shuffle-reset': () =>
                '지금 배정을 새 기준으로 삼았습니다. <strong>↰</strong> 표시와 칸 수가 바뀌었다는 알림이 사라지고, ' +
                '이제부터 칸 수를 바꾸면 방금 이 배정과 비교합니다. 옮겨간 줄이 제자리로 돌아온 것은 아닙니다.'
        },
        tour: [
            {
                el: '.kp-grid',
                title: '12줄이 칸에 나뉜 모습',
                body: '칸 하나가 partition 하나입니다. 칸마다 그 칸을 맡은 consumer 이름과 줄 수가 적혀 있어요. ' +
                    '한 칸은 그룹 안에서 <strong>언제나 한 명만</strong> 맡습니다.'
            },
            {
                el: '#kp-cons',
                title: '사람을 늘려 보기',
                body: 'consumer를 칸 수보다 많게 밀어 보세요. 범례에 <strong>"맡은 칸 없음"</strong>이 나타납니다 — ' +
                    '사람을 늘려도 처리량이 안 느는 지점입니다.',
                waitFor: 'input'
            },
            {
                el: '#kp-part',
                title: '칸 수를 바꿔 보기',
                body: 'partition 수를 움직여 보세요. 같은 key가 다른 칸으로 옮겨간 줄에 <strong>↰</strong>가 붙습니다 — ' +
                    '순서 보장이 끊기는 순간입니다.',
                waitFor: 'input'
            },
            {
                el: '#demo-edu-explain',
                title: '해설 패널',
                body: '슬라이더와 key를 바꿀 때마다 여기에 "지금 일어난 일"이 표시됩니다. ' +
                    '이제 자유롭게 돌려 보세요!'
            }
        ]
    },

    // ==========================================
    // 로그 여섯 층 흐름 (입문)
    // ==========================================
    'log-hops': {
        analogy: '홉마다 모양이 바뀌고, 머무는 시간이 무엇을 잃을 수 있는지를 정한다',
        anchor: '.lh-controls',
        embedKeep: ['.lh-flow', '.lh-controls', '.lh-detail', '.lh-scale'],
        explain: {
            // 체크박스 input에 직접 걸면 해설이 안 나온다(demo-edu.js가 click에서
            // input·select·textarea를 걸러내고, checkbox는 change 리스너 자체가 없다).
            // kafka-partition의 '.kp-key-row label'과 같은 이유로 감싸는 label에 걸고,
            // 라벨 텍스트를 눌렀을 때 두 번 오는 것은 dataset로 막는다.
            '#lh-stop-agent-label': ({ el }) => {
                const on = document.getElementById('lh-stop-agent').checked ? '1' : '0';
                if (el.dataset.eduSaid === on) return '';
                el.dataset.eduSaid = on;
                return on === '1'
                    ? '수집 에이전트를 멈췄습니다. 앞단(앱·수집 서버)은 아무 영향을 안 받고 <strong>로컬 파일만 찹니다</strong>. 100GB면 61.7시간을 버팁니다.'
                    : '에이전트를 다시 켰습니다. 쌓인 것을 따라잡는 동안에도 새 줄은 초당 2,665건씩 들어옵니다.';
            },
            '#lh-stop-kafka-label': ({ el }) => {
                const on = document.getElementById('lh-stop-kafka').checked ? '1' : '0';
                if (el.dataset.eduSaid === on) return '';
                el.dataset.eduSaid = on;
                return on === '1'
                    ? 'Kafka를 멈췄습니다. 에이전트가 보낼 곳이 없어 <strong>파일에 그대로 쌓입니다</strong>. 프로세스 안 producer로 직행했다면 메모리 512MB로 10.4분을 버팁니다.'
                    : 'Kafka를 다시 켰습니다.';
            },
            '#lh-batch': ({ value, prev }) => `SDK가 한 번에 보내는 건수를 <strong>${prev} → ${value}건</strong>으로 바꿨습니다. 늘리면 요청 수가 줄지만 앱이 죽을 때 잃는 것이 그만큼 늘어납니다. 클릭만 이 값과 무관하게 즉시 갑니다.`,
        },
    },

    // ==========================================
    // 클릭 여섯 자리 (입문)
    // ==========================================
    'cart-pipeline': {
        analogy: '자리마다 데이터가 밀려 오는지 가지러 가는지가 갈리고, 그게 막혔을 때 어디에 쌓이는지를 정한다',
        anchor: '.cp-rail',
        embedKeep: ['.cp-rail', '.cp-panes', '.cp-what', '.cp-consumers', '.cp-retention'],
        explain: {
            // 자리 버튼과 소비자 칩은 <button> 이라 click 룰이 그대로 걸린다
            // (demo-edu.js 의 click 핸들러는 input·select·textarea 만 거른다).
            // 다만 같은 자리를 다시 눌렀을 때 또 말하지 않게 dataset 으로 막는다.
            '.cp-step': ({ el }) => {
                const i = el.dataset.stage;
                const host = document.getElementById('cp-rail-list');
                if (host.dataset.eduSaid === i) return '';
                host.dataset.eduSaid = i;
                return [
                    '<strong>1번 앱 SDK</strong>입니다. 만드는 것은 85 B 뿐이고 <strong>누가·어디서·어느 캠페인·얼마</strong>가 다 빠져 있습니다. 그 넷이 뒤에서 하나씩 붙습니다.',
                    '<strong>2번 웹서버</strong>입니다. 98 B 가 앞에 붙어 183 B 가 됐습니다. 붙은 것은 전부 <strong>받는 쪽만 아는 값</strong>이에요 — 앱은 자기 요청이 204 를 받았는지 보내는 시점에 모릅니다.',
                    '<strong>3번 수집 에이전트</strong>입니다. 여기가 처음 <strong>가지러 가는</strong> 자리예요. 원문은 message 칸에 한 글자도 안 바뀌고 들어가고, 붙는 것은 봉투 셋뿐입니다.',
                    '<strong>4번 변환기</strong>입니다. 크기는 37 B <strong>줄었는데</strong> 필드가 5개에서 15개가 됐습니다. 바이트로는 줄어든 자리에서 가장 큰 일이 일어납니다.',
                    '<strong>5번 Kafka</strong>입니다. 값은 한 글자도 안 바뀌고 <strong>주소만 붙습니다</strong> — topic·partition·offset. 여기서부터 한 번 쓰이고 여럿이 읽습니다.',
                    '<strong>6번 읽는 쪽 넷</strong>입니다. 아래 칩을 갈아 눌러 보세요. <strong>왼쪽은 그대로인데 오른쪽만 바뀝니다</strong> — 같은 한 줄이 네 결과가 됩니다.'
                ][+i] || '';
            },
            '.cp-chip': ({ el }) => {
                const i = el.dataset.consumer;
                const host = document.getElementById('cp-consumer-list');
                if (host.dataset.eduSaid === i) return '';
                host.dataset.eduSaid = i;
                return [
                    '대시보드는 <strong>건수와 과금액만</strong> 남기고 나머지 12개를 버립니다. 2초 안에 답해야 하니 완벽함보다 속도예요.',
                    '예산 소진 확인은 <code>req_id</code> 를 들고 갑니다. 같은 클릭을 두 번 처리하면 예산이 <strong>364.8원 줄어들기</strong> 때문에, 이미 본 줄인지 확인할 열쇠가 필요합니다.',
                    '광고주 리포트는 <strong>여기 숫자가 그대로 청구서</strong>가 됩니다. 몇 건 빠지면 금액이 안 맞으니, 속도보다 빠짐없이 세는 쪽이 먼저입니다.',
                    '모델 학습은 <code>req_id</code> 로 <strong>노출과 클릭을 이어 붙입니다</strong>. 접속 주소나 응답 코드는 학습에 안 쓰니 뺍니다.'
                ][+i] || '';
            },
            '#cp-keep': ({ value, prev }) =>
                `보존 기간을 <strong>${prev}일 → ${value}일</strong>로 바꿨습니다. ` +
                (+value > +prev
                    ? '늘리면 더 오래 되감을 수 있지만 디스크를 그만큼 더 씁니다. 늘릴 것이 아니라 <strong>가장 늦게 읽는 쪽과 고치는 데 걸리는 시간</strong>을 재서 정합니다.'
                    : '줄이면 되감을 수 있는 창이 좁아집니다. 멈춘 시간을 이 값 너머로 밀어 보면 앞부분이 통째로 사라지는 것이 보입니다.'),
            '#cp-stall': ({ value, prev }) =>
                `예산 소진 확인이 멈춘 시간을 <strong>${prev}시간 → ${value}시간</strong>으로 바꿨습니다. ` +
                (document.querySelector('#cp-verdict.is-lost')
                    ? '보존 창을 넘었습니다. <strong>넘긴 만큼은 이미 지워져</strong> 되감을 수가 없어요. 따라잡는 시간이 더 안 늘어나는 것도 그 때문입니다 — 따라잡을 것 자체가 없습니다.'
                    : '아직 보존 창 안이라 <strong>전부 되감을 수 있습니다</strong>. 처리량이 유입의 76배라 밀린 것을 금방 빨아들입니다.')
        },
        tour: [
            {
                el: '.cp-rail',
                title: '여섯 자리',
                body: '클릭 한 건이 왼쪽에서 오른쪽으로 지납니다. 배지는 그 자리가 데이터를 ' +
                    '<strong>받는</strong> 방법이에요 — 밀려 오는 자리가 셋, 가지러 가는 자리가 둘입니다.'
            },
            {
                el: '.cp-rail-list',
                title: '자리를 눌러 보기',
                body: '<strong>4번 변환기</strong>를 눌러 보세요. 크기는 줄었는데 필드가 5개에서 15개가 됩니다.',
                waitFor: 'click'
            },
            {
                el: '.cp-panes',
                title: '들어온 것과 나간 것',
                body: '왼쪽이 그 자리에 들어온 것, 오른쪽이 나간 것입니다. 줄 앞의 ' +
                    '<strong>+</strong>는 붙은 것, <strong>~</strong>는 바뀐 것, <strong>-</strong>는 사라진 것이에요.'
            },
            {
                el: '.cp-retention',
                title: '며칠 들고 있으면 되나',
                body: '멈춘 시간을 <strong>240시간</strong>까지 밀어 보세요. 보존 7일을 넘는 순간 ' +
                    '앞부분이 지워졌다고 바뀝니다. 보존 기간이 무엇을 사고 무엇을 못 사는지가 거기서 갈립니다.',
                waitFor: 'input'
            }
        ]
    },

// js/demo-edu-content.js 의 window.DEMO_EDU 에 넣을 'metrics-lab' 엔트리.
// 'log-hops' 엔트리 뒤에 쉼표로 이어 붙이면 된다. (이 파일 자체는 조각이다)

    // ==========================================
    // 지표 실험실 (중급)
    // ==========================================
    'metrics-lab': {
        analogy: '전체 AUC 는 쉬운 요청과 어려운 요청을 가르는 능력까지 점수로 쳐 준다 — 경매는 그 능력을 안 쓴다',
        anchor: '.mx-controls',
        embedKeep: ['.mx-controls', '.mx-metrics', '.mx-panels'],
        // ROC 설명문과 프리셋 이름표만 접는다. 요청 카드 설명문은 남긴다 —
        // 보정 배수를 밀었을 때 "숫자는 바뀌었는데 순서는 그대로"라고 말해 주는 줄이다.
        embedHide: ['.mx-note-roc', '.mx-presets-label'],
        explain: {
            '#mx-skill': ({ value, prev }) => {
                const now = (+value * 100).toFixed(1), was = (+prev * 100).toFixed(1);
                return `요청 안 분별력을 <strong>${was}% → ${now}%</strong>로 ` +
                    (+value > +prev ? '올렸' : '내렸') + '습니다. ' +
                    (+value >= 0.7
                        ? '이 슬라이더는 <strong>AUC 와 GAUC 를 같이</strong> 움직입니다. 한 요청 안의 순서가 실제로 좋아졌기 때문이에요 — 경매 결과가 바뀌는 개선은 이쪽입니다.'
                        : +value <= 0.2
                            ? 'GAUC 가 0.5 쪽으로 내려앉습니다. 요청 안에서는 거의 구분하지 못한다는 뜻이에요. 그런데 전체 AUC 는 아직 0.66 근처입니다 — 남은 점수는 전부 지면·요청을 구분하는 능력에서 옵니다.'
                            : '두 지표가 같은 방향으로 움직이는지 보세요. 같이 움직이면 요청 안 순서가 바뀐 것입니다.')
            },
            '#mx-spread': ({ value, prev }) => {
                const now = (+value).toFixed(2), was = (+prev).toFixed(2);
                return `요청 간 난이도 편차를 <strong>${was} → ${now}</strong>로 ` +
                    (+value > +prev ? '키웠' : '줄였') + '습니다. ' +
                    '이건 모델이 아니라 <strong>데이터</strong>를 바꾸는 슬라이더예요. ' +
                    (+value > +prev
                        ? '요청끼리 쉬운·어려운 차이가 벌어지면 <strong>요청을 가로지른 짝</strong>이 맞히기 쉬워집니다. 전체 AUC 만 오르고 GAUC 는 제자리인 것을 보세요 — 두 곡선 사이 면적이 그 몫입니다.'
                        : '요청끼리 비슷해지면 가로지른 짝도 요청 안 짝만큼 어려워집니다. 두 곡선이 붙는 것을 보세요.')
            },
            '#mx-slope': ({ value, prev }) => {
                const now = (+value).toFixed(2), was = (+prev).toFixed(2);
                return `보정 배수를 <strong>${was}× → ${now}×</strong>로 바꿨습니다. ` +
                    (Math.abs(+value - 1) < 0.05
                        ? '1.00 근처면 예측 총합이 실제 클릭 수와 맞습니다. COPC 가 1 근처로 돌아온 것을 보세요.'
                        : '<strong>순위는 한 칸도 안 바뀝니다</strong> — 모든 예측에 같은 수를 곱했으니까요. AUC 와 GAUC 는 그대로인데 ' +
                          (+value > 1
                            ? 'COPC 는 1 아래로 내려갑니다. 예측이 실제보다 커졌다는 뜻이에요. NE 도 1 쪽으로 올라갑니다.'
                            : 'COPC 는 1 위로 올라갑니다. 예측이 실제보다 작아졌다는 뜻이에요 — 과소예측입니다.'))
            },
            '#mx-slots': ({ value, prev }) =>
                `요청당 광고 수를 <strong>${prev}개 → ${value}개</strong>로 바꿨습니다. ` +
                `자리가 늘면 한 요청이 만드는 짝이 늘고, 클릭이 0건이라 버려지는 요청이 줄어듭니다. ` +
                `자리당 CTR 2.5% 기준으로 버려지는 비율은 0.975 의 ${value}제곱, 즉 ` +
                `<strong>${(Math.pow(0.975, +value) * 100).toFixed(1)}%</strong>입니다. 지표 칸 아래 줄에서 실제 비율을 확인해 보세요.`,
            '[data-mx-preset="0.494,1.4,1,5"]': () =>
                '<strong>요청 간 편차 ▲</strong> — 데이터만 바꿨습니다. 모델은 그대로예요. ' +
                '전체 AUC 는 0.83 대로 뛰는데 GAUC 는 0.62 대에 머뭅니다. ' +
                '오른 0.09 는 전부 "이 요청이 저 요청보다 쉽다"를 맞힌 몫입니다 — 경매는 그 판단을 안 씁니다.',
            '[data-mx-preset="0.494,0,1,5"]': () =>
                '<strong>요청 간 편차 0</strong> — 모든 요청이 똑같이 어렵습니다. ' +
                '전체 AUC 0.6115 와 GAUC 0.6133 이 거의 같아집니다. ' +
                '가로지른 짝이 요청 안 짝만큼 어려워졌으니 둘을 나눌 이유가 사라진 것이죠. 두 곡선이 포개집니다.',
            '[data-mx-preset="0.75,0.915,1,5"]': () =>
                '<strong>분별력 ▲</strong> — 이번에는 모델이 좋아졌습니다. ' +
                'AUC 0.7776, GAUC 0.6818 로 <strong>둘 다</strong> 올랐어요. ' +
                '배포 판단에서 보고 싶은 모습이 이것입니다. GAUC 가 안 따라오면 매출은 안 움직입니다.',
            '[data-mx-preset="0.494,0.915,3,5"]': () =>
                '<strong>예측 ×3</strong> — 순위 지표는 넷째 자리만 흔들립니다(0.99 에서 잘린 예측이 동점을 만들어서예요). ' +
                '그 사이 NE 는 1.2535, COPC 는 0.342 가 됩니다. NE 가 1을 넘었다는 건 ' +
                '<strong>기저 CTR 만 답하는 상수 모델보다 못하다</strong>는 뜻이라 즉시 중단 대상입니다.',
            '[data-mx-preset="0.494,0.915,1,5"]': () =>
                '<strong>기본값</strong>으로 돌아왔습니다. AUC 0.7413 · GAUC 0.6177 · NE 0.9303 · COPC 1.002. ' +
                '글 1절 배포 표의 기존 모델 자리(AUC 0.7412 · GAUC 0.6180) 근처에 맞춰 둔 값입니다.',
            '#mx-req-next': () =>
                '다른 요청을 뽑았습니다. 클릭이 0건인 요청이 나오면 아래 칸이 "짝을 하나도 못 만든다"고 말합니다 — ' +
                '그런 요청이 이 표본의 89% 입니다. GAUC 는 남은 11% 로만 계산됩니다.'
        },
        tour: [
            {
                el: '.mx-metrics-grid',
                title: '다섯 숫자를 한 화면에서',
                body: '같은 표본 하나에서 나온 값입니다. 오른쪽 위 배지는 글 8절 배포 게이트를 그대로 옮긴 것이고, ' +
                    '전체 AUC 만 문턱 없이 "기록만"입니다.'
            },
            {
                el: '#mx-spread',
                title: '데이터를 바꿔 봅니다',
                body: '<strong>요청 간 난이도 편차</strong> 슬라이더를 오른쪽으로 밀어 보세요. 모델은 하나도 안 건드립니다.',
                waitFor: 'input'
            },
            {
                el: '.mx-chart',
                title: '두 곡선이 갈라진다',
                body: '위 실선(전체 ROC)만 바깥으로 부풀고 아래 점선(요청 안 ROC 평균)은 거의 그대로입니다. ' +
                    '그 사이 면적이 <strong>요청을 가로지른 짝</strong>이 만든 몫이에요. 경매는 그 짝을 쓰지 않습니다.'
            },
            {
                el: '#mx-slope',
                title: '이번에는 크기만 밀어 봅니다',
                body: '<strong>보정 배수</strong>를 움직여 보세요. 모든 예측에 같은 수를 곱하는 것이라 순위는 안 바뀝니다.',
                waitFor: 'input'
            },
            {
                el: '.mx-req',
                title: '요청 하나 안에서는',
                body: '숫자는 바뀌었는데 순서는 그대로인 것을 여기서 확인할 수 있습니다. ' +
                    '<strong>다음 요청 ▸</strong>을 눌러 클릭이 0건인 요청도 보세요 — GAUC 가 버리는 요청입니다.'
            },
            {
                el: '#demo-edu-explain',
                title: '해설 패널',
                body: '슬라이더를 밀 때마다 "지금 무엇이 왜 움직였나"가 여기 나옵니다. 자유롭게 실험해 보세요.'
            }
        ]
    },

// ===================================================================
// js/demo-edu-content.js 의 window.DEMO_EDU 에 넣을 조각.
// 'calibration' 엔트리 옆(또는 뒤)에 아래 한 덩어리를 그대로 붙인다.
// 이 파일 자체는 어디서도 로드하지 않는다 — 옮겨 붙이기용 조각이다.
// ===================================================================

    // ==========================================
    // 성향점수 가중 실험실 (중급)
    // ==========================================
    'ips-weights': {
        analogy: '겹친 건 2,595건 중 52건이 가중치의 3분의 1을 쥐고 있다 — 그래서 10,000건짜리 로그가 339건 몫이 된다',
        anchor: '.ipw-controls',
        embedKeep: ['.ipw-controls', '.ipw-metrics', '.ipw-verdict', '.ipw-charts'],
        embedHide: ['.ipw-presets', '.ipw-row-clip', '.ipw-row-qacc', '.ipw-card-est'],
        explain: {
            '#ipw-eps': ({ value, prev }) => {
                const S = [0.02, 0.05, 0.10, 0.20, 0.35, 0.50, 1.00];
                const now = S[value], was = S[prev];
                return `옛 정책의 탐색 비율을 <strong>${was.toFixed(2)} → ${now.toFixed(2)}</strong>로 바꿨어요. ` +
                    `후보 8개니까 최소 선택 확률은 ${(now / 8).toFixed(4)}이고, ` +
                    `<strong>가중치 상한은 8 ÷ ${now.toFixed(2)} = ${Math.round(8 / now)}배</strong>가 됩니다. ` +
                    (now < was
                        ? '탐색을 줄이면 겹치기 어려운 건이 더 무거워져요. 오른쪽 꼬리 막대가 자라고 유효표본 ESS가 내려앉습니다.'
                        : '탐색을 늘리면 어떤 후보든 뽑힐 확률이 올라 가중치가 평평해집니다. ESS가 커지는 대신 오늘의 성적을 그만큼 내줘요.');
            },
            '#ipw-dist': ({ value, prev }) =>
                `정책 거리를 <strong>${(+prev).toFixed(2)} → ${(+value).toFixed(2)}</strong>로 바꿨어요. ` +
                (value > prev
                    ? '새 정책이 옛 정책과 더 많이 갈립니다. 겹치는 건이 줄고, 남은 건 하나가 짊어지는 몫이 커져요. ' +
                      '<strong>잴 값어치는 커지는데 잴 재료는 줄어드는 자리</strong>입니다.'
                    : '새 정책이 옛 정책 쪽으로 다가갑니다. 겹침률도 ESS도 같이 오릅니다. ' +
                      '대신 진짜 값이 옛 정책 값에 붙어요 — 안 새로운 정책은 잴 것도 없다는 뜻입니다.'),
            '#ipw-clip': ({ value, prev }) => {
                const S = [5, 10, 20, 40, 80, 160, 400, Infinity];
                const name = (v) => (v === Infinity ? '절단 없음' : 'M=' + v);
                const now = S[value], was = S[prev];
                return `가중치 상한을 <strong>${name(was)} → ${name(now)}</strong>로 바꿨어요. ` +
                    (now < was
                        ? '상한을 넘는 건이 상한 값으로 눌립니다. 400주 표준편차가 눈에 띄게 줄어드는 대신, ' +
                          '<strong>IPS 평균이 아래로 내려앉아요</strong> — 잘라 낸 몫이 아무 데도 안 더해지기 때문입니다. ' +
                          'SNIPS는 분모(가중치 합)도 같이 줄어 그 몫이 대부분 돌아옵니다. 두 줄의 차이를 보세요.'
                        : '누르는 힘이 약해집니다. 큰 가중치가 다시 살아나 편향은 줄고 구간은 넓어져요.');
            },
            '#ipw-qacc': ({ value, prev }) =>
                `보상 모델 정확도를 <strong>${(+prev).toFixed(2)} → ${(+value).toFixed(2)}</strong>로 바꿨어요. ` +
                (value < 0.5
                    ? '모델이 후보를 구분하지 못하고 지면 평균만 내놓는 상태에 가깝습니다. ' +
                      '보상 모델만 쓰는 추정(DM)은 크게 빗나가는데, <strong>DR의 400주 평균은 버팁니다</strong> — 성향점수가 맞기 때문이에요.'
                    : '보상 모델이 진짜 CTR에 가까워집니다. DR의 앞항이 정확해지고 뒷항의 잔차가 작아져, ' +
                      '큰 가중치가 곱해질 값 자체가 줄어듭니다.'),
            '[data-ipw-preset="0.1,1,7,1"]': () =>
                '<strong>글의 설정</strong>으로 돌아왔어요. 겹친 건 2,595건(25.9%) · 가중치 합 9,681 · 최대 가중치 80 · ESS 339입니다. ' +
                '이번 주 Replay는 3.314%, IPS는 1.669%인데 진짜 값은 2.807%예요. 한 주짜리 추정치는 이만큼 흔들립니다.',
            '[data-ipw-preset="0.02,1,7,1"]': () =>
                '<strong>탐색을 2%로</strong> 줄였어요. 최소 선택 확률이 0.0025가 되어 가중치 상한이 400배로 뜁니다. ' +
                '꼬리 막대가 새로 자라고 ESS가 세 자리 아래로 내려가요. 오늘의 성적은 지켰는데 다음 판정이 어려워진 상태입니다.',
            '[data-ipw-preset="0.2,1,7,1"]': () =>
                '<strong>탐색을 20%로</strong> 늘렸어요. 가중치 상한이 40으로 반토막 나고 ESS가 크게 오릅니다. ' +
                '대신 요청의 20%를 무작위로 돌린 값이라, 오늘의 CTR을 그만큼 내준 결과예요.',
            '[data-ipw-preset="0.1,1,2,1"]': () =>
                '<strong>실무 기본값</strong>입니다. 상한 20에 자기정규화를 같이 걸었어요. ' +
                '표의 <strong>400주 평균</strong> 열에서 IPS 줄과 SNIPS 줄을 비교해 보세요. 같은 절단인데 IPS는 2.13%로 밀려 있고 ' +
                'SNIPS는 2.91%로 진짜 값 2.807% 근처를 지킵니다. 분모(가중치 합)가 같이 줄었기 때문입니다.',
            '[data-ipw-preset="0.1,0.3,7,1"]': () =>
                '<strong>두 정책이 비슷한</strong> 상태예요. 겹침률이 크게 오르고 구간이 좁아집니다. ' +
                '그런데 진짜 값도 옛 정책 값 쪽으로 내려왔어요. 잘 재지는데 잴 만한 차이가 없는 자리입니다.',
            '[data-ipw-preset="0.1,1,7,0"]': () =>
                '<strong>보상 모델이 지면 평균만</strong> 내놓는 상태로 바꿨어요. DR의 앞항이 통째로 틀립니다. ' +
                '그래도 400주 평균은 진짜 값 근처를 지켜요. 성향점수와 보상 모델 중 <strong>하나만 맞으면 된다</strong>는 것이 DR의 성질입니다.'
        },
        tour: [
            {
                el: '.ipw-metrics',
                title: '먼저 볼 숫자 넷',
                body: '왼쪽부터 두 정책이 같은 광고를 고른 건수, 가중치 합, 최대 가중치, 그리고 유효표본 ESS예요. ' +
                    '겹친 건은 <strong>2,595건</strong>인데 ESS는 <strong>339건</strong>입니다. 이 둘이 다른 수라는 것이 이 데모의 전부입니다.'
            },
            {
                el: '.ipw-card-weights',
                title: '가중치가 몰린 자리',
                body: '막대 길이는 건수가 아니라 그 구간이 쥔 <strong>가중치 합</strong>이에요. ' +
                    '가장 아래 점선 막대를 보세요. 52건이 전체 가중치의 3분의 1을 쥐었는데 그 안에 클릭이 하나도 없습니다.'
            },
            {
                el: '#ipw-eps',
                title: '탐색을 줄여 보기',
                body: '탐색 비율 슬라이더를 <strong>왼쪽으로</strong> 밀어 보세요. 가중치 상한이 8 ÷ ε로 커지고 꼬리가 자랍니다.',
                waitFor: 'input'
            },
            {
                el: '.ipw-card-est',
                title: '네 추정치 읽는 법',
                body: '주황 네모가 이번 주 값이고, 파란 띠는 같은 조건의 지난주를 400번 다시 뽑은 평균과 표준편차예요. ' +
                    '<strong>띠가 진짜 값(세로 점선)을 품으면 편향이 없다</strong>는 뜻이고, 띠가 넓으면 한 주로는 판단하지 못한다는 뜻입니다.'
            },
            {
                el: '[data-ipw-preset="0.1,1,2,1"]',
                title: '절단을 걸어 보기',
                body: '<strong>실무 기본값</strong> 버튼을 눌러 보세요. 상한 20을 걸면 띠가 좁아지는 대신 IPS 줄의 400주 평균이 왼쪽으로 밀립니다. SNIPS 줄은 제자리를 지킵니다.',
                waitFor: 'click'
            },
            {
                el: '#demo-edu-explain',
                title: '해설 패널',
                body: '조작할 때마다 "지금 일어난 일"이 여기 나옵니다. 정책 거리와 보상 모델 정확도도 움직여 보세요.'
            }
        ]
    },

// ===================================================================
// window.DEMO_EDU 에 넣을 'feedback-loop' 엔트리 하나.
// js/demo-edu-content.js 의 객체 안에 이 블록을 그대로 붙여 넣으면 된다
// (다른 엔트리와 같은 들여쓰기 4칸, 뒤에 쉼표 유지).
//
// 짝: demo-feedback-loop.html · js/feedback-loop-demo.js · posts/feedback-loop-bias.md
// ===================================================================

    // ==========================================
    // 피드백 루프 시뮬레이터 (중급)
    // ==========================================
    'feedback-loop': {
        analogy: '어제 모델이 오늘의 학습 데이터를 골랐다 — 한 번 밀려난 광고는 추정값이 얼고, 그 언 값이 내일 순위를 다시 정한다',
        anchor: '.fb-controls',
        embedKeep: ['.fb-container'],
        // '.fb-hero' 를 반드시 여기 적어야 한다 — embedKeep 의 '.fb-container' 가 히어로 안에도
        // 있어서, 엔진의 '그 셀렉터를 품고 있으면 남긴다' 판정이 히어로까지 남긴다(실측 175px).
        embedHide: ['.fb-hero', '.demo-prereq', '.demo-intro', '.demo-steps', '.fb-model', '.fb-measure', '.fb-tail-note', '.demo-tldr', '.demo-practice', '.demo-next'],
        explain: {
            '#fb-eps': ({ value, prev }) => {
                const N = +document.getElementById('fb-n').value;
                const nAds = +document.getElementById('fb-ads').value;
                const slot = document.getElementById('fb-mode').value === 'slot';
                const pool = Math.floor(N * value / 100);
                if (+value === 0) {
                    return '탐색 예산을 <strong>' + prev + '% → 0%</strong>로 내렸어요. 이제 배분을 정하는 값은 추정 CTR 순위 하나뿐입니다. ' +
                        '추정 5위부터는 그날 노출이 0건이고, 0건이면 로그가 0줄이라 그 광고의 추정값이 그날 값에서 멈춥니다.';
                }
                return '탐색 예산을 <strong>' + prev + '% → ' + value + '%</strong>로 올렸어요. ' +
                    '세대당 ' + N.toLocaleString('ko-KR') + '건 중 <strong>' + pool.toLocaleString('ko-KR') + '건</strong>을 순위와 무관하게 떼어 둡니다' +
                    (slot
                        ? ' — 이번 세대 0건인 광고들에게만 나눠 주므로 밀려난 광고 하나가 받는 몫이 큽니다.'
                        : ' — 광고 ' + nAds + '개에 똑같이 나누니 광고당 ' + Math.floor(pool / nAds).toLocaleString('ko-KR') + '건입니다.') +
                    ' 표본이 다시 들어오면 언 추정값이 움직이기 시작해요.';
            },
            '#fb-mode': ({ value }) => value === 'slot'
                ? '탐색 예산을 <strong>0건 광고에만</strong> 몰아 줍니다(강제 슬롯). 밀려난 광고 하나가 받는 표본이 커서 언 값을 빨리 뒤집어요. ' +
                  '글의 판에서는 8%(1,600건)를 밀려난 넷에 400건씩 줘서 <strong>3세대</strong>에 <code>9931</code>이 돌아옵니다.'
                : '탐색 예산을 <strong>모든 광고에 똑같이</strong> 흩뿌립니다(ε 탐색). 이미 잘 도는 광고에도 몫이 가서 밀려난 광고가 받는 표본은 작아요. ' +
                  '글의 판에서는 5%(1,000건)를 여덟에 125건씩 나눠 <code>9931</code> 복귀에 <strong>8세대</strong>가 걸립니다.',
            '#fb-n': ({ value, prev }) => {
                const k = Math.ceil(+value / 6000), kPrev = Math.ceil(+prev / 6000);
                return '세대당 노출을 <strong>' + (+prev).toLocaleString('ko-KR') + '건 → ' + (+value).toLocaleString('ko-KR') + '건</strong>으로 바꿨어요. ' +
                    '광고당 상한이 6,000건이라 노출 자리가 <strong>' + kPrev + '개에서 ' + k + '개</strong>로 바뀝니다. ' +
                    '자리 밖으로 밀리는 순간 로그가 끊기니, 자리가 몇 개인지가 굳음의 경계를 정합니다.';
            },
            '#fb-prior': ({ value, prev }) => +value === 0
                ? '낙관 초기값을 <strong>껐습니다</strong>. 추정 CTR 이 다시 <code>(누적 클릭+1) ÷ (누적 노출+2)</code>가 되어, 노출이 없는 광고는 낮은 값에 그대로 머뭅니다.'
                : '아직 안 본 광고를 <strong>CTR ' + (+value).toFixed(1) + '%</strong>라고 우기고 시작합니다(의사노출 2,000건). ' +
                  '진짜 CTR 사다리의 꼭대기(2.60%)보다 높은 값이라 안 본 광고가 위로 올라오고, 노출을 받으면 값이 진짜 쪽으로 내려옵니다. ' +
                  (prev === 0 ? '' : '사전평균을 ' + (+prev).toFixed(1) + '% 에서 옮겼어요. ') +
                  '글의 판에서는 3.5% 로 두면 3세대에 <code>9931</code>이 돌아오고 40세대 클릭이 18,546건입니다.',
            '.fb-check': ({ el }) => {
                const on = el.querySelector('input').checked;
                const win = document.getElementById('fb-win').value === '7' ? '최근 7세대' : '전체 이력';
                return on
                    ? 'IPS 재가중을 <strong>켰습니다</strong>(창: ' + win + '). 광고마다 1÷성향점수를 가중해 "모두 똑같이 띄웠다면 나왔을 평균 CTR"을 되찾으려는 계산이에요. ' +
                      '<strong>배분은 하나도 바뀌지 않습니다</strong> — 측정만 바뀝니다. 아래 "성향점수 0인 광고" 칸을 같이 보세요. ' +
                      '그 값이 0보다 크면 1÷0 이 생겨 그 광고들은 계산에서 통째로 빠집니다.'
                    : 'IPS 재가중을 <strong>껐습니다</strong>. 이제 "로그 그대로" 값만 남습니다. 고리가 CTR 높은 광고만 남겼기 때문에 이 값은 진짜 값보다 위로 떠 있어요.';
            },
            '#fb-win': ({ value }) => value === '0'
                ? '측정 창을 <strong>전체 이력</strong>으로 바꿨어요. 1세대의 균등 배분 500건이 창에 들어오므로 성향점수 0인 광고가 사라집니다. ' +
                  '대신 노출 500건짜리 광고의 가중치가 234,500건짜리의 469배가 되어, IPS 값이 오히려 진짜 값 아래로 끌려갑니다(글의 판에서 1.880%). ' +
                  '성향점수를 <strong>사후 관측된 노출 비율</strong>로 채우면 생기는 일이에요.'
                : '측정 창을 <strong>최근 7세대</strong>로 바꿨어요. 실무 학습이 쓰는 창입니다. 굳은 뒤라면 이 창에는 밀려난 광고의 줄이 아예 없습니다 — ' +
                  '그래서 성향점수가 0이 되고, IPS 가 고칠 수 있는 폭이 거의 사라집니다.',
            '#fb-ads': ({ value }) => '광고 수를 <strong>' + value + '개</strong>로 바꿔 판을 처음부터 다시 시작했습니다. ' +
                (value === '12'
                    ? '노출 자리는 그대로인데 후보만 늘었으니, 자리 밖으로 밀리는 광고가 더 많아집니다.'
                    : '<code>9931</code>~<code>9938</code> — 글이 쓰는 판과 같은 구성입니다.'),
            '#fb-seed': ({ value }) => '시드를 <strong>' + value + '</strong>로 바꿔 판을 처음부터 다시 시작했습니다. ' +
                '시드 하나는 운 한 판이에요. 글에서 시드 100판을 돌려 보니 진짜 1위가 2세대에 밀려난 판이 12판, ' +
                '그중 40세대까지 못 돌아온 판이 6판이었습니다. <strong>37</strong>이 글이 쓰는 판입니다.',
            '#fb-step': () => '한 세대를 돌렸습니다. 이 세대의 배분은 <strong>어제까지</strong> 쌓인 로그로만 정했고, 방금 나온 클릭은 <strong>내일</strong> 배분에 쓰입니다. ' +
                '오른쪽 막대에서 "언 값"이라고 붙은 줄을 보세요 — 이번 세대에 노출이 0건이라 추정값이 한 칸도 안 움직인 광고입니다.',
            '#fb-auto': ({ el }) => el.textContent.indexOf('멈춤') > -1
                ? '30세대를 이어서 돌립니다. 왼쪽 띠 그래프에서 <strong>모양이 더 이상 바뀌지 않는 지점</strong>을 찾아보세요. 기본값에서는 3세대입니다.'
                : '자동 진행을 멈췄습니다. 지금 상태에서 컨트롤을 바꾸면 <strong>다음 세대부터</strong> 적용돼요 — 굳은 판에 탐색을 뒤늦게 켜서 풀리는지 보는 실험이 가능합니다.',
            '#fb-reset': () => '같은 시드로 판을 처음부터 다시 시작했습니다. 난수열이 같으니 설정만 바꿔 돌리면 <strong>처방의 차이만</strong> 남습니다.',
            '[data-preset="base"]': () => '<strong>기본</strong> — 탐색 0%. 순위가 배분의 전부입니다. 끝까지 돌리면 노출 집합이 3세대에 굳고, ' +
                '진짜 1위 <code>9931</code>의 40세대 누적 노출이 500건에서 멈춥니다. 누적 클릭 17,350건으로 오라클(18,831건)보다 7.9% 적어요.',
            '[data-preset="eps"]': () => '<strong>ε 탐색 5%</strong> — 20,000건 중 1,000건을 여덟에 125건씩 나눠 줍니다. 노출 집합이 아예 굳지 않지만, ' +
                '한 세대에 주는 표본이 작아 <code>9931</code> 복귀에 8세대가 걸립니다. 40세대 클릭 18,541건.',
            '[data-preset="prior"]': () => '<strong>낙관 초기값 3.5%</strong> — 노출은 여전히 넷만 받지만 그 넷의 구성이 계속 바뀝니다. ' +
                '노출을 받은 광고의 추정값이 진짜 값으로 내려오면서 아직 덜 본 광고가 위로 올라오기 때문이에요. 40세대 클릭 18,546건.',
            '[data-preset="slot"]': () => '<strong>강제 슬롯 8%</strong> — 1,600건을 0건 광고에게만 줍니다(넷이면 400건씩). 복귀는 3세대로 가장 빠르지만 ' +
                '40세대 클릭은 18,515건으로 셋 중 가장 낮아요. 이 처방이 사는 것은 매출이 아니라 측정의 정확도입니다 — IPS 를 켜서 확인해 보세요.'
        },
        tour: [
            {
                el: '#fb-step',
                title: '한 세대 = 하루',
                body: '이 버튼을 한 번 누르면 하루가 갑니다. 배분을 정하고, 노출을 뿌리고, 클릭 로그를 쌓고, 그 로그로 내일 배분을 정합니다. ' +
                    '먼저 <strong>한 세대 진행</strong>을 눌러 첫날을 보세요.',
                waitFor: 'click'
            },
            {
                el: '.fb-charts .fb-card:nth-child(2)',
                title: '첫날은 모두 500건씩',
                body: '왼쪽 파란 막대가 <strong>진짜 CTR</strong>, 가운데가 시스템이 믿는 <strong>추정 CTR</strong>입니다. ' +
                    '500건이라는 작은 표본에서 나온 값이라 두 순서가 어긋나 있죠? 이 어긋난 순서가 내일 노출을 정합니다.'
            },
            {
                el: '#fb-auto',
                title: '고리를 끝까지 돌린다',
                body: '<strong>30세대 자동</strong>을 눌러 보세요. 왼쪽 띠 그래프에서 모양이 더 이상 바뀌지 않는 지점이 굳은 순간입니다.',
                waitFor: 'click'
            },
            {
                el: '.fb-metrics',
                title: '굳음을 숫자로',
                body: '"굳음"은 노출을 받는 광고 집합이 마지막으로 바뀐 세대예요. "누적 지니계수"는 쏠린 정도인데, ' +
                    '값이 높은 것보다 <strong>변화가 멈춘 것</strong>이 신호입니다. 맨 오른쪽은 진짜 CTR 을 알고 배분했을 때와의 클릭 차이입니다.'
            },
            {
                el: '#fb-eps',
                title: '굳은 판을 풀어 보기',
                body: '탐색 예산 ε 를 <strong>5%</strong> 쯤으로 올려 보세요. 다음 세대부터 적용됩니다. 계속 돌리면 갇혀 있던 광고가 돌아옵니다.',
                waitFor: 'input'
            },
            {
                el: '#demo-edu-explain',
                title: '해설 패널',
                body: '조작할 때마다 "지금 일어난 일"이 여기 표시됩니다. IPS 재가중을 켜고 측정 창을 바꿔 보는 실험도 해보세요.'
            }
        ]
    },

// js/demo-edu-content.js 의 window.DEMO_EDU 안에 그대로 끼워 넣는 조각.
// 'log-hops' 엔트리 앞이나 뒤 어디든 좋다(마지막에 넣으면 앞 엔트리 뒤에 쉼표를 붙일 것).
//
//   analogy   : 카드/허브용 한 줄 — 비유가 아니라 이 데모가 남기는 통찰 한 줄
//   anchor    : 해설 패널이 들어갈 자리(.uq-explain-host 는 비어 있으면 CSS 가 접는다)
//   embedKeep : ?embed=1 에서 남길 main 직계 자식
//   embedHide : 임베드에서 더 접을 것 — 프리셋 줄과 컨트롤 머리말은 본문 안에서 자리만 먹는다
//   explain   : 컨트롤 셀렉터별 해설. 표의 현재 값을 그대로 읽어 말한다
//   tour      : 5스텝

    // ==========================================
    // 증분 4분면 (중급)
    // ==========================================
    'uplift-quadrant': {
        analogy: '리포트 전환이 가장 큰 계획과 매출을 가장 많이 늘린 계획은 같지 않다',
        anchor: '.uq-explain-host',
        embedKeep: ['.uq-controls', '.uq-explain-host', '.uq-metrics', '.uq-charts'],
        embedHide: ['.uq-presets', '.uq-controls-head span'],
        explain: {
            '#uq-per': ({ value, prev }) => {
                const g = (id) => (document.getElementById(id) || {}).textContent || '—';
                return `설득 가능을 <strong>${prev}% → ${value}%</strong>로 ${value > prev ? '올렸' : '내렸'}습니다. ` +
                    `광고비가 값을 하는 부류는 이 하나뿐입니다. 전체 증분이 <strong>${g('uq-cvr-lift')}</strong>, ` +
                    `전원에게 광고했을 때 증분 전환이 <strong>${g('uq-inc-total')}</strong>이 됐습니다. ` +
                    `이들은 pCVR이 낮은 편이라 왼쪽 그림에서 <strong>가로선 위·세로선 왼쪽</strong>에 많이 앉습니다 — ` +
                    `pCVR 순으로 고르면 그 자리가 통째로 빠집니다.`;
            },
            '#uq-sure': ({ value, prev }) => {
                const g = (id) => (document.getElementById(id) || {}).textContent || '—';
                return `확실 구매를 <strong>${prev}% → ${value}%</strong>로 ${value > prev ? '올렸' : '내렸'}습니다. ` +
                    `광고를 안 봐도 사는 사람이라 pCVR은 가장 높고 증분은 0입니다. ` +
                    `지금 pCVR 순으로 고르면 증분 전환이 <strong>${g('uq-p-inc')}</strong>, 증분 CPA가 <strong>${g('uq-p-icpa')}</strong>입니다. ` +
                    `올릴수록 pCVR 순의 자리를 이들이 채웁니다 — 리포트 전환은 커지고 매출은 그대로입니다.`;
            },
            '#uq-dog': ({ value, prev }) => {
                const g = (id) => (document.getElementById(id) || {}).textContent || '—';
                return `청개구리를 <strong>${prev}% → ${value}%</strong>로 ${value > prev ? '올렸' : '내렸'}습니다. ` +
                    `보여 주면 오히려 안 사는 사람이라 증분이 음수입니다. ` +
                    `전원에게 광고했을 때 증분 전환이 <strong>${g('uq-inc-total')}</strong>으로 바뀌었습니다. ` +
                    `오른쪽 Qini 곡선의 최고점이 ${value > prev ? '왼쪽으로 옵니다' : '오른쪽으로 갑니다'} — ` +
                    `그 점 뒤는 광고를 더 할수록 매출이 주는 구간입니다.`;
            },
            '#uq-budget': ({ value, prev }) => {
                const g = (id) => (document.getElementById(id) || {}).textContent || '—';
                return `예산을 상위 <strong>${prev}% → ${value}%</strong>로 바꿨습니다. 지금 광고가 닿는 사람은 ${g('uq-spend')}입니다. ` +
                    `같은 돈으로 pCVR 순은 증분 <strong>${g('uq-p-inc')}</strong>, uplift 순은 <strong>${g('uq-u-inc')}</strong>을 만듭니다. ` +
                    (Number(value) >= 100
                        ? `100%까지 밀었더니 두 곡선이 한 점에서 만납니다. 전원에게 광고하면 순서를 아무리 잘 매겨도 결과가 같습니다.`
                        : `100%까지 밀면 두 곡선이 한 점에서 만납니다 — 증분 모델의 값은 "어디서 멈출까"와 짝일 때만 생깁니다.`);
            },
            '#uq-mode-pcvr': () => {
                const g = (id) => (document.getElementById(id) || {}).textContent || '—';
                return `고르는 기준을 <strong>pCVR 순</strong>으로 바꿨습니다. 왼쪽 그림에서 <strong>세로선 오른쪽</strong>이 통째로 진해집니다. ` +
                    `오른쪽 아래 칸(확실 구매)까지 같이 딸려 옵니다. ` +
                    `리포트 전환 <strong>${g('uq-p-report')}</strong>에 겉보기 CPA <strong>${g('uq-p-cpa')}</strong> — 여기까지는 좋아 보입니다. ` +
                    `그런데 증분은 <strong>${g('uq-p-inc')}</strong>, 증분 CPA는 <strong>${g('uq-p-icpa')}</strong>입니다.`;
            },
            '#uq-mode-uplift': () => {
                const g = (id) => (document.getElementById(id) || {}).textContent || '—';
                return `고르는 기준을 <strong>uplift 순</strong>으로 바꿨습니다. 이번에는 <strong>가로선 위쪽</strong>이 진해지고 오른쪽 아래 칸이 통째로 빠집니다. ` +
                    `리포트 전환은 <strong>${g('uq-u-report')}</strong>으로 줄었는데 증분은 <strong>${g('uq-u-inc')}</strong>, ` +
                    `증분 CPA는 <strong>${g('uq-u-icpa')}</strong>입니다. 리포트가 나빠진 계획이 매출은 더 늘렸습니다.`;
            },
            '.uq-preset-btn': ({ el }) => {
                const g = (id) => (document.getElementById(id) || {}).textContent || '—';
                return `<strong>${el.textContent.trim()}</strong>로 바꿨습니다. ` +
                    `노출군 CVR ${g('uq-cvr-t')} · 대조군 CVR ${g('uq-cvr-c')} · 증분 ${g('uq-cvr-lift')}입니다. ` +
                    `지금 예산에서 pCVR 순 증분 <strong>${g('uq-p-inc')}</strong> 대 uplift 순 증분 <strong>${g('uq-u-inc')}</strong>. ` +
                    `${g('uq-mix')}`;
            }
        },
        tour: [
            {
                el: '#uq-card-scatter',
                title: '네 부류가 어디에 앉아 있나',
                body: '가로가 pCVR(광고를 봤을 때 살 확률), 세로가 uplift(광고가 늘린 확률)입니다. ' +
                    '<strong>오른쪽 아래</strong>가 확실 구매입니다 — pCVR은 가장 높은데 광고가 늘린 것은 0입니다. ' +
                    '<strong>왼쪽 위</strong>에는 pCVR이 낮은데 증분은 있는 사람이 앉아 있습니다.'
            },
            {
                el: '#uq-mode-pcvr',
                title: '기준을 바꿔 보세요',
                body: '<strong>pCVR 순</strong>을 눌러 보세요. 진해지는 점 무리가 통째로 옮겨 갑니다. ' +
                    '세로선 오른쪽을 전부 사게 되고, 오른쪽 아래 칸이 같이 딸려 옵니다.',
                waitFor: 'click'
            },
            {
                el: '.uq-compare',
                title: '두 줄을 나란히 읽기',
                body: '같은 사람 수, 같은 광고비입니다. <strong>리포트 전환</strong>은 pCVR 순이 큽니다. ' +
                    '<strong>증분 전환</strong>은 uplift 순이 큽니다. 어느 칸을 보느냐로 예산이 갈립니다.'
            },
            {
                el: '#uq-budget',
                title: '예산을 끝까지 밀어 보기',
                body: '타겟팅 예산을 100%까지 밀어 보세요. 오른쪽 두 곡선이 한 점에서 만납니다 — ' +
                    '전원에게 광고하면 순서를 아무리 잘 매겨도 결과가 같습니다.',
                waitFor: 'input'
            },
            {
                el: '#uq-card-qini',
                title: 'Qini 곡선과 멈출 자리',
                body: '위에서부터 잘라 가며 더한 증분입니다. 파란 곡선의 <strong>최고점</strong>이 광고를 멈출 자리예요. ' +
                    '그 오른쪽은 광고를 더 할수록 증분이 줄어듭니다. 이제 자유롭게 돌려 보세요.'
            }
        ]
    },

// ==========================================
    // 신호 소실 계단 (중급)
    // js/demo-edu-content.js 의 window.DEMO_EDU 에 이 엔트리 하나를 그대로 넣는다.
    // 마지막 엔트리 뒤에 붙일 때는 앞 엔트리의 닫는 중괄호 뒤 쉼표를 확인할 것.
    // ==========================================
    'signal-loss': {
        analogy: '식별자가 빠지면 피처보다 라벨이 먼저 부서진다 — 타겟팅 계기는 그대로인데 나머지 셋이 같이 내려간다',
        anchor: '.sl-stage',
        embedKeep: ['.sl-stage', '.sl-panels'],
        // 임베드에서는 스위치·계기·판정과 전환 분해 판 하나만 남긴다.
        // 스위치 설명줄과 각주는 글 본문이 이미 말하고 있으므로 접는다(높이 200px쯤 절약).
        embedHide: [
            '.sl-hero', '.demo-prereq', '.demo-intro', '.demo-steps', '.sl-brief',
            '.sl-switches-head p', '.sl-switch-note', '.sl-gauge-foot',
            '.sl-card-spread', '.sl-card-freq', '#sl-conv-note',
            '.demo-tldr', '.demo-practice', '.demo-next'
        ],
        explain: {
            // 스위치는 <button role="switch"> 다. 데모 JS 의 핸들러가 버튼에 붙어 있어서
            // document 로 올라오기 전에 aria-checked 가 이미 새 값으로 바뀌어 있다.
            '#sl-sw-cookie': ({ el }) => el.getAttribute('aria-checked') === 'false'
                ? '<strong>3rd-party 쿠키</strong>를 내렸습니다. 웹 780만 노출에 크로스 사이트 신호가 안 붙고, ' +
                  '광고주 픽셀로 잇던 전환 780건이 아예 안 들어옵니다. 열린 RTB AUC 가 0.040 내려갔는데 ' +
                  '담장 안은 0.007 뿐입니다 — 담장 안이 쓰던 신호는 남에게서 산 것이 아니라 우리 것이기 때문이에요. ' +
                  '계기 3·4 는 그대로인 것도 보세요. <strong>피처가 준 것이지 학습이 멈춘 것이 아닙니다.</strong>'
                : '쿠키를 다시 올렸습니다. 웹 780만 노출과 픽셀 경유 전환 780건이 돌아왔어요.',

            '#sl-sw-idfa': ({ el }) => el.getAttribute('aria-checked') === 'false'
                ? '<strong>IDFA</strong>를 내렸습니다. iOS 앱 940건과 MMP 앱 270건이 포스트백으로 바뀌어 ' +
                  '사람이 붙지 않습니다. 그중 44.1% 는 값 없이 건수만 옵니다 — 글 4절의 940건 중 415건이 그것이에요. ' +
                  '계기 2 보다 계기 3 이 더 크게 떨어지는 것을 보세요. 집계 한 줄은 개인 한 줄의 11분의 1 값이라서 그렇습니다.'
                : 'IDFA 를 다시 올렸습니다. iOS 940건이 다시 줄 단위로 사람에 붙습니다.',

            '#sl-sw-label': ({ el }) => el.getAttribute('aria-checked') === 'false'
                ? '<strong>이 데모의 핵심 장면입니다.</strong> 유저 단위 전환 라벨을 내리자 계기 2·3·4 가 한꺼번에 내려갔는데 ' +
                  '계기 1(타겟팅)은 100.0% 그대로입니다. 라벨이 없어진 것이 아니라 <strong>모양이 바뀐 것</strong>이에요 — ' +
                  '학습 데이터의 한 줄이 사람에서 칸으로 바뀝니다. 집계 라벨도 계수의 평균은 참값과 맞습니다. ' +
                  '틀어지는 것은 흔들림이고, 그 값이 3.3배입니다. 되돌리려면 데이터가 3.3의 제곱, 곧 11배 필요해요.'
                : '전환 라벨을 다시 올렸습니다. 유효 표본이 원래대로 돌아옵니다. ' +
                  '스위치 하나로 계기 셋이 같이 움직인 자리가 여기입니다.',

            '#sl-sw-freq': ({ el }) => el.getAttribute('aria-checked') === 'false'
                ? '<strong>크로스 앱 빈도 제어</strong>를 내렸습니다. 계기 2·3 은 꿈쩍도 안 하는데 아래 3층 판이 바뀌었죠. ' +
                  '같은 사람인지 모르면 몇 번 봤는지도 셀 수 없어서 상한 5회를 못 겁니다. ' +
                  'iOS 노출 420만 중 47.6% 가 이미 다섯 번 넘게 본 사람에게 갑니다. ' +
                  '이 층은 대체 신호로 못 메웁니다 — 판정이 되거나 안 되거나 둘 중 하나예요.'
                : '빈도 제어를 다시 올렸습니다. 상한 5회를 걸어 초과분 1,998,000건을 새 사람에게 돌립니다.',

            '#sl-sw-noise': ({ el }) => el.getAttribute('aria-checked') === 'false'
                ? '<strong>노이즈</strong>가 붙었습니다. 라플라스 스케일 b=20 이라 칸마다 평균 20건씩 어긋나고, ' +
                  '표준편차는 28.3건입니다. 노이즈는 <strong>칸의 크기와 무관하게 같은 크기로</strong> 붙어요 — ' +
                  '전환 40건 칸에도 28.3, 4,000건 칸에도 28.3 입니다. 그래서 상대 오차가 100배 갈립니다. ' +
                  '거기에 50건 미만인 칸은 지워집니다. 지워진 칸은 0 이 아니라 결측이에요.'
                : '노이즈를 껐습니다. 리포트가 원본 그대로 옵니다. 억제로 지워진 칸도 돌아왔어요.',

            '#sl-conv-level': ({ value, prev }) => {
                const L = [10, 40, 120, 400, 1200, 4000];
                const SD = [282.8, 70.7, 23.6, 7.1, 2.4, 0.7];
                const SUP = [93.6, 69.5, 1.6, 0.0, 0.0, 0.0];
                const WK = [106.9, 26.6, 8.9, 2.7, 0.9, 0.3];
                const i = +value, p = +prev;
                const fmt = n => n.toLocaleString('en-US');
                return '광고 규모를 <strong>' + fmt(L[p]) + '건 → ' + fmt(L[i]) + '건</strong>으로 바꿨어요. ' +
                    '노이즈가 만드는 상대 오차는 ' + SD[i].toFixed(1) + '% 이고, 이 칸이 지워지는 날은 ' +
                    SUP[i].toFixed(1) + '% 입니다. 7일을 합산하면 ' + WK[i].toFixed(1) + '% 로 내려가요 — ' +
                    '신호는 7배가 되는데 노이즈는 제곱근 7배만 커지기 때문입니다. ' +
                    (L[i] <= 40
                        ? '이 규모에서는 5% 차이가 ' + (L[i] * 0.05).toFixed(0) + '건이라 노이즈에 완전히 묻힙니다. ' +
                          '<strong>최적화가 느려지는 것이 아니라 멈춥니다.</strong>'
                        : '이 규모에서는 5% 차이가 ' + fmt(Math.round(L[i] * 0.05)) + '건이라 노이즈 위로 올라옵니다.');
            },

            '[data-preset="11111"]': () =>
                '<strong>전부 켬</strong>. 전환 4,060건이 모두 줄 단위로 사람에 붙는 상태예요. ' +
                '여기가 기준선입니다. 스위치를 위에서부터 하나씩 내리며 어느 계기가 먼저 움직이는지 보세요.',

            '[data-preset="01111"]': () =>
                '<strong>웹 서드파티 차단</strong>. 계기 1 이 35.0% 로 떨어지고 계기 2 는 80.8% 입니다. ' +
                '그런데 계기 4(흔들림 폭)는 15.8% 그대로예요. 라벨이 살아 있으면 지표는 안 흔들립니다.',

            '[data-preset="10101"]': () =>
                '<strong>iOS SKAN 경로</strong>. IDFA 와 빈도 제어만 내린 상태입니다. ' +
                'iOS 940건과 MMP 270건이 집계로 바뀌어 계기 3 이 72.9% 로 내려갔어요. ' +
                '웹 2,850건은 아직 사람에 붙습니다. 실무에서 SKAN 라벨로 모델 전체를 학습하지 않는 이유가 이 그림이에요 — ' +
                '개인 라벨로 본체를 학습하고 집계는 캠페인 단위 보정에만 씁니다.',

            '[data-preset="00111"]': () =>
                '<strong>담장 안 로그인 지면</strong>. 크로스 신호는 0인데 계기 4 는 15.8% 그대로입니다. ' +
                '라벨이 살아 있기 때문이에요. 담장 안 AUC 는 0.761 로 0.010 만 내려갔고 열린 RTB 는 0.706 입니다. ' +
                '다만 "담장 안은 안전하다"는 층별로 갈립니다 — 전환의 37.5% 는 담장 밖에서 끝나거든요.',

            '[data-preset="00000"]': () =>
                '<strong>집계 API 경로</strong>. 다섯을 다 내렸습니다. 값이 오는 전환은 14.0%, ' +
                '유효 표본은 93줄로 기준의 2.3% 입니다. 이 상태에서는 지표로 성과를 판정할 수 없어요. ' +
                '남는 길은 무작위 실험입니다 — 지역이나 시간으로 나눠 광고를 껐다 켜면 식별자가 없어도 성립하니까요.'
        },
        tour: [
            {
                el: '.sl-switches',
                title: '스위치 다섯',
                body: '위에서부터 3rd-party 쿠키 · IDFA · 유저 단위 전환 라벨 · 크로스 앱 빈도 제어 · 노이즈 없는 집계입니다. ' +
                    '내린 스위치는 점선 테두리가 되고 상태 글자가 같이 바뀝니다.'
            },
            {
                el: '#sl-sw-label',
                title: '세 번째를 내려 보세요',
                body: '<strong>유저 단위 전환 라벨</strong>을 눌러 보세요. 무엇이 먼저 부서지는지가 여기서 갈립니다.',
                waitFor: 'click'
            },
            {
                el: '.sl-gauges',
                title: '계기 셋이 같이 내려갔다',
                body: '계기 2·3·4 가 한꺼번에 내려갔는데 계기 1(타겟 가능 유저 비율)은 100.0% 그대로예요. ' +
                    '<strong>타겟팅보다 라벨이 먼저 부서집니다.</strong> 피처가 빠지면 성능이 조금 내려가지만, ' +
                    '라벨이 바뀌면 학습 코드가 읽는 단위 자체가 달라집니다.'
            },
            {
                el: '#sl-conv-card',
                title: '전환 4,060건의 모양',
                body: '같은 4,060건인데 개인 라벨 · 집계로 값이 오는 것 · 건수만 오는 것 · 칸째 지워진 것 · 아예 못 보는 것으로 갈립니다. ' +
                    '건수와 비율은 막대 아래 표에 그대로 있어요.'
            },
            {
                el: '#sl-conv-level',
                title: '광고 규모를 밀어 보세요',
                body: '슬라이더를 <strong>4,000건</strong> 쪽으로 밀어 보세요. 같은 노이즈인데 흔들림 폭이 70.7%에서 0.7%로 내려갑니다.',
                waitFor: 'input'
            },
            {
                el: '#demo-edu-explain',
                title: '해설 패널',
                body: '스위치를 누르거나 슬라이더를 움직일 때마다 "지금 일어난 일"이 여기에 표시됩니다. 자유롭게 돌려 보세요!'
            }
        ]
    },

// js/demo-edu-content.js 의 window.DEMO_EDU 에 넣을 'api-contract' 엔트리.
// 'log-hops' 엔트리 뒤에 쉼표로 이어 붙이면 된다. (이 파일 자체는 조각이다)
//
// 숫자는 js/api-contract-demo.js 가 그린 결과를 그대로 읽어 쓴다. 판정 박스
// (#ac-verdict)의 data-* 에 실려 있다 — acSent · acRows · acDup · acBlocked ·
// acInflate · acSuccess · acUnresolved · acCpa · acConc · acTimeout ·
// acRounds · acSecret · acSecretFlag. 해설에서 계산을 다시 하지 않는 이유는
// 그림·계기·해설이 서로 다른 숫자를 말하는 사고를 막으려는 것이다.
//
// acSent · acRows · acBlocked · acUnresolved · acCpa 는 자릿점이 붙어 온다
// (그대로 화면에 박는 값). 크기를 비교하는 acDup · acRounds · acConc 는
// 숫자만 오므로 + 를 붙여 읽는다.
//
// 조사(을/를 · 이/가 · 로/으로)를 변수 뒤에 붙이지 않는다. 인증 이름이
// "HMAC 서명"·"JWT (사용자 토큰)"처럼 끝 글자가 달라 한쪽이 반드시 틀린다.
// 그래서 변수는 문장 끝에 두고 "입니다"로 받는다.

    // ==========================================
    // API 계약 실험실 (입문)
    // ==========================================
    'api-contract': {
        analogy: '문서에 적힌 것은 주소와 필드뿐이다 — 리포트를 틀어지게 하는 넷은 전부 문서에 없는 칸에서 정해진다',
        anchor: '.ac-controls',
        // main 의 자식은 .ac-hero 와 .ac-page 둘뿐이고 나머지는 전부 .ac-page
        // 안에 있다. 그래서 embedKeep 만으로는 아무것도 안 접힌다 —
        // .ac-page 를 남긴 다음 embedHide 가 안쪽을 접는다.
        embedKeep: ['.ac-controls', '.ac-stage', '.ac-verdict'],
        embedHide: [
            '.demo-prereq', '.demo-intro', '.demo-steps', '.ac-setup',
            '.demo-tldr', '.demo-practice', '.demo-next'
        ],
        explain: {
            // 체크박스 input 에 직접 걸면 해설이 안 나온다(demo-edu.js 가 click 에서
            // input 을 걸러내고, input 이벤트 쪽은 checkbox 의 value 가 늘 "on" 이라
            // 값이 안 바뀐 것으로 본다). log-hops 와 같은 이유로 감싸는 label 에
            // 걸고, 라벨을 눌렀을 때 두 번 오는 것은 dataset 로 막는다.
            '#ac-idem-label': ({ el }) => {
                const on = document.getElementById('ac-idem').checked ? '1' : '0';
                if (el.dataset.eduSaid === on) return '';
                el.dataset.eduSaid = on;
                const d = document.getElementById('ac-verdict').dataset;
                return on === '0'
                    ? `멱등키를 껐습니다. <strong>요청 수는 ${d.acSent}건 그대로</strong>인데 ` +
                      `전환 테이블이 <strong>${d.acRows}줄(+${d.acInflate})</strong>이 됐습니다. ` +
                      `진짜 CPA 5,000원이 리포트에는 <strong>${d.acCpa}원</strong>으로 뜹니다. ` +
                      `달라진 것은 기록뿐이에요 — 중복 ${d.acDup}건은 전부 성공 응답을 받았으니 에러 로그에 한 줄도 안 남습니다.`
                    : `멱등키를 켰습니다. 같은 키로 온 ${d.acBlocked}건은 새로 처리하지 않고 ` +
                      `<strong>저장해 둔 201 을 그대로</strong> 받습니다. 전환 테이블이 ${d.acRows}줄로 돌아왔어요. ` +
                      `요청 수 ${d.acSent}건은 그대로입니다 — 멱등키는 재시도를 줄이는 장치가 아니라 그 값을 지우는 장치입니다.`;
            },
            // 라디오도 같은 이유로 감싸는 fieldset 에 건다.
            '.ac-dir-row': ({ el }) => {
                const picked = document.querySelector('input[name="ac-dir"]:checked');
                if (!picked || el.dataset.eduSaid === picked.value) return '';
                el.dataset.eduSaid = picked.value;
                const d = document.getElementById('ac-verdict').dataset;
                const sel = document.getElementById('ac-auth');
                const name = sel.options[sel.selectedIndex].text;
                return picked.value === 'c2s'
                    ? `부르는 쪽을 <strong>사용자 기기</strong>로 바꿨습니다. 지금 고른 인증은 ${name} 입니다. ` +
                      (d.acSecret === '1'
                          ? `부르는 쪽에 비밀이 있어야 하니 시크릿 계기는 <strong>${d.acSecretFlag}</strong> 입니다. ` +
                            `앱에 넣은 문자열은 앱을 받은 사람 모두가 갖고, 이미 배포된 값은 회수할 방법이 없습니다.`
                          : `앱에 둘 비밀이 없으니 시크릿 계기는 <strong>${d.acSecretFlag}</strong> 입니다. 이 방향에서 남는 답이 이것입니다.`) +
                      ` 값도 같이 못 믿게 됩니다 — 전환 금액은 앱이 보낸 것을 쓰지 않고 우리 주문 테이블에서 다시 읽습니다.`
                    : `부르는 쪽을 <strong>우리·상대 서버</strong>로 되돌렸습니다. 비밀을 둘 자리가 생겼습니다. ` +
                      `지금 고른 인증은 ${name} 이고, 시크릿 계기는 <strong>${d.acSecretFlag}</strong> 입니다. ` +
                      `자격증명이 새도 한쪽에서 갈아 끼우면 끝나는 것이 이 방향의 차이입니다.`;
            },
            '#ac-auth': ({ value, prev }) => {
                const NAME = {
                    hmac: 'HMAC 서명', key: 'API key', oauth: 'OAuth2 client credentials',
                    jwt: 'JWT (사용자 토큰)', mtls: 'mTLS'
                };
                const PROVES = {
                    hmac: '본문과 시각을 비밀키로 해시해 헤더에 붙입니다. 본문을 한 글자 고쳐도 걸리지만, 같은 요청을 그대로 다시 보내는 것은 못 막습니다.',
                    key: '이 키를 가진 쪽이라는 것만 증명합니다. 본문 위변조도 재전송도 못 막습니다 — 다섯 중 가장 단순하고 가장 약합니다.',
                    oauth: '서비스 신원을 증명하고 토큰을 받아 씁니다. 토큰이 새도 만료까지만 유효합니다. 대신 발급 호출 한 번이 예산에 더 붙습니다.',
                    jwt: '발급자가 서명했다는 것을 증명합니다. 만료 전 회수와 탈취는 못 막습니다.',
                    mtls: '양쪽이 서로의 인증서를 확인합니다. 인증서가 새면 교체로 끝나지만, 본문 내용이 옳은지는 못 봅니다.'
                };
                const d = document.getElementById('ac-verdict').dataset;
                const dir = document.querySelector('input[name="ac-dir"]:checked').value;
                let tail = `지금은 ${dir === 'c2s' ? 'client → server' : 'server → server'} 방향이라 ` +
                    `시크릿 계기가 <strong>${d.acSecretFlag}</strong>입니다.`;
                if (value === 'hmac') tail += ' 시계도 같이 봅니다 — 우리 서버 시각이 6분 어긋나면 코드가 멀쩡해도 전량 401 입니다.';
                if (value === 'key' && dir === 's2s') tail += ' 두 키를 동시에 인정하는 기간을 두고 갈아 끼웁니다.';
                return `인증 방식을 바꿨습니다 — <strong>${NAME[prev] || prev} → ${NAME[value] || value}</strong>. ` +
                    `${PROVES[value]} ${tail}`;
            },
            '#ac-loss': ({ value, prev }) => {
                const d = document.getElementById('ac-verdict').dataset;
                const step2 = (+value * 10 / 9).toFixed(1), step3 = (+value * 4 / 3).toFixed(1);
                return `응답 유실률을 <strong>${prev}% → ${value}%</strong>로 ` +
                    (+value > +prev ? '올렸' : '내렸') + '습니다. ' +
                    `회차 계단이 <strong>${(+value).toFixed(1)}% → ${step2}% → ${step3}%</strong>로 다시 잡히고 ` +
                    `요청 합계가 ${d.acSent}건이 됐습니다. ` +
                    (+d.acDup > 0
                        ? `전환 테이블은 ${d.acRows}줄(+${d.acInflate})입니다. 유실은 <strong>돌아오는 응답</strong>에서만 났는데 부푸는 것은 기록이에요.`
                        : `전환 테이블은 ${d.acRows}줄 그대로입니다. 늘어난 것은 요청 수뿐이고, 멱등키가 그 차이를 먹었습니다.`);
            },
            '#ac-retry': ({ value, prev }) => {
                const d = document.getElementById('ac-verdict').dataset;
                let body;
                if (+value === 0) {
                    body = `중복은 0이 되지만 성공률이 <strong>${d.acSuccess}%</strong>로 떨어집니다. ` +
                        `미확인 ${d.acUnresolved}건은 서버가 기록했는지 아닌지 보낸 쪽이 모르는 건이에요. ` +
                        `안 보내면 유실, 보내면 중복 — 끄는 쪽도 답이 아닙니다.`;
                } else if (+d.acRounds < +value + 1) {
                    body = `표에는 ${d.acRounds}회차까지만 나옵니다. 4회차에 남은 건이 전부 도착한다고 뒀으니(설정 설명) ` +
                        `그 위로 올려도 달라지는 것이 없습니다. 재시도 횟수는 유실이 남아 있을 때만 값을 냅니다.`;
                } else {
                    body = `성공률 <strong>${d.acSuccess}%</strong> · 요청 ${d.acSent}건입니다. ` +
                        `재시도는 성공률을 사고 중복을 지불합니다.`;
                }
                if (+value >= 3) {
                    body += ` 실제로는 여기에 <strong>지터</strong>를 같이 넣습니다. 같은 순간에 끊긴 500건이 ` +
                        `지수 백오프만으로 다시 몰리면 성공 180건 · 100ms 창 최대 부하 500건입니다. ` +
                        `full jitter 를 넣으면 성공 <strong>472건</strong> · 최대 부하 <strong>92건</strong>이 됩니다.`;
                }
                return `재시도를 <strong>${prev}회 → ${value}회</strong>로 바꿨습니다. ${body}`;
            },
            '#ac-timeout': ({ value, prev }) => {
                const MS = [400, 800, 1500, 3000];
                const d = document.getElementById('ac-verdict').dataset;
                const now = MS[+value], was = MS[+prev], conc = +d.acConc;
                return `하위 호출 타임아웃 상한을 <strong>${was.toLocaleString('en-US')}ms → ` +
                    `${now.toLocaleString('en-US')}ms</strong>로 바꿨습니다. ` +
                    `초당 100번을 부르니 동시에 물리는 커넥션이 <strong>${conc}개</strong>입니다. ` +
                    (conc > 200
                        ? `풀 200개를 넘겼습니다. 상대는 죽지 않았고 느려졌을 뿐인데 우리 서비스가 멈춥니다 — ` +
                          `타임아웃은 상대를 위한 배려가 아니라 우리를 지키는 장치예요.`
                        : now > 400
                            ? `풀은 아직 견디는데 상위에 약속한 400ms 를 넘었습니다. 상위가 먼저 끊고, ` +
                              `아래 호출만 아무도 안 기다리는 채로 커넥션을 뭅니다.`
                            : `400ms 예산 안입니다. 안쪽은 서명 20 + 멱등 조회 50 + 전환 테이블 200 + Kafka 100 + 여유 30 으로 쪼갭니다.`);
            },
            '#ac-reset': () =>
                '<strong>기본값</strong>으로 돌아왔습니다 — server → server · HMAC 서명 · 멱등키 켬 · ' +
                '유실 15% · 재시도 3회 · 타임아웃 400ms. 요청은 1,180건인데 전환 테이블은 1,000줄입니다. ' +
                '글 7절 표의 그 값이에요.'
        },
        tour: [
            {
                el: '.ac-flow',
                title: '요청 한 건이 지나는 길',
                body: '왼쪽부터 <strong>보내는 쪽 · 인증 · 우리 수집 API · 멱등키 조회 · 전환 테이블</strong> 다섯 칸입니다. ' +
                    '아래로 돌아오는 선이 응답이고, <span aria-hidden="true">×</span> 는 응답이 사라진 자리예요. ' +
                    '점선 칸은 지금 문제가 되는 자리, 실선 굵은 칸은 지금 막아 주고 있는 자리입니다.'
            },
            {
                el: '#ac-idem-label',
                title: '멱등키를 꺼 봅니다',
                body: '<strong>멱등키 사용</strong> 칸을 눌러 꺼 보세요. 요청 수는 하나도 안 늘어나는데 전환 테이블만 부풉니다.',
                waitFor: 'click'
            },
            {
                el: '.ac-table',
                title: '두 열을 나란히 봅니다',
                body: '맨 오른쪽 두 열이 <strong>키 없음</strong>과 <strong>키 있음</strong>입니다. ' +
                    '보낸 건수와 유실 건수는 같은데 누적만 갈라집니다. 지금 고른 설정의 열이 진하게 나옵니다.'
            },
            {
                el: '#ac-gauges',
                title: '계기 넷 중 무엇이 먼저 움직였나',
                body: '성공률은 <strong>100.0%</strong> 그대로입니다. 재시도로 응답을 다 받아 냈으니까요. ' +
                    '움직인 것은 중복 계기 하나뿐이고, 리포트 CPA 가 5,000원에서 4,237원으로 내려갑니다. ' +
                    '실패로 세어지는 곳이 한 군데도 없는 사고가 이 모양입니다.'
            },
            {
                el: '.ac-dir-row',
                title: '이번에는 방향을 바꿉니다',
                body: '<strong>client → server</strong>를 눌러 보세요. 부르는 쪽이 남의 기기가 됩니다.',
                waitFor: 'click'
            },
            {
                el: '#ac-auth',
                title: '인증 다섯을 돌려 봅니다',
                body: '<strong>API key</strong>를 골라 보세요. 시크릿 계기가 위험으로 바뀝니다. ' +
                    '넷을 다 돌려 보면 이 방향에서 계기가 안전으로 남는 것은 <strong>사용자 토큰</strong> 하나뿐입니다. ' +
                    '무엇을 눌렀을 때 무엇이 왜 움직였는지는 위 해설 패널이 말해 줍니다.'
            }
        ]
    },

// js/demo-edu-content.js 의 window.DEMO_EDU 에 그대로 끼워 넣을 조각.
// 'log-hops' 엔트리 뒤, 객체 닫는 괄호 앞에 붙인다.
//
// 컨트롤이 라디오 두 벌 + 체크박스 다섯이라 "무엇이 켜졌나"를 라벨 하나만 보고
// 말할 수 없다. 라디오는 켜지는 쪽만 click 이 오고 꺼지는 쪽은 조용히 풀리기
// 때문이다. 그래서 클릭마다 컨트롤 전체 상태를 한 줄로 찍어 .pb-controls 의
// dataset 에 남기고, 지난 줄과 다른 자리만 말한다. 같으면 아무 말도 안 한다
// (라벨 글자를 누르면 click 이 라벨·입력 두 번 오는 것도 이 비교가 걸러 낸다).

    // ==========================================
    // 파이프라인 조립기 (심화)
    // ==========================================
    'pipeline-builder': {
        analogy: '층을 고르는 것은 취향이 아니다 — 소비자의 마감 하나가 어느 층을 반드시 세우게 만든다',
        anchor: '.pb-controls',
        embedKeep: ['.pb-controls', '.pb-strip-wrap', '.pb-gauges', '.pb-fan-wrap', '.pb-verdict-wrap'],
        embedHide: ['.pb-hero', '.demo-prereq', '.demo-intro', '.demo-steps', '.pb-setup',
            '.demo-tldr', '.demo-practice', '.demo-next'],
        explain: {
            '.pb-choices label': () => {
                const g = (id) => document.getElementById(id);
                const snap = (now) => {
                    const on = (id) => (now ? g(id).checked : g(id).defaultChecked);
                    const stores = ['pb-store-lake', 'pb-store-rt', 'pb-store-search'].filter(on);
                    return [
                        on('pb-col-sdk') ? 'sdk' : 'agent',
                        on('pb-buf') ? 'buf' : 'nobuf',
                        on('pb-proc-stream') ? 'stream' : (on('pb-proc-batch') ? 'batch' : 'both'),
                        (on('pb-buf') && on('pb-dist')) ? 'dist' : 'nodist',
                        stores.join('+') || 'none'
                    ].join('|');
                };
                const box = document.querySelector('.pb-controls');
                const cur = snap(true);
                const prev = box.dataset.eduState || snap(false);
                if (cur === prev) return '';
                box.dataset.eduState = cur;
                const p = prev.split('|'), c = cur.split('|');

                // 잡 수와 목적지 수 — 연결 수를 그 자리에서 세어 말한다
                const jobs = c[2] === 'stream' ? 4 : (c[2] === 'batch' ? 3 : 5);
                const storeCount = c[4] === 'none' ? 0 : c[4].split('+').length;
                const dests = Math.max(+document.getElementById('pb-dests').value, storeCount);

                if (c[0] !== p[0]) {
                    return c[0] === 'sdk'
                        ? '수집을 <strong>SDK 직행</strong>으로 바꿨습니다. 도달이 1,112 ms 에서 <strong>426 ms</strong> 로 줄어 ' +
                          '대시보드 마감 2,000 ms 에서 남는 예산이 888 ms 에서 1,574 ms 가 됩니다. ' +
                          '대신 버퍼를 끄면 버틸 것이 메모리 큐뿐이라 10.4분입니다.'
                        : '수집을 <strong>에이전트 tail</strong> 로 바꿨습니다. 도달이 426 ms 에서 <strong>1,112 ms</strong> 로 늘어 ' +
                          '남는 예산이 888 ms 로 줍니다. 대신 버퍼가 없어도 로컬 파일이 61.7시간 버팁니다.';
                }
                if (c[1] !== p[1]) {
                    return c[1] === 'buf'
                        ? 'Kafka 를 세웠습니다. 한 번 쓰고 여럿이 읽는 자리가 생겨 <strong>유통 층을 고를 수 있게</strong> 됩니다. ' +
                          '처리 잡이 멈춰도 <strong>168시간</strong>까지 offset 을 들고 있어 되감아 읽습니다.'
                        : '버퍼를 껐습니다. 읽어 갈 topic 이 없어 <strong>유통 층이 같이 잠깁니다</strong>. ' +
                          '버티는 시간이 168시간에서 <strong>' + (c[0] === 'sdk' ? '10.4분' : '61.7시간') + '</strong>으로 떨어집니다' +
                          (c[0] === 'sdk' ? ' — 사람이 붙는 30분보다 짧아 알아채기 전에 샙니다.' : '.');
                }
                if (c[2] !== p[2]) {
                    if (c[2] === 'stream') {
                        return '스트림만 두었습니다. 잡이 <strong>4개</strong>입니다. 대시보드는 800 ms 로 마감 안에 들지만, ' +
                            '다시 세어 덮어쓸 배치가 없어 <strong>5분 창의 2,202,480건(96.6%)이 확정</strong>이 됩니다. ' +
                            '늦게 온 클릭 77,520건이 라벨에 안 붙습니다.';
                    }
                    if (c[2] === 'batch') {
                        return '배치만 두었습니다. 잡이 <strong>3개</strong>입니다. 가장 빠른 후보가 1시간 배치라 ' +
                            '대시보드가 <strong>남는 예산 888 ms 를 2,100배 넘깁니다</strong>. 어떤 설정으로도 못 맞춥니다.';
                    }
                    return '스트림과 배치를 같이 두었습니다. 정제·조인을 한 번만 세어 잡이 <strong>5개</strong>입니다. ' +
                        '대시보드는 스트림이 받고, 라벨은 D+1 배치가 2,273,160건(99.7%)으로 다시 세어 덮어씁니다.';
                }
                if (c[3] !== p[3]) {
                    return c[3] === 'dist'
                        ? '유통 층을 세웠습니다. 연결이 <strong>' + jobs + ' × ' + dests + ' = ' + (jobs * dests) + '개</strong> 에서 ' +
                          '<strong>' + jobs + ' + ' + dests + ' = ' + (jobs + dests) + '개</strong> 로 줍니다. ' +
                          '값은 topic 왕복 200 ms 입니다 — 대시보드 예산 888 ms 의 22%입니다.'
                        : '유통 층을 껐습니다. 연결이 <strong>' + (jobs + dests) + '개에서 ' + (jobs * dests) + '개</strong>, ' +
                          '설정 자리가 ' + ((jobs + dests) * 4) + '개에서 ' + (jobs * dests * 4) + '개가 됩니다. ' +
                          '목적지를 하나 더 붙일 때 손대는 처리 잡이 0개에서 ' + jobs + '개입니다.';
                }
                if (c[4] !== p[4]) {
                    const gone = p[4].split('+').filter((s) => c[4].indexOf(s) < 0)[0];
                    const added = c[4].split('+').filter((s) => p[4].indexOf(s) < 0)[0];
                    const NAME = {
                        'pb-store-lake': ['오브젝트 + Iceberg', '학습·정산 원천과 30일 백필이 걸린 자리입니다. 없으면 raw 하루 21.9 GB · 정제 하루 9.12 GB 를 담을 곳이 없습니다.'],
                        'pb-store-rt': ['실시간 DB', '5분 집계를 최근 5분 · 지면별로 꺼내는 자리입니다. 없으면 지연을 아무리 줄여도 볼 화면이 없습니다.'],
                        'pb-store-search': ['검색엔진', 'DLQ 하루 1,800건 중 "알 수 없음" 130건의 원문을 사람이 보는 자리입니다.']
                    };
                    const hit = added || gone;
                    if (!hit || !NAME[hit]) return '';
                    // 목적지 수는 데모 쪽 change 처리가 아직 안 돌아서 슬라이더에 안 반영돼 있다.
                    // 저장소 하나가 목적지 하나이므로 여기서 같은 규칙으로 미리 센다.
                    const bumped = Math.min(8, Math.max(1, (+document.getElementById('pb-dests').value) + (added ? 1 : -1)));
                    const shown = Math.max(bumped, storeCount);
                    return (added ? '저장소를 세웠습니다: ' : '저장소를 껐습니다: ') + '<strong>' + NAME[hit][0] + '</strong>. ' +
                        NAME[hit][1] + ' 저장소는 목적지 하나이기도 해서 목적지 수가 같이 ' +
                        (added ? '늘어 ' : '줄어 ') + '<strong>' + shown + '개</strong>가 됩니다.';
                }
                return '';
            },
            '#pb-dests': ({ value, prev }) => {
                const g = (id) => document.getElementById(id);
                const jobs = g('pb-proc-stream').checked ? 4 : (g('pb-proc-batch').checked ? 3 : 5);
                const dist = g('pb-buf').checked && g('pb-dist').checked;
                const links = dist ? jobs + value : jobs * value;
                const was = dist ? jobs + prev : jobs * prev;
                return '목적지를 <strong>' + prev + '개 → ' + value + '개</strong>로 바꿨습니다. ' +
                    (dist
                        ? '유통 층이 있어 연결은 덧셈입니다 — ' + was + '개에서 <strong>' + links + '개</strong>. ' +
                          '목적지 하나가 커넥터 설정 블록 하나입니다.'
                        : '유통 층이 없어 연결은 곱셈입니다 — ' + was + '개에서 <strong>' + links + '개</strong>. ' +
                          '목적지 하나를 늘릴 때 처리 잡 ' + jobs + '개를 전부 고칩니다.');
            }
        },
        tour: [
            {
                el: '.pb-strip-wrap',
                title: '지금 세운 여섯 층',
                body: '수집에서 조회까지 왼쪽에서 오른쪽으로 놓여 있습니다. ' +
                    '<strong>점선 칸</strong>은 비어 둔 층, 굵게 두른 칸은 지금 켜 둔 유통 층입니다. ' +
                    '칸 아래 왼쪽이 대시보드 지연 계산식입니다.'
            },
            {
                el: '.pb-gauges',
                title: '계기 넷이 판정한다',
                body: '기본값에서 대시보드가 <strong>2,112 ms</strong> 입니다. 마감 2,000 ms 를 112 ms 넘겼습니다. ' +
                    '나머지 셋은 마감 안이고, 관리할 연결은 11개입니다.'
            },
            {
                el: '#pb-f-dist',
                title: '유통 층을 꺼 보세요',
                body: '커넥터를 끄면 처리 잡이 목적지마다 직접 씁니다. ' +
                    '연결이 <strong>11개에서 30개</strong>, 설정 자리가 44개에서 120개가 됩니다.',
                waitFor: 'click'
            },
            {
                el: '.pb-fan-wrap',
                title: '덧셈이 곱셈이 됐다',
                body: '선이 잡마다 목적지 전부로 뻗습니다. 이 그림이 <strong>5 × 6</strong> 입니다. ' +
                    '목적지를 하나 더 붙일 때 손대는 처리 잡도 0개에서 5개가 됩니다.'
            },
            {
                el: '#pb-f-buf',
                title: '버퍼를 꺼 보세요',
                body: 'Kafka 를 끄면 유통 층이 <strong>같이 잠깁니다</strong> — 읽어 갈 topic 이 없습니다. ' +
                    '버티는 시간도 168시간에서 61.7시간으로 떨어집니다.',
                waitFor: 'click'
            },
            {
                el: '#demo-edu-explain',
                title: '해설 패널',
                body: '컨트롤을 움직일 때마다 "지금 일어난 일"이 여기에 뜹니다. ' +
                    '아래 판정 칸은 그 조합에서 <strong>먼저 터지는 것</strong>부터 순서대로 적습니다. 이제 자유롭게 조립해 보세요.'
            }
        ]
    },

    // ==========================================
    // 이분 탐색 (알고리즘)
    // ==========================================
    'binary-search': {
        analogy: '회차마다 후보가 절반으로 준다. 변형 셋의 차이는 경계를 어디까지 남기느냐뿐',
        anchor: '.bs-controls',
        embedKeep: ['.bs-controls', '.bs-mode-code', '.bs-array', '.bs-markers', '.bs-verdict', '.bs-actions', '.bs-panels'],
        embedHide: ['.demo-prereq', '.demo-tldr-analogy', '.demo-intro', '.demo-steps', '.demo-tldr', '.demo-next', '.demo-practice'],
        explain: {
            '#bs-size': ({ value, prev }) => {
                const 최대 = Math.ceil(Math.log2(value + 1));
                const 이전최대 = Math.ceil(Math.log2(prev + 1));
                const head = `칸 수를 <strong>${prev}칸 → ${value}칸</strong>으로 바꿨습니다. `;
                if (최대 === 이전최대) {
                    return head + `그런데 최대 회차는 <strong>${최대}회 그대로</strong>입니다. ` +
                        '회차는 칸 수가 아니라 칸 수를 2로 몇 번 나눌 수 있느냐로 정해지기 때문입니다.';
                }
                return head + `최대 회차가 ${이전최대}회에서 <strong>${최대}회</strong>가 됐습니다. ` +
                    `칸은 ${Math.abs(value - prev)}칸 움직였는데 회차는 ${Math.abs(최대 - 이전최대)}회만 움직입니다.`;
            },
            '#bs-target': ({ value }) => {
                const cells = [...document.querySelectorAll('#bs-array .bs-cell-val')].map(e => +e.textContent);
                const 개수 = cells.filter(v => v === value).length;
                if (개수 === 0) {
                    return `<strong>${value}</strong> 는 배열에 없는 값입니다. ` +
                        '정확히 찾기는 -1 을 내지만, 왼쪽·오른쪽 경계는 <strong>넣을 자리</strong>를 알려 줍니다. ' +
                        '정렬을 유지하며 값을 끼워 넣을 때 이 자리를 씁니다.';
                }
                if (개수 === 1) {
                    return `<strong>${value}</strong> 는 한 칸에만 있습니다. ` +
                        '이때는 왼쪽 경계와 오른쪽 경계의 차가 1 이라 세 변형이 사실상 같은 자리를 가리킵니다. ' +
                        '차이를 보려면 같은 값이 여러 칸인 곳을 골라 보세요.';
                }
                return `<strong>${value}</strong> 가 <strong>${개수}칸</strong>에 있습니다. ` +
                    '왼쪽 경계는 그중 첫 칸, 오른쪽 경계는 마지막 칸의 <em>다음</em> 칸을 가리킵니다. ' +
                    `그래서 두 답을 빼면 개수 ${개수} 가 그대로 나옵니다 — 개수를 세려고 훑을 필요가 없습니다.`;
            },
            '#bs-mode': ({ el }) => {
                const v = el.value;
                if (v === 'exact') {
                    return '<strong>정확히 찾기</strong>는 <code>hi</code> 를 마지막 칸 번호로 두고 ' +
                        '<code>while lo &lt;= hi</code> 로 돕니다. 같은 값을 만나면 그 자리에서 멈추니, ' +
                        '중복이 있으면 <strong>몇 번째 칸이 나올지는 정해져 있지 않습니다.</strong>';
                }
                if (v === 'left') {
                    return '<strong>왼쪽 경계</strong>는 <code>hi</code> 를 칸 수(마지막 칸 번호가 아니라)로 두고 ' +
                        '<code>while lo &lt; hi</code> 로 돕니다. 찾는 값과 같아도 왼쪽을 계속 좁히니 ' +
                        '<strong>같은 값 중 첫 칸</strong>에 멈춥니다.';
                }
                return '<strong>오른쪽 경계</strong>는 왼쪽 경계와 부등호 하나만 다릅니다. ' +
                    '<code>&lt;</code> 가 <code>&lt;=</code> 로 바뀌면 같은 값을 만나도 오른쪽으로 밀어서, ' +
                    '<strong>같은 값의 마지막 칸 다음</strong>에 멈춥니다.';
            },
        },
        tour: [
            {
                el: '.bs-array',
                title: '배열은 정렬돼 있다',
                body: '이분 탐색의 유일한 전제입니다. 정렬이 안 된 배열에 쓰면 답이 틀리는데, ' +
                    '<strong>우연히 맞는 경우가 있어서</strong> 더 위험합니다.'
            },
            {
                el: '#bs-step',
                title: 'Step 을 눌러 보세요',
                body: '한 회차가 지나면 칸의 절반이 흐려집니다. 흐려진 칸은 <strong>다시는 안 봅니다</strong>. ' +
                    '가운데 값 하나만 보고 나머지 절반을 통째로 지운 것입니다.',
                waitFor: 'click'
            },
            {
                el: '.bs-markers',
                title: 'lo 와 hi 가 후보 구간이다',
                body: '남은 후보 칸 수가 회차마다 절반으로 줍니다. ' +
                    '<code>mid</code> 는 매번 그 구간의 가운데라 <strong>계산으로만 정해집니다</strong> — 찾아다니지 않습니다.'
            },
            {
                el: '#bs-mode',
                title: '변형을 바꿔 보세요',
                body: '같은 배열, 같은 찾는 값인데 답이 달라집니다. 세 변형의 코드 차이는 ' +
                    '<code>hi</code> 초기값과 부등호 하나뿐입니다. <strong>코딩 테스트에서 틀리는 자리가 여기입니다.</strong>',
                waitFor: 'input'
            },
            {
                el: '#bs-cmp-linear',
                title: '훑기와 견줘 보세요',
                body: '찾는 값이 맨 앞이면 훑기가 더 빠릅니다. 이분 탐색의 값어치는 평균이 아니라 ' +
                    '<strong>가장 운 나쁜 경우에도 이 회차를 넘지 않는다</strong>는 보장입니다.'
            }
        ]
    },

    // ==========================================
    // DFS · BFS (알고리즘)
    // ==========================================
    'bfs-dfs': {
        analogy: '스택이냐 큐냐 하나만 바뀌는데, 그 하나가 최단 거리를 주느냐를 가른다',
        anchor: '.bd-controls',
        embedKeep: ['.bd-controls', '.bd-stage', '.bd-track', '.bd-verdict', '.bd-actions', '.bd-legend'],
        embedHide: ['.demo-prereq', '.demo-tldr-analogy', '.demo-intro', '.demo-steps', '.demo-tldr', '.demo-next', '.demo-practice'],
        explain: {
            'input[name="bd-mode"]': ({ el }) => {
                if (el.value === 'dfs') {
                    return '<strong>깊이 우선</strong>으로 바꿨습니다. 스택은 마지막에 넣은 것부터 꺼내니 ' +
                        '한 갈래를 끝까지 파고들었다가 되돌아옵니다. ' +
                        '<strong>이 순서로 어떤 마디에 처음 닿아도 그것이 최단이라는 보장은 없습니다.</strong>';
                }
                return '<strong>너비 우선</strong>으로 바꿨습니다. 큐는 먼저 넣은 것부터 꺼내니 ' +
                    '한 칸 거리를 다 본 뒤에야 두 칸 거리로 넘어갑니다. ' +
                    '그래서 <strong>어떤 마디에 처음 닿은 순간이 곧 최단 거리</strong>이고, 마디 위에 그 거리가 뜹니다.';
            },
            '#bd-mark': ({ el }) => {
                const 넣은 = document.querySelector('#bd-push');
                if (el.value === 'push') {
                    return '표시를 <strong>큐에 넣을 때</strong> 하도록 되돌렸습니다. ' +
                        '한 마디가 큐에 최대 한 번만 들어가니 넣은 횟수가 마디 수를 안 넘습니다.';
                }
                return '표시를 <strong>꺼낼 때</strong>로 바꿨습니다. 여러 이웃이 같은 마디를 동시에 발견하면 ' +
                    '그 마디가 큐에 여러 번 들어갑니다. 끝까지 돌려 아래 <strong>넣은 횟수</strong>를 비교해 보세요' +
                    (넣은 ? '' : '') + ' — 답은 같은데 큐만 부풉니다. 마디 만 개짜리 문제에서는 이것만으로 시간 초과가 납니다.';
            },
        },
        tour: [
            {
                el: '.bd-stage',
                title: '같은 그래프를 두 방법으로',
                body: 'A 에서 출발합니다. D 에 닿는 길이 A→B→D 와 A→C→D 둘이라 ' +
                    '<strong>같은 마디를 두 번 방문하지 않게 막는 장치</strong>가 필요합니다.'
            },
            {
                el: '#bd-step',
                title: 'Step 을 눌러 보세요',
                body: '스택·큐에서 <strong>굵게 표시된 것</strong>이 다음에 꺼낼 것입니다. ' +
                    '스택은 오른쪽 끝, 큐는 왼쪽 끝 — 여기가 두 탐색의 유일한 차이입니다.',
                waitFor: 'click'
            },
            {
                el: '.bd-radios',
                title: '큐로 바꿔 보세요',
                body: '같은 그래프인데 방문 순서가 달라집니다. 마디 위에 뜨는 숫자가 ' +
                    '<strong>A 에서의 최단 거리</strong>이고, 끝까지 돌리면 G 까지의 길이 굵은 선으로 표시됩니다.',
                waitFor: 'change'
            },
            {
                el: '.bd-counts',
                title: '넣은 횟수를 보세요',
                body: 'BFS 에서 방문 표시를 "꺼낼 때"로 바꾸면 이 숫자가 늡니다. ' +
                    '<strong>답은 그대로인데 큐만 부푸는</strong> 것이라 코딩 테스트에서 원인을 찾기 어렵습니다.'
            }
        ]
    },

    // ==========================================
    // 메서드별 요청과 응답 보기 (입문)
    // ==========================================
    'http-methods': {
        analogy: '같은 주소에 메서드만 바꿔 보내면, 응답과 서버 데이터가 어디서 달라지는지가 보인다',
        anchor: '.hm-form',
        embedKeep: ['.hm-page'],
        embedHide: ['#hm-lab > h2', '#hm-lab > .hm-lead', '.hm-log', '#hm-compare', '#hm-real'],
        explain: {
            // 메서드 버튼 — 고른 순간 무엇이 달라지는지. 보낸 뒤의 결과는 페이지 자체의 판정 칸이 말한다.
            '.hm-m': ({ el }) => {
                switch (el.dataset.method) {
                    case 'GET':
                        return 'GET 을 골랐습니다. 읽기만 하는 요청이라 <strong>본문 칸이 잠겼습니다</strong>. 주소만으로 뜻이 다 전해집니다.';
                    case 'POST':
                        return 'POST 를 골랐습니다. 목록 주소 <strong>/v1/posts</strong> 로 보내면 새 글이 만들어집니다. 본문에 title 이 꼭 있어야 합니다.';
                    case 'PUT':
                        return 'PUT 을 골랐습니다. 글 하나를 <strong>통째로 교체</strong>합니다. 본문에 없는 칸은 기본값으로 돌아가니 likes 칸을 지켜보세요.';
                    case 'PATCH':
                        return 'PATCH 를 골랐습니다. 본문에 적은 <strong>칸만</strong> 바뀌고 나머지는 그대로입니다.';
                    case 'DELETE':
                        return 'DELETE 를 골랐습니다. 본문 없이 주소의 글을 지웁니다. 잘 되면 <strong>본문 없는 204</strong> 가 옵니다.';
                    default:
                        return '';
                }
            },
            '#hm-target': ({ value }) =>
                value === 'one'
                    ? '주소가 <strong>글 하나</strong>를 가리킵니다. 뒤의 번호가 어느 글인지 정합니다. 없는 번호를 넣으면 404 가 옵니다.'
                    : '주소가 <strong>글 전체(목록)</strong>를 가리킵니다. GET 은 목록을 주고, POST 는 여기에 새 글을 만듭니다.',
            '#hm-reset': () =>
                '서버 데이터를 처음 세 글로 되돌렸습니다. 아래 기록 표는 그대로라 지금까지 무엇을 보냈는지는 남아 있습니다.'
        },
        tour: [
            {
                el: '.hm-chips',
                title: '따라 해 보기',
                body: '1번부터 8번까지 순서대로 누르면 다섯 메서드를 한 바퀴 돕니다. ' +
                    '먼저 <strong>3 새 글 만들기</strong>를 눌러 보세요.',
                waitFor: 'click'
            },
            {
                el: '#hm-res',
                title: '응답 원문',
                body: '상태 줄이 <strong>201 Created</strong> 이고, 헤더의 <strong>Location</strong> 이 새 글의 주소를 알려 줍니다. ' +
                    '본문에는 서버가 만든 글이 그대로 옵니다.'
            },
            {
                el: '.hm-server',
                title: '서버 데이터',
                body: '표에 14번 글이 <strong>새로 생김</strong> 표시와 함께 늘었습니다. ' +
                    '이제 <strong>4 제목만 고치기</strong>와 <strong>5 통째로 바꾸기</strong>를 번갈아 눌러 likes 칸이 어떻게 다른지 보세요.'
            }
        ]
    },

    // ==========================================
    // 하둡 상자 그림 여섯 장 (입문)
    // ==========================================
    'hadoop-boxes': {
        analogy: '상자 하나가 서버 한 대. 접속 주소에 적힌 다섯 상자는 Hive 서버가 아니라 ZooKeeper 다',
        anchor: '.hb-host',
        embedKeep: ['.hb-page'],
        embedHide: ['.hb-hero', '.hb-sec > h2', '.hb-real'],
        explain: {
            // 그림을 누르면 그 그림이 말로 안 한 것 하나
            '.hb-sec': ({ el }) => {
                switch (el.dataset.fig) {
                    case '1': return '워커는 <strong>수십에서 수백 대</strong>인데 역할이 하나씩인 서버는 몇 대뿐입니다. 클러스터가 커진다는 말은 워커 상자가 늘어난다는 뜻입니다.';
                    case '2': return '조각을 세 벌 두는 값은 디스크입니다. 384 MB 파일이 디스크 <strong>1,152 MB</strong> 를 씁니다. 대신 상자 두 대가 동시에 꺼져도 파일이 살아 있습니다.';
                    case '3': return '큐가 가득 차면 쿼리는 ACCEPTED 상태로 줄에 서 있습니다. 실행 중이 아니라 <strong>기다리는 중</strong>이라 아무 일도 안 일어나는 것처럼 보입니다.';
                    case '4': return 'Spark 나 Trino 는 HiveServer2 를 거치지 않고 <strong>Metastore 에 직접</strong> 붙어 목록을 읽습니다. 그래서 같은 테이블을 여러 엔진이 읽을 수 있습니다.';
                    case '5': return 'ZooKeeper 가 다섯 대인 이유는 <strong>과반</strong>입니다. 셋만 살아 있으면 답합니다. 짝수로 두면 반반으로 갈라질 수 있어 홀수로 둡니다.';
                    case '6': return '내가 직접 붙는 곳은 1 과 3 두 자리뿐입니다. 4 부터 7 은 HiveServer2 가 대신 다니는 길이라 <strong>내 컴퓨터에는 그 주소가 없습니다</strong>.';
                    default: return '';
                }
            }
        },
        tour: [
            { el: '#hb-fig1', title: '상자 하나가 서버 한 대', body: '상자에 적힌 글자는 그 서버에서 돌아가는 프로그램입니다. 맨 아래 워커 상자는 역할이 <strong>둘</strong>입니다.' },
            { el: '#hb-fig5', title: '주소가 가리키는 상자', body: '주소 조각에서 나가는 화살표를 따라가 보세요. 다섯 서버는 <strong>ZooKeeper</strong> 로, 큐 이름 하나만 ResourceManager 로 갑니다.' },
            { el: '#hb-fig6', title: '쿼리 한 건의 길', body: '번호 1 부터 7 까지가 순서입니다. 내가 직접 가는 곳은 1 과 3 두 자리뿐입니다.' }
        ]
    },

    // ==========================================
    // 하둡 카드 여섯 장 (입문)
    // ==========================================
    'hadoop-cards': {
        analogy: '카드 하나가 개념 하나. 점이 흐르는 방향이 데이터와 요청이 가는 방향이다',
        anchor: '.hc-host',
        embedKeep: ['.hc-grid'],
        embedHide: ['.hc-hero', '.hc-real'],
        explain: {
            '.hc-card': ({ el }) => {
                switch (el.dataset.card) {
                    case 'cluster': return '워커 상자의 두 색 칸이 두 역할입니다. 파랑 칸이 저장(DataNode), 벽돌색 칸이 계산(NodeManager)입니다. 같은 상자라서 <strong>데이터 있는 자리에서 계산</strong>합니다.';
                    case 'hdfs': return '점이 세 갈래로 흘러가는 것이 세 벌 복제입니다. DataNode 하나가 꺼져도 같은 번호 조각이 <strong>다른 두 대</strong>에 남아 있습니다.';
                    case 'yarn': return '벽돌색 네모(T)가 워커로 내려가는 것이 계산 조각 배치입니다. 어느 워커로 가는지는 <strong>데이터 조각이 어디 있나</strong>로 정해집니다.';
                    case 'hive': return '점이 1 부터 5 까지 순서대로 한 바퀴 돕니다. 2 에서 Metastore 가 돌려주는 답은 데이터가 아니라 <strong>HDFS 경로</strong>입니다.';
                    case 'zookeeper': return 'HiveServer2 가 켜질 때 올라가는 점이 <strong>등록</strong>입니다. 그래서 주소에 HiveServer2 이름을 적지 않아도 찾아갈 수 있습니다.';
                    case 'jdbc': return '주소 조각 다섯 개가 상자 셋으로 갑니다. 회색은 ZooKeeper, 먹색 둘은 HiveServer2, 벽돌색 하나만 <strong>YARN 큐</strong>입니다.';
                    default: return '';
                }
            }
        },
        tour: [
            { el: '.hc-legend', title: '색 네 가지', body: '파랑은 저장, 벽돌색은 계산, 먹색은 Hive 서버, 회색은 ZooKeeper 입니다. 점은 지금 가고 있는 데이터나 요청입니다.' },
            { el: '[data-card="jdbc"]', title: '주소 한 줄이 가리키는 곳', body: '주소 조각에서 나가는 점을 따라가 보세요. 다섯 서버는 <strong>ZooKeeper</strong> 입니다.', waitFor: 'click' },
            { el: '[data-card="hive"]', title: '쿼리 한 건의 길', body: '점이 1 부터 5 까지 순서대로 돕니다. 내가 직접 말하는 상대는 <strong>HiveServer2</strong> 하나입니다.' }
        ]
    },

    // ==========================================
    // 데이터 건네기 카드 여덟 장 (입문)
    // ==========================================
    'data-handoff': {
        analogy: '방법은 여덟이지만 오가는 모양은 넷. 테이블, 파일, 토픽, API 중 무엇을 누가 얼마나 자주 옮기나',
        anchor: '.dh-host',
        embedKeep: ['.dh-grid'],
        embedHide: ['.dh-hero', '.dh-real'],
        explain: {
            '.dh-card': ({ el }) => {
                switch (el.dataset.card) {
                    case 'grant': return '함정은 <strong>권한이 곧 전달</strong>이라는 것입니다. 팀 B 가 테이블을 지우거나 바꿀 수 있는 권한까지 받으면 팀 A 의 데이터가 흔들립니다. SELECT 만 줍니다.';
                    case 'batch': return '함정은 <strong>운영 DB 가 느려지는 것</strong>입니다. 새벽에 전체를 읽으면 서비스가 같은 DB 를 쓰는 동안 느려집니다. 증분 복사에는 갱신 시각 컬럼이 있어야 합니다.';
                    case 'cdc': return '함정은 <strong>순서와 중복</strong>입니다. 같은 행이 두 번 바뀌면 메시지도 둘이고, 받는 쪽이 마지막 것만 남겨야 합니다. 배치보다 설정할 것이 많습니다.';
                    case 'file': return '함정은 <strong>「다 썼다」는 신호</strong>입니다. 파일을 쓰는 중에 읽으면 반쪽만 읽습니다. _SUCCESS 표시 파일이나 파티션 이름으로 끝났음을 알립니다.';
                    case 'topic': return '함정은 <strong>보존 기간</strong>입니다. 7일 보존이면 8일 멈춘 소비자는 앞 하루치를 영영 못 받습니다. 그래서 파일과 같이 두는 팀이 많습니다.';
                    case 'api': return '함정은 <strong>호출 수</strong>입니다. 리포트 화면이 한 줄에 한 번씩 부르면 화면 하나에 요청 수백 번이 됩니다. 목록은 한 번에 나눠 받는 방식이어야 합니다.';
                    case 'log': return '함정은 <strong>남기는 쪽이 서비스 팀</strong>이라는 것입니다. 로그 한 줄이 빠지면 뒤의 모든 자리가 빕니다. 요청서에 필드와 언제 남기는지를 적어 둡니다.';
                    case 'reverse': return '함정은 <strong>낡은 값</strong>입니다. 매일 새로 계산하면 서비스는 최대 하루 전 값을 봅니다. 그것이 괜찮은 용도(세그먼트)에만 씁니다.';
                    default: return '';
                }
            }
        },
        tour: [
            { el: '.dh-legend', title: '색 네 가지', body: '파랑은 놓여 있는 것, 벽돌색은 흐르는 것, 먹색은 부르는 것, 회색은 옮기는 도구입니다. 점이 몰려 지나가면 배치입니다.' },
            { el: '[data-card="file"]', title: '팀 간에 가장 흔한 것', body: '파일을 놓고 경로만 알려 줍니다. 점이 한 번 몰려 들어가고, 받는 쪽이 나중에 읽어 갑니다.', waitFor: 'click' },
            { el: '[data-card="api"]', title: 'API 는 조회용', body: '건 하나가 요청 하나입니다. 228만 건을 이렇게 받지는 않습니다.' }
        ]
    },

    // ==========================================
    // Hadoop, Hive, Spark 자리 카드 여섯 장 (입문)
    // ==========================================
    'cluster-roles': {
        analogy: '세 이름은 프로그램이고 노드는 자리다. 워커 한 대의 1층 저장, 2층 자리 배분은 같이 쓰고 3층 프로그램만 다르다',
        anchor: '.cr-host',
        embedKeep: ['.cr-grid'],
        embedHide: ['.cr-hero', '.cr-real'],
        explain: {
            '.cr-card': ({ el }) => {
                switch (el.dataset.card) {
                    case 'nodes': return '헷갈리는 것은 <strong>엣지 노드</strong>입니다. 클러스터 안이지만 데이터도 계산도 없는 서버입니다. 내가 명령을 치는 자리이고, Spark 의 driver 가 여기서 뜨는 경우가 많습니다.';
                    case 'layers': return '헷갈리는 것은 <strong>NodeManager 와 executor 의 차이</strong>입니다. NodeManager 는 늘 켜져 있는 자리 배분 담당이고, executor 는 그 자리를 받아 작업 동안만 도는 프로세스입니다.';
                    case 'hive': return '헷갈리는 것은 <strong>Hive 가 계산을 안 한다</strong>는 점입니다. HiveServer2 는 계획을 세우고 결과를 모을 뿐, 세는 일은 Tez 컨테이너가 합니다. 엔진을 Spark 로 바꾸는 설정도 있습니다.';
                    case 'spark': return '헷갈리는 것은 <strong>driver 가 뜨는 자리</strong>입니다. 클라이언트 모드면 내 엣지 노드에, 클러스터 모드면 워커의 컨테이너 하나에 뜹니다. 엣지 노드를 닫으면 클라이언트 모드 작업은 같이 죽습니다.';
                    case 'shared': return '헷갈리는 것은 <strong>Trino 는 YARN 을 안 쓴다</strong>는 점입니다. 자기 워커 서버가 따로 있고 Metastore 목록과 HDFS 파일만 빌려 씁니다. 그래서 큐 이름이 없습니다.';
                    case 'names': return '헷갈리는 것은 <strong>Spark 는 두 층에 걸쳐 있다</strong>는 점입니다. 엔진이면서 사람이 쓰는 Spark SQL 과 DataFrame 도 갖습니다. Hive 는 엔진이 없어서 Tez 나 Spark 를 빌립니다.';
                    default: return '';
                }
            }
        },
        tour: [
            { el: '[data-card="layers"]', title: '워커 한 대의 단면', body: '1층 저장과 2층 자리 배분은 Hive 와 Spark 가 같이 씁니다. 다른 것은 <strong>3층의 프로그램</strong>뿐입니다.' },
            { el: '[data-card="spark"]', title: 'driver 와 executor', body: 'Spark 는 작업마다 driver 하나를 띄우고, driver 가 워커에 executor 를 띄웁니다. HiveServer2 같은 상주 서버가 없습니다.', waitFor: 'click' },
            { el: '[data-card="names"]', title: '이름표 정리', body: 'Hadoop 은 아래 두 층의 이름입니다. Hive 와 Spark 는 그 위에서 도는 프로그램입니다.' }
        ]
    },

    // ==========================================
    // 데이터 엔지니어 첫 6개월 카드 여섯 장 (입문)
    // ==========================================
    'de-first-months': {
        analogy: '저장소는 수급, 모델, 부품, 실시간 네 층이고 새로 온 사람은 그 순서로 올라간다. 점이 가는 방향이 데이터와 코드가 가는 방향이다',
        anchor: '.dm-host',
        embedKeep: ['.dm-grid'],
        embedHide: ['.dm-hero', '.dm-real'],
        explain: {
            '.dm-card': ({ el }) => {
                switch (el.dataset.card) {
                    case 'map': return '헷갈리는 것은 <strong>DAG 가 데이터를 만들지 않는다</strong>는 점입니다. DAG 는 순서와 시각이고, 표를 어떻게 만드나는 SQL 모델에 있습니다. 파일 수가 가장 많은 층이 SQL 모델인 이유입니다.';
                    case 'extract': return '헷갈리는 것은 <strong>파이썬 파일이 하는 일</strong>입니다. 읽고 쓰는 것은 YAML 과 부품이 하고, 파이썬은 언제 돌리나만 적습니다. 원천을 바꾸려면 YAML 을 봅니다.';
                    case 'dbt': return '헷갈리는 것은 <strong>순서를 누가 정하나</strong>입니다. 사람이 적지 않습니다. SQL 안의 source 와 ref 를 보고 도구가 태스크를 잇습니다. 순서를 따로 적으면 두 곳이 어긋납니다.';
                    case 'operator': return '헷갈리는 것은 <strong>Spark 가 계산 엔진이 아니라는 점</strong>입니다. 이 저장소에서 Spark 는 읽고 쓰는 커넥터이고, repartition 이나 broadcast 같은 성능 조절 설정이 하나도 없습니다.';
                    case 'flink': return '헷갈리는 것은 <strong>워터마크</strong>입니다. 지연이 아니라 「이 시각까지는 다 왔다」고 보는 기준선입니다. 10초 늦게 긋고, 그 선이 지난 뒤 온 것이 늦은 로그입니다.';
                    case 'ship': return '헷갈리는 것은 <strong>PR 라벨</strong>입니다. 이 저장소는 flink 라벨을 붙이면 test 배포가 돕니다. 장식이 아니라 스위치입니다.';
                    default: return '';
                }
            }
        },
        tour: [
            { el: '[data-card="map"]', title: '저장소는 네 층', body: '폴더 넷이 층 넷입니다. 파일 수가 가장 많은 층은 <strong>SQL 모델</strong>이고, 실제 로직이 거기 있습니다.' },
            { el: '[data-card="extract"]', title: '첫 달의 일', body: '표 하나를 매일 복사하는 DAG 한 장입니다. 두 파일인데 첫 두 주의 커밋이 거의 다 붙습니다. 그 팀의 규칙을 처음 밟기 때문입니다.', waitFor: 'click' },
            { el: '[data-card="flink"]', title: '넷째 달의 일', body: '실시간 잡 하나를 통째로 만듭니다. 원천에 맞는 커넥터가 없어서 <strong>Java 클래스를 처음부터</strong> 직접 만들었습니다.' }
        ]
    },

    // ==========================================
    // 타겟팅 카드 아홉 장 (입문)
    // ==========================================
    'targeting-cards': {
        analogy: '조건은 캠페인에 놓여 있고 유저 정보는 요청과 함께 온다. 둘을 대 보는 자리가 광고 서버이고, 목록은 배치가 만든다',
        anchor: '.tg-host',
        embedKeep: ['.tg-grid'],
        embedHide: ['.tg-hero', '.tg-real'],
        explain: {
            '.tg-card': ({ el }) => {
                switch (el.dataset.card) {
                    case 'meet': return '헷갈리는 것은 <strong>조건을 누가 갖고 있나</strong>입니다. 유저가 아니라 캠페인이 갖고 있습니다. 유저 쪽에서 오는 것은 나이, 지역, 세그먼트 목록 같은 정보뿐이고, 판단은 광고 서버가 합니다.';
                    case 'funnel': return '헷갈리는 것은 <strong>막대의 뜻</strong>입니다. 남은 개수가 아니라 「앞 단계에서 얼마나 남았나」입니다. 타겟 조건만 3.5% 이고 나머지 셋은 절반쯤씩 남깁니다. 그래서 타겟 조건이 가장 큰 필터입니다.';
                    case 'types': return '헷갈리는 것은 <strong>여덟 가지가 서로 다른 기술이 아니라는 점</strong>입니다. 광고 서버가 보기에는 전부 「이 사람이 어느 목록에 들어 있나」입니다. 이름은 목록을 어떻게 만들었나에 따라 붙습니다.';
                    case 'segment': return '헷갈리는 것은 <strong>세그먼트와 오디언스</strong>입니다. 세그먼트는 조건 한 벌이고 오디언스는 그 조건으로 만든 사람 목록입니다. 실무에서는 둘을 섞어 부르지만, 배치가 만드는 것은 목록 쪽입니다.';
                    case 'custom': return '헷갈리는 것은 <strong>해시</strong>입니다. 이메일을 그대로 올리지 않고 한 방향으로 바꾼 값을 올립니다. 플랫폼도 같은 방식으로 바꾼 회원 이메일과 비교하므로, 양쪽 다 원문을 상대에게 보이지 않고 맞출 수 있습니다.';
                    case 'lookalike': return '헷갈리는 것은 <strong>확장 비율의 분모</strong>입니다. 씨앗의 10% 가 아니라 전체 회원의 10% 입니다. 그래서 씨앗 8만 명에서 10% 확장이 140만 명이 됩니다.';
                    case 'retarget': return '헷갈리는 것은 <strong>누가 기록을 남기나</strong>입니다. 광고 플랫폼이 아니라 광고주 사이트에 심어 둔 픽셀이 남깁니다. 그래서 광고주가 픽셀을 안 심으면 리타겟팅 목록은 비어 있습니다.';
                    case 'freqcap': return '헷갈리는 것은 <strong>어디에서 세나</strong>입니다. 캠페인이 아니라 사람과 광고의 짝마다 셉니다. 회원 A 에게 광고 9931 은 2회, 광고 7720 은 3회처럼 짝마다 다른 값을 갖습니다.';
                    case 'signal': return '헷갈리는 것은 <strong>왜 열린 RTB 는 못 찾는 사람이 생기나</strong>입니다. 쿠키는 브라우저마다 다르고 지워지기도 합니다. 같은 사람이 폰과 PC 에서 다른 쿠키를 갖고, 광고주 쪽 목록에는 그중 하나만 있을 수 있습니다.';
                    default: return '';
                }
            }
        },
        tour: [
            { el: '.tg-legend', title: '색 네 가지와 점선', body: '파랑은 놓여 있는 목록, 벽돌색은 지금 오는 것, 먹색은 정하는 서버, 회색은 만드는 작업입니다. 점선 상자는 광고주가 적어 둔 조건입니다.' },
            { el: '[data-card="meet"]', title: '가장 먼저 볼 것', body: '조건은 왼쪽에 놓여 있고 유저 정보는 오른쪽에서 옵니다. 광고 서버가 둘을 대 봅니다.', waitFor: 'click' },
            { el: '[data-card="segment"]', title: '목록은 누가 만드나', body: '사람이 조건을 적고, 배치 작업이 매일 새벽 목록을 만듭니다. 광고 서버는 만들어진 목록을 읽기만 합니다.' }
        ]
    },

    // ==========================================
    // 학습 데이터 카드 여섯 장 (입문)
    // ==========================================
    'training-cards': {
        analogy: '로그는 그대로 학습 데이터가 되지 않는다. 라벨이 늦게 오고, 배운 자리와 쓰는 자리가 다르고, 자리 효과가 품질로 섞여 든다',
        anchor: '.tg-host',
        embedKeep: ['.tg-grid'],
        embedHide: ['.tg-hero', '.tg-real'],
        explain: {
            '.tg-card': ({ el }) => {
                switch (el.dataset.card) {
                    case 'delay': return '헷갈리는 것은 <strong>놓친 전환이 어디로 가나</strong>입니다. 사라지는 것이 아니라 「안 샀다」로 학습에 들어갑니다. 그래서 기다리지 않으면 라벨이 없는 게 아니라 <strong>틀린 라벨</strong>이 생깁니다.';
                    case 'ssb': return '헷갈리는 것은 <strong>왜 클릭한 것만으로 배우면 안 되나</strong>입니다. 클릭한 사람은 이미 관심이 있는 사람이라, 그들만 보고 배운 확률을 아직 안 누른 노출 전체에 쓰면 맞지 않습니다.';
                    case 'position': return '헷갈리는 것은 <strong>보정이 무엇을 되돌리나</strong>입니다. 클릭 수를 늘리는 것이 아니라, 그 자리에서 눈길이 닿았을 확률로 나누는 것입니다. 1위는 100%로 나누니 그대로이고 5위는 15%로 나누니 커집니다.';
                    case 'negsample': return '헷갈리는 것은 <strong>보정을 왜 상수 하나로 못 하나</strong>입니다. 부풀림의 배수가 확률대마다 다릅니다. 진짜 0.5%는 약 9.4배, 진짜 5%는 약 6.8배 부풉니다. 그래서 예측값마다 공식을 통과시킵니다.';
                    case 'convdef': return '헷갈리는 것은 <strong>전체 COPC 가 1.00 인데 왜 문제인가</strong>입니다. 과소와 과대가 서로를 지워 평균만 맞기 때문입니다. 광고주 한 곳씩 보면 2.5배와 20배로 갈려 있습니다.';
                    case 'tenlogs': return '헷갈리는 것은 <strong>왜 Bid 로그가 저장량 1위인가</strong>입니다. 보존은 30일로 가장 짧은데 하루 30억 건이라 그렇습니다. 전환 로그는 2년을 남겨도 28GB 입니다.';
                    default: return '';
                }
            }
        },
        tour: [
            { el: '.tg-legend', title: '색 네 가지', body: '파랑은 놓여 있는 데이터, 벽돌색은 지금 오는 것, 먹색은 모델과 서버, 회색은 만드는 작업입니다.' },
            { el: '[data-card="delay"]', title: '가장 먼저 볼 것', body: '클릭은 지금 찍히고 전환은 나중에 옵니다. 언제 학습하느냐가 라벨의 정확도를 정합니다.', waitFor: 'click' },
            { el: '[data-card="tenlogs"]', title: '데이터가 왜 모자라나', body: '요청 3만 건이 있어야 전환 한 건입니다. pCVR 모델이 늘 데이터에 시달리는 이유가 이 줄에 있습니다.' }
        ]
    },

    // ==========================================
    // 서빙 카드 다섯 장 (중급)
    // ==========================================
    'serving-cards': {
        analogy: '예산은 0.1초이고 테이블은 수십 GB 다. 후보를 줄이고, 배치로 묶고, 표를 쪼개는 자리마다 숫자가 정해진다',
        anchor: '.tg-host',
        embedKeep: ['.tg-grid'],
        embedHide: ['.tg-hero', '.tg-real'],
        explain: {
            '.tg-card': ({ el }) => {
                switch (el.dataset.card) {
                    case 'retrieval': return '헷갈리는 것은 <strong>내적이 왜 그렇게 빠른가</strong>입니다. 유저 쪽 계산을 요청당 한 번만 하고, 광고 쪽 숫자 묶음은 미리 만들어 두기 때문입니다. 남는 일은 곱하고 더하는 것뿐입니다.';
                    case 'skew': return '헷갈리는 것은 <strong>어긋남의 방향</strong>입니다. 배치값은 늘 과거라 한쪽으로만 틀립니다. 오늘 활발해진 유저를 항상 낮게 봅니다. 가장 반응이 좋은 유저에게 가장 낮게 입찰하는 셈입니다.';
                    case 'batch': return '헷갈리는 것은 <strong>왜 배치를 무한정 못 키우나</strong>입니다. 서버를 줄이는 이득은 금방 포화되는데, 모이기를 기다리는 시간은 계속 선형으로 붙기 때문입니다.';
                    case 'hashing': return '헷갈리는 것은 <strong>97.8%가 부딪치는데 왜 괜찮은가</strong>입니다. 충돌 상대가 대개 노출이 거의 없는 꼬리 광고라 그렇습니다. 문제는 머리끼리 부딪친 200쌍입니다.';
                    case 'embtable': return '헷갈리는 것은 <strong>왜 학습에서 3배가 되나</strong>입니다. 옵티마이저가 값마다 상태를 따로 들기 때문입니다. Adam 은 값 하나가 숫자 세 개가 됩니다.';
                    default: return '';
                }
            }
        },
        tour: [
            { el: '.tg-legend', title: '색 네 가지', body: '파랑은 놓여 있는 데이터, 벽돌색은 지금 오는 것, 먹색은 모델과 서버, 회색은 만드는 작업입니다.' },
            { el: '[data-card="retrieval"]', title: '가장 먼저 볼 것', body: '예산 0.1초 안에 후보 10만 개를 다 볼 수 없습니다. 가벼운 방법으로 먼저 추립니다.', waitFor: 'click' },
            { el: '[data-card="batch"]', title: '서버 수가 정해지는 자리', body: '배치를 키우면 서버가 줄고 지연이 붙습니다. 예산을 안 넘기는 가장 큰 배치를 고릅니다.' }
        ]
    },

    // ==========================================
    // 실험 카드 두 장 (중급)
    // ==========================================
    'experiment-cards': {
        analogy: '숫자는 맞는데 결론이 뒤집힌다. 두 팔이 같은 양을 샀는지, 두 무리가 원래 같은 사람들인지를 먼저 본다',
        anchor: '.tg-host',
        embedKeep: ['.tg-grid'],
        embedHide: ['.tg-hero', '.tg-real'],
        explain: {
            '.tg-card': ({ el }) => {
                switch (el.dataset.card) {
                    case 'abarms': return '헷갈리는 것은 <strong>왜 더 잘 맞히는 모델이 지나</strong>입니다. 예측이 높아지면 입찰가도 높아져 노출 하나를 더 비싸게 삽니다. 같은 예산으로 살 수 있는 양이 줄어, 저녁 값진 시간 전에 돈이 끝납니다.';
                    case 'confound': return '헷갈리는 것은 <strong>층을 나누는 일이 무엇을 하나</strong>입니다. 원래 비슷한 사람끼리만 견주게 만듭니다. 층 안에서는 노출 여부가 거의 무작위에 가까워져, 남은 차이가 광고 효과에 가깝습니다.';
                    default: return '';
                }
            }
        },
        tour: [
            { el: '[data-card="abarms"]', title: '먼저 정할 것', body: '지표의 분모입니다. 예산이 남으면 요청당, 예산을 다 쓰면 같은 돈당이 맞습니다.', waitFor: 'click' },
            { el: '[data-card="confound"]', title: '두 무리가 같은 사람들인가', body: '광고는 살 것 같은 사람에게 먼저 갑니다. 그 쏠림을 걷어내야 효과가 보입니다.' }
        ]
    },

    // ==========================================
    // 인과추론 카드 네 장 (중급)
    // ==========================================
    'causal-cards': {
        analogy: '광고가 진짜 만든 차이를 재는 네 방법. 무엇을 손에 쥐고 있느냐가 방법을 정한다',
        anchor: '.tg-host',
        embedKeep: ['.tg-grid'],
        embedHide: ['.tg-hero', '.tg-real'],
        explain: {
            '.tg-card': ({ el }) => {
                switch (el.dataset.card) {
                    case 'rct': return '헷갈리는 것은 <strong>무작위 배정이 왜 모르는 특성까지 같게 만드나</strong>입니다. 배정을 사람의 특성과 무관하게 정하기 때문입니다. 특성이 무엇인지 알 필요가 없고, 이름을 몰라도 두 무리에 비슷한 비율로 섞입니다.';
                    case 'did': return '헷갈리는 것은 <strong>왜 두 번 빼나</strong>입니다. 한 번 빼면 계절이나 지역 차이가 남습니다. 대조지역의 변화를 「광고가 없었어도 일어났을 변화」로 보고 한 번 더 빼면 그것이 걷힙니다. 이 뺄셈은 두 지역이 나란히 움직였을 때만 성립합니다.';
                    case 'rdd': return '헷갈리는 것은 <strong>왜 컷 근처만 보나</strong>입니다. 멀리 떨어진 구간을 비교하면 실력 차이가 섞입니다. 같은 데이터에서 4점대와 9점대를 비교하면 2.80%p 가 나오는데, 진짜 점프는 0.65%p 입니다.';
                    case 'iv': return '헷갈리는 것은 <strong>왜 나누면 확대가 되나</strong>입니다. 배정 효과 안에는 노출되지 않은 6만 명 몫이 0 으로 섞여 있습니다. 노출된 4만 명 몫만 남기려면 그 비율로 나눠 줘야 합니다. 순응률이 낮을수록 나눗셈이 커져 추정치가 널뜁니다.';
                    default: return '';
                }
            }
        },
        tour: [
            { el: '[data-card="rct"]', title: '가장 먼저 볼 것', body: '동전 하나가 두 무리를 같게 만듭니다. 나머지 셋은 동전을 못 쓸 때의 차선입니다.', waitFor: 'click' },
            { el: '[data-card="did"]', title: '같은 데이터, 다른 답', body: '한 번만 빼면 계절과 지역이 섞입니다. 두 번 빼야 광고 몫이 남습니다.' }
        ]
    },

    // ==========================================
    // 탐색과 채점 카드 네 장 (중급)
    // ==========================================
    'explore-cards': {
        analogy: '노출을 어떻게 나누고 그 결과를 어떻게 채점하나. 넷 다 그날의 매출과 다음 날의 정보를 맞바꾼다',
        anchor: '.tg-host',
        embedKeep: ['.tg-grid'],
        embedHide: ['.tg-hero', '.tg-real'],
        explain: {
            '.tg-card': ({ el }) => {
                switch (el.dataset.card) {
                    case 'abmab': return '헷갈리는 것은 <strong>이긴 소재의 구간은 오히려 좁다</strong>는 점입니다. 밴딧이 그쪽에 트래픽을 몰아줬기 때문입니다. 밴딧은 이긴 쪽을 아주 잘 알고 진 쪽을 잘 모르는 성적표를 남깁니다.';
                    case 'ucbctx': return '헷갈리는 것은 <strong>왜 4,000회를 겪고도 못 정하나</strong>입니다. 뭉친 평균이 4.75%와 5.0%로 너무 가깝기 때문입니다. 조합마다 보면 8%와 3%처럼 격차가 큰데, 평균이 그 격차를 서로 지워 버립니다.';
                    case 'remedies': return '헷갈리는 것은 <strong>왜 역확률 가중은 굳음을 못 푸나</strong>입니다. 배분은 그대로 두고 학습 가중치만 고치기 때문입니다. 노출이 0 건인 광고는 고를 확률도 0 이라 나눗셈에서 아예 빠집니다.';
                    case 'dr': return '헷갈리는 것은 <strong>왜 하나만 맞아도 되나</strong>입니다. 예측이 맞으면 빗나간 몫이 0 에 가까워 가중이 거의 안 걸리고, 성향점수가 맞으면 그 가중이 예측의 오차를 정확히 메워 주기 때문입니다.';
                    default: return '';
                }
            }
        },
        tour: [
            { el: '[data-card="abmab"]', title: '가장 먼저 볼 것', body: '밴딧은 클릭을 더 법니다. 대신 진 소재에 대한 성적표가 흐려집니다.', waitFor: 'click' },
            { el: '[data-card="remedies"]', title: '떼어 주는 몫과 되살리는 속도', body: '한 세대에 주는 몫이 클수록 빨리 되살아납니다. 그 몫이 그날 포기하는 매출입니다.' }
        ]
    },

    // ==========================================
    // 학습 파이프라인 카드 다섯 장 (입문)
    // ==========================================
    'pipeline-cards': {
        analogy: '모델은 사람이 만드는 것이 아니라 매일 04:00 에 도는 일곱 칸이 만든다. 알람은 어느 칸이 멈췄나부터 본다',
        anchor: '.tg-host',
        embedKeep: ['.tg-grid'],
        embedHide: ['.tg-hero', '.tg-real'],
        explain: {
            '.tg-card': ({ el }) => {
                switch (el.dataset.card) {
                    case 'dag': return '헷갈리는 것은 <strong>알람에 적힌 이름</strong>입니다. pctr_daily 는 일곱 칸 전체의 이름이지 실패한 칸의 이름이 아닙니다. 알람 뒤에 붙은 build_features 같은 칸 이름이 진짜 자리입니다.';
                    case 'sensor': return '헷갈리는 것은 <strong>센서가 계산을 하지 않는다는 점</strong>입니다. 파티션이 있나 없나만 1분마다 봅니다. 그런데 이 칸이 없으면 23개만 온 채로 다음 칸이 시작되고, 모델은 오류 없이 반쪽 데이터로 학습됩니다.';
                    case 'rerun': return '헷갈리는 것은 <strong>왜 처음부터 다시 돌리지 않나</strong>입니다. 1, 2 의 결과가 이미 파티션에 놓여 있고 그 사이 입력이 안 바뀌었기 때문입니다. 멈춘 칸부터 돌리면 129분이 100분으로 줍니다.';
                    case 'backfill': return '헷갈리는 것은 <strong>학습을 30번 하지 않는다는 점</strong>입니다. 백필은 라벨과 피처 파티션 30개를 다시 만드는 일이고, 모델은 그 30개가 다 준비된 뒤 한 번 학습합니다. 그래서 한 날이 63분입니다.';
                    case 'idempotent': return '헷갈리는 것은 <strong>덧붙이기가 왜 위험한가</strong>입니다. 결과가 틀리는 것이 아니라 두 번 들어간 줄이 두 배로 학습됩니다. 절반에서 죽었다 다시 돌리면 그 절반 시간대의 로그만 2배 가중이 됩니다.';
                    default: return '';
                }
            }
        },
        tour: [
            { el: '.tg-legend', title: '색 네 가지', body: '파랑은 놓여 있는 데이터와 끝난 칸, 벽돌색은 알람과 실패와 지금 도는 칸, 먹색은 모델과 서버, 회색은 만드는 작업입니다.' },
            { el: '[data-card="dag"]', title: '가장 먼저 볼 것', body: '일곱 칸이 04:00 부터 06:09 까지 순서로 돕니다. 알람은 이 중 어느 칸이 멈췄나를 말합니다.', waitFor: 'click' },
            { el: '[data-card="idempotent"]', title: '다시 돌려도 되는 조건', body: '덮어쓰기면 몇 번 돌려도 같은 행 수입니다. 이 조건이 있어야 재실행과 백필을 안심하고 합니다.' }
        ]
    },

    // ==========================================
    // 모델 버전 카드 네 장 (입문)
    // ==========================================
    'version-cards': {
        analogy: '모델 이름은 재료 넷을 가리키는 이름이다. 재료를 적어 두지 않으면 지난주 모델을 다시 만들 수 없다',
        anchor: '.tg-host',
        embedKeep: ['.tg-grid'],
        embedHide: ['.tg-hero', '.tg-real'],
        explain: {
            '.tg-card': ({ el }) => {
                switch (el.dataset.card) {
                    case 'recipe': return '헷갈리는 것은 <strong>모델 파일이 곧 모델이 아니라는 점</strong>입니다. 파일은 결과이고 코드, 데이터, 설정, 환경 넷이 원인입니다. 파일만 남기면 「왜 이 값이 나왔나」와 「다시 만들기」 둘 다 못 합니다.';
                    case 'registry': return '헷갈리는 것은 <strong>레지스트리가 파일 창고가 아니라는 점</strong>입니다. 파일은 저장소에 있고 표는 그 파일이 무엇으로 만들어졌고 지금 어떤 상태인지를 적습니다. 서버가 읽는 것은 표의 「운영」 줄입니다.';
                    case 'lineage': return '헷갈리는 것은 <strong>질문이 거꾸로 간다는 점</strong>입니다. 만들 때는 데이터에서 배포로 가지만 물을 때는 배포에서 데이터로 갑니다. 그래서 학습 실행 번호가 데이터 파티션 목록을 들고 있어야 합니다.';
                    case 'diff': return '헷갈리는 것은 <strong>코드가 같은데 왜 다른가</strong>입니다. 코드는 재료 넷 중 하나입니다. 8월 20일 파티션이 백필로 바뀌었고 라이브러리가 올라갔고 시드가 없었으니, 남은 셋이 다 달랐습니다.';
                    default: return '';
                }
            }
        },
        tour: [
            { el: '[data-card="recipe"]', title: '가장 먼저 볼 것', body: '모델 하나는 재료 넷이 학습을 한 번 지나 나온 결과입니다. 넷이 다 같아야 같은 모델입니다.', waitFor: 'click' },
            { el: '[data-card="registry"]', title: '표 한 장', body: '버전마다 재료와 지표와 상태를 적습니다. 서버는 「운영」인 줄을 싣습니다.' },
            { el: '[data-card="diff"]', title: '다시 만들면 왜 다른가', body: '데이터 판, 라이브러리, 시드. 이 셋을 적어 두고 맞추면 같은 값이 나옵니다.' }
        ]
    },

    // ==========================================
    // Docker 와 CI 카드 네 장 (입문)
    // ==========================================
    'ci-cards': {
        analogy: '이미지는 코드 아래 층까지 굳힌 한 장이고, CI 는 커밋마다 그 장을 만들어 검문 셋을 통과시킨다. 걸린 커밋은 저장소에 오르지 않는다',
        anchor: '.tg-host',
        embedKeep: ['.tg-grid'],
        embedHide: ['.tg-hero', '.tg-real'],
        explain: {
            '.tg-card': ({ el }) => {
                switch (el.dataset.card) {
                    case 'envdrift': return '헷갈리는 것은 <strong>코드가 같은데 왜 값이 다른가</strong>입니다. 코드는 맨 위 한 층이고 그 아래 라이브러리 판이 하나 달랐습니다. 이미지는 그 아래 층까지 한 장으로 굳혀 노트북과 서버를 같게 만듭니다.';
                    case 'image': return '헷갈리는 것은 <strong>모델 파일이 왜 이미지에 없나</strong>입니다. 이미지는 코드가 바뀔 때 만들고 모델은 매일 새벽 바뀝니다. 바뀌는 주기가 다르니 따로 두고, 서버가 뜰 때 내려받습니다.';
                    case 'pipeline': return '헷갈리는 것은 <strong>CI 가 통과하면 서버에 올라간 것인가</strong>입니다. 아닙니다. 이미지가 저장소에 오른 것까지입니다. 서버 12대에 올리는 것은 배포이고 다른 절차입니다.';
                    case 'gates': return '헷갈리는 것은 <strong>유닛 테스트를 다 통과했는데 왜 또 검사하나</strong>입니다. 유닛은 함수 하나씩만 봅니다. 서버를 켜서 요청과 응답의 모양과 속도를 보는 것이 계약 테스트이고, 이미지 층의 위험과 크기를 보는 것이 이미지 검사입니다.';
                    default: return '';
                }
            }
        },
        tour: [
            { el: '.tg-legend', title: '색 네 가지', body: '파랑은 놓여 있는 것(파일, 이미지, 저장소), 벽돌색은 지금 오는 것(커밋), 먹색은 서버, 회색은 만드는 작업(빌드, 테스트, 검사)입니다.' },
            { el: '[data-card="envdrift"]', title: '가장 먼저 볼 것', body: '같은 코드와 같은 모델 파일인데 노트북과 서버의 값이 다릅니다. 다른 것은 그 아래 층입니다.', waitFor: 'click' },
            { el: '[data-card="gates"]', title: '검문 셋', body: '싼 검문부터 돕니다. 유닛 48초, 계약 2분 30초, 이미지 검사 52초. 하나라도 걸리면 거기서 멈춥니다.' }
        ]
    },

    // ==========================================
    // 추론 서버 카드 네 장 (입문)
    // ==========================================
    'inference-cards': {
        analogy: '학습 파일은 ONNX 로 바꿔 싣고, 서버는 웜업까지 끝낸 41초에 준비 신호를 켠다. 후보 800건은 한 텐서로 한 번에, 두 버전은 같이 실어 두고 설정 한 줄로 바꾼다',
        anchor: '.tg-host',
        embedKeep: ['.tg-grid'],
        embedHide: ['.tg-hero', '.tg-real'],
        explain: {
            '.tg-card': ({ el }) => {
                switch (el.dataset.card) {
                    case 'format': return '헷갈리는 것은 <strong>바꾸면 파일이 작아지나</strong>입니다. 가중치 38MB 는 그대로입니다. 줄어드는 것은 서버가 같이 실어야 하는 프레임워크 1.2GB 와 파이썬 코드이고, 그 자리에 런타임 0.8GB 만 남습니다.';
                    case 'load': return '헷갈리는 것은 <strong>적재가 끝났는데 왜 20초를 더 기다리나</strong>입니다. 첫 계산 몇 번이 느리기 때문입니다. 가짜 요청 200건으로 그 몫을 먼저 치르고 나서 준비 신호를 켭니다. 안 그러면 실제 요청이 그 몫을 치릅니다.';
                    case 'batch': return '헷갈리는 것은 <strong>800번 부르면 왜 800배가 아니라 32배인가</strong>입니다. 건당 계산 0.0036ms 는 양쪽이 같습니다. 다른 것은 호출마다 붙는 고정 비용 0.116ms 이고, 그것이 800번 쌓여 93ms 가 됩니다.';
                    case 'twoversions': return '헷갈리는 것은 <strong>두 버전을 같이 두는 값이 어디서 드나</strong>입니다. 신경망 38MB 는 둘을 실어도 76MB 라 값이 없습니다. 값은 임베딩 표입니다. 버전마다 27.7GB 라 55.4GB 가 됩니다.';
                    default: return '';
                }
            }
        },
        tour: [
            { el: '.tg-legend', title: '색 네 가지', body: '파랑은 놓여 있는 것(모델 파일, 임베딩 표, 설정), 벽돌색은 지금 오는 것(요청), 먹색은 서버, 회색은 만드는 작업(변환, 웜업, 추론)입니다.' },
            { el: '[data-card="load"]', title: '가장 먼저 볼 것', body: '서버는 켜지자마자 답하지 않습니다. 41초 중 20초가 웜업이고, 그 뒤에 준비 신호가 켜집니다.', waitFor: 'click' },
            { el: '[data-card="batch"]', title: '예산 8ms 안에 드는 쪽', body: '후보 800건을 한 텐서로 넣으면 3.0ms, 하나씩 부르면 96ms 입니다. 호출마다 붙는 고정 비용이 차이를 만듭니다.' }
        ]
    },

    // ==========================================
    // 서빙과 감시 카드 여섯 장 (중급)
    // ==========================================
    'ops-cards': {
        analogy: '모델이 서버에 오른 뒤 매일 보는 자리 여섯. 어디서 재느냐, 무엇이 되돌아오느냐, 어느 층이 먼저 흔들리느냐가 여기서 정해진다',
        anchor: '.tg-host',
        embedKeep: ['.tg-grid'],
        embedHide: ['.tg-hero', '.tg-real'],
        explain: {
            '.tg-card': ({ el }) => {
                switch (el.dataset.card) {
                    case 'fourplaces': return '헷갈리는 것은 <strong>분위수는 더할 수 없다</strong>는 점입니다. 기다린 시간의 p99 2.97ms 와 추론의 p99 10.77ms 를 더하면 13.74ms 인데 체류 시간의 p99 는 11.19ms 입니다. 가장 오래 기다린 요청과 가장 오래 걸린 추론이 같은 요청일 이유가 없기 때문입니다.';
                    case 'retry': return '헷갈리는 것은 <strong>왜 요청량 1.8% 차이로 결과가 뒤집히나</strong>입니다. 재시도가 만든 추가 부하가 초과율을 올리고, 올라간 초과율이 재시도를 더 만드는 되먹임이 멈추지 않는 지점이 그 사이에 있기 때문입니다. 부르는 쪽과 받는 쪽의 타임아웃이 다르면 재시도는 조용히 두 배가 됩니다.';
                    case 'fourlayers': return '헷갈리는 것은 <strong>왜 매출부터 보면 안 되나</strong>입니다. 4층은 모든 사고가 섞여 도착하는 자리라, 매출이 5% 빠졌다는 사실만으로는 아무것도 알 수 없습니다. 라벨이 필요 없는 1층과 2층이 즉시 굳으니 거기부터 봅니다.';
                    case 'threefeeds': return '헷갈리는 것은 <strong>같은 이름의 피처가 학습과 서빙에서 다른 곳에서 온다</strong>는 점입니다. 서빙은 카운터에서 지금 값을 읽고, 학습은 아카이브 로그로 그 시점의 값을 다시 만듭니다. 이 둘이 어긋나는 것이 학습과 서빙의 피처 어긋남입니다.';
                    case 'onlineloop': return '헷갈리는 것은 <strong>보정과 재학습이 고치는 것이 다르다</strong>는 점입니다. 보정은 출력 확률의 눈금만 바꾸고 재학습은 가중치 전체를 바꿉니다. 그래서 갱신 주기가 수 분과 하루로 다르고, 둘을 고르는 것이 아니라 쌓습니다.';
                    case 'k8spath': return '헷갈리는 것은 <strong>Service 는 서버가 아니다</strong>는 점입니다. 고정 주소와 살아 있는 Pod 목록을 적어 둔 것이라 점선 상자로 그렸습니다. 요청을 실제로 처리하는 것은 Pod 이고, Service 는 어느 Pod 로 보낼지만 정합니다.';
                    default: return '';
                }
            }
        },
        tour: [
            { el: '.tg-legend', title: '색 네 가지와 점선', body: '파랑은 놓여 있는 데이터, 벽돌색은 지금 오는 것, 먹색은 모델과 서버, 회색은 만드는 작업입니다. 점선 상자는 적어 둔 규칙과 주소입니다.' },
            { el: '[data-card="fourplaces"]', title: '가장 먼저 볼 것', body: '지연은 「얼마」가 아니라 「어디서 잰 얼마」입니다. 같은 요청에 시계 넷이 걸려 있습니다.', waitFor: 'click' },
            { el: '[data-card="fourlayers"]', title: '사고가 나면 어디부터', body: '라벨 없이 즉시 굳는 위 두 층부터 봅니다. 매출은 모든 사고가 섞여 도착하는 자리입니다.' }
        ]
    },

    // ==========================================
    // 데이터와 모델 카드 여덟 장 (중급)
    // ==========================================
    'data-model-cards': {
        analogy: '로그가 학습 데이터가 되고 모델이 후보를 고르는 자리 여덟. 언제 붙이나, 어느 창으로 만드나, 무엇을 미리 계산해 두나가 여기서 정해진다',
        anchor: '.tg-host',
        embedKeep: ['.tg-grid'],
        embedHide: ['.tg-hero', '.tg-real'],
        explain: {
            '.tg-card': ({ el }) => {
                switch (el.dataset.card) {
                    case 'logjoin': return '헷갈리는 것은 <strong>기다리기가 왜 공짜가 아닌가</strong>입니다. 7일 창이 닫힌 뒤 조인하면 라벨은 정확하지만 모델은 일주일 늦은 세상을 배웁니다. 먼저 쓰고 고치기는 신선하지만 라벨을 두 번 만드는 파이프라인이 필요합니다.';
                    case 'rank1': return '헷갈리는 것은 <strong>순서가 맞는데 왜 고치나</strong>입니다. 순서만 쓰는 랭킹에는 문제가 없지만, 확률 크기를 쓰는 입찰가(eCPM)에는 3번 자리 광고가 1번 기준으로 부풀어 들어갑니다. 그래서 계수 0.40 을 곱해 내려 잡습니다.';
                    case 'fanout': return '헷갈리는 것은 <strong>30 과 11 의 차이 19 가 비용이 아니다</strong>는 점입니다. 비용은 목적지를 하나 더 붙일 때 나옵니다. 층이 없으면 잡 5개를 고치고 배포 승인 5번이고, 층이 있으면 0개입니다.';
                    case 'aggwindow': return '헷갈리는 것은 <strong>왜 에러가 안 나나</strong>입니다. 누출된 피처도 서빙에서 값을 내놓으니 파이프라인은 멀쩡히 돕니다. 오프라인 AUC 0.894 가 실서빙 0.779 로 떨어진 뒤에야 보입니다.';
                    case 'din': return '헷갈리는 것은 <strong>유저 표현이 왜 하나가 아닌가</strong>입니다. 어텐션은 후보 광고를 보고 이력에 무게를 주니, 같은 유저라도 후보 광고마다 표현이 새로 계산됩니다. 후보가 50개면 50번 계산합니다.';
                    case 'ann': return '헷갈리는 것은 <strong>2% 만 보는데 왜 괜찮은가</strong>입니다. 인덱스가 벡터를 비슷한 것끼리 묶어 두어, 유저 벡터와 가까운 묶음만 열어 봅니다. 진짜 1위를 가끔 놓치는 대신 128.8ms 가 3.4ms 가 됩니다.';
                    case 'centroid': return '헷갈리는 것은 <strong>임계값과 확장 비율이 같은 것</strong>이라는 점입니다. 유사도 순으로 세운 줄을 어디서 자르느냐가 1%, 5%, 10% 슬라이더입니다. 씨앗이 이질적이면 평균 하나가 어느 쪽도 아닌 빈 자리에 놓여 중심점을 여럿 둡니다.';
                    case 'rtsegment': return '헷갈리는 것은 <strong>TTL 이 왜 꼭 필요한가</strong>입니다. 활성 검색자에 1시간을 걸지 않으면 세그먼트가 한 방향으로만 커져 타겟팅이 무뎌집니다. 배치 세그먼트와 부딪히면 스트리밍이 이깁니다.';
                    default: return '';
                }
            }
        },
        tour: [
            { el: '.tg-legend', title: '색 네 가지와 점선', body: '파랑은 놓여 있는 데이터, 벽돌색은 지금 오는 것, 먹색은 모델과 서버, 회색은 만드는 작업입니다. 점선 상자는 적어 둔 규칙과 계수입니다.' },
            { el: '[data-card="logjoin"]', title: '가장 먼저 볼 것', body: '로그 셋을 요청 번호로 붙여야 정답이 생깁니다. 전환은 며칠 뒤에 오니 언제 붙이느냐가 정답의 정확도입니다.', waitFor: 'click' },
            { el: '[data-card="aggwindow"]', title: '오프라인 점수를 못 믿을 때', body: '피처 창과 라벨 시각이 겹치면 정답이 피처에 새어 듭니다. 창은 D-1 자정에서 자릅니다.' }
        ]
    },

    // ==========================================
    // 배포 카드 다섯 장 (입문)
    // ==========================================
    'deploy-cards': {
        analogy: '새 모델은 한 번에 다 바뀌지 않는다. 1퍼센트부터 넓히고, 게이트 하나가 닫히면 가중치 한 줄로 되돌린다',
        anchor: '.tg-host',
        embedKeep: ['.tg-grid'],
        embedHide: ['.tg-hero', '.tg-real'],
        explain: {
            '.tg-card': ({ el }) => {
                switch (el.dataset.card) {
                    case 'shadow': return '헷갈리는 것은 <strong>섀도로는 무엇을 못 보나</strong>입니다. 지연과 예측 분포는 보이지만 클릭은 안 보입니다. 나간 광고가 옛 모델 것이라 새 모델의 점수에는 결과가 붙지 않습니다.';
                    case 'canary': return '헷갈리는 것은 <strong>1퍼센트 단계가 무엇을 보는 자리인가</strong>입니다. 5분에 모이는 클릭이 79건뿐이라 모델 품질은 못 봅니다. 서버가 죽지 않나만 보는 자리입니다.';
                    case 'gates': return '헷갈리는 것은 <strong>게이트가 왜 넷인가</strong>입니다. 앞의 둘은 서버가 멀쩡한가이고 뒤의 둘은 모델이 돈을 버는가입니다. 서버가 멀쩡해도 COPC 가 어긋나면 넓히지 않습니다.';
                    case 'rollback': return '헷갈리는 것은 <strong>14분 중 기계가 쓴 시간이 1분뿐</strong>이라는 점입니다. 나머지는 사람이 보고 정하고 확인한 시간입니다. 게이트를 미리 적어 두면 판단 5분이 없어집니다.';
                    case 'warmup': return '헷갈리는 것은 <strong>느린 30초가 모델 탓이 아니라는 점</strong>입니다. 준비 신호를 언제 켜느냐의 문제입니다. 웜업 20초를 넣고 신호를 미루면 그 구간이 사라집니다.';
                    default: return '';
                }
            }
        },
        tour: [
            { el: '.tg-legend', title: '색 네 가지', body: '파랑은 놓여 있는 것, 벽돌색은 지금 오는 것, 먹색은 모델과 서버, 회색은 만드는 작업입니다. 점선은 미리 적어 둔 게이트 조건입니다.' },
            { el: '[data-card="canary"]', title: '가장 먼저 볼 것', body: '가중치 한 줄이 1, 10, 50, 100 을 정합니다. 단계마다 머무는 시간과 보는 것이 다릅니다.', waitFor: 'click' },
            { el: '[data-card="rollback"]', title: '되돌리기가 빠른 이유', body: '파드를 끄는 것이 아니라 요청이 가는 길을 바꾸는 일입니다. 옛 파드가 떠 있어 초 단위입니다.' }
        ]
    },

    // ==========================================
    // 배치 추론 카드 세 장 (입문)
    // ==========================================
    'batch-infer-cards': {
        analogy: '요청마다 계산할 것과 새벽에 미리 만들어 둘 것을 나눈다. 그 선이 서버 대수와 한 달 비용을 정한다',
        anchor: '.tg-host',
        embedKeep: ['.tg-grid'],
        embedHide: ['.tg-hero', '.tg-real'],
        explain: {
            '.tg-card': ({ el }) => {
                switch (el.dataset.card) {
                    case 'precompute': return '헷갈리는 것은 <strong>38배가 어디서 나오나</strong>입니다. 사람 수가 아니라 요청 수의 차이입니다. 같은 사람이 하루 16.3번 요청하므로, 사람마다 한 번만 계산하면 그만큼 덜 듭니다.';
                    case 'cache': return '헷갈리는 것은 <strong>적중률과 평균 시간의 관계</strong>입니다. 못 찾은 요청만 2ms 를 쓰므로 평균은 적중률로 섞입니다. 적중 80% 면 0.56ms 이고 100% 면 0.20ms 입니다.';
                    case 'cost': return '헷갈리는 것은 <strong>GPU 가 왜 세 대인가</strong>입니다. 2,639 QPS 면 두 대로 되는데, 한 대가 빠지면 부하율이 1.15 로 넘어갑니다. 예비 한 대가 비용의 3분의 1 입니다.';
                    default: return '';
                }
            }
        },
        tour: [
            { el: '[data-card="precompute"]', title: '가장 먼저 볼 것', body: '새벽에 한 번 전원 몫을 만들어 두면 요청 때는 꺼내 쓰기만 합니다.', waitFor: 'click' },
            { el: '[data-card="cost"]', title: '대수가 비용을 정합니다', body: '초당 요청 수와 한 대가 감당하는 양으로 대수가 나오고, 대수에 시간당 값을 곱하면 한 달 비용입니다.' }
        ]
    },

    // ==========================================
    // 분산 학습 카드 네 장 (중급)
    // ==========================================
    'distributed-cards': {
        analogy: '데이터는 나누면 빨라지고 임베딩은 나누면 들어간다. 장을 늘릴수록 합치는 시간이 붙어 효율이 내려간다',
        anchor: '.tg-host',
        embedKeep: ['.tg-grid'],
        embedHide: ['.tg-hero', '.tg-real'],
        explain: {
            '.tg-card': ({ el }) => {
                switch (el.dataset.card) {
                    case 'dataparallel': return '헷갈리는 것은 <strong>넷이면 왜 네 배가 아닌가</strong>입니다. 계산은 넷으로 나뉘는데 기울기를 합치는 시간은 안 나뉩니다. 그래서 3.5배이고 효율이 86% 입니다.';
                    case 'embshard': return '헷갈리는 것은 <strong>표가 큰데 왜 느리지 않나</strong>입니다. 배치 하나가 건드리는 줄이 유저 2억 줄 중 1,024줄뿐이기 때문입니다. 표 전체가 아니라 그 줄만 오갑니다.';
                    case 'sync': return '헷갈리는 것은 <strong>무엇을 맞바꾸나</strong>입니다. 동기는 시간을 잃고 비동기는 최신 값을 잃습니다. 실무는 신경망을 동기로, 임베딩을 비동기로 섞습니다.';
                    case 'speedup': return '헷갈리는 것은 <strong>효율이 왜 내려가나</strong>입니다. 장이 하나 늘 때마다 합치기와 기다림이 5.3% 씩 붙습니다. 16장이면 절반 가까이가 그 몫입니다.';
                    default: return '';
                }
            }
        },
        tour: [
            { el: '[data-card="dataparallel"]', title: '가장 먼저 볼 것', body: '같은 모델을 GPU 마다 두고 데이터만 나눕니다. 기울기를 평균 내어 넷이 같은 모델을 유지합니다.', waitFor: 'click' },
            { el: '[data-card="embshard"]', title: '한 장에 안 들어가는 것', body: '신경망은 들어가고 임베딩 표는 안 들어갑니다. 표만 따로 서버에 나눠 둡니다.' }
        ]
    },

    // ==========================================
    // 카나리 배포 놀이터 (중급)
    // ==========================================
    'canary': {
        analogy: '같은 새 모델이라도 어느 단계에서 재느냐에 따라 판정이 달라진다. 1퍼센트에서는 클릭이 적어 모델 품질을 아예 못 읽는다',
        anchor: '.cn-controls',
        embedKeep: ['.cn-controls', '.cn-metrics', '.cn-verdict', '.cn-gates', '.cn-charts'],
        embedHide: ['.demo-prereq', '.demo-intro', '.demo-steps', '.cn-intro', '.demo-tldr', '.demo-next', '.demo-practice'],
        explain: {
            '.cn-stage-btn': ({ el }) =>
                `단계를 <strong>${el.textContent.trim()}</strong> 로 바꿨어요. ` +
                '이 단계의 5분 창에 모이는 요청과 클릭이 달라지고, 클릭이 1,600건을 넘어야 COPC 를 읽습니다. ' +
                '값은 그대로인데 <strong>판정이 바뀌는 것</strong>이 이 놀이터의 핵심입니다.',
            '#cn-over': ({ value, prev }) =>
                `8ms 초과율을 <strong>${prev.toFixed(2)}% → ${value.toFixed(2)}%</strong> 로 ${value > prev ? '올렸' : '내렸'}어요. ` +
                `${value > 6 ? '게이트 6% 를 넘어 <strong>서버 쪽 게이트가 닫힙니다.</strong> 모델 품질과 무관하게 되돌립니다' : '게이트 6% 안이라 서버 쪽은 통과입니다'}.`,
            '#cn-err': ({ value, prev }) =>
                `오류율을 <strong>${prev.toFixed(2)}% → ${value.toFixed(2)}%</strong> 로 바꿨어요. ` +
                `${value > 0.1 ? '0.1% 를 넘으면 응답을 못 준 요청이 생긴 것이라 바로 되돌립니다' : '0.1% 안이면 응답은 다 나가고 있습니다'}.`,
            '#cn-copc': ({ value, prev }) =>
                `COPC 를 <strong>${prev.toFixed(2)} → ${value.toFixed(2)}</strong> 로 바꿨어요. ` +
                `1 에서 ${Math.abs(value - 1).toFixed(2)} 떨어져 있습니다. ` +
                `${Math.abs(value - 1) > 0.05 ? '게이트 폭 0.05 밖이라 <strong>읽을 수 있는 단계라면 탈락</strong>입니다' : '게이트 폭 0.05 안입니다'}. ` +
                '다만 1퍼센트 단계에서는 클릭이 모자라 이 값을 아예 안 봅니다.',
            '#cn-ctr': ({ value, prev }) =>
                `클릭률 차이를 <strong>${prev.toFixed(1)}% → ${value.toFixed(1)}%</strong> 로 바꿨어요. ` +
                `${value < -2 ? '옛 모델보다 2% 넘게 떨어졌습니다. 서버는 멀쩡한데 <strong>돈이 새는 조용한 고장</strong>이 이 모양입니다' : '옛 모델 대비 허용 범위 안입니다'}.`,
            '.cn-preset-btn': ({ el }) =>
                `<strong>${el.textContent.trim()}</strong> 프리셋을 적용했어요. ` +
                '게이트 표와 오른쪽 막대가 같이 바뀝니다. 단계를 1퍼센트와 10퍼센트로 번갈아 눌러 같은 값의 판정이 어떻게 달라지는지 보세요.'
        },
        tour: [
            { el: '.cn-stage-row', title: '단계부터 고릅니다', body: '1퍼센트는 5분, 10퍼센트와 50퍼센트는 30분입니다. 단계마다 모이는 클릭 수가 달라 <strong>읽을 수 있는 게이트</strong>가 달라집니다.' },
            { el: '.cn-metrics', title: '클릭이 모여야 읽습니다', body: 'COPC 는 클릭이 적으면 우연으로 흔들립니다. 흔들림 폭이 게이트 폭 0.05 보다 넓으면 <strong>판정하지 않습니다.</strong>', waitFor: 'click' },
            { el: '#cn-copc', title: '그날 아침을 재현해 보기', body: 'COPC 를 <strong>1.09</strong> 로 올리고 단계를 10퍼센트로 바꾸면 되돌림 판정이 나옵니다.', waitFor: 'input' },
            { el: '.cn-gates', title: '넷 다 열려야 넓힙니다', body: '앞의 둘은 서버가 멀쩡한가, 뒤의 둘은 모델이 돈을 버는가입니다. 하나라도 닫히면 가중치를 0 으로 되돌립니다.' }
        ]
    },

// ==========================================
    // 스트림 집계 카드 네 장 (입문)
    // ==========================================
    'window-cards': {
        analogy: '「최근 1시간 클릭 수」 하나에 정할 것이 셋이다 — 창을 어떻게 자르나, 언제 닫나, 닫힌 뒤 온 클릭은 어디로 보내나',
        anchor: '.tg-host',
        embedKeep: ['.tg-grid'],
        embedHide: ['.tg-hero', '.tg-real'],
        explain: {
            '.tg-card': ({ el }) => {
                switch (el.dataset.card) {
                    case 'windows': return '헷갈리는 것은 <strong>텀블링 창이 왜 최근 1시간이 아닌가</strong>입니다. 창이 정각에만 나오니 15:59 요청도 14:00~15:00 값을 받습니다. 요청 시각이 정각에서 멀수록 묵는데 그 폭이 0분에서 59분입니다.';
                    case 'watermark': return '헷갈리는 것은 <strong>워터마크가 벽시계 시간이 아니라는 것</strong>입니다. 잡은 시계를 보고 닫지 않고, 지금까지 읽은 클릭의 일어난 시각 중 가장 늦은 것에서 2분을 뺀 값으로 닫습니다. 그래서 잡이 5분 밀려도 창에 들어가는 클릭은 그대로입니다.';
                    case 'late': return '헷갈리는 것은 <strong>버린 클릭이 학습에서도 빠지나</strong>입니다. 아닙니다. 아카이브에는 그대로 쌓여서 하루 뒤 배치가 다 셉니다. 빠지는 것은 그 시각에 서빙이 본 값뿐입니다.';
                    case 'batchvs': return '헷갈리는 것은 <strong>한 건 차이가 왜 문제인가</strong>입니다. 크기가 아니라 방향입니다. 배치 값은 스트림 값보다 늘 크거나 같고 절대 작지 않아서, 한쪽으로만 틀리는 어긋남을 모델이 그대로 배웁니다.';
                    default: return '';
                }
            }
        },
        tour: [
            { el: '.tg-legend', title: '색 네 가지', body: '파랑은 놓여 있는 데이터, 벽돌색은 지금 오는 클릭, 먹색은 서버, 회색은 만드는 작업입니다. 점선은 적어 둔 것입니다.' },
            { el: '[data-card="watermark"]', title: '가장 먼저 볼 것', body: '클릭에는 일어난 시각과 도착한 시각이 따로 있습니다. 창을 언제 닫을지가 이 둘 사이에서 정해집니다.', waitFor: 'click' },
            { el: '[data-card="batchvs"]', title: '학습과 서빙이 다른 값을 보는 자리', body: '같은 한 시간을 스트림은 1,203, 배치는 1,204 로 셉니다. 서빙이 본 값을 로그로 남기면 어긋남이 0 이 됩니다.' }
        ]
    },

    // ==========================================
    // 창 집계 놀이터 (중급)
    // ==========================================
    'window': {
        analogy: '워터마크 한 줄이 곧 하루에 몇 건을 잃고 값이 몇 분 묵는가다 — 그 둘을 맞바꾸는 자리를 직접 움직여 본다',
        anchor: '.wn-controls',
        embedKeep: ['.wn-controls'],
        embedHide: ['.demo-prereq', '.demo-intro', '.demo-steps', '.wn-intro', '.demo-tldr', '.demo-practice', '.demo-next'],
        explain: {
            '#wn-wm': ({ value, prev }) =>
                `워터마크를 <strong>${prev}분 → ${value}분</strong>으로 ${value > prev ? '늘렸' : '줄였'}습니다. ` +
                `${value > prev ? '창이 그만큼 더 기다렸다 닫히니 빠지는 클릭이 줄고, 대신 값이 <strong>그만큼 묵습니다</strong>' : '값은 빨리 나오지만 창이 일찍 닫혀 <strong>빠지는 클릭이 늘어납니다</strong>'}. 아래 막대에서 지금 고른 값이 진한 막대입니다.`,
            '#wn-late': ({ value, prev }) =>
                `2분 넘게 늦는 비율을 <strong>${prev.toFixed(2)}% → ${value.toFixed(2)}%</strong>로 ${value > prev ? '올렸' : '내렸'}습니다. ` +
                `${value > prev ? '수집 쪽이 느려지거나 신호가 나쁜 지면이 늘면 이렇게 됩니다. 같은 워터마크에서 <strong>빠지는 클릭이 그대로 따라 올라갑니다</strong>' : '도착이 빨라지면 같은 워터마크로도 <strong>덜 빠집니다</strong>'}.`,
            '#wn-req': ({ value, prev }) =>
                `광고 서버가 값을 읽는 시각을 <strong>15:${String(prev).padStart(2, '0')} → 15:${String(value).padStart(2, '0')}</strong>으로 옮겼습니다. ` +
                '슬라이딩 창은 1분마다 나와 묵는 시간이 거의 그대로이고, 텀블링 창은 정각에서 멀어질수록 <strong>값이 계속 묵습니다</strong>.',
            '.wn-win-btn': ({ el }) =>
                `창 종류를 <strong>${el.textContent.trim()}</strong>로 바꿨습니다. ` +
                '위의 「읽는 창」 칸이 어떻게 달라지는지 보십시오. 텀블링은 정각 구간 하나를 계속 주고, 슬라이딩은 1분마다 새 구간을 줍니다.',
            '.wn-preset-btn': ({ el }) =>
                `<strong>${el.textContent.trim()}</strong> 프리셋을 걸었습니다. ` +
                '지표 셋과 그림 둘이 함께 바뀝니다. 「하루에 빠지는 클릭」과 「값이 묵는 시간」이 서로 반대로 움직이는 것을 기본값과 비교해 보십시오.'
        },
        tour: [
            {
                el: '.wn-metrics',
                title: '숫자 셋을 먼저',
                body: '읽는 창이 <strong>어느 구간</strong>인지, 그 창에서 <strong>몇 건을 세었는지</strong>, 하루로 치면 <strong>몇 건이 빠지는지</strong>입니다. 셋이 함께 움직입니다.'
            },
            {
                el: '#wn-timeline',
                title: '점 하나가 클릭 하나',
                body: '가로는 클릭이 일어난 시각, 세로는 도착까지 걸린 시간입니다. 점선 위로 올라간 벽돌색 점이 <strong>창이 닫힌 뒤에 도착한 클릭</strong>입니다. 점선이 기울어 있는 것은 창 앞쪽 클릭은 더 늦어도 들어가기 때문입니다.'
            },
            {
                el: '#wn-wm',
                title: '직접 움직여 보기',
                body: '<strong>워터마크</strong> 슬라이더를 0분으로 내려 보십시오. 하루에 빠지는 클릭이 몇 건으로 뛰는지 보입니다.',
                waitFor: 'input'
            }
        ]
    },

// ==========================================
    'serving-cost': {
        analogy: '대수는 두 조건 중 큰 쪽이다 — 평시에 부하율 상한을 지키는 대수, 예비가 빠져도 받아 내는 대수',
        anchor: '.sc-controls',
        embedKeep: ['.sc-controls'],
        embedHide: ['.demo-prereq', '.demo-intro', '.demo-steps', '.sc-intro', '.demo-tldr', '.demo-practice', '.demo-next'],
        explain: {
            '#sc-qps': ({ value, prev }) =>
                `요청량을 <strong>${prev.toLocaleString('ko-KR')} → ${value.toLocaleString('ko-KR')} QPS</strong>로 ${value > prev ? '올렸' : '내렸'}습니다. ` +
                `대수는 요청량에 비례해 ${value > prev ? '늘지만 올림 때문에 계단으로 오릅니다' : '줄지만 예비 대수 아래로는 안 내려갑니다'}. ` +
                '두 차트의 표시점이 어디로 갔는지 보세요.',
            '#sc-load': ({ value, prev }) =>
                `부하율 상한을 <strong>${prev.toFixed(2)} → ${value.toFixed(2)}</strong>로 바꿨습니다. ` +
                `${value > prev ? '한 대를 더 채워 쓰니 대수가 줄고 값이 내려갑니다. 대신 요청이 조금만 몰려도 줄이 길어집니다' : '한 대를 덜 채워 쓰니 대수가 늘고 값이 올라갑니다. 대신 요청이 몰려도 여유가 남습니다'}.`,
            '#sc-spare': ({ value, prev }) =>
                `예비 대수를 <strong>${prev}대 → ${value}대</strong>로 바꿨습니다. ` +
                '대수가 적은 GPU 쪽이 먼저 움직입니다. 열두 대 중 한 대는 빠져도 남은 열한 대가 받아 내지만, 두 대 중 한 대가 빠지면 못 받아 냅니다.',
            '#sc-cpu-cap': ({ value, prev }) =>
                `CPU 한 대 처리량을 <strong>${prev.toLocaleString('ko-KR')} → ${value.toLocaleString('ko-KR')} QPS</strong>로 ${value > prev ? '올렸' : '내렸'}습니다. ` +
                `요청 안에서 만들던 값을 미리 만들어 두면 이쪽이 ${value > prev ? '올라갑니다' : '내려갑니다'}. 대수가 그만큼 ${value > prev ? '줄어듭니다' : '늘어납니다'}.`,
            '#sc-cpu-won': ({ value, prev }) =>
                `CPU 한 대의 시간당 값을 <strong>${prev.toLocaleString('ko-KR')} → ${value.toLocaleString('ko-KR')}원</strong>으로 ${value > prev ? '올렸' : '내렸'}습니다. ` +
                '대수는 그대로이고 값만 바뀝니다. 대수를 정하는 것은 처리량과 부하율 상한이지 값이 아닙니다.',
            '#sc-gpu-cap': ({ value, prev }) =>
                `GPU 한 대 처리량을 <strong>${prev.toLocaleString('ko-KR')} → ${value.toLocaleString('ko-KR')} QPS</strong>로 ${value > prev ? '올렸' : '내렸'}습니다. ` +
                `${value > prev ? '한 대가 더 받아 내도 예비 한 대는 그대로라, 요청량이 작을 때는 값이 안 내려갑니다' : '한 대가 덜 받아 내니 대수가 늘고 값이 올라갑니다'}.`,
            '#sc-gpu-won': ({ value, prev }) =>
                `GPU 한 대의 시간당 값을 <strong>${prev.toLocaleString('ko-KR')} → ${value.toLocaleString('ko-KR')}원</strong>으로 ${value > prev ? '올렸' : '내렸'}습니다. ` +
                '이 값이 1,920원 아래로 내려가면 기본 요청량에서도 GPU 세 대가 CPU 열두 대보다 쌉니다.',
            '.sc-preset-btn': ({ el }) =>
                `<strong>${el.textContent.trim()}</strong> 프리셋을 적용했습니다. ` +
                '지표 셋과 두 차트가 함께 바뀝니다. 대수가 어느 조건에서 나왔는지는 지표 칸 아래 줄에 있습니다.'
        },
        tour: [
            {
                el: '.sc-metrics',
                title: '지표 셋',
                body: 'CPU 와 GPU 의 한 달 값, 그리고 두 값이 뒤집히는 요청량입니다. ' +
                    '각 칸 아래 줄에 <strong>평시 조건과 고장 조건</strong>의 대수가 같이 적힙니다.'
            },
            {
                el: '.sc-chart-card',
                title: '계단인 이유',
                body: '대수는 올림이라 요청량이 조금 늘어도 값은 한동안 그대로이다가 한 칸씩 뜁니다. ' +
                    '대수가 적은 GPU 쪽 계단이 더 큽니다.'
            },
            {
                el: '#sc-spare',
                title: '직접 움직여보기',
                body: '<strong>예비 대수</strong>를 0으로 내려 보세요. GPU 가 세 대에서 두 대로 줄며 값이 3분의 1 내려갑니다.',
                waitFor: 'input'
            },
            {
                el: '#demo-edu-explain',
                title: '해설 패널',
                body: '슬라이더와 프리셋을 움직일 때마다 여기에 지금 일어난 일이 적힙니다.'
            }
        ]
    },

'stats-cards': {
        analogy: '잰 값은 참값이 아니다. 노출 40,000 에서 나온 1.21% 는 한 번 뽑아 본 값이고, 그 흔들림보다 차이가 커야 다르다고 말할 수 있다',
        anchor: '.tg-host',
        embedKeep: ['.tg-grid'],
        embedHide: ['.tg-hero', '.tg-real'],
        explain: {
            '.tg-card': ({ el }) => {
                switch (el.dataset.card) {
                    case 'sample': return '헷갈리는 것은 <strong>무엇이 흔들리나</strong>입니다. 참 클릭률 1.21% 는 내내 한 값입니다. 흔들리는 것은 노출 40,000 을 뽑아 잰 값이고, 화면의 숫자가 바로 그 잰 값입니다.';
                    case 'se': return '헷갈리는 것은 <strong>왜 4배를 모아야 절반이 되나</strong>입니다. 노출 수가 루트 안의 분모에 있어서, 4배면 루트 4 인 2 로 나뉩니다. 폭을 10분의 1 로 줄이려면 100배가 필요합니다.';
                    case 'interval': return '헷갈리는 것은 <strong>95% 가 무엇의 95% 인가</strong>입니다. 참값은 움직이지 않고 구간이 매번 움직입니다. 그래서 「참값이 이 안에 있을 확률」이 아니라 「구간이 참값을 품는 횟수」입니다.';
                    case 'tstat': return '헷갈리는 것은 <strong>p 값이 무엇의 확률인가</strong>입니다. 차이가 없을 때 이만한 차이가 우연히 나올 확률이지, 차이가 없을 확률이 아닙니다. 그래서 0.084 는 「차이가 없다」가 아닙니다.';
                    case 'ttest': return '헷갈리는 것은 <strong>왜 문턱이 1.96 이 아닌가</strong>입니다. 흔들림의 참값을 모르고 30건으로 어림했기 때문입니다. 자유도 58 이면 2.00, 자유도 10 이면 2.23, 자유도 100 이면 1.98 로 1.96 에 다가갑니다.';
                    case 'variance': return '헷갈리는 것은 <strong>F 라는 이름이 둘인 것</strong>입니다. 두 무리의 분산이 같은지 보는 F 검정은 분산 둘을 나눈 값이고, 소재 셋을 한 번에 보는 분산분석은 무리 사이를 무리 안으로 나눈 값입니다.';
                    default: return '';
                }
            }
        },
        tour: [
            { el: '.tg-legend', title: '색 네 가지', body: '파랑은 잰 값, 벽돌색은 참값과 문턱, 먹색은 결론, 회색은 흔들림을 재는 계산입니다.' },
            { el: '[data-card="interval"]', title: '가장 먼저 볼 것', body: '95% 는 참값이 구간에 있을 확률이 아닙니다. 100번 뽑으면 구간이 참값을 품는 횟수가 95번쯤이라는 뜻입니다.', waitFor: 'click' },
            { el: '[data-card="tstat"]', title: '언제 믿나', body: '차이를 흔들림으로 나눈 값이 문턱 1.96 을 넘는지만 봅니다. 노출을 4배로 모으면 같은 차이에서 값이 2배가 됩니다.' }
        ]
    },

// ==========================================
    // 피처 카드 여섯 장 (중급)
    // ==========================================
    'feature-cards': {
        analogy: '피처는 만드는 주기도 다르고 읽는 곳도 둘이다. 그 둘을 맞추는 일이 피처 엔지니어링의 절반이다',
        anchor: '.tg-host',
        embedKeep: ['.tg-grid'],
        embedHide: ['.tg-hero', '.tg-real'],
        explain: {
            '.tg-card': ({ el }) => {
                switch (el.dataset.card) {
                    case 'threepipes': return '헷갈리는 것은 <strong>왜 하나로 통일하지 않나</strong>입니다. 7일 클릭률을 1분마다 다시 세는 것은 값만 비싸고 얻는 것이 없습니다. 반대로 최근 5분 클릭 수를 하루 한 번 만들면 그 피처의 뜻이 사라집니다.';
                    case 'twostores': return '헷갈리는 것은 <strong>왜 저장소가 둘이나 필요한가</strong>입니다. 학습은 과거 어느 시점의 값을 되돌려 읽어야 하고, 서빙은 지금 값 하나를 1ms 안에 읽어야 합니다. 한 저장소가 둘을 다 잘하기 어렵습니다.';
                    case 'freshness': return '헷갈리는 것은 <strong>무엇을 보고 주기를 정하나</strong>입니다. 값이 얼마나 빨리 변하는가와 그 변화가 예측을 얼마나 바꾸는가 둘입니다. 빨리 변해도 예측이 안 바뀌면 자주 만들 이유가 없습니다.';
                    case 'fallback': return '헷갈리는 것은 <strong>무엇으로 채웠는지를 왜 남기나</strong>입니다. 안 남기면 그 요청의 예측이 나빴을 때 모델 탓인지 피처가 없어서인지 못 나눕니다. 폴백 비율이 올라가는 것도 그때 알아챕니다.';
                    case 'rowtovector': return '헷갈리는 것은 <strong>번호를 그냥 넣으면 안 되는 이유</strong>입니다. 광고 번호 8837201 이 4418600 의 두 배라는 뜻이 아닌데, 그대로 넣으면 모델이 없는 크기 관계를 배웁니다.';
                    case 'sequence': return '헷갈리는 것은 <strong>마스크가 왜 따로 필요한가</strong>입니다. 빈 칸을 채운 0 도 번호라서 모델이 계산에 넣습니다. 어디가 진짜인지 알려 주지 않으면 이력 5개인 사람이 0 을 열다섯 번 본 사람이 됩니다.';
                    default: return '';
                }
            }
        },
        tour: [
            { el: '.tg-legend', title: '색 네 가지', body: '파랑은 놓여 있는 데이터, 벽돌색은 지금 오는 것과 문제가 되는 자리, 먹색은 모델과 서버, 회색은 만드는 작업입니다.' },
            { el: '[data-card="threepipes"]', title: '가장 먼저 볼 것', body: '피처마다 신선도가 다르고, 신선한 것일수록 자주 돌려야 해서 비쌉니다.', waitFor: 'click' },
            { el: '[data-card="twostores"]', title: '조용히 틀리는 자리', body: '정의는 하나인데 학습과 서빙이 다른 저장소에서 읽습니다. 둘이 어긋나면 오프라인 점수만 오릅니다.' }
        ]
    },

// ==========================================
    // BentoML 카드 네 장 (중급)
    // ==========================================
    'bento-cards': {
        analogy: '도구는 사람 시간을 아끼고 기계 시간을 조금 더 쓴다. 어느 쪽이 비싼지가 예산마다 다르다',
        anchor: '.tg-host',
        embedKeep: ['.tg-grid'],
        embedHide: ['.tg-hero', '.tg-real'],
        explain: {
            '.tg-card': ({ el }) => {
                switch (el.dataset.card) {
                    case 'byhand': return '헷갈리는 것은 <strong>무엇이 모델마다 다른가</strong>입니다. 일곱 중 여섯은 모델이 바뀌어도 그대로이고, 다른 것은 요청을 숫자 묶음으로 바꾸는 한 덩어리뿐입니다. 그래서 나머지를 가져다 쓰는 도구가 생겼습니다.';
                    case 'service': return '헷갈리는 것은 <strong>도구가 다 해 주지는 않는다</strong>는 점입니다. 요청이 어떤 모양으로 오고 어떤 숫자 묶음이 되는지는 모델마다 달라서 그것만 내가 씁니다. 도구는 그 함수를 부를 자리만 만들어 줍니다.';
                    case 'bento': return '헷갈리는 것은 <strong>모델이 이미지 안에 들어간다</strong>는 점입니다. 모델만 바꾸려 해도 이미지를 다시 만들어야 합니다. 매일 새 모델이 나오는 서버라면 매일 이미지가 새로 생깁니다.';
                    case 'batching': return '헷갈리는 것은 <strong>모아 보내기가 늘 이득이 아니라는 점</strong>입니다. 요청 하나에 이미 후보 800건이 실려 있으면 고정 비용 0.116ms 를 나눠 갖는 것이 전부라 건당 3% 밖에 안 줍니다. 그 3% 를 얻자고 대기 1.16ms 를 치릅니다.';
                    case 'workers': return '헷갈리는 것은 <strong>워커를 늘려도 8ms 초과율이 안 준다</strong>는 점입니다. 워커는 창구 수라 초당 받아 내는 건수와 줄 서는 시간을 고칩니다. 한 건이 파이썬 층을 지나며 붙는 1.68ms 는 창구를 몇 개 두든 그대로입니다.';
                    default: return '';
                }
            }
        },
        tour: [
            { el: '.tg-legend', title: '색 네 가지', body: '파랑은 놓여 있는 것, 벽돌색은 지금 오는 요청과 값을 치르는 자리, 먹색은 서비스와 서버, 회색은 만드는 작업입니다.' },
            { el: '[data-card="byhand"]', title: '가장 먼저 볼 것', body: '추론 서버 1,800줄 중 모델마다 다른 것은 한 덩어리뿐입니다. 나머지는 어느 모델이든 똑같이 필요합니다.', waitFor: 'click' },
            { el: '[data-card="batching"]', title: '켜기 전에 볼 것', body: '요청 하나의 크기를 먼저 봅니다. 이미 크면 묶어도 얻는 것이 거의 없습니다.' },
            { el: '[data-card="workers"]', title: '창구와 처리 시간은 다릅니다', body: '워커는 초당 몇 건을 받아 내나를 고치고, 한 건이 예산 안에 끝나나는 못 고칩니다.' }
        ]
    }
};
