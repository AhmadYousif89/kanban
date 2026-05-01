import { beforeEach, describe, expect, it } from 'vitest';

import { loadStoredState, persistState, syncFullscreenMode } from '../context/kanban.storage';
import { createStateFixture, rawBoards } from './fixtures';

const STORAGE_KEY = 'kanban-dashboard-state:v1';

describe('kanban storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-fullscreen');
  });

  it('rejects malformed persisted state', () => {
    window.localStorage.setItem(STORAGE_KEY, '{not json');

    expect(loadStoredState(rawBoards)).toBeNull();
  });

  it('normalizes the active board and restores toggles', () => {
    const state = createStateFixture();
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...state,
        activeBoardId: 'missing-board',
        isSidebarOpen: false,
        isFullscreenView: true,
      }),
    );

    const loaded = loadStoredState(rawBoards);

    expect(loaded?.activeBoardId).toBe(state.boards[0]?.id ?? null);
    expect(loaded?.isSidebarOpen).toBe(false);
    expect(loaded?.isFullscreenView).toBe(true);
  });

  it('persists state and syncs fullscreen mode', () => {
    const state = createStateFixture();

    persistState(state);

    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')).toEqual(state);

    syncFullscreenMode(true);
    expect(document.documentElement).toHaveAttribute('data-fullscreen');

    syncFullscreenMode(false);
    expect(document.documentElement).not.toHaveAttribute('data-fullscreen');
  });
});
