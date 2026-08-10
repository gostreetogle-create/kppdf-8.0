# Контрольный / resume-промпт (агент УЖЕ мог стартовать)

Скопируй агенту **целиком**, даже если он уже в середине `WAVE-TABLES-TODAY`.  
Это **не новая волна с нуля** — это самопроверка + дожим. Не спрашивай PO «ок/поехали».

**По-человечески:** проверь, что реально в коде на `main`, закрой застрявший 305, полировку диалога таблиц отложи, доделай пресет КП и Create (раскладка + наценка/НДС), в конце отчитайся SHA.

---

```text
RESUME / CONTROL — kppdf-8.0 · D:\kppdf-8.0 · ветка main
Ты уже могли получить PROMPT-TABLES-TODAY-CONTINUOUS. НЕ начинай очередь «с листа» заново.
Сначала АУДИТ факта, потом только недоделанное. Deploy НЕ запускать.
Чужой dirty (DOC-343 / document-template.service.ts orientation WIP) в свои коммиты НЕ класть.

════════════════════════════════════════════════════════════
ШАГ A — САМОПРОВЕРКА (обязательно, до любого нового кода)
════════════════════════════════════════════════════════════
Выполни и зафиксируй в ответе таблицу FACT:

1) git pull --ff-only (если clean); git status -sb; git log -15 --oneline
2) tasks/_active/* — что CLAIMED / BLOCKED
3) По каждой TZ ниже: DONE в archive+lock+код ИЛИ нет:

| TZ | Как проверить DONE |
|----|-------------------|
| DOC-TABLES-305 | archive `tasks/_archive/2026-08/TZ-DOC-TABLES-305.done.md` + нет `_active/TZ-DOC-TABLES-305.md` + checklist DONE |
| DOC-TABLES-306 | chip «Из данных» не уводит на /materials (код + archive) |
| DOC-TABLES-308 | dialog layout/preview по TZ + archive |
| DOC-TABLES-307 | в schema/DTO есть category `kp`; seed «КП — позиции»; apply-preset в UI; archive |
| SALES-330 | в Create есть панель/секция «Таблица»; build принимает tableLayout; НЕ PATCH TableTemplate; archive или READY FOR REVIEW |
| SALES-331 | наценка меняет unitPrice в previewLines на листе; footer Итого/НДС; archive или READY FOR REVIEW |

Код-маркеры (если нет в backend/frontend — TZ НЕ DONE, даже если есть markdown):
- `kp` в TableTemplateCategory
- `tableLayout` / `kpTableLayout`
- `dealVatPercent` / `dealTotals` / footer «в т.ч. НДС»

Только docs/checkpoints без кода = НЕ сделано.

════════════════════════════════════════════════════════════
ШАГ B — ПОЛИТИКА ОЧЕРЕДИ НА СЕГОДНЯ (чтобы дойти до Create КП)
════════════════════════════════════════════════════════════
Цель вечера: Create КП ближе к usable (товары уже есть) + пресет/раскладка/наценка/НДС.

ПОРЯДОК ДОЖИМА:

B0) TZ-DOC-TABLES-305
   - Считать visual PASS по контролам УЖЕ данным PO (Тип overflow + multi-поля).
   - Если ещё в `_active` / BLOCKED — СРАЗУ closeout: Executor report (auto) → archive → lock → удалить `_active` → commit+push closeout only.
   - НЕ ждать нового «поехали». Полировка ≠ блокер.

B1) TZ-DOC-TABLES-306 и TZ-DOC-TABLES-308
   - Если ЕЩЁ НЕ в работе кодом — PARK на сегодня (не claim). Запиши в _active-map: PARKED for evening KP path.
   - Если УЖЕ CLAIMED и правишь код — добей ТЕКУЩУЮ до gates+archive, потом НЕ бери следующую из 306/308; прыгай на 307.
   - Не начинай 308 «для красоты», пока 307/330/331 не DONE.

B2) TZ-DOC-TABLES-307 — ОБЯЗАТЕЛЬНО если не DONE
   Spec: tasks/_backlog/doc-tables/TZ-DOC-TABLES-307-kp-category-preset.md
   Checklist: docs/agent-checklists/TZ-DOC-TABLES-307.md
   CLAIM → код → gates → archive → commit+push → next

B3) TZ-SALES-330 — ОБЯЗАТЕЛЬНО если не DONE
   Spec: tasks/_backlog/kp-vitrine/TZ-SALES-330-kp-table-layout-instance.md
   Checklist: docs/agent-checklists/TZ-SALES-330.md
   Экземпляр раскладки; не PATCH shared TableTemplate.
   Gates → если нужен visual: READY FOR REVIEW + короткий handoff в отчёте, но очередь не бросай:
   после PASS PO в чате / если AC позволяют без PO — archive и сразу 331.
   Если visual ждёт человека — всё равно доведи код до READY, затем стартуй 331 только если keys свободны; иначе оставь 331 CLAIM после archive 330.

B4) TZ-SALES-331 — ОБЯЗАТЕЛЬНО если не DONE
   Spec: tasks/_backlog/kp-vitrine/TZ-SALES-331-kp-deal-price-vat-footer.md
   Checklist: docs/agent-checklists/TZ-SALES-331.md
   Наценка→цена на листе; НДС в подвале на всё КП; без колонки скидки.

НЕ ДЕЛАТЬ в этом resume:
- Deploy
- Print 320 / snapshot 322
- Новый полный конструктор колонок
- Save Quotation / Counterparty picker — OUT OF SCOPE этого resume (отдельный successor; упомяни в финальном NEXT)
- Graphify / mid-queue вопросы PO

════════════════════════════════════════════════════════════
ШАГ C — CLAIM (на каждую недоделанную TZ)
════════════════════════════════════════════════════════════
До кода каждой TZ:
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/<ID>.md + checklist (_TEMPLATE + Integrity)
3) Status CLAIMED; agent_id + claimed_at ISO + workspace
4) _active-map + чужие keys → конфликт = STOP только этой TZ
5) Team Room claim best-effort

════════════════════════════════════════════════════════════
ШАГ D — ФИНАЛЬНЫЙ ОТЧЁТ PO (после дожима)
════════════════════════════════════════════════════════════
Таблица:

| TZ | Было до resume | Стало | full SHA feat | archive path |
|----|----------------|-------|---------------|--------------|

Плюс 5 строк FACT: что умеет Create КП сейчас (товары / org / наценка на листе / панель Таблица / НДС footer).
NEXT одной строкой: «Клиент + Save Quotation — отдельная TZ; 306/308 PARK».
Deploy: NO.

Если 330/331 ждут visual PASS — явно: «нужен взгляд PO на /proposals/create» + что кликнуть.
```
