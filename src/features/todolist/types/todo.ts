export type TodoStatus = 'pending' | 'in-progress' | 'completed'
export type TodoPriority = 'high' | 'medium' | 'low'

export type HistoryActionType =
  | 'create'
  | 'update_title'
  | 'update_description'
  | 'update_status'
  | 'update_priority'
  | 'update_tags'
  | 'update_due_date'
  | 'update_order'
  | 'complete'
  | 'delete'

export type HistoryChangeValue = string | number | boolean | Date | null | undefined | string[]

export interface HistoryRecord {
  id: string
  todoId: string
  actionType: HistoryActionType
  timestamp: Date
  changes?: {
    field: string
    oldValue: HistoryChangeValue
    newValue: HistoryChangeValue
  }
  operator?: string // 预留字段，用于多用户场景
}

export interface Todo {
  id: string
  title: string
  description?: string
  status: TodoStatus
  priority: TodoPriority
  tags: string[]
  dueDate?: Date
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  order: number
  history: HistoryRecord[] // 添加历史记录数组
}

export interface CreateTodoData {
  title: string
  description?: string
  priority?: TodoPriority
  tags?: string[]
  dueDate?: Date
}

export interface UpdateTodoData {
  title?: string
  description?: string
  status?: TodoStatus
  priority?: TodoPriority
  tags?: string[]
  dueDate?: Date
  order?: number
  completedAt?: Date
}
