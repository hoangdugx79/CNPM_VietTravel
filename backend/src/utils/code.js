function generateBookingCode() {
  return `BK-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

function generatePaymentCode() {
  return `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

module.exports = { generateBookingCode, generatePaymentCode };
