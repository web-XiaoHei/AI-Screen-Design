<script setup lang="ts">
import { editor } from 'monaco-editor'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

defineOptions({
    name: 'MonacoEditor',
})

window.MonacoEnvironment = {
    getWorker(_, label) {
        if (label === 'json') return new JsonWorker()
        if (label === 'javascript' || label == 'typescript') return new TsWorker()
        return new EditorWorker()
    },
}

const props = defineProps<{ lang?: string }>()

const modelValue = defineModel<string>()

const editorElement = ref()

let instance: editor.IStandaloneCodeEditor
onMounted(() => {
    instance = editor.create(editorElement.value, {
        value: modelValue.value,
        theme: 'vs-dark',
        language: props.lang || 'json',
        fontSize: 14,
        tabSize: 2,
        // 自适应父节点的宽高
        automaticLayout: true,
    })
    instance.onDidChangeModelContent(() => {
        modelValue.value = instance.getValue()
    })

    onBeforeUnmount(() => {
        instance.dispose()
    })
})

watch(modelValue, (newVal) => {
    if (newVal === instance.getValue()) return
    instance.setValue(newVal!)
})
</script>

<template>
    <div class="editor-container" ref="editorElement"></div>
</template>

<style scoped lang="scss">
.editor-container {
    height: 100%;
    min-height: 400px;
    width: 100%;

    // 覆盖父级（App.vue .container）继承下来的 text-align: center
    // Monaco 内部的行号、whitespace、placeholder 等非 canvas 渲染的文本节点
    // 会继承 text-align，导致其水平位置与 canvas 计算的字符位置错开
    :deep(.monaco-editor),
    :deep(.monaco-editor *) {
        text-align: left;
    }
}
</style>
