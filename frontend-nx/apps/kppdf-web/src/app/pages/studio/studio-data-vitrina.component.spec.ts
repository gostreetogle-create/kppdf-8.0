import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PiMaterialsService, PiModulesService, PiProductsService } from '@kppdf/data-access';
import { StudioDataVitrinaComponent } from './studio-data-vitrina.component';

/**
 * TZ-NX-PO-SWEEP-04 — every «Данные» vitrina row (Изделия/Модули/Детали/
 * Материалы) shows a thumb (or a neutral placeholder), and list endpoints
 * that return bare, unpopulated `photoIds`/`mainPhotoId` ObjectId strings
 * must not turn into a broken `<img src="…">` — only a populated ref
 * (`{ storageUrl }`) resolves to a media url.
 */
describe('StudioDataVitrinaComponent (TZ-NX-PO-SWEEP-04)', () => {
  let fixture: ComponentFixture<StudioDataVitrinaComponent>;

  const PRODUCT_WITH_PHOTO = {
    _id: 'p1',
    name: 'Окно',
    sku: 'WIN-1',
    photoIds: [{ _id: 'ph1', storageUrl: '/uploads/ph1.jpg' }],
  };
  const PRODUCT_BARE_ID = {
    _id: 'p2',
    name: 'Дверь',
    sku: 'DOOR-1',
    // Unpopulated list response — a bare ObjectId string, not a photo ref.
    photoIds: ['64f1a2b3c4d5e6f7a8b9c0d1'],
  };
  const MODULE_NO_PHOTO = { _id: 'm1', name: 'Модуль', article: 'M-1' };
  const PART_WITH_MAIN = {
    _id: 'mat1',
    name: 'Деталь',
    article: 'D-1',
    materialKind: 'part',
    mainPhotoId: { _id: 'ph2', storageUrl: '/uploads/ph2.jpg' },
  };
  const MATERIAL_WITH_PHOTO = {
    _id: 'mat2',
    name: 'Материал с фото',
    sku: 'MTL-1',
    photoIds: [{ _id: 'ph3', storageUrl: '/uploads/ph3.jpg' }],
  };
  const MATERIAL_PLAIN = { _id: 'mat3', name: 'Материал без фото', sku: 'MTL-2' };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudioDataVitrinaComponent],
      providers: [
        {
          provide: PiProductsService,
          useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [PRODUCT_WITH_PHOTO, PRODUCT_BARE_ID] } })) },
        },
        {
          provide: PiModulesService,
          useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [MODULE_NO_PHOTO] })) },
        },
        {
          provide: PiMaterialsService,
          useValue: {
            list: jest.fn().mockImplementation(({ materialKind }: { materialKind?: string }) =>
              of({
                ok: true,
                data: {
                  items:
                    materialKind === 'part' ? [PART_WITH_MAIN] : [PART_WITH_MAIN, MATERIAL_WITH_PHOTO, MATERIAL_PLAIN],
                },
              }),
            ),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudioDataVitrinaComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  function tab(kind: string): HTMLButtonElement {
    return fixture.nativeElement.querySelector(`[data-test="studio-data-vitrina-tab-${kind}"]`) as HTMLButtonElement;
  }

  function mediaSlots(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('[data-test="studio-data-vitrina-card"] [data-test="showcase-media"]'));
  }

  it('Изделия: populated photo ref resolves to a real thumb, bare ObjectId falls back to placeholder', () => {
    const slots = mediaSlots();
    expect(slots.length).toBe(2);
    const [withPhoto, barePhoto] = slots;
    expect(withPhoto.classList.contains('sc-media--empty')).toBe(false);
    expect(withPhoto.querySelector('img')?.getAttribute('src')).toBe('/uploads/ph1.jpg');
    // A bare ObjectId string is not a resolvable url — never render it as <img src>.
    expect(barePhoto.classList.contains('sc-media--empty')).toBe(true);
    expect(barePhoto.querySelector('img')).toBeNull();
  });

  it('Модули: no photo at all still reserves the media slot as a placeholder', () => {
    tab('modules').click();
    fixture.detectChanges();
    const slots = mediaSlots();
    expect(slots.length).toBe(1);
    expect(slots[0].classList.contains('sc-media--empty')).toBe(true);
  });

  it('Детали: mainPhotoId (populated) resolves ahead of photoIds', () => {
    tab('parts').click();
    fixture.detectChanges();
    const slots = mediaSlots();
    expect(slots.length).toBe(1);
    expect(slots[0].querySelector('img')?.getAttribute('src')).toBe('/uploads/ph2.jpg');
  });

  it('Материалы: mixed populated/no-photo rows each keep a media slot', () => {
    tab('materials').click();
    fixture.detectChanges();
    const slots = mediaSlots();
    expect(slots.length).toBe(2);
    expect(slots.some((s) => !s.classList.contains('sc-media--empty'))).toBe(true);
    expect(slots.some((s) => s.classList.contains('sc-media--empty'))).toBe(true);
  });
});
