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
- **遗留**：本次提交需用户在自己终端 `git push origin main`；旧模板 demo 页仍在线；内容来源登记表、站点检查脚本未做
