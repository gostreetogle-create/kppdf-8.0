import { DEFAULT_DESKTOP_DOWNLOAD_URL, resolveDesktopDownloadUrl } from './desktop-download-url';

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
});
