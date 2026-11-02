import type { ReactNode } from 'react';
import type { SideProfile } from '../../store';

// Cross-section icons: a slab profile over a base line.
const Profile = ({ d }: { d: string }) => (
  <svg width="32" height="20" viewBox="0 0 32 20" fill="none" aria-hidden="true">
    <path
      d={d}
      fill="currentColor"
      fillOpacity="0.18"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

export const FlatProfile = () => <Profile d="M3 16V11H29V16Z" />;
export const RaisedProfile = () => <Profile d="M3 16V12H9V6H23V12H29V16Z" />;
export const PillowProfile = () => <Profile d="M3 16V11Q16 2 29 11V16Z" />;
export const DipProfile = () => <Profile d="M3 16V6H8Q16 15 24 6H29V16Z" />;
export const RibbedProfile = () => (
  <Profile d="M3 16V11H6V6H9V11H12V6H15V11H18V6H21V11H24V6H27V11H29V16Z" />
);
export const DomeProfile = () => <Profile d="M3 16A13 11 0 0 1 29 16Z" />;
export const InsetProfile = () => <Profile d="M3 16V5H9V10H23V5H29V16Z" />;

export const PROFILE_ICONS: Record<SideProfile, () => ReactNode> = {
  flat: FlatProfile,
  raised: RaisedProfile,
  pillow: PillowProfile,
  dip: DipProfile,
  ribbed: RibbedProfile,
  dome: DomeProfile,
  inset: InsetProfile,
};

export const PROFILE_LABELS: Record<SideProfile, string> = {
  flat: 'Flat',
  raised: 'Raised',
  pillow: 'Pillow',
  dip: 'Dip',
  ribbed: 'Ribbed',
  dome: 'Dome',
  inset: 'Inset',
};
