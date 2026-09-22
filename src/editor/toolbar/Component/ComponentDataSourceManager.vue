<template>
    <div class="data-source-container">
        <div class="data-source-sidebar">
            <div class="data-source-item" v-for="item in data" :key="item.id"
                @click="selectDataSource(item as unknown as DataSourceSchema)"
                :class="{ active: item.id === activeDataSource?.id }">
                {{ item.name }}
            </div>
        </div>
        <div class="data-source-content">
            <el-form v-if="activeDataSource">
                <el-form-item label="数据源名称">
                    <el-input v-model="activeDataSource.name" />
                </el-form-item>
                <el-form-item label="数据源类型">
                    <el-radio-group disabled v-model="activeDataSource.type" placeholder="请选择数据源类型">
                        <el-radio-button label="静态数据" value="static"></el-radio-button>
                        <el-radio-button label="API 数据" value="api"></el-radio-button>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="数据源" v-if="activeDataSource.type === 'static'">
                    <component-monaco-editor v-model="(activeDataSource.data as unknown as string)" />
                </el-form-item>
                <div v-else>
                    <el-form-item label="请求地址">
                        <el-input v-model="activeDataSource.url" />
                    </el-form-item>
                    <el-form-item label="轮询周期">
                        <el-input v-model="activeDataSource.interval" />
                    </el-form-item>
                    <el-form-item label="参数">
                        <component-monaco-editor v-model="(activeDataSource.params as unknown as string)" />
                    </el-form-item>
                </div>

            </el-form>
        </div>
    </div>
</template>

<script setup lang="ts">
import ComponentMonacoEditor from '@/components/MonacoEditor/ComponentMonacoEditor.vue'
import { deepClone } from '@/utils'

defineOptions({
    name: 'component-data-source-manager'
})

const editorStore = useEditorStore()
const { dataSource } = storeToRefs(editorStore)
const activeDataSource = ref<DataSourceSchema | null>(null)

function selectDataSource(source: DataSourceSchema) {
    activeDataSource.value = source
}
/** 
 * 深拷贝数据源
 * 1.data params 这些需要转字符串
 * 2.弹窗需要点击确认才能应用到全局数据源,而不是实时修改的
 */
const data = ref(deepClone(dataSource.value).map((item) => {
    return {
        ...item,
        data: JSON.stringify(item.data, null, 2),
        params: item.type === 'api' ? JSON.stringify(item.params, null, 2) : {}
    }
}))

</script>

<style scoped lang="scss">
.data-source-container {
    display: flex;
    gap: 20px;
    height: 500px;

    .data-source-sidebar {
        width: 200px;
        flex: none;
        border: 1px solid var(--border-color);
        overflow: auto;

        .data-source-item {
            padding-left: 20px;
            margin-top: 10px;
            height: 40px;
            line-height: 40px;
            cursor: pointer;
            background-color: bg-mix(80);

            &.active {
                background-color: var(--el-color-primary);
            }
        }
    }

    .data-source-content {
        flex: 1;
        border: 1px solid var(--border-color);
        padding: 20px;
        overflow: auto;
    }
}
</style>