import { useEffect, useState, type Dispatch } from 'react';

import { loadStoredState, persistState, syncFullscreenMode } from './kanban.storage';
import type { KanbanAction, KanbanState, RawBoard } from './kanban.types';

type UseKanbanPersistenceArgs = {
  state: KanbanState;
  dispatch: Dispatch<KanbanAction>;
  initialBoards: RawBoard[];
};

export function useKanbanPersistence({ state, dispatch, initialBoards }: UseKanbanPersistenceArgs) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const persistedState = loadStoredState(initialBoards);

    if (persistedState) {
      dispatch({ type: 'state:hydrate', state: persistedState });
      syncFullscreenMode(persistedState.isFullscreenView);
    } else {
      syncFullscreenMode(false);
    }

    setIsHydrated(true);
  }, [dispatch, initialBoards]);

  useEffect(() => {
    if (!isHydrated) return;

    persistState(state);
    syncFullscreenMode(state.isFullscreenView);
  }, [isHydrated, state]);

  return isHydrated;
}
