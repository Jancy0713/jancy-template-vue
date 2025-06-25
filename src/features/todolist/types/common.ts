import type { TodoStatus, TodoPriority } from './todo'

export interface FilterOptions {
  status?: TodoStatus[]
  priority?: TodoPriority[]
  tags?: string[]
  dateRange?: {
    type: 'created' | 'updated' | 'completed'
    start?: Date
    end?: Date
  }
  keyword?: string
}

export interface SortOptions {
  field: 'priority' | 'createdAt' | 'updatedAt' | 'completedAt' | 'dueDate' | 'order'
  order: 'asc' | 'desc'
}

export interface TodoStats {
  total: number
  pending: number
  inProgress: number
  completed: number
  overdue: number
  tagStats: { tag: string; count: number }[]
}
