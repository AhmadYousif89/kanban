import { describe, expect, it } from 'vitest';

import {
  COLUMN_DROP_PREFIX,
  COLUMN_PREFIX,
  fromColumnDraggableId,
  fromColumnDropId,
  fromTaskDraggableId,
  TASK_PREFIX,
  toColumnDraggableId,
  toColumnDropId,
  toTaskDraggableId,
} from '../main/board.dnd';

describe('board DnD id helpers', () => {
  it('round-trips draggable and drop ids', () => {
    expect(toTaskDraggableId('task-1')).toBe(`${TASK_PREFIX}task-1`);
    expect(fromTaskDraggableId(`${TASK_PREFIX}task-1`)).toBe('task-1');

    expect(toColumnDraggableId('column-1')).toBe(`${COLUMN_PREFIX}column-1`);
    expect(fromColumnDraggableId(`${COLUMN_PREFIX}column-1`)).toBe('column-1');

    expect(toColumnDropId('column-1')).toBe(`${COLUMN_DROP_PREFIX}column-1`);
    expect(fromColumnDropId(`${COLUMN_DROP_PREFIX}column-1`)).toBe('column-1');
  });

  it('returns null for unrelated ids', () => {
    expect(fromTaskDraggableId('task-1')).toBeNull();
    expect(fromColumnDraggableId('column-1')).toBeNull();
    expect(fromColumnDropId('column-1')).toBeNull();
  });
});
