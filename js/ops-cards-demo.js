/**
 * ops-cards-demo.js — 서빙과 감시 카드 여섯 장
 *
 * 모델이 서버에 오른 뒤 매일 보는 자리 하나가 카드 한 장. 왼쪽에 들어오는 것, 가운데에 처리하는 자리,
 * 오른쪽에 나오는 결과, 맨 아래에 숫자 한 줄이다. 점이 흐르는 방향이 데이터가 가는 방향이다.
 * 색은 css/style.css 의 카드 부품 블록이 정한다 — 파랑 놓여 있는 데이터(표, 카운터, 주소 목록), 벽돌색 지금 오는 것
 * (요청, 클릭, 재시도), 먹색 모델과 서버, 회색 만드는 작업(조회, 보정, 재학습). 점선 상자는 적어 둔 것(규칙, 주소).
 * 숫자는 전부 그 글의 가상 데이터 값이다 — 카드마다 주석에 출처 글을 적어 두었다.
 *
 * 호스트(#op-<key>)가 없는 카드는 건너뛴다. ?card=key 가 붙으면 그 카드만 남긴다(글 안에 iframe 으로 넣을 때).
 * 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { T, box, labelUnder, tag, srv, table, db, tool, clock, user, list, arrow, dots, burst, svg, hbar, lines } = window.CardKit;
    const has = id => !!document.getElementById(id);

    // ---------- 1. 같은 요청을 네 자리에서 재면 (serving-latency-throughput 4절) ----------
    (function () {
        const S = 'op-fourplaces'; if (!has(S)) return; let s = '';
        s += T(40, 26, '요청 한 건이 지나는 자리와 시계 넷', 'lbl sm');
        s += user(52, 68, '앱');
        s += srv(120, 56, { cls: 'k', label: 'API 서버' });
        s += srv(290, 56, { cls: 'k', label: '모델 서버' });
        s += tool(380, 70, 110, { label: '추론 함수', sub: '계산만 3.49ms' });
        s += arrow('fp1', 'M72,86 L116,86', 'b', { svg: S });
        s += arrow('fp2', 'M164,82 L286,82', 'k', { svg: S });
        s += arrow('fp3', 'M334,86 L376,90', 'k', { svg: S });
        s += dots('fp1', 'b', { n: 1, dur: 2 }) + dots('fp2', 'k', { n: 2, dur: 2.4 }) + dots('fp3', 'k', { n: 1, dur: 1.6 });
        // 시계 넷 — 안쪽(1)부터 바깥(4)까지
        s += clock(492, 60) + T(492, 46, '1', 'lbl k', 'middle');
        s += clock(312, 44) + T(312, 30, '2', 'lbl k', 'middle');
        s += clock(230, 68) + T(230, 54, '3', 'lbl k', 'middle');
        s += clock(96, 54) + T(96, 40, '4', 'lbl k', 'middle');
        s += T(40, 146, '재는 자리', 'lbl sm') + T(258, 146, '평균', 'lbl sm') + T(330, 146, '8ms 초과율', 'lbl sm');
        const rows = [
            ['1 추론 함수 안 (계산만)', '3.49ms', 3.72, 'a'],
            ['2 모델 서버 핸들러 (+ 자리 기다림)', '3.76ms', 4.62, 'a'],
            ['3 API 서버의 모델 호출 구간 (+ 왕복)', '4.65ms', 7.45, 'a'],
            ['4 API 서버 전체 응답 (+ 피처, 후처리)', '6.38ms', 19.42, 'b'],
        ];
        rows.forEach((r, i) => {
            const y = 152 + i * 24;
            s += T(40, y + 13, r[0], r[3] === 'b' ? 'lbl b' : 'lbl k');
            s += T(258, y + 13, r[1], 'lbl k');
            s += hbar(330, y + 2, 120, r[2] / 20, r[3], 14);
            s += T(456, y + 13, r[2].toFixed(2) + '%', r[3] === 'b' ? 'lbl b' : 'lbl k');
        });
        s += T(330, 256, '막대는 초과율 (20% 가 끝)', 'lbl sm');
        s += T(40, 270, '같은 요청이라도 재는 자리에 따라 초과율이 3.72% 에서 19.42% 가 됩니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 2. 재시도의 절벽 (serving-latency-throughput 7절) ----------
    (function () {
        const S = 'op-retry'; if (!has(S)) return; let s = '';
        s += T(40, 26, '재시도가 원래 부하 위에 더해집니다', 'lbl sm');
        s += arrow('rc1', 'M40,62 L136,62', 'b', { svg: S });
        s += dots('rc1', 'b', { n: 3, dur: 2.4 });
        s += T(40, 50, '초당 2,639건', 'lbl k');
        s += srv(140, 36, { cls: 'k', label: '모델 서버 12대', sub: '8ms 초과 4.62%' });
        // 초과한 요청이 입력으로 되돌아온다
        s += arrow('rc2', 'M162,134 C162,166 60,166 60,72', 'b', { svg: S, dash: true });
        s += dots('rc2', 'b', { n: 2, dur: 3 });
        s += T(112, 176, '늦은 요청을 한 번 더 보냅니다', 'lbl sm', 'middle');
        s += tag(214, 44, '늘어난 요청이 초과율을 다시 올립니다', 'b');
        s += T(214, 132, '기준 요청량', 'lbl sm') + T(300, 132, '재시도 없이', 'lbl sm') + T(376, 132, '재시도를 켜면 멈추는 곳', 'lbl sm');
        const rows = [
            ['2,639 QPS', '4.62%', '2,780 QPS, 초과 5.4%', 5.4, 'a'],
            ['2,750 QPS', '5.17%', '2,978 QPS, 초과 8.3%', 8.3, 'a'],
            ['2,800 QPS', '5.55%', '5,599 QPS, 초과 100%', 100, 'b'],
            ['3,000 QPS', '8.93%', '5,998 QPS, 초과 100%', 100, 'b'],
        ];
        rows.forEach((r, i) => {
            const y = 140 + i * 24;
            s += T(214, y + 13, r[0], 'lbl k') + T(300, y + 13, r[1], 'lbl k');
            s += hbar(376, y + 2, 26, r[3] / 100, r[4], 14);
            s += T(408, y + 13, r[2], r[4] === 'b' ? 'lbl b' : 'lbl k');
        });
        s += tag(214, 240, '2,750 과 2,800 사이에 절벽이 있습니다', 'b');
        s += T(40, 270, '요청량이 1.8% 늘었을 뿐인데 8.3% 에서 멈추던 것이 전부 실패가 됩니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 3. 네 층으로 재고 빠른 층부터 (model-monitoring 2절) ----------
    (function () {
        const S = 'op-fourlayers'; if (!has(S)) return; let s = '';
        s += T(40, 26, '사고는 위에서 아래로 번지고, 신호는 그 순서로 늦어집니다', 'lbl sm');
        const layers = [
            ['1층 입력', '피처별 PSI, 결측률, 갱신 시각', '라벨 없이 즉시', 'a', '파이프라인 정지, 스키마 변경'],
            ['2층 출력', '예측 평균, 분위수, 양 끝 쏠림', '라벨 없이 즉시', 'a', '모델 오배포, 피처 순서 어긋남'],
            ['3층 라벨', 'COPC, CTR, pCVR 편차', '수십 분 ~ 수 일', 'b', '랭킹 열화, 보정 붕괴'],
            ['4층 비즈니스', '노출량, 소진율, 매출', '수 시간 ~ 1일', 'b', '위 세 층의 결과가 모여 나타남'],
        ];
        layers.forEach((L, i) => {
            const y = 40 + i * 50;
            s += `<rect class="grp" x="84" y="${y}" width="220" height="40"/>`;
            s += T(92, y + 16, L[0], 'lbl k');
            s += T(92, y + 31, L[1], 'lbl sm');
            s += tag(312, y + 4, L[2], L[3]);
            s += T(312, y + 36, L[4], 'lbl sm');
        });
        s += arrow('fl1', 'M62,44 L62,232', 'b', { svg: S });
        s += dots('fl1', 'b', { n: 1, dur: 3.2 });
        s += T(40, 250, '사고가 번지는 순서', 'lbl sm');
        s += T(312, 250, '읽는 순서도 위에서 아래입니다', 'lbl sm');
        s += T(40, 270, '1층이 흔들리면 데이터, 2층이면 모델, 3층이면 세상이 변한 것입니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 4. 세 갈래 피처가 한 벡터로 (feature-store-serving 2~3절) ----------
    (function () {
        const S = 'op-threefeeds'; if (!has(S)) return; let s = '';
        s += T(40, 26, '요청 한 건에 세 갈래 피처가 모입니다', 'lbl sm');
        s += table(40, 40, { label: '배치 표 (일 1회)', sub: '유저 7일 CTR' });
        s += db(68, 150, { label: '스트림 카운터 (매 분)', sub: '최근 5분 클릭 수' });
        s += tag(40, 236, '요청에서 바로: 시간대, 기기', 'b');
        s += tool(210, 96, 120, { label: '병렬 조회와 조합', sub: '조회 1ms, 조합 0.5ms' });
        s += arrow('tf1', 'M96,62 C150,62 170,100 206,106', 'a', { svg: S });
        s += arrow('tf2', 'M86,164 C150,164 170,130 206,126', 'a', { svg: S });
        s += arrow('tf3', 'M210,246 C236,246 252,160 262,140', 'b', { svg: S });
        s += dots('tf1', 'a', { n: 2, dur: 2.2 }) + dots('tf2', 'a', { n: 2, dur: 2.2 }) + dots('tf3', 'b', { n: 1, dur: 2 });
        s += srv(370, 80, { cls: 'k', label: '모델', sub: '추론 2~5ms' });
        s += arrow('tf4', 'M330,116 L366,110', 'k', { svg: S });
        s += dots('tf4', 'k', { n: 1, dur: 1.6 });
        s += tag(300, 36, '순차면 4ms, 병렬이면 1ms', 'a');
        s += lines(258, 196, ['조회 1ms, 조합 0.5ms, 추론 2~5ms,', '입찰 로직 1ms. 합계 5~8ms (예산 10ms)']);
        s += T(40, 270, '세 갈래를 한 요청에서 병렬로 모아야 1ms 에 끝납니다. 순차면 4ms 입니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 5. 온라인 학습 한 바퀴 (online-learning-delayed-feedback 5절) ----------
    (function () {
        const S = 'op-onlineloop'; if (!has(S)) return; let s = '';
        s += T(40, 26, '위로 갈수록 빠르고 가볍고, 아래로 갈수록 느리고 무겁습니다', 'lbl sm');
        s += tag(150, 40, '이벤트 스트림: 노출, 클릭 (수 초)', 'b');
        s += T(40, 84, '전환은 수 시간~수 일 뒤', 'lbl sm');
        s += tool(150, 78, 180, { label: '준실시간 보정 (수 분)', sub: '최근 1시간 예측 대 실제', clock: true });
        s += tool(150, 146, 180, { label: '배치 재학습 (일 1회)', sub: '최근 30일 전체, AUC 와 보정 평가', clock: true });
        s += tag(150, 212, '모델 서버: 기본 모델 + 보정 층', 'k');
        // 스트림 → 보정 (수 초), 스트림 → 재학습 (하루치 묶어서)
        s += arrow('ol1', 'M200,60 L200,74', 'b', { svg: S });
        s += arrow('ol2', 'M356,60 L356,166 L334,166', 'b', { svg: S, dash: true });
        // 보정 → 서버 (왼쪽 바깥 길), 재학습 → 서버
        s += arrow('ol3', 'M150,106 L142,106 L142,220 L148,220', 'c', { svg: S });
        s += arrow('ol4', 'M200,188 L200,210', 'k', { svg: S });
        // 서버 → 스트림 (오른쪽 바깥 길)
        s += arrow('ol5', 'M350,222 L440,222 L440,48 L382,48', 'b', { svg: S });
        s += dots('ol1', 'b', { n: 1, dur: 1.6 }) + burst('ol2', 'b', 0.1, 0.5, 8, 3) + dots('ol3', 'c', { n: 1, dur: 2.6 }) + dots('ol4', 'k', { n: 1, dur: 1.8 }) + dots('ol5', 'b', { n: 2, dur: 4 });
        s += T(208, 70, '수 초', 'lbl sm');
        s += T(364, 116, '하루치 묶어서', 'lbl sm');
        s += tag(40, 150, '보정값 수 분마다', 'c');
        s += T(208, 204, '가중치 일 1회', 'lbl sm');
        s += T(448, 130, '새 노출과', 'lbl sm') + T(448, 144, '클릭', 'lbl sm');
        s += T(40, 248, '빠른 층은 눈금만, 느린 층은 가중치를 바꿉니다', 'lbl sm');
        s += T(40, 270, '빠른 층이 느린 층의 실수를 임시로 덮고, 느린 층이 근본을 나중에 고칩니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 6. Ingress, Service, Pod 를 지나는 요청 (kubernetes-networking) ----------
    (function () {
        const S = 'op-k8spath'; if (!has(S)) return; let s = '';
        s += T(40, 26, '바깥 요청이 안쪽 Pod 까지 가는 다섯 걸음', 'lbl sm');
        s += user(52, 50, '사용자');
        s += T(52, 110, 'example.com/api', 'lbl b', 'middle');
        s += srv(130, 36, { cls: 'k', label: 'Ingress', sub: '규칙: /api → 주문' });
        s += list(250, 40, 120, 44, [{ t: 'Service 10.96.0.1', cls: 'h' }, '살아 있는 Pod 목록']);
        s += T(310, 100, '고정 주소', 'lbl sm', 'middle');
        s += srv(410, 16, { cls: 'k', scale: 0.8, label: '10.1.2.7' });
        s += srv(410, 96, { cls: 'k', scale: 0.8, label: '10.1.2.8 선택' });
        s += srv(410, 176, { cls: 'k', scale: 0.8, label: '10.1.2.17' });
        s += arrow('kp1', 'M74,66 L126,66', 'b', { svg: S });
        s += arrow('kp2', 'M174,62 L246,62', 'b', { svg: S });
        s += arrow('kp3', 'M370,62 C388,62 392,116 406,116', 'b', { svg: S });
        s += arrow('kp4', 'M370,52 L406,36', 'c', { svg: S, dash: true });
        s += arrow('kp5', 'M370,72 C388,72 392,196 406,196', 'c', { svg: S, dash: true });
        s += arrow('kp6', 'M416,146 C330,240 120,240 80,86', 'b', { svg: S, dash: true });
        s += dots('kp1', 'b', { seq: [0.0, 0.18], cyc: 6 }) + dots('kp2', 'b', { seq: [0.18, 0.36], cyc: 6 }) + dots('kp3', 'b', { seq: [0.36, 0.54], cyc: 6 }) + dots('kp6', 'b', { seq: [0.6, 0.98], cyc: 6 });
        s += T(100, 56, '1', 'lbl k', 'middle') + T(210, 52, '2', 'lbl k', 'middle') + T(350, 120, '3, 4', 'lbl k', 'middle');
        s += T(240, 226, '5 응답은 같은 길을 거꾸로', 'lbl sm', 'middle');
        s += T(40, 250, 'Pod 는 죽고 새로 뜨며 IP 가 바뀌지만 Service 주소는 그대로입니다', 'lbl sm');
        s += T(40, 270, '바깥 요청은 Ingress 가 규칙으로 고르고, Service 가 살아 있는 Pod 하나로 보냅니다', 'lbl');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
