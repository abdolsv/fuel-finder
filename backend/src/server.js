require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/db');
require('./models/Station');
require('./models/PriceReport');
require('./models/User');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    await sequelize.sync();
    console.log('Models synced.');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Unable to start server:', err);
    process.exit(1);
  }
}

start();
