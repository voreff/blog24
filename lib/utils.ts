import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Shared language helper
export type AppLang = 'uz' | 'ru' | 'en'

const LANG_STORAGE_KEY = 'blog_language'

export function getCurrentLang(): AppLang {
  if (typeof window === 'undefined') return 'uz'
  const saved = window.localStorage.getItem(LANG_STORAGE_KEY) as AppLang | null
  if (saved === 'uz' || saved === 'ru' || saved === 'en') return saved
  return 'uz'
}

export function setCurrentLang(lang: AppLang) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LANG_STORAGE_KEY, lang)
}
