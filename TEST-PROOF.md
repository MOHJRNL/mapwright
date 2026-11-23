# Test proof

A fresh clone of `MOHJRNL/mapwright` at commit `7919edb`, run on 2026-11-23 with Claude Code. The test run below is the proof.

```
$ claude plugin test ./
```

```
hooks/command.test.ts:
(pass) /codemap writes CODEMAP.md with the local import it finds [134.72ms]
hooks/graph.test.ts:
(pass) TypeScript and Python imports are read [3.65ms]
(pass) local imports resolve to project files, packages do not [0.59ms]
(pass) the graph counts edges and lists hubs [1.08ms]
(pass) dependency, build and dot folders are skipped [0.52ms]
 5 pass
 0 fail
Ran 5 tests across 2 files. [0.46s]
```
