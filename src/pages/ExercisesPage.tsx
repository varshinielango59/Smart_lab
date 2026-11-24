import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Card, Badge, SearchInput, Button, PageHeader,
  Select, Modal, Input, Textarea, Tabs, Table
} from '../components/ui';
import { EXERCISES, SUBMISSIONS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import type { Exercise, ExerciseStatus } from '../types';

const LANG_OPTIONS = [
  {value:'Python',label:'Python'},{value:'Java',label:'Java'},{value:'C++',label:'C++'},
  {value:'C',label:'C'},{value:'JavaScript',label:'JavaScript'},{value:'SQL',label:'SQL'},
];

function ExerciseForm({ exercise, onSave, onClose }: {
  exercise: Partial<Exercise>|null;
  onSave: (e: Partial<Exercise>) => void;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [form, setForm] = useState<Partial<Exercise>>(exercise || {
    title:'', description:'', language:'Python', inputRequirements:'',
    outputRequirements:'', constraints:'', deadline:'', status:'draft', maxScore:100,
  });
  const set = (k: keyof Exercise, v: any) => setForm(p => ({...p,[k]:v}));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Title" value={form.title||''} onChange={e=>set('title',e.target.value)} placeholder="Exercise title" className="col-span-2" />
        <Select label="Language" value={form.language||'Python'} onChange={e=>set('language',e.target.value)} options={LANG_OPTIONS} />
        <Input label="Deadline" type="datetime-local" value={form.deadline?.slice(0,16)||''} onChange={e=>set('deadline',new Date(e.target.value).toISOString())} />
        <Input label="Max Score" type="number" value={String(form.maxScore||100)} onChange={e=>set('maxScore',Number(e.target.value))} />
        <Select label="Status" value={form.status||'draft'} onChange={e=>set('status',e.target.value as ExerciseStatus)} options={[{value:'draft',label:'Draft'},{value:'published',label:'Published'},{value:'closed',label:'Closed'}]} />
      </div>
      <Textarea label="Problem Description" value={form.description||''} onChange={e=>set('description',e.target.value)} rows={4} placeholder="Describe the problem clearly…" />
      <div className="grid grid-cols-2 gap-4">
        <Textarea label="Input Requirements"  value={form.inputRequirements||''}  onChange={e=>set('inputRequirements',e.target.value)}  rows={3} />
        <Textarea label="Output Requirements" value={form.outputRequirements||''} onChange={e=>set('outputRequirements',e.target.value)} rows={3} />
      </div>
      <Textarea label="Constraints" value={form.constraints||''} onChange={e=>set('constraints',e.target.value)} rows={2} placeholder="Time limit, memory limit, value ranges…" />
      <div className="flex gap-3 justify-end pt-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={()=>onSave({...form, createdBy: user?.id, createdByName: user?.name, createdAt: new Date().toISOString()})}>
          Save Exercise
        </Button>
      </div>
    </div>
  );
}

function ExerciseCard({ ex, onEdit, onView, onStatusChange }: {
  ex: Exercise;
  onEdit: () => void;
  onView: () => void;
  onStatusChange: (status: ExerciseStatus) => void;
}) {
  return (
    <Card hover onClick={onView}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-800 truncate">{ex.title}</h4>
          <p className="text-xs text-slate-400 mt-0.5">{ex.createdByName} · {format(new Date(ex.createdAt),'dd MMM yyyy')}</p>
        </div>
        <div className="flex gap-2 shrink-0 ml-3">
          <Badge variant={ex.status}>{ex.status}</Badge>
          <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-mono">{ex.language}</span>
        </div>
      </div>
      <p className="text-sm text-slate-600 line-clamp-2 mb-3">{ex.description}</p>
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>📅 Deadline: {format(new Date(ex.deadline),'dd MMM yyyy HH:mm')}</span>
        <span>🏆 {ex.maxScore} pts</span>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2" onClick={e=>e.stopPropagation()}>
        <Button size="sm" variant="ghost" onClick={onEdit}>Edit</Button>
        {ex.status === 'draft' && <Button size="sm" variant="primary" onClick={()=>onStatusChange('published')}>Publish</Button>}
        {ex.status === 'published' && <Button size="sm" variant="outline" onClick={()=>onStatusChange('closed')}>Close</Button>}
        {ex.status === 'closed' && <Button size="sm" variant="ghost" onClick={()=>onStatusChange('draft')}>Reopen as Draft</Button>}
      </div>
    </Card>
  );
}

export default function ExercisesPage() {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>(EXERCISES);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [formModal, setFormModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Partial<Exercise>|null>(null);
  const [detailEx, setDetailEx] = useState<Exercise|null>(null);
  const [detailModal, setDetailModal] = useState(false);
  const [codeModal, setCodeModal] = useState(false);
  const [submitEx, setSubmitEx] = useState<Exercise|null>(null);
  const [codeText, setCodeText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isFacOrAdmin = user?.role === 'faculty' || user?.role === 'admin';

  function handleSave(form: Partial<Exercise>) {
    if (form.id) {
      setExercises(prev => prev.map(e => e.id===form.id ? {...e,...form} as Exercise : e));
    } else {
      const newEx: Exercise = {
        ...form as any,
        id: `ex-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setExercises(prev => [...prev, newEx]);
    }
    setFormModal(false);
  }

  function handleStatusChange(id: string, status: ExerciseStatus) {
    setExercises(prev => prev.map(e => e.id===id ? {...e, status} : e));
  }

  const filtered = exercises
    .filter(e => {
      const q = search.toLowerCase();
      const matchSearch = e.title.toLowerCase().includes(q) || e.language.toLowerCase().includes(q);
      const matchTab = tab==='all' ||
        (tab==='draft' && e.status==='draft') ||
        (tab==='published' && e.status==='published') ||
        (tab==='closed' && e.status==='closed');
      const matchRole = !isFacOrAdmin ? e.status==='published' : true;
      return matchSearch && matchTab && matchRole;
    });

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Programming Exercises"
        subtitle={isFacOrAdmin ? 'Create and manage lab exercises' : 'View and submit solutions'}
        actions={isFacOrAdmin && (
          <Button onClick={()=>{setEditTarget(null);setFormModal(true);}}>+ New Exercise</Button>
        )}
      />

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search exercises…" className="flex-1" />
        <Tabs
          tabs={[
            {id:'all', label:'All', count:exercises.length},
            {id:'published', label:'Published', count:exercises.filter(e=>e.status==='published').length},
            {id:'draft', label:'Draft', count:exercises.filter(e=>e.status==='draft').length},
            {id:'closed', label:'Closed', count:exercises.filter(e=>e.status==='closed').length},
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(ex => (
          isFacOrAdmin
            ? <ExerciseCard
                key={ex.id} ex={ex}
                onEdit={()=>{setEditTarget(ex);setFormModal(true);}}
                onView={()=>{setDetailEx(ex);setDetailModal(true);}}
                onStatusChange={status=>handleStatusChange(ex.id,status)}
              />
            : (
              <Card key={ex.id} hover onClick={()=>{setDetailEx(ex);setDetailModal(true);}}>
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-800 flex-1 truncate">{ex.title}</h4>
                  <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-mono ml-2">{ex.language}</span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2 mb-3">{ex.description}</p>
                <div className="text-xs text-slate-400 mb-3">📅 Due: {format(new Date(ex.deadline),'dd MMM yyyy HH:mm')}</div>
                <Button size="sm" onClick={e=>{e.stopPropagation();setSubmitEx(ex);setCodeModal(true);}}>Submit Solution</Button>
              </Card>
            )
        ))}
        {filtered.length===0 && (
          <div className="col-span-full text-center text-slate-400 py-12">No exercises found.</div>
        )}
      </div>

      {/* Create/Edit modal */}
      <Modal open={formModal} onClose={()=>setFormModal(false)} title={editTarget?.id ? 'Edit Exercise' : 'New Exercise'} size="xl">
        <ExerciseForm exercise={editTarget} onSave={handleSave} onClose={()=>setFormModal(false)} />
      </Modal>

      {/* Detail modal */}
      {detailEx && (
        <Modal open={detailModal} onClose={()=>setDetailModal(false)} title={detailEx.title} size="xl">
          <div className="space-y-4 text-sm">
            <div className="flex gap-3 flex-wrap">
              <Badge variant={detailEx.status}>{detailEx.status}</Badge>
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-mono">{detailEx.language}</span>
              <span className="text-slate-400">🏆 {detailEx.maxScore} pts</span>
              <span className="text-slate-400">📅 {format(new Date(detailEx.deadline),'dd MMM yyyy HH:mm')}</span>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Problem Statement</p>
              <p className="text-slate-700 leading-relaxed">{detailEx.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Input</p>
                <p className="text-slate-700 text-sm bg-slate-50 p-2 rounded">{detailEx.inputRequirements}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Output</p>
                <p className="text-slate-700 text-sm bg-slate-50 p-2 rounded">{detailEx.outputRequirements}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Constraints</p>
              <p className="text-slate-700 bg-slate-50 p-2 rounded font-mono text-xs">{detailEx.constraints}</p>
            </div>
            {detailEx.testCases && detailEx.testCases.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase mb-2">Sample Test Cases</p>
                <div className="space-y-2">
                  {detailEx.testCases.map((tc,i)=>(
                    <div key={i} className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Input {i+1}</p>
                        <pre className="bg-slate-900 text-green-400 text-xs p-2 rounded font-mono overflow-x-auto">{tc.input}</pre>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Expected Output</p>
                        <pre className="bg-slate-900 text-blue-400 text-xs p-2 rounded font-mono overflow-x-auto">{tc.expectedOutput}</pre>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {user?.role === 'student' && detailEx.status === 'published' && (
              <Button className="w-full" onClick={()=>{setSubmitEx(detailEx);setCodeModal(true);setDetailModal(false);}}>
                ✍ Submit Solution
              </Button>
            )}
          </div>
        </Modal>
      )}

      {/* Submit code modal */}
      {submitEx && (
        <Modal open={codeModal} onClose={()=>{setCodeModal(false);setSubmitted(false);setCodeText('');}} title={`Submit – ${submitEx.title}`} size="xl">
          {!submitted ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                Language: <strong>{submitEx.language}</strong> · Max Score: {submitEx.maxScore} pts
                <br /><span className="text-xs text-amber-600">Note: Code execution is not active. Submission is tracked only.</span>
              </div>
              <Textarea
                label="Your Solution"
                value={codeText}
                onChange={e=>setCodeText(e.target.value)}
                rows={15}
                placeholder={`Write your ${submitEx.language} solution here…`}
                className="font-mono text-xs"
              />
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={()=>setCodeModal(false)}>Cancel</Button>
                <Button onClick={()=>{if(codeText.trim()) setSubmitted(true);}}>Submit Solution</Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-3">
              <div className="text-4xl">✅</div>
              <h3 className="font-semibold text-slate-800 text-lg">Submission Received!</h3>
              <p className="text-sm text-slate-500">Your solution has been submitted and is pending evaluation by the faculty.</p>
              <Button onClick={()=>{setCodeModal(false);setSubmitted(false);setCodeText('');}}>Close</Button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
