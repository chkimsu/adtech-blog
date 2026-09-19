/**
 * inference-cards-demo.js — 추론 서버 카드 네 장
 *
 * 학습이 남긴 파일이 요청 하나에 답하는 서버가 되기까지의 자리 하나가 카드 한 장. 왼쪽에 들어오는 것, 가운데에
 * 처리하는 자리, 오른쪽에 나오는 결과, 맨 아래에 숫자 한 줄이다. 점이 흐르는 방향이 데이터가 가는 방향이다.
 * 색은 css/style.css 의 카드 부품 블록이 정한다 — 파랑 놓여 있는 것(모델 파일, 임베딩 표, 설정), 벽돌색 지금 오는 것(요청),
 * 먹색 모델과 서버, 회색 만드는 작업(변환, 웜업, 추론). 점선 상자는 적어 둔 것(설정, 준비 조건).
 * 숫자는 전부 모델 운영 트랙의 표준 값(가상)이다 — docs/superpowers/specs/2026-09-19-mlops-track-design.md 4절.
 *
 * 호스트(#in-<key>)가 없는 카드는 건너뛴다. ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { T, box, tag, srv, db, file, tool, list, arrow, dots, burst, svg, hbar, ruler, lines } = window.CardKit;
    const has = id => !!document.getElementById(id);
    // 눈에 보이지 않는 길 — 점만 흐르게 할 때
    const path = (id, d) => `<path id="${id}" d="${d}" fill="none" stroke="none"/>`;

    // ---------- 1. 학습 파일을 서빙 포맷으로 ----------
    (function () {
        const S = 'in-format'; if (!has(S)) return; let s = '';
        s += T(40, 26, '학습이 남긴 파일', 'lbl sm');
        s += file(56, 38, { label: '학습 형식 38MB', sub: '가중치 + 파이썬 클래스' });
        s += tool(190, 52, 120, { label: 'ONNX 로 변환', sub: '그래프와 가중치만 남김' });
        s += arrow('fm1', 'M100,66 L186,72', 'a', { svg: S });
        s += dots('fm1', 'a', { n: 2, dur: 2.4 });
        s += T(420, 26, '서버에 싣는 파일', 'lbl sm', 'middle');
        s += file(398, 38, { label: 'ONNX 38MB', sub: '런타임만 있으면 어디서나' });
        s += arrow('fm2', 'M310,72 L394,66', 'a', { svg: S });
        s += dots('fm2', 'a', { n: 2, dur: 2.4 });
        s += T(40, 152, '서버에 같이 있어야 하는 것', 'lbl sm');
        s += list(40, 160, 200, 58, [{ t: '학습 형식 그대로면', cls: 'h' }, '학습 프레임워크 1.2GB', '모델 클래스 파이썬 코드']);
        s += list(280, 160, 200, 58, [{ t: 'ONNX 면', cls: 'h' }, '추론 런타임 0.8GB', '코드 없음. 파일만 열면 됩니다']);
        s += tag(40, 228, '적재 9초', 'b') + tag(280, 228, '적재 3초', 'a');
        s += T(40, 270, '가중치 38MB 는 그대로입니다. 달라지는 것은 서버가 같이 실어야 하는 것의 크기입니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 2. 서버가 뜨는 41초 ----------
    (function () {
        const S = 'in-load'; if (!has(S)) return; let s = '';
        s += srv(40, 26, { cls: 'k', label: '새 서버' });
        s += T(120, 40, '이미지에서 켜진 순간부터 첫 요청을 받기까지 (초)', 'lbl sm');
        const seg = [[0, 12, '이미지 시작', 'c'], [12, 6, '내려받기', 'a'], [18, 3, '적재', 'a'], [21, 20, '웜업 200건', 'c']];
        const x0 = 120, w = 360, px = w / 41;
        s += `<rect class="track" x="${x0}" y="60" width="${w}" height="16"/>`;
        seg.forEach(g => {
            const x = x0 + g[0] * px, ww = g[1] * px;
            s += `<rect class="f-${g[3]}" x="${x}" y="60" width="${ww}" height="16"/>`;
            s += T(x + ww / 2, 71, g[1] + '초', 'on', 'middle');
            s += T(x + ww / 2, 92, g[2], 'lbl sm', 'middle');
        });
        [[0, '0'], [12, '12'], [18, '18'], [21, '21'], [41, '41초']].forEach(t => {
            s += `<line class="tick" x1="${x0 + t[0] * px}" y1="54" x2="${x0 + t[0] * px}" y2="82"/>`;
            s += T(x0 + t[0] * px, 50, t[1], 'lbl k', 'middle');
        });
        s += tag(388, 104, '준비 신호', 'a');
        s += list(120, 130, 200, 58, [{ t: '준비 신호가 켜지는 조건', cls: 'h' }, '모델이 메모리에 올라왔다', '웜업 200건이 끝났다']);
        s += lines(340, 146, ['게이트웨이는 이 신호가 켜진', '서버에만 요청을 보냅니다']);
        s += tag(120, 202, '신호 없이 열면 첫 30초가 2.5배 느립니다', 'b');
        s += lines(40, 240, ['12초는 이미지가 켜지는 시간, 6초는 모델 파일 38MB 를 저장소에서 가져오는 시간입니다']);
        s += T(40, 270, '41초 중 20초가 웜업입니다. 그 20초를 아끼면 첫 요청 수천 건이 예산을 넘깁니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 3. 후보 800건을 한 번에 ----------
    (function () {
        const S = 'in-batch'; if (!has(S)) return; let s = '';
        s += T(40, 26, '요청 한 건에 실려 온 후보', 'lbl sm');
        s += tag(40, 36, '후보 800건', 'b');
        s += tool(160, 30, 130, { label: '하나씩 800번', sub: '호출마다 0.116ms 가 새로 듭니다' });
        s += tool(160, 110, 130, { label: '한 텐서로 한 번', sub: '호출 한 번, 800줄 계산' });
        s += arrow('bt1', 'M118,44 C140,44 148,48 156,50', 'b', { svg: S });
        s += arrow('bt2', 'M118,50 C140,50 148,126 156,130', 'b', { svg: S });
        s += dots('bt1', 'b', { n: 3, dur: 2.2 }) + dots('bt2', 'b', { n: 1, dur: 2.2 });
        s += srv(320, 40, { cls: 'k', label: '모델 서버' });
        s += arrow('bt3', 'M290,50 L316,54', 'k', { svg: S }) + arrow('bt4', 'M290,130 C300,130 310,90 316,78', 'k', { svg: S });
        s += T(40, 176, '한 요청에 드는 시간과 8ms 예산 선', 'lbl sm');
        s += T(40, 200, '하나씩', 'lbl k') + hbar(100, 190, 380, 96 / 96, 'b', 14) + T(462, 201, '96ms', 'on', 'end');
        s += T(40, 224, '한 번에', 'lbl k') + hbar(100, 214, 380, 3 / 96, 'a', 14) + T(118, 225, '3.0ms', 'lbl k');
        const bx = 100 + Math.round(380 * 8 / 96);
        s += `<line class="tick" x1="${bx}" y1="186" x2="${bx}" y2="232"/>` + T(bx + 4, 244, '예산 8ms', 'lbl sm');
        s += tag(376, 108, '건당 0.0036ms 는 같음', 'k');
        s += T(40, 270, '호출 한 번의 고정 비용 0.116ms 가 800번 쌓이면 96ms 입니다. 예산 안은 한 텐서뿐입니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 4. 두 버전을 동시에 싣는다 ----------
    (function () {
        const S = 'in-twoversions'; if (!has(S)) return; let s = '';
        s += T(40, 26, '모델 서버 한 대 안', 'lbl sm');
        s += `<rect class="grp" x="40" y="34" width="230" height="120"/>`;
        s += file(56, 46, { label: 'v417 운영', sub: '38MB' });
        s += file(166, 46, { label: 'v418 대기', sub: '38MB' });
        s += list(300, 40, 190, 44, [{ t: '설정 한 줄', cls: 'h' }, 'active: v417']);
        s += arrow('tv1', 'M300,60 C280,60 120,20 92,44', 'a', { svg: S, dash: true });
        s += dots('tv1', 'a', { n: 1, dur: 2.4 });
        s += tag(300, 96, 'v418 로 바꾸면 몇 초 안에 전환', 'a');
        s += tag(300, 122, '되돌리기도 같은 한 줄', 'k');
        s += T(40, 176, '같이 실어야 하는 임베딩 표', 'lbl sm');
        s += db(80, 196, { label: 'v417 27.7GB' });
        s += db(190, 196, { label: 'v418 27.7GB' });
        s += tag(280, 200, '임베딩 서비스 55.4GB, 두 배', 'b');
        s += lines(280, 232, ['신경망 38MB 는 둘을 실어도 싸고', '임베딩은 27.7GB 가 하나 더 듭니다']);
        s += T(40, 270, '두 버전을 같이 실으면 전환과 되돌리기가 설정 한 줄입니다. 값은 임베딩 27.7GB 입니다', 'lbl');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
