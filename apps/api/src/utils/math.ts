export function roundTo(value: number, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function clampNumber(
  value: number,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
) {
  return Math.min(Math.max(value, min), max);
}

