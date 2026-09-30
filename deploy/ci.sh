#!/usr/bin/env bash
# Deploy helpers for .github/workflows/deploy.yml. Needs SITE_URL, GITHUB_SHA and (for unpack/ops) OPS_TOKEN.
#
#   ci.sh unpack app|site           install an uploaded release via public/_unpack.php and wait for it
#   ci.sh ops <task>                run a token-guarded backend task (POST /api/ops/<task>) and wait for it
#   ci.sh indexnow <old> <new>      ping IndexNow with URLs that are new or changed since the last deploy
set -euo pipefail

poll() { # poll <label> <command...>: repeat until .state is no longer running/unknown (max 10 min)
  local label=$1; shift
  local status state
  for _ in $(seq 1 120); do
    sleep 5
    status=$("$@" || true)
    state=$(echo "$status" | jq -r '.state // "unknown"' 2>/dev/null || echo unknown)
    [ "$state" = "running" ] || [ "$state" = "unknown" ] || break
  done
  echo "$label: $status"
  [ "$state" = "done" ] || { echo "::error title=$label failed::$status"; exit 1; }
}

case "${1:-}" in
  unpack)
    kind=$2
    call() { curl -sS -m 60 -X POST -H "X-Ops-Token: $OPS_TOKEN" "$SITE_URL/_unpack.php?action=$1&kind=$kind&sha=$GITHUB_SHA"; }
    call start; echo
    poll "unpack $kind" call status
    ;;

  ops)
    task=$2
    start=$(curl -sS -m 60 -X POST -H "Accept: application/json" -H "Authorization: Bearer $OPS_TOKEN" "$SITE_URL/api/ops/$task")
    echo "$start"
    run=$(echo "$start" | jq -r '.run // empty')
    [ -n "$run" ] || { echo "::error title=ops $task::did not start"; exit 1; }
    poll "ops $task" curl -sS -m 30 -H "Accept: application/json" -H "Authorization: Bearer $OPS_TOKEN" "$SITE_URL/api/ops/runs/$run"
    ;;

  indexnow)
    old=$2 new=$3
    key=$(jq -r '.indexNowKey // empty' "$new")
    if [ -z "$key" ]; then echo "No IndexNow key set in the admin panel; skipping."; exit 0; fi
    # URLs whose lastmod changed or that are new since the previous deploy (max 10k per request).
    urls=$(jq -n --slurpfile o "$old" --slurpfile n "$new" '
      ($o[0] | if type == "object" then (.urls // []) else [] end | map({(.loc): .lastmod}) | add // {}) as $prev
      | [$n[0].urls[] | select($prev[.loc] != .lastmod) | .loc] | .[:10000]')
    count=$(echo "$urls" | jq length)
    if [ "$count" = "0" ]; then echo "No changed URLs; nothing to ping."; exit 0; fi
    host=$(echo "$SITE_URL" | sed -E 's#^https?://([^/]+).*#\1#')
    body=$(jq -n --arg host "$host" --arg key "$key" --arg loc "$SITE_URL/$key.txt" --argjson urls "$urls" \
      '{host: $host, key: $key, keyLocation: $loc, urlList: $urls}')
    code=$(curl -sS -o /dev/null -w "%{http_code}" -m 30 -X POST -H "Content-Type: application/json; charset=utf-8" \
      -d "$body" https://api.indexnow.org/indexnow)
    echo "IndexNow: $count URL(s) submitted, HTTP $code"
    # 200/202 = accepted. Anything else is reported but never fails the deploy.
    [ "$code" = "200" ] || [ "$code" = "202" ] || echo "::warning title=IndexNow::HTTP $code"
    ;;

  *)
    echo "usage: $0 unpack app|site | ops <task> | indexnow <old.json> <new.json>" >&2
    exit 2
    ;;
esac
