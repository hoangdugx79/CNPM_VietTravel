require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { getPool, sql } = require('../src/db');

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDateLast6Months() {
  const d = new Date();
  d.setDate(d.getDate() - randomInt(0, 180));
  return d;
}

function generateBookingCode() {
  return 'BK' + Date.now().toString().slice(-6) + randomInt(100, 999);
}

async function run() {
  try {
    const pool = await getPool();
    console.log('Generating 50 mock bookings...');

    // Get active departures
    const departs = await pool.request().query(`
      SELECT d.DepartureId, d.TourId, t.Code as TourCode, t.Title as TourTitle, 
             t.DurationDays, t.DurationNights, d.AdultPrice, d.ChildPrice, d.StartDate, d.EndDate
      FROM TourDepartures d
      JOIN Tours t ON d.TourId = t.TourId
      WHERE t.Status = 'active'
    `);
    
    if (departs.recordset.length === 0) {
      console.log('No active departures found.');
      return;
    }

    const departures = departs.recordset;

    // Get customers
    const users = await pool.request().query(`SELECT UserId, FullName, Email, Phone FROM Users WHERE Role = 'customer'`);
    let customerList = users.recordset;
    if (customerList.length === 0) {
      customerList = [{ UserId: null, FullName: 'Guest User', Email: 'guest@example.com', Phone: '0123456789' }];
    }

    for (let i = 0; i < 50; i++) {
      const dep = departures[randomInt(0, departures.length - 1)];
      const cus = customerList[randomInt(0, customerList.length - 1)];
      
      const adultQty = randomInt(1, 4);
      const childQty = randomInt(0, 2);
      
      const tourAmount = (adultQty * dep.AdultPrice) + (childQty * dep.ChildPrice);
      const totalAmount = tourAmount; // No transport/discount to keep it simple
      const paidAmount = totalAmount; // Fully paid
      const remainingAmount = 0;
      
      const createdAt = randomDateLast6Months();
      const code = generateBookingCode() + i;

      await pool.request()
        .input('BookingCode', sql.VarChar(50), code)
        .input('CustomerId', sql.BigInt, cus.UserId)
        .input('TourId', sql.BigInt, dep.TourId)
        .input('DepartureId', sql.BigInt, dep.DepartureId)
        .input('CustomerFullName', sql.NVarChar(100), cus.FullName)
        .input('CustomerPhone', sql.VarChar(20), cus.Phone)
        .input('CustomerEmail', sql.VarChar(100), cus.Email)
        .input('TourCodeSnapshot', sql.VarChar(50), dep.TourCode)
        .input('TourTitleSnapshot', sql.NVarChar(255), dep.TourTitle)
        .input('StartDateSnapshot', sql.DateTime2, dep.StartDate)
        .input('EndDateSnapshot', sql.DateTime2, dep.EndDate)
        .input('DurationDaysSnapshot', sql.Int, dep.DurationDays)
        .input('DurationNightsSnapshot', sql.Int, dep.DurationNights)
        .input('AdultQuantity', sql.Int, adultQty)
        .input('ChildQuantity', sql.Int, childQty)
        .input('AdultPrice', sql.Decimal(18,2), dep.AdultPrice)
        .input('ChildPrice', sql.Decimal(18,2), dep.ChildPrice)
        .input('TourAmount', sql.Decimal(18,2), tourAmount)
        .input('TotalAmount', sql.Decimal(18,2), totalAmount)
        .input('PaidAmount', sql.Decimal(18,2), paidAmount)
        .input('RemainingAmount', sql.Decimal(18,2), remainingAmount)
        .input('PaymentStatus', sql.VarChar(20), 'paid')
        .input('Status', sql.VarChar(20), 'completed')
        .input('CreatedAt', sql.DateTime2, createdAt)
        .query(`
          INSERT INTO Bookings (
            BookingCode, CustomerId, TourId, DepartureId, 
            CustomerFullName, CustomerPhone, CustomerEmail, 
            TourCodeSnapshot, TourTitleSnapshot, StartDateSnapshot, EndDateSnapshot,
            DurationDaysSnapshot, DurationNightsSnapshot,
            AdultQuantity, ChildQuantity, InfantQuantity,
            AdultPrice, ChildPrice, InfantPrice,
            TourAmount, TransportAmount, DiscountAmount, TaxAmount, 
            TotalAmount, PaidAmount, RemainingAmount,
            PaymentStatus, Status, CreatedAt, UpdatedAt
          ) VALUES (
            @BookingCode, @CustomerId, @TourId, @DepartureId,
            @CustomerFullName, @CustomerPhone, @CustomerEmail,
            @TourCodeSnapshot, @TourTitleSnapshot, @StartDateSnapshot, @EndDateSnapshot,
            @DurationDaysSnapshot, @DurationNightsSnapshot,
            @AdultQuantity, @ChildQuantity, 0,
            @AdultPrice, @ChildPrice, 0,
            @TourAmount, 0, 0, 0,
            @TotalAmount, @PaidAmount, @RemainingAmount,
            @PaymentStatus, @Status, @CreatedAt, @CreatedAt
          )
        `);
    }

    console.log('Successfully inserted 50 mock bookings.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
