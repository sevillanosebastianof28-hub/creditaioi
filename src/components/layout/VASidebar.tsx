import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
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
            <img src="/images/credit-ai-logo.png" alt="Credit AI" className="h-8 w-auto" />
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

      {/* VA Badge */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-sidebar-border">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-warning/10 border border-warning/20">
            <UserCog className="w-4 h-4 text-warning" />
            <span className="text-xs font-medium text-warning">VA Operations</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-64px-56px)]">
        {vaMenuItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/va-dashboard' && location.pathname.startsWith(item.path));
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
