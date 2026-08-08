# Audit: organization assets vs AI text bootstrap

**Date:** 2026-08-09
**Scope:** TZD-30
**Decision:** ship text-block drafts through Desktop MCP; keep organization asset vault and layout automation out of this slice.

## Manager flow

1. Desktop/MCP lists active `TextBlockCategory` shelves.
2. If the requested shelf is absent, the agent explicitly creates that category through `category_create`; it never silently falls back to «Общее».
3. The agent lists blocks in the category, then stores the finished source text as `isActive=false` with the `ai-draft` tag and the name prefix `Черновик ИИ —`.
4. MCP creates an import todo linking to `/doc-constructor/texts?editId=<id>`.
5. The manager reviews the source, enables «Активен», and manually places the block on a template canvas.

This is not automatic quotation assembly, legal/commercial content generation, a publish operation, or an upload of seals/backgrounds/photos.

## API safety boundaries

- `categoryId` is required for the draft tool. The backend remains responsible for category ownership and active-category validation.
- The create payload contains only the TextBlock contract fields (`name`, `categoryId`, `content` and/or `columns`, `tags`, `isActive`). It intentionally does **not** send `notes`; TextBlock has no such field and the backend whitelist would reject it.
- The pre-create category list prevents same-name duplicates. Backend 409 responses are surfaced as no-overwrite errors.
- Todo creation is best effort only after the block exists, but a failed todo is returned as `todoError` alongside `textBlockId`; it is never silently discarded.

## Known limitations / follow-up

- TextBlock currently has no `organizationId`; multi-organization isolation is a separate backend task.
- Idempotency keys are not part of this bootstrap; list plus backend uniqueness/409 is the current guard.
- `desktop/mcp-runtime` remains installer staging. Syncing `desktop/mcp` into it is a packaging gate before MSI, not product logic in TZD-30.
- Organization photo/seal/background vault and layout-AI remain parked for a separate task.
