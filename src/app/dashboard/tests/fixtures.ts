import type { ClientRect, DroppableContainer } from '@dnd-kit/core';
import type { KanbanState, RawBoard } from '../context/kanban.types';
import { createInitialState } from '../context/kanban.utils';

export const rawBoards: RawBoard[] = [
  {
    name: 'Platform Launch',
    columns: [
      {
        name: 'Todo',
        color: '#49C4E5',
        tasks: [
          {
            title: 'Draft brief',
            description: 'Outline the launch scope.',
            status: 'Todo',
            subtasks: [
              { title: 'Collect requirements', isCompleted: true },
              { title: 'Write schedule', isCompleted: false },
            ],
          },
          {
            title: 'Set up tracking',
            description: 'Prepare analytics for the launch.',
            status: 'Todo',
            subtasks: [],
          },
        ],
      },
      {
        name: 'Doing',
        color: '#8471F2',
        tasks: [
          {
            title: 'Review copy',
            description: 'Edit launch messaging.',
            status: 'Doing',
            subtasks: [{ title: 'Send draft', isCompleted: false }],
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
        color: '#67E2AE',
        tasks: [],
      },
    ],
  },
];

export function createStateFixture(): KanbanState {
  return createInitialState(rawBoards);
}

type RectProps = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export function createRect(rect: RectProps): ClientRect {
  const { left, top, width, height } = rect;
  return {
    top,
    left,
    width,
    height,
    right: left + width,
    bottom: top + height,
  };
}

type DroppableContainerProps = {
  id: string;
  rect: ClientRect;
  columnId?: string;
};

export function createDroppableContainer({
  id,
  rect,
  columnId,
}: DroppableContainerProps): DroppableContainer {
  return {
    id,
    key: id,
    disabled: false,
    data: { current: { columnId } } as DroppableContainer['data'],
    node: { current: null },
    rect: { current: rect },
  };
}
