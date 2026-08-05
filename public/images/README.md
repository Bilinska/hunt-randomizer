# Зображення предметів

Структура папок:

```
public/images/
  tools/          -> для lib/data/tools.json
  consumables/    -> для lib/data/consumables.json
  weapons/        -> для lib/data/weapons.json
  traits/         -> для lib/data/traits.json
```

## Як додати картинку предмету

Назвіть файл так само, як `id` предмета у відповідному json-файлі,
з розширенням `.png`, `.jpg` або `.jpeg`.

Приклад: у `lib/data/tools.json` є запис

```json
{ "id": "bear-trap", "name": "Bear Trap", ... }
```

Тоді картинку треба покласти як:

```
public/images/tools/bear-trap.png
```

(або `.jpg` / `.jpeg` — компонент сам перевірить усі варіанти по черзі).

## Якщо ім'я файлу відрізняється від id

Додайте в json-запис поле `"image"` з ім'ям файлу (з розширенням або без):

```json
{ "id": "bear-trap", "name": "Bear Trap", "image": "bear_trap_v2.png" }
```

## Що буде, якщо картинки немає

Компонент `ItemImage` (components/ItemImage.tsx) не зламає інтерфейс —
замість зображення покаже нейтральну заглушку, поки файл не додано.
