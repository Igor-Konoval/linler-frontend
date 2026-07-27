# Linler Frontend

Linler is a Notion-like productivity app with workspaces, projects, pages, user accounts, and collaborative content management.
Built with Next.js, TypeScript, Tailwind, React Query, and a NestJS backend.

## Start

```bash
pnpm install
pnpm dev
```

App runs on `http://localhost:3000`.

## Scripts

### Main

- `pnpm dev` - start development server.
- `pnpm build` - production build.
- `pnpm start` - run production server.

### Code Quality

- `pnpm fmt` - formats files with Prettier.
- `pnpm fmt:verify` - checks formatting without changing files.
- `pnpm lint` - ESLint with `--max-warnings 0` (warnings fail the command).
- `pnpm lint:fix` - auto-fixes ESLint issues where possible.
- `pnpm types` - TypeScript type checking (`tsc --noEmit`).
- `pnpm guard` - strict checks only: `lint + types`.

### Combined checks

- `pnpm check` - local developer flow: format first, then strict checks.
  - Runs: `fmt -> guard`
  - Use before commit when you want files auto-formatted.
- `pnpm check:ci` - CI-friendly flow without file modifications.
  - Runs: `fmt:verify -> lint -> types`
  - Use in pipelines and pre-push checks.

## Git hooks

Automatic git hooks are intentionally disabled.

Run checks manually when needed:

```bash
pnpm run check
pnpm run check:ci
```

## Recommended daily flow

1. `pnpm dev`
2. `pnpm check` before commit
3. `pnpm check:ci` before push (optional locally, required in CI)
