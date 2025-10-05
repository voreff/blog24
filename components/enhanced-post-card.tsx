"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Heart, Share2, Bookmark, MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"

interface Post {
  id: number
  title: string
  content: string
  image: string
  hashtags: string
  username: string
  avatar: string
  like_count: number
  comment_count: number
  created_at: string
}

interface Comment {
  id: number
  content: string
  username: string
  avatar: string
  created_at: string
}

interface User {
  id: number
  username: string
  email: string
  avatar: string
  is_admin: number
}

interface EnhancedPostCardProps {
  post: Post
  currentUser: User | null
  onLike: (postId: number) => void
  onComment: (postId: number, content: string) => void
  comments: Comment[]
  showComments: boolean
  onToggleComments: () => void
}

export default function EnhancedPostCard({
  post,
  currentUser,
  onLike,
  onComment,
  comments,
  showComments,
  onToggleComments,
}: EnhancedPostCardProps) {
  const router = useRouter()
  const [newComment, setNewComment] = useState("")
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  const handleLike = () => {
    setIsLiked(!isLiked)
    onLike(post.id)
  }

  const handleComment = () => {
    if (newComment.trim()) {
      onComment(post.id, newComment)
      setNewComment("")
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/posts/?postid=${post.id}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.content.substring(0, 100) + "...",
          url,
        })
        return
      } catch (error) {
        console.log("Error sharing:", error)
      }
    }
    // Fallback to clipboard
    navigator.clipboard.writeText(url)
    alert("Havola nusxalandi!")
  }

  return (
    <article className="bg-card rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {post.image && (
        <div className="aspect-video overflow-hidden relative">
          <img
            src={`/uploads/${post.image}`}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}

      <div className="p-6">
        {/* Author Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar 
              className="h-10 w-10 ring-2 ring-primary/10 cursor-pointer hover:ring-primary/30 transition-all"
              onClick={() => router.push(`/profile?username=${post.username}`)}
            >
              <AvatarImage src={`/uploads/${post.avatar}`} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {post.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p 
                className="font-medium text-sm hover:text-primary cursor-pointer transition-colors"
                onClick={() => router.push(`/profile?username=${post.username}`)}
              >
                {post.username}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(post.created_at).toLocaleDateString("uz-UZ", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <h2
          className="text-xl font-bold mb-3 line-clamp-2 text-balance hover:text-primary transition-colors cursor-pointer"
          onClick={() => router.push(`/posts/?postid=${post.id}`)}
        >
          {post.title}
        </h2>
        {/* Render excerpt as HTML-safe preview */}
        <div
          className="text-muted-foreground mb-4 text-pretty leading-relaxed line-clamp-3 [&_code]:bg-muted [&_pre]:bg-muted"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Hashtags */}
        {post.hashtags && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.hashtags
              .split(",")
              .slice(0, 3)
              .map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 text-primary px-3 py-1 rounded-full border border-primary/20 hover:border-primary/40 transition-colors cursor-pointer"
                >
                  #{tag.trim()}
                </span>
              ))}
            {post.hashtags.split(",").length > 3 && (
              <span className="text-xs text-muted-foreground">+{post.hashtags.split(",").length - 3} ko'proq</span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`transition-all duration-200 ${
                isLiked ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-red-500"
              }`}
            >
              <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
              {post.like_count}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleComments}
              className="text-muted-foreground hover:text-blue-500 transition-colors"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              {post.comment_count}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-muted-foreground hover:text-green-500 transition-colors"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`transition-colors ${
                isBookmarked ? "text-yellow-500 hover:text-yellow-600" : "text-muted-foreground hover:text-yellow-500"
              }`}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/posts/?postid=${post.id}`)}
              className="hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Batafsil
            </Button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-6 pt-6 border-t space-y-4">
            {currentUser && (
              <div className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`/uploads/${currentUser.avatar}`} />
                  <AvatarFallback>{currentUser.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Izoh yozing..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleComment()}
                    className="bg-muted/50 border-0 focus:bg-background"
                  />
                  <Button size="sm" onClick={handleComment} disabled={!newComment.trim()}>
                    Yuborish
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-4 max-h-80 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`/uploads/${comment.avatar}`} />
                    <AvatarFallback>{comment.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-muted/50 rounded-lg px-4 py-3">
                      <p className="text-sm font-medium mb-1">{comment.username}</p>
                      <p className="text-sm leading-relaxed">{comment.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(comment.created_at).toLocaleDateString("uz-UZ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
