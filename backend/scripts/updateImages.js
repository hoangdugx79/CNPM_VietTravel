require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { getPool, query } = require('../src/db');
async function updateImages() {
    try {
        await query("UPDATE Tours SET MainImageUrl = '/uploads/da_nang_tour_1782322299912.png' WHERE TourId = 21");
        await query("UPDATE Tours SET MainImageUrl = '/uploads/halong_bay_tour_1782322278488.png' WHERE TourId = 22");
        await query("UPDATE Tours SET MainImageUrl = '/uploads/sapa_tour_1782322310930.png' WHERE TourId = 23");
        await query("UPDATE Tours SET MainImageUrl = '/uploads/phu_quoc_tour_1782322289095.png' WHERE TourId = 24");
        await query("UPDATE Tours SET MainImageUrl = '/uploads/da_lat_tour_1782322321904.png' WHERE TourId = 25");
        await query("UPDATE Tours SET MainImageUrl = '/uploads/sapa_tour_1782322310930.png' WHERE TourId = 26");
        console.log('Update done!');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
updateImages();
