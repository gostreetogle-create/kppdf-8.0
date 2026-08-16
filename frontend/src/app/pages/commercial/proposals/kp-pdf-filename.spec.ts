import { buildKpPdfFilename } from './kp-pdf-filename';

describe('buildKpPdfFilename (TZ-SALES-369)', () => {
  it('uses КП-{number}.pdf when number is set', () => {
    expect(buildKpPdfFilename('QTN-0042', '507f1f77bcf86cd799439011')).toBe('КП-QTN-0042.pdf');
  });

  it('trims whitespace from number', () => {
    expect(buildKpPdfFilename('  QTN-1  ', '507f1f77bcf86cd799439011')).toBe('КП-QTN-1.pdf');
  });

  it('uses черновик short id when number is empty', () => {
    expect(buildKpPdfFilename('', '507f1f77bcf86cd799439011')).toBe('КП-черновик-507f1f77.pdf');
  });

  it('uses черновик short id when number is undefined', () => {
    expect(buildKpPdfFilename(undefined, 'abc123456789')).toBe('КП-черновик-abc12345.pdf');
  });
});
