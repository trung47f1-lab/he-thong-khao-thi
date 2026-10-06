import { Question, ExamRoom, MilitaryUser, ExamSubmission } from '../types/military';

export const MILITARY_RANKS = [
  'Binh nhì',
  'Binh nhất',
  'Hạ sĩ',
  'Trung sĩ',
  'Thượng sĩ',
  'Thiếu úy QNCN',
  'Trung úy QNCN',
  'Thượng úy QNCN',
  'Đại úy QNCN',
  'Thiếu tá QNCN',
  'Trung tá QNCN',
  'Thượng tá QNCN',
  'Thiếu úy',
  'Trung úy',
  'Thượng úy',
  'Đại úy',
  'Thiếu tá',
  'Trung tá',
  'Thượng tá',
  'Đại tá',
  'Thiếu tướng',
  'Trung tướng',
  'Thượng tướng',
  'Đại tướng'
];

export const MILITARY_POSITIONS = [
  'Chiến sĩ',
  'Xạ thủ B41',
  'Khẩu đội trưởng',
  'Tiểu đội trưởng',
  'Trung đội phó',
  'Trung đội trưởng',
  'Phó Đại đội trưởng Quân sự',
  'Đại đội phó',
  'Đại đội trưởng',
  'Chính trị viên phó Đại đội',
  'Chính trị viên Đại đội',
  'Trợ lý Quân huấn',
  'Trợ lý Tác huấn',
  'Trợ lý Chính trị',
  'Trợ lý Hậu cần - Kỹ thuật',
  'Tiểu đoàn phó',
  'Tiểu đoàn trưởng',
  'Chính trị viên Tiểu đoàn',
  'Trung đoàn phó - TMT',
  'Trung đoàn trưởng',
  'Chính ủy Trung đoàn',
  'Cán bộ Khảo thí',
  'Giám thị phòng thi'
];

export const SAMPLE_UNITS = [
  'Tiểu đội 1, Trung đội 1, Đại đội 1, Tiểu đoàn 1, Sư đoàn BB 305',
  'Tiểu đội 2, Trung đội 1, Đại đội 1, Tiểu đoàn 1, Sư đoàn BB 305',
  'Tiểu đội 3, Trung đội 2, Đại đội 1, Tiểu đoàn 1, Sư đoàn BB 305',
  'Trung đội Cối 60, Đại đội 1, Tiểu đoàn 1, Sư đoàn BB 305',
  'Đại đội 2 (Bộ binh), Tiểu đoàn 1, Sư đoàn BB 305, Quân khu 5',
  'Đại đội 3 (Bộ binh), Tiểu đoàn 1, Sư đoàn BB 305, Quân khu 5',
  'Đại đội 4 (Hỏa lực cơ giới), Tiểu đoàn 1, Sư đoàn BB 305',
  'Tiểu đoàn Bộ binh 2, Sư đoàn BB 305, Quân khu 5',
  'Ban Tác huấn, Phòng Tham mưu, Sư đoàn BB 305',
  'Ban Tuyên huấn, Phòng Chính trị, Sư đoàn BB 305',
  'Ban Quân nhu, Phòng Hậu cần - Kỹ thuật, Sư đoàn BB 305'
];

export const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'Q_MIL_001',
    question: 'Ngày truyền thống của Quân đội Nhân dân Việt Nam là ngày nào?',
    options: [
      'A. Ngày 22 tháng 12 năm 1944',
      'B. Ngày 19 tháng 8 năm 1945',
      'C. Ngày 02 tháng 9 năm 1945',
      'D. Ngày 30 tháng 4 năm 1975'
    ],
    correctAnswerIndex: 0,
    explanation: 'Ngày 22/12/1944, Đội Việt Nam Tuyên truyền Giải phóng quân được thành lập theo Chỉ thị của Chủ tịch Hồ Chí Minh, là tiền thân của Quân đội Nhân dân Việt Nam ngày nay.',
    category: 'Chính trị & Tư tưởng',
    difficulty: 'Dễ',
    points: 10
  },
  {
    id: 'Q_MIL_002',
    question: 'Ai là người chỉ huy đầu tiên của Đội Việt Nam Tuyên truyền Giải phóng quân?',
    options: [
      'A. Đồng chí Hoàng Văn Thái',
      'B. Đồng chí Võ Nguyên Giáp',
      'C. Đồng chí Nguyễn Chí Thanh',
      'D. Đồng chí Văn Tiến Dũng'
    ],
    correctAnswerIndex: 1,
    explanation: 'Đồng chí Võ Nguyên Giáp được Chủ tịch Hồ Chí Minh ủy nhiệm tổ chức và trực tiếp chỉ huy Đội Việt Nam Tuyên truyền Giải phóng quân khi mới thành lập.',
    category: 'Chính trị & Tư tưởng',
    difficulty: 'Dễ',
    points: 10
  },
  {
    id: 'Q_MIL_003',
    question: 'Theo Điều lệnh Quản lý bộ đội, một ngày trong quân đội có bao nhiêu chế độ học tập, sinh hoạt, công tác bắt buộc?',
    options: [
      'A. 10 chế độ trong ngày',
      'B. 11 chế độ trong ngày',
      'C. 12 chế độ trong ngày',
      'D. 8 chế độ trong ngày'
    ],
    correctAnswerIndex: 1,
    explanation: 'Điều lệnh quy định rõ 11 chế độ làm việc trong ngày đối với bộ đội (Treo quốc kỳ; Thức dậy; Thể dục; Kiểm tra sáng; Học tập; Ăn uống; Bảo quản vũ khí khí tài; Thể thao/Tăng gia; Đọc báo/Nghe tin; Điểm danh/Điểm quân số; Ngủ nghỉ).',
    category: 'Điều lệnh Quản lý bộ đội',
    difficulty: 'Trung bình',
    points: 10
  },
  {
    id: 'Q_MIL_004',
    question: 'Tầm bắn thẳng của súng tiểu liên AK-47 đối với mục tiêu người nằm (mục tiêu cao 0,5m) là bao nhiêu mét?',
    options: [
      'A. 250 mét',
      'B. 350 mét',
      'C. 500 mét',
      'D. 800 mét'
    ],
    correctAnswerIndex: 1,
    explanation: 'Sách quy tắc bắn súng bộ binh quy định: Tầm bắn thẳng của súng tiểu liên AK đối với mục tiêu người nằm (cao 0,5m) là 350 mét; đối với mục tiêu người chạy (cao 1,5m) là 525 mét.',
    category: 'Kỹ thuật Chiến đấu bộ binh',
    difficulty: 'Khó',
    points: 10
  },
  {
    id: 'Q_MIL_005',
    question: 'Cự ly ném lựu đạn xa trúng đích đối với lựu đạn F-1 của chiến sĩ bộ binh tiêu chuẩn Đạt - Khá - Giỏi lần lượt là?',
    options: [
      'A. Đạt 25m, Khá 30m, Giỏi 35m trở lên',
      'B. Đạt 30m, Khá 35m, Giỏi 40m trở lên',
      'C. Đạt 35m, Khá 40m, Giỏi 45m trở lên',
      'D. Đạt 20m, Khá 25m, Giỏi 30m trở lên'
    ],
    correctAnswerIndex: 2,
    explanation: 'Tiêu chuẩn kiểm tra bài 1 ném lựu đạn xa trúng hướng: Giỏi: Từ 45m trở lên; Khá: Từ 40m đến dưới 45m; Đạt: Từ 35m đến dưới 40m.',
    category: 'Kỹ thuật Chiến đấu bộ binh',
    difficulty: 'Khó',
    points: 10
  },
  {
    id: 'Q_MIL_006',
    question: 'Khi chào trong đội ngũ hoặc cá nhân có đội mũ K07/K20, mép bàn tay phải đặt ở vị trí nào?',
    options: [
      'A. Đầu ngón tay giữa chạm nhẹ vào vành mũ bên phải',
      'B. Đặt lòng bàn tay áp sát thái dương',
      'C. Đặt ngón cái chạm thái dương bên phải',
      'D. Đặt cổ tay ngang tầm mắt'
    ],
    correctAnswerIndex: 0,
    explanation: 'Điều lệnh Đội ngũ quy định: Tay phải đưa lên theo đường gần nhất, năm ngón tay khép thẳng, đầu ngón tay giữa chạm nhẹ vào vành mũ phía trước bên phải.',
    category: 'Điều lệnh Đội ngũ',
    difficulty: 'Dễ',
    points: 10
  },
  {
    id: 'Q_MIL_007',
    question: 'Bản chất truyền thống cách mạng vẻ vang của Quân đội Nhân dân Việt Nam được Bác Hồ khen ngợi bằng câu nói bất hủ nào?',
    options: [
      'A. "Quân đội ta trung với Đảng, hiếu với dân, sẵn sàng chiến đấu hy sinh vì độc lập tự do của Tổ quốc, vì chủ nghĩa xã hội. Nhiệm vụ nào cũng hoàn thành, khó khăn nào cũng vượt qua, kẻ thù nào cũng đánh thắng"',
      'B. "Bách chiến bách thắng, uy danh lẫy lừng"',
      'C. "Đâu cần thanh niên có, việc gì khó có quân đội"',
      'D. "Đoàn kết, kỷ luật, tự lực cánh sinh"'
    ],
    correctAnswerIndex: 0,
    explanation: 'Lời khen tặng của Chủ tịch Hồ Chí Minh nhân kỷ niệm 20 năm thành lập QĐNDVN (22/12/1964) đã trở thành khẩu hiệu hành động, lẽ sống và phẩm chất cao quý của Bộ đội Cụ Hồ.',
    category: 'Chính trị & Tư tưởng',
    difficulty: 'Dễ',
    points: 10
  },
  {
    id: 'Q_MIL_008',
    question: 'Trong 10 Lời thề danh dự của quân nhân QĐNDVN, Lời thề thứ 7 nói về nội dung gì?',
    options: [
      'A. Tuyệt đối giữ gìn bí mật quốc gia và quân sự',
      'B. Đoàn kết chặt chẽ với nhân dân, không lấy cây kim sợi chỉ của dân',
      'C. Đoàn kết nội bộ, thương yêu đồng chí đồng đội như ruột thịt',
      'D. Hết lòng phục vụ nhân dân, bảo vệ tính mạng và tài sản của nhân dân'
    ],
    correctAnswerIndex: 2,
    explanation: 'Lời thề thứ 7: "Đoàn kết chặt chẽ với nhau như ruột thịt trên tình đồng chí cách mạng; thương yêu, giúp đỡ lẫn nhau lúc bình thường cũng như lúc chiến đấu; đồng cam cộng khổ, chia ngọt sẻ bùi."',
    category: 'Pháp luật Quân sự & Kỷ luật',
    difficulty: 'Khó',
    points: 10
  },
  {
    id: 'Q_MIL_009',
    question: 'Cơ quan nào có thẩm quyền ban hành Điều lệnh, Điều lệ quản lý trong toàn quân?',
    options: [
      'A. Bộ Quốc phòng hoặc Bộ Tổng Tham mưu thừa ủy quyền Bộ Quốc phòng',
      'B. Ban Chỉ huy Trung đoàn',
      'C. Ủy ban Nhân dân tỉnh',
      'D. Quân đoàn cơ sở'
    ],
    correctAnswerIndex: 0,
    explanation: 'Điều lệnh, Điều lệ QĐNDVN do Bộ trưởng Bộ Quốc phòng ký ban hành áp dụng thống nhất trong toàn quân.',
    category: 'Pháp luật Quân sự & Kỷ luật',
    difficulty: 'Trung bình',
    points: 10
  },
  {
    id: 'Q_MIL_010',
    question: 'Bước đi trong điều lệnh đội ngũ đi đều có độ dài chuẩn và tần số bước là bao nhiêu?',
    options: [
      'A. Bước dài 75cm, tốc độ 110 bước/phút',
      'B. Bước dài 70cm, tốc độ 100 bước/phút',
      'C. Bước dài 80cm, tốc độ 120 bước/phút',
      'D. Bước dài 65cm, tốc độ 90 bước/phút'
    ],
    correctAnswerIndex: 0,
    explanation: 'Điều lệnh Đội ngũ QĐNDVN quy định động tác đi đều: độ dài mỗi bước là 75cm (tính từ gót chân nọ đến gót chân kia), tốc độ đi là 110 bước trong một phút.',
    category: 'Điều lệnh Đội ngũ',
    difficulty: 'Trung bình',
    points: 10
  }
];

export const INITIAL_ROOMS: ExamRoom[] = [
  {
    id: 'ROOM_001',
    code: 'QDND-2026-P01',
    title: 'KIỂM TRA CHÍNH TRỊ & ĐIỀU LỆNH QUÝ III NĂM 2026',
    description: 'Kiểm tra nhận thức chính trị, 11 chế độ trong ngày, điều lệnh đội ngũ và quy tắc an toàn vũ khí cho toàn thể cán bộ chiến sĩ Tiểu đoàn 1.',
    passcode: 'QDNDVN2026',
    durationMinutes: 15,
    totalQuestions: 10,
    passingScore: 5.0,
    status: 'active',
    questions: INITIAL_QUESTIONS,
    createdAt: '2026-09-28T08:00:00Z',
    createdBy: 'Trung tá Nguyễn Văn Thắng (Chính trị viên)',
    targetUnit: 'Tiểu đoàn 1, Sư đoàn BB 305, Quân khu 5',
    antiCheatMode: 'strict',
    allowInstantResult: true
  },
  {
    id: 'ROOM_002',
    code: 'QDND-2026-P02',
    title: 'HỘI THAO KỸ THUẬT CHIẾN ĐẤU BỘ BINH & VŨ KHÍ BỘ ĐỘI',
    description: 'Đánh giá cấu tạo, tính năng kỹ chiến thuật của súng AK, K54 và quy tắc ngắm bắn bài 1, 2 ban ngày.',
    passcode: 'CHIENSI88',
    durationMinutes: 20,
    totalQuestions: 10,
    passingScore: 6.0,
    status: 'scheduled',
    questions: INITIAL_QUESTIONS.slice(0, 5),
    createdAt: '2026-09-29T14:30:00Z',
    createdBy: 'Đại úy Trần Đình Mạnh (Trợ lý Tác huấn)',
    targetUnit: 'Đại đội 2, Tiểu đoàn 1, Sư đoàn BB 305',
    antiCheatMode: 'strict',
    allowInstantResult: true
  }
];

export const INITIAL_USERS: MilitaryUser[] = [
  {
    id: 'USR_001',
    username: 'thutruong.chihuy',
    fullName: 'Đại tá Phạm Quốc Cường',
    rank: 'Đại tá',
    position: 'Sư đoàn trưởng',
    unit: 'Bộ Chỉ huy Sư đoàn BB 305, Quân khu 5',
    militaryCode: 'QD305-001',
    role: 'super_admin',
    isActive: true,
    permissions: {
      canCreateExam: true,
      canEditBank: true,
      canManageUsers: true,
      canViewProctor: true,
      canExportExcel: true,
      canDisqualify: true
    }
  },
  {
    id: 'USR_002',
    username: 'canbo.khaothi',
    fullName: 'Trung tá Nguyễn Văn Thắng',
    rank: 'Trung tá',
    position: 'Chính trị viên Tiểu đoàn 1',
    unit: 'Tiểu đoàn 1, Sư đoàn BB 305',
    militaryCode: 'QD305-142',
    role: 'admin',
    isActive: true,
    permissions: {
      canCreateExam: true,
      canEditBank: true,
      canManageUsers: false,
      canViewProctor: true,
      canExportExcel: true,
      canDisqualify: true
    }
  },
  {
    id: 'USR_003',
    username: 'giamthi.coithi',
    fullName: 'Đại úy Trần Đình Mạnh',
    rank: 'Đại úy',
    position: 'Đại đội trưởng Đại đội 1',
    unit: 'Đại đội 1, Tiểu đoàn 1, Sư đoàn BB 305',
    militaryCode: 'QD305-205',
    role: 'proctor',
    isActive: true,
    permissions: {
      canCreateExam: false,
      canEditBank: false,
      canManageUsers: false,
      canViewProctor: true,
      canExportExcel: true,
      canDisqualify: true
    }
  },
  {
    id: 'USR_004',
    username: 'chiensi.leminh',
    fullName: 'Binh nhất Lê Minh Tuấn',
    rank: 'Binh nhất',
    position: 'Chiến sĩ số 1',
    unit: 'Tiểu đội 1, Trung đội 1, Đại đội 1, Sư đoàn BB 305',
    militaryCode: 'QD305-988',
    role: 'candidate',
    isActive: true,
    permissions: {
      canCreateExam: false,
      canEditBank: false,
      canManageUsers: false,
      canViewProctor: false,
      canExportExcel: false,
      canDisqualify: false
    }
  }
];

export const INITIAL_SUBMISSIONS: ExamSubmission[] = [
  {
    id: 'SUB_001',
    examId: 'ROOM_001',
    examCode: 'QDND-2026-P01',
    examTitle: 'KIỂM TRA CHÍNH TRỊ & ĐIỀU LỆNH QUÝ III NĂM 2026',
    candidate: {
      fullName: 'Binh nhất Lê Minh Tuấn',
      rank: 'Binh nhất',
      position: 'Chiến sĩ',
      unit: 'Tiểu đội 1, Trung đội 1, Đại đội 1, Tiểu đoàn 1, Trung đoàn 9',
      militaryId: 'QN-98821'
    },
    answers: {
      'Q_MIL_001': 0,
      'Q_MIL_002': 1,
      'Q_MIL_003': 1,
      'Q_MIL_004': 1,
      'Q_MIL_005': 2,
      'Q_MIL_006': 0,
      'Q_MIL_007': 0,
      'Q_MIL_008': 2,
      'Q_MIL_009': 0,
      'Q_MIL_010': 0
    },
    score: 100,
    scaledScore: 10.0,
    maxScore: 100,
    correctCount: 10,
    totalQuestions: 10,
    classification: 'Xuất sắc',
    timeSpentSeconds: 420,
    submittedAt: '2026-09-29T09:12:00Z',
    autoSubmitted: false,
    violations: [],
    aiAnalysis: 'Đồng chí Binh nhất Lê Minh Tuấn nắm chắc toàn diện kiến thức điều lệnh và truyền thống quân đội, chấp hành nghiêm quy chế thi, tác phong khẩn trương, chuẩn xác.',
    status: 'submitted'
  },
  {
    id: 'SUB_002',
    examId: 'ROOM_001',
    examCode: 'QDND-2026-P01',
    examTitle: 'KIỂM TRA CHÍNH TRỊ & ĐIỀU LỆNH QUÝ III NĂM 2026',
    candidate: {
      fullName: 'Hạ sĩ Vũ Hoàng Long',
      rank: 'Hạ sĩ',
      position: 'Tiểu đội phó',
      unit: 'Tiểu đội 2, Trung đội 1, Đại đội 1, Tiểu đoàn 1, Trung đoàn 9',
      militaryId: 'QN-98835'
    },
    answers: {
      'Q_MIL_001': 0,
      'Q_MIL_002': 1,
      'Q_MIL_003': 1,
      'Q_MIL_004': 0, // Sai
      'Q_MIL_005': 2,
      'Q_MIL_006': 0,
      'Q_MIL_007': 0,
      'Q_MIL_008': 1, // Sai
      'Q_MIL_009': 0,
      'Q_MIL_010': 0
    },
    score: 80,
    scaledScore: 8.0,
    maxScore: 100,
    correctCount: 8,
    totalQuestions: 10,
    classification: 'Giỏi',
    timeSpentSeconds: 580,
    submittedAt: '2026-09-29T09:15:30Z',
    autoSubmitted: false,
    violations: [],
    aiAnalysis: 'Đạt kết quả Giỏi. Cần ôn luyện thêm về 10 Lời thề danh dự và các thông số kỹ chiến thuật cự ly bắn súng tiểu liên AK.',
    status: 'submitted'
  },
  {
    id: 'SUB_003',
    examId: 'ROOM_001',
    examCode: 'QDND-2026-P01',
    examTitle: 'KIỂM TRA CHÍNH TRỊ & ĐIỀU LỆNH QUÝ III NĂM 2026',
    candidate: {
      fullName: 'Binh nhì Nguyễn Hữu Trọng',
      rank: 'Binh nhì',
      position: 'Chiến sĩ mới',
      unit: 'Tiểu đội 3, Trung đội 2, Đại đội 1, Tiểu đoàn 1, Trung đoàn 9',
      militaryId: 'QN-99104'
    },
    answers: {
      'Q_MIL_001': 0,
      'Q_MIL_002': 1,
      'Q_MIL_003': 0,
      'Q_MIL_004': 2,
      'Q_MIL_005': 1,
      'Q_MIL_006': 0,
      'Q_MIL_007': 0,
      'Q_MIL_008': 0,
      'Q_MIL_009': 0,
      'Q_MIL_010': 1
    },
    score: 50,
    scaledScore: 5.0,
    maxScore: 100,
    correctCount: 5,
    totalQuestions: 10,
    classification: 'Đạt',
    timeSpentSeconds: 780,
    submittedAt: '2026-09-29T09:22:15Z',
    autoSubmitted: true,
    violations: [
      {
        id: 'V_01',
        timestamp: '2026-09-29T09:14:10Z',
        type: 'tab_switch',
        message: 'Thí sinh rời tab bài thi trong 4 giây',
        severity: 'warning'
      }
    ],
    aiAnalysis: 'Đồng chí có 01 lần vi phạm cảnh báo chuyển tab. Kết quả thi Đạt. Tiểu đội trưởng cần kèm cặp ôn tập thêm về chế độ trong ngày và điều lệnh đội ngũ.',
    status: 'submitted'
  }
];
