<template>
    <ComponentScreenRender :page="page" />
</template>

<script setup lang="ts">

defineOptions({
    name: 'pre-view'
})
/** 
 * 点击预览，从editorStore中获取
 */
const editorStore = useEditorStore()
const { page } = storeToRefs(editorStore)

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
