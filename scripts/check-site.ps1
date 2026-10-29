[CmdletBinding()]
param(
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$site = Join-Path $root "_site"
$fail = New-Object System.Collections.Generic.List[string]

# 0) documentation/data lint runs first: it is fast and does not need Ruby
foreach ($check in @("check-docs.ps1", "check-data.ps1")) {
  $path = Join-Path $PSScriptRoot $check
  if (Test-Path $path) {
    & powershell -NoProfile -ExecutionPolicy Bypass -File $path
    if ($LASTEXITCODE -ne 0) { throw "$check failed (see FAIL lines above)." }
  }
}

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
foreach ($f in @("AGENTS.md", "CONTENT.md", "MAINTENANCE.md", "TOOLBOOK.md", "WORKLOG.md", "README.md")) {
  if (Test-Path (Join-Path $site $f)) { $fail.Add("leaked doc: /$f") }
}

# 2) pages are declared in _pages front matter: permalink + optional sitemap:false.
#    This is the single source of truth for the page whitelist, so adding a page
#    does not require editing this script.
$declared = New-Object System.Collections.Generic.List[object]
$pagesDir = Join-Path $root "_pages"
foreach ($f in @(Get-ChildItem $pagesDir -File | Where-Object { $_.Extension -in @(".html", ".md") })) {
  $text = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
  $fm = ""
  if ($text -match '(?s)^---\s*\r?\n(.*?)\r?\n---') { $fm = $Matches[1] }
  if ($fm -match '(?m)^published:\s*false\s*$') { continue }

  $url = $null
  if ($fm -match '(?m)^permalink:\s*(\S+)\s*$') { $url = $Matches[1].Trim('"').Trim("'") }
  if (-not $url) { $url = "/" + $f.BaseName + ".html" }
  $inSitemap = -not ($fm -match '(?m)^sitemap:\s*false\s*$')

  if ($url -eq "/") {
    $out = "index.html"
  } elseif ($url.EndsWith("/")) {
    $out = $url.TrimStart('/') + "index.html"
  } else {
    $out = $url.TrimStart('/')
  }

  $declared.Add([pscustomobject]@{ Source = $f.Name; Url = $url; Html = $out; Sitemap = $inSitemap })
}

if ($declared.Count -eq 0) { $fail.Add("no pages declared in _pages") }
$sitemapUrls = @($declared | Where-Object { $_.Sitemap } | ForEach-Object { $_.Url })
$expectedHtml = @($declared | ForEach-Object { $_.Html })

# 3) sitemap must match the declared pages exactly
$sitemap = Join-Path $site "sitemap.xml"
if (-not (Test-Path $sitemap)) {
  $fail.Add("sitemap.xml missing")
} else {
  [xml]$sm = Get-Content $sitemap -Raw
  $locs = @($sm.urlset.url | ForEach-Object { ([uri]$_.loc).AbsolutePath })
  foreach ($p in $locs) {
    if ($sitemapUrls -notcontains $p) { $fail.Add("unexpected sitemap url: $p") }
  }
  foreach ($p in $sitemapUrls) {
    if ($locs -notcontains $p) { $fail.Add("missing sitemap url: $p") }
  }
}

# 4) every declared page must exist
foreach ($p in $expectedHtml) {
  if (-not (Test-Path (Join-Path $site $p))) { $fail.Add("missing page: /$p") }
}

# 5) no stray HTML beyond the declared pages (catches leftover template pages)
$htmlFiles = @(Get-ChildItem $site -Recurse -Filter *.html)
foreach ($h in $htmlFiles) {
  $rel = $h.FullName.Substring($site.Length + 1).Replace("\", "/")
  if ($expectedHtml -notcontains $rel) { $fail.Add("stray html: $rel") }
}

# 6) no leftover template demo text
$bad = $htmlFiles | Select-String -Pattern "Paper Title Number|Blog Post number|academicpages\.github\.io" -ErrorAction SilentlyContinue
if ($bad) {
  $bad | ForEach-Object { $fail.Add("template text in $($_.Filename):$($_.LineNumber)") }
}

# 7) 404 must use the minimal theme
$notFound = Join-Path $site "404.html"
if (-not (Test-Path $notFound)) {
  $fail.Add("404.html missing")
} else {
  $text = Get-Content $notFound -Raw
  if ($text -notmatch "assets/minimal/style\.css") { $fail.Add("404.html is not using the minimal theme") }
}

# 8) docs must stay out of the build (exclude list)
$config = Get-Content (Join-Path $root "_config.yml") -Raw
foreach ($f in @("MAINTENANCE.md", "WORKLOG.md", "CONTENT.md", "TOOLBOOK.md", "AGENTS.md")) {
  if ($config -notmatch [regex]::Escape($f)) { $fail.Add("_config.yml exclude missing $f") }
}

Write-Host ""
if ($fail.Count -eq 0) {
  Write-Host ("PASS: {0} html, {1} sitemap urls, no leaks" -f $htmlFiles.Count, $sitemapUrls.Count) -ForegroundColor Green
  exit 0
} else {
  $fail | ForEach-Object { Write-Host ("FAIL: " + $_) -ForegroundColor Red }
  exit 1
}
