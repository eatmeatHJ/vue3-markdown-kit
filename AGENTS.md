# Vue 3 Markdown Kit Agent Guide

This repository is the Vue 3.5 edition of the Markdown preview package. Read
this file before changing or releasing the package.

## Technical baseline

- Package name: `vue3-markdown-kit`
- Vue peer range: `^3.5.0`
- Development and mount tests use Vue 3.5.38.
- Use the Vue 3 Composition API for component changes.
- Preserve the documented props, events, theme API, CSS classes, and legacy
  `lib/...` entry points unless a breaking release is intentional.
- `lib/` is committed because consumers may install directly from GitHub.

## Required validation

Run the full package check before committing a release:

```sh
npm run check
```

This builds ESM and CommonJS bundles, runs runtime and BPM compatibility tests,
checks TypeScript declarations, and validates the npm package contents. Also
run `npm audit --omit=dev`.

After building, commit the generated changes under `lib/`. CI verifies that a
fresh build does not change the committed distribution.

## Version synchronization

Every release version must match in all three locations:

- `package.json`
- `package-lock.json`
- `src/version.js`

Do not rely on `npm version` alone because it does not update
`src/version.js`. Confirm both the package metadata and
`VMdPreview.version` before release.

## Release process

GitHub pushes alone do not publish npm packages. npm Trusted Publishing is
configured for this repository and `.github/workflows/publish.yml`.

1. Update the three version locations and `CHANGELOG.md`.
2. Run `npm run check` and `npm audit --omit=dev`.
3. Commit the source and generated `lib/` files.
4. Create and push an annotated `vX.Y.Z` tag.
5. Publish a GitHub Release for that tag.
6. Confirm the `Publish Package` workflow succeeds and verify npm `latest`.

The workflow requires the Release tag to equal `v` plus the version in
`package.json`, skips a version already present on npm, and publishes through
OIDC. Do not add an npm write token or run a second manual `npm publish` after
the workflow succeeds.

Trusted Publisher configuration (external npm setting, configured
2026-09-10): GitHub user `eatmeatHJ`, repository `vue3-markdown-kit`, workflow
filename `publish.yml`, no environment, direct `npm publish` allowed. The
first real OIDC publish will occur with the next version after `0.1.0`.
