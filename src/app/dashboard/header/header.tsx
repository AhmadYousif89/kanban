import { BoardName } from './board-name';
import { BoardSelectMenu } from './board.menu';
import { BoardActionsMenu } from '../components/boards';
import { LogoIcon, LogoMobileIcon } from '@/components/icons';
import { AddTaskDialog } from '../components/tasks';

export function DashboardHeader() {
  return (
    <header className='[grid-area:header] flex h-16 items-center border-b border-border bg-card md:h-20 lg:h-24 px-4 md:px-6'>
      <div className='flex h-full shrink-0 items-center md:w-59 lg:w-69 md:border-r border-border'>
        <div className='flex shrink-0 items-center gap-4 md:hidden'>
          <LogoMobileIcon aria-label='Kanban' role='img' />
          <BoardSelectMenu />
        </div>
        <LogoIcon
          className='hidden md:block dark:*:fill-white *:fill-[#000112]'
          aria-label='Kanban'
          role='img'
        />
      </div>

      <div className='flex items-center justify-between h-full grow gap-4 truncate'>
        <BoardName />
        <div className='flex items-center ml-auto gap-2 pr-1 md:gap-4'>
          <AddTaskDialog />
          <BoardActionsMenu />
        </div>
      </div>
    </header>
  );
}
