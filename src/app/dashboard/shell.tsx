import { DashboardSidebar } from './aside/sidebar';
import { KanbanProvider } from './context/kanban-context';
import { DashboardHeader } from './header/header';
import { DashboardMain } from './main/main';

export function DashboardShell() {
  return (
    <KanbanProvider>
      <div className='shell-grid relative bg-background grow'>
        <DashboardHeader />
        <DashboardSidebar />
        <DashboardMain />
      </div>
    </KanbanProvider>
  );
}
