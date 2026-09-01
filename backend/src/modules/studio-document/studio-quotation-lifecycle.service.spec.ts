import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { StudioQuotationLifecycleService } from './studio-quotation-lifecycle.service';

describe('StudioQuotationLifecycleService (TZ-NX-DOCSTUDIO-S20)', () => {
  const orgId = new Types.ObjectId().toString();
  const docTypeId = new Types.ObjectId();
  const docId = new Types.ObjectId();

  function createService(overrides: {
    docTypeSlug?: string;
    quotation?: Record<string, unknown>;
  } = {}) {
    const docTypeModel = {
      findById: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(
            overrides.docTypeSlug ? { slug: overrides.docTypeSlug } : null,
          ),
        }),
      }),
    };
    const quotationService = {
      findById: jest.fn().mockResolvedValue(overrides.quotation ?? { _id: new Types.ObjectId(), status: 'draft' }),
      create: jest.fn().mockResolvedValue({ _id: new Types.ObjectId(), status: 'draft', number: 'KP-1' }),
      update: jest.fn().mockResolvedValue({ _id: new Types.ObjectId(), status: 'sent' }),
    };
    const blockService = {
      findAllByStudioDocument: jest.fn().mockResolvedValue([]),
    };
    const dataResolver = {
      resolveDataSets: jest.fn().mockResolvedValue([]),
    };
    const service = new StudioQuotationLifecycleService(
      docTypeModel as never,
      quotationService as never,
      blockService as never,
      dataResolver as never,
    );
    return { service, quotationService, docTypeModel };
  }

  it('isKpDocument returns true for proposal slug', async () => {
    const { service } = createService({ docTypeSlug: 'proposal' });
    const doc = { docTypeId } as never;
    await expect(service.isKpDocument(doc)).resolves.toBe(true);
  });

  it('ensureLinkedQuotation creates draft quotation for KP doc', async () => {
    const { service, quotationService } = createService({ docTypeSlug: 'proposal' });
    const doc = {
      _id: docId,
      docTypeId,
      context: {},
      save: jest.fn().mockResolvedValue(undefined),
    };
    const result = await service.ensureLinkedQuotation(doc as never, orgId);
    expect(quotationService.create).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: orgId, status: 'draft', items: [] }),
    );
    expect(result.quotation).toBeTruthy();
    expect(doc.save).toHaveBeenCalled();
  });

  it('updateQuotationStatus throws when not KP', async () => {
    const { service } = createService({ docTypeSlug: 'invoice' });
    const doc = { docTypeId, context: {} } as never;
    await expect(service.updateQuotationStatus(doc, 'sent', orgId)).rejects.toBeInstanceOf(NotFoundException);
  });
});
