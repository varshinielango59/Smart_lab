// ─── Core Entity Types ────────────────────────────────────────────────────────

export type Role = 'admin' | 'faculty' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
  avatarInitials?: string;
}

export type PCStatus = 'online' | 'offline' | 'occupied' | 'available' | 'faulty' | 'maintenance';
export type FaultSeverity = 'low' | 'medium' | 'high' | 'critical';
export type FaultStatus = 'open' | 'in_progress' | 'resolved';
export type FaultCategory = 'hardware' | 'software' | 'network' | 'application';
export type SubmissionStatus = 'submitted' | 'pending_evaluation' | 'accepted' | 'rejected' | 'evaluation_error';
export type ExerciseStatus = 'draft' | 'published' | 'closed';
export type SessionStatus = 'active' | 'ended';

export interface Laboratory {
  id: string;
  name: string;
  building: string;
  floor: string;
  capacity: number;
  description?: string;
}

export interface PC {
  id: string;
  name: string;
  labId: string;
  labName: string;
  status: PCStatus;
  ipAddress: string;
  macAddress: string;
  osVersion: string;
  cpu: string;
  ramGb: number;
  diskGb: number;
  cpuUsage: number;
  ramUsage: number;
  diskUsage: number;
  networkStatus: 'connected' | 'disconnected';
  temperature?: number;
  assignedStudentId?: string;
  assignedStudentName?: string;
  lastHeartbeat: string;
  lastFault?: string;
  agentVersion: string;
}

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  department: string;
  year: number;
  rfidCardId?: string;
  accountStatus: 'active' | 'inactive' | 'suspended';
  enrolledDate: string;
  totalSessions: number;
  totalSubmissions: number;
}

export interface Session {
  id: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  pcId: string;
  pcName: string;
  labId: string;
  labName: string;
  loginTime: string;
  logoutTime?: string;
  durationMinutes?: number;
  status: SessionStatus;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  language: string;
  inputRequirements: string;
  outputRequirements: string;
  constraints: string;
  deadline: string;
  status: ExerciseStatus;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  testCases?: { input: string; expectedOutput: string }[];
  maxScore: number;
}

export interface Submission {
  id: string;
  exerciseId: string;
  exerciseTitle: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  submittedAt: string;
  status: SubmissionStatus;
  score?: number;
  maxScore: number;
  facultyFeedback?: string;
  code?: string;
  language: string;
}

export interface Fault {
  id: string;
  pcId: string;
  pcName: string;
  labId: string;
  labName: string;
  category: FaultCategory;
  description: string;
  severity: FaultSeverity;
  status: FaultStatus;
  reportedAt: string;
  assignedTechnician?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  reportedBy: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  detail: string;
  timestamp: string;
  ipAddress: string;
}

export interface DashboardMetrics {
  totalPCs: number;
  onlinePCs: number;
  offlinePCs: number;
  availablePCs: number;
  occupiedPCs: number;
  faultyPCs: number;
  activeSessions: number;
  pendingFaults: number;
  publishedExercises: number;
  pendingSubmissions: number;
  lastUpdated: string;
}
