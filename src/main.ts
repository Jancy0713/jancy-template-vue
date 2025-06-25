import './assets/main.css'
import './assets/element-plus.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import enUs from 'element-plus/es/locale/lang/en'

import App from './App.vue'
import router from './router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { useThemeStore } from './features/theme/stores/theme'
import { setupI18n, setI18nLanguage, type SupportLocale } from './features/i18n/config'

async function bootstrap() {
  const app = createApp(App)
  const pinia = createPinia()
  app.use(pinia)

  // 初始化主题
  const themeStore = useThemeStore(pinia)
  themeStore.initTheme()

  // 初始化 i18n
  const i18n = setupI18n()
  app.use(i18n)

  // 初始化语言
  const currentLocale = (localStorage.getItem('language') || 'zh-CN') as SupportLocale
  await setI18nLanguage(i18n, currentLocale)

  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

  app.use(router)
  app.use(ElementPlus, {
    locale: currentLocale === 'zh-CN' ? zhCn : enUs,
  })

  app.mount('#app')
}

bootstrap().catch((error) => {
  console.error('Failed to initialize app:', error)
})
