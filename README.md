# HỆ THỐNG KHẢO THÍ & THI TRỰC TUYẾN QUÂN SỰ — SƯ ĐOÀN BỘ BINH 305 (QUÂN KHU 5)

Hệ thống thi trắc nghiệm quân sự chính quy, bảo mật cao, khóa màn hình chống gian lận và tích hợp AI.

---

## 🎖️ CÁC TÍNH NĂNG CHÍNH

1. **Cổng Đăng Nhập & Thi Trực Tuyến Quân Nhân:**
   - Đăng nhập bảo mật, điền thông tin cấp bậc, chức vụ, đơn vị, mã phòng thi và mật khẩu do Ban Tổ chức cấp.
   - Cơ chế khóa màn hình toàn cảnh (Fullscreen Enforcer), phát hiện chuyển tab, rung chuông báo động kỷ luật.
   - Tự động nộp bài khi hết giờ, bảng câu hỏi trực quan, phân tích kết quả tức thì.

2. **Tạo Đề Thi Bằng Trí Tuệ Nhân Tạo (Gemini AI):**
   - Tùy chỉnh số lượng câu hỏi từ 1 đến 100 câu.
   - Tạo đề tự động theo từng chuyên mục: Chính trị & Tư tưởng, Điều lệnh QLBD, Kỹ thuật chiến đấu bộ binh, Chiến thuật binh chủng, Hậu cần - Kỹ thuật.
   - Phân tích tài liệu quân sự dạng văn bản.

3. **Ngân Hàng Câu Hỏi Theo Từng Mục:**
   - Lưu trữ và phân loại theo các thư mục chuyên đề quân sự.
   - Thêm câu hỏi thủ công, tạo mới chuyên mục phân loại tùy biến.
   - Nạp đề thi tự động từ tệp tin Microsoft Word (`.docx`).
   - Xuất báo cáo dữ liệu toàn diện hoặc theo từng chuyên mục sang Microsoft Excel (`.xlsx`).

4. **Tạo Phòng Thi & Đợt Kiểm Tra Mới:**
   - Rút câu hỏi tự động từ ngân hàng theo số lượng tùy nhập hoặc chọn thủ công.
   - **Tự động đảo thứ tự câu hỏi (Shuffle Questions)** chống nhìn bài.
   - **Tự động đảo đáp án A, B, C, D (Shuffle Options)** bảo toàn 100% đáp án đúng.
   - Xuất mã QR phòng thi để thí sinh quét mã vào phòng trực tiếp bằng điện thoại/máy tính bảng.

5. **Giám Sát Gian Lận Trực Tiếp (Live Proctoring Dashboard):**
   - Theo dõi trạng thái thời gian thực của thí sinh trong phòng thi.
   - Cảnh báo vi phạm (rời tab, thoát toàn màn hình, nghi vấn AI) kèm xử lý kỷ luật hoặc đình chỉ thi ngay lập tức.

6. **Tùy Biến Giao Diện & Hình Ảnh Website:**
   - Thay đổi ảnh banner hệ thống bằng Thư viện ảnh AI Quân đội, tải ảnh từ máy tính hoặc dùng URL.

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN TRÊN MÁY TÍNH CÁ NHÂN (LOCAL)

### 1. Yêu Cầu Hệ Thống:
- **Node.js**: Phiên bản 18 trở lên (Khuyến nghị Node.js 20 LTS).
- **Trình quản lý gói**: `npm` đi kèm Node.js.

### 2. Các Bước Cài Đặt:
1. Giải nén tệp tin `QDND_305_HeThongKhaoThi_SourceCode.zip`.
2. Mở thư mục dự án bằng Terminal / Command Prompt hoặc VS Code.
3. Cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   ```
4. Cấu hình biến môi trường (Tùy chọn):
   - Tạo tệp tin `.env` trong thư mục gốc (tham khảo `.env.example`).
   - Thêm khóa Gemini API nếu muốn dùng tính năng AI nâng cao:
     ```env
     GEMINI_API_KEY=your_gemini_api_key_here
     PORT=3000
     ```
   *(Lưu ý: Nếu không có khóa API, hệ thống vẫn hoạt động đầy đủ với bộ ngân hàng câu hỏi huấn luyện quân sự tiêu chuẩn).*

5. Khởi chạy máy chủ phát triển (Development):
   ```bash
   npm run dev
   ```
6. Mở trình duyệt web và truy cập:
   ```
   http://localhost:3000
   ```

### 3. Đóng Gói Sản Phẩm (Production Build):
```bash
npm run build
npm start
```

---

## 🔒 THÔNG TIN TÀI KHOẢN QUẢN TRỊ (ADMIN)
- Mật khẩu mở khóa quyền quản trị viên: **`admin305`** hoặc **`admin`**.
