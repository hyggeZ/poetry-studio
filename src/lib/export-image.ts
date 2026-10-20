import { type Palette } from "@/data/palettes";
import { type Article, splitArticle } from "@/data/articles";

type Tile = {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
};

// 只绘制作品数据和纸片，不截取操作界面；全文导出不受左侧滚动位置影响。
export async function createImage(
  article: Article,
  selected: Set<string>,
  font: string,
  poem: HTMLElement,
  scope: "full" | "poem",
  palette: Palette,
) {
  await document.fonts.ready;
  const readingFont = `"${font}", "SimSun", serif`;
  const bounds = poem.getBoundingClientRect();
  const tiles: Tile[] = Array.from(
    poem.querySelectorAll<HTMLElement>(".poem-tile"),
  ).map((tile) => ({
    text: tile.textContent ?? "",
    x: tile.offsetLeft,
    y: tile.offsetTop,
    width: tile.offsetWidth,
    height: tile.offsetHeight,
    angle: Number(tile.dataset.tilt ?? 0),
  }));
  const rightWidth = Math.max(280, bounds.width);
  const rightHeight = Math.max(
    420,
    poem.scrollHeight,
    ...tiles.map((tile) => tile.y + tile.height + 16),
  );
  const leftWidth = 700,
    padding = 40,
    fontSize = 24,
    lineHeight = 43;
  const columns = Math.floor((leftWidth - padding * 2) / fontSize);
  const lines: { text: string; id: string }[][] = [];
  for (const paragraph of splitArticle(article.body)) {
    if (!paragraph.length) {
      lines.push([]);
      continue;
    }
    for (let index = 0; index < paragraph.length; index += columns)
      lines.push(paragraph.slice(index, index + columns));
    lines.push([]);
  }
  const headingHeight = (article.title ? 52 : 0) + (article.author ? 32 : 0);
  const leftHeight = padding * 2 + headingHeight + lines.length * lineHeight;
  const rightScale = 520 / rightWidth;
  const width = scope === "full" ? leftWidth + 600 : 600;
  const height = Math.max(
    scope === "full" ? leftHeight : 0,
    rightHeight * rightScale + 80,
  );
  // 控制像素总量，长正文也能导出，避免超出浏览器画布尺寸限制。
  const resolution = Math.min(
    2,
    16000 / height,
    Math.sqrt(24_000_000 / (width * height)),
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width * resolution);
  canvas.height = Math.ceil(height * resolution);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("浏览器不支持图片绘制");
  context.scale(resolution, resolution);
  context.fillStyle = palette.canvas;
  context.fillRect(0, 0, width, height);
  if (scope === "full") {
    context.fillStyle = palette.paper;
    context.fillRect(0, 0, leftWidth, height);
    context.fillStyle = palette.ink;
    let y = padding;
    context.textBaseline = "top";
    if (article.title) {
      context.font = `30px ${readingFont}`;
      context.fillText(article.title, padding, y, leftWidth - 80);
      y += 52;
    }
    if (article.author) {
      context.font = `17px ${readingFont}`;
      context.fillText(article.author, padding, y, leftWidth - 80);
      y += 32;
    }
    context.font = `${fontSize}px ${readingFont}`;
    for (const line of lines) {
      line.forEach((letter, index) => {
        const x = padding + index * fontSize;
        if (selected.has(letter.id)) {
          context.fillStyle = palette.canvas;
          context.fillRect(x, y, fontSize, fontSize + 3);
        } else {
          context.fillStyle = palette.ink;
          context.fillText(letter.text, x, y);
        }
      });
      y += lineHeight;
    }
  }
  context.save();
  context.translate((scope === "full" ? leftWidth : 0) + 40, 40);
  context.scale(rightScale, rightScale);
  for (const tile of tiles) {
    context.save();
    context.translate(tile.x + tile.width / 2, tile.y + tile.height / 2);
    context.rotate((tile.angle * Math.PI) / 180);
    context.fillStyle = palette.paper;
    context.shadowColor = "#26384b44";
    context.shadowBlur = 3;
    context.shadowOffsetY = 2;
    context.fillRect(
      -tile.width / 2,
      -tile.height / 2,
      tile.width,
      tile.height,
    );
    context.shadowColor = "transparent";
    context.fillStyle = palette.ink;
    context.font = `24px ${readingFont}`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(tile.text, 0, 1);
    context.restore();
  }
  context.restore();
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (result) =>
        result ? resolve(result) : reject(new Error("图片生成失败")),
      "image/png",
    ),
  );
  return blob;
}
