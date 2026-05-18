'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import { GripVertical } from 'lucide-react';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';

import { cn } from '@/lib/utils';
import { ColumnTasks } from './column.tasks';
import { ColumnHeader } from './column.header';
import { EditColumnDialog } from './column.edit.dialog';
import type { Column } from '../../context/kanban.types';
import { toColumnDraggableId, toColumnDropId, toTaskDraggableId } from '../../main/board.dnd';
import { Button } from '@/components/ui/button';

type SortableColumnProps = {
  column: Column;
  isDropTarget: boolean;
  isTaskDragging: boolean;
  setColumnRef?(columnId: string, node: HTMLLIElement | null): void;
};

export const SortableColumn = memo(
  ({ column, isDropTarget, isTaskDragging, setColumnRef }: SortableColumnProps) => {
    const [editOpen, setEditOpen] = useState(false);
    const {
      listeners,
      transform,
      transition,
      isDragging,
      setActivatorNodeRef,
      setNodeRef: setSortableNodeRef,
    } = useSortable({
      id: toColumnDraggableId(column.id),
      data: { type: 'column', columnId: column.id },
    });

    const { setNodeRef: setDroppableNodeRef } = useDroppable({
      id: toColumnDropId(column.id),
      data: { type: 'column-drop', columnId: column.id },
    });

    const setNodeRef = (node: HTMLLIElement | null) => {
      setSortableNodeRef(node);
      setDroppableNodeRef(node);
      setColumnRef?.(column.id, node);
    };

    const onEdit = useCallback(() => setEditOpen(true), []);

    const dragHandle = useMemo(
      () => (
        <Button
          type='button'
          size='icon-xs'
          variant='ghost'
          ref={setActivatorNodeRef}
          aria-label={`Drag ${column.name} column`}
          className='touch-none hover:text-foreground hover:bg-accent/25! cursor-grab active:cursor-grabbing'
          {...listeners}
        >
          <GripVertical aria-hidden className='size-4' />
        </Button>
      ),
      [listeners, setActivatorNodeRef, column.name],
    );

    const memoItems = useMemo(
      () => column.tasks.map((task) => toTaskDraggableId(task.id)),
      [column.tasks],
    );

    return (
      <li
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        className={cn(
          'flex w-70 shrink-0 flex-col gap-3 rounded-lg transition-colors h-full',
          isDragging && 'bg-accent/10 opacity-25',
          !isTaskDragging && isDropTarget && 'bg-primary/10',
        )}
      >
        <ColumnHeader
          name={column.name}
          accentColor={column.color}
          taskCount={column.tasks.length}
          dragHandle={dragHandle}
          onEdit={onEdit}
        />
        <SortableContext items={memoItems} strategy={verticalListSortingStrategy}>
          <ColumnTasks
            tasks={column.tasks}
            columnId={column.id}
            columnName={column.name}
            isDropTarget={isDropTarget}
            isTaskDragging={isTaskDragging}
          />
        </SortableContext>

        {editOpen && (
          <EditColumnDialog column={column} open={editOpen} onOpenChange={setEditOpen} />
        )}
      </li>
    );
  },
);
