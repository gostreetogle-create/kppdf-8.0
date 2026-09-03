import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { DocType } from '../doc-type/doc-type.schema';
import { QuotationService } from '../quotation/quotation.service';
import { TemplateBlockService } from '../template-block/template-block.service';
import { StudioDataResolverService } from './studio-data-resolver';
import { StudioQuotationLifecycleService } from './studio-quotation-lifecycle.service';
import type { StudioDocumentDocument } from './studio-document.schema';

describe('StudioQuotationLifecycleService (S20)', () => {
  let service: StudioQuotationLifecycleService;
  const proposalDocTypeId = new Types.ObjectId();
  const orgId = new Types.ObjectId().toString();

  const docTypeModel = {
    findById: jest.fn().mockReturnValue({
      lean: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ slug: 'proposal' }),
      }),
    }),
  };

  const quotationService = {
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
  };

  const blockService = {
    findAllByStudioDocument: jest.fn().mockResolvedValue([]),
  };

  const dataResolver = {
    resolveDataSets: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudioQuotationLifecycleService,
        { provide: getModelToken(DocType.name), useValue: docTypeModel },
        { provide: QuotationService, useValue: quotationService },
        { provide: TemplateBlockService, useValue: blockService },
        { provide: StudioDataResolverService, useValue: dataResolver },
      ],
    }).compile();

    service = module.get(StudioQuotationLifecycleService);
  });

  it('creates draft quotation for KP doc without link', async () => {
    const quotationId = new Types.ObjectId();
    quotationService.create.mockResolvedValue({ _id: quotationId, status: 'draft' });
    const save = jest.fn().mockResolvedValue(undefined);
    const doc = {
      _id: new Types.ObjectId(),
      docTypeId: proposalDocTypeId,
      organizationId: new Types.ObjectId(orgId),
      context: {},
      save,
    } as unknown as StudioDocumentDocument;

    const result = await service.ensureLinkedQuotation(doc, orgId);

    expect(quotationService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: orgId,
        status: 'draft',
        studioDocumentId: String(doc._id),
      }),
    );
    expect(result.quotation?._id).toEqual(quotationId);
    expect(save).toHaveBeenCalled();
  });

  it('skips non-KP documents', async () => {
    docTypeModel.findById.mockReturnValueOnce({
      lean: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ slug: 'invoice' }),
      }),
    });
    const doc = {
      _id: new Types.ObjectId(),
      docTypeId: new Types.ObjectId(),
      context: {},
      save: jest.fn(),
    } as unknown as StudioDocumentDocument;

    const result = await service.ensureLinkedQuotation(doc, orgId);

    expect(quotationService.create).not.toHaveBeenCalled();
    expect(result.quotation).toBeNull();
  });

  it('returns existing linked quotation when its org matches the caller', async () => {
    const quotationId = new Types.ObjectId();
    const linked = {
      _id: quotationId,
      organizationId: new Types.ObjectId(orgId),
      status: 'draft',
    };
    quotationService.findById.mockResolvedValue(linked);
    const doc = {
      _id: new Types.ObjectId(),
      docTypeId: proposalDocTypeId,
      organizationId: new Types.ObjectId(orgId),
      linkedQuotationId: quotationId,
      context: {},
      save: jest.fn(),
    } as unknown as StudioDocumentDocument;

    const result = await service.ensureLinkedQuotation(doc, orgId);

    expect(quotationService.findById).toHaveBeenCalledWith(quotationId.toString());
    expect(result.quotation).toBe(linked);
    expect(quotationService.create).not.toHaveBeenCalled();
    expect(doc.save).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when the linked quotation belongs to another org', async () => {
    const quotationId = new Types.ObjectId();
    quotationService.findById.mockResolvedValue({
      _id: quotationId,
      organizationId: new Types.ObjectId(),
      status: 'draft',
    });
    const doc = {
      _id: new Types.ObjectId(),
      docTypeId: proposalDocTypeId,
      organizationId: new Types.ObjectId(orgId),
      linkedQuotationId: quotationId,
      context: {},
      save: jest.fn(),
    } as unknown as StudioDocumentDocument;

    await expect(service.ensureLinkedQuotation(doc, orgId)).rejects.toThrow(
      NotFoundException,
    );
    expect(quotationService.create).not.toHaveBeenCalled();
    expect(doc.save).not.toHaveBeenCalled();
  });

  it('accepts a populated org document (findById shape) when it matches', async () => {
    const quotationId = new Types.ObjectId();
    const doc = {
      _id: new Types.ObjectId(),
      docTypeId: proposalDocTypeId,
      organizationId: new Types.ObjectId(orgId),
      linkedQuotationId: quotationId,
      context: {},
      save: jest.fn(),
    } as unknown as StudioDocumentDocument;
    quotationService.findById.mockResolvedValue({
      _id: quotationId,
      organizationId: { _id: new Types.ObjectId(orgId), shortName: 'Acme' },
      status: 'draft',
    });

    const result = await service.ensureLinkedQuotation(doc, orgId);

    expect(result.quotation?._id).toEqual(quotationId);
  });

  it('syncQuotationItems rejects before update when the quotation org mismatches', async () => {
    const quotationId = new Types.ObjectId();
    quotationService.findById.mockResolvedValue({
      _id: quotationId,
      organizationId: new Types.ObjectId(),
      status: 'draft',
    });
    const doc = {
      _id: new Types.ObjectId(),
      docTypeId: proposalDocTypeId,
      organizationId: new Types.ObjectId(orgId),
      linkedQuotationId: quotationId,
      context: {},
      save: jest.fn(),
    } as unknown as StudioDocumentDocument;

    await expect(service.syncQuotationItems(doc, orgId)).rejects.toThrow(
      NotFoundException,
    );
    expect(quotationService.update).not.toHaveBeenCalled();
  });

  it('syncQuotationItems syncs items when the quotation org matches', async () => {
    const quotationId = new Types.ObjectId();
    const quotation = {
      _id: quotationId,
      organizationId: new Types.ObjectId(orgId),
      status: 'draft',
    };
    quotationService.findById.mockResolvedValue(quotation);
    quotationService.update.mockResolvedValue(quotation);
    const doc = {
      _id: new Types.ObjectId(),
      docTypeId: proposalDocTypeId,
      organizationId: new Types.ObjectId(orgId),
      linkedQuotationId: quotationId,
      context: {},
      save: jest.fn(),
    } as unknown as StudioDocumentDocument;

    const result = await service.syncQuotationItems(doc, orgId);

    expect(quotationService.update).toHaveBeenCalledWith(
      quotationId.toString(),
      expect.objectContaining({ items: [] }),
    );
    expect(result).toBe(quotation);
  });
});
