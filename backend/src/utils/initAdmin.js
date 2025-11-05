require('dotenv').config();

async function createAdminUser() {
  // Per requirements: Admin should NOT be created in DB.
  // We only validate against environment variables during login.
  const required = [
    'ADMIN_USERNAME',
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD',
    'ADMIN_FIRST_NAME',
    'ADMIN_LAST_NAME',
  ];

  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    console.warn(
      `Warning: Missing admin environment variables: ${missing.join(', ')}. Admin login will fail until set.`
    );
  } else {
    console.log('Admin credentials loaded from environment.');
  }
}

module.exports = { createAdminUser };
