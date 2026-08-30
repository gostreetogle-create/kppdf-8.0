# PROMPT — Freebuff: UI Density (Paper & Ink) wave

> Инкрементальная доводка сайта. Deploy — ЗАПРЕЩЁН. Не редизайн — tokens, кегль, hairline, copy.

Скопируй **весь блок ниже** в новый чат Freebuff.

---

```text
Ты — executor kppdf-8.0. Репо: D:\kppdf-8.0
Прочитай: GEMINI.md + kppdf-executor-loop + tasks/WAVE-UI-DENSITY-PAPER-INK.md
         + docs/ui-density-canon.md + docs/AI-UI-CONTRACT.md

Deploy / wipe — ЗАПРЕЩЕНЫ. Push — можно (только свои пути).

═══ ПРИНЦИП ═══
Не менять IA, routing, бизнес-логику. Только:
- цвета/фоны (paper #fbf9f6, hairline #c4c7c7)
- кегль 11/12/13/14
- убрать shadow и rounded-lg+ на панелях
- одна gold CTA на экран
- RU copy без unfit/exception/null

═══ ЦИКЛ (на каждый TZ) ═══
1. COPY tasks/_backlog/ui-density/TZ-UI-DEN-NNN*.md → tasks/TZ-UI-DEN-NNN*.md (если ещё нет)
2. CLAIM → tasks/_active/
3. Код строго по TZ. CONFLICT с KP-WS _active или DESK-425 → DEFER, _NOW.md
4. Gates из TZ
5. Archive → tasks/_archive/2026-08/TZ-UI-DEN-NNN.done.md
6. Следующий по WAVE таблице

═══ СЕССИЯ 1 (старт PO) ═══
501 → 502 → 503 → 504 → 510 → 511
(512 только если desk wave 425…430 не в _active)

═══ STOP ═══
- DEN-552: WAIT TZ-KP-WS-409.done
- Gates FAIL ×2 → .failed.md
- Scope creep → note in report, не кодить

DoD сессии: таблица ID | outcome | archive | SHA | gates
```

---

**Когда стартовать:** после KP-WS-404 или по явной команде PO «старт DEN».
