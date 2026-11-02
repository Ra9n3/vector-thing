import type { ReactNode } from 'react';
import type { Shape } from '../../store';

const Base = ({ children, size = 20 }: { children: ReactNode; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <g stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15">
      {children}
    </g>
  </svg>
);

export const SquareIcon = () => (
  <Base>
    <rect x="4" y="4" width="16" height="16" rx="0.5" />
  </Base>
);
export const RoundedIcon = () => (
  <Base>
    <rect x="4" y="4" width="16" height="16" rx="5" />
  </Base>
);
export const CircleIcon = () => (
  <Base>
    <circle cx="12" cy="12" r="8" />
  </Base>
);
export const PillIcon = () => (
  <Base>
    <rect x="2.5" y="7.5" width="19" height="9" rx="4.5" />
  </Base>
);
export const HexagonIcon = () => (
  <Base>
    <path d="M12 3.5 19.4 7.75v8.5L12 20.5l-7.4-4.25v-8.5z" />
  </Base>
);

export const SHAPE_ICONS: Record<Shape, () => ReactNode> = {
  rect: SquareIcon,
  rounded: RoundedIcon,
  circle: CircleIcon,
  pill: PillIcon,
  hexagon: HexagonIcon,
};
