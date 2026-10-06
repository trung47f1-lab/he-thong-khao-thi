import * as XLSX from 'xlsx';
import { ExamSubmission, ExamRoom, Question } from '../types/military';

/**
 * Xuất file Excel báo cáo kết quả tổng hợp đợt kiểm tra theo chuẩn Quân đội Nhân dân Việt Nam
 */
export function exportExamResultsToExcel(
  submissions: ExamSubmission[],
  exam: ExamRoom | null,
  unitName: string = 'TIỂU ĐOÀN 1 - TRUNG ĐOÀN 9 - SƯ ĐOÀN 304'
) {
  // 1. Chuẩn bị dữ liệu tiêu đề và thống kê
  const examTitle = exam ? exam.title : 'KIỂM TRA QUÂN SỰ';
  const examCode = exam ? exam.code : 'QDND-EXAM';
  const currentDate = new Date().toLocaleDateString('vi-VN');

  // Tính toán số liệu thống kê
  const total = submissions.length;
  const xuatSac = submissions.filter(s => s.classification === 'Xuất sắc').length;
  const gioi = submissions.filter(s => s.classification === 'Giỏi').length;
  const kha = submissions.filter(s => s.classification === 'Khá').length;
  const dat = submissions.filter(s => s.classification === 'Đạt').length;
  const khongDat = submissions.filter(s => s.classification === 'Không đạt').length;
  const passCount = total - khongDat;
  const passRate = total > 0 ? ((passCount / total) * 100).toFixed(1) : '0';

  // 2. Định dạng hàng dữ liệu chi tiết
  const rows = submissions.map((sub, index) => ({
    'STT': index + 1,
    'Họ và tên': sub.candidate.fullName,
    'Cấp bậc': sub.candidate.rank,
    'Chức vụ': sub.candidate.position,
    'Đơn vị trực thuộc': sub.candidate.unit,
    'Mã quân nhân': sub.candidate.militaryId || `QN-${index + 100}`,
    'Số câu đúng': `${sub.correctCount}/${sub.totalQuestions}`,
    'Điểm số (Thang 10)': sub.scaledScore.toFixed(1),
    'Xếp loại': sub.classification,
    'Số lần vi phạm': sub.violations.length,
    'Trạng thái': sub.status === 'disqualified' ? 'ĐÌNH CHỈ THI' : 'HỢP LỆ',
    'Thời gian làm bài': `${Math.floor(sub.timeSpentSeconds / 60)} phút ${sub.timeSpentSeconds % 60} giây`,
    'Thời điểm nộp': new Date(sub.submittedAt).toLocaleTimeString('vi-VN') + ' ' + new Date(sub.submittedAt).toLocaleDateString('vi-VN'),
    'Ghi chú': sub.violations.length > 0 ? `Có ${sub.violations.length} lỗi vi phạm giám sát` : 'Chấp hành nghiêm'
  }));

  // Tạo Worksheet và thiết lập tiêu đề quân đội
  const titleRows = [
    ['QUÂN KHU 5 — SƯ ĐOÀN BỘ BINH 305', '', '', '', 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM'],
    ['SƯ ĐOÀN BB 305', '', '', '', 'Độc lập - Tự do - Hạnh phúc'],
    ['BAN KHẢO THÍ & HUẤN LUYỆN', '', '', '', '------------------------'],
    [''],
    ['BẢNG TỔNG HỢP KẾT QUẢ KIỂM TRA TRỰC TUYẾN QUÂN SỰ'],
    [`Nội dung: ${examTitle.toUpperCase()} (Mã phòng: ${examCode})`],
    [`Ngày kiểm tra: ${currentDate} | Tổng số quân nhân tham gia: ${total} đồng chí | Tỷ lệ Đạt: ${passRate}%`],
    ['']
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(titleRows);

  // Thêm dữ liệu kết quả từ ô A9
  XLSX.utils.sheet_add_json(worksheet, rows, { origin: 'A9' });

  // Thêm phần tổng kết & chữ ký ở cuối bảng
  const endRowIndex = 9 + rows.length + 2;
  const footerRows = [
    [''],
    ['TỔNG KẾT XẾP LOẠI TOÀN ĐƠN VỊ:'],
    [`- Xuất sắc: ${xuatSac} đ/c (${total > 0 ? ((xuatSac / total) * 100).toFixed(1) : 0}%) | Giỏi: ${gioi} đ/c (${total > 0 ? ((gioi / total) * 100).toFixed(1) : 0}%) | Khá: ${kha} đ/c (${total > 0 ? ((kha / total) * 100).toFixed(1) : 0}%)`],
    [`- Đạt yêu cầu: ${dat} đ/c (${total > 0 ? ((dat / total) * 100).toFixed(1) : 0}%) | Không đạt: ${khongDat} đ/c (${total > 0 ? ((khongDat / total) * 100).toFixed(1) : 0}%)`],
    [''],
    ['NGƯỜI LẬP BIỂU', '', 'TRƯỞNG BAN GIÁM THỊ', '', 'THỦ TRƯỞNG ĐƠN VỊ PHÊ DUYỆT'],
    ['(Ký, ghi rõ họ tên)', '', '(Ký, ghi rõ họ tên)', '', '(Ký, đóng dấu)']
  ];

  XLSX.utils.sheet_add_aoa(worksheet, footerRows, { origin: `A${endRowIndex}` });

  // Tự động điều chỉnh độ rộng cột
  const colWidths = [
    { wch: 6 },  // STT
    { wch: 24 }, // Họ tên
    { wch: 14 }, // Cấp bậc
    { wch: 20 }, // Chức vụ
    { wch: 38 }, // Đơn vị
    { wch: 14 }, // Mã quân nhân
    { wch: 12 }, // Số câu đúng
    { wch: 18 }, // Điểm (10)
    { wch: 14 }, // Xếp loại
    { wch: 14 }, // Vi phạm
    { wch: 14 }, // Trạng thái
    { wch: 18 }, // Thời gian
    { wch: 22 }, // Thời điểm nộp
    { wch: 30 }  // Ghi chú
  ];
  worksheet['!cols'] = colWidths;

  // Tạo Workbook và xuất file
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Ket_Qua_Kiem_Tra');

  const fileName = `Bao_Cao_Ket_Qua_${examCode}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

/**
 * Xuất Ngân hàng câu hỏi ra file Excel mẫu (hỗ trợ xuất toàn bộ hoặc theo từng chuyên mục)
 */
export function exportQuestionBankToExcel(questions: Question[], categoryName?: string) {
  const rows = questions.map((q, idx) => ({
    'STT': idx + 1,
    'Mã câu hỏi': q.id,
    'Chuyên mục': q.category,
    'Nội dung câu hỏi': q.question,
    'Phương án A': q.options[0] || '',
    'Phương án B': q.options[1] || '',
    'Phương án C': q.options[2] || '',
    'Phương án D': q.options[3] || '',
    'Đáp án đúng (A/B/C/D)': ['A', 'B', 'C', 'D'][q.correctAnswerIndex] || 'A',
    'Giải thích đáp án': q.explanation,
    'Độ khó': q.difficulty,
    'Điểm': q.points
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  const sheetName = categoryName ? categoryName.slice(0, 30).replace(/[:\\\/\?\*\[\]]/g, '_') : 'Ngan_Hang_Cau_Hoi';
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 25 },
    { wch: 45 },
    { wch: 30 },
    { wch: 30 },
    { wch: 30 },
    { wch: 30 },
    { wch: 18 },
    { wch: 35 },
    { wch: 14 },
    { wch: 8 }
  ];

  const safeCategory = categoryName ? `_${categoryName.replace(/\s+/g, '_')}` : '';
  XLSX.writeFile(workbook, `Ngan_Hang_Cau_Hoi${safeCategory}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
