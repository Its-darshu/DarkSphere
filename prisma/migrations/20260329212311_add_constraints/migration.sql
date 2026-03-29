-- Add CHECK constraint to likes table to ensure either postId or commentId is set (not both)
ALTER TABLE "likes" ADD CONSTRAINT "likes_target_check"
  CHECK (
    ("postId" IS NOT NULL AND "commentId" IS NULL) OR
    ("postId" IS NULL AND "commentId" IS NOT NULL)
  );

-- Add CHECK constraint to follows table to prevent self-follows
ALTER TABLE "follows" ADD CONSTRAINT "follows_no_self_follow"
  CHECK ("followerId" != "followingId");
