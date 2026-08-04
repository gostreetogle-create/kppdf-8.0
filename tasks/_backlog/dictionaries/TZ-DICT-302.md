═══════════════════════════════════════════════════════════════
TZ-DICT-302: Dictionary List Shell — shared compact chrome
═══════════════════════════════════════════════════════════════

> Domain: FE shared primitive для всех справочников.
> Канон D1–D2: `tasks/TZ-DICT-300.md`.
> Audit: `docs/audits/2026-08-04-dictionaries-ux-ia-audit.md` P0.

РОЛЬ АГЕНТА: Frontend (Paper & Ink / shared UI)
ЗАВИСИМОСТИ: TZ-DICT-300 принят; CATALOG не блокер
LAYER: 3
WHO: один ИИ · SERIAL (не параллелить с другим FE на тех же shared files)

CONFLICT KEYS:
frontend/src/app/shared/page/pi-dictionary-shell.component.ts (new);
frontend/src/app/shared/page/pi-dictionary-shell.component.spec.ts (new);
frontend/src/app/shared/page/pi-toolbar.component.ts (только если нужен sticky API — минимально);
docs/pages/_template.md или docs/DIALOG-COOKBOOK.md (краткая ссылка на shell);
docs/agent-checklists/TZ-DICT-302.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

Проверено: `pi-page-header`, `pi-toolbar`, `pi-section` на categories/colors/units
дают тройной chrome. Нужен один shell: compact title slot + sticky tools +
content projection для table/tree.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. Создать standalone `PiDictionaryShellComponent`:
   - Inputs: `title: string`, optional `totalLabel: string`.
   - Slots / content: `[tools]` (search/filters/sort/CTA), default content = table/tree.
   - Sticky tools bar (top under app layout header): hairline, bg-paper, z-index разумный.
   - **Нет** встроенного eyebrow «раздел · справочники», **нет** description prop.
2. Unit/DOM spec: title renders; tools sticky class present; no description API.
3. Docs: 5–10 строк «как подключать» в page template или DICT-WAVE1.
4. НЕ мигрировать все страницы здесь — только primitive (+ optional demo в одной
   странице запрещён, чтобы не конфликтовать с 304–307).

═══════════════════════════════════════════════════════════════
AC
═══════════════════════════════════════════════════════════════

1. Компонент экспортируется и собирается (fe tsc PASS).
2. Jest shell spec PASS.
3. API стабилен для 303–307 (title + tools + content).
4. READY FOR REVIEW в DICT-WAVE1-REVIEW.md; archive после Cursor PASS.

НЕ: менять categories/colors/units templates (кроме если PO явно сказал demo);
  backend; app-layout nav (303); CATALOG pages.

ПРОМПТ: GEMINI.md + TZ-DICT-300 + этот файл + audit P0.
Push: по PO.
