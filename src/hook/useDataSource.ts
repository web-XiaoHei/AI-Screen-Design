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
  const loading = ref(false)
  const error = ref()

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

  async function loadData(): Promise<void> {
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
      // 请求之前，设置 loading
      loading.value = true
      // 仅对 API 数据源执行轮询请求，并在请求中止时忽略结果。
      const res = await axios.get(url, {
        params,
        signal: currentController.signal,
      })

      if (disposed || id !== requestId || source.value !== current) return

      const list = getValue(res.data as Record<string, unknown>, 'data.list')
      data.value = Array.isArray(list) ? (list as DataSourceItem[]) : []
    } catch (err: unknown) {
      error.value = err
      if (!axios.isCancel(err) && !disposed && id === requestId) {
        console.error('Load data failed:', err)
      }
    } finally {
      // 请求回来了，取消 loading
      loading.value = false
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

  return { data, loading, error, refresh: loadData }
}

/**
 * 统一封装 API 数据源请求，负责合并默认参数、缓存同配置请求并提取返回结果。
 *
 * - 读取 URL 中的查询参数作为默认参数
 * - 让数据源配置参数优先级低于 URL 参数，但高于手动传参
 * - 对同一 url + method + params 配置复用 Promise，避免重复请求
 * - 通过 responsePath 读取被嵌套在返回体中的列表数据
 */
const requestMap: Record<string, Promise<unknown>> = {}

type RequestConfig = {
  url: string
  method: 'get' | 'post'
  params?: Record<string, unknown>
  data?: Record<string, unknown>
}

/**
 * 将数据源参数、URL 参数和手动传参按优先级合并为最终请求参数。
 *
 * 优先级：source.params < URL 查询参数 < data
 */
function buildRequestParams(source: ApiDataSourceSchema, data?: Record<string, unknown>) {
  const searchParams = new URLSearchParams(location.search)
  const urlParams = Object.fromEntries(searchParams.entries())

  return {
    ...(source.params ?? {}),
    ...urlParams,
    ...(data ?? {}),
  }
}

/**
 * 生成 Axios 请求配置，并根据 HTTP 方法将参数放到 params 或 data 字段。
 */
function buildRequestConfig(source: ApiDataSourceSchema, data?: Record<string, unknown>): RequestConfig {
  const queryParams = buildRequestParams(source, data)

  const config: RequestConfig = {
    url: source.url,
    method: source.method ?? 'get',
  }

  if (config.method === 'post') {
    config.data = queryParams
  } else {
    config.params = queryParams
  }

  return config
}

/**
 * 从接口响应中取出目标列表数据。
 * 默认提取 `data.list`，也支持通过 responsePath 自定义路径。
 */
function resolveResponseData(source: ApiDataSourceSchema, res: unknown) {
  return getValue(res as object, source.responsePath ?? 'data.list')
}

/**
 * 发送 API 数据源请求，并根据配置返回列表数据。
 *
 * 作用：
 * 1. 合并默认参数：dataSource.params + URL 查询参数 + 调用时传参
 * 2. 根据请求方式决定字段：GET -> params，POST -> data
 * 3. 缓存相同请求配置，避免重复网络请求
 * 4. 使用 responsePath 解析接口返回中的数据列表
 *
 * @param source API 数据源配置
 * @param data 额外传入的参数，优先级最高
 * @returns 解析后的数据列表或 undefined
 */
export async function fetchData(source: ApiDataSourceSchema, data?: Record<string, unknown>) {
  if (!source.url) {
    return undefined
  }

  const config = buildRequestConfig(source, data)
  const key = JSON.stringify(config)

  if (requestMap[key]) {
    console.log('缓存了，不发请求')
    return requestMap[key]
  }

  const promise = axios
    .request(config)
    .then((res) => resolveResponseData(source, res.data))
    .finally(() => {
      delete requestMap[key]
    })

  requestMap[key] = promise
  return promise
}
