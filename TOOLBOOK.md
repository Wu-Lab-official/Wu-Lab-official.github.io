# 工具与踩坑手册

> 本文件记录**本机实际能用的命令**和**已经踩过的坑**，目的是少走弯路：动手前扫一眼症状表，别重复报错。
> 最后更新：2026-10-24（第二轮：修正“agent 无法 push”的过期结论、补 `check-docs.ps1`、统一 `Gemfile.lock` 口径）
> 相关：[MAINTENANCE.md](MAINTENANCE.md)（怎么改页面）· [CONTENT.md](CONTENT.md)（内容来源）· 工作区 `AGENTS.md`（agent 流程）

## 1. 环境：什么能用、怎么调

| 工具 | 位置 / 调用 | 说明 |
|---|---|---|
| Ruby + Bundler | `C:\Ruby33-x64\bin\bundle.bat`；bash 里 `export PATH="/c/Ruby33-x64/bin:$PATH"` | 一律 `bundle exec jekyll ...`；WindowsApps 里有个假 `jekyll` stub，直接敲会进商店 |
| Jekyll | 3.10.0，由 `github-pages` gem 锁定 | 与线上同版本；`serve` 默认 4000，被占用就 `--port 4001`；改 `_config.yml` 必须重启 |
| Git | `git`，默认分支 `main` | 提交规范 `<type>: 摘要`；中文信息用 `git commit -F <utf8文件>`，别用 `-m` |
| PowerShell | `powershell`（5.1，默认）/ `pwsh`（7） | 脚本必须 **UTF-8 with BOM**；5.1 下 `-File` 传 `a,b,c` 不会拆成数组，脚本要自己按逗号拆 |
| Python | `/d/miniconda3/python.exe`（3.13） | `python`/`python3` 是 WindowsApps stub，不可用；miniconda base **没有 PyYAML**，简单 YAML 手写解析 |
| curl | `curl` | 只有 `danger-full-access` 下能出网；沙箱内返回 `000` |
| 代理 | Clash Verge，`127.0.0.1:7897` | 直连 GitHub 可用时不必开；抓清华页面有时需要 |
| Crossref | `https://api.crossref.org/works/{DOI}` | 论文元数据唯一权威源；带 `mailto` 参数进礼貌池 |

## 2. 沙箱与权限（agent 会话）

| 现象 | 原因 | 处理 |
|---|---|---|
| `bundle: command not found` / `ls: cannot open directory '/c/Ruby33-x64/bin': Permission denied` | workspace-write 读不到工作区外的 Ruby | 该条命令申请一次性 `danger-full-access` |
| `curl` 返回 `000`、`Could not resolve host` | 沙箱禁网 | 同上；先确认直连可用再考虑代理 |
| `fatal: Unable to create '.git/index.lock': Permission denied` | git 写 `.git` 被拦 | 同上；只对 commit/rm/fetch 这类命令申请 |
| `cannot create standard input pipe for git-credential-helper-selector: Permission denied` | 沙箱拦 git 拉起凭据助手的子进程管道——**只有 HTTPS 推送会走它** | 改走 SSH Deploy Key（§2.5），agent 会话可直接 push；不要退回 HTTPS，也不要把 token 塞进 URL |
| `.ps1` 报“语句块或类型定义中缺少右 }” | 文件无 BOM，5.1 按 GBK 解析 | 重新保存为 UTF-8 with BOM（`head -c 3` 应为 `ef bb bf`）|

原则：**不绕过沙箱**（别用 pwsh 重试被 bash 拒绝的操作）；一次审批只对一条命令有效。

## 2.5 SSH 与推送（2026-10-24 起）

remote 已从 HTTPS 换成 SSH，凭据是仓库级 Deploy Key，**不再走 Git Credential Manager**，所以 agent 会话也能推。

| 项 | 值 |
|---|---|
| remote | `git@github.com:Wu-Lab-official/Wu-Lab-official.github.io.git` |
| 私钥 / 公钥 | `D:\wu-lab\.ssh\wu-lab-deploy` / `.pub`（ed25519，无口令）|
| 仓库级配置 | `core.sshCommand` 指定 **系统 OpenSSH**（`C:/Windows/System32/OpenSSH/ssh.exe`）+ 私钥 + `IdentitiesOnly` + 独立 `known_hosts` |
| GitHub 侧 | 仓库 Settings → Deploy keys → `wu-lab-agent`，勾 **Allow write access** |

```bash
# 认证测试（看到 Hi Wu-Lab-official/... 即成功）
/c/Windows/System32/OpenSSH/ssh.exe -i D:/wu-lab/.ssh/wu-lab-deploy -o IdentitiesOnly=yes -T git@github.com

# 22 端口被墙时（GitHub 官方 443 入口）
git config core.sshCommand "C:/Windows/System32/OpenSSH/ssh.exe -i D:/wu-lab/.ssh/wu-lab-deploy -o IdentitiesOnly=yes -o HostName=ssh.github.com -o Port=443 -o StrictHostKeyChecking=accept-new -o UserKnownHostsFile=D:/wu-lab/.ssh/known_hosts"
```

| 症状 | 原因 | 处理 |
|---|---|---|
| `Permission denied (publickey)` | key 没加到仓库 / 没勾 write / `-i` 路径错 | 重加 deploy key，勾 write access |
| `Connection timed out` | 22 端口被封 | 用上面的 443 配置 |
| `UNPROTECTED PRIVATE KEY FILE` / `Bad permissions` | 系统 OpenSSH 要求私钥仅本人可读 | `icacls "D:\wu-lab\.ssh\wu-lab-deploy" /inheritance:r /grant:r "$env:USERNAME:R"` |
| `Could not resolve hostname github.com`（间歇，但 `nslookup`/`curl` 正常）| Git Bash 的 MSYS ssh 解析偶发失败 | `core.sshCommand` 改用 `C:/Windows/System32/OpenSSH/ssh.exe`（已改）|
| `cannot pull with rebase: You have unstaged changes` | 工作区未提交，脚本 `-PushOnly` 拒绝操作 | 先提交或 `git stash`；`publish.ps1` 已加干净工作区检查 |
| 校验 URL 变成 `...github.ioC:/Users/...` | 从 Git Bash 调用时 MSYS 把以 `/` 开头的参数转成了 Windows 路径 | 从 PowerShell 调用，或加 `MSYS_NO_PATHCONV=1`；脚本会跳过非法路径并警告 |
| 推上去但 Pages 没变 | 构建中 / 推错分支 | 等 1–2 分钟；`git log origin/main -1` |

安全：key 只能写这一个仓库；私钥不进仓库、不外发；GitHub 上删除 deploy key 即失效。

## 2.6 GitHub Actions（构建校验）

仓库只有一个工作流：`.github/workflows/jekyll-build.yml`，`push`/`pull_request` 时在 Ubuntu + Ruby 3.2 上跑 `bundle exec jekyll build --strict_front_matter`。部署本身由 Pages 内置流程完成，CI 只负责“坏 front matter 别上线”。

```bash
# 本地复现 CI（与线上同一套 gem）
bundle exec jekyll build --strict_front_matter
# 看远端运行（公开仓库免登录）
curl -s "https://api.github.com/repos/Wu-Lab-official/Wu-Lab-official.github.io/actions/runs?per_page=5"
```

| 症状 | 原因 | 处理 |
|---|---|---|
| push 后没有新的 Actions 运行 | 工作流 `on:` 写错（曾用 `workflow_run` 挂在不存在的 workflow 上）| 确认 `on: push: branches: [main]` |
| CI 红叉、日志 `Could not find gem` | 仓库有意不提交 `Gemfile.lock`（`.gitignore` 已忽略），CI 每次浮动解析，网络抖动时会超时 | 重跑一次；本地 `bundle install` 能过即 Gemfile 没问题。若改成提交 lock，要同步改 `.gitignore` 与本条说明 |
| 日志 `Liquid syntax error` | `--strict_front_matter` 抓到了坏 YAML | 本地跑同命令复现，改 front matter |
| 权限报错 `Resource not accessible` | 工作流需要写权限 | 本工作流只需 `contents: read`，不要加多余权限 |

## 2.7 代理（Clash Verge）

| 项 | 值 |
|---|---|
| 程序 | `D:\Clash Verge\clash-verge.exe` |
| 混合端口 | `127.0.0.1:7897`（HTTP 与 SOCKS 同端口）|
| 检测（bash）| `(echo > /dev/tcp/127.0.0.1/7897) 2>/dev/null && echo open \|\| echo closed` |
| 检测（PowerShell）| `Test-NetConnection 127.0.0.1 -Port 7897 -InformationLevel Quiet` |

规则：

- 代理是**备用/加速**，不是硬依赖：GitHub 的 HTTPS 与 SSH 多数时候直连可用。
- 需要代理的典型场景：`curl` 返回 `000`/超时、DNS 解析失败、Crossref 或 SIGS 页面很慢。
- 用代理：`curl -x http://127.0.0.1:7897 <url>`、`git -c http.proxy=http://127.0.0.1:7897 <cmd>`。
- **SSH 不走 HTTP 代理**：`git push` 走 SSH 时与 Clash 无关，推不动先按 §2.5 排查。
- **用户经常忘记开 Clash**：agent 在联网任务前主动检测端口，`closed` 就先提醒，不要反复重试。

| 症状 | 原因 | 处理 |
|---|---|---|
| `curl` 返回 `000` / 超时 | 直连被墙且代理没开 | 提醒用户启动 Clash，或命令里加 `-x` |
| `Could not resolve host` | DNS 抖动；或设了 proxy 环境变量但端口没监听 | 先测 7897 端口，再 `nslookup` |
| 代理开着但 git 仍失败 | 用了 SSH remote，代理参数对它无效 | 按 §2.5 查 SSH，不要再加 `-c http.proxy` |
| 浏览器能开、命令行不能 | 浏览器走系统代理，CLI 需要显式 `-x` 或 `http.proxy` | 给命令加代理参数 |

## 3. 症状 → 原因 → 处理

| 症状 | 原因 | 处理 |
|---|---|---|
| 改了页面但线上没变 | 没 push / push 到别的分支 / Pages 还在构建 | `git status -sb` 看 ahead；等 1–2 分钟；看仓库 Actions |
| 页面 404 | 文件名、front matter `permalink`、被 exclude | 对照 `_site` 是否有对应文件 |
| 删掉的页面本地还能访问 | Jekyll 3.10 不清理 `_site` | `bundle exec jekyll clean` 或 `check-site.ps1`（构建前删 `_site`）|
| 新增 `.md` 莫名上了线 | 无 front matter 的 md 被当静态文件复制 | 加进 `_config.yml` exclude；跑 `check-site.ps1` |
| 内部文件上了线（如 `scripts/*.ps1`、`docker-compose.yaml`）| 非下划线开头的静态文件都会被复制 | exclude 目录/文件；`check-site.ps1` 只查 html，需人工看 `_site` 顶层 |
| 中文提交信息变乱码 | 5.1 把 `-m` 参数按 ANSI 传给 git | `git commit -F` + UTF-8 文件 |
| 控制台中文乱码 | 控制台代码页 GBK，程序输出 UTF-8 | 把结果写进 UTF-8 文件再读，别直接 print |
| 抓清华 SIGS 页面乱码 | 页面本身是 UTF-8，控制台按 GBK 显示 | `curl -o` 存文件 → Python `encoding='utf-8'` 读 → 写 UTF-8 文件 |
| `-Paths "a,b,c"` 被当成一个路径 | PowerShell `-File` 不解析数组 | 脚本内按逗号拆分（`publish.ps1` 已处理）|
| 论文年份/卷页对不上 | `信息.txt` 是手写清单，有笔误 | 以 Crossref 为准，差异记 `CONTENT.md` §3 |
| 改完文档不确定有没有写坏（编号/表格/引用）| 多处手改容易错位，肉眼很难全查 | 跑 `powershell -File scripts\\check-docs.ps1`：标题编号、§ 引用、表格列数、最后更新、相对链接 |
| `Could not read from remote repository` / `Host key verification failed` | 代理/网络/首次连 SSH | 先直连试；不要改 remote 地址 |

## 4. 常用命令速查

```bash
# 构建（最常用，报错信息完整）
export PATH="/c/Ruby33-x64/bin:$PATH"
cd /d/wu-lab/John-z39.github.io
bundle exec jekyll build --strict_front_matter

# 本地预览（改 _config.yml 后必须重启）
bundle exec jekyll serve --port 4001

# 完整性检查：清 _site + 构建 + 7 项站点断言 + 文档断言（check-docs.ps1）
powershell -ExecutionPolicy Bypass -File scripts\check-site.ps1

# 发布（agent 会话也能直接 push；SSH 配置见 §2.5）
powershell -ExecutionPolicy Bypass -File scripts\publish.ps1 -Message "content: 说明" -Paths 路径1,路径2
powershell -ExecutionPolicy Bypass -File scripts\publish.ps1 -PushOnly -SkipVerify   # 只补推

# 只查文档：标题编号 / § 引用 / 表格列数 / 最后更新 / 相对链接
powershell -ExecutionPolicy Bypass -File scripts\\check-docs.ps1

# 查论文元数据
curl -s "https://api.crossref.org/works/10.1021/jacs.5c10021" | head -c 500
```

## 5. 排查顺序

1. **构建报错** → 看完整栈，先修 Ruby/Liquid 语法，再谈页面
2. **页面不对** → 查 `_site/<页面>/index.html` 是否生成、内容是否为空
3. **线上不对** → `git log origin/main -1`、Actions 状态、Pages 构建时间
4. **权限报错** → 判断是沙箱（换 full access）还是文件本身（BOM/路径/编码）
5. **数据不对** → 先查 `CONTENT.md` 来源，再查 `_data/*.yml` 是否唯一数据源

## 6. 本机事实

- 仓库：`D:\wu-lab\John-z39.github.io`；工作区：`D:\wu-lab`
- 线上：https://wu-lab-official.github.io（组织 Pages，Deploy from branch: main / root）
- Ruby 3.3.12，gems 在 `C:\Ruby33-x64\lib\ruby\gems\3.3.0`
- 不要提交：`_site/`、`.sass-cache/`；`Gemfile.lock` 被 `.gitignore` 有意忽略（后果见 §2.6）
