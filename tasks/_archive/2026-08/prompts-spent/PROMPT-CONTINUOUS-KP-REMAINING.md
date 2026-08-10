# Промпт: добить очередь Create КП + DOC-344 (без лишних стопов)

## По-человечески

Агент без остановок «ок?» закрывает остаток: archive 326 → дожимает жёлтую заливку звезды фона и архивирует DOC-344 → товары на бланке (325) → shop-витрина (328). Останавливается **только** когда TZ явно требует visual PASS PO/Cursor или реальный конфликт ключей / грандиозное продуктовое решение.

## Копипаст исполнителю

```text
Ты — непрерывный исполнитель kppdf-8.0 на D:\kppdf-8.0 / main.
Канон: GEMINI.md + docs/AI-AGENT-GUIDE.md + docs/PO-DIARY.md §1–§4 + kppdf-executor-continuous.
Работаешь до пустой очереди ниже. Mid-queue «поехали?» / «продолжать?» — ЗАПРЕЩЕНЫ.

УЖЕ ПРИНЯТО (не переоткрывать):
- TZ-SALES-323/324/327/329 DONE
- TZ-SALES-326 — Cursor visual PASS (40rem flyout, backdrop закрывает L+R, A4 не сжимается). Нужен только archive/closeout.
- DOC-344 — PO: один фон OK; звезда default должна быть с ЖЁЛТОЙ ЗАЛИВКОЙ внутри (сейчас видно в основном обводку) — добей и archive.

ОЧЕРЕДЬ (строго):
1) Archive TZ-SALES-326 (lock/progress/_active/checkpoint) + scoped commit/push closeout если ещё нет.
2) DOC-344 closeout-fix: активная default-звезда = filled yellow (не outline-only). Самопроверка в Builder. Затем archive DOC-344 + commit/push. Не трогай чужой DOC-343 / dirty document-template.service.ts если это не твой scope — исключи из commit.
3) CLAIM + выполни TZ-SALES-325:
   tasks/_backlog/kp-vitrine/TZ-SALES-325-draftlines-table-bind.md
   Аудит: docs/audits/2026-08-09-kp-create-preview-wave2.md §C
4) После DONE 325 (и visual если TZ требует) → CLAIM + выполни TZ-SALES-328:
   tasks/_backlog/kp-vitrine/TZ-SALES-328-create-kp-shop-vitrine.md
   Аудит: docs/audits/2026-08-09-kp-create-product-vitrine.md
   Карточки = PiShowcaseCard md (327 уже DONE).

ПРАВИЛА СТОПА — останавливаешься ТОЛЬКО если:
A) TZ явно требует Cursor/PO visual PASS перед archive (325 лист с товарами; 328 витрина) — тогда READY FOR REVIEW + короткий отчёт «нужен visual: …» и ЖДЁШЬ. После PASS в чате — сразу archive → next.
B) CONFLICT KEYS с чужим _active (сейчас следи за DOC-TABLES-305 если пересечётся) → STOP/DEFERRED, напиши PO одной фразой.
C) Нужно ГРАНДИОЗНОЕ продуктовое решение вне TZ (менять FROZEN 317 shell, schema Quotation, deploy, 322 snapshot) — STOP + вопрос.
D) Build/gates красные и ты не понимаешь причину после 1–2 попыток фикса в своей зоне.

НЕ останавливайся ради:
- мелких багов внутри своей TZ (private→protected, HMR, тесты) — чини и иди;
- выбора между двумя безопасными вариантами внутри AC — бери safer, зафиксируй в checklist known_limit / Executor report;
- «подтверди что делать дальше» между 326→344→325→328.

РЕШЕНИЯ САМ (без вопроса PO):
- 325: target table = settings.kpLineItems/role line-items, иначе ровно 1 live table, иначе none; key aliases из TZ; previewLines не в Mongo.
- 328: md grid 2 col, search+category+pager, QuickCreate + ProductFormDialog reuse; Add не закрывает flyout.
- Звезда 344: fill через CSS на lucide svg ИЛИ filled icon — главное визуально жёлтая заливка у active default.

BAN: TZ-SALES-322, 320, deploy/deploy.ps1, docked 3-col, BuilderCanvas embed, fuzzy label mapping, второй Product write-path.
После каждой TZ: gates → Executor report (auto) → archive по правилу TZ → commit+push scoped → _active-map → сразу следующая.
Конец 328 DONE: NEXT idle; Deploy предложить? да (без запуска).
```
