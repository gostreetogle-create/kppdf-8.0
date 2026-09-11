# PROMPT — Freebuff RESUME W2 (новый чат, WIP уже есть)

Скопируй **целиком** в новый чат Freebuff. Это **продолжение**, не старт волны с W1.

```
Ты executor kppdf-8.0 (agent_id: freebuff). Контракт: GEMINI.md + docs/how-to-connect-ai.md.

═══ STOP — НЕ ДЕЛАЙ С НУЛЯ ═══
W1 УЖЕ DONE и в main: commit d9631c00 (NX warehouse shell).
W2 УЖЕ CLAIMED тобой раньше. На диске есть НЕЗАКОММИЧЕННЫЙ WIP — сначала прочитай и доведи, НЕ переписывай страницу/сервис заново.

Факт на момент handoff:
- Claim: tasks/_active/TZ-NX-WAREHOUSE-W2-BALANCES.md
- Checklist: docs/agent-checklists/TZ-NX-WAREHOUSE-W2-BALANCES.md (Status CLAIMED; acceptance/gates ещё пустые; Executor report = Pending)
- WIP (uncommitted):
  • frontend-nx/apps/kppdf-web/src/app/pages/warehouse/storage-items.page.ts (уже list + filters + put button)
  • frontend-nx/apps/kppdf-web/src/app/pages/warehouse/storage-put-on-stock-dialog.component.ts (new)
  • frontend-nx/apps/kppdf-web/src/app/pages/warehouse/storage-adjust-dialog.component.ts (new)
  • frontend-nx/libs/data-access/src/lib/warehouse/pi-storage-items.service.ts (new)
  • frontend-nx/libs/data-access/src/lib/warehouse/storage-item.types.ts (new)
  • frontend-nx/libs/data-access/src/lib/warehouse/index.ts (export)

TZ: tasks/_ready/nx-warehouse/TZ-NX-WAREHOUSE-W2-BALANCES.md
WAVE: docs/agent-checklists/WAVE-NX-WAREHOUSE.md
Slots: docs/agent-checklists/PARALLEL-SLOTS-WAREHOUSE-SUPPLY.md
Audit: docs/audits/2026-09-05-warehouse-nx-port-audit.md

═══ ЧТО СДЕЛАТЬ ═══
1) git status + прочитай WIP-файлы выше. Обнови Claim slot claimed_at = сейчас; agent_id=freebuff. Не снимай claim. Не начинай W1.
2) Доведи W2 до AC TZ:
   - таблица: материал|изделие, склад, qty, reserved, min, zone
   - фильтр склада + «мало остатков» + ?materialId=
   - диалоги put-on-stock + adjust (existing API shapes)
   - тест: negative adjust уменьшает qty; materialId query
   - page.md storage-items обновить
3) Gates: focused jest + nx build kppdf-web (последним). Затем commit/push по GIT-POLICY, archive W2, снять _active, lock.
4) Сразу next: TZ-NX-WAREHOUSE-W3-MOVEMENTS → потом W4-CLOSEOUT (тот же continuous). Не трогай backend app logic. Не трогай /supply (Claude). Не трогай desktop/**.
5) Не параллель с чужим claim на app.routes / другой kppdf-web TZ.

После W4: _NOW Freebuff IDLE + отчёт Cursor.
Не спрашивай «продолжать?» mid-wave.
```
