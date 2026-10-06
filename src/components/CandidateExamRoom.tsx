import React, { useState, useEffect, useRef } from 'react';
import { ExamRoom, ExamSubmission, ViolationEvent, CandidateProfile, Question } from '../types/military';
import { AntiCheatController } from '../services/antiCheatService';
import { MILITARY_HERO_BANNER, MILITARY_HALL_IMAGE } from '../assets/images';
import confetti from 'canvas-confetti';
import {
  ShieldAlert,
  Clock,
  CheckCircle,
  AlertTriangle,
  Lock,
  Maximize2,
  FileText,
  Send,
  Sparkles,
  RotateCcw,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  HelpCircle,
  User,
  Medal,
  Briefcase,
  Building2,
  KeyRound,
  Eye,
  EyeOff,
  Camera
} from 'lucide-react';

interface CandidateExamRoomProps {
  rooms: ExamRoom[];
  onFinishExam: (submission: ExamSubmission) => void;
  onViolationOccurred: (roomCode: string, candidate: CandidateProfile, violation: ViolationEvent) => void;
  initialRoomCode?: string;
  bannerImage?: string;
  isAdminUnlocked?: boolean;
  onOpenImageSettings?: () => void;
}

const RANK_SUGGESTIONS = [
  'Binh nhì',
  'Binh nhất',
  'Hạ sĩ',
  'Trung sĩ',
  'Thượng sĩ',
  'Thiếu úy',
  'Trung úy',
  'Thượng úy',
  'Đại úy',
  'Thiếu tá'
];

const POSITION_SUGGESTIONS = [
  'Chiến sĩ',
  'Tiểu đội trưởng',
  'Trung đội trưởng',
  'Phó Đại đội trưởng',
  'Đại đội trưởng',
  'Chính trị viên',
  'Trợ lý tác chiến'
];

const UNIT_SUGGESTIONS = [
  'Tiểu đoàn 1, Trung đoàn 108, Sư đoàn 305',
  'Tiểu đoàn 2, Trung đoàn 108, Sư đoàn 305',
  'Tiểu đoàn 3, Trung đoàn 108, Sư đoàn 305',
  'Đại đội 1, Tiểu đoàn 1, Trung đoàn 108',
  'Đại đội 2, Tiểu đoàn 1, Trung đoàn 108',
  'Đại đội Hỏa lực, Tiểu đoàn 1, Trung đoàn 108'
];

export const CandidateExamRoom: React.FC<CandidateExamRoomProps> = ({
  rooms,
  onFinishExam,
  onViolationOccurred,
  initialRoomCode,
  bannerImage,
  isAdminUnlocked,
  onOpenImageSettings,
}) => {
  // Check-in State
  const [selectedRoomId, setSelectedRoomId] = useState<string>(initialRoomCode || (rooms[0]?.id || ''));
  const [fullName, setFullName] = useState<string>('');
  const [rank, setRank] = useState<string>('');
  const [position, setPosition] = useState<string>('');
  const [unit, setUnit] = useState<string>('');
  const [passcode, setPasscode] = useState<string>('');
  const [showPasscode, setShowPasscode] = useState<boolean>(false);
  const [checkInError, setCheckInError] = useState<string>('');

  // Exam Progress State
  const [isExamStarted, setIsExamStarted] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0); // in seconds
  const [violations, setViolations] = useState<ViolationEvent[]>([]);
  const [isFullscreenLocked, setIsFullscreenLocked] = useState<boolean>(false);
  const [isScreenLockedByAlert, setIsScreenLockedByAlert] = useState<boolean>(false);
  const [lastWarningMsg, setLastWarningMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Result & Review State
  const [completedSubmission, setCompletedSubmission] = useState<ExamSubmission | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);

  // References
  const antiCheatRef = useRef<AntiCheatController | null>(null);
  const timerRef = useRef<any>(null);
  const activeRoom = rooms.find((r) => r.id === selectedRoomId || r.code === selectedRoomId) || rooms[0];

  useEffect(() => {
    if (initialRoomCode) {
      const found = rooms.find((r) => r.code === initialRoomCode || r.id === initialRoomCode);
      if (found) setSelectedRoomId(found.id);
    }
  }, [initialRoomCode, rooms]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (antiCheatRef.current) antiCheatRef.current.destroy();
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!isExamStarted || completedSubmission) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit('Hết giờ làm bài quy định của Ban Khảo thí Sư đoàn BB 305!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isExamStarted, completedSubmission]);

  // Handle Candidate Check-in with strict validation
  const handleStartExam = async () => {
    setCheckInError('');

    // Strict validation: ALL fields are required
    if (!fullName.trim()) {
      setCheckInError('LỖI KỶ LUẬT: Đồng chí chưa nhập Họ và tên!');
      return;
    }
    if (!rank.trim()) {
      setCheckInError('LỖI KỶ LUẬT: Đồng chí chưa nhập Cấp bậc quân hàm (Ví dụ: Binh nhì, Binh nhất, Hạ sĩ, Thiếu úy...)!');
      return;
    }
    if (!position.trim()) {
      setCheckInError('LỖI KỶ LUẬT: Đồng chí chưa nhập Chức vụ (Ví dụ: Chiến sĩ, Tiểu đội trưởng, Đại đội trưởng...)!');
      return;
    }
    if (!unit.trim()) {
      setCheckInError('LỖI KỶ LUẬT: Đồng chí chưa nhập Đơn vị (Ví dụ: Tiểu đoàn 1, Trung đoàn 108, Sư đoàn 305)!');
      return;
    }
    if (!passcode.trim()) {
      setCheckInError('LỖI KỶ LUẬT: Đồng chí chưa nhập Mật khẩu phòng thi do Ban Giám thị cung cấp riêng!');
      return;
    }

    if (!activeRoom) {
      setCheckInError('Không tìm thấy phòng thi hợp lệ!');
      return;
    }

    if (passcode.trim() !== activeRoom.passcode.trim()) {
      setCheckInError('Mật khẩu phòng thi không chính xác! Vui lòng liên hệ Giám thị coi thi Sư đoàn BB 305.');
      return;
    }

    if (activeRoom.status === 'closed') {
      setCheckInError('Phòng thi này đã đóng theo lệnh của Ban Chỉ huy!');
      return;
    }

    // Initialize Timer
    const totalSeconds = (activeRoom.durationMinutes || 15) * 60;
    setTimeLeft(totalSeconds);
    setUserAnswers({});
    setViolations([]);
    setCurrentQuestionIndex(0);

    // Candidate Profile
    const candidateProfile: CandidateProfile = {
      fullName: fullName.trim(),
      rank: rank.trim(),
      position: position.trim(),
      unit: unit.trim(),
      militaryId: `QN305-${Math.floor(10000 + Math.random() * 90000)}`
    };

    const antiCheat = new AntiCheatController({
      isExamActive: true,
      maxViolations: 4,
      onViolation: (violation) => {
        setViolations((prev) => [violation, ...prev]);
        setLastWarningMsg(violation.message);
        setIsScreenLockedByAlert(true);
        onViolationOccurred(activeRoom.code, candidateProfile, violation);
      },
      onFullscreenChange: (isFullscreen) => {
        setIsFullscreenLocked(isFullscreen);
        if (!isFullscreen) {
          setIsScreenLockedByAlert(true);
        }
      },
      onMaxViolationsReached: () => {
        handleDisqualify('Vi phạm quá 3 lần quy chế phòng thi (Tự ý thoát màn hình / Mở ứng dụng khác / Tra cứu AI).');
      }
    });

    antiCheatRef.current = antiCheat;
    await antiCheat.requestFullscreen();
    setIsExamStarted(true);
  };

  const handleAcknowledgeWarningAndResume = async () => {
    if (antiCheatRef.current) {
      await antiCheatRef.current.requestFullscreen();
    }
    setIsScreenLockedByAlert(false);
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleDisqualify = (reason: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (antiCheatRef.current) {
      antiCheatRef.current.destroy();
      antiCheatRef.current.exitFullscreen();
    }

    const candidateProfile: CandidateProfile = {
      fullName: fullName.trim(),
      rank: rank.trim(),
      position: position.trim(),
      unit: unit.trim(),
      militaryId: `QN305-${Math.floor(10000 + Math.random() * 90000)}`
    };

    const submission: ExamSubmission = {
      id: `SUB_${Date.now()}`,
      examId: activeRoom.id,
      examCode: activeRoom.code,
      examTitle: activeRoom.title,
      candidate: candidateProfile,
      answers: userAnswers,
      score: 0,
      scaledScore: 0,
      maxScore: 100,
      correctCount: 0,
      totalQuestions: activeRoom.questions.length,
      classification: 'Không đạt',
      timeSpentSeconds: (activeRoom.durationMinutes * 60) - timeLeft,
      submittedAt: new Date().toISOString(),
      autoSubmitted: true,
      violations,
      status: 'disqualified',
      disqualifyReason: reason,
      aiAnalysis: `Thí sinh bị ĐÌNH CHỈ THI do vi phạm nghiêm trọng kỷ luật quân đội: ${reason}`
    };

    setCompletedSubmission(submission);
    onFinishExam(submission);
    setIsExamStarted(false);
  };

  const handleAutoSubmit = (reason?: string) => {
    executeSubmission(true, reason);
  };

  const handleManualSubmit = () => {
    const answeredCount = Object.keys(userAnswers).length;
    const totalQuestions = activeRoom.questions.length;
    if (answeredCount < totalQuestions) {
      const confirmSubmit = window.confirm(
        `Đồng chí mới hoàn thành ${answeredCount}/${totalQuestions} câu hỏi. Có chắc chắn muốn nộp bài sớm không?`
      );
      if (!confirmSubmit) return;
    }
    executeSubmission(false);
  };

  const executeSubmission = async (autoSubmitted = false, note?: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (timerRef.current) clearInterval(timerRef.current);
    if (antiCheatRef.current) {
      antiCheatRef.current.destroy();
      antiCheatRef.current.exitFullscreen();
    }

    const questions = activeRoom.questions;
    let correctCount = 0;
    const wrongQuestions: any[] = [];

    questions.forEach((q) => {
      const chosen = userAnswers[q.id];
      if (chosen === q.correctAnswerIndex) {
        correctCount++;
      } else {
        wrongQuestions.push({
          question: q.question,
          chosen: chosen !== undefined ? q.options[chosen] : 'Chưa trả lời',
          correct: q.options[q.correctAnswerIndex]
        });
      }
    });

    const scaledScore = Number(((correctCount / (questions.length || 1)) * 10).toFixed(1));
    const score = Math.round(scaledScore * 10);

    let classification: 'Xuất sắc' | 'Giỏi' | 'Khá' | 'Đạt' | 'Không đạt';
    if (scaledScore >= 9.0) classification = 'Xuất sắc';
    else if (scaledScore >= 8.0) classification = 'Giỏi';
    else if (scaledScore >= 7.0) classification = 'Khá';
    else if (scaledScore >= 5.0) classification = 'Đạt';
    else classification = 'Không đạt';

    if (classification === 'Giỏi' || classification === 'Xuất sắc') {
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {
        // Confetti fallback
      }
    }

    const candidateProfile: CandidateProfile = {
      fullName: fullName.trim(),
      rank: rank.trim(),
      position: position.trim(),
      unit: unit.trim(),
      militaryId: `QN305-${Math.floor(10000 + Math.random() * 90000)}`
    };

    const submission: ExamSubmission = {
      id: `SUB_${Date.now()}`,
      examId: activeRoom.id,
      examCode: activeRoom.code,
      examTitle: activeRoom.title,
      candidate: candidateProfile,
      answers: userAnswers,
      score,
      scaledScore,
      maxScore: 100,
      correctCount,
      totalQuestions: questions.length,
      classification,
      timeSpentSeconds: (activeRoom.durationMinutes * 60) - timeLeft,
      submittedAt: new Date().toISOString(),
      autoSubmitted,
      violations,
      status: 'submitted'
    };

    setCompletedSubmission(submission);
    onFinishExam(submission);
    setIsExamStarted(false);
    setIsSubmitting(false);

    // Call AI to get official evaluation analysis
    fetchAiEvaluation(candidateProfile, activeRoom.title, scaledScore, wrongQuestions, violations.length);
  };

  const fetchAiEvaluation = async (
    candidate: CandidateProfile,
    examTitle: string,
    score: number,
    wrongQuestions: any[],
    violationsCount: number
  ) => {
    setIsAiAnalyzing(true);
    try {
      const res = await fetch('/api/ai/analyze-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate,
          examTitle,
          score,
          maxScore: 10,
          wrongQuestions,
          violationsCount
        })
      });
      const data = await res.json();
      if (data.feedback) {
        setAiAnalysis(data.feedback);
      }
    } catch (e) {
      setAiAnalysis('Hoàn thành tốt nội dung kiểm tra. Đơn vị Sư đoàn BB 305 ghi nhận tinh thần tự giác, kỷ luật cao.');
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // -------------------------------------------------------------
  // VIEW 1: RESULTS & REVIEW SCREEN
  // -------------------------------------------------------------
  if (completedSubmission) {
    const isPassed = completedSubmission.scaledScore >= 5.0 && completedSubmission.status !== 'disqualified';

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white border-2 border-emerald-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Top Banner */}
          <div className="text-center pb-6 border-b border-stone-200">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 border border-red-300 text-xs font-military tracking-widest uppercase mb-3">
              ★ QUÂN KHU 5 — SƯ ĐOÀN BỘ BINH 305 ★
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-emerald-950 font-military">
              {completedSubmission.examTitle}
            </h2>
            <p className="text-xs text-stone-600 mt-1">
              Mã phòng thi: <strong className="font-mono text-emerald-800">{completedSubmission.examCode}</strong> • Thời điểm nộp:{' '}
              {new Date(completedSubmission.submittedAt).toLocaleTimeString('vi-VN')} ngày{' '}
              {new Date(completedSubmission.submittedAt).toLocaleDateString('vi-VN')}
            </p>
          </div>

          {/* Candidate Dossier */}
          <div className="my-6 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-stone-500 block">Họ và tên:</span>
              <span className="font-bold text-stone-900 text-sm">{completedSubmission.candidate.fullName}</span>
            </div>
            <div>
              <span className="text-stone-500 block">Cấp bậc / Chức vụ:</span>
              <span className="font-bold text-red-800">
                {completedSubmission.candidate.rank} — {completedSubmission.candidate.position}
              </span>
            </div>
            <div>
              <span className="text-stone-500 block">Đơn vị:</span>
              <span className="font-semibold text-stone-800 truncate block">{completedSubmission.candidate.unit}</span>
            </div>
            <div>
              <span className="text-stone-500 block">Thời gian làm:</span>
              <span className="font-mono font-bold text-emerald-800">
                {Math.floor(completedSubmission.timeSpentSeconds / 60)} phút {completedSubmission.timeSpentSeconds % 60} giây
              </span>
            </div>
          </div>

          {/* Score & Classification Spotlight */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 text-center flex flex-col justify-center">
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">ĐIỂM SỐ ĐẠT ĐƯỢC</span>
              <div className="text-4xl font-extrabold text-red-700 font-military mt-2">
                {completedSubmission.scaledScore.toFixed(1)}
                <span className="text-lg text-stone-500 font-normal"> / 10</span>
              </div>
              <span className="text-xs text-stone-600 mt-1">
                Đúng {completedSubmission.correctCount} / {completedSubmission.totalQuestions} câu hỏi
              </span>
            </div>

            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 text-center flex flex-col justify-center">
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">XẾP LOẠI QUÂN ĐỘI</span>
              <div
                className={`text-2xl font-black font-military mt-2 uppercase ${
                  completedSubmission.classification === 'Xuất sắc' || completedSubmission.classification === 'Giỏi'
                    ? 'text-emerald-700'
                    : completedSubmission.classification === 'Khá'
                    ? 'text-amber-600'
                    : completedSubmission.classification === 'Đạt'
                    ? 'text-blue-700'
                    : 'text-red-600'
                }`}
              >
                {completedSubmission.status === 'disqualified' ? 'ĐÌNH CHỈ THI' : completedSubmission.classification}
              </div>
              <span className="text-xs text-stone-600 mt-1">
                {isPassed ? '✓ Đạt chuẩn huấn luyện BB 305' : '✕ Cần ôn tập và kiểm tra lại'}
              </span>
            </div>

            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 text-center flex flex-col justify-center">
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">GIÁM SÁT KỶ LUẬT</span>
              <div
                className={`text-2xl font-black font-military mt-2 ${
                  completedSubmission.violations.length === 0 ? 'text-emerald-700' : 'text-red-600'
                }`}
              >
                {completedSubmission.violations.length === 0 ? '0 VI PHẠM' : `${completedSubmission.violations.length} LẦN`}
              </div>
              <span className="text-xs text-stone-600 mt-1">
                {completedSubmission.violations.length === 0 ? 'Chấp hành nghiêm quy chế' : 'Có cảnh báo chuyển tab'}
              </span>
            </div>
          </div>

          {/* AI Military Assessment */}
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 mb-6">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-emerald-900 font-military">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Ý KIẾN ĐÁNH GIÁ CỦA BAN KHẢO THÍ SƯ ĐOÀN BB 305 (AI QUÂN SỰ)</span>
            </div>
            {isAiAnalyzing ? (
              <p className="text-xs text-stone-600 animate-pulse">Ban Khảo thí đang phân tích kết quả bài thi của đồng chí...</p>
            ) : (
              <p className="text-xs text-stone-800 leading-relaxed italic">
                "{aiAnalysis || completedSubmission.aiAnalysis || 'Đồng chí đã hoàn thành bài kiểm tra theo đúng quy định của Sư đoàn.'}"
              </p>
            )}
          </div>

          {/* Detailed Question Review */}
          <div className="border-t border-stone-200 pt-6">
            <h3 className="text-sm font-bold text-stone-900 mb-4 flex items-center justify-between">
              <span>ĐỐI CHIẾU ĐÁP ÁN CHI TIẾT</span>
              <span className="text-xs font-normal text-stone-500">
                (Xanh: Đáp án đúng • Đỏ: Đáp án đồng chí chọn sai)
              </span>
            </h3>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {activeRoom.questions.map((q, idx) => {
                const chosenIdx = completedSubmission.answers[q.id];
                const isCorrect = chosenIdx === q.correctAnswerIndex;

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border text-xs ${
                      isCorrect ? 'bg-emerald-50/40 border-emerald-300' : 'bg-red-50/40 border-red-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="font-bold text-stone-900">
                        Câu {idx + 1}: {q.question}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          isCorrect ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-red-100 text-red-800 border border-red-300'
                        }`}
                      >
                        {isCorrect ? 'ĐÚNG (+10đ)' : 'SAI (0đ)'}
                      </span>
                    </div>

                    <div className="space-y-1.5 my-2">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = chosenIdx === optIdx;
                        const isTheCorrectOne = optIdx === q.correctAnswerIndex;

                        let style = 'bg-white border-stone-200 text-stone-700';
                        if (isTheCorrectOne) {
                          style = 'bg-emerald-100 border-emerald-500 text-emerald-900 font-bold';
                        } else if (isChosen && !isTheCorrectOne) {
                          style = 'bg-red-100 border-red-500 text-red-900 line-through';
                        }

                        return (
                          <div key={optIdx} className={`p-2 rounded-lg border flex items-center justify-between ${style}`}>
                            <span>{opt}</span>
                            {isTheCorrectOne && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                            {isChosen && !isTheCorrectOne && <X className="w-3.5 h-3.5 text-red-700" />}
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-[11px] text-stone-700 bg-stone-100 p-2.5 rounded-lg mt-2 border border-stone-200">
                      <span className="font-semibold text-emerald-900">Căn cứ quy định:</span> {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-8 pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => {
                setCompletedSubmission(null);
                setIsExamStarted(false);
                setFullName('');
              }}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-2 cursor-pointer transition border border-stone-300"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Vào Đợt Thi Khác</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg transition"
            >
              <FileText className="w-4 h-4 text-white" />
              <span>In Phiếu Điểm Quân Nhân Sư đoàn 305</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: ACTIVE EXAM SCREEN (FULLSCREEN & ANTI-CHEAT LOCKED)
  // -------------------------------------------------------------
  if (isExamStarted && activeRoom) {
    const currentQ: Question = activeRoom.questions[currentQuestionIndex] || activeRoom.questions[0];
    const totalQ = activeRoom.questions.length;
    const answeredTotal = Object.keys(userAnswers).length;
    const isWarningUrgent = timeLeft <= 120;

    return (
      <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col justify-between selection:bg-none">
        {/* Anti-Cheat Screen Lock Warning Overlay */}
        {isScreenLockedByAlert && (
          <div className="fixed inset-0 z-50 bg-red-950/95 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white border-4 border-red-600 rounded-3xl p-6 text-center shadow-2xl animate-bounce">
              <div className="w-16 h-16 rounded-full bg-red-100 border-2 border-red-500 mx-auto flex items-center justify-center mb-4 text-red-600">
                <ShieldAlert className="w-8 h-8 animate-pulse" />
              </div>
              <h2 className="text-xl font-black text-red-800 font-military uppercase">
                CẢNH BÁO KỶ LUẬT THI SƯ ĐOÀN BB 305!
              </h2>
              <p className="text-xs text-stone-700 mt-2 leading-relaxed">
                Hệ thống phát hiện đồng chí vừa thoát màn hình bài thi, rời tab hoặc chuyển sang ứng dụng khác (Nghi vấn tra cứu AI)!
              </p>
              <div className="bg-red-50 border border-red-300 p-3 rounded-xl text-xs text-red-900 my-4 text-left font-mono">
                {lastWarningMsg || 'Thoát khỏi màn hình bài thi trực tuyến'}
              </div>
              <p className="text-[11px] text-stone-600 mb-5">
                Hành vi đã được ghi nhận vào nhật ký thanh tra của Ban Giám thị. Vi phạm quá 3 lần sẽ bị{' '}
                <strong className="text-red-700">ĐÌNH CHỈ THI VÀ XỬ LÝ KỶ LUẬT</strong>.
              </p>
              <button
                onClick={handleAcknowledgeWarningAndResume}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-700 to-amber-600 text-white font-extrabold text-sm uppercase tracking-wider hover:from-red-600 hover:to-amber-500 shadow-xl cursor-pointer"
              >
                TÔI ĐÃ HIỂU — TIẾP TỤC TOÀN MÀN HÌNH
              </button>
            </div>
          </div>
        )}

        {/* Top Military Test Header */}
        <div className="bg-white border-b-2 border-red-700/80 px-4 py-3 sticky top-0 z-30 shadow-md">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-700 text-amber-200 font-bold flex items-center justify-center text-sm shadow">
                ★
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-black text-emerald-950 font-military uppercase tracking-wide">
                  {activeRoom.title}
                </h2>
                <div className="text-[11px] text-stone-600 flex items-center gap-2">
                  <span>
                    Quân nhân: <strong className="text-stone-900">{rank} {fullName}</strong>
                  </span>
                  <span>•</span>
                  <span>{unit}</span>
                </div>
              </div>
            </div>

            {/* Timer & Violation Badge */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-400 text-emerald-900 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                <span>GIÁM SÁT CHỐNG AI</span>
                {violations.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded bg-red-600 text-white font-bold text-[10px]">
                    {violations.length} lỗi
                  </span>
                )}
              </div>

              {/* Countdown Clock */}
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono font-extrabold text-sm sm:text-base ${
                  isWarningUrgent
                    ? 'bg-red-600 text-white border-red-700 animate-pulse shadow-md'
                    : 'bg-emerald-50 border-emerald-400 text-emerald-950'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{formatTimer(timeLeft)}</span>
              </div>

              <button
                onClick={handleManualSubmit}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Nộp Bài</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Exam Interface */}
        <div className="max-w-6xl mx-auto px-4 py-6 flex-1 w-full grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question View (3 Columns) */}
          <div className="lg:col-span-3 bg-white border border-stone-200 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 text-xs">
                <span className="font-black text-red-800 font-military text-sm">
                  CÂU HỎI {currentQuestionIndex + 1} / {totalQ}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-[11px] font-semibold">
                  Chuyên mục: {currentQ.category}
                </span>
              </div>

              <div className="my-5">
                <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-relaxed">
                  {currentQ.question}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-3 mt-6">
                {currentQ.options.map((option, idx) => {
                  const isSelected = userAnswers[currentQ.id] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(currentQ.id, idx)}
                      className={`w-full text-left p-4 rounded-2xl border text-sm transition-all flex items-start gap-3.5 cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold shadow-md ring-2 ring-emerald-500/30'
                          : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-800'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-emerald-700 text-white'
                            : 'bg-white text-stone-600 border border-stone-300'
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1 mt-0.5">{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-6 mt-8 border-t border-stone-200">
              <button
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed text-stone-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-stone-300"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Câu Trước</span>
              </button>

              <span className="text-xs text-stone-600 font-medium">
                Đã hoàn thành <strong className="text-red-700 font-bold">{answeredTotal}</strong> / {totalQ} câu
              </span>

              <button
                onClick={() => setCurrentQuestionIndex((prev) => Math.min(prev + 1, totalQ - 1))}
                disabled={currentQuestionIndex === totalQ - 1}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed text-stone-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-stone-300"
              >
                <span>Câu Tiếp</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Question Grid Map & Discipline Notice (1 Column) */}
          <div className="space-y-4">
            <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xl">
              <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3 pb-2 border-b border-stone-200">
                DANH MỤC CÂU HỎI
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {activeRoom.questions.map((q, idx) => {
                  const isAnswered = userAnswers[q.id] !== undefined;
                  const isCurrent = currentQuestionIndex === idx;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-9 rounded-xl font-mono text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                        isCurrent
                          ? 'border-2 border-red-600 text-red-700 bg-red-50'
                          : isAnswered
                          ? 'bg-emerald-700 text-white shadow-sm'
                          : 'bg-stone-100 text-stone-600 border border-stone-200 hover:bg-stone-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between text-[10px] text-stone-600 font-medium">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-700"></span> Đã chọn
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-stone-100 border border-stone-300"></span> Chưa chọn
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded border-2 border-red-600"></span> Đang xem
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-amber-50 border border-red-200 rounded-3xl p-5 text-xs">
              <div className="flex items-center gap-2 text-red-800 font-bold mb-2">
                <ShieldAlert className="w-4 h-4 text-red-700" />
                <span>KỶ LUẬT THI SƯ ĐOÀN BB 305</span>
              </div>
              <ul className="text-[11px] text-stone-700 space-y-1.5 list-disc pl-4">
                <li>Nghiêm cấm chuyển đổi ứng dụng, mở tab tra cứu AI.</li>
                <li>Hệ thống lưu vết thời gian thực gửi thẳng Ban Giám thị.</li>
                <li>Tự động nộp bài khi hết giờ quy định.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 3: CHECK-IN / ENTRY PORTAL
  // -------------------------------------------------------------
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white border-2 border-emerald-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Hero Banner with Vietnam People's Army AI Art */}
        <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-stone-900 group">
          <img
            src={bannerImage || MILITARY_HERO_BANNER}
            alt="Quân đội Nhân dân Việt Nam - Sư đoàn BB 305"
            className="w-full h-full object-cover object-center opacity-90 transition duration-500"
          />
          {isAdminUnlocked && onOpenImageSettings && (
            <button
              onClick={onOpenImageSettings}
              className="absolute top-3 right-3 z-10 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 text-amber-300 border border-amber-400/60 backdrop-blur-sm text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-lg"
              title="Quản trị viên: Nhấn để đổi ảnh banner trang web"
            >
              <Camera className="w-3.5 h-3.5 text-amber-300" />
              <span>Đổi Ảnh Trang Web (Admin)</span>
            </button>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/40 to-transparent flex flex-col justify-end p-6 text-white">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-full bg-red-700 border border-amber-300 text-amber-300 font-bold flex items-center justify-center text-xs shadow">
                ★
              </span>
              <span className="font-military text-amber-300 tracking-wider text-xs font-bold uppercase">
                QUÂN KHU 5 — SƯ ĐOÀN BỘ BINH 305
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-military text-white tracking-wide drop-shadow-md">
              CỔNG ĐĂNG NHẬP PHÒNG THI TRỰC TUYẾN
            </h2>
            <p className="text-xs text-amber-100/90 font-medium max-w-xl">
              Quy định khảo thí: Quân nhân bắt buộc phải khai báo đầy đủ các mục thông tin cá nhân và nhập mật khẩu phòng thi do Cán bộ coi thi / Chỉ huy cung cấp riêng.
            </p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {checkInError && (
            <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-400 text-red-800 text-xs font-semibold flex items-start gap-3 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <span>{checkInError}</span>
            </div>
          )}

          {/* 1. Select Room */}
          <div>
            <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>1. Chọn Phòng Thi / Đợt Kiểm Tra *</span>
            </label>
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-emerald-600 font-bold"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  [{r.code}] {r.title} ({r.durationMinutes} phút - {r.questions.length} câu) — {r.targetUnit}
                </option>
              ))}
            </select>
            {activeRoom && (
              <p className="text-[11px] text-stone-500 mt-1 italic">
                {activeRoom.description}
              </p>
            )}
          </div>

          {/* 2. Full Name */}
          <div>
            <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-700" />
              <span>2. Họ và Tên Quân Nhân *</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="VD: Nguyễn Văn Hùng..."
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* 3. Rank */}
            <div>
              <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Medal className="w-4 h-4 text-emerald-700" />
                <span>3. Cấp Bậc Quân Hàm *</span>
              </label>
              <input
                type="text"
                list="rank-suggestions-list"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                placeholder="VD: Binh nhì, Binh nhất, Hạ sĩ, Thiếu úy..."
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 font-medium"
              />
              <datalist id="rank-suggestions-list">
                {RANK_SUGGESTIONS.map((r) => (
                  <option key={r} value={r} />
                ))}
              </datalist>
            </div>

            {/* 4. Position */}
            <div>
              <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-emerald-700" />
                <span>4. Chức Vụ Hiện Tại *</span>
              </label>
              <input
                type="text"
                list="position-suggestions-list"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="VD: Chiến sĩ, Tiểu đội trưởng, Đại đội trưởng..."
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 font-medium"
              />
              <datalist id="position-suggestions-list">
                {POSITION_SUGGESTIONS.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>
          </div>

          {/* 5. Unit */}
          <div>
            <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>5. Đơn Vị Trực Thuộc *</span>
            </label>
            <input
              type="text"
              list="unit-suggestions-list"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="VD: Tiểu đoàn 1, Trung đoàn 108, Sư đoàn 305..."
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 font-medium"
            />
            <datalist id="unit-suggestions-list">
              {UNIT_SUGGESTIONS.map((u) => (
                <option key={u} value={u} />
              ))}
            </datalist>
          </div>

          {/* 6. Room Passcode (Strictly private from Admin) */}
          <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-300">
            <label className="block text-xs font-bold text-red-900 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-red-700" />
                <span>6. Mật Khẩu Phòng Thi (Do Cán bộ coi thi / Chỉ huy cung cấp riêng) *</span>
              </span>
            </label>
            <div className="relative">
              <input
                type={showPasscode ? 'text' : 'password'}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Nhập mật khẩu do Cán bộ coi thi / Chỉ huy cung cấp..."
                className="w-full bg-white border border-amber-400 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-red-900 font-mono tracking-wider focus:outline-none focus:border-red-600 font-bold"
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute right-3 top-2.5 text-stone-500 hover:text-stone-700 cursor-pointer"
                title={showPasscode ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Anti-cheat disclaimer */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-[11px] text-stone-700 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-red-800">QUY ĐỊNH KỶ LUẬT SƯ ĐOÀN BB 305:</strong> Khi nhấn "VÀO THI NGAY", bài thi sẽ kích hoạt khóa màn hình toàn diện. Tuyệt đối không thoát màn hình, chuyển tab lạ, hoặc áp dụng AI gian lận. Mọi thao tác đều được hệ thống ghi nhận.
            </div>
          </div>

          {/* Enter Button */}
          <button
            onClick={handleStartExam}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-700 via-emerald-800 to-emerald-900 hover:from-red-600 hover:to-emerald-700 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl cursor-pointer transition"
          >
            <Maximize2 className="w-4 h-4 text-amber-300" />
            <span>XÁC NHẬN THÔNG TIN & BẮT ĐẦU LÀM BÀI THI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
