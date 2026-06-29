-- Insert sample Transport Providers
INSERT INTO TransportProviders (Name, Type, ServiceTypes, Status)
VALUES 
('VietTravel Transport', 'company', 'bus,limousine', 'active'),
('Hoang Long', 'partner', 'bus', 'active');

-- Get the IDs of the newly inserted providers
DECLARE @Provider1 BIGINT = (SELECT TOP 1 ProviderId FROM TransportProviders WHERE Name = 'VietTravel Transport');
DECLARE @Provider2 BIGINT = (SELECT TOP 1 ProviderId FROM TransportProviders WHERE Name = 'Hoang Long');

-- Insert sample Vehicles if they don't exist
IF NOT EXISTS (SELECT 1 FROM Vehicles WHERE VehicleCode = 'V-BUS-01')
BEGIN
    INSERT INTO Vehicles (ProviderId, VehicleCode, PlateNumber, Type, Brand, SeatCapacity, Status)
    VALUES 
    (@Provider1, 'V-BUS-01', '29B-123.45', 'bus', 'Thaco', 45, 'available'),
    (@Provider1, 'V-LIM-01', '29B-999.99', 'limousine', 'Ford Transit', 16, 'available'),
    (@Provider2, 'HL-BUS-01', '15B-678.90', 'bus', 'Hyundai Universe', 45, 'available');
END

DECLARE @Vehicle1 BIGINT = (SELECT TOP 1 VehicleId FROM Vehicles WHERE VehicleCode = 'V-BUS-01');
DECLARE @Vehicle2 BIGINT = (SELECT TOP 1 VehicleId FROM Vehicles WHERE VehicleCode = 'V-LIM-01');

-- Insert Transport Services for all existing open departures
DECLARE @DepartureId BIGINT, @TourId BIGINT;

DECLARE cur CURSOR FOR 
SELECT DepartureId, TourId FROM TourDepartures WHERE Status = 'open';

OPEN cur;
FETCH NEXT FROM cur INTO @DepartureId, @TourId;

WHILE @@FETCH_STATUS = 0
BEGIN
    IF NOT EXISTS (SELECT 1 FROM TransportServices WHERE DepartureId = @DepartureId AND ServiceType = 'tour_transfer')
    BEGIN
        -- Add a Bus option
        INSERT INTO TransportServices (DepartureId, TourId, ProviderId, VehicleId, ServiceCode, Name, Mode, ServiceType, OwnershipType, IncludedInTour, AdultPrice, ChildPrice, SeatCapacity, Status)
        VALUES (@DepartureId, @TourId, @Provider1, @Vehicle1, 'TR-' + CAST(@DepartureId AS VARCHAR) + '-BUS', N'Xe giường nằm cao cấp', 'bus', 'tour_transfer', 'company', 0, 300000, 200000, 45, 'open');

        -- Add a Limousine option
        INSERT INTO TransportServices (DepartureId, TourId, ProviderId, VehicleId, ServiceCode, Name, Mode, ServiceType, OwnershipType, IncludedInTour, AdultPrice, ChildPrice, SeatCapacity, Status)
        VALUES (@DepartureId, @TourId, @Provider1, @Vehicle2, 'TR-' + CAST(@DepartureId AS VARCHAR) + '-LIM', N'Xe Limousine 16 chỗ VIP', 'limousine', 'tour_transfer', 'company', 0, 500000, 400000, 16, 'open');
    END
    FETCH NEXT FROM cur INTO @DepartureId, @TourId;
END;

CLOSE cur;
DEALLOCATE cur;
