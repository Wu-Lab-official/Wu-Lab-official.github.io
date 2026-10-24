# Wu-Lab 课题组网站维护手册

> 基于 [AcademicPages](https://academicpages.github.io) 模板（Jekyll 静态站点）+ GitHub Pages 托管
> 参考教程：[Building an Academic Website — Rob Williams](https://jayrobwilliams.com/posts/2020/06/academic-website/)
> 本文档最后更新：2026-10-24（清理模板示例内容、论文数据经 Crossref 核对、增加 CONTENT.md 与 check-site.ps1）
>
> 相关文档：[CONTENT.md](CONTENT.md)（来源登记 / 论文核对 / 待补清单）· [WORKLOG.md](WORKLOG.md)（改动记录）· 工作区 `AGENTS.md`（agent 规范）

---

## 0. 基本信息

| 项目 | 值 |
|---|---|
| 线上地址 | https://wu-lab-official.github.io |
| 仓库 | `Wu-Lab-official/Wu-Lab-official.github.io`（本地：`D:\wu-lab\John-z39.github.io`）|
| 默认分支 | `main`（2026-09-29 由 master 改名，旧 master 已删除）|
| 模板 | 旧模板 academicpages.github.io v0.9.x **仅保留作回退**；当前渲染层为自建极简主题（见 §0.1），不再走 Minimal Mistakes |
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

旧 AcademicPages 文件（`_layouts/default.html`、`_layouts/single.html`、`_sass/`、`assets/css/main.css`、`_includes/sidebar.html` 等）**保留作回退**，新页面不引用它们。等新站稳定后再决定是否清理。

注意：保留的是**布局和样式**。旧模板的页面与集合条目已在 2026-10-24 删除，线上只剩 5 个页面（见 §3.2）。如果以后重新启用旧布局，需要自己补集合内容。

仓库根的 `AGENTS.md` 是**模板作者写给 coding agent 的说明**，不是本组规范；它已加入 `_config.yml` 的 exclude，不再发布到线上（2026-10-24 之前是漏掉的，线上曾可访问 `/AGENTS.md`）。

`_pages/about.md` 已设为 `published: false`，旧首页不再参与构建；需要回退时把它改回 `permalink: /` 并启用即可。

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
- 代理自动探测：7897 开着就带 `-c http.proxy`，没开就直连；不再强制要求先启动 Clash。
- push 前自动 `pull --rebase`，远端有新提交时不用手工处理。
- 脚本设置 `GIT_TERMINAL_PROMPT=0` / `GCM_INTERACTIVE=never`：凭据缺失会立刻报错而不是卡在用户名提示。**首次登录或凭据过期时**，先在终端手动 `git push origin main` 让 Git 凭据管理器弹窗登录，再回来用脚本。
- 提交里如果没有 `WORKLOG.md`，会给黄色警告（规范要求每轮留痕），但不阻断。
- push 失败时本地提交保留，按提示修网络/凭据后重跑 `-PushOnly` 即可补推。
- **脚本是 UTF-8 with BOM**：Windows PowerShell 5.1 读无 BOM 的 UTF-8 会把中文按 GBK 解释，直接语法报错。编辑这个文件时别把 BOM 弄丢（`head -c 3` 应看到 `ef bb bf`）。

```powershell
# 只提交不推送
powershell -ExecutionPolicy Bypass -File scripts\publish.ps1 -Message "content: 本地预览" -NoPush
# 上次 push 失败，补推
powershell -ExecutionPolicy Bypass -File scripts\publish.ps1 -PushOnly
```

要求：Ruby 在 `C:\Ruby33-x64\bin`。脚本供你在自己的终端运行，不经过 agent 的逐条审批。

## 1. 快速命令速查

```bash
# —— 本地预览（旧终端窗口需先补 PATH，新开的终端不用）——
export PATH="/c/Ruby33-x64/bin:$PATH"
cd /d/wu-lab/John-z39.github.io
bundle exec jekyll serve          # 预览 http://127.0.0.1:4000，Ctrl+C 停止
bundle exec jekyll build --strict_front_matter   # 与 CI 相同参数的纯构建测试

# —— 推送上线（代理可选，见 §5）——
git add 具体文件.md              # 手动提交只加改动文件
git commit -m "说明"
git push origin main            # 代理不通时才加 -c http.proxy=http://127.0.0.1:7897
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
| Node.js / npm | 已装（`D:\nodejs`）| 仅改前端 JS 后重建 `main.min.js` 时才需要，平时用不到 |
| Python | 已装 | 当前流程不需要（`talkmap`/`markdown_generator` 已删除）；做数据核查时可用 |
| 代理 | Clash Verge | `D:\Clash Verge\clash-verge.exe`，混合端口 `127.0.0.1:7897` |

新机器完整流程：装 Ruby（含 Devkit）→ `git clone https://github.com/Wu-Lab-official/Wu-Lab-official.github.io.git` → `bundle install` → `bundle exec jekyll serve`。Gemfile 已含 `tzinfo-data`（Windows 必需，见 §5），无需再改。

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
| 发布前完整性检查 | `scripts/check-site.ps1` |

### 3.2 旧 AcademicPages 结构（仅保留布局/样式作回退）

模板示例内容已于 2026-10-24 清理：`_posts/`、`_publications/`、`_portfolio/`、`_talks/`、`_teaching/`、`markdown_generator/`、`talkmap*`、示例图片与 PDF 已删除；旧模板页面（cv、terms、markdown、archive、talkmap、sitemap 等）也已删除。当前构建只有 6 个 HTML、5 条 sitemap URL。

保留下来的是**布局与样式**（`_layouts/default.html`、`_layouts/single.html`、`_sass/`、`assets/css/main.css`、旧 `_includes/`）和旧首页 `_pages/about.md`（`published: false`）。回退时把 `about.md` 改回 `permalink: /` 并启用即可，但它依赖的集合数据已删除，需要另建内容。

当前目录（只列还在用的）：

```
├── _config.yml            全站配置：title/description/url、exclude 列表、collections（空）
├── _layouts/minimal.html  新站骨架（旧 default/single 仅回退）
├── _includes/minimal/     head / header / footer
├── _pages/                home、research、publications、people、join、404、about（停用）
├── _data/                 research / publications / news / navigation（+ 旧 cv.json、ui-text）
├── assets/minimal/        style.css、app.js、profile.jpg、favicon.svg
├── assets/css|js/         旧模板样式与脚本（回退用，当前页面不引用）
├── images/                profile.png（旧侧边栏头像）、favicon、manifest
├── files/                 论文 PDF / 附件（当前为空，缺 PDF 时放这里）
├── scripts/               publish.ps1、check-site.ps1
└── 文档                    MAINTENANCE.md、CONTENT.md、WORKLOG.md（均已 exclude）
```


### 旧模板维护任务（仅回退时使用）

当前内容维护请看 **§3.1**。下面这些只适用于重新启用 AcademicPages 旧布局的情况：

| 想做什么 | 改哪里 |
|---|---|
| 侧边栏头像/姓名/邮箱/单位 | `_config.yml` 的 `author:` 区块；头像替换 `images/profile.png` |
| 侧边栏学术链接 | `_config.yml` 的 `author:` 区块，留空则不显示图标 |
| 旧首页 | `_pages/about.md`（当前 `published: false`）|
| 旧论文列表 | `_publications/`（当前新论文页不再使用）|
| 旧模板样式 | `_sass/`、`assets/css/main.css` |

### 模板示例内容（2026-10-24 已清理）

`_posts`、`_publications`、`_portfolio`、`_talks`、`_teaching`、`markdown_generator`、`talkmap*`、示例 PDF/图片、旧模板页面（cv、terms、markdown、archive、talkmap、sitemap 等）已全部删除。构建产物从 46 个 HTML / 44 条 sitemap URL 降到 **6 个 HTML / 5 条 sitemap URL**。

以后新增页面时注意：**Jekyll 会把任何没有 `published: false` 的页面都发布出去**，包括 Markdown 静态文件（例如根目录的 `AGENTS.md` 曾因此挂到线上）。新增文件后跑一次 `scripts/check-site.ps1`，它会用白名单比对 sitemap 并检查泄漏。

如果本地 `_site` 里还有已删除页面的残留文件：Jekyll 3.10 不会自动清理构建目录，`check-site.ps1` 会在构建前删除 `_site`；手工操作时用 `bundle exec jekyll clean`。


## 4. 标准工作流程（SOP）

每轮内容改动都按以下六步走（agent 侧同样受此约束，详见工作区 `AGENTS.md`）：

### ① 改本地
- 只改仓库内文件，改哪个文件参照 §3 对照表
- 遵守 §5 的硬性约定（bundle exec、tzinfo-data、main 分支）

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
# 3) 推送：代理开着就走代理，直连也能用（今天直连可达）
git push origin main
#   代理不通时才用：git -c http.proxy=http://127.0.0.1:7897 -c http.sslBackend=openssl push origin main
# 4) 等 60–90 秒后验证线上
curl -s -o /dev/null -w "%{http_code}\n" https://wu-lab-official.github.io/改动页面/
```
- 也可一劳永逸给 git 配置代理（配置后 push 不用再加 `-c` 参数）：
  `git config --global http.proxy http://127.0.0.1:7897`
  取消：`git config --global --unset http.proxy`
- **agent 会话通常无法 push**：沙箱禁止 Git 调用 credential helper 时的子进程管道（报 `cannot create standard input pipe for git-credential-helper-selector: Permission denied` 或 `could not read Username`），即使本机已存凭据。此时让用户在自己的终端执行 `git push origin main`，或运行 `publish.ps1 -PushOnly`；不要反复重试。

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

| 问题 | 原因 | 解决 |
|---|---|---|
| 敲 `jekyll` 报错/跳商店 | WindowsApps 有 535 字节的假 `jekyll` 占位 stub | 一律用 `bundle exec jekyll`；根治：设置 → 应用 → 应用执行别名 → 关闭 jekyll |
| 构建报 `TZInfo::DataSourceNotFound` | Windows 没有系统时区库，`_config.yml` 又设了 `timezone: Etc/UTC` | 已在 Gemfile 加 `gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]`（Linux CI 不受影响），勿删 |
| git push 报 `Could not resolve host: github.com` | 国内网络直连 GitHub 被重置 | 启动 Clash Verge（`D:\Clash Verge\clash-verge.exe`），然后用 `git -c http.proxy=http://127.0.0.1:7897 push`（或给 git 全局配置代理）|
| `bundle install` 时 `jekyll` 与 `github-pages` 版本疑虑 | Gemfile 同时写了两者 | 正常现象，Bundler 会统一解析到 3.10.x，不用管 |
| 新终端找不到 ruby/bundle | Ruby 安装晚于终端/宿主进程启动 | 新开终端即可；旧会话先 `export PATH="/c/Ruby33-x64/bin:$PATH"` |
| 改了 `_config.yml` 预览没变化 | 配置文件不热加载 | Ctrl+C 停掉 serve 再重启 |
| agent 会话构建/预览报 `Permission denied`（读 `C:\Ruby33-x64\bin`）| DSH 沙箱默认只允许写工作区，Ruby 在 `C:\` 下 | 申请 `danger-full-access` 跑构建；或让用户在自己的终端跑 `publish.ps1`。不要改用别的命令绕过沙箱 |
| agent 会话 `git push` 报 `could not read Username` / `cannot create standard input pipe for git-credential-helper-selector` | 沙箱禁止 Git 拉起 credential helper 的管道，凭据读不到（与凭据是否已存无关）| 让用户在自己终端 `git push origin main`，或 `publish.ps1 -PushOnly`；agent 不要反复重试 |
| `publish.ps1` 语法报错、中文变乱码 | 文件被存成无 BOM 的 UTF-8，PowerShell 5.1 按 GBK 解析 | 保持 UTF-8 **with BOM**（`head -c 3` 应为 `ef bb bf`）；用 `pwsh` 运行也可，但文档默认 5.1 |
| 论文年份/卷页对不上 | `信息.txt` 是 PI 手写清单，有笔误（如 Nano Research 年份、APL 文章号）| 一律以 Crossref 为准：`https://api.crossref.org/works/{DOI}`；差异记在 `CONTENT.md` §3 |
| 抓清华 SIGS 页面后中文乱码 | 页面是 UTF-8，但 Windows 控制台按 GBK 输出 | 用 `curl -o` 存文件、Python 按 `utf-8` 读、结果写 UTF-8 文件再查看；不要直接 print 到控制台 |
| 删掉的页面本地还能访问 | Jekyll 3.10 不清理 `_site` 里的旧产物 | `bundle exec jekyll clean`，或直接用 `scripts/check-site.ps1`（构建前删除 `_site`）|
| 新增 Markdown 文件莫名上了线 | 无 front matter 的 `.md` 会被当静态文件复制 | 新增文档进 `_config.yml` 的 exclude；跑 `check-site.ps1` 复核 |

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
- **样式丢失**：新页面看 `assets/minimal/style.css`（手写源文件，不是编译产物）；只有 404 之外的旧模板页面才用 `assets/css/main.css`（由 `_sass/` 编译，别手改）
- **推送后线上没更新**：Actions 页看构建是否失败；或确认推的是 `main`（其他分支不部署）
- **彻底重来**：删掉 `_site/` 目录重新 `bundle exec jekyll serve`

## 7. 参考链接

- 教程原文：https://jayrobwilliams.com/posts/2020/06/academic-website/
- 模板官方文档（含各板块详细说明）：https://academicpages.github.io
- 模板仓库 wiki（FAQ 很多）：https://github.com/academicpages/academicpages.github.io/wiki
- GitHub Pages 文档：https://docs.github.com/pages
- 论文元数据核对：Crossref API `https://api.crossref.org/works/{DOI}`
- 导师官方主页：https://www.sigs.tsinghua.edu.cn/wcj/main.htm
