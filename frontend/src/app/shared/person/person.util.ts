import type { PiOverflowSelectItem } from '../ui/overflow-select/pi-overflow-select.component';
import type { Person } from '../services/pi-persons.service';

/** Full name for selects and labels; falls back to em dash when empty. */
export function personDisplayLabel(
  person: Pick<Person, 'lastName' | 'firstName' | 'patronymic'>,
): string {
  return [person.lastName, person.firstName, person.patronymic].filter(Boolean).join(' ') || '—';
}

export function personToOverflowItem(person: Person): PiOverflowSelectItem {
  const meta = person.phone || person.email || person.position || undefined;
  return {
    id: person._id,
    label: personDisplayLabel(person),
    meta,
  };
}
