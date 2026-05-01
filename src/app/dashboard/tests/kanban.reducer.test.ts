import { describe, expect, it } from 'vitest';

import { kanbanReducer } from '../context/kanban.reducer';
import { createStateFixture } from './fixtures';

describe('kanbanReducer', () => {
  it('handles sidebar and view actions', () => {
    const state = createStateFixture();

    expect(kanbanReducer(state, { type: 'sidebar:close' }).isSidebarOpen).toBe(false);
    expect(kanbanReducer(state, { type: 'sidebar:toggle' }).isSidebarOpen).toBe(false);
    expect(kanbanReducer(state, { type: 'view:toggle-fullscreen' }).isFullscreenView).toBe(true);
  });

  it('selects only known boards', () => {
    const state = createStateFixture();
    const selected = kanbanReducer(state, { type: 'board:select', boardId: state.boards[1].id });

    expect(selected.activeBoardId).toBe(state.boards[1].id);
    expect(kanbanReducer(state, { type: 'board:select', boardId: 'missing' })).toBe(state);
  });

  it('creates and updates boards', () => {
    const state = createStateFixture();
    const activeBoard = state.boards[0];

    const updated = kanbanReducer(state, {
      type: 'board:save',
      boardId: activeBoard.id,
      values: {
        name: '  Delivery  ',
        columns: [
          { id: activeBoard.columns[0].id, name: 'Backlog', color: '#111111' },
          { name: 'Done', color: '#222222' },
        ],
      },
    });

    expect(updated.boards[0].name).toBe('Delivery');
    expect(updated.boards[0].columns[0].name).toBe('Backlog');
    expect(updated.boards[0].columns[0].tasks.every((task) => task.status === 'Backlog')).toBe(
      true,
    );
    expect(updated.boards[0].columns).toHaveLength(2);

    const created = kanbanReducer(state, {
      type: 'board:save',
      values: { name: 'Launch 2026' },
    });

    expect(created.boards).toHaveLength(state.boards.length + 1);
    expect(created.activeBoardId).toBe(created.boards.at(-1)?.id ?? null);
  });

  it('deletes the active board and falls back to a remaining board', () => {
    const state = createStateFixture();
    const deleted = kanbanReducer(state, { type: 'board:delete', boardId: state.boards[0].id });

    expect(deleted.boards).toHaveLength(state.boards.length - 1);
    expect(deleted.activeBoardId).toBe(deleted.boards[0]?.id ?? null);
  });

  it('saves, moves, deletes, and toggles tasks', () => {
    const state = createStateFixture();
    const activeBoard = state.boards[0];
    const sourceColumn = activeBoard.columns[0];
    const destinationColumn = activeBoard.columns[1];
    const task = sourceColumn.tasks[0];

    const saved = kanbanReducer(state, {
      type: 'task:save',
      boardId: activeBoard.id,
      columnId: sourceColumn.id,
      taskId: task.id,
      values: {
        title: '  Draft brief updated  ',
        description: 'New copy.',
        status: destinationColumn.name,
        subtasks: [{ title: ' Revised brief ', isCompleted: true }],
      },
    });

    expect(saved.boards[0].columns[0].tasks).toHaveLength(sourceColumn.tasks.length - 1);
    expect(saved.boards[0].columns[1].tasks).toHaveLength(destinationColumn.tasks.length + 1);
    expect(saved.boards[0].columns[1].tasks.at(-1)?.title).toBe('Draft brief updated');
    expect(saved.boards[0].columns[1].tasks.at(-1)?.status).toBe(destinationColumn.name);

    const moved = kanbanReducer(state, {
      type: 'task:move',
      taskId: sourceColumn.tasks[0].id,
      toBoardId: state.boards[1].id,
      toColumnId: state.boards[1].columns[0].id,
      toIndex: 0,
    });

    expect(moved.boards[0].columns[0].tasks.map((item) => item.id)).not.toContain(task.id);
    expect(moved.boards[1].columns[0].tasks[0].id).toBe(task.id);
    expect(moved.boards[1].columns[0].tasks[0].status).toBe(state.boards[1].columns[0].name);

    const toggled = kanbanReducer(state, {
      type: 'task:toggle-subtask',
      taskId: task.id,
      subtaskId: task.subtasks[0].id,
      isCompleted: false,
    });

    expect(toggled.boards[0].columns[0].tasks[0].subtasks[0].isCompleted).toBe(false);

    const deleted = kanbanReducer(state, { type: 'task:delete', taskId: task.id });
    expect(deleted.boards[0].columns[0].tasks).toHaveLength(sourceColumn.tasks.length - 1);
  });

  it('moves columns within a board', () => {
    const state = createStateFixture();
    const activeBoard = state.boards[0];

    const moved = kanbanReducer(state, {
      type: 'column:move',
      boardId: activeBoard.id,
      columnId: activeBoard.columns[0].id,
      toIndex: 1,
    });

    expect(moved.boards[0].columns[1].id).toBe(activeBoard.columns[0].id);
  });

  it('ignores column saves past the maximum limit', () => {
    const baseState = createStateFixture();
    const board = baseState.boards[0];
    const limitState = {
      ...baseState,
      boards: [
        {
          ...board,
          columns: Array.from({ length: 8 }, (_, index) => ({
            ...board.columns[0],
            id: `${index}`,
            name: `Column ${index + 1}`,
          })),
        },
      ],
    };

    expect(
      kanbanReducer(limitState, {
        type: 'column:save',
        boardId: limitState.boards[0].id,
        values: { name: 'Overflow' },
      }),
    ).toBe(limitState);
  });
});
