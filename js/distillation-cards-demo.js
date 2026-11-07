/**
 * distillation-cards-demo.js — LLM 라벨링과 증류 카드 네 장
 *
 * 교사가 질의와 광고 1만 쌍에 관련성 라벨을 붙이고, 피처 여섯만 보는 학생 로지스틱 회귀가 그 라벨을 배우는 자리를 카드 한 장씩으로 그린다.
 * 교사 라벨로 학생 학습, 일치율과 kappa, 라벨 100만 건의 값과 시간, 관련성 라벨과 클릭의 차이.
 * 색은 css/style.css 의 카드 부품 블록이 토큰으로 정한다. 파랑은 교사의 라벨과 교사의 값, 벽돌색은 학생의 답과 학생의 값,
 * 먹색은 클릭, 회색은 학생이 볼 수 없는 자리이고, 점선은 가짜 교사의 규칙이다.
 *
 * 숫자는 전부 llm-labeling-distillation 글의 파이썬 블록 셋이 찍은 출력에서 옮긴 값이다. 1만 쌍과 가짜 교사, 가짜 클릭은 가상 값이고,
 * 진짜 교사의 토큰과 시간은 data/llm-records/llm-labels-code-ranker.json 의 기록이다. 글의 블록을 고치면 여기도 고친다.
 *
 * ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { T, box, tag, tool, list, arrow, svg } = window.CardKit;
    const has = id => !!document.getElementById(id);
    // 눈금 상자 안에 n / max 만큼 채운 막대. n 이 0 이하면 채우지 않는다
    const bar = (x, y, w, n, max, cls, h = 12) =>
        `<rect class="track" x="${x}" y="${y}" width="${w}" height="${h}"/>` +
        (n > 0 ? `<rect class="f-${cls}" x="${x}" y="${y}" width="${Math.max(2, Math.round(w * n / max))}" height="${h}"/>` : '');

    // ---------- 1. 교사 라벨로 학생 학습 ----------
    (function () {
        const S = 'ds-teacher'; if (!has(S)) return; let s = '';
        s += T(40, 20, '가짜 교사가 1만 쌍에 라벨을 붙이고, 학생이 그 라벨로 배웁니다', 'lbl sm');
        s += list(40, 30, 236, 72, [{ t: '가짜 교사의 규칙', cls: 'h' }, '주장이 있으면 0. 없으면 카테고리 2점,', '겹친 낱말 하나에 1점, 브랜드 1점,', '3점 이상이면 1. 그 뒤 500건을 뒤집음']);
        s += arrow('ds-teacher-in', 'M282,66 L314,66', 'k', { svg: S });
        s += tag(318, 48, '교사 라벨 1만 개', 'a');
        s += T(318, 84, '그 가운데 관련 4,212', 'lbl sm');
        s += tool(40, 114, 450, { label: '학생: 로지스틱 회귀, 피처 여섯, 경사 하강 200번', sub: '학습 8,000쌍, 그 안에 뒤집은 라벨 394개. 로그 손실 0.693 → 0.303' });
        s += T(40, 172, '학생이 배운 가중치 (표준화한 단위)', 'lbl k');
        // [피처, 가중치, 규칙이 점수를 준 피처인가]
        const rows = [['카테고리 일치', 1.94, true], ['낱말 겹침', 1.08, true], ['브랜드 일치', 0.42, true],
            ['가격대', 0.06, false], ['pCTR', 0.06, false], ['문장 길이', -0.03, false]];
        rows.forEach(([name, v, used], i) => {
            const y = 179 + i * 17;
            s += T(40, y + 10, name, used ? 'lbl k' : 'lbl');
            s += bar(140, y + 1, 240, v, 1.94, 'b', 11);
            s += T(392, y + 10, v.toFixed(2), used ? 'lbl k' : 'lbl');
        });
        s += T(40, 294, '규칙이 점수를 준 셋은 가중치가 크고, 규칙이 보지 않은 셋은 0 에 가깝습니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 2. 일치율과 kappa ----------
    (function () {
        const S = 'ds-agreement'; if (!has(S)) return; let s = '';
        const W = 450;                                // 막대의 폭
        s += T(40, 20, '시험 2,000쌍에서 학생의 답을 가짜 교사의 라벨과 비교합니다', 'lbl sm');
        const same = Math.round(W * 1839 / 2000);
        s += `<rect class="f-b" x="40" y="30" width="${same}" height="22"/>`;
        s += `<rect class="track" x="${40 + same}" y="30" width="${W - same}" height="22"/>`;
        s += T(40, 68, '같은 답 1,839 (92.0%)', 'lbl k');
        s += T(490, 68, '다른 답 161', 'lbl', 'end');
        s += T(40, 88, '우연히 맞을 몫 0.51 을 덜어 내면 kappa 0.84', 'lbl');
        s += T(40, 112, '다른 161쌍의 까닭', 'lbl k');
        // [상자 글, 쌍 수, 색]
        let x = 40;
        [['뒤집은 라벨 102', 102, 'c'], ['주장 48', 48, 'c'], ['11', 11, 'b']].forEach(([label, n, cls]) => {
            const w = Math.round(W * n / 161);
            s += box(x, 120, w - 2, 22, label, cls, 10);
            x += w;
        });
        s += T(40, 160, '뒤집은 라벨: 시험에 든 106개 가운데 102개는 학생이 규칙대로 답했습니다', 'lbl sm');
        s += T(40, 176, '주장: 피처 여섯에 없어, 학생은 3점 이상인 쌍을 관련으로 봤습니다', 'lbl sm');
        s += T(40, 192, '11쌍: 카테고리 0, 겹침 2, 브랜드 1 로 3점. 학습 8,000쌍에 27쌍뿐', 'lbl sm');
        s += `<line class="split" x1="40" y1="206" x2="490" y2="206"/>`;
        s += T(40, 228, '앞 글의 진짜 교사를 정답과 비교하면 (관련과 무관, 30개)', 'lbl k');
        s += T(40, 250, '같은 답 28/30, kappa 0.86. 라벨 넷 그대로는 17/30', 'lbl');
        s += T(40, 272, '다른 둘은 GPS 시계(a07)와 러닝 반바지(a18), 정답 mid 를 exclude 로', 'lbl sm');
        s += T(40, 290, '이 라벨로 학생을 배우면, 학생에게는 그 둘이 무관이 정답입니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 3. 라벨 100만 건의 값과 시간 ----------
    (function () {
        const S = 'ds-cost'; if (!has(S)) return; let s = '';
        s += T(40, 20, '라벨 100만 건을 붙이는 값과 시간입니다. 상용 모델의 값은 가상 단가입니다', 'lbl sm');
        s += T(40, 42, '100만 건의 값', 'lbl k');
        // [누가, 원, 색]
        [['큰 상용 모델', 2227467, 'a'], ['작은 상용 모델', 213800, 'a'], ['학생', 465, 'b']].forEach(([name, v, cls], i) => {
            const y = 50 + i * 22;
            s += T(40, y + 11, name, cls === 'b' ? 'lbl k' : 'lbl');
            s += bar(140, y + 1, 240, v, 2227467, cls);
            s += T(490, y + 11, `${v.toLocaleString('ko-KR')}원`, cls === 'b' ? 'lbl k' : 'lbl', 'end');
        });
        s += T(40, 136, '100만 건의 시간', 'lbl k');
        // [누가, 시간, 색]
        [['로컬 교사', 758.2, 'a'], ['학생', 0.97, 'b']].forEach(([name, v, cls], i) => {
            const y = 144 + i * 22;
            s += T(40, y + 11, name, cls === 'b' ? 'lbl k' : 'lbl');
            s += bar(140, y + 1, 240, v, 758.2, cls);
            s += T(490, y + 11, `${v}시간`, cls === 'b' ? 'lbl k' : 'lbl', 'end');
        });
        s += `<line class="split" x1="40" y1="200" x2="490" y2="200"/>`;
        s += T(40, 222, '건당 시간: 로컬 교사 평균 2.73초 (중앙값 2.04초), 학생 3.48ms', 'lbl');
        s += T(40, 244, '건당 시간은 로컬 교사가 학생의 783배입니다', 'lbl k');
        s += T(40, 266, '100만 건의 값은 작은 상용 모델이 학생의 460배, 큰 상용 모델이 4,795배', 'lbl');
        s += T(40, 288, '학생은 CPU 서버 한 대(287 QPS, 시간당 480원), 로컬 교사는 토큰 값 0원으로 셉니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 4. 관련성 라벨과 클릭의 차이 ----------
    (function () {
        const S = 'ds-click'; if (!has(S)) return; let s = '';
        s += T(40, 20, '시험 2,000쌍에서 교사가 관련으로 본 비율과 클릭이 있었던 비율입니다', 'lbl sm');
        // [무리, 교사의 관련 %, 클릭 %]
        const rows = [['가격대 1~2', 42.9, 44.6], ['가격대 3', 42.1, 34.7], ['가격대 4~5', 43.3, 26.3],
            ['브랜드 일치', 68.8, 74.1], ['브랜드 불일치', 40.2, 31.0]];
        rows.forEach(([name, rel, click], i) => {
            const y = 32 + i * 30;
            s += T(40, y + 15, name, 'lbl');
            s += bar(140, y + 2, 230, rel, 80, 'a', 10);
            s += bar(140, y + 14, 230, click, 80, 'k', 10);
            s += T(380, y + 11, `관련 ${rel.toFixed(1)}%`, 'lbl sm');
            s += T(380, y + 23, `클릭 ${click.toFixed(1)}%`, 'lbl k');
        });
        s += `<line class="split" x1="40" y1="190" x2="490" y2="190"/>`;
        s += T(40, 212, '교사와 클릭이 다른 쌍 723 (36.1%)', 'lbl k');
        s += T(40, 232, '관련인데 클릭 없음 440, 무관인데 클릭 283', 'lbl');
        s += T(40, 254, '같은 답: 교사와 클릭 63.8% (kappa 0.24), 학생과 클릭 64.9% (kappa 0.27)', 'lbl sm');
        s += T(40, 274, '관련 비율은 가격대마다 같고, 클릭은 쌀수록, 브랜드가 맞을수록 많습니다', 'lbl sm');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
