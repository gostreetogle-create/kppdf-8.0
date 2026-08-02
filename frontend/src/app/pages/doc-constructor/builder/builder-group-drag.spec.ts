import { resolvePositionedDragPeers } from './builder-group-drag';
import type { TemplateBlock } from '../../../shared/template-block/template-block.types';

function layoutBlock(id: string, order: number, groupId?: string | null): TemplateBlock {
  return {
    _id: id,
    templateId: 'tpl-1',
    type: 'text',
    order,
    showLine: false,
    isActive: true,
    groupId: groupId ?? null,
    layout: {
      page: 1,
      x: 0.1 * order,
      y: 0.1,
      width: 0.2,
      height: 0.1,
      zIndex: order,
      rotation: 0,
    },
  };
}

describe('resolvePositionedDragPeers (TZ-DOC-331)', () => {
  it('with shared groupId returns all layout members even when selection is empty', () => {
    const gid = 'g1';
    const a = layoutBlock('a', 1, gid);
    const b = layoutBlock('b', 2, gid);
    const c = layoutBlock('c', 3, null);
    const peers = resolvePositionedDragPeers(a, [a, b, c], []);
    expect(peers.map((p) => p._id).sort()).toEqual(['a', 'b']);
  });

  it('with shared groupId ignores partial selection (still all members)', () => {
    const gid = 'g2';
    const a = layoutBlock('a', 1, gid);
    const b = layoutBlock('b', 2, gid);
    const peers = resolvePositionedDragPeers(a, [a, b], [a]);
    expect(peers.map((p) => p._id).sort()).toEqual(['a', 'b']);
  });

  it('without groupId uses multi-selection when it includes the dragged block', () => {
    const a = layoutBlock('a', 1, null);
    const b = layoutBlock('b', 2, null);
    const peers = resolvePositionedDragPeers(a, [a, b], [a, b]);
    expect(peers.map((p) => p._id).sort()).toEqual(['a', 'b']);
  });

  it('without groupId and without multi-select returns only the dragged block', () => {
    const a = layoutBlock('a', 1, null);
    const b = layoutBlock('b', 2, null);
    const peers = resolvePositionedDragPeers(a, [a, b], []);
    expect(peers.map((p) => p._id)).toEqual(['a']);
  });

  it('does not clear or rewrite groupId on peer objects', () => {
    const gid = 'g3';
    const a = layoutBlock('a', 1, gid);
    const b = layoutBlock('b', 2, gid);
    const peers = resolvePositionedDragPeers(b, [a, b], []);
    expect(peers.every((p) => p.groupId === gid)).toBe(true);
  });
});
