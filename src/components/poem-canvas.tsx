"use client";

import { useRef, useState, type RefObject } from "react";
import { clamp, defaultPosition, type Draft, type Point } from "@/lib/studio";

type Props = {
  draft: Draft;
  letters: Map<string, string>;
  active: string | null;
  onSelect: (id: string | null) => void;
  onUpdate: (draft: Draft) => void;
  canvasRef: RefObject<HTMLDivElement | null>;
};

export default function PoemCanvas({
  draft,
  letters,
  active,
  onSelect,
  onUpdate,
  canvasRef,
}: Props) {
  const drag = useRef<{
    id: string;
    startX: number;
    startY: number;
    origin: Point;
    point: Point;
    moved: boolean;
  } | null>(null);
  const reorder = useRef<number | null>(null);
  const [preview, setPreview] = useState<{ id: string; point: Point } | null>(
    null,
  );
  const free = draft.mode === "free";

  function move(from: number, to: number) {
    if (to < 0 || to >= draft.poem.length || from === to) return;
    const poem = [...draft.poem];
    const [id] = poem.splice(from, 1);
    poem.splice(to, 0, id);
    onUpdate({ ...draft, poem });
  }

  return (
    <div
      ref={canvasRef}
      className={`poem-canvas ${free ? "free-canvas" : ""}`}
      aria-label="诗句排列区"
    >
      {draft.poem.map((id, index) => {
        if (id === "break")
          return free ? null : (
            <div className="line-break" key={`break-${index}`}>
              <button
                aria-label="删除换行"
                onClick={() =>
                  onUpdate({
                    ...draft,
                    poem: draft.poem.filter(
                      (_, position) => position !== index,
                    ),
                  })
                }
              >
                ↵
              </button>
            </div>
          );
        const point =
          preview?.id === id
            ? preview.point
            : (draft.positions[id] ?? defaultPosition(index));
        return (
          <button
            key={id}
            data-letter-id={id}
            data-tilt={[-3, 2, -1, 3, 0][index % 5]}
            className={`poem-tile ${active === id ? "active" : ""}`}
            style={
              {
                "--tilt": `${[-3, 2, -1, 3, 0][index % 5]}deg`,
                ...(free
                  ? {
                      left: `calc(8px + ${point.x} * (100% - 56px))`,
                      top: `calc(8px + ${point.y} * (100% - 60px))`,
                    }
                  : {}),
              } as React.CSSProperties
            }
            draggable={!free}
            onDragStart={() => {
              reorder.current = index;
            }}
            onDragEnd={() => {
              reorder.current = null;
            }}
            onDragOver={(event) => {
              if (!free) event.preventDefault();
            }}
            onDrop={(event) => {
              event.preventDefault();
              if (!free && reorder.current !== null)
                move(reorder.current, index);
              reorder.current = null;
            }}
            onPointerDown={(event) => {
              if (!free || event.button !== 0) return;
              // 使用指针捕获统一支持鼠标、触屏和触控笔，不让拖动变成页面滚动。
              event.currentTarget.setPointerCapture(event.pointerId);
              drag.current = {
                id,
                startX: event.clientX,
                startY: event.clientY,
                origin: point,
                point,
                moved: false,
              };
            }}
            onPointerMove={(event) => {
              const current = drag.current;
              if (!current || current.id !== id || !canvasRef.current) return;
              const dx = event.clientX - current.startX;
              const dy = event.clientY - current.startY;
              if (Math.hypot(dx, dy) > 3) current.moved = true;
              current.point = {
                x: clamp(
                  current.origin.x +
                    dx / Math.max(1, canvasRef.current.clientWidth - 56),
                ),
                y: clamp(
                  current.origin.y +
                    dy / Math.max(1, canvasRef.current.clientHeight - 60),
                ),
              };
              if (current.moved) setPreview({ id, point: current.point });
            }}
            onPointerUp={() => {
              const current = drag.current;
              if (current?.id === id && current.moved)
                onUpdate({
                  ...draft,
                  positions: { ...draft.positions, [id]: current.point },
                });
              drag.current = null;
              setPreview(null);
            }}
            onPointerCancel={() => {
              drag.current = null;
              setPreview(null);
            }}
            onClick={() => onSelect(active === id ? null : id)}
            onDoubleClick={() =>
              onUpdate({
                ...draft,
                poem: draft.poem.filter((letter) => letter !== id),
              })
            }
            onKeyDown={(event) => {
              if (
                ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
                  event.key,
                )
              ) {
                event.preventDefault();
                if (free) {
                  const x =
                    point.x +
                    (event.key === "ArrowLeft"
                      ? -0.025
                      : event.key === "ArrowRight"
                        ? 0.025
                        : 0);
                  const y =
                    point.y +
                    (event.key === "ArrowUp"
                      ? -0.025
                      : event.key === "ArrowDown"
                        ? 0.025
                        : 0);
                  onUpdate({
                    ...draft,
                    positions: {
                      ...draft.positions,
                      [id]: { x: clamp(x), y: clamp(y) },
                    },
                  });
                } else if (
                  event.key === "ArrowLeft" ||
                  event.key === "ArrowRight"
                )
                  move(index, index + (event.key === "ArrowLeft" ? -1 : 1));
              }
              if (event.key === "Delete" || event.key === "Backspace") {
                event.preventDefault();
                onUpdate({
                  ...draft,
                  poem: draft.poem.filter((letter) => letter !== id),
                });
              }
            }}
            title="双击归还原文"
            aria-label={`纸片“${letters.get(id)}”，双击归还，方向键移动`}
            aria-pressed={active === id}
          >
            {letters.get(id)}
          </button>
        );
      })}
    </div>
  );
}
