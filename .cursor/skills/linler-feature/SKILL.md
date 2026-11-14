---
name: linler-feature
description: >-
  Plans and implements one Linler frontend slice on a feature branch.
  Use when the user adds or changes a product feature, page, billing UI,
  workspace behavior, or asks for an AI-first implementation pass.
---

# Linler feature slice

## Boundary

This repository is the Next.js client. Database, Stripe secrets, webhook handlers, and the Nest API stay in the backend. The frontend ships the screen, the typed call, and the visible states.

Do one slice per branch. Examples: checkout button and return page, not the whole billing system. Workspace assistant panel, not a new editor.

## Steps

1. Cut the branch from `igor/feat/cursor-workflow`. The branch name is `igor/feat/<name>`, `igor/fix/<name>`, or `igor/bug/<name>`. Do not start from `dev` or `main`.
2. For work that spans multiple files or changes product behavior, write the plan first (Plan mode): user outcome, files, what stays on the backend, how to verify.
3. Implement only that slice. Follow `.cursor/rules/stack.mdc` for placement.
4. Run `pnpm check` in this session. It is a local command. On failure, fix it here. Do not start a subagent to run the check. For a UI change, exercise the flow in the browser, including empty and error states the slice touches.
5. Ask the `reviewer` subagent to review the diff against `igor/feat/cursor-workflow` before calling the slice done.
6. Stop. Commit, push, or merge back into `igor/feat/cursor-workflow` only when the user asks. Leave `dev` and `main` untouched unless the user names one of them.

## Pull request text

Use this when the user asks for a PR:

```markdown
## Summary

- [What the user can do now]

## Backend

- [What this PR does not include because it belongs in Nest]

## Test plan

- [ ] `pnpm check`
- [ ] [Browser path]
- [ ] [Empty or error state]
```

## Stop rules

- No push or commit to `main`.
- No secret in `NEXT_PUBLIC_*`, client components, or committed env files.
- No second feature slipped into the same diff.
