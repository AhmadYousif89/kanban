import { Button } from '@/components/ui/button';
import { memo, type ReactNode } from 'react';

type ColumnHeaderProps = {
  name: string;
  taskCount: number;
  accentColor: string;
  dragHandle?: ReactNode;
  onEdit?(): void;
};

export const ColumnHeader = memo(
  ({ name, taskCount, accentColor, dragHandle, onEdit }: ColumnHeaderProps) => {
    const columnLabel = `${name} (${taskCount})`;

    return (
      <header className='flex items-center justify-between gap-3 pl-2 md:pl-3'>
        {onEdit ? (
          <Button
            type='button'
            variant='ghost'
            onClick={onEdit}
            aria-label={`Edit ${name} column`}
            className='p-0 h-6 rounded-md hover:bg-transparent!'
          >
            <span
              aria-hidden
              className='size-3 rounded-full'
              style={{ backgroundColor: accentColor }}
            />
            <h2 className='text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground group-hover/button:text-foreground'>
              {columnLabel}
            </h2>
          </Button>
        ) : (
          <div className='flex items-center gap-3'>
            <span
              aria-hidden
              className='size-3 rounded-full'
              style={{ backgroundColor: accentColor }}
            />
            <h2 className='text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground'>
              {columnLabel}
            </h2>
          </div>
        )}
        {dragHandle}
      </header>
    );
  },
);
