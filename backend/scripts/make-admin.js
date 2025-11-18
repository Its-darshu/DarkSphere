/**
 * Script to manually promote a user to admin
 * Usage: node scripts/make-admin.js <user-email>
 */

require('dotenv').config();
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function makeAdmin(email) {
  try {
    console.log(`🔍 Searching for user with email: ${email}`);

    // Find user by email
    const usersSnapshot = await db.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      console.log('❌ No user found with that email');
      console.log('\n💡 Available users:');
      
      // Show all users
      const allUsers = await db.collection('users').get();
      allUsers.forEach(doc => {
        const user = doc.data();
        console.log(`   - ${user.email} (${user.displayName}) - Role: ${user.role}`);
      });
      
      process.exit(1);
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();

    console.log(`\n✅ Found user: ${userData.displayName} (${userData.email})`);
    console.log(`   Current role: ${userData.role}`);

    if (userData.role === 'admin') {
      console.log('ℹ️  User is already an admin!');
      process.exit(0);
    }

    // Update user to admin
    await db.collection('users').doc(userDoc.id).update({
      role: 'admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('\n🎉 SUCCESS! User is now an admin!');
    console.log(`   Email: ${userData.email}`);
    console.log(`   Name: ${userData.displayName}`);
    console.log(`   Role: admin ✨`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.log('❌ Usage: node scripts/make-admin.js <user-email>');
  console.log('   Example: node scripts/make-admin.js user@gmail.com');
  process.exit(1);
}

makeAdmin(email);
