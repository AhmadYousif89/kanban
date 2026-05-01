import { describe, expect, it } from 'vitest';

import { moveTaskInBoard, resolveOverColId } from '../hooks/board-dnd-utils';
import { createStateFixture } from './fixtures';

describe('board DnD utils', () => {
  it('resolves column ids from draggable, drop, empty, and task ids', () => {
    const state = createStateFixture();
    const firstBoard = state.boards[0];
    const firstColumn = firstBoard.columns[0];
    const secondColumn = firstBoard.columns[1];
    const taskId = firstColumn.tasks[0].id;

    expect(resolveOverColId(firstBoard, `column:${firstColumn.id}`)).toBe(firstColumn.id);
    expect(resolveOverColId(firstBoard, `column-drop:${secondColumn.id}`)).toBe(secondColumn.id);
    expect(resolveOverColId(firstBoard, `task:${taskId}`)).toBe(firstColumn.id);
    expect(resolveOverColId(firstBoard, 'task:empty-column-1')).toBe('column-1');
    expect(resolveOverColId(firstBoard, 'task:missing')).toBeNull();
    expect(resolveOverColId(firstBoard, null)).toBeNull();
  });

  it('moves tasks across columns and preserves empty or invalid no-ops', () => {
    const state = createStateFixture();
    const board = state.boards[0];
    const sourceColumn = board.columns[0];
    const destinationColumn = board.columns[1];
    const taskId = sourceColumn.tasks[0].id;

    const moved = moveTaskInBoard(board, taskId, destinationColumn.id, 99);

    expect(moved).not.toBe(board);
    expect(moved.columns[0].tasks.map((task) => task.id)).not.toContain(taskId);
    expect(moved.columns[1].tasks.at(-1)?.id).toBe(taskId);
    expect(moved.columns[1].tasks.at(-1)?.status).toBe(destinationColumn.name);

    expect(moveTaskInBoard(board, taskId, sourceColumn.id, 1)).toBe(board);
    expect(moveTaskInBoard(board, 'missing-task', destinationColumn.id, 0)).toBe(board);
    expect(moveTaskInBoard(board, taskId, 'missing-column', 0)).toBe(board);
  });

  it('reorders within the same column when moving before or after neighbors', () => {
    const state = createStateFixture();
    const board = state.boards[0];
    const columnId = board.columns[0].id;
    const firstTaskId = board.columns[0].tasks[0].id;

    const movedAfter = moveTaskInBoard(board, firstTaskId, columnId, 2);

    expect(movedAfter.columns[0].tasks.map((task) => task.id)).toEqual([
      board.columns[0].tasks[1].id,
      firstTaskId,
    ]);

    const secondTaskId = board.columns[0].tasks[1].id;
    const movedBefore = moveTaskInBoard(board, secondTaskId, columnId, 0);

    expect(movedBefore.columns[0].tasks.map((task) => task.id)).toEqual([
      secondTaskId,
      firstTaskId,
    ]);
  });
});
