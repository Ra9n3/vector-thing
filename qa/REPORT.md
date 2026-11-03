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
