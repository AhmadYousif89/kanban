import { describe, expect, it } from 'vitest';

import {
  cleanText,
  createBoard,
  createInitialState,
  DEFAULT_COLUMN_COLORS,
  findBoardIndex,
  findColumnByName,
  findColumnIndex,
  findTaskLocation,
  findTaskLocationInState,
  MAX_SUBTASKS,
  mergeBoardColumns,
  slugify,
} from '../context/kanban.utils';
import { createStateFixture, rawBoards } from './fixtures';

describe('kanban utils', () => {
  it('slugifies values and falls back to existing text', () => {
    expect(slugify('  Launch Plan 2026! ')).toBe('launch-plan-2026');
    expect(slugify('   ')).toBe('item');
    expect(cleanText('  New name  ', 'Fallback')).toBe('New name');
    expect(cleanText('   ', 'Fallback')).toBe('Fallback');
  });

  it('creates boards, columns, tasks, and capped subtasks', () => {
    const board = createBoard(
      {
        name: '  Launch Pad  ',
        columns: [
          {
            name: '  Todo Items  ',
            tasks: [
              {
                title: '  Ship beta  ',
                description: 'Beta launch',
                subtasks: Array.from({ length: MAX_SUBTASKS + 2 }, (_, index) => ({
                  title: `Subtask ${index + 1}`,
                  isCompleted: index % 2 === 0,
                })),
              },
            ],
          },
        ],
      },
      2,
    );

    expect(board.id).toBe('board-2-launch-pad');
    expect(board.columns[0].id).toBe('board-2-launch-pad-column-0-todo-items');
    expect(board.columns[0].color).toBe(DEFAULT_COLUMN_COLORS[0]);
    expect(board.columns[0].tasks[0].id).toBe(
      'board-2-launch-pad-column-0-todo-items-task-0-ship-beta',
    );
    expect(board.columns[0].tasks[0].subtasks).toHaveLength(MAX_SUBTASKS);
  });

  it('creates an initial state from raw boards', () => {
    const state = createInitialState(rawBoards);

    expect(state.activeBoardId).toBe(state.boards[0]?.id ?? null);
    expect(state.isSidebarOpen).toBe(true);
    expect(state.isFullscreenView).toBe(false);
    expect(state.boards).toHaveLength(rawBoards.length);
  });

  it('merges board columns without breaking task statuses', () => {
    const state = createStateFixture();
    const board = state.boards[0];

    const merged = mergeBoardColumns(
      board.columns,
      [
        { id: board.columns[0].id, name: 'Backlog', color: '#111111' },
        { name: 'Done', color: '#222222' },
      ],
      board.id,
    );

    expect(merged[0]).toBe(board.columns[0]);
    expect(merged[0].name).toBe('Backlog');
    expect(merged[0].tasks.every((task) => task.status === 'Backlog')).toBe(true);
    expect(merged[1].name).toBe('Done');
  });

  it('finds boards, columns, and task locations', () => {
    const state = createStateFixture();
    const board = state.boards[0];
    const task = board.columns[1].tasks[0];

    expect(findBoardIndex(state.boards, board.id)).toBe(0);
    expect(findColumnIndex(board.columns, board.columns[1].id)).toBe(1);
    expect(findColumnByName(board, 'Doing')).toBe(board.columns[1]);
    expect(findTaskLocation(board, task.id)).toEqual({ columnIndex: 1, taskIndex: 0 });
    expect(findTaskLocationInState(state, task.id)).toEqual({
      boardIndex: 0,
      columnIndex: 1,
      taskIndex: 0,
    });
  });
});
