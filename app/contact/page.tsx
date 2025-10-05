"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, MapPin, Send, ArrowLeft } from "lucide-react"
import { getCurrentLang } from "@/lib/utils"
import { apiEndpoints, apiCall } from "@/lib/api-config"

export default function ContactPage() {
  const router = useRouter()
  const [lang, setLang] = useState<"uz" | "ru" | "en">("uz")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    captcha: "",
  })
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [newsletterCaptcha, setNewsletterCaptcha] = useState("")
  const [newsletterLoading, setNewsletterLoading] = useState(false)
  const [captchaUrl, setCaptchaUrl] = useState<string>("")
  const [newsletterCaptchaUrl, setNewsletterCaptchaUrl] = useState<string>("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    refreshCaptcha()
    refreshNewsletterCaptcha()
    setLang(getCurrentLang())
  }, [])

  const refreshCaptcha = async () => {
    const timestamp = Date.now()

    try {
      console.log('Fetching contact captcha from:', `${apiEndpoints.captcha}?t=${timestamp}&type=contact`)

      // Generate captcha using PHP backend with proper session handling
      const response = await fetch(`${apiEndpoints.captcha}?t=${timestamp}&type=contact`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          "Accept": "image/png"
        }
      })

      console.log('Captcha response status:', response.status)
      console.log('Captcha response headers:', Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const blob = await response.blob()
        console.log('Captcha blob size:', blob.size, 'type:', blob.type)
        const imageUrl = URL.createObjectURL(blob)
        setCaptchaUrl(imageUrl)
        console.log('Contact captcha loaded successfully with session')
      } else {
        console.error('Captcha load failed:', response.status, response.statusText)
        // Fallback: generate a simple placeholder or disable captcha
        console.warn('Using placeholder captcha due to API failure')
        setCaptchaUrl('/placeholder.svg')
      }
    } catch (error) {
      console.error('Contact captcha load error:', error)
      // Fallback for network errors
      setCaptchaUrl('/placeholder.svg')
    }
  }

  const refreshNewsletterCaptcha = async () => {
    const timestamp = Date.now()

    try {
      console.log('Fetching newsletter captcha from:', `${apiEndpoints.captcha}?t=${timestamp}&type=newsletter`)

      // Generate captcha using PHP backend with proper session handling
      const response = await fetch(`${apiEndpoints.captcha}?t=${timestamp}&type=newsletter`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          "Accept": "image/png"
        }
      })

      console.log('Newsletter captcha response status:', response.status)
      console.log('Newsletter captcha response headers:', Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const blob = await response.blob()
        console.log('Newsletter captcha blob size:', blob.size, 'type:', blob.type)
        const imageUrl = URL.createObjectURL(blob)
        setNewsletterCaptchaUrl(imageUrl)
        console.log('Newsletter captcha loaded successfully with session')
      } else {
        console.error('Newsletter captcha load failed:', response.status, response.statusText)
        // Fallback: generate a simple placeholder or disable captcha
        console.warn('Using placeholder captcha due to API failure')
        setNewsletterCaptchaUrl('/placeholder.svg')
      }
    } catch (error) {
      console.error('Newsletter captcha load error:', error)
      // Fallback for network errors
      setNewsletterCaptchaUrl('/placeholder.svg')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Basic client-side validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      alert(lang === 'ru' ? 'Заполните все поля' : lang === 'en' ? 'Please fill all fields' : 'Barcha maydonlarni to\'ldiring')
      setLoading(false)
      return
    }

    // Skip captcha validation if using placeholder (API not available)
    if (captchaUrl === '/placeholder.svg') {
      console.warn('Skipping captcha validation - using placeholder mode')
    } else if (!formData.captcha.trim()) {
      alert(lang === 'ru' ? 'Введите код безопасности' : lang === 'en' ? 'Please enter security code' : 'Xavfsizlik kodini kiriting')
      setLoading(false)
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      alert(lang === 'ru' ? 'Введите корректный email адрес' : lang === 'en' ? 'Please enter a valid email address' : 'To\'g\'ri email manzil kiriting')
      setLoading(false)
      return
    }

    try {
      console.log("Contact form submission:", {
        name: formData.name,
        email: formData.email,
        captcha: formData.captcha,
        message: formData.message.substring(0, 50) + "...",
        usingPlaceholderCaptcha: captchaUrl === '/placeholder.svg'
      })

      // Send contact form data to backend for captcha validation
      const response = await fetch(apiEndpoints.contact, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Contact response data:", data)

      if (data.success) {
        alert(lang === 'ru' ? 'Сообщение отправлено успешно!' : lang === 'en' ? 'Message sent successfully!' : 'Sizning habaringiz muvaffaqiyatli yuborildi!')
        setFormData({ name: "", email: "", message: "", captcha: "" })
        refreshCaptcha()
      } else {
        alert(data.message || (lang === 'ru' ? 'Ошибка отправки сообщения' : lang === 'en' ? 'Failed to send message' : 'Xabar yuborishda xatolik'))
        refreshCaptcha()
      }
    } catch (error) {
      console.error("Contact form error:", error)
      alert(lang === 'ru' ? 'Ошибка соединения с сервером. Попробуйте позже.' : lang === 'en' ? 'Connection error. Please try again later.' : 'Server bilan bog\'lanishda xatolik. Qaytadan urinib ko\'ring.')
      refreshCaptcha()
    }
    setLoading(false)
  }

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setNewsletterLoading(true)

    // Basic client-side validation
    if (!newsletterEmail.trim()) {
      alert(lang === 'ru' ? 'Заполните все поля' : lang === 'en' ? 'Please fill all fields' : 'Barcha maydonlarni to\'ldiring')
      setNewsletterLoading(false)
      return
    }

    // Skip captcha validation if using placeholder (API not available)
    if (newsletterCaptchaUrl === '/placeholder.svg') {
      console.warn('Skipping newsletter captcha validation - using placeholder mode')
    } else if (!newsletterCaptcha.trim()) {
      alert(lang === 'ru' ? 'Введите код безопасности' : lang === 'en' ? 'Please enter security code' : 'Xavfsizlik kodini kiriting')
      setNewsletterLoading(false)
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newsletterEmail)) {
      alert(lang === 'ru' ? 'Введите корректный email адрес' : lang === 'en' ? 'Please enter a valid email address' : 'To\'g\'ri email manzil kiriting')
      setNewsletterLoading(false)
      return
    }

    try {
      console.log("Newsletter subscription attempt:", {
        email: newsletterEmail,
        captcha: newsletterCaptcha,
        usingPlaceholderCaptcha: newsletterCaptchaUrl === '/placeholder.svg'
      })

      // Send newsletter subscription data to backend for captcha validation
      const response = await fetch(apiEndpoints.newsletterSubscribe, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        credentials: 'include',
        body: JSON.stringify({
          email: newsletterEmail,
          captcha: newsletterCaptcha,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Newsletter subscription response:", data)

      if (data.success) {
        alert(lang === 'ru' ? 'Успешная подписка на рассылку! 🎉' : lang === 'en' ? 'Newsletter subscription successful! 🎉' : 'Newsletter obunasi muvaffaqiyatli! 🎉')
        setNewsletterEmail("")
        setNewsletterCaptcha("")
        refreshNewsletterCaptcha()
      } else {
        alert(data.message || (lang === 'ru' ? 'Ошибка подписки' : lang === 'en' ? 'Subscription failed' : 'Obuna bo\'lishda xatolik'))
        setNewsletterCaptcha("")
        refreshNewsletterCaptcha()
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error)
      alert(lang === 'ru' ? 'Ошибка соединения с сервером. Попробуйте позже.' : lang === 'en' ? 'Connection error. Please try again later.' : 'Server bilan bog\'lanishda xatolik. Qaytadan urinib ko\'ring.')
      refreshNewsletterCaptcha()
    }
    setNewsletterLoading(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Back Button */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.push("/")} className="hover:bg-primary/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Orqaga
            </Button>
            <h1 className="text-xl font-bold text-primary">{lang === 'ru' ? 'Контакты' : lang === 'en' ? 'Contact' : "Bog'lanish"}</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-balance">{lang === 'ru' ? 'Свяжитесь с нами' : lang === 'en' ? 'Get in touch' : "Biz bilan bog'laning"}</h1>
            <p className="text-xl text-muted-foreground text-pretty">
              Savollaringiz bormi? Biz sizga yordam berishga tayyormiz!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Send className="h-5 w-5 mr-2" />
                  {lang === 'ru' ? 'Отправить сообщение' : lang === 'en' ? 'Send a message' : 'Xabar yuborish'}
                </CardTitle>
                <CardDescription>{lang === 'ru' ? 'Заполните форму — мы свяжемся с вами' : lang === 'en' ? 'Fill the form — we will reply soon' : "Formani to'ldiring va biz tez orada javob beramiz"}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">{lang === 'ru' ? 'Ваше имя' : lang === 'en' ? 'Your name' : 'Ismingiz'}</label>
                    <Input
                      placeholder="To'liq ismingizni kiriting"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">{lang === 'ru' ? 'Сообщение' : lang === 'en' ? 'Message' : 'Xabar'}</label>
                    <Textarea
                      placeholder="Xabaringizni yozing..."
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">{lang === 'ru' ? 'Код безопасности' : lang === 'en' ? 'Security code' : 'Xavfsizlik kodi'}</label>
                    <div className="flex items-center space-x-2 mb-2">
                      <img 
                        src={captchaUrl || "/placeholder.svg"} 
                        alt="Captcha" 
                        className="border rounded" 
                        crossOrigin="use-credentials"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={refreshCaptcha}>
                        Yangilash
                      </Button>
                    </div>
                    <Input
                      placeholder="Yuqoridagi kodni kiriting"
                      value={formData.captcha}
                      onChange={(e) => setFormData({ ...formData, captcha: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (lang === 'ru' ? 'Отправка...' : lang === 'en' ? 'Sending...' : 'Yuborilmoqda...') : (lang === 'ru' ? 'Отправить' : lang === 'en' ? 'Send' : 'Xabar yuborish')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bog'lanish ma'lumotlari</CardTitle>
                  <CardDescription>Bizga quyidagi usullar orqali murojaat qilishingiz mumkin</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-muted-foreground">info@codeblog.uz</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Telefon</p>
                      <p className="text-muted-foreground">+998 90 123 45 67</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Manzil</p>
                      <p className="text-muted-foreground">Toshkent, O'zbekiston</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ish vaqti</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Dushanba - Juma</span>
                      <span className="text-muted-foreground">9:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shanba</span>
                      <span className="text-muted-foreground">10:00 - 16:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Yakshanba</span>
                      <span className="text-muted-foreground">Dam olish</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    Newsletter obunasi
                  </CardTitle>
                  <CardDescription>Yangi postlar haqida birinchi bo'lib xabar oling</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                    <div>
                      <Input
                        type="email"
                        placeholder="Email manzilingiz"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Xavfsizlik kodi</label>
                      <div className="flex items-center space-x-2 mb-2">
                        <img 
                          src={newsletterCaptchaUrl || "/placeholder.svg"} 
                          alt="Newsletter Captcha" 
                          className="border rounded" 
                          crossOrigin="use-credentials"
                        />
                        <Button type="button" variant="outline" size="sm" onClick={refreshNewsletterCaptcha}>
                          Yangilash
                        </Button>
                      </div>
                      <Input
                        placeholder="Yuqoridagi kodni kiriting"
                        value={newsletterCaptcha}
                        onChange={(e) => setNewsletterCaptcha(e.target.value)}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={newsletterLoading}>
                      {newsletterLoading ? 'Obuna bo\'lmoqda...' : 'Obuna bo\'lish'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
