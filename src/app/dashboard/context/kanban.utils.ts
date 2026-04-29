import type {
  Board,
  BoardInput,
  Column,
  ColumnInput,
  KanbanId,
  KanbanState,
  RawBoard,
  Subtask,
  SubtaskInput,
  Task,
  TaskInput,
} from './kanban.types';

type TaskLocation = {
  columnIndex: number;
  taskIndex: number;
};

type BoardTaskLocation = TaskLocation & {
  boardIndex: number;
};

export const MAX_COLUMNS = 8;
export const MAX_SUBTASKS = 6;
export const DEFAULT_COLUMN_COLORS = ['#49C4E5', '#8471F2', '#67E2AE'] as const;

export function getProgressLabel(completed: number, total: number) {
  return `${completed} of ${total} subtasks`;
}

export function slugify(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'item'
  );
}

export function cleanText(value: string | undefined, fallback: string) {
  const trimmedValue = value?.trim();
  return trimmedValue && trimmedValue.length > 0 ? trimmedValue : fallback;
}

export function cloneSubtask(subtask: Subtask): Subtask {
  return { ...subtask };
}

export function cloneTask(task: Task): Task {
  return {
    ...task,
    subtasks: task.subtasks.map(cloneSubtask),
  };
}

export function cloneColumn(column: Column): Column {
  return {
    ...column,
    tasks: column.tasks.map(cloneTask),
  };
}

export function cloneBoard(board: Board): Board {
  return {
    ...board,
    columns: board.columns.map(cloneColumn),
  };
}

export function cloneState(state: KanbanState): KanbanState {
  return {
    ...state,
    boards: state.boards.map(cloneBoard),
  };
}

export function createSubtasks(subtasks: SubtaskInput[] | undefined, taskId: string) {
  return (subtasks ?? []).slice(0, MAX_SUBTASKS).map((subtask, subtaskIndex) => ({
    id: `${taskId}-subtask-${subtaskIndex}-${slugify(subtask.title)}`,
    title: cleanText(subtask.title, `Subtask ${subtaskIndex + 1}`),
    isCompleted: subtask.isCompleted,
  }));
}

export function createTask(
  task: TaskInput,
  columnId: string,
  columnName: string,
  taskIndex: number,
): Task {
  const taskId = `${columnId}-task-${taskIndex}-${slugify(task.title)}`;

  return {
    id: taskId,
    title: cleanText(task.title, `Task ${taskIndex + 1}`),
    description: task.description,
    status: columnName,
    subtasks: createSubtasks(task.subtasks, taskId),
  };
}

export function createColumn(column: ColumnInput, boardId: string, columnIndex: number): Column {
  const columnName = cleanText(column.name, `Column ${columnIndex + 1}`);
  const columnId = `${boardId}-column-${columnIndex}-${slugify(columnName)}`;
  const color = cleanText(
    column.color,
    DEFAULT_COLUMN_COLORS[columnIndex % DEFAULT_COLUMN_COLORS.length],
  );

  return {
    id: columnId,
    name: columnName,
    color,
    tasks: (column.tasks ?? []).map((task, taskIndex) =>
      createTask(task, columnId, columnName, taskIndex),
    ),
  };
}

export function mergeBoardColumns(
  existingColumns: Column[],
  submittedColumns: ColumnInput[],
  boardId: string,
) {
  const columnsById = new Map(existingColumns.map((column) => [column.id, column] as const));

  return submittedColumns.slice(0, MAX_COLUMNS).map((column, columnIndex) => {
    if (column.id) {
      const existingColumn = columnsById.get(column.id);

      if (existingColumn) {
        const nextName = cleanText(column.name, existingColumn.name);

        existingColumn.name = nextName;
        existingColumn.color = cleanText(column.color, existingColumn.color);
        existingColumn.tasks.forEach((task) => {
          task.status = nextName;
        });

        return existingColumn;
      }
    }

    return createColumn(column, boardId, columnIndex);
  });
}

export function createBoard(board: BoardInput, boardIndex: number): Board {
  const boardName = cleanText(board.name, `Board ${boardIndex + 1}`);
  const boardId = `board-${boardIndex}-${slugify(boardName)}`;

  return {
    id: boardId,
    name: boardName,
    columns: (board.columns ?? [])
      .slice(0, MAX_COLUMNS)
      .map((column, columnIndex) => createColumn(column, boardId, columnIndex)),
  };
}

export function findBoardIndex(boards: Board[], boardId: KanbanId) {
  return boards.findIndex((board) => board.id === boardId);
}

export function findColumnIndex(columns: Column[], columnId: KanbanId) {
  return columns.findIndex((column) => column.id === columnId);
}

export function findTaskLocation(board: Board, taskId: KanbanId): TaskLocation | null {
  for (let columnIndex = 0; columnIndex < board.columns.length; columnIndex += 1) {
    const taskIndex = board.columns[columnIndex].tasks.findIndex((task) => task.id === taskId);
    if (taskIndex !== -1) return { columnIndex, taskIndex };
  }

  return null;
}

export function findTaskLocationInState(
  state: KanbanState,
  taskId: KanbanId,
): BoardTaskLocation | null {
  for (let boardIndex = 0; boardIndex < state.boards.length; boardIndex += 1) {
    const board = state.boards[boardIndex];
    const taskLocation = findTaskLocation(board, taskId);

    if (taskLocation) {
      return { boardIndex, ...taskLocation };
    }
  }

  return null;
}

export function findColumnByName(board: Board, columnName: string) {
  const trimmedName = columnName.trim();
  return board.columns.find((column) => column.name === trimmedName) ?? null;
}

export function createInitialState(rawBoards: RawBoard[]): KanbanState {
  const boards = rawBoards.map((board, boardIndex) => createBoard(board, boardIndex));

  return {
    boards,
    activeBoardId: boards[0]?.id ?? null,
    isSidebarOpen: true,
    isFullscreenView: false,
  };
}
