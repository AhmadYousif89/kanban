'use client';

import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useCallback, useMemo } from 'react';

import type { Board } from '../context/kanban.types';
import { toColumnDraggableId } from '../main/board.dnd';
import { boardCollisionDetection, boardKeyboardCoordinates } from './board-dnd-utils';
import { useColumnDnd } from './use-column-dnd';
import { useTaskDnd } from './use-task-dnd';

type UseBoardDndOptions = { board: Board | null };

export function useBoardDnd({ board }: UseBoardDndOptions) {
  const {
    activeColumnId,
    onDragEnd: endCol,
    onDragStart: startCol,
    onDragCancel: cancelCol,
  } = useColumnDnd({ board });

  const {
    activeTaskId,
    previewBoard,
    overColumnId,
    isTaskDragging,
    onDragEnd: endTask,
    onDragOver: overTask,
    onDragStart: startTask,
    onDragCancel: cancelTask,
  } = useTaskDnd({ board });

  const sensors = useSensors(
    useSensor(KeyboardSensor, {
      coordinateGetter: boardKeyboardCoordinates,
    }),
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 6 },
    }),
  );

  const columnIds = useMemo(
    () => board?.columns.map((column) => toColumnDraggableId(column.id)) ?? [],
    [board],
  );

  const onDragStart = useCallback(
    (e: DragStartEvent) => {
      startCol(e);
      startTask(e);
    },
    [startCol, startTask],
  );

  const onDragOver = useCallback((e: DragOverEvent) => overTask(e), [overTask]);

  const onDragEnd = useCallback(
    (e: DragEndEvent) => {
      endCol(e);
      endTask(e);
    },
    [endCol, endTask],
  );

  const onDragCancel = useCallback(() => {
    cancelCol();
    cancelTask();
  }, [cancelCol, cancelTask]);

  return {
    sensors,
    columnIds,
    activeTaskId,
    activeColumnId,
    isTaskDragging,
    previewBoard,
    overColumnId,
    collisionDetection: boardCollisionDetection,
    onDragCancel,
    onDragStart,
    onDragOver,
    onDragEnd,
  };
}
