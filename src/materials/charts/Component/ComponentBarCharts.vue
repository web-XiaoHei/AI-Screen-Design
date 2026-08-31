<template>
    <div class="chart-material w-full h-full" ref="chart">
    </div>
</template>

<script setup lang="ts">
import { useDataSource } from '@/hook/useDataSource'
import { init } from 'echarts'
import type { EChartsOption, DatasetComponentOption } from 'echarts/types/dist/echarts'

defineOptions({
    name: 'ComponentBarCharts'
})

type BarChartSchema = Omit<MaterialSchema, 'props'> & {
    props: {
        option: EChartsOption
    }
}

const props = defineProps<{ schema: BarChartSchema }>()

const chartRef = useTemplateRef('chart')
let charts: ReturnType<typeof init> | null = null
let resizeObserver: ResizeObserver | null = null

const dataId = computed(() => props.schema.dataId)
const { data } = useDataSource(dataId as Ref<string>)

const option = computed<EChartsOption>(() => {
    const _option = props.schema.props.option
    // dataset 是可选的联合类型（单个或数组），取第一个进行合并
    const dataset = Array.isArray(_option.dataset) ? _option.dataset[0] : _option.dataset
    return {
        ..._option,
        dataset: {
            ...dataset,
            // 绑定的数据源优先，否则回落到配置里的 dataset.source
            source: (data.value || dataset?.source) as DatasetComponentOption['source'],
        },
    }
})

watch(option, (opt) => {
    charts?.setOption(opt)
}, {
    deep: true
})

onMounted(() => {
    if (!chartRef.value) return
    charts = init(chartRef.value)
    charts.setOption(option.value)

    resizeObserver = new ResizeObserver(() => {
        charts?.resize()
    })

    resizeObserver.observe(chartRef.value)
})

onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    charts?.dispose()
    resizeObserver = null
    charts = null
})

</script>

<style scoped></style>