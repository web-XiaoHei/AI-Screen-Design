<template>
    <div class="toolRight flex gap-20">
        <div class="toolItem">
            <icon-fluent-preview-link-20-filled />
        </div>
        <div class="toolItem" @click="previewJson">
            <icon-si-json-duotone />
        </div>
        <div class="toolItem">
            <icon-fluent-mdl2-publish-course />
        </div>
        <div class="toolItem" @click="onImport">
            <icon-lucide-import />
        </div>
        <div class="toolItem" @click="onExport">
            <icon-gg-export />
        </div>
        <input type="file" ref="importRef" v-show="false" @change="onFileChange">
        <el-drawer title="编辑JSON" size="800" v-model="visible">
            <component-monaco-editor v-model="jsonText"></component-monaco-editor>

            <template #footer>
                <el-button @click="visible = false">取消</el-button>
                <el-button type="primary" @click="confirmFn">确认</el-button>
            </template>
        </el-drawer>
    </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'


defineOptions({
    name: 'toolbar-left'
})
const editorStore = useEditorStore()
const { page } = storeToRefs(editorStore)

const visible = ref(false)
const jsonText = ref('')
const importRef = useTemplateRef('importRef')

function previewJson() {
    visible.value = true
    jsonText.value = JSON.stringify(page.value, null, 2)
}

function confirmFn() {
    const newPage = JSON.parse(jsonText.value)
    editorStore.setPage(newPage)
    visible.value = false
}

function onExport() {
    const json = JSON.stringify(page.value, null, 2)
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'screen-design.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    URL.revokeObjectURL(url)
}

function onImport() {
    importRef.value?.click()
}

async function onFileChange(e: Event) {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return
    try {
        editorStore.setPage(JSON.parse(await file.text()))
        ElMessage.success('导入成功')
    } catch (error) {
        ElMessage.error(error instanceof Error ? error.message : String(error))
    } finally {
        // 重置 input value，允许重复导入同一文件
        target.value = ''
    }
}

</script>

<style scoped lang="scss">
.toolRight {
    border-left: 1px solid var(--border-color);
    padding-left: 12px;
}

.toolRight>.toolItem {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    cursor: pointer;
}
</style>
