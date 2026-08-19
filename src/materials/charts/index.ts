import type { Component } from 'vue'
import type { MaterialDefinition } from '@/api/editor/panels/material/material'
import { barMaterial } from './bar'
import { areaMaterial } from './area.ts'
import { lineMaterial } from './line'
import { pieMaterial } from './pie'
import ComponentBarCharts from './Component/ComponentBarCharts.vue'

const materials: MaterialDefinition[] = [barMaterial, areaMaterial, lineMaterial, pieMaterial]
export function install(register: (material: MaterialDefinition, component?: Component) => void) {
  materials.forEach((material) => register(material, ComponentBarCharts))
}
