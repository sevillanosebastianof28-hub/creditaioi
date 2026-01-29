import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { collapsed } = useSidebarContext();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div 
        className={cn(
          'transition-all duration-300 ease-in-out'
        )}
        style={{
          paddingLeft: collapsed ? '70px' : '260px'
        }}
      >
        <Header />
        <main className="p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
