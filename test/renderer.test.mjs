import assert from 'node:assert/strict'
import test from 'node:test'
import { JSDOM } from 'jsdom'
import {
  createMarkdownRenderer,
  sanitizeHtml,
  slugifyHeading,
} from '../lib/core.js'

test('renders common Markdown and stable heading anchors', () => {
  const parser = createMarkdownRenderer()
  const html = parser.render([
    '# Hello World',
    '',
    '# Hello World',
    '',
    '| A | B |',
    '| - | - |',
    '| 1 | 2 |',
  ].join('\n'))

  assert.match(html, /id="hello-world"/)
  assert.match(html, /id="hello-world-1"/)
  assert.match(html, /<table>/)
})

test('adds safe attributes to external links only', () => {
  const parser = createMarkdownRenderer()
  const html = parser.render(
    '[external](https://example.com) [internal](/PowerBPM/item)',
  )

  assert.match(
    html,
    /href="https:\/\/example\.com" target="_blank" rel="noopener noreferrer"/,
  )
  assert.match(html, /href="\/PowerBPM\/item"/)
  assert.doesNotMatch(html, /href="\/PowerBPM\/item" target=/)
})

test('sanitizes executable HTML while retaining application data attributes', () => {
  const window = new JSDOM('').window
  const clean = sanitizeHtml(
    '<script>alert(1)</script><img src="x" onerror="alert(2)"><span class="mention" data-mention-id="42">@User</span>',
    {},
    window,
  )

  assert.doesNotMatch(clean, /script/i)
  assert.doesNotMatch(clean, /onerror/i)
  assert.match(clean, /class="mention"/)
  assert.match(clean, /data-mention-id="42"/)
})

test('slugifies Unicode headings without discarding readable text', () => {
  assert.equal(slugifyHeading('測試 標題'), '測試-標題')
  assert.equal(slugifyHeading('  Hello, Vue!  '), 'hello-vue')
})
