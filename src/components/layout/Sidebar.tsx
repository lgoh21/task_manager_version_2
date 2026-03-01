'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/hooks/useAppStore';
import { useTaskStore } from '@/lib/hooks/useTaskStore';
import { sidebarVariants } from '@/config/animations';
import { SidebarProjects } from '@/components/layout/SidebarProjects';
import {
  IconToday,
  IconPlan,
  IconNotes,
  IconHistory,
  IconSettings,
  IconPanelLeft,
} from '@/components/ui/Icons';

const secondaryItems = [
  { href: '/notes', label: 'Notes', icon: IconNotes },
  { href: '/history', label: 'History', icon: IconHistory },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const { getTasksByStatus } = useTaskStore();

  const inboxCount = getTasksByStatus('inbox').length;

  return (
    <motion.aside
      variants={sidebarVariants}
      animate={sidebarCollapsed ? 'collapsed' : 'expanded'}
      className="h-screen bg-sidebar border-r border-border flex flex-col overflow-hidden shrink-0"
    >
      {/* Header */}
      <div className="h-topbar flex items-center justify-between px-3 shrink-0">
        {!sidebarCollapsed && (
          <span className="text-sm font-semibold text-sidebar-foreground truncate">
            Tempus
          </span>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-muted transition-colors"
          aria-label="Toggle sidebar"
        >
          <IconPanelLeft size={16} />
        </button>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 px-2 py-2 flex flex-col overflow-y-auto">
        <NavItem href="/today" label="Today" icon={IconToday} active={pathname === '/today'} collapsed={sidebarCollapsed} />
        <NavItem href="/plan" label="Plan" icon={IconPlan} active={pathname === '/plan'} collapsed={sidebarCollapsed} badge={inboxCount} />

        {/* Projects section */}
        {!sidebarCollapsed && <SidebarProjects />}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Secondary nav */}
        <div className="pt-2 space-y-0.5">
          {secondaryItems.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              active={pathname === item.href}
              collapsed={sidebarCollapsed}
            />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-2 py-2 border-t border-border shrink-0">
        <NavItem href="/settings" label="Settings" icon={IconSettings} active={pathname === '/settings'} collapsed={sidebarCollapsed} />
      </div>
    </motion.aside>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
  badge,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  active: boolean;
  collapsed: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors ${
        active
          ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
      } ${collapsed ? 'justify-center' : ''}`}
      title={collapsed ? label : undefined}
    >
      <Icon size={16} />
      {!collapsed && (
        <>
          <span className="truncate">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span className="ml-auto text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded-full font-medium">
              {badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}
