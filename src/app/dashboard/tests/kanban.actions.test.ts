import type { Dispatch } from 'react';

import { describe, expect, it, vi } from 'vitest';

import { createKanbanActions } from '../context/kanban.actions';
import type { KanbanAction } from '../context/kanban.types';

describe('createKanbanActions', () => {
  it('dispatches navigation and view actions', () => {
    const dispatch = vi.fn() as unknown as Dispatch<KanbanAction>;
    const actions = createKanbanActions(dispatch);

    actions.selectBoard('board-1');
    actions.openSidebar();
    actions.closeSidebar();
    actions.toggleSidebar();
    actions.toggleFullscreenView();

    expect(dispatch).toHaveBeenNthCalledWith(1, { type: 'board:select', boardId: 'board-1' });
    expect(dispatch).toHaveBeenNthCalledWith(2, { type: 'sidebar:open' });
    expect(dispatch).toHaveBeenNthCalledWith(3, { type: 'sidebar:close' });
    expect(dispatch).toHaveBeenNthCalledWith(4, { type: 'sidebar:toggle' });
    expect(dispatch).toHaveBeenNthCalledWith(5, { type: 'view:toggle-fullscreen' });
  });

  it('dispatches board, column, and task mutations', () => {
    const dispatch = vi.fn() as unknown as Dispatch<KanbanAction>;
    const actions = createKanbanActions(dispatch);

    actions.saveBoard({ name: 'New board' });
    actions.saveColumn('board-1', { name: 'Todo' }, 'column-1');
    actions.moveColumn('board-1', 'column-1', 2);
    actions.saveTask('board-1', 'column-1', { title: 'Task', description: 'Details' }, 'task-1');
    actions.deleteBoard('board-1');
    actions.deleteColumn('board-1', 'column-1');
    actions.deleteTask('task-1');
    actions.moveTask('task-1', 'board-2', 'column-2', 1);
    actions.toggleSubtask('task-1', 'subtask-1', true);

    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: 'board:save',
      boardId: undefined,
      values: { name: 'New board' },
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: 'column:save',
      boardId: 'board-1',
      columnId: 'column-1',
      values: { name: 'Todo' },
    });
    expect(dispatch).toHaveBeenNthCalledWith(3, {
      type: 'column:move',
      boardId: 'board-1',
      columnId: 'column-1',
      toIndex: 2,
    });
    expect(dispatch).toHaveBeenNthCalledWith(4, {
      type: 'task:save',
      boardId: 'board-1',
      columnId: 'column-1',
      taskId: 'task-1',
      values: { title: 'Task', description: 'Details' },
    });
    expect(dispatch).toHaveBeenNthCalledWith(5, { type: 'board:delete', boardId: 'board-1' });
    expect(dispatch).toHaveBeenNthCalledWith(6, {
      type: 'column:delete',
      boardId: 'board-1',
      columnId: 'column-1',
    });
    expect(dispatch).toHaveBeenNthCalledWith(7, { type: 'task:delete', taskId: 'task-1' });
    expect(dispatch).toHaveBeenNthCalledWith(8, {
      type: 'task:move',
      taskId: 'task-1',
      toBoardId: 'board-2',
      toColumnId: 'column-2',
      toIndex: 1,
    });
    expect(dispatch).toHaveBeenNthCalledWith(9, {
      type: 'task:toggle-subtask',
      taskId: 'task-1',
      subtaskId: 'subtask-1',
      isCompleted: true,
    });
  });
});
