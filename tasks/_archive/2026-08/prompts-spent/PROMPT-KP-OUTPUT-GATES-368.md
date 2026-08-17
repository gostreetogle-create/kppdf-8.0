# PROMPT — TZ-SALES-368 (Печать без гейта фирмы)

Скопируй блок **«Промпт»** целиком исполнителю.

Канон: `docs/audits/2026-08-12-kp-output-gates-canon.md`  
TZ: `tasks/_backlog/kp-vitrine/TZ-SALES-368-kp-output-gates.md`

---

## Промпт (копировать отсюда)

```text
Ты — исполнитель kppdf-8.0. Одна задача: TZ-SALES-368.
Корень: D:\kppdf-8.0 · ветка main · pnpm only.

Читай: GEMINI.md · kppdf-executor-continuous · OrchestratorKit/AGENTS.md ·
docs/PO-DIARY.md §1–§4 · docs/audits/2026-08-12-kp-output-gates-canon.md ·
tasks/_backlog/kp-vitrine/TZ-SALES-368-kp-output-gates.md

CLAIM до кода: team-room join/inbox + claim TZ-SALES-368.
git fetch && git checkout main && git pull --ff-only

ЦЕЛЬ: «Вывод → Печать» не требует фирму и не форсит save.
Сейчас requestOutput для всех action зовёт canSaveDraft() → тост
«Дождитесь готового превью и выберите нашу фирму» — это стыд.

СДЕЛАТЬ:
1) print → сразу printCurrentPreview(); без canSaveDraft / pendingOutput/save.
   Нет превью → короткий toast без слова «фирма».
2) pdf / archive → нужен draft id; save только если canSaveDraft; иначе СВОЙ текст
   про шаблон+фирму для файла (не тост печати).
3) Jest + page.md по канону.
4) Авто-PDF на «Оплачено/Принято» НЕ делать — одна строка successor в page.md.

CONFLICT: proposal-create.page.ts + .spec.ts + proposals-create.page.md + _active-map.
Не трогать Desktop, BE PDF engine, table-editor.

Gates: FE tsc + jest proposal-create.page
Archive + lock + Checkpoint + commit + push. Deploy НЕ.

НАЧИНАЙ с CLAIM. Поехали.
```

## Промпт (конец)
