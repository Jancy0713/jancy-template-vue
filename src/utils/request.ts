import { Configuration } from '@/service/swagger-service'
import {
  AuthApi,
  HealthApi,
  StatsApi,
  TagsApi,
  TodosApi,
  UsersApi,
} from '@/service/swagger-service/apis'

// 从 localStorage 获取 token
const getToken = (): string | null => {
  return localStorage.getItem('token')
}

// 创建请求拦截器中间件
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

// 初始化各个 API 服务
export const authApi = new AuthApi(configuration)
export const healthApi = new HealthApi(configuration)
export const statsApi = new StatsApi(configuration)
export const tagsApi = new TagsApi(configuration)
export const todosApi = new TodosApi(configuration)
export const usersApi = new UsersApi(configuration)

// 导出配置，以便需要时可以重新初始化服务
export { configuration }
