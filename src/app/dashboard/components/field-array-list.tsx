'use client';

import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type FieldArrayListProps<TItem> = {
  fields: readonly TItem[];
  limitExceeded: boolean;
  limitMessage: string;
  addLabel: string;
  onAdd(): void;
  onRemove(index: number): void;
  renderItem: (
    field: TItem,
    index: number,
    controls: { canRemove: boolean; remove(): void },
  ) => ReactNode;
  className?: string;
};

export function FieldArrayList<TItem>({
  fields,
  limitExceeded,
  limitMessage,
  addLabel,
  onAdd,
  onRemove,
  renderItem,
  className,
}: FieldArrayListProps<TItem>) {
  const canRemove = fields.length > 1;

  return (
    <>
      <div className={cn('grid gap-3', className)}>
        {fields.map((field, index) =>
          renderItem(field, index, { canRemove, remove: () => onRemove(index) }),
        )}
      </div>

      <div className='grid gap-2'>
        {limitExceeded && (
          <p className='text-center text-xs font-medium text-muted-foreground'>{limitMessage}</p>
        )}
        <Button
          type='button'
          variant='secondary'
          className='h-10 rounded-full'
          disabled={limitExceeded}
          onClick={onAdd}
        >
          {addLabel}
        </Button>
      </div>
    </>
  );
}
