-- =======================================================
-- SCRIPT CẬP NHẬT MẬT KHẨU - TravelTourDB
-- Chạy trong SQL Server Management Studio (SSMS)
-- SAU KHI đã chạy TravelTourDB_COMPLETE_Admin.sql
-- =======================================================

USE TravelTourDB;
GO

-- ============================================
-- Cập nhật mật khẩu cho tài khoản Admin
-- Mật khẩu: Admin@123456
-- ============================================
UPDATE Users 
SET PasswordHash = '$2b$10$KpJD/k7YM1sj9q6aPtZuKOybnMHiQOgufmf9PgvVnZ7sVa0VDBkDu',
    UpdatedAt = SYSDATETIME()
WHERE Email = 'admin@travel.com';
GO

-- ============================================
-- Cập nhật mật khẩu cho khách hàng mẫu
-- Mật khẩu: Customer@123
-- ============================================
UPDATE Users 
SET PasswordHash = '$2b$10$5PQDEskCT9cCElp2t9ugcendzwhu7G2MjSyRXKDFdL3CUxL2BNPl.',
    UpdatedAt = SYSDATETIME()
WHERE Email = 'vana@gmail.com';
GO

-- ============================================
-- Cập nhật mật khẩu cho tài xế mẫu
-- Mật khẩu: Driver@123
-- ============================================
UPDATE Users 
SET PasswordHash = '$2b$10$fvK4Y6gh.9Wqn67PK1HBauUqJJoXMUaKobRgfvIwonHtrRaIpoqNq',
    UpdatedAt = SYSDATETIME()
WHERE Email = 'driver@example.com';
GO

-- ============================================
-- Kiểm tra kết quả
-- ============================================
SELECT UserId, FullName, Email, Role, Status, 
       CASE WHEN LEN(PasswordHash) > 10 THEN '✅ Có mật khẩu' ELSE '❌ Chưa có' END AS PasswordStatus
FROM Users 
ORDER BY Role;
GO

PRINT '========================================';
PRINT 'Cập nhật mật khẩu thành công!';
PRINT '========================================';
PRINT 'Tài khoản đăng nhập:';
PRINT '  Admin   : admin@travel.com     / Admin@123456';
PRINT '  Khách   : vana@gmail.com       / Customer@123';
PRINT '  Tài xế  : driver@example.com  / Driver@123';
PRINT '========================================';
GO
