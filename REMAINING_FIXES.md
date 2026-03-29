# DarkSphere - Remaining Issues to Fix

## BATCH 2: API Routes (Next.js 15+ params handling)

### 1. app/api/posts/[id]/comments/route.ts
- Line 5-10: Change params to Promise and await it
- Line 94-95: Wrap request.json() in try/catch for JSON parse errors

### 2. app/api/posts/[id]/route.ts
- Line 5-10: Await params Promise in GET handler
- Line 52-63: Await params in PATCH, wrap request.json() in try/catch
- Line 125-135: Fix params handling in DELETE (not a Promise)
- Line 66-79: Replace check-then-act with atomic update to prevent TOCTOU

### 3. app/api/likes/route.ts
- Line 85-88: Make message context-aware ("Post liked" vs "Comment liked")

### 4. app/api/retweets/route.ts
- Line 12: Wrap request.json() in try/catch for JSON parse errors
- Line 30-55: Add P2002 error handling for unique constraint TOCTOU race

## BATCH 3: Component Fixes

### 1. components/CommentCard.tsx
- Line 149-154: Add aria-label or hidden label to edit textarea
- Line 57-73: Add try/catch-finally and error callback to handleDelete
- Line 90-93: Replace location.reload() with state update via callback

### 2. components/CommentForm.tsx
- Line 91-98: Only render Cancel button if onCancel is provided

### 3. components/CommentThread.tsx
- Line 54-55: Validate data.comments before calling set Comments

### 4. components/CreatePostForm.tsx
- Line 46-51: Add setLoading(false) on success path

### 5. components/PostCard.tsx
- Line 45-62: Improve handleDelete error handling with finally
- Line 64-80: Improve handleLike error handling
- Line 82-98: Add onRetweetToggle callback to update state

## BATCH 4: Pages

### 1. app/(app)/layout.tsx
- Line 11-18: Check logout response.ok before redirecting

### 2. app/(app)/posts/[id]/page.tsx
- Line 70: Use actual current user ID, not post author ID
- Line 230-232: Add onClick to Comment button with scroll handler
- Line 40-53: Remove dead token extraction, use useCallback
- Line 77-92: Fix like state using functional updaters

### app/(auth)/signin/page.tsx
- Line 15: Remove console.log logging credentials

### 3. app/(auth)/signup/page.tsx
- Add htmlFor/id attributes to inputs
- Add autoComplete attributes

## BATCH 5: Database (Prisma migrations needed)

### 1. prisma/schema.prisma
- Like model: Add CHECK constraint (postId XOR commentId)
- Follow model: Add CHECK constraint (followerId != followingId)
- AdminLog: Change onDelete from Cascade to SetNull

**Migrations needed:**
```sql
-- Add to prisma/migrations/[timestamp]_add_constraints/migration.sql
ALTER TABLE "likes" ADD CONSTRAINT "likes_target_check"
  CHECK (("postId" IS NOT NULL AND "commentId" IS NULL)
         OR ("postId" IS NULL AND "commentId" IS NOT NULL));

ALTER TABLE "follows" ADD CONSTRAINT "follows_no_self_follow"
  CHECK ("followerId" != "followingId");
```

## BATCH 6: Utility Scripts

### create-test-user.js
- Line 27-31: Log full error and set process.exitCode = 1

---

## Implementation Priority

**CRITICAL (Security/Bugs):**
1. API route params handling (Batch 2.1-2.2)
2. TOCTOU race handling (Batch 2.2, 2.4)
3. Database constraints (Batch 5)

**IMPORTANT (Functionality):**
4. Component state fixes (Batch 3)
5. Page fixes (Batch 4)

**NICE-TO-HAVE (Quality):**
6. Logging improvements (Batch 6)
7. Accessibility (Batch 3-4)
