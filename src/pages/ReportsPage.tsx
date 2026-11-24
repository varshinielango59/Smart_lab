import React, { useState } from 'react';
import { format, subDays, subHours } from 'date-fns';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { Card, Badge, Button, PageHeader, Select, Tabs } from '../components/ui';
import { PCS, SESSIONS, SUBMISSIONS, FAULTS, EXERCISES } from '../data/mockData';

// ─── Mock analytics data ───────────────────────────────────────────────────
const now = new Date();

const dailyUsage = Array.from({length:14}, (_,i) => ({
  date: format(subDays(now, 13-i), 'dd MMM'),
  sessions: Math.floor(Math.random()*8+2),
  avgDuration: Math.floor(Math.random()*60+30),
}));

const uptimeData = [
  { lab:'Lab A', uptime:94.5, downtime:5.5 },
  { lab:'Lab B', uptime:88.0, downtime:12.0 },
  { lab:'Lab C', uptime:97.2, downtime:2.8 },
];

const submissionOutcomes = [
  { name:'Accepted', value: SUBMISSIONS.filter(s=>s.status==='accepted').length, color:'#10b981' },
  { name:'Rejected', value: SUBMISSIONS.filter(s=>s.status==='rejected').length, color:'#ef4444' },
  { name:'Pending',  value: SUBMISSIONS.filter(s=>['submitted','pending_evaluation'].includes(s.status)).length, color:'#f59e0b' },
  { name:'Error',    value: SUBMISSIONS.filter(s=>s.status==='evaluation_error').length, color:'#f97316' },
];

const faultByCategory = [
  { category:'Hardware',    count: FAULTS.filter(f=>f.category==='hardware').length },
  { category:'Software',    count: FAULTS.filter(f=>f.category==='software').length },
  { category:'Network',     count: FAULTS.filter(f=>f.category==='network').length },
  { category:'Application', count: FAULTS.filter(f=>f.category==='application').length },
];

const faultBySeverity = [
  { severity:'Critical', count: FAULTS.filter(f=>f.severity==='critical').length },
  { severity:'High',     count: FAULTS.filter(f=>f.severity==='high').length },
  { severity:'Medium',   count: FAULTS.filter(f=>f.severity==='medium').length },
  { severity:'Low',      count: FAULTS.filter(f=>f.severity==='low').length },
];

const exerciseSubmissionStats = EXERCISES.map(e => ({
  title: e.title.slice(0,18)+'…',
  submissions: SUBMISSIONS.filter(s=>s.exerciseId===e.id).length,
  accepted: SUBMISSIONS.filter(s=>s.exerciseId===e.id&&s.status==='accepted').length,
}));

function MetricRow({ label, value, unit='', highlight=false }: { label:string; value:number|string; unit?:string; highlight?:boolean }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`font-semibold text-sm ${highlight?'text-indigo-600':'text-slate-800'}`}>{value}{unit}</span>
    </div>
  );
}

export default function ReportsPage() {
  const [tab, setTab] = useState('overview');
  const [dateRange, setDateRange] = useState('14d');

  function exportCSV(data: Record<string,unknown>[], filename: string) {
    const keys = Object.keys(data[0]);
    const csv = [keys.join(','), ...data.map(row => keys.map(k=>String(row[k]??'')).join(','))].join('\n');
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=filename; a.click();
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Laboratory utilization, PC health, exercise outcomes, and audit data"
        actions={
          <Select value={dateRange} onChange={e=>setDateRange(e.target.value)} options={[
            {value:'7d',label:'Last 7 days'},
            {value:'14d',label:'Last 14 days'},
            {value:'30d',label:'Last 30 days'},
          ]} className="w-36" />
        }
      />

      <Tabs
        tabs={[
          {id:'overview', label:'Overview'},
          {id:'pcs', label:'PC Health'},
          {id:'exercises', label:'Exercises'},
          {id:'faults', label:'Faults'},
        ]}
        active={tab}
        onChange={setTab}
      />

      {/* ─── Overview ─── */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Daily sessions */}
          <Card padding={false}>
            <div className="p-5 pb-3 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-semibold text-slate-700">Daily Lab Sessions</h3>
              <Button size="sm" variant="outline" onClick={()=>exportCSV(dailyUsage,'sessions.csv')}>⬇ Export CSV</Button>
            </div>
            <div className="p-5">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={dailyUsage}>
                  <defs>
                    <linearGradient id="sessGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{fontSize:11,fill:'#94a3b8'}} />
                  <YAxis tick={{fontSize:11,fill:'#94a3b8'}} />
                  <RTooltip contentStyle={{borderRadius:8,fontSize:12}} />
                  <Area type="monotone" dataKey="sessions" name="Sessions" stroke="#6366f1" fill="url(#sessGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Lab uptime */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card padding={false}>
              <div className="p-5 pb-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-700">Lab PC Uptime (%)</h3>
              </div>
              <div className="p-5">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={uptimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="lab" tick={{fontSize:12,fill:'#64748b'}} />
                    <YAxis domain={[0,100]} tick={{fontSize:11,fill:'#94a3b8'}} unit="%" />
                    <RTooltip contentStyle={{borderRadius:8,fontSize:12}} />
                    <Bar dataKey="uptime" name="Uptime %" fill="#10b981" radius={[4,4,0,0]} />
                    <Bar dataKey="downtime" name="Downtime %" fill="#ef4444" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-slate-700 mb-4">Summary Metrics</h3>
              <MetricRow label="Total PCs"            value={PCS.length} />
              <MetricRow label="Online PCs"           value={PCS.filter(p=>!['offline'].includes(p.status)).length} highlight />
              <MetricRow label="Total Sessions"       value={SESSIONS.length} />
              <MetricRow label="Active Sessions"      value={SESSIONS.filter(s=>s.status==='active').length} highlight />
              <MetricRow label="Total Students"       value={10} />
              <MetricRow label="Published Exercises"  value={EXERCISES.filter(e=>e.status==='published').length} highlight />
              <MetricRow label="Total Submissions"    value={SUBMISSIONS.length} />
              <MetricRow label="Open Faults"          value={FAULTS.filter(f=>f.status!=='resolved').length} />
            </Card>
          </div>
        </div>
      )}

      {/* ─── PC Health ─── */}
      {tab === 'pcs' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-semibold text-slate-700 mb-4">PC Status Breakdown</h3>
              {['available','occupied','offline','faulty','maintenance'].map(st => {
                const count = PCS.filter(p=>p.status===st).length;
                const pct = Math.round(count/PCS.length*100);
                return (
                  <div key={st} className="flex items-center gap-3 mb-3">
                    <span className="capitalize text-sm text-slate-600 w-24">{st}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-indigo-500 transition-all" style={{width:`${pct}%`}} />
                    </div>
                    <span className="text-xs font-mono text-slate-500 w-16 text-right">{count} ({pct}%)</span>
                  </div>
                );
              })}
            </Card>

            <Card>
              <h3 className="font-semibold text-slate-700 mb-4">Avg. Resource Utilization</h3>
              {['cpu','ram','disk'].map(metric => {
                const activePCs = PCS.filter(p=>!['offline','faulty','maintenance'].includes(p.status));
                const avg = activePCs.length ? Math.round(activePCs.reduce((a,p)=>a+p[`${metric}Usage` as keyof typeof p] as any, 0)/activePCs.length) : 0;
                const colors = {cpu:'bg-indigo-500',ram:'bg-purple-500',disk:'bg-blue-400'};
                return (
                  <div key={metric} className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600 uppercase font-medium">{metric}</span>
                      <span className="font-semibold text-slate-700">{avg}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${colors[metric as 'cpu'|'ram'|'disk']}`} style={{width:`${avg}%`}} />
                    </div>
                  </div>
                );
              })}

              <div className="mt-4 pt-4 border-t border-slate-100">
                <MetricRow label="High CPU PCs (>80%)" value={PCS.filter(p=>p.cpuUsage>80).length} highlight />
                <MetricRow label="High RAM PCs (>80%)" value={PCS.filter(p=>p.ramUsage>80).length} />
                <MetricRow label="High Temp PCs (>70°C)" value={PCS.filter(p=>(p.temperature||0)>70).length} highlight />
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ─── Exercises ─── */}
      {tab === 'exercises' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card padding={false}>
              <div className="p-5 pb-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-700">Submission Outcomes</h3>
              </div>
              <div className="p-5">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={submissionOutcomes} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                      {submissionOutcomes.map((e,i)=><Cell key={i} fill={e.color} />)}
                    </Pie>
                    <RTooltip contentStyle={{borderRadius:8,fontSize:12}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card padding={false}>
              <div className="p-5 pb-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-700">Submissions per Exercise</h3>
              </div>
              <div className="p-5">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={exerciseSubmissionStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{fontSize:11,fill:'#94a3b8'}} />
                    <YAxis type="category" dataKey="title" tick={{fontSize:10,fill:'#64748b'}} width={90} />
                    <RTooltip contentStyle={{borderRadius:8,fontSize:12}} />
                    <Bar dataKey="submissions" name="Submissions" fill="#6366f1" radius={[0,4,4,0]} />
                    <Bar dataKey="accepted" name="Accepted" fill="#10b981" radius={[0,4,4,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={()=>exportCSV(exerciseSubmissionStats,'exercise_stats.csv')}>⬇ Export CSV</Button>
          </div>
        </div>
      )}

      {/* ─── Faults ─── */}
      {tab === 'faults' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card padding={false}>
              <div className="p-5 pb-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-700">Faults by Category</h3>
              </div>
              <div className="p-5">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={faultByCategory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="category" tick={{fontSize:11,fill:'#94a3b8'}} />
                    <YAxis tick={{fontSize:11,fill:'#94a3b8'}} />
                    <RTooltip contentStyle={{borderRadius:8,fontSize:12}} />
                    <Bar dataKey="count" name="Faults" fill="#f59e0b" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card padding={false}>
              <div className="p-5 pb-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-700">Faults by Severity</h3>
              </div>
              <div className="p-5">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={faultBySeverity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="severity" tick={{fontSize:11,fill:'#94a3b8'}} />
                    <YAxis tick={{fontSize:11,fill:'#94a3b8'}} />
                    <RTooltip contentStyle={{borderRadius:8,fontSize:12}} />
                    <Bar dataKey="count" name="Count" fill="#ef4444" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <Card>
            <h3 className="font-semibold text-slate-700 mb-4">Fault Resolution Metrics</h3>
            <MetricRow label="Total Faults"       value={FAULTS.length} />
            <MetricRow label="Open Faults"        value={FAULTS.filter(f=>f.status==='open').length} highlight />
            <MetricRow label="In Progress"        value={FAULTS.filter(f=>f.status==='in_progress').length} />
            <MetricRow label="Resolved"           value={FAULTS.filter(f=>f.status==='resolved').length} highlight />
            <MetricRow label="Resolution Rate"    value={Math.round(FAULTS.filter(f=>f.status==='resolved').length/FAULTS.length*100)} unit="%" />
            <MetricRow label="Critical Faults"    value={FAULTS.filter(f=>f.severity==='critical').length} highlight />
          </Card>
        </div>
      )}
    </div>
  );
}
