export function createProtocol(year: number, sequence: number): string {
  return `RCT-${year}-${String(sequence).padStart(5, "0")}`;
}
