/**
 * version-cards-demo.js — 모델 버전 카드 네 장
 *
 * 「지난주 모델을 오늘 똑같이 다시 만들 수 있나」에 답하는 자리 하나가 카드 한 장. 왼쪽에 들어오는 것,
 * 가운데에 처리하는 자리(회색 상자), 오른쪽에 나오는 결과, 맨 아래에 숫자 한 줄이다.
 * 색은 css/style.css 의 카드 부품 블록이 정한다 — 파랑 놓여 있는 것(데이터 판, 레지스트리 표), 벽돌색 달라진 자리와 배포,
 * 먹색 모델과 서버, 회색 만드는 작업(학습 실행). 점선 상자는 적어 둔 재료(코드, 데이터, 설정, 환경).
 * 숫자는 설계 문서의 표준 가상 값이고, COPC 0.9647 과 1.0206 은 글의 파이썬 실험이 낸 값이다.
 *
 * ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { esc, T, tag, srv, table, tool, user, list, arrow, dots, burst, svg, lines } = window.CardKit;
    const has = id => !!document.getElementById(id);

    // ---------- 1. 모델 하나를 만드는 재료 넷 ----------
    (function () {
        const S = 'vr-recipe'; if (!has(S)) return; let s = '';
        s += T(40, 26, '모델 v412 를 만든 재료 넷 (적어 둔 것)', 'lbl sm');
        s += list(40, 36, 176, 30, [{ t: '코드  a3f9c21', cls: 'h' }]);
        s += list(40, 74, 176, 44, [{ t: '데이터  dt=2026-08-04 … 09-02', cls: 'h' }, '파티션 30개, 9월 3일 판']);
        s += list(40, 126, 176, 44, [{ t: '설정  lr=0.002, dim=32', cls: 'h' }, 'epochs=1, seed=417']);
        s += list(40, 178, 176, 30, [{ t: '환경  pctr-train:1.14', cls: 'h' }]);
        s += tool(250, 100, 110, { label: '학습 실행', sub: '55분', clock: true });
        [51, 96, 148, 193].forEach((y, i) => {
            s += arrow(`vrrc${i}`, `M216,${y} C232,${y} 238,118 246,120`, 'a', { svg: S, dash: true });
            s += dots(`vrrc${i}`, 'a', { n: 1, dur: 3, });
        });
        s += arrow('vrrc5', 'M362,120 L400,120', 'k', { svg: S });
        s += dots('vrrc5', 'k', { n: 1, dur: 2 });
        s += srv(404, 96, { cls: 'k', label: '모델 v412' });
        s += tag(250, 196, '재료 넷이 같아야 같은 모델입니다', 'k');
        s += tag(250, 222, '하나라도 다르면 다른 모델이 나옵니다', 'b');
        s += T(40, 270, 'v412 는 재료 넷을 가리키는 이름입니다. 이름만 남기고 재료를 안 적으면 다시 못 만듭니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 2. 레지스트리 표 한 장 ----------
    (function () {
        const S = 'vr-registry'; if (!has(S)) return; let s = '';
        s += T(40, 26, '모델 레지스트리 — 버전마다 재료와 상태를 적은 표', 'lbl sm');
        const cols = [46, 100, 158, 222, 286, 352];
        const heads = ['버전', '학습일', 'AUC', 'COPC', '상태', '코드'];
        s += `<rect class="track" x="40" y="34" width="440" height="18"/>`;
        heads.forEach((h, i) => { s += T(cols[i], 47, h, 'lbl sm'); });
        const rows = [
            ['v412', '09-03', '0.8119', '0.98', '폐기', 'c', 'a3f9c21'],
            ['v417', '09-08', '0.8123', '0.99', '운영', 'a', 'b71e0d4'],
            ['v418', '09-15', '0.8131', '1.06', '후보', 'k', 'c02aa19'],
        ];
        rows.forEach((r, i) => {
            const y = 52 + i * 24;
            s += `<line class="tbl-ln" x1="40" y1="${y + 24}" x2="480" y2="${y + 24}"/>`;
            s += T(cols[0], y + 16, r[0], 'lbl k') + T(cols[1], y + 16, r[1], 'lbl') + T(cols[2], y + 16, r[2], 'lbl');
            s += T(cols[3], y + 16, r[3], r[3] === '1.06' ? 'lbl b' : 'lbl');
            s += tag(cols[4] - 4, y + 3, r[4], r[5]);
            s += `<text class="tok-t dark" x="${cols[5]}" y="${y + 16}">${esc(r[6])}</text>`;
        });
        s += T(480, 138, 'COPC 1.06 은 게이트 밖', 'lbl b', 'end');
        s += srv(60, 156, { cls: 'k', label: '모델 서버' });
        s += arrow('vrrg1', 'M300, 100 C300,140 200,150 108,168', 'a', { svg: S, dash: true });
        s += dots('vrrg1', 'a', { n: 1, dur: 2.6 });
        s += tag(200, 166, '서버는 표에서 「운영」인 버전을 싣습니다', 'a');
        s += tag(200, 192, '폐기된 v412 도 파일과 재료는 남겨 둡니다', 'c');
        s += lines(200, 228, ['표 한 장이 「지금 무엇이 도나」와', '「그것은 무엇으로 만들었나」에 답합니다']);
        s += T(40, 270, '레지스트리는 파일 창고가 아니라 버전마다 재료와 상태를 적은 기록표입니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 3. 데이터에서 배포까지 사슬 (계보) ----------
    (function () {
        const S = 'vr-lineage'; if (!has(S)) return; let s = '';
        s += T(40, 26, '앞으로 가는 사슬 — 데이터에서 배포까지', 'lbl sm');
        s += table(40, 44, { label: '데이터 30일', sub: 'dt=08-04 … 09-02' });
        s += tool(150, 52, 116, { label: '학습 실행 #4127', sub: '09-03 04:28' });
        s += srv(306, 36, { cls: 'k', label: '모델 v412' });
        s += tag(396, 56, '배포 09-03', 'b');
        s += T(438, 90, '06:31 카나리 시작', 'lbl sm', 'middle');
        s += arrow('vrln1', 'M100,66 L146,72', 'a', { svg: S });
        s += arrow('vrln2', 'M268,72 L302,66', 'k', { svg: S });
        s += arrow('vrln3', 'M352,62 L392,66', 'k', { svg: S });
        s += burst('vrln1', 'a', 0.05, 0.3, 8, 3) + dots('vrln2', 'k', { n: 1, dur: 2.4 }) + dots('vrln3', 'k', { n: 1, dur: 2.4 });
        s += T(270, 132, '질문은 거꾸로 갑니다: 배포 → 모델 → 학습 실행 → 데이터', 'lbl sm', 'middle');
        s += arrow('vrln4', 'M480,142 L72,142', 'b', { svg: S, dash: true });
        s += dots('vrln4', 'b', { n: 2, dur: 3.2 });
        s += user(60, 176, '팀장');
        s += tag(90, 172, '9월 3일 모델은 어느 데이터로 만들었나요?', 'k');
        s += lines(90, 214, ['고리 하나가 끊기면 그 뒤로는 못 갑니다', '실행 번호 #4127 이 데이터 파티션 목록을 들고 있습니다']);
        s += T(40, 270, '사슬이 이어져 있어야 「이 모델은 무엇으로 만들었나」에 30초 안에 답합니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 4. 재현본이 다른 자리 셋 ----------
    (function () {
        const S = 'vr-diff'; if (!has(S)) return; let s = '';
        s += T(40, 26, '같은 코드 a3f9c21 로 다시 만든 모델이 9월 3일 v412 와 다른 자리 셋', 'lbl sm');
        s += T(160, 50, '9월 3일 v412', 'lbl k', 'middle');
        s += T(400, 50, '오늘 다시 만든 것', 'lbl k', 'middle');
        const rows = [
            ['데이터 판', '08-20 파티션 9월 3일 판', 'a', '9월 5일 백필 판', 'b'],
            ['라이브러리', 'torch 2.3', 'a', 'torch 2.4', 'b'],
            ['시드', '없음 (그날 난수)', 'a', '없음 (오늘 난수)', 'b'],
            ['코드', 'a3f9c21', 'a', 'a3f9c21 같음', 'a'],
        ];
        rows.forEach((r, i) => {
            const y = 60 + i * 30;
            s += T(40, y + 13, r[0], 'lbl k');
            s += tag(96, y, r[1], r[2]);
            s += tag(330, y, r[3], r[4]);
        });
        s += `<line class="tbl-ln" x1="40" y1="182" x2="480" y2="182"/>`;
        s += T(40, 199, '결과', 'lbl k');
        s += tag(96, 186, 'COPC 0.9647', 'a');
        s += tag(330, 186, 'COPC 1.0206', 'b');
        s += lines(40, 224, ['시드만 달라도 0.949 와 0.953 사이에서 흔들립니다 (글의 파이썬 실험 값)', '세 자리를 적어 두고 맞추면 0.9647 이 그대로 나옵니다']);
        s += T(40, 270, '「같은 코드」만으로는 같은 모델이 아닙니다. 데이터 판, 라이브러리, 시드까지 적어 둡니다', 'lbl');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
