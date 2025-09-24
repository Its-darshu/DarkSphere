# 🌑 DarkSphere - Social Media Platform

DarkSphere is a modern, dark-themed social media platform where users can share their thoughts, connect with others, and engage through likes and comments. Built with Next.js, React, and TypeScript.

## ✨ Features

- **🔐 Security Key Authentication**: Private invite-only platform with admin and user roles
- **💭 Thought Sharing**: Share your thoughts and ideas with the community
- **❤️ Dynamic Likes System**: Posts with more likes automatically rise to the top
- **👤 User Profiles**: Create and manage your profile
- **🎨 Dark Theme**: Beautiful dark UI optimized for reading
- **📱 Responsive Design**: Works perfectly on desktop and mobile
- **⚡ Real-time Updates**: Instant post creation and interactions
- **🔍 Search Functionality**: Find posts and users easily
- **🗑️ Content Management**: Users can delete their own posts, admins can moderate all content
- **🛡️ Advanced Admin Panel**: 
  - **🔑 Security Key Generator**: Create new admin and user keys
  - **👥 User Management**: View and delete user accounts with confirmation
  - **📢 Announcement System**: Create announcements visible to all users
  - **⚠️ Confirmation Dialogs**: Safe delete operations with confirmation prompts
- **👤 Enhanced User Profiles**:
  - **📝 Personal Bio**: Add and edit personal descriptions
  - **🌍 Social Media Integration**: Link GitHub, LinkedIn, Twitter, Instagram profiles
  - **📍 Location & Website**: Display location and personal website
  - **📊 User Statistics**: Show post count and total likes received
  - **🎨 Profile Customization**: Edit all profile information in-place
- **🔍 Community Directory**:
  - **👥 Browse All Users**: Discover all community members
  - **🔍 Advanced Search**: Search by name, username, bio, or location
  - **📊 Sorting Options**: Sort by name, posts, likes, or join date
  - **📱 Responsive Cards**: Beautiful user profile cards with quick stats

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DarkSphere
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 Security Keys (Demo)

DarkSphere uses security keys to control access. Here are the demo keys you can use:

### Admin Keys (Full Access)
- `ADMIN-SUPER-ACCESS`
- `ADMIN-FOUNDER-KEY`
- `ADMIN-MYCOMPANY-2025`

### User Keys (Standard Access)  
- `USER-BETA-TESTER`
- `USER-WELCOME-2025`
- `USER-EMPLOYEE-001`

## 📖 How to Use

### 1. **Registration**
   - Visit the homepage
   - Enter one of the security keys above
   - Fill in your profile information
   - Create your account

### 2. **Login**
   - If you already have an account, click "Already have an account? Sign in"
   - Enter your email and password

### 3. **Dashboard Features**
   - **Post Thoughts**: Use the text area at the top to share your thoughts (500 character limit)
   - **Like Posts**: Click the heart icon to like posts you enjoy
   - **Search**: Use the search bar to find specific posts or users
   - **Delete**: Remove your own posts (admins can delete any post)
   - **Ranking**: Posts automatically sort by likes (most liked at the top)
   - **User Navigation**: Click usernames in posts to view their profiles
   - **Browse Community**: Click the Users icon to see all community members
   - **My Profile**: Click your profile icon to view/edit your profile

### 4. **Profile System**
   - **Personal Profiles**: Each user gets a dedicated profile page at `/profile/username`
   - **Profile Editing**: Users can edit their own profiles with:
     - Personal bio (200 characters)
     - Location information
     - Personal website
     - Social media links (GitHub, LinkedIn, Twitter, Instagram)
   - **Profile Statistics**: See total posts and likes received
   - **Post History**: View all posts by a specific user
   - **Social Links**: Direct links to external social media profiles

### 5. **Community Directory**
   - **User Discovery**: Browse all registered community members
   - **Advanced Search**: Search users by name, username, bio, or location
   - **Smart Sorting**: Sort by name, post count, likes received, or join date
   - **Quick Stats**: See user post counts and total likes at a glance
   - **Profile Navigation**: Click any user card to visit their full profile

### 6. **Admin Features**
   - Admins get special badges and settings icon in header
   - **Admin Panel Access**: Click the settings icon to access admin panel
   - **Security Key Management**: Generate new admin/user keys, delete existing keys
   - **User Management**: View all users, delete user accounts (with confirmation)
   - **Announcements**: Create system-wide announcements visible to all users
   - **Content Moderation**: Can delete any user's post
   - **Confirmation Dialogs**: All delete operations require confirmation for safety

### 7. **Admin Panel Features**
   - **Security Keys Tab**: 
     - Generate bulk security keys (admin or user type)
     - Copy keys to clipboard
     - View key usage status
     - Delete unused keys
   - **User Management Tab**:
     - View all registered users
     - Delete user accounts (removes user and their posts)
     - Cannot delete your own admin account
   - **Announcements Tab**:
     - Create announcements with different types (info, warning, success)
     - Announcements appear at the top of dashboard for all users
     - Users can dismiss announcements
     - Delete announcements

## 🎨 Design Features

- **Dark Theme**: Easy on the eyes with a modern dark interface
- **Smooth Animations**: Subtle animations enhance user experience
- **Responsive Layout**: Optimized for all screen sizes
- **Color Coding**: 
  - Blue: Primary actions and links
  - Red: Likes and important actions
  - Green: Success states and positive actions
  - Gray: Secondary text and borders

## 🛠️ Technical Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom dark theme
- **Icons**: Lucide React
- **Data Storage**: Local Storage (for demo purposes)
- **State Management**: React useState and useEffect

## 📁 Project Structure

```
DarkSphere/
├── src/
│   └── app/
│       ├── globals.css          # Global styles and Tailwind
│       ├── layout.tsx           # Root layout component
│       ├── page.tsx            # Authentication page
│       └── dashboard/
│           └── page.tsx        # Main dashboard
├── public/                     # Static assets
├── package.json               # Dependencies and scripts
├── tailwind.config.js         # Tailwind configuration
├── next.config.js            # Next.js configuration
└── tsconfig.json             # TypeScript configuration
```

## 🎯 Key Features Explained

### Authentication Flow
1. **Security Key Validation**: Users must provide a valid security key
2. **Role Assignment**: Keys determine if user becomes admin or regular user
3. **Profile Creation**: Users fill in their profile information
4. **Local Storage**: Demo uses localStorage for persistence

### Posting System
- **Character Limit**: 500 characters per post
- **Instant Publishing**: Posts appear immediately after creation
- **Timestamp Display**: Shows relative time (e.g., "2h", "1d ago")

### Ranking Algorithm
- **Like-Based Sorting**: Posts automatically reorder based on like count
- **Real-time Updates**: Ranking updates instantly when likes change
- **User Interaction**: Users can like/unlike posts with immediate visual feedback

### Security Features
- **Role-Based Access**: Admins have additional moderation capabilities
- **Content Ownership**: Users can only delete their own content (except admins)
- **Secure Keys**: One-time use security keys prevent unauthorized access

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Customization

You can easily customize DarkSphere by:
- Modifying colors in `tailwind.config.js`
- Changing security keys in the `SECURITY_KEYS` object
- Adding new features to the dashboard
- Implementing a real backend API

## 🚀 Deployment

For production deployment:

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to your preferred platform**
   - Vercel (recommended for Next.js)
   - Netlify
   - AWS
   - Any Node.js hosting provider

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎉 Demo Experience

The current implementation includes:
- ✅ Complete authentication with security keys
- ✅ Thought posting and sharing
- ✅ Like system with real-time ranking
- ✅ User profiles and management
- ✅ Admin moderation capabilities
- ✅ Search functionality
- ✅ Responsive dark theme design
- ✅ Local data persistence

## 🔮 Future Enhancements

Potential improvements for a full production version:
- Real backend API with database
- User-to-user messaging
- Image/media posting
- Comment threads
- Push notifications
- User following system
- Advanced content filtering
- Real-time chat functionality

---

**Welcome to DarkSphere!** 🌑✨ Start sharing your thoughts and connecting with others in this modern, secure social platform.#   D a r k S p h e r e  
 