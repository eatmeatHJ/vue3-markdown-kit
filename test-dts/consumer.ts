import { createApp, defineComponent, h } from 'vue'
import VueMarkdownKit, {
  VMdPreview,
  createGithubTheme,
  createMarkdownRenderer,
  sanitizeHtml,
} from 'vue3-markdown-kit'
import LegacyPreview from 'vue3-markdown-kit/lib/preview'
import legacyGithubTheme from 'vue3-markdown-kit/lib/theme/github.js'

const app = createApp(defineComponent({
  render: () => h(VMdPreview, { text: '# Vue 3' }),
}))

app.use(VueMarkdownKit)
app.use(VMdPreview)

const parser = createMarkdownRenderer({
  html: true,
  linkify: false,
})

const theme = createGithubTheme()
const html: string = sanitizeHtml(parser.render('# Typed'))

VMdPreview.theme(theme)
VMdPreview.use(legacyGithubTheme)
LegacyPreview.extendMarkdown((markdownParser) => {
  markdownParser.set({
    breaks: true,
  })
})

void html
