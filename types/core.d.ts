import type { Config as DOMPurifyConfig } from 'dompurify'

export interface MarkdownRenderer {
  render(source: string, environment?: Record<string, unknown>): string
  use(plugin: unknown, ...options: unknown[]): this
  set(options: Record<string, unknown>): this
  renderer: {
    rules: Record<string, unknown>
  }
}

export interface MarkdownRendererOptions {
  Hljs?: unknown
  html?: boolean
  breaks?: boolean
  linkify?: boolean
  typographer?: boolean
  attrs?: boolean
  allowedAttributes?: string[]
  codeHighlightExtensionMap?: Record<string, string>
  codeBlockClass?: (language?: string) => string
}

export function createMarkdownRenderer(
  options?: MarkdownRendererOptions,
): MarkdownRenderer

export function slugifyHeading(value: string): string

export function sanitizeHtml(
  dirtyHtml: string,
  options?: DOMPurifyConfig,
  windowLike?: Window,
): string

export const sanitizer: {
  process(dirtyHtml: string, options?: DOMPurifyConfig): string
  extend(options?: DOMPurifyConfig): typeof sanitizer
  reset(): typeof sanitizer
}
