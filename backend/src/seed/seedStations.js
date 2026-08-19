require('dotenv').config();
const sequelize = require('../config/db');
const Station = require('../models/Station');
const PriceReport = require('../models/PriceReport');

const stations = [
  // Lagos Stations
  { name: 'NNPC Mega Station', brand: 'NNPC', address: 'Ikeja, Lagos', lat: 6.6018, lng: 3.3515 },
  { name: 'TotalEnergies Filling Station', brand: 'TotalEnergies', address: 'Opebi, Lagos', lat: 6.5904, lng: 3.3618 },
  { name: 'Mobil Filling Station', brand: 'Mobil', address: 'Allen Avenue, Lagos', lat: 6.6012, lng: 3.3491 },
  { name: 'Conoil Filling Station', brand: 'Conoil', address: 'Maryland, Lagos', lat: 6.5721, lng: 3.3622 },
  { name: 'Oando Filling Station', brand: 'Oando', address: 'Ojota, Lagos', lat: 6.5779, lng: 3.3785 },
  
  // Kaduna Stations (Real Coordinates)
  { name: 'NNPC Mega Station', brand: 'NNPC', address: 'Ali Akilu Road, Kaduna', lat: 10.5222, lng: 7.4383 },
  { name: 'TotalEnergies Station', brand: 'TotalEnergies', address: 'Independence Way, Kaduna', lat: 10.5150, lng: 7.4250 },
  { name: 'Conoil Filling Station', brand: 'Conoil', address: 'Ahmadu Bello Way, Kaduna', lat: 10.5100, lng: 7.4150 },
  { name: 'Oando Filling Station', brand: 'Oando', address: 'Barnawa, Kaduna', lat: 10.4850, lng: 7.4320 },
  { name: 'MRS Filling Station', brand: 'MRS', address: 'Kakuri, Kaduna', lat: 10.4550, lng: 7.4200 },

  // Abuja Stations
  { name: 'NNPC Mega Station', brand: 'NNPC', address: 'Central Business District, Abuja', lat: 9.0578, lng: 7.4951 },
  { name: 'TotalEnergies Station', brand: 'TotalEnergies', address: 'Wuse Zone 4, Abuja', lat: 9.0643, lng: 7.4760 },
  { name: 'Mobil Filling Station', brand: 'Mobil', address: 'Garki, Abuja', lat: 9.0236, lng: 7.5031 }
];

const basePetrolPrice = 950;

async function seed() {
  try {
    await sequelize.sync({ alter: true });
    console.log('Seeding stations...');

    for (const [index, s] of stations.entries()) {
      const station = await Station.create(s);

      const variation = Math.floor(Math.random() * 60) - 20;
      const fuelAvailable = index % 6 !== 0;

      await PriceReport.create({
        stationId: station.id,
        fuelType: 'petrol',
        price: basePetrolPrice + variation,
        reportedBy: 'seed-data',
        fuelAvailable,
      });
    }

    console.log(`Successfully seeded ${stations.length} stations across Lagos, Kaduna, and Abuja.`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
