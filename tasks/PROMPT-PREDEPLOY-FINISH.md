# PREDEPLOY FINISH — дожать код и остановиться перед production

> Для PO: запускать continuous executor **после того, как этот файл и TZ 370–372 /
> CATALOG-371 находятся в `origin/main`**. Промпт не разрешает deploy.

```text
Ты — continuous senior full-stack executor kppdf-8.0.

ЦЕЛЬ
Довести подтверждённые KP-задачи до clean origin/main и выдать честный статус
PREDEPLOY READY. Production, nginx, SSH, deploy.ps1 и wipe не запускать.

МИНИМАЛЬНЫЙ КОНТЕКСТ
- GEMINI.md
- .agents/skills/kppdf-executor-loop/SKILL.md
- docs/PO-CANON.md
- docs/agent-checklists/_NOW.md
- docs/GIT-POLICY.md
- конкретный TZ + checklist текущего этапа

ПРЕУСЛОВИЕ
1. Get-Location; git rev-parse --show-toplevel; git branch --show-current.
2. git fetch origin; сверить origin/main, worktrees, tasks/_active, conflict keys.
3. Этот prompt и TZ-SALES-371/372 + TZ-CATALOG-371 должны быть в origin/main.
   TZ-SALES-370 должен существовать в pushed `feature/TZ-SALES-370` @ c08f1373.
   Untracked-only спека = STOP: «архитекторские TZ ещё не доставлены».
4. Не stage/commit чужие dirty файлы, ruvector.db, __pycache__, dumps.
5. AUTH-305 может оставаться PREP ONLY: его ops keys не пересекаются с KP.

ОЧЕРЕДЬ СТРОГО

ЭТАП 0 — REVIEW/CLOSEOUT TZ-SALES-370
- Существующая ветка: feature/TZ-SALES-370, commit c08f1373.
- Не писать feature заново.
- Cursor review 2026-08-13:
  light/dark/narrow drawer — visual PASS;
  focused gates на c08f1373 — PASS;
  live A4 был недоступен из-за пустого template fixture. Table-template/output
  regression принимается как provisional evidence; реальная A4/photo parity
  обязательно проверяется в TZ-SALES-371.
- Обновить ветку от origin/main без force/amend.
- Повторить focused gates из checklist.
- Исправить только доказанную регрессию после rebase.
- Заполнить checklist, archive, lock, progress, удалить active marker.
- Commit/push task branch; затем безопасно доставить в main по GIT-POLICY.
- Проверить, что main содержит closeout и clean gates.

ЭТАП 1 — TZ-CATALOG-371
- CLAIM первым: tasks/_active + checklist Claim slot + conflict check.
- Выполнить tasks/TZ-CATALOG-371-product-duplicate-api.md без расширения scope.
- Обязательны unique SKU retry, copiedFromProductId, organization isolation,
  expectedVersion/409 и typed FE client.
- Gates/review/archive/lock/progress/commit/push.

ЭТАП 2 — TZ-SALES-371
- Старт только после SALES-370 в main.
- CLAIM первым.
- Прочитать landed 370 diff: не дублировать его photoUrl/rowPresentation mapping.
- Выполнить tasks/TZ-SALES-371-kp-real-product-photo-output.md.
- Проверить реальный Product.photoIds fixture, editor, A4, save+F5, server PDF,
  neutral «Нет фото», URL security и persisted sheetLayout.
- Если у fixture нет photoIds — не маскировать data gap demo-картинкой; создать
  controlled fixture для code-path evidence и записать зависимость TZD-47→MIG-303.
- Gates/browser evidence/review/archive/lock/progress/commit/push.

ЭТАП 3 — TZ-SALES-372
- Старт только после SALES-370 + SALES-371 + CATALOG-371 DONE в main.
- CLAIM первым.
- Выполнить tasks/TZ-SALES-372-kp-line-snapshot-edit-and-catalog-resolution.md.
- Инвариант: inline name/description/sku/unit меняют snapshot КП, не Product SoT.
- Решения по каждой изменённой строке:
  «Только в КП» (default) | «Обновить изделие» (expectedVersion) |
  «Создать копию» (duplicate API + rebind).
- Коммерческие qty/price/discount/optional никогда не sync в Product.
- Browser evidence: edit → close review → все три решения → F5/PDF.
- Gates/security review/archive/lock/progress/commit/push.

ЭТАП 4 — PREDEPLOY AUDIT, БЕЗ DEPLOY
1. origin/main clean; нет незакрытых SALES-370/371/372/CATALOG-371 markers.
2. Все четыре archives/locks/checklists существуют и ссылаются на full SHA.
3. Frontend/backend strict typecheck PASS.
4. Focused tests всех четырёх TZ PASS; architecture:check и git diff --check PASS.
5. Browser evidence: row drawer, real photo A4/PDF, snapshot resolution.
6. AUTH-306/303/304 остаются DONE; AUTH-305 остаётся PREP ONLY до команды PO.
7. Обновить _NOW in-place. _active-map не пополнять.
8. Не выполнять MIG-302/303, SSH, nginx, deploy.ps1 или AUTH-307.

СТОП
- conflict keys занят живым агентом;
- rebase даёт смысловой конфликт;
- нужен production/secret;
- acceptance требует изменить утверждённый snapshot/catalog canon.

ФИНАЛ
Одной карточкой:
PREDEPLOY READY: yes/no
DONE: 370 / CATALOG-371 / 371 / 372
HEAD: full origin/main SHA
Gates: кратко
Open: AUTH-305 deploy gate; AUTH-307 after cutover; data TZD-47→MIG-303
Deploy: НЕ выполнялся

Если PREDEPLOY READY=yes — остановись. Не спрашивай «деплоить?» и не запускай
ничего production: PO позже даст отдельный prompt и явное слово «деплой».
```
