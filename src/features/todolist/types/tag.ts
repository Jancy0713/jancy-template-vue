export interface Tag {
  id: string
  name: string
  color: string // RGB format, e.g. 'rgb(64, 158, 255)'
  createdAt: Date
}

export interface CreateTagData {
  name: string
  color: string // RGB format
}

export interface UpdateTagData {
  name?: string
  color?: string // RGB format
}
