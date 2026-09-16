# PROMPT — Claude: WAVE-NX-HOME (Главная)

Скопируй блок ниже целиком в Claude Code CLI (executor). Cursor Mode A код не пишет.

---

```
UNATTENDED: PO AFK. Не спрашивай «продолжать?», «ок?», permission в чате.
Работай по GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md.
agent_id: claude. Claim slot ДО первой правки кода.
После archive TZ — сразу следующий из очереди без /clear mid-wave (одна волна).
Deploy/wipe/push — только если явно в TZ (здесь НЕТ).

WAVE: docs/agent-checklists/WAVE-NX-HOME.md
PAGE: docs/pages/home.page.md
МАКЕТ (read-only): data/_tmp-maket-svyazey/  (из data/kppdf-цеховой-erp-—-макет-связей.zip)
КАНОН СВЯЗЕЙ: docs/audits/2026-09-15-ui-related-display-peer-verdict.md · docs/PO-CANON.md

Смысл: новая NX страница «Главная» (/home) = пост-логин очередь заказов.
Взять из макета: expand-in-row hub + stop-factor на ФАКТЕ + плотность карточек.
НЕ брать: React/Tailwind копипаст, variant switcher, DESK-401 split demo, ArchGuide/Parity модалки, toast-only mock writes, fake «всё ОК».

Очередь (строго по порядку):
1) tasks/_ready/2026-09-15-nx-home/TZ-NX-HOME-ROUTE-SHELL.md
2) tasks/_ready/2026-09-15-nx-home/TZ-NX-HOME-HUB-QUEUE.md
3) tasks/_ready/2026-09-15-nx-home/TZ-NX-HOME-WORKFLOW-CHIPS.md

Reuse: OrderHubTray / OrderHubFacade из @kppdf/features/order-hub — не форк HubTray.tsx.
/home ≠ дубль /orders: очередь дня + deep-links; полный реестр остаётся /orders.
Redirect '' → home (вместо admin/devices).
Paper & Ink + существующий app-shell chrome-rail.

Gates после каждого TZ: focused tsc/tests/lint по затронутому; archive+commit по GIT-POLICY.
Финиш волны: краткий отчёт (маршруты, что взято из макета, что отвергнуто).
```
