export type KanbanId = string;

export type RawSubtask = {
  title: string;
  isCompleted: boolean;
};

export type RawTask = {
  title: string;
  description: string;
  status: string;
  subtasks: RawSubtask[];
};

export type RawColumn = {
  name: string;
  tasks: RawTask[];
  color?: string;
};

export type RawBoard = {
  name: string;
  columns: RawColumn[];
};

export type Subtask = RawSubtask & {
  id: KanbanId;
};

export type Task = Omit<RawTask, 'subtasks'> & {
  id: KanbanId;
  subtasks: Subtask[];
};

export type Column = Omit<RawColumn, 'tasks'> & {
  id: KanbanId;
  color: string;
  tasks: Task[];
};

export type Board = Omit<RawBoard, 'columns'> & {
  id: KanbanId;
  columns: Column[];
};

export type SubtaskInput = RawSubtask;

export type TaskInput = {
  title: string;
  description: string;
  status?: string;
  subtasks?: SubtaskInput[];
};

export type ColumnInput = {
  id?: KanbanId;
  name: string;
  color?: string;
  tasks?: TaskInput[];
};

export type BoardInput = {
  name: string;
  columns?: ColumnInput[];
};

export type KanbanState = {
  boards: Board[];
  activeBoardId: KanbanId | null;
  isSidebarOpen: boolean;
  isFullscreenView: boolean;
};

export type KanbanAction =
  | { type: 'view:toggle-fullscreen' }
  | { type: 'state:hydrate'; state: KanbanState }
  | { type: 'board:select'; boardId: KanbanId }
  | { type: 'board:delete'; boardId: KanbanId }
  | { type: 'board:save'; boardId?: KanbanId; values: BoardInput }
  | {
      type: 'column:save';
      boardId: KanbanId;
      columnId?: KanbanId;
      values: ColumnInput;
    }
  | { type: 'column:delete'; boardId: KanbanId; columnId: KanbanId }
  | {
      type: 'column:move';
      boardId: KanbanId;
      columnId: KanbanId;
      toIndex: number;
    }
  | {
      type: 'task:save';
      boardId: KanbanId;
      columnId: KanbanId;
      taskId?: KanbanId;
      values: TaskInput;
    }
  | { type: 'task:delete'; taskId: KanbanId }
  | {
      type: 'task:move';
      taskId: KanbanId;
      toBoardId: KanbanId;
      toColumnId: KanbanId;
      toIndex?: number;
    }
  | {
      type: 'task:toggle-subtask';
      taskId: KanbanId;
      subtaskId: KanbanId;
      isCompleted?: boolean;
    }
  | { type: 'sidebar:open' }
  | { type: 'sidebar:close' }
  | { type: 'sidebar:toggle' };
