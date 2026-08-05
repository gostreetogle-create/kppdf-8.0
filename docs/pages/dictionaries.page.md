# Страница: Справочники (hub retired)

**Статус:** после **TZ-DICT-311** card-hub удалён.

```
/dictionaries → redirect → /dictionaries/measurements
```

Основной вход — nav «Справочники» по группам (DICT-310):

| Группа | Alias route | Body |
|--------|-------------|------|
| Классификация | `/dictionaries/classification` → `/categories` | chip Категории |
| Измерения | `/dictionaries/measurements` | chip Единицы |
| Оформление | `/dictionaries/appearance` → color-references | chip Цвета |
| Документы | `/dictionaries/documents-ref` → doc-template-cats | chips шаблоны / тексты |

## Chrome (TZ-DICT-312)

Все канонические group routes используют dense main: chips начинаются сразу под app header без `pt-page-y` и отдельного footer-gap. `PiGroupWorkspace` держит chips и tools в одном sticky `top-0` стеке внутри `main`; перенос chips на второй ряд автоматически увеличивает стек, без ручного offset. Tools и CTA сохраняют `min-width: 0`, поэтому CTA не должен обрезаться по правому краю.

SoT: `docs/superpowers/specs/2026-08-04-group-chip-workspace-design.md`

---

_Обновлено: 2026-08-05 (TZ-DICT-312 READY FOR REVIEW)._
