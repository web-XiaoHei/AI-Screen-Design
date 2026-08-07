export interface Layout {
  x: number
  y: number
  width: number
  height: number
}

export interface MaterialSchema {
  id?: string
  type: string
  name: string
  layout: Layout
  locked?: boolean
  style?: Record<string, unknown>
  props: Record<string, unknown>
}

export interface SetterSchema {
  key: string
  label: string
  type: string
  [key: string]: unknown
}

export interface MaterialDefinition {
  name: string
  group: string
  icon: string
  schema: Omit<MaterialSchema, 'id'>
  setters: SetterSchema[]
}

const groups = [
  {
    name: '图表',
    icon: 'solar:chart-bold',
    key: 'charts',
  },
  {
    name: '信息',
    icon: 'material-symbols:info',
    key: 'info',
  },
]
export function getGroups(): GroupProps[] {
  return groups
}
