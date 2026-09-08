/**
 * TZ-DESKTOP-SUPPLY-EXCEL-B — exceljs implements `Worksheet.dataValidations`
 * at runtime (`lib/doc/data-validations.js`, keyed by cell/range address) but
 * the package's own bundled `index.d.ts` (v4.4.0) doesn't declare it. Augment
 * rather than fork/patch the package or fall back to `any` at call sites.
 */
import 'exceljs';

declare module 'exceljs' {
  interface WorksheetDataValidations {
    add(address: string, validation: Partial<DataValidation>): Partial<DataValidation>;
    find(address: string): Partial<DataValidation> | undefined;
    remove(address: string): void;
  }

  interface Worksheet {
    dataValidations: WorksheetDataValidations;
  }
}
