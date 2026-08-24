#!/usr/bin/env python3
"""캡쳐용 Grafana 대시보드 JSON 을 만든다. 라이트·다크 두 벌씩.

쿼리는 글(posts/serving-latency-throughput.md)에 실린 PromQL 을 그대로 쓴다.
시리즈 색은 저장소 정본 계열색으로 못 박는다 — Grafana 기본 초록·노랑 팔레트가
그대로 들어오면 17색 안에서 튄다.

    python3 make-dashboards.py --out-dir <디렉터리>
"""
import argparse, json, os

DS = {"type": "prometheus", "uid": "promlocal"}
# 저장소 정본 계열색 (css/style.css 의 --series-1..6)
LIGHT = {"s": ["#4e7bb5", "#c2653f", "#2b5f58"], "line": "#71717a", "txt": "#3f3f46"}
DARK = {"s": ["#5b87be", "#b96a4c", "#6fb3a6"], "line": "#a1a1aa", "txt": "#d4d4d8"}

TUNED_P99 = ('histogram_quantile(0.99, sum by (le) '
             '(rate(pctr_infer_duration_seconds_bucket[5m])))')
DEFAULT_P99 = ('histogram_quantile(0.99, sum by (le) '
               '(rate(pctr_infer_default_duration_seconds_bucket[5m])))')
ERR_RATE = ('sum(rate(pctr_requests_total{{code="500"}}[{w}])) '
            '/ sum(rate(pctr_requests_total[{w}]))')
BUDGET_MISS = ('1 - (sum(rate(pctr_infer_duration_seconds_bucket{le="0.008"}[5m])) '
               '/ sum(rate(pctr_infer_duration_seconds_count[5m])))')


def panel(pid, title, targets, unit, grid, pal, *, threshold=None, ptype="timeseries",
          fill=0, desc="", extra_overrides=None, default_color=None,
          legend_calcs=None):
    """targets = [(expr, 범례)] 순서대로 계열색이 붙는다."""
    overrides = []
    for i, (_, legend) in enumerate(targets):
        if legend and "{{" not in legend:
            overrides.append({
                "matcher": {"id": "byName", "options": legend},
                "properties": [{"id": "color",
                                "value": {"mode": "fixed",
                                          "fixedColor": pal["s"][i % len(pal["s"])]}}],
            })
    if extra_overrides:
        overrides += extra_overrides
    defaults = {
        "unit": unit,
        "color": ({"mode": "fixed", "fixedColor": default_color} if default_color
                  else {"mode": "palette-classic"}),
        "custom": {
            "drawStyle": "line", "lineWidth": 2, "fillOpacity": fill,
            "showPoints": "never", "spanNulls": True, "axisSoftMin": 0,
            "legend": {"showLegend": True},
        },
    }
    if threshold is not None:
        defaults["thresholds"] = {"mode": "absolute", "steps": [
            {"color": "transparent", "value": None},
            {"color": pal["line"], "value": threshold},
        ]}
        defaults["custom"]["thresholdsStyle"] = {"mode": "dashed"}
    else:
        defaults["thresholds"] = {"mode": "absolute", "steps": [
            {"color": "transparent", "value": None}]}
    p = {
        "id": pid, "title": title, "type": ptype, "datasource": DS,
        "description": desc, "gridPos": grid,
        "fieldConfig": {"defaults": defaults, "overrides": overrides},
        "options": {
            "legend": {"displayMode": "table" if legend_calcs else "list",
                       "placement": "bottom", "showLegend": True,
                       "calcs": legend_calcs or []},
            "tooltip": {"mode": "multi", "sort": "none"},
        },
        "targets": [{"refId": chr(65 + i), "datasource": DS, "expr": e,
                     "legendFormat": lg, "interval": "10s"}
                    for i, (e, lg) in enumerate(targets)],
    }
    if ptype == "state-timeline":
        p["options"] = {"legend": {"showLegend": False},
                        "mergeValues": True, "showValue": "never",
                        "rowHeight": 0.5, "alignValue": "center"}
        p["fieldConfig"]["defaults"]["mappings"] = [
            {"type": "value", "options": {"0": {"text": " ", "color": "transparent",
                                                "index": 0},
                                          "1": {"text": "배포 중",
                                                "color": pal["s"][1], "index": 1}}}]
    return p


def dash(uid, title, panels, pal):
    return {
        "uid": uid, "title": title, "schemaVersion": 39, "version": 1,
        "editable": False, "graphTooltip": 0, "timezone": "browser",
        "time": {"from": "now-1h", "to": "now"},
        "refresh": "", "panels": panels,
        "annotations": {"list": [
            {"builtIn": 1, "datasource": {"type": "grafana", "uid": "-- Grafana --"},
             "enable": False, "hide": True, "name": "Annotations & Alerts",
             "type": "dashboard"},
            {"datasource": DS, "enable": True, "hide": False, "name": "배포",
             "iconColor": pal["s"][1], "expr": "pctr_deploy_in_progress > 0",
             "step": "10s", "titleFormat": "배포"},
        ]},
    }


def traps(pal):
    return dash("traps", "패널이 틀리는 자리", [
        panel(1, "오류율 — 같은 30초 스파이크를 창 길이만 바꿔 본 것",
              [(ERR_RATE.format(w="1m"), "1분 창"),
               (ERR_RATE.format(w="5m"), "5분 창"),
               (ERR_RATE.format(w="15m"), "15분 창")],
              "percentunit", {"x": 0, "y": 0, "w": 24, "h": 9}, pal,
              legend_calcs=["max"], desc="rate() 창 길이만 다르고 데이터는 같다"),
        panel(2, "p99 — 널리 쓰는 기본 버킷과 예산에 맞춘 버킷",
              [(DEFAULT_P99, "기본 버킷"), (TUNED_P99, "맞춘 버킷")],
              "s", {"x": 0, "y": 9, "w": 24, "h": 9}, pal, threshold=0.008,
              legend_calcs=["lastNotNull"],
              desc="같은 표본을 두 버킷 벌에 담아 histogram_quantile 로 낸 값. "
                   "점선은 예산 8ms"),
    ], pal)


def oncall(pal):
    P = []
    P.append(panel(1, "요청량 (QPS)",
                   [("sum(rate(pctr_infer_duration_seconds_count[1m]))", "요청량")],
                   "reqps", {"x": 0, "y": 0, "w": 8, "h": 7}, pal, threshold=3000,
                   desc="점선은 증설 기준 3,000 QPS"))
    P.append(panel(2, "예산 초과율 (8ms)", [(BUDGET_MISS, "초과율")],
                   "percentunit", {"x": 8, "y": 0, "w": 8, "h": 7}, pal,
                   threshold=0.10, fill=8, desc="이 서비스의 진짜 오류율"))
    P.append(panel(3, "지연 분위수",
                   [(TUNED_P99.replace("0.99", "0.50"), "p50"),
                    (TUNED_P99.replace("0.99", "0.95"), "p95"),
                    (TUNED_P99, "p99")],
                   "s", {"x": 16, "y": 0, "w": 8, "h": 7}, pal))
    P.append(panel(4, "포화 — 큐 대기 p99 · 처리 중 건수",
                   [('histogram_quantile(0.99, sum by (le) '
                     '(rate(pctr_queue_wait_seconds_bucket[5m])))', "큐 대기 p99"),
                    ("pctr_inflight_requests", "처리 중 건수")],
                   "s", {"x": 0, "y": 7, "w": 8, "h": 7}, pal,
                   extra_overrides=[{
                       "matcher": {"id": "byName", "options": "처리 중 건수"},
                       "properties": [
                           {"id": "unit", "value": "short"},
                           {"id": "custom.axisPlacement", "value": "right"},
                           {"id": "custom.axisLabel", "value": "건"},
                       ]}]))
    P.append(panel(5, "서버별 p99",
                   [('histogram_quantile(0.99, sum by (le, instance) '
                     '(rate(pctr_infer_duration_seconds_bucket[5m])))', "{{instance}}")],
                   "s", {"x": 8, "y": 7, "w": 8, "h": 7}, pal,
                   default_color=pal["line"],
                   extra_overrides=[{
                       "matcher": {"id": "byName", "options": "pctr-07"},
                       "properties": [
                           {"id": "color", "value": {"mode": "fixed",
                                                     "fixedColor": pal["s"][1]}},
                           {"id": "custom.lineWidth", "value": 3},
                       ]}],
                   desc="한 대만 느려진 상황은 여기서만 보인다"))
    P.append(panel(6, "배포 표시 — 세로 구역이 배포가 돈 구간",
                   [("pctr_deploy_in_progress", "배포 중")],
                   "short", {"x": 16, "y": 7, "w": 8, "h": 7}, pal, fill=45,
                   extra_overrides=[{
                       "matcher": {"id": "byName", "options": "배포 중"},
                       "properties": [
                           {"id": "custom.drawStyle", "value": "line"},
                           {"id": "custom.lineInterpolation", "value": "stepAfter"},
                           {"id": "max", "value": 1.2},
                           {"id": "custom.axisPlacement", "value": "hidden"},
                       ]}]))
    return dash("oncall", "당직자 화면 — 패널 여섯", P, pal)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out-dir", required=True)
    a = ap.parse_args()
    os.makedirs(a.out_dir, exist_ok=True)
    for name, pal in (("light", LIGHT), ("dark", DARK)):
        for maker in (traps, oncall):
            d = maker(pal)
            d["uid"] = f"{d['uid']}-{name}"
            d["title"] = f"{d['title']} ({name})"
            path = os.path.join(a.out_dir, f"{maker.__name__}-{name}.json")
            with open(path, "w") as f:
                json.dump(d, f, ensure_ascii=False, indent=2)
            print("  ", path)


if __name__ == "__main__":
    main()
