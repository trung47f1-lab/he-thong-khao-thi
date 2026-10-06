import { ViolationEvent } from '../types/military';

/**
 * Audio Beep synthesizer using Web Audio API for military warning buzzer
 */
export function playWarningBuzzer() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, audioCtx.currentTime); // 440 Hz
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
    osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  } catch (e) {
    // Audio context may require user interaction
  }
}

export interface AntiCheatOptions {
  onViolation: (violation: ViolationEvent) => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
  maxViolations?: number;
  onMaxViolationsReached?: () => void;
  isExamActive: boolean;
}

export class AntiCheatController {
  private options: AntiCheatOptions;
  private violationCount = 0;
  private isDestroyed = false;
  private lastViolationTime = 0;

  constructor(options: AntiCheatOptions) {
    this.options = options;
    this.initListeners();
  }

  private recordViolation(type: ViolationEvent['type'], message: string, severity: 'warning' | 'critical' = 'warning') {
    if (!this.options.isExamActive || this.isDestroyed) return;

    // Debounce violations within 1.5 seconds to avoid cascading triggers
    const now = Date.now();
    if (now - this.lastViolationTime < 1500) return;
    this.lastViolationTime = now;

    this.violationCount++;
    playWarningBuzzer();

    const violation: ViolationEvent = {
      id: `VIOL_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      type,
      message: `[Lần ${this.violationCount}] ${message}`,
      severity: this.violationCount >= 3 ? 'critical' : severity
    };

    this.options.onViolation(violation);

    if (this.options.maxViolations && this.violationCount >= this.options.maxViolations) {
      if (this.options.onMaxViolationsReached) {
        this.options.onMaxViolationsReached();
      }
    }
  }

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.recordViolation('tab_switch', 'Phát hiện rời khỏi tab bài thi hoặc chuyển sang ứng dụng khác (Nghi vấn tra cứu AI)', 'critical');
    }
  };

  private handleWindowBlur = () => {
    // Only trigger if document is active but window lost focus (e.g. devtools or split screen)
    if (!document.hidden) {
      this.recordViolation('window_blur', 'Cửa sổ thi bị mất tiêu điểm (Phát hiện mở cửa sổ phụ, AI hỗ trợ hoặc DevTools)');
    }
  };

  private handleFullscreenChange = () => {
    const isFullscreen = Boolean(document.fullscreenElement);
    if (this.options.onFullscreenChange) {
      this.options.onFullscreenChange(isFullscreen);
    }
    if (!isFullscreen && this.options.isExamActive) {
      this.recordViolation('fullscreen_exit', 'Thoát chế độ toàn màn hình khóa giám sát bài thi', 'critical');
    }
  };

  private handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    this.recordViolation('copy_paste_attempt', 'Cố tình nhấp chuột phải trên màn hình bài thi');
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    // Block DevTools: F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
      (e.ctrlKey && (e.key === 'U' || e.key === 'u'))
    ) {
      e.preventDefault();
      this.recordViolation('dev_tools', 'Cố ý mở công cụ lập trình DevTools để can thiệp bài thi', 'critical');
      return false;
    }

    // Block Copy, Paste, Cut, Select All
    if (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'v' || e.key === 'V' || e.key === 'x' || e.key === 'X' || e.key === 'a' || e.key === 'A')) {
      e.preventDefault();
      this.recordViolation('copy_paste_attempt', 'Hành vi sao chép (Copy/Paste) câu hỏi bị nghiêm cấm');
      return false;
    }

    // Detect Alt + Tab
    if (e.altKey && e.key === 'Tab') {
      this.recordViolation('suspicious_shortcut', 'Nhấn tổ hợp phím Alt + Tab để chuyển màn hình');
    }
  };

  public async requestFullscreen(): Promise<boolean> {
    try {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
        return true;
      } else if ((docEl as any).webkitRequestFullscreen) {
        await (docEl as any).webkitRequestFullscreen();
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Fullscreen request denied or not supported in this frame', err);
      return false;
    }
  }

  public async exitFullscreen() {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore
    }
  }

  private initListeners() {
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('blur', this.handleWindowBlur);
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    window.addEventListener('contextmenu', this.handleContextMenu);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  public updateExamState(isActive: boolean) {
    this.options.isExamActive = isActive;
  }

  public destroy() {
    this.isDestroyed = true;
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('blur', this.handleWindowBlur);
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    window.removeEventListener('contextmenu', this.handleContextMenu);
    window.removeEventListener('keydown', this.handleKeyDown);
  }
}
