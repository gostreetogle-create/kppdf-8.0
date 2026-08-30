# TZ-NX-CONSTRUCTOR-SHELL

Implement the first Constructor slice after `TZ-NX-COMPOSITION-ARCHITECTURE-DECISION`.

Goal: add `/constructor` as the dedicated workspace for creating/editing catalog composition. This wave only creates the route, visible header navigation and an empty workspace/kind chooser. It must not implement Material/Module/Product API or BOM editing.

Use the existing shell and Paper & Ink components. Keep `/registries` as the saved-record master table. Constructor is not a registry row expansion and is not placed in a rail.

Future create kinds: material, detail (Material kind preset), module, product. Complex is derived Product, not a create kind.

Required: route `/constructor`, header category/chip, empty state, CTAs for the four kinds, accessible labels, tests, docs and gates. No new permissions, endpoints, fields, dependencies or UI primitives. Do not edit legacy frontend/** or backend/**.
