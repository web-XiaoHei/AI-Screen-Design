import type { Component } from 'vue'
import type { MaterialDefinition } from '@/api/editor/panels/material/material'

const chartsMaterials: MaterialDefinition = {
  // 物料元数据

  // DSL：以极其高效的方式描述特定领域的对象、规则和运行方式的语言。

  name: '柱状图',
  group: 'charts',
  icon: 'fluent-color:list-bar-16',
  schema: {
    // dsl
    type: 'charts',
    name: '柱状图',
    layout: {
      x: 0,
      y: 0,
      width: 300,
      height: 200,
    },
    props: {
      content: 'hello world',
    },
  },
  setters: [],
}

export function install(register: (material: MaterialDefinition, component?: Component) => void) {
  register(chartsMaterials)
}
