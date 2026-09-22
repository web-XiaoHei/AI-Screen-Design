export type DataSourceItem = Record<string, string | number | boolean | null>

export interface StaticDataSourceSchema {
  /**
   * 数据源类型
   * static => 静态数据
   */
  type: 'static'
  id: string
  name: string
  /**
   * 数据源的载体
   */
  data: DataSourceItem[]
}

export interface ApiDataSourceSchema {
  /**
   * 数据源类型
   * api => 接口请求回来的数据
   */
  type: 'api'
  id: string
  name: string
  /**
   * 接口请求的 URL
   */
  url: string
  data: DataSourceItem[]
  interval?: number
  params?: Record<string, unknown>
}

export type DataSourceSchema = StaticDataSourceSchema | ApiDataSourceSchema

export interface CanvasSchema {
  width: number
  height: number
  backgroundColor: string
}

export interface PageSchema {
  canvas: CanvasSchema
  nodes: MaterialSchema[]
  dataSources: DataSourceSchema[]
}
