import { ServiceUnavailableException } from '@nestjs/common';
import { Types } from 'mongoose';
import puppeteer from 'puppeteer-core';
import { QuotationOutputService } from './quotation-output.service';

const quotationId = new Types.ObjectId();
const organizationId = new Types.ObjectId();
const templateId = new Types.ObjectId();

function quotationFixture() {
  return {
    _id: quotationId,
    organizationId,
    templateId,
    counterpartyId: new Types.ObjectId(),
    deletedAt: null,
    number: 'QTN-2026-001',
    vatPercent: 20,
    discountType: 'percent',
    discountPercent: 10,
    discountAmount: 0,
    prepaymentPercent: 30,
    productionDays: 4,
    deliveryDays: 2,
    items: [
      {
        productName: 'Стенд',
        productSku: 'ST-1',
        quantity: 2,
        unit: 'шт',
        unitPrice: 5000,
      },
    ],
    templateSnapshot: {
      templateId: templateId.toString(),
      html: '<!doctype html><html><style>@page { size: A4; }</style><body>КП</body></html>',
      tableLayout: [{ key: 'sum', visible: true }],
    },
  } as never;
}

describe('QuotationOutputService (TZ-SALES-345)', () => {
  const originalExecutable = process.env.PUPPETEER_EXECUTABLE_PATH;

  afterEach(() => {
    jest.restoreAllMocks();
    if (originalExecutable === undefined)
      delete process.env.PUPPETEER_EXECUTABLE_PATH;
    else process.env.PUPPETEER_EXECUTABLE_PATH = originalExecutable;
  });

  it('renders the saved snapshot to PDF and keeps one browser instance', async () => {
    process.env.PUPPETEER_EXECUTABLE_PATH = 'chrome-for-test';
    const page = {
      setContent: jest.fn().mockResolvedValue(undefined),
      pdf: jest.fn().mockResolvedValue(new Uint8Array([37, 80, 68, 70])),
      close: jest.fn().mockResolvedValue(undefined),
    };
    const browser = {
      newPage: jest.fn().mockResolvedValue(page),
      close: jest.fn().mockResolvedValue(undefined),
    };
    jest.spyOn(puppeteer, 'launch').mockResolvedValue(browser as never);
    const model = {
      findById: jest.fn(() => ({
        exec: jest.fn().mockResolvedValue(quotationFixture()),
      })),
    };
    const templateService = { findById: jest.fn(), build: jest.fn() };
    const generatedDocuments = { archiveRendered: jest.fn() };
    const service = new QuotationOutputService(
      model as never,
      templateService as never,
      generatedDocuments as never,
    );

    const first = await service.renderPdf(quotationId.toString(), {
      organizationId: organizationId.toString(),
    });
    const second = await service.renderPdf(quotationId.toString(), {
      organizationId: organizationId.toString(),
    });

    expect(first.number).toBe('QTN-2026-001');
    expect(first.buffer).toEqual(Buffer.from([37, 80, 68, 70]));
    expect(second.buffer).toEqual(first.buffer);
    expect(puppeteer.launch).toHaveBeenCalledTimes(1);
    expect(page.setContent).toHaveBeenCalledWith(
      expect.stringContaining('КП'),
      expect.objectContaining({ timeout: 15_000 }),
    );
    expect(templateService.build).not.toHaveBeenCalled();
  });

  it('archives a new final quotation document without overwriting history', async () => {
    const model = {
      findById: jest.fn(() => ({
        exec: jest.fn().mockResolvedValue(quotationFixture()),
      })),
    };
    const archiveRendered = jest.fn().mockResolvedValue({
      toObject: () => ({
        _id: 'doc-1',
        sourceType: 'quotation',
        status: 'final',
      }),
    });
    const service = new QuotationOutputService(
      model as never,
      { findById: jest.fn(), build: jest.fn() } as never,
      { archiveRendered } as never,
    );

    const result = await service.archive(quotationId.toString(), {
      organizationId: organizationId.toString(),
    });

    expect(result).toEqual({
      _id: 'doc-1',
      sourceType: 'quotation',
      status: 'final',
    });
    expect(archiveRendered).toHaveBeenCalledWith(
      expect.objectContaining({
        templateId: templateId.toString(),
        sourceId: quotationId,
        organizationId: organizationId.toString(),
        name: 'КП QTN-2026-001',
        html: expect.stringContaining('КП'),
        buildPayload: expect.objectContaining({
          quotationId: quotationId.toString(),
          dealTotals: expect.objectContaining({
            vatPercent: 20,
            discountPercent: 10,
          }),
        }),
      }),
    );
  });

  it('maps a missing Chrome engine to the Russian 503 fallback', async () => {
    process.env.PUPPETEER_EXECUTABLE_PATH = 'chrome-for-test';
    jest
      .spyOn(puppeteer, 'launch')
      .mockRejectedValue(new Error('missing browser'));
    const model = {
      findById: jest.fn(() => ({
        exec: jest.fn().mockResolvedValue(quotationFixture()),
      })),
    };
    const service = new QuotationOutputService(
      model as never,
      { findById: jest.fn(), build: jest.fn() } as never,
      { archiveRendered: jest.fn() } as never,
    );

    await expect(service.renderPdf(quotationId.toString())).rejects.toEqual(
      expect.objectContaining({
        constructor: ServiceUnavailableException,
        message: 'Сервис печати недоступен, используйте Печать в браузере.',
        status: 503,
      }),
    );
  });
});
