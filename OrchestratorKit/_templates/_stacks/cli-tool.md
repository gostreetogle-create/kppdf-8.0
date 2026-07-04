# Stack Template: CLI Tool

> Используй для утилит командной строки на **Python**, **Go**, **Rust**, **Node**.

## Stacks

- **Python 3.12+** — Click, Typer (рекомендую), argparse
- **Go 1.22+** — Cobra, urfave/cli
- **Rust 1.75+** — clap (рекомендую), structopt
- **Node 22+** — Commander.js, oclif

## LAYER по умолчанию

| Файл трогает | LAYER |
|---------------|-------|
| `*.md` / `docs/*` (только документация) | **1** — до 2 параллельно |
| `tests/*` (только тесты) | **1** — до 2 параллельно |
| Новый subcommand (отдельный файл) | **2** — до 2 параллельно |
| Edit существующего subcommand | **3** — СТРОГО 1 (touch API) |
| `Cargo.toml` / `pyproject.toml` / `go.mod` | **4** — СТРОГО 1 (ломает build) |
| `src/main.rs` / `src/main.py` (entry point) | **3** — СТРОГО 1 |

## CONFLICT KEYS — примеры

```
# TZ-01 (новый subcommand):
src/commands/init.rs
src/commands/init_test.rs

# TZ-02 (edit config loader):
src/config.rs
src/config_test.rs

# TZ-03 (новая утилита):
src/utils/format.rs
src/utils/format_test.rs

# TZ-04 (только документация):
README.md
docs/usage.md
```

## ШАГ 2: build / typecheck / test команды

```bash
# Python (Poetry):
poetry build && poetry run pytest && poetry run mypy .

# Python (uv / pip):
python -m build && pytest && mypy .

# Go:
go build -o bin/myapp . && go test ./... && go vet ./...

# Rust:
cargo build --release && cargo test && cargo clippy

# Node (oclif):
npm run build && npm test && npm run lint
```

## Частые acceptance criteria

1. Build exit 0.
2. `--help` показывает новую команду.
3. `myapp new-command --flag value` работает (manual test).
4. Тесты passed (unit + integration).
5. `bash OrchestratorKit/verify-status.sh` exit 0.

## Рекомендуемая структура папок

```
# Rust:
src/
├── main.rs              ← entry point
├── commands/
│   ├── mod.rs
│   ├── init.rs
│   └── deploy.rs
├── config.rs
└── utils/
    ├── format.rs
    └── fs.rs
tests/
└── integration_test.rs

# Python:
src/
├── myapp/
│   ├── __init__.py
│   ├── __main__.py     ← entry point
│   ├── cli.py          ← main CLI
│   ├── commands/
│   │   ├── init.py
│   │   └── deploy.py
│   └── utils/
tests/
└── test_commands.py
```

## Чеклист перед ШАГ 0

- [ ] Build exit 0 на чистом checkout
- [ ] `myapp --help` работает
- [ ] Все subcommands в отдельных файлах (не в main)
- [ ] Тесты покрывают новые commands
- [ ] README с примерами использования
- [ ] `.gitignore` исключает `target/`, `dist/`, `__pycache__/`

## Советы по стилю CLI

- Используй **стандартные exit codes**: 0 = success, 1 = error, 2 = invalid usage.
- Вывод ошибок в **stderr**, нормальный output в **stdout** (для piping).
- Поддерживай `--json` флаг для machine-readable output.
- Поддерживай `--quiet` / `--verbose` флаги.
- Документация: каждая команда имеет `--help` с примерами.
