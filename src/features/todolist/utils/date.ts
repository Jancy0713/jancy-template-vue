import dayjs from 'dayjs'

export const formatDate = (date: Date | string): string => {
  return dayjs(date).format('YYYY-MM-DD')
}

export const formatDateTime = (date: Date | string): string => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

export const formatRelativeTime = (date: Date | string): string => {
  const now = dayjs()
  const target = dayjs(date)
  const diffDays = target.diff(now, 'day')

  if (diffDays === 0) {
    return '今天'
  } else if (diffDays === 1) {
    return '明天'
  } else if (diffDays === -1) {
    return '昨天'
  } else if (diffDays > 0) {
    return `${diffDays}天后`
  } else {
    return `${Math.abs(diffDays)}天前`
  }
}

export const isOverdue = (dueDate: Date | string): boolean => {
  return dayjs(dueDate).isBefore(dayjs(), 'day')
}

export const isDueSoon = (dueDate: Date | string, days: number = 3): boolean => {
  const target = dayjs(dueDate)
  const now = dayjs()
  const diffDays = target.diff(now, 'day')
  return diffDays >= 0 && diffDays <= days
}

export const isToday = (date: Date | string): boolean => {
  return dayjs(date).isSame(dayjs(), 'day')
}

export const getDateStatus = (dueDate?: Date | string): 'normal' | 'warning' | 'danger' => {
  if (!dueDate) return 'normal'

  if (isOverdue(dueDate)) {
    return 'danger'
  } else if (isDueSoon(dueDate)) {
    return 'warning'
  }

  return 'normal'
}
