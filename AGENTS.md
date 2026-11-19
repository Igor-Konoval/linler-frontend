# Linler frontend

Notion-like app: workspaces, projects, pages, accounts. This repository is the Next.js client. The API is a separate NestJS service.

## How to work

- Integration branch until this line lands: `igor/feat/cursor-workflow`. Cut feature branches from it and merge them back only when the user asks. Leave `dev` and `main` alone until then.
- Feature branches: `igor/feat/<name>`, `igor/fix/<name>`, `igor/bug/<name>`.
- `main` deploys production on push. Do not commit, merge, or push to `main` from an agent session. Land work through a pull request.
- The agent can merge into `dev` when the user asks for that merge in the chat. It does not merge there on its own.
- Multi-file or product changes start in Plan mode. One slice at a time.
- Do not commit or push unless the user asks.
- After a code change, the same agent runs `pnpm check` locally. That command is not a subagent and it is not a hook. CI runs `pnpm check:ci` and does not rewrite files.
- UI changes need a browser pass of the affected flow, not only a screenshot.

## Where the details live

- Workflow and production safety: `.cursor/rules/workflow.mdc`
- Stack and code placement: `.cursor/rules/stack.mdc`
- Feature procedure: `.cursor/skills/linler-feature/SKILL.md`
- Local review before a pull request: `.cursor/agents/reviewer.md`
- Shell gate against pushing `main`: `.cursor/hooks.json`
