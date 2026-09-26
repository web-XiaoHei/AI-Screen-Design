<template>
    <div class="data-source-container">
        <div class="data-source-sidebar">
            <el-button @click="onAdd" type="primary" size="small">新增</el-button>
            <div class="data-source-item" :class="{ active: item.id === activeDataSource?.id }" v-for="item in data"
                :key="item.id" @click="selectDataSource(item)">
                <span>{{ item.name }}</span>

                <span @click.stop="removeDataSource(item.id)">
                    <Icon icon="mdi:remove"></Icon>
                </span>
            </div>
        </div>
        <div class="data-source-content">
            <el-form v-if="activeDataSource">
                <el-form-item label="名称">
                    <el-input v-model="activeDataSource.name"></el-input>
                </el-form-item>
                <el-form-item label="类型">
                    <el-radio-group v-model="activeDataSource.type">
                        <el-radio-button label="静态" value="static"></el-radio-button>
                        <el-radio-button label="API" value="api"></el-radio-button>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="数据" v-if="activeDataSource.type === 'static'">
                    <component-monaco-editor v-model="activeDataSource.data"></component-monaco-editor>
                </el-form-item>
                <div v-else>
                    <el-form-item label="请求地址">
                        <el-input v-model="activeDataSource.url"></el-input>
                    </el-form-item>
                    <el-form-item label="轮询周期">
                        <el-input v-model="activeDataSource.interval"></el-input>
                    </el-form-item>
                    <el-form-item label="参数">
                        <component-monaco-editor v-model="activeDataSource.params"></component-monaco-editor>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="onRequest">请求预览</el-button>
                    </el-form-item>
                    <el-form-item label="预览数据">
                        <component-monaco-editor v-model="responseText"></component-monaco-editor>
                    </el-form-item>
                </div>
            </el-form>
        </div>
    </div>
</template>

<script setup lang="ts">
import type {
    ApiDataSourceSchema,
    DataSourceItem,
    DataSourceSchema,
    StaticDataSourceSchema,
} from '@/schema/page'
import { deepClone } from '@/utils'
import { fetchData } from '@/hook/useDataSource'

defineOptions({
    name: 'component-data-source-manager',
})

type EditableStaticDataSource = Omit<StaticDataSourceSchema, 'data'> & {
    data: string
}

type EditableApiDataSource = Omit<ApiDataSourceSchema, 'data' | 'params' | 'interval'> & {
    data: string
    params: string
    interval: string
}

type EditableDataSource = EditableStaticDataSource | EditableApiDataSource

const editorStore = useEditorStore()
const { dataSource } = storeToRefs(editorStore)
const activeDataSource = ref<EditableDataSource | null>(null)
const responseText = ref()


function selectDataSource(source: EditableDataSource | null) {
    activeDataSource.value = source
}

function parseJson<T>(value: string | undefined, fallback: T): T {
    if (!value) return fallback

    try {
        return JSON.parse(value) as T
    } catch {
        return fallback
    }
}

function toEditableDataSource(item: DataSourceSchema): EditableDataSource {
    if (item.type === 'static') {
        return {
            type: 'static',
            id: item.id,
            name: item.name,
            data: JSON.stringify(item.data ?? [], null, 2),
        }
    }

    return {
        type: 'api',
        id: item.id,
        name: item.name,
        url: item.url,
        data: JSON.stringify(item.data ?? [], null, 2),
        params: JSON.stringify(item.params ?? {}, null, 2),
        interval: String(item.interval ?? ''),
    }
}

function toDataSource(item: EditableDataSource): DataSourceSchema {
    if (item.type === 'static') {
        return {
            type: 'static',
            id: item.id,
            name: item.name,
            data: parseJson<DataSourceItem[]>(item.data, []),
        }
    }

    return {
        type: 'api',
        id: item.id,
        name: item.name,
        url: item.url,
        data: parseJson<DataSourceItem[]>(item.data, []),
        params: parseJson<Record<string, unknown>>(item.params, {}),
        interval: Number(item.interval) || undefined,
    }
}
/**
 * 深拷贝数据源
 * 1.data params 这些需要转字符串
 * 2.弹窗需要点击确认才能应用到全局数据源,而不是实时修改的
 */
const data = ref<EditableDataSource[]>(deepClone(dataSource.value).map((item) => toEditableDataSource(item)))

defineExpose({
    save() {
        const _data = deepClone(data.value).map((item) => toDataSource(item))
        // 更新页面数据源
        editorStore.page.dataSources = _data
    },
})


function onAdd() {
    // 新增数据源
    const newItem: EditableStaticDataSource = {
        id: crypto.randomUUID(),
        name: '未命名',
        type: 'static',
        data: '[]',
    }

    data.value.push(newItem)
    selectDataSource(newItem)
}

function removeDataSource(id: string) {
    data.value = data.value.filter((item) => item.id !== id)
    selectDataSource(null)
}

function onRequest() {
    const source = activeDataSource.value
    if (!source || source.type !== 'api') return

    const payload: ApiDataSourceSchema = {
        ...source,
        data: parseJson<DataSourceItem[]>(source.data, []),
        params: parseJson<Record<string, unknown>>(source.params, {}),
        interval: Number(source.interval) || undefined,
        method: source.method ?? 'get',
        responsePath: source.responsePath ?? 'data.list',
    }

    void fetchData(payload).then((res) => {
        responseText.value = JSON.stringify(res, null, 2)
    })
}
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