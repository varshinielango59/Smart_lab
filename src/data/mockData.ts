import type {
  PC, Student, Session, Exercise, Submission, Fault,
  Laboratory, AuditLog, DashboardMetrics, User
} from '../types';
import { subMinutes, subHours, subDays, format } from 'date-fns';

const now = new Date();
const fmt = (d: Date) => d.toISOString();

// ─── Laboratories ─────────────────────────────────────────────────────────────
export const LABS: Laboratory[] = [
  { id: 'lab-01', name: 'Lab A – Programming', building: 'Block C', floor: '2nd', capacity: 30 },
  { id: 'lab-02', name: 'Lab B – Networking',  building: 'Block C', floor: '3rd', capacity: 25 },
  { id: 'lab-03', name: 'Lab C – Research',    building: 'Block D', floor: '1st', capacity: 20 },
];

// ─── PCs ─────────────────────────────────────────────────────────────────────
export const PCS: PC[] = [
  { id:'pc-01', name:'PC-A01', labId:'lab-01', labName:'Lab A – Programming', status:'occupied',   ipAddress:'192.168.1.101', macAddress:'A4:C3:F0:11:11:01', osVersion:'Windows 11 Pro', cpu:'Intel i7-12700', ramGb:16, diskGb:512, cpuUsage:72, ramUsage:58, diskUsage:45, networkStatus:'connected', temperature:54, assignedStudentId:'s-01', assignedStudentName:'Aanya Sharma',    lastHeartbeat: fmt(subMinutes(now,1)),  agentVersion:'1.2.4' },
  { id:'pc-02', name:'PC-A02', labId:'lab-01', labName:'Lab A – Programming', status:'available',  ipAddress:'192.168.1.102', macAddress:'A4:C3:F0:11:11:02', osVersion:'Windows 11 Pro', cpu:'Intel i7-12700', ramGb:16, diskGb:512, cpuUsage:5,  ramUsage:22, diskUsage:30, networkStatus:'connected', temperature:38, lastHeartbeat: fmt(subMinutes(now,2)),  agentVersion:'1.2.4' },
  { id:'pc-03', name:'PC-A03', labId:'lab-01', labName:'Lab A – Programming', status:'occupied',   ipAddress:'192.168.1.103', macAddress:'A4:C3:F0:11:11:03', osVersion:'Windows 11 Pro', cpu:'Intel i7-12700', ramGb:16, diskGb:512, cpuUsage:85, ramUsage:71, diskUsage:52, networkStatus:'connected', temperature:61, assignedStudentId:'s-02', assignedStudentName:'Rohan Mehta',      lastHeartbeat: fmt(subMinutes(now,1)),  agentVersion:'1.2.4' },
  { id:'pc-04', name:'PC-A04', labId:'lab-01', labName:'Lab A – Programming', status:'faulty',    ipAddress:'192.168.1.104', macAddress:'A4:C3:F0:11:11:04', osVersion:'Windows 11 Pro', cpu:'Intel i7-12700', ramGb:16, diskGb:512, cpuUsage:0,  ramUsage:0,  diskUsage:42, networkStatus:'disconnected', lastHeartbeat: fmt(subHours(now,3)),   agentVersion:'1.2.3', lastFault:'GPU overheat detected' },
  { id:'pc-05', name:'PC-A05', labId:'lab-01', labName:'Lab A – Programming', status:'available',  ipAddress:'192.168.1.105', macAddress:'A4:C3:F0:11:11:05', osVersion:'Windows 11 Pro', cpu:'Intel i7-12700', ramGb:16, diskGb:512, cpuUsage:3,  ramUsage:18, diskUsage:28, networkStatus:'connected', temperature:36, lastHeartbeat: fmt(subMinutes(now,3)),  agentVersion:'1.2.4' },
  { id:'pc-06', name:'PC-A06', labId:'lab-01', labName:'Lab A – Programming', status:'occupied',   ipAddress:'192.168.1.106', macAddress:'A4:C3:F0:11:11:06', osVersion:'Windows 11 Pro', cpu:'Intel i7-12700', ramGb:16, diskGb:512, cpuUsage:63, ramUsage:49, diskUsage:35, networkStatus:'connected', temperature:48, assignedStudentId:'s-03', assignedStudentName:'Priya Nair',      lastHeartbeat: fmt(subMinutes(now,2)),  agentVersion:'1.2.4' },
  { id:'pc-07', name:'PC-A07', labId:'lab-01', labName:'Lab A – Programming', status:'offline',   ipAddress:'192.168.1.107', macAddress:'A4:C3:F0:11:11:07', osVersion:'Windows 10 Pro', cpu:'Intel i5-11400', ramGb:8,  diskGb:256, cpuUsage:0,  ramUsage:0,  diskUsage:60, networkStatus:'disconnected', lastHeartbeat: fmt(subHours(now,8)),   agentVersion:'1.2.2' },
  { id:'pc-08', name:'PC-A08', labId:'lab-01', labName:'Lab A – Programming', status:'available',  ipAddress:'192.168.1.108', macAddress:'A4:C3:F0:11:11:08', osVersion:'Windows 11 Pro', cpu:'Intel i7-12700', ramGb:16, diskGb:512, cpuUsage:7,  ramUsage:25, diskUsage:33, networkStatus:'connected', temperature:40, lastHeartbeat: fmt(subMinutes(now,4)),  agentVersion:'1.2.4' },
  { id:'pc-09', name:'PC-B01', labId:'lab-02', labName:'Lab B – Networking',  status:'available',  ipAddress:'192.168.2.101', macAddress:'B4:C3:F0:22:22:01', osVersion:'Windows 11 Pro', cpu:'Intel i5-12400', ramGb:8,  diskGb:256, cpuUsage:4,  ramUsage:20, diskUsage:25, networkStatus:'connected', temperature:37, lastHeartbeat: fmt(subMinutes(now,5)),  agentVersion:'1.2.4' },
  { id:'pc-10', name:'PC-B02', labId:'lab-02', labName:'Lab B – Networking',  status:'maintenance',ipAddress:'192.168.2.102', macAddress:'B4:C3:F0:22:22:02', osVersion:'Windows 11 Pro', cpu:'Intel i5-12400', ramGb:8,  diskGb:256, cpuUsage:0,  ramUsage:0,  diskUsage:40, networkStatus:'disconnected', lastHeartbeat: fmt(subDays(now,1)),    agentVersion:'1.2.3', lastFault:'Scheduled BIOS update' },
  { id:'pc-11', name:'PC-B03', labId:'lab-02', labName:'Lab B – Networking',  status:'occupied',   ipAddress:'192.168.2.103', macAddress:'B4:C3:F0:22:22:03', osVersion:'Windows 11 Pro', cpu:'Intel i5-12400', ramGb:8,  diskGb:256, cpuUsage:55, ramUsage:62, diskUsage:48, networkStatus:'connected', temperature:50, assignedStudentId:'s-04', assignedStudentName:'Kiran Reddy',      lastHeartbeat: fmt(subMinutes(now,1)),  agentVersion:'1.2.4' },
  { id:'pc-12', name:'PC-C01', labId:'lab-03', labName:'Lab C – Research',    status:'available',  ipAddress:'192.168.3.101', macAddress:'C4:C3:F0:33:33:01', osVersion:'Windows 11 Pro', cpu:'Intel i9-13900', ramGb:32, diskGb:1024,cpuUsage:12, ramUsage:31, diskUsage:55, networkStatus:'connected', temperature:43, lastHeartbeat: fmt(subMinutes(now,2)),  agentVersion:'1.2.4' },
];

// ─── Students ─────────────────────────────────────────────────────────────────
export const STUDENTS: Student[] = [
  { id:'s-01', name:'Aanya Sharma',  rollNumber:'CS21001', email:'aanya.s@college.edu',  department:'Computer Science', year:3, rfidCardId:'RFID-AA11BB', accountStatus:'active',   enrolledDate:'2021-07-15', totalSessions:42, totalSubmissions:18 },
  { id:'s-02', name:'Rohan Mehta',   rollNumber:'CS21002', email:'rohan.m@college.edu',  department:'Computer Science', year:3, rfidCardId:'RFID-CC22DD', accountStatus:'active',   enrolledDate:'2021-07-15', totalSessions:38, totalSubmissions:15 },
  { id:'s-03', name:'Priya Nair',    rollNumber:'CS21003', email:'priya.n@college.edu',  department:'Computer Science', year:3, rfidCardId:'RFID-EE33FF', accountStatus:'active',   enrolledDate:'2021-07-15', totalSessions:51, totalSubmissions:21 },
  { id:'s-04', name:'Kiran Reddy',   rollNumber:'EC21001', email:'kiran.r@college.edu',  department:'Electronics',      year:3, rfidCardId:'RFID-GG44HH', accountStatus:'active',   enrolledDate:'2021-07-15', totalSessions:29, totalSubmissions:11 },
  { id:'s-05', name:'Deepa Pillai',  rollNumber:'CS22001', email:'deepa.p@college.edu',  department:'Computer Science', year:2, rfidCardId:'RFID-II55JJ', accountStatus:'active',   enrolledDate:'2022-07-20', totalSessions:22, totalSubmissions:9  },
  { id:'s-06', name:'Arjun Verma',   rollNumber:'CS22002', email:'arjun.v@college.edu',  department:'Computer Science', year:2,                            accountStatus:'active',   enrolledDate:'2022-07-20', totalSessions:19, totalSubmissions:7  },
  { id:'s-07', name:'Sneha Gupta',   rollNumber:'ME21001', email:'sneha.g@college.edu',  department:'Mechanical',       year:3, rfidCardId:'RFID-KK66LL', accountStatus:'active',   enrolledDate:'2021-07-15', totalSessions:14, totalSubmissions:5  },
  { id:'s-08', name:'Rahul Joshi',   rollNumber:'CS21004', email:'rahul.j@college.edu',  department:'Computer Science', year:3, rfidCardId:'RFID-MM77NN', accountStatus:'suspended',enrolledDate:'2021-07-15', totalSessions:31, totalSubmissions:12 },
  { id:'s-09', name:'Lakshmi Iyer',  rollNumber:'CS23001', email:'lakshmi.i@college.edu',department:'Computer Science', year:1, rfidCardId:'RFID-OO88PP', accountStatus:'active',   enrolledDate:'2023-07-18', totalSessions:8,  totalSubmissions:3  },
  { id:'s-10', name:'Vivek Kumar',   rollNumber:'IT21001', email:'vivek.k@college.edu',  department:'IT',               year:3, rfidCardId:'RFID-QQ99RR', accountStatus:'inactive', enrolledDate:'2021-07-15', totalSessions:25, totalSubmissions:10 },
];

// ─── Sessions ─────────────────────────────────────────────────────────────────
export const SESSIONS: Session[] = [
  { id:'sess-01', studentId:'s-01', studentName:'Aanya Sharma', studentRoll:'CS21001', pcId:'pc-01', pcName:'PC-A01', labId:'lab-01', labName:'Lab A – Programming', loginTime: fmt(subHours(now,2)), status:'active' },
  { id:'sess-02', studentId:'s-02', studentName:'Rohan Mehta',  studentRoll:'CS21002', pcId:'pc-03', pcName:'PC-A03', labId:'lab-01', labName:'Lab A – Programming', loginTime: fmt(subHours(now,1.5)), status:'active' },
  { id:'sess-03', studentId:'s-03', studentName:'Priya Nair',   studentRoll:'CS21003', pcId:'pc-06', pcName:'PC-A06', labId:'lab-01', labName:'Lab A – Programming', loginTime: fmt(subHours(now,1)), status:'active' },
  { id:'sess-04', studentId:'s-04', studentName:'Kiran Reddy',  studentRoll:'EC21001', pcId:'pc-11', pcName:'PC-B03', labId:'lab-02', labName:'Lab B – Networking',  loginTime: fmt(subHours(now,2.5)), status:'active' },
  { id:'sess-05', studentId:'s-05', studentName:'Deepa Pillai', studentRoll:'CS22001', pcId:'pc-02', pcName:'PC-A02', labId:'lab-01', labName:'Lab A – Programming', loginTime: fmt(subHours(now,3)), logoutTime: fmt(subHours(now,1)), durationMinutes:120, status:'ended' },
  { id:'sess-06', studentId:'s-06', studentName:'Arjun Verma',  studentRoll:'CS22002', pcId:'pc-05', pcName:'PC-A05', labId:'lab-01', labName:'Lab A – Programming', loginTime: fmt(subHours(now,4)), logoutTime: fmt(subHours(now,2)), durationMinutes:120, status:'ended' },
  { id:'sess-07', studentId:'s-07', studentName:'Sneha Gupta',  studentRoll:'ME21001', pcId:'pc-09', pcName:'PC-B01', labId:'lab-02', labName:'Lab B – Networking',  loginTime: fmt(subDays(now,1)),  logoutTime: fmt(subDays(now,1)),  durationMinutes:90,  status:'ended' },
  { id:'sess-08', studentId:'s-08', studentName:'Rahul Joshi',  studentRoll:'CS21004', pcId:'pc-08', pcName:'PC-A08', labId:'lab-01', labName:'Lab A – Programming', loginTime: fmt(subDays(now,1)),  logoutTime: fmt(subDays(now,1)),  durationMinutes:145, status:'ended' },
];

// ─── Exercises ────────────────────────────────────────────────────────────────
export const EXERCISES: Exercise[] = [
  {
    id:'ex-01', title:'Binary Search Implementation', language:'Python',
    description:'Implement an efficient binary search algorithm that searches for a target value in a sorted array. Your solution should return the index of the target if found, or -1 if not found.',
    inputRequirements:'First line: N (array size). Second line: N space-separated sorted integers. Third line: target value.',
    outputRequirements:'Single integer: index of target (0-based), or -1 if not found.',
    constraints:'1 ≤ N ≤ 10^6, -10^9 ≤ elements ≤ 10^9, Time limit: 1s',
    deadline: fmt(subDays(now,-3)), status:'published',
    createdBy:'u-fac-01', createdByName:'Dr. Meena Krishnan', createdAt: fmt(subDays(now,7)),
    testCases:[{input:'5\n1 3 5 7 9\n5', expectedOutput:'2'},{input:'4\n2 4 6 8\n5', expectedOutput:'-1'}],
    maxScore:100,
  },
  {
    id:'ex-02', title:'Linked List Reversal', language:'Java',
    description:'Write a Java program to reverse a singly linked list. Implement the solution iteratively (no recursion).',
    inputRequirements:'First line: N (number of nodes). Second line: N space-separated integers.',
    outputRequirements:'Space-separated integers of the reversed list.',
    constraints:'1 ≤ N ≤ 10^4, -10^4 ≤ values ≤ 10^4',
    deadline: fmt(subDays(now,-1)), status:'published',
    createdBy:'u-fac-01', createdByName:'Dr. Meena Krishnan', createdAt: fmt(subDays(now,5)),
    testCases:[{input:'5\n1 2 3 4 5', expectedOutput:'5 4 3 2 1'}],
    maxScore:100,
  },
  {
    id:'ex-03', title:'Matrix Multiplication', language:'C++',
    description:'Implement matrix multiplication for two N×M and M×P matrices. Read matrices, compute the product, and print the result.',
    inputRequirements:'N M P followed by N×M matrix then M×P matrix.',
    outputRequirements:'N×P result matrix.',
    constraints:'N, M, P ≤ 100',
    deadline: fmt(subDays(now,-10)), status:'closed',
    createdBy:'u-fac-02', createdByName:'Prof. Arun Pillai', createdAt: fmt(subDays(now,14)),
    maxScore:100,
  },
  {
    id:'ex-04', title:'REST API Design', language:'Python',
    description:'Design and document a simple REST API for a student management system using Flask. Implement CRUD endpoints.',
    inputRequirements:'No stdin input. Implement the HTTP endpoints.',
    outputRequirements:'Functional Flask app with GET, POST, PUT, DELETE routes.',
    constraints:'Use Flask 2.x, proper HTTP status codes, JSON responses.',
    deadline: fmt(subDays(now,-7)), status:'draft',
    createdBy:'u-fac-01', createdByName:'Dr. Meena Krishnan', createdAt: fmt(subDays(now,2)),
    maxScore:150,
  },
];

// ─── Submissions ──────────────────────────────────────────────────────────────
export const SUBMISSIONS: Submission[] = [
  { id:'sub-01', exerciseId:'ex-01', exerciseTitle:'Binary Search Implementation', studentId:'s-01', studentName:'Aanya Sharma', studentRoll:'CS21001', submittedAt: fmt(subHours(now,4)), status:'accepted',            score:95, maxScore:100, facultyFeedback:'Excellent solution with edge cases handled.', language:'Python' },
  { id:'sub-02', exerciseId:'ex-01', exerciseTitle:'Binary Search Implementation', studentId:'s-02', studentName:'Rohan Mehta',  studentRoll:'CS21002', submittedAt: fmt(subHours(now,3)), status:'pending_evaluation',                             maxScore:100, language:'Python' },
  { id:'sub-03', exerciseId:'ex-01', exerciseTitle:'Binary Search Implementation', studentId:'s-03', studentName:'Priya Nair',   studentRoll:'CS21003', submittedAt: fmt(subHours(now,2)), status:'rejected',            score:40, maxScore:100, facultyFeedback:'Logic error in mid-point calculation.', language:'Python' },
  { id:'sub-04', exerciseId:'ex-02', exerciseTitle:'Linked List Reversal',         studentId:'s-01', studentName:'Aanya Sharma', studentRoll:'CS21001', submittedAt: fmt(subHours(now,5)), status:'accepted',            score:98, maxScore:100, facultyFeedback:'Perfect iterative solution.', language:'Java' },
  { id:'sub-05', exerciseId:'ex-02', exerciseTitle:'Linked List Reversal',         studentId:'s-04', studentName:'Kiran Reddy',  studentRoll:'EC21001', submittedAt: fmt(subHours(now,6)), status:'submitted',                                    maxScore:100, language:'Java' },
  { id:'sub-06', exerciseId:'ex-03', exerciseTitle:'Matrix Multiplication',        studentId:'s-02', studentName:'Rohan Mehta',  studentRoll:'CS21002', submittedAt: fmt(subDays(now,5)),  status:'accepted',            score:88, maxScore:100, facultyFeedback:'Good work, minor optimization possible.', language:'C++' },
  { id:'sub-07', exerciseId:'ex-03', exerciseTitle:'Matrix Multiplication',        studentId:'s-05', studentName:'Deepa Pillai', studentRoll:'CS22001', submittedAt: fmt(subDays(now,5)),  status:'evaluation_error',                             maxScore:100, facultyFeedback:'Compilation error – fix includes.', language:'C++' },
];

// ─── Faults ───────────────────────────────────────────────────────────────────
export const FAULTS: Fault[] = [
  { id:'flt-01', pcId:'pc-04', pcName:'PC-A04', labId:'lab-01', labName:'Lab A – Programming', category:'hardware',  description:'GPU temperature exceeds 90°C. Fans not spinning at full speed.', severity:'critical', status:'in_progress', reportedAt: fmt(subHours(now,5)),  reportedBy:'Agent', assignedTechnician:'Suresh T.' },
  { id:'flt-02', pcId:'pc-07', pcName:'PC-A07', labId:'lab-01', labName:'Lab A – Programming', category:'network',   description:'NIC driver crash. PC shows disconnected for over 8 hours.', severity:'high',     status:'open',        reportedAt: fmt(subHours(now,9)),  reportedBy:'Agent' },
  { id:'flt-03', pcId:'pc-10', pcName:'PC-B02', labId:'lab-02', labName:'Lab B – Networking',  category:'software',  description:'BIOS update pending. Machine must remain offline during update.', severity:'medium',   status:'in_progress', reportedAt: fmt(subDays(now,1)),   reportedBy:'Admin', assignedTechnician:'Ravi K.' },
  { id:'flt-04', pcId:'pc-03', pcName:'PC-A03', labId:'lab-01', labName:'Lab A – Programming', category:'application',description:'Visual Studio Code crashes on startup. Possible corrupt installation.', severity:'low',      status:'open',        reportedAt: fmt(subHours(now,2)),  reportedBy:'Rohan Mehta' },
  { id:'flt-05', pcId:'pc-01', pcName:'PC-A01', labId:'lab-01', labName:'Lab A – Programming', category:'hardware',  description:'USB port 3 not recognized. Keyboard connected through hub.', severity:'low',      status:'resolved',    reportedAt: fmt(subDays(now,3)),   reportedBy:'Agent', resolvedAt: fmt(subDays(now,2)), resolutionNotes:'USB driver reinstalled. Issue resolved.' },
  { id:'flt-06', pcId:'pc-09', pcName:'PC-B01', labId:'lab-02', labName:'Lab B – Networking',  category:'network',   description:'Intermittent packet loss detected (5–8% drop rate).', severity:'medium',   status:'open',        reportedAt: fmt(subHours(now,12)), reportedBy:'Agent' },
];

// ─── Users (Auth) ─────────────────────────────────────────────────────────────
export const USERS: (User & { password: string })[] = [
  { id:'u-admin-01', name:'Dr. Arjun Prasad',   email:'admin@smartlab.edu',   role:'admin',   password:'admin123',  department:'IT Administration', avatarInitials:'AP' },
  { id:'u-fac-01',   name:'Dr. Meena Krishnan', email:'faculty@smartlab.edu', role:'faculty', password:'faculty123', department:'Computer Science',  avatarInitials:'MK' },
  { id:'u-fac-02',   name:'Prof. Arun Pillai',  email:'arun@smartlab.edu',    role:'faculty', password:'arun123',   department:'Computer Science',  avatarInitials:'AP' },
  { id:'u-stu-01',   name:'Aanya Sharma',        email:'aanya@smartlab.edu',   role:'student', password:'student123', department:'Computer Science',  avatarInitials:'AS' },
];

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export const AUDIT_LOGS: AuditLog[] = [
  { id:'aud-01', userId:'u-admin-01', userName:'Dr. Arjun Prasad',   action:'LOGIN',    resource:'Auth',     detail:'Admin login successful',                    timestamp: fmt(subMinutes(now,5)),  ipAddress:'192.168.1.200' },
  { id:'aud-02', userId:'u-fac-01',   userName:'Dr. Meena Krishnan', action:'CREATE',   resource:'Exercise', detail:'Created exercise "Binary Search Implementation"', timestamp: fmt(subDays(now,7)), ipAddress:'192.168.1.205' },
  { id:'aud-03', userId:'u-fac-01',   userName:'Dr. Meena Krishnan', action:'PUBLISH',  resource:'Exercise', detail:'Published exercise ex-01',                  timestamp: fmt(subDays(now,7)),  ipAddress:'192.168.1.205' },
  { id:'aud-04', userId:'u-admin-01', userName:'Dr. Arjun Prasad',   action:'ALLOCATE', resource:'PC',       detail:'PC-A01 allocated to Aanya Sharma',          timestamp: fmt(subHours(now,2)),  ipAddress:'192.168.1.200' },
  { id:'aud-05', userId:'u-stu-01',   userName:'Aanya Sharma',        action:'SUBMIT',   resource:'Submission',detail:'Submitted solution for Binary Search',     timestamp: fmt(subHours(now,4)),  ipAddress:'192.168.1.101' },
  { id:'aud-06', userId:'u-admin-01', userName:'Dr. Arjun Prasad',   action:'FAULT',    resource:'Fault',    detail:'Fault flt-01 assigned to Suresh T.',        timestamp: fmt(subHours(now,4.5)),ipAddress:'192.168.1.200' },
];

// ─── Dashboard Metrics (derived) ─────────────────────────────────────────────
export function computeDashboardMetrics(): DashboardMetrics {
  return {
    totalPCs:           PCS.length,
    onlinePCs:          PCS.filter(p=>['online','occupied','available'].includes(p.status)).length,
    offlinePCs:         PCS.filter(p=>p.status==='offline').length,
    availablePCs:       PCS.filter(p=>p.status==='available').length,
    occupiedPCs:        PCS.filter(p=>p.status==='occupied').length,
    faultyPCs:          PCS.filter(p=>['faulty','maintenance'].includes(p.status)).length,
    activeSessions:     SESSIONS.filter(s=>s.status==='active').length,
    pendingFaults:      FAULTS.filter(f=>f.status!=='resolved').length,
    publishedExercises: EXERCISES.filter(e=>e.status==='published').length,
    pendingSubmissions: SUBMISSIONS.filter(s=>s.status==='pending_evaluation'||s.status==='submitted').length,
    lastUpdated:        now.toISOString(),
  };
}

// ─── Simulated real-time updates ─────────────────────────────────────────────
export function getSimulatedPCMetrics(pc: PC): PC {
  const jitter = () => (Math.random() - 0.5) * 6;
  return {
    ...pc,
    cpuUsage:  Math.min(100, Math.max(0, pc.cpuUsage + jitter())),
    ramUsage:  Math.min(100, Math.max(0, pc.ramUsage + jitter() * 0.5)),
    temperature: pc.temperature ? Math.min(85, Math.max(30, pc.temperature + jitter() * 0.3)) : undefined,
    lastHeartbeat: new Date().toISOString(),
  };
}
