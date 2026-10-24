# 吴昌进课题组网站

清华大学深圳国际研究生院吴昌进课题组的官方网站。

- 线上：https://wu-lab-official.github.io/
- 状态：内部建设阶段，尚未绑定正式域名
- 技术：Jekyll 3.10（`github-pages` gem）+ 自建极简主题，GitHub Pages 部署
- 页面：首页 `/`、研究方向 `/research/`、论文 `/publications/`、团队 `/people/`、加入我们 `/join/`、404

## 目录

| 路径 | 作用 |
|---|---|
| `_pages/` | 6 个页面（`home`、`research`、`publications`、`people`、`join`、`404`）|
| `_data/research.yml` | 5 个研究方向；`paper_ids` 引用论文 |
| `_data/publications.yml` | 代表性论文（唯一数据源）|
| `_data/news.yml` | 首页动态与“最近更新”日期 |
| `_layouts/minimal.html`、`_includes/minimal/` | 极简主题骨架 |
| `assets/minimal/` | 样式、脚本、照片、图标 |
| `scripts/publish.ps1` | 构建 → 提交 → 推送 → 线上校验 |

旧 AcademicPages 布局（`_layouts/default.html`、`_sass/`、`assets/css/main.css`）保留作回退，新页面不使用；模板示例内容已清理。

## 文档

- [MAINTENANCE.md](MAINTENANCE.md)：怎么改、在哪改、发布、故障排查
- [CONTENT.md](CONTENT.md)：内容来源登记、论文核对记录、待补清单
- [WORKLOG.md](WORKLOG.md)：历次改动记录

## 本地预览与发布

```bash
export PATH="/c/Ruby33-x64/bin:$PATH"
bundle exec jekyll serve          # http://127.0.0.1:4000
```

```powershell
powershell -ExecutionPolicy Bypass -File scripts\publish.ps1 -Message "content: 说明" -Paths 改动文件
```

## 模板归属

基于 [Academic Pages](https://academicpages.github.io)（MIT License，见 [LICENSE](LICENSE)），已改造为中文极简主题。
