/**
 * coding-agent-cards-demo.js — 코딩 에이전트 카드 네 장
 *
 * 코딩 에이전트에게 맡긴 실험 하나가 계획, 구현, 실행, 보고를 지나는 자리를 카드 한 장씩으로 그린다.
 * 네 단계, 스킬이 정하는 순서, 훅이 막는 것, 장부와 보고.
 * 색은 css/style.css 의 카드 부품 블록이 토큰으로 정한다. 파랑은 저장소에 놓인 파일, 벽돌색은 에이전트가 보낸 도구 호출,
 * 먹색은 Claude Code 와 검사 스크립트, 회색은 막힌 호출과 기록이 도는 시간이고, 점선 상자는 적어 둔 규칙과 사람의 승인이다.
 *
 * 숫자는 전부 coding-agent-experiments 글의 파이썬 블록 둘이 찍은 출력과, 그 글의 발췌(31주째 관심사 사전 편을
 * 만든 Task 4 세션)에서 옮긴 값이다. 글의 블록이나 발췌를 고치면 여기도 고친다.
 *
 * ?card=key 가 붙으면 그 카드만 남긴다 (글 안에 iframe 으로 넣을 때 쓴다).
 * 그리기 부품은 card-kit.js 에 있다.
 */
(function () {
    'use strict';
    const { T, box, list, arrow, svg } = window.CardKit;
    const has = id => !!document.getElementById(id);

    // ---------- 1. 네 단계 ----------
    (function () {
        const S = 'ca-steps'; if (!has(S)) return; let s = '';
        s += T(40, 18, 'Task 4 가 지난 네 단계 (오른쪽은 첫 명령에서 측정한 시간)', 'lbl sm');
        // [단계, 첫 줄, 둘째 줄, 시간] 블록 2 의 2단계가 찍은 값과 3절, 5절 발췌
        const rows = [
            ['계획', '브리프 한 절, 단계 아홉', '사람이 계획서를 승인 (묶음 전체)', '세션 앞'],
            ['구현', '생성기에 빌더 셋, 대조 81건 → 82건', '심판 빌더는 투표 기록이 없어 exit=1', '약 4분'],
            ['실행', '기록 셋, 요청 14개, error 0', '기록 도구가 측정한 시간 366 + 248 + 48 = 662초', '12분 25초'],
            ['보고', '검사, 커밋 5327bb4, 보고서', '검토: spec 통과, Minor 6', '27분 20초'],
        ];
        rows.forEach(([name, a, b, time], i) => {
            const y = 28 + i * 44;
            s += box(40, y, 54, 36, name, 'k', 11);
            s += T(106, y + 14, a, 'lbl k');
            s += T(106, y + 30, b, 'lbl');
            s += T(490, y + 14, time, i === 0 ? 'lbl sm' : 'lbl b', 'end');
        });
        // 시간 막대: 첫 명령부터 커밋까지 2,617초를 450px 로. 회색은 기록 구간 셋(블록 2 의 시각)
        const x0 = 40, W = 450, total = 2617;
        const px = t => Math.round((x0 + t / total * W) * 10) / 10;
        s += `<rect class="track" x="${x0}" y="230" width="${W}" height="16"/>`;
        [[232, 600], [636, 885], [928, 977]].forEach(([a, b]) => {
            s += `<rect class="f-c" x="${px(a)}" y="230" width="${(px(b) - px(a)).toFixed(1)}" height="16"/>`;
        });
        // [초, 위 글자, 글자 정렬] 첫 명령의 시각이 대략이라 시작에서 측정한 시각에는 약을 붙인다
        [[0, '0분', 'start'], [232, '약 4분', 'middle'], [977, '약 16분', 'middle'], [2617, '약 44분 커밋', 'end']].forEach(([t, lab, anc]) => {
            s += `<line class="tick" x1="${px(t)}" y1="224" x2="${px(t)}" y2="252"/>`;
            s += T(px(t), 218, lab, 'lbl k', anc);
        });
        s += T((px(0) + px(232)) / 2, 266, '구현', 'lbl sm', 'middle');
        s += T((px(232) + px(977)) / 2, 266, '실행', 'lbl sm', 'middle');
        s += T((px(977) + px(2617)) / 2, 266, '보고', 'lbl sm', 'middle');
        s += T(40, 288, '회색: 기록 구간 셋 (투표 6분 8초, 심판 4분 9초, 묶기 49초)', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 2. 스킬이 정하는 순서 ----------
    (function () {
        const S = 'ca-skill'; if (!has(S)) return; let s = '';
        s += T(40, 18, 'superpowers 7.0.0 의 스킬 둘이 정한 차례', 'lbl sm');
        s += list(40, 26, 450, 34, [
            { t: 'writing-plans: 계획서를 쓴다', cls: 'h' },
            '머리의 칸 여섯, Task 마다 Files, Interfaces, 단계',
        ]);
        s += list(40, 68, 200, 22, [{ t: '사람: 계획서 승인', cls: 'b' }]);
        s += arrow('ca-sk-1', 'M140,92 L140,106', 'k', { svg: S });
        s += `<rect class="grp" x="40" y="110" width="450" height="112"/>`;
        s += T(50, 126, 'Task 마다: subagent-driven-development', 'lbl k');
        // [글자, x, 폭, 색] 한 Task 의 차례
        const flow = [['브리프', 50, 62, 'a'], ['구현자', 132, 62, 'k'], ['보고서', 214, 62, 'a'], ['검토자', 296, 62, 'k']];
        flow.forEach(([lab, x, w, c], i) => {
            s += box(x, 136, w, 22, lab, c, 10.5);
            if (i < flow.length - 1) s += arrow(`ca-sk-f${i}`, `M${x + w + 2},147 L${x + w + 16},147`, 'k', { svg: S });
        });
        s += arrow('ca-sk-f3', 'M360,147 L374,147', 'k', { svg: S });
        s += list(378, 136, 104, 22, ['장부: complete']);
        s += arrow('ca-sk-back', 'M327,160 C327,176 163,176 163,162', 'c', { svg: S, dash: true });
        s += T(50, 190, 'spec 실패나 Critical, Important 가 있으면 고침, 최대 5번 (4번째부터 새 구현자)', 'lbl sm');
        s += T(50, 206, 'Task 4: spec 통과, Critical 0, Important 0, Minor 6', 'lbl b');
        s += arrow('ca-sk-2', 'M140,224 L140,236', 'k', { svg: S });
        s += box(40, 240, 160, 22, '마지막 전체 검토', 'k', 10.5);
        s += arrow('ca-sk-3', 'M202,251 L226,251', 'k', { svg: S });
        s += list(230, 240, 260, 22, [{ t: '사람: 병합과 push (미리 승인)', cls: 'b' }]);
        s += T(40, 286, 'Task 4 구현자의 사건 안: 사람의 승인 0번', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 3. 훅이 막는 것 ----------
    (function () {
        const S = 'ca-hook'; if (!has(S)) return; let s = '';
        s += T(40, 18, 'PreToolUse: 도구가 실행되기 전에 입력 JSON 을 받음', 'lbl sm');
        s += box(40, 28, 200, 20, 'tool_name: Bash', 'b', 10);
        s += box(40, 52, 200, 20, 'tool_input.command', 'b', 10);
        s += arrow('ca-hk-in', 'M242,50 L284,50', 'b', { svg: S });
        s += box(288, 36, 202, 28, 'decide: git 규칙 넷', 'k', 10.5);
        s += arrow('ca-hk-0', 'M330,66 L330,86', 'k', { svg: S });
        s += arrow('ca-hk-2', 'M450,66 L450,86', 'c', { svg: S });
        s += box(288, 90, 96, 22, 'exit 0: 이어 감', 'k', 10);
        s += box(394, 90, 96, 22, 'exit 2: 막음', 'c', 10);
        s += T(490, 128, 'stderr 가 거부 까닭으로 Claude 에게', 'lbl sm', 'end');
        // 블록 1 의 3단계가 찍은 예시 다섯. 막힌 셋은 벽돌색 굵은 글자
        s += list(40, 138, 450, 84, [
            { t: '1  exit 0  Task 4 의 커밋 (파일 13개를 이름으로)', cls: '' },
            { t: '2  exit 0  git push origin feat/llm-ads-track', cls: '' },
            { t: '3  exit 2  git add -A && git commit …', cls: 'b' },
            { t: '4  exit 2  git commit -am …', cls: 'b' },
            { t: '5  exit 2  git push --force origin main  (규칙 둘)', cls: 'b' },
        ]);
        s += T(40, 240, '권한 문서가 Bash(git push *) 로 못 막는다고 적은 꼴 셋: exit 2', 'lbl k');
        s += T(40, 257, '끝이 / 인 경로, 와일드카드, : 로 시작하는 경로, commit 의 . 도 exit 2', 'lbl');
        s += T(40, 274, '놓친 꼴: 브랜치 없는 push, / 없는 디렉터리, bash -c 안의 명령', 'lbl');
        s += T(40, 292, '이 글은 설정 파일을 바꾸지 않았음 (등록하는 꼴은 글의 더 깊이 보기)', 'lbl sm');
        svg(S, s);
    })();

    // ---------- 4. 장부와 보고 ----------
    (function () {
        const S = 'ca-ledger'; if (!has(S)) return; let s = '';
        s += T(40, 18, '구현자의 보고서, 검사 스크립트, 컨트롤러의 장부', 'lbl sm');
        s += list(40, 26, 200, 62, [
            { t: 'task-4-report.md', cls: 'h' },
            '상태 DONE_WITH_CONCERNS',
            '걱정 여덟',
            '커밋 5327bb4',
        ]);
        s += arrow('ca-lg-1', 'M242,57 L284,57', 'k', { svg: S });
        s += box(288, 26, 202, 20, '블록 다시 돌리기: 통과 3', 'k', 10);
        s += box(288, 48, 202, 20, '기록 상수 대조: 12개 일치', 'k', 10);
        s += box(288, 70, 202, 20, '생성기 대조: 106건', 'k', 10);
        // 5절 발췌의 [장부] 줄. 에이전트 id 는 지웠다
        s += list(40, 100, 450, 94, [
            { t: 'progress.md (컨트롤러의 장부)', cls: 'h' },
            'Task 4: dispatched implementer, BASE 5b16504',
            'Task 4: implementer DONE_WITH_CONCERNS (commit 5327bb4)',
            'Task 4: review: spec 통과, Critical 0, Important 0, Minor 6',
            'Task 4: minor (deferred) 5줄',
            'Task 4: complete (commits 5b16504..5327bb4, review clean)',
        ]);
        // 블록 2 의 3단계와 4단계가 찍은 값
        s += T(40, 218, '발췌의 명령 23개: 구현 6, 실행 9, 보고 8', 'lbl k');
        s += T(40, 236, 'gen-ads-data.py 10개, llm-record.py 4개, git 3개', 'lbl');
        s += T(40, 258, '사람의 승인: 구현자의 사건 0번, 묶음 전체 2번', 'lbl b');
        s += T(40, 280, '기록이 도는 동안 Claude Code 도구 호출: 투표 9번, 심판 9번', 'lbl sm');
        svg(S, s);
    })();

    // ---------- ?card=key ----------
    const only = new URLSearchParams(location.search).get('card');
    if (only) document.querySelectorAll('.tg-card').forEach(c => { if (c.dataset.card !== only) c.hidden = true; });
})();
