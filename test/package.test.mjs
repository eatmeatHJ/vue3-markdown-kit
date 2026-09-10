import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import test from 'node:test'

test('publishes compatibility and modern entry points', async () => {
  const [
    packageRoot,
    previewModern,
    previewLegacy,
    githubModern,
    githubLegacy,
  ] = await Promise.all([
    import('vue3-markdown-kit'),
    import('vue3-markdown-kit/preview'),
    import('vue3-markdown-kit/lib/preview'),
    import('vue3-markdown-kit/theme/github'),
    import('vue3-markdown-kit/lib/theme/github.js'),
  ])

  assert.equal(packageRoot.VMdPreview.name, 'v-md-preview')
  assert.equal(previewModern.default, previewLegacy.default)
  assert.equal(typeof githubModern.default.install, 'function')
  assert.equal(typeof githubLegacy.default.install, 'function')

  await Promise.all([
    access(new URL('../lib/style/preview.css', import.meta.url)),
    access(new URL('../lib/theme/style/github.css', import.meta.url)),
  ])
})

test('has no package installation lifecycle scripts', async () => {
  const packageJson = JSON.parse(
    await readFile(new URL('../package.json', import.meta.url), 'utf8'),
  )

  for (const script of ['preinstall', 'install', 'postinstall']) {
    assert.equal(packageJson.scripts[script], undefined)
  }
})
