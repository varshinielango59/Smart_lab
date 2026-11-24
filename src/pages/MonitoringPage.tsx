import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';
import {
  Card, Badge, SearchInput, Button, PageHeader, ProgressBar,
  Select, Tabs, Tooltip, Modal
} from '../components/ui';
import { PCS, LABS, getSimulatedPCMetrics } from '../data/mockData';
import type { PC } from '../types';

function PCStatusDot({ status }: { status: PC['status'] }) {
  const colors: Record<string, string> = {
    available: 'bg-green-500',
    occupied:  'bg-blue-500',
    offline:   'bg-slate-400',
    faulty:    'bg-red-500',
    online:    'bg-green-400',
    maintenance: 'bg-amber-500',
  };
  return (
    <span className={clsx(
      'w-2.5 h-2.5 rounded-full shrink-0',
      colors[status] ?? 'bg-slate-300',
      (status === 'available' || status === 'occupied') && 'animate-pulse-dot'
    )} />
  );
}

function isStale(lastHeartbeat: string) {
  return (Date.now() - new Date(lastHeartbeat).getTime()) > 5 * 60 * 1000; // > 5 min
}

function PCCard({ pc, onClick }: { pc: PC; onClick: () => void }) {
  const stale = isStale(pc.lastHeartbeat);
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white rounded-xl border p-4 cursor-pointer transition-all duration-200 hover:shadow-md',
        pc.status === 'faulty' ? 'border-red-200 bg-red-50/30' :
        pc.status === 'offline' || stale ? 'border-slate-200 bg-slate-50' :
        pc.status === 'occupied' ? 'border-blue-200' :
        pc.status === 'maintenance' ? 'border-amber-200 bg-amber-50/30' :
        'border-slate-200 hover:border-indigo-300'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <PCStatusDot status={pc.status} />
          <span className="font-semibold text-sm text-slate-800">{pc.name}</span>
        </div>
        <Badge variant={pc.status}>{pc.status}</Badge>
      </div>

      <p className="text-xs text-slate-500 mb-3">{pc.labName}</p>

      {pc.status !== 'offline' && pc.status !== 'faulty' && pc.status !== 'maintenance' ? (
        <div className="space-y-1.5">
          <ProgressBar value={pc.cpuUsage} label="CPU" />
          <ProgressBar value={pc.ramUsage} label="RAM" color="bg-purple-500" />
          <ProgressBar value={pc.diskUsage} label="Disk" color="bg-blue-400" />
        </div>
      ) : (
        <div className="text-xs text-slate-400 py-2 text-center">
          {pc.status === 'faulty' ? `⚠ ${pc.lastFault || 'Fault detected'}` :
           pc.status === 'maintenance' ? '🔧 Under maintenance' :
           '● No agent signal'}
        </div>
      )}

      {pc.assignedStudentName && (
        <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
          👤 {pc.assignedStudentName}
        </div>
      )}

      {pc.temperature !== undefined && (
        <div className={clsx('mt-1 text-xs', pc.temperature > 70 ? 'text-red-500' : 'text-slate-400')}>
          🌡 {Math.round(pc.temperature)}°C
        </div>
      )}

      {stale && pc.status !== 'offline' && (
        <div className="mt-2 text-xs text-amber-600 bg-amber-50 rounded px-2 py-1">
          ⚠ Stale – last seen {formatDistanceToNow(new Date(pc.lastHeartbeat))} ago
        </div>
      )}
    </div>
  );
}

function PCDetailModal({ pc, open, onClose }: { pc: PC | null; open: boolean; onClose: () => void }) {
  if (!pc) return null;
  return (
    <Modal open={open} onClose={onClose} title={`PC Details – ${pc.name}`} size="lg">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Status</p>
          <Badge variant={pc.status}>{pc.status}</Badge>
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Laboratory</p>
          <p className="text-sm font-medium text-slate-700">{pc.labName}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">IP Address</p>
          <p className="text-sm font-mono text-slate-700">{pc.ipAddress}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">MAC Address</p>
          <p className="text-sm font-mono text-slate-700">{pc.macAddress}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">OS</p>
          <p className="text-sm text-slate-700">{pc.osVersion}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">CPU</p>
          <p className="text-sm text-slate-700">{pc.cpu}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">RAM</p>
          <p className="text-sm text-slate-700">{pc.ramGb} GB</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Disk</p>
          <p className="text-sm text-slate-700">{pc.diskGb} GB</p>
        </div>
        {pc.assignedStudentName && (
          <div className="col-span-2">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Assigned Student</p>
            <p className="text-sm font-medium text-blue-700">👤 {pc.assignedStudentName}</p>
          </div>
        )}
        <div className="col-span-2">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-2">Resource Utilization</p>
          <div className="space-y-2">
            <ProgressBar value={pc.cpuUsage}  label="CPU"  />
            <ProgressBar value={pc.ramUsage}  label="RAM"  color="bg-purple-500" />
            <ProgressBar value={pc.diskUsage} label="Disk" color="bg-blue-400" />
          </div>
        </div>
        {pc.temperature !== undefined && (
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Temperature</p>
            <p className={clsx('text-sm font-medium', pc.temperature > 70 ? 'text-red-600' : 'text-slate-700')}>
              {Math.round(pc.temperature)}°C
              {pc.temperature > 70 && <span className="ml-1 text-red-500">⚠ High</span>}
            </p>
          </div>
        )}
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Network</p>
          <Badge variant={pc.networkStatus === 'connected' ? 'available' : 'offline'}>
            {pc.networkStatus}
          </Badge>
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Agent Version</p>
          <p className="text-sm font-mono text-slate-700">v{pc.agentVersion}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Last Heartbeat</p>
          <p className="text-sm text-slate-700">{format(new Date(pc.lastHeartbeat), 'dd MMM yyyy HH:mm:ss')}</p>
        </div>
        {pc.lastFault && (
          <div className="col-span-2 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs text-red-600 font-medium mb-1">⚠ Last Fault</p>
            <p className="text-sm text-red-700">{pc.lastFault}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function MonitoringPage() {
  const [pcs, setPcs] = useState<PC[]>(PCS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [labFilter, setLabFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid'|'table'>('grid');
  const [selectedPC, setSelectedPC] = useState<PC | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Live simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPcs(prev => prev.map(pc =>
        pc.status !== 'offline' && pc.status !== 'faulty' && pc.status !== 'maintenance'
          ? getSimulatedPCMetrics(pc)
          : pc
      ));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const filtered = pcs.filter(pc => {
    const matchSearch = pc.name.toLowerCase().includes(search.toLowerCase()) ||
                        pc.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || pc.status === statusFilter;
    const matchLab    = labFilter === 'all' || pc.labId === labFilter;
    return matchSearch && matchStatus && matchLab;
  });

  const openModal = (pc: PC) => { setSelectedPC(pc); setModalOpen(true); };

  const statusOptions = [
    { value:'all', label:'All Statuses' },
    { value:'available', label:'Available' },
    { value:'occupied', label:'Occupied' },
    { value:'offline', label:'Offline' },
    { value:'faulty', label:'Faulty' },
    { value:'maintenance', label:'Maintenance' },
  ];
  const labOptions = [
    { value:'all', label:'All Laboratories' },
    ...LABS.map(l => ({ value: l.id, label: l.name })),
  ];

  const summary = {
    total: pcs.length,
    available: pcs.filter(p=>p.status==='available').length,
    occupied: pcs.filter(p=>p.status==='occupied').length,
    offline: pcs.filter(p=>p.status==='offline').length,
    faulty: pcs.filter(p=>['faulty','maintenance'].includes(p.status)).length,
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader title="PC Monitoring" subtitle="Live status of all laboratory computers" />

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.entries(summary).map(([k, v]) => (
          <div key={k} className="bg-white rounded-xl border border-slate-200 px-4 py-3 text-center">
            <p className="text-2xl font-bold text-slate-800">{v}</p>
            <p className="text-xs text-slate-500 capitalize">{k}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card className="flex flex-col sm:flex-row gap-3 items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or ID…" className="flex-1" />
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} options={statusOptions} className="sm:w-44" />
        <Select value={labFilter} onChange={e => setLabFilter(e.target.value)} options={labOptions} className="sm:w-52" />
        <div className="flex gap-1">
          <Button variant={viewMode==='grid'?'primary':'outline'} size="sm" onClick={() => setViewMode('grid')}>⊞ Grid</Button>
          <Button variant={viewMode==='table'?'primary':'outline'} size="sm" onClick={() => setViewMode('table')}>☰ Table</Button>
        </div>
      </Card>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(pc => <PCCard key={pc.id} pc={pc} onClick={() => openModal(pc)} />)}
          {filtered.length === 0 && (
            <div className="col-span-full text-center text-slate-400 py-12">No PCs match the current filters.</div>
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['PC Name','Lab','Status','CPU %','RAM %','Disk %','Temp','Assigned To','Last Heartbeat',''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(pc => (
                  <tr key={pc.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => openModal(pc)}>
                    <td className="px-4 py-3 font-medium text-slate-700 flex items-center gap-2">
                      <PCStatusDot status={pc.status} /> {pc.name}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{pc.labName}</td>
                    <td className="px-4 py-3"><Badge variant={pc.status}>{pc.status}</Badge></td>
                    <td className="px-4 py-3">
                      <span className={pc.cpuUsage > 80 ? 'text-red-600 font-semibold' : 'text-slate-700'}>
                        {pc.status === 'offline' ? '—' : `${Math.round(pc.cpuUsage)}%`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={pc.ramUsage > 80 ? 'text-orange-600 font-semibold' : 'text-slate-700'}>
                        {pc.status === 'offline' ? '—' : `${Math.round(pc.ramUsage)}%`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{`${pc.diskUsage}%`}</td>
                    <td className="px-4 py-3">
                      {pc.temperature ? (
                        <span className={pc.temperature > 70 ? 'text-red-600 font-semibold' : 'text-slate-700'}>
                          {Math.round(pc.temperature)}°C
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{pc.assignedStudentName || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {isStale(pc.lastHeartbeat)
                        ? <span className="text-amber-500">⚠ {formatDistanceToNow(new Date(pc.lastHeartbeat))} ago</span>
                        : formatDistanceToNow(new Date(pc.lastHeartbeat)) + ' ago'}
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); openModal(pc); }}>Details</Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={10} className="text-center py-10 text-slate-400">No PCs found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <PCDetailModal pc={selectedPC} open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
