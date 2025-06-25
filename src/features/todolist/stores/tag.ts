import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Tag, CreateTagData, UpdateTagData } from '../types/tag'
import { saveTags, loadTags } from '../utils/storage'

export const useTagStore = defineStore('tag', () => {
  // State
  const tags = ref<Tag[]>([])

  // Getters
  const sortedTags = computed(() => {
    return [...tags.value].sort((a, b) => a.name.localeCompare(b.name))
  })

  const tagsByColor = computed(() => {
    const grouped = new Map<string, Tag[]>()
    tags.value.forEach((tag) => {
      const color = tag.color
      if (!grouped.has(color)) {
        grouped.set(color, [])
      }
      grouped.get(color)!.push(tag)
    })
    return grouped
  })

  const getUsedColors = computed(() => {
    return [...new Set(tags.value.map((tag) => tag.color))]
  })

  // Actions
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  const addTag = (data: CreateTagData): Tag => {
    const newTag: Tag = {
      id: generateId(),
      ...data,
      createdAt: new Date(),
    }

    tags.value.push(newTag)
    saveTags(tags.value)
    return newTag
  }

  const updateTag = (id: string, data: UpdateTagData): Tag | null => {
    const index = tags.value.findIndex((tag) => tag.id === id)
    if (index === -1) return null

    const updatedTag = {
      ...tags.value[index],
      ...data,
    }

    tags.value[index] = updatedTag
    saveTags(tags.value)
    return updatedTag
  }

  const deleteTag = (id: string): boolean => {
    const index = tags.value.findIndex((tag) => tag.id === id)
    if (index === -1) return false

    tags.value.splice(index, 1)
    saveTags(tags.value)
    return true
  }

  const getTagById = (id: string): Tag | undefined => {
    return tags.value.find((tag) => tag.id === id)
  }

  const getTagByName = (name: string): Tag | undefined => {
    return tags.value.find((tag) => tag.name === name)
  }

  const loadData = (): void => {
    const loadedTags = loadTags()
    tags.value = loadedTags
  }

  // Auto-create tag if not exists
  const ensureTag = (name: string, color: string = '#409EFF'): Tag => {
    const existingTag = getTagByName(name)
    if (existingTag) {
      return existingTag
    }

    return addTag({ name, color })
  }

  return {
    // State
    tags,

    // Getters
    sortedTags,
    tagsByColor,
    getUsedColors,

    // Actions
    addTag,
    updateTag,
    deleteTag,
    getTagById,
    getTagByName,
    loadData,
    ensureTag,
  }
})
