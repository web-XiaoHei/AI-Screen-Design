<template>
    <div class="h-full">
        <div class="h-full layer-panel overflow-auto">
            <div :class="{ 'active': selectedNodeIds.includes(node.id as string) }" v-for="(node, index) in nodes"
                :key="node.id" @click="editorStore.selectNode(node.id as string)">
                <span>{{ node.name }}</span>
                <span>{{ index }}</span>

                <!-- <Icon class="mr-2 font-size-4" :icon="node.icon" /> -->
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// import { Icon } from '@iconify/vue';\

import { useDraggable } from 'vue-draggable-plus'

defineOptions({
    name: 'LayerPanel'
})

const editorStore = useEditorStore()
const { nodes, selectedNodeIds } = storeToRefs(editorStore)


useDraggable('.layer-panel', nodes, { animation: 150 })
</script>

<style scoped lang="scss">
.layer-panel {
    padding: 10px;
    background-color: bg-mix(50);

    &>div {
        margin-top: 4px;
        height: 30px;
        line-height: 30px;
        font-size: 12px;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        background-color: bg-mix(70);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 10px;
        cursor: pointer;

        &.active {
            background-color: #0e8da7;
        }

    }


}
</style>