export interface DataSourceSchema {
  /**
   * 数据源类型
   * static =>静态数据
   * api =>接口请求回来的数据
   */

  type: 'static' | 'api'
  id: string
  name: string
  /**
   * 数据源的载体
   */
  data: object
}
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
