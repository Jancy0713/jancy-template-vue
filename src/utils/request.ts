/**
 * API请求统一处理模块
 *
 * 功能特性：
 * 1. 统一的错误处理 - 使用RxJS catchError操作符拦截所有API错误
 * 2. 自动Token管理 - 自动添加认证头，处理Token过期
 * 3. 智能错误显示 - 优先显示服务器返回的错误信息，fallback到默认文案
 * 4. 401自动处理 - Token过期时自动清理并跳转（避免在首页重复跳转）
 *
 * 使用方案：
 *
 * 方案1：推荐使用 - withErrorHandling包装（自动错误处理）
 * ```typescript
 * import { authApi, withErrorHandling } from '@/utils/request'
 * import { firstValueFrom } from 'rxjs'
 *
 * try {
 *   const response = await firstValueFrom(
 *     withErrorHandling(authApi.apiAuthLoginPost({ loginRequest }))
 *   )
 *   // 处理成功响应
 * } catch (error) {
 *   // 错误已自动显示，这里只需处理业务逻辑
 * }
 * ```
 *
 * 方案2：直接使用（需要手动处理错误）
 * ```typescript
 * import { authApi, handleApiError } from '@/utils/request'
 * import { firstValueFrom } from 'rxjs'
 *
 * try {
 *   const response = await firstValueFrom(authApi.apiAuthLoginPost({ loginRequest }))
 * } catch (error) {
 *   const errorMessage = handleApiError(error) // 手动解析错误信息
 *   // 手动显示错误或处理逻辑
 * }
 * ```
 *
 * 错误信息优先级：
 * 1. response.error - 服务器返回的具体错误信息（如 "Invalid email or password"）
 * 2. response.data.error/message/detail - 其他格式的错误信息
 * 3. HTTP状态码对应的默认文案（如 401 -> "认证失败，请重新登录"）
 */

import { Configuration } from '@/service/swagger-service'
import {
  AuthApi,
  HealthApi,
  StatsApi,
  TagsApi,
  TodosApi,
  UsersApi,
} from '@/service/swagger-service/apis'
import { ElMessage } from 'element-plus'
import { catchError, throwError } from 'rxjs'
import type { Observable } from 'rxjs'

/**
 * 从 localStorage 获取当前用户的认证token
 * @returns {string | null} 返回token字符串，如果不存在则返回null
 */
const getToken = (): string | null => {
  return localStorage.getItem('token')
}

/**
 * 根据HTTP状态码获取默认错误文案
 * @param {number} status - HTTP状态码
 * @returns {string} 对应的错误文案
 */
const getDefaultErrorMessage = (status: number): string => {
  switch (status) {
    case 401:
      return '认证失败，请重新登录'
    case 403:
      return '权限不足，拒绝访问'
    case 404:
      return '请求的资源不存在'
    case 422:
      return '请求参数验证失败'
    case 500:
      return '服务器内部错误'
    case 502:
      return '网关错误'
    case 503:
      return '服务暂时不可用'
    case 504:
      return '请求超时'
    default:
      return '请求失败，请稍后重试'
  }
}

/**
 * 解析API错误信息的通用函数
 * 按照优先级解析错误信息：response.error > response.data.error > 状态码默认文案
 * @param {any} error - 错误对象
 * @returns {string} 解析后的错误信息
 */
export const parseApiError = (error: any): string => {
  // 优先使用 response.error（Ajax错误对象格式）
  if (error?.response?.error) {
    return error.response.error
  }

  // 检查 response.data.error（其他格式）
  if (error?.response?.data?.error) {
    return error.response.data.error
  }

  // 检查其他可能的错误字段
  if (error?.response?.data?.message) {
    return error.response.data.message
  }

  if (error?.response?.data?.detail) {
    return error.response.data.detail
  }

  // 如果错误对象有body属性（可能是JSON响应）
  if (error?.body) {
    try {
      const bodyData = typeof error.body === 'string' ? JSON.parse(error.body) : error.body
      if (bodyData.error) {
        return bodyData.error
      }
      if (bodyData.message) {
        return bodyData.message
      }
      if (bodyData.detail) {
        return bodyData.detail
      }
    } catch {
      // JSON解析失败，继续使用原始错误
    }
  }

  // 检查网络错误
  if (error?.message) {
    if (error.message.toLowerCase().includes('network')) {
      return '网络连接失败，请检查网络设置'
    }
    if (error.message.toLowerCase().includes('timeout')) {
      return '请求超时，请稍后重试'
    }
  }

  // 根据状态码使用默认文案
  if (error?.status) {
    return getDefaultErrorMessage(error.status)
  }

  if (error?.response?.status) {
    return getDefaultErrorMessage(error.response.status)
  }

  // 返回原始错误信息
  return error?.message || error?.toString() || '未知错误，请稍后重试'
}

/**
 * 处理token过期的函数
 * 清除本地存储的token和refreshToken，并根据当前路径决定是否跳转
 * 如果当前已在首页(/或/home)，则不执行跳转避免重复跳转
 */
const handleTokenExpired = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')

  // 检查当前路径，如果已经在首页或home页面，则不需要跳转
  const currentPath = window.location.pathname
  if (currentPath === '/' || currentPath === '/home') {
    console.log('当前已在首页，无需跳转')
    return
  }

  // 跳转到首页
  window.location.href = '/'
}

/**
 * 全局错误处理函数，用于RxJS的catchError操作符
 * 自动解析错误信息并使用ElMessage显示，处理401状态码的特殊逻辑
 * @param {any} error - RxJS捕获的错误对象
 * @returns {Observable<never>} 返回错误Observable
 */
const handleGlobalError = (error: any): Observable<never> => {
  console.error('API错误:', error)

  // 解析错误信息
  const errorMessage = parseApiError(error)

  // 处理 401 未授权错误（token 过期或无效）
  if (error?.status === 401) {
    ElMessage.error(errorMessage)
    handleTokenExpired()
    return throwError(() => error)
  }

  // 对于其他错误状态码，显示错误信息
  ElMessage.error(errorMessage)
  return throwError(() => error)
}

// 创建请求拦截器中间件（仅处理请求，不处理响应错误）
const requestMiddleware = {
  pre: (request: any) => {
    // 添加凭证支持
    request.withCredentials = true
    // 添加通用请求头
    request.headers = {
      ...request.headers,
      'Content-Type': 'application/json',
    }

    // 添加 token 到请求头
    const token = getToken()
    if (token) {
      request.headers.Authorization = `Bearer ${token}`
    }

    return request
  },
}

const configuration = new Configuration({
  basePath: import.meta.env.VITE_API_BASE_URL || '',
  middleware: [requestMiddleware],
})

// 创建基础 API 服务实例
const baseAuthApi = new AuthApi(configuration)
const baseHealthApi = new HealthApi(configuration)
const baseStatsApi = new StatsApi(configuration)
const baseTagsApi = new TagsApi(configuration)
const baseTodosApi = new TodosApi(configuration)
const baseUsersApi = new UsersApi(configuration)

/**
 * 导出的API服务实例
 * 这些是原始的API实例，使用时建议配合withErrorHandling函数使用
 *
 * 可用的API服务：
 * - authApi: 认证相关API (登录、注册、登出等)
 * - healthApi: 健康检查API
 * - statsApi: 统计数据API
 * - tagsApi: 标签管理API
 * - todosApi: 待办事项API
 * - usersApi: 用户管理API
 */
export const authApi = baseAuthApi
export const healthApi = baseHealthApi
export const statsApi = baseStatsApi
export const tagsApi = baseTagsApi
export const todosApi = baseTodosApi
export const usersApi = baseUsersApi

/**
 * 辅助函数：为Observable添加统一错误处理
 * 推荐使用此函数包装所有API调用，实现自动错误处理
 * @param {Observable<T>} observable - 需要添加错误处理的Observable
 * @returns {Observable<T>} 包装后的Observable，会自动捕获并处理错误
 *
 * @example
 * ```typescript
 * const response = await firstValueFrom(
 *   withErrorHandling(authApi.apiAuthLoginPost({ loginRequest }))
 * )
 * ```
 */
export const withErrorHandling = <T>(observable: Observable<T>): Observable<T> => {
  return observable.pipe(catchError(handleGlobalError))
}

// 导出配置，以便需要时可以重新初始化服务
export { configuration }

// 导出统一的API错误处理函数，供组件使用
// 注意：错误信息已经在 post 中间件中使用 ElMessage 显示了
// 这个函数主要用于获取错误信息文本，而不是显示错误
export const handleApiError = (error: any): string => {
  console.error('API错误:', error)

  // 如果是 401 错误，已经在中间件中处理了 token 清理和跳转
  if (error?.status === 401) {
    return '认证失败，正在跳转到登录页面...'
  }

  // 使用现有的错误解析函数
  return parseApiError(error)
}

// 导出一个简化的错误处理函数，仅用于日志记录
export const logApiError = (error: any): void => {
  console.error('API错误:', error)
  // 错误信息已经在中间件中显示，这里只记录日志
}

/**
 * 📚 使用示例总结
 *
 * 1. 推荐方式 - 使用withErrorHandling（自动错误处理）：
 * ```typescript
 * import { todosApi, withErrorHandling } from '@/utils/request'
 * import { firstValueFrom } from 'rxjs'
 *
 * try {
 *   const response = await firstValueFrom(
 *     withErrorHandling(todosApi.apiTodosGet())
 *   )
 *   // 处理成功响应
 * } catch (error) {
 *   // 错误信息已自动显示，这里只需处理业务逻辑
 * }
 * ```
 *
 * 2. 手动处理方式（需要自己处理错误显示）：
 * ```typescript
 * import { todosApi, handleApiError } from '@/utils/request'
 * import { firstValueFrom } from 'rxjs'
 *
 * try {
 *   const response = await firstValueFrom(todosApi.apiTodosGet())
 * } catch (error) {
 *   const errorText = handleApiError(error)
 *   ElMessage.error(errorText) // 手动显示错误
 * }
 * ```
 *
 * 🔄 错误处理流程：
 * API调用 → RxJS Observable → catchError → 解析错误信息 → ElMessage显示 → 抛出给业务层
 *
 * ⚠️ 特殊处理：
 * - 401错误：自动清除token并跳转首页（避免在首页重复跳转）
 * - 错误信息优先级：response.error > response.data.error > 状态码默认文案
 */
