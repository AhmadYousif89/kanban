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
} from '@/components/ui/alert-dialog';

import { useKanbanActions } from '../../context/kanban-context';
import type { Task } from '../../context/kanban.types';

type DeleteTaskDialogProps = {
  task: Task;
  open: boolean;
  onOpenChange(open: boolean): void;
};

export const DeleteTaskDialog = ({ task, open, onOpenChange }: DeleteTaskDialogProps) => {
  const { deleteTask } = useKanbanActions();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='p-6 md:p-8 md:pb-10'>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-destructive'>
            Delete Task "{task.title}"?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this task? This action cannot be reversed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='gap-4'>
          <AlertDialogCancel size='lg' className='flex-1 rounded-full min-h-10'>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            size='lg'
            variant='destructive'
            onClick={() => deleteTask(task.id)}
            className='flex-1 rounded-full min-h-10'
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
