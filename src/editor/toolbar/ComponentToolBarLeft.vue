<template>
    <div class="toolLeft flex gap-20">
        <div class="toolItem" :class="{ active: panelVisible.material }"
            @click="panelVisible.material = !panelVisible.material">
            <icon-fluent-panel-left-20-filled />
        </div>
        <div class="toolItem" :class="{ active: panelVisible.layer }" @click="panelVisible.layer = !panelVisible.layer">
            <icon-fluent-layer-20-filled />
        </div>
        <div class="toolItem" :class="{ active: panelVisible.property }"
            @click="panelVisible.property = !panelVisible.property">
            <icon-fluent-panel-right-20-filled />
        </div>
        <div class="toolItem" @click="undo">
            <icon-material-symbols-undo />
        </div>
        <div class="toolItem" @click="redo">
            <icon-material-symbols-redo />
        </div>
    </div>
</template>

<script setup lang="ts">
import { useUndoRedo } from '@/hook/useUndoRedo';

defineOptions({
    name: 'toolbar-left'
})
const { panelVisible } = useEditorStore()

const { undo, redo } = useUndoRedo()

</script>

<style scoped lang="scss">
.toolLeft {
    border-right: 1px solid var(--border-color);
    padding-right: 12px;

    & .active {
        background-color: #5e8382;
    }
}

.toolLeft>.toolItem {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    cursor: pointer;
}
</style>
