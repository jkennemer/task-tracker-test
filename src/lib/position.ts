/** Get a position value between two floats (fractional indexing). */
export function getPositionBetween(before: number | null, after: number | null): number {
  if (before === null && after === null) return 1;
  if (before === null) return (after as number) / 2;
  if (after === null) return before + 1;
  return (before + after) / 2;
}

/** Check if positions are too close together and need rebalancing. */
export function needsRebalance(positions: number[]): boolean {
  const sorted = [...positions].sort((a, b) => a - b);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - sorted[i - 1] < 0.001) return true;
  }
  return false;
}

/** Return evenly spaced positions for a list of items. */
export function rebalancePositions(count: number): number[] {
  return Array.from({ length: count }, (_, i) => i + 1);
}
