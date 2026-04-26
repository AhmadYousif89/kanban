'use client';

import { memo, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import type { Task } from '../../context/kanban.types';
import { getProgressLabel } from '../../context/kanban.utils';
import { TaskViewDialog } from '.';

const TaskCardBody = ({ task }: { task: Task }) => {
  const completedSubtasksCount = useMemo(
    () => task.subtasks.filter((subtask) => subtask.isCompleted).length,
    [task.subtasks],
  );

  return (
    <>
      <span className='text-[15px] font-bold leading-4 text-foreground'>{task.title}</span>
      <span className='mt-2 text-xs font-bold text-muted-foreground'>
        {getProgressLabel(completedSubtasksCount, task.subtasks.length)}
      </span>
    </>
  );
};

export const TaskCard = memo(({ task, dragHandle }: { task: Task; dragHandle?: ReactNode }) => {
  const [viewOpen, setViewOpen] = useState(false);

  return (
    <div className='relative'>
      {dragHandle}
      <button
        type='button'
        className={cn(
          'group flex w-full flex-col items-start rounded-lg bg-card px-4 py-6 text-left drop-shadow-lg drop-shadow-primary/10 transition duration-0 not-focus-visible:duration-300 hover:drop-shadow-primary/25 cursor-pointer',
          'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-ring/50 outline-0',
        )}
        onClick={() => setViewOpen(true)}
      >
        <TaskCardBody task={task} />
      </button>

      <TaskViewDialog task={task} open={viewOpen} onOpenChange={setViewOpen} />
    </div>
  );
});

export const TaskCardPreview = ({ task, className }: { task: Task; className?: string }) => {
  return (
    <div
      className={cn(
        'flex w-full flex-col items-start rounded-lg bg-card px-4 py-6 text-left drop-shadow-lg drop-shadow-primary/25',
        className,
      )}
    >
      <TaskCardBody task={task} />
    </div>
  );
};
