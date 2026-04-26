import { AddBoardDialog } from '../components/boards';

export const EmptyDashboard = () => {
  return (
    <div className='grid place-content-center place-items-center text-center text-balance gap-6 lg:gap-8 size-full'>
      <h1 className='mt-2 text-xl font-bold text-muted-foreground'>
        No boards available. Create a new board to get started!
      </h1>
      <AddBoardDialog
        triggerLabel='Add Board'
        triggerClassName='max-w-44 rounded-full p-0 justify-center bg-primary text-white! hover:bg-accent!'
      />
    </div>
  );
};
