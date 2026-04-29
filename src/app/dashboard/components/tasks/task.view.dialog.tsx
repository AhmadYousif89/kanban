'use client';

import { memo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

import { cn } from '@/lib/utils';
import type { Task } from '../../context/kanban.types';
import { useActiveBoard, useKanbanActions } from '../../context/kanban-context';
import { TaskActionsMenu } from './actions.menu';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type TaskViewDialogProps = {
  task: Task;
  open: boolean;
  onOpenChange(open: boolean): void;
};

export const TaskViewDialog = memo(({ task, open, onOpenChange }: TaskViewDialogProps) => {
  const board = useActiveBoard();
  const { moveTask, toggleSubtask } = useKanbanActions();

  if (!board) return null;

  const completedSubtasks = task.subtasks.filter((subtask) => subtask.isCompleted);

  const handleStatusChange = (nextStatus: string) => {
    if (nextStatus === task.status) return;
    const destinationColumn = board.columns.find((column) => column.name === nextStatus);
    if (!destinationColumn) return;
    moveTask(task.id, board.id, destinationColumn.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='p-6 pb-8'>
        <div className='flex items-start justify-between gap-6'>
          <DialogHeader className='gap-6'>
            <DialogTitle className='text-lg font-bold'>{task.title}</DialogTitle>
            <DialogDescription className='text-[13px] leading-6 text-balance'>
              {task.description ? <>{task.description}</> : 'No description provided.'}
            </DialogDescription>
          </DialogHeader>
          <TaskActionsMenu task={task} />
        </div>

        <div className='grid gap-6'>
          <p className='text-xs font-bold text-muted-foreground dark:text-white'>
            Subtasks ({completedSubtasks.length} of {task.subtasks.length})
          </p>
          {task.subtasks.length ? (
            <ul className='flex flex-col gap-2'>
              {task.subtasks.map((subtask) => {
                const checkboxId = `${task.id}-${subtask.id}`;
                return (
                  <li key={subtask.id}>
                    <Label
                      htmlFor={checkboxId}
                      className={cn(
                        'bg-background dark:muted hover:bg-primary/25 rounded-lg px-3 py-3 text-foreground transition cursor-pointer',
                        subtask.isCompleted && 'text-muted-foreground line-through',
                      )}
                    >
                      <Checkbox
                        id={checkboxId}
                        checked={subtask.isCompleted}
                        onCheckedChange={(checked) =>
                          toggleSubtask(task.id, subtask.id, checked === true)
                        }
                        className='rounded data-checked:border-0'
                      />
                      <span className='text-xs font-bold'>{subtask.title}</span>
                    </Label>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className='text-sm text-muted-foreground'>This task does not have subtasks.</p>
          )}
        </div>

        <div className='grid gap-6'>
          <p className='text-xs font-bold'>Current Status</p>
          <Select value={task.status} onValueChange={handleStatusChange}>
            <SelectTrigger id='task-status' className='hover:border-primary w-full'>
              <SelectValue placeholder='Select status' />
            </SelectTrigger>
            <SelectContent position='popper' className='w-(--radix-select-trigger-width)'>
              <SelectGroup className='p-2'>
                {board.columns.map((column) => (
                  <SelectItem key={column.id} value={column.name}>
                    {column.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </DialogContent>
    </Dialog>
  );
});
