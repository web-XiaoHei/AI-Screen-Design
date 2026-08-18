<template>
    <div class=" ">
        <el-row>
            <el-col v-for="setter in setters" :key="setter.key" :span="setter.span as number || 24">
                <el-form class="p-20" size="small" label-position="left" label-width="60px">
                    <el-form-item :label="setter.label">
                        <component :is="componentMap[setter.type]" :modelValue="getValue(formData, setter.key)"
                            @update:modelValue="(value: unknown) => applyChange(formData, setter.key, value)"
                            @focus="startBatch" @blur="commitBatch" />
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script setup lang="ts">
import { ElInput, ElInputNumber, ElColorPicker } from 'element-plus'
import { getValue } from '@/utils'
import { useUndoRedo } from '@/hook/useUndoRedo'


defineOptions({
    name: 'ComponentFormCreate'
})

defineProps(['setters', 'formData'])

const { applyChange, startBatch, commitBatch } = useUndoRedo()

const componentMap: Record<string, Component> = {
    input: ElInput,
    number: (props, { slots }) => h(ElInputNumber, { precision: 0, ...props }, slots),
    color: ElColorPicker,
}

</script>

<style scoped></style>