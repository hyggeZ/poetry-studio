# 拾字成诗

从《赤壁赋》中拾取文字，重新排列成自己的诗。

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

- 点击原文取字，双击纸片归还。
- 拖动排序，也可点击纸片后前移、后移，支持方向键操作。
- 支持换行、撤销、清空、复制和本地草稿保存。
- 原文可独立滚动，字体选择同时应用于原文和纸片。
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
│   │   └── poetry-studio.tsx   # 取字与组诗交互
│   └── data/
│       ├── chibi.ts            # 原文与示例
│       └── fonts.ts            # 本机字体选项
├── package.json
├── package-lock.json
└── tsconfig.json
```
