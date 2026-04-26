import type { Dispatch } from 'react';

import type { BoardInput, ColumnInput, KanbanAction, TaskInput } from './kanban.types';

export type KanbanActions = {
  selectBoard(boardId: string): void;
  openSidebar(): void;
  closeSidebar(): void;
  toggleSidebar(): void;
  toggleFullscreenView(): void;
  saveBoard(values: BoardInput, boardId?: string): void;
  deleteBoard(boardId: string): void;
  saveColumn(boardId: string, values: ColumnInput, columnId?: string): void;
  deleteColumn(boardId: string, columnId: string): void;
  moveColumn(boardId: string, columnId: string, toIndex: number): void;
  saveTask(boardId: string, columnId: string, values: TaskInput, taskId?: string): void;
  deleteTask(taskId: string): void;
  moveTask(taskId: string, toBoardId: string, toColumnId: string, toIndex?: number): void;
  toggleSubtask(taskId: string, subtaskId: string, isCompleted?: boolean): void;
};

export function createKanbanActions(dispatch: Dispatch<KanbanAction>): KanbanActions {
  return {
    selectBoard(boardId: string) {
      dispatch({ type: 'board:select', boardId });
    },
    openSidebar() {
      dispatch({ type: 'sidebar:open' });
    },
    closeSidebar() {
      dispatch({ type: 'sidebar:close' });
    },
    toggleSidebar() {
      dispatch({ type: 'sidebar:toggle' });
    },
    toggleFullscreenView() {
      dispatch({ type: 'view:toggle-fullscreen' });
    },
    saveBoard(values: BoardInput, boardId?: string) {
      dispatch({ type: 'board:save', boardId, values });
    },
    deleteBoard(boardId: string) {
      dispatch({ type: 'board:delete', boardId });
    },
    saveColumn(boardId: string, values: ColumnInput, columnId?: string) {
      dispatch({ type: 'column:save', boardId, columnId, values });
    },
    deleteColumn(boardId: string, columnId: string) {
      dispatch({ type: 'column:delete', boardId, columnId });
    },
    moveColumn(boardId: string, columnId: string, toIndex: number) {
      dispatch({ type: 'column:move', boardId, columnId, toIndex });
    },
    saveTask(boardId: string, columnId: string, values: TaskInput, taskId?: string) {
      dispatch({ type: 'task:save', boardId, columnId, taskId, values });
    },
    deleteTask(taskId: string) {
      dispatch({ type: 'task:delete', taskId });
    },
    moveTask(taskId: string, toBoardId: string, toColumnId: string, toIndex?: number) {
      dispatch({ type: 'task:move', taskId, toBoardId, toColumnId, toIndex });
    },
    toggleSubtask(taskId: string, subtaskId: string, isCompleted?: boolean) {
      dispatch({ type: 'task:toggle-subtask', taskId, subtaskId, isCompleted });
    },
  };
}
