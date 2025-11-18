# Admin Management Scripts

This folder contains utility scripts for managing users and admin access.

## 📋 Available Scripts

### 1. List All Users
```bash
node scripts/list-users.js
```
- Shows all registered users
- Displays their role, status, and creation date
- Useful for seeing who's in your database

### 2. Make User Admin
```bash
node scripts/make-admin.js <user-email>
```
- Promotes any user to admin role
- Example: `node scripts/make-admin.js user@gmail.com`
- If email not found, shows list of all users

## 🔧 Automatic Admin Assignment

Users can be automatically assigned admin role during registration by setting the `ADMIN_EMAIL` in `.env`:

```env
ADMIN_EMAIL=your-email@gmail.com
```

When a user with this email registers, they will automatically get admin privileges.

## 👑 Current Admin

**Email:** jeery299@gmail.com  
**Status:** ✅ Active

## 🚀 Quick Start

1. **See all users:**
   ```bash
   cd backend
   node scripts/list-users.js
   ```

2. **Make someone admin:**
   ```bash
   node scripts/make-admin.js email@example.com
   ```

3. **Set permanent admin email:**
   - Edit `backend/.env`
   - Update `ADMIN_EMAIL=your-email@gmail.com`
   - That email will auto-become admin on registration

## 📝 Notes

- Admin users can access `/admin` dashboard
- Admin users can create/manage passcodes
- Admin users can view/disable other users
- Admin users can delete flagged content
