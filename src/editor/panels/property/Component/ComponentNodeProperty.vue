<template>
    <div class="node-property">
        <el-collapse v-model="active" accordion>
            <el-collapse-item title="布局属性" name="layout">
                <ComponentFormCreate :setters="layoutSetters" :formData="selectedNode" />
            </el-collapse-item>
            <el-collapse-item title="组件属性" name="component">
                <ComponentFormCreate :setters="setters" :formData="selectedNode" />
            </el-collapse-item>
        </el-collapse>

    </div>
</template>

<script setup lang="ts">
import { getMaterialsSetters } from '@/materials'

defineOptions({
    name: 'ComponentNodeProperty'
})

const editorStore = useEditorStore()
const { selectedNode } = storeToRefs(editorStore)

const setters = computed(() => {
    if (!selectedNode.value) return []
    return getMaterialsSetters(selectedNode.value.type) || []
})

const layoutSetters = [{
    key: 'layout.width',
    label: '宽度',
    type: 'number',
    span: 12
}, {
    key: 'layout.height',
    label: '高度',
    type: 'number',
    span: 12
}, {
    key: 'layout.x',
    label: 'X',
    type: 'number',
    span: 12
}, {
    key: 'layout.y',
    label: 'Y',
    type: 'number',
    span: 12
},]

const active = ref('layout')
</script>

<style scoped>
.node-property {
    :deep(.el-collapse) {
        --el-collapse-border-color: var(--border-color);
        --el-collapse-header-height: 48px;
        --el-collapse-header-bg-color: transparent;
        --el-collapse-header-text-color: var(--el-text-color-primary);
        --el-collapse-header-font-size: 13px;
        --el-collapse-content-bg-color: transparent;
        --el-collapse-content-font-size: 13px;
        --el-collapse-content-text-color: var(--el-text-color-primary);
        border-top: 1px solid var(--el-collapse-border-color);
        border-bottom: 1px solid var(--el-collapse-border-color);
    }
}
</style>