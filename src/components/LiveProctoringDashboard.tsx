import React, { useState } from 'react';
import { LiveProctorCandidate, ViolationEvent, CandidateProfile } from '../types/military';
import {
  ShieldAlert,
  Bell,
  Eye,
  AlertTriangle,
  CheckCircle2,
  XOctagon,
  Radio,
  Clock,
  UserX,
  Volume2,
  FileSpreadsheet,
  Activity,
  Flame
} from 'lucide-react';

interface LiveProctoringDashboardProps {
  activeCandidates: LiveProctorCandidate[];
  violationLogs: { candidate: CandidateProfile; violation: ViolationEvent; roomCode: string }[];
  onDisqualifyCandidate: (candidateId: string, reason: string) => void;
  onWarnCandidate: (candidateId: string) => void;
  onSimulateViolation: () => void;
}

export const LiveProctoringDashboard: React.FC<LiveProctoringDashboardProps> = ({
  activeCandidates,
  violationLogs,
  onDisqualifyCandidate,
  onWarnCandidate,
  onSimulateViolation,
}) => {
  const [filterViolationOnly, setFilterViolationOnly] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);

  const displayedCandidates = filterViolationOnly
    ? activeCandidates.filter((c) => c.violationsCount > 0)
    : activeCandidates;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white border-2 border-red-700 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-100 border-2 border-red-500 flex items-center justify-center text-red-700 shadow-md">
              <ShieldAlert className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-red-700 text-white text-[10px] font-bold uppercase font-military flex items-center gap-1 shadow-sm">
                  <Radio className="w-3 h-3 animate-ping" />
                  <span>TRỰC TIẾP — QUÂN KHU 5, SƯ ĐOÀN BB 305</span>
                </span>
                <span className="text-xs text-stone-500 font-semibold">Ban Giám Thị Khảo Thí</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-red-800 font-military tracking-wide mt-1">
                TRUNG TÂM GIÁM SÁT CHỐNG GIAN LẬN & PHÁT HIỆN AI
              </h2>
              <p className="text-xs text-stone-600">
                Phát hiện hành vi rời màn hình, chuyển tab tra cứu AI, mở DevTools, sao chép đề thi và khóa máy tức thì.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onSimulateViolation}
              className="px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition"
              title="Nhấn để kích hoạt một sự cố vi phạm mẫu và quan sát cảnh báo đỏ nhấp nháy"
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>Mô Phỏng 01 Vi Phạm Rời Tab</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 text-center">
          <span className="text-[11px] text-stone-500 uppercase tracking-wider block">QUÂN SỐ ĐANG THI</span>
          <span className="text-2xl font-extrabold text-amber-400 font-mono mt-1 block">
            {activeCandidates.length} đ/c
          </span>
          <span className="text-[10px] text-emerald-400">Kết nối bảo mật cao</span>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 text-center">
          <span className="text-[11px] text-stone-500 uppercase tracking-wider block">VI PHẠM BỊ PHÁT HIỆN</span>
          <span className="text-2xl font-extrabold text-red-400 font-mono mt-1 block">
            {violationLogs.length} vụ
          </span>
          <span className="text-[10px] text-red-400">Đã gửi cảnh báo tức thì</span>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 text-center">
          <span className="text-[11px] text-stone-500 uppercase tracking-wider block">TỶ LỆ KỶ LUẬT CAO</span>
          <span className="text-2xl font-extrabold text-emerald-400 font-mono mt-1 block">
            {activeCandidates.length > 0
              ? `${Math.round(((activeCandidates.filter((c) => c.violationsCount === 0).length) / activeCandidates.length) * 100)}%`
              : '100%'}
          </span>
          <span className="text-[10px] text-stone-400">Chấp hành nghiêm</span>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 text-center">
          <span className="text-[11px] text-stone-500 uppercase tracking-wider block">CHẾ ĐỘ KHÓA MÀN HÌNH</span>
          <span className="text-2xl font-extrabold text-amber-400 font-mono mt-1 block">BẬT (STRICT)</span>
          <span className="text-[10px] text-amber-400">Khóa Fullscreen toàn bộ</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Candidates Feed (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>DANH SÁCH THÍ SINH ĐANG LÀM BÀI TRỰC TIẾP ({displayedCandidates.length})</span>
            </h3>

            <label className="flex items-center gap-2 text-xs text-stone-400 cursor-pointer">
              <input
                type="checkbox"
                checked={filterViolationOnly}
                onChange={(e) => setFilterViolationOnly(e.target.checked)}
                className="accent-red-600 rounded"
              />
              <span>Chỉ hiển thị có vi phạm</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {displayedCandidates.map((c) => {
              const hasViolations = c.violationsCount > 0;
              const isDisqualified = c.status === 'disqualified';

              return (
                <div
                  key={c.id}
                  className={`bg-stone-900 border rounded-2xl p-4 shadow-lg transition-all ${
                    isDisqualified
                      ? 'border-red-900 bg-red-950/20 opacity-70'
                      : hasViolations
                      ? 'border-red-500 shadow-red-950/50 animate-pulse'
                      : 'border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-stone-800 text-xs">
                    <div>
                      <div className="font-bold text-stone-100 flex items-center gap-1.5">
                        <span>{c.candidate.rank} {c.candidate.fullName}</span>
                      </div>
                      <span className="text-[10px] text-stone-400 truncate block">{c.candidate.unit}</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isDisqualified
                          ? 'bg-red-900 text-red-200'
                          : hasViolations
                          ? 'bg-red-950 text-red-300 border border-red-600'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      }`}
                    >
                      {isDisqualified
                        ? 'ĐÃ ĐÌNH CHỈ'
                        : hasViolations
                        ? `CẢNH BÁO (${c.violationsCount} LẦN)`
                        : 'BÌNH THƯỜNG'}
                    </span>
                  </div>

                  {/* Progress & Violation details */}
                  <div className="my-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-stone-400">
                      <span>Tiến độ bài làm:</span>
                      <strong className="text-amber-400 font-mono">
                        {c.answeredCount}/{c.totalQuestions} câu
                      </strong>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-stone-950 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-500 h-1.5 rounded-full transition-all"
                        style={{
                          width: `${(c.answeredCount / (c.totalQuestions || 1)) * 100}%`
                        }}
                      ></div>
                    </div>

                    {c.recentViolation && (
                      <div className="p-2 rounded bg-red-950/80 border border-red-700/60 text-[10px] text-red-200 mt-2 font-mono">
                        ⚠️ {c.recentViolation.message}
                      </div>
                    )}
                  </div>

                  {/* Supervisor Remote Actions */}
                  <div className="pt-2 border-t border-stone-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onWarnCandidate(c.id)}
                      disabled={isDisqualified}
                      className="flex-1 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Cảnh Cáo</span>
                    </button>

                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `Đồng chí có chắc chắn muốn ĐÌNH CHỈ THI quân nhân ${c.candidate.fullName} không?`
                          )
                        ) {
                          onDisqualifyCandidate(c.id, 'Ban Giám thị đình chỉ do gian lận trực tuyến.');
                        }
                      }}
                      disabled={isDisqualified}
                      className="flex-1 py-1.5 rounded-lg bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                    >
                      <UserX className="w-3.5 h-3.5 text-red-400" />
                      <span>Đình Chỉ Thi</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Violation Incident Log (1 Column) */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <span>NHẬT KÝ SỰ CỐ TỨC THÌ ({violationLogs.length})</span>
          </h3>

          <div className="bg-stone-900 border border-red-900/60 rounded-2xl p-4 shadow-xl max-h-[550px] overflow-y-auto space-y-2.5">
            {violationLogs.length === 0 ? (
              <div className="p-8 text-center text-stone-500 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                <span>Chưa ghi nhận vi phạm kỷ luật phòng thi nào.</span>
              </div>
            ) : (
              violationLogs.map((log, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-stone-950 border border-red-800/50 hover:border-red-600 transition text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono">
                    <span className="text-red-400 font-bold">
                      [{new Date(log.violation.timestamp).toLocaleTimeString('vi-VN')}]
                    </span>
                    <span>Phòng {log.roomCode}</span>
                  </div>

                  <div className="font-bold text-stone-200">
                    {log.candidate.rank} {log.candidate.fullName}
                  </div>
                  <div className="text-[10px] text-stone-400 truncate">{log.candidate.unit}</div>

                  <div className="p-1.5 rounded bg-red-950/60 border border-red-900 text-[10px] text-red-300 font-mono">
                    {log.violation.message}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
