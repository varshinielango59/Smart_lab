import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Card, Badge, Button, PageHeader,
  Input, Select, Modal, Tabs, Textarea, Avatar, Table
} from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { USERS, LABS, AUDIT_LOGS } from '../data/mockData';
import type { AuditLog } from '../types';

export default function SettingsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ name: user?.name||'', email: user?.email||'' });
  const [pwForm, setPwForm] = useState({ current:'', new:'', confirm:'' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [interval, setIntervalVal] = useState('30');
  const [demoMode, setDemoMode] = useState(true);
  const [theme, setTheme] = useState('light');
  const [saved, setSaved] = useState(false);

  function handleSaveProfile() {
    setSaved(true);
    setTimeout(()=>setSaved(false), 2000);
  }

  function handleChangePw() {
    if (!pwForm.current || !pwForm.new || !pwForm.confirm) { setPwError('All fields are required.'); return; }
    if (pwForm.new !== pwForm.confirm) { setPwError('New passwords do not match.'); return; }
    if (pwForm.new.length < 8) { setPwError('Password must be at least 8 characters.'); return; }
    setPwError('');
    setPwSuccess(true);
    setPwForm({current:'',new:'',confirm:''});
    setTimeout(()=>setPwSuccess(false), 3000);
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader title="Settings & Administration" subtitle="Manage your account, system configuration, and preferences" />

      <Tabs
        tabs={[
          {id:'profile', label:'Profile'},
          {id:'users', label:'Users & Roles'},
          {id:'labs', label:'Labs & PCs'},
          {id:'system', label:'System'},
          {id:'audit', label:'Audit Log'},
        ]}
        active={tab}
        onChange={setTab}
      />

      {/* ─── Profile ─── */}
      {tab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <h3 className="font-semibold text-slate-700 mb-5">Personal Information</h3>
            <div className="flex items-center gap-4 mb-6">
              <Avatar initials={user?.avatarInitials||user?.name?.slice(0,2).toUpperCase()||'?'} size="lg" />
              <div>
                <p className="font-semibold text-slate-800">{user?.name}</p>
                <Badge variant={user?.role==='admin'?'faulty':user?.role==='faculty'?'published':'available'}>{user?.role}</Badge>
              </div>
            </div>
            <div className="space-y-4">
              <Input label="Full Name" value={profileForm.name} onChange={e=>setProfileForm(p=>({...p,name:e.target.value}))} />
              <Input label="Email Address" value={profileForm.email} onChange={e=>setProfileForm(p=>({...p,email:e.target.value}))} type="email" />
              <Input label="Department" value={user?.department||''} readOnly className="bg-slate-50 cursor-not-allowed" />
              <Button onClick={handleSaveProfile}>{saved ? '✅ Saved!' : 'Save Changes'}</Button>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200">
              <h4 className="font-semibold text-slate-700 mb-4">Change Password</h4>
              <div className="space-y-3">
                <Input label="Current Password" type="password" value={pwForm.current} onChange={e=>setPwForm(p=>({...p,current:e.target.value}))} />
                <Input label="New Password" type="password" value={pwForm.new} onChange={e=>setPwForm(p=>({...p,new:e.target.value}))} />
                <Input label="Confirm New Password" type="password" value={pwForm.confirm} onChange={e=>setPwForm(p=>({...p,confirm:e.target.value}))} />
                {pwError && <p className="text-sm text-red-600">{pwError}</p>}
                {pwSuccess && <p className="text-sm text-green-600">✅ Password changed successfully.</p>}
                <Button onClick={handleChangePw}>Update Password</Button>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-slate-700 mb-4">Account Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Role</span>
                <Badge variant={user?.role==='admin'?'faulty':'published'}>{user?.role}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">User ID</span>
                <span className="font-mono text-xs text-slate-700">{user?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department</span>
                <span className="text-slate-700">{user?.department}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200">
              <h4 className="font-semibold text-slate-600 mb-3 text-sm">Theme Preference</h4>
              <div className="flex gap-2">
                {['light','dark','system'].map(t=>(
                  <button
                    key={t}
                    onClick={()=>setTheme(t)}
                    className={`flex-1 py-2 text-xs rounded-lg border font-medium capitalize transition-colors cursor-pointer ${theme===t?'bg-indigo-50 border-indigo-300 text-indigo-700':'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    {t==='light'?'☀️':t==='dark'?'🌙':'🖥️'} {t}
                  </button>
                ))}
              </div>
              <p className="text-xs text-amber-600 mt-2">Dark mode is a future enhancement.</p>
            </div>
          </Card>
        </div>
      )}

      {/* ─── Users ─── */}
      {tab === 'users' && (
        <Card padding={false}>
          <div className="p-5 pb-3 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-semibold text-slate-700">System Users</h3>
            <Button size="sm">+ Add User</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Name','Email','Role','Department','Actions'].map(h=>(
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {USERS.map(u=>(
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar initials={u.avatarInitials||u.name.slice(0,2)} size="sm" />
                        <span className="font-medium text-slate-700">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={u.role==='admin'?'faulty':u.role==='faculty'?'published':'available'}>{u.role}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{u.department}</td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="ghost">Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ─── Labs ─── */}
      {tab === 'labs' && (
        <div className="space-y-4">
          {LABS.map(lab=>(
            <Card key={lab.id} className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-700">{lab.name}</h4>
                <p className="text-sm text-slate-400">{lab.building}, {lab.floor} Floor · Capacity: {lab.capacity} PCs</p>
              </div>
              <Button size="sm" variant="outline">Configure</Button>
            </Card>
          ))}
          <Button variant="outline" size="sm">+ Add Laboratory</Button>
        </div>
      )}

      {/* ─── System ─── */}
      {tab === 'system' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-semibold text-slate-700 mb-4">API & Connection Status</h3>
            <div className="space-y-3">
              {[
                {label:'Backend API', status:'demo', detail:'Spring Boot API not connected'},
                {label:'MySQL Database', status:'demo', detail:'MySQL not connected'},
                {label:'Windows Agent', status:'demo', detail:'No agents connected (simulated data)'},
                {label:'RFID Reader', status:'demo', detail:'No physical reader (simulation mode)'},
              ].map(item=>(
                <div key={item.label} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-amber-400 shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-slate-700">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-slate-700 mb-4">Monitoring Configuration</h3>
            <div className="space-y-4">
              <Select
                label="PC Heartbeat Interval"
                value={interval}
                onChange={e=>setIntervalVal(e.target.value)}
                options={[{value:'15',label:'15 seconds'},{value:'30',label:'30 seconds'},{value:'60',label:'1 minute'},{value:'300',label:'5 minutes'}]}
              />
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm text-slate-700">Simulation Mode</p>
                  <p className="text-xs text-slate-400">Use simulated data instead of real agents</p>
                </div>
                <button
                  onClick={()=>setDemoMode(v=>!v)}
                  className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${demoMode?'bg-amber-400':'bg-slate-300'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${demoMode?'translate-x-5':'translate-x-0.5'}`} />
                </button>
              </div>
              <Button>Save Configuration</Button>
            </div>
          </Card>
        </div>
      )}

      {/* ─── Audit ─── */}
      {tab === 'audit' && (
        <Card padding={false}>
          <div className="p-5 pb-3 border-b border-slate-100">
            <h3 className="font-semibold text-slate-700">Audit Log</h3>
            <p className="text-xs text-slate-400 mt-0.5">System events and administrative actions</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Timestamp','User','Action','Resource','Detail','IP Address'].map(h=>(
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {AUDIT_LOGS.map(log=>(
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-xs text-slate-400 font-mono">{format(new Date(log.timestamp),'dd MMM HH:mm:ss')}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{log.userName}</td>
                    <td className="px-4 py-3"><Badge variant="default">{log.action}</Badge></td>
                    <td className="px-4 py-3 text-slate-500">{log.resource}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs max-w-xs">{log.detail}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
