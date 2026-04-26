import { Task } from '../../context/kanban.types';
import { TaskCardPreview } from './task.card';

export const TaskDragOverlay = ({ task }: { task: Task }) => {
  return (
    <TaskCardPreview
      task={task}
      className='pointer-events-none cursor-grabbing select-none drop-shadow-primary/25'
    />
  );
};
