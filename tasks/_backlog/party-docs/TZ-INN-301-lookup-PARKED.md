═══════════════════════════════════════════════════════════════
TZ-INN-301: INN lookup (DaData / FNS) — PARKED
═══════════════════════════════════════════════════════════════

STATUS: PARKED · WAVE-PARTY-DOCS #8
DEPENDS ON: TZ-PARTY-303 DONE + **явный ключ/бюджет от PO**
LAYER: 3
CHECKLIST: docs/agent-checklists/TZ-INN-301.md

РОЛЬ: Backend + FE autocomplete

CONFLICT KEYS:
backend/src/modules/counterparty/**;
backend/src/modules/organization/**;
frontend Org/CP FullEditor INN field;
.env.example (без секретов в git);

---

## ПОЧЕМУ PARKED

Peers + curator: без ключа API и бюджета не стартовать.  
Stub ИНН + badge уже в PARTY-301.

## ЧТО ДЕЛАТЬ (когда PO разблокирует)

1. Сервис lookup по ИНН (provider за адаптером).  
2. FE: кнопка «Заполнить по ИНН» в Org/CP editor.  
3. При успехе: `innIsStub=false`; при fail — понятная ошибка, stub остаётся.  
4. Ключ только env; не в репо.  
5. Rate-limit / cache минимальный.

## НЕ ДО UNPARK

- Исполнитель **не claim**.  
- Не хардкодить mock как «готово к бою» без PO.

## AC (после unpark)

1. Валидный ИНН заполняет реквизиты.  
2. Без ключа — graceful degrade.  
3. Gates + archive + push; deploy NO.
