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
      return value
    }
  }
  return value
}

class EnhancedCookie {
  private cookies: Record<string, any> = {}

  private defaultSetOptions: CookieSetOptions = {}

  private changeListeners: CookieChangeListener[] = []

  private HAS_DOCUMENT_COOKIE: boolean = false

  private pollingInterval: NodeJS.Timeout | null = null
  constructor(
    cookies?: string | object | null,
    options: CookieSetOptions = {},
  ) {
    const mainCookies = document?.cookie || ''
    this.cookies = parseCookies(cookies || mainCookies)
    this.defaultSetOptions = options

    this.HAS_DOCUMENT_COOKIE = hasDocumentCookie()
  }

  private _emitChange(params: CookieChangeOptions) {
    this.changeListeners.forEach((callback) => {
      callback(params)
    })
  }

  private _checkChanges(previousCookies: Record<string, any>) {
    const names = new Set(
      Object.keys(previousCookies).concat(Object.keys(this.cookies)),
    )

    names.forEach((name) => {
      if (previousCookies[name] !== this.cookies[name]) {
        this._emitChange({ name, value: readCookie(this.cookies[name]) })
      }
    })
  }

  public update = () => {
    if (!this.HAS_DOCUMENT_COOKIE) {
      return
    }

    const previousCookies = this.cookies
    this.cookies = parse(document.cookie)
    this._checkChanges(previousCookies)
  }

  private _startPolling() {
    this.pollingInterval = setInterval(this.update, 300)
  }

  private _stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
    }
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
    this._emitChange({ name, value, options: finalOptions })
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
    this._emitChange({ name, value: undefined, options: finalOptions })
  }

  public addChangeListener(callback: CookieChangeListener) {
    this.changeListeners.push(callback)

    if (this.HAS_DOCUMENT_COOKIE && this.changeListeners.length === 1) {
      if (typeof window === 'object' && 'cookieStore' in window) {
        (window.cookieStore as any).addEventListener('change', this.update)
      }
      else {
        this._startPolling()
      }
    }
  }

  public removeChangeListener(callback: CookieChangeListener) {
    const index = this.changeListeners.indexOf(callback)

    if (index >= 0) {
      this.changeListeners.splice(index, 1)
    }

    if (this.HAS_DOCUMENT_COOKIE && this.changeListeners.length === 0) {
      if (typeof window === 'object' && 'cookieStore' in window) {
        (window.cookieStore as any).removeEventListener('change', this.update)
      }
      else {
        this._stopPolling()
      }
    }
  }

  public removeAllChangeListeners() {
    while (this.changeListeners.length > 0) {
      this.removeChangeListener(this.changeListeners[0])
    }
  }
}

interface Options {
  cookies?: string | object | null
  options?: CookieSetOptions
}
export function useCookies(options?: Options): EnhancedCookie {
  const { cookies, options: defaultSetOptions } = options || {}

  return new EnhancedCookie(cookies, defaultSetOptions)
}
