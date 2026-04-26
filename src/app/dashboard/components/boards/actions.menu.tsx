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
import { useActiveBoard } from '../../context/kanban-context';
import { DeleteBoardDialog, EditBoardDialog } from '.';

export const BoardActionsMenu = () => {
  const board = useActiveBoard();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!board) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger type='button' asChild>
          <Button
            size='icon'
            variant='ghost'
            className='rounded-xs w-3 hover:bg-transparent! aria-expanded:bg-transparent'
          >
            <span className='sr-only'>Board actions</span>
            <VerticalEllipsisIcon aria-hidden className='group-hover/button:*:fill-current' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='end'
          sideOffset={16}
          className='min-w-48 p-2 space-y-1.5 rounded-lg dark:bg-muted'
        >
          <DropdownMenuItem
            onSelect={() => setEditOpen(true)}
            className='text-[13px] font-medium text-muted-foreground'
          >
            Edit Board
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setDeleteOpen(true)}
            className='text-[13px] font-medium text-destructive'
          >
            Delete Board
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditBoardDialog open={editOpen} onOpenChange={setEditOpen} />
      <DeleteBoardDialog open={deleteOpen} onOpenChange={setDeleteOpen} />
    </>
  );
};
