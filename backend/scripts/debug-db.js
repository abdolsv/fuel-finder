require('dotenv').config();
const { Sequelize } = require('sequelize');

console.log('DATABASE_URL is set:', Boolean(process.env.DATABASE_URL));
if (process.env.DATABASE_URL) {
  console.log('DATABASE_URL starts with:', process.env.DATABASE_URL.slice(0, 20) + '...');
  console.log('DATABASE_URL length:', process.env.DATABASE_URL.length);
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false },
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log('DB CONNECTION OK');
    process.exit(0);
  })
  .catch((err) => {
    console.error('DB CONNECTION FAILED');
    console.error('Name:', err.name);
    console.error('Message:', JSON.stringify(err.message));
    if (Array.isArray(err.errors)) {
      err.errors.forEach((e, i) => {
        console.error(`errors[${i}] name:`, e.name);
        console.error(`errors[${i}] message:`, e.message);
        console.error(`errors[${i}] code:`, e.code);
      });
    }
    if (err.original) {
      console.error('Original name:', err.original.name);
      console.error('Original message:', err.original.message);
      console.error('Original code:', err.original.code);
    }
    process.exit(1);
  });
