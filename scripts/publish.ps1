[CmdletBinding()]
param(
  [Parameter(Mandatory = $true, HelpMessage = "Commit message, e.g. content: update members")]
  [string]$Message,

  [switch]$NoPush
)

$ErrorActionPreference = "Stop"

$rubyBin = "C:\Ruby33-x64\bin"
$bundle = Join-Path $rubyBin "bundle.bat"
if (-not (Test-Path $bundle)) {
  throw "Bundler not found: $bundle. Check Ruby 3.3 at C:\Ruby33-x64."
}

$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo
$env:PATH = "$rubyBin;$env:PATH"

Write-Host "== 1/3 build check ==" -ForegroundColor Cyan
& $bundle exec jekyll build --strict_front_matter
if ($LASTEXITCODE -ne 0) {
  throw "Jekyll build failed; nothing was committed."
}

$changes = git status --porcelain
if (-not $changes) {
  Write-Host "No changes to commit." -ForegroundColor Yellow
  return
}

Write-Host "== 2/3 commit ==" -ForegroundColor Cyan
$changes | ForEach-Object { Write-Host "  $_" }
git add -A
git commit -m $Message
if ($LASTEXITCODE -ne 0) {
  throw "git commit failed; stopped."
}

if ($NoPush) {
  Write-Host "Committed locally; push skipped (-NoPush)." -ForegroundColor Yellow
  return
}

$proxyOk = $false
$client = New-Object System.Net.Sockets.TcpClient
try {
  $client.Connect("127.0.0.1", 7897)
  $proxyOk = $true
} catch {
  $proxyOk = $false
} finally {
  $client.Close()
}

if (-not $proxyOk) {
  throw "Proxy 127.0.0.1:7897 is not open. Start D:\Clash Verge\clash-verge.exe and rerun."
}

Write-Host "== 3/3 push ==" -ForegroundColor Cyan
git -c http.proxy=http://127.0.0.1:7897 -c http.sslBackend=openssl push origin main
if ($LASTEXITCODE -ne 0) {
  throw "git push failed. The commit remains local; fix network/proxy and push again."
}

Write-Host "Done. GitHub Pages rebuilds in 1-2 minutes: https://wu-lab-official.github.io/" -ForegroundColor Green
