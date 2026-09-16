# 快速開始

安裝後，在 Vue 元件中匯入預覽元件與主題，就能把 Markdown 字串顯示成文件。

```sh
npm install vue3-markdown-kit
```

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VMdPreview, githubTheme } from 'vue3-markdown-kit'
import 'vue3-markdown-kit/style/preview.css'
import 'vue3-markdown-kit/theme/style/github.css'

VMdPreview.use(githubTheme)
const markdown = ref('# 我的第一份文件\n\nHello, Vue 3!')

function handleImageClick(images: string[], index: number) {
  console.log('目前點擊的圖片：', images[index])
}
</script>

<template>
  <textarea v-model="markdown" />
  <VMdPreview :text="markdown" @image-click="handleImageClick" />
</template>
```

## 程式碼高亮

在應用程式入口註冊需要的語言。若應用程式直接匯入 `highlight.js`，也請將它加入應用程式的依賴。

```sh
npm install highlight.js
```

```ts
import { VMdPreview, githubTheme } from 'vue3-markdown-kit'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import 'highlight.js/styles/github.css'

hljs.registerLanguage('javascript', javascript)
VMdPreview.use(githubTheme, { Hljs: hljs })
```

## 範例可以操作什麼？

| 範例 | 操作方式 |
| --- | --- |
| 基本語法 | 修改標題、清單或表格，觀察即時預覽 |
| 程式碼高亮 | 修改 fenced code block 中的 JavaScript、TypeScript 或 Vue 標記 |
| 圖片事件 | 點擊圖片，查看 `image-click` 回傳值 |
| HTML 清理 | 展開「渲染後的 HTML」，查看清理後的 HTML |

互動範例限制輸入為 50,000 字元。文字只保留在目前頁面的記憶體，重新整理會回復預設內容。輸入的遠端圖片仍會由瀏覽器向圖片網址請求。

## 在本機執行這個文件站

```sh
npm ci
npm run build
npm run docs:dev
```

開啟 `http://127.0.0.1:4173`。修改 TypeScript、CSS 或 Markdown 後重新整理頁面即可查看；修改 `index.html` 或範例圖片後需重啟指令。

```sh
npm run docs:check
npm run docs:build
```

建置結果位於 `docs-dist/`，可放在 GitHub Pages 等靜態網站空間。所有程式碼與樣式都會打包，不需要 CDN 或後端服務。

## 發佈到 GitHub Pages

1. 將範例站與 `.github/workflows/pages.yml` 提交並推送到 GitHub 的 `main` 分支。
2. 在 repository 的 **Settings → Pages → Build and deployment → Source** 選擇 **GitHub Actions**。
3. 到 **Actions → Deploy documentation → Run workflow** 執行首次部署。
4. 部署成功後，從 workflow 的 `github-pages` environment 連結開啟網站。

之後推送至 `main` 會自動更新文件站；Pull Request 只驗證建置，不發佈網站。網站部署與 npm 套件發佈為不同流程。
