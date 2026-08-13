# Git policy — единый канон для агентов

> Этот файл разрешает противоречия между старыми prompts, checklist и skills.
> При конфликте проектной документации действует эта матрица; системные правила
> среды Cursor всегда выше.

## Матрица

### Cursor architect / TZ author

- Может менять только docs, rules, skills, TZ/checklists и безопасную конфигурацию.
- Коммит/push выполняет, только если пользователь явно попросил это в текущем чате.
- Без запроса оставляет свои файлы незакоммиченными и перечисляет их.

### Executor с CLAIMED TZ

- Выдача PO готового TZ/prompt уже авторизует product-изменения и closeout этого TZ.
- После зелёных gates и требуемого review: archive + lock + точечный commit + push.
- Без SHA на целевой remote branch claimed TZ не считается DONE.
- Mid-commit разрешён для большого зелёного куска, если это записано в checklist.

### Ad-hoc работа без CLAIM

- Диагностика/read-only не даёт права на commit/push.
- Любая мутация вне готового TZ требует явной просьбы пользователя.

## Общее

- Никогда не использовать `git add .` или `git add -A`; stage только свои пути.
- Никогда не включать чужой dirty WIP, secrets, dumps, `ruvector.db`, `__pycache__`.
- Не amend/rewrite чужих или уже pushed commits; не force-push main.
- Isolated branch/worktree пушится в свою ветку; merge в main — после review.
- Production deploy и git push — разные разрешения. Push не разрешает deploy.
- Wipe/удаление данных не разрешается никаким commit/deploy prompt без отдельной
  русской фразы PO по `docs/ops/DANGEROUS-OPS.md`.
