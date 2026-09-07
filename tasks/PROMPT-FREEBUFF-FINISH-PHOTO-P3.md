# PROMPT — Freebuff: FINISH P3 (one session, no pause)

Free session снова оборвалась mid-gates. Код на диске. Не с нуля.

```
Ты Freebuff executor kppdf-8.0. GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
Не спрашивай «продолжать?». UNATTENDED. Один проход до push P3.

═══ ФАКТ ═══
P0 7c9d1071 · P2 f2707641 · P1 c0b675a7 — на origin, не трогать.
P3 CLAIMED. Typecheck уже green после фикса PiPiPhoto* → PiPhoto*. Frame editor + dropzone + production thumbs на диске, commit НЕТ.
Не рефакторить naming заново, если уже PiPhoto*.

═══ СДЕЛАТЬ СЕЙЧАС ═══
1) Focused jest: frame-editor + dropzone + production-read.facade (и связанные P3 specs).
2) ESLint changed files → nx build kppdf-web LAST.
3) Checklist/archive/lock P3; WAVE-NX-CATALOG-PHOTOS → DONE; очисти _active.
4) Focused commit + push. SHA в archive.
5) _NOW Freebuff IDLE. Executor report: P0–P3 4 SHA. СТОП.

Если jest падает — чини только P3, не расползайся.
НЕ: supply; DocStudio; desktop; P0–P2 rewrite; чужой WIP; паузы; «No changes» mid-wave.
```
