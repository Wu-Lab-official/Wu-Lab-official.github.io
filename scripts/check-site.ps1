[CmdletBinding()]
param(
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$site = Join-Path $root "_site"
$fail = New-Object System.Collections.Generic.List[string]

if (-not $SkipBuild) {
  $rubyBin = "C:\Ruby33-x64\bin"
  $bundle = Join-Path $rubyBin "bundle.bat"
  if (-not (Test-Path $bundle)) { throw "Bundler not found: $bundle" }
  $env:PATH = "$rubyBin;$env:PATH"

  if (Test-Path $site) {
    try {
      Remove-Item $site -Recurse -Force
    } catch {
      throw "Cannot clear _site (is jekyll serve running?). Stop it and retry."
    }
  }

  Write-Host "== build ==" -ForegroundColor Cyan
  & $bundle exec jekyll build --strict_front_matter
  if ($LASTEXITCODE -ne 0) { throw "Jekyll build failed." }
}

# 1) internal docs must never be published
foreach ($f in @("AGENTS.md", "CONTENT.md", "MAINTENANCE.md", "WORKLOG.md", "README.md")) {
  if (Test-Path (Join-Path $site $f)) { $fail.Add("leaked doc: /$f") }
}

# 2) sitemap must contain exactly the five public pages
$allowed = @("/", "/research/", "/publications/", "/people/", "/join/")
$sitemap = Join-Path $site "sitemap.xml"
if (-not (Test-Path $sitemap)) {
  $fail.Add("sitemap.xml missing")
} else {
  [xml]$sm = Get-Content $sitemap -Raw
  $locs = @($sm.urlset.url | ForEach-Object { ([uri]$_.loc).AbsolutePath })
  foreach ($p in $locs) {
    if ($allowed -notcontains $p) { $fail.Add("unexpected sitemap url: $p") }
  }
  foreach ($p in $allowed) {
    if ($locs -notcontains $p) { $fail.Add("missing sitemap url: $p") }
  }
}

# 3) every public page must exist
foreach ($p in $allowed) {
  $rel = if ($p -eq "/") { "index.html" } else { $p.Trim("/") + "/index.html" }
  if (-not (Test-Path (Join-Path $site $rel))) { $fail.Add("missing page: /$rel") }
}

# 4) no stray HTML beyond the whitelist (catches leftover template pages)
$expected = @("index.html", "404.html", "research/index.html", "publications/index.html", "people/index.html", "join/index.html")
$htmlFiles = @(Get-ChildItem $site -Recurse -Filter *.html)
foreach ($h in $htmlFiles) {
  $rel = $h.FullName.Substring($site.Length + 1).Replace("\", "/")
  if ($expected -notcontains $rel) { $fail.Add("stray html: $rel") }
}

# 5) no leftover template demo text
$bad = $htmlFiles | Select-String -Pattern "Paper Title Number|Blog Post number|academicpages\.github\.io" -ErrorAction SilentlyContinue
if ($bad) {
  $bad | ForEach-Object { $fail.Add("template text in $($_.Filename):$($_.LineNumber)") }
}

# 6) 404 must use the minimal theme
$notFound = Join-Path $site "404.html"
if (-not (Test-Path $notFound)) {
  $fail.Add("404.html missing")
} else {
  $text = Get-Content $notFound -Raw
  if ($text -notmatch "assets/minimal/style\.css") { $fail.Add("404.html is not using the minimal theme") }
}

# 7) docs must stay out of the build (exclude list)
$config = Get-Content (Join-Path $root "_config.yml") -Raw
foreach ($f in @("MAINTENANCE.md", "WORKLOG.md", "CONTENT.md", "AGENTS.md")) {
  if ($config -notmatch [regex]::Escape($f)) { $fail.Add("_config.yml exclude missing $f") }
}

Write-Host ""
if ($fail.Count -eq 0) {
  Write-Host ("PASS: {0} html, {1} sitemap urls, no leaks" -f $htmlFiles.Count, $allowed.Count) -ForegroundColor Green
  exit 0
} else {
  $fail | ForEach-Object { Write-Host ("FAIL: " + $_) -ForegroundColor Red }
  exit 1
}
