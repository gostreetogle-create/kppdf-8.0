# TZ-NX-DOCSTUDIO-D53-PARTY-COPY checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-D53-PARTY-COPY.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-05T12:40:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no CLI in this session)

## Preflight

- [x] D50 (уже разложил Клиент/Плательщик в «Кому», КП/Статус/Заказ в «Связи», Поставщик/Исполнитель в «Ещё») — базовая раскладка готова, D53 добавляет только copy/hint/disclosure
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-D53-PARTY-COPY.md` на месте

## Acceptance

- [x] На «Товарах» нет select'ов КП/клиента (уже так с D50 — секции взаимоисключающие через `@switch`)
- [x] «Кому» показывает клиента первым (Клиент — первое поле в секции; Плательщик — вторым, за disclosure)
- [x] Build PASS

## Integrity slot

- [x] Тип изменения: page (IA/copy/visibility only — context API полей не менял, как требовал TZ)
- [x] FIC: page.md — D54
- [x] Чужой WIP не в коммите
- [x] Канон: docs/DOCS-INTEGRITY.md соблюдён

## Build integrity

- [x] Закрытие: `nx build kppdf-web` — последняя команда, exit 0

## Gates (факт)

```
cd frontend-nx
pnpm exec nx test kppdf-web --testPathPattern="studio-data-panel" → PASS (studio-data-panel.component.spec.ts: 18/18, вкл. 3 новых D53-теста)
pnpm exec nx lint kppdf-web → 0 ошибок в touched files
pnpm exec nx build kppdf-web → PASS, exit 0
```

**Observed but not mine (BAN zone, не чинил):** полный прогон `nx test kppdf-web` продолжает показывать ровно 1 нестабильный fail в `pages/production/**` (в этот раз `gantt-bars.component.spec.ts`, до этого `production-cockpit.page.write.spec.ts`) — Freebuff по-прежнему активно правит `production-cockpit.page.ts`/`production-read.facade.ts`/`gantt-bars.component.ts`/`gantt-bar.model.ts` в этой же сессии (файлы dirty в рабочем дереве не мои). Мой `studio-data-panel.component.spec.ts` зелёный отдельно.

## Executor report

- «Кому»: Плательщик стал secondary disclosure — по умолчанию скрыт за ссылкой «Указать плательщика отдельно» + hint «По умолчанию плательщик = клиент»; если `payerId` уже заполнен (существующий документ) — select показан сразу, без лишнего клика.
- «Связи»: одна строка-подсказка сверху секции («Свяжите лист с КП или заказом — подставятся их номер и строки»).
- «Ещё»: hint под Поставщиком («Редко нужен для КП — чаще для других типов документов»); Исполнитель — value теперь «Наша фирма: {name}» вместо голого имени.
- Не менял ни один output/emitter, ни `context` API — только видимость, copy, один presentational `payerDisclosureOpen` signal внутри компонента.
- Единственный бизнес-дефолт из audit («плательщик = клиент, если не указан отдельно») уже был описан как «известное поведение resolver, не ломать» — я его не трогал (D53 «НЕ» explicitly excludes auto-write без отдельного AC); просто отразил его в hint copy.

## Review handoff

- [x] READY FOR REVIEW — WAVE-DOCSTUDIO-DATA-IA
- Archive без отдельного Cursor Verdict

## Closeout

- archive сразу — переходим к D54 (docs + smoke, последний TZ волны).
