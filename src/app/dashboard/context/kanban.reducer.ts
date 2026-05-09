import type { KanbanAction, KanbanState } from './kanban.types';
import { reduceBoardState } from './reducers/board.reducer';
import { reduceColumnState } from './reducers/column.reducer';
import { reduceTaskState } from './reducers/task.reducer';
import { reduceUiState } from './reducers/ui.reducer';

export function kanbanReducer(state: KanbanState, action: KanbanAction): KanbanState {
  switch (action.type) {
    case 'state:hydrate':
      return action.state;

    case 'dashboard:view':
    case 'sidebar:open':
    case 'sidebar:close':
    case 'sidebar:toggle':
    case 'task:view-open':
    case 'task:view-close':
      return reduceUiState(state, action);

    case 'board:select':
    case 'board:save':
    case 'board:delete':
      return reduceBoardState(state, action);

    case 'column:save':
    case 'column:move':
    case 'column:delete':
      return reduceColumnState(state, action);

    case 'task:save':
    case 'task:move':
    case 'task:delete':
    case 'task:toggle-subtask':
      return reduceTaskState(state, action);

    default:
      return state;
  }
}
