import { Article, articles, splitArticle } from "@/data/articles";
import { createExample } from "@/data/chibi";
import { palettes } from "@/data/palettes";
import { localFonts } from "@/data/fonts";

export type Point = { x: number; y: number };
export type Draft = {
  poem: string[];
  mode: "flow" | "free";
  positions: Record<string, Point>;
};
export type Studio = {
  paletteIds: Record<string, string>;
  activeId: string;
  font: string;
  customArticles: Article[];
  drafts: Record<string, Draft>;
};
export const storageKey = "poetry-studio-v2";
export const emptyDraft = (): Draft => ({
  poem: [],
  mode: "flow",
  positions: {},
});
export const initialStudio = (): Studio => ({
  paletteIds: {},
  activeId: "chibi",
  font: "SimSun",
  customArticles: [],
  drafts: { chibi: { ...emptyDraft(), poem: createExample() } },
});
export const clamp = (value: number) => Math.min(1, Math.max(0, value));

export function defaultPosition(index: number): Point {
  return { x: (index % 5) / 5, y: (Math.floor(index / 5) % 9) / 9 };
}

export function restoreStudio(value: unknown): Studio {
  const result = initialStudio();
  if (!value || typeof value !== "object") return result;
  const saved = value as Partial<Studio>;
  if (localFonts.some((font) => font.family === saved.font))
    result.font = saved.font!;
  const used = new Set(articles.map((article) => article.id));
  if (Array.isArray(saved.customArticles)) {
    result.customArticles = saved.customArticles.filter((article) => {
      if (
        !article ||
        typeof article.id !== "string" ||
        !article.id.startsWith("custom-") ||
        used.has(article.id) ||
        typeof article.body !== "string" ||
        !article.body.trim() ||
        article.body.length > 5000 ||
        typeof article.title !== "string" ||
        typeof article.author !== "string"
      )
        return false;
      used.add(article.id);
      return true;
    });
  }
  const all = [...articles, ...result.customArticles];
  if (all.some((article) => article.id === saved.activeId))
    result.activeId = saved.activeId!;
  for (const article of all) {
    const paletteId = saved.paletteIds?.[article.id];
    if (palettes.some((palette) => palette.id === paletteId))
      result.paletteIds[article.id] = paletteId!;
    const draft = saved.drafts?.[article.id];
    if (!draft || !Array.isArray(draft.poem)) continue;
    const ids = new Set(
      splitArticle(article.body)
        .flat()
        .map((letter) => letter.id),
    );
    const seen = new Set<string>();
    const clean = emptyDraft();
    clean.mode = draft.mode === "free" ? "free" : "flow";
    clean.poem = draft.poem
      .filter((id) => {
        if (id === "break") return true;
        if (typeof id !== "string" || !ids.has(id) || seen.has(id))
          return false;
        seen.add(id);
        return true;
      })
      .slice(0, 10000);
    for (const id of seen) {
      const point = draft.positions?.[id];
      if (point && Number.isFinite(point.x) && Number.isFinite(point.y)) {
        clean.positions[id] = { x: clamp(point.x), y: clamp(point.y) };
      }
    }
    result.drafts[article.id] = clean;
  }
  return result;
}
