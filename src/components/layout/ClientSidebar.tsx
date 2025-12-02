import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  MessageSquare,
  Upload,
  CreditCard,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Link2,
  User,
} from 'lucide-react';

const clientMenuItems = [
  { icon: LayoutDashboard, label: 'My Dashboard', path: '/client-dashboard' },
  { icon: TrendingUp, label: 'Score Progress', path: '/client-dashboard/scores' },
  { icon: FileText, label: 'My Disputes', path: '/client-dashboard/disputes' },
  { icon: Upload, label: 'Documents', path: '/client-dashboard/documents' },
  { icon: Link2, label: 'Connect SmartCredit', path: '/client-dashboard/smartcredit' },
  { icon: MessageSquare, label: 'Messages', path: '/client-dashboard/messages' },
  { icon: CreditCard, label: 'Billing', path: '/client-dashboard/billing' },
  { icon: Bell, label: 'Notifications', path: '/client-dashboard/notifications' },
  { icon: User, label: 'Profile', path: '/client-dashboard/profile' },
];

export function ClientSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
        collapsed ? 'w-[70px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-sidebar-accent-foreground">CreditAI</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center mx-auto">
            <Sparkles className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors',
            collapsed && 'absolute -right-3 top-5 bg-sidebar border border-sidebar-border'
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-sidebar-foreground" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-sidebar-foreground" />
          )}
        </button>
      </div>

      {/* Client Badge */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-sidebar-border">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-info/10 border border-info/20">
            <User className="w-4 h-4 text-info" />
            <span className="text-xs font-medium text-info">Client Portal</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-64px-56px)]">
        {clientMenuItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/client-dashboard' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                'hover:bg-sidebar-accent group',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon
                className={cn(
                  'w-5 h-5 flex-shrink-0',
                  isActive ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground group-hover:text-sidebar-primary'
                )}
              />
              {!collapsed && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
