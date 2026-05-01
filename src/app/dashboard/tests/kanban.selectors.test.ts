import { describe, expect, it } from 'vitest';

import {
  selectActiveBoard,
  selectBoardById,
  selectBoards,
  selectHasBoards,
} from '../context/kanban.selectors';
import { createStateFixture } from './fixtures';

describe('kanban selectors', () => {
  it('reads board collections and active board fallbacks', () => {
    const state = createStateFixture();

    expect(selectBoards(state)).toBe(state.boards);
    expect(selectHasBoards(state)).toBe(true);
    expect(selectActiveBoard(state)).toBe(state.boards[0]);
    expect(selectBoardById(state, state.boards[1].id)).toBe(state.boards[1]);
  });

  it('returns null or the first board when the active board is missing', () => {
    const state = createStateFixture();

    expect(selectBoardById(state, 'missing')).toBeNull();
    expect(selectActiveBoard({ ...state, activeBoardId: 'missing' })).toBe(state.boards[0]);
    expect(selectHasBoards({ ...state, boards: [] })).toBe(false);
    expect(selectActiveBoard({ ...state, boards: [], activeBoardId: null })).toBeUndefined();
  });
});
