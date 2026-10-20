"use client";

import { useEffect, useRef, useState } from "react";
import type { Article } from "@/data/articles";

export default function ArticleEditor({
  onSave,
  onClose,
}: {
  onSave: (article: Article) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialog}
      className="article-dialog"
      onCancel={onClose}
      onClose={onClose}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const body = String(data.get("body") ?? "").trim();
          if (!body) {
            setError("请输入正文。");
            return;
          }
          onSave({
            id: `custom-${crypto.randomUUID()}`,
            title: String(data.get("title") ?? "").trim(),
            author: String(data.get("author") ?? "").trim(),
            body,
          });
        }}
      >
        <div className="dialog-heading">
          <h2>自定义文章</h2>
          <button type="button" onClick={onClose} aria-label="关闭自定义文章">
            ×
          </button>
        </div>
        <label>
          标题（可留空）
          <input name="title" maxLength={80} />
        </label>
        <label>
          作者（可留空）
          <input name="author" maxLength={50} />
        </label>
        <label>
          正文
          <textarea
            name="body"
            required
            maxLength={5000}
            rows={10}
            placeholder="粘贴或输入正文，保留你的分段。"
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <div className="dialog-actions">
          <button type="button" onClick={onClose}>
            取消
          </button>
          <button type="submit">开始拾字</button>
        </div>
      </form>
    </dialog>
  );
}
