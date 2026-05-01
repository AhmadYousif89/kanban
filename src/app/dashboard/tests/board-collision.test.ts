import type { ClientRect } from '@dnd-kit/core';
import { describe, expect, it } from 'vitest';

import { boardCollisionDetection } from '../hooks/board-dnd-utils';
import { toColumnDropId, toTaskDraggableId } from '../main/board.dnd';
import { createDroppableContainer, createRect } from './fixtures';

describe('boardCollisionDetection', () => {
  it('does not skip the occupied middle column during keyboard-style moves', () => {
    const collisionRect = createRect({ left: 120, top: 240, width: 100, height: 80 });
    const active = {
      id: 'task:task-1',
      data: { current: {} },
      rect: { current: { initial: collisionRect, translated: collisionRect } },
    };

    const leftColumn = createDroppableContainer({
      columnId: 'column-1',
      id: toColumnDropId('column-1'),
      rect: createRect({ left: 0, top: 0, width: 100, height: 360 }),
    });
    const middleColumn = createDroppableContainer({
      columnId: 'column-2',
      id: toColumnDropId('column-2'),
      rect: createRect({ left: 120, top: 0, width: 100, height: 140 }),
    });
    const rightColumn = createDroppableContainer({
      columnId: 'column-3',
      id: toColumnDropId('column-3'),
      rect: createRect({ left: 240, top: 0, width: 100, height: 360 }),
    });
    const middleTask = createDroppableContainer({
      columnId: 'column-2',
      id: toTaskDraggableId('column-2-task-1-middle'),
      rect: createRect({ left: 120, top: 0, width: 100, height: 80 }),
    });
    const leftTask = createDroppableContainer({
      columnId: 'column-1',
      id: toTaskDraggableId('column-1-task-1-left'),
      rect: createRect({ left: 0, top: 0, width: 100, height: 80 }),
    });

    const collisions = boardCollisionDetection({
      active,
      collisionRect,
      droppableRects: new Map([
        [leftColumn.id, leftColumn.rect.current as ClientRect],
        [middleColumn.id, middleColumn.rect.current as ClientRect],
        [rightColumn.id, rightColumn.rect.current as ClientRect],
        [leftTask.id, leftTask.rect.current as ClientRect],
        [middleTask.id, middleTask.rect.current as ClientRect],
      ]),
      droppableContainers: [leftColumn, middleColumn, rightColumn, leftTask, middleTask],
      pointerCoordinates: null,
    });

    expect(String(collisions[0]?.id)).toContain('column-2');
    expect(String(collisions[0]?.id)).not.toContain('column-1');
  });
});
