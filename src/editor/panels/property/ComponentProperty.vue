<template>
    <div class=" ">
        <ComponentNodeProperty v-if="selectedNode" />
        <ComponentCanvasProperty v-else />
    </div>
</template>

<script setup lang="ts">

defineOptions({
    name: 'ComponentProperty'
})

const editorStore = useEditorStore()
const { selectedNode } = storeToRefs(editorStore)
</script>

<style scoped></style>