'use client';

import { useEffect } from 'react';
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
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
import { Input } from '@/components/ui/input';
import type { Board } from '../../context/kanban.types';
import { columnColorOptions, MAX_COLUMNS } from '../../context/kanban.utils';
import { useActiveBoard, useKanbanActions } from '../../context/kanban-context';
import { ColumnColorPicker } from '../columns/column.color-picker';
import { useColorPickerDialogGuard } from '../../hooks/use-color-picker-dialog-guard';

type BoardFormValues = {
  name: string;
  columns: { id?: string; name: string; color: string }[];
};

type EditBoardDialogProps = {
  open: boolean;
  onOpenChange(open: boolean): void;
};

function createDefaultValues(board: Board | null): BoardFormValues {
  return {
    name: board?.name ?? '',
    columns: board?.columns?.slice(0, MAX_COLUMNS).map((column) => ({
      id: column.id,
      name: column.name,
      color: column.color,
    })) ?? [{ name: '', color: columnColorOptions[0] }],
  };
}

export const EditBoardDialog = ({ open, onOpenChange }: EditBoardDialogProps) => {
  const activeBoard = useActiveBoard();
  const { saveBoard } = useKanbanActions();
  const { clearGuard, onColorPickerChange, preventDialogDismissal } = useColorPickerDialogGuard();
  const form = useForm<BoardFormValues>({
    defaultValues: createDefaultValues(activeBoard),
  });

  useEffect(() => {
    form.reset(createDefaultValues(activeBoard));
  }, [activeBoard, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'columns',
    keyName: 'fieldKey',
  });
  const hasReachedColumnLimit = fields.length >= MAX_COLUMNS;

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) clearGuard();
    form.reset(createDefaultValues(activeBoard));
  };

  const handleSubmit = (values: BoardFormValues) => {
    if (!activeBoard) return;

    saveBoard(
      {
        name: values.name.trim(),
        columns: values.columns.slice(0, MAX_COLUMNS).map((column) => ({
          id: column.id,
          name: column.name.trim(),
          color: column.color,
        })),
      },
      activeBoard.id,
    );

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton
        className='p-6'
        onEscapeKeyDown={preventDialogDismissal}
        onInteractOutside={preventDialogDismissal}
        onPointerDownOutside={preventDialogDismissal}
      >
        <DialogHeader>
          <DialogTitle className='font-bold text-lg'>Edit Board</DialogTitle>
          <DialogDescription>
            Update the board label and columns used for this workflow.
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
                    <FieldLabel htmlFor='board-name-edit' className='sr-only'>
                      Board Name
                    </FieldLabel>
                    <Input
                      {...field}
                      type='text'
                      id='board-name-edit'
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
                    key={field.fieldKey}
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
                        <FieldLabel htmlFor={`board-column-${index}`} className='sr-only'>
                          Board Column Name
                        </FieldLabel>
                        <div className='flex items-center gap-2'>
                          <InputGroup>
                            <InputGroupInput
                              {...columnField}
                              type='text'
                              id={`board-column-${index}`}
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
                          <Button
                            type='button'
                            size='icon-sm'
                            variant='ghost'
                            className='hover:bg-transparent! hover:**:fill-destructive active:**:fill-destructive active:bg-background'
                            onClick={() => remove(index)}
                          >
                            <span className='sr-only'>Remove column</span>
                            <CrossIcon aria-hidden />
                          </Button>
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
            <Button type='submit' className='rounded-full w-full'>
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
