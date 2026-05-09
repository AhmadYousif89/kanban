'use client';

import type { Dispatch, ReactNode } from 'react';
import { createContext, useContext, useReducer } from 'react';
import { LogoIcon } from '@/components/icons';
import DATA from '@/data.json';
import { createKanbanActions } from './kanban.actions';
import { kanbanReducer } from './kanban.reducer';
import {
  selectActiveBoard,
  selectBoardById,
  selectBoards,
  selectHasBoards,
} from './kanban.selectors';
import type { KanbanAction, KanbanState, RawBoard } from './kanban.types';
import { createInitialState } from './kanban.utils';
import { useKanbanPersistence } from './use-kanban-persistence';

type KanbanProviderProps = {
  children: ReactNode;
  initialBoards?: RawBoard[];
  initialState?: KanbanState;
};

const KanbanStateContext = createContext<KanbanState | null>(null);
const KanbanDispatchContext = createContext<Dispatch<KanbanAction> | null>(null);

export function KanbanProvider({
  children,
  initialBoards = DATA.boards as RawBoard[],
}: KanbanProviderProps) {
  const [state, dispatch] = useReducer(kanbanReducer, initialBoards, createInitialState);
  const isHydrated = useKanbanPersistence({ state, dispatch, initialBoards });

  if (!isHydrated) {
    return (
      <div className='flex min-h-svh items-center justify-center bg-background px-6'>
        <LogoIcon
          animated
          className='dark:*:fill-white *:fill-[#000112]'
          aria-label='Kanban'
          role='img'
        />
      </div>
    );
  }

  return (
    <KanbanDispatchContext.Provider value={dispatch}>
      <KanbanStateContext.Provider value={state}>{children}</KanbanStateContext.Provider>
    </KanbanDispatchContext.Provider>
  );
}

export function useKanbanState() {
  const state = useContext(KanbanStateContext);

  if (!state) {
    throw new Error('useKanbanState must be used within a KanbanProvider');
  }

  return state;
}

function useKanbanDispatch() {
  const dispatch = useContext(KanbanDispatchContext);

  if (!dispatch) {
    throw new Error('useKanbanDispatch must be used within a KanbanProvider');
  }

  return dispatch;
}

export function useKanbanActions() {
  return createKanbanActions(useKanbanDispatch());
}

export function useActiveBoard() {
  return selectActiveBoard(useKanbanState());
}

export function useBoards() {
  return selectBoards(useKanbanState());
}

export function useHasBoards() {
  return selectHasBoards(useKanbanState());
}

export function useBoardById(boardId: string) {
  return selectBoardById(useKanbanState(), boardId);
}
