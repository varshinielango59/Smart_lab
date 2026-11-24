import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Card, Badge, SearchInput, Button, PageHeader,
  Select, Modal, Input, Textarea, Table, Avatar, Tabs
} from '../components/ui';
import { STUDENTS } from '../data/mockData';
import type { Student } from '../types';

const STATUS_OPTIONS = [
  { value:'all', label:'All Statuses' },
  { value:'active', label:'Active' },
  { value:'inactive', label:'Inactive' },
  { value:'suspended', label:'Suspended' },
];
const DEPT_OPTIONS = [
  { value:'all', label:'All Departments' },
  { value:'Computer Science', label:'Computer Science' },
  { value:'Electronics', label:'Electronics' },
  { value:'IT', label:'IT' },
  { value:'Mechanical', label:'Mechanical' },
];

function StudentForm({ student, onSave, onClose }: {
  student: Partial<Student>|null;
  onSave: (s: Partial<Student>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<Student>>(student || {
    name:'', rollNumber:'', email:'', department:'Computer Science', year:1,
    accountStatus:'active', rfidCardId:''
  });
  const set = (k: keyof Student, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Full Name"    value={form.name||''} onChange={e=>set('name',e.target.value)} placeholder="Student full name" />
        <Input label="Roll Number"  value={form.rollNumber||''} onChange={e=>set('rollNumber',e.target.value)} placeholder="e.g. CS21001" />
        <Input label="Email"        value={form.email||''} onChange={e=>set('email',e.target.value)} type="email" placeholder="student@college.edu" className="col-span-2" />
        <Select label="Department" value={form.department||''} onChange={e=>set('department',e.target.value)} options={DEPT_OPTIONS.slice(1)} />
        <Select label="Year" value={String(form.year||1)} onChange={e=>set('year',Number(e.target.value))} options={[1,2,3,4].map(y=>({value:String(y),label:`Year ${y}`}))} />
        <Input label="RFID Card ID" value={form.rfidCardId||''} onChange={e=>set('rfidCardId',e.target.value)} placeholder="RFID-XXXXXX (optional)" className="col-span-2" />
        <Select label="Account Status" value={form.accountStatus||'active'} onChange={e=>set('accountStatus',e.target.value as any)} options={[{value:'active',label:'Active'},{value:'inactive',label:'Inactive'},{value:'suspended',label:'Suspended'}]} />
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSave(form)}>Save Student</Button>
      </div>
    </div>
  );
}

function RFIDSimModal({ open, onClose, onAssign }: { open: boolean; onClose: () => void; onAssign: (rfid: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <Modal open={open} onClose={onClose} title="Assign RFID Card (Simulated)">
      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
          ⚠ <strong>Simulation mode.</strong> In production, this would scan a physical RFID reader. Enter a card ID manually.
        </div>
        <Input label="RFID Card ID" value={value} onChange={e=>setValue(e.target.value)} placeholder="e.g. RFID-AA11BB" />
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setValue(`RFID-${Math.random().toString(36).slice(2,8).toUpperCase()}`)}>
            🎲 Generate
          </Button>
          <Button onClick={() => { if(value.trim()) { onAssign(value.trim()); onClose(); } }} className="ml-auto">
            Assign Card
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(STUDENTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [editModal, setEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Partial<Student>|null>(null);
  const [rfidModal, setRfidModal] = useState(false);
  const [rfidTarget, setRfidTarget] = useState<Student|null>(null);
  const [detailModal, setDetailModal] = useState(false);
  const [detailStudent, setDetailStudent] = useState<Student|null>(null);

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = s.name.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
    const matchStatus = statusFilter==='all' || s.accountStatus===statusFilter;
    const matchDept   = deptFilter==='all' || s.department===deptFilter;
    return matchSearch && matchStatus && matchDept;
  });

  function handleSave(form: Partial<Student>) {
    if (form.id) {
      setStudents(prev => prev.map(s => s.id===form.id ? {...s,...form} as Student : s));
    } else {
      const newS: Student = { ...form as any, id:`s-${Date.now()}`, totalSessions:0, totalSubmissions:0, enrolledDate:new Date().toISOString() };
      setStudents(prev => [...prev, newS]);
    }
    setEditModal(false);
  }

  function handleRFID(rfid: string) {
    if (!rfidTarget) return;
    const dup = students.find(s => s.rfidCardId===rfid && s.id!==rfidTarget.id);
    if (dup) { alert(`RFID ${rfid} is already assigned to ${dup.name}.`); return; }
    setStudents(prev => prev.map(s => s.id===rfidTarget.id ? {...s, rfidCardId:rfid} : s));
  }

  const columns = [
    { key:'name', label:'Student', render:(s:Student)=>(
      <div className="flex items-center gap-3">
        <Avatar initials={s.name.split(' ').map(w=>w[0]).join('').slice(0,2)} size="sm" />
        <div>
          <p className="font-medium text-slate-700">{s.name}</p>
          <p className="text-xs text-slate-400">{s.email}</p>
        </div>
      </div>
    )},
    { key:'rollNumber', label:'Roll No.' },
    { key:'department', label:'Department', render:(s:Student)=><span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{s.department}</span> },
    { key:'year', label:'Year', render:(s:Student)=>`Year ${s.year}` },
    { key:'rfidCardId', label:'RFID Card', render:(s:Student)=>
      s.rfidCardId
        ? <span className="font-mono text-xs text-slate-600">{s.rfidCardId}</span>
        : <span className="text-xs text-slate-400 italic">Not assigned</span>
    },
    { key:'accountStatus', label:'Status', render:(s:Student)=><Badge variant={s.accountStatus}>{s.accountStatus}</Badge> },
    { key:'totalSessions', label:'Sessions' },
    { key:'totalSubmissions', label:'Submissions' },
    { key:'actions', label:'', render:(s:Student)=>(
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" onClick={e=>{e.stopPropagation();setDetailStudent(s);setDetailModal(true);}}>View</Button>
        <Button size="sm" variant="ghost" onClick={e=>{e.stopPropagation();setEditTarget(s);setEditModal(true);}}>Edit</Button>
        <Button size="sm" variant="outline" onClick={e=>{e.stopPropagation();setRfidTarget(s);setRfidModal(true);}}>RFID</Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Student Management"
        subtitle="Register and manage student RFID cards and accounts"
        actions={<Button onClick={()=>{setEditTarget(null);setEditModal(true);}}>+ Add Student</Button>}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-center">
          <p className="text-2xl font-bold text-slate-800">{students.length}</p>
          <p className="text-xs text-slate-500">Total</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-center">
          <p className="text-2xl font-bold text-green-600">{students.filter(s=>s.accountStatus==='active').length}</p>
          <p className="text-xs text-slate-500">Active</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{students.filter(s=>s.rfidCardId).length}</p>
          <p className="text-xs text-slate-500">RFID Registered</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-center">
          <p className="text-2xl font-bold text-red-600">{students.filter(s=>s.accountStatus==='suspended').length}</p>
          <p className="text-xs text-slate-500">Suspended</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="flex flex-col sm:flex-row gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Name, roll number, or ID…" className="flex-1" />
        <Select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} options={STATUS_OPTIONS} className="sm:w-44" />
        <Select value={deptFilter} onChange={e=>setDeptFilter(e.target.value)} options={DEPT_OPTIONS} className="sm:w-52" />
      </Card>

      {/* Table */}
      <Card padding={false}>
        <Table
          columns={columns as any}
          data={filtered}
          keyField="id"
          onRowClick={s=>{setDetailStudent(s);setDetailModal(true);}}
          emptyMessage="No students match your search."
        />
      </Card>

      {/* Edit modal */}
      <Modal open={editModal} onClose={()=>setEditModal(false)} title={editTarget?.id ? 'Edit Student' : 'Register New Student'} size="lg">
        <StudentForm student={editTarget} onSave={handleSave} onClose={()=>setEditModal(false)} />
      </Modal>

      {/* RFID modal */}
      <RFIDSimModal open={rfidModal} onClose={()=>setRfidModal(false)} onAssign={handleRFID} />

      {/* Detail modal */}
      {detailStudent && (
        <Modal open={detailModal} onClose={()=>setDetailModal(false)} title={`Student Profile – ${detailStudent.name}`} size="md">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar initials={detailStudent.name.split(' ').map(w=>w[0]).join('').slice(0,2)} size="lg" />
              <div>
                <h3 className="font-semibold text-slate-800 text-lg">{detailStudent.name}</h3>
                <p className="text-sm text-slate-500">{detailStudent.rollNumber} · {detailStudent.department}, Year {detailStudent.year}</p>
                <Badge variant={detailStudent.accountStatus}>{detailStudent.accountStatus}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div><p className="text-xs text-slate-500 uppercase font-medium mb-1">Email</p><p className="text-sm text-slate-700">{detailStudent.email}</p></div>
              <div><p className="text-xs text-slate-500 uppercase font-medium mb-1">RFID Card</p><p className="text-sm font-mono text-slate-700">{detailStudent.rfidCardId||'Not assigned'}</p></div>
              <div><p className="text-xs text-slate-500 uppercase font-medium mb-1">Sessions</p><p className="text-2xl font-bold text-slate-800">{detailStudent.totalSessions}</p></div>
              <div><p className="text-xs text-slate-500 uppercase font-medium mb-1">Submissions</p><p className="text-2xl font-bold text-slate-800">{detailStudent.totalSubmissions}</p></div>
              <div><p className="text-xs text-slate-500 uppercase font-medium mb-1">Enrolled</p><p className="text-sm text-slate-700">{format(new Date(detailStudent.enrolledDate),'dd MMM yyyy')}</p></div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
