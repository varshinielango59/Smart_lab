import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Avatar, Badge } from '../ui';
import { format } from 'date-fns';

interface TopbarProps {
  pageTitle?: string;
}

export default function Topbar({ pageTitle }: TopbarProps) {
  const { user } = useAuth();
  const now = new Date();

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        {pageTitle && <h2 className="text-base font-semibold text-slate-700">{pageTitle}</h2>}
      </div>

      <div className="flex items-center gap-4">

        {/* Clock */}
        <span className="hidden md:block text-xs text-slate-400 font-mono">
          {format(now, 'dd MMM yyyy HH:mm')}
        </span>

        {/* User badge */}
        {user && (
          <div className="flex items-center gap-2">
            <Avatar initials={user.avatarInitials || user.name.slice(0,2).toUpperCase()} size="sm" />
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-700 leading-tight">{user.name}</p>
              <div className="flex justify-end">
                <Badge variant={user.role === 'admin' ? 'faulty' : user.role === 'faculty' ? 'published' : 'available'} size="sm">
                  {user.role}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
