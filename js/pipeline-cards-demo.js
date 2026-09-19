/**
 * pipeline-cards-demo.js — 학습 파이프라인 카드 다섯 장
 *
 * 매일 새벽 모델이 다시 만들어지는 길에서 사람이 손을 대는 자리 하나가 카드 한 장. 왼쪽에 들어오는 것,
 * 가운데에 처리하는 자리(회색 상자), 오른쪽에 나오는 결과, 맨 아래에 숫자 한 줄이다.
 * 색은 css/style.css 의 카드 부품 블록이 정한다 — 파랑 놓여 있는 데이터(파티션, 레지스트리), 벽돌색 지금 오는 것
 * (알람, 실패, 지금 도는 것), 먹색 모델과 서버, 회색 만드는 작업(조인, 피처, 학습). 점선 상자는 적어 둔 것.
 * 숫자는 전부 설계 문서의 표준 가상 값이다 — 04:00 시작, 06:09 완료, 05:12 실패, 05:40 재실행, 07:20 완료,
 * 백필 30일 6개 동시 5시간 15분, 하루 학습 행 2,485만.
 *
 * ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { esc, T, tw, box, tag, srv, table, tool, list, arrow, dots, burst, svg, hbar, lines } = window.CardKit;
    const has = id => !!document.getElementById(id);
    // 눈에 보이지 않는 길 — 점만 흐르게 할 때
    const path = (id, d) => `<path id="${id}" d="${d}" fill="none" stroke="none"/>`;

    // DAG 의 칸 하나 — 위 줄 번호, 아래 줄 이름. cls 가 'none' 이면 테두리만(아직 안 돈 칸)
    function step(x, y, w, h, num, name, cls) {
        let s = cls === 'none'
            ? `<rect class="track" x="${x}" y="${y}" width="${w}" height="${h}"/>`
            : `<rect class="f-${cls}" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
        const tc = cls === 'none' ? 'lbl sm' : 'on';
        s += `<text class="${tc}" x="${x + w / 2}" y="${y + 14}" text-anchor="middle" style="font-size:10px">${esc(num)}</text>`;
        s += `<text class="${tc}" x="${x + w / 2}" y="${y + 28}" text-anchor="middle" style="font-size:9.5px">${esc(name)}</text>`;
        return s;
    }
    const STEPS = [['1', '도착 확인', 'c'], ['2', '라벨 붙이기', 'c'], ['3', '피처 만들기', 'c'], ['4', '학습', 'k'], ['5', '평가 게이트', 'c'], ['6', '등록', 'a'], ['7', '배포 요청', 'k']];
    // 일곱 칸 한 줄. x0 부터 w 폭, gap 간격. clsOf(i) 로 칸 색을 정한다
    function chain(x0, y, w, gap, clsOf) {
        let s = '';
        STEPS.forEach((st, i) => { s += step(x0 + i * (w + gap), y, w, 36, st[0], st[1], clsOf(i, st[2])); });
        return s;
    }

    // ---------- 1. DAG 한 바퀴 ----------
    (function () {
        const S = 'pl-dag'; if (!has(S)) return; let s = '';
        s += T(40, 26, '매일 04:00 에 시작하는 DAG pctr_daily. 칸 일곱 개가 이 순서로 돕니다', 'lbl sm');
        const x0 = 26, w = 62, gap = 6;
        s += chain(x0, 36, w, gap, (i, c) => c);
        const ends = ['04:03', '04:28', '05:06', '06:01', '06:08', '06:09', '06:09'];
        const mins = ['3분', '25분', '38분', '55분', '7분', '1분', ''];
        ends.forEach((e, i) => {
            const cx = x0 + i * (w + gap) + w / 2;
            s += T(cx, 86, mins[i], 'lbl sm', 'middle');
            s += T(cx, 100, e, 'lbl k', 'middle');
        });
        s += path('pldg1', `M${x0},108 L${x0 + 7 * w + 6 * gap},108`) + dots('pldg1', 'k', { n: 2, dur: 5 });
        s += table(40, 138, { label: '어제 로그 파티션 24개', sub: '노출 2억 2,800만 줄' });
        s += arrow('pldg2', 'M100,160 L176,168', 'a', { svg: S });
        s += burst('pldg2', 'a', 0.05, 0.4, 8, 3);
        s += tool(180, 148, 130, { label: '학습 행 2,485만', sub: '비클릭은 10줄에 1줄만' });
        s += arrow('pldg3', 'M312,168 L366,168', 'k', { svg: S });
        s += dots('pldg3', 'k', { n: 1, dur: 2.4 });
        s += srv(370, 140, { cls: 'k', label: '모델 v418' });
        s += lines(430, 158, ['06:09 에 레지스트리에', '놓입니다'], 'lbl sm', 13);
        s += tag(40, 232, '한 바퀴 2시간 9분. 학습(4)이 55분으로 가장 깁니다', 'k');
        s += T(40, 270, '알람의 「pctr_daily」는 이 일곱 칸 전체의 이름입니다. 어느 칸이 멈췄나부터 봅니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 2. 로그가 다 왔는지 먼저 본다 (센서) ----------
    (function () {
        const S = 'pl-sensor'; if (!has(S)) return; let s = '';
        s += T(40, 26, '어제 노출 로그 파티션 24개 (시간별)', 'lbl sm');
        const size = 22, gap = 6;
        for (let i = 0; i < 24; i++) {
            const x = 40 + (i % 6) * (size + gap), y = 36 + Math.floor(i / 6) * (size + gap);
            const hh = String(i).padStart(2, '0');
            if (i === 23) {
                s += `<rect class="list" x="${x}" y="${y}" width="${size}" height="${size}"/>`;
                s += `<text class="lbl b" x="${x + size / 2}" y="${y + 15}" text-anchor="middle" style="font-size:9.5px">${hh}</text>`;
            } else {
                s += `<rect class="f-a" x="${x}" y="${y}" width="${size}" height="${size}"/>`;
                s += `<text class="on" x="${x + size / 2}" y="${y + 15}" text-anchor="middle" style="font-size:9px">${hh}</text>`;
            }
        }
        s += arrow('plse1', 'M212,92 L236,92', 'a', { svg: S, dash: true });
        s += dots('plse1', 'a', { n: 1, dur: 2.2 });
        s += tool(240, 72, 110, { label: '도착 확인 (1)', sub: '센서. 1분마다 봅니다', clock: true });
        s += arrow('plse2', 'M352,92 L376,92', 'k', { svg: S });
        s += dots('plse2', 'k', { n: 1, dur: 2.2 });
        s += list(380, 56, 130, 72, [{ t: '23개 도착', cls: 'h' }, { t: '23시 파티션 대기', cls: 'b' }, '다 오면 2 를 엽니다', '없으면 안 엽니다']);
        s += tag(40, 176, '보통 04:03 에 24개가 다 옵니다', 'a');
        s += tag(40, 202, '하나라도 없으면 라벨 붙이기(2)를 시작하지 않습니다', 'b');
        s += lines(40, 240, ['센서가 없으면 반쪽 데이터로 학습이 시작되고, 모델은 오류 없이 조용히 나빠집니다']);
        s += T(40, 270, '기다리는 것도 일입니다. 센서는 「아직 없음」을 실패가 아니라 대기로 봅니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 3. 실패한 칸만 다시 돌린다 ----------
    (function () {
        const S = 'pl-rerun'; if (!has(S)) return; let s = '';
        const x0 = 26, w = 62, gap = 6;
        s += T(40, 26, '05:12 실패 시점 — 1, 2 는 끝났고(파랑) 3 이 멈췄고(벽돌색) 4~7 은 안 돌았습니다', 'lbl sm');
        s += chain(x0, 34, w, gap, (i) => i < 2 ? 'a' : i === 2 ? 'b' : 'none');
        s += tag(40, 78, '알람 05:12  pctr_daily  build_features(3) 실패', 'b');
        s += T(40, 118, '05:40 재실행 — 1, 2 는 건너뛰고 3 부터 다시 돕니다', 'lbl sm');
        s += chain(x0, 126, w, gap, (i, c) => i < 2 ? 'none' : c);
        const ends = ['', '', '06:17', '07:12', '07:19', '07:20', '07:20'];
        ends.forEach((e, i) => { if (e) s += T(x0 + i * (w + gap) + w / 2, 178, e, 'lbl k', 'middle'); });
        [0, 1].forEach(i => { s += T(x0 + i * (w + gap) + w / 2, 178, '건너뜀', 'lbl sm', 'middle'); });
        s += path('plrr1', `M${x0 + 2 * (w + gap)},192 L${x0 + 7 * w + 6 * gap},192`) + dots('plrr1', 'k', { n: 2, dur: 4, r: 3.5 });
        s += tag(40, 200, '1, 2 의 결과는 이미 파티션에 놓여 있어 다시 안 만듭니다', 'a');
        s += tag(40, 226, '실패 원인은 광고 메타 표 스냅샷이 아직 없던 것 (다른 팀 DAG 지연)', 'c');
        s += T(40, 270, '실패한 칸부터 다시 돌리면 2시간 9분이 아니라 1시간 40분입니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 4. 지난 30일을 다시 돌린다 (백필) ----------
    (function () {
        const S = 'pl-backfill'; if (!has(S)) return; let s = '';
        s += T(40, 26, '지난 30일 파티션 (dt=2026-08-16 부터 09-14 까지). 한 칸이 하루', 'lbl sm');
        const size = 18, gap = 5;
        for (let i = 0; i < 30; i++) {
            const x = 40 + (i % 10) * (size + gap), y = 36 + Math.floor(i / 10) * (size + gap);
            const cls = i < 12 ? 'f-a' : i < 18 ? 'f-b' : 'track';
            s += `<rect class="${cls}" x="${x}" y="${y}" width="${size}" height="${size}"/>`;
        }
        s += T(40, 116, '파랑 끝남 12일, 벽돌색 지금 도는 6일, 빈 칸 기다리는 12일', 'lbl sm');
        s += list(300, 34, 210, 72, [{ t: '한 날 63분 (2 와 3 만)', cls: 'h' }, '직렬이면 31시간 30분', { t: '6개 동시면 5시간 15분', cls: 'b' }, '학습(4)은 마지막에 한 번']);
        s += T(40, 144, '직렬', 'lbl k') + hbar(90, 134, 320, 1, 'c') + T(416, 144, '31.5시간', 'lbl k');
        s += T(40, 172, '6개 동시', 'lbl k') + hbar(90, 162, 320, 315 / 1890, 'a') + T(150, 172, '5시간 15분', 'lbl k');
        s += lines(40, 200, ['계산: 30일 × 63분 = 1,890분 = 31시간 30분. 6 으로 나누면 315분 = 5시간 15분']);
        s += tag(40, 218, '정상 파이프라인과 클러스터를 나눠 쓰니 한산한 시간에 돌립니다', 'c');
        s += T(40, 270, '백필은 2 와 3 만 30번 다시 만들고, 모델은 마지막에 한 번 학습합니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 5. 두 번 돌아도 같은 결과 (덮어쓰기 대 덧붙이기) ----------
    (function () {
        const S = 'pl-idempotent'; if (!has(S)) return; let s = '';
        s += `<line class="split" x1="260" y1="20" x2="260" y2="250"/>`;
        s += T(40, 26, '덮어쓰기 — 파티션을 통째로 바꿉니다', 'lbl k');
        s += tool(34, 44, 96, { label: '3 피처 만들기', sub: '1회차' });
        s += tool(34, 130, 96, { label: '3 다시', sub: '2회차' });
        s += table(172, 76, { label: 'dt=09-15', sub: '2,485만 행' });
        s += arrow('plid1', 'M132,64 C150,64 160,84 168,88', 'a', { svg: S });
        s += arrow('plid2', 'M132,150 C150,150 160,120 168,110', 'a', { svg: S });
        s += burst('plid1', 'a', 0.05, 0.3, 8, 3) + burst('plid2', 'a', 0.5, 0.75, 8, 3);
        s += tag(34, 196, '2회차 뒤에도 2,485만 행 그대로', 'a');
        s += T(276, 26, '덧붙이기 — 있는 것 뒤에 더 씁니다', 'lbl k');
        s += tool(270, 44, 96, { label: '3 피처 만들기', sub: '1회차' });
        s += tool(270, 130, 96, { label: '3 다시', sub: '2회차' });
        s += table(408, 76, { label: 'dt=09-15', sub: '4,970만 행' });
        s += arrow('plid3', 'M368,64 C386,64 396,84 404,88', 'b', { svg: S });
        s += arrow('plid4', 'M368,150 C386,150 396,120 404,110', 'b', { svg: S });
        s += burst('plid3', 'b', 0.05, 0.3, 8, 3) + burst('plid4', 'b', 0.5, 0.75, 8, 3);
        s += tag(270, 196, '재실행마다 2배. 같은 줄이 두 번 학습됩니다', 'b');
        s += lines(34, 236, ['1회차가 절반을 쓰고 죽었으면 덧붙이기는 3,728만 행이 되고 그중 1,243만 행이 중복입니다']);
        s += T(40, 270, '재실행이 있는 파이프라인은 덮어쓰기여야 합니다. 두 번 돌면 두 배가 되는 칸은 못 다시 돌립니다', 'lbl');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
