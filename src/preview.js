import { defineComponent, h, shallowRef, watch } from 'vue'
import { createMarkdownRenderer } from './core/renderer.js'
import { sanitizer } from './core/sanitize.js'
import { version } from './version.js'

const defaultThemeConfig = {
  name: 'base',
  previewClass: 'vmk-markdown-body',
  markdownParser: createMarkdownRenderer(),
  extend(callback) {
    callback(this.markdownParser)
  },
}

const markdownExtenders = []
let activeThemeConfig = defaultThemeConfig

function installTheme(theme, options) {
  if (!theme) return

  if (typeof theme === 'function') {
    theme(VMdPreview, options)
  } else if (typeof theme.install === 'function') {
    theme.install(VMdPreview, options)
  } else if (theme.markdownParser) {
    VMdPreview.theme(theme)
  }
}

const VMdPreview = defineComponent({
  name: 'v-md-preview',

  props: {
    text: {
      type: String,
      default: '',
    },
    theme: {
      type: Object,
      default: undefined,
    },
    tabSize: {
      type: Number,
      default: 2,
    },
    scrollContainer: {
      type: Function,
      default: () => window,
    },
    top: {
      type: Number,
      default: 0,
    },
    sanitizeOptions: {
      type: Object,
      default: () => ({}),
    },
  },

  emits: {
    change: (_text, _html) => true,
    'image-click': (_images, _index) => true,
  },

  setup(props, { emit }) {
    const rootElement = shallowRef(null)
    const html = shallowRef('')

    if (props.theme) {
      installTheme(props.theme)
    }

    for (const extender of markdownExtenders) {
      extender(activeThemeConfig.markdownParser)
    }

    const renderMarkdown = () => {
      const rawHtml = activeThemeConfig.markdownParser.render(props.text || '')
      html.value = sanitizer.process(rawHtml, props.sanitizeOptions)
      emit('change', props.text, html.value)
    }

    watch([() => props.text, () => props.sanitizeOptions], renderMarkdown, {
      deep: true,
      immediate: true,
    })

    const handlePreviewClick = (event) => {
      const target = event.target
      const root = rootElement.value

      if (!root || !target || target.tagName !== 'IMG') {
        return
      }

      const imageElements = Array.from(root.querySelectorAll('img'))
      const images = imageElements
        .map((image) => image.getAttribute('src'))
        .filter(Boolean)
      const index = imageElements.indexOf(target)

      emit('image-click', images, index)
    }

    return () =>
      h(
        'div',
        {
          ref: rootElement,
          class: 'vue-markdown-kit-preview',
          style: {
            tabSize: props.tabSize,
            MozTabSize: props.tabSize,
          },
          onClick: handlePreviewClick,
        },
        [
          h('div', {
            class: activeThemeConfig.previewClass,
            innerHTML: html.value,
          }),
        ],
      )
  },
})

VMdPreview.version = version
VMdPreview.install = (app) => {
  app.component(VMdPreview.name, VMdPreview)
}
VMdPreview.theme = (themeConfig) => {
  activeThemeConfig = themeConfig || defaultThemeConfig
  return VMdPreview
}
VMdPreview.use = (theme, options) => {
  installTheme(theme, options)
  return VMdPreview
}
VMdPreview.extendMarkdown = (extender) => {
  markdownExtenders.push(extender)
  return VMdPreview
}
VMdPreview.xss = sanitizer
VMdPreview.lang = {
  use() {},
  add() {},
}

export default VMdPreview
