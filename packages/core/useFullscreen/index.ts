import type { AsyncFn } from '@wthe/utils-shared'

interface FullScreenElement extends HTMLElement {
  requestFullscreen: () => Promise<void>
  webkitRequestFullscreen?: () => Promise<void>
  mozRequestFullScreen?: () => Promise<void>
  msRequestFullscreen?: () => Promise<void>
}
interface FullScreenDocument extends Document {
  fullscreenElement: Element | null
  webkitFullscreenElement?: Element | null
  mozFullScreenElement?: Element | null
  msFullscreenElement?: Element | null
  exitFullscreen: () => Promise<void>
  webkitExitFullscreen?: () => Promise<void>
  mozCancelFullScreen?: () => Promise<void>
  msExitFullscreen?: () => Promise<void>
}

type MyRequest = keyof FullScreenElement | null
type MyExit = keyof FullScreenDocument | null
type MyElement = keyof FullScreenDocument | null

interface FullScreenAPI {
  request: MyRequest
  exit: MyExit
  element: MyElement
}
export function useFullScreen(target: Element) {
  const doc = document as FullScreenDocument
  const el = target as FullScreenElement
  const detectSupportedAPI = (): FullScreenAPI => {
    const apiVariants = [
      // 标准API
      {
        request: 'requestFullscreen',
        exit: 'exitFullscreen',
        element: 'fullscreenElement',
        test: () => 'requestFullscreen' in el && 'exitFullscreen' in doc,
      },
      // WebKit (Safari/Chrome)
      {
        request: 'webkitRequestFullscreen',
        exit: 'webkitExitFullscreen',
        element: 'webkitFullscreenElement',
        test: () => 'webkitRequestFullscreen' in el && 'webkitExitFullscreen' in doc,
      },
      // Firefox
      {
        request: 'mozRequestFullScreen',
        exit: 'mozCancelFullScreen',
        element: 'mozFullScreenElement',
        test: () => 'mozRequestFullScreen' in el && 'mozCancelFullScreen' in doc,
      },
      // IE/Edge Legacy
      {
        request: 'msRequestFullscreen',
        exit: 'msExitFullscreen',
        element: 'msFullscreenElement',
        test: () => 'msRequestFullscreen' in el && 'msExitFullscreen' in doc,
      },
    ]

    const matched = apiVariants.find(variant => variant.test())
    return matched
      ? {
          request: matched.request as MyRequest,
          exit: matched.exit as MyExit,
          element: matched.element as MyElement,
        }
      : { request: null, exit: null, element: null }
  }

  const supportedAPI = detectSupportedAPI()

  const getFullScreenElement = (): Element | null => {
    if (!supportedAPI.element)
      return null
    return doc[supportedAPI.element] as Element
  }

  function isSupported() {
    return !!doc.fullscreenEnabled
  }

  let isFullScreen: boolean = !!getFullScreenElement()

  const updateFullScreenStatus = (): void => {
    isFullScreen = !!getFullScreenElement()
  }

  async function enter() {
    if (isFullScreen || !isSupported())
      return

    try {
      if (supportedAPI.request) {
        await (el[supportedAPI.request] as AsyncFn)()
        return true
      }
    }
    catch (error) {
      console.error('Error attempting to enable fullscreen:', error)
    }
  }

  async function exit() {
    if (!isFullScreen || !isSupported())
      return

    try {
      if (supportedAPI.exit) {
        await (doc[supportedAPI.exit] as AsyncFn)()
        return true
      }
    }
    catch (error) {
      console.error('Error attempting to exit fullscreen:', error)
    }
  }

  const addEventListeners = () => {
    const events = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange',
    ]
    events.forEach((event) => {
      el.addEventListener(event, updateFullScreenStatus, { passive: true })
    })
  }

  const removeEventListeners = () => {
    const events = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange',
    ]
    events.forEach((event) => {
      el.removeEventListener(event, updateFullScreenStatus)
    })
  }

  addEventListeners()

  async function toggle() {
    if (isFullScreen && isSupported()) {
      await exit()
    }
    else {
      await enter()
    }
  }

  return {
    enter,
    exit,
    toggle,
    cleanup: () => {
      removeEventListeners()
    },
  }
}
