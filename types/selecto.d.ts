declare module 'selecto' {
  export default class Selecto {}

  export interface Rect {
    top: number
    left: number
    bottom: number
    right: number
    width: number
    height: number
  }

  export interface OnSelectEvent<T = Selecto> {
    currentTarget: T
    beforeSelected: Array<HTMLElement | SVGElement>
    selected: Array<HTMLElement | SVGElement>
    added: Array<HTMLElement | SVGElement>
    removed: Array<HTMLElement | SVGElement>
    rect: Rect
    inputEvent: Event | PointerEvent | MouseEvent | TouchEvent | KeyboardEvent
    data: Record<string, unknown>
    isDragStartEnd: boolean
    isTrusted: boolean
  }

  export interface OnSelectEnd<T = Selecto> extends OnSelectEvent<T> {
    startSelected: Array<HTMLElement | SVGElement>
    afterAdded: Array<HTMLElement | SVGElement>
    afterRemoved: Array<HTMLElement | SVGElement>
    isDragStart: boolean
    isClick: boolean
    isDouble: boolean
  }

  export interface OnDragEvent {
    datas: Record<string, unknown>
    data: Record<string, unknown>
    clientX: number
    clientY: number
    deltaX: number
    deltaY: number
    distX: number
    distY: number
    isMouseEvent: boolean
    isSecondaryButton: boolean
    isClick?: boolean
    isDouble?: boolean
    inputEvent: Event | PointerEvent | MouseEvent | TouchEvent | KeyboardEvent
    isTrusted: boolean
  }

  export type OnDrag = OnDragEvent
  export type OnResize = OnDragEvent
}

declare module 'vue3-selecto' {
  import Selecto from 'selecto'
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<
    Record<string, unknown>,
    Record<string, unknown>,
    Record<string, unknown>
  >
  export default component
}
