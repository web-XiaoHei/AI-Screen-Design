import { nextTick, watch } from 'vue'
import type { OnSelectEnd } from 'selecto'
import type SelectoType from 'selecto'

type MoveableLike = {
  dragStart?: (e: MouseEvent) => void
  updateRect?: () => void
}

export function useSelection({
  moveableRef,
  stageRef,
}: {
  moveableRef: Ref<MoveableLike | null | undefined>
  stageRef: Ref<HTMLElement | null | undefined>
}) {
  const editorStore = useEditorStore()
  const { nodes, selectedTarget, selectedNodeIds } = storeToRefs(editorStore)

  async function onSelect(node: MaterialSchema, e: MouseEvent) {
    // 单击节点时：将外层绝对定位节点作为 Moveable 目标并通知 store
    const target = (e.currentTarget as HTMLElement).closest('.canvas-node') as HTMLElement | null
    selectedTarget.value = target ? [target] : [e.currentTarget as HTMLElement]
    editorStore.selectNode(node.id!)

    // 先等待 DOM 和 Moveable 更新完毕，再触发拖拽开始，避免首拖偏移
    await nextTick()
    moveableRef.value?.updateRect?.()
    moveableRef.value?.dragStart?.(e)
  }

  function onSelectEnd(e: OnSelectEnd<SelectoType>) {
    const ids = e.selected
      .map((element) => element.getAttribute('data-node-id'))
      .filter((id): id is string => id !== null)
    editorStore.selectNodes(ids)
  }

  function onClearSelected() {
    editorStore.onClearSelected()
  }

  watch(
    selectedNodeIds,
    async (ids) => {
      // 等待 DOM 更新后再读取节点元素，避免新节点首次选中时 Moveable 目标丢失
      await nextTick()

      const els = ids
        .map(
          (id) =>
            stageRef.value?.querySelector(
              `[data-node-id='${id}']:not([data-node-locked='true'])`,
            ) as HTMLElement | undefined,
        )
        .filter((el): el is HTMLElement => !!el)
      selectedTarget.value = els.length > 0 ? els : undefined

      moveableRef.value?.updateRect && moveableRef.value.updateRect()
    },
    { deep: true },
  )

  watch(
    () =>
      nodes.value.map((node) => ({
        id: node.id,
        x: node.layout.x,
        y: node.layout.y,
        width: node.layout.width,
        height: node.layout.height,
      })),
    () => {
      if (!selectedNodeIds.value.length) return

      nextTick(() => {
        moveableRef.value?.updateRect && moveableRef.value.updateRect()
      })
    },
    { deep: true },
  )

  return { selectedTarget, onSelect, onSelectEnd, onClearSelected }
}
