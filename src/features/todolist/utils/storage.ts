import type { Todo } from '../types/todo'
import type { Tag } from '../types/tag'
import type { FilterOptions, SortOptions } from '../types/common'

const STORAGE_KEYS = {
  TODOS: 'todo-app-todos',
  TAGS: 'todo-app-tags',
  FILTERS: 'todo-app-filters',
  SORT: 'todo-app-sort',
} as const

interface StoredTodo {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  tags: string[]
  dueDate?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  order: number
}

interface StoredTag {
  id: string
  name: string
  color: string
  createdAt: string
}

export const saveTodos = (todos: Todo[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos))
  } catch (error) {
    console.error('保存任务失败:', error)
  }
}

export const loadTodos = (): Todo[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TODOS)
    if (!data) return []

    const todos: StoredTodo[] = JSON.parse(data)
    // 确保日期字段被正确解析
    return todos.map((todo: StoredTodo) => ({
      ...todo,
      status: todo.status as Todo['status'],
      priority: todo.priority as Todo['priority'],
      createdAt: new Date(todo.createdAt),
      updatedAt: new Date(todo.updatedAt),
      completedAt: todo.completedAt ? new Date(todo.completedAt) : undefined,
      dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
    }))
  } catch (error) {
    console.error('加载任务失败:', error)
    return []
  }
}

export const saveTags = (tags: Tag[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags))
  } catch (error) {
    console.error('保存标签失败:', error)
  }
}

export const loadTags = (): Tag[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TAGS)
    if (!data) return []

    const tags: StoredTag[] = JSON.parse(data)
    return tags.map((tag: StoredTag) => ({
      ...tag,
      createdAt: new Date(tag.createdAt),
    }))
  } catch (error) {
    console.error('加载标签失败:', error)
    return []
  }
}

export const saveFilters = (filters: FilterOptions): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(filters))
  } catch (error) {
    console.error('保存筛选条件失败:', error)
  }
}

export const loadFilters = (): FilterOptions => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FILTERS)
    return data ? JSON.parse(data) : {}
  } catch (error) {
    console.error('加载筛选条件失败:', error)
    return {}
  }
}

export const saveSort = (sort: SortOptions): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SORT, JSON.stringify(sort))
  } catch (error) {
    console.error('保存排序设置失败:', error)
  }
}

export const loadSort = (): SortOptions => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SORT)
    return data ? JSON.parse(data) : { field: 'priority', order: 'desc' }
  } catch (error) {
    console.error('加载排序设置失败:', error)
    return { field: 'priority', order: 'desc' }
  }
}

export const clearAllData = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })
  } catch (error) {
    console.error('清除数据失败:', error)
  }
}
