'use client';

import { useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { VerticalEllipsisIcon } from '@/components/icons';
import type { Task } from '../../context/kanban.types';
import { DeleteTaskDialog, EditTaskDialog } from '.';

export const TaskActionsMenu = ({ task }: { task: Task }) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger type='button' asChild>
          <Button
            size='icon'
            variant='ghost'
            className='rounded-xs w-3 hover:bg-transparent! aria-expanded:bg-transparent'
          >
            <span className='sr-only'>Task actions</span>
            <VerticalEllipsisIcon aria-hidden className='group-hover/button:*:fill-current' />
          </Button>
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
