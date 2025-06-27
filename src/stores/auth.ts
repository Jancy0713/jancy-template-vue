import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { authApi } from '@/utils/request'
import { getI18n } from '@/features/i18n/config'
import type {
  User,
  LoginRequest,
  RegisterRequest,
  DeleteAccountRequest,
} from '@/service/swagger-service/models'
import { firstValueFrom } from 'rxjs'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>('')
  const refreshToken = ref<string>('')
  const userInfo = ref<User | null>(null)
  const email = ref<string>('')

  // 设置token
  const setToken = (newToken: string, newRefreshToken: string) => {
    token.value = newToken
    refreshToken.value = newRefreshToken
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken)
    } else {
      localStorage.removeItem('refreshToken')
    }
  }

  // 设置用户信息
  const setUserInfo = (user: User | null) => {
    userInfo.value = user
  }

  // 检查token是否过期
  const isTokenExpired = () => !token.value

  // 初始化token和用户信息
  const initAuth = () => {
    const storedToken = localStorage.getItem('token')
    const storedRefreshToken = localStorage.getItem('refreshToken')

    if (storedToken) {
      token.value = storedToken
    }
    if (storedRefreshToken) {
      refreshToken.value = storedRefreshToken
    }

    // 如果有token但没有用户信息，尝试获取用户信息
    if (token.value && !userInfo.value) {
      getUserInfo()
    }
  }

  // 登录
  const login = async (params: LoginRequest) => {
    try {
      const loginRequest: LoginRequest = {
        email: params.email,
        password: params.password,
      }
      const response = await firstValueFrom(authApi.apiAuthLoginPost({ loginRequest }))
      const data = response.data
      if (data) {
        const { token: newToken, refreshToken: newRefreshToken, user } = data
        if (newToken) {
          setToken(newToken, newRefreshToken || '')
          setUserInfo(user || null)
          email.value = params.email
          localStorage.setItem('email', params.email)
          ElMessage.success(getI18n().t('auth.login.success'))
          return data
        }
      }
      // 打印调试信息
      console.error('Login接口返回异常:', response)
      throw new Error('Login response data is empty')
    } catch (error: any) {
      showErrorMessage(error.message)
      throw error
    }
  }

  // 注册
  const register = async (params: RegisterRequest) => {
    try {
      const registerRequest: RegisterRequest = {
        email: params.email,
        password: params.password,
        confirm_password: params.password,
      }
      const response = await firstValueFrom(authApi.apiAuthRegisterPost({ registerRequest }))
      const data = response.data
      if (data) {
        const { token: newToken, refreshToken: newRefreshToken, user } = data
        if (newToken) {
          setToken(newToken, newRefreshToken || '')
          setUserInfo(user || null)
          email.value = params.email
          localStorage.setItem('email', params.email)
          ElMessage.success(getI18n().t('auth.register.success'))
          return data
        }
      }
      // 打印调试信息
      console.error('Register接口返回异常:', response)
      throw new Error('Register response data is empty')
    } catch (error: any) {
      showErrorMessage(error.message)
      throw error
    }
  }

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      const response = await firstValueFrom(authApi.apiAuthProfileGet())
      if (response.data) {
        setUserInfo(response.data)
        return response.data
      }
      throw new Error('User info response data is empty')
    } catch (error: any) {
      console.error('Failed to get user info:', error)
      throw error
    }
  }

  // 登出
  const logout = async () => {
    try {
      await firstValueFrom(authApi.apiAuthLogoutPost({}))
      setToken('', '')
      setUserInfo(null)
      email.value = ''
      localStorage.removeItem('email')
    } catch (error: any) {
      showErrorMessage(error.message)
      setToken('', '')
      setUserInfo(null)
      email.value = ''
      localStorage.removeItem('email')
      throw error
    }
  }

  // 注销账号
  const deleteAccount = async (params: DeleteAccountRequest) => {
    try {
      const deleteAccountRequest: DeleteAccountRequest = {
        password: params.password,
        confirmText: params.confirmText,
      }
      await firstValueFrom(authApi.apiAuthDeleteAccountDelete({ deleteAccountRequest }))
      // 注销成功后，清除所有用户数据
      setToken('', '')
      setUserInfo(null)
      email.value = ''
      localStorage.removeItem('email')
      ElMessage.success(getI18n().t('auth.deleteAccount.success'))
    } catch (error: any) {
      showErrorMessage(error.message)
      throw error
    }
  }

  // 显示错误信息
  const showErrorMessage = (message: string) => {
    ElMessage.error(message)
  }

  return {
    token,
    refreshToken,
    userInfo,
    email,
    setToken,
    setUserInfo,
    isTokenExpired,
    initAuth,
    login,
    register,
    getUserInfo,
    logout,
    deleteAccount,
    showErrorMessage,
  }
})
