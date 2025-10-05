"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getCurrentLang } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Heart, MessageCircle, ArrowLeft, Send, User, Share2, Bookmark, Eye } from "lucide-react"
import { apiEndpoints, apiCall } from "@/lib/api-config"

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
  view_count?: number
  created_at: string
}

interface Comment {
  id: number
  content: string
  username: string
  avatar: string
  created_at: string
}

interface BlogUser {
  id: number
  username: string
  email: string
  avatar: string
}

export default function PostsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentsOffset, setCommentsOffset] = useState(0)
  const COMMENTS_LIMIT = 30
  const [newComment, setNewComment] = useState("")
  const [currentUser, setCurrentUser] = useState<BlogUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [showCommentsModal, setShowCommentsModal] = useState(false)
  const [lang, setLang] = useState<"uz" | "ru" | "en">("uz")
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareUrl, setShareUrl] = useState("")

  // Get post ID from URL query params
  const getPostId = () => {
    return searchParams.get('postid') || '1'
  }

  const hydrateLikedState = async (postId: string) => {
    try {
      const token = localStorage.getItem("blog_token")
      if (token) {
        // Prefer backend truth
        const likesData = await apiCall(`${apiEndpoints.posts.replace('?action=posts', '')}?action=get-user-likes&token=${token}`)
        if (likesData?.success && Array.isArray(likesData.liked_posts)) {
          setIsLiked(likesData.liked_posts.includes(Number(postId)))
          return
        }
      }
    } catch (e) {
      // fallback to localStorage below
    }
    try {
      const liked = localStorage.getItem("liked_posts")
      if (liked) {
        const likedArr = JSON.parse(liked) as number[]
        setIsLiked(likedArr.includes(Number(postId)))
      }
    } catch {}
  }

  useEffect(() => {
    setLang(getCurrentLang())
    checkUserSession()
    const postId = getPostId()
    if (postId) {
      loadPost(postId)
      loadComments(postId)
    }
  }, [searchParams])

  const checkUserSession = () => {
    const token = localStorage.getItem("blog_token")
    const user = localStorage.getItem("blog_user")
    if (token && user) {
      setCurrentUser(JSON.parse(user))
    }
  }

  const loadPost = async (postId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log("Loading post:", postId)

      const apiUrl = `${apiEndpoints.posts.replace("?action=posts", "")}?action=post&id=${postId}`
      console.log("Post API URL:", apiUrl)
      
      const data = await apiCall(apiUrl)

      if (data.success) {
        setPost(data.post)
        // Prepare share URL (domain-agnostic): /posts/?postid=<id>
        try {
          const origin = typeof window !== 'undefined' ? window.location.origin : ''
          setShareUrl(`${origin}/posts/?postid=${postId}`)
        } catch {}

        // Hydrate liked state
        await hydrateLikedState(postId)
        
        // Hydrate bookmarked state
        try {
          const bookmarked = localStorage.getItem("bookmarked_posts")
          if (bookmarked) {
            const bookmarkedArr = JSON.parse(bookmarked) as number[]
            setIsBookmarked(bookmarkedArr.includes(Number(postId)))
            setBookmarkedPosts(new Set(bookmarkedArr))
          }
        } catch {}
        incrementViewCount(postId)
        console.log("Post loaded successfully:", data.post.title)
      } else {
        console.error("Post loading failed:", data)
        setError(data.message || "Post topilmadi")
      }
    } catch (error) {
      console.error("Error loading post:", error)
      setError("Xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  const incrementViewCount = async (postId: string) => {
    try {
      console.log("Incrementing view count for post:", postId)
      await apiCall(`${apiEndpoints.posts.replace("?action=posts", "")}?action=view&post_id=${postId}`, {
        method: "POST",
      })
    } catch (error) {
      console.error("Error incrementing view count:", error)
    }
  }

  const loadComments = async (postId: string, append = false) => {
    try {
      console.log("Loading comments for post:", postId)
      const usedOffset = append ? commentsOffset : 0
      const data = await apiCall(`${apiEndpoints.comments}&post_id=${postId}&limit=${COMMENTS_LIMIT}&offset=${usedOffset}`)
      if (data.success) {
        if (append) {
          setComments((prev) => [...prev, ...data.comments])
          setCommentsOffset(usedOffset + COMMENTS_LIMIT)
        } else {
          setComments(data.comments)
          setCommentsOffset(COMMENTS_LIMIT)
        }
        console.log("Comments loaded:", data.comments.length)
      } else {
        console.error("Comments loading failed:", data)
      }
    } catch (error) {
      console.error("Error loading comments:", error)
    }
  }

  const handleLike = async () => {
    if (!currentUser) {
      alert("Tizimga kiring")
      return
    }

    const postId = getPostId()
    try {
      const data = await apiCall(apiEndpoints.like, {
        method: "POST",
        body: JSON.stringify({
          post_id: postId,
          token: localStorage.getItem("blog_token"),
        }),
      })

      if (data.success && post) {
        setPost({ ...post, like_count: data.like_count })
        const next = !isLiked
        setIsLiked(next)
        // Persist minimal liked state for detail page refresh UX
        try {
          const key = "liked_posts"
          const raw = localStorage.getItem(key)
          let arr: number[] = raw ? JSON.parse(raw) : []
          const idNum = Number(getPostId())
          if (next) {
            if (!arr.includes(idNum)) arr.push(idNum)
          } else {
            arr = arr.filter((i) => i !== idNum)
          }
          localStorage.setItem(key, JSON.stringify(arr))
        } catch {}
      }
    } catch (error) {
      console.error("Like error:", error)
    }
  }

  const handleShare = () => {
    // Open modal with prebuilt shareUrl
    if (!shareUrl) {
      try {
        const origin = typeof window !== 'undefined' ? window.location.origin : ''
        setShareUrl(`${origin}/posts/?postid=${getPostId()}`)
      } catch {}
    }
    setShowShareModal(true)
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser || !newComment.trim()) return

    const postId = getPostId()
    try {
      const data = await apiCall(apiEndpoints.comments, {
        method: "POST",
        body: JSON.stringify({
          post_id: postId,
          content: newComment,
          token: localStorage.getItem("blog_token"),
        }),
      })

      if (data.success) {
        setNewComment("")
        loadComments(postId)
        if (post) {
          setPost({ ...post, comment_count: post.comment_count + 1 })
        }
      }
    } catch (error) {
      console.error("Comment error:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Post yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowLeft className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Post topilmadi</h1>
          <p className="text-muted-foreground mb-6">{error || "Bunday post mavjud emas"}</p>
          <Button onClick={() => router.push("/")} className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Bosh sahifaga qaytish
          </Button>
        </div>
      </div>
    )
  }

  const hashtags = post.hashtags ? post.hashtags.split(",").filter((tag) => tag.trim()) : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.push("/")} className="hover:bg-primary/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Orqaga
            </Button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              CodeBlog
            </h1>
            <Button variant="ghost" onClick={handleShare} className="hover:bg-primary/10">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Enhanced Post Content */}
        <Card className="mb-8 overflow-hidden shadow-xl border-0 bg-gradient-to-br from-card to-card/50">
          {post.image && (
            <div className="aspect-video relative overflow-hidden">
              <img
                src={post.image.startsWith("http") ? post.image : `${apiEndpoints.uploads}/${post.image}`}
                alt={post.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          )}

          <CardContent className="p-8">
            <h1 className="text-4xl font-bold text-foreground mb-6 leading-tight">{post.title}</h1>

            {/* Author Info */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarImage src={post.avatar ? `${apiEndpoints.uploads}/${post.avatar}` : undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                    {post.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p
                    className="font-semibold text-foreground hover:text-primary cursor-pointer"
                    onClick={() => router.push(`/profile?username=${post.username}`)}
                  >
                    {post.username}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString("uz-UZ", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {/* View Count */}
              {post.view_count && (
                <div className="flex items-center text-muted-foreground text-sm">
                  <Eye className="h-4 w-4 mr-1" />
                  {post.view_count} ko'rildi
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mb-8 p-4 bg-muted/30 rounded-xl">
              <div className="flex items-center space-x-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`flex items-center space-x-2 hover:bg-red-500/10 ${isLiked ? "text-red-500" : ""}`}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                  <span className="font-medium">{post.like_count}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCommentsModal(true)}
                  className="flex items-center space-x-2 text-muted-foreground hover:text-blue-500"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="font-medium">{post.comment_count} izoh</span>
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => {
                  const postId = Number(getPostId())
                  const newBookmarked = !isBookmarked
                  setIsBookmarked(newBookmarked)
                  
                  // Update localStorage
                  try {
                    const key = "bookmarked_posts"
                    const raw = localStorage.getItem(key)
                    let arr: number[] = raw ? JSON.parse(raw) : []
                    if (newBookmarked) {
                      if (!arr.includes(postId)) arr.push(postId)
                    } else {
                      arr = arr.filter((i) => i !== postId)
                    }
                    localStorage.setItem(key, JSON.stringify(arr))
                    setBookmarkedPosts(new Set(arr))
                  } catch {}
                }}>
                  <Bookmark className={`h-5 w-5 ${isBookmarked ? "fill-current text-primary" : ""}`} />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Hashtags */}
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {hashtags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                    #{tag.trim()}
                  </Badge>
                ))}
              </div>
            )}

            {/* Post Content - Render HTML */}
            <div
              className="prose prose-lg max-w-none dark:prose-invert
                prose-headings:font-bold prose-headings:text-foreground
                prose-h1:text-4xl prose-h1:mb-4 prose-h1:mt-8
                prose-h2:text-3xl prose-h2:mb-3 prose-h2:mt-6
                prose-h3:text-2xl prose-h3:mb-2 prose-h3:mt-4
                prose-h4:text-xl prose-h4:mb-2 prose-h4:mt-3
                prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-4
                prose-strong:text-foreground prose-strong:font-semibold
                prose-a:text-primary prose-a:no-underline hover:prose-a:text-primary/80 hover:prose-a:underline
                prose-ul:list-disc prose-ul:ml-6 prose-ol:list-decimal prose-ol:ml-6
                prose-li:text-foreground prose-li:mb-2
                prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic
                prose-code:bg-muted prose-code:text-foreground prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
                prose-pre:bg-muted prose-pre:text-foreground prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
                prose-img:rounded-lg prose-img:shadow-md prose-img:w-full
                prose-iframe:w-full prose-iframe:aspect-video prose-iframe:rounded-lg
                [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-lg [&_iframe]:border-0"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </CardContent>
        </Card>
      </main>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-md border shadow-lg">
            <div className="mb-4">
              <h2 className="text-xl font-bold mb-2">Ulashish</h2>
              <p className="text-sm text-muted-foreground">Quyidagi havolani nusxalab do'stlaringiz bilan ulashing</p>
            </div>
            <div className="space-y-3">
              <input
                readOnly
                value={shareUrl}
                className="w-full px-3 py-2 border rounded bg-muted/30 text-sm"
                onFocus={(e) => e.currentTarget.select()}
              />
              <div className="flex gap-2 justify-end">
                <button
                  className="px-4 py-2 rounded border"
                  onClick={() => setShowShareModal(false)}
                >
                  Bekor qilish
                </button>
                <button
                  className="px-4 py-2 rounded bg-primary text-primary-foreground"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(shareUrl)
                      setShowShareModal(false)
                      alert('Havola nusxalandi!')
                    } catch (e) {
                      console.error('Clipboard error:', e)
                    }
                  }}
                >
                  Nusxalash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      <Dialog open={showCommentsModal} onOpenChange={setShowCommentsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              Izohlar ({comments.length})
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {/* Add Comment Form */}
            {currentUser ? (
              <form onSubmit={handleComment} className="mb-6">
                <div className="flex space-x-4">
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarImage
                      src={currentUser.avatar ? `${apiEndpoints.uploads}/${currentUser.avatar}` : undefined}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                      {currentUser.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Izoh yozing..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="mb-3 border-primary/20 focus:border-primary/40"
                      rows={3}
                    />
                    <Button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Yuborish
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="mb-6 p-6 bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl text-center border border-border/50">
                <p className="text-muted-foreground mb-3">Izoh qoldirish uchun tizimga kiring</p>
                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                  className="border-primary/30 hover:bg-primary/10"
                >
                  <User className="h-4 w-4 mr-2" />
                  Tizimga kirish
                </Button>
              </div>
            )}

            {/* Comments List */}
            {comments.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">
                  Hozircha izohlar yo'q. Birinchi bo'lib izoh qoldiring!
                </p>
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex space-x-4 p-4 bg-muted/20 rounded-xl hover:bg-muted/30 transition-colors"
                >
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarImage src={comment.avatar ? `${apiEndpoints.uploads}/${comment.avatar}` : undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                      {comment.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span
                        className="font-semibold text-foreground hover:text-primary cursor-pointer"
                        onClick={() => router.push(`/profile?username=${comment.username}`)}
                      >
                        {comment.username}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString("uz-UZ", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-foreground leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
            {comments.length > 0 && (
              <div className="text-center py-4">
                <Button variant="outline" onClick={() => loadComments(getPostId(), true)}>
                  Update
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
