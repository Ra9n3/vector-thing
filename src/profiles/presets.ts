import { sampleProfile } from './sample';
import type { ProfilePoint, ProfilePresetId, ProfileSettings, ResolvedProfile } from './types';

export interface HandleDef {
  paramKey: string;
  label: string;
  axis: 'x' | 'y';
  position(params: Record<string, number>, p: ResolvedProfile): { u: number; h: number };
  fromDrag(pos: { u: number; h: number }): number;
  snap?: 'integer';
}

export interface PresetDef {
  id: ProfilePresetId;
  label: string;
  minWall: number;
  params: { key: string; label: string; default: number }[];
  build(params: Record<string, number>): ResolvedProfile;
  handles: HandleDef[];
}

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const param = (p: Record<string, number>, key: string, fallback: number) =>
  Number.isFinite(p[key]) ? clamp(p[key]) : fallback;
const profile = (points: ProfilePoint[], recessed = false): ResolvedProfile => ({ points, recessed });
const sampled = (fn: (u: number) => number, steps = 24): ProfilePoint[] =>
  Array.from({ length: steps + 1 }, (_, i) => ({ u: i / steps, h: fn(i / steps) }));

// Handle coordinates are normalized half-section coordinates. Height uses h as
// its own parameter; the editor projects it onto the actual surface.
const heightHandle = (u: number): HandleDef => ({
  paramKey: 'height', label: 'Height', axis: 'y',
  position: (p) => ({ u, h: param(p, 'height', 0.5) }),
  fromDrag: ({ h }) => clamp(h),
});
const bevelHandle: HandleDef = {
  paramKey: 'bevel', label: 'Bevel', axis: 'x',
  position: (p) => ({ u: 0.04 + 0.4 * param(p, 'bevel', 0.5), h: 1 }),
  fromDrag: ({ u }) => clamp((u - 0.04) / 0.4),
};
const xHandle = (key: string, label: string, start: number, span: number): HandleDef => ({
  paramKey: key, label, axis: 'x',
  position: (params, profile) => {
    const u = start + span * param(params, key, 0.5);
    return { u, h: sampleProfile(profile, u) };
  },
  fromDrag: ({ u }) => clamp((u - start) / span),
});
const depthHandle = (u: number): HandleDef => ({
  paramKey: 'depth', label: 'Depth', axis: 'y',
  position: (p) => ({ u, h: 1 - param(p, 'depth', 0.5) }),
  fromDrag: ({ h }) => clamp(1 - h),
});
const countHandle: HandleDef = {
  paramKey: 'count', label: 'Count', axis: 'x', snap: 'integer',
  position: (p, profile) => {
    const u = 0.5 / (2 + 4 * param(p, 'count', 0.25));
    return { u, h: sampleProfile(profile, u) };
  },
  fromDrag: ({ u }) => clamp((0.5 / Math.max(u, 1e-8) - 2) / 4),
};

export const PRESETS: PresetDef[] = [
  {
    id: 'flat', minWall: 0, label: 'Flat', params: [], handles: [],
    build: () => profile([{ u: 0, h: 1 }, { u: 1, h: 1 }]),
  },
  {
    id: 'raised', minWall: 0.5, label: 'Raised', params: [{ key: 'bevel', label: 'Bevel', default: 0.5 }],
    handles: [bevelHandle, heightHandle(0.8)],
    build: (p) => profile([
      { u: 0, h: 0.08, sharp: true },
      { u: 0.04 + 0.4 * param(p, 'bevel', 0.5), h: 1, sharp: true },
      { u: 1, h: 1 },
    ]),
  },
  {
    id: 'pillow', minWall: 0.3, label: 'Pillow', params: [{ key: 'softness', label: 'Softness', default: 0.5 }],
    handles: [xHandle('softness', 'Softness', 0.16, 0.55), heightHandle(1)],
    build: (p) => {
      const softness = param(p, 'softness', 0.5);
      return profile(sampled((u) => 0.12 + 0.88 * (1 - Math.pow(1 - u, 1.3 + 1.7 * softness))));
    },
  },
  {
    id: 'dip', minWall: 0, label: 'Dip', handles: [{ ...depthHandle(0.9), position: (p) => ({ u: (1 + 0.62 + 0.34 * param(p, 'width', 0.5)) / 2, h: 1 - param(p, 'depth', 0.65) }) }, xHandle('width', 'Width', 0.62, 0.34), heightHandle(0.06)], params: [
      { key: 'depth', label: 'Depth', default: 0.65 },
      { key: 'width', label: 'Width', default: 0.5 },
    ],
    build: (p) => {
      const depth = param(p, 'depth', 0.65);
      const width = param(p, 'width', 0.5);
      // A flat rim and a broad, smooth central trough like a fader cap.
      const rim = 0.06 + 0.22 * (1 - width);
      const end = 0.62 + 0.34 * width;
      return profile(sampled((u) => {
        const t = clamp((u - rim) / (end - rim));
        return 1 - depth * (t * t * (3 - 2 * t));
      }, 48));
    },
  },
  {
    id: 'ribbed', minWall: 0.3, label: 'Ribbed', handles: [countHandle,
      { ...depthHandle(0.5), position: (p) => ({ u: 1.5 / (2 + Math.round(4 * param(p, 'count', 0.25))), h: 1 - param(p, 'depth', 0.5) }) },
      { ...heightHandle(0), position: (p) => ({ u: 0.2 / (2 + Math.round(4 * param(p, 'count', 0.25))), h: param(p, 'height', 0.5) }) },
    ], params: [
      { key: 'count', label: 'Count', default: 0.25 },
      { key: 'depth', label: 'Depth', default: 0.5 },
    ],
    build: (p) => {
      const count = 2 + Math.round(4 * param(p, 'count', 0.25));
      const depth = param(p, 'depth', 0.5);
      // Include each peak and trough explicitly so even the highest count is exact.
      const points: ProfilePoint[] = [{ u: 0, h: 1 - depth }];
      for (let i = 0; i < count; i++) {
        points.push({ u: (i + 0.5) / count, h: 1 });
        points.push({ u: (i + 1) / count, h: 1 - depth });
      }
      return profile(points);
    },
  },
  {
    id: 'dome', minWall: 0, label: 'Dome', params: [{ key: 'roundness', label: 'Roundness', default: 0 }],
    handles: [xHandle('roundness', 'Roundness', 0.2, 0.55), heightHandle(1)],
    build: (p) => {
      const roundness = param(p, 'roundness', 0);
      return profile(sampled((u) => {
        const dome = Math.sqrt(Math.max(0, 1 - (1 - u) ** 2));
        const pillow = 1 - (1 - u) ** 2;
        return dome * (1 - roundness) + pillow * roundness;
      }, 24));
    },
  },
  {
    id: 'inset', minWall: 0, label: 'Inset', params: [{ key: 'bevel', label: 'Bevel', default: 0.5 }],
    handles: [bevelHandle, heightHandle(0.8)],
    build: (p) => profile([
      { u: 0, h: 0, sharp: true },
      { u: 0.04 + 0.4 * param(p, 'bevel', 0.5), h: 1, sharp: true },
      { u: 1, h: 1 },
    ], true),
  },
];

export const PRESET_BY_ID = Object.fromEntries(PRESETS.map((preset) => [preset.id, preset])) as Record<ProfilePresetId, PresetDef>;

export function defaultProfile(preset: ProfilePresetId): ProfileSettings {
  return {
    preset,
    height: 0.5,
    wall: 1,
    params: Object.fromEntries(PRESET_BY_ID[preset].params.map(({ key, default: value }) => [key, value])),
    mode: 'auto',
    acrossAxis: 'vertical',
  };
}
