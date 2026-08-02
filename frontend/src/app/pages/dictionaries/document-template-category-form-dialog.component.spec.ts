/**
 * TZ-DOC-308 — DocumentTemplateCategoryFormDialogComponent tests.
 *
 * Locks the create/edit form contract:
 *   - name required; slug optional (server generates from Cyrillic name);
 *   - create submits { name, slug?, description?, isDefault, sortOrder }
 *     WITHOUT inventing an ASCII slug;
 *   - edit pre-fills the current category (name/slug/isDefault/sortOrder);
 *   - API error surfaces inline and keeps the dialog open;
 *   - double-submit guard: a second onSubmit while submitting is a no-op;
 *   - cancel closes without a result (null).
 */
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { DocumentTemplateCategoryFormDialogComponent } from './document-template-category-form-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { DocumentTemplateCategoriesService } from '../../shared/services/pi-document-template-categories.service';
import { PiToastService } from '../../shared/ui/toast';

describe('DocumentTemplateCategoryFormDialogComponent (TZ-DOC-308)', () => {
  let fixture: ComponentFixture<DocumentTemplateCategoryFormDialogComponent>;
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
      imports: [DocumentTemplateCategoryFormDialogComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: data },
        { provide: PI_DIALOG_REF, useValue: ref() },
        { provide: DocumentTemplateCategoriesService, useValue: svc },
        { provide: PiToastService, useValue: { success, error } },
      ],
    })
      .overrideComponent(DocumentTemplateCategoryFormDialogComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
    fixture = TestBed.createComponent(DocumentTemplateCategoryFormDialogComponent);
    fixture.detectChanges();
  }

  /** Typed handle to the reactive form controls used in the tests. */
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
            name: 'Коммерческие предложения',
            slug: 'kommercheskie-predlozheniya',
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
    formControls().name.setValue('Коммерческие предложения');
    instance().onSubmit();

    expect(svc.create).toHaveBeenCalledTimes(1);
    expect(svc.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Коммерческие предложения',
        slug: undefined,
        isDefault: false,
        sortOrder: 0,
      }),
    );
    expect(close).toHaveBeenCalled();
  });

  it('create with an explicit slug passes it through', async () => {
    await setup(null);
    formControls().name.setValue('Коммерческие предложения');
    formControls().slug.setValue('commercial-proposals');
    instance().onSubmit();

    expect(svc.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'commercial-proposals' }),
    );
  });

  it('blocks submit when name is empty (required validation)', async () => {
    await setup(null);
    instance().onSubmit();
    expect(svc.create).not.toHaveBeenCalled();
    expect(close).not.toHaveBeenCalled();
  });

  it('edit prefills the current category and PATCHes it', async () => {
    await setup({
      _id: 'cat2',
      name: 'Договоры',
      slug: 'contracts',
      description: 'Шаблоны договоров',
      isDefault: true,
      isSystem: false,
      sortOrder: 20,
    });
    instance().onSubmit();

    expect(svc.update).toHaveBeenCalledTimes(1);
    expect(svc.update).toHaveBeenCalledWith('cat2', {
      name: 'Договоры',
      slug: 'contracts',
      description: 'Шаблоны договоров',
      isDefault: true,
      sortOrder: 20,
    });
  });

  it('surfaces an API error inline and keeps the dialog open', async () => {
    svc.create.mockReturnValue(
      of({
        ok: false,
        error: new HttpErrorResponse({
          status: 409,
          error: { message: 'Дубликат slug' },
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
    formControls().name.setValue('Коммерческие предложения');

    // First submit starts the (synchronous) request and closes.
    instance().onSubmit();
    // A second submit must not fire another create.
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
