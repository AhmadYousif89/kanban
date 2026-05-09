'use client';

import { useEffect, useMemo, useState } from 'react';
import { SearchIcon } from 'lucide-react';

import { BoardIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

import { useBoards, useKanbanActions } from '../context/kanban-context';
import type { Board, Column, Task } from '../context/kanban.types';

type SearchResult = {
  board: Board;
  column: Column;
  task: Task;
};

function cleanSearchQuery(value: string) {
  return value.trim().toLowerCase();
}

function getTaskSearchResults(
  boards: Board[],
  query: string,
  boardId?: string | null,
): SearchResult[] {
  const normalizedQuery = cleanSearchQuery(query);

  if (!normalizedQuery) return [];

  return boards.flatMap((board) => {
    if (boardId && board.id !== boardId) return [];

    return board.columns.flatMap((column) =>
      column.tasks
        .filter((task) => {
          const searchableText = [
            board.name,
            column.name,
            task.title,
            ...task.subtasks.map((subtask) => subtask.title),
          ]
            .join(' ')
            .toLowerCase();

          return searchableText.includes(normalizedQuery);
        })
        .map((task) => ({ board, column, task })),
    );
  });
}

export function BoardSearchMenu() {
  const boards = useBoards();
  const { openTask, selectBoard } = useKanbanActions();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.code !== 'Slash' && e.key !== '/' && e.key !== '?') return;
      e.preventDefault();
      setOpen((pv) => !pv);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (open) return;
    setQuery('');
    setSelectedBoardId(null);
  }, [open]);

  if (!boards.length) return null;

  const selectedBoard = useMemo(
    () => boards.find((board) => board.id === selectedBoardId) ?? null,
    [boards, selectedBoardId],
  );

  const queryResults = useMemo(() => getTaskSearchResults(boards, query), [boards, query]);

  const searchResults = useMemo(() => {
    if (!selectedBoardId) return queryResults;
    return queryResults.filter((result) => result.board.id === selectedBoardId);
  }, [queryResults, selectedBoardId]);

  const resultCountsByBoard = useMemo(() => {
    const counts = new Map<string, number>();
    queryResults.forEach(({ board }) => counts.set(board.id, (counts.get(board.id) ?? 0) + 1));
    return counts;
  }, [queryResults]);

  const hasQuery = Boolean(cleanSearchQuery(query));
  const scopeLabel = selectedBoard?.name ?? 'all boards';

  const allBoardsResultCount = hasQuery ? queryResults.length : null;
  const getBoardResultCount = (board: Board) =>
    hasQuery ? (resultCountsByBoard.get(board.id) ?? 0) : null;

  const handleItemSelect = (taskId: string, boardId: string) => {
    selectBoard(boardId);
    openTask(taskId);
    setOpen(false);
  };

  return (
    <>
      <Button
        type='button'
        variant='outline'
        onClick={() => setOpen((current) => !current)}
        className='h-8 md:h-9 rounded-full text-xs text-muted-foreground border/50 translate-y-0'
        aria-label='Search tasks'
      >
        <SearchIcon aria-hidden className='lg:hidden' />
        <span className='hidden lg:inline-flex whitespace-nowrap'>Search</span>
        <kbd className='hidden lg:inline-flex text-xs bg-accent/15 py-1 px-2 text-muted-foreground rounded-full group-hover/button:text-foreground transition'>
          CTRL+/
        </kbd>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title='Task search'
        description='Search tasks across all boards or narrow the scope to one board.'
        className='pb-4'
      >
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder={`Search tasks in ${scopeLabel}`}
          />

          <CommandList className='p-2'>
            <CommandGroup heading='Search scope'>
              <CommandItem
                value='all boards'
                aria-label='Search all boards'
                onSelect={() => setSelectedBoardId(null)}
                className={cn(
                  'gap-3 p-3 text-muted-foreground',
                  selectedBoardId === null && 'bg-muted text-foreground data-selected:bg-muted',
                )}
              >
                <BoardIcon aria-hidden />
                <p className='text-sm font-bold'>All Boards {allBoardsResultCount}</p>
              </CommandItem>

              <div className='mx-3.5 mt-2 border-l-2 border-muted/50 pl-3'>
                {boards.map((board) => {
                  const isSelected = board.id === selectedBoardId;

                  return (
                    <CommandItem
                      key={board.id}
                      value={board.name}
                      aria-label={`Search within ${board.name}`}
                      onSelect={() => setSelectedBoardId(board.id)}
                      className={cn(
                        'items-start gap-3 p-3 text-muted-foreground',
                        isSelected && 'bg-muted text-foreground data-selected:bg-muted',
                      )}
                    >
                      <BoardIcon
                        aria-hidden
                        className={cn(
                          'mt-0.5 shrink-0 transition',
                          isSelected ? '*:fill-current' : '*:fill-muted-foreground',
                        )}
                      />
                      <p className='text-sm font-bold'>
                        {board.name} {getBoardResultCount(board)}
                      </p>
                    </CommandItem>
                  );
                })}
              </div>
            </CommandGroup>

            <div className='mt-4 mb-2 h-0.5 w-full bg-muted/50' />

            <CommandGroup heading={`Results in ${scopeLabel}`}>
              {hasQuery ? (
                searchResults.length ? (
                  <div className='m-3'>
                    {searchResults.map(({ board, column, task }) => (
                      <CommandItem
                        key={`${board.id}-${column.id}-${task.id}`}
                        value={`${task.title} ${column.name} ${board.name} ${task.subtasks
                          .map((subtask) => subtask.title)
                          .join(' ')}`}
                        aria-label={`${task.title} in ${board.name}, ${column.name}`}
                        onSelect={() => handleItemSelect(task.id, board.id)}
                        className='items-start gap-3 rounded-lg px-3 py-3'
                      >
                        <div className='flex min-w-0 flex-1 flex-col gap-1 text-left'>
                          <span className='truncate text-sm font-bold text-foreground'>
                            {task.title}
                          </span>
                          <span className='truncate text-xs text-muted-foreground '>
                            {board.name} · {column.name}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </div>
                ) : (
                  <p className='px-3 py-6 text-center text-xs text-muted-foreground font-medium'>
                    No tasks found in {scopeLabel}.
                  </p>
                )
              ) : (
                <p className='px-3 py-6 text-center text-xs text-muted-foreground font-medium'>
                  Start typing to search tasks across the Kanban.
                </p>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
