# Continue после rate limit — копируй в тот же чат

```
Rate limit ок — продолжай в том же workspace, не начинай с нуля.

1) Добей TZ-UX-COMPOSE-301 до конца:
   - module-form composition-hint
   - picker restrictToModule → default activeKind 'material'
   - bom-panel root-add когда выбран материал
   - tests PASS; docs
   - archive + checklist DONE + commit+push на origin/main
   Файлы: tasks/TZ-UX-COMPOSE-301-*.md

2) Сразу TZ-UX-DIALOG-305 (module form + composition picker = 1120 kind C),
   archive + commit+push.

3) FACT-304 в _active не трогай. CATALOG-337 только если FACT-304 уже archived.

Deploy запрещён. Чужой WIP (materials/**, desktop) не коммить.
Если локальные правки уже есть — проверь git status, доведи gates, push.
Если workspace пустой / нет изменений — перечитай TZ и сделай заново на D:\kppdf-8.0 main.
```
