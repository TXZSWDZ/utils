import { parse, serialize } from 'cookie'

interface CookieGetOptions {
  doNotParse?: boolean
  doNotUpdate?: boolean
}

interface CookieSetOptions {
  path?: string
  expires?: Date
  maxAge?: number
  domain?: string
  secure?: boolean
  httpOnly?: boolean
  sameSite?: boolean | 'none' | 'lax' | 'strict'
  partitioned?: boolean
}
interface CookieChangeOptions {
  name: string
  value?: any
  options?: CookieSetOptions
}

 type CookieChangeListener = (options: CookieChangeOptions) => void

function hasDocumentCookie(): boolean {
  return typeof document !== 'undefined' && typeof document.cookie === 'string'
}

function parseCookies(cookies?: string | object | null) {
  if (typeof cookies === 'string') {
    return parse(cookies)
  }
  else if (typeof cookies === 'object' && cookies !== null) {
    return cookies
  }
  else {
    return {}
  }
}

function readCookie(value: any, options: CookieGetOptions = {}) {
  if (!options.doNotParse) {
    try {
      return JSON.parse(value)
    }
    catch (e) {
      throw new Error(`Cookie value is not valid JSON: ${value}`)
    }
  }
  return value
}

class EnhancedCookie {
  private cookies: Record<string, any> = {}

  private defaultSetOptions: CookieSetOptions = {}

  private listeners: CookieChangeListener[] = []

  private HAS_DOCUMENT_COOKIE: boolean = false
  constructor(
    cookies?: string | object | null,
    options: CookieSetOptions = {},
  ) {
    const mainCookies = document?.cookie || ''
    this.cookies = parseCookies(cookies || mainCookies)
    this.defaultSetOptions = options
    this.HAS_DOCUMENT_COOKIE = hasDocumentCookie()
  }

  public get(name: string, options?: CookieGetOptions): any
  public get<T>(name: string, options?: CookieGetOptions): T
  public get(name: string, options: CookieGetOptions = {}) {
    return readCookie(this.cookies[name], options)
  }

  public getAll(options?: CookieGetOptions): any
  public getAll<T>(options?: CookieGetOptions): T
  public getAll(options: CookieGetOptions = {}) {
    const result: { [name: string]: any } = {}

    for (const name in this.cookies) {
      result[name] = readCookie(this.cookies[name], options)
    }

    return result
  }

  public set(name: string, value: any, options?: CookieSetOptions) {
    const finalOptions = {
      ...this.defaultSetOptions,
      ...options,
    }

    const stringValue = typeof value === 'string' ? value : JSON.stringify(value)

    this.cookies = { ...this.cookies, [name]: stringValue }

    if (this.HAS_DOCUMENT_COOKIE) {
      document.cookie = serialize(name, stringValue, finalOptions)
    }
  }

  public remove(name: string, options?: CookieSetOptions) {
    const finalOptions = (options = {
      ...this.defaultSetOptions,
      ...options,
      expires: new Date(1970, 1, 1, 0, 0, 1),
      maxAge: 0,
    })

    this.cookies = { ...this.cookies }
    delete this.cookies[name]

    if (this.HAS_DOCUMENT_COOKIE) {
      document.cookie = serialize(name, '', finalOptions)
    }
  }
  // TODO cookie添加监听回调功能
}

interface Options {
  cookies?: string | object | null
  options?: CookieSetOptions
}
export function useCookies(options?: Options): EnhancedCookie {
  const { cookies, options: defaultSetOptions } = options || {}

  return new EnhancedCookie(cookies, defaultSetOptions)
}
