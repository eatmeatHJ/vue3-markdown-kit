import createDOMPurify from 'dompurify'

const BASE_SANITIZE_OPTIONS = Object.freeze({
  USE_PROFILES: {
    html: true,
  },
  ADD_ATTR: [
    'data-mention-id',
    'data-v-md-anchor',
    'data-v-md-heading',
    'data-v-md-line',
    'rel',
    'target',
  ],
  FORBID_TAGS: ['script'],
})

let sharedOptions = {}

function mergeOptions(base, extra) {
  const merged = {
    ...base,
    ...extra,
  }

  for (const key of ['ADD_ATTR', 'ADD_TAGS', 'FORBID_ATTR', 'FORBID_TAGS']) {
    if (base[key] || extra[key]) {
      merged[key] = [...new Set([...(base[key] || []), ...(extra[key] || [])])]
    }
  }

  if (base.USE_PROFILES || extra.USE_PROFILES) {
    merged.USE_PROFILES = {
      ...(base.USE_PROFILES || {}),
      ...(extra.USE_PROFILES || {}),
    }
  }

  return merged
}

function resolvePurifier(windowLike) {
  if (typeof createDOMPurify.sanitize === 'function') {
    return createDOMPurify
  }

  if (windowLike && typeof createDOMPurify === 'function') {
    return createDOMPurify(windowLike)
  }

  return null
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function sanitizeHtml(
  dirtyHtml,
  options = {},
  windowLike = typeof window === 'undefined' ? undefined : window,
) {
  const purifier = resolvePurifier(windowLike)

  // Fail closed in non-DOM environments rather than returning executable HTML.
  if (!purifier || typeof purifier.sanitize !== 'function') {
    return escapeHtml(dirtyHtml || '')
  }

  return purifier.sanitize(
    dirtyHtml || '',
    mergeOptions(mergeOptions(BASE_SANITIZE_OPTIONS, sharedOptions), options),
  )
}

export const sanitizer = {
  process(dirtyHtml, options) {
    return sanitizeHtml(dirtyHtml, options)
  },

  extend(options = {}) {
    sharedOptions = mergeOptions(sharedOptions, options)
    return this
  },

  reset() {
    sharedOptions = {}
    return this
  },
}
