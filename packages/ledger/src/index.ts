export type LedgerKind = "PHYSICAL_ENERGY"|"MARKET"|"SETTLEMENT"|"FINANCIAL"|"REWARD"|"AUDIT";
export interface JournalLine { account: string; debitMinor: bigint; creditMinor: bigint; currency: string }
export interface JournalEntry { id: string; reference: string; lines: readonly JournalLine[] }
export function assertBalancedJournal(entry: JournalEntry): void {
  const currencies = new Set(entry.lines.map(line => line.currency));
  for (const currency of currencies) {
    const lines = entry.lines.filter(line => line.currency === currency);
    const debit = lines.reduce((sum,line)=>sum+line.debitMinor,0n); const credit = lines.reduce((sum,line)=>sum+line.creditMinor,0n);
    if (debit !== credit) throw new Error(`UNBALANCED_JOURNAL:${currency}:${debit}:${credit}`);
    if (lines.some(line => line.debitMinor < 0n || line.creditMinor < 0n || (line.debitMinor > 0n && line.creditMinor > 0n))) throw new Error("INVALID_JOURNAL_LINE");
  }
}
