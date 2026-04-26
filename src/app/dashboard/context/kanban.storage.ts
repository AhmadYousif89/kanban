import type { Board, Column, KanbanState, RawBoard, Subtask, Task } from './kanban.types';

import { createInitialState } from './kanban.utils';

const STORAGE_KEY = 'kanban-dashboard-state:v1';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isSubtask(value: unknown): value is Subtask {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.isCompleted === 'boolean'
  );
}

function isTask(value: unknown): value is Task {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.description === 'string' &&
    typeof value.status === 'string' &&
    Array.isArray(value.subtasks) &&
    value.subtasks.every(isSubtask)
  );
}

function isColumn(value: unknown): value is Column {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.color === 'string' &&
    Array.isArray(value.tasks) &&
    value.tasks.every(isTask)
  );
}

function isBoard(value: unknown): value is Board {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    Array.isArray(value.columns) &&
    value.columns.every(isColumn)
  );
}

function normalizePersistedState(state: KanbanState, fallback: KanbanState): KanbanState {
  const activeBoardId =
    typeof state.activeBoardId === 'string' &&
    state.boards.some((board) => board.id === state.activeBoardId)
      ? state.activeBoardId
      : (state.boards[0]?.id ?? null);

  return {
    boards: state.boards,
    activeBoardId,
    isSidebarOpen:
      typeof state.isSidebarOpen === 'boolean' ? state.isSidebarOpen : fallback.isSidebarOpen,
    isFullscreenView:
      typeof state.isFullscreenView === 'boolean'
        ? state.isFullscreenView
        : fallback.isFullscreenView,
  };
}

export function loadStoredState(rawBoards: RawBoard[]): KanbanState | null {
  if (typeof window === 'undefined') return null;

  const rawState = window.localStorage.getItem(STORAGE_KEY);

  if (!rawState) return null;

  try {
    const parsedState: unknown = JSON.parse(rawState);

    if (
      !isRecord(parsedState) ||
      !Array.isArray(parsedState.boards) ||
      !parsedState.boards.every(isBoard)
    ) {
      return null;
    }

    const fallbackState = createInitialState(rawBoards);

    return normalizePersistedState(
      {
        boards: parsedState.boards,
        activeBoardId:
          typeof parsedState.activeBoardId === 'string' || parsedState.activeBoardId === null
            ? parsedState.activeBoardId
            : fallbackState.activeBoardId,
        isSidebarOpen:
          typeof parsedState.isSidebarOpen === 'boolean'
            ? parsedState.isSidebarOpen
            : fallbackState.isSidebarOpen,
        isFullscreenView:
          typeof parsedState.isFullscreenView === 'boolean'
            ? parsedState.isFullscreenView
            : fallbackState.isFullscreenView,
      },
      fallbackState,
    );
  } catch {
    return null;
  }
}

export function persistState(state: KanbanState) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function syncFullscreenMode(isFullscreenView: boolean) {
  if (typeof document === 'undefined') return;

  document.documentElement.toggleAttribute('data-fullscreen', isFullscreenView);
}
