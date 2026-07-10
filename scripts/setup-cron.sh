#!/usr/bin/env bash
#
# Setup cron jobs for DevStackIO
# Ubuntu (Oracle Cloud) — runs daily at UTC 00:00
#
# Installs:
#   1. SEO Audit — validates sitemap, checks orphan pages, broken links, metadata
#   2. Sitemap Submit — submits sitemap to search engines when content changes
#
# Usage:
#   chmod +x scripts/setup-cron.sh
#   sudo ./scripts/setup-cron.sh
#

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)" || exit 1
NODE_BIN="$(which node || echo '/usr/bin/node')"

CRON_SEO="0 0 * * * cd ${PROJECT_DIR} && ${NODE_BIN} scripts/seo-audit.mjs --submit >> ${PROJECT_DIR}/data/cron.log 2>&1"

echo "=== DevStackIO Cron Setup ==="
echo "Project: ${PROJECT_DIR}"
echo "Node:    ${NODE_BIN}"
echo ""

# Ensure data directory exists
mkdir -p "${PROJECT_DIR}/data"

# Build the cron entries
CRON_ENTRIES="${CRON_SEO}"

# Remove any old sitemap-submitter only entries
if crontab -l 2>/dev/null | grep -q "sitemap-submitter"; then
  echo "Upgrading from legacy sitemap-only cron..."
  (crontab -l 2>/dev/null | grep -v "sitemap-submitter") | crontab -
fi

# Check if seo-audit cron already exists
if crontab -l 2>/dev/null | grep -q "seo-audit"; then
  echo "SEO audit cron job already exists. Current entry:"
  crontab -l | grep "seo-audit"
  echo ""
  read -r -p "Replace it? (y/N): " REPLY
  if [[ ! "$REPLY" =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
  fi
  (crontab -l 2>/dev/null | grep -v "seo-audit") | crontab -
fi

# Add new cron job
(crontab -l 2>/dev/null; echo "${CRON_ENTRIES}") | crontab -

echo "Cron job installed:"
echo "  ${CRON_SEO}"
echo ""
echo "This runs daily at UTC 00:00 and:"
echo "  1. Validates XML sitemap (syntax, duplicates, coverage)"
echo "  2. Detects orphan pages (in sitemap but no internal link)"
echo "  3. Scans for broken internal links"
echo "  4. Checks canonical URL consistency"
echo "  5. Detects duplicate title/description/H1"
echo "  6. Validates JSON-LD structured data"
echo "  7. Validates robots.txt"
echo "  8. Checks content quality and image SEO"
echo "  9. Generates HTML + JSON audit reports"
echo "  10. Submits sitemap to search engines"
echo ""
echo "Verify with: crontab -l"
echo "Logs at:     ${PROJECT_DIR}/data/cron.log"
echo "Reports at:  ${PROJECT_DIR}/data/seo-reports/"
echo ""

# First run prompt
read -r -p "Run the SEO audit now for the first time? (Y/n): " RUN_NOW
if [[ ! "$RUN_NOW" =~ ^[Nn]$ ]]; then
  echo "Running SEO audit for the first time..."
  cd "${PROJECT_DIR}" || exit 1
  ${NODE_BIN} scripts/seo-audit.mjs --submit
fi

echo ""
echo "Done."
