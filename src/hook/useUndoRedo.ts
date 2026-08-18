import { computed, shallowReactive, shallowRef } from 'vue'
import { getValue, setValue } from '@/utils'

// 单次属性修改记录，保存“修改前”和“修改后”的值。
// 这样既可以恢复旧值，也可以重做新值。
interface UndoRedoRecord<TTarget extends object = object> {
  target: TTarget
  key: string
  oldValue: unknown
  newValue: unknown
}

// 一次操作中的多条修改记录，形成一个批次。
// 例如：用户在一个输入框中连续改多个属性时，可以把它们合并成一个撤销单元。
type UndoRedoBatch<TTarget extends object = object> = UndoRedoRecord<TTarget>[]

// 历史栈：
// - undoStack：已执行但未撤销的操作，越晚执行的在栈顶。
// - redoStack：已撤销的操作，等待重做。
// - activeBatch：当前正在累积的批量修改，commitBatch 时会一次性压入 undoStack。
const history = {
  undoStack: shallowReactive<UndoRedoBatch[]>([]),
  redoStack: shallowReactive<UndoRedoBatch[]>([]),
  activeBatch: shallowRef<UndoRedoBatch | null>(null),
}

// 开始收集一批修改，直到 commitBatch 被调用。
// 这样多个属性的更新可以视为一次操作，而不是多个独立撤销节点。
function startBatch() {
  history.activeBatch.value = []
}

// 提交当前批次到撤销栈。
// 若当前批次为空则直接丢弃；若存在记录，则作为一个整体压栈。
function commitBatch() {
  const batch = history.activeBatch.value

  if (batch && batch.length > 0) {
    history.undoStack.push(batch)
  }

  history.activeBatch.value = null
}

// 每次执行新修改后，重做栈应被清空。
// 因为重做历史只保留“当前状态之后被撤销的操作”，一旦重新做了新修改，旧重做链就失效。
function clearRedoStack() {
  history.redoStack.length = 0
}

export function useUndoRedo<TTarget extends object = Record<string, unknown>>() {
  // 是否还有可撤销的操作。
  const canUndo = computed(() => history.undoStack.length > 0)
  // 是否还有可重做的操作。
  const canRedo = computed(() => history.redoStack.length > 0)

  /**
   * 记录一次属性变更，并立即应用新值。
   *
   * @param target 目标对象
   * @param key 属性路径，例如 "foo.bar" 或 "style.width"
   * @param newValue 新值
   */
  function applyChange(target: TTarget, key: string, newValue: unknown): void {
    // 获取当前字段旧值；如果值没变则无需记录和提交。
    const oldValue = getValue(target, key)
    if (Object.is(oldValue, newValue)) return

    const record: UndoRedoRecord<TTarget> = {
      target,
      key,
      oldValue,
      newValue,
    }

    const batch = history.activeBatch.value
    if (batch) {
      // 在批量编辑中，若同一对象 + 同一属性已存在记录，则更新它的 newValue。
      // 这样连续输入时，最终只保留这次最终状态，而不是保存多个中间状态。
      const existingRecord = batch.find((item) => item.target === target && item.key === key)

      if (existingRecord) {
        existingRecord.newValue = newValue
        setValue(target, key, newValue)
        clearRedoStack()
        return
      }

      // 批量中第一次记录该字段，加入当前批次。
      batch.push(record)
    } else {
      // 非批量模式下，单次修改作为一个独立撤销单元压入 undoStack。
      history.undoStack.push([record])
    }

    // 真正写入新值到目标对象。
    setValue(target, key, newValue)
    // 任何新改动都会使以前的重做历史失效。 
    clearRedoStack()
  }

  /**
   * 撤销最近一次操作。
   *
   * 逻辑：
   * 1. 从 undoStack 取出最后一个批次。
   * 2. 按逆序恢复每条记录的 oldValue。
   * 3. 将该批次压回 redoStack，供后续重做。
   */
  function undo(): void {
    const records = history.undoStack.pop()
    if (!records || records.length === 0) return

    // 需要逆序回滚，否则后面的属性可能覆盖前面的恢复结果。
    for (let index = records.length - 1; index >= 0; index--) {
      const record = records[index]
      if (!record) continue

      const { target, key, oldValue } = record
      setValue(target, key, oldValue)
    }

    history.redoStack.push(records)
  }

  /**
   * 重做最近一次被撤销的操作。
   *
   * 逻辑：
   * 1. 从 redoStack 弹出最后一个批次。
   * 2. 按原顺序重新应用每条记录的 newValue。
   * 3. 再将该批次压回 undoStack。
   */
  function redo(): void {
    const records = history.redoStack.pop()
    if (!records || records.length === 0) return

    // 重做时遵循原始记录顺序，保证字段的最终状态与原来一致。
    for (const record of records) {
      const { target, key, newValue } = record
      setValue(target, key, newValue)
    }

    history.undoStack.push(records)
  }

  return {
    canRedo,
    canUndo,
    undo,
    redo,
    applyChange,
    startBatch,
    commitBatch,
  }
}
