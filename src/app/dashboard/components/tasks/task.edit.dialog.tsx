'use client';

import { Controller, useFieldArray, useForm } from 'react-hook-form';

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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
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

import type { Task } from '../../context/kanban.types';
import { useActiveBoard, useKanbanActions } from '../../context/kanban-context';
import { MAX_SUBTASKS } from '../../context/kanban.utils';

type TaskFormValues = {
  title: string;
  description: string;
  status: string;
  subtasks: { title: string; isCompleted: boolean }[];
};

type EditTaskDialogProps = {
  task: Task;
  open: boolean;
  onOpenChange(open: boolean): void;
};

const defaultSubtask = { title: '', isCompleted: false };

function createDefaultValues(task: Task, status = task.status): TaskFormValues {
  return {
    title: task.title,
    description: task.description,
    status,
    subtasks:
      task.subtasks?.length > 0
        ? task.subtasks.slice(0, MAX_SUBTASKS).map((subtask) => ({
            title: subtask.title,
            isCompleted: subtask.isCompleted,
          }))
        : [{ ...defaultSubtask }],
  };
}

export const EditTaskDialog = ({ task, open, onOpenChange }: EditTaskDialogProps) => {
  const board = useActiveBoard();
  const { saveTask } = useKanbanActions();
  const form = useForm<TaskFormValues>({
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
    if (nextOpen) form.reset(createDefaultValues(task));
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

        <form onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-col gap-6'>
          <FieldSet>
            <FieldLegend className='font-bold text-muted-foreground dark:text-white'>
              Task Name
            </FieldLegend>
            <FieldGroup className='gap-3'>
              <Controller
                name='title'
                control={form.control}
                rules={{
                  required: 'Task name is required.',
                  minLength: {
                    value: 3,
                    message: 'Task name must be at least 3 characters.',
                  },
                  maxLength: {
                    value: 50,
                    message: 'Task name must be at most 50 characters.',
                  },
                }}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className='gap-2'>
                    <FieldLabel htmlFor='task-title-edit' className='sr-only'>
                      Task Name
                    </FieldLabel>
                    <Input
                      {...field}
                      type='text'
                      id='task-title-edit'
                      placeholder='e.g. Design system updates'
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend className='font-bold text-muted-foreground dark:text-white'>
              Description
            </FieldLegend>
            <FieldGroup className='gap-3'>
              <Controller
                name='description'
                control={form.control}
                render={({ field }) => (
                  <Field className='gap-2'>
                    <FieldLabel htmlFor='task-description-edit' className='sr-only'>
                      Description
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id='task-description-edit'
                      rows={4}
                      placeholder='e.g. Add support for the new dashboard widgets'
                      className='max-h-28'
                    />
                  </Field>
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
                  <Controller
                    key={field.id}
                    name={`subtasks.${index}.title`}
                    control={form.control}
                    rules={index === 0 ? { required: 'Subtask name is required.' } : undefined}
                    render={({ field: subtaskField, fieldState }) => (
                      <Field data-invalid={fieldState.invalid} className='gap-2'>
                        <FieldLabel htmlFor={`task-edit-subtask-${index}`} className='sr-only'>
                          Subtask Name
                        </FieldLabel>
                        <div className='flex items-center gap-2'>
                          <Input
                            {...subtaskField}
                            id={`task-edit-subtask-${index}`}
                            type='text'
                            placeholder={index === 0 ? 'e.g. Draft wireframes' : ''}
                            aria-invalid={fieldState.invalid}
                          />
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
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
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
                  onClick={() => append({ ...defaultSubtask })}
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
              <Controller
                name='status'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className='gap-2'>
                    <FieldLabel htmlFor='task-status-edit' className='sr-only'>
                      Task Status
                    </FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id='task-status-edit'>
                        <SelectValue placeholder='Select status' />
                      </SelectTrigger>
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
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>

          <DialogFooter>
            <Button type='submit' className='rounded-full w-full'>
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
