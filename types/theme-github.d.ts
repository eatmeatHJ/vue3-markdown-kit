import type { MarkdownRendererOptions } from './core'
import type { MarkdownTheme, VMdPreviewComponent } from './preview'

export function createGithubTheme(
  options?: MarkdownRendererOptions,
): MarkdownTheme

declare const githubTheme: {
  install(
    preview: VMdPreviewComponent,
    options?: MarkdownRendererOptions,
  ): void
}

export default githubTheme
