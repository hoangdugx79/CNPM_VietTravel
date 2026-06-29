require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { getPool } = require('../src/db');

async function fixCategories() {
  try {
    const pool = await getPool();
    console.log('Mapping categories...');
    
    // Clear existing maps
    await pool.request().query(`DELETE FROM TourCategoryMaps`);

    // Map all tours (21, 22, 23, 24, 25, 26, 32) to category 1 (Tour trong nước)
    await pool.request().query(`
      INSERT INTO TourCategoryMaps (TourId, CategoryId) VALUES 
      (21, 1),
      (22, 1),
      (23, 1),
      (24, 1),
      (25, 1),
      (26, 1),
      (32, 1);
    `);

    // Map tours 22, 24, 25, 32 to category 2 (Tour nghỉ dưỡng)
    await pool.request().query(`
      INSERT INTO TourCategoryMaps (TourId, CategoryId) VALUES 
      (22, 2),
      (24, 2),
      (25, 2),
      (32, 2);
    `);

    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixCategories();
