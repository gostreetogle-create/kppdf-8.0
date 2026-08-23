import { personDisplayLabel, personToOverflowItem } from './person.util';

describe('person.util (TZ-PARTY-306)', () => {
  it('formats full name from parts', () => {
    expect(
      personDisplayLabel({ lastName: 'Иванов', firstName: 'Иван', patronymic: 'Иванович' }),
    ).toBe('Иванов Иван Иванович');
  });

  it('maps person to overflow item with meta', () => {
    expect(
      personToOverflowItem({
        _id: 'p-1',
        firstName: 'Анна',
        lastName: 'Петрова',
        phone: '+7 900',
      }),
    ).toEqual({
      id: 'p-1',
      label: 'Петрова Анна',
      meta: '+7 900',
    });
  });
});
