import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useKanbanActions, useActiveBoard } from '../context/kanban-context';
import { useBoardDnd } from '../hooks/use-board-dnd';
import { ActiveBoard } from '../main/board';

type MockSortableColumnProps = {
  column: { id: string };
  setColumnRef?: (columnId: string, node: HTMLLIElement | null) => void;
};

vi.mock('../context/kanban-context', () => ({
  useActiveBoard: vi.fn(),
  useKanbanActions: vi.fn(),
}));

vi.mock('../hooks/use-board-dnd', () => ({
  useBoardDnd: vi.fn(),
}));

vi.mock('../components/boards', () => ({
  EmptyStateBoard: () => <div data-testid='empty-state-board' />,
}));

vi.mock('../components/tasks', () => ({
  TaskCardPreview: () => null,
}));

vi.mock('../components/columns', () => ({
  ColumnDragOverlay: () => null,
  SortableColumn: ({ column, setColumnRef }: MockSortableColumnProps) => {
    return (
      <li ref={(node) => setColumnRef?.(column.id, node)} data-testid={`column-${column.id}`} />
    );
  },
}));

const mockedUseActiveBoard = vi.mocked(useActiveBoard);
const mockedUseKanbanActions = vi.mocked(useKanbanActions);
const mockedUseBoardDnd = vi.mocked(useBoardDnd);

describe('ActiveBoard', () => {
  beforeEach(() => {
    mockedUseActiveBoard.mockReset();
    mockedUseKanbanActions.mockReset();
    mockedUseBoardDnd.mockReset();

    const scrollLeftValues = new WeakMap<HTMLElement, number>();

    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
      configurable: true,
      value(this: HTMLElement) {
        if (this.tagName === 'SECTION') {
          return {
            x: 0,
            y: 0,
            top: 0,
            left: 0,
            bottom: 800,
            right: 1200,
            width: 1200,
            height: 800,
            toJSON: () => ({}),
          } as DOMRect;
        }

        if (this.dataset.testid === 'column-column-6') {
          return {
            x: 1224,
            y: 0,
            top: 0,
            left: 1224,
            bottom: 200,
            right: 1524,
            width: 300,
            height: 200,
            toJSON: () => ({}),
          } as DOMRect;
        }

        if (this.dataset.testid === 'column-column-1') {
          return {
            x: 0,
            y: 0,
            top: 0,
            left: 0,
            bottom: 200,
            right: 300,
            width: 300,
            height: 200,
            toJSON: () => ({}),
          } as DOMRect;
        }

        return {
          x: 0,
          y: 0,
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          width: 0,
          height: 0,
          toJSON: () => ({}),
        } as DOMRect;
      },
    });

    Object.defineProperty(HTMLElement.prototype, 'scrollLeft', {
      configurable: true,
      get(this: HTMLElement) {
        return scrollLeftValues.get(this) ?? 0;
      },
      set(this: HTMLElement, value: number) {
        scrollLeftValues.set(this, value);
      },
    });

    mockedUseKanbanActions.mockReturnValue({
      saveColumn: vi.fn(),
    } as never);
  });

  it('scrolls the board viewport horizontally for keyboard drags', async () => {
    mockedUseActiveBoard.mockReturnValue({
      id: 'board-1',
      name: 'Platform Launch',
      columns: [
        { id: 'column-1', name: 'Todo', color: '#49C4E5', tasks: [] },
        { id: 'column-6', name: 'Done', color: '#67E2AE', tasks: [] },
      ],
    } as never);

    mockedUseBoardDnd.mockReturnValue({
      activeColumnId: null,
      activeTaskId: 'task-1',
      collisionDetection: vi.fn(),
      columnIds: [],
      isTaskDragging: true,
      onDragCancel: vi.fn(),
      onDragEnd: vi.fn(),
      onDragOver: vi.fn(),
      onDragStart: vi.fn(),
      previewBoard: null,
      overColumnId: 'column-6',
      sensors: [],
    } as never);

    const { container } = render(<ActiveBoard />);

    await waitFor(() => {
      expect(container.querySelector('section')).toHaveProperty('scrollLeft', 348);
    });
  });
});
