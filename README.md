# Vue 3 Markdown Kit

A small, auditable Markdown preview toolkit for Vue 3.5. It provides a
component-friendly preview API, a framework-independent renderer, and
GitHub-style presentation.

This package is the Vue 3 counterpart of
[`vue-markdown-kit`](https://github.com/eatmeatHJ/vue-markdown-kit). It keeps
the same preview props, events, themes, CSS, and import layout while using the
Vue 3 application and rendering APIs.

## Features

- Vue 3.5 preview component built with the Composition API
- Markdown rendering through markdown-it
- HTML sanitization through DOMPurify
- Opt-in, tree-shakeable highlight.js language registration
- GitHub-style Markdown CSS
- Image-click and rendered-content events
- TypeScript declarations and ESM/CommonJS builds
- Compatibility and modern package entry points

## Requirements

- Vue 3.5 or newer
- Node.js 18 or newer for package tooling

## Install

```sh
npm install vue3-markdown-kit
```

## Recommended usage

Configure the theme once in your application entry point:

```ts
import { createApp } from 'vue'
import App from './App.vue'

import VueMarkdownKit, { VMdPreview, githubTheme } from 'vue3-markdown-kit'
import 'vue3-markdown-kit/style/preview.css'
import 'vue3-markdown-kit/theme/style/github.css'

VMdPreview.use(githubTheme)

createApp(App)
  .use(VueMarkdownKit)
  .mount('#app')
```

The plugin globally registers `<v-md-preview>`:

```vue
<script setup lang="ts">
import { ref } from 'vue'

const markdown = ref('# Hello, Vue 3')

function handleImageClick(images: string[], index: number) {
  console.log(images[index])
}
</script>

<template>
  <v-md-preview
    :text="markdown"
    @image-click="handleImageClick"
  />
</template>
```

For local registration, import the component directly:

```vue
<script setup lang="ts">
import { VMdPreview, githubTheme } from 'vue3-markdown-kit'
import 'vue3-markdown-kit/style/preview.css'
import 'vue3-markdown-kit/theme/style/github.css'

VMdPreview.use(githubTheme)

const markdown = '# Locally registered component'
</script>

<template>
  <VMdPreview :text="markdown" />
</template>
```

## highlight.js

Register only the languages your application uses:

```ts
import { VMdPreview, githubTheme } from 'vue3-markdown-kit'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'

hljs.registerLanguage('javascript', javascript)

VMdPreview.use(githubTheme, {
  Hljs: hljs,
})
```

## Compatibility entry points

Integrations migrating from the Vue 2 package can retain the old import
layout and change only the package name:

```ts
import VMdPreview from 'vue3-markdown-kit/lib/preview'
import 'vue3-markdown-kit/lib/style/preview.css'

import githubTheme from 'vue3-markdown-kit/lib/theme/github.js'
import 'vue3-markdown-kit/lib/theme/style/github.css'

VMdPreview.use(githubTheme)
```

Vue 3 uses `createApp(...).use(...)`; replace any Vue 2 `Vue.use(...)`,
`Vue.extend(...)`, `$mount()`, `$on()`, and `$destroy()` integration code with
their Vue 3 equivalents.

## Framework-independent renderer

The renderer and sanitizer can be used without mounting a Vue component:

```ts
import {
  createMarkdownRenderer,
  sanitizeHtml,
} from 'vue3-markdown-kit/core'

const parser = createMarkdownRenderer()
const safeHtml = sanitizeHtml(parser.render('# Hello'))
```

## Preview props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `string` | `''` | Markdown source |
| `theme` | `object` | `undefined` | Per-instance theme plugin or theme config |
| `tabSize` | `number` | `2` | CSS tab size |
| `scrollContainer` | `function` | `() => window` | Scroll target retained for API compatibility |
| `top` | `number` | `0` | Scroll offset retained for API compatibility |
| `sanitizeOptions` | `object` | `{}` | Additional DOMPurify options |

## Events

- `change(text, html)` fires after Markdown is rendered and sanitized.
- `image-click(images, index)` fires when a rendered image is clicked.

## Security

Raw HTML is enabled for compatibility, then sanitized as the final rendering
step. Applications that do not need raw HTML can pass `html: false` when
creating a custom renderer. Keep all runtime dependencies updated and apply
an application-level Markdown input length limit.

## Documentation and live examples

[Documentation and live examples](https://eatmeatHJ.github.io/vue3-markdown-kit/)

The repository includes a documentation site with editable Markdown examples,
syntax highlighting, image-click events, and sanitized HTML output. See the
[Chinese quick-start and deployment guide](docs/guide.md).

```sh
npm ci
npm run build
npm run docs:dev
```

Open `http://127.0.0.1:4173`. To validate and build the static site:

```sh
npm run docs:check
npm run docs:build
```

The output is `docs-dist/`. Enable **Settings → Pages → Source → GitHub Actions**
and run the **Deploy documentation** workflow after pushing these files to
`main`. Subsequent pushes to `main` deploy automatically; pull requests only
build the site. With the default GitHub Pages domain, the site URL will be
`https://eatmeatHJ.github.io/vue3-markdown-kit/`.

## Package development

```sh
npm ci
npm test
npm run check
```

The generated `lib` directory is committed so the package can also be
installed directly from GitHub.

## Release

Publishing is automated with npm Trusted Publishing. After the trusted
publisher is configured for `.github/workflows/publish.yml`, publish a GitHub
Release whose tag matches the version in `package.json`. The workflow runs the
full package checks and skips versions that already exist on npm.

## License

MIT. See [LICENSE](LICENSE) and [NOTICE.md](NOTICE.md).
