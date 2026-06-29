require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { getPool, query } = require('../src/db');
async function updateDestinations() {
    try {
        await query("UPDATE Destinations SET ImageUrl = 'http://localhost:3000/uploads/da_nang_tour_1782322299912.png' WHERE DestinationId = 1");
        await query("UPDATE Destinations SET ImageUrl = 'http://localhost:3000/uploads/hoi_an_dest_1782322685125.png' WHERE DestinationId = 2");
        await query("UPDATE Destinations SET ImageUrl = 'http://localhost:3000/uploads/halong_bay_tour_1782322278488.png' WHERE DestinationId = 4");
        await query("UPDATE Destinations SET ImageUrl = 'http://localhost:3000/uploads/sapa_tour_1782322310930.png' WHERE DestinationId = 5");
        await query("UPDATE Destinations SET ImageUrl = 'http://localhost:3000/uploads/phu_quoc_tour_1782322289095.png' WHERE DestinationId = 6");
        await query("UPDATE Destinations SET ImageUrl = 'http://localhost:3000/uploads/nha_trang_dest_1782322695942.png' WHERE DestinationId = 7");
        await query("UPDATE Destinations SET ImageUrl = 'http://localhost:3000/uploads/ha_noi_dest_1782322704915.png' WHERE DestinationId = 8");
        await query("UPDATE Destinations SET ImageUrl = 'http://localhost:3000/uploads/ninh_binh_dest_1782322714824.png' WHERE DestinationId = 9");
        console.log('Update destinations done!');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
updateDestinations();
