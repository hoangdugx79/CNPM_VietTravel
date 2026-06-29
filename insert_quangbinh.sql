DECLARE @DestId BIGINT;

INSERT INTO Destinations (Name, Slug, Type, Province, Description, ImageUrl, Status)
VALUES (N'Quảng Bình', 'quang-binh', 'province', N'Quảng Bình', N'Vương quốc hang động với những kì quan thiên nhiên tuyệt đẹp.', '/uploads/quang_binh_tour.png', 'active');

SET @DestId = SCOPE_IDENTITY();

INSERT INTO Tours (Code, Title, Slug, DeparturePlaceName, DeparturePlaceType, DurationDays, DurationNights, BasePrice, ShortDescription, Description, MainImageUrl, RatingAvg, RatingCount, Status, CreatedBy)
VALUES ('QB-PN-3N2D', N'Khám phá Quảng Bình - Phong Nha Kẻ Bàng 3 ngày 2 đêm', 'kham-pha-quang-binh-phong-nha-ke-bang-3n2d', N'Hà Nội', 'city', 3, 2, 3890000, N'Hành trình khám phá vương quốc hang động Phong Nha - Kẻ Bàng.', N'<p>Hành trình khám phá vương quốc hang động Phong Nha - Kẻ Bàng, chiêm ngưỡng thạch nhũ tuyệt đẹp và tận hưởng làn nước mát lạnh tại Suối Nước Moọc.</p>', '/uploads/quang_binh_tour.png', 4.9, 120, 'active', 1);

DECLARE @TourId BIGINT;
SET @TourId = SCOPE_IDENTITY();

INSERT INTO TourDestinations (TourId, DestinationId)
VALUES (@TourId, @DestId);

INSERT INTO TourCategoryMaps (TourId, CategoryId)
VALUES (@TourId, 1);

INSERT INTO TourDepartures (TourId, StartDate, EndDate, Capacity, BookedCount, HoldCount, AdultPrice, ChildPrice, InfantPrice, Status)
VALUES (@TourId, '2026-07-10', '2026-07-12', 30, 0, 0, 3890000, 2500000, 500000, 'open');

INSERT INTO TourDepartures (TourId, StartDate, EndDate, Capacity, BookedCount, HoldCount, AdultPrice, ChildPrice, InfantPrice, Status)
VALUES (@TourId, '2026-07-15', '2026-07-17', 30, 0, 0, 3890000, 2500000, 500000, 'open');

INSERT INTO TourDepartures (TourId, StartDate, EndDate, Capacity, BookedCount, HoldCount, AdultPrice, ChildPrice, InfantPrice, Status)
VALUES (@TourId, '2026-07-25', '2026-07-27', 30, 0, 0, 3890000, 2500000, 500000, 'open');
