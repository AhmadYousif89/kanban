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
import { useActiveBoard, useKanbanActions } from '../../context/kanban-context';

type DeleteBoardDialogProps = {
  open: boolean;
  onOpenChange(open: boolean): void;
};

export const DeleteBoardDialog = ({ open, onOpenChange }: DeleteBoardDialogProps) => {
  const activeBoard = useActiveBoard();
  const { deleteBoard } = useKanbanActions();

  if (!activeBoard) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='p-6 md:p-8 md:pb-10'>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-destructive'>
            Delete Board "{activeBoard.name}"?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this board? This action will remove all columns and
            tasks and cannot be reversed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='gap-4'>
          <AlertDialogCancel size='lg' className='flex-1 rounded-full min-h-10'>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            size='lg'
            variant='destructive'
            onClick={() => deleteBoard(activeBoard.id)}
            className='flex-1 rounded-full min-h-10'
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
