'use client';

import type {
  CollisionDetection,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  PointerSensor,
  pointerWithin,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { closestCorners } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { COLUMN_DROP_PREFIX, fromColumnDropId, TASK_PREFIX } from '../main/board.dnd';
import { useCallback, useMemo } from 'react';

import type { Board } from '../context/kanban.types';
import { toColumnDraggableId } from '../main/board.dnd';
import { useColumnDnd } from './use-column-dnd';
import { useTaskDnd } from './use-task-dnd';

type UseBoardDndOptions = { board: Board | null };

const collisionDetection: CollisionDetection = (args) => {
  const { pointerCoordinates, droppableContainers } = args;

  // 1. Find potential column collisions
  // Use pointerWithin if mouse/touch, otherwise closestCorners for keyboard
  const columnCollisions = pointerCoordinates
    ? pointerWithin({
        ...args,
        droppableContainers: droppableContainers.filter((c) =>
          String(c.id).startsWith(COLUMN_DROP_PREFIX),
        ),
      })
    : closestCorners({
        ...args,
        droppableContainers: droppableContainers.filter((c) =>
          String(c.id).startsWith(COLUMN_DROP_PREFIX),
        ),
      });

  if (columnCollisions.length > 0) {
    const overColumnId = String(columnCollisions[0].id);
    const overColumnUuid = fromColumnDropId(overColumnId);

    // Find the best task collision WITHIN this column.
    // This prevents tasks in adjacent columns from "stealing" the drop focus.
    const tasksInThisColumn = droppableContainers.filter((c) => {
      if (!String(c.id).startsWith(TASK_PREFIX)) return false;
      return c.data.current?.columnId === overColumnUuid;
    });

    const taskCollisions = closestCorners({
      ...args,
      droppableContainers: tasksInThisColumn,
    });

    if (taskCollisions.length > 0) return taskCollisions;

    // Otherwise, return the column we are hovering or are closest to.
    return columnCollisions;
  }

  // Fallback to closestCorners for cases where no column is found
  return closestCorners(args);
};

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
      coordinateGetter: sortableKeyboardCoordinates,
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
    collisionDetection,
    onDragCancel,
    onDragStart,
    onDragOver,
    onDragEnd,
  };
}
