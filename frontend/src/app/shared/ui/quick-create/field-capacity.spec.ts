import { capacityFor, colSpanClass, controlMaxClass } from './field-capacity';

describe('field-capacity (TZ-UX-FORM-308)', () => {
  it('capacityFor(dimLength) === nano', () => {
    expect(capacityFor('dimLength')).toBe('nano');
  });

  it('controlMaxClass(dimLength, true) constrains width for a nano field', () => {
    expect(controlMaxClass('dimLength', true)).toContain('max-w-');
  });

  it('controlMaxClass(name, true) is empty — lg fields are not width-capped', () => {
    expect(controlMaxClass('name', true)).toBe('');
  });

  it('colSpanClass(dimLength, true) starts a new 12-col row for the dims band', () => {
    expect(colSpanClass('dimLength', true)).toContain('md:col-start-1');
  });

  it('colSpanClass/controlMaxClass are no-ops when useCapacityGrid is false', () => {
    expect(colSpanClass('dimLength', false)).toBe('');
    expect(controlMaxClass('dimLength', false)).toBe('');
  });

  it('subcategory/ralCode (FullEditor-only fields) resolve to sm', () => {
    expect(capacityFor('subcategory')).toBe('sm');
    expect(capacityFor('ralCode')).toBe('sm');
  });
});
