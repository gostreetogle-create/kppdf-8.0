# Bundled AI runner (TZD-56)

Этот каталог заполняет `desktop/scripts/bundle-ai-runner.mjs` перед `tauri build`.

В git только этот README. `ai-runner.mjs` и `node_modules/` — артефакты (см. `desktop/.gitignore`).

Dev (`tauri dev`) раннер берёт из `desktop/src/ai-runner` через `tsx`, не отсюда.
