<template>
    <div class="DataSource px-20">
        <el-form>
            <el-form-item label="数据源">
                <el-select v-model="selectedNode!.dataId" placement="bottom" placeholder="请选择数据源">
                    <el-option v-for="item in dataSource" :label="item.name" :value="item.id"
                        :key="item.id"></el-option>
                </el-select>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup lang="ts">
defineOptions({
    name: 'DataSource'
})
const editorStore = useEditorStore()
const { dataSource, selectedNode } = storeToRefs(editorStore)
</script>

<style scoped></style>