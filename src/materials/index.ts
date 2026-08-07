interface MaterialModule {
  install: (register: (material: MaterialDefinition, component?: Component) => void) => void
}

const materials: MaterialDefinition[] = []
const componentMap = new Map<string, Component | undefined>()
const settersMap = new Map<string, SetterSchema[]>()

export function register(material: MaterialDefinition, component?: Component) {
  materials.push(material)
  componentMap.set(material.schema.type, component)
  settersMap.set(material.schema.type, material.setters)
}

const materialModules = import.meta.glob<MaterialModule>('./*/index.ts', { eager: true })

Object.values(materialModules).forEach((module) => {
  module.install && module.install(register)
})

export function getMaterialsByGroup(groupKey: string): MaterialDefinition[] {
  return materials.filter((item) => item.group === groupKey)
}

export function getMaterialsComponent(type: string): Component | undefined {
  return componentMap.get(type)
}

export function getMaterialsSetters(type: string): SetterSchema[] | undefined {
  return settersMap.get(type)
}

export function createNode(node: Omit<MaterialSchema, 'id'>): MaterialSchema {
  return {
    ...node,
    id: crypto.randomUUID(),
  }
}

// ## 这个模块设计思路

// index.ts 里是一个“插件注册”模式：

// - `MaterialModule` 定义了每个素材模块要暴露的接口：
//   - `install(register)`：模块内部通过这个函数把自己的素材定义和组件注册到统一管理器里。

// - `register(material, component?)` 是统一的注册入口：
//   - `materials.push(material)`：把素材定义记录到 `materials` 数组中，方便后续按分组、类型查找。
//   - `componentMap.set(material.schema.type, component)`：把素材类型和对应组件关联起来，方便后续通过类型返回组件。

// ## workflow（执行流程）

// 1. `import.meta.glob<MaterialModule>('./*/index.ts', { eager: true })`：
//    - 自动扫描 materials 下每个子目录里的 `index.ts` 文件
//    - 以“模块列表”形式导入所有素材模块

// 2. `Object.values(materialModules).forEach((module) => { module.install && module.install(register) })`：
//    - 逐个调用这些模块的 `install` 方法
//    - 把统一的 `register` 函数传进去

// 3. 各素材模块自己在 `install` 里：
//    - 调用 `register(materialDefinition, materialComponent)`
//    - 于是这个素材就被纳入到全局素材列表和组件映射里

// ## 好处

// - 解耦：每个素材模块只负责自己的定义，统一注册逻辑在 index.ts
// - 可扩展：新增素材只需新增一个子目录模块，不用改主入口
// - 统一管理：通过 `getMaterialsByGroup`、`getMaterialsComponent` 方便查询

// ## 具体职责

// - `install`：由素材模块实现，负责把模块自身的内容“注入”到注册中心
// - `register`：由注册中心实现，负责“保存”素材信息和组件映射

// 这个模式类似插件系统，`install` 是插件加载入口，`register` 是把插件信息写入中央仓库的接口。
