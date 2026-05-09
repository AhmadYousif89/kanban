import type { KanbanAction, KanbanState } from '../kanban.types';
import {
  cleanText,
  cloneState,
  createSubtasks,
  createTask,
  findBoardIndex,
  findColumnByName,
  findColumnIndex,
  findTaskLocationInState,
} from '../kanban.utils';

export function reduceTaskState(state: KanbanState, action: KanbanAction): KanbanState {
  switch (action.type) {
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

      if (nextState.activeTaskId === action.taskId) nextState.activeTaskId = null;

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
