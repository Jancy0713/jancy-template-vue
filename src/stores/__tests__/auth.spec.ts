import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'
import { authApi } from '@/utils/request'
import { of, throwError } from 'rxjs'
import type { AjaxResponse } from 'rxjs/ajax'
import type {
  AuthResponse,
  ApiAuthLogoutPost200Response,
  User,
} from '@/service/swagger-service/models'

// Mock Element Plus message
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock i18n
vi.mock('@/features/i18n/config', () => ({
  getI18n: () => ({
    t: (key: string) => key,
  }),
}))

describe('Auth Store', () => {
  beforeEach(() => {
    // 创建一个新的 Pinia 实例
    setActivePinia(createPinia())

    // 清除 localStorage
    localStorage.clear()

    // 重置所有 mock
    vi.clearAllMocks()
  })

  describe('setToken', () => {
    it('应该正确设置 token 和相关信息', () => {
      const store = useAuthStore()
      store.setToken('test-token', 'test-refresh-token')

      expect(store.token).toBe('test-token')
      expect(store.refreshToken).toBe('test-refresh-token')
      expect(localStorage.getItem('token')).toBe('test-token')
      expect(localStorage.getItem('refreshToken')).toBe('test-refresh-token')
    })

    it('不应该在 token 为空时更新数据', () => {
      const store = useAuthStore()
      store.setToken('', '')

      expect(store.token).toBe('')
      expect(store.refreshToken).toBe('')
      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('refreshToken')).toBeNull()
    })
  })

  describe('isTokenExpired', () => {
    it('应该正确判断 token 是否过期', () => {
      const store = useAuthStore()
      store.setToken('test-token', 'test-refresh-token')

      expect(store.isTokenExpired()).toBe(false)
    })
  })

  describe('login', () => {
    it('登录成功应该正确设置用户信息', async () => {
      const store = useAuthStore()
      const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
      }

      const mockResponse: AjaxResponse<AuthResponse> = {
        response: {
          success: true,
          data: {
            token: 'test-token',
            refreshToken: 'test-refresh-token',
            user: mockUser,
          },
          message: 'Login successful',
        },
        originalEvent: new ProgressEvent('load'),
        xhr: new XMLHttpRequest(),
        request: {
          url: '/api/auth/login',
          method: 'POST',
          async: true,
          headers: {},
          timeout: 0,
          crossDomain: true,
          withCredentials: false,
          responseType: 'json',
        },
        type: 'download_load',
        status: 200,
        responseType: 'json',
        loaded: 0,
        total: 0,
        responseHeaders: {},
      }

      vi.spyOn(authApi, 'apiAuthLoginPost').mockReturnValue(of(mockResponse))

      await store.login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(store.token).toBe('test-token')
      expect(store.refreshToken).toBe('test-refresh-token')
      expect(store.userInfo).toEqual(mockUser)
      expect(store.email).toBe('test@example.com')
    })

    it('登录失败应该抛出错误', async () => {
      const store = useAuthStore()

      vi.spyOn(authApi, 'apiAuthLoginPost').mockReturnValue(
        throwError(() => new Error('Login failed')),
      )

      await expect(
        store.login({
          email: 'test@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow('Login failed')
    })
  })

  describe('register', () => {
    it('注册成功应该正确设置用户信息', async () => {
      const store = useAuthStore()
      const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
      }

      const mockResponse: AjaxResponse<AuthResponse> = {
        response: {
          success: true,
          data: {
            token: 'test-token',
            refreshToken: 'test-refresh-token',
            user: mockUser,
          },
          message: 'Register successful',
        },
        originalEvent: new ProgressEvent('load'),
        xhr: new XMLHttpRequest(),
        request: {
          url: '/api/auth/register',
          method: 'POST',
          async: true,
          headers: {},
          timeout: 0,
          crossDomain: true,
          withCredentials: false,
          responseType: 'json',
        },
        type: 'download_load',
        status: 200,
        responseType: 'json',
        loaded: 0,
        total: 0,
        responseHeaders: {},
      }

      vi.spyOn(authApi, 'apiAuthRegisterPost').mockReturnValue(of(mockResponse))

      await store.register({
        email: 'test@example.com',
        password: 'password123',
        confirm_password: 'password123',
      })

      expect(store.token).toBe('test-token')
      expect(store.refreshToken).toBe('test-refresh-token')
      expect(store.userInfo).toEqual(mockUser)
      expect(store.email).toBe('test@example.com')
    })

    it('注册失败应该抛出错误', async () => {
      const store = useAuthStore()

      vi.spyOn(authApi, 'apiAuthRegisterPost').mockReturnValue(
        throwError(() => new Error('Register failed')),
      )

      await expect(
        store.register({
          email: 'test@example.com',
          password: 'password123',
          confirm_password: 'password123',
        }),
      ).rejects.toThrow('Register failed')
    })
  })

  describe('logout', () => {
    it('登出应该清除所有认证数据', async () => {
      const store = useAuthStore()
      store.setToken('test-token', 'test-refresh-token')
      store.setUserInfo({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
      })

      const mockResponse: AjaxResponse<ApiAuthLogoutPost200Response> = {
        response: {
          message: 'Logout successful',
        },
        originalEvent: new ProgressEvent('load'),
        xhr: new XMLHttpRequest(),
        request: {
          url: '/api/auth/logout',
          method: 'POST',
          async: true,
          headers: {},
          timeout: 0,
          crossDomain: true,
          withCredentials: false,
          responseType: 'json',
        },
        type: 'download_load',
        status: 200,
        responseType: 'json',
        loaded: 0,
        total: 0,
        responseHeaders: {},
      }

      vi.spyOn(authApi, 'apiAuthLogoutPost').mockReturnValue(of(mockResponse))

      await store.logout()

      expect(store.token).toBe('')
      expect(store.refreshToken).toBe('')
      expect(store.userInfo).toBeNull()
      expect(store.email).toBe('')
      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('refreshToken')).toBeNull()
      expect(localStorage.getItem('email')).toBeNull()
    })

    it('即使登出 API 调用失败也应该清除本地数据', async () => {
      const store = useAuthStore()
      store.setToken('test-token', 'test-refresh-token')
      store.setUserInfo({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
      })

      vi.spyOn(authApi, 'apiAuthLogoutPost').mockReturnValue(
        throwError(() => new Error('Logout failed')),
      )

      await expect(store.logout()).rejects.toThrow('Logout failed')

      expect(store.token).toBe('')
      expect(store.refreshToken).toBe('')
      expect(store.userInfo).toBeNull()
      expect(store.email).toBe('')
      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('refreshToken')).toBeNull()
      expect(localStorage.getItem('email')).toBeNull()
    })
  })
})
