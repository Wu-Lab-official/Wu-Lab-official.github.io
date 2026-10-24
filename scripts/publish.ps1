[CmdletBinding()]
param(
  [string]$Message,

  # 只提交这些路径（推荐）。不给则 git add -A，并逐条打印将要提交的文件。
  [string[]]$Paths,

  [switch]$NoPush,

  # 只推送已有的本地提交：跳过构建与提交，用于“上次 push 失败”的补推。
  [switch]$PushOnly,

  # 跳过 push 后的线上校验。
  [switch]$SkipVerify,

  # 校验哪些路径（相对站点根）。默认只校验首页。
  [string[]]$VerifyPaths = @("/"),

  [int]$VerifyWaitSeconds = 75
)

$ErrorActionPreference = "Stop"

# 非交互环境下不要在用户名/密码提示上挂死：凭据缺失就立刻失败并给提示
$env:GIT_TERMINAL_PROMPT = "0"
$env:GCM_INTERACTIVE = "never"

$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo

function Fail([string]$text) { throw $text }

# ---------- 0. 分支守卫 ----------
$branch = (& git rev-parse --abbrev-ref HEAD).Trim()
if ($branch -ne "main") {
  Fail "当前分支是 '$branch'，本脚本只发布 main。先 git switch main，再重跑。"
}

if (-not $PushOnly -and [string]::IsNullOrWhiteSpace($Message)) {
  Fail "缺少 -Message（格式 '<type>: 摘要'，type ∈ content/feat/fix/docs/chore）。只想补推已有提交请用 -PushOnly。"
}

# powershell -File 传参不会把 "a,b,c" 解析成数组，这里统一按逗号拆开
function Split-List([string[]]$items) {
  @($items | ForEach-Object { $_ -split ',' } | ForEach-Object { $_.Trim() } | Where-Object { $_ })
}
$Paths = Split-List $Paths
$VerifyPaths = Split-List $VerifyPaths

# ---------- 1. 代理探测（直连可用就不强制代理）----------
$proxyOpen = $false
$client = New-Object System.Net.Sockets.TcpClient
try {
  $client.Connect("127.0.0.1", 7897)
  $proxyOpen = $true
} catch {
  $proxyOpen = $false
} finally {
  $client.Close()
}

function Invoke-NetGit {
  param([string[]]$GitArgs)
  if ($proxyOpen) {
    & git -c http.proxy=http://127.0.0.1:7897 -c http.sslBackend=openssl @GitArgs
  } else {
    & git @GitArgs
  }
}

# ---------- 2. 构建 + 提交 ----------
if (-not $PushOnly) {
  $rubyBin = "C:\Ruby33-x64\bin"
  $bundle = Join-Path $rubyBin "bundle.bat"
  if (-not (Test-Path $bundle)) {
    Fail "Bundler not found: $bundle. Check Ruby 3.3 at C:\Ruby33-x64."
  }
  $env:PATH = "$rubyBin;$env:PATH"

  Write-Host "== 1/3 build check ==" -ForegroundColor Cyan
  & $bundle exec jekyll build --strict_front_matter
  if ($LASTEXITCODE -ne 0) {
    Fail "Jekyll build failed; nothing was committed."
  }

  $changes = @(& git status --porcelain)
  if ($changes.Count -eq 0) {
    Write-Host "工作区没有改动。" -ForegroundColor Yellow
    if ($NoPush) { return }
    Write-Host "如果只是补推已有提交，请重跑 -PushOnly；否则没有可推送的内容。" -ForegroundColor Yellow
    return
  }

  Write-Host "== 2/3 commit ==" -ForegroundColor Cyan
  if ($Paths) {
    & git add -- $Paths
  } else {
    $changes | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }
    Write-Warning "未指定 -Paths，将提交上面全部改动。若列表里混入了临时文件，先停掉并用 -Paths 限定。"
    & git add -A
  }

  $staged = @(& git diff --cached --name-only)
  if ($staged.Count -eq 0) {
    Fail "没有暂存到任何文件，停止（检查 -Paths 是否写错）。"
  }
  if (-not ($staged -match 'WORKLOG\.md')) {
    Write-Warning "WORKLOG.md 未改动：规范要求每轮留痕，建议补一条再提交。"
  }

  # 用 -F 而不是 -m：Windows PowerShell 5.1 会把中文参数按 ANSI 传给 git，导致提交信息乱码
  $msgFile = Join-Path $env:TEMP ("wulab-commit-{0}.txt" -f [guid]::NewGuid())
  [System.IO.File]::WriteAllText($msgFile, $Message, (New-Object System.Text.UTF8Encoding($false)))
  try {
    & git commit -F $msgFile
    $commitExit = $LASTEXITCODE
  } finally {
    Remove-Item $msgFile -ErrorAction SilentlyContinue
  }
  if ($commitExit -ne 0) {
    Fail "git commit failed; stopped."
  }
}

if ($NoPush) {
  Write-Host "已提交本地；按 -NoPush 跳过推送。" -ForegroundColor Yellow
  return
}

# ---------- 3. 同步 + 推送 ----------
Write-Host "== 3/3 push ==" -ForegroundColor Cyan

if ($PushOnly) {
  $dirty = & git status --porcelain
  if ($dirty) {
    Fail "-PushOnly 需要干净的工作区（当前有未提交改动）。先提交，或 git stash 后再补推。"
  }
}

$synced = $false
for ($i = 1; $i -le 3; $i++) {
  Invoke-NetGit @("pull", "--rebase", "origin", "main")
  if ($LASTEXITCODE -eq 0) { $synced = $true; break }
  Write-Host ("  pull 第 {0} 次失败，4 秒后重试…" -f $i) -ForegroundColor Yellow
  Start-Sleep -Seconds 4
}
if (-not $synced) {
  Fail "git pull --rebase 连续 3 次失败。先看上面的 git 输出：有冲突或未提交改动就先处理；纯网络错误再重跑 -PushOnly。"
}

Invoke-NetGit @("push", "origin", "main")
if ($LASTEXITCODE -ne 0) {
  # 本机 DNS 偶发解析失败（Could not resolve hostname github.com），重试即可；最多 3 次
  $pushed = $false
  for ($i = 1; $i -le 2; $i++) {
    Write-Host ("  push 第 {0} 次失败，4 秒后重试…" -f ($i + 1)) -ForegroundColor Yellow
    Start-Sleep -Seconds 4
    Invoke-NetGit @("push", "origin", "main")
    if ($LASTEXITCODE -eq 0) { $pushed = $true; break }
  }
  if (-not $pushed) {
  Fail @"
git push 失败（已重试 3 次）。本地提交仍在，修复后重跑本脚本 -PushOnly 即可补推。
- Permission denied (publickey)：deploy key 被删/未勾 write access/core.sshCommand 路径错。
  见 MAINTENANCE.md §0.6；自测：ssh -i D:/wu-lab/.ssh/wu-lab-deploy -T git@github.com
- Connection timed out / Could not resolve host：22 端口不通。给 core.sshCommand 加
  -o HostName=ssh.github.com -o Port=443（GitHub 官方 443 入口）。
- could not read Username：remote 还是 https，改回 git@github.com:Wu-Lab-official/Wu-Lab-official.github.io.git
"@
  }
}

# ---------- 4. 线上校验 ----------
if ($SkipVerify) {
  Write-Host "已跳过线上校验（-SkipVerify）。" -ForegroundColor Yellow
} else {
  Write-Host "等待 GitHub Pages 构建（$VerifyWaitSeconds 秒）..." -ForegroundColor Cyan
  Start-Sleep -Seconds $VerifyWaitSeconds
  $failed = @()
  foreach ($path in $VerifyPaths) {
    $url = "https://wu-lab-official.github.io$path"
    try {
      $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 30
      Write-Host ("  {0} {1}" -f $resp.StatusCode, $url) -ForegroundColor Green
      if ($resp.StatusCode -ne 200) { $failed += $url }
    } catch {
      Write-Host ("  ERR  {0}  {1}" -f $url, $_.Exception.Message) -ForegroundColor Red
      $failed += $url
    }
  }
  if ($failed.Count -gt 0) {
    Write-Warning "以下地址未通过校验（Pages 可能还在构建，稍后重试或到 Actions 查看）：$($failed -join ', ')"
  }
}

Write-Host "Done. https://wu-lab-official.github.io/" -ForegroundColor Green
