# TZ-DOC-STUDIO-201c: Render adapter + golden HTML

> **Wave 2c** · after 2b PASS

## ЧТО ДЕЛАТЬ

1. Typed adapter `StudioDocumentAggregate → BuildDocumentDto` (or render input DTO).
2. Golden HTML tests: same aggregate → same HTML hash.
3. Wire to `DocumentRenderService` from Wave 1.

## ACCEPTANCE CRITERIA

- [ ] Golden tests PASS (deterministic preview)
- [ ] No studio routes yet — adapter + tests only
