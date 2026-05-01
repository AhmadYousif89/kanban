'use client';

import { useCallback, useState } from 'react';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';

import type { Board } from '../context/kanban.types';
import { fromTaskDraggableId } from '../main/board.dnd';
import { findTaskLocation } from '../context/kanban.utils';
import { useKanbanActions } from '../context/kanban-context';
import { moveTaskInBoard, resolveOverColId } from './board-dnd-utils';

type UseTaskDndOptions = {
  board: Board | null;
};

export function useTaskDnd({ board }: UseTaskDndOptions) {
  const { moveTask } = useKanbanActions();
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [previewBoard, setPreviewBoard] = useState<Board | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);

  const onDragCancel = useCallback(() => {
    setActiveTaskId(null);
    setPreviewBoard(null);
    setOverColumnId(null);
  }, []);

  const onDragStart = useCallback(
    ({ active }: DragStartEvent) => {
      if (!board) return;

      const taskId = fromTaskDraggableId(String(active.id));

      if (!taskId) return;

      setActiveTaskId(taskId);
      setPreviewBoard(board ? { ...board, columns: [...board.columns] } : null);
      setOverColumnId(null);
    },
    [board],
  );

  const onDragOver = useCallback(
    ({ active, over }: DragOverEvent) => {
      if (!board) return;

      const taskId = fromTaskDraggableId(String(active.id));

      if (!taskId) return;

      if (!activeTaskId) {
        setActiveTaskId(taskId);
      }

      if (activeTaskId && taskId !== activeTaskId) return;

      const draggingTaskId = activeTaskId ?? taskId;

      const currentBoard =
        previewBoard ?? (board ? { ...board, columns: [...board.columns] } : null);
      if (!currentBoard) return;
      const overId = over ? String(over.id) : null;
      const targetColumnId = resolveOverColId(currentBoard, overId);

      setOverColumnId(targetColumnId);

      if (!targetColumnId) return;

      const sourceLocation = findTaskLocation(currentBoard, draggingTaskId);

      if (!sourceLocation) return;

      const targetColumnIndex = currentBoard.columns.findIndex(
        (column) => column.id === targetColumnId,
      );

      if (targetColumnIndex === -1) return;

      const targetColumn = currentBoard.columns[targetColumnIndex];
      const overTaskId = overId ? fromTaskDraggableId(overId) : null;
      const overTaskLocation = overTaskId ? findTaskLocation(currentBoard, overTaskId) : null;
      const isSameColumnHover =
        overTaskLocation != null && sourceLocation.columnIndex === targetColumnIndex;
      const isAdjacentSwap =
        isSameColumnHover && Math.abs(sourceLocation.taskIndex - overTaskLocation.taskIndex) === 1;

      const targetTaskIndex = (() => {
        if (overTaskLocation == null) {
          return targetColumn.tasks.length;
        }

        if (isAdjacentSwap) {
          return sourceLocation.taskIndex < overTaskLocation.taskIndex
            ? overTaskLocation.taskIndex + 1
            : overTaskLocation.taskIndex;
        }

        const activeRect = active.rect.current.translated ?? active.rect.current.initial;
        const overRect = over?.rect;
        const isSameColumnBottomDrop =
          sourceLocation.columnIndex === targetColumnIndex &&
          overTaskLocation.taskIndex === targetColumn.tasks.length - 1 &&
          sourceLocation.taskIndex < overTaskLocation.taskIndex;
        const shouldInsertAfterTask =
          isSameColumnBottomDrop ||
          (activeRect != null &&
            overRect != null &&
            activeRect.top + activeRect.height / 2 > overRect.top + overRect.height / 2);

        return overTaskLocation.taskIndex + (shouldInsertAfterTask ? 1 : 0);
      })();

      const nextPreviewBoard = moveTaskInBoard(
        currentBoard,
        draggingTaskId,
        targetColumnId,
        targetTaskIndex,
      );

      if (nextPreviewBoard !== currentBoard) {
        setPreviewBoard(nextPreviewBoard);
      }
    },
    [activeTaskId, board, previewBoard],
  );

  const onDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      if (!board) {
        onDragCancel();
        return;
      }

      const taskId = fromTaskDraggableId(String(active.id));

      if (!taskId || !over) {
        onDragCancel();
        return;
      }

      const sourceLocation = findTaskLocation(board, taskId);
      const finalBoard = previewBoard ?? board;
      const targetLocation = findTaskLocation(finalBoard, taskId);

      if (!sourceLocation || !targetLocation) {
        onDragCancel();
        return;
      }

      const isLocationChanged =
        sourceLocation.columnIndex !== targetLocation.columnIndex ||
        sourceLocation.taskIndex !== targetLocation.taskIndex;

      if (isLocationChanged) {
        const destinationColumnId = finalBoard.columns[targetLocation.columnIndex]?.id;

        if (destinationColumnId) {
          moveTask(taskId, board.id, destinationColumnId, targetLocation.taskIndex);
        }
      }

      onDragCancel();
    },
    [board, moveTask, onDragCancel, previewBoard],
  );

  return {
    activeTaskId,
    isTaskDragging: activeTaskId !== null,
    overColumnId,
    previewBoard,
    onDragCancel,
    onDragEnd,
    onDragOver,
    onDragStart,
  };
}
