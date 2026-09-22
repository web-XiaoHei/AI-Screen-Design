import axios from 'axios'

export function useDataSource(dataId: Ref<string>) {
  const dataSource = inject<Ref<DataSourceSchema[]>>('dataSource')
  const source = computed(() => dataSource?.value.find((item) => item.id === dataId.value))
  const data = ref<DataSourceItem[]>([])
  let timer: ReturnType<typeof setTimeout> | undefined
  let controller: AbortController | undefined
  let requestId = 0
  let disposed = false

  function stopPolling() {
    if (timer) {
      clearTimeout(timer)
      timer = undefined
    }

    controller?.abort()
    controller = undefined
  }

  function schedulePolling(interval: number, id: number) {
    if (disposed || id !== requestId) return

    timer = setTimeout(() => {
      timer = undefined
      void loadData()
    }, interval)
  }

  async function loadData() {
    const current = source.value
    const id = ++requestId

    stopPolling()

    if (!current) return

    if (current.type !== 'api') {
      data.value = current.data
      return
    }

    const { url, interval, params } = current
    if (!url) return

    const currentController = new AbortController()
    controller = currentController

    try {
      const res = await axios.get(url, {
        params,
        signal: currentController.signal,
      })

      if (disposed || id !== requestId || source.value !== current) return

      const list = res.data?.data?.list
      data.value = Array.isArray(list) ? list : []
    } catch (error) {
      if (!axios.isCancel(error) && !disposed && id === requestId) {
        console.error('Load data failed:', error)
      }
    } finally {
      if (controller === currentController) {
        controller = undefined
      }

      if (interval && !disposed && id === requestId && source.value === current) {
        schedulePolling(interval, id)
      }
    }
  }

  watch(
    source,
    () => {
      void loadData()
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    disposed = true
    requestId++
    stopPolling()
  })

  return { data }
}
