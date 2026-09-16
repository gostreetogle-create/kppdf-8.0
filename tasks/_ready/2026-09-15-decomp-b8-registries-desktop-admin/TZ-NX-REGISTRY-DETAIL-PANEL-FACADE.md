═══════════════════════════════════════════════════════════════
TZ-NX-REGISTRY-DETAIL-PANEL-FACADE
═══════════════════════════════════════════════════════════════
SIZE L · LAYER 3 · PACK B8
CONFLICT KEYS: frontend-nx/apps/kppdf-web/src/app/pages/registries/registry-detail-panel.component.ts ; frontend-nx/apps/kppdf-web/src/app/pages/registries/registry-detail-panel.facade.ts
IMPLICIT: nx build kppdf-web
ЧТО: Extract facade in-place (signals + action matrix orchestration as-is); thin panel; providers on component; no registry behavior change.
AC: registry-detail* + registries specs green; nx build last 0.
Successor: TZ-NX-REGISTRY-DETAIL-TO-FEATURES
