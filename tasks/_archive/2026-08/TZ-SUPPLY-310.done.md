# TZ-SUPPLY-310 DONE — Быстрый заказ: Paper & Ink compact visuals

```
ARCHIVE_MARKER
task_id: TZ-SUPPLY-310
outcome: DONE
closed_at: 2026-08-23T22:30:00+03:00
agent_id: cursor-composer-executor
workspace: D:\kppdf-8.0
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (frontend tsc)
  - tests: PASS (29/29 supply-quick-order --runInBand)
  - lint: PASS (eslint quiet on conflict key)
```

## Что сделано

- Убраны color-mix tint-фоны у strip--what/where/details → только `--color-paper` / `--color-paper-2`.
- border-radius ≤2px на strips, inputs, add-btn, mini-btn, photo controls, urgent badge.
- Поля strip: height/min-height 1.875rem (30px), font 13px; не `--touch-comfortable`.
- Плотность: fields padding 0.5rem 0.75rem, gap 0.5rem; strip-label padding ужат.
- Зелёные `+` кнопки сохранены, выровнены по высоте инпута (1.875rem).
- Поведение 308R (▸ toggles) не тронуто; specs без изменений.

## Файлы

- `frontend/src/app/pages/supply/supply-quick-order.component.ts`
