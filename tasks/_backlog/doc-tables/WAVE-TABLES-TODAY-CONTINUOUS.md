# WAVE — Tables today closeout (305→306→308→307→330→331)

> **Зачем:** добить всё, что PO обсудил 2026-08-09 по таблицам/КП, **одной непрерывной очередью** без «кусочков».  
> **SoT:** `D:\kppdf-8.0` / `main`  
> **Промпт:** `PROMPT-TABLES-TODAY-CONTINUOUS.md`

## Очередь (строго)

| # | TZ | Суть |
|---|-----|------|
| 0 | **Closeout DOC-TABLES-305** | PO PASS по контролам (Тип + multi-поля); archive/lock |
| 1 | **DOC-TABLES-306** | Chip «Из данных» не кидает в Материалы (`routerLink`+queryParams) |
| 2 | **DOC-TABLES-308** | Диалог: ровные источник/поля; выше шапки столбцов; низ = эталон-превью |
| 3 | **DOC-TABLES-307** | Категория КП + пресет колонок в Документах |
| 4 | **SALES-330** | Create КП: экземпляр раскладки таблицы (панель), не PATCH шаблона |
| 5 | **SALES-331** | Наценка→цена; НДС %; подвал Итого/НДС |

Канон КП-таблиц: `docs/audits/2026-08-09-kp-table-config-canon.md`  
Wave KP: `tasks/_backlog/kp-vitrine/WAVE-KP-TABLE-CONFIG.md`

## Правила

- Без mid-queue «ок / поехали».
- Visual STOP только если TZ явно требует Cursor/PO PASS (330/331 UI — после gates READY, один handoff в конце волны или после каждой UI TZ по checklist).
- Чужой DOC-343 / `document-template.service.ts` orientation WIP — не в коммит.
- Deploy: **NO** пока PO не скажет.

## После волны

NEXT idle + отчёт SHA по каждой TZ. Предложить деплой — не запускать.
