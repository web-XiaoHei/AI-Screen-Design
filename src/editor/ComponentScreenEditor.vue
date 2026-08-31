<script lang="ts" setup>

defineOptions({
    name: 'ScreenEditor',
});

const editorStore = useEditorStore();
const { dataSource } = storeToRefs(editorStore)

provide('dataSource', dataSource)

const materialWidth = computed(() => (editorStore.panelVisible.material ? 'w-256' : 'w-0'));
const layerWidth = computed(() => (editorStore.panelVisible.layer ? 'w-156' : 'w-0'));
const propertyWidth = computed(() => (editorStore.panelVisible.property ? 'w-380' : 'w-0'));


</script>
<template>
    <div class='editor h-screen w-screen select-none'>
        <header class='header h-56 flex items-center px-20'>
            <div class="header-left w-300 flex items-center justify-start">
                <ComponentToolBarLeft />
            </div>
            <div class="title flex-1 text-center">标题</div>
            <div class="header-right w-300 flex items-center justify-end">
                <ComponentToolBarRight />
            </div>
        </header>
        <main class="editor-main flex ">
            <!-- 物料 -->
            <ComponentMaterialPanel class="material overflow-hidden transition-all" :class="materialWidth" />
            <!-- 图层 -->
            <ComponentLayerPanel class="layer  transition-all" :class="layerWidth" />
            <!-- 画布 -->
            <ComponentCanvas class="canvas flex-1 " />
            <!-- 属性 -->
            <ComponentProperty class="property overflow-hidden transition-all" :class="propertyWidth" />
        </main>
    </div>
</template>
<style scoped lang="scss">
.editor {
    background-color: var(--bg-color);

    .header {
        border-bottom: 1px solid var(--border-color);
        display: flex;
        align-items: center;
    }

    .title {
        font-size: 14px;
        font-weight: 600;
    }

    .header-left,
    .header-right {
        min-height: 100%;
    }

    .editor-main {
        height: calc(100vh - 56px);
    }

    .material,
    .layer {
        border-right: 1px solid var(--border-color);
    }

    .property {
        border-left: 1px solid var(--border-color);
    }
}
</style>