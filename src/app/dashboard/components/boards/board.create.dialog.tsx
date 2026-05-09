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
import { FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
import { cn } from '@/lib/utils';
import { DEFAULT_COLUMN_COLORS, MAX_COLUMNS } from '../../context/kanban.utils';
import { useKanbanActions } from '../../context/kanban-context';
import { useDialogDismissalGuard } from '../../hooks/use-dialog-dismissal-guard';
import { useLimitedFieldArray } from '../../hooks/use-limited-field-array';
import { FieldArrayList } from '../field-array-list';
import { type BoardFormValues, boardSchema, defaultValues } from './board.schema';

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
  const { clearGuard, setDismissalSuppressed, preventDialogDismissal } = useDialogDismissalGuard();

  const form = useCustomForm<BoardFormValues>({ schema: boardSchema, defaultValues });
  const { fields, addItem, hasReachedLimit, remove } = useLimitedFieldArray({
    control: form.control,
    name: 'columns',
    maxItems: MAX_COLUMNS,
    createItem: (currentCount) => ({
      name: '',
      color: DEFAULT_COLUMN_COLORS[currentCount % DEFAULT_COLUMN_COLORS.length],
    }),
  });

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) clearGuard();
    form.reset(defaultValues);
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

        <Form form={form} onSubmit={handleSubmit} className='flex flex-col gap-6'>
          <FieldSet>
            <FieldLegend>Board Name</FieldLegend>
            <FieldGroup className='gap-3'>
              <FormField
                name='name'
                control={form.control}
                render={({ field }) => (
                  <FormItem className='gap-2'>
                    <FormLabel className='sr-only'>Board Name</FormLabel>
                    <FormControl>
                      <Input {...field} type='text' id='board-name' placeholder='e.g. Web Design' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FieldGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Board Columns</FieldLegend>
            <FieldGroup className='gap-3'>
              <FieldArrayList
                onAdd={addItem}
                onRemove={remove}
                fields={fields}
                limitExceeded={hasReachedLimit}
                addLabel='+ Add New Column'
                limitMessage={`Maximum of ${MAX_COLUMNS} columns allowed per board.`}
                className='max-md:max-h-54 max-md:overflow-y-auto max-md:no-scrollbar max-md:p-1'
                renderItem={(field, index, { canRemove, remove: removeColumn }) => (
                  <FormField
                    key={field.id}
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
                                id={`column-${index}`}
                                type='text'
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
            <Button type='submit' className='w-full rounded-full'>
              Create New Board
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
