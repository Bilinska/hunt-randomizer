// Утиліта для підв'язки зображень предметів (tools, consumables, weapons, traits).
//
// Конвенція: зображення кладеться у відповідну папку
//   public/images/tools/<id>.png|.jpg|.jpeg
//   public/images/consumables/<id>.png|.jpg|.jpeg
//   public/images/weapons/<id>.png|.jpg|.jpeg
//   public/images/traits/<id>.png|.jpg|.jpeg
//
// <id> — це поле "id" предмета з відповідного json-файлу (lib/data/*.json),
// наприклад "bear-trap" -> public/images/tools/bear-trap.png
//
// Якщо в json-записі є явне поле "image" (наприклад "image": "custom-name.png"),
// воно має пріоритет і використовується замість id. Можна вказати як з
// розширенням, так і без — тоді по черзі перевіряються .png/.jpg/.jpeg.
//
// Компонент ItemImage (components/ItemImage.tsx) сам перебирає всі варіанти
// і показує заглушку, якщо жодного файлу не знайдено — так інтерфейс не
// ламається, поки картинки ще не додані.

export type ImageCategory = "tools" | "consumables" | "weapons" | "traits";

const EXTENSIONS = ["png", "jpg", "jpeg"] as const;

/** Чи рядок вже містить одне з підтримуваних розширень зображення. */
function hasImageExtension(value: string): boolean {
  return /\.(png|jpe?g)$/i.test(value);
}

/**
 * Будує впорядкований список кандидатів шляхів до зображення предмета.
 * Перший, що успішно завантажиться в <img>, буде використаний.
 */
export function buildImageCandidates(
  category: ImageCategory,
  id: string,
  image?: string
): string[] {
  const basePath = `/images/${category}`;
  const candidates: string[] = [];

  if (image) {
    if (hasImageExtension(image)) {
      candidates.push(`${basePath}/${image}`);
    } else {
      for (const ext of EXTENSIONS) {
        candidates.push(`${basePath}/${image}.${ext}`);
      }
    }
  }

  for (const ext of EXTENSIONS) {
    const path = `${basePath}/${id}.${ext}`;
    if (!candidates.includes(path)) {
      candidates.push(path);
    }
  }

  return candidates;
}
