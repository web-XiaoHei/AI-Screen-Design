<template>
    <div class="node-property">

        <div class="node-title">
            <span>{{ selectedNode!.name }}</span>
            <div class="flex gap-20">
                <!-- <span class="cursor-pointer" @click="eventVisible = true">
                    <Icon icon="codicon:symbol-event"></Icon>
                </span> -->
                <span class="cursor-pointer" @click="previewJson">
                    <icon-si-json-duotone />
                </span>
            </div>
        </div>
        <el-collapse v-model="active" accordion>
            <el-collapse-item title="布局属性" name="layout">
                <ComponentFormCreate :setters="layoutSetters" :formData="selectedNode" />
            </el-collapse-item>
            <el-collapse-item title="组件属性" name="component">
                <ComponentFormCreate :setters="setters" :formData="selectedNode" />
            </el-collapse-item>
        </el-collapse>
        <!-- 预览 json -->
        <el-drawer :destroy-on-close="true" v-model="jsonVisible" title="编辑 JSON" size="800">
            <ComponentMonacoEditor v-model="jsonText" />

            <template #footer>
                <el-button @click="jsonVisible = false">取消</el-button>
                <el-button type="primary" @click="onConfirm">确认</el-button>
            </template>
        </el-drawer>
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
const jsonVisible = ref(false)
const jsonText = ref('')
function previewJson() {
    jsonText.value = JSON.stringify(selectedNode.value, null, 2)
    jsonVisible.value = true
}

function onConfirm() {
    // 拿到新节点
    const newNode = JSON.parse(jsonText.value)
    // 更新
    editorStore.updateNode(selectedNode.value!.id as string, {
        ...newNode,
        // id type 不能改，沿用之前的
        id: selectedNode.value!.id,
        type: selectedNode.value!.type,
    })
    // 关掉抽屉 
    jsonVisible.value = false
}
</script>

<style scoped>
.node-property {
    .node-title {
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: bg-mix(40);
        font-weight: 600;
        padding: 0 20px;
    }

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
