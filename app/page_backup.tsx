"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { getCurrentLang, setCurrentLang as saveLang } from "@/lib/utils"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Search, Sun, Moon, Globe, Mail, CircleCheck as CheckCircle, Send, User } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useTheme } from "next-themes"
import { API_BASE_URL, apiEndpoints, apiCall } from "@/lib/api-config"

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

interface BlogUser {
  id: number
  username: string
  email: string
  avatar: string
  is_admin: number
}

const translations = {
  uz: {
    siteName: "CodeBlog",
    search: "Qidirish...",
    chat: "Chat",
    login: "Kirish",
    register: "Ro'yxatdan o'tish",
    logout: "Chiqish",
    adminPanel: "Admin Panel",
    profile: "Profil",
    darkMode: "Tungi rejim",
    lightMode: "Kunduzgi rejim",
    loading: "Yuklanmoqda...",
    loadMore: "Ko'proq yuklash",
    noPostsFound: "Hech qanday post topilmadi",
    writeComment: "Izoh yozing...",
    send: "Yuborish",
    readMore: "Batafsil",
    loginTitle: "Tizimga kirish",
    registerTitle: "Ro'yxatdan o'tish",
    emailVerification: "Email tasdiqlash",
    verificationCode: "Tasdiqlash kodi",
    verify: "Tasdiqlash",
    cancel: "Bekor qilish",
    email: "Email",
    password: "Parol",
    username: "Foydalanuvchi nomi",
    captcha: "Captcha kodini kiriting",
    refresh: "Yangilash",
    newsletter: "Yangiliklar",
    newsletterDesc: "Eng so'nggi maqolalar va yangiliklar haqida xabardor bo'ling",
    subscribe: "Obuna bo'lish",
    subscribed: "Obuna bo'ldingiz!",
    enterEmail: "Email manzilingiz",
    quickLinks: "Tezkor havolalar",
    categories: "Kategoriyalar",
    home: "Bosh sahifa",
    contact: "Bog'lanish",
    help: "Yordam",
    privacyPolicy: "Maxfiylik siyosati",
    termsOfService: "Foydalanish shartlari",
    allRightsReserved: "Barcha huquqlar himoyalangan.",
    brandDesc:
      "Dasturlash va texnologiya haqida eng so'nggi yangiliklar, darsliklar va maqolalar. Bizning jamiyatga qo'shiling va bilimlaringizni bo'lishing.",
  },
  ru: {
    siteName: "CodeBlog",
    search: "Поиск...",
    chat: "Чат",
    login: "Войти",
    register: "Регистрация",
    logout: "Выйти",
    adminPanel: "Админ панель",
    profile: "Профиль",
    darkMode: "Темная тема",
    lightMode: "Светлая тема",
    loading: "Загрузка...",
    loadMore: "Загрузить еще",
    noPostsFound: "Посты не найдены",
    writeComment: "Написать комментарий...",
    send: "Отправить",
    readMore: "Подробнее",
    loginTitle: "Вход в систему",
    registerTitle: "Регистрация",
    emailVerification: "Подтверждение email",
    verificationCode: "Код подтверждения",
    verify: "Подтвердить",
    cancel: "Отмена",
    email: "Email",
    password: "Пароль",
    username: "Имя пользователя",
    captcha: "Введите код капчи",
    refresh: "Обновить",
    newsletter: "Новости",
    newsletterDesc: "Будьте в курсе последних статей и новостей",
    subscribe: "Подписаться",
    subscribed: "Вы подписались!",
    enterEmail: "Ваш email адрес",
    quickLinks: "Быстрые ссылки",
    categories: "Категории",
    home: "Главная",
    contact: "Контакты",
    help: "Помощь",
    privacyPolicy: "Политика конфиденциальности",
    termsOfService: "Условия использования",
    allRightsReserved: "Все права защищены.",
    brandDesc:
      "Последние новости, учебники и статьи о программировании и технологиях. Присоединяйтесь к нашему сообществу и делитесь знаниями.",
  },
  en: {
    siteName: "CodeBlog",
    search: "Search...",
    chat: "Chat",
    login: "Login",
    register: "Register",
    logout: "Logout",
    adminPanel: "Admin Panel",
    profile: "Profile",
    darkMode: "Dark mode",
    lightMode: "Light mode",
    loading: "Loading...",
    loadMore: "Load more",
    noPostsFound: "No posts found",
    writeComment: "Write a comment...",
    send: "Send",
    readMore: "Read more",
    loginTitle: "Login",
    registerTitle: "Register",
    emailVerification: "Email verification",
    verificationCode: "Verification code",
    verify: "Verify",
    cancel: "Cancel",
    email: "Email",
    password: "Password",
    username: "Username",
    captcha: "Enter captcha code",
    refresh: "Refresh",
    newsletter: "Newsletter",
    newsletterDesc: "Stay updated with the latest articles and news",
    subscribe: "Subscribe",
    subscribed: "You're subscribed!",
    enterEmail: "Your email address",
    quickLinks: "Quick Links",
    categories: "Categories",
    home: "Home",
    contact: "Contact",
    help: "Help",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    allRightsReserved: "All rights reserved.",
    brandDesc:
      "Latest news, tutorials and articles about programming and technology. Join our community and share your knowledge.",
  },
}

export default function BlogHome() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentUser, setCurrentUser] = useState<BlogUser | null>(null)
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [showComments, setShowComments] = useState<number | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  const [currentLang, setCurrentLang] = useState<"uz" | "ru" | "en">(getCurrentLang())
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false)
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [showNewsletterModal, setShowNewsletterModal] = useState(false)
  const [newsletterForm, setNewsletterForm] = useState({ email: "", captcha: "" })
  const [newsletterCaptchaUrl, setNewsletterCaptchaUrl] = useState("")
  const [isNewsletterLoading, setIsNewsletterLoading] = useState(false)

  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [passwordResetForm, setPasswordResetForm] = useState({ email: "", captcha: "" })
  const [passwordResetStep, setPasswordResetStep] = useState<"request" | "verify" | "new_password">("request")
  const [resetToken, setResetToken] = useState("")
  const [newPasswordForm, setNewPasswordForm] = useState({ password: "", confirmPassword: "" })
  const [passwordResetCaptchaUrl, setPasswordResetCaptchaUrl] = useState("")
  const [isPasswordResetLoading, setIsPasswordResetLoading] = useState(false)

  const [alert, setAlert] = useState<{
    show: boolean
    type: "success" | "error" | "info"
    message: string
  }>({ show: false, type: "success", message: "" })
  // Login/Register form states
  const [loginForm, setLoginForm] = useState({ email: "", password: "", captcha: "" })
  const [registerForm, setRegisterForm] = useState({ username: "", email: "", password: "", captcha: "" })
  const [verificationCode, setVerificationCode] = useState("")
  const [showVerification, setShowVerification] = useState(false)
  const [captchaUrl, setCaptchaUrl] = useState("")
  const [isLoginLoading, setIsLoginLoading] = useState(false)
  const [isRegisterLoading, setIsRegisterLoading] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const t = translations[currentLang]

  const showAlert = (type: "success" | "error" | "info", message: string) => {
    setAlert({ show: true, type, message })
    setTimeout(() => setAlert({ show: false, type: "success", message: "" }), 5000)
  }

  const searchByCategory = (category: string) => {
    setSearchQuery(category)
    setPage(1)
    loadPosts(category, 1)
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  useEffect(() => {
    loadPosts()
    checkUserSession()
    refreshCaptcha()
    refreshNewsletterCaptcha()
    // Load saved language
    setCurrentLang(getCurrentLang())
  }, [])

  useEffect(() => {
    // Load user's liked posts when currentUser changes
    if (currentUser) {
      loadUserLikes()
    }
  }, [currentUser])

  const checkUserSession = async () => {
    const token = localStorage.getItem("blog_token")
    const user = localStorage.getItem("blog_user")
    const loginTime = localStorage.getItem("blog_login_time")

    if (token && user) {
      try {
        // Check if token is still valid by making a test API call
        const testResponse = await apiCall(apiEndpoints.heartbeat, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include'
        })

        if (testResponse.success) {
          // Token is valid, set user
          setCurrentUser(JSON.parse(user))
          // Update login time to extend session (every login extends by 1 year)
          localStorage.setItem("blog_login_time", Date.now().toString())
        } else {
          // Token expired, clear storage
          localStorage.removeItem("blog_token")
          localStorage.removeItem("blog_user")
          localStorage.removeItem("blog_login_time")
        }
      } catch (error) {
        // Network error or token invalid
        console.log("Session validation failed, keeping local data")
        setCurrentUser(JSON.parse(user)) // Still set user for offline experience
      }
    }
  }

  const refreshCaptcha = async () => {
    const timestamp = Date.now()
    try {
      const response = await fetch(`${apiEndpoints.captcha}?t=${timestamp}&type=login`, {
        credentials: "include",
      })
      if (response.ok) {
        setCaptchaUrl(`${apiEndpoints.captcha}?t=${timestamp}&type=login`)
      } else {
        console.error("Error refreshing captcha:", response.status)
      }
    } catch (error) {
      console.error("Error refreshing captcha:", error)
    }
  }

  const refreshNewsletterCaptcha = async () => {
    const timestamp = Date.now()
    try {
      const response = await fetch(`${apiEndpoints.captcha}?t=${timestamp}&type=newsletter`, {
        credentials: "include",
      })
      if (response.ok) {
        setNewsletterCaptchaUrl(`${apiEndpoints.captcha}?t=${timestamp}&type=newsletter`)
      } else {
        console.error("Error refreshing newsletter captcha:", response.status)
      }
    } catch (error) {
      console.error("Error refreshing newsletter captcha:", error)
    }
  }

  const changeLanguage = (lang: "uz" | "ru" | "en") => {
    setCurrentLang(lang)
    saveLang(lang)
    setShowLanguageMenu(false)
  }

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()

    // Client-side validation
    if (!newsletterForm.email.trim() || !newsletterForm.captcha.trim()) {
      showAlert("error", t.enterEmail + " va captcha kodini kiriting")
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newsletterForm.email)) {
      showAlert("error", "To'g'ri email manzil kiriting")
      return
    }

    setIsNewsletterLoading(true)
    try {
      console.log("Newsletter subscription attempt:", { email: newsletterForm.email, captcha: newsletterForm.captcha })

      const response = await fetch(apiEndpoints.newsletterSubscribe, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        credentials: 'include',
        body: JSON.stringify({
          email: newsletterForm.email,
          captcha: newsletterForm.captcha
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Newsletter subscription response:", data)

      if (data.success) {
        setNewsletterSubscribed(true)
        setNewsletterForm({ email: "", captcha: "" })
        setShowNewsletterModal(false)
        showAlert("success", data.message || "Newsletter obunasi muvaffaqiyatli!")
        setTimeout(() => setNewsletterSubscribed(false), 5000)
      } else {
        showAlert("error", data.message || "Obuna bo'lishda xatolik yuz berdi")
        refreshNewsletterCaptcha()
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error)
      showAlert("error", "Server bilan bog'lanishda xatolik yuz berdi. Qaytadan urinib ko'ring.")
      refreshNewsletterCaptcha()
    }
    setIsNewsletterLoading(false)
  }

  const loadPosts = async (searchTerm = "", pageNum = 1) => {
    setLoading(true)
    try {
      const data = await apiCall(`${apiEndpoints.posts}&page=${pageNum}&limit=10&search=${searchTerm}`)
      if (data.success) {
        if (pageNum === 1) {
          setPosts(data.posts)
        } else {
          setPosts((prev) => [...prev, ...data.posts])
        }
      }
    } catch (error) {
      console.error("Error loading posts:", error)
      showAlert("error", "Postlarni yuklashda xatolik yuz berdi")
    }
    setLoading(false)
  }

  const handleSearch = () => {
    setPage(1)
    loadPosts(searchQuery, 1)
  }

  const loadMorePosts = () => {
    const nextPage = page + 1
    setPage(nextPage)
    loadPosts(searchQuery, nextPage)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Client-side validation
    if (!loginForm.email.trim() || !loginForm.password.trim() || !loginForm.captcha.trim()) {
      showAlert("error", t.email + ", " + t.password + " va captcha kodini kiriting")
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(loginForm.email)) {
      showAlert("error", "To'g'ri email manzil kiriting")
      return
    }

    setIsLoginLoading(true)
    try {
      const data = await apiCall(apiEndpoints.login, {
        method: "POST",
        body: JSON.stringify(loginForm),
      })

      if (data.success) {
        localStorage.setItem("blog_token", data.token)
        localStorage.setItem("blog_user", JSON.stringify(data.user))
        localStorage.setItem("blog_login_time", Date.now().toString())
        setCurrentUser(data.user)
        setShowLogin(false)
        setLoginForm({ email: "", password: "", captcha: "" })
        showAlert("success", data.message)
        refreshCaptcha()
        // Load user's liked posts after successful login
        setTimeout(() => loadUserLikes(), 100)
      } else {
        showAlert("error", data.message)
        refreshCaptcha()
      }
    } catch (error) {
      console.error("Login error:", error)
      showAlert("error", "Tizimga kirishda xatolik yuz berdi")
      refreshCaptcha()
    }
    setIsLoginLoading(false)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    // Client-side validation
    if (!registerForm.username.trim() || !registerForm.email.trim() || !registerForm.password.trim() || !registerForm.captcha.trim()) {
      showAlert("error", t.username + ", " + t.email + ", " + t.password + " va captcha kodini kiriting")
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(registerForm.email)) {
      showAlert("error", "To'g'ri email manzil kiriting")
      return
    }

    // Username validation (only letters, numbers, and underscores, 3-50 characters)
    const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/
    if (!usernameRegex.test(registerForm.username)) {
      showAlert("error", "Foydalanuvchi nomi 3-50 ta belgidan iborat bo'lishi va faqat harflar, raqamlar va pastki chiziqdan iborat bo'lishi kerak")
      return
    }

    // Password strength validation (minimum 8 characters)
    if (registerForm.password.length < 8) {
      showAlert("error", "Parol kamida 8 ta belgidan iborat bo'lishi kerak")
      return
    }

    setIsRegisterLoading(true)
    try {
      const data = await apiCall(apiEndpoints.register, {
        method: "POST",
        body: JSON.stringify(registerForm),
      })

      if (data.success) {
        setShowVerification(true)
        setShowRegister(false)
        showAlert("success", data.message)
        refreshCaptcha()
      } else {
        showAlert("error", data.message)
        refreshCaptcha()
      }
    } catch (error) {
      console.error("Register error:", error)
      showAlert("error", "Ro'yxatdan o'tishda xatolik yuz berdi")
      refreshCaptcha()
    }
    setIsRegisterLoading(false)
  }

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = await apiCall(apiEndpoints.verifyEmail, {
        method: "POST",
        body: JSON.stringify({ code: verificationCode }),
      })

      if (data.success) {
        showAlert("success", "Ro'yxatdan o'tish muvaffaqiyatli! Endi tizimga kiring.")
        setShowVerification(false)
        setShowLogin(true)
        setVerificationCode("")
        setRegisterForm({ username: "", email: "", password: "", captcha: "" })
      } else {
        showAlert("error", data.message)
      }
    } catch (error) {
      console.error("Verification error:", error)
      showAlert("error", "Tasdiqlashda xatolik yuz berdi")
    }
  }

  const handleLike = async (postId: number) => {
    if (!currentUser) {
      showAlert("info", "Tizimga kiring")
      return
    }

    try {
      const data = await apiCall(apiEndpoints.like, {
        method: "POST",
        body: JSON.stringify({
          post_id: postId,
          token: localStorage.getItem("blog_token"),
        }),
      })

      if (data.success) {
        setPosts((prev) => prev.map((post) => (post.id === postId ? { ...post, like_count: data.like_count } : post)))
        setLikedPosts((prev) => {
          const next = new Set(prev)
          if (next.has(postId)) {
            next.delete(postId)
          } else {
            next.add(postId)
          }
          return next
        })
        // Persist for detail page hydration UX
        try {
          const key = "liked_posts"
          const raw = localStorage.getItem(key)
          let arr: number[] = raw ? JSON.parse(raw) : []
          if (arr.includes(postId)) {
            arr = arr.filter((i) => i !== postId)
          } else {
            arr.push(postId)
          }
          localStorage.setItem(key, JSON.stringify(arr))
        } catch {}
      }
    } catch (error) {
      console.error("Like error:", error)
      showAlert("error", "Like qilishda xatolik yuz berdi")
    }
  }

  const loadComments = async (postId: number) => {
    try {
      const data = await apiCall(`${apiEndpoints.comments}&post_id=${postId}`)
      if (data.success) {
        setComments(data.comments)
      }
    } catch (error) {
      console.error("Error loading comments:", error)
      showAlert("error", "Izohlarni yuklashda xatolik yuz berdi")
    }
  }

  const handleComment = async (postId: number) => {
    if (!currentUser || !newComment.trim()) return

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
        // Update comment count
        setPosts((prev) =>
          prev.map((post) => (post.id === postId ? { ...post, comment_count: post.comment_count + 1 } : post)),
        )
      }
    } catch (error) {
      console.error("Comment error:", error)
      showAlert("error", "Izoh qo'shishda xatolik yuz berdi")
    }
  }

  const logout = () => {
    localStorage.removeItem("blog_token")
    localStorage.removeItem("blog_user")
    localStorage.removeItem("blog_login_time")
    localStorage.removeItem("liked_posts")
    setCurrentUser(null)
    setLikedPosts(new Set())
    setShowLogoutConfirm(false)
  }

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
  }

  const loadUserLikes = async () => {
    if (!currentUser) return

    try {
      const data = await apiCall(`${apiEndpoints.posts.replace('?action=posts', '')}?action=get-user-likes&token=${localStorage.getItem("blog_token")}`, {
        method: "GET",
      })

      if (data.success) {
        setLikedPosts(new Set(data.liked_posts))
      }
    } catch (error) {
      console.error("Error loading user likes:", error)
    }
  }

  const refreshPasswordResetCaptcha = async () => {
    const timestamp = Date.now()
    try {
      const response = await fetch(`${apiEndpoints.captcha}?t=${timestamp}&type=password_reset`, {
        credentials: "include",
      })
      if (response.ok) {
        setPasswordResetCaptchaUrl(`${apiEndpoints.captcha}?t=${timestamp}&type=password_reset`)
      } else {
        console.error("Error refreshing password reset captcha:", response.status)
      }
    } catch (error) {
      console.error("Error refreshing password reset captcha:", error)
    }
  }

  const handlePasswordResetRequest = async (e: React.FormEvent) => {
    e.preventDefault()

    // Client-side validation
    if (!passwordResetForm.email.trim() || !passwordResetForm.captcha.trim()) {
      showAlert("error", t.email + " va captcha kodini kiriting")
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(passwordResetForm.email)) {
      showAlert("error", "To'g'ri email manzil kiriting")
      return
    }

    setIsPasswordResetLoading(true)
    try {
      const response = await fetch(apiEndpoints.passwordResetRequest, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        credentials: 'include',
        body: JSON.stringify({
          email: passwordResetForm.email,
          captcha: passwordResetForm.captcha
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setPasswordResetStep("verify")
        showAlert("success", data.message)
        refreshPasswordResetCaptcha()
      } else {
        showAlert("error", data.message)
        refreshPasswordResetCaptcha()
      }
    } catch (error) {
      console.error("Password reset request error:", error)
      showAlert("error", "Server bilan bog'lanishda xatolik yuz berdi. Qaytadan urinib ko'ring.")
      refreshPasswordResetCaptcha()
    }
    setIsPasswordResetLoading(false)
  }

  const handlePasswordResetVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!verificationCode.trim()) return

    setIsPasswordResetLoading(true)
    try {
      const response = await fetch(apiEndpoints.passwordResetVerify, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          code: verificationCode,
          captcha: passwordResetForm.captcha
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setPasswordResetStep("new_password")
        setResetToken(data.reset_token)
        showAlert("success", data.message)
        refreshPasswordResetCaptcha()
      } else {
        showAlert("error", data.message)
        refreshPasswordResetCaptcha()
      }
    } catch (error) {
      console.error("Password reset verification error:", error)
      showAlert("error", "Server bilan bog'lanishda xatolik yuz berdi. Qaytadan urinib ko'ring.")
      refreshPasswordResetCaptcha()
    }
    setIsPasswordResetLoading(false)
  }

  const handlePasswordResetConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPasswordForm.password || newPasswordForm.password !== newPasswordForm.confirmPassword) return

    setIsPasswordResetLoading(true)
    try {
      const response = await fetch(apiEndpoints.passwordResetConfirm, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          new_password: newPasswordForm.password,
          reset_token: resetToken
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        showAlert("success", data.message)
        setShowPasswordReset(false)
        setPasswordResetStep("request")
        setPasswordResetForm({ email: "", captcha: "" })
        setNewPasswordForm({ password: "", confirmPassword: "" })
        setResetToken("")
      } else {
        showAlert("error", data.message)
      }
    } catch (error) {
      console.error("Password reset confirmation error:", error)
      showAlert("error", "Server bilan bog'lanishda xatolik yuz berdi. Qaytadan urinib ko'ring.")
    }
    setIsPasswordResetLoading(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {alert.show && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] max-w-md w-full mx-4`}>
          <div
            className={`
            p-4 rounded-lg shadow-lg border-l-4 backdrop-blur-sm
            ${alert.type === "success" ? "bg-green-50/90 border-green-500 text-green-800" : ""}
            ${alert.type === "error" ? "bg-red-50/90 border-red-500 text-red-800" : ""}
            ${alert.type === "info" ? "bg-blue-50/90 border-blue-500 text-blue-800" : ""}
            animate-in slide-in-from-top-2 duration-300
          `}
          >
            <div className="flex items-center">
              {alert.type === "success" && <CheckCircle className="h-5 w-5 mr-2 text-green-600" />}
              {alert.type === "error" && (
                <svg className="h-5 w-5 mr-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              {alert.type === "info" && (
                <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              <span className="font-medium">{alert.message}</span>
              <button
                onClick={() => setAlert({ show: false, type: "success", message: "" })}
                className="ml-auto text-gray-500 hover:text-gray-700"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary">{t.siteName}</h1>

              {/* Desktop Search */}
              <div className="hidden md:flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder={t.search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10 w-64"
                  />
                </div>
                <Button onClick={handleSearch} size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="flex items-center space-x-1"
                >
                  <Globe className="h-4 w-4" />
                  <span className="text-xs uppercase">{currentLang}</span>
                </Button>
                {showLanguageMenu && (
                  <div className="absolute right-0 mt-2 w-32 bg-background border rounded-md shadow-lg z-50">
                    <button
                      onClick={() => changeLanguage("uz")}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                    >
                      🇺🇿 O'zbek
                    </button>
                    <button
                      onClick={() => changeLanguage("ru")}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                    >
                      🇷🇺 Русский
                    </button>
                    <button
                      onClick={() => changeLanguage("en")}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                    >
                      🇺🇸 English
                    </button>
                  </div>
                )}
              </div>

              <Button variant="ghost" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              {currentUser ? (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => router.push("/chat")}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {t.chat}
                  </Button>
                  <Avatar
                    className="h-8 w-8 cursor-pointer"
                    onClick={() => router.push(`/profile?username=${currentUser.username}`)}
                  >
                    <AvatarImage src={`${apiEndpoints.uploads}/${currentUser.avatar}`} />
                    <AvatarFallback>{currentUser.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{currentUser.username}</span>
                  <Button variant="outline" size="sm" onClick={handleLogoutClick}>
                    {t.logout}
                  </Button>
                  {currentUser.is_admin === 1 && (
                    <Button variant="outline" size="sm" onClick={() => window.open(apiEndpoints.adminPanel, "_blank")}>
                      {t.adminPanel}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setShowLogin(true)}>
                    {t.login}
                  </Button>
                  <Button size="sm" onClick={() => setShowRegister(true)}>
                    {t.register}
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t">
              <div className="flex flex-col space-y-2 mt-4">
                {/* Mobile Search */}
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder={t.search}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={handleSearch} size="sm">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => changeLanguage("uz")}
                    className={currentLang === "uz" ? "bg-muted" : ""}
                  >
                    🇺🇿 UZ
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => changeLanguage("ru")}
                    className={currentLang === "ru" ? "bg-muted" : ""}
                  >
                    🇷🇺 RU
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => changeLanguage("en")}
                    className={currentLang === "en" ? "bg-muted" : ""}
                  >
                    🇺🇸 EN
                  </Button>
                </div>

                <Button variant="ghost" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                  {theme === "dark" ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                  {theme === "dark" ? t.lightMode : t.darkMode}
                </Button>

                {currentUser ? (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => router.push("/chat")}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {t.chat}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/profile?username=${currentUser.username}`)}>
                      {t.profile}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleLogoutClick}>
                      {t.logout}
                    </Button>
                    {currentUser.is_admin === 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(apiEndpoints.adminPanel, "_blank")}
                      >
                        {t.adminPanel}
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setShowLogin(true)}>
                      {t.login}
                    </Button>
                    <Button size="sm" onClick={() => setShowRegister(true)}>
                      {t.register}
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Posts Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-card rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
            >
              {post.image && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={`${apiEndpoints.uploads}/${post.image}`}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`${apiEndpoints.uploads}/${post.avatar}`} />
                    <AvatarFallback>{post.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{post.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString(
                        currentLang === "uz" ? "uz-UZ" : currentLang === "ru" ? "ru-RU" : "en-US",
                      )}
                    </p>
                  </div>
                </div>

                <h2 className="text-xl font-bold mb-2 line-clamp-2 text-balance">{post.title}</h2>
                <div
                  className="text-muted-foreground mb-4 text-pretty leading-relaxed line-clamp-3 [&_code]:bg-muted [&_pre]:bg-muted"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {post.hashtags && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.hashtags.split(",").map((tag, index) => (
                      <span key={index} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className={`text-muted-foreground hover:text-red-500 transition-colors ${
                        likedPosts.has(post.id) ? "text-red-500" : ""
                      }`}
                    >
                      <svg
                        className={`h-4 w-4 mr-1 ${likedPosts.has(post.id) ? "fill-current" : ""}`}
                        fill={likedPosts.has(post.id) ? "currentColor" : "none"}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      {post.like_count}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (showComments === post.id) {
                          setShowComments(null)
                        } else {
                          setShowComments(post.id)
                          loadComments(post.id)
                        }
                      }}
                      className="text-muted-foreground hover:text-blue-500"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {post.comment_count}
                    </Button>
                  </div>

                  <Button variant="outline" size="sm" onClick={() => router.push(`/posts/?postid=${post.id}`)}>
                    {t.readMore}
                  </Button>
                </div>

                {/* Comments Section */}
                {showComments === post.id && (
                  <Dialog open={showComments === post.id} onOpenChange={() => setShowComments(null)}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                      <DialogHeader>
                        <DialogTitle className="flex items-center">
                          <MessageCircle className="h-5 w-5 mr-2" />
                          Izohlar ({comments.length})
                        </DialogTitle>
                      </DialogHeader>

                      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                        {currentUser ? (
                          <form onSubmit={(e) => { e.preventDefault(); handleComment(post.id); }} className="mb-6">
                            <div className="flex space-x-4">
                              <Avatar className="h-10 w-10 border-2 border-primary/20">
                                <AvatarImage src={`${apiEndpoints.uploads}/${currentUser.avatar}`} />
                                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                                  {currentUser.username[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <Textarea
                                  placeholder={t.writeComment}
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
                                  {t.send}
                                </Button>
                              </div>
                            </div>
                          </form>
                        ) : (
                          <div className="mb-6 p-6 bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl text-center border border-border/50">
                            <p className="text-muted-foreground mb-3">Izoh qoldirish uchun tizimga kiring</p>
                            <Button
                              variant="outline"
                              onClick={() => setShowLogin(true)}
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
                                  <span className="font-semibold text-foreground hover:text-primary cursor-pointer">
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
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Load More Button */}
        {posts.length > 0 && (
          <div className="text-center mt-8">
            <Button onClick={loadMorePosts} disabled={loading} variant="outline">
              {loading ? t.loading : t.loadMore}
            </Button>
          </div>
        )}

        {posts.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Hech narsa topilmadi</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? `"${searchQuery}" bo'yicha natija topilmadi` : "Hozircha postlar mavjud emas"}
              </p>
              {searchQuery && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery("")
                    setPage(1)
                    loadPosts("", 1)
                  }}
                >
                  Barcha postlarni ko'rish
                </Button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">{t.loginTitle}</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                placeholder={t.email}
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                required
              />
              <Input
                type="password"
                placeholder={t.password}
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
              <div className="flex items-center space-x-2">
                <img src={captchaUrl || "/placeholder.svg"} alt="Captcha" className="border rounded" />
                <Button type="button" variant="outline" size="sm" onClick={refreshCaptcha}>
                  {t.refresh}
                </Button>
              </div>
              <Input
                placeholder={t.captcha}
                value={loginForm.captcha}
                onChange={(e) => setLoginForm({ ...loginForm, captcha: e.target.value })}
                required
              />
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">
                  {t.login}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowLogin(false)}>
                  {t.cancel}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegister && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">{t.registerTitle}</h2>
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                placeholder={t.username}
                value={registerForm.username}
                onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                required
              />
              <Input
                type="email"
                placeholder={`${t.email} (@gmail.com)`}
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                required
              />
              <Input
                type="password"
                placeholder={t.password}
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                required
              />
              <div className="flex items-center space-x-2">
                <img src={captchaUrl || "/placeholder.svg"} alt="Captcha" className="border rounded" />
                <Button type="button" variant="outline" size="sm" onClick={refreshCaptcha}>
                  {t.refresh}
                </Button>
              </div>
              <Input
                placeholder={t.captcha}
                value={registerForm.captcha}
                onChange={(e) => setRegisterForm({ ...registerForm, captcha: e.target.value })}
                required
              />
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">
                  {t.register}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowRegister(false)}>
                  {t.cancel}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Verification Modal */}
      {showVerification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">{t.emailVerification}</h2>
            <p className="text-muted-foreground mb-4">Emailingizga yuborilgan tasdiqlash kodini kiriting</p>
            <form onSubmit={handleVerification} className="space-y-4">
              <Input
                placeholder={t.verificationCode}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
              />
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">
                  {t.verify}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowVerification(false)}>
                  {t.cancel}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Footer */}
      <footer className="bg-card border-t mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-primary">{t.siteName}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{t.brandDesc}</p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="p-2 hover:text-blue-500">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </Button>
                <Button variant="ghost" size="sm" className="p-2 hover:text-blue-600">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </Button>
                <Button variant="ghost" size="sm" className="p-2 hover:text-gray-800">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                  </svg>
                </Button>
                <Button variant="ghost" size="sm" className="p-2 hover:text-red-500">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">{t.quickLinks}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Button variant="ghost" size="sm" className="h-auto p-0 text-muted-foreground hover:text-foreground">
                    {t.home}
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => router.push("/chat")}
                  >
                    {t.chat}
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => router.push("/contact")}
                  >
                    {t.contact}
                  </Button>
                </li>
                <li>
                  <Button variant="ghost" size="sm" className="h-auto p-0 text-muted-foreground hover:text-foreground">
                    {t.help}
                  </Button>
                </li>
              </ul>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">{t.categories}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => searchByCategory("JavaScript")}
                  >
                    JavaScript
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => searchByCategory("Python")}
                  >
                    Python
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => searchByCategory("React")}
                  >
                    React
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => searchByCategory("Node.js")}
                  >
                    Node.js
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => searchByCategory("Web Development")}
                  >
                    Web Development
                  </Button>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                {t.newsletter}
              </h4>
              <p className="text-sm text-muted-foreground">{t.newsletterDesc}</p>
              {newsletterSubscribed ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">{t.subscribed}</span>
                </div>
              ) : (
                <Button 
                  onClick={() => setShowNewsletterModal(true)} 
                  size="sm" 
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {t.subscribe}
                </Button>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">{t.loginTitle}</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                placeholder={t.email}
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                required
              />
              <Input
                type="password"
                placeholder={t.password}
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
              <div className="flex items-center space-x-2">
                <img src={captchaUrl || "/placeholder.svg"} alt="Captcha" className="border rounded" />
                <Button type="button" variant="outline" size="sm" onClick={refreshCaptcha}>
                  {t.refresh}
                </Button>
              </div>
              <Input
                placeholder={t.captcha}
                value={loginForm.captcha}
                onChange={(e) => setLoginForm({ ...loginForm, captcha: e.target.value })}
                required
              />
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">
                  {t.login}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowLogin(false)}>
                  {t.cancel}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegister && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">{t.registerTitle}</h2>
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                placeholder={t.username}
                value={registerForm.username}
                onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                required
              />
              <Input
                type="email"
                placeholder={`${t.email} (@gmail.com)`}
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                required
              />
              <Input
                type="password"
                placeholder={t.password}
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                required
              />
              <div className="flex items-center space-x-2">
                <img src={captchaUrl || "/placeholder.svg"} alt="Captcha" className="border rounded" />
                <Button type="button" variant="outline" size="sm" onClick={refreshCaptcha}>
                  {t.refresh}
                </Button>
              </div>
              <Input
                placeholder={t.captcha}
                value={registerForm.captcha}
                onChange={(e) => setRegisterForm({ ...registerForm, captcha: e.target.value })}
                required
              />
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">
                  {t.register}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowRegister(false)}>
                  {t.cancel}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Verification Modal */}
      {showVerification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">{t.emailVerification}</h2>
            <p className="text-muted-foreground mb-4">Emailingizga yuborilgan tasdiqlash kodini kiriting</p>
            <form onSubmit={handleVerification} className="space-y-4">
              <Input
                placeholder={t.verificationCode}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
              />
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">
                  {t.verify}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowVerification(false)}>
                  {t.cancel}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal - Request Step */}
      {showPasswordReset && passwordResetStep === "request" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-md shadow-2xl border">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Parol tiklash</h2>
              <p className="text-muted-foreground">Ro'yxatdan o'tgan email manzilingizni kiriting</p>
            </div>

            <form onSubmit={handlePasswordResetRequest} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder={t.email}
                  value={passwordResetForm.email}
                  onChange={(e) => setPasswordResetForm({ ...passwordResetForm, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">{t.captcha}</label>
                <div className="flex items-center space-x-2 mb-2">
                  <img src={passwordResetCaptchaUrl || "/placeholder.svg"} alt="Captcha" className="border rounded" />
                  <Button type="button" variant="outline" size="sm" onClick={refreshPasswordResetCaptcha}>
                    {t.refresh}
                  </Button>
                </div>
                <Input
                  placeholder="Yuqoridagi kodni kiriting"
                  value={passwordResetForm.captcha}
                  onChange={(e) => setPasswordResetForm({ ...passwordResetForm, captcha: e.target.value })}
                  required
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  disabled={isPasswordResetLoading}
                >
                  {isPasswordResetLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Kodni yubormoqda...</span>
                    </div>
                  ) : (
                    <>
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Kod yuborish
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPasswordReset(false)
                    setPasswordResetStep("request")
                    setPasswordResetForm({ email: "", captcha: "" })
                  }}
                  disabled={isPasswordResetLoading}
                >
                  {t.cancel}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal - Verify Step */}
      {showPasswordReset && passwordResetStep === "verify" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-md shadow-2xl border">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Kodni tasdiqlash</h2>
              <p className="text-muted-foreground">{passwordResetForm.email} ga yuborilgan kodni kiriting</p>
            </div>

            <form onSubmit={handlePasswordResetVerify} className="space-y-4">
              <div>
                <Input
                  placeholder={t.verificationCode}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  disabled={isPasswordResetLoading}
                >
                  {isPasswordResetLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Tasdiqlanmoqda...</span>
                    </div>
                  ) : (
                    <>
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Kodni tasdiqlash
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPasswordResetStep("request")
                    refreshPasswordResetCaptcha()
                  }}
                  disabled={isPasswordResetLoading}
                >
                  Orqaga
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal - New Password Step */}
      {showPasswordReset && passwordResetStep === "new_password" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-md shadow-2xl border">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Yangi parol</h2>
              <p className="text-muted-foreground">Kamida 8 ta belgidan iborat parol kiriting</p>
            </div>

            <form onSubmit={handlePasswordResetConfirm} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Yangi parol"
                  value={newPasswordForm.password}
                  onChange={(e) => setNewPasswordForm({ ...newPasswordForm, password: e.target.value })}
                  minLength={8}
                  required
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Parolni tasdiqlang"
                  value={newPasswordForm.confirmPassword}
                  onChange={(e) => setNewPasswordForm({ ...newPasswordForm, confirmPassword: e.target.value })}
                  minLength={8}
                  required
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                  disabled={isPasswordResetLoading || newPasswordForm.password !== newPasswordForm.confirmPassword}
                >
                  {isPasswordResetLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Yangilanmoqda...</span>
                    </div>
                  ) : (
                    <>
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Parolni yangilash
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPasswordResetStep("request")
                    setNewPasswordForm({ password: "", confirmPassword: "" })
                  }}
                  disabled={isPasswordResetLoading}
                >
                  Orqaga
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Newsletter Modal */}
      {showNewsletterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-md shadow-2xl border">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{t.newsletter}</h2>
              <p className="text-muted-foreground">{t.newsletterDesc}</p>
            </div>
            
            <form onSubmit={handleNewsletterSubscribe} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder={t.enterEmail}
                  value={newsletterForm.email}
                  onChange={(e) => setNewsletterForm({ ...newsletterForm, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">{t.captcha}</label>
                <div className="flex items-center space-x-2 mb-2">
                  <img src={newsletterCaptchaUrl || "/placeholder.svg"} alt="Captcha" className="border rounded" />
                  <Button type="button" variant="outline" size="sm" onClick={refreshNewsletterCaptcha}>
                    {t.refresh}
                  </Button>
                </div>
                <Input
                  placeholder="Yuqoridagi kodni kiriting"
                  value={newsletterForm.captcha}
                  onChange={(e) => setNewsletterForm({ ...newsletterForm, captcha: e.target.value })}
                  required
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" 
                  disabled={isNewsletterLoading}
                >
                  {isNewsletterLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Obuna bo'lmoqda...</span>
                    </div>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      {t.subscribe}
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowNewsletterModal(false)}
                  disabled={isNewsletterLoading}
                  className="flex-1"
                >
                  {t.cancel}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Chiqishni tasdiqlang</h3>
            <p className="text-muted-foreground mb-6">Rostdan ham tizimdan chiqmoqchimisiz?</p>
            <div className="flex space-x-2">
              <Button onClick={logout} variant="destructive" className="flex-1">
                Ha, chiqish
              </Button>
              <Button onClick={() => setShowLogoutConfirm(false)} variant="outline" className="flex-1">
                Bekor qilish
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}