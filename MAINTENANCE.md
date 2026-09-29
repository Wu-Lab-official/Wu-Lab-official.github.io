# Wu-Lab 课题组网站维护手册

> 基于 [AcademicPages](https://academicpages.github.io) 模板（Jekyll 静态站点）+ GitHub Pages 托管
> 参考教程：[Building an Academic Website — Rob Williams](https://jayrobwilliams.com/posts/2020/06/academic-website/)
> 本文档最后更新：2026-09-29（环境搭建 & 可行性验证完成日）

---

## 0. 基本信息

| 项目 | 值 |
|---|---|
| 线上地址 | https://john-z39.github.io |
| 仓库 | `John-z39/John-z39.github.io`（本地：`D:\wu-lab\John-z39.github.io`）|
| 默认分支 | `main`（2026-09-29 由 master 改名，旧 master 已删除）|
| 模板 | academicpages.github.io v0.9.x（Minimal Mistakes 主题分支）|
| Jekyll | 3.10.0（由 `github-pages` gem 锁定，与 GitHub Pages 线上一致）|
| 部署方式 | push 到 main → GitHub Pages 自动构建（无需本地构建上传）|

## 1. 快速命令速查

```bash
# —— 本地预览（旧终端窗口需先补 PATH，新开的终端不用）——
export PATH="/c/Ruby33-x64/bin:$PATH"
cd /d/wu-lab/John-z39.github.io
bundle exec jekyll serve          # 预览 http://127.0.0.1:4000，Ctrl+C 停止
bundle exec jekyll build --strict_front_matter   # 与 CI 相同参数的纯构建测试

# —— 推送上线（需代理，见 §5）——
git -c http.proxy=http://127.0.0.1:7897 add -A
git -c http.proxy=http://127.0.0.1:7897 commit -m "说明"
git -c http.proxy=http://127.0.0.1:7897 push
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
| Python | 已装 | 仅 `talkmap` 和 `markdown_generator` 脚本需要，可选 |
| 代理 | Clash Verge | `D:\Clash Verge\clash-verge.exe`，混合端口 `127.0.0.1:7897` |

新机器完整流程：装 Ruby（含 Devkit）→ `git clone https://github.com/John-z39/John-z39.github.io.git` → `bundle install` → `bundle exec jekyll serve`。Gemfile 已含 `tzinfo-data`（Windows 必需，见 §5），无需再改。

## 3. 目录结构（改内容看这里）

```
├── _config.yml            ★ 全站配置：标题、作者侧边栏、主题色、url 等
├── MAINTENANCE.md         本手册（已 exclude，不发布）
├── WORKLOG.md             ★ 工作日志，每轮改动必留痕（已 exclude，不发布）
├── _data/
│   ├── navigation.yml     ★ 顶部导航菜单（顺序、名称、链接）
│   ├── cv.json            CV 结构化数据（配合 cv-json 页）
│   └── ui-text.yml        界面文字（多语言，一般不动）
├── _pages/                ★ 所有页面的正文 Markdown
│   ├── about.md           首页/关于（个人或课题组简介）
│   ├── cv.md              CV 页
│   ├── publications.html  论文列表页（一般只改 _publications 内容）
│   └── ...
├── _publications/         每篇论文一个 .md（论文页数据源）
├── _portfolio/            研究项目/Portfolio 条目
├── _posts/                博客文章（文件名必须是 YYYY-MM-DD-标题.md）
├── _talks/                报告/讲座条目
├── _teaching/             课程条目
├── images/                ★ 图片（profile.png = 侧边栏头像，建议 300×300）
├── files/                 附件（论文 PDF 等放这里，页面里用 /files/xxx.pdf 引用）
├── markdown_generator/    从 BibTeX/PubMed 批量生成论文条目的 Python 脚本（可选）
└── assets/                主题 JS/CSS（一般不动）
```

### 常见维护任务

| 想做什么 | 改哪里 |
|---|---|
| 侧边栏头像/姓名/邮箱/单位 | `_config.yml` 的 `author:` 区块；头像替换 `images/profile.png` |
| 侧边栏学术链接（Google Scholar/ORCID/GitHub 等）| `_config.yml` 的 `author:` 区块，留空则不显示图标 |
| 导航菜单增删/改名/排序 | `_data/navigation.yml` |
| 网站标题/描述/主题配色 | `_config.yml` 的 `title` / `description` / `site_theme`（可选 default/air/sunrise/mint/dirt/contrast）|
| 首页内容 | `_pages/about.md` |
| 发论文 | `_publications/` 复制现有条目改内容（或用 markdown_generator 脚本批量生成），PDF 放 `files/` |
| 发动态/博客 | `_posts/` 新建 `YYYY-MM-DD-标题.md` |
| CV | `_pages/cv.md`（Markdown 版）或 `_data/cv.json`（JSON 版，导航二选一）|
| 改某个页面的正文 | `_pages/` 下对应 .md 文件 |

### 清理模板示例内容（下一阶段做内容时要做的）

`_posts`、`_publications`、`_portfolio`、`_talks`、`_teaching`、`markdown_generator`、`talkmap*` 里全是模板演示数据，填充真实内容前可整目录清空（保留子目录结构）。`_data/comments/` 是示例评论，可删。

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

### ③ 推送上线（本地确认后自动执行）
```bash
# 0) 确认代理可用（不通则先启动 D:\Clash Verge\clash-verge.exe）
(echo > /dev/tcp/127.0.0.1/7897) 2>/dev/null && echo proxy OK
# 1) 暂存具体文件（别盲目 add -A）
git add 路径/文件.md
# 2) 提交，信息格式 <type>: 摘要，type ∈ content/feat/fix/docs/chore
git commit -m "content: 更新课题组简介"
# 3) 经代理推送
git -c http.proxy=http://127.0.0.1:7897 push
# 4) 等 60–90 秒后验证线上
curl -s -o /dev/null -w "%{http_code}\n" -x http://127.0.0.1:7897 https://john-z39.github.io/改动页面/
```
- 也可一劳永逸给 git 配置代理（配置后 push 不用再加 `-c` 参数）：
  `git config --global http.proxy http://127.0.0.1:7897`
  取消：`git config --global --unset http.proxy`

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
- 仓库自带 CI 工作流 `.github/workflows/jekyll-build.yml`（Ruby 3.2 + `--strict_front_matter` 构建检查，只监听 `main`）

## 5. 已知冲突与坑（重要）

| 问题 | 原因 | 解决 |
|---|---|---|
| 敲 `jekyll` 报错/跳商店 | WindowsApps 有 535 字节的假 `jekyll` 占位 stub | 一律用 `bundle exec jekyll`；根治：设置 → 应用 → 应用执行别名 → 关闭 jekyll |
| 构建报 `TZInfo::DataSourceNotFound` | Windows 没有系统时区库，`_config.yml` 又设了 `timezone: Etc/UTC` | 已在 Gemfile 加 `gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]`（Linux CI 不受影响），勿删 |
| git push 报 `Could not resolve host: github.com` | 国内网络直连 GitHub 被重置 | 启动 Clash Verge（`D:\Clash Verge\clash-verge.exe`），然后用 `git -c http.proxy=http://127.0.0.1:7897 push`（或给 git 全局配置代理）|
| `bundle install` 时 `jekyll` 与 `github-pages` 版本疑虑 | Gemfile 同时写了两者 | 正常现象，Bundler 会统一解析到 3.10.x，不用管 |
| 新终端找不到 ruby/bundle | Ruby 安装晚于终端/宿主进程启动 | 新开终端即可；旧会话先 `export PATH="/c/Ruby33-x64/bin:$PATH"` |
| 改了 `_config.yml` 预览没变化 | 配置文件不热加载 | Ctrl+C 停掉 serve 再重启 |

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
- **样式丢失**：确认 `assets/css/main.css` 能访问（主题样式是编译产物，别手改 `_sass` 之外的地方）
- **推送后线上没更新**：Actions 页看构建是否失败；或确认推的是 `main`（其他分支不部署）
- **彻底重来**：删掉 `_site/` 目录重新 `bundle exec jekyll serve`

## 7. 参考链接

- 教程原文：https://jayrobwilliams.com/posts/2020/06/academic-website/
- 模板官方文档（含各板块详细说明）：https://academicpages.github.io
- 模板仓库 wiki（FAQ 很多）：https://github.com/academicpages/academicpages.github.io/wiki
- GitHub Pages 文档：https://docs.github.com/pages
