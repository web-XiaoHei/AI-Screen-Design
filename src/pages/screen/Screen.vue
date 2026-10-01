<template>
    <ComponentScreenRender v-if="page" :page="page" />
    <div v-else class="empty-page">暂无页面数据</div>
</template>

<script setup lang="ts">
import type { PageSchema } from '@/schema/page'
import { getPublishedPage } from '@/utils/publish'

defineOptions({
    name: 'Screen-view'
})
/** 
 * 从localStorage中获取，工作中从后台接口获取
 */
const page = getPublishedPage() as PageSchema | null
</script>

<style scoped>
.empty-page {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: #999;
}
</style>