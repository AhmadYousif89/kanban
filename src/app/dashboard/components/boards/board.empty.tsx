import { AddColumnDialog } from '../columns';

export const EmptyStateBoard = () => {
  return (
    <div className='grid place-content-center place-items-center text-center text-balance gap-6 size-full'>
      <p className='mt-2 text-xl font-bold text-muted-foreground'>
        This board is empty. Create a new column to get started.
      </p>
      <AddColumnDialog triggerClassName='rounded-full max-w-44' />
    </div>
  );
};
