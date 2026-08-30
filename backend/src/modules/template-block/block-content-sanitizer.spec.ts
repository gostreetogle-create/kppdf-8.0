import { sanitizeBlockHtml } from './block-content-sanitizer';

describe('sanitizeBlockHtml', () => {
  it('removes competing typography styles and preserves semantic markup/tokens', () => {
    const html = sanitizeBlockHtml('<p style="font-family:Arial;font-size:22px;color:red"><strong>Bold</strong> <em>Italic</em> <u>Under</u> <a href="https://example.test">Link</a> {{order.number}} <span style="color:blue"></span></p>');
    expect(html).toContain('<strong>Bold</strong>');
    expect(html).toContain('<em>Italic</em>');
    expect(html).toContain('<u>Under</u>');
    expect(html).toContain('href="https://example.test"');
    expect(html).toContain('{{order.number}}');
    expect(html).not.toMatch(/font-family|font-size|color:/);
  });
});
