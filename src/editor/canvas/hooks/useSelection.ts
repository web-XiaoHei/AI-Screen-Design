import { nextTick, watch } from 'vue'
import type { OnSelectEnd } from 'selecto'
import type SelectoType from 'selecto'

// Moveable 组件对外暴露的最小能力接口：
// - dragStart：手动触发拖拽开始，用于单击选中后立即进入交互状态。
// - updateRect：重新计算当前目标的矩形边界，确保拖拽/缩放框与真实 DOM 对齐。
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

  /**
   * 重新从真实 DOM 中找到当前选中节点对应的元素。
   *
   * 这里必须在每次选中状态变化或节点位置/尺寸变化后执行，
   * 目的是避免 Moveable 持有旧的 DOM 引用。
   * 在撤销/重做后，节点数据会回退，但元素节点引用如果没更新，
   * Moveable 仍会使用旧矩形缓存，最终出现边框变成“从左上角到节点”的方形异常。
   */
  function refreshSelectedTargets() {
    const ids = selectedNodeIds.value
    if (!ids.length) {
      selectedTarget.value = undefined
      return
    }

    const targets = ids
      .map(
        (id) =>
          stageRef.value?.querySelector(`[data-node-id='${id}']:not([data-node-locked='true'])`) as
            | HTMLElement
            | undefined,
      )
      .filter((el): el is HTMLElement => !!el)

    selectedTarget.value = targets.length > 0 ? targets : undefined
  }

  /**
   * 把节点的布局数据同步回真实 DOM 样式。
   *
   * Moveable 读取的是元素的实际左上角、宽高，而不是仅仅节点对象里的状态。
   * 所以当撤销/重做、拖拽、缩放、框选后节点状态被改写时，
   * 需要把 DOM 位置和尺寸也同步到一致，否则会出现边框和元素不一致的视觉偏移。
   */
  function syncNodeLayoutDom() {
    const targets = selectedTarget.value
    if (!targets) return

    const list = Array.isArray(targets) ? targets : [targets]

    list.forEach((element) => {
      const nodeId = element.getAttribute('data-node-id')
      if (!nodeId) return

      const node = nodes.value.find((item) => item.id === nodeId)
      if (!node) return

      const { x, y, width, height } = node.layout
      element.style.left = `${x}px`
      element.style.top = `${y}px`
      element.style.width = `${width}px`
      element.style.height = `${height}px`
    })
  }

  /**
   * 点击节点时触发的选择逻辑。
   *
   * 1. 先将对应的 DOM 节点设置为 Moveable 的目标；
   * 2. 再更新选中状态；
   * 3. 等待下一帧后同步布局并调用 updateRect，避免首次拖拽出现偏移。
   */
  async function onSelect(node: MaterialSchema, e: MouseEvent) {
    const target = (e.currentTarget as HTMLElement).closest('.canvas-node') as HTMLElement | null
    selectedTarget.value = target ? [target] : [e.currentTarget as HTMLElement]
    editorStore.selectNode(node.id!)

    await nextTick()
    syncNodeLayoutDom()
    moveableRef.value?.updateRect?.()
    moveableRef.value?.dragStart?.(e)
  }

  /**
   * 框选结束事件：
   * 从 Selecto 返回的 DOM 集合中解析出节点 id，更新 selectedNodeIds。
   */
  function onSelectEnd(e: OnSelectEnd<SelectoType>) {
    const ids = e.selected
      .map((element) => element.getAttribute('data-node-id'))
      .filter((id): id is string => id !== null)
    editorStore.selectNodes(ids)
  }

  /**
   * 清空当前选中状态。
   */
  function onClearSelected() {
    editorStore.onClearSelected()
  }

  /**
   * 监听 selectedNodeIds 的变化。
   *
   * 当用户通过点击、框选或代码方式切换当前选择时，
   * 需要重新找到对应的 DOM 目标，并让 Moveable 立即刷新边框尺寸。
   */
  watch(
    selectedNodeIds,
    async (ids) => {
      await nextTick()

      refreshSelectedTargets()
      syncNodeLayoutDom()
      moveableRef.value?.updateRect && moveableRef.value.updateRect()
    },
    { deep: true },
  )

  /**
   * 监听节点布局数组的变化。
   *
   * 这是关键的同步点：
   * - 拖拽/缩放会改变 node.layout.x/y/width/height
   * - 撤销/重做也会恢复上一次的布局值
   * - 一旦这些数据变化，需立刻同步到 DOM 并刷新 Moveable 的矩形
   * 否则边框和节点会脱节，导致异常方形框或偏移。
   */
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
        refreshSelectedTargets()
        syncNodeLayoutDom()
        moveableRef.value?.updateRect && moveableRef.value.updateRect()
      })
    },
    { deep: true },
  )

  return { selectedTarget, onSelect, onSelectEnd, onClearSelected }
}
