#!/usr/bin/env bash
# Fails if a page references a local file that doesn't exist, or uses a
# root-absolute path ("/assets/..."), which breaks under /ProjectsDisplay/ on GitHub Pages.
# Usage: .github/scripts/check-links.sh index.html resume.html
set -uo pipefail

status=0
checked=0

check_ref() {
  local page="$1" ref="$2" dir
  dir="$(dirname "$page")"
  case "$ref" in
    ""|"#"*|http://*|https://*|mailto:*|tel:*|data:*|javascript:*) return ;;
    //*|/*) echo "::error file=$page::Root-absolute path '$ref' will 404 on GitHub Pages. Use ./relative paths."; status=1; return ;;
  esac
  local path="${ref%%#*}"; path="${path%%\?*}"
  [ -z "$path" ] && return
  checked=$((checked + 1))
  if [ ! -e "$dir/$path" ]; then
    echo "::error file=$page::Missing file: '$ref'"
    status=1
  fi
}

for page in "$@"; do
  [ -f "$page" ] || { echo "::error::No such page: $page"; status=1; continue; }
  while IFS= read -r ref; do check_ref "$page" "$ref"; done < <(
    {
      grep -oE '(src|href)="[^"]*"' "$page" | sed -E 's/^(src|href)="//; s/"$//'
      grep -oE 'srcset="[^"]*"' "$page" | sed -E 's/^srcset="//; s/"$//' | tr ',' '\n' | awk '{print $1}'
    }
  )
done

# url(...) inside stylesheets, resolved relative to the stylesheet
for css in assets/css/*.css; do
  [ -f "$css" ] || continue
  while IFS= read -r ref; do check_ref "$css" "$ref"; done < <(
    grep -oE 'url\([^)]*\)' "$css" | sed -E "s/^url\(['\"]?//; s/['\"]?\)$//"
  )
done

echo "Checked $checked local references."
exit $status
