import React, { useState, useEffect } from 'react';
import { ExamRoom, Question } from '../types/military';
import { generateExamRoomQRCode } from '../utils/qrCodeGenerator';
import {
  QrCode,
  Plus,
  Clock,
  Lock,
  Users,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Download,
  Printer,
  Calendar,
  X,
  FileCheck,
  Image
} from 'lucide-react';

interface ExamRoomsManagerProps {
  rooms: ExamRoom[];
  allQuestions: Question[];
  onCreateRoom: (room: ExamRoom) => void;
  onUpdateRoomStatus: (roomId: string, status: 'active' | 'scheduled' | 'closed') => void;
  onSelectRoomToTest: (roomCode: string) => void;
  onOpenImageSettings?: () => void;
}

export const ExamRoomsManager: React.FC<ExamRoomsManagerProps> = ({
  rooms,
  allQuestions,
  onCreateRoom,
  onUpdateRoomStatus,
  onSelectRoomToTest,
  onOpenImageSettings,
}) => {
  const [selectedRoomForQR, setSelectedRoomForQR] = useState<ExamRoom | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Create Room Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCode, setNewCode] = useState<string>(`QDND-2026-P0${rooms.length + 1}`);
  const [newPasscode, setNewPasscode] = useState<string>('QDNDVN2026');
  const [newDuration, setNewDuration] = useState<number>(20);
  const [newTargetUnit, setNewTargetUnit] = useState<string>('Toàn Trung đoàn 9');
  
  // Custom question quantity & shuffle options as requested
  const [questionSelectMode, setQuestionSelectMode] = useState<'auto_random' | 'manual'>('auto_random');
  const [customQuestionCount, setCustomQuestionCount] = useState<number>(10);
  const [selectedCategoryForRoom, setSelectedCategoryForRoom] = useState<string>('all');
  const [autoShuffleQuestions, setAutoShuffleQuestions] = useState<boolean>(true);
  const [autoShuffleOptions, setAutoShuffleOptions] = useState<boolean>(true);
  
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>(
    allQuestions.slice(0, 10).map((q) => q.id)
  );

  // Helper shuffle array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Helper shuffle options and preserve correct answer
  const shuffleQuestionAnswers = (q: Question): Question => {
    const originalCorrectOption = q.options[q.correctAnswerIndex];
    const shuffledOptions = shuffleArray(q.options);
    const newCorrectIndex = shuffledOptions.indexOf(originalCorrectOption);
    return {
      ...q,
      options: shuffledOptions,
      correctAnswerIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0,
    };
  };

  // Generate QR when a room is selected (QR only directs to the room, does not expose passcode)
  useEffect(() => {
    if (selectedRoomForQR) {
      generateExamRoomQRCode(selectedRoomForQR.code).then((url) => {
        setQrCodeDataUrl(url);
      });
    }
  }, [selectedRoomForQR]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateSubmit = () => {
    if (!newTitle.trim()) {
      alert('Vui lòng nhập tên đợt kiểm tra!');
      return;
    }
    if (!newPasscode.trim()) {
      alert('Vui lòng quy định mật khẩu dùng chung cho phòng thi!');
      return;
    }

    let finalQuestions: Question[] = [];

    if (questionSelectMode === 'auto_random') {
      const pool = selectedCategoryForRoom === 'all'
        ? allQuestions
        : allQuestions.filter((q) => q.category === selectedCategoryForRoom);

      if (pool.length === 0) {
        alert('Không có câu hỏi nào trong chuyên mục đã chọn!');
        return;
      }

      const count = Math.min(customQuestionCount, pool.length);
      const shuffledPool = shuffleArray(pool);
      finalQuestions = shuffledPool.slice(0, count);
    } else {
      if (selectedQuestionIds.length === 0) {
        alert('Vui lòng chọn ít nhất 1 câu hỏi cho phòng thi!');
        return;
      }
      finalQuestions = allQuestions.filter((q) => selectedQuestionIds.includes(q.id));
    }

    // Tự động đảo câu hỏi nếu được chọn
    if (autoShuffleQuestions) {
      finalQuestions = shuffleArray(finalQuestions);
    }

    // Tự động đảo đáp án A, B, C, D nếu được chọn (bảo toàn 100% tính chính xác của đáp án đúng)
    if (autoShuffleOptions) {
      finalQuestions = finalQuestions.map((q) => shuffleQuestionAnswers(q));
    }

    const room: ExamRoom = {
      id: `ROOM_${Date.now()}`,
      code: newCode.trim().toUpperCase(),
      title: newTitle.trim(),
      description: `Đợt kiểm tra quy định thời gian ${newDuration} phút dành cho ${newTargetUnit}. Đề thi gồm ${finalQuestions.length} câu (đã tự động đảo câu & đảo đáp án).`,
      passcode: newPasscode.trim(),
      durationMinutes: newDuration,
      totalQuestions: finalQuestions.length,
      passingScore: 5.0,
      status: 'active',
      questions: finalQuestions,
      createdAt: new Date().toISOString(),
      createdBy: 'Ban Khảo thí & Quân huấn Sư đoàn BB 305',
      targetUnit: newTargetUnit,
      antiCheatMode: 'strict',
      allowInstantResult: true
    };

    onCreateRoom(room);
    setIsCreateModalOpen(false);
    setSelectedRoomForQR(room);
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
            <span className="text-xs text-stone-500 font-semibold">Điều Hành Khảo Thí Quân Sự</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-emerald-950 font-military tracking-wide mt-1">
            QUẢN LÝ PHÒNG THI & XUẤT MÃ QR TRỰC TUYẾN
          </h2>
          <p className="text-xs text-stone-600">
            Chiếu mã QR lên màn hình hội trường hoặc in thông báo để quân nhân quét mã trực tiếp và nhập thông tin vào thi.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {onOpenImageSettings && (
            <button
              onClick={onOpenImageSettings}
              className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition"
              title="Đổi ảnh bìa banner hiển thị trên cổng thi và hệ thống"
            >
              <Image className="w-4 h-4 text-emerald-700" />
              <span>Đổi Ảnh Banner (Admin)</span>
            </button>
          )}

          <button
            onClick={() => {
              setNewCode(`QDND-305-P0${rooms.length + 1}`);
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-bold text-xs uppercase flex items-center gap-2 cursor-pointer shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Phòng Thi Mới</span>
          </button>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => {
          const isActive = room.status === 'active';
          const isClosed = room.status === 'closed';

          return (
            <div
              key={room.id}
              className={`bg-white border-2 rounded-3xl p-6 shadow-sm transition-all flex flex-col justify-between ${
                isActive
                  ? 'border-emerald-700 hover:shadow-md'
                  : isClosed
                  ? 'border-stone-200 opacity-60'
                  : 'border-blue-300'
              }`}
            >
              <div>
                {/* Header status */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 text-xs">
                  <span className="font-mono font-bold text-emerald-900 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    {room.code}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : isClosed
                        ? 'bg-stone-100 text-stone-500'
                        : 'bg-blue-100 text-blue-900 border border-blue-300'
                    }`}
                  >
                    {isActive ? '● ĐANG MỞ THI' : isClosed ? 'ĐÃ ĐÓNG' : 'ĐÃ LÊN LỊCH'}
                  </span>
                </div>

                {/* Title & Info */}
                <div className="my-3.5">
                  <h3 className="text-sm font-bold text-stone-900 line-clamp-2 leading-snug">{room.title}</h3>
                  <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">{room.description}</p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 my-3 p-3 rounded-2xl bg-stone-50 border border-stone-200 text-[11px]">
                  <div className="flex items-center gap-1.5 text-stone-700">
                    <Clock className="w-3.5 h-3.5 text-emerald-700" />
                    <span><strong>{room.durationMinutes}</strong> phút</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-700">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span><strong>{room.questions.length}</strong> câu hỏi</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-700 col-span-2">
                    <Users className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="truncate">{room.targetUnit}</span>
                  </div>
                </div>

                {/* Common Passcode Highlight */}
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-300 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-500 block">Mật khẩu phòng (Admin cung cấp riêng cho thí sinh):</span>
                    <strong className="font-mono text-red-800 tracking-wider text-base">{room.passcode}</strong>
                  </div>
                  <button
                    onClick={() => handleCopy(room.passcode, `pass_${room.id}`)}
                    className="p-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 cursor-pointer shadow-sm"
                    title="Sao chép mật khẩu"
                  >
                    {copiedCode === `pass_${room.id}` ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedRoomForQR(room)}
                  className="flex-1 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-emerald-950 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-stone-300 transition"
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Mã QR & Link</span>
                </button>

                <button
                  onClick={() => onSelectRoomToTest(room.code)}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Vào Thi Thử</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* QR Code Presentation Modal */}
      {selectedRoomForQR && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900 border-2 border-amber-600 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-center">
            <button
              onClick={() => setSelectedRoomForQR(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-200 cursor-pointer rounded-full bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Emblem and Header */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-red-600 border border-amber-400 text-amber-300 font-bold flex items-center justify-center text-xs">
                ★
              </span>
              <span className="font-military text-amber-400 tracking-widest text-xs uppercase">
                QUÂN ĐỘI NHÂN DÂN VIỆT NAM
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-amber-300 font-military leading-snug">
              {selectedRoomForQR.title}
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Phòng thi: <strong className="text-stone-200 font-mono">{selectedRoomForQR.code}</strong> • Thời gian:{' '}
              <strong className="text-amber-400">{selectedRoomForQR.durationMinutes} phút</strong>
            </p>

            {/* High-Resolution QR Box */}
            <div className="my-6 p-4 bg-white rounded-2xl inline-block shadow-2xl border-4 border-amber-500">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt={`QR Code phòng thi ${selectedRoomForQR.code}`}
                  className="w-56 h-56 mx-auto object-contain"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-stone-500">
                  Đang khởi tạo mã QR...
                </div>
              )}
            </div>

            {/* Passcode Instruction Box */}
            <div className="bg-stone-950 p-4 rounded-2xl border border-amber-600/50 mb-5 text-left">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400 uppercase tracking-wider font-semibold">MẬT KHẨU DO ADMIN QUY ĐỊNH:</span>
                <span className="text-[10px] bg-red-950 text-red-300 border border-red-800 px-1.5 py-0.2 rounded font-bold">
                  CUNG CẤP RIÊNG
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl font-black font-mono text-amber-400 tracking-widest">
                  {selectedRoomForQR.passcode}
                </span>
                <button
                  onClick={() => handleCopy(selectedRoomForQR.passcode, 'modal_pass')}
                  className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  {copiedCode === 'modal_pass' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>Sao chép</span>
                </button>
              </div>
              <p className="text-[11px] text-amber-200/90 mt-2 font-medium">
                * Lưu ý bảo mật: Mật khẩu này KHÔNG hiển thị ở màn hình đăng nhập của thí sinh. Cán bộ coi thi thông báo trực tiếp cho thí sinh tại phòng thi.
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-center gap-3">
              {qrCodeDataUrl && (
                <a
                  href={qrCodeDataUrl}
                  download={`Mã_QR_Phong_Thi_${selectedRoomForQR.code}.png`}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 shadow"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Tải Ảnh QR PNG</span>
                </a>
              )}

              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>In Giấy Báo Thi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Room Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-amber-600/70 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-base font-bold text-amber-400 font-military uppercase">
                TẠO PHÒNG THI & ĐỢT KIỂM TRA MỚI
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 my-4 text-xs">
              <div>
                <label className="block font-bold text-stone-300 mb-1">Tên đợt kiểm tra / Phòng thi *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: KIỂM TRA ĐIỀU LỆNH QUẢN LÝ BỘ ĐỘI QUÝ IV"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-300 mb-1">Mã phòng thi *</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 font-mono text-amber-300 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-300 mb-1">Mật khẩu dùng chung *</label>
                  <input
                    type="text"
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 font-mono text-amber-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-300 mb-1">Thời gian làm bài (Phút) *</label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    min={1}
                    max={180}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-300 mb-1">Đơn vị tham gia *</label>
                  <input
                    type="text"
                    value={newTargetUnit}
                    onChange={(e) => setNewTargetUnit(e.target.value)}
                    placeholder="Ví dụ: Đại đội 1, Tiểu đoàn 1"
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Question Selection Mode & Quantity */}
              <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-amber-300 uppercase tracking-wide text-[11px]">
                    CƠ CHẾ LẤY CÂU HỎI TỪ NGÂN HÀNG & ĐẢO ĐỀ
                  </label>
                  <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-lg border border-stone-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setQuestionSelectMode('auto_random')}
                      className={`px-2.5 py-1 rounded font-bold cursor-pointer transition ${
                        questionSelectMode === 'auto_random'
                          ? 'bg-amber-600 text-stone-950 shadow-xs'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      Tự động theo số lượng
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuestionSelectMode('manual')}
                      className={`px-2.5 py-1 rounded font-bold cursor-pointer transition ${
                        questionSelectMode === 'manual'
                          ? 'bg-amber-600 text-stone-950 shadow-xs'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      Chọn thủ công
                    </button>
                  </div>
                </div>

                {questionSelectMode === 'auto_random' ? (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-bold text-stone-300">
                            Số lượng câu hỏi (Tự nhập) *:
                          </label>
                          <span className="text-[11px] font-mono font-bold text-amber-400">
                            {customQuestionCount} câu
                          </span>
                        </div>
                        <input
                          type="number"
                          min={1}
                          max={allQuestions.length}
                          value={customQuestionCount}
                          onChange={(e) => {
                            const val = Math.max(1, Math.min(allQuestions.length, Number(e.target.value) || 1));
                            setCustomQuestionCount(val);
                          }}
                          className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 font-bold text-amber-300 focus:outline-none focus:border-amber-500"
                          placeholder="Nhập số lượng câu (VD: 15, 20...)"
                        />
                        <div className="flex flex-wrap items-center gap-1 mt-1.5">
                          {[5, 10, 15, 20, 25, 30].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setCustomQuestionCount(Math.min(num, allQuestions.length))}
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold border cursor-pointer ${
                                customQuestionCount === num
                                  ? 'bg-amber-600 text-stone-950 border-amber-500'
                                  : 'bg-stone-850 text-stone-300 border-stone-700 hover:bg-stone-800'
                              }`}
                            >
                              {num} câu
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => setCustomQuestionCount(allQuestions.length)}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-900 text-emerald-200 border border-emerald-700 hover:bg-emerald-800 cursor-pointer"
                          >
                            Tất cả ({allQuestions.length})
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-stone-300 mb-1">
                          Lấy câu hỏi từ Chuyên mục:
                        </label>
                        <select
                          value={selectedCategoryForRoom}
                          onChange={(e) => setSelectedCategoryForRoom(e.target.value)}
                          className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-stone-200 focus:outline-none focus:border-amber-500 font-medium"
                        >
                          <option value="all">Toàn bộ ngân hàng ({allQuestions.length} câu)</option>
                          {Array.from(new Set(allQuestions.map((q) => q.category))).map((c) => (
                            <option key={c} value={c}>
                              Mục: {c} ({allQuestions.filter((q) => q.category === c).length} câu)
                            </option>
                          ))}
                        </select>
                        <p className="text-[10px] text-stone-400 mt-1 italic">
                          * Hệ thống sẽ tự động rút ngẫu nhiên đúng {customQuestionCount} câu hỏi từ nguồn được chọn.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-bold text-stone-300">
                        Chọn câu hỏi thủ công (Đã chọn {selectedQuestionIds.length}/{allQuestions.length} câu)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedQuestionIds.length === allQuestions.length) {
                            setSelectedQuestionIds([]);
                          } else {
                            setSelectedQuestionIds(allQuestions.map((q) => q.id));
                          }
                        }}
                        className="text-amber-400 hover:underline cursor-pointer"
                      >
                        {selectedQuestionIds.length === allQuestions.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                      </button>
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1.5 bg-stone-900 p-2.5 rounded-xl border border-stone-800">
                      {allQuestions.map((q) => {
                        const isChecked = selectedQuestionIds.includes(q.id);
                        return (
                          <label
                            key={q.id}
                            className={`p-2 rounded-lg border flex items-center gap-2 cursor-pointer transition ${
                              isChecked
                                ? 'bg-amber-950/40 border-amber-600 text-stone-200'
                                : 'bg-stone-850 border-stone-800 text-stone-400 hover:bg-stone-800'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedQuestionIds((prev) => [...prev, q.id]);
                                } else {
                                  setSelectedQuestionIds((prev) => prev.filter((id) => id !== q.id));
                                }
                              }}
                              className="accent-amber-500 w-4 h-4 cursor-pointer"
                            />
                            <span className="text-[11px] truncate flex-1">
                              [{q.category}] {q.question}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Shuffle Toggles */}
                <div className="pt-2 border-t border-stone-800/80 space-y-2">
                  <label className="flex items-center gap-2 text-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoShuffleQuestions}
                      onChange={(e) => setAutoShuffleQuestions(e.target.checked)}
                      className="accent-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-bold text-amber-200">
                      Tự động đảo thứ tự câu hỏi (Shuffle Questions) — Chống nhìn bài
                    </span>
                  </label>

                  <label className="flex items-center gap-2 text-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoShuffleOptions}
                      onChange={(e) => setAutoShuffleOptions(e.target.checked)}
                      className="accent-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-bold text-amber-200">
                      Tự động đảo thứ tự đáp án A, B, C, D (Shuffle Options) — Bảo toàn 100% đáp án đúng
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleCreateSubmit}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-stone-950 font-bold text-xs uppercase cursor-pointer shadow-md"
              >
                Tạo Phòng Thi Ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
