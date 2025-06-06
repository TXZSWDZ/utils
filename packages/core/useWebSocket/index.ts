import type { AsyncFn, UseIntervalFnReturn } from '@wthe/utils-shared'

import { useIntervalFn, useTimeoutFn } from '@wthe/utils-shared'

type WebSocketStatus = 'OPEN' | 'CONNECTING' | 'CLOSED' | 'ERROR' | 'RECONNECTING'

interface heartbeatOptions {
  interval?: number
  message?: string
}
interface autoReconnectOptions {
  delay?: number
  maxAttempts?: number
}

interface WebSocketOptions {
  immediate?: boolean
  heartbeat?: boolean | heartbeatOptions
  autoReconnect?: boolean | autoReconnectOptions
  messageValidator?: (data: any) => boolean
  messageParser?: (data: string) => any
}
interface WebSocketCallbacks<T = any> {
  onOpen?: AsyncFn<[event: Event], void>
  onClose?: AsyncFn<[event: CloseEvent], void>
  onError?: AsyncFn<[event: Event], void>
  onMessage?: AsyncFn<[data: T], void>
  onReconnect?: AsyncFn<[options: autoReconnectOptions], autoReconnectOptions | void>
}

const DEFAULT_PING_MESSAGE = 'ping'

export class EnhancedWebSocket<T> {
  private ws: WebSocket | null = null
  private status: WebSocketStatus = 'CLOSED'
  private heartbeatTimer: UseIntervalFnReturn | null = null
  private currentReconnectAttempts: number = 0
  constructor(private url: string, private options: WebSocketOptions = {}, private callbacks: WebSocketCallbacks<T> = {}) {
    this.options = {
      immediate: true,
      heartbeat: true,
      autoReconnect: true,
      messageValidator: () => true,
      messageParser: JSON.parse,
      ...options,
    }

    this.connect = this.connect.bind(this)
    this.pauseHeartbeat = this.pauseHeartbeat.bind(this)
    this.resumeHeartbeat = this.resumeHeartbeat.bind(this)
    this.send = this.send.bind(this)
    this.close = this.close.bind(this)

    if (this.options.immediate) {
      this.connect()
    }
  }

  private resolveNestedOptions<T>(options: T | true): T {
    if (options === true)
      return {} as T
    return options
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      this.heartbeatTimer.cancel?.()
      this.heartbeatTimer = null
    }
  }

  public pauseHeartbeat() {
    if (!this.heartbeatTimer) {
      console.warn('No heartbeat timer to pause.')
      return
    }

    this.heartbeatTimer.pause?.()
  }

  public resumeHeartbeat() {
    if (!this.heartbeatTimer) {
      console.warn('No heartbeat timer to resume.')
      return
    }

    this.heartbeatTimer.resume?.()
  }

  private startHeartbeat() {
    if (this.options.heartbeat) {
      const { interval = 10000, message = DEFAULT_PING_MESSAGE } = this.resolveNestedOptions(this.options.heartbeat)
      if (interval <= 0) {
        console.warn('Heartbeat interval must be greater than 0. Disabling heartbeat.')
        return
      }

      this.heartbeatTimer = useIntervalFn(() => {
        if (this.status === 'OPEN' && this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(message)
        }
      }, interval)
    }
  }

  private handleReconnect() {
    if (this.options.autoReconnect) {
      const { delay = 5000, maxAttempts = 5 } = this.resolveNestedOptions(this.options.autoReconnect)

      this.status = 'RECONNECTING'

      this.currentReconnectAttempts++

      if (this.currentReconnectAttempts >= maxAttempts) {
        console.warn(`Max reconnect attempts reached (${maxAttempts}). Giving up.`)
        this.status = 'CLOSED'
      }
      else {
        const attemptReconnect = async () => {
          this.options.autoReconnect = {
            ...this.options.autoReconnect as autoReconnectOptions,
            ...await this.callbacks.onReconnect?.(this.options.autoReconnect as autoReconnectOptions) || {},
          }
          this._init()
        }
        console.warn(`WebSocket connection lost. Attempting to reconnect in ${delay}ms... (Attempt ${this.currentReconnectAttempts}/${maxAttempts})`)

        useTimeoutFn(attemptReconnect, delay)
      }
    }
  }

  private _init() {
    if (this.status === 'CONNECTING' || this.status === 'OPEN') {
      console.warn('WebSocket is already connecting or open. Cannot re-initialize.')
    }
    this.status = 'CONNECTING'
    this.ws = new WebSocket(this.url)
    this.ws.onopen = async (event) => {
      this.status = 'OPEN'
      await this.callbacks.onOpen?.(event)
      this.startHeartbeat()
    }
    this.ws.onmessage = async (event) => {
      try {
        let data: T
        try {
          data = this.options.messageParser ? this.options.messageParser(event.data) : event.data
        }
        catch (e) {
          data = event.data
        }
        if (this.options.messageValidator ? this.options.messageValidator(data) : true) {
          await this.callbacks.onMessage?.(data)
        }
      }
      catch (e) {
        console.error('WebSocket message parse error:', e)
      }
    }
    this.ws.onerror = async (event) => {
      this.status = 'ERROR'
      await this.callbacks.onError?.(event)
      this.handleReconnect()
    }
    this.ws.onclose = async (event) => {
      this.status = 'CLOSED'
      await this.callbacks.onClose?.(event)
      this.stopHeartbeat()
    }
  }

  public connect() {
    this._init()
  }

  public send(message: string) {
    if (this.status === 'OPEN' && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message)
    }
    else {
      console.warn('WebSocket is not open. Cannot send message:', message)
    }
  }

  public close() {
    if (this.status === 'CLOSED') {
      console.warn('WebSocket is already closed. Cannot close again.')
      return
    }
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

export function useWebSocket<T = any>(
  url: string,
  options: WebSocketOptions = {},
  callbacks: WebSocketCallbacks<T> = {},
): EnhancedWebSocket<T> {
  return new EnhancedWebSocket<T>(url, options, callbacks)
}
