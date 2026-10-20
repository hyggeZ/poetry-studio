import { localFonts } from "@/data/fonts";
import "./preview.css";

const candidates = [
  {
    name: "霞鹜文楷 TC",
    family: "LXGW WenKai TC",
    description: "清秀、舒展，适合原文和诗句。",
    source: "https://github.com/lxgw/LxgwWenkaiTC",
  },
  {
    name: "马善政毛笔楷体",
    family: "Ma Shan Zheng",
    description: "笔墨浓厚，适合有力量的短诗。",
    source: "https://github.com/googlefonts/mashanzheng",
  },
  {
    name: "站酷小薇体",
    family: "ZCOOL XiaoWei",
    description: "有雕刻感的宋体，适合复古纸片。",
    source: "https://github.com/google/fonts/tree/main/ofl/zcoolxiaowei",
  },
  {
    name: "龙藏体",
    family: "Long Cang",
    description: "随性手写，有草稿和信笺的感觉。",
    source: "https://github.com/google/fonts/tree/main/ofl/longcang",
  },
];

export default function FontsPage() {
  return (
    <main className="font-preview">
      <a href="/">← 返回拾字成诗</a>
      <h1>挑一种文字的模样</h1>
      <p>
        以下四款为免费开源字体候选。这里只加载样例字形，尚未安装到系统字体库。
      </p>
      <section className="font-grid">
        {candidates.map((font, index) => (
          <article className="font-card" key={font.family}>
            <header>
              <h2>
                {String(index + 1).padStart(2, "0")} / {font.name}
              </h2>
              <a href={font.source} target="_blank" rel="noreferrer">
                来源与授权 ↗
              </a>
            </header>
            <div
              className="font-sample"
              style={{ fontFamily: `"${font.family}", serif` }}
            >
              清风徐来，水波不兴。
              <br />
              抱明月而长终。
            </div>
            <p>{font.description}</p>
          </article>
        ))}
      </section>
      <h2 className="local-font-title">本机已有 · 可在创作页直接切换</h2>
      <section className="font-grid">
        {localFonts.map((font) => (
          <article className="font-card local-font-card" key={font.family}>
            <h2>{font.name}</h2>
            <div
              className="font-sample"
              style={{ fontFamily: `"${font.family}", serif` }}
            >
              清风徐来，水波不兴。
              <br />
              抱明月而长终。
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
