# S3 evidence

- Route `studio/:id` loads `StudioEditorPage`.
- `PiStudioBlocksService` is wired in `studio-editor.page.ts`.
- Canvas, layers, properties, create text, drag/resize, debounced layouts, and revision-conflict toast are implemented.
- Focused studio test command passed: 45 suites, 246 tests, 7 skipped.
- `nx build kppdf-web` passed.
- Live authenticated browser smoke was unavailable in this shared checkout; no screenshot claimed.
- S2 sheet geometry remains delegated to `studioSheetRect`; the sheet remains `position: relative` and panel width is 480px.
