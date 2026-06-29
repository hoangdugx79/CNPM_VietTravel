// Script tạo bcrypt hash để chạy 1 lần
// Chạy: node generate_hashes.js
const bcrypt = require('bcryptjs');

async function generate() {
  const passwords = [
    { label: 'Admin (Admin@123456)', plain: 'Admin@123456' },
    { label: 'Customer (Customer@123)', plain: 'Customer@123' },
    { label: 'Driver (Driver@123)', plain: 'Driver@123' },
  ];

  console.log('Generating bcrypt hashes...\n');
  for (const p of passwords) {
    const hash = await bcrypt.hash(p.plain, 10);
    console.log(`-- ${p.label}`);
    console.log(`Hash: ${hash}`);
    console.log('');
  }

  console.log('\nSQL UPDATE Commands:');
  const adminHash = await bcrypt.hash('Admin@123456', 10);
  const custHash = await bcrypt.hash('Customer@123', 10);
  
  console.log(`\nUSE TravelTourDB;`);
  console.log(`UPDATE Users SET PasswordHash = '${adminHash}' WHERE Email = 'admin@travel.com';`);
  console.log(`UPDATE Users SET PasswordHash = '${custHash}' WHERE Email = 'vana@gmail.com';`);
  console.log(`\nGO`);
  
  console.log('\nLogin credentials:');
  console.log('  Admin: admin@travel.com / Admin@123456');
  console.log('  Customer: vana@gmail.com / Customer@123');
}

generate().catch(console.error);
