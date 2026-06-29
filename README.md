# 🎓 BÁO CÁO BÀI TẬP LỚN: HỆ THỐNG QUẢN LÝ VÀ ĐẶT TOUR DU LỊCH (VIETTRAVEL)

## 📑 THÔNG TIN CHUNG
- **Môn học:** Công Nghệ Phần Mềm (CNPM)
- **Đề tài:** Xây dựng hệ thống quản lý, bán tour du lịch và tích hợp module vận tải.
- **Năm học:** 2026

---

## 📋 1. GIỚI THIỆU TỔNG QUAN

**VietTravel** là một hệ thống web ứng dụng hoàn chỉnh hỗ trợ quy trình bán tour, đặt tour du lịch và quản lý hệ sinh thái xoay quanh dịch vụ lữ hành. Điểm nổi bật của hệ thống là tích hợp sâu **Module Vận tải**, cho phép quản lý chi tiết nhà cung cấp xe, tài xế, phương tiện và lịch trình chạy xe cho từng tour.

### Kiến trúc hệ thống:
- **Backend (Server):** Xây dựng bằng `Node.js` kết hợp với `Express.js` cung cấp RESTful APIs.
- **Frontend (Client):** Sử dụng `HTML5`, `CSS3`, và `JavaScript` thuần (Vanilla JS) giao tiếp với API qua `fetch`, không lệ thuộc framework, đảm bảo hiệu năng và dễ dàng tích hợp.
- **Database:** `Microsoft SQL Server`, quản lý dữ liệu toàn diện với các Store Procedures, View và ràng buộc dữ liệu chặt chẽ.

---

## 🚀 2. CÔNG NGHỆ SỬ DỤNG

* **Backend:** Node.js, Express.js, JWT (JSON Web Token) cho Authentication, Multer cho Upload ảnh.
* **Database:** SQL Server, thư viện `mssql`, `msnodesqlv8` (Hỗ trợ Windows Authentication).
* **Frontend:** HTML5, CSS3, Vanilla JavaScript, FontAwesome (Icons).
* **Môi trường & Công cụ:** Visual Studio Code, SQL Server Management Studio (SSMS), Git.

---

## 🎯 3. CÁC CHỨC NĂNG CHÍNH CỦA HỆ THỐNG

Hệ thống được chia thành 2 phân hệ rõ rệt: **Phân hệ Khách hàng (Frontend)** và **Phân hệ Quản trị (Admin Panel)**.

### 👥 3.1. Phân hệ Khách hàng (User Frontend)
- **Trang chủ & Tìm kiếm:** Xem danh sách tour nổi bật, tìm kiếm tour theo từ khóa, mức giá, điểm đến.
- **Chi tiết Tour:** Xem mô tả chi tiết, lịch trình, hình ảnh, chính sách hủy tour và các đánh giá.
- **Tài khoản cá nhân:** Đăng ký, đăng nhập (JWT), cập nhật thông tin cá nhân.
- **Đặt Tour (Booking):** Đặt tour với số lượng người lớn/trẻ em, chọn điểm đón, áp dụng mã khuyến mãi.
- **Quản lý Booking:** Xem lịch sử đặt tour, trạng thái thanh toán, mã vé (Booking Code).

### 👑 3.2. Phân hệ Quản trị (Admin Panel)
- **Dashboard:** Thống kê tổng quan về doanh thu, số lượng tour, số lượng booking mới trong tháng.
- **Quản lý Tour & Lịch khởi hành:** Tạo tour mới, chỉnh sửa thông tin, hình ảnh, cập nhật lịch khởi hành (Departures).
- **Quản lý Booking:** Phê duyệt booking, cập nhật trạng thái thanh toán.
- **Quản lý Người dùng (Users):** Quản lý phân quyền (Admin, Staff, Customer, Driver).
- **Quản lý Khuyến mãi (Promotions):** Tạo các mã giảm giá (Voucher), thiết lập thời gian và điều kiện áp dụng.

### 🚗 3.3. Module Vận Tải (Tính năng nâng cao)
- **Nhà cung cấp (Providers):** Quản lý đối tác cho thuê xe.
- **Phương tiện (Vehicles):** Quản lý thông tin xe, biển số, sức chứa, loại xe (Limousine, Bus,...).
- **Tài xế (Drivers):** Lưu trữ thông tin tài xế, bằng lái xe.
- **Tuyến đường (Routes):** Quản lý lộ trình xe chạy để gán vào các tour.

---

## 📁 4. CẤU TRÚC THƯ MỤC

```text
BTL CNPM/
├── TravelTourDB_COMPLETE_Admin.sql  # Script tạo Database & Data mẫu
├── setup_passwords.sql              # Script mã hóa mật khẩu cho DB
├── backend/                         # Thư mục Backend Node.js
│   ├── .env                         # File cấu hình biến môi trường
│   ├── server.js                    # File chạy server chính
│   ├── config/                      # Cấu hình kết nối DB (db.js)
│   ├── middleware/                  # Middleware xác thực (auth.js)
│   ├── routes/                      # Định tuyến API
│   └── uploads/                     # Thư mục chứa ảnh upload
├── frontend/                        # Thư mục Frontend (Khách hàng)
│   ├── index.html                   # Trang chủ
│   ├── css/, js/, images/           # Tài nguyên tĩnh
│   └── pages/                       # Các trang (login, tours, booking...)
└── admin/                           # Thư mục Admin (Quản trị viên)
    ├── index.html                   # Dashboard admin
    ├── css/, js/                    # Tài nguyên tĩnh cho Admin
    └── pages/                       # Các trang quản lý (tours, users, vehicles...)
```

---

## ⚙️ 5. HƯỚNG DẪN CÀI ĐẶT VÀ CẤU HÌNH CHI TIẾT

Yêu cầu môi trường: **Node.js** (v16 trở lên) và **SQL Server** đã được cài đặt trên máy.

### Bước 1: Khởi tạo Database
1. Mở **SQL Server Management Studio (SSMS)**.
2. Mở file `TravelTourDB_COMPLETE_Admin.sql` và nhấn **Execute** (F5) để tạo cấu trúc bảng, Stored Procedures và chèn dữ liệu mẫu.
3. Mở file `setup_passwords.sql` và nhấn **Execute** (F5) để mã hóa mật khẩu các tài khoản mặc định.

### Bước 2: Cài đặt thư viện Backend
1. Mở Terminal / Command Prompt.
2. Di chuyển vào thư mục `backend`:
   ```bash
   cd "H:\BTL CNPM\backend"
   ```
3. Chạy lệnh cài đặt các gói NPM:
   ```bash
   npm install
   ```

### Bước 3: Cấu hình biến môi trường (.env)
1. Trong thư mục `backend`, mở file `.env`.
2. Hệ thống mặc định hỗ trợ **Windows Authentication** nên nếu bạn dùng máy cá nhân, bạn **không cần** điền `DB_USER` và `DB_PASSWORD`.
3. Đảm bảo file `.env` có dạng như sau:
   ```env
   PORT=3000
   NODE_ENV=development

   DB_SERVER=localhost
   DB_DATABASE=TravelTourDB
   DB_USER=
   DB_PASSWORD=
   DB_PORT=1433
   DB_ENCRYPT=false
   DB_TRUST_SERVER_CERT=true

   JWT_SECRET=travel_tour_super_secret_key_2026_btl_cnpm
   ```
   *(Nếu SQL Server của bạn có cài đặt tài khoản `sa`, hãy điền `DB_USER=sa` và mật khẩu tương ứng)*.

### Bước 4: Khởi động Server
1. Tại thư mục `backend`, chạy lệnh:
   ```bash
   node server.js
   ```
2. Nếu console hiển thị như sau là thành công:
   ```text
   ✅ Connected to SQL Server: TravelTourDB
   ╔════════════════════════════════════════════╗
   ║   🌏 Travel Tour System - Server Started   ║
   ╠════════════════════════════════════════════╣
   ║  Frontend : http://localhost:3000          ║
   ║  Admin    : http://localhost:3000/admin    ║
   ║  API      : http://localhost:3000/api      ║
   ╚════════════════════════════════════════════╝
   ```

---

## 📖 6. HƯỚNG DẪN SỬ DỤNG HỆ THỐNG

### Trải nghiệm với vai trò Khách Hàng (Customer)
1. Mở trình duyệt, truy cập: **`http://localhost:3000`**
2. **Đăng nhập:** Truy cập tab "Đăng nhập". Sử dụng tài khoản:
   - Email: `vana@gmail.com`
   - Mật khẩu: `Customer@123`
3. **Mua Tour:**
   - Tại trang chủ, chọn "Xem chi tiết" một Tour.
   - Chọn ngày khởi hành, nhập số người, nhấn "Đặt Tour Ngay".
4. **Theo dõi Booking:** Vào mục "Booking của tôi" trên thanh menu để xem vé vừa đặt.

### Trải nghiệm với vai trò Quản Trị Viên (Admin)
1. Truy cập đường dẫn Admin: **`http://localhost:3000/admin`**
2. **Đăng nhập:**
   - Email: `admin@travel.com`
   - Mật khẩu: `Admin@123456`
3. **Thao tác quản lý:**
   - **Thêm Tour mới:** Menu trái chọn `Quản lý Tour` -> Nhấn nút `+ Thêm Tour`. Điền đầy đủ thông tin (chọn ảnh, mô tả, giá).
   - **Xử lý Booking:** Menu trái chọn `Quản lý Booking`. Tại đây bạn có thể xem các lượt đặt tour mới và ấn `Duyệt` hoặc `Hủy`.
   - **Quản lý Xe/Tài xế:** Chuyển qua nhóm `Quản lý Vận Tải`, bạn có thể thêm mới tài xế, thêm xe và gán nhà cung cấp tương ứng.

---

## 🔗 7. DANH SÁCH API CHÍNH (THAM KHẢO CHO DEVELOPER)

Hệ thống tuân thủ thiết kế RESTful API.

- **Authentication:**
  - `POST /api/auth/login`: Đăng nhập lấy Token.
  - `POST /api/auth/register`: Tạo tài khoản mới.
  - `GET /api/auth/me`: Lấy thông tin user hiện tại (Yêu cầu Header `Authorization: Bearer <token>`).

- **Tours (Public):**
  - `GET /api/tours`: Lấy danh sách tour.
  - `GET /api/tours/:slug`: Lấy chi tiết 1 tour.

- **Bookings (Protected):**
  - `POST /api/bookings`: Đặt tour mới.
  - `GET /api/bookings/my`: Lấy danh sách tour đã đặt của user.

- **Admin (Yêu cầu quyền Admin/Staff):**
  - `GET /api/admin/dashboard`: API thống kê dữ liệu.
  - `CRUD /api/admin/tours`: Thêm/Sửa/Xóa tour.
  - `CRUD /api/admin/bookings`: Thêm/Sửa/Xóa booking.
  - `CRUD /api/admin/transport/vehicles`: Quản lý xe.
  - `CRUD /api/admin/transport/drivers`: Quản lý tài xế.

---
*Báo cáo được hoàn thiện vào năm 2026. Mọi thông tin trong hệ thống là dữ liệu mô phỏng phục vụ mục đích học tập và làm bài tập lớn.*
