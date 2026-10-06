import React, { useState } from 'react';
import { DEFAULT_MILITARY_GALLERY, MILITARY_HERO_BANNER } from '../assets/images';
import {
  Image,
  Upload,
  Check,
  RotateCcw,
  X,
  Sparkles,
  Link as LinkIcon,
  Eye
} from 'lucide-react';

interface AdminImageSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBannerImage: string;
  onSelectBannerImage: (newImageUrl: string) => void;
}

export const AdminImageSettingsModal: React.FC<AdminImageSettingsModalProps> = ({
  isOpen,
  onClose,
  currentBannerImage,
  onSelectBannerImage,
}) => {
  const [selectedImage, setSelectedImage] = useState<string>(currentBannerImage);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Vui lòng chọn file hình ảnh hợp lệ (.jpg, .png, .webp)!');
      return;
    }

    setUploadError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setSelectedImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    setSelectedImage(customUrlInput.trim());
    setCustomUrlInput('');
  };

  const handleSaveAndApply = () => {
    onSelectBannerImage(selectedImage);
    localStorage.setItem('QDND_BANNER_IMAGE', selectedImage);
    onClose();
  };

  const handleResetDefault = () => {
    setSelectedImage(MILITARY_HERO_BANNER);
    onSelectBannerImage(MILITARY_HERO_BANNER);
    localStorage.removeItem('QDND_BANNER_IMAGE');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white border-2 border-emerald-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-700 text-amber-300 flex items-center justify-center font-bold shadow">
              <Image className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-emerald-950 font-military uppercase">
                QUẢN LÝ & THAY ĐỔI HÌNH ẢNH BANNER WEBSITE
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                Quản trị viên có thể đổi ảnh bìa Cổng thi quân nhân bằng thư viện AI hoặc tải ảnh tùy biến từ máy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview */}
        <div className="my-5">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-stone-800 uppercase flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-emerald-700" />
              <span>Xem trước ảnh hiển thị trên cổng thi:</span>
            </label>
            <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Kích thước chuẩn: Tỷ lệ 16:9
            </span>
          </div>
          <div className="relative h-44 sm:h-52 w-full rounded-2xl overflow-hidden border-2 border-emerald-800 shadow-inner bg-stone-900">
            <img
              src={selectedImage}
              alt="Banner Preview"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/30 to-transparent flex flex-col justify-end p-4 text-white">
              <span className="text-[10px] text-amber-300 font-military font-bold uppercase tracking-wider">
                QUÂN KHU 5 — SƯ ĐOÀN BỘ BINH 305
              </span>
              <h4 className="text-sm font-black font-military text-white uppercase drop-shadow">
                CỔNG ĐĂNG NHẬP PHÒNG THI TRỰC TUYẾN
              </h4>
            </div>
          </div>
        </div>

        {/* Section 1: AI Generated Military Gallery */}
        <div className="space-y-3 my-5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-emerald-950 uppercase flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>1. Chọn từ Thư viện AI Quân đội Sư đoàn 305:</span>
            </label>
            <span className="text-[11px] text-stone-500 font-medium">
              4 ảnh đặc trưng phong cách QĐND Việt Nam
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DEFAULT_MILITARY_GALLERY.map((item) => {
              const isChosen = selectedImage === item.url;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedImage(item.url)}
                  className={`p-3 rounded-2xl border transition cursor-pointer flex gap-3 ${
                    isChosen
                      ? 'bg-emerald-50 border-emerald-700 shadow-md ring-2 ring-emerald-600/30'
                      : 'bg-stone-50 hover:bg-stone-100 border-stone-200'
                  }`}
                >
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-24 h-16 rounded-xl object-cover shrink-0 shadow-sm border border-stone-300"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h5 className="text-xs font-bold text-stone-900 leading-snug truncate">
                        {item.title}
                      </h5>
                      {isChosen && (
                        <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Upload custom image from device */}
        <div className="my-5 p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
          <label className="text-xs font-bold text-stone-900 uppercase flex items-center gap-1.5">
            <Upload className="w-4 h-4 text-blue-700" />
            <span>2. Tải ảnh mới từ máy tính / thiết bị:</span>
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <label className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm transition">
              <Upload className="w-4 h-4 text-blue-200" />
              <span>Chọn Tệp Hình Ảnh (.jpg, .png)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <span className="text-[11px] text-stone-500">
              Hỗ trợ JPG, PNG, WEBP. Ảnh sẽ được tự động đồng bộ hóa trên website.
            </span>
          </div>

          {uploadError && (
            <p className="text-xs text-red-600 font-semibold">{uploadError}</p>
          )}

          {/* Or by URL */}
          <div className="pt-2 border-t border-stone-200 flex items-center gap-2">
            <input
              type="text"
              value={customUrlInput}
              onChange={(e) => setCustomUrlInput(e.target.value)}
              placeholder="Hoặc dán liên kết URL hình ảnh trực tiếp (https://...)..."
              className="flex-1 bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-600"
            />
            <button
              type="button"
              onClick={handleApplyCustomUrl}
              className="px-3 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold cursor-pointer"
            >
              Áp Dụng Link
            </button>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-200">
          <button
            onClick={handleResetDefault}
            className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            title="Trở về ảnh AI mặc định ban đầu"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi Phục Ảnh Gốc</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveAndApply}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-700 to-emerald-800 hover:from-red-600 hover:to-emerald-700 text-white font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Check className="w-4 h-4 text-amber-300" />
              <span>Lưu & Đổi Hình Ảnh Ngay</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
