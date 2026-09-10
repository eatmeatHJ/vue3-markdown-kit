import assert from 'node:assert/strict'
import test from 'node:test'
import { JSDOM } from 'jsdom'
import { createGithubTheme } from '../lib/theme/github.js'
import { sanitizeHtml } from '../lib/core.js'

test('preserves the Markdown features used by the BPM viewer', () => {
  const parser = createGithubTheme().markdownParser
  const source = [
    '# 訊息',
    '',
    '<span class="mention-tag">@王小明</span>',
    '',
    '- 第一項',
    '- 第二項',
    '',
    '| 欄位 | 值 |',
    '| --- | --- |',
    '| A | B |',
    '',
    '[表單](/PowerBPM/formList/74/file/15)',
    '',
    '```javascript',
    'const answer = 42',
    '```',
  ].join('\n')

  const window = new JSDOM('').window
  const clean = sanitizeHtml(parser.render(source), {}, window)

  assert.match(clean, /class="mention-tag"/)
  assert.match(clean, /<ul>/)
  assert.match(clean, /<table>/)
  assert.match(clean, /href="\/PowerBPM\/formList\/74\/file\/15"/)
  assert.match(clean, /v-md-hljs-javascript/)
})
