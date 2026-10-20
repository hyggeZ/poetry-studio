"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { choosePalette, getPalette } from "@/data/palettes";
import { localFonts } from "@/data/fonts";
import { articles, splitArticle, type Article } from "@/data/articles";
import {
  emptyDraft,
  initialStudio,
  restoreStudio,
  storageKey,
  defaultPosition,
  type Draft,
} from "@/lib/studio";
import { createImage } from "@/lib/export-image";
import ImagePreview from "./image-preview";
import ArticleEditor from "./article-editor";
import PoemCanvas from "./poem-canvas";

export default function PoetryStudio() {
  const [studio, setStudio] = useState(initialStudio);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sourceRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const allArticles = useMemo(
    () => [...articles, ...studio.customArticles],
    [studio.customArticles],
  );
  const article =
    allArticles.find((item) => item.id === studio.activeId) ?? articles[0];
  const paragraphs = useMemo(() => splitArticle(article.body), [article.body]);
  const letters = useMemo(
    () => new Map(paragraphs.flat().map((letter) => [letter.id, letter.text])),
    [paragraphs],
  );
  const palette = getPalette(studio.paletteIds[article.id]);
  const draft = studio.drafts[article.id] ?? emptyDraft();
  const selected = new Set(draft.poem);
  const count = draft.poem.filter((id) => id !== "break").length;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setStudio(restoreStudio(JSON.parse(saved)));
      else {
        // 兼容最初的单篇草稿，升级后保留用户已有的拾字诗。
        const previous = JSON.parse(
          localStorage.getItem("poetry-studio-v1") ?? "null",
        );
        if (Array.isArray(previous))
          setStudio(
            restoreStudio({
              ...initialStudio(),
              drafts: { chibi: { ...emptyDraft(), poem: previous } },
            }),
          );
      }
    } catch {
      setNotice("本地草稿读取失败，仍可正常创作。");
    }
    setReady(true);
    return () => {
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(studio));
    } catch {
      setNotice("本地存储空间不足，请先导出作品。");
    }
  }, [studio, ready]);

  useEffect(() => {
    if (!ready || allArticles.every((item) => studio.paletteIds[item.id]))
      return;
    // 配色仅在文章尚未分配时随机一次，刷新和切换都保持原来的组合。
    setStudio((previous) => {
      const paletteIds = { ...previous.paletteIds };
      for (const item of allArticles) {
        if (!paletteIds[item.id])
          paletteIds[item.id] = choosePalette(Object.values(paletteIds));
      }
      return { ...previous, paletteIds };
    });
  }, [ready, allArticles, studio.paletteIds]);

  function update(next: Draft) {
    setStudio((previous) => ({
      ...previous,
      drafts: { ...previous.drafts, [article.id]: next },
    }));
    setActive(null);
  }

  function switchArticle(id: string) {
    setStudio((previous) => ({ ...previous, activeId: id }));
    setActive(null);
    setNotice("");
    sourceRef.current?.scrollTo({ top: 0 });
  }

  function addArticle(item: Article) {
    setStudio((previous) => ({
      ...previous,
      customArticles: [...previous.customArticles, item],
      activeId: item.id,
    }));
    setActive(null);
    setEditing(false);
    sourceRef.current?.scrollTo({ top: 0 });
  }

  function changeMode(mode: Draft["mode"]) {
    if (mode === draft.mode) return;
    const positions = { ...draft.positions };
    // 第一次进入自由模式时记录现有排版，切换布局不会突然把文字挤在一起。
    if (mode === "free" && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.querySelectorAll<HTMLElement>(".poem-tile").forEach((tile) => {
        const id = tile.dataset.letterId!;
        if (!positions[id])
          positions[id] = {
            x: Math.min(
              1,
              Math.max(
                0,
                (tile.offsetLeft - 8) / Math.max(1, canvas.clientWidth - 56),
              ),
            ),
            y: Math.min(1, Math.max(0, (tile.offsetTop - 8) / 420)),
          };
      });
    }
    update({ ...draft, mode, positions });
  }

  function addLine() {
    if (draft.mode !== "flow" || !count) return;
    update({ ...draft, poem: [...draft.poem, "break"] });
    canvasRef.current?.focus({ preventScroll: true });
  }

  const generateImage = useCallback(
    async (scope: "full" | "poem") => {
      if (!canvasRef.current) throw new Error("画布尚未就绪");
      return createImage(
        article,
        new Set(draft.poem),
        studio.font,
        canvasRef.current,
        scope,
        palette,
      );
    },
    [article, draft.poem, studio.font, palette],
  );

  return (
    <main
      onKeyDown={(event) => {
        // 仅在取字或画布区域响应回车，不干扰下拉菜单和自定义正文输入。
        if (
          event.key !== "Enter" ||
          event.repeat ||
          event.nativeEvent.isComposing
        )
          return;
        const target = event.target as HTMLElement;
        if (
          draft.mode === "flow" &&
          target.closest(".source-character, .poem-canvas") &&
          !target.closest(".newline-control")
        ) {
          event.preventDefault();
          addLine();
        }
      }}
      style={
        {
          "--paper": palette.paper,
          "--blue": palette.canvas,
          "--poem-ink": palette.ink,
          "--reading-font": `"${studio.font}", "SimSun", serif`,
        } as React.CSSProperties
      }
    >
      <header className="site-header">
        <Link className="brand" href="/" aria-label="拾字成诗首页">
          <span className="brand-seal">拾</span>拾字成诗
          <span className="brand-en">FOUND POETRY</span>
        </Link>
        <label className="font-control">
          字体
          <select
            aria-label="字体"
            value={studio.font}
            onChange={(event) =>
              setStudio({ ...studio, font: event.target.value })
            }
          >
            {localFonts.map((item) => (
              <option value={item.family} key={item.family}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <Link className="guide-link" href="/fonts/">
          字体试览 ↗
        </Link>
      </header>
      <div className="studio-layout">
        <aside className="article-sidebar" aria-label="文章侧栏">
          <button className="new-article" onClick={() => setEditing(true)}>
            <span>＋</span> 自定义文章
          </button>
          <nav aria-label="文章列表">
            {allArticles.map((item) => {
              const colors = getPalette(studio.paletteIds[item.id]);
              return (
                <button
                  key={item.id}
                  className="article-option"
                  aria-current={item.id === article.id ? "page" : undefined}
                  onClick={() => switchArticle(item.id)}
                >
                  <span
                    className="article-swatch"
                    aria-hidden="true"
                    style={{
                      background: `linear-gradient(90deg, ${colors.paper} 50%, ${colors.canvas} 50%)`,
                    }}
                  />
                  <span className="article-option-text">
                    <strong>{item.title || item.body.slice(0, 12)}</strong>
                    {item.author && <small>{item.author}</small>}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>
        <div className="studio-main">
          <section className="intro">
            <div>
              <div className="eyebrow">文字实验室</div>
              <h1>
                在旧文字里，
                <br className="mobile-break" />
                遇见<span>新诗。</span>
              </h1>
            </div>
            <div className="intro-mark" aria-hidden="true">
              字<span>里</span>行<span>间</span>
              <small>另有天地</small>
            </div>
          </section>

          <section className="article-picker" aria-label="创作工具栏">
            <button disabled={!ready} onClick={() => setPreviewing(true)}>
              预览
            </button>
            <div className="layout-switch" aria-label="排列方式">
              <button
                aria-pressed={draft.mode === "flow"}
                onClick={() => changeMode("flow")}
              >
                整齐排列
              </button>
              <button
                aria-pressed={draft.mode === "free"}
                onClick={() => changeMode("free")}
              >
                自由摆放
              </button>
            </div>
          </section>
          <section className="workspace" aria-label="取字创作台">
            <article className="source-panel">
              {(article.title || article.author) && (
                <div className="article-heading">
                  {article.title && <h2>{article.title}</h2>}
                  {article.author && <span>{article.author}</span>}
                </div>
              )}
              <div
                ref={sourceRef}
                className={`article-text ${scrolling ? "is-scrolling" : ""}`}
                tabIndex={0}
                aria-label="原文，可上下滚动"
                onScroll={() => {
                  setScrolling(true);
                  if (scrollTimer.current) clearTimeout(scrollTimer.current);
                  scrollTimer.current = setTimeout(
                    () => setScrolling(false),
                    800,
                  );
                }}
              >
                {paragraphs.map((paragraph, index) => (
                  <p key={index}>
                    {paragraph.length ? (
                      paragraph.map(({ id, text }) => (
                        <button
                          key={id}
                          className={`source-character ${selected.has(id) ? "taken" : ""}`}
                          aria-label={`${selected.has(id) ? "归还" : "拾取"}“${text}”，第${index + 1}段`}
                          aria-pressed={selected.has(id)}
                          onClick={() => {
                            update({
                              ...draft,
                              poem: selected.has(id)
                                ? draft.poem.filter((item) => item !== id)
                                : [...draft.poem, id],
                              positions:
                                selected.has(id) || draft.mode === "flow"
                                  ? draft.positions
                                  : {
                                      ...draft.positions,
                                      [id]:
                                        draft.positions[id] ??
                                        defaultPosition(count),
                                    },
                            });
                          }}
                        >
                          {text}
                        </button>
                      ))
                    ) : (
                      <br />
                    )}
                  </p>
                ))}
              </div>
            </article>
            <aside className="poem-panel">
              <PoemCanvas
                draft={draft}
                letters={letters}
                active={active}
                onSelect={setActive}
                onUpdate={update}
                canvasRef={canvasRef}
                onAddLine={addLine}
              />
            </aside>
          </section>
        </div>
      </div>
      {previewing && (
        <ImagePreview
          title={article.title}
          generate={generateImage}
          onClose={() => setPreviewing(false)}
        />
      )}
      {editing && (
        <ArticleEditor onSave={addArticle} onClose={() => setEditing(false)} />
      )}
      {notice && (
        <p className="status-notice" role="status" aria-live="polite">
          {notice}
        </p>
      )}
    </main>
  );
}
