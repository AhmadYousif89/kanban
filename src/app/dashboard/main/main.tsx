'use client';

import { ActiveBoard } from '../main/board';
import { EmptyDashboard } from '../main/empty';
import { useHasBoards } from '../context/kanban-context';

export function DashboardMain() {
  const hasBoards = useHasBoards();

  return (
    <main className='[grid-area:main] col-span-full bg-background'>
      {hasBoards ? <ActiveBoard /> : <EmptyDashboard />}
    </main>
  );
}
