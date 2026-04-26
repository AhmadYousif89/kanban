'use client';

import type { ReactNode } from 'react';

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

type DeleteColumnDialogProps = {
  boardId: string;
  column: Column;
  open?: boolean;
  onOpenChange?(open: boolean): void;
  onDelete?(): void;
  trigger?: ReactNode;
};

export const DeleteColumnDialog = ({
  boardId,
  column,
  open,
  onOpenChange,
  onDelete,
  trigger,
}: DeleteColumnDialogProps) => {
  const { deleteColumn } = useKanbanActions();
  const taskCount = column.tasks.length;
  const hasTasks = taskCount > 0;
  const taskLabel = taskCount === 1 ? 'task' : 'tasks';

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      return;
    }

    deleteColumn(boardId, column.id);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger !== undefined ? (
        trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      ) : (
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
      )}
      <AlertDialogContent className='p-6 md:p-8 md:pb-10'>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-destructive'>
            {hasTasks
              ? `Delete "${column.name}" and ${taskCount} ${taskLabel}?`
              : `Delete Column "${column.name}"?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {hasTasks
              ? `This column contains ${taskCount} ${taskLabel}. Deleting it will permanently remove the column and all ${taskLabel} inside it.`
              : 'Are you sure? This action cannot be reversed.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='gap-4'>
          <AlertDialogCancel size='lg' className='flex-1 rounded-full min-h-10'>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            size='lg'
            variant='destructive'
            onClick={handleDelete}
            className='flex-1 rounded-full min-h-10'
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
