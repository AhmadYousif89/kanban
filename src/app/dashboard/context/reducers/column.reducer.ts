import type { KanbanAction, KanbanState } from '../kanban.types';
import {
  MAX_COLUMNS,
  cleanText,
  cloneState,
  createColumn,
  createTask,
  findBoardIndex,
  findColumnIndex,
} from '../kanban.utils';

export function reduceColumnState(state: KanbanState, action: KanbanAction): KanbanState {
  switch (action.type) {
    case 'column:save': {
      const boardIndex = findBoardIndex(state.boards, action.boardId);

      if (boardIndex === -1) return state;

      const nextState = cloneState(state);
      const board = nextState.boards[boardIndex];
      if (action.columnId) {
        const columnIndex = findColumnIndex(board.columns, action.columnId);

        if (columnIndex === -1) return state;

        const column = board.columns[columnIndex];
        column.name = cleanText(action.values.name, column.name);
        column.color = cleanText(action.values.color, column.color);

        if (action.values.tasks) {
          column.tasks = action.values.tasks.map((task, taskIndex) =>
            createTask(task, column.id, column.name, taskIndex),
          );
        }

        return nextState;
      }

      if (board.columns.length >= MAX_COLUMNS) return state;

      board.columns.push(createColumn(action.values, board.id, board.columns.length));
      return nextState;
    }
    case 'column:delete': {
      const boardIndex = findBoardIndex(state.boards, action.boardId);

      if (boardIndex === -1) return state;

      const nextState = cloneState(state);
      const board = nextState.boards[boardIndex];
      const columnIndex = findColumnIndex(board.columns, action.columnId);

      if (columnIndex === -1) return state;

      board.columns.splice(columnIndex, 1);
      return nextState;
    }
    case 'column:move': {
      const boardIndex = findBoardIndex(state.boards, action.boardId);

      if (boardIndex === -1) return state;

      const columnIndex = findColumnIndex(state.boards[boardIndex].columns, action.columnId);

      if (columnIndex === -1) return state;

      const nextState = cloneState(state);
      const columns = nextState.boards[boardIndex].columns;
      const [movedColumn] = columns.splice(columnIndex, 1);

      if (!movedColumn) return state;

      const insertIndex = Math.min(Math.max(action.toIndex, 0), columns.length);
      columns.splice(insertIndex, 0, movedColumn);
      return nextState;
    }
    default:
      return state;
  }
}
