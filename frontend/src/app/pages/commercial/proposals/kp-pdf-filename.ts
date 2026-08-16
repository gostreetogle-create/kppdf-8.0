/** Canonical browser download name for quotation PDF (TZ-SALES-369). */
export function buildKpPdfFilename(number: string | undefined | null, quotationId: string): string {
  const trimmed = (number ?? '').trim();
  if (trimmed) {
    return `КП-${trimmed}.pdf`;
  }
  return `КП-черновик-${quotationId.slice(0, 8)}.pdf`;
}
