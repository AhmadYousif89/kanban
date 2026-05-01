import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { KanbanProvider, useKanbanActions, useKanbanState } from '../context/kanban-context';
import { createStateFixture, rawBoards } from './fixtures';

const STORAGE_KEY = 'kanban-dashboard-state:v1';

function Harness() {
  const state = useKanbanState();
  const actions = useKanbanActions();

  return (
    <div>
      <span data-testid='active-board'>{state.activeBoardId ?? 'none'}</span>
      <span data-testid='sidebar-state'>{state.isSidebarOpen ? 'open' : 'closed'}</span>
      <span data-testid='fullscreen-state'>
        {state.isFullscreenView ? 'fullscreen' : 'windowed'}
      </span>
      <button type='button' onClick={() => actions.toggleSidebar()}>
        Toggle sidebar
      </button>
    </div>
  );
}

function OutsideProvider() {
  useKanbanState();
  return null;
}

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute('data-fullscreen');
});

describe('KanbanProvider', () => {
  it('hydrates stored state and normalizes the active board id', async () => {
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

    render(
      <KanbanProvider initialBoards={rawBoards}>
        <Harness />
      </KanbanProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('active-board')).toHaveTextContent(state.boards[0]?.id ?? 'none');
    });
    expect(screen.getByTestId('sidebar-state')).toHaveTextContent('closed');
    expect(screen.getByTestId('fullscreen-state')).toHaveTextContent('fullscreen');
    expect(document.documentElement).toHaveAttribute('data-fullscreen');
  });

  it('persists updates triggered through dashboard actions', async () => {
    const user = userEvent.setup();

    render(
      <KanbanProvider initialBoards={rawBoards}>
        <Harness />
      </KanbanProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('sidebar-state')).toHaveTextContent('open');
    });

    await user.click(screen.getByRole('button', { name: 'Toggle sidebar' }));

    await waitFor(() => {
      expect(screen.getByTestId('sidebar-state')).toHaveTextContent('closed');
    });

    const storageKey = window.localStorage.key(0);

    expect(storageKey).toBe(STORAGE_KEY);
    expect(JSON.parse(window.localStorage.getItem(storageKey ?? '') ?? 'null').isSidebarOpen).toBe(
      false,
    );
  });

  it('throws when dashboard state hooks are used outside the provider', () => {
    expect(() => render(<OutsideProvider />)).toThrow(
      'useKanbanState must be used within a KanbanProvider',
    );
  });
});
