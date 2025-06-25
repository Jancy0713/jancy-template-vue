import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type {
  Todo,
  CreateTodoData,
  UpdateTodoData,
  TodoStatus,
  HistoryRecord,
  HistoryActionType,
  HistoryChangeValue,
} from '../types/todo'
import type { FilterOptions, SortOptions, TodoStats } from '../types/common'
import { saveTodos, loadTodos } from '../utils/storage'
import { isOverdue, isToday } from '../utils/date'
import { v4 as uuidv4 } from 'uuid'

export const useTodoStore = defineStore('todo', () => {
  // 状态
  const todos = ref<Todo[]>([])
  const filters = ref<FilterOptions>({})
  const sort = ref<SortOptions>({ field: 'order', order: 'asc' })
  const loading = ref(false)

  // 计算属性
  const filteredTodos = computed(() => {
    let result = [...todos.value]

    // 关键词筛选
    if (filters.value.keyword) {
      const keyword = filters.value.keyword.toLowerCase()
      result = result.filter(
        (todo) =>
          todo.title.toLowerCase().includes(keyword) ||
          (todo.description && todo.description.toLowerCase().includes(keyword)),
      )
    }

    // 状态筛选
    if (filters.value.status && filters.value.status.length > 0) {
      result = result.filter((todo) => filters.value.status!.includes(todo.status))
    }

    // 优先级筛选
    if (filters.value.priority && filters.value.priority.length > 0) {
      result = result.filter((todo) => filters.value.priority!.includes(todo.priority))
    }

    // 标签筛选
    if (filters.value.tags && filters.value.tags.length > 0) {
      result = result.filter((todo) => filters.value.tags!.some((tag) => todo.tags.includes(tag)))
    }

    // 日期范围筛选
    if (filters.value.dateRange) {
      const { type, start, end } = filters.value.dateRange
      result = result.filter((todo) => {
        let dateField: Date | undefined
        switch (type) {
          case 'created':
            dateField = todo.createdAt
            break
          case 'updated':
            dateField = todo.updatedAt
            break
          case 'completed':
            if (!todo.completedAt) return false
            dateField = todo.completedAt
            break
          default:
            return true
        }

        if (start && dateField < start) return false
        if (end && dateField > end) return false
        return true
      })
    }

    return result
  })

  const sortedTodos = computed(() => {
    const result = [...filteredTodos.value]

    // 如果是自定义排序，直接按 order 字段排序
    if (sort.value.field === 'order') {
      return result.sort((a, b) => a.order - b.order)
    }

    result.sort((a, b) => {
      let aValue: number
      let bValue: number

      switch (sort.value.field) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          aValue = priorityOrder[a.priority]
          bValue = priorityOrder[b.priority]
          break
        case 'createdAt':
          aValue = a.createdAt.getTime()
          bValue = b.createdAt.getTime()
          break
        case 'updatedAt':
          aValue = a.updatedAt.getTime()
          bValue = b.updatedAt.getTime()
          break
        case 'completedAt':
          aValue = a.completedAt ? a.completedAt.getTime() : 0
          bValue = b.completedAt ? b.completedAt.getTime() : 0
          break
        case 'dueDate':
          aValue = a.dueDate ? a.dueDate.getTime() : Number.MAX_SAFE_INTEGER
          bValue = b.dueDate ? b.dueDate.getTime() : Number.MAX_SAFE_INTEGER
          break
        default:
          return 0
      }

      if (sort.value.order === 'asc') {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    })

    return result
  })

  const todosByStatus = computed(() => {
    const pending = sortedTodos.value.filter((todo) => todo.status === 'pending')
    const inProgress = sortedTodos.value.filter((todo) => todo.status === 'in-progress')
    const completed = sortedTodos.value.filter((todo) => todo.status === 'completed')

    return {
      pending,
      inProgress,
      completed: {
        today: completed.filter((todo) => todo.completedAt && isToday(todo.completedAt)),
        all: completed,
      },
    }
  })

  const stats = computed((): TodoStats => {
    const total = todos.value.length
    const pending = todos.value.filter((todo) => todo.status === 'pending').length
    const inProgress = todos.value.filter((todo) => todo.status === 'in-progress').length
    const completed = todos.value.filter((todo) => todo.status === 'completed').length
    const overdue = todos.value.filter((todo) => todo.dueDate && isOverdue(todo.dueDate)).length

    // 标签统计
    const tagCounts = new Map<string, number>()
    todos.value.forEach((todo) => {
      todo.tags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      })
    })
    const tagStats = Array.from(tagCounts.entries()).map(([tag, count]) => ({ tag, count }))

    return {
      total,
      pending,
      inProgress,
      completed,
      overdue,
      tagStats,
    }
  })

  // 操作方法
  const HISTORY_DEBOUNCE_TIME = 1000 // 1秒内的相同操作合并

  const addHistory = (
    todo: Todo,
    actionType: HistoryActionType,
    changes?: {
      field: string
      oldValue: HistoryChangeValue
      newValue: HistoryChangeValue
    },
  ) => {
    const now = new Date()
    const history: HistoryRecord = {
      id: uuidv4(),
      todoId: todo.id,
      actionType,
      timestamp: now,
      changes,
    }

    // 检查是否存在最近的相同类型的历史记录
    const lastHistory = todo.history?.[todo.history.length - 1]
    if (
      lastHistory &&
      lastHistory.actionType === actionType &&
      now.getTime() - new Date(lastHistory.timestamp).getTime() < HISTORY_DEBOUNCE_TIME
    ) {
      // 更新最后一条记录的时间戳
      lastHistory.timestamp = now
      // 如果有变更，更新变更信息
      if (changes) {
        lastHistory.changes = changes
      }
    } else {
      // 添加新的历史记录
      todo.history = todo.history || []
      todo.history.push(history)
    }

    todo.updatedAt = now
  }

  const addTodo = (data: CreateTodoData): Todo => {
    const todo: Todo = {
      id: uuidv4(),
      title: data.title,
      description: data.description || '',
      status: 'pending',
      priority: data.priority || 'medium',
      tags: data.tags || [],
      dueDate: data.dueDate,
      createdAt: new Date(),
      updatedAt: new Date(),
      order: todos.value.length,
      history: [],
    }

    todos.value.push(todo)
    addHistory(todo, 'create')
    return todo
  }

  const updateTodo = (id: string, data: UpdateTodoData): Todo | false => {
    const todo = todos.value.find((t) => t.id === id)
    if (!todo) return false

    // 记录变更
    const changes: Array<{
      field: string
      oldValue: HistoryChangeValue
      newValue: HistoryChangeValue
    }> = []

    // 检查并记录每个字段的变更
    if (data.title !== undefined && data.title !== todo.title) {
      changes.push({
        field: 'title',
        oldValue: todo.title,
        newValue: data.title,
      })
      todo.title = data.title
    }

    if (data.description !== undefined && data.description !== todo.description) {
      changes.push({
        field: 'description',
        oldValue: todo.description,
        newValue: data.description,
      })
      todo.description = data.description
    }

    if (data.status !== undefined && data.status !== todo.status) {
      changes.push({
        field: 'status',
        oldValue: todo.status,
        newValue: data.status,
      })
      todo.status = data.status

      // 如果状态变更为已完成，记录完成时间
      if (data.status === 'completed' && !todo.completedAt) {
        todo.completedAt = new Date()
        addHistory(todo, 'complete')
      }
    }

    if (data.priority !== undefined && data.priority !== todo.priority) {
      changes.push({
        field: 'priority',
        oldValue: todo.priority,
        newValue: data.priority,
      })
      todo.priority = data.priority
    }

    if (data.tags !== undefined && JSON.stringify(data.tags) !== JSON.stringify(todo.tags)) {
      changes.push({
        field: 'tags',
        oldValue: todo.tags,
        newValue: data.tags,
      })
      todo.tags = data.tags
    }

    if (data.dueDate !== undefined && data.dueDate?.getTime() !== todo.dueDate?.getTime()) {
      changes.push({
        field: 'dueDate',
        oldValue: todo.dueDate,
        newValue: data.dueDate,
      })
      todo.dueDate = data.dueDate
    }

    if (data.order !== undefined && data.order !== todo.order) {
      changes.push({
        field: 'order',
        oldValue: todo.order,
        newValue: data.order,
      })
      todo.order = data.order
    }

    // 如果有变更，添加历史记录
    if (changes.length > 0) {
      changes.forEach((change) => {
        addHistory(todo, `update_${change.field}` as HistoryActionType, change)
      })
    }

    return todo
  }

  const deleteTodo = (id: string): boolean => {
    const index = todos.value.findIndex((t) => t.id === id)
    if (index === -1) return false

    const todo = todos.value[index]
    addHistory(todo, 'delete')
    todos.value.splice(index, 1)
    return true
  }

  const deleteTodos = (ids: string[]): number => {
    const originalLength = todos.value.length
    todos.value = todos.value.filter((todo) => !ids.includes(todo.id))
    return originalLength - todos.value.length
  }

  const toggleTodoStatus = (id: string): Todo | null => {
    const todo = todos.value.find((t) => t.id === id)
    if (!todo) return null

    let newStatus: TodoStatus
    switch (todo.status) {
      case 'pending':
        newStatus = 'in-progress'
        break
      case 'in-progress':
        newStatus = 'completed'
        break
      case 'completed':
        newStatus = 'pending'
        break
      default:
        newStatus = 'pending'
    }

    const result = updateTodo(id, { status: newStatus })
    return result === false ? null : result
  }

  const updateTodoOrder = (id: string, newOrder: number): Todo | null => {
    const result = updateTodo(id, { order: newOrder })
    return result === false ? null : result
  }

  const setFilters = (newFilters: FilterOptions): void => {
    filters.value = { ...newFilters }
  }

  const clearFilters = (): void => {
    filters.value = {}
  }

  const setSort = (newSort: SortOptions): void => {
    sort.value = { ...newSort }
  }

  const loadData = (): void => {
    loading.value = true
    try {
      todos.value = loadTodos()
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 监听数据变化并自动保存
  watch(
    todos,
    (newTodos) => {
      saveTodos(newTodos)
    },
    { deep: true },
  )

  return {
    // 状态
    todos,
    filters,
    sort,
    loading,

    // 计算属性
    filteredTodos,
    sortedTodos,
    todosByStatus,
    stats,

    // 方法
    addTodo,
    updateTodo,
    deleteTodo,
    deleteTodos,
    toggleTodoStatus,
    updateTodoOrder,
    reorderTodos: (todoIds: string[]): void => {
      todoIds.forEach((id, index) => {
        updateTodoOrder(id, index)
      })
    },
    setFilters,
    clearFilters,
    setSort,
    loadData,
  }
})
