#!/usr/bin/env bash
# 로컬에 Prometheus + Grafana 를 띄운다. 시스템 설정은 안 건드린다 —
# 데이터·설정·로그가 전부 인자로 준 작업 디렉터리 안에만 생긴다.
#   ./run.sh /tmp/gfx
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
WORK=${1:?사용법: run.sh <작업 디렉터리>}
mkdir -p "$WORK"/{gf-data,gf-logs,gf-plugins,provisioning/datasources,provisioning/dashboards,dashboards}

echo "1) 시뮬레이션 → OpenMetrics"
python3 "$HERE/gen-openmetrics.py" --out "$WORK/metrics.txt" --range-out "$WORK/range.json"

echo "2) promtool 백필"
rm -rf "$WORK/tsdb"; mkdir -p "$WORK/tsdb"
promtool tsdb create-blocks-from openmetrics "$WORK/metrics.txt" "$WORK/tsdb" | tail -3

echo "3) 대시보드 JSON"
python3 "$HERE/make-dashboards.py" --out-dir "$WORK/dashboards"
cp "$HERE/provisioning/datasources/prom.yaml" "$WORK/provisioning/datasources/"
sed "s|__DASHBOARDS_DIR__|$WORK/dashboards|" \
  "$HERE/provisioning/dashboards/dashboards.yaml" > "$WORK/provisioning/dashboards/dashboards.yaml"

echo "4) Prometheus :9099"
prometheus --config.file="$HERE/prometheus.yml" --storage.tsdb.path="$WORK/tsdb" \
  --web.listen-address=127.0.0.1:9099 --storage.tsdb.retention.time=90d \
  > "$WORK/prometheus.log" 2>&1 &
echo $! > "$WORK/prometheus.pid"

echo "5) Grafana :3099"
GF_PATHS_DATA="$WORK/gf-data" GF_PATHS_LOGS="$WORK/gf-logs" \
GF_PATHS_PLUGINS="$WORK/gf-plugins" GF_PATHS_PROVISIONING="$WORK/provisioning" \
GF_SERVER_HTTP_ADDR=127.0.0.1 GF_SERVER_HTTP_PORT=3099 \
GF_AUTH_ANONYMOUS_ENABLED=true GF_AUTH_ANONYMOUS_ORG_ROLE=Admin \
GF_AUTH_DISABLE_LOGIN_FORM=true GF_ANALYTICS_REPORTING_ENABLED=false \
GF_ANALYTICS_CHECK_FOR_UPDATES=false GF_NEWS_NEWS_FEED_ENABLED=false \
GF_LOG_LEVEL=warn \
  grafana server --homepath "$(brew --prefix grafana)/share/grafana" \
  > "$WORK/grafana.log" 2>&1 &
echo $! > "$WORK/grafana.pid"

for i in $(seq 60); do
  p=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:9099/-/ready || true)
  g=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3099/api/health || true)
  [ "$p" = "200" ] && [ "$g" = "200" ] && { echo "   둘 다 준비됨"; exit 0; }
  sleep 1
done
echo "   준비 안 됨 — $WORK/prometheus.log · $WORK/grafana.log 를 보라"; exit 1
