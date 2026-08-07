import { getValue, setValue } from '@/utils'

interface UndoRedoRecord<TTarget extends object = object> {
  target: TTarget
  key: string
  oldValue: unknown
  newValue: unknown
}

const undoStack = shallowReactive<UndoRedoRecord[]>([])
const redoStack = shallowReactive<UndoRedoRecord[]>([])

export function useUndoRedo<TTarget extends object = Record<string, unknown>>() {
  const canUndo = computed(() => undoStack.length > 0)
  const canRedo = computed(() => undoStack.length > 0)
  /**
   * 记录一次对象属性变更，并立即应用新值
   * @param target 目标对象
   * @param key 属性路径，例如 "foo.bar"
   * @param newValue 新值
   */
  function applyChange(target: TTarget, key: string, newValue: unknown): void {
    const oldValue = getValue(target, key)
    if (Object.is(oldValue, newValue)) return

    const record: UndoRedoRecord<TTarget> = {
      target,
      key,
      newValue,
      oldValue,
    }

    undoStack.push(record)
    setValue(target, key, newValue)
    redoStack.length = 0
  }

  /**
   * 撤销最近一次变更
   */
  function undo(): void {
    const record = undoStack.pop()
    if (!record) return

    const { target, key, oldValue } = record
    setValue(target, key, oldValue)

    redoStack.push(record)
  }

  /**
   * 重做最近一次被撤销的变更
   */
  function redo(): void {
    const record = redoStack.pop()
    if (!record) return

    const { target, key, newValue } = record
    setValue(target, key, newValue)

    undoStack.push(record)
  }

  return { canRedo, canUndo, undo, redo, applyChange }
}
