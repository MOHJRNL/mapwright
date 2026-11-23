# Mapwright: a local code map for Claude Code

![Claude Code plugin](https://img.shields.io/badge/Claude%20Code-plugin-D97757)
![License: PolyForm Noncommercial](https://img.shields.io/badge/license-PolyForm%20Noncommercial%201.0.0-blue)
![Version](https://img.shields.io/badge/version-0.1.0-informational)
![No model calls](https://img.shields.io/badge/model%20calls-none-success)

> **In short:** Mapwright adds a `/codemap` command to Claude Code. It walks your project, reads the imports in TypeScript, JavaScript and Python files, and writes `CODEMAP.md`: each file with its local imports, plus the most-imported files. It runs locally and uses no model tokens.

**Keywords:** code map, codebase graph, dependency graph, import graph, Claude Code codebase map, GraphRAG alternative, Graphify alternative, repository map, project structure for AI, low-cost code context.

---

## Features

- **`/codemap`** scans up to 400 source files under the working directory: `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs` and `.py`.
- **Skips** `node_modules`, `dist`, `build`, `.next`, `coverage`, `__pycache__`, `venv`, `vendor`, and every dot-folder (`.git`, `.venv`, `.claude-plugin`, ...).
- **Reads** up to 64 KB of each file.
- **Output:** `CODEMAP.md` with totals, the top 10 most-imported files, and each file's local imports.
- **Zero model tokens.** Everything runs in the plugin. Nothing is sent anywhere.

## Limits (read this)

- Parsing is regex-based, so it approximates the import graph. Dynamic imports built from variables are not followed.
- `tsconfig` path aliases and package-internal imports are not resolved. Only relative imports count as local.
- Python: only absolute dotted imports that match a file in the project are counted.
- Capped at 400 files and 64 KB per file, so very large repositories are only partly mapped. The command reports when it stops early.

## Install

### Claude Code (recommended)

```text
/plugin install mapwright --marketplace MOHJRNL/mapwright
```

Or from a shell:

```bash
claude plugin install mapwright --marketplace MOHJRNL/mapwright
```

Desktop app: **+** next to the prompt box, then **Plugins**, **Add marketplace** with `MOHJRNL/mapwright`, then **Add plugin**.

Run it from the project root:

```text
/codemap
```

### Codex, Gemini CLI, OpenCode, Grok

The `/codemap` command is a Claude Code command, so it doesn't run in these tools. The graph logic is plain TypeScript in `hooks/graph.ts` and can be reused in your own script. The repository doesn't include a standalone command-line tool.

## FAQ

**Does it send my code anywhere?** No. It reads files on your machine and writes `CODEMAP.md` in the project.

**Should I commit `CODEMAP.md`?** That's your choice. Teams often do, so new contributors and AI tools can read the structure without scanning every file.

**Why is a file missing from the map?** It may be in a skipped folder, beyond the 400-file cap, or imported through an alias the parser can't resolve.

## Development

```bash
claude plugin validate ./
claude plugin test ./
```

## License and commercial use

Free to use, copy and modify for non-commercial purposes, under the PolyForm Noncommercial License 1.0.0 (see `LICENSE`). For commercial use, contact the author for a separate license.
