import type { KanbanAction, KanbanState } from '../kanban.types';

export function reduceUiState(state: KanbanState, action: KanbanAction): KanbanState {
  switch (action.type) {
    case 'sidebar:open':
      return state.isSidebarOpen ? state : { ...state, isSidebarOpen: true };
    case 'sidebar:close':
      return state.isSidebarOpen ? { ...state, isSidebarOpen: false } : state;
    case 'sidebar:toggle':
      return { ...state, isSidebarOpen: !state.isSidebarOpen };
    case 'dashboard:view':
      return { ...state, isFullscreenView: !state.isFullscreenView };
    case 'task:view-open':
      return state.activeTaskId === action.taskId
        ? state
        : { ...state, activeTaskId: action.taskId };
    case 'task:view-close':
      return state.activeTaskId === null ? state : { ...state, activeTaskId: null };
    default:
      return state;
  }
}
