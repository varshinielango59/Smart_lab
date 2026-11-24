import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui';
import type { Role } from '../../types';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  roles: Role[];
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { path:'/dashboard',   label:'Dashboard',      icon:'📊', roles:['admin','faculty','student'] },
  { path:'/monitoring',  label:'PC Monitoring',  icon:'🖥️', roles:['admin','faculty'] },
  { path:'/students',    label:'Students',        icon:'👥', roles:['admin','faculty'] },
  { path:'/allocation',  label:'PC Allocation',  icon:'🔌', roles:['admin','faculty'] },
  { path:'/exercises',   label:'Exercises',       icon:'📝', roles:['admin','faculty','student'] },
  { path:'/submissions', label:'Submissions',     icon:'📤', roles:['admin','faculty','student'] },
  { path:'/sessions',    label:'Sessions',        icon:'⏱️', roles:['admin','faculty'] },
  { path:'/faults',      label:'Faults',          icon:'🔧', roles:['admin','faculty'] },
  { path:'/reports',     label:'Reports',         icon:'📈', roles:['admin','faculty'] },
  { path:'/settings',    label:'Settings',        icon:'⚙️', roles:['admin'] },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const visibleItems = NAV_ITEMS.filter(item =>
    user && item.roles.includes(user.role)
  );

  return (
    <aside className={clsx(
      'h-full bg-slate-900 text-white flex flex-col transition-all duration-300 shrink-0 z-30',
      collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-700/50">
        <div className="shrink-0 w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">SL</div>
        {!collapsed && (
          <div className="animate-fade-in">
            <p className="font-bold text-sm leading-tight">SmartLab</p>
            <p className="text-xs text-slate-400">Management System</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className={clsx('ml-auto text-slate-400 hover:text-white transition-colors cursor-pointer text-sm', collapsed && 'mx-auto')}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {visibleItems.map(item => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 group',
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <span className="text-base shrink-0">{item.icon}</span>
              {!collapsed && <span className="animate-fade-in truncate">{item.label}</span>}
              {!collapsed && item.badge !== undefined && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User footer */}
      {user && (
        <div className="border-t border-slate-700/50 p-3">
          <div className="flex items-center gap-3 mb-2">
            <Avatar initials={user.avatarInitials || user.name.slice(0,2).toUpperCase()} size="sm" />
            {!collapsed && (
              <div className="min-w-0 animate-fade-in">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-slate-400 capitalize">{user.role}</p>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className={clsx(
              'flex items-center gap-2 text-xs text-slate-400 hover:text-red-400 transition-colors w-full rounded-lg px-2 py-1.5 hover:bg-slate-800 cursor-pointer',
              collapsed && 'justify-center'
            )}
          >
            <span>🚪</span>
            {!collapsed && 'Sign Out'}
          </button>
        </div>
      )}
    </aside>
  );
}
