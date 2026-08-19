require('dotenv').config();

const sequelize = require('../config/db');
const Station = require('../models/Station');
const PriceReport = require('../models/PriceReport');

const stateLocations = [
  { state: 'Abia', capital: 'Umuahia', lat: 5.5249, lng: 7.4946 },
  { state: 'Adamawa', capital: 'Yola', lat: 9.2035, lng: 12.4954 },
  { state: 'Akwa Ibom', capital: 'Uyo', lat: 5.0377, lng: 7.9128 },
  { state: 'Anambra', capital: 'Awka', lat: 6.2101, lng: 7.0741 },
  { state: 'Bauchi', capital: 'Bauchi', lat: 10.3158, lng: 9.8442 },
  { state: 'Bayelsa', capital: 'Yenagoa', lat: 4.9267, lng: 6.2676 },
  { state: 'Benue', capital: 'Makurdi', lat: 7.7322, lng: 8.5391 },
  { state: 'Borno', capital: 'Maiduguri', lat: 11.8311, lng: 13.1510 },
  { state: 'Cross River', capital: 'Calabar', lat: 4.9757, lng: 8.3417 },
  { state: 'Delta', capital: 'Asaba', lat: 6.1980, lng: 6.7273 },
  { state: 'Ebonyi', capital: 'Abakaliki', lat: 6.3249, lng: 8.1137 },
  { state: 'Edo', capital: 'Benin City', lat: 6.3350, lng: 5.6037 },
  { state: 'Ekiti', capital: 'Ado-Ekiti', lat: 7.6210, lng: 5.2210 },
  { state: 'Enugu', capital: 'Enugu', lat: 6.4584, lng: 7.5464 },
  { state: 'Gombe', capital: 'Gombe', lat: 10.2897, lng: 11.1673 },
  { state: 'Imo', capital: 'Owerri', lat: 5.4896, lng: 7.0333 },
  { state: 'Jigawa', capital: 'Dutse', lat: 11.7562, lng: 9.3380 },
  { state: 'Kaduna', capital: 'Kaduna', lat: 10.5105, lng: 7.4165 },
  { state: 'Kano', capital: 'Kano', lat: 12.0022, lng: 8.5920 },
  { state: 'Katsina', capital: 'Katsina', lat: 12.9908, lng: 7.6000 },
  { state: 'Kebbi', capital: 'Birnin Kebbi', lat: 12.4539, lng: 4.1975 },
  { state: 'Kogi', capital: 'Lokoja', lat: 7.8023, lng: 6.7333 },
  { state: 'Kwara', capital: 'Ilorin', lat: 8.4966, lng: 4.5421 },
  { state: 'Lagos', capital: 'Ikeja', lat: 6.6018, lng: 3.3515 },
  { state: 'Nasarawa', capital: 'Lafia', lat: 8.4966, lng: 8.5150 },
  { state: 'Niger', capital: 'Minna', lat: 9.6139, lng: 6.5569 },
  { state: 'Ogun', capital: 'Abeokuta', lat: 7.1475, lng: 3.3619 },
  { state: 'Ondo', capital: 'Akure', lat: 7.2571, lng: 5.2058 },
  { state: 'Osun', capital: 'Osogbo', lat: 7.7827, lng: 4.5418 },
  { state: 'Oyo', capital: 'Ibadan', lat: 7.3775, lng: 3.9470 },
  { state: 'Plateau', capital: 'Jos', lat: 9.8965, lng: 8.8583 },
  { state: 'Rivers', capital: 'Port Harcourt', lat: 4.8156, lng: 7.0498 },
  { state: 'Sokoto', capital: 'Sokoto', lat: 13.0059, lng: 5.2476 },
  { state: 'Taraba', capital: 'Jalingo', lat: 8.8910, lng: 11.3669 },
  { state: 'Yobe', capital: 'Damaturu', lat: 11.7480, lng: 11.9608 },
  { state: 'Zamfara', capital: 'Gusau', lat: 12.1702, lng: 6.6641 },
  { state: 'FCT', capital: 'Abuja', lat: 9.0578, lng: 7.4951 },
];

const brands = [
  'NNPC',
  'TotalEnergies',
  'MRS',
  'Conoil',
  'Oando',
];

const coordinateOffsets = [
  { lat: 0.0000, lng: 0.0000 },
  { lat: 0.0060, lng: 0.0040 },
  { lat: -0.0050, lng: 0.0060 },
  { lat: 0.0040, lng: -0.0060 },
  { lat: -0.0060, lng: -0.0040 },
];

const basePetrolPrice = 950;

// Build station list.
// 36 states + FCT × 5 brands = 185 stations.
const stations = [];

for (const location of stateLocations) {
  for (let i = 0; i < brands.length; i++) {
    const offset = coordinateOffsets[i];

    stations.push({
      name: `${brands[i]} ${location.capital} Station`,
      brand: brands[i],
      state: location.state,
      address: `${location.capital}, ${location.state} State`,
      lat: Number((location.lat + offset.lat).toFixed(6)),
      lng: Number((location.lng + offset.lng).toFixed(6)),
    });
  }
}

async function seed() {
  try {
    console.log('');
    console.log('========================================');
    console.log('Fuel Finder Station Seeder');
    console.log('========================================');

    console.log('Connecting to database...');

    await sequelize.authenticate();

    console.log('Database connected.');
    console.log(`Preparing ${stations.length} stations...`);
    console.log('');

    let createdStations = 0;
    let existingStations = 0;
    let createdPriceReports = 0;

    for (const [index, stationData] of stations.entries()) {
      /*
       * Find the station first.
       *
       * This makes the seeder safe to run repeatedly.
       */
      const [station, created] = await Station.findOrCreate({
        where: {
          name: stationData.name,
          brand: stationData.brand,
          state: stationData.state,
        },

        defaults: {
          address: stationData.address,
          lat: stationData.lat,
          lng: stationData.lng,
        },
      });

      if (created) {
        createdStations++;

        /*
         * Generate a realistic demo petrol price.
         *
         * Base price: ₦950
         * Variation: -₦20 to +₦39
         */
        const variation = Math.floor(Math.random() * 60) - 20;

        /*
         * Approximately 1 out of every 6 stations
         * will initially report fuel unavailable.
         */
        const fuelAvailable = index % 6 !== 0;

        await PriceReport.create({
          stationId: station.id,
          fuelType: 'petrol',
          price: basePetrolPrice + variation,
          reportedBy: 'seed-data',
          fuelAvailable,
        });

        createdPriceReports++;

        console.log(
          `✓ Created: ${stationData.name} (${stationData.state})`
        );
      } else {
        existingStations++;

        console.log(
          `• Exists:  ${stationData.name} (${stationData.state})`
        );
      }
    }

    console.log('');
    console.log('========================================');
    console.log('Fuel Finder seeding completed');
    console.log('========================================');
    console.log(`Locations covered: ${stateLocations.length}`);
    console.log(`Expected stations: ${stations.length}`);
    console.log(`New stations created: ${createdStations}`);
    console.log(`Existing stations skipped: ${existingStations}`);
    console.log(`New price reports: ${createdPriceReports}`);
    console.log('Coverage: 36 states + FCT');
    console.log('========================================');
    console.log('');

    await sequelize.close();

    process.exit(0);
  } catch (err) {
    console.error('');
    console.error('========================================');
    console.error('❌ Station seeding failed');
    console.error('========================================');
    console.error(err);
    console.error('========================================');

    try {
      await sequelize.close();
    } catch (_) {}

    process.exit(1);
  }
}

seed();
