# PROMPT — Claude continuous: DocStudio catalog table IA (финальная волна)

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + how-to-connect-ai + kppdf-executor-loop.
UNATTENDED. Не спрашивай «продолжать?».

═══ WAVE-NX-DOCSTUDIO-CATALOG-TABLE-IA — ПОСЛЕДНЯЯ волна по этим таблицам ═══
PO: один kind → ОДНА таблица; общий «Выбрано»; без per-table subsets.
WAVE DoD: docs/agent-checklists/WAVE-NX-DOCSTUDIO-CATALOG-TABLE-IA.md (закрыть все чекбоксы DoD).
Synthesis: docs/audits/2026-09-12-docstudio-catalog-tables-peer-synthesis.md

КОРЕНЬ (обязательно починить в #2, не «улучшить»):
refreshLiveDataSetsOnLoad сейчас шлёт putDataSet ПАРАЛЛЕЛЬНО с одной revision → 409 →
молча пустые таблицы. Нужна SERIAL очередь (как commitCatalogSelectionChange / catalogWriteChain).

Чеклист: docs/agent-checklists/DOCSTUDIO-CATALOG-TABLE-IA-CHECKLIST.md
(статусы IN_WORK/DONE+SHA по 1→2→3→4). Перед стадией Architect gate 5–10 мин.
Глобальный коллапс → deferred + next. Мелкие on-path ok.

═══ ОЧЕРЕДЬ (строго по порядку) ═══
1) tasks/_ready/nx-docstudio/TZ-NX-DOCSTUDIO-CATALOG-INSERT-HONEST.md
   existing → toast + activate + refreshCatalogTablesOfKind; else create+wire. НЕ дубль.

2) tasks/_ready/nx-docstudio/TZ-NX-DOCSTUDIO-CATALOG-HYDRATE-ALL.md
   SERIAL hydrate всех live tables on load; helper refreshCatalogTablesOfKind;
   spec: N tables → возрастающие expectedRevision. Это главный фикс рецидива.

3) tasks/_ready/nx-docstudio/TZ-NX-DOCSTUDIO-TABLE-UNWIRED-EMPTY-STATE.md
   Разные RU empty: без source vs live-source пусто. НЕ auto-wire всех.

4) tasks/TZ-NX-DOCSTUDIO-VITRINA-EDIT.md
   «Изменить» → form dialog; после Save: vitrina refresh + refreshCatalogTablesOfKind
   (фото на A4 без F5).

После каждой: claim→gates (nx build last)→archive→commit→push→чеклист→next.
Финал: все DoD чекбоксы; WAVE COMPLETE; _NOW IDLE; Executor report #→SHA.
В отчёте явно: «serial hydrate spec PASS» + «vitrina edit refresh kind PASS».

НЕ: per-table selections; bake liveRows GET; expand S15; wipe; deploy; /production;
НЕ заводить ещё одну TZ «починить таблицы/фото» внутри этой волны — DoD закрывает тему.
```
