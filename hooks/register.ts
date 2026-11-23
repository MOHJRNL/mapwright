import type { EngineInterface, Register } from 'claude-code'

import { SOURCE, buildGraph, isSkippedDir, render } from './graph'
import type { Source } from './graph'

const MAX_FILES = 400
const MAX_BYTES = 65536

// Collects source files under the working directory, skipping dependency and build folders.
async function walk($: EngineInterface, dir: string, out: string[]): Promise<void> {
  const entries = dir === '' ? await $.fs.list() : await $.fs.list(dir)
  for (const en of entries) {
    if (out.length >= MAX_FILES) return
    const p = dir === '' ? en.name : `${dir}/${en.name}`
    if (en.kind === 'dir') {
      if (!isSkippedDir(en.name)) await walk($, p, out)
    } else if (en.kind === 'file' && SOURCE.test(en.name)) {
      out.push(p)
    }
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'codemap', description: 'Write CODEMAP.md: files and their local imports' })
    return next(e)
  })

  // Runs locally: no model call, so it costs no tokens.
  on('command.run', { command: 'codemap' }, async $ => {
    const paths: string[] = []
    await walk($, '', paths)

    const sources: Source[] = []
    for (const p of paths) sources.push({ path: p, text: await $.fs.read(p, { length: MAX_BYTES }) })

    const graph = buildGraph(sources)
    await $.fs.write('CODEMAP.md', render(graph))

    const edges = [...graph.deps.values()].reduce((n, d) => n + d.length, 0)
    const cut = paths.length >= MAX_FILES ? ` (stopped at ${MAX_FILES} files)` : ''
    return { text: `Wrote CODEMAP.md: ${graph.files.length} files, ${edges} local imports${cut}.` }
  })
}
