import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import JSZip from 'jszip';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Fallback high-quality curated military questions in case API key is empty or offline
const fallbackMilitaryQuestions = [
  {
    id: 'mil_fb_1',
    question: 'Ngày thành lập Quân đội Nhân dân Việt Nam là ngày tháng năm nào?',
    options: [
      'A. 22/12/1944 tại khu rừng Trần Hưng Đạo (Cao Bằng)',
      'B. 19/08/1945 tại Quảng trường Ba Đình (Hà Nội)',
      'C. 02/09/1945 tại Quảng trường Ba Đình (Hà Nội)',
      'D. 23/09/1945 tại Nam Bộ'
    ],
    correctAnswerIndex: 0,
    explanation: 'Quân đội Nhân dân Việt Nam thành lập ngày 22/12/1944 với tên gọi ban đầu là Đội Việt Nam Tuyên truyền Giải phóng quân, do đồng chí Võ Nguyên Giáp chỉ huy theo chỉ thị của Chủ tịch Hồ Chí Minh.',
    category: 'Lịch sử & Truyền thống QĐNDVN',
    difficulty: 'Dễ',
    points: 10
  },
  {
    id: 'mil_fb_2',
    question: 'Đội Việt Nam Tuyên truyền Giải phóng quân khi thành lập gồm bao nhiêu chiến sĩ và trang bị bao nhiêu khẩu súng?',
    options: [
      'A. 34 chiến sĩ, trang bị 34 khẩu súng các loại',
      'B. 50 chiến sĩ, trang bị 50 khẩu súng trường',
      'C. 100 chiến sĩ, trang bị 80 khẩu súng trường và tiểu liên',
      'D. 30 chiến sĩ, trang bị 25 khẩu súng trường'
    ],
    correctAnswerIndex: 0,
    explanation: 'Đội Việt Nam Tuyên truyền Giải phóng quân lúc thành lập có 34 cán bộ, chiến sĩ biên chế thành 3 tiểu đội, mang theo 34 khẩu súng các loại.',
    category: 'Lịch sử & Truyền thống QĐNDVN',
    difficulty: 'Trung bình',
    points: 10
  },
  {
    id: 'mil_fb_3',
    question: 'Tầm bắn hiệu quả của súng tiểu liên AK-47 đối với mục tiêu mặt đất là bao nhiêu mét?',
    options: [
      'A. Tầm bắn ghi trên thước ngắm 800m, hiệu quả mục tiêu mặt đất đến 400m',
      'B. Tầm bắn tối đa 500m, hiệu quả 200m',
      'C. Tầm bắn hiệu quả 1000m với mọi mục tiêu',
      'D. Tầm bắn hiệu quả 100m'
    ],
    correctAnswerIndex: 0,
    explanation: 'Súng tiểu liên AK có tầm bắn ghi trên thước ngắm là 800m (AKM là 1000m). Tầm bắn hiệu quả nhất với mục tiêu mặt đất là khoảng 400m, mục tiêu trên không là 500m.',
    category: 'Kỹ thuật Chiến đấu Bộ binh',
    difficulty: 'Trung bình',
    points: 10
  },
  {
    id: 'mil_fb_4',
    question: 'Theo Điều lệnh Quản lý bộ đội, quân nhân chào cấp trên trong trường hợp nào sau đây là ĐÚNG quy định?',
    options: [
      'A. Khi gặp cấp trên, quân nhân phải đứng nghiêm và thực hiện động tác chào theo quy định',
      'B. Chỉ chào khi có mệnh lệnh của tiểu đội trưởng',
      'C. Trong giờ nghỉ tự do không cần chào cấp trên',
      'D. Chỉ chào bằng lời nói, không cần chào tay'
    ],
    correctAnswerIndex: 0,
    explanation: 'Theo Điều lệnh Quản lý bộ đội QĐNDVN, quân nhân gặp nhau phải chào hỏi, cấp dưới phải chào cấp trên trước; khi đội ngũ gặp nhau người chỉ huy thay mặt chào.',
    category: 'Điều lệnh QĐNDVN',
    difficulty: 'Dễ',
    points: 10
  },
  {
    id: 'mil_fb_5',
    question: 'Cương lĩnh xây dựng đất nước trong thời kỳ quá độ lên CNXH (bổ sung, phát triển năm 2011) xác định nhiệm vụ trọng yếu hàng đầu của Quốc phòng - An ninh là gì?',
    options: [
      'A. Bảo vệ vững chắc độc lập, chủ quyền, thống nhất, toàn vẹn lãnh thổ của Tổ quốc, bảo vệ Đảng, Nhà nước, nhân dân và chế độ XHCN',
      'B. Mở rộng trang bị vũ khí hiện đại bậc nhất thế giới',
      'C. Tham gia các liên minh quân sự đa phương quốc tế',
      'D. Ưu tiên phát triển kinh tế biển đơn thuần'
    ],
    correctAnswerIndex: 0,
    explanation: 'Mục tiêu, nhiệm vụ quốc phòng, an ninh là bảo vệ vững chắc độc lập, chủ quyền, thống nhất, toàn vẹn lãnh thổ; giữ vững môi trường hòa bình, ổn định để phát triển đất nước.',
    category: 'Đường lối Chính trị & Pháp luật',
    difficulty: 'Khó',
    points: 10
  }
];

// API: Generate Exam / Questions using Gemini
app.post('/api/ai/generate-exam', async (req, res) => {
  try {
    const {
      topic = 'Chính trị & Điều lệnh Quân đội Nhân dân Việt Nam',
      numQuestions = 5,
      difficulty = 'Hỗn hợp',
      category = 'Tổng hợp',
      sourceDocument = ''
    } = req.body;

    const count = Math.min(Math.max(Number(numQuestions) || 5, 1), 30);

    if (!ai) {
      // If no API key configured, return high-quality military questions adjusted to requested count
      return res.json({
        success: true,
        source: 'curated-bank',
        questions: fallbackMilitaryQuestions.slice(0, count),
        message: 'Đã tạo bộ đề thi từ Ngân hàng Huấn luyện Quân chủng Tiêu chuẩn.'
      });
    }

    const promptText = `
Bạn là Trưởng Ban Khảo thí kiêm Huấn luyện Quân sự thuộc Quân đội Nhân dân Việt Nam (QĐNDVN).
Hãy tạo bộ đề thi trắc nghiệm quân sự chuyên sâu, chính xác 100% theo quy định, điều lệnh, lịch sử, kỹ thuật chiến đấu hoặc đường lối quốc phòng của Quân đội Nhân dân Việt Nam.

Yêu cầu chi tiết:
- Chủ đề: "${topic}"
- Lĩnh vực: "${category}"
- Số lượng câu hỏi: ${count} câu hỏi
- Độ khó: "${difficulty}" (Dễ / Trung bình / Khó / Rất khó / Hỗn hợp)
${sourceDocument ? `- Dựa trên tài liệu gốc sau: """${sourceDocument.slice(0, 3000)}"""` : ''}

Quy chuẩn nội dung:
1. Mỗi câu hỏi phải có 4 phương án lựa chọn (A, B, C, D) rõ ràng, mang tính phân loại học viên/chiến sĩ cao.
2. Chỉ duy nhất 1 đáp án chính xác (chỉ số correctAnswerIndex từ 0 đến 3).
3. Có phần giải thích (explanation) cặn kẽ, dẫn chứng theo Điều lệnh, Pháp lệnh, Lịch sử QĐNDVN hoặc Sách giáo khoa quân sự.
4. Gán thể loại và điểm chuẩn cho mỗi câu (ví dụ 10 điểm/câu).

Hãy trả về định dạng JSON thuần túy theo cấu trúc chỉ định.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: 'Bạn là chuyên gia khảo thí quân sự của Quân đội Nhân dân Việt Nam. Luôn xuất dữ liệu chuẩn định dạng JSON, ngôn từ chuẩn mực quân sự, chuẩn xác lịch sử và điều lệnh.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswerIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              category: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              points: { type: Type.NUMBER }
            },
            required: ['id', 'question', 'options', 'correctAnswerIndex', 'explanation', 'category', 'difficulty', 'points']
          }
        }
      }
    });

    const text = response.text?.trim() || '[]';
    let questions = [];
    try {
      questions = JSON.parse(text);
    } catch {
      // Clean possible markdown code fences
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      questions = JSON.parse(cleanJson);
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      questions = fallbackMilitaryQuestions.slice(0, count);
    }

    // Ensure IDs and format
    questions = questions.map((q: any, idx: number) => ({
      ...q,
      id: q.id || `ai_q_${Date.now()}_${idx}`,
      points: q.points || 10,
      difficulty: q.difficulty || difficulty
    }));

    return res.json({
      success: true,
      source: 'gemini-ai',
      questions,
      message: `Tạo thành công ${questions.length} câu hỏi quân sự chuẩn xác bằng AI.`
    });
  } catch (error: any) {
    console.error('Gemini generate exam error:', error);
    // Graceful fallback to guarantee user gets working questions even if network issues occur
    return res.json({
      success: true,
      source: 'curated-bank-fallback',
      questions: fallbackMilitaryQuestions,
      warning: 'Sử dụng ngân hàng chuẩn quân đội do giới hạn kết nối AI.',
      error: error.message
    });
  }
});

// API: AI Analysis & Feedback for candidate test
app.post('/api/ai/parse-word-exam', async (req, res) => {
  try {
    const { rawText = '' } = req.body;
    if (!rawText.trim()) {
      return res.status(400).json({ error: 'Nội dung văn bản trống' });
    }

    if (!ai) {
      return res.json({
        success: false,
        useLocalFallback: true,
        message: 'Mô hình AI chưa cấu hình, sử dụng bộ phân tích cục bộ.'
      });
    }

    const promptText = `
Bạn là chuyên gia trích xuất tài liệu khảo thí của Quân khu 5, Sư đoàn BB 305.
Dưới đây là nội dung trích xuất từ file tài liệu Word. Hãy phân tích cấu trúc, tự động bóc tách từng câu hỏi, 4 phương án lựa chọn A, B, C, D, phát hiện đáp án chính xác (hoặc suy luận đáp án chuẩn theo điều lệnh quân đội nếu không có đánh dấu), xác định chuyên mục quân sự tương ứng:
- Chính trị & Tư tưởng
- Điều lệnh Quản lý bộ đội
- Điều lệnh Đội ngũ
- Kỹ thuật Chiến đấu bộ binh
- Chiến thuật Binh chủng
- Hậu cần - Kỹ thuật
- Pháp luật Quân sự & Kỷ luật
- Tổng hợp

Văn bản gốc:
"""
${rawText.slice(0, 10000)}
"""

Hãy trả về danh sách mảng JSON thuần túy theo schema.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: 'Trích xuất chính xác 100% câu hỏi và đáp án từ tài liệu Word của Quân đội Nhân dân Việt Nam.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswerIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              category: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              points: { type: Type.NUMBER }
            },
            required: ['id', 'question', 'options', 'correctAnswerIndex', 'explanation', 'category', 'difficulty', 'points']
          }
        }
      }
    });

    const text = response.text?.trim() || '[]';
    let questions = [];
    try {
      questions = JSON.parse(text);
    } catch {
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      questions = JSON.parse(cleanJson);
    }

    return res.json({
      success: true,
      questions: questions.map((q: any, i: number) => ({
        ...q,
        id: q.id || `Q_AI_WORD_${Date.now()}_${i}`,
        points: q.points || 10,
        difficulty: q.difficulty || 'Trung bình'
      }))
    });
  } catch (error: any) {
    console.error('Word parse AI error:', error);
    return res.json({
      success: false,
      useLocalFallback: true,
      error: error.message
    });
  }
});

// API: AI Analysis & Feedback for candidate test
app.post('/api/ai/analyze-result', async (req, res) => {
  try {
    const { candidate, examTitle, score, maxScore, wrongQuestions, violationsCount } = req.body;

    if (!ai) {
      return res.json({
        success: true,
        feedback: `Đồng chí ${candidate?.fullName || 'Chiến sĩ'} đạt ${score}/${maxScore} điểm. Đơn vị đề nghị tiếp tục duy trì kỷ luật học tập, ôn luyện vững chắc điều lệnh và kiến thức chuyên môn quân chủng.`
      });
    }

    const prompt = `
Bạn là Trưởng ban Khảo thí Quân sự thuộc Quân đội Nhân dân Việt Nam.
Hãy nhận xét và đưa ra lời phê quân sự ngắn gọn, trang trọng, mang tính động viên và rèn luyện nghiêm túc cho bài thi sau:
- Thí sinh: ${candidate?.rank || 'Chiến sĩ'} ${candidate?.fullName || 'Ẩn danh'} - Chức vụ: ${candidate?.position || 'Chiến sĩ'} - Đơn vị: ${candidate?.unit || 'Toàn quân'}
- Tên bài kiểm tra: ${examTitle}
- Điểm số: ${score}/${maxScore}
- Số lần vi phạm quy chế thi (chuyển tab/mất tập trung): ${violationsCount || 0} lần
- Các nội dung trả lời chưa chính xác: ${JSON.stringify(wrongQuestions || []).slice(0, 500)}

Đưa ra đánh giá gồm:
1. Nhận xét tinh thần, kỷ luật làm bài và kết quả đạt được.
2. Chỉ ra các nội dung lý luận/kỹ thuật cần bổ sung ôn tập tại đơn vị.
3. Lời chúc và mệnh lệnh rèn luyện "Quyết chiến - Quyết thắng".
Độ dài khoảng 120-180 từ, văn phong quân đội chuẩn mực.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt
    });

    return res.json({
      success: true,
      feedback: response.text || 'Hoàn thành tốt nội dung kiểm tra quân sự.'
    });
  } catch (err: any) {
    return res.json({
      success: true,
      feedback: 'Hoàn thành bài thi quân sự. Đề nghị đồng chí tiếp tục phát huy tinh thần tự giác, kỷ luật cao trong học tập và công tác.'
    });
  }
});

// API: Check system health & AI connectivity
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Military Examination System QĐNDVN',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// Function to generate project zip buffer
async function generateProjectZipBuffer(): Promise<Buffer> {
  const rootDir = __dirname;
  const zip = new JSZip();

  function addDir(dirPath: string, zipFolder: JSZip) {
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      if (item === 'node_modules' || item === 'dist' || item === '.git' || item === '.cache') continue;
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        const sub = zipFolder.folder(item);
        if (sub) addDir(fullPath, sub);
      } else {
        const content = fs.readFileSync(fullPath);
        zipFolder.file(item, content);
      }
    }
  }

  // Add src
  const srcPath = path.join(rootDir, 'src');
  if (fs.existsSync(srcPath)) {
    const srcFolder = zip.folder('src');
    if (srcFolder) addDir(srcPath, srcFolder);
  }

  // Add root files
  const rootFiles = [
    'package.json',
    'package-lock.json',
    'tsconfig.json',
    'tsconfig.node.json',
    'vite.config.ts',
    'server.ts',
    'index.html',
    'README.md',
    '.env.example',
    '.gitignore',
    '.npmrc',
    'vercel.json',
    'metadata.json'
  ];

  for (const f of rootFiles) {
    const fp = path.join(rootDir, f);
    if (fs.existsSync(fp)) {
      zip.file(f, fs.readFileSync(fp));
    }
  }

  const buffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });
  return buffer;
}

// API: Export & Download Complete Project Source Code as .ZIP
app.get('/api/download-project', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  try {
    const staticZipPath = path.join(__dirname, 'public', 'QDND_305_HeThongKhaoThi_SourceCode.zip');
    let buffer: Buffer;

    if (fs.existsSync(staticZipPath)) {
      buffer = fs.readFileSync(staticZipPath);
    } else {
      buffer = await generateProjectZipBuffer();
      // Cache in public
      try {
        if (!fs.existsSync(path.join(__dirname, 'public'))) {
          fs.mkdirSync(path.join(__dirname, 'public'));
        }
        fs.writeFileSync(staticZipPath, buffer);
      } catch (cacheErr) {
        console.warn('Could not cache zip to public directory:', cacheErr);
      }
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="QDND_305_HeThongKhaoThi_SourceCode.zip"');
    res.setHeader('Content-Length', buffer.length.toString());
    res.send(buffer);
  } catch (err: any) {
    console.error('Error generating project zip:', err);
    res.status(500).json({ success: false, error: 'Lỗi khi đóng gói dự án: ' + err.message });
  }
});

// Alias download URLs
app.get('/download/project.zip', (req, res) => {
  res.redirect('/api/download-project');
});
app.get('/export-project', (req, res) => {
  res.redirect('/api/download-project');
});

// Production / Dev integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[QĐNDVN Exam Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
