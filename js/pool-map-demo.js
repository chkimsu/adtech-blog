/**
 * pool-map-demo.js — 광고 후보풀 지도 그림 다섯 장
 *
 * 그림은 demo-pool-map.html 안에 SVG 로 그대로 적혀 있다. 이 파일은 ?fig=N 이 붙었을 때
 * N번 그림만 남기는 일만 한다 (글 안에 iframe 으로 넣을 때 쓴다).
 */
(function () {
    'use strict';
    const fig = new URLSearchParams(location.search).get('fig');
    if (fig) document.querySelectorAll('.pm-sec').forEach(sec => { if (sec.dataset.fig !== fig) sec.hidden = true; });
})();
