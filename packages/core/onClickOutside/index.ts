import type { Fn } from '@wthe/utils-shared'

type Target = Element | string

interface Options {
  events?: Array<'mousedown' | 'touchstart' | 'click'>
  ignore?: Array<Element | string>
  capture?: boolean
}

export function onClickOutside(target: Target, handler: Fn, options: Options = {}): Fn {
  const {
    events = ['mousedown', 'touchstart'],
    ignore = [],
    capture = true,
  } = options

  const isTarget = (element: Element, event: Event): boolean => {
    if (typeof target === 'string') {
      return Array.from(document.querySelectorAll(target)).some(
        el => el === element || event.composedPath().includes(el),
      )
    }
    return element === target || event.composedPath().includes(target)
  }

  const shouldIgnore = (event: Event): boolean => {
    return ignore.some((item) => {
      if (typeof item === 'string') {
        return Array.from(document.querySelectorAll(item)).some(
          el => el === event.target || event.composedPath().includes(el),
        )
      }
      return item === event.target || event.composedPath().includes(item)
    })
  }

  function listener(event: Event) {
    if (event.target == null)
      return

    if (shouldIgnore(event))
      return

    if (isTarget(event.target as Element, event))
      return

    handler()
  }

  events.forEach(event =>
    document.addEventListener(event, listener, { passive: true, capture }),
  )

  return () => {
    events.forEach((event) => {
      document.removeEventListener(event, listener, { capture })
    })
  }
}
