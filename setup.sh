#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"

install_gh() {
  if command -v gh >/dev/null 2>&1; then
    return
  fi

  echo "gh CLI not found. Attempting installation..."
  if [[ "$(uname -s)" == "Darwin" ]]; then
    if command -v brew >/dev/null 2>&1; then
      brew install gh
      return
    fi
  fi

  if [[ "$(uname -s)" == "Linux" ]]; then
    if command -v apt-get >/dev/null 2>&1; then
      sudo apt-get update
      sudo apt-get install -y gh
      return
    fi
  fi

  echo "Please install GitHub CLI (gh) manually and re-run setup.sh."
  exit 1
}

install_gh

if ! gh extension list | grep -q "gh-copilot"; then
  gh extension install github/gh-copilot
fi

# Helpful aliases
if ! gh alias list | grep -q "^cp:"; then
  gh alias set cp "copilot"
fi
if ! gh alias list | grep -q "^cps:"; then
  gh alias set cps "copilot suggest"
fi

"$ROOT/bin/autopilot" "$@"
