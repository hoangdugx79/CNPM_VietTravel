require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { getPool } = require('../src/db');

async function fixTransport() {
  try {
    const pool = await getPool();
    console.log('Fixing TransportServices encoding...');

    // Xe giường nằm cao cấp
    await pool.request().query(`
      UPDATE TransportServices 
      SET Name = N'Xe giường nằm cao cấp' 
      WHERE TransportServiceId IN (20, 22, 24, 26)
    `);

    // Xe Limousine 16 chỗ VIP
    await pool.request().query(`
      UPDATE TransportServices 
      SET Name = N'Xe Limousine 16 chỗ VIP' 
      WHERE TransportServiceId IN (21, 23, 25, 27)
    `);

    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixTransport();
