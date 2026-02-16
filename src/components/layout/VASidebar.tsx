import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useBrand } from '@/contexts/BrandContext';
import { useSidebarContext } from '@/contexts/SidebarContext';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FileText,
  MessageSquare,
  Brain,
  FolderOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  UserCog,
  FileEdit,
  X,
} from 'lucide-react';

const vaMenuItems = [
  { icon: LayoutDashboard, label: 'VA Dashboard', path: '/va-dashboard' },
  { icon: Users, label: 'My Clients', path: '/va-dashboard/clients' },
  { icon: ClipboardList, label: 'Tasks', path: '/va-dashboard/tasks' },
  { icon: FileText, label: 'Dispute Letters', path: '/va-dashboard/disputes' },
  { icon: FileEdit, label: 'Letter Generator', path: '/dispute-letters' },
  { icon: FolderOpen, label: 'Client Documents', path: '/va-dashboard/documents' },
  { icon: Brain, label: 'AI Training', path: '/va-dashboard/training' },
  { icon: MessageSquare, label: 'Messages', path: '/va-dashboard/messages' },
  { icon: Settings, label: 'Settings', path: '/va-dashboard/settings' },
];

export function VASidebar() {
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen, isMobile } = useSidebarContext();
  const location = useLocation();
  const { brand } = useBrand();

  const handleNavClick = () => {
    if (isMobile) setMobileOpen(false);
  };

  return (
    <>
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out',
          isMobile
            ? cn('w-[280px]', mobileOpen ? 'translate-x-0' : '-translate-x-full')
            : cn(collapsed ? 'w-[70px]' : 'w-[260px]')
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          {(!collapsed || isMobile) && (
            <div className="flex items-center gap-2">
              {brand.logo_url ? (
                <img src={brand.logo_url} alt={brand.company_name} className="h-8 w-auto" />
              ) : (
                <img src="/images/credit-ai-logo.png" alt="Credit AI" className="h-8 w-auto" />
              )}
            </div>
          )}
          {collapsed && !isMobile && (
            brand.logo_url ? (
              <img src={brand.logo_url} alt={brand.company_name} className="h-8 w-auto mx-auto" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center mx-auto">
                <Sparkles className="w-5 h-5 text-sidebar-primary-foreground" />
              </div>
            )
          )}
          {isMobile ? (
            <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors">
              <X className="w-5 h-5 text-sidebar-foreground" />
            </button>
          ) : (
            <button
              onClick={toggleCollapsed}
              className={cn(
                'p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors',
                collapsed && 'absolute -right-3 top-5 bg-sidebar border border-sidebar-border shadow-md'
              )}
            >
              {collapsed ? <ChevronRight className="w-4 h-4 text-sidebar-foreground" /> : <ChevronLeft className="w-4 h-4 text-sidebar-foreground" />}
            </button>
          )}
        </div>

        {/* VA Badge */}
        {(!collapsed || isMobile) && (
          <div className="px-4 py-3 border-b border-sidebar-border">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-warning/10 border border-warning/20">
              <UserCog className="w-4 h-4 text-warning" />
              <span className="text-xs font-medium text-warning">VA Operations</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className={cn(
          "p-3 space-y-1 overflow-y-auto",
          (collapsed && !isMobile) ? "h-[calc(100vh-64px)]" : "h-[calc(100vh-64px-56px)]"
        )}>
          {vaMenuItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/va-dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                title={collapsed && !isMobile ? item.label : undefined}
                onClick={handleNavClick}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  'hover:bg-sidebar-accent group relative',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                    : 'text-sidebar-foreground hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon
                  className={cn(
                    'w-5 h-5 flex-shrink-0 transition-transform duration-200',
                    isActive ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground group-hover:text-sidebar-primary group-hover:scale-110'
                  )}
                />
                {(!collapsed || isMobile) && (
                  <span className="text-sm font-medium truncate">{item.label}</span>
                )}
                {collapsed && !isMobile && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
