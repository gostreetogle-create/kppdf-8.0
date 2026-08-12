# PROMPT — TZ-SALES-367 (убрать savebar над A4)

Скопируй блок **«Промпт»** целиком исполнителю.  
Канон: `docs/audits/2026-08-12-kp-create-no-savebar-canon.md`  
TZ: `tasks/_backlog/kp-vitrine/TZ-SALES-367-kp-create-no-savebar.md`

---

## Промпт (копировать отсюда)

```text
Ты — исполнитель kppdf-8.0. Одна задача: TZ-SALES-367.
Корень: D:\kppdf-8.0 · ветка main · pnpm only.

Читай:
1. GEMINI.md
2. .agents/skills/kppdf-executor-continuous/SKILL.md
3. OrchestratorKit/AGENTS.md
4. docs/PO-DIARY.md §1–§4
5. docs/audits/2026-08-12-kp-create-no-savebar-canon.md
6. tasks/_backlog/kp-vitrine/TZ-SALES-367-kp-create-no-savebar.md
7. docs/ux/kp-create-studio-spec.md §0 (обновишь LOCK)

════════════════════════════════════════════════════════
CLAIM
════════════════════════════════════════════════════════
node OrchestratorKit/team-room/cli.mjs join
node OrchestratorKit/team-room/cli.mjs inbox
# claim TZ-SALES-367; _active/ без конфликта на proposal-create.page.ts
# Если 366 держит только template-center — параллель OK.
# Если кто-то уже держит page.ts — DEFERRED, отчёт PO.

git fetch && git checkout main && git pull --ff-only

════════════════════════════════════════════════════════
ЦЕЛЬ (жест PO)
════════════════════════════════════════════════════════
Полоса над A4 (Сохранено / статус / версии / заказ / копировать / Скачать)
сдвигает лист вниз и даёт скролл — УБРАТЬ НАВСЕГДА.
A4 прилипает кверху студии под chips «Создать КП | Все КП».
Lifecycle (статус, версии, заказ, копировать) — только на странице Все КП.
Из студии нужен вывод: Печать · PDF · Архив — иконка на рейле (не chips, не savebar).
Autosave без видимой полосы «Сохранено».

════════════════════════════════════════════════════════
СДЕЛАТЬ
════════════════════════════════════════════════════════
1) Удалить kp-save-bar / .kp-create-studio__savebar целиком.
2) Убрать из UI create: status, versions, create order, duplicate, autosave label, page-count дубль.
3) Добавить rail-кнопку «Вывод» (data-test=kp-create-toggle-output) + flyout:
   Печать (первая) · PDF · Сохранить в архив документов → requestOutput(...).
4) Не открывать group-tools / не класть кнопки на chips.
5) Обновить kp-create-studio-spec.md §0 + proposals-create.page.md.
6) Jest: нет save-bar; есть output rail; старые top-bar lifecycle тесты — поправить.

BAN: новая страница просмотра КП · deploy · unpark 320 · ломать autosave write-path ·
трогать Desktop · добавлять allow-scripts на preview.

Gates:
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec jest --testPathPattern=proposal-create.page --no-coverage

Archive + lock + Checkpoint + commit + push. Deploy НЕ.
Короткий отчёт: SHA + «savebar gone, output on rail».

НАЧИНАЙ с CLAIM. Поехали.
```

## Промпт (конец)
