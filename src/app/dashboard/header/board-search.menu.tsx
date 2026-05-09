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
  boardId: string | null,
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
  const { selectBoard } = useKanbanActions();
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

  const selectedBoard = useMemo(
    () => boards.find((board) => board.id === selectedBoardId) ?? null,
    [boards, selectedBoardId],
  );

  const searchResults = useMemo(
    () => getTaskSearchResults(boards, query, selectedBoardId),
    [boards, query, selectedBoardId],
  );

  const scopeLabel = selectedBoard?.name ?? 'All boards';
  const hasQuery = Boolean(cleanSearchQuery(query));
  const resultCount = hasQuery ? `(${searchResults.length})` : '';

  return (
    <>
      <Button
        type='button'
        variant='outline'
        onClick={() => setOpen((current) => !current)}
        className='h-8 md:h-9 rounded-full aspect-square text-xs text-muted-foreground border/50 duration-0'
        aria-label='Search tasks'
      >
        <SearchIcon aria-hidden className='lg:hidden' />
        <span className='hidden lg:inline'>
          Search
          <kbd className='ml-2 text-xs bg-accent/15 py-1 px-2 text-muted-foreground rounded-full group-hover/button:text-foreground'>
            CTRL+/
          </kbd>
        </span>
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
            autoFocus
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
                  'gap-3 p-3 text-muted-foreground before:absolute before:top-12 before:left-3.5 before:h-screen before:w-0.5 before:bg-muted/50',
                  selectedBoardId === null && 'bg-muted text-foreground data-selected:bg-muted',
                )}
              >
                <BoardIcon aria-hidden />
                <p className='text-sm font-bold'>All boards</p>
              </CommandItem>

              <div className='ml-6 mt-2'>
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
                      <p className='text-sm font-bold'>{board.name}</p>
                    </CommandItem>
                  );
                })}
              </div>
            </CommandGroup>

            <div className='mt-4 mb-2 h-0.5 w-full bg-muted/50' />

            <CommandGroup heading={`Results in ${scopeLabel} ${resultCount}`}>
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
                        onSelect={() => {
                          selectBoard(board.id);
                          setOpen(false);
                        }}
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
