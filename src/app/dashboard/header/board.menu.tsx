'use client';

import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDownIcon, BoardIcon } from '@/components/icons';

import { useActiveBoard, useBoards, useKanbanActions } from '../context/kanban-context';
import { ThemeSwitcher } from '../aside/theme-switcher';
import { AddBoardDialog } from '../components/boards';

export const BoardSelectMenu = () => {
  const boards = useBoards();
  const activeBoard = useActiveBoard();
  const { selectBoard } = useKanbanActions();

  if (!activeBoard || !boards.length) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='group md:hidden rounded-md gap-3 px-1 inline-flex items-center cursor-pointer'>
        <span className='text-lg font-bold max-w-44 truncate'>{activeBoard.name}</span>
        <ChevronDownIcon
          aria-hidden
          className='group-data-[state=open]:rotate-180 transition-transform duration-200'
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='start'
        sideOffset={30}
        className='md:hidden min-w-66 px-0 py-4 rounded-2xl drop-shadow-lg drop-shadow-primary/10 shadow-none'
      >
        <DropdownMenuLabel className='px-3 pb-6 text-xs font-bold tracking-[0.2em] text-muted-foreground'>
          ALL BOARDS ({boards.length})
        </DropdownMenuLabel>
        <DropdownMenuGroup className='mr-6'>
          {boards.map((board) => {
            const isActive = board.id === activeBoard.id;
            return (
              <DropdownMenuItem
                key={board.id}
                onSelect={() => selectBoard(board.id)}
                className={cn(
                  'rounded-r-full h-12 font-bold pl-6 text-muted-foreground cursor-pointer',
                  isActive
                    ? 'bg-primary text-white'
                    : 'focus:bg-primary/10 dark:focus:bg-white focus:text-primary',
                )}
              >
                <BoardIcon
                  aria-hidden
                  className={cn(
                    'shrink-0 transition group-focus/dropdown-menu-item:*:fill-current',
                    isActive ? '*:fill-current' : '*:fill-muted-foreground',
                  )}
                />
                <span className='truncate text-current'>{board.name}</span>
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            className='px-0 h-12 rounded-none rounded-r-full focus:bg-primary/10 dark:focus:bg-white focus:text-primary'
          >
            <AddBoardDialog />
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuGroup className='mt-4 mx-3'>
          <ThemeSwitcher />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
