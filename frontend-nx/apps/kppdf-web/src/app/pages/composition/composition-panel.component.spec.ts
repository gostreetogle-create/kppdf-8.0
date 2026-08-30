import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PiCompositionService, type CompositionLine, type CompositionTreeNode } from '@kppdf/data-access';
import { PiDialogService } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { CompositionPanelComponent } from './composition-panel.component';

const TREE: CompositionTreeNode = {
  _id: 'prod-1',
  name: 'Root',
  kind: 'product',
  quantity: 1,
  children: [
    {
      _id: 'mod-1',
      name: 'Module',
      kind: 'module',
      lineType: 'module',
      quantity: 1,
      children: [],
    },
  ],
};

const LINES: CompositionLine[] = [
  { _id: 'line-1', refId: 'mod-1', lineType: 'module', quantity: 1, sortOrder: 0 },
];

describe('CompositionPanelComponent (Phase 2)', () => {
  let fixture: ComponentFixture<CompositionPanelComponent>;
  let composition: {
    getProductTree: jest.Mock;
    getProductComposition: jest.Mock;
    updateProductCompositionLine: jest.Mock;
    removeProductCompositionLine: jest.Mock;
    addProductCompositionLine: jest.Mock;
  };

  beforeEach(async () => {
    composition = {
      getProductTree: jest.fn().mockReturnValue(of({ ok: true, data: TREE })),
      getProductComposition: jest.fn().mockReturnValue(of({ ok: true, data: LINES })),
      getModuleComposition: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
      updateProductCompositionLine: jest.fn().mockReturnValue(of({ ok: true, data: LINES })),
      removeProductCompositionLine: jest.fn().mockReturnValue(of({ ok: true, data: undefined })),
      addProductCompositionLine: jest.fn().mockReturnValue(of({ ok: true, data: LINES })),
      addModuleCompositionLine: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
    };

    await TestBed.configureTestingModule({
      imports: [CompositionPanelComponent],
      providers: [
        { provide: PiCompositionService, useValue: composition },
        {
          provide: PiDialogService,
          useValue: { open: jest.fn().mockReturnValue({ closed: () => undefined, close: jest.fn() }) },
        },
        {
          provide: PiToastService,
          useValue: { success: jest.fn(), error: jest.fn(), show: jest.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CompositionPanelComponent);
    fixture.componentRef.setInput('parentKind', 'product');
    fixture.componentRef.setInput('entityId', 'prod-1');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('loads tree and composition on init', () => {
    expect(composition.getProductTree).toHaveBeenCalledWith('prod-1');
    expect(composition.getProductComposition).toHaveBeenCalledWith('prod-1');
    expect(fixture.nativeElement.querySelector('[data-test="composition-panel"]')).toBeTruthy();
  });

  it('patches line using composition line _id not tree refId', async () => {
    const panel = fixture.componentInstance;
    const sel = {
      node: TREE.children[0]!,
      parent: TREE,
      depth: 1,
    };
    await panel['patchLine'](sel, { quantity: 5 });
    expect(composition.updateProductCompositionLine).toHaveBeenCalledWith('prod-1', 'line-1', { quantity: 5 });
  });

  it('adds to selected nested module parent, not product root', async () => {
    const panel = fixture.componentInstance;
    await panel['addLine'](
      { lineType: 'material', refId: 'mat-1', quantity: 2 },
      { parentKind: 'module', parentId: 'mod-1' },
    );
    expect(composition.addModuleCompositionLine).toHaveBeenCalledWith(
      'mod-1',
      expect.objectContaining({ lineType: 'material', refId: 'mat-1', quantity: 2 }),
    );
    expect(composition.addProductCompositionLine).not.toHaveBeenCalled();
  });

  it('resolveAddTarget uses root when material leaf selected', () => {
    const panel = fixture.componentInstance;
    panel['selected'].set({
      node: {
        _id: 'mat-1',
        name: 'Mat',
        kind: 'material',
        lineType: 'material',
        quantity: 1,
        children: [],
      },
      parent: TREE.children[0]!,
      depth: 2,
    });
    expect(panel['resolveAddTarget']()).toEqual({ parentKind: 'product', parentId: 'prod-1' });
  });

  it('shows Комплекс badge when tree has product child', async () => {
    composition.getProductTree.mockReturnValue(
      of({
        ok: true,
        data: {
          ...TREE,
          children: [
            {
              _id: 'child-prod',
              name: 'Child',
              kind: 'product',
              lineType: 'product',
              quantity: 1,
              children: [],
            },
          ],
        },
      }),
    );
    await panelReload(fixture);
    expect(fixture.nativeElement.querySelector('[data-test="composition-complex-badge"]')).toBeTruthy();
  });
});

async function panelReload(fixture: ComponentFixture<CompositionPanelComponent>): Promise<void> {
  await fixture.componentInstance['reload']();
  fixture.detectChanges();
  await fixture.whenStable();
}
