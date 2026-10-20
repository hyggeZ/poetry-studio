"use client";

import { useEffect, useRef, useState } from "react";

type Scope = "full" | "poem";

export default function ImagePreview({
  title,
  generate,
  onClose,
}: {
  title: string;
  generate: (scope: Scope) => Promise<Blob>;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [scope, setScope] = useState<Scope>("poem");
  const [image, setImage] = useState<{ url: string; scope: Scope } | null>(
    null,
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  useEffect(() => {
    let cancelled = false;
    let url: string | undefined;
    setLoading(true);
    setError("");
    setImage(null);
    // 切换范围时丢弃过期结果，预览和保存始终使用同一份图片。
    generate(scope)
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setImage({ url, scope });
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError("图片生成失败，请切换范围重试。");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [scope, generate]);

  function save() {
    if (!image || loading || image.scope !== scope) return;
    const link = document.createElement("a");
    link.href = image.url;
    link.download = `${(title || "拾字诗").replace(/[\\/:*?"<>|]/g, "-")}-${scope === "full" ? "完整作品" : "诗作"}.png`;
    link.click();
  }

  return (
    <dialog
      ref={dialog}
      className="image-dialog"
      onCancel={onClose}
      onClose={onClose}
      aria-labelledby="preview-title"
    >
      <header className="dialog-heading">
        <h2 id="preview-title">图片预览</h2>
        <button aria-label="关闭预览" onClick={onClose}>
          ×
        </button>
      </header>
      <div className="preview-scope" aria-label="预览范围">
        <button
          aria-pressed={scope === "poem"}
          onClick={() => setScope("poem")}
        >
          仅右侧
        </button>
        <button
          aria-pressed={scope === "full"}
          onClick={() => setScope("full")}
        >
          左右两侧
        </button>
      </div>
      <div className="preview-image" aria-busy={loading}>
        {loading && <p role="status">正在生成图片…</p>}
        {error && <p role="alert">{error}</p>}
        {image && !loading && (
          <img
            src={image.url}
            alt={
              image.scope === "full"
                ? "原文与诗作完整图片预览"
                : "右侧诗作图片预览"
            }
          />
        )}
      </div>
      <footer className="preview-actions">
        <button disabled={!image || loading} onClick={save}>
          保存图片
        </button>
      </footer>
    </dialog>
  );
}
