# TZ-SALES-352 DONE

```
ARCHIVE_MARKER
task: TZ-SALES-352
outcome: DONE
date: 2026-08-11
agent: buffy-sales352
workspace: D:\kppdf-8.0
```

- Scope: Create КП composition/terms/status chrome shame polish; frozen shell 317, backend API, PDF engine, vitrine rail, and table layout untouched.
- Composition: empty state now gives a direct «Открыть «Товары»» path; empty custom names render and persist as «Своя строка».
- Terms: empty state has explicit Russian `Добавить условие` CTA with accessible label and test marker.
- Status/order chrome: canonical «Принято» replaces legacy «Оплачена» in unlock action and docs; «Создать заказ» remains visible with Russian disabled reason until accepted, then activates.
- Tests: focused proposal-create + terms Jest 36/36 PASS; FE TypeScript PASS; changed-file Prettier/ESLint PASS; `git diff --check` PASS.
- DOM self-verify: empty composition CTA, empty terms CTA, disabled order hint, canonical unlock label, and custom-name normalization covered by Angular fixtures.
- Constraints: no new feature, no shell rewrite, no backend, no deploy/wipe.
- Known limitation: live authenticated browser/data smoke unavailable without backend data stack; component/DOM self-check is the available UI evidence.
