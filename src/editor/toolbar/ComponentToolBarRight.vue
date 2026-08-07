<template>
    <div class="toolRight flex gap-20">
        <div class="toolItem">
            <icon-fluent-preview-link-20-filled />
        </div>
        <div class="toolItem">
            <icon-si-json-duotone />
        </div>
        <div class="toolItem">
            <icon-fluent-mdl2-publish-course />
        </div>
        <div class="toolItem">
            <icon-lucide-import />
        </div>
        <div class="toolItem">
            <icon-gg-export />
        </div>
    </div>
</template>

<script setup lang="ts">
defineOptions({
    name: 'toolbar-left'
})
</script>

<style scoped lang="scss">
.toolRight {
    border-left: 1px solid var(--border-color);
    padding-left: 12px;
}

.toolRight>.toolItem {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    cursor: pointer;
}
</style>
