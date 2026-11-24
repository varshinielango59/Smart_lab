import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Card, Badge, SearchInput, Button, PageHeader,
  Select, Modal, Textarea, Table
} from '../components/ui';
import { SUBMISSIONS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import type { Submission, SubmissionStatus } from '../types';

const STATUS_OPTIONS = [
  {value:'all',label:'All Statuses'},
  {value:'submitted',label:'Submitted'},
  {value:'pending_evaluation',label:'Pending Evaluation'},
  {value:'accepted',label:'Accepted'},
  {value:'rejected',label:'Rejected'},
  {value:'evaluation_error',label:'Evaluation Error'},
];

export default function SubmissionsPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>(SUBMISSIONS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<Submission|null>(null);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState('');
  const [newStatus, setNewStatus] = useState<SubmissionStatus>('accepted');
  const [detailModal, setDetailModal] = useState(false);
  const [detailSub, setDetailSub] = useState<Submission|null>(null);

  const isFacOrAdmin = user?.role === 'faculty' || user?.role === 'admin';

  const filtered = submissions.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = s.studentName.toLowerCase().includes(q) ||
                        s.studentRoll.toLowerCase().includes(q) ||
                        s.exerciseTitle.toLowerCase().includes(q);
    const matchStatus = statusFilter==='all' || s.status===statusFilter;
    const matchRole   = !isFacOrAdmin ? s.studentId === user?.id.replace('u-stu-01','s-01') : true; // demo student
    return matchSearch && matchStatus;
  });

  function handleReviewSave() {
    if (!reviewTarget) return;
    setSubmissions(prev => prev.map(s =>
      s.id === reviewTarget.id
        ? {...s, status: newStatus, score: Number(score)||undefined, facultyFeedback: feedback}
        : s
    ));
    setReviewModal(false);
  }

  const columns = [
    { key:'id', label:'#', render:(s:Submission)=><span className="font-mono text-xs text-slate-400">{s.id}</span> },
    { key:'studentName', label:'Student', render:(s:Submission)=>(
      <div>
        <p className="font-medium text-slate-700">{s.studentName}</p>
        <p className="text-xs text-slate-400">{s.studentRoll}</p>
      </div>
    )},
    { key:'exerciseTitle', label:'Exercise', render:(s:Submission)=>(
      <span className="text-sm text-slate-700 max-w-xs truncate block">{s.exerciseTitle}</span>
    )},
    { key:'language', label:'Lang', render:(s:Submission)=>(
      <span className="text-xs font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{s.language}</span>
    )},
    { key:'submittedAt', label:'Submitted', render:(s:Submission)=>(
      <span className="text-xs text-slate-400">{format(new Date(s.submittedAt),'dd MMM HH:mm')}</span>
    )},
    { key:'status', label:'Status', render:(s:Submission)=><Badge variant={s.status}>{s.status.replace(/_/g,' ')}</Badge> },
    { key:'score', label:'Score', render:(s:Submission)=>(
      s.score !== undefined ? <span className="font-semibold text-slate-700">{s.score}/{s.maxScore}</span> : <span className="text-slate-400">—</span>
    )},
    { key:'actions', label:'', render:(s:Submission)=>(
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" onClick={e=>{e.stopPropagation();setDetailSub(s);setDetailModal(true);}}>View</Button>
        {isFacOrAdmin && (
          <Button size="sm" variant="outline" onClick={e=>{
            e.stopPropagation();
            setReviewTarget(s);
            setFeedback(s.facultyFeedback||'');
            setScore(String(s.score||''));
            setNewStatus(s.status==='submitted'||s.status==='pending_evaluation' ? 'accepted' : s.status);
            setReviewModal(true);
          }}>Review</Button>
        )}
      </div>
    )},
  ];

  const countByStatus = (st: SubmissionStatus) => submissions.filter(s=>s.status===st).length;

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader title="Submissions" subtitle="Review and evaluate student code submissions" />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          {label:'Total',         val:submissions.length,                    color:'text-slate-800'},
          {label:'Submitted',     val:countByStatus('submitted'),            color:'text-purple-600'},
          {label:'Pending',       val:countByStatus('pending_evaluation'),   color:'text-amber-600'},
          {label:'Accepted',      val:countByStatus('accepted'),             color:'text-green-600'},
          {label:'Rejected',      val:countByStatus('rejected'),             color:'text-red-600'},
        ].map(item=>(
          <div key={item.label} className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-center">
            <p className={`text-2xl font-bold ${item.color}`}>{item.val}</p>
            <p className="text-xs text-slate-500">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card className="flex flex-col sm:flex-row gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Student name, roll, or exercise…" className="flex-1" />
        <Select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} options={STATUS_OPTIONS} className="sm:w-52" />
      </Card>

      {/* Table */}
      <Card padding={false}>
        <Table
          columns={columns as any}
          data={filtered}
          keyField="id"
          onRowClick={s=>{setDetailSub(s);setDetailModal(true);}}
          emptyMessage="No submissions found."
        />
      </Card>

      {/* Detail modal */}
      {detailSub && (
        <Modal open={detailModal} onClose={()=>setDetailModal(false)} title={`Submission – ${detailSub.exerciseTitle}`} size="lg">
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-xs text-slate-400 uppercase font-medium mb-1">Student</p><p className="font-medium text-slate-700">{detailSub.studentName} ({detailSub.studentRoll})</p></div>
              <div><p className="text-xs text-slate-400 uppercase font-medium mb-1">Status</p><Badge variant={detailSub.status}>{detailSub.status.replace(/_/g,' ')}</Badge></div>
              <div><p className="text-xs text-slate-400 uppercase font-medium mb-1">Submitted</p><p className="text-slate-600">{format(new Date(detailSub.submittedAt),'dd MMM yyyy HH:mm')}</p></div>
              <div><p className="text-xs text-slate-400 uppercase font-medium mb-1">Score</p><p className="font-semibold text-slate-700">{detailSub.score !== undefined ? `${detailSub.score}/${detailSub.maxScore}` : 'Not graded'}</p></div>
            </div>
            {detailSub.facultyFeedback && (
              <div>
                <p className="text-xs text-slate-400 uppercase font-medium mb-1">Faculty Feedback</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-slate-700">{detailSub.facultyFeedback}</div>
              </div>
            )}
            {detailSub.code && (
              <div>
                <p className="text-xs text-slate-400 uppercase font-medium mb-1">Submitted Code</p>
                <pre className="bg-slate-900 text-green-400 text-xs p-4 rounded-lg overflow-x-auto font-mono max-h-60">{detailSub.code}</pre>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Review modal */}
      {reviewTarget && (
        <Modal open={reviewModal} onClose={()=>setReviewModal(false)} title={`Review – ${reviewTarget.exerciseTitle}`} size="md"
          footer={<>
            <Button variant="outline" onClick={()=>setReviewModal(false)}>Cancel</Button>
            <Button onClick={handleReviewSave}>Save Evaluation</Button>
          </>}
        >
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="font-medium text-slate-700">{reviewTarget.studentName}</p>
              <p className="text-xs text-slate-400">{reviewTarget.studentRoll} · Submitted {format(new Date(reviewTarget.submittedAt),'dd MMM HH:mm')}</p>
            </div>
            <Select
              label="Evaluation Status"
              value={newStatus}
              onChange={e=>setNewStatus(e.target.value as SubmissionStatus)}
              options={[
                {value:'accepted',label:'Accepted'},
                {value:'rejected',label:'Rejected'},
                {value:'pending_evaluation',label:'Pending Evaluation'},
                {value:'evaluation_error',label:'Evaluation Error'},
              ]}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Score (out of {reviewTarget.maxScore})</label>
              <input
                type="number" min={0} max={reviewTarget.maxScore}
                value={score} onChange={e=>setScore(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <Textarea label="Faculty Feedback" value={feedback} onChange={e=>setFeedback(e.target.value)} rows={4} placeholder="Provide constructive feedback…" />
          </div>
        </Modal>
      )}
    </div>
  );
}
