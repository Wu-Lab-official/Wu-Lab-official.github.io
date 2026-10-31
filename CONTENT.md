# 内容来源与核对记录

> 规则：页面上每一句事实都要能在本表找到来源。没有来源的内容写“待补充”，不推测、不用行业惯例补。
> 来源之间冲突时，优先级：**Crossref / 期刊正式记录 > 官方单位主页 > PI 提供的资料**（`信息.txt` 会有笔误）。
> 本文件在 `_config.yml` 的 exclude 列表内，不发布到线上。
> 最后更新：2026-10-31（§4 指向 `MAINTENANCE.md` §9 待办入口；补本地文件私有备份范围；事实无变化）

## 1. 来源清单

> **隐私边界**：本仓库是公开仓库（Pages 免费版要求公开），`信息.txt`、`图片.jpg` 原图、成员照片原图、简历、成员个人联系方式**不要提交进仓库**，只放本机工作区并另做私有备份。仓库里只放核对过的、面向公众的表述；成员邮箱仅在 PI 明确要求公开时写进 `_data/people.yml`（学号、手机号、住址一律不写）。
> **复核周期**：S2 官方主页每学期复核一次；论文元数据在新增或改版时逐条查 Crossref。

| 编号 | 来源 | 位置 | 用途 |
|---|---|---|---|
| S1 | PI 提供的资料 `信息.txt` | 工作区 `D:\wu-lab\信息.txt`（**不在 git 仓库内**，换机/重装会丢）| 导师简介、经历、兼职、项目、荣誉、论文清单 |
| S2 | 清华 SIGS 个人主页 | https://www.sigs.tsinghua.edu.cn/wcj/main.htm | 职称、经历、研究方向表述（2026-10-24 抓取核对）|
| S3 | Crossref API | `https://api.crossref.org/works/{DOI}` | 论文标题、期刊、年卷期、页码、作者顺序（2026-10-24 逐条核对）|
| S4 | 图片 `图片.jpg` | 工作区根目录 | 团队页照片原图（导出为 `assets/minimal/profile.jpg`）|
| S5 | PI 会话提供的成员名单（2026-10-31）| 会话记录 + 工作区 `照片/` | 3 名硕士成员的姓名、身份、清华邮箱、照片原图 |

## 2. 事实登记

| 事实 | 当前值 | 来源 | 核对日期 | 状态 |
|---|---|---|---|---|
| 姓名 | 吴昌进（Changjin Wu）| S1、S2 | 2026-10-24 | 已确认 |
| 职称 | 教研系列助理教授、特别研究员、博士生导师 | S2 | 2026-10-24 | 已确认 |
| 单位 | 清华大学深圳国际研究生院 | S1、S2 | 2026-10-24 | 已确认 |
| 邮箱 | wuchangjin@sz.tsinghua.edu.cn | S1、S2 | 2026-10-24 | 已确认 |
| 办公室 | 深圳 · 能源环境大楼 2107 | S1 | 2026-10-24 | 已确认 |
| 课题组组建年份 | 2026 | S1 工作经历（2026–至今 清华）| 2026-10-24 | 已确认（具体月份未提供，页面只写年份）|
| 论文数量表述 | 20 余篇（含 Nat. Nanotechnol.）| S1 | 2026-10-24 | 已确认；站内代表性论文 15 条，不是全部 |
| 教育经历 5 条 | 港大博士、首尔大学联培、韩国外国语大学硕士、成功大学学士、上海大学学士 | S1、S2 | 2026-10-24 | 已确认 |
| 工作经历 4 条 | 清华（2026–）、香港先进生物医学仪器中心（2025.09–2026.07）、港大机械系（2023.08–2025.08）、港大化学系博后（2021.09–2023.08）| S1、S2 | 2026-10-24 | 已确认 |
| 学术兼职 | The Innovation、Exploration、Nano-Micro Letters、Research 等青年编委 | S1、S2 | 2026-10-24 | 已确认（页面只列 4 个，S1 另有 4 个未列出）|
| 职务称谓 | 香港先进生物医学仪器中心研究助理教授、首席科学家；香港大学工学院/机械工程系研究助理教授 | S1、S2 | 2026-10-24 | 已确认（页面按 S1 概括）|
| 媒体报告 | Nature、人民日报、新华网等学术刊物和媒体的专题评述/报道 | S1 | 2026-10-24 | 已确认（页面用“等”概括）|
| 学术兼职（补充）| The Innovation、Exploration、Nano-Micro Letters、Research 青年编委及特刊编辑 | S1、S2 | 2026-10-24 | 已确认（“特刊编辑”见 S1）|
| 应用方向 | 微创诊疗、靶向药物递送、材料自组装、可穿戴器件、环境清理 | S1 | 2026-10-24 | 已确认 |
| 研究方向 5 条 | 微纳机器人 / 智能软物质 / 微流控与器件 / 外场操控 / 颗粒与自组装 | S1 §研究领域 | 2026-10-24 | 已确认 |
| 团队照片 | `assets/minimal/profile.jpg`（400×599，2:3 不裁切）| S4 | 2026-10-24 | 已确认 |
| 成员名单 | 邱文浩、张芸科、周奕衡，均为硕士研究生（按拼音升序展示，导师在页面 PI 区块置顶）| S5 | 2026-10-31 | 已确认（入学年份、研究方向未提供，页面不写）|
| 成员邮箱 | qiu-wh26@ / yk-zhang26@ / zhouyihe22@ `mails.tsinghua.edu.cn` | S5 | 2026-10-31 | 已确认（PI 指定公开展示）|
| 成员照片 | `assets/minimal/people/qiuwenhao.jpg`、`zhangyunke.jpg`、`zhouyihe.jpg`（480×640，3:4，去 EXIF）| S5 | 2026-10-31 | 已确认（原图只在工作区 `照片/`）|

## 3. 论文核对（15 条，全部经 Crossref）

| # | 年份 | 标题（简）| DOI | 核对结果 |
|---|---|---|---|---|
| 1 | 2025 | Chemically induced ferroic-like phase… | 10.1021/jacs.5c10021 | 一致（147(44), 40225–40235）|
| 2 | 2025 | CeyeHao: AI-driven microfluidic flow programming… | 10.1126/sciadv.adx2826 | 一致（11(31), eadx2826）|
| 3 | 2025 | Photothermal cavitation-driven micromotor… | 10.1021/jacs.5c00482 | 一致（147(10), 8906–8916）|
| 4 | 2025 | Micro/nanomotors from single modal to multimodal propulsion | 10.26599/nr.2025.94907105 | **年份由 2024 改为 2025**；标题补全 |
| 5 | 2024 | Scalable integration of photoresponsive… nanochannels… | 10.1126/sciadv.ads5591 | 一致（10(51), eads5591）|
| 6 | 2024 | Dynamic polymorphic active colloidal assembly… | 10.1016/j.matt.2024.06.022 | 一致（7(10), 3554–3566）|
| 7 | 2024 | Magnetically manipulated optoelectronic **hybrid** microrobots… | 10.1002/adma.202305632 | **标题补 “Hybrid”**；年份按印刷版 2024（online 2023）|
| 8 | 2024 | Template-guided silicon micromotor assembly… | 10.1002/anie.202405895 | 一致（63(28), e202405895）|
| 9 | 2024 | Colloidal self-assembly: from passive to active **systems** | 10.1002/anie.202313885 | **标题复数**；年份按印刷版 2024（online 2023）|
| 10 | 2023 | Photochromism from wavelength-selective colloidal phase segregation | 10.1038/s41586-023-05873-4 | 一致（617(7961), 499–506）|
| 11 | 2023 | Tunable self-thermophoretic nanomotors with polymeric coating | 10.1021/jacs.3c06322 | **标题按正式记录**（旧标题 “Polymeric coating…” 为预印/早期名）；页码补全 19945–19952 |
| 12 | 2022 | Self-driven magnetorobots for recyclable and scalable micro/nanoplastic removal… | 10.1126/sciadv.ade1731 | **卷页改为 8(45), eade1731**（原写 “8, 1731”）|
| 13 | 2021 | Ion-exchange enabled synthetic swarm | 10.1038/s41565-020-00825-9 | 一致（16(3), 288–295，补期号）|
| 14 | 2021 | Self-rectifying resistance switching memory… | 10.1088/1361-6528/abc782 | 一致（32(8), 085203；Crossref 在线年 2020，按卷期年 2021）|
| 15 | 2017 | Effect of internal field on the high resistance state retention… | 10.1063/1.4979598 | **文章号改为 143502**（原写 14350）|

**字段状态**：`_data/publications.yml` 已支持可选 `doi`/`pdf` 字段，当前 15 条都未填值；填之前先查 Crossref 或期刊页。

### 与 `信息.txt` 的差异（已按 Crossref 修正）

1. Nano Research 那条：S1 写 2024，实际卷 18(7) 为 2025 年。
2. APL 那条：S1 写 14350，实际文章号 143502。
3. Angew 综述：S1 写 2023，印刷版为 2024、63(9)。
4. 三处标题：Adv. Mater. 缺 “Hybrid”；Angew 综述 “System” 应为 “Systems”；Nano Research 标题为 “Micro/nanomotors from single modal to multimodal propulsion”。
5. Sci. Adv. 2022 那条：S1 写 “8: 1731”，规范写法是 8(45), eade1731。

## 4. 待补清单（需要 PI 或本人提供）

> 本节只列**内容类**缺项。含仓库设置、域名、文档重构在内的完整待办，只有一个入口：[MAINTENANCE.md](MAINTENANCE.md) §9。

| 项 | 缺什么 | 谁提供 |
|---|---|---|
| 成员 | 3 名硕士已有姓名/身份（硕士研究生）/清华邮箱/照片；仍缺入学年份、研究方向（写 `note`），以及后续新增成员的资料 | PI / 本人 |
| 校友 | 去向、毕业年份 | PI |
| 论文 | DOI 值、PDF（放 `files/`，需先新建目录）、BibTeX、完整作者列表；`publications.yml` 的 `doi`/`pdf` 字段已支持 | PI / 逐篇补 |
| 招生 | 名额、申请流程、截止日期、待遇、联合培养政策；页面目前只写“博士后/博士/硕士”类别，类别本身也需书面确认 | 学院通知 / PI |
| 学术主页 | Google Scholar、ORCID、ResearchGate | PI |
| 新闻 | 组内动态、获奖、参会 | PI |
| 基金 | 项目编号与经费（一般不公开）| PI |
| 本地备份 | `信息.txt`、`图片.jpg`、`照片/` 原图、工作区 `AGENTS.md`（四者都不在仓库内）| 用户 |

## 5. 隐私边界：哪些在本地、哪些会上传、哪些不能推

**前提**：仓库是**公开**的（GitHub Pages 免费版要求公开仓库），`git push` 即公开，历史记录很难彻底清除。`_config.yml` 的 exclude 只控制“构建时不复制到 `_site`”，**不控制仓库可见性**，两者不要混为一谈。

### 5.1 文件在哪

| 位置 | 内容 | 是否公开 |
|---|---|---|
| 只在本地工作区 `D:\wu-lab`（不进 git）| `信息.txt`、`图片.jpg`、`照片/`（成员照片原图）、`_design/`、`AGENTS.md`、`.commitmsg`、`_site/`、`.dsh*/`、`.zcode/` | 否 |
| 进仓库但不上线（exclude 或下划线开头）| `MAINTENANCE.md`、`CONTENT.md`、`TOOLBOOK.md`、`WORKLOG.md`、`README.md`、`scripts/`、`_config.yml`、`_data/`、`_layouts/`、`_includes/`、`Gemfile` | **是（可被 clone）**，但不出现在网站上 |
| 进仓库并上线（任何人可访问）| `_pages/` 生成的页面（当前 5 个 + 404）、`assets/minimal/`、`favicon.ico`、`robots.txt`、`sitemap.xml`、`files/`（有 PDF 时）| **是** |
| 已公开的个人信息 | `assets/minimal/profile.jpg`（导师照片）、`assets/minimal/people/*.jpg`（成员照片）、`_config.yml` 中的姓名/邮箱/单位、`_data/people.yml` 中的成员姓名与清华邮箱 | 是，属团队页展示用途，PI 已知并指定 |

> `feed.xml`/`redirects.json` 只在本地 `bundle exec` 构建时出现，线上是 404，不属于发布内容。

### 5.2 绝对不能提交（公开仓库）

- 私钥、访问 token、密码、`.env`、含凭据的 `git remote` URL
- 简历原文（`信息.txt`）、身份证/学号/手机号/住址、未公开的联系方式
- 成员个人信息：学号、手机号、住址、身份证、成绩单一律不写；姓名与清华邮箱仅在 PI 明确要求公开时写进 `_data/people.yml`
- 原始照片、未经压缩/裁切的大图（要上线就导出成展示尺寸再放 `assets/minimal/`）
- 未公开的经费金额、合作方合同、内部沟通记录

### 5.3 提交前检查

1. `git status` 看新增文件，确认没有上面这些；
2. `git ls-files | grep -iE '信息|图片|简历|token|secret|\.env|id_rsa|\.pem'` 应为空；
3. 跑 `scripts/check-site.ps1`，确认线上页面与 `_pages` 声明一致（当前 5 个）、没有内部文件；
4. 需要备份 `信息.txt`/`图片.jpg` 时，放私有网盘或加密压缩包，不要进仓库。

## 6. 维护约定

- 新增论文：先在 Crossref 查 DOI，再写 `_data/publications.yml`，并在本表 §3 追加一行。
- 论文只维护在 `_data/publications.yml`；`_data/research.yml` 用 `paper_ids` 引用，不复制标题。
- 方向标签只用 `_data/research.yml` 的 `id`（`microrobot` / `soft-matter` / `microfluidics` / `field` / `assembly`），不要另造缩写。
- 每次改动事实，更新本表对应行的“核对日期”。
- 本表自身不发布；线上只出现核对过的值。
- 提交前确认没有把简历原文、原始照片、身份证/学号/电话等个人资料带进仓库（仓库公开）。
