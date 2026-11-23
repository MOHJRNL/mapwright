export const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'coverage', '__pycache__', '.venv', 'venv', 'vendor'])
export const SOURCE = /\.(tsx?|jsx?|mjs|cjs|py)$/

export type Source = { path: string; text: string }
export type Graph = { files: string[]; deps: Map<string, string[]> }

/** Import specifiers a source file names, JS/TS and Python. */
export function importsOf(file: string, text: string): string[] {
  const specs = new Set<string>()
  const add = (re: RegExp) => {
    for (const m of text.matchAll(re)) specs.add(m[1]!)
  }
  if (file.endsWith('.py')) {
    add(/^\s*from\s+([\w.]+)\s+import\b/gm)
    add(/^\s*import\s+([\w.]+)/gm)
  } else {
    add(/(?:import|export)\s+(?:[^'"`;]*?\s+from\s+)?['"]([^'"]+)['"]/g)
    add(/\brequire\(\s*['"]([^'"]+)['"]\s*\)/g)
    add(/\bimport\(\s*['"]([^'"]+)['"]\s*\)/g)
  }
  return [...specs]
}

function normalize(p: string): string {
  const out: string[] = []
  for (const seg of p.split('/')) {
    if (seg === '' || seg === '.') continue
    if (seg === '..') out.pop()
    else out.push(seg)
  }
  return out.join('/')
}

/** The project file a specifier names, or null for packages and anything outside the project. */
export function resolve(file: string, spec: string, files: Set<string>): string | null {
  if (file.endsWith('.py')) {
    if (spec.startsWith('.')) return null
    const base = spec.replace(/\./g, '/')
    for (const c of [`${base}.py`, `${base}/__init__.py`]) if (files.has(c)) return c
    return null
  }
  if (!spec.startsWith('.')) return null
  const dir = file.includes('/') ? file.slice(0, file.lastIndexOf('/')) : ''
  const base = normalize(dir ? `${dir}/${spec}` : spec)
  // ESM in TypeScript imports "./x.js" for "./x.ts"
  const stem = base.replace(/\.(m?jsx?|tsx?)$/, '')
  const candidates = [
    base,
    `${stem}.ts`, `${stem}.tsx`, `${stem}.js`, `${stem}.jsx`, `${stem}.mjs`, `${stem}.cjs`,
    `${stem}/index.ts`, `${stem}/index.tsx`, `${stem}/index.js`,
  ]
  for (const c of candidates) if (files.has(c)) return c
  return null
}

export function buildGraph(sources: Source[]): Graph {
  const files = new Set(sources.map(s => s.path))
  const deps = new Map<string, string[]>()
  for (const s of sources) {
    const local = new Set<string>()
    for (const spec of importsOf(s.path, s.text)) {
      const target = resolve(s.path, spec, files)
      if (target !== null && target !== s.path) local.add(target)
    }
    deps.set(s.path, [...local].sort())
  }
  return { files: sources.map(s => s.path).sort(), deps }
}

/** Markdown: totals, the most imported files, then each file's local imports. */
export function render(graph: Graph): string {
  const edges = [...graph.deps.values()].reduce((n, d) => n + d.length, 0)
  const inDegree = new Map<string, number>()
  for (const targets of graph.deps.values()) for (const t of targets) inDegree.set(t, (inDegree.get(t) ?? 0) + 1)
  const hubs = [...inDegree.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 10)

  const lines = [
    '# Code map',
    '',
    `${graph.files.length} files · ${edges} local imports`,
    '',
    '## Most imported',
    ...(hubs.length === 0 ? ['- none'] : hubs.map(([f, n]) => `- \`${f}\` ← ${n}`)),
    '',
    '## Files',
  ]
  for (const f of graph.files) {
    const d = graph.deps.get(f) ?? []
    lines.push(d.length === 0 ? `- \`${f}\`` : `- \`${f}\` → ${d.map(x => `\`${x}\``).join(', ')}`)
  }
  return lines.join('\n') + '\n'
}
