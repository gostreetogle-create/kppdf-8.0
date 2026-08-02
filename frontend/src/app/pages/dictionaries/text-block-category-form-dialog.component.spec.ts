/**
 * TZ-DOC-316 — TextBlockCategoryFormDialogComponent tests.
 *
 * Locks the create/edit form contract:
 *   - name required; slug optional (server generates from Cyrillic name);
 *   - create submits { name, slug?, description?, isActive, isDefault, sortOrder }
 *     WITHOUT inventing an ASCII slug;
 *   - edit pre-fills the current category (name/slug/description/isActive/isDefault/sortOrder);
 *   - API error surfaces inline and keeps the dialog open;
 *   - double-submit guard: a second onSubmit while submitting is a no-op;
 *   - cancel closes without a result (null).
 */
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { TextBlockCategoryFormDialogComponent } from './text-block-category-form-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { TextBlockCategoriesService } from '../../shared/services/pi-text-block-categories.service';
import { PiToastService } from '../../shared/ui/toast';

describe('TextBlockCategoryFormDialogComponent (TZ-DOC-316)', () => {
  let fixture: ComponentFixture<TextBlockCategoryFormDialogComponent>;
  let close: jest.Mock;
  let success: jest.Mock;
  let error: jest.Mock;
  let svc: { create: jest.Mock; update: jest.Mock };

  function ref<T>(): DialogRef<T> {
    return {
      closed: signal<T | undefined>(undefined),
      close: (v?: T) => close(v),
    } as DialogRef<T>;
  }

  async function setup(data: unknown) {
    await TestBed.configureTestingModule({
      imports: [TextBlockCategoryFormDialogComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: data },
        { provide: PI_DIALOG_REF, useValue: ref() },
        { provide: TextBlockCategoriesService, useValue: svc },
        { provide: PiToastService, useValue: { success, error } },
      ],
    })
      .overrideComponent(TextBlockCategoryFormDialogComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
    fixture = TestBed.createComponent(TextBlockCategoryFormDialogComponent);
    fixture.detectChanges();
  }

  function formControls(): {
    name: { setValue(v: string): void };
    slug: { setValue(v: string): void };
  } {
    const comp = fixture.componentInstance as unknown as {
      form: { controls: Record<string, { setValue(v: string): void }> };
    };
    return comp.form.controls as unknown as {
      name: { setValue(v: string): void };
      slug: { setValue(v: string): void };
    };
  }

  function instance(): {
    onSubmit: () => void;
    onCancel: () => void;
  } {
    return fixture.componentInstance as unknown as {
      onSubmit: () => void;
      onCancel: () => void;
    };
  }

  beforeEach(() => {
    close = jest.fn();
    success = jest.fn();
    error = jest.fn();
    svc = {
      create: jest.fn().mockReturnValue(
        of({
          ok: true,
          data: {
            _id: 'cat-new',
            name: 'Реквизиты контрагента',
            slug: 'rekvizity-kontragenta',
          },
        }),
      ),
      update: jest
        .fn()
        .mockReturnValue(of({ ok: true, data: { _id: 'cat2', name: 'Переименовано' } })),
    };
  });

  it('smoke: instantiates in create mode', async () => {
    await setup(null);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('create submits name WITHOUT a slug (server generates it)', async () => {
    await setup(null);
    formControls().name.setValue('Реквизиты контрагента');
    instance().onSubmit();

    expect(svc.create).toHaveBeenCalledTimes(1);
    expect(svc.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Реквизиты контрагента',
        slug: undefined,
        isActive: true,
        isDefault: false,
        sortOrder: 0,
      }),
    );
    expect(close).toHaveBeenCalled();
  });

  it('create with an explicit slug passes it through', async () => {
    await setup(null);
    formControls().name.setValue('Реквизиты контрагента');
    formControls().slug.setValue('rekvizity-kontragenta');
    instance().onSubmit();

    expect(svc.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'rekvizity-kontragenta' }),
    );
  });

  it('blocks submit when name is empty (required validation)', async () => {
    await setup(null);
    instance().onSubmit();
    expect(svc.create).not.toHaveBeenCalled();
    expect(close).not.toHaveBeenCalled();
  });

  it('blocks submit when slug is invalid (uppercase or spaces)', async () => {
    await setup(null);
    formControls().name.setValue('Категория');
    formControls().slug.setValue('Invalid Slug');
    instance().onSubmit();
    expect(svc.create).not.toHaveBeenCalled();
  });

  it('edit prefills the current category and PATCHes it', async () => {
    await setup({
      _id: 'cat2',
      name: 'Описания',
      slug: 'opisaniya',
      description: 'Текстовые описания',
      isActive: true,
      isDefault: false,
      isSystem: false,
      sortOrder: 20,
    });
    instance().onSubmit();

    expect(svc.update).toHaveBeenCalledTimes(1);
    expect(svc.update).toHaveBeenCalledWith('cat2', {
      name: 'Описания',
      slug: 'opisaniya',
      description: 'Текстовые описания',
      isActive: true,
      isDefault: false,
      sortOrder: 20,
    });
  });

  it('surfaces an API error inline and keeps the dialog open', async () => {
    svc.create.mockReturnValue(
      of({
        ok: false,
        error: new HttpErrorResponse({
          status: 409,
          error: { message: 'Категория с ключом «duplikat» уже существует' },
        }),
      }),
    );
    await setup(null);
    formControls().name.setValue('Дубликат');
    instance().onSubmit();

    expect(close).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled(); // inline, not toast
  });

  it('double-submit guard: a second onSubmit while submitting is a no-op', async () => {
    await setup(null);
    formControls().name.setValue('Реквизиты контрагента');

    instance().onSubmit();
    instance().onSubmit();

    expect(svc.create).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('cancel closes without a value (null)', async () => {
    await setup(null);
    instance().onCancel();
    expect(close).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledWith(null);
  });
});
