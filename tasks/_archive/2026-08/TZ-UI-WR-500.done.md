# TZ-UI-WR-500 DONE — Canon rules + stale audit patch

```
ARCHIVE_MARKER
task_id: TZ-UI-WR-500
outcome: DONE
closed_at: 2026-08-23T07:10:00+03:00
agent_id: freebuff-wr-a (Buffy, Freebuff UI-WR Agent A)
workspace: D:\kppdf-8.0
branch: main
```

## Что сделано

- **`docs/AI-AGENT-GUIDE.md` §3** — добавлен блок `### 3.1 UI overlay canon (War Room 2026-08-23)`:
  8 правил (ручной overlay запрещён при наличии primitive; overlay обязан Esc/trap/return-focus/role-aria через CDK a11y;
  новый shared primitive → пример в `/kit`; inline «Загрузка…»/raw error только с исключением в TZ; dead primitive = red flag;
  молчаливый обход primitive запрещён → adoption mini-TZ; SoT и промт волны). Добавлен `### 3.2 Proof of adoption`
  (5 пунктов: routed consumer / test / kit-or-md / migration note / legacy leftover; исключение docs-only TZ).
- **`docs/audits/2026-08-23-ui-standardization-program.md`** — §7 «Первые 5 практических задач», пункт 2 (PiSelect fix)
  зачёркнут с пометкой **DONE 2026-08-22 TZ-UI-401**. §2.1 таблица уже помечала S-01/C-02 DONE (проверено).
- **`docs/audits/2026-08-22-ui-consistency-audit.md`** — у S-01/C-02 строки `STATUS 2026-08-23: FIXED by TZ-UI-401` (уже на диске, сверено).
- **`docs/pages/PAGE-TZ-INDEX.md`** — секция `## UI War Room / WR-50x (2026-08-23)` со ссылками на WR TZ (уже на диске, сверено);
  снят trailing whitespace (`git diff --check` теперь PASS).
- Часть правок была pre-staged Cursor (war-room prep) — сверена с AC и включена в коммит TZ-500.

## Proof of adoption (docs-only variant)

- consumer: N/A (docs-only TZ)
- test: N/A (docs-only; gate = `git diff --check` PASS)
- docs: `AI-AGENT-GUIDE.md` §3.1–3.2 + `2026-08-23-ui-standardization-program.md` §7 + `2026-08-22-ui-consistency-audit.md` STATUS + `PAGE-TZ-INDEX.md` WR-50x
- migration note: ручные overlay без Esc/trap/return-focus и «построил primitive — 0 consumers» запрещены;
  каждый canonical UI TZ обязан нести блок Proof of adoption в `.done.md`
- legacy leftover: `ui-consistency-audit.md` сам по себе — исторический журнал (не переоткрывать S-01/C-02 без нового дефекта)

## Gates

- `git diff --check` PASS (exit 0)
- кодовые тесты N/A — docs-only (записано по GEMINI.md)

## Не трогали

- `frontend/**`, `backend/**`, `GEMINI.md`, `CLAUDE.md`
- Чужие незакоммиченные правки (PO-DIARY, TZ-AUTHORING, QUEUE-LIVE, tasks/README) — не в этом коммите
