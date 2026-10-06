export type MilitaryRole = 'super_admin' | 'admin' | 'proctor' | 'candidate';

export interface MilitaryUser {
  id: string;
  username: string;
  fullName: string;
  rank: string;        // Binh nhì, Hạ sĩ, Thiếu úy, Đại tá...
  position: string;    // Chiến sĩ, Đại đội trưởng, Chính trị viên...
  unit: string;        // Đại đội 1, Tiểu đoàn 2, Trung đoàn 9...
  militaryCode: string;
  role: MilitaryRole;
  isActive: boolean;
  permissions: {
    canCreateExam: boolean;
    canEditBank: boolean;
    canManageUsers: boolean;
    canViewProctor: boolean;
    canExportExcel: boolean;
    canDisqualify: boolean;
  };
}

export type QuestionCategory =
  | 'Chính trị & Tư tưởng'
  | 'Điều lệnh Quản lý bộ đội'
  | 'Điều lệnh Đội ngũ'
  | 'Kỹ thuật Chiến đấu bộ binh'
  | 'Chiến thuật Binh chủng'
  | 'Hậu cần - Kỹ thuật'
  | 'Pháp luật Quân sự & Kỷ luật'
  | 'Tổng hợp';

export type QuestionDifficulty = 'Dễ' | 'Trung bình' | 'Khó' | 'Rất khó';

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  points: number;
}

export interface ExamRoom {
  id: string;
  code: string;           // E.g. "QDND-2026-P01"
  title: string;
  description: string;
  passcode: string;       // Mật khẩu dùng chung bắt buộc
  durationMinutes: number;
  totalQuestions: number;
  passingScore: number;   // Thang 10, e.g. 5.0
  status: 'scheduled' | 'active' | 'closed';
  questions: Question[];
  createdAt: string;
  createdBy: string;
  targetUnit: string;     // e.g. "Toàn Sư đoàn 304"
  antiCheatMode: 'strict' | 'standard';
  allowInstantResult: boolean;
}

export interface ViolationEvent {
  id: string;
  timestamp: string;
  type: 'tab_switch' | 'fullscreen_exit' | 'window_blur' | 'copy_paste_attempt' | 'dev_tools' | 'suspicious_shortcut';
  message: string;
  severity: 'warning' | 'critical';
}

export interface CandidateProfile {
  fullName: string;
  rank: string;
  position: string;
  unit: string;
  militaryId?: string;
}

export type GradeClassification = 'Xuất sắc' | 'Giỏi' | 'Khá' | 'Đạt' | 'Không đạt';

export interface ExamSubmission {
  id: string;
  examId: string;
  examCode: string;
  examTitle: string;
  candidate: CandidateProfile;
  answers: Record<string, number>; // questionId -> chosen option index
  score: number;                   // Thang điểm thực
  scaledScore: number;             // Quy đổi hệ 10
  maxScore: number;
  correctCount: number;
  totalQuestions: number;
  classification: GradeClassification;
  timeSpentSeconds: number;
  submittedAt: string;
  autoSubmitted: boolean;
  violations: ViolationEvent[];
  aiAnalysis?: string;
  status: 'submitted' | 'disqualified';
  disqualifyReason?: string;
}

export interface LiveProctorCandidate {
  id: string;
  candidate: CandidateProfile;
  examId: string;
  startTime: string;
  answeredCount: number;
  totalQuestions: number;
  violationsCount: number;
  recentViolation?: ViolationEvent;
  status: 'active' | 'warning' | 'disqualified' | 'submitted';
  lastPing: string;
}
