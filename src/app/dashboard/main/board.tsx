import { useCallback, useEffect, useMemo, useRef } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { horizontalListSortingStrategy, SortableContext } from '@dnd-kit/sortable';

import { TaskCardPreview } from '../components/tasks';
import { EmptyStateBoard } from '../components/boards';
import { ColumnDragOverlay, SortableColumn } from '../components/columns';
import { useActiveBoard, useKanbanActions } from '../context/kanban-context';
import { useBoardDnd } from '../hooks/use-board-dnd';
import { MAX_COLUMNS } from '../context/kanban.utils';
import { Button } from '@/components/ui/button';

export const ActiveBoard = () => {
  const board = useActiveBoard();
  const { saveColumn } = useKanbanActions();
  const {
    activeColumnId,
    activeTaskId,
    collisionDetection,
    columnIds,
    isTaskDragging,
    onDragCancel,
    onDragEnd,
    onDragOver,
    onDragStart,
    previewBoard,
    overColumnId,
    sensors,
  } = useBoardDnd({ board });

  const renderBoard = previewBoard ?? board;
  const boardViewportRef = useRef<HTMLElement | null>(null);
  const columnRefs = useRef(new Map<string, HTMLLIElement | null>());

  const setColumnRef = useCallback((columnId: string, node: HTMLLIElement | null) => {
    if (node) {
      columnRefs.current.set(columnId, node);
      return;
    }
    columnRefs.current.delete(columnId);
  }, []);

  const activeTask = useMemo(() => {
    if (!activeTaskId || !renderBoard) return null;
    for (const column of renderBoard.columns) {
      const task = column.tasks.find((t) => t.id === activeTaskId);
      if (task) return task;
    }
    return null;
  }, [activeTaskId, renderBoard]);

  const activeColumn = useMemo(() => {
    if (!activeColumnId || !renderBoard) return null;
    return renderBoard.columns.find((col) => col.id === activeColumnId) ?? null;
  }, [activeColumnId, renderBoard]);

  useEffect(() => {
    if (!isTaskDragging || !renderBoard) return;

    const targetColumnId = overColumnId ?? activeColumnId;

    if (!targetColumnId) return;

    const boardViewport = boardViewportRef.current;
    const targetColumn = columnRefs.current.get(targetColumnId);

    if (!boardViewport || !targetColumn) return;

    const boardRect = boardViewport.getBoundingClientRect();
    const targetRect = targetColumn.getBoundingClientRect();
    const edgePadding = 24;

    if (targetRect.right > boardRect.right - edgePadding) {
      boardViewport.scrollLeft += targetRect.right - boardRect.right + edgePadding;
      return;
    }

    if (targetRect.left < boardRect.left + edgePadding) {
      boardViewport.scrollLeft += targetRect.left - boardRect.left - edgePadding;
    }
  }, [activeColumnId, isTaskDragging, overColumnId, renderBoard]);

  if (!renderBoard || !renderBoard.columns.length) return <EmptyStateBoard />;

  const hitColumnLimit = renderBoard.columns.length >= MAX_COLUMNS;

  return (
    <section
      ref={boardViewportRef}
      className='flex flex-col h-full py-4 px-2 md:px-3 md:py-6 overflow-x-auto no-scrollbar'
    >
      <DndContext
        sensors={sensors}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        onDragStart={onDragStart}
        onDragCancel={onDragCancel}
        collisionDetection={collisionDetection}
      >
        <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
          <ul className='flex grow'>
            {renderBoard.columns.map((column) => (
              <SortableColumn
                key={column.id}
                column={column}
                isDropTarget={overColumnId === column.id}
                isTaskDragging={isTaskDragging}
                setColumnRef={setColumnRef}
              />
            ))}

            <li className='flex w-70 h-full shrink-0 flex-col p-3 in-data-fullscreen:ml-auto'>
              <div className='mb-4 flex items-center gap-3 select-none' aria-hidden>
                <span className='size-3 rounded-full bg-transparent' />
                <span className='text-xs font-bold uppercase tracking-[0.2em] text-transparent'>
                  New Column
                </span>
              </div>

              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  saveColumn(renderBoard.id, { name: '' });
                }}
                disabled={hitColumnLimit}
                aria-disabled={hitColumnLimit}
                className='grow p-0 max-h-screen rounded-lg dark:border-border/50 bg-muted dark:bg-[#22232E] text-xl lg:text-2xl text-muted-foreground font-bold'
              >
                + New Column
              </Button>
            </li>
          </ul>
        </SortableContext>

        <DragOverlay>
          {activeTask ? (
            <TaskCardPreview
              task={activeTask}
              className='pointer-events-none cursor-grabbing select-none drop-shadow-primary/25'
            />
          ) : null}
          {activeColumn ? <ColumnDragOverlay column={activeColumn} /> : null}
        </DragOverlay>
      </DndContext>
    </section>
  );
};
