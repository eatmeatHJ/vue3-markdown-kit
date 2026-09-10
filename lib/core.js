// src/core/renderer.js
import MarkdownIt from "markdown-it";
import markdownItAttrs from "markdown-it-attrs";
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
  const parser = new MarkdownIt({
    html: (_a = options.html) != null ? _a : true,
    breaks: (_b = options.breaks) != null ? _b : true,
    linkify: (_c = options.linkify) != null ? _c : false,
    typographer: (_d = options.typographer) != null ? _d : true,
    highlight: (code, language) => highlightCode(code, language, options)
  });
  if (options.attrs !== false) {
    parser.use(markdownItAttrs, {
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
import createDOMPurify from "dompurify";
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
  if (typeof createDOMPurify.sanitize === "function") {
    return createDOMPurify;
  }
  if (windowLike && typeof createDOMPurify === "function") {
    return createDOMPurify(windowLike);
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
export {
  createMarkdownRenderer,
  sanitizeHtml,
  sanitizer,
  slugifyHeading
};
//# sourceMappingURL=core.js.map
