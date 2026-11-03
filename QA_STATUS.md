# QA status

| Item | Status | Previous measurement |
|---|---|---|
| WebKit 400% zoom | Unverified locally; fix referenced as `97c872e`; WebKit not runnable locally | Glass-glow DPR1/DPR2: 32,414/73,838 differing pixels before compensation; neumorphic-panel DPR2: 15,180 |
| Chromium medium style timing | Unverified in this environment | Canvas 269.8 ms / <100 ms; full UI 400.3 ms / <250 ms |
| Chromium memory slope | Unverified in this environment | 437,856 bytes per 100 cycles / <102,400 bytes per 100 cycles |

| Baseline command | Result |
|---|---|
| `npm run check` | Not run: local TypeScript executable absent |
| `npm run qa -- --project=chromium` | Not run: local Playwright executable absent |
| `npm run qa -- --project=firefox` | Not run: local Playwright executable absent |

# Task 14

| Item | Status |
|---|---|
| Dependency-free Node checks | 11 passed, 0 failed; run with `node --experimental-strip-types --experimental-loader ./qa/node-ts-loader.mjs --test src/profiles/*.node-check.mjs src/document/*.node-check.mjs src/export/flat/*.node-check.mjs` |
| Application unit tests, TypeScript, lint, build | Unverified; dependencies absent |
| Chromium / Firefox / WebKit | Unverified; Playwright and browsers absent; no download attempted |
| Fixture 9 visual baselines, SVG / Flat SVG / PNG parity | Tests written; unverified |
| 20-element custom edit timing / <100 ms | Test written; unverified |
| Custom profile drawing, handles, history, preset controls and exports | Implemented; browser interaction and export rendering unverified |
| Low-resolution face preview during gesture | Unfinished; edits are coalesced with requestAnimationFrame, but the face renderer still uses full resolution |
| Rotation interplay | Unfinished; Task 13 rotation is absent; test marked pending |
| Document migration and user presets | Versioned serialization/migration API and local preset storage added; no existing document open/save UI is wired to that API; full document round-trip unverified |

# Task 15: pre-existing uncommitted files

- `package-lock.json`
- `package.json`
- `src/canvas/ElementView.tsx`
- `src/canvas/SelectionBox.tsx`
- `src/canvas/useCanvasInteractions.ts`
- `src/canvas/useViewport.ts`
- `src/components/Canvas.tsx`
- `src/components/DirectionPad.tsx`
- `src/components/LibraryPanel.tsx`
- `src/components/TopBar.tsx`
- `src/components/icons/ProfileIcons.tsx`
- `src/geometry/bounds.ts`
- `src/history.ts`
- `src/library.ts`
- `src/main.tsx`
- `tsconfig.json`
- `vite.config.ts`
- `.github/workflows/engine-diagnostics.yml`
- `.github/workflows/qa.yml`
- `.gitignore`
- `eslint.config.js`
- `playwright.config.ts`
- `qa/KNOWN_ISSUES.md`
- `qa/MANUAL_CHECKLIST.md`
- `qa/REPORT.md`
- `qa/ci-results/chromium.txt`
- `qa/ci-results/firefox.txt`
- `qa/ci-results/webkit-scale.json`
- `qa/ci-results/webkit.txt`
- `qa/engine-capture.mjs`
- `qa/fixed-cost.mjs`
- `qa/fixtures/glass-glow.json`
- `qa/fixtures/medium.json`
- `qa/fixtures/neumorphic-panel.json`
- `qa/fixtures/shape-grid.json`
- `qa/fixtures/ssl-strip.json`
- `qa/fixtures/stress.json`
- `qa/fixtures/toggles.json`
- `qa/generate-fixtures.ts`
- `qa/heap-retained.mjs`
- `qa/measure-entries.mjs`
- `qa/memory-profile.mjs`
- `qa/memory-retained-round3.json`
- `qa/memory-round3.json`
- `qa/profile.mjs`
- `qa/round3-measurements.json`
- `qa/scale-diagnostic.mjs`
- `qa/snapshots/glass-glow-zoom0-25-dpr1.png`
- `qa/snapshots/glass-glow-zoom0-25-dpr2.png`
- `qa/snapshots/glass-glow-zoom1-dpr1.png`
- `qa/snapshots/glass-glow-zoom1-dpr2.png`
- `qa/snapshots/glass-glow-zoom4-dpr1.png`
- `qa/snapshots/glass-glow-zoom4-dpr2.png`
- `qa/snapshots/neumorphic-panel-glossy-mobile-flat-ne.png`
- `qa/snapshots/neumorphic-panel-glossy-mobile-flat-nw.png`
- `qa/snapshots/neumorphic-panel-glossy-mobile-flat-s.png`
- `qa/snapshots/neumorphic-panel-glossy-mobile-flat-se.png`
- `qa/snapshots/neumorphic-panel-glossy-mobile-flat-sw.png`
- `qa/snapshots/neumorphic-panel-glossy-mobile-slight-ne.png`
- `qa/snapshots/neumorphic-panel-glossy-mobile-slight-nw.png`
- `qa/snapshots/neumorphic-panel-glossy-mobile-slight-s.png`
- `qa/snapshots/neumorphic-panel-glossy-mobile-slight-se.png`
- `qa/snapshots/neumorphic-panel-glossy-mobile-slight-sw.png`
- `qa/snapshots/neumorphic-panel-glossy-mobile-strong-ne.png`
- `qa/snapshots/neumorphic-panel-glossy-mobile-strong-nw.png`
- `qa/snapshots/neumorphic-panel-glossy-mobile-strong-s.png`
- `qa/snapshots/neumorphic-panel-glossy-mobile-strong-se.png`
- `qa/snapshots/neumorphic-panel-glossy-mobile-strong-sw.png`
- `qa/snapshots/neumorphic-panel-neumorphic-flat-ne.png`
- `qa/snapshots/neumorphic-panel-neumorphic-flat-nw.png`
- `qa/snapshots/neumorphic-panel-neumorphic-flat-s.png`
- `qa/snapshots/neumorphic-panel-neumorphic-flat-se.png`
- `qa/snapshots/neumorphic-panel-neumorphic-flat-sw.png`
- `qa/snapshots/neumorphic-panel-neumorphic-slight-ne.png`
- `qa/snapshots/neumorphic-panel-neumorphic-slight-nw.png`
- `qa/snapshots/neumorphic-panel-neumorphic-slight-s.png`
- `qa/snapshots/neumorphic-panel-neumorphic-slight-se.png`
- `qa/snapshots/neumorphic-panel-neumorphic-slight-sw.png`
- `qa/snapshots/neumorphic-panel-neumorphic-strong-ne.png`
- `qa/snapshots/neumorphic-panel-neumorphic-strong-nw.png`
- `qa/snapshots/neumorphic-panel-neumorphic-strong-s.png`
- `qa/snapshots/neumorphic-panel-neumorphic-strong-se.png`
- `qa/snapshots/neumorphic-panel-neumorphic-strong-sw.png`
- `qa/snapshots/neumorphic-panel-soft-clay-flat-ne.png`
- `qa/snapshots/neumorphic-panel-soft-clay-flat-nw.png`
- `qa/snapshots/neumorphic-panel-soft-clay-flat-s.png`
- `qa/snapshots/neumorphic-panel-soft-clay-flat-se.png`
- `qa/snapshots/neumorphic-panel-soft-clay-flat-sw.png`
- `qa/snapshots/neumorphic-panel-soft-clay-slight-ne.png`
- `qa/snapshots/neumorphic-panel-soft-clay-slight-nw.png`
- `qa/snapshots/neumorphic-panel-soft-clay-slight-s.png`
- `qa/snapshots/neumorphic-panel-soft-clay-slight-se.png`
- `qa/snapshots/neumorphic-panel-soft-clay-slight-sw.png`
- `qa/snapshots/neumorphic-panel-soft-clay-strong-ne.png`
- `qa/snapshots/neumorphic-panel-soft-clay-strong-nw.png`
- `qa/snapshots/neumorphic-panel-soft-clay-strong-s.png`
- `qa/snapshots/neumorphic-panel-soft-clay-strong-se.png`
- `qa/snapshots/neumorphic-panel-soft-clay-strong-sw.png`
- `qa/snapshots/neumorphic-panel-studio-hardware-flat-ne.png`
- `qa/snapshots/neumorphic-panel-studio-hardware-flat-nw.png`
- `qa/snapshots/neumorphic-panel-studio-hardware-flat-s.png`
- `qa/snapshots/neumorphic-panel-studio-hardware-flat-se.png`
- `qa/snapshots/neumorphic-panel-studio-hardware-flat-sw.png`
- `qa/snapshots/neumorphic-panel-studio-hardware-slight-ne.png`
- `qa/snapshots/neumorphic-panel-studio-hardware-slight-nw.png`
- `qa/snapshots/neumorphic-panel-studio-hardware-slight-s.png`
- `qa/snapshots/neumorphic-panel-studio-hardware-slight-se.png`
- `qa/snapshots/neumorphic-panel-studio-hardware-slight-sw.png`
- `qa/snapshots/neumorphic-panel-studio-hardware-strong-ne.png`
- `qa/snapshots/neumorphic-panel-studio-hardware-strong-nw.png`
- `qa/snapshots/neumorphic-panel-studio-hardware-strong-s.png`
- `qa/snapshots/neumorphic-panel-studio-hardware-strong-se.png`
- `qa/snapshots/neumorphic-panel-studio-hardware-strong-sw.png`
- `qa/snapshots/neumorphic-panel-zoom0-25-dpr1.png`
- `qa/snapshots/neumorphic-panel-zoom0-25-dpr2.png`
- `qa/snapshots/neumorphic-panel-zoom1-dpr1.png`
- `qa/snapshots/neumorphic-panel-zoom1-dpr2.png`
- `qa/snapshots/neumorphic-panel-zoom4-dpr1.png`
- `qa/snapshots/neumorphic-panel-zoom4-dpr2.png`
- `qa/snapshots/shape-grid-glossy-mobile-flat-ne.png`
- `qa/snapshots/shape-grid-glossy-mobile-flat-nw.png`
- `qa/snapshots/shape-grid-glossy-mobile-flat-s.png`
- `qa/snapshots/shape-grid-glossy-mobile-flat-se.png`
- `qa/snapshots/shape-grid-glossy-mobile-flat-sw.png`
- `qa/snapshots/shape-grid-glossy-mobile-slight-ne.png`
- `qa/snapshots/shape-grid-glossy-mobile-slight-nw.png`
- `qa/snapshots/shape-grid-glossy-mobile-slight-s.png`
- `qa/snapshots/shape-grid-glossy-mobile-slight-se.png`
- `qa/snapshots/shape-grid-glossy-mobile-slight-sw.png`
- `qa/snapshots/shape-grid-glossy-mobile-strong-ne.png`
- `qa/snapshots/shape-grid-glossy-mobile-strong-nw.png`
- `qa/snapshots/shape-grid-glossy-mobile-strong-s.png`
- `qa/snapshots/shape-grid-glossy-mobile-strong-se.png`
- `qa/snapshots/shape-grid-glossy-mobile-strong-sw.png`
- `qa/snapshots/shape-grid-neumorphic-flat-ne.png`
- `qa/snapshots/shape-grid-neumorphic-flat-nw.png`
- `qa/snapshots/shape-grid-neumorphic-flat-s.png`
- `qa/snapshots/shape-grid-neumorphic-flat-se.png`
- `qa/snapshots/shape-grid-neumorphic-flat-sw.png`
- `qa/snapshots/shape-grid-neumorphic-slight-ne.png`
- `qa/snapshots/shape-grid-neumorphic-slight-nw.png`
- `qa/snapshots/shape-grid-neumorphic-slight-s.png`
- `qa/snapshots/shape-grid-neumorphic-slight-se.png`
- `qa/snapshots/shape-grid-neumorphic-slight-sw.png`
- `qa/snapshots/shape-grid-neumorphic-strong-ne.png`
- `qa/snapshots/shape-grid-neumorphic-strong-nw.png`
- `qa/snapshots/shape-grid-neumorphic-strong-s.png`
- `qa/snapshots/shape-grid-neumorphic-strong-se.png`
- `qa/snapshots/shape-grid-neumorphic-strong-sw.png`
- `qa/snapshots/shape-grid-soft-clay-flat-ne.png`
- `qa/snapshots/shape-grid-soft-clay-flat-nw.png`
- `qa/snapshots/shape-grid-soft-clay-flat-s.png`
- `qa/snapshots/shape-grid-soft-clay-flat-se.png`
- `qa/snapshots/shape-grid-soft-clay-flat-sw.png`
- `qa/snapshots/shape-grid-soft-clay-slight-ne.png`
- `qa/snapshots/shape-grid-soft-clay-slight-nw.png`
- `qa/snapshots/shape-grid-soft-clay-slight-s.png`
- `qa/snapshots/shape-grid-soft-clay-slight-se.png`
- `qa/snapshots/shape-grid-soft-clay-slight-sw.png`
- `qa/snapshots/shape-grid-soft-clay-strong-ne.png`
- `qa/snapshots/shape-grid-soft-clay-strong-nw.png`
- `qa/snapshots/shape-grid-soft-clay-strong-s.png`
- `qa/snapshots/shape-grid-soft-clay-strong-se.png`
- `qa/snapshots/shape-grid-soft-clay-strong-sw.png`
- `qa/snapshots/shape-grid-studio-hardware-flat-ne.png`
- `qa/snapshots/shape-grid-studio-hardware-flat-nw.png`
- `qa/snapshots/shape-grid-studio-hardware-flat-s.png`
- `qa/snapshots/shape-grid-studio-hardware-flat-se.png`
- `qa/snapshots/shape-grid-studio-hardware-flat-sw.png`
- `qa/snapshots/shape-grid-studio-hardware-slight-ne.png`
- `qa/snapshots/shape-grid-studio-hardware-slight-nw.png`
- `qa/snapshots/shape-grid-studio-hardware-slight-s.png`
- `qa/snapshots/shape-grid-studio-hardware-slight-se.png`
- `qa/snapshots/shape-grid-studio-hardware-slight-sw.png`
- `qa/snapshots/shape-grid-studio-hardware-strong-ne.png`
- `qa/snapshots/shape-grid-studio-hardware-strong-nw.png`
- `qa/snapshots/shape-grid-studio-hardware-strong-s.png`
- `qa/snapshots/shape-grid-studio-hardware-strong-se.png`
- `qa/snapshots/shape-grid-studio-hardware-strong-sw.png`
- `qa/snapshots/shape-grid-zoom0-25-dpr1.png`
- `qa/snapshots/shape-grid-zoom0-25-dpr2.png`
- `qa/snapshots/shape-grid-zoom1-dpr1.png`
- `qa/snapshots/shape-grid-zoom1-dpr2.png`
- `qa/snapshots/shape-grid-zoom4-dpr1.png`
- `qa/snapshots/shape-grid-zoom4-dpr2.png`
- `qa/snapshots/ssl-strip-state-default.png`
- `qa/snapshots/ssl-strip-state-disabled.png`
- `qa/snapshots/ssl-strip-state-pressed.png`
- `qa/snapshots/ssl-strip-studio-hardware-slight-e.png`
- `qa/snapshots/ssl-strip-studio-hardware-slight-n.png`
- `qa/snapshots/ssl-strip-studio-hardware-slight-ne.png`
- `qa/snapshots/ssl-strip-studio-hardware-slight-nw.png`
- `qa/snapshots/ssl-strip-studio-hardware-slight-s.png`
- `qa/snapshots/ssl-strip-studio-hardware-slight-se.png`
- `qa/snapshots/ssl-strip-studio-hardware-slight-sw.png`
- `qa/snapshots/ssl-strip-studio-hardware-slight-w.png`
- `qa/snapshots/ssl-strip-zoom0-25-dpr1.png`
- `qa/snapshots/ssl-strip-zoom0-25-dpr2.png`
- `qa/snapshots/ssl-strip-zoom1-dpr1.png`
- `qa/snapshots/ssl-strip-zoom1-dpr2.png`
- `qa/snapshots/ssl-strip-zoom4-dpr1.png`
- `qa/snapshots/ssl-strip-zoom4-dpr2.png`
- `qa/snapshots/stress-zoom0-25-dpr1.png`
- `qa/snapshots/stress-zoom0-25-dpr2.png`
- `qa/snapshots/stress-zoom1-dpr1.png`
- `qa/snapshots/stress-zoom1-dpr2.png`
- `qa/snapshots/stress-zoom4-dpr1.png`
- `qa/snapshots/stress-zoom4-dpr2.png`
- `qa/snapshots/toggles-glossy-mobile-flat-ne.png`
- `qa/snapshots/toggles-glossy-mobile-flat-nw.png`
- `qa/snapshots/toggles-glossy-mobile-flat-s.png`
- `qa/snapshots/toggles-glossy-mobile-flat-se.png`
- `qa/snapshots/toggles-glossy-mobile-flat-sw.png`
- `qa/snapshots/toggles-glossy-mobile-slight-ne.png`
- `qa/snapshots/toggles-glossy-mobile-slight-nw.png`
- `qa/snapshots/toggles-glossy-mobile-slight-s.png`
- `qa/snapshots/toggles-glossy-mobile-slight-se.png`
- `qa/snapshots/toggles-glossy-mobile-slight-sw.png`
- `qa/snapshots/toggles-glossy-mobile-strong-ne.png`
- `qa/snapshots/toggles-glossy-mobile-strong-nw.png`
- `qa/snapshots/toggles-glossy-mobile-strong-s.png`
- `qa/snapshots/toggles-glossy-mobile-strong-se.png`
- `qa/snapshots/toggles-glossy-mobile-strong-sw.png`
- `qa/snapshots/toggles-neumorphic-flat-ne.png`
- `qa/snapshots/toggles-neumorphic-flat-nw.png`
- `qa/snapshots/toggles-neumorphic-flat-s.png`
- `qa/snapshots/toggles-neumorphic-flat-se.png`
- `qa/snapshots/toggles-neumorphic-flat-sw.png`
- `qa/snapshots/toggles-neumorphic-slight-ne.png`
- `qa/snapshots/toggles-neumorphic-slight-nw.png`
- `qa/snapshots/toggles-neumorphic-slight-s.png`
- `qa/snapshots/toggles-neumorphic-slight-se.png`
- `qa/snapshots/toggles-neumorphic-slight-sw.png`
- `qa/snapshots/toggles-neumorphic-strong-ne.png`
- `qa/snapshots/toggles-neumorphic-strong-nw.png`
- `qa/snapshots/toggles-neumorphic-strong-s.png`
- `qa/snapshots/toggles-neumorphic-strong-se.png`
- `qa/snapshots/toggles-neumorphic-strong-sw.png`
- `qa/snapshots/toggles-soft-clay-flat-ne.png`
- `qa/snapshots/toggles-soft-clay-flat-nw.png`
- `qa/snapshots/toggles-soft-clay-flat-s.png`
- `qa/snapshots/toggles-soft-clay-flat-se.png`
- `qa/snapshots/toggles-soft-clay-flat-sw.png`
- `qa/snapshots/toggles-soft-clay-slight-ne.png`
- `qa/snapshots/toggles-soft-clay-slight-nw.png`
- `qa/snapshots/toggles-soft-clay-slight-s.png`
- `qa/snapshots/toggles-soft-clay-slight-se.png`
- `qa/snapshots/toggles-soft-clay-slight-sw.png`
- `qa/snapshots/toggles-soft-clay-strong-ne.png`
- `qa/snapshots/toggles-soft-clay-strong-nw.png`
- `qa/snapshots/toggles-soft-clay-strong-s.png`
- `qa/snapshots/toggles-soft-clay-strong-se.png`
- `qa/snapshots/toggles-soft-clay-strong-sw.png`
- `qa/snapshots/toggles-state-default.png`
- `qa/snapshots/toggles-state-disabled.png`
- `qa/snapshots/toggles-state-pressed.png`
- `qa/snapshots/toggles-studio-hardware-flat-ne.png`
- `qa/snapshots/toggles-studio-hardware-flat-nw.png`
- `qa/snapshots/toggles-studio-hardware-flat-s.png`
- `qa/snapshots/toggles-studio-hardware-flat-se.png`
- `qa/snapshots/toggles-studio-hardware-flat-sw.png`
- `qa/snapshots/toggles-studio-hardware-slight-ne.png`
- `qa/snapshots/toggles-studio-hardware-slight-nw.png`
- `qa/snapshots/toggles-studio-hardware-slight-s.png`
- `qa/snapshots/toggles-studio-hardware-slight-se.png`
- `qa/snapshots/toggles-studio-hardware-slight-sw.png`
- `qa/snapshots/toggles-studio-hardware-strong-ne.png`
- `qa/snapshots/toggles-studio-hardware-strong-nw.png`
- `qa/snapshots/toggles-studio-hardware-strong-s.png`
- `qa/snapshots/toggles-studio-hardware-strong-se.png`
- `qa/snapshots/toggles-studio-hardware-strong-sw.png`
- `qa/snapshots/toggles-zoom0-25-dpr1.png`
- `qa/snapshots/toggles-zoom0-25-dpr2.png`
- `qa/snapshots/toggles-zoom1-dpr1.png`
- `qa/snapshots/toggles-zoom1-dpr2.png`
- `qa/snapshots/toggles-zoom4-dpr1.png`
- `qa/snapshots/toggles-zoom4-dpr2.png`
- `qa/tests/invariants.spec.ts`
- `qa/tests/performance.spec.ts`
- `qa/tests/settled.spec.ts`
- `qa/traces/medium-look.json.gz`
- `qa/traces/medium-png.json.gz`
- `qa/traces/medium-state.json.gz`
- `qa/traces/medium-style.json.gz`
- `qa/traces/round3-100.heapsnapshot.gz`
- `qa/traces/round3-300.heapsnapshot.gz`
- `qa/traces/round3-style.cpuprofile.json.gz`
- `qa/traces/stress-look.json.gz`
- `qa/traces/stress-png.json.gz`
- `qa/traces/stress-state.json.gz`
- `qa/traces/stress-style.json.gz`
- `src/canvas/GroupOutline.tsx`
- `src/canvas/useGroupInteractions.ts`
- `src/components/CodeView.tsx`
- `src/components/ColorOverride.tsx`
- `src/components/DirectionThumb.tsx`
- `src/components/ExportPreview.tsx`
- `src/components/LeafStrip.tsx`
- `src/components/LibraryTabs.tsx`
- `src/components/LookIcon.tsx`
- `src/components/MatchToggle.tsx`
- `src/components/MaterialPicker.tsx`
- `src/components/MaterialSwatch.tsx`
- `src/components/PanelHeaderActions.tsx`
- `src/components/StateIcon.tsx`
- `src/components/StyleSelect.tsx`
- `src/components/TemplateTile.tsx`
- `src/components/directionNavigation.test.ts`
- `src/components/directionNavigation.ts`
- `src/components/directionStore.test.ts`
- `src/components/icons/ProfileIcon.tsx`
- `src/components/usePreviewValue.ts`
- `src/export/ExportScene.tsx`
- `src/export/buildSvg.test.ts`
- `src/export/buildSvg.tsx`
- `src/export/css/buildCss.test.ts`
- `src/export/css/buildCss.ts`
- `src/export/flat/bandFacets.ts`
- `src/export/flat/flat.test.ts`
- `src/export/flat/softLayers.ts`
- `src/export/png.test.ts`
- `src/export/png.ts`
- `src/export/scene.test.ts`
- `src/export/scene.ts`
- `src/export/settings.ts`
- `src/export/zip.ts`
- `src/geometry/hull.test.ts`
- `src/geometry/hull.ts`
- `src/geometry/insetOutline.ts`
- `src/geometry/insetPath.ts`
- `src/geometry/outline.ts`
- `src/library/catalog.ts`
- `src/library/instantiate.ts`
- `src/library/library.test.ts`
- `src/library/templates/badges.json`
- `src/library/templates/buttons.json`
- `src/library/templates/cards.json`
- `src/library/templates/faders.json`
- `src/library/templates/knobs.json`
- `src/library/templates/parts.json`
- `src/library/templates/toggles.json`
- `src/library/types.ts`
- `src/library/userTemplates.ts`
- `src/materials/materials.json`
- `src/materials/resolve.test.ts`
- `src/materials/resolve.ts`
- `src/materials/types.ts`
- `src/profiles/presets.ts`
- `src/profiles/sample.test.ts`
- `src/profiles/store.test.ts`
- `src/render/AroundFilter.tsx`
- `src/render/GlowHalo.tsx`
- `src/render/RecessLayer.tsx`
- `src/render/ShadowLayer.tsx`
- `src/render/TextureOverlay.tsx`
- `src/render/WallLayer.tsx`
- `src/render/aroundHeightmap.ts`
- `src/render/contrast.ts`
- `src/render/effectSpec.ts`
- `src/render/filterParams.test.ts`
- `src/render/filterParams.ts`
- `src/render/lighting.ts`
- `src/render/shade.test.ts`
- `src/render/shade.ts`
- `src/render/shadows.ts`
- `src/render/stack.test.ts`
- `src/render/stack.ts`
- `src/render/thumbGeometry.test.ts`
- `src/render/thumbGeometry.ts`
- `src/render/tilt.test.ts`
- `src/render/tilt.ts`
- `src/render/wallFacets.test.ts`
- `src/render/wallFacets.ts`
- `src/selection/groupOps.test.ts`
- `src/selection/groupOps.ts`
- `src/selection/store.test.ts`
- `src/selection/targets.test.ts`
- `src/selection/targets.ts`
- `src/selection/types.ts`
- `src/side/FacePreview.tsx`
- `src/side/Handle.tsx`
- `src/side/handleMath.ts`
- `src/side/side.test.ts`
- `src/side/useHandleDrag.ts`
- `src/states/animate.ts`
- `src/states/apply.test.ts`
- `src/states/apply.ts`
- `src/states/visual.ts`
- `src/styles/applyStyle.test.ts`
- `src/styles/applyStyle.ts`
- `src/styles/catalog.ts`
- `src/styles/styles.json`
- `src/styles/types.ts`
- `src/viewTypes.ts`

# Task 15

| Item | Status |
|---|---|
| Rotation-dependent controls | Hidden; the current Element and Group models have no rotation field |
| Workspace preservation | 394 pre-existing uncommitted paths listed above; content unchanged and not staged |
| Toolchain / browsers | Unverified; dependencies and browsers are absent; no downloads or retries |
| Standalone Node tests | 20 passed, 0 failed; in-house boolean, flattening, repeat geometry, CSS eligibility and schema migration |
| Boolean 500 + 500 vertices | Node-only union: 9.40 / 11.21 / 12.95 / 24.95 / 36.54 ms, median 12.95 ms, limit <50 ms; not an application interaction measurement |
| Repeat edit, 20 elements / 12 copies | Unverified; application rendering and timing not implemented |
| Boolean app integration | Unfinished: path model, even-odd rendering, edge-aware height maps, selection, history, Snackbar and export wiring |
| Repeat app integration | Unfinished: generated rendering, history, selection, canvas handle, detach and library registration; reusable controls exist but are not mounted |
| Fixture 10 | Data and browser tests written; tests marked pending because path and repeat rendering are not integrated; visual baselines and parity unverified |
| Fixed light | Standalone annulus boundary normals tested; actual rendered path lighting and rotated-copy lighting unverified |
| Schema | Version 3 metadata type and migration helper added; document/store integration for live repeats remains unfinished |

# Local Side view bugfix investigation

| Item | Status |
|---|---|
| Requested commit diffs | Unverified: `1d215bf`, `c828bc5`, and `27d366a` are not present in this checkout's object database; HEAD is `a07c438` |
| Reported UI revision | Unverified: `a07c438` contains a flat placeholder canvas, empty Face preview, generic tile icons and tabs with scroll buttons disabled; these exactly match the reported symptoms, but the served revision was not inspected in a browser |
| Working-tree profile samples | Seven built-in profiles each produced 64 finite samples in 0..1; built-ins use PCHIP sampling, not the custom-profile `lookup` property |
| Working-tree shading and draw state | Profile keys are serialized from the resolved geometry and material; no error boundary was found by source inspection. Draw defaults off, but selecting a built-in preset previously left it on; this is now reset on preset selection and when leaving Side |
| Side handles | A shared height handle is provided when a preset has no own handles; seven standalone geometry checks passed. Actual React rendering and interactions unverified |
| Library scrolling | Protected working-tree `LibraryTabs.tsx` already specifies `variant="scrollable"`, `scrollButtons="auto"` and `allowScrollButtonsMobile`; no protected file was changed. Actual browser layout unverified |
| Regression checks | 21 dependency-free Node checks passed: seven preset table/path/handle-geometry cases and two Draw-state store checks using a minimal Zustand substitute, plus 12 earlier checks. Playwright Side, draw-mode and library tests written but unverified; dependencies and browsers absent, no download attempted |
| Committed application | Unfinished: required renderer, canvas, library, preset and selection modules are protected uncommitted files in this checkout. They cannot be included without authorization, so any partial local commit is not a self-contained application fix |
