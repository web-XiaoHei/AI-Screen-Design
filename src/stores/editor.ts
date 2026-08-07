export const useEditorStore = defineStore('editor', () => {
  const panelVisible = reactive({
    material: true,
    layer: true,
    property: true,
  })

  const page = reactive<PageSchema>({
    canvas: {
      width: 1920,
      height: 1080,
      backgroundColor: '#0d121b',
    },
    nodes: [],
  })

  const canvas = toRef(page, 'canvas') as Ref<CanvasSchema>

  /**当前编辑器中组件的列表 */
  const nodes = toRef(page, 'nodes') as Ref<MaterialSchema[]>

  /** 当前选中的单个数据节点 id */
  const selectedNodeId = computed(() => {
    return selectedNodeIds.value.length > 0 ? selectedNodeIds.value[0] : null
  })
  const selectedNodeIds = ref<string[]>([])

  /** 表示“当前选中的 DOM 元素” 用来给 Moveable 组件绑定拖拽/缩放目标
   *  支持单选或多选（HTMLElement 或 HTMLElement[]）以兼容 Moveable 的 target 类型 */
  const selectedTarget = shallowRef<HTMLElement | HTMLElement[] | undefined>(undefined)

  /** 当前选中的数据节点 */
  const selectedNode = computed(() => {
    return nodes.value.find((node) => node.id == selectedNodeId.value)
  })

  function addNode(node: MaterialSchema) {
    nodes.value.push(node)
  }

  function selectNode(id: string) {
    selectedNodeIds.value = [id]
  }
  function selectNodes(ids: string[]) {
    selectedNodeIds.value = ids
  }

  function findNode(id: string) {
    return nodes.value.find((node) => node.id === id)
  }

  function onClearSelected() {
    selectedNodeIds.value = []
  }

  // 右键菜单功能
  function copyNode(node: MaterialSchema) {
    const newNode = JSON.parse(JSON.stringify(node)) as MaterialSchema
    newNode.id = crypto.randomUUID()
    newNode.layout.x += 20
    newNode.layout.y += 20
    addNode(newNode)
    selectNode(newNode.id)
  }

  function removeNode(node: MaterialSchema) {
    nodes.value = nodes.value.filter((n) => n.id !== node.id)
    selectedNodeIds.value = selectedNodeIds.value.filter((id) => id !== node.id)
  }
  // 置顶
  function moveTop(node: MaterialSchema) {
    const index = nodes.value.findIndex((n) => n.id === node.id)
    if (index !== -1) {
      nodes.value.splice(index, 1)
      nodes.value.push(node)
    }
  }

  function moveBottom(node: MaterialSchema) {
    const index = nodes.value.findIndex((n) => n.id === node.id)
    if (index !== -1) {
      nodes.value.splice(index, 1)
      nodes.value.unshift(node)
    }
  }

  function toggleLock(node: MaterialSchema) {
    node.locked = !node.locked
  }

  return {
    panelVisible,
    page,
    canvas,
    nodes,
    selectedNodeId,
    selectedNodeIds,
    selectedTarget,
    selectedNode,
    addNode,
    selectNode,
    selectNodes,
    findNode,
    onClearSelected,
    copyNode,
    removeNode,
    moveTop,
    moveBottom,
    toggleLock,
  }
})
