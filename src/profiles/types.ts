export type ProfilePresetId = 'flat' | 'raised' | 'pillow' | 'dip' | 'ribbed' | 'dome' | 'inset';

export interface ProfilePoint {
  u: number;
  h: number;
  sharp?: boolean;
}

export interface ProfileSettings {
  preset: ProfilePresetId;
  params: Record<string, number>;
  height: number;
  wall: number;
  mode: 'auto' | 'around' | 'across';
  acrossAxis: 'vertical' | 'horizontal';
  customPoints?: ProfilePoint[];
}

export interface ResolvedProfile {
  points: ProfilePoint[];
  recessed: boolean;
}
