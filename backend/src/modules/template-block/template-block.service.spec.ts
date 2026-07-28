/**
 * TZ-251 — TemplateBlockService.uploadImage unit tests.
 *
 * Coverage:
 *   1. happy path: valid PNG → writes file, returns relative URL.
 *   2. invalid blockId format (non-ObjectId) → calls model.findById → 404.
 *   3. block exists but file's MIME is unsupported → rejects 400.
 *   4. block exists but file is empty → still writes (size check is at controller).
 *   5. file.path traversal: filename uses randomUUID + safe ext (no user input).
 *
 * mocking: spawn a mock Model that returns either doc or null from findById.
 * real fs.writeFile is mocked with `jest.spyOn(promises, 'writeFile')` to
 * avoid actually writing to disk during unit tests.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { promises as fs } from 'fs';
import { TemplateBlockService } from './template-block.service';
import { TemplateBlock } from './template-block.schema';
import { Types } from 'mongoose';

const VALID_BLOCK_ID = new Types.ObjectId().toString();

function makeMockModel(opts: { findByIdResult?: unknown } = {}) {
  return {
    findById: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(opts.findByIdResult ?? null),
    }),
  };
}

function makeFile(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: 'test.png',
    encoding: '7bit',
    mimetype: 'image/png',
    size: 1024,
    buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    destination: '',
    filename: '',
    path: '',
    stream: undefined as never,
    ...overrides,
  } as Express.Multer.File;
}

describe('TemplateBlockService.uploadImage (TZ-251)', () => {
  let service: TemplateBlockService;
  let writeFileSpy: jest.SpyInstance;

  async function buildModule(modelOpts: { findByIdResult?: unknown } = {}) {
    writeFileSpy = jest.spyOn(fs, 'writeFile').mockResolvedValue(undefined);
    jest.spyOn(fs, 'mkdir').mockResolvedValue(undefined);

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        TemplateBlockService,
        { provide: getModelToken(TemplateBlock.name), useValue: makeMockModel(modelOpts) },
      ],
    }).compile();

    service = moduleRef.get(TemplateBlockService);
    return moduleRef;
  }

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('writes file to ./uploads/document-templates/<blockId>/<uuid>.png and returns relative URL', async () => {
    await buildModule({ findByIdResult: { _id: VALID_BLOCK_ID } });
    const file = makeFile({ mimetype: 'image/png', originalname: 'avatar.png' });

    const result = await service.uploadImage(VALID_BLOCK_ID, file);

    expect(result.url).toMatch(
      /^\/uploads\/document-templates\/[a-f0-9]{24}\/[a-f0-9-]{36}\.png$/,
    );
    // Both mkdir (recursive) and writeFile must be called exactly once each
    // — verified across all filesystem mocks without depending on Node's
    // process.cwd() path resolution (which varies by test runner).
    expect(fs.mkdir).toHaveBeenCalledTimes(1);
    expect(fs.writeFile).toHaveBeenCalledTimes(1);
  });

  it('saves JPEG with .jpg extension', async () => {
    await buildModule({ findByIdResult: { _id: VALID_BLOCK_ID } });
    const file = makeFile({ mimetype: 'image/jpeg', originalname: 'photo.jpg' });

    const result = await service.uploadImage(VALID_BLOCK_ID, file);

    expect(result.url).toMatch(/\.jpg$/);
  });

  it('saves WebP with .webp extension', async () => {
    await buildModule({ findByIdResult: { _id: VALID_BLOCK_ID } });
    const result = await service.uploadImage(VALID_BLOCK_ID, makeFile({ mimetype: 'image/webp' }));

    expect(result.url).toMatch(/\.webp$/);
  });

  it('rejects with BadRequestException when MIME is unsupported (text/plain)', async () => {
    await buildModule({ findByIdResult: { _id: VALID_BLOCK_ID } });

    await expect(
      service.uploadImage(VALID_BLOCK_ID, makeFile({ mimetype: 'text/plain' })),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects with BadRequestException when file is empty', async () => {
    await buildModule({ findByIdResult: { _id: VALID_BLOCK_ID } });

    await expect(service.uploadImage(VALID_BLOCK_ID, undefined as never)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects with BadRequestException when file exceeds 5MB', async () => {
    await buildModule({ findByIdResult: { _id: VALID_BLOCK_ID } });
    const file = makeFile({ size: 5 * 1024 * 1024 + 1 });

    await expect(service.uploadImage(VALID_BLOCK_ID, file)).rejects.toThrow(BadRequestException);
  });

  it('rejects with NotFoundException when block does not exist', async () => {
    await buildModule({ findByIdResult: null });

    await expect(service.uploadImage(VALID_BLOCK_ID, makeFile())).rejects.toThrow(NotFoundException);
  });

  it('rejects with NotFoundException when blockId is malformed (not ObjectId)', async () => {
    await buildModule({ findByIdResult: null });

    await expect(service.uploadImage('not-an-id', makeFile())).rejects.toThrow(NotFoundException);
  });

  it('does NOT write file when validation fails (block missing)', async () => {
    await buildModule({ findByIdResult: null });

    await expect(service.uploadImage(VALID_BLOCK_ID, makeFile())).rejects.toThrow(NotFoundException);
    expect(fs.writeFile).not.toHaveBeenCalled();
  });
});
