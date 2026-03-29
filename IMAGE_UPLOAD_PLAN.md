# 📸 Image Upload for Posts (Twitter-style)

## 🎯 What You Want:

Users can attach images when creating posts, like:
```
[Text box: "What's happening?"]
[Image upload area: Click or drag to add image]
[Post button]
```

---

## ✅ Your Schema is Ready!

Post model already has `imageUrl` field:
```prisma
model Post {
  id        String   @id
  content   String
  imageUrl  String?  ← Already here!
  ...
}
```

---

## 🚀 What I'll Add:

### 1. Supabase Storage Setup
- Create `posts` bucket for image storage
- Set public access policies

### 2. Upload Helper (`lib/supabase-storage.ts`)
```typescript
- uploadPostImage(file) → Returns image URL
- deletePostImage(url) → Cleanup on post delete
- compressImage() → Reduce file size before upload
```

### 3. Enhanced CreatePostForm Component
```typescript
- Image preview before posting
- Drag-and-drop support
- Remove image button
- File size validation (max 5MB)
- Image compression
```

### 4. Display Images in Posts
- Show images in PostCard component
- Clickable to view full size
- Responsive sizing

---

## 🖼️ How It Works:

1. User writes post text
2. User clicks "Add Image" or drags image
3. Image preview appears
4. Click "Post"
5. Image uploads to Supabase → Gets URL
6. URL saved with post in database
7. Image displays in feed

---

## 📱 Features:

✅ Drag-and-drop image upload
✅ Image preview before posting
✅ Remove image before posting
✅ Auto-compress large images
✅ Support: JPG, PNG, GIF, WebP
✅ Max size: 5MB
✅ Fast CDN delivery
✅ Responsive image display

---

## 💰 Cost:

**FREE** (Supabase Storage free tier)
- 1GB storage = ~10,000 post images
- 2GB bandwidth = ~20,000 image views/month

---

Ready to add it? I'll:
1. Create Supabase storage bucket
2. Add upload helper functions
3. Update CreatePostForm with image upload
4. Update PostCard to display images
5. Test everything

Takes ~15 minutes to implement. Want me to do it?
