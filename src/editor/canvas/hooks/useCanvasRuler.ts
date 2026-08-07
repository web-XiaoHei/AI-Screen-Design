import { debounce } from '@/utils'

type MoveableLike = {
  updateRect?: () => void
}

export function useCanvasRuler({
  moveableRef,
  canvasRootRef,
}: {
  moveableRef: Ref<MoveableLike | null | undefined>
  canvasRootRef: Ref<HTMLElement | null | undefined>
}) {
  const editorStore = useEditorStore()
  const { canvas } = storeToRefs(editorStore)
  const palette = {
    bgColor: '#1f2937',
    longfgColor: '#6b7280',
    fontColor: '#9ca3af',
    fontShadowColor: '#0e8da7',
    shadowColor: 'rgba(14, 141, 167, 0.14)',
    lineColor: '#22c55e',
    lineType: 'solid',
    lockLineColor: '#4b5563',
    borderColor: '#374151',
    hoverBg: '#111827',
    hoverColor: '#ffffff',
  }

  const scale = ref(1)
  const lines = ref({
    h: [] as number[],
    v: [] as number[],
  })

  const rectSize = reactive({
    width: 1000,
    height: 800,
  })

  const canvasWidth = toRef(canvas.value, 'width')
  const canvasHeight = toRef(canvas.value, 'height')

  const canvasStyle = computed(() => {
    return {
      width: canvasWidth.value + 'px',
      height: canvasHeight.value + 'px',
      backgroundColor: canvas.value.backgroundColor,
    }
  })

  const onRootResize = debounce<[DOMRectReadOnly]>((rect) => {
    rectSize.width = rect.width
    rectSize.height = rect.height
  }, 300)

  let _resizeObserver: ResizeObserver | null = null

  function onZoomChange() {
    moveableRef.value?.updateRect?.()
  }

  onMounted(() => {
    const { width, height } = canvasRootRef.value?.getBoundingClientRect() ?? {
      width: 0,
      height: 0,
    }
    rectSize.width = width
    rectSize.height = height

    _resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      onRootResize(entry.contentRect)
    })
    if (canvasRootRef.value) _resizeObserver.observe(canvasRootRef.value)
  })

  onBeforeUnmount(() => {
    _resizeObserver?.disconnect()
    _resizeObserver = null
    // 取消未执行的防抖；若希望立刻应用最后一次变化可调用 flush()
    onRootResize.cancel()
  })

  return {
    canvasWidth,
    canvasHeight,
    canvasStyle,
    rectSize,
    lines,
    scale,
    palette,
    onZoomChange,
  }
}
