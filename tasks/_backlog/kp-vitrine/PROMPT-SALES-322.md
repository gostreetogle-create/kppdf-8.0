# Промпт — TZ-SALES-322 (только после снятия PARK)

Агент сделает в **Параметрах** КП: если бланк устарел относительно шаблона в конструкторе — предложит кнопку «Обновить бланк» (не автоматом). Сейчас задача **PARK** — не claim, пока нет snapshot на Save и не закрыт 321.

Когда оркестратор скажет «сними PARK / выполняй 322», скопируй:

```text
CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) Проверь PARK снят: snapshot persist уже в main; TZ-SALES-321 DONE; нет конфликта _active
3) tasks/_active/TZ-SALES-322.md + checklist docs/agent-checklists/TZ-SALES-322.md
4) Claim slot: agent_id + claimed_at (ISO) + workspace
5) Прочитай NOTE-KP-template-snapshot-lock.md + TZ-SALES-322-kp-stale-template-refresh.md

Суть: в inspector Параметры — детект stale (revision/hash шаблона vs КП);
кнопка «Обновить бланк» + confirm → новый templateSnapshot из build();
hard-lock статусы без CTA; без авто-обновления всех КП при save builder.

Gates: по TZ (quotation + proposal-create / зона FE+BE).
Archive после Cursor/PO PASS. Deploy: НЕТ.
```
