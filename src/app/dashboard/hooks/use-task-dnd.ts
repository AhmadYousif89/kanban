'use client';

import { useCallback, useState } from 'react';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';

import type { Board } from '../context/kanban.types';
import { fromTaskDraggableId } from '../main/board.dnd';
import { findTaskLocation } from '../context/kanban.utils';
import { useKanbanActions } from '../context/kanban-context';
import { moveTaskInBoard, resolveOverColId, resolveTaskDropIndex } from './board-dnd-utils';

export function useTaskDnd({ board }: { board: Board | null }) {
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

      const overTaskId = overId ? fromTaskDraggableId(overId) : null;
      const overTaskLocation = overTaskId ? findTaskLocation(currentBoard, overTaskId) : null;
      const activeRect = active.rect.current.translated ?? active.rect.current.initial;
      const overRect = over?.rect ?? null;

      const targetTaskIndex = resolveTaskDropIndex({
        sourceColumnIndex: sourceLocation.columnIndex,
        targetColumnIndex,
        sourceTaskIndex: sourceLocation.taskIndex,
        targetTaskIndex: overTaskLocation?.taskIndex ?? 0,
        activeRect,
        overRect,
      });

      const nextPreviewBoard = moveTaskInBoard(
        currentBoard,
        draggingTaskId,
        targetColumnId,
        targetTaskIndex,
      );

      if (nextPreviewBoard !== currentBoard) setPreviewBoard(nextPreviewBoard);
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
