[CmdletBinding()]
param(
  [string]$Root
)

# Data lint (read-only, no build): publication ids, tags, research paper_ids, DOI shape,
# and people photo paths. Called by scripts/check-site.ps1; can also run alone.
# NOTE: ASCII-only on purpose so PowerShell 5.1 can parse it without a BOM.

$ErrorActionPreference = "Stop"
if ([string]::IsNullOrWhiteSpace($Root)) { $Root = Split-Path -Parent $PSScriptRoot }
$dataDir = Join-Path $Root "_data"
if (-not (Test-Path $dataDir)) { throw "Not a site root: $Root" }

$fail = New-Object System.Collections.Generic.List[string]

function Read-Utf8Lines([string]$path) {
  return [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)
}

function Clean([string]$value) {
  return $value.Trim().Trim('"').Trim("'")
}

# ---- publications.yml: unique ids, tags, optional DOI ----
$pubIds = New-Object System.Collections.Generic.List[string]
$pubTags = @{}
$current = $null

foreach ($line in Read-Utf8Lines (Join-Path $dataDir "publications.yml")) {
  if ($line -match '^\s*#') { continue }

  if ($line -match '^- id:\s*(.+?)\s*$') {
    $current = Clean $Matches[1]
    if ($pubIds -contains $current) { $fail.Add("duplicate publication id: $current") }
    $pubIds.Add($current)
    $pubTags[$current] = @()
    continue
  }

  if ($null -ne $current -and $line -match '^\s+tags:\s*(.+?)\s*$') {
    $raw = Clean $Matches[1]
    $pubTags[$current] = @($raw -split '\s+' | Where-Object { $_ })
    continue
  }

  if ($null -ne $current -and $line -match '^\s+doi:\s*(.+?)\s*$') {
    $doi = Clean $Matches[1]
    if ($doi -and $doi -notmatch '^https?://' -and $doi -notmatch '^10\.[0-9]{4,9}/\S+$') {
      $fail.Add("bad DOI for $current : $doi")
    }
  }
}

# ---- research.yml: unique direction ids, paper_ids must exist ----
$dirIds = New-Object System.Collections.Generic.List[string]
$paperRefs = @{}
$currentDir = $null
$inPapers = $false

foreach ($line in Read-Utf8Lines (Join-Path $dataDir "research.yml")) {
  if ($line -match '^\s*#') { continue }

  if ($line -match '^- id:\s*(.+?)\s*$') {
    $currentDir = Clean $Matches[1]
    if ($dirIds -contains $currentDir) { $fail.Add("duplicate direction id: $currentDir") }
    $dirIds.Add($currentDir)
    $paperRefs[$currentDir] = New-Object System.Collections.Generic.List[string]
    $inPapers = $false
    continue
  }

  if ($null -ne $currentDir -and $line -match '^\s+paper_ids:\s*$') {
    $inPapers = $true
    continue
  }

  if ($inPapers -and $line -match '^\s+-\s*(\S+)\s*$') {
    $paperRefs[$currentDir].Add((Clean $Matches[1]))
    continue
  }

  if ($inPapers -and $line -match '^\s+\S') { $inPapers = $false }
}

foreach ($id in $pubIds) {
  foreach ($tag in @($pubTags[$id])) {
    if ($dirIds -notcontains $tag) { $fail.Add("publication $id has unknown tag: $tag") }
  }
}

foreach ($dir in $dirIds) {
  foreach ($paperId in $paperRefs[$dir]) {
    if ($pubIds -notcontains $paperId) { $fail.Add("direction $dir references missing paper: $paperId") }
  }
}

# ---- people.yml: photo paths (when present) must resolve ----
$peoplePath = Join-Path $dataDir "people.yml"
if (Test-Path $peoplePath) {
  foreach ($line in Read-Utf8Lines $peoplePath) {
    if ($line -match '^\s*#') { continue }
    if ($line -match '^\s*(?:-\s*)?photo:\s*(.+?)\s*$') {
      $photo = Clean $Matches[1]
      if (-not $photo -or $photo -match '^https?://') { continue }
      $rel = $photo.TrimStart('/')
      if (-not (Test-Path (Join-Path $Root $rel))) { $fail.Add("missing people photo: $photo") }
    }
  }
}

Write-Host ""
if ($fail.Count -eq 0) {
  Write-Host ("PASS: data ok ({0} papers, {1} directions)" -f $pubIds.Count, $dirIds.Count) -ForegroundColor Green
  exit 0
} else {
  $fail | ForEach-Object { Write-Host ("FAIL: " + $_) -ForegroundColor Red }
  exit 1
}
