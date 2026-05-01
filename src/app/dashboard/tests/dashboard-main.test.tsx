import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useHasBoards } from '../context/kanban-context';
import { DashboardMain } from '../main/main';

vi.mock('../context/kanban-context', () => ({
  useHasBoards: vi.fn(),
}));

vi.mock('../main/board', () => ({
  ActiveBoard: () => <div data-testid='active-board'>Active board</div>,
}));

vi.mock('../main/empty', () => ({
  EmptyDashboard: () => <div data-testid='empty-dashboard'>Empty dashboard</div>,
}));

const mockedUseHasBoards = vi.mocked(useHasBoards);

describe('DashboardMain', () => {
  beforeEach(() => {
    mockedUseHasBoards.mockReset();
  });

  it('renders the active board branch when boards exist', () => {
    mockedUseHasBoards.mockReturnValue(true);

    render(<DashboardMain />);

    expect(screen.getByTestId('active-board')).toBeInTheDocument();
    expect(screen.queryByTestId('empty-dashboard')).toBeNull();
  });

  it('renders the empty branch when no boards exist', () => {
    mockedUseHasBoards.mockReturnValue(false);

    render(<DashboardMain />);

    expect(screen.getByTestId('empty-dashboard')).toBeInTheDocument();
    expect(screen.queryByTestId('active-board')).toBeNull();
  });
});
