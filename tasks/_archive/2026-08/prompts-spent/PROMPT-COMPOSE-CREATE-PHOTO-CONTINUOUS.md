# Промпт — WAVE-COMPOSE-CREATE-PHOTO

Скопируй агенту **целиком**. Один промпт = фазы **340 → 342 → 341 → 343**.
При обрыве: вставь **тот же** промпт снова — агент читает MASTER и продолжает с первого незакрытого `[ ]`.

Deploy / wipe **не** запускать. Не ждать «ок» mid-queue.

```text
Ты — непрерывный исполнитель kppdf-8.0 · D:\kppdf-8.0 · ветка main
(или явный task-worktree по GIT-POLICY).
Skills: .agents/skills/kppdf-executor-loop/SKILL.md · GEMINI.md
Канон PO: docs/PO-CANON.md

SoT / входы (прочитай в этом порядке):
1) docs/agent-checklists/WAVE-COMPOSE-CREATE-PHOTO.md   ← MASTER resume
2) docs/audits/2026-08-15-compose-create-and-photo-upload-audit.md
3) tasks/_backlog/WAVE-COMPOSE-CREATE-PHOTO.md
4) этот промпт

Уже DONE (не переоткрывать): TZ-ORDERS-336/337, production cockpit 329–335.

Цель: пикер состава «Создать»; модуль с файловым фото; dropzone =
файл + drag + Ctrl+V везде в каталоге.

════════════════════════════════════════════════════════
ПРАВИЛА ДВИЖЕНИЯ
════════════════════════════════════════════════════════
1) Открой MASTER checklist. Первая незакрытая фаза — единственная работа.
2) Порядок СТРОГИЙ: 340 → 342 → 341 → 343 → WAVE DONE.
3) На каждой TZ:
   per-TZ checklist → CLAIM tasks/_active/ → код только CONFLICT KEYS →
   AC → gates (tsc + jest зоны) → Executor report → archive + lock →
   убрать _active → commit+push (GIT-POLICY) → MASTER [x] + live resume.
4) После КАЖДОГО шага и перед выходом обновляй MASTER live slot.
5) UI только RU. «Создать», «Загрузить фото», hint «Файл · перетащить · Ctrl+V».
6) BAN: deploy; wipe; mid-queue «можно?»; stage data/paspots и чужой WIP.
7) Звать PO только на реальном блокере (секреты, CONFLICT в _active).

════════════════════════════════════════════════════════
ФАЗЫ
════════════════════════════════════════════════════════
340 — tasks/TZ-CATALOG-340-composition-picker-create.md
      Пикер: кнопка Создать → QuickCreate по вкладке → выбрать новый id.
342 — tasks/TZ-UI-PHOTO-342-photo-dropzone-paste.md
      Dropzone: paste + RU hint трёх способов.
341 — tasks/TZ-MODULES-341-module-photo-upload.md
      Module form/detail/QC: dropzone → PhotosService → photoId link.
343 — tasks/TZ-UI-PHOTO-343-photo-entry-sweep.md
      Grep sweep; миграция остатков; WAVE DONE в MASTER.

Эталон dropzone: frontend/src/app/shared/ui/photo/photo-dropzone.component.ts
Эталон QC фото изделия: quick-create-dialog (product L).
Эталон module photos API: pi-product-module-photos.service.ts

Когда все [x]: короткий отчёт PO (commits, archive paths). Deploy не предлагать
автоматически — только если PO сказал «деплой».
```
