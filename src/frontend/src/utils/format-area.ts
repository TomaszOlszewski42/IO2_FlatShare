export function formatArea(squareMeters: number): string {
  const normalized = Number.isInteger(squareMeters)
    ? String(squareMeters)
    : squareMeters.toFixed(1).replace('.', ',')

  return `${normalized} m2`
}
