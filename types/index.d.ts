import type { Plugin } from 'vue'
import type { MarkdownRendererOptions } from './core'
import type { MarkdownTheme } from './preview'

export { default as VMdPreview } from './preview'
export * from './core'

export function createGithubTheme(
  options?: MarkdownRendererOptions,
): MarkdownTheme

export const githubTheme: {
  install(preview: unknown, options?: MarkdownRendererOptions): void
}

export const VueMarkdownKit: Plugin & {
  version: string
}

export default VueMarkdownKit
