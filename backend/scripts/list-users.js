/**
 * Script to list all users in the database
 * Usage: node scripts/list-users.js
 */

require('dotenv').config();
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function listUsers() {
  try {
    console.log('📋 Fetching all users from database...\n');

    const snapshot = await db.collection('users')
      .orderBy('createdAt', 'desc')
      .get();

    if (snapshot.empty) {
      console.log('❌ No users found in the database.');
      console.log('\n💡 Register a new user at http://localhost:5173');
      process.exit(0);
    }

    console.log(`✅ Found ${snapshot.size} user(s):\n`);
    console.log('═'.repeat(80));

    snapshot.forEach((doc, index) => {
      const user = doc.data();
      const roleIcon = user.role === 'admin' ? '👑' : '👤';
      const statusIcon = user.disabled ? '🔴' : '🟢';
      
      console.log(`\n${index + 1}. ${roleIcon} ${user.displayName}`);
      console.log(`   Email:    ${user.email}`);
      console.log(`   Role:     ${user.role}`);
      console.log(`   Status:   ${statusIcon} ${user.disabled ? 'Disabled' : 'Active'}`);
      console.log(`   UID:      ${user.uid}`);
      
      if (user.createdAt) {
        const createdDate = user.createdAt.toDate();
        console.log(`   Created:  ${createdDate.toLocaleString()}`);
      }
    });

    console.log('\n' + '═'.repeat(80));
    console.log(`\n💡 To make a user admin, run:`);
    console.log(`   node scripts/make-admin.js <user-email>`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listUsers();
