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

// src/preview.js
var preview_exports = {};
__export(preview_exports, {
  default: () => preview_default
});
module.exports = __toCommonJS(preview_exports);
var import_vue = require("vue");

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

// src/core/sanitize.js
var import_dompurify = __toESM(require("dompurify"), 1);
var BASE_SANITIZE_OPTIONS = Object.freeze({
  USE_PROFILES: {
    html: true
  },
  ADD_ATTR: [
    "data-mention-id",
    "data-v-md-anchor",
    "data-v-md-heading",
    "data-v-md-line",
    "rel",
    "target"
  ],
  FORBID_TAGS: ["script"]
});
var sharedOptions = {};
function mergeOptions(base, extra) {
  const merged = {
    ...base,
    ...extra
  };
  for (const key of ["ADD_ATTR", "ADD_TAGS", "FORBID_ATTR", "FORBID_TAGS"]) {
    if (base[key] || extra[key]) {
      merged[key] = [.../* @__PURE__ */ new Set([...base[key] || [], ...extra[key] || []])];
    }
  }
  if (base.USE_PROFILES || extra.USE_PROFILES) {
    merged.USE_PROFILES = {
      ...base.USE_PROFILES || {},
      ...extra.USE_PROFILES || {}
    };
  }
  return merged;
}
function resolvePurifier(windowLike) {
  if (typeof import_dompurify.default.sanitize === "function") {
    return import_dompurify.default;
  }
  if (windowLike && typeof import_dompurify.default === "function") {
    return (0, import_dompurify.default)(windowLike);
  }
  return null;
}
function escapeHtml2(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function sanitizeHtml(dirtyHtml, options = {}, windowLike = typeof window === "undefined" ? void 0 : window) {
  const purifier = resolvePurifier(windowLike);
  if (!purifier || typeof purifier.sanitize !== "function") {
    return escapeHtml2(dirtyHtml || "");
  }
  return purifier.sanitize(
    dirtyHtml || "",
    mergeOptions(mergeOptions(BASE_SANITIZE_OPTIONS, sharedOptions), options)
  );
}
var sanitizer = {
  process(dirtyHtml, options) {
    return sanitizeHtml(dirtyHtml, options);
  },
  extend(options = {}) {
    sharedOptions = mergeOptions(sharedOptions, options);
    return this;
  },
  reset() {
    sharedOptions = {};
    return this;
  }
};

// src/version.js
var version = "0.1.0";

// src/preview.js
var defaultThemeConfig = {
  name: "base",
  previewClass: "vmk-markdown-body",
  markdownParser: createMarkdownRenderer(),
  extend(callback) {
    callback(this.markdownParser);
  }
};
var markdownExtenders = [];
var activeThemeConfig = defaultThemeConfig;
function installTheme(theme, options) {
  if (!theme) return;
  if (typeof theme === "function") {
    theme(VMdPreview, options);
  } else if (typeof theme.install === "function") {
    theme.install(VMdPreview, options);
  } else if (theme.markdownParser) {
    VMdPreview.theme(theme);
  }
}
var VMdPreview = (0, import_vue.defineComponent)({
  name: "v-md-preview",
  props: {
    text: {
      type: String,
      default: ""
    },
    theme: {
      type: Object,
      default: void 0
    },
    tabSize: {
      type: Number,
      default: 2
    },
    scrollContainer: {
      type: Function,
      default: () => window
    },
    top: {
      type: Number,
      default: 0
    },
    sanitizeOptions: {
      type: Object,
      default: () => ({})
    }
  },
  emits: {
    change: (_text, _html) => true,
    "image-click": (_images, _index) => true
  },
  setup(props, { emit }) {
    const rootElement = (0, import_vue.shallowRef)(null);
    const html = (0, import_vue.shallowRef)("");
    if (props.theme) {
      installTheme(props.theme);
    }
    for (const extender of markdownExtenders) {
      extender(activeThemeConfig.markdownParser);
    }
    const renderMarkdown = () => {
      const rawHtml = activeThemeConfig.markdownParser.render(props.text || "");
      html.value = sanitizer.process(rawHtml, props.sanitizeOptions);
      emit("change", props.text, html.value);
    };
    (0, import_vue.watch)([() => props.text, () => props.sanitizeOptions], renderMarkdown, {
      deep: true,
      immediate: true
    });
    const handlePreviewClick = (event) => {
      const target = event.target;
      const root = rootElement.value;
      if (!root || !target || target.tagName !== "IMG") {
        return;
      }
      const imageElements = Array.from(root.querySelectorAll("img"));
      const images = imageElements.map((image) => image.getAttribute("src")).filter(Boolean);
      const index = imageElements.indexOf(target);
      emit("image-click", images, index);
    };
    return () => (0, import_vue.h)(
      "div",
      {
        ref: rootElement,
        class: "vue-markdown-kit-preview",
        style: {
          tabSize: props.tabSize,
          MozTabSize: props.tabSize
        },
        onClick: handlePreviewClick
      },
      [
        (0, import_vue.h)("div", {
          class: activeThemeConfig.previewClass,
          innerHTML: html.value
        })
      ]
    );
  }
});
VMdPreview.version = version;
VMdPreview.install = (app) => {
  app.component(VMdPreview.name, VMdPreview);
};
VMdPreview.theme = (themeConfig) => {
  activeThemeConfig = themeConfig || defaultThemeConfig;
  return VMdPreview;
};
VMdPreview.use = (theme, options) => {
  installTheme(theme, options);
  return VMdPreview;
};
VMdPreview.extendMarkdown = (extender) => {
  markdownExtenders.push(extender);
  return VMdPreview;
};
VMdPreview.xss = sanitizer;
VMdPreview.lang = {
  use() {
  },
  add() {
  }
};
var preview_default = VMdPreview;
//# sourceMappingURL=preview.cjs.map
