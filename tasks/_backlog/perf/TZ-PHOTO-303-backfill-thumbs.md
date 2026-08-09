# TZ-PHOTO-303: Старые фото — догнать превью

```
PAGES: (скрипт/миграция) uploads + photos collection
PAGE_DOCS: —
DEPENDS ON: TZ-PHOTO-301 DONE
```

РОЛЬ АГЕНТА: Backend Developer  
ЗАВИСИМОСТИ: TZ-PHOTO-301  
LAYER: 4  
CONFLICT KEYS: backend/src/modules/photos/; backend/src/database/migrations/; backend/scripts/

Проверено: старые Photo только `variant: original` без children; 301 покрывает только новые upload.

---

## Простыми словами

Фото, загруженные **раньше**, ещё без лёгкой копии. Скрипт/миграция один раз проходит по ним и создаёт thumb. Сайт начинает быстрее показывать и старый каталог. Оригиналы не трогаем.

---

## ЧТО ДЕЛАТЬ

1. Найти все Photo с `variant: 'original'` без дочернего `thumb` (`parentPhotoId`).
2. Для каждого: прочитать файл с диска → sharp → thumb → создать Photo child (как в 301).
3. Идемпотентность: повторный запуск не плодит дубли.
4. Безопасность: missing file → skip + log, не валить весь прогон.
5. Документировать запуск в progress / script header (`pnpm` script или migration runner — как принято в репо).

## НЕ ИЗМЕНЯТЬ

- FE (302 может идти параллельно после 301, но backfill лучше до/сразу после 302)
- Удаление original

## КРИТЕРИИ ПРИЁМКИ

1. На тестовой выборке старых original появляется thumb.
2. Повторный прогон = 0 новых дублей.
3. tsc + релевантный test/smoke PASS.
4. Archive + как запускать на стенде (1 абзац в report).

## One-liner

```text
GEMINI.md + tasks/_backlog/perf/TZ-PHOTO-303-backfill-thumbs.md (после 301). CLAIM. Идемпотентный backfill thumb для старых original; archive.
```
