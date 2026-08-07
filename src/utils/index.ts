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
