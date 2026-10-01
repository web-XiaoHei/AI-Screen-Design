<template>
    <div class="preview-container">
        <div class="canvas-root" :style="canvasStyle">
            <div class="canvas-node" v-for="(node, index) in nodes" :key="node.id" :style="getNodeStyle(node, index)">
                <component :is="getMaterialsComponent(node.type)" :schema="node"></component>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { getMaterialsComponent } from '@/materials'

defineOptions({
    name: 'screen-render'
})

const props = defineProps<{
    page: PageSchema
}>()

const canvas = computed(() => props.page.canvas)
const nodes = computed(() => props.page.nodes)
const dataSource = computed(() => props.page.dataSources)


const scale = ref(1)
const position = reactive({
    left: 0,
    top: 0
})

provide('dataSource', dataSource)

const canvasStyle = computed(() => {
    return {
        width: canvas.value.width + 'px',
        height: canvas.value.height + 'px',
        backgroundColor: canvas.value.backgroundColor,
        transform: `scale(${scale.value}) translate(${position.left}px, ${position.top}px)`,
        transformOrigin: 'top left'
    }
})

function getNodeStyle(node: MaterialSchema, index: number) {
    return {
        width: node.layout.width + 'px',
        height: node.layout.height + 'px',
        left: node.layout.x + 'px',
        top: node.layout.y + 'px',
        zIndex: index + 1
    }
}

function init() {
    const scaleY = window.innerHeight / canvas.value.height
    const scaleX = window.innerWidth / canvas.value.width
    scale.value = Math.min(scaleX, scaleY)
    position.left = (window.innerWidth - canvas.value.width * scale.value) / 2
    position.top = (window.innerHeight - canvas.value.height * scale.value) / 2
}

onMounted(() => {
    init()
    addEventListener('resize', init)
})

onBeforeUnmount(() => {
    removeEventListener('resize', init)
})
</script>

<style scoped lang="scss">
.preview-container {
    width: 100vw;
    height: 100vh;

    .canvas-root {
        position: relative;
        margin: 0 auto;

        .canvas-node {
            position: absolute;
        }
    }
}
</style>
