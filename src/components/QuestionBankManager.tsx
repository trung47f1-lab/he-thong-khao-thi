import React, { useState } from 'react';
import { Question, QuestionCategory, QuestionDifficulty } from '../types/military';
import { exportQuestionBankToExcel } from '../utils/excelExport';
import { extractTextFromWordFile, parseWordTextToQuestions } from '../utils/wordParser';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit3,
  Download,
  Upload,
  FileText,
  FileSpreadsheet,
  CheckCircle,
  X,
  AlertTriangle,
  Sparkles,
  Layers,
  ArrowRight,
  Folder,
  FolderPlus,
  FolderCheck,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  ListFilter
} from 'lucide-react';

interface QuestionBankManagerProps {
  questions: Question[];
  onAddQuestion: (newQ: Question) => void;
  onUpdateQuestion: (updatedQ: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onBatchImport: (importedQuestions: Question[]) => void;
}

export const QuestionBankManager: React.FC<QuestionBankManagerProps> = ({
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onBatchImport,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'categorized' | 'flat'>('categorized');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // Custom Categories State (mục phân loại do người dùng tạo)
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('QDND_CUSTOM_CATEGORIES');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isWordUploadModalOpen, setIsWordUploadModalOpen] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Word File Upload State
  const [isParsingWord, setIsParsingWord] = useState<boolean>(false);
  const [wordParsedQuestions, setWordParsedQuestions] = useState<Question[]>([]);
  const [wordUploadError, setWordUploadError] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  // Form Fields for Manual Add/Edit
  const [formData, setFormData] = useState<Partial<Question>>({
    question: '',
    options: ['', '', '', ''],
    correctAnswerIndex: 0,
    explanation: '',
    category: 'Chính trị & Tư tưởng',
    difficulty: 'Trung bình',
    points: 10
  });

  const toggleCategoryCollapse = (cat: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  // Filtered Questions
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.explanation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || q.category === selectedCategory;
    const matchesDiff = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
    return matchesSearch && matchesCat && matchesDiff;
  });

  const handleOpenAddModal = (presetCategory?: string) => {
    setEditingQuestion(null);
    setFormData({
      question: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
      explanation: '',
      category: (presetCategory as QuestionCategory) || (selectedCategory !== 'all' ? selectedCategory as QuestionCategory : 'Chính trị & Tư tưởng'),
      difficulty: 'Trung bình',
      points: 10
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (q: Question) => {
    setEditingQuestion(q);
    setFormData({ ...q });
    setIsModalOpen(true);
  };

  const handleSaveQuestion = () => {
    if (!formData.question?.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi!');
      return;
    }

    if (!formData.options || formData.options.some((opt) => !opt.trim())) {
      alert('Vui lòng nhập đầy đủ 4 phương án lựa chọn A, B, C, D!');
      return;
    }

    const assignedCategory = formData.category?.trim() || 'Chính trị & Tư tưởng';
    if (!categories.includes(assignedCategory)) {
      const updated = [...customCategories, assignedCategory];
      setCustomCategories(updated);
      try {
        localStorage.setItem('QDND_CUSTOM_CATEGORIES', JSON.stringify(updated));
      } catch {}
    }

    if (editingQuestion) {
      onUpdateQuestion({
        ...editingQuestion,
        ...(formData as Question),
        category: assignedCategory as QuestionCategory
      });
    } else {
      const newQ: Question = {
        id: `Q_CUSTOM_${Date.now()}`,
        question: formData.question.trim(),
        options: formData.options,
        correctAnswerIndex: formData.correctAnswerIndex ?? 0,
        explanation: formData.explanation || 'Theo quy chuẩn huấn luyện của Sư đoàn BB 305.',
        category: assignedCategory as QuestionCategory,
        difficulty: (formData.difficulty as QuestionDifficulty) || 'Trung bình',
        points: formData.points || 10
      };
      onAddQuestion(newQ);
    }

    setIsModalOpen(false);
  };

  // Word Document File Handler
  const handleWordFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setWordUploadError('');
    setIsParsingWord(true);
    setWordParsedQuestions([]);

    try {
      // 1. Trích xuất text từ file Word (.docx)
      const rawText = await extractTextFromWordFile(file);

      if (!rawText.trim()) {
        throw new Error('Nội dung file Word không có văn bản hoặc không đọc được!');
      }

      // 2. Thử gọi AI Backend để phân tích và phân loại tự động
      let parsed: Question[] = [];
      try {
        const response = await fetch('/api/ai/parse-word-exam', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawText })
        });
        const data = await response.json();
        if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
          parsed = data.questions;
        }
      } catch (aiErr) {
        console.warn('AI Word parse failed, falling back to local heuristic parser', aiErr);
      }

      // 3. Nếu AI không có sẵn hoặc offline, dùng bộ phân tích Regex & phân loại tự động
      if (parsed.length === 0) {
        parsed = parseWordTextToQuestions(rawText);
      }

      if (parsed.length === 0) {
        setWordUploadError(
          'Không tìm thấy câu hỏi trắc nghiệm nào trong file Word. Định dạng mẫu chuẩn: "Câu 1: ... A. ... B. ... C. ... D. ... Đáp án: A"'
        );
      } else {
        setWordParsedQuestions(parsed);
      }
    } catch (err: any) {
      setWordUploadError(`Lỗi khi xử lý file Word: ${err.message}`);
    } finally {
      setIsParsingWord(false);
    }
  };

  const handleConfirmImportWordQuestions = () => {
    if (wordParsedQuestions.length === 0) return;
    onBatchImport(wordParsedQuestions);
    setIsWordUploadModalOpen(false);
    alert(`Đã nạp thành công ${wordParsedQuestions.length} câu hỏi từ file Word vào Ngân hàng Sư đoàn BB 305!`);
    setWordParsedQuestions([]);
  };

  const handleCreateCategory = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) {
      alert('Mục phân loại này đã tồn tại!');
      return;
    }
    const updated = [...customCategories, trimmed];
    setCustomCategories(updated);
    try {
      localStorage.setItem('QDND_CUSTOM_CATEGORIES', JSON.stringify(updated));
    } catch {}
    setSelectedCategory(trimmed);
    setIsAddCategoryModalOpen(false);
    setNewCategoryName('');
  };

  const categories = Array.from(
    new Set([
      'Chính trị & Tư tưởng',
      'Điều lệnh Quản lý bộ đội',
      'Điều lệnh Đội ngũ',
      'Kỹ thuật Chiến đấu bộ binh',
      'Chiến thuật Binh chủng',
      'Hậu cần - Kỹ thuật',
      'Pháp luật Quân sự & Kỷ luật',
      'Tổng hợp',
      ...customCategories,
      ...questions.map((q) => q.category).filter(Boolean)
    ])
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white border-2 border-emerald-800 rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300 text-[10px] font-bold uppercase font-military">
              QUÂN KHU 5 — SƯ ĐOÀN BB 305
            </span>
            <span className="text-xs text-stone-500 font-semibold">Ban Khảo Thí & Huấn Luyện</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-emerald-950 font-military tracking-wide mt-1">
            NGÂN HÀNG CÂU HỎI THEO TỪNG MỤC PHÂN LOẠI
          </h2>
          <p className="text-xs text-stone-600">
            Lưu trữ và phân loại câu hỏi theo từng chuyên mục quân sự, hỗ trợ nạp đề từ file Word và xuất báo cáo Excel theo từng mục.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Word Upload Button */}
          <button
            onClick={() => {
              setWordParsedQuestions([]);
              setWordUploadError('');
              setUploadedFileName('');
              setIsWordUploadModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition"
          >
            <FileText className="w-4 h-4 text-blue-200" />
            <span>Tải Lên File Word (.docx)</span>
          </button>

          {/* Export Excel */}
          <button
            onClick={() => exportQuestionBankToExcel(questions)}
            className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Xuất Toàn Bộ Excel</span>
          </button>

          {/* Add Question Manually */}
          <button
            onClick={() => handleOpenAddModal()}
            className="px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Câu Hỏi Mới</span>
          </button>
        </div>
      </div>

      {/* Category Folders Overview Cards */}
      <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <FolderCheck className="w-5 h-5 text-emerald-700" />
            <h3 className="text-xs font-bold text-emerald-950 uppercase font-military tracking-wide">
              DANH MỤC PHÂN LOẠI CÂU HỎI QUÂN SỰ ({categories.length} CHUYÊN ĐỀ — {questions.length} CÂU)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddCategoryModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              title="Tạo thêm chuyên mục phân loại câu hỏi mới"
            >
              <FolderPlus className="w-3.5 h-3.5 text-emerald-700" />
              <span>+ Tạo Mục Mới</span>
            </button>

            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-300 text-xs">
              <button
                onClick={() => setViewMode('categorized')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'categorized'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Theo Từng Mục</span>
              </button>
              <button
                onClick={() => setViewMode('flat')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'flat'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Danh Sách Chung</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Category Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {categories.map((cat) => {
            const count = questions.filter((q) => q.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(selectedCategory === cat ? 'all' : cat);
                }}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-600 shadow-sm ring-2 ring-emerald-500/20'
                    : 'bg-stone-50 hover:bg-stone-100 border-stone-200'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-stone-800 font-bold text-xs truncate">
                    <Folder className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-700' : 'text-stone-500'}`} />
                    <span className="truncate">{cat}</span>
                  </div>
                  <span className="text-[10px] text-stone-500 mt-0.5 block">
                    {count} câu hỏi đã lưu
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold shrink-0 ${
                  count > 0 ? 'bg-emerald-100 text-emerald-900' : 'bg-stone-200 text-stone-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[240px] relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm nội dung câu hỏi, điều lệnh hoặc căn cứ tài liệu..."
            className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-4 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 font-medium"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-emerald-600 font-bold"
          >
            <option value="all">Tất cả chuyên mục ({questions.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                Mục: {c} ({questions.filter((q) => q.category === c).length})
              </option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-emerald-600 font-medium"
          >
            <option value="all">Mọi độ khó</option>
            <option value="Dễ">Dễ</option>
            <option value="Trung bình">Trung bình</option>
            <option value="Khó">Khó</option>
            <option value="Rất khó">Rất khó</option>
          </select>
        </div>
      </div>

      {/* Render Questions (Grouped by Category or Flat) */}
      {viewMode === 'categorized' ? (
        <div className="space-y-6">
          {categories
            .filter((cat) => selectedCategory === 'all' || selectedCategory === cat)
            .map((cat) => {
              const catQuestions = filteredQuestions.filter((q) => q.category === cat);
              const isCollapsed = collapsedCategories[cat];

              if (catQuestions.length === 0 && searchTerm) return null;

              return (
                <div
                  key={cat}
                  className="bg-white border-2 border-stone-200 hover:border-emerald-700/60 rounded-3xl p-5 shadow-md transition"
                >
                  {/* Category Folder Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center justify-center font-bold">
                        <Folder className="w-5 h-5 text-emerald-800" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-emerald-950 font-military uppercase">
                          MỤC: {cat}
                        </h3>
                        <span className="text-[11px] text-stone-500 font-medium">
                          Lưu trữ <strong>{catQuestions.length}</strong> câu hỏi trắc nghiệm
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => exportQuestionBankToExcel(catQuestions, cat)}
                        disabled={catQuestions.length === 0}
                        className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 border border-stone-300 text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-30"
                        title="Xuất file Excel cho chuyên mục này"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Xuất Excel Mục Này</span>
                      </button>

                      <button
                        onClick={() => handleOpenAddModal(cat)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm Câu Vào Mục Này</span>
                      </button>

                      <button
                        onClick={() => toggleCategoryCollapse(cat)}
                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 cursor-pointer"
                        title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
                      >
                        {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Questions in Category */}
                  {!isCollapsed && (
                    <div className="mt-4 space-y-3">
                      {catQuestions.length === 0 ? (
                        <div className="p-6 text-center text-xs text-stone-500 bg-stone-50 rounded-2xl border border-dashed border-stone-300">
                          Chưa có câu hỏi nào trong mục này. Bấm "Thêm Câu Vào Mục Này" hoặc Tải file Word để nạp câu hỏi.
                        </div>
                      ) : (
                        catQuestions.map((q, idx) => (
                          <div
                            key={q.id}
                            className="bg-stone-50/70 border border-stone-200 hover:border-emerald-600 rounded-2xl p-4 transition"
                          >
                            <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-stone-200">
                              <div className="flex items-start gap-2.5">
                                <span className="w-6 h-6 rounded-md bg-emerald-800 text-white font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <div>
                                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 leading-snug">
                                    {q.question}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1 text-[10px] text-stone-500">
                                    <span>Độ khó: <strong className="text-stone-800">{q.difficulty}</strong></span>
                                    <span>•</span>
                                    <span>Điểm: <strong>{q.points}đ</strong></span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => handleOpenEditModal(q)}
                                  className="p-1.5 rounded-lg bg-white hover:bg-stone-200 text-stone-700 border border-stone-200 cursor-pointer"
                                  title="Chỉnh sửa câu hỏi"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm('Đồng chí có chắc muốn xóa câu hỏi này?')) {
                                      onDeleteQuestion(q.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg bg-white hover:bg-red-50 text-stone-500 hover:text-red-700 border border-stone-200 cursor-pointer"
                                  title="Xóa câu hỏi"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Options */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2.5 text-xs">
                              {q.options.map((opt, optIdx) => {
                                const isCorrect = optIdx === q.correctAnswerIndex;
                                return (
                                  <div
                                    key={optIdx}
                                    className={`p-2 rounded-xl border flex items-center justify-between ${
                                      isCorrect
                                        ? 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold'
                                        : 'bg-white border-stone-200 text-stone-700'
                                    }`}
                                  >
                                    <span>{opt}</span>
                                    {isCorrect && (
                                      <span className="text-[9px] bg-emerald-700 text-white px-2 py-0.5 rounded-full font-bold">
                                        ĐÁP ÁN ĐÚNG
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {q.explanation && (
                              <div className="text-[11px] text-stone-600 bg-white p-2 rounded-xl border border-stone-200">
                                <strong className="text-emerald-900">Căn cứ:</strong> {q.explanation}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      ) : (
        /* Flat Questions View */
        <div className="space-y-3">
          {filteredQuestions.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center text-stone-500 shadow-sm">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-stone-400" />
              <p className="text-sm font-bold text-stone-700">Không tìm thấy câu hỏi nào phù hợp với bộ lọc</p>
            </div>
          ) : (
            filteredQuestions.map((q, index) => (
              <div
                key={q.id}
                className="bg-white border border-stone-200 hover:border-emerald-600 rounded-2xl p-5 transition shadow-sm"
              >
                <div className="flex items-start justify-between gap-4 pb-3 border-b border-stone-100">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 leading-snug">{q.question}</h3>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-stone-500">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                          {q.category}
                        </span>
                        <span>•</span>
                        <span>Độ khó: <strong>{q.difficulty}</strong></span>
                        <span>•</span>
                        <span>Điểm: <strong>{q.points}đ</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleOpenEditModal(q)}
                      className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer"
                      title="Chỉnh sửa câu hỏi"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Đồng chí có chắc chắn muốn xóa câu hỏi này khỏi ngân hàng không?')) {
                          onDeleteQuestion(q.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-stone-100 hover:bg-red-50 text-stone-500 hover:text-red-700 transition cursor-pointer"
                      title="Xóa câu hỏi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-3 text-xs">
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

                {/* Explanation */}
                {q.explanation && (
                  <div className="text-[11px] text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                    <span className="font-bold text-emerald-900">Căn cứ quy định:</span> {q.explanation}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL: Upload Word Document with Automatic Question/Answer Parser */}
      {isWordUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-blue-600 rounded-3xl max-w-3xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-700" />
                <h3 className="text-base font-black text-blue-950 font-military uppercase">
                  TẢI LÊN FILE WORD (.DOCX / .DOC) — TỰ ĐỘNG PHÂN LOẠI
                </h3>
              </div>
              <button
                onClick={() => setIsWordUploadModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 space-y-4 text-xs">
              {/* File Dropzone */}
              <div className="border-2 border-dashed border-blue-300 rounded-2xl p-6 text-center bg-blue-50/50 hover:bg-blue-50 transition">
                <Upload className="w-10 h-10 text-blue-600 mx-auto mb-2" />
                <label className="cursor-pointer">
                  <span className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs inline-block shadow">
                    Chọn File Word Từ Máy Tính (.docx, .doc, .txt)
                  </span>
                  <input
                    type="file"
                    accept=".docx,.doc,.txt"
                    onChange={handleWordFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-stone-500 mt-2">
                  Hệ thống tự động đọc văn bản Word, nhận diện câu hỏi 1, 2, 3... các phương án A, B, C, D, đáp án đúng và tự phân loại chuyên mục.
                </p>
                {uploadedFileName && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 font-bold text-xs">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Đã chọn: {uploadedFileName}</span>
                  </div>
                )}
              </div>

              {isParsingWord && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-center flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-amber-700 border-t-transparent rounded-full animate-spin"></span>
                  <span className="font-bold">Đang phân tích cấu trúc tài liệu Word và phân loại đáp án tự động...</span>
                </div>
              )}

              {wordUploadError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{wordUploadError}</span>
                </div>
              )}

              {/* Preview of Parsed Questions */}
              {wordParsedQuestions.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                    <span className="font-black text-emerald-900 font-military text-sm">
                      KẾT QUẢ BÓC TÁCH: ĐÃ TÌM THẤY {wordParsedQuestions.length} CÂU HỎI
                    </span>
                    <span className="text-[11px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                      Tự động nhận diện thành công
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                    {wordParsedQuestions.map((q, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-stone-900">
                            Câu {idx + 1}: {q.question}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-bold shrink-0">
                            {q.category}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                          {q.options.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className={`p-1.5 rounded border ${
                                oIdx === q.correctAnswerIndex
                                  ? 'bg-emerald-100 border-emerald-400 font-bold text-emerald-950'
                                  : 'bg-white border-stone-200 text-stone-600'
                              }`}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
              <button
                onClick={() => setIsWordUploadModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer"
              >
                Hủy Bỏ
              </button>

              <button
                onClick={handleConfirmImportWordQuestions}
                disabled={wordParsedQuestions.length === 0}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-700 to-emerald-700 hover:from-blue-600 hover:to-emerald-600 text-white font-bold text-xs uppercase cursor-pointer shadow-md disabled:opacity-40"
              >
                Nhập {wordParsedQuestions.length} Câu Vào Ngân Hàng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add / Edit Question Manually */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-emerald-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-black text-emerald-950 font-military uppercase">
                {editingQuestion ? 'CHỈNH SỬA CÂU HỎI QUÂN SỰ' : 'THÊM CÂU HỎI MỚI VÀO NGÂN HÀNG'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 my-4 text-xs">
              <div>
                <label className="block font-bold text-stone-800 mb-1">Nội dung câu hỏi *</label>
                <textarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  rows={3}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-emerald-600"
                  placeholder="Nhập nội dung câu hỏi trắc nghiệm quân sự..."
                />
              </div>

              {/* 4 Options */}
              <div className="space-y-2">
                <label className="block font-bold text-stone-800">
                  4 Phương án lựa chọn (Chọn nút tròn bên cạnh để đánh dấu đáp án đúng) *
                </label>
                {['A', 'B', 'C', 'D'].map((letter, optIdx) => (
                  <div key={letter} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct-option"
                      checked={formData.correctAnswerIndex === optIdx}
                      onChange={() => setFormData({ ...formData, correctAnswerIndex: optIdx })}
                      className="accent-emerald-700 w-4 h-4 cursor-pointer"
                    />
                    <span className="w-6 font-bold text-emerald-900">{letter}.</span>
                    <input
                      type="text"
                      value={formData.options ? formData.options[optIdx] : ''}
                      onChange={(e) => {
                        const newOpts = [...(formData.options || ['', '', '', ''])];
                        newOpts[optIdx] = e.target.value;
                        setFormData({ ...formData, options: newOpts });
                      }}
                      placeholder={`Nội dung phương án ${letter}...`}
                      className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-stone-800">Chuyên mục / Mục *</label>
                    <span className="text-[10px] text-stone-500 italic">Chọn hoặc nhập</span>
                  </div>
                  <input
                    type="text"
                    list="category-options-list"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as QuestionCategory })}
                    placeholder="Chọn hoặc nhập tên mục..."
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2 text-stone-900 focus:outline-none focus:border-emerald-600 font-semibold"
                  />
                  <datalist id="category-options-list">
                    {categories.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">Độ khó</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as QuestionDifficulty })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2 text-stone-900 focus:outline-none focus:border-emerald-600 font-medium"
                  >
                    <option value="Dễ">Dễ</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Khó">Khó</option>
                    <option value="Rất khó">Rất khó</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">Điểm chuẩn</label>
                  <input
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2 text-stone-900 focus:outline-none focus:border-emerald-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">Giải thích & Căn cứ điều lệnh</label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  rows={2}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-emerald-600"
                  placeholder="Trích dẫn điều lệnh, giáo trình Sư đoàn BB 305..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleSaveQuestion}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-bold text-xs uppercase cursor-pointer shadow-md"
              >
                {editingQuestion ? 'Cập Nhật Câu Hỏi' : 'Lưu Vào Ngân Hàng'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Thêm Mục Phân Loại Mới */}
      {isAddCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-emerald-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-black text-emerald-950 font-military uppercase">
                  TẠO MỤC PHÂN LOẠI CÂU HỎI MỚI
                </h3>
              </div>
              <button
                onClick={() => setIsAddCategoryModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <p className="text-stone-600">
                Tạo thư mục/chuyên mục mới để phân loại ngân hàng câu hỏi (ví dụ: <em>Kỹ thuật Tác chiến Điện tử</em>, <em>Bắn súng K54 nâng cao</em>, <em>Lịch sử Đảng & Quân khu 5</em>):
              </p>
              <div>
                <label className="block font-bold text-stone-800 mb-1">Tên mục phân loại mới *</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nhập tên chuyên mục mới..."
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900 font-bold focus:outline-none focus:border-emerald-600"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
              <button
                onClick={() => setIsAddCategoryModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => handleCreateCategory(newCategoryName)}
                disabled={!newCategoryName.trim()}
                className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs uppercase cursor-pointer shadow-md disabled:opacity-40"
              >
                Tạo Mục Ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
