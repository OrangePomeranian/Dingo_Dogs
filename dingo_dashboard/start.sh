#!/usr/bin/env bash
# ============================================================
# start.sh — Launch the Dingo Genomic Analysis Dashboard
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "============================================================"
echo "  🐕  Dingo Genomic Analysis Dashboard"
echo "============================================================"

# Check Python
if ! command -v python3 &>/dev/null; then
  echo "❌  Python 3 is required. Please install it first."
  exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
  echo "→  Creating virtual environment…"
  python3 -m venv .venv
fi

# Activate venv
source .venv/bin/activate

# Install dependencies
echo "→  Checking dependencies…"
pip install -q -r requirements.txt

# Check for API key
if [ -z "${ANTHROPIC_API_KEY:-}" ]; then
  echo ""
  echo "⚠  ANTHROPIC_API_KEY is not set."
  echo "   The LLM assistant will require you to enter your API key in the UI."
  echo "   To set it: export ANTHROPIC_API_KEY='sk-ant-api03-...'"
  echo ""
fi

echo "→  Starting server on http://localhost:5050"
echo "   Press Ctrl+C to stop."
echo "============================================================"
echo ""

python3 server.py
