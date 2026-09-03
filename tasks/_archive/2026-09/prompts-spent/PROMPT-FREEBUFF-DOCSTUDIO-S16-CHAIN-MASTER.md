# PROMPT — Freebuff: Doc Studio S16→S26 (11 TZ continuous)

```
═══ START ═══

Continuous executor · D:\kppdf-8.0 · main

Прочитай: GEMINI.md · kppdf-executor-loop/SKILL.md · docs/PO-CANON.md

WAVE-CHECKLIST (SoT прогресса — открыть ПЕРВЫМ):
  docs/agent-checklists/WAVE-DOCSTUDIO-S16-CHAIN.md

Начни с ПЕРВОЙ строки chain где [ ] (не [x]). Пропускай уже [x].

Roadmap: docs/architecture/nx-doc-studio-roadmap-v2.md

═══ ЖЁСТКО: НЕ ОСТАНАВЛИВАТЬСЯ ═══

ЗАПРЕЩЕНО завершать turn / писать «готово» / «S17 готова к продолжению» после одной TZ.
После commit+push — СРАЗУ claim следующей TZ из checklist. Без паузы. Без вопроса PO.

Единственные причины STOP:
  (a) все 11 пунктов chain = [x] и closeout checklist [x]
  (b) blocker без обхода (напиши blocker + что пробовал)

Если контекст переполнен: /clear → RESUME:
  tasks/PROMPT-FREEBUFF-DOCSTUDIO-S16-CHAIN-RESUME.md

═══ ЦИКЛ (повторять до [x] на всех 11) ═══

CLAIM → код → gates → archive → commit+push → отметить [x] в WAVE-CHAIN → СЛЕДУЮЩАЯ TZ

Gates каждой TZ: nx build kppdf-web PASS последним.

═══ ПОРЯДОК (пропускай [x]) ═══

 1. S16 RAIL-IA-SPLIT          tasks/TZ-NX-DOCSTUDIO-S16-RAIL-IA-SPLIT.md
 2. S17 RIBBON-PAGES-PANEL     tasks/TZ-NX-DOCSTUDIO-S17-RIBBON-PAGES-PANEL.md
 3. S17A TABLE-COLUMN-LOCK     tasks/TZ-NX-DOCSTUDIO-S17A-TABLE-TEMPLATE-COLUMN-LOCK.md
 4. S18 SAVE-AS-MENU           tasks/TZ-NX-DOCSTUDIO-S18-SAVE-AS-MENU.md
 5. S19 STUDIO-DELETE          tasks/TZ-NX-DOCSTUDIO-S19-STUDIO-DELETE.md
 5b.S19B TEMPLATE-PICKER-DELETE tasks/TZ-NX-DOCSTUDIO-S19B-TEMPLATE-PICKER-DELETE.md
 6a.S20-PRE QUOTATIONS-CRUD     tasks/TZ-NX-SALES-PI-QUOTATIONS-CRUD.md  ← перед S20
 6. S20 KP-QUOTATION-LIFECYCLE  tasks/TZ-NX-DOCSTUDIO-S20-KP-QUOTATION-LIFECYCLE.md
 7. S22 REGISTRY-VAT-RATE      tasks/TZ-NX-REGISTRIES-VAT-RATE.md
 8. S21 TABLE-AGGREGATE-TOKENS tasks/TZ-NX-DOCSTUDIO-S21-TABLE-AGGREGATE-TOKENS.md
 9. S23 FORMULA-REGISTRY       tasks/TZ-NX-DOCSTUDIO-S23-FORMULA-REGISTRY.md
10. S24 FORMULA-TEXT-BINDING   tasks/TZ-NX-DOCSTUDIO-S24-FORMULA-TEXT-BINDING.md
11. S26 OPERATOR-DOCS-V3       tasks/TZ-NX-DOCSTUDIO-S26-OPERATOR-DOCS-V3.md

═══ ФИНАЛ (только после шага 11) ═══

WAVE-CHAIN все [x] · closeout [x] · _active/ пуст · QUEUE/_NOW · push

═══ END ═══
```
