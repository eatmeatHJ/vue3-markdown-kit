import { cp, mkdir, rm } from 'node:fs/promises'
import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputRoot = resolve(projectRoot, 'lib')

if (dirname(outputRoot) !== projectRoot || basename(outputRoot) !== 'lib') {
  throw new Error(`Refusing to clean unexpected build directory: ${outputRoot}`)
}

await rm(outputRoot, { recursive: true, force: true })
await mkdir(outputRoot, { recursive: true })

const entryPoints = {
  index: resolve(projectRoot, 'src/index.js'),
  preview: resolve(projectRoot, 'src/preview.js'),
  core: resolve(projectRoot, 'src/core/index.js'),
  'theme/github': resolve(projectRoot, 'src/theme/github.js'),
}

const shared = {
  entryPoints,
  bundle: true,
  platform: 'browser',
  target: ['es2019'],
  sourcemap: true,
  external: [
    'vue',
    'dompurify',
    'highlight.js',
    'highlight.js/*',
    'markdown-it',
    'markdown-it/*',
    'markdown-it-attrs',
  ],
  logLevel: 'info',
}

await build({
  ...shared,
  format: 'esm',
  outdir: outputRoot,
})

await build({
  ...shared,
  format: 'cjs',
  outdir: outputRoot,
  outExtension: {
    '.js': '.cjs',
  },
})

await mkdir(resolve(outputRoot, 'style'), { recursive: true })
await mkdir(resolve(outputRoot, 'theme/style'), { recursive: true })

await cp(
  resolve(projectRoot, 'src/styles/preview.css'),
  resolve(outputRoot, 'style/preview.css'),
)
await cp(
  resolve(projectRoot, 'src/styles/github.css'),
  resolve(outputRoot, 'theme/style/github.css'),
)
