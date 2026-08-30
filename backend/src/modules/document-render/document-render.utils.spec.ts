import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  collectLocalUploadUrls,
  inlineLocalUploadsForPdf,
} from './document-render.utils';

describe('document-render.utils PDF upload inlining', () => {
  const uploadsDir = join(process.cwd(), 'uploads', 'pdf-inline-test');
  const publicUrl = '/uploads/pdf-inline-test/sample.png';

  beforeAll(async () => {
    await mkdir(uploadsDir, { recursive: true });
    await writeFile(join(uploadsDir, 'sample.png'), Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  });

  afterAll(async () => {
    await rm(join(process.cwd(), 'uploads', 'pdf-inline-test'), {
      recursive: true,
      force: true,
    });
  });

  it('collects upload URLs from img src and CSS url()', () => {
    const html =
      '<img src="/uploads/pdf-inline-test/sample.png"><div style="background:url(/uploads/pdf-inline-test/sample.png)"></div>';
    expect(collectLocalUploadUrls(html)).toEqual([
      '/uploads/pdf-inline-test/sample.png',
    ]);
  });

  it('inlines local upload files as data URLs for PDF', async () => {
    const html = `<img src="${publicUrl}" alt="">`;
    const inlined = await inlineLocalUploadsForPdf(html);
    expect(inlined).toContain('data:image/png;base64,');
    expect(inlined).not.toContain(publicUrl);
  });

  it('leaves unknown upload paths unchanged when file is missing', async () => {
    const missing = '/uploads/pdf-inline-test/missing.webp';
    const html = `<img src="${missing}" alt="">`;
    const inlined = await inlineLocalUploadsForPdf(html);
    expect(inlined).toBe(html);
  });
});
