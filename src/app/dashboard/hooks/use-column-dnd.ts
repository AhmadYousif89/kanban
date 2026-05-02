'use client';

import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useCallback, useState } from 'react';

import type { Board } from '../context/kanban.types';
import { useKanbanActions } from '../context/kanban-context';
import { fromColumnDraggableId } from '../main/board.dnd';
import { resolveOverColId } from './board-dnd-utils';

export function useColumnDnd({ board }: { board: Board | null }) {
  const { moveColumn } = useKanbanActions();
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

  const onDragCancel = useCallback(() => setActiveColumnId(null), []);

  const onDragStart = useCallback(({ active }: DragStartEvent) => {
    const columnId = fromColumnDraggableId(String(active.id));
    setActiveColumnId(columnId);
  }, []);

  const onDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      if (!board || !activeColumnId) {
        onDragCancel();
        return;
      }

      const sourceColumnId = fromColumnDraggableId(String(active.id)) ?? activeColumnId;
      const targetColumnId = resolveOverColId(board, over ? String(over.id) : null);

      if (!sourceColumnId || !targetColumnId || sourceColumnId === targetColumnId) {
        onDragCancel();
        return;
      }

      const toIndex = board.columns.findIndex((column) => column.id === targetColumnId);

      if (toIndex !== -1) moveColumn(board.id, sourceColumnId, toIndex);

      onDragCancel();
    },
    [activeColumnId, board, moveColumn, onDragCancel],
  );

  return {
    activeColumnId,
    onDragCancel,
    onDragEnd,
    onDragStart,
  };
}
