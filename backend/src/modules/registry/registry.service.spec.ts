import { buildFieldsFromSchema } from './registry.service';

describe('buildFieldsFromSchema', () => {
  it('surfaces a new scalar schema path without editing a descriptor array', () => {
    const fields = buildFieldsFromSchema({
      paths: {
        name: { instance: 'String' },
        futureCode: { instance: 'String' },
        enabled: { instance: 'Boolean' },
        amount: { instance: 'Number' },
        internalId: { instance: 'ObjectId' },
        photoIds: { instance: 'Array' },
        composition: { instance: 'Array' },
      },
    });

    expect(fields).toEqual([
      { key: 'name', label: 'Наименование', type: 'text' },
      { key: 'futureCode', label: 'Future Code', type: 'text' },
      { key: 'enabled', label: 'Enabled', type: 'bool' },
      { key: 'amount', label: 'Amount', type: 'number' },
      { key: 'photoIds', label: 'Фото (ID/URL)', type: 'text' },
    ]);
  });

  it('maps configured product money fields to currency', () => {
    expect(
      buildFieldsFromSchema({
        paths: {
          listPrice: { instance: 'Number' },
          basePrice: { instance: 'Number' },
          costPrice: { instance: 'Number' },
        },
      }),
    ).toEqual([
      { key: 'listPrice', label: 'Прайсовая цена', type: 'currency' },
      { key: 'basePrice', label: 'Базовая цена', type: 'currency' },
      { key: 'costPrice', label: 'Себестоимость', type: 'currency' },
    ]);
  });
});
