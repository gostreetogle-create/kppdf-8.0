import { DestroyRef, Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PiDialogService } from '@kppdf/ui/dialog';
import { PiModulesService, PiProductsService } from '@kppdf/data-access';
import { createCatalogRegistryDialogHost } from './catalog-registry-dialog-host';

describe('createCatalogRegistryDialogHost (TZ-NX-REGISTRIES-COMPOSITION-PARITY-WAVE-1)', () => {
  it('loads module by id before opening edit dialog', async () => {
    const open = jest.fn().mockReturnValue({ closed: () => undefined, close: jest.fn() });
    const getById = jest.fn().mockReturnValue(
      of({ ok: true, data: { _id: 'mod-1', name: 'Full', article: 'A-1' } }),
    );
    const notify = jest.fn();
    const destroyRef = { onDestroy: jest.fn() } as unknown as DestroyRef;

    await TestBed.configureTestingModule({
      providers: [
        { provide: PiDialogService, useValue: { open } },
        { provide: PiModulesService, useValue: { getById } },
        { provide: PiProductsService, useValue: { getById: jest.fn() } },
      ],
    }).compileComponents();

    const host = createCatalogRegistryDialogHost({
      dialog: TestBed.inject(PiDialogService),
      destroyRef,
      injector: TestBed.inject(Injector),
      modulesService: TestBed.inject(PiModulesService),
      productsService: TestBed.inject(PiProductsService),
    });

    host.openModuleEdit({ _id: 'mod-1', name: 'List', article: 'A-1' }, { reload: jest.fn(), notify }, true);
    await Promise.resolve();
    expect(getById).toHaveBeenCalledWith('mod-1');
    expect(open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        parentDestroyRef: destroyRef,
        data: expect.objectContaining({
          mode: 'edit',
          focusComposition: true,
          module: expect.objectContaining({ name: 'Full' }),
        }),
      }),
    );
  });

  it('notifies on getById failure without opening dialog', async () => {
    const open = jest.fn();
    const getById = jest.fn().mockReturnValue(
      of({ ok: false, error: { error: { message: 'Not found' }, status: 404, statusText: 'Not Found' } }),
    );
    const notify = jest.fn();

    await TestBed.configureTestingModule({
      providers: [
        { provide: PiDialogService, useValue: { open } },
        { provide: PiModulesService, useValue: { getById } },
        { provide: PiProductsService, useValue: { getById: jest.fn() } },
      ],
    }).compileComponents();

    const host = createCatalogRegistryDialogHost({
      dialog: TestBed.inject(PiDialogService),
      destroyRef: { onDestroy: jest.fn() } as unknown as DestroyRef,
      injector: TestBed.inject(Injector),
      modulesService: TestBed.inject(PiModulesService),
      productsService: TestBed.inject(PiProductsService),
    });

    host.openModuleEdit({ _id: 'missing', name: 'X', article: 'Y' }, { reload: jest.fn(), notify });
    await Promise.resolve();
    expect(notify).toHaveBeenCalledWith(expect.stringMatching(/не найден/i), 'error');
    expect(open).not.toHaveBeenCalled();
  });
});
