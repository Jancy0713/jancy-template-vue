import type { useTodoStore } from '../stores/todo'
import type { useTagStore } from '../stores/tag'

export const initializeSampleData = (
  todoStore: ReturnType<typeof useTodoStore>,
  tagStore: ReturnType<typeof useTagStore>,
) => {
  // 如果已经有数据，不需要初始化
  if (todoStore.todos.length > 0) {
    return
  }

  // 创建示例标签
  const workTag = tagStore.ensureTag('工作', '#409EFF')
  const personalTag = tagStore.ensureTag('个人', '#67C23A')
  const studyTag = tagStore.ensureTag('学习', '#E6A23C')
  const urgentTag = tagStore.ensureTag('紧急', '#F56C6C')

  // 创建示例任务
  const sampleTodos = [
    {
      title: '完成项目演示',
      description: '准备下周一的项目演示材料，包括PPT和演示数据',
      priority: 'high' as const,
      tags: [workTag.name, urgentTag.name],
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2天后
    },
    {
      title: '学习Vue 3新特性',
      description: '深入了解Composition API和Teleport等新特性',
      priority: 'medium' as const,
      tags: [studyTag.name],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1周后
    },
    {
      title: '制定健身计划',
      description: '为新的一年制定合理的健身计划和目标',
      priority: 'low' as const,
      tags: [personalTag.name],
    },
    {
      title: '回复重要邮件',
      description: '回复客户的项目需求邮件',
      priority: 'high' as const,
      tags: [workTag.name],
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 明天
    },
    {
      title: '购买生活用品',
      description: '到超市购买下周需要的生活用品',
      priority: 'low' as const,
      tags: [personalTag.name],
    },
  ]

  // 添加示例任务
  sampleTodos.forEach((todo) => {
    todoStore.addTodo(todo)
  })

  // 将第一个任务设为进行中
  const firstTodo = todoStore.todos[0]
  if (firstTodo) {
    todoStore.updateTodo(firstTodo.id, { status: 'in-progress' })
  }

  // 将最后一个任务设为已完成（模拟昨天完成）
  const lastTodo = todoStore.todos[todoStore.todos.length - 1]
  if (lastTodo) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    todoStore.updateTodo(lastTodo.id, {
      status: 'completed',
      completedAt: yesterday,
    })
  }
}
