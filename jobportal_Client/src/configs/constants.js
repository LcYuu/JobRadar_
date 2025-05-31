// API Endpoints
export const API_URL = 'http://localhost:8080';

// Other constants
export const APP_NAME = 'JobRadar';
export const DEFAULT_AVATAR = 'https://i.pravatar.cc/300';
export const DEFAULT_COMPANY_LOGO = 'https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png';

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 0;

// Authentication
export const TOKEN_KEY = 'jwt';
export const USER_KEY = 'user';

// Date formats
export const DATE_FORMAT = 'dd/MM/yyyy';
export const DATE_TIME_FORMAT = 'dd/MM/yyyy HH:mm';

export const jobTypeColors = {
  "Toàn thời gian": {
    backgroundColor: "rgba(0, 128, 0, 0.1)",
    color: "rgb(0, 128, 0)",
    border: "1px solid rgb(0, 128, 0)",
  },
  "Bán thời gian": {
    backgroundColor: "rgba(255, 165, 0, 0.1)",
    color: "rgb(255, 165, 0)",
    border: "1px solid rgb(255, 165, 0)",
  },
  "Từ xa": {
    backgroundColor: "rgba(138, 43, 226, 0.1)",
    color: "rgb(138, 43, 226)",
    border: "1px solid rgb(138, 43, 226)",
  },
  "Thực tập sinh": {
    backgroundColor: "rgba(0, 191, 255, 0.1)",
    color: "rgb(0, 191, 255)",
    border: "1px solid rgb(0, 191, 255)",
  },
};

export const industryColors = {
  "Y tế": {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    color: "#4CAF50",
    border: "1px solid #4CAF50",
  },
  "Tài chính/Ngân hàng": {
    backgroundColor: "rgba(33, 150, 243, 0.1)",
    color: "#2196F3",
    border: "1px solid #2196F3",
  },
  "Nhà hàng/Khách sạn": {
    backgroundColor: "rgba(255, 105, 180, 0.1)",
    color: "#FF69B4",
    border: "1px solid #FF69B4",
  },
  "Kinh doanh": {
    backgroundColor: "rgba(138, 43, 226, 0.1)",
    color: "#8A2BE2",
    border: "1px solid #8A2BE2",
  },
  "Marketing/Truyền thông": {
    backgroundColor: "rgba(255, 140, 0, 0.1)",
    color: "#FF8C00",
    border: "1px solid #FF8C00",
  },
  "Logistics": {
    backgroundColor: "rgba(255, 165, 0, 0.1)",
    color: "#FFA500",
    border: "1px solid #FFA500",
  },
  "IT phần mềm": {
    backgroundColor: "rgba(0, 0, 255, 0.1)",
    color: "#0000FF",
    border: "1px solid #0000FF",
  },
  "IT phần cứng": {
    backgroundColor: "rgba(0, 0, 255, 0.1)", 
    color: "#0000FF",
    border: "1px solid #0000FF",
  },
  "Thiết kế/In ấn": { 
    backgroundColor: "rgba(255, 20, 147, 0.1)",
    color: "#FF1493",
    border: "1px solid #FF1493",
  },
  "default": {
    backgroundColor: "rgba(156, 163, 175, 0.1)",
    color: "#6B7280",
    border: "1px solid #6B7280",
  },
  "Tài xế": {
    backgroundColor: "rgba(255, 99, 71, 0.1)",
    color: "#FF6347",
    border: "1px solid #FF6347",
  },
  "Viễn thông": {
    backgroundColor: "rgba(60, 179, 113, 0.1)",
    color: "#3CB371",
    border: "1px solid #3CB371",
  },
  "Cơ khí/Điện - điện tử": {
    backgroundColor: "rgba(75, 0, 130, 0.1)",
    color: "#4B0082",
    border: "1px solid #4B0082",
  },
  "Hệ thống nhúng và IOT": {
    backgroundColor: "rgba(255, 69, 0, 0.1)",
    color: "#FF4500",
    border: "1px solid #FF4500",
  },
  "Thương mại điện tử": {
    backgroundColor: "rgba(0, 128, 128, 0.1)",
    color: "#008080",
    border: "1px solid #008080",
  },
  "Công nghệ ô tô": {
    backgroundColor: "rgba(100, 149, 237, 0.1)",
    color: "#6495ED",
    border: "1px solid #6495ED",
  },
  "Sản xuất": {
    backgroundColor: "rgba(178, 34, 34, 0.1)",
    color: "#B22222",
    border: "1px solid #B22222",
  },
  "Kiến trúc/Xây dựng": {
    backgroundColor: "rgba(210, 105, 30, 0.1)",
    color: "#D2691E",
    border: "1px solid #D2691E",
  },
  "Giáo dục/Đào tạo": {
    backgroundColor: "rgba(128, 0, 128, 0.1)",
    color: "#800080",
    border: "1px solid #800080",
  },
  "Kế toán/Kiểm toán": {
    backgroundColor: "rgba(0, 100, 0, 0.1)",
    color: "#006400",
    border: "1px solid #006400",
  },
  "Luật": {
    backgroundColor: "rgba(105, 105, 105, 0.1)",
    color: "#696969",
    border: "1px solid #696969",
  },
  "Phiên dịch": {
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    color: "#FFD700",
    border: "1px solid #FFD700",
  }
};