'use client';

import { useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { VerticalEllipsisIcon } from '@/components/icons';
import { DeleteTaskDialog, EditTaskDialog } from '.';
import type { Task } from '../../context/kanban.types';
import { cn } from '@/lib/utils';

export const TaskActionsMenu = ({ task }: { task: Task }) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          type='button'
          className={cn(
            'group p-1 cursor-pointer transition',
            'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-ring/50 outline-0',
          )}
        >
          <span className='sr-only'>Task actions</span>
          <VerticalEllipsisIcon aria-hidden className='group-hover:*:fill-foreground' />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='end'
          className='min-w-48 p-2 space-y-1.5 rounded-lg dark:bg-muted'
        >
          <DropdownMenuItem
            onSelect={() => setEditOpen(true)}
            className='text-[13px] font-medium text-muted-foreground'
          >
            Edit Task
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setDeleteOpen(true)}
            className='text-[13px] font-medium text-destructive'
          >
            Delete Task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditTaskDialog open={editOpen} onOpenChange={setEditOpen} task={task} />
      <DeleteTaskDialog open={deleteOpen} onOpenChange={setDeleteOpen} task={task} />
    </>
  );
};
