import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useBrand } from '@/contexts/BrandContext';
import { useSidebarContext } from '@/contexts/SidebarContext';
import {
  LayoutDashboard,
  Users,
  FileText,
  Brain,
  BarChart3,
  Settings,
  CreditCard,
  Shield,
  MessageSquare,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Building2,
  ClipboardList,
  Link2,
  FileEdit,
  Palette,
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Clients', path: '/clients' },
  { icon: ClipboardList, label: 'VA Tasks', path: '/tasks' },
  { icon: FileText, label: 'Disputes', path: '/disputes' },
  { icon: Brain, label: 'AI Engine', path: '/ai-engine' },
  { icon: FileEdit, label: 'Letter Generator', path: '/dispute-letters' },
  { icon: Calculator, label: 'Score Simulator', path: '/simulator' },
  { icon: Link2, label: 'SmartCredit', path: '/smartcredit' },
  { icon: MessageSquare, label: 'Messages', path: '/messages' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: CreditCard, label: 'Billing', path: '/billing' },
  { icon: Building2, label: 'Business', path: '/agency' },
  { icon: Shield, label: 'Compliance', path: '/compliance' },
  { icon: Palette, label: 'White Label', path: '/white-label' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  const { collapsed, toggleCollapsed } = useSidebarContext();
  const location = useLocation();
  const { brand } = useBrand();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out',
        collapsed ? 'w-[70px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            {brand.logo_url ? (
              <img src={brand.logo_url} alt={brand.company_name} className="h-8 w-auto" />
            ) : (
              <img src="/images/credit-ai-logo.png" alt="Credit AI" className="h-8 w-auto" />
            )}
          </div>
        )}
        {collapsed && (
          brand.logo_url ? (
            <img src={brand.logo_url} alt={brand.company_name} className="h-8 w-auto mx-auto" />
          ) : (
            <img src="/images/credit-ai-logo.png" alt="Credit AI" className="h-8 w-auto mx-auto" />
          )
        )}
        <button
          onClick={toggleCollapsed}
          className={cn(
            'p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors',
            collapsed && 'absolute -right-3 top-5 bg-sidebar border border-sidebar-border shadow-md'
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-sidebar-foreground" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-sidebar-foreground" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-64px)]">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === '/dashboard' && location.pathname === '/');
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
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
              {!collapsed && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
