'use client';

import { FullscreenIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BoardIcon, HideSidebarIcon, ShowSidebarIcon } from '@/components/icons';
import { useKanbanActions, useKanbanState } from '../context/kanban-context';
import { AddBoardDialog } from '../components/boards';
import { ThemeSwitcher } from './theme-switcher';

export function DashboardSidebar() {
  const { boards, activeBoardId, isSidebarOpen, isFullscreenView } = useKanbanState();
  const { closeSidebar, openSidebar, selectBoard, toggleFullscreenView } = useKanbanActions();

  return (
    <>
      <button
        type='button'
        onClick={openSidebar}
        className={cn(
          'group hidden absolute bottom-0 left-0 z-50 md:flex h-12 w-14 -translate-y-8 items-center overflow-hidden rounded-r-full bg-primary text-white',
          'justify-start pl-4.5 pr-0 transition-[width,padding] duration-(--sidebar-duration) ease-out will-change-[width] cursor-pointer',
          'hover:w-42 hover:pr-5',
          isSidebarOpen && 'pointer-events-none invisible',
        )}
      >
        <ShowSidebarIcon aria-hidden className='mr-3 shrink-0' />
        <span className='whitespace-nowrap text-sm font-bold text-current opacity-0 transition-opacity duration-(--sidebar-duration) group-hover:opacity-100'>
          Open Sidebar
        </span>
      </button>

      <aside
        aria-label='Dashboard sidebar'
        aria-hidden={!isSidebarOpen}
        data-open={isSidebarOpen}
        className={cn(
          '[grid-area:sidebar] grid z-1000 transition-opacity duration-(--sidebar-duration)',
          'group/sidebar whitespace-nowrap hidden border-r border-border bg-card md:flex md:flex-col',
          'transition-[width] duration-(--sidebar-duration) ease-out will-change-[width]',
          isSidebarOpen ? 'w-65 lg:w-75 pointer-events-auto' : 'w-0 pointer-events-none',
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
      >
        <div className='flex grow flex-col justify-between'>
          <nav className='mt-8 pr-5'>
            <h2 className='px-6 text-xs font-bold tracking-[0.2em] text-muted-foreground'>
              ALL BOARDS ({boards.length})
            </h2>
            <ul className='mt-5 flex flex-col'>
              {boards.map((board) => {
                const isSelected = board.id === activeBoardId;
                return (
                  <li key={board.id}>
                    <Button
                      type='button'
                      variant='ghost'
                      onClick={() => selectBoard(board.id)}
                      className={cn(
                        'group flex justify-start w-full items-center gap-3 rounded-r-full pl-6 text-left text-[15px] font-bold',
                        isSelected && 'bg-primary! text-white!',
                      )}
                    >
                      <BoardIcon
                        aria-hidden
                        className={cn(
                          'shrink-0 transition',
                          isSelected ? '*:fill-current' : 'group-hover:*:fill-current',
                        )}
                      />
                      <p className='truncate text-current'>{board?.name}</p>
                    </Button>
                  </li>
                );
              })}
              <li>
                <AddBoardDialog />
              </li>
            </ul>
          </nav>
          <div className='grid gap-4 pb-8'>
            {isSidebarOpen && (
              <div className='mx-3 lg:mx-6'>
                <ThemeSwitcher />
              </div>
            )}
            <div className='grid'>
              <Button
                type='button'
                variant='ghost'
                onClick={toggleFullscreenView}
                className='hidden 2xl:inline-flex justify-start items-center gap-3 rounded-r-full p-0 pl-8 mr-4 text-[15px] font-bold transition-colors duration-(--sidebar-duration)'
              >
                <FullscreenIcon aria-hidden className='text-current size-5' />
                <span>{isFullscreenView ? 'Exit Fullscreen' : 'Go Fullscreen'}</span>
              </Button>
              <Button
                type='button'
                variant='ghost'
                onClick={closeSidebar}
                className='justify-start items-center gap-3 rounded-r-full p-0 pl-8 mr-4 text-[15px] font-bold transition-colors duration-(--sidebar-duration)'
              >
                <HideSidebarIcon aria-hidden className='group-hover/button:*:fill-primary' />
                <span>Hide Sidebar</span>
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
