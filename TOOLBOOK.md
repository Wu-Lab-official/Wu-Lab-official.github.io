# 工具与踩坑手册

> 本文件记录**本机实际能用的命令**和**已经踩过的坑**，目的是少走弯路：动手前扫一眼症状表，别重复报错。
> 最后更新：2026-10-24（建立；汇总 2026-09 ～ 2026-10 的实战问题）
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
| `cannot create standard input pipe for git-credential-helper-selector: Permission denied` | 沙箱拦 git 调凭据助手的子进程管道 | **agent 无解**，push 交用户终端；不要改写 remote/换 SSH 重试 |
| `.ps1` 报“语句块或类型定义中缺少右 }” | 文件无 BOM，5.1 按 GBK 解析 | 重新保存为 UTF-8 with BOM（`head -c 3` 应为 `ef bb bf`）|

原则：**不绕过沙箱**（别用 pwsh 重试被 bash 拒绝的操作）；一次审批只对一条命令有效。

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
| `Could not read from remote repository` / `Host key verification failed` | 代理/网络/首次连 SSH | 先直连试；不要改 remote 地址 |

## 4. 常用命令速查

```bash
# 构建（最常用，报错信息完整）
export PATH="/c/Ruby33-x64/bin:$PATH"
cd /d/wu-lab/John-z39.github.io
bundle exec jekyll build --strict_front_matter

# 本地预览（改 _config.yml 后必须重启）
bundle exec jekyll serve --port 4001

# 完整性检查：清 _site + 构建 + 7 项断言
powershell -ExecutionPolicy Bypass -File scripts\check-site.ps1

# 发布（你自己终端里跑；agent 只能到 commit）
powershell -ExecutionPolicy Bypass -File scripts\publish.ps1 -Message "content: 说明" -Paths 路径1,路径2
powershell -ExecutionPolicy Bypass -File scripts\publish.ps1 -PushOnly -SkipVerify   # 只补推

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
- 不要提交：`_site/`、`.sass-cache/`、`Gemfile.lock`（已在 `.gitignore`）
