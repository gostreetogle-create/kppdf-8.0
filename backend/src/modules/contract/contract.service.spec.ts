import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ContractService } from './contract.service';

function makeModel(doc: Record<string, unknown> | null) {
  return {
    findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(doc) }),
  };
}

function makeDoc(overrides: Record<string, unknown> = {}) {
  const doc: Record<string, unknown> = {
    _id: new Types.ObjectId(),
    number: 'CTR-001',
    status: 'signed',
    contractStatus: 'none',
    save: jest.fn().mockImplementation(() => Promise.resolve(doc)),
    ...overrides,
  };
  return doc;
}

describe('ContractService attachment write-path', () => {
  let uploadRoot: string;
  const file = {
    originalname: 'signed-contract.pdf',
    mimetype: 'application/pdf',
    size: 3,
    buffer: Buffer.from('pdf'),
  } as unknown as Express.Multer.File;

  beforeEach(async () => {
    uploadRoot = await fs.mkdtemp(join(tmpdir(), 'kppdf-contract-'));
    process.env.UPLOAD_DIR = uploadRoot;
  });

  afterEach(async () => {
    delete process.env.UPLOAD_DIR;
    await fs.rm(uploadRoot, { recursive: true, force: true });
  });

  function makeService(doc: Record<string, unknown> | null, photosOverrides: Record<string, unknown> = {}) {
    const model = makeModel(doc);
    const photos = {
      create: jest.fn().mockResolvedValue({ _id: new Types.ObjectId() }),
      remove: jest.fn().mockResolvedValue(undefined),
      ...photosOverrides,
    };
    const service = new ContractService(
      model as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      photos as never,
    );
    return { model, photos, service };
  }

  it('stores a Photo reference and sets file_attached without changing lifecycle status', async () => {
    const doc = makeDoc();
    const { photos, service } = makeService(doc);

    await service.attachFile(String(doc._id), file);

    expect(doc.status).toBe('signed');
    expect(doc.contractStatus).toBe('file_attached');
    expect(doc.attachmentFileId).toBeTruthy();
    expect(doc.attachmentUrl).toMatch(/^\/uploads\/contracts\/.+\.pdf$/);
    await expect(fs.readdir(join(uploadRoot, 'contracts'))).resolves.toHaveLength(1);
    expect(photos.create).toHaveBeenCalledWith(
      expect.objectContaining({
        storageUrl: doc.attachmentUrl,
        originalFilename: 'signed-contract.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 3,
        variant: 'original',
      }),
    );
    expect(doc.save).toHaveBeenCalledTimes(1);
  });

  it('replaces an existing attachment and asks PhotosService to remove the old one', async () => {
    const oldPhotoId = new Types.ObjectId().toString();
    const doc = makeDoc({ attachmentFileId: oldPhotoId, attachmentUrl: '/uploads/contracts/old.pdf' });
    const { photos, service } = makeService(doc);

    await service.attachFile(String(doc._id), file);

    expect(photos.remove).toHaveBeenCalledWith(oldPhotoId);
    expect(doc.attachmentFileId).not.toBe(oldPhotoId);
  });

  it('clears attachment fields while preserving lifecycle status', async () => {
    const photoId = new Types.ObjectId().toString();
    const doc = makeDoc({
      status: 'active',
      contractStatus: 'file_attached',
      attachmentFileId: photoId,
      attachmentUrl: '/uploads/contracts/file.pdf',
    });
    const { photos, service } = makeService(doc);

    await service.removeAttachment(String(doc._id));

    expect(doc.status).toBe('active');
    expect(doc.contractStatus).toBe('none');
    expect(doc.attachmentFileId).toBeUndefined();
    expect(doc.attachmentUrl).toBeUndefined();
    expect(photos.remove).toHaveBeenCalledWith(photoId);
  });

  it('returns 404 for a missing or soft-deleted contract before writing a file', async () => {
    const { model, photos, service } = makeService(null);

    await expect(service.attachFile(new Types.ObjectId().toString(), file)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.removeAttachment(new Types.ObjectId().toString())).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(model.findOne).toHaveBeenCalledWith({
      _id: expect.any(Types.ObjectId),
      deletedAt: null,
    });
    expect(photos.create).not.toHaveBeenCalled();
  });
});
