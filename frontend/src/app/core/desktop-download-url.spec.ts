import {
  DEFAULT_DESKTOP_DOWNLOAD_URL,
  DESKTOP_DOWNLOAD_URL_META_NAME,
  readDesktopDownloadUrlFromDom,
  resolveDesktopDownloadUrl,
} from './desktop-download-url';

describe('desktop download URL runtime config', () => {
  it('uses the same-origin default when runtime config is absent', () => {
    expect(resolveDesktopDownloadUrl(undefined)).toBe(DEFAULT_DESKTOP_DOWNLOAD_URL);
  });

  it('preserves an explicitly empty runtime value to disable the action', () => {
    expect(resolveDesktopDownloadUrl('')).toBe('');
  });

  it('returns a configured absolute URL unchanged', () => {
    expect(resolveDesktopDownloadUrl('https://downloads.example.test/kppdf.exe')).toBe(
      'https://downloads.example.test/kppdf.exe',
    );
  });

  describe('readDesktopDownloadUrlFromDom', () => {
    it('returns undefined when meta has no content attribute (default path)', () => {
      const doc = document.implementation.createHTMLDocument('t');
      const meta = doc.createElement('meta');
      meta.setAttribute('name', DESKTOP_DOWNLOAD_URL_META_NAME);
      doc.head.appendChild(meta);
      expect(readDesktopDownloadUrlFromDom(doc, undefined)).toBeUndefined();
    });

    it('returns empty string when meta content is explicitly empty', () => {
      const doc = document.implementation.createHTMLDocument('t');
      const meta = doc.createElement('meta');
      meta.setAttribute('name', DESKTOP_DOWNLOAD_URL_META_NAME);
      meta.setAttribute('content', '');
      doc.head.appendChild(meta);
      expect(readDesktopDownloadUrlFromDom(doc, undefined)).toBe('');
    });

    it('returns configured meta content URL', () => {
      const doc = document.implementation.createHTMLDocument('t');
      const meta = doc.createElement('meta');
      meta.setAttribute('name', DESKTOP_DOWNLOAD_URL_META_NAME);
      meta.setAttribute('content', 'https://cdn.example/setup.zip');
      doc.head.appendChild(meta);
      expect(readDesktopDownloadUrlFromDom(doc, undefined)).toBe('https://cdn.example/setup.zip');
    });

    it('falls back to legacy window inject when meta is absent', () => {
      const doc = document.implementation.createHTMLDocument('t');
      const win = { __DESKTOP_DOWNLOAD_URL__: 'https://legacy.example/app.exe' } as Window;
      expect(readDesktopDownloadUrlFromDom(doc, win)).toBe('https://legacy.example/app.exe');
    });
  });
});
