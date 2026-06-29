-- =======================================================
-- DATABASE: TravelTourDB
-- HỆ THỐNG BÁN TOUR DU LỊCH + VẬN TẢI / ĐƯA ĐÓN
-- SQL SERVER SCRIPT
-- Chạy trong SQL Server Management Studio hoặc Azure Data Studio
-- =======================================================

IF DB_ID(N'TravelTourDB') IS NULL
    CREATE DATABASE TravelTourDB;
GO

USE TravelTourDB;
GO

-- Xóa bảng cũ nếu chạy lại script
DROP TABLE IF EXISTS AuditLogs;
DROP TABLE IF EXISTS ChatMessages;
DROP TABLE IF EXISTS ChatConversations;
DROP TABLE IF EXISTS ChatBotFaqs;
DROP TABLE IF EXISTS SupportTicketReplies;
DROP TABLE IF EXISTS SupportTickets;
DROP TABLE IF EXISTS InvoiceItems;
DROP TABLE IF EXISTS Invoices;
DROP TABLE IF EXISTS Reviews;
DROP TABLE IF EXISTS PromotionTours;
DROP TABLE IF EXISTS Promotions;
DROP TABLE IF EXISTS Payments;
DROP TABLE IF EXISTS BookingTransportSelections;
DROP TABLE IF EXISTS BookingTravelers;
DROP TABLE IF EXISTS Bookings;
DROP TABLE IF EXISTS TransportServices;
DROP TABLE IF EXISTS PickupPoints;
DROP TABLE IF EXISTS TransportRoutes;
DROP TABLE IF EXISTS Drivers;
DROP TABLE IF EXISTS Vehicles;
DROP TABLE IF EXISTS TransportProviders;
DROP TABLE IF EXISTS TourDepartures;
DROP TABLE IF EXISTS TourItineraries;
DROP TABLE IF EXISTS TourDestinations;
DROP TABLE IF EXISTS TourCategoryMaps;
DROP TABLE IF EXISTS Tours;
DROP TABLE IF EXISTS TourCategories;
DROP TABLE IF EXISTS Destinations;
DROP TABLE IF EXISTS Users;
GO

-- =======================================================
-- 1. USERS
-- =======================================================
CREATE TABLE Users (
    UserId BIGINT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(150) NOT NULL,
    Email VARCHAR(150) NOT NULL UNIQUE,
    Phone VARCHAR(20) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NULL,
    Role VARCHAR(30) NOT NULL,
    Gender VARCHAR(20) NULL,
    DateOfBirth DATE NULL,
    Province NVARCHAR(100) NULL,
    District NVARCHAR(100) NULL,
    Ward NVARCHAR(100) NULL,
    AddressDetail NVARCHAR(255) NULL,
    AvatarUrl NVARCHAR(500) NULL,
    Status VARCHAR(30) NOT NULL DEFAULT 'active',
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT CK_Users_Role CHECK (Role IN ('customer','staff','admin','operator','guide','driver')),
    CONSTRAINT CK_Users_Gender CHECK (Gender IS NULL OR Gender IN ('male','female','other')),
    CONSTRAINT CK_Users_Status CHECK (Status IN ('active','inactive','blocked'))
);
GO
CREATE INDEX IX_Users_Role ON Users(Role);
CREATE INDEX IX_Users_Status ON Users(Status);
GO

-- =======================================================
-- 2. DESTINATIONS
-- =======================================================
CREATE TABLE Destinations (
    DestinationId BIGINT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(150) NOT NULL,
    Slug VARCHAR(200) NOT NULL UNIQUE,
    Type VARCHAR(50) NULL,
    Country NVARCHAR(100) NOT NULL,
    Province NVARCHAR(100) NULL,
    Description NVARCHAR(MAX) NULL,
    ImageUrl NVARCHAR(500) NULL,
    Latitude DECIMAL(10,7) NULL,
    Longitude DECIMAL(10,7) NULL,
    Status VARCHAR(30) NOT NULL DEFAULT 'active',
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT CK_Destinations_Status CHECK (Status IN ('active','inactive'))
);
GO

-- =======================================================
-- 3. TOUR CATEGORIES
-- =======================================================
CREATE TABLE TourCategories (
    CategoryId BIGINT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(150) NOT NULL,
    Slug VARCHAR(200) NOT NULL UNIQUE,
    Description NVARCHAR(MAX) NULL,
    Status VARCHAR(30) NOT NULL DEFAULT 'active',
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT CK_TourCategories_Status CHECK (Status IN ('active','inactive'))
);
GO

-- =======================================================
-- 4. TOURS
-- =======================================================
CREATE TABLE Tours (
    TourId BIGINT IDENTITY(1,1) PRIMARY KEY,
    Code VARCHAR(50) NOT NULL UNIQUE,
    Title NVARCHAR(255) NOT NULL,
    Slug VARCHAR(255) NOT NULL UNIQUE,
    DeparturePlaceName NVARCHAR(150) NULL,
    DeparturePlaceType VARCHAR(50) NULL,
    DurationDays INT NOT NULL,
    DurationNights INT NOT NULL,
    BasePrice DECIMAL(18,2) NOT NULL,
    ShortDescription NVARCHAR(500) NULL,
    Description NVARCHAR(MAX) NULL,
    IncludedServices NVARCHAR(MAX) NULL,
    ExcludedServices NVARCHAR(MAX) NULL,
    CancellationPolicy NVARCHAR(MAX) NULL,
    ChildPolicy NVARCHAR(MAX) NULL,
    PaymentPolicy NVARCHAR(MAX) NULL,
    MainImageUrl NVARCHAR(500) NULL,
    Tags NVARCHAR(500) NULL,
    RatingAvg DECIMAL(3,2) NOT NULL DEFAULT 0,
    RatingCount INT NOT NULL DEFAULT 0,
    Status VARCHAR(30) NOT NULL DEFAULT 'draft',
    CreatedBy BIGINT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT FK_Tours_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(UserId),
    CONSTRAINT CK_Tours_Status CHECK (Status IN ('draft','active','inactive','archived')),
    CONSTRAINT CK_Tours_Duration CHECK (DurationDays > 0 AND DurationNights >= 0),
    CONSTRAINT CK_Tours_BasePrice CHECK (BasePrice >= 0)
);
GO
CREATE INDEX IX_Tours_Status ON Tours(Status);
CREATE INDEX IX_Tours_BasePrice ON Tours(BasePrice);
GO

-- Tour - Category: nhiều nhiều
CREATE TABLE TourCategoryMaps (
    TourId BIGINT NOT NULL,
    CategoryId BIGINT NOT NULL,
    PRIMARY KEY (TourId, CategoryId),
    CONSTRAINT FK_TourCategoryMaps_Tours FOREIGN KEY (TourId) REFERENCES Tours(TourId),
    CONSTRAINT FK_TourCategoryMaps_Categories FOREIGN KEY (CategoryId) REFERENCES TourCategories(CategoryId)
);
GO

-- Tour - Destination: nhiều nhiều
CREATE TABLE TourDestinations (
    TourId BIGINT NOT NULL,
    DestinationId BIGINT NOT NULL,
    SortOrder INT NOT NULL DEFAULT 1,
    PRIMARY KEY (TourId, DestinationId),
    CONSTRAINT FK_TourDestinations_Tours FOREIGN KEY (TourId) REFERENCES Tours(TourId),
    CONSTRAINT FK_TourDestinations_Destinations FOREIGN KEY (DestinationId) REFERENCES Destinations(DestinationId)
);
GO

-- Lịch trình từng ngày
CREATE TABLE TourItineraries (
    ItineraryId BIGINT IDENTITY(1,1) PRIMARY KEY,
    TourId BIGINT NOT NULL,
    DayNumber INT NOT NULL,
    Title NVARCHAR(255) NOT NULL,
    Activities NVARCHAR(MAX) NULL,
    Breakfast BIT NOT NULL DEFAULT 0,
    Lunch BIT NOT NULL DEFAULT 0,
    Dinner BIT NOT NULL DEFAULT 0,
    Accommodation NVARCHAR(255) NULL,
    CONSTRAINT FK_TourItineraries_Tours FOREIGN KEY (TourId) REFERENCES Tours(TourId),
    CONSTRAINT CK_TourItineraries_Day CHECK (DayNumber > 0)
);
GO
CREATE INDEX IX_TourItineraries_TourId ON TourItineraries(TourId);
GO

-- =======================================================
-- 5. TOUR DEPARTURES
-- Lịch khởi hành cụ thể của tour
-- =======================================================
CREATE TABLE TourDepartures (
    DepartureId BIGINT IDENTITY(1,1) PRIMARY KEY,
    TourId BIGINT NOT NULL,
    DepartureCode VARCHAR(80) NOT NULL UNIQUE,
    StartDate DATETIME2 NOT NULL,
    EndDate DATETIME2 NOT NULL,
    Capacity INT NOT NULL,
    BookedCount INT NOT NULL DEFAULT 0,
    HoldCount INT NOT NULL DEFAULT 0,
    AdultPrice DECIMAL(18,2) NOT NULL,
    ChildPrice DECIMAL(18,2) NOT NULL,
    InfantPrice DECIMAL(18,2) NOT NULL DEFAULT 0,
    SingleRoomSurcharge DECIMAL(18,2) NULL,
    HasIncludedTransport BIT NOT NULL DEFAULT 0,
    AllowCustomerChoosePickup BIT NOT NULL DEFAULT 0,
    AllowPrivateTransfer BIT NOT NULL DEFAULT 0,
    TransportNote NVARCHAR(500) NULL,
    Status VARCHAR(30) NOT NULL DEFAULT 'open',
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT FK_TourDepartures_Tours FOREIGN KEY (TourId) REFERENCES Tours(TourId),
    CONSTRAINT CK_TourDepartures_Status CHECK (Status IN ('open','full','closed','cancelled','completed')),
    CONSTRAINT CK_TourDepartures_Date CHECK (EndDate > StartDate),
    CONSTRAINT CK_TourDepartures_Capacity CHECK (Capacity > 0),
    CONSTRAINT CK_TourDepartures_Count CHECK (BookedCount >= 0 AND HoldCount >= 0)
);
GO
CREATE INDEX IX_TourDepartures_TourId ON TourDepartures(TourId);
CREATE INDEX IX_TourDepartures_StartDate ON TourDepartures(StartDate);
CREATE INDEX IX_TourDepartures_Status ON TourDepartures(Status);
GO

-- =======================================================
-- 6. TRANSPORT PROVIDERS
-- Nhà cung cấp vận tải: công ty hoặc đối tác
-- =======================================================
CREATE TABLE TransportProviders (
    ProviderId BIGINT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(200) NOT NULL,
    Type VARCHAR(30) NOT NULL,
    ServiceTypes NVARCHAR(255) NULL,
    TaxCode VARCHAR(50) NULL,
    ContactPersonName NVARCHAR(150) NULL,
    ContactPhone VARCHAR(20) NULL,
    ContactEmail VARCHAR(150) NULL,
    ContactAddress NVARCHAR(255) NULL,
    ContractCode VARCHAR(100) NULL,
    ContractStartDate DATE NULL,
    ContractEndDate DATE NULL,
    ContractNote NVARCHAR(500) NULL,
    RatingAvg DECIMAL(3,2) NOT NULL DEFAULT 0,
    Status VARCHAR(30) NOT NULL DEFAULT 'active',
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT CK_TransportProviders_Type CHECK (Type IN ('company','partner')),
    CONSTRAINT CK_TransportProviders_Status CHECK (Status IN ('active','inactive','suspended'))
);
GO
CREATE INDEX IX_TransportProviders_Type ON TransportProviders(Type);
GO

-- =======================================================
-- 7. VEHICLES
-- =======================================================
CREATE TABLE Vehicles (
    VehicleId BIGINT IDENTITY(1,1) PRIMARY KEY,
    ProviderId BIGINT NOT NULL,
    VehicleCode VARCHAR(80) NOT NULL UNIQUE,
    PlateNumber VARCHAR(30) NOT NULL UNIQUE,
    Type VARCHAR(50) NOT NULL,
    Brand NVARCHAR(100) NULL,
    Model NVARCHAR(100) NULL,
    ManufactureYear INT NULL,
    SeatCapacity INT NOT NULL,
    LuggageCapacity INT NULL,
    Amenities NVARCHAR(500) NULL,
    ImageUrl NVARCHAR(500) NULL,
    InsurancePolicyNumber VARCHAR(100) NULL,
    InsuranceExpiryDate DATE NULL,
    LastMaintenanceDate DATE NULL,
    NextMaintenanceDate DATE NULL,
    MaintenanceNote NVARCHAR(500) NULL,
    Status VARCHAR(30) NOT NULL DEFAULT 'available',
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT FK_Vehicles_Providers FOREIGN KEY (ProviderId) REFERENCES TransportProviders(ProviderId),
    CONSTRAINT CK_Vehicles_Type CHECK (Type IN ('bus','limousine','private_car','van','train','flight','boat','motorbike')),
    CONSTRAINT CK_Vehicles_Status CHECK (Status IN ('available','in_use','maintenance','inactive')),
    CONSTRAINT CK_Vehicles_Capacity CHECK (SeatCapacity > 0)
);
GO
CREATE INDEX IX_Vehicles_ProviderId ON Vehicles(ProviderId);
CREATE INDEX IX_Vehicles_Type ON Vehicles(Type);
GO

-- =======================================================
-- 8. DRIVERS
-- =======================================================
CREATE TABLE Drivers (
    DriverId BIGINT IDENTITY(1,1) PRIMARY KEY,
    ProviderId BIGINT NOT NULL,
    UserId BIGINT NULL,
    FullName NVARCHAR(150) NOT NULL,
    Phone VARCHAR(20) NOT NULL,
    Email VARCHAR(150) NULL,
    LicenseNumber VARCHAR(100) NULL,
    LicenseClass VARCHAR(20) NULL,
    LicenseExpiryDate DATE NULL,
    ExperienceYears INT NULL,
    Status VARCHAR(30) NOT NULL DEFAULT 'available',
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT FK_Drivers_Providers FOREIGN KEY (ProviderId) REFERENCES TransportProviders(ProviderId),
    CONSTRAINT FK_Drivers_Users FOREIGN KEY (UserId) REFERENCES Users(UserId),
    CONSTRAINT CK_Drivers_Status CHECK (Status IN ('available','busy','inactive'))
);
GO
CREATE INDEX IX_Drivers_ProviderId ON Drivers(ProviderId);
GO

-- =======================================================
-- 9. TRANSPORT ROUTES + PICKUP POINTS
-- =======================================================
CREATE TABLE TransportRoutes (
    RouteId BIGINT IDENTITY(1,1) PRIMARY KEY,
    RouteCode VARCHAR(80) NOT NULL UNIQUE,
    Name NVARCHAR(200) NOT NULL,
    FromName NVARCHAR(150) NOT NULL,
    FromType VARCHAR(50) NULL,
    FromAddress NVARCHAR(255) NULL,
    FromLatitude DECIMAL(10,7) NULL,
    FromLongitude DECIMAL(10,7) NULL,
    ToName NVARCHAR(150) NOT NULL,
    ToType VARCHAR(50) NULL,
    ToAddress NVARCHAR(255) NULL,
    ToLatitude DECIMAL(10,7) NULL,
    ToLongitude DECIMAL(10,7) NULL,
    DistanceKm DECIMAL(10,2) NULL,
    EstimatedDurationMinutes INT NULL,
    Status VARCHAR(30) NOT NULL DEFAULT 'active',
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT CK_TransportRoutes_Status CHECK (Status IN ('active','inactive'))
);
GO

CREATE TABLE PickupPoints (
    PickupPointId BIGINT IDENTITY(1,1) PRIMARY KEY,
    RouteId BIGINT NOT NULL,
    Code VARCHAR(80) NOT NULL,
    Name NVARCHAR(200) NOT NULL,
    Address NVARCHAR(255) NOT NULL,
    PickupTimeOffsetMinutes INT NOT NULL DEFAULT 0,
    Latitude DECIMAL(10,7) NULL,
    Longitude DECIMAL(10,7) NULL,
    Status VARCHAR(30) NOT NULL DEFAULT 'active',
    CONSTRAINT FK_PickupPoints_Routes FOREIGN KEY (RouteId) REFERENCES TransportRoutes(RouteId),
    CONSTRAINT UQ_PickupPoints_Route_Code UNIQUE (RouteId, Code),
    CONSTRAINT CK_PickupPoints_Status CHECK (Status IN ('active','inactive'))
);
GO
CREATE INDEX IX_PickupPoints_RouteId ON PickupPoints(RouteId);
GO

-- =======================================================
-- 10. TRANSPORT SERVICES
-- Dịch vụ đưa đón/vận chuyển gắn với lịch khởi hành tour
-- =======================================================
CREATE TABLE TransportServices (
    TransportServiceId BIGINT IDENTITY(1,1) PRIMARY KEY,
    DepartureId BIGINT NOT NULL,
    TourId BIGINT NOT NULL,
    ProviderId BIGINT NOT NULL,
    VehicleId BIGINT NULL,
    DriverId BIGINT NULL,
    RouteId BIGINT NULL,
    ServiceCode VARCHAR(100) NOT NULL UNIQUE,
    Name NVARCHAR(255) NOT NULL,
    Mode VARCHAR(50) NOT NULL,
    ServiceType VARCHAR(50) NOT NULL,
    OwnershipType VARCHAR(30) NOT NULL,
    IncludedInTour BIT NOT NULL DEFAULT 0,
    AllowCustomerSelect BIT NOT NULL DEFAULT 1,
    AdultPrice DECIMAL(18,2) NOT NULL DEFAULT 0,
    ChildPrice DECIMAL(18,2) NOT NULL DEFAULT 0,
    PrivatePrice DECIMAL(18,2) NULL,
    DepartureTime DATETIME2 NULL,
    ArrivalTime DATETIME2 NULL,
    SeatCapacity INT NOT NULL,
    BookedSeats INT NOT NULL DEFAULT 0,
    AllowDoorToDoor BIT NOT NULL DEFAULT 0,
    AllowPickupPoint BIT NOT NULL DEFAULT 1,
    PickupPolicyNote NVARCHAR(500) NULL,
    Status VARCHAR(30) NOT NULL DEFAULT 'open',
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT FK_TransportServices_Departures FOREIGN KEY (DepartureId) REFERENCES TourDepartures(DepartureId),
    CONSTRAINT FK_TransportServices_Tours FOREIGN KEY (TourId) REFERENCES Tours(TourId),
    CONSTRAINT FK_TransportServices_Providers FOREIGN KEY (ProviderId) REFERENCES TransportProviders(ProviderId),
    CONSTRAINT FK_TransportServices_Vehicles FOREIGN KEY (VehicleId) REFERENCES Vehicles(VehicleId),
    CONSTRAINT FK_TransportServices_Drivers FOREIGN KEY (DriverId) REFERENCES Drivers(DriverId),
    CONSTRAINT FK_TransportServices_Routes FOREIGN KEY (RouteId) REFERENCES TransportRoutes(RouteId),
    CONSTRAINT CK_TransportServices_Mode CHECK (Mode IN ('bus','limousine','private_car','van','train','flight','boat','motorbike')),
    CONSTRAINT CK_TransportServices_ServiceType CHECK (ServiceType IN ('pickup','dropoff','tour_transfer','airport_transfer','intercity','flight','train','boat','private_transfer')),
    CONSTRAINT CK_TransportServices_Ownership CHECK (OwnershipType IN ('company','partner')),
    CONSTRAINT CK_TransportServices_Status CHECK (Status IN ('scheduled','open','full','cancelled','completed')),
    CONSTRAINT CK_TransportServices_Seat CHECK (SeatCapacity > 0 AND BookedSeats >= 0)
);
GO
CREATE INDEX IX_TransportServices_DepartureId ON TransportServices(DepartureId);
CREATE INDEX IX_TransportServices_TourId ON TransportServices(TourId);
CREATE INDEX IX_TransportServices_Departure_Status_Type ON TransportServices(DepartureId, Status, ServiceType);
GO

-- =======================================================
-- 11. BOOKINGS
-- =======================================================
CREATE TABLE Bookings (
    BookingId BIGINT IDENTITY(1,1) PRIMARY KEY,
    BookingCode VARCHAR(80) NOT NULL UNIQUE,
    CustomerId BIGINT NOT NULL,
    TourId BIGINT NOT NULL,
    DepartureId BIGINT NOT NULL,
    CustomerFullName NVARCHAR(150) NOT NULL,
    CustomerPhone VARCHAR(20) NOT NULL,
    CustomerEmail VARCHAR(150) NOT NULL,
    TourCodeSnapshot VARCHAR(50) NOT NULL,
    TourTitleSnapshot NVARCHAR(255) NOT NULL,
    StartDateSnapshot DATETIME2 NOT NULL,
    EndDateSnapshot DATETIME2 NOT NULL,
    DurationDaysSnapshot INT NOT NULL,
    DurationNightsSnapshot INT NOT NULL,
    AdultQuantity INT NOT NULL DEFAULT 0,
    ChildQuantity INT NOT NULL DEFAULT 0,
    InfantQuantity INT NOT NULL DEFAULT 0,
    AdultPrice DECIMAL(18,2) NOT NULL DEFAULT 0,
    ChildPrice DECIMAL(18,2) NOT NULL DEFAULT 0,
    InfantPrice DECIMAL(18,2) NOT NULL DEFAULT 0,
    TourAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    TransportAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    DiscountAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    TaxAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    TotalAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    PaidAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    RemainingAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    PaymentStatus VARCHAR(30) NOT NULL DEFAULT 'unpaid',
    Status VARCHAR(30) NOT NULL DEFAULT 'pending',
    Note NVARCHAR(500) NULL,
    ExpiredAt DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT FK_Bookings_Customers FOREIGN KEY (CustomerId) REFERENCES Users(UserId),
    CONSTRAINT FK_Bookings_Tours FOREIGN KEY (TourId) REFERENCES Tours(TourId),
    CONSTRAINT FK_Bookings_Departures FOREIGN KEY (DepartureId) REFERENCES TourDepartures(DepartureId),
    CONSTRAINT CK_Bookings_PaymentStatus CHECK (PaymentStatus IN ('unpaid','partial','paid','refunded','failed')),
    CONSTRAINT CK_Bookings_Status CHECK (Status IN ('pending','confirmed','cancelled','completed','expired','refunded')),
    CONSTRAINT CK_Bookings_Quantity CHECK (AdultQuantity >= 0 AND ChildQuantity >= 0 AND InfantQuantity >= 0)
);
GO
CREATE INDEX IX_Bookings_CustomerId ON Bookings(CustomerId);
CREATE INDEX IX_Bookings_DepartureId ON Bookings(DepartureId);
CREATE INDEX IX_Bookings_Status ON Bookings(Status);
CREATE INDEX IX_Bookings_CreatedAt ON Bookings(CreatedAt DESC);
GO

-- Người đi trong booking
CREATE TABLE BookingTravelers (
    TravelerId BIGINT IDENTITY(1,1) PRIMARY KEY,
    BookingId BIGINT NOT NULL,
    FullName NVARCHAR(150) NOT NULL,
    Gender VARCHAR(20) NULL,
    DateOfBirth DATE NULL,
    TravelerType VARCHAR(30) NOT NULL,
    IdentityType VARCHAR(30) NULL,
    IdentityNumber VARCHAR(50) NULL,
    Phone VARCHAR(20) NULL,
    Note NVARCHAR(500) NULL,
    CONSTRAINT FK_BookingTravelers_Bookings FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId),
    CONSTRAINT CK_BookingTravelers_Type CHECK (TravelerType IN ('adult','child','infant'))
);
GO
CREATE INDEX IX_BookingTravelers_BookingId ON BookingTravelers(BookingId);
GO

-- Lựa chọn vận chuyển của booking
CREATE TABLE BookingTransportSelections (
    BookingTransportSelectionId BIGINT IDENTITY(1,1) PRIMARY KEY,
    BookingId BIGINT NOT NULL UNIQUE,
    TransportServiceId BIGINT NOT NULL,
    ServiceNameSnapshot NVARCHAR(255) NOT NULL,
    ModeSnapshot VARCHAR(50) NOT NULL,
    ServiceTypeSnapshot VARCHAR(50) NOT NULL,
    OwnershipTypeSnapshot VARCHAR(30) NOT NULL,
    IncludedInTourSnapshot BIT NOT NULL,
    DepartureTimeSnapshot DATETIME2 NULL,
    ArrivalTimeSnapshot DATETIME2 NULL,
    PickupPointId BIGINT NULL,
    PickupPointCodeSnapshot VARCHAR(80) NULL,
    PickupPointNameSnapshot NVARCHAR(200) NULL,
    PickupAddressSnapshot NVARCHAR(255) NULL,
    DoorToDoorAddress NVARCHAR(255) NULL,
    SeatNumbers NVARCHAR(255) NULL,
    ExtraFee DECIMAL(18,2) NOT NULL DEFAULT 0,
    CONSTRAINT FK_BookingTransportSelections_Bookings FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId),
    CONSTRAINT FK_BookingTransportSelections_TransportServices FOREIGN KEY (TransportServiceId) REFERENCES TransportServices(TransportServiceId),
    CONSTRAINT FK_BookingTransportSelections_PickupPoints FOREIGN KEY (PickupPointId) REFERENCES PickupPoints(PickupPointId)
);
GO
CREATE INDEX IX_BookingTransportSelections_ServiceId ON BookingTransportSelections(TransportServiceId);
GO

-- =======================================================
-- 12. PAYMENTS
-- =======================================================
CREATE TABLE Payments (
    PaymentId BIGINT IDENTITY(1,1) PRIMARY KEY,
    PaymentCode VARCHAR(80) NOT NULL UNIQUE,
    BookingId BIGINT NOT NULL,
    CustomerId BIGINT NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,
    Method VARCHAR(50) NOT NULL,
    Provider NVARCHAR(100) NULL,
    TransactionRef VARCHAR(150) NULL UNIQUE,
    Status VARCHAR(30) NOT NULL DEFAULT 'pending',
    PaidAt DATETIME2 NULL,
    Note NVARCHAR(500) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT FK_Payments_Bookings FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId),
    CONSTRAINT FK_Payments_Customers FOREIGN KEY (CustomerId) REFERENCES Users(UserId),
    CONSTRAINT CK_Payments_Method CHECK (Method IN ('cash','bank_transfer','momo','vnpay','zalopay','credit_card')),
    CONSTRAINT CK_Payments_Status CHECK (Status IN ('pending','success','failed','cancelled','refunded'))
);
GO
CREATE INDEX IX_Payments_BookingId ON Payments(BookingId);
CREATE INDEX IX_Payments_Status ON Payments(Status);
GO

-- =======================================================
-- 13. PROMOTIONS / REVIEWS / INVOICES / SUPPORT / AUDIT
-- =======================================================
CREATE TABLE Promotions (
    PromotionId BIGINT IDENTITY(1,1) PRIMARY KEY,
    Code VARCHAR(80) NOT NULL UNIQUE,
    Name NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    DiscountType VARCHAR(30) NOT NULL,
    DiscountValue DECIMAL(18,2) NOT NULL,
    MaxDiscountAmount DECIMAL(18,2) NULL,
    MinOrderAmount DECIMAL(18,2) NULL,
    StartDate DATETIME2 NOT NULL,
    EndDate DATETIME2 NOT NULL,
    UsageLimit INT NULL,
    UsedCount INT NOT NULL DEFAULT 0,
    Status VARCHAR(30) NOT NULL DEFAULT 'active',
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT CK_Promotions_DiscountType CHECK (DiscountType IN ('percent','fixed')),
    CONSTRAINT CK_Promotions_Status CHECK (Status IN ('active','inactive','expired'))
);
GO
CREATE TABLE PromotionTours (
    PromotionId BIGINT NOT NULL,
    TourId BIGINT NOT NULL,
    PRIMARY KEY (PromotionId, TourId),
    CONSTRAINT FK_PromotionTours_Promotions FOREIGN KEY (PromotionId) REFERENCES Promotions(PromotionId),
    CONSTRAINT FK_PromotionTours_Tours FOREIGN KEY (TourId) REFERENCES Tours(TourId)
);
GO
CREATE TABLE Reviews (
    ReviewId BIGINT IDENTITY(1,1) PRIMARY KEY,
    TourId BIGINT NOT NULL,
    BookingId BIGINT NOT NULL UNIQUE,
    CustomerId BIGINT NOT NULL,
    Rating INT NOT NULL,
    Comment NVARCHAR(MAX) NULL,
    ImageUrl NVARCHAR(500) NULL,
    Status VARCHAR(30) NOT NULL DEFAULT 'pending',
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT FK_Reviews_Tours FOREIGN KEY (TourId) REFERENCES Tours(TourId),
    CONSTRAINT FK_Reviews_Bookings FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId),
    CONSTRAINT FK_Reviews_Customers FOREIGN KEY (CustomerId) REFERENCES Users(UserId),
    CONSTRAINT CK_Reviews_Rating CHECK (Rating BETWEEN 1 AND 5),
    CONSTRAINT CK_Reviews_Status CHECK (Status IN ('visible','hidden','pending'))
);
GO
CREATE TABLE Invoices (
    InvoiceId BIGINT IDENTITY(1,1) PRIMARY KEY,
    InvoiceCode VARCHAR(80) NOT NULL UNIQUE,
    BookingId BIGINT NOT NULL,
    CustomerId BIGINT NOT NULL,
    BuyerFullName NVARCHAR(150) NULL,
    BuyerEmail VARCHAR(150) NULL,
    BuyerPhone VARCHAR(20) NULL,
    BuyerTaxCode VARCHAR(50) NULL,
    BuyerAddress NVARCHAR(255) NULL,
    TotalAmount DECIMAL(18,2) NOT NULL,
    Status VARCHAR(30) NOT NULL DEFAULT 'draft',
    IssuedAt DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Invoices_Bookings FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId),
    CONSTRAINT FK_Invoices_Customers FOREIGN KEY (CustomerId) REFERENCES Users(UserId),
    CONSTRAINT CK_Invoices_Status CHECK (Status IN ('draft','issued','cancelled'))
);
GO
CREATE TABLE InvoiceItems (
    InvoiceItemId BIGINT IDENTITY(1,1) PRIMARY KEY,
    InvoiceId BIGINT NOT NULL,
    ItemName NVARCHAR(255) NOT NULL,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,
    CONSTRAINT FK_InvoiceItems_Invoices FOREIGN KEY (InvoiceId) REFERENCES Invoices(InvoiceId)
);
GO
CREATE TABLE SupportTickets (
    TicketId BIGINT IDENTITY(1,1) PRIMARY KEY,
    CustomerId BIGINT NOT NULL,
    BookingId BIGINT NULL,
    Subject NVARCHAR(255) NOT NULL,
    Message NVARCHAR(MAX) NOT NULL,
    Status VARCHAR(30) NOT NULL DEFAULT 'open',
    Priority VARCHAR(30) NOT NULL DEFAULT 'medium',
    AssignedStaffId BIGINT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT FK_SupportTickets_Customers FOREIGN KEY (CustomerId) REFERENCES Users(UserId),
    CONSTRAINT FK_SupportTickets_Bookings FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId),
    CONSTRAINT FK_SupportTickets_Staff FOREIGN KEY (AssignedStaffId) REFERENCES Users(UserId),
    CONSTRAINT CK_SupportTickets_Status CHECK (Status IN ('open','processing','resolved','closed')),
    CONSTRAINT CK_SupportTickets_Priority CHECK (Priority IN ('low','medium','high','urgent'))
);
GO
CREATE TABLE SupportTicketReplies (
    ReplyId BIGINT IDENTITY(1,1) PRIMARY KEY,
    TicketId BIGINT NOT NULL,
    SenderId BIGINT NOT NULL,
    Message NVARCHAR(MAX) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_SupportTicketReplies_Tickets FOREIGN KEY (TicketId) REFERENCES SupportTickets(TicketId),
    CONSTRAINT FK_SupportTicketReplies_Users FOREIGN KEY (SenderId) REFERENCES Users(UserId)
);
GO
CREATE TABLE ChatConversations (
    ConversationId BIGINT IDENTITY(1,1) PRIMARY KEY,
    CustomerId BIGINT NULL,
    GuestName NVARCHAR(150) NULL,
    GuestEmail VARCHAR(150) NULL,
    GuestPhone VARCHAR(20) NULL,
    AssignedStaffId BIGINT NULL,
    Status VARCHAR(30) NOT NULL DEFAULT 'open',
    LastMessageAt DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT FK_ChatConversations_Customers FOREIGN KEY (CustomerId) REFERENCES Users(UserId),
    CONSTRAINT FK_ChatConversations_Staff FOREIGN KEY (AssignedStaffId) REFERENCES Users(UserId),
    CONSTRAINT CK_ChatConversations_Status CHECK (Status IN ('open','pending','resolved','closed'))
);
GO
CREATE INDEX IX_ChatConversations_Status ON ChatConversations(Status);
CREATE INDEX IX_ChatConversations_CustomerId ON ChatConversations(CustomerId);
GO
CREATE TABLE ChatMessages (
    MessageId BIGINT IDENTITY(1,1) PRIMARY KEY,
    ConversationId BIGINT NOT NULL,
    SenderId BIGINT NULL,
    SenderType VARCHAR(30) NOT NULL,
    Message NVARCHAR(MAX) NOT NULL,
    IsSeen BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_ChatMessages_Conversations FOREIGN KEY (ConversationId) REFERENCES ChatConversations(ConversationId),
    CONSTRAINT FK_ChatMessages_Users FOREIGN KEY (SenderId) REFERENCES Users(UserId),
    CONSTRAINT CK_ChatMessages_SenderType CHECK (SenderType IN ('customer','guest','bot','staff','admin'))
);
GO
CREATE INDEX IX_ChatMessages_ConversationId ON ChatMessages(ConversationId, CreatedAt);
GO
CREATE TABLE ChatBotFaqs (
    FaqId BIGINT IDENTITY(1,1) PRIMARY KEY,
    Question NVARCHAR(500) NOT NULL,
    Keywords NVARCHAR(1000) NOT NULL,
    Answer NVARCHAR(MAX) NOT NULL,
    Status VARCHAR(30) NOT NULL DEFAULT 'active',
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT CK_ChatBotFaqs_Status CHECK (Status IN ('active','inactive','deleted'))
);
GO
CREATE INDEX IX_ChatBotFaqs_Status ON ChatBotFaqs(Status);
GO
CREATE TABLE AuditLogs (
    AuditLogId BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId BIGINT NULL,
    Action VARCHAR(100) NOT NULL,
    Module VARCHAR(100) NOT NULL,
    TargetId BIGINT NULL,
    OldValue NVARCHAR(MAX) NULL,
    NewValue NVARCHAR(MAX) NULL,
    IpAddress VARCHAR(50) NULL,
    UserAgent NVARCHAR(500) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_AuditLogs_Users FOREIGN KEY (UserId) REFERENCES Users(UserId)
);
GO

-- =======================================================
-- STORED PROCEDURE: TẠO BOOKING CÓ TRANSACTION
-- =======================================================
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
    @TravelersJson NVARCHAR(MAX) = NULL
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
            @TourAmount, @TransportAmount, 0, 0,
            @TotalAmount, 0, @TotalAmount,
            'unpaid', 'pending', @Note, DATEADD(HOUR, 24, SYSDATETIME())
        );

        DECLARE @BookingId BIGINT = SCOPE_IDENTITY();

        IF @TravelersJson IS NOT NULL AND ISJSON(@TravelersJson) = 1
        BEGIN
            INSERT INTO BookingTravelers (
                BookingId, FullName, Gender, DateOfBirth, TravelerType,
                IdentityType, IdentityNumber, Phone, Note
            )
            SELECT
                @BookingId,
                FullName,
                Gender,
                TRY_CONVERT(DATE, DateOfBirth),
                TravelerType,
                IdentityType,
                IdentityNumber,
                Phone,
                Note
            FROM OPENJSON(@TravelersJson)
            WITH (
                FullName NVARCHAR(150) '$.FullName',
                Gender VARCHAR(20) '$.Gender',
                DateOfBirth NVARCHAR(30) '$.DateOfBirth',
                TravelerType VARCHAR(20) '$.TravelerType',
                IdentityType VARCHAR(30) '$.IdentityType',
                IdentityNumber VARCHAR(50) '$.IdentityNumber',
                Phone VARCHAR(20) '$.Phone',
                Note NVARCHAR(500) '$.Note'
            )
            WHERE FullName IS NOT NULL AND TravelerType IN ('adult','child','infant');
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
        SELECT @BookingId AS BookingId, @BookingCode AS BookingCode, @TotalAmount AS TotalAmount;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- =======================================================
-- STORED PROCEDURE: THANH TOÁN BOOKING
-- =======================================================
CREATE OR ALTER PROCEDURE sp_PayBooking
    @PaymentCode VARCHAR(80),
    @BookingId BIGINT,
    @Amount DECIMAL(18,2),
    @Method VARCHAR(50),
    @Provider NVARCHAR(100) = NULL,
    @TransactionRef VARCHAR(150) = NULL,
    @Note NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @CustomerId BIGINT, @DepartureId BIGINT;
        DECLARE @AdultQuantity INT, @ChildQuantity INT, @InfantQuantity INT, @TotalPeople INT;
        DECLARE @TotalAmount DECIMAL(18,2), @PaidAmount DECIMAL(18,2);

        SELECT
            @CustomerId = CustomerId,
            @DepartureId = DepartureId,
            @AdultQuantity = AdultQuantity,
            @ChildQuantity = ChildQuantity,
            @InfantQuantity = InfantQuantity,
            @TotalAmount = TotalAmount,
            @PaidAmount = PaidAmount
        FROM Bookings
        WHERE BookingId = @BookingId AND Status IN ('pending','confirmed');

        IF @CustomerId IS NULL
            THROW 51001, N'Booking không tồn tại hoặc không thể thanh toán.', 1;

        SET @TotalPeople = @AdultQuantity + @ChildQuantity + @InfantQuantity;

        INSERT INTO Payments (PaymentCode, BookingId, CustomerId, Amount, Method, Provider, TransactionRef, Status, PaidAt, Note)
        VALUES (@PaymentCode, @BookingId, @CustomerId, @Amount, @Method, @Provider, @TransactionRef, 'success', SYSDATETIME(), @Note);

        DECLARE @NewPaidAmount DECIMAL(18,2) = @PaidAmount + @Amount;
        DECLARE @NewRemainingAmount DECIMAL(18,2) = @TotalAmount - @NewPaidAmount;
        IF @NewRemainingAmount < 0 SET @NewRemainingAmount = 0;

        UPDATE Bookings
        SET PaidAmount = @NewPaidAmount,
            RemainingAmount = @NewRemainingAmount,
            PaymentStatus = CASE
                WHEN @NewPaidAmount >= @TotalAmount THEN 'paid'
                WHEN @NewPaidAmount > 0 THEN 'partial'
                ELSE 'unpaid'
            END,
            Status = CASE WHEN @NewPaidAmount > 0 THEN 'confirmed' ELSE Status END,
            UpdatedAt = SYSDATETIME()
        WHERE BookingId = @BookingId;

        IF @PaidAmount = 0 AND @Amount > 0
        BEGIN
            UPDATE TourDepartures
            SET BookedCount = BookedCount + @TotalPeople,
                HoldCount = CASE WHEN HoldCount >= @TotalPeople THEN HoldCount - @TotalPeople ELSE 0 END,
                UpdatedAt = SYSDATETIME()
            WHERE DepartureId = @DepartureId;
        END

        COMMIT TRANSACTION;
        SELECT @BookingId AS BookingId, @NewPaidAmount AS PaidAmount, @NewRemainingAmount AS RemainingAmount;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- =======================================================
-- SEED DATA MẪU
-- =======================================================
INSERT INTO Users (FullName, Email, Phone, PasswordHash, Role, Gender, DateOfBirth, Province, District, Ward, AddressDetail, Status)
VALUES
(N'Nguyễn Văn A', 'vana@gmail.com', '0909123456', 'hashed_password_customer', 'customer', 'male', '2000-01-01', N'Hà Nội', N'Hoàn Kiếm', N'Tràng Tiền', N'Số 1 Tràng Tiền', 'active'),
(N'Quản trị viên', 'admin@travel.com', '0999999999', 'hashed_password_admin', 'admin', NULL, NULL, NULL, NULL, NULL, NULL, 'active'),
(N'Lê Văn Tài', 'driver@example.com', '0988777666', 'hashed_password_driver', 'driver', 'male', '1985-05-05', N'Hà Nội', NULL, NULL, NULL, 'active');
GO

INSERT INTO Destinations (Name, Slug, Type, Country, Province, Description, Latitude, Longitude, Status)
VALUES
(N'Đà Nẵng', 'da-nang', 'city', N'Việt Nam', N'Đà Nẵng', N'Thành phố biển nổi tiếng miền Trung.', 16.047079, 108.206230, 'active'),
(N'Hội An', 'hoi-an', 'city', N'Việt Nam', N'Quảng Nam', N'Phố cổ nổi tiếng với kiến trúc và văn hóa truyền thống.', 15.880058, 108.338047, 'active');
GO

INSERT INTO TourCategories (Name, Slug, Description, Status)
VALUES
(N'Tour trong nước', 'tour-trong-nuoc', N'Các tour du lịch nội địa Việt Nam', 'active'),
(N'Tour nghỉ dưỡng', 'tour-nghi-duong', N'Các tour nghỉ dưỡng dành cho gia đình và doanh nghiệp', 'active');
GO

DECLARE @AdminId BIGINT = (SELECT UserId FROM Users WHERE Email = 'admin@travel.com');
INSERT INTO Tours (
    Code, Title, Slug, DeparturePlaceName, DeparturePlaceType,
    DurationDays, DurationNights, BasePrice,
    ShortDescription, Description, IncludedServices, ExcludedServices,
    CancellationPolicy, ChildPolicy, PaymentPolicy, Tags, Status, CreatedBy
)
VALUES (
    'TOUR-DN-HA-3N2D', N'Tour Đà Nẵng - Hội An 3 ngày 2 đêm', 'tour-da-nang-hoi-an-3-ngay-2-dem',
    N'Hà Nội', 'city', 3, 2, 3990000,
    N'Khám phá Đà Nẵng, Hội An, Bà Nà Hills.',
    N'Tour trọn gói bao gồm khách sạn, ăn uống, vé tham quan và xe đưa đón.',
    N'Khách sạn; Ăn uống theo chương trình; Vé tham quan; Hướng dẫn viên; Xe đưa đón theo lịch trình',
    N'Chi phí cá nhân; VAT; Tiền tip; Dịch vụ ngoài chương trình',
    N'Hủy trước 7 ngày hoàn 70%',
    N'Trẻ em dưới 5 tuổi miễn phí, từ 5-10 tuổi tính 70%',
    N'Thanh toán tối thiểu 50% khi đặt tour',
    N'biển, gia đình, nghỉ dưỡng', 'active', @AdminId
);
GO

DECLARE @TourId BIGINT = (SELECT TourId FROM Tours WHERE Code = 'TOUR-DN-HA-3N2D');
DECLARE @CategoryId BIGINT = (SELECT CategoryId FROM TourCategories WHERE Slug = 'tour-trong-nuoc');
DECLARE @DaNangId BIGINT = (SELECT DestinationId FROM Destinations WHERE Slug = 'da-nang');
DECLARE @HoiAnId BIGINT = (SELECT DestinationId FROM Destinations WHERE Slug = 'hoi-an');
INSERT INTO TourCategoryMaps (TourId, CategoryId) VALUES (@TourId, @CategoryId);
INSERT INTO TourDestinations (TourId, DestinationId, SortOrder) VALUES (@TourId, @DaNangId, 1), (@TourId, @HoiAnId, 2);
INSERT INTO TourItineraries (TourId, DayNumber, Title, Activities, Breakfast, Lunch, Dinner, Accommodation)
VALUES
(@TourId, 1, N'Hà Nội - Đà Nẵng - Sơn Trà', N'Đón khách tại sân bay Đà Nẵng; Tham quan bán đảo Sơn Trà; Ăn tối tại nhà hàng địa phương', 0, 1, 1, N'Khách sạn 3 sao Đà Nẵng'),
(@TourId, 2, N'Bà Nà Hills - Hội An', N'Tham quan Bà Nà Hills; Check-in Cầu Vàng; Buổi tối tham quan phố cổ Hội An', 1, 1, 1, N'Khách sạn 3 sao Đà Nẵng'),
(@TourId, 3, N'Đà Nẵng - Hà Nội', N'Tự do tắm biển; Mua đặc sản; Tiễn khách ra sân bay', 1, 0, 0, NULL);
GO

DECLARE @TourId2 BIGINT = (SELECT TourId FROM Tours WHERE Code = 'TOUR-DN-HA-3N2D');
INSERT INTO TourDepartures (
    TourId, DepartureCode, StartDate, EndDate, Capacity, BookedCount, HoldCount,
    AdultPrice, ChildPrice, InfantPrice, SingleRoomSurcharge,
    HasIncludedTransport, AllowCustomerChoosePickup, AllowPrivateTransfer, TransportNote, Status
)
VALUES (
    @TourId2, 'DNHA-20260701', '2026-07-01T07:00:00', '2026-07-03T18:00:00', 40, 0, 0,
    3990000, 2790000, 0, 800000, 1, 1, 1, N'Tour bao gồm xe đưa đón theo điểm hẹn. Xe riêng tính phí thêm.', 'open'
);
GO

INSERT INTO TransportProviders (Name, Type, ServiceTypes, TaxCode, ContactPersonName, ContactPhone, ContactEmail, ContactAddress, ContractCode, ContractStartDate, ContractEndDate, ContractNote, RatingAvg, Status)
VALUES
(N'Công ty Du lịch Minh Travel', 'company', N'bus, limousine, private_car', '0101234567', N'Trần Văn B', '0911222333', 'transport@minhtravel.vn', N'Hà Nội', 'HDVT-2026-001', '2026-01-01', '2026-12-31', N'Hợp đồng cung cấp xe du lịch', 4.6, 'active'),
(N'Đối tác Limousine ABC', 'partner', N'limousine, private_car', '0107654321', N'Phạm Văn C', '0988888888', 'abc-limousine@example.com', N'Hà Nội', 'HDVT-2026-ABC', '2026-01-01', '2026-12-31', N'Hợp đồng vận chuyển đối tác', 4.4, 'active');
GO

DECLARE @CompanyProviderId BIGINT = (SELECT ProviderId FROM TransportProviders WHERE Name = N'Công ty Du lịch Minh Travel');
DECLARE @PartnerProviderId BIGINT = (SELECT ProviderId FROM TransportProviders WHERE Name = N'Đối tác Limousine ABC');
INSERT INTO Vehicles (ProviderId, VehicleCode, PlateNumber, Type, Brand, Model, ManufactureYear, SeatCapacity, LuggageCapacity, Amenities, InsurancePolicyNumber, InsuranceExpiryDate, LastMaintenanceDate, NextMaintenanceDate, MaintenanceNote, Status)
VALUES
(@CompanyProviderId, 'XE-45C-001', '30F-12345', 'bus', N'Hyundai', N'Universe', 2022, 45, 40, N'Máy lạnh; Wifi; Nước uống; Ghế ngả', 'BH-2026-001', '2026-12-31', '2026-05-01', '2026-08-01', N'Đã kiểm tra định kỳ', 'available'),
(@PartnerProviderId, 'LIMO-09C-001', '30L-99999', 'limousine', N'Ford', N'Transit Limousine', 2023, 9, 9, N'Máy lạnh; Wifi; Nước uống; Ghế massage', 'BH-2026-002', '2026-12-31', '2026-05-10', '2026-08-10', N'Đã kiểm tra định kỳ', 'available');
GO

DECLARE @CompanyProviderId2 BIGINT = (SELECT ProviderId FROM TransportProviders WHERE Name = N'Công ty Du lịch Minh Travel');
DECLARE @DriverUserId BIGINT = (SELECT UserId FROM Users WHERE Email = 'driver@example.com');
INSERT INTO Drivers (ProviderId, UserId, FullName, Phone, Email, LicenseNumber, LicenseClass, LicenseExpiryDate, ExperienceYears, Status)
VALUES (@CompanyProviderId2, @DriverUserId, N'Lê Văn Tài', '0988777666', 'driver@example.com', 'GPLX-123456789', 'D', '2028-12-31', 8, 'available');
GO

INSERT INTO TransportRoutes (RouteCode, Name, FromName, FromType, FromAddress, FromLatitude, FromLongitude, ToName, ToType, ToAddress, ToLatitude, ToLongitude, DistanceKm, EstimatedDurationMinutes, Status)
VALUES ('HN-NB-AIRPORT', N'Hà Nội - Sân bay Nội Bài', N'Trung tâm Hà Nội', 'city', N'Hoàn Kiếm, Hà Nội', 21.028511, 105.804817, N'Sân bay Nội Bài', 'airport', N'Phú Minh, Sóc Sơn, Hà Nội', 21.214184, 105.802826, 30, 45, 'active');
GO

DECLARE @RouteId BIGINT = (SELECT RouteId FROM TransportRoutes WHERE RouteCode = 'HN-NB-AIRPORT');
INSERT INTO PickupPoints (RouteId, Code, Name, Address, PickupTimeOffsetMinutes, Latitude, Longitude, Status)
VALUES
(@RouteId, 'HN-OPERA', N'Nhà hát lớn Hà Nội', N'Số 1 Tràng Tiền, Hoàn Kiếm, Hà Nội', 0, 21.024500, 105.857200, 'active'),
(@RouteId, 'HN-ROYAL', N'Royal City', N'72A Nguyễn Trãi, Thanh Xuân, Hà Nội', 20, 21.002900, 105.815500, 'active');
GO

DECLARE @TourId3 BIGINT = (SELECT TourId FROM Tours WHERE Code = 'TOUR-DN-HA-3N2D');
DECLARE @DepartureId BIGINT = (SELECT DepartureId FROM TourDepartures WHERE DepartureCode = 'DNHA-20260701');
DECLARE @CompanyProviderId3 BIGINT = (SELECT ProviderId FROM TransportProviders WHERE Name = N'Công ty Du lịch Minh Travel');
DECLARE @PartnerProviderId3 BIGINT = (SELECT ProviderId FROM TransportProviders WHERE Name = N'Đối tác Limousine ABC');
DECLARE @BusId BIGINT = (SELECT VehicleId FROM Vehicles WHERE VehicleCode = 'XE-45C-001');
DECLARE @LimoId BIGINT = (SELECT VehicleId FROM Vehicles WHERE VehicleCode = 'LIMO-09C-001');
DECLARE @DriverId BIGINT = (SELECT DriverId FROM Drivers WHERE Phone = '0988777666');
DECLARE @RouteId2 BIGINT = (SELECT RouteId FROM TransportRoutes WHERE RouteCode = 'HN-NB-AIRPORT');
INSERT INTO TransportServices (DepartureId, TourId, ProviderId, VehicleId, DriverId, RouteId, ServiceCode, Name, Mode, ServiceType, OwnershipType, IncludedInTour, AllowCustomerSelect, AdultPrice, ChildPrice, PrivatePrice, DepartureTime, ArrivalTime, SeatCapacity, BookedSeats, AllowDoorToDoor, AllowPickupPoint, PickupPolicyNote, Status)
VALUES
(@DepartureId, @TourId3, @CompanyProviderId3, @BusId, @DriverId, @RouteId2, 'TR-DNHA-20260701-BUS01', N'Xe đưa đón Hà Nội - Sân bay Nội Bài', 'bus', 'pickup', 'company', 1, 1, 0, 0, 500000, '2026-07-01T05:30:00', '2026-07-01T06:30:00', 45, 0, 0, 1, N'Khách tập trung tại điểm hẹn trước 15 phút', 'open'),
(@DepartureId, @TourId3, @PartnerProviderId3, @LimoId, NULL, @RouteId2, 'TR-DNHA-20260701-LIMO01', N'Limousine đón tận nơi Hà Nội - Sân bay Nội Bài', 'limousine', 'private_transfer', 'partner', 0, 1, 250000, 200000, 1200000, '2026-07-01T05:00:00', '2026-07-01T06:15:00', 9, 0, 1, 1, N'Dịch vụ đón tận nơi có tính phí thêm', 'open');
GO

DECLARE @TourId4 BIGINT = (SELECT TourId FROM Tours WHERE Code = 'TOUR-DN-HA-3N2D');
INSERT INTO Promotions (Code, Name, Description, DiscountType, DiscountValue, MaxDiscountAmount, MinOrderAmount, StartDate, EndDate, UsageLimit, UsedCount, Status)
VALUES ('SUMMER2026', N'Giảm giá hè 2026', N'Giảm 10% cho tour hè', 'percent', 10, 500000, 3000000, '2026-06-01T00:00:00', '2026-08-31T23:59:59', 100, 0, 'active');
DECLARE @PromotionId BIGINT = (SELECT PromotionId FROM Promotions WHERE Code = 'SUMMER2026');
INSERT INTO PromotionTours (PromotionId, TourId) VALUES (@PromotionId, @TourId4);
GO

-- Tạo booking mẫu
DECLARE @CustomerId BIGINT = (SELECT UserId FROM Users WHERE Email = 'vana@gmail.com');
DECLARE @DepartureIdSample BIGINT = (SELECT DepartureId FROM TourDepartures WHERE DepartureCode = 'DNHA-20260701');
DECLARE @TransportServiceIdSample BIGINT = (SELECT TransportServiceId FROM TransportServices WHERE ServiceCode = 'TR-DNHA-20260701-BUS01');
DECLARE @PickupPointIdSample BIGINT = (SELECT PickupPointId FROM PickupPoints WHERE Code = 'HN-OPERA');
EXEC sp_CreateBooking
    @BookingCode = 'BK-20260620-0001',
    @CustomerId = @CustomerId,
    @DepartureId = @DepartureIdSample,
    @TransportServiceId = @TransportServiceIdSample,
    @PickupPointId = @PickupPointIdSample,
    @CustomerFullName = N'Nguyễn Văn A',
    @CustomerPhone = '0909123456',
    @CustomerEmail = 'vana@gmail.com',
    @AdultQuantity = 1,
    @ChildQuantity = 1,
    @InfantQuantity = 0,
    @DoorToDoorAddress = NULL,
    @SeatNumbers = 'A01,A02',
    @Note = N'Khách yêu cầu phòng gần thang máy';
GO

DECLARE @BookingIdSample BIGINT = (SELECT BookingId FROM Bookings WHERE BookingCode = 'BK-20260620-0001');
INSERT INTO BookingTravelers (BookingId, FullName, Gender, DateOfBirth, TravelerType, IdentityType, IdentityNumber, Phone, Note)
VALUES
(@BookingIdSample, N'Nguyễn Văn A', 'male', '2000-01-01', 'adult', 'cccd', '001200000001', '0909123456', N'Ăn chay'),
(@BookingIdSample, N'Nguyễn Văn B', 'female', '2018-05-10', 'child', NULL, NULL, NULL, NULL);
GO

-- =======================================================
-- VIEW: XEM BOOKING KÈM TOUR VÀ VẬN CHUYỂN
-- =======================================================
INSERT INTO ChatBotFaqs (Question, Keywords, Answer, Status)
VALUES
(N'Thanh toan nhu the nao?', N'thanh toan, phuong thuc thanh toan, chuyen khoan, momo, vnpay', N'Quy khach co the thanh toan bang tien mat, chuyen khoan, MoMo, VNPay, ZaloPay hoac the tin dung. Khi dat tour, quy khach can thanh toan toi thieu 50% de xac nhan giu cho.', 'active'),
(N'Chinh sach huy tour ra sao?', N'huy tour, chinh sach huy, hoan tien, doi lich', N'Chinh sach huy phu hop voi tung tour. Voi tour mau Da Nang - Hoi An, huy truoc 7 ngay duoc hoan 70%. Nhan vien tu van se xac nhan chi tiet theo booking cua quy khach.', 'active'),
(N'Tour co xe dua don khong?', N'xe dua don, van chuyen, limousine, xe rieng, pickup', N'Nhieu lich khoi hanh co dich vu dua don. Quy khach co the chon xe bus theo diem hen, limousine don tan noi hoac xe rieng neu lich tour ho tro.', 'active');
GO

CREATE OR ALTER VIEW vw_BookingDetails
AS
SELECT
    b.BookingId,
    b.BookingCode,
    b.CustomerFullName,
    b.CustomerPhone,
    b.CustomerEmail,
    b.TourTitleSnapshot,
    b.StartDateSnapshot,
    b.EndDateSnapshot,
    b.AdultQuantity,
    b.ChildQuantity,
    b.InfantQuantity,
    b.TotalAmount,
    b.PaidAmount,
    b.RemainingAmount,
    b.PaymentStatus,
    b.Status AS BookingStatus,
    bts.ServiceNameSnapshot AS TransportServiceName,
    bts.ModeSnapshot AS TransportMode,
    bts.ServiceTypeSnapshot AS TransportServiceType,
    bts.PickupPointNameSnapshot,
    bts.PickupAddressSnapshot,
    bts.SeatNumbers
FROM Bookings b
LEFT JOIN BookingTransportSelections bts ON b.BookingId = bts.BookingId;
GO

-- =======================================================
-- QUERY MẪU
-- =======================================================
-- Xem tour đang bán:
-- SELECT * FROM Tours WHERE Status = 'active';

-- Xem lịch khởi hành còn chỗ:
-- SELECT * FROM TourDepartures
-- WHERE Status = 'open' AND BookedCount + HoldCount < Capacity;

-- Xem dịch vụ đưa đón của lịch khởi hành:
-- SELECT * FROM TransportServices
-- WHERE DepartureId = 1 AND Status = 'open' AND AllowCustomerSelect = 1;

-- Xem chi tiết booking:
-- SELECT * FROM vw_BookingDetails;

-- Thanh toán booking mẫu:
-- EXEC sp_PayBooking
--     @PaymentCode = 'PAY-20260620-0001',
--     @BookingId = 1,
--     @Amount = 3390000,
--     @Method = 'bank_transfer',
--     @Provider = N'Vietcombank',
--     @TransactionRef = 'VCB123456789',
--     @Note = N'Thanh toán cọc 50%';


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

PRINT N'Database TravelTourDB đã được tạo thành công.';
GO


/* =======================================================
   PHẦN MỞ RỘNG DATABASE HOÀN CHỈNH
   ADMIN LOGIN + PHÂN QUYỀN + TOUR DETAIL + BOOKING TRACKING
   Default admin:
   - Email: admin@travel.com
   - Username: admin
   - Password: Admin@123456
   ======================================================= */

USE TravelTourDB;
GO

/* =======================================================
   14. NÂNG CẤP USERS CHO LOGIN / ADMIN
   ======================================================= */

IF COL_LENGTH('Users', 'Username') IS NULL
    ALTER TABLE Users ADD Username VARCHAR(80) NULL;
GO

IF COL_LENGTH('Users', 'LastLoginAt') IS NULL
    ALTER TABLE Users ADD LastLoginAt DATETIME2 NULL;
GO

IF COL_LENGTH('Users', 'FailedLoginCount') IS NULL
    ALTER TABLE Users ADD FailedLoginCount INT NOT NULL CONSTRAINT DF_Users_FailedLoginCount DEFAULT 0;
GO

IF COL_LENGTH('Users', 'LockedUntil') IS NULL
    ALTER TABLE Users ADD LockedUntil DATETIME2 NULL;
GO

IF COL_LENGTH('Users', 'EmailVerifiedAt') IS NULL
    ALTER TABLE Users ADD EmailVerifiedAt DATETIME2 NULL;
GO

IF COL_LENGTH('Users', 'PhoneVerifiedAt') IS NULL
    ALTER TABLE Users ADD PhoneVerifiedAt DATETIME2 NULL;
GO

IF COL_LENGTH('Users', 'LastPasswordChangedAt') IS NULL
    ALTER TABLE Users ADD LastPasswordChangedAt DATETIME2 NULL;
GO

IF COL_LENGTH('Users', 'TwoFactorEnabled') IS NULL
    ALTER TABLE Users ADD TwoFactorEnabled BIT NOT NULL CONSTRAINT DF_Users_TwoFactorEnabled DEFAULT 0;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'UX_Users_Username'
      AND object_id = OBJECT_ID('Users')
)
CREATE UNIQUE INDEX UX_Users_Username
ON Users(Username)
WHERE Username IS NOT NULL;
GO

/* =======================================================
   15. ADMIN PERMISSIONS
   ======================================================= */

IF OBJECT_ID(N'AdminPermissions', N'U') IS NULL
BEGIN
    CREATE TABLE AdminPermissions (
        PermissionCode VARCHAR(100) PRIMARY KEY,
        Name NVARCHAR(200) NOT NULL,
        Module VARCHAR(100) NOT NULL,
        Description NVARCHAR(500) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
    );
END
GO

IF OBJECT_ID(N'AdminRolePermissions', N'U') IS NULL
BEGIN
    CREATE TABLE AdminRolePermissions (
        Role VARCHAR(30) NOT NULL,
        PermissionCode VARCHAR(100) NOT NULL,
        PRIMARY KEY (Role, PermissionCode),
        CONSTRAINT FK_AdminRolePermissions_Permissions
            FOREIGN KEY (PermissionCode) REFERENCES AdminPermissions(PermissionCode),
        CONSTRAINT CK_AdminRolePermissions_Role
            CHECK (Role IN ('admin','staff','operator','guide','driver'))
    );
END
GO

INSERT INTO AdminPermissions (PermissionCode, Name, Module, Description)
SELECT 'dashboard.view', N'Xem dashboard', 'dashboard', N'Xem tổng quan doanh thu, booking, khách hàng'
WHERE NOT EXISTS (SELECT 1 FROM AdminPermissions WHERE PermissionCode = 'dashboard.view');

INSERT INTO AdminPermissions (PermissionCode, Name, Module, Description)
SELECT 'tour.manage', N'Quản lý tour', 'tour', N'Thêm, sửa, xóa, ẩn hiện tour'
WHERE NOT EXISTS (SELECT 1 FROM AdminPermissions WHERE PermissionCode = 'tour.manage');

INSERT INTO AdminPermissions (PermissionCode, Name, Module, Description)
SELECT 'departure.manage', N'Quản lý lịch khởi hành', 'departure', N'Tạo lịch, mở bán, đóng bán, cập nhật số chỗ'
WHERE NOT EXISTS (SELECT 1 FROM AdminPermissions WHERE PermissionCode = 'departure.manage');

INSERT INTO AdminPermissions (PermissionCode, Name, Module, Description)
SELECT 'booking.manage', N'Quản lý booking', 'booking', N'Xác nhận, hủy, hoàn tiền booking'
WHERE NOT EXISTS (SELECT 1 FROM AdminPermissions WHERE PermissionCode = 'booking.manage');

INSERT INTO AdminPermissions (PermissionCode, Name, Module, Description)
SELECT 'payment.manage', N'Quản lý thanh toán', 'payment', N'Theo dõi và xử lý thanh toán'
WHERE NOT EXISTS (SELECT 1 FROM AdminPermissions WHERE PermissionCode = 'payment.manage');

INSERT INTO AdminPermissions (PermissionCode, Name, Module, Description)
SELECT 'user.manage', N'Quản lý người dùng', 'user', N'Quản lý khách hàng, nhân viên, admin'
WHERE NOT EXISTS (SELECT 1 FROM AdminPermissions WHERE PermissionCode = 'user.manage');

INSERT INTO AdminPermissions (PermissionCode, Name, Module, Description)
SELECT 'promotion.manage', N'Quản lý khuyến mãi', 'promotion', N'Tạo và kiểm soát mã giảm giá'
WHERE NOT EXISTS (SELECT 1 FROM AdminPermissions WHERE PermissionCode = 'promotion.manage');

INSERT INTO AdminPermissions (PermissionCode, Name, Module, Description)
SELECT 'transport.manage', N'Quản lý vận tải', 'transport', N'Quản lý xe, tài xế, tuyến, điểm đón'
WHERE NOT EXISTS (SELECT 1 FROM AdminPermissions WHERE PermissionCode = 'transport.manage');

INSERT INTO AdminPermissions (PermissionCode, Name, Module, Description)
SELECT 'support.manage', N'Quản lý hỗ trợ khách hàng', 'support', N'Quản lý ticket, chat, FAQ'
WHERE NOT EXISTS (SELECT 1 FROM AdminPermissions WHERE PermissionCode = 'support.manage');

INSERT INTO AdminPermissions (PermissionCode, Name, Module, Description)
SELECT 'report.view', N'Xem báo cáo', 'report', N'Xem doanh thu, booking, hiệu suất tour'
WHERE NOT EXISTS (SELECT 1 FROM AdminPermissions WHERE PermissionCode = 'report.view');

INSERT INTO AdminPermissions (PermissionCode, Name, Module, Description)
SELECT 'audit.view', N'Xem nhật ký hệ thống', 'audit', N'Xem lịch sử thao tác hệ thống'
WHERE NOT EXISTS (SELECT 1 FROM AdminPermissions WHERE PermissionCode = 'audit.view');
GO

INSERT INTO AdminRolePermissions (Role, PermissionCode)
SELECT 'admin', PermissionCode
FROM AdminPermissions p
WHERE NOT EXISTS (
    SELECT 1 FROM AdminRolePermissions rp
    WHERE rp.Role = 'admin'
      AND rp.PermissionCode = p.PermissionCode
);
GO

INSERT INTO AdminRolePermissions (Role, PermissionCode)
SELECT 'staff', PermissionCode
FROM AdminPermissions p
WHERE p.PermissionCode IN (
    'dashboard.view',
    'tour.manage',
    'departure.manage',
    'booking.manage',
    'payment.manage',
    'promotion.manage',
    'support.manage',
    'report.view'
)
AND NOT EXISTS (
    SELECT 1 FROM AdminRolePermissions rp
    WHERE rp.Role = 'staff'
      AND rp.PermissionCode = p.PermissionCode
);
GO

/* =======================================================
   16. ADMIN STAFF PROFILE
   ======================================================= */

IF OBJECT_ID(N'AdminStaffProfiles', N'U') IS NULL
BEGIN
    CREATE TABLE AdminStaffProfiles (
        StaffProfileId BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserId BIGINT NOT NULL UNIQUE,
        EmployeeCode VARCHAR(80) NULL UNIQUE,
        Department NVARCHAR(150) NULL,
        Position NVARCHAR(150) NULL,
        HireDate DATE NULL,
        Note NVARCHAR(500) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        UpdatedAt DATETIME2 NULL,
        CONSTRAINT FK_AdminStaffProfiles_Users
            FOREIGN KEY (UserId) REFERENCES Users(UserId)
    );
END
GO

/* =======================================================
   17. AUTH LOGS / TOKEN / RESET PASSWORD
   ======================================================= */

IF OBJECT_ID(N'AdminLoginLogs', N'U') IS NULL
BEGIN
    CREATE TABLE AdminLoginLogs (
        LoginLogId BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserId BIGINT NULL,
        EmailOrUsername VARCHAR(150) NOT NULL,
        IsSuccess BIT NOT NULL,
        FailureReason NVARCHAR(255) NULL,
        IpAddress VARCHAR(50) NULL,
        UserAgent NVARCHAR(500) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_AdminLoginLogs_Users
            FOREIGN KEY (UserId) REFERENCES Users(UserId)
    );

    CREATE INDEX IX_AdminLoginLogs_UserId
    ON AdminLoginLogs(UserId);

    CREATE INDEX IX_AdminLoginLogs_CreatedAt
    ON AdminLoginLogs(CreatedAt DESC);
END
GO

IF OBJECT_ID(N'AuthRefreshTokens', N'U') IS NULL
BEGIN
    CREATE TABLE AuthRefreshTokens (
        RefreshTokenId BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserId BIGINT NOT NULL,
        TokenHash VARCHAR(255) NOT NULL UNIQUE,
        DeviceName NVARCHAR(150) NULL,
        IpAddress VARCHAR(50) NULL,
        UserAgent NVARCHAR(500) NULL,
        ExpiresAt DATETIME2 NOT NULL,
        RevokedAt DATETIME2 NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_AuthRefreshTokens_Users
            FOREIGN KEY (UserId) REFERENCES Users(UserId)
    );

    CREATE INDEX IX_AuthRefreshTokens_UserId
    ON AuthRefreshTokens(UserId);
END
GO

IF OBJECT_ID(N'PasswordResetTokens', N'U') IS NULL
BEGIN
    CREATE TABLE PasswordResetTokens (
        ResetTokenId BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserId BIGINT NOT NULL,
        TokenHash VARCHAR(255) NOT NULL UNIQUE,
        ExpiresAt DATETIME2 NOT NULL,
        UsedAt DATETIME2 NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_PasswordResetTokens_Users
            FOREIGN KEY (UserId) REFERENCES Users(UserId)
    );

    CREATE INDEX IX_PasswordResetTokens_UserId
    ON PasswordResetTokens(UserId);
END
GO

/* =======================================================
   18. TOUR DETAIL: ẢNH / HIGHLIGHT / FAQ / WISHLIST
   ======================================================= */

IF OBJECT_ID(N'TourImages', N'U') IS NULL
BEGIN
    CREATE TABLE TourImages (
        TourImageId BIGINT IDENTITY(1,1) PRIMARY KEY,
        TourId BIGINT NOT NULL,
        ImageUrl NVARCHAR(500) NOT NULL,
        Caption NVARCHAR(255) NULL,
        SortOrder INT NOT NULL DEFAULT 1,
        IsMain BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_TourImages_Tours
            FOREIGN KEY (TourId) REFERENCES Tours(TourId)
    );

    CREATE INDEX IX_TourImages_TourId
    ON TourImages(TourId);
END
GO

IF OBJECT_ID(N'TourHighlights', N'U') IS NULL
BEGIN
    CREATE TABLE TourHighlights (
        HighlightId BIGINT IDENTITY(1,1) PRIMARY KEY,
        TourId BIGINT NOT NULL,
        Title NVARCHAR(255) NOT NULL,
        Description NVARCHAR(500) NULL,
        Icon VARCHAR(100) NULL,
        SortOrder INT NOT NULL DEFAULT 1,
        CONSTRAINT FK_TourHighlights_Tours
            FOREIGN KEY (TourId) REFERENCES Tours(TourId)
    );

    CREATE INDEX IX_TourHighlights_TourId
    ON TourHighlights(TourId);
END
GO

IF OBJECT_ID(N'TourFaqs', N'U') IS NULL
BEGIN
    CREATE TABLE TourFaqs (
        TourFaqId BIGINT IDENTITY(1,1) PRIMARY KEY,
        TourId BIGINT NOT NULL,
        Question NVARCHAR(500) NOT NULL,
        Answer NVARCHAR(MAX) NOT NULL,
        SortOrder INT NOT NULL DEFAULT 1,
        Status VARCHAR(30) NOT NULL DEFAULT 'active',
        CONSTRAINT FK_TourFaqs_Tours
            FOREIGN KEY (TourId) REFERENCES Tours(TourId),
        CONSTRAINT CK_TourFaqs_Status
            CHECK (Status IN ('active','inactive'))
    );

    CREATE INDEX IX_TourFaqs_TourId
    ON TourFaqs(TourId);
END
GO

IF OBJECT_ID(N'Wishlists', N'U') IS NULL
BEGIN
    CREATE TABLE Wishlists (
        UserId BIGINT NOT NULL,
        TourId BIGINT NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        PRIMARY KEY (UserId, TourId),
        CONSTRAINT FK_Wishlists_Users
            FOREIGN KEY (UserId) REFERENCES Users(UserId),
        CONSTRAINT FK_Wishlists_Tours
            FOREIGN KEY (TourId) REFERENCES Tours(TourId)
    );
END
GO

/* =======================================================
   19. KHÁCH SẠN / PHÒNG / DỊCH VỤ LƯU TRÚ
   ======================================================= */

IF OBJECT_ID(N'HotelProviders', N'U') IS NULL
BEGIN
    CREATE TABLE HotelProviders (
        HotelProviderId BIGINT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(200) NOT NULL,
        ContactPersonName NVARCHAR(150) NULL,
        ContactPhone VARCHAR(20) NULL,
        ContactEmail VARCHAR(150) NULL,
        TaxCode VARCHAR(50) NULL,
        Address NVARCHAR(255) NULL,
        Status VARCHAR(30) NOT NULL DEFAULT 'active',
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        UpdatedAt DATETIME2 NULL,
        CONSTRAINT CK_HotelProviders_Status
            CHECK (Status IN ('active','inactive','suspended'))
    );
END
GO

IF OBJECT_ID(N'Hotels', N'U') IS NULL
BEGIN
    CREATE TABLE Hotels (
        HotelId BIGINT IDENTITY(1,1) PRIMARY KEY,
        HotelProviderId BIGINT NULL,
        DestinationId BIGINT NULL,
        Name NVARCHAR(200) NOT NULL,
        StarRating INT NULL,
        Address NVARCHAR(255) NULL,
        Phone VARCHAR(20) NULL,
        Email VARCHAR(150) NULL,
        Description NVARCHAR(MAX) NULL,
        ImageUrl NVARCHAR(500) NULL,
        Status VARCHAR(30) NOT NULL DEFAULT 'active',
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        UpdatedAt DATETIME2 NULL,
        CONSTRAINT FK_Hotels_Providers
            FOREIGN KEY (HotelProviderId) REFERENCES HotelProviders(HotelProviderId),
        CONSTRAINT FK_Hotels_Destinations
            FOREIGN KEY (DestinationId) REFERENCES Destinations(DestinationId),
        CONSTRAINT CK_Hotels_StarRating
            CHECK (StarRating IS NULL OR StarRating BETWEEN 1 AND 5),
        CONSTRAINT CK_Hotels_Status
            CHECK (Status IN ('active','inactive'))
    );

    CREATE INDEX IX_Hotels_DestinationId
    ON Hotels(DestinationId);
END
GO

IF OBJECT_ID(N'HotelRooms', N'U') IS NULL
BEGIN
    CREATE TABLE HotelRooms (
        RoomId BIGINT IDENTITY(1,1) PRIMARY KEY,
        HotelId BIGINT NOT NULL,
        RoomType VARCHAR(50) NOT NULL,
        RoomName NVARCHAR(150) NOT NULL,
        Capacity INT NOT NULL,
        BasePrice DECIMAL(18,2) NOT NULL DEFAULT 0,
        Amenities NVARCHAR(500) NULL,
        Status VARCHAR(30) NOT NULL DEFAULT 'active',
        CONSTRAINT FK_HotelRooms_Hotels
            FOREIGN KEY (HotelId) REFERENCES Hotels(HotelId),
        CONSTRAINT CK_HotelRooms_RoomType
            CHECK (RoomType IN ('single','double','twin','triple','family','suite')),
        CONSTRAINT CK_HotelRooms_Capacity
            CHECK (Capacity > 0),
        CONSTRAINT CK_HotelRooms_Status
            CHECK (Status IN ('active','inactive'))
    );

    CREATE INDEX IX_HotelRooms_HotelId
    ON HotelRooms(HotelId);
END
GO

IF OBJECT_ID(N'TourAccommodationOptions', N'U') IS NULL
BEGIN
    CREATE TABLE TourAccommodationOptions (
        AccommodationOptionId BIGINT IDENTITY(1,1) PRIMARY KEY,
        TourId BIGINT NOT NULL,
        HotelId BIGINT NOT NULL,
        RoomId BIGINT NULL,
        NightNumber INT NOT NULL,
        IncludedInTour BIT NOT NULL DEFAULT 1,
        ExtraFee DECIMAL(18,2) NOT NULL DEFAULT 0,
        Note NVARCHAR(500) NULL,
        CONSTRAINT FK_TourAccommodationOptions_Tours
            FOREIGN KEY (TourId) REFERENCES Tours(TourId),
        CONSTRAINT FK_TourAccommodationOptions_Hotels
            FOREIGN KEY (HotelId) REFERENCES Hotels(HotelId),
        CONSTRAINT FK_TourAccommodationOptions_Rooms
            FOREIGN KEY (RoomId) REFERENCES HotelRooms(RoomId),
        CONSTRAINT CK_TourAccommodationOptions_Night
            CHECK (NightNumber > 0)
    );

    CREATE INDEX IX_TourAccommodationOptions_TourId
    ON TourAccommodationOptions(TourId);
END
GO

/* =======================================================
   20. HƯỚNG DẪN VIÊN / PHÂN CÔNG TOUR
   ======================================================= */

IF OBJECT_ID(N'Guides', N'U') IS NULL
BEGIN
    CREATE TABLE Guides (
        GuideId BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserId BIGINT NULL,
        FullName NVARCHAR(150) NOT NULL,
        Phone VARCHAR(20) NOT NULL,
        Email VARCHAR(150) NULL,
        Languages NVARCHAR(255) NULL,
        LicenseNumber VARCHAR(100) NULL,
        ExperienceYears INT NULL,
        Status VARCHAR(30) NOT NULL DEFAULT 'available',
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        UpdatedAt DATETIME2 NULL,
        CONSTRAINT FK_Guides_Users
            FOREIGN KEY (UserId) REFERENCES Users(UserId),
        CONSTRAINT CK_Guides_Status
            CHECK (Status IN ('available','busy','inactive'))
    );

    CREATE INDEX IX_Guides_Status
    ON Guides(Status);
END
GO

IF OBJECT_ID(N'TourDepartureAssignments', N'U') IS NULL
BEGIN
    CREATE TABLE TourDepartureAssignments (
        AssignmentId BIGINT IDENTITY(1,1) PRIMARY KEY,
        DepartureId BIGINT NOT NULL,
        GuideId BIGINT NULL,
        OperatorId BIGINT NULL,
        Note NVARCHAR(500) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        UpdatedAt DATETIME2 NULL,
        CONSTRAINT FK_TourDepartureAssignments_Departures
            FOREIGN KEY (DepartureId) REFERENCES TourDepartures(DepartureId),
        CONSTRAINT FK_TourDepartureAssignments_Guides
            FOREIGN KEY (GuideId) REFERENCES Guides(GuideId),
        CONSTRAINT FK_TourDepartureAssignments_Operators
            FOREIGN KEY (OperatorId) REFERENCES Users(UserId)
    );

    CREATE INDEX IX_TourDepartureAssignments_DepartureId
    ON TourDepartureAssignments(DepartureId);
END
GO

/* =======================================================
   21. BOOKING STATUS HISTORY / REFUND / PROMOTION USAGE
   ======================================================= */

IF OBJECT_ID(N'BookingStatusHistories', N'U') IS NULL
BEGIN
    CREATE TABLE BookingStatusHistories (
        HistoryId BIGINT IDENTITY(1,1) PRIMARY KEY,
        BookingId BIGINT NOT NULL,
        OldStatus VARCHAR(30) NULL,
        NewStatus VARCHAR(30) NOT NULL,
        OldPaymentStatus VARCHAR(30) NULL,
        NewPaymentStatus VARCHAR(30) NULL,
        ChangedBy BIGINT NULL,
        Note NVARCHAR(500) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_BookingStatusHistories_Bookings
            FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId),
        CONSTRAINT FK_BookingStatusHistories_Users
            FOREIGN KEY (ChangedBy) REFERENCES Users(UserId)
    );

    CREATE INDEX IX_BookingStatusHistories_BookingId
    ON BookingStatusHistories(BookingId);
END
GO

IF OBJECT_ID(N'PaymentRefunds', N'U') IS NULL
BEGIN
    CREATE TABLE PaymentRefunds (
        RefundId BIGINT IDENTITY(1,1) PRIMARY KEY,
        RefundCode VARCHAR(80) NOT NULL UNIQUE,
        PaymentId BIGINT NULL,
        BookingId BIGINT NOT NULL,
        CustomerId BIGINT NOT NULL,
        Amount DECIMAL(18,2) NOT NULL,
        Reason NVARCHAR(500) NULL,
        Status VARCHAR(30) NOT NULL DEFAULT 'pending',
        RequestedBy BIGINT NULL,
        ApprovedBy BIGINT NULL,
        RequestedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        ApprovedAt DATETIME2 NULL,
        RefundedAt DATETIME2 NULL,
        CONSTRAINT FK_PaymentRefunds_Payments
            FOREIGN KEY (PaymentId) REFERENCES Payments(PaymentId),
        CONSTRAINT FK_PaymentRefunds_Bookings
            FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId),
        CONSTRAINT FK_PaymentRefunds_Customers
            FOREIGN KEY (CustomerId) REFERENCES Users(UserId),
        CONSTRAINT FK_PaymentRefunds_RequestedBy
            FOREIGN KEY (RequestedBy) REFERENCES Users(UserId),
        CONSTRAINT FK_PaymentRefunds_ApprovedBy
            FOREIGN KEY (ApprovedBy) REFERENCES Users(UserId),
        CONSTRAINT CK_PaymentRefunds_Status
            CHECK (Status IN ('pending','approved','rejected','refunded','cancelled'))
    );
END
GO

IF OBJECT_ID(N'PromotionUsages', N'U') IS NULL
BEGIN
    CREATE TABLE PromotionUsages (
        PromotionUsageId BIGINT IDENTITY(1,1) PRIMARY KEY,
        PromotionId BIGINT NOT NULL,
        BookingId BIGINT NOT NULL,
        CustomerId BIGINT NOT NULL,
        DiscountAmount DECIMAL(18,2) NOT NULL,
        UsedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_PromotionUsages_Promotions
            FOREIGN KEY (PromotionId) REFERENCES Promotions(PromotionId),
        CONSTRAINT FK_PromotionUsages_Bookings
            FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId),
        CONSTRAINT FK_PromotionUsages_Customers
            FOREIGN KEY (CustomerId) REFERENCES Users(UserId),
        CONSTRAINT UQ_PromotionUsages_Promotion_Booking
            UNIQUE (PromotionId, BookingId)
    );
END
GO

/* =======================================================
   22. NOTIFICATIONS
   ======================================================= */

IF OBJECT_ID(N'Notifications', N'U') IS NULL
BEGIN
    CREATE TABLE Notifications (
        NotificationId BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserId BIGINT NOT NULL,
        Title NVARCHAR(255) NOT NULL,
        Message NVARCHAR(MAX) NOT NULL,
        Type VARCHAR(50) NOT NULL DEFAULT 'system',
        RelatedModule VARCHAR(100) NULL,
        RelatedId BIGINT NULL,
        IsRead BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        ReadAt DATETIME2 NULL,
        CONSTRAINT FK_Notifications_Users
            FOREIGN KEY (UserId) REFERENCES Users(UserId),
        CONSTRAINT CK_Notifications_Type
            CHECK (Type IN ('system','booking','payment','promotion','support','transport'))
    );

    CREATE INDEX IX_Notifications_UserId_IsRead
    ON Notifications(UserId, IsRead);
END
GO

/* =======================================================
   23. UPDATE ADMIN ACCOUNT
   ======================================================= */

DECLARE @AdminPasswordHash VARCHAR(255);
SET @AdminPasswordHash = '$2b$10$ev5W7EzvLVRVtEBaEtB34eqEL0gCxly5WfoU/bTfPNg2dTLjNiBiy';

IF EXISTS (SELECT 1 FROM Users WHERE Email = 'admin@travel.com')
BEGIN
    UPDATE Users
    SET
        FullName = N'Quản trị viên hệ thống',
        Username = 'admin',
        PasswordHash = @AdminPasswordHash,
        Role = 'admin',
        Status = 'active',
        EmailVerifiedAt = ISNULL(EmailVerifiedAt, SYSDATETIME()),
        LastPasswordChangedAt = SYSDATETIME(),
        UpdatedAt = SYSDATETIME()
    WHERE Email = 'admin@travel.com';
END
ELSE
BEGIN
    INSERT INTO Users (
        FullName, Username, Email, Phone, PasswordHash,
        Role, Status, EmailVerifiedAt, LastPasswordChangedAt
    )
    VALUES (
        N'Quản trị viên hệ thống', 'admin', 'admin@travel.com', '0999999999',
        @AdminPasswordHash, 'admin', 'active', SYSDATETIME(), SYSDATETIME()
    );
END
GO

DECLARE @AdminUserId BIGINT = (
    SELECT UserId FROM Users WHERE Email = 'admin@travel.com'
);

IF NOT EXISTS (SELECT 1 FROM AdminStaffProfiles WHERE UserId = @AdminUserId)
BEGIN
    INSERT INTO AdminStaffProfiles (
        UserId, EmployeeCode, Department, Position, HireDate, Note
    )
    VALUES (
        @AdminUserId,
        'ADM-0001',
        N'Ban quản trị hệ thống',
        N'System Administrator',
        CAST(GETDATE() AS DATE),
        N'Tài khoản admin mặc định của hệ thống'
    );
END
GO

/* =======================================================
   24. SEED DATA MỞ RỘNG
   ======================================================= */

DECLARE @TourSeedId BIGINT = (SELECT TourId FROM Tours WHERE Code = 'TOUR-DN-HA-3N2D');

IF @TourSeedId IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM TourImages WHERE TourId = @TourSeedId)
    BEGIN
        INSERT INTO TourImages (TourId, ImageUrl, Caption, SortOrder, IsMain)
        VALUES
        (@TourSeedId, N'https://example.com/images/da-nang-main.jpg', N'Biển Đà Nẵng', 1, 1),
        (@TourSeedId, N'https://example.com/images/hoi-an.jpg', N'Phố cổ Hội An', 2, 0),
        (@TourSeedId, N'https://example.com/images/ba-na-hills.jpg', N'Bà Nà Hills', 3, 0);
    END

    IF NOT EXISTS (SELECT 1 FROM TourHighlights WHERE TourId = @TourSeedId)
    BEGIN
        INSERT INTO TourHighlights (TourId, Title, Description, Icon, SortOrder)
        VALUES
        (@TourSeedId, N'Khám phá Đà Nẵng - Hội An', N'Lịch trình phù hợp gia đình và nhóm bạn', 'map', 1),
        (@TourSeedId, N'Có xe đưa đón', N'Hỗ trợ xe bus, limousine hoặc xe riêng', 'bus', 2),
        (@TourSeedId, N'Khách sạn 3 sao', N'Lưu trú tiện nghi tại Đà Nẵng', 'hotel', 3);
    END

    IF NOT EXISTS (SELECT 1 FROM TourFaqs WHERE TourId = @TourSeedId)
    BEGIN
        INSERT INTO TourFaqs (TourId, Question, Answer, SortOrder, Status)
        VALUES
        (@TourSeedId, N'Tour có bao gồm xe đưa đón không?', N'Tour có xe đưa đón theo điểm hẹn. Khách có thể chọn limousine hoặc xe riêng nếu lịch khởi hành hỗ trợ.', 1, 'active'),
        (@TourSeedId, N'Tôi cần thanh toán bao nhiêu để giữ chỗ?', N'Khách cần thanh toán tối thiểu 50% giá trị booking để xác nhận giữ chỗ.', 2, 'active'),
        (@TourSeedId, N'Có thể hủy tour không?', N'Có thể hủy theo chính sách từng tour. Tour mẫu này hủy trước 7 ngày hoàn 70%.', 3, 'active');
    END
END
GO

IF NOT EXISTS (SELECT 1 FROM HotelProviders WHERE Name = N'Đối tác khách sạn Đà Nẵng')
BEGIN
    INSERT INTO HotelProviders (Name, ContactPersonName, ContactPhone, ContactEmail, Address, Status)
    VALUES (N'Đối tác khách sạn Đà Nẵng', N'Nguyễn Thị Hotel', '0909000001', 'hotel-partner@example.com', N'Đà Nẵng', 'active');
END
GO

DECLARE @HotelProviderId BIGINT = (SELECT TOP 1 HotelProviderId FROM HotelProviders WHERE Name = N'Đối tác khách sạn Đà Nẵng');
DECLARE @DaNangDestinationId BIGINT = (SELECT DestinationId FROM Destinations WHERE Slug = 'da-nang');

IF NOT EXISTS (SELECT 1 FROM Hotels WHERE Name = N'Da Nang Beach Hotel')
BEGIN
    INSERT INTO Hotels (HotelProviderId, DestinationId, Name, StarRating, Address, Phone, Email, Description, Status)
    VALUES (
        @HotelProviderId,
        @DaNangDestinationId,
        N'Da Nang Beach Hotel',
        3,
        N'Biển Mỹ Khê, Đà Nẵng',
        '0909000002',
        'danangbeach@example.com',
        N'Khách sạn gần biển, phù hợp tour gia đình.',
        'active'
    );
END
GO

DECLARE @HotelIdSeed BIGINT = (SELECT HotelId FROM Hotels WHERE Name = N'Da Nang Beach Hotel');

IF @HotelIdSeed IS NOT NULL AND NOT EXISTS (SELECT 1 FROM HotelRooms WHERE HotelId = @HotelIdSeed)
BEGIN
    INSERT INTO HotelRooms (HotelId, RoomType, RoomName, Capacity, BasePrice, Amenities, Status)
    VALUES
    (@HotelIdSeed, 'double', N'Phòng đôi tiêu chuẩn', 2, 800000, N'Máy lạnh; Wifi; Ăn sáng', 'active'),
    (@HotelIdSeed, 'family', N'Phòng gia đình', 4, 1400000, N'Máy lạnh; Wifi; Ăn sáng; View biển', 'active');
END
GO

DECLARE @TourHotelSeedId BIGINT = (SELECT TourId FROM Tours WHERE Code = 'TOUR-DN-HA-3N2D');
DECLARE @HotelSeedId BIGINT = (SELECT HotelId FROM Hotels WHERE Name = N'Da Nang Beach Hotel');
DECLARE @RoomSeedId BIGINT = (
    SELECT TOP 1 RoomId FROM HotelRooms
    WHERE HotelId = @HotelSeedId AND RoomType = 'double'
);

IF @TourHotelSeedId IS NOT NULL
   AND @HotelSeedId IS NOT NULL
   AND NOT EXISTS (
        SELECT 1 FROM TourAccommodationOptions
        WHERE TourId = @TourHotelSeedId AND HotelId = @HotelSeedId
   )
BEGIN
    INSERT INTO TourAccommodationOptions (
        TourId, HotelId, RoomId, NightNumber, IncludedInTour, ExtraFee, Note
    )
    VALUES
    (@TourHotelSeedId, @HotelSeedId, @RoomSeedId, 1, 1, 0, N'Đêm 1 tại Đà Nẵng'),
    (@TourHotelSeedId, @HotelSeedId, @RoomSeedId, 2, 1, 0, N'Đêm 2 tại Đà Nẵng');
END
GO

/* =======================================================
   25. VIEWS CHO ADMIN DASHBOARD
   ======================================================= */

CREATE OR ALTER VIEW vw_AdminDashboardSummary
AS
SELECT
    (SELECT COUNT(*) FROM Users WHERE Role = 'customer') AS TotalCustomers,
    (SELECT COUNT(*) FROM Tours) AS TotalTours,
    (SELECT COUNT(*) FROM Tours WHERE Status = 'active') AS ActiveTours,
    (SELECT COUNT(*) FROM TourDepartures WHERE Status = 'open') AS OpenDepartures,
    (SELECT COUNT(*) FROM Bookings) AS TotalBookings,
    (SELECT COUNT(*) FROM Bookings WHERE Status = 'pending') AS PendingBookings,
    (SELECT COUNT(*) FROM Bookings WHERE Status = 'confirmed') AS ConfirmedBookings,
    (SELECT ISNULL(SUM(TotalAmount), 0) FROM Bookings WHERE Status IN ('confirmed','completed')) AS TotalRevenue,
    (SELECT ISNULL(SUM(PaidAmount), 0) FROM Bookings WHERE PaymentStatus IN ('partial','paid')) AS TotalPaidAmount,
    (SELECT COUNT(*) FROM SupportTickets WHERE Status IN ('open','processing')) AS OpenSupportTickets;
GO

CREATE OR ALTER VIEW vw_AdminBookingList
AS
SELECT
    b.BookingId,
    b.BookingCode,
    b.CustomerFullName,
    b.CustomerPhone,
    b.CustomerEmail,
    b.TourTitleSnapshot,
    b.StartDateSnapshot,
    b.EndDateSnapshot,
    b.AdultQuantity,
    b.ChildQuantity,
    b.InfantQuantity,
    b.TotalAmount,
    b.PaidAmount,
    b.RemainingAmount,
    b.PaymentStatus,
    b.Status AS BookingStatus,
    b.CreatedAt,
    u.Email AS CustomerAccountEmail,
    td.DepartureCode,
    bts.ServiceNameSnapshot AS TransportServiceName,
    bts.PickupPointNameSnapshot,
    bts.SeatNumbers
FROM Bookings b
INNER JOIN Users u ON b.CustomerId = u.UserId
INNER JOIN TourDepartures td ON b.DepartureId = td.DepartureId
LEFT JOIN BookingTransportSelections bts ON b.BookingId = bts.BookingId;
GO

CREATE OR ALTER VIEW vw_AdminTourList
AS
SELECT
    t.TourId,
    t.Code,
    t.Title,
    t.Slug,
    t.DeparturePlaceName,
    t.DurationDays,
    t.DurationNights,
    t.BasePrice,
    t.RatingAvg,
    t.RatingCount,
    t.Status,
    t.CreatedAt,
    COUNT(DISTINCT td.DepartureId) AS TotalDepartures,
    COUNT(DISTINCT CASE WHEN td.Status = 'open' THEN td.DepartureId END) AS OpenDepartures,
    COUNT(DISTINCT b.BookingId) AS TotalBookings
FROM Tours t
LEFT JOIN TourDepartures td ON t.TourId = td.TourId
LEFT JOIN Bookings b ON t.TourId = b.TourId
GROUP BY
    t.TourId,
    t.Code,
    t.Title,
    t.Slug,
    t.DeparturePlaceName,
    t.DurationDays,
    t.DurationNights,
    t.BasePrice,
    t.RatingAvg,
    t.RatingCount,
    t.Status,
    t.CreatedAt;
GO

/* =======================================================
   26. STORED PROCEDURE: ADMIN LOGIN LOG
   Backend vẫn cần kiểm tra password bằng bcrypt.compare()
   Procedure này dùng để ghi log sau khi backend kiểm tra xong.
   ======================================================= */

CREATE OR ALTER PROCEDURE sp_WriteLoginLog
    @EmailOrUsername VARCHAR(150),
    @IsSuccess BIT,
    @FailureReason NVARCHAR(255) = NULL,
    @IpAddress VARCHAR(50) = NULL,
    @UserAgent NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @UserId BIGINT = (
        SELECT TOP 1 UserId
        FROM Users
        WHERE Email = @EmailOrUsername OR Username = @EmailOrUsername
    );

    INSERT INTO AdminLoginLogs (
        UserId, EmailOrUsername, IsSuccess, FailureReason, IpAddress, UserAgent
    )
    VALUES (
        @UserId, @EmailOrUsername, @IsSuccess, @FailureReason, @IpAddress, @UserAgent
    );

    IF @UserId IS NOT NULL AND @IsSuccess = 1
    BEGIN
        UPDATE Users
        SET LastLoginAt = SYSDATETIME(),
            FailedLoginCount = 0,
            UpdatedAt = SYSDATETIME()
        WHERE UserId = @UserId;
    END

    IF @UserId IS NOT NULL AND @IsSuccess = 0
    BEGIN
        UPDATE Users
        SET FailedLoginCount = FailedLoginCount + 1,
            UpdatedAt = SYSDATETIME()
        WHERE UserId = @UserId;
    END
END;
GO

/* =======================================================
   27. STORED PROCEDURE: ADMIN UPDATE BOOKING STATUS
   ======================================================= */

CREATE OR ALTER PROCEDURE sp_AdminUpdateBookingStatus
    @BookingId BIGINT,
    @NewStatus VARCHAR(30),
    @NewPaymentStatus VARCHAR(30) = NULL,
    @ChangedBy BIGINT = NULL,
    @Note NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @OldStatus VARCHAR(30);
        DECLARE @OldPaymentStatus VARCHAR(30);

        SELECT
            @OldStatus = Status,
            @OldPaymentStatus = PaymentStatus
        FROM Bookings
        WHERE BookingId = @BookingId;

        IF @OldStatus IS NULL
            THROW 52001, N'Booking không tồn tại.', 1;

        IF @NewStatus NOT IN ('pending','confirmed','cancelled','completed','expired','refunded')
            THROW 52002, N'Trạng thái booking không hợp lệ.', 1;

        IF @NewPaymentStatus IS NOT NULL
           AND @NewPaymentStatus NOT IN ('unpaid','partial','paid','refunded','failed')
            THROW 52003, N'Trạng thái thanh toán không hợp lệ.', 1;

        UPDATE Bookings
        SET
            Status = @NewStatus,
            PaymentStatus = ISNULL(@NewPaymentStatus, PaymentStatus),
            UpdatedAt = SYSDATETIME()
        WHERE BookingId = @BookingId;

        INSERT INTO BookingStatusHistories (
            BookingId,
            OldStatus,
            NewStatus,
            OldPaymentStatus,
            NewPaymentStatus,
            ChangedBy,
            Note
        )
        VALUES (
            @BookingId,
            @OldStatus,
            @NewStatus,
            @OldPaymentStatus,
            ISNULL(@NewPaymentStatus, @OldPaymentStatus),
            @ChangedBy,
            @Note
        );

        COMMIT TRANSACTION;

        SELECT
            @BookingId AS BookingId,
            @OldStatus AS OldStatus,
            @NewStatus AS NewStatus,
            @OldPaymentStatus AS OldPaymentStatus,
            ISNULL(@NewPaymentStatus, @OldPaymentStatus) AS NewPaymentStatus;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

/* =======================================================
   28. QUERY KIỂM TRA SAU KHI CHẠY DATABASE
   ======================================================= */

-- Kiểm tra admin:
-- SELECT UserId, FullName, Username, Email, Role, Status, PasswordHash
-- FROM Users
-- WHERE Email = 'admin@travel.com';

-- Kiểm tra quyền admin:
-- SELECT * FROM AdminRolePermissions WHERE Role = 'admin';

-- Kiểm tra dashboard:
-- SELECT * FROM vw_AdminDashboardSummary;

-- Kiểm tra danh sách booking admin:
-- SELECT * FROM vw_AdminBookingList;

PRINT N'Database TravelTourDB bản hoàn chỉnh đã tạo xong. Admin: admin@travel.com / Admin@123456';
GO
