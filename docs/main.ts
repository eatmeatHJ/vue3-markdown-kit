import { createApp, defineComponent, h, shallowRef } from 'vue'
import { VMdPreview, githubTheme } from 'vue3-markdown-kit'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import bash from 'highlight.js/lib/languages/bash'
import 'vue3-markdown-kit/style/preview.css'
import 'vue3-markdown-kit/theme/style/github.css'
import 'highlight.js/styles/github.css'
import './style.css'
import readme from '../README.md'
import guide from './guide.md'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('xml', xml)
hljs.registerAliases('vue', { languageName: 'xml' })
hljs.registerLanguage('css', css)
hljs.registerLanguage('bash', bash)
VMdPreview.use(githubTheme, { Hljs: hljs })

const samples = {
  '基本語法': '# Hello, Vue 3 👋\n\n把左側內容換成你的 Markdown，右側會即時更新。\n\n## 輕量的文件預覽\n\n支援 **粗體**、*斜體*、~~刪除線~~ 與 `inline code`。\n\n> 文件與預覽使用同一個套件。\n\n- Vue 3.5 Composition API\n- GitHub 風格主題\n- DOMPurify 清理 HTML\n\n| 功能 | 支援 |\n| --- | --- |\n| 表格 | ✓ |\n| 程式碼高亮 | ✓ |\n| 圖片點擊事件 | ✓ |\n',
  '程式碼高亮': '# 按需註冊語言\n\n```javascript\nimport { ref } from \'vue\'\nconst message = ref(\'Hello, Markdown!\')\n```\n\n```typescript\ninterface Document {\n  title: string\n  content: string\n}\n```\n\n```vue\n<template>\n  <VMdPreview :text="markdown" />\n</template>\n```',
  '圖片事件': '# 試著點擊圖片\n\n![Vue 3 Markdown Kit 範例圖片](./sample.svg)\n\n點擊後，下方會顯示 `image-click(images, index)` 回傳的索引與圖片路徑。',
  'HTML 清理': '# HTML 清理\n\n<strong>這段粗體 HTML 會保留。</strong>\n\n<a href="javascript:alert(1)">這個連結的危險協定會被移除。</a>\n\n<script>alert("不應執行")</script>\n\n展開下方「渲染後的 HTML」，查看 DOMPurify 清理後的結果。',
}
type Sample = keyof typeof samples
const repository = 'https://github.com/eatmeatHJ/vue3-markdown-kit'
// README links normally resolve on GitHub; preserve their destination on Pages.
const apiDocs = readme.replace(/\]\((?!https?:|#)([^)]+)\)/g, `](${repository}/blob/main/$1)`)

createApp(defineComponent({
  setup() {
    const selected = shallowRef<Sample>('基本語法')
    const markdown = shallowRef(samples[selected.value])
    const rendered = shallowRef('')
    const imageEvent = shallowRef('尚未點擊圖片')
    function loadSample(name: Sample) {
      selected.value = name
      markdown.value = samples[name]
      imageEvent.value = '尚未點擊圖片'
    }
    return () => h('div', { class: 'site' }, [
      h('header', { class: 'header' }, [
        h('a', { class: 'brand', href: '#' }, '◈ Vue 3 Markdown Kit'),
        h('nav', { 'aria-label': '主要導覽' }, [
          h('a', { href: '#playground' }, '互動範例'),
          h('a', { href: '#guide' }, '快速開始'),
          h('a', { href: '#api' }, 'API 文件'),
          h('a', { href: repository }, 'GitHub ↗'),
        ]),
      ]),
      h('main', [
        h('section', { class: 'hero' }, [
          h('p', { class: 'eyebrow' }, `VUE 3.5 · v${VMdPreview.version}`),
          h('h1', 'Vue 3 Markdown Kit'),
          h('p', { class: 'intro' }, '使用文件與互動範例'),
          h('code', { class: 'install' }, 'npm install vue3-markdown-kit'),
        ]),
        h('section', { id: 'playground', class: 'playground' }, [
          h('div', { class: 'section-heading' }, [h('h2', '互動範例'), h('span', '編輯 → 即時預覽')]),
          h('div', { class: 'toolbar', role: 'group', 'aria-label': '範例選擇' }, [
            ...Object.keys(samples).map(name => h('button', {
              type: 'button', 'aria-pressed': selected.value === name,
              onClick: () => loadSample(name as Sample),
            }, name)),
            h('button', { type: 'button', class: 'reset', onClick: () => loadSample(selected.value) }, '重設範例'),
          ]),
          h('div', { class: 'workspace' }, [
            h('div', { class: 'editor-panel' }, [
              h('label', { class: 'panel-title', for: 'markdown-source' }, 'MARKDOWN'),
              h('textarea', {
                id: 'markdown-source', value: markdown.value, spellcheck: false,
                maxlength: 50000,
                onInput: (event: Event) => { markdown.value = (event.target as HTMLTextAreaElement).value },
              }),
            ]),
            h('div', { class: 'preview-panel' }, [
              h('div', { class: 'panel-title' }, 'PREVIEW'),
              h(VMdPreview, {
                text: markdown.value,
                onChange: (_text: string, html: string) => { rendered.value = html },
                onImageClick: (images: string[], index: number) => {
                  imageEvent.value = `image-click · index: ${index} · src: ${images[index]}`
                },
              }),
            ]),
          ]),
          h('div', { class: 'status', role: 'status' }, imageEvent.value),
          h('details', [h('summary', '渲染後的 HTML'), h('pre', { class: 'html-output' }, rendered.value)]),
        ]),
        h('section', { id: 'guide', class: 'document' }, [h(VMdPreview, { text: guide })]),
        h('section', { id: 'api', class: 'document' }, [h('p', { class: 'eyebrow' }, '完整文件 · README'), h(VMdPreview, { text: apiDocs })]),
      ]),
      h('footer', ['Vue 3 Markdown Kit · MIT License · ', h('a', { href: repository }, 'View source on GitHub')]),
    ])
  },
})).mount('#app')
