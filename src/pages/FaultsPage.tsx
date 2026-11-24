import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Card, Badge, SearchInput, Button, PageHeader,
  Select, Modal, Textarea, Input, Table, Tabs
} from '../components/ui';
import { FAULTS } from '../data/mockData';
import type { Fault, FaultStatus, FaultSeverity, FaultCategory } from '../types';

const SEVERITY_COLORS: Record<FaultSeverity, string> = {
  low: 'text-slate-600', medium: 'text-amber-600', high: 'text-orange-600', critical: 'text-red-600'
};

const CATEGORY_ICONS: Record<FaultCategory, string> = {
  hardware: '🖥️', software: '💻', network: '🌐', application: '⚙️'
};

export default function FaultsPage() {
  const [faults, setFaults] = useState<Fault[]>(FAULTS);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('open');
  const [catFilter, setCatFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [detailModal, setDetailModal] = useState(false);
  const [detailFault, setDetailFault] = useState<Fault|null>(null);
  const [updateNote, setUpdateNote] = useState('');
  const [updateStatus, setUpdateStatus] = useState<FaultStatus>('open');
  const [createModal, setCreateModal] = useState(false);
  const [newFault, setNewFault] = useState<Partial<Fault>>({category:'hardware',severity:'medium',status:'open'});

  const filtered = faults.filter(f => {
    const q = search.toLowerCase();
    const matchSearch = f.pcName.toLowerCase().includes(q) || f.description.toLowerCase().includes(q);
    const matchTab = tab==='all' || (tab==='open' && f.status==='open') ||
      (tab==='in_progress' && f.status==='in_progress') || (tab==='resolved' && f.status==='resolved');
    const matchCat  = catFilter==='all' || f.category===catFilter;
    const matchSev  = severityFilter==='all' || f.severity===severityFilter;
    return matchSearch && matchTab && matchCat && matchSev;
  });

  function handleUpdateFault() {
    if (!detailFault) return;
    setFaults(prev => prev.map(f =>
      f.id === detailFault.id
        ? { ...f, status: updateStatus, resolutionNotes: updateNote,
            resolvedAt: updateStatus==='resolved' ? new Date().toISOString() : f.resolvedAt }
        : f
    ));
    setDetailModal(false);
  }

  function handleCreateFault() {
    const f: Fault = {
      ...newFault as any,
      id: `flt-${Date.now()}`,
      reportedAt: new Date().toISOString(),
      reportedBy: 'Admin',
      labId: 'lab-01',
      labName: 'Lab A – Programming',
      pcName: newFault.pcId || 'PC-Unknown',
    };
    setFaults(prev => [...prev, f]);
    setCreateModal(false);
    setNewFault({category:'hardware',severity:'medium',status:'open'});
  }

  const openFaults = faults.filter(f=>f.status==='open');
  const inProgress = faults.filter(f=>f.status==='in_progress');
  const resolved   = faults.filter(f=>f.status==='resolved');

  const columns = [
    { key:'id', label:'ID', render:(f:Fault)=><span className="font-mono text-xs text-slate-400">{f.id}</span> },
    { key:'category', label:'Category', render:(f:Fault)=>(
      <span className="flex items-center gap-1.5 text-sm">
        {CATEGORY_ICONS[f.category]} {f.category}
      </span>
    )},
    { key:'pcName', label:'PC', render:(f:Fault)=><span className="font-mono text-sm font-medium">{f.pcName}</span> },
    { key:'labName', label:'Lab', render:(f:Fault)=><span className="text-xs text-slate-500">{f.labName}</span> },
    { key:'description', label:'Description', render:(f:Fault)=>(
      <span className="text-sm text-slate-600 line-clamp-1 max-w-xs">{f.description}</span>
    )},
    { key:'severity', label:'Severity', render:(f:Fault)=><Badge variant={f.severity}>{f.severity}</Badge> },
    { key:'status', label:'Status', render:(f:Fault)=><Badge variant={f.status}>{f.status.replace('_',' ')}</Badge> },
    { key:'reportedAt', label:'Reported', render:(f:Fault)=>(
      <span className="text-xs text-slate-400">{format(new Date(f.reportedAt),'dd MMM HH:mm')}</span>
    )},
    { key:'assignedTechnician', label:'Assigned', render:(f:Fault)=>(
      <span className="text-xs text-slate-500">{f.assignedTechnician||'—'}</span>
    )},
    { key:'actions', label:'', render:(f:Fault)=>(
      <Button size="sm" variant="ghost" onClick={e=>{e.stopPropagation();setDetailFault(f);setUpdateStatus(f.status);setUpdateNote(f.resolutionNotes||'');setDetailModal(true);}}>
        Update
      </Button>
    )},
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Fault Management"
        subtitle="Track, categorize, and resolve laboratory hardware and software issues"
        actions={<Button onClick={()=>setCreateModal(true)}>+ Report Fault</Button>}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center">
          <p className="text-2xl font-bold text-red-700">{openFaults.length}</p>
          <p className="text-xs text-red-500">Open</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-center">
          <p className="text-2xl font-bold text-amber-700">{inProgress.length}</p>
          <p className="text-xs text-amber-500">In Progress</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-center">
          <p className="text-2xl font-bold text-green-700">{resolved.length}</p>
          <p className="text-xs text-green-500">Resolved</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-center">
          <p className="text-2xl font-bold text-slate-800">{faults.length}</p>
          <p className="text-xs text-slate-500">Total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <Tabs
          tabs={[
            {id:'open', label:'Open', count:openFaults.length},
            {id:'in_progress', label:'In Progress', count:inProgress.length},
            {id:'resolved', label:'Resolved', count:resolved.length},
            {id:'all', label:'All', count:faults.length},
          ]}
          active={tab}
          onChange={setTab}
        />
        <Card className="flex flex-col sm:flex-row gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="PC name or description…" className="flex-1" />
          <Select value={catFilter} onChange={e=>setCatFilter(e.target.value)} options={[
            {value:'all',label:'All Categories'},
            {value:'hardware',label:'Hardware'},
            {value:'software',label:'Software'},
            {value:'network',label:'Network'},
            {value:'application',label:'Application'},
          ]} className="sm:w-44" />
          <Select value={severityFilter} onChange={e=>setSeverityFilter(e.target.value)} options={[
            {value:'all',label:'All Severities'},
            {value:'critical',label:'Critical'},
            {value:'high',label:'High'},
            {value:'medium',label:'Medium'},
            {value:'low',label:'Low'},
          ]} className="sm:w-40" />
        </Card>
      </div>

      <Card padding={false}>
        <Table
          columns={columns as any}
          data={filtered}
          keyField="id"
          onRowClick={f=>{setDetailFault(f);setUpdateStatus(f.status);setUpdateNote(f.resolutionNotes||'');setDetailModal(true);}}
          emptyMessage="No faults found in this category."
        />
      </Card>

      {/* Update modal */}
      {detailFault && (
        <Modal open={detailModal} onClose={()=>setDetailModal(false)} title={`Fault – ${detailFault.pcName}`} size="lg"
          footer={<>
            <Button variant="outline" onClick={()=>setDetailModal(false)}>Cancel</Button>
            <Button onClick={handleUpdateFault}>Save Update</Button>
          </>}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-slate-400 uppercase font-medium mb-1">Category</p><span className="flex items-center gap-1">{CATEGORY_ICONS[detailFault.category]} {detailFault.category}</span></div>
              <div><p className="text-xs text-slate-400 uppercase font-medium mb-1">Severity</p><Badge variant={detailFault.severity}>{detailFault.severity}</Badge></div>
              <div><p className="text-xs text-slate-400 uppercase font-medium mb-1">Reported</p><p>{format(new Date(detailFault.reportedAt),'dd MMM yyyy HH:mm')}</p></div>
              <div><p className="text-xs text-slate-400 uppercase font-medium mb-1">Reported By</p><p>{detailFault.reportedBy}</p></div>
              {detailFault.assignedTechnician && (
                <div><p className="text-xs text-slate-400 uppercase font-medium mb-1">Technician</p><p>{detailFault.assignedTechnician}</p></div>
              )}
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-medium mb-1">Description</p>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{detailFault.description}</p>
            </div>
            <Select
              label="Update Status"
              value={updateStatus}
              onChange={e=>setUpdateStatus(e.target.value as FaultStatus)}
              options={[{value:'open',label:'Open'},{value:'in_progress',label:'In Progress'},{value:'resolved',label:'Resolved'}]}
            />
            <Textarea
              label="Resolution Notes"
              value={updateNote}
              onChange={e=>setUpdateNote(e.target.value)}
              rows={3}
              placeholder="Describe the actions taken to resolve this fault…"
            />
            {detailFault.resolvedAt && (
              <p className="text-xs text-green-600">✅ Resolved at: {format(new Date(detailFault.resolvedAt),'dd MMM yyyy HH:mm')}</p>
            )}
          </div>
        </Modal>
      )}

      {/* Create fault modal */}
      <Modal open={createModal} onClose={()=>setCreateModal(false)} title="Report New Fault" size="md"
        footer={<>
          <Button variant="outline" onClick={()=>setCreateModal(false)}>Cancel</Button>
          <Button onClick={handleCreateFault}>Report Fault</Button>
        </>}
      >
        <div className="space-y-4">
          <Input label="PC ID / Name" value={newFault.pcId||''} onChange={e=>setNewFault(p=>({...p,pcId:e.target.value}))} placeholder="e.g. PC-A01" />
          <Select label="Category" value={newFault.category||'hardware'} onChange={e=>setNewFault(p=>({...p,category:e.target.value as FaultCategory}))} options={[
            {value:'hardware',label:'Hardware'},{value:'software',label:'Software'},
            {value:'network',label:'Network'},{value:'application',label:'Application'},
          ]} />
          <Select label="Severity" value={newFault.severity||'medium'} onChange={e=>setNewFault(p=>({...p,severity:e.target.value as FaultSeverity}))} options={[
            {value:'low',label:'Low'},{value:'medium',label:'Medium'},
            {value:'high',label:'High'},{value:'critical',label:'Critical'},
          ]} />
          <Textarea label="Description" value={newFault.description||''} onChange={e=>setNewFault(p=>({...p,description:e.target.value}))} rows={3} placeholder="Describe the fault in detail…" />
          <Input label="Assigned Technician (optional)" value={newFault.assignedTechnician||''} onChange={e=>setNewFault(p=>({...p,assignedTechnician:e.target.value}))} placeholder="Technician name" />
        </div>
      </Modal>
    </div>
  );
}
