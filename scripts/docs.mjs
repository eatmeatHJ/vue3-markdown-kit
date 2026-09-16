import { cp, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build, context } from 'esbuild'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const output = resolve(root, 'docs-dist')
await mkdir(output, { recursive: true })
await cp(resolve(root, 'docs/index.html'), resolve(output, 'index.html'))
await cp(resolve(root, 'docs/sample.svg'), resolve(output, 'sample.svg'))
const options = {
  absWorkingDir: root,
  entryPoints: ['docs/main.ts'],
  outdir: output,
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: ['es2020'],
  minify: true,
  loader: { '.md': 'text' },
  define: {
    'process.env.NODE_ENV': '"production"',
    __VUE_OPTIONS_API__: 'false',
    __VUE_PROD_DEVTOOLS__: 'false',
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
  },
  logLevel: 'info',
}
if (process.argv.includes('--serve')) {
  const ctx = await context(options)
  await ctx.watch()
  const server = await ctx.serve({ servedir: output, host: '127.0.0.1', port: 4173 })
  console.log(`Documentation: http://127.0.0.1:${server.port}`)
} else {
  await build(options)
}
