/**
 * demo-edu.js — 데모 교육 프레임워크 엔진
 *
 * 1) 실시간 해설 패널: DEMO_EDU[key].explain 룰을 document 이벤트 위임으로 매칭
 *    → 데모 JS를 수정하지 않고 동작 (인라인 onclick 데모도 버블링으로 커버)
 * 2) 가이드 투어: 스포트라이트 + 말풍선, waitFor 행동 대기, localStorage 1회 자동 시작
 * 3) 임베드 모드 (?embed=1): embedKeep 외 요소 숨김 + postMessage 높이 전송 + 부모 테마 동기
 *
 * window.DEMO_EDU[key] 엔트리가 없는 데모에서는 전부 no-op (점진 롤아웃 안전).
 */
(function () {
    'use strict';

    const pathMatch = location.pathname.match(/demo-([a-z0-9-]+)\.html$/);
    const key = pathMatch && pathMatch[1];
    const cfg = key && window.DEMO_EDU && window.DEMO_EDU[key];
    if (!cfg) return;

    const isEmbed = /[?&]embed=1/.test(location.search);
    if (isEmbed) document.documentElement.classList.add('is-embed');

    const rules = cfg.explain || {};
    const steps = cfg.tour || [];
    const TOUR_DONE_KEY = 'eduTourDone:' + key;

    // ==========================================
    // Helpers
    // ==========================================
    function el(tag, cls, html) {
        const n = document.createElement(tag);
        if (cls) n.className = cls;
        if (html != null) n.innerHTML = html;
        return n;
    }

    function anchorNode() {
        const candidates = [cfg.anchor, '.demo-container', 'main'];
        for (const sel of candidates) {
            if (!sel) continue;
            const n = document.querySelector(sel);
            if (n) return n;
        }
        return document.body;
    }

    function renderMath(node) {
        if (!window.renderMathInElement) return;
        try {
            window.renderMathInElement(node, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false }
                ],
                throwOnError: false
            });
        } catch (e) { /* KaTeX 미로드 페이지에서는 조용히 무시 */ }
    }

    function readVal(input) {
        const v = input.value;
        const n = parseFloat(v);
        return Number.isNaN(n) ? v : n;
    }

    function initialVal(input) {
        const v = 'defaultValue' in input && input.defaultValue !== '' ? input.defaultValue : input.value;
        const n = parseFloat(v);
        return Number.isNaN(n) ? v : n;
    }

    function matchRule(target) {
        for (const sel in rules) {
            try {
                const hit = target.closest(sel);
                if (hit) return { sel, hit };
            } catch (e) { /* 잘못된 셀렉터는 건너뜀 */ }
        }
        return null;
    }

    // ==========================================
    // 1) 실시간 해설 패널
    // ==========================================
    let panel = null, msgBox = null, prevBox = null;

    function ensurePanel() {
        if (panel) return panel;
        panel = el('aside', 'demo-explain');
        panel.id = 'demo-edu-explain';
        panel.setAttribute('aria-live', 'polite');
        panel.appendChild(el('div', 'demo-explain-label', '지금 일어난 일'));
        msgBox = el('div', 'demo-explain-msg', '아래 컨트롤을 조작하면 여기에 해설이 나타납니다.');
        prevBox = el('div', 'demo-explain-msg is-prev', '');
        prevBox.hidden = true;
        panel.appendChild(msgBox);
        panel.appendChild(prevBox);
        const host = anchorNode();
        host.insertBefore(panel, host.firstChild);
        return panel;
    }

    function note(html) {
        if (!html) return;
        ensurePanel();
        if (msgBox.dataset.has === '1') {
            prevBox.innerHTML = msgBox.innerHTML;
            prevBox.hidden = false;
        }
        msgBox.innerHTML = html;
        msgBox.dataset.has = '1';
        panel.classList.remove('is-flash');
        void panel.offsetWidth; // 애니메이션 재시작
        panel.classList.add('is-flash');
        renderMath(panel);
    }

    function runRule(sel, params) {
        const fn = rules[sel];
        if (!fn) return;
        const html = typeof fn === 'function' ? fn(params || {}) : fn;
        if (html) note(html);
    }

    // 슬라이더: 엘리먼트별 300ms 디바운스, 버스트 시작값을 prev로 보존
    const sliderState = new Map();

    document.addEventListener('input', (e) => {
        const t = e.target;
        if (!(t instanceof Element)) return;
        tourAction(t, 'input');
        const m = matchRule(t);
        if (!m) return;
        let st = sliderState.get(m.hit);
        if (!st) {
            st = { last: initialVal(m.hit), timer: null, burstStart: null };
            sliderState.set(m.hit, st);
        }
        if (st.timer) {
            clearTimeout(st.timer);
        } else {
            st.burstStart = st.last; // 버스트 시작 시점의 값
        }
        st.timer = setTimeout(() => {
            st.timer = null;
            const value = readVal(m.hit);
            const prev = st.burstStart;
            st.last = value;
            if (value !== prev) runRule(m.sel, { value, prev, el: m.hit });
        }, 300);
    });

    document.addEventListener('click', (e) => {
        const t = e.target;
        if (!(t instanceof Element)) return;
        tourAction(t, 'click');
        const m = matchRule(t);
        if (!m || m.hit.matches('input, select, textarea')) return;
        runRule(m.sel, { el: m.hit });
    });

    // ==========================================
    // 2) 가이드 투어
    // ==========================================
    let tourIdx = -1, spot = null, bubble = null, rafPending = false;

    function tourActive() { return tourIdx >= 0; }

    function buildTourDom() {
        spot = el('div', 'edu-tour-spotlight');
        bubble = el('div', 'edu-tour-bubble');
        bubble.setAttribute('role', 'dialog');
        bubble.setAttribute('aria-label', '가이드 투어');
        bubble.setAttribute('tabindex', '-1');
        document.body.appendChild(spot);
        document.body.appendChild(bubble);
        window.addEventListener('scroll', requestReposition, { passive: true });
        window.addEventListener('resize', requestReposition);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && tourActive()) endTour();
        });
    }

    function startTour() {
        if (!steps.length) return;
        if (!spot) buildTourDom();
        spot.hidden = false;
        bubble.hidden = false;
        showStep(0);
    }

    function endTour() {
        tourIdx = -1;
        if (spot) { spot.hidden = true; bubble.hidden = true; }
        try { localStorage.setItem(TOUR_DONE_KEY, '1'); } catch (e) { /* private mode */ }
    }

    function showStep(i) {
        const step = steps[i];
        if (!step) return endTour();
        const target = document.querySelector(step.el);
        if (!target) {
            // 타깃이 없는 스텝은 건너뜀
            return i + 1 < steps.length ? showStep(i + 1) : endTour();
        }
        tourIdx = i;
        target.scrollIntoView({ block: 'center', behavior: 'smooth' });
        renderBubble(step, i);
        requestReposition();
    }

    function renderBubble(step, i) {
        bubble.innerHTML = '';
        bubble.appendChild(el('h4', null, step.title || ''));
        bubble.appendChild(el('p', null, step.body || ''));
        const foot = el('div', 'edu-tour-foot');
        foot.appendChild(el('span', 'edu-tour-progress', (i + 1) + '/' + steps.length));
        const skip = el('button', 'edu-tour-btn ghost', '건너뛰기');
        skip.type = 'button';
        skip.addEventListener('click', endTour);
        foot.appendChild(skip);
        if (i > 0) {
            const prev = el('button', 'edu-tour-btn', '이전');
            prev.type = 'button';
            prev.addEventListener('click', () => showStep(i - 1));
            foot.appendChild(prev);
        }
        if (step.waitFor) {
            foot.appendChild(el('span', 'edu-tour-wait', '✋ 직접 해보세요'));
        } else {
            const isLast = i + 1 === steps.length;
            const next = el('button', 'edu-tour-btn primary', isLast ? '마침' : '다음');
            next.type = 'button';
            next.addEventListener('click', () => isLast ? endTour() : showStep(i + 1));
            foot.appendChild(next);
        }
        bubble.appendChild(foot);
        renderMath(bubble);
        bubble.focus({ preventScroll: true });
    }

    // waitFor 스텝: 타깃에서 해당 행동이 일어나면 자동 진행
    function tourAction(target, type) {
        if (!tourActive()) return;
        const step = steps[tourIdx];
        if (!step || step.waitFor !== type) return;
        let hit = null;
        try { hit = target.closest(step.el); } catch (e) { return; }
        if (!hit) return;
        const i = tourIdx;
        // 사용자에게 변화가 보일 시간을 준 뒤 진행 (input은 드래그 종료 대기)
        setTimeout(() => {
            if (tourIdx !== i) return;
            if (i + 1 === steps.length) endTour();
            else showStep(i + 1);
        }, type === 'input' ? 900 : 500);
    }

    function requestReposition() {
        if (rafPending || !tourActive()) return;
        rafPending = true;
        requestAnimationFrame(() => {
            rafPending = false;
            positionStep();
        });
    }

    function positionStep() {
        if (!tourActive() || !spot) return;
        const step = steps[tourIdx];
        const target = document.querySelector(step.el);
        if (!target) return;
        const r = target.getBoundingClientRect();
        const pad = 6;
        spot.style.top = (r.top + window.scrollY - pad) + 'px';
        spot.style.left = (r.left + window.scrollX - pad) + 'px';
        spot.style.width = (r.width + pad * 2) + 'px';
        spot.style.height = (r.height + pad * 2) + 'px';

        // ≤900px에서는 CSS가 말풍선을 바텀시트로 고정
        if (window.matchMedia('(max-width: 900px)').matches) return;
        const bw = bubble.offsetWidth, bh = bubble.offsetHeight;
        let top = r.bottom + window.scrollY + 14;
        if (r.bottom + 14 + bh > window.innerHeight && r.top - 14 - bh > 0) {
            top = r.top + window.scrollY - bh - 14; // 아래 공간 부족 → 위
        }
        // 타깃이 뷰포트보다 클 때도 말풍선은 항상 화면 안에 (타깃과 겹치더라도)
        const maxTop = window.scrollY + window.innerHeight - bh - 12;
        const minTop = window.scrollY + 12;
        top = Math.max(minTop, Math.min(top, maxTop));
        let left = r.left + window.scrollX;
        const minLeft = window.scrollX + 12;
        const maxLeft = window.scrollX + document.documentElement.clientWidth - bw - 12;
        left = Math.max(minLeft, Math.min(left, maxLeft));
        bubble.style.top = top + 'px';
        bubble.style.left = left + 'px';
    }

    // "▶ 가이드 투어" 재시작 칩
    function injectTourChip() {
        if (!steps.length || isEmbed) return;
        const chip = el('button', 'edu-tour-chip', '▶ 가이드 투어');
        chip.type = 'button';
        chip.addEventListener('click', startTour);
        const stepsTitle = document.querySelector('.demo-steps-title');
        if (stepsTitle) {
            stepsTitle.appendChild(chip);
        } else {
            chip.classList.add('is-floating');
            document.body.appendChild(chip);
        }
    }

    function maybeAutoStartTour() {
        if (isEmbed || !steps.length) return;
        let done = null;
        try { done = localStorage.getItem(TOUR_DONE_KEY); } catch (e) { /* private mode */ }
        if (!done) setTimeout(startTour, 600); // 차트 init 이후
    }

    // ==========================================
    // 3) 임베드 모드 (?embed=1)
    // ==========================================
    function setupEmbed() {
        const keep = (cfg.embedKeep || []).slice();
        const main = document.querySelector('main');

        // main 밖 형제 요소 숨김 (header/footer는 CSS가 첫 페인트부터 처리)
        Array.from(document.body.children).forEach((c) => {
            if (c !== main && c.tagName !== 'SCRIPT') c.hidden = true;
        });

        // main 안에서 embedKeep(∪ 해설 패널) 외 전부 숨김
        if (main) {
            Array.from(main.children).forEach((c) => {
                const ok = c.id === 'demo-edu-explain' || keep.some((sel) => {
                    try { return c.matches(sel) || !!c.querySelector(sel); } catch (e) { return false; }
                });
                if (!ok) c.hidden = true;
            });
        }

        // embedHide: 임베드에서 불필요한 부가 요소(축 설명 등) 추가 숨김
        (cfg.embedHide || []).forEach((sel) => {
            try {
                document.querySelectorAll(sel).forEach((n) => { n.hidden = true; });
            } catch (e) { /* 잘못된 셀렉터는 건너뜀 */ }
        });

        // 하단 컴팩트 바: 제목 + 전체 데모 링크
        const fullUrl = location.pathname.split('/').pop();
        const titleEl = document.querySelector('.post-header h1, h1');
        const bar = el('div', 'demo-embed-bar',
            '<span class="demo-embed-bar-title">' + (titleEl ? titleEl.textContent : '인터랙티브 데모') + '</span>' +
            '<a href="' + fullUrl + '" target="_blank" rel="noopener">전체 데모로 열기 ↗</a>');
        (main || document.body).appendChild(bar);

        // 부모 페이지로 콘텐츠 높이 전송 (iframe 자동 리사이즈)
        const postHeight = () => {
            try {
                parent.postMessage(
                    { type: 'demo-edu:height', height: document.documentElement.scrollHeight },
                    location.origin
                );
            } catch (e) { /* cross-origin 등 — 무시 */ }
        };
        if ('ResizeObserver' in window) {
            new ResizeObserver(postHeight).observe(document.body);
        }
        window.addEventListener('load', postHeight);

        // 부모 창의 테마 토글을 실시간 추종 (같은 오리진 localStorage)
        window.addEventListener('storage', (e) => {
            if (e.key === 'theme' && e.newValue) {
                document.documentElement.setAttribute('data-theme', e.newValue);
            }
        });
    }

    // ==========================================
    // 공개 API (데모 JS의 선택적 심화용 — window.demoEdu?.note(...))
    // ==========================================
    window.demoEdu = {
        isEmbed,
        note,
        explain: runRule,
        startTour
    };

    // ==========================================
    // Init (스크립트는 body 끝에서 로드 → DOM 파싱 완료 상태)
    // ==========================================
    ensurePanel();
    injectTourChip();
    if (isEmbed) {
        setupEmbed();
    } else {
        window.addEventListener('load', maybeAutoStartTour);
    }
})();
