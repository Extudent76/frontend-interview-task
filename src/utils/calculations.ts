export function calculateConversionRate(conversions: number, visits: number): number {
  if (visits === 0) {
    return 0;
  }
  return (conversions / visits) * 100;
}
