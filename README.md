# TanStack Start + Vite 8: second-level chunks are not preloaded

Minimal reproducer for [TanStack/router#8511](https://github.com/TanStack/router/issues/8511).

With Vite 8 (Rolldown), `chunk.imports` lists only a chunk's **direct** imports. `getChunkPreloads`
in `@tanstack/start-plugin-core` builds the `modulepreload` list from it one level deep, so a chunk
imported by a preloaded chunk is fetched only after its importer downloads and executes (a request
waterfall). Under Vite 7, Rollup hoisted the transitive import into the route chunk, so it passed.

## The app

Three routes and two shared modules, arranged so the bundler emits the chain
`routes (index) → a → b` as separate chunks:

| module          | imported by                         |
| --------------- | ----------------------------------- |
| `src/shared/a.ts` | `/` and `/third`                  |
| `src/shared/b.ts` | `a.ts` and `/other`               |

The build runs in SPA mode, so the prerendered shell (`dist/client/_shell.html`) contains the
`modulepreload` links for `/`. `scripts/check-preloads.mjs` reads it and fails if any chunk
statically imported by a loaded chunk is not preloaded (dynamic `import()` is ignored).

## Steps

```sh
npm install        # or bun install / pnpm install
npm run build
npm run check
```

### Actual (Vite 8.3.1, `@tanstack/react-start@1.168.58`, `@tanstack/start-plugin-core@1.171.47`)

```
Loaded by the shell (entry + modulepreload):
  /assets/a-D2HQdnvs.js
  /assets/index-Ce_thjJ3.js
  /assets/routes-CAF1CTyi.js

FAIL: statically imported but NOT preloaded:
  /assets/b-Di5O9ZZA.js  (statically imported by /assets/a-D2HQdnvs.js)
```

### Expected

`b` is preloaded too, the same as with Vite 7.

## Comparison: Vite 7 passes

```sh
npm install -D vite@7.3.6 @vitejs/plugin-react@5.2.0
npm run build && npm run check   # PASS
```

Rollup adds `import "./b-….js"` directly to the route chunk, so one level of `chunk.imports`
already covers it.

## Proposed fix

`fix/transitive-preloads.patch` makes `getChunkPreloads` walk the static import graph (the CSS
collector in the same file already does this). With Vite 8:

```sh
npm run fix:apply
npm run build && npm run check   # PASS: b is preloaded
npm run fix:revert
```
