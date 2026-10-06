import React, { useState, useEffect } from 'react';
import { MilitaryUser } from '../types/military';
import {
  Shield,
  Clock,
  Lock,
  Unlock,
  ChevronDown,
  CheckCircle2,
  UserCheck,
  ShieldAlert,
  LogOut,
  Image,
  Download
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: string;
}

interface MilitaryHeaderProps {
  currentUser: MilitaryUser;
  onSwitchUser: (user: MilitaryUser) => void;
  allUsers: MilitaryUser[];
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isAdminUnlocked: boolean;
  onToggleAdminUnlock: (unlocked: boolean) => void;
  onOpenImageSettings?: () => void;
  onDownloadProject?: () => void;
}

export const MilitaryHeader: React.FC<MilitaryHeaderProps> = ({
  currentUser,
  onSwitchUser,
  allUsers,
  activeTab,
  onSelectTab,
  isAdminUnlocked,
  onToggleAdminUnlock,
  onOpenImageSettings,
  onDownloadProject,
}) => {
  const [time, setTime] = useState<string>('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('vi-VN', { hour12: false }) +
        ' | ' +
        now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Admin tabs vs Candidate tabs
  const adminNavItems: NavItem[] = [
    { id: 'exam_portal', label: 'Cổng Phòng Thi', icon: '🎯' },
    { id: 'ai_generator', label: 'Tạo Đề Thi AI', icon: '⚡' },
    { id: 'question_bank', label: 'Ngân Hàng Câu Hỏi & Word', icon: '📚' },
    { id: 'exam_rooms', label: 'Phòng Thi & Mã QR', icon: '🏛️' },
    { id: 'live_proctor', label: 'Giám Sát Gian Lận', icon: '🛡️', badge: 'Trực tiếp' },
    { id: 'history_reports', label: 'Lịch Sử & Báo Cáo Excel', icon: '📊' },
    { id: 'user_management', label: 'Phân Quyền Quân Nhân', icon: '👥' },
    { id: 'concurrency_scale', label: 'Hạ Tầng 1000+ Thí Sinh', icon: '🚀' },
  ];

  // Candidates ONLY have access to the Exam Portal
  const candidateNavItems: NavItem[] = [
    { id: 'exam_portal', label: 'Cổng Phòng Thi Quân Nhân', icon: '🎯' }
  ];

  const currentNavItems = isAdminUnlocked ? adminNavItems : candidateNavItems;

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError('');
    // Passcode for admin: 'admin305' or '305' or 'admin'
    const pwd = adminPasswordInput.trim().toLowerCase();
    if (pwd === 'admin305' || pwd === '305' || pwd === 'admin' || pwd === 'qdndvn2026') {
      onToggleAdminUnlock(true);
      // Switch current user to commander
      const adminUser = allUsers.find((u) => u.role === 'super_admin' || u.role === 'admin') || allUsers[0];
      onSwitchUser(adminUser);
      setIsLoginModalOpen(false);
      setAdminPasswordInput('');
    } else {
      setAdminLoginError('Mật khẩu quản trị không chính xác! Vui lòng nhập mật khẩu được cấp (Mặc định: admin305 hoặc admin)');
    }
  };

  const handleLockAdmin = () => {
    onToggleAdminUnlock(false);
    // Switch to candidate user
    const candUser = allUsers.find((u) => u.role === 'candidate') || allUsers[allUsers.length - 1];
    onSwitchUser(candUser);
    onSelectTab('exam_portal');
  };

  return (
    <header className="bg-white border-b-2 border-red-700/80 sticky top-0 z-40 shadow-md">
      {/* Top Banner with Vietnamese National Flag red/gold ribbon and updated Title */}
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-800 text-amber-100 px-4 py-1.5 flex flex-wrap items-center justify-between text-xs font-semibold tracking-wider shadow-inner">
        <div className="flex items-center gap-2">
          {/* Vietnam Gold Star Icon */}
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-800 border border-amber-300 text-amber-300 text-xs shadow font-bold">
            ★
          </span>
          <span className="text-amber-100 font-military uppercase tracking-wider text-[12px] sm:text-sm font-bold">
            QUÂN KHU 5 — SƯ ĐOÀN BỘ BINH 305 (SƯ ĐOÀN BB 305)
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-amber-100 hidden sm:flex">
          <span className="bg-red-800 px-2 py-0.5 rounded border border-amber-300/40 text-amber-200 font-military tracking-widest text-[11px]">
            TRUNG VỚI ĐẢNG — HIẾU VỚI DÂN — QUYẾT CHIẾN QUYẾT THẮNG
          </span>
          <div className="flex items-center gap-1.5 font-mono text-amber-100 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>{time}</span>
          </div>
        </div>
      </div>

      {/* Main Command Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Logo & Emblem */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('exam_portal')}>
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900 border-2 border-amber-500 shadow-md">
            <Shield className="w-6 h-6 text-amber-300" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600 border border-amber-300 text-[8px] font-bold text-amber-200 items-center justify-center">
                ★
              </span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-emerald-900 font-military tracking-wide leading-tight">
                HỆ THỐNG KHẢO THÍ & THI TRỰC TUYẾN
              </h1>
              <span className="hidden md:inline-block px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-300 text-[10px] font-bold">
                SƯ ĐOÀN BB 305
              </span>
            </div>
            <p className="text-[11px] text-stone-600 font-medium hidden sm:block">
              Quân khu 5 • Ngân hàng đề thi Word tự động • Khóa màn hình chống gian lận AI
            </p>
          </div>
        </div>

        {/* Access Level Badge & Login/Unlock Control */}
        <div className="flex items-center gap-2.5">
          {isAdminUnlocked ? (
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 hidden sm:flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <div>
                  <div className="font-bold text-[11px] leading-tight">QUYỀN QUẢN TRỊ VIÊN (ADMIN)</div>
                  <div className="text-[10px] text-emerald-700 font-medium">Toàn quyền hệ thống Sư đoàn BB 305</div>
                </div>
              </div>
              {onOpenImageSettings && (
                <button
                  onClick={onOpenImageSettings}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                  title="Thay đổi hình ảnh hiển thị trên trang web (Thư viện AI hoặc ảnh tải lên)"
                >
                  <Image className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="hidden md:inline">Đổi Ảnh Website</span>
                </button>
              )}
              {onDownloadProject && (
                <button
                  onClick={onDownloadProject}
                  className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                  title="Tải về file mã nguồn dự án (.zip)"
                >
                  <Download className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden md:inline">Tải Mã Nguồn (.zip)</span>
                </button>
              )}
              <button
                onClick={handleLockAdmin}
                className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition shadow-sm"
                title="Khóa quyền và chuyển về chế độ thí sinh chỉ được xem phòng thi"
              >
                <LogOut className="w-3.5 h-3.5 text-stone-500" />
                <span>Chế Độ Thí Sinh</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-950 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className="text-[11px] font-bold hidden sm:inline">Chế độ Thí sinh (Chỉ vào phòng thi)</span>
                <span className="text-[11px] font-bold sm:hidden">Thí sinh</span>
              </div>
              <button
                onClick={() => {
                  setAdminPasswordInput('');
                  setAdminLoginError('');
                  setIsLoginModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-amber-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow"
              >
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span>Đăng Nhập Quản Trị</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tab Bar (Strictly restricted for candidates) */}
      <div className="bg-stone-50 border-t border-stone-200 px-2 sm:px-6 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 sm:gap-2 py-1.5 min-w-max">
          {currentNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-800 text-amber-200 shadow-md border border-emerald-900'
                    : 'text-stone-700 hover:text-emerald-900 hover:bg-stone-200 border border-transparent'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-red-600 text-white font-bold animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {!isAdminUnlocked && (
            <span className="text-[11px] text-stone-500 italic ml-2">
              Thí sinh chỉ có quyền truy cập duy nhất vào Phòng Thi theo quy định của Ban Tổ chức.
            </span>
          )}
        </div>
      </div>

      {/* Admin Login Dialog Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-red-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="text-center pb-4 border-b border-stone-200">
              <span className="w-10 h-10 rounded-full bg-red-700 text-amber-300 font-bold flex items-center justify-center mx-auto mb-2 text-base shadow">
                ★
              </span>
              <h3 className="text-base font-black text-red-800 font-military uppercase">
                XÁC THỰC QUYỀN CÁN BỘ QUẢN TRỊ (ADMIN)
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                Sư đoàn Bộ binh 305 — Quân khu 5
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4 my-4">
              {adminLoginError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-300 text-red-700 text-xs">
                  {adminLoginError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Mật khẩu Quản trị viên Sư đoàn BB 305 *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    placeholder="Nhập mật khẩu (Mặc định: admin305 hoặc admin)"
                    autoFocus
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-red-600 font-mono"
                  />
                  <Lock className="w-4 h-4 text-stone-400 absolute right-3.5 top-3" />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Mật khẩu mặc định hệ thống: <code className="font-bold text-red-700">admin305</code> hoặc <code className="font-bold text-red-700">admin</code>
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-bold text-xs uppercase cursor-pointer shadow-md"
                >
                  Mở Khóa Toàn Bộ Quyền
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
