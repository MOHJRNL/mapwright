import { expect, test } from 'claude-code/testing'

// A small fake project stands in for the file system beneath the plugin.
const FILES: Record<string, string> = {
  'src/main.ts': "import { b } from './b'\nimport React from 'react'",
  'src/b.ts': 'export const b = 1',
}
const DIRS: Record<string, string[]> = { '': ['src'], src: ['main.ts', 'b.ts'] }

const beneath = (on: (event: string, hook: (...args: any[]) => unknown) => void, written: Record<string, string>) => {
  on('command.register', () => ({ value: { command: 'codemap' } }))
  on('session.start', (_: unknown, e: { cwd: string }) => ({ cwd: e.cwd }))
  // The engine names the project root by its absolute path; below it, paths may come absolute too.
  let root: string | null = null
  const rel = (p: string) => {
    if (root === null && p.startsWith('/')) root = p
    return root !== null && p.startsWith(root) ? p.slice(root.length).replace(/^\/+/, '') : p.replace(/^\.\/?$/, '')
  }
  on('fs.list', (_: unknown, e: { path?: string }) => {
    const dir = rel(e.path ?? '')
    const names = DIRS[dir] ?? []
    return {
      value: names.map(name => ({ name, kind: FILES[dir ? `${dir}/${name}` : name] !== undefined ? 'file' : 'dir' })),
    }
  })
  on('fs.read', (_: unknown, e: { path: string }) => ({ value: FILES[rel(e.path)] ?? '' }))
  on('fs.write', (_: unknown, e: { path: string; text: string }) => {
    written[rel(e.path)] = e.text
    return { value: undefined }
  })
}

test('/codemap writes CODEMAP.md with the local import it finds', async ($, on) => {
  const written: Record<string, string> = {}
  beneath(on as never, written)
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  const r = await $.command.run({ command: 'codemap', args: '', presentation: { isFullscreen: false, columns: 100 } } as never)
  expect(r.text).toBe('Wrote CODEMAP.md: 2 files, 1 local imports.')
  expect(written['CODEMAP.md']).toContain('`src/main.ts` → `src/b.ts`')
  expect(written['CODEMAP.md']).toContain('`src/b.ts` ← 1')
})
