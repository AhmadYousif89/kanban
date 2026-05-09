import type { KanbanAction, KanbanState } from '../kanban.types';
import {
  cleanText,
  cloneState,
  createBoard,
  findBoardIndex,
  mergeBoardColumns,
} from '../kanban.utils';

export function reduceBoardState(state: KanbanState, action: KanbanAction): KanbanState {
  switch (action.type) {
    case 'board:select': {
      return state.boards.some((board) => board.id === action.boardId)
        ? { ...state, activeBoardId: action.boardId, activeTaskId: null }
        : state;
    }
    case 'board:save': {
      if (action.boardId) {
        const boardIndex = findBoardIndex(state.boards, action.boardId);

        if (boardIndex === -1) return state;

        const nextState = cloneState(state);
        const currentBoard = nextState.boards[boardIndex];
        currentBoard.name = cleanText(action.values.name, currentBoard.name);

        if (action.values.columns) {
          currentBoard.columns = mergeBoardColumns(
            currentBoard.columns,
            action.values.columns,
            currentBoard.id,
          );
        }

        return nextState;
      }

      const nextState = cloneState(state);
      const board = createBoard(action.values, nextState.boards.length);
      nextState.boards.push(board);
      nextState.activeBoardId = board.id;
      return nextState;
    }
    case 'board:delete': {
      const boardIndex = findBoardIndex(state.boards, action.boardId);

      if (boardIndex === -1) return state;

      const nextState = cloneState(state);
      nextState.boards.splice(boardIndex, 1);

      if (nextState.activeBoardId === action.boardId) {
        nextState.activeBoardId =
          nextState.boards[boardIndex]?.id ??
          nextState.boards[boardIndex - 1]?.id ??
          nextState.boards[0]?.id ??
          null;
      }

      if (
        nextState.activeTaskId &&
        !nextState.boards.some((board) =>
          board.columns.some((column) =>
            column.tasks.some((task) => task.id === nextState.activeTaskId),
          ),
        )
      ) {
        nextState.activeTaskId = null;
      }

      return nextState;
    }
    default:
      return state;
  }
}
