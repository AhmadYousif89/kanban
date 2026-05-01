import type { ClientRect } from '@dnd-kit/core';
import { KeyboardCode } from '@dnd-kit/core';
import { describe, expect, it, vi } from 'vitest';

import { boardKeyboardCoordinates } from '../hooks/board-dnd-utils';
import { toColumnDropId } from '../main/board.dnd';
import { createDroppableContainer, createRect } from './fixtures';

describe('boardKeyboardCoordinates', () => {
  it('targets the empty middle column instead of jumping to the occupied column on ArrowRight', () => {
    const activeRect = createRect({ left: 20, top: 24, width: 100, height: 80 });
    const leftColumn = createDroppableContainer({
      id: toColumnDropId('column-1'),
      rect: createRect({ left: 0, top: 0, width: 100, height: 360 }),
    });
    const middleColumn = createDroppableContainer({
      id: toColumnDropId('column-2'),
      rect: createRect({ left: 120, top: 0, width: 100, height: 360 }),
    });
    const rightColumn = createDroppableContainer({
      id: toColumnDropId('column-3'),
      rect: createRect({ left: 240, top: 0, width: 100, height: 360 }),
    });

    const containers = [leftColumn, middleColumn, rightColumn];
    const droppableContainers = {
      getEnabled: () => containers,
      get: (id: string) => containers.find((container) => container.id === id) ?? null,
    } as unknown as Parameters<
      typeof boardKeyboardCoordinates
    >[1]['context']['droppableContainers'];

    const keyboardEvent = {
      code: KeyboardCode.Right,
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent;

    const keyboardArgs = {
      active: 'task:task-1',
      currentCoordinates: { x: 20, y: 24 },
      context: {
        active: {
          id: 'task:task-1',
          data: { current: {} },
          rect: { current: { initial: activeRect, translated: activeRect } },
        },
        collisionRect: activeRect,
        droppableRects: new Map([
          [leftColumn.id, leftColumn.rect.current as ClientRect],
          [middleColumn.id, middleColumn.rect.current as ClientRect],
          [rightColumn.id, rightColumn.rect.current as ClientRect],
        ]),
        droppableContainers,
        over: null,
        scrollableAncestors: [],
      },
    } as unknown as Parameters<typeof boardKeyboardCoordinates>[1];

    const coordinates = boardKeyboardCoordinates(keyboardEvent, keyboardArgs);

    expect(coordinates).toEqual({ x: 120, y: 0 });
  });
});
