import axios from 'axios'
import type { ApiDataSourceSchema, DataSourceItem, DataSourceSchema } from '@/schema/page'
import { getValue } from '@/utils'

function isApiSource(source: DataSourceSchema | undefined): source is ApiDataSourceSchema {
  return source?.type === 'api'
}

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

    // 静态数据源直接使用本地配置，不需要发起网络请求。
    if (!isApiSource(current)) {
      data.value = current.data
      return
    }

    const { url, interval, params } = current
    if (!url) return

    const currentController = new AbortController()
    controller = currentController

    try {
      // 仅对 API 数据源执行轮询请求，并在请求中止时忽略结果。
      const res = await axios.get(url, {
        params,
        signal: currentController.signal,
      })

      if (disposed || id !== requestId || source.value !== current) return

      const list = getValue(res.data as Record<string, unknown>, 'data.list')
      data.value = Array.isArray(list) ? (list as DataSourceItem[]) : []
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

/**
 * 复用同一请求配置的 Promise，避免相同参数重复发起网络请求。
 * 例如：{ "url":"/api/data","method":"get","params":{"date":"2026-01-01"}}: Promise }
 */
const requestMap: Record<string, Promise<unknown>> = {}

type RequestConfig = {
  url: string
  method: 'get' | 'post'
  params?: Record<string, unknown>
  data?: Record<string, unknown>
}

export async function fetchData(source: ApiDataSourceSchema, data?: Record<string, unknown>) {
  if (!source.url) {
    return undefined
  }

  // 从 URL 查询参数中提取默认参数，这些参数的优先级低于数据源配置，但高于手动传入的调用参数。
  const searchParams = new URLSearchParams(location.search)
  const urlParams = Object.fromEntries(searchParams.entries())

  const queryParams = {
    ...(source.params ?? {}),
    ...urlParams,
    ...(data ?? {}),
  }

  const config: RequestConfig = {
    url: source.url,
    method: source.method ?? 'get',
  }

  if (config.method === 'post') {
    config.data = queryParams
  } else {
    config.params = queryParams
  }

  const key = JSON.stringify(config)

  if (requestMap[key]) {
    console.log('缓存了，不发请求')
    return requestMap[key]
  }

  const promise = axios
    .request(config)
    .then((res) => {
      return getValue(res.data as object, source.responsePath ?? 'data.list')
    })
    .finally(() => {
      delete requestMap[key]
    })

  requestMap[key] = promise
  return promise
}
