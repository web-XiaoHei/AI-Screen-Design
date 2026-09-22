export type DebouncedFunction<Args extends readonly unknown[]> = {
  (...args: Args): void
  cancel: () => void
  flush: () => void
}

export function debounce<Args extends readonly unknown[]>(
  fn: (...args: Args) => unknown,
  delay: number,
): DebouncedFunction<Args> {
  let timer: ReturnType<typeof setTimeout> | null = null
  let lastArgs: Args | null = null

  const cancel = () => {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
    lastArgs = null
  }

  const flush = () => {
    if (timer !== null && lastArgs !== null) {
      clearTimeout(timer)
      timer = null
      fn(...lastArgs)
      lastArgs = null
    }
  }

  const debounced = function (...args: Args) {
    lastArgs = args

    if (timer !== null) {
      clearTimeout(timer)
    }

    timer = setTimeout(() => {
      timer = null
      if (lastArgs !== null) {
        fn(...lastArgs)
        lastArgs = null
      }
    }, delay)
  } as DebouncedFunction<Args>

  debounced.cancel = cancel
  debounced.flush = flush

  return debounced
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object'
}

export function getValue(target: object, key: string): unknown {
  if (!key || !isObject(target)) return target

  return key.split('.').reduce<unknown>((current, segment) => {
    if (!isObject(current)) return undefined
    return (current as Record<string, unknown>)[segment]
  }, target)
}

export function setValue(target: object, key: string, value: unknown): void {
  if (!key || !isObject(target)) return

  const keys = key.split('.')
  const lastKey = keys.pop()
  if (!lastKey) return

  let current: Record<string, unknown> = target as Record<string, unknown>
  for (const segment of keys) {
    const next = current[segment]
    if (!isObject(next)) {
      current[segment] = {}
    }
    current = current[segment] as Record<string, unknown>
  }

  current[lastKey] = value
}


export function deepClone<T>(value: T): T {
  const seen = new WeakMap<object, unknown>()

  const clone = <U>(current: U): U => {
    if (current === null || typeof current !== 'object') {
      return current
    }

    const target = current as object
    const cached = seen.get(target)
    if (cached !== undefined) {
      return cached as U
    }

    if (current instanceof Date) {
      const result = new Date(current.getTime())
      seen.set(target, result)
      return result as U
    }

    if (current instanceof RegExp) {
      const result = new RegExp(current.source, current.flags)
      seen.set(target, result)
      return result as U
    }

    if (current instanceof Map) {
      const result = new Map()
      seen.set(target, result)

      current.forEach((mapValue, mapKey) => {
        result.set(clone(mapKey), clone(mapValue))
      })

      return result as U
    }

    if (current instanceof Set) {
      const result = new Set()
      seen.set(target, result)

      current.forEach((setValue) => {
        result.add(clone(setValue))
      })

      return result as U
    }

    if (Array.isArray(current)) {
      const result: unknown[] = []
      seen.set(target, result)

      current.forEach((item, index) => {
        result[index] = clone(item)
      })

      return result as U
    }

    const proto = Object.getPrototypeOf(target)
    const result = Object.create(proto)
    seen.set(target, result)

    for (const key of Reflect.ownKeys(target)) {
      const descriptor = Object.getOwnPropertyDescriptor(target, key)
      if (!descriptor) continue

      const value = (target as Record<PropertyKey, unknown>)[key]
      Object.defineProperty(result, key, {
        ...descriptor,
        value: clone(value),
      })
    }

    return result as U
  }

  return clone(value)
}