# Continue — копируй в тот же чат (после rate limit)

```
Снова rate limit — продолжай СРАЗУ, без пересказа.

Состояние: код COMPOSE-301 почти готов, но на origin/main ЕЩЁ НЕТ
(последний main = docs continue prompt). Нужен commit + rebase на origin/main + push.

1) git status / log — если есть uncommitted COMPOSE-301 изменения:
   commit (только свои keys: module-form, picker, bom-panel, specs, docs COMPOSE,
   archive/checklist/progress — НЕ materials/**, НЕ desktop, НЕ FACT-304)
2) git fetch && rebase origin/main (resolve module-detail/product-detail docs если конфликт)
3) git push origin HEAD
4) Докажи: origin/main содержит feat COMPOSE-301; picker default material;
   module-form composition-hint; archive TZ-UX-COMPOSE-301.done.*

5) Сразу TZ-UX-DIALOG-305 до archive+push
   (ModuleForm + composition picker maxWidth 1120 как material).

FACT-304 не трогай. Deploy запрещён.
Если workspace пустой и изменений нет — перечитай
tasks/TZ-UX-COMPOSE-301-module-composition-discoverability.md и сделай заново на main.
```
