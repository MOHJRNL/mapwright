# Test proof

A fresh clone of `MOHJRNL/mapwright` at commit `9f36b91`, run on 2026-11-23 with Claude Code. The test run below is the proof.

```
$ claude plugin test ./
```

```
hooks/command.test.ts:
(pass) /codemap writes CODEMAP.md with the local import it finds [32.69ms]
hooks/graph.test.ts:
(pass) TypeScript and Python imports are read [1.84ms]
(pass) local imports resolve to project files, packages do not [0.52ms]
(pass) the graph counts edges and lists hubs [0.42ms]
(pass) dependency, build and dot folders are skipped [0.39ms]
 5 pass
 0 fail
Ran 5 tests across 2 files. [0.21s]
```
