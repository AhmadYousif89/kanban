'use client';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useCustomForm,
} from '@/components/form';
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
import type { Task } from '../../context/kanban.types';
import { MAX_SUBTASKS } from '../../context/kanban.utils';
import { useActiveBoard, useKanbanActions } from '../../context/kanban-context';
import { useLimitedFieldArray } from '../../hooks/use-limited-field-array';
import { FieldArrayList } from '../field-array-list';
import { createDefaultSubtask, type TaskFormValues, taskSchema } from './task.schema';

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

  const { fields, addItem, hasReachedLimit, remove } = useLimitedFieldArray({
    control: form.control,
    name: 'subtasks',
    maxItems: MAX_SUBTASKS,
    createItem: () => createDefaultSubtask(),
  });

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
              <FieldArrayList
                fields={fields}
                limitExceeded={hasReachedLimit}
                limitMessage={`Maximum of ${MAX_SUBTASKS} subtasks allowed.`}
                addLabel='+ Add New Subtask'
                onAdd={addItem}
                onRemove={remove}
                className='max-md:max-h-32 max-md:overflow-y-auto max-md:no-scrollbar max-md:p-1'
                renderItem={(field, index, { canRemove, remove: removeSubtask }) => (
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
                          {canRemove && (
                            <Button
                              type='button'
                              size='icon-sm'
                              variant='ghost'
                              className='hover:bg-transparent! hover:**:fill-destructive active:**:fill-destructive active:bg-background'
                              onClick={removeSubtask}
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
                )}
              />
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
