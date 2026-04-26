'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { useKanbanActions } from '../../context/kanban-context';
import type { Column } from '../../context/kanban.types';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

type DeleteColumnDialogProps = { boardId: string; column: Column };

export const DeleteColumnDialog = ({ boardId, column }: DeleteColumnDialogProps) => {
  const { deleteColumn } = useKanbanActions();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size='icon-sm'
          variant='ghost'
          aria-label={`Delete ${column.name} column`}
          className='touch-none hover:text-destructive hover:bg-destructive/10!'
        >
          <Trash2 aria-hidden />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className='p-6 md:p-8 md:pb-10'>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-destructive'>
            Delete Column "{column.name}"?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this column? This action cannot be reversed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='gap-4'>
          <AlertDialogCancel size='lg' className='flex-1 rounded-full min-h-10'>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            size='lg'
            variant='destructive'
            onClick={() => deleteColumn(boardId, column.id)}
            className='flex-1 rounded-full min-h-10'
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
