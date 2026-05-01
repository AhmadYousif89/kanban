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

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FieldLegend, FieldSet } from '@/components/ui/field';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
import { useActiveBoard, useKanbanActions } from '../../context/kanban-context';
import type { Column } from '../../context/kanban.types';
import { ColorWheel } from '@/components/color-wheel';
import { useColorPickerDialogGuard } from '../../hooks/use-color-picker-dialog-guard';
import { DeleteColumnDialog } from './column.delete.dialog';
import { columnSchema, type ColumnFormValues } from './column.schema';

type EditColumnDialogProps = { column: Column; open: boolean; onOpenChange(open: boolean): void };

const createDefaultValues = (column: Column): ColumnFormValues => ({
  name: column.name,
  color: column.color,
});

export const EditColumnDialog = ({ column, open, onOpenChange }: EditColumnDialogProps) => {
  const board = useActiveBoard();
  const { saveColumn } = useKanbanActions();
  const { clearGuard, onColorPickerChange, preventDialogDismissal } = useColorPickerDialogGuard();
  const form = useCustomForm<ColumnFormValues>({
    schema: columnSchema,
    defaultValues: createDefaultValues(column),
  });

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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className='max-w-86 p-6'
        onEscapeKeyDown={preventDialogDismissal}
        onInteractOutside={preventDialogDismissal}
        onPointerDownOutside={preventDialogDismissal}
      >
        <DialogHeader>
          <div className='flex items-center justify-between'>
            <DialogTitle className='text-lg font-bold'>Edit Column</DialogTitle>
            <DeleteColumnDialog boardId={board.id} column={column} />
          </div>
          <DialogDescription>Update this column name and accent color.</DialogDescription>
        </DialogHeader>

        <Form form={form} onSubmit={handleSubmit} className='flex flex-col gap-6'>
          <FieldSet>
            <FieldLegend className='font-bold text-muted-foreground'>Column Name</FieldLegend>
            <FormField
              name='name'
              control={form.control}
              render={({ field }) => (
                <FormItem className='gap-2'>
                  <FormLabel className='sr-only'>Column Name</FormLabel>
                  <InputGroup>
                    <FormControl>
                      <InputGroupInput
                        {...field}
                        id={`column-edit-${column.id}`}
                        type='text'
                        placeholder='e.g. In Progress'
                      />
                    </FormControl>
                    <FormField
                      name='color'
                      control={form.control}
                      render={({ field: colorField }) => (
                        <ColorWheel
                          value={colorField.value}
                          onChange={colorField.onChange}
                          onOpenChange={onColorPickerChange}
                          onDismiss={clearGuard}
                        />
                      )}
                    />
                  </InputGroup>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FieldSet>

          <DialogFooter>
            <Button type='submit' className='w-full rounded-full'>
              Save Changes
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
