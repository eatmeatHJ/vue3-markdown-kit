import MarkdownIt from 'markdown-it'
import markdownItAttrs from 'markdown-it-attrs'

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function slugifyHeading(value) {
  const slug = String(value || '')
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{Letter}\p{Number}_-]+/gu, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')

  return slug || 'section'
}

function highlightCode(code, language, options) {
  const {
    Hljs,
    codeHighlightExtensionMap = {},
    codeBlockClass = (lang) => `v-md-hljs-${lang || ''}`,
  } = options

  const normalizedLanguage = codeHighlightExtensionMap[language] || language
  let highlighted = escapeHtml(code)

  if (
    Hljs &&
    normalizedLanguage &&
    typeof Hljs.getLanguage === 'function' &&
    Hljs.getLanguage(normalizedLanguage)
  ) {
    try {
      highlighted = Hljs.highlight(code, {
        language: normalizedLanguage,
        ignoreIllegals: true,
      }).value
    } catch {
      // highlight.js 10 compatibility.
      highlighted = Hljs.highlight(normalizedLanguage, code, true).value
    }
  }

  return `<pre class="${escapeHtml(codeBlockClass(normalizedLanguage))}"><code>${highlighted}</code></pre>`
}

function installHeadingAnchors(parser) {
  parser.core.ruler.before('block', 'vue_markdown_kit_heading_state', (state) => {
    state.env.__vueMarkdownKitHeadingSlugs = new Map()
  })

  const fallback =
    parser.renderer.rules.heading_open ||
    ((tokens, index, options, _env, self) => self.renderToken(tokens, index, options))

  parser.renderer.rules.heading_open = (tokens, index, options, env, self) => {
    const inline = tokens[index + 1]
    const baseSlug = slugifyHeading(inline && inline.content)
    const slugs = env.__vueMarkdownKitHeadingSlugs || new Map()
    const count = slugs.get(baseSlug) || 0
    const slug = count === 0 ? baseSlug : `${baseSlug}-${count}`

    slugs.set(baseSlug, count + 1)
    env.__vueMarkdownKitHeadingSlugs = slugs

    tokens[index].attrSet('id', slug)
    tokens[index].attrSet('data-v-md-heading', slug)

    return fallback(tokens, index, options, env, self)
  }
}

function installSafeExternalLinks(parser) {
  const fallback =
    parser.renderer.rules.link_open ||
    ((tokens, index, options, _env, self) => self.renderToken(tokens, index, options))

  parser.renderer.rules.link_open = (tokens, index, options, env, self) => {
    const token = tokens[index]
    const href = token.attrGet('href') || ''

    if (/^https?:\/\//i.test(href)) {
      token.attrSet('target', '_blank')
      token.attrSet('rel', 'noopener noreferrer')
    }

    return fallback(tokens, index, options, env, self)
  }
}

export function createMarkdownRenderer(options = {}) {
  const parser = new MarkdownIt({
    html: options.html ?? true,
    breaks: options.breaks ?? true,
    linkify: options.linkify ?? false,
    typographer: options.typographer ?? true,
    highlight: (code, language) => highlightCode(code, language, options),
  })

  if (options.attrs !== false) {
    parser.use(markdownItAttrs, {
      leftDelimiter: '{{{',
      rightDelimiter: '}}}',
      allowedAttributes: [
        'class',
        'height',
        'id',
        'title',
        'width',
        ...(options.allowedAttributes || []),
      ],
    })
  }

  installHeadingAnchors(parser)
  installSafeExternalLinks(parser)

  return parser
}
