var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/theme/github.js
var github_exports = {};
__export(github_exports, {
  createGithubTheme: () => createGithubTheme,
  default: () => github_default
});
module.exports = __toCommonJS(github_exports);

// src/core/renderer.js
var import_markdown_it = __toESM(require("markdown-it"), 1);
var import_markdown_it_attrs = __toESM(require("markdown-it-attrs"), 1);
function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function slugifyHeading(value) {
  const slug = String(value || "").normalize("NFKC").trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\p{Letter}\p{Number}_-]+/gu, "").replace(/-{2,}/g, "-").replace(/^-|-$/g, "");
  return slug || "section";
}
function highlightCode(code, language, options) {
  const {
    Hljs,
    codeHighlightExtensionMap = {},
    codeBlockClass = (lang) => `v-md-hljs-${lang || ""}`
  } = options;
  const normalizedLanguage = codeHighlightExtensionMap[language] || language;
  let highlighted = escapeHtml(code);
  if (Hljs && normalizedLanguage && typeof Hljs.getLanguage === "function" && Hljs.getLanguage(normalizedLanguage)) {
    try {
      highlighted = Hljs.highlight(code, {
        language: normalizedLanguage,
        ignoreIllegals: true
      }).value;
    } catch {
      highlighted = Hljs.highlight(normalizedLanguage, code, true).value;
    }
  }
  return `<pre class="${escapeHtml(codeBlockClass(normalizedLanguage))}"><code>${highlighted}</code></pre>`;
}
function installHeadingAnchors(parser) {
  parser.core.ruler.before("block", "vue_markdown_kit_heading_state", (state) => {
    state.env.__vueMarkdownKitHeadingSlugs = /* @__PURE__ */ new Map();
  });
  const fallback = parser.renderer.rules.heading_open || ((tokens, index, options, _env, self) => self.renderToken(tokens, index, options));
  parser.renderer.rules.heading_open = (tokens, index, options, env, self) => {
    const inline = tokens[index + 1];
    const baseSlug = slugifyHeading(inline && inline.content);
    const slugs = env.__vueMarkdownKitHeadingSlugs || /* @__PURE__ */ new Map();
    const count = slugs.get(baseSlug) || 0;
    const slug = count === 0 ? baseSlug : `${baseSlug}-${count}`;
    slugs.set(baseSlug, count + 1);
    env.__vueMarkdownKitHeadingSlugs = slugs;
    tokens[index].attrSet("id", slug);
    tokens[index].attrSet("data-v-md-heading", slug);
    return fallback(tokens, index, options, env, self);
  };
}
function installSafeExternalLinks(parser) {
  const fallback = parser.renderer.rules.link_open || ((tokens, index, options, _env, self) => self.renderToken(tokens, index, options));
  parser.renderer.rules.link_open = (tokens, index, options, env, self) => {
    const token = tokens[index];
    const href = token.attrGet("href") || "";
    if (/^https?:\/\//i.test(href)) {
      token.attrSet("target", "_blank");
      token.attrSet("rel", "noopener noreferrer");
    }
    return fallback(tokens, index, options, env, self);
  };
}
function createMarkdownRenderer(options = {}) {
  var _a, _b, _c, _d;
  const parser = new import_markdown_it.default({
    html: (_a = options.html) != null ? _a : true,
    breaks: (_b = options.breaks) != null ? _b : true,
    linkify: (_c = options.linkify) != null ? _c : false,
    typographer: (_d = options.typographer) != null ? _d : true,
    highlight: (code, language) => highlightCode(code, language, options)
  });
  if (options.attrs !== false) {
    parser.use(import_markdown_it_attrs.default, {
      leftDelimiter: "{{{",
      rightDelimiter: "}}}",
      allowedAttributes: [
        "class",
        "height",
        "id",
        "title",
        "width",
        ...options.allowedAttributes || []
      ]
    });
  }
  installHeadingAnchors(parser);
  installSafeExternalLinks(parser);
  return parser;
}

// src/theme/github.js
function createGithubTheme(options = {}) {
  const markdownParser = createMarkdownRenderer(options);
  return {
    name: "github",
    previewClass: "github-markdown-body",
    markdownParser,
    extend(callback) {
      callback(markdownParser, options.Hljs);
    }
  };
}
var githubTheme = {
  install(VMdPreview, options = {}) {
    VMdPreview.theme(createGithubTheme(options));
  }
};
var github_default = githubTheme;
//# sourceMappingURL=github.cjs.map
