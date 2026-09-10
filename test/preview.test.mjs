import assert from 'node:assert/strict'
import test from 'node:test'
import { JSDOM } from 'jsdom'

test('mounts in Vue 3.5 and emits change and image-click events', async () => {
  const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', {
    url: 'https://example.test/',
  })

  const browserGlobals = {
    window: dom.window,
    document: dom.window.document,
    navigator: dom.window.navigator,
    Element: dom.window.Element,
    SVGElement: dom.window.SVGElement,
  }

  for (const [name, value] of Object.entries(browserGlobals)) {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      value,
    })
  }

  const [vue, { default: VMdPreview }, { default: githubTheme }] =
    await Promise.all([
      import('vue'),
      import('../lib/preview.js'),
      import('../lib/theme/github.js'),
    ])

  VMdPreview.use(githubTheme)

  let changed
  let imageClicked
  const markdown = '![one](https://example.test/one.png)\n\n![two](https://example.test/two.png)'
  const app = vue.createApp({
    render() {
      return vue.h(VMdPreview, {
        text: markdown,
        onChange: (text, html) => {
          changed = { text, html }
        },
        onImageClick: (images, index) => {
          imageClicked = { images, index }
        },
      })
    },
  })

  const root = app.mount('#app')
  await vue.nextTick()

  const images = root.$el.querySelectorAll('img')
  assert.equal(images.length, 2)
  assert.equal(changed.text, markdown)
  assert.match(changed.html, /<img/)

  images[1].dispatchEvent(new window.MouseEvent('click', { bubbles: true }))

  assert.deepEqual(imageClicked, {
    images: [
      'https://example.test/one.png',
      'https://example.test/two.png',
    ],
    index: 1,
  })

  app.unmount()
  dom.window.close()

  for (const name of Object.keys(browserGlobals)) {
    delete globalThis[name]
  }
})

test('registers as a Vue 3 application plugin', async () => {
  const { createApp } = await import('vue')
  const { default: VMdPreview } = await import('../lib/preview.js')
  const app = createApp({})

  app.use(VMdPreview)

  assert.equal(app.component('v-md-preview'), VMdPreview)
})
