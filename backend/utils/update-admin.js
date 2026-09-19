require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function updateAdmin() {
  const emailArg = process.argv[2];
  const passwordArg = process.argv[3];

  if (!emailArg || !passwordArg) {
    console.error('Usage: node utils/update-admin.js NEW_EMAIL NEW_PASSWORD');
    process.exit(1);
  }

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('ERROR: MONGO_URI or MONGODB_URI is not set in your environment.');
    process.exit(1);
  }

  const normalizedEmail = emailArg.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    console.error('ERROR: Provide a valid admin email address.');
    process.exit(1);
  }
  if (passwordArg.length < 8) {
    console.error('ERROR: Admin password must be at least 8 characters.');
    process.exit(1);
  }

  const rounds = Number(process.env.BCRYPT_ROUNDS || 12);
  const hashedPassword = await bcrypt.hash(passwordArg, rounds);

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const admin = await User.findOneAndUpdate(
      { role: 'admin' },
      {
        $set: {
          email: normalizedEmail,
          password: hashedPassword,
        },
        $setOnInsert: {
          firstName: 'Alpha',
          lastName: 'Admin',
          role: 'admin',
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );

    console.log(`Admin updated: ${admin.email}`);
  } finally {
    await mongoose.disconnect();
  }
}

updateAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
