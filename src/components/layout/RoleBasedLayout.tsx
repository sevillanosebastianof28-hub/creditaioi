import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { ClientSidebar } from './ClientSidebar';
import { VASidebar } from './VASidebar';
import { Header } from './Header';

interface RoleBasedLayoutProps {
  children: ReactNode;
}

export function RoleBasedLayout({ children }: RoleBasedLayoutProps) {
  const { role } = useAuth();

  const getSidebar = () => {
    switch (role) {
      case 'client':
        return <ClientSidebar />;
      case 'va_staff':
        return <VASidebar />;
      case 'agency_owner':
      default:
        return <Sidebar />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {getSidebar()}
      <div className="pl-[260px] transition-all duration-300">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
