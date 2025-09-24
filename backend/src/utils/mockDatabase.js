// Mock database for development/testing without PostgreSQL
class MockDatabase {
  constructor() {
    this.users = new Map()
    this.securityKeys = new Map()
    this.posts = new Map()
    this.comments = new Map()
    this.userSessions = new Map()
    
    // Initialize with some default security keys and sample data
    this.initializeSecurityKeys()
    this.initializeSampleData()
    this.nextUserId = 1
    this.nextPostId = 1
    this.nextCommentId = 1
  }

  initializeSecurityKeys() {
    // Admin keys
    this.securityKeys.set('ADMIN-SUPER-ACCESS', { 
      id: 1, 
      key_value: 'ADMIN-SUPER-ACCESS', 
      key_type: 'admin', 
      is_used: false, 
      used_by: null, 
      created_at: new Date() 
    })
    this.securityKeys.set('ADMIN-MASTER-KEY-2025', { 
      id: 2, 
      key_value: 'ADMIN-MASTER-KEY-2025', 
      key_type: 'admin', 
      is_used: false, 
      used_by: null, 
      created_at: new Date() 
    })
    
    // User keys - multiple available
    for (let i = 1; i <= 10; i++) {
      this.securityKeys.set(`USER-DEMO-KEY-00${i}`, { 
        id: i + 2, 
        key_value: `USER-DEMO-KEY-00${i}`, 
        key_type: 'user', 
        is_used: false, 
        used_by: null, 
        created_at: new Date() 
      })
    }
  }

  initializeSampleData() {
    // Add a sample admin user
    const adminUser = {
      id: 999,
      username: 'admin',
      email: 'admin@darksphere.com',
      password_hash: '$2a$10$example.hash.for.admin.user',
      full_name: 'Administrator',
      role: 'admin',
      is_active: true,
      bio: 'System Administrator',
      avatar_url: null,
      social_links: {},
      total_likes_received: 0,
      total_posts: 5,
      total_comments: 0,
      created_at: new Date()
    }
    this.users.set(999, adminUser)

    // Add sample posts
    const samplePosts = [
      {
        id: 1,
        author_id: 999,
        title: 'Welcome to DarkSphere!',
        content: 'Welcome to our private community platform. Share your innovative ideas and connect with like-minded individuals.',
        post_type: 'idea',
        is_anonymous: false,
        is_pinned: true,
        attachment_url: null,
        likes_count: 5,
        comments_count: 2,
        created_at: new Date(Date.now() - 86400000), // 1 day ago
        updated_at: new Date(Date.now() - 86400000)
      },
      {
        id: 2,
        author_id: 999,
        title: 'Platform Guidelines',
        content: 'Please follow our community guidelines: Be respectful, share constructive ideas, and help build a positive environment.',
        post_type: 'admin_notice',
        is_anonymous: false,
        is_pinned: true,
        attachment_url: null,
        likes_count: 10,
        comments_count: 0,
        created_at: new Date(Date.now() - 43200000), // 12 hours ago
        updated_at: new Date(Date.now() - 43200000)
      },
      {
        id: 3,
        author_id: 999,
        title: 'Feature Suggestion: Dark Mode',
        content: 'What do you think about adding a dark mode theme to the platform? It would be great for late-night browsing.',
        post_type: 'idea',
        is_anonymous: false,
        is_pinned: false,
        attachment_url: null,
        likes_count: 8,
        comments_count: 3,
        created_at: new Date(Date.now() - 21600000), // 6 hours ago
        updated_at: new Date(Date.now() - 21600000)
      }
    ]

    samplePosts.forEach(post => {
      this.posts.set(post.id, post)
    })

    this.nextPostId = 4 // Next available ID
  }

  // Mock SQL query method
  query(text, params = []) {
    console.log('Mock DB Query:', text.substring(0, 100) + '...', params)

    // Handle user authentication queries
    if (text.includes('SELECT') && text.includes('users') && text.includes('email')) {
      const email = params[0]
      for (const user of this.users.values()) {
        if (user.email === email) {
          return { rows: [user] }
        }
      }
      return { rows: [] }
    }

    // Handle user creation
    if (text.includes('INSERT INTO users')) {
      const [username, email, passwordHash, fullName, role] = params
      const user = {
        id: this.nextUserId++,
        username,
        email,
        password_hash: passwordHash,
        full_name: fullName,
        role: role || 'user',
        is_active: true,
        bio: null,
        avatar_url: null,
        social_links: {},
        total_likes_received: 0,
        total_posts: 0,
        total_comments: 0,
        created_at: new Date(),
        updated_at: new Date()
      }
      this.users.set(user.id, user)
      return { rows: [user] }
    }

    // Handle security key validation
    if (text.includes('SELECT') && text.includes('security_keys')) {
      const keyValue = params[0]
      const key = this.securityKeys.get(keyValue)
      if (key && !key.is_used) {
        return { rows: [key] }
      }
      return { rows: [] }
    }

    // Handle security key usage update
    if (text.includes('UPDATE security_keys') && text.includes('is_used')) {
      const [userId, keyId] = params
      for (const [keyValue, key] of this.securityKeys.entries()) {
        if (key.id === keyId) {
          key.is_used = true
          key.used_by = userId
          key.used_at = new Date()
          return { rows: [key] }
        }
      }
      return { rows: [] }
    }

    // Handle posts feed query
    if (text.includes('SELECT') && text.includes('posts') && text.includes('FROM posts')) {
      const postsArray = Array.from(this.posts.values()).map(post => {
        const author = this.users.get(post.author_id)
        return {
          ...post,
          author_name: post.is_anonymous ? 'Anonymous' : (author ? author.full_name : 'Unknown'),
          username: post.is_anonymous ? null : (author ? author.username : null),
          author_avatar: post.is_anonymous ? null : (author ? author.avatar_url : null),
          is_liked_by_user: false
        }
      })
      
      // Sort by pinned first, then by likes, then by date
      postsArray.sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1
        if (!a.is_pinned && b.is_pinned) return 1
        if (a.likes_count !== b.likes_count) return b.likes_count - a.likes_count
        return new Date(b.created_at) - new Date(a.created_at)
      })
      
      return { rows: postsArray }
    }

    // Handle single post query
    if (text.includes('SELECT') && text.includes('posts') && text.includes('WHERE p.id')) {
      const postId = parseInt(params[0])
      const post = this.posts.get(postId)
      if (post) {
        const author = this.users.get(post.author_id)
        const result = {
          ...post,
          author_name: post.is_anonymous ? 'Anonymous' : (author ? author.full_name : 'Unknown'),
          username: post.is_anonymous ? null : (author ? author.username : null),
          author_avatar: post.is_anonymous ? null : (author ? author.avatar_url : null),
          is_liked_by_user: false
        }
        return { rows: [result] }
      }
      return { rows: [] }
    }

    // Handle post creation
    if (text.includes('INSERT INTO posts')) {
      const [authorId, title, content, postType, isAnonymous, attachmentUrl] = params
      const post = {
        id: this.nextPostId++,
        author_id: authorId,
        title,
        content,
        post_type: postType || 'idea',
        is_anonymous: isAnonymous || false,
        is_pinned: false,
        attachment_url: attachmentUrl,
        likes_count: 0,
        comments_count: 0,
        created_at: new Date(),
        updated_at: new Date()
      }
      this.posts.set(post.id, post)
      return { rows: [post] }
    }

    // Handle user sessions for refresh tokens
    if (text.includes('INSERT INTO user_sessions')) {
      const [userId, refreshToken, expiresAt] = params
      const session = {
        id: Date.now(),
        user_id: userId,
        refresh_token: refreshToken,
        expires_at: expiresAt,
        created_at: new Date()
      }
      this.userSessions.set(refreshToken, session)
      return { rows: [session] }
    }

    if (text.includes('SELECT') && text.includes('user_sessions')) {
      const refreshToken = params[0]
      const session = this.userSessions.get(refreshToken)
      if (session && new Date(session.expires_at) > new Date()) {
        return { rows: [session] }
      }
      return { rows: [] }
    }

    if (text.includes('DELETE FROM user_sessions')) {
      const refreshToken = params[0]
      this.userSessions.delete(refreshToken)
      return { rows: [] }
    }

    // Default empty response
    console.log('Unhandled query:', text.substring(0, 50))
    return { rows: [] }
  }
}

// Export singleton instance
const mockDb = new MockDatabase()

console.log('🔧 Mock Database initialized with sample data')
console.log('📊 Available security keys:', Array.from(mockDb.securityKeys.keys()))
console.log('👤 Sample users:', Array.from(mockDb.users.values()).length)
console.log('📝 Sample posts:', Array.from(mockDb.posts.values()).length)

module.exports = {
  query: mockDb.query.bind(mockDb),
  pool: mockDb
}