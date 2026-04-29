'use client';

import { useFieldArray } from 'react-hook-form';

import { CrossIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useCustomForm,
} from '@/components/form';

import type { Task } from '../../context/kanban.types';
import { useActiveBoard, useKanbanActions } from '../../context/kanban-context';
import { MAX_SUBTASKS } from '../../context/kanban.utils';
import { createDefaultSubtask, taskSchema, type TaskFormValues } from './task.schema';

type EditTaskDialogProps = {
  task: Task;
  open: boolean;
  onOpenChange(open: boolean): void;
};

function createDefaultValues(task: Task, status = task.status): TaskFormValues {
  const subtasks =
    task.subtasks?.length > 0
      ? task.subtasks.slice(0, MAX_SUBTASKS).map((subtask) => ({
          title: subtask.title,
          isCompleted: subtask.isCompleted,
        }))
      : [createDefaultSubtask()];

  return {
    title: task.title,
    description: task.description,
    status,
    subtasks,
  };
}

export const EditTaskDialog = ({ task, open, onOpenChange }: EditTaskDialogProps) => {
  const board = useActiveBoard();
  const { saveTask } = useKanbanActions();
  const form = useCustomForm<TaskFormValues>({
    schema: taskSchema,
    defaultValues: createDefaultValues(task),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'subtasks',
  });

  const hasReachedSubtaskLimit = fields.length >= MAX_SUBTASKS;

  if (!board) return null;

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    form.reset(createDefaultValues(task));
  };

  const handleSubmit = (values: TaskFormValues) => {
    if (!board.columns.length) return;

    const selectedColumn =
      board.columns.find((boardColumn) => boardColumn.name === values.status) ?? board.columns[0];

    const title = values.title.trim();
    const description = values.description.trim();
    const subtasks = values.subtasks
      .slice(0, MAX_SUBTASKS)
      .map((subtask) => ({
        title: subtask.title.trim(),
        isCompleted: subtask.isCompleted,
      }))
      .filter((subtask) => subtask.title.length > 0);

    saveTask(
      board.id,
      selectedColumn.id,
      {
        title,
        description,
        status: selectedColumn.name,
        subtasks: subtasks.length > 0 ? subtasks : undefined,
      },
      task.id,
    );

    form.reset(createDefaultValues(task, selectedColumn.name));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton className='max-w-86 p-6'>
        <DialogHeader>
          <DialogTitle className='text-lg font-bold'>Edit Task</DialogTitle>
          <DialogDescription>
            Update the task details, subtasks, and workflow status.
          </DialogDescription>
        </DialogHeader>

        <Form form={form} onSubmit={handleSubmit} className='flex flex-col gap-6'>
          <FieldSet>
            <FieldLegend className='font-bold text-muted-foreground dark:text-white'>
              Task Name
            </FieldLegend>
            <FieldGroup className='gap-3'>
              <FormField
                name='title'
                control={form.control}
                render={({ field }) => (
                  <FormItem className='gap-2'>
                    <FormLabel className='sr-only'>Task Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='text'
                        id='task-title-edit'
                        placeholder='e.g. Design system updates'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FieldGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend className='font-bold text-muted-foreground dark:text-white'>
              Description
            </FieldLegend>
            <FieldGroup className='gap-3'>
              <FormField
                name='description'
                control={form.control}
                render={({ field }) => (
                  <FormItem className='gap-2'>
                    <FormLabel className='sr-only'>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        id='task-description-edit'
                        rows={4}
                        placeholder='e.g. Add support for the new dashboard widgets'
                        className='max-h-28'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FieldGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend className='font-bold text-muted-foreground dark:text-white'>
              Subtasks
            </FieldLegend>
            <FieldGroup className='gap-3'>
              <div className='grid gap-3 max-md:max-h-32 max-md:overflow-y-auto max-md:no-scrollbar max-md:p-1'>
                {fields.map((field, index) => (
                  <FormField
                    key={field.id}
                    name={`subtasks.${index}.title`}
                    control={form.control}
                    rules={index === 0 ? { required: 'Subtask name is required.' } : undefined}
                    render={({ field: subtaskField }) => (
                      <FormItem className='gap-2'>
                        <FormLabel className='sr-only'>Subtask Name</FormLabel>
                        <div className='flex items-center gap-2'>
                          <FormControl>
                            <Input
                              {...subtaskField}
                              value={subtaskField.value ?? ''}
                              id={`task-edit-subtask-${index}`}
                              type='text'
                              placeholder={index === 0 ? 'e.g. Draft wireframes' : ''}
                            />
                          </FormControl>
                          {fields.length > 1 && (
                            <Button
                              type='button'
                              size='icon-sm'
                              variant='ghost'
                              className='hover:bg-transparent! hover:**:fill-destructive active:**:fill-destructive active:bg-background'
                              onClick={() => remove(index)}
                            >
                              <CrossIcon aria-hidden />
                              <span className='sr-only'>Remove subtask</span>
                            </Button>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              <div className='grid gap-2'>
                {hasReachedSubtaskLimit && (
                  <p className='text-center text-xs font-medium text-muted-foreground'>
                    Maximum of {MAX_SUBTASKS} subtasks allowed.
                  </p>
                )}
                <Button
                  type='button'
                  variant='secondary'
                  className='h-10 rounded-full'
                  disabled={hasReachedSubtaskLimit}
                  onClick={() => append(createDefaultSubtask())}
                >
                  + Add New Subtask
                </Button>
              </div>
            </FieldGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend className='font-bold text-muted-foreground dark:text-white'>
              Status
            </FieldLegend>
            <FieldGroup className='gap-3'>
              <FormField
                name='status'
                control={form.control}
                render={({ field }) => (
                  <FormItem className='gap-2'>
                    <FormLabel className='sr-only'>Task Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger id='task-status-edit'>
                          <SelectValue placeholder='Select status' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position='popper' className='w-(--radix-select-trigger-width)'>
                        <SelectGroup className='p-2'>
                          {board.columns.map((boardColumn) => (
                            <SelectItem key={boardColumn.id} value={boardColumn.name}>
                              {boardColumn.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FieldGroup>
          </FieldSet>

          <DialogFooter>
            <Button type='submit' className='rounded-full w-full'>
              Save Changes
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
