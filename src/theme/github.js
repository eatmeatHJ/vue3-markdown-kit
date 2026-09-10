import { createMarkdownRenderer } from '../core/renderer.js'

export function createGithubTheme(options = {}) {
  const markdownParser = createMarkdownRenderer(options)

  return {
    name: 'github',
    previewClass: 'github-markdown-body',
    markdownParser,
    extend(callback) {
      callback(markdownParser, options.Hljs)
    },
  }
}

const githubTheme = {
  install(VMdPreview, options = {}) {
    VMdPreview.theme(createGithubTheme(options))
  },
}

export default githubTheme
