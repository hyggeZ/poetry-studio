"use client";

import { useEffect, useRef, useState } from "react";
import { localFonts } from "@/data/fonts";
import { article, characterMap, createExample } from "@/data/chibi";

const storageKey = "poetry-studio-v1";

export default function PoetryStudio() {
  const [poem, setPoem] = useState<string[]>([]);
  const [history, setHistory] = useState<string[][]>([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [font, setFont] = useState("SimSun");
  const [active, setActive] = useState<number | null>(null);
  const dragged = useRef<number | null>(null);
  const selected = new Set(poem);
  const count = poem.filter((id) => id !== "break").length;

  useEffect(() => {
    // 本地草稿只保存原文编号；读取时过滤损坏数据和重复编号。
    try {
      const saved: unknown = JSON.parse(
        localStorage.getItem(storageKey) ?? "null",
      );
      if (Array.isArray(saved)) {
        const seen = new Set<string>();
        setPoem(
          saved.filter((id): id is string => {
            if (id === "break") return true;
            if (typeof id !== "string" || !characterMap.has(id) || seen.has(id))
              return false;
            seen.add(id);
            return true;
          }),
        );
      } else setPoem(createExample());
    } catch {
      setNotice("本地草稿不可用，仍可正常创作。");
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(poem));
    } catch {
      setNotice("浏览器未允许保存，离开前请复制诗句。");
    }
  }, [poem, ready]);

  function update(next: string[]) {
    setHistory((previous) => [...previous.slice(-49), poem]);
    setPoem(next);
    setActive(null);
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= poem.length || from === to) return;
    const next = [...poem];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    update(next);
    setActive(to);
  }

  async function copyPoem() {
    const text = poem
      .map((id) => (id === "break" ? "\n" : characterMap.get(id)))
      .join("");
    try {
      await navigator.clipboard.writeText(text);
      setNotice("诗句已复制，带走这一刻的灵感。");
    } catch {
      setNotice("复制未成功，请允许浏览器访问剪贴板。");
    }
  }

  return (
    <main
      style={
        {
          "--reading-font": `"${font}", "SimSun", serif`,
        } as React.CSSProperties
      }
    >
      <header className="site-header">
        <a className="brand" href="/" aria-label="拾字成诗首页">
          <span className="brand-seal">拾</span>拾字成诗
          <span className="brand-en">FOUND POETRY</span>
        </a>
        <span className="header-note">一篇旧文，一首新诗。</span>
        <a className="guide-link" href="/fonts">
          字体试览 ↗
        </a>
      </header>

      <section className="intro">
        <div>
          <div className="eyebrow">文字实验室 / NO. 001</div>
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

      <section className="workspace" aria-label="取字创作台">
        <article className="source-panel">
          <div className="panel-label">
            <span>01 / 拾字</span>
            <span>点击文字，收入诗中 ↘</span>
          </div>
          <div className="article-heading">
            <h2>赤壁赋</h2>
            <span>〔宋〕苏轼 · 元丰五年</span>
          </div>
          <label className="font-control">
            字体
            <select
              value={font}
              onChange={(event) => setFont(event.target.value)}
            >
              {localFonts.map((item) => (
                <option value={item.family} key={item.family}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <div
            className="article-text"
            tabIndex={0}
            aria-label="赤壁赋原文，可上下滚动"
          >
            {article.map((paragraph, index) => (
              <p key={index}>
                {paragraph.map(({ id, text }) => (
                  <button
                    key={id}
                    className={`source-character ${selected.has(id) ? "taken" : ""}`}
                    aria-label={`${selected.has(id) ? "归还" : "拾取"}“${text}”，第${index + 1}段`}
                    aria-pressed={selected.has(id)}
                    title={
                      selected.has(id) ? `归还「${text}」` : `拾取「${text}」`
                    }
                    onClick={() => {
                      update(
                        selected.has(id)
                          ? poem.filter((item) => item !== id)
                          : [...poem, id],
                      );
                    }}
                  >
                    {text}
                  </button>
                ))}
              </p>
            ))}
          </div>
        </article>

        <aside className="poem-panel">
          <div className="panel-label">
            <span>02 / 成诗</span>
          </div>
          <div className="poem-heading">
            <h2>我的拾字诗</h2>
            <span>{String(count).padStart(2, "0")} 字</span>
          </div>
          <div className="poem-canvas" aria-label="诗句排列区">
            {poem.length === 0 && (
              <div className="empty-poem">
                <span>「 」</span>
                <p>你的第一字，会是什么？</p>
                <small>点击左侧原文，开始拾字</small>
              </div>
            )}
            {poem.map((id, index) =>
              id === "break" ? (
                <div className="line-break" key={`break-${index}`}>
                  <button
                    onClick={() =>
                      update(poem.filter((_, position) => position !== index))
                    }
                    aria-label="删除换行"
                    title="删除换行"
                  >
                    ↵
                  </button>
                </div>
              ) : (
                <button
                  className={`poem-tile ${active === index ? "active" : ""}`}
                  key={id}
                  style={
                    {
                      "--tilt": `${[-3, 2, -1, 3, 0][index % 5]}deg`,
                    } as React.CSSProperties
                  }
                  draggable
                  onDragStart={() => {
                    dragged.current = index;
                  }}
                  onDragEnd={() => {
                    dragged.current = null;
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (dragged.current !== null) move(dragged.current, index);
                    dragged.current = null;
                  }}
                  onClick={() => setActive(active === index ? null : index)}
                  // 双击按来源编号归还，避免相同汉字被误删。
                  onDoubleClick={() =>
                    update(poem.filter((item) => item !== id))
                  }
                  title="双击归还原文"
                  onKeyDown={(event) => {
                    if (event.key === "ArrowLeft") {
                      event.preventDefault();
                      move(index, index - 1);
                    }
                    if (event.key === "ArrowRight") {
                      event.preventDefault();
                      move(index, index + 1);
                    }
                    if (event.key === "Delete" || event.key === "Backspace")
                      update(poem.filter((_, position) => position !== index));
                  }}
                  aria-label={`第${index + 1}字：${characterMap.get(id)}，点击编辑，双击归还，方向键移动`}
                  aria-pressed={active === index}
                >
                  {characterMap.get(id)}
                </button>
              ),
            )}
          </div>
          <div className="selection-toolbar">
            {active !== null ? (
              <>
                <span>「{characterMap.get(poem[active])}」</span>
                <button
                  disabled={active === 0}
                  onClick={() => move(active, active - 1)}
                >
                  ← 前移
                </button>
                <button
                  disabled={active === poem.length - 1}
                  onClick={() => move(active, active + 1)}
                >
                  后移 →
                </button>
                <button
                  onClick={() =>
                    update(poem.filter((_, index) => index !== active))
                  }
                >
                  归还原文
                </button>
              </>
            ) : (
              <span>拖动排序 · 双击归还</span>
            )}
          </div>
          <div className="poem-actions">
            <button
              disabled={!poem.length || poem[poem.length - 1] === "break"}
              onClick={() => update([...poem, "break"])}
            >
              ↵ 换一行
            </button>
            <button
              disabled={!history.length}
              onClick={() => {
                setPoem(history[history.length - 1]);
                setHistory(history.slice(0, -1));
                setActive(null);
              }}
            >
              ↶ 撤销
            </button>
            <button disabled={!poem.length} onClick={() => update([])}>
              重新拾字
            </button>
          </div>
          <div className="poem-bottom">
            <button
              className="copy-button"
              disabled={!count}
              onClick={copyPoem}
            >
              复制这首诗 <span>↗</span>
            </button>
            <button
              className="example-button"
              onClick={() => update(createExample())}
            >
              试试灵感示例
            </button>
            <p className="save-note">
              {ready ? "草稿自动保存在当前浏览器" : "正在打开你的草稿…"}
            </p>
          </div>
        </aside>
      </section>

      {notice && (
        <p className="status-notice" role="status" aria-live="polite">
          {notice}
        </p>
      )}
    </main>
  );
}
