# Round 2

| Trace, initial | Scripting ms | Rendering ms | Paint ms | Wall ms |
|---|---:|---:|---:|---:|
| 20 style | 312.47 | 17.99 | 1.56 | 357.80 |
| 20 state | 90.16 | 10.24 | 0.65 | 112.80 |
| 20 look | 113.88 | 10.56 | 1.19 | 143.00 |
| 20 PNG 3× | 349.04 | 9.09 | 0.98 | 410.40 |
| 60 style | 360.20 | 39.24 | 2.75 | 430.40 |
| 60 state | 120.08 | 19.11 | 1.53 | 156.30 |
| 60 look | 123.69 | 20.98 | 1.90 | 172.10 |
| 60 PNG 3× | 1070.95 | 19.91 | 1.84 | 1261.90 |

| Trace raster task, all threads | Sum ms |
|---|---:|
| 20 style | — |
| 20 state | 7.16 |
| 20 look | 7.59 |
| 20 PNG 3× | 9.27 |
| 60 style | — |
| 60 state | 0.75 |
| 60 look | 2.86 |
| 60 PNG 3× | 25.89 |

| PNG 3× trace, initial | Build ms | Decode ms | Draw ms | Encode ms |
|---|---:|---:|---:|---:|
| 20 | 185.20 | 14.60 | 5.40 | 190.50 |
| 60 | 679.30 | 33.20 | 11.20 | 520.10 |

| SSL IDs | Filter | Linear gradient | Radial gradient | ClipPath | Path | Group | Total |
|---|---:|---:|---:|---:|---:|---:|---:|
| Before | 46 | 12 | 0 | 26 | 0 | 19 | 104 |
| After | 34 | 7 | 0 | 16 | 0 | 19 | 77 |

| Chromium, ms | Style | State | Look | SVG | PNG 3× |
|---|---:|---:|---:|---:|---:|
| 20 measured | 287.1 | 169.0 | 156.8 | 127.1 | 327.8 |
| 20 limit | 100 | 100 | 100 | 500 | 2000 |
| 60 measured | 388.4 | 302.5 | 239.6 | 298.8 | 833.0 |
| 60 limit | 250 | 250 | 250 | 1250 | 5000 |

[trace] [Chromium] main-thread exclusive event totals; raster tasks summed across threads; — = no captured task; traces: qa/traces/*.json.gz
[export IDs] [Chromium] identical SVG exports → identical IDs vs identical IDs → intended; reproducible
[export IDs] [Chromium] different documents and single export → zero collisions vs zero collisions → pass
[export parity] [Chromium] glass-glow 3× PNG → <3% vs 0.24% mean RGB → pass
[defs] [Chromium] SSL fixture → unused definitions absent vs 104 IDs → fixed: 77 IDs
[performance] [Chromium] 20 style → <100 ms vs 287.1 ms → unfinished
[performance] [Chromium] 20 state → <100 ms vs 169.0 ms → unfinished
[performance] [Chromium] 20 look → <100 ms vs 156.8 ms → unfinished
[performance] [Chromium] 60 style → <250 ms vs 388.4 ms → unfinished
[performance] [Chromium] 60 state → <250 ms vs 302.5 ms → unfinished
[setup] [Firefox] browser install → executable available vs CDN ECONNRESET → blocked
[setup] [WebKit] browser install → executable available vs CDN ECONNRESET → blocked
[memory] [Chromium] cycles 100/200/300 after history reset → <102400 bytes per 100 cycles vs +392612 / +276088 bytes → unfinished
[defs] [Chromium] empty canvas after 300 place/delete cycles → baseline 0 vs 0 mounted IDs and 0 cached entries → pass
[coverage] [Firefox] full suite → all cases executed vs launch failure; 254 cases not run → blocked
[coverage] [WebKit] full suite → all cases executed vs launch failure; 254 cases not run → blocked
[defs] [Chromium] SSL shading → 11 unique keys vs 11 surface filter/gradient IDs → pass
[render] [Chromium] medium pressed, no overrides → pressable IDs only vs pressable IDs only → pass
[animation] [Chromium] medium pressed, static parts → no renders vs five static parts rendered → fixed
[visual] [Chromium] 230 baseline comparisons after rendering changes → within 1% vs within 1% → pass
[parity] [Chromium] 7 fixtures after rendering changes → live <2%, PNG <3% vs within limits → pass
[check] [all] npm run check → 139 unit tests pass vs 139 pass → pass

# Round 3

| Fixture 7, 5-run median | Style scripting ms | Look scripting ms |
|---|---:|---:|
| Normal | 299.17 | 218.30 |
| Library unmounted | 235.92 | 189.42 |
| Direction pad unmounted | 253.90 | 187.57 |
| Both unmounted | 205.31 | 147.25 |

| Style self-time function | Sampled ms |
|---|---:|
| jsxDEV | 65.78 |
| createElement | 36.43 |
| getBoundingClientRect | 17.01 |
| run | 16.28 |
| jsx | 13.34 |
| getComponentNameFromType | 8.75 |
| ReactElement | 8.60 |
| createTask | 8.07 |
| jsxs | 7.19 |
| anonymous (Emotion) | 6.56 |
| addObjectDiffToProperties | 6.09 |
| measure | 5.93 |
| logComponentRender | 5.84 |
| setAttribute | 5.50 |
| updateMemoComponent | 5.35 |

| Style React Profiler boundary | Update actualDuration ms | Instances |
|---|---:|---:|
| LibraryPanel | 63.0 | 1 |
| TemplateTile | 47.1 | 4 |
| Canvas | 79.2 | 1 |
| ElementView | 12.7 | 20 |
| PropertiesPanel | 118.5 | 1 |
| DirectionPad | 27.7 | 1 |

[profile] [Chromium] fixture 7 → five runs; simulated panel collapse by unmount; nested React durations inclusive; development StrictMode; sampled self time excludes program/idle/GC
[setup] [Firefox/WebKit] npmmirror → browser install vs ECONNRESET → blocked
[setup] [all] official image → Docker/Podman and mcr.microsoft.com access vs unavailable → blocked
[setup] [all] GitHub Actions → workflow added; execution not yet verified
[defs] [Chromium] fixture 7 look/direction → zero new surface builds vs zero → pass
[visual] [Chromium] 230 screenshots after preview deferral/export dedupe → within tolerance vs within tolerance → pass
[parity] [Chromium] 7 fixtures, including glass-glow 3×, after export dedupe → within tolerance vs within tolerance → pass
[measurement] [Chromium] canvas commit + two frames, full UI + two frames; first animated state paint
[performance] [Chromium] fixture 7 style canvas/full → <100/<250 ms vs 272.1/422.4 ms → unfinished
[performance] [Chromium] fixture 7 look canvas/full → <100/<250 ms vs 183.5/286.6 ms → unfinished
[performance] [Chromium] fixture 7 state first step → <100 ms vs 302.0 ms → unfinished
[performance] [Chromium] fixture 5 style canvas/full → <250/<500 ms vs 365.3/584.6 ms → unfinished
[performance] [Chromium] fixture 5 look canvas/full → <250/<500 ms vs 289.0/447.0 ms → unfinished
[performance] [Chromium] fixture 5 state first step → <250 ms vs 555.0 ms → unfinished

| Cycle | JS heap bytes | Detached nodes | Event listeners | Store subscribers |
|---:|---:|---:|---:|---:|
| 100 | 20342684 | 0 | 242 | 78 |
| 200 | 21132556 | 0 | 242 | 78 |
| 300 | 21846852 | 0 | 242 | 78 |
| 400 | 21725896 | 0 | 242 | 78 |
| 500 | 21826120 | 0 | 242 | 78 |

| Heap snapshot 100 → 300, live self-size delta | Bytes | Count |
|---|---:|---:|
| `native:PerformanceMeasure` | 43305880 | 357683 |
| `code:system / InstructionStream` | 470656 | 137 |
| `code:system / TrustedByteArray` | 163996 | 419 |
| `native:system / StackFrameInfo` | 160980 | 8049 |
| `array:` | 138252 | 982 |
| `code:system / ProtectedFixedArray` | 59452 | 134 |
| `native:system / WeakArrayList` | 43980 | 468 |
| `native:internal` | 19640 | 491 |
| `code:system / WeakArrayList` | 13044 | 428 |
| `object:Error` | 11784 | 491 |

[memory] [Chromium] fixture 5, history cleared at samples → slope <102400 bytes/100 vs 356021 → unfinished
[memory] [Chromium] detached/listeners/subscribers, cycles 100–500 → flat vs 0/242/78 throughout → pass
[memory] [Chromium] snapshots 100/300 → qa/traces/round3-100.heapsnapshot.gz / round3-300.heapsnapshot.gz; self-size diff, not dominator retained-size
[export] [Chromium] SSL filter IDs → surface 10, cast 8, contact 7, inner 1, glow 2, texture 1; 29 total; 72 IDs; 0 unreferenced
[export] [Chromium] identical filter definitions → 34 filters vs 29 → fixed
[performance] [Chromium] fixture 7 style canvas/full → <100/<250 ms vs 269.8/400.3 ms → unfinished
[performance] [Chromium] fixture 7 look canvas/full → <100/<250 ms vs 183.7/274.6 ms → unfinished
[performance] [Chromium] fixture 7 state first step → <100 ms vs 221.6 ms → unfinished
[performance] [Chromium] fixture 5 style canvas/full → <250/<500 ms vs 362.6/637.2 ms → unfinished
[performance] [Chromium] fixture 5 look canvas/full → <250/<500 ms vs 285.6/420.5 ms → unfinished
[performance] [Chromium] fixture 5 state first step → <250 ms vs 484.0 ms → unfinished
[performance] [Chromium] fixture 7 state first painted step → <100 ms vs 214.1 ms → unfinished
[animation] [Chromium] fixture 7 first nonzero to final commit → 112.5 ms
[animation] [Chromium] fixture 5 state → intermediate step painted vs no nonzero frame survived to animation frame → unfinished
[memory] [Chromium] 500-cycle test after preview changes → slope <102400 vs 437856 bytes/100; detached/listeners/subscribers 0/242/78 flat → unfinished
[visual] [Chromium] 230 baseline comparisons after delayed previews → within 1% vs within 1% → pass
[parity] [Chromium] 7 fixtures after delayed previews → within tolerance vs within tolerance → pass
[cache] [Chromium] independent wall/AO and shadow keys → split layer keys vs combined effect key → unfinished

# CI results: d20f109

| Browser | Passed | Failed | Skipped | Total |
|---|---:|---:|---:|---:|
| Chromium | 262 | 5 | 0 | 267 |
| Firefox | 124 | 134 | 9 | 267 |
| WebKit | 255 | 3 | 9 | 267 |

[coverage] [Firefox/WebKit] previous 254 unrun cases → suite executed; per-case results: qa/ci-results/*.txt
[export parity] [Firefox/WebKit] all seven fixtures including glass-glow 3× → <2% live/<3% PNG vs within limits → pass
[setup] [all] GitHub Actions → three browser jobs executed vs three executed → pass
[memory] [Chromium] @performance place/delete memory and defs → < 102400 vs 256256.4 → unfinished
[performance] [Chromium] @settled medium style → < 100 vs 176.20000000001164 → unfinished
[performance] [Chromium] @settled medium look → < 100 vs 141.09999999997672 → unfinished
[performance] [Chromium] @settled medium state → < 100 vs 151.70000000001164 → unfinished
[performance] [Chromium] @settled stress state → < 250 vs 250.79999999998836 → unfinished
[visual] [Firefox] @visual shape-grid studio-hardware flat nw → <1% vs 0.02 changed-pixel ratio (11415 pixels) → unfinished
[visual] [Firefox] @visual shape-grid studio-hardware flat ne → <1% vs 0.02 changed-pixel ratio (11415 pixels) → unfinished
[visual] [Firefox] @visual shape-grid studio-hardware flat sw → <1% vs 0.02 changed-pixel ratio (11415 pixels) → unfinished
[visual] [Firefox] @visual shape-grid studio-hardware flat se → <1% vs 0.02 changed-pixel ratio (11415 pixels) → unfinished
[visual] [Firefox] @visual shape-grid studio-hardware flat s → <1% vs 0.02 changed-pixel ratio (11415 pixels) → unfinished
[visual] [Firefox] @visual shape-grid studio-hardware slight nw → <1% vs 0.02 changed-pixel ratio (10512 pixels) → unfinished
[visual] [Firefox] @visual shape-grid studio-hardware slight ne → <1% vs 0.02 changed-pixel ratio (11176 pixels) → unfinished
[visual] [Firefox] @visual shape-grid studio-hardware slight sw → <1% vs 0.02 changed-pixel ratio (11352 pixels) → unfinished
[visual] [Firefox] @visual shape-grid studio-hardware slight se → <1% vs 0.02 changed-pixel ratio (11986 pixels) → unfinished
[visual] [Firefox] @visual shape-grid studio-hardware slight s → <1% vs 0.02 changed-pixel ratio (11765 pixels) → unfinished
[visual] [Firefox] @visual shape-grid studio-hardware strong nw → <1% vs 0.02 changed-pixel ratio (9563 pixels) → unfinished
[visual] [Firefox] @visual shape-grid studio-hardware strong ne → <1% vs 0.02 changed-pixel ratio (10734 pixels) → unfinished
[visual] [Firefox] @visual shape-grid studio-hardware strong sw → <1% vs 0.02 changed-pixel ratio (10981 pixels) → unfinished
[visual] [Firefox] @visual shape-grid studio-hardware strong se → <1% vs 0.02 changed-pixel ratio (12131 pixels) → unfinished
[visual] [Firefox] @visual shape-grid studio-hardware strong s → <1% vs 0.02 changed-pixel ratio (11713 pixels) → unfinished
[visual] [Firefox] @visual shape-grid soft-clay flat nw → <1% vs 0.02 changed-pixel ratio (12677 pixels) → unfinished
[visual] [Firefox] @visual shape-grid soft-clay flat ne → <1% vs 0.02 changed-pixel ratio (12677 pixels) → unfinished
[visual] [Firefox] @visual shape-grid soft-clay flat sw → <1% vs 0.02 changed-pixel ratio (12677 pixels) → unfinished
[visual] [Firefox] @visual shape-grid soft-clay flat se → <1% vs 0.02 changed-pixel ratio (12677 pixels) → unfinished
[visual] [Firefox] @visual shape-grid soft-clay flat s → <1% vs 0.02 changed-pixel ratio (12677 pixels) → unfinished
[visual] [Firefox] @visual shape-grid soft-clay slight nw → <1% vs 0.02 changed-pixel ratio (12218 pixels) → unfinished
[visual] [Firefox] @visual shape-grid soft-clay slight ne → <1% vs 0.02 changed-pixel ratio (12453 pixels) → unfinished
[visual] [Firefox] @visual shape-grid soft-clay slight sw → <1% vs 0.02 changed-pixel ratio (12514 pixels) → unfinished
[visual] [Firefox] @visual shape-grid soft-clay slight se → <1% vs 0.02 changed-pixel ratio (12728 pixels) → unfinished
[visual] [Firefox] @visual shape-grid soft-clay slight s → <1% vs 0.02 changed-pixel ratio (12657 pixels) → unfinished
[visual] [Firefox] @visual shape-grid soft-clay strong nw → <1% vs 0.02 changed-pixel ratio (11327 pixels) → unfinished
[visual] [Firefox] @visual shape-grid soft-clay strong ne → <1% vs 0.02 changed-pixel ratio (12002 pixels) → unfinished
[visual] [Firefox] @visual shape-grid soft-clay strong sw → <1% vs 0.02 changed-pixel ratio (12030 pixels) → unfinished
[visual] [Firefox] @visual shape-grid soft-clay strong se → <1% vs 0.02 changed-pixel ratio (12643 pixels) → unfinished
[visual] [Firefox] @visual shape-grid soft-clay strong s → <1% vs 0.02 changed-pixel ratio (12504 pixels) → unfinished
[visual] [Firefox] @visual shape-grid glossy-mobile flat nw → <1% vs 0.02 changed-pixel ratio (12056 pixels) → unfinished
[visual] [Firefox] @visual shape-grid glossy-mobile flat ne → <1% vs 0.02 changed-pixel ratio (12056 pixels) → unfinished
[visual] [Firefox] @visual shape-grid glossy-mobile flat sw → <1% vs 0.02 changed-pixel ratio (12056 pixels) → unfinished
[visual] [Firefox] @visual shape-grid glossy-mobile flat se → <1% vs 0.02 changed-pixel ratio (12056 pixels) → unfinished
[visual] [Firefox] @visual shape-grid glossy-mobile flat s → <1% vs 0.02 changed-pixel ratio (12056 pixels) → unfinished
[visual] [Firefox] @visual shape-grid glossy-mobile slight nw → <1% vs 0.02 changed-pixel ratio (11209 pixels) → unfinished
[visual] [Firefox] @visual shape-grid glossy-mobile slight ne → <1% vs 0.02 changed-pixel ratio (11489 pixels) → unfinished
[visual] [Firefox] @visual shape-grid glossy-mobile slight sw → <1% vs 0.02 changed-pixel ratio (11741 pixels) → unfinished
[visual] [Firefox] @visual shape-grid glossy-mobile slight se → <1% vs 0.02 changed-pixel ratio (11887 pixels) → unfinished
[visual] [Firefox] @visual shape-grid glossy-mobile slight s → <1% vs 0.02 changed-pixel ratio (11855 pixels) → unfinished
[visual] [Firefox] @visual shape-grid glossy-mobile strong nw → <1% vs 0.02 changed-pixel ratio (10694 pixels) → unfinished
[visual] [Firefox] @visual shape-grid glossy-mobile strong ne → <1% vs 0.02 changed-pixel ratio (11268 pixels) → unfinished
[visual] [Firefox] @visual shape-grid glossy-mobile strong sw → <1% vs 0.02 changed-pixel ratio (11399 pixels) → unfinished
[visual] [Firefox] @visual shape-grid glossy-mobile strong se → <1% vs 0.02 changed-pixel ratio (11987 pixels) → unfinished
[visual] [Firefox] @visual shape-grid glossy-mobile strong s → <1% vs 0.02 changed-pixel ratio (11988 pixels) → unfinished
[visual] [Firefox] @visual shape-grid neumorphic flat nw → <1% vs 0.02 changed-pixel ratio (15380 pixels) → unfinished
[visual] [Firefox] @visual shape-grid neumorphic flat ne → <1% vs 0.02 changed-pixel ratio (15380 pixels) → unfinished
[visual] [Firefox] @visual shape-grid neumorphic flat sw → <1% vs 0.02 changed-pixel ratio (15380 pixels) → unfinished
[visual] [Firefox] @visual shape-grid neumorphic flat se → <1% vs 0.02 changed-pixel ratio (15380 pixels) → unfinished
[visual] [Firefox] @visual shape-grid neumorphic flat s → <1% vs 0.02 changed-pixel ratio (15380 pixels) → unfinished
[visual] [Firefox] @visual shape-grid neumorphic slight nw → <1% vs 0.02 changed-pixel ratio (14807 pixels) → unfinished
[visual] [Firefox] @visual shape-grid neumorphic slight ne → <1% vs 0.02 changed-pixel ratio (14928 pixels) → unfinished
[visual] [Firefox] @visual shape-grid neumorphic slight sw → <1% vs 0.02 changed-pixel ratio (15134 pixels) → unfinished
[visual] [Firefox] @visual shape-grid neumorphic slight se → <1% vs 0.02 changed-pixel ratio (15343 pixels) → unfinished
[visual] [Firefox] @visual shape-grid neumorphic slight s → <1% vs 0.02 changed-pixel ratio (15355 pixels) → unfinished
[visual] [Firefox] @visual shape-grid neumorphic strong nw → <1% vs 0.02 changed-pixel ratio (14003 pixels) → unfinished
[visual] [Firefox] @visual shape-grid neumorphic strong ne → <1% vs 0.02 changed-pixel ratio (14701 pixels) → unfinished
[visual] [Firefox] @visual shape-grid neumorphic strong sw → <1% vs 0.02 changed-pixel ratio (14575 pixels) → unfinished
[visual] [Firefox] @visual shape-grid neumorphic strong se → <1% vs 0.02 changed-pixel ratio (15258 pixels) → unfinished
[visual] [Firefox] @visual shape-grid neumorphic strong s → <1% vs 0.02 changed-pixel ratio (15150 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel studio-hardware flat nw → <1% vs 0.02 changed-pixel ratio (13975 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel studio-hardware flat ne → <1% vs 0.02 changed-pixel ratio (13975 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel studio-hardware flat sw → <1% vs 0.02 changed-pixel ratio (13975 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel studio-hardware flat se → <1% vs 0.02 changed-pixel ratio (13975 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel studio-hardware flat s → <1% vs 0.02 changed-pixel ratio (13975 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel studio-hardware slight nw → <1% vs 0.02 changed-pixel ratio (14065 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel studio-hardware slight ne → <1% vs 0.02 changed-pixel ratio (14078 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel studio-hardware slight sw → <1% vs 0.02 changed-pixel ratio (13918 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel studio-hardware slight se → <1% vs 0.02 changed-pixel ratio (13949 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel studio-hardware slight s → <1% vs 0.02 changed-pixel ratio (13492 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel studio-hardware strong nw → <1% vs 0.02 changed-pixel ratio (14068 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel studio-hardware strong ne → <1% vs 0.02 changed-pixel ratio (14095 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel studio-hardware strong sw → <1% vs 0.02 changed-pixel ratio (12690 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel studio-hardware strong se → <1% vs 0.02 changed-pixel ratio (12706 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel studio-hardware strong s → <1% vs 0.02 changed-pixel ratio (11767 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel soft-clay flat nw → <1% vs 0.02 changed-pixel ratio (13497 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel soft-clay flat ne → <1% vs 0.02 changed-pixel ratio (13497 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel soft-clay flat sw → <1% vs 0.02 changed-pixel ratio (13497 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel soft-clay flat se → <1% vs 0.02 changed-pixel ratio (13497 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel soft-clay flat s → <1% vs 0.02 changed-pixel ratio (13497 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel soft-clay slight nw → <1% vs 0.02 changed-pixel ratio (13635 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel soft-clay slight ne → <1% vs 0.02 changed-pixel ratio (13774 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel soft-clay slight sw → <1% vs 0.02 changed-pixel ratio (13200 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel soft-clay slight se → <1% vs 0.02 changed-pixel ratio (13345 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel soft-clay slight s → <1% vs 0.02 changed-pixel ratio (12926 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel soft-clay strong nw → <1% vs 0.02 changed-pixel ratio (13565 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel soft-clay strong ne → <1% vs 0.02 changed-pixel ratio (13607 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel soft-clay strong sw → <1% vs 0.02 changed-pixel ratio (12176 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel soft-clay strong se → <1% vs 0.02 changed-pixel ratio (12247 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel soft-clay strong s → <1% vs 0.02 changed-pixel ratio (11130 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel glossy-mobile flat nw → <1% vs 0.02 changed-pixel ratio (13192 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel glossy-mobile flat ne → <1% vs 0.02 changed-pixel ratio (13192 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel glossy-mobile flat sw → <1% vs 0.02 changed-pixel ratio (13192 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel glossy-mobile flat se → <1% vs 0.02 changed-pixel ratio (13192 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel glossy-mobile flat s → <1% vs 0.02 changed-pixel ratio (13192 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel glossy-mobile slight nw → <1% vs 0.02 changed-pixel ratio (13157 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel glossy-mobile slight ne → <1% vs 0.02 changed-pixel ratio (13262 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel glossy-mobile slight sw → <1% vs 0.02 changed-pixel ratio (13033 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel glossy-mobile slight se → <1% vs 0.02 changed-pixel ratio (12973 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel glossy-mobile slight s → <1% vs 0.02 changed-pixel ratio (12580 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel glossy-mobile strong nw → <1% vs 0.02 changed-pixel ratio (12444 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel glossy-mobile strong ne → <1% vs 0.02 changed-pixel ratio (12881 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel glossy-mobile strong sw → <1% vs 0.02 changed-pixel ratio (11732 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel glossy-mobile strong se → <1% vs 0.02 changed-pixel ratio (11961 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel glossy-mobile strong s → <1% vs 0.02 changed-pixel ratio (10788 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel neumorphic flat nw → <1% vs 0.02 changed-pixel ratio (13747 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel neumorphic flat ne → <1% vs 0.02 changed-pixel ratio (13747 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel neumorphic flat sw → <1% vs 0.02 changed-pixel ratio (13747 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel neumorphic flat se → <1% vs 0.02 changed-pixel ratio (13747 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel neumorphic flat s → <1% vs 0.02 changed-pixel ratio (13747 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel neumorphic slight nw → <1% vs 0.02 changed-pixel ratio (13709 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel neumorphic slight ne → <1% vs 0.02 changed-pixel ratio (13915 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel neumorphic slight sw → <1% vs 0.02 changed-pixel ratio (13311 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel neumorphic slight se → <1% vs 0.02 changed-pixel ratio (13529 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel neumorphic slight s → <1% vs 0.02 changed-pixel ratio (13162 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel neumorphic strong nw → <1% vs 0.02 changed-pixel ratio (13396 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel neumorphic strong ne → <1% vs 0.02 changed-pixel ratio (13638 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel neumorphic strong sw → <1% vs 0.02 changed-pixel ratio (12132 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel neumorphic strong se → <1% vs 0.02 changed-pixel ratio (12399 pixels) → unfinished
[visual] [Firefox] @visual neumorphic-panel neumorphic strong s → <1% vs 0.02 changed-pixel ratio (11276 pixels) → unfinished
[visual] [Firefox] @zoom shape-grid 1x dpr1 → <1% vs 0.02 changed-pixel ratio (11765 pixels) → unfinished
[visual] [Firefox] @zoom shape-grid 4x dpr1 → <1% vs 0.04 changed-pixel ratio (25294 pixels) → unfinished
[visual] [Firefox] @zoom shape-grid 1x dpr2 → <1% vs 0.02 changed-pixel ratio (11771 pixels) → unfinished
[visual] [Firefox] @zoom shape-grid 4x dpr2 → <1% vs 0.04 changed-pixel ratio (25300 pixels) → unfinished
[visual] [Firefox] @zoom toggles 4x dpr1 → <1% vs 0.03 changed-pixel ratio (16770 pixels) → unfinished
[visual] [Firefox] @zoom toggles 4x dpr2 → <1% vs 0.03 changed-pixel ratio (16776 pixels) → unfinished
[visual] [Firefox] @zoom neumorphic-panel 1x dpr1 → <1% vs 0.02 changed-pixel ratio (13162 pixels) → unfinished
[visual] [Firefox] @zoom neumorphic-panel 4x dpr1 → <1% vs 0.15 changed-pixel ratio (116222 pixels) → unfinished
[visual] [Firefox] @zoom neumorphic-panel 1x dpr2 → <1% vs 0.02 changed-pixel ratio (13168 pixels) → unfinished
[visual] [Firefox] @zoom neumorphic-panel 4x dpr2 → <1% vs 0.15 changed-pixel ratio (116228 pixels) → unfinished
[visual] [Firefox] @zoom stress 4x dpr1 → <1% vs 0.02 changed-pixel ratio (13464 pixels) → unfinished
[visual] [Firefox] @zoom stress 4x dpr2 → <1% vs 0.02 changed-pixel ratio (13470 pixels) → unfinished
[visual] [Firefox] @zoom glass-glow 4x dpr1 → <1% vs 0.12 changed-pixel ratio (95380 pixels) → unfinished
[visual] [Firefox] @zoom glass-glow 4x dpr2 → <1% vs 0.12 changed-pixel ratio (95386 pixels) → unfinished
[visual] [WebKit] @zoom neumorphic-panel 4x dpr2 → <1% vs 0.02 changed-pixel ratio (14410 pixels) → unfinished
[visual] [WebKit] @zoom glass-glow 4x dpr1 → <1% vs 0.05 changed-pixel ratio (32547 pixels) → unfinished
[visual] [WebKit] @zoom glass-glow 4x dpr2 → <1% vs 0.10 changed-pixel ratio (73700 pixels) → unfinished

[memory] [Chromium dev] 100→300 cycles, strong-edge dominators → native PerformanceMeasure +357683 instances/+43305880 retained bytes; native Performance +43232768; blink::UserTiming +43231776 → unfinished
[memory] [Chromium dev] retained constructor totals overlap; full top 50 → qa/memory-retained-round3.json → measured
[memory] [Chromium dev] 20 place/delete cycles after clearing timing entries → 35823 PerformanceMeasure entries; top Insertion6 10684, MuiButtonBaseRoot 2416, ButtonBase2 1832 → measured
[visual] [Firefox] shape-grid and glass-glow embedded height-map diagnostic → lighting visible with data SVG vs flat with fragment reference → workaround under test
[visual] [WebKit] glass-glow embedded height-map diagnostic → no apparent improvement vs fragment reference → unfinished
