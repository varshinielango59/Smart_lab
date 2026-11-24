import React, { useState } from 'react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import {
  Card, Badge, Button, PageHeader,
  Input, Modal, Spinner
} from '../components/ui';
import { PCS, STUDENTS, SESSIONS } from '../data/mockData';
import type { PC, Student, Session } from '../types';

type AllocationState = 'idle' | 'scanning' | 'validating' | 'selecting' | 'allocated' | 'error';

function PCAllocationGrid({ pcs, onSelect, disabled }: { pcs: PC[]; onSelect: (pc: PC) => void; disabled: boolean }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {pcs.map(pc => {
        const isAvail = pc.status === 'available';
        return (
          <button
            key={pc.id}
            onClick={() => isAvail && !disabled && onSelect(pc)}
            disabled={!isAvail || disabled}
            className={clsx(
              'rounded-xl border p-4 text-left transition-all duration-200',
              isAvail && !disabled
                ? 'border-green-300 bg-green-50 hover:bg-green-100 cursor-pointer hover:shadow-md'
                : 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-70'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm text-slate-800">{pc.name}</span>
              <Badge variant={pc.status}>{pc.status}</Badge>
            </div>
            <p className="text-xs text-slate-500 mb-2">{pc.labName}</p>
            {isAvail && (
              <div className="text-xs text-green-600 font-medium">Click to allocate →</div>
            )}
            {pc.status === 'occupied' && (
              <div className="text-xs text-blue-500">👤 {pc.assignedStudentName}</div>
            )}
            {pc.status === 'faulty' && (
              <div className="text-xs text-red-500">⚠ Fault reported</div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function AllocationPage() {
  const [pcs, setPcs] = useState<PC[]>(PCS);
  const [sessions, setSessions] = useState<Session[]>(SESSIONS);
  const [rfidInput, setRfidInput] = useState('');
  const [state, setState] = useState<AllocationState>('idle');
  const [foundStudent, setFoundStudent] = useState<Student|null>(null);
  const [allocatedPC, setAllocatedPC] = useState<PC|null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmModal, setConfirmModal] = useState<{pc:PC}|null>(null);
  const [endModal, setEndModal] = useState<{session:Session}|null>(null);

  const activeSessions = sessions.filter(s => s.status === 'active');
  const availablePCs = pcs.filter(p => p.status === 'available');

  async function handleScan() {
    if (!rfidInput.trim()) return;
    setState('scanning');
    setErrorMsg('');
    setFoundStudent(null);

    // Simulate API call
    await new Promise(r => setTimeout(r, 800));
    setState('validating');
    await new Promise(r => setTimeout(r, 600));

    const student = STUDENTS.find(s => s.rfidCardId === rfidInput.trim() || s.rollNumber === rfidInput.trim());
    if (!student) {
      setErrorMsg(`No student found with RFID / Roll Number: "${rfidInput}"`);
      setState('error');
      return;
    }
    if (student.accountStatus !== 'active') {
      setErrorMsg(`Account is ${student.accountStatus}. Cannot allocate a PC.`);
      setState('error');
      return;
    }
    const existing = sessions.find(s => s.studentId === student.id && s.status === 'active');
    if (existing) {
      setErrorMsg(`${student.name} already has an active session on ${existing.pcName}.`);
      setState('error');
      return;
    }
    if (availablePCs.length === 0) {
      setErrorMsg('No PCs are currently available in any laboratory.');
      setState('error');
      return;
    }

    setFoundStudent(student);
    setState('selecting');
  }

  function handleSelectPC(pc: PC) {
    setConfirmModal({ pc });
  }

  async function confirmAllocation(pc: PC) {
    setConfirmModal(null);
    if (!foundStudent) return;

    await new Promise(r => setTimeout(r, 500));

    // Update PC
    setPcs(prev => prev.map(p =>
      p.id === pc.id
        ? { ...p, status:'occupied', assignedStudentId: foundStudent.id, assignedStudentName: foundStudent.name }
        : p
    ));

    // Create session
    const newSession: Session = {
      id: `sess-${Date.now()}`,
      studentId: foundStudent.id,
      studentName: foundStudent.name,
      studentRoll: foundStudent.rollNumber,
      pcId: pc.id,
      pcName: pc.name,
      labId: pc.labId,
      labName: pc.labName,
      loginTime: new Date().toISOString(),
      status: 'active',
    };
    setSessions(prev => [...prev, newSession]);
    setAllocatedPC(pc);
    setState('allocated');
  }

  function handleEndSession(session: Session) {
    setEndModal(null);
    // Release PC
    setPcs(prev => prev.map(p =>
      p.id === session.pcId
        ? { ...p, status:'available', assignedStudentId: undefined, assignedStudentName: undefined }
        : p
    ));
    // End session
    const now = new Date().toISOString();
    const loginT = new Date(session.loginTime).getTime();
    const mins = Math.round((Date.now() - loginT) / 60000);
    setSessions(prev => prev.map(s =>
      s.id === session.id
        ? { ...s, status:'ended', logoutTime: now, durationMinutes: mins }
        : s
    ));
  }

  function reset() {
    setRfidInput('');
    setState('idle');
    setFoundStudent(null);
    setAllocatedPC(null);
    setErrorMsg('');
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader title="PC Allocation" subtitle="RFID-based automatic student PC assignment" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocation Wizard */}
        <Card className="lg:col-span-1">
          <h3 className="font-semibold text-slate-700 mb-4">🔌 Allocate PC</h3>

          {state === 'idle' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                🔑 Scan an RFID card or enter a roll number to identify the student.
              </div>
              <Input
                label="RFID Card ID or Roll Number"
                value={rfidInput}
                onChange={e => setRfidInput(e.target.value)}
                placeholder="e.g. RFID-AA11BB or CS21001"
                onKeyDown={e => e.key === 'Enter' && handleScan()}
              />
              <div className="grid grid-cols-2 gap-2">
                {STUDENTS.filter(s=>s.rfidCardId).slice(0,4).map(s=>(
                  <button
                    key={s.id}
                    onClick={() => setRfidInput(s.rfidCardId!)}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg px-2 py-1.5 text-left transition-colors cursor-pointer"
                  >
                    {s.name.split(' ')[0]} · {s.rfidCardId?.slice(-6)}
                  </button>
                ))}
              </div>
              <Button className="w-full" onClick={handleScan} disabled={!rfidInput.trim()}>
                🔍 Identify Student
              </Button>
            </div>
          )}

          {(state === 'scanning' || state === 'validating') && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Spinner size="lg" />
              <p className="text-sm text-slate-500">
                {state === 'scanning' ? 'Reading RFID card…' : 'Validating student record…'}
              </p>
            </div>
          )}

          {state === 'error' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                ⚠ {errorMsg}
              </div>
              <Button variant="outline" className="w-full" onClick={reset}>Try Again</Button>
            </div>
          )}

          {state === 'selecting' && foundStudent && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-xs text-green-600 font-semibold uppercase mb-2">✅ Student Verified</p>
                <p className="font-semibold text-slate-800">{foundStudent.name}</p>
                <p className="text-sm text-slate-500">{foundStudent.rollNumber} · {foundStudent.department}</p>
                <Badge variant={foundStudent.accountStatus}>{foundStudent.accountStatus}</Badge>
              </div>
              <p className="text-sm text-slate-600">
                <strong>{availablePCs.length}</strong> PC{availablePCs.length !== 1 ? 's' : ''} available. Select one below ↓
              </p>
              <Button variant="outline" size="sm" className="w-full" onClick={reset}>Cancel</Button>
            </div>
          )}

          {state === 'allocated' && foundStudent && allocatedPC && (
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">🎉</div>
                <p className="font-semibold text-indigo-800 text-lg">{allocatedPC.name}</p>
                <p className="text-sm text-indigo-600">Allocated to <strong>{foundStudent.name}</strong></p>
                <p className="text-xs text-indigo-400 mt-1">{allocatedPC.labName}</p>
              </div>
              <Button className="w-full" onClick={reset}>Allocate Another</Button>
            </div>
          )}
        </Card>

        {/* PC Grid */}
        <div className="lg:col-span-2 space-y-4">
          <Card padding={false}>
            <div className="p-5 pb-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-700">Available PCs — Select to Allocate</h3>
              <p className="text-xs text-slate-400 mt-1">{availablePCs.length} of {pcs.length} PCs available</p>
            </div>
            <div className="p-5">
              <PCAllocationGrid
                pcs={pcs}
                onSelect={handleSelectPC}
                disabled={state !== 'selecting'}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Active Sessions Table */}
      <Card padding={false}>
        <div className="p-5 pb-3 border-b border-slate-100">
          <h3 className="font-semibold text-slate-700">Active Sessions ({activeSessions.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Student','Roll No.','PC','Laboratory','Login Time','Duration','Action'].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeSessions.map(s => {
                const mins = Math.round((Date.now() - new Date(s.loginTime).getTime()) / 60000);
                return (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-700">{s.studentName}</td>
                    <td className="px-4 py-3 text-slate-500">{s.studentRoll}</td>
                    <td className="px-4 py-3 font-mono text-sm">{s.pcName}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{s.labName}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{format(new Date(s.loginTime),'HH:mm')}</td>
                    <td className="px-4 py-3 text-slate-500">{mins}m</td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="danger" onClick={() => setEndModal({session:s})}>End Session</Button>
                    </td>
                  </tr>
                );
              })}
              {activeSessions.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-slate-400">No active sessions.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Confirm allocation modal */}
      <Modal open={!!confirmModal} onClose={() => setConfirmModal(null)} title="Confirm PC Allocation"
        footer={<>
          <Button variant="outline" onClick={()=>setConfirmModal(null)}>Cancel</Button>
          <Button onClick={()=>confirmModal && confirmAllocation(confirmModal.pc)}>Confirm Allocation</Button>
        </>}
      >
        {confirmModal && foundStudent && (
          <div className="space-y-3 text-sm text-slate-700">
            <p>Allocate <strong>{confirmModal.pc.name}</strong> ({confirmModal.pc.labName}) to:</p>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="font-semibold">{foundStudent.name}</p>
              <p className="text-slate-500">{foundStudent.rollNumber} · {foundStudent.department}</p>
            </div>
            <p className="text-xs text-slate-400">This will create a new session record and mark the PC as occupied.</p>
          </div>
        )}
      </Modal>

      {/* End session modal */}
      <Modal open={!!endModal} onClose={()=>setEndModal(null)} title="End Session"
        footer={<>
          <Button variant="outline" onClick={()=>setEndModal(null)}>Cancel</Button>
          <Button variant="danger" onClick={()=>endModal && handleEndSession(endModal.session)}>End Session & Release PC</Button>
        </>}
      >
        {endModal && (
          <div className="text-sm text-slate-700">
            <p>End the session for <strong>{endModal.session.studentName}</strong> on <strong>{endModal.session.pcName}</strong>?</p>
            <p className="text-xs text-slate-400 mt-2">The PC will be released and marked as available.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
