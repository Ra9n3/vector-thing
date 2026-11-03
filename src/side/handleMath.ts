/** Count is encoded in quarters, corresponding to the integers 2 through 6. */
export function snapHandleValue(value: number, integer: boolean, alt: boolean): number {
  const clamped = Math.max(0, Math.min(1, value));
  if (integer) return Math.round(clamped * 4) / 4;
  return alt ? clamped : Math.round(clamped * 20) / 20;
}
