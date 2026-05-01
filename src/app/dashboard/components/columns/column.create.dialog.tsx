'use client';

import { useState } from 'react';
import {
  useCustomForm,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/form';

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
import { FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
import { cn } from '@/lib/utils';
import { ColorWheel } from '@/components/color-wheel';
import { useColorPickerDialogGuard } from '../../hooks/use-color-picker-dialog-guard';
import { MAX_COLUMNS, DEFAULT_COLUMN_COLORS } from '../../context/kanban.utils';
import { columnSchema, type ColumnFormValues } from './column.schema';

const defaultValues: ColumnFormValues = {
  name: '',
  color: DEFAULT_COLUMN_COLORS[0],
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
  const form = useCustomForm<ColumnFormValues>({ schema: columnSchema, defaultValues });

  if (!activeBoard) return null;

  const hitColumnLimit = activeBoard.columns.length >= MAX_COLUMNS;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) clearGuard();
    form.reset(defaultValues);
  };

  const handleSubmit = (values: ColumnFormValues) => {
    if (!activeBoard || hitColumnLimit) return;

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
          disabled={!activeBoard || hitColumnLimit}
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

        <Form form={form} onSubmit={handleSubmit} className='flex flex-col gap-6'>
          <FieldSet>
            <FieldLegend className='font-bold text-muted-foreground'>Column Name</FieldLegend>
            <FieldGroup className='gap-3'>
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
                          type='text'
                          id='column-name'
                          placeholder='e.g. Todo'
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
            </FieldGroup>
          </FieldSet>

          <DialogFooter>
            <Button
              type='submit'
              disabled={!activeBoard || hitColumnLimit}
              className='w-full rounded-full'
            >
              Create Column
            </Button>
            {hitColumnLimit ? (
              <p className='text-center text-xs font-medium text-muted-foreground'>
                Maximum of {MAX_COLUMNS} columns reached.
              </p>
            ) : null}
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
