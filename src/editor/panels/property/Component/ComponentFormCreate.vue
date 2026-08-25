<template>
    <div class=" ">
        <el-row>
            <el-col v-for="setter in setters" :key="setter.key" :span="setter.span as number || 24">
                <el-form class="p-20" size="small" label-position="left" label-width="60px">
                    <el-form-item :label="setter.label">
                        <component v-if="formData" :is="componentMap[setter.type]"
                            :class="{ 'property-select': setter.type === 'select' }"
                            :modelValue="getValue(formData, setter.key)" v-bind="setter.props"
                            @update:modelValue="(value: unknown) => formData && applyChange(formData, setter.key, value)"
                            @focus="startBatch" @blur="commitBatch" />
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script setup lang="ts">
import { ElInput, ElInputNumber, ElColorPicker, ElCheckbox, ElOption, ElSelect } from 'element-plus'
import { getValue } from '@/utils'
import { useUndoRedo } from '@/hook/useUndoRedo'


defineOptions({
    name: 'ComponentFormCreate'
})

type SelectOption = {
    label: string
    value: string | number | boolean
}

type SetterWithProps = SetterSchema & {
    span?: number
    props?: {
        options?: SelectOption[]
        [key: string]: unknown
    }
}
defineProps<{
    setters: SetterWithProps[]
    formData: MaterialSchema | null
}>()

const { applyChange, startBatch, commitBatch } = useUndoRedo()

const componentMap: Record<string, Component> = {
    input: ElInput,
    number: (props, { slots }) => h(ElInputNumber, { precision: 0, ...props }, slots),
    color: ElColorPicker,
    checkbox: ElCheckbox,
    select: (props: Record<string, unknown>, { slots }: { slots: Record<string, unknown> }) => {
        const { options = [], ...selectProps } = props as { options?: SelectOption[] }

        return h(ElSelect, { ...selectProps, teleported: true, fitInputWidth: true }, {
            ...slots,
            default: () => options.map((option) => h(ElOption, {
                key: String(option.value),
                label: option.label,
                value: option.value,
            })),
        })
    }
}

</script>

<style scoped>
.property-select {
    width: 100%;
}

:global(.property-select .el-select__wrapper) {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    box-sizing: border-box;
    min-height: 32px;
    height: 32px;
    line-height: 32px;
}

:global(.property-select .el-select__selection) {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    height: 100%;
    overflow: hidden;
    flex-wrap: nowrap;
}

:global(.property-select .el-select__input-wrapper.is-hidden) {
    display: none;
}

:global(.property-select .el-select__selected-item),
:global(.property-select .el-select__placeholder) {
    line-height: 30px;
}

:global(.property-select .el-select__caret) {
    line-height: 32px;
}
</style>