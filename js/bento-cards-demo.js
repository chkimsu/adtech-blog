/**
 * bento-cards-demo.js — BentoML 카드 다섯 장
 *
 * 모델 파일 하나를 요청에 답하는 서비스로 만드는 길에서 정하는 자리 하나가 카드 한 장이다.
 * 색은 css/style.css 의 카드 부품 블록이 정한다 — 파랑 놓여 있는 것(모델 파일, 저장소, 이미지),
 * 벽돌색 지금 오는 요청과 값을 치르는 자리, 먹색 서비스와 서버, 회색 만드는 작업(굳히기, 묶기).
 * 점선 상자는 적어 둔 것(설정 파일, 태그).
 *
 * 숫자는 전부 그 글의 가상 값이다 — 직접 짠 코드 1,800줄, 서비스 파일 40줄, 고정 비용 0.12ms 와 1.80ms,
 * 이미지 1.1GB 와 1.4GB, 모아 보내기 창 2ms 와 묶음 32건. 추론 서버 편과 Docker 와 CI 편에서 이어받았다.
 *
 * ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { esc, T, tw, box, tag, srv, table, db, file, tool, clock, user, list, arrow, dots, burst, svg, hbar, lines } = window.CardKit;
    const has = id => !!document.getElementById(id);
    const path = (id, d) => `<path id="${id}" d="${d}" fill="none" stroke="none"/>`;

    // ---------- 1. 직접 짜면 만들어야 하는 것 일곱 ----------
    (function () {
        const S = 'bt-byhand'; if (!has(S)) return; let s = '';
        s += T(40, 24, '추론 서버 한 대에 들어 있는 일곱 덩어리 (막대는 줄 수)', 'lbl sm');
        const rows = [
            ['HTTP 로 받고 답한다', 220, 'c'],
            ['모델 파일을 올린다', 180, 'c'],
            ['후보를 한 텐서로 만든다', 260, 'b'],
            ['가짜 요청으로 몸을 푼다', 90, 'c'],
            ['준비 신호를 켠다', 70, 'c'],
            ['두 버전을 같이 싣는다', 310, 'c'],
            ['지연과 오류를 잰다', 240, 'c'],
        ];
        rows.forEach((r, i) => {
            const y = 36 + i * 24;
            s += T(40, y + 12, r[0], r[2] === 'b' ? 'lbl b' : 'lbl k');
            s += hbar(230, y + 1, 180, r[1] / 320, r[2], 14);
            s += T(418, y + 12, r[1] + '줄', r[2] === 'b' ? 'lbl b' : 'lbl sm');
        });
        s += tag(230, 210, '벽돌색 하나만 모델마다 다릅니다', 'b');
        s += tag(40, 210, '합계 1,370줄', 'k');
        s += T(40, 240, '설정과 시험을 더하면 1,800줄이고, 그중 모델을 부르는 계산은 열몇 줄입니다', 'lbl sm');
        s += T(40, 270, '여섯은 모델이 바뀌어도 그대로입니다. 그래서 도구가 생겼습니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 2. 서비스 파일 한 장에 적는 것 ----------
    (function () {
        const S = 'bt-service'; if (!has(S)) return; let s = '';
        s += T(40, 24, '내가 쓰는 것 (파이썬 파일 하나)', 'lbl sm');
        s += list(40, 32, 186, 76, [{ t: '@bentoml.service', cls: 'h' }, '모델을 태그로 꺼낸다', { t: '@bentoml.api', cls: 'h' }, '요청이 오면 이 함수를 부른다']);
        s += tag(40, 118, '40줄', 'k');
        s += arrow('bts1', 'M230,68 L286,68', 'k', { svg: S });
        s += dots('bts1', 'k', { n: 1, dur: 2.2 });
        s += srv(290, 44, { cls: 'k', label: '서비스 하나' });
        s += T(360, 24, '도구가 같이 붙이는 것', 'lbl sm');
        const auto = ['HTTP 창구', '준비 신호', '상태 묻는 주소', '지표 내보내기', '모아 보내기', '두 버전 나눠 태우기'];
        auto.forEach((a, i) => { s += tag(360, 36 + i * 26, a, 'a'); });
        s += arrow('bts2', 'M336,60 L356,54', 'a', { svg: S, dash: true });
        s += dots('bts2', 'a', { n: 1, dur: 2 });
        s += T(40, 156, '앞 카드의 일곱 중 여섯이 오른쪽에 있습니다', 'lbl sm');
        s += tag(40, 168, '남는 하나 — 후보를 한 텐서로', 'b');
        s += T(40, 202, '요청이 어떤 모양으로 오고 어떤 숫자 묶음이 되는지는', 'lbl sm');
        s += T(40, 216, '모델마다 달라서 이것만 내가 씁니다', 'lbl sm');
        s += T(40, 270, '내가 쓰는 것은 모델을 꺼내는 줄과 계산하는 함수뿐입니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 3. 굳히면 이미지 한 장 ----------
    (function () {
        const S = 'bt-bento'; if (!has(S)) return; let s = '';
        s += T(40, 24, '굳힐 때 담는 것 (설정 파일에 적는다)', 'lbl sm');
        s += list(40, 32, 150, 72, ['service.py', 'features.py', 'requirements.txt', { t: 'pcvr_preview:latest', cls: 'h' }]);
        s += arrow('btb1', 'M194,68 L222,68', 'c', { svg: S });
        s += dots('btb1', 'c', { n: 1, dur: 2.2 });
        s += tool(226, 50, 92, { label: 'build', sub: '한 묶음으로' });
        s += arrow('btb2', 'M320,68 L348,68', 'c', { svg: S });
        s += dots('btb2', 'c', { n: 1, dur: 2.2 });
        s += file(352, 44, { label: 'Bento 한 묶음' });
        s += arrow('btb3', 'M374,132 L374,158', 'a', { svg: S });
        s += dots('btb3', 'a', { n: 1, dur: 2 });
        s += tool(316, 162, 116, { label: 'containerize', sub: '도커 이미지로' });
        s += T(40, 130, '두 이미지가 다른 자리', 'lbl k');
        const cmp = [['직접 짠 서버', 1.1, 'c', '모델은 이미지 밖'], ['도구로 만든 것', 1.4, 'a', '모델이 이미지 안']];
        cmp.forEach((c, i) => {
            const y = 146 + i * 34;
            s += T(40, y + 12, c[0], 'lbl k');
            s += hbar(150, y + 1, 120, c[1] / 1.6, c[2], 14);
            s += T(278, y + 12, c[1] + 'GB', 'lbl k');
            s += T(40, y + 28, c[3], 'lbl sm');
        });
        s += tag(40, 224, '모델만 바꿔도 이미지를 다시 만듭니다', 'b');
        s += T(40, 270, '한 상자에 담기면 어느 서버에서 열어도 같은 것이 나옵니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 4. 모아 보내기가 값을 하는 자리 ----------
    (function () {
        const S = 'bt-batching'; if (!has(S)) return; let s = '';
        s += T(40, 24, '창 2ms 가 차거나 묶음이 32건이 되면 보냅니다', 'lbl sm');
        s += T(40, 48, '경우', 'lbl sm') + T(206, 48, '묶음', 'lbl sm') + T(268, 48, '대기', 'lbl sm') + T(340, 48, '건당 계산이 주는 몫', 'lbl sm');
        const rows = [
            ['40 QPS, 후보 1건', '1.1건', '1.93ms', 0.07, '7%', 'b', '모을 것이 없습니다'],
            ['2,000 QPS, 후보 1건', '5.0건', '1.20ms', 0.78, '78%', 'a', '값을 합니다'],
            ['2,639 QPS, 후보 800건', '6.3건', '1.16ms', 0.03, '3%', 'b', '대기만 붙습니다'],
        ];
        rows.forEach((r, i) => {
            const y = 60 + i * 52;
            s += T(40, y + 13, r[0], 'lbl k');
            s += T(206, y + 13, r[1], 'lbl k');
            s += T(268, y + 13, r[2], 'lbl k');
            s += hbar(340, y + 2, 100, r[3], r[5], 15);
            s += T(446, y + 13, r[4], r[5] === 'b' ? 'lbl b' : 'lbl k');
            s += tag(340, y + 24, r[6], r[5]);
        });
        s += T(40, 232, '요청 하나가 이미 크면 고정 비용 0.116ms 를 나눠 갖는 것이 전부입니다', 'lbl sm');
        s += T(40, 246, '예산 8ms 인 자리에서 대기 1.16ms 는 15% 입니다', 'lbl sm');
        s += T(40, 270, '요청 하나가 작고 예산이 넉넉할 때만 켭니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 5. 워커를 늘리면 무엇이 바뀌나 ----------
    (function () {
        const S = 'bt-workers'; if (!has(S)) return; let s = '';
        s += T(40, 24, '서버 한 대가 받는 몫은 초당 220건. 요청 한 건은 4.75ms', 'lbl sm');
        s += T(40, 48, '워커', 'lbl sm') + T(96, 48, '받아 내는 한계', 'lbl sm') + T(206, 48, '줄 서는 시간', 'lbl sm') + T(330, 48, '한 건의 계산', 'lbl sm');
        const rows = [
            ['1개', '211 건/초', '넘침', 1.0, 'b'],
            ['2개', '421 건/초', '1.78ms', 1.0, 'c'],
            ['4개', '842 건/초', '0.04ms', 1.0, 'a'],
            ['8개', '1,684 건/초', '0.00ms', 1.0, 'a'],
        ];
        rows.forEach((r, i) => {
            const y = 60 + i * 32;
            s += T(40, y + 13, r[0], 'lbl k');
            s += T(96, y + 13, r[1], 'lbl k');
            s += tag(206, y, r[2], r[4]);
            s += hbar(330, y + 2, 110, r[3], 'k', 15);
            s += T(446, y + 13, '4.75ms', 'lbl k');
        });
        s += `<line class="tick" x1="330" y1="56" x2="330" y2="190"/>`;
        s += T(40, 206, '왼쪽 두 칸은 워커를 늘릴수록 좋아집니다', 'lbl sm');
        s += T(330, 206, '오른쪽은 내내 같습니다', 'lbl b');
        s += tag(40, 216, '4개에서 멈춥니다. 그 뒤는 메모리만 더 씁니다', 'k');
        s += tag(40, 242, '8ms 초과율 10.69% 는 워커 수와 무관합니다', 'b');
        s += T(40, 270, '워커는 초당 몇 건을 받아 내나를 고칩니다. 한 건의 시간은 못 고칩니다', 'lbl');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
