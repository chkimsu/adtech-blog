/**
 * data-model-cards-demo.js — 데이터와 모델 카드 여덟 장
 *
 * 기존 글 여덟 편의 한 절씩을 카드 한 장으로 옮긴 것이다. 왼쪽에 들어오는 것, 가운데에 처리하는 자리,
 * 오른쪽에 나오는 결과, 맨 아래에 한 줄 결론이다. 점이 흐르는 방향이 데이터가 가는 방향이다.
 * 색은 css/style.css 의 카드 부품 블록이 정한다 — 파랑 놓여 있는 데이터(로그, 표, 인덱스), 벽돌색 지금 오는 것
 * (요청, 이벤트, 클릭), 먹색 모델과 서버, 회색 만드는 작업(조인, 평균, 집계). 점선 상자는 적어 둔 것(규칙, 계수).
 * 숫자는 전부 그 글의 가상 데이터 값이다 — 카드마다 주석에 출처 글을 적어 두었다. 여기서 새로 만든 숫자는 없다.
 *
 * 호스트(#dm-<key>)가 없는 카드는 건너뛴다. ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { T, box, tag, srv, table, db, tool, user, list, arrow, dots, burst, svg, hbar, ruler, lines } = window.CardKit;
    const has = id => !!document.getElementById(id);
    // 눈에 보이지 않는 길 — 점만 흐르게 할 때
    const path = (id, d) => `<path id="${id}" d="${d}" fill="none" stroke="none"/>`;

    // ---------- 1. 로그 셋이 만나는 자리 (ad-log-system 4절) ----------
    (function () {
        const S = 'dm-logjoin'; if (!has(S)) return; let s = '';
        s += T(40, 26, '로그 셋 (같은 요청 번호)', 'lbl sm');
        s += table(40, 30, { label: '노출 로그' });
        s += table(40, 108, { label: '클릭 로그' });
        s += table(40, 186, { label: '전환 로그' });
        s += T(200, 26, '전환은 클릭 뒤 수 시간에서 수 일 뒤에 옵니다', 'lbl sm');
        s += tool(196, 96, 124, { label: '조인과 라벨링', sub: 'request_id 로 맞춥니다', clock: true });
        s += arrow('lj1', 'M98,52 C150,52 160,104 192,108', 'a', { svg: S });
        s += arrow('lj2', 'M98,130 C150,130 160,118 192,116', 'a', { svg: S });
        s += arrow('lj3', 'M98,208 C150,208 160,130 192,124', 'b', { svg: S, dash: true });
        s += burst('lj1', 'a', 0.05, 0.3, 8, 3) + burst('lj2', 'a', 0.05, 0.3, 8, 3) + dots('lj3', 'b', { n: 1, dur: 4 });
        s += arrow('lj4', 'M322,116 L386,116', 'k', { svg: S });
        s += dots('lj4', 'k', { n: 1, dur: 2 });
        s += table(390, 94, { label: '학습 데이터', sub: '노출마다 label 1 또는 0' });
        s += T(196, 154, '조인을 언제 돌리나', 'lbl k');
        s += tag(196, 162, '기다리기: 7일 창이 닫힌 뒤', 'a');
        s += tag(196, 188, '먼저 쓰고 고치기: 0 으로 두고 정정', 'b');
        s += lines(196, 226, ['너무 일찍 돌리면 아직 안 온 전환이', '전부 「안 샀다」로 들어갑니다']);
        s += T(40, 270, '조인 시각을 정하는 일이 로그 종류를 정하는 일보다 어렵습니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 2. 자리를 모른 채 채점하는 자리 (ad-log-system 6절) ----------
    (function () {
        const S = 'dm-rank1'; if (!has(S)) return; let s = '';
        s += T(40, 26, '학습 때: 자리마다 다른 클릭률을 배웁니다', 'lbl sm');
        const rows = [['1번 자리', 1.0, 'CTR 5%'], ['2번 자리', 0.6, 'CTR 3%'], ['3번 자리', 0.3, 'CTR 1.5%']];
        rows.forEach((r, i) => {
            const y = 40 + i * 26;
            s += T(40, y + 12, r[0], 'lbl k');
            s += hbar(110, y + 2, 100, r[1], 'a', 14);
            s += T(216, y + 12, r[2], 'lbl k');
        });
        s += srv(300, 40, { cls: 'k', label: 'pCTR 모델' });
        s += arrow('rk1', 'M270,66 L296,66', 'a', { svg: S });
        s += dots('rk1', 'a', { n: 1, dur: 2 });
        s += T(370, 26, '추론 때: 자리를 아직 모릅니다', 'lbl sm');
        s += list(370, 36, 140, 44, [{ t: '후보 전부를 자리=1 로', cls: 'h' }, '한 번에 채점합니다']);
        s += arrow('rk2', 'M368,62 L350,64', 'b', { svg: S, dash: true });
        s += dots('rk2', 'b', { n: 1, dur: 2 });
        s += arrow('rk3', 'M322,120 L322,140', 'k', { svg: S });
        s += dots('rk3', 'k', { n: 1, dur: 1.6 });
        s += T(300, 152, '점수 순서로 세우고 자리를 줍니다', 'lbl sm');
        s += tag(300, 160, '1위 → 1번 자리, 계수 1.0', 'a');
        s += tag(300, 184, '2위 → 2번 자리, 계수 0.65', 'a');
        s += tag(300, 208, '3위 → 3번 자리, 계수 0.40', 'a');
        s += tag(40, 130, '순서는 남습니다', 'k');
        s += tag(40, 156, '확률 크기는 부풀어 보정이 깨집니다', 'b');
        s += lines(40, 196, ['3번에 놓일 광고도 1번 기준으로 예측되니', '계수 0.40 을 곱해 내려 잡습니다']);
        s += T(40, 270, '자리=1 로 한 번에 채점하면 순서는 맞고 확률은 부풉니다. 계수로 되돌립니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 3. 처리 잡 다섯이 목적지 여섯으로 (data-distribution-layer 1~2절) ----------
    (function () {
        const S = 'dm-fanout'; if (!has(S)) return; let s = '';
        s += T(40, 26, '처리 잡 다섯', 'lbl sm');
        const jobs = ['정제', '조인', '5분 집계', '시간 집계', '이상 탐지'];
        jobs.forEach((j, i) => { s += box(40, 36 + i * 30, 78, 20, j, 'c', 10); });
        s += T(258, 82, '나눠 보내는 층 (topic)', 'lbl sm', 'middle');
        s += box(206, 90, 104, 34, 'ad.*.clean', 'k', 10.5);
        s += T(400, 26, '목적지 여섯', 'lbl sm');
        const dests = ['창고', '실시간 DB', '검색', '리포트 DB', '타 팀 Kafka', '피처 스토어'];
        dests.forEach((d, i) => { s += box(400, 36 + i * 26, 96, 20, d, 'a', 10); });
        jobs.forEach((j, i) => {
            const y = 46 + i * 30;
            s += arrow(`fo${i}`, `M120,${y} L204,107`, 'c', { svg: S });
        });
        dests.forEach((d, i) => {
            const y = 46 + i * 26;
            s += arrow(`fd${i}`, `M312,107 L398,${y}`, 'a', { svg: S });
        });
        s += dots('fo1', 'c', { n: 1, dur: 2.2 }) + dots('fo3', 'c', { n: 1, dur: 2.6 });
        s += dots('fd0', 'a', { n: 1, dur: 2.2 }) + dots('fd2', 'a', { n: 1, dur: 2.4 }) + dots('fd5', 'a', { n: 1, dur: 2.8 });
        s += tag(40, 204, '층 없음: 연결 5 × 6 = 30개', 'b');
        s += tag(40, 230, '층 있음: 연결 5 + 6 = 11개', 'a');
        s += lines(290, 216, ['목적지를 하나 더 붙일 때 고치는 잡', '층 없음 5개, 층 있음 0개']);
        s += T(40, 270, '목적지가 늘 것 같으면 층을 먼저 세웁니다. 곱셈이 덧셈이 됩니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 4. 피처 창이 라벨 날과 겹치는 자리 (ctr-feature-engineering 6절) ----------
    (function () {
        const S = 'dm-aggwindow'; if (!has(S)) return; let s = '';
        s += T(40, 26, '라벨은 D 일 노출에서 나옵니다. 피처는 어느 날 로그로 만드나', 'lbl sm');
        const X0 = 150, W = 350, DAY = W / 9;             // D-7 부터 D+1 까지 아홉 칸
        const dx = k => Math.round(X0 + (k + 7) * DAY);   // k = -7 … 2
        s += T(40, 59, '날짜', 'lbl sm');
        s += ruler(X0, 48, W, [[dx(-7), 'D-7', ''], [dx(-1), 'D-1', ''], [dx(0), 'D', ''], [dx(1), 'D+1', '']], { h: 14 });
        s += `<rect class="f-b" x="${dx(0)}" y="48" width="${Math.round(DAY)}" height="14"/>`;
        s += `<rect class="f-c" x="${dx(1)}" y="48" width="${Math.round(DAY)}" height="14"/>`;
        s += T(dx(0) + DAY / 2, 75, '학습 날', 'lbl sm', 'middle');
        s += T(dx(1) + DAY / 2, 75, '실서빙', 'lbl sm', 'middle');
        s += T(40, 99, 'A 같은 날 CTR', 'lbl b');
        s += `<rect class="track" x="${X0}" y="88" width="${W}" height="14"/>`;
        s += `<rect class="f-b" x="${dx(0)}" y="88" width="${Math.round(DAY)}" height="14"/>`;
        s += T(40, 129, 'C 과거 7일 CTR', 'lbl k');
        s += `<rect class="track" x="${X0}" y="118" width="${W}" height="14"/>`;
        s += `<rect class="f-a" x="${X0}" y="118" width="${dx(0) - X0}" height="14"/>`;
        s += path('aw1', `M${X0},125 L${dx(0)},125`) + dots('aw1', 'a', { n: 2, dur: 3 });
        s += tag(40, 154, 'A: 오프라인 AUC 0.894 → 실서빙 0.779', 'b');
        s += tag(40, 180, 'C: 오프라인 0.777 → 실서빙 0.798', 'a');
        s += lines(296, 166, ['오프라인에서 이긴 A 가 실서빙에서 집니다', '누출은 에러를 내지 않습니다']);
        s += tag(40, 214, 'D-1 자정에서 창을 자릅니다', 'k');
        s += T(296, 224, '피처 창과 라벨 시각이 겹치지 않게', 'lbl sm');
        s += T(40, 270, '피처를 만드는 창과 라벨이 나온 시각이 겹치면 정답이 피처에 새어 듭니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 5. 후보 광고에 따라 이력의 무게가 달라지는 자리 (deep-ctr-models 4절 DIN) ----------
    (function () {
        const S = 'dm-din'; if (!has(S)) return; let s = '';
        s += T(40, 26, '같은 유저의 행동 5개', 'lbl sm');
        s += T(190, 26, '러닝화 광고를 채점할 때', 'lbl k');
        s += T(360, 26, '노트북 광고를 채점할 때', 'lbl k');
        const rows = [['운동화', 0.376, 0.029], ['노트북', 0.026, 0.846], ['러닝화', 0.370, 0.022], ['여행팩', 0.061, 0.063], ['운동복', 0.167, 0.040]];
        rows.forEach((r, i) => {
            const y = 40 + i * 26;
            s += T(40, y + 12, r[0], 'lbl k');
            s += hbar(190, y + 2, 120, r[1], 'a', 14);
            s += T(316, y + 12, r[1].toFixed(3), 'lbl sm');
            s += hbar(360, y + 2, 110, r[2], 'b', 14);
            s += T(476, y + 12, r[2].toFixed(3), 'lbl sm');
        });
        s += tag(190, 176, '운동 관련 3개 비중 91.3%', 'a');
        s += tag(360, 176, '운동 관련 3개 비중 9.1%', 'b');
        s += lines(40, 208, ['평균으로 뭉개면 5개 모두 0.200', '운동 관련 비중은 60% 로 고정입니다']);
        s += tag(40, 236, '후보 광고가 바뀌면 유저 표현이 달라집니다', 'k');
        s += T(40, 270, '같은 유저, 같은 행동 5개인데 후보에 따라 가중치가 91.3% 와 9.1% 로 달라집니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 6. 전수 비교 대 근사 검색 (two-tower-retrieval 4-3) ----------
    (function () {
        const S = 'dm-ann'; if (!has(S)) return; let s = '';
        s += T(40, 22, '서빙 때는 광고 타워를 돌리지 않습니다. 검색만 합니다', 'lbl sm');
        s += user(58, 46, '유저 요청');
        s += srv(130, 30, { cls: 'k', label: '유저 타워' });
        s += arrow('an1', 'M78,60 L126,60', 'b', { svg: S });
        s += dots('an1', 'b', { n: 1, dur: 2 });
        s += arrow('an2', 'M178,56 L206,56', 'k', { svg: S });
        s += tag(210, 47, 'u (64차원)', 'k');
        s += arrow('an3', 'M296,56 L318,56', 'k', { svg: S });
        s += dots('an2', 'k', { n: 1, dur: 1.6 }) + dots('an3', 'k', { n: 1, dur: 1.6 });
        s += table(322, 34, { label: '광고 벡터 100만 개', sub: '미리 계산해 둔 인덱스' });
        s += arrow('an4', 'M380,56 L420,56', 'a', { svg: S });
        s += dots('an4', 'a', { n: 1, dur: 1.6 });
        s += tag(424, 47, '후보 K개', 'a');
        s += T(40, 140, '100만 개에서 후보를 고르는 시간 (예산 100ms)', 'lbl sm');
        const rows = [['정밀 모델 전수', 1.0, '300,000ms', 'b'], ['투타워 전수 내적', 128.8 / 150, '128.8ms', 'b'], ['근사 검색 (2% 만)', 3.4 / 150, '3.4ms', 'a']];
        rows.forEach((r, i) => {
            const y = 150 + i * 26;
            s += T(40, y + 12, r[0], 'lbl k');
            s += hbar(190, y + 2, 200, r[1], r[3], 14);
            s += T(396, y + 12, r[2], r[3] === 'b' ? 'lbl b' : 'lbl k');
        });
        const bx = 190 + Math.round(200 * 100 / 150);
        s += `<line class="tick" x1="${bx}" y1="146" x2="${bx}" y2="230"/>`;
        s += T(bx, 242, '예산 100ms', 'lbl sm', 'middle');
        s += T(40, 246, '2% 만 훑으니 진짜 1위를 놓칠 수 있습니다. 재현율 90~99%', 'lbl sm');
        s += T(40, 270, '100만 개 전수 내적은 128.8ms 로 예산을 넘고, 2% 만 훑는 근사 검색은 3.4ms 입니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 7. 씨앗 평균 하나에서 닮은 사람을 찾는 자리 (lookalike-modeling 3-2) ----------
    (function () {
        const S = 'dm-centroid'; if (!has(S)) return; let s = '';
        s += T(40, 26, '씨앗 (맞춤타겟)', 'lbl sm');
        s += table(40, 36, { label: '씨앗 유저 벡터', sub: 'Two-Tower 유저 임베딩' });
        s += tool(150, 48, 110, { label: '평균', sub: '중심점 c 하나' });
        s += arrow('ce1', 'M98,60 L146,66', 'a', { svg: S });
        s += burst('ce1', 'a', 0.05, 0.35, 8, 3);
        s += arrow('ce2', 'M262,68 L298,64', 'k', { svg: S });
        s += dots('ce2', 'k', { n: 1, dur: 2 });
        s += table(302, 40, { label: 'ANN 인덱스', sub: '전체 유저 벡터' });
        s += arrow('ce3', 'M360,62 L396,58', 'a', { svg: S });
        s += dots('ce3', 'a', { n: 2, dur: 2 });
        s += T(400, 26, '중심점에 가까운 순서', 'lbl sm');
        s += tag(400, 40, '1 유사도 0.87', 'a');
        s += tag(400, 64, '2 유사도 0.82', 'a');
        s += tag(400, 88, '3 유사도 0.78', 'a');
        s += `<line class="split" x1="396" y1="122" x2="500" y2="122"/>`;
        s += T(400, 136, '임계값 아래는 뺍니다', 'lbl sm');
        s += tag(40, 154, '임계값을 높이면 소수, 씨앗과 아주 닮음', 'a');
        s += tag(40, 180, '낮추면 넓게, 닮음은 옅어집니다', 'c');
        s += lines(40, 216, ['씨앗이 이질적이면(명품 구매자와 초특가 사냥꾼)', '평균은 어느 쪽도 아닌 빈 자리에 놓입니다']);
        s += T(40, 270, '씨앗 평균 하나에서 가까운 순서로 자릅니다. 임계값이 1~10% 슬라이더입니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 8. 이벤트가 초 안에 세그먼트가 되는 길 (audience-segmentation 5절) ----------
    (function () {
        const S = 'dm-rtsegment'; if (!has(S)) return; let s = '';
        s += T(40, 26, 'Kafka 이벤트 (지금 오는 것)', 'lbl sm');
        s += tag(40, 40, '검색 14:02', 'b');
        s += tag(40, 64, '장바구니 담기 14:05', 'b');
        s += tag(40, 88, '구매 14:31', 'b');
        s += tool(190, 46, 122, { label: 'Flink 규칙 셋', sub: '유저별 상태와 타이머', clock: true });
        s += list(176, 100, 170, 58, [{ t: '1시간에 검색 3회 → 활성 검색자', cls: 'h' }, '담고 10분 미구매 → 장바구니 이탈', '구매 → 전환자 (30일)']);
        s += arrow('rs1', 'M156,72 L186,66', 'b', { svg: S });
        s += dots('rs1', 'b', { n: 3, dur: 2 });
        s += db(400, 52, { label: 'Redis 세그먼트', sub: '유저별 목록' });
        s += arrow('rs2', 'M314,66 L378,58', 'a', { svg: S });
        s += dots('rs2', 'a', { n: 2, dur: 1.8 });
        s += srv(420, 150, { cls: 'k', label: 'pCTR 모델' });
        s += arrow('rs3', 'M400,130 L438,150', 'a', { svg: S, dash: true });
        s += dots('rs3', 'a', { n: 1, dur: 2 });
        s += T(336, 176, '요청마다 읽습니다', 'lbl sm');
        s += tag(40, 186, '초에서 분 안에 세그먼트가 붙습니다', 'a');
        s += tag(40, 212, '배치 세그먼트는 시간에서 하루', 'c');
        s += T(40, 246, '같은 유저에서 둘이 부딪히면 스트리밍이 이깁니다', 'lbl sm');
        s += T(40, 270, '스트리밍은 초에서 분 안에, 배치는 시간에서 하루. 부딪히면 스트리밍이 이깁니다', 'lbl');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
