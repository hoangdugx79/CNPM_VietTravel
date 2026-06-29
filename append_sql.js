const fs = require('fs');

const sqlText = `
-- ====================================================================
-- DỮ LIỆU BỔ SUNG: TOUR QUẢNG BÌNH
-- ====================================================================
DECLARE @DestId BIGINT;

INSERT INTO Destinations (Name, Slug, Type, Country, Province, Description, ImageUrl, Status)
VALUES (N'Quảng Bình', 'quang-binh', 'province', N'Việt Nam', N'Quảng Bình', N'Vương quốc hang động với những kì quan thiên nhiên tuyệt đẹp.', '/uploads/quang_binh_tour.png', 'active');

SET @DestId = SCOPE_IDENTITY();

INSERT INTO Tours (Code, Title, Slug, DeparturePlaceName, DeparturePlaceType, DurationDays, DurationNights, BasePrice, ShortDescription, Description, MainImageUrl, RatingAvg, RatingCount, Status, CreatedBy)
VALUES ('QB-PN-3N2D', N'Khám phá Quảng Bình - Phong Nha Kẻ Bàng 3 ngày 2 đêm', 'kham-pha-quang-binh-phong-nha-ke-bang-3n2d', N'Hà Nội', 'city', 3, 2, 3890000, N'Hành trình khám phá vương quốc hang động Phong Nha - Kẻ Bàng.', N'<p>Hành trình khám phá vương quốc hang động Phong Nha - Kẻ Bàng, chiêm ngưỡng thạch nhũ tuyệt đẹp và tận hưởng làn nước mát lạnh tại Suối Nước Moọc.</p>', '/uploads/quang_binh_tour.png', 4.9, 120, 'active', 1);

DECLARE @TourId BIGINT = SCOPE_IDENTITY();

INSERT INTO TourDestinations (TourId, DestinationId)
VALUES (@TourId, @DestId);

INSERT INTO TourCategoryMaps (TourId, CategoryId)
VALUES (@TourId, 1);

INSERT INTO TourDepartures (DepartureCode, TourId, StartDate, EndDate, Capacity, BookedCount, HoldCount, AdultPrice, ChildPrice, InfantPrice, Status)
VALUES ('DEP-QB-1', @TourId, '2026-07-10', '2026-07-12', 30, 0, 0, 3890000, 2500000, 500000, 'open');

INSERT INTO TourDepartures (DepartureCode, TourId, StartDate, EndDate, Capacity, BookedCount, HoldCount, AdultPrice, ChildPrice, InfantPrice, Status)
VALUES ('DEP-QB-2', @TourId, '2026-07-15', '2026-07-17', 30, 0, 0, 3890000, 2500000, 500000, 'open');

INSERT INTO TourDepartures (DepartureCode, TourId, StartDate, EndDate, Capacity, BookedCount, HoldCount, AdultPrice, ChildPrice, InfantPrice, Status)
VALUES ('DEP-QB-3', @TourId, '2026-07-25', '2026-07-27', 30, 0, 0, 3890000, 2500000, 500000, 'open');
`;

// Insert the new tour before the GO command at the end if possible, or just append it.
let content = fs.readFileSync('h:\\\\BTL CNPM\\\\TravelTourDB_COMPLETE_Admin.sql', 'utf8');
content = content.replace("PRINT N'Database TravelTourDB", sqlText + "\nPRINT N'Database TravelTourDB");
fs.writeFileSync('h:\\\\BTL CNPM\\\\TravelTourDB_COMPLETE_Admin.sql', content, 'utf8');
