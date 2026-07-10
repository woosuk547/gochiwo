#!/usr/bin/env bash
# sessionStart: 팁 자동 기록 규칙을 컨텍스트에 주입
set -euo pipefail
cat >/dev/null  # consume stdin JSON
python3 - <<'PY'
import json
print(json.dumps({
  "additional_context": (
    "【자동 기록 규칙】새 버그/해결책/팁은 `.cursor/rules/tips.mdc` 상단에 "
    "`- [YYYY-MM-DD] 이슈 -> 팁`으로 즉시 기록. CLAUDE.md 금지. "
    "작업 종료 시 stop 훅이 미기록 팁을 점검한다."
  )
}, ensure_ascii=False))
PY
