"use client";

import { useEffect, useState } from "react";
import { buildImageCandidates, type ImageCategory } from "@/lib/images";

interface Props {
  /** Папка в public/images, з якої брати картинку. */
  category: ImageCategory;
  /** id предмета (з json), використовується як ім'я файлу за замовчуванням. */
  id: string;
  /** Явне ім'я файлу з json ("image"), якщо відрізняється від id. */
  image?: string;
  alt: string;
  size?: number;
  style?: React.CSSProperties;
}

/**
 * Показує зображення предмета з public/images/<category>/, автоматично
 * перебираючи .png/.jpg/.jpeg та id/image-варіанти імені файлу.
 * Якщо жодного файлу не знайдено — рендерить нейтральну заглушку,
 * щоб інтерфейс не ламався, поки зображення ще не додано.
 */
export function ItemImage({
  category,
  id,
  image,
  alt,
  size = 40,
  style,
}: Props) {
  const candidates = buildImageCandidates(category, id, image);
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(candidates.length === 0);

  // При зміні предмета (інший id/category/image) — почати перебір спочатку.
  useEffect(() => {
    setIndex(0);
    setFailed(candidates.length === 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, id, image]);

  if (failed) {
    return (
      <div
        aria-hidden="true"
        style={{
          width: size,
          height: size,
          borderRadius: 6,
          background: "var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: Math.max(10, size * 0.4),
          color: "var(--text-muted)",
          flexShrink: 0,
          ...style,
        }}
      >
        ?
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={candidates[index]}
      alt={alt}
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        borderRadius: 6,
        flexShrink: 0,
        background: "var(--border)",
        ...style,
      }}
      onError={() => {
        setIndex((prev) => {
          const next = prev + 1;
          if (next >= candidates.length) {
            setFailed(true);
            return prev;
          }
          return next;
        });
      }}
    />
  );
}
