import type { Look } from '../viewTypes';
export function LookIcon({ look }: { look: Look }) {
  const wall = look === 'flat' ? 0 : look === 'slight' ? 2 : 4;
  return <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
    {wall > 0 && <path d={`M4 ${16-wall}H18V16H4Z`} fill="currentColor" opacity="0.6" />}
    <path d={`M4 ${4-wall/2}H18V${16-wall}H4Z`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>;
}
