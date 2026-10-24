# 工作日志（WORKLOG）

> **留痕规则**：每轮对话结束前，agent 在此文件追加一条记录，格式：
> `日期 ｜ 改动摘要 ｜ 验证结果 ｜ 遗留问题`
> 本文件在 `_config.yml` exclude 列表中，不会发布到线上。

---

## 2026-09-29 ｜ 会话 1：环境可行性验证（全链路打通并上线）

- **改动**
  - 安装 Ruby 3.3.12 + Devkit（winget → `C:\Ruby33-x64`），`bundle install` 装好 99 gems（Jekyll 3.10.0）
  - `Gemfile` 加 `tzinfo-data`（修复 Windows 下 `TZInfo::DataSourceNotFound` 构建失败）
  - `_config.yml`：`url` → `https://john-z39.github.io`，`repository` → `John-z39/John-z39.github.io`
  - 分支 `master` → `main`，GitHub 默认分支已切换，远端旧 master 已删除
  - 新增 `MAINTENANCE.md` 维护手册（已 exclude，不发布）
- **验证**：`jekyll build --strict_front_matter` 成功；本地 serve 主页/子页 200；浏览器截图确认渲染正常；推送后线上 canonical 已指向新域名
- **遗留**：内容阶段未开始（成员/论文/导航改造/汉化）；git 身份为仓库级 `John-z39@users.noreply.github.com`，可按需修改

## 2026-09-29 ｜ 会话 2：文档与流程规范化

- **改动**
  - 新增本文件 `WORKLOG.md`（已 exclude）
  - 工作区 `AGENTS.md` 重写：加入标准工作流程（改本地 → 本地预览验证 → 自动推送 → 留痕 → 征得同意后迭代规范）、硬性约定、AGENTS.md 迭代协议
  - `MAINTENANCE.md` 补充标准操作规程（§4）与 Ruby 路径细节
  - `_config.yml` exclude 列表加入 `WORKLOG.md`
- **验证**：构建通过，`MAINTENANCE.md`/`WORKLOG.md` 均确认不在 `_site` 中；本地 serve 200；推送后线上 200
- **遗留**：同会话 1，内容阶段待启动

## 2026-10-05 ｜ 会话 3：填入导师信息（仅本地，未推送）

- **改动**
  - 信息来源：清华深研院官方导师主页 https://www.sigs.tsinghua.edu.cn/wcj/main.htm （用户侧边栏已打开）
  - `_config.yml`：`name` → Changjin Wu；`description` → 课题组中文简介；`author` 区块填入真实信息（姓名"吴昌进 Changjin Wu"、职称、单位、办公室"深圳 · 能源环境大楼 2107"、邮箱、`uri` 指向官方主页）；清空模板占位的 googlescholar/orcid/pubmed/github("academicpages")/bluesky 链接（真实链接待核实）
  - `_pages/about.md`：整页替换为中文首页——课题组简介、研究方向×5、导师简介、教育/工作经历表、加入我们、联系方式（邮箱用 [at] 防爬）
  - `images/profile.png`：替换为官方主页头像（400×599 JPEG，走本地代理 curl 下载）
- **验证**：`bundle exec jekyll serve` 本地主页 200，`/images/profile.png` 200；HTML 检查无模板残留（仅页脚主题署名属正常）；浏览器截图确认侧边栏照片/姓名/链接、正文排版、页脚版权（© 2026 Changjin Wu）均正常
- **遗留**：**按用户要求本轮未推送**（本地已 commit，待用户确认后再 push）；Google Scholar 等学术链接未找到可靠主页，暂留空；导航菜单仍为英文、`_posts`/`_publications` 等示例数据未清理（下一阶段）
- **新坑**：curl 直连 sigs.tsinghua.edu.cn 报 schannel 证书吊销检查失败（CRYPT_E_NO_REVOCATION），走 Clash 代理 `-x http://127.0.0.1:7897` 正常；清华站点图片 URL 中 UUID 极易抄错，应从 HTML 程序化提取

## 2026-10-24 ｜ 会话 4：迁移到组织 Pages

- **改动**
  - `_config.yml`：`url` → `https://wu-lab-official.github.io`，`repository` → `Wu-Lab-official/Wu-Lab-official.github.io`
  - `MAINTENANCE.md`：线上地址、仓库、clone 地址、线上验证 URL 同步到组织仓库
  - 本地 `main` 原有 1 个未推送 commit（`a72faed`）一并推送到新组织仓库
- **验证**：`bundle exec jekyll build --strict_front_matter` 构建通过；新仓库首次 push 成功；等待 Pages 构建后验证线上 200
- **遗留**：旧个人站 `john-z39.github.io` 暂保留作备份，待新站稳定后再决定归档或跳转；GitHub Actions 仍是 `Cleanup bad PR` 触发的 build 检查，不负责 deploy

## 2026-10-24 ｜ 会话 5：方案 B，极简版接入 Jekyll

- **改动**
  - 新增 `_layouts/minimal.html`、`_includes/minimal/{head,header,footer}.html`：独立极简骨架，不再走 AcademicPages sidebar/single
  - 新增 `_pages/home.html`、`research.html`、`people.html`、`join.html`；重写 `_pages/publications.html`
  - 新增 `_data/research.yml`（5 个方向）、`publications.yml`（代表性论文条目）、`news.yml`（首页动态）；`navigation.yml` 改为中文 4 项
  - 新增 `assets/minimal/{style.css,app.js,profile.jpg,favicon.svg}`
  - `_pages/about.md` 设为 `published: false`，旧首页退场；旧 AcademicPages 布局/样式保留作回退
  - `README.md` 增加项目说明；`MAINTENANCE.md` 增加 §0.1 当前极简主题架构和 §3.1 维护对照表
- **验证**：`bundle exec jekyll build --strict_front_matter` 通过；本地 5 页 + CSS/JS/照片均 200；桌面截图确认首页、论文、团队页；线上 `https://wu-lab-official.github.io/`、`/research/`、`/publications/`、`/people/`、`/join/` 已渲染为新版
- **遗留**：旧模板示例数据（`_posts`/`_publications` 等）尚未清理；成员、照片、DOI/PDF、招生细节待补

## 2026-10-24 ｜ 会话 6：内容真实性清理 + 发布脚本

- **改动**
  - 加入我们页：删除未确认的岗位人数、申请流程、回复时间、FAQ、实验平台/合作资源；只保留“可联系了解博士后/博士/硕士”+ 联系方式
  - 团队页：删除“首批成员招募中”和“开放岗位”表；成员/校友改为“待补充”
  - 首页：删除“开放多个岗位”“开放申请”“完整列表”“全部论文”等表述；招收信息改为“邮件联系”
  - 论文页：去掉“15 篇代表性工作”，计数改为“N 条”
  - 新增 `scripts/publish.ps1`：构建 → add → commit → 代理 push
  - `MAINTENANCE.md` 增加 §0.2 项目性质/现状、§0.3 内容真实性规则、§0.4 一键发布；`README.md` 增加项目状态
- **验证**：`bundle exec jekyll build --strict_front_matter` 通过；5 页本地 200；`scripts/publish.ps1` 实测完成 build → commit → push（提交 `072c64a`）；线上 `/join/` 和 `/publications/` 已更新
- **遗留**：成员名单、照片、论文 DOI/PDF、招生细节需 PI 提供；未确认的信息继续留空，不补

## 2026-10-24 ｜ 会话 7：文档体检 + P0 纠错（AGENTS.md 泄漏 / 404 / 过期事实）

- **背景**：应要求复核上一轮维护的文档。静态核对发现文档多处与仓库/构建产物不符，按用户确认的范围只做 P0（文档纠错、排除 AGENTS.md、404 换极简布局），旧模板 demo 页暂不动。
- **改动**
  - `_config.yml`：exclude 增加 `AGENTS.md`（此前线上可访问 `/AGENTS.md`，内容是模板作者写给 agent 的说明）
  - `_pages/404.md`：改为 `layout: minimal` + 中文 404（原来走旧 AcademicPages 布局，`lang="en"`、加载 `assets/css/main.css`）
  - `MAINTENANCE.md`：更新最后更新日期；模板行改为“旧模板仅回退、当前为极简主题”；新增 404 相关两行；§0.2 状态改为“demo 页仍在构建并在 sitemap 中”；§0.1 补“保留布局≠页面已下线”说明与 AGENTS.md exclude 说明；§1 与 §4③ 统一 `git add` 口径（手动只加具体文件，仅 `publish.ps1` 用 `-A`，并说明原因）；§3.2 重写 demo 数据段（46 HTML / 44 唯一 sitemap URL，列出泄漏 URL 与四种清理方式）；CI 段改为“`jekyll-build.yml` 由 `workflow_run` 触发，push 到 main 不会跑构建检查”；§6 样式排障改为 `assets/minimal/style.css`
  - 工作区 `AGENTS.md`：exclude 说明补入 `AGENTS.md` 及“模板说明非本组规范”；当前状态补本轮条目与“demo 页待下架”待办
- **验证**：`bundle exec jekyll build --strict_front_matter` 通过（3.2s）；`_site` 中已无 `AGENTS.md`/`MAINTENANCE.md`/`WORKLOG.md`；`_site/404.html` 为 `lang="zh-CN"`、仅引用 `assets/minimal/style.css`、标题“页面不存在 · Wu-Lab”；本地 serve 下 `/`、`/404.html`、`/research/`、`/publications/`、`/people/`、`/join/`、CSS 均 200；sitemap 仍为 46 条 / 44 唯一（demo 页未处理，符合本轮范围）
- **遗留**
  - 旧模板 demo 页/集合条目仍在线上且被 sitemap 收录（假论文、模板博客、`/cv/`、`/terms/`、`/portfolio/`、`/talks/`、`/teaching/`、`/files/paper*.pdf` 等），待用户同意后整体下架
  - 缺内容来源登记表（事实→来源→核对日期）与站点泄漏检查脚本；方向标签三套键（`research.id` / `publications.tags` / `publications.html` 写死的选项）未统一
  - “方案 B”在 MAINTENANCE 与 `_design/方案构想-v2` 中含义不同；`_design/minimal/README.md` 仍描述已删除的岗位/FAQ，`tokens.md` 配色与线上 `#660874` 不一致
  - 本轮本地构建需 `danger-full-access`（workspace-write 下读不到 `C:\Ruby33-x64`），文档尚未记录该降级路径；push 时 Clash Verge 未启动，推送待用户开启代理后执行

## 2026-10-24 ｜ 会话 8：重写 publish.ps1 + 记录沙箱推送限制

- **背景**：P0 提交本地成功但 push 失败。排查确认不是脚本逻辑，而是沙箱禁止 Git 拉起 credential helper 的管道（`cannot create standard input pipe for git-credential-helper-selector: Permission denied`），无 SSH key，直连 GitHub 本身可达（200）。用户确认后重写脚本并把该限制写进文档。
- **改动**
  - `scripts/publish.ps1` 重写：分支守卫（非 main 直接拒绝）；`-Paths` 限定暂存范围；`-PushOnly` 补推已有提交（旧版此场景直接退出）；代理自动探测（7897 开则走代理，否则直连）；push 前 `pull --rebase`；push 失败给可操作提示；push 后按 `-VerifyPaths`/`-VerifyWaitSeconds` 校验线上；未改 WORKLOG 给警告；提交信息改用 `git commit -F`（避免 PowerShell 5.1 把中文参数按 ANSI 传给 git 导致乱码）；文件保存为 UTF-8 with BOM（无 BOM 时 5.1 按 GBK 解析，直接语法报错，本次实际踩到）
  - `MAINTENANCE.md`：§0.4 重写为参数表 + 行为细节（含 BOM 说明）；§1 推送命令改为直连优先、代理备用；§4③ 增加“agent 会话通常无法 push”的说明；§5 坑表新增三行（沙箱读不到 Ruby、credential helper 被拦、脚本 BOM）
  - 工作区 `AGENTS.md`：本地验证补“构建需一次性 danger-full-access”及降级路径；推送补“agent 会话推不上去、交给用户终端或 `-PushOnly`”；代理由“push 必需”改为“直连可用时不必开”
- **验证**：脚本在 PowerShell 5.1 与 7 下解析均 ok（BOM 后）；脚本内构建通过；本地提交生成；push 在 agent 会话仍因凭据管道被拦而失败，已按提示留下提交待用户推送
## 2026-10-24 ｜ 会话 9：清理模板内容 + 论文核查 + 数据单一化 + 站点检查脚本

- **背景**：用户授权“该删删、该改改”，要求继续查问题、完善流程、核实内容真实性。本轮同时处理三项：下架模板 demo、按权威记录校正论文、消除多套数据键。
- **改动**
  - 删除模板示例内容：`_posts`(5)、`_publications`(5)、`_portfolio`(2)、`_talks`(4)、`_teaching`(2)、`_drafts`(1)、`_data/comments`(7)、`talkmap*`、`markdown_generator/`、示例 PDF/BibTeX、`images/bio-photo*`、`images/editing-talk.png`、`images/500x300.png`、`images/themes/`、`images/wiki/`；删除旧模板页面 16 个（`cv`、`cv-json`、`terms`、`markdown`、`archive` 系列、`talkmap`、`sitemap`、`talks`、`teaching`、`portfolio`、`non-menu-page`）。构建产物 46 HTML / 44 唯一 sitemap URL → **6 HTML / 5 条**
  - `_data/publications.yml`：15 条逐条查 Crossref。修正 **3 处标题**（Adv. Mater. 补 “Hybrid”；Angew 综述 “Systems”；Nano Research 全名）、**1 处年份**（Nano Research 2024 → 2025）、**3 处卷页**（Sci. Adv. 8(45), eade1731；APL 143502；JACS 19945–19952）；补 `id`；`tags` 改用 research 的 id（`microrobot`/`soft-matter`/`microfluidics`/`field`/`assembly`）
  - `_data/research.yml` 的 `papers` 字符串改为 `paper_ids` 引用；`_pages/research.html` 联查 `publications.yml` 渲染；`_pages/publications.html` 筛选项从 `research.yml` 生成——三套标签键合并为一套
  - `_pages/home.html`：“最近更新”改为 `{{ site.data.news.first.date }}`，不再手写
  - `_data/authors.yml`：清空模板示例作者（旧布局仍会读它，保留文件 + 注释说明）
  - `_config.yml`：exclude 增加 `CONTENT.md`；`README.md` 重写为项目说明（删除模板原文与失效配图引用）
  - 新增 `CONTENT.md`：4 类来源、事实登记表（含核对日期）、15 条论文 DOI 核对表、与 `信息.txt` 的 5 处差异、待补清单、维护约定
  - 新增 `scripts/check-site.ps1`：构建前删除 `_site`，断言 ①文档未发布 ②sitemap 恰为 5 条 ③页面存在 ④无多余 HTML ⑤无模板文本 ⑥404 用极简布局 ⑦exclude 完整
  - `MAINTENANCE.md`：§3.1 改表加入 `paper_ids`/CONTENT.md/检查脚本；§3.2 重写为“仅保留布局回退 + 当前目录”；模板清理段改为已完成并给数字；§4② 加检查命令；§5 坑表加 5 行（信息.txt 笔误、SIGS 页面 GBK 输出、`_site` 不自动清理、无 front matter 的 md 会发布）；§7 加 Crossref 与导师主页
  - 工作区 `AGENTS.md`：文档地图加 CONTENT.md；流程第 1/2 步加来源核查；验证步加 `check-site.ps1`；硬性约定加“论文元数据以 Crossref 为准”；状态/待办更新
  - 删除仓库内模板自带的 `AGENTS.md`（与本组无关，且会被 agent 当作项目规范加载）；工作区 `AGENTS.md` 保留为本组规范，exclude 中的 `AGENTS.md` 条目保留防回归
- **验证**：`check-site.ps1` → `PASS: 6 html, 5 sitemap urls, no leaks`；`bundle exec jekyll build --strict_front_matter` 通过（1.7s）；本地 `/`、`/research/`、`/publications/`、`/people/`、`/join/`、`/404.html` 均 200；`/research/` 5 个方向论文按 `paper_ids` 正确渲染；`/publications/` 15 行、筛选项 5 个；首页“最近更新 2026.10”
- **遗留**：本次提交需用户在自己终端 push；成员/照片/DOI/PDF/招生细节仍缺（见 `CONTENT.md` §4）；`信息.txt` 与 `图片.jpg` 只在工作区、未入库；`_design/` 仍在仓库外且描述与线上不一致

## 2026-10-24 ｜ 会话 10：push 能力说明 + 工具手册 + 文档自动维护方针 + 隐私边界

- **背景**：用户追问“为什么总要我自己 push、脚本还有没有用”，要求汇总常用工具与坑、把文档自动维护方针写进文档、并检查哪些内容会被上传/不能推。
- **改动**
  - 新增 `TOOLBOOK.md`：环境与命令（Ruby/Bundler、Jekyll、git、PowerShell、Python、curl、代理、Crossref）、沙箱限制表、症状→原因→处理表、常用命令速查、排查顺序
  - 新增 `robots.txt`：显式 `Allow: /` + sitemap 指向（覆盖 jekyll-sitemap 生成的单行版本）
  - `_config.yml`：exclude 增加 `TOOLBOOK.md` 与 `scripts`——此前 `publish.ps1`、`check-site.ps1` 会被发布到线上 `/scripts/`，现已不再上传
  - 删除模板脚手架 `Dockerfile`、`docker-compose.yaml`、`_config_docker.yml`、`package.json`、`.devcontainer`（其中 `docker-compose.yaml` 会出现在线上）
  - `CONTENT.md`：新增 §5 隐私边界（本地 / 仓库但不上线 / 上线 / 绝对不能提交 四类 + 提交前检查），原 §5 维护约定顺延为 §6
  - `AGENTS.md`：新增“文档自动维护方针”——五份文档分工、每轮收尾自查四项、数字以 `check-site.ps1` 为准
  - `MAINTENANCE.md`：新增 §0.5 文档维护方针；§1 加 `check-site.ps1`；§3.2 目录树补 `TOOLBOOK.md`、`robots.txt`；§5 指向 TOOLBOOK；§7 加链接
- **验证**：`check-site.ps1` → `PASS: 6 html, 5 sitemap urls, no leaks`；`_site` 顶层只剩 `404.html`、`assets/`、`feed.xml`、`images/`、5 个页面目录、`redirects.json`、`robots.txt`、`sitemap.xml`；`_site/scripts` 不存在；`robots.txt` 为显式 Allow + sitemap；构建 1.8s
- **遗留**：push 仍只能由用户在自己终端执行（agent 无凭据通道），本地提交待推；push 方案（配置 SSH key / 维持现状）待用户决定

## 2026-10-24 ｜ 会话 11：推送打通（SSH Deploy Key）+ 线上全量验证

- **背景**：用户追问“为什么总要我自己推”，确认 HTTPS 推送在 agent 会话里必然失败（credential helper 管道被沙箱拦），改用 GitHub 官方给自动化准备的 Deploy Key。
- **改动**
  - 生成仓库专用 ed25519 key：`D:\wu-lab\.ssh\wu-lab-deploy`（私钥，仅本机）+ `.pub`（公钥）；仓库 Settings → Deploy keys 添加 `wu-lab-agent` 并勾 **Allow write access**
  - `git remote` 改为 `git@github.com:Wu-Lab-official/Wu-Lab-official.github.io.git`；本仓库 `core.sshCommand` 指定私钥、`IdentitiesOnly`、独立 `known_hosts`
  - 首次推送成功：`0cad95f..745895f main -> main`（4 个提交），agent 会话不再需要用户代推
  - `MAINTENANCE.md`：新增 §0.6 SSH Deploy Key（当前配置表、换机重配命令、443 回退、回滚）；§0.4/§1/§2/§4③/§5/§7 的 HTTPS+代理口径全部改为 SSH；坑表新增 publickey/timeout 两行
  - `AGENTS.md`：流程第 4 步改为“agent 可直接 push”，补 remote/sshCommand 检查与故障处理；硬性约定加“推送走 SSH、私钥不外发”；关键事实表加推送行；状态加本轮
  - `TOOLBOOK.md`：新增 §2.5 SSH 与推送（配置表、认证测试、443 回退、5 种报错处理）
  - `scripts/publish.ps1`：push 失败提示改为 SSH 排障（publickey / timeout→443 / remote 仍是 https），去掉过时的“credential helper 被拦，请用户手动推”
- **验证**：`ssh -i ... -T git@github.com` → `Hi Wu-Lab-official/Wu-Lab-official.github.io!`；`git push` 成功；线上 `/`、`/research/`、`/publications/`、`/people/`、`/join/`、`/404.html`、`/robots.txt`、`/sitemap.xml` 均 200；`/AGENTS.md`、`/publication/paper-title-number-1/`、`/posts/2012/08/blog-post-1/`、`/scripts/publish.ps1`、`/cv/`、`/terms/` 均 404；sitemap 5 条；robots 为显式 Allow + sitemap
- **遗留**：key 为无口令（agent 无法交互输入），本机可读该文件者即可写此仓库，已用仓库级最小权限限制；换机需按 §0.6 重配

## 2026-10-24 ｜ 会话 12：全面体检 + 删除旧渲染层 + 修复 CI + 组织/仓库设置清单

- **体检方法**：线上状态码矩阵与响应头、TLS/DNS、6 个页面的 meta/死链扫描（HTMLParser 自写脚本）、GitHub 公开 API 读仓库/组织/工作流/运行记录、本地 git 树与大文件统计。
- **发现并修复**
  - 旧模板渲染层仍在仓库且被发布：`main.css` 54 KB、`main.min.js` 102 KB、FontAwesome/academicons 字体约 1.9 MB、旧头像 `images/profile.png`、`_sass/` 726 KB——极简主题完全不引用。已删除旧 layouts、全部旧 includes、`_sass`、`assets/css|js|webfonts|fonts`、`images`、`_pages/about.md`、`_data/ui-text.yml|cv.json|authors.yml`
  - `.github` 模板残留：`CONTRIBUTING.md`、两个 ISSUE_TEMPLATE、PR 模板、`bad-pr.yml`、`scrape_talks.yml`（每次 push 跑失败）→ 全部删除
  - `jekyll-build.yml` 原用 `workflow_run` 挂在已删除的 `Cleanup bad PR` 上，push 根本不触发 → 改为 `on: push/pull_request/workflow_dispatch` + `contents: read` + concurrency
  - `_config.yml` 从 368 行精简到 60 行：去掉 comments/analytics/publication_category/collections/defaults/sass/whitelist/compress 等失效段；补 `include: [_pages]`（缺它会导致 6 个页面全部不生成、构建却“成功”）
  - `LICENSE` 原本只有模板作者版权行 → 追加本组版权行（MIT 全文保留）
  - `_includes/minimal/head.html` 缺分享元信息 → 补 og:type/site_name/title/description/url/locale + twitter:card，支持 `page.noindex`
  - 404 页加 `noindex`；根目录补 `favicon.ico`（此前 `/favicon.ico` 404）
- **验证**：`check-site.ps1` → `PASS: 6 html, 5 sitemap urls, no leaks`；线上 5 页 + `404.html` + `favicon.ico` + `robots.txt` + `sitemap.xml` 全 200，旧 `assets/css|js|webfonts`、`images/profile.png`、`feed.xml` 全 404；sitemap 5 条；404 返回状态码 404 且含 noindex；首页含 6 个 og 标签；push 触发的 `Jekyll build check` 运行成功
- **文档**：`MAINTENANCE.md` §3.2 重写为当前目录、§5 补 4 条坑、§6 样式条目修正、新增 §8 仓库与组织设置清单（正常项 / 待管理员 13 项 / 自定义域名注意 / 长期注意）；`TOOLBOOK.md` 新增 §2.6 GitHub Actions；`AGENTS.md` 状态更新
- **遗留**：§8.2 的 13 项需管理员在网页操作（描述、topics、关闭 Wiki、分支保护、Actions 权限、Dependabot、组织资料与 profile README 等）
- **同日追加**：推送时发现 Git Bash 的 MSYS ssh 会间歇性 `Could not resolve hostname github.com`（同时 `nslookup`/`curl` 正常）→ `core.sshCommand` 改用系统 OpenSSH `C:/Windows/System32/OpenSSH/ssh.exe`，并用 `icacls` 收紧私钥 ACL；`publish.ps1` 增加 pull/push 各 3 次重试，`-PushOnly` 先检查工作区是否干净（此前把“未提交改动”误报成网络失败），校验路径被 MSYS 转换时跳过并警告

## 2026-10-24 ｜ 会话 13：把“提醒开 Clash”写进规范

- **背景**：用户说明自己经常忘记挂 Clash（代理），要求 agent 主动提醒并写进文档。
- **改动**
  - `AGENTS.md` 新增「开工检查（每轮第一步，别跳）」：联网任务前先测 `127.0.0.1:7897`；`closed` 先提醒用户启动 Clash 再继续，禁止闷头重试或误判为代码问题；并注明 SSH 推送不走 HTTP 代理
  - `TOOLBOOK.md` 新增 §2.7 代理（Clash Verge）：程序路径、端口、bash/PowerShell 检测命令、四种症状（`000`/超时、DNS 失败、代理开着 git 仍失败、浏览器能开 CLI 不能）
  - `MAINTENANCE.md` 新增 §0.7 代理与联网检查：端口检测、何时提醒、与 SSH 推送无关的边界
- **验证**：文档交叉引用一致（AGENTS → §0.6/§0.7、TOOLBOOK §2.5/§2.7）；未改站点文件，无需重建
- **遗留**：无

## 2026-10-24 ｜ 会话 14：文档一致性返工 + 新增 check-docs.ps1

- **背景**：应要求评估上一轮维护的五份文档。结论：骨架可用（来源分级、可验证数字、隐私边界），但同一事实在多处复述后漂移；文档自己写着“不要互相复制”，实际重复最严重的正是规范本身。
- **发现（均已改）**
  - “旧模板保留作回退”与事实相反：渲染层早已在会话 12 删除，AGENTS 开头、README、MAINTENANCE §0.1/基本信息表、以及“把 `_pages/about.md` 改回 `permalink: /`”这条操作指引全部指向不存在的文件
  - TOOLBOOK §2 仍写“agent 无解，push 交用户终端”，与同文件 §2.5（SSH 已打通）自相矛盾；§4 还写着“agent 只能到 commit”
  - CONTENT §5 的子节编号是 6.1–6.3；来源表 S1/S2 挤在同一行（渲染时 S2 行消失）
  - MAINTENANCE §0.5 排在 §0.7 之后；§4① 写“遵守 §5 的硬性约定”，但 §5 是坑表
  - MAINTENANCE §5 坑表有一行 `assets/css|js|...` 未转义竖线，表格实际渲染成 6 列
  - `scripts/` 还留着模板的 `cv_markdown_to_json.py`、`update_cv_json.sh`（`cv.json` 已删，属死代码）
  - `check-site.ps1` 的泄漏断言名单漏了 `TOOLBOOK.md`
- **改动**
  - 新增 `scripts/check-docs.ps1`：断言标题编号（H2 升序、H3 必须挂在当前 H2 下）、`§x.y` 交叉引用在目标文档中存在、Markdown 表格列数一致、文档头部“最后更新”日期、相对 `.md` 链接可达；ASCII-only，避免 5.1 无 BOM 解析问题
  - `check-site.ps1` 调用 `check-docs.ps1`，并把 `TOOLBOOK.md` 加入泄漏断言与 exclude 断言
  - MAINTENANCE：§0.5 归位到 §0.6 前并改为 H3；加目录表；“回退”统一为“已删除 + `git show 9744940^:<path>` 取回 + 依赖提醒”；§3.2 删除段改指 §0.1；§4① 引用改为工作区 AGENTS 的硬性约定；§1/§3.1 补 `check-docs.ps1`；目录树补该脚本
  - CONTENT：补“最后更新”与复核周期（S2 每学期）；S1/S2 拆成两行；6.1–6.3 → 5.1–5.3
  - TOOLBOOK：修正“agent 无法 push”的过期结论；统一 `Gemfile.lock` 口径（有意不提交，CI 浮动解析）；补 `check-docs.ps1` 命令与“文档改坏了怎么办”症状行
  - README / AGENTS：回退口径改为指向 MAINTENANCE §0.1；AGENTS 收尾自查四项 → 五项（加文档断言）；方案 B 历史条目补“同日后续会话已删除”
  - 删除模板残留 `scripts/cv_markdown_to_json.py`、`scripts/update_cv_json.sh`
- **验证**：`check-docs.ps1` → `PASS: docs ok (6 files)`（改前失败 9 条：编号 3、表格 2、日期 1、引用 3）；`check-site.ps1` → `PASS: 6 html, 5 sitemap urls, no leaks`，构建 0.6s；删除脚本后全仓库无引用（`update_cv_json.sh` 内部引用为自引用）
- **遗留**
  - `AGENTS.md` 与 MAINTENANCE §0.5 的“收尾自查”仍各存一份清单：工作区文件不在仓库内，clone 后需要它，暂不合并；两处都加了第 5 项，靠 check-docs 兜住结构漂移
  - WORKLOG 历史条目里的旧口径（如会话 5“旧布局保留作回退”）按“只加不改”保留，不作追溯修改
