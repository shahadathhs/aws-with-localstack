#!/usr/bin/env bash
# Re-render every mockup in docs/mockups/src to a full-page PNG, light and dark (needs Google Chrome).
set -euo pipefail
cd "$(dirname "$0")/mockups/src"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
chrome() { "$CHROME" --headless=new --disable-gpu --hide-scrollbars "$@" 2>/dev/null; }
shot() { # file, output, query; *-mobile pages are 390px wide, the rest 1280px
  local h w=1280
  [[ $1 == *-mobile ]] && w=390
  h=$(chrome --window-size="$w,820" --virtual-time-budget=8000 --dump-dom "file://$PWD/$1.html?measure" \
    | sed -n 's/.*<title>h=\([0-9]*\)<\/title>.*/\1/p')
  chrome --force-device-scale-factor=2 --window-size="$w,${h:-820}" --virtual-time-budget=8000 \
    --screenshot="../$2.png" "file://$PWD/$1.html$3" >/dev/null
}
for f in [0-9]*.html; do
  n="${f%.html}"
  shot "$n" "$n" ""
  shot "$n" "$n-dark" "?theme=dark"
done
