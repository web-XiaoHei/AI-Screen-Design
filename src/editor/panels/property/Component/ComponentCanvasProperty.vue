<template>
    <div>
        <el-form class="p-20" size="small" label-position="left" label-width="60px">
            <el-form-item label="宽度">
                <el-input-number v-model="canvas.width" :min="0" :max="10000" />
            </el-form-item>
            <el-form-item label="高度">
                <el-input-number v-model="canvas.height" :min="0" :max="10000" />
            </el-form-item>
            <el-form-item label="背景色">
                <el-color-picker v-model="canvas.backgroundColor" />
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup lang="ts">
defineOptions({
    name: 'ComponentCanvasProperty'
})

const editorStore = useEditorStore()
const { canvas } = storeToRefs(editorStore)

</script>

<style scoped></style>