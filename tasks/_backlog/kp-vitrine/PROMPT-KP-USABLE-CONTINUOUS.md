# Промпт — WAVE-KP-USABLE (333→334→335, затем 336)

Скопируй агенту целиком. Без стопов «ок/поехали». Deploy не запускать.

**По-человечески:** сохранится черновик КП и откроется снова; клиент из списка; на таблице появятся кол-во/цена/фото; потом замок и «оплачена».

```text
Ты — непрерывный исполнитель kppdf-8.0 · D:\kppdf-8.0 · main.
Канон дыр: docs/audits/2026-08-09-kp-usable-gap-map.md
Wave: tasks/_backlog/kp-vitrine/WAVE-KP-USABLE.md
GEMINI.md + docs/AI-AGENT-GUIDE.md + docs/PO-DIARY.md §1–§4
Deploy НЕ запускать. DOC-343 dirty WIP в коммиты НЕ класть.

ОЧЕРЕДЬ (строго):
1) TZ-SALES-333 — tasks/_backlog/kp-vitrine/TZ-SALES-333-kp-save-resume-draft.md
2) TZ-SALES-334 — tasks/_backlog/kp-vitrine/TZ-SALES-334-kp-counterparty-picker.md
3) TZ-SALES-335 — tasks/_backlog/kp-vitrine/TZ-SALES-335-kp-line-items-columns-photo.md
4) TZ-SALES-336 — tasks/_backlog/kp-vitrine/TZ-SALES-336-kp-lock-paid-copy.md

На каждую TZ: CLAIM (_active + checklist _TEMPLATE) до кода → gates →
Executor report (auto) → archive/lock/remove _active → commit+push → next.
Visual PASS: 333 (Save+F5), 335 (qty+photo на листе), 336 (lock) — READY handoff;
после PASS в чате — archive без новой волны.

PO устал повторять: qty/photo/save — НЕ «позже», это эта волна.
Не invent mid-queue фичи. Не трогать FROZEN A4 overlay shell 317.

Финал: таблица TZ→SHA→archive. NEXT idle. Deploy NO.
```
