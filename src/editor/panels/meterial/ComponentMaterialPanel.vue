<template>
    <div class="material-panel flex">
        <div class="nav w-50">
            <div v-for="item in groups" :key="item.key" :class="{ active: activeGroup === item.key }"
                @click="activeGroup = item.key">
                <Icon :icon="item.icon" font-size="16" />
                <span>{{ item.name }}</span>
            </div>
        </div>

        <div class="material-list flex-1 p-10 overflow-auto">
            <ComponentMaterialItem class="mt-10" v-for="item in currentMaterials" :key="item.name" :material="item" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { getGroups } from '@/api/editor/panels/material/material'
import { getMaterialsByGroup } from '@/materials/index'
defineOptions({
    name: 'MaterialPanel'
})

const activeGroup = ref('charts');

const currentMaterials = computed<MaterialDefinition[]>(() => {
    return getMaterialsByGroup(activeGroup.value);
});

const groups = computed<GroupProps[]>(() => {
    return getGroups();
});




</script>

<style scoped lang="scss">
.material-panel {
    background-color: bg-mix(20);

    .nav {
        border-right: 1px solid var(--border-color);

        div {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 50px;
            font-size: 12px;
            cursor: pointer;

            &.active {
                background-color: bg-mix(70);
            }
        }
    }
}
</style>