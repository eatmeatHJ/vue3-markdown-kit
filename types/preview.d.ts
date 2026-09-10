import type { App, DefineComponent } from 'vue'
import type { Config as DOMPurifyConfig } from 'dompurify'
import type { MarkdownRenderer } from './core'

export interface MarkdownTheme {
  name?: string
  previewClass: string
  markdownParser: MarkdownRenderer
  extend(
    callback: (parser: MarkdownRenderer, highlighter?: unknown) => void,
  ): void
}

export interface VMdPreviewPlugin {
  name: 'v-md-preview'
  version: string
  install(app: App): void
  theme(theme: MarkdownTheme): this
  use(theme: unknown, options?: unknown): this
  extendMarkdown(extender: (parser: MarkdownRenderer) => void): this
  xss: {
    process(dirtyHtml: string, options?: DOMPurifyConfig): string
    extend(options?: DOMPurifyConfig): unknown
    reset(): unknown
  }
}

export type VMdPreviewComponent = DefineComponent<{
  text?: string
  theme?: MarkdownTheme
  tabSize?: number
  scrollContainer?: () => unknown
  top?: number
  sanitizeOptions?: DOMPurifyConfig
}> & VMdPreviewPlugin

declare const VMdPreview: VMdPreviewComponent

export default VMdPreview
