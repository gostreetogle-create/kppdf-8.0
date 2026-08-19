import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { DocumentTemplateService } from './document-template.service';
import { DocumentTemplate } from './document-template.schema';
import { TemplateBlock } from '../template-block/template-block.schema';
import { TableTemplateService } from '../table-template/table-template.service';
import { CounterService } from '../counter/counter.service';
import { DocumentTemplateCategoryService } from '../document-template-category/document-template-category.service';
import { Quotation } from '../quotation/quotation.schema';
import { Contract } from '../contract/contract.schema';
import { Order } from '../order/order.schema';
import { Organization } from '../organization/organization.schema';
import { Counterparty } from '../counterparty/counterparty.schema';
import { Product } from '../product/product.schema';
import { Material } from '../material/material.schema';
import { WorkType } from '../work-type/work-type.schema';
import { TextBlock } from '../text-block/text-block.schema';

describe('DocumentTemplateService - Continuation Pages', () => {
  let service: DocumentTemplateService;

  const mockTemplateModel = {
    findById: jest.fn(),
  };
  const mockBlockModel = {
    find: jest.fn(),
  };
  const mockTableTemplateService = {
    preview: jest.fn().mockResolvedValue('<table><tbody><tr><td>Mock Table</td></tr></tbody></table>'),
    findById: jest.fn().mockResolvedValue({ columns: [] }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentTemplateService,
        { provide: getModelToken(DocumentTemplate.name), useValue: mockTemplateModel },
        { provide: getModelToken(TemplateBlock.name), useValue: mockBlockModel },
        { provide: getModelToken(Quotation.name), useValue: {} },
        { provide: getModelToken(Contract.name), useValue: {} },
        { provide: getModelToken(Order.name), useValue: {} },
        { provide: getModelToken(Organization.name), useValue: {} },
        { provide: getModelToken(Counterparty.name), useValue: {} },
        { provide: getModelToken(Product.name), useValue: {} },
        { provide: getModelToken(Material.name), useValue: {} },
        { provide: getModelToken(WorkType.name), useValue: {} },
        { provide: getModelToken(TextBlock.name), useValue: {} },
        { provide: CounterService, useValue: {} },
        { provide: TableTemplateService, useValue: mockTableTemplateService },
        { provide: DocumentTemplateCategoryService, useValue: {} },
      ],
    }).compile();

    service = module.get<DocumentTemplateService>(DocumentTemplateService);
  });

  it('should drop header blocks on continuation pages', async () => {
    const template = {
      _id: '000000000000000000000001',
      name: 'Test',
      backgroundOpacity: 0.5,
    };
    
    const blocks = [
      { _id: '000000000000000000000002', type: 'header', title: 'Header', layout: { y: 10, height: 10 } },
      { _id: '000000000000000000000003', type: 'table', settings: { role: 'line-items', tableTemplateId: 'tbl-1' }, layout: { y: 100, height: 50 } },
      { _id: '000000000000000000000004', type: 'text', settings: { role: 'terms' }, layout: { y: 200, height: 10 } },
    ];

    mockTemplateModel.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(template),
    });
    
    mockBlockModel.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(blocks),
    });

    const lines = Array.from({ length: 30 }).map((_, i) => ({
      productName: `Item ${i}`,
      quantity: 1,
      unitPrice: 100,
    }));

    const html = await service.build('000000000000000000000001', {
      previewLines: lines,
      sheetLayout: { rowsFirstPage: 4, rowsNextPage: 6 },
    });

    const pageMatches = html.match(/<section class="doc-page">([\s\S]*?)<\/section>/g);
    expect(pageMatches).toBeDefined();
    expect(pageMatches!.length).toBeGreaterThan(1);
    
    const page1 = pageMatches![0];
    const page2 = pageMatches![1];
    const lastPage = pageMatches![pageMatches!.length - 1];

    expect(page1).toContain('Header');
    expect(page2).not.toContain('Header');
    expect(lastPage).not.toContain('Header');
  });
});
