<template>
    <!-- 画布根节点：包含可放置组件的舞台、框选工具、和可移动/缩放控件 -->
    <div class="canvas-root" ref="canvasRoot">


        <SketchRuler v-model:scale="scale" :thick="20" :palette="palette" :width="rectSize.width"
            :height="rectSize.height" :canvas-height="canvasHeight" :canvas-width="canvasWidth" :lines="lines"
            @zoomchange="onZoomChange">


            <!-- 舞台：接收拖放事件并展示所有节点 -->
            <div ref="stage" class="canvas-stage" @dragover.prevent @drop="onDrop"
                @mousedown.self="editorStore.onClearSelected" :style="canvasStyle">


                <el-dropdown trigger="contextmenu" @command="onContextMenuCommand" v-for="(node, index) in nodes"
                    :key="node.id" class="canvas-node" :style="getNodeStyle(node, index)" :data-node-id="node.id"
                    :data-node-locked="node.locked" @mousedown.stop.prevent="onSelect(node, $event)">

                    <!-- 节点列表：每个节点根据布局样式绝对定位 -->
                    <div class="canvas-node-inner">
                        <!-- 根据节点类型渲染对应的物料组件 -->
                        <component :is="getMaterialsComponent(node.type)" :schema="node"></component>
                    </div>

                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="copy">复制</el-dropdown-item>
                            <el-dropdown-item command="remove">删除</el-dropdown-item>
                            <el-dropdown-item command="moveTop">置顶</el-dropdown-item>
                            <el-dropdown-item command="moveBottom">置底</el-dropdown-item>
                            <el-dropdown-item command="toggleLock">{{ node.locked ? '解锁' : '锁定' }}</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
        </SketchRuler>

        <!-- 框选工具：支持按住 Shift 连续选择 -->
        <Selecto v-if="stageRef" :container="stageRef" :drag-container="stageRef" :selectable-targets="['.canvas-node']"
            :selectFromInside="false" toggleContinueSelect="shift" @select-end="onSelectEnd">
        </Selecto>
        <!-- Moveable：提供拖拽/缩放能力 -->
        <Moveable ref="moveable" :target="selectedTarget" :origin="false" :draggable="true" :resizable="true"
            @drag="onDrag" @drag-group="onDragGroup" @dragStart="onStart" @drag-end="onEnd" @drag-group-start="onStart"
            @drag-group-end="onEnd" @resize="onResize" @resize-group="onResizeGroup" @resize-start="onStart"
            @resize-end="onEnd" @resize-group-start="onStart" @resize-group-end="onEnd">
            >
        </Moveable>
    </div>
</template>

<script setup lang="ts">
import { createNode, getMaterialsComponent } from '@/materials'
import Moveable from 'vue3-moveable'

import Selecto from 'vue3-selecto'

import SketchRuler from 'vue3-sketch-ruler'
import 'vue3-sketch-ruler/lib/style.css'
import { useCanvasRuler } from './hooks/useCanvasRuler'
import { useMoveable } from './hooks/useMoveable'
import { useSelection } from './hooks/useSelection'

defineOptions({
    name: 'canvas-root'
})

const editorStore = useEditorStore()
const { nodes } = storeToRefs(editorStore)

const moveableRef = useTemplateRef('moveable')
const stageRef = useTemplateRef('stage')
const canvasRootRef = useTemplateRef('canvasRoot')

// 使用自定义 hook 管理画布标尺和缩放
const {
    canvasWidth,
    canvasHeight,
    canvasStyle,
    rectSize,
    lines,
    scale,
    palette,
    onZoomChange,
} = useCanvasRuler({
    moveableRef: moveableRef as unknown as Ref<{ updateRect?: () => void } | null | undefined>,
    canvasRootRef: canvasRootRef as unknown as Ref<HTMLElement | null | undefined>,
})

// 使用自定义 hook 管理 Moveable 的拖拽和缩放事件
const { onDrag, onResize, onDragGroup, onResizeGroup, onStart, onEnd } = useMoveable()

// 使用自定义 hook 管理节点的选择和框选
const { selectedTarget, onSelect, onSelectEnd } = useSelection({
    moveableRef: moveableRef as unknown as Ref<{ dragStart?: () => void } | null | undefined>,
    stageRef: stageRef as unknown as Ref<HTMLElement | null | undefined>
})


// 处理外部拖放到舞台的事件：
// - 从 dataTransfer 中读取物料描述 (scheme)
// - 计算放置时的坐标，使节点中心对齐鼠标位置
// - 生成 id 并将节点加入编辑器状态，同时选中该节点
function onDrop(e: DragEvent) {
    const data = e.dataTransfer?.getData('scheme')
    if (!data) return
    const node = createNode(JSON.parse(data))

    node.layout.x = e.offsetX - node.layout.width / 2
    node.layout.y = e.offsetY - node.layout.height / 2


    editorStore.addNode(node)
    editorStore.selectNode(node.id as string)
}



function getNodeStyle(node: MaterialSchema, index: number) {
    return {
        width: node.layout.width + 'px',
        height: node.layout.height + 'px',
        left: node.layout.x + 'px',
        top: node.layout.y + 'px',
        zIndex: index + 1
    }
}

function onContextMenuCommand(command: string) {
    switch (command) {
        case 'copy':
            editorStore.copyNode(editorStore.selectedNode!)
            break
        case 'remove':
            editorStore.removeNode(editorStore.selectedNode!)
            break
        case 'moveTop':
            editorStore.moveTop(editorStore.selectedNode!)
            break
        case 'moveBottom':
            editorStore.moveBottom(editorStore.selectedNode!)
            break
        case 'toggleLock':
            editorStore.toggleLock(editorStore.selectedNode!)
            selectedTarget.value = undefined
            break
    }
}
</script>

<style scoped lang="scss">
.canvas-root {
    position: relative;
    overflow: hidden;
    // 创建新的层级上下文
    isolation: isolate;

    .canvas-stage {
        position: relative;

        .canvas-node {
            position: absolute;
            display: block;
        }

        .canvas-node-inner {
            width: 100%;
            height: 100%;
        }
    }
}
</style>