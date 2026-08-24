#!/usr/bin/env bash
# 띄워 둔 Grafana(:3099)에서 그림 6장을 캡쳐해 images/ 에 쓴다.
#   ./shoot.sh /tmp/gfx
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
REPO=$(cd "$HERE/../.." && pwd)
WORK=${1:?사용법: shoot.sh <작업 디렉터리>}
CHROME=${CHROME:-"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"}
ST=$(python3 -c "import json;print(json.load(open('$WORK/range.json'))['start_epoch'])")

# 폭 1100 은 글 본문의 최대 폭이다. 더 넓게 잡으면 화면에서 줄어들어 글자가 안 읽힌다.
shot() {  # $1=파일명 $2=크기 $3=경로
  "$CHROME" --headless --disable-gpu --no-sandbox --hide-scrollbars \
    --window-size="$2" --force-device-scale-factor=2 --virtual-time-budget=25000 \
    --screenshot="$REPO/images/$1" "http://127.0.0.1:3099$3" 2>/dev/null
  printf "  %-30s %s\n" "$1" "$(du -h "$REPO/images/$1" | cut -f1)"
}

for th in light dark; do
  shot "grafana-window-$th.png" 1100,410 \
    "/d-solo/traps-$th/x?panelId=1&theme=$th&from=$(( (ST+2700)*1000 ))&to=$(( (ST+3599)*1000 ))"
  shot "grafana-buckets-$th.png" 1100,372 \
    "/d-solo/traps-$th/x?panelId=2&theme=$th&from=$(( (ST+300)*1000 ))&to=$(( (ST+1150)*1000 ))"
  shot "grafana-oncall-$th.png" 1100,640 \
    "/d/oncall-$th/x?kiosk&theme=$th&from=$(( ST*1000 ))&to=$(( (ST+3599)*1000 ))"
done
