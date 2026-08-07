<template>
    <div :style="schema.style">
        {{ schema.props.content }}
    </div>
</template>

<script setup lang="ts">
defineOptions({
    name: 'TextMaterial'
})

defineProps(['schema'])


</script>

<style scoped></style>