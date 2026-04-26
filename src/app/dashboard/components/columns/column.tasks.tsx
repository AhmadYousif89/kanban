'use client';

import { memo, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import type { Task } from '../../context/kanban.types';
import { toColumnDropId, toTaskDraggableId } from '../../main/board.dnd';
import { AddTaskDialog, TaskCard } from '../tasks';
import { Button } from '@/components/ui/button';
import { GripVertical } from 'lucide-react';

const SortableTaskItem = memo(({ task, columnId }: { task: Task; columnId: string }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: toTaskDraggableId(task.id),
    data: { type: 'task', taskId: task.id, columnId },
  });

  const dragHandle = useMemo(
    () => (
      <Button
        type='button'
        size='icon-xs'
        variant='ghost'
        ref={setActivatorNodeRef}
        aria-label={`Drag ${task.title} task`}
        className='absolute top-0 right-0 z-50 touch-none hover:bg-muted! cursor-grab active:cursor-grabbing'
        {...attributes}
        {...listeners}
      >
        <GripVertical aria-hidden className='size-4' />
      </Button>
    ),
    [attributes, listeners, setActivatorNodeRef, task.title],
  );

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && 'opacity-25')}
    >
      <TaskCard task={task} dragHandle={dragHandle} />
    </li>
  );
});

type ColumnTasksProps = {
  tasks: Task[];
  columnId: string;
  columnName?: string;
  isDropTarget: boolean;
  isTaskDragging: boolean;
};

export const ColumnTasks = ({
  tasks,
  columnId,
  columnName,
  isDropTarget,
  isTaskDragging,
}: ColumnTasksProps) => {
  return (
    <ul
      id={toColumnDropId(columnId)}
      className={cn(
        'flex min-h-24 flex-col gap-y-5 p-3 grow overflow-y-auto no-scrollbar max-h-[83svh] rounded-lg transition-colors',
        isTaskDragging && isDropTarget && 'bg-primary/10 ring-1 ring-primary/40',
      )}
    >
      {!tasks.length ? (
        <li className='grid grow place-content-center rounded-md border border-dashed border-black/25 dark:border-input px-3 py-4 select-none'>
          <AddTaskDialog
            columnName={columnName}
            triggerLabel='Add Task'
            triggerClassName='[&_span]:inline-flex w-28 h-10! [&_svg]:hidden'
          />
        </li>
      ) : null}

      {tasks.map((task) => (
        <SortableTaskItem key={task.id} task={task} columnId={columnId} />
      ))}
    </ul>
  );
};
