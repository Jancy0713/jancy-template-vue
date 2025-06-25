import { createI18n } from 'vue-i18n'
import type { I18n } from 'vue-i18n'
import { nextTick } from 'vue'
import zhCN from '../locales/zh-CN'
import enUS from '../locales/en-US'

export const SUPPORT_LOCALES = ['zh-CN', 'en-US'] as const
export type SupportLocale = (typeof SUPPORT_LOCALES)[number]

let i18nInstance: I18n | null = null

export function setupI18n() {
  i18nInstance = createI18n({
    legacy: false,
    locale: localStorage.getItem('language') || 'zh-CN',
    fallbackLocale: 'zh-CN',
    messages: {
      'zh-CN': zhCN,
      'en-US': enUS,
    },
  })

  return i18nInstance
}

export function getI18n() {
  if (!i18nInstance) {
    throw new Error('i18n instance is not initialized')
  }
  return i18nInstance.global
}

export async function loadLocaleMessages(i18n: I18n, locale: SupportLocale) {
  // 动态导入语言包
  const messages = await import(`../locales/${locale}.ts`)

  // 设置语言包
  i18n.global.setLocaleMessage(locale, messages.default)

  return nextTick()
}

export async function setI18nLanguage(i18n: I18n, locale: SupportLocale) {
  if (!SUPPORT_LOCALES.includes(locale)) {
    return
  }

  // 如果语言包不存在，加载语言包
  if (!Object.keys(i18n.global.messages.value).includes(locale)) {
    await loadLocaleMessages(i18n, locale)
  }

  // 设置 i18n 语言
  i18n.global.locale.value = locale

  // 设置 html 的 lang 属性
  document.querySelector('html')?.setAttribute('lang', locale)

  // 保存到 localStorage
  localStorage.setItem('language', locale)
}
