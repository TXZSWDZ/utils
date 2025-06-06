type DataType = 'text' | 'json' | 'blob' | 'arrayBuffer' | 'formData'
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

interface BeforeFetchContext {
  url: string
  options: RequestInit
  cancel: () => void
}

interface UseFetchOptions {
  fetch?: typeof window.fetch
  /**
   * 是否立即执行请求
   * @default true
   */
  immediate?: boolean

  /**
   * 初始数据
   * @default null
   */
  initialData?: any

  /**
   * 超时时间，单位为毫秒
   * @default 0
   */
  timeout?: number

  /**
   * 请求开始前的函数
   */
  beforeFetch?: (ctx: BeforeFetchContext) => Promise<Partial<BeforeFetchContext> | void> | Partial<BeforeFetchContext> | void

  /**
   * 请求成功后执行的函数
   */
  afterFetch?: (ctx: any) => any

  /**
   * 请求失败后的函数
   */
  onFetchError?: (ctx: any) => any

}

interface Options extends Omit<RequestInit, 'body'> {
  body?: BodyInit | Record<string, any>
}

interface InternalConfig {
  method: HttpMethod
  type: DataType
  payload: Options['body'] | null
  payloadType: 'text' | 'json' | 'formData'
}

interface UseFetchReturn<T> {
  abort?: () => any
  execute?: () => Promise<T>
}

const payloadMapping: Record<string, string> = {
  json: 'application/json',
  text: 'text/plain',
  formData: 'multipart/form-data',
}

function isFetchOptions(obj: object): obj is UseFetchOptions {
  return obj && ['fetch', 'immediate', 'initialData', 'timeout', 'beforeFetch', 'afterFetch', 'onFetchError'].some(k => k in obj)
}

function buildQueryParams(url: string, params: Record<string, any>): string {
  const query = new URLSearchParams()
  for (const key in params) {
    if (params[key]) {
      query.append(key, params[key])
    }
  }
  return url + (url.includes('?') ? '&' : '?') + query.toString()
}

// TODO: 后续继续集成get, post, put, delete等方法
export function useFetch<T>(url: string): Promise<T>
export function useFetch<T>(url: string, useFetchOptions: UseFetchOptions & { immediate: true }): Promise<T>
export function useFetch<T>(url: string, useFetchOptions: UseFetchOptions & { immediate: false }): UseFetchReturn<T>
export function useFetch<T>(url: string, options: Options, useFetchOptions?: UseFetchOptions & { immediate: true }): Promise<T>
export function useFetch<T>(url: string, options: Options, useFetchOptions?: UseFetchOptions & { immediate: false }): UseFetchReturn<T>
export function useFetch<T>(url: string, ...args: any[]): UseFetchReturn<T> | Promise<T> {
  const supportsAbort = typeof AbortController === 'function'

  let useFetchOptions: UseFetchOptions = {
    immediate: true,
    timeout: 0,
  }

  const config: InternalConfig = {
    method: 'GET',
    type: 'json' as DataType,
    payload: null,
    payloadType: 'json',
  }

  const defaultOptions: RequestInit = {
    method: config.method,
    headers: {},
  }
  let options: RequestInit = {}

  if (args.length > 0) {
    if (isFetchOptions(args[0]))
      useFetchOptions = { ...useFetchOptions, ...args[0] }
    else
      options = args[0]
  }

  if (args.length > 1) {
    if (isFetchOptions(args[1]))
      useFetchOptions = { ...useFetchOptions, ...args[1] }
  }

  let controller: AbortController | undefined
  let timer: ReturnType<typeof setTimeout> | undefined

  const abort = () => {
    if (supportsAbort) {
      controller?.abort()
      controller = new AbortController()
      options = {
        ...options,
        signal: controller.signal,
      }
    }
  }

  const execute = async () => {
    abort()

    let isCanceled = false

    if (options.body && typeof options.body === 'object') {
      if (!options.method || options.method.toLocaleUpperCase() === 'GET' || defaultOptions.method!.toLocaleUpperCase() === 'GET') {
        url = buildQueryParams(url, options.body)
        options.body = undefined
      }
      else {
        options.body = JSON.stringify(options.body)
        options.headers = {
          'Content-Type': payloadMapping[config.payloadType],
          ...options.headers,
        }
      }
    }

    const context = {
      url,
      options: {
        ...defaultOptions,
        ...options,
      },
      cancel: () => { isCanceled = true },
    }

    if (useFetchOptions.beforeFetch)
      Object.assign(context, await useFetchOptions.beforeFetch(context))

    if (isCanceled || !fetch)
      return Promise.resolve(null)

    if (useFetchOptions.timeout) {
      timer = setTimeout(() => {
        abort()
      }, useFetchOptions.timeout)
    }

    return fetch(url, { ...options })
      .then(async (fetchResponse) => {
        if (!fetchResponse.ok) {
          throw new Error(fetchResponse.statusText || 'Fetch Error')
        }
        let responseData = await fetchResponse.clone()[config.type]()
        if (useFetchOptions.afterFetch) {
          responseData = await useFetchOptions.afterFetch({
            data: responseData,
            response: fetchResponse,
            context,
          })
        }
        return responseData
      })
      .catch(async (fetchError) => {
        if (useFetchOptions.onFetchError) {
          await useFetchOptions.onFetchError({
            error: fetchError,
            response: null,
            context,
          })
        }
      })
      .finally(() => {
        clearTimeout(timer)
        timer = undefined
      })
  }

  if (useFetchOptions.immediate) {
    return execute()
  }

  return { execute, abort }
}
