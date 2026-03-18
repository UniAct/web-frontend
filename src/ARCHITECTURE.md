# Frontend Architecture Guide

## Goals
- Keep UI modules small, testable, and easy to evolve.
- Separate feature data/types from page rendering.
- Keep API integration stable and centralized.

## Folder Strategy
- src/pages: route-level entry screens only.
- src/features/<feature>: feature-owned constants, types, hooks, and section components.
- src/components/ui: shared design-system primitives.
- src/components/<domain>: reusable domain components not tied to a single page.
- src/api: backend integration layer and DTO mapping.
- src/styles/components: shared UI interaction styles.
- src/styles/modules: feature/module specific styles.

## Rules
- Do not put large static arrays in route pages. Move to src/features/<feature>/constants.ts.
- Keep feature types in src/features/<feature>/types.ts.
- Keep page files focused on orchestration and rendering only.
- Prefer shared primitives (Button, Tabs, Dialog, Modal) for consistent interaction behavior.
- Keep tenant/backend logic in services/api layer, not in presentational components.

## Refactor Workflow
1. Extract types.
2. Extract constants and local helper functions.
3. Extract JSX sections into feature components.
4. Move repeated class patterns into module CSS classes.
5. Rebuild and verify behavior.

## Current Example
- Home feature has been split into:
  - src/features/home/types.ts
  - src/features/home/constants.ts
  - src/features/home/index.ts
