# Промпт свободному агенту — WAVE-CATALOG-UX-C

```
SoT: D:\kppdf-8.0 на main. Прочитай GEMINI.md + OrchestratorKit/AGENTS.md +
tasks/_backlog/catalog-ux-c/WAVE-CATALOG-UX-C.md.

Порядок строго:
1) TZ-UX-COMPOSE-301
2) TZ-UX-DIALOG-305
3) TZ-CATALOG-337 — только после archive FACT-304 (не трогай materials/** пока B жив)
4) TZ-PRODUCTS-307
5) TZ-UX-DIALOG-304

Канон состава: модуль→модуль|материал; изделие→изделие|модуль.
Состав только BomPanel — не воскрешать ModuleMaterials.
Цикл: claim → code → gates → archive → commit+push → next.
Deploy запрещён без команды PO. Чужой WIP не коммитить.
```
