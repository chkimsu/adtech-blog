#!/usr/bin/env bash
# run.sh 로 띄운 두 프로세스를 내린다.
WORK=${1:?사용법: stop.sh <작업 디렉터리>}
for n in prometheus grafana; do
  [ -f "$WORK/$n.pid" ] && kill "$(cat "$WORK/$n.pid")" 2>/dev/null && echo "$n 내림"
  rm -f "$WORK/$n.pid"
done
