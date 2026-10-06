/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MilitaryUser, ExamRoom, Question, ExamSubmission, ViolationEvent, CandidateProfile, LiveProctorCandidate } from './types/military';
import {
  INITIAL_USERS,
  INITIAL_ROOMS,
  INITIAL_QUESTIONS,
  INITIAL_SUBMISSIONS
} from './data/mockMilitaryData';
import { MilitaryHeader } from './components/MilitaryHeader';
import { CandidateExamRoom } from './components/CandidateExamRoom';
import { AIExamGenerator } from './components/AIExamGenerator';
import { QuestionBankManager } from './components/QuestionBankManager';
import { ExamRoomsManager } from './components/ExamRoomsManager';
import { LiveProctoringDashboard } from './components/LiveProctoringDashboard';
import { ExamHistoryAndReports } from './components/ExamHistoryAndReports';
import { UserManagement } from './components/UserManagement';
import { HighConcurrencySimulator } from './components/HighConcurrencySimulator';
import { AdminImageSettingsModal } from './components/AdminImageSettingsModal';
import { MILITARY_HERO_BANNER } from './assets/images';
import { playWarningBuzzer } from './services/antiCheatService';

export default function App() {
  // Navigation & Active State
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('exam_portal');
  const [currentUser, setCurrentUser] = useState<MilitaryUser>(INITIAL_USERS[3]); // Default to Candidate (Chiến sĩ)
  const [allUsers, setAllUsers] = useState<MilitaryUser[]>(INITIAL_USERS);

  // Website Custom Image State
  const [bannerImage, setBannerImage] = useState<string>(() => {
    try {
      return localStorage.getItem('QDND_BANNER_IMAGE') || MILITARY_HERO_BANNER;
    } catch {
      return MILITARY_HERO_BANNER;
    }
  });
  const [isImageSettingsOpen, setIsImageSettingsOpen] = useState<boolean>(false);

  // If candidate is locked, prevent entering any tab other than exam_portal
  const handleSelectTab = (tab: string) => {
    if (!isAdminUnlocked && tab !== 'exam_portal') {
      setActiveTab('exam_portal');
      return;
    }
    setActiveTab(tab);
  };

  // Core Data State
  const [rooms, setRooms] = useState<ExamRoom[]>(INITIAL_ROOMS);
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [submissions, setSubmissions] = useState<ExamSubmission[]>(INITIAL_SUBMISSIONS);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Client-side Direct Project Downloader
  const handleDownloadProject = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const res = await fetch('/api/download-project');
      if (!res.ok) throw new Error('Không thể tải tệp tin');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'QDND_305_HeThongKhaoThi_SourceCode.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      window.location.href = '/api/download-project';
    } finally {
      setIsDownloading(false);
    }
  };

  // URL QR Scan parameters & Auto Download Trigger
  const [initialRoomCode, setInitialRoomCode] = useState<string>('');

  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room');
      const downloadParam = urlParams.get('download') || urlParams.get('export');

      if (roomParam) {
        setInitialRoomCode(roomParam);
        setActiveTab('exam_portal');
      }

      if (downloadParam === '1' || downloadParam === 'true') {
        handleDownloadProject();
      }
    } catch {
      // Ignore
    }

    // Keyboard shortcut Ctrl+Shift+D to trigger download
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        handleDownloadProject();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  const [activeCandidates, setActiveCandidates] = useState<LiveProctorCandidate[]>([
    {
      id: 'LCAND_01',
      candidate: {
        fullName: 'Binh nhất Hoàng Văn Đạt',
        rank: 'Binh nhất',
        position: 'Chiến sĩ',
        unit: 'Tiểu đội 1, Đại đội 1, Tiểu đoàn 1',
        militaryId: 'QN-99201'
      },
      examId: 'ROOM_001',
      startTime: new Date().toISOString(),
      answeredCount: 7,
      totalQuestions: 10,
      violationsCount: 0,
      status: 'active',
      lastPing: new Date().toISOString()
    },
    {
      id: 'LCAND_02',
      candidate: {
        fullName: 'Hạ sĩ Đỗ Hữu Chiến',
        rank: 'Hạ sĩ',
        position: 'Khẩu đội trưởng Cối',
        unit: 'Trung đội Hỏa lực, Đại đội 1',
        militaryId: 'QN-98711'
      },
      examId: 'ROOM_001',
      startTime: new Date().toISOString(),
      answeredCount: 4,
      totalQuestions: 10,
      violationsCount: 1,
      recentViolation: {
        id: 'V_INIT_1',
        timestamp: new Date().toISOString(),
        type: 'tab_switch',
        message: 'Thí sinh rời tab bài thi trong 3 giây',
        severity: 'warning'
      },
      status: 'warning',
      lastPing: new Date().toISOString()
    }
  ]);

  const [violationLogs, setViolationLogs] = useState<
    { candidate: CandidateProfile; violation: ViolationEvent; roomCode: string }[]
  >([
    {
      candidate: {
        fullName: 'Hạ sĩ Đỗ Hữu Chiến',
        rank: 'Hạ sĩ',
        position: 'Khẩu đội trưởng Cối',
        unit: 'Trung đội Hỏa lực, Đại đội 1',
        militaryId: 'QN-98711'
      },
      violation: {
        id: 'V_INIT_1',
        timestamp: new Date().toISOString(),
        type: 'tab_switch',
        message: 'Rời tab bài thi sang ứng dụng trình duyệt khác (Nghi vấn tra cứu AI)',
        severity: 'warning'
      },
      roomCode: 'QDND-2026-P01'
    }
  ]);

  // Read QR URL Parameters on load (e.g. ?room=QDND-305-P01)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room');

      if (roomParam) {
        setInitialRoomCode(roomParam);
        setActiveTab('exam_portal');
      }
    } catch {
      // Ignore
    }
  }, []);

  // Handlers
  const handleSwitchUser = (user: MilitaryUser) => {
    setCurrentUser(user);
    if (user.role === 'candidate') {
      setActiveTab('exam_portal');
    } else if (user.role === 'proctor') {
      setActiveTab('live_proctor');
    }
  };

  const handleFinishExam = (submission: ExamSubmission) => {
    setSubmissions((prev) => [submission, ...prev]);
  };

  const handleViolationOccurred = (roomCode: string, candidate: CandidateProfile, violation: ViolationEvent) => {
    // Add to incident audit log
    setViolationLogs((prev) => [
      { candidate, violation, roomCode },
      ...prev
    ]);

    // Update active candidate status in live proctoring
    setActiveCandidates((prev) => {
      const existing = prev.find((c) => c.candidate.fullName === candidate.fullName);
      if (existing) {
        return prev.map((c) =>
          c.candidate.fullName === candidate.fullName
            ? {
                ...c,
                violationsCount: c.violationsCount + 1,
                recentViolation: violation,
                status: c.violationsCount + 1 >= 3 ? 'disqualified' : 'warning'
              }
            : c
        );
      } else {
        return [
          {
            id: `LCAND_${Date.now()}`,
            candidate,
            examId: roomCode,
            startTime: new Date().toISOString(),
            answeredCount: 2,
            totalQuestions: 10,
            violationsCount: 1,
            recentViolation: violation,
            status: 'warning',
            lastPing: new Date().toISOString()
          },
          ...prev
        ];
      }
    });
  };

  const handleAddToQuestionBank = (newQuestions: Question[]) => {
    setQuestions((prev) => [...newQuestions, ...prev]);
  };

  const handleCreateExamRoom = (newRoom: ExamRoom) => {
    setRooms((prev) => [newRoom, ...prev]);
    setActiveTab('exam_rooms');
  };

  const handleSelectRoomToTest = (roomCode: string) => {
    setInitialRoomCode(roomCode);
    setActiveTab('exam_portal');
  };

  // Proctor Actions
  const handleDisqualifyCandidate = (candidateId: string, reason: string) => {
    setActiveCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, status: 'disqualified' } : c))
    );
    alert(`Đã gửi quyết định ĐÌNH CHỈ THI đối với thí sinh. Bài thi của quân nhân bị khóa.`);
  };

  const handleWarnCandidate = (candidateId: string) => {
    playWarningBuzzer();
    alert(`Đã phát loa cảnh báo kỷ luật và rung màn hình đối với thí sinh.`);
  };

  const handleSimulateViolation = () => {
    const randomCandidate: CandidateProfile = {
      fullName: 'Binh nhì Nguyễn Thành Long',
      rank: 'Binh nhì',
      position: 'Chiến sĩ mới',
      unit: 'Tiểu đội 2, Trung đội 1, Đại đội 1',
      militaryId: 'QN-99321'
    };

    const newViolation: ViolationEvent = {
      id: `VIOL_SIM_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'tab_switch',
      message: 'Hệ thống phát hiện thí sinh mở tab phụ tra cứu lời giải AI và thoát toàn màn hình!',
      severity: 'critical'
    };

    handleViolationOccurred('QDND-2026-P01', randomCandidate, newViolation);
    playWarningBuzzer();
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col justify-between military-grid-pattern">
      {/* Top Military Header with Emblem, Sư đoàn BB 305 & Role Switcher */}
      <MilitaryHeader
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        allUsers={allUsers}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        isAdminUnlocked={isAdminUnlocked}
        onToggleAdminUnlock={setIsAdminUnlocked}
        onOpenImageSettings={() => setIsImageSettingsOpen(true)}
        onDownloadProject={handleDownloadProject}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 w-full pb-12">
        {activeTab === 'exam_portal' && (
          <CandidateExamRoom
            rooms={rooms}
            onFinishExam={handleFinishExam}
            onViolationOccurred={handleViolationOccurred}
            initialRoomCode={initialRoomCode}
            bannerImage={bannerImage}
            isAdminUnlocked={isAdminUnlocked}
            onOpenImageSettings={() => setIsImageSettingsOpen(true)}
          />
        )}

        {/* Admin tabs only accessible when unlocked */}
        {isAdminUnlocked && activeTab === 'ai_generator' && (
          <AIExamGenerator
            onAddToQuestionBank={handleAddToQuestionBank}
            onCreateExamRoomFromAI={handleCreateExamRoom}
          />
        )}

        {isAdminUnlocked && activeTab === 'question_bank' && (
          <QuestionBankManager
            questions={questions}
            onAddQuestion={(q) => setQuestions((prev) => [q, ...prev])}
            onUpdateQuestion={(q) =>
              setQuestions((prev) => prev.map((item) => (item.id === q.id ? q : item)))
            }
            onDeleteQuestion={(id) => setQuestions((prev) => prev.filter((item) => item.id !== id))}
            onBatchImport={(imported) => setQuestions((prev) => [...imported, ...prev])}
          />
        )}

        {isAdminUnlocked && activeTab === 'exam_rooms' && (
          <ExamRoomsManager
            rooms={rooms}
            allQuestions={questions}
            onCreateRoom={handleCreateExamRoom}
            onUpdateRoomStatus={(id, status) =>
              setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
            }
            onSelectRoomToTest={handleSelectRoomToTest}
            onOpenImageSettings={() => setIsImageSettingsOpen(true)}
          />
        )}

        {isAdminUnlocked && activeTab === 'live_proctor' && (
          <LiveProctoringDashboard
            activeCandidates={activeCandidates}
            violationLogs={violationLogs}
            onDisqualifyCandidate={handleDisqualifyCandidate}
            onWarnCandidate={handleWarnCandidate}
            onSimulateViolation={handleSimulateViolation}
          />
        )}

        {isAdminUnlocked && activeTab === 'history_reports' && (
          <ExamHistoryAndReports submissions={submissions} allRooms={rooms} />
        )}

        {isAdminUnlocked && activeTab === 'user_management' && (
          <UserManagement
            users={allUsers}
            onAddUser={(u) => setAllUsers((prev) => [...prev, u])}
            onUpdateUser={(u) => setAllUsers((prev) => prev.map((item) => (item.id === u.id ? u : item)))}
            onToggleUserStatus={(id) =>
              setAllUsers((prev) =>
                prev.map((item) => (item.id === id ? { ...item, isActive: !item.isActive } : item))
              )
            }
          />
        )}

        {isAdminUnlocked && activeTab === 'concurrency_scale' && <HighConcurrencySimulator />}
      </main>

      {/* Admin Image Customization Modal */}
      {isAdminUnlocked && (
        <AdminImageSettingsModal
          isOpen={isImageSettingsOpen}
          onClose={() => setIsImageSettingsOpen(false)}
          currentBannerImage={bannerImage}
          onSelectBannerImage={(newUrl) => setBannerImage(newUrl)}
        />
      )}

      {/* Official Military Footer */}
      <footer className="bg-white border-t-2 border-emerald-900 py-6 text-xs text-stone-600 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-red-700 border border-amber-300 text-amber-200 font-bold flex items-center justify-center text-sm shadow">
              ★
            </span>
            <div>
              <div className="font-military font-bold text-emerald-950 uppercase tracking-wider text-xs">
                QUÂN KHU 5 — SƯ ĐOÀN BỘ BINH 305 (SƯ ĐOÀN BB 305)
              </div>
              <p className="text-[11px] text-stone-500 font-medium">
                Hệ thống Khảo thí & Thi trực tuyến Quân sự • Bảo mật tuyệt đối • Chống gian lận AI
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-4 text-[11px] text-stone-600 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>Máy chủ khảo thí: <strong className="text-emerald-900">SẴN SÀNG</strong></span>
            </span>
            <span>•</span>
            <span>
              Phiên bản:{' '}
              <button
                onClick={handleDownloadProject}
                disabled={isDownloading}
                title="Bấm để tải về mã nguồn dự án (.zip) hoặc nhấn Ctrl+Shift+D"
                className="text-emerald-950 font-mono hover:underline cursor-pointer focus:outline-none"
              >
                {isDownloading ? 'Đang đóng gói...' : 'QĐND-305.2026'}
              </button>
            </span>
            <span>•</span>
            <span className="text-red-700 font-military font-bold">TRUNG VỚI ĐẢNG — HIẾU VỚI DÂN</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
