"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Search, Sun, Moon, Menu, X, Bell, Settings, Globe } from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"

interface User {
  id: number
  username: string
  email: string
  avatar: string
  is_admin: number
}

interface EnhancedHeaderProps {
  currentUser: User | null
  searchQuery: string
  setSearchQuery: (query: string) => void
  handleSearch: () => void
  setShowLogin: (show: boolean) => void
  setShowRegister: (show: boolean) => void
  logout: () => void
  currentLang: "uz" | "ru" | "en"
  changeLanguage: (lang: "uz" | "ru" | "en") => void
  translations: any
}

export default function EnhancedHeader({
  currentUser,
  searchQuery,
  setSearchQuery,
  handleSearch,
  setShowLogin,
  setShowRegister,
  logout,
  currentLang,
  changeLanguage,
  translations: t,
}: EnhancedHeaderProps) {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Desktop Search */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">DB</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                DoceBlog
              </h1>
            </div>

            {/* Desktop Search */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10 w-64 bg-muted/50 border-0 focus:bg-background transition-all duration-200"
                />
              </div>
              <Button onClick={handleSearch} size="sm" variant="ghost" className="hover:bg-primary/10">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center space-x-1 hover:bg-primary/10"
              >
                <Globe className="h-4 w-4" />
                <span className="text-xs uppercase font-medium">{currentLang}</span>
              </Button>
              {showLanguageMenu && (
                <div className="absolute right-0 mt-2 w-36 bg-background border rounded-md shadow-lg z-50 animate-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => {
                      changeLanguage("uz")
                      setShowLanguageMenu(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    🇺🇿 O'zbek
                  </button>
                  <button
                    onClick={() => {
                      changeLanguage("ru")
                      setShowLanguageMenu(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    🇷🇺 Русский
                  </button>
                  <button
                    onClick={() => {
                      changeLanguage("en")
                      setShowLanguageMenu(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    🇺🇸 English
                  </button>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hover:bg-primary/10"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {currentUser ? (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => router.push("/chat")} className="hover:bg-primary/10">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {t.chat}
                </Button>
                <Avatar
                  className="h-8 w-8 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all"
                  onClick={() => router.push(`/profile/${currentUser.username}`)}
                >
                  <AvatarImage src={`/uploads/${currentUser.avatar}`} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {currentUser.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{currentUser.username}</span>
                <Button variant="outline" size="sm" onClick={logout} className="hover:bg-destructive/10 bg-transparent">
                  {t.logout}
                </Button>
                {currentUser.is_admin === 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open("/panel.php", "_blank")}
                    className="hover:bg-primary/10"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {t.adminPanel}
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setShowLogin(true)} className="hover:bg-primary/10">
                  {t.login}
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowRegister(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {t.register}
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="relative hover:bg-primary/10 transition-all duration-200 p-2"
            >
              <Search
                className={`h-5 w-5 transition-colors duration-200 ${mobileSearchOpen ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
              />
              {mobileSearchOpen && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
              )}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="hover:bg-primary/10 transition-all duration-200 p-2"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {mobileSearchOpen && (
          <div className="md:hidden mt-4 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center space-x-2 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/10 backdrop-blur-sm">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-4 w-4" />
                <Input
                  placeholder={t.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10 bg-background/90 border-primary/20 focus:border-primary/40 transition-all duration-200 shadow-sm"
                  autoFocus
                />
              </div>
              <Button
                onClick={handleSearch}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200 px-4"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-3 mt-4">
              {/* Language Selection */}
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => changeLanguage("uz")}
                  className={`flex-1 ${currentLang === "uz" ? "bg-primary/10 text-primary" : "hover:bg-primary/5"}`}
                >
                  🇺🇿 UZ
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => changeLanguage("ru")}
                  className={`flex-1 ${currentLang === "ru" ? "bg-primary/10 text-primary" : "hover:bg-primary/5"}`}
                >
                  🇷🇺 RU
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => changeLanguage("en")}
                  className={`flex-1 ${currentLang === "en" ? "bg-primary/10 text-primary" : "hover:bg-primary/5"}`}
                >
                  🇺🇸 EN
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="justify-start hover:bg-primary/10"
              >
                {theme === "dark" ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                {theme === "dark" ? t.lightMode : t.darkMode}
              </Button>

              {currentUser ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/chat")}
                    className="justify-start hover:bg-primary/10"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {t.chat}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/profile/${currentUser.username}`)}
                    className="justify-start hover:bg-primary/10"
                  >
                    <Avatar className="h-4 w-4 mr-2">
                      <AvatarImage src={`/uploads/${currentUser.avatar}`} />
                      <AvatarFallback className="text-xs">{currentUser.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {t.profile}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="justify-start hover:bg-destructive/10 bg-transparent"
                  >
                    {t.logout}
                  </Button>
                  {currentUser.is_admin === 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open("/panel.php", "_blank")}
                      className="justify-start hover:bg-primary/10"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {t.adminPanel}
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLogin(true)}
                    className="justify-start hover:bg-primary/10"
                  >
                    {t.login}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowRegister(true)}
                    className="justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {t.register}
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
