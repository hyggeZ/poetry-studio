import type { NextConfig } from "next";

const isPages = process.env.GITHUB_PAGES === "true";

const config: NextConfig = {
  // 本地保留常规开发方式，发布时导出到 GitHub Pages 的仓库子目录。
  output: isPages ? "export" : undefined,
  basePath: isPages ? "/poetry-studio" : "",
  trailingSlash: true,
};

export default config;
