USE TravelTourDB;
GO

-- 1. Thêm Destinations còn thiếu
IF NOT EXISTS (SELECT 1 FROM Destinations WHERE Slug = 'ha-long')
BEGIN
    INSERT INTO Destinations (Name, Slug, Description, Country, ImageUrl, CreatedAt)
    VALUES 
    (N'Hạ Long', 'ha-long', N'Vịnh Hạ Long - Kỳ quan thiên nhiên', 'Vietnam', 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80', SYSDATETIME()),
    (N'Sapa', 'sapa', N'Sapa - Thành phố trong sương', 'Vietnam', 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80', SYSDATETIME()),
    (N'Phú Quốc', 'phu-quoc', N'Đảo ngọc Phú Quốc', 'Vietnam', 'https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?w=800&q=80', SYSDATETIME()),
    (N'Nha Trang', 'nha-trang', N'Nha Trang biển gọi', 'Vietnam', 'https://images.unsplash.com/photo-1582650745070-52cd65e31766?w=800&q=80', SYSDATETIME()),
    (N'Hà Nội', 'ha-noi', N'Thủ đô Hà Nội', 'Vietnam', 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80', SYSDATETIME()),
    (N'Ninh Bình', 'ninh-binh', N'Ninh Bình - Vịnh Hạ Long trên cạn', 'Vietnam', 'https://images.unsplash.com/photo-1590054366619-33827464ce78?w=800&q=80', SYSDATETIME());
END
GO

-- 2. Gán Destinations cho các Tours hiện có
DECLARE @TourHaLong BIGINT = (SELECT TOP 1 TourId FROM Tours WHERE Slug = 'ha-long-cuoi-tuan-2n1d');
DECLARE @DestHaLong BIGINT = (SELECT TOP 1 DestinationId FROM Destinations WHERE Slug = 'ha-long');
IF @TourHaLong IS NOT NULL AND @DestHaLong IS NOT NULL AND NOT EXISTS(SELECT 1 FROM TourDestinations WHERE TourId=@TourHaLong AND DestinationId=@DestHaLong)
    INSERT INTO TourDestinations (TourId, DestinationId, SortOrder) VALUES (@TourHaLong, @DestHaLong, 1);

DECLARE @TourSapa BIGINT = (SELECT TOP 1 TourId FROM Tours WHERE Slug = 'sapa-san-may-fansipan-3n2d');
DECLARE @DestSapa BIGINT = (SELECT TOP 1 DestinationId FROM Destinations WHERE Slug = 'sapa');
IF @TourSapa IS NOT NULL AND @DestSapa IS NOT NULL AND NOT EXISTS(SELECT 1 FROM TourDestinations WHERE TourId=@TourSapa AND DestinationId=@DestSapa)
    INSERT INTO TourDestinations (TourId, DestinationId, SortOrder) VALUES (@TourSapa, @DestSapa, 1);

DECLARE @TourPhuQuoc BIGINT = (SELECT TOP 1 TourId FROM Tours WHERE Slug = 'phu-quoc-bien-xanh-4n3d');
DECLARE @DestPhuQuoc BIGINT = (SELECT TOP 1 DestinationId FROM Destinations WHERE Slug = 'phu-quoc');
IF @TourPhuQuoc IS NOT NULL AND @DestPhuQuoc IS NOT NULL AND NOT EXISTS(SELECT 1 FROM TourDestinations WHERE TourId=@TourPhuQuoc AND DestinationId=@DestPhuQuoc)
    INSERT INTO TourDestinations (TourId, DestinationId, SortOrder) VALUES (@TourPhuQuoc, @DestPhuQuoc, 1);

DECLARE @TourNhaTrang BIGINT = (SELECT TOP 1 TourId FROM Tours WHERE Slug = 'nha-trang-bien-da-hoang-so');
DECLARE @DestNhaTrang BIGINT = (SELECT TOP 1 DestinationId FROM Destinations WHERE Slug = 'nha-trang');
IF @TourNhaTrang IS NOT NULL AND @DestNhaTrang IS NOT NULL AND NOT EXISTS(SELECT 1 FROM TourDestinations WHERE TourId=@TourNhaTrang AND DestinationId=@DestNhaTrang)
    INSERT INTO TourDestinations (TourId, DestinationId, SortOrder) VALUES (@TourNhaTrang, @DestNhaTrang, 1);

DECLARE @TourHaNoi BIGINT = (SELECT TOP 1 TourId FROM Tours WHERE Slug = 'ha-noi-ninh-binh-trang-an');
DECLARE @DestHaNoi BIGINT = (SELECT TOP 1 DestinationId FROM Destinations WHERE Slug = 'ha-noi');
DECLARE @DestNinhBinh BIGINT = (SELECT TOP 1 DestinationId FROM Destinations WHERE Slug = 'ninh-binh');
IF @TourHaNoi IS NOT NULL AND @DestHaNoi IS NOT NULL AND NOT EXISTS(SELECT 1 FROM TourDestinations WHERE TourId=@TourHaNoi AND DestinationId=@DestHaNoi)
    INSERT INTO TourDestinations (TourId, DestinationId, SortOrder) VALUES (@TourHaNoi, @DestHaNoi, 1);
IF @TourHaNoi IS NOT NULL AND @DestNinhBinh IS NOT NULL AND NOT EXISTS(SELECT 1 FROM TourDestinations WHERE TourId=@TourHaNoi AND DestinationId=@DestNinhBinh)
    INSERT INTO TourDestinations (TourId, DestinationId, SortOrder) VALUES (@TourHaNoi, @DestNinhBinh, 2);
GO

-- 3. Thêm dữ liệu Tài xế (Drivers)
DECLARE @Provider1 BIGINT = (SELECT TOP 1 ProviderId FROM TransportProviders);
IF @Provider1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM Drivers)
BEGIN
    INSERT INTO Drivers (ProviderId, FullName, Phone, Email, LicenseNumber, LicenseClass, LicenseExpiryDate, ExperienceYears, Status)
    VALUES 
    (@Provider1, N'Nguyễn Văn Tài', '0901234567', 'tainguyen@email.com', 'B2-123456', 'D', '2028-12-31', 5, 'available'),
    (@Provider1, N'Trần Tuấn Lái', '0912345678', 'tuanlai@email.com', 'D-987654', 'E', '2027-10-15', 8, 'available'),
    (@Provider1, N'Lê Hoàng Bác', '0987654321', 'hoangbac@email.com', 'C-456789', 'E', '2029-05-20', 12, 'available'),
    (@Provider1, N'Phạm Tiến Phong', '0966778899', 'phongtien@email.com', 'FC-334455', 'FC', '2025-06-30', 15, 'available');
END
GO
