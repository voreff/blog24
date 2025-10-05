"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getCurrentLang } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, MessageCircle, Calendar, Mail, MapPin, Link as LinkIcon, CreditCard as Edit, User } from "lucide-react"
import { apiEndpoints, apiCall } from "@/lib/api-config"

interface UserProfile {
  id: number
  username: string
  email: string
  avatar: string
  bio: string
  location?: string
  website?: string
  created_at: string
  post_count: number
  comment_count: number
  like_count: number
}

interface BlogUser {
  id: number
  username: string
  email: string
  avatar: string
}

export default function ProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [lang, setLang] = useState<"uz" | "ru" | "en">("uz")
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [currentUser, setCurrentUser] = useState<BlogUser | null>(null)
  const [isOnline, setIsOnline] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({
    bio: '',
    location: '',
    website: '',
    avatar: null as File | null
  })
  const [isEditLoading, setIsEditLoading] = useState(false)

  // Get username from URL params or cookies
  const getUsername = () => {
    const urlUsername = searchParams.get('username')
    const cookieUsername = typeof window !== 'undefined' ? localStorage.getItem('current_profile_username') : null
    return urlUsername || cookieUsername || ''
  }

  useEffect(() => {
    setLang(getCurrentLang())
    checkUserSession()
    const username = getUsername()
    if (username) {
      localStorage.setItem('current_profile_username', username)
      loadProfile(username)
      // fetch online status
      fetch(`${apiEndpoints.posts.replace("?action=posts", "")}?action=online-status&username=${username}`, { credentials: 'include' })
        .then(r => r.json()).then(d => { if (d.success) setIsOnline(!!d.online) }).catch(() => {})
    } else {
      setError("Foydalanuvchi nomi ko'rsatilmagan")
      setLoading(false)
    }
  }, [searchParams])

  const checkUserSession = () => {
    const token = localStorage.getItem("blog_token")
    const user = localStorage.getItem("blog_user")
    if (token && user) {
      setCurrentUser(JSON.parse(user))
    }
  }

  const loadProfile = async (username: string) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log("Loading profile:", username)

      const apiUrl = `${apiEndpoints.posts.replace("?action=posts", "")}?action=profile&username=${username}`
      console.log("Profile API URL:", apiUrl)
      
      const data = await apiCall(apiUrl)

      if (data.success) {
        setProfile(data.profile)
        console.log("Profile loaded successfully:", data.profile.username)
      } else {
        console.error("Profile loading failed:", data)
        setError(data.message || "Foydalanuvchi topilmadi")
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      setError("Xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  const startChat = () => {
    if (!currentUser) {
      alert("Tizimga kiring")
      return
    }
    router.push("/chat")
  }

  const openEditModal = () => {
    if (profile) {
      setEditForm({
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        avatar: null
      })
      setShowEditModal(true)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser || !profile) return

    setIsEditLoading(true)
    try {
      const token = localStorage.getItem("blog_token")
      
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('bio', editForm.bio)
      formData.append('location', editForm.location)
      formData.append('website', editForm.website)
      if (editForm.avatar) {
        formData.append('avatar', editForm.avatar)
      }

      // Use fetch directly for FormData to avoid content-type issues
      const response = await fetch(`${apiEndpoints.posts.replace("?action=posts", "")}?action=update-profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        // Update profile state with new data
        setProfile({ ...profile, ...data.profile })
        setShowEditModal(false)
        alert('Profil muvaffaqiyatli yangilandi!')
        
        // Update localStorage if this is current user's profile
        if (currentUser.id === profile.id) {
          const updatedUser = { ...currentUser, ...data.profile }
          localStorage.setItem('blog_user', JSON.stringify(updatedUser))
          setCurrentUser(updatedUser)
        }
      } else {
        alert(data.message || 'Xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      alert('Server bilan bog\'lanishda xatolik yuz berdi. Qaytadan urinib ko\'ring.')
    }
    setIsEditLoading(false)
  }

  const isOwnProfile = currentUser && profile && currentUser.id === profile.id

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Profil yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Foydalanuvchi topilmadi</h1>
          <p className="text-muted-foreground mb-6">{error || "Bunday foydalanuvchi mavjud emas"}</p>
          <Button onClick={() => router.push("/")} className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Bosh sahifaga qaytish
          </Button>
        </div>
      </div>
    )
  }

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
              Profil
            </h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Card */}
        <Card className="overflow-hidden shadow-xl border-0 bg-gradient-to-br from-card to-card/50">
          <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20"></div>

          <CardContent className="p-8 -mt-16 relative">
            <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col items-center text-center md:text-left relative">
                <Avatar className="h-32 w-32 mb-4 border-4 border-background shadow-xl">
                  <AvatarImage src={profile.avatar ? `${apiEndpoints.uploads}/${profile.avatar}` : undefined} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                    {profile.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <h1 className="text-3xl font-bold text-foreground mb-2">{profile.username}</h1>

                {profile.bio && <p className="text-muted-foreground mb-4 max-w-md leading-relaxed">{profile.bio}</p>}

                {/* Additional Info */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    Qo'shilgan:{" "}
                    {new Date(profile.created_at).toLocaleDateString("uz-UZ", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>

                  {profile.location && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {profile.location}
                    </div>
                  )}

                  {profile.website && (
                    <div className="flex items-center text-muted-foreground">
                      <LinkIcon className="h-4 w-4 mr-2" />
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary"
                      >
                        {profile.website}
                      </a>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  {isOwnProfile ? (
                    <Button 
                      variant="outline" 
                      className="flex items-center bg-transparent"
                      onClick={openEditModal}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Profilni tahrirlash
                    </Button>
                  ) : currentUser ? (
                    <Button
                      onClick={startChat}
                      className="flex items-center bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Xabar yuborish
                    </Button>
                  ) : null}
                </div>
              </div>

              {/* Enhanced Stats */}
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground mb-4">Statistika</h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 text-center border border-primary/20">
                    <div className="text-2xl font-bold text-primary mb-1">{profile.post_count}</div>
                    <div className="text-sm text-muted-foreground">Postlar</div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl p-4 text-center border border-blue-500/20">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{profile.comment_count}</div>
                    <div className="text-sm text-muted-foreground">Izohlar</div>
                  </div>

                  <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-xl p-4 text-center border border-red-500/20">
                    <div className="text-2xl font-bold text-red-600 mb-1">{profile.like_count}</div>
                    <div className="text-sm text-muted-foreground">Likelar</div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Aloqa</h3>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">Email:</span>
                      <span className="ml-2 text-foreground font-medium">{profile.email}</span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Badges */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Nishonlar</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.post_count > 0 && (
                      <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-700 border-green-500/30"
                      >
                        📝 Muallif
                      </Badge>
                    )}
                    {profile.comment_count > 10 && (
                      <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-700 border-blue-500/30"
                      >
                        💬 Faol izohchi
                      </Badge>
                    )}
                    {profile.like_count > 50 && (
                      <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-700 border-red-500/30"
                      >
                        ❤️ Mashhur
                      </Badge>
                    )}
                    {new Date(profile.created_at) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && (
                      <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-700 border-purple-500/30"
                      >
                        ⭐ Eski a'zo
                      </Badge>
                    )}
                    {profile.post_count > 5 && profile.comment_count > 20 && (
                      <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-700 border-orange-500/30"
                      >
                        🏆 Faol foydalanuvchi
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Profile Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-md shadow-2xl border">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Profilni tahrirlash</h2>
              <p className="text-muted-foreground">Ma'lumotlaringizni yangilang</p>
            </div>
            
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Bio</label>
                <Textarea
                  placeholder="O'zingiz haqingizda qisqacha..."
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Joylashuv</label>
                <Input
                  placeholder="Toshkent, O'zbekiston"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Veb-sayt</label>
                <Input
                  placeholder="https://example.com"
                  value={editForm.website}
                  onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Avatar</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditForm({ ...editForm, avatar: e.target.files?.[0] || null })}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Faqat rasm fayllari qabul qilinadi (JPG, PNG, GIF)
                </p>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" 
                  disabled={isEditLoading}
                >
                  {isEditLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saqlanmoqda...</span>
                    </div>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Saqlash
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowEditModal(false)}
                  disabled={isEditLoading}
                  className="flex-1"
                >
                  Bekor qilish
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}