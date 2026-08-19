<template>
    <div class="chart-material w-full h-full" ref="chart">
    </div>
</template>

<script setup lang="ts">
import { init } from 'echarts'
import type { EChartsOption } from 'echarts/types/dist/echarts'

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

watch(() => props.schema.props.option, (option) => {
    charts?.setOption(option)
}, {
    deep: true
})

onMounted(() => {
    if (!chartRef.value) return
    charts = init(chartRef.value)
    charts.setOption(props.schema.props.option)

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