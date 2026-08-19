// Creates (or updates the password of) the single admin account, reading
// credentials from environment variables. There is no public registration
// endpoint on purpose — this script is the only way to create an admin.
//
// Usage:
//   ADMIN_EMAIL=admin@fuelfinder.ng ADMIN_PASSWORD=change-me npm run seed:admin
// or set ADMIN_EMAIL / ADMIN_PASSWORD in your .env file and just run:
//   npm run seed:admin

require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../config/db');
const User = require('../models/User');

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('❌ Set ADMIN_EMAIL and ADMIN_PASSWORD (in .env or the shell) before running this script.');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('❌ ADMIN_PASSWORD should be at least 8 characters.');
    process.exit(1);
  }

  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const passwordHash = await bcrypt.hash(password, 10);
    const normalizedEmail = email.toLowerCase().trim();

    const [user, created] = await User.findOrCreate({
      where: { email: normalizedEmail },
      defaults: { passwordHash, role: 'admin' },
    });

    if (!created) {
      user.passwordHash = passwordHash;
      await user.save();
      console.log(`✅ Updated password for existing admin: ${normalizedEmail}`);
    } else {
      console.log(`✅ Created admin account: ${normalizedEmail}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to seed admin account:', err);
    process.exit(1);
  }
}

seedAdmin();
