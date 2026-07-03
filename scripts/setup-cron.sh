#!/usr/bin/env bash
#
# Setup cron job for smart sitemap submitter
# Ubuntu (Oracle Cloud) — runs daily at UTC 00:00
#
# Usage:
#   chmod +x scripts/setup-cron.sh
#   sudo ./scripts/setup-cron.sh
#
# Or manually:
#   crontab -e
#   Paste the line below
#

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)" || exit 1
NODE_BIN="$(which node || echo '/usr/bin/node')"
CRON_JOB="0 0 * * * cd ${PROJECT_DIR} && ${NODE_BIN} scripts/sitemap-submitter.mjs >> ${PROJECT_DIR}/data/cron.log 2>&1"

echo "=== Sitemap Submitter Cron Setup ==="
echo "Project: ${PROJECT_DIR}"
echo "Node:    ${NODE_BIN}"
echo ""

# Ensure data directory exists
mkdir -p "${PROJECT_DIR}/data"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "sitemap-submitter"; then
  echo "Sitemap cron job already exists. Current entry:"
  crontab -l | grep "sitemap-submitter"
  echo ""
  read -r -p "Replace it? (y/N): " REPLY
  if [[ ! "$REPLY" =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
  fi
  # Remove old entry
  (crontab -l 2>/dev/null | grep -v "sitemap-submitter") | crontab -
fi

# Add new cron job
(crontab -l 2>/dev/null; echo "${CRON_JOB}") | crontab -

echo "Cron job installed:"
echo "  ${CRON_JOB}"
echo ""
echo "Verify with: crontab -l"
echo "Logs at:     ${PROJECT_DIR}/data/cron.log"
echo ""

# First run prompt
read -r -p "Run the script now for the first time? (Y/n): " RUN_NOW
if [[ ! "$RUN_NOW" =~ ^[Nn]$ ]]; then
  echo "Running sitemap-submitter for the first time..."
  cd "${PROJECT_DIR}" || exit 1
  ${NODE_BIN} scripts/sitemap-submitter.mjs
fi

echo "Done."
