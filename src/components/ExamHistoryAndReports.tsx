import React, { useState } from 'react';
import { ExamSubmission, ExamRoom } from '../types/military';
import { exportExamResultsToExcel } from '../utils/excelExport';
import {
  FileSpreadsheet,
  Search,
  Filter,
  Eye,
  Award,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Users,
  X
} from 'lucide-react';

interface ExamHistoryAndReportsProps {
  submissions: ExamSubmission[];
  allRooms: ExamRoom[];
}

export const ExamHistoryAndReports: React.FC<ExamHistoryAndReportsProps> = ({
  submissions,
  allRooms,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedClassification, setSelectedClassification] = useState<string>('all');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('all');
  const [viewingSubmission, setViewingSubmission] = useState<ExamSubmission | null>(null);

  // Filtered submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      sub.candidate.fullName.toLowerCase().includes(term) ||
      sub.candidate.unit.toLowerCase().includes(term) ||
      sub.candidate.rank.toLowerCase().includes(term) ||
      sub.examTitle.toLowerCase().includes(term) ||
      sub.examCode.toLowerCase().includes(term);

    const matchesClass =
      selectedClassification === 'all' || sub.classification === selectedClassification;

    const matchesRoom =
      selectedRoomFilter === 'all' || sub.examId === selectedRoomFilter || sub.examCode === selectedRoomFilter;

    return matchesSearch && matchesClass && matchesRoom;
  });

  // Analytics stats
  const total = submissions.length;
  const passed = submissions.filter((s) => s.scaledScore >= 5.0 && s.status !== 'disqualified').length;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0';
  const averageScore =
    total > 0
      ? (submissions.reduce((acc, curr) => acc + curr.scaledScore, 0) / total).toFixed(1)
      : '0';

  const handleExportExcel = () => {
    const activeRoomObj = allRooms.find((r) => r.id === selectedRoomFilter || r.code === selectedRoomFilter) || null;
    exportExamResultsToExcel(filteredSubmissions, activeRoomObj);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white border-2 border-emerald-800 rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300 text-[10px] font-bold uppercase font-military">
              QUÂN KHU 5 — SƯ ĐOÀN BB 305
            </span>
            <span className="text-xs text-stone-500 font-semibold">Lưu Trữ Khảo Thí Quân Nhân</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-emerald-950 font-military tracking-wide mt-1">
            LỊCH SỬ BÀI THI & XUẤT BÁO CÁO EXCEL
          </h2>
          <p className="text-xs text-stone-600">
            Theo dõi quá trình kiểm tra của từng cán bộ, chiến sĩ Sư đoàn BB 305 và xuất bảng tổng hợp kết quả chuẩn Quân khu 5.
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-600 hover:from-emerald-700 hover:to-emerald-500 text-stone-100 font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg transition"
        >
          <FileSpreadsheet className="w-4 h-4 text-amber-300" />
          <span>Xuất Báo Cáo Kết Quả Excel (.xlsx)</span>
        </button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 text-center">
          <span className="text-[11px] text-stone-500 uppercase tracking-wider block">TỔNG BÀI THI LƯU TRỮ</span>
          <span className="text-2xl font-extrabold text-amber-400 font-mono mt-1 block">{total} lượt</span>
          <span className="text-[10px] text-stone-400">Hệ thống lưu trữ vĩnh viễn</span>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 text-center">
          <span className="text-[11px] text-stone-500 uppercase tracking-wider block">ĐIỂM TRUNG BÌNH TOÀN QUÂN</span>
          <span className="text-2xl font-extrabold text-emerald-400 font-mono mt-1 block">
            {averageScore} / 10
          </span>
          <span className="text-[10px] text-stone-400">Đạt chỉ tiêu huấn luyện</span>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 text-center">
          <span className="text-[11px] text-stone-500 uppercase tracking-wider block">TỶ LỆ ĐẠT YÊU CẦU</span>
          <span className="text-2xl font-extrabold text-amber-300 font-mono mt-1 block">{passRate}%</span>
          <span className="text-[10px] text-stone-400">{passed} / {total} đồng chí</span>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 text-center">
          <span className="text-[11px] text-stone-500 uppercase tracking-wider block">TIÊU CHUẨN XUẤT BẢN</span>
          <span className="text-2xl font-extrabold text-red-400 font-mono mt-1 block">QĐNDVN</span>
          <span className="text-[10px] text-stone-400">Kèm chữ ký thủ trưởng</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[240px] relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo họ tên, cấp bậc, chức vụ, đơn vị, mã bài thi..."
            className="w-full bg-stone-950 border border-stone-700 rounded-xl pl-9 pr-4 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <select
            value={selectedClassification}
            onChange={(e) => setSelectedClassification(e.target.value)}
            className="bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Mọi xếp loại ({submissions.length})</option>
            <option value="Xuất sắc">Xuất sắc</option>
            <option value="Giỏi">Giỏi</option>
            <option value="Khá">Khá</option>
            <option value="Đạt">Đạt</option>
            <option value="Không đạt">Không đạt</option>
          </select>

          <select
            value={selectedRoomFilter}
            onChange={(e) => setSelectedRoomFilter(e.target.value)}
            className="bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Tất cả đợt kiểm tra</option>
            {allRooms.map((r) => (
              <option key={r.id} value={r.id}>
                [{r.code}] {r.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-950 text-amber-400 font-military uppercase text-[11px] tracking-wider border-b border-stone-800">
              <tr>
                <th className="py-3 px-4">STT</th>
                <th className="py-3 px-4">Quân Nhân / Cấp Bậc</th>
                <th className="py-3 px-4">Chức Vụ & Đơn Vị</th>
                <th className="py-3 px-4">Đợt Kiểm Tra</th>
                <th className="py-3 px-4 text-center">Điểm (Thang 10)</th>
                <th className="py-3 px-4 text-center">Xếp Loại</th>
                <th className="py-3 px-4 text-center">Vi Phạm</th>
                <th className="py-3 px-4 text-center">Thời Gian Nộp</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-stone-500">
                    Không tìm thấy bài thi nào phù hợp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub, idx) => {
                  const isDisqualified = sub.status === 'disqualified';
                  return (
                    <tr key={sub.id} className="hover:bg-stone-850/60 transition">
                      <td className="py-3 px-4 font-mono text-stone-500">{idx + 1}</td>
                      <td className="py-3 px-4 font-medium text-stone-100">
                        <div className="font-bold">{sub.candidate.fullName}</div>
                        <span className="text-[10px] text-amber-400">{sub.candidate.rank}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-stone-300">{sub.candidate.position}</div>
                        <div className="text-[10px] text-stone-500 truncate max-w-xs">{sub.candidate.unit}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-stone-200 truncate max-w-xs">{sub.examTitle}</div>
                        <span className="text-[10px] font-mono text-stone-500">{sub.examCode}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold font-mono text-sm text-amber-400">
                          {sub.scaledScore.toFixed(1)}
                        </span>
                        <div className="text-[10px] text-stone-500">
                          {sub.correctCount}/{sub.totalQuestions} câu
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isDisqualified
                              ? 'bg-red-950 text-red-300 border border-red-700'
                              : sub.classification === 'Xuất sắc' || sub.classification === 'Giỏi'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                              : sub.classification === 'Khá'
                              ? 'bg-amber-950 text-amber-300 border border-amber-700'
                              : sub.classification === 'Đạt'
                              ? 'bg-blue-950 text-blue-300 border border-blue-700'
                              : 'bg-stone-800 text-stone-400'
                          }`}
                        >
                          {isDisqualified ? 'ĐÌNH CHỈ' : sub.classification}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {sub.violations.length === 0 ? (
                          <span className="text-emerald-400 text-[10px]">0</span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 font-bold text-[10px]">
                            {sub.violations.length} lỗi
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center text-[11px] text-stone-400 font-mono">
                        {new Date(sub.submittedAt).toLocaleDateString('vi-VN')}
                        <div className="text-[10px] text-stone-500">
                          {new Date(sub.submittedAt).toLocaleTimeString('vi-VN')}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setViewingSubmission(sub)}
                          className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Chi Tiết</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: View Single Candidate Answer Sheet */}
      {viewingSubmission && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900 border-2 border-amber-600 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setViewingSubmission(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-200 cursor-pointer rounded-full bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pb-4 border-b border-stone-800">
              <span className="text-[10px] font-bold text-amber-400 font-military uppercase tracking-widest">
                PHIẾU KẾT QUẢ KHẢO THÍ CÁ NHÂN
              </span>
              <h3 className="text-lg font-bold text-amber-300 font-military mt-1">
                {viewingSubmission.examTitle}
              </h3>
              <p className="text-xs text-stone-400">
                Thí sinh: <strong className="text-stone-100">{viewingSubmission.candidate.rank} {viewingSubmission.candidate.fullName}</strong> — {viewingSubmission.candidate.unit}
              </p>
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-3 gap-3 my-4 p-3 rounded-xl bg-stone-950 border border-stone-800 text-center">
              <div>
                <span className="text-[10px] text-stone-500 uppercase block">ĐIỂM SỐ</span>
                <span className="text-xl font-bold font-mono text-amber-400">
                  {viewingSubmission.scaledScore.toFixed(1)} / 10
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 uppercase block">XẾP LOẠI</span>
                <span className="text-xl font-bold font-military text-emerald-400">
                  {viewingSubmission.classification}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 uppercase block">VI PHẠM GIÁM SÁT</span>
                <span className="text-xl font-bold font-military text-red-400">
                  {viewingSubmission.violations.length} lần
                </span>
              </div>
            </div>

            {/* AI Review */}
            {viewingSubmission.aiAnalysis && (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/60 to-stone-950 border border-emerald-700/40 text-xs mb-4">
                <span className="font-bold text-amber-300 block mb-1">Nhận xét của Ban Khảo thí:</span>
                <p className="text-stone-300 italic">"{viewingSubmission.aiAnalysis}"</p>
              </div>
            )}

            {/* Violations Log if any */}
            {viewingSubmission.violations.length > 0 && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-xs mb-4">
                <span className="font-bold text-red-400 block mb-1">Nhật ký vi phạm phòng thi:</span>
                <ul className="space-y-1 list-disc pl-4 text-[11px] text-red-200">
                  {viewingSubmission.violations.map((v, i) => (
                    <li key={i}>
                      [{new Date(v.timestamp).toLocaleTimeString('vi-VN')}] {v.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-3 border-t border-stone-800 flex justify-end">
              <button
                onClick={() => setViewingSubmission(null)}
                className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold cursor-pointer"
              >
                Đóng Cửa Sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
