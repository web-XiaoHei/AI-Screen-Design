import { useUndoRedo } from '@/hook/useUndoRedo'
import { type OnDrag, type OnDragGroup, type OnResize, type OnResizeGroup } from 'vue3-moveable'

export function useMoveable() {
  const editorStore = useEditorStore()
  const { applyChange, startBatch, commitBatch } = useUndoRedo()
  const { nodes, canvas } = storeToRefs(editorStore)

  function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max)
  }

  function constrainPosition(left: number, top: number, width: number, height: number) {
    const maxLeft = Math.max(0, canvas.value.width - width)
    const maxTop = Math.max(0, canvas.value.height - height)
    return {
      left: clamp(left, 0, maxLeft),
      top: clamp(top, 0, maxTop),
    }
  }

  function getNodeByTarget(element: HTMLElement) {
    const id =
      element.getAttribute('data-node-id') ||
      element.closest('[data-node-id]')?.getAttribute('data-node-id')

    // 从当前元素或最近的祖先元素中读取 data-node-id。
    // element.closest() 会向上查找第一个匹配选择器的元素，?. 可选链用于避免 null 抛错。
    return id ? nodes.value.find((node) => node.id === id) : undefined
  }

  function onDrag(e: OnDrag) {
    const target = e.target as HTMLElement
    const width = target.offsetWidth
    const height = target.offsetHeight
    const position = constrainPosition(e.left, e.top, width, height)

    target.style.left = position.left + 'px'
    target.style.top = position.top + 'px'
    const node = getNodeByTarget(target)

    if (node) {
      applyChange(node, 'layout', {
        ...node.layout,
        x: position.left,
        y: position.top,
      })
    }
  }

  function onResize(e: OnResize) {
    const target = e.target as HTMLElement
    const width = Math.min(e.width, canvas.value.width - e.drag.left)
    const height = Math.min(e.height, canvas.value.height - e.drag.top)
    const position = constrainPosition(e.drag.left, e.drag.top, width, height)

    target.style.width = width + 'px'
    target.style.height = height + 'px'
    target.style.left = position.left + 'px'
    target.style.top = position.top + 'px'

    const node = getNodeByTarget(target)
    if (node) {
      applyChange(node, 'layout', {
        ...node.layout,
        x: position.left,
        y: position.top,
        width,
        height,
      })
    }

    // 缩放后会伴随位置变化，使用 onDrag 更新位置信息
    onDrag({
      ...e.drag,
      target,
      left: position.left,
      top: position.top,
    } as OnDrag)
  }

  function onDragGroup(e: OnDragGroup) {
    // 群组拖动：对每个子事件复用 onDrag 更新位置
    e.events.forEach(onDrag)
  }

  function onResizeGroup(e: OnResizeGroup) {
    // 群组缩放：对每个子事件复用 onResize 更新尺寸和位置
    e.events.forEach(onResize)
  }

  function onStart() {
    // 拖拽或缩放开始时的处理逻辑
    startBatch()
  }

  function onEnd() {
    // 拖拽或缩放结束时的处理逻辑
    commitBatch()
  }

  return {
    onDrag,
    onResize,
    onDragGroup,
    onResizeGroup,
    onStart,
    onEnd,
  }
}
