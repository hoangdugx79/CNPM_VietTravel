USE TravelTourDB;
GO

CREATE OR ALTER PROCEDURE sp_CreateBooking
    @BookingCode VARCHAR(80),
    @CustomerId BIGINT,
    @DepartureId BIGINT,
    @TransportServiceId BIGINT = NULL,
    @PickupPointId BIGINT = NULL,
    @CustomerFullName NVARCHAR(150),
    @CustomerPhone VARCHAR(20),
    @CustomerEmail VARCHAR(150),
    @AdultQuantity INT,
    @ChildQuantity INT,
    @InfantQuantity INT,
    @DoorToDoorAddress NVARCHAR(255) = NULL,
    @SeatNumbers NVARCHAR(255) = NULL,
    @Note NVARCHAR(500) = NULL,
    @PromoCode VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @TourId BIGINT, @Capacity INT, @BookedCount INT, @HoldCount INT;
        DECLARE @TotalPeople INT = @AdultQuantity + @ChildQuantity + @InfantQuantity;
        DECLARE @AdultPrice DECIMAL(18,2), @ChildPrice DECIMAL(18,2), @InfantPrice DECIMAL(18,2);
        DECLARE @TourAmount DECIMAL(18,2), @TransportAmount DECIMAL(18,2) = 0, @TotalAmount DECIMAL(18,2);
        DECLARE @StartDate DATETIME2, @EndDate DATETIME2, @TourCode VARCHAR(50), @TourTitle NVARCHAR(255);
        DECLARE @DurationDays INT, @DurationNights INT;

        SELECT
            @TourId = td.TourId,
            @Capacity = td.Capacity,
            @BookedCount = td.BookedCount,
            @HoldCount = td.HoldCount,
            @AdultPrice = td.AdultPrice,
            @ChildPrice = td.ChildPrice,
            @InfantPrice = td.InfantPrice,
            @StartDate = td.StartDate,
            @EndDate = td.EndDate,
            @TourCode = t.Code,
            @TourTitle = t.Title,
            @DurationDays = t.DurationDays,
            @DurationNights = t.DurationNights
        FROM TourDepartures td
        INNER JOIN Tours t ON td.TourId = t.TourId
        WHERE td.DepartureId = @DepartureId AND td.Status = 'open';

        IF @TourId IS NULL
            THROW 50001, N'Lịch khởi hành không tồn tại hoặc không mở bán.', 1;

        IF (@BookedCount + @HoldCount + @TotalPeople) > @Capacity
            THROW 50002, N'Lịch khởi hành không còn đủ chỗ.', 1;

        IF @TransportServiceId IS NOT NULL
        BEGIN
            DECLARE @SeatCapacity INT, @BookedSeats INT;
            DECLARE @AdultTransportPrice DECIMAL(18,2), @ChildTransportPrice DECIMAL(18,2), @IncludedInTour BIT;

            SELECT
                @SeatCapacity = SeatCapacity,
                @BookedSeats = BookedSeats,
                @AdultTransportPrice = AdultPrice,
                @ChildTransportPrice = ChildPrice,
                @IncludedInTour = IncludedInTour
            FROM TransportServices
            WHERE TransportServiceId = @TransportServiceId
              AND DepartureId = @DepartureId
              AND Status = 'open'
              AND AllowCustomerSelect = 1;

            IF @SeatCapacity IS NULL
                THROW 50003, N'Dịch vụ vận chuyển không tồn tại hoặc không khả dụng.', 1;

            IF (@BookedSeats + @TotalPeople) > @SeatCapacity
                THROW 50004, N'Dịch vụ vận chuyển không còn đủ chỗ.', 1;

            IF @IncludedInTour = 0
                SET @TransportAmount = (@AdultQuantity * @AdultTransportPrice) + (@ChildQuantity * @ChildTransportPrice);
        END

        SET @TourAmount = (@AdultQuantity * @AdultPrice) + (@ChildQuantity * @ChildPrice) + (@InfantQuantity * @InfantPrice);
        SET @TotalAmount = @TourAmount + @TransportAmount;

        -- XỬ LÝ KHUYẾN MÃI
        DECLARE @DiscountAmount DECIMAL(18,2) = 0;
        DECLARE @PromotionId BIGINT = NULL;

        IF @PromoCode IS NOT NULL AND LTRIM(RTRIM(@PromoCode)) <> ''
        BEGIN
            DECLARE @PromoDiscountType VARCHAR(30), @PromoDiscountValue DECIMAL(18,2);
            DECLARE @PromoMaxDiscount DECIMAL(18,2), @PromoMinOrder DECIMAL(18,2);
            DECLARE @PromoUsageLimit INT, @PromoUsedCount INT, @PromoStatus VARCHAR(30);
            DECLARE @PromoStartDate DATETIME2, @PromoEndDate DATETIME2;

            SELECT 
                @PromotionId = PromotionId,
                @PromoDiscountType = DiscountType,
                @PromoDiscountValue = DiscountValue,
                @PromoMaxDiscount = MaxDiscountAmount,
                @PromoMinOrder = MinOrderAmount,
                @PromoUsageLimit = UsageLimit,
                @PromoUsedCount = UsedCount,
                @PromoStatus = Status,
                @PromoStartDate = StartDate,
                @PromoEndDate = EndDate
            FROM Promotions
            WHERE Code = @PromoCode;

            IF @PromotionId IS NULL
                THROW 50005, N'Mã khuyến mãi không tồn tại.', 1;
            IF @PromoStatus <> 'active' OR @PromoStartDate > SYSDATETIME() OR @PromoEndDate < SYSDATETIME()
                THROW 50006, N'Mã khuyến mãi đã hết hạn hoặc không có hiệu lực.', 1;
            IF @PromoUsageLimit IS NOT NULL AND @PromoUsedCount >= @PromoUsageLimit
                THROW 50007, N'Mã khuyến mãi đã hết lượt sử dụng.', 1;
            IF @PromoMinOrder IS NOT NULL AND @TotalAmount < @PromoMinOrder
                THROW 50008, N'Đơn hàng chưa đạt giá trị tối thiểu để sử dụng mã này.', 1;

            -- Tính số tiền giảm
            IF @PromoDiscountType = 'percent'
            BEGIN
                SET @DiscountAmount = (@TotalAmount * @PromoDiscountValue) / 100.0;
                IF @PromoMaxDiscount IS NOT NULL AND @DiscountAmount > @PromoMaxDiscount
                    SET @DiscountAmount = @PromoMaxDiscount;
            END
            ELSE
            BEGIN
                SET @DiscountAmount = @PromoDiscountValue;
            END

            IF @DiscountAmount > @TotalAmount
                SET @DiscountAmount = @TotalAmount;

            -- Khấu trừ
            SET @TotalAmount = @TotalAmount - @DiscountAmount;
        END

        INSERT INTO Bookings (
            BookingCode, CustomerId, TourId, DepartureId,
            CustomerFullName, CustomerPhone, CustomerEmail,
            TourCodeSnapshot, TourTitleSnapshot, StartDateSnapshot, EndDateSnapshot,
            DurationDaysSnapshot, DurationNightsSnapshot,
            AdultQuantity, ChildQuantity, InfantQuantity,
            AdultPrice, ChildPrice, InfantPrice,
            TourAmount, TransportAmount, DiscountAmount, TaxAmount,
            TotalAmount, PaidAmount, RemainingAmount,
            PaymentStatus, Status, Note, ExpiredAt
        )
        VALUES (
            @BookingCode, @CustomerId, @TourId, @DepartureId,
            @CustomerFullName, @CustomerPhone, @CustomerEmail,
            @TourCode, @TourTitle, @StartDate, @EndDate,
            @DurationDays, @DurationNights,
            @AdultQuantity, @ChildQuantity, @InfantQuantity,
            @AdultPrice, @ChildPrice, @InfantPrice,
            @TourAmount, @TransportAmount, @DiscountAmount, 0,
            @TotalAmount, 0, @TotalAmount,
            'unpaid', 'pending', @Note, DATEADD(HOUR, 24, SYSDATETIME())
        );

        DECLARE @BookingId BIGINT = SCOPE_IDENTITY();

        -- Ghi nhận lịch sử dùng mã
        IF @PromotionId IS NOT NULL AND @DiscountAmount > 0
        BEGIN
            INSERT INTO PromotionUsages (PromotionId, BookingId, CustomerId, DiscountAmount)
            VALUES (@PromotionId, @BookingId, @CustomerId, @DiscountAmount);

            UPDATE Promotions
            SET UsedCount = UsedCount + 1,
                UpdatedAt = SYSDATETIME()
            WHERE PromotionId = @PromotionId;
        END

        IF @TransportServiceId IS NOT NULL
        BEGIN
            INSERT INTO BookingTransportSelections (
                BookingId, TransportServiceId,
                ServiceNameSnapshot, ModeSnapshot, ServiceTypeSnapshot, OwnershipTypeSnapshot, IncludedInTourSnapshot,
                DepartureTimeSnapshot, ArrivalTimeSnapshot,
                PickupPointId, PickupPointCodeSnapshot, PickupPointNameSnapshot, PickupAddressSnapshot,
                DoorToDoorAddress, SeatNumbers, ExtraFee
            )
            SELECT
                @BookingId, ts.TransportServiceId,
                ts.Name, ts.Mode, ts.ServiceType, ts.OwnershipType, ts.IncludedInTour,
                ts.DepartureTime, ts.ArrivalTime,
                pp.PickupPointId, pp.Code, pp.Name, pp.Address,
                @DoorToDoorAddress, @SeatNumbers, @TransportAmount
            FROM TransportServices ts
            LEFT JOIN PickupPoints pp ON pp.PickupPointId = @PickupPointId
            WHERE ts.TransportServiceId = @TransportServiceId;

            UPDATE TransportServices
            SET BookedSeats = BookedSeats + @TotalPeople,
                UpdatedAt = SYSDATETIME()
            WHERE TransportServiceId = @TransportServiceId;
        END

        UPDATE TourDepartures
        SET HoldCount = HoldCount + @TotalPeople,
            UpdatedAt = SYSDATETIME()
        WHERE DepartureId = @DepartureId;

        COMMIT TRANSACTION;
        SELECT @BookingId AS BookingId, @BookingCode AS BookingCode, @TotalAmount AS TotalAmount, @DiscountAmount AS DiscountAmount;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO
