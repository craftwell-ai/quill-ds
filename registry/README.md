# Quill registry conventions

The shadcn registry is authored in [`registry.json`](../registry.json) at the repo
root and compiled to static per-item JSON under `public/r/` by `npm run
build:registry` (which runs `shadcn build`). Consumers install from
`https://www.quilldesignsystem.com/r/<name>.json`.

## Item metadata (`meta`)

Every `registry:block` item carries a `meta` object so the catalog can be
searched by **meaning**, not just by name — this is the layer AI agents read to
pick the right block:

```jsonc
{
  "name": "activity-feed",
  "type": "registry:block",
  "description": "…what it is (structural)…",
  "meta": {
    "intent": ["data-display"],          // ≥1 tag from the controlled vocabulary
    "use_when": "You need to show a chronological history of what happened — …"
  },
  // …
}
```

- **`description`** stays structural — *what the block is* (shown in the shadcn
  registry UI).
- **`meta.use_when`** is the semantic layer — *when/why to reach for it*.
- **`meta.intent`** tags come only from the controlled vocabulary in
  [`scripts/registry-intent-tags.mjs`](../scripts/registry-intent-tags.mjs).
  Keep the vocabulary tight — a tag that fits everything means nothing.

`meta` is a first-class optional field in the shadcn registry schema
(`Record<string, any>`) and passes through `shadcn build` untouched.

## Enforcement

[`scripts/registry-meta.test.mjs`](../scripts/registry-meta.test.mjs) (run by
`npm run test:tokens`, and therefore CI) asserts:

1. every block declares `meta.intent` with ≥1 tag, all from the vocabulary;
2. every block has a substantive `meta.use_when`;
3. the base theme description names the current **default accent**, derived from
   `DEFAULT_ACCENT` in `scripts/build-tokens.mjs` — so stale accent copy (e.g.
   "terracotta accents" after moss became default) fails CI instead of shipping.

Adding a block? Give it `meta.intent` + `meta.use_when` and run
`npm run build:registry`, or the test will fail.
