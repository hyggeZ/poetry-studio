# 拾字成诗

从古诗文、现代诗或自定义文章中拾取文字，重新排列成自己的诗。

[打开网页](https://hyggez.github.io/poetry-studio/)

## 技术

Next.js App Router、React、TypeScript、CSS。草稿使用 localStorage 保存。

## 快速开始

```bash
npm install
npm run dev
```

打开 http://127.0.0.1:3000 。

```bash
npm run build  # 构建
npm start      # 启动生产服务
```

## 怎么用

- 从紧贴窗口左侧、贯通顶栏下方的连续文章列表切换古诗文，首项可新增自定义文章；标题和作者可留空，正文最多 5000 字符。
- 点击原文取字，双击纸片归还。
- 整齐排列支持拖动排序，点击行尾淡色符号或按 Enter 换行；自由摆放支持鼠标或触屏拖动、方向键微调。
- 内置二十组成套配色，每篇文章随机分配一次并保留，自定义文章同样适用；纸片、原文留空和预览图片同步配色。
- 每篇文章独立保存草稿、排列模式和自由坐标；模式与预览按钮放在画布上方。
- 点击工具栏「预览」，在弹窗切换「仅右侧」或「左右两侧」，再点击「保存图片」下载 PNG；图片不包含界面控件，左右两侧模式包含全部原文。
- 原文可独立滚动，滚动条仅在滚动时显示；顶栏字体选择同时应用于原文和纸片。
- `/fonts` 查看本机字体及四款开源候选的字形对比；候选仅提供样例字形，未安装至系统。
- 本地字体依赖浏览设备已安装对应字体，缺失时回退到宋体或系统衬线字体。
- 内置《再别康桥》《偶然》《雨巷》《教我如何不想她》《死水》等现代诗，原文来源见 [诗作来源](docs/poem-sources.md)。
- 自定义文章、草稿和配色仅保存在当前浏览器；刷新或再次访问会恢复，不会上传到 GitHub。更换设备、浏览器或网址不会同步，清除网站数据会删除存档。

## 静态部署

GitHub Pages 使用 GitHub Actions 发布，推送到 `develop` 后自动构建并上线。仓库 Settings → Pages 的 Source 选择 GitHub Actions。

本地生成与线上相同的静态文件（PowerShell）：

```powershell
$env:GITHUB_PAGES = "true"
npm run build
Remove-Item Env:GITHUB_PAGES
```

产物位于 `out/`，部署路径为 `/poetry-studio/`。静态站无需后端或数据库，支持自定义文字、拖动排版、图片预览与下载。

## 工作文件树

```text
poetry-studio/
├── .github/workflows/pages.yml # 自动发布
├── docs/poem-sources.md        # 现代诗来源
├── public/font-previews/        # 候选字体样例与授权
├── src/
│   ├── app/
│   │   ├── fonts/              # 字体对比页
│   │   ├── globals.css         # 全局样式与响应式布局
│   │   ├── layout.tsx          # 页面布局
│   │   └── page.tsx            # 首页
│   ├── components/
│   │   ├── poetry-studio.tsx   # 创作台与草稿管理
│   │   ├── poem-canvas.tsx     # 排列、自由拖动和归还
│   │   ├── article-editor.tsx  # 自定义文章表单
│   │   └── image-preview.tsx   # 图片预览、范围切换与保存
│   ├── data/
│   │   ├── articles.ts        # 内置文章与正文分字
│   │   ├── modern-poems.ts    # 公版现代诗
│   │   ├── chibi.ts           # 赤壁赋与初始示例
│   │   ├── fonts.ts           # 本机字体选项
│   │   └── palettes.ts        # 成套配色与随机分配
│   └── lib/
│       ├── studio.ts          # 草稿结构与存储校验
│       └── export-image.ts    # 作品图片绘制
├── package.json
├── package-lock.json
├── next.config.ts             # 静态导出与部署路径
└── tsconfig.json
```
