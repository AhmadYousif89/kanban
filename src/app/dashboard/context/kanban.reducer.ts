import type { KanbanAction, KanbanState } from './kanban.types';
import {
  cleanText,
  cloneState,
  createBoard,
  createColumn,
  createSubtasks,
  createTask,
  findBoardIndex,
  findColumnByName,
  findColumnIndex,
  findTaskLocationInState,
  MAX_COLUMNS,
  mergeBoardColumns,
} from './kanban.utils';

export function kanbanReducer(state: KanbanState, action: KanbanAction): KanbanState {
  switch (action.type) {
    case 'state:hydrate':
      return action.state;

    case 'sidebar:open':
      return state.isSidebarOpen ? state : { ...state, isSidebarOpen: true };
    case 'sidebar:close':
      return state.isSidebarOpen ? { ...state, isSidebarOpen: false } : state;
    case 'sidebar:toggle':
      return { ...state, isSidebarOpen: !state.isSidebarOpen };
    case 'view:toggle-fullscreen':
      return { ...state, isFullscreenView: !state.isFullscreenView };

    case 'board:select': {
      return state.boards.some((board) => board.id === action.boardId)
        ? { ...state, activeBoardId: action.boardId }
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

      return nextState;
    }
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
    case 'task:save': {
      const boardIndex = findBoardIndex(state.boards, action.boardId);

      if (boardIndex === -1) return state;

      const nextState = cloneState(state);
      const board = nextState.boards[boardIndex];
      const columnIndex = findColumnIndex(board.columns, action.columnId);

      if (columnIndex === -1) return state;

      const column = board.columns[columnIndex];

      if (action.taskId) {
        const taskLocation = findTaskLocationInState(nextState, action.taskId);

        if (!taskLocation) return state;

        const currentBoard = nextState.boards[taskLocation.boardIndex];
        const currentColumn = currentBoard.columns[taskLocation.columnIndex];
        const existingTask = currentColumn.tasks[taskLocation.taskIndex];
        const nextStatus = cleanText(action.values.status, existingTask.status);
        const destinationColumn = findColumnByName(currentBoard, nextStatus);

        if (destinationColumn && destinationColumn.id !== currentColumn.id) {
          currentColumn.tasks.splice(taskLocation.taskIndex, 1);
          destinationColumn.tasks.push({
            ...existingTask,
            title: cleanText(action.values.title, existingTask.title),
            description: action.values.description,
            status: destinationColumn.name,
            subtasks: action.values.subtasks
              ? createSubtasks(action.values.subtasks, existingTask.id)
              : existingTask.subtasks,
          });
          return nextState;
        }

        existingTask.title = cleanText(action.values.title, existingTask.title);
        existingTask.description = action.values.description;
        existingTask.status = nextStatus;

        if (action.values.subtasks) {
          existingTask.subtasks = createSubtasks(action.values.subtasks, existingTask.id);
        }

        return nextState;
      }

      column.tasks.push(createTask(action.values, column.id, column.name, column.tasks.length));
      return nextState;
    }
    case 'task:delete': {
      const taskLocation = findTaskLocationInState(state, action.taskId);

      if (!taskLocation) return state;

      const nextState = cloneState(state);
      nextState.boards[taskLocation.boardIndex].columns[taskLocation.columnIndex].tasks.splice(
        taskLocation.taskIndex,
        1,
      );
      return nextState;
    }
    case 'task:move': {
      const taskLocation = findTaskLocationInState(state, action.taskId);

      if (!taskLocation) return state;

      const destinationBoardIndex = findBoardIndex(state.boards, action.toBoardId);

      if (destinationBoardIndex === -1) return state;

      const destinationColumnIndex = findColumnIndex(
        state.boards[destinationBoardIndex].columns,
        action.toColumnId,
      );

      if (destinationColumnIndex === -1) return state;

      const nextState = cloneState(state);
      const sourceColumn =
        nextState.boards[taskLocation.boardIndex].columns[taskLocation.columnIndex];
      const destinationColumn =
        nextState.boards[destinationBoardIndex].columns[destinationColumnIndex];
      const [task] = sourceColumn.tasks.splice(taskLocation.taskIndex, 1);

      if (!task) return state;

      const insertIndex = Math.min(
        Math.max(action.toIndex ?? destinationColumn.tasks.length, 0),
        destinationColumn.tasks.length,
      );

      destinationColumn.tasks.splice(insertIndex, 0, {
        ...task,
        status: destinationColumn.name,
      });

      return nextState;
    }
    case 'task:toggle-subtask': {
      const taskLocation = findTaskLocationInState(state, action.taskId);

      if (!taskLocation) return state;

      const nextState = cloneState(state);
      const task =
        nextState.boards[taskLocation.boardIndex].columns[taskLocation.columnIndex].tasks[
          taskLocation.taskIndex
        ];
      const subtask = task.subtasks.find((item) => item.id === action.subtaskId);

      if (!subtask) return state;

      subtask.isCompleted = action.isCompleted ?? !subtask.isCompleted;
      return nextState;
    }
    default:
      return state;
  }
}
