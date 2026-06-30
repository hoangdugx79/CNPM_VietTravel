# VietTravel 🌏

Hệ thống đặt tour du lịch Việt Nam được xây dựng với Next.js + Express.js + MongoDB.

## Tính năng

- Xem và tìm kiếm tour du lịch
- Đặt tour và quản lý booking
- Trang quản trị admin
- Xác thực người dùng (JWT + Google OAuth)
- Chatbot AI hỗ trợ tư vấn tour

## Công nghệ sử dụng

- **Frontend**: Next.js 14, React 18
- **Backend**: Express.js 5
- **Database**: MongoDB + Mongoose
- **Auth**: JWT, Google OAuth
- **AI**: Google Gemini AI

## Cài đặt

```bash
# Cài đặt dependencies
npm install

# Tạo file .env từ mẫu và điền thông tin
cp .env.example .env

# Chạy seed dữ liệu mẫu
npm run seed

# Chạy môi trường development
npm run dev
```

## Cấu trúc thư mục

```
├── components/     # React components
├── pages/          # Next.js pages
├── src/            # Express API (routes, models, services)
├── styles/         # CSS styles
├── public/         # Static assets
└── uploads/        # Uploaded images
```
