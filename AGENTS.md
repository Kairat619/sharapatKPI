# AGENTS.md — Sharapat KPI v2

## Project Overview

React 19 SPA (no router) built with Vite + TypeScript + Tailwind CSS v4.
Tab-based navigation via state in `App.tsx`. Persistence is localStorage with
Google Sheets sync via Apps Script Web App. Supports English and Kazakh (default).

## Build / Dev / Lint Commands

```bash
npm run dev        # Vite dev server on port 3000
npm run build      # Production build to dist/
npm run preview    # Preview production build
npm run lint       # TypeScript type-check only (tsc --noEmit)
npm run clean      # Remove dist/ and server.js
```

- **No ESLint, Prettier, or formatting tools are configured.** `npm run lint`
  only runs `tsc --noEmit`.
- **No test framework exists.** There are no tests, no test config, and no test
  script. If you add tests, use Vitest (already aligned with Vite) and place
  files as `*.test.ts` / `*.test.tsx` alongside the source.
- There is no single-test runner command. If you add Vitest, a single test can
  run via: `npx vitest run src/path/to/file.test.tsx`

## Project Structure

```
src/
├── main.tsx                  # Entry — React createRoot
├── App.tsx                   # Root: auth, all state, tab routing
├── types.ts                  # All shared TypeScript types/interfaces
├── utils.ts                  # KPI calculations, seed data, Apps Script generator
├── index.css                 # Tailwind v4 @import + @theme (Google Fonts)
├── vite-env.d.ts             # Vite client types
├── components/               # One view per file (PascalCase)
│   ├── DashboardView.tsx
│   ├── DailyReportView.tsx
│   ├── Sidebar.tsx
│   └── ...
└── i18n/
    ├── LanguageContext.tsx    # React Context for i18n
    └── translations.ts       # EN + KK string maps
```

## Code Style Guidelines

### Imports

- Order: React → third-party (lucide-react, motion) → local types → utils → i18n
- Use **relative paths** (`./`, `../`) — the `@/` alias is configured but not
  used in practice; keep consistency with existing code.
- Prefer named imports for lucide-react icons: `import { X, Y } from "lucide-react"`
- No barrel/index files.

### Formatting

- **2-space indentation** — enforced consistently.
- **Single quotes** — dominant convention (used in most files). Double quotes
  appear in a few files; new code should use single quotes.
- **Semicolons** — always use them.
- **Trailing commas** — use them in multi-line arrays/objects (consistent with
  existing code).
- Line length: no hard limit, but keep Tailwind class strings manageable.

### Naming Conventions

| Element              | Convention              | Example                          |
|----------------------|-------------------------|----------------------------------|
| Component files      | PascalCase `.tsx`       | `DashboardView.tsx`              |
| Utility files        | camelCase `.ts`         | `utils.ts`, `translations.ts`    |
| Entry files          | lowercase `.tsx`/`.ts`  | `main.tsx`, `types.ts`           |
| Component function   | `export default function` | `export default function Sidebar()` |
| Props interfaces     | PascalCase + `Props`    | `SidebarProps`, `DashboardViewProps` |
| Shared types         | PascalCase              | `DailyReport`, `KpiTargets`      |
| Union types          | `type` keyword          | `type UserRole = 'Admin' \| 'Manager'` |
| Constants            | UPPER_SNAKE_CASE        | `DEFAULT_TARGETS`                |
| Functions            | camelCase               | `calculateReportFields`          |
| Event handlers       | `handle` prefix         | `handleSave`, `handleLogin`      |
| localStorage keys    | `sharapat_v2_*` prefix  | `sharapat_v2_reports`            |

### TypeScript

- Target: ES2022, module: ESNext, bundler resolution.
- **`strict` is NOT enabled** in tsconfig. Do not enable it without refactoring.
- Use **interfaces** for object shapes and component props. Use `type` only for
  unions and aliases.
- Component props are co-located in the component file (not in `types.ts`).
  Shared domain types go in `src/types.ts`.
- Avoid `as any` casts. When unavoidable for localStorage parsing, add a brief
  comment.
- Function parameters: destructure from props interface, don't annotate inline.

### Component Patterns

```tsx
import { useState } from 'react';
import { SomeIcon } from 'lucide-react';
import { SomeType } from '../types';
import { someUtil } from '../utils';
import { useLanguage } from '../i18n/LanguageContext';

interface MyComponentProps {
  data: SomeType;
  onSave: (value: string) => void;
}

export default function MyComponent({ data, onSave }: MyComponentProps) {
  const { t } = useLanguage();
  // ...
}
```

### State Management

- All state lives in `App.tsx` via `useState` hooks, passed down as props.
- No Redux, Zustand, or other state library.
- localStorage is the persistence layer. All localStorage access should be
  wrapped in try/catch.

### Error Handling

- Wrap `JSON.parse(localStorage.getItem(...))` in try/catch with fallback.
- Use `console.error` / `console.warn` for non-critical failures.
- For user-facing errors, set a state object with `status: "error"` and a
  translated message from `t()`.
- Do not add React Error Boundaries unless explicitly asked.

### Styling

- **Tailwind CSS v4** utility classes only — no CSS modules, no styled-components.
- Tailwind v4 is configured via CSS `@theme` in `index.css`, not a config file.
- Custom fonts: `font-display` and `font-mono` (defined in `@theme`).
- Google Fonts loaded via `@import url()` in `index.css`.

### i18n

- `useLanguage()` hook provides `t(key)` function and `lang` state.
- All user-facing strings must use `t('key')` — never hardcode display text.
- New keys go in `src/i18n/translations.ts` with both `en` and `kk` entries.
- Default language is Kazakh (`kk`).

## Important Notes

- The HTML entry point has `lang="kk"` — Kazakh is the primary locale.
- `@google/genai` is in dependencies but not yet integrated in code.
- `express` and `dotenv` are in dependencies but unused in client code.
- `dist/` is committed in the repo — do not delete it.
- Environment variables: `GEMINI_API_KEY`, `APP_URL`, `DISABLE_HMR` (see `.env.example`).
