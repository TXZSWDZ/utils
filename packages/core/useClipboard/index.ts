type Target = string | HTMLElement

interface Options {
  beforeCopy?: (text: string) => string | Promise<string>
  onSuccess?: (text: string) => void
  onError?: (error: Error) => void

}
interface UseClipboardReturn {
  isSupported: boolean
  copy: (value?: string) => void
}
export function useClipboard(target: Target, options: Options = {}): UseClipboardReturn {
  function isSupported() {
    return !!navigator.clipboard || !!document.execCommand
  }

  const { beforeCopy, onSuccess, onError } = options

  function legacyCopy(text: string) {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    const success = document.execCommand('copy')
    document.body.removeChild(textArea)
    return success
  }

  function getTextToCopy(value?: Target): string {
    const getElementText = (element: HTMLElement | null): string => {
      if (!element)
        return ''
      return element.textContent?.trim()
        || (element as HTMLInputElement).value?.trim()
        || element.getAttribute('data-clipboard-text')
        || ''
    }

    const resolveSelector = (selector: string): string => {
      if (/^[.#][a-zA-Z0-9-_]+$/.test(selector)) {
        const element = document.querySelector(selector)
        return getElementText(element as HTMLElement)
      }
      return selector
    }

    if (value !== undefined && value !== null) {
      if (typeof value === 'string') {
        return resolveSelector(value)
      }
      return getElementText(value)
    }

    if (target) {
      if (typeof target === 'string') {
        return resolveSelector(target)
      }
      return getElementText(target)
    }

    throw new Error('No text to copy: neither value nor target specified')
  }

  async function copy(value?: Target) {
    if (!isSupported())
      throw new Error('Clipboard API not supported')

    try {
      const originalText = getTextToCopy(value)

      let textToCopy = originalText

      if (beforeCopy) {
        const processedText = await beforeCopy(originalText)

        if (typeof processedText !== 'string') {
          throw new Error('beforeCopy must return a string')
        }

        textToCopy = processedText
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(textToCopy)
      }
      else {
        const success = legacyCopy(textToCopy)

        if (!success) {
          throw new Error('Failed to copy text using execCommand')
        }
      }

      onSuccess?.(textToCopy)
    }
    catch (error) {
      const err = error instanceof Error ? error : new Error('Copy failed')

      onError?.(err)

      throw err
    }
  }

  return { copy, isSupported: isSupported() }
}
