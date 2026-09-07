# Bounded executor task

status: inactive
agent: claude
authorized_by: product-owner
task_id: TASK-YYYY-MM-DD-NAME
branch: claude/task-name
baseline: <exact SHA>
allowed_paths: src/example.py, tests/test_example.py
allowed_commands: git status --short | git diff -- src/example.py tests/test_example.py | python -m pytest tests/test_example.py
commit_command: git commit -m "claude: implement bounded task"
acceptance: <проверяемый критерий>
stop_condition: scope grows, baseline changes, tests fail, files overlap

## Handoff

Цель, инварианты, ожидаемое поведение и ownership других агентов.

Перед использованием Codex меняет `status` на `active`, указывает нужного агента и точные значения. После приёмки marker возвращается в `inactive` отдельным control-plane изменением.
