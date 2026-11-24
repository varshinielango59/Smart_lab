import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Card, Badge, SearchInput, Button, PageHeader,
  Select, Modal, Table
} from '../components/ui';
import { SESSIONS } from '../data/mockData';
import type { Session } from '../types';

function getDuration(s: Session): string {
  if (s.status === 'active') {
    const mins = Math.round((Date.now() - new Date(s.loginTime).getTime()) / 60000);
    return `${mins}m (active)`;
  }
  return s.durationMinutes ? `${s.durationMinutes}m` : '—';
}

function getDurationFull(s: Session): string {
  if (s.status === 'active') {
    const mins = Math.round((Date.now() - new Date(s.loginTime).getTime()) / 60000);
    return `${mins} minutes (ongoing)`;
  }
  return s.durationMinutes ? `${s.durationMinutes} minutes` : '—';
}

export default function SessionsPage() {
  const [sessions] = useState<Session[]>(SESSIONS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [labFilter, setLabFilter] = useState('all');
  const [detailModal, setDetailModal] = useState(false);
  const [detailSession, setDetailSession] = useState<Session | null>(null);

  const filtered = sessions.filter(s => {
    const q = search.toLowerCase();
    const matchSearch =
      s.studentName.toLowerCase().includes(q) ||
      s.studentRoll.toLowerCase().includes(q) ||
      s.pcName.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchLab = labFilter === 'all' || s.labId === labFilter;
    return matchSearch && matchStatus && matchLab;
  });

  const activeSessions = sessions.filter(s => s.status === 'active');
  const endedSessions  = sessions.filter(s => s.status === 'ended');
  const avgDuration    = endedSessions.length
    ? Math.round(endedSessions.reduce((a, s) => a + (s.durationMinutes || 0), 0) / endedSessions.length)
    : 0;

  const columns = [
    {
      key: 'id', label: 'Session ID',
      render: (s: Session) => <span className="font-mono text-xs text-slate-400">{s.id}</span>,
    },
    {
      key: 'studentName', label: 'Student',
      render: (s: Session) => (
        <div>
          <p className="font-medium text-slate-700">{s.studentName}</p>
          <p className="text-xs text-slate-400">{s.studentRoll}</p>
        </div>
      ),
    },
    {
      key: 'pcName', label: 'PC',
      render: (s: Session) => <span className="font-mono text-sm">{s.pcName}</span>,
    },
    {
      key: 'labName', label: 'Lab',
      render: (s: Session) => <span className="text-xs text-slate-500">{s.labName}</span>,
    },
    {
      key: 'loginTime', label: 'Login',
      render: (s: Session) => (
        <span className="text-xs text-slate-600">{format(new Date(s.loginTime), 'dd MMM HH:mm')}</span>
      ),
    },
    {
      key: 'logoutTime', label: 'Logout',
      render: (s: Session) =>
        s.logoutTime
          ? <span className="text-xs text-slate-600">{format(new Date(s.logoutTime), 'dd MMM HH:mm')}</span>
          : <span className="text-xs text-slate-400">—</span>,
    },
    {
      key: 'duration', label: 'Duration',
      render: (s: Session) => <span className="text-sm text-slate-700">{getDuration(s)}</span>,
    },
    {
      key: 'status', label: 'Status',
      render: (s: Session) => (
        <Badge variant={s.status === 'active' ? 'active' : 'default'}>{s.status}</Badge>
      ),
    },
    {
      key: 'actions', label: '',
      render: (s: Session) => (
        <Button
          size="sm" variant="ghost"
          onClick={e => {
            e.stopPropagation();
            setDetailSession(s);
            setDetailModal(true);
          }}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Session History"
        subtitle="Track lab usage sessions, login/logout times, and durations"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-center">
          <p className="text-2xl font-bold text-slate-800">{sessions.length}</p>
          <p className="text-xs text-slate-500">Total Sessions</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-center">
          <p className="text-2xl font-bold text-green-600">{activeSessions.length}</p>
          <p className="text-xs text-slate-500">Active Now</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-center">
          <p className="text-2xl font-bold text-slate-600">{endedSessions.length}</p>
          <p className="text-xs text-slate-500">Completed</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-center">
          <p className="text-2xl font-bold text-indigo-600">{avgDuration}m</p>
          <p className="text-xs text-slate-500">Avg. Duration</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Student, roll number, or PC…"
          className="flex-1"
        />
        <Select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'active', label: 'Active' },
            { value: 'ended', label: 'Ended' },
          ]}
          className="sm:w-40"
        />
        <Select
          value={labFilter}
          onChange={e => setLabFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Labs' },
            { value: 'lab-01', label: 'Lab A' },
            { value: 'lab-02', label: 'Lab B' },
            { value: 'lab-03', label: 'Lab C' },
          ]}
          className="sm:w-44"
        />
      </Card>

      <Card padding={false}>
        <Table
          columns={columns as any}
          data={filtered}
          keyField="id"
          onRowClick={s => { setDetailSession(s); setDetailModal(true); }}
          emptyMessage="No sessions found."
        />
      </Card>

      {/* Detail modal */}
      {detailSession && (
        <Modal
          open={detailModal}
          onClose={() => setDetailModal(false)}
          title={`Session Details – ${detailSession.id}`}
        >
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 uppercase font-medium mb-1">Student</p>
                <p className="font-semibold text-slate-700">{detailSession.studentName}</p>
                <p className="text-xs text-slate-400">{detailSession.studentRoll}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-medium mb-1">Status</p>
                <Badge variant={detailSession.status === 'active' ? 'active' : 'default'}>
                  {detailSession.status}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-medium mb-1">PC</p>
                <p className="font-mono text-slate-700">{detailSession.pcName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-medium mb-1">Laboratory</p>
                <p className="text-slate-700">{detailSession.labName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-medium mb-1">Login Time</p>
                <p className="text-slate-600">
                  {format(new Date(detailSession.loginTime), 'dd MMM yyyy HH:mm:ss')}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-medium mb-1">Logout Time</p>
                <p className="text-slate-600">
                  {detailSession.logoutTime
                    ? format(new Date(detailSession.logoutTime), 'dd MMM yyyy HH:mm:ss')
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-medium mb-1">Duration</p>
                <p className="font-semibold text-slate-700">{getDurationFull(detailSession)}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
