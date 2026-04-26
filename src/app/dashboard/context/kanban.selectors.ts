import type { Board, KanbanState } from './kanban.types';

export function selectBoards(state: KanbanState) {
  return state.boards;
}

export function selectHasBoards(state: KanbanState) {
  return state.boards.length > 0;
}

export function selectActiveBoard(state: KanbanState): Board | null {
  return state.boards.find((board) => board.id === state.activeBoardId) ?? state.boards[0];
}

export function selectBoardById(state: KanbanState, boardId: string) {
  return state.boards.find((board) => board.id === boardId) ?? null;
}
