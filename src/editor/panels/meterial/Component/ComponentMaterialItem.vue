<template>
    <div class="material-item" draggable="true" @dragstart="onStart">
        <div class="title">{{ material.name }}</div>
        <div class="material-icon">
            <Icon :icon="material.icon" font-size="80" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type { MaterialDefinition } from '@/api/editor/panels/material/material'

defineOptions({
    name: 'MaterialItem'
})

const { material } = defineProps<{ material: MaterialDefinition }>()


function onStart(e: DragEvent) {
    e.dataTransfer?.setData('scheme', JSON.stringify(material.schema))
}
</script>

<style scoped lang="scss">
.material-item {
    background: bg-mix(40);
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 10px 20px;
    cursor: pointer;
    height: 120px;

    .title {
        font-size: 12px;
        height: 20px;
        font-weight: 700;
        text-align: left;
    }

    .material-icon {
        flex: 1;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        font-size: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    transition: all 0.3s ease-in-out;

    &:hover {
        transform: translateY(-2px);
        border-color: #5e8382;
    }
}
</style>