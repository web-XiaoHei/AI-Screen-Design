import ComponentTextMaterial from './Component/ComponentTextMaterial.vue'
import type { Component } from 'vue'

const textMaterials: MaterialDefinition = {
  // 物料元数据

  // DSL：以极其高效的方式描述特定领域的对象、规则和运行方式的语言。

  name: '文本',
  group: 'info',
  icon: 'solar:text-bold',
  setters: [
    {
      key: 'props.content',
      label: '文本内容',
      type: 'input',
    },
    {
      key: 'style.color',
      label: '文本颜色',
      type: 'color',
    }, 
  ],
  schema: {
    // dsl
    type: 'text',
    name: '普通文本',
    layout: {
      x: 0,
      y: 0,
      width: 200,
      height: 50,
    },
    style: {
      color: 'yellow',
    },
    props: {
      content: 'hello world',
    },
  },
}

export function install(register: (material: MaterialDefinition, component?: Component) => void) {
  register(textMaterials, ComponentTextMaterial)
}
