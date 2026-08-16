# TZD-56: Desktop AI — NSIS sidecar / bundled ai-runner (successor TZD-55)

STATUS: BACKLOG  
Wave: `tasks/_backlog/desktop/WAVE-DESKTOP-IA-SHELL.md`  
Depends: **TZD-55 DONE** (resolver + RU errors already on main)

## Зачем

TZD-55 убрал cryptic crash и дал env/`openModelFolder`. В **чистом NSIS** без исходников
`src/ai-runner` + `node_modules/tsx` раннер всё ещё не стартует. Нужен Option A/B из TZD-55:
resource/sidecar или один `ai-runner.cjs`/binary + deps.

## Не делать сейчас

Пока PO не приоритизирует «модель реально крутится в install» — можно ждать после
deploy 0.5.5/0.5.6 и smoke трёх дверей.

## Набросок AC

- [ ] Установленный билд: «Запустить» поднимает раннер без `KPPDF_AI_RUNNER_DIR` на monorepo
- [ ] Dev `tauri dev` не сломан
- [ ] Bump installer (0.5.6+) + warm deploy только по «кати»
- [ ] Без wipe; Import/Form Studio не трогать

PROMPT (когда брать):

```text
Прочитай GEMINI.md + tasks/_backlog/desktop/TZD-56-desktop-ai-runner-nsis-sidecar.md
+ archive TZD-55. CLAIM → sidecar/bundle ai-runner → gates → bump только по PO.
Deploy запрещён без «кати».
```
