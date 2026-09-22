import axios from 'axios'

export function useDataSource(dataId: Ref<string>) {
  const dataSource = inject<Ref<DataSourceSchema[]>>('dataSource')
  const source = computed(() => dataSource?.value.find((item) => item.id === dataId.value))
  const data = ref<DataSourceItem[]>([])
  let intervalId: ReturnType<typeof setInterval> | undefined

  function stopPolling() {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = undefined
    }
  }

  async function loadData() {
    const current = source.value
    if (!current) return

    if (current.type !== 'api') {
      stopPolling()
      data.value = (current.data as DataSourceItem[]) ?? []
      return
    }

    const { url, interval, params } = current
    if (!url) return

    try {
      const res = await axios.get(url, { params })
      data.value = res?.data?.data?.list ?? []
    } catch (error) {
      console.error('Load data failed:', error)
    }

    stopPolling()
    if (interval) {
      intervalId = setInterval(() => {
        console.log('Refreshing API data...')
        loadData()
      }, interval)
    }
  }

  watch(
    source,
    () => {
      stopPolling()
      loadData()
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    stopPolling()
  })

  return { data }
}
