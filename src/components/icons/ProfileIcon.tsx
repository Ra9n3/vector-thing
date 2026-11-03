import { defaultProfile } from '../../profiles/presets';
import { resolveProfile, sampleProfile } from '../../profiles/sample';
import type { ProfilePresetId } from '../../profiles/types';

export function ProfileIcon({ preset }: { preset: ProfilePresetId }) {
  const profile = resolveProfile(defaultProfile(preset));
  const baseline = profile.recessed ? 4 : 18;
  const direction = profile.recessed ? 1 : -1;
  const surface = Array.from({ length: 65 }, (_, i) => {
    const x = 2 + 28 * i / 64;
    const u = 1 - Math.abs(2 * i / 64 - 1);
    const y = baseline + direction * 14 * sampleProfile(profile, u);
    return `${x.toFixed(2)} ${y.toFixed(2)}`;
  });
  const path = `M2 ${baseline} L${surface.join(' L')} L30 ${baseline} Z`;
  return (
    <svg width="32" height="22" viewBox="0 0 32 22" fill="none" aria-hidden="true">
      <path d={path} fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d={`M1 ${baseline}H31`} stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
