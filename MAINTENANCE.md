# Wu-Lab 课题组网站维护手册

> 基于 [AcademicPages](https://academicpages.github.io) 模板（Jekyll 静态站点）+ GitHub Pages 托管
> 参考教程：[Building an Academic Website — Rob Williams](https://jayrobwilliams.com/posts/2020/06/academic-website/)
> 本文档最后更新：2026-10-24（第二轮：统一“旧模板已删除”口径、修正小节编号与交叉引用、补 §0.5 位置与 `check-docs.ps1`）
>
> 相关文档：[CONTENT.md](CONTENT.md)（来源登记 / 论文核对 / 待补 / 隐私边界）· [TOOLBOOK.md](TOOLBOOK.md)（工具与踩坑）· [WORKLOG.md](WORKLOG.md)（改动记录）· 工作区 `AGENTS.md`（agent 规范）

## 目录

| 节 | 内容 |
|---|---|
| §0 | 基本信息、视觉层、填内容规则、发布脚本、文档方针、SSH、代理 |
| §1 | 快速命令速查（构建 / 检查 / 推送 / 线上验证）|
| §2 | 本机环境清单（换机重装）|
| §3 | 目录结构：改哪个文件（含易踩的坑）|
| §4 | 标准工作流程（SOP 六步）|
| §5 | 已知冲突与坑（高频问题表）|
| §6 | 故障排查 |
| §7 | 参考链接 |
| §8 | 仓库与组织设置（管理员清单）|

---

## 0. 基本信息

| 项目 | 值 |
|---|---|
| 线上地址 | https://wu-lab-official.github.io |
| 仓库 | `Wu-Lab-official/Wu-Lab-official.github.io`（本地：`D:\wu-lab\John-z39.github.io`）|
| 默认分支 | `main`（2026-09-29 由 master 改名，旧 master 已删除）|
| 模板 | 旧模板 academicpages.github.io v0.9.x **已于 2026-10-24 删除**（取回方式见 §3.2）；当前渲染层是自建极简主题（见 §0.1），不走 Minimal Mistakes |
| Jekyll | 3.10.0（由 `github-pages` gem 锁定，与 GitHub Pages 线上一致）|
| 部署方式 | push 到 main → GitHub Pages 自动构建（无需本地构建上传）|

### 0.1 当前视觉层：极简主题（2026-10-24，方案 B）

站点仍是 Jekyll，但新页面不再使用 AcademicPages 的 sidebar / single 布局，改用一套独立的极简布局：

| 文件 | 作用 |
|---|---|
| `_layouts/minimal.html` | 全站骨架：head、导航、页脚、脚本 |
| `_includes/minimal/head.html` | title / description / canonical / CSS |
| `_includes/minimal/header.html` | 品牌、中文导航、移动菜单 |
| `_includes/minimal/footer.html` | 版权、邮箱、导师主页 |
| `_pages/home.html` | 首页 `/` |
| `_pages/research.html` | 研究方向 `/research/` |
| `_pages/publications.html` | 论文 `/publications/` |
| `_pages/people.html` | 团队 `/people/` |
| `_pages/join.html` | 加入我们 `/join/` |
| `_pages/404.md` | 自定义 404 页 `/404.html`（极简布局）|
| `_data/research.yml` | 5 个研究方向、问题、正文；`paper_ids` 引用论文 id |
| `_data/publications.yml` | 代表性论文（**唯一数据源**：id/年份/作者/标题/期刊/卷页/tags/featured）|
| `_data/news.yml` | 首页动态 |
| `_data/navigation.yml` | 顶部导航（研究/论文/团队/加入我们）|
| `assets/minimal/style.css` | 极简主题样式 |
| `assets/minimal/app.js` | 移动菜单、论文筛选/搜索、复制引用 |
| `assets/minimal/profile.jpg` | 团队页照片（原始 2:3，不裁切）|
| `assets/minimal/favicon.svg` | 站点图标 |

旧 AcademicPages 渲染层（`_layouts/default|single|archive|splash|talk`、全部旧 `_includes`、`_sass/`、`assets/css|js|webfonts|fonts`、`images/profile.png`、`_pages/about.md`、`_data/ui-text.yml|cv.json|authors.yml`）已于 2026-10-24 全部删除，**仓库里没有回退副本**。需要取回某个文件时从 git 历史取，不要凭记忆重建：

```bash
git show 9744940^:_layouts/default.html        # 9744940 = 删除旧渲染层的提交，^ 表示它的父提交
git show 9744940^:assets/css/main.scss         # 旧样式是 scss，不是编译后的 main.css
```

这些旧文件互相依赖（`default.html` 依赖 `compress` 布局与 `_sass`，样式依赖 `minimal-mistakes` 的 sass 变量），单独取回一般不能直接跑；真要回退，取回后必须重新 `bundle exec jekyll build --strict_front_matter` 验证。

仓库内模板自带的 `AGENTS.md` 已于 2026-10-24 删除：它的内容是模板作者写给 coding agent 的说明，与本组规范无关；2026-10-24 之前它没被 exclude，线上曾可访问 `/AGENTS.md`。`_config.yml` 的 exclude 仍保留 `AGENTS.md` 条目，防止以后误放同名文件。

GitHub Pages 设置：**Deploy from a branch → main → /(root)**。不要选 “GitHub Actions”，当前 workflow 只做构建检查，不负责 deploy。

### 0.2 项目性质与现状

- 这是课题组网站的**内部建设阶段**，还没有购买/绑定正式域名；线上地址是 GitHub Pages 组织站 `https://wu-lab-official.github.io/`，不是最终发布形态。
- 旧个人站 `john-z39.github.io` 只作备份，不再作为本项目维护对象。
- 当前状态：极简主题 5 个页面 + 404；模板示例内容已全部清理（sitemap 从 44 条降到 5 条）；15 条代表性论文已逐条用 Crossref 核对并修正；导师信息、研究方向、论文是真实内容；成员、照片、DOI/PDF、招生细节仍缺。
- 现有内容来源：`信息.txt`（PI 提供，在工作区根目录、不在仓库内）、清华 SIGS 官方导师主页、论文正式记录（Crossref）。**来源与核对日期登记在 `CONTENT.md`**，改内容前先查它。
- 缺失内容统一写“待补充”或直接留空，**不要用示例、推测、行业惯例填充**。

### 0.3 填内容的规则

1. **只写有来源的事实**。写之前先确认来源；没有来源就不写。
2. **不写未确认的招生信息**：名额、人数、申请流程、回复时间、待遇、奖学金、联合培养、访问政策、实验平台、合作资源、产业/临床资源，都不自行补。
3. **缺内容就空着**。页面上写“待补充”比写一段看似合理但没有依据的话好。
4. **论文信息以正式记录为准**：标题、年份、卷期、页码以 Crossref / 期刊页面为准，`信息.txt` 只当线索（已发现多处笔误，见 `CONTENT.md` §3）。DOI/PDF 没核对就不放链接，绝不编造。
5. **文案平实**。不写口号、比喻、宏大叙事；不用“编队”“主线”“微观世界”这类表达。
6. **每次改动留痕**。在 `WORKLOG.md` 记日期、改了什么、来源、验证结果、还缺什么；事实类改动同时更新 `CONTENT.md` 的核对日期。

### 0.4 一键发布脚本

日常改内容可以用脚本，避免每次手动 build / add / commit / push：

```powershell
# 在仓库根目录运行
powershell -ExecutionPolicy Bypass -File scripts\publish.ps1 -Message "content: 更新成员名单"
```

脚本流程：**分支守卫 → 构建检查 → 暂存 → 提交 → `git pull --rebase` → push → 等 75 秒校验线上首页**。

| 参数 | 用途 |
|---|---|
| `-Message "content: ..."` | 提交信息，格式 `<type>: 摘要` |
| `-Paths a.md,b.yml` | 只暂存这些路径（推荐；不给则 `git add -A` 并逐条打印）|
| `-NoPush` | 只提交不推送 |
| `-PushOnly` | **跳过构建和提交，只补推已有本地提交**（上次 push 失败就用这个）|
| `-SkipVerify` | 跳过 push 后的线上校验 |
| `-VerifyPaths /people/,/404.html` | 指定校验路径，默认只校验 `/` |
| `-VerifyWaitSeconds 90` | 等 Pages 构建的时间，默认 75 秒 |

几个行为细节：
- 当前分支不是 `main` 直接报错退出（旧版会提交后去推 `origin main`，给出“成功”的假象）。
- **推送走 SSH（2026-10-24 起）**：remote 是 `git@github.com:...`，本仓库的 `core.sshCommand` 指向 `D:\wu-lab\.ssh\wu-lab-deploy`（GitHub 上的 Deploy Key，只对本仓库可写）。因此 **agent 会话也能直接 push**，不再依赖 Git Credential Manager。换机或删 key 后需要重配，步骤见 §0.6。
- 代理自动探测：7897 开着就带 `-c http.proxy`，没开就直连；SSH remote 下这两个参数不起作用，但留着无害。
- push 前自动 `pull --rebase`，远端有新提交时不用手工处理。
- 脚本设置 `GIT_TERMINAL_PROMPT=0` / `GCM_INTERACTIVE=never`：凭据缺失会立刻报错而不是卡在用户名提示。现在走 SSH，这两个变量只是防止误用 HTTPS 时挂死。
- 提交里如果没有 `WORKLOG.md`，会给黄色警告（规范要求每轮留痕），但不阻断。
- push 失败时本地提交保留，按提示修网络/凭据后重跑 `-PushOnly` 即可补推。
- **脚本是 UTF-8 with BOM**：Windows PowerShell 5.1 读无 BOM 的 UTF-8 会把中文按 GBK 解释，直接语法报错。编辑这个文件时别把 BOM 弄丢（`head -c 3` 应看到 `ef bb bf`）。

```powershell
# 只提交不推送
powershell -ExecutionPolicy Bypass -File scripts\publish.ps1 -Message "content: 本地预览" -NoPush
# 上次 push 失败，补推
powershell -ExecutionPolicy Bypass -File scripts\publish.ps1 -PushOnly
```

要求：Ruby 在 `C:\Ruby33-x64\bin`。

### 0.5 文档维护方针（自动维护，不需要提醒）

五份文档分工固定：

| 文档 | 回答什么 | 什么时候改 |
|---|---|---|
| `WORKLOG.md` | 做过什么 | 每轮都追加，只加不改旧条目 |
| `CONTENT.md` | 事实从哪来、核对到哪天、哪些不能公开 | 增删改事实/论文时 |
| `MAINTENANCE.md`（本文件）| 怎么改、在哪改、怎么发 | 目录结构、流程、脚本参数变化时 |
| `TOOLBOOK.md` | 用什么命令、踩过什么坑 | 遇到新报错/新环境差异时 |
| 工作区 `AGENTS.md` | agent 规范与边界 | 仅经用户同意后改 |

每轮收尾自查（缺一项算没做完）：

1. `WORKLOG.md` 有本轮条目（日期、改动、验证结果、遗留）？
2. 改过事实/论文 → `CONTENT.md` 的表格与核对日期同步？
3. 改了目录/流程/脚本参数 → 本文件 §3 对照表、§4 命令同步？
4. 踩了新坑 → `TOOLBOOK.md` 的“症状→原因→处理”加行？
5. 跑过 `scripts/check-site.ps1`（内含 `check-docs.ps1`，断言编号/§ 引用/表格/日期）？

原则：文档与改动同一个提交；页面数、sitemap 数等数字以 `scripts/check-site.ps1` 输出为准；不写“以后再补”，缺什么写进 `CONTENT.md` §4；每份文档头部保留“最后更新”。

### 0.6 SSH Deploy Key（推送凭据，换机必看）

为什么用 Deploy Key：GitHub 的 HTTPS 推送依赖 Git Credential Manager 的子进程管道，agent 沙箱会拦（`cannot create standard input pipe for git-credential-helper-selector`）。SSH 用密钥文件，不需要这个管道，因此 agent 也能推。

当前配置（本机）：

| 项 | 值 |
|---|---|
| remote | `git@github.com:Wu-Lab-official/Wu-Lab-official.github.io.git` |
| 私钥 | `D:\wu-lab\.ssh\wu-lab-deploy`（ed25519，无口令）|
| 公钥 | `D:\wu-lab\.ssh\wu-lab-deploy.pub` |
| 仓库级配置 | `git config core.sshCommand "C:/Windows/System32/OpenSSH/ssh.exe -i D:/wu-lab/.ssh/wu-lab-deploy -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new -o UserKnownHostsFile=D:/wu-lab/.ssh/known_hosts"` |
| GitHub 侧 | 仓库 Settings → Deploy keys → `wu-lab-agent`，已勾 **Allow write access** |

为什么指定 Windows 自带 `ssh.exe`：Git Bash 的 MSYS ssh 在本机会间歇性报 `Could not resolve hostname github.com`（同一时刻 `nslookup` 与 `curl` 都正常），换用系统 OpenSSH 后稳定。系统 ssh 对私钥权限要求严格，首次使用需 `icacls` 收紧：

```powershell
icacls "D:\wu-lab\.ssh\wu-lab-deploy" /inheritance:r /grant:r "$env:USERNAME:R"
```

换机/重装后重配：

```bash
ssh-keygen -t ed25519 -C "wu-lab-deploy" -f /d/wu-lab/.ssh/wu-lab-deploy -N ""
cat /d/wu-lab/.ssh/wu-lab-deploy.pub      # 贴到仓库 Settings → Deploy keys，勾 Allow write access
cd /d/wu-lab/John-z39.github.io
git remote set-url origin git@github.com:Wu-Lab-official/Wu-Lab-official.github.io.git
git config core.sshCommand "C:/Windows/System32/OpenSSH/ssh.exe -i D:/wu-lab/.ssh/wu-lab-deploy -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new -o UserKnownHostsFile=D:/wu-lab/.ssh/known_hosts"
icacls "D:\wu-lab\.ssh\wu-lab-deploy" /inheritance:r /grant:r "$env:USERNAME:R"
C:/Windows/System32/OpenSSH/ssh.exe -i D:/wu-lab/.ssh/wu-lab-deploy -o IdentitiesOnly=yes -T git@github.com   # 看到 Hi Wu-Lab-official/... 即成功
```

安全边界：这把 key 只能写这一个仓库，不能改设置、不能访问其他仓库；私钥不进仓库、不发给别人。删掉 GitHub 上的 deploy key 即失效。

故障：22 端口被墙时，把 `core.sshCommand` 里的 `-o HostName=ssh.github.com -o Port=443` 加上（GitHub 官方 443 入口）。回滚到 HTTPS：`git remote set-url origin https://github.com/Wu-Lab-official/Wu-Lab-official.github.io.git` 并 `git config --unset core.sshCommand`。

### 0.7 代理（Clash）与联网检查

**用户经常忘记开 Clash**，所以每轮涉及联网前先查端口，`closed` 就先提醒他启动，不要反复重试。

```bash
(echo > /dev/tcp/127.0.0.1/7897) 2>/dev/null && echo open || echo closed
# PowerShell: Test-NetConnection 127.0.0.1 -Port 7897 -InformationLevel Quiet
```

| 情况 | 怎么做 |
|---|---|
| 端口 `closed`，且本轮要抓网页 / 调 Crossref / 走 HTTPS | 提醒用户启动 `D:\Clash Verge\clash-verge.exe`；明确告知会卡在哪一步 |
| 端口 `open` | 正常干活；HTTPS 命令加 `-x http://127.0.0.1:7897` 或 `git -c http.proxy=...` |
| `git push`（SSH remote）失败 | **与 Clash 无关**；按 §0.6 查 deploy key / `core.sshCommand` |
| `curl` 返回 `000` / 连接超时 | 直连被墙且没走代理：要么开 Clash，要么加 `-x` |

代理是备用通道，不是硬依赖：GitHub HTTPS 与 SSH 多数时候直连可用，不要为了“保险”强制走代理。

## 1. 快速命令速查

```bash
# —— 本地预览（旧终端窗口需先补 PATH，新开的终端不用）——
export PATH="/c/Ruby33-x64/bin:$PATH"
cd /d/wu-lab/John-z39.github.io
bundle exec jekyll serve          # 预览 http://127.0.0.1:4000，Ctrl+C 停止
bundle exec jekyll build --strict_front_matter   # 与 CI 相同参数的纯构建测试
powershell -ExecutionPolicy Bypass -File scripts\check-site.ps1   # 完整性检查：清 _site + 构建 + 7 项站点断言 + 文档断言

# —— 推送上线（代理可选，见 §5）——
git add 具体文件.md              # 手动提交只加改动文件
git commit -m "说明"
git push origin main            # 走 SSH（Deploy Key），不需要代理和密码；22 不通时见 §0.6
# 已提交但 push 失败时，补推用：scripts\publish.ps1 -PushOnly
```

**重要**：修改 `_config.yml` 后必须重启 serve（Jekyll 不会热加载配置文件）；改普通页面/文章则会自动重新生成。

## 2. 本机环境清单（换电脑重装时参考）

| 工具 | 版本 | 安装方式 / 位置 |
|---|---|---|
| Ruby + Devkit(MSYS2) | 3.3.12 x64 | `winget install RubyInstallerTeam.RubyWithDevKit.3.3` → `C:\Ruby33-x64`（MSYS2 在其下 `msys64\`；项目 gems 装在 `C:\Ruby33-x64\lib\ruby\gems\3.3.0`）|
| Bundler | 2.5.22 | 随 Ruby 自带 |
| 依赖 gems | 99 个 | 仓库内 `bundle install`（约 2-5 分钟）|
| Git | Git Bash 自带 | `/mingw64/bin/git` |
| Node.js / npm | 已装（`D:\nodejs`）| 旧模板的 `main.min.js` 已删，当前流程不需要 |
| Python | 已装 | 当前流程不需要（`talkmap`/`markdown_generator` 已删除）；做数据核查时可用 |
| 代理 | Clash Verge | `D:\Clash Verge\clash-verge.exe`，混合端口 `127.0.0.1:7897` |

新机器完整流程：装 Ruby（含 Devkit）→ `git clone git@github.com:Wu-Lab-official/Wu-Lab-official.github.io.git`（或先用 HTTPS clone，再按 §0.6 配 Deploy Key）→ `bundle install` → 配 SSH（§0.6）→ `bundle exec jekyll serve`。Gemfile 已含 `tzinfo-data`（Windows 必需，见 §5），无需再改。

## 3. 目录结构（改内容看这里）

### 3.1 当前极简主题（优先看这里）

| 想做什么 | 改哪里 |
|---|---|
| 改首页文字/顺序 | `_pages/home.html` |
| 增删研究方向、改问题/正文 | `_data/research.yml`（`paper_ids` 引用论文 id）|
| 增删论文、改作者/年份/期刊/标签 | `_data/publications.yml`（**唯一数据源**；先查 DOI，见 CONTENT.md）|
| 查某条事实的来源/核对日期 | `CONTENT.md`（来源登记 + 论文核对表 + 待补清单）|
| 改首页“动态” | `_data/news.yml`（首页“最近更新”也取这里第一条）|
| 改导航文字/顺序 | `_data/navigation.yml` |
| 改团队页、导师简介、教育/工作经历 | `_pages/people.html` |
| 改加入我们、岗位、FAQ | `_pages/join.html` |
| 改 404 页 | `_pages/404.md`（需保留 `layout: minimal`，否则会退回旧模板样式）|
| 改全局颜色/字号/间距 | `assets/minimal/style.css` |
| 改论文筛选/搜索/复制引用 | `assets/minimal/app.js` |
| 换团队页照片 | 替换 `assets/minimal/profile.jpg`（保持 2:3，不要裁切）|
| 改全站 title/description/url | `_config.yml` |
| 发布前完整性检查 | `scripts/check-site.ps1`（构建 + 7 项站点断言，并调用 `scripts/check-docs.ps1` 做文档断言）|

### 3.2 目录结构（当前，只有一个主题）

旧 AcademicPages 渲染层已于 2026-10-24 全部删除：`_layouts/default|single|archive|splash|talk`、全部旧 `_includes`、`_sass/`、`assets/css|js|webfonts|fonts`、旧头像与图标、`_pages/about.md`、`_data/ui-text.yml`、`_data/cv.json`、`_data/authors.yml`、模板 CI 工作流。当前不再保留回退副本；取回方法与依赖提醒见 §0.1。

```
├── _config.yml            全站配置（title/description/url、author、include: _pages、exclude、plugins）
├── _layouts/minimal.html  唯一布局
├── _includes/minimal/     head / header / footer
├── _pages/                home、research、publications、people、join、404
├── _data/                 research / publications / news / navigation
├── assets/minimal/        style.css、app.js、profile.jpg、favicon.svg
├── favicon.ico            根图标（响应浏览器默认的 /favicon.ico）
├── files/                 论文 PDF（当前为空）
├── scripts/               publish.ps1、check-site.ps1、check-docs.ps1
├── robots.txt             显式 Allow + sitemap
├── .github/workflows/     jekyll-build.yml（push/PR 时 strict_front_matter 构建校验）
├── LICENSE                MIT（模板原作者 + 本组）
└── 文档                    MAINTENANCE / CONTENT / TOOLBOOK / WORKLOG（均已 exclude）
```

三个容易踩的点：

- **`_pages` 必须显式 include**：`_config.yml` 里少了 `include: [_pages]`，构建仍会“成功”，但 `_site` 里只有 `assets`，6 个页面全不生成。
- **线上没有 `feed.xml` / `redirects.json`**：本地 `bundle exec` 会因 `jekyll_plugins` 组额外生成这两个文件；线上 Pages 只启用 `plugins:` 列表里的插件，所以访问是 404。`check-site.ps1` 在本地 `_site` 里会看到它们，属正常，不要为删它们去动插件列表。
- **删旧布局后不要再引用旧 include**：极简布局只引 `_includes/minimal/*`；`grep -rn 'include ' _layouts _includes` 可自查。

设计稿在仓库外 `D:\wu-lab\_design\`，未纳入版本管理。其中 `minimal/README.md` 描述的岗位/FAQ 页面、`tokens.md` 的配色（`#F4F4F2`/`#0B6E69`）都是早期探索，与线上（`#660874`）不一致，**以 `assets/minimal/style.css` 为准**；`redesign` 分支不存在。

### 模板示例内容（2026-10-24 已清理）

`_posts`、`_publications`、`_portfolio`、`_talks`、`_teaching`、`markdown_generator`、`talkmap*`、示例 PDF/图片、旧模板页面（cv、terms、markdown、archive、talkmap、sitemap 等）已全部删除。构建产物从 46 个 HTML / 44 条 sitemap URL 降到 **6 个 HTML / 5 条 sitemap URL**。

以后新增页面时注意：**Jekyll 会把任何没有 `published: false` 的页面都发布出去**，包括 Markdown 静态文件（例如根目录的 `AGENTS.md` 曾因此挂到线上）。新增文件后跑一次 `scripts/check-site.ps1`，它会用白名单比对 sitemap 并检查泄漏。

如果本地 `_site` 里还有已删除页面的残留文件：Jekyll 3.10 不会自动清理构建目录，`check-site.ps1` 会在构建前删除 `_site`；手工操作时用 `bundle exec jekyll clean`。


## 4. 标准工作流程（SOP）

每轮内容改动都按以下六步走（agent 侧同样受此约束，详见工作区 `AGENTS.md`）：

### ① 改本地
- 只改仓库内文件，改哪个文件参照 §3 对照表
- 遵守工作区 `AGENTS.md` 的“硬性约定”（`bundle exec`、`tzinfo-data`、`main` 分支）

### ② 本地预览验证
```bash
export PATH="/c/Ruby33-x64/bin:$PATH"   # 旧终端才需要
cd /d/wu-lab/John-z39.github.io
bundle exec jekyll serve                # 后台运行；改过 _config.yml 必须重启
```
- `curl` 验证主页和本轮改动页面返回 200；重大/视觉改动用浏览器截图确认
- 收尾跑一次完整性检查（构建 + 泄漏断言，约 5 秒）：
  ```powershell
  powershell -ExecutionPolicy Bypass -File scripts\check-site.ps1
  ```
  它会在构建前删除 `_site`，然后断言：只有 5 条 sitemap URL、没有多余 HTML、没有模板文本、404 用极简布局、文档未泄漏、exclude 未丢条目。

### ③ 推送上线（本地确认后自动执行）
```bash
# 0) 能做就优先用一键脚本（分支守卫 + 构建 + 补推 + 线上校验）
powershell -ExecutionPolicy Bypass -File scripts\publish.ps1 -Message "content: 说明" -Paths 改动文件.md

# 或者手工：
# 1) 暂存具体文件（别盲目 add -A）
git add 路径/文件.md
# 2) 提交，信息格式 <type>: 摘要，type ∈ content/feat/fix/docs/chore
git commit -m "content: 更新课题组简介"
# 3) 推送：走 SSH Deploy Key（2026-10-24 起），无需代理、无需密码
git push origin main
# 4) 等 60–90 秒后验证线上
curl -s -o /dev/null -w "%{http_code}\n" https://wu-lab-official.github.io/改动页面/
```
- 推送凭据是仓库级 Deploy Key，配置见 §0.6；它只对本仓库可写。22 端口被墙时在 `core.sshCommand` 里加 `-o HostName=ssh.github.com -o Port=443`。
- **agent 会话现在也能直接 push**（SSH 不走 credential helper 管道）。若报 `Permission denied (publickey)`：检查 deploy key 是否被删、是否勾了 write access、`core.sshCommand` 路径是否正确；报 `Connection timed out`：22 端口不通，换 443。
- 不要为了“能推”去改 remote 为 HTTPS 或往 URL 里塞 token：HTTPS 在 agent 沙箱里必失败，token 明文还会留在 git 配置里。

### ④ 线上验证
- push 后 GitHub Pages 自动构建（1–2 分钟）；构建状态看仓库 **Actions** 标签页或 commit 的勾/叉
- `curl` 确认线上对应页面 200 才算完成

### ⑤ 留痕
- 在 `WORKLOG.md` 追加本轮条目：日期 ｜ 改动摘要 ｜ 验证结果 ｜ 遗留问题
- 随本轮工作一并 commit（type 用 `docs` 或 `chore`）

### ⑥ 规范迭代
- 过程中发现新问题/新坑 → 对话中提出修改 `AGENTS.md`（工作区 `D:\wu-lab\AGENTS.md`）或本手册的建议 → **征得用户同意后**更新 → 一并提交

### 部署机制细节
- push 到 `main` → GitHub Pages 自动用 `github-pages` gem 构建（Settings → Pages：Deploy from a branch / main / root）
- 仓库自带 CI 工作流 `.github/workflows/jekyll-build.yml`（Ruby 3.2 + `--strict_front_matter` 构建检查），但它的触发条件是 `workflow_run`——挂在 “Cleanup bad PR” 工作流完成之后，而后者只响应 `pull_request_target`。**push 到 `main` 不会触发构建检查**，所以 push 前必须本地跑一遍 `bundle exec jekyll build --strict_front_matter`，不要指望 CI 兜底。

## 5. 已知冲突与坑（重要）

> 完整的“症状 → 原因 → 处理”表和命令速查见 [TOOLBOOK.md](TOOLBOOK.md)；这里只留最容易反复踩的几条。

| 问题 | 原因 | 解决 |
|---|---|---|
| 敲 `jekyll` 报错/跳商店 | WindowsApps 有 535 字节的假 `jekyll` 占位 stub | 一律用 `bundle exec jekyll`；根治：设置 → 应用 → 应用执行别名 → 关闭 jekyll |
| 构建报 `TZInfo::DataSourceNotFound` | Windows 没有系统时区库，`_config.yml` 又设了 `timezone: Etc/UTC` | 已在 Gemfile 加 `gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]`（Linux CI 不受影响），勿删 |
| git push 报 `Could not resolve host: github.com` | 国内网络直连 GitHub 被重置 | 现走 SSH：先测 `ssh -T git@github.com`；22 不通则在 `core.sshCommand` 加 `-o HostName=ssh.github.com -o Port=443`。不要退回 HTTPS |
| `bundle install` 时 `jekyll` 与 `github-pages` 版本疑虑 | Gemfile 同时写了两者 | 正常现象，Bundler 会统一解析到 3.10.x，不用管 |
| 新终端找不到 ruby/bundle | Ruby 安装晚于终端/宿主进程启动 | 新开终端即可；旧会话先 `export PATH="/c/Ruby33-x64/bin:$PATH"` |
| 改了 `_config.yml` 预览没变化 | 配置文件不热加载 | Ctrl+C 停掉 serve 再重启 |
| agent 会话构建/预览报 `Permission denied`（读 `C:\Ruby33-x64\bin`）| DSH 沙箱默认只允许写工作区，Ruby 在 `C:\` 下 | 申请 `danger-full-access` 跑构建；或让用户在自己的终端跑 `publish.ps1`。不要改用别的命令绕过沙箱 |
| agent 会话 `git push` 报 `could not read Username` / `cannot create standard input pipe for git-credential-helper-selector` | 沙箱禁止 Git 拉起 credential helper 的管道（HTTPS 推送才会走它）| 改走 SSH Deploy Key（§0.6）；确认 `git remote get-url origin` 是 `git@github.com:...`。不要用 token 塞 URL |
| agent 会话 `git push` 报 `Permission denied (publickey)` | deploy key 被删 / 未勾 write access / `core.sshCommand` 指向错 | 重新加 key 并勾 write；`ssh -i <key> -T git@github.com` 应显示 `Hi Wu-Lab-official/...` |
| agent 会话 `git push` 报 `Connection timed out` | 22 端口被墙 | `core.sshCommand` 加 `-o HostName=ssh.github.com -o Port=443` |
| `publish.ps1` 语法报错、中文变乱码 | 文件被存成无 BOM 的 UTF-8，PowerShell 5.1 按 GBK 解析 | 保持 UTF-8 **with BOM**（`head -c 3` 应为 `ef bb bf`）；用 `pwsh` 运行也可，但文档默认 5.1 |
| 论文年份/卷页对不上 | `信息.txt` 是 PI 手写清单，有笔误（如 Nano Research 年份、APL 文章号）| 一律以 Crossref 为准：`https://api.crossref.org/works/{DOI}`；差异记在 `CONTENT.md` §3 |
| 抓清华 SIGS 页面后中文乱码 | 页面是 UTF-8，但 Windows 控制台按 GBK 输出 | 用 `curl -o` 存文件、Python 按 `utf-8` 读、结果写 UTF-8 文件再查看；不要直接 print 到控制台 |
| 删掉的页面本地还能访问 | Jekyll 3.10 不清理 `_site` 里的旧产物 | `bundle exec jekyll clean`，或直接用 `scripts/check-site.ps1`（构建前删除 `_site`）|
| 新增 Markdown 文件莫名上了线 | 无 front matter 的 `.md` 会被当静态文件复制 | 新增文档进 `_config.yml` 的 exclude；跑 `check-site.ps1` 复核 |
| 构建“成功”但 6 个页面全没了 | `_config.yml` 缺 `include: [_pages]`，下划线目录默认被忽略 | 补回 `include: [_pages]`；`check-site.ps1` 会报 missing page |
| push 后 Actions 不跑构建检查 | 旧工作流用 `workflow_run` 挂在已删除的 `Cleanup bad PR` 上 | 已改 `on: push/pull_request`（2026-10-24），见 `.github/workflows/jekyll-build.yml` |
| 每次 push 都多一条 Actions 失败 | 模板残留 `Scrape Talk Locations` 去跑已删除的 `talkmap.py` | 已删除该工作流 |
| 线上仍挂着旧模板字体/样式 | 旧 `assets/css\|js\|webfonts\|fonts` 无人引用但仍被复制 | 2026-10-24 已删，线上只剩 `assets/minimal` |

### Ruby 版本提示
本机 3.3、CI 用 3.2，兼容良好。**暂不要升级到 Ruby 3.4+**（bundled gems 移除问题），升级前先在分支上试 `bundle install`。

## 6. 故障排查

```bash
bundle check        # 依赖是否完整（缺了就 bundle install）
bundle list         # 查看已装 gems
bundle exec jekyll -v   # 确认 jekyll 可用（应显示 3.10.0）
ruby -v             # 应显示 3.3.12 (x64-mingw-ucrt)
```

- **页面 404**：检查文件名/front matter 的 `permalink`；确认 `_config.yml` 的 include/exclude 没排掉它
- **论文数据要改**：先查 `CONTENT.md` 的核对表和 DOI，再改 `_data/publications.yml`，最后跑 `check-site.ps1`
- **样式丢失**：所有页面都用 `assets/minimal/style.css`（手写源文件，不是编译产物）；旧模板样式已删除，线上不再有 `assets/css/main.css`
- **推送后线上没更新**：Actions 页看构建是否失败；或确认推的是 `main`（其他分支不部署）
- **彻底重来**：删掉 `_site/` 目录重新 `bundle exec jekyll serve`

## 7. 参考链接

- 教程原文：https://jayrobwilliams.com/posts/2020/06/academic-website/
- 模板官方文档（含各板块详细说明）：https://academicpages.github.io
- 模板仓库 wiki（FAQ 很多）：https://github.com/academicpages/academicpages.github.io/wiki
- GitHub Pages 文档：https://docs.github.com/pages
- 论文元数据核对：Crossref API `https://api.crossref.org/works/{DOI}`
- 导师官方主页：https://www.sigs.tsinghua.edu.cn/wcj/main.htm
- 本机工具与踩坑速查：[TOOLBOOK.md](TOOLBOOK.md)
- GitHub SSH / Deploy Key：https://docs.github.com/authentication/connecting-to-github-with-ssh · https://docs.github.com/developers/overview/managing-deploy-keys

## 8. 仓库与组织设置（管理员操作清单）

> 2026-10-24 体检结论。agent 的 Deploy Key 只有 contents write，改不了这些设置；标“建议”的请在网页上操作。

### 8.1 已确认正常

| 项 | 现状 |
|---|---|
| 可见性 | public（Pages 免费版要求；仓库内容即公开） |
| 默认分支 | `main` |
| Pages 来源 | `main` / root，HTTPS 已启用（`http://` 301 → `https://`，HSTS 1 年） |
| 域名 / 证书 | 未绑自定义域名；`*.github.io` 证书由 GitHub 自动续期（当前至 2026-12-29） |
| DNS | 4 条 GitHub Pages A 记录（185.199.108–111.153） |
| 提交邮箱 | `John-z39@users.noreply.github.com`，不泄露真实邮箱 |
| Deploy Key | 仅此仓库、已勾 write access |
| 仓库历史 | 2026-10-24 新建，无历史包袱 |
| 源文件泄漏 | `/Gemfile`、`/_config.yml`、`/LICENSE`、`/.git/config` 均 404 |
| 传输 | gzip 生效，首页 7.2 KB → 2.4 KB |
| 缓存 | `Cache-Control: max-age=600`（GitHub Pages 固定，不可改） |

### 8.2 建议修改（需要仓库/组织管理员）

| 设置 | 现在 | 建议 | 原因 |
|---|---|---|---|
| About → Description | `wu lab` | `清华大学深圳国际研究生院 吴昌进课题组：活性软物质与智能系统` | 搜索与分享时的第一印象 |
| About → Website | 空 | `https://wu-lab-official.github.io/` | 让 GitHub 侧也能跳转 |
| About → Topics | 空 | `soft-matter`、`microrobotics`、`microfluidics`、`active-matter`、`tsinghua` | 可被发现 |
| Wiki / Projects | 开启 | 关闭 | 没有内容，只会让访客点到空页 |
| 分支保护 `main` | 无 | 禁止 force push、禁止删除分支（不要求 PR） | 防误操作覆盖历史 |
| Actions → General | 默认 | Workflow permissions 设为 read-only；允许的 action 限定官方或要求 pin SHA | 降低供应链风险 |
| Dependabot | 未开 | 开启 alerts + security updates | `Gemfile` 有依赖，漏洞能提前知道 |
| Secret scanning | 公开仓库默认开 | 确认 push protection 也开 | 防误提交 token |
| 组织资料 | 全空 | 名称、描述、网站、位置、头像 | 组织主页现在几乎是空白 |
| 组织 profile README | 无 | 新建 `Wu-Lab-official/.github` 仓库，写 `profile/README.md` | 组织首页会显示，等于第二张名片 |
| 组织 2FA | 未知 | Settings → Authentication security 强制开启 | 账号被盗等于站点被改 |
| 组织 owner | 1 人（推定） | 至少 2 个 owner | 防单点失联 |
| 成员权限 | 未知 | 一律 write，不给 admin；定期清理 Collaborators | 最小权限 |
| Template repository | 关闭 | 保持关闭 | 避免被当成模板复制 |

### 8.3 以后绑自定义域名的注意点

1. 先决定用 `www.` 还是裸域；裸域要配 4 条 A 记录（above），`www` 配 CNAME 到 `wu-lab-official.github.io.`。
2. Pages → Custom domain 填域名 → 等证书签发（几分钟到几小时）→ 勾 **Enforce HTTPS**。
3. 仓库里**不要**手写 `CNAME` 文件与网页设置打架；由 Pages 设置写入即可。
4. 换域名后旧 `*.github.io` 仍可访问，需要的话在旧地址做跳转（或接受双地址）。
5. 域名到期/解析变更会导致站点 404，续费提醒要有人负责。

### 8.4 长期注意事项

- **公开仓库 = 全部公开**，包括历史提交；`exclude` 只影响构建，不影响可见性。
- 组织站点仓库名必须是 `<org>.github.io`，改名等于换域名。
- 本地目录名 `John-z39.github.io` 是旧个人仓库遗留，与 remote 不一致，判断身份看 `git remote -v`。
- Deploy Key 无口令，泄露后到 Settings → Deploy keys 删除并重新生成，同时更新本机 `core.sshCommand`。
- Pages 构建需 1–2 分钟，连续提交会排队；不要因为“没立刻变”重复 push。
- 免费额度：站点 1 GB、月流量 100 GB、构建 10 次/小时；公开仓库的 Actions 不计分钟数。
- 备份：仓库本身就是代码与内容的备份；`信息.txt`、`图片.jpg` 不在仓库，需另存私有位置。
