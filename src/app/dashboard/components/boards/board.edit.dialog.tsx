'use client';

import { useState } from 'react';
import { ColorWheel } from '@/components/color-wheel';
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
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
import type { Board } from '../../context/kanban.types';
import { DEFAULT_COLUMN_COLORS, MAX_COLUMNS } from '../../context/kanban.utils';
import { useActiveBoard, useKanbanActions } from '../../context/kanban-context';
import { useDialogDismissalGuard } from '../../hooks/use-dialog-dismissal-guard';
import { useLimitedFieldArray } from '../../hooks/use-limited-field-array';
import { DeleteColumnDialog } from '../columns/column.delete.dialog';
import { FieldArrayList } from '../field-array-list';
import { type BoardFormValues, boardSchema, defaultValues } from './board.schema';

type EditBoardDialogProps = {
  open: boolean;
  onOpenChange(open: boolean): void;
};

function createDefaultValues(board: Board | null): BoardFormValues {
  const columns =
    board?.columns?.slice(0, MAX_COLUMNS).map((column) => ({
      id: column.id,
      name: column.name,
      color: column.color,
    })) ?? defaultValues.columns;

  return { name: board?.name ?? '', columns };
}

export const EditBoardDialog = ({ open, onOpenChange }: EditBoardDialogProps) => {
  const activeBoard = useActiveBoard();
  const { saveBoard } = useKanbanActions();
  const [pendingRemoveIndex, setPendingRemoveIndex] = useState<number | null>(null);
  const { clearGuard, setDismissalSuppressed, preventDialogDismissal } = useDialogDismissalGuard();

  const form = useCustomForm<BoardFormValues>({
    schema: boardSchema,
    defaultValues: createDefaultValues(activeBoard),
  });

  const { fields, addItem, hasReachedLimit, remove } = useLimitedFieldArray({
    control: form.control,
    name: 'columns',
    keyName: 'fieldKey',
    maxItems: MAX_COLUMNS,
    createItem: (currentCount) => ({
      name: '',
      color: DEFAULT_COLUMN_COLORS[currentCount % DEFAULT_COLUMN_COLORS.length],
    }),
  });

  const pendingColumn = pendingRemoveIndex !== null ? fields[pendingRemoveIndex] : null;
  const pendingBoardColumn =
    pendingColumn && activeBoard
      ? (activeBoard.columns.find((column) => column.id === pendingColumn.id) ?? null)
      : null;

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (nextOpen) {
      clearGuard();
      setPendingRemoveIndex(null);
    }
    form.reset(createDefaultValues(activeBoard));
  };

  const handleConfirmColumnRemoval = () => {
    if (pendingRemoveIndex === null) return;
    remove(pendingRemoveIndex);
    setPendingRemoveIndex(null);
  };

  const handleRemoveColumn = (index: number) => {
    const selectedColumn = fields[index];

    if (!selectedColumn?.id) {
      remove(index);
      return;
    }

    const hasTasks =
      activeBoard?.columns.find((column) => column.id === selectedColumn.id)?.tasks.length ?? 0;

    if (hasTasks > 0) {
      setDismissalSuppressed(true);
      setPendingRemoveIndex(index);
      return;
    }

    remove(index);
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
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton
          className='p-6'
          onEscapeKeyDown={preventDialogDismissal}
          onInteractOutside={preventDialogDismissal}
          onPointerDownOutside={preventDialogDismissal}
        >
          <DialogHeader>
            <DialogTitle className='text-lg font-bold'>Edit Board</DialogTitle>
            <DialogDescription>
              Update the board label and columns used for this workflow.
            </DialogDescription>
          </DialogHeader>

          <Form form={form} onSubmit={handleSubmit} className='flex flex-col gap-6'>
            <FieldSet>
              <FieldLegend className='font-bold text-muted-foreground dark:text-white'>
                Board Name
              </FieldLegend>
              <FieldGroup className='gap-3'>
                <FormField
                  name='name'
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className='gap-2'>
                      <FormLabel className='sr-only'>Board Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type='text'
                          id='board-name-edit'
                          placeholder='e.g. Web Design'
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
                Board Columns
              </FieldLegend>
              <FieldGroup className='gap-3'>
                <FieldArrayList
                  fields={fields}
                  limitExceeded={hasReachedLimit}
                  limitMessage={`Maximum of ${MAX_COLUMNS} columns allowed per board.`}
                  addLabel='+ Add New Column'
                  onAdd={addItem}
                  onRemove={handleRemoveColumn}
                  className='max-md:max-h-54 max-md:overflow-y-auto max-md:no-scrollbar max-md:p-1'
                  renderItem={(field, index, { canRemove, remove: removeColumn }) => (
                    <FormField
                      key={field.fieldKey}
                      name={`columns.${index}.name`}
                      control={form.control}
                      render={({ field: columnField }) => (
                        <FormItem className='gap-2'>
                          <FormLabel className='sr-only'>Board Column Name</FormLabel>
                          <div className='flex items-center gap-2'>
                            <InputGroup>
                              <FormControl>
                                <InputGroupInput
                                  {...columnField}
                                  value={columnField.value ?? ''}
                                  type='text'
                                  id={`board-column-${index}`}
                                  placeholder={index === 0 ? 'e.g. Todo, In Progress' : ''}
                                />
                              </FormControl>
                              <FormField
                                name={`columns.${index}.color`}
                                control={form.control}
                                render={({ field: colorField }) => (
                                  <ColorWheel
                                    value={colorField.value}
                                    onChange={colorField.onChange}
                                    onOpenChange={setDismissalSuppressed}
                                    onDismiss={clearGuard}
                                  />
                                )}
                              />
                            </InputGroup>
                            {canRemove && (
                              <Button
                                type='button'
                                size='icon-sm'
                                variant='ghost'
                                className='hover:bg-transparent! hover:**:fill-destructive active:**:fill-destructive active:bg-background'
                                onClick={removeColumn}
                              >
                                <span className='sr-only'>Remove column</span>
                                <CrossIcon aria-hidden />
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

            <DialogFooter>
              <Button type='submit' className='rounded-full w-full'>
                Save Changes
              </Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>

      {pendingBoardColumn && (
        <DeleteColumnDialog
          boardId={activeBoard?.id ?? ''}
          column={pendingBoardColumn}
          open={pendingRemoveIndex !== null}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              setPendingRemoveIndex(null);
              setDismissalSuppressed(false);
            }
          }}
          onDelete={handleConfirmColumnRemoval}
          trigger={null}
        />
      )}
    </>
  );
};
