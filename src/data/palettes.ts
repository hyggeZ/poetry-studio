export type Palette = {
  id: string;
  name: string;
  paper: string;
  canvas: string;
  ink: string;
};

// 参考中国传统色的审美自行搭配，名称为本项目的方案名，并非历史色名标准。
// 色彩参考：https://zhongguose.com/ 、https://chinesecoloratlas.com/zh-Hans/palettes
// 纸片沿用左侧纸色，挖空沿用右侧底色，保持“从原文剪下来”的关系。
export const palettes: Palette[] = [
  {
    id: "moon-blue",
    name: "月黄·烟蓝",
    paper: "#F3DFA0",
    canvas: "#52667E",
    ink: "#33382F",
  },
  {
    id: "jade-pine",
    name: "玉白·松绿",
    paper: "#E5E8D5",
    canvas: "#3F6258",
    ink: "#263D34",
  },
  {
    id: "apricot-cinnabar",
    name: "杏纸·朱砂",
    paper: "#F1D9BC",
    canvas: "#934C43",
    ink: "#48342C",
  },
  {
    id: "lotus-plum",
    name: "藕粉·梅紫",
    paper: "#EAD8DD",
    canvas: "#69536C",
    ink: "#463644",
  },
  {
    id: "mist-indigo",
    name: "雾青·靛蓝",
    paper: "#D7E7E5",
    canvas: "#385974",
    ink: "#293E49",
  },
  {
    id: "wheat-tea",
    name: "麦黄·茶褐",
    paper: "#E9D5A7",
    canvas: "#74604E",
    ink: "#40372B",
  },
  {
    id: "pear-moss",
    name: "梨白·苔绿",
    paper: "#ECE8CE",
    canvas: "#626B48",
    ink: "#373E2A",
  },
  {
    id: "snow-ink",
    name: "雪白·墨灰",
    paper: "#E7E4DC",
    canvas: "#484D53",
    ink: "#33383E",
  },
];

export function getPalette(id?: string): Palette {
  return palettes.find((palette) => palette.id === id) ?? palettes[0];
}

// 优先分配尚未使用的方案；文章多于方案数量时再允许重复。
export function choosePalette(used: string[]): string {
  const available = palettes.filter((palette) => !used.includes(palette.id));
  const pool = available.length ? available : palettes;
  return pool[Math.floor(Math.random() * pool.length)].id;
}
