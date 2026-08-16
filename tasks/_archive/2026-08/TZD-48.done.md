# TZD-48.done — Desktop Import Studio release blockers for 0.5.3

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T12:25:00+03:00
closed_by: buffy (desktop executor)
TZ: TZD-48
DEP: none (WIP сессии 2026-08-16 в рабочем дереве)

verification:
  - acceptance criteria: PASS (все 10 блокеров из TZ)
  - typecheck: PASS (desktop + backend tsc --noEmit)
  - svelte-check: PASS (0 errors, 0 warnings)
  - desktop tests: PASS 46/46 (вкл. новые: partial AI map, counterparty inn, sheet-with-data, URL allowlist)
  - backend jest: PASS 12/12 (import-mapping-profile: empty profile 400, dual-state normalize)
  - smoke ai-runner: PASS (non-HF URL отклонён, job принят мгновенно, models/ создан)
  - checklist: DONE (docs/agent-checklists/TZD-48.md)
  - progress.md: UPDATED
  - cursor verdict: PASS (b03ecc22060f4d20c6d559c043910ea4701b5d87)
  - commit: b03ecc22060f4d20c6d559c043910ea4701b5d87 (pushed e108e22a..b03ecc22 → main)

## Outcome

- **AI-runner скачивание:** `POST /download` принимает задачу и отвечает мгновенно; прогресс — только в `GET /download/status`; каталог `models/` создаётся (mkdir recursive); URL строго из allowlist (HTTPS Hugging Face, проверка на каждом редиректе); «файл не скачан» не sticky — после скачивания «Перезапустить» загружает модель.
- **Частичный merge AI-карты:** `applyTableMapping` меняет только присутствующие ключи; пустой `{}` от модели не обнуляет эвристики классификатора.
- **Честность SoT:** блоки с изделиями/модулями/контрагентами — кнопка «Записать в каталог» + `confirm()` перед записью; hint в шаге 2 предупреждает о прямом создании; материалы — через журнал предложений. `finalizeInboxFileIfDone` переносит в `processed/` только при (proposed+created)>0.
- **Inbox Excel:** импортёр читает лист с данными (activeSheet), а не слепой `sheets[0]`; понятная ошибка при отсутствии данных.
- **BE/FE валидация:** counterparty `requiredFields: ['name','inn']`; `bom` убран из `IMPORT_MAPPING_TARGETS`; `isImportTargetKey` guard + RU-сообщение для неизвестных сущностей; BE отклоняет пустой профиль (400) и нормализует legacy `columnMap` в `tables` при update (одна SoT-форма).
- **Копи «Модель»:** честный порядок «Запустить → Скачать → Перезапустить»; название вкладки — «Студия импорта».

## Verification

- `desktop npx tsc --noEmit`: PASS
- `desktop npx svelte-check --threshold error`: PASS (0/0)
- `desktop npx tsx --test src/core/*.test.ts src/core/ai/*.test.ts src/importers/*.test.ts src/ai-runner/*.test.ts`: PASS 46/46
- `backend npx jest src/modules/import-mapping-profile --no-coverage`: PASS 12/12
- Smoke ai-runner (port 9785): PASS
- deploy: NOT RUN (PO: no deploy)

## Files

- `desktop/src/ai-runner/index.ts`, `desktop/src/ai-runner/security.ts`, `desktop/src/ai-runner/security.test.ts`
- `desktop/src/core/aiRunner.ts`, `desktop/src/core/multi-import.ts`, `desktop/src/core/multi-import.test.ts`
- `desktop/src/core/import-targets.ts`, `desktop/src/core/import-mapping-profiles.ts`
- `desktop/src/importers/excel.ts`, `desktop/src/importers/excel.test.ts`
- `desktop/src/App.svelte`, `desktop/src/core/config.ts`
- `desktop/src/core/ai/suggest-mapping.ts`, `desktop/src/core/ai/suggest-mapping.test.ts`
- `desktop/src/core/import-mapping.ts`, `desktop/src/core/import-mapping.test.ts`
- `desktop/src/core/specification-import.ts`, `desktop/src/core/specification-import.test.ts`
- `desktop/src/core/model-catalog.ts`, `desktop/src/core/model-catalog.test.ts`
- `desktop/src-tauri/capabilities/default.json`, `desktop/package.json`, `desktop/pnpm-lock.yaml`, `desktop/pnpm-workspace.yaml`, `desktop/src-tauri/tauri.conf.json`
- `backend/src/modules/import-mapping-profile/dto/import-mapping-profile.dto.ts`
- `backend/src/modules/import-mapping-profile/import-mapping-profile.schema.ts`
- `backend/src/modules/import-mapping-profile/import-mapping-profile.service.spec.ts`
- `backend/src/modules/import-mapping-profile/import-mapping-profile.service.ts`
- `docs/agent-checklists/TZD-48.md`

## Known limits (successor TZD-49)

- Journal HITL для product/module/counterparty (единый write-path)
- Spec confirm lookup без `limit=100` (поиск по article)
- Размеры/вес CAD-колонок в маппинг; имена пустых модулей CAD
- Session-per-chat для Llama; auto-restart после download
- Живой прогон GGUF на файле PO; сужение FS scope / CSP
- Sample rows в AI-промпт сопоставления
