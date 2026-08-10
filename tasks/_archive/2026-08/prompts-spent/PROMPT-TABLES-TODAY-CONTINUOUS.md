# Промпт: Tables today continuous (305 closeout → 306 → 308 → 307 → 330 → 331)

Скопируй агенту **целиком**. Непрерывный исполнитель: без стопов «ок/поехали».

**По-человечески:** закрыть доработку диалога таблиц, починить кнопку «Из данных», выровнять поля в диалоге и показать превью таблицы, сделать пресет «КП», потом в Create КП — настройка вида таблицы на сделку и подвал с НДС. Деплой сам не катит.

---

```text
Ты — тщательный непрерывный исполнитель kppdf-8.0 на D:\kppdf-8.0 / main.
Сильный в closeout и conflict keys. Не invent фичи вне TZ. Deploy НЕ запускать.

WAVE: tasks/_backlog/doc-tables/WAVE-TABLES-TODAY-CONTINUOUS.md
Канон КП-таблиц: docs/audits/2026-08-09-kp-table-config-canon.md
GEMINI.md + docs/AI-AGENT-GUIDE.md + docs/PO-DIARY.md §1–§4 + docs/PROJECT-MEMORY.md

════════════════════════════════════════════════════════════
ОЧЕРЕДЬ (строго, без mid-queue стопов)
════════════════════════════════════════════════════════════

0) CLOSEOUT TZ-DOC-TABLES-305
   - PO visual PASS по сути контролов УЖЕ есть (Тип overflow + multi-поля работают).
   - Полировка layout/превью = TZ-308 ниже, НЕ блокер archive 305.
   - Checklist DONE + Executor report (auto) + archive + lock + remove tasks/_active/TZ-DOC-TABLES-305.md
   - progress + _active-map checkpoint; commit+push closeout only.
   - Чужой DOC-343 dirty не включать.

1) TZ-DOC-TABLES-306 — «Из данных» не → /materials
   Spec: tasks/_backlog/doc-tables/TZ-DOC-TABLES-306-from-data-stays-in-documents.md
   Checklist: docs/agent-checklists/TZ-DOC-TABLES-306.md
   Root cause: routerLink string with ?view= → fallthrough ** → materials.
   Fix: GroupChip.queryParams + PiGroupWorkspace path/queryParams; TABLES_SECTION_CHIPS без ? в route.
   Gates из TZ → report → archive → commit+push → next.

2) TZ-DOC-TABLES-308 — диалог: ровные source/fields + выше шапки + эталон внизу
   Spec: tasks/_backlog/doc-tables/TZ-DOC-TABLES-308-dialog-source-fields-preview.md
   Checklist: создай docs/agent-checklists/TZ-DOC-TABLES-308.md по _TEMPLATE если нет.
   PO: source и «поля источника» на одной строке, но НЕРОВНО — выровнять/сцентрировать baseline;
   ширины сопоставимые (не простыня fields); шапки столбцов выше; низ = preview/skeleton таблицы, не серое море.
   Gates → archive → commit+push → next.

3) TZ-DOC-TABLES-307 — категория kp + пресет колонок
   Spec: tasks/_backlog/doc-tables/TZ-DOC-TABLES-307-kp-category-preset.md
   Checklist: docs/agent-checklists/TZ-DOC-TABLES-307.md
   Документы = библиотека пресетов. Не PATCH из Create.
   Gates → archive → commit+push → next.

4) TZ-SALES-330 — Create КП: экземпляр раскладки (панель «Таблица»)
   Spec: tasks/_backlog/kp-vitrine/TZ-SALES-330-kp-table-layout-instance.md
   Checklist: docs/agent-checklists/TZ-SALES-330.md
   Не PATCH shared TableTemplate; не колонка скидки.
   После gates: если TZ требует visual — Status READY FOR REVIEW, короткий handoff PO,
   затем по PASS — archive и СРАЗУ 331 (не ждать «поехали»).

5) TZ-SALES-331 — наценка→цена; VAT; footer Итого/НДС
   Spec: tasks/_backlog/kp-vitrine/TZ-SALES-331-kp-deal-price-vat-footer.md
   Checklist: docs/agent-checklists/TZ-SALES-331.md
   НДС только в подвале на всё КП. То же: visual если в TZ → PASS → archive.

════════════════════════════════════════════════════════════
CLAIM на КАЖДУЮ TZ (до правок)
════════════════════════════════════════════════════════════
1) Get-Location + git rev-parse → D:\kppdf-8.0; clean → git pull --ff-only
2) tasks/_active/<ID>.md + checklist (_TEMPLATE + Integrity slot)
3) Status CLAIMED; Claim slot agent_id + claimed_at ISO + workspace
4) _active-map + tasks/_active/ CONFLICT KEYS → конфликт = STOP/DEFERRED только этой TZ, остальное по возможности
5) Team Room claim best-effort

════════════════════════════════════════════════════════════
BAN
════════════════════════════════════════════════════════════
- Deploy / deploy.ps1
- DOC-343 WIP / dirty document-template.service.ts orientation в своих коммитах
- Колонка «Скидка» на бланке; PATCH TableTemplate из Create
- FROZEN shell 317 ломать; print 320; snapshot 322 invent
- mid-queue «ок? / поехали?»
- Graphify

════════════════════════════════════════════════════════════
ПОСЛЕ ВОЛНЫ
════════════════════════════════════════════════════════════
Отчёт PO: таблица TZ → SHA → archive path.
NEXT: idle. «Готово предложить деплой» — НЕ запускать.
Если visual PASS нужен на 330/331 — один блок READY с чеклистом глаз; после PASS PO в чате — добей archive без новой «волны с нуля».
```
