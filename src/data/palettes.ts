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
  {
    id: "peach-vermilion",
    name: "桃绢·绛红",
    paper: "#F2D3CC",
    canvas: "#8B3E48",
    ink: "#4A2931",
  },
  {
    id: "celadon-sea",
    name: "青瓷·深海",
    paper: "#CFE5D9",
    canvas: "#285E68",
    ink: "#24413C",
  },
  {
    id: "lilac-grape",
    name: "丁香·葡紫",
    paper: "#DDD6EB",
    canvas: "#59466F",
    ink: "#3B304B",
  },
  {
    id: "cream-cobalt",
    name: "乳白·群青",
    paper: "#F1E7CE",
    canvas: "#3E527F",
    ink: "#323C4F",
  },
  {
    id: "gold-peacock",
    name: "浅金·孔雀",
    paper: "#EED595",
    canvas: "#28686A",
    ink: "#343D2E",
  },
  {
    id: "rose-olive",
    name: "蔷薇·橄榄",
    paper: "#E9CED3",
    canvas: "#626A45",
    ink: "#3F3734",
  },
  {
    id: "ice-terracotta",
    name: "冰青·陶赭",
    paper: "#D4E4E6",
    canvas: "#9A5B43",
    ink: "#334349",
  },
  {
    id: "sand-aubergine",
    name: "沙杏·茄紫",
    paper: "#E9CFAC",
    canvas: "#604355",
    ink: "#413034",
  },
  {
    id: "mint-forest",
    name: "薄荷·深林",
    paper: "#DDE8BE",
    canvas: "#3D5C49",
    ink: "#31412B",
  },
  {
    id: "cloud-dusk",
    name: "云灰·暮蓝",
    paper: "#DBDFE8",
    canvas: "#4D5B75",
    ink: "#303A4B",
  },
  {
    id: "coral-cocoa",
    name: "珊瑚·可可",
    paper: "#F0C7B4",
    canvas: "#684A43",
    ink: "#472F29",
  },
  {
    id: "rice-rust",
    name: "米白·铁锈",
    paper: "#EEE6D5",
    canvas: "#8B584B",
    ink: "#42362E",
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
