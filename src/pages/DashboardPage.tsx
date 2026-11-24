import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { format, subHours } from 'date-fns';
import {
  Card, StatCard, Badge, PageHeader, ProgressBar
} from '../components/ui';
import {
  PCS, SESSIONS, EXERCISES, SUBMISSIONS, FAULTS,
  STUDENTS, computeDashboardMetrics, getSimulatedPCMetrics
} from '../data/mockData';
import type { PC } from '../types';

// Simulated CPU data for the last 12 hours
function genCpuData() {
  return Array.from({ length: 12 }, (_, i) => ({
    time: format(subHours(new Date(), 11 - i), 'HH:mm'),
    avg: Math.round(35 + Math.random() * 35),
    peak: Math.round(60 + Math.random() * 30),
  }));
}

const LAB_UTIL = [
  { lab: 'Lab A', total: 8, occupied: 3, available: 3, faulty: 1, offline: 1 },
  { lab: 'Lab B', total: 3, occupied: 1, available: 1, faulty: 0, offline: 0, maintenance: 1 },
  { lab: 'Lab C', total: 1, occupied: 0, available: 1, faulty: 0, offline: 0 },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(computeDashboardMetrics());
  const [pcs, setPcs] = useState<PC[]>(PCS);
  const [cpuData] = useState(genCpuData());
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Simulate live updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPcs(prev => prev.map(pc =>
        pc.status !== 'offline' && pc.status !== 'faulty' && pc.status !== 'maintenance'
          ? getSimulatedPCMetrics(pc)
          : pc
      ));
      setMetrics(computeDashboardMetrics());
      setLastUpdated(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const statusDist = [
    { name: 'Available', value: metrics.availablePCs,  color: '#10b981' },
    { name: 'Occupied',  value: metrics.occupiedPCs,   color: '#3b82f6' },
    { name: 'Faulty',    value: metrics.faultyPCs,     color: '#ef4444' },
    { name: 'Offline',   value: metrics.offlinePCs,    color: '#94a3b8' },
  ];

  const activeSessions = SESSIONS.filter(s => s.status === 'active');
  const recentFaults = FAULTS.filter(f => f.status !== 'resolved').slice(0, 4);
  const recentSubs = SUBMISSIONS.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Dashboard"
        subtitle={`Last updated: ${format(lastUpdated, 'HH:mm:ss')}`}
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Total PCs"        value={metrics.totalPCs}           icon={<span className="text-xl">🖥️</span>}  color="indigo" />
        <StatCard label="Online"           value={metrics.onlinePCs}          icon={<span className="text-xl">✅</span>}  color="green"  subtitle="Active agents" />
        <StatCard label="Available"        value={metrics.availablePCs}       icon={<span className="text-xl">🟢</span>}  color="green" />
        <StatCard label="Occupied"         value={metrics.occupiedPCs}        icon={<span className="text-xl">👤</span>}  color="blue" />
        <StatCard label="Faulty / Maint."  value={metrics.faultyPCs}         icon={<span className="text-xl">⚠️</span>}  color="red" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Active Sessions"   value={metrics.activeSessions}    icon={<span className="text-xl">⏱️</span>}  color="blue" />
        <StatCard label="Offline PCs"       value={metrics.offlinePCs}        icon={<span className="text-xl">🔴</span>}  color="slate" />
        <StatCard label="Open Faults"       value={metrics.pendingFaults}     icon={<span className="text-xl">🔧</span>}  color="amber" />
        <StatCard label="Live Exercises"    value={metrics.publishedExercises}icon={<span className="text-xl">📝</span>}  color="purple" />
        <StatCard label="Pending Review"    value={metrics.pendingSubmissions} icon={<span className="text-xl">📤</span>}  color="amber" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CPU Trend */}
        <Card className="lg:col-span-2" padding={false}>
          <div className="p-5 pb-3 border-b border-slate-100">
            <h3 className="font-semibold text-slate-700">Average CPU Utilization (Last 12h) <span className="text-xs text-amber-500 font-normal ml-1">· simulated</span></h3>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={cpuData}>
                <defs>
                  <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis domain={[0,100]} tick={{ fontSize: 11, fill: '#94a3b8' }} unit="%" />
                <RTooltip contentStyle={{ borderRadius:8, border:'1px solid #e2e8f0', fontSize:12 }} />
                <Area type="monotone" dataKey="peak" stroke="#f59e0b" strokeWidth={1.5} fill="none" name="Peak%" strokeDasharray="4 2" />
                <Area type="monotone" dataKey="avg"  stroke="#6366f1" strokeWidth={2}   fill="url(#cpuGrad)" name="Avg%" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* PC Status Pie */}
        <Card padding={false}>
          <div className="p-5 pb-3 border-b border-slate-100">
            <h3 className="font-semibold text-slate-700">PC Status Distribution</h3>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {statusDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <RTooltip contentStyle={{ borderRadius:8, fontSize:12 }} />
                <Legend wrapperStyle={{ fontSize:12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Lab Utilization Bar */}
      <Card padding={false}>
        <div className="p-5 pb-3 border-b border-slate-100">
          <h3 className="font-semibold text-slate-700">Laboratory PC Utilization</h3>
        </div>
        <div className="p-5">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={LAB_UTIL} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize:11, fill:'#94a3b8' }} />
              <YAxis type="category" dataKey="lab" tick={{ fontSize:12, fill:'#64748b' }} width={50} />
              <RTooltip contentStyle={{ borderRadius:8, fontSize:12 }} />
              <Bar dataKey="occupied"  name="Occupied"  fill="#3b82f6" stackId="a" radius={[0,0,0,0]} />
              <Bar dataKey="available" name="Available" fill="#10b981" stackId="a" />
              <Bar dataKey="faulty"    name="Faulty"    fill="#ef4444" stackId="a" />
              <Bar dataKey="offline"   name="Offline"   fill="#94a3b8" stackId="a" />
              <Bar dataKey="maintenance" name="Maintenance" fill="#f59e0b" stackId="a" radius={[0,4,4,0]} />
              <Legend wrapperStyle={{ fontSize:12 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Sessions */}
        <Card padding={false}>
          <div className="p-5 pb-3 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-semibold text-slate-700">Active Sessions <Badge variant="active">{activeSessions.length}</Badge></h3>
            <button className="text-xs text-indigo-600 hover:underline cursor-pointer" onClick={() => navigate('/sessions')}>View all</button>
          </div>
          <div className="divide-y divide-slate-50">
            {activeSessions.map(s => (
              <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-dot shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{s.studentName}</p>
                  <p className="text-xs text-slate-400">{s.pcName} · {s.labName}</p>
                </div>
                <span className="ml-auto text-xs text-slate-400 shrink-0">
                  {format(new Date(s.loginTime), 'HH:mm')}
                </span>
              </div>
            ))}
            {activeSessions.length === 0 && <p className="text-center text-slate-400 text-sm py-8">No active sessions</p>}
          </div>
        </Card>

        {/* Open Faults */}
        <Card padding={false}>
          <div className="p-5 pb-3 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-semibold text-slate-700">Open Faults</h3>
            <button className="text-xs text-indigo-600 hover:underline cursor-pointer" onClick={() => navigate('/faults')}>View all</button>
          </div>
          <div className="divide-y divide-slate-50">
            {recentFaults.map(f => (
              <div key={f.id} className="px-5 py-3 flex items-start gap-3">
                <Badge variant={f.severity}>{f.severity}</Badge>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{f.pcName}</p>
                  <p className="text-xs text-slate-400 line-clamp-1">{f.description}</p>
                </div>
              </div>
            ))}
            {recentFaults.length === 0 && <p className="text-center text-slate-400 text-sm py-8">No open faults 🎉</p>}
          </div>
        </Card>

        {/* PC Load snapshot */}
        <Card padding={false}>
          <div className="p-5 pb-3 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-semibold text-slate-700">PC Load Snapshot</h3>
            <button className="text-xs text-indigo-600 hover:underline cursor-pointer" onClick={() => navigate('/monitoring')}>All PCs</button>
          </div>
          <div className="divide-y divide-slate-50">
            {pcs.filter(p => p.status === 'occupied').slice(0,4).map(pc => (
              <div key={pc.id} className="px-5 py-3 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700">{pc.name}</span>
                  <span className="text-slate-400">{pc.assignedStudentName}</span>
                </div>
                <ProgressBar value={pc.cpuUsage} label="CPU" />
                <ProgressBar value={pc.ramUsage} label="RAM" color="bg-purple-500" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Submissions */}
      <Card padding={false}>
        <div className="p-5 pb-3 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-semibold text-slate-700">Recent Submissions</h3>
          <button className="text-xs text-indigo-600 hover:underline cursor-pointer" onClick={() => navigate('/submissions')}>View all</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Student</th>
                <th className="px-5 py-3 text-left font-semibold">Exercise</th>
                <th className="px-5 py-3 text-left font-semibold">Submitted</th>
                <th className="px-5 py-3 text-left font-semibold">Status</th>
                <th className="px-5 py-3 text-left font-semibold">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentSubs.map(s => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-700">{s.studentName} <span className="text-slate-400 font-normal">({s.studentRoll})</span></td>
                  <td className="px-5 py-3 text-slate-600">{s.exerciseTitle}</td>
                  <td className="px-5 py-3 text-slate-400">{format(new Date(s.submittedAt), 'dd MMM HH:mm')}</td>
                  <td className="px-5 py-3"><Badge variant={s.status as any}>{s.status.replace('_',' ')}</Badge></td>
                  <td className="px-5 py-3 font-medium">{s.score !== undefined ? `${s.score}/${s.maxScore}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
