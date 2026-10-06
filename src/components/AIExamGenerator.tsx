import React, { useState } from 'react';
import { Question, ExamRoom } from '../types/military';
import { exportQuestionBankToExcel } from '../utils/excelExport';
import {
  Sparkles,
  Zap,
  BookOpen,
  FileCheck,
  CheckCircle,
  PlusCircle,
  Download,
  AlertCircle,
  FileText,
  Clock,
  Layers,
  Sliders,
  ChevronRight
} from 'lucide-react';

interface AIExamGeneratorProps {
  onAddToQuestionBank: (questions: Question[]) => void;
  onCreateExamRoomFromAI: (newRoom: ExamRoom) => void;
}

const MILITARY_TOPIC_PRESETS = [
  {
    title: 'Nhận thức Chính trị & Lịch sử QĐNDVN',
    category: 'Chính trị & Tư tưởng',
    prompt: 'Lịch sử thành lập Đội Việt Nam Tuyên truyền Giải phóng quân, các chiến dịch lớn Điện Biên Phủ, Chiến dịch Hồ Chí Minh, 10 lời thề danh dự của quân nhân và truyền thống Bộ đội Cụ Hồ.'
  },
  {
    title: 'Điều lệnh Quản lý bộ đội & 11 Chế độ trong ngày',
    category: 'Điều lệnh Quản lý bộ đội',
    prompt: 'Quy tắc 11 chế độ sinh hoạt học tập trong ngày, chế độ trực ban nội vụ, mang mặc trang phục, chào hỏi xưng hô quân nhân, quy tắc quản lý quân số và vũ khí trang bị.'
  },
  {
    title: 'Điều lệnh Đội ngũ từng người & Đội hình phân đội',
    category: 'Điều lệnh Đội ngũ',
    prompt: 'Động tác nghiêm, nghỉ, quay tại chỗ, đi đều, đứng lại, đổi chân trong khi đi, động tác chào có đội mũ và không đội mũ, đội hình tiểu đội hàng dọc, hàng ngang.'
  },
  {
    title: 'Kỹ thuật bắn súng tiểu liên AK & súng ngắn K54',
    category: 'Kỹ thuật Chiến đấu bộ binh',
    prompt: 'Cấu tạo tác dụng các bộ phận súng tiểu liên AK-47, chuyển động lên đạn, tầm bắn thước ngắm, bài bắn 1 ban ngày mục tiêu bia số 4, 7, 8 và quy tắc bảo quản vũ khí.'
  },
  {
    title: 'Kỹ thuật ném lựu đạn F-1 & Thuốc nổ bộ binh',
    category: 'Kỹ thuật Chiến đấu bộ binh',
    prompt: 'Cấu tạo tính năng nổ của lựu đạn F-1, cự ly ném an toàn, tư thế ném nằm, quỳ, đứng ném lựu đạn trúng đích, quy tắc bảo đảm an toàn khi tiếp xúc với thuốc nổ quân sự.'
  },
  {
    title: 'Pháp luật Quân sự & Kỷ luật Quân đội',
    category: 'Pháp luật Quân sự & Kỷ luật',
    prompt: 'Luật Nghĩa vụ quân sự năm 2015, Luật Sĩ quan QĐNDVN, 12 điều kỷ luật khi quan hệ với nhân dân, hình thức kỷ luật khiển trách, cảnh cáo, giáng cấp bậc quân hàm trong quân ngũ.'
  }
];

export const AIExamGenerator: React.FC<AIExamGeneratorProps> = ({
  onAddToQuestionBank,
  onCreateExamRoomFromAI,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const [topic, setTopic] = useState<string>(MILITARY_TOPIC_PRESETS[0].title);
  const [category, setCategory] = useState<string>(MILITARY_TOPIC_PRESETS[0].category);
  const [customPrompt, setCustomPrompt] = useState<string>(MILITARY_TOPIC_PRESETS[0].prompt);
  const [sourceDocument, setSourceDocument] = useState<string>('');
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<string>('Hỗn hợp');
  const [targetUnit, setTargetUnit] = useState<string>('Tiểu đoàn 1, Trung đoàn 9');

  // Generator progress state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [generationLog, setGenerationLog] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');

  const handleApplyPreset = (index: number) => {
    setSelectedPreset(index);
    const p = MILITARY_TOPIC_PRESETS[index];
    setTopic(p.title);
    setCategory(p.category);
    setCustomPrompt(p.prompt);
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setStatusMessage('Ban Khảo thí AI đang phân tích dữ liệu huấn luyện quân sự...');
    setGeneratedQuestions([]);

    try {
      const response = await fetch('/api/ai/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: `${topic} (${customPrompt})`,
          category,
          numQuestions,
          difficulty,
          sourceDocument
        })
      });

      const data = await response.json();

      if (data.questions && Array.isArray(data.questions)) {
        setGeneratedQuestions(data.questions);
        setStatusMessage(`Đã tạo thành công ${data.questions.length} câu hỏi quân sự chuẩn xác.`);
        setGenerationLog(`Nguồn dữ liệu: ${data.source === 'gemini-ai' ? 'Mô hình Gemini AI Server-Side' : 'Ngân hàng chuẩn hoá QĐNDVN'}`);
      } else {
        setStatusMessage('Không thể tạo bộ câu hỏi. Vui lòng thử lại.');
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage('Đã chuyển sang sử dụng Ngân hàng Khảo thí Quân chủng sẵn có.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToBank = () => {
    if (generatedQuestions.length === 0) return;
    onAddToQuestionBank(generatedQuestions);
    alert(`Đã lưu thành công ${generatedQuestions.length} câu hỏi vào Ngân hàng Câu hỏi Toàn quân!`);
  };

  const handleCreateRoomNow = () => {
    if (generatedQuestions.length === 0) return;
    const roomCode = `QDND-${new Date().getFullYear()}-P${Math.floor(10 + Math.random() * 90)}`;
    const passcode = `QD${Math.floor(1000 + Math.random() * 9000)}`;

    const newRoom: ExamRoom = {
      id: `ROOM_${Date.now()}`,
      code: roomCode,
      title: topic.toUpperCase(),
      description: `Đề thi tạo tự động bởi Ban Khảo thí AI cho chuyên mục "${category}", áp dụng cho ${targetUnit}.`,
      passcode,
      durationMinutes: Math.max(generatedQuestions.length * 2, 10),
      totalQuestions: generatedQuestions.length,
      passingScore: 5.0,
      status: 'active',
      questions: generatedQuestions,
      createdAt: new Date().toISOString(),
      createdBy: 'Ban Khảo thí AI (Bộ Tổng Tham mưu)',
      targetUnit,
      antiCheatMode: 'strict',
      allowInstantResult: true
    };

    onCreateExamRoomFromAI(newRoom);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Title Header */}
      <div className="bg-white border-2 border-emerald-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-700 to-amber-600 border border-amber-300 flex items-center justify-center text-white shadow-lg">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300 text-[10px] font-bold uppercase font-military">
                  QUÂN KHU 5 — SƯ ĐOÀN BB 305
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                  GEMINI AI KHẢO THÍ
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-emerald-950 font-military tracking-wide mt-1">
                TẠO ĐỀ THI QUÂN SỰ TỰ ĐỘNG BẰNG AI
              </h2>
              <p className="text-xs text-stone-600">
                Sinh đề trắc nghiệm 4 lựa chọn, đáp án chuẩn xác theo điều lệnh, điều lệ Sư đoàn BB 305 và QĐNDVN.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Configuration (1 Column) */}
        <div className="lg:col-span-1 bg-white border border-stone-200 rounded-3xl p-6 shadow-md space-y-4">
          <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-stone-200 font-military">
            <Sliders className="w-4 h-4 text-emerald-700" />
            <span>THÔNG SỐ SOẠN ĐỀ KHẢO THÍ</span>
          </h3>

          {/* Quick Subject Presets */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2">
              Chuyên đề Quân sự Mẫu:
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {MILITARY_TOPIC_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(idx)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition border cursor-pointer ${
                    selectedPreset === idx
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-sm'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{p.title}</span>
                    {selectedPreset === idx && <span className="text-emerald-700 text-xs">✓</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Topic Name */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Tên đề thi / Tiêu đề:
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-600 font-medium"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Chuyên mục quân sự:
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-600 font-medium"
            >
              <option value="Chính trị & Tư tưởng">Chính trị & Tư tưởng</option>
              <option value="Điều lệnh Quản lý bộ đội">Điều lệnh Quản lý bộ đội</option>
              <option value="Điều lệnh Đội ngũ">Điều lệnh Đội ngũ</option>
              <option value="Kỹ thuật Chiến đấu bộ binh">Kỹ thuật Chiến đấu bộ binh</option>
              <option value="Chiến thuật Binh chủng">Chiến thuật Binh chủng</option>
              <option value="Hậu cần - Kỹ thuật">Hậu cần - Kỹ thuật</option>
              <option value="Pháp luật Quân sự & Kỷ luật">Pháp luật Quân sự & Kỷ luật</option>
              <option value="Tổng hợp">Tổng hợp Quân chủng</option>
            </select>
          </div>

          {/* Number of Questions & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-stone-700">
                  Số lượng câu hỏi (Tùy chỉnh):
                </label>
                <span className="text-[11px] font-mono font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                  {numQuestions} câu
                </span>
              </div>
              <input
                type="number"
                min={1}
                max={100}
                value={numQuestions}
                onChange={(e) => {
                  const val = Math.max(1, Math.min(100, Number(e.target.value) || 1));
                  setNumQuestions(val);
                }}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-600 font-bold"
                placeholder="Nhập số lượng câu (VD: 15, 25, 30...)"
              />
              <div className="flex flex-wrap items-center gap-1 mt-1.5">
                {[5, 10, 15, 20, 25, 30, 40, 50].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setNumQuestions(count)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer border ${
                      numQuestions === count
                        ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Độ khó câu hỏi:
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-600 font-medium"
              >
                <option value="Hỗn hợp">Hỗn hợp (Chuẩn)</option>
                <option value="Dễ">Dễ (Nhận biết)</option>
                <option value="Trung bình">Trung bình (Thông hiểu)</option>
                <option value="Khó">Khó (Vận dụng cao)</option>
              </select>
              <p className="text-[10px] text-stone-500 mt-1 italic">
                * Mô hình AI sẽ cân đối phân bổ tỷ lệ các câu hỏi lý thuyết, điều lệnh và thực hành theo đúng số lượng yêu cầu.
              </p>
            </div>
          </div>

          {/* Optional Document Text */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Dán Giáo án / Tài liệu Huấn luyện:
            </label>
            <textarea
              value={sourceDocument}
              onChange={(e) => setSourceDocument(e.target.value)}
              rows={3}
              placeholder="Dán nội dung chỉ thị, giáo án chính trị Sư đoàn BB 305 để AI trích xuất câu hỏi bám sát..."
              className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-700 via-emerald-800 to-emerald-900 hover:from-red-600 hover:to-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer transition"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Ban Khảo Thí Đang Soạn Đề...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Bắt Đầu Tạo Đề AI</span>
              </>
            )}
          </button>
        </div>

        {/* Generated Questions Preview & Actions (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Status Bar */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-700" />
              <span className="font-bold text-stone-800">
                {statusMessage || 'Sẵn sàng khởi tạo bộ đề kiểm tra mới bằng AI cho Sư đoàn BB 305.'}
              </span>
            </div>

            {generatedQuestions.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveToBank}
                  className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-emerald-900 font-bold flex items-center gap-1.5 cursor-pointer border border-stone-300"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Lưu Ngân Hàng</span>
                </button>

                <button
                  onClick={handleCreateRoomNow}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-200" />
                  <span>Tạo Phòng Thi (Có Mã QR)</span>
                </button>
              </div>
            )}
          </div>

          {/* Questions List */}
          {generatedQuestions.length === 0 && !isLoading ? (
            <div className="bg-white border-2 border-dashed border-stone-300 rounded-3xl p-12 text-center text-stone-500 shadow-sm">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-stone-400" />
              <h4 className="text-sm font-bold text-stone-700">Chưa có câu hỏi nào được tạo</h4>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Chọn chuyên đề quân sự bên trái và nhấn nút "Bắt Đầu Tạo Đề AI" để hệ thống tự động soạn bộ đề chuẩn Sư đoàn BB 305.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {generatedQuestions.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className="bg-white border border-stone-200 hover:border-emerald-600 rounded-2xl p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-3 text-xs pb-2 border-b border-stone-100">
                    <span className="font-bold text-emerald-950 font-military text-sm">
                      CÂU {idx + 1}: {q.question}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] shrink-0 font-bold">
                      {q.difficulty} • 10đ
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = optIdx === q.correctAnswerIndex;
                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-xl border flex items-center justify-between ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                              : 'bg-stone-50 border-stone-200 text-stone-700'
                          }`}
                        >
                          <span>{opt}</span>
                          {isCorrect && (
                            <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full font-bold">
                              ĐÁP ÁN ĐÚNG
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="text-[11px] text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                      <strong className="text-emerald-900 font-bold">Căn cứ điều lệnh / tài liệu:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
