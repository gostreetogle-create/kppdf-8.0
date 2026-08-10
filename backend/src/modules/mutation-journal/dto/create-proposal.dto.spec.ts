import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ProposeMaterialCreateDto } from './create-proposal.dto';

describe('ProposeMaterialCreateDto (TZD-32 whitelist)', () => {
  it('accepts the extended fields pricePerUnit/materialKind/description/dimensions', async () => {
    const errors = await validate(
      plainToInstance(ProposeMaterialCreateDto, {
        name: 'Стекло 4мм',
        unit: 'м2',
        pricePerUnit: 420,
        materialKind: 'purchased',
        description: 'Полированное, край шлифованный',
        dimensions: [
          { type: 'thickness', value: 4, isImmutable: true },
          { type: 'width', value: 1200 },
        ],
      }),
    );
    expect(errors).toHaveLength(0);
  });

  it('rejects unknown materialKind, negative pricePerUnit, bad dimension type', async () => {
    const errors = await validate(
      plainToInstance(ProposeMaterialCreateDto, {
        name: 'Некорректная позиция',
        unit: 'шт',
        pricePerUnit: -1,
        materialKind: 'unknown',
        dimensions: [{ type: 'bogus', value: 1 }],
      }),
    );
    const props = errors.map((error) => error.property);
    expect(props).toEqual(expect.arrayContaining(['pricePerUnit', 'materialKind', 'dimensions']));
  });

  it('regression: без новых полей валиден как раньше', async () => {
    const errors = await validate(
      plainToInstance(ProposeMaterialCreateDto, {
        name: 'Стекло 4мм',
        unit: 'шт',
      }),
    );
    expect(errors).toHaveLength(0);
  });
});
