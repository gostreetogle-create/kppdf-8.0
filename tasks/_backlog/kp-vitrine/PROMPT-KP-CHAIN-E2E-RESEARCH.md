# Промпт — полный аудит цепочки «Документы → таблицы → Create КП → PDF»

Скопируй агенту **целиком**, когда WAVE-KP-USABLE (337→336) **закрыта** или `_active` пуст по proposal-create keys.  
Это **research + thin fixes + TZ backlog**, не бесконечный рефакторинг.

**По-человечески:** пройти всю цепочку бланка КП, найти дубли/дыры/стыд, мелочи починить сразу, крупное — в TZ. В конце выбрать бесплатный OSS для печати PDF из уже готового HTML бланка.

---

```text
ROLE: senior product+tech auditor for kppdf-8.0 (NestJS + Angular).
ROOT: D:\kppdf-8.0 · branch main · Deploy НЕ запускать.
DOC-343 / чужой dirty WIP в коммиты НЕ класть.
Не mid-queue спрашивать PO «ок?». Не invent фичи вне цепочки КП.

GOAL (DoD сессии):
1) Карта цепочки end-to-end (документы/шаблоны/таблицы/тексты → builder → Create КП → save/lock → PDF).
2) Список дефектов с severity P0/P1/P2 + evidence (file:line или route).
3) Thin fixes (≤1–2 файлов, без schema mega-migration) — чинить СРАЗУ, commit+push по фиксу.
4) Всё крупнее → executable TZ в tasks/_backlog/kp-vitrine/ (+ checklist RESERVED) + WAVE файл.
5) PDF: выбрать ОДИН OSS путь и написать TZ-SALES-320 UNPARK / successor с conflict keys и AC.
6) Итоговый отчёт PO ≤40 строк + путь к полному аудиту.

════════════════════════════════════════════════════════════
МЕТОД (обязательный порядок)
════════════════════════════════════════════════════════════
A. Preflight
   - git pull --ff-only если clean; git status; tasks/_active/ — конфликт keys Create/builder/tables = STOP только на зоне конфликта, остальное аудируй read-only.
   - Прочитай: docs/audits/2026-08-09-kp-usable-gap-map.md; docs/audits/2026-08-09-kp-table-config-canon.md; docs/ux/kp-create-studio-spec.md; NOTE-KP-template-snapshot-lock.md; docs/pages/proposals-create.page.md; tables.page.md; builder.page.md; PAGE-TZ-INDEX строки КП/Документы.

B. Chain walk (как менеджер + как код)
   Маршруты/экраны:
   /doc-constructor/templates → builder → texts → tables → /proposals/create → /proposals
   Для каждого: что делает PO; SoT данных; write-path; дубли UI; dead ends; F5/session.
   Код: document-template build/preview; table-template; template blocks; proposal-create*; quotation.*; Pi UI kit reuse vs one-off.

C. Smell matrix (обязательные вопросы)
   - Дубли панелей/кнопок/write-path (как был дубль Таблица в Параметрах)?
   - Циклы: Create ↔ Builder ↔ TableTemplate PATCH из Create?
   - Snapshot vs live build: когда что истина?
   - Column keys / bind / multi-table target согласованы FE↔BE?
   - Paper&Ink / Pi* reuse vs сырой HTML в flyouts?
   - Performance: лишние rebuild, отсутствие debounce, огромные HTML в signals?
   - A11y/RU copy / empty states стыдные для демо?
   - Print: что уже есть (320 PARK); что нужно для 1-клик PDF с A4 fidelity.

D. Thin fix budget
   Можно чинить на ходу ТОЛЬКО если:
   - не трогает >3 conflict-key файлов;
   - не schema migration / не deploy;
   - есть тест или явный DOM AC;
   - не ломает параллельный _active.
   Иначе → TZ.

E. PDF decision (не спрашивать PO server vs client)
   Рекомендация по умолчанию для kppdf (зафиксировать в аудите + TZ):
   **Server-side HTML→PDF через Playwright (или Puppeteer) в Nest**, вход = уже существующий `build()` HTML (тот же, что iframe Create).
   Почему: A4 + backgrounds уже на бэке; один SoT с превью; OSS/бесплатно; без «печать из браузера криво».
   Альтернатива later: Gotenberg (Docker) если Chromium в процессе Nest тяжёл на проде — указать как optional ops TZ, не блокировать MVP.
   НЕ выбирать платные SaaS. НЕ window.print как единственный путь.
   Написать TZ: кнопка «Скачать PDF» на Create (и/или карточке КП) → API → PDF buffer; AC visual/file; conflict keys.

F. Deliverables (обязательно сохранить в git)
   1) docs/audits/YYYY-MM-DD-kp-chain-endtoend-audit.md
      секции: Map (mermaid ok) · Findings P0/P1/P2 · Thin fixes done (SHA) · TZ backlog · PDF decision · Residual risks
   2) tasks/_backlog/kp-vitrine/WAVE-KP-CHAIN-HARDENING.md — очередь TZ по findings
   3) Executable TZ файлы для P0/P1 (вкл. PDF unpark/successor)
   4) Checklists RESERVED + строка в docs/agent-checklists/_active-map.md
   5) Обновить PAGE-TZ-INDEX / proposals-create.page.md ссылкой на аудит
   6) Commit+push docs/TZ (и thin code fixes отдельными conventional commits)

G. Что НЕ делать
   - Полный rewrite Angular app / новый DSL с нуля
   - Graphify / сторонние граф-игрушки
   - Deploy / production secrets
   - Одновременно claim всех Layer-3 god files без очереди
   - Спрашивать PO про server vs client PDF

H. Финальный отчёт PO (в чат, коротко)
   - 5 буллетов: здоровье цепочки
   - P0 список + какие TZ
   - что починил на ходу (SHA)
   - PDF выбор одной строкой
   - NEXT: continuous prompt path для WAVE-KP-CHAIN-HARDENING
```
