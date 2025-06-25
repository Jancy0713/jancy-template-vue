import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false)

  // 初始化主题
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    isDark.value = savedTheme === 'dark'
    updateHtmlClass()
  }

  // 切换主题
  const toggleTheme = () => {
    isDark.value = !isDark.value
    updateHtmlClass()
  }

  // 更新 HTML class
  const updateHtmlClass = () => {
    const html = document.documentElement
    if (isDark.value) {
      html.classList.add('dark')
      html.setAttribute('data-theme', 'dark')
    } else {
      html.classList.remove('dark')
      html.setAttribute('data-theme', 'light')
    }
  }

  // 监听主题变化并保存到 localStorage
  watch(isDark, (val) => {
    localStorage.setItem('theme', val ? 'dark' : 'light')
  })

  return {
    isDark,
    toggleTheme,
    initTheme,
  }
})
