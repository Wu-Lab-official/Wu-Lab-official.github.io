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
  - 新增 `_data/research.yml`（5 个方向）、`publications.yml`（15 篇）、`news.yml`（首页动态）；`navigation.yml` 改为中文 4 项
  - 新增 `assets/minimal/{style.css,app.js,profile.jpg,favicon.svg}`
  - `_pages/about.md` 设为 `published: false`，旧首页退场；旧 AcademicPages 布局/样式保留作回退
  - `README.md` 增加项目说明；`MAINTENANCE.md` 增加 §0.1 当前极简主题架构和 §3.1 维护对照表
- **验证**：`bundle exec jekyll build --strict_front_matter` 通过；本地 5 页 + CSS/JS/照片均 200；桌面截图确认首页、论文、团队页；筛选/搜索/引用沿用已验证的 `assets/minimal/app.js`
- **遗留**：线上 Pages 需要确认 Source = main / (root)；旧模板示例数据（`_posts`/`_publications` 等）尚未清理；成员、照片、DOI/PDF、招生细节待补
