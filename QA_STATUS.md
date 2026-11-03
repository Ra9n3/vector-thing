# Task 16 QA status — work in progress

The outline feature is **not complete** and must not be treated as production-ready.

## Verified locally

- `npm run check`: typecheck, lint, and 163 unit tests passed.
- `npm run build`: passed.
- Outline integration tests cover deterministic SVG/Flat SVG output, CSS exclusion, cache identities, lighting colors, document migration helpers, primitive/preset geometry and grouped undo.
- Fixture `outlines` covers polygon 3/6/12, star 5/8, arrow, a modified rectangle corner and an arc edge. The Playwright suite contains east/south visual cases, interaction scaffolding and a 20-element/100 ms release test; `playwright test --list` discovers them.

## Unverified or incomplete

1. The arbitrary-path inward offset is an approximate mitered polygon, not a robust Euclidean edge-distance/level-set solution. Concave outlines, acute corners, overlapping insets and collapsed rings can fold or self-intersect, affecting Around shading and Flat SVG facets. Correct topology and the required nonzero-fill ring behavior remain to be implemented and tested. Concave shadows/walls, selection bounds and hit targets also need browser verification.
2. New presets and controls exist, but their browser layout, accessibility and interactions have not been verified. Parameter edits and grouping behavior need broader coverage.
3. Flattening and conversion use the 0.25 px target and a 2,000-vertex cap, but at extreme sizes or complexity both limits cannot always be met simultaneously; exact visual equivalence for all primitive conversions has not been established in a browser. The schema migration is a helper wired into fixture loading; this base has no full document persistence/import pipeline to integrate or verify.
4. The editor implements node/radius dragging, edge insertion/selection (Alt-click selects without insertion), pen, mirrors, grid, shift-angle and grouped undo, but all browser interactions are unverified. The drag preview is a translucent outline overlay, not a low-resolution shaded render. Smooth/rounded edge insertion and all combined modifier cases need further correctness work.
5. Single-shape gating and duplicate preservation are implemented; full copy/paste, group and Match/Individual interaction coverage is still needed. This base exposes duplicate rather than a separate clipboard pipeline.
6. Paths use the SVG/Flat SVG/PNG pipelines and central CSS exclusion, but cross-browser SVG/Flat SVG/PNG visual parity has not been established; flat facets inherit the inset limitation above.
7. Shading cache identities include outline nodes, and the overlay coalesces drag previews with requestAnimationFrame. The 20-element release target (<100 ms), cache isolation under real interaction, and absence of Chromium timing regressions are **unverified**. No performance or memory budgets were loosened.
8. No browser executable or Playwright browser cache was available, and downloading unlisted browser binaries was prohibited. Consequently east/south visual baselines were not captured (those screenshot tests are explicitly skipped), browser tests and export parity were not run, and the timing test has no measurement. Additional exact-conversion, fixed-light visual, interaction, persistence and concave-offset tests are still needed.
