import { useUndoRedo } from '@/hook/useUndoRedo'

export const useEditorStore = defineStore('editor', () => {
  // 撤销/重做能力仅在编辑器 store 中复用，不直接暴露到全局状态。
  // 这里使用 page.nodes 的对象级更新方式，确保记录到历史栈中的仍然是结构化数据。
  const { applyChange } = useUndoRedo()

  /**
   * 面板显示状态。
   * 这些字段控制左侧素材区、图层区和属性区的显示/隐藏。
   */
  const panelVisible = reactive({
    material: true,
    layer: true,
    property: true,
  })

  /**
   * 页面数据对象。
   * canvas：画布尺寸与背景等全局配置。
   * nodes：当前页面中的所有元素节点集合。
   */
  const page = reactive<PageSchema>({
    canvas: {
      width: 1920,
      height: 1080,
      backgroundColor: '#0d121b',
    },
    nodes: [],
    dataSources: [
      {
        type: 'static',
        id: '123',
        name: '静态数据源1',
        data: [
          { label: '一月', value: '100' },
          { label: '二月', value: '200' },
          { label: '三月', value: '300' },
        ],
      },
      {
        type: 'static',
        id: '456',
        name: '静态数据源2',
        data: [
          { label: '一月', value: '500' },
          { label: '二月', value: '300' },
          { label: '三月', value: '800' },
        ],
      },
    ],
  })

  /**
   * 对 page.canvas 的引用，便于在组件中按同类响应式对象方式读写画布配置。
   */
  const canvas = toRef(page, 'canvas') as Ref<CanvasSchema>

  /**
   * 对 page.nodes 的引用。
   * 这里保留为 Ref 形态，方便在模板和组件中使用 .value 访问数组。
   */
  const nodes = toRef(page, 'nodes') as Ref<MaterialSchema[]>

  const dataSource = toRef(page, 'dataSources') as Ref<DataSourceSchema[]>

  function setPage(newPage: PageSchema) {
    Object.assign(page, newPage)
  }

  /**
   * 当前选中节点的 id 列表。
   * 可支持多选：所有被选中的节点都保存在这里，后续可扩展批量操作。
   */
  const selectedNodeIds = ref<string[]>([])

  /**
   * 选中节点的首个 id。
   * 大多数 UI 场景只需要单选节点，使用它作为快捷访问入口。
   */
  const selectedNodeId = computed(() => {
    return selectedNodeIds.value.length > 0 ? selectedNodeIds.value[0] : null
  })

  /**
   * 表示当前选中的 DOM 元素，用于绑定 Moveable 的拖拽与缩放目标。
   * 兼容单元素和多元素选择，以适配 Moveable 的 target 类型要求。
   */
  const selectedTarget = shallowRef<HTMLElement | HTMLElement[] | undefined>(undefined)

  /**
   * 当前选中的单个节点对象。
   * 若没有选中节点，则返回 null。
   */
  const selectedNode = computed(() => {
    return nodes.value.find((node) => node.id === selectedNodeId.value) ?? null
  })

  /**
   * 批量更新节点数组。
   * 这里走 applyChange(page, 'nodes', newNodes)，可以让整个 nodes 数组变更也进入撤销/重做历史。
   */
  function setNodes(newNodes: MaterialSchema[]) {
    applyChange(page, 'nodes', newNodes)
  }

  /**
   * 向当前页面追加一个节点。
   * 通过替换整个节点数组而不是直接 push，保证历史记录行为统一且可回退。
   */
  function addNode(node: MaterialSchema) {
    setNodes([...nodes.value, node])
  }

  /**
   * 单选一个节点。
   */
  function selectNode(id: string) {
    selectedNodeIds.value = [id]
  }

  /**
   * 多选若干节点。
   */
  function selectNodes(ids: string[]) {
    selectedNodeIds.value = ids
  }

  /**
   * 根据节点 id 查找节点实例。
   */
  function findNode(id: string) {
    return nodes.value.find((node) => node.id === id)
  }

  /**
   * 清空当前选择状态。
   */
  function onClearSelected() {
    selectedNodeIds.value = []
  }

  /**
   * 复制当前节点，创建一个偏移后的副本。
   * 复制时会重新分配新 id，并把它向右下方轻微偏移，方便用户快速创建相似元素。
   */
  function copyNode(node: MaterialSchema) {
    const newNode = JSON.parse(JSON.stringify(node)) as MaterialSchema
    newNode.id = crypto.randomUUID()
    newNode.layout.x += 20
    newNode.layout.y += 20

    addNode(newNode)
    selectNode(newNode.id)
  }

  function updateNode(id: string, node: MaterialSchema) {
    const index = nodes.value.findIndex((n) => n.id === id)

    if (index !== -1) {
      const newNodes = nodes.value.toSpliced(index, 1, node)
      setNodes(newNodes)
    }
  }

  /**
   * 删除节点，并清理其对应的选中状态。
   */
  function removeNode(node: MaterialSchema) {
    setNodes(nodes.value.filter((n) => n.id !== node.id))
    selectedNodeIds.value = selectedNodeIds.value.filter((id) => id !== node.id)
  }

  /**
   * 将节点移动到最上层。
   * 本质是把该节点从原位置移除，再追加到数组末尾。
   */
  function moveTop(node: MaterialSchema) {
    const index = nodes.value.findIndex((n) => n.id === node.id)

    if (index !== -1) {
      const newNodes = nodes.value.toSpliced(index, 1)
      setNodes([node, ...newNodes])
    }
  }

  /**
   * 将节点移动到最下层。
   * 本质是把该节点从原位置移除，再插到数组头部。
   */
  function moveBottom(node: MaterialSchema) {
    const index = nodes.value.findIndex((n) => n.id === node.id)

    if (index !== -1) {
      const newNodes = nodes.value.toSpliced(index, 1)
      setNodes([node, ...newNodes])
    }
  }

  /**
   * 切换节点锁定状态。
   * 锁定后通常不允许拖动或编辑位置，保护节点不被误操作。
   */
  function toggleLock(node: MaterialSchema) {
    applyChange(node, 'locked', !node.locked)
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
    dataSource,
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
    updateNode,
    setPage,
  }
})
