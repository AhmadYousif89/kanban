import { describe, expect, it } from 'vitest';

import { boardSchema, defaultValues } from '../components/boards/board.schema';
import { columnSchema } from '../components/columns/column.schema';
import { createDefaultSubtask, taskSchema } from '../components/tasks/task.schema';
import { DEFAULT_COLUMN_COLORS, MAX_COLUMNS } from '../context/kanban.utils';

describe('dashboard schemas', () => {
  it('trims and fills board defaults', () => {
    const parsed = boardSchema.parse({
      name: '  Website launch  ',
      columns: [{ name: '  Todo  ' }],
    });

    expect(parsed).toEqual({
      name: 'Website launch',
      columns: [{ name: 'Todo', color: DEFAULT_COLUMN_COLORS[0] }],
    });
    expect(defaultValues).toEqual({
      name: '',
      columns: [{ name: '', color: DEFAULT_COLUMN_COLORS[0] }],
    });
  });

  it('validates column and task forms', () => {
    expect(columnSchema.parse({ name: '  Doing  ', color: '#123456' })).toEqual({
      name: 'Doing',
      color: '#123456',
    });

    const parsedTask = taskSchema.parse({
      title: '  Build launch  ',
      description: '',
      status: 'Doing',
      subtasks: [{ title: 'Write copy', isCompleted: false }],
    });

    expect(parsedTask).toEqual({
      title: 'Build launch',
      description: '',
      status: 'Doing',
      subtasks: [{ title: 'Write copy', isCompleted: false }],
    });
    expect(createDefaultSubtask()).toEqual({ title: '', isCompleted: false });
  });

  it('enforces the maximum board column count', () => {
    const result = boardSchema.safeParse({
      name: 'Launch',
      columns: Array.from({ length: MAX_COLUMNS + 1 }, (_, index) => ({
        name: `Column ${index + 1}`,
        color: DEFAULT_COLUMN_COLORS[0],
      })),
    });

    expect(result.success).toBe(false);
  });
});
