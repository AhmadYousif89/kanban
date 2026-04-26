export const TASK_PREFIX = 'task:';
export const COLUMN_PREFIX = 'column:';
export const COLUMN_DROP_PREFIX = 'column-drop:';

export const toTaskDraggableId = (taskId: string) => `${TASK_PREFIX}${taskId}`;
export const toColumnDraggableId = (columnId: string) => `${COLUMN_PREFIX}${columnId}`;
export const toColumnDropId = (columnId: string) => `${COLUMN_DROP_PREFIX}${columnId}`;

export const fromTaskDraggableId = (id: string) =>
  id.startsWith(TASK_PREFIX) ? id.slice(TASK_PREFIX.length) : null;

export const fromColumnDropId = (id: string) =>
  id.startsWith(COLUMN_DROP_PREFIX) ? id.slice(COLUMN_DROP_PREFIX.length) : null;

export const fromColumnDraggableId = (id: string) =>
  id.startsWith(COLUMN_PREFIX) ? id.slice(COLUMN_PREFIX.length) : null;
