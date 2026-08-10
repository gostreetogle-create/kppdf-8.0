import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { KindLabelsPage } from './kind-labels.page';
import { PiDictionaryLabelsService } from '../../shared/services/pi-dictionary-labels.service';
import { PiToastService } from '../../shared/ui/toast';

describe('KindLabelsPage (TZ-DICT-320)', () => {
  const success = jest.fn();
  const error = jest.fn();
  let service: { list: jest.Mock; update: jest.Mock };

  beforeEach(async () => {
    jest.clearAllMocks();
    service = {
      list: jest.fn().mockReturnValue(
        of({
          ok: true,
          data: [
            {
              _id: 'good',
              scope: 'productKind',
              key: 'good',
              label: 'Изделие',
              sortOrder: 0,
              isActive: true,
              isSystem: true,
            },
            {
              _id: 'service',
              scope: 'productKind',
              key: 'service',
              label: 'Услуга',
              sortOrder: 1,
              isActive: true,
              isSystem: true,
            },
          ],
        }),
      ),
      update: jest.fn().mockImplementation((_id, patch) =>
        of({
          ok: true,
          data: {
            _id: 'good',
            scope: 'productKind',
            key: 'good',
            label: patch.label,
            sortOrder: 0,
            isActive: patch.isActive,
            isSystem: true,
          },
        }),
      ),
    };
    await TestBed.configureTestingModule({
      providers: [
        { provide: PiDictionaryLabelsService, useValue: service },
        { provide: PiToastService, useValue: { success, error } },
      ],
    })
      .overrideComponent(KindLabelsPage, { set: { imports: [], schemas: [NO_ERRORS_SCHEMA] } })
      .compileComponents();
  });

  function create() {
    const fixture = TestBed.createComponent(KindLabelsPage);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  it('loads product kind labels on init', () => {
    const { component } = create();
    expect(service.list).toHaveBeenCalledWith('productKind');
    expect(component.rows().map((row) => row.key)).toEqual(['good', 'service']);
  });

  it('switches tabs and reloads material labels', () => {
    const { component } = create();
    service.list.mockReturnValue(of({ ok: true, data: [] }));
    component.onScopeChange('materialKind');
    expect(component.scope()).toBe('materialKind');
    expect(service.list).toHaveBeenLastCalledWith('materialKind');
  });

  it('patches a renamed label and active state while keeping key identity', () => {
    const { component } = create();
    const row = component.rows()[0];
    component.onDraftLabel(row._id, 'Изделия цеха');
    component.onActiveChange(row, false);
    expect(service.update).toHaveBeenCalledWith('good', {
      label: 'Изделия цеха',
      isActive: false,
    });
    expect(component.rows()[0].key).toBe('good');
    expect(success).toHaveBeenCalledWith('Подпись «good» сохранена');
  });

  it('reloads and reports an API failure', () => {
    service.update.mockReturnValue(
      of({
        ok: false,
        error: new HttpErrorResponse({ status: 409, error: { message: 'Дубликат' } }),
      }),
    );
    const { component } = create();
    component.save(component.rows()[0]);
    expect(error).toHaveBeenCalledWith('Дубликат');
    expect(service.list).toHaveBeenCalledTimes(2);
  });
});
