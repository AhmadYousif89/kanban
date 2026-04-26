'use client';

import { useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';

import { BoardIcon, CrossIcon } from '@/components/icons';
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useKanbanActions } from '../../context/kanban-context';
import { columnColorOptions, MAX_COLUMNS } from '../../context/kanban.utils';
import { ColumnColorPicker } from '../columns/column.color-picker';
import { useColorPickerDialogGuard } from '../../hooks/use-color-picker-dialog-guard';

type BoardFormValues = {
  name: string;
  columns: { name: string; color: string }[];
};

const defaultValues: BoardFormValues = {
  name: '',
  columns: [{ name: '', color: columnColorOptions[0] }],
};

type AddBoardDialogProps = {
  triggerClassName?: string;
  triggerLabel?: string;
};

export const AddBoardDialog = ({
  triggerClassName,
  triggerLabel = '+ Create New Board',
}: AddBoardDialogProps) => {
  const [open, setOpen] = useState(false);
  const { saveBoard } = useKanbanActions();
  const { clearGuard, onColorPickerChange, preventDialogDismissal } = useColorPickerDialogGuard();

  const form = useForm<BoardFormValues>({ defaultValues });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'columns',
  });
  const hasReachedColumnLimit = fields.length >= MAX_COLUMNS;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) clearGuard();
    if (nextOpen) form.reset(defaultValues);
  };

  const handleSubmit = (values: BoardFormValues) => {
    saveBoard({
      name: values.name.trim(),
      columns: values.columns.slice(0, MAX_COLUMNS).map((column) => ({
        name: column.name.trim(),
        color: column.color,
      })),
    });

    form.reset(defaultValues);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type='button'
          variant='ghost'
          className={cn(
            'justify-start pl-6 text-primary rounded-r-full w-full text-[15px] font-bold',
            'md:gap-3 hover:bg-primary/10 dark:hover:bg-white',
            'data-open:bg-accent data-open:text-white dark:data-open:bg-white dark:data-open:text-primary',
            triggerClassName,
          )}
        >
          <BoardIcon aria-hidden className='*:fill-current' />
          <span>{triggerLabel}</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton
        className='p-6'
        onEscapeKeyDown={preventDialogDismissal}
        onPointerDownOutside={preventDialogDismissal}
        onInteractOutside={preventDialogDismissal}
      >
        <DialogHeader>
          <DialogTitle className='font-bold text-lg'>Add New Board</DialogTitle>
          <DialogDescription>
            You can customize it with label and columns to fit your workflow.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-col gap-6'>
          <FieldSet>
            <FieldLegend className='font-bold text-muted-foreground dark:text-white'>
              Board Name
            </FieldLegend>
            <FieldGroup className='gap-3'>
              <Controller
                name='name'
                control={form.control}
                rules={{
                  required: 'Board name is required.',
                  minLength: {
                    value: 3,
                    message: 'Board name must be at least 3 characters.',
                  },
                  maxLength: {
                    value: 50,
                    message: 'Board name must be at most 50 characters.',
                  },
                  validate: (value) => value === value.trim() || 'Board name cannot be empty',
                }}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className='gap-2'>
                    <FieldLabel htmlFor='board-name' className='sr-only'>
                      Board Name
                    </FieldLabel>
                    <Input
                      {...field}
                      type='text'
                      id='board-name'
                      placeholder='e.g. Web Design'
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
              Board Columns
            </FieldLegend>
            <FieldGroup className='gap-3'>
              <div className='grid gap-3 max-md:max-h-54 max-md:overflow-y-auto max-md:no-scrollbar max-md:p-1'>
                {fields.map((field, index) => (
                  <Controller
                    key={field.id}
                    name={`columns.${index}.name`}
                    control={form.control}
                    rules={
                      index === 0
                        ? {
                            required: 'Column name is required.',
                            validate: (value) =>
                              value === value.trim() ||
                              'Column name cannot start or end with spaces.',
                          }
                        : undefined
                    }
                    render={({ field: columnField, fieldState }) => (
                      <Field data-invalid={fieldState.invalid} className='gap-2'>
                        <FieldLabel htmlFor={`column-${index}`} className='sr-only'>
                          Board Column Name
                        </FieldLabel>
                        <div className='flex items-center gap-2'>
                          <InputGroup>
                            <InputGroupInput
                              {...columnField}
                              id={`column-${index}`}
                              type='text'
                              placeholder={index === 0 ? 'e.g. Todo, In Progress' : ''}
                              aria-invalid={fieldState.invalid}
                            />
                            <Controller
                              name={`columns.${index}.color`}
                              control={form.control}
                              render={({ field: colorField }) => (
                                <ColumnColorPicker
                                  value={colorField.value}
                                  onChange={colorField.onChange}
                                  onOpenChange={onColorPickerChange}
                                  onDismiss={clearGuard}
                                />
                              )}
                            />
                          </InputGroup>
                          {fields.length > 1 && (
                            <Button
                              type='button'
                              size='icon-sm'
                              variant='ghost'
                              className='hover:bg-transparent! hover:**:fill-destructive active:**:fill-destructive active:bg-background'
                              onClick={() => remove(index)}
                            >
                              <CrossIcon aria-hidden />
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
                {hasReachedColumnLimit && (
                  <p className='text-center text-xs font-medium text-muted-foreground'>
                    Maximum of {MAX_COLUMNS} columns allowed per board.
                  </p>
                )}
                <Button
                  type='button'
                  variant='secondary'
                  className='h-10 rounded-full'
                  disabled={hasReachedColumnLimit}
                  onClick={() =>
                    append({
                      name: '',
                      color: columnColorOptions[fields.length % columnColorOptions.length],
                    })
                  }
                >
                  + Add New Column
                </Button>
              </div>
            </FieldGroup>
          </FieldSet>

          <DialogFooter>
            <Button type='submit' className='w-full rounded-full'>
              Create New Board
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
