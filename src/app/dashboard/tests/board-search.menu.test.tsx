import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { KanbanProvider, useActiveBoard } from '../context/kanban-context';
import { BoardSearchMenu } from '../header/board-search.menu';

const searchBoards = [
  {
    name: 'Platform Launch',
    columns: [
      {
        name: 'Todo',
        tasks: [
          {
            title: 'Plan launch',
            description: 'Prepare the launch plan and timeline.',
            status: 'Todo',
            subtasks: [],
          },
        ],
      },
    ],
  },
  {
    name: 'Marketing Plan',
    columns: [
      {
        name: 'Ideas',
        tasks: [
          {
            title: 'Plan campaign',
            description: 'Draft the campaign plan.',
            status: 'Ideas',
            subtasks: [],
          },
        ],
      },
    ],
  },
];

function ActiveBoardLabel() {
  const board = useActiveBoard();

  return <span data-testid='active-board'>{board?.name ?? 'none'}</span>;
}

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute('data-fullscreen');
});

describe('BoardSearchMenu', () => {
  it('opens and closes with ctrl+/', async () => {
    render(
      <KanbanProvider initialBoards={searchBoards}>
        <BoardSearchMenu />
      </KanbanProvider>,
    );

    expect(screen.queryByRole('dialog')).toBeNull();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: '/', code: 'Slash', ctrlKey: true }));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: '/', code: 'Slash', ctrlKey: true }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('searches all boards by default and narrows to a selected board', async () => {
    const user = userEvent.setup();

    render(
      <KanbanProvider initialBoards={searchBoards}>
        <BoardSearchMenu />
        <ActiveBoardLabel />
      </KanbanProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Search tasks' }));

    const searchbox = await screen.findByPlaceholderText('Search tasks in All boards');
    await user.type(searchbox, 'plan');

    expect(
      screen.getByRole('option', { name: 'Plan launch in Platform Launch, Todo' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Plan campaign in Marketing Plan, Ideas' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: 'Search within Marketing Plan' }));

    expect(
      screen.getByRole('option', { name: 'Plan campaign in Marketing Plan, Ideas' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'Plan launch in Platform Launch, Todo' }),
    ).toBeNull();

    await user.click(
      screen.getByRole('option', { name: 'Plan campaign in Marketing Plan, Ideas' }),
    );

    await waitFor(() => {
      expect(screen.getByTestId('active-board')).toHaveTextContent('Marketing Plan');
    });
  });
});
