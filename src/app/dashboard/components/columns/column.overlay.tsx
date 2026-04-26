import { TaskCardPreview } from '../tasks';
import { ColumnHeader } from './column.header';
import { Column } from '../../context/kanban.types';

export const ColumnDragOverlay = ({ column }: { column: Column }) => {
  return (
    <div className='flex w-70 shrink-0 grow h-full flex-col gap-3 rounded-lg select-none bg-accent/25'>
      <ColumnHeader name={column.name} taskCount={column.tasks.length} accentColor={column.color} />
      <div className='flex flex-col gap-y-5 rounded-lg p-3'>
        {column.tasks.map((task) => (
          <TaskCardPreview key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};
