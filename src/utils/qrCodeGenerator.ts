import QRCode from 'qrcode';

/**
 * Generate QR code Data URL for candidate instant room entry
 * Mật khẩu phòng thi KHÔNG được gắn trong mã QR; thí sinh phải tự nhập mật khẩu do Giám thị/Chỉ huy cung cấp riêng.
 */
export async function generateExamRoomQRCode(roomCode: string): Promise<string> {
  try {
    // Generate direct entry query params (only room code)
    const baseUrl = window.location.origin;
    const directUrl = `${baseUrl}/?room=${encodeURIComponent(roomCode)}`;
    
    const qrDataUrl = await QRCode.toDataURL(directUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#15381C', // Military dark green
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });
    return qrDataUrl;
  } catch (err) {
    console.error('QR code generation failed:', err);
    return '';
  }
}
