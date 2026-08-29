jest.mock('node:fs', () => ({
  ...jest.requireActual<typeof import('node:fs')>('node:fs'),
  existsSync: jest.fn(),
}));

import { Types } from 'mongoose';
import { existsSync } from 'node:fs';
import { ServiceUnavailableException } from '@nestjs/common';
import puppeteer from 'puppeteer-core';
import { QuotationOutputService } from './quotation-output.service';

const mockedExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;

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
    mockedExistsSync.mockImplementation(
      jest.requireActual<typeof import('node:fs')>('node:fs').existsSync,
    );
    if (originalExecutable === undefined)
      delete process.env.PUPPETEER_EXECUTABLE_PATH;
    else process.env.PUPPETEER_EXECUTABLE_PATH = originalExecutable;
  });

  it('rebuilds live HTML for PDF (ignores stale snapshot) and keeps one browser instance', async () => {
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
    const templateService = {
      findById: jest.fn().mockResolvedValue({
        _id: templateId,
        organizationId,
      }),
      build: jest
        .fn()
        .mockResolvedValue(
          '<!doctype html><html><style>@page { size: A4; }</style><body>КП live</body></html>',
        ),
      assertBuildSourcesInOrganization: jest.fn().mockResolvedValue(undefined),
    };
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
    expect(puppeteer.launch).toHaveBeenCalledWith(
      expect.objectContaining({
        executablePath: 'chrome-for-test',
        args: expect.arrayContaining([
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ]),
      }),
    );
    expect(page.setContent).toHaveBeenCalledWith(
      expect.stringContaining('КП live'),
      expect.objectContaining({ timeout: 15_000 }),
    );
    expect(templateService.build).toHaveBeenCalled();
  });

  it('returns 503 when no Chromium binary is available', async () => {
    delete process.env.PUPPETEER_EXECUTABLE_PATH;
    mockedExistsSync.mockReturnValue(false);
    const model = {
      findById: jest.fn(() => ({
        exec: jest.fn().mockResolvedValue(quotationFixture()),
      })),
    };
    const service = new QuotationOutputService(
      model as never,
      {
        findById: jest.fn().mockResolvedValue({
          _id: templateId,
          organizationId,
        }),
        build: jest.fn().mockResolvedValue('<html>КП</html>'),
        assertBuildSourcesInOrganization: jest.fn().mockResolvedValue(undefined),
      } as never,
      { archiveRendered: jest.fn() } as never,
    );

    await expect(
      service.renderPdf(quotationId.toString(), {
        organizationId: organizationId.toString(),
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
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

  it('forwards item rowPresentation and photoUrl into rebuild payload', async () => {
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
    const base = quotationFixture() as Record<string, unknown>;
    const fixture = {
      ...base,
      items: [
        {
          productName: 'Стенд',
          productSku: 'ST-1',
          quantity: 2,
          unit: 'шт',
          unitPrice: 5000,
          photoUrl: '/uploads/stand.webp',
          rowPresentation: {
            density: 'large',
            emphasis: 'accent',
            showDescription: false,
            photoFit: 'contain',
          },
        },
      ],
      templateSnapshot: {
        templateId: templateId.toString(),
        tableLayout: [{ key: 'sum', visible: true }],
        sheetLayout: { photoScalePercent: 140, photoCropYPercent: 12, showPhotoColumn: true },
      },
    };
    const build = jest.fn().mockResolvedValue('<html>КП row</html>');
    const findById = jest.fn().mockResolvedValue({
      _id: templateId,
      organizationId,
    });
    const model = {
      findById: jest.fn(() => ({
        exec: jest.fn().mockResolvedValue(fixture),
      })),
    };
    const service = new QuotationOutputService(
      model as never,
      {
        findById,
        build,
        assertBuildSourcesInOrganization: jest.fn().mockResolvedValue(undefined),
      } as never,
      { archiveRendered: jest.fn() } as never,
    );

    await service.renderPdf(quotationId.toString(), {
      organizationId: organizationId.toString(),
    });

    expect(build).toHaveBeenCalledWith(
      templateId.toString(),
      expect.objectContaining({
        previewLines: [
          expect.objectContaining({
            productName: 'Стенд',
            photoUrl: '/uploads/stand.webp',
            rowPresentation: expect.objectContaining({
              density: 'large',
              photoFit: 'contain',
            }),
          }),
        ],
        sheetLayout: expect.objectContaining({
          photoScalePercent: 140,
          photoCropYPercent: 12,
          showPhotoColumn: true,
        }),
      }),
    );
  });

  it('caps concurrent PDF renders via semaphore (TZ-DOC-STUDIO-1801)', async () => {
    process.env.PUPPETEER_EXECUTABLE_PATH = 'chrome-for-test';
    process.env.PDF_MAX_CONCURRENT = '1';

    let active = 0;
    let maxActive = 0;
    const page = {
      setContent: jest.fn().mockImplementation(async () => {
        active++;
        maxActive = Math.max(maxActive, active);
        await new Promise((resolve) => setTimeout(resolve, 30));
        active--;
      }),
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
    const templateService = {
      findById: jest.fn().mockResolvedValue({
        _id: templateId,
        organizationId,
      }),
      build: jest.fn().mockResolvedValue('<html><body>pdf</body></html>'),
      assertBuildSourcesInOrganization: jest.fn().mockResolvedValue(undefined),
    };
    const service = new QuotationOutputService(
      model as never,
      templateService as never,
      { archiveRendered: jest.fn() } as never,
    );

    await Promise.all([
      service.renderHtmlToPdf('<html><body>a</body></html>'),
      service.renderHtmlToPdf('<html><body>b</body></html>'),
    ]);

    expect(maxActive).toBe(1);
  });
});
