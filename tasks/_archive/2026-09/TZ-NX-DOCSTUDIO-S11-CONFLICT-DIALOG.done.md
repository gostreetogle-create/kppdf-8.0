# TZ-NX-DOCSTUDIO-S11-CONFLICT-DIALOG — DONE

Revision conflicts now open a single AlertDialog with explicit Reload and Cancel actions. Reload fetches the server document and blocks; cancel keeps the current local view without overwriting it. Dialog bursts are deduplicated while open.

Validation: `nx test kppdf-web --testPathPattern=studio --runInBand` and `nx build kppdf-web` — PASS.
