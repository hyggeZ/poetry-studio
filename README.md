# 拾字成诗

从古诗文或自定义文章中拾取文字，重新排列成自己的诗。

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

- 切换五篇内置古诗文，或新增自定义文章；标题和作者可留空，正文最多 5000 字符。
- 点击原文取字，双击纸片归还。
- 整齐排列支持拖动排序、换行；自由摆放支持鼠标或触屏拖动、方向键微调。
- 支持撤销、清空；每篇文章独立保存草稿、排列模式和自由坐标。
- 导出 PNG 可选左右完整作品或仅右侧诗作；完整作品包含全部原文，不包含界面控件。
- 原文可独立滚动，滚动条仅在滚动时显示；顶栏字体选择同时应用于原文和纸片。
- `/fonts` 查看本机字体及四款开源候选的字形对比；候选仅提供样例字形，未安装至系统。
- 本地字体依赖浏览设备已安装对应字体，缺失时回退到宋体或系统衬线字体。

## 工作文件树

```text
poetry-studio/
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
│   │   └── article-editor.tsx  # 自定义文章表单
│   ├── data/
│   │   ├── articles.ts        # 内置文章与正文分字
│   │   ├── chibi.ts           # 赤壁赋与初始示例
│   │   └── fonts.ts           # 本机字体选项
│   └── lib/
│       ├── studio.ts          # 草稿结构与存储校验
│       └── export-image.ts    # 作品图片绘制
├── package.json
├── package-lock.json
└── tsconfig.json
```
