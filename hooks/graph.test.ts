import { expect, test } from 'claude-code/testing'

import { buildGraph, importsOf, isSkippedDir, resolve } from './graph'

test('TypeScript and Python imports are read', () => {
  const ts = "import a from './a'\nexport { b } from './b.js'\nconst c = require('./c')\nimport('./d')\nimport x from 'react'"
  expect(importsOf('src/main.ts', ts).sort()).toEqual(['./a', './b.js', './c', './d', 'react'])
  expect(importsOf('app.py', 'from pkg.util import f\nimport os\n').sort()).toEqual(['os', 'pkg.util'])
})

test('local imports resolve to project files, packages do not', () => {
  const files = new Set(['src/main.ts', 'src/b.ts', 'src/lib/index.ts', 'pkg/util.py'])
  expect(resolve('src/main.ts', './b.js', files)).toBe('src/b.ts')
  expect(resolve('src/main.ts', './lib', files)).toBe('src/lib/index.ts')
  expect(resolve('src/main.ts', '../pkg/x', files)).toBe(null)
  expect(resolve('src/main.ts', 'react', files)).toBe(null)
  expect(resolve('app.py', 'pkg.util', files)).toBe('pkg/util.py')
})

test('the graph counts edges and lists hubs', () => {
  const g = buildGraph([
    { path: 'a.ts', text: "import './c'" },
    { path: 'b.ts', text: "import './c'" },
    { path: 'c.ts', text: '' },
  ])
  expect(g.deps.get('a.ts')).toEqual(['c.ts'])
  expect(g.deps.get('c.ts')).toEqual([])
  expect(g.files).toEqual(['a.ts', 'b.ts', 'c.ts'])
})

test('dependency, build and dot folders are skipped', () => {
  for (const name of ['node_modules', 'dist', '.git', '.claude-plugin', '.venv']) expect(isSkippedDir(name)).toBe(true)
  for (const name of ['src', 'lib', 'hooks']) expect(isSkippedDir(name)).toBe(false)
})
