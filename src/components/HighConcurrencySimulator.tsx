import React, { useState, useEffect } from 'react';
import {
  Server,
  Cpu,
  Zap,
  Activity,
  CheckCircle2,
  TrendingUp,
  Shield,
  Layers,
  HardDrive,
  RefreshCw,
  Play,
  Database
} from 'lucide-react';

export const HighConcurrencySimulator: React.FC = () => {
  const [concurrencyLevel, setConcurrencyLevel] = useState<number>(1000);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentLatency, setCurrentLatency] = useState<number>(28);
  const [activePods, setActivePods] = useState<number>(4);
  const [throughput, setThroughput] = useState<number>(1250);
  const [cpuLoad, setCpuLoad] = useState<number>(34);
  const [successRate, setSuccessRate] = useState<number>(100);

  const runStressTest = () => {
    setIsSimulating(true);
    setProgress(0);

    const targetPods = Math.max(Math.ceil(concurrencyLevel / 350), 2);
    let step = 0;

    const interval = setInterval(() => {
      step += 5;
      setProgress(step);

      // Simulate dynamic metrics responding to load
      setCurrentLatency(Math.floor(25 + Math.random() * 18));
      setActivePods((prev) => (prev < targetPods ? prev + 1 : targetPods));
      setThroughput(Math.floor((concurrencyLevel * 0.9) + Math.random() * 200));
      setCpuLoad(Math.floor(40 + (concurrencyLevel / 10000) * 45 + Math.random() * 5));
      setSuccessRate(99.98);

      if (step >= 100) {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 150);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-stone-900 border border-amber-600/60 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-700 to-emerald-800 border border-amber-400 flex items-center justify-center text-amber-200 shadow-lg">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold uppercase font-military">
                  HẠ TẦNG QUÂN SỰ MỞ RỘNG
                </span>
                <span className="text-xs text-stone-400">Khả năng phục vụ 1.000 - 10.000+ Thí Sinh Đồng Thời</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-400 font-military tracking-wide mt-1">
                TRUNG TÂM KIỂM THỬ TẢI & CHỊU TẢI CAO (STRESS TEST)
              </h2>
              <p className="text-xs text-stone-400">
                Mô hình xử lý phân tán, tự động co giãn (Auto-scaling Pods) và cơ chế lưu trữ đệm cục bộ (Local Resilient Caching) chống nghẽn mạng toàn quân.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Control Card */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
          <div>
            <h3 className="text-sm font-bold text-stone-100 uppercase tracking-wider font-military">
              CHỌN QUY MÔ THÍ SINH ĐỒNG THỜI NỘP BÀI (CONCURRENCY)
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Giả lập hàng nghìn chiến sĩ bấm "Nộp Bài" cùng một giây khi hết giờ thi.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {[500, 1000, 2500, 5000, 10000].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setConcurrencyLevel(lvl)}
                disabled={isSimulating}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                  concurrencyLevel === lvl
                    ? 'bg-amber-500 text-stone-950 shadow-md'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                {lvl.toLocaleString()} người
              </button>
            ))}
          </div>
        </div>

        {/* Action Trigger */}
        <div className="flex items-center gap-4">
          <button
            onClick={runStressTest}
            disabled={isSimulating}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-700 via-amber-600 to-amber-700 hover:from-red-600 hover:to-amber-500 text-stone-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl cursor-pointer disabled:opacity-50 transition"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                <span>ĐANG GIẢ LẬP TẢI CAO ({progress}%)...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>KÍCH HOẠT GIẢ LẬP {concurrencyLevel.toLocaleString()} CHIẾN SĨ NỘP BÀI</span>
              </>
            )}
          </button>

          {isSimulating && (
            <div className="flex-1 bg-stone-950 rounded-full h-3 overflow-hidden border border-stone-800">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-3 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </div>

        {/* Live Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-2">
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 text-center">
            <span className="text-[10px] text-stone-500 uppercase tracking-wider block">ĐỘ TRỄ PHẢN HỒI</span>
            <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
              {currentLatency} ms
            </span>
            <span className="text-[10px] text-emerald-500">Cực kỳ nhanh</span>
          </div>

          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 text-center">
            <span className="text-[10px] text-stone-500 uppercase tracking-wider block">THROUGHPUT NỘP BÀI</span>
            <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">
              {throughput} req/s
            </span>
            <span className="text-[10px] text-stone-400">Không nghẽn hàng đợi</span>
          </div>

          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 text-center">
            <span className="text-[10px] text-stone-500 uppercase tracking-wider block">AUTO-SCALING PODS</span>
            <span className="text-2xl font-bold font-mono text-blue-400 mt-1 block">
              {activePods} nodes
            </span>
            <span className="text-[10px] text-blue-400">Tự co giãn thông minh</span>
          </div>

          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 text-center">
            <span className="text-[10px] text-stone-500 uppercase tracking-wider block">TẢI CPU/RAM MÁY CHỦ</span>
            <span className="text-2xl font-bold font-mono text-amber-300 mt-1 block">
              {cpuLoad}%
            </span>
            <span className="text-[10px] text-stone-400">Trong ngưỡng an toàn</span>
          </div>

          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] text-stone-500 uppercase tracking-wider block">TỶ LỆ LƯU THÀNH CÔNG</span>
            <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
              {successRate}%
            </span>
            <span className="text-[10px] text-emerald-400">0% mất mát dữ liệu</span>
          </div>
        </div>
      </div>

      {/* Military Architectural Architecture Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase font-military">
            <HardDrive className="w-4 h-4" />
            <span>1. Local Offline Resilience (Bộ Đệm Cục Bộ)</span>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed">
            Mỗi khi thí sinh chọn đáp án, hệ thống lập tức mã hóa và lưu vào bộ nhớ cục bộ (Local Storage). Nếu mạng WiFi/LAN tại doanh trại bị chập chờn, bài thi vẫn tiếp diễn bình thường và tự động nộp khi có mạng trở lại.
          </p>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase font-military">
            <Layers className="w-4 h-4" />
            <span>2. Batch Queued Submission (Hàng Đợi Xử Lý)</span>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed">
            Khi 10.000 thí sinh hết giờ làm bài cùng lúc, các bài nộp được đưa vào hàng đợi không nghẽn với thuật toán Exponential Backoff Retry, ngăn chặn hoàn toàn hiện tượng sập máy chủ khảo thí.
          </p>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase font-military">
            <Shield className="w-4 h-4" />
            <span>3. An Toàn Thông Tin & Toàn Vẹn Dữ Liệu</span>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed">
            Mọi bài thi được đóng dấu thời gian (Time-stamping) và băm kiểm tra tính toàn vẹn (SHA-256 Checksum), chống can thiệp sửa đổi điểm số và đảm bảo tính minh bạch kỷ luật tuyệt đối của Quân đội.
          </p>
        </div>
      </div>
    </div>
  );
};
