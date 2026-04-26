'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { useActiveBoard, useKanbanActions } from '../../context/kanban-context';
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
import { cn } from '@/lib/utils';
import { ColumnColorPicker } from './column.color-picker';
import { useColorPickerDialogGuard } from '../../hooks/use-color-picker-dialog-guard';
import { columnColorOptions, MAX_COLUMNS } from '../../context/kanban.utils';

type ColumnFormValues = { name: string; color: string };

const defaultValues: ColumnFormValues = {
  name: '',
  color: columnColorOptions[0],
};

type AddColumnDialogProps = { label?: string; triggerClassName?: string };

export const AddColumnDialog = ({
  label = '+ Add New Column',
  triggerClassName,
}: AddColumnDialogProps) => {
  const [open, setOpen] = useState(false);
  const { clearGuard, onColorPickerChange, preventDialogDismissal } = useColorPickerDialogGuard();
  const activeBoard = useActiveBoard();
  const { saveColumn } = useKanbanActions();
  const form = useForm<ColumnFormValues>({ defaultValues });
  const hasReachedColumnLimit = activeBoard != null && activeBoard.columns.length >= MAX_COLUMNS;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    clearGuard();
    form.reset(defaultValues);
  };

  const handleSubmit = (values: ColumnFormValues) => {
    if (!activeBoard || hasReachedColumnLimit) {
      return;
    }

    saveColumn(activeBoard.id, {
      name: values.name.trim(),
      color: values.color,
    });

    form.reset(defaultValues);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type='button'
          className={cn('w-full', triggerClassName)}
          disabled={!activeBoard || hasReachedColumnLimit}
        >
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent
        className='max-w-86 p-6'
        onEscapeKeyDown={preventDialogDismissal}
        onInteractOutside={preventDialogDismissal}
        onPointerDownOutside={preventDialogDismissal}
      >
        <DialogHeader>
          <DialogTitle className='text-lg font-bold'>Add New Column</DialogTitle>
          <DialogDescription>Create a new workflow column for the current board.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-col gap-6'>
          <FieldSet>
            <FieldLegend className='font-bold text-muted-foreground'>Column Name</FieldLegend>
            <FieldGroup className='gap-3'>
              <Field data-invalid={form.formState.errors.name != null} className='gap-2'>
                <FieldLabel htmlFor='column-name' className='sr-only'>
                  Column Name
                </FieldLabel>
                <InputGroup>
                  <Controller
                    name='name'
                    control={form.control}
                    rules={{
                      required: 'Column name is required.',
                      minLength: {
                        value: 3,
                        message: 'Column name must be at least 3 characters.',
                      },
                      maxLength: {
                        value: 50,
                        message: 'Column name must be at most 50 characters.',
                      },
                      validate: (value) => value === value.trim() || 'Column name cannot be empty',
                    }}
                    render={({ field, fieldState }) => (
                      <InputGroupInput
                        {...field}
                        type='text'
                        id='column-name'
                        placeholder='e.g. Todo'
                        aria-invalid={fieldState.invalid}
                      />
                    )}
                  />
                  <Controller
                    name='color'
                    control={form.control}
                    render={({ field }) => (
                      <ColumnColorPicker
                        value={field.value}
                        onChange={field.onChange}
                        onOpenChange={onColorPickerChange}
                        onDismiss={clearGuard}
                      />
                    )}
                  />
                </InputGroup>
                {form.formState.errors.name && <FieldError errors={[form.formState.errors.name]} />}
              </Field>
            </FieldGroup>
          </FieldSet>

          <DialogFooter>
            <Button
              type='submit'
              disabled={!activeBoard || hasReachedColumnLimit}
              className='w-full rounded-full'
            >
              Create Column
            </Button>
            {hasReachedColumnLimit ? (
              <p className='text-center text-xs font-medium text-muted-foreground'>
                Maximum of {MAX_COLUMNS} columns reached.
              </p>
            ) : null}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
