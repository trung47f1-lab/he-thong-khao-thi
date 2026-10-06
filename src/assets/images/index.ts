import heroBanner from './military_portal_banner_1790824621157.jpg';
import hallImage from './military_exam_center_1790824633730.jpg';
import barracksImage from './military_barracks_morning_1790825556980.jpg';
import fieldTrainingImage from './military_field_training_1790825571797.jpg';

export const MILITARY_HERO_BANNER = heroBanner;
export const MILITARY_HALL_IMAGE = hallImage;
export const MILITARY_BARRACKS_IMAGE = barracksImage;
export const MILITARY_FIELD_IMAGE = fieldTrainingImage;

export const DEFAULT_MILITARY_GALLERY = [
  {
    id: 'hero_banner',
    title: 'Đội hình Quân nhân Sư đoàn BB 305 dưới Cờ Tổ quốc',
    description: 'Chiến sĩ Quân khu 5 trong trang phục chính quy, hàng ngũ trang nghiêm',
    url: heroBanner,
  },
  {
    id: 'military_hall',
    title: 'Hội trường Thi & Hội thảo Sư đoàn 305',
    description: 'Hội trường khảo thí hiện đại, khang trang với khẩu hiệu Quân khu 5',
    url: hallImage,
  },
  {
    id: 'barracks_morning',
    title: 'Lễ Chào cờ Doanh trại Sư đoàn 305',
    description: 'Nghi thức chào cờ buổi sáng trang nghiêm tại doanh trại quân đội',
    url: barracksImage,
  },
  {
    id: 'field_training',
    title: 'Thao trường Huấn luyện Chiến thuật',
    description: 'Cán bộ, chiến sĩ luyện tập phương án tác chiến tại thực địa',
    url: fieldTrainingImage,
  },
];
