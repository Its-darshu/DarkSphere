# 🚨 CRITICAL SETUP REQUIRED

## ⚠️ Backend Cannot Start Without Firebase Service Account

Your backend needs a valid Firebase service account JSON file to run.

### How to Get Your Service Account Key:

1. **Go to Firebase Console:**
   https://console.firebase.google.com/project/darksphere-369/settings/serviceaccounts/adminsdk

2. **Generate Key:**
   - Click the "Generate New Private Key" button
   - A JSON file will download

3. **Save the File:**
   - Rename it to: `firebase-service-account.json`
   - Place it in: `F:\darksphere\backend\`
   - **IMPORTANT:** Replace the placeholder file!

4. **Update .env:**
   Edit `F:\darksphere\backend\.env`:
   ```env
   REGISTRATION_PASSCODE=ChooseYourSecretPasscode123
   ADMIN_EMAIL=your-actual-email@gmail.com
   ```

5. **Backend Will Auto-Restart:**
   Once you save the real service account file, nodemon will detect it and restart the server automatically.

---

## ✅ Frontend is Already Running!

The frontend is configured and running at: http://localhost:5173/

## 📝 Current Status:

### 🟢 WORKING:
- ✅ Frontend server running
- ✅ All "joke" references fixed to "post"
- ✅ Firebase web config set up
- ✅ All CSS imports fixed
- ✅ Backend code complete and ready

### 🔴 BLOCKED:
- ❌ Backend server (needs real Firebase service account)

---

## 🎯 Next Steps:

1. Download your Firebase service account key (see above)
2. Save it as `firebase-service-account.json` in the backend folder
3. Update the backend `.env` file with your passcode and email
4. Backend will automatically start!

**After that, your full app will be running! 🚀**
