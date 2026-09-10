import VMdPreview from './preview.js'
import githubTheme, { createGithubTheme } from './theme/github.js'

const VueMarkdownKit = {
  version: VMdPreview.version,
  install(Vue) {
    VMdPreview.install(Vue)
  },
}

export { VMdPreview, VueMarkdownKit, createGithubTheme, githubTheme }
export * from './core/index.js'
export default VueMarkdownKit
