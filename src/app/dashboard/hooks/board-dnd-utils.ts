import type {
  CollisionDetection,
  DroppableContainer,
  KeyboardCoordinateGetter,
} from '@dnd-kit/core';
import {
  closestCenter,
  closestCorners,
  getFirstCollision,
  KeyboardCode,
  pointerWithin,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

import type { Board } from '../context/kanban.types';
import { findTaskLocation } from '../context/kanban.utils';
import {
  COLUMN_DROP_PREFIX,
  fromColumnDraggableId,
  fromColumnDropId,
  fromTaskDraggableId,
  TASK_PREFIX,
} from '../main/board.dnd';

const clampIndex = (index: number, max: number) => Math.min(Math.max(index, 0), max);

type RectLike = {
  top: number;
  height: number;
};

type ResolveTaskDropIndexArgs = {
  sourceColumnIndex: number;
  sourceTaskIndex: number;
  targetColumnIndex: number;
  targetTaskIndex: number;
  activeRect: RectLike | null;
  overRect: RectLike | null;
};

export const resolveTaskDropIndex = ({
  sourceColumnIndex,
  sourceTaskIndex,
  targetColumnIndex,
  targetTaskIndex,
  activeRect,
  overRect,
}: ResolveTaskDropIndexArgs) => {
  if (targetTaskIndex === 0) return 0;

  const isSameColumnHover = sourceColumnIndex === targetColumnIndex;
  const isAdjacentSwap = isSameColumnHover && Math.abs(sourceTaskIndex - targetTaskIndex) === 1;

  if (isAdjacentSwap)
    return sourceTaskIndex < targetTaskIndex ? targetTaskIndex + 1 : targetTaskIndex;

  const shouldInsertAfterTask =
    activeRect != null &&
    overRect != null &&
    activeRect.top + activeRect.height / 2 > overRect.top + overRect.height / 2;

  return targetTaskIndex + (shouldInsertAfterTask ? 1 : 0);
};

export const resolveOverColId = (board: Board, overId: string | null): string | null => {
  if (!overId) return null;

  const columnId = fromColumnDraggableId(overId);

  if (columnId) return columnId;

  const droppedColumnId = fromColumnDropId(overId);

  if (droppedColumnId) return droppedColumnId;

  const taskId = fromTaskDraggableId(overId);

  if (!taskId) return null;

  const taskLocation = findTaskLocation(board, taskId);

  return taskLocation ? (board.columns[taskLocation.columnIndex]?.id ?? null) : null;
};

export const moveTaskInBoard = (
  board: Board,
  taskId: string,
  toColumnId: string,
  toIndex: number,
) => {
  const sourceLocation = findTaskLocation(board, taskId);

  if (!sourceLocation) return board;
  const targetColumnIdx = board.columns.findIndex((column) => column.id === toColumnId);

  if (targetColumnIdx === -1) return board;

  const destinationColumn = board.columns[targetColumnIdx];
  let insertIndex = clampIndex(toIndex, destinationColumn.tasks.length);

  if (sourceLocation.columnIndex === targetColumnIdx && sourceLocation.taskIndex < insertIndex) {
    insertIndex -= 1;
  }

  if (sourceLocation.columnIndex === targetColumnIdx && sourceLocation.taskIndex === insertIndex) {
    return board;
  }

  const nextBoard: Board = {
    ...board,
    columns: board.columns.map((column, idx) => {
      if (idx === sourceLocation.columnIndex || idx === targetColumnIdx) {
        return { ...column, tasks: [...column.tasks] };
      }

      return column;
    }),
  };

  const sourceColumn = nextBoard.columns[sourceLocation.columnIndex];
  const nextDestinationColumn = nextBoard.columns[targetColumnIdx];
  const [task] = sourceColumn.tasks.splice(sourceLocation.taskIndex, 1);

  if (!task) return board;

  insertIndex = clampIndex(insertIndex, nextDestinationColumn.tasks.length);
  nextDestinationColumn.tasks.splice(insertIndex, 0, {
    ...task,
    status: nextDestinationColumn.name,
  });

  return nextBoard;
};

export const boardKeyboardCoordinates: KeyboardCoordinateGetter = (e, args) => {
  if (e.code !== KeyboardCode.Left && e.code !== KeyboardCode.Right) {
    return sortableKeyboardCoordinates(e, args);
  }

  const { active, collisionRect, droppableRects, droppableContainers, over } = args.context;

  e.preventDefault();

  if (!active || !collisionRect) return;

  const columnContainers: DroppableContainer[] = [];

  droppableContainers.getEnabled().forEach((entry) => {
    if (!entry || entry.disabled) return;

    const rect = droppableRects.get(entry.id);

    if (!rect) return;

    if (!String(entry.id).startsWith(COLUMN_DROP_PREFIX)) return;

    if (
      e.code === KeyboardCode.Left ? collisionRect.left > rect.left : collisionRect.left < rect.left
    ) {
      columnContainers.push(entry);
    }
  });

  const collisions = closestCenter({
    active,
    collisionRect,
    droppableRects,
    pointerCoordinates: null,
    droppableContainers: columnContainers,
  });

  let closestId = getFirstCollision(collisions, 'id');

  if (closestId === over?.id && collisions.length > 1) closestId = collisions[1].id;

  if (closestId == null) return;

  const nextRect = droppableRects.get(closestId);

  if (!nextRect) return;

  return {
    x: nextRect.left,
    y: nextRect.top,
  };
};

export const boardCollisionDetection: CollisionDetection = (args) => {
  const { pointerCoordinates, droppableContainers } = args;

  const getColumnRect = (containerId: string) =>
    args.droppableRects.get(containerId) ??
    droppableContainers.find((container) => container.id === containerId)?.rect.current ??
    null;

  const getCenterX = (rect: NonNullable<ReturnType<typeof getColumnRect>>) =>
    rect.left + rect.width / 2;

  const getKeyboardColumnCollisions = () => {
    const collisionCenterX = args.collisionRect.left + args.collisionRect.width / 2;
    const columns = droppableContainers.filter((container) =>
      String(container.id).startsWith(COLUMN_DROP_PREFIX),
    );

    let closestColId: string | null = null;
    let closestDistance = Number.POSITIVE_INFINITY;

    for (const col of columns) {
      const rect = getColumnRect(String(col.id));

      if (!rect) continue;

      const distance = Math.abs(getCenterX(rect) - collisionCenterX);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestColId = String(col.id);
      }
    }

    return closestColId ? [{ id: closestColId }] : [];
  };

  const columnCollisions = pointerCoordinates
    ? pointerWithin({
        ...args,
        droppableContainers: droppableContainers.filter((container) =>
          String(container.id).startsWith(COLUMN_DROP_PREFIX),
        ),
      })
    : getKeyboardColumnCollisions();

  if (columnCollisions.length > 0) {
    const overColId = String(columnCollisions[0].id);
    const overColUuid = fromColumnDropId(overColId);

    const tasksInThisColumn = droppableContainers.filter((container) => {
      if (!String(container.id).startsWith(TASK_PREFIX)) return false;
      return container.data.current?.columnId === overColUuid;
    });

    const taskCollisions = closestCorners({
      ...args,
      droppableContainers: tasksInThisColumn,
    });

    if (taskCollisions.length > 0) return taskCollisions;

    return columnCollisions;
  }

  return closestCorners(args);
};
