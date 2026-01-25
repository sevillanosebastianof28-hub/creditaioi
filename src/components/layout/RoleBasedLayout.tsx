import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { ClientSidebar } from './ClientSidebar';
import { VASidebar } from './VASidebar';
import { Header } from './Header';
import { Loader2 } from 'lucide-react';

interface RoleBasedLayoutProps {
  children: ReactNode;
}

export function RoleBasedLayout({ children }: RoleBasedLayoutProps) {
  const { role, loading, user } = useAuth();

  // Show loading state while role is being determined
  if (loading || (user && role === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

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
