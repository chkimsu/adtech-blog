/**
 * ci-cards-demo.js — Docker 와 CI 카드 네 장
 *
 * 고친 코드 한 줄이 서버에 오르기까지 지나는 자리 하나가 카드 한 장. 왼쪽에 들어오는 것, 가운데에 처리하는 자리,
 * 오른쪽에 나오는 결과, 맨 아래에 숫자 한 줄이다. 점이 흐르는 방향이 데이터가 가는 방향이다.
 * 색은 css/style.css 의 카드 부품 블록이 정한다 — 파랑 놓여 있는 것(파일, 이미지, 저장소), 벽돌색 지금 오는 것(커밋, 요청),
 * 먹색 모델과 서버, 회색 만드는 작업(빌드, 테스트, 검사). 점선 상자는 적어 둔 것(설정, 통과 조건).
 * 숫자는 전부 모델 운영 트랙의 표준 값(가상)이다 — docs/superpowers/specs/2026-09-19-mlops-track-design.md 4절.
 *
 * 호스트(#ci-<key>)가 없는 카드는 건너뛴다. ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { T, box, tag, srv, db, file, tool, user, list, arrow, dots, burst, svg, hbar, ruler, lines } = window.CardKit;
    const has = id => !!document.getElementById(id);

    // 이미지 층 하나 — 회색 테두리 상자에 이름, 오른쪽에 크기
    function layer(x, y, w, name, size, cls) {
        let s = `<rect class="${cls ? 'f-' + cls : 'track'}" x="${x}" y="${y}" width="${w}" height="20"/>`;
        s += `<text class="${cls ? 'on' : 'lbl k'}" x="${x + 8}" y="${y + 14}" style="font-size:10px">${name}</text>`;
        s += `<text class="${cls ? 'on' : 'lbl sm'}" x="${x + w - 8}" y="${y + 14}" text-anchor="end" style="font-size:9.5px">${size}</text>`;
        return s;
    }

    // ---------- 1. 이미지 한 장에 든 것 ----------
    (function () {
        const S = 'ci-image'; if (!has(S)) return; let s = '';
        s += T(40, 26, '학습 이미지 4.6GB', 'lbl k');
        s += T(40, 40, '층 다섯. 아래가 먼저 쌓입니다', 'lbl sm');
        const L = [['코드 a3f9c21', '12MB', 'a'], ['학습 프레임워크', '1.2GB'], ['GPU 라이브러리', '3.1GB'], ['파이썬 3.11', '0.2GB'], ['기본 리눅스', '0.1GB']];
        L.forEach((l, i) => { s += layer(40, 48 + i * 24, 170, l[0], l[1], l[2]); });
        s += T(240, 26, '추론 이미지 1.1GB', 'lbl k');
        s += T(240, 40, '층 넷. 서버 12대가 같은 것을 씁니다', 'lbl sm');
        const R = [['코드 a3f9c21', '12MB', 'a'], ['추론 런타임', '0.8GB'], ['파이썬 3.11', '0.2GB'], ['기본 리눅스', '0.1GB']];
        R.forEach((l, i) => { s += layer(240, 48 + i * 24, 170, l[0], l[1], l[2]); });
        s += T(445, 26, '이미지 밖', 'lbl sm', 'middle');
        s += file(424, 38, { label: '모델 v418', sub: '38MB, 매일 바뀜' });
        s += arrow('im1', 'M424,74 C410,74 404,60 412,58', 'a', { svg: S, dash: true });
        s += tag(240, 150, '서버가 뜰 때 내려받습니다', 'k');
        s += lines(40, 186, ['코드는 맨 위 한 층입니다. 코드를 고치면 그 층만 다시 만듭니다', '아래 네 층은 그대로라 빌드가 6분 20초에 끝납니다']);
        s += tag(40, 212, '두 이미지의 차이 3.5GB 는 전부 라이브러리 층입니다', 'b');
        s += T(40, 270, '모델 파일은 이미지에 안 넣습니다. 코드는 한 층이고 크기는 라이브러리가 정합니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 2. 검문 셋 ----------
    (function () {
        const S = 'ci-gates'; if (!has(S)) return; let s = '';
        s += T(40, 26, '커밋 하나가 지나는 검문 셋. 하나라도 걸리면 거기서 멈춥니다', 'lbl sm');
        s += tag(40, 60, '커밋 a3f9c21', 'b');
        s += tool(150, 52, 100, { label: '유닛 테스트', sub: '214개, 48초', clock: true });
        s += tool(270, 52, 100, { label: '계약 테스트', sub: '스키마 12개, 부하 1,000건', clock: true });
        s += tool(390, 52, 100, { label: '이미지 검사', sub: '취약점, 크기', clock: true });
        s += arrow('gt1', 'M120,72 L146,72', 'b', { svg: S }) + arrow('gt2', 'M250,72 L266,72', 'b', { svg: S }) + arrow('gt3', 'M370,72 L386,72', 'b', { svg: S });
        s += dots('gt1', 'b', { n: 1, dur: 3 }) + dots('gt2', 'b', { n: 1, dur: 3 }) + dots('gt3', 'b', { n: 1, dur: 3 });
        s += list(150, 104, 100, 44, [{ t: '통과 조건', cls: 'h' }, '214개 전부 초록']);
        s += list(270, 104, 100, 58, [{ t: '통과 조건', cls: 'h' }, '필드 12개가 맞을 것', '8ms 초과 6% 이하']);
        s += list(390, 104, 100, 58, [{ t: '통과 조건', cls: 'h' }, '심각 취약점 0', '1.5GB 이하']);
        s += tag(150, 168, '214개 통과', 'a');
        s += tag(270, 168, '초과율 4.8%, 통과', 'a');
        s += tag(390, 168, '1.1GB, 통과', 'a');
        s += arrow('gt4', 'M490,72 L506,72', 'a', { svg: S });
        s += lines(40, 210, ['셋을 다 지나면 이미지 저장소에 올라갑니다', '셋 중 하나라도 걸리면 이미지는 만들어지지 않습니다']);
        s += tag(40, 232, '검문 셋에 드는 시간 4분 10초. 빌드까지 6분 20초', 'k');
        s += T(40, 270, '검문 셋을 다 지나야 저장소에 오릅니다. 걸린 커밋은 서버 근처에도 못 갑니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 3. 커밋에서 이미지 저장소까지 ----------
    (function () {
        const S = 'ci-pipeline'; if (!has(S)) return; let s = '';
        s += user(60, 40, '지훈 씨');
        s += tag(28, 86, 'git push a3f9c21', 'b');
        s += tool(150, 40, 110, { label: 'CI 빌드', sub: '6분 20초', clock: true });
        s += arrow('pp1', 'M114,60 L146,60', 'b', { svg: S });
        s += dots('pp1', 'b', { n: 1, dur: 2.4 });
        s += db(330, 40, { label: '이미지 저장소' });
        s += arrow('pp2', 'M260,60 L308,60', 'a', { svg: S });
        s += dots('pp2', 'a', { n: 1, dur: 2.4 });
        s += tag(292, 108, 'pctr-serve:2026.09.17-a3f9c21', 'a');
        s += srv(440, 30, { cls: 'k', label: '모델 서버 12대' });
        s += arrow('pp3', 'M350,84 C400,84 420,100 436,92', 'a', { svg: S, dash: true });
        s += dots('pp3', 'a', { n: 1, dur: 2.4 });
        s += T(360, 146, '배포 요청은 다음 편', 'lbl sm');
        s += T(40, 158, 'CI 빌드 6분 20초 안에서 일어나는 일 (분 단위 눈금)', 'lbl sm');
        s += ruler(40, 184, 440, [[40, '0', '커밋'], [190, '2:10', '빌드 끝'], [246, '2:58', '유닛 끝'], [420, '5:28', '계약 끝'], [480, '6:20', '검사 끝']], { h: 14 });
        s += `<rect class="f-c" x="40" y="184" width="150" height="14"/><rect class="f-a" x="190" y="184" width="56" height="14"/><rect class="f-a" x="246" y="184" width="174" height="14"/><rect class="f-a" x="420" y="184" width="60" height="14"/>`;
        s += T(115, 194, '이미지 만들기', 'on', 'middle') + T(333, 194, '검문 셋', 'on', 'middle');
        s += lines(40, 234, ['태그에 날짜와 커밋 해시가 붙습니다. 어느 코드로 만든 이미지인지 이름만 보고 압니다']);
        s += T(40, 270, '커밋이 곧 이미지 이름입니다. 서버에 오른 것이 어느 코드인지 찾는 데 1초면 됩니다', 'lbl');
        svg(S, s);
    })();

    // ---------- 4. 내 노트북에서는 되는데 ----------
    (function () {
        const S = 'ci-envdrift'; if (!has(S)) return; let s = '';
        s += T(40, 26, '같은 요청, 같은 모델 파일', 'lbl sm');
        s += file(56, 40, { label: '모델 v418', sub: '38MB' });
        s += tag(40, 134, '요청: 회원 u-3f9c, 광고 9931', 'b');
        s += srv(230, 26, { cls: 'k', label: '지훈 씨 노트북' });
        s += srv(230, 140, { cls: 'k', label: '모델 서버' });
        s += arrow('ed1', 'M100,66 C160,66 200,50 226,48', 'a', { svg: S });
        s += arrow('ed2', 'M100,72 C160,72 200,160 226,162', 'a', { svg: S });
        s += dots('ed1', 'a', { n: 1, dur: 2.4 }) + dots('ed2', 'a', { n: 1, dur: 2.4 });
        s += list(300, 26, 100, 30, [{ t: '라이브러리 2.3', cls: 'h' }]);
        s += list(300, 140, 100, 30, [{ t: '라이브러리 2.4', cls: 'h' }]);
        s += tag(410, 32, 'pCTR 0.0412', 'k');
        s += tag(410, 146, 'pCTR 0.0397', 'b');
        s += arrow('ed3', 'M274,52 L296,52', 'k', { svg: S }) + arrow('ed4', 'M274,166 L296,166', 'k', { svg: S });
        s += tag(300, 86, '같은 값이어야 합니다', 'k');
        s += tag(300, 194, '3.6% 낮습니다. 입찰가도 3.6% 낮아집니다', 'b');
        s += lines(40, 200, ['코드도 모델도 같은데 값이 다르면', '다른 것은 그 아래 층입니다', '라이브러리 판이 하나 다릅니다']);
        s += T(40, 270, '이미지에 라이브러리 판을 박으면 노트북과 서버가 같은 층을 갖습니다. 값이 같아집니다', 'lbl');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
