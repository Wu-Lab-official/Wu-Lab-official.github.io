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
