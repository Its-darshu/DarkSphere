import { neon } from '@neondatabase/serverless'

// Initialize Neon database connection
const sql = neon(process.env.DATABASE_URL!)

// Enhanced error logging utility
const logDatabaseError = (operation: string, error: any, context?: any) => {
  console.error(`🔴 Database Error [${operation}]:`, {
    error: error.message || error,
    context,
    timestamp: new Date().toISOString(),
    stack: error.stack?.substring(0, 500)
  })
}

// Database operation wrapper with error handling and retries
const withErrorHandling = async <T>(
  operation: string,
  fn: () => Promise<T>,
  context?: any,
  retries: number = 2
): Promise<T> => {
  let lastError: any
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const startTime = Date.now()
      const result = await fn()
      const duration = Date.now() - startTime
      
      console.log(`✅ Database Success [${operation}] (${duration}ms)`, context ? { context } : '')
      return result
    } catch (error) {
      lastError = error
      
      if (attempt < retries) {
        console.warn(`⚠️ Database Retry [${operation}] Attempt ${attempt + 1}/${retries + 1}`)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100))
      }
    }
  }
  
  logDatabaseError(operation, lastError, context)
  throw new Error(`Database operation failed after ${retries + 1} attempts: ${operation}`)
}

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  full_name: string;
  user_type: 'admin' | 'user';
  bio?: string;
  location?: string;
  website?: string;
  social_github?: string;
  social_linkedin?: string;
  social_twitter?: string;
  social_instagram?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Post {
  id: string;
  content: string;
  author_id: string;
  likes_count: number;
  comments_count: number;
  created_at: Date;
  updated_at: Date;
  author?: User;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  likes_count: number;
  created_at: Date;
  updated_at: Date;
  author?: User;
}

export interface SecurityKey {
  id: string;
  key_value: string;
  key_type: 'admin' | 'user';
  is_used: boolean;
  used_by?: string;
  created_at: Date;
  used_at?: Date;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  announcement_type: 'info' | 'warning' | 'success';
  created_by: string;
  created_at: Date;
  author?: User;
}

// Database utility functions
export class Database {
  // User operations
  static async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    return withErrorHandling('createUser', async () => {
      const rows = await sql`
        INSERT INTO users (username, email, password_hash, full_name, user_type, bio, location, website, social_github, social_linkedin, social_twitter, social_instagram)
        VALUES (${userData.username}, ${userData.email}, ${userData.password_hash}, ${userData.full_name}, ${userData.user_type}, ${userData.bio || null}, ${userData.location || null}, ${userData.website || null}, ${userData.social_github || null}, ${userData.social_linkedin || null}, ${userData.social_twitter || null}, ${userData.social_instagram || null})
        RETURNING *
      `
      return rows[0] as User
    }, { username: userData.username, email: userData.email })
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    return withErrorHandling('getUserByEmail', async () => {
      const rows = await sql`SELECT * FROM users WHERE email = ${email}`
      return rows[0] as User || null
    }, { email })
  }

  static async getUserByUsername(username: string): Promise<User | null> {
    return withErrorHandling('getUserByUsername', async () => {
      const rows = await sql`SELECT * FROM users WHERE username = ${username}`
      return rows[0] as User || null
    }, { username })
  }

  static async getUserById(id: string): Promise<User | null> {
    return withErrorHandling('getUserById', async () => {
      const rows = await sql`SELECT * FROM users WHERE id = ${id}`
      return rows[0] as User || null
    }, { id })
  }

  static async getAllUsers(): Promise<User[]> {
    const rows = await sql`
      SELECT id, username, email, full_name, user_type, bio, location, website, 
             social_github, social_linkedin, social_twitter, social_instagram, created_at, updated_at
      FROM users 
      ORDER BY created_at DESC
    `
    return rows as User[]
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    // For now, let's implement a simpler version that only updates common fields
    const allowedFields = ['full_name', 'bio', 'location', 'website', 'social_github', 'social_linkedin', 'social_twitter', 'social_instagram']
    const updateEntries = Object.entries(updates).filter(([key]) => allowedFields.includes(key) && updates[key as keyof User] !== undefined)
    
    if (updateEntries.length === 0) return null

    // Build update query dynamically - for now let's handle the most common case
    if (updates.full_name !== undefined) {
      const rows = await sql`
        UPDATE users SET full_name = ${updates.full_name}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${id} RETURNING *
      `
      return rows[0] as User || null
    }

    if (updates.bio !== undefined) {
      const rows = await sql`
        UPDATE users SET bio = ${updates.bio}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${id} RETURNING *
      `
      return rows[0] as User || null
    }

    return null
  }

  static async deleteUser(id: string): Promise<boolean> {
    const result = await sql`DELETE FROM users WHERE id = ${id}`
    return result.length > 0
  }

  // Post operations
  static async createPost(postData: Omit<Post, 'id' | 'likes_count' | 'comments_count' | 'created_at' | 'updated_at'>): Promise<Post> {
    return withErrorHandling('createPost', async () => {
      const rows = await sql`
        INSERT INTO posts (content, author_id)
        VALUES (${postData.content}, ${postData.author_id})
        RETURNING *
      `
      return rows[0] as Post
    }, { author_id: postData.author_id, content_length: postData.content.length })
  }

  static async getAllPosts(limit: number = 50, offset: number = 0): Promise<Post[]> {
    return withErrorHandling('getAllPosts', async () => {
      const rows = await sql`
        SELECT p.*, u.username, u.full_name, u.user_type
        FROM posts p
        JOIN users u ON p.author_id = u.id
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      
      return rows.map((row: any) => ({
        id: row.id,
        content: row.content,
        author_id: row.author_id,
        likes_count: row.likes_count,
        comments_count: row.comments_count,
        created_at: row.created_at,
        updated_at: row.updated_at,
        author: {
          id: row.author_id,
          username: row.username,
          full_name: row.full_name,
          user_type: row.user_type
        } as User
      }))
    }, { limit, offset })
  }

  static async getPostById(id: string): Promise<Post | null> {
    const rows = await sql`
      SELECT p.*, u.username, u.full_name, u.user_type
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.id = ${id}
    `
    
    if (rows.length === 0) return null
    
    const row = rows[0]
    return {
      id: row.id,
      content: row.content,
      author_id: row.author_id,
      likes_count: row.likes_count,
      comments_count: row.comments_count,
      created_at: row.created_at,
      updated_at: row.updated_at,
      author: {
        id: row.author_id,
        username: row.username,
        full_name: row.full_name,
        user_type: row.user_type
      } as User
    }
  }

  static async deletePost(id: string): Promise<boolean> {
    return withErrorHandling('deletePost', async () => {
      const result = await sql`DELETE FROM posts WHERE id = ${id}`;
      return result.length > 0;
    }, { post_id: id });
  }

  // Comment operations
  static async createComment(commentData: Omit<Comment, 'id' | 'likes_count' | 'created_at' | 'updated_at'>): Promise<Comment> {
    const rows = await sql`
      INSERT INTO comments (post_id, author_id, content)
      VALUES (${commentData.post_id}, ${commentData.author_id}, ${commentData.content})
      RETURNING *
    `
    return rows[0] as Comment
  }

  static async getCommentsByPostId(postId: string): Promise<Comment[]> {
    const rows = await sql`
      SELECT c.*, u.username, u.full_name, u.user_type
      FROM comments c
      JOIN users u ON c.author_id = u.id
      WHERE c.post_id = ${postId}
      ORDER BY c.created_at ASC
    `
    
    return rows.map((row: any) => ({
      id: row.id,
      post_id: row.post_id,
      author_id: row.author_id,
      content: row.content,
      likes_count: row.likes_count,
      created_at: row.created_at,
      updated_at: row.updated_at,
      author: {
        id: row.author_id,
        username: row.username,
        full_name: row.full_name,
        user_type: row.user_type
      } as User
    }))
  }

  // Like operations
  static async togglePostLike(userId: string, postId: string): Promise<boolean> {
    // Check if like exists
    const existingLike = await sql`
      SELECT id FROM likes WHERE user_id = ${userId} AND post_id = ${postId}
    `

    if (existingLike.length > 0) {
      // Unlike
      await sql`DELETE FROM likes WHERE user_id = ${userId} AND post_id = ${postId}`
      return false
    } else {
      // Like
      await sql`INSERT INTO likes (user_id, post_id) VALUES (${userId}, ${postId})`
      return true
    }
  }

  static async getUserPostLikes(userId: string): Promise<string[]> {
    const rows = await sql`
      SELECT post_id FROM likes WHERE user_id = ${userId} AND post_id IS NOT NULL
    `
    return rows.map((row: any) => row.post_id)
  }

  // Security Key operations
  static async createSecurityKeys(keys: Array<Omit<SecurityKey, 'id' | 'is_used' | 'created_at'>>): Promise<SecurityKey[]> {
    const insertPromises = keys.map(key => 
      sql`INSERT INTO security_keys (key_value, key_type) VALUES (${key.key_value}, ${key.key_type}) RETURNING *`
    )
    
    const results = await Promise.all(insertPromises)
    return results.map(result => result[0] as SecurityKey)
  }

  static async getSecurityKeyByValue(keyValue: string): Promise<SecurityKey | null> {
    const rows = await sql`SELECT * FROM security_keys WHERE key_value = ${keyValue}`
    return rows[0] as SecurityKey || null
  }

  static async getAllSecurityKeys(): Promise<SecurityKey[]> {
    const rows = await sql`
      SELECT s.*, u.username as used_by_username
      FROM security_keys s
      LEFT JOIN users u ON s.used_by = u.id
      ORDER BY s.created_at DESC
    `
    
    return rows.map((row: any) => ({
      id: row.id,
      key_value: row.key_value,
      key_type: row.key_type,
      is_used: row.is_used,
      used_by: row.used_by,
      created_at: row.created_at,
      used_at: row.used_at,
      used_by_username: row.used_by_username || undefined
    })) as (SecurityKey & { used_by_username?: string })[]
  }

  static async useSecurityKey(keyValue: string, userId: string): Promise<boolean> {
    const result = await sql`
      UPDATE security_keys 
      SET is_used = true, used_by = ${userId}, used_at = CURRENT_TIMESTAMP 
      WHERE key_value = ${keyValue} AND is_used = false
    `
    return result.length > 0
  }

  static async deleteSecurityKey(id: string): Promise<boolean> {
    const result = await sql`DELETE FROM security_keys WHERE id = ${id}`
    return result.length > 0
  }

  // Announcement operations
  static async createAnnouncement(announcementData: Omit<Announcement, 'id' | 'created_at'>): Promise<Announcement> {
    return withErrorHandling('createAnnouncement', async () => {
      const rows = await sql`
        INSERT INTO announcements (title, content, announcement_type, created_by)
        VALUES (${announcementData.title}, ${announcementData.content}, ${announcementData.announcement_type}, ${announcementData.created_by})
        RETURNING *
      `;
      return rows[0] as Announcement;
    }, { created_by: announcementData.created_by, type: announcementData.announcement_type });
  }

  static async getAllAnnouncements(): Promise<Announcement[]> {
    return withErrorHandling('getAllAnnouncements', async () => {
      const rows = await sql`
        SELECT a.*, u.username, u.full_name
        FROM announcements a
        JOIN users u ON a.created_by = u.id
        ORDER BY a.created_at DESC
      `;
      
      return rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        content: row.content,
        announcement_type: row.announcement_type,
        created_by: row.created_by,
        created_at: row.created_at,
        author: {
          id: row.created_by,
          username: row.username,
          full_name: row.full_name
        } as User
      }));
    });
  }

  static async deleteAnnouncement(id: string): Promise<boolean> {
    return withErrorHandling('deleteAnnouncement', async () => {
      const result = await sql`DELETE FROM announcements WHERE id = ${id}`;
      return result.length > 0;
    }, { announcement_id: id });
  }

  static async dismissAnnouncement(userId: string, announcementId: string): Promise<boolean> {
    try {
      await sql`
        INSERT INTO user_announcement_dismissals (user_id, announcement_id)
        VALUES (${userId}, ${announcementId})
        ON CONFLICT (user_id, announcement_id) DO NOTHING
      `
      return true
    } catch {
      return false
    }
  }

  static async getUserDismissedAnnouncements(userId: string): Promise<string[]> {
    const rows = await sql`
      SELECT announcement_id FROM user_announcement_dismissals WHERE user_id = ${userId}
    `
    return rows.map((row: any) => row.announcement_id)
  }
}