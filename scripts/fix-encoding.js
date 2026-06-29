require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { getPool } = require('../src/db');

async function fixData() {
  try {
    const pool = await getPool();
    console.log('Fixing Destinations encoding...');
    await pool.request().query(`
      UPDATE Destinations SET Name = N'Hạ Long', Description = N'Vịnh Hạ Long - Kỳ quan thiên nhiên' WHERE Slug = 'ha-long';
      UPDATE Destinations SET Name = N'Sapa', Description = N'Sapa - Thành phố trong sương' WHERE Slug = 'sapa';
      UPDATE Destinations SET Name = N'Phú Quốc', Description = N'Đảo ngọc Phú Quốc' WHERE Slug = 'phu-quoc';
      UPDATE Destinations SET Name = N'Nha Trang', Description = N'Nha Trang biển gọi' WHERE Slug = 'nha-trang';
      UPDATE Destinations SET Name = N'Hà Nội', Description = N'Thủ đô Hà Nội' WHERE Slug = 'ha-noi';
      UPDATE Destinations SET Name = N'Ninh Bình', Description = N'Ninh Bình - Vịnh Hạ Long trên cạn' WHERE Slug = 'ninh-binh';
    `);

    console.log('Fixing Drivers encoding...');
    await pool.request().query(`
      UPDATE Drivers SET FullName = N'Nguyễn Văn Tài' WHERE Email = 'tainguyen@email.com';
      UPDATE Drivers SET FullName = N'Trần Tuấn Lái' WHERE Email = 'tuanlai@email.com';
      UPDATE Drivers SET FullName = N'Lê Hoàng Bác' WHERE Email = 'hoangbac@email.com';
      UPDATE Drivers SET FullName = N'Phạm Tiến Phong' WHERE Email = 'phongtien@email.com';
    `);

    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixData();
