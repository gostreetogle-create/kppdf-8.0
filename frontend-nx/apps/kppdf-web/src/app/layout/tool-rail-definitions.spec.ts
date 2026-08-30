import {
  LEFT_TOOL_RAIL_ITEMS,
  RIGHT_TOOL_RAIL_ITEMS,
  isToolRailItemDisabled,
} from './tool-rail-definitions';

describe('tool-rail-definitions', () => {
  it('exports left and right rail item lists with unique ids', () => {
    const ids = [...LEFT_TOOL_RAIL_ITEMS, ...RIGHT_TOOL_RAIL_ITEMS].map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(LEFT_TOOL_RAIL_ITEMS.length).toBeGreaterThan(0);
    expect(RIGHT_TOOL_RAIL_ITEMS.length).toBeGreaterThan(0);
  });

  it('marks demo tools as disabled placeholders', () => {
    for (const item of [...LEFT_TOOL_RAIL_ITEMS, ...RIGHT_TOOL_RAIL_ITEMS]) {
      expect(isToolRailItemDisabled(item)).toBe(true);
      expect(item.ariaLabel.length).toBeGreaterThan(0);
      expect(item.title.length).toBeGreaterThan(0);
    }
  });
});
