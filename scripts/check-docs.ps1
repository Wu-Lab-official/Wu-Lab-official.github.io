[CmdletBinding()]
param(
  [string]$Root
)

# Documentation lint (read-only, no build): heading numbering, section cross references,
# Markdown table column counts, "last updated" stamps, relative .md links.
# Called by scripts/check-site.ps1; can also run alone: powershell -File scripts\check-docs.ps1
# NOTE: this file is deliberately ASCII-only so PowerShell 5.1 can parse it without a BOM.
# Chinese markers are built from code points below.

$ErrorActionPreference = "Stop"
# $PSScriptRoot is not reliable inside a param default in PowerShell 5.1, resolve it here
if ([string]::IsNullOrWhiteSpace($Root)) { $Root = Split-Path -Parent $PSScriptRoot }
if (-not (Test-Path (Join-Path $Root "_config.yml"))) { throw "Not a site root: $Root" }
$fail = New-Object System.Collections.Generic.List[string]

$sec = [string][char]0x00A7                          # section sign
$stamp = [string][char]0x6700 + [char]0x540E + [char]0x66F4 + [char]0x65B0   # last-updated label

$docs = @()
foreach ($n in @("MAINTENANCE.md", "CONTENT.md", "TOOLBOOK.md", "WORKLOG.md", "README.md")) {
  $p = Join-Path $Root $n
  if (Test-Path $p) { $docs += , @($n, $p) }
}
# workspace AGENTS.md is outside the repo; a fresh clone will not have it, so skip when absent
$agentsPath = Join-Path (Split-Path -Parent $Root) "AGENTS.md"
if (Test-Path $agentsPath) { $docs += , @("AGENTS.md", $agentsPath) }

$linesByName = @{}
$numsByName = @{}

# ---- pass 1: heading numbering (H2 must increase; numbered H3 must sit under its H2) ----
foreach ($d in $docs) {
  $name = $d[0]
  $path = $d[1]
  $lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)
  $linesByName[$name] = $lines
  $nums = New-Object System.Collections.Generic.HashSet[string]
  $h2 = -1
  $lastH2 = -1
  for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    if ($line -match '^###\s+(\d+)(?:\.(\d+))?\.?\s') {
      $numStr = $matches[1]
      if ($matches[2]) { $numStr = $matches[1] + "." + $matches[2] }
      if ($matches[2] -and ([int]$matches[1] -ne $h2)) {
        $fail.Add(("{0}:{1} H3 {2} does not belong to current H2 {3}" -f $name, ($i + 1), $numStr, $h2))
      }
      [void]$nums.Add($numStr)
      continue
    }
    if ($line -match '^##\s+(\d+(?:\.\d+)?)\.?\s') {
      $numStr = $matches[1]
      $num = [double]$numStr
      if ($num -le $lastH2) {
        $fail.Add(("{0}:{1} H2 {2} is not after previous H2 {3}" -f $name, ($i + 1), $numStr, $lastH2))
      }
      if (-not $nums.Add($numStr)) {
        $fail.Add(("{0}:{1} H2 number repeated: {2}" -f $name, ($i + 1), $numStr))
      }
      $lastH2 = $num
      $h2 = [int][math]::Floor($num)
      continue
    }
  }
  $numsByName[$name] = $nums
}

# ---- pass 2: table columns / section refs / links / last-updated stamp ----
foreach ($d in $docs) {
  $name = $d[0]
  $path = $d[1]
  $dir = Split-Path -Parent $path
  $lines = $linesByName[$name]
  $content = $lines -join "`n"
  $inFence = $false
  $tableLine = 0
  $tableCols = 0

  for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    $trim = $line.Trim()
    if ($trim.StartsWith('```') -or $trim.StartsWith('~~~')) { $inFence = -not $inFence; continue }
    if ($inFence) { continue }

    # table: every row must have the same cell count as the header row (\| is escaped, not a separator)
    if ($trim.StartsWith('|')) {
      $cells = $trim -replace '\\\|', [string][char]1
      if ($cells.StartsWith('|')) { $cells = $cells.Substring(1) }
      if ($cells.EndsWith('|')) { $cells = $cells.Substring(0, $cells.Length - 1) }
      $n = ($cells.Split('|')).Count
      if ($tableLine -eq 0) {
        $tableLine = $i + 1
        $tableCols = $n
      } elseif ($n -ne $tableCols) {
        $fail.Add(("{0}:{1} table has {2} cells, header (line {3}) has {4}" -f $name, ($i + 1), $n, $tableLine, $tableCols))
      }
    } else {
      $tableLine = 0
    }

    # section refs: the number must exist as a heading in the target document.
    # Target = explicit "foo.md §N", else the nearest .md mentioned earlier on the same line,
    # else the current document.
    $refPattern = '(?:([A-Za-z0-9_.\-]+\.md)`?\s*)?' + $sec + '\s*(\d+(?:\.\d+)?)'
    foreach ($m in [regex]::Matches($line, $refPattern)) {
      $target = $name
      if ($m.Groups[1].Success) {
        $target = $m.Groups[1].Value
      } elseif ($name -eq "WORKLOG.md") {
        # WORKLOG is a chronological log: refs like "MAINTENANCE.md: ... section 0.4/1/4"
        # mention several documents in one line, so only explicit refs are checked there.
        continue
      } else {
        $prefix = $line.Substring(0, $m.Index)
        $pm = [regex]::Matches($prefix, '([A-Za-z0-9_.\-]+\.md)')
        foreach ($cand in $pm) {
          if ($numsByName.ContainsKey($cand.Groups[1].Value)) { $target = $cand.Groups[1].Value }
        }
      }
      $numRef = $m.Groups[2].Value
      if (-not $numsByName.ContainsKey($target)) {
        $fail.Add(("{0}:{1} ref to unchecked document {2} (section {3})" -f $name, ($i + 1), $target, $numRef))
      } elseif (-not $numsByName[$target].Contains($numRef)) {
        $fail.Add(("{0}:{1} section {2} not found in {3}" -f $name, ($i + 1), $numRef, $target))
      }
    }

    # relative .md links must resolve
    foreach ($m in [regex]::Matches($line, '\]\(([^)\s]+?\.md)(?:#[^)]*)?\)')) {
      $rel = $m.Groups[1].Value
      if (-not (Test-Path (Join-Path $dir $rel))) {
        $fail.Add(("{0}:{1} link target missing: {2}" -f $name, ($i + 1), $rel))
      }
    }
  }

  if (@("MAINTENANCE.md", "CONTENT.md", "TOOLBOOK.md") -contains $name) {
    if (-not ($content -match [regex]::Escape($stamp) + '.{0,6}\d{4}-\d{2}-\d{2}')) {
      $fail.Add(("{0} has no last-updated stamp (YYYY-MM-DD)" -f $name))
    }
  }
  if ($name -eq "WORKLOG.md") {
    if (-not ($content -match '(?m)^## \d{4}-\d{2}-\d{2}')) {
      $fail.Add("WORKLOG.md has no dated entry")
    }
  }
}

Write-Host ""
if ($fail.Count -eq 0) {
  Write-Host ("PASS: docs ok ({0} files)" -f $docs.Count) -ForegroundColor Green
  exit 0
} else {
  $fail | ForEach-Object { Write-Host ("FAIL: " + $_) -ForegroundColor Red }
  exit 1
}
