import { blockLayoutStyle } from './layout-renderer';

describe('blockLayoutStyle', () => {
  it('compiles normalized geometry to deterministic absolute CSS', () => {
    expect(
      blockLayoutStyle({
        page: 1,
        x: 0.125,
        y: 0.25,
        width: 0.5,
        height: 0.2,
        zIndex: 7,
        rotation: 4,
      }),
    ).toBe('position:absolute;left:12.5%;top:25%;width:50%;z-index:7;height:20%;transform:rotate(4deg)');
  });

  it('returns no style for legacy flow blocks', () => {
    expect(blockLayoutStyle(undefined)).toBe('');
  });

  it('does not emit a height or transform when omitted', () => {
    expect(
      blockLayoutStyle({ page: 1, x: 0, y: 0, width: 1, zIndex: 1, rotation: 0 }),
    ).toBe('position:absolute;left:0%;top:0%;width:100%;z-index:1');
  });
});
