import mammoth from 'mammoth';
import { Question, QuestionCategory, QuestionDifficulty } from '../types/military';

/**
 * Phân loại tự động chuyên mục quân sự dựa vào nội dung câu hỏi
 */
export function autoClassifyMilitaryCategory(text: string): QuestionCategory {
  const lower = text.toLowerCase();

  if (
    lower.includes('súng') ||
    lower.includes('ak') ||
    lower.includes('k54') ||
    lower.includes('lựu đạn') ||
    lower.includes('bắn súng') ||
    lower.includes('thước ngắm') ||
    lower.includes('thuốc nổ') ||
    lower.includes('cự ly bắn') ||
    lower.includes('ngắm trúng') ||
    lower.includes('hỏa lực')
  ) {
    return 'Kỹ thuật Chiến đấu bộ binh';
  }

  if (
    lower.includes('11 chế độ') ||
    lower.includes('chế độ trong ngày') ||
    lower.includes('quản lý bộ đội') ||
    lower.includes('trực ban') ||
    lower.includes('điểm quân số') ||
    lower.includes('nội vụ') ||
    lower.includes('trang phục') ||
    lower.includes('quân tư trang')
  ) {
    return 'Điều lệnh Quản lý bộ đội';
  }

  if (
    lower.includes('đội ngũ') ||
    lower.includes('đi đều') ||
    lower.includes('đứng lại') ||
    lower.includes('đổi chân') ||
    lower.includes('nghiêm') ||
    lower.includes('chào') ||
    lower.includes('quay tại chỗ') ||
    lower.includes('hàng dọc') ||
    lower.includes('hàng ngang')
  ) {
    return 'Điều lệnh Đội ngũ';
  }

  if (
    lower.includes('đảng') ||
    lower.includes('bác hồ') ||
    lower.includes('chính trị') ||
    lower.includes('truyền thống') ||
    lower.includes('thành lập') ||
    lower.includes('việt nam tuyên truyền giải phóng quân') ||
    lower.includes('điện biên phủ') ||
    lower.includes('chiến dịch') ||
    lower.includes('lời kêu gọi')
  ) {
    return 'Chính trị & Tư tưởng';
  }

  if (
    lower.includes('luật') ||
    lower.includes('pháp luật') ||
    lower.includes('kỷ luật') ||
    lower.includes('lời thề') ||
    lower.includes('nghĩa vụ quân sự') ||
    lower.includes('sĩ quan') ||
    lower.includes('khiển trách') ||
    lower.includes('giáng cấp')
  ) {
    return 'Pháp luật Quân sự & Kỷ luật';
  }

  if (
    lower.includes('hậu cần') ||
    lower.includes('quân nhu') ||
    lower.includes('quân y') ||
    lower.includes('xăng dầu') ||
    lower.includes('kỹ thuật quân sự') ||
    lower.includes('bảo quản')
  ) {
    return 'Hậu cần - Kỹ thuật';
  }

  return 'Tổng hợp';
}

/**
 * Trích xuất text từ file Word (.docx) hoặc text (.txt)
 */
export async function extractTextFromWordFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'txt') {
    return await file.text();
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value || '';
  } catch (error: any) {
    console.warn('Mammoth extraction failed, falling back to text read:', error);
    try {
      return await file.text();
    } catch {
      throw new Error('Không thể đọc nội dung file Word. Vui lòng kiểm tra định dạng .docx!');
    }
  }
}

/**
 * Phân tích văn bản Word thành các câu hỏi, phân loại đáp án tự động
 */
export function parseWordTextToQuestions(rawText: string): Question[] {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const questions: Question[] = [];
  let currentQ: Partial<Question> | null = null;
  let currentOptions: string[] = [];
  let detectedCorrect = 0;

  // Regex nhận diện bắt đầu câu hỏi (Câu 1, Câu 1:, 1., Bài 1...)
  const questionStartRegex = /^(Câu\s*\d+[:.]?|\d+[\.:\)])\s*(.+)/i;
  // Regex nhận diện các phương án A., B., C., D. hoặc A), B), C), D)
  const optionRegex = /^([A-D])[\.:\)]\s*(.+)/i;
  // Regex nhận diện dòng đáp án (Đáp án: A, Đ/a: B, Key: C...)
  const answerRegex = /^(Đáp\s*án|Key|Đ\/A|Trả\s*lời)[:\s]*([A-D])/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Kiểm tra có phải bắt đầu câu hỏi mới không
    const qMatch = line.match(questionStartRegex);
    if (qMatch) {
      // Lưu câu hỏi trước đó nếu đủ thông tin
      if (currentQ && currentQ.question && currentOptions.length >= 2) {
        // Hoàn thiện 4 options nếu thiếu
        while (currentOptions.length < 4) {
          const letter = ['A', 'B', 'C', 'D'][currentOptions.length];
          currentOptions.push(`${letter}. Ý kiến khác`);
        }

        const category = autoClassifyMilitaryCategory(currentQ.question);
        questions.push({
          id: `Q_WORD_${Date.now()}_${questions.length + 1}`,
          question: currentQ.question,
          options: currentOptions.slice(0, 4),
          correctAnswerIndex: detectedCorrect,
          explanation: currentQ.explanation || `Căn cứ theo giáo trình và tài liệu huấn luyện quân sự.`,
          category,
          difficulty: 'Trung bình',
          points: 10
        });
      }

      // Khởi tạo câu hỏi mới
      currentQ = {
        question: qMatch[2] || line,
        explanation: ''
      };
      currentOptions = [];
      detectedCorrect = 0;
      continue;
    }

    // Kiểm tra phương án lựa chọn A, B, C, D
    const optMatch = line.match(optionRegex);
    if (optMatch && currentQ) {
      const letter = optMatch[1].toUpperCase();
      const text = optMatch[2];
      const optIndex = letter.charCodeAt(0) - 65; // A -> 0, B -> 1, C -> 2, D -> 3

      // Kiểm tra xem phương án có đánh dấu đáp án đúng không (ví dụ: có dấu * ở đầu hoặc cuối)
      if (line.includes('*') || line.toLowerCase().includes('(đúng)')) {
        detectedCorrect = optIndex;
      }

      currentOptions.push(`${letter}. ${text.replace(/\*/g, '').replace(/\(đúng\)/gi, '').trim()}`);
      continue;
    }

    // Kiểm tra dòng đáp án đúng riêng biệt
    const ansMatch = line.match(answerRegex);
    if (ansMatch && currentQ) {
      const letter = ansMatch[2].toUpperCase();
      detectedCorrect = letter.charCodeAt(0) - 65;
      continue;
    }

    // Nếu không khớp các mẫu trên mà đang trong câu hỏi, có thể là lời giải thích hoặc phần nối tiếp
    if (currentQ) {
      if (currentOptions.length === 0) {
        // Nối tiếp nội dung câu hỏi nhiều dòng
        currentQ.question = (currentQ.question ? currentQ.question + ' ' : '') + line;
      } else {
        // Nối tiếp giải thích
        currentQ.explanation = (currentQ.explanation ? currentQ.explanation + ' ' : '') + line;
      }
    }
  }

  // Đẩy câu hỏi cuối cùng vào danh sách
  if (currentQ && currentQ.question && currentOptions.length >= 2) {
    while (currentOptions.length < 4) {
      const letter = ['A', 'B', 'C', 'D'][currentOptions.length];
      currentOptions.push(`${letter}. Phương án bổ sung`);
    }

    const category = autoClassifyMilitaryCategory(currentQ.question);
    questions.push({
      id: `Q_WORD_${Date.now()}_${questions.length + 1}`,
      question: currentQ.question,
      options: currentOptions.slice(0, 4),
      correctAnswerIndex: detectedCorrect,
      explanation: currentQ.explanation || 'Theo quy định huấn luyện của Sư đoàn BB 305.',
      category,
      difficulty: 'Trung bình',
      points: 10
    });
  }

  return questions;
}
