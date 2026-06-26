export function toRelative(clientPos: number, boundsStart: number, boundsSize: number, offset = 0): number {
  return ((clientPos - boundsStart - offset) * 100) / boundsSize;
}

export function toNatural(relative: number, naturalSize: number): number {
  return (naturalSize * relative) / 100;
}
