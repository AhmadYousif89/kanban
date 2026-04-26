'use client';

import { Controller, useForm } from 'react-hook-form';

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
import { useActiveBoard, useKanbanActions } from '../../context/kanban-context';
import type { Column } from '../../context/kanban.types';
import { ColumnColorPicker } from './column.color-picker';
import { useColorPickerDialogGuard } from '../../hooks/use-color-picker-dialog-guard';
import { DeleteColumnDialog } from './column.delete.dialog';

type ColumnFormValues = { name: string; color: string };

type EditColumnDialogProps = { column: Column; open: boolean; onOpenChange(open: boolean): void };

const createDefaultValues = (column: Column): ColumnFormValues => ({
  name: column.name,
  color: column.color,
});

export const EditColumnDialog = ({ column, open, onOpenChange }: EditColumnDialogProps) => {
  const board = useActiveBoard();
  const { saveColumn } = useKanbanActions();
  const { clearGuard, onColorPickerChange, preventDialogDismissal } = useColorPickerDialogGuard();
  const form = useForm<ColumnFormValues>({ defaultValues: createDefaultValues(column) });

  if (!board) return null;

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) clearGuard();
    form.reset(createDefaultValues(column));
  };

  const handleSubmit = (values: ColumnFormValues) => {
    if (!board) return;

    saveColumn(board.id, { name: values.name.trim(), color: values.color }, column.id);

    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent
        className='max-w-86 p-6'
        onEscapeKeyDown={preventDialogDismissal}
        onInteractOutside={preventDialogDismissal}
        onPointerDownOutside={preventDialogDismissal}
      >
        <DialogHeader>
          <div className='flex items-center justify-between'>
            <DialogTitle className='text-lg font-bold'>Edit Column</DialogTitle>
            <DeleteColumnDialog
              boardId={board.id}
              column={column}
            />
          </div>
          <DialogDescription>Update this column name and accent color.</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className='flex flex-col gap-6'
        >
          <FieldSet>
            <FieldLegend className='font-bold text-muted-foreground'>Column Name</FieldLegend>
            <Controller
              name='name'
              control={form.control}
              rules={{
                required: 'Column name is required.',
                minLength: { value: 3, message: 'Column name must be at least 3 characters.' },
                maxLength: { value: 50, message: 'Column name must be at most 50 characters.' },
              }}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className='gap-2'
                >
                  <FieldLabel
                    htmlFor={`column-edit-${column.id}`}
                    className='sr-only'
                  >
                    Column Name
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id={`column-edit-${column.id}`}
                      type='text'
                      placeholder='e.g. In Progress'
                      aria-invalid={fieldState.invalid}
                    />
                    <Controller
                      name='color'
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
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldSet>

          <DialogFooter>
            <Button
              type='submit'
              className='w-full rounded-full'
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
