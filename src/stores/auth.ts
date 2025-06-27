import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi, withErrorHandling } from '@/utils/request'
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
      const response = await firstValueFrom(
        withErrorHandling(authApi.apiAuthLoginPost({ loginRequest })),
      )

      const data = response.data
      if (data) {
        const { token: newToken, refreshToken: newRefreshToken, user } = data
        if (newToken) {
          setToken(newToken, newRefreshToken || '')
          setUserInfo(user || null)
          email.value = params.email
          localStorage.setItem('email', params.email)
          return data
        }
      }
    } catch (error: any) {
      // 错误已在withErrorHandling中统一处理
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
      const response = await firstValueFrom(
        withErrorHandling(authApi.apiAuthRegisterPost({ registerRequest })),
      )
      const data = response.data
      if (data) {
        const { token: newToken, refreshToken: newRefreshToken, user } = data
        if (newToken) {
          setToken(newToken, newRefreshToken || '')
          setUserInfo(user || null)
          email.value = params.email
          localStorage.setItem('email', params.email)
          return data
        }
      }
      throw new Error('Register response data is empty')
    } catch (error: any) {
      // 错误已在withErrorHandling中统一处理
      throw error
    }
  }

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      const response = await firstValueFrom(withErrorHandling(authApi.apiAuthProfileGet()))
      if (response.data) {
        setUserInfo(response.data)
        return response.data
      }
      throw new Error('User info response data is empty')
    } catch (error: any) {
      // 错误已在withErrorHandling中统一处理
      throw error
    }
  }

  // 登出
  const logout = async () => {
    try {
      await firstValueFrom(withErrorHandling(authApi.apiAuthLogoutPost({})))
      setToken('', '')
      setUserInfo(null)
      email.value = ''
      localStorage.removeItem('email')
    } catch (error: any) {
      // 错误已在withErrorHandling中统一处理，即使登出失败也要清除本地数据
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
      await firstValueFrom(
        withErrorHandling(authApi.apiAuthDeleteAccountDelete({ deleteAccountRequest })),
      )
      // 注销成功后，清除所有用户数据
      setToken('', '')
      setUserInfo(null)
      email.value = ''
      localStorage.removeItem('email')
    } catch (error: any) {
      // 错误已在withErrorHandling中统一处理
      throw error
    }
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
  }
})
