'use client';

import { useState } from 'react';
import { useFieldArray } from 'react-hook-form';
import { PlusIcon } from 'lucide-react';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useCustomForm,
} from '@/components/form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field';
import { CrossIcon } from '@/components/icons';
import { cn } from '@/lib/utils';
import { useActiveBoard, useKanbanActions } from '../../context/kanban-context';
import { MAX_SUBTASKS } from '../../context/kanban.utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createDefaultSubtask, taskSchema, type TaskFormValues } from './task.schema';

function createDefaultValues(status = ''): TaskFormValues {
  return {
    title: '',
    description: '',
    subtasks: [createDefaultSubtask()],
    status,
  };
}

type AddTaskDialogProps = {
  triggerLabel?: string;
  triggerClassName?: string;
  columnName?: string;
};

export const AddTaskDialog = ({
  triggerLabel = 'Add New Task',
  triggerClassName,
  columnName,
}: AddTaskDialogProps) => {
  const [open, setOpen] = useState(false);
  const activeBoard = useActiveBoard();
  const { saveTask } = useKanbanActions();

  const form = useCustomForm<TaskFormValues>({
    schema: taskSchema,
    defaultValues: createDefaultValues(activeBoard?.columns[0]?.name),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'subtasks',
  });
  const hasReachedSubtaskLimit = fields.length >= MAX_SUBTASKS;

  if (!activeBoard) return null;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) form.reset(createDefaultValues(columnName ?? activeBoard.columns[0].name));
  };

  const handleSubmit = (values: TaskFormValues) => {
    if (!activeBoard.columns.length) return;

    const selectedColumn =
      activeBoard.columns.find((column) => column.name === values.status) ?? activeBoard.columns[0];

    if (!selectedColumn) return;

    const title = values.title.trim();
    const description = values.description.trim();
    const subtasks = values.subtasks
      .slice(0, MAX_SUBTASKS)
      .map((subtask) => ({
        title: subtask.title.trim(),
        isCompleted: subtask.isCompleted,
      }))
      .filter((subtask) => subtask.title.length > 0);

    saveTask(activeBoard.id, selectedColumn.id, {
      title,
      description,
      status: selectedColumn.name,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
    });

    form.reset(createDefaultValues(activeBoard.columns[0].name));
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type='button'
          className={cn(
            'h-8 w-12 rounded-full p-0 md:h-12 md:w-41 md:px-4',
            !activeBoard.columns.length && 'opacity-50 pointer-events-none',
            triggerClassName,
          )}
          disabled={!activeBoard.columns.length}
        >
          <PlusIcon data-icon='inline-start' aria-hidden />
          <span className='hidden md:inline'>{triggerLabel}</span>
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton className='max-w-86 p-6'>
        <DialogHeader>
          <DialogTitle className='text-lg font-bold'>Add New Task</DialogTitle>
          <DialogDescription>
            Add task details, subtasks, and the column it should start in.
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
                        id='task-title'
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
                        id='task-description'
                        rows={4}
                        placeholder='e.g. Add support for the new dashboard widgets'
                        className='h-28 resize-none'
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
                              id={`subtask-${index}`}
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
                        <SelectTrigger id='task-status' className='hover:border-primary'>
                          <SelectValue placeholder='Select status' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position='popper' className='w-(--radix-select-trigger-width)'>
                        <SelectGroup className='p-2'>
                          {activeBoard.columns.map((column) => (
                            <SelectItem key={column.id} value={column.name}>
                              {column.name}
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
              Create Task
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
