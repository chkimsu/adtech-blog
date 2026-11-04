/**
 * lookalike-batch-cards-demo.js — Lookalike 배치 카드 네 장
 *
 * 번호 6001 을 만드는 밤 배치의 순서 하나가 카드 한 장이다. 시드 114명, 중심 벡터와 코사인 유사도,
 * 전수 검색과 해시 근사 검색, 1, 5, 10% 에서 자른 정밀도.
 * 색은 css/style.css 의 카드 부품 블록이 토큰으로 정한다. 파랑은 러닝 성향(시드와 중심 벡터도 러닝 성향에서 나온다),
 * 벽돌색은 러닝 성향이 아닌 회원, 회색은 거리를 잰 횟수, 점선은 앞 글에 적힌 8만 명 평균이다.
 *
 * 숫자는 전부 lookalike-computation 글의 파이썬 출력에서 옮긴 가상 값이다. 표본 20,000명, 시드 114명의 평균,
 * 중심 벡터 8개, 회원 A 와 B 의 코사인과 순번, 정밀도 셋, 거리 계산 횟수와 재현율은 두 블록이 찍은 값이다.
 * 8만 명 평균(12회, 8일, 1.5회, 33세)은 lookalike-basics 글의 값이다. 글의 블록을 고치면 여기도 고친다.
 *
 * ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { T, arrow, svg, hbar } = window.CardKit;
    const has = id => !!document.getElementById(id);

    // ---------- 1. 시드 114명의 평균 넷과 앞 글의 8만 명 평균 ----------
    (function () {
        const S = 'lb-seed'; if (!has(S)) return; let s = '';
        s += T(40, 22, '막대는 이 글의 시드 114명 평균, 점선은 앞 글에 적힌 8만 명 평균입니다', 'lbl sm');
        const x0 = 196, w = 220;
        const rows = [
            // 이름, 시드 평균, 8만 평균, 눈금 끝, 시드 값 글자, 아래 줄
            ['러닝 글 (30일)', 8.98, 12, 15, '8.98회', '앞 글 8만 명 12회, 표본 20,000명 0.85회'],
            ['운동 앱 켠 날 (30일)', 7.84, 8, 15, '7.84일', '앞 글 8만 명 8일, 표본 20,000명 0.84일'],
            ['운동 용품 구매', 2.07, 1.5, 3, '2.07회 (30일)', '앞 글 8만 명 1.5회 (90일), 표본 20,000명 0.16회 (30일)'],
            ['나이', 32.7, 33, 50, '32.7세', '앞 글 8만 명 33세, 표본 20,000명 37.5세'],
        ];
        rows.forEach((r, i) => {
            const y = 42 + i * 52, xm = x0 + w * r[2] / r[3];
            s += T(40, y + 10, r[0], 'lbl k');
            s += hbar(x0, y, w, r[1] / r[3], 'a', 12);
            s += `<line class="lb-mark" x1="${xm.toFixed(1)}" y1="${y - 5}" x2="${xm.toFixed(1)}" y2="${y + 17}"/>`;
            s += T(x0 + w + 8, y + 10, r[4], 'lbl k');
            s += T(x0, y + 30, r[5], 'lbl sm');
        });
        s += T(40, 256, '러닝 글은 8만 명 평균보다 4분의 1 가량 적고, 운동 앱은 거의 같습니다', 'lbl sm');
        s += T(40, 278, '시드는 표본 전체보다 러닝 글을 10배 넘게 읽은 사람들입니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 2. 중심 벡터 8개와 코사인 유사도 ----------
    (function () {
        const S = 'lb-centroid'; if (!has(S)) return; let s = '';
        const NAMES = ['검색어 러닝화', '운동 앱 실행 일수', '러닝 글', '운동 용품 구매', '여행 글', '카페 글', '캠핑 글', '캠핑 용품 검색'];
        const C = [0.38, 3.18, 3.53, 3.09, 0.11, -0.01, -0.04, -0.12];
        const zero = 162, k = 24, top = 40, rh = 22;
        s += T(40, 22, '시드 114명의 벡터를 행동마다 평균한 값입니다', 'lbl sm');
        C.forEach((v, r) => {
            const y = top + r * rh, bw = Math.max(2, Math.abs(v) * k), x = v >= 0 ? zero : zero - bw;
            s += T(40, y + 12, NAMES[r], 'lbl');
            s += `<rect class="f-a" x="${x.toFixed(1)}" y="${y + 4}" width="${bw.toFixed(1)}" height="9"/>`;
            s += T((v >= 0 ? zero + bw + 4 : zero + 4).toFixed(1), y + 12, v.toFixed(2), 'lbl sm');
        });
        s += `<line class="tick" x1="${zero}" y1="${top - 2}" x2="${zero}" y2="${top + 8 * rh}"/>`;
        s += T(zero, top + 8 * rh + 14, '0', 'lbl sm', 'middle');
        // 방향만 그린 그림. 화살표 길이는 같고 중심과의 각만 코사인에 맞춘다
        const ox = 330, oy = 196, L = 132;
        const tip = deg => [ox + L * Math.cos(deg * Math.PI / 180), oy - L * Math.sin(deg * Math.PI / 180)];
        const [ax, ay] = tip(Math.acos(0.744) * 180 / Math.PI), [bx, by] = tip(Math.acos(-0.086) * 180 / Math.PI);
        s += arrow('lbc1', `M${ox},${oy} L${ox + L},${oy}`, 'a', { svg: S });
        s += arrow('lbc2', `M${ox},${oy} L${ax.toFixed(1)},${ay.toFixed(1)}`, 'a', { svg: S });
        s += arrow('lbc3', `M${ox},${oy} L${bx.toFixed(1)},${by.toFixed(1)}`, 'b', { svg: S });
        s += T(ox + L, oy + 16, '중심 벡터', 'lbl k', 'end');
        s += T(ax + 6, ay + 2, '회원 A 0.744', 'lbl k');
        s += T(bx + 8, by + 6, '회원 B -0.086', 'lbl b');
        s += T(40, 256, '코사인은 방향만 봅니다. 같은 쪽이면 1, 직각이면 0, 반대면 -1 입니다', 'lbl sm');
        s += T(40, 278, '줄은 코사인이 큰 순서입니다. 회원 A 는 162번째, 회원 B 는 6,252번째', 'lbl');
        svg(S, s);
    })();

    // ---------- 3. 전수 검색과 해시 근사 검색의 거리 계산 횟수 ----------
    (function () {
        const S = 'lb-search'; if (!has(S)) return; let s = '';
        s += T(40, 22, '시드를 뺀 19,886명. 해시는 테이블 4개, 테이블마다 버킷 64개입니다', 'lbl sm');
        const rows = [
            ['전수', '모든 회원과 잰다', 19886, '19,886번', '재현율 1.000'],
            ['해시 버킷 하나', '중심이 떨어진 버킷만', 2678, '2,678번', '재현율 0.383'],
            ['해시 이웃 버킷까지', '비트 하나 다른 버킷도', 9955, '9,955번', '재현율 0.782'],
        ];
        rows.forEach((r, i) => {
            const y = 44 + i * 56;
            s += T(40, y + 10, r[0], 'lbl k');
            s += T(40, y + 26, r[1], 'lbl sm');
            s += hbar(196, y, 210, r[2] / 19886, 'c', 14);
            s += T(414, y + 11, r[3], 'lbl k');
            s += T(196, y + 30, `${r[4]} (전수 상위 2,000명 중 찾은 몫)`, 'lbl sm');
        });
        s += T(40, 232, '방향을 다른 난수로 열 번 뽑으면 버킷 하나의 재현율은 0.183~0.600 입니다', 'lbl sm');
        s += T(40, 254, '이웃 버킷까지 보면 0.553~0.978 이고, 계산은 2,509~9,955번입니다', 'lbl sm');
        s += T(40, 278, '더 볼수록 재현율이 오르고 거리 계산이 늡니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 4. 1, 5, 10% 에서 자른 정밀도 ----------
    (function () {
        const S = 'lb-cut'; if (!has(S)) return; let s = '';
        s += T(40, 22, '줄의 앞에서 자른 사람. 막대 길이는 사람 수이고 2,000명이 끝입니다', 'lbl sm');
        const rows = [
            ['1%', 200, 197, '200명 중 197명, 정밀도 0.985', '1,400만 명이면 14만 명'],
            ['5%', 1000, 793, '1,000명 중 793명, 정밀도 0.793', '1,400만 명이면 70만 명'],
            ['10%', 2000, 1417, '2,000명 중 1,417명, 정밀도 0.709', '1,400만 명이면 140만 명, 번호 6001'],
        ];
        const x0 = 96, w = 380;
        rows.forEach((r, i) => {
            const y = 44 + i * 62, wa = w * r[2] / 2000, wb = w * (r[1] - r[2]) / 2000;
            s += T(40, y + 12, r[0], 'lbl k');
            s += `<rect class="f-a" x="${x0}" y="${y}" width="${wa.toFixed(1)}" height="16"/>`;
            s += `<rect class="f-b" x="${(x0 + wa).toFixed(1)}" y="${y}" width="${Math.max(2, wb).toFixed(1)}" height="16"/>`;
            s += T(x0, y + 32, r[3], 'lbl k');
            s += T(x0, y + 47, r[4], 'lbl sm');
        });
        s += T(40, 256, '파랑은 러닝 성향, 벽돌색은 러닝 성향이 아닌 회원입니다', 'lbl sm');
        s += T(40, 278, '넓게 자를수록 도달은 늘고 벽돌색의 몫이 커집니다', 'lbl');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
